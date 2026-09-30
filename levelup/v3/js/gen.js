/* 지도 짓기 도구: 높이에서 절벽 면 만들기 · 계단 · 사물 흩뿌리기 · 길 파기 · 방 · 연결 검사
   지역 · 마을 · 던전 파일(world/*.js)이 이 도구로 지도를 짓는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O;

  /** 높이 차가 나는 곳의 남쪽 칸들을 절벽 면으로 바꾼다. 높이 차 n이면 면이 n줄 */
  function cliffs(m) {
    const { w, h } = m;
    const faces = [];
    for (let x = 0; x < w; x++) for (let y = 1; y < h; y++) {
      const up = m.hgt[(y - 1) * w + x], here = m.hgt[y * w + x];
      if (m.ter[(y - 1) * w + x] === T.CLIFF) continue;
      if (up > here) {
        const d = up - here;
        for (let k = 0; k < d && y + k < h; k++) faces.push([x, y + k, here]);
      }
    }
    for (const [x, y, hh] of faces) { const i = y * w + x; if (m.noCliff && m.noCliff.has(i)) continue; if (m.ter[i] !== T.STAIRS) { m.ter[i] = T.CLIFF; m.hgt[i] = Math.min(m.hgt[i], hh); m.obj[i] = 0; } }
  }
  /** (x, y)에서 시작하는 면 줄을 계단으로. 폭 w칸 */
  function stairs(m, x, y, wdt) {
    for (let dx = 0; dx < (wdt || 1); dx++) {
      let yy = y;
      while (m.T(x + dx, yy) === T.CLIFF) { m.ter[m.i(x + dx, yy)] = T.STAIRS; m.obj[m.i(x + dx, yy)] = 0; yy++; }
    }
  }
  /** 면 위치를 찾아 계단을 놓는다: 고원(x, y)의 남쪽 가장자리 */
  function stairsBelow(m, x, y, wdt) {
    let yy = y;
    while (yy < m.h && m.T(x, yy) !== T.CLIFF) yy++;
    if (yy < m.h) stairs(m, x, yy, wdt);
  }
  function fill(m, x0, y0, w, h, t, hh) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) continue;
      const i = m.i(x, y);
      if (t != null) m.ter[i] = t;
      if (hh != null) m.hgt[i] = hh;
    }
  }
  function ellipse(m, cx, cy, rx, ry, t, hh, seed) {
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      if (!m.inb(x, y)) continue;
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const wob = seed != null ? (U.vnoise(x / 3, y / 3, seed) - 0.5) * 0.5 : 0;
      if (dx * dx + dy * dy <= 1 + wob) { const i = m.i(x, y); if (t != null) m.ter[i] = t; if (hh != null) m.hgt[i] = hh; }
    }
  }
  /** 두 점 사이에 굽은 길 */
  function path(m, pts, t, wdt, seed) {
    wdt = wdt || 1;
    for (let k = 1; k < pts.length; k++) {
      let [x, y] = pts[k - 1]; const [tx, ty] = pts[k];
      const r = U.rng(U.hash(seed || 'p') + k);
      let guard = 0;
      while ((Math.round(x) !== tx || Math.round(y) !== ty) && guard++ < 2000) {
        const dx = tx - x, dy = ty - y;
        if (Math.abs(dx) > Math.abs(dy) ? r() < 0.8 : r() < 0.2) x += Math.sign(dx); else y += Math.sign(dy);
        for (let a = -Math.floor((wdt - 1) / 2); a <= Math.floor(wdt / 2); a++) for (let b = -Math.floor((wdt - 1) / 2); b <= Math.floor(wdt / 2); b++) {
          const xx = Math.round(x) + a, yy = Math.round(y) + b;
          if (!m.inb(xx, yy)) continue;
          const i = m.i(xx, yy);
          const cur = m.ter[i];
          if (cur === T.CLIFF || cur === T.STAIRS || cur === T.WALL) continue;
          if (cur === T.WATER || cur === T.DEEP) m.ter[i] = T.BRIDGE; else m.ter[i] = t;
          m.obj[i] = 0;
        }
      }
    }
  }
  /** 사물 흩뿌리기: 조건 함수가 참인 칸에 확률로 */
  function scatter(m, x0, y0, w, h, o, p, ok, seed) {
    const r = U.rng(U.hash(seed || ('s' + o)));
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) continue;
      const i = m.i(x, y);
      if (m.obj[i] || r() > p) continue;
      if (ok && !ok(x, y, m.ter[i], m.hgt[i])) continue;
      m.obj[i] = o;
    }
  }
  /** 잡음 무리: 숲처럼 뭉쳐서 */
  function clump(m, x0, y0, w, h, o, dens, ok, seed, scale) {
    const s = U.hash(seed || 'c') % 10000;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) continue;
      const i = m.i(x, y);
      if (m.obj[i]) continue;
      const v = U.fbm(x / (scale || 7), y / (scale || 7), s, 3);
      if (v < 1 - dens) continue;
      if (U.noise2(x, y, s) > 0.62 + (v - (1 - dens)) * 0.4) continue;
      if (ok && !ok(x, y, m.ter[i], m.hgt[i])) continue;
      m.obj[i] = o;
    }
  }
  /** 걸을 수 있는 칸끼리 이어졌는지 (높이 · 계단 고려). 시작점에서 닿는 칸 집합 */
  function reach(m, sx, sy) {
    const seen = new Uint8Array(m.w * m.h);
    const st = [[sx, sy]];
    seen[m.i(sx, sy)] = 1;
    const ent = { onStairs: false };
    while (st.length) {
      const [x, y] = st.pop();
      const t = m.T(x, y), h = m.H(x, y), onS = t === T.STAIRS;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!m.inb(nx, ny) || seen[m.i(nx, ny)]) continue;
        if (m.blocked(nx, ny, ent)) continue;
        const nt = m.T(nx, ny);
        if (!(onS || nt === T.STAIRS || m.H(nx, ny) === h)) continue;
        if (onS && nt !== T.STAIRS && dx !== 0 && m.H(nx, ny) !== h) continue;
        seen[m.i(nx, ny)] = 1;
        st.push([nx, ny]);
      }
    }
    return seen;
  }

  /** 절벽에 동굴 입구: 면 칸을 땅으로 남기고(절벽 계산에서 빼고) 문을 단다 */
  function caveMouth(m, x, y, w) {
    m.noCliff = m.noCliff || new Set();
    for (let dx = 0; dx < (w || 2); dx++) { const i = m.i(x + dx, y); m.noCliff.add(i); m.ter[i] = T.DIRT; m.obj[i] = 0; }
  }
  G.gen = { cliffs, stairs, stairsBelow, fill, ellipse, path, scatter, clump, reach, caveMouth };
})();
