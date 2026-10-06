/* 무기 이펙트 (2) — 스킬 예순 · 필살기 서른하나
   스킬마다: 거는 순간(빛깔 · 꼴이 다른 시작) · 쓰는 동안의 몸짓(뛰어오르기 · 무릎 꿇기 · 하늘로 겨누기 · 지팡이 들기 …) ·
   그것만의 탄(화살 · 주문의 모양 · 꼬리) · 맞은 자리 · 바닥 자국(그을림 · 서리 · 갈라짐 · 마법진)
   필살기마다: 시작 · 진행 중 · 끝의 연출을 더한다 (공중 부양 · 하늘이 어두워짐 · 빛기둥 · 별가루 …)
   수치(피해 · 범위 · 시간)는 그대로 — 그리기와 입자만 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, C = G.combat, F = G.fx, VX = G.vfx, SN = G.stance;
  const W = () => G.world, S = () => G.state;
  const TAU = Math.PI * 2, R = G.vfx.R, slash = G.vfx.slash;
  const { burst, rays, ring, decal, GL, hsl, rnd, pick, safe } = VX;
  const P = (o) => F.part(o);
  const VIS = VX.VIS, SKV = VX.SKV, SPV = VX.SPV;
  const ang = (p) => Math.atan2(p.face[1], p.face[0]);
  const side = (p) => (p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0);
  const flameCols = VX.flameCols;
  const ghost = (p, a, col) => { if (!p.sheet) return; const img = p.sheet.get('atk', p.dir, 1); if (!img) return; F.afterimage(col ? G.gfx.silhouette(img, col) : img, p.x - img.width / 2, p.y - img.height - (p.jz || 0), a || 0.45); };
  const jz = (p, h) => { p.jz = Math.max(0, h); p.vjz = true; };
  const front = (p, d) => [p.x + p.face[0] * d, p.y + p.face[1] * d * 0.85];
  const sil = new Map();
  const silImg = (img, col) => { const k = col; let m = sil.get(img); if (!m) { m = {}; sil.set(img, m); } return m[k] || (m[k] = G.gfx.silhouette(img, col)); };

  /* ═════════ 활 스킬 탄: 든 활의 화살 + 스킬만의 덧칠 ═════════ */
  function arrowVis(o) {
    return {
      hist: o.hist || 8, light: o.light,
      ribbon: (sh) => (o.rib ? (typeof o.rib === 'function' ? o.rib(sh) : o.rib) : VIS.arrow.ribbon(sh)),
      draw(g, x, y, a, sh) {
        if (o.under) o.under(g, x, y, a, sh);
        g.save(); g.translate(x, y); g.rotate(a); if (o.scale) g.scale(o.scale, o.scale);
        VX.arrowBody(g, o.sig ? VX.BOWS[o.sig] : VX.bowSig(sh.bowId), sh, sh.charged || sh.heavy);
        if (o.tint) { g.globalAlpha = 0.45 + Math.sin(sh.t * 30) * 0.2; g.fillStyle = o.tint; g.fillRect(-12, -2, 18, 4); g.globalAlpha = 1; }
        g.restore();
        if (o.over) o.over(g, x, y, a, sh);
      },
      trail(sh) { if (o.bowTrail !== false) VIS.arrow.trail(sh); if (o.trail) o.trail(sh); },
      hit(sh, e) { if (o.bowHit !== false) VIS.arrow.hit(sh, e); if (o.hit) o.hit(sh, e, e ? e.x : sh.x, e ? e.y - (e.h || 16) / 2 : sh.y); },
      end(sh) { if (o.end) o.end(sh); else VIS.arrow.end(sh); },
    };
  }
  const tp = VX.tp;

  /* ═════════ 검 스킬 스물 ═════════ */
  const SW = {
    a_dash: { col: '#ffd8a8',
      pre(p) { p.vDash = [p.x, p.y]; burst(p.x, p.y, 8, { col: ['#d8c8a8', '#b8a888'], sp: 50, z: 1, vz: 20, g: 80, life: 0.4, size: 2, a0: ang(p) + Math.PI, spread: 1.4 }); },
      tick(p, K) { if (K.t < K.dur) { P({ x: p.x + rnd(-4, 4), y: p.y, z: 1, vx: -p.face[0] * 40, vy: -p.face[1] * 30, vz: 10, g: 60, life: 0.3, col: '#d8c8a8', size: 2 }); P({ x: p.x, y: p.y, z: rnd(4, 16), vx: -p.face[0] * 200, vy: -p.face[1] * 150, vz: 0, g: 0, life: 0.12, shape: 'line', len: 10, col: '#ffffff', a: 0.8 }); } else if (p.vDash) { const [x0, y0] = p.vDash; p.vDash = null; F.line({ kind: 'beam', x0, y0: y0 - 8, x1: p.x, y1: p.y - 8, col: VX.swStyle().col, w: 5, life: 0.3, glow: true }); } },
      motion: (e) => ({ sx: 1.12, sy: 0.9, rot: side(e) * 0.22, dx: side(e) * 2 }) },
    a_break: { col: '#ff8a5a',
      tick(p, K) { if (K.done && !K.vDone) { K.vDone = true; const a = ang(p), hx = p.x + Math.cos(a) * 14, hy = p.y + Math.sin(a) * 12; decal({ kind: 'crack', x: hx, y: hy, r: 26, life: 2 }); burst(hx, hy, 10, { col: ['#a8987a', '#d8c8a8', '#6a5a4a'], sp: 70, z: 2, vz: 80, g: 300, life: 0.6, size: 2 }); F.line({ kind: 'beam', x0: hx, y0: hy - 40, x1: hx, y1: hy, col: '#ff8a5a', w: 6, life: 0.2, glow: true }); GL(hx, hy - 6, 26, '#ff8a5a', 0.3, { pulse: true }); } },
      motion: (e, K) => (K.t < 0.16 ? { sx: 0.92, sy: 1.1, rot: -side(e) * 0.1, dx: 0 } : { sx: 1.14, sy: 0.88, rot: side(e) * 0.16, dx: side(e) * 2 }),
      anim: (e, K) => ({ anim: 'atk', frame: K.t < 0.16 ? 0 : 2 }) },
    a_cyclone: { col: '#ffffff',
      post(p, s, d) { const r = d.reach + 14; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; slash(p.x + Math.cos(a) * r * 0.8, p.y - 6 + Math.sin(a) * r * 0.55, a + Math.PI / 2, i % 2 ? '#ffffff' : VX.swStyle().col, 12); } VX.swirl(p.x, p.y - 4, '#e8f4ff', r * 0.6); burst(p.x, p.y, 12, { col: ['#d8c8a8', '#b8a888'], sp: 90, z: 1, vz: 20, g: 80, life: 0.45, size: 2 }); GL(p.x, p.y - 8, r, '#e8f4ff', 0.3, { pulse: true }); },
      motion: (e, K) => ({ sx: 1 - Math.sin(K.t * 40) * 0.08, sy: 1, rot: Math.sin(K.t * 30) * 0.2, dx: 0 }) },
    a_parry: { col: '#8ad8ff',
      tick(p, K) { if (K.t < K.dur && R() < 0.8) { const a = ang(p) + rnd(-1.1, 1.1); P({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 10, z: 10, vx: 0, vy: 0, vz: 0, g: 0, life: 0.15, shape: 'diamond', col: pick(['#8ad8ff', '#e8f8ff']), size: 1, add: true }); } },
      motion: () => ({ sx: 1.06, sy: 0.94, rot: 0, dx: 0 }), anim: () => ({ anim: 'atk', frame: 0 }) },
    a_wave: { col: '#d8a868',
      pre(p) { decal({ kind: 'crack', x: p.x + p.face[0] * 10, y: p.y + p.face[1] * 8, r: 20, life: 1.6 }); },
      vis: { hist: 6, ribbon: () => ({ col: '#d8a868', w: 4, a: 0.4, core: '#ffe8c8' }),
        draw(g, x, y, a, sh) { g.save(); g.translate(x, y + sh.zoff - 4); g.rotate(a); g.fillStyle = '#6a4a2a'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-10, -5); g.lineTo(-6, 0); g.lineTo(-10, 5); g.closePath(); g.fill(); g.fillStyle = '#ffe8c8'; g.fillRect(-4, -0.5, 10, 1); g.restore(); },
        trail(sh) { sh._wc = (sh._wc || 0) + 1; if (sh._wc % 3 === 0) W().add(new VX.Spike({ x: sh.x + rnd(-6, 6), y: sh.y + sh.zoff - 2 + rnd(-4, 4), life: 0.45, col: '#a8784a', col2: '#d8b080', h: 8 + R() * 8 })); if (sh._wc % 4 === 0) decal({ kind: 'crack', x: sh.x, y: sh.y + sh.zoff, r: 10, life: 1.4 }); P({ x: sh.x, y: sh.y + sh.zoff - 2, z: 1, vx: rnd(-20, 20), vy: rnd(-10, 10), vz: rnd(30, 60), g: 260, life: 0.4, col: pick(['#a8784a', '#d8b080']), size: 2 }); },
        hit(sh, e) { burst(e.x, e.y - 8, 6, { col: ['#a8784a', '#d8b080'], sp: 60, z: 6, vz: 50, g: 260, life: 0.4, size: 2 }); } } },
    a_lunge2: { col: '#ffe066',
      pre(p) { p.vL = [p.x, p.y]; },
      tick(p, K) { if (K.t < K.dur) P({ x: p.x + rnd(-3, 3), y: p.y, z: rnd(4, 14), vx: rnd(-50, 50), vy: rnd(-40, 40), vz: 0, g: 0, life: 0.12, shape: 'spark', col: pick(['#ffe066', '#ffffff']), add: true }); else if (p.vL) { const [x0, y0] = p.vL; p.vL = null; F.line({ kind: 'bolt', x0, y0: y0 - 9, x1: p.x + p.face[0] * 14, y1: p.y - 9 + p.face[1] * 10, col: '#ffe066', w: 2, life: 0.25, amp: 4, n: 7, glow: true, branch: true }); GL(p.x, p.y - 9, 20, '#ffe066', 0.2, { pulse: true }); } },
      motion: (e) => ({ sx: 1.14, sy: 0.88, rot: side(e) * 0.18, dx: side(e) * 2 }), anim: () => ({ anim: 'atk', frame: 2 }) },
    a_upper: { col: '#ffe8c8',
      post(p, s, d) { const [x, y] = front(p, 14); F.line({ kind: 'beam', x0: x, y0: y + 2, x1: x + p.face[0] * 4, y1: y - 40, col: '#ffe8c8', w: 4, life: 0.25, glow: true }); burst(x, y, 10, { col: ['#d8c8a8', '#ffffff'], sp: 30, z: 2, vz: 120, vzr: 60, g: 260, life: 0.5, size: 1, a0: -Math.PI / 2, spread: 1 }); for (const e of C.foes()) if (U.dist(e.x, e.y, x, y) < d.reach + 12) burst(e.x, e.y, 4, { shape: 'line', col: '#ffffff', sp: 10, z: 10, vz: 140, g: 0, life: 0.2, len: 6 }); },
      motion: (e, K) => ({ sx: 0.9, sy: 1.12, rot: side(e) * 0.08, dx: 0 }), anim: (e, K) => ({ anim: K.t < 0.06 ? 'atk' : 'jump', frame: 0 }) },
    a_cross: { col: '#fff4d8',
      post(p) { const [x, y] = front(p, 16), a = ang(p); C.after(0.02, () => slash(x, y - 10, a + 0.8, '#fff4d8', 18)); C.after(0.17, () => { slash(x, y - 10, a - 0.8, '#ffffff', 18); GL(x, y - 10, 18, '#fff4d8', 0.25, { pulse: true }); burst(x, y - 4, 8, { shape: 'star', col: ['#fff4d8', '#ffffff'], sp: 60, z: 8, vz: 0, g: 0, life: 0.3, add: true }); }); },
      anim: (e, K) => ({ anim: 'atk', frame: K.t < 0.15 ? 1 : 2 }), motion: (e, K) => ({ sx: 0.95, sy: 1.06, rot: (K.t < 0.15 ? 1 : -1) * side(e) * 0.14 || (K.t < 0.15 ? 0.1 : -0.1), dx: 0 }) },
    a_spin3: { col: '#ffffff',
      post(p, s, d) { const cols = ['#ffffff', '#ffe066', '#ff8a5a']; for (let i = 0; i < 3; i++) C.after(i * 0.17, () => { const pl = W().player; ring(pl.x, pl.y - 6, cols[i], d.reach + 10 + i * 5, 0.3, 2 + i); burst(pl.x, pl.y - 6, 6 + i * 4, { shape: 'spark', col: [cols[i], '#ffffff'], sp: 100 + i * 30, z: 8, vz: 10, g: 60, life: 0.3, add: true }); }); },
      motion: (e, K) => ({ sx: 1, sy: 1, rot: Math.sin(K.t * 40) * 0.25, dx: 0 }) },
    a_shout: { col: '#ff8a5a',
      post(p) { for (let i = 0; i < 3; i++) C.after(i * 0.1, () => { const pl = W().player; ring(pl.x, pl.y - 6, i ? '#ffb070' : '#ff5a3a', 20 + i * 18, 0.4, 3 - i); }); burst(p.x, p.y, 16, { shape: 'flame', cols: ['#fff2b0', '#ff8a5a', '#c83a2a'], sp: 50, z: 4, vz: 40, g: 0, life: 0.5, size: 2 }); GL(p.x, p.y - 10, 30, '#ff5a3a', 0.4, { pulse: true }); },
      motion: (e, K) => ({ sx: 1.08 + Math.sin(K.t * 60) * 0.03, sy: 0.94, rot: 0, dx: Math.sin(K.t * 80) * 0.8 }), anim: () => ({ anim: 'shock', frame: 0 }) },
    a_storm2: { col: '#fff8dc',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); if (R() < 0.7) { const a = this.t * 14 + R() * 6, r = 30 + R() * 8; P({ x: this.x + Math.cos(a) * r, y: this.y - 8 + Math.sin(a) * r * 0.6, z: 0, vx: Math.cos(a + 1.6) * 120, vy: Math.sin(a + 1.6) * 80, vz: 0, g: 0, life: 0.15, shape: 'spark', col: pick(['#ffffff', '#fff8dc', '#c8d8ff']), add: true }); } if (R() < 0.3) P({ x: this.x + rnd(-30, 30), y: this.y + rnd(-14, 14), z: 1, vx: 0, vy: 0, vz: 20, g: 60, life: 0.4, col: '#d8c8a8', size: 2 }); }; } },
    a_flash2: { col: '#c8b8ff',
      pre(p) { p.vF = [p.x, p.y]; burst(p.x, p.y, 10, { shape: 'smoke', col: ['#3a2a5a', '#1a0a2a'], sp: 30, z: 6, vz: 10, g: 0, life: 0.6, size: 3, grow: 1 }); },
      post(p) { if (!p.vF) return; const [x0, y0] = p.vF; p.vF = null; F.line({ kind: 'beam', x0, y0: y0 - 9, x1: p.x, y1: p.y - 9, col: '#5a3a8a', w: 5, life: 0.3, glow: true, core: '#c8b8ff' }); burst(p.x, p.y, 8, { shape: 'smoke', col: ['#3a2a5a', '#6a5aa8'], sp: 30, z: 6, vz: 10, g: 0, life: 0.5, size: 2, grow: 1 }); const e = C.foes().sort((a, b) => U.dist(p.x, p.y, a.x, a.y) - U.dist(p.x, p.y, b.x, b.y))[0]; if (e) { slash(e.x, e.y - 10, ang(p) + 0.6, '#c8b8ff', 22); slash(e.x, e.y - 10, ang(p) - 0.9, '#ffffff', 16); } } },
    a_quake2: { col: '#d8a868',
      tick(p, K) {
        if (!K.done) jz(p, Math.sin(Math.min(1, K.t / 0.3) * Math.PI) * 16 + (K.t > 0.15 ? 0 : 0));
        if (K.t < 0.3 && R() < 0.5) P({ x: p.x + rnd(-6, 6), y: p.y, z: (p.jz || 0) + rnd(0, 16), vx: 0, vy: 0, vz: -60, g: 0, life: 0.15, shape: 'line', col: '#ffe8c8', len: 6 });
        if (K.done && !K.vDone) { K.vDone = true; jz(p, 0); decal({ kind: 'crater', x: p.x, y: p.y, r: 40, life: 2.6 }); decal({ kind: 'crack', x: p.x, y: p.y, r: 56, life: 2.4 }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; W().add(new VX.Spike({ x: p.x + Math.cos(a) * 34, y: p.y + Math.sin(a) * 24, life: 0.6, col: '#a8784a', col2: '#d8b080', h: 10 + R() * 8 })); } burst(p.x, p.y, 18, { col: ['#a8784a', '#d8b080', '#6a5a4a'], sp: 120, z: 2, vz: 90, g: 300, life: 0.7, size: 2 }); GL(p.x, p.y - 6, 50, '#ffb070', 0.35, { pulse: true }); }
      },
      motion: (e, K) => (K.t < 0.3 ? { sx: 0.9, sy: 1.12, rot: 0, dx: 0 } : { sx: 1.2, sy: 0.82, rot: 0, dx: 0 }), anim: (e, K) => ({ anim: K.t < 0.28 ? 'jump' : 'atk', frame: 2 }) },
    a_phantom: { col: '#c8d8ff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { const pl = W().player; for (let i = 0; i < 3; i++) { const a = this.t * 4 + i * 2.094; for (let k = 1; k <= 3; k++) { const a2 = a - k * 0.12, x = this.x - cx + Math.cos(a2) * 26, y = this.y - cy - 8 + Math.sin(a2) * 18; g.globalAlpha = 0.25 / k; g.fillStyle = '#c8d8ff'; g.fillRect(Math.round(x) - 1, Math.round(y) - 4, 3, 7); } } g.globalAlpha = 1; p0.call(this, g, cx, cy); if (pl && R() < 0.4) { const a = this.t * 4 + ((R() * 3) | 0) * 2.094; P({ x: this.x + Math.cos(a) * 26, y: this.y + Math.sin(a) * 18, z: 8, vx: 0, vy: 0, vz: 6, g: 0, life: 0.4, shape: 'star', col: '#e8f0ff', add: true }); } }; } },
    a_heaven: { col: '#fff4c8',
      post(p) { const [x, y] = front(p, 64); decal({ kind: 'glyph', x, y, r: 50, life: 1.8, col: '#ffe8a8', spin: 2 }); rays(p.x, p.y - 20, 8, 22, '#fff4c8', { w: 2, life: 0.35 }); GL(p.x, p.y - 30, 30, '#fff4c8', 0.6); },
      ent(e) { if (!e.paint || e.life > 0.25) return; const u0 = e.update; e.update = function (dt) { u0.call(this, dt); if (this.dead || this.t + dt >= this.life) { if (!this._vb) { this._vb = 1; F.line({ kind: 'beam', x0: this.x, y0: this.y - 60, x1: this.x, y1: this.y, col: '#ffe8a8', w: 5, life: 0.22, glow: true }); burst(this.x, this.y, 8, { shape: 'star', col: ['#fff4c8', '#ffd84a'], sp: 70, z: 4, vz: 30, g: 40, life: 0.5, add: true }); decal({ kind: 'scorch', x: this.x, y: this.y, r: 8, life: 1.2, col: '#ffe8a8' }); } } }; },
      anim: () => ({ anim: 'cast', frame: 0 }), motion: () => ({ sx: 0.94, sy: 1.08, rot: 0, dx: 0 }) },
    a_draw: { col: '#fff4d8',
      tick(p, K) {
        if (!K.done) { if (K.t > 0.1) GL(p.x, p.y - 9, 10 + K.t * 20, '#fff4d8', 0.05, { pulse: true }); }
        else if (!K.vDone) { K.vDone = true; const a = ang(p), x0 = p.x - Math.cos(a) * 40, y0 = p.y - 9; for (let i = 0; i < 14; i++) { const k = i / 14; P({ x: x0 + Math.cos(a) * 80 * k, y: y0 + 9 + Math.sin(a) * 68 * k, z: 9 + rnd(-4, 4), vx: rnd(-30, 30), vy: rnd(-10, 10), vz: rnd(4, 20), g: 30, life: 1, shape: 'petal', col: pick(['#ffd0e0', '#ff9ac8', '#ffffff']), size: 2, spin: 6, rot: R() * TAU, flutter: true }); } F.line({ kind: 'beam', x0, y0, x1: x0 + Math.cos(a) * 90, y1: y0 + Math.sin(a) * 76, col: '#fff4d8', w: 8, life: 0.35, glow: true }); }
      },
      motion: (e, K) => (K.done ? { sx: 1.16, sy: 0.86, rot: side(e) * 0.2, dx: side(e) * 2 } : { sx: 1.08, sy: 0.92, rot: -side(e) * 0.1, dx: 0 }), anim: (e, K) => ({ anim: 'atk', frame: K.done ? 2 : 0 }) },
    a_tornado: { col: '#e8f4ff',
      tick(p, K) { if (K.t >= K.dur) return; for (let i = 0; i < 2; i++) { const a = R() * TAU, h = rnd(0, 26), r = 8 + h * 0.6; P({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.4, z: h, vx: Math.cos(a + 1.6) * 90, vy: Math.sin(a + 1.6) * 36, vz: 30, g: 0, life: 0.25, shape: R() < 0.3 ? 'leaf' : 'line', col: pick(['#ffffff', '#e8f4ff', '#a8e8b8']), len: 4, size: 2, spin: 10, rot: R() * TAU }); } if (R() < 0.4) P({ x: p.x + rnd(-10, 10), y: p.y, z: 1, vx: rnd(-40, 40), vy: rnd(-20, 20), vz: 30, g: 120, life: 0.4, col: '#d8c8a8', size: 2 }); },
      motion: (e, K) => ({ sx: 1, sy: 1, rot: Math.sin(K.t * 50) * 0.3, dx: 0 }), anim: (e) => ({ anim: 'atk', frame: 1 }) },
    a_crescent: { col: '#c8d8ff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); if (R() < 0.6) P({ x: this.x + rnd(-10, 10), y: this.y + rnd(-10, 10), z: 8, vx: 0, vy: 0, vz: 4, g: 0, life: 0.5, shape: 'star', col: pick(['#c8d8ff', '#ffffff']), add: true, tw: 14 }); GL(this.x, this.y - 8, 16, '#a8c8ff', 0.05, { pulse: true }); }; } },
    a_blades: { col: '#fff4d8',
      tick(p, K) { if ((K.done || 0) > (K.vN || 0)) { K.vN = K.done; const c = ['#fff4d8', '#ffd84a', '#ff8a8a', '#c8a8ff', '#ffffff'][K.done % 5], [x, y] = front(p, 18); burst(x, y, 8, { shape: R() < 0.5 ? 'petal' : 'star', col: [c, '#ffffff'], sp: 70, z: 10, vz: 10, g: 30, life: 0.45, size: 2, spin: 6, add: true }); GL(x, y - 8, 14, c, 0.15, { pulse: true }); ghost(p, 0.3, c); } },
      motion: (e, K) => ({ sx: 0.95, sy: 1.05, rot: ((K.done || 0) % 2 ? 1 : -1) * 0.14, dx: ((K.done || 0) % 2 ? 1 : -1) }), anim: (e, K) => ({ anim: 'atk', frame: 1 + ((K.done || 0) % 2) }) },
    a_judgment: { col: '#ffd84a',
      tick(p, K) {
        if (!K.done) { const k = K.t / 0.6; if (R() < 0.6) { const a = R() * TAU; F.line({ kind: 'beam', x0: p.x + Math.cos(a) * 40, y0: p.y - 9 + Math.sin(a) * 30, x1: p.x + Math.cos(a) * 30, y1: p.y - 9 + Math.sin(a) * 22, col: '#ffd84a', w: 1, life: 0.12 }); } GL(p.x, p.y - 9, 10 + k * 26, '#ffd84a', 0.06, { pulse: true }); p.vDim = Math.min(0.45, k * 0.5); }
        else if (!K.vDone) { K.vDone = true; p.vDim = 0; const a = ang(p), L = 144, x0 = p.x, y0 = p.y - 9; for (let i = 0; i < 5; i++) C.after(i * 0.04, () => decal({ kind: 'crack', x: x0 + Math.cos(a) * (20 + i * 28), y: y0 + 9 + Math.sin(a) * (17 + i * 24), r: 16, life: 2.6 })); rays(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L * 0.85, 10, 26, '#ffd84a', { w: 2, life: 0.35 }); F.line({ kind: 'beam', x0, y0, x1: x0 + Math.cos(a) * L, y1: y0 + Math.sin(a) * L * 0.85, col: '#ffd84a', w: 14, life: 0.5, glow: true }); }
        if (K.t >= K.dur) p.vDim = 0;
      },
      motion: (e, K) => (K.done ? { sx: 1.18, sy: 0.85, rot: side(e) * 0.22, dx: side(e) * 2 } : { sx: 1.05 + Math.sin(K.t * 70) * 0.02, sy: 0.95, rot: -side(e) * 0.12, dx: Math.sin(K.t * 90) * 0.5 }), anim: (e, K) => ({ anim: 'atk', frame: K.done ? 2 : 0 }) },
  };

  /* ═════════ 활 스킬 스물 ═════════ */
  const skyPose = (p, K) => { const k = Math.min(1, K.t / Math.max(0.05, K.dur)); return { a: -Math.PI / 2 + (p.face[0] || 0) * 0.35, pull: k < 0.6 ? k / 0.6 : 0, full: k > 0.45 && k < 0.6 }; };
  const BW = {
    a_fan: { col: '#e8f0c0',
      post(p) { const a = ang(p), x = p.x + Math.cos(a) * 12, y = p.y - 8 + Math.sin(a) * 9; for (let i = -2; i <= 2; i++) F.line({ kind: 'beam', x0: x, y0: y, x1: x + Math.cos(a + i * 0.25) * 30, y1: y + Math.sin(a + i * 0.25) * 25, col: '#e8f0c0', w: 2, life: 0.18, glow: true }); burst(x, y + 8, 6, { shape: 'feather', col: ['#ffffff', '#e8f0c0'], sp: 60, z: 8, vz: 10, g: 20, life: 0.6, size: 2, spin: 4, flutter: true, a0: a, spread: 1.4 }); },
      vis: arrowVis({ rib: { col: '#e8f0c0', w: 1 }, trail: (sh) => { if (R() < 0.2) tp(sh, { shape: 'feather', col: '#ffffff', life: 0.4, size: 1, spin: 6, rot: R() * TAU }); } }) },
    a_leap: { col: '#8ad8ff',
      pre(p) { burst(p.x, p.y, 8, { col: ['#d8c8a8', '#b8a888'], sp: 50, z: 1, vz: 30, g: 120, life: 0.4, size: 2 }); },
      tick(p, K) { if (K.t < K.dur) { jz(p, Math.sin(Math.min(1, K.t / K.dur) * Math.PI) * 14); if (R() < 0.6) ghost(p, 0.3, '#8ad8ff'); } else jz(p, 0); },
      bowPose: (p, K) => ({ a: Math.atan2(-K.dir[1], -K.dir[0]), pull: K.t < K.dur * 0.6 ? K.t / (K.dur * 0.6) : 0, full: K.t > K.dur * 0.45 && K.t < K.dur * 0.6 }),
      motion: (e, K) => ({ sx: 0.92, sy: 1.08, rot: -(side(e) || 1) * Math.sin(K.t / K.dur * Math.PI) * 0.6, dx: 0 }), anim: () => ({ anim: 'bow', frame: 1 }),
      vis: arrowVis({ rib: { col: '#c8f0ff', w: 3, wave: 1.5, a: 0.4 }, trail: (sh) => { if (R() < 0.4) tp(sh, { shape: 'line', col: '#ffffff', vx: sh.vx * 0.1, vy: sh.vy * 0.1, len: 6, life: 0.15 }); } }) },
    a_snare: { col: '#a8e070',
      vis: arrowVis({ rib: { col: '#5ab84a', w: 2, wave: 2, a: 0.6 }, trail: (sh) => { if (R() < 0.35) tp(sh, { shape: 'leaf', col: pick(['#5ab84a', '#a8e070']), life: 0.5, size: 2, spin: 6, rot: R() * TAU, flutter: true }); },
        end(sh) { const x = sh.x, y = sh.y + 6; decal({ kind: 'glyph', x, y, r: 30, life: 2.5, col: '#5ab84a', spin: 1 }); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; W().add(new VX.Spike({ x: x + Math.cos(a) * 24, y: y + Math.sin(a) * 12, life: 2.4, col: '#3a8a3a', col2: '#a8e070', h: 10 + R() * 4 })); } burst(x, y, 10, { shape: 'leaf', col: ['#5ab84a', '#a8e070'], sp: 60, z: 4, vz: 30, g: 40, life: 0.8, size: 2, spin: 6, flutter: true }); } }) },
    a_rain: { col: '#e8f0c0',
      post(p) { const cx = p.x + p.face[0] * 64, cy = p.y + p.face[1] * 56; decal({ kind: 'glyph', x: cx, y: cy, r: 34, life: 1.8, col: '#e8f0c0', spin: 1.5 }); for (let i = 0; i < 8; i++) P({ x: p.x + rnd(-4, 4), y: p.y, z: 12, vx: 0, vy: 0, vz: 300, g: 0, life: 0.25, shape: 'line', col: '#ffffff', len: 8 }); for (let i = 0; i < 15; i++) C.after(0.1 * i + 0.02, () => { const x = cx + rnd(-28, 28), y = cy + rnd(-20, 20); P({ x, y, z: 60, vx: 0, vy: 0, vz: -300, g: 0, life: 0.2, shape: 'line', col: '#e8f0c0', len: 10 }); C.after(0.2, () => burst(x, y, 3, { col: '#d8c8a8', sp: 40, z: 1, vz: 20, g: 120, life: 0.25 })); }); },
      bowPose: skyPose, motion: (e) => ({ sx: 0.95, sy: 1.06, rot: 0, dx: 0 }) },
    a_pierce: { col: '#fff8c0',
      pre(p) { const a = ang(p); for (let i = 0; i < 3; i++) C.after(i * 0.04, () => { const pl = W().player; P({ x: pl.x + Math.cos(a) * (10 + i * 8), y: pl.y + Math.sin(a) * (8 + i * 6), z: 8, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, shape: 'ring', col: '#fff8c0', size: 3 + i * 2, grow: 1.5 }); }); GL(p.x, p.y - 8, 26, '#fff8c0', 0.25, { pulse: true }); },
      vis: arrowVis({ scale: 1.4, rib: { col: '#fff8c0', w: 6, a: 0.45 }, light: 20, trail: (sh) => { sh._pc = (sh._pc || 0) + 1; if (sh._pc % 4 === 0) P({ x: sh.x, y: sh.y, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, shape: 'ring', col: '#fff8c0', size: 4, grow: 2 }); tp(sh, { col: '#ffffff', vx: rnd(-20, 20), vy: rnd(-20, 20), life: 0.2, add: true }); }, hit: (sh, e, x, y) => { rays(x, y, 6, 18, '#fff8c0', { w: 2, life: 0.2 }); } }),
      motion: (e) => ({ sx: 1.1, sy: 0.92, rot: -side(e) * 0.12, dx: -side(e) * 2 }) },
    a_quick: { col: '#e8e0cc',
      vis: arrowVis({ rib: { col: '#ffffff', w: 1, core: false }, trail: (sh) => { if (R() < 0.5) { const [bx, by] = VX.back(sh, 8); P({ x: bx, y: by, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.1, shape: 'line', col: '#ffffff', len: 10, a: 0.5 }); } } }),
      post(p) { for (let i = 0; i < 3; i++) C.after(i * 0.08, () => { const pl = W().player, a = ang(pl); burst(pl.x + Math.cos(a) * 12, pl.y + Math.sin(a) * 9, 4, { shape: 'spark', col: ['#ffffff', '#ffe8a8'], sp: 90, z: 10, vz: 0, g: 0, life: 0.12, a0: a, spread: 0.8 }); }); },
      bowPose: (p, K) => ({ pull: (K.t * 12) % 1, full: false }), anim: () => ({ anim: 'bow', frame: 1 }) },
    a_hop: { col: '#fff4c0',
      tick(p, K) { if (K.t < K.dur) { jz(p, Math.sin(Math.min(1, K.t / K.dur) * Math.PI) * 6); if (R() < 0.5) ghost(p, 0.3, '#c8f0a0'); } else jz(p, 0); },
      bowPose: (p, K) => ({ a: C.faceAim ? undefined : undefined, pull: K.t < 0.12 ? K.t / 0.12 : 0, full: K.t > 0.08 && K.t < 0.12 }),
      motion: (e, K) => ({ sx: 0.95, sy: 1.05, rot: Math.sin(K.t / K.dur * Math.PI) * 0.15 * (K.dir[0] >= 0 ? 1 : -1), dx: 0 }) },
    a_firearrow: { col: '#ffb04a',
      post(p) { const a = ang(p); burst(p.x + Math.cos(a) * 12, p.y + Math.sin(a) * 9, 10, { shape: 'flame', cols: flameCols, sp: 70, z: 10, vz: 20, g: 0, life: 0.35, size: 2, a0: a, spread: 1 }); GL(p.x, p.y - 8, 20, '#ff8a3a', 0.2, { pulse: true }); },
      vis: arrowVis({ rib: { col: '#ff6a2a', w: 4, a: 0.45, core: '#ffd84a' }, light: 18, tint: '#ff8a3a', trail: (sh) => { tp(sh, { shape: 'flame', cols: flameCols, vx: rnd(-10, 10), vy: rnd(-6, 6), vz: 20, life: 0.35, size: 2 }); }, hit: (sh, e, x, y) => { VX.fireBoom(x, y, 0.55); } }) },
    a_icearrow: { col: '#bfe8ff',
      vis: arrowVis({ sig: 'bw_frost', rib: { col: '#bfe8ff', w: 4, a: 0.45 }, light: 16, trail: (sh) => { if (R() < 0.6) tp(sh, { shape: 'snow', col: '#ffffff', vx: rnd(-12, 12), vy: rnd(-8, 8), vz: -6, g: 10, life: 0.6, size: R() < 0.4 ? 2 : 1 }); },
        hit: (sh, e, x, y) => { decal({ kind: 'frost', x, y: y + 8, r: 22, life: 2.4 }); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; W().add(new VX.Spike({ x: x + Math.cos(a) * 12, y: y + 8 + Math.sin(a) * 6, life: 1.4, col: '#8ac8f0', col2: '#ffffff', h: 8 + R() * 6 })); } GL(x, y, 28, '#8ad8ff', 0.4, { pulse: true }); } }) },
    a_blast: { col: '#ffb84a',
      vis: arrowVis({ rib: { col: '#ffb84a', w: 2 }, trail: (sh) => { tp(sh, { shape: 'spark', col: pick(['#ffd84a', '#ffffff', '#ff8a3a']), vx: rnd(-50, 50), vy: rnd(-50, 50), vz: rnd(0, 30), g: 100, life: 0.2 }); if (R() < 0.3) tp(sh, { shape: 'smoke', col: '#5a5a5a', vz: 8, life: 0.5, size: 2, grow: 1 }); },
        over: (g, x, y, a, sh) => { if (Math.floor(sh.t * 20) % 2) { g.fillStyle = '#ff5a3a'; g.fillRect(Math.round(x + Math.cos(a) * 3) - 1, Math.round(y + Math.sin(a) * 3) - 1, 2, 2); } },
        end: (sh) => { const x = sh.x, y = sh.y; VX.fireBoom(x, y, 1.1); ring(x, y + 6, '#ffe8a8', 34, 0.4, 3); burst(x, y, 10, { shape: 'smoke', col: ['#5a5a5a', '#3a3a3a'], sp: 50, z: 6, vz: 20, g: 0, life: 1, size: 3, grow: 1.5 }); } }) },
    a_homing: { col: '#c8f0a0',
      vis: arrowVis({ hist: 14, rib: { col: '#8ae07a', w: 2, a: 0.6 }, light: 10, trail: (sh) => { if (R() < 0.5) tp(sh, { col: pick(['#c8f0a0', '#ffffff']), vx: rnd(-10, 10), vy: rnd(-10, 10), life: 0.4, add: true, shape: 'star', tw: 12 }); },
        over: (g, x, y) => { g.globalAlpha = 0.35; g.fillStyle = '#c8f0a0'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); g.globalAlpha = 1; } }) },
    a_ricochet: { col: '#e8f0ff',
      vis: arrowVis({ hist: 12, rib: { col: '#e8f0ff', w: 1, a: 0.8, taper: false }, light: 8, hit: (sh, e, x, y) => { P({ x, y, z: 8, vx: 0, vy: 0, vz: 0, g: 0, life: 0.25, shape: 'star', col: '#ffffff', size: 5, add: true }); ring(x, y + 6, '#e8f0ff', 10, 0.25, 1); } }) },
    a_barrage: { col: '#e8f0c0',
      pre(p) { GL(p.x, p.y - 8, 24, '#e8f0c0', 0.3, { pulse: true }); },
      vis: arrowVis({ rib: { col: '#e8f0c0', w: 1, core: false }, trail: (sh) => { if (R() < 0.3) tp(sh, { shape: 'line', col: '#ffffff', vx: sh.vx * 0.05, vy: sh.vy * 0.05, len: 6, life: 0.1 }); } }) },
    a_snipe2: { col: '#ff6a7a',
      tick(p, K) {
        const a = ang(p);
        if (!K.shot) { const L = 200; F.line({ kind: 'laser', x0: p.x + Math.cos(a) * 12, y0: p.y - 8 + Math.sin(a) * 10, x1: p.x + Math.cos(a) * L, y1: p.y - 8 + Math.sin(a) * L * 0.85, col: '#ff5a6a', life: 0.03, blink: K.t > 0.35, glow: true }); const tx = p.x + Math.cos(a) * 90, ty = p.y + Math.sin(a) * 76; if (R() < 0.3) VX.reticle({ x: tx, y: ty + 8, h: 16 }, '#ff5a6a'); GL(p.x + Math.cos(a) * 14, p.y - 8 + Math.sin(a) * 12, 6 + K.t * 14, '#ff6a7a', 0.04, { pulse: true }); }
        else if (!K.vShot) { K.vShot = true; for (let i = 0; i < 4; i++) C.after(i * 0.03, () => P({ x: p.x + Math.cos(a) * (14 + i * 12), y: p.y + Math.sin(a) * (12 + i * 10), z: 8, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, shape: 'ring', col: '#ffffff', size: 3 + i, grow: 2 })); burst(p.x, p.y, 8, { col: ['#d8c8a8', '#b8a888'], sp: 40, z: 1, vz: 20, g: 80, life: 0.4, size: 2, a0: a + Math.PI, spread: 1 }); }
      },
      vis: arrowVis({ scale: 1.3, rib: { col: '#ffffff', w: 3, a: 0.8, taper: false }, light: 18, trail: (sh) => { tp(sh, { col: '#ff8a9a', vx: rnd(-10, 10), vy: rnd(-10, 10), life: 0.25, add: true }); }, hit: (sh, e, x, y) => { VX.reticle(e || { x, y: y + 8, h: 16 }, '#ff5a6a'); rays(x, y, 8, 20, '#ffffff', { w: 2, life: 0.2 }); GL(x, y, 24, '#ff8a9a', 0.3, { pulse: true }); } }),
      motion: (e, K) => (K.shot ? { sx: 1.1, sy: 0.9, rot: -side(e) * 0.15, dx: -side(e) * 2 } : { sx: 1.1, sy: 0.86, rot: 0, dx: 0 }),   // 무릎 꿇고 겨눈다
      bowPose: (p, K) => ({ pull: K.shot ? 0 : Math.min(1, K.t / 0.4), full: !K.shot && K.t > 0.4 }), anim: () => ({ anim: 'bow', frame: 1 }) },
    a_comet: { col: '#ffb84a',
      post(p) { for (let i = 0; i < 6; i++) P({ x: p.x + rnd(-3, 3), y: p.y, z: 14, vx: 0, vy: 0, vz: 400, g: 0, life: 0.3, shape: 'flame', cols: flameCols, size: 2 }); F.line({ kind: 'beam', x0: p.x, y0: p.y - 14, x1: p.x, y1: p.y - 120, col: '#ffb84a', w: 3, life: 0.3, glow: true }); },
      ent(e) { if (!e.paint) return; if (e.life > 0.3 && e.life < 0.4) return; const u0 = e.update; e.update = function (dt) { u0.call(this, dt); if (this.life <= 0.25 && !this.dead) { const k = this.t / this.life, yy = 90 * (1 - k); P({ x: this.x + rnd(-4, 4), y: this.y, z: yy, vx: rnd(-10, 10), vy: 0, vz: 30, g: 0, life: 0.4, shape: 'flame', cols: flameCols, size: 2 }); if (this.t + dt >= this.life && !this._vb) { this._vb = 1; decal({ kind: 'crater', x: this.x, y: this.y, r: 40, life: 2.6 }); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; P({ x: this.x + Math.cos(a) * 20, y: this.y + Math.sin(a) * 12, z: 1, vx: Math.cos(a) * 60, vy: Math.sin(a) * 30, vz: 40, g: 0, life: 0.6, shape: 'flame', cols: flameCols, size: 3 }); } GL(this.x, this.y - 10, 60, '#ff8a3a', 0.5, { pulse: true }); } } }; },
      bowPose: skyPose },
    a_scatter: { col: '#fff4c8',
      post(p) { const a = ang(p), x = p.x + Math.cos(a) * 12, y = p.y - 8 + Math.sin(a) * 9; for (let i = -3; i <= 3; i++) F.line({ kind: 'beam', x0: x, y0: y, x1: x + Math.cos(a + i * 0.19) * 22, y1: y + Math.sin(a + i * 0.19) * 18, col: '#ffe8a8', w: 2, life: 0.1, glow: true }); GL(x, y, 18, '#ffe8a8', 0.12, { pulse: true }); burst(p.x, p.y, 6, { col: ['#d8c8a8'], sp: 40, z: 1, vz: 20, g: 80, life: 0.3, size: 2, a0: a + Math.PI, spread: 1.2 }); },
      vis: arrowVis({ rib: { col: '#ffe8a8', w: 1, core: false }, trail: (sh) => { if (R() < 0.5) tp(sh, { shape: 'spark', col: '#ffe8a8', vx: sh.vx * 0.1, vy: sh.vy * 0.1, life: 0.08 }); } }),
      motion: (e) => ({ sx: 1.12, sy: 0.9, rot: -side(e) * 0.18, dx: -side(e) * 2 }) },
    a_volley2: { col: '#a8d8ff',
      vis: arrowVis({ rib: { col: '#a8d8ff', w: 2, a: 0.5 }, tint: '#a8d8ff', trail: (sh) => { if (R() < 0.3) tp(sh, { shape: 'star', col: '#c8e8ff', life: 0.3, add: true }); } }) },
    a_mine: { col: '#ff9a5a',
      ent(e) { if (!e.mine || !e.paint) return; decal({ kind: 'ring', x: e.x, y: e.y, r: 18, life: e.life, col: '#ff9a5a' }); const u0 = e.update; e.update = function (dt) { const was = this.dead; u0.call(this, dt); if (R() < 0.08) P({ x: this.x, y: this.y, z: 9, vx: 0, vy: 0, vz: 10, g: 0, life: 0.3, col: '#ffd84a', add: true }); if (!was && this.dead && C.foes().some((f) => U.dist(this.x, this.y, f.x, f.y) < 34)) { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; F.line({ kind: 'beam', x0: this.x, y0: this.y - 4, x1: this.x + Math.cos(a) * 32, y1: this.y - 4 + Math.sin(a) * 20, col: '#ff9a5a', w: 1, life: 0.2, glow: true }); } decal({ kind: 'scorch', x: this.x, y: this.y, r: 20, life: 2 }); } }; } },
    a_gale: { col: '#c8f0ff',
      vis: { keep: true, hist: 10, ribbon: () => ({ col: '#c8fff0', w: 8, a: 0.25, wave: 3 }), light: 12,
        trail(sh) { for (let i = 0; i < 2; i++) { const s2 = R() < 0.5 ? 1 : -1; tp(sh, { shape: R() < 0.3 ? 'leaf' : 'line', col: pick(['#ffffff', '#c8fff0', '#a8e8b8']), vx: -sh.vy * 0.4 * s2, vy: sh.vx * 0.4 * s2, len: 6, life: 0.25, size: 2, spin: 10, rot: R() * TAU }); } },
        hit(sh, e) { VX.swirl(e.x, e.y - 8, '#c8fff0', 18); } } },
    a_sunrain: { col: '#ffb04a',
      post(p) { const a = ang(p), cx0 = p.x + Math.cos(a) * 80, cy0 = p.y + Math.sin(a) * 64; F.line({ kind: 'beam', x0: p.x, y0: p.y - 14, x1: p.x, y1: p.y - 140, col: '#ffd84a', w: 6, life: 0.4, glow: true }); decal({ kind: 'glyph', x: cx0, y: cy0, r: 56, life: 2.8, col: '#ffb04a', spin: 1 }); rays(cx0, cy0 - 40, 12, 26, '#ffd84a', { w: 1, life: 0.5 });
        for (let i = 0; i < 34; i++) C.after(0.6 + i * 0.06, () => { const r2 = Math.sqrt(R()) * 56, a2 = R() * TAU, x = cx0 + Math.cos(a2) * r2, y = cy0 + Math.sin(a2) * r2 * 0.7; P({ x, y, z: 70, vx: 0, vy: 0, vz: -460, g: 0, life: 0.15, shape: 'line', col: pick(['#ffd84a', '#ffb04a', '#ffffff']), len: 12, add: true }); C.after(0.15, () => { P({ x, y, z: 1, vx: 0, vy: 0, vz: 20, g: 0, life: 0.3, shape: 'flame', cols: flameCols, size: 2 }); GL(x, y, 8, '#ffb04a', 0.2, { pulse: true }); }); }); },
      bowPose: skyPose },
  };

  /* ═════════ 마법 스킬 스물 ═════════ */
  const raise = (p, K, fa) => -Math.PI / 2 + Math.cos(fa) * 0.25;
  const MG = {
    a_nova: { col: '#c8d8ff',
      post(p) { const Fo = VX.myFoc(); decal({ kind: 'glyph', x: p.x, y: p.y, r: 44, life: 1.2, col: Fo.c, spin: 4 }); rays(p.x, p.y - 8, 12, 56, '#e8f0ff', { w: 2, life: 0.22, var: true }); burst(p.x, p.y - 6, 14, { shape: 'diamond', col: [Fo.c, '#ffffff'], sp: 140, z: 8, vz: 10, g: 0, life: 0.35, add: true }); for (let i = 0; i < 8; i++) VX.mote(p.x, p.y, 10, Fo, { vx: rnd(-60, 60), vy: rnd(-40, 40) }); },
      staff: (p, K, fa) => fa + K.t * 30 },
    a_drain: { col: '#ff8ab0',
      post(p) { for (const e of C.foes()) { if (U.dist(p.x, p.y, e.x, e.y) > 72) continue; const pts = []; for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push([U.lerp(e.x, p.x, k) + Math.sin(k * Math.PI * 2 + e.x) * 6, U.lerp(e.y - 10, p.y - 10, k) + Math.cos(k * Math.PI * 3) * 4]); } F.line({ kind: 'ribbon', pts, col: '#c83a6a', w: 3, life: 0.45, glow: true }); for (let i = 0; i < 3; i++) C.after(i * 0.1, () => P({ x: e.x, y: e.y, z: 10, vx: (p.x - e.x) * 2.4, vy: (p.y - e.y) * 2.4, vz: 0, g: 0, life: 0.42, shape: 'heart', col: '#ff8ab0', add: true })); } GL(p.x, p.y - 10, 24, '#ff5a8a', 0.4, { pulse: true }); decal({ kind: 'glyph', x: p.x, y: p.y, r: 30, life: 1, col: '#c83a6a', spin: -3 }); },
      staff: raise },
    a_ward: { col: '#8ab8ff', post(p) { burst(p.x, p.y - 8, 12, { shape: 'diamond', col: ['#8ab8ff', '#e8f4ff'], sp: 40, z: 8, vz: 0, g: 0, life: 0.5, add: true }); } },
    a_slow: { col: '#d8c8ff',
      post(p) { W().add(new ClockFx({ x: p.x, y: p.y, life: 1.4, r: 112 })); for (let i = 0; i < 20; i++) P({ x: p.x + rnd(-80, 80), y: p.y + rnd(-50, 50), z: rnd(10, 40), vx: 0, vy: 0, vz: -12, g: 0, life: 1.2, col: pick(['#e8d8a8', '#d8c8ff']), size: 1 }); },
      staff: (p, K, fa) => -Math.PI / 2 + Math.sin(K.t * 10) * 0.6 },
    a_twin: { col: '#a8c8ff',
      post(p) { for (const s2 of [-1, 1]) { const x = p.x - p.face[1] * 14 * s2, y = p.y + p.face[0] * 10 * s2; decal({ kind: 'glyph', x, y, r: 12, life: 0.7, col: s2 > 0 ? '#a8c8ff' : '#c8a8ff', spin: s2 * 5 }); GL(x, y - 10, 12, s2 > 0 ? '#a8c8ff' : '#c8a8ff', 0.3, { pulse: true }); } } },
    a_sparks: { col: '#ffb04a',
      vis: { hist: 5, ribbon: () => ({ col: '#ffb04a', w: 2, a: 0.4 }), light: 10,
        draw(g, x, y, a, sh) { const c = hsl(sh.t * 600 + (sh.x * 3), 100, 70); g.fillStyle = c; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); },
        trail(sh) { tp(sh, { shape: 'star', col: hsl(R() * 360, 100, 70), vx: rnd(-20, 20), vy: rnd(-20, 20), vz: -10, g: 40, life: 0.3, add: true }); },
        hit(sh, e) { burst(e.x, e.y - 10, 10, { shape: 'star', col: ['#ff8a8a', '#ffd84a', '#8ad8ff', '#c8a8ff', '#ffffff'], sp: 70, z: 10, vz: 20, g: 60, life: 0.5, add: true }); },
        end(sh) { if (!(sh.hit && sh.hit.size)) burst(sh.x, sh.y, 6, { shape: 'star', col: ['#ffd84a', '#ffffff'], sp: 50, z: sh.zoff, vz: 10, g: 60, life: 0.4, add: true }); } } },
    a_blink2: { col: '#c8b8ff',
      pre(p) { p.vB = [p.x, p.y]; for (let i = 0; i < 18; i++) P({ x: p.x + rnd(-5, 5), y: p.y, z: rnd(0, 20), vx: rnd(-20, 20), vy: rnd(-10, 10), vz: rnd(10, 40), g: 0, life: rnd(0.3, 0.6), col: pick(['#c8b8ff', '#ff9ad8', '#ffffff']), size: 1, add: true }); },
      post(p) { if (!p.vB) return; const [x0, y0] = p.vB; p.vB = null; F.line({ kind: 'beam', x0, y0: y0 - 10, x1: p.x, y1: p.y - 10, col: '#c8b8ff', w: 5, life: 0.25, glow: true }); for (let i = 0; i < 12; i++) { const a = R() * TAU; P({ x: p.x + Math.cos(a) * 16, y: p.y + Math.sin(a) * 10, z: 10, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 40, vz: 0, g: 0, drag: 1, life: 0.25, col: '#ff9ad8', size: 1, add: true }); } } },
    a_frostring: { col: '#bfe8ff',
      post(p) { decal({ kind: 'frost', x: p.x, y: p.y, r: 54, life: 2.4 }); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; W().add(new VX.Spike({ x: p.x + Math.cos(a) * 42, y: p.y + Math.sin(a) * 30, life: 0.9, col: '#8ac8f0', col2: '#ffffff', h: 10 + R() * 8 })); } GL(p.x, p.y - 6, 50, '#8ad8ff', 0.4, { pulse: true }); burst(p.x, p.y, 16, { shape: 'snow', col: '#ffffff', sp: 90, z: 6, vz: 30, g: 20, life: 0.8 }); },
      staff: (p, K, fa) => fa + K.t * 25 },
    a_chain: { col: '#8ad8ff', post(p) { ring(p.x, p.y - 8, '#8ad8ff', 16, 0.25, 2); burst(p.x, p.y - 10, 8, { shape: 'spark', col: ['#8ad8ff', '#ffffff'], sp: 80, z: 10, vz: 0, g: 0, life: 0.2, add: true }); } },
    a_heal2: { col: '#8ae0a0',
      post(p) { F.line({ kind: 'beam', x0: p.x, y0: p.y - 60, x1: p.x, y1: p.y, col: '#8ae0a0', w: 10, life: 0.5, glow: true }); decal({ kind: 'glyph', x: p.x, y: p.y, r: 20, life: 1.6, col: '#8ae0a0', spin: 2 }); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; P({ x: p.x + Math.cos(a) * 12, y: p.y + Math.sin(a) * 6, z: 0, vx: Math.cos(a + 1.6) * 20, vy: Math.sin(a + 1.6) * 10, vz: 30 + R() * 20, g: 0, life: 1, shape: i % 4 ? 'leaf' : 'heart', col: i % 4 ? pick(['#8ae0a0', '#c8ffd8']) : '#ff9ab8', size: 2, spin: 4, rot: R() * TAU, flutter: true }); } },
      staff: raise },
    a_orbs: { col: '#a8c8ff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { for (let i = 0; i < 3; i++) for (let k = 1; k <= 4; k++) { const a = -(this.t - k * 0.03) * 3 + i * 2.094, x = Math.round(this.x - cx + Math.cos(a) * 24), y = Math.round(this.y - cy - 8 + Math.sin(a) * 16); g.globalAlpha = 0.3 / k; g.fillStyle = '#a8c8ff'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill(); } g.globalAlpha = 1; p0.call(this, g, cx, cy); if (R() < 0.5) { const a = -this.t * 3 + ((R() * 3) | 0) * 2.094; VX.mote(this.x + Math.cos(a) * 24, this.y + Math.sin(a) * 16, 8, VX.myFoc(), { life: 0.3, vz: 4 }); } }; } },
    a_well: { col: '#a06eff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { const X0 = Math.round(this.x - cx), Y0 = Math.round(this.y - cy); g.save(); for (let i = 0; i < 4; i++) { const a = -this.t * 5 + i * Math.PI / 2; g.strokeStyle = i % 2 ? 'rgba(196,155,255,0.6)' : 'rgba(80,40,160,0.6)'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 12; k++) { const r = 4 + k * 3, an = a + k * 0.35, px = X0 + Math.cos(an) * r, py = Y0 + Math.sin(an) * r * 0.45; if (k) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); } g.restore(); p0.call(this, g, cx, cy); if (R() < 0.7) { const a = R() * TAU, r = 30 + R() * 30; P({ x: this.x + Math.cos(a) * r, y: this.y + Math.sin(a) * r * 0.45, z: 2, vx: -Math.cos(a) * r * 2 + Math.cos(a + 1.6) * 30, vy: -Math.sin(a) * r * 0.9, vz: 0, g: 0, life: 0.45, col: pick(['#c49bff', '#6a3ab8', '#ffffff']), size: 1, add: true }); } }; } },
    a_meteor3: { col: '#ff8a3a',
      post(p) { GL(p.x, p.y - 40, 26, '#ff8a3a', 0.4, { pulse: true }); },
      ent(e) { if (!e.paint || e.life > 0.25) return; const u0 = e.update; e.update = function (dt) { u0.call(this, dt); const k = this.t / this.life, yy = 100 * (1 - k); P({ x: this.x + rnd(-4, 4), y: this.y, z: yy, vx: rnd(-10, 10), vy: 0, vz: 40, g: 0, life: 0.4, shape: 'flame', cols: flameCols, size: 3 }); if (R() < 0.5) P({ x: this.x, y: this.y, z: yy + 4, vx: 0, vy: 0, vz: 20, g: 0, life: 0.7, shape: 'smoke', col: '#3a2a2a', size: 3, grow: 1.5 }); if ((this.dead || this.t + dt >= this.life) && !this._vb) { this._vb = 1; decal({ kind: 'crater', x: this.x, y: this.y, r: 38, life: 2.6 }); decal({ kind: 'scorch', x: this.x, y: this.y, r: 48, life: 2.2 }); VX.fireBoom(this.x, this.y - 6, 1.4); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; W().add(new VX.Spike({ x: this.x + Math.cos(a) * 30, y: this.y + Math.sin(a) * 18, life: 0.6, col: '#5a3a2a', col2: '#ff8a3a', h: 8 + R() * 6 })); } } }; },
      staff: raise },
    a_clone: { col: '#d8b0ff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); const pl = W().player; if (R() < 0.4) P({ x: this.x + rnd(-6, 6), y: this.y, z: rnd(0, 22), vx: 0, vy: 0, vz: 12, g: 0, life: 0.5, shape: R() < 0.5 ? 'shard' : 'star', col: pick(['#d8b0ff', '#ffffff']), add: true, spin: 6, rot: R() * TAU }); if (pl && R() < 0.05) F.line({ kind: 'laser', x0: this.x, y0: this.y - 10, x1: pl.x, y1: pl.y - 10, col: '#d8b0ff', life: 0.2, dash: [2, 3], glow: true }); GL(this.x, this.y - 10, 14, '#d8b0ff', 0.05, { pulse: true }); }; },
      vis: { hist: 6, ribbon: () => ({ col: '#d8b0ff', w: 3, a: 0.4 }), light: 10, keep: true, trail(sh) { if (R() < 0.5) tp(sh, { shape: 'star', col: '#e8d8ff', life: 0.3, add: true }); }, hit(sh, e) { burst(e.x, e.y - 10, 6, { shape: 'shard', col: ['#d8b0ff', '#ffffff'], sp: 60, z: 10, vz: 20, g: 120, life: 0.4, spin: 8 }); } } },
    a_starfall: { col: '#fff8c0',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); const a = this.a || 0; for (let i = 0; i < 2; i++) { const k = R(); P({ x: this.x + Math.cos(a) * 100 * k, y: this.y + Math.sin(a) * 76 * k, z: 8, vx: rnd(-20, 20), vy: rnd(-20, 20), vz: rnd(0, 20), g: 0, life: 0.5, shape: 'star', col: pick(['#fff8c0', '#ffd84a', '#ffffff', '#c8d8ff']), add: true, tw: 16, size: R() < 0.3 ? 2 : 1 }); } GL(this.x + Math.cos(a) * 100, this.y - 8 + Math.sin(a) * 76, 14, '#fff8c0', 0.06, { pulse: true }); GL(this.x, this.y - 8, 18, '#fff8c0', 0.06, { pulse: true }); }; },
      post(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 36, life: 3, col: '#fff0a8', spin: 2 }); },
      staff: (p, K, fa) => -Math.PI / 2 + Math.sin(K.t * 8) * 0.5 },
    a_lance: { col: '#fff8a8',
      post(p) { const a = ang(p); let L = 8; const m = W().map; for (; L < 150; L += 6) if (!m.shotFree(p.x + Math.cos(a) * L, p.y - 9 + Math.sin(a) * L * 0.85, p.z || 0)) break; const x1 = p.x + Math.cos(a) * L, y1 = p.y + Math.sin(a) * L * 0.85; F.line({ kind: 'beam', x0: p.x + Math.cos(a) * 8, y0: p.y - 9, x1, y1: y1 - 9, col: '#fff8a8', w: 8, life: 0.3, glow: true }); decal({ kind: 'scorch', x: x1, y: y1, r: 10, life: 1.4, col: '#fff8a8' }); for (let k = 0; k < 6; k++) { const q = k / 6; burst(p.x + Math.cos(a) * L * q, p.y + Math.sin(a) * L * 0.85 * q, 2, { shape: 'spark', col: ['#fff8a8', '#ffffff'], sp: 60, z: 9, vz: 10, g: 0, life: 0.15, add: true }); } } },
    a_vine: { col: '#5ac84a',
      ent(e) { if (!e.paint) return; decal({ kind: 'splat', x: e.x, y: e.y, r: 34, life: 3, col: '#3a8a3a' }); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; W().add(new VX.Spike({ x: e.x + Math.cos(a) * 32, y: e.y + Math.sin(a) * 15, life: 2.9, col: '#3a7a2a', col2: '#8ae07a', h: 9 + R() * 6 })); } const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); if (R() < 0.3) P({ x: this.x + rnd(-30, 30), y: this.y + rnd(-12, 12), z: rnd(4, 18), vx: rnd(-8, 8), vy: 0, vz: rnd(4, 12), g: 10, life: 0.9, shape: 'petal', col: pick(['#c84a8a', '#ff9ac8']), size: 2, spin: 4, rot: R() * TAU, flutter: true }); }; } },
    a_mirrorwall: { col: '#e8e0ff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); for (let i = 0; i < 6; i++) { const a = this.t * 1.5 + i / 6 * TAU, x = Math.round(this.x - cx + Math.cos(a) * 24), y = Math.round(this.y - cy - 9 + Math.sin(a) * 17); g.globalAlpha = 0.5 + Math.sin(this.t * 10 + i) * 0.3; g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 2, 2, 4); g.fillStyle = '#c8b8ff'; g.fillRect(x, y - 1, 1, 2); } g.globalAlpha = 1; if (R() < 0.2) GL(this.x, this.y - 9, 26, '#e8e0ff', 0.1, { pulse: true }); }; } },
    a_tidal: { col: '#4a9ad8',
      post(p) { decal({ kind: 'splat', x: p.x + p.face[0] * 20, y: p.y + p.face[1] * 16, r: 26, life: 1.6, col: '#4a9ad8' }); },
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); for (let i = 0; i < 2; i++) P({ x: this.x + rnd(-10, 10), y: this.y + rnd(-30, 30), z: rnd(4, 22), vx: rnd(-30, 30), vy: rnd(-20, 20), vz: rnd(20, 50), g: 200, life: 0.5, shape: R() < 0.5 ? 'bubble' : 'drop', col: pick(['#d8f4ff', '#ffffff', '#8ac8f0']), size: R() < 0.3 ? 2 : 1 }); }; } },
    a_eclipse: { col: '#c49bff',
      ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); const v = W().view, sx = v.w * 0.8, sy = 24, f = Math.min(1, this.t * 4, (this.life - this.t) * 4); g.save(); g.globalAlpha = 0.6 * f; g.strokeStyle = '#fff8d0'; g.lineWidth = 1; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + this.t * 0.5, L = 14 + Math.sin(this.t * 8 + i * 3) * 3; g.beginPath(); g.moveTo(sx + Math.cos(a) * 11, sy + Math.sin(a) * 11); g.lineTo(sx + Math.cos(a) * L, sy + Math.sin(a) * L); g.stroke(); } g.restore(); if (R() < 0.6) { const W0 = W(); P({ x: W0.rcx + R() * v.w, y: W0.rcy + R() * v.h, z: 0, vx: 0, vy: 0, vz: 10, g: 0, life: 0.8, shape: 'smoke', col: '#2a1440', size: 2, grow: 1 }); } }; },
      staff: raise },
  };

  /** 시간 늦추기: 바닥의 시계판 */
  class ClockFx extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'vfx', solid: false, sortBias: -30, t: 0 }, o)); }
    update(dt) { this.t += dt; if (this.t >= this.life) this.dead = true; }
    draw(g, cx, cy) {
      const k = this.t / this.life, a = k < 0.15 ? k / 0.15 : (1 - k) / 0.85, x = Math.round(this.x - cx), y = Math.round(this.y - cy), r = this.r * Math.min(1, this.t * 5);
      g.save(); g.globalAlpha = 0.6 * a; g.strokeStyle = '#d8c8ff'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(x, y, r * 0.9, r * 0.4, 0, 0, TAU); g.stroke();
      for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, L = i % 3 ? 0.84 : 0.76; g.beginPath(); g.moveTo(x + Math.cos(an) * r * 0.9, y + Math.sin(an) * r * 0.4); g.lineTo(x + Math.cos(an) * r * L, y + Math.sin(an) * r * L * 0.45); g.stroke(); }
      const h1 = -Math.PI / 2 + this.t * 0.8, h2 = -Math.PI / 2 + this.t * 6; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(h1) * r * 0.45, y + Math.sin(h1) * r * 0.2); g.stroke(); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(h2) * r * 0.7, y + Math.sin(h2) * r * 0.31); g.stroke();
      g.globalAlpha = 0.12 * a; g.fillStyle = '#d8c8ff'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, TAU); g.fill();
      g.restore();
    }
  }

  // 스킬 표에 넣기 · 탄 모양 등록
  for (const T of [SW, BW, MG]) for (const id in T) { SKV[id] = T[id]; if (T[id].vis) VIS['sk_' + id] = T[id].vis; }
  VX.skillCol = (id) => (SKV[id] && SKV[id].col) || null;

  /* ═════════ 필살기 서른하나 ═════════ */
  const lev = (p, X, h) => jz(p, Math.min(h, X.t * 30) + Math.sin(X.t * 6) * 1.5);   // 공중에 떠오른다
  const SPC = {
    // ── 검 ──
    whirl: { col: '#e8f4ff', start(p) { decal({ kind: 'ring', x: p.x, y: p.y, r: 60, life: 1, col: '#e8f4ff', spin: 6 }); },
      tick(p, X) { for (let i = 0; i < 3; i++) { const a = R() * TAU, h = rnd(0, 34), r = 12 + h * 0.8; P({ x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r * 0.4, z: h, vx: Math.cos(a + 1.6) * 140, vy: Math.sin(a + 1.6) * 56, vz: 40, g: 0, life: 0.25, shape: 'line', col: pick(['#ffffff', '#e8f4ff']), len: 5 }); } if (R() < 0.5) P({ x: p.x + rnd(-40, 40), y: p.y + rnd(-26, 26), z: 1, vx: 0, vy: 0, vz: 30, g: 80, life: 0.4, col: '#d8c8a8', size: 2 }); },
      motion: (e, X) => ({ sx: 1, sy: 1, rot: Math.sin(X.t * 40) * 0.3, dx: 0 }) },
    triple: { col: '#ff8a8a', tick(p, X) { if ((X.i || 0) > (X.vI || 0)) { X.vI = X.i; burst(p.x, p.y, 8, { shape: 'smoke', col: ['#5a2a3a', '#2a1a2a'], sp: 30, z: 6, vz: 10, g: 0, life: 0.5, size: 2, grow: 1 }); const e = X.list && X.list[(X.i - 1) % Math.max(1, X.list.length)]; if (e) { slash(e.x, e.y - 8, ang(p) + 1.1, '#ff8a8a', 22); GL(e.x, e.y - 8, 16, '#ff6a6a', 0.2, { pulse: true }); } } } },
    shadow: { col: '#c49bff', start(p) { decal({ kind: 'shadow', x: p.x, y: p.y, r: 30, life: 1, col: 'rgba(40,20,70,0.6)' }); burst(p.x, p.y, 16, { shape: 'smoke', col: ['#3a2a5a', '#1a0a2a', '#6a5aa8'], sp: 60, z: 6, vz: 10, g: 0, life: 0.7, size: 3, grow: 1 }); } },
    meteor: { col: '#ffb070',
      tick(p, X) { if (X.t < 0.55) { burst(p.x, p.y, 2, { shape: 'flame', cols: flameCols, sp: 20, z: (p.jz || 0) + 6, vz: 10, g: 0, life: 0.3, size: 2 }); GL(p.x, p.y - 10 - (p.jz || 0), 16, '#ff8a3a', 0.05, { pulse: true }); } if (X.slam && !X.vSlam) { X.vSlam = true; decal({ kind: 'crater', x: p.x, y: p.y, r: 60, life: 3 }); decal({ kind: 'crack', x: p.x, y: p.y, r: 80, life: 3 }); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; W().add(new VX.Spike({ x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 34, life: 0.8, col: '#6a4a3a', col2: '#ff8a3a', h: 12 + R() * 10 })); } VX.fireBoom(p.x, p.y - 4, 2); rays(p.x, p.y - 6, 14, 70, '#ffb070', { w: 3, life: 0.3, var: true }); } },
      motion: (e, X) => (X.t < 0.5 ? { sx: 0.9, sy: 1.12, rot: (side(e) || 1) * X.t * 1.2, dx: 0 } : { sx: 1.2, sy: 0.82, rot: 0, dx: 0 }) },
    dance: { col: '#ffe066', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 70, life: 1.4, col: '#ffe066', spin: 3 }); },
      tick(p, X) { if (R() < 0.6) P({ x: p.x + rnd(-6, 6), y: p.y, z: rnd(4, 20), vx: rnd(-20, 20), vy: rnd(-10, 10), vz: rnd(4, 14), g: 10, life: 0.8, shape: R() < 0.5 ? 'feather' : 'petal', col: pick(['#ffe066', '#fff8d8', '#ffffff']), size: 2, spin: 6, rot: R() * TAU, flutter: true }); if (X.burst && !X.vB) { X.vB = true; rays(p.x, p.y - 8, 16, 96, '#ffe066', { w: 3, life: 0.4, var: true }); } } },
    moonslash: { col: '#e8f4ff', vis: { keep: true, hist: 8, light: 16, ribbon: () => ({ col: '#a8c8ff', w: 6, a: 0.3 }), trail(sh) { for (let i = 0; i < 2; i++) VX.tp(sh, { shape: 'star', col: pick(['#e8f4ff', '#ffffff', '#a8c8ff']), vx: rnd(-20, 20), vy: rnd(-20, 20), life: 0.5, add: true, tw: 14, size: R() < 0.3 ? 2 : 1 }); }, hit(sh, e) { slash(e.x, e.y - 8, Math.atan2(sh.vy, sh.vx), '#e8f4ff', 24); GL(e.x, e.y - 8, 20, '#a8c8ff', 0.25, { pulse: true }); } } },
    quakeblade: { col: '#d8a868', start(p) { const [fx, fy] = p.face; for (let i = 0; i < 7; i++) C.after(0.12 + i * 0.07, () => { const x = p.x + fx * (18 + i * 16), y = p.y + fy * (14 + i * 12); W().add(new VX.Spike({ x, y, life: 0.7, col: '#8a6a4a', col2: '#d8b080', h: 16 + R() * 8 })); W().add(new VX.Spike({ x: x - fy * 8, y: y + fx * 6, life: 0.6, col: '#a8784a', col2: '#d8b080', h: 10 + R() * 6 })); decal({ kind: 'crack', x, y, r: 14, life: 2.2 }); }); } },
    thousand: { col: '#ffe066', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 60, life: 1.6, col: '#ffe066', spin: 4 }); F.line({ kind: 'beam', x0: p.x, y0: p.y - 14, x1: p.x, y1: p.y - 150, col: '#ffe066', w: 6, life: 0.5, glow: true }); },
      tick(p, X) { lev(p, X, 8); if (R() < 0.5) { const W0 = W(), v = W0.view, x = W0.rcx + R() * v.w, y = W0.rcy + R() * v.h; P({ x, y, z: 80, vx: 0, vy: 0, vz: -500, g: 0, life: 0.16, shape: 'blade', col: pick(['#ffe066', '#fff8d8']), size: 2, rot: Math.PI / 2 }); } },
      staff: () => -Math.PI / 2 },
    skysplit: { col: '#fff4c8', tick(p, X) { if ((X.n || 0) > (X.vN || 0)) { X.vN = X.n; const d = 18 + X.n * 26, x = p.x + Math.cos(X.a) * d, y = p.y + Math.sin(X.a) * d * 0.85; decal({ kind: 'crack', x, y, r: 20, life: 2.2 }); rays(x, y - 10, 8, 26, '#fff4c8', { w: 2, life: 0.25 }); GL(x, y - 20, 30, '#fff4c8', 0.3, { pulse: true }); } if (X.t < 0.35 && R() < 0.6) ghost(p, 0.3, '#fff4c8'); } },
    bladestorm: { col: '#e8eef8', ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); if (R() < 0.7) { const a = this.t * 9 + R() * TAU, r = 22 + R() * 10; P({ x: this.x + Math.cos(a) * r, y: this.y - 8 + Math.sin(a) * r * 0.7, z: 0, vx: Math.cos(a + 1.6) * 140, vy: Math.sin(a + 1.6) * 90, vz: 0, g: 0, life: 0.15, shape: 'spark', col: pick(['#ffffff', '#e8eef8', '#c8a050']), add: true }); } if (R() < 0.2) VX.swirl(this.x, this.y - 6, '#e8f4ff', 30); }; } },
    oblivion: { col: '#e8e0ff', start(p) { p.vGrey = 1; },
      tick(p, X) { if (X.back && !X.vBack) { X.vBack = true; C.after(0.2, () => { const pl = W().player; if (pl) pl.vGrey = 0; for (const e of X.list || []) if (!e.dead) { F.line({ kind: 'beam', x0: e.x - 20, y0: e.y - 18, x1: e.x + 20, y1: e.y + 2, col: '#e8e0ff', w: 3, life: 0.35, glow: true }); GL(e.x, e.y - 8, 18, '#ffffff', 0.3, { pulse: true }); } }); } if ((X.i || 0) > (X.vI || 0)) { X.vI = X.i; const e = X.list[X.i - 1]; if (e) { F.line({ kind: 'beam', x0: e.x - 14, y0: e.y - 2, x1: e.x + 14, y1: e.y - 16, col: '#1a1428', w: 3, life: 0.6, core: '#e8e0ff' }); ghost(p, 0.6, '#2a2440'); } } if (X.t >= X.dur - 0.02) p.vGrey = 0; } },
    flash: { col: '#fff8c0' },
    // ── 활 ──
    rain: { col: '#fff0a8', start(p) { const cx = p.x + p.face[0] * 64, cy = p.y + p.face[1] * 52; decal({ kind: 'glyph', x: cx, y: cy, r: 48, life: 2, col: '#fff0a8', spin: 2 }); for (let i = 0; i < 10; i++) C.after(i * 0.03, () => P({ x: p.x + rnd(-3, 3), y: p.y, z: 12, vx: 0, vy: 0, vz: 380, g: 0, life: 0.25, shape: 'line', col: '#fff4c8', len: 10 })); for (let i = 0; i < 34; i++) C.after(0.35 + i * 0.035, () => { const a = R() * TAU, r = Math.sqrt(R()) * 46; P({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.75, z: 60, vx: 0, vy: 0, vz: -420, g: 0, life: 0.14, shape: 'line', col: '#fff4c8', len: 10, add: true }); }); }, bowPose: (p, X) => ({ a: -Math.PI / 2 + (p.face[0] || 0) * 0.35, pull: X.t < 0.25 ? X.t / 0.25 : 0 }) },
    starshot: { col: '#fff4c8', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 22, life: 1, col: '#fff4c8', spin: 5 }); },
      tick(p, X) { if (!X.shot) { const a = p.aim != null ? p.aim : ang(p); GL(p.x + Math.cos(a) * 14, p.y - 8 + Math.sin(a) * 12, 6 + X.t * 30, '#fff8d0', 0.04, { pulse: true }); for (let i = 0; i < 2; i++) { const an = R() * TAU, r = 20; P({ x: p.x + Math.cos(a) * 14 + Math.cos(an) * r, y: p.y + Math.sin(a) * 12 + Math.sin(an) * r * 0.7, z: 8, vx: -Math.cos(an) * 70, vy: -Math.sin(an) * 50, vz: 0, g: 0, life: 0.28, shape: 'star', col: '#fff8d0', add: true }); } } },
      vis: { keep: false, hist: 12, light: 26, ribbon: () => ({ col: '#fff4c8', w: 12, a: 0.35, core: '#ffffff' }),
        draw(g, x, y, a, sh) { const t = sh.t; g.save(); g.translate(x, y); g.globalAlpha = 0.4; g.fillStyle = '#fff4c8'; g.beginPath(); g.arc(0, 0, 12 + Math.sin(t * 30) * 2, 0, TAU); g.fill(); g.globalAlpha = 1; g.rotate(t * 8); g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -2); g.lineTo(12, 0); g.lineTo(0, 2); g.fill(); } g.fillStyle = '#fff8a8'; g.beginPath(); g.arc(0, 0, 4, 0, TAU); g.fill(); g.restore(); },
        trail(sh) { for (let i = 0; i < 2; i++) VX.tp(sh, { shape: 'star', col: pick(['#fff8d0', '#ffffff', '#ffe066']), vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.5, add: true, tw: 16, size: R() < 0.4 ? 2 : 1 }); sh._sc = (sh._sc || 0) + 1; if (sh._sc % 5 === 0) P({ x: sh.x, y: sh.y, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.35, shape: 'ring', col: '#fff4c8', size: 6, grow: 2 }); },
        hit(sh, e) { rays(e.x, e.y - 10, 10, 24, '#fff8d0', { w: 2, life: 0.25 }); GL(e.x, e.y - 10, 30, '#fff8d0', 0.35, { pulse: true }); } } },
    bombarrow: { col: '#ffb04a', vis: arrowVis({ rib: { col: '#ff6a2a', w: 3, a: 0.4 }, light: 14, tint: '#ff8a3a', trail: (sh) => { VX.tp(sh, { shape: 'spark', col: pick(['#ffd84a', '#ffffff']), vx: rnd(-50, 50), vy: rnd(-50, 50), vz: rnd(0, 30), g: 100, life: 0.2 }); VX.tp(sh, { shape: 'flame', cols: flameCols, vz: 10, life: 0.25, size: 2 }); }, end: (sh) => { VX.fireBoom(sh.x, sh.y, 1.2); ring(sh.x, sh.y + 6, '#ffe8a8', 32, 0.4, 3); } }) },
    hawk: { col: '#c8e8a8', start(p) { for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; P({ x: p.x + Math.cos(a) * 20, y: p.y + Math.sin(a) * 12, z: 10, vx: Math.cos(a + 1.6) * 60, vy: Math.sin(a + 1.6) * 30, vz: 30, g: 0, life: 0.8, shape: 'feather', col: pick(['#e8d8a8', '#c8a878', '#ffffff']), size: 2, spin: 6, rot: R() * TAU, flutter: true }); } GL(p.x, p.y - 30, 24, '#ffe8a8', 0.6); }, bowPose: (p) => ({ a: -Math.PI / 2, pull: 0 }) },
    galaxy: { col: '#c8d8ff', start(p) { F.line({ kind: 'beam', x0: p.x, y0: p.y - 14, x1: p.x, y1: p.y - 150, col: '#c8a8ff', w: 5, life: 0.4, glow: true }); decal({ kind: 'glyph', x: p.x, y: p.y, r: 40, life: 2, col: '#c8a8ff', spin: 3 }); },
      vis: { hist: 10, light: 12, ribbon: () => ({ col: '#a8a8ff', w: 3, a: 0.4 }),
        draw(g, x, y, a, sh) { const s = 2 + (Math.sin(sh.t * 30) > 0 ? 1 : 0); g.fillStyle = '#ffffff'; g.fillRect(x - s, y, s * 2 + 1, 1); g.fillRect(x, y - s, 1, s * 2 + 1); g.globalAlpha = 0.5; g.fillStyle = hsl(220 + Math.sin(sh.t * 5 + sh.x) * 60, 90, 75); g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; },
        trail(sh) { VX.tp(sh, { shape: 'star', col: pick(['#c8d8ff', '#c8a8ff', '#ffa8d8', '#ffffff']), vx: rnd(-10, 10), vy: rnd(-10, 10), life: 0.5, add: true, tw: 14 }); },
        hit(sh, e) { burst(e.x, e.y - 10, 8, { shape: 'star', col: ['#c8d8ff', '#c8a8ff', '#ffffff'], sp: 60, z: 10, vz: 10, g: 0, life: 0.5, add: true }); } }, bowPose: (p) => ({ a: -Math.PI / 2, pull: 0 }) },
    arrowwall: { col: '#fff4c8', ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { p0.call(this, g, cx, cy); if (R() < 0.3) P({ x: this.x + rnd(-40, 40), y: this.y + rnd(-6, 6), z: rnd(0, 14), vx: 0, vy: 0, vz: 8, g: 0, life: 0.5, shape: 'feather', col: '#fff4c8', size: 2, spin: 4, rot: R() * TAU, add: true }); }; } },
    phoenix: { col: '#ff8a3a', start(p) { GL(p.x, p.y - 10, 40, '#ff8a3a', 0.5, { pulse: true }); burst(p.x, p.y, 16, { shape: 'feather', col: ['#ff8a3a', '#ffd84a', '#ff5a2a'], sp: 80, z: 10, vz: 30, g: 20, life: 0.8, size: 2, spin: 6, flutter: true }); },
      vis: { keep: true, hist: 12, light: 32, ribbon: () => ({ col: '#ff5a2a', w: 14, a: 0.3, core: '#ffd84a' }),
        trail(sh) { for (let i = 0; i < 3; i++) VX.tp(sh, { shape: 'flame', cols: flameCols, vx: rnd(-30, 30) - sh.vx * 0.2, vy: rnd(-30, 30) - sh.vy * 0.2, vz: 20, life: 0.45, size: 3 }); if (R() < 0.5) VX.tp(sh, { shape: 'feather', col: pick(['#ffd84a', '#ff8a3a']), vx: rnd(-40, 40), vy: rnd(-40, 40), vz: -10, g: 30, life: 0.7, size: 2, spin: 6, rot: R() * TAU, flutter: true }); sh._dc = (sh._dc || 0) + 1; if (sh._dc % 6 === 0) decal({ kind: 'scorch', x: sh.x, y: sh.y + sh.zoff, r: 12, life: 2.2 }); },
        hit(sh, e) { VX.fireBoom(e.x, e.y - 8, 0.6); } } },
    skyfall: { col: '#fff4c8', start(p) { const list = C.foes().filter((e) => { const W0 = W(), v = W0.view; return e.x > W0.rcx && e.x < W0.rcx + v.w && e.y > W0.rcy && e.y < W0.rcy + v.h + 20; }).slice(0, 8); for (const e of list) decal({ kind: 'glyph', x: e.x, y: e.y, r: 12, life: 1.2, col: '#fff4c8', spin: 4 }); }, bowPose: (p) => ({ a: -Math.PI / 2, pull: 0 }) },
    aurora: { col: '#8affd8', ent(e) { if (!e.paint) return; const p0 = e.paint; e.paint = function (g, cx, cy) { const x = this.x - cx, y = this.y - cy - 9, f = Math.min(1, this.t * 6, (this.life - this.t) * 5), a0 = this.a || 0; g.save(); for (let i = 0; i < 5; i++) { const a = a0 + (i - 2) * 0.22; g.globalAlpha = 0.25 * f; g.strokeStyle = ['#8affd8', '#8ad8ff', '#c8a8ff', '#ffa8d8', '#fff0a8'][i]; g.lineWidth = 12; g.beginPath(); for (let k = 0; k <= 10; k++) { const L = k * 16, w = Math.sin(k * 0.8 + this.t * 12 + i) * 3; const px = x + Math.cos(a) * L - Math.sin(a) * w, py = y + Math.sin(a) * L * 0.85 + Math.cos(a) * w; if (k) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); } g.restore(); p0.call(this, g, cx, cy); if (R() < 0.8) { const a = a0 + (((R() * 5) | 0) - 2) * 0.22, L = R() * 160; P({ x: this.x + Math.cos(a) * L, y: this.y + Math.sin(a) * L * 0.85, z: 9, vx: 0, vy: 0, vz: 10, g: 0, life: 0.5, shape: 'star', col: pick(['#8affd8', '#c8a8ff', '#ffffff']), add: true, tw: 14 }); } }; } },
    // ── 마법 ──
    flame: { col: '#ff8a3a', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 60, life: 1.4, col: '#ff8a3a', spin: 3 }); for (let ring2 = 0; ring2 < 2; ring2++) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + ring2 * 0.4, r = 26 + ring2 * 30, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * 0.75; C.after(0.1 + ring2 * 0.25 + i * 0.02, () => { W().add(new FlameCol({ x, y, life: 0.6 })); decal({ kind: 'scorch', x, y, r: 10, life: 2.4 }); }); } }, tick(p, X) { lev(p, X, 6); }, staff: () => -Math.PI / 2 },
    frost: { col: '#bfe8ff', start(p) { decal({ kind: 'frost', x: p.x, y: p.y, r: 110, life: 3.4 }); for (const e of C.foes()) if (U.dist(p.x, p.y, e.x, e.y) < 125) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; W().add(new VX.Spike({ x: e.x + Math.cos(a) * 9, y: e.y + Math.sin(a) * 5, life: 2.4, col: '#8ac8f0', col2: '#ffffff', h: 14 + R() * 8 })); } } GL(p.x, p.y - 10, 90, '#bfe8ff', 0.5, { pulse: true }); burst(p.x, p.y, 30, { shape: 'snow', col: '#ffffff', sp: 160, z: 10, vz: 20, g: 10, life: 1 }); }, staff: (p, X, fa) => fa + X.t * 20 },
    thunder: { col: '#ffe066', start(p) { p.vDim = 0.4; C.after(0.9, () => { const pl = W().player; if (pl) pl.vDim = 0; }); }, staff: () => -Math.PI / 2, tick(p, X) { lev(p, X, 6); if (R() < 0.3) P({ x: p.x + rnd(-8, 8), y: p.y, z: rnd(0, 20), vx: rnd(-60, 60), vy: rnd(-40, 40), vz: 0, g: 0, life: 0.1, shape: 'spark', col: '#ffe066', add: true }); } },
    judge: { col: '#ffffff', start(p) { p.vDim = 0.35; for (const e of C.foes()) { const W0 = W(), v = W0.view; if (e.x < W0.rcx || e.x > W0.rcx + v.w || e.y < W0.rcy || e.y > W0.rcy + v.h + 20) continue; decal({ kind: 'glyph', x: e.x, y: e.y, r: 14, life: 1.2, col: '#ffffff', spin: 6 }); C.after(0.6, () => { F.line({ kind: 'beam', x0: e.x, y0: e.y - 140, x1: e.x, y1: e.y, col: '#fffbe8', w: 10, life: 0.4, glow: true }); GL(e.x, e.y - 20, 30, '#ffffff', 0.4, { pulse: true }); }); } C.after(0.7, () => { const pl = W().player; if (pl) pl.vDim = 0; }); }, tick(p, X) { lev(p, X, 10); }, staff: () => -Math.PI / 2 },
    nova: { col: '#c8b8ff', start(p) { rays(p.x, p.y - 8, 14, 64, '#c8b8ff', { w: 2, life: 0.3, var: true }); decal({ kind: 'glyph', x: p.x, y: p.y, r: 60, life: 1, col: '#c8b8ff', spin: 6 }); burst(p.x, p.y - 6, 16, { shape: 'diamond', col: ['#c8b8ff', '#ffffff'], sp: 160, z: 8, vz: 0, g: 0, life: 0.35, add: true }); } },
    blackhole: { col: '#8a6ad8', start(p) { p.vDim = 0.3; C.after(2.1, () => { const pl = W().player; if (pl) pl.vDim = 0; }); }, staff: () => -Math.PI / 2 },
    genesis: { col: '#fff8d0', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 50, life: 1.6, col: '#fff8d0', spin: 4 }); },
      tick(p, X) { lev(p, X, 12); const k = Math.min(1, X.t / 1.1), a = X.a0 + k * TAU; F.line({ kind: 'beam', x0: p.x, y0: p.y - 8, x1: p.x + Math.cos(a) * 150, y1: p.y - 8 + Math.sin(a) * 120, col: '#ffe066', w: 8, life: 0.06, glow: true }); if (R() < 0.6) { const L = R() * 150; P({ x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L * 0.8, z: 8, vx: rnd(-20, 20), vy: rnd(-20, 20), vz: 10, g: 0, life: 0.5, shape: 'star', col: pick(['#fff8d0', '#ffe066', '#ffffff']), add: true, tw: 14 }); } GL(p.x, p.y - 10 - (p.jz || 0), 22, '#fff8d0', 0.06, { pulse: true }); },
      staff: (p, X, fa) => X.a0 + Math.min(1, X.t / 1.1) * TAU },
    tempest: { col: '#a8c8ff', start(p) { p.vDim = 0.35; C.after(3, () => { const pl = W().player; if (pl) pl.vDim = 0; }); }, staff: () => -Math.PI / 2, tick(p, X) { lev(p, X, 5); } },
    glacier: { col: '#bfe8ff', start(p) { for (let w2 = 0; w2 < 3; w2++) C.after(0.15 + w2 * 0.22, () => { const pl = W().player; decal({ kind: 'frost', x: pl.x, y: pl.y, r: 34 + w2 * 30, life: 2.6 }); GL(pl.x, pl.y - 6, 40 + w2 * 30, '#8ad8ff', 0.35, { pulse: true }); burst(pl.x, pl.y, 12, { shape: 'snow', col: '#ffffff', sp: 80 + w2 * 50, z: 6, vz: 20, g: 10, life: 0.7 }); }); }, tick(p, X) { lev(p, X, 6); }, staff: () => -Math.PI / 2 },
    supernova: { col: '#fff8d0', start(p) { decal({ kind: 'glyph', x: p.x, y: p.y, r: 70, life: 1.8, col: '#fff0a8', spin: 5 }); p.vDim = 0.3; },
      tick(p, X) { if (!X.boom) { lev(p, X, 16); GL(p.x, p.y - 10 - (p.jz || 0), 10 + X.t * 40, pick(['#fff8d0', '#ffd84a', '#ff8ad8', '#8ad8ff']), 0.05, { pulse: true }); } else if (!X.vBoom) { X.vBoom = true; p.vDim = 0; rays(p.x, p.y - 10, 24, 180, '#fff8d0', { w: 4, life: 0.5, var: true }); for (let i = 0; i < 40; i++) { const a = R() * TAU; P({ x: p.x, y: p.y, z: 10, vx: Math.cos(a) * 300, vy: Math.sin(a) * 200, vz: 0, g: 0, drag: 2, life: 0.8, shape: 'star', col: pick(['#fff8d0', '#ffd84a', '#ff8ad8', '#8ad8ff', '#ffffff']), add: true, size: 2 }); } decal({ kind: 'glyph', x: p.x, y: p.y, r: 90, life: 1.6, col: '#fff0a8', spin: 3 }); } else jz(p, Math.max(0, (p.jz || 0) - 2)); },
      staff: () => -Math.PI / 2 },
  };
  for (const id in SPC) { SPV[id] = SPC[id]; if (SPC[id].vis) VIS['sp_' + id] = SPC[id].vis; }
  // 필살기 몸짓: 떠 있는 것은 살짝 기울고, 둘째 막처럼 모으는 것은 떤다
  for (const id of ['flame', 'thunder', 'judge', 'genesis', 'tempest', 'glacier', 'supernova', 'thousand']) if (SPV[id]) SPV[id].motion = SPV[id].motion || ((e, X) => ({ sx: 0.95 + Math.sin(X.t * 20) * 0.02, sy: 1.05, rot: Math.sin(X.t * 3) * 0.05, dx: 0 }));

  /** 불꽃 폭풍: 솟는 불기둥 */
  class FlameCol extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'vfx', solid: false, sortBias: 2, t: 0 }, o)); }
    update(dt) { this.t += dt; if (this.t >= this.life) { this.dead = true; return; } for (let i = 0; i < 2; i++) P({ x: this.x + rnd(-4, 4), y: this.y, z: rnd(0, 6), vx: rnd(-6, 6), vy: 0, vz: rnd(60, 110), g: 0, life: 0.35, shape: 'flame', cols: flameCols, size: 3 }); }
    draw(g, cx, cy) { const k = this.t / this.life, h = 30 * (k < 0.2 ? k / 0.2 : 1 - (k - 0.2) * 0.8), x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.save(); g.globalAlpha = 0.55; g.fillStyle = '#ff5a2a'; g.fillRect(x - 4, y - h, 8, h); g.globalAlpha = 0.85; g.fillStyle = '#ffb040'; g.fillRect(x - 2, y - h * 0.9, 4, h * 0.9); g.fillStyle = '#fff2b0'; g.fillRect(x - 1, y - h * 0.6, 2, h * 0.6); g.restore(); GL(this.x, this.y - h / 2, 16, '#ff8a3a', 0.05, { pulse: true }); }
  }

  /* ═════════ 거는 순간 (gear.js flourish를 대신한다) ═════════ */
  const WC = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  VX.flourish = function (p, w, big, id) {
    const sp = id && id.startsWith('sp:') ? id.slice(3) : null, V = sp ? SPV[sp] : SKV[id];
    const col = (V && V.col) || WC[w] || '#ffffff';
    const GR = sp ? (G.data.SPECIALS[sp] || {}).grade || 3 : (SN.ASK[id] || {}).grade || 1;
    if (w === 'sword') {   // 검: 날에 빛이 흐르고 둘레로 칼빛 조각
      for (let i = 0; i < 4 + GR * 2; i++) { const a = R() * TAU; P({ x: p.x + Math.cos(a) * 6, y: p.y + Math.sin(a) * 4, z: 10, vx: Math.cos(a) * 90, vy: Math.sin(a) * 60, vz: 10, g: 0, drag: 3, life: 0.3, shape: 'line', col: pick([col, '#ffffff']), len: 5 }); }
    } else if (w === 'bow') {   // 활: 깃털이 흩날리고 시위가 빛난다
      for (let i = 0; i < 3 + GR; i++) P({ x: p.x + rnd(-6, 6), y: p.y, z: rnd(6, 16), vx: rnd(-30, 30), vy: rnd(-15, 15), vz: rnd(10, 30), g: 20, life: 0.7, shape: 'feather', col: pick([col, '#ffffff']), size: 2, spin: 6, rot: R() * TAU, flutter: true });
      GL(p.x + p.face[0] * 10, p.y - 8 + p.face[1] * 8, 10 + GR * 2, col, 0.25, { pulse: true });
    } else {   // 마법: 그 마도구의 마법진이 번쩍 · 마도구의 것이 흩어진다
      decal({ kind: 'glyph', x: p.x, y: p.y, r: 14 + GR * 3, life: 0.6, col, spin: 6 });
      const Fo = VX.myFoc(); for (let i = 0; i < 3 + GR; i++) VX.mote(p.x, p.y, 10, Fo, { vx: rnd(-50, 50), vy: rnd(-30, 30) });
      GL(p.x, p.y - 10, 12 + GR * 3, col, 0.3, { pulse: true });
    }
    if (big || sp) { ring(p.x, p.y - 8, col, 24 + GR * 4, 0.35, 2); GL(p.x, p.y - 10, 30 + GR * 6, col, 0.4, { pulse: true }); }
    return true;
  };

  /* ═════════ 매 프레임: 몸에 두르는 것 ═════════ */
  VX.auras = function (p, dt) {
    const s = S(); if (!s) return;
    if (p.shoutT > 0 && R() < 0.5) P({ x: p.x + rnd(-6, 6), y: p.y, z: rnd(0, 6), vx: 0, vy: 0, vz: rnd(30, 50), g: 0, life: 0.35, shape: 'flame', cols: ['#fff2b0', '#ff8a5a', '#c83a2a'], size: 2 });
    if (p.healT > 0 && R() < 0.3) P({ x: p.x + rnd(-8, 8), y: p.y, z: rnd(0, 10), vx: 0, vy: 0, vz: rnd(14, 24), g: 0, life: 0.7, shape: R() < 0.6 ? 'leaf' : 'heart', col: pick(['#8ae0a0', '#c8ffd8', '#ff9ab8']), size: 2, spin: 4, rot: R() * TAU, flutter: true });
    if (p.hawkT > 0 && R() < 0.15) { const a = W().t * 3; P({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 6, z: 20, vx: 0, vy: 0, vz: -4, g: 0, life: 0.6, shape: 'feather', col: '#ffe8a8', size: 2, spin: 3, rot: a, add: true }); }
    if ((p.barrageT > 0 || p.volleyT > 0) && R() < 0.4) P({ x: p.x + p.face[0] * 10 + rnd(-3, 3), y: p.y + p.face[1] * 8, z: 10, vx: 0, vy: 0, vz: 0, g: 0, life: 0.2, col: p.barrageT > 0 ? '#e8f0c0' : '#a8d8ff', add: true, shape: 'star' });
    if (p.state === 'dash' && p.dash) { P({ x: p.x, y: p.y, z: rnd(4, 16), vx: -p.dash.dir[0] * 220, vy: -p.dash.dir[1] * 160, vz: 0, g: 0, life: 0.15, shape: 'line', len: 12, col: '#fff8c0', add: true }); if (R() < 0.5) P({ x: p.x + rnd(-4, 4), y: p.y, z: rnd(2, 18), vx: 0, vy: 0, vz: 10, g: 0, life: 0.5, shape: 'star', col: '#fff8c0', add: true }); }
  };
  // 몸에 두르는 막 · 어두워지는 하늘 (빛 위에 덧그린다)
  const OV = W().overlays || (W().overlays = []);
  OV.push(function (g, cx, cy, v) {
    const p = W().player; if (!p) return;
    // 기술이 하늘을 어둡게 할 때 (흰빛 심판 · 천둥 · 일도양단 …)
    p.vDimA = U.approach(p.vDimA || 0, p.vDim || 0, 1.6 / 60);
    if (p.vDimA > 0.01) { g.save(); g.globalAlpha = p.vDimA; g.fillStyle = '#05030c'; g.fillRect(0, 0, v.w, v.h); g.restore(); }
    // 무명: 시간이 멎은 동안 잿빛
    if (p.vGrey) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.globalAlpha = 0.85; g.fillRect(0, 0, v.w, v.h); g.restore(); }
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy - 10 - (p.jz || 0)), t = W().t;
    // 마나 방패: 푸른 육각 막
    if (p.wardT > 0) { g.save(); g.globalAlpha = 0.35 + Math.sin(t * 6) * 0.1; g.strokeStyle = '#8ab8ff'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 6; i++) { const a = t * 0.8 + i / 6 * TAU, px = x + Math.cos(a) * 13, py = y + Math.sin(a) * 15; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); g.globalAlpha *= 0.3; g.fillStyle = '#8ab8ff'; g.fill(); g.restore(); }
    // 빛의 방벽: 금빛 비늘 막 (남은 횟수만큼 비늘)
    if (p.barrierT > 0 && p.barrier > 0) { g.save(); for (let i = 0; i < p.barrier; i++) { const a = t * 2 + i / p.barrier * TAU, px = x + Math.cos(a) * 14, py = y + Math.sin(a) * 12; g.globalAlpha = 0.8; g.fillStyle = '#fff4c8'; g.beginPath(); g.moveTo(px, py - 3); g.lineTo(px + 2, py); g.lineTo(px, py + 3); g.lineTo(px - 2, py); g.closePath(); g.fill(); } g.globalAlpha = 0.18; g.strokeStyle = '#fff4c8'; g.beginPath(); g.arc(x, y, 15, 0, TAU); g.stroke(); g.restore(); }
    // 반격 자세: 앞쪽에 푸른 활
    if (p.parryT > 0) { g.save(); g.globalAlpha = 0.6; g.strokeStyle = '#8ad8ff'; g.lineWidth = 2; const a = ang(p); g.beginPath(); g.ellipse(x, y + 2, 14, 11, 0, a - 1.1, a + 1.1); g.stroke(); g.restore(); }
  });
  /* ═════════ 등급: 같은 기술 · 같은 꼴이라도 등급이 높을수록 크고 화려하게 ═════════
     일반 — 꾸밈 없이 / 고급 — 등급 빛 한 점 / 희귀 — 빛 꼬리 · 어둠을 밝힘 · 맞은 자리 고리 /
     영웅 — 둘레를 도는 반짝임 · 빛살 · 바닥 마법진 / 전설 — 금빛 후광 · 큰 빛살 · 화면 가장자리 금빛 · 손에 든 무기에서 빛이 샌다 */
  const GRD = (g) => G.prog.GRADES[Math.max(1, Math.min(5, g || 1))];
  const gcol = (g) => GRD(g).glow || '#e8e8f0';
  const itemGrade = (id) => (id && G.data.ITEMS[id] && G.data.ITEMS[id].grade) || 1;
  VX.GRD = GRD; VX.gcol = gcol; VX.itemGrade = itemGrade;
  // 탄에 등급: 필살기 → 그 필살기 등급, 스킬 → 그 스킬 등급, 기본 화살 · 주문 → 든 활 · 마도구의 등급
  const shT = C.onShoot;
  C.onShoot = function (o) {
    o = (shT ? shT.apply(this, arguments) : null) || o;
    if (!o || o.owner === 'foe' || o.foe || o.tier) return o;
    const s = S(); if (!s) return o;
    const sk = VX.CTX.skill, sp = o.spId || VX.CTX.sp;
    o.tier = sp ? ((G.data.SPECIALS[sp] || {}).grade || 3) : sk ? ((SN.ASK[sk] || {}).grade || 1) : (o.kind === 'arrow' || o.src === 'arrow') ? itemGrade(s.equip.bow) : o.src === 'spell' ? itemGrade(s.equip.focus) : 1;
    if (o.proc) o.tier = Math.min(o.tier, 2);
    return o;
  };
  VX.tierTrail = function (sh) {
    const t = sh.tier || 1; if (t < 2) return;
    const c = gcol(t);
    if (R() < 0.12 * t) tp(sh, { col: c, life: 0.25 + t * 0.05, add: true, shape: t >= 4 ? 'star' : undefined, tw: 14, vx: rnd(-10, 10), vy: rnd(-10, 10), size: t >= 5 && R() < 0.3 ? 2 : 1 });
    if (t >= 4) { sh._tc = (sh._tc || 0) + 1; const an = sh._tc * 0.8; if (sh._tc % (t >= 5 ? 2 : 4) === 0) P({ x: sh.x + Math.cos(an) * 5, y: sh.y + Math.sin(an) * 4, z: sh.zoff, vx: 0, vy: 0, vz: 0, g: 0, life: 0.3, col: t >= 5 ? pick(['#fff0a8', '#ffd84a', '#ffffff']) : c, add: true, shape: 'star', size: 1 }); }
    if (t >= 3 && !sh.glowR) sh.glowR = 6 + t * 3;
  };
  VX.tierDraw = function (g, x, y, a, sh) {
    const t = sh.tier || 1; if (t < 4) return;
    const c = gcol(t), pul = Math.sin(sh.t * 18);
    g.save(); g.globalAlpha = 0.35 + pul * 0.1; g.strokeStyle = c; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, 4 + (t >= 5 ? 2 : 0) + pul, 0, TAU); g.stroke();
    if (t >= 5) { g.globalAlpha = 0.25; g.fillStyle = '#fff0a8'; g.beginPath(); g.arc(x, y, 7 + pul * 1.5, 0, TAU); g.fill(); }
    g.restore();
  };
  VX.tierHit = function (sh, e) {
    const t = sh.tier || 1; if (t < 3) return;
    const c = gcol(t), x = e ? e.x : sh.x, y = e ? e.y - (e.h || 16) / 2 : sh.y;
    ring(x, y + 8, c, 8 + t * 3, 0.3, t >= 5 ? 2 : 1);
    if (t >= 4) rays(x, y, t >= 5 ? 10 : 6, 8 + t * 3, c, { w: 1, life: 0.2 });
    if (t >= 5) { GL(x, y, 22, '#fff0a8', 0.3, { pulse: true }); if (R() < 0.4) decal({ kind: 'glyph', x, y: y + 8, r: 10, life: 0.8, col: '#ffd84a', spin: 6 }); }
  };
  // 검: 칼끝에서 흐르는 등급 빛 · 바깥 둘째 띠 · 전설은 금빛 반짝임 줄기
  VX.swordTier = function (g, hx, hy, a0, a1, r1, k, gr, wx, wy) {
    if (gr < 2 || k > 0.95) return;
    const c = gcol(gr);
    if (R() < 0.15 * gr) P({ x: wx, y: wy, z: 0, vx: rnd(-20, 20), vy: rnd(-14, 14), vz: rnd(4, 16), g: 0, life: 0.3 + gr * 0.05, col: gr >= 5 ? pick(['#fff0a8', '#ffd84a', '#ffffff']) : c, add: true, shape: gr >= 4 ? 'star' : undefined, size: 1 });
    if (gr >= 4) { g.save(); g.globalAlpha = 0.45 * (1 - k); g.strokeStyle = c; g.lineWidth = gr >= 5 ? 2 : 1; g.beginPath(); g.ellipse(hx, hy + 2, r1 + 5, (r1 + 5) * 0.8, 0, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); g.restore(); }
    if (gr >= 5 && R() < 0.4) GL(wx, wy, 12, '#fff0a8', 0.12, { pulse: true });
  };
  const odT = C.onDamage;
  C.onDamage = function (e, info) {
    const r = odT ? odT.apply(this, arguments) : undefined;
    if (!info || info.proc || info.skill) return r;
    const w = info.w || ({ sword: 'sword', spin: 'sword', dash: 'sword', lunge: 'sword' })[info.src];
    if (w === 'sword') { const s = S(), gr = s ? itemGrade(s.equip.sword) : 1; if (gr >= 3) { const c = gcol(gr); burst(e.x, e.y - (e.h || 16) / 2, 2 + gr, { col: [c, '#ffffff'], shape: gr >= 4 ? 'star' : 'spark', sp: 50 + gr * 15, z: 8, vz: 10, g: 40, life: 0.3, add: true }); if (gr >= 5) GL(e.x, e.y - 8, 16, '#fff0a8', 0.2, { pulse: true }); } }
    return r;
  };
  // 마도구: 등급이 오를수록 마법진 바깥에 테 · 도는 점 · 빛살
  const circ0 = VX.circle;
  VX.circle = function (g, x, y, r, col, rot, alpha, focId) {
    circ0.apply(this, arguments);
    const gr = itemGrade(focId); if (gr < 3) return;
    const c = gcol(gr);
    g.save(); g.globalAlpha = alpha * 0.8; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 1;
    g.beginPath(); g.ellipse(x, y, r * 1.18, r * 1.18 * 0.45, 0, 0, TAU); g.stroke();
    if (gr >= 4) for (let i = 0; i < 4 + (gr - 4) * 4; i++) { const a = -rot * 1.3 + i / (4 + (gr - 4) * 4) * TAU; g.fillRect(Math.round(x + Math.cos(a) * r * 1.18) - 1, Math.round(y + Math.sin(a) * r * 0.53) - 1, 2, 2); }
    if (gr >= 5) for (let i = 0; i < 8; i++) { const a = rot * 0.7 + i / 8 * TAU; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.25, y + Math.sin(a) * r * 0.56); g.lineTo(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 0.68); g.stroke(); }
    g.restore();
  };
  const tip0 = VX.staffTip;
  VX.staffTip = function (wx, wy, k) { tip0.apply(this, arguments); const s = S(), gr = s ? itemGrade(s.equip.focus) : 1; if (gr >= 3 && R() < 0.1 * gr * k) P({ x: wx + rnd(-4, 4), y: wy, z: rnd(-4, 4), vx: 0, vy: 0, vz: rnd(6, 16), g: 0, life: 0.4, col: gcol(gr), add: true, shape: gr >= 4 ? 'star' : undefined }); };
  // 거는 순간: 기술 · 필살기의 등급만큼 커진다
  const fl0 = VX.flourish;
  VX.flourish = function (p, w, big, id) {
    const r = fl0.apply(this, arguments);
    const sp = id && id.startsWith('sp:') ? id.slice(3) : null;
    const GR = sp ? (G.data.SPECIALS[sp] || {}).grade || 3 : (SN.ASK[id] || {}).grade || 1, c = gcol(GR);
    if (GR >= 2) ring(p.x, p.y - 4, c, 10 + GR * 4, 0.3, 1);
    if (GR >= 3) decal({ kind: 'glyph', x: p.x, y: p.y, r: 10 + GR * 4, life: 0.6 + GR * 0.1, col: c, spin: 5 });
    if (GR >= 4) { rays(p.x, p.y - 10, 6 + (GR - 4) * 6, 18 + GR * 4, c, { w: GR >= 5 ? 2 : 1, life: 0.25 }); GL(p.x, p.y - 10, 16 + GR * 5, c, 0.35, { pulse: true }); }
    if (GR >= 5) { p.vGold = 0.6; for (let i = 0; i < 12; i++) P({ x: p.x + rnd(-10, 10), y: p.y, z: rnd(0, 6), vx: 0, vy: 0, vz: rnd(50, 90), g: 0, life: 0.6, col: pick(['#fff0a8', '#ffd84a', '#ffffff']), shape: 'star', add: true, tw: 16, size: R() < 0.4 ? 2 : 1 }); }
    return r;
  };
  // 손에 든 영웅 · 전설 무기: 쉬는 동안에도 빛이 샌다
  const au0 = VX.auras;
  VX.auras = function (p, dt) {
    au0.apply(this, arguments);
    const s = S(); if (!s || !['idle', 'walk'].includes(p.state)) return;
    const w = C.weapon ? C.weapon() : 'sword', id = w === 'sword' ? s.equip.sword : w === 'bow' ? s.equip.bow : s.equip.focus, gr = itemGrade(id);
    if (gr < 4 || R() > (gr >= 5 ? 0.12 : 0.05)) return;
    P({ x: p.x + rnd(-7, 7), y: p.y, z: rnd(6, 20), vx: 0, vy: 0, vz: rnd(4, 12), g: 0, life: 0.6, col: gr >= 5 ? pick(['#fff0a8', '#ffd84a']) : gcol(gr), add: true, shape: 'star', tw: 12 });
  };
  // 전설 기술: 화면 가장자리에 금빛
  OV.push(function (g, cx, cy, v) {
    const p = W().player; if (!p || !(p.vGold > 0)) return;
    p.vGold -= 1 / 60;
    const a = Math.min(1, p.vGold * 2) * 0.5;
    g.save(); const gr = g.createRadialGradient(v.w / 2, v.h / 2, Math.min(v.w, v.h) * 0.35, v.w / 2, v.h / 2, Math.max(v.w, v.h) * 0.7);
    gr.addColorStop(0, 'rgba(255,216,74,0)'); gr.addColorStop(1, 'rgba(255,216,74,' + a.toFixed(3) + ')'); g.fillStyle = gr; g.fillRect(0, 0, v.w, v.h); g.restore();
  });

})();
