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
  };
  const NAMES = Object.keys(T);
  // 성질: s=막힘 · w=물(얕음) · d=깊은 물 · h=위험(구덩이 · 용암) · slow=느림 · slip=미끄러움
  const PROP = [];
  for (const k of NAMES) PROP[T[k]] = {};
  Object.assign(PROP[T.VOID], { s: 1 }); Object.assign(PROP[T.CLIFF], { s: 1, face: 1 }); Object.assign(PROP[T.WALL], { s: 1, wall: 1 });
  Object.assign(PROP[T.DEEP], { s: 1, d: 1, liquid: 1 }); Object.assign(PROP[T.WATER], { w: 1, slow: 0.72, liquid: 1 }); Object.assign(PROP[T.SWAMP], { slow: 0.6, liquid: 1 });
  Object.assign(PROP[T.LAVA], { h: 'lava', liquid: 1 }); Object.assign(PROP[T.PIT], { h: 'pit' }); Object.assign(PROP[T.ICE], { slip: 1 }); Object.assign(PROP[T.STAIRS], { stairs: 1 });
  Object.assign(PROP[T.SNOW], { slow: 0.9 }); Object.assign(PROP[T.SAND], { slow: 0.94 });
  // 경계를 섞는 순위 (높을수록 이웃 칸으로 번진다)
  const PRI = new Array(32).fill(0);
  PRI[T.GRASS] = 6; PRI[T.DARK] = 6; PRI[T.SNOW] = 7; PRI[T.DIRT] = 3; PRI[T.SAND] = 2; PRI[T.ASH] = 4; PRI[T.FARM] = 1; PRI[T.SWAMP] = 5;
  PRI[T.ROAD] = 1; PRI[T.CLOUD] = 5; PRI[T.CRYSTAL] = 3;
  const BLEND = new Array(32).fill(false);
  for (const k of ['GRASS', 'DIRT', 'SAND', 'SNOW', 'ASH', 'DARK', 'FARM', 'SWAMP', 'ROAD', 'CLOUD', 'CRYSTAL']) BLEND[T[k]] = true;

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
      default: return [0, 0, 0];
    }
  }

  /* ───────── 지형 한 칸의 소유 픽셀: 이웃 경계를 잡음으로 굽이지게 ───────── */
  function owner(m, tx, ty, lx, ly, x, y) {
    const t = m.T(tx, ty);
    if (!BLEND[t]) return t;
    const h = m.H(tx, ty);
    let best = t, bp = PRI[t];
    const W = 5;
    const wob = (U.vnoise(x / 3.3, y / 3.3, 17) - 0.5) * 3.2;
    const cons = (nx, ny, d) => {
      const nt = m.T(nx, ny);
      if (!BLEND[nt] || PRI[nt] <= bp || m.H(nx, ny) !== h) return;
      if (d + wob < 2.4) { best = nt; bp = PRI[nt]; }
    };
    if (lx < W) cons(tx - 1, ty, lx);
    if (lx > 15 - W) cons(tx + 1, ty, 15 - lx);
    if (ly < W) cons(tx, ty - 1, ly);
    if (ly > 15 - W) cons(tx, ty + 1, 15 - ly);
    if (lx < W && ly < W) cons(tx - 1, ty - 1, Math.hypot(lx, ly) * 0.9);
    if (lx > 15 - W && ly < W) cons(tx + 1, ty - 1, Math.hypot(15 - lx, ly) * 0.9);
    if (lx < W && ly > 15 - W) cons(tx - 1, ty + 1, Math.hypot(lx, 15 - ly) * 0.9);
    if (lx > 15 - W && ly > 15 - W) cons(tx + 1, ty + 1, Math.hypot(15 - lx, 15 - ly) * 0.9);
    return best;
  }

  /** 지도 픽셀 하나의 최종 색 */
  function pixel(m, x, y) {
    const tx = x >> 4, ty = y >> 4, lx = x & 15, ly = y & 15;
    const t0 = m.T(tx, ty);
    const P = m.pal(tx, ty);
    if (t0 === T.CLIFF) return cliff(m, tx, ty, lx, ly, x, y);
    if (t0 === T.STAIRS) return stairs(m, tx, ty, lx, ly, x, y, P);
    if (t0 === T.VOID) return [0, 0, 0];
    const t = owner(m, tx, ty, lx, ly, x, y);
    let c = base(t, P, x, y, 0, m, tx, ty);
    const h = m.H(tx, ty);
    // 높은 땅은 조금 더 밝고 따뜻하게 (고저차가 눈에 보이도록)
    if (h > 0 && m.outdoor) c = mixc(c, [255, 250, 226], Math.min(0.16, h * 0.045));
    // 물가: 물 쪽은 거품, 땅 쪽은 젖은 띠
    const liquid = (tt) => tt === T.WATER || tt === T.DEEP;
    if (liquid(t0)) {
      let d = 9;
      if (!liquid(m.T(tx - 1, ty)) && m.T(tx - 1, ty) !== T.BRIDGE) d = Math.min(d, lx);
      if (!liquid(m.T(tx + 1, ty)) && m.T(tx + 1, ty) !== T.BRIDGE) d = Math.min(d, 15 - lx);
      if (!liquid(m.T(tx, ty - 1)) && m.T(tx, ty - 1) !== T.BRIDGE) d = Math.min(d, ly);
      if (!liquid(m.T(tx, ty + 1)) && m.T(tx, ty + 1) !== T.BRIDGE) d = Math.min(d, 15 - ly);
      const wob = (U.vnoise(x / 4, y / 4, 29) - 0.5) * 2.4;
      if (d + wob < 1.2) c = rgb(P.w[3]);
      else if (d + wob < 3.2) c = mixc(c, rgb(P.w[2]), 0.55);
      else if (t0 === T.DEEP && d + wob < 6) c = mixc(c, rgb(P.w[1]), 0.5);
    } else if (t0 !== T.BRIDGE) {
      let d = 9;
      if (liquid(m.T(tx - 1, ty))) d = Math.min(d, lx);
      if (liquid(m.T(tx + 1, ty))) d = Math.min(d, 15 - lx);
      if (liquid(m.T(tx, ty - 1))) d = Math.min(d, ly);
      if (liquid(m.T(tx, ty + 1))) d = Math.min(d, 15 - ly);
      if (d < 2) c = mul(c, 0.78);
    }
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
    // 벽 아래 그림자 (실내)
    if (m.T(tx, ty - 1) === T.WALL && ly < 4) c = mul(c, 0.7 + ly * 0.075);
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

  G.tiles = { TS, T, NAMES, PROP, PRI, PAL, REGIONS, pixel, base, waterFx, rgb };
})();
