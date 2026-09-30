/* 끼임 · 제자리 지킴이
   ─ 뛰어내리면 다시 못 올라오는 웅덩이(가라앉는 칸)를 찾아 계단으로 잇는다 (넓은 대륙 · 던전 · 행성)
   ─ 사람 · 표지판 · 상자를 그 자리 땅높이에 세운다 (높은 마을에서 말을 못 걸던 것)
   ─ 벽 · 나무 · 사람에 박힌 주인공을 빼내고, 막힌 사람은 길을 비켜 준다
   ─ 이어하기 때 자리가 막혔거나 갇힌 곳이면 가까운 트인 곳으로 옮긴다
   ─ 메뉴의 「빠져나오기」 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, T = TL.T, PROP = TL.PROP, OB = G.objs, TS = TL.TS;
  const W = () => G.world, S = () => G.state;
  const NOSWIM = { swim: false, onStairs: false };
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  /** 걸어 설 수 있는 칸: 베어 낼 덤불 · 들 수 있는 돌은 치울 수 있으니 트인 것으로 본다 */
  function passI(m, i) {
    const p = PROP[m.ter[i]];
    if (!p || p.s || p.h) return false;
    if (m.solidExtra[i]) return false;
    const o = m.obj[i];
    if (o) { const d = OB.DEF[o]; if (d && d.solid && !(d.cut || d.lift === 1)) return false; }
    return true;
  }
  /** 걸음으로 이어진 칸 무리 (같은 높이 · 계단) */
  function label(m) {
    const N = m.w * m.h, Wd = m.w, Hh = m.h;
    const comp = new Int32Array(N).fill(-1), ok = new Uint8Array(N), size = [];
    for (let i = 0; i < N; i++) ok[i] = passI(m, i) ? 1 : 0;
    const st = new Int32Array(N); let nc = 0;
    for (let i0 = 0; i0 < N; i0++) {
      if (!ok[i0] || comp[i0] >= 0) continue;
      let sp = 0, n = 0; st[sp++] = i0; comp[i0] = nc;
      while (sp) {
        const i = st[--sp]; n++;
        const x = i % Wd, y = (i / Wd) | 0, s1 = m.ter[i] === T.STAIRS, h = m.hgt[i];
        for (let d = 0; d < 4; d++) {
          const nx = x + D4[d][0], ny = y + D4[d][1];
          if (nx < 0 || ny < 0 || nx >= Wd || ny >= Hh) continue;
          const j = ny * Wd + nx;
          if (!ok[j] || comp[j] >= 0) continue;
          if (!(s1 || m.ter[j] === T.STAIRS || m.hgt[j] === h)) continue;
          comp[j] = nc; st[sp++] = j;
        }
      }
      size.push(n); nc++;
    }
    return { comp, ok, size, nc };
  }
  /** 뛰어내리기: 무리 → 무리 (ent.js의 ledgeAhead · map.ledgeLanding과 같은 규칙) */
  function jumps(m, L) {
    const Wd = m.w, Hh = m.h, out = new Map();
    const add = (a, b) => { if (a === b) return; let s = out.get(a); if (!s) out.set(a, s = new Set()); s.add(b); };
    for (let y = 0; y < Hh; y++) for (let x = 0; x < Wd; x++) {
      const i = y * Wd + x;
      if (!L.ok[i] || m.ter[i] === T.STAIRS) continue;
      const z = m.hgt[i];
      for (let d = 0; d < 4; d++) {
        const dx = D4[d][0], dy = D4[d][1], fx = x + dx, fy = y + dy;
        if (fx < 0 || fy < 0 || fx >= Wd || fy >= Hh) continue;
        const fi = fy * Wd + fx;
        if (!(m.ter[fi] === T.CLIFF || m.hgt[fi] < z)) continue;
        for (let k = 1; k <= 5; k++) {
          const nx = x + dx * k, ny = y + dy * k;
          if (nx < 0 || ny < 0 || nx >= Wd || ny >= Hh) break;
          const j = ny * Wd + nx;
          if (m.ter[j] === T.CLIFF) continue;
          if (m.blocked(nx, ny, NOSWIM)) break;
          if (m.hgt[j] < z && L.ok[j]) add(L.comp[i], L.comp[j]);
          break;
        }
      }
    }
    return out;
  }
  /** 이 지도의 「돌아갈 수 있는 곳」: mains(칸 목록)에서 거꾸로 닿는 무리 · 거기서 뛰어내려 닿는 무리 */
  function analyze(m, mains, links) {
    const L = label(m), J = jumps(m, L);
    const addE = (a, b) => { if (a < 0 || b < 0 || a === b) return; let s = J.get(a); if (!s) J.set(a, s = new Set()); s.add(b); };
    for (const [a, b] of links || []) { const ca = L.comp[m.i(a[0], a[1])], cb = L.comp[m.i(b[0], b[1])]; addE(ca, cb); addE(cb, ca); }
    const rev = new Map();
    for (const [a, s] of J) for (const b of s) { let r = rev.get(b); if (!r) rev.set(b, r = new Set()); r.add(a); }
    const good = new Uint8Array(L.nc), q = [];
    for (const [x, y] of mains) { if (!m.inb(x, y)) continue; const c = L.comp[m.i(x, y)]; if (c >= 0 && !good[c]) { good[c] = 1; q.push(c); } }
    while (q.length) { const c = q.pop(); const r = rev.get(c); if (r) for (const a of r) if (!good[a]) { good[a] = 1; q.push(a); } }
    const reach = new Uint8Array(L.nc);
    for (let c = 0; c < L.nc; c++) if (good[c]) { reach[c] = 1; q.push(c); }
    while (q.length) { const c = q.pop(); const s = J.get(c); if (s) for (const b of s) if (!reach[b]) { reach[b] = 1; q.push(b); } }
    const sinks = []; for (let c = 0; c < L.nc; c++) if (reach[c] && !good[c]) sinks.push(c);
    return { L, J, good, reach, sinks };
  }
  /** 가라앉는 칸 무리를 계단으로 잇는다. 고친 수와 못 고친 무리를 돌려준다 */
  function fixSinks(m, mainsFn, linksFn) {
    let A = null, fixed = 0;
    for (let round = 0; round < 8; round++) {
      A = analyze(m, mainsFn(), linksFn ? linksFn() : null);
      if (!A.sinks.length) break;
      const { L, good } = A, isSink = new Uint8Array(L.nc);
      for (const c of A.sinks) isSink[c] = 1;
      const best = new Map();   // 무리 → 가장 좋은 이음
      const Wd = m.w;
      for (let i = 0; i < L.comp.length; i++) {
        const c = L.comp[i]; if (c < 0 || !isSink[c]) continue;
        const x = i % Wd, y = (i / Wd) | 0;
        // (가) 바로 위 절벽 면을 계단으로
        let k = 1; while (k <= 7 && m.T(x, y - k) === T.CLIFF) k++;
        if (k > 1 && m.inb(x, y - k)) {
          const u = m.i(x, y - k);
          if (L.ok[u] && good[L.comp[u]] && m.ter[u] !== T.STAIRS) {
            const two = m.T(x + 1, y - 1) === T.CLIFF && L.comp[m.i(x + 1, y)] === c && L.comp[m.i(x + 1, y - k)] === L.comp[u];
            const cost = k - (two ? 0.5 : 0);
            const b = best.get(c); if (!b || cost < b.cost) best.set(c, { cost, kind: 'col', x, y0: y - k + 1, y1: y - 1, two });
          }
        }
        // (나) 옆 칸이 돌아갈 수 있는 땅이면 이 칸을 계단으로
        for (let d = 0; d < 4; d++) {
          const nx = x + D4[d][0], ny = y + D4[d][1]; if (!m.inb(nx, ny)) continue;
          const j = m.i(nx, ny);
          if (!L.ok[j] || !good[L.comp[j]]) continue;
          const cost = 10 + Math.abs(m.hgt[j] - m.hgt[i]);
          const b = best.get(c); if (!b || cost < b.cost) best.set(c, { cost, kind: 'adj', i });
        }
      }
      if (!best.size) break;
      for (const b of best.values()) {
        if (b.kind === 'col') {
          for (let yy = b.y0; yy <= b.y1; yy++) for (let dx = 0; dx < (b.two ? 2 : 1); dx++) { const i = m.i(b.x + dx, yy); m.ter[i] = T.STAIRS; m.obj[i] = 0; m.solidExtra[i] = 0; }
        } else { m.ter[b.i] = T.STAIRS; m.obj[b.i] = 0; }
        fixed++;
      }
    }
    // 이을 곳이 없는 작은 웅덩이: 바위로 메워 뛰어내릴 수 없게
    if (A && A.sinks.length) {
      const small = new Set(A.sinks.filter((c) => A.L.size[c] <= 16));
      if (small.size) {
        for (let i = 0; i < A.L.comp.length; i++) if (small.has(A.L.comp[i]) && m.ter[i] !== T.STAIRS) { m.obj[i] = OB.O.ROCK; fixed++; }
        A = analyze(m, mainsFn(), linksFn ? linksFn() : null);
      }
    }
    if (m.dirtyAll) m.dirtyAll();
    return { fixed, left: A ? A.sinks.length : 0, A };
  }

  /* ───────── 지도마다 한 번: 짓자마자 고친다 ───────── */
  function mainsOf(m) {
    const out = [];
    if (m.overworld && G.ow) for (const t of Object.values(G.ow.towns)) if (t.plaza) out.push([t.plaza.x, t.plaza.y]);
    if (m.entry) out.push([Math.floor(m.entry.x / TS), Math.floor((m.entry.y - 2) / TS)]);
    if (!m.overworld) for (const w of m.warps || []) for (const [dx, dy] of [[0, 0], [0, 1], [0, -1]]) out.push([w.x + dx, w.y + dy]);
    return out;
  }
  function linksOf(m) {
    const out = [];
    for (const sl of m.stairLinks || []) {
      const pick = (p) => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const x = p[0] + dx, y = p[1] + dy; if (m.inb(x, y) && passI(m, m.i(x, y))) return [x, y]; } return p; };
      out.push([pick(sl.pa), pick(sl.pb)]);
    }
    return out;
  }
  const checked = new WeakSet();
  const get0 = G.build.get;
  G.build.get = function (id) {
    const m = get0.apply(this, arguments);
    if (m && !checked.has(m) && !m.indoor && (m.overworld || m.dungeon || m.entry)) {
      checked.add(m);
      try {
        const r = fixSinks(m, () => mainsOf(m), () => linksOf(m));
        m.san = r.A; m.sanFixed = r.fixed; m.sanLeft = r.left;
      } catch (e) { console.error('sanity', id, e); }
    }
    return m;
  };
  /** 지금 모양으로 다시 본다 (벽이 부서지거나 길이 생긴 뒤) */
  function fresh(m) {
    if (!m || m.indoor) return null;
    if (!m.san || m.sanT == null || G.world.t - m.sanT > 20) { try { m.san = analyze(m, mainsOf(m), linksOf(m)); m.sanT = G.world.t; } catch (e) { return null; } }
    return m.san;
  }

  /* ───────── 땅높이에 세우기 ───────── */
  function zOf(m, e) {
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - (e.bh || 6) / 2) / TS);
    return m.H(tx, ty);
  }
  const add0 = G.world.add;
  G.world.add = function (e) {
    const m = G.world.map;
    if (m && e && e !== G.world.player && !e.fly && !e.keepZ && !e.z && e.x != null && (e.npc || e.prop || e.use || e.kind === 'decor' || e.kind === 'stairlink')) {
      const t = m.T(Math.floor(e.x / TS), Math.floor((e.y - 3) / TS));
      if (t !== T.STAIRS) e.z = zOf(m, e);
    }
    return add0.call(this, e);
  };
  // 말 걸기 · 열기: 가만히 선 것은 발밑 땅높이로 본다 (계단 위에서는 높이를 따지지 않는다)
  const cand0 = G.interact.candidates;
  G.interact.candidates = function (p) {
    const m = W().map;
    if (!m) return cand0(p);
    for (const e of W().ents) {
      if (e === p || e.dead || !e.use || e.fly || e.keepZ || e.kind === 'foe' || e.boss) continue;
      e.z = p.onStairs ? (p.z || 0) : zOf(m, e);
    }
    return cand0(p);
  };

  /* ───────── 사람 · 소품이 막힌 칸에 서 있으면 가까운 트인 칸으로 ───────── */
  function freeTile(m, tx, ty) { return m.inb(tx, ty) && passI(m, m.i(tx, ty)) && !m.blocked(tx, ty, NOSWIM); }
  const SWIM = { swim: true };
  function nudge(m, e, r) {
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 3) / TS);
    if (!m.blocked(tx, ty, e.swim || e.inWater ? SWIM : NOSWIM)) return false;     // 물속이 제자리인 이(e.swim · e.inWater)는 그대로
    const z0 = m.H(tx, ty);
    let best = null, bd = 1e9;
    for (let dy = -(r || 3); dy <= (r || 3); dy++) for (let dx = -(r || 3); dx <= (r || 3); dx++) {
      const x = tx + dx, y = ty + dy; if (!freeTile(m, x, y)) continue;
      const d = dx * dx + dy * dy + Math.abs(m.H(x, y) - z0) * 3 + (dy < 0 ? 0.5 : 0);
      if (d < bd) { bd = d; best = [x, y]; }
    }
    if (!best) return false;
    e.x = best[0] * TS + 8; e.y = best[1] * TS + 12; if (e.home) e.home = { x: e.x, y: e.y };
    e.z = zOf(m, e);
    return true;
  }
  function spread(m, e, others) {
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 3) / TS), z0 = m.H(tx, ty);
    let best = null, bd = 1e9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      if (!dx && !dy) continue;
      const x = tx + dx, y = ty + dy; if (!freeTile(m, x, y) || m.H(x, y) !== z0) continue;
      const px = x * TS + 8, py = y * TS + 12;
      if (others.some((o) => o !== e && !o.dead && Math.abs(o.x - px) < 14 && Math.abs(o.y - py) < 12)) continue;
      if (W().propBlock(px - 5, py - 6, 10, 6, e)) continue;
      const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [px, py]; }
    }
    if (!best) return false;
    e.x = best[0]; e.y = best[1]; if (e.home) e.home = { x: e.x, y: e.y };
    return true;
  }
  const pop0 = G.build.populate;
  G.build.populate = function (m) {
    const r = pop0.apply(this, arguments);
    const Pp = G.props, Wd = W(), p = Wd.player;
    // 같은 사람이 둘: 먼저 선 이를 지운다 · 따라오는 동료와 서 있는 본인이 겹치면 따라오는 쪽을 쉰다
    const byCid = new Map();
    for (const e of Wd.ents) {
      if (e.dead || !e.npc || !e.cid || e.follower) continue;
      const o = byCid.get(e.cid); if (o) o.dead = true; byCid.set(e.cid, e);
    }
    for (const e of Wd.ents) if (e.follower && !e.dead && byCid.has(e.cid)) e.dead = true;
    for (const e of Wd.ents) {
      if (e === p || e.dead || e.fly || e.script || e.vision || e.follower) continue;
      if (e.npc || e instanceof Pp.Chest) nudge(m, e, 3);
    }
    // 앞(남쪽)에서 다가설 수 없는 상자 · 표지판은 옆이나 뒤에서도 열고 읽게
    for (const e of Wd.ents) {
      if (e.dead || e.anyDir || !(e instanceof Pp.Chest || e instanceof Pp.Sign)) continue;
      const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 3) / TS);
      if (!freeTile(m, tx, ty + 1) || m.H(tx, ty + 1) !== m.H(tx, ty) || Wd.propBlock(tx * TS + 3, (ty + 1) * TS + 6, 10, 6, e)) e.anyDir = true;
    }
    // 한 칸에 겹쳐 선 사람: 뒤에 선 이를 옆 칸으로
    const ppl = Wd.ents.filter((e) => e.npc && !e.dead && !e.follower && e !== p && !e.script);
    for (let a = 1; a < ppl.length; a++) for (let b = 0; b < a; b++) {
      if (Math.abs(ppl[a].x - ppl[b].x) < 12 && Math.abs(ppl[a].y - ppl[b].y) < 10) { spread(m, ppl[a], ppl); break; }
    }
    if (p) Wd.arrive = { map: m.id, x: p.x, y: p.y };
    return r;
  };

  /* ───────── 막아선 사람은 비켜 준다 ───────── */
  const pb0 = G.world.propBlock;
  G.world.propBlock = function (x, y, w, h, who) {
    const Wd = G.world;
    if (who && who === Wd.player) {
      for (const e of Wd.ents) {
        if (e === who || !e.solid || e.dead || !e.blockBox) continue;
        if (e.yieldT > 0) continue;
        const b = e.blockBox();
        if (b && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y) return true;
      }
      return false;
    }
    return pb0.apply(this, arguments);
  };
  const npcUpd = G.props.NPC.prototype.update;
  G.props.NPC.prototype.update = function (dt, Wd) {
    npcUpd.apply(this, arguments);
    if (this.yieldT > 0) this.yieldT -= dt;
    const p = Wd.player;
    if (!p || G.script.running) return;
    const dx = this.x - p.x, dy = this.y - p.y;
    if (Math.abs(dx) < 16 && Math.abs(dy) < 12 && (p.pushT || 0) > 0.25 && (p.vx * dx + p.vy * dy) > 0) {
      if (!(this.yieldT > 0) && G.cine && G.cine.bubble && Math.random() < 0.5) G.cine.bubble(this, U.pick(['아, 지나가세요', '어이쿠, 먼저 가요', '비켜 줄게요']), { life: 1.4 });
      this.yieldT = 1.6;
    }
  };

  /* ───────── 박힌 주인공 빼내기 ───────── */
  function boxOk(m, p, x, y, z) {
    return m.boxFree(x - p.bw / 2, y - p.bh, p.bw, p.bh, z, p) && !W().propBlock(x - p.bw / 2, y - p.bh, p.bw, p.bh, p);
  }
  function unembed(p, m) {
    for (let r = 2; r <= 40; r += 2) for (let a = 0; a < 16; a++) {
      const x = p.x + Math.cos(a / 16 * Math.PI * 2) * r, y = p.y + Math.sin(a / 16 * Math.PI * 2) * r;
      const tx = Math.floor(x / TS), ty = Math.floor((y - 3) / TS);
      if (!m.inb(tx, ty)) continue;
      const z = m.T(tx, ty) === T.STAIRS ? p.z : m.H(tx, ty);
      if (Math.abs(z - p.z) > 0 && r < 12) continue;
      if (boxOk(m, p, x, y, z)) { p.x = x; p.y = y; G.ent.settle(m, p); p.safe = { x: p.x, y: p.y, z: p.z }; return true; }
    }
    return toGood(p, m, 30);
  }
  /** 가까운 「돌아갈 수 있는 땅」으로 (칸 단위 넓게 찾기) */
  function toGood(p, m, R) {
    const A = fresh(m);
    const tx0 = Math.floor(p.x / TS), ty0 = Math.floor((p.y - 3) / TS);
    let best = null, bd = 1e9;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = tx0 + dx, y = ty0 + dy; if (!m.inb(x, y)) continue;
      const i = m.i(x, y);
      if (!passI(m, i) || m.blocked(x, y, NOSWIM) || m.ter[i] === T.STAIRS) continue;
      if (A) { const c = A.L.comp[i]; if (c < 0 || !A.good[c]) continue; }
      const d = dx * dx + dy * dy; if (d >= bd) continue;
      const px = x * TS + 8, py = y * TS + 12;
      if (!boxOk(m, p, px, py, m.H(x, y))) continue;
      bd = d; best = [px, py];
    }
    if (!best) return false;
    p.x = best[0]; p.y = best[1]; G.ent.settle(m, p); p.safe = { x: p.x, y: p.y, z: p.z };
    if (G.world.snap) G.world.snap();
    return true;
  }
  const pu0 = G.Player.prototype.update;
  G.Player.prototype.update = function (dt, Wd) {
    pu0.apply(this, arguments);
    const m = Wd && Wd.map;
    if (!m || this !== Wd.player || this.noClip || this.hook || this.jump || this.state === 'jump' || this.state === 'fall' || this.state === 'dead' || G.script.running) { this.embT = 0; return; }
    this.embCk = (this.embCk || 0) - dt; if (this.embCk > 0) return; this.embCk = 0.1;
    if (boxOk(m, this, this.x, this.y, this.z)) { this.embT = 0; return; }
    this.embT = (this.embT || 0) + 0.1;
    if (this.embT > 0.4) { this.embT = 0; unembed(this, m); }
  };

  /** 이 자리가 갇힌 곳인가: 닿는 칸이 작고 나갈 문이 없으면 */
  function trapped(m, p) {
    const A = fresh(m); if (!A) return false;
    const i = m.i(Math.floor(p.x / TS), Math.floor((p.y - 3) / TS)), c = A.L.comp[i];
    if (c < 0) return true;
    if (A.good[c]) return false;
    let tot = 0; const seen = new Set([c]), q = [c];
    while (q.length) { const k = q.pop(); tot += A.L.size[k]; if (tot > 400) return false; const s = A.J.get(k); if (s) for (const b of s) if (!seen.has(b)) { seen.add(b); q.push(b); } }
    for (const w of m.warps || []) { const wc = A.L.comp[m.i(w.x, Math.min(m.h - 1, w.y + 1))]; if (seen.has(wc)) return false; }
    return true;
  }

  /* ───────── 이어하기: 막힌 자리 · 갇힌 곳이면 옮긴다 ───────── */
  // game.js는 이 파일 뒤에 붙으므로, 다 불러온 뒤에 감싼다
  Promise.resolve().then(() => { const cont0 = G.game.continueGame; G.game.continueGame = function (save) {
    const r = cont0.apply(this, arguments);
    try {
      let Wd = W(), p = Wd.player, m = Wd.map;
      // 무대(주인공 없이 다른 곳을 비추는 방)에서 이어지면: 마지막으로 걷던 대륙 자리로
      if (m && m.stage) {
        const s = S(), lw = s.lastWorld;
        if (lw && lw.x != null) G.game.goto('world', Math.floor(lw.x) * TS + 8, Math.floor(lw.y) * TS + 12, 'down', { fresh: true });
        else { const rp = s.respawn || { map: 'world', x: (G.ow.towns.green.x + 17) * TS + 8, y: (G.ow.towns.green.y + 12) * TS + 12 }; G.game.goto(rp.map, rp.x, rp.y, 'down', { fresh: true }); }
        Wd = W(); p = Wd.player; m = Wd.map;
      }
      if (p && m) {
        if (!boxOk(m, p, p.x, p.y, p.z)) unembed(p, m);
        if (!m.indoor && trapped(m, p)) toGood(p, m, 80);
        const s = S(); s.x = p.x; s.y = p.y; s.map = m.id;
      }
    } catch (e) { console.error('continue check', e); }
    return r;
  }; });

  /* ───────── 옛 저장: 이름이 겹쳤던 방 ───────── */
  // 그린 · 그레이 쉼터(g_inn) · 잡화점(g_shop), 레드 · 무지개 쉼터(r_inn)가 한 이름을 나눠 쓰던 때의 기록:
  // 마지막으로 걸었던 대륙 자리에서 더 가까운 마을의 방으로 돌려놓는다
  if (G.prog && G.prog.migrate) {
    const mg0 = G.prog.migrate;
    const PAIRS = { g_inn: [['green', 'g_inn'], ['gray', 'gy_inn']], g_shop: [['green', 'g_shop'], ['gray', 'gy_shop']], r_inn: [['red', 'r_inn'], ['rainbow', 'rb_inn']] };
    G.prog.migrate = function (s) {
      s = mg0(s);
      if (s && !s.roomFix1) {
        s.roomFix1 = true;
        const lw = s.lastWorld, T0 = G.ow && G.ow.towns;
        const pick = (id) => {
          const pr = PAIRS[id]; if (!pr || !lw || !T0) return id;
          let best = id, bd = 1e9;
          for (const [tn, rid] of pr) { const t = T0[tn]; if (!t) continue; const d = U.dist(lw.x, lw.y, t.x + t.w / 2, t.y + t.h / 2); if (d < bd) { bd = d; best = rid; } }
          return best;
        };
        if (s.map) s.map = pick(s.map);
        if (s.respawn && s.respawn.map) s.respawn.map = pick(s.respawn.map);
      }
      return s;
    };
    if (G.story && G.story.start) { const st0 = G.story.start; G.story.start = function (s) { s.roomFix1 = true; return st0.apply(this, arguments); }; }
  }

  /* ───────── 빠져나오기 ───────── */
  async function escape(c) {
    const Wd = W(), p = Wd.player, m = Wd.map;
    if (!p || !m) return false;
    const stuck = !boxOk(m, p, p.x, p.y, p.z) || (!m.indoor && trapped(m, p));
    await c.fade(true, { sec: 0.25 });
    let done = false;
    if (stuck) done = toGood(p, m, 60) || unembed(p, m);
    if (!done) {
      const a = Wd.arrive && Wd.arrive.map === m.id ? Wd.arrive : null;
      if (a && U.dist(a.x, a.y, p.x, p.y) > 24) { p.x = a.x; p.y = a.y; G.ent.settle(m, p); done = true; }
      else if (m.entry) { p.x = m.entry.x; p.y = m.entry.y; G.ent.settle(m, p); done = true; }
      else { const rp = S().respawn; if (rp) { G.game.goto(rp.map, rp.x, rp.y, 'down'); done = true; } }
      if (done && !boxOk(m, W().player, W().player.x, W().player.y, W().player.z)) unembed(W().player, W().map);
    }
    const pl = W().player; pl.safe = { x: pl.x, y: pl.y, z: pl.z }; pl.setState('idle');
    if (G.world.snap) G.world.snap();
    await c.fade(false, { sec: 0.35 });
    return done;
  }
  G.sanity = { label, jumps, analyze, fixSinks, passI, trapped, toGood, unembed, escape, fresh, mainsOf, linksOf };
})();
