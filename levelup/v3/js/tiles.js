/* 지형: 종류 · 성질 · 지역 팔레트 · 픽셀 단위 무늬
   바닥은 칸 단위가 아니라 픽셀 단위로 칠한다. 이웃 지형과의 경계는 잡음으로 굽이지게 섞고,
   절벽 면 · 고원 테두리 · 그림자는 높이 차를 읽어서 그린다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const TS = 16;

  const T = {
    VOID: 0, GRASS: 1, DIRT: 2, SAND: 3, SNOW: 4, ASH: 5, STONE: 6, WOOD: 7, CARPET: 8, WATER: 9, DEEP: 10, LAVA: 11, ICE: 12,
    CLIFF: 13, STAIRS: 14, WALL: 15, FLOOR: 16, PIT: 17, BRIDGE: 18, DARK: 19, CLOUD: 20, CRYSTAL: 21, METAL: 22, FARM: 23, SWAMP: 24, ROAD: 25, TILE: 26, RUG: 27,
    // 들 · 숲 바닥
    MEADOW: 28, MOSS: 29, GRAVEL: 30, LEAVES: 31, MUD: 32, DRY: 33, ROCKY: 34, PETALS: 41, CRACKED: 42,
    // 마을 바닥
    COBBLE: 35, BRICK: 36, MARBLE: 37, SANDSTONE: 38, PLANK: 39, PLAZA: 40,
    // 던전 바닥
    CAVE: 43, ROOTS: 44, WETSTONE: 45, HIERO: 46, MIRROR: 47, ICEBRICK: 48, GRATE: 49, CHECKER: 50, PANEL: 51, ORE: 52, SKYTILE: 53,
  };
  const NAMES = []; for (const k of Object.keys(T)) NAMES[T[k]] = k;   // 번호 → 이름
  // 성질: s=막힘 · w=물(얕음) · d=깊은 물 · h=위험(구덩이 · 용암) · slow=느림 · slip=미끄러움
  const PROP = [];
  for (const k of Object.keys(T)) PROP[T[k]] = {};
  Object.assign(PROP[T.VOID], { s: 1 }); Object.assign(PROP[T.CLIFF], { s: 1, face: 1 }); Object.assign(PROP[T.WALL], { s: 1, wall: 1 });
  Object.assign(PROP[T.DEEP], { s: 1, d: 1, liquid: 1 }); Object.assign(PROP[T.WATER], { w: 1, slow: 0.72, liquid: 1 }); Object.assign(PROP[T.SWAMP], { slow: 0.6, liquid: 1 });
  Object.assign(PROP[T.LAVA], { h: 'lava', liquid: 1 }); Object.assign(PROP[T.PIT], { h: 'pit' }); Object.assign(PROP[T.ICE], { slip: 1 }); Object.assign(PROP[T.STAIRS], { stairs: 1 });
  Object.assign(PROP[T.SNOW], { slow: 0.9 }); Object.assign(PROP[T.SAND], { slow: 0.94 }); Object.assign(PROP[T.MUD], { slow: 0.84 });
  // 경계를 섞는 순위 (값이 비슷할 때 누가 이기나) · 부드럽게 섞이는 지형
  const PRI = new Array(64).fill(0);
  PRI[T.GRASS] = 6; PRI[T.DARK] = 6; PRI[T.SNOW] = 7; PRI[T.DIRT] = 3; PRI[T.SAND] = 2; PRI[T.ASH] = 4; PRI[T.FARM] = 1; PRI[T.SWAMP] = 5;
  PRI[T.ROAD] = 1; PRI[T.CLOUD] = 5; PRI[T.CRYSTAL] = 3; PRI[T.MEADOW] = 6.5; PRI[T.PETALS] = 6.4; PRI[T.MOSS] = 5.8; PRI[T.LEAVES] = 5.5; PRI[T.DRY] = 5.9;
  PRI[T.MUD] = 3.5; PRI[T.GRAVEL] = 2.8; PRI[T.ROCKY] = 2.5; PRI[T.CRACKED] = 2.2; PRI[T.CAVE] = 2; PRI[T.ROOTS] = 2.4; PRI[T.ORE] = 2.1;
  PRI[T.COBBLE] = 1.2; PRI[T.WATER] = 8; PRI[T.DEEP] = 9; PRI[T.LAVA] = 9; PRI[T.ICE] = 4;
  const BLEND = new Array(64).fill(false);
  for (const k of ['GRASS', 'DIRT', 'SAND', 'SNOW', 'ASH', 'DARK', 'FARM', 'SWAMP', 'ROAD', 'CLOUD', 'CRYSTAL', 'MEADOW', 'MOSS', 'GRAVEL', 'LEAVES', 'MUD', 'DRY', 'ROCKY', 'PETALS', 'CRACKED', 'CAVE', 'ROOTS', 'ORE', 'COBBLE', 'WATER', 'DEEP', 'LAVA', 'ICE']) BLEND[T[k]] = true;
  const LIQ = new Array(64).fill(false); LIQ[T.WATER] = LIQ[T.DEEP] = true;
  // 자연 바닥 (큰 무늬 색 흔들림)
  const NATURAL = new Array(64).fill(false);
  for (const k of ['GRASS', 'MEADOW', 'PETALS', 'DRY', 'MOSS', 'LEAVES', 'DIRT', 'SAND', 'SNOW', 'DARK']) NATURAL[T[k]] = true;

  /* ───────── 지역 팔레트 ─────────
     g: 풀 [어둠, 가운데, 밝음, 꽃], d: 흙, s: 모래, c: 절벽 [어둠, 가운데, 밝음], w: 물 [깊음, 가운데, 밝음, 거품] */
  const PAL = {
    green: { g: ['#3c8a3e', '#56ad4c', '#7cc862', '#f2e36a'], d: ['#8a5e38', '#a8784a', '#c4966a'], s: ['#d8c48c', '#e8d8a4', '#f4ead0'], c: ['#4c3a2e', '#6e5640', '#8e7456'], w: ['#2a5aa0', '#3c7ac8', '#62a4e0', '#d8f0ff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    red: { g: ['#6a7a34', '#8a963e', '#b0b456', '#ff8a4a'], d: ['#86472c', '#a8603a', '#c88458'], s: ['#c89a6a', '#dab282', '#ecc8a0'], c: ['#4a2420', '#743a2c', '#9a5a40'], w: ['#2a4a8a', '#3a64a8', '#5a8ac8', '#e8f0ff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    blue: { g: ['#2f8a64', '#46a878', '#6cc890', '#8ad0ff'], d: ['#8a6e4a', '#a8885e', '#c4a47a'], s: ['#d8c08a', '#ead6a2', '#f8ecc8'], c: ['#3a4a52', '#566a72', '#7a9098'], w: ['#1e4c8e', '#2e6cb8', '#4e94d8', '#e0f4ff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    yellow: { g: ['#8a8e3a', '#a8a84a', '#c8c462', '#ff6a8a'], d: ['#a8743e', '#c49050', '#dcae6a'], s: ['#d4a85a', '#e6c276', '#f4dc9e'], c: ['#6a4428', '#946038', '#b8804e'], w: ['#2a6a8a', '#3a8aa8', '#5aaac8', '#e8f8ff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    purple: { g: ['#4a4a7a', '#5e6a96', '#7e8cb8', '#ffb0e0'], d: ['#6a4a5a', '#86607a', '#a87e98'], s: ['#b8a0b8', '#ccb8cc', '#e0d0e0'], c: ['#2e2440', '#4a3a60', '#6a5682'], w: ['#2a2a6a', '#3a3e8e', '#5a64b8', '#e0dcff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    rainbow: { g: ['#46a88a', '#62c8a0', '#8ae4bc', '#ff9ad8'], d: ['#a88a6a', '#c4a484', '#dcc0a0'], s: ['#e8d8b8', '#f4e8d0', '#fff8ec'], c: ['#6a6aa0', '#8a8ac0', '#b0b0dc'], w: ['#3a6ac8', '#5a8ae8', '#8ab4ff', '#ffffff'], snow: ['#dcdcff', '#eeeeff', '#ffffff'] },
    white: { g: ['#6a8a8a', '#88a8a8', '#a8c4c4', '#b8e0ff'], d: ['#7a6a5e', '#968678', '#b2a496'], s: ['#c8ccd4', '#dce0e8', '#eef2f8'], c: ['#4a5a6e', '#6a7e94', '#90a4ba'], w: ['#2a4a7a', '#3e68a0', '#6a94c8', '#ffffff'], snow: ['#b8c8e0', '#dce8f6', '#ffffff'] },
    gray: { g: ['#5e6252', '#767a66', '#8e927c', '#c8c8a0'], d: ['#5e5650', '#78706a', '#928a82'], s: ['#8e8a84', '#a4a09a', '#bab6b0'], c: ['#34343a', '#4e4e56', '#6a6a74'], w: ['#2e3a4a', '#3e4e62', '#5a6a80', '#c8d0d8'], snow: ['#b8c0c8', '#d0d6dc', '#eaeef2'], ash: ['#6a6a68', '#82827e', '#9a9a94'] },
    black: { g: ['#1e2e30', '#2a4040', '#3a5654', '#ffe08a'], d: ['#2e2830', '#403844', '#54485a'], s: ['#4a4450', '#5c5664', '#6e6878'], c: ['#141220', '#221e34', '#342e4a'], w: ['#0e1430', '#16204a', '#243466', '#8a9ad8'], snow: ['#8a90a8', '#a4aac0', '#c0c6d8'] },
    colorful: { g: ['#3a9a4a', '#52b85a', '#78d46e', '#ff5a8a'], d: ['#9a6a4a', '#b8845c', '#d0a078'], s: ['#e0c490', '#eed8a8', '#faecd0'], c: ['#5a3e5a', '#7e5678', '#a07898'], w: ['#1e6aa8', '#2e8ad0', '#56aeea', '#ffffff'], snow: ['#c8d6ea', '#e4ecf8', '#ffffff'] },
    space: { g: ['#2a3040', '#3a4254', '#4c566a', '#8ab0e0'], d: ['#3a3e4a', '#4e5260', '#626878'], s: ['#5a5e6a', '#6e7280', '#848896'], c: ['#1a1c26', '#2a2e3a', '#3c4250'], w: ['#0a1428', '#12203c', '#1e3258', '#8ab0e0'], snow: ['#a8b0c0', '#c4cad6', '#e0e4ec'] },
    planet: { g: ['#8a6a2a', '#b08a3a', '#d8b050', '#fff0a8'], d: ['#6a4a2a', '#8a643a', '#a8804e'], s: ['#c8a050', '#e0bc68', '#f4d888'], c: ['#4a2e14', '#6e4820', '#946430'], w: ['#2a1a4a', '#3a2a6a', '#5a44a0', '#e8d8ff'], snow: ['#e8d8a8', '#f4e8c0', '#fff8e0'] },
    dungeon: { g: ['#3a4a3a', '#4a5a48', '#5e705a', '#a0c090'], d: ['#4a3e34', '#5e5044', '#746454'], s: ['#6a6258', '#7e766a', '#948a7c'], c: ['#1e1a26', '#2e2838', '#423a4e'], w: ['#1a2a4a', '#243a62', '#34507e', '#a8c8ff'], snow: ['#a8b0c0', '#c4cad6', '#e0e4ec'] },
  };
  const REGIONS = ['green', 'red', 'blue', 'yellow', 'purple', 'rainbow', 'white', 'gray', 'black', 'colorful', 'space', 'planet', 'dungeon'];

  /* ───────── 색 계산 도우미 ───────── */
  const RGB = {};
  const rgb = (hex) => RGB[hex] || (RGB[hex] = U.rgb(hex));
  const n2 = U.noise2;
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function mul(a, f) { return [a[0] * f, a[1] * f, a[2] * f]; }
  // 세 색 사이를 v(0~1)로 고른다 (단계가 보이게)
  function band(arr, v) { return v < 0.33 ? rgb(arr[0]) : v < 0.72 ? rgb(arr[1]) : rgb(arr[2]); }
  /** 흔들린 격자 점들로 만든 조각 무늬: 가장 가까운 두 점까지의 거리와 조각 번호 */
  let VD1 = 0, VD2 = 0, VID = 0, VCX = 0, VCY = 0;
  function vor(x, y, s, seed) {
    const gx = Math.floor(x / s), gy = Math.floor(y / s);
    let d1 = 1e9, d2 = 1e9, id = 0, cx = 0, cy = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const X = gx + i, Y = gy + j;
      const px = (X + 0.15 + n2(X, Y, seed) * 0.7) * s, py = (Y + 0.15 + n2(X, Y, seed + 1) * 0.7) * s;
      const d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < d1) { d2 = d1; d1 = d; id = n2(X, Y, seed + 2); cx = px; cy = py; } else if (d < d2) d2 = d;
    }
    VD1 = Math.sqrt(d1); VD2 = Math.sqrt(d2); VID = id; VCX = cx; VCY = cy;
  }
  /** 둥근 돌: 조각 무늬 + 줄눈 + 왼쪽 위 빛 */
  function stones(x, y, s, seed, cols, mortar, gap) {
    vor(x, y, s, seed);
    if (VD2 - VD1 < (gap || 1.1)) return mortar;
    let c = VID < 0.33 ? cols[0] : VID < 0.7 ? cols[1] : cols[2];
    const dx = x - VCX, dy = y - VCY;
    if (dx + dy < -s * 0.35) c = mixc(c, [255, 255, 255], 0.16); else if (dx + dy > s * 0.35) c = mul(c, 0.86);
    return c;
  }

  /** 지형 한 픽셀의 기본 색 (경계 섞기 전) — x, y는 지도 전체의 픽셀 좌표 */
  function base(t, P, x, y, v, m, tx, ty) {
    const lx = x & 15, ly = y & 15;
    switch (t) {
      case T.GRASS: case T.DARK: {
        const g = t === T.DARK ? PAL.black.g : P.g;
        const f = U.fbm(x / 26, y / 26, 11, 3);
        let c = band(g, f * 0.9 + 0.1);
        // 풀잎 다발: 네 칸마다 한 자리에 위로 솟은 잎 두세 개
        const cx = x >> 2, cy = y >> 2, r = n2(cx, cy, 7);
        if (r > 0.78) {
          const ox = (n2(cx, cy, 8) * 3) | 0, lx2 = (x & 3), ly2 = (y & 3);
          if ((lx2 === ox && ly2 >= 1) || (lx2 === ox + 1 && ly2 >= 2)) c = ly2 === 1 || (lx2 === ox + 1 && ly2 === 2) ? rgb(g[2]) : mixc(c, rgb(g[2]), 0.45);
        } else if (r < 0.1 && (x & 3) === 1 && (y & 3) === 3) c = rgb(g[0]);
        return c;
      }
      case T.DIRT: case T.FARM: {
        const f = U.fbm(x / 18, y / 18, 23, 2);
        let c = band(P.d, 0.25 + f * 0.6);
        if (t === T.FARM) { const row = (y + 2) % 6; c = row < 2 ? rgb(P.d[0]) : row === 5 ? rgb(P.d[2]) : c; }
        const r = n2(x, y, 3);
        if (r > 0.975) c = rgb(P.d[2]); else if (r > 0.96) c = rgb(P.d[0]);
        return c;
      }
      case T.ROAD: {
        const sx = (x + ((y >> 3) & 1) * 6) % 12, sy = y % 8;
        if (sx === 0 || sy === 0) return rgb(P.d[0]);
        const f = n2(x >> 2, y >> 2, 5);
        return mixc(rgb(P.s[0]), rgb(P.s[1]), f * 0.8);
      }
      case T.SAND: {
        const f = U.fbm(x / 30, y / 30, 31, 2);
        const rip = Math.sin(x * 0.35 + y * 0.8 + f * 9);
        let c = rip > 0.82 ? rgb(P.s[2]) : rip < -0.9 ? rgb(P.s[0]) : rgb(P.s[1]);
        if (n2(x, y, 9) > 0.985) c = rgb(P.s[0]);
        return c;
      }
      case T.SNOW: {
        const f = U.fbm(x / 22, y / 22, 41, 3);
        let c = band(P.snow, 0.35 + f * 0.7);
        if (n2(x, y, 13) > 0.992) c = [255, 255, 255];
        return c;
      }
      case T.ASH: {
        const a = P.ash || PAL.gray.ash;
        const f = U.fbm(x / 20, y / 20, 51, 3);
        let c = band(a, f);
        if (Math.abs(U.fbm(x / 9, y / 9, 53, 2) - 0.5) < 0.02) c = rgb(a[0]);   // 갈라진 금
        return c;
      }
      case T.SWAMP: {
        const f = U.fbm(x / 14, y / 14, 61, 3);
        return f > 0.58 ? [74, 84, 50] : f > 0.45 ? [60, 70, 44] : [48, 58, 40];
      }
      case T.STONE: case T.TILE: {
        // 엇갈린 돌 포석
        const row = Math.floor(y / 6), off = (row & 1) * 5;
        const sx = (x + off) % 10, sy = y % 6;
        const k = n2(Math.floor((x + off) / 10), row, 71);
        const tone = t === T.TILE ? [rgb('#8a8a96'), rgb('#a4a4b0'), rgb('#bcbcc8')] : [rgb(P.s[0]), rgb(P.s[1]), rgb(P.s[2])];
        if (sx === 0 || sy === 0) return mul(tone[0], 0.7);
        let c = k < 0.3 ? tone[0] : k < 0.75 ? tone[1] : tone[2];
        if (sy === 1 || sx === 1) c = mixc(c, [255, 255, 255], 0.12);
        if (sy === 5 || sx === 9) c = mul(c, 0.85);
        return c;
      }
      case T.WOOD: {
        const plank = Math.floor(y / 4), seam = (x + plank * 7) % 16;
        let c = plank & 1 ? rgb('#9a6a3e') : rgb('#a8784a');
        if (y % 4 === 0) c = rgb('#6a4424');
        else if (seam === 0) c = rgb('#7a5030');
        else if (n2(x >> 1, plank, 81) > 0.8) c = mul(c, 0.92);
        return c;
      }
      case T.CARPET: case T.RUG: {
        const col = t === T.RUG ? ['#6a2a3a', '#8a3a4a', '#c8a050'] : ['#7a2a2a', '#9a3a34', '#d8b060'];
        const bx = Math.min(lx, 15 - lx), by = Math.min(ly, 15 - ly);
        if ((bx === 1 || by === 1) && t === T.RUG) return rgb(col[2]);
        return (lx + ly) % 4 === 0 ? rgb(col[0]) : rgb(col[1]);
      }
      case T.FLOOR: {
        const bx = x % 8, by = y % 8;
        const k = n2(x >> 3, y >> 3, 91);
        let c = mixc(rgb(P.s[0]), rgb(P.s[1]), k);
        if (bx === 0 || by === 0) c = mul(c, 0.72); else if (bx === 1 || by === 1) c = mixc(c, [255, 255, 255], 0.1);
        return c;
      }
      case T.WALL: {
        const row = Math.floor(y / 5), off = (row & 1) * 4;
        const bx = (x + off) % 8;
        let c = mixc(rgb(P.c[1]), rgb(P.c[2]), n2((x + off) >> 3, row, 97) * 0.6);
        if (y % 5 === 0 || bx === 0) c = rgb(P.c[0]);
        return c;
      }
      case T.WATER: case T.DEEP: case T.SWAMP + 100: {
        const f = U.fbm(x / 34, y / 34, 101, 2);
        let c = t === T.DEEP ? mixc(rgb(P.w[0]), rgb(P.w[1]), f * 0.6) : mixc(rgb(P.w[1]), rgb(P.w[2]), f * 0.5);
        return c;
      }
      case T.LAVA: {
        const f = U.fbm(x / 12, y / 12, 111, 3);
        return f > 0.62 ? [60, 24, 20] : f > 0.52 ? [200, 60, 20] : f > 0.36 ? [240, 110, 30] : [255, 190, 70];
      }
      case T.ICE: {
        const f = U.fbm(x / 20, y / 20, 121, 2);
        let c = mixc([160, 210, 240], [210, 240, 255], f);
        if (((x + y) % 23) === 0 && n2(x >> 3, y >> 3, 3) > 0.6) c = [255, 255, 255];
        if (Math.abs(U.fbm(x / 11, y / 11, 123, 2) - 0.5) < 0.015) c = [120, 170, 210];
        return c;
      }
      case T.PIT: {
        const lip = m && m.T(tx, ty - 1) !== T.PIT;
        if (m && m.palName === 'rainbow') { // 구름 사이로 보이는 하늘 (한참 아래)
          let c = mixc(rgb('#9ac4f4'), rgb('#3a64b8'), Math.min(1, (ly + (lip ? 0 : 16)) / 40));
          const f = U.fbm(x / 14, y / 5, 91, 2);
          if (f > 0.64) c = mixc(c, [255, 255, 255], 0.55); else if (f > 0.58) c = mixc(c, [255, 255, 255], 0.25);
          if (lip && ly < 3) c = mixc(rgb('#c8d4ec'), rgb('#6a7ab0'), ly / 3);
          return c;
        }
        if (m && m.palName === 'space') { // 우주: 별이 흘러가는 깊은 남색
          if (lip && ly < 3) return mixc(rgb('#6a7890'), rgb('#1a2438'), ly / 3);
          const st = n2(x, y, 177); if (st > 0.985) return [255, 255, 255]; if (st > 0.97) return [150, 170, 220];
          return mixc([4, 6, 18], [14, 20, 44], U.fbm(x / 30, y / 30, 181, 2));
        }
        if (lip && ly < 4) return mul(rgb(P.c ? P.c[1] : '#2a2438'), 0.55 - ly * 0.1);
        return [6, 4, 10];
      }
      case T.BRIDGE: {
        const hor = m && m.T(tx, ty - 1) !== T.BRIDGE && m.T(tx, ty + 1) !== T.BRIDGE;
        const a = hor ? lx : ly, b2 = hor ? ly : lx;
        if (b2 < 2 || b2 > 13) return b2 === 0 || b2 === 15 ? [60, 40, 24] : [110, 74, 44];
        let c = (a % 4 === 0) ? rgb('#6a4424') : rgb('#a8784a');
        if (n2(x, y, 5) > 0.9) c = mul(c, 0.9);
        return c;
      }
      case T.CLOUD: {
        const f = U.fbm(x / 16, y / 16, 131, 3);
        return f > 0.6 ? [255, 255, 255] : f > 0.42 ? [236, 238, 255] : [212, 214, 246];
      }
      case T.CRYSTAL: {
        const cell = n2(Math.floor((x + y * 0.5) / 7), Math.floor((y - x * 0.4) / 7), 141);
        let c = band(PAL.planet.s, cell);
        if (((x * 3 + y * 5) % 17) === 0) c = [255, 248, 200];
        return c;
      }
      case T.METAL: {
        const bx = x % 16, by = y % 16;
        let c = [74, 82, 98];
        if (bx === 0 || by === 0) c = [40, 46, 58]; else if (bx === 1 || by === 1) c = [104, 112, 130];
        if ((bx === 3 || bx === 12) && (by === 3 || by === 12)) c = [150, 158, 176];
        return c;
      }
      case T.MEADOW: case T.PETALS: {
        // 꽃밭: 풀 위에 작은 꽃 무더기 · 꽃잎
        let c = base(T.GRASS, P, x, y, v, m, tx, ty);
        const cx = x >> 2, cy = y >> 2, r = n2(cx, cy, 331);
        if (t === T.MEADOW && r > 0.82 && U.vnoise(x / 20, y / 20, 332) > 0.42) {
          const ox = 1 + ((n2(cx, cy, 333) * 2) | 0), oy = 1 + ((n2(cx, cy, 335) * 2) | 0), lx2 = x & 3, ly2 = y & 3;
          const cols = [P.g[3], '#ffffff', '#ffd84a', '#ff8ab8', '#b8a8ff'];
          const fc = rgb(cols[(n2(cx, cy, 337) * cols.length) | 0]);
          if ((lx2 === ox && ly2 === oy)) return mixc(fc, [255, 255, 255], 0.35);
          if (Math.abs(lx2 - ox) + Math.abs(ly2 - oy) === 1) return fc;
        }
        if (t === T.PETALS) { const q = n2(x, y, 339); if (q > 0.992) return rgb(P.g[3]); if (q > 0.987) return mixc(c, [255, 240, 248], 0.6); }
        return c;
      }
      case T.DRY: {
        // 마른 풀: 누런 바탕에 짚 같은 줄
        const f = U.fbm(x / 24, y / 24, 341, 3);
        const lo = mixc(rgb(P.g[0]), rgb(P.s[0]), 0.55), mid = mixc(rgb(P.g[1]), rgb(P.s[1]), 0.6), hi = mixc(rgb(P.g[2]), rgb(P.s[2]), 0.6);
        let c = f < 0.36 ? lo : f < 0.7 ? mid : hi;
        const cx = x >> 2, cy = y >> 2;
        if (n2(cx, cy, 343) > 0.72) { const ox = (n2(cx, cy, 345) * 3) | 0; if ((x & 3) === ox && (y & 3) >= 1) c = (y & 3) === 1 ? mixc(hi, [255, 250, 210], 0.35) : hi; }
        return c;
      }
      case T.MOSS: {
        // 이끼: 어두운 초록 덩어리 사이로 돌이 비친다
        const f = U.fbm(x / 9, y / 9, 351, 3);
        const g0 = mixc(rgb(P.g[0]), [36, 64, 40], 0.45), g1 = mixc(rgb(P.g[1]), [60, 100, 56], 0.4);
        let c = f > 0.56 ? g1 : f > 0.4 ? g0 : mixc(rgb(P.c[1]), g0, 0.4);
        const q = n2(x >> 1, y >> 1, 353);
        if (f > 0.5 && q > 0.93) c = mixc(g1, [200, 230, 150], 0.35);
        return c;
      }
      case T.LEAVES: {
        // 숲 바닥: 흙 위에 떨어진 잎
        const f = U.fbm(x / 14, y / 14, 361, 2);
        let c = mixc(rgb(P.d[0]), rgb(P.g[0]), 0.35 + f * 0.3);
        const cx = x >> 2, cy = y >> 2, r = n2(cx, cy, 363);
        if (r > 0.45) {
          const lx2 = x & 3, ly2 = y & 3, ox = (n2(cx, cy, 365) * 2) | 0, oy = (n2(cx, cy, 367) * 2) | 0;
          if (lx2 >= ox && lx2 <= ox + 1 && ly2 >= oy && ly2 <= oy + 1 && !(lx2 === ox + 1 && ly2 === oy)) {
            const k = n2(cx, cy, 369);
            const lc = k < 0.4 ? rgb(P.g[1]) : k < 0.65 ? rgb(P.g[0]) : k < 0.85 ? [196, 128, 58] : [168, 84, 44];
            return lx2 === ox && ly2 === oy ? mixc(lc, [255, 255, 220], 0.2) : lc;
          }
        }
        if (n2(x, y, 371) > 0.985) c = mul(c, 0.7);
        return c;
      }
      case T.MUD: {
        const f = U.fbm(x / 11, y / 11, 381, 3);
        let c = mixc([70, 52, 38], mul(rgb(P.d[0]), 0.8), 0.4);
        if (f > 0.62) c = mixc(rgb(P.w[2]), [90, 76, 60], 0.55);          // 물웅덩이
        else if (f > 0.56) c = [58, 42, 30];
        else if (f < 0.3) c = mixc(c, rgb(P.d[1]), 0.35);
        if (f > 0.66 && n2(x, y, 383) > 0.9) c = mixc(c, [255, 255, 255], 0.4);
        return c;
      }
      case T.ROCKY: {
        // 맨 바위: 결 · 금 · 자잘한 돌
        const C = P.c.map(rgb);
        const f = U.fbm(x / 16, y / 16, 391, 3);
        let c = mixc(mixc(C[1], C[2], 0.55), rgb(P.d[1]), 0.25);
        if (f > 0.62) c = mixc(C[2], [255, 255, 255], 0.08); else if (f < 0.38) c = mixc(C[1], C[0], 0.3);
        if (Math.abs(U.fbm(x / 10, y / 10, 393, 2) - 0.5) < 0.018) c = C[0];
        const q = n2(x >> 1, y >> 1, 395); if (q > 0.965) c = mul(c, 0.8); else if (q > 0.955) c = mixc(c, [255, 255, 255], 0.2);
        return c;
      }
      case T.GRAVEL: {
        // 자갈: 흙 바탕에 작은 돌
        let c = mixc(rgb(P.d[0]), rgb(P.s[0]), 0.5);
        vor(x, y, 3.2, 401);
        if (VD1 < 1.25) { const k = VID; c = k < 0.3 ? [120, 116, 110] : k < 0.6 ? mixc(rgb(P.s[1]), [150, 146, 140], 0.5) : k < 0.85 ? [170, 164, 152] : mul(rgb(P.d[1]), 0.9); if (x - VCX + y - VCY < -0.6) c = mixc(c, [255, 255, 255], 0.22); }
        else if (VD1 < 1.8) c = mul(c, 0.82);
        return c;
      }
      case T.CRACKED: {
        // 갈라진 땅
        const base0 = P.ash ? rgb(P.ash[1]) : rgb(P.d[1]);
        vor(x, y, 7, 411);
        let c = mixc(base0, rgb(P.s[1]), 0.45 + VID * 0.2);
        if (VD2 - VD1 < 0.8) return mul(c, 0.74);
        if (VD2 - VD1 < 1.6) c = mul(c, 0.92); else if (x - VCX + y - VCY < -2) c = mixc(c, [255, 255, 255], 0.08);
        return c;
      }
      case T.COBBLE: {
        const cols = [mixc(rgb(P.s[0]), [120, 116, 112], 0.4), mixc(rgb(P.s[1]), [150, 146, 140], 0.35), mixc(rgb(P.s[2]), [180, 176, 168], 0.3)];
        return stones(x, y, 5.2, 421, cols, mul(rgb(P.d[0]), 0.72), 1.05);
      }
      case T.BRICK: {
        // 헤링본 벽돌
        const bx = Math.floor(x / 8), by = Math.floor(y / 8), lx2 = x & 7, ly2 = y & 7;
        const vert = (bx + by) & 1;
        const a = vert ? lx2 : ly2, b2 = vert ? ly2 : lx2;
        const cols = [[138, 70, 56], [166, 88, 66], [190, 110, 84]];
        if (a === 0 || a === 4 || b2 === 0) return [96, 62, 52];
        let c = cols[(n2(bx * 2 + (a > 4 ? 1 : 0), by, 431) * 3) | 0];
        if (a === 1 || a === 5) c = mixc(c, [255, 230, 200], 0.14);
        return c;
      }
      case T.MARBLE: {
        // 흰 대리석 격자 + 결
        const bx = x >> 3, by = y >> 3, lx2 = x & 7, ly2 = y & 7;
        let c = (bx + by) & 1 ? [222, 222, 232] : [200, 204, 218];
        if (lx2 === 0 || ly2 === 0) c = [168, 172, 190];
        const vein = Math.abs(U.fbm(x / 13, y / 13, 441, 3) - 0.5);
        if (vein < 0.02) c = mul(c, 0.86);
        if (lx2 === 1 && ly2 === 1) c = [246, 246, 252];
        return c;
      }
      case T.SANDSTONE: case T.HIERO: {
        // 큰 사암 판석 (HIERO: 판석마다 새긴 문양)
        const row = Math.floor(y / 8), off = (row & 1) * 8;
        const bx = Math.floor((x + off) / 16), lx2 = (x + off) & 15, ly2 = y & 7;
        const C = [rgb(PAL.yellow.s[0]), rgb(PAL.yellow.s[1]), rgb(PAL.yellow.s[2])];
        if (lx2 === 0 || ly2 === 0) return mul(C[0], 0.7);
        let c = mixc(C[1], C[(n2(bx, row, 451) * 3) | 0], 0.5);
        if (ly2 === 1 || lx2 === 1) c = mixc(c, [255, 250, 230], 0.2);
        if (ly2 === 7 || lx2 === 15) c = mul(c, 0.88);
        if (t === T.HIERO && n2(bx, row, 453) > 0.55 && lx2 > 3 && lx2 < 13 && ly2 > 1 && ly2 < 7) {
          const g = (n2(bx, row, 455) * 5) | 0, gx = lx2 - 4, gy = ly2 - 2;
          const on = g === 0 ? (gx === 4 && gy < 4) || (gy === 1 && gx > 2 && gx < 6)                   // 앙크
            : g === 1 ? (gy === 2 && gx > 1 && gx < 7) || (gy === 1 && (gx === 3 || gx === 5)) || (gx === 4 && gy === 2)   // 눈
            : g === 2 ? (gx === 2 && gy < 5) || (gy === 4 && gx < 7) || (gx === 6 && gy > 1)             // 새 발자국
            : g === 3 ? (gy === 0 && gx > 1 && gx < 7) || (gy === 4 && gx > 1 && gx < 7) || gx === 4          // 기둥
            : ((gx + gy) % 3 === 0 && gy < 5);                                                         // 물결
          if (on) c = mul(c, 0.62);
        }
        if (n2(x, y, 457) > 0.99) c = mul(c, 0.85);
        return c;
      }
      case T.PLANK: {
        // 부두 판자 (틈이 보이는 가로 널)
        const plank = Math.floor(y / 5), seam = (x + plank * 11) % 24;
        if (y % 5 === 0) return [40, 30, 26];
        let c = n2(plank, Math.floor((x + plank * 11) / 24), 461) > 0.5 ? [150, 116, 82] : [134, 100, 70];
        if (seam === 0) c = [78, 56, 40];
        else if (seam === 2 && y % 5 === 2) c = [70, 70, 80];                       // 못
        else if (y % 5 === 1) c = mixc(c, [255, 240, 210], 0.18);
        if (n2(x >> 1, plank, 463) > 0.9) c = mul(c, 0.9);
        return c;
      }
      case T.PLAZA: {
        // 광장: 가운데서 퍼지는 동심원 포석
        const pz = m && m.plazaNear ? m.plazaNear(x, y) : null;
        if (!pz) return base(T.COBBLE, P, x, y, v, m, tx, ty);
        const dx = x - pz.x, dy = y - pz.y, r = Math.sqrt(dx * dx + dy * dy);
        const ring = Math.floor(r / 5), ang = Math.atan2(dy, dx) + ring * 0.37;
        const seg = Math.max(6, Math.round((ring + 0.5) * 5 * Math.PI * 2 / 7));
        const a = ((ang / (Math.PI * 2)) * seg % 1 + 1) % 1;
        const cols = pz.cols || [rgb(P.s[0]), rgb(P.s[1]), rgb(P.s[2])];
        if (r < 6) return r < 4 ? mixc(cols[2], [255, 240, 200], 0.3) : mul(cols[0], 0.7);
        if (r % 5 < 0.9 || a < 0.06) return mul(cols[0], 0.66);
        let c = cols[((n2(ring, Math.floor(ang / (Math.PI * 2) * seg), 471) * 3) | 0)];
        if (ring % 4 === 3) c = mixc(c, pz.accent ? rgb(pz.accent) : [200, 90, 70], 0.35);
        if (r % 5 < 1.8) c = mixc(c, [255, 255, 255], 0.12);
        return c;
      }
      case T.CAVE: case T.ROOTS: case T.ORE: {
        // 동굴 바닥: 흙과 바위가 섞인 거친 바닥 (ROOTS: 뿌리가 기어간다, ORE: 금가루가 반짝)
        const C = P.c.map(rgb);
        const f = U.fbm(x / 12, y / 12, 481, 3);
        let c = mixc(rgb(P.d[0]), C[1], 0.35 + f * 0.3);
        if (f > 0.64) c = mixc(c, C[2], 0.35); else if (f < 0.34) c = mul(c, 0.86);
        vor(x, y, 4.5, 483); if (VD1 < 1.2 && VID > 0.7) c = mixc(C[2], [255, 255, 255], 0.12); else if (VD1 < 1.7 && VID > 0.7) c = mul(c, 0.78);
        if (t === T.ROOTS) {
          const r1 = Math.abs(U.fbm(x / 22, y / 22, 485, 3) - 0.5), r2 = Math.abs(U.fbm(x / 17, y / 17, 487, 2) - 0.5);
          if (r1 < 0.022 || r2 < 0.014) c = r1 < 0.01 || r2 < 0.006 ? [132, 92, 58] : [96, 64, 40];
          else if (r1 < 0.03) c = mul(c, 0.8);
        }
        if (t === T.ORE) { const q = n2(x, y, 489); if (q > 0.992) c = [255, 236, 140]; else if (q > 0.985) c = [220, 180, 80]; }
        return c;
      }
      case T.WETSTONE: {
        // 물에 젖은 돌: 청회색 판석, 줄눈의 이끼, 물웅덩이
        const cols = [[74, 96, 112], [92, 116, 132], [112, 138, 152]];
        let c = stones(x, y, 7, 491, cols, [46, 84, 76], 1.2);
        const f = U.fbm(x / 15, y / 15, 493, 2);
        if (f > 0.64) c = mixc(c, [150, 200, 230], 0.45); if (f > 0.7 && n2(x, y, 495) > 0.92) c = [220, 245, 255];
        return c;
      }
      case T.MIRROR: {
        // 거울 바닥: 짙은 보랏빛 윤기, 비스듬한 빛줄기, 별처럼 박힌 반짝임
        const bx = x >> 4, by = y >> 4, lx2 = x & 15, ly2 = y & 15;
        let c = (bx + by) & 1 ? [48, 36, 78] : [58, 44, 92];
        if (lx2 === 0 || ly2 === 0) c = [120, 96, 170];
        const d = (x + y * 0.6) % 40; if (d < 2) c = mixc(c, [220, 200, 255], 0.35); else if (d < 4) c = mixc(c, [200, 180, 255], 0.12);
        if (n2(x, y, 501) > 0.994) c = [255, 255, 255];
        return c;
      }
      case T.ICEBRICK: {
        const row = Math.floor(y / 6), off = (row & 1) * 6, bx = Math.floor((x + off) / 12), lx2 = (x + off) % 12, ly2 = y % 6;
        if (lx2 === 0 || ly2 === 0) return [120, 150, 190];
        let c = mixc([176, 206, 232], [214, 236, 250], n2(bx, row, 511));
        if (ly2 === 1) c = mixc(c, [255, 255, 255], 0.35);
        if (Math.abs(U.fbm(x / 8, y / 8, 513, 2) - 0.5) < 0.02) c = [150, 186, 220];
        return c;
      }
      case T.GRATE: {
        // 쇠 격자: 구멍 사이로 아래 어둠, 볼트
        const lx2 = x & 7, ly2 = y & 7, bx = x >> 4, by = y >> 4;
        if ((x & 15) === 0 || (y & 15) === 0) return [60, 66, 80];
        if (lx2 > 1 && lx2 < 6 && ly2 > 1 && ly2 < 6) return (x & 15) > 7 === (y & 15) > 7 ? [10, 12, 18] : [16, 18, 26];
        let c = [98, 106, 124];
        if (lx2 === 1 || ly2 === 1) c = [132, 140, 158];
        if (n2(bx, by, 521) > 0.8) c = mixc(c, [150, 110, 80], 0.3);   // 녹
        return c;
      }
      case T.CHECKER: {
        // 성 바닥: 검은 대리석과 짙은 진홍 바둑판, 네 칸마다 금줄
        const bx = x >> 4, by = y >> 4, lx2 = x & 15, ly2 = y & 15;
        let c = (bx + by) & 1 ? [30, 24, 38] : [84, 24, 40];
        if (((bx & 3) === 0 && lx2 === 0) || ((by & 3) === 0 && ly2 === 0)) return [200, 160, 80];
        if (lx2 === 0 || ly2 === 0) c = mul(c, 0.7);
        const vein = Math.abs(U.fbm(x / 11, y / 11, 531, 3) - 0.5); if (vein < 0.02) c = mixc(c, [255, 255, 255], 0.12);
        if (lx2 === 1 || ly2 === 1) c = mixc(c, [255, 255, 255], 0.06);
        return c;
      }
      case T.PANEL: {
        // 정거장 판: 네모 판 · 빛줄 · 나사
        const lx2 = x & 15, ly2 = y & 15, bx = x >> 4, by = y >> 4;
        let c = [58, 66, 84];
        if (lx2 === 0 || ly2 === 0) c = [26, 30, 42]; else if (lx2 === 1 || ly2 === 1) c = [84, 94, 116];
        if ((lx2 === 3 || lx2 === 12) && (ly2 === 3 || ly2 === 12)) c = [130, 140, 160];
        if (n2(bx, by, 541) > 0.7 && ly2 === 8 && lx2 > 3 && lx2 < 12) c = [90, 220, 255];
        return c;
      }
      case T.SKYTILE: {
        // 구름 신전 바닥: 옅은 하늘빛 대리석 + 금 테
        const bx = x >> 4, by = y >> 4, lx2 = x & 15, ly2 = y & 15;
        let c = mixc([232, 238, 252], [210, 222, 246], n2(bx, by, 551));
        if (lx2 === 0 || ly2 === 0) c = [230, 196, 110];
        else if (lx2 === 1 || ly2 === 1) c = [250, 252, 255];
        const cx = lx2 - 7.5, cy = ly2 - 7.5, r = Math.sqrt(cx * cx + cy * cy);
        if (Math.abs(r - 4.5) < 0.6 && (bx + by) % 2 === 0) c = [226, 206, 150];
        return c;
      }
      default: return [0, 0, 0];
    }
  }

  /* ───────── 지형 경계: 칸 중심 사이를 이중선형으로 이어 둥글게, 잡음으로 굽이지게 ─────────
     부드러운 지형(풀 · 흙 · 모래 · 물 …)끼리는 네모 칸이 아니라 둥근 덩어리로 이어진다.
     먼저 물/땅을 가르고(물가 거품 · 젖은 띠에 쓸 거리 oEdge), 그다음 같은 편 안에서 가장 센 지형을 고른다. */
  let oT = 0, oEdge = 9, oLava = 0;
  const cT = [0, 0, 0, 0], cW = [0, 0, 0, 0];
  function cornerT(m, x, y, t0, h0) {
    const t = m.T(x, y);
    if (!BLEND[t] || m.H(x, y) !== h0) return t0;
    return t;
  }
  function owner(m, tx, ty, x, y) {
    const t0 = m.T(tx, ty);
    oEdge = 9; oLava = 0;
    if (!BLEND[t0]) { oT = t0; return t0; }
    const h0 = m.H(tx, ty);
    const fx = (x - 7.5) / 16, fy = (y - 7.5) / 16;
    const ix = Math.floor(fx), iy = Math.floor(fy);
    const u = fx - ix, v = fy - iy;
    cT[0] = cornerT(m, ix, iy, t0, h0); cT[1] = cornerT(m, ix + 1, iy, t0, h0); cT[2] = cornerT(m, ix, iy + 1, t0, h0); cT[3] = cornerT(m, ix + 1, iy + 1, t0, h0);
    if (cT[0] === t0 && cT[1] === t0 && cT[2] === t0 && cT[3] === t0) { oT = t0; return t0; }
    cW[0] = (1 - u) * (1 - v); cW[1] = u * (1 - v); cW[2] = (1 - u) * v; cW[3] = u * v;
    // 1) 물과 땅
    let L = 0;
    for (let k = 0; k < 4; k++) { if (LIQ[cT[k]]) L += cW[k]; if (cT[k] === T.LAVA) oLava += cW[k]; }
    let wantLiq = L >= 1;
    if (L > 0 && L < 1) {
      const e = L - 0.5 + (U.vnoise(x / 6.1, y / 6.1, 401) - 0.5) * 0.44 + (U.vnoise(x / 2.2, y / 2.2, 403) - 0.5) * 0.08;
      wantLiq = e > 0; oEdge = e;
    }
    // 2) 같은 편 안에서 가장 센 지형
    let best = -1, bs = -9;
    for (let k = 0; k < 4; k++) {
      const t = cT[k]; if (LIQ[t] !== wantLiq) continue;
      let sc = 0; for (let j = 0; j < 4; j++) if (cT[j] === t) sc += cW[j];
      if (t === best) continue;
      sc += (U.vnoise(x / 6.5, y / 6.5, 500 + t * 13) - 0.5) * 0.62 + (U.vnoise(x / 2.4, y / 2.4, 520 + t * 7) - 0.5) * 0.12 + PRI[t] * 0.002;
      if (sc > bs) { bs = sc; best = t; }
    }
    oT = best < 0 ? t0 : best;
    return oT;
  }
  /** 이중선형 표본 (칸 중심 기준) */
  function bil(f, m, x, y) {
    const fx = U.clamp((x - 7.5) / 16, 0, m.w - 1.001), fy = U.clamp((y - 7.5) / 16, 0, m.h - 1.001);
    const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy, i = iy * m.w + ix;
    const x1 = ix + 1 < m.w ? 1 : 0, y1 = iy + 1 < m.h ? m.w : 0;
    return (f[i] * (1 - u) + f[i + x1] * u) * (1 - v) + (f[i + y1] * (1 - u) + f[i + y1 + x1] * u) * v;
  }
  /** 지역 경계 흐림: 지역마다 칸 비율을 흐린 장(field) → 칸마다 가장 가까운 다른 지역 */
  function regionFields(m, R) {
    const W = m.w, H = m.h, N = W * H, nR = REGIONS.length;
    const F = [], tmp = new Float32Array(N);
    const blur = (a) => {
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < H; y++) { let acc = 0; const row = y * W; for (let x = -R; x <= R; x++) acc += a[row + U.clamp(x, 0, W - 1)]; for (let x = 0; x < W; x++) { tmp[row + x] = acc / (2 * R + 1); acc += a[row + Math.min(W - 1, x + R + 1)] - a[row + Math.max(0, x - R)]; } }
        for (let x = 0; x < W; x++) { let acc = 0; for (let y = -R; y <= R; y++) acc += tmp[U.clamp(y, 0, H - 1) * W + x]; for (let y = 0; y < H; y++) { a[y * W + x] = acc / (2 * R + 1); acc += tmp[Math.min(H - 1, y + R + 1) * W + x] - tmp[Math.max(0, y - R) * W + x]; } }
      }
    };
    const used = new Set(m.reg);
    for (let r = 0; r < nR; r++) {
      if (!used.has(r)) { F.push(null); continue; }
      const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = m.reg[i] === r ? 1 : 0;
      blur(a); F.push(a);
    }
    const reg2 = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const own = m.reg[i]; let bi = -1, bv = 0.015;
      for (let r = 0; r < nR; r++) if (F[r] && r !== own && F[r][i] > bv) { bv = F[r][i]; bi = r; }
      reg2[i] = bi + 1;
    }
    m.regF = F; m.reg2 = reg2;
  }

  /** 지도 픽셀 하나의 최종 색 */
  function pixel(m, x, y) {
    const tx = x >> 4, ty = y >> 4, lx = x & 15, ly = y & 15;
    const t0 = m.T(tx, ty);
    const P = m.pal(tx, ty);
    if (t0 === T.CLIFF) return cliff(m, tx, ty, lx, ly, x, y);
    if (t0 === T.STAIRS) return stairs(m, tx, ty, lx, ly, x, y, P);
    if (t0 === T.WALL) return wall(m, tx, ty, lx, ly, x, y, P);
    if (t0 === T.VOID) return [0, 0, 0];
    const t = owner(m, tx, ty, x, y);
    const edge = oEdge, lava = oLava;
    let c = base(t, P, x, y, 0, m, tx, ty);
    // 지역 경계: 두 지역의 빛깔을 천천히 섞는다
    if (m.regF) {
      const i = ty * m.w + tx, r2 = m.reg2[i];
      if (r2) {
        const fa = bil(m.regF[m.reg[i]], m, x, y), fb = bil(m.regF[r2 - 1], m, x, y);
        let k = fb / (fa + fb + 1e-6);
        k += (U.vnoise(x / 7, y / 7, 611) - 0.5) * 0.22 * Math.min(1, k * 4) * Math.min(1, (1 - k) * 4);
        if (k > 0.015) c = mixc(c, base(t, PAL[REGIONS[r2 - 1]] || P, x, y, 0, m, tx, ty), U.clamp(k, 0, 1));
      }
    }
    // 넓은 땅: 아주 큰 무늬로 색을 조금씩 흔든다 (단조롭지 않게)
    if (m.outdoor && NATURAL[t]) {
      const mv = U.vnoise(x / 150, y / 150, 777) - 0.5, mv2 = U.vnoise(x / 60, y / 60, 779) - 0.5;
      c = [c[0] * (1 + mv * 0.12 + mv2 * 0.05), c[1] * (1 + mv * 0.03 + mv2 * 0.04), c[2] * (1 - mv * 0.1)];
    }
    const h = m.H(tx, ty);
    // 높은 땅은 조금 더 밝고 따뜻하게 (고저차가 눈에 보이도록)
    if (h > 0 && m.outdoor) c = mixc(c, [255, 250, 226], Math.min(0.16, h * 0.045));
    // 물가: 물 쪽은 거품 · 밝은 띠, 땅 쪽은 젖은 띠
    if (LIQ[t]) {
      if (edge < 0.06) c = rgb(P.w[3]);
      else if (edge < 0.13) c = mixc(c, rgb(P.w[3]), 0.35);
      else if (edge < 0.3) c = mixc(c, rgb(P.w[2]), 0.45);
    } else if (edge < 0 && edge > -0.1) c = mul(c, 0.74 + (edge + 0.1) * 1.2);
    else if (edge <= -0.1 && edge > -0.16) c = mul(c, 0.9);
    // 용암 둘레: 식은 딱지와 열기
    if (t !== T.LAVA && lava > 0.2) { c = lava > 0.42 ? mixc([40, 22, 20], [255, 120, 40], (lava - 0.42) * 1.5) : mixc(c, [60, 30, 24], (lava - 0.2) * 3); }
    // 고원 가장자리: 옆 · 아래가 낮으면 테두리, 위가 낮으면 밝은 턱
    const hl = m.H(tx - 1, ty), hr = m.H(tx + 1, ty), hu = m.H(tx, ty - 1);
    const fl = m.T(tx - 1, ty) === T.CLIFF, fr = m.T(tx + 1, ty) === T.CLIFF;
    if (hl < h && !fl && lx < 2) c = lx === 0 ? mul(c, 0.55) : mul(c, 0.8);
    if (hr < h && !fr && lx > 13) c = lx === 15 ? mul(c, 0.55) : mul(c, 0.8);
    if (hu < h && m.T(tx, ty - 1) !== T.CLIFF && ly < 2) c = ly === 0 ? mixc(c, [255, 255, 255], 0.35) : mixc(c, [255, 255, 255], 0.15);
    // 높은 곳 옆의 낮은 칸에 드리운 그림자
    if (hl > h && lx < 3 && m.T(tx - 1, ty) !== T.CLIFF) c = mul(c, 0.72 + lx * 0.08);
    if (hr > h && lx > 12 && m.T(tx + 1, ty) !== T.CLIFF) c = mul(c, 0.72 + (15 - lx) * 0.08);
    // 절벽 면 바로 아래: 발치 그림자
    if (m.T(tx, ty - 1) === T.CLIFF && ly < 4) c = mul(c, 0.66 + ly * 0.085);
    // 벽 아래 그림자 (실내 · 던전)
    if (m.T(tx, ty - 1) === T.WALL && ly < 5) c = mul(c, 0.62 + ly * 0.075);
    if (m.T(tx - 1, ty) === T.WALL && lx < 2 && !m.outdoor) c = mul(c, 0.8 + lx * 0.08);
    return c;
  }

  /* ───────── 벽: 비스듬히 내려다본 벽 (아래가 트인 칸은 앞면, 나머지는 윗면) ─────────
     m.wallStyle: brick · rock · root · mine · vein · sand · mirror · marble · ice · castle · tech · house */
  const WS = {
    brick: { top: [42, 36, 56], rim: [120, 110, 140] }, rock: { top: [34, 28, 30], rim: [110, 92, 80] }, root: { top: [30, 34, 24], rim: [96, 110, 70] },
    mine: { top: [38, 28, 22], rim: [130, 96, 64] }, vein: { top: [24, 26, 32], rim: [110, 116, 130] }, sand: { top: [110, 78, 44], rim: [230, 196, 130] },
    mirror: { top: [30, 22, 50], rim: [200, 170, 255] }, marble: { top: [176, 186, 214], rim: [250, 240, 200] }, ice: { top: [96, 130, 170], rim: [220, 240, 255] },
    castle: { top: [20, 16, 28], rim: [110, 60, 80] }, tech: { top: [22, 26, 36], rim: [90, 200, 240] }, house: { top: [58, 40, 30], rim: [150, 110, 76] },
  };
  function wallStyle(m) { return m.wallStyle || (m.indoor ? 'house' : 'brick'); }
  function wall(m, tx, ty, lx, ly, x, y, P) {
    const st = wallStyle(m), S = WS[st] || WS.brick;
    const below = m.T(tx, ty + 1);
    if (below !== T.WALL && below !== T.VOID) return wallFace(st, m, tx, ty, lx, ly, x, y, P);
    // 윗면
    let c = S.top.slice();
    const f = U.fbm(x / 7, y / 7, 601, 2);
    c = mul(c, 0.86 + f * 0.28);
    if (st === 'marble' || st === 'ice' || st === 'sand') { if (((x >> 3) + (y >> 3)) & 1) c = mul(c, 0.95); }
    if (st === 'root' && Math.abs(U.fbm(x / 12, y / 12, 603, 2) - 0.5) < 0.03) c = [70, 50, 34];
    const open = (t) => t !== T.WALL && t !== T.VOID;
    const nu = open(m.T(tx, ty - 1)), nl = open(m.T(tx - 1, ty)), nr = open(m.T(tx + 1, ty));
    if (nu && ly < 2) c = ly === 0 ? mul(S.rim, 0.6) : S.rim;
    if (nl && lx < 2) c = lx === 0 ? mul(S.rim, 0.6) : S.rim;
    if (nr && lx > 13) c = lx === 15 ? mul(S.rim, 0.6) : S.rim;
    return c;
  }
  function wallFace(st, m, tx, ty, lx, ly, x, y, P) {
    const S = WS[st] || WS.brick;
    // 벽 횃불
    if (m.sconce && m.sconce[ty * m.w + tx] && lx >= 5 && lx <= 10 && ly >= 1 && ly <= 13) {
      if (ly >= 9 && lx >= 6 && lx <= 9) return ly === 9 ? [150, 110, 60] : [70, 50, 34];          // 받침
      if (ly >= 7 && ly <= 8 && lx >= 7 && lx <= 8) return [90, 64, 40];
      const fx2 = lx - 7.5, fy2 = ly - 4.5;
      if (fx2 * fx2 / 4 + fy2 * fy2 / 9 < 1) return fy2 > 0.5 ? [255, 150, 60] : Math.abs(fx2) < 0.8 ? [255, 250, 200] : [255, 210, 90];
    }
    const dk = 1.02 - ly * 0.02;                 // 아래로 조금씩 어둡게
    let c;
    switch (st) {
      case 'rock': case 'root': case 'mine': case 'vein': {
        const C = P.c.map(rgb);
        const vx = U.vnoise(x / 3.2, ty * 2.7, 611), sx = Math.sin((y + U.vnoise(x / 5, y / 9, 613) * 6) * 0.8);
        c = vx > 0.64 ? C[2] : vx < 0.3 ? C[0] : C[1];
        if (sx > 0.9) c = mixc(c, C[2], 0.4); else if (sx < -0.93) c = mixc(c, C[0], 0.6);
        if (st === 'vein') { const r = Math.abs(U.fbm(x / 9, y / 5, 615, 2) - 0.5); c = mixc(C[0], [120, 124, 136], 0.5); if (vx > 0.6) c = mixc(c, [150, 156, 170], 0.5); if (r < 0.025) c = r < 0.01 ? [236, 240, 255] : [180, 190, 214]; }
        if (st === 'root') { const r = Math.abs(U.fbm(x / 6, y / 16, 617, 2) - 0.5); if (r < 0.04) c = r < 0.018 ? [120, 84, 52] : [84, 58, 36]; if (ly > 11 && U.vnoise(x / 2, 0, 619) > 0.55) c = [70, 110, 60]; }
        if (st === 'mine' && (tx % 5 === 2)) { if (lx > 3 && lx < 12) { c = lx === 4 || lx === 11 ? [70, 46, 28] : [128, 88, 52]; if (ly % 5 === 0) c = [96, 64, 38]; } }
        if (st === 'mine' && ly < 3) c = ly === 0 ? [70, 46, 28] : [128, 88, 52];
        break;
      }
      case 'sand': {
        const row = Math.floor(ly / 8), off = (row & 1) * 8, bx = Math.floor((x + off) / 16), l2 = (x + off) & 15;
        const C = [rgb(PAL.yellow.s[0]), rgb(PAL.yellow.s[1]), rgb(PAL.yellow.s[2])];
        c = mixc(C[1], C[(n2(bx, ty * 2 + row, 621) * 3) | 0], 0.5);
        if (l2 === 0 || ly % 8 === 0) c = mul(C[0], 0.72);
        if (ly >= 5 && ly <= 7 && (x % 6 === 0 || (x % 6 === 3 && ly === 6))) c = mul(c, 0.6);   // 새긴 띠
        if (tx % 7 === 3 && ly > 1 && ly < 13) { const gx = lx - 4, gy = ly - 2; if (gx >= 0 && gx < 8 && ((gx === 3 || gx === 4) || (gy === 3 && gx > 0 && gx < 7))) c = [200, 60, 50]; }
        break;
      }
      case 'mirror': {
        c = [52, 38, 86];
        const d = (x * 0.8 + ly * 1.6) % 22; if (d < 2) c = [150, 120, 220]; else if (d < 3) c = [96, 76, 150];
        if (lx === 0 || lx === 15) c = [34, 24, 58];
        if (ly < 2) c = [220, 180, 90];
        break;
      }
      case 'marble': {
        c = ((x >> 3) & 1) ? [226, 230, 244] : [210, 216, 236];
        if ((x & 7) === 0) c = [180, 186, 210];
        if (ly < 3) c = ly === 1 ? [250, 222, 140] : [210, 170, 90];
        if (ly > 12) c = [180, 190, 220];
        if (tx % 4 === 1 && lx > 5 && lx < 10) c = lx === 6 || lx === 9 ? [196, 202, 226] : [240, 242, 252];   // 기둥
        break;
      }
      case 'ice': {
        const row = Math.floor(ly / 5), off = (row & 1) * 6, l2 = (x + off) % 12;
        c = mixc([150, 190, 226], [196, 226, 248], n2(Math.floor((x + off) / 12), ty * 4 + row, 631));
        if (l2 === 0 || ly % 5 === 0) c = [106, 146, 190];
        if ((x + ly * 2) % 17 === 0) c = [240, 250, 255];
        if (ly > 12) c = mixc(c, [255, 255, 255], 0.45);
        break;
      }
      case 'castle': {
        const row = Math.floor(ly / 4), off = (row & 1) * 5, l2 = (x + off) % 10;
        c = mixc([48, 44, 64], [62, 56, 80], n2(Math.floor((x + off) / 10), ty * 4 + row, 641));
        if (l2 === 0 || ly % 4 === 0) c = [26, 22, 36];
        if (tx % 6 === 3 && lx > 3 && lx < 12 && ly < 14) {           // 진홍 깃발
          c = lx === 4 || lx === 11 ? [100, 20, 36] : [150, 30, 50];
          if (ly === 13 && (lx === 7 || lx === 8)) c = [26, 22, 36];
          if (ly > 4 && ly < 9 && lx > 5 && lx < 10) c = (lx + ly) % 2 ? [220, 180, 90] : [180, 140, 60];
          if (ly === 0) c = [200, 160, 80];
        }
        break;
      }
      case 'tech': {
        c = [52, 60, 78];
        if (lx === 0 || lx === 15) c = [30, 34, 46];
        if (ly === 9 || ly === 10) c = (tx + Math.floor(x / 3)) % 5 === 0 ? [140, 240, 255] : [60, 170, 210];
        if (ly < 2) c = [100, 110, 130];
        if ((lx === 3 || lx === 12) && ly === 4) c = [150, 160, 180];
        break;
      }
      case 'house': {
        // 회벽 + 아래 나무 판벽 + 걸레받이
        const pw = mixc(rgb(P.s[2]), [246, 238, 222], 0.55);
        c = ly < 9 ? mixc(pw, [255, 255, 255], (U.vnoise(x / 5, y / 5, 651) - 0.5) * 0.1) : ly === 9 ? [120, 84, 56] : ly > 13 ? [70, 48, 34] : ((x + (tx & 1) * 3) % 6 === 0 ? [110, 76, 50] : [146, 104, 70]);
        if (ly === 0) c = [96, 66, 44]; else if (ly === 1) c = mul(pw, 0.85);
        break;
      }
      default: {
        const C = P.c.map(rgb);
        const row = Math.floor(ly / 5), off = (row & 1) * 4, bx = (x + off) % 8;
        c = mixc(C[1], C[2], n2((x + off) >> 3, ty * 4 + row, 97) * 0.6);
        if (ly % 5 === 0 || bx === 0) c = C[0];
        if (ly < 2) c = ly === 0 ? mul(S.rim, 0.7) : S.rim;
      }
    }
    c = mul(c, dk);
    if (ly === 15) c = mul(c, 0.6);
    return c;
  }

  /** 절벽 면: 위 고원의 풀이 턱으로 늘어지고, 아래로 갈수록 어둡다 */
  function cliff(m, tx, ty, lx, ly, x, y) {
    let k = 1;
    while (k < 8 && m.T(tx, ty - k) === T.CLIFF) k++;
    const topY = ty - k;                        // 고원 칸
    let n = k; while (m.T(tx, ty + (n - k) + 1) === T.CLIFF && n < 12) n++;
    const P = m.pal(tx, topY);
    const row = k - 1;                          // 위에서 몇 번째 면 줄인가
    const rows = n;
    const C = P.c.map(rgb);
    // 바위: 세로 결 + 가로 지층
    const vx = U.vnoise(x / 3, ty * 3.1, 211);
    const st = Math.sin((y + U.vnoise(x / 6, y / 12, 213) * 5) * 0.9);
    let c = vx > 0.62 ? C[2] : vx < 0.3 ? C[0] : C[1];
    if (st > 0.93) c = mixc(c, C[2], 0.5); else if (st < -0.95) c = mixc(c, C[0], 0.6);
    if (n2(x, y, 219) > 0.97) c = C[0];
    // 아래로 갈수록 어둡게
    const depth = (row * 16 + ly) / (rows * 16);
    c = mul(c, 1.06 - depth * 0.38);
    // 맨 윗줄: 고원 지형이 턱처럼 늘어진다
    if (row === 0) {
      const tt = m.T(tx, topY);
      const lip = 3 + U.vnoise(x / 2.7, tx, 223) * 3.2;
      if (ly < lip) {
        const top = base(tt === T.CLIFF ? T.GRASS : tt, P, x, y, 0, m, tx, topY);
        c = ly > lip - 1.4 ? mul(top, 0.62) : mul(top, 0.92);
      }
    }
    // 좌우 끝의 둥근 모서리
    const lc = m.T(tx - 1, ty) !== T.CLIFF, rc = m.T(tx + 1, ty) !== T.CLIFF;
    if (lc && lx < 2) c = mul(c, lx === 0 ? 0.55 : 0.78);
    if (rc && lx > 13) c = mul(c, lx === 15 ? 0.55 : 0.78);
    return c;
  }

  function stairs(m, tx, ty, lx, ly, x, y, P) {
    let k = 1; while (k < 8 && (m.T(tx, ty - k) === T.CLIFF || m.T(tx, ty - k) === T.STAIRS)) k++;
    const Q = m.pal(tx, ty - k);
    const C = Q.c.map(rgb);
    const side = lx < 2 || lx > 13;
    if (side) return mul(C[0], lx === 0 || lx === 15 ? 0.7 : 1);
    const step = ly % 4;
    let c = step === 0 ? mixc(C[2], [255, 255, 255], 0.25) : step === 3 ? C[0] : C[1];
    if (n2(x, y, 231) > 0.94) c = mul(c, 0.9);
    return c;
  }

  /* ───────── 움직이는 물결 (매 프레임, 보이는 물 칸 위에만) ───────── */
  function waterFx(g, m, tx, ty, sx, sy, t) {
    const tt = m.T(tx, ty);
    if (tt !== T.WATER && tt !== T.DEEP && tt !== T.LAVA) return;
    const P = m.pal(tx, ty);
    if (tt === T.LAVA) {
      const k = (Math.sin(t * 2 + tx * 1.7 + ty) + 1) / 2;
      g.fillStyle = 'rgba(255,220,120,' + (0.12 + k * 0.18).toFixed(2) + ')';
      g.fillRect(sx + ((tx * 5 + (t * 3 | 0)) % 12), sy + ((ty * 7) % 12), 3, 1);
      return;
    }
    g.fillStyle = P.w[2];
    for (let i = 0; i < 2; i++) {
      const ph = t * 1.3 + n2(tx, ty, 300 + i) * 6.28;
      const x = sx + ((n2(tx, ty, 310 + i) * 12) | 0);
      const y = sy + ((n2(tx, ty, 320 + i) * 13) | 0);
      const w = 2 + ((Math.sin(ph) + 1) * 1.6 | 0);
      if (Math.sin(ph * 0.7) > -0.2) g.fillRect(x, y, w, 1);
    }
  }

  /** 작은 지도 한 칸 색 */
  function miniCol(t, P) {
    switch (t) {
      case T.WATER: return P.w[2]; case T.DEEP: return P.w[1]; case T.LAVA: return '#ff6a2a'; case T.CLIFF: return P.c[1];
      case T.SAND: return '#d8c088'; case T.SNOW: return '#e8f0f8'; case T.ICE: return '#bfe4f8';
      case T.ROAD: case T.DIRT: case T.FARM: return '#b89868'; case T.MUD: return '#6a5040'; case T.GRAVEL: return '#9a8e7e'; case T.ROCKY: return P.c[2];
      case T.CRACKED: return '#a89070'; case T.DRY: return '#b8b060'; case T.LEAVES: return P.g[0]; case T.MOSS: return '#4a6a44'; case T.MEADOW: case T.PETALS: return P.g[2];
      case T.WALL: return '#4a4058'; case T.COBBLE: case T.STONE: case T.TILE: case T.FLOOR: case T.PLAZA: case T.MARBLE: return '#9a98a8';
      case T.BRICK: return '#a86050'; case T.SANDSTONE: case T.HIERO: return '#d8b070'; case T.PLANK: case T.WOOD: case T.BRIDGE: return '#9a6a3e';
      case T.ASH: return '#6a6670'; case T.VOID: return '#05040a'; case T.PIT: return '#141018'; case T.CLOUD: return '#f0f0ff';
      default: return P.g[2];
    }
  }
  G.tiles = { miniCol, TS, T, NAMES, PROP, PRI, PAL, REGIONS, BLEND, LIQ, pixel, base, waterFx, rgb, regionFields, WS };
})();
