/* 그림 도구: 작은 캔버스, 픽셀 찍기, 외곽선 · 반전 · 흰 실루엣, 작은 숫자 글꼴 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
  function ctx(c) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return g; }

  /** 픽셀 붓: ImageData 위에서 빠르게 찍는다. 끝나면 put() */
  function brush(w, h) {
    const c = canvas(w, h), g = ctx(c);
    const img = g.createImageData(w, h), d = img.data;
    const b = {
      c, w, h, d,
      px(x, y, col, a) {
        x |= 0; y |= 0;
        if (x < 0 || y < 0 || x >= w || y >= h || !col) return;
        const i = (y * w + x) * 4;
        const [r, gg, bb] = typeof col === 'string' ? U.rgb(col) : col;
        if (a === undefined || a >= 1) { d[i] = r; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = 255; }
        else { const ia = 1 - a; d[i] = d[i] * ia + r * a; d[i + 1] = d[i + 1] * ia + gg * a; d[i + 2] = d[i + 2] * ia + bb * a; d[i + 3] = Math.max(d[i + 3], a * 255); }
      },
      get(x, y) { if (x < 0 || y < 0 || x >= w || y >= h) return 0; return d[(y * w + x) * 4 + 3]; },
      rect(x, y, rw, rh, col, a) { for (let yy = y; yy < y + rh; yy++) for (let xx = x; xx < x + rw; xx++) b.px(xx, yy, col, a); },
      hline(x0, x1, y, col) { for (let x = x0; x <= x1; x++) b.px(x, y, col); },
      vline(x, y0, y1, col) { for (let y = y0; y <= y1; y++) b.px(x, y, col); },
      /** 채운 타원 (중심, 반지름) */
      ellipse(cx, cy, rx, ry, col, a) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) b.px(x, y, col, a);
        }
      },
      line(x0, y0, x1, y1, col) {
        x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;
        for (;;) { b.px(x0, y0, col); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
      },
      /** 문자열 도안: rows의 문자 → 팔레트 색 */
      stamp(x, y, rows, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const k = r[i]; if (k !== ' ' && k !== '.' && pal[k]) b.px(x + i, y + j, pal[k]); } }); },
      put() { g.putImageData(img, 0, 0); return c; },
    };
    return b;
  }

  /** 불투명한 부분 둘레에 1픽셀 외곽선 */
  function outline(src, col, alpha) {
    const w = src.width + 2, h = src.height + 2;
    const c = canvas(w, h), g = ctx(c);
    g.drawImage(src, 1, 1);
    const img = g.getImageData(0, 0, w, h), d = img.data;
    const a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 40 ? 1 : 0;
    const [r, gg, bb] = U.rgb(col || '#16101f');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (a[i]) continue;
      if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) {
        d[i * 4] = r; d[i * 4 + 1] = gg; d[i * 4 + 2] = bb; d[i * 4 + 3] = alpha == null ? 255 : alpha;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function flipX(src) { const c = canvas(src.width, src.height), g = ctx(c); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
  /** 한 가지 색 실루엣 (피격 번쩍임 · 그림자) */
  function silhouette(src, col) {
    const c = canvas(src.width, src.height), g = ctx(c);
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function tint(src, col, a) {
    const c = canvas(src.width, src.height), g = ctx(c);
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ───────── 작은 숫자 글꼴 (3×5) ───────── */
  const DIG = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
    '/': '001001010100100', 'x': '000101010101000', 'L': '100100100100111', 'K': '101101110101101', 'I': '111010010010111', 'J': '001001001101111', 'O': '111101101101111', 'V': '101101101101010', 'H': '101101111101101', 'P': '110101110100100', 'M': '101111111101101', '%': '101001010100101', '+': '000010111010000', '-': '000000111000000', ':': '000010000010000', '.': '000000000000010',
  };
  /** 숫자 문자열을 캔버스에 (외곽선 포함) */
  function digits(g, str, x, y, col, shadow) {
    str = String(str);
    const draw = (ox, oy, c) => {
      g.fillStyle = c;
      let cx = ox;
      for (const ch of str) {
        const m = DIG[ch];
        if (m) for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(cx + (i % 3), oy + Math.floor(i / 3), 1, 1);
        cx += ch === ':' || ch === '.' ? 2 : 4;
      }
      return cx - ox;
    };
    if (shadow !== false) { draw(x + 1, y, '#0b0914'); draw(x - 1, y, '#0b0914'); draw(x, y + 1, '#0b0914'); draw(x, y - 1, '#0b0914'); }
    return draw(x, y, col || '#ffffff');
  }
  function digitsWidth(str) { let w = 0; for (const ch of String(str)) w += ch === ':' || ch === '.' ? 2 : 4; return w - 1; }

  /** 명도 단계: 기준색에서 어둡게/밝게 n단 */
  function ramp(hex, n) { const out = []; for (let i = 0; i < n; i++) { const f = 0.55 + (i / (n - 1)) * 0.75; out.push(f <= 1 ? U.shade(hex, f) : U.mix(hex, '#ffffff', (f - 1) * 1.2)); } return out; }

  /** 그림 속에 갇힌 작은 빈칸(가장자리와 이어지지 않은 투명 칸, max칸 이하 덩어리)을 둘레 색으로 메운다.
      바깥선을 그으면 이런 빈칸은 검은 점 · 고리로 남아 머리 · 두건 · 얼굴 둘레가 「비어」 보였다 */
  function fillHoles(b, max) {
    const w = b.w, h = b.h, d = b.d, N = w * h;
    const op = (i) => d[i * 4 + 3] > 40;
    const mark = new Uint8Array(N), q = [];
    const push = (i) => { if (!mark[i] && !op(i)) { mark[i] = 1; q.push(i); } };
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
    while (q.length) { const i = q.pop(), x = i % w, y = (i / w) | 0; if (x > 0) push(i - 1); if (x < w - 1) push(i + 1); if (y > 0) push(i - w); if (y < h - 1) push(i + w); }
    for (let s = 0; s < N; s++) {
      if (mark[s] || op(s)) continue;
      const comp = [s]; mark[s] = 2;
      for (let k = 0; k < comp.length; k++) { const i = comp[k], x = i % w, y = (i / w) | 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && !mark[j] && !op(j)) { mark[j] = 2; comp.push(j); } }
      if (comp.length > max) continue;
      // 바깥에서 안쪽으로: 이웃 가운데 가장 많은 색으로 한 칸씩
      let left = comp.slice();
      for (let pass = 0; pass < 16 && left.length; pass++) {
        const next = [], put = [];
        for (const i of left) {
          const x = i % w, y = (i / w) | 0, cnt = new Map();
          for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && op(j)) { const k = (d[j * 4] << 16) | (d[j * 4 + 1] << 8) | d[j * 4 + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
          if (!cnt.size) { next.push(i); continue; }
          let best = -1, bn = 0; for (const [k, n] of cnt) if (n > bn) { bn = n; best = k; }
          put.push([i, best]);
        }
        for (const [i, k] of put) { d[i * 4] = k >> 16 & 255; d[i * 4 + 1] = k >> 8 & 255; d[i * 4 + 2] = k & 255; d[i * 4 + 3] = 255; }
        left = next;
      }
    }
  }
  G.gfx = { canvas, ctx, brush, outline, flipX, silhouette, tint, digits, digitsWidth, ramp, fillHoles };
})();
