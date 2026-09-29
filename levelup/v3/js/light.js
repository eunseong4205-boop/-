/* 빛과 어둠: 어두운 동굴 · 밤의 도시 · 흑점 아래. 횃불 · 등불 · 마법 빛이 어둠을 도려낸다. 날씨(비 · 눈 · 재 · 꽃잎)도 여기서 뿌린다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles;
  const TS = TL.TS;
  const L = { flares: [], layer: null, drops: [], tint: null };

  function flare(x, y, r, sec, col) { L.flares.push({ x, y, r, t: 0, life: sec || 1, col }); }

  function lightsIn(m, W, cx, cy, vw, vh) {
    const out = [];
    const p = W.player;
    if (p) {
      const r = p.lantern ? 78 : 30;
      out.push({ x: p.x, y: p.y - 10, r: r + Math.sin(W.t * 7) * (p.lantern ? 2 : 0.5), a: 1 });
    }
    for (const l of (m.lights || [])) {
      if (l.x < cx - 100 || l.x > cx + vw + 100 || l.y < cy - 100 || l.y > cy + vh + 100) continue;
      if (l.on === false) continue;
      out.push({ x: l.x, y: l.y, r: l.r * (1 + Math.sin(W.t * 9 + l.x) * 0.04), a: l.a || 1 });
    }
    for (const e of W.ents) if (e.glowR && !e.dead && (e.lit == null || e.lit)) out.push({ x: e.x, y: e.y - (e.glowY || 8), r: e.glowR, a: 1 });
    for (const f of L.flares) { const k = f.t / f.life; out.push({ x: f.x, y: f.y, r: f.r * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) * 0.8), a: 1 }); }
    return out;
  }

  function draw(g, cx, cy) {
    const W = G.world, m = W.map, v = W.view;
    for (const f of L.flares) f.t += 1 / 60;
    L.flares = L.flares.filter((f) => f.t < f.life);
    weather(g, m, W, cx, cy, v);
    let dark = m.dark || 0;
    if (m.outdoor && G.story && G.story.nightFactor) dark = Math.max(dark, G.story.nightFactor() * 0.55);
    if (dark <= 0.01) { if (m.tint) { g.fillStyle = m.tint; g.fillRect(0, 0, v.w, v.h); } return; }
    if (!L.layer || L.layer.width !== v.w || L.layer.height !== v.h) L.layer = X.canvas(v.w, v.h);
    const lg = L.layer.getContext('2d');
    lg.globalCompositeOperation = 'source-over';
    lg.clearRect(0, 0, v.w, v.h);
    lg.fillStyle = m.darkCol || 'rgba(4,3,12,1)';
    lg.globalAlpha = dark; lg.fillRect(0, 0, v.w, v.h); lg.globalAlpha = 1;
    lg.globalCompositeOperation = 'destination-out';
    for (const l of lightsIn(m, W, cx, cy, v.w, v.h)) {
      const x = l.x - cx, y = l.y - cy;
      const gr = lg.createRadialGradient(x, y, 0, x, y, Math.max(1, l.r));
      gr.addColorStop(0, 'rgba(0,0,0,' + l.a + ')'); gr.addColorStop(0.55, 'rgba(0,0,0,' + (l.a * 0.8) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      lg.fillStyle = gr; lg.beginPath(); lg.arc(x, y, l.r, 0, Math.PI * 2); lg.fill();
    }
    g.drawImage(L.layer, 0, 0);
    // 빛의 따뜻한 번짐
    g.globalCompositeOperation = 'lighter';
    for (const l of (m.lights || [])) {
      if (l.on === false || !l.warm) continue;
      const x = l.x - cx, y = l.y - cy;
      if (x < -60 || y < -60 || x > v.w + 60 || y > v.h + 60) continue;
      const gr = g.createRadialGradient(x, y, 0, x, y, l.r * 0.6);
      gr.addColorStop(0, l.warm); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - l.r, y - l.r, l.r * 2, l.r * 2);
    }
    g.globalCompositeOperation = 'source-over';
    if (m.tint) { g.fillStyle = m.tint; g.fillRect(0, 0, v.w, v.h); }
  }

  /* ───────── 날씨 ───────── */
  function weather(g, m, W, cx, cy, v) {
    const kind = m.weatherAt ? m.weatherAt(W.player) : m.weather;
    if (!kind) { L.drops.length = 0; return; }
    const want = { rain: 90, snow: 60, ash: 50, petals: 24, leaves: 16, dust: 40, stars: 40, spores: 30 }[kind] || 0;
    while (L.drops.length < want) L.drops.push({ x: Math.random() * v.w, y: Math.random() * v.h, s: 0.5 + Math.random(), p: Math.random() * 6 });
    if (L.drops.length > want) L.drops.length = want;
    const dt = 1 / 60;
    const dcx = (L.lcx == null ? 0 : cx - L.lcx), dcy = (L.lcy == null ? 0 : cy - L.lcy);
    L.lcx = cx; L.lcy = cy;
    for (const d of L.drops) {
      d.x -= dcx * 0.9; d.y -= dcy * 0.9;
      if (kind === 'rain') { d.x -= 60 * dt * d.s; d.y += 260 * dt * d.s; }
      else if (kind === 'snow') { d.x += Math.sin(W.t + d.p) * 12 * dt; d.y += 22 * dt * d.s; }
      else if (kind === 'ash') { d.x += (8 + Math.sin(W.t * 0.7 + d.p) * 10) * dt; d.y += 14 * dt * d.s; }
      else if (kind === 'petals' || kind === 'leaves') { d.x += (20 + Math.sin(W.t * 2 + d.p) * 20) * dt; d.y += 18 * dt * d.s; }
      else if (kind === 'dust') { d.x += 70 * dt * d.s; d.y += Math.sin(W.t * 3 + d.p) * 6 * dt; }
      else if (kind === 'spores') { d.y -= 8 * dt * d.s; d.x += Math.sin(W.t + d.p) * 6 * dt; }
      d.x = ((d.x % v.w) + v.w) % v.w; d.y = ((d.y % v.h) + v.h) % v.h;
      const x = Math.round(d.x), y = Math.round(d.y);
      if (kind === 'rain') { g.fillStyle = 'rgba(180,200,255,0.45)'; g.fillRect(x, y, 1, 4); }
      else if (kind === 'snow') { g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x, y, d.s > 1 ? 2 : 1, d.s > 1 ? 2 : 1); }
      else if (kind === 'ash') { g.fillStyle = d.s > 1.2 ? 'rgba(255,140,80,0.8)' : 'rgba(120,110,120,0.7)'; g.fillRect(x, y, 1, 1); }
      else if (kind === 'petals') { g.fillStyle = d.p > 3 ? '#ffc8e0' : '#ffe8f0'; g.fillRect(x, y, 2, 1); }
      else if (kind === 'leaves') { g.fillStyle = d.p > 3 ? '#e8a040' : '#c86a30'; g.fillRect(x, y, 2, 1); }
      else if (kind === 'dust') { g.fillStyle = 'rgba(230,200,140,0.5)'; g.fillRect(x, y, 2, 1); }
      else if (kind === 'stars') { if (Math.sin(W.t * 3 + d.p * 7) > 0.3) { g.fillStyle = '#fff'; g.fillRect(x, y, 1, 1); } }
      else if (kind === 'spores') { g.fillStyle = 'rgba(200,255,180,0.7)'; g.fillRect(x, y, 1, 1); }
    }
    if (kind === 'rain' && Math.random() < 0.003) { L.flash = 0.25; if (G.audio) G.audio.sfx('thunder'); }
    if (L.flash > 0) { L.flash -= 1 / 60; g.fillStyle = 'rgba(255,255,255,' + L.flash + ')'; g.fillRect(0, 0, v.w, v.h); }
  }

  G.light = Object.assign(L, { draw, flare });
})();
