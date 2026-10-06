/* 효과: 먼지 · 불꽃 · 빛 조각 · 물보라 · 잎 · 떠오르는 숫자 · 파동 · 잔상
   + 모양 있는 입자(별 · 불꽃 혀 · 연기 · 깃털 · 잎 · 물방울 · 거품 · 룬 · 얼음 조각 …, vfx.js가 쓴다)
   + 바닥 자국(그을림 · 서리 · 갈라짐 · 독 웅덩이 · 마법진 흔적) · 빛줄기(광선 · 번개 · 조준선) · 어둠 위에 빛나는 번짐(빛 더하기) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx;

  const F = { parts: [], under: [], floats: [], rings: [], after: [], slashes: [], decals: [], lines: [], glows: [] };
  const MAXP = 760;

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

  /** 맞은 자리의 베인 자국: 가늘고 밝은 선이 번쩍였다 사라진다 (타격감) */
  function slash(x, y, ang, col, len) { F.slashes.push({ x, y, a: ang + (Math.random() - 0.5) * 0.5 + Math.PI / 2, col: col || '#ffffff', len: len || 12, t: 0, life: 0.13 }); if (F.slashes.length > 24) F.slashes.shift(); }

  /** 바닥 자국: kind = scorch · frost · crack · splat · glyph · crater · ring · petals (vfx.js) */
  // 자국 · 빛줄기의 모양 난수는 따로 (그리기가 게임 난수를 건드리지 않게)
  let vs = 0x1b873593; const VR = () => { vs ^= vs << 13; vs ^= vs >>> 17; vs ^= vs << 5; return (vs >>> 0) / 4294967296; };
  function decal(o) { F.decals.push(Object.assign({ t: 0, life: 2, r: 12, rot: VR() * 6.28, seed: VR() * 1000 }, o)); if (F.decals.length > 36) F.decals.shift(); }
  /** 빛줄기: kind = beam(굵은 빛) · bolt(갈라지는 번개) · laser(가는 조준선) · ribbon(휘는 띠) */
  function line(o) { F.lines.push(Object.assign({ t: 0, life: 0.25, w: 3, col: '#ffffff', kind: 'beam', seed: VR() * 1000 }, o)); if (F.lines.length > 48) F.lines.shift(); }
  /** 어둠 위에 빛나는 번짐 (빛 더하기) */
  function glowAt(x, y, r, col, life, o) { F.glows.push(Object.assign({ x, y, r, col, life: life || 0.3, t: 0, z: 0, a: 1 }, o)); if (F.glows.length > 70) F.glows.shift(); }

  function update(dt) {
    for (const s2 of F.slashes) s2.t += dt;
    F.slashes = F.slashes.filter((s2) => s2.t < s2.life);
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
    for (const d of F.decals) d.t += dt;
    F.decals = F.decals.filter((d) => d.t < d.life);
    for (const l of F.lines) l.t += dt;
    F.lines = F.lines.filter((l) => l.t < l.life);
    for (const o of F.glows) o.t += dt;
    F.glows = F.glows.filter((o) => o.t < o.life);
  }
  function drawUnder(g, cx, cy) {
    if (F.decals.length) drawDecals(g, cx, cy);
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
    for (const s2 of F.slashes) {
      const k = s2.t / s2.life, L = s2.len * (0.6 + k * 0.8), w = Math.max(1, 3 * (1 - k));
      const x = s2.x - cx, y = s2.y - cy, dx = Math.cos(s2.a) * L, dy = Math.sin(s2.a) * L * 0.8;
      g.globalAlpha = 1 - k; g.strokeStyle = s2.col; g.lineWidth = w + 2;
      g.beginPath(); g.moveTo(x - dx, y - dy); g.lineTo(x + dx, y + dy); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1, w * 0.6);
      g.beginPath(); g.moveTo(x - dx * 0.8, y - dy * 0.8); g.lineTo(x + dx * 0.8, y + dy * 0.8); g.stroke();
      if (k < 0.4) { g.fillStyle = '#ffffff'; g.globalAlpha = (0.4 - k) * 2.5; g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4); }
    }
    g.globalAlpha = 1; g.lineWidth = 1;
    for (const p of F.parts) {
      if (p.add) continue;   // 빛 더하는 입자는 어둠 위(drawGlow)에서
      const k = p.fade ? 1 - p.t / p.life : 1;
      g.globalAlpha = Math.max(0, Math.min(1, k * 1.5)) * (p.a == null ? 1 : p.a);
      g.fillStyle = p.cols ? p.cols[Math.min(p.cols.length - 1, Math.floor(p.t / p.life * p.cols.length))] : p.col;
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy - p.z);
      if (p.shape) { shape(g, p, x, y, k); continue; }
      if (p.glow && p.size >= 1) { g.globalAlpha *= 0.35; g.fillRect(x - 1, y - 1, p.size + 2, p.size + 2); g.globalAlpha = Math.max(0, Math.min(1, k * 1.5)); }
      g.fillRect(x, y, p.size, p.size);
    }
    g.globalAlpha = 1;
    drawLines(g, cx, cy, false);
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
        g.font = f.big ? "12px 'Galmuri11 Bold', 'Galmuri11', monospace" : "12px 'Galmuri11', monospace"; g.textAlign = 'center';
        g.fillStyle = '#0b0914'; g.fillText(f.text, x + 1, y + 1); g.fillText(f.text, x - 1, y + 1); g.fillText(f.text, x, y + 2);
        g.fillStyle = f.col; g.fillText(f.text, x, y); g.textAlign = 'left';
      }
    }
    g.globalAlpha = 1;
  }
  /* ───────── 모양 있는 입자 ───────── */
  const RUNES = [[0x0e, 0x11, 0x15, 0x11, 0x0e], [0x04, 0x0e, 0x15, 0x04, 0x04], [0x11, 0x0a, 0x04, 0x0a, 0x11], [0x1f, 0x04, 0x0e, 0x04, 0x1f], [0x04, 0x0a, 0x11, 0x0a, 0x04], [0x18, 0x14, 0x12, 0x11, 0x1f], [0x15, 0x15, 0x0e, 0x04, 0x04], [0x0e, 0x04, 0x1f, 0x04, 0x0e]];
  function shape(g, p, x, y, k) {
    const s = Math.max(1, p.size * (p.grow ? 1 + p.grow * (p.t / p.life) : 1));
    const rot = (p.rot || 0) + (p.spin || 0) * p.t;
    switch (p.shape) {
      case 'star': {   // 반짝임: 십자 + 가운데
        const r = Math.round(s * (p.tw ? 0.6 + 0.4 * Math.abs(Math.sin(p.t * p.tw)) : 1));
        g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1);
        if (r >= 3) { g.globalAlpha *= 0.6; g.fillRect(x - 1, y - 1, 3, 3); }
        break;
      }
      case 'spark': case 'line': {   // 날아가는 쪽으로 늘어진 선
        const sp = Math.hypot(p.vx, p.vy - p.vz * 0.5) || 1, L = p.len || Math.min(9, Math.max(2, sp * 0.035)) * s;
        const ux = p.vx / sp, uy = (p.vy - p.vz * 0.5) / sp;
        g.strokeStyle = g.fillStyle; g.lineWidth = p.w || 1;
        g.beginPath(); g.moveTo(x + 0.5, y + 0.5); g.lineTo(x + 0.5 - ux * L, y + 0.5 - uy * L); g.stroke(); g.lineWidth = 1;
        break;
      }
      case 'ring': case 'bubble': {
        g.strokeStyle = g.fillStyle; g.lineWidth = 1;
        g.beginPath(); g.arc(x + 0.5, y + 0.5, s, 0, Math.PI * 2); g.stroke();
        if (p.shape === 'bubble') { g.globalAlpha *= 0.9; g.fillStyle = '#ffffff'; g.fillRect(x - Math.round(s * 0.5), y - Math.round(s * 0.5), 1, 1); }
        break;
      }
      case 'diamond': { const r = Math.round(s); for (let i = -r; i <= r; i++) { const w = r - Math.abs(i); g.fillRect(x - w, y + i, w * 2 + 1, 1); } break; }
      case 'leaf': case 'petal': case 'shard': case 'feather': case 'blade': {
        g.save(); g.translate(x, y); g.rotate(rot);
        if (p.shape === 'leaf' || p.shape === 'petal') { g.fillRect(-s, -Math.max(1, s / 2), s * 2, Math.max(1, s)); if (p.shape === 'leaf') { g.globalAlpha *= 0.6; g.fillStyle = '#ffffff'; g.fillRect(-s + 1, 0, s * 2 - 2, 0.6); } }
        else if (p.shape === 'shard') { g.beginPath(); g.moveTo(-s, s * 0.6); g.lineTo(s, s * 0.6); g.lineTo(0, -s); g.closePath(); g.fill(); }
        else if (p.shape === 'blade') { g.fillRect(-s * 2, -0.5, s * 4, 1); g.fillRect(-s * 2, -1, 1, 2); }
        else { g.fillRect(-s * 1.5, -0.5, s * 3, 1); g.globalAlpha *= 0.7; for (let i = -1; i <= 1; i++) { g.fillRect(i * s * 0.8, -s * 0.8, 1, s * 0.6); g.fillRect(i * s * 0.8, 0.5, 1, s * 0.6); } }
        g.restore(); break;
      }
      case 'drop': { g.fillRect(x, y - 1, 1, 1); g.fillRect(x - Math.floor(s / 2), y, Math.max(1, s), Math.max(1, s)); break; }
      case 'flame': {   // 불꽃 혀: 위로 갈수록 가늘다
        const h = Math.round(s * (1.6 - k * 0.4)), w = Math.max(1, Math.round(s * 0.8 * (0.5 + k)));
        g.fillRect(x - Math.floor(w / 2), y - h + 1, w, h);
        g.globalAlpha *= 0.85; g.fillStyle = '#fff2b0'; if (k > 0.5) g.fillRect(x, y - Math.floor(h / 2), 1, Math.ceil(h / 2));
        break;
      }
      case 'smoke': { g.globalAlpha *= 0.45; g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill(); break; }
      case 'snow': { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); if (s >= 2) { g.globalAlpha *= 0.5; g.fillRect(x - 1, y - 1, 1, 1); g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + 1, y - 1, 1, 1); g.fillRect(x - 1, y + 1, 1, 1); } break; }
      case 'heart': { g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x - 1, y + 1, 3, 1); g.fillRect(x, y + 2, 1, 1); break; }
      case 'rune': { const R = RUNES[(p.glyph || 0) % RUNES.length]; for (let ry = 0; ry < 5; ry++) for (let rx = 0; rx < 5; rx++) if (R[ry] & (16 >> rx)) g.fillRect(x - 2 + rx, y - 2 + ry, 1, 1); break; }
      case 'note': { g.fillRect(x, y - 3, 1, 4); g.fillRect(x - 2, y, 2, 2); g.fillRect(x + 1, y - 3, 1, 1); break; }
      default: g.fillRect(x, y, s, s);
    }
  }

  /* ───────── 바닥 자국 ───────── */
  function drawDecals(g, cx, cy) {
    for (const d of F.decals) {
      const k = d.t / d.life, a = (d.a == null ? 1 : d.a) * (k < 0.1 ? k / 0.1 : k > 0.6 ? (1 - k) / 0.4 : 1);
      const x = Math.round(d.x - cx), y = Math.round(d.y - cy), r = d.r * (d.grow ? Math.min(1, d.t / d.grow) : 1);
      if (x < -60 || y < -40 || x > 460 || y > 260) continue;
      g.save(); g.globalAlpha = Math.max(0, a);
      switch (d.kind) {
        case 'scorch': case 'crater':
          g.fillStyle = d.kind === 'crater' ? 'rgba(30,20,16,0.32)' : 'rgba(20,12,8,' + (r > 24 ? 0.22 : 0.34) + ')'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.fill();
          if (d.kind === 'crater') { g.fillStyle = 'rgba(20,12,8,0.3)'; g.beginPath(); g.ellipse(x, y, r * 0.55, r * 0.22, 0, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = d.col || '#ff8a3a';
          for (let i = 0; i < 8; i++) { const an = d.seed + i * 0.79, rr = r * (0.3 + ((d.seed * (i + 3)) % 1) * 0.6); if ((Math.sin(d.t * 9 + i) > 0.2) && k < 0.7) g.fillRect(Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr * 0.45), 1, 1); }
          if (d.kind === 'crater') { g.strokeStyle = 'rgba(200,170,130,0.5)'; g.beginPath(); g.ellipse(x, y, r * 1.1, r * 0.5, 0, Math.PI, Math.PI * 2); g.stroke(); }
          break;
        case 'frost': {
          g.fillStyle = 'rgba(200,236,255,0.35)'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = d.col || '#e8f8ff'; g.lineWidth = 1;
          for (let i = 0; i < 6; i++) { const an = d.rot + i * Math.PI / 3, L = r * 0.95; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L * 0.45); g.stroke(); const mx = x + Math.cos(an) * L * 0.55, my = y + Math.sin(an) * L * 0.25; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.cos(an + 0.7) * 3, my + Math.sin(an + 0.7) * 1.5); g.moveTo(mx, my); g.lineTo(mx + Math.cos(an - 0.7) * 3, my + Math.sin(an - 0.7) * 1.5); g.stroke(); }
          break;
        }
        case 'crack': {
          g.strokeStyle = d.col || 'rgba(40,28,20,0.7)'; g.lineWidth = 1;
          for (let i = 0; i < 7; i++) { let px = x, py = y, an = d.rot + i * 0.9; g.beginPath(); g.moveTo(px, py); for (let j = 0; j < 3; j++) { an += Math.sin(d.seed + i * 7 + j) * 0.6; px += Math.cos(an) * r / 3; py += Math.sin(an) * r / 6; g.lineTo(Math.round(px), Math.round(py)); } g.stroke(); }
          break;
        }
        case 'splat': {
          g.fillStyle = d.col || '#7ad86a'; g.globalAlpha *= 0.5;
          g.beginPath(); g.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2); g.fill();
          for (let i = 0; i < 6; i++) { const an = d.seed + i * 1.1, rr = r * 1.1; g.beginPath(); g.ellipse(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.42, 2, 1, 0, 0, Math.PI * 2); g.fill(); }
          break;
        }
        case 'glyph': case 'ring': {
          g.strokeStyle = d.col || '#c8a8ff'; g.lineWidth = 1; const ro = d.rot + d.t * (d.spin || 1);
          g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.stroke();
          if (d.kind === 'glyph') {
            g.beginPath(); g.ellipse(x, y, r * 0.7, r * 0.31, 0, 0, Math.PI * 2); g.stroke();
            g.fillStyle = d.col || '#c8a8ff';
            for (let i = 0; i < 6; i++) { const an = ro + i / 6 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(an) * r * 0.85) - 1, Math.round(y + Math.sin(an) * r * 0.38), 2, 1); }
            for (let i = 0; i < 3; i++) { const a1 = -ro + i * 2.094, a2 = a1 + 2.094; g.beginPath(); g.moveTo(x + Math.cos(a1) * r * 0.7, y + Math.sin(a1) * r * 0.31); g.lineTo(x + Math.cos(a2) * r * 0.7, y + Math.sin(a2) * r * 0.31); g.stroke(); }
          }
          break;
        }
        case 'petals': { for (let i = 0; i < 10; i++) { const an = d.seed + i * 0.63, rr = r * (0.2 + ((i * 0.37 + d.seed) % 1) * 0.8); g.fillStyle = i % 2 ? (d.col || '#ff9ac8') : '#ffffff'; g.fillRect(Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr * 0.45), 2, 1); } break; }
        case 'shadow': { g.fillStyle = d.col || 'rgba(20,10,40,0.6)'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.fill(); break; }
        default: break;
      }
      g.restore();
    }
  }

  /* ───────── 빛줄기 ───────── */
  function jag(l, cx, cy, amp, n) {
    const pts = [[l.x0 - cx, l.y0 - cy]], ph = Math.floor(l.t * 30) + l.seed;
    for (let i = 1; i < n; i++) { const k = i / n, dx = l.x1 - l.x0, dy = l.y1 - l.y0, L = Math.hypot(dx, dy) || 1, off = Math.sin(ph * 12.9898 + i * 78.233) * amp; pts.push([l.x0 + dx * k - cx - dy / L * off, l.y0 + dy * k - cy + dx / L * off]); }
    pts.push([l.x1 - cx, l.y1 - cy]);
    return pts;
  }
  function drawLines(g, cx, cy, glowPass) {
    if (!F.lines.length) return;
    g.save(); g.lineCap = 'round';
    for (const l of F.lines) {
      const k = l.t / l.life, f = 1 - k;
      if (glowPass && !l.glow) continue;
      if (l.kind === 'bolt') {
        const pts = jag(l, cx, cy, l.amp || 6, l.n || 8);
        const stroke = (w, col, a) => { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke(); };
        if (glowPass) { stroke(l.w * 3, l.col, 0.35 * f); continue; }
        stroke(l.w + 2, l.col, 0.5 * f); stroke(Math.max(1, l.w * 0.6), '#ffffff', f);
        if (l.branch && k < 0.6) { for (let i = 2; i < pts.length - 1; i += 2) { const q = pts[i], an = Math.sin(l.seed + i) * 2.5; g.globalAlpha = 0.7 * f; g.strokeStyle = l.col; g.lineWidth = 1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + Math.cos(an) * 7, q[1] + Math.sin(an) * 7); g.lineTo(q[0] + Math.cos(an + 0.5) * 11, q[1] + Math.sin(an + 0.5) * 11); g.stroke(); } }
      } else if (l.kind === 'laser') {
        g.globalAlpha = (glowPass ? 0.3 : 0.8) * (l.blink ? (Math.floor(l.t * 20) % 2 ? 1 : 0.4) : 1) * (l.fade === false ? 1 : f); g.strokeStyle = l.col; g.lineWidth = glowPass ? 3 : 1;
        if (l.dash) { g.setLineDash(l.dash); g.lineDashOffset = -l.t * 60; }
        g.beginPath(); g.moveTo(l.x0 - cx, l.y0 - cy); g.lineTo(l.x1 - cx, l.y1 - cy); g.stroke(); g.setLineDash([]);
      } else if (l.kind === 'ribbon' && l.pts) {
        g.strokeStyle = l.col;
        for (let pass = 0; pass < (glowPass ? 1 : 2); pass++) {
          g.globalAlpha = (glowPass ? 0.3 : pass ? 0.9 : 0.45) * f; g.lineWidth = glowPass ? l.w * 2 : pass ? 1 : l.w; if (pass) g.strokeStyle = '#ffffff';
          g.beginPath(); l.pts.forEach((q, i) => (i ? g.lineTo(q[0] - cx, q[1] - cy) : g.moveTo(q[0] - cx, q[1] - cy))); g.stroke();
        }
      } else {   // beam: 굵은 빛 + 흰 속심, 시간이 갈수록 가늘어진다
        const w = l.w * (l.grow ? 1 + k * l.grow : f);
        if (glowPass) { g.globalAlpha = 0.35 * f; g.strokeStyle = l.col; g.lineWidth = w * 2.4; g.beginPath(); g.moveTo(l.x0 - cx, l.y0 - cy); g.lineTo(l.x1 - cx, l.y1 - cy); g.stroke(); continue; }
        g.globalAlpha = 0.6 * f; g.strokeStyle = l.col; g.lineWidth = Math.max(1, w); g.beginPath(); g.moveTo(l.x0 - cx, l.y0 - cy); g.lineTo(l.x1 - cx, l.y1 - cy); g.stroke();
        g.globalAlpha = f; g.strokeStyle = l.core || '#ffffff'; g.lineWidth = Math.max(1, w * 0.35); g.beginPath(); g.moveTo(l.x0 - cx, l.y0 - cy); g.lineTo(l.x1 - cx, l.y1 - cy); g.stroke();
      }
    }
    g.restore();
  }

  /* ───────── 어둠 위에 빛나는 것 (빛 더하기 — 마법 · 불 · 별이 어두운 곳을 밝힌다) ───────── */
  const STAMP = new Map();
  function stamp(r, col) {
    const key = r + col; let c = STAMP.get(key); if (c) return c;
    c = X.canvas(r * 2, r * 2); const g = c.getContext('2d');
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, col); gr.addColorStop(0.18, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = 0.8; g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
    if (STAMP.size > 200) STAMP.clear();
    STAMP.set(key, c); return c;
  }
  function drawGlow(g, cx, cy) {
    let any = F.glows.length || F.lines.length;
    if (!any) for (const p of F.parts) if (p.add) { any = true; break; }
    if (!any) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const o of F.glows) {
      const k = o.t / o.life, a = o.a * (o.pulse ? 1 - k : k < 0.2 ? k / 0.2 : (1 - k) / 0.8);
      const r = Math.max(2, Math.round((o.r * (o.grow ? 0.4 + k * o.grow : 1)) / 2) * 2);
      g.globalAlpha = Math.max(0, Math.min(1, a)) * 0.42;
      g.drawImage(stamp(r, o.col), Math.round(o.x - cx - r), Math.round(o.y - cy - (o.z || 0) - r));
    }
    for (const p of F.parts) {
      if (!p.add) continue;
      const k = p.fade ? 1 - p.t / p.life : 1;
      g.globalAlpha = Math.max(0, Math.min(1, k * 1.5)) * (p.a == null ? 1 : p.a) * 0.8;
      g.fillStyle = p.cols ? p.cols[Math.min(p.cols.length - 1, Math.floor(p.t / p.life * p.cols.length))] : p.col;
      const x = Math.round(p.x - cx), y = Math.round(p.y - cy - p.z);
      if (p.shape) shape(g, p, x, y, k); else { g.fillRect(x, y, p.size, p.size); if (p.glow) { g.globalAlpha *= 0.3; g.fillRect(x - 1, y - 1, p.size + 2, p.size + 2); } }
    }
    drawLines(g, cx, cy, true);
    g.restore();
  }
  function clear() { F.parts = []; F.floats = []; F.rings = []; F.after = []; F.slashes = []; F.decals = []; F.lines = []; F.glows = []; }

  Object.assign(F, { part, dust, sparks, shards, splash, leaves, glow, float, ring, afterimage, slash, decal, line, glowAt, update, drawUnder, drawOver, drawGlow, clear, RUNES });
  G.fx = F;
})();
