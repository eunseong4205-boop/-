/* 무기 이펙트 (1) — 장비 · 기본 공격 · 주문
   · 활 열일곱 자루마다 다른 화살: 촉 모양 · 깃 빛깔 · 날아가는 꼬리(깃털 · 바람 띠 · 눈송이 · 독 방울 · 불티 · 메아리 고리 · 별가루 …) ·
     당길 때 모이는 빛 · 쏘는 순간의 번쩍임 · 맞은 자리의 터짐이 다르다
   · 마도구 열두 개마다 다른 마법진(잎 · 거품 · 불꽃 테 · 룬 · 육각 · 번개 테 · 물결 · 거울 · 초승달 · 오각별 · 혼돈 · 근원)과 지팡이 끝 빛
   · 주문 열셋도 저마다: 화염구는 혀를 날름거리는 불덩이, 얼음창은 깎인 얼음 창, 번개는 갈라지는 줄기, 치유는 오르는 잎, 순간이동은 흩어졌다 모이는 빛 …
   · 검 스물일곱 자루: 날 모양(불꽃 · 얼음 · 폭풍 · 심연 · 성스러움 · 프리즘 · 하늘 · 피 · 채찍 · 대검 …)마다 휘두를 때의 꼬리와 맞힌 자리가 다르다
   · 주인공의 몸짓: 스킬을 쓰는 동안 든 무기에 맞는 자세(예전엔 그냥 서 있었다) — 활은 당기고, 마법은 손을 든다
   수치(피해 · 범위 · 시간)는 하나도 바꾸지 않는다 — 그리기와 입자만 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, C = G.combat, D = G.data, F = G.fx, SN = G.stance;
  const W = () => G.world, S = () => G.state;
  // 이펙트만의 난수 — 그리기가 게임의 난수(치명타 · 흩어짐 …)를 건드리지 않게
  const R = (() => { let x = 0x2f6b9e35; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; }; })();
  const TAU = Math.PI * 2;
  const rnd = (a, b) => a + R() * (b - a), pick = (a) => a[(R() * a.length) | 0];
  const safe = (f, ...a) => { try { return f(...a); } catch (e) { if (!safe.n) { safe.n = 1; console.error('[vfx]', e); } } };

  /* ═════════ 붓 ═════════ */
  const P = (o) => F.part(o);
  /** 베인 자국 (fx.slash와 같지만 게임 난수를 쓰지 않는다) */
  const slash = (x, y, ang, col, len) => { F.slashes.push({ x, y, a: ang + (R() - 0.5) * 0.5 + Math.PI / 2, col: col || '#ffffff', len: len || 12, t: 0, life: 0.13 }); if (F.slashes.length > 24) F.slashes.shift(); };
  const GL = (x, y, r, col, life, o) => F.glowAt(x, y, r, col, life, o);
  /** 한 점에서 터지는 입자 묶음 */
  function burst(x, y, n, o) {
    for (let i = 0; i < n; i++) {
      const a = o.a0 != null ? o.a0 + (R() - 0.5) * (o.spread || 1) : R() * TAU, s = (o.sp == null ? 60 : o.sp) * (0.35 + R() * 0.8);
      const q = { x: x + (o.jx ? (R() - 0.5) * o.jx : 0), y: y + (o.jy ? (R() - 0.5) * o.jy : 0), z: o.z == null ? 6 : o.z, vx: Math.cos(a) * s, vy: Math.sin(a) * s * (o.flat == null ? 0.65 : o.flat), vz: (o.vz == null ? 20 : o.vz) + R() * (o.vzr == null ? 20 : o.vzr), g: o.g == null ? 80 : o.g, life: (o.life || 0.5) * (0.6 + R() * 0.6), size: o.size || 1, drag: o.drag == null ? 2 : o.drag };
      if (o.cols) q.cols = o.cols; else q.col = Array.isArray(o.col) ? pick(o.col) : (o.col || '#ffffff');
      if (o.shape) q.shape = o.shape; if (o.add) q.add = true; if (o.glow) q.glow = true; if (o.spin) { q.spin = rnd(-o.spin, o.spin); q.rot = R() * TAU; } if (o.grow) q.grow = o.grow; if (o.tw) q.tw = o.tw; if (o.flutter) q.flutter = true;
      if (o.shape === 'rune') q.glyph = (R() * 8) | 0; if (o.len) q.len = o.len;
      P(q);
    }
  }
  /** 둘레로 뻗는 빛살 */
  function rays(x, y, n, len, col, o) {
    o = o || {}; const a0 = o.a0 == null ? R() * TAU : o.a0;
    for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU + (o.jit ? (R() - 0.5) * o.jit : 0), L = len * (o.var ? 0.6 + R() * 0.4 : 1); F.line({ kind: 'beam', x0: x + Math.cos(a) * (o.r0 || 2), y0: y + Math.sin(a) * (o.r0 || 2) * 0.7, x1: x + Math.cos(a) * L, y1: y + Math.sin(a) * L * 0.7, col, w: o.w || 2, life: o.life || 0.25, glow: true }); }
  }
  /** 입자 하나 (그 자리에서) */
  const dot = (x, y, z, col, o) => P(Object.assign({ x, y, z, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, col, size: 1 }, o));
  const ring = (x, y, col, r, life, w) => F.ring(x, y, col, r, life, w);
  const decal = (o) => F.decal(o);
  const hsl = (h, s, l) => 'hsl(' + Math.round(((h % 360) + 360) % 360) + ',' + s + '%,' + l + '%)';

  /* ═════════ 지금 무엇을 쓰는 중인가 (스킬 · 필살기 · 주문) ═════════
     그 안에서 쏜 화살 · 주문 · 번개 · 표시에 이름표를 붙여, 그것만의 모양으로 그린다 */
  const CTX = { skill: null, sp: null, spell: null, spellF: -1, frame: 0 };
  const VX = G.vfx = { CTX, SKV: {}, SPV: {}, R, slash, burst, rays, dot, ring, decal, GL, hsl, rnd, pick, safe };
  const withCtx = (k, v, fn, self, args) => { const was = CTX[k]; CTX[k] = v; try { return fn.apply(self, args); } finally { CTX[k] = was; } };
  // 스킬: 거는 순간 · 상태 'skill' 동안
  for (const id of Object.keys(SN.DO)) {
    const f = SN.DO[id];
    SN.DO[id] = function (p, s, d) {
      return withCtx('skill', id, () => {
        const V = VX.SKV[id];
        if (V && V.pre) safe(V.pre, p, s, d);
        const r = f.apply(this, arguments);
        if (V && V.post) safe(V.post, p, s, d);
        return r;
      }, this, arguments);
    };
  }
  const skU0 = C.actions.skill.update;
  C.actions.skill.update = function (p, dt) {
    const K = p.skill, id = K && K.id;
    const r = withCtx('skill', id, skU0, this, arguments);
    const V = id && VX.SKV[id];
    if (V && V.tick && K) safe(V.tick, p, K, dt);
    if (!p.skill && p.vjz) { p.jz = 0; p.vjz = false; }
    return r;
  };
  // 필살기
  const spS0 = G.specials.start, spU0 = G.specials.update;
  G.specials.start = function (p, id) {
    return withCtx('sp', id, () => { const r = spS0.apply(this, arguments); const V = VX.SPV[id]; if (V && V.start && p.spx) safe(V.start, p, p.spx); return r; }, this, arguments);
  };
  G.specials.update = function (p, dt) {
    const X = p.spx, id = X && X.id;
    const r = withCtx('sp', id, spU0, this, arguments);
    const V = id && VX.SPV[id];
    if (V && V.tick && X && p.spx === X) safe(V.tick, p, X, dt);
    if (!p.spx && p.vjz) { p.jz = 0; p.vjz = false; }
    return r;
  };
  // 시간표 · 따로 움직이는 것에도 이름표가 따라간다
  const after0 = C.after;
  C.after = function (t, fn) {
    const sk = CTX.skill, sp = CTX.sp;
    if (!sk && !sp) return after0.apply(this, arguments);
    return after0.call(this, t, function () { const a = CTX.skill, b = CTX.sp; CTX.skill = sk; CTX.sp = sp; try { return fn.apply(this, arguments); } finally { CTX.skill = a; CTX.sp = b; } });
  };
  const add0 = G.world.add;
  G.world.add = function (e) {
    if (e && (CTX.skill || CTX.sp) && !(e instanceof C.Shot) && typeof e.update === 'function' && !e._vctx) {
      const sk = CTX.skill, sp = CTX.sp, u0 = e.update; e._vctx = sk || sp;
      e.update = function () { const a = CTX.skill, b = CTX.sp; CTX.skill = sk; CTX.sp = sp; try { return u0.apply(this, arguments); } finally { CTX.skill = a; CTX.sp = b; } };
      // 스킬 · 필살기가 만든 효과 덩어리(따라도는 칼날 · 구슬 · 장판 …)를 그것만의 모양으로 꾸민다 (vfx2.js)
      const V = sp ? VX.SPV[sp] : VX.SKV[sk];
      if (V && V.ent) safe(V.ent, e);
    }
    return add0.apply(this, arguments);
  };
  // 주문: 거는 그 순간(같은 틀)에 나온 것만
  const cast0 = C.onCast;
  C.onCast = function (p, id) { if (cast0) cast0.apply(this, arguments); CTX.spell = id; CTX.spellF = CTX.frame; const V = SPELL[id]; if (V && V.cast) safe(V.cast, p, id); };
  const spellNow = () => (CTX.spellF === CTX.frame ? CTX.spell : null);

  /* ═════════ 번개 · 떨어질 자리: 만들어지는 순간 이름표 ═════════ */
  function patchArr(key, deco) {
    let A = C[key];
    const fix = (arr) => { arr.push = function () { for (const b of arguments) safe(deco, b); return Array.prototype.push.apply(this, arguments); }; return arr; };
    A = fix(A || []);
    Object.defineProperty(C, key, { configurable: true, get: () => A, set: (v) => { A = fix(v); } });
  }
  const BOLTCOL = { a_chain: '#8ad8ff', a_lance: '#fff8a8', a_eclipse: '#c49bff', thunder: '#ffe066', tempest: '#a8c8ff', judge: '#ffffff', storm: '#ffe066' };
  patchArr('bolts', (b) => {
    const k = CTX.skill || CTX.sp || spellNow() || '';
    b.col = BOLTCOL[k] || (k === 'bolt' ? focusCol('#ffe066') : '#ffe066');
    b.big = (b.y1 - b.y0) > 70 && Math.abs(b.x1 - b.x0) < 40;   // 하늘에서 내리꽂는 벼락
    b.ctx = k;
    // 닿는 자리: 번쩍 · 불꽃 · (하늘 벼락이면) 그을음
    const x = b.x1, y = b.y1;
    GL(x, y, b.big ? 36 : 20, b.col, 0.3, { pulse: true });
    burst(x, y + 8, b.big ? 10 : 5, { shape: 'spark', col: [b.col, '#ffffff'], sp: b.big ? 130 : 90, z: 8, vz: 40, g: 200, life: 0.3, add: true });
    if (b.big) { decal({ kind: 'scorch', x, y: y + 8, r: 9, life: 1.4, col: b.col }); ring(x, y + 8, b.col, 18, 0.3, 2); }
  });
  patchArr('marks', (mk) => {
    const k = CTX.skill || CTX.sp || spellNow() || '';
    mk.ctx = k;
    if (k === 'meteor') meteorFall(mk.x, mk.y, mk.life, '#ff7a4a', 8);
  });
  /** 하늘에서 떨어지는 불덩이 (표시가 끝나는 때에 닿는다) */
  function meteorFall(x, y, life, col, r) {
    const t0 = Math.max(0.05, life - 0.32), fall = Math.min(0.32, life);
    C.after(t0, () => {
      W().add(new FallFx({ x, y, life: fall, col, r }));
    });
  }
  class FallFx extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'vfx', solid: false, sortBias: 40, t: 0 }, o)); }
    update(dt) { this.t += dt; if (this.t >= this.life) { this.dead = true; return; } const k = this.t / this.life, h = 110 * (1 - k); burst(this.x + 30 * (1 - k), this.y - 2, 2, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a', '#5a3a3a'], sp: 10, z: h, vz: 10, g: 0, life: 0.35, size: 2 }); }
    draw(g, cx, cy) { const k = this.t / this.life, h = 110 * (1 - k), x = Math.round(this.x - cx + 30 * (1 - k)), y = Math.round(this.y - cy - h); g.save(); g.globalAlpha = 0.5; g.strokeStyle = this.col; g.lineWidth = this.r; g.beginPath(); g.moveTo(x + 18, y - 26); g.lineTo(x, y); g.stroke(); g.globalAlpha = 1; g.fillStyle = this.col; g.beginPath(); g.arc(x, y, this.r * 0.8, 0, TAU); g.fill(); g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(x - 1, y - 1, this.r * 0.4, 0, TAU); g.fill(); g.restore(); }
  }
  VX.FallFx = FallFx; VX.meteorFall = meteorFall;

  /* ═════════ 번개 그리기: 굵은 빛 · 흰 속심 · 곁가지 · 끝의 번쩍임 ═════════ */
  C.drawBolts = function (g, cx, cy) {
    for (const mk of C.marks) {
      const k = Math.min(1, mk.t / mk.life), x = Math.round(mk.x - cx), y = Math.round(mk.y - cy), r = mk.r * (1.4 - k * 0.4);
      g.globalAlpha = 0.25 + k * 0.45; g.strokeStyle = mk.col; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, r, r * 0.5, 0, 0, TAU); g.stroke();
      g.globalAlpha = 0.12 + k * 0.2; g.fillStyle = mk.col; g.fill();
      // 좁혀 드는 안쪽 고리 · 십자
      g.globalAlpha = 0.5 * k; g.beginPath(); g.ellipse(x, y, r * (1 - k) + 2, (r * (1 - k) + 2) * 0.5, 0, 0, TAU); g.stroke();
      g.fillRect(x - Math.round(r * 0.6), y, Math.round(r * 1.2), 1); g.globalAlpha = 1;
    }
    for (const b of C.bolts) {
      const col = b.col || '#ffe066', f = Math.max(0, 1 - b.t / 0.25), dx = b.x1 - b.x0, dy = b.y1 - b.y0, L = Math.hypot(dx, dy) || 1, n = Math.max(4, Math.min(12, Math.round(L / 12)));
      const seed = (b.seed = b.seed || R() * 1000) + Math.floor(b.t * 40);
      const pts = [[b.x0 - cx, b.y0 - cy]];
      for (let i = 1; i < n; i++) { const kk = i / n, off = Math.sin(seed * 3.1 + i * 7.7) * (b.big ? 9 : 6); pts.push([b.x0 + dx * kk - cx - dy / L * off, b.y0 + dy * kk - cy + dx / L * off]); }
      pts.push([b.x1 - cx, b.y1 - cy]);
      const st = (w, c, a) => { g.globalAlpha = a; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke(); };
      st(b.big ? 5 : 3, col, 0.45 * f); st(b.t < 0.08 ? 2 : 1, '#ffffff', f);
      // 곁가지
      g.lineWidth = 1; g.strokeStyle = col;
      for (let i = 2; i < pts.length - 1; i += 2) { const q = pts[i], an = Math.sin(seed + i * 3) * 2.6; g.globalAlpha = 0.7 * f; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + Math.cos(an) * 6, q[1] + Math.sin(an) * 6); g.lineTo(q[0] + Math.cos(an + 0.6) * 10, q[1] + Math.sin(an + 0.6) * 10); g.stroke(); }
      g.globalAlpha = 1;
    }
  };

  /* ═════════ 날아가는 것 (화살 · 주문 · 스킬 탄) ═════════ */
  const VIS = VX.VIS = {};
  const Shot = C.Shot;
  const vOf = (sh) => sh.vis && VIS[sh.vis];
  const shD0 = Shot.prototype.draw, shU0 = Shot.prototype.update, shH0 = Shot.prototype.checkHits, shX0 = Shot.prototype.die;
  Shot.prototype.draw = function (g, cx, cy) {
    const V = vOf(this);
    if (!V) return shD0.apply(this, arguments);
    const x = Math.round(this.x - cx), y = Math.round(this.y - cy - this.zoff), a = Math.atan2(this.vy, this.vx);
    if (this._hist && V.ribbon) drawRibbon(g, this, cx, cy, V.ribbon(this));
    if (V.keep) shD0.apply(this, arguments);
    if (V.draw) V.draw(g, x, y, a, this);
    if (VX.tierDraw) VX.tierDraw(g, x, y, a, this);   // 등급의 빛 (vfx2.js)
  };
  Shot.prototype.update = function () {
    const r = shU0.apply(this, arguments);
    const V = vOf(this);
    if (V && !this.dead) {
      if (V.hist) { const h = this._hist || (this._hist = []); h.push([this.x, this.y - this.zoff]); if (h.length > V.hist) h.shift(); }
      if (V.trail) safe(V.trail, this);
      if (VX.tierTrail) safe(VX.tierTrail, this);
      if (V.light && !this.glowR) this.glowR = V.light;
    }
    return r;
  };
  Shot.prototype.checkHits = function () {
    const n0 = this.hit ? this.hit.size : 0;
    const r = shH0.apply(this, arguments);
    if (this.owner === 'player' && this.hit && this.hit.size > n0) { const V = vOf(this); if (V) { let last = null; for (const e of this.hit) last = e; if (V.hit) safe(V.hit, this, last); if (VX.tierHit) safe(VX.tierHit, this, last); } }
    return r;
  };
  Shot.prototype.die = function () {
    if (!this.dead && !this._vend) { this._vend = true; const V = vOf(this); if (V && V.end) safe(V.end, this); }
    return shX0.apply(this, arguments);
  };
  /** 지나온 길을 띠로 */
  function drawRibbon(g, sh, cx, cy, o) {
    const h = sh._hist; if (!o || h.length < 2) return;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    for (let pass = 0; pass < (o.core === false ? 1 : 2); pass++) {
      g.strokeStyle = pass ? (o.core || '#ffffff') : o.col;
      for (let i = 1; i < h.length; i++) {
        const k = i / h.length; g.globalAlpha = (pass ? 0.8 : o.a || 0.55) * k;
        g.lineWidth = Math.max(1, (pass ? Math.max(1, o.w * 0.35) : o.w) * (o.taper === false ? 1 : k));
        const ox = o.wave ? Math.sin(i * 0.9 + sh.t * 30) * o.wave : 0;
        g.beginPath(); g.moveTo(h[i - 1][0] - cx, h[i - 1][1] - cy + (o.wave ? Math.sin((i - 1) * 0.9 + sh.t * 30) * o.wave : 0)); g.lineTo(h[i][0] - cx, h[i][1] - cy + ox); g.stroke();
      }
    }
    g.restore();
  }
  // 이름표 붙이기
  const shoot0 = C.onShoot;
  C.onShoot = function (o) {
    o = (shoot0 ? shoot0.apply(this, arguments) : null) || o;
    if (!o || o.owner === 'foe' || o.foe || o.vis) return o;
    const p = W().player, s = S();
    const sp = o.spId || CTX.sp;
    let sk = CTX.skill;
    if (!sk && o.skill && p) sk = p.barrageT > 0 ? 'a_barrage' : p.volleyT > 0 ? 'a_volley2' : null;
    const isArrow = o.kind === 'arrow' || o.src === 'arrow';
    if (sp && VIS['sp_' + sp]) o.vis = 'sp_' + sp;
    else if (sk && VIS['sk_' + sk]) o.vis = 'sk_' + sk;
    else if (isArrow) o.vis = 'arrow';
    else if (o.src === 'spell' && VIS['spell_' + o.kind]) o.vis = 'spell_' + o.kind;
    if (isArrow && s && s.equip) o.bowId = (s.equip.bow && BOWS[s.equip.bow]) ? s.equip.bow : 'bw_short';
    if (s && s.equip) o.focId = s.equip.focus || null;
    return o;
  };

  /* ═════════ 활: 열일곱 자루 ═════════
     c 빛깔 · c2 둘째 빛깔 · head 촉 · fl 깃 · shaft 살 · rib 꼬리 띠 · tr 날아가는 동안 · hit 맞은 자리 · rel 쏘는 순간 · gather 당길 때 모이는 것 */
  const tp = (sh, o) => P(Object.assign({ x: sh.x, y: sh.y, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, size: 1 }, o));
  const back = (sh, d) => { const L = Math.hypot(sh.vx, sh.vy) || 1; return [sh.x - sh.vx / L * d, sh.y - sh.vy / L * d]; };
  const BOWS = VX.BOWS = {
    bw_short: { c: '#e8e0cc', c2: '#c8a878', head: 'leaf', hc: '#d8d8e0', fl: '#c86a4a', shaft: '#8a5a30', rib: null, gather: 'dot',
      tr: (sh) => { if (R() < 0.25) tp(sh, { col: '#d8c8a8', life: 0.2 }); },
      hit: (sh, x, y) => { burst(x, y, 5, { col: ['#d8c8a8', '#ffffff'], sp: 50, z: 8, life: 0.3 }); slash(x, y - 8, Math.atan2(sh.vy, sh.vx), '#ffffff', 8); },
      rel: (x, y, a) => burst(x, y, 4, { a0: a, spread: 0.8, col: '#e8e0cc', sp: 60, z: 10, vz: 0, g: 0, life: 0.18 }) },
    bw_bone: { c: '#f0ead8', c2: '#c8b8a0', head: 'bone', hc: '#f4f0e0', fl: '#8a7a6a', shaft: '#d8d0b8', rib: { col: '#e8e0c8', w: 2 },
      tr: (sh) => { if (R() < 0.3) tp(sh, { shape: 'shard', col: '#f0ead8', vz: -10, g: 60, life: 0.4, size: 1, spin: 8 }); },
      hit: (sh, x, y) => { burst(x, y, 8, { shape: 'shard', col: ['#f4f0e0', '#c8b8a0'], sp: 80, z: 8, vz: 40, g: 200, life: 0.5, spin: 10 }); ring(x, y, '#f0ead8', 10, 0.25, 1); },
      rel: (x, y, a) => burst(x, y, 5, { a0: a, spread: 1, shape: 'shard', col: '#f0ead8', sp: 70, z: 10, life: 0.25, spin: 8 }) },
    bw_long: { c: '#ffe8c8', c2: '#c84a3a', head: 'bodkin', hc: '#e8e8f0', fl: '#c83a3a', shaft: '#9a6a3a', len: 15, rib: { col: '#ffe8c8', w: 1, core: false },
      tr: (sh) => { if (R() < 0.5) { const [bx, by] = back(sh, 10); P({ x: bx, y: by, z: sh.zoff, vx: sh.vx * 0.2, vy: sh.vy * 0.2, vz: 0, g: 0, life: 0.15, col: '#ffffff', shape: 'line', len: 8, a: 0.6 }); } },
      hit: (sh, x, y) => { ring(x, y + 6, '#ffe8c8', 14, 0.3, 2); burst(x, y, 6, { shape: 'spark', col: '#ffe8c8', sp: 110, z: 8, life: 0.25, g: 120 }); },
      rel: (x, y, a) => { for (let i = 0; i < 3; i++) F.line({ kind: 'beam', x0: x - Math.cos(a) * 4, y0: y - 10 + (i - 1) * 3, x1: x + Math.cos(a) * 18, y1: y - 10 + (i - 1) * 3 + Math.sin(a) * 14, col: '#ffe8c8', w: 1, life: 0.12 }); } },
    bw_cross: { c: '#d8d8e8', c2: '#a8a8b8', head: 'square', hc: '#b8b8c8', fl: '#3a3a4a', shaft: '#5a3a20', len: 8, rib: null, ghost: 2,
      tr: () => {},
      hit: (sh, x, y) => { burst(x, y, 7, { shape: 'spark', col: ['#ffe8a8', '#ffffff'], sp: 120, z: 8, vz: 30, g: 240, life: 0.25 }); },
      rel: (x, y, a) => { burst(x, y, 6, { a0: a, spread: 0.6, shape: 'spark', col: ['#ffe8a8', '#ffffff'], sp: 140, z: 10, vz: 10, g: 200, life: 0.18 }); GL(x, y - 10, 10, '#ffe8a8', 0.12, { pulse: true }); } },
    bw_hunter2: { c: '#c8f0a0', c2: '#5a9a3a', head: 'leaf', hc: '#e0e8d0', fl: '#6ac85a', shaft: '#7a5a2a', rib: { col: '#8ad86a', w: 1 },
      tr: (sh) => { if (R() < 0.35) tp(sh, { shape: 'leaf', col: pick(['#6ac85a', '#a8e070', '#3a8a3a']), vx: rnd(-10, 10), vy: rnd(-6, 6), vz: -6, g: 20, life: 0.6, size: 2, spin: 6, flutter: true }); },
      hit: (sh, x, y, e) => { burst(x, y, 7, { shape: 'leaf', col: ['#6ac85a', '#a8e070'], sp: 70, z: 10, vz: 30, g: 60, life: 0.6, size: 2, spin: 8, flutter: true }); if (e) reticle(e, '#a8e070'); },
      rel: (x, y, a) => burst(x, y, 5, { a0: a, spread: 1.2, shape: 'leaf', col: '#8ad86a', sp: 60, z: 10, vz: 10, g: 30, life: 0.4, size: 2, spin: 6, flutter: true }) },
    bw_wind: { c: '#d8fff0', c2: '#a8d8c8', head: 'leaf', hc: '#ffffff', fl: '#a8e8d8', shaft: '#c8e8e0', rib: { col: '#c8fff0', w: 3, wave: 2, a: 0.35 }, light: 0,
      tr: (sh) => { if (R() < 0.45) { const s2 = sh.t * 30; tp(sh, { shape: 'line', col: '#ffffff', vx: -sh.vy * 0.2 * Math.sin(s2), vy: sh.vx * 0.2 * Math.sin(s2), len: 5, life: 0.2, a: 0.7 }); } },
      hit: (sh, x, y) => { swirl(x, y, '#c8fff0', 14); burst(x, y, 6, { shape: 'line', col: '#ffffff', sp: 120, z: 8, vz: 0, g: 0, life: 0.2, len: 6 }); },
      rel: (x, y, a) => { swirl(x, y - 10, '#c8fff0', 8); } },
    bw_frost: { el0: 'ice', c: '#bfe8ff', c2: '#e8f8ff', head: 'crystal', hc: '#e8f8ff', fl: '#8ac8e8', shaft: '#8ab8d8', rib: { col: '#bfe8ff', w: 2 }, light: 14, lc: '#bfe8ff',
      tr: (sh) => { if (R() < 0.45) tp(sh, { shape: 'snow', col: '#ffffff', vx: rnd(-8, 8), vy: rnd(-4, 4), vz: -8, g: 10, life: 0.6, size: R() < 0.3 ? 2 : 1 }); },
      hit: (sh, x, y) => { burst(x, y, 9, { shape: 'shard', col: ['#bfe8ff', '#ffffff'], sp: 80, z: 10, vz: 50, g: 220, life: 0.55, spin: 10, size: 2 }); decal({ kind: 'frost', x, y: y + 8, r: 10, life: 1.6, col: '#e8f8ff' }); GL(x, y, 16, '#8ad8ff', 0.3, { pulse: true }); },
      rel: (x, y, a) => burst(x, y, 6, { a0: a, spread: 1, shape: 'snow', col: '#ffffff', sp: 60, z: 10, vz: 0, g: 0, life: 0.35 }) },
    bw_twin2: { c: '#f0e0c8', c2: '#c8a8ff', head: 'leaf', hc: '#ffffff', fl: '#c8a8ff', shaft: '#8a6a4a', twin: true, rib: { col: '#e8d8ff', w: 1, core: false },
      tr: (sh) => { if (R() < 0.3) tp(sh, { shape: 'star', col: '#e8d8ff', life: 0.25, size: 1, add: true }); },
      hit: (sh, x, y) => { const a = Math.atan2(sh.vy, sh.vx); slash(x, y - 8, a + 0.7, '#e8d8ff', 12); slash(x, y - 8, a - 0.7, '#ffffff', 12); },
      rel: (x, y, a) => burst(x, y, 4, { a0: a, spread: 0.5, shape: 'star', col: '#e8d8ff', sp: 50, z: 10, vz: 0, g: 0, life: 0.25, add: true }) },
    bw_venom: { el0: 'poison', c: '#a8e88a', c2: '#5a8a2a', head: 'barb', hc: '#c8f0a0', fl: '#3a6a2a', shaft: '#4a6a3a', rib: { col: '#7ad86a', w: 2, a: 0.4 },
      tr: (sh) => { if (R() < 0.4) tp(sh, { shape: 'drop', col: pick(['#9ae86a', '#6ab84a']), vz: 0, g: 160, life: 0.5, size: 1 }); },
      hit: (sh, x, y) => { decal({ kind: 'splat', x, y: y + 8, r: 9, life: 2.2, col: '#7ad86a' }); burst(x, y, 7, { shape: 'drop', col: ['#9ae86a', '#c8f0a0'], sp: 60, z: 10, vz: 50, g: 260, life: 0.5 }); burst(x, y, 3, { shape: 'bubble', col: '#9ae86a', sp: 10, z: 6, vz: 14, g: 0, life: 0.8, size: 2 }); },
      rel: (x, y, a) => burst(x, y, 4, { a0: a, spread: 1, shape: 'drop', col: '#9ae86a', sp: 50, z: 10, vz: 10, g: 160, life: 0.35 }) },
    bw_thunder: { el0: 'bolt', c: '#ffe066', c2: '#ffffff', head: 'bolt', hc: '#fff8a8', fl: '#ffe066', shaft: '#5a5a7a', rib: { col: '#ffe066', w: 1, wave: 2, a: 0.8 }, light: 14, lc: '#ffe066',
      tr: (sh) => { if (R() < 0.5) { const [bx, by] = back(sh, rnd(4, 12)); P({ x: bx + rnd(-3, 3), y: by + rnd(-3, 3), z: sh.zoff, vx: rnd(-40, 40), vy: rnd(-40, 40), vz: 0, g: 0, life: 0.12, col: pick(['#ffe066', '#ffffff']), shape: 'spark', add: true }); } },
      hit: (sh, x, y) => { for (let i = 0; i < 3; i++) { const a = R() * TAU; F.line({ kind: 'bolt', x0: x, y0: y - 8, x1: x + Math.cos(a) * 16, y1: y - 8 + Math.sin(a) * 12, col: '#ffe066', w: 1, life: 0.15, amp: 3, n: 4, glow: true }); } GL(x, y - 8, 18, '#ffe066', 0.2, { pulse: true }); },
      rel: (x, y, a) => { F.line({ kind: 'bolt', x0: x, y0: y - 10, x1: x + Math.cos(a) * 16, y1: y - 10 + Math.sin(a) * 12, col: '#ffe066', w: 1, life: 0.12, amp: 3, n: 4, glow: true }); } },
    bw_dragon: { el0: 'fire', c: '#ff8a3a', c2: '#ffd84a', head: 'flame', hc: '#ffb040', fl: '#c83a1a', shaft: '#c86a3a', len: 14, rib: { col: '#ff6a2a', w: 3, a: 0.4 }, light: 18, lc: '#ff8a3a',
      tr: (sh) => { tp(sh, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a', '#6a3a2a'], vx: rnd(-10, 10), vy: rnd(-6, 6), vz: 16, life: 0.35, size: 2 }); if (R() < 0.3) tp(sh, { shape: 'smoke', col: '#4a3a3a', vz: 10, life: 0.6, size: 2, grow: 1.5 }); },
      hit: (sh, x, y) => { burst(x, y, 10, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a', '#5a3a3a'], sp: 70, z: 6, vz: 40, g: 0, life: 0.45, size: 2 }); decal({ kind: 'scorch', x, y: y + 8, r: 10, life: 1.8 }); GL(x, y, 26, '#ff8a3a', 0.35, { pulse: true }); },
      rel: (x, y, a) => burst(x, y, 6, { a0: a, spread: 1, shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a'], sp: 60, z: 10, vz: 20, g: 0, life: 0.3, size: 2 }) },
    bw_echo: { c: '#e8d8ff', c2: '#8a7ab8', head: 'ring', hc: '#e8d8ff', fl: '#8a7ab8', shaft: '#8a7ab8', rib: null,
      tr: (sh) => { sh._ec = (sh._ec || 0) + 1; if (sh._ec % 5 === 0) P({ x: sh.x, y: sh.y, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.35, col: '#c8b8ff', shape: 'ring', size: 2, grow: 3 }); },
      hit: (sh, x, y) => { for (let i = 0; i < 3; i++) C.after(i * 0.08, () => ring(x, y + 6, '#c8b8ff', 10 + i * 8, 0.35, 1)); burst(x, y, 4, { shape: 'note', col: '#e8d8ff', sp: 30, z: 12, vz: 30, g: 0, life: 0.6 }); },
      rel: (x, y) => P({ x, y, z: 10, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, col: '#e8d8ff', shape: 'ring', size: 2, grow: 3 }) },
    bw_seeker: { c: '#ff8a8a', c2: '#ffffff', head: 'eye', hc: '#ff5a6a', fl: '#5a4a3a', shaft: '#5a4a3a', rib: { col: '#ff5a6a', w: 1, core: false, a: 0.7 },
      tr: (sh) => { sh._sc = (sh._sc || 0) + 1; if (sh._sc % 3 === 0) tp(sh, { col: '#ff5a6a', life: 0.35, size: 1, add: true }); },
      hit: (sh, x, y, e) => { if (e) reticle(e, '#ff5a6a'); burst(x, y, 5, { shape: 'spark', col: '#ff8a8a', sp: 90, z: 8, life: 0.2 }); },
      rel: (x, y, a) => { F.line({ kind: 'laser', x0: x, y0: y - 10, x1: x + Math.cos(a) * 40, y1: y - 10 + Math.sin(a) * 34, col: '#ff5a6a', life: 0.15 }); } },
    bw_moon: { c: '#c8d0ff', c2: '#3a3a6a', head: 'crescent', hc: '#e8ecff', fl: '#5a5a8a', shaft: '#8a90b8', ghost: 3, rib: { col: '#5a5a9a', w: 3, a: 0.35 },
      tr: (sh) => { if (R() < 0.35) tp(sh, { shape: 'smoke', col: '#2a2440', vz: 4, life: 0.5, size: 2, grow: 1 }); },
      hit: (sh, x, y) => { const a = Math.atan2(sh.vy, sh.vx); slash(x, y - 8, a, '#c8d0ff', 14); burst(x, y, 6, { shape: 'smoke', col: '#2a2440', sp: 30, z: 8, vz: 8, g: 0, life: 0.6, size: 2, grow: 1 }); GL(x, y - 8, 14, '#8a90ff', 0.25, { pulse: true }); },
      rel: (x, y, a) => burst(x, y, 5, { a0: a, spread: 0.8, shape: 'smoke', col: '#3a3a6a', sp: 30, z: 10, vz: 6, g: 0, life: 0.4, size: 2 }) },
    bw_star: { c: '#fff8c0', c2: '#8a9aff', head: 'star', hc: '#ffffff', fl: '#3a4a8a', shaft: '#3a4a8a', rib: { col: '#a8b8ff', w: 1 }, light: 12, lc: '#fff8c0',
      tr: (sh) => { if (R() < 0.6) tp(sh, { shape: 'star', col: pick(['#fff8c0', '#ffffff', '#a8b8ff']), vx: rnd(-8, 8), vy: rnd(-6, 6), life: 0.5, size: R() < 0.3 ? 2 : 1, tw: 20, add: true }); },
      hit: (sh, x, y) => { burst(x, y, 10, { shape: 'star', col: ['#fff8c0', '#ffffff', '#a8b8ff'], sp: 70, z: 8, vz: 30, g: 40, life: 0.6, size: 2, tw: 18, add: true }); GL(x, y - 6, 18, '#fff8c0', 0.3, { pulse: true }); },
      rel: (x, y, a) => burst(x, y, 6, { a0: a, spread: 1.2, shape: 'star', col: '#fff8c0', sp: 50, z: 10, vz: 10, g: 0, life: 0.4, size: 1, add: true }) },
    bw_dawn: { el0: 'light', c: '#fff0a8', c2: '#ffb84a', head: 'sun', hc: '#fff8d0', fl: '#e8b84a', shaft: '#e8c860', rib: { col: '#ffe8a8', w: 3, a: 0.45 }, light: 18, lc: '#fff0a8',
      tr: (sh) => { if (R() < 0.5) tp(sh, { col: pick(['#fff0a8', '#ffffff']), vz: 12, life: 0.4, size: 1, add: true, glow: true }); },
      hit: (sh, x, y) => { rays(x, y - 6, 8, 18, '#fff0a8', { w: 2, life: 0.25 }); GL(x, y - 6, 24, '#fff0a8', 0.35, { pulse: true }); },
      rel: (x, y) => rays(x, y - 10, 6, 10, '#fff0a8', { w: 1, life: 0.15 }) },
    bw_heaven: { el0: 'light', c: '#c8d8ff', c2: '#c8a8ff', head: 'star', hc: '#ffffff', fl: '#6a7ad8', shaft: '#a8c8ff', rib: { col: '#a8a8ff', w: 3, a: 0.4 }, light: 16, lc: '#c8d8ff',
      tr: (sh) => { const a = sh.t * 18; tp(sh, { x: sh.x + Math.cos(a) * 4, y: sh.y + Math.sin(a) * 3, shape: R() < 0.5 ? 'star' : undefined, col: pick(['#c8d8ff', '#c8a8ff', '#ffffff', '#ffa8d8']), life: 0.5, size: 1, add: true, tw: 15 }); },
      hit: (sh, x, y) => { burst(x, y, 12, { col: ['#c8d8ff', '#c8a8ff', '#ffa8d8', '#ffffff'], shape: 'star', sp: 50, z: 8, vz: 10, g: 0, life: 0.7, add: true, tw: 12 }); ring(x, y + 6, '#c8a8ff', 16, 0.4, 1); GL(x, y - 6, 22, '#a8a8ff', 0.4, { pulse: true }); },
      rel: (x, y) => burst(x, y, 6, { col: ['#c8d8ff', '#c8a8ff'], shape: 'star', sp: 40, z: 10, vz: 0, g: 0, life: 0.4, add: true }) },
    bw_sun: { el0: 'fire', c: '#fff0a8', c2: '#ff9a4a', head: 'sun', hc: '#ffffff', fl: '#ff6a2a', shaft: '#ff9a4a', len: 14, rib: { col: '#ffb04a', w: 4, a: 0.45, core: '#fff8d0' }, light: 22, lc: '#ffd84a',
      tr: (sh) => { tp(sh, { shape: 'flame', cols: ['#ffffff', '#fff0a8', '#ffb04a', '#ff6a2a'], vx: rnd(-8, 8), vy: rnd(-6, 6), vz: 10, life: 0.3, size: 2, add: true }); },
      hit: (sh, x, y) => { ring(x, y + 6, '#ffd84a', 18, 0.35, 2); rays(x, y - 6, 10, 20, '#ffb04a', { w: 2, life: 0.25, var: true }); decal({ kind: 'scorch', x, y: y + 8, r: 9, life: 1.6, col: '#ffd84a' }); GL(x, y - 6, 28, '#ffd84a', 0.4, { pulse: true }); },
      rel: (x, y, a) => { burst(x, y, 8, { a0: a, spread: 1.2, shape: 'flame', cols: ['#ffffff', '#fff0a8', '#ffb04a'], sp: 70, z: 10, vz: 10, g: 0, life: 0.25, size: 2, add: true }); GL(x, y - 10, 16, '#ffd84a', 0.2, { pulse: true }); } },
  };
  BOWS.bow = BOWS.bw_short;
  // 등급이 있는데 이름 표가 없는 활은 등급 빛깔로
  const bowSig = (id) => BOWS[id] || BOWS.bw_short;
  /** 맞힌 적 발밑에 겨눔 표식 */
  function reticle(e, col) {
    const y = e.y - (e.h || 16) / 2;
    F.line({ kind: 'laser', x0: e.x - 9, y0: y, x1: e.x - 4, y1: y, col, life: 0.4, glow: true }); F.line({ kind: 'laser', x0: e.x + 4, y0: y, x1: e.x + 9, y1: y, col, life: 0.4, glow: true });
    F.line({ kind: 'laser', x0: e.x, y0: y - 9, x1: e.x, y1: y - 4, col, life: 0.4, glow: true }); F.line({ kind: 'laser', x0: e.x, y0: y + 4, x1: e.x, y1: y + 9, col, life: 0.4, glow: true });
    P({ x: e.x, y: e.y, z: (e.h || 16) / 2, vx: 0, vy: 0, vz: 0, g: 0, life: 0.4, col, shape: 'ring', size: 7, grow: -0.5 });
  }
  function swirl(x, y, col, r) { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; P({ x: x + Math.cos(a) * r * 0.4, y: y + Math.sin(a) * r * 0.3, z: 8, vx: Math.cos(a + 1.4) * r * 4, vy: Math.sin(a + 1.4) * r * 3, vz: 0, g: 0, drag: 3, life: 0.35, col, shape: 'line', len: 4 }); } }
  VX.reticle = reticle; VX.swirl = swirl;

  /** 화살 몸: 살 · 깃 · 촉 (가로, 오른쪽이 촉) */
  function arrowBody(g, B, sh, big) {
    const L = (B.len || 11) + (sh.heavy ? 6 : 0);
    // 쌍시위: 두 대가 나란히
    const lanes = B.twin ? [-1.5, 1.5] : [0];
    for (const ly of lanes) {
      g.fillStyle = B.shaft; g.fillRect(-L + 2, ly - 0.5, L, 1);
      // 깃
      g.fillStyle = B.fl; g.fillRect(-L, ly - 2, 3, 1); g.fillRect(-L, ly + 1, 3, 1); g.fillRect(-L + 1, ly - 1, 1, 2);
      head(g, B.head, B.hc, 2, ly, sh.t);
    }
    if (big) { g.globalAlpha = 0.3; g.fillStyle = B.c; g.fillRect(-L - 2, -3, L + 9, 6); g.globalAlpha = 1; }
  }
  function head(g, kind, col, x, y, t) {
    g.fillStyle = col;
    switch (kind) {
      case 'bone': g.fillRect(x, y - 1.5, 3, 3); g.fillRect(x + 3, y - 0.5, 2, 1); g.fillStyle = '#8a7a6a'; g.fillRect(x + 1, y - 0.5, 1, 1); break;
      case 'bodkin': g.fillRect(x, y - 1, 2, 2); g.fillRect(x + 2, y - 0.5, 3, 1); break;
      case 'square': g.fillRect(x, y - 1.5, 3, 3); break;
      case 'crystal': g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x + 5, y); g.lineTo(x, y + 2); g.lineTo(x + 1, y); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x + 1, y - 1, 2, 1); break;
      case 'bolt': g.fillRect(x, y - 1, 2, 1); g.fillRect(x + 1, y, 2, 1); g.fillRect(x + 2, y - 1, 2, 1); g.fillRect(x + 3, y, 2, 1); g.fillStyle = '#ffffff'; g.fillRect(x + 4, y - 0.5, 1, 1); break;
      case 'barb': g.fillRect(x, y - 1, 4, 2); g.fillRect(x + 4, y - 0.5, 1, 1); g.fillRect(x, y - 2, 1, 1); g.fillRect(x, y + 1, 1, 1); break;
      case 'flame': { const f = Math.sin(t * 40); g.fillRect(x, y - 1.5, 4, 3); g.fillStyle = '#fff2b0'; g.fillRect(x + 2, y - 0.5, 3, 1); g.globalAlpha = 0.7; g.fillStyle = '#ff5a2a'; g.fillRect(x - 2, y - 2.5 - f, 3, 1); g.fillRect(x - 2, y + 1.5 + f, 3, 1); g.globalAlpha = 1; break; }
      case 'ring': g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(x + 2, y, 2, 0, TAU); g.stroke(); break;
      case 'eye': g.fillRect(x, y - 1, 3, 2); g.fillStyle = '#ffffff'; g.fillRect(x + 1, y - 0.5, 1, 1); g.fillStyle = '#ff5a6a'; g.fillRect(x + 3, y - 0.5, 2, 1); break;
      case 'crescent': g.beginPath(); g.arc(x + 1, y, 3, -1.3, 1.3); g.lineTo(x + 2, y); g.closePath(); g.fill(); break;
      case 'star': { const s = 2 + (Math.sin(t * 30) > 0 ? 1 : 0); g.fillRect(x + 2 - s, y - 0.5, s * 2 + 1, 1); g.fillRect(x + 1.5, y - s, 1, s * 2); g.fillStyle = '#ffffff'; g.fillRect(x + 1.5, y - 0.5, 1, 1); break; }
      case 'sun': g.beginPath(); g.arc(x + 2, y, 2, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x + 1.5, y - 0.5, 1, 1); g.globalAlpha = 0.7; g.fillStyle = col; g.fillRect(x + 5, y - 0.5, 2, 1); g.fillRect(x + 1.5, y - 4, 1, 1.5); g.fillRect(x + 1.5, y + 2.5, 1, 1.5); g.globalAlpha = 1; break;
      default: g.beginPath(); g.moveTo(x, y - 1.5); g.lineTo(x + 4, y); g.lineTo(x, y + 1.5); g.closePath(); g.fill();
    }
  }
  VX.arrowBody = arrowBody; VX.head = head; VX.bowSig = bowSig; VX.tp = tp; VX.back = back;
  VIS.arrow = {
    hist: 8,
    ribbon: (sh) => { const B = bowSig(sh.bowId); if (sh.proc && !sh.charged) return null; const r = B.rib || (sh.charged ? { col: B.c, w: 1 } : null); if (!r) return null; return sh.heavy ? Object.assign({}, r, { w: r.w + 3 }) : sh.charged ? Object.assign({}, r, { w: r.w + 1 }) : r; },
    draw(g, x, y, a, sh) {
      const B = bowSig(sh.bowId);
      // 석궁 · 달그림자: 뒤에 잔상
      if (B.ghost && sh._hist && sh._hist.length > 3) { const W0 = W(); for (let i = 1; i <= B.ghost; i++) { const h = sh._hist[Math.max(0, sh._hist.length - 1 - i * 2)]; g.save(); g.globalAlpha = 0.3 / i; g.translate(Math.round(h[0] - W0.rcx), Math.round(h[1] - W0.rcy)); g.rotate(a); arrowBody(g, B, sh, false); g.restore(); } }
      g.save(); g.translate(x, y); g.rotate(a);
      if (sh.el && sh.el !== B.el0) elTint(g, sh.el, sh);
      arrowBody(g, B, sh, sh.charged || sh.heavy);
      if (sh.heavy) { g.globalAlpha = 0.8; g.fillStyle = '#ffffff'; g.fillRect(-14, -1, 22, 2); }
      if (sh.crit) { g.globalAlpha = 0.6 + Math.sin(sh.t * 40) * 0.3; g.fillStyle = '#ff5a6a'; g.fillRect(4, -2, 3, 4); }
      g.restore();
    },
    trail(sh) {
      const B = bowSig(sh.bowId);
      if (!sh.proc || sh.charged) B.tr(sh);
      if (sh.el && sh.el !== B.el0) elTrail(sh);
      if ((sh.charged || sh.heavy) && R() < 0.5) tp(sh, { col: B.c, life: 0.25, add: true, glow: true });
      if (B.light && !sh.glowR) sh.glowR = B.light;
    },
    hit(sh, e) { const B = bowSig(sh.bowId), x = e ? e.x : sh.x, y = e ? e.y - (e.h || 16) / 2 + 8 : sh.y; B.hit(sh, x, y - 8, e); if (sh.charged || sh.heavy) GL(x, y - 8, sh.heavy ? 26 : 16, B.c, 0.25, { pulse: true }); if (sh.el) elHit(sh.el, x, y - 8); },
    end(sh) { if (sh.hit && sh.hit.size) return; const B = bowSig(sh.bowId); burst(sh.x, sh.y, 3, { col: B.c, sp: 40, z: sh.zoff, life: 0.25 }); },
  };
  // 화살 · 탄에 붙은 속성 (불 · 얼음 · 번개 · 독 · 빛)
  const EL = { fire: ['#ffb040', '#ff5a2a'], ice: ['#bfe8ff', '#ffffff'], bolt: ['#ffe066', '#ffffff'], poison: ['#9ae86a', '#5a8a2a'], light: ['#fff0a8', '#ffffff'], dark: ['#c49bff', '#3a1a5a'], wind: ['#c8fff0', '#ffffff'] };
  function elTint(g, el, sh) { const c = EL[el]; if (!c) return; g.globalAlpha = 0.45 + Math.sin(sh.t * 30) * 0.15; g.fillStyle = c[0]; g.fillRect(0, -2, 6, 4); g.globalAlpha = 1; }
  function elTrail(sh) {
    const c = EL[sh.el]; if (!c || R() > 0.6) return;
    if (sh.el === 'fire') tp(sh, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a'], vz: 14, life: 0.25, size: 1 });
    else if (sh.el === 'ice') tp(sh, { shape: 'snow', col: '#ffffff', vz: -6, g: 10, life: 0.4 });
    else if (sh.el === 'bolt') tp(sh, { shape: 'spark', col: '#ffe066', vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.1, add: true });
    else if (sh.el === 'poison') tp(sh, { shape: 'drop', col: '#9ae86a', g: 140, life: 0.4 });
    else tp(sh, { col: c[0], life: 0.3, add: true });
  }
  function elHit(el, x, y) {
    if (el === 'fire') burst(x, y, 6, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a'], sp: 40, z: 6, vz: 30, g: 0, life: 0.35, size: 2 });
    else if (el === 'ice') burst(x, y, 6, { shape: 'shard', col: ['#bfe8ff', '#ffffff'], sp: 60, z: 8, vz: 40, g: 200, life: 0.4, spin: 8 });
    else if (el === 'bolt') F.line({ kind: 'bolt', x0: x - 8, y0: y - 10, x1: x + 6, y1: y + 6, col: '#ffe066', w: 1, life: 0.15, amp: 3, n: 4, glow: true });
    else if (el === 'poison') burst(x, y, 4, { shape: 'bubble', col: '#9ae86a', sp: 10, z: 6, vz: 16, g: 0, life: 0.7, size: 2 });
    else if (el === 'light') rays(x, y, 6, 12, '#fff0a8', { w: 1, life: 0.2 });
  }
  VX.elHit = elHit; VX.elTrail = elTrail;

  /* ── 활을 당기는 동안 · 쏘는 순간 ── */
  const RT = { lastRel: -9 };
  const bowTip = (p) => { const a = p.aim != null ? p.aim : Math.atan2(p.face[1], p.face[0]); return [p.x + Math.cos(a) * 14, p.y + 3 + Math.sin(a) * 12, a]; };
  function bowTick(p, dt) {
    const s = S(); if (!s || p.state !== 'bow') { RT.fullShown = false; return; }
    const B = bowSig(s.equip.bow), [tx, ty, a] = bowTip(p), d = G.st.derive(s), k = Math.min(1, p.bowT / (d.draw + 0.35)), gr = d.bowGrade || 1, GC = G.prog.GRADES[gr];
    // 모여드는 빛 (당길수록 많이 · 활의 등급이 높을수록 많이)
    for (let n = 0; n < (gr >= 4 ? 2 : 1); n++) if (R() < (0.25 + k * 0.6) * (0.6 + gr * 0.12)) { const an = R() * TAU, r = 10 + R() * 10; P({ x: tx + Math.cos(an) * r, y: ty + Math.sin(an) * r * 0.7, z: 11, vx: -Math.cos(an) * r * 5, vy: -Math.sin(an) * r * 3.5, vz: 0, g: 0, drag: 1, life: 0.18, col: pick([B.c, B.c2]), size: 1, add: true }); }
    if (p.bowFull && !RT.fullShown) { RT.fullShown = true; GL(tx, ty - 11, 10 + gr * 3, B.c, 0.35, { pulse: true }); burst(tx, ty, 4 + gr * 2, { col: [B.c, '#ffffff'], shape: 'star', sp: 50, z: 11, vz: 0, g: 0, life: 0.35, add: true }); if (gr >= 3 && GC.glow) ring(tx, ty - 1, GC.glow, 6 + gr * 2, 0.3, gr >= 5 ? 2 : 1); if (gr >= 5) rays(tx, ty - 11, 6, 12, GC.glow, { w: 1, life: 0.25 }); }
    if (p.bowFull) GL(tx, ty - 11, 8 + Math.sin(W().t * 20) * 2, B.c, 0.06, { pulse: true });
    if (p.bowHeavy && R() < 0.6) P({ x: tx + rnd(-3, 3), y: ty, z: 11 + rnd(-3, 3), vx: Math.cos(a) * -30, vy: Math.sin(a) * -20, vz: 0, g: 0, life: 0.2, col: '#ffffff', shape: 'line', len: 5, add: true });
  }
  const shootRel = C.onShoot;
  C.onShoot = function (o) {
    o = (shootRel ? shootRel.apply(this, arguments) : null) || o;
    const p = W() && W().player;
    if (p && o && o.vis === 'arrow' && !o.proc && o.owner !== 'foe' && W().t - RT.lastRel > 0.05) {
      RT.lastRel = W().t; const B = bowSig(o.bowId), a = Math.atan2(o.vy, o.vx);
      safe(B.rel, p.x + Math.cos(a) * 12, p.y + Math.sin(a) * 9, a);
      if (o.charged) ring(p.x + Math.cos(a) * 10, p.y - 6 + Math.sin(a) * 8, B.c, o.heavy ? 18 : 10, 0.25, o.heavy ? 2 : 1);
    }
    return o;
  };

  /* ═════════ 마도구: 열두 개 ═════════
     c 빛깔 · mote 지팡이 끝에서 흩어지는 것 · circ 마법진 꼴 */
  const FOC = VX.FOC = {
    none: { c: '#a8c8ff', mote: 'dot', circ: 'basic' },
    fc_twig: { c: '#8ae07a', mote: 'leaf', circ: 'leaf' },
    fc_coral: { c: '#ff9aaa', mote: 'bubble', circ: 'coral' },
    fc_ember: { c: '#ff8a3a', mote: 'flame', circ: 'flame' },
    fc_rune: { c: '#8ad8ff', mote: 'rune', circ: 'rune' },
    fc_orb: { c: '#c8a8ff', mote: 'diamond', circ: 'hex' },
    fc_storm: { c: '#ffe066', mote: 'spark', circ: 'storm' },
    fc_tide: { c: '#8ae0ff', mote: 'bubble', circ: 'tide' },
    fc_mirror2: { c: '#e8e0ff', mote: 'shard', circ: 'mirror' },
    fc_moon: { c: '#c8d8ff', mote: 'star', circ: 'moon' },
    fc_star: { c: '#fff0a8', mote: 'star', circ: 'star' },
    fc_chaos: { c: '#ff5ad8', mote: 'chaos', circ: 'chaos' },
    fc_origin: { c: '#fff8d8', mote: 'star', circ: 'origin' },
  };
  const focOf = (id) => FOC[id] || FOC.none;
  const myFoc = () => { const s = S(); return focOf(s && s.equip && s.equip.focus); };
  function focusCol(def) { const s = S(); return s && s.equip && s.equip.focus && FOC[s.equip.focus] ? FOC[s.equip.focus].c : def; }
  /** 마도구가 흘리는 것 하나 */
  function mote(x, y, z, Fo, o) {
    o = o || {};
    const base = { x, y, z, vx: o.vx || rnd(-14, 14), vy: o.vy || rnd(-8, 8), vz: o.vz == null ? rnd(6, 18) : o.vz, g: 0, life: o.life || 0.5, size: 1 };
    const t = W().t;
    switch (Fo.mote) {
      case 'leaf': return P(Object.assign(base, { shape: 'leaf', col: pick(['#8ae07a', '#5ac84a']), size: 2, spin: 6, rot: R() * TAU, flutter: true }));
      case 'bubble': return P(Object.assign(base, { shape: 'bubble', col: Fo.c, size: R() < 0.4 ? 2 : 1, vz: 20 }));
      case 'flame': return P(Object.assign(base, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a'], size: 2, vz: 24 }));
      case 'rune': return P(Object.assign(base, { shape: 'rune', glyph: (R() * 8) | 0, col: Fo.c, add: true, vz: 10, life: 0.7 }));
      case 'diamond': return P(Object.assign(base, { shape: 'diamond', col: pick([Fo.c, '#ffffff']), size: 1, add: true }));
      case 'spark': return P(Object.assign(base, { shape: 'spark', col: pick([Fo.c, '#ffffff']), vx: rnd(-60, 60), vy: rnd(-40, 40), life: 0.15, add: true }));
      case 'shard': return P(Object.assign(base, { shape: 'shard', col: pick([Fo.c, '#ffffff']), spin: 10, rot: R() * TAU, size: 1 }));
      case 'star': return P(Object.assign(base, { shape: 'star', col: pick([Fo.c, '#ffffff']), tw: 16, add: true, size: R() < 0.3 ? 2 : 1 }));
      case 'chaos': return P(Object.assign(base, { shape: pick(['star', 'diamond', 'spark']), col: hsl(t * 300 + R() * 120, 90, 70), add: true }));
      default: return P(Object.assign(base, { col: Fo.c, add: true }));
    }
  }
  VX.mote = mote; VX.focOf = focOf; VX.myFoc = myFoc; VX.focusCol = focusCol;
  /** 마법진: 마도구마다 꼴이 다르다 (gear.js의 발밑 마법진이 부른다) */
  VX.circle = function (g, x, y, r, col, rot, alpha, focId) {
    const Fo = focOf(focId), c2 = Fo.c;
    g.save(); g.globalAlpha = alpha; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1;
    const ell = (rr, k) => { g.beginPath(); g.ellipse(x, y, rr, rr * (k || 0.45), 0, 0, TAU); g.stroke(); };
    const P2 = (a, rr) => [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.45];
    const poly = (n, rr, ro, step) => { g.beginPath(); for (let i = 0; i <= n; i++) { const [px, py] = P2(ro + (i * (step || 1)) / n * TAU, rr); if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); };
    switch (Fo.circ) {
      case 'leaf': ell(r); for (let i = 0; i < 6; i++) { const [px, py] = P2(rot + i / 6 * TAU, r); g.fillStyle = i % 2 ? '#8ae07a' : col; g.fillRect(Math.round(px) - 1, Math.round(py), 3, 1); g.fillRect(Math.round(px), Math.round(py) - 1, 1, 1); } ell(r * 0.55); break;
      case 'coral': { g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = r * (1 + Math.sin(a * 6 + rot * 3) * 0.08); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.45; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); g.strokeStyle = c2; for (let i = 0; i < 5; i++) { const [px, py] = P2(-rot + i / 5 * TAU, r * 0.6); g.beginPath(); g.arc(px, py, 1.5, 0, TAU); g.stroke(); } break; }
      case 'flame': ell(r); for (let i = 0; i < 12; i++) { const a = rot * 2 + i / 12 * TAU, [px, py] = P2(a, r), h = 2 + Math.abs(Math.sin(W().t * 12 + i)) * 3; g.fillStyle = i % 2 ? '#ffb040' : '#ff5a2a'; g.fillRect(Math.round(px), Math.round(py - h), 1, h); } ell(r * 0.6); break;
      case 'rune': { ell(r); ell(r * 0.78); const RU = F.RUNES; for (let i = 0; i < 8; i++) { const a = rot + i / 8 * TAU, [px, py] = P2(a, r * 0.89); const RR = RU[i % RU.length]; for (let ry = 0; ry < 5; ry += 2) for (let rx = 0; rx < 5; rx++) if (RR[ry] & (16 >> rx)) g.fillRect(Math.round(px) - 2 + rx, Math.round(py) - 1 + ry / 2, 1, 1); } poly(4, r * 0.5, -rot); break; }
      case 'hex': poly(6, r, rot); poly(3, r * 0.86, -rot); poly(3, r * 0.86, -rot + Math.PI / 3); ell(r * 0.35); break;
      case 'storm': { g.beginPath(); for (let i = 0; i <= 24; i++) { const a = rot + i / 24 * TAU, rr = r * (i % 2 ? 0.88 : 1.05); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.45; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); ell(r * 0.5); break; }
      case 'tide': for (let i = 0; i < 3; i++) { const k = ((W().t * 0.8 + i / 3) % 1); g.globalAlpha = alpha * (1 - k); ell(r * (0.35 + k * 0.75)); } break;
      case 'mirror': poly(4, r, rot); poly(4, r * 0.7, -rot + Math.PI / 4); g.fillStyle = '#ffffff'; { const [px, py] = P2(rot * 3, r); g.fillRect(Math.round(px), Math.round(py), 2, 1); } break;
      case 'moon': { ell(r); g.beginPath(); g.ellipse(x - r * 0.15, y, r * 0.55, r * 0.25, 0, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); for (let i = 0; i < 3; i++) { const [px, py] = P2(rot + i * 2.1, r * 0.75); g.fillRect(Math.round(px), Math.round(py) - 1, 1, 3); g.fillRect(Math.round(px) - 1, Math.round(py), 3, 1); } break; }
      case 'star': ell(r); poly(5, r * 0.92, rot - Math.PI / 2, 2); break;
      case 'chaos': { g.beginPath(); for (let i = 0; i <= 30; i++) { const a = rot + i / 30 * TAU, rr = r * (0.8 + Math.sin(i * 7.3 + W().t * 9) * 0.2); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.45; g.strokeStyle = hsl(W().t * 200 + i * 12, 90, 65); if (i) { g.lineTo(px, py); g.stroke(); g.beginPath(); g.moveTo(px, py); } else g.moveTo(px, py); } break; }
      case 'origin': { ell(r); ell(r * 0.8); ell(r * 0.6); for (let i = 0; i < 12; i++) { const a = rot * 0.5 + i / 12 * TAU, [p1x, p1y] = P2(a, r * 1.02), [p2x, p2y] = P2(a, r * 1.18); g.beginPath(); g.moveTo(p1x, p1y); g.lineTo(p2x, p2y); g.stroke(); } g.globalAlpha = alpha * 0.25; g.beginPath(); g.ellipse(x, y, r * 0.6, r * 0.27, 0, 0, TAU); g.fill(); break; }
      default: { ell(r); ell(r * 0.72); for (let i = 0; i < 8; i++) { const [px, py] = P2(rot + i / 8 * TAU, r * 0.86); g.fillRect(Math.round(px) - 1, Math.round(py), 2, 1); } for (let i = 0; i < 3; i++) { const a = -rot * 1.5 + i / 3 * TAU, b = a + TAU / 3, [ax, ay] = P2(a, r * 0.72), [bx, by] = P2(b, r * 0.72); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); } }
    }
    g.globalAlpha = alpha * 0.16; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, TAU); g.fill();
    g.restore();
  };
  /** 지팡이 끝: 그 마도구의 것이 흩어진다 (gear.js가 부른다) */
  VX.staffTip = function (wx, wy, k) { if (R() < 0.35 * k) mote(wx, wy, 0, myFoc(), { life: 0.4 }); if (R() < 0.15 * k) GL(wx, wy, 8, myFoc().c, 0.15, { pulse: true }); };

  /* ═════════ 주문 열셋 ═════════ */
  const SPELL = VX.SPELL = {
    fire: { cast(p) { const Fo = myFoc(); burst(p.x, p.y - 4, 6, { shape: 'flame', cols: ['#fff2b0', '#ffb040', '#ff5a2a'], sp: 30, z: 6, vz: 30, g: 0, life: 0.3, size: 2 }); if (Fo.mote !== 'flame') for (let i = 0; i < 3; i++) mote(p.x, p.y, 10, Fo); } },
    ice: { cast(p) { burst(p.x, p.y - 4, 6, { shape: 'snow', col: '#ffffff', sp: 30, z: 8, vz: 10, g: 0, life: 0.4 }); for (let i = 0; i < 3; i++) mote(p.x, p.y, 10, myFoc()); } },
    wind: { cast(p) { swirl(p.x, p.y - 2, '#c8fff0', 14); } },
    bolt: { cast(p) { const c = focusCol('#ffe066'); GL(p.x, p.y - 30, 24, c, 0.25, { pulse: true }); burst(p.x, p.y - 4, 8, { shape: 'spark', col: [c, '#ffffff'], sp: 90, z: 14, vz: 40, g: 120, life: 0.25, add: true }); } },
    quake: { cast(p) {
      decal({ kind: 'crack', x: p.x, y: p.y, r: 60, life: 2.2 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + R() * 0.3, r = 24 + R() * 40; C.after(0.03 * i, () => W().add(new Spike({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.7, life: 0.55, col: '#a8784a', col2: '#d8b080', h: 10 + R() * 6 }))); }
    } },
    meteor: { cast(p) { GL(p.x, p.y - 40, 30, '#ff7a4a', 0.4, { pulse: true }); for (let i = 0; i < 4; i++) mote(p.x, p.y, 20, myFoc()); } },
    heal: { cast(p) {
      decal({ kind: 'glyph', x: p.x, y: p.y, r: 16, life: 1.6, col: '#8ae0a0', spin: 2 });
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; P({ x: p.x + Math.cos(a) * 12, y: p.y + Math.sin(a) * 6, z: 0, vx: Math.cos(a + 1.6) * 20, vy: Math.sin(a + 1.6) * 10, vz: 24 + R() * 20, g: 0, life: 1, shape: i % 3 ? 'leaf' : 'heart', col: i % 3 ? pick(['#8ae0a0', '#c8ffd8']) : '#ff9ab8', size: 2, spin: 4, rot: R() * TAU, flutter: true }); }
      GL(p.x, p.y - 10, 30, '#8ae0a0', 0.8);
    } },
    light: { cast(p) { rays(p.x, p.y - 10, 16, 70, '#ffffff', { w: 3, life: 0.3, var: true }); decal({ kind: 'glyph', x: p.x, y: p.y, r: 40, life: 1.2, col: '#fff8d8', spin: 3 }); GL(p.x, p.y - 10, 60, '#ffffff', 0.45, { pulse: true }); } },
    poison: { cast(p, id) {
      const a = Math.atan2(p.face[1], p.face[0]), x = p.x + Math.cos(a) * 46, y = p.y + Math.sin(a) * 36;
      decal({ kind: 'splat', x, y, r: 28, life: 3.2, col: '#7ad86a' });
      const cl = W().ents.slice(-6).reverse().find((e) => e.kind === 'cloud' && !e._vfx);
      if (cl) { cl._vfx = 1; const u0 = cl.update; cl.update = function (dt) { u0.call(this, dt); if (R() < 0.5) P({ x: this.x + rnd(-26, 26), y: this.y + rnd(-14, 14), z: 1, vx: 0, vy: 0, vz: rnd(6, 14), g: 0, life: 0.9, shape: 'bubble', col: pick(['#9ae86a', '#c8f0a0', '#b87aff']), size: R() < 0.4 ? 2 : 1 }); if (R() < 0.2) P({ x: this.x + rnd(-24, 24), y: this.y + rnd(-12, 12), z: 4, vx: rnd(-6, 6), vy: 0, vz: 4, g: 0, life: 1.4, shape: 'smoke', col: '#5a8a3a', size: 4, grow: 1 }); }; }
    } },
    barrier: { cast(p) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; burst(p.x + Math.cos(a) * 14, p.y - 8 + Math.sin(a) * 12, 2, { shape: 'diamond', col: '#fff4c8', sp: 10, z: 0, vz: 0, g: 0, life: 0.5, add: true }); } GL(p.x, p.y - 10, 26, '#fff4c8', 0.5, { pulse: true }); } },
    blink: { cast(p) {
      const x0 = p.x, y0 = p.y;
      // 떠나는 자리: 몸이 빛 조각으로 흩어진다
      for (let i = 0; i < 24; i++) P({ x: x0 + rnd(-5, 5), y: y0, z: rnd(0, 20), vx: rnd(-20, 20), vy: rnd(-10, 10), vz: rnd(10, 40), g: 0, life: rnd(0.3, 0.6), col: pick(['#c8b8ff', '#ffffff', '#8a7ad8']), size: 1, add: true });
      C.after(0.01, () => { const pl = W().player; if (!pl) return; F.line({ kind: 'beam', x0, y0: y0 - 10, x1: pl.x, y1: pl.y - 10, col: '#c8b8ff', w: 4, life: 0.25, glow: true }); for (let i = 0; i < 16; i++) { const a = R() * TAU; P({ x: pl.x + Math.cos(a) * 16, y: pl.y + Math.sin(a) * 10, z: 10, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 40, vz: 0, g: 0, drag: 1, life: 0.25, col: '#e8e0ff', size: 1, add: true }); } });
    } },
    gravity: { cast(p) {
      const wl = W().ents.slice(-6).reverse().find((e) => e.kind === 'well' && !e._vfx);
      if (wl) { wl._vfx = 1; const d0 = wl.draw; wl.draw = function (g, cx, cy) { const X0 = Math.round(this.x - cx), Y0 = Math.round(this.y - cy - 10), t = this.t; g.save(); for (let i = 0; i < 3; i++) { const a = -t * (4 + i) + i * 2; g.strokeStyle = i % 2 ? 'rgba(196,155,255,0.6)' : 'rgba(110,60,200,0.5)'; g.lineWidth = 2 - i * 0.5; g.beginPath(); g.ellipse(X0, Y0 + 4, 24 - i * 6, 8 - i * 2, 0, a, a + 4); g.stroke(); } g.restore(); d0.call(this, g, cx, cy); g.save(); g.globalAlpha = 0.5; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(X0, Y0, 9 + Math.sin(t * 10), -0.5 + t * 3, 0.6 + t * 3); g.stroke(); g.restore(); };
        const u0 = wl.update; wl.update = function (dt) { u0.call(this, dt); if (this.dead) { GL(this.x, this.y - 10, 50, '#b89aff', 0.4, { pulse: true }); burst(this.x, this.y - 6, 20, { shape: 'shard', col: ['#c49bff', '#2a1040', '#ffffff'], sp: 140, z: 8, vz: 60, g: 200, life: 0.6, spin: 10, size: 2 }); decal({ kind: 'crater', x: this.x, y: this.y, r: 26, life: 2.4, col: '#c49bff' }); } else GL(this.x, this.y - 10, 16, '#8a6ad8', 0.05, { pulse: true }); }; }
    } },
    blizzard: { cast(p) {
      decal({ kind: 'frost', x: p.x, y: p.y, r: 60, life: 3.4 });
      const st = W().ents.slice(-6).reverse().find((e) => e.kind === 'storm' && !e._vfx);
      if (st) { st._vfx = 1; const u0 = st.update; st.update = function (dt) { u0.call(this, dt); for (let i = 0; i < 3; i++) { const a = this.t * 3 + R() * TAU, r = 20 + R() * 70; P({ x: this.x + Math.cos(a) * r, y: this.y + Math.sin(a) * r * 0.7, z: rnd(6, 30), vx: Math.cos(a + 1.5) * 120, vy: Math.sin(a + 1.5) * 80, vz: -6, g: 0, life: 0.45, shape: R() < 0.5 ? 'snow' : 'line', col: R() < 0.7 ? '#ffffff' : '#bfe8ff', size: 1, len: 4 }); } }; }
    } },
  };
  /** 땅에서 솟는 바위 · 얼음 가시 */
  class Spike extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'vfx', solid: false, sortBias: 1, t: 0 }, o)); }
    update(dt) { this.t += dt; if (this.t >= this.life) { this.dead = true; } else if (this.t < dt * 1.5) burst(this.x, this.y, 3, { col: this.col, sp: 30, z: 2, vz: 60, g: 260, life: 0.4, size: 2 }); }
    draw(g, cx, cy) { const k = this.t / this.life, h = this.h * (k < 0.15 ? k / 0.15 : k > 0.7 ? (1 - k) / 0.3 : 1), x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillStyle = this.col; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x, y - h); g.lineTo(x + 3, y); g.fill(); g.fillStyle = this.col2; g.fillRect(x - 1, Math.round(y - h * 0.7), 1, Math.round(h * 0.5)); }
  }
  VX.Spike = Spike;
  // 주문 탄: 화염구 · 얼음창 · 바람 칼날
  const flameCols = ['#ffffff', '#fff2b0', '#ffb040', '#ff5a2a', '#6a3a2a'];
  VIS.spell_fire = { light: 22, hist: 6, ribbon: () => ({ col: '#ff6a2a', w: 4, a: 0.35, core: '#ffd84a' }),
    draw(g, x, y, a, sh) {
      const r = sh.r || 4, t = sh.t, Fo = focOf(sh.focId);
      g.save(); g.translate(x, y);
      // 혀: 뒤쪽으로 날름거리는 불꽃
      for (let i = 0; i < 6; i++) { const an = a + Math.PI + (i - 2.5) * 0.35 + Math.sin(t * 30 + i) * 0.15, L = r * (1.6 + Math.abs(Math.sin(t * 25 + i * 1.7)) * 1.3); g.fillStyle = i % 2 ? '#ff5a2a' : '#ffb040'; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(Math.cos(an + 0.4) * r * 0.8, Math.sin(an + 0.4) * r * 0.8); g.lineTo(Math.cos(an) * L, Math.sin(an) * L); g.lineTo(Math.cos(an - 0.4) * r * 0.8, Math.sin(an - 0.4) * r * 0.8); g.fill(); }
      g.globalAlpha = 0.35; g.fillStyle = Fo.circ === 'chaos' ? hsl(t * 400, 90, 60) : '#ff8a3a'; g.beginPath(); g.arc(0, 0, r * 1.9, 0, TAU); g.fill();
      g.globalAlpha = 1; g.fillStyle = '#ffb040'; g.beginPath(); g.arc(0, 0, r * 1.05, 0, TAU); g.fill();
      g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(Math.cos(a) * 1, Math.sin(a) * 1, r * 0.6, 0, TAU); g.fill();
      g.restore();
    },
    trail(sh) { tp(sh, { shape: 'flame', cols: flameCols, vx: rnd(-14, 14), vy: rnd(-8, 8), vz: 20, life: 0.35, size: 2 }); if (R() < 0.35) tp(sh, { shape: 'smoke', col: '#3a2a2a', vz: 12, life: 0.7, size: 2, grow: 1.5 }); if (R() < 0.3) mote(sh.x, sh.y, sh.zoff, focOf(sh.focId), { life: 0.4 }); },
    hit(sh, e) { fireBoom(e ? e.x : sh.x, e ? e.y - 8 : sh.y, 1); },
    end(sh) { if (!(sh.hit && sh.hit.size)) fireBoom(sh.x, sh.y, 0.8); },
  };
  function fireBoom(x, y, k) {
    burst(x, y, Math.round(14 * k), { shape: 'flame', cols: flameCols, sp: 90 * k, z: 6, vz: 40, g: 0, life: 0.5, size: 2 });
    burst(x, y, Math.round(5 * k), { shape: 'smoke', col: '#3a2a2a', sp: 30, z: 8, vz: 16, g: 0, life: 0.9, size: 3, grow: 1.5 });
    burst(x, y, Math.round(10 * k), { shape: 'spark', col: ['#ffd84a', '#ffffff'], sp: 140, z: 8, vz: 50, g: 200, life: 0.35, add: true });
    decal({ kind: 'scorch', x, y: y + 8, r: 14 * k, life: 2.2 });
    GL(x, y, 34 * k, '#ff8a3a', 0.4, { pulse: true });
  }
  VX.fireBoom = fireBoom; VX.flameCols = flameCols;
  VIS.spell_ice = { light: 14, hist: 5, ribbon: () => ({ col: '#bfe8ff', w: 3, a: 0.4 }),
    draw(g, x, y, a, sh) {
      const r = sh.r || 4;
      g.save(); g.translate(x, y); g.rotate(a);
      g.globalAlpha = 0.3; g.fillStyle = '#8ad8ff'; g.beginPath(); g.ellipse(-2, 0, r * 3, r * 1.4, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
      // 깎인 얼음 창: 길쭉한 마름모 + 면
      g.fillStyle = '#8ac8f0'; g.beginPath(); g.moveTo(r * 2.4, 0); g.lineTo(0, -r * 0.8); g.lineTo(-r * 2.6, 0); g.lineTo(0, r * 0.8); g.closePath(); g.fill();
      g.fillStyle = '#e8f8ff'; g.beginPath(); g.moveTo(r * 2.4, 0); g.lineTo(0, -r * 0.8); g.lineTo(-r * 0.6, 0); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.fillRect(Math.round(r * 1.6), -0.5, 2, 1);
      // 둘레 서리 조각
      for (let i = 0; i < 3; i++) { const an = sh.t * 12 + i * 2.1; g.fillStyle = '#ffffff'; g.fillRect(Math.round(Math.cos(an) * r * 1.6) - 3, Math.round(Math.sin(an) * r * 1.2), 1, 1); }
      g.restore();
    },
    trail(sh) { if (R() < 0.6) tp(sh, { shape: 'snow', col: '#ffffff', vx: rnd(-10, 10), vy: rnd(-6, 6), vz: -4, g: 8, life: 0.5, size: R() < 0.3 ? 2 : 1 }); if (R() < 0.3) tp(sh, { shape: 'smoke', col: '#d8f0ff', vz: 2, life: 0.4, size: 2, a: 0.5 }); if (R() < 0.25) mote(sh.x, sh.y, sh.zoff, focOf(sh.focId), { life: 0.4 }); },
    hit(sh, e) { const x = e ? e.x : sh.x, y = e ? e.y - 8 : sh.y; burst(x, y, 10, { shape: 'shard', col: ['#bfe8ff', '#ffffff', '#8ac8f0'], sp: 90, z: 10, vz: 50, g: 220, life: 0.55, spin: 12, size: 2 }); GL(x, y, 20, '#8ad8ff', 0.3, { pulse: true }); decal({ kind: 'frost', x, y: y + 8, r: 12, life: 1.8 }); },
    end(sh) { if (!(sh.hit && sh.hit.size)) burst(sh.x, sh.y, 6, { shape: 'shard', col: ['#bfe8ff', '#ffffff'], sp: 60, z: sh.zoff, vz: 30, g: 200, life: 0.4, spin: 10 }); },
  };
  VIS.spell_wind = { hist: 6, ribbon: () => ({ col: '#c8fff0', w: 3, a: 0.3, wave: 2 }),
    draw(g, x, y, a, sh) {
      g.save(); g.translate(x, y); g.rotate(a);
      for (let i = 0; i < 3; i++) { g.globalAlpha = 0.9 - i * 0.25; g.strokeStyle = i ? '#c8fff0' : '#ffffff'; g.lineWidth = 2 - i * 0.5; g.beginPath(); g.arc(-3 - i * 4, 0, 7 + i, -1.2 + Math.sin(sh.t * 20) * 0.1, 1.2); g.stroke(); }
      g.restore();
    },
    trail(sh) { if (R() < 0.5) tp(sh, { shape: 'leaf', col: pick(['#a8e8b8', '#ffffff']), vx: -sh.vy * 0.25, vy: sh.vx * 0.25, life: 0.4, size: 2, spin: 10, rot: R() * TAU }); },
    hit(sh, e) { swirl(e ? e.x : sh.x, e ? e.y - 8 : sh.y, '#c8fff0', 14); },
  };

  /* ═════════ 검: 날 모양마다 휘두르는 꼬리 · 칼끝 · 맞은 자리 ═════════ */
  const look = () => { const s = S(); return s && s.equip && G.gear && G.gear.lookOf ? G.gear.lookOf(D.ITEMS[s.equip.sword]) : null; };
  const SWS = VX.SWS = {
    flame: { col: '#ff8a3a', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-6, 6), vz: rnd(14, 30), g: 0, life: 0.35, shape: 'flame', cols: flameCols, size: 2 }), hit: (x, y) => fireBoom(x, y, 0.45), glow: '#ff8a3a' },
    crystal: { col: '#bfe8ff', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-6, 6), vz: -4, g: 20, life: 0.5, shape: 'snow', col: '#ffffff', size: 1 }), hit: (x, y) => { burst(x, y, 7, { shape: 'shard', col: ['#bfe8ff', '#ffffff'], sp: 70, z: 8, vz: 40, g: 200, life: 0.45, spin: 10 }); }, glow: '#8ad8ff' },
    storm: { col: '#ffe88a', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-60, 60), vy: rnd(-40, 40), vz: 0, g: 0, life: 0.1, shape: 'spark', col: pick(['#ffe066', '#ffffff']), add: true }), hit: (x, y) => { F.line({ kind: 'bolt', x0: x - 10, y0: y - 14, x1: x + 8, y1: y + 6, col: '#ffe066', w: 1, life: 0.15, amp: 4, n: 5, glow: true }); }, glow: '#ffe066', bolt: true },
    void: { col: '#8a5ad8', tip: (x, y) => P({ x: x + rnd(-8, 8), y: y + rnd(-6, 6), z: 0, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, shape: 'smoke', col: pick(['#1a0a2a', '#5a3a8a']), size: 2, grow: -0.5 }), hit: (x, y) => { burst(x, y, 6, { col: ['#c49bff', '#1a0a2a'], shape: 'diamond', sp: 40, z: 8, vz: 10, g: 0, life: 0.5, size: 1 }); ring(x, y + 6, '#5a3a8a', 12, 0.3, 2); }, glow: '#8a5ad8', dark: true },
    holy: { col: '#fff4c8', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-6, 6), vz: rnd(4, 14), g: 0, life: 0.6, shape: R() < 0.4 ? 'feather' : 'star', col: pick(['#fff8d8', '#ffe8a8', '#ffffff']), size: R() < 0.4 ? 2 : 1, spin: 4, rot: R() * TAU, flutter: true, add: true }), hit: (x, y) => rays(x, y, 6, 12, '#fff4c8', { w: 1, life: 0.2 }), glow: '#fff4c8' },
    prism: { col: '#ffffff', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-14, 14), vy: rnd(-8, 8), vz: rnd(4, 14), g: 0, life: 0.5, shape: 'star', col: hsl(W().t * 360 + R() * 90, 90, 70), add: true, tw: 14 }), hit: (x, y) => burst(x, y, 8, { shape: 'diamond', cols: null, col: ['#ff8a8a', '#ffe066', '#8ae07a', '#8ad8ff', '#c8a8ff'], sp: 70, z: 8, vz: 30, g: 60, life: 0.5, add: true }), glow: '#ffffff', rainbow: true },
    sky: { col: '#d8f0ff', tip: (x, y, a) => P({ x, y, z: 0, vx: Math.cos(a) * 160, vy: Math.sin(a) * 120, vz: 0, g: 0, life: 0.2, shape: 'line', len: 8, col: '#ffffff', a: 0.8 }), hit: (x, y) => swirl(x, y, '#d8f0ff', 12), glow: '#c8f0ff' },
    blood: { col: '#ff4a5a', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-20, 20), vy: rnd(-10, 10), vz: rnd(10, 30), g: 200, life: 0.5, shape: 'drop', col: pick(['#c83a4a', '#ff4a5a']), size: 1 }), hit: (x, y) => burst(x, y, 6, { shape: 'drop', col: ['#c83a4a', '#ff6a7a'], sp: 70, z: 8, vz: 40, g: 260, life: 0.4 }), glow: '#ff4a5a' },
    whip: { col: '#7ad86a', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-10, 10), vy: rnd(-6, 6), vz: rnd(4, 14), g: 40, life: 0.6, shape: R() < 0.5 ? 'petal' : 'leaf', col: pick(['#c84a8a', '#ff9ac8', '#5ab84a']), size: 2, spin: 6, rot: R() * TAU, flutter: true }), hit: (x, y) => burst(x, y, 5, { shape: 'petal', col: ['#ff9ac8', '#c84a8a'], sp: 50, z: 8, vz: 30, g: 40, life: 0.6, size: 2, spin: 6, flutter: true }) },
    moon: { col: '#c8d8ff', tip: (x, y) => P({ x, y, z: 0, vx: rnd(-6, 6), vy: rnd(-4, 4), vz: rnd(4, 10), g: 0, life: 0.5, shape: 'star', col: pick(['#c8d8ff', '#ffffff']), add: true, tw: 12 }), hit: (x, y, a) => slash(x, y, a + 0.8, '#c8d8ff', 14), glow: '#a8b8ff' },
    heavy: { col: '#e8e0d0', tip: () => {}, hit: (x, y) => { burst(x, y + 6, 6, { col: ['#a8987a', '#d8c8a8'], sp: 60, z: 2, vz: 60, g: 260, life: 0.5, size: 2 }); ring(x, y + 8, '#e8d8b8', 14, 0.3, 2); }, end: (x, y) => { burst(x, y, 6, { col: ['#d8c8a8', '#b8a888'], sp: 40, z: 1, vz: 20, g: 60, life: 0.4, size: 2 }); ring(x, y, '#d8c8a8', 12, 0.3, 1); } },
    quick: { col: '#e8f0ff', tip: () => {}, hit: (x, y, a) => { slash(x, y, a + 0.9, '#ffffff', 10); }, double: true },
    needle: { col: '#ffffff', tip: () => {}, hit: (x, y) => P({ x, y, z: 0, vx: 0, vy: 0, vz: 0, g: 0, life: 0.25, shape: 'star', col: '#ffffff', size: 4, add: true }) },
    twin: { col: '#e8d8a8', tip: () => {}, hit: (x, y, a) => { slash(x, y, a + 0.7, '#e8d8a8', 12); slash(x, y, a - 0.7, '#c8a8ff', 12); }, double: true },
    basic: { col: '#ffffff', tip: () => {}, hit: () => {} },
  };
  const STYLE2 = { flame: 'flame', crystal: 'crystal', storm: 'storm', void: 'void', holy: 'holy', prism: 'prism', sky: 'sky', blood: 'blood', whip: 'whip', broad: 'heavy', axe: 'heavy', hammer: 'heavy', horn: 'heavy', dagger: 'quick', thin: 'needle', curved: 'moon', twin: 'twin' };
  const swStyle = () => { const L = look(); if (!L) return SWS.basic; if (L.moon) return SWS.moon; return SWS[STYLE2[L.style]] || SWS.basic; };
  VX.swStyle = swStyle;
  /** 휘두르는 꼬리 위에 날 모양의 것을 더 그린다 (gear.js trailArc 끝에서) */
  VX.trail = function (g, hx, hy, a0, a1, r0, r1, k, col, gr, spin) {
    const st = swStyle(); if (!st) return;
    const Wd = W(), tx = hx + Math.cos(a1) * r1, ty = hy + 2 + Math.sin(a1) * r1 * 0.8;
    // 칼끝에서 흩어지는 것 (세계 좌표로)
    if (k < 0.95 && R() < 0.75) safe(st.tip, tx + Wd.rcx, ty + Wd.rcy, a1 + (a1 > a0 ? Math.PI / 2 : -Math.PI / 2));
    g.save();
    const fade = 1 - (k > 0.8 ? (k - 0.8) * 4 : 0);
    if (st.rainbow) {   // 프리즘: 무지갯빛 띠
      for (let i = 0; i < 5; i++) { g.globalAlpha = 0.35 * fade; g.strokeStyle = ['#ff6a6a', '#ffd84a', '#6ae07a', '#6ab8ff', '#c88aff'][i]; g.lineWidth = 2; g.beginPath(); g.ellipse(hx, hy + 2, r1 - 4 + i * 1.5, (r1 - 4 + i * 1.5) * 0.8, 0, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); }
    } else if (st.dark) {   // 심연: 검은 속 · 보랏빛 가장자리
      g.globalAlpha = 0.55 * fade; g.strokeStyle = '#1a0a2a'; g.lineWidth = 4; g.beginPath(); g.ellipse(hx, hy + 2, r1 - 3, (r1 - 3) * 0.8, 0, Math.min(a0, a1), Math.max(a0, a1)); g.stroke();
      g.globalAlpha = 0.8 * fade; g.strokeStyle = '#c49bff'; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy + 2, r1 + 1, (r1 + 1) * 0.8, 0, Math.min(a0, a1), Math.max(a0, a1)); g.stroke();
    } else if (st.bolt && k < 0.8) {   // 폭풍: 칼자국을 따라 번개가 튄다
      g.globalAlpha = 0.9 * fade; g.strokeStyle = '#fff8a8'; g.lineWidth = 1; g.beginPath();
      for (let i = 0; i <= 8; i++) { const an = U.lerp(a0, a1, i / 8), rr = r1 + (i % 2 ? 2 : -1) + Math.sin(Wd.t * 80 + i) * 1.5; const px = hx + Math.cos(an) * rr, py = hy + 2 + Math.sin(an) * rr * 0.8; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
      g.stroke();
    } else if (st === SWS.flame) {   // 불꽃: 바깥 가장자리에 불 혀
      for (let i = 0; i < 6; i++) { const an = U.lerp(a0, a1, (i + 0.5) / 6), px = hx + Math.cos(an) * (r1 + 1), py = hy + 2 + Math.sin(an) * (r1 + 1) * 0.8, h = 2 + Math.abs(Math.sin(Wd.t * 30 + i)) * 4; g.globalAlpha = 0.75 * fade * (i / 6); g.fillStyle = i % 2 ? '#ffb040' : '#ff5a2a'; g.fillRect(Math.round(px), Math.round(py - h), 2, h); }
    } else if (st.double) {   // 단검 · 쌍월: 안쪽에 둘째 칼자국
      g.globalAlpha = 0.5 * fade; g.strokeStyle = st.col; g.lineWidth = 1; g.beginPath(); g.ellipse(hx, hy + 2, r1 - 5, (r1 - 5) * 0.8, 0, Math.min(a0, a1) + 0.2, Math.max(a0, a1)); g.stroke();
    } else if (st === SWS.needle && k < 0.6) {   // 레이피어: 칼끝 반짝임
      g.globalAlpha = fade; g.fillStyle = '#ffffff'; g.fillRect(Math.round(tx) - 3, Math.round(ty), 7, 1); g.fillRect(Math.round(tx), Math.round(ty) - 3, 1, 7);
    }
    g.restore();
    if (st.glow && R() < 0.3) GL(tx + Wd.rcx, ty + Wd.rcy, 10, st.glow, 0.12, { pulse: true });
    if (VX.swordTier) safe(VX.swordTier, g, hx, hy, a0, a1, r1, k, gr, tx + Wd.rcx, ty + Wd.rcy);   // 검의 등급 (vfx2.js)
  };
  // 맞힌 자리: 검 모양마다
  const od0 = C.onDamage;
  C.onDamage = function (e, info) {
    const r = od0 ? od0.apply(this, arguments) : undefined;
    if (!info || info.proc) return r;
    const w = info.w || ({ sword: 'sword', spin: 'sword', dash: 'sword', lunge: 'sword' })[info.src];
    if (w === 'sword' && !info.skill) { const st = swStyle(), p = W().player; if (st && st.hit && p) safe(st.hit, e.x, e.y - (e.h || 16) / 2, Math.atan2(e.y - p.y, e.x - p.x)); }
    return r;
  };

  /* ═════════ 주인공의 몸짓 ═════════ */
  // 스킬을 쓰는 동안: 든 무기에 맞는 그림 (예전엔 'skill' 상태가 서 있는 그림이었다)
  VX.skillAnim = function (e) {
    const K = e.skill, A = K && SN.ASK[K.id]; if (!A) return null;
    const V = VX.SKV[K.id]; if (V && V.anim) { const r = V.anim(e, K); if (r) return r; }
    const k = K.t / Math.max(0.05, K.dur);
    if (A.w === 'bow') return { anim: 'bow', frame: k > 0.15 ? 1 : 0 };
    if (A.w === 'magic') return { anim: 'cast', frame: Math.floor(e.t * 8) };
    return { anim: 'atk', frame: e.atkFrame != null && K.t > 0.02 ? e.atkFrame : k < 0.3 ? 0 : k < 0.7 ? 1 : 2 };
  };
  VX.skillMotion = function (e) {
    const K = e.skill, A = K && SN.ASK[K.id]; if (!A) return null;
    const V = VX.SKV[K.id]; if (V && V.motion) { const r = V.motion(e, K); if (r) return r; }
    const side = e.dir === 'left' ? -1 : e.dir === 'right' ? 1 : 0, k = K.t / Math.max(0.05, K.dur);
    if (A.w === 'bow') return { sx: 1.03, sy: 0.97, rot: -side * 0.07, dx: -side * (k < 0.5 ? k * 2 : 1) };
    if (A.w === 'magic') { const s2 = 1 + Math.sin(e.t * 26) * 0.04; return { sx: 2 - s2, sy: s2, rot: side * 0.04, dx: 0 }; }
    return k < 0.3 ? { sx: 1.08, sy: 0.93, rot: -side * 0.08, dx: 0 } : { sx: 0.94, sy: 1.07, rot: side * 0.12, dx: side * 1.5 };
  };
  VX.spMotion = function (e) {
    const X = e.spx, V = X && VX.SPV[X.id]; if (V && V.motion) return V.motion(e, X);
    return null;
  };
  /** 활 스킬 · 활 필살기의 자세 (gear.js drawWeapon이 부른다): a 겨누는 각 · pull 당김 · full */
  VX.bowPose = function (p, K, X) {
    const V = K ? VX.SKV[K.id] : X ? VX.SPV[X.id] : null;
    return V && V.bowPose ? V.bowPose(p, K || X) : null;
  };
  /** 마법 스킬 · 필살기 · 주문의 지팡이 각 */
  const SKYSP = { meteor: 1, light: 1, heal: 1, blizzard: 1, barrier: 1 };
  VX.staffAngle = function (p, fa) {
    if (p.state === 'cast') return SKYSP[p.castSpell] ? -Math.PI / 2 + Math.cos(fa) * 0.3 : fa;
    const K = p.state === 'skill' ? p.skill : null, X = p.state === 'sp' ? p.spx : null;
    const V = K ? VX.SKV[K.id] : X ? VX.SPV[X.id] : null;
    if (V && V.staff) return V.staff(p, K || X, fa);
    return fa;
  };

  /* ═════════ 매 프레임 ═════════ */
  const up0 = C.update;
  C.update = function (dt) {
    const r = up0.apply(this, arguments);
    CTX.frame++;
    const p = W() && W().player;
    if (p) {
      safe(bowTick, p, dt);
      if (p.vjz && p.state !== 'skill' && p.state !== 'sp') { p.jz = 0; p.vjz = false; }
      if (VX.auras) safe(VX.auras, p, dt);
    }
    return r;
  };
})();
