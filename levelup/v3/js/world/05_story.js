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
    c.journal('[y]' + ch.no + ' 「' + ch.title + '」[/] 시작');
    await c.chapter(ch.no, ch.title, ch.sub);
  };

  /* ───────── 사람 배치 ───────── */
  ST.people = {};    // 지도 id → [spec]
  /** spec: { id(cid), x, y (칸), dir, when(s) → bool, talk(c, npc), barks, wander, look, name, mark(s) } */
  ST.person = function (mapId, spec) { (ST.people[mapId] = ST.people[mapId] || []).push(spec); };
  ST.onPopulate = function (m, Wd) {
    const s = S();
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
      Wd.add(npc);
      if (sp.init) sp.init(npc, s);
    }
    // 동료
    for (const f of ST.followers()) Wd.add(new Follower(f));
    if (ST.decorate[m.id]) for (const fn of ST.decorate[m.id]) fn(m, Wd, s);
  };
  ST.decorate = {};   // 지도 id → [fn(m, W, s)]: 들어설 때마다 (조건부 소품 · 적 · 사건)
  ST.onMap = function (mapId, fn) { (ST.decorate[mapId] = ST.decorate[mapId] || []).push(fn); };

  /* ───────── 사람이 아닌 이의 걸음 그림 (토리아 · 미드나잇 · 옥타비오 …) ───────── */
  const BC = {};
  function beastImg(kind, f, dir) {
    const key = kind + f + dir;
    if (BC[key]) return BC[key];
    const X = G.gfx; const b = X.brush(20, 20);
    if (kind === 'squirrel') {
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
      g.drawImage(img, Math.round(npc.x - cx - 10), Math.round(npc.y - cy - 19 - (npc.jz || 0)));
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
  ST.leave = function (id) { const s = S(); s.party = (s.party || []).filter((x) => x !== id); for (const e of W().ents) if (e.follower && e.cid === id) e.dead = true; };

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
    const door = G.build.placeBuilding(m, Object.assign({ style: o.style, tx: o.tx, ty: o.ty, w, h, to: o.room ? id : null, sign: o.sign, id: id, cond: o.cond, msg: o.msg }, o.special ? { special: o.special } : {}));
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
  ST.regionOpen = function (n) { return n === 'green' || !!S().flags['open:' + n]; };
  let lastOk = null, pushT = 0;
  ST.onTick = ST.onTick || [];
  function checkRegion(dt) {
    const Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !m.overworld || !p || G.script.running) return;
    const n = G.ow.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS));
    if (ST.regionOpen(n)) { if (p.state !== 'jump' && p.state !== 'fall') lastOk = { x: p.x, y: p.y, z: p.z }; return; }
    if (!lastOk) return;
    p.x = lastOk.x; p.y = lastOk.y; p.z = lastOk.z; p.kx = p.ky = 0; if (p.state === 'roll') p.setState('idle');
    pushT -= dt;
    if (pushT <= 0) { pushT = 3; const msg = ST.closedMsg[n] || '아직은 갈 때가 아니다.'; G.script.run(async (c) => { if (S().party && S().party.includes('toria')) await c.say('toria', msg, { face: 'shock' }); else await c.say(null, msg, { style: 'sys' }); }); }
  }

  /* ───────── 매 프레임 ───────── */
  ST.tick = function (dt) {
    if (ST.onTick) for (const f of ST.onTick) f(dt);
  };
  ST.onTick = [checkRegion];
  ST.onKill = function (e) {
    const s = S(); s.kills = (s.kills || 0) + 1;
    if (ST.killHooks) for (const f of ST.killHooks) f(e, s);
  };
  ST.killHooks = [];
  ST.onLevel = function (lv) { if (ST.levelHooks) for (const f of ST.levelHooks) f(lv); };
  ST.levelHooks = [];
  ST.onEnter = function (m) { if (ST.enterHooks) for (const f of ST.enterHooks) f(m); };
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
