/* 대화 초상화: 32×32 절차 합성 (얼굴·머리·표정·장신구) + 사람이 아닌 인물 전용 그림 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const SP = G.sprites;
  const N = 32;

  function blank() { const g = []; for (let y = 0; y < N; y++) g.push(new Array(N).fill('.')); return g; }
  function mk(g) {
    return {
      g,
      put(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < N && y < N) g[y][x] = c; },
      get(x, y) { return x >= 0 && y >= 0 && x < N && y < N ? g[y][x] : '.'; },
      ell(cx, cy, rx, ry, c, test) {
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          const d = dx * dx + dy * dy;
          if (d <= 1 && (!test || test(x, y, d))) g[y][x] = typeof c === 'function' ? c(x, y, d) : c;
        }
      },
      rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.put(x, y, c); },
      fill(fn) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const c = fn(x, y, g[y][x]); if (c) g[y][x] = c; } },
    };
  }

  /* ───────── 사람 ───────── */
  // 머리 모양: back(x,y) 뒷머리, front(x,y) 앞머리. 좌표는 32×32, 얼굴 중심 (16, 16)
  const inCap = (x, y, cx, cy, rx, ry) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; };
  const HAIRS = {
    short: { front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (y < 10 + ((x % 3) === 0 ? 1 : 0) || x < 8 && y < 17 || x > 23 && y < 17) },
    spiky: { front: (x, y) => (inCap(x, y, 16, 13, 10.5, 9) && (y < 11 + ((x * 7) % 3 === 0 ? 1 : 0) || x < 8 && y < 16 || x > 23 && y < 16)) || spikes(x, y, [7, 11, 16, 21, 25], 4, 1) },
    long: {
      back: (x, y) => (inCap(x, y, 16, 13, 11, 10) || (x >= 5 && x <= 26 && y >= 12 && y <= 29)) && !(y > 26 && (x < 6 || x > 25)),
      front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (y < 10 + ((x % 4) === 1 ? 1 : 0)) || (x >= 6 && x <= 8 && y >= 9 && y <= 27) || (x >= 23 && x <= 25 && y >= 9 && y <= 27),
    },
    bob: { front: (x, y) => (inCap(x, y, 16, 14, 11, 10) && (y < 11 || x < 9 || x > 22)) && y < 23 },
    bun: { front: (x, y) => (inCap(x, y, 16, 13, 10, 9) && (y < 10 || x < 8 && y < 15 || x > 23 && y < 15)) || inCap(x, y, 16, 3.5, 4.5, 4) },
    pony: {
      back: (x, y) => inCap(x, y, 16, 13, 10.5, 9.5) || (x >= 24 && x <= 28 && y >= 9 && y <= 26 && x - 24 <= (y - 9) * 0.5 + 2),
      front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (y < 10 + (x % 3 === 2 ? 1 : 0) || x < 8 && y < 16 || x > 23 && y < 16),
    },
    twin: {
      back: (x, y) => inCap(x, y, 16, 13, 10.5, 9.5) || inCap(x, y, 4.5, 19, 3.2, 9) || inCap(x, y, 27.5, 19, 3.2, 9),
      front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (y < 10 + (x % 3 === 0 ? 1 : 0) || x < 8 && y < 16 || x > 23 && y < 16),
    },
    slick: { front: (x, y) => inCap(x, y, 16, 12, 10, 8.5) && (y < 8 || x < 8 && y < 14 || x > 23 && y < 14) },
    messy: { front: (x, y) => (inCap(x, y, 16, 13, 10.5, 9.5) && (y < 10 + ((x * 5) % 4 === 0 ? 2 : 0) || x < 8 && y < 18 || x > 23 && y < 18)) || spikes(x, y, [6, 9, 14, 19, 24, 27], 3, 3) },
    bald: { front: (x, y) => (x >= 6 && x <= 8 && y >= 11 && y <= 16) || (x >= 23 && x <= 25 && y >= 11 && y <= 16) },
    none: { front: () => false },
    afro: { front: (x, y) => inCap(x, y, 16, 11, 14, 11) && (y < 9 || x < 8 || x > 23) && y < 21 },
    hood: {
      back: (x, y) => inCap(x, y, 16, 16, 13, 14),
      front: (x, y) => inCap(x, y, 16, 16, 13, 14) && !inCap(x, y, 16, 17.5, 9, 10) || (inCap(x, y, 16, 13, 10, 9) && y < 10),
    },
    veil: {
      back: (x, y) => inCap(x, y, 16, 15, 12.5, 13) || (x >= 3 && x <= 28 && y >= 14),
      front: (x, y) => (inCap(x, y, 16, 15, 12.5, 13) && !inCap(x, y, 16, 17.5, 8.5, 9.5)) || (y >= 14 && (x <= 6 || x >= 25)) || (inCap(x, y, 16, 13, 9.5, 9) && y < 10),
    },
    witch: {
      back: (x, y) => (x >= 5 && x <= 26 && y >= 10 && y <= 28),
      front: (x, y) => (x >= 6 && x <= 8 && y >= 10 && y <= 26) || (x >= 23 && x <= 25 && y >= 10 && y <= 26) || (y >= 9 && y <= 11 && x >= 8 && x <= 23),
      hat: (x, y) => (inCap(x, y, 16, 9, 15, 2.2)) || (y <= 8 && y >= 0 && Math.abs(x + 0.5 - (16 + (8 - y) * 0.5)) < (y + 1) * 0.9),
    },
    helmet: {
      front: (x, y) => inCap(x, y, 16, 14, 11, 11) && (y < 12 || x < 8 || x > 23) && y < 22,
      helm: true,
    },
    crown: { front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (y < 10 || x < 8 && y < 16 || x > 23 && y < 16), crown: true },
    cap: { front: (x, y) => inCap(x, y, 16, 13, 10, 9) && (x < 8 && y < 16 || x > 23 && y < 16), cap: true },
    braid: {
      back: (x, y) => inCap(x, y, 16, 13, 10.5, 9.5),
      front: (x, y) => (inCap(x, y, 16, 13, 10, 9) && (y < 10 + (x % 4 === 0 ? 1 : 0) || x < 8 && y < 16 || x > 23 && y < 16)) || (y >= 14 && y <= 30 && Math.abs(x + 0.5 - (24 + Math.sin(y * 0.9) * 0.8)) < 2.2),
    },
    topknot: { front: (x, y) => (inCap(x, y, 16, 13, 10, 9) && (y < 9 || x < 8 && y < 15 || x > 23 && y < 15)) || inCap(x, y, 16, 3, 3, 3) },
    side: { front: (x, y) => inCap(x, y, 16, 13, 10.5, 9.5) && (y < 9 + Math.max(0, (x - 8) * 0.28) || x < 8 && y < 20 || x > 23 && y < 16) },
  };
  function spikes(x, y, xs, h, base) {
    for (const sx of xs) { const dy = base + h - y; if (dy >= 0 && dy <= h && Math.abs(x + 0.5 - sx) <= (h - dy) * 0.6 + 0.5 && y <= base + h) return y >= base; }
    return false;
  }

  function human(sp, emo) {
    const P = mk(blank());
    const hair = HAIRS[sp.hair || 'short'];
    // 뒷머리
    if (hair.back) P.fill((x, y) => (hair.back(x, y) ? 'k' : null));
    // 옷
    for (let y = 25; y < N; y++) {
      const w = 8 + Math.round((y - 25) * 1.5);
      for (let x = 16 - w; x < 16 + w; x++) P.put(x, y, (x < 16 - w + 2 || x >= 16 + w - 2) ? 'c' : 'C');
    }
    if (sp.collar !== false) { for (let y = 25; y < 29; y++) { P.put(13 - (y - 25), y, 'W'); P.put(18 + (y - 25), y, 'W'); } }
    if (sp.cape) { for (let y = 26; y < N; y++) { P.put(2 + (31 - y) * 0.3, y, 'A'); P.put(29 - (31 - y) * 0.3, y, 'A'); } }
    // 목
    P.rect(13, 22, 18, 26, 's');
    // 얼굴
    P.ell(16, 15.5, 8.6, 9.6, (x, y, d) => (x < 11 && y > 17 && d > 0.5 ? 's' : 'S'));
    P.rect(7, 14, 7, 17, 'S'); P.rect(24, 14, 24, 17, 'S'); P.put(7, 16, 's'); P.put(24, 16, 's');
    // 앞머리
    P.fill((x, y) => (hair.front(x, y) ? 'H' : null));
    // 머리 명암
    P.fill((x, y, c) => (c === 'H' && ((x + y) % 7 === 0 && y < 9 && y > 2) ? 'h' : null));
    // 표정
    face(P, sp, emo || 'normal');
    // 모자 · 투구 · 왕관
    if (hair.hat) P.fill((x, y) => (hair.hat(x, y) ? 'A' : null));
    if (hair.helm) { P.ell(16, 12, 11, 9.5, 'A', (x, y) => y < 12); P.rect(6, 11, 25, 12, 'a'); P.rect(15, 3, 16, 11, 'a'); }
    if (hair.crown) { P.rect(9, 4, 22, 6, 'A'); for (const cx of [9, 13, 16, 19, 22]) P.rect(cx, 1, cx, 3, 'A'); P.put(12, 5, 'r'); P.put(16, 5, 'b'); P.put(20, 5, 'r'); }
    if (hair.cap) { P.ell(16, 9.5, 10.5, 6.5, 'A', (x, y) => y < 10); P.rect(5, 9, 27, 10, 'a'); P.rect(20, 10, 28, 10, 'a'); }
    for (const a of sp.acc || []) accessory(P, a, sp);
    return render(P.g, colors(sp));
  }

  function face(P, sp, emo) {
    const eyes = sp.eyes || 'dot';
    const ey = 16, lx = 12, rx = 19;
    // 눈썹
    const brow = sp.brow !== false;
    if (brow) {
      const by = 13;
      if (emo === 'angry') { P.rect(lx - 1, by - 1, lx, by - 1, 'H'); P.rect(lx + 1, by, lx + 1, by, 'H'); P.rect(rx + 1, by - 1, rx + 2, by - 1, 'H'); P.rect(rx, by, rx, by, 'H'); }
      else if (emo === 'sad' || emo === 'worry') { P.rect(lx - 1, by, lx, by, 'H'); P.put(lx + 1, by - 1, 'H'); P.rect(rx + 1, by, rx + 2, by, 'H'); P.put(rx, by - 1, 'H'); }
      else if (emo === 'surprise') { P.rect(lx - 1, by - 2, lx + 1, by - 2, 'H'); P.rect(rx, by - 2, rx + 2, by - 2, 'H'); }
      else { P.rect(lx - 1, by - 1, lx + 1, by - 1, 'H'); P.rect(rx, by - 1, rx + 2, by - 1, 'H'); }
    }
    // 눈
    const eyeAt = (x, left) => {
      if (emo === 'happy' || eyes === 'closed') { P.put(x - 1, ey + 1, 'E'); P.put(x, ey, 'E'); P.put(x + 1, ey + 1, 'E'); return; }
      if (emo === 'surprise') { P.rect(x - 1, ey - 1, x + 1, ey + 1, 'w'); P.put(x, ey, 'E'); return; }
      if (emo === 'sad' && eyes !== 'visor') { P.rect(x - 1, ey + 1, x + 1, ey + 1, 'E'); P.put(left ? x - 1 : x + 1, ey, 'E'); return; }
      switch (eyes) {
        case 'big': P.rect(x - 1, ey - 1, x + 1, ey + 1, 'e'); P.put(left ? x - 1 : x, ey - 1, 'w'); P.put(x, ey + 1, 'E'); break;
        case 'narrow': P.rect(x - 1, ey, x + 1, ey, 'E'); break;
        case 'sharp': P.rect(x - 1, ey, x + 1, ey, 'E'); P.put(left ? x + 1 : x - 1, ey - 1, 'E'); P.put(x, ey + 1, 'e'); break;
        case 'sleepy': P.rect(x - 1, ey, x + 1, ey, 'H'); P.rect(x - 1, ey + 1, x + 1, ey + 1, 'E'); break;
        case 'visor': break;
        default: P.rect(x - 1, ey, x, ey + 1, 'E'); P.put(left ? x - 1 : x, ey, 'e'); P.put(left ? x - 1 : x - 1, ey, 'w');
      }
      if (emo === 'angry') P.put(left ? x + 1 : x - 1, ey - 1, 'S');
    };
    eyeAt(lx, true); eyeAt(rx, false);
    if (eyes === 'visor') { P.rect(8, ey - 1, 23, ey + 1, 'V'); P.rect(9, ey, 22, ey, 'v'); }
    if (emo === 'sad' && sp.tear !== false) { P.put(lx - 1, ey + 2, 'T'); P.put(lx - 1, ey + 3, 'T'); }
    if (emo === 'angry') { P.put(9, 11, 'X'); P.put(10, 10, 'X'); P.put(9, 9, 'X'); }
    // 코
    P.put(16, 19, 's');
    // 입
    const my = 21;
    const mouth = emo === 'normal' ? (sp.mouth || 'smile') : { happy: 'open', sad: 'frown', angry: 'teeth', surprise: 'o', worry: 'wave', smug: 'smirk', think: 'flat' }[emo] || sp.mouth || 'smile';
    switch (mouth) {
      case 'smile': P.put(14, my, 'M'); P.rect(15, my + 1, 17, my + 1, 'M'); P.put(18, my, 'M'); break;
      case 'open': P.rect(14, my, 18, my, 'M'); P.rect(15, my + 1, 17, my + 1, 'm'); break;
      case 'frown': P.put(14, my + 1, 'M'); P.rect(15, my, 17, my, 'M'); P.put(18, my + 1, 'M'); break;
      case 'teeth': P.rect(14, my, 18, my + 1, 'M'); P.rect(15, my, 17, my, 'w'); break;
      case 'o': P.rect(15, my, 17, my + 1, 'M'); P.put(16, my, 'm'); break;
      case 'wave': P.put(14, my + 1, 'M'); P.put(15, my, 'M'); P.put(16, my + 1, 'M'); P.put(17, my, 'M'); P.put(18, my + 1, 'M'); break;
      case 'smirk': P.rect(15, my + 1, 17, my + 1, 'M'); P.put(18, my, 'M'); break;
      case 'cat': P.put(14, my, 'M'); P.put(15, my + 1, 'M'); P.put(16, my, 'M'); P.put(17, my + 1, 'M'); P.put(18, my, 'M'); break;
      default: P.rect(15, my, 17, my, 'M');
    }
    if (sp.blush || emo === 'happy' || emo === 'shy') { P.rect(9, 19, 10, 19, 'r'); P.rect(21, 19, 22, 19, 'r'); }
  }

  function accessory(P, a, sp) {
    switch (a) {
      case 'glasses': for (const x of [10, 17]) { P.rect(x, 14, x + 4, 14, 'G'); P.rect(x, 18, x + 4, 18, 'G'); P.rect(x, 14, x, 18, 'G'); P.rect(x + 4, 14, x + 4, 18, 'G'); } P.rect(15, 15, 16, 15, 'G'); break;
      case 'monocle': P.rect(17, 14, 21, 14, 'Y'); P.rect(17, 18, 21, 18, 'Y'); P.rect(17, 14, 17, 18, 'Y'); P.rect(21, 14, 21, 18, 'Y'); P.rect(21, 19, 21, 26, 'Y'); break;
      case 'scar': P.put(21, 18, 'X'); P.put(22, 19, 'X'); P.put(21, 20, 'X'); P.put(20, 19, 'X'); break;
      case 'freckle': for (const [x, y] of [[10, 18], [12, 19], [11, 20], [20, 19], [22, 18], [21, 20]]) P.put(x, y, 's'); break;
      case 'beard': P.ell(16, 23, 7.5, 5, 'H', (x, y) => y >= 20); P.rect(14, 21, 18, 21, 'M'); break;
      case 'longbeard': P.ell(16, 25, 7, 7.5, 'H', (x, y) => y >= 20); P.rect(14, 21, 18, 21, 'M'); break;
      case 'mustache': P.rect(12, 20, 15, 20, 'H'); P.rect(17, 20, 20, 20, 'H'); P.put(11, 21, 'H'); P.put(21, 21, 'H'); break;
      case 'wrinkle': P.put(9, 18, 's'); P.put(22, 18, 's'); P.put(13, 11, 's'); P.put(18, 11, 's'); break;
      case 'earring': P.put(7, 18, 'Y'); P.put(24, 18, 'Y'); P.put(7, 19, 'Y'); P.put(24, 19, 'Y'); break;
      case 'eyepatch': P.rect(17, 14, 21, 18, 'K'); P.rect(6, 12, 26, 12, 'K'); break;
      case 'bandage': P.rect(7, 11, 24, 12, 'W'); P.put(20, 11, 'r'); break;
      case 'paint': for (const x of [12, 19]) { P.put(x, 12, 'R'); P.put(x - 1, 13, 'R'); P.put(x + 1, 13, 'R'); P.put(x, 19, 'b'); P.put(x - 1, 18, 'b'); P.put(x + 1, 18, 'b'); } P.rect(15, 19, 17, 20, 'R'); break;
      case 'flower': P.rect(22, 5, 24, 7, 'r'); P.put(23, 6, 'Y'); break;
      case 'goggles': P.rect(7, 7, 24, 9, 'a'); P.rect(9, 6, 13, 10, 'G'); P.rect(18, 6, 22, 10, 'G'); P.rect(10, 7, 12, 9, 'b'); P.rect(19, 7, 21, 9, 'b'); break;
      case 'mask': P.rect(8, 19, 23, 24, 'K'); break;
      case 'halo': P.rect(10, 0, 21, 0, 'Y'); P.put(9, 1, 'Y'); P.put(22, 1, 'Y'); break;
      case 'horn': P.rect(7, 2, 8, 6, 'Y'); P.rect(23, 2, 24, 6, 'Y'); break;
      case 'star': P.put(23, 4, 'Y'); P.rect(22, 5, 24, 5, 'Y'); P.put(23, 6, 'Y'); break;
      case 'bolt': P.rect(6, 15, 7, 17, 'G'); P.rect(24, 15, 25, 17, 'G'); break;
      case 'headband': P.rect(7, 9, 24, 10, 'A'); P.rect(25, 10, 27, 12, 'A'); break;
      case 'pale': P.fill((x, y, c) => (c === 'S' && (x + y) % 5 === 0 ? 'p' : null)); break;
      case 'stripe': P.fill((x, y, c) => (c === 'H' && x % 4 === 0 ? 'h' : null)); break;
      case 'grayhair': P.fill((x, y, c) => (c === 'H' && (x * 3 + y) % 5 === 0 ? 'h' : null)); break;
    }
  }

  function colors(sp) {
    const skin = sp.skin || '#ffd6b0', hc = sp.hc || '#5a3a22', top = sp.top || '#4a8ad8', acc = sp.ac || sp.hc || '#c8483a';
    return {
      S: skin, s: U.shade(skin, 0.86), p: U.mix(skin, '#c8c8d0', 0.5), H: hc, h: U.shade(hc, 1.4), k: U.shade(hc, 0.72), E: sp.ec ? U.shade(sp.ec, 0.45) : '#2a1a2a',
      e: sp.ec || '#3a2a3a', w: '#ffffff', M: U.shade(skin, 0.55), m: '#c84a5a', C: top, c: U.shade(top, 0.75), W: sp.collar || '#f4f0e8',
      A: acc, a: U.shade(acc, 0.72), r: '#ff8a9a', R: '#ff4a5a', b: '#4a8ae8', G: sp.gc || '#3a3a48', Y: '#ffd84a', K: '#1a1622', T: '#8ad8ff',
      X: sp.xc || '#d8403a', V: sp.vc || '#2a2a38', v: sp.vl || '#6ae8ff',
    };
  }

  function render(grid, cols) { return SP.renderGrid(grid.map((r) => r.join('')), cols); }

  /* ───────── 사람이 아닌 인물 ───────── */
  const SPECIAL = {
    squirrel(emo) { // 토리아
      const P = mk(blank());
      P.ell(26, 12, 6, 11, 'T', (x, y) => x > 18); // 꼬리
      P.ell(26, 12, 3.5, 8, 't', (x, y) => x > 22);
      P.ell(15, 27, 11, 7, 'O'); P.ell(15, 28, 6, 5, 'W');
      P.ell(15, 15, 11, 10, 'O');
      P.ell(7, 5, 3, 4, 'O'); P.ell(23, 5, 3, 4, 'O'); P.ell(7, 5.5, 1.5, 2.2, 'P'); P.ell(23, 5.5, 1.5, 2.2, 'P');
      P.ell(15, 20, 7, 5, 'W');
      eyesCute(P, emo, 10, 20, 14);
      P.rect(14, 18, 16, 18, 'N'); P.put(15, 19, 'N');
      mouthCute(P, emo, 15, 21);
      P.rect(5, 17, 7, 17, 'r'); P.rect(23, 17, 25, 17, 'r');
      if (emo === 'angry') { P.put(8, 10, 'X'); P.put(9, 9, 'X'); }
      return render(P.g, { O: '#c8783a', o: '#a85a28', W: '#ffe8c8', T: '#e0955a', t: '#f0b880', P: '#ff9aa8', N: '#5a2a1a', E: '#1a1020', w: '#ffffff', M: '#5a2a1a', r: '#ff9aa8', X: '#d8403a', Q: '#8ad8ff' });
    },
    cat(emo) { // 미드나잇
      const P = mk(blank());
      P.ell(16, 29, 12, 6, 'K');
      P.rect(10, 26, 21, 31, 'W'); P.rect(14, 26, 17, 28, 'R');
      P.ell(16, 17, 11, 9, 'K');
      for (let i = 0; i < 6; i++) { P.rect(6 + Math.floor(i / 2), 6 + i, 9 - Math.floor(i / 3), 6 + i, 'K'); P.rect(22 + Math.floor(i / 3), 6 + i, 25 - Math.floor(i / 2), 6 + i, 'K'); }
      P.rect(9, 0, 22, 6, 'H'); P.rect(5, 6, 26, 7, 'H'); P.rect(9, 5, 22, 5, 'h');
      if (emo === 'happy' || emo === 'smug') { P.rect(10, 16, 13, 16, 'Y'); P.rect(19, 16, 22, 16, 'Y'); P.put(10, 15, 'Y'); P.put(22, 15, 'Y'); }
      else { P.ell(11.5, 16, 2.4, 2.4, 'Y'); P.ell(20.5, 16, 2.4, 2.4, 'Y'); P.rect(11, 15, 11, 17, 'E'); P.rect(20, 15, 20, 17, 'E'); if (emo === 'surprise') { P.rect(10, 15, 12, 17, 'E'); P.rect(19, 15, 21, 17, 'E'); } }
      P.put(16, 19, 'P'); P.put(15, 21, 'w'); P.put(17, 21, 'w'); P.put(16, 20, 'w');
      for (const y of [19, 21]) { P.rect(3, y, 8, y, 'w'); P.rect(24, y, 29, y, 'w'); }
      if (emo === 'angry') { P.rect(9, 13, 13, 13, 'Y'); P.rect(19, 13, 23, 13, 'Y'); }
      return render(P.g, { K: '#26222e', H: '#141018', h: '#8a2a3a', Y: '#ffe066', E: '#141018', P: '#ff9ae8', w: '#e8e0f0', W: '#f4f4f8', R: '#8a2a3a' });
    },
    octopus(emo) { // 옥타비오 관장
      const P = mk(blank());
      for (let i = 0; i < 5; i++) P.ell(5 + i * 5.5, 28, 2.6, 5, 'O');
      P.ell(16, 13, 12, 12, 'O');
      P.ell(12, 6, 3, 2, 'o'); P.ell(21, 5, 2, 1.5, 'o');
      for (const x of [9, 17]) { P.rect(x, 13, x + 5, 13, 'G'); P.rect(x, 18, x + 5, 18, 'G'); P.rect(x, 13, x, 18, 'G'); P.rect(x + 5, 13, x + 5, 18, 'G'); P.rect(x + 1, 14, x + 4, 17, 'w'); }
      P.rect(15, 15, 16, 15, 'G');
      if (emo === 'happy') { P.put(11, 16, 'E'); P.put(12, 15, 'E'); P.put(13, 16, 'E'); P.put(19, 16, 'E'); P.put(20, 15, 'E'); P.put(21, 16, 'E'); }
      else { P.rect(11, 15, 12, 16, 'E'); P.rect(19, 15, 20, 16, 'E'); }
      if (emo === 'surprise') { P.rect(14, 21, 17, 23, 'M'); } else { P.put(14, 21, 'M'); P.rect(15, 22, 16, 22, 'M'); P.put(17, 21, 'M'); }
      P.rect(12, 27, 19, 31, 'C'); P.rect(15, 27, 16, 29, 'W');
      return render(P.g, { O: '#a05ad8', o: '#c88af0', G: '#d8b048', w: '#f4f0ff', E: '#1a1020', M: '#5a2a6a', C: '#3a4a8a', W: '#ffffff' });
    },
    robot(emo) { // 세피아 N-07
      const P = mk(blank());
      P.rect(6, 26, 25, 31, 'C'); P.rect(12, 26, 19, 27, 'm');
      P.rect(13, 22, 18, 25, 'm');
      P.ell(16, 14, 10, 10, 'M');
      P.rect(15, 0, 16, 4, 'm'); P.ell(16, 1.5, 2, 1.5, 'L');
      P.rect(7, 12, 24, 18, 'V');
      const col = emo === 'sad' ? 'b' : emo === 'happy' ? 'Y' : 'L';
      if (emo === 'happy') { for (const x of [11, 20]) { P.put(x - 1, 15, col); P.put(x, 14, col); P.put(x + 1, 15, col); } }
      else if (emo === 'sad') { for (const x of [11, 20]) { P.rect(x - 1, 16, x + 1, 16, col); } P.put(10, 19, 'b'); }
      else if (emo === 'surprise') { for (const x of [11, 20]) P.rect(x - 1, 14, x + 1, 16, col); }
      else { for (const x of [11, 20]) P.rect(x - 1, 15, x + 1, 15, col); }
      P.rect(13, 21, 18, 21, 'm');
      P.rect(4, 12, 6, 17, 'm'); P.rect(25, 12, 27, 17, 'm');
      P.put(8, 21, 'r'); P.put(23, 21, 'r');
      return render(P.g, { M: '#c8d0dc', m: '#8a96aa', V: '#1a2230', L: '#ffb86a', Y: '#ffe066', b: '#6ab8ff', C: '#e88a5a', r: '#ff9a9a' });
    },
    screen(emo) { // 스텔라
      const P = mk(blank());
      P.rect(2, 3, 29, 26, 'F'); P.rect(4, 5, 27, 24, 'B');
      P.rect(12, 27, 19, 29, 'F'); P.rect(8, 30, 23, 31, 'F');
      for (let y = 5; y < 25; y += 2) P.rect(4, y, 27, y, 'b');
      const c = emo === 'angry' ? 'R' : 'L';
      if (emo === 'happy') { for (const x of [11, 20]) { P.put(x - 2, 13, c); P.put(x - 1, 12, c); P.put(x, 11, c); P.put(x + 1, 12, c); P.put(x + 2, 13, c); } }
      else if (emo === 'angry') { for (const x of [11, 20]) P.rect(x - 2, 12, x + 2, 13, c); P.put(8, 10, c); P.put(9, 11, c); P.put(23, 10, c); P.put(22, 11, c); }
      else if (emo === 'sad') { for (const x of [11, 20]) P.rect(x - 2, 13, x + 2, 13, c); P.put(9, 12, c); P.put(22, 12, c); }
      else { for (const x of [11, 20]) P.rect(x - 1, 10, x + 1, 13, c); }
      if (emo === 'happy' || emo === 'smug') { P.rect(12, 18, 19, 18, c); P.put(11, 17, c); P.put(20, 17, c); }
      else if (emo === 'surprise') P.rect(14, 17, 17, 20, c);
      else P.rect(12, 18, 19, 18, c);
      return render(P.g, { F: '#8a96aa', B: '#0b1a2a', b: '#10263a', L: '#6ae8ff', R: '#ff5a6a' });
    },
    tree() { // 나무 정령
      const P = mk(blank());
      P.ell(16, 10, 15, 10, 'L'); P.ell(10, 8, 6, 5, 'l'); P.ell(23, 11, 6, 5, 'l');
      P.rect(9, 14, 22, 31, 'B'); P.rect(11, 14, 12, 31, 'b'); P.rect(19, 20, 20, 31, 'b');
      P.rect(11, 19, 13, 20, 'Y'); P.rect(18, 19, 20, 20, 'Y'); P.rect(13, 24, 18, 25, 'b');
      return render(P.g, { L: '#5aa84a', l: '#7ac86a', B: '#6a4a2a', b: '#4a3218', Y: '#ffe08a' });
    },
    golem() {
      const P = mk(blank());
      P.rect(6, 6, 25, 30, 'M'); P.rect(8, 8, 23, 28, 'm'); P.rect(9, 13, 22, 16, 'V'); P.rect(11, 14, 13, 15, 'L'); P.rect(18, 14, 20, 15, 'L');
      P.rect(12, 21, 19, 22, 'V'); P.rect(14, 1, 17, 6, 'M'); P.rect(15, 0, 16, 1, 'L');
      return render(P.g, { M: '#8a7ab0', m: '#6a5a90', V: '#2a2240', L: '#e8d8ff' });
    },
    whale(emo) { // 구름고래 누베
      const P = mk(blank());
      P.ell(16, 19, 15, 11, 'B'); P.ell(16, 24, 12, 6, 'W');
      P.ell(9, 17, 2.2, 2.2, 'w'); P.rect(9, 17, 9, 18, 'E');
      if (emo === 'happy') { P.rect(8, 17, 10, 17, 'E'); }
      P.rect(6, 22, 12, 22, 'M');
      P.ell(16, 5, 2, 3, 'w'); P.ell(12, 4, 1.5, 2, 'w'); P.ell(20, 4, 1.5, 2, 'w');
      return render(P.g, { B: '#8ac8ff', W: '#ffffff', w: '#e8f4ff', E: '#1a2a4a', M: '#3a6a9a' });
    },
    blacksun() {
      const P = mk(blank());
      P.ell(16, 16, 15, 15, 'R'); P.ell(16, 16, 13, 13, 'K'); P.ell(16, 16, 6, 6, 'k'); P.ell(16, 16, 2.5, 2.5, 'R');
      return render(P.g, { R: '#ff3a5a', K: '#0b0a1c', k: '#1a1030' });
    },
    mystery() {
      const P = mk(blank());
      P.ell(16, 16, 10, 11, 'K'); P.ell(16, 30, 13, 6, 'K');
      P.rect(14, 10, 17, 11, 'W'); P.rect(18, 12, 18, 14, 'W'); P.rect(15, 15, 17, 16, 'W'); P.rect(15, 17, 15, 18, 'W'); P.rect(15, 21, 16, 22, 'W');
      return render(P.g, { K: '#3a3450', W: '#ffffff' });
    },
    slime() {
      const P = mk(blank());
      P.ell(16, 21, 13, 10, 'M'); P.ell(11, 16, 3, 2, 'W'); P.rect(11, 20, 12, 22, 'E'); P.rect(19, 20, 20, 22, 'E');
      return render(P.g, { M: '#58c85a', W: '#ffffff', E: '#1a1020' });
    },
  };
  function eyesCute(P, emo, lx, rx, ey) {
    if (emo === 'happy') { for (const x of [lx, rx]) { P.put(x - 1, ey + 1, 'E'); P.put(x, ey, 'E'); P.put(x + 1, ey + 1, 'E'); } return; }
    if (emo === 'sad') { for (const x of [lx, rx]) { P.rect(x - 1, ey + 1, x + 1, ey + 1, 'E'); } P.put(lx, ey + 3, 'Q'); P.put(lx, ey + 4, 'Q'); return; }
    if (emo === 'angry') { for (const x of [lx, rx]) { P.rect(x - 1, ey, x + 1, ey + 1, 'E'); } P.rect(lx - 2, ey - 2, lx, ey - 2, 'E'); P.rect(rx, ey - 2, rx + 2, ey - 2, 'E'); return; }
    const big = emo === 'surprise' ? 1 : 0;
    for (const x of [lx, rx]) { P.rect(x - 1 - big, ey - 1 - big, x + 1 + big, ey + 1 + big, 'E'); P.put(x - 1, ey - 1, 'w'); }
  }
  function mouthCute(P, emo, x, y) {
    if (emo === 'happy') { P.rect(x - 2, y, x + 2, y, 'M'); P.rect(x - 1, y + 1, x + 1, y + 1, 'r'); }
    else if (emo === 'sad') { P.put(x - 2, y + 1, 'M'); P.rect(x - 1, y, x + 1, y, 'M'); P.put(x + 2, y + 1, 'M'); }
    else if (emo === 'surprise') { P.rect(x - 1, y, x + 1, y + 2, 'M'); }
    else { P.put(x - 2, y, 'M'); P.put(x - 1, y + 1, 'M'); P.put(x, y, 'M'); P.put(x + 1, y + 1, 'M'); P.put(x + 2, y, 'M'); }
  }

  const cache = new Map();
  /** portrait(charId, emo) → canvas */
  function portrait(id, emo) {
    const key = id + ':' + (emo || 'normal');
    if (cache.has(key)) return cache.get(key);
    const ch = G.chars[id];
    let cv = null;
    if (id === '@' || id === 'hero') cv = human(heroFace(), emo);
    else if (ch && ch.face && ch.face.mon) { const md = G.data.MON[ch.face.mon]; cv = SP.monster(U.hash(md.id) % 100000, md.arch, md.c[0], md.c[1], md.c[2], md.role === 'b' || md.role === 'x'); }
    else if (ch && ch.face) cv = ch.face.special ? SPECIAL[ch.face.special](emo || 'normal') : human(ch.face, emo);
    else cv = SPECIAL.mystery();
    cache.set(key, cv);
    return cv;
  }
  function heroFace() {
    const s = G.state || {};
    return s.gender === 'girl'
      ? { hair: 'long', hc: '#6a3e22', top: '#3aa84a', ec: '#3a8a4a', eyes: 'big', collar: '#f4f0e8', acc: ['flower'] }
      : { hair: 'spiky', hc: '#5a3a22', top: '#3aa84a', ec: '#3a8a4a', eyes: 'big', collar: '#f4f0e8' };
  }
  function clear() { cache.clear(); }

  G.portraits = { portrait, human, SPECIAL, HAIRS, clear };
})();
