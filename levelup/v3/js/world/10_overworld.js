/* 이리스 대륙: 320×240칸 하나로 이어진 넓은 땅.
   1) 지역 나누기(휘어진 보로노이) 2) 바다 · 구름바다 · 강 · 호수 3) 높이(화산 · 설산 · 고원 · 하늘섬) 4) 절벽
   5) 마을 자리 평탄화 6) 길: A*로 잇고 높이가 바뀌면 계단, 물이면 다리 7) 숲 · 풀 · 바위 · 지역 사물 8) 이야기 파일들의 갈고리(hooks)
   적은 가까운 칸 묶음에서만 나타났다 사라진다(spawn cells). 밤낮 · 날씨 · 지역 음악 · 가 본 곳 안개도 여기서. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs, GN = G.gen, E = G.ent;
  const T = TL.T, O = OB.O, TS = TL.TS;
  // 대륙 크기: 옛 좌표(400×300)의 땅을 SC배로 넓힌다. 마을은 크기 그대로 통째로 옮기고(둘레 RIG칸까지 모양 유지),
  // 마을과 마을 사이 들판 · 숲 · 산이 늘어난다. 이야기 파일의 옛 좌표는 OW.P(x, y)로 새 좌표가 된다.
  const SC = 1.4;
  const WO = 400, HO = 300;
  const W = Math.round(WO * SC), H = Math.round(HO * SC);
  const W0 = 320, H0 = 240;
  const RG = (n) => TL.REGIONS.indexOf(n);
  const VX = 46, VY = 170;   // 화산

  const OW = {
    W, H, hooks: [], towns: {}, poi: {}, ready: false,
    NAMES: { green: '그린 — 새싹의 골짜기', mist: '안개 늪 — 가라앉은 것들의 물가', amber: '단풍 협곡 — 메아리가 사는 골짜기', red: '레드 — 불꽃과 쇠', blue: '블루 — 파도와 지혜', yellow: '옐로 — 황금과 모래', purple: '퍼플 — 해 질 녘의 숲', rainbow: '무지개 — 하늘섬', white: '화이트 — 눈과 기도', gray: '그레이 — 색을 잃은 땅', black: '블랙 — 영원한 밤', colorful: '알록달록 곶' },
    SHORT: { green: '그린', mist: '안개 늪', amber: '단풍 협곡', red: '레드', blue: '블루', yellow: '옐로', purple: '퍼플', rainbow: '무지개', white: '화이트', gray: '그레이', black: '블랙', colorful: '알록달록' },
    MUSIC: { green: 'field', mist: 'dread', amber: 'field', red: 'red', blue: 'blue', yellow: 'yellow', purple: 'forest', rainbow: 'rainbow', white: 'white', gray: 'gray', black: 'black', colorful: 'colorful' },
  };
  // 지역 중심 (칸)
  const SEEDS = [['green', 96, 182, 1], ['red', 42, 190, 1.05], ['blue', 172, 202, 1], ['yellow', 264, 150, 1.05], ['purple', 150, 120, 1], ['rainbow', 162, 30, 0.8], ['white', 66, 40, 1.05], ['gray', 30, 110, 0.95], ['black', 262, 54, 1], ['colorful', 298, 214, 0.75], ['mist', 358, 112, 1.0], ['amber', 150, 280, 0.8]];
  const BASEH = { mist: 0, amber: 1, green: 0, red: 0, blue: 0, yellow: 0, purple: 1, rainbow: 4, white: 2, gray: 0, black: 1, colorful: 0 };
  // 마을 자리 (칸): 이야기 파일이 건물을 채운다
  const TOWNS = {
    green: { x: 82, y: 170, w: 34, h: 24 }, red: { x: 36, y: 200, w: 30, h: 22 }, blue: { x: 160, y: 204, w: 36, h: 24 }, yellow: { x: 252, y: 142, w: 38, h: 26 },
    purple: { x: 124, y: 96, w: 32, h: 24 }, rainbow: { x: 150, y: 18, w: 34, h: 24 }, white: { x: 56, y: 28, w: 32, h: 22 }, gray: { x: 18, y: 100, w: 30, h: 22 },
    black: { x: 250, y: 44, w: 34, h: 24 }, colorful: { x: 284, y: 204, w: 28, h: 22 },
    mist: { x: 342, y: 100, w: 30, h: 22 }, amber: { x: 132, y: 262, w: 32, h: 22 },
  };
  // 옛 마을 자리 → 새 자리 (가운데를 SC배, 크기는 그대로)
  const TOWNS0 = {};
  for (const [n, t] of Object.entries(TOWNS)) {
    TOWNS0[n] = Object.assign({}, t);
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    t.x = Math.round(t.x + cx * (SC - 1)); t.y = Math.round(t.y + cy * (SC - 1));
  }
  OW.towns = TOWNS; OW.towns0 = TOWNS0; OW.SC = SC;
  /* 옛 좌표 → 새 좌표. 마을 둘레(RIG칸)는 마을과 똑같이 옮기고, 멀리는 SC배, 그 사이는 부드럽게 */
  // 셰퍼드 보간: 마을 상자 안은 그 마을의 옮김 그대로, 멀어질수록 SC배(배경)에 가까워진다
  const QP = 3, RB = 22, WB = 1 / Math.pow(RB, QP);
  const TW = Object.entries(TOWNS0).map(([n, t]) => ({ x0: t.x, y0: t.y, x1: t.x + t.w, y1: t.y + t.h, dx: TOWNS[n].x - t.x, dy: TOWNS[n].y - t.y }));
  function disp(x, y) {
    let sw = WB, sx = (SC - 1) * x * WB, sy = (SC - 1) * y * WB;
    for (const t of TW) {
      const d = Math.max(t.x0 - x, x - t.x1, t.y0 - y, y - t.y1, 0);
      if (d === 0) return [t.dx, t.dy];
      const v = 1 / (d * d * d); sw += v; sx += v * t.dx; sy += v * t.dy;
    }
    return [sx / sw, sy / sw];
  }
  function fwd(x, y) { const [dx, dy] = disp(x, y); return [x + dx, y + dy]; }
  /** 새 좌표 → 옛 좌표 (뉴턴법) */
  function inv(X, Y) {
    let x = X / SC, y = Y / SC;
    for (let k = 0; k < 20; k++) {
      const [fx, fy] = fwd(x, y); const ex = X - fx, ey = Y - fy;
      if (ex * ex + ey * ey < 1e-4) break;
      const h = 0.05, [ax, ay] = fwd(x + h, y), [bx, by] = fwd(x, y + h);
      const a = (ax - fx) / h, c = (ay - fy) / h, b = (bx - fx) / h, d = (by - fy) / h, det = a * d - b * c;
      let sx, sy;
      if (Math.abs(det) > 1e-6) { sx = (d * ex - b * ey) / det; sy = (-c * ex + a * ey) / det; } else { sx = ex / SC; sy = ey / SC; }
      const L = Math.hypot(sx, sy); if (L > 6) { sx *= 6 / L; sy *= 6 / L; }
      x += sx; y += sy;
    }
    return [x, y];
  }
  /** 마을 기준 옮김: 그 마을과 똑같이 (마을 가까운 옛 좌표에) */
  OW.T = (n, x, y) => [x + TOWNS[n].x - TOWNS0[n].x, y + TOWNS[n].y - TOWNS0[n].y];
  OW.P = (x, y) => { const [X, Y] = fwd(x, y); return [Math.round(X), Math.round(Y)]; };
  OW.pt = (x, y) => { const [X, Y] = OW.P(x, y); return { x: X, y: Y }; };
  OW.PX = (x, y) => OW.P(x, y)[0]; OW.PY = (x, y) => OW.P(x, y)[1];
  OW.px = (x, y) => OW.P(x, y)[0] * TS + 8; OW.py = (x, y) => OW.P(x, y)[1] * TS + 12;   // 옛 칸 → 새 픽셀
  OW.inv = inv; OW.fwd = fwd;
  const VP = OW.P(VX, VY);

  /** 점과 선분 사이 거리 */
  function segD(px, py, ax, ay, bx, by) { const vx = bx - ax, vy = by - ay, t = U.clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1); return Math.hypot(px - ax - vx * t, py - ay - vy * t); }
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
    // 새 칸마다 옛 좌표 (지형 공식은 옛 좌표로 계산한다 — 같은 땅이 넓어진다)
    const OX = new Float32Array(N), OY = new Float32Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const [ox, oy] = inv(x, y); OX[y * W + x] = ox; OY[y * W + x] = oy; }
    OW.OX = OX; OW.OY = OY;
    // 1) 지역
    for (let i = 0; i < N; i++) { const n = regionAt(OX[i], OY[i]); regName[i] = n; reg[i] = RG(n); }
    const RN = (x, y) => regName[U.clamp(y, 0, H - 1) * W + U.clamp(x, 0, W - 1)];
    TL.regionFields(m, 5);          // 지역 경계에서 빛깔을 섞을 흐린 장
    // 2) 바다 · 땅
    const sea = new Uint8Array(N);
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const i = Y * W + X, x = OX[i], y = OY[i];
      const n = U.fbm(x / 22, y / 22, 31, 3), big = U.fbm(x / 48, y / 48, 37, 2);
      const oldLand = x < W0 && y < H0;
      let edge = oldLand ? Math.min(x, W0 - 1 - x, y * 1.2, (H0 - 1 - y) * 0.9) : -99;
      let coast = 2 + n * 12 + Math.max(0, big - 0.42) * 70;
      // 마을 근처는 땅으로 남긴다
      let nearTown = 99;
      for (const t of Object.values(TOWNS0)) nearTown = Math.min(nearTown, Math.max(t.x - x, x - (t.x + t.w), t.y - y, y - (t.y + t.h)));
      if (nearTown < 8) coast = Math.min(coast, 3 + Math.max(0, nearTown) * 1.5);
      if (U.dist(x, y, VX, VY) < 26) coast = Math.min(coast, 3);
      // 남쪽 해안은 들쭉날쭉, 블루 항구에 만
      if (U.dist(x, y, 178, 236) < 14 + n * 6) coast += 20;
      if (U.dist(x, y, 120, 240) < 10 + n * 4) coast += 12;
      // 알록달록 곶: 동남쪽 끝은 바다에 둘러싸인 곶
      if (x > 276 && y > 180) coast = Math.max(coast, 6 + n * 8 + (y > 226 ? 6 : 0));
      if (x > 300 && y > 150 && y < 188) coast += 14;
      // 무지개(하늘섬): 둘레가 구름바다
      if (regName[i] === 'rainbow') { const d = U.dist(x, y, 164, 32); if (d > 26 + n * 10) sea[i] = 2; }
      if (edge < coast) sea[i] = sea[i] || 1;
      // 새 땅: 동쪽 안개 늪(섬 같은 큰 땅) · 남쪽 단풍 협곡, 좁은 목(지협)으로 옛 땅과 잇는다
      const nb = (U.vnoise(x / 9, y / 9, 131) - 0.5) * 0.28 + (U.vnoise(x / 3, y / 3, 133) - 0.5) * 0.08;
      const mistD = Math.hypot((x - 360) / 40, (y - 114) / 78) + nb;
      const amberD = Math.hypot((x - 152) / 108, (y - 274) / 24) + nb;
      const neckM = segD(x, y, 290, 104, 330, 110) < 5 + nb * 8;        // 블랙 · 옐로 사이 → 안개 늪
      const neckA = segD(x, y, 140, 208, 146, 256) < 4.5 + nb * 8;      // 그린 · 블루 사이 → 단풍 협곡
      const neckA2 = segD(x, y, 54, 216, 70, 262) < 4 + nb * 6;          // 레드 남쪽 → 단풍 협곡 서쪽
      if (mistD < 1 || amberD < 1 || neckM || neckA || neckA2) { if (sea[i] === 1) sea[i] = 0; if (!oldLand || neckM || neckA || neckA2) sea[i] = sea[i] === 2 ? 2 : 0; }
      else if (!oldLand) sea[i] = 1;
      if (X < 2 || Y < 2 || X > W - 3 || Y > H - 3) sea[i] = 1;
    }
    for (let i = 0; i < N; i++) { ter[i] = sea[i] === 1 ? T.DEEP : sea[i] === 2 ? T.CLOUD : T.GRASS; }
    // 3) 높이
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const i = Y * W + X; if (sea[i]) { hgt[i] = 0; continue; }
      const x = OX[i], y = OY[i];
      const n = regName[i];
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
        case 'mist': h = f > 0.72 ? 1 : 0; break;
        case 'amber': { const ridge = Math.abs(U.fbm(x / 26, y / 26, 141, 3) - 0.5); h = ridge < 0.05 ? 0 : f > 0.62 ? 3 : f > 0.5 ? 2 : 1; break; }   // 협곡: 등성이 사이로 깊은 골
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
    const river = (pts0, wd, seed) => {
      const pts = pts0.map(([x, y]) => fwd(x, y));
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
    const lake = (cx0, cy0, rx, ry, seed) => {
      const [cx, cy] = OW.P(cx0, cy0); for (let y = cy - ry - 3; y <= cy + ry + 3; y++) for (let x = cx - rx - 3; x <= cx + rx + 3; x++) { if (!m.inb(x, y)) continue; const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + (U.vnoise(x / 3, y / 3, seed) - 0.5) * 0.4; if (d < 1) { const i = y * W + x; ter[i] = d < 0.6 ? T.DEEP : T.WATER; sea[i] = 3; } } };
    lake(138, 112, 7, 5, 61);    // 거울 호수 (퍼플)
    lake(104, 196, 3, 2, 63);    // 그린 연못
    lake(274, 132, 3, 2, 65);    // 사막 오아시스
    lake(82, 22, 5, 3, 67);      // 얼어붙은 호수 (화이트)
    river([[360, 40], [352, 70], [366, 96], [376, 140], [370, 176], [384, 196]], 1.4, 135);   // 안개 늪을 가르는 검은 물줄기
    lake(370, 150, 6, 4, 137);   // 가라앉은 사원 호수
    lake(336, 60, 4, 3, 139);    // 안개 웅덩이
    river([[96, 262], [112, 276], [126, 292]], 1.1, 143);                    // 협곡 개울
    // 물가 높이: 물은 주변 낮은 쪽 높이로
    for (let i = 0; i < N; i++) if (sea[i] === 3) { const x = i % W, y = (i / W) | 0; let mn = 9; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const j = (y + dy) * W + x + dx; if (j >= 0 && j < N && !sea[j]) mn = Math.min(mn, hgt[j]); } hgt[i] = mn === 9 ? 0 : mn; }
    // 강 폭 전체를 같은 높이로: 이웃한 물 칸 중 낮은 쪽을 몇 번 옮긴다 (강 한가운데 절벽 조각이 생기지 않게)
    for (let pass = 0; pass < 4; pass++) {
      const nh = hgt.slice();
      for (let i = W; i < N - W; i++) if (sea[i] === 3) for (const j of [i - 1, i + 1, i - W, i + W]) if (sea[j] === 3 && hgt[j] < nh[i]) nh[i] = hgt[j];
      hgt.set(nh);
    }
    // 5) 마을 자리: 평평하게, 사물 없이
    for (const [n, t] of Object.entries(TOWNS)) {
      const th = BASEH[n] + (n === 'white' ? 0 : 0);
      const mg = n === 'amber' ? 13 : 2;   // 협곡 마을은 둘레를 넓게 고른다 (바깥 동네가 들어설 자리)
      for (let y = t.y - mg; y < t.y + t.h + mg; y++) for (let x = t.x - mg; x < t.x + t.w + mg; x++) {
        if (!m.inb(x, y)) continue; const i = y * W + x;
        if (sea[i] === 1 || sea[i] === 2) continue;
        hgt[i] = th; if (sea[i] === 3) { ter[i] = T.WATER; } else ter[i] = T.GRASS;
      }
    }
    // 화산 분화구 · 설산 꼭대기
    for (let y = VP[1] - 16; y < VP[1] + 16; y++) for (let x = VP[0] - 16; x < VP[0] + 16; x++) { if (!m.inb(x, y)) continue; const d = U.dist(x, y, VP[0], VP[1]) + (U.vnoise(x / 2, y / 2, 71) - 0.5) * 2; if (d < 3.4 * SC && hgt[y * W + x] === 4) ter[y * W + x] = T.LAVA; }
    // 6) 지형 무늬: 지역마다 여러 바닥 (숲 바닥 · 꽃밭 · 마른 풀 · 자갈 · 바위 · 갈라진 땅 · 이끼 …)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (sea[i] || ter[i] === T.LAVA) continue;
      const n = regName[i], hh = hgt[i];
      const f = U.fbm(x / 12, y / 12, 81, 3), f2 = U.fbm(x / 6, y / 6, 83, 2);
      const forest = U.fbm(x / 10, y / 10, 101, 3), mead = U.fbm(x / 14, y / 14, 85, 3), rock = U.fbm(x / 9, y / 9, 87, 2);
      let t = T.GRASS;
      switch (n) {
        case 'green': t = forest > 0.6 ? T.LEAVES : mead > 0.64 ? T.MEADOW : f2 > 0.72 ? T.DIRT : rock > 0.76 ? T.GRAVEL : T.GRASS; break;
        case 'red':
          if (hh >= 2) t = f2 > 0.45 ? T.ASH : rock > 0.5 ? T.ROCKY : T.GRAVEL;
          else if (hh === 1) t = rock > 0.6 ? T.GRAVEL : f > 0.55 ? T.DIRT : T.DRY;
          else t = forest > 0.62 ? T.LEAVES : f > 0.58 ? T.DIRT : mead > 0.6 ? T.DRY : T.GRASS;
          break;
        case 'blue': t = forest > 0.62 ? T.LEAVES : mead > 0.65 ? T.MEADOW : f2 > 0.76 ? T.DIRT : T.GRASS; break;
        case 'yellow':
          if (f > 0.72 && hh === 0) t = T.GRASS;
          else if (f > 0.64 && hh === 0) t = T.DRY;
          else if (rock > 0.68) t = T.CRACKED;
          else if (hh >= 1 && f2 > 0.58) t = T.ROCKY;
          else t = T.SAND;
          break;
        case 'purple': t = forest > 0.5 ? (f2 > 0.62 ? T.LEAVES : T.MOSS) : mead > 0.66 ? T.MEADOW : f2 > 0.74 ? T.DIRT : T.GRASS; break;
        case 'rainbow': t = f2 > 0.76 ? T.CLOUD : mead > 0.7 ? T.MEADOW : mead > 0.55 ? T.PETALS : T.GRASS; break;
        case 'white': t = hh >= 2 ? (rock > 0.74 ? T.ROCKY : T.SNOW) : f > 0.5 ? T.SNOW : rock > 0.7 ? T.GRAVEL : T.GRASS; break;
        case 'gray': t = f > 0.42 ? (rock > 0.66 ? T.CRACKED : T.ASH) : f2 > 0.76 ? T.GRAVEL : T.DIRT; break;
        case 'black': t = forest > 0.62 ? T.MOSS : rock > 0.74 ? T.GRAVEL : T.DARK; break;
        case 'colorful': t = forest > 0.64 ? T.LEAVES : mead > 0.58 ? T.MEADOW : f2 > 0.76 ? T.DIRT : T.GRASS; break;
        case 'mist': t = f2 > 0.7 ? T.SWAMP : forest > 0.56 ? T.MOSS : mead > 0.62 ? T.MUD : rock > 0.78 ? T.GRAVEL : T.GRASS; break;
        case 'amber': t = hh >= 2 ? (rock > 0.55 ? T.ROCKY : f2 > 0.6 ? T.CRACKED : T.DRY) : forest > 0.5 ? T.LEAVES : mead > 0.66 ? T.MEADOW : f2 > 0.74 ? T.DIRT : T.GRASS; break;
        default: break;
      }
      ter[i] = t;
    }
    // 강 · 호숫가 진흙 (같은 높이, 잡음으로 드문드문)
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = y * W + x; if (sea[i]) continue;
      const n = regName[i]; if (!['green', 'blue', 'purple', 'colorful', 'mist', 'amber'].includes(n)) continue;
      let nearR = false; for (let dy = -2; dy <= 2 && !nearR; dy++) for (let dx = -2; dx <= 2; dx++) { const j = i + dy * W + dx; if (sea[j] === 3 && hgt[j] === hgt[i]) { nearR = true; break; } }
      if (nearR && U.fbm(x / 5, y / 5, 89, 2) > 0.56) ter[i] = T.MUD;
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
    ['yellow', 'mist'], ['black', 'mist'], ['green', 'amber'], ['blue', 'amber'],
  ];
  function townCenter(n) { const t = TOWNS[n]; return [t.x + (t.w >> 1), t.y + (t.h >> 1)]; }
  function roads(m, sea) {
    OW.roadTiles = new Uint8Array(W * H);
    OW.stairsAt = [];
    OW.roadPaths = [];
    for (const [a, b] of LINKS) {
      const p = astar(m, sea, townCenter(a), townCenter(b));
      if (!p) { console.warn('길 없음', a, b); continue; }
      carve(m, sea, p, a, b);
    }
  }
  /* A*: 여덟 방향. 대각선은 평평한 곳에서만, 높이는 남북으로만 오르내린다(계단).
     절벽 가장자리 · 물은 비싸게, 이미 난 길은 싸게 */
  function astar(m, sea, [sx, sy], [gx, gy]) {
    const N = W * H;
    const g = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = [];
    const push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = k * 2 + 1, r = l + 1; let s = k; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === k) break; [heap[s], heap[k]] = [heap[k], heap[s]]; k = s; } } return top; };
    const si = sy * W + sx, gi = gy * W + gx;
    g[si] = 0; push(si, 0);
    const hg = m.hgt, tr = m.ter;
    const bad = (j) => sea[j] === 1 || sea[j] === 2 || tr[j] === T.LAVA;
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (heap.length) {
      const [, i] = pop();
      if (i === gi) break;
      if (closed[i]) continue; closed[i] = 1;
      const x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1) continue;
        const j = ny * W + nx; if (closed[j] || bad(j)) continue;
        const tj = tr[j], ti = tr[i];
        let c = 1;
        if (dx && dy) {
          // 대각선: 세 칸이 모두 같은 높이, 절벽 없음
          const a = y * W + nx, b = ny * W + x;
          if (bad(a) || bad(b) || tj === T.CLIFF || ti === T.CLIFF || tr[a] === T.CLIFF || tr[b] === T.CLIFF) continue;
          // 물은 대각선으로 건너지 않는다 (다리가 체크무늬로 끊기지 않게)
          const wet = (k) => tr[k] === T.WATER || tr[k] === T.DEEP;
          if (wet(i) || wet(j) || wet(a) || wet(b)) continue;
          if (hg[j] !== hg[i] || hg[a] !== hg[i] || hg[b] !== hg[i]) continue;
          c = 1.414;
        } else if (tj === T.CLIFF || ti === T.CLIFF || hg[j] !== hg[i]) { if (dx !== 0) continue; c += 7; }
        if (tj === T.DEEP) c += 6; else if (tj === T.WATER) c += 2;
        // 절벽 가장자리 바로 옆은 피한다 (길이 벼랑에 붙지 않게)
        if (tj !== T.CLIFF && (tr[j - 1] === T.CLIFF || tr[j + 1] === T.CLIFF || tr[j + W] === T.CLIFF)) c += 0.9;
        c += U.noise2(nx, ny, 91) * 0.35;
        if (OW.roadTiles[j]) c *= 0.55;
        const ng = g[i] + c;
        if (ng < g[j]) { g[j] = ng; came[j] = i; const ax = Math.abs(nx - gx), ay = Math.abs(ny - gy); push(j, ng + (Math.max(ax, ay) + 0.414 * Math.min(ax, ay)) * 1.02); }
      }
    }
    if (came[gi] < 0) return null;
    const path = []; let k = gi; while (k >= 0) { path.push(k); k = came[k]; }
    return path.reverse();
  }
  /** 두 점 사이 곧은 선이 한 높이의 평지로만 지나가나 (물은 짧게만) */
  function los(m, sea, ax, ay, bx, by, h) {
    const n = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 3) + 1;
    let wet = 0;
    for (let s = 0; s <= n; s++) {
      const t = s / n, fx = ax + (bx - ax) * t, fy = ay + (by - ay) * t;
      for (const [ox, oy] of [[0, 0], [0.45, 0], [-0.45, 0], [0, 0.45], [0, -0.45]]) {
        const x = Math.round(fx + ox), y = Math.round(fy + oy); if (!m.inb(x, y)) return false;
        const j = y * W + x, tt = m.ter[j];
        if (sea[j] === 1 || sea[j] === 2 || tt === T.LAVA || tt === T.CLIFF || tt === T.STAIRS || m.hgt[j] !== h) return false;
      }
      const j = Math.round(fy) * W + Math.round(fx);
      if (m.ter[j] === T.WATER || m.ter[j] === T.DEEP) { wet++; if (wet > 18) return false; }
    }
    return true;
  }
  function roadKind(x, y, n) {
    // 마을 가까이는 돌길, 멀어지면 지역의 흙길
    let near = 99;
    for (const t of Object.values(TOWNS)) near = Math.min(near, Math.max(t.x - x, x - (t.x + t.w), t.y - y, y - (t.y + t.h)));
    if (near < 9) return n === 'yellow' ? T.ROAD : n === 'mist' ? T.PLANK : T.COBBLE;
    return { yellow: T.ROAD, white: T.ROAD, black: T.COBBLE, gray: T.GRAVEL, red: T.DIRT }[n] || T.DIRT;
  }
  function carve(m, sea, path, a, b) {
    const tr = m.ter, hg = m.hgt;
    const pt = path.map((i) => [i % W, (i / W) | 0]);
    // 1) 오르내림(계단) 칸은 그대로, 평지 구간은 곧은 선으로 줄이고(끈 당기기) 모서리를 둥글린다(차이킨)
    const segs = []; let cur = [pt[0]];
    for (let k = 1; k < pt.length; k++) {
      const [x0, y0] = pt[k - 1], [x1, y1] = pt[k];
      const step = hg[y1 * W + x1] !== hg[y0 * W + x0] || tr[y1 * W + x1] === T.CLIFF || tr[y0 * W + x0] === T.CLIFF;
      if (step) { if (cur.length > 1) segs.push({ flat: true, pts: cur }); segs.push({ flat: false, pts: [pt[k - 1], pt[k]] }); cur = [pt[k]]; }
      else cur.push(pt[k]);
    }
    if (cur.length > 1) segs.push({ flat: true, pts: cur });
    const paint = (x, y, h, core) => {
      if (!m.inb(x, y)) return;
      const j = y * W + x, tt = tr[j];
      if (hg[j] !== h || tt === T.CLIFF || tt === T.STAIRS || tt === T.LAVA || sea[j] === 1 || sea[j] === 2) return;
      if (tt === T.DEEP || tt === T.WATER) { if (!core) return; tr[j] = T.BRIDGE; }
      else if (tt !== T.BRIDGE) tr[j] = roadKind(x, y, OW.regName[j]);
      m.obj[j] = 0; OW.roadTiles[j] = 1;
    };
    for (const sg of segs) {
      if (!sg.flat) {
        // 계단: 절벽 칸 → 계단 (두 칸 폭)
        for (const [x, y] of sg.pts) for (const xx of [x, x + 1]) {
          const j = y * W + xx; if (!m.inb(xx, y)) continue;
          if (tr[j] === T.CLIFF) { tr[j] = T.STAIRS; m.obj[j] = 0; OW.stairsAt.push([xx, y]); OW.roadTiles[j] = 1; }
          else if (tr[j] !== T.STAIRS && hg[j] === hg[sg.pts[0][1] * W + sg.pts[0][0]] && tr[j] !== T.DEEP && tr[j] !== T.WATER) { tr[j] = roadKind(xx, y, OW.regName[j]); m.obj[j] = 0; OW.roadTiles[j] = 1; }
        }
        continue;
      }
      const P = sg.pts, h = hg[P[0][1] * W + P[0][0]];
      // 끈 당기기
      const keep = [P[0]]; let i = 0;
      while (i < P.length - 1) {
        let j = Math.min(P.length - 1, i + 60);
        while (j > i + 1 && !los(m, sea, P[i][0], P[i][1], P[j][0], P[j][1], h)) j--;
        keep.push(P[j]); i = j;
      }
      // 긴 곧은 구간은 잡음으로 살짝 굽힌다 (자연스러운 길)
      let poly = [keep[0].slice()];
      for (let k = 0; k < keep.length - 1; k++) {
        const [ax, ay] = keep[k], [bx, by] = keep[k + 1], L = Math.hypot(bx - ax, by - ay);
        const parts = Math.max(1, Math.round(L / 7));
        const nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
        for (let q = 1; q <= parts; q++) {
          const t = q / parts; let px = ax + (bx - ax) * t, py = ay + (by - ay) * t;
          if (q < parts) {
            const off = (U.vnoise(px / 9, py / 9, 97) - 0.5) * Math.min(4.5, L * 0.18);
            const cx = px + nx * off, cy = py + ny * off, prev = poly[poly.length - 1];
            if (los(m, sea, prev[0], prev[1], cx, cy, h) && los(m, sea, cx, cy, bx, by, h)) { px = cx; py = cy; }
          }
          poly.push([px, py]);
        }
      }
      // 차이킨 두 번 (가능할 때만)
      for (let it = 0; it < 2 && poly.length > 2; it++) {
        const out = [poly[0]];
        for (let k = 0; k < poly.length - 1; k++) {
          const [ax, ay] = poly[k], [bx, by] = poly[k + 1];
          const q = [ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], r = [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75];
          if (k > 0) out.push(q); if (k < poly.length - 2) out.push(r);
        }
        out.push(poly[poly.length - 1]);
        let ok = true; for (let k = 0; k < out.length - 1 && ok; k++) ok = los(m, sea, out[k][0], out[k][1], out[k + 1][0], out[k + 1][1], h);
        if (ok) poly = out; else break;
      }
      OW.roadPaths.push(poly);
      // 둥근 붓으로 칠하기 (폭 두세 칸, 조금씩 넓어졌다 좁아졌다)
      for (let k = 0; k < poly.length - 1; k++) {
        const [ax, ay] = poly[k], [bx, by] = poly[k + 1];
        const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 4) + 1;
        for (let s2 = 0; s2 <= n; s2++) {
          const t = s2 / n, fx = ax + (bx - ax) * t + 0.5, fy = ay + (by - ay) * t + 0.5;
          const r = 1.0 + U.vnoise(fx / 7, fy / 7, 95) * 0.35;
          for (let y = Math.floor(fy - r); y <= Math.floor(fy + r); y++) for (let x = Math.floor(fx - r); x <= Math.floor(fx + r); x++) {
            const d = Math.hypot(x + 0.5 - fx, y + 0.5 - fy);
            if (d <= r) paint(x, y, h, false);   // 붓은 땅만 — 다리는 원래 경로를 따라 곧게 놓는다
          }
        }
      }
      // 원래 칸도 길로 (끊기지 않게) · 물 위는 건너는 방향에 직각으로 세 칸 폭 다리
      for (let k = 0; k < P.length; k++) {
        const [x, y] = P[k];
        paint(x, y, h, true);
        const wet = (xx, yy) => m.inb(xx, yy) && (tr[yy * W + xx] === T.WATER || tr[yy * W + xx] === T.DEEP || tr[yy * W + xx] === T.BRIDGE);
        if (!wet(x, y)) continue;
        const q = P[Math.min(P.length - 1, k + 1)], o = P[Math.max(0, k - 1)];
        const horiz = Math.abs(q[0] - o[0]) >= Math.abs(q[1] - o[1]);
        for (const d of [-1, 1]) { const xx = horiz ? x : x + d, yy = horiz ? y + d : y; if (wet(xx, yy) && hg[yy * W + xx] === h) paint(xx, yy, h, true); }
      }
    }
    // 고원 북쪽 가장자리(면이 없는 쪽)를 오르는 곳: 낮은 칸을 계단으로
    for (let k = 1; k < path.length; k++) {
      const i = path[k], p = path[k - 1];
      if (Math.abs(i - p) !== W) continue;
      if (hg[i] !== hg[p] && tr[i] !== T.STAIRS && tr[p] !== T.STAIRS) {
        const lo = hg[i] < hg[p] ? i : p;
        for (const j of [lo, lo + 1]) if (tr[j] !== T.CLIFF) { tr[j] = T.STAIRS; m.obj[j] = 0; OW.roadTiles[j] = 1; }
      }
    }
    void a; void b;
  }
  function regionRoad(n) { return n === 'yellow' ? T.ROAD : n === 'white' ? T.ROAD : n === 'black' ? T.COBBLE : n === 'gray' ? T.GRAVEL : T.DIRT; }

  function paveTown(m, n, t) {
    const road = (OW.PLAN && OW.PLAN[n] && OW.PLAN[n].pave) || (n === 'yellow' || n === 'black' || n === 'white' || n === 'gray' ? T.STONE : n === 'rainbow' ? T.TILE : T.ROAD);
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
        case 'green': o = t === T.MUD ? (r < 0.12 ? O.REED : 0) : t === T.GRAVEL ? (r < 0.06 ? O.ROCK : r < 0.1 ? O.PEBBLE : 0) : t === T.MEADOW ? (r < 0.12 ? O.FLOWER : r < 0.16 ? O.TALL : 0) : forest > 0.6 ? (r < 0.55 ? O.TREE : r < 0.62 ? O.BUSH : r < 0.64 ? O.SHROOM : 0) : r < 0.05 ? O.TALL : r < 0.075 ? O.FLOWER : r < 0.085 ? O.BUSH : r < 0.09 ? O.ROCK : 0; break;
        case 'red': o = t === T.ASH || t === T.ROCKY ? (r < 0.04 ? O.DEAD : r < 0.07 ? O.ROCK : r < 0.075 ? O.BOULDER : 0) : t === T.GRAVEL ? (r < 0.05 ? O.ROCK : r < 0.09 ? O.PEBBLE : 0) : t === T.DRY ? (r < 0.06 ? O.TALL : r < 0.075 ? O.DEAD : r < 0.085 ? O.ROCK : 0) : forest > 0.62 ? (r < 0.4 ? O.TREE : r < 0.46 ? O.DEAD : 0) : r < 0.03 ? O.ROCK : r < 0.05 ? O.TALL : r < 0.055 ? O.BUSH : 0; break;
        case 'blue': o = t === T.SAND ? (r < 0.03 ? O.PALM : r < 0.045 ? O.PEBBLE : 0) : t === T.MUD ? (r < 0.14 ? O.REED : 0) : t === T.MEADOW ? (r < 0.1 ? O.FLOWER : 0) : forest > 0.62 ? (r < 0.5 ? O.TREE : r < 0.6 ? O.BUSH : 0) : r < 0.05 ? O.TALL : r < 0.07 ? O.FLOWER : r < 0.075 ? O.REED : 0; break;
        case 'yellow': o = t === T.SAND || t === T.CRACKED || t === T.ROCKY ? (r < 0.02 ? O.CACTUS : r < 0.03 ? O.ROCK : r < 0.036 ? O.BONES : r < 0.042 ? O.PEBBLE : 0) : t === T.DRY ? (r < 0.05 ? O.TALL : r < 0.06 ? O.CACTUS : r < 0.07 ? O.PALM : 0) : r < 0.3 ? O.PALM : r < 0.4 ? O.TALL : 0; break;
        case 'purple': o = t === T.MUD ? (r < 0.1 ? O.REED : r < 0.14 ? O.SHROOM : 0) : forest > 0.5 ? (r < 0.4 ? O.TREE : r < 0.5 ? O.SHROOM : r < 0.55 ? O.BUSH : 0) : t === T.MEADOW ? (r < 0.12 ? O.FLOWER : 0) : r < 0.05 ? O.TALL : r < 0.08 ? O.FLOWER : r < 0.09 ? O.SHROOM : 0; break;
        case 'rainbow': o = forest > 0.62 ? (r < 0.4 ? O.BLOSSOM : 0) : r < 0.1 ? O.FLOWER : r < 0.13 ? O.TALL : 0; break;
        case 'white': o = forest > 0.55 ? (r < 0.5 ? O.SNOWTREE : r < 0.55 ? O.PINE : 0) : r < 0.02 ? O.ICESPIKE : r < 0.035 ? O.ROCK : r < 0.04 ? O.PINE : 0; break;
        case 'gray': o = t === T.GRAVEL ? (r < 0.05 ? O.RUBBLE : r < 0.09 ? O.PEBBLE : 0) : r < 0.02 ? O.RUBBLE : r < 0.035 ? O.DEAD : r < 0.045 ? O.ROCK : r < 0.05 ? O.PILLAR : r < 0.055 ? O.BONES : 0; break;
        case 'black': o = forest > 0.6 ? (r < 0.35 ? O.DEAD : r < 0.42 ? O.TREE : r < 0.46 ? O.SHROOM : 0) : t === T.GRAVEL ? (r < 0.04 ? O.ROCK : r < 0.05 ? O.GRAVE : 0) : r < 0.02 ? O.GRAVE : r < 0.035 ? O.TALL : r < 0.04 ? O.DEAD : 0; break;
        case 'colorful': o = t === T.SAND ? (r < 0.04 ? O.PALM : 0) : forest > 0.64 ? (r < 0.4 ? O.TREE : r < 0.5 ? O.BLOSSOM : 0) : r < 0.1 ? O.FLOWER : r < 0.13 ? O.TALL : 0; break;
        default: break;
      }
      // 물가 갈대 · 연잎
      if (!o && (tr[i + 1] === T.WATER || tr[i - 1] === T.WATER) && r < 0.3 && n !== 'white' && n !== 'gray' && n !== 'black') o = O.REED;
      if (o) m.obj[i] = o;
    }
    for (let i = 0; i < W * H; i++) if (tr[i] === T.WATER && rnd() < 0.05 && ['green', 'blue', 'purple', 'rainbow', 'colorful'].includes(regName[i]) && !OW.roadTiles[i]) m.obj[i] = O.LILY;
    // 블랙: 길가에 가로등
    for (let i = 0; i < W * H; i++) if (OW.roadTiles[i] && regName[i] === 'black' && (i % 7 === 0) && !OW.roadTiles[i + 2] && (tr[i + 2] === T.DARK || tr[i + 2] === T.MOSS || tr[i + 2] === T.GRAVEL) && !m.obj[i + 2]) { m.obj[i + 2] = O.LAMP; m.lights.push({ x: ((i + 2) % W) * TS + 8, y: (((i + 2) / W) | 0) * TS + 2, r: 46, warm: 'rgba(255,210,120,0.18)' }); }
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
    mist: [['plant', 2.5], ['ghost', 1.5], ['octo', 1.5], ['bug', 2], ['wisp', 1], ['bigslime', 1.2]],
    amber: [['wolf', 2], ['boar', 2], ['bandit', 1.5], ['bat', 1], ['golem', 0.6], ['worm', 0.8]],
  };
  const TIERS = { green: 0, red: 1, blue: 2, yellow: 3, purple: 4, rainbow: 5, white: 6, gray: 7, black: 8, colorful: 9, mist: 6, amber: 3 };
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
    if (n === 'red' && U.dist(p.x / TS, p.y / TS, VP[0], VP[1]) < 30 * SC) return 'ash';
    if (n === 'yellow') return k === 2 ? 'dust' : null;
    if (n === 'purple') return 'spores';
    if (n === 'rainbow') return 'petals';
    if (n === 'blue') return k === 3 ? 'rain' : null;
    if (n === 'green') return k === 1 ? 'leaves' : null;
    if (n === 'black') return 'stars';
    if (n === 'mist') return k === 4 ? 'rain' : 'spores';
    if (n === 'amber') return 'leaves';
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
  // 옛 저장(400×300 대륙)의 자리 → 넓어진 대륙
  OW.VER = 3;
  if (G.prog && G.prog.migrate) {
    const mg0 = G.prog.migrate;
    G.prog.migrate = function (s) {
      s = mg0(s);
      if ((s.worldVer || 2) < OW.VER) {
        const mv = (o) => { if (o && o.map === 'world' && o.x != null) { const [X, Y] = fwd((o.x - 8) / TS, (o.y - 12) / TS); o.x = Math.round(X) * TS + 8; o.y = Math.round(Y) * TS + 12; } };
        mv(s); mv(s.respawn);
        if (s.flags) delete s.flags['fog:world'];
        s.worldVer = OW.VER;
      }
      return s;
    };
  }
  if (G.story && G.story.start) { const st0 = G.story.start; G.story.start = function (s) { s.worldVer = OW.VER; return st0.apply(this, arguments); }; }
})();
