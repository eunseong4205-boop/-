/* 지역 안의 구역 — 같은 지역이라도 어디냐에 따라 적의 세기와 종류가 다르다
   예전: 지역마다 적 목록 하나 · 위험도 하나 — 마을 문 앞이나 지역 끝 고원이나 같은 적이 같은 세기로 나왔다.
   · 세기: 마을 둘레(지역 반지름의 36% 안)는 한 단계 약하게(정예 없음), 깊은 곳(80% 밖) · 더 센 이웃 지역과 맞닿은 경계 · 높은 땅(그 지역 보통 높이 + 2)은
     한 단계씩 세게(최대 +2), 정예도 잦게
   · 종류: 발밑 지형 무리(숲 · 물가 · 모래땅 · 설원 · 잿빛 비탈 · 늪 · 바위 언덕 · 옛 터 · 들판 · 어둠 · 고원)의 적이 섞인다 —
     단, 그 지역이나 한 단계 위 지역까지 나오는 적만(초반 지역에 늦은 지역의 적이 끼지 않게)
   · 깊은 곳 · 경계 · 높은 땅에 들어서면 지역 이름처럼 작게 알린다 (「깊은 숲 — 적이 한층 세다」) */
(function () {
  'use strict';
  const G = globalThis.G;
  const OW = G.ow, TL = G.tiles, T = TL.T, OB = G.objs, O = OB.O, U = G.u;
  if (!OW) return;

  const BIOME = {
    forest: { name: '숲', foes: [['plant', 2], ['bug', 2], ['wolf', 1.5], ['spider', 1.5], ['boar', 1.2], ['slime', 0.8]] },
    shore: { name: '물가', foes: [['crab', 3], ['octo', 2], ['slime', 1], ['spider', 0.6]] },
    desert: { name: '모래땅', foes: [['worm', 2.5], ['scorp', 2], ['skel', 1], ['bandit', 1.2]] },
    snow: { name: '설원', foes: [['icewisp', 3], ['wolf', 2], ['cgolem', 0.6], ['skel', 1]] },
    ash: { name: '잿빛 비탈', foes: [['wisp', 2.5], ['bomber', 2], ['golem', 1], ['shroom', 1.5]] },
    swamp: { name: '늪', foes: [['plant', 2], ['bigslime', 1.5], ['shroom', 1.5], ['spider', 1.5], ['octo', 1]] },
    rocky: { name: '바위 언덕', foes: [['golem', 1.5], ['bat', 2], ['lancer', 1], ['turret', 0.8], ['eye', 0.8]] },
    ruin: { name: '옛 터', foes: [['skel', 2], ['hollow', 1.5], ['turret', 1], ['wraith', 0.8], ['priest', 0.5]] },
    meadow: { name: '들판', foes: [['slime', 2], ['boar', 2], ['bug', 1.5], ['bandit', 1]] },
    dark: { name: '어둠', foes: [['ghost', 2], ['shade', 1.5], ['wraith', 1.5], ['bat', 1.5], ['assassin', 0.6]] },
    high: { name: '고원', foes: [['bat', 2], ['eye', 1.5], ['golem', 1], ['lancer', 1], ['sniper', 0.6], ['berserk', 0.6]] },
  };
  const TREES = new Set([O.TREE, O.BIGTREE, O.PINE, O.SNOWTREE, O.PALM, O.DEAD, O.BLOSSOM].filter((v) => v != null));
  const RUINS = new Set([O.PILLAR, O.RUBBLE, O.GRAVE, O.BONES].filter((v) => v != null));

  /** 지도마다 한 번: 지역별 마을 중심 · 반지름(마을에서 그 지역 땅까지 거리의 90번째) · 보통 높이 · 나올 수 있는 적 */
  function stats(m) {
    if (m._zones) return m._zones;
    const RN = OW.regName, N = m.w * m.h, by = {};
    for (const [n, t] of Object.entries(OW.towns || {})) by[n] = { cx: t.x + (t.w >> 1), cy: t.y + (t.h >> 1), d: [], h: [] };
    for (let i = 0; i < N; i += 7) {
      const R = by[RN[i]]; if (!R) continue;
      const x = i % m.w, y = (i / m.w) | 0;
      R.d.push(Math.hypot(x - R.cx, y - R.cy)); R.h.push(m.hgt[i]);
    }
    const TI = OW.TIERS;
    for (const [n, R] of Object.entries(by)) {
      R.d.sort((a, b) => a - b); R.h.sort((a, b) => a - b);
      R.rad = Math.max(24, R.d[Math.floor(R.d.length * 0.9)] || 60);
      R.hMed = R.h[Math.floor(R.h.length / 2)] || 0;
      // 이 지역(위험도 t)에서 나와도 되는 적: 위험도 t + 1까지의 지역 목록에 있는 것
      const ok = new Set();
      for (const [n2, tb] of Object.entries(OW.TABLE)) if ((TI[n2] || 0) <= (TI[n] || 0) + 1) for (const [ty] of tb) ok.add(ty);
      R.ok = ok; R.d = R.h = null;
    }
    m._zones = by;
    return by;
  }
  function biomeAt(m, x, y) {
    const t = m.T(x, y);
    if (t === T.SNOW || t === T.ICE) return 'snow';
    if (t === T.SAND || t === T.DRY || t === T.SANDSTONE) return 'desert';
    if (t === T.SWAMP || t === T.MUD) return 'swamp';
    if (t === T.DARK) return 'dark';
    let trees = 0, water = 0, lava = 0, ruin = 0, stone = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy; if (!m.inb(xx, yy)) continue;
      const i = m.i(xx, yy), o = m.obj[i], tt = m.ter[i];
      if (TREES.has(o)) trees++; if (RUINS.has(o)) ruin++;
      if (tt === T.WATER || tt === T.DEEP) water++; if (tt === T.LAVA) lava++;
      if (tt === T.ASH) lava += 0.3;
      if (tt === T.STONE || tt === T.ROCKY || tt === T.GRAVEL || tt === T.CRACKED) stone++;
    }
    if (lava >= 2) return 'ash';
    if (ruin >= 2) return 'ruin';
    if (water >= 4) return 'shore';
    if (trees >= 6) return 'forest';
    if (stone >= 8) return 'rocky';
    return 'meadow';
  }
  /** (x, y) 칸의 구역: { ring: near|mid|far, edge, high, biome } */
  function zoneAt(m, x, y, n) {
    const Z = stats(m)[n]; if (!Z) return null;
    const d = Math.hypot(x - Z.cx, y - Z.cy) / Z.rad;
    const ring = d < 0.36 ? 'near' : d > 0.8 ? 'far' : 'mid';
    const TI = OW.TIERS, my = TI[n] || 0;
    let edge = false;
    for (let dy = -8; dy <= 8 && !edge; dy += 4) for (let dx = -8; dx <= 8 && !edge; dx += 4) { const xx = x + dx, yy = y + dy; if (!m.inb(xx, yy)) continue; const n2 = OW.regName[m.i(xx, yy)]; if (n2 && n2 !== n && (TI[n2] || 0) > my) edge = true; }
    const high = m.hgt[m.i(x, y)] >= Z.hMed + 2;
    // 경계: 더 센 이웃 지역과 8칸 안 — 마을 둘레는 빼고, 첫 지역(★0)은 깊은 곳에서만 (그린은 사방이 더 센 지역이라 거의 다 경계가 되었다)
    return { ring, edge: edge && ring !== 'near' && (my > 0 || ring === 'far'), high, biome: biomeAt(m, x, y) };
  }
  const pickW = (list, r) => { let s = list.reduce((a, x) => a + x[1], 0) * r; for (const [t, w] of list) { s -= w; if (s <= 0) return t; } return list[0][0]; };

  /** 10_overworld planSpawns가 적 하나를 고를 때마다 묻는다 */
  OW.zone = function (m, x, y, n, type, rnd) {
    const z = zoneAt(m, x, y, n); if (!z) return null;
    const Z = stats(m)[n], base = OW.TIERS[n] || 0;
    let adj = (z.ring === 'near' ? -1 : 0) + (z.ring === 'far' || z.edge ? 1 : 0) + (z.high ? 1 : 0);
    adj = U.clamp(adj, -1, 2);
    // 종류: 지형 무리(높은 땅이면 고원)의 적을 섞는다 — 이 지역에서 나와도 되는 것만
    const pool = (z.high && rnd() < 0.55 ? BIOME.high : BIOME[z.biome]).foes.filter(([t]) => Z.ok.has(t) && G.foes.T[t]);
    if (pool.length && rnd() < 0.45) type = pickW(pool, rnd());
    const danger = (z.ring === 'far' ? 1 : 0) + (z.edge ? 1 : 0) + (z.high ? 1 : 0);
    const eliteP = z.ring === 'near' ? 0 : [0, 0.05, 0.08, 0.1][danger];
    return { type, tier: U.clamp(base + adj, 0, 11), eliteP, key: z.ring + (z.edge ? '+edge' : '') + (z.high ? '+high' : '') + ':' + z.biome };
  };

  /* ───────── 들어서면 알린다 (위험한 구역만, 같은 말은 자주 하지 않는다) ───────── */
  let zT = 0, last = '', lastAt = -999;
  const told = {};
  OW.zoneTick = function (m, p) {
    zT -= 0.4; if (zT > 0) return; zT = 1.2;
    if (!p || G.script.running) return;
    const x = Math.floor(p.x / TL.TS), y = Math.floor(p.y / TL.TS); if (!m.inb(x, y)) return;
    const n = OW.regName[m.i(x, y)];
    if (OW.inTown && OW.inTown(x, y, 4)) { last = ''; return; }
    const z = zoneAt(m, x, y, n); if (!z) return;
    const bn = (z.high ? BIOME.high : BIOME[z.biome]).name;
    let label = null;
    if (z.high && (z.ring === 'far' || z.edge)) label = '높은 ' + bn + ' — 적이 매우 세고 정예가 잦다';
    else if (z.high) label = '높은 땅 · ' + bn + ' — 적이 세다';
    else if (z.ring === 'far' && z.edge) label = '깊은 ' + bn + ' · 경계 — 적이 매우 세다';
    else if (z.ring === 'far') label = '깊은 ' + bn + ' — 적이 한층 세다';
    else if (z.edge) label = bn + ' · 경계 — 이웃 땅의 기운이 넘어온다';
    const now = (G.world && G.world.t) || 0;
    if (!label) { last = ''; return; }
    if (label === last) return;
    last = label;
    if (now - lastAt < 20 || (told[label] && now - told[label] < 240)) return;
    lastAt = now; told[label] = now;
    G.ui.toast(label, 'white');
  };
  OW.zoneAt = zoneAt;
  G.zones = { BIOME, zoneAt, stats };
})();
