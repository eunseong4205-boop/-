/* 건물 · 가구 · 지도 등록부
   - 건물 겉모습: 지역마다 지붕 · 벽 모양이 다르다 (초가 · 벽돌 · 흰 벽 · 사암 돔 · 보랏빛 탑 · 천막 · 눈 지붕 · 철판 · 고딕 · 공방)
   - 특별한 곳: 동굴 입구 · 신전 · 징수탑 · 등대 · 성문 · 피라미드
   - 가구: 탁자 · 의자 · 책장 · 통 · 상자 · 화덕 · 계산대 · 화분 · 시계 · 모루 · 솥 · 창문 · 그림 · 성상 · 긴 의자 …
   - G.maps: 지도 이름 → 짓는 함수. 한 번 지은 지도는 기억해 둔다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles, E = G.ent;
  const T = TL.T, TS = TL.TS;
  const R = (c) => X.ramp(c, 5);
  const OUT = '#1a1224';

  /* ───────── 건물 모양 ───────── */
  const STYLE = {
    green: { wall: '#e8d8b0', wood: '#8a5a32', roof: '#c8a050', roofK: 'thatch', trim: '#6a4424', door: '#8a5a32' },
    red: { wall: '#b86a4a', wood: '#5a3a2a', roof: '#8a3a2a', roofK: 'tile', trim: '#4a2a20', door: '#5a3a2a', brick: true, chimney: true },
    blue: { wall: '#f0f0f0', wood: '#4a6a8a', roof: '#3a6ab8', roofK: 'tile', trim: '#2a4a7a', door: '#3a5a8a' },
    yellow: { wall: '#e8c888', wood: '#a8703a', roof: '#d8a858', roofK: 'dome', trim: '#8a5a2a', door: '#8a4a2a' },
    purple: { wall: '#c8b8d8', wood: '#5a3a6a', roof: '#6a3a9a', roofK: 'tile', trim: '#3a2a5a', door: '#4a2a5a', tall: true },
    rainbow: { wall: '#fff0e0', wood: '#e84a8a', roof: '#ff8ab0', roofK: 'tent', trim: '#4ab8e8', door: '#8a4ae8' },
    white: { wall: '#e8e0d8', wood: '#6a5a4a', roof: '#5a6a8a', roofK: 'snow', trim: '#4a5a6a', door: '#6a4a3a', chimney: true },
    gray: { wall: '#8a8a90', wood: '#4a4a52', roof: '#5a6068', roofK: 'metal', trim: '#3a3a42', door: '#5a5a62', chimney: true },
    black: { wall: '#3a3448', wood: '#1a1626', roof: '#2a2440', roofK: 'gothic', trim: '#1a1626', door: '#2a1a2a', lamps: true },
    colorful: { wall: '#ffe8c8', wood: '#4a8ad8', roof: '#e85a4a', roofK: 'tile', trim: '#3ab86a', door: '#e8a040', chimney: true },
    space: { wall: '#8a98b0', wood: '#4a5468', roof: '#6a7890', roofK: 'metal', trim: '#3a4458', door: '#4ad8ff' },
  };
  const cache = {};
  /** w, h: 바닥 칸 수. 그림은 폭 w*16, 높이 h*16 + 지붕 높이 */
  function building(style, w, h, o) {
    o = o || {};
    const key = [style, w, h, o.sign || '', o.door === false ? 0 : 1, o.kind || '', o.win || '', o.colors ? JSON.stringify(o.colors) : ''].join('|');
    if (cache[key]) return cache[key];
    const S = Object.assign({}, STYLE[style] || STYLE.green, o.colors || {});
    const W = w * TS, wallH = S.tall ? 34 : 28, roofH = h * TS - wallH + (S.tall ? 26 : 14);
    const H = roofH + wallH;
    const b = X.brush(W, H + 2);
    const WL = R(S.wall), RF = R(S.roof), WD = R(S.wood);
    const wy = H - wallH;                      // 벽 윗줄
    // ── 벽 ──
    for (let y = wy; y < H; y++) for (let x = 1; x < W - 1; x++) {
      let c = WL[2];
      if (S.brick) { const row = Math.floor((y - wy) / 4), off = row & 1 ? 4 : 0; if ((y - wy) % 4 === 0 || (x + off) % 8 === 0) c = WL[1]; else if (U.noise2(x >> 3, row, 7) > 0.7) c = WL[3]; }
      else if (S.roofK === 'thatch' || style === 'white') { if ((x % 12) === 0) c = WD[1]; }
      else if (S.roofK === 'metal') { if ((x % 10) === 0) c = WL[1]; if ((x % 10) === 1) c = WL[3]; }
      else if (S.roofK === 'dome') { if (U.noise2(x >> 1, y >> 1, 9) > 0.86) c = WL[1]; }
      b.px(x, y, c);
    }
    // 벽 위 그늘, 아래 토대
    b.hline(1, W - 2, wy, WL[1]); b.hline(1, W - 2, wy + 1, WL[1]);
    b.rect(1, H - 3, W - 2, 3, WD[0]); b.hline(1, W - 2, H - 3, WD[1]);
    // 모서리 기둥 (목조)
    if (!S.brick && S.roofK !== 'dome' && S.roofK !== 'metal') { b.rect(1, wy, 3, wallH, WD[1]); b.rect(W - 4, wy, 3, wallH, WD[1]); b.vline(1, wy, H - 1, WD[2]); }
    // ── 문 ──
    const dx = (W >> 1) - 6;
    if (o.door !== false) {
      const dh = 20;
      b.rect(dx - 1, H - dh - 1, 14, dh + 1, S.trim); b.rect(dx, H - dh, 12, dh, R(S.door)[2]);
      b.rect(dx + 1, H - dh + 1, 4, dh - 2, R(S.door)[3]); b.rect(dx + 7, H - dh + 1, 4, dh - 2, R(S.door)[1]);
      b.px(dx + 9, H - 10, '#e8c860'); b.hline(dx, dx + 11, H - dh, R(S.door)[4]);
      if (style === 'black' || style === 'purple') { b.rect(dx, H - dh, 12, 3, R(S.door)[1]); b.px(dx + 5, H - dh + 1, '#ffd86a'); }
    }
    // ── 창문 ──
    const winY = wy + 8;
    const wins = [];
    if (W >= 64) { wins.push(10, W - 20); if (W >= 96) wins.push(W / 2 - 30, W / 2 + 20); }
    else if (W >= 48) wins.push(6, W - 16);
    for (const x0 of wins) {
      if (Math.abs(x0 + 5 - W / 2) < 12) continue;
      b.rect(x0 - 1, winY - 1, 12, 11, S.trim);
      b.rect(x0, winY, 10, 9, o.win === 'dark' ? '#1a1830' : '#ffe8a0');
      b.rect(x0, winY, 10, 4, o.win === 'dark' ? '#2a2848' : '#fff4c8');
      b.vline(x0 + 4, winY, winY + 8, S.trim); b.hline(x0, x0 + 9, winY + 4, S.trim);
      b.rect(x0 - 2, winY + 9, 14, 2, WD[1]);
      if (style === 'green' || style === 'colorful') { b.px(x0, winY + 11, '#ff6a8a'); b.px(x0 + 3, winY + 11, '#ffd84a'); b.px(x0 + 7, winY + 11, '#ff6a8a'); b.hline(x0 - 1, x0 + 10, winY + 12, '#4a8a3a'); }
    }
    // ── 지붕 ──
    roof(b, S, W, roofH + 2, wy, RF, WD, style);
    // ── 굴뚝 ──
    if (S.chimney && o.kind !== 'tent') { const cx = W - 22; b.rect(cx, 2, 8, roofH * 0.5, '#6a4a3a'); b.rect(cx - 1, 0, 10, 4, '#4a3a2a'); b.hline(cx, cx + 7, 4, '#8a6a5a'); }
    // ── 가게 간판 ──
    if (o.sign) sign(b, o.sign, W, wy);
    if (S.lamps) { for (const x of [dx - 6, dx + 17]) { b.rect(x, H - 22, 3, 5, '#1a1626'); b.rect(x, H - 21, 3, 3, '#ffd86a'); } }
    const c = X.outline(b.put(), OUT);
    cache[key] = { c, W, H, footH: h * TS, doorX: W >> 1 };
    return cache[key];
  }
  function roof(b, S, W, rh, wy, RF, WD, style) {
    const k = S.roofK;
    const bottom = wy + 2;
    if (k === 'dome') {
      b.rect(0, bottom - 6, W, 6, RF[1]); b.hline(0, W - 1, bottom - 6, RF[3]);
      const rx = W * 0.36, ry = Math.min(rh * 0.7, rx * 0.9);
      b.ellipse(W / 2, bottom - 6, rx, ry, RF[2]); b.ellipse(W / 2 - rx * 0.3, bottom - 6 - ry * 0.45, rx * 0.35, ry * 0.3, RF[3]);
      b.rect(W / 2 - 1, bottom - 6 - ry - 5, 2, 6, '#e8c048'); b.px(W / 2 - 1, bottom - 6 - ry - 7, '#fff0a8');
      return;
    }
    if (k === 'tent') {
      const peak = 2, cols = [RF[2], '#fff0f4', S.trim, '#fff0f4'];
      for (let y = peak; y < bottom; y++) { const t = (y - peak) / (bottom - peak); const half = 4 + t * (W / 2 + 2); for (let x = Math.round(W / 2 - half); x <= W / 2 + half; x++) { const band = Math.floor(((x - W / 2) / Math.max(1, half)) * 4 + 4); b.px(x, y, cols[band % 4]); } }
      b.hline(0, W - 1, bottom - 1, RF[0]); for (let x = 2; x < W; x += 6) b.px(x, bottom, RF[1]);
      b.vline(W / 2, 0, peak + 2, '#8a5a32'); b.rect(W / 2 + 1, 0, 5, 3, '#ffd84a');
      return;
    }
    if (k === 'gothic') {
      for (let y = 0; y < bottom; y++) { const t = y / bottom; const half = 3 + t * (W / 2); for (let x = Math.round(W / 2 - half); x <= W / 2 + half; x++) b.px(x, y + 4, (x + y) % 6 === 0 ? RF[1] : x < W / 2 ? RF[3] : RF[2]); }
      b.vline(W / 2, 0, 6, '#8a8098'); b.px(W / 2, 0, '#ffd86a');
      b.hline(0, W - 1, bottom + 3, RF[0]);
      return;
    }
    // 박공 지붕 (볏짚 · 기와 · 눈 · 철판): 앞쪽 경사면이 보인다
    const top = 3;
    for (let y = top; y <= bottom; y++) {
      const t = (y - top) / Math.max(1, bottom - top);
      const inset = Math.round((1 - t) * 6);
      for (let x = inset - 2; x < W - inset + 2; x++) {
        let c = RF[2];
        if (k === 'thatch') { const n = U.noise2(x >> 1, y, 13); c = n > 0.8 ? RF[3] : n < 0.2 ? RF[1] : RF[2]; if ((y - top) % 5 === 4) c = RF[1]; }
        else if (k === 'tile') { const row = Math.floor((y - top) / 4), off = row & 1 ? 4 : 0; if ((y - top) % 4 === 3) c = RF[1]; else if ((x + off) % 8 === 0) c = RF[1]; else if ((y - top) % 4 === 0) c = RF[3]; }
        else if (k === 'metal') { if (x % 8 === 0) c = RF[1]; else if (x % 8 === 1) c = RF[3]; if (((x + 4) % 16 === 0) && (y % 6 === 0)) c = RF[4]; }
        else if (k === 'snow') { const sn = y - top < rh * 0.45 + U.noise2(x >> 2, 1, 17) * 4; c = sn ? (U.noise2(x, y, 19) > 0.8 ? '#dce8f6' : '#f4f8ff') : ((y - top) % 4 === 3 ? RF[1] : RF[2]); }
        b.px(x, y, c);
      }
    }
    // 용마루 · 처마
    b.hline(4, W - 5, top, k === 'snow' ? '#ffffff' : RF[4]); b.hline(4, W - 5, top + 1, k === 'snow' ? '#f4f8ff' : RF[3]);
    b.hline(-2, W + 1, bottom, RF[0]); b.hline(-2, W + 1, bottom - 1, RF[1]);
    if (k === 'snow') for (let x = 2; x < W - 2; x += 7) b.vline(x, bottom + 1, bottom + 2 + (x % 3), '#e8f4ff');
    if (k === 'thatch') for (let x = 0; x < W; x += 3) b.px(x, bottom + 1, RF[1]);
  }
  function sign(b, kind, W, wy) {
    const x = W - 20, y = wy - 3;
    b.rect(x, y, 16, 12, '#6a4424'); b.rect(x + 1, y + 1, 14, 10, '#e8d8b0');
    const ic = { shop: [['  y  ', ' yyy ', 'yyyyy', ' y y '], '#c83a3a'], inn: [['r   r', 'rrrrr', 'r   r'], '#3a6ab8'], forge: [['kkk  ', ' kkkk', '  k  ', '  k  '], '#4a4a5a'], book: [['bbbbb', 'bwbwb', 'bbbbb'], '#6a3a8a'], magic: [['  y  ', 'yyyyy', ' yyy ', 'y   y'], '#8a5ad8'], bar: [[' ccc ', ' ccc ', '  c  ', ' ccc '], '#c87a2a'], church: [['  w  ', 'wwwww', '  w  ', '  w  '], '#c8a040'], lab: [[' g g ', ' g g ', 'ggggg', ' ggg '], '#3aa86a'] }[kind] || [['yyyyy'], '#888'];
    const [rows, col] = ic;
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== ' ') b.px(x + 5 + i, y + 3 + j, col); });
  }

  /* ───────── 특별한 겉모습 ───────── */
  const SPECIAL = {
    cave(o) { // 절벽의 동굴 입구 (폭 2~3칸)
      const w = (o.w || 2) * TS, h = 30, b = X.brush(w + 8, h);
      const C = R(o.col || '#6e5640');
      b.ellipse((w + 8) / 2, h, w / 2 + 4, h - 2, C[1]); b.ellipse((w + 8) / 2, h, w / 2 + 1, h - 6, '#0a0612'); b.ellipse((w + 8) / 2, h + 2, w / 2 - 3, h - 12, '#000000');
      for (let i = 0; i < 7; i++) { const a = Math.PI + (i / 6) * Math.PI; b.rect(Math.round((w + 8) / 2 + Math.cos(a) * (w / 2 + 2)) - 2, Math.round(h + Math.sin(a) * (h - 4)) - 2, 4, 4, C[i % 2 ? 2 : 0]); }
      return { c: X.outline(b.put(), OUT), W: w + 8, H: h, footH: 8, solid: false };
    },
    temple(o) {
      const w = (o.w || 5) * TS, h = 64, b = X.brush(w, h);
      const C = R(o.col || '#c8c0a8');
      b.rect(0, 12, w, h - 12, C[1]); b.rect(0, 12, w, 4, C[3]);
      poly(b, [[-2, 14], [w / 2, 0], [w + 1, 14]], C[2]); b.line(0, 13, w / 2, 1, C[4]);
      for (let x = 6; x < w - 4; x += 12) { if (Math.abs(x + 3 - w / 2) < 10) continue; b.rect(x, 18, 6, h - 22, C[3]); b.vline(x, 18, h - 5, C[4]); b.vline(x + 5, 18, h - 5, C[1]); }
      b.rect(w / 2 - 9, h - 26, 18, 26, '#0a0612'); b.rect(w / 2 - 9, h - 26, 18, 3, C[0]);
      b.rect(0, h - 4, w, 4, C[0]);
      if (o.glyph) { b.ellipse(w / 2, 7, 3, 3, o.glyph); }
      return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS };
    },
    tower(o) { // 징수탑: 가늘고 높은 탑, 꼭대기에 빨아들이는 빛
      const w = 3 * TS, h = 120, b = X.brush(w, h);
      const C = R(o.col || '#6a6a8a');
      for (let y = 18; y < h; y++) { const hw = 10 + (y / h) * 12; for (let x = Math.round(w / 2 - hw); x <= w / 2 + hw; x++) b.px(x, y, x < w / 2 - hw * 0.4 ? C[3] : x > w / 2 + hw * 0.5 ? C[1] : C[2]); if (y % 16 === 0) b.hline(Math.round(w / 2 - hw), Math.round(w / 2 + hw), y, C[0]); }
      b.ellipse(w / 2, 12, 9, 9, o.broken ? '#3a3040' : '#ffe8a8'); b.ellipse(w / 2, 12, 6, 6, o.broken ? '#2a2030' : '#ffffff');
      if (!o.broken) for (let a = 0; a < 8; a++) b.line(w / 2, 12, w / 2 + Math.cos(a * 0.785) * 14, 12 + Math.sin(a * 0.785) * 14, '#fff4c8');
      b.rect(w / 2 - 6, h - 18, 12, 18, '#0a0612'); b.rect(w / 2 - 7, h - 19, 14, 2, C[0]);
      if (o.broken) { b.line(w / 2 - 8, 30, w / 2 + 2, 50, '#1a1020'); b.line(w / 2 + 2, 50, w / 2 - 3, 70, '#1a1020'); }
      return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS };
    },
    lighthouse(o) {
      const w = 3 * TS, h = 110, b = X.brush(w, h);
      for (let y = 22; y < h; y++) { const hw = 9 + (y / h) * 10; const stripe = Math.floor(y / 14) % 2; for (let x = Math.round(w / 2 - hw); x <= w / 2 + hw; x++) b.px(x, y, stripe ? '#e84a4a' : '#f4f4f4'); }
      b.rect(w / 2 - 11, 12, 22, 12, '#2a3a4a'); b.rect(w / 2 - 8, 14, 16, 8, o.lit ? '#fff4a8' : '#6a7a8a'); b.ellipse(w / 2, 10, 12, 5, '#3a4a5a');
      b.rect(w / 2 - 5, h - 16, 10, 16, '#3a2a1a');
      return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS };
    },
    gate(o) { // 성문 · 마을 문
      const w = (o.w || 6) * TS, h = 58, b = X.brush(w, h);
      const C = R(o.col || '#5a5470');
      b.rect(0, 10, 14, h - 10, C[2]); b.rect(w - 14, 10, 14, h - 10, C[2]); b.rect(0, 10, w, 14, C[2]);
      for (let x = 0; x < w; x += 8) b.rect(x, 4, 5, 7, C[3]);
      b.rect(14, 24, w - 28, h - 24, o.open === false ? C[0] : '#0a0612');
      if (o.open === false) for (let x = 16; x < w - 14; x += 5) b.vline(x, 24, h - 1, '#2a2438');
      b.rect(0, 10, 14, 3, C[4]); b.rect(w - 14, 10, 14, 3, C[4]);
      return { c: X.outline(b.put(), OUT), W: w, H: h, footH: TS };
    },
    pyramid(o) {
      const w = (o.w || 10) * TS, h = w * 0.55, b = X.brush(w, h);
      const C = R('#d8b060');
      for (let y = 0; y < h; y++) { const hw = (y / h) * w / 2; for (let x = Math.round(w / 2 - hw); x <= w / 2 + hw; x++) b.px(x, y, (y % 8 === 7) ? C[1] : x < w / 2 ? C[3] : C[2]); }
      b.rect(w / 2 - 10, h - 26, 20, 26, '#0a0612'); b.rect(w / 2 - 12, h - 28, 24, 3, C[1]);
      b.ellipse(w / 2, h * 0.35, 5, 3, '#ffe8a8'); b.px(w / 2, h * 0.35, '#8a3a2a');
      return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 3 * TS };
    },
    well() { const b = X.brush(28, 30); b.ellipse(14, 22, 13, 7, '#7a7890'); b.ellipse(14, 21, 10, 5, '#1a2040'); b.ellipse(14, 22, 10, 4, '#3a5a9a'); b.rect(2, 4, 3, 18, '#6a4424'); b.rect(23, 4, 3, 18, '#6a4424'); poly(b, [[0, 6], [14, 0], [28, 6], [26, 8], [2, 8]], '#a8503a'); b.vline(14, 8, 18, '#c8b890'); b.rect(12, 16, 5, 4, '#8a6a3a'); return { c: X.outline(b.put(), OUT), W: 28, H: 30, footH: 12 }; },
    fountain() { const b = X.brush(44, 32); b.ellipse(22, 22, 21, 10, '#8a88a0'); b.ellipse(22, 21, 18, 8, '#4a7ac8'); b.ellipse(22, 20, 14, 5, '#6a9ae8'); b.rect(19, 4, 6, 16, '#a8a8c0'); b.ellipse(22, 5, 7, 3, '#a8a8c0'); b.px(22, 0, '#d8f0ff'); b.px(21, 1, '#d8f0ff'); b.px(23, 1, '#d8f0ff'); return { c: X.outline(b.put(), OUT), W: 44, H: 32, footH: 16 }; },
    statue(o) { const b = X.brush(20, 40); const C = R(o.col || '#b8b8c8'); b.rect(2, 30, 16, 10, C[1]); b.hline(2, 17, 30, C[3]); b.ellipse(10, 8, 4, 5, C[2]); b.rect(6, 12, 8, 18, C[2]); b.rect(6, 12, 3, 17, C[3]); if (o.veil) { b.rect(5, 5, 10, 4, '#ffffff'); } if (o.sword) { b.vline(15, 6, 28, '#e8e8f0'); b.rect(13, 20, 5, 2, '#e8c048'); } return { c: X.outline(b.put(), OUT), W: 20, H: 40, footH: 12 }; },
    tent(o) { const w = (o.w || 3) * TS, h = 34, b = X.brush(w, h); const C = R(o.col || '#e8c888'); poly(b, [[0, h], [w / 2, 2], [w, h]], C[2]); poly(b, [[w / 2, 2], [w, h], [w * 0.7, h]], C[1]); poly(b, [[w / 2 - 5, h], [w / 2, h - 16], [w / 2 + 5, h]], '#1a1020'); b.vline(w / 2, 0, 4, '#6a4424'); return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS }; },
    stall(o) { const w = (o.w || 3) * TS, b = X.brush(w, 34); const cols = [o.col || '#e84a4a', '#fff4e8']; for (let x = 0; x < w; x++) for (let y = 0; y < 10; y++) b.px(x, y + 2, cols[Math.floor(x / 6) % 2]); for (let x = 0; x < w; x += 6) b.ellipse(x + 3, 12, 3, 2, cols[Math.floor(x / 6) % 2]); b.rect(2, 12, 2, 22, '#6a4424'); b.rect(w - 4, 12, 2, 22, '#6a4424'); b.rect(0, 22, w, 12, '#a8784a'); b.hline(0, w - 1, 22, '#c8985a'); for (let x = 4; x < w - 4; x += 5) b.ellipse(x + 2, 20, 2, 2, ['#ff6a4a', '#ffd84a', '#6ae07a', '#8a5ad8'][(x / 5) % 4 | 0]); return { c: X.outline(b.put(), OUT), W: w, H: 34, footH: TS }; },
    rocket() { const b = X.brush(40, 120); b.ellipse(20, 20, 12, 22, '#f4f4f4'); b.rect(8, 20, 24, 80, '#f4f4f4'); b.rect(8, 20, 7, 80, '#ffffff'); b.rect(26, 20, 6, 80, '#c8c8d8'); for (let y = 40; y < 100; y += 20) b.hline(8, 31, y, '#e84a4a'); b.ellipse(20, 45, 6, 6, '#4a8ad8'); b.ellipse(19, 44, 3, 3, '#aad8ff'); poly(b, [[8, 80], [0, 110], [8, 100]], '#e84a4a'); poly(b, [[32, 80], [40, 110], [32, 100]], '#e84a4a'); b.rect(12, 100, 16, 12, '#4a4a5a'); b.px(20, 0, '#e84a4a'); return { c: X.outline(b.put(), OUT), W: 40, H: 120, footH: 2 * TS }; },
  };
  function poly(b, pts, col) {
    let y0 = 1e9, y1 = -1e9; for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) { const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; const yy = y + 0.5; if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + ((yy - ay) / (by - ay)) * (bx - ax)); } xs.sort((a, c) => a - c); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) b.px(x, y, col); }
  }

  /** 건물 존재: 발자리(칸)를 막고, 문 칸에 들어서면 안으로 */
  class Building extends E.Ent {
    constructor(o0) {
      const o = Object.assign({}, o0); o.btx = o.tx; o.bty = o.ty; delete o.tx; delete o.ty;
      super(Object.assign({ kind: 'building', solid: false, shadow: false }, o));
      o.tx = o.btx; o.ty = o.bty;
      const art = o.special ? SPECIAL[o.special](o) : building(o.style, o.w, o.h, o);
      this.art = art;
      // x, y: 발자리 왼쪽 위 칸
      this.px = o.tx * TS; this.py = o.ty * TS;
      this.x = this.px + art.W / 2 - (o.special === 'cave' ? 4 : 0);
      this.y = this.py + (o.h || 1) * TS - 1;
      this.doorTx = o.tx + Math.floor((o.w || 2) / 2) - (o.w % 2 === 0 ? 0 : 0);
      this.doorTy = o.ty + (o.h || 1);
    }
    update(dt) {
      this.t += dt;
      if (this.art && STYLE[this.style] && STYLE[this.style].chimney && this.special == null && Math.random() < dt * 1.5 && Math.abs(this.x - G.world.player.x) < 300) G.fx.part({ x: this.px + this.art.W - 18, y: this.y - 2, z: this.art.H - 2, vz: 12, vx: 4, g: 0, life: 2, col: 'rgba(200,200,210,0.5)', size: 2, drag: 0.2 });
    }
    draw(g, cx, cy) {
      const a = this.art;
      const x = Math.round(this.px - (this.special === 'cave' ? 4 : 0) - cx), y = Math.round(this.y + 1 - a.H - cy);
      // 주인공이 건물 뒤(위쪽)에 있으면 살짝 비친다
      const p = G.world.player;
      let alpha = 1;
      if (p && p.y < this.py + 6 && p.y > this.y - a.H + 10 && p.x > this.px && p.x < this.px + a.W) alpha = 0.5;
      if (alpha < 1) g.globalAlpha = alpha;
      g.drawImage(a.c, x, y);
      g.globalAlpha = 1;
      if (this.night && G.story.nightFactor && G.story.nightFactor() > 0.3) { /* 밤에 창문 불빛 (빛 층에서) */ }
    }
  }
  /** 발자리 막기 + 문 칸 뚫기 + 창문 불빛 */
  function placeBuilding(m, o) {
    const art = o.special ? SPECIAL[o.special](o) : building(o.style, o.w, o.h, o);
    const w = o.w || Math.ceil(art.W / TS), h = o.h || 1;
    if (o.solid !== false && !(art.solid === false)) for (let y = o.ty; y < o.ty + h; y++) for (let x = o.tx; x < o.tx + w; x++) if (m.inb(x, y)) { m.solidExtra[m.i(x, y)] = 1; m.obj[m.i(x, y)] = 0; }
    // 문: 발자리 맨 아래 줄, 그림 가운데 칸은 막지 않는다 (들어가는 곳)
    const dx = Math.floor((o.tx * TS + art.W / 2) / TS), dy = o.ty + h - 1;
    const hasDoor = o.special ? ['cave', 'temple', 'tower', 'lighthouse', 'pyramid'].includes(o.special) || !!(art.door && o.to) || (o.special === 'gate' && o.open !== false) : o.door !== false;
    if (hasDoor && m.inb(dx, dy)) {
      m.solidExtra[m.i(dx, dy)] = 0;
      const wide = o.special === 'cave' || o.special === 'temple' || o.special === 'pyramid' || o.special === 'gate';
      if (wide) for (let x = o.tx; x < o.tx + w; x++) if (Math.abs(x - dx) <= 1) m.solidExtra[m.i(x, dy)] = 0;
      if (o.to) m.warps.push({ x: wide ? Math.max(o.tx, dx - 1) : dx, y: dy, w: wide ? Math.min(3, w) : 1, h: 1, to: o.to, tx: o.toX, ty: o.toY, dir: 'up', id: o.id, cond: o.cond, msg: o.msg });
    }
    m.buildings.push(Object.assign({ x: o.tx, y: o.ty, w, h, doorX: dx, doorY: dy + 1 }, o));
    if (o.style && !o.special && o.lit !== false) { m.lights.push({ x: o.tx * TS + art.W / 2, y: (o.ty + h) * TS - 10, r: 34, warm: 'rgba(255,190,110,0.16)' }); }
    return { dx, dy };
  }

  /* ───────── 가구 ───────── */
  const DC = {};
  function decor(kind, v) {
    const key = kind + (v || '');
    if (DC[key]) return DC[key];
    let b;
    const P = (w, h) => (b = X.brush(w, h));
    switch (kind) {
      case 'table': P(28, 20); b.rect(1, 3, 26, 9, '#a8784a'); b.rect(1, 3, 26, 2, '#c8985a'); b.rect(1, 11, 26, 2, '#6a4424'); b.rect(3, 12, 3, 8, '#6a4424'); b.rect(22, 12, 3, 8, '#6a4424'); if (v === 'cloth') { b.rect(1, 3, 26, 7, '#f4f0e8'); b.hline(1, 26, 9, '#d8d0c0'); } b.ellipse(10, 5, 3, 2, '#e8e8f0'); b.rect(17, 3, 3, 3, '#c8a050'); break;
      case 'chair': P(12, 18); b.rect(2, 0, 8, 9, '#8a5a32'); b.rect(3, 1, 6, 7, '#a8784a'); b.rect(1, 9, 10, 3, '#a8784a'); b.rect(2, 12, 2, 6, '#6a4424'); b.rect(8, 12, 2, 6, '#6a4424'); break;
      case 'shelf': P(28, 34); b.rect(0, 0, 28, 34, '#6a4424'); b.rect(2, 2, 24, 30, '#3a2418'); for (let r = 0; r < 3; r++) { b.hline(2, 25, 11 + r * 10, '#8a5a32'); for (let x = 3; x < 25; x += 3) { const hh = 6 + (x * 7 + r) % 3; b.rect(x, 11 + r * 10 - hh, 2, hh, ['#c83a3a', '#3a6ab8', '#3aa84a', '#e8c048', '#8a5ad8'][(x + r) % 5]); } } break;
      case 'barrel': P(14, 18); b.ellipse(7, 10, 6.5, 8, '#8a5a32'); b.ellipse(7, 3, 6, 2.5, '#a8784a'); b.hline(1, 13, 7, '#4a4a5a'); b.hline(1, 13, 14, '#4a4a5a'); b.vline(4, 3, 16, '#a8784a'); break;
      case 'crate': P(16, 17); b.rect(0, 1, 16, 16, '#a8784a'); b.rect(0, 0, 16, 4, '#c8985a'); b.rect(1, 5, 14, 11, '#8a5a32'); b.line(1, 5, 14, 15, '#a8784a'); b.line(1, 15, 14, 5, '#a8784a'); break;
      case 'stove': P(26, 30); b.rect(1, 6, 24, 24, '#6a6078'); b.rect(1, 6, 24, 3, '#8a8098'); b.rect(6, 14, 14, 12, '#1a1020'); b.rect(8, 18, 10, 8, '#ff7a2a'); b.rect(10, 20, 6, 6, '#ffd84a'); b.rect(9, 0, 8, 7, '#5a5068'); break;
      case 'counter': P((v || 3) * 16, 22); { const w = (v || 3) * 16; b.rect(0, 4, w, 18, '#8a5a32'); b.rect(0, 2, w, 5, '#c8985a'); b.hline(0, w - 1, 2, '#e8c890'); for (let x = 4; x < w; x += 12) b.rect(x, 10, 8, 8, '#6a4424'); } break;
      case 'plant': P(14, 22); b.rect(3, 14, 8, 8, '#c87a4a'); b.hline(2, 11, 14, '#e89a6a'); b.ellipse(7, 8, 6, 7, '#3a8a3a'); b.ellipse(5, 6, 3, 4, '#5aaa4a'); b.px(9, 4, '#ff8ab0'); break;
      case 'clock': P(14, 36); b.rect(1, 6, 12, 30, '#6a4424'); b.ellipse(7, 7, 6, 6, '#8a5a32'); b.ellipse(7, 7, 4, 4, '#f4f0e0'); b.line(7, 7, 7, 4, '#1a1020'); b.line(7, 7, 9, 8, '#1a1020'); b.rect(4, 18, 6, 12, '#3a2418'); b.vline(7, 18, 26, '#e8c048'); b.ellipse(7, 27, 2, 2, '#e8c048'); break;
      case 'anvil': P(22, 14); b.rect(2, 0, 18, 5, '#5a5a6a'); b.rect(2, 0, 18, 2, '#8a8a9a'); poly(b, [[18, 0], [22, 2], [18, 4]], '#5a5a6a'); b.rect(7, 5, 8, 5, '#4a4a58'); b.rect(4, 10, 14, 4, '#3a3a48'); break;
      case 'cauldron': P(22, 18); b.ellipse(11, 11, 10, 7, '#2a2438'); b.ellipse(11, 6, 9, 3, '#4a3a5a'); b.ellipse(11, 6, 7, 2, v || '#6ae07a'); b.px(8, 3, v || '#6ae07a'); b.px(13, 1, v || '#6ae07a'); break;
      case 'window': P(20, 18); b.rect(0, 0, 20, 18, '#6a4424'); b.rect(2, 2, 16, 14, v === 'night' ? '#1a2048' : '#a8d8ff'); b.rect(2, 2, 16, 6, v === 'night' ? '#2a3068' : '#d8f0ff'); b.vline(10, 2, 15, '#6a4424'); b.hline(2, 17, 9, '#6a4424'); if (v === 'night') { b.px(5, 5, '#ffffff'); b.px(14, 4, '#ffffff'); } break;
      case 'painting': P(20, 16); b.rect(0, 0, 20, 16, '#c8a040'); b.rect(2, 2, 16, 12, v || '#4a8ad8'); b.rect(2, 9, 16, 5, '#4a9a4a'); b.ellipse(13, 6, 2, 2, '#ffe060'); break;
      case 'bookpile': P(16, 12); for (let i = 0; i < 4; i++) b.rect(1 + (i % 2), 8 - i * 3, 13, 3, ['#c83a3a', '#3a6ab8', '#e8c048', '#3aa84a'][i]); break;
      case 'pew': P(48, 18); b.rect(0, 0, 48, 6, '#6a4424'); b.rect(0, 6, 48, 6, '#8a5a32'); b.hline(0, 47, 6, '#a8784a'); b.rect(2, 12, 3, 6, '#4a2a18'); b.rect(43, 12, 3, 6, '#4a2a18'); break;
      case 'altar': P(40, 24); b.rect(0, 6, 40, 18, '#e8e0d0'); b.rect(0, 6, 40, 3, '#ffffff'); b.rect(4, 9, 32, 12, '#c8a040'); b.rect(6, 11, 28, 8, '#e8d0a0'); b.rect(18, 0, 4, 7, '#e8c048'); b.px(19, 0, '#ffffff'); break;
      case 'bench': P(32, 14); b.rect(0, 2, 32, 5, '#a8784a'); b.hline(0, 31, 2, '#c8985a'); b.rect(2, 7, 3, 7, '#6a4424'); b.rect(27, 7, 3, 7, '#6a4424'); break;
      case 'desk': P(30, 22); b.rect(0, 6, 30, 16, '#6a4424'); b.rect(0, 6, 30, 3, '#8a5a32'); b.rect(4, 2, 10, 6, '#f4f0e0'); b.line(5, 3, 12, 3, '#6a6a7a'); b.line(5, 5, 11, 5, '#6a6a7a'); b.rect(20, 1, 3, 6, '#3a3a5a'); b.px(21, 0, '#e8e8f0'); break;
      case 'lamp': P(8, 22); b.rect(3, 6, 2, 16, '#3a3040'); b.rect(0, 0, 8, 7, '#ffd86a'); b.rect(1, 1, 6, 5, '#fff4c8'); b.hline(0, 7, 0, '#3a3040'); break;
      case 'gears': P(24, 20); b.ellipse(8, 10, 7, 7, '#7a7a88'); b.ellipse(8, 10, 3, 3, '#3a3a48'); b.ellipse(18, 14, 5, 5, '#9a9aa8'); b.ellipse(18, 14, 2, 2, '#3a3a48'); for (let a = 0; a < 8; a++) b.rect(Math.round(8 + Math.cos(a * 0.785) * 8) - 1, Math.round(10 + Math.sin(a * 0.785) * 8) - 1, 2, 2, '#7a7a88'); break;
      case 'telescope': P(20, 28); b.line(4, 26, 10, 14, '#6a4424'); b.line(16, 26, 10, 14, '#6a4424'); b.line(10, 26, 10, 14, '#6a4424'); b.line(4, 16, 18, 4, '#c8a040'); b.line(4, 17, 18, 5, '#e8c048'); b.rect(16, 2, 4, 5, '#c8a040'); break;
      case 'bed2': P(22, 28); b.rect(0, 0, 22, 28, '#6a4424'); b.rect(1, 1, 20, 26, '#e8e0cc'); b.rect(3, 2, 16, 6, '#ffffff'); b.rect(1, 10, 20, 17, v || '#d86a8a'); b.hline(1, 20, 10, '#ffffff'); break;
      case 'fireplace': P(32, 32); b.rect(0, 4, 32, 28, '#8a5a4a'); b.rect(0, 4, 32, 4, '#a8786a'); b.rect(6, 12, 20, 20, '#1a1020'); b.rect(9, 22, 14, 10, '#ff7a2a'); b.rect(12, 20, 8, 12, '#ffd84a'); b.rect(8, 28, 16, 4, '#4a2a18'); break;
      case 'crystalball': P(14, 18); b.rect(3, 12, 8, 6, '#5a3a6a'); b.ellipse(7, 7, 6, 6, '#b8a8ff'); b.ellipse(5, 5, 2, 2, '#ffffff'); break;
      case 'mirror': P(16, 28); b.ellipse(8, 12, 7, 11, '#e8c048'); b.ellipse(8, 12, 5.5, 9.5, '#c8d8f0'); b.line(5, 7, 7, 4, '#ffffff'); b.rect(6, 22, 4, 6, '#c8a040'); break;
      case 'harp': P(14, 26); b.line(2, 24, 12, 2, '#e8c048'); b.vline(12, 2, 24, '#e8c048'); b.hline(2, 12, 24, '#e8c048'); for (let x = 5; x < 12; x += 2) b.vline(x, 24 - (x - 2) * 2, 24, '#f4f0e0'); break;
      case 'capsule': P(20, 32); b.ellipse(10, 16, 9, 15, '#8a98b0'); b.ellipse(10, 15, 7, 12, v === 'open' ? '#1a2030' : '#6ad8ff'); if (v !== 'open') b.ellipse(10, 12, 3, 4, '#bfeaff'); b.rect(3, 28, 14, 4, '#4a5468'); break;
      case 'wardrobe': P(24, 36); b.rect(0, 0, 24, 36, '#6a4424'); b.rect(1, 1, 22, 34, '#8a5a32'); b.vline(12, 2, 33, '#4a2a18'); b.rect(9, 16, 2, 4, '#e8c048'); b.rect(13, 16, 2, 4, '#e8c048'); b.hline(1, 22, 27, '#6a4424'); if (v === 'open') { b.rect(1, 1, 22, 26, '#2a1a10'); b.rect(3, 20, 18, 6, '#e8e0cc'); } break;
      case 'dummy': P(16, 22); b.vline(8, 8, 21, '#6a4424'); b.hline(1, 14, 10, '#6a4424'); b.ellipse(8, 13, 5, 6, '#c8a060'); b.ellipse(8, 5, 4, 4, '#e8d8b0'); break;
      case 'console': P(32, 22); b.rect(0, 6, 32, 16, '#4a5468'); b.rect(2, 0, 28, 10, '#2a3448'); b.rect(4, 2, 24, 6, '#4ad8ff'); for (let x = 5; x < 28; x += 4) b.px(x, 14, ['#ff5a5a', '#5aff8a', '#ffd84a'][x % 3]); break;
      default: P(12, 12); b.rect(0, 0, 12, 12, '#8a8098'); break;
    }
    DC[key] = X.outline(b.put(), OUT);
    return DC[key];
  }
  /** 가구 존재: 그림 + (막는다면) 발자리 */
  class Decor extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'decor', solid: true, bw: 12, bh: 8, shadow: false }, o)); this.img = decor(o.decor, o.v); if (o.bw == null) { this.bw = Math.max(8, this.img.width - 4); this.bh = Math.min(12, Math.max(6, this.img.height * 0.35)); } }
    blockBox() { return this.solid ? { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh } : null; }
    update(dt) { this.t += dt; if (this.decor === 'fireplace' || this.decor === 'stove') { if (Math.random() < dt * 8) G.fx.part({ x: this.x + (Math.random() - 0.5) * 8, y: this.y, z: 8, vz: 18, g: 0, life: 0.4, col: Math.random() < 0.5 ? '#ffb040' : '#ffe080', size: 1, glow: true }); } }
    draw(g, cx, cy) { g.drawImage(this.img, Math.round(this.x - cx - this.img.width / 2), Math.round(this.y - cy - this.img.height + 1 + (this.wall ? -18 : 0))); }
    // 조사할 수 있는 가구
    canUse() { return !!this.text; }
    get label() { return this.verb || '살펴본다'; }
    use() { const t = this.text; G.script.run(async (c) => { if (typeof t === 'function') await t(c, this); else await c.say(null, t, { style: 'sys' }); }); }
  }

  /* ───────── 실내 지도 ───────── */
  /** 방 하나: w×h칸, 위 두 줄은 벽, 아래 가운데가 문. spec.furn: [[kind, tx, ty, opt]] */
  function room(spec) {
    const w = spec.w || 12, h = spec.h || 9;
    const m = new G.GameMap({ id: spec.id, name: spec.name || '', w, h, region: TL.REGIONS.indexOf(spec.region || 'green'), music: spec.music || 'calm', edge: T.VOID, indoor: true });
    m.palName = spec.region || 'green';
    const floor = spec.floor != null ? spec.floor : T.WOOD;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = m.i(x, y);
      if (y < 2 || x === 0 || x === w - 1 || y === h - 1) { m.ter[i] = T.WALL; continue; }
      m.ter[i] = floor;
    }
    if (spec.rug) { const [rx, ry, rw, rh] = spec.rug; for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) m.ter[m.i(x, y)] = T.RUG; }
    // 문 (아래 가운데)
    const dx = spec.doorX != null ? spec.doorX : Math.floor(w / 2);
    m.ter[m.i(dx, h - 1)] = floor;
    m.exit = { x: dx, y: h - 1 };
    if (spec.back) m.warps.push({ x: dx, y: h - 1, w: 1, h: 1, to: spec.back[0], tx: spec.back[1], ty: spec.back[2], dir: 'down', exit: true });
    m.entry = { x: dx * TS + 8, y: (h - 2) * TS + 12 };
    m.dark = spec.dark || 0;
    m.lights = [];
    m.spawnList = [];
    for (const f of spec.furn || []) m.spawnList.push({ decor: f[0], tx: f[1], ty: f[2], o: f[3] || {} });
    m.ents0 = spec.ents || null;
    return m;
  }

  /* ───────── 지도 등록부 ───────── */
  const MAPS = {};
  const built = {};
  /** 지도 정의: build()는 GameMap을 돌려준다. ents(m)는 들어설 때마다 존재를 만든다 */
  function def(id, o) { MAPS[id] = Object.assign({ id }, o); }
  function get(id) {
    if (built[id]) return built[id];
    let D = MAPS[id];
    // 실내 지도는 넓은 지도를 지을 때 함께 등록된다
    if (!D && MAPS.world && !built.world) { get('world'); D = MAPS[id]; }
    if (!D) throw new Error('없는 지도: ' + id);
    const m = D.build();
    m.id = id; m.def = D;
    if (D.keep !== false) built[id] = m;
    return m;
  }
  /** 지도에 들어설 때: 건물 · 가구 · 사람 · 적 · 소품을 만든다 */
  function populate(m) {
    const W = G.world, D = m.def || {};
    for (const b of m.buildings || []) W.add(new Building(b));
    for (const f of m.spawnList || []) { const d = new Decor(Object.assign({ decor: f.decor, v: f.o.v, x: f.tx * TS + 8 + (f.o.dx || 0), y: f.ty * TS + 15 + (f.o.dy || 0), solid: f.o.solid !== false, text: f.o.text, verb: f.o.verb, wall: f.o.wall }, f.o.bw != null ? { bw: f.o.bw, bh: f.o.bh } : {})); if (f.o.wall) { d.solid = false; d.sortBias = -40; } W.add(d); }
    if (D.ents) D.ents(m, W);
    if (G.story && G.story.onPopulate) G.story.onPopulate(m, W);
  }
  function forget(id) { delete built[id]; }

  G.build = { STYLE, building, SPECIAL, Building, placeBuilding, decor, Decor, room, def, get, populate, forget, MAPS, built, poly, ramp: R, OUT };
})();
