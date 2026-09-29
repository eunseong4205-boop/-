/* 넓어진 마을: 이야기 파일이 지은 한가운데(광장 · 이야기 건물)는 그대로 두고, 그 둘레에 동네를 짓는다.
   고리 길 · 광장에서 뻗은 큰길(마을 문까지) · 동네 골목 · 골목 북쪽에 문이 골목으로 난 집들 · 틈마다 텃밭 · 화분 · 가로등 ·
   담과 문 · 밭 · 과수원 · 장터 · 부두 · 묘지. 비어 있는 같은 높이의 땅에만 짓고, 끊긴 골목은 지운다.
   집마다 사는 사람과 이야기(장마다 바뀐다)는 35_folk.js가 채운다: OW.homes[마을] = [집 …] 순서대로. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const W = OW.W, H = OW.H;

  /* 마을마다: m = 넓힐 칸 [왼, 위, 오른, 아래] · lane = 골목 바닥 · pave = 큰길 · wall = 담 · tree = 가로수 · houses = 집 폭 범위 · extras */
  const PLAN = {
    green: { m: [4, 11, 13, 11], lane: T.DIRT, pave: T.COBBLE, wall: 'fence', tree: O.TREE, houses: [4, 6], extras: ['farm', 'orchard', 'hay'], plaza: '#6aa84a' },
    red: { m: [12, 7, 12, 8], lane: T.BRICK, pave: T.BRICK, wall: 'stone', tree: O.DEAD, houses: [4, 6], extras: ['cart', 'pots'], plaza: '#c8583a' },
    blue: { m: [12, 10, 4, 1], lane: T.COBBLE, pave: T.COBBLE, wall: 'stone', tree: O.PALM, houses: [4, 6], extras: ['nets', 'barrels'], plaza: '#3a7ad8' },
    yellow: { m: [12, 11, 5, 12], lane: T.SANDSTONE, pave: T.SANDSTONE, wall: 'stone', tree: O.PALM, houses: [4, 5], extras: ['stalls', 'pots', 'cart'], plaza: '#e8a83a' },
    purple: { m: [12, 9, 14, 12], lane: T.COBBLE, pave: T.COBBLE, wall: 'hedge', tree: O.BLOSSOM, houses: [4, 5], extras: ['planters', 'benches'], plaza: '#8a5ad8' },
    rainbow: { m: [8, 6, 8, 8], lane: T.MARBLE, pave: T.MARBLE, wall: 'hedge', tree: O.BLOSSOM, houses: [4, 5], extras: ['stalls', 'banners', 'planters'], plaza: '#ff7ab8' },
    white: { m: [14, 6, 12, 12], lane: T.COBBLE, pave: T.COBBLE, wall: 'stone', tree: O.SNOWTREE, houses: [4, 5], extras: ['graves', 'barrels'], plaza: '#8ab8e8' },
    gray: { m: [6, 10, 14, 6], lane: T.GRAVEL, pave: T.COBBLE, wall: 'stone', tree: O.DEAD, houses: [4, 6], extras: ['crates', 'cart'], plaza: '#8a8a96' },
    black: { m: [11, 5, 12, 11], lane: T.COBBLE, pave: T.COBBLE, wall: 'stone', tree: O.DEAD, houses: [4, 5], extras: ['graves', 'banners'], plaza: '#6a4ab8' },
    colorful: { m: [16, 12, 2, 2], lane: T.BRICK, pave: T.BRICK, wall: 'fence', tree: O.BLOSSOM, houses: [4, 5], extras: ['crates', 'planters', 'cart'], plaza: '#ff8a3a' },
  };
  OW.PLAN = PLAN;
  OW.homes = {};

  const NATURAL = new Array(64).fill(false);
  for (const k of ['GRASS', 'DIRT', 'SAND', 'SNOW', 'ASH', 'DARK', 'MEADOW', 'MOSS', 'GRAVEL', 'LEAVES', 'MUD', 'DRY', 'ROCKY', 'PETALS', 'CRACKED', 'ROAD', 'COBBLE']) NATURAL[T[k]] = true;
  const NATOBJ = new Set([O.TREE, O.PINE, O.PALM, O.DEAD, O.BLOSSOM, O.SHROOM, O.BUSH, O.ROCK, O.BOULDER, O.FLOWER, O.TALL, O.STUMP, O.CACTUS, O.REED, O.ICESPIKE, O.PEBBLE, O.SNOWTREE, O.BONES, O.RUBBLE, O.PILLAR, O.GRAVE, O.CRYSTAL]);

  function district(m, n, P) {
    const C = OW.towns[n];
    if (!C || !C.plaza) return;
    const hb = m.hgt[m.i(C.plaza.x, C.plaza.y)];
    const E = { x0: Math.max(3, C.x - P.m[0]), y0: Math.max(3, C.y - P.m[1]), x1: Math.min(W - 4, C.x + C.w - 1 + P.m[2]), y1: Math.min(H - 4, C.y + C.h - 1 + P.m[3]) };
    C.outer = E;
    const rnd = U.rng(U.hash('town:' + n));
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const I = (x, y) => y * W + x;
    const inCore = (x, y) => x >= C.x && x < C.x + C.w && y >= C.y && y < C.y + C.h;
    const inE = (x, y) => x >= E.x0 && x <= E.x1 && y >= E.y0 && y <= E.y1;
    // ── 비워 둘 곳: 이야기 건물 · 문 앞 · 순간이동 · 사람 · 씨앗 · 표시해 둔 곳
    const res = new Uint8Array(W * H);
    const mark = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (m.inb(x + dx, y + dy)) res[I(x + dx, y + dy)] = 1; };
    for (const b of m.buildings) { for (let y = b.y - 1; y <= b.y + b.h; y++) for (let x = b.x - 1; x <= b.x + b.w; x++) if (m.inb(x, y)) res[I(x, y)] = 1; if (b.doorX != null) for (let y = b.doorY; y < b.doorY + 3; y++) mark(b.doorX, y, 0); }
    for (const wp of m.warps) for (let x = wp.x; x < wp.x + (wp.w || 1); x++) mark(x, wp.y, 2);
    for (const sp of ST.people.world || []) if (typeof sp.x === 'number') mark(sp.x, sp.y, 1);
    for (const sd of ST.seeds) if (sd.map === 'world') mark(sd.x, sd.y, 1);
    for (const p of Object.values(OW.poi)) if (p && typeof p.x === 'number') mark(p.x, p.y, 2);
    const land = (t) => NATURAL[t];
    const street = new Uint8Array(W * H);
    const ok = (x, y) => m.inb(x, y) && inE(x, y) && !inCore(x, y) && m.hgt[I(x, y)] === hb && land(m.ter[I(x, y)]) && !m.solidExtra[I(x, y)] && !(m.obj[I(x, y)] && !NATOBJ.has(m.obj[I(x, y)]));
    const free = (x, y) => ok(x, y) && !res[I(x, y)] && !street[I(x, y)] && !OW.roadTiles[I(x, y)];

    // ── 1) 길: 고리 길 · 큰길(마을 문까지) · 동네 골목
    const lanes = [];     // 가로 골목 (집이 북쪽에 선다)
    const paveRow = (y, x0, x1, t, kind) => { for (let x = x0; x <= x1; x++) for (const yy of [y, y + 1]) if (ok(x, yy) && !res[I(x, yy)]) { m.ter[I(x, yy)] = t; m.obj[I(x, yy)] = 0; street[I(x, yy)] = kind || 1; } };
    const paveCol = (x, y0, y1, t, kind) => { for (let y = y0; y <= y1; y++) for (const xx of [x, x + 1]) if (ok(xx, y) && !res[I(xx, y)]) { m.ter[I(xx, y)] = t; m.obj[I(xx, y)] = 0; street[I(xx, y)] = kind || 1; } };
    // 고리
    paveRow(C.y - 2, C.x - 2, C.x + C.w + 1, P.pave, 2); paveRow(C.y + C.h, C.x - 2, C.x + C.w + 1, P.pave, 2);
    paveCol(C.x - 2, C.y - 2, C.y + C.h + 1, P.pave, 2); paveCol(C.x + C.w, C.y - 2, C.y + C.h + 1, P.pave, 2);
    lanes.push({ y: C.y - 2, x0: C.x - 2, x1: C.x + C.w + 1 });
    // 큰길: 광장 십자를 마을 문까지
    const px = C.plaza.x, py = C.plaza.y;
    paveCol(px, E.y0, C.y - 1, P.pave, 3); paveCol(px, C.y + C.h, E.y1, P.pave, 3);
    paveRow(py, E.x0, C.x - 1, P.pave, 3); paveRow(py, C.x + C.w, E.x1, P.pave, 3);
    // 북쪽 동네 골목
    for (let y = C.y - 9; y >= E.y0 + 5; y -= 7) { paveRow(y, E.x0 + 2, E.x1 - 2, P.lane); lanes.push({ y, x0: E.x0 + 2, x1: E.x1 - 2 }); }
    // 남쪽 동네 골목
    for (let y = C.y + C.h + 7; y <= E.y1 - 2; y += 7) { paveRow(y, E.x0 + 2, E.x1 - 2, P.lane); lanes.push({ y, x0: E.x0 + 2, x1: E.x1 - 2 }); }
    // 서 · 동 동네 골목 (고리 길에서 바깥으로)
    if (C.x - 3 - (E.x0 + 2) >= 5) for (let y = C.y + 6; y < C.y + C.h - 1; y += 7) { if (Math.abs(y - py) < 3) continue; paveRow(y, E.x0 + 2, C.x - 3, P.lane); lanes.push({ y, x0: E.x0 + 2, x1: C.x - 3 }); }
    if (E.x1 - 2 - (C.x + C.w + 2) >= 5) for (let y = C.y + 6; y < C.y + C.h - 1; y += 7) { if (Math.abs(y - py) < 3) continue; paveRow(y, C.x + C.w + 2, E.x1 - 2, P.lane); lanes.push({ y, x0: C.x + C.w + 2, x1: E.x1 - 2 }); }
    // 골목끼리 잇는 샛길: 골목 양 끝에서 가까운 큰길 · 고리로 세로로
    for (const L of lanes) {
      if (L.y === C.y - 2) continue;
      for (const x of [L.x0, L.x1 - 1, Math.round((L.x0 + L.x1) / 2)]) {
        // 가까운 쪽(고리 · 다른 골목)으로 세로 샛길
        const dir = L.y < C.y ? 1 : L.y > C.y + C.h ? -1 : 0;
        if (!dir) continue;
        let y = L.y + (dir > 0 ? 2 : -1), steps = 0;
        const cells = [];
        while (steps < 9 && m.inb(x, y) && !street[I(x, y)] && !OW.roadTiles[I(x, y)]) { cells.push(y); y += dir; steps++; }
        if (steps < 9 && m.inb(x, y) && (street[I(x, y)] || OW.roadTiles[I(x, y)])) for (const yy of cells) for (const xx of [x, x + 1]) if (ok(xx, yy) && !res[I(xx, yy)]) { m.ter[I(xx, yy)] = P.lane; m.obj[I(xx, yy)] = 0; street[I(xx, yy)] = 1; }
      }
    }
    // ── 2) 끊긴 길 지우기: 광장 · 큰 길에 닿지 않는 골목 조각은 되돌린다
    {
      const seen = new Uint8Array(W * H); const q = [];
      const walk = (x, y) => m.inb(x, y) && (street[I(x, y)] || OW.roadTiles[I(x, y)] || (inCore(x, y) && !m.solidExtra[I(x, y)] && m.ter[I(x, y)] !== T.DEEP));
      q.push(I(px, py)); seen[I(px, py)] = 1;
      while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!walk(nx, ny)) continue; const j = I(nx, ny); if (seen[j]) continue; seen[j] = 1; q.push(j); } }
      const back = n === 'yellow' ? T.SAND : n === 'white' ? T.SNOW : n === 'black' ? T.DARK : n === 'gray' ? T.DIRT : T.GRASS;
      for (let y = E.y0; y <= E.y1; y++) for (let x = E.x0; x <= E.x1; x++) { const i = I(x, y); if (street[i] && !seen[i]) { street[i] = 0; m.ter[i] = back; } }
    }
    // ── 3) 동네 안의 들나무 · 덤불 치우기 (길 가 · 집 자리), 숲 바닥은 잔디로
    const lawn = n === 'yellow' ? T.SAND : n === 'white' ? T.SNOW : n === 'black' ? T.DARK : n === 'gray' ? T.DIRT : T.GRASS;
    for (let y = E.y0; y <= E.y1; y++) for (let x = E.x0; x <= E.x1; x++) {
      const i = I(x, y); if (m.hgt[i] !== hb) continue;
      if (!inCore(x, y) && !res[i] && NATOBJ.has(m.obj[i])) m.obj[i] = 0;
      if ((m.ter[i] === T.LEAVES || m.ter[i] === T.MOSS || m.ter[i] === T.MUD) && !m.solidExtra[i]) m.ter[i] = lawn;
    }

    // ── 4) 집: 골목마다 북쪽에, 문이 골목으로
    const homes = OW.homes[n] = [];
    const R = PLAN[n];
    for (const L of lanes) {
      let x = L.x0 + ri(0, 2);
      while (x < L.x1 - 3) {
        const w = ri(R.houses[0], R.houses[1]), h = rnd() < 0.3 ? 3 : 4;
        const x0 = x, y0 = L.y - h, dx = x0 + (w >> 1);
        let good = street[I(dx, L.y)] > 0;
        for (let yy = y0 - 1; yy <= L.y - 1 && good; yy++) for (let xx = x0 - 1; xx <= x0 + w && good; xx++) {
          if (yy === y0 - 1 || xx === x0 - 1 || xx === x0 + w) { if (!m.inb(xx, yy) || m.solidExtra[I(xx, yy)] || (street[I(xx, yy)] === 3)) good = false; continue; }
          if (!free(xx, yy)) good = false;
        }
        if (good) {
          const id = 'tw_' + n + '_' + homes.length;
          homes.push({ id, n, tx: x0, ty: y0, w, h, door: [dx, L.y] });
          for (let yy = y0 - 1; yy <= L.y - 1; yy++) for (let xx = x0 - 1; xx <= x0 + w; xx++) if (m.inb(xx, yy)) res[I(xx, yy)] = 1;
          x += w + ri(2, 4);
        } else x += 1;
      }
    }
    // ── 4b) 사람 수만큼 집이 모자라면: 빈 땅에 집을 앉히고, 문에서 가까운 길까지 오솔길을 낸다
    const want = ((OW.FOLK && OW.FOLK[n]) || []).length + 1;
    for (let tries = 0; tries < 1500 && homes.length < want; tries++) {
      const w = ri(R.houses[0], R.houses[1]), h = rnd() < 0.4 ? 3 : 4;
      const x0 = ri(E.x0 + 2, E.x1 - w - 1), y0 = ri(E.y0 + 2, E.y1 - h - 2);
      let good = true;
      for (let yy = y0 - 1; yy <= y0 + h && good; yy++) for (let xx = x0 - 1; xx <= x0 + w && good; xx++) if (!free(xx, yy)) good = false;
      if (!good) continue;
      const dx = x0 + (w >> 1), dy = y0 + h;
      // 문 앞에서 길까지 (4방향, 12걸음 안)
      const prev = new Map(); const q = [[dx, dy]]; prev.set(I(dx, dy), -1); let hit = -1;
      const inHouse = (x, y) => x >= x0 - 1 && x <= x0 + w && y >= y0 - 1 && y < y0 + h;
      for (let qi = 0; qi < q.length && hit < 0; qi++) {
        const [x, y] = q[qi]; const d = (() => { let k = 0, j = I(x, y); while (prev.get(j) >= 0) { j = prev.get(j); k++; } return k; })();
        if (d > 12) continue;
        for (const [ox, oy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
          const nx = x + ox, ny = y + oy, j = I(nx, ny);
          if (!m.inb(nx, ny) || prev.has(j) || inHouse(nx, ny)) continue;
          if (street[j] || OW.roadTiles[j] || (inCore(nx, ny) && (m.ter[j] === C.road || m.ter[j] === T.PLAZA))) { prev.set(j, I(x, y)); hit = I(x, y); break; }
          if (!free(nx, ny)) continue;
          prev.set(j, I(x, y)); q.push([nx, ny]);
        }
      }
      if (hit < 0 && !(street[I(dx, dy)] || OW.roadTiles[I(dx, dy)])) continue;
      for (let j = hit; j >= 0; j = prev.get(j)) { m.ter[j] = R.lane; m.obj[j] = 0; street[j] = 1; }
      const id = 'tw_' + n + '_' + homes.length;
      homes.push({ id, n, tx: x0, ty: y0, w, h, door: [dx, dy] });
      for (let yy = y0 - 1; yy <= y0 + h - 1; yy++) for (let xx = x0 - 1; xx <= x0 + w; xx++) if (m.inb(xx, yy)) res[I(xx, yy)] = 1;
    }
    // ── 5) 가로등 · 가로수 · 화분 · 의자: 골목 남쪽 가, 큰길 양쪽
    const place = (x, y, o) => { if (free(x, y) && !street[I(x, y - 1)] || free(x, y)) { if (!free(x, y)) return false; m.obj[I(x, y)] = o; res[I(x, y)] = 1; return true; } return false; };
    const lampAt = (x, y) => { if (place(x, y, O.LAMP)) m.lights.push({ x: x * TS + 8, y: y * TS + 2, r: 50, warm: 'rgba(255,210,120,0.18)' }); };
    for (const L of lanes) {
      for (let x = L.x0 + 2; x < L.x1; x += ri(7, 9)) lampAt(x, L.y + 2);
      for (let x = L.x0 + 5; x < L.x1; x += ri(5, 8)) {
        const k = rnd();
        const o = k < 0.4 ? R.tree : k < 0.6 ? O.PLANTER : k < 0.75 ? O.BENCH : k < 0.88 ? O.HEDGE : O.FLOWER;
        place(x, L.y + 2, o);
      }
    }
    for (let y = E.y0 + 1; y <= E.y1 - 1; y += 4) for (const x of [px - 1, px + 2]) if (!inCore(x, y)) { if (((y - E.y0) / 4) % 2 === 0) lampAt(x, y); else place(x, y, R.tree); }
    for (let x = E.x0 + 1; x <= E.x1 - 1; x += 4) for (const y of [py - 1, py + 2]) if (!inCore(x, y)) { if (((x - E.x0) / 4) % 2 === 0) lampAt(x, y); else place(x, y, R.tree); }
    // 집 사이 틈: 작은 텃밭 · 통 · 상자
    for (const hm of homes) {
      const gx = hm.tx + hm.w + 1, gy = hm.ty + hm.h - 1;
      const k = rnd();
      if (k < 0.35) place(gx, gy, n === 'yellow' ? O.POTS : O.BARREL);
      else if (k < 0.55) place(gx, gy, O.CRATE);
      else if (k < 0.8) place(gx, gy, O.PLANTER);
      if (rnd() < 0.5) place(hm.tx - 1, hm.ty + hm.h - 1, n === 'yellow' || n === 'red' ? O.POTS : O.FLOWER);
    }

    // ── 6) 빈 네모 땅 찾기 (밭 · 과수원 · 장터 · 묘지)
    const rect = (w, h) => {
      for (let tries = 0; tries < 400; tries++) {
        const x0 = ri(E.x0 + 1, E.x1 - w - 1), y0 = ri(E.y0 + 1, E.y1 - h - 1);
        let good = true;
        for (let y = y0 - 1; y <= y0 + h && good; y++) for (let x = x0 - 1; x <= x0 + w && good; x++) if (!free(x, y)) good = false;
        if (good) { for (let y = y0 - 1; y <= y0 + h; y++) for (let x = x0 - 1; x <= x0 + w; x++) res[I(x, y)] = 1; return { x0, y0 }; }
      }
      return null;
    };
    for (const ex of R.extras) {
      if (ex === 'farm') for (let k = 0; k < 3; k++) {
        const r = rect(7, 5); if (!r) break;
        for (let y = r.y0 + 1; y < r.y0 + 4; y++) for (let x = r.x0 + 1; x < r.x0 + 6; x++) { m.ter[I(x, y)] = T.FARM; m.obj[I(x, y)] = (x + y + k) % 2 ? O.TALL : 0; }
        for (let x = r.x0; x < r.x0 + 7; x++) { m.obj[I(x, r.y0)] = O.FENCEH; m.obj[I(x, r.y0 + 4)] = x === r.x0 + 3 ? 0 : O.FENCEH; }
        for (let y = r.y0 + 1; y < r.y0 + 4; y++) { m.obj[I(r.x0, y)] = O.FENCEV; m.obj[I(r.x0 + 6, y)] = O.FENCEV; }
        m.obj[I(r.x0 + 5, r.y0 + 2)] = O.SCARECROW;
      }
      if (ex === 'orchard') for (let k = 0; k < 2; k++) { const r = rect(6, 5); if (!r) break; for (let y = r.y0; y < r.y0 + 5; y += 2) for (let x = r.x0; x < r.x0 + 6; x += 2) m.obj[I(x, y)] = k ? O.BLOSSOM : O.TREE; }
      if (ex === 'hay' || ex === 'cart') for (let k = 0; k < 3; k++) { const r = rect(2, 1); if (!r) break; m.obj[I(r.x0, r.y0)] = ex === 'hay' ? O.HAY : O.CART; if (ex === 'hay') m.obj[I(r.x0 + 1, r.y0)] = O.HAY; }
      if (ex === 'pots' || ex === 'barrels' || ex === 'crates') for (let k = 0; k < 5; k++) { const r = rect(2, 1); if (!r) break; const o = ex === 'pots' ? O.POTS : ex === 'barrels' ? O.BARREL : O.CRATE; m.obj[I(r.x0, r.y0)] = o; m.obj[I(r.x0 + 1, r.y0)] = rnd() < 0.5 ? O.CRATE : o; }
      if (ex === 'nets') for (let k = 0; k < 4; k++) { const r = rect(2, 2); if (!r) break; m.obj[I(r.x0, r.y0 + 1)] = O.NET; m.obj[I(r.x0 + 1, r.y0 + 1)] = O.BARREL; }
      if (ex === 'planters' || ex === 'benches') for (let k = 0; k < 6; k++) { const r = rect(1, 1); if (!r) break; m.obj[I(r.x0, r.y0)] = ex === 'planters' ? O.PLANTER : O.BENCH; }
      if (ex === 'banners') for (let k = 0; k < 6; k++) { const r = rect(1, 1); if (!r) break; m.obj[I(r.x0, r.y0)] = O.BANNER; }
      if (ex === 'graves') { const r = rect(8, 5); if (r) { for (let y = r.y0 + 1; y < r.y0 + 5; y += 2) for (let x = r.x0 + 1; x < r.x0 + 8; x += 2) m.obj[I(x, y)] = O.GRAVE; for (let x = r.x0; x < r.x0 + 8; x++) m.obj[I(x, r.y0)] = x === r.x0 + 4 ? 0 : (P.wall === 'hedge' ? O.HEDGE : O.WALLH); OW.poi[n + '_graves'] = { x: r.x0 + 4, y: r.y0 + 2 }; } }
      if (ex === 'stalls') {
        // 장터: 큰길 가에 천막 가게 줄
        const cols = ['#e84a4a', '#3a8ad8', '#e8b83a', '#4ab86a', '#b86ae8', '#ff8a3a'];
        let k = 0;
        for (let y = C.y + C.h + 3; y <= E.y1 - 3 && k < 6; y += 4) for (const x of [px - 5, px + 3]) {
          let good = true; for (let yy = y; yy < y + 2 && good; yy++) for (let xx = x; xx < x + 3 && good; xx++) if (!free(xx, yy)) good = false;
          if (!good) continue;
          G.build.placeBuilding(m, { special: 'stall', tx: x, ty: y + 1, w: 3, h: 1, col: cols[k % cols.length], door: false });
          for (let yy = y; yy < y + 2; yy++) for (let xx = x; xx < x + 3; xx++) res[I(xx, yy)] = 1;
          OW.stalls = OW.stalls || []; OW.stalls.push({ n, x: x + 1, y: y + 2, k });
          k++;
        }
      }
    }
    // ── 7) 담 · 마을 문: 동네 테두리의 빈 땅을 따라, 길이 지나는 곳은 문
    const wallO = (hz) => P.wall === 'fence' ? (hz ? O.FENCEH : O.FENCEV) : P.wall === 'hedge' ? O.HEDGE : (hz ? O.WALLH : O.WALLV);
    const gateSide = [];
    const edge = (x, y, hz) => {
      if (!m.inb(x, y)) return;
      const i = I(x, y);
      if (street[i] || OW.roadTiles[i]) { gateSide.push([x, y, hz]); return; }
      if (free(x, y) || (ok(x, y) && NATOBJ.has(m.obj[i]) && !res[i])) { m.obj[i] = wallO(hz); }
    };
    for (let x = E.x0; x <= E.x1; x++) { edge(x, E.y0, true); edge(x, E.y1, true); }
    for (let y = E.y0 + 1; y < E.y1; y++) { edge(E.x0, y, false); edge(E.x1, y, false); }
    // 문기둥: 길 양옆 담 끝에 깃발
    for (const [x, y, hz] of gateSide) {
      const a = hz ? [x - 1, y] : [x, y - 1], b = hz ? [x + 1, y] : [x, y + 1];
      for (const [gx, gy] of [a, b]) { const j = I(gx, gy); if (m.inb(gx, gy) && !street[j] && !OW.roadTiles[j] && m.obj[j] === wallO(hz)) m.obj[j] = O.BANNER; }
    }
    // 마을 문 앞 이정표
    OW.poi[n + '_gate'] = { x: px, y: E.y1 };
  }

  /* ───────── 광장: 동심원 포석 ───────── */
  function plazas(m) {
    m.plazas = [];
    for (const [n, C] of Object.entries(OW.towns)) {
      if (!C.plaza) continue;
      const P = PLAN[n] || {};
      const cx = (C.plaza.x + 1) * TS, cy = (C.plaza.y + 1) * TS;
      m.plazas.push({ x: cx, y: cy, r: 7 * TS, accent: P.plaza, cols: null });
      for (let y = C.plaza.y - 3; y <= C.plaza.y + 4; y++) for (let x = C.plaza.x - 4; x <= C.plaza.x + 5; x++) {
        const i = m.i(x, y); if (m.solidExtra[i]) continue;
        const d = Math.hypot(x + 0.5 - (C.plaza.x + 1), y + 0.5 - (C.plaza.y + 1));
        const t = m.ter[i];
        if (d < 4.6 && (t === C.road || t === T.GRASS || NATURAL[t] || t === T.STONE || t === T.TILE || t === T.ROAD)) { m.ter[i] = T.PLAZA; if (m.obj[i] && NATOBJ.has(m.obj[i])) m.obj[i] = 0; }
      }
    }
    m.plazaNear = (x, y) => { for (const p of m.plazas) { const dx = x - p.x, dy = y - p.y; if (dx * dx + dy * dy < p.r * p.r) return p; } return null; };
  }

  OW.hooks.push((m) => {
    for (const [n, P] of Object.entries(PLAN)) district(m, n, P);
    plazas(m);
  });
  // 적이 넓어진 마을 안에서 나오지 않게
  const inTown0 = OW.inTown;
  OW.inTown = function (x, y, pad) { for (const t of Object.values(OW.towns)) { const E = t.outer; if (E && x >= E.x0 - pad && y >= E.y0 - pad && x <= E.x1 + pad && y <= E.y1 + pad) return true; } return inTown0(x, y, pad); };
})();
