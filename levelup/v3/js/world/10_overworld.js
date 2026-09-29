/* 이리스 대륙: 320×240칸 하나로 이어진 넓은 땅.
   1) 지역 나누기(휘어진 보로노이) 2) 바다 · 구름바다 · 강 · 호수 3) 높이(화산 · 설산 · 고원 · 하늘섬) 4) 절벽
   5) 마을 자리 평탄화 6) 길: A*로 잇고 높이가 바뀌면 계단, 물이면 다리 7) 숲 · 풀 · 바위 · 지역 사물 8) 이야기 파일들의 갈고리(hooks)
   적은 가까운 칸 묶음에서만 나타났다 사라진다(spawn cells). 밤낮 · 날씨 · 지역 음악 · 가 본 곳 안개도 여기서. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs, GN = G.gen, E = G.ent;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const W = 320, H = 240;
  const RG = (n) => TL.REGIONS.indexOf(n);
  const VX = 46, VY = 170;   // 화산

  const OW = {
    W, H, hooks: [], towns: {}, poi: {}, ready: false,
    NAMES: { green: '그린 — 새싹의 골짜기', red: '레드 — 불꽃과 쇠', blue: '블루 — 파도와 지혜', yellow: '옐로 — 황금과 모래', purple: '퍼플 — 해 질 녘의 숲', rainbow: '무지개 — 하늘섬', white: '화이트 — 눈과 기도', gray: '그레이 — 색을 잃은 땅', black: '블랙 — 영원한 밤', colorful: '알록달록 곶' },
    SHORT: { green: '그린', red: '레드', blue: '블루', yellow: '옐로', purple: '퍼플', rainbow: '무지개', white: '화이트', gray: '그레이', black: '블랙', colorful: '알록달록' },
    MUSIC: { green: 'field', red: 'red', blue: 'blue', yellow: 'yellow', purple: 'forest', rainbow: 'rainbow', white: 'white', gray: 'gray', black: 'black', colorful: 'colorful' },
  };
  // 지역 중심 (칸)
  const SEEDS = [['green', 96, 182, 1], ['red', 42, 190, 1.05], ['blue', 172, 202, 1], ['yellow', 264, 150, 1.05], ['purple', 150, 120, 1], ['rainbow', 162, 30, 0.8], ['white', 66, 40, 1.05], ['gray', 30, 110, 0.95], ['black', 262, 54, 1], ['colorful', 298, 214, 0.75]];
  const BASEH = { green: 0, red: 0, blue: 0, yellow: 0, purple: 1, rainbow: 4, white: 2, gray: 0, black: 1, colorful: 0 };
  // 마을 자리 (칸): 이야기 파일이 건물을 채운다
  const TOWNS = {
    green: { x: 82, y: 170, w: 34, h: 24 }, red: { x: 36, y: 200, w: 30, h: 22 }, blue: { x: 160, y: 204, w: 36, h: 24 }, yellow: { x: 252, y: 142, w: 38, h: 26 },
    purple: { x: 124, y: 96, w: 32, h: 24 }, rainbow: { x: 150, y: 18, w: 34, h: 24 }, white: { x: 56, y: 28, w: 32, h: 22 }, gray: { x: 18, y: 100, w: 30, h: 22 },
    black: { x: 250, y: 44, w: 34, h: 24 }, colorful: { x: 284, y: 204, w: 28, h: 22 },
  };
  OW.towns = TOWNS;

  function regionAt(x, y) {
    const wx = x + (U.fbm(x / 38, y / 38, 11, 3) - 0.5) * 46, wy = y + (U.fbm(x / 38, y / 38, 23, 3) - 0.5) * 46;
    let best = 0, bd = 1e9;
    SEEDS.forEach(([n, sx, sy, wt], i) => { const d = U.dist(wx, wy, sx, sy) / wt; if (d < bd) { bd = d; best = i; } });
    return SEEDS[best][0];
  }

  /* ───────── 짓기 ───────── */
  function build() {
    const m = new G.GameMap({ id: 'world', name: '이리스 대륙', w: W, h: H, region: 0, edge: T.DEEP });
    m.outdoor = true; m.minimap = true; m.miniScale = 1; m.overworld = true;
    const reg = m.reg, ter = m.ter, hgt = m.hgt;
    const N = W * H;
    const regName = new Array(N);
    // 1) 지역
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = regionAt(x, y); regName[y * W + x] = n; reg[y * W + x] = RG(n); }
    const RN = (x, y) => regName[U.clamp(y, 0, H - 1) * W + U.clamp(x, 0, W - 1)];
    // 2) 바다 · 땅
    const sea = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const n = U.fbm(x / 22, y / 22, 31, 3), big = U.fbm(x / 48, y / 48, 37, 2);
      let edge = Math.min(x, W - 1 - x, y * 1.2, (H - 1 - y) * 0.9);
      let coast = 2 + n * 12 + Math.max(0, big - 0.42) * 70;
      // 마을 근처는 땅으로 남긴다
      let nearTown = 99;
      for (const t of Object.values(TOWNS)) nearTown = Math.min(nearTown, Math.max(t.x - x, x - (t.x + t.w), t.y - y, y - (t.y + t.h)));
      if (nearTown < 8) coast = Math.min(coast, 3 + Math.max(0, nearTown) * 1.5);
      if (U.dist(x, y, VX, VY) < 26) coast = Math.min(coast, 3);
      // 남쪽 해안은 들쭉날쭉, 블루 항구에 만
      if (U.dist(x, y, 178, 236) < 14 + n * 6) coast += 20;
      if (U.dist(x, y, 120, 240) < 10 + n * 4) coast += 12;
      // 알록달록 곶: 동남쪽 끝은 바다에 둘러싸인 곶
      if (x > 276 && y > 180) coast = Math.max(coast, 6 + n * 8 + (y > 226 ? 6 : 0));
      if (x > 300 && y > 150 && y < 188) coast += 14;
      // 무지개(하늘섬): 둘레가 구름바다
      if (RN(x, y) === 'rainbow') { const d = U.dist(x, y, 164, 32); if (d > 26 + n * 10) sea[i] = 2; }
      if (edge < coast) sea[i] = sea[i] || 1;
    }
    for (let i = 0; i < N; i++) { ter[i] = sea[i] === 1 ? T.DEEP : sea[i] === 2 ? T.CLOUD : T.GRASS; }
    // 3) 높이
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (sea[i]) { hgt[i] = 0; continue; }
      const n = RN(x, y);
      let h = BASEH[n];
      const f = U.fbm(x / 18, y / 18, 41, 3), f2 = U.fbm(x / 9, y / 9, 43, 2);
      switch (n) {
        case 'green': if (f > 0.64) h = 1; break;
        case 'red': { const d = U.dist(x, y, VX, VY); h = U.clamp(Math.floor(4.4 - d / 7), 0, 4); if (h === 0 && f > 0.66) h = 1; break; }
        case 'blue': if (f > 0.68 && y < 214) h = 1; break;
        case 'yellow': if (f > 0.66) h = 1; if (f > 0.74) h = 2; break;
        case 'purple': if (f > 0.6) h = 2; if (f < 0.3) h = 0; break;
        case 'white': h = 2 + (f > 0.55 ? 1 : 0) + (f > 0.68 && f2 > 0.5 ? 1 : 0); break;
        case 'gray': if (f > 0.64) h = 1; break;
        case 'black': if (f > 0.66) h = 2; break;
        case 'colorful': if (f > 0.7) h = 1; break;
        default: break;
      }
      hgt[i] = h;
    }
    // 작은 섬 같은 높이 덩어리 지우기 (다수결 두 번)
    for (let pass = 0; pass < 2; pass++) {
      const nh = hgt.slice();
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x; if (sea[i]) continue;
        const cnt = {}; let bestH = hgt[i], bc = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const hh = hgt[i + dy * W + dx]; cnt[hh] = (cnt[hh] || 0) + 1; if (cnt[hh] > bc) { bc = cnt[hh]; bestH = hh; } }
        if (bc >= 5) nh[i] = bestH;
      }
      hgt.set(nh);
    }
    // 절벽 면이 한 줄짜리 섬이 되지 않게: 높은 칸 아래 면이 들어갈 자리가 없으면 깎는다
    for (let y = 1; y < H - 4; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const d = hgt[i] - hgt[i + W]; if (d > 0 && sea[i + W]) hgt[i] = hgt[i + W]; }
    // 4) 강 · 호수
    const river = (pts, wd, seed) => {
      for (let k = 1; k < pts.length; k++) {
        const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
        const n = Math.ceil(U.dist(x0, y0, x1, y1));
        for (let s = 0; s <= n; s++) {
          const t = s / n;
          const x = U.lerp(x0, x1, t) + (U.vnoise(s / 8, k, seed) - 0.5) * 6, y = U.lerp(y0, y1, t) + (U.vnoise(s / 8, k + 9, seed) - 0.5) * 6;
          for (let dy = -wd; dy <= wd; dy++) for (let dx = -wd; dx <= wd; dx++) {
            const xx = Math.round(x + dx), yy = Math.round(y + dy);
            if (!m.inb(xx, yy)) continue;
            const d = Math.hypot(dx, dy);
            if (d > wd + 0.3) continue;
            const i = yy * W + xx; if (sea[i]) continue;
            ter[i] = d < wd - 0.8 ? T.DEEP : T.WATER; sea[i] = 3;
          }
        }
      }
    };
    river([[70, 62], [74, 90], [66, 120], [72, 150], [74, 168], [80, 200], [118, 236]], 1.6, 51);  // 설산 → 그린 → 남쪽 바다
    river([[164, 56], [154, 80], [146, 104], [139, 112]], 1.2, 53);                                 // 무지개 폭포 → 거울 호수
    river([[226, 70], [232, 100], [222, 132], [210, 160], [206, 196], [196, 236]], 1.6, 57);       // 블랙 → 옐로와 블루 사이
    const lake = (cx, cy, rx, ry, seed) => { for (let y = cy - ry - 3; y <= cy + ry + 3; y++) for (let x = cx - rx - 3; x <= cx + rx + 3; x++) { if (!m.inb(x, y)) continue; const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + (U.vnoise(x / 3, y / 3, seed) - 0.5) * 0.4; if (d < 1) { const i = y * W + x; ter[i] = d < 0.6 ? T.DEEP : T.WATER; sea[i] = 3; } } };
    lake(138, 112, 7, 5, 61);    // 거울 호수 (퍼플)
    lake(104, 196, 3, 2, 63);    // 그린 연못
    lake(274, 132, 3, 2, 65);    // 사막 오아시스
    lake(82, 22, 5, 3, 67);      // 얼어붙은 호수 (화이트)
    // 물가 높이: 물은 주변 낮은 쪽 높이로
    for (let i = 0; i < N; i++) if (sea[i] === 3) { const x = i % W, y = (i / W) | 0; let mn = 9; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * W + x + dx; if (j >= 0 && j < N && !sea[j]) mn = Math.min(mn, hgt[j]); } hgt[i] = mn === 9 ? 0 : mn; }
    // 5) 마을 자리: 평평하게, 사물 없이
    for (const [n, t] of Object.entries(TOWNS)) {
      const th = BASEH[n] + (n === 'white' ? 0 : 0);
      for (let y = t.y - 2; y < t.y + t.h + 2; y++) for (let x = t.x - 2; x < t.x + t.w + 2; x++) {
        if (!m.inb(x, y)) continue; const i = y * W + x;
        if (sea[i] === 1 || sea[i] === 2) continue;
        hgt[i] = th; if (sea[i] === 3) { ter[i] = T.WATER; } else ter[i] = T.GRASS;
      }
    }
    // 화산 분화구 · 설산 꼭대기
    for (let y = VY - 12; y < VY + 12; y++) for (let x = VX - 12; x < VX + 12; x++) { const d = U.dist(x, y, VX, VY) + (U.vnoise(x / 2, y / 2, 71) - 0.5) * 2; if (d < 3.4 && hgt[y * W + x] === 4) ter[y * W + x] = T.LAVA; }
    // 6) 지형 무늬
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (sea[i] || ter[i] === T.LAVA) continue;
      const n = regName[i];
      const f = U.fbm(x / 12, y / 12, 81, 3), f2 = U.fbm(x / 6, y / 6, 83, 2);
      let t = T.GRASS;
      switch (n) {
        case 'green': t = f2 > 0.7 ? T.DIRT : T.GRASS; break;
        case 'red': t = hgt[i] >= 2 ? (f2 > 0.45 ? T.ASH : T.DIRT) : f > 0.58 ? T.DIRT : T.GRASS; break;
        case 'blue': t = T.GRASS; break;
        case 'yellow': t = f > 0.72 && hgt[i] === 0 ? T.GRASS : T.SAND; break;
        case 'purple': t = f2 > 0.74 ? T.DIRT : T.GRASS; break;
        case 'rainbow': t = f2 > 0.76 ? T.CLOUD : T.GRASS; break;
        case 'white': t = hgt[i] >= 2 ? T.SNOW : f > 0.5 ? T.SNOW : T.GRASS; break;
        case 'gray': t = f > 0.42 ? T.ASH : T.DIRT; break;
        case 'black': t = T.DARK; break;
        case 'colorful': t = T.GRASS; break;
        default: break;
      }
      ter[i] = t;
    }
    // 바다 옆 모래사장
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (sea[i] || hgt[i] > 0) continue;
      let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const j = i + dy * W + dx; if (sea[j] === 1) { near = true; break; } }
      if (near && regName[i] !== 'white' && regName[i] !== 'black' && regName[i] !== 'gray') ter[i] = T.SAND;
      else if (near && regName[i] === 'gray') ter[i] = T.ASH;
    }
    // 무지개섬 구름 계단: 구름바다 칸은 못 지나간다 (구름은 CLOUD, 섬 위 구름 무늬는 GRASS로 되돌림)
    for (let i = 0; i < N; i++) if (sea[i] !== 2 && ter[i] === T.CLOUD) ter[i] = T.GRASS;
    // 7) 절벽
    GN.cliffs(m);
    OW.sea = sea; OW.regName = regName;
    // 8) 길
    roads(m, sea);
    // 9) 마을 바닥
    for (const [n, t] of Object.entries(TOWNS)) paveTown(m, n, t);
    // 10) 사물
    decorate(m, sea, regName);
    // 11) 이야기 갈고리: 건물 · 던전 입구 · 탑 · 이정표 · 숨은 것
    for (const h of OW.hooks) h(m, OW);
    GN.cliffs(m);
    m.markers = [];
    OW.ready = true;
    return m;
  }

  /* ───────── 길: A* (높이는 남북으로만 오르내린다) ───────── */
  const LINKS = [
    ['green', 'red'], ['green', 'blue'], ['green', 'purple'], ['blue', 'colorful'], ['blue', 'yellow'], ['yellow', 'black'], ['purple', 'yellow'], ['purple', 'white'],
    ['gray', 'red'], ['gray', 'white'], ['gray', 'purple'], ['black', 'white'], ['purple', 'rainbow'], ['yellow', 'colorful'],
  ];
  function townCenter(n) { const t = TOWNS[n]; return [t.x + (t.w >> 1), t.y + (t.h >> 1)]; }
  function roads(m, sea) {
    OW.roadTiles = new Uint8Array(W * H);
    OW.stairsAt = [];
    for (const [a, b] of LINKS) {
      const p = astar(m, sea, townCenter(a), townCenter(b));
      if (!p) { console.warn('길 없음', a, b); continue; }
      carve(m, p, a, b);
    }
  }
  function astar(m, sea, [sx, sy], [gx, gy]) {
    const N = W * H;
    const g = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = [];
    const push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = k * 2 + 1, r = l + 1; let s = k; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; };
    const si = sy * W + sx, gi = gy * W + gx;
    g[si] = 0; push(si, 0);
    const hg = m.hgt, tr = m.ter;
    while (heap.length) {
      const [, i] = pop();
      if (i === gi) break;
      if (closed[i]) continue; closed[i] = 1;
      const x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue;
        const j = ny * W + nx; if (closed[j]) continue;
        if (sea[j] === 1 || sea[j] === 2 || tr[j] === T.LAVA) continue;
        // 절벽 면 칸: 남북으로만 지나간다 (계단이 된다)
        let c = 1;
        const tj = tr[j], ti = tr[i];
        if (tj === T.CLIFF || ti === T.CLIFF) { if (dx !== 0) continue; c += 7; }
        else if (hg[j] !== hg[i]) { if (dx !== 0) continue; c += 7; }
        if (tj === T.DEEP) c += 6; else if (tj === T.WATER) c += 2;
        c += (U.noise2(nx, ny, 91) * 0.6);
        if (OW.roadTiles[j]) c *= 0.5;        // 이미 난 길을 좋아한다
        const ng = g[i] + c;
        if (ng < g[j]) { g[j] = ng; came[j] = i; push(j, ng + (Math.abs(nx - gx) + Math.abs(ny - gy)) * 1.05); }
      }
    }
    if (came[gi] < 0) return null;
    const path = []; let k = gi; while (k >= 0) { path.push(k); k = came[k]; }
    return path.reverse();
  }
  function carve(m, path, a, b) {
    const tr = m.ter;
    for (let k = 0; k < path.length; k++) {
      const i = path[k], x = i % W, y = (i / W) | 0;
      const prev = k > 0 ? path[k - 1] : i;
      const vertical = Math.abs(prev - i) === W || (k + 1 < path.length && Math.abs(path[k + 1] - i) === W);
      for (const [dx, dy] of [[0, 0], [1, 0]]) {
        const xx = x + dx, yy = y + dy; if (!m.inb(xx, yy)) continue;
        const j = yy * W + xx;
        if (dx && !vertical && (tr[j] === T.CLIFF)) continue;
        if (tr[j] === T.CLIFF) { tr[j] = T.STAIRS; m.obj[j] = 0; OW.stairsAt.push([xx, yy]); OW.roadTiles[j] = 1; continue; }
        if (tr[j] === T.STAIRS) continue;
        if (dx && m.hgt[j] !== m.hgt[i]) continue;
        if (tr[j] === T.DEEP || tr[j] === T.WATER) tr[j] = T.BRIDGE;
        else if (tr[j] !== T.BRIDGE) tr[j] = regionRoad(OW.regName[j]);
        m.obj[j] = 0; OW.roadTiles[j] = 1;
      }
    }
    // 고원 북쪽 가장자리(면이 없는 쪽)를 오르는 곳: 낮은 칸을 계단으로
    for (let k = 1; k < path.length; k++) {
      const i = path[k], p = path[k - 1];
      if (Math.abs(i - p) !== W) continue;
      if (m.hgt[i] !== m.hgt[p] && tr[i] !== T.STAIRS && tr[p] !== T.STAIRS) {
        const lo = m.hgt[i] < m.hgt[p] ? i : p;
        for (const j of [lo, lo + 1]) if (tr[j] !== T.CLIFF) { tr[j] = T.STAIRS; m.obj[j] = 0; }
      }
    }
    void a; void b;
  }
  function regionRoad(n) { return n === 'yellow' ? T.ROAD : n === 'white' ? T.ROAD : n === 'black' ? T.STONE : n === 'gray' ? T.ROAD : T.DIRT; }

  function paveTown(m, n, t) {
    const road = n === 'yellow' || n === 'black' || n === 'white' || n === 'gray' ? T.STONE : n === 'rainbow' ? T.TILE : T.ROAD;
    const cx = t.x + (t.w >> 1), cy = t.y + (t.h >> 1);
    // 가운데 광장 + 십자 길
    for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 4; x <= cx + 4; x++) setGround(m, x, y, road);
    for (let x = t.x; x < t.x + t.w; x++) { setGround(m, x, cy, road); setGround(m, x, cy + 1, road); }
    for (let y = t.y; y < t.y + t.h; y++) { setGround(m, cx, y, road); setGround(m, cx + 1, y, road); }
    t.plaza = { x: cx, y: cy }; t.road = road;
    OW.poi[n + '_plaza'] = { x: cx, y: cy };
  }
  function setGround(m, x, y, t) { if (!m.inb(x, y)) return; const i = m.i(x, y); if (m.ter[i] === T.DEEP || m.ter[i] === T.CLIFF || m.ter[i] === T.STAIRS) return; m.ter[i] = m.ter[i] === T.WATER ? T.BRIDGE : t; m.obj[i] = 0; }
  function inTown(x, y, pad) { for (const t of Object.values(TOWNS)) if (x >= t.x - pad && y >= t.y - pad && x < t.x + t.w + pad && y < t.y + t.h + pad) return true; return false; }

  /* ───────── 숲 · 풀 · 바위 · 지역 사물 ───────── */
  function decorate(m, sea, regName) {
    const tr = m.ter;
    const rnd = U.rng(1234);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (sea[i] || OW.roadTiles[i] || m.obj[i]) continue;
      const t = tr[i];
      if (t === T.CLIFF || t === T.STAIRS || t === T.BRIDGE || t === T.LAVA || t === T.WATER || t === T.DEEP || t === T.ROAD || t === T.STONE || t === T.TILE) continue;
      if (inTown(x, y, 1)) continue;
      // 길 바로 옆은 비워 둔다
      if (OW.roadTiles[i - 1] || OW.roadTiles[i + 1] || OW.roadTiles[i - W] || OW.roadTiles[i + W]) { if (rnd() < 0.08) m.obj[i] = O.FLOWER; continue; }
      // 절벽 바로 아래 칸은 비움 (면 앞)
      if (tr[i - W] === T.CLIFF) continue;
      const n = regName[i];
      const forest = U.fbm(x / 10, y / 10, 101, 3);
      const r = rnd();
      let o = 0;
      switch (n) {
        case 'green': o = forest > 0.6 ? (r < 0.55 ? O.TREE : r < 0.62 ? O.BUSH : 0) : r < 0.05 ? O.TALL : r < 0.075 ? O.FLOWER : r < 0.085 ? O.BUSH : r < 0.09 ? O.ROCK : 0; break;
        case 'red': o = t === T.ASH ? (r < 0.04 ? O.DEAD : r < 0.07 ? O.ROCK : r < 0.075 ? O.BOULDER : 0) : forest > 0.62 ? (r < 0.4 ? O.TREE : r < 0.46 ? O.DEAD : 0) : r < 0.03 ? O.ROCK : r < 0.05 ? O.TALL : r < 0.055 ? O.BUSH : 0; break;
        case 'blue': o = t === T.SAND ? (r < 0.03 ? O.PALM : r < 0.045 ? O.PEBBLE : 0) : forest > 0.62 ? (r < 0.5 ? O.TREE : r < 0.6 ? O.BUSH : 0) : r < 0.05 ? O.TALL : r < 0.07 ? O.FLOWER : r < 0.075 ? O.REED : 0; break;
        case 'yellow': o = t === T.SAND ? (r < 0.02 ? O.CACTUS : r < 0.03 ? O.ROCK : r < 0.036 ? O.BONES : r < 0.042 ? O.PEBBLE : 0) : r < 0.3 ? O.PALM : r < 0.4 ? O.TALL : 0; break;
        case 'purple': o = forest > 0.5 ? (r < 0.4 ? O.TREE : r < 0.5 ? O.SHROOM : r < 0.55 ? O.BUSH : 0) : r < 0.05 ? O.TALL : r < 0.08 ? O.FLOWER : r < 0.09 ? O.SHROOM : 0; break;
        case 'rainbow': o = forest > 0.62 ? (r < 0.4 ? O.BLOSSOM : 0) : r < 0.1 ? O.FLOWER : r < 0.13 ? O.TALL : 0; break;
        case 'white': o = forest > 0.55 ? (r < 0.5 ? O.SNOWTREE : r < 0.55 ? O.PINE : 0) : r < 0.02 ? O.ICESPIKE : r < 0.035 ? O.ROCK : r < 0.04 ? O.PINE : 0; break;
        case 'gray': o = r < 0.02 ? O.RUBBLE : r < 0.035 ? O.DEAD : r < 0.045 ? O.ROCK : r < 0.05 ? O.PILLAR : r < 0.055 ? O.BONES : 0; break;
        case 'black': o = forest > 0.6 ? (r < 0.35 ? O.DEAD : r < 0.42 ? O.TREE : 0) : r < 0.02 ? O.GRAVE : r < 0.035 ? O.TALL : r < 0.04 ? O.DEAD : 0; break;
        case 'colorful': o = t === T.SAND ? (r < 0.04 ? O.PALM : 0) : forest > 0.64 ? (r < 0.4 ? O.TREE : r < 0.5 ? O.BLOSSOM : 0) : r < 0.1 ? O.FLOWER : r < 0.13 ? O.TALL : 0; break;
        default: break;
      }
      // 물가 갈대 · 연잎
      if (!o && (tr[i + 1] === T.WATER || tr[i - 1] === T.WATER) && r < 0.3 && n !== 'white' && n !== 'gray' && n !== 'black') o = O.REED;
      if (o) m.obj[i] = o;
    }
    for (let i = 0; i < W * H; i++) if (tr[i] === T.WATER && rnd() < 0.05 && ['green', 'blue', 'purple', 'rainbow', 'colorful'].includes(regName[i]) && !OW.roadTiles[i]) m.obj[i] = O.LILY;
    // 블랙: 길가에 가로등
    for (let i = 0; i < W * H; i++) if (OW.roadTiles[i] && regName[i] === 'black' && (i % 7 === 0) && !OW.roadTiles[i + 2] && tr[i + 2] === T.DARK && !m.obj[i + 2]) { m.obj[i + 2] = O.LAMP; m.lights.push({ x: ((i + 2) % W) * TS + 8, y: (((i + 2) / W) | 0) * TS + 2, r: 46, warm: 'rgba(255,210,120,0.18)' }); }
  }

  /* ───────── 빈 칸 찾기 (이야기 파일이 쓴다) ───────── */
  /** (x,y) 가까이에서 조건을 만족하는 빈 칸 */
  function near(m, x, y, ok, r) {
    for (let d = 0; d <= (r || 12); d++) for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
      const xx = x + dx, yy = y + dy;
      if (!m.inb(xx, yy)) continue;
      const i = m.i(xx, yy);
      if (m.blocked(xx, yy)) continue;
      const t = m.ter[i];
      if (t === T.CLIFF || t === T.STAIRS || t === T.WATER || t === T.DEEP || t === T.LAVA || t === T.CLOUD || t === T.BRIDGE) continue;
      if (ok && !ok(xx, yy, t, m.hgt[i])) continue;
      return [xx, yy];
    }
    return [x, y];
  }
  /** 칸들을 비우고 평평하게 (건물 자리) */
  function clear(m, x0, y0, w, h, hh, t) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) continue; const i = m.i(x, y);
      m.obj[i] = 0; if (hh != null) m.hgt[i] = hh; if (t != null) m.ter[i] = t;
      else if (m.ter[i] === T.CLIFF || m.ter[i] === T.DEEP || m.ter[i] === T.WATER) m.ter[i] = T.GRASS;
    }
  }

  /* ───────── 적: 가까운 칸 묶음에서만 ───────── */
  const CELL = 16;
  const TABLE = {
    green: [['slime', 4], ['bat', 1], ['bigslime', 0.4], ['boar', 1], ['plant', 0.8]],
    red: [['boar', 3], ['bomber', 2], ['wisp', 1.5], ['golem', 0.4], ['bat', 1], ['bandit', 1]],
    blue: [['crab', 3], ['octo', 2], ['slime', 1], ['bandit', 1.5], ['plant', 1]],
    yellow: [['worm', 2.5], ['bandit', 2], ['crab', 1], ['wisp', 1], ['turret', 0.5], ['wolf', 1]],
    purple: [['mage', 1.5], ['ghost', 2], ['plant', 2], ['bigslime', 1], ['bug', 1.5], ['wolf', 1]],
    rainbow: [['bug', 3], ['bat', 1], ['wisp', 1], ['bigslime', 1]],
    white: [['icewisp', 3], ['wolf', 3], ['golem', 1], ['hollow', 0.5]],
    gray: [['drone', 3], ['hollow', 2], ['golem', 1.5], ['bomber', 1.5], ['turret', 1]],
    black: [['ghost', 3], ['hollow', 2.5], ['shade', 1.5], ['bat', 1.5], ['knight', 1]],
    colorful: [['bomber', 2], ['drone', 2], ['crab', 1.5], ['slime', 1]],
  };
  const TIERS = { green: 0, red: 1, blue: 2, yellow: 3, purple: 4, rainbow: 5, white: 6, gray: 7, black: 8, colorful: 9 };
  function pickFoe(n, r) { const tb = TABLE[n] || TABLE.green; let s = tb.reduce((a, x) => a + x[1], 0) * r; for (const [t, w] of tb) { s -= w; if (s <= 0) return t; } return tb[0][0]; }
  /** 칸 묶음마다 고정된 적 무리 (지도를 지을 때 한 번 계산) */
  function planSpawns(m) {
    const cells = [];
    const rnd = U.rng(777);
    for (let cy = 0; cy < H / CELL; cy++) for (let cx = 0; cx < W / CELL; cx++) {
      const list = [];
      const tries = 3;
      for (let k = 0; k < tries; k++) {
        const x = cx * CELL + Math.floor(rnd() * CELL), y = cy * CELL + Math.floor(rnd() * CELL);
        if (!m.inb(x, y) || inTown(x, y, 8)) continue;
        const i = m.i(x, y);
        const t = m.ter[i];
        const n = OW.regName[i];
        const r = rnd();
        if (r > 0.55) continue;
        const type = pickFoe(n, rnd());
        const water = type === 'octo';
        if (water ? t !== T.WATER && t !== T.DEEP : (m.blocked(x, y) || t === T.WATER || t === T.DEEP || t === T.CLIFF || t === T.STAIRS || t === T.LAVA || t === T.CLOUD || OW.roadTiles[i])) continue;
        const n2 = type === 'bug' || type === 'wolf' ? 3 : type === 'slime' ? 2 : 1;
        for (let j = 0; j < n2; j++) list.push({ type, x: x * TS + 8 + (j - 1) * 14, y: y * TS + 12 + (j % 2) * 10, tier: TIERS[n] });
      }
      cells.push(list);
    }
    OW.cells = cells;
  }
  const live = new Map();   // 칸 묶음 번호 → [적들]
  let spawnT = 0;
  function tickSpawns(dt) {
    const Wd = G.world, m = Wd.map;
    if (!m || !m.overworld || !OW.cells) return;
    spawnT -= dt; if (spawnT > 0) return; spawnT = 0.5;
    const p = Wd.player; const pcx = Math.floor(p.x / TS / CELL), pcy = Math.floor(p.y / TS / CELL);
    const cw = W / CELL;
    const want = new Set();
    for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) { const cx = pcx + dx, cy = pcy + dy; if (cx >= 0 && cy >= 0 && cx < cw && cy < H / CELL) want.add(cy * cw + cx); }
    const scale = G.story && G.story.foeScale ? G.story.foeScale() : 0;
    for (const k of want) if (!live.has(k)) {
      const cx = k % cw, cy = (k / cw) | 0;
      const near = Math.abs(cx - pcx) <= 0 && Math.abs(cy - pcy) <= 0;
      if (near && !OW.firstSpawn) continue;       // 바로 옆에서 갑자기 생기지 않게
      const list = OW.cells[k].filter((s) => U.dist(s.x, s.y, p.x, p.y) > 150 || !OW.firstSpawn).map((s) => { const e = G.foes.spawn(s.type, s.x, s.y, { tier: Math.max(s.tier, scale) }); e.cell = k; return e; });
      live.set(k, list);
    }
    OW.firstSpawn = true;
    for (const [k, list] of live) if (!want.has(k)) { for (const e of list) if (!e.dead && !e.aggro) e.dead = true; live.delete(k); }
  }
  function resetSpawns() { live.clear(); OW.firstSpawn = false; }

  /* ───────── 밤낮 · 날씨 · 음악 · 지역 이름 ───────── */
  const DAY = 720;
  G.story = G.story || {};
  G.story.nightFactor = function () {
    const s = G.state; const m = G.world.map;
    if (m && m.overworld) { const n = OW.regName[m.i(U.clamp(Math.floor(G.world.player.x / TS), 0, W - 1), U.clamp(Math.floor(G.world.player.y / TS), 0, H - 1))]; if (n === 'black') return 1; }
    const k = ((s.t + DAY * 0.3) % DAY) / DAY;   // 0 새벽 … 1
    if (k < 0.6) return 0;
    if (k < 0.7) return (k - 0.6) / 0.1;
    if (k < 0.92) return 1;
    return 1 - (k - 0.92) / 0.08;
  };
  OW.regionOf = function (x, y) { return OW.regName ? OW.regName[U.clamp(y, 0, H - 1) * W + U.clamp(x, 0, W - 1)] : 'green'; };
  OW.weatherAt = function (p) {
    const n = OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS));
    const s = G.state, k = Math.floor(s.t / 90) % 5;
    if (n === 'white') return 'snow';
    if (n === 'gray') return 'ash';
    if (n === 'red' && U.dist(p.x / TS, p.y / TS, VX, VY) < 30) return 'ash';
    if (n === 'yellow') return k === 2 ? 'dust' : null;
    if (n === 'purple') return 'spores';
    if (n === 'rainbow') return 'petals';
    if (n === 'blue') return k === 3 ? 'rain' : null;
    if (n === 'green') return k === 1 ? 'leaves' : null;
    if (n === 'black') return 'stars';
    return null;
  };
  let lastReg = null, regT = 0;
  OW.tick = function (dt) {
    const Wd = G.world, m = Wd.map;
    if (!m || !m.overworld) { lastReg = null; return; }
    tickSpawns(dt);
    fog(m, Wd.player);
    regT -= dt;
    if (regT > 0) return; regT = 0.4;
    const p = Wd.player;
    const n = OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS));
    if (n !== lastReg) {
      const first = lastReg === null;
      lastReg = n;
      if (!G.script.running && !(G.script.battle)) {
        const mus = G.story.musicFor ? G.story.musicFor(n) : OW.MUSIC[n];
        if (G.audio && mus) G.audio.music(mus);
        if (!first || !G.state.flags['seen_reg:' + n]) { G.cine.area(OW.NAMES[n].split(' — ')[0], OW.NAMES[n].split(' — ')[1] || ''); G.state.flags['seen_reg:' + n] = true; }
      }
    }
    m.weatherAt = OW.weatherAt;
  };

  /* ───────── 가 본 곳 (8×8칸 단위 안개) ───────── */
  const FC = 8;
  function fogKey() { return 'fog:world'; }
  let lastFog = '';
  function fog(m, p) {
    const s = G.state;
    const fx = Math.floor(p.x / TS / FC), fy = Math.floor(p.y / TS / FC);
    if (lastFog === fx + ',' + fy && s.flags[fogKey()]) return;
    lastFog = fx + ',' + fy;
    const cols = Math.ceil(W / FC);
    let f = s.flags[fogKey()];
    if (!f || f.length !== cols * Math.ceil(H / FC)) f = s.flags[fogKey()] = '0'.repeat(cols * Math.ceil(H / FC));
    let changed = false;
    const arr = f.split('');
    for (let dy = -2; dy <= 2; dy++) for (let dx = -3; dx <= 3; dx++) { const x = fx + dx, y = fy + dy; if (x < 0 || y < 0 || x >= cols || y >= Math.ceil(H / FC)) continue; const k = y * cols + x; if (arr[k] !== '1') { arr[k] = '1'; changed = true; } }
    if (changed) { s.flags[fogKey()] = arr.join(''); m.fogDirty = true; }
  }
  OW.fogCanvas = function (m) {
    if (m.fogImg && !m.fogDirty) return m.fogImg;
    const c = m.fogImg || G.gfx.canvas(W, H); const g = c.getContext('2d');
    g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(10,8,20,0.88)';
    const f = G.state.flags[fogKey()] || ''; const cols = Math.ceil(W / FC);
    for (let y = 0; y < Math.ceil(H / FC); y++) for (let x = 0; x < cols; x++) if (f[y * cols + x] !== '1') g.fillRect(x * FC, y * FC, FC, FC);
    m.fogImg = c; m.fogDirty = false;
    return c;
  };

  /* ───────── 등록 ───────── */
  G.build.def('world', {
    build() {
      const m = build();
      planSpawns(m);
      m.fog = true; m.fogCanvas = () => OW.fogCanvas(m);
      m.weatherAt = OW.weatherAt;
      return m;
    },
    ents(m, Wd) { resetSpawns(); if (OW.ents) for (const f of OW.ents) f(m, Wd); },
  });
  OW.near = near; OW.clear = clear; OW.regionAt = regionAt; OW.inTown = inTown; OW.TABLE = TABLE; OW.TIERS = TIERS; OW.ents = [];
  OW.tp = (x, y) => ({ x: x * TS + 8, y: y * TS + 12 });
  G.ow = OW;
})();
