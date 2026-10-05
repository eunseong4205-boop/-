/* 사이 막 — 장과 장 사이를 잇는 본 이야기 (틀)
   걸어서 넘어가는 일곱 구간(그린→레드 · 레드→블루 · 옐로→퍼플 · 무지개→화이트 · 화이트→그레이 · 그레이→블랙 · 블랙→곶)마다
   장이 끝나도 다음 땅이 바로 열리지 않는다. 그 사이의 일을 겪어야 — 누군가 찾아오고, 길 위의 자리로 가고, 싸우고, 고르고 — 다음 장이 시작된다.
   · 자리: 두 마을 사이 길(길 칸을 따라 잰 길)의 몇 할 지점, 길에서 몇 칸 비켜선 빈 땅에 야영지 · 초소 · 중계소 · 등불을 놓는다 (지도를 지을 때 한 번)
   · 단계: auto(길을 걷다 보면 저절로) · reach(그 자리에 닿으면 — 미리 서 있는 사람에게 말을 걸어도) · talk(방 안의 사람에게 말을 걸면)
           cond(조건이 채워지면) · spots(반짝이는 곳 여럿을 살피면)
     싸움이 붙은 단계는 적을 모두 쓰러뜨려야 다음으로 (지도를 나갔다 오면 남은 적이 그 자리에서 다시 길을 막는다)
   · 사이 막이 끝날 때까지: 목표 표시는 사이 막의 일을, 다음 땅 경계의 말은 「아직 할 일」을 말하고, 다음 장은 시작되지 않는다
   · 고른 것은 깃발로 남아 다음 장의 사람들 말 · 소문 · 진실의 조각 · 결말의 그 뒤로 이어진다 (59f · 59g) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs, E = G.ent;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!(G.state && G.state.flags && G.state.flags[k]);
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  const chi = (id) => ORD.indexOf(id);
  const ACTS = [];
  const SPOT = {};          // 'a1:camp' → { x, y, road: [x, y] } (칸)
  let spoofKey = null;      // 다음 장 시작을 잠깐 미루는 동안 세워 둔 깃발
  let live = null;          // 지금 이 걸음(지도에 들어선 한 번)에서 벌어지는 싸움 { key, gen }
  let gen = 0;              // 지도에 들어설 때마다 하나씩 (지도는 다시 쓰이므로 지도 객체로는 「나갔다 왔는지」를 알 수 없다)
  ST.enterHooks.push(() => { gen++; });

  /* ═════════ 사이 막 하나 ═════════ */
  ST.act = function (A) {
    A.steps.forEach((st, i) => { st.i = i; st.key = A.id + ':' + st.id; });
    ACTS.push(A);
    // 자리에 미리 서 있는 사람: 멀리서도 보이고, 말을 걸어도 그 단계가 시작된다
    for (const st of A.steps) if (st.wait) {
      st._specs = st.wait.map((w, i) => {
        const key = A.id + ':' + (w.at || st.at);
        const sp = { id: w.cid, name: w.name, look: w.look, folk: w.folk, dir: w.dir || 'down', state: w.state, met: false, speed: w.speed,
          at: () => { const a = SPOT[key]; return a ? [a.x + (w.dx || 0), a.y + (w.dy || 0)] : [1, 1]; },
          when: () => !!SPOT[key] && isCur(A, st) && (w.stay || !fighting(A)),
          mark: () => (i === 0 ? '!' : null),
          talk: async (c) => { if (isCur(A, st) && !fighting(A)) await play(c, A, st); } };
        ST.person('world', sp);
        return sp;
      });
    }
    return A;
  };
  const stepOf = (A, id) => A.steps.find((x) => x.id === id);
  const isDone = (st) => f('act:' + st.key);
  function curStep(A) { for (const st of A.steps) if (!isDone(st)) return st; return null; }
  function isCur(A, st) { return activeAct() === A && curStep(A) === st; }
  function fighting(A) { const F = S() && S().actF; return !!(F && F.act === A.id); }
  /** 지금 진행 중인 사이 막: 앞 장을 마쳤고, 다음 장이 아직 시작되지 않았다 */
  function activeAct() {
    const s = S(); if (!s || !s.flags) return null;
    for (const A of ACTS) {
      if (!s.flags[A.from + '_done'] || s.flags['act:' + A.id]) continue;
      if (s.flags['ch:' + A.to] && spoofKey !== 'ch:' + A.to) continue;   // 이미 다음 장에 들어선 기록 (사이 막이 생기기 전의 기록)
      return A;
    }
    return null;
  }
  ST.activeAct = activeAct;

  /* ═════════ 자리: 두 마을 사이 길을 따라 ═════════ */
  const DIR8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function townC(n) { const t = OW.towns[n]; return [t.x + (t.w >> 1), t.y + (t.h >> 1)]; }
  /** 길 칸만 밟아 a 마을에서 b 마을까지 (가장 짧게) */
  function roadRoute(m, a, b) {
    const Wm = m.w, Hm = m.h, R = OW.roadTiles;
    const near = ([cx, cy]) => {
      for (let r = 0; r < 48; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= Wm || y >= Hm) continue;
        if (R[y * Wm + x]) return y * Wm + x;
      }
      return -1;
    };
    const s0 = near(townC(a)), g0 = near(townC(b)); if (s0 < 0 || g0 < 0) return null;
    const prev = new Int32Array(Wm * Hm).fill(-2), q = new Int32Array(Wm * Hm);
    let qh = 0, qt = 0; q[qt++] = s0; prev[s0] = -1;
    while (qh < qt) {
      const i = q[qh++]; if (i === g0) break;
      const x = i % Wm, y = (i / Wm) | 0;
      for (const [dx, dy] of DIR8) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wm || ny >= Hm) continue;
        const j = ny * Wm + nx; if (prev[j] !== -2 || !R[j]) continue;
        prev[j] = i; q[qt++] = j;
      }
    }
    if (prev[g0] === -2) return null;
    const out = []; for (let i = g0; i !== -1; i = prev[i]) out.push([i % Wm, (i / Wm) | 0]);
    return out.reverse();
  }
  function okArea(m, x0, y0, w, h, avoid) {
    const hh = m.hgt[m.i(x0, y0)];
    for (let y = y0 - 1; y < y0 + h + 1; y++) for (let x = x0 - 1; x < x0 + w + 1; x++) if (m.inb(x, y) && OW.regName[m.i(x, y)] === avoid) return false;   // 아직 닫힌 땅에 걸치지 않게
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) return false;
      const i = m.i(x, y), t = m.ter[i];
      if (m.hgt[i] !== hh || m.solidExtra[i] || OW.roadTiles[i] || OW.sea[i]) return false;
      if (t === T.CLIFF || t === T.STAIRS || t === T.WATER || t === T.DEEP || t === T.LAVA || t === T.BRIDGE || t === T.CLOUD) return false;
    }
    for (const w of m.warps || []) if (Math.abs(w.x - x0) < 9 && Math.abs(w.y - y0) < 9) return false;
    for (const sd of ST.seeds || []) if (sd.map === 'world' && Math.abs(sd.x - x0) < 5 && Math.abs(sd.y - y0) < 5) return false;
    if (OW.inTown(x0, y0, 6) || OW.inTown(x0 + w, y0 + h, 6)) return false;
    for (const s of OW.stops || []) if (Math.abs(s.x - x0) < 9 && Math.abs(s.y - y0) < 9) return false;
    for (const k in SPOT) if (Math.abs(SPOT[k].x - x0) < 8 && Math.abs(SPOT[k].y - y0) < 8) return false;
    return true;
  }
  /** 길에서 자리까지 걸어갈 수 있나 (같은 높이 · 물 · 절벽이 아닌 땅) — 되면 그 사이 풀 · 덤불을 걷어 낸다 */
  function reachable(m, x0, y0, x1, y1) {
    const h0 = m.hgt[m.i(x1, y1)], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    const cells = [];
    for (let k = 1; k < n; k++) {
      const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n), i = m.i(x, y), t = m.ter[i];
      if (OW.roadTiles[i]) continue;
      if (m.hgt[i] !== h0 || OW.sea[i] || t === T.CLIFF || t === T.WATER || t === T.DEEP || t === T.LAVA) return false;
      cells.push(i);
    }
    for (const i of cells) if (m.obj[i] && !m.solidExtra[i]) m.obj[i] = 0;
    return true;
  }
  function decorate(m, kind, x, y, reg) {
    const hh = m.hgt[m.i(x, y)];
    const put = (dx, dy, o) => { const i = m.i(x + dx, y + dy); if (m.inb(x + dx, y + dy) && !m.solidExtra[i] && !OW.roadTiles[i]) m.obj[i] = o; };
    const ground = (w, h, t) => OW.clear(m, x - (w >> 1), y - (h >> 1), w, h, hh, t || null);
    const tentC = reg === 'black' ? '#4a3a6a' : reg === 'white' ? '#c8d8e8' : reg === 'gray' ? '#7a7a84' : '#8a6a4a';
    switch (kind) {
      case 'camp': ground(6, 5, T.DIRT); G.build.placeBuilding(m, { special: 'tent', tx: x - 3, ty: y - 3, w: 2, h: 2, col: tentC, door: false }); put(2, -2, O.CART); put(2, 1, O.CRATE); put(-2, 2, O.BARREL); put(1, 2, O.CRATE); break;
      case 'fort': ground(7, 5, T.GRAVEL); G.build.placeBuilding(m, { special: 'tent', tx: x - 3, ty: y - 3, w: 2, h: 2, col: '#6a6a88', door: false }); G.build.placeBuilding(m, { special: 'tent', tx: x + 1, ty: y - 3, w: 2, h: 2, col: '#6a6a88', door: false }); put(-3, 1, O.BANNER); put(3, 1, O.BANNER); put(-1, 2, O.CRATE); break;
      case 'relay': ground(5, 4, T.GRAVEL); G.build.placeBuilding(m, { special: 'tower', tx: x - 1, ty: y - 2, w: 3, h: 2, col: '#8a8a94', door: false }); put(-2, 1, O.CRATE); put(2, 1, O.BARREL); break;
      case 'shrine': ground(3, 3, T.STONE); G.build.placeBuilding(m, { special: 'statue', tx: x - 1, ty: y - 2, w: 1, h: 1, door: false }); break;
      case 'stone': ground(3, 3, null); put(0, -1, O.PILLAR); put(-1, 0, O.FLOWER); put(1, 0, O.FLOWER); break;
      case 'cart': ground(5, 4, null); put(-1, -1, O.CART); put(1, -1, O.CRATE); put(-2, 1, O.BARREL); break;
      case 'mast': ground(3, 3, T.GRAVEL); put(0, -1, O.PILLAR); put(1, 0, O.CRATE); put(-1, 1, O.BARREL); m.lights.push({ x: x * TS + 8, y: (y - 1) * TS, r: 40, warm: 'rgba(160,220,255,0.18)' }); break;
      default: break;
    }
    if (kind === 'camp' || kind === 'fort') { m.lights.push({ x: x * TS + 8, y: y * TS + 8, r: 56, warm: 'rgba(255,180,100,0.18)' }); FIRES.push([x, y + 1]); }
  }
  /* 야영지 모닥불 */
  const FIRES = [];
  class Fire extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'campfire', solid: true, bw: 12, bh: 6 }, o)); this.glowR = 60; this.glowY = 6; }
    blockBox() { return { x: this.x - 6, y: this.y - 6, w: 12, h: 6 }; }
    update(dt, Wd) { this.t += dt; this.glowR = 56 + Math.sin(this.t * 9) * 4; const p = Wd.player; if (!p || Math.abs(p.x - this.x) > 320 || Math.abs(p.y - this.y) > 220) return; if (Math.random() < dt * 12) G.fx.part({ x: this.x + (Math.random() - 0.5) * 6, y: this.y - 2, z: 4, vz: 22, g: 0, life: 0.5, col: Math.random() < 0.5 ? '#ffb040' : '#ff7a2a', size: 1, glow: true }); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy), fl = Math.floor(this.t * 10) % 3;
      g.fillStyle = '#6a4a2a'; g.fillRect(x - 7, y - 3, 14, 3); g.fillStyle = '#4a3220'; g.fillRect(x - 5, y - 5, 10, 2);
      g.fillStyle = '#ff7a2a'; g.fillRect(x - 4, y - 8 - fl, 8, 5 + fl); g.fillStyle = '#ffd84a'; g.fillRect(x - 2, y - 7 - fl, 4, 4 + fl); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 5, 2, 2);
      g.fillStyle = '#8a8a90'; for (const [a, b] of [[-8, -1], [7, -1], [-6, 1], [5, 1]]) g.fillRect(x + a, y + b, 2, 2);
    }
  }
  ST.onMap('world', (m, Wd) => { for (const [x, y] of FIRES) Wd.add(new Fire({ x: x * TS + 8, y: y * TS + 8 })); });
  /** 길의 frac 지점 둘레에 자리를 고른다 */
  function place(m, path, sp, reg0, A) {
    const n = path.length; if (n < 6) return null;
    const pad = A && A.pad != null ? A.pad : 2, avoid = A && A.next;
    // 마을 밖의 길 칸들 위에서 몇 할 지점 (마을이 커서 길의 절반 넘게가 마을 안이다)
    const elig = []; for (let k = 2; k < n - 2; k++) if (!OW.inTown(path[k][0], path[k][1], pad)) elig.push(k);
    if (!elig.length) return null;
    const b0 = Math.round(sp.frac * (elig.length - 1));
    const w = sp.w || (sp.kind === 'fort' ? 7 : sp.kind === 'camp' ? 6 : sp.kind === 'relay' ? 5 : 3), h = sp.h || (sp.kind === 'camp' || sp.kind === 'fort' ? 5 : sp.kind === 'relay' ? 4 : 3);   // mast · shrine · stone: 3×3
    for (let d = 0; d < 80; d++) for (const sg of [1, -1]) {
      const ei = b0 + d * sg; if (ei < 0 || ei >= elig.length || (d === 0 && sg < 0)) continue;
      const k = elig[ei];
      const [x, y] = path[k];
      if (!sp.kind || sp.kind === 'road') {
        const t = m.ter[m.i(x, y)]; if (t === T.STAIRS || t === T.BRIDGE || t === T.CLIFF) continue;
        let clash = false; for (const kk in SPOT) if (Math.abs(SPOT[kk].x - x) < 5 && Math.abs(SPOT[kk].y - y) < 5) clash = true;
        if (clash) continue;
        if (sp.roadDeco) {   // 길가 바로 옆(같은 높이 · 빈 땅)에 몇 가지를 세운다: 큰 자리를 낼 수 없는 산길
          const h0 = m.hgt[m.i(x, y)], free = [];
          for (let r = 1; r <= 3 && free.length < sp.roadDeco.length; r++) for (const [dx, dy] of [[-r, 0], [r, 0], [-r, -1], [r, -1], [-r, 1], [r, 1], [0, -r]]) {
            const xx = x + dx, yy = y + dy, i = m.i(xx, yy), t = m.ter[i];
            if (!m.inb(xx, yy) || OW.roadTiles[i] || m.hgt[i] !== h0 || m.solidExtra[i] || OW.sea[i] || t === T.CLIFF || t === T.STAIRS || t === T.WATER || t === T.DEEP) continue;
            if (OW.regName[i] === avoid || free.some(([a, b]) => Math.abs(a - xx) + Math.abs(b - yy) < 2)) continue;
            free.push([xx, yy]); if (free.length >= sp.roadDeco.length) break;
          }
          free.forEach(([xx, yy], j) => { m.obj[m.i(xx, yy)] = O[sp.roadDeco[j]]; });
          if (free.length) m.lights.push({ x: free[0][0] * TS + 8, y: free[0][1] * TS, r: 40, warm: 'rgba(160,220,255,0.18)' });
        }
        return { x, y, road: [x, y] };
      }
      const [ax, ay] = path[Math.max(0, k - 3)], [bx, by] = path[Math.min(n - 1, k + 3)];
      const L = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / L, ny = (bx - ax) / L;
      for (const off of sp.off || [5, 6, 7, 8, 9]) for (const side of [1, -1]) {
        const cx = Math.round(x + nx * off * side), cy = Math.round(y + ny * off * side);
        if (!m.inb(cx, cy)) continue;
        if (!okArea(m, cx - (w >> 1), cy - (h >> 1), w, h, avoid)) continue;
        if (!reachable(m, x, y, cx, cy + (h >> 1) + 1)) continue;
        decorate(m, sp.kind, cx, cy, OW.regName[m.i(cx, cy)] || reg0);
        return { x: cx, y: cy + (sp.kind === 'shrine' || sp.kind === 'stone' ? 1 : 0), road: [x, y] };
      }
    }
    return null;
  }
  OW.hooks.push((m) => {
    for (const A of ACTS) {
      const full = roadRoute(m, A.A, A.B);
      if (!full) { console.warn('[사이 막] 길을 못 찾음', A.id); continue; }
      const path = [];
      for (const [x, y] of full) { if (OW.regName[m.i(x, y)] === A.next) break; path.push([x, y]); }
      A.path = path;
      for (const [k, sp] of Object.entries(A.spots || {})) {
        let at = place(m, path, sp, A.A, A);
        for (const alt of sp.alt || []) if (!at) at = place(m, path, Object.assign({}, sp, { kind: alt, w: null, h: null }), A.A, A);
        if (!at && sp.kind && sp.kind !== 'road') at = place(m, path, Object.assign({}, sp, { kind: 'road' }), A.A, A);
        if (at) SPOT[A.id + ':' + k] = at; else console.warn('[사이 막] 자리 없음', A.id, k);
      }
    }
  });
  ST.actSpot = (A, k) => SPOT[(A.id || A) + ':' + k];

  /* ═════════ 도우미 (59f · 59g가 쓴다) ═════════ */
  function spot(p, dists) {
    const m = W().map, z = p.z || 0;
    for (let i = 0; i < 16; i++) {
      const a = i * 0.785 + (i > 7 ? 0.39 : 0);
      for (const d of dists || [64, 50, 80, 40]) {
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d * 0.8, tx = Math.floor(x / TS), ty = Math.floor((y - 4) / TS);
        const t0 = m.T(tx, ty); if (t0 === T.WATER || t0 === T.DEEP || t0 === T.LAVA || t0 === T.CLIFF) continue;
        if (m.H(tx, ty) !== z || !m.boxFree(x - 5, y - 8, 10, 8, z, p)) continue;
        if (W().propBlock && W().propBlock(x - 5, y - 8, 10, 8, p)) continue;
        // 이미 누가 서 있는 자리 · 그 사람이 걸어올 길목은 피한다 (둘이 같은 자리에서 나와 서로 비켜 가느라 한참 걸리던 것)
        const tx2 = p.x + (x - p.x) * 0.4, ty2 = p.y + (y - p.y) * 0.4;
        if (W().ents.some((e) => !e.dead && e !== p && (e.npc || e.foe || e.follower) && (Math.hypot(e.x - x, e.y - y) < 18 || Math.hypot(e.x - tx2, e.y - ty2) < 14))) continue;
        return [x, y];
      }
    }
    return null;
  }
  function calm(r) {
    const Wd = W(), p = Wd.player;
    for (const e of Wd.ents) if (e.foe && !e.dead && (e.aggro || U.dist(e.x, e.y, p.x, p.y) < (r || 130))) return false;
    return true;
  }
  /** 사람이 저쪽에서 걸어와 곁에 선다 */
  async function comes(c, spec, speed) {
    const p = W().player, at = spot(p); if (!at) return null;
    const n = c.spawn(Object.assign({ x: at[0], y: at[1], dir: U.dir4(p.x - at[0], p.y - at[1]) }, spec));
    await c.move(n, p.x + (at[0] - p.x) * 0.4, p.y + (at[1] - p.y) * 0.4, { speed: speed || 42 });
    c.faceEach('hero', n);
    return n;
  }
  /** 걸어서 떠난다 (화면 밖에서 사라진다) */
  function goes(c, n, speed) {
    if (!n || n.dead) return;
    const p = W().player, a = Math.atan2(n.y - p.y, n.x - p.x);
    c.move(n, n.x + Math.cos(a) * 140, n.y + Math.sin(a) * 110, { speed: speed || 46 }).then(() => { n.dead = true; });
  }
  /** 자리에 미리 서 있던 사람 (없으면 그 자리에 세운다) */
  function waiting(c, A, st, i) {
    const sp = st._specs && st._specs[i || 0]; if (!sp) return null;
    let n = W().ents.find((e) => e.spec === sp && !e.dead);
    if (!n && c) {
      const pos = sp.at();
      n = c.spawn({ cid: sp.id, name: sp.name, look: sp.look || (sp.id && G.cast.get(sp.id) ? G.cast.get(sp.id).look : G.cast.folk(sp.folk || 'farmer')), x: pos[0] * TS + 8, y: pos[1] * TS + 12, dir: sp.dir, noEnter: true });
    }
    return n;
  }
  const pxOf = (A, k) => { const a = SPOT[A.id + ':' + k]; return a ? { x: a.x * TS + 8, y: a.y * TS + 12 } : null; };
  const tori = (c, text, face) => ((S().party || []).includes('toria') ? c.say('toria', text, { face: face || 'normal' }) : Promise.resolve());
  ST.actKit = { spot, calm, comes, goes, waiting, pxOf, tori, SPOT, ACTS };

  /* ═════════ 단계 진행 ═════════ */
  function ctx(c, A, st) { return { A, st, at: SPOT[A.id + ':' + st.at], P: pxOf(A, st.at), npc: (i) => waiting(c, A, st, i), spot: (k) => SPOT[A.id + ':' + k], px: (k) => pxOf(A, k) }; }
  async function play(c, A, st) {
    c.lock(true); await c.cinema(true);
    let ok;
    try { ok = await st.run(c, ctx(c, A, st)); }
    catch (e) { console.error('[사이 막 ' + st.key + ']', e); ok = true; }   // 대본이 틀려도 길은 막지 않는다
    finally { await c.cinema(false); c.lock(false); }
    if (ok === false) return false;
    if (st.fight) startFight(A, st);
    else done(A, st);
    return true;
  }
  function start(A, st) { freeT = 0; G.script.run(async (c) => { await play(c, A, st); }); }
  function done(A, st) {
    const s = S(); s.flags['act:' + st.key] = true;
    ST.refreshPeople();
    if (A.steps.every(isDone)) complete(A);
    else if (!s.settings || s.settings.autosave !== false) G.st.save(s, true);
  }
  function complete(A) {
    const s = S(); if (s.flags['act:' + A.id]) return;
    s.flags['act:' + A.id] = true;
    G.ui.toast(A.openMsg || '길이 열렸다', 'gold'); if (G.audio) G.audio.jingle('secret');
    if (A.onDone) ST.safe(A.onDone, [s], 'act');
    ST.refreshPeople();
    if (!s.settings || s.settings.autosave !== false) G.st.save(s, true);
  }
  /* 싸움 */
  function spawnFoes(A, st, list) {
    const at = pxOf(A, st.at) || { x: W().player.x, y: W().player.y - 40 };
    live = { key: st.key, gen };
    for (const d of list) {
      let x = at.x + (d.dx || 0) * TS, y = at.y + (d.dy || 0) * TS;
      if (d.from != null) { const n = waiting(null, A, st, d.from); if (n) { x = n.x; y = n.y; n._noFade = true; n.dead = true; } }
      const e = G.foes.spawn(d.type, x, y, { tier: d.tier || 0, hpMul: d.hpMul, noElite: true });
      if (d.name) e.name = d.name;
      e.actTag = st.key; e.aggro = true; e.keepAwake = true;
    }
  }
  function startFight(A, st) {
    const s = S(), list = st.fight(ctx(null, A, st)) || [];
    if (!list.length) { finish(A, st); return; }
    s.actF = { act: A.id, step: st.id, total: list.length, killed: 0 };
    spawnFoes(A, st, list);
    if (st.fightMsg) G.ui.toast(st.fightMsg, 'bad');
    if (G.audio) G.audio.sfx('encounter');
    ST.refreshPeople();
  }
  function finish(A, st) {
    if (!st.after) { done(A, st); return; }
    freeT = 0;
    G.script.run(async (c) => {
      c.lock(true); await c.cinema(true);
      try { await st.after(c, ctx(c, A, st)); }
      catch (e) { console.error('[사이 막 ' + st.key + ' 뒤]', e); }
      finally { await c.cinema(false); c.lock(false); }
      done(A, st);
    });
  }
  ST.killHooks.push((e, s) => { const F = s.actF; if (F && e.actTag && e.actTag === F.act + ':' + F.step) F.killed++; });
  function fightTick(A) {
    const s = S(), F = s.actF, st = stepOf(A, F.step);
    if (!st) { s.actF = null; return; }
    if (F.killed >= F.total) { s.actF = null; live = null; finish(A, st); return; }
    const Wd = W(), m = Wd.map; if (!m || !m.overworld) return;
    if (Wd.ents.some((e) => e.foe && !e.dead && e.actTag === st.key)) return;
    if (live && live.key === st.key && live.gen === gen) { F.killed = F.total; return; }   // 지도를 떠나지 않았는데 모두 사라졌다 (물에 빠지는 등)
    const at = pxOf(A, st.at), p = Wd.player;
    if (at && p && U.dist(p.x, p.y, at.x, at.y) < 14 * TS) {
      const list = (st.fight(ctx(null, A, st)) || []).slice(0, F.total - F.killed).map((d) => Object.assign({}, d, { from: null }));
      spawnFoes(A, st, list);
      G.ui.toast(st.again || '적들이 다시 길을 막는다!', 'bad');
    }
  }
  /* 살펴볼 곳 여럿 */
  class ActSpot extends G.props.Spot {
    update(dt, Wd) { super.update && super.update(dt, Wd); if (f(this.flagKey)) this.dead = true; }
  }
  function placeSpots(A, st) {
    const Wd = W();
    for (const k of st.spots) {
      const fk = 'act:' + st.key + ':' + k; if (f(fk)) continue;
      if (Wd.ents.some((e) => e.flagKey === fk && !e.dead)) continue;
      const at = pxOf(A, k); if (!at) { S().flags[fk] = true; continue; }
      const sp = st.spotText[k];
      Wd.add(new ActSpot({ x: at.x, y: at.y - 4, verb: sp.verb || '살펴본다', sparkle: true, flagKey: fk, text: async (c) => {
        if (f(fk)) return;
        c.lock(true);
        try { await sp.run(c); } finally { c.lock(false); }
        S().flags[fk] = true;
      } }));
    }
  }

  /* ═════════ 매 프레임 ═════════ */
  let freeT = 0;
  ST.onTick.push((dt) => {
    const A = activeAct(); if (!A) return;
    const s = S(), Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !p || G.script.running || s.duel || p.state === 'dead' || ST.staging || (G.game && G.game.scene && G.game.scene !== 'play') || (G.ui.blocking && G.ui.blocking())) { freeT = Math.min(freeT, 0.5); return; }
    if (s.actF) { if (s.actF.act === A.id) fightTick(A); else s.actF = null; return; }
    const st = curStep(A); if (!st) { complete(A); return; }
    freeT += dt;
    if (st.kind === 'cond') { if (st.done(s)) { if (st.run) { if (freeT > 0.8) start(A, st); } else done(A, st); } return; }
    if (st.kind === 'talk') return;
    if (!m.overworld) return;
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    if (st.kind === 'spots') {
      placeSpots(A, st);
      if (st.spots.every((k) => f('act:' + st.key + ':' + k)) && freeT > 0.6) { if (st.run) start(A, st); else done(A, st); }
      return;
    }
    if (st.kind === 'auto') {
      if (freeT < (st.delay || 4)) return;
      if (st.i === 0 && A.gap && !f('brf:' + A.gap) && (s.ch === A.from)) return;   // 길 이야기(59_bridges)의 「여운」이 먼저
      if (!st.inTown && OW.inTown(tx, ty, 2)) return;
      if (st.region && !st.region.includes(OW.regionOf(tx, ty))) return;
      if (!calm() || p.swimming) return;
      start(A, st);
      return;
    }
    if (st.kind === 'reach') {
      const at = SPOT[A.id + ':' + st.at];
      if (!at) { done(A, st); return; }   // 자리를 못 지었다 — 막지 않고 넘어간다
      if (freeT < 1.2 || Math.hypot(at.x - tx, at.y - ty) > (st.r || 6)) return;
      if (!st.noCalm && !calm(110)) return;
      start(A, st);
    }
  });
  // 방 안의 사람에게 말을 걸어 시작하는 단계
  ST.actTalk = function (A, stepId, mapId, cid) {
    const st = stepOf(A, stepId);
    ST.hookTalk(mapId, cid, () => isCur(A, st), async (c) => { await play(c, A, st); });
  };

  /* ═════════ 목표 · 막힌 땅 · 다음 장 ═════════ */
  function actGoal(A) {
    const s = S();
    if (s.actF && s.actF.act === A.id) {
      const st = stepOf(A, s.actF.step), a = st && SPOT[A.id + ':' + st.at];
      return Object.assign({ text: (st && st.fightGoal) || '길을 막은 이들을 물리치자.' }, a ? { map: 'world', x: a.x, y: a.y } : {});
    }
    const st = curStep(A); if (!st) return null;
    if (st.goalFn) { const g = st.goalFn(s); if (g) return g; }
    const text = typeof st.goal === 'function' ? st.goal(s) : st.goal;
    if (st.kind === 'talk') return { text, map: st.map, x: st.x, y: st.y };
    if (st.kind === 'spots') { const k = st.spots.find((k2) => !f('act:' + st.key + ':' + k2)); const a = k && SPOT[A.id + ':' + k]; return a ? { text, map: 'world', x: a.x, y: a.y } : { text }; }
    let a = st.at && SPOT[A.id + ':' + st.at];
    for (let i = st.i + 1; i < A.steps.length && !a; i++) { const nx = A.steps[i]; if (nx.at) a = SPOT[A.id + ':' + nx.at]; else if (nx.kind === 'spots') a = SPOT[A.id + ':' + nx.spots[0]]; }
    return a ? { text, map: 'world', x: a.x, y: a.y } : { text };
  }
  const goal0 = ST.goal;
  ST.goal = function () {
    const A = activeAct();
    if (A) { const g = actGoal(A); if (g && g.text) return g; }
    return goal0.apply(this, arguments);
  };
  const ro0 = ST.regionOpen;
  ST.regionOpen = function (n) {
    const A = activeAct();
    if (A && n === A.next) return false;
    return ro0.apply(this, arguments);
  };
  // 다음 장의 시작(그 땅에 들어서면)은 사이 막이 끝날 때까지 기다린다: 경계에서 몇 칸 들어선 동안에도 시작되지 않게
  const tick0 = ST.tick;
  ST.tick = function (dt) {
    const s = S(), A = s && s.flags ? activeAct() : null;
    let sp = null;
    if (A && !s.flags['ch:' + A.to]) {
      const Wd = W(), p = Wd && Wd.player, m = Wd && Wd.map;
      if (m && m.overworld && p && OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) === A.next) { sp = 'ch:' + A.to; spoofKey = sp; s.flags[sp] = true; }
    }
    try { return tick0.apply(this, arguments); }
    finally { if (sp) { delete s.flags[sp]; spoofKey = null; } }
  };
  /** 모든 사이 막이 올라온 뒤 한 번: 막힌 땅의 말을 「아직 할 일」로 */
  ST.actsSeal = function () {
    for (const n of new Set(ACTS.map((a) => a.next))) {
      let v = ST.closedMsg[n];
      Object.defineProperty(ST.closedMsg, n, {
        configurable: true, enumerable: true,
        get() {
          const A = activeAct();
          if (A && A.next === n) { const st = curStep(A); const g = actGoal(A); return (st && typeof st.closed === 'string' && st.closed) || (A.closed ? A.closed + (g && g.text ? ' (' + g.text + ')' : '') : '아직 할 일이 남았다.'); }
          return v;
        },
        set(x) { v = x; },
      });
    }
  };
  ST.ACTS = ACTS;
})();
