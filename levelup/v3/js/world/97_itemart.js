/* 잡다한 아이템의 도트 그림 (32×32) — 가방 · 가게 · 얻었을 때 · 땅에 떨어졌을 때
   예전: 열쇠 · 이야기 물건 · 재료 · 편지 · 물약 · 음식 89가지가 모두 같은 상자 그림(물약 · 음식은 하트나 빛)이었고,
   기술서 60권 · 비기 두루마리 30개는 저마다 한 그림을 나눠 썼다.
   · 물약은 병 모양과 빛깔, 음식은 그릇 · 빵, 재료는 그 생김새(젤리 · 송곳니 · 광석 …), 편지는 보낸 사람의 봉랍 빛깔
   · 기술서: 표지 빛깔 · 무늬 = 무기(검 붉은 칼 · 활 초록 활 · 마법 보라 별), 모서리 보석 = 등급
   · 비기 두루마리: 끈 빛깔 · 무늬 = 무기, 봉인 = 등급
   · 등급 3부터 뒤에 은은한 빛 (장비 그림과 같은 규칙) */
(function () {
  'use strict';
  const G = globalThis.G;
  const X = G.gfx, U = G.u, D = G.data;
  const OUT = '#0b0914';
  const sh = (c, f) => U.shade(c, f);
  const lt = (c, t) => U.mix(c, '#ffffff', t);
  const GLOW = [null, null, '#7ee08a', '#8ad0ff', '#d8a8ff', '#fff0a8'];
  const GEM = [null, '#dcdce8', '#7ee08a', '#6ab8ff', '#c48aff', '#ffc84a'];
  const WCOL = { sword: '#c8423a', bow: '#3a9a4a', magic: '#7a4ac8' };

  /* ───────── 그리는 손 ───────── */
  function make(draw, gr) {
    const b = X.brush(32, 32);
    draw(b);
    const src = b.put();
    const c = X.canvas(32, 32), g = c.getContext('2d');
    if (gr >= 3) { g.globalAlpha = gr >= 5 ? 0.28 : 0.18; g.fillStyle = GLOW[gr]; for (let r = 13; r >= 6; r -= 3) { g.beginPath(); g.arc(16, 16, r, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; }
    const sil = X.silhouette(src, OUT);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(sil, dx, dy);
    g.drawImage(src, 0, 0);
    return c;
  }
  /** 둥근 덩어리 (빛 받는 쪽 왼쪽 위) */
  function ball(b, cx, cy, rx, ry, col, o) {
    o = o || {};
    b.ellipse(cx, cy, rx, ry, sh(col, 0.62));
    b.ellipse(cx - rx * 0.1, cy - ry * 0.12, rx * 0.86, ry * 0.84, col);
    if (o.hi !== false) { b.ellipse(cx - rx * 0.36, cy - ry * 0.4, Math.max(1, rx * 0.3), Math.max(1, ry * 0.25), lt(col, 0.45)); b.px(cx - rx * 0.46, cy - ry * 0.52, lt(col, 0.85)); }
  }
  /** 반짝임 (+ 모양) */
  function spark(b, x, y, col, big) {
    b.px(x, y, col || '#ffffff');
    b.px(x - 1, y, col || '#ffffff', 0.7); b.px(x + 1, y, col || '#ffffff', 0.7); b.px(x, y - 1, col || '#ffffff', 0.7); b.px(x, y + 1, col || '#ffffff', 0.7);
    if (big) { b.px(x - 2, y, col || '#ffffff', 0.35); b.px(x + 2, y, col || '#ffffff', 0.35); b.px(x, y - 2, col || '#ffffff', 0.35); b.px(x, y + 2, col || '#ffffff', 0.35); }
  }
  function poly(b, pts, col) {   // 볼록 다각형 채우기 (점은 시계 방향이든 아니든)
    let y0 = 99, y1 = -1; for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      let xa = 99, xb = -99;
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((y + 0.5 >= Math.min(ay, by)) && (y + 0.5 <= Math.max(ay, by)) && ay !== by) { const x = ax + (y + 0.5 - ay) * (bx - ax) / (by - ay); xa = Math.min(xa, x); xb = Math.max(xb, x); }
      }
      if (xb >= xa) for (let x = Math.round(xa); x <= Math.round(xb); x++) b.px(x, y, col);
    }
  }
  function thick(b, x0, y0, x1, y1, col, w) { for (let k = 0; k < (w || 2); k++) { b.line(x0 + k, y0, x1 + k, y1, col); } }

  /* ── 병 (물약) ── */
  function bottle(b, liq, o) {
    o = o || {};
    const gD = '#6a8a9a', glass = '#e4f2f8', cork = o.cork || '#a8784a';
    if (o.tall) {   // 길쭉한 영약 병
      b.rect(13, 3, 6, 3, cork); b.hline(13, 18, 3, lt(cork, 0.35));
      b.rect(14, 6, 4, 4, gD); b.rect(15, 6, 2, 4, glass);
      poly(b, [[9, 12], [22, 12], [24, 27], [7, 27]], gD); poly(b, [[10, 13], [21, 13], [23, 26], [8, 26]], glass);
      for (let y = 16; y <= 26; y++) for (let x = 7; x <= 24; x++) if (b.get(x, y) && b.get(x, y - 1)) b.px(x, y, y === 16 ? lt(liq, 0.35) : y > 23 ? sh(liq, 0.7) : liq);
      b.vline(11, 14, 23, '#ffffff'); b.hline(9, 22, 12, gD);
    } else {
      b.rect(13, 3, 6, 4, cork); b.hline(13, 18, 3, lt(cork, 0.35)); b.px(18, 6, sh(cork, 0.6));
      b.rect(14, 7, 4, 4, gD); b.rect(15, 7, 2, 4, glass);
      b.ellipse(16, 19, 9.5, 9, gD); b.ellipse(16, 19, 8.5, 8, glass);
      for (let y = 14; y <= 27; y++) for (let x = 7; x <= 25; x++) { const dx = (x + 0.5 - 16) / 8.5, dy = (y + 0.5 - 19) / 8; if (dx * dx + dy * dy <= 1 && y >= 15) b.px(x, y, y === 15 ? lt(liq, 0.35) : y > 23 ? sh(liq, 0.72) : liq); }
      b.vline(10, 16, 21, '#ffffff'); b.px(11, 14, '#ffffff'); b.px(11, 22, lt(liq, 0.6));
    }
    if (o.bubbles) { b.px(18, 20, lt(liq, 0.7)); b.px(20, 18, lt(liq, 0.6)); b.px(17, 23, lt(liq, 0.5)); }
  }
  /* ── 열쇠 (비스듬히: 손잡이 왼쪽 위 → 이 오른쪽 아래) ── */
  function key(b, col, o) {
    o = o || {};
    const d = sh(col, 0.62), hl = lt(col, 0.5);
    const big = o.big ? 1 : 0;
    // 몸통
    for (let k = 0; k < 15 + big * 2; k++) { const x = 11 + k, y = 11 + k; b.px(x, y, col); b.px(x + 1, y, col); b.px(x, y + 1, d); if (big) { b.px(x + 2, y, col); b.px(x + 1, y + 1, d); } b.px(x, y - 1 + 0, k % 3 ? hl : col); }
    // 이빨
    const tx = 21 + big, ty = 21 + big;
    b.rect(tx - 4, ty + 2, 3, 3 + big, col); b.px(tx - 4, ty + 4 + big, d);
    b.rect(tx, ty + 6, 3, 3 + big, col); b.px(tx, ty + 8 + big, d);
    // 손잡이
    if (o.bow === 'moon') {
      b.ellipse(9, 9, 6.5, 6.5, col); b.ellipse(11.5, 7, 5, 5, null); for (let y = 2; y <= 13; y++) for (let x = 5; x <= 16; x++) { const dx = (x + 0.5 - 11.5) / 5, dy = (y + 0.5 - 7) / 5; if (dx * dx + dy * dy <= 1) { const i = (y * 32 + x) * 4; b.d[i + 3] = 0; } }
      b.px(5, 9, hl); b.px(6, 12, hl); spark(b, 13, 5, '#fff8c0');
    } else if (o.bow === 'square') {
      b.rect(3, 3, 11, 11, col); b.rect(5, 5, 7, 7, sh(col, 0.4)); b.rect(6, 6, 5, 5, o.inner || '#ff6a8a'); b.px(7, 7, '#ffffff'); b.hline(3, 13, 3, hl); b.vline(3, 3, 13, hl);
    } else {
      b.ellipse(8, 8, 6 + big, 6 + big, col); b.ellipse(8, 8, 2.6 + big * 0.6, 2.6 + big * 0.6, null);
      for (let y = 1; y <= 15; y++) for (let x = 1; x <= 15; x++) { const dx = (x + 0.5 - 8) / (2.6 + big * 0.6), dy = (y + 0.5 - 8) / (2.6 + big * 0.6); if (dx * dx + dy * dy <= 1) { const i = (y * 32 + x) * 4; b.d[i + 3] = 0; } }
      b.px(4, 6, hl); b.px(5, 4, hl); b.px(6, 3, hl); b.px(11, 12, d); b.px(12, 11, d);
      if (o.gem) { b.ellipse(8, 2.5 + 0, 2, 2, o.gem); b.px(7, 2, '#ffffff'); }
    }
    if (o.tag) { b.line(15, 16, 9, 22, '#c8b890'); b.rect(4, 21, 7, 5, o.tag); b.hline(4, 10, 21, lt(o.tag, 0.4)); b.px(5, 23, sh(o.tag, 0.5)); }
  }
  /* ── 편지 봉투 ── */
  function envelope(b, seal, o) {
    o = o || {};
    const paper = o.paper || '#f0e4c8', pd = sh(paper, 0.78);
    b.rect(3, 9, 26, 17, paper); b.hline(3, 28, 25, pd); b.vline(28, 9, 25, pd);
    for (let k = 0; k <= 9; k++) { b.px(3 + k, 9 + k, pd); b.px(28 - k, 9 + k, pd); }   // 덮개 접힌 금
    for (let k = 0; k <= 8; k++) { b.hline(4 + k, 27 - k, 9 + k, k ? lt(paper, 0.25) : paper); }
    for (let k = 0; k <= 9; k++) { b.px(3 + k, 9 + k, pd); b.px(28 - k, 9 + k, pd); }
    // 봉랍
    b.ellipse(16, 18.5, 4, 4, sh(seal, 0.65)); b.ellipse(15.6, 18, 3.3, 3.3, seal); b.px(14, 16, lt(seal, 0.6));
    if (o.mark) o.mark(b, 16, 18, lt(seal, 0.55));
    if (o.ribbon) { b.vline(8, 9, 25, o.ribbon); b.vline(9, 9, 25, sh(o.ribbon, 0.7)); }
  }
  /* ── 책 ── */
  function book(b, cover, o) {
    o = o || {};
    const dk = sh(cover, 0.6), hl = lt(cover, 0.3), pages = '#f4ead0';
    b.rect(6, 4, 20, 24, dk);                   // 등 · 그림자
    b.rect(8, 26, 18, 2, pages); b.hline(8, 25, 27, '#c8b890');   // 책장
    b.rect(7, 3, 19, 23, cover);
    b.vline(7, 3, 25, sh(cover, 0.75)); b.vline(8, 3, 25, hl); b.vline(10, 3, 25, sh(cover, 0.8));
    b.hline(7, 25, 3, hl);
    if (o.trim) { b.hline(11, 24, 5, o.trim); b.hline(11, 24, 23, o.trim); b.vline(24, 5, 23, o.trim); b.vline(11, 5, 23, o.trim); }
    if (o.emblem) o.emblem(b, 18, 14);
    if (o.gem) { b.ellipse(23, 6, 1.6, 1.6, o.gem); b.px(22, 5, '#ffffff'); b.ellipse(23, 21, 1.6, 1.6, o.gem); }
    if (o.ribbon) { b.vline(20, 26, 30, o.ribbon); b.vline(21, 26, 29, sh(o.ribbon, 0.7)); }
  }
  /* ── 두루마리 ── */
  function scroll(b, ribbon, seal, emblem) {
    const p = '#f0e2bc', pd = '#c8b088', pdd = '#9a8460';
    b.rect(6, 8, 20, 16, p); b.hline(6, 25, 23, pd); b.vline(25, 8, 23, pd);
    for (let y = 11; y <= 20; y += 3) b.hline(9, 22, y, '#d8c8a0');
    // 위 · 아래 말린 막대
    for (const y of [6, 24]) { b.rect(4, y, 24, 3, pd); b.hline(4, 27, y, p); b.hline(4, 27, y + 2, pdd); b.rect(2, y, 2, 3, '#7a5030'); b.rect(28, y, 2, 3, '#7a5030'); b.px(2, y, '#a87850'); b.px(28, y, '#a87850'); }
    // 끈 · 봉인
    b.vline(20, 8, 23, ribbon); b.vline(21, 8, 23, sh(ribbon, 0.7));
    b.ellipse(20.5, 16, 3.6, 3.6, sh(seal, 0.62)); b.ellipse(20.1, 15.6, 2.9, 2.9, seal); b.px(19, 14, '#ffffff');
    if (emblem) emblem(b, 12, 15);
  }
  /* ── 무기 무늬 (작게) ── */
  const EMB = {
    sword(b, x, y, c) { b.line(x - 4, y + 5, x + 4, y - 4, c || '#e8ecf4'); b.line(x - 3, y + 5, x + 4, y - 3, c || '#e8ecf4'); b.line(x - 5, y + 2, x - 1, y + 6, '#e8c860'); b.px(x - 5, y + 6, '#6a4424'); b.px(x - 6, y + 7, '#6a4424'); },
    bow(b, x, y, c) { for (let k = -6; k <= 6; k++) { const xx = x - 2 + Math.round(3 * (1 - (k * k) / 36)); b.px(xx, y + k, '#c8904a'); } b.vline(x - 3, y - 6, y + 6, c || '#f4ead0'); b.hline(x - 4, x + 4, y, '#e8e0cc'); b.px(x + 5, y, '#ffffff'); b.px(x + 4, y - 1, '#ffffff'); b.px(x + 4, y + 1, '#ffffff'); },
    magic(b, x, y, c) { const col = c || '#fff0a8'; b.vline(x, y - 5, y + 5, col); b.hline(x - 5, x + 5, y, col); b.px(x - 1, y - 1, col); b.px(x + 1, y - 1, col); b.px(x - 1, y + 1, col); b.px(x + 1, y + 1, col); b.px(x - 2, y - 2, col, 0.6); b.px(x + 2, y + 2, col, 0.6); b.px(x + 2, y - 2, col, 0.6); b.px(x - 2, y + 2, col, 0.6); b.px(x, y, '#ffffff'); },
  };
  /* ── 그릇 ── */
  function bowl(b, col, soup, o) {
    o = o || {};
    b.ellipse(16, 17, 13, 5, sh(col, 0.55));
    b.ellipse(16, 16.5, 12, 4, soup);
    poly(b, [[3, 17], [29, 17], [25, 26], [7, 26]], col);
    b.hline(4, 28, 17, lt(col, 0.35)); b.hline(8, 24, 26, sh(col, 0.6)); b.hline(10, 22, 27, sh(col, 0.45));
    b.px(6, 19, lt(col, 0.6)); b.px(7, 21, lt(col, 0.45));
    if (o.band) { b.hline(6, 26, 21, o.band); b.hline(7, 25, 22, sh(o.band, 0.75)); }
    if (o.steam) for (const sx of [11, 16, 21]) { b.px(sx, 9, '#ffffff', 0.5); b.px(sx + 1, 8, '#ffffff', 0.5); b.px(sx, 7, '#ffffff', 0.4); b.px(sx - 1, 6, '#ffffff', 0.3); }
  }
  /* ── 톱니 ── */
  function gear(b, cx, cy, r, col, teeth) {
    const n = teeth || 8;
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; const tx = cx + Math.cos(a) * (r + 1.6), ty = cy + Math.sin(a) * (r + 1.6); b.rect(Math.round(tx - 1.5), Math.round(ty - 1.5), 3, 3, sh(col, 0.85)); }
    ball(b, cx, cy, r, r, col, { hi: false });
    b.ellipse(cx, cy, r * 0.42, r * 0.42, sh(col, 0.45)); b.ellipse(cx, cy, r * 0.2, r * 0.2, null);
    for (let y = Math.floor(cy - r * 0.3); y <= cy + r * 0.3; y++) for (let x = Math.floor(cx - r * 0.3); x <= cx + r * 0.3; x++) { const dx = (x + 0.5 - cx) / (r * 0.22), dy = (y + 0.5 - cy) / (r * 0.22); if (dx * dx + dy * dy <= 1) { const i = (y * 32 + x) * 4; b.d[i + 3] = 0; } }
    b.px(cx - r * 0.6, cy - r * 0.5, lt(col, 0.5));
  }
  /* ── 결정 (위로 솟은 수정) ── */
  function crystal(b, cx, base, h, w, col) {
    poly(b, [[cx - w, base], [cx - w, base - h + w], [cx, base - h], [cx + w, base - h + w], [cx + w, base]], sh(col, 0.7));
    poly(b, [[cx - w + 1, base - 1], [cx - w + 1, base - h + w], [cx, base - h + 1], [cx, base - 1]], col);
    poly(b, [[cx, base - 1], [cx, base - h + 1], [cx + w - 1, base - h + w], [cx + w - 1, base - 1]], sh(col, 0.85));
    b.vline(cx - w + 2, base - h + w + 1, base - 3, lt(col, 0.6));
  }

  /* ───────── 아이템마다 ───────── */
  const A = {
    /* 물약 · 음식 */
    potion_r: (b) => bottle(b, '#e8364a', { bubbles: true }),
    potion_b: (b) => bottle(b, '#3a7aff', { bubbles: true, cork: '#8a6a9a' }),
    potion_g: (b) => { bottle(b, '#3ac85a', { tall: true, cork: '#6a8a3a' }); spark(b, 25, 8, '#e8ffd0', true); b.px(19, 20, '#e8ffd0'); },
    potion_max: (b) => { bottle(b, '#ffc83a', { tall: true, cork: '#e8a820' }); b.px(13, 2, '#ffe890'); b.px(16, 1, '#ffe890'); b.px(18, 2, '#ffe890'); spark(b, 26, 9, '#fff8c0', true); spark(b, 6, 14, '#fff8c0'); },
    potion_forget: (b) => {   // 망각의 차: 찻잔 + 김
      b.ellipse(14, 26, 11, 2.5, '#c8c0d8'); b.ellipse(14, 25.6, 9, 1.6, '#e8e4f0');
      poly(b, [[5, 15], [23, 15], [21, 25], [7, 25]], '#e8e4f4'); b.hline(5, 23, 15, '#ffffff'); b.hline(7, 21, 25, '#a8a0c0');
      b.ellipse(14, 15.5, 8.5, 1.8, '#9a7ab8'); b.hline(9, 18, 15, '#c8a8e0');
      b.ellipse(25, 19, 3.5, 3.5, '#d8d0e8'); b.ellipse(25, 19, 1.6, 1.6, null); for (let y = 17; y <= 21; y++) for (let x = 23; x <= 27; x++) { const dx = (x + 0.5 - 25) / 1.7, dy = (y + 0.5 - 19) / 1.7; if (dx * dx + dy * dy <= 1) b.d[(y * 32 + x) * 4 + 3] = 0; }
      b.hline(8, 20, 19, '#c8a8e0'); b.px(10, 21, '#c8a8e0'); b.px(17, 21, '#c8a8e0');
      for (const [x, y, a] of [[11, 12, 0.6], [12, 10, 0.5], [11, 8, 0.4], [16, 11, 0.6], [17, 9, 0.5], [16, 7, 0.4], [17, 5, 0.25]]) b.px(x, y, '#e8e0ff', a);
    },
    fairy: (b) => {   // 병 속 요정
      b.rect(13, 3, 6, 4, '#a8784a'); b.hline(13, 18, 3, '#c8a070');
      b.rect(14, 7, 4, 4, '#6a8a9a'); b.rect(15, 7, 2, 4, '#e4f2f8');
      b.ellipse(16, 19, 9.5, 9, '#6a8a9a'); b.ellipse(16, 19, 8.5, 8, '#d8ecf4');
      b.ellipse(16, 19, 6, 6, '#fff0f8', 0.6); b.ellipse(16, 19, 3.5, 3.5, '#ffd8f0', 0.9);
      b.ellipse(12.5, 17, 2.5, 3.5, '#e0f4ff', 0.85); b.ellipse(19.5, 17, 2.5, 3.5, '#e0f4ff', 0.85);
      b.ellipse(16, 18, 1.6, 1.6, '#ffe8c0'); b.rect(15, 20, 2, 3, '#ff9ad0'); b.px(16, 18, '#ffffff');
      b.vline(10, 16, 21, '#ffffff'); spark(b, 22, 13, '#fff8c0'); b.px(11, 24, '#fff8c0');
    },
    food_corn: (b) => {   // 옥수수빵
      b.ellipse(16, 22, 13, 6, '#a8702a');
      b.rect(4, 13, 24, 10, '#e8b84a'); b.ellipse(16, 13, 12, 5, '#f4cc5a'); b.ellipse(15, 12, 9, 3, '#ffe08a');
      b.hline(5, 27, 22, '#c8902a'); b.hline(6, 26, 23, '#a8702a');
      for (const [x, y] of [[9, 15], [13, 17], [17, 15], [21, 17], [11, 19], [19, 19], [24, 15], [7, 18]]) { b.px(x, y, '#fff0a0'); b.px(x + 1, y, '#e8a830'); }
      b.line(6, 10, 9, 8, '#7ab84a'); b.line(9, 8, 12, 9, '#9ad86a');
    },
    food_tteok: (b) => {   // 화산 떡볶이
      bowl(b, '#3a2a30', '#d83a2a', { steam: true });
      for (const [x, y, l] of [[8, 14, 6], [15, 15, 5], [11, 17, 6], [19, 16, 6]]) { b.rect(x, y - 1, l, 2, '#fff0e0'); b.hline(x, x + l - 1, y, '#f0c8b8'); b.px(x + l - 1, y - 1, '#ffd8c8'); }
      b.px(13, 13, '#ff8a4a'); b.px(22, 14, '#ff8a4a'); b.px(9, 16, '#ff6a3a'); b.px(18, 18, '#3a8a3a'); b.px(19, 18, '#5aaa4a');
    },
    food_udon: (b) => {   // 파도 우동
      bowl(b, '#f4f0e8', '#d8b878', { band: '#3a7ab8', steam: true });
      for (let k = 0; k < 4; k++) b.line(7 + k * 3, 15, 10 + k * 3, 18, '#fff4d8');
      b.ellipse(20, 15, 3, 2, '#ffffff'); b.px(20, 15, '#ff8aa8'); b.px(21, 14, '#ff8aa8'); b.px(19, 16, '#ff8aa8');
      b.px(11, 14, '#5aaa4a'); b.px(12, 13, '#7ac85a');
      b.line(22, 3, 27, 14, '#c8905a'); b.line(25, 3, 29, 13, '#a8703a');
    },
    food_bread: (b) => {   // 눈꽃 빵
      b.ellipse(16, 20, 12, 8, '#c8b8a8'); b.ellipse(16, 18.5, 11.5, 7.5, '#f4ece4'); b.ellipse(13, 15.5, 6, 3, '#ffffff');
      const c = '#9ac8f0'; b.vline(16, 14, 22, c); b.hline(12, 20, 18, c); b.line(13, 15, 19, 21, c); b.line(19, 15, 13, 21, c); b.px(16, 18, '#ffffff');
      spark(b, 26, 11, '#e0f4ff');
    },
    food_cotton: (b) => {   // 무지개 솜사탕
      b.line(16, 18, 20, 30, '#e8d8b8'); b.line(17, 18, 21, 30, '#c8b890');
      const C = ['#ff9ac8', '#ffd88a', '#a8f0a8', '#9ad8ff', '#c8a8ff'];
      const puffs = [[11, 11, 6, 0], [19, 9, 6, 1], [22, 15, 5, 2], [14, 17, 6, 3], [9, 16, 4, 4], [16, 12, 5, 0]];
      for (const [x, y, r, k] of puffs) b.ellipse(x, y, r, r * 0.9, C[k]);
      for (const [x, y, r, k] of puffs) b.ellipse(x - 1, y - 1, r * 0.5, r * 0.4, lt(C[k], 0.45));
      spark(b, 26, 6, '#ffffff');
    },

    /* 도구 · 열쇠 */
    flippers: (b) => {
      for (const [ox, oy] of [[0, 0], [9, 3]]) {
        poly(b, [[5 + ox, 4 + oy], [12 + ox, 4 + oy], [15 + ox, 24 + oy], [2 + ox, 24 + oy]], '#2a6ac8');
        poly(b, [[6 + ox, 5 + oy], [11 + ox, 5 + oy], [13 + ox, 22 + oy], [4 + ox, 22 + oy]], '#4a9aff');
        b.rect(5 + ox, 4 + oy, 7, 6, '#1a3a78'); b.ellipse(8.5 + ox, 6 + oy, 2.5, 1.5, '#0b1a3a');
        for (const k of [0, 1, 2]) b.line(6 + ox + k * 3, 12 + oy, 5 + ox + k * 4, 22 + oy, '#8ac8ff');
      }
    },
    glove: (b) => {
      poly(b, [[8, 12], [24, 12], [26, 26], [6, 26]], '#a8582a');
      for (const [x, w] of [[8, 4], [12, 4], [16, 4], [20, 4]]) { b.rect(x, 5, w - 1, 8, '#c8703a'); b.hline(x, x + w - 2, 5, '#e89858'); b.px(x + w - 2, 12, '#8a4420'); }
      b.rect(3, 13, 6, 5, '#c8703a'); b.hline(3, 8, 13, '#e89858');
      b.rect(6, 22, 21, 5, '#e8b83a'); b.hline(6, 26, 22, '#fff0a0'); b.hline(6, 26, 26, '#a87a1a');
      b.ellipse(16, 18, 3, 3, '#ffd84a'); b.px(15, 17, '#ffffff'); b.hline(9, 23, 12, '#8a4420');
    },
    boots: (b) => {
      poly(b, [[8, 5], [17, 5], [17, 20], [26, 21], [26, 27], [7, 27]], '#3a8a5a');
      poly(b, [[9, 6], [16, 6], [16, 20], [24, 22], [24, 25], [9, 25]], '#5ab87a');
      b.rect(7, 25, 20, 3, '#2a4a3a'); b.hline(7, 26, 25, '#4a6a5a');
      b.rect(7, 5, 11, 3, '#e8e0c8'); b.hline(7, 17, 5, '#ffffff');
      for (let k = 0; k < 4; k++) { b.line(17, 9 + k * 2, 27 - k, 4 + k * 2, k % 2 ? '#e8f4ff' : '#ffffff'); }
      b.px(12, 14, '#8ae0a8'); b.px(12, 18, '#8ae0a8');
    },
    pickaxe: (b) => {
      thick(b, 7, 28, 19, 10, '#8a5a30', 2); b.line(7, 28, 19, 10, '#b8804a');
      poly(b, [[6, 6], [16, 4], [27, 10], [28, 14], [21, 10], [16, 9], [9, 10]], '#9aa0b0');
      b.line(7, 7, 16, 5, '#e8ecf4'); b.line(17, 5, 26, 10, '#d0d4e0'); b.px(28, 14, '#5a6070'); b.px(6, 9, '#5a6070');
      b.rect(16, 8, 4, 4, '#5a4a3a');
    },
    key_small: (b) => key(b, '#b8c0d0'),
    key_big: (b) => key(b, '#f0c040', { big: true, gem: '#ff4a5a' }),
    drawer_key: (b) => key(b, '#d8a858', { tag: '#c8584a' }),
    key_night: (b) => key(b, '#7a6ac8', { bow: 'moon' }),
    key_origin: (b) => key(b, '#c8d0e0', { bow: 'square', inner: '#ff6aa8' }),
    map_d: (b) => {
      b.rect(4, 6, 24, 20, '#e8d8b0'); b.hline(4, 27, 25, '#b8a078'); b.vline(27, 6, 25, '#b8a078');
      b.rect(3, 5, 3, 22, '#c8b088'); b.vline(3, 5, 26, '#a89068'); b.rect(26, 5, 3, 22, '#c8b088'); b.vline(28, 5, 26, '#a89068');
      const L = '#6a5a8a'; b.rect(8, 9, 6, 5, null); for (const [x, y, w, h] of [[8, 9, 6, 5], [17, 9, 6, 5], [8, 17, 6, 5], [17, 17, 6, 5]]) { b.hline(x, x + w, y, L); b.hline(x, x + w, y + h, L); b.vline(x, y, y + h, L); b.vline(x + w, y, y + h, L); }
      b.hline(14, 17, 11, L); b.vline(11, 14, 17, L); b.hline(14, 17, 19, L);
      b.line(18, 18, 22, 22, '#d83a3a'); b.line(22, 18, 18, 22, '#d83a3a');
    },
    compass: (b) => {
      ball(b, 16, 17, 11, 11, '#c8902a', { hi: false }); b.ellipse(16, 17, 8.5, 8.5, '#f4ecd8'); b.ellipse(16, 17, 8.5, 8.5, null);
      b.ellipse(16, 17, 8, 8, '#f8f0dc');
      b.rect(15, 4, 3, 3, '#c8902a'); b.px(16, 4, '#ffe08a');
      for (const [x, y] of [[16, 10], [16, 24], [9, 17], [23, 17]]) b.px(x, y, '#8a7a5a');
      poly(b, [[15, 17], [17, 17], [16, 10]], '#e83a3a'); poly(b, [[15, 17], [17, 17], [16, 24]], '#6a7080'); b.px(16, 17, '#2a2030');
      b.px(11, 12, '#ffffff'); b.px(12, 11, '#ffffff');
    },
    luce_compass: (b) => {
      b.line(16, 1, 13, 4, '#a8a8b8'); b.px(17, 2, '#a8a8b8');
      ball(b, 16, 18, 11, 11, '#a8783a', { hi: false }); b.ellipse(16, 18, 9, 9, '#5a3a1a'); b.ellipse(16, 18, 8, 8, '#f0e4c8');
      b.rect(14, 5, 5, 3, '#a8783a'); b.px(16, 5, '#e8c070');
      poly(b, [[15, 18], [17, 18], [19, 11]], '#d84a3a'); poly(b, [[15, 18], [17, 18], [13, 25]], '#4a5a7a'); b.px(16, 18, '#2a2030');
      b.px(10, 13, '#ffffff'); b.line(21, 24, 24, 21, '#8a6a3a'); b.px(9, 23, '#c8b088');
    },
    sun_eye: (b) => {
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; b.line(16 + Math.round(Math.cos(a) * 9), 16 + Math.round(Math.sin(a) * 9), 16 + Math.round(Math.cos(a) * 13), 16 + Math.round(Math.sin(a) * 13), k % 2 ? '#ffb83a' : '#ffe07a'); }
      ball(b, 16, 16, 9, 9, '#f0b830');
      b.ellipse(16, 16, 6.5, 3.6, '#fff8e0'); b.ellipse(16, 16, 3, 3, '#c8402a'); b.ellipse(16, 16, 1.5, 1.5, '#2a1010'); b.px(15, 15, '#ffffff');
    },
    ember: (b) => {   // 무지개 불씨
      const C = ['#ff4a5a', '#ff9a3a', '#ffe04a', '#6ae07a', '#5ab8ff', '#b87aff'];
      for (let k = 0; k < 6; k++) { const w = 9 - k * 1.2; poly(b, [[16 - w, 27 - k * 2], [16, 6 + k * 2.6], [16 + w, 27 - k * 2]], C[k]); }
      b.ellipse(16, 24, 7, 4, '#ff6a4a'); b.ellipse(16, 22, 3, 3, '#ffffff'); b.px(12, 9, '#ffe04a'); b.px(21, 12, '#9ad8ff'); spark(b, 24, 6, '#ffffff');
    },
    dew: (b) => {
      poly(b, [[3, 24], [12, 13], [24, 9], [29, 12], [20, 22], [8, 27]], '#3a8a3a'); b.line(5, 25, 26, 11, '#6ac85a');
      b.ellipse(17, 17, 5.5, 6, '#4ab8a8', 0.9); poly(b, [[13, 15], [17, 6], [21, 15]], '#4ab8a8'); b.ellipse(17, 17, 4.5, 5, '#8af0e0');
      b.px(15, 14, '#ffffff'); b.px(15, 15, '#ffffff'); b.px(16, 12, '#e0fff8'); spark(b, 25, 6, '#e8ffd0'); spark(b, 6, 9, '#e8ffd0');
    },
    feather_night: (b) => {
      b.line(6, 28, 24, 4, '#c8b8e0');
      for (let k = 0; k < 16; k++) { const x = 7 + k * 1.1, y = 26 - k * 1.45, w = Math.min(7, 2 + k * 0.6) * (k > 13 ? 0.5 : 1); b.line(Math.round(x), Math.round(y), Math.round(x - w), Math.round(y - w * 0.4), '#3a2a5a'); b.line(Math.round(x), Math.round(y), Math.round(x + w * 0.6), Math.round(y + w * 0.5), '#2a1a42'); }
      b.line(9, 23, 21, 7, '#6a4a9a'); spark(b, 22, 10, '#e8e0ff'); b.px(13, 18, '#8a6ac8');
    },
    pass_order: (b) => {
      b.rect(4, 7, 24, 18, '#f4f0e8'); b.hline(4, 27, 24, '#b8b0a0'); b.vline(27, 7, 24, '#b8b0a0');
      b.rect(4, 7, 24, 4, '#3a5aa8'); b.hline(4, 27, 7, '#6a8ae0');
      b.ellipse(10.5, 17.5, 4.5, 4.5, '#e8c048'); b.ellipse(10.5, 17.5, 3, 3, '#c89a28'); b.vline(10, 15, 20, '#fff0a0'); b.hline(8, 13, 17, '#fff0a0');
      for (const y of [15, 18, 21]) b.hline(17, 25, y, '#9a98a8');
      b.vline(26, 3, 7, '#c83a3a'); b.vline(24, 3, 7, '#c83a3a');
    },
    scarf_dawn: (b) => {
      poly(b, [[4, 8], [27, 8], [27, 14], [4, 14]], '#ff8a5a');
      poly(b, [[18, 12], [24, 12], [22, 27], [16, 27]], '#ff7a4a');
      for (let x = 5; x <= 26; x += 3) b.vline(x, 9, 13, '#ffb08a');
      for (let y = 14; y <= 25; y += 3) b.hline(18, 22, y, '#ffb08a');
      b.hline(4, 27, 8, '#ffc8a8'); b.hline(4, 27, 14, '#d8583a');
      for (let x = 16; x <= 22; x += 2) b.vline(x, 27, 29, '#ffd8c0');
      b.px(10, 11, '#ffe8a0'); b.px(11, 11, '#ffe8a0');
    },
    snowherb: (b) => {
      b.line(16, 28, 16, 14, '#4a8a5a'); b.line(16, 22, 10, 17, '#5aa86a'); b.line(16, 20, 22, 15, '#5aa86a');
      b.ellipse(9, 18, 3, 1.6, '#6ac87a'); b.ellipse(23, 16, 3, 1.6, '#6ac87a');
      for (const [x, y, r] of [[16, 9, 5], [9, 13, 3.5], [23, 11, 3.5]]) { for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; b.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, r * 0.5, '#f4f8ff'); } b.ellipse(x, y, r * 0.35, r * 0.35, '#9ad0ff'); }
      spark(b, 27, 4, '#e0f4ff');
    },
    crystal_snow: (b) => {
      const c = '#bfe8ff', d = '#6aa8e0';
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; const ex = 16 + Math.cos(a) * 12, ey = 16 + Math.sin(a) * 12; b.line(16, 16, Math.round(ex), Math.round(ey), c); const mx = 16 + Math.cos(a) * 7, my = 16 + Math.sin(a) * 7; for (const s of [-1, 1]) { const a2 = a + s * 0.9; b.line(Math.round(mx), Math.round(my), Math.round(mx + Math.cos(a2) * 4), Math.round(my + Math.sin(a2) * 4), d); } }
      b.ellipse(16, 16, 2.5, 2.5, '#ffffff'); spark(b, 25, 6, '#ffffff');
    },
    gear_rust: (b) => { gear(b, 16, 16, 9, '#b8683a', 9); b.px(10, 20, '#7a3a1a'); b.px(21, 11, '#d8884a'); b.px(19, 22, '#7a3a1a'); },
    reverser: (b) => {   // 설계도
      b.rect(3, 6, 24, 20, '#2a5aa8'); b.hline(3, 26, 6, '#4a7ad8'); b.hline(3, 26, 25, '#1a3a78');
      b.ellipse(27, 16, 2.5, 10, '#1a4a98'); b.vline(28, 6, 26, '#4a7ad8');
      const L = '#d8ecff'; b.ellipse(12, 15, 5, 5, L); b.ellipse(12, 15, 4, 4, '#2a5aa8'); b.ellipse(12, 15, 1.5, 1.5, L);
      b.hline(17, 24, 11, L); b.hline(17, 22, 14, L); b.hline(17, 24, 17, L); b.line(6, 22, 24, 22, L); b.px(6, 21, L); b.px(24, 21, L);
      b.line(18, 20, 22, 20, '#ffd84a');
    },
    silver_rec: (b) => {
      b.rect(6, 3, 20, 26, '#8a90a0'); b.rect(7, 4, 18, 24, '#c8ccd8'); b.hline(7, 24, 4, '#f4f6fc'); b.vline(7, 4, 27, '#e8ecf4'); b.hline(7, 24, 27, '#7a8090');
      for (const y of [12, 15, 18, 21, 24]) b.hline(10, 22, y, '#8a90a0');
      // 612
      const dg = '#4a5068';
      b.hline(10, 12, 6, dg); b.vline(10, 6, 10, dg); b.hline(10, 12, 8, dg); b.vline(12, 8, 10, dg); b.hline(10, 12, 10, dg);
      b.vline(15, 6, 10, dg); b.px(14, 7, dg);
      b.hline(18, 20, 6, dg); b.vline(20, 6, 8, dg); b.hline(18, 20, 8, dg); b.vline(18, 8, 10, dg); b.hline(18, 20, 10, dg);
    },
    ledger: (b) => book(b, '#4a3a3a', { trim: '#a8884a', ribbon: '#c83a3a', emblem: (bb, x, y) => { bb.vline(x, y - 5, y + 4, '#e8c860'); bb.hline(x - 5, x + 5, y - 4, '#e8c860'); bb.line(x - 5, y - 4, x - 7, y, '#e8c860'); bb.line(x - 5, y - 4, x - 3, y, '#e8c860'); bb.hline(x - 7, x - 3, y, '#e8c860'); bb.line(x + 5, y - 4, x + 3, y, '#e8c860'); bb.line(x + 5, y - 4, x + 7, y, '#e8c860'); bb.hline(x + 3, x + 7, y, '#e8c860'); bb.hline(x - 2, x + 2, y + 4, '#e8c860'); } }),
    ledger_graus: (b) => book(b, '#4a5468', { trim: '#c8ccd8', ribbon: '#c83a3a', emblem: (bb, x, y) => { poly(bb, [[x - 5, y - 6], [x + 5, y - 6], [x + 5, y], [x, y + 6], [x - 5, y]], '#c8ccd8'); poly(bb, [[x - 4, y - 5], [x + 4, y - 5], [x + 4, y], [x, y + 5], [x - 4, y]], '#3a5aa8'); bb.vline(x, y - 4, y + 3, '#e8c860'); bb.hline(x - 3, x + 3, y - 2, '#e8c860'); } }),
    fish_gold: (b) => {
      poly(b, [[3, 16], [10, 9], [21, 9], [26, 16], [21, 22], [10, 22]], '#d8a028');
      poly(b, [[4, 16], [10, 10], [20, 10], [24, 14], [5, 14]], '#ffd858');
      poly(b, [[25, 16], [30, 10], [29, 16], [30, 22]], '#c89020');
      for (let x = 11; x <= 20; x += 3) b.line(x, 10, x + 2, 13, '#e8b838');
      b.ellipse(8, 14, 1.6, 1.6, '#ffffff'); b.px(8, 14, '#2a1a10'); b.line(13, 12, 13, 19, '#b88018');
      spark(b, 22, 6, '#fff8c0', true); b.px(6, 19, '#fff0a0');
    },
    drawing: (b) => {   // 노아의 그림
      b.rect(3, 4, 26, 24, '#fbf6ea'); b.hline(3, 28, 27, '#d8d0c0'); b.vline(28, 4, 27, '#d8d0c0'); b.px(3, 4, '#d8d0c0');
      b.ellipse(23, 9, 3, 3, '#ffb83a'); for (const [x, y] of [[23, 4], [27, 9], [19, 9], [26, 6], [20, 6]]) b.px(x, y, '#ffb83a');
      poly(b, [[6, 18], [11, 13], [16, 18]], '#d84a3a'); b.rect(7, 18, 8, 6, '#c89a6a'); b.rect(10, 20, 2, 4, '#6a4a2a');
      for (const [x, c] of [[19, '#3a6ac8'], [24, '#e86a9a']]) { b.ellipse(x, 17, 1.6, 1.6, '#f0c8a0'); b.vline(x, 19, 22, c); b.line(x - 2, 20, x + 2, 20, c); b.line(x, 22, x - 1, 24, c); b.line(x, 22, x + 1, 24, c); }
      b.hline(4, 27, 25, '#6ac85a'); b.px(21, 20, '#d84a3a');
    },
    stella_core: (b) => {
      poly(b, [[16, 2], [26, 12], [22, 28], [10, 28], [6, 12]], '#3a5ab8'); poly(b, [[16, 3], [16, 27], [11, 27], [7, 12]], '#6a8ae8'); poly(b, [[16, 3], [25, 12], [16, 13]], '#8aa8ff');
      b.line(6, 12, 26, 12, '#bcd0ff');
      const s = '#fff8c0'; b.vline(16, 15, 23, s); b.hline(12, 20, 19, s); b.px(14, 17, s); b.px(18, 17, s); b.px(14, 21, s); b.px(18, 21, s); b.px(16, 19, '#ffffff');
      spark(b, 26, 5, '#ffffff');
    },
    scale_sala: (b) => {
      poly(b, [[16, 3], [27, 13], [24, 25], [16, 29], [8, 25], [5, 13]], '#c8401a'); poly(b, [[16, 5], [25, 13], [22, 23], [16, 26], [10, 23], [7, 13]], '#ff6a2a');
      b.ellipse(14, 12, 4, 3, '#ffb84a'); b.px(12, 10, '#fff0a0'); for (let k = 0; k < 3; k++) b.line(16, 8 + k * 5, 22 - k, 13 + k * 5, '#ff9a4a');
      spark(b, 26, 5, '#ffe080');
    },
    lamp_morgan: (b) => {
      b.ellipse(16, 5, 4, 3, null); b.line(12, 6, 14, 3, '#5a4a3a'); b.line(20, 6, 18, 3, '#5a4a3a'); b.hline(14, 18, 3, '#5a4a3a');
      b.rect(10, 7, 12, 3, '#6a5a48'); b.hline(10, 21, 7, '#8a7a60');
      b.rect(10, 10, 12, 13, '#3a4a4a'); b.rect(11, 11, 10, 11, '#c8b070'); b.ellipse(16, 18, 3, 4, '#ffd060'); b.ellipse(16, 19, 1.5, 2, '#fff4c0');
      b.vline(13, 10, 22, '#6a5a48'); b.vline(19, 10, 22, '#6a5a48');
      b.rect(9, 23, 14, 4, '#6a5a48'); b.hline(9, 22, 23, '#8a7a60'); b.px(11, 25, '#a8583a'); b.px(20, 24, '#a8583a'); b.px(9, 12, '#a8583a');
    },
    pickaxe_: null,

    /* 무한호 부품 */
    part_nozzle: (b) => {
      poly(b, [[11, 4], [21, 4], [26, 20], [6, 20]], '#8a90a0'); poly(b, [[12, 5], [16, 5], [13, 19], [8, 19]], '#c8ccd8');
      b.rect(10, 3, 12, 3, '#5a6070'); b.hline(10, 21, 3, '#9aa0b0');
      for (const [x, c] of [[8, '#ff8a3a'], [12, '#ffd84a'], [16, '#ffffff'], [20, '#ffd84a'], [24, '#ff8a3a']]) b.line(16, 20, x, 29, c);
      b.ellipse(16, 22, 6, 3, '#ffb84a');
    },
    part_fuel: (b) => {
      b.rect(9, 6, 14, 22, '#9aa0b0'); b.rect(10, 7, 3, 20, '#e8ecf4'); b.rect(20, 7, 2, 20, '#6a7080');
      b.ellipse(16, 6, 7, 2, '#c8ccd8'); b.rect(14, 2, 4, 4, '#5a6070'); b.hline(14, 17, 2, '#9aa0b0');
      b.rect(14, 12, 5, 12, '#2a3040'); b.rect(15, 16, 3, 7, '#e0e8f8'); b.px(15, 16, '#ffffff'); b.hline(15, 17, 16, '#ffffff');
      b.hline(9, 22, 27, '#5a6070'); spark(b, 26, 9, '#e0e8ff');
    },
    part_plating: (b) => {
      poly(b, [[5, 6], [27, 4], [28, 26], [4, 27]], '#c8901a'); poly(b, [[6, 7], [26, 5], [26, 24], [6, 25]], '#ffcc3a'); poly(b, [[6, 7], [26, 5], [26, 9], [6, 11]], '#ffe88a');
      for (const [x, y] of [[8, 9], [24, 7], [8, 23], [24, 22], [16, 8], [16, 23]]) { b.px(x, y, '#a87010'); b.px(x - 1, y - 1, '#fff4c0'); }
      b.line(9, 15, 23, 14, '#e8a820'); spark(b, 22, 15, '#ffffff');
    },
    part_sail: (b) => {
      b.vline(9, 2, 29, '#8a5a30'); b.vline(10, 2, 29, '#b8804a');
      poly(b, [[11, 4], [27, 15], [11, 26]], '#f4f8ff'); poly(b, [[11, 4], [27, 15], [11, 13]], '#ffffff'); b.line(11, 26, 27, 15, '#c8d8e8');
      b.ellipse(16, 16, 4, 3, '#d8ecff'); b.ellipse(19, 15, 3, 2.5, '#d8ecff'); b.ellipse(14, 18, 3, 2, '#e8f4ff');
      b.px(9, 1, '#ffd84a'); b.hline(5, 9, 28, '#6a4424');
    },
    part_shield: (b) => {
      ball(b, 16, 16, 13, 13, '#c8d0dc');
      for (let r = 4; r <= 12; r += 4) { for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; b.px(Math.round(16 + Math.cos(a) * r), Math.round(16 + Math.sin(a) * r), '#8a98ac'); } }
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; b.line(16, 16, Math.round(16 + Math.cos(a) * 12), Math.round(16 + Math.sin(a) * 12), '#9aa8bc'); }
      b.ellipse(16, 16, 3, 3, '#f4f8ff'); b.ellipse(11, 10, 3, 2, '#ffffff', 0.7);
    },
    part_compass: (b) => {
      ball(b, 16, 16, 12, 12, '#2a3a7a', { hi: false }); b.ellipse(16, 16, 10, 10, '#16204a');
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 - Math.PI / 2; poly(b, [[16 + Math.cos(a) * 9, 16 + Math.sin(a) * 9], [16 + Math.cos(a + 0.7) * 3, 16 + Math.sin(a + 0.7) * 3], [16, 16], [16 + Math.cos(a - 0.7) * 3, 16 + Math.sin(a - 0.7) * 3]], k === 0 ? '#ffd84a' : '#e8ecf8'); }
      b.px(16, 16, '#ffffff'); for (const [x, y] of [[9, 10], [23, 22], [22, 9], [10, 22]]) b.px(x, y, '#fff8c0');
      b.hline(13, 19, 3, '#c8a050'); b.rect(15, 2, 3, 2, '#c8a050');
    },

    /* 재료 */
    m_slime: (b) => { b.ellipse(16, 21, 12, 8, '#3a9a4a'); b.ellipse(16, 19, 11, 8, '#5ad86a'); b.ellipse(16, 13, 7, 5, '#5ad86a'); b.ellipse(12, 14, 3, 2.5, '#b8ffc0'); b.px(11, 13, '#ffffff'); b.px(20, 22, '#8af09a'); b.px(9, 21, '#8af09a'); b.ellipse(16, 27, 10, 1.5, '#2a7a3a'); },
    m_fang: (b) => { poly(b, [[8, 4], [20, 4], [24, 12], [18, 26], [14, 29], [15, 16], [10, 9]], '#e8e0c8'); poly(b, [[9, 5], [15, 5], [15, 14], [14, 26], [11, 10]], '#fff8e8'); b.line(17, 8, 18, 22, '#c8b898'); b.hline(8, 20, 4, '#c8a888'); b.px(15, 28, '#a89878'); },
    m_ore: (b) => {
      poly(b, [[4, 22], [8, 10], [16, 5], [25, 9], [28, 20], [22, 27], [9, 27]], '#5a5a68'); poly(b, [[6, 20], [9, 11], [16, 7], [23, 10], [14, 14], [9, 21]], '#7a7a8a');
      for (const [x, y] of [[12, 13], [19, 17], [15, 21], [22, 12], [10, 18]]) { b.rect(x, y, 2, 2, '#c8d8f0'); b.px(x, y, '#ffffff'); }
      b.line(16, 7, 14, 14, '#9a9aaa');
    },
    m_scale: (b) => {
      for (const [x, y, c] of [[11, 12, '#e8582a'], [20, 12, '#d8482a'], [15, 19, '#ff7a3a']]) { poly(b, [[x, y - 7], [x + 6, y - 1], [x + 4, y + 6], [x, y + 8], [x - 4, y + 6], [x - 6, y - 1]], sh(c, 0.7)); poly(b, [[x, y - 5], [x + 4, y - 1], [x + 3, y + 5], [x, y + 6], [x - 3, y + 5], [x - 4, y - 1]], c); b.px(x - 1, y - 3, '#ffd080'); }
    },
    m_pearl: (b) => {
      poly(b, [[4, 22], [16, 14], [28, 22], [24, 28], [8, 28]], '#e8b8a8'); for (let k = 0; k < 5; k++) b.line(16, 16, 7 + k * 4, 27, '#c89888');
      ball(b, 16, 15, 7, 7, '#f4f0f8'); b.px(13, 12, '#ffffff'); b.ellipse(18, 18, 2, 1.5, '#d8d0e8');
    },
    m_sand: (b) => {
      poly(b, [[8, 12], [24, 12], [27, 27], [5, 27]], '#a87a4a'); poly(b, [[9, 13], [16, 13], [14, 26], [7, 26]], '#c8985a');
      b.rect(11, 8, 10, 5, '#8a5a30'); b.hline(10, 22, 11, '#e8c048'); b.hline(11, 21, 12, '#c8a030');
      b.ellipse(16, 7, 6, 2.5, '#ffd858'); b.px(14, 6, '#fff0a8'); for (const [x, y] of [[25, 24], [27, 22], [6, 25], [28, 27]]) b.px(x, y, '#ffd858');
    },
    m_moon: (b) => {
      b.ellipse(15, 16, 11, 11, '#f0e090'); b.ellipse(20, 12, 9, 9, null);
      for (let y = 2; y <= 22; y++) for (let x = 10; x <= 30; x++) { const dx = (x + 0.5 - 20) / 9, dy = (y + 0.5 - 12) / 9; if (dx * dx + dy * dy <= 1) b.d[(y * 32 + x) * 4 + 3] = 0; }
      b.px(7, 13, '#fffbe0'); b.px(8, 18, '#fffbe0'); b.px(9, 22, '#d8c870'); spark(b, 24, 22, '#fff8c0', true);
    },
    m_cloud: (b) => { for (const [x, y, r] of [[10, 18, 6], [17, 14, 7], [23, 18, 6], [16, 21, 6]]) b.ellipse(x, y, r, r * 0.85, '#d8e4f4'); for (const [x, y, r] of [[10, 17, 5], [17, 13, 6], [23, 17, 5], [16, 20, 5]]) b.ellipse(x, y, r, r * 0.8, '#ffffff'); b.ellipse(14, 11, 3, 2, '#ffffff'); b.px(19, 21, '#ffd8ec'); b.px(12, 21, '#ffd8ec'); },
    m_ice: (b) => {
      poly(b, [[6, 12], [16, 6], [27, 11], [26, 23], [16, 28], [6, 23]], '#6aa8e0'); poly(b, [[7, 12], [16, 7], [26, 11], [16, 16]], '#c8ecff'); poly(b, [[7, 13], [16, 17], [16, 27], [7, 22]], '#9ad0f8');
      b.line(9, 13, 14, 10, '#ffffff'); b.px(21, 21, '#e0f4ff'); spark(b, 26, 5, '#ffffff');
    },
    m_gear: (b) => { gear(b, 13, 14, 7, '#a8603a', 8); gear(b, 23, 22, 4.5, '#8a5a3a', 6); },
    m_shadow: (b) => {
      b.rect(8, 6, 16, 3, '#5a3a2a'); b.rect(8, 23, 16, 3, '#5a3a2a'); b.hline(8, 23, 6, '#7a5a3a'); b.hline(8, 23, 23, '#7a5a3a');
      b.rect(10, 9, 12, 14, '#2a1a42'); for (let y = 10; y <= 22; y += 2) b.hline(10, 21, y, '#4a3a6a');
      b.line(22, 16, 28, 26, '#4a3a6a'); b.px(28, 27, '#8a6ac8'); b.px(13, 12, '#8a6ac8');
    },
    m_powder: (b) => {
      b.ellipse(16, 21, 10, 7, '#3a3a48'); b.ellipse(16, 19, 9, 6, '#5a5a6a'); b.ellipse(13, 16, 3, 2, '#8a8a9a');
      b.rect(13, 9, 6, 5, '#5a5a6a'); b.hline(12, 19, 12, '#c8a050');
      b.line(18, 9, 22, 5, '#c8a878'); b.px(23, 4, '#ff8a3a'); b.px(24, 3, '#ffd84a'); b.px(22, 3, '#ff5a2a');
    },
    m_star: (b) => {
      const star = (x, y, r, c) => { for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; poly(b, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a + 0.63) * r * 0.42, y + Math.sin(a + 0.63) * r * 0.42], [x, y], [x + Math.cos(a - 0.63) * r * 0.42, y + Math.sin(a - 0.63) * r * 0.42]], c); } };
      star(13, 15, 10, '#ffd84a'); star(13, 15, 6, '#fff0a0'); star(24, 23, 5, '#ffe070'); b.px(13, 15, '#ffffff'); spark(b, 25, 7, '#ffffff'); b.px(6, 26, '#fff0a0');
    },
    m_crystal: (b) => { crystal(b, 11, 27, 16, 4, '#e8b830'); crystal(b, 20, 27, 22, 5, '#ffd040'); crystal(b, 26, 27, 11, 3, '#d8a020'); b.hline(5, 28, 27, '#a87a1a'); spark(b, 22, 4, '#fff8c0'); },
    m_hide: (b) => {
      poly(b, [[6, 6], [14, 9], [22, 5], [27, 11], [24, 20], [27, 27], [18, 24], [9, 27], [5, 20], [8, 13]], '#8a5a30'); poly(b, [[8, 8], [14, 11], [21, 7], [24, 11], [21, 19], [12, 20], [8, 14]], '#a8703a');
      for (let k = 0; k < 6; k++) b.line(10 + k * 2, 12, 9 + k * 2, 18, '#c8904a'); b.px(15, 22, '#6a4020');
    },
    m_cloth: (b) => {
      poly(b, [[4, 10], [26, 6], [28, 22], [6, 26]], '#b8a888'); poly(b, [[5, 11], [25, 7], [26, 12], [6, 15]], '#d8c8a8');
      b.line(6, 18, 26, 15, '#9a8a6a'); b.rect(17, 17, 6, 5, '#8a6a9a'); b.hline(17, 22, 17, '#a888b8'); for (let k = 17; k <= 22; k += 2) b.px(k, 22, '#5a4a6a');
      b.px(5, 25, '#9a8a6a'); b.px(28, 21, '#9a8a6a');
    },
    m_dust: (b) => {
      poly(b, [[9, 13], [23, 13], [26, 27], [6, 27]], '#6a4a9a'); poly(b, [[10, 14], [16, 14], [14, 26], [8, 26]], '#8a6ac8');
      b.rect(11, 9, 10, 5, '#4a3a6a'); b.hline(10, 22, 12, '#e8c860');
      for (const [x, y, c] of [[16, 5, '#ffd8ff'], [20, 3, '#c8e8ff'], [12, 4, '#fff0a8'], [24, 7, '#ffd8ff'], [8, 7, '#c8e8ff']]) spark(b, x, y, c);
    },
    m_stone: (b) => { poly(b, [[5, 20], [9, 9], [20, 6], [27, 13], [26, 24], [15, 28], [7, 26]], '#6a6a72'); poly(b, [[7, 19], [10, 10], [19, 8], [24, 12], [15, 15], [9, 21]], '#9a9aa2'); b.line(11, 11, 17, 9, '#c8c8d0'); b.line(18, 18, 22, 24, '#4a4a52'); b.px(13, 23, '#4a4a52'); },
    m_seed: (b) => {
      b.ellipse(16, 21, 7, 7.5, '#7a4a2a'); b.ellipse(15, 20, 6, 6.5, '#a8683a'); b.line(12, 18, 14, 24, '#c8884a'); b.px(13, 17, '#e8b080');
      b.line(16, 14, 17, 7, '#4a9a3a'); b.ellipse(13, 7, 3.5, 2, '#6ac84a'); b.ellipse(21, 6, 3.5, 2, '#5ab83a'); b.px(12, 6, '#a8f08a');
    },
    m_shell: (b) => {
      b.ellipse(16, 17, 11, 11, '#4a6a3a'); b.ellipse(16, 16, 10, 10, '#6a8a4a'); b.vline(16, 6, 27, '#3a5a2a');
      b.ellipse(11, 12, 3, 4, '#8aac5a'); b.ellipse(21, 12, 3, 4, '#7a9c4a'); b.ellipse(12, 21, 3, 3, '#5a7a3a'); b.ellipse(20, 21, 3, 3, '#5a7a3a'); b.px(10, 10, '#c8e8a0');
    },
    m_ink: (b) => {
      b.rect(10, 9, 12, 3, '#3a3a48'); b.hline(10, 21, 9, '#6a6a7a');
      b.ellipse(16, 20, 9, 8, '#5a5a6a'); b.ellipse(16, 20, 8, 7, '#1a1028'); b.ellipse(13, 17, 2.5, 2, '#6a4a8a'); b.px(12, 16, '#c8a8ff');
      b.ellipse(25, 27, 4, 1.5, '#1a1028'); b.px(28, 25, '#1a1028');
    },
    m_tag: (b) => {
      for (let k = 0; k < 8; k++) b.px(5 + k * 1.5, 4 + k, k % 2 ? '#8a8a98' : '#b8b8c8');
      poly(b, [[10, 10], [24, 10], [27, 14], [27, 27], [10, 27]], '#a8683a'); poly(b, [[11, 11], [23, 11], [26, 14], [26, 18], [11, 18]], '#c8884a');
      b.ellipse(14, 13, 1.5, 1.5, '#3a2020'); for (const y of [20, 23]) b.hline(13, 24, y, '#7a4a2a'); b.px(22, 25, '#e8a868'); b.px(12, 26, '#6a3a1a');
    },
    m_silk: (b) => {
      ball(b, 15, 17, 10, 10, '#e8e4f0'); for (let k = 0; k < 5; k++) b.line(6 + k * 4, 10 + (k % 2) * 3, 10 + k * 3, 25 - (k % 2) * 2, '#c8c0d8');
      b.line(23, 12, 29, 4, '#e8e4f0'); b.px(29, 3, '#ffffff'); b.px(11, 12, '#ffffff');
    },
    m_bone: (b) => {
      thick(b, 9, 21, 22, 9, '#e8e0c8', 3); b.line(9, 21, 22, 9, '#fff8e8');
      for (const [x, y] of [[6, 21], [9, 25], [21, 5], [25, 9]]) ball(b, x, y, 3.2, 3.2, '#f0e8d0');
      b.line(11, 22, 23, 11, '#c8b898');
    },
    m_lens: (b) => {
      b.ellipse(15, 15, 11, 11, '#8a98b0'); b.ellipse(15, 15, 9.5, 9.5, '#cfe8f4'); b.ellipse(15, 15, 5, 5, '#5a9ad8'); b.ellipse(15, 15, 2.5, 2.5, '#16203a');
      b.ellipse(11, 10, 3, 2, '#ffffff'); b.px(19, 19, '#e8f8ff');
      thick(b, 22, 22, 27, 27, '#6a5040', 2);
    },
    m_spore: (b) => {
      b.ellipse(16, 18, 11, 10, '#a83a3a'); b.ellipse(15, 16, 10, 9, '#d8584a'); b.ellipse(12, 12, 3, 2.5, '#ff9a8a');
      for (const [x, y] of [[18, 12], [21, 18], [12, 20], [17, 22], [9, 15]]) { b.ellipse(x, y, 1.6, 1.6, '#fff0c0'); }
      for (const [x, y] of [[25, 5], [28, 9], [22, 3], [6, 6]]) b.px(x, y, '#ffd8a0', 0.8);
      b.rect(13, 27, 6, 2, '#7a5a3a');
    },
    m_horn: (b) => {
      for (let k = 0; k <= 20; k++) { const t = k / 20; const x = 6 + t * 18, y = 27 - Math.sin(t * Math.PI * 0.9) * 18 - t * 4; const w = 4.5 * (1 - t) + 0.6; b.ellipse(x, y, w, w, t < 0.3 ? '#c8b8a0' : t < 0.7 ? '#e8dcc0' : '#fff4dc'); }
      for (let k = 2; k <= 16; k += 4) { const t = k / 20; const x = 6 + t * 18, y = 27 - Math.sin(t * Math.PI * 0.9) * 18 - t * 4; b.px(Math.round(x), Math.round(y), '#9a8a70'); b.px(Math.round(x) + 1, Math.round(y) + 1, '#9a8a70'); }
    },
    lily: (b) => {
      b.line(16, 28, 16, 17, '#4a8a5a'); b.ellipse(11, 24, 4, 1.6, '#5aa86a'); b.ellipse(21, 22, 4, 1.6, '#5aa86a');
      for (const [a, l] of [[-2.2, 10], [-1.57, 11], [-0.9, 10], [-2.7, 7], [-0.4, 7]]) poly(b, [[16, 16], [16 + Math.cos(a - 0.35) * l * 0.6, 16 + Math.sin(a - 0.35) * l * 0.6], [16 + Math.cos(a) * l, 16 + Math.sin(a) * l], [16 + Math.cos(a + 0.35) * l * 0.6, 16 + Math.sin(a + 0.35) * l * 0.6]], '#f4f8f4');
      b.vline(16, 9, 15, '#e8ecd8'); b.px(15, 10, '#ffe890'); b.px(17, 10, '#ffe890'); b.px(16, 8, '#ffe890');
      for (const [x, y] of [[6, 10], [26, 12], [24, 4]]) b.px(x, y, '#d8e8e0', 0.6);
    },
    shade_core: (b) => {
      for (let r = 13; r >= 10; r--) b.ellipse(16, 16, r, r, '#6a3aa8', 0.12);
      ball(b, 16, 16, 9, 9, '#2a1a3a'); b.ellipse(16, 16, 4.5, 4.5, '#8a4ad8'); b.ellipse(16, 16, 2.2, 2.2, '#e8c8ff');
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; b.px(Math.round(16 + Math.cos(a) * 11), Math.round(16 + Math.sin(a) * 11), '#5a2a8a'); }
    },
    awake_shard: (b) => {
      poly(b, [[18, 2], [24, 12], [20, 29], [11, 22], [10, 10]], '#c8a8ff'); poly(b, [[18, 3], [18, 27], [12, 21], [11, 10]], '#f4ecff'); poly(b, [[18, 3], [23, 12], [18, 14]], '#ffffff');
      b.line(11, 10, 23, 12, '#e8d8ff'); spark(b, 6, 6, '#fff8c0', true); spark(b, 27, 22, '#ffffff');
    },
  };
  delete A.pickaxe_;

  /* 편지: 보낸 사람의 봉랍 빛깔 · 표시 */
  const LMARK = {
    hammer: (b, x, y, c) => { b.hline(x - 2, x + 1, y - 1, c); b.vline(x, y - 1, y + 2, c); },
    star: (b, x, y, c) => { b.px(x, y - 2, c); b.hline(x - 2, x + 2, y, c); b.px(x - 1, y + 1, c); b.px(x + 1, y + 1, c); b.px(x, y, c); },
    moon: (b, x, y, c) => { b.vline(x - 1, y - 2, y + 2, c); b.px(x, y - 2, c); b.px(x, y + 2, c); },
    leaf: (b, x, y, c) => { b.line(x - 2, y + 2, x + 2, y - 2, c); b.px(x - 1, y - 1, c); b.px(x + 1, y + 1, c); },
    heart: (b, x, y, c) => { b.px(x - 1, y - 1, c); b.px(x + 1, y - 1, c); b.hline(x - 2, x + 2, y, c); b.px(x, y + 1, c); b.px(x - 1, y, c); },
    wave: (b, x, y, c) => { b.px(x - 2, y, c); b.px(x - 1, y - 1, c); b.px(x, y, c); b.px(x + 1, y - 1, c); b.px(x + 2, y, c); },
    cross: (b, x, y, c) => { b.vline(x, y - 2, y + 2, c); b.hline(x - 1, x + 1, y - 1, c); },
    gear: (b, x, y, c) => { b.ellipse(x, y, 1.6, 1.6, c); b.px(x, y, null); b.px(x - 2, y, c); b.px(x + 2, y, c); b.px(x, y - 2, c); b.px(x, y + 2, c); },
  };
  const LETTERS = {
    letter_volkan: ['#c83a2a', 'hammer'], letter_lumie: ['#b8c8e8', 'cross', '#c8a050'], letter_orhan: ['#3a6a4a', 'leaf'], letter_luce: ['#3a7ac8', 'wave'],
    letter_iren: ['#5a9a5a', 'leaf', null, '#e8f0d8'], letter_haru: ['#d8783a', 'hammer'], letter_hanna: ['#e86a9a', 'heart'], letter_sophie: ['#8a5ac8', 'star'],
    letter_osborn: ['#6a6a7a', 'gear'], letter_dora: ['#c8a03a', 'star'], letter_zara: ['#2a2a4a', 'moon', null, '#e0dcd0'], letter_lumen: ['#f0d060', 'star', '#c8423a'],
  };
  for (const [id, [seal, mark, ribbon, paper]] of Object.entries(LETTERS)) A[id] = (b) => envelope(b, seal, { mark: LMARK[mark], ribbon, paper });

  /* 기술서 · 비기 두루마리 */
  const wOfSkill = (it) => { const sk = D.ASKILLS && D.ASKILLS[it.skill]; return (sk && (sk.w || sk.weapon)) || 'sword'; };
  const wOfArt = (it) => { const sp = D.SPECIALS && D.SPECIALS[it.special]; return (sp && sp.type) || 'sword'; };
  /* 속성 표식: 같은 무기 · 같은 등급 책끼리도 한눈에 갈리게 — 이름에서 읽는다 */
  const ELEM = [
    [/불|화염|태양|초신성|불사조|운석|유성|폭렬|폭발/, 'fire'], [/얼음|빙|서리/, 'ice'], [/번개|천둥|벼락|낙뢰/, 'bolt'],
    [/그림자|일식|검은|무명|분신|환영/, 'dark'], [/치유|빛|창세|새벽|오로라|천검|별/, 'light'], [/바람|회오리|질풍|폭풍|칼바람|하늘/, 'wind'],
    [/대지|땅|중력|가르기|강타/, 'earth'], [/해일|물/, 'water'], [/덩굴|덫|지뢰|감옥/, 'trap'],
  ];
  const ECOL = { fire: ['#ff6a2a', '#ffd84a'], ice: ['#6ac8ff', '#e8f8ff'], bolt: ['#ffd820', '#fff8c0'], dark: ['#5a2a8a', '#c8a0ff'], light: ['#fff0a0', '#ffffff'], wind: ['#5ad8a0', '#e0fff0'], earth: ['#a8703a', '#e8c890'], water: ['#3a7aff', '#bfe0ff'], trap: ['#4a9a3a', '#c8f0a0'] };
  const elemOf = (name) => { for (const [re, k] of ELEM) if (re.test(name || '')) return k; return null; };
  function badge(b, x, y, el) {
    const [c, h] = ECOL[el];
    if (el === 'fire') { poly(b, [[x - 3, y + 3], [x, y - 4], [x + 3, y + 3]], c); b.px(x, y + 1, h); b.px(x, y + 2, h); }
    else if (el === 'ice') { b.vline(x, y - 3, y + 3, c); b.hline(x - 3, x + 3, y, c); b.px(x - 2, y - 2, h); b.px(x + 2, y + 2, h); b.px(x + 2, y - 2, h); b.px(x - 2, y + 2, h); }
    else if (el === 'bolt') { b.line(x + 1, y - 4, x - 2, y, c); b.hline(x - 2, x + 2, y, c); b.line(x + 2, y, x - 1, y + 4, c); }
    else if (el === 'water') { b.ellipse(x, y + 1, 2.6, 2.6, c); poly(b, [[x - 2, y], [x, y - 4], [x + 2, y]], c); b.px(x - 1, y, h); }
    else { b.ellipse(x, y, 3, 3, sh(c, 0.6)); b.ellipse(x, y, 2.2, 2.2, c); b.px(x - 1, y - 1, h); }
  }
  function sbookArt(it) {
    const w = wOfSkill(it), gr = it.grade || 1, el = elemOf(it.name);
    return make((b) => { book(b, WCOL[w] || WCOL.sword, { trim: gr >= 4 ? '#ffd84a' : gr >= 2 ? '#e8d8b0' : null, gem: GEM[gr], emblem: (bb, x, y) => EMB[w](bb, x, y) }); if (el) badge(b, 14, 21, el); }, gr);
  }
  function artArt(it) {
    const w = wOfArt(it), gr = it.grade || 1, el = elemOf(it.name);
    return make((b) => { scroll(b, WCOL[w] || WCOL.sword, GEM[gr], (bb, x, y) => EMB[w](bb, x, y, '#5a4a3a')); if (el) badge(b, 25, 20, el); }, gr);
  }

  /* ───────── 꺼내 쓰기 ───────── */
  const CACHE = {};
  function icon(id) {
    if (id in CACHE) return CACHE[id];
    const it = D.ITEMS[id]; let c = null;
    try {
      if (A[id]) c = make(A[id], 0);
      else if (it && it.type === 'sbook' || (it && /^sb_/.test(id) && it.skill)) c = sbookArt(it);
      else if (it && it.type === 'art') c = artArt(it);
    } catch (e) { console.error('[itemart]', id, e); c = null; }
    CACHE[id] = c;
    return c;
  }
  /* 땅에 떨어진 아이템: 상자 대신 그 그림을 작게 (16×16) */
  const SMALL = {};
  function small(id) {
    if (id in SMALL) return SMALL[id];
    const big = icon(id); let c = null;
    if (big) { c = X.canvas(16, 16); const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(big, 0, 0, 16, 16); }
    SMALL[id] = c; return c;
  }
  G.itemArt = { icon, small, has: (id) => !!icon(id), ids: () => Object.keys(A) };

  // 떨어진 아이템 그림
  const C = G.combat;
  if (C && C.Pickup) {
    const dr0 = C.Pickup.prototype.draw;
    C.Pickup.prototype.draw = function (g, cx, cy) {
      if (this.what === 'item' && this.id) {
        const ic = small(this.id);
        if (ic) {
          if (this.t > this.life - 3 && Math.floor(this.t * 10) % 2) return;
          const x = Math.round(this.x - cx), y = Math.round(this.y - cy - this.jz - 3 + Math.sin(this.t * 6) * (this.jz ? 0 : 1));
          g.drawImage(ic, x - 8, y - 10);
          return;
        }
      }
      return dr0.apply(this, arguments);
    };
  }
})();
