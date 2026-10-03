/* 이야기 기반: 장(章) 진행 · 목표 · 지도마다 사람 배치 · 동료(따라다니는 이) · 빛 씨앗 · 건물 + 실내 짓기 도우미
   각 장 파일(20_green … )이 이 도구로 마을과 사람과 사건을 짓는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent;
  const T = TL.T, TS = TL.TS;
  const ST = G.story;
  const S = () => G.state;
  const W = () => G.world;
  const flag = (k) => !!S().flags[k];

  /* ───────── 장 · 목표 ───────── */
  ST.CH = [];          // [{ no, id, title, sub, goal(s) → {text, map, x, y} }]
  ST.chapter = function (id) { return ST.CH.find((c) => c.id === id); };
  /** 지금 할 일: 장의 goal 함수가 상황을 보고 알려 준다 */
  ST.goal = function () {
    const s = S(); const ch = ST.chapter(s.ch || 'c1');
    if (!ch || !ch.goal) return null;
    const g = ch.goal(s);
    return g || null;
  };
  ST.goalText = function () { const g = ST.goal(); return g ? g.text : ''; };
  /** 다른 지도로 들어가는 길이 문이 아닌 곳(무한호처럼): ST.entries[지도] = () => ({ map, x, y }) 또는 { via: 거쳐 가는 지도 } */
  ST.entries = {};
  /** 목표를 지금 지도 위의 자리로 옮겨 본다: 목표가 다른 지도에 있으면 그리로 가는 문(대륙이면 그 집 문 · 무한호, 실내 · 던전이면 출구) */
  ST.goalOn = function (mapId) {
    const g = ST.goal(); if (!g || !g.map || g.map === mapId) return g;
    let m; try { m = G.build.get(mapId); } catch (e) { return null; }
    if (!m) return null;
    const ok = (w) => { try { return !w.cond || w.cond(); } catch (e) { return false; } };
    const at = (x, y) => Object.assign({}, g, { map: mapId, x, y, via: true });
    const door = (mm, to) => (mm.warps || []).find((w) => w.to === to && ok(w));
    // 목표 지도로 들어가는 자리(대륙 쪽): 문, 따로 적어 둔 길, 거쳐 가는 지도의 문 — 두 단계까지
    const entry = (to, depth) => {
      const e = ST.entries[to];
      if (e && typeof e === 'function') { const r = e(); if (r && r.map === mapId) return [r.x, r.y]; }
      const w = door(m, to); if (w) return [w.x, w.y + (w.exit || w.dir === 'down' ? -1 : 1)];
      if (e && e.via && depth < 3) return entry(e.via, depth + 1);
      return null;
    };
    const r = entry(g.map, 0); if (r) return at(r[0], r[1]);
    if (!m.overworld) { const w = (m.warps || []).find((w2) => (w2.exit || w2.to === 'world') && ok(w2)); if (w) return at(w.x, w.y - 1); }
    return null;
  };
  ST.routeNote = function () {
    const r = S().route; const tot = r.dawn + r.order + r.night;
    if (!tot) return '아직 어느 쪽에도 기울지 않았다.';
    const top = Object.entries(r).sort((a, b) => b[1] - a[1])[0][0];
    return { dawn: '부서진 것은 다시 세우면 된다고 믿는 쪽으로 기울고 있다. 새벽단의 사람들이 너를 눈여겨본다.', order: '고칠 수 있는 것은 고쳐 쓰자는 쪽으로 기울고 있다. 기사단 안에도 너를 믿는 사람이 생겼다.', night: '말하지 않는 편이 사람을 지킨다고 믿는 쪽으로 기울고 있다. 밤의 사람들이 네 이름을 속삭인다.' }[top];
  };
  /** 가장 기운 세력 (고정되었으면 그것) */
  ST.route = function () { const s = S(); if (s.flags.route_lock) return s.flags.route_lock; const r = s.route; const top = Object.entries(r).sort((a, b) => b[1] - a[1]); return top[0][1] > 0 ? top[0][0] : 'order'; };
  ST.setChapter = async function (c, id) {
    const s = S(); s.ch = id; const ch = ST.chapter(id);
    if (!ch) return;
    s.flags['ch:' + id] = true;
    ST.refreshPeople();
    c.journal('[y]' + ch.no + ' 「' + ch.title + '」[/] 시작');
    await c.chapter(ch.no, ch.title, ch.sub);
  };

  /* ───────── 사람 배치 ───────── */
  ST.people = {};    // 지도 id → [spec]
  /** spec: { id(cid), x, y (칸), dir, when(s) → bool, talk(c, npc), barks, wander, look, name, mark(s) } */
  ST.person = function (mapId, spec) { (ST.people[mapId] = ST.people[mapId] || []).push(spec); };
  ST.onPopulate = function (m, Wd) {
    spawnPeople(m, Wd);
    // 동료
    for (const f of ST.followers()) Wd.add(new Follower(f));
    if (ST.decorate[m.id]) for (const fn of ST.decorate[m.id]) ST.safe(fn, [m, Wd, S()], 'map ' + m.id);
  };
  /** 이야기가 바뀌어 사람들이 오가야 할 때: 지금 지도의 사람들을 다시 세운다 */
  ST.refreshPeople = function () {
    const Wd = W(), m = Wd.map; if (!m) return;
    for (const e of Wd.ents) if (e.fromPeople) e.dead = true;
    spawnPeople(m, Wd);
  };
  function spawnPeople(m, Wd) {
    const s = S();
    // 두 번 세우지 않는다 (들어서는 장면이 먼저 사람들을 다시 세운 경우)
    for (const e of Wd.ents) if (e.fromPeople) e.dead = true;
    for (const sp of ST.people[m.id] || []) {
      if (sp.when && !sp.when(s)) continue;
      const cast = sp.id && G.cast.get(sp.id);
      const look = sp.look || (cast && cast.look) || G.cast.folk(sp.folk || 'farmer');
      const pos = typeof sp.at === 'function' ? sp.at(s) : [sp.x, sp.y];
      const npc = new G.props.NPC({ cid: sp.id, x: pos[0] * TS + 8, y: pos[1] * TS + 12, dir: sp.dir || 'down', look, name: sp.name || (cast ? cast.name : ''), wanderR: sp.wander || 0, barks: sp.barks, talk: sp.talk, mark: sp.mark ? () => sp.mark(S()) : null, lookAt: sp.lookAt, voice: cast ? cast.voice : sp.voice, drawFn: sp.drawFn, speed: sp.speed || 26 });
      if (sp.state) npc.state = sp.state;
      if (sp.forceAnim) npc.forceAnim = sp.forceAnim;
      if (sp.mood) npc.mood = sp.mood;
      if (look && look.kind && !sp.drawFn) npc.drawFn = beastDraw(npc, look.kind);
      if (sp.met !== false && sp.id) npc.onTalkMet = true;
      E.settle(m, npc);
      npc.fromPeople = true;
      Wd.add(npc);
      if (sp.init) sp.init(npc, s);
    }
  }
  ST.decorate = {};   // 지도 id → [fn(m, W, s)]: 들어설 때마다 (조건부 소품 · 적 · 사건)
  ST.onMap = function (mapId, fn) { (ST.decorate[mapId] = ST.decorate[mapId] || []).push(fn); };

  /* ───────── 사람이 아닌 이의 걸음 그림 (토리아 · 미드나잇 · 옥타비오 …) ───────── */
  const BC = {};
  function beastImg(kind, f, dir) {
    const key = kind + f + dir;
    if (BC[key]) return BC[key];
    const X = G.gfx; const SZ = { whale: [48, 30], spirit: [28, 34], armor: [24, 30] }[kind] || [20, 20]; const b = X.brush(SZ[0], SZ[1]);
    if (kind === 'whale') { // 구름고래: 둥실 떠 있는 구름 덩어리, 등에 무지개 깃발
      const bob = f % 2, C = ['#8aa8d8', '#bcd4f4', '#e4f0ff', '#ffffff'];
      b.ellipse(22, 18 - bob, 18, 9, C[1]); b.ellipse(20, 16 - bob, 16, 7, C[2]); b.ellipse(16, 13 - bob, 8, 4, C[3]);
      b.ellipse(10, 21 - bob, 6, 4, C[2]); b.ellipse(30, 22 - bob, 7, 4, C[2]); b.ellipse(22, 24 - bob, 12, 3, C[0]);
      const tx = dir === 'left' ? 4 : 40; b.ellipse(dir === 'left' ? 42 : 4, 14 - bob, 5, 3, C[2]); b.ellipse(dir === 'left' ? 45 : 1, 11 - bob, 3, 3, C[1]); void tx;
      const ex = dir === 'left' ? 11 : 33; if (dir !== 'up') { b.rect(ex, 16 - bob, 2, 2, '#2a3458'); b.px(ex, 16 - bob, '#ffffff'); b.px(ex + (dir === 'left' ? 3 : -3), 19 - bob, '#ff9ab8'); }
      b.vline(24, 1 - bob, 9 - bob, '#8a6a4a'); const fl = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#b87aff']; for (let k = 0; k < 6; k++) b.hline(25, 31 + (bob ? 0 : 1), 1 + k - bob, fl[k]);
      if (f % 2) { b.px(28, 0, '#ffffff'); b.px(30, -1 + 1, '#e4f0ff'); }
    } else if (kind === 'spirit') { // 나무 정령
      const sw = f % 2 ? 1 : 0;
      b.ellipse(14, 12, 11, 10, '#4a8a3a'); b.ellipse(12, 10, 8, 7, '#6ab84a'); b.ellipse(10, 7, 4, 3, '#9ae07a');
      b.rect(10, 20, 8, 12, '#6a4a2a'); b.rect(10, 20, 3, 12, '#8a6a3a'); b.line(10, 24, 3 - sw, 18, '#6a4a2a'); b.line(18, 24, 25 + sw, 18, '#6a4a2a');
      if (dir !== 'up') { b.rect(11, 22, 2, 2, '#e8ffa8'); b.rect(15, 22, 2, 2, '#e8ffa8'); b.hline(12, 16, 27, '#3a2a1a'); }
      b.px(6, 4 + sw, '#ffd8f0'); b.px(21, 6 - sw, '#ffd8f0');
    } else if (kind === 'armor') { // 속이 빈 은빛 갑옷
      const S2 = ['#4a5468', '#8a98b0', '#c8d4e4', '#f4f8ff'];
      b.rect(6, 12, 12, 11, S2[1]); b.rect(7, 12, 4, 10, S2[2]); b.ellipse(12, 7, 6, 6, S2[1]); b.ellipse(11, 6, 4, 4, S2[2]); b.rect(7, 6, 10, 2, '#0a0c14'); if (dir !== 'up') { b.px(9, 6, '#bfe8ff'); b.px(14, 6, '#bfe8ff'); }
      b.rect(3, 12, 3, 9, S2[0]); b.rect(18, 12, 3, 9, S2[0]); b.rect(7, 23, 4, 6, S2[0]); b.rect(13, 23, 4, 6, S2[0]); b.px(12, 1, S2[3]); b.vline(12, 0, 2, '#bfe8ff');
    } else if (kind === 'squirrel') {
      const F = '#c89a6a', D = '#8a6a4a', L = '#fff0dc';
      const hop = f % 2 ? 1 : 0;
      b.ellipse(8, 11 - hop, 5, 6, D); b.ellipse(6, 9 - hop, 4, 5, F); // 꼬리
      b.ellipse(12, 13 - hop, 5, 4, F); b.ellipse(12, 14 - hop, 3, 2.5, L);
      b.ellipse(13, 8 - hop, 4.5, 4, F); b.ellipse(10, 4 - hop, 1.8, 2.2, F); b.ellipse(16, 4 - hop, 1.8, 2.2, F); b.px(10, 4 - hop, '#ffc8b0'); b.px(16, 4 - hop, '#ffc8b0');
      if (dir !== 'up') { b.rect(11, 7 - hop, 2, 2, '#1a1020'); b.rect(15, 7 - hop, 2, 2, '#1a1020'); b.px(11, 7 - hop, '#ffffff'); b.px(15, 7 - hop, '#ffffff'); b.px(14, 9 - hop, '#5a2a3a'); b.px(10, 9 - hop, '#ff9ab0'); b.px(17, 9 - hop, '#ff9ab0'); }
      b.rect(10, 17 - hop, 2, 2, D); b.rect(14, 17 - hop, 2, 2, D);
    } else if (kind === 'cat') {
      const K = '#16121e', K2 = '#2a2438';
      b.ellipse(9, 13, 6, 4, K); b.line(3, 12, 1, 6 + f % 2, K); b.ellipse(13, 9, 4.5, 4, K2);
      b.px(10, 5, K2); b.px(11, 6, K2); b.px(16, 5, K2); b.px(15, 6, K2);
      b.rect(9, 1, 8, 5, K); b.rect(8, 5, 10, 1, K); b.hline(9, 16, 4, '#8a2a3a');
      if (dir !== 'up') { b.px(11, 9, '#ffe070'); b.px(15, 9, '#ffe070'); b.px(16, 9, '#e8c860'); }
      b.rect(6, 16, 2, 3, K); b.rect(12, 16, 2, 3, K);
    } else if (kind === 'octopus') {
      const P = '#d86a8a';
      b.ellipse(10, 8, 7, 7, P); b.ellipse(8, 6, 3, 2.5, '#f0a0b8');
      for (let i = 0; i < 4; i++) b.vline(4 + i * 4, 13, 18 - (i + f) % 2, P);
      b.rect(6, 8, 3, 3, '#ffffff'); b.rect(12, 8, 3, 3, '#ffffff'); b.px(7, 9, '#1a1020'); b.px(13, 9, '#1a1020'); b.hline(5, 15, 7, '#2a2438');
    } else if (kind === 'ai') {
      b.ellipse(10, 10, 7, 7, '#2a3448'); b.ellipse(10, 10, 4, 4, '#6ad8ff'); b.px(10, 10, '#ffffff'); b.hline(3, 17, 18, '#6ad8ff');
    } else { b.ellipse(10, 10, 8, 8, '#1a1028'); b.px(7, 9, '#ff2a5a'); b.px(13, 9, '#ff2a5a'); }
    BC[key] = X.outline(b.put(), '#140c1c');
    return BC[key];
  }
  function beastDraw(npc, kind) {
    return (g, cx, cy) => {
      const f = Math.floor((npc.walkT || npc.t) * 6) % 2;
      let img = beastImg(kind, npc.state === 'walk' ? f : 0, npc.dir);
      if (npc.dir === 'left') img = G.gfx.flipX(img);
      g.drawImage(img, Math.round(npc.x - cx - img.width / 2), Math.round(npc.y - cy - img.height + 1 - (npc.jz || 0) - (kind === 'whale' ? 6 + Math.sin(npc.t * 2) * 2 : 0)));
      if (npc.emote) G.props.drawEmote(g, npc, cx, cy);
    };
  }
  ST.beastImg = beastImg; ST.beastDraw = beastDraw;

  /* ───────── 동료: 주인공 뒤를 따라다닌다 ───────── */
  ST.followers = function () {
    const s = S(); const out = [];
    const m = W().map;
    if (m && m.noFollow) return out;
    for (const id of s.party || []) { const c = G.cast.get(id); if (c) out.push({ cid: id, look: c.look, name: c.name }); }
    return out;
  };
  class Follower extends E.Ent {
    constructor(o) {
      super(Object.assign({ kind: 'npc', npc: true, solid: false, bw: 8, bh: 5, speed: 90 }, o));
      const p = W().player; this.x = p.x - 12; this.y = p.y + 4; this.dir = p.dir; this.state = 'idle'; this.trail = []; this.walkT = 0; this.follower = true;
      if (o.look && o.look.kind) this.drawFn = beastDraw(this, o.look.kind);
      this.chatT = 20 + Math.random() * 20;
    }
    update(dt, Wd) {
      this.t += dt;
      if (this.script) return;
      const p = Wd.player; if (!p) return;
      const last = this.trail[this.trail.length - 1];
      if (!last || U.dist(last[0], last[1], p.x, p.y) > 4) this.trail.push([p.x, p.y, p.z]);
      if (this.trail.length > 60) this.trail.shift();
      const idx = (Wd.ents.filter((e) => e.follower).indexOf(this) + 1) * 6;
      const tgt = this.trail[Math.max(0, this.trail.length - idx)];
      if (tgt && U.dist(this.x, this.y, tgt[0], tgt[1]) > 3 && U.dist(this.x, this.y, p.x, p.y) > 14) {
        const [nx, ny] = U.norm(tgt[0] - this.x, tgt[1] - this.y);
        const sp = Math.min(this.speed * 1.4, U.dist(this.x, this.y, tgt[0], tgt[1]) * 6);
        this.x += nx * sp * dt; this.y += ny * sp * dt; this.z = tgt[2];
        this.dir = U.dir4(nx, ny, this.dir); this.state = 'walk'; this.walkT += dt; this.vx = nx * sp; this.vy = ny * sp;
      } else { this.state = 'idle'; this.vx = this.vy = 0; }
      if (U.dist(this.x, this.y, p.x, p.y) > 200) { this.x = p.x - 10; this.y = p.y + 4; this.trail = []; }
      // 가끔 혼잣말
      this.chatT -= dt;
      if (this.chatT <= 0 && !G.script.running) { this.chatT = 25 + Math.random() * 30; const line = ST.chatter ? ST.chatter(this.cid) : null; if (line) G.cine.bubble(this, line, { life: 3 }); }
    }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.24)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), 5, 2, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) { if (this.drawFn) this.drawFn(g, cx, cy); else G.sprites.drawChar(g, this, cx, cy); }
  }
  ST.Follower = Follower;
  ST.join = function (id) { const s = S(); s.party = s.party || []; if (!s.party.includes(id)) s.party.push(id); const p = W().player; if (p && W().map) W().add(new Follower({ cid: id, look: G.cast.get(id).look, name: G.cast.name(id) })); };
  /** 동료가 떠난다. walk면 걸어서 나간다 (대사 중에 도트가 사라지지 않게) */
  ST.leave = function (id, walk) {
    const s = S(); s.party = (s.party || []).filter((x) => x !== id);
    const p = W().player;
    for (const e of W().ents) if (e.follower && e.cid === id) {
      if (walk && p) { e.follower = false; const [nx, ny] = U.norm(e.x - p.x || 1, e.y - p.y); e.leaving = { vx: nx * 50, vy: ny * 40, t: 0 }; e.update = function () {}; }
      else e.dead = true;
    }
  };

  /* ───────── 빛 씨앗: 대륙 곳곳에 숨은 작은 빛 (모아서 화살통 · 폭탄 가방 · 기력) ───────── */
  class Seed extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'seed', solid: false, bw: 8, bh: 6 }, o)); this.got = flag('seed:' + o.sid); if (this.got) this.dead = true; this.visible = !o.under; }
    update(dt, Wd) {
      this.t += dt;
      const m = Wd.map;
      if (!this.visible) { const o = m.O(Math.floor(this.x / TS), Math.floor((this.y - 4) / TS)); if (!o) { this.visible = true; G.fx.glow(this.x, this.y - 6, '#fff8c0', 10); G.audio && G.audio.sfx('surprise'); } return; }
      if (this.needLit && !this.needLit()) return;
      const p = Wd.player;
      if (p && U.dist(p.x, p.y - 4, this.x, this.y - 6) < 10) {
        this.dead = true; const s = S(); s.flags['seed:' + this.sid] = true; s.seeds = (s.seeds || 0) + 1;
        G.fx.ring(this.x, this.y - 6, '#fff8c0', 20, 0.5, 2); G.fx.glow(this.x, this.y - 6, '#fff8c0', 16);
        if (G.audio) G.audio.jingle('secret');
        G.ui.toast('빛 씨앗을 찾았다 (' + s.seeds + '개)' + (this.hint ? ' — ' + this.hint : ''), 'white');
      }
    }
    draw(g, cx, cy) {
      if (!this.visible || (this.needLit && !this.needLit())) return;
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 8 + Math.sin(this.t * 3) * 2);
      g.globalAlpha = 0.35; g.fillStyle = '#fff8c0'; g.beginPath(); g.arc(x, y, 5 + Math.sin(this.t * 5), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 2, 2, 4); g.fillRect(x - 2, y - 1, 4, 2);
      if (Math.random() < 0.08) G.fx.part({ x: this.x, y: this.y, z: 8, vz: 12, g: 0, life: 0.6, col: '#fff8c0', size: 1, glow: true });
    }
  }
  ST.Seed = Seed;
  ST.seeds = [];      // { sid, map, x, y, under, hint }
  ST.seed = function (sid, map, x, y, o) { ST.seeds.push(Object.assign({ sid, map, x, y }, o || {})); };

  /* ───────── 건물 + 실내 한 번에 ───────── */
  /** 넓은 지도(m)에 건물을 세우고, 문 너머 실내 지도를 등록한다
      o: { id, style, tx, ty, w, h, name, sign, room: { w, h, floor, furn, rug, music, dark }, region } */
  ST.house = function (m, o) {
    const id = o.id;
    const w = o.w || 5, h = o.h || 4;
    G.ow.clear(m, o.tx - 1, o.ty - 1, w + 2, h + 3, m.hgt[m.i(o.tx + (w >> 1), o.ty + h)], null);
    const door = G.build.placeBuilding(m, Object.assign({ style: o.style, tx: o.tx, ty: o.ty, w, h, to: o.room ? id : null, sign: o.sign, use: o.use, colors: o.colors, win: o.win, id: id, cond: o.cond, msg: o.msg }, o.special ? { special: o.special } : {}));
    // 문 앞 길
    const road = G.ow.towns[o.region] ? G.ow.towns[o.region].road : T.DIRT;
    for (let y = o.ty + h; y < o.ty + h + (o.path || 2); y++) { const i = m.i(door.dx, y); if (m.ter[i] !== T.STAIRS && m.ter[i] !== T.CLIFF) { m.ter[i] = o.pave || road || T.DIRT; m.obj[i] = 0; } }
    if (o.room) {
      const R = o.room;
      G.build.def(id, {
        build() {
          const rm = G.build.room(Object.assign({ id, region: o.region || 'green', name: o.name, back: [o.backMap || 'world', door.dx, door.dy + 1] }, R));
          rm.sub = o.sub || '';
          return rm;
        },
      });
    }
    return door;
  };

  /* ───────── 아직 갈 수 없는 지역: 부드럽게 되돌린다 ───────── */
  ST.closedMsg = {};   // 지역 → 문구
  ST.regionOpen = function (n) {
    if (n === 'amber') return !!S().flags['open:blue'];      // 단풍 협곡: 레드를 지나면
    if (n === 'mist') return !!S().flags['open:purple'];     // 안개 늪: 옐로를 지나면
    return n === 'green' || !!S().flags['open:' + n];
  };
  let lastOk = null, pushT = 0;
  ST.onTick = ST.onTick || [];
  function nearOpen(tx, ty, r) {
    for (let d = 1; d <= r; d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
      if (ST.regionOpen(G.ow.regionOf(tx + dx, ty + dy))) return true;
    }
    return false;
  }
  function checkRegion(dt) {
    if (ST.regionVeil) return ST.regionVeil(dt);   // 날씨 장막 (48_explore): 순간 이동 대신 바람 · 비 · 눈이 되민다
    const Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !m.overworld || !p || G.script.running) return;
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    const n = G.ow.regionOf(tx, ty);
    if (ST.regionOpen(n)) { if (p.state !== 'jump' && p.state !== 'fall') lastOk = { x: p.x, y: p.y, z: p.z }; return; }
    // 경계에서 몇 칸은 들어설 수 있다: 경계 위의 일(산사태 바위 · 문 앞 등)을 열린 쪽에서 마칠 수 있게
    if (nearOpen(tx, ty, 4)) return;
    if (!lastOk) return;
    p.x = lastOk.x; p.y = lastOk.y; p.z = lastOk.z; p.kx = p.ky = 0; if (p.state === 'roll') p.setState('idle');
    pushT -= dt;
    if (pushT <= 0) { pushT = 3; const msg = ST.closedMsg[n] || '아직은 갈 때가 아니다.'; G.script.run(async (c) => { if (S().party && S().party.includes('toria')) await c.say('toria', msg, { face: 'shock' }); else await c.say(null, msg, { style: 'sys' }); }); }
  }

  /* ───────── 절벽 속 동굴 입구 (던전 · 숨은 동굴) ─────────
     (x, y): 입구 두 칸의 왼쪽. 입구 북쪽에 작은 언덕을 쌓고, 남쪽으로 길을 낸다 */
  ST.cave = function (m, o) {
    const x = o.x, y = o.y, base = m.hgt[m.i(x, y + 1)];
    const rx = o.rx || 7, ry = o.ry || 4;
    // 다른 입구와 그 앞길은 언덕으로 덮지 않는다 (가까이 놓인 두 동굴이 서로를 묻던 것)
    const near = (xx, yy) => (m.warps || []).some((w) => xx >= w.x - 2 && xx <= w.x + (w.w || 1) + 1 && yy >= w.y - 1 && yy <= w.y + 4);
    for (let yy = y - ry * 2; yy <= y; yy++) for (let xx = x - rx; xx <= x + rx + 1; xx++) {
      if (!m.inb(xx, yy) || near(xx, yy)) continue;
      const d = Math.hypot((xx - x - 0.5) / rx, (yy - (y - ry)) / (ry + 0.5));
      if (d < 1 && m.hgt[m.i(xx, yy)] <= base) { m.hgt[m.i(xx, yy)] = base + (o.h || 1); const t = m.ter[m.i(xx, yy)]; if (t === T.WATER || t === T.DEEP || t === T.CLIFF || t === T.STAIRS || t === T.BRIDGE) m.ter[m.i(xx, yy)] = o.ground || T.GRASS; m.obj[m.i(xx, yy)] = o.cover && d < 0.8 && G.u.noise2(xx, yy, 7) > 0.4 ? o.cover : 0; }
    }
    G.gen.caveMouth(m, x, y, 2);
    // 입구는 언덕 발치(아래 땅과 같은 높이)에 판다: 언덕 위에 두면 앞 칸이 절벽 면이 되어 걸어서 닿지 못한다
    // 언덕이 두 층 이상이면 면이 여러 줄이 되니, 입구 아래 줄들도 절벽 면에서 뺀다
    for (const xx of [x, x + 1]) { m.hgt[m.i(xx, y)] = base; for (let k = 1; k < (o.h || 1); k++) m.noCliff.add(m.i(xx, y + k)); }
    G.build.placeBuilding(m, { special: 'cave', tx: x, ty: y, w: 2, h: 1, to: o.to, id: o.id, col: o.col || '#6e5640', cond: o.cond, msg: o.msg });
    for (let yy = y + 1; yy < y + (o.path || 3); yy++) for (const xx of [x, x + 1]) { const i = m.i(xx, yy); if (m.ter[i] === T.CLIFF || m.ter[i] === T.STAIRS) { m.ter[i] = T.STAIRS; m.obj[i] = 0; continue; } m.ter[i] = m.ter[i] === T.WATER || m.ter[i] === T.DEEP ? T.BRIDGE : (o.road || T.DIRT); m.obj[i] = 0; m.hgt[i] = base; }
    return { x, y };
  };
  /** 장(章)마다 다른 말: { c1: [...], c3: [...] } → 지금 장 이하에서 가장 늦은 것 */
  const ORDER = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  ST.chIdx = (id) => ORDER.indexOf(id || S().ch || 'c1');
  ST.after = (id) => ST.chIdx() >= ST.chIdx(id);
  ST.lines = function (tbl) {
    const cur = ST.chIdx();
    let best = null;
    for (const k of Object.keys(tbl)) { const i = ORDER.indexOf(k); if (i >= 0 && i <= cur && (best == null || i > ORDER.indexOf(best))) best = k; }
    const v = best ? tbl[best] : tbl.default;
    return Array.isArray(v) ? G.u.pick(v) : v;
  };
  /** 주민 한 명: 장마다 다른 말 · 갈래마다 다른 말 */
  ST.folk = function (mapId, o) {
    ST.person(mapId, Object.assign({}, o, { talk: o.talk || (async (c, n) => {
      if (o.id) c.flag('met:' + o.id);
      const rt = ST.route();
      let t = o.route && o.route[rt] && ST.after(o.routeFrom || 'c1') ? o.route[rt] : ST.lines(o.lines);
      for (let k = 0; k < 3 && typeof t === 'function'; k++) { const r = await t(c, n); if (r === undefined) return; t = r; }
      if (Array.isArray(t)) t = G.u.pick(t);
      if (t == null) return;
      for (const l of String(t).split('||')) await c.say(n, l.trim(), { face: o.face });
    }) }));
  };

  /* ───────── 매 프레임 ───────── */
  // 갈고리 하나가 오류를 내도 나머지(이야기 진행 · 수련 판정 …)는 계속 돈다. 오류는 갈고리마다 한 번만 남긴다
  const failed = new WeakSet();
  ST.safe = function (f, args, tag) {
    try { return f.apply(null, args); }
    catch (e) { if (!failed.has(f)) { failed.add(f); console.error('[story ' + (tag || 'hook') + ']', e); } }
  };
  ST.tick = function (dt) {
    if (ST.onTick) for (const f of ST.onTick) ST.safe(f, [dt], 'tick');
  };
  ST.onTick = [checkRegion];
  ST.onKill = function (e) {
    const s = S(); s.kills = (s.kills || 0) + 1;
    if (ST.killHooks) for (const f of ST.killHooks) ST.safe(f, [e, s], 'kill');
  };
  ST.killHooks = [];
  ST.onLevel = function (lv) { if (ST.levelHooks) for (const f of ST.levelHooks) ST.safe(f, [lv], 'level'); };
  ST.levelHooks = [];
  ST.onEnter = function (m) { if (ST.enterHooks) for (const f of ST.enterHooks) ST.safe(f, [m], 'enter'); };
  ST.enterHooks = [];
  /** 지역 단계 이상으로 적이 강해지지 않게 (장에 맞춰) */
  ST.foeScale = function () { return 0; };

  /* 씨앗 · 쓰러뜨릴 적 등 지도에 올리기 */
  ST.enterHooks.push((m) => {
    for (const sd of ST.seeds) if (sd.map === m.id && !flag('seed:' + sd.sid)) W().add(new Seed({ sid: sd.sid, x: sd.x * TS + 8, y: sd.y * TS + 12, under: sd.under, hint: sd.hint, needLit: sd.needLit }));
  });

  /* ───────── 새 게임 ───────── */
  ST.start = function (s) {
    s.ch = 'c1'; s.party = []; s.seeds = 0;
    if (ST.prologue) ST.prologue(s);
  };
})();
