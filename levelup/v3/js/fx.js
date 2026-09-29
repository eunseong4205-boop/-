/* 효과: 먼지 · 불꽃 · 빛 조각 · 물보라 · 잎 · 떠오르는 숫자 · 파동 · 잔상 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx;

  const F = { parts: [], under: [], floats: [], rings: [], after: [] };
  const MAXP = 600;

  function part(p) { if (F.parts.length > MAXP) F.parts.shift(); F.parts.push(Object.assign({ vx: 0, vy: 0, vz: 0, z: 0, g: 0, life: 0.5, t: 0, size: 1, col: '#fff', drag: 0, fade: true, glow: false }, p)); }

  function dust(x, y, n) {
    for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 8, y: y - 1, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 10, z: 1, vz: 10 + Math.random() * 18, g: 60, life: 0.35 + Math.random() * 0.25, col: Math.random() < 0.5 ? '#d8c8a8' : '#b8a888', size: Math.random() < 0.3 ? 2 : 1, drag: 3 });
  }
  function sparks(x, y, n, col, speed) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = (speed || 90) * (0.4 + Math.random() * 0.8);
      part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.7, z: 6, vz: 20 + Math.random() * 40, g: 160, life: 0.25 + Math.random() * 0.3, col: col || '#fff2a8', size: Math.random() < 0.4 ? 2 : 1, drag: 4, glow: true });
    }
  }
  function shards(x, y, n, col) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
      part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, z: 8, vz: 60 + Math.random() * 50, g: 200, life: 0.6 + Math.random() * 0.5, col, size: 2, drag: 1.5 });
    }
  }
  function splash(x, y) {
    for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 40; part({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.4, z: 1, vz: 50 + Math.random() * 50, g: 260, life: 0.45, col: i % 2 ? '#d8f0ff' : '#8ac8f8', size: 1 }); }
    ring(x, y, '#d8f0ff', 10, 0.4);
  }
  function leaves(x, y, n, col) {
    for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 10, y: y - 4, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 30, z: 6 + Math.random() * 6, vz: 30 + Math.random() * 30, g: 90, life: 0.7 + Math.random() * 0.4, col: col || '#6ac85a', size: 2, drag: 2.5, flutter: true });
  }
  function glow(x, y, col, n, rise) {
    for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 14, y: y + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 10, vy: 0, z: Math.random() * 10, vz: rise || 20 + Math.random() * 20, g: 0, life: 0.8 + Math.random() * 0.6, col, size: 1, glow: true });
  }
  /** 떠오르는 글자 (피해 숫자 · 알림) */
  function float(x, y, text, col, opt) { F.floats.push(Object.assign({ x, y, text: String(text), col: col || '#fff', t: 0, life: 0.8, vy: -34, big: false, num: /^[0-9+\-x/.:]+$/.test(String(text)) }, opt)); if (F.floats.length > 40) F.floats.shift(); }
  function ring(x, y, col, r, life, width) { F.rings.push({ x, y, col, r: r || 16, life: life || 0.35, t: 0, w: width || 1 }); }
  /** 잔상: 구르기 · 돌진 */
  function afterimage(img, x, y, alpha) { F.after.push({ img, x, y, a: alpha || 0.5, t: 0, life: 0.18 }); if (F.after.length > 20) F.after.shift(); }

  function update(dt) {
    for (const p of F.parts) {
      p.t += dt;
      if (p.drag) { p.vx *= 1 - Math.min(1, p.drag * dt); p.vy *= 1 - Math.min(1, p.drag * dt); }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.flutter) p.x += Math.sin(p.t * 9 + p.y) * 12 * dt;
      p.vz -= p.g * dt; p.z += p.vz * dt;
      if (p.z < 0) { p.z = 0; p.vz = -p.vz * 0.3; p.vx *= 0.6; p.vy *= 0.6; }
    }
    F.parts = F.parts.filter((p) => p.t < p.life);
    for (const f of F.floats) { f.t += dt; f.y += f.vy * dt; f.vy *= 1 - 3 * dt; }
    F.floats = F.floats.filter((f) => f.t < f.life);
    for (const r of F.rings) r.t += dt;
    F.rings = F.rings.filter((r) => r.t < r.life);
    for (const a of F.after) a.t += dt;
    F.after = F.after.filter((a) => a.t < a.life);
  }
  function drawUnder(g, cx, cy) {
    for (const r of F.rings) {
      const k = r.t / r.life;
      g.strokeStyle = r.col; g.globalAlpha = 1 - k; g.lineWidth = r.w;
      g.beginPath(); g.ellipse(Math.round(r.x - cx), Math.round(r.y - cy), r.r * (0.3 + k), r.r * (0.3 + k) * 0.5, 0, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
    for (const a of F.after) { g.globalAlpha = a.a * (1 - a.t / a.life); g.drawImage(a.img, Math.round(a.x - cx), Math.round(a.y - cy)); }
    g.globalAlpha = 1;
  }
  function drawOver(g, cx, cy) {
    for (const p of F.parts) {
      const k = p.fade ? 1 - p.t / p.life : 1;
      g.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
      g.fillStyle = p.col;
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy - p.z);
      if (p.glow && p.size >= 1) { g.globalAlpha *= 0.35; g.fillRect(x - 1, y - 1, p.size + 2, p.size + 2); g.globalAlpha = Math.max(0, Math.min(1, k * 1.5)); }
      g.fillRect(x, y, p.size, p.size);
    }
    g.globalAlpha = 1;
    for (const f of F.floats) {
      const k = f.t / f.life;
      g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
      const pop = f.t < 0.1 ? 1 + (0.1 - f.t) * 6 : 1;
      const x = Math.round(f.x - cx), y = Math.round(f.y - cy);
      if (f.num) {
        const w = X.digitsWidth(f.text);
        if (pop > 1.05) { g.save(); g.translate(x, y); g.scale(pop, pop); X.digits(g, f.text, -Math.round(w / 2), -2, f.col); g.restore(); }
        else X.digits(g, f.text, x - Math.round(w / 2), y - 2, f.col);
      } else {
        g.font = (f.big ? 10 : 8) + "px 'Galmuri11', monospace"; g.textAlign = 'center';
        g.fillStyle = '#0b0914'; g.fillText(f.text, x + 1, y + 1); g.fillText(f.text, x - 1, y + 1); g.fillText(f.text, x, y + 2);
        g.fillStyle = f.col; g.fillText(f.text, x, y); g.textAlign = 'left';
      }
    }
    g.globalAlpha = 1;
  }
  function clear() { F.parts = []; F.floats = []; F.rings = []; F.after = []; }

  Object.assign(F, { part, dust, sparks, shards, splash, leaves, glow, float, ring, afterimage, update, drawUnder, drawOver, clear });
  G.fx = F;
})();
