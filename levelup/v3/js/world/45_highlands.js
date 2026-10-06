/* 높은 땅(고원) — 대륙의 언덕 · 고원(높이 1~4)은 거의 다 마을에서 걸어서 닿지 못해 버려져 있었다.
   · 대륙을 짓는 마지막 갈고리: 걸어서 닿는 땅(모든 도구를 가졌을 때)을 세고, 닿지 못하는 25칸 이상 무리를 낮은 것부터 차례로 —
     남쪽 절벽 면 한 줄(2칸 폭)을 계단으로 바꾼다(아래가 이미 닿는 땅이고, 길에 가까운 곳). 그런 면이 없으면 가장 싼 길을 낸다.
     그 고원이 속한 지역보다 늦게 열리는 땅으로는 잇지 않는다.
   · 지역마다 가장 큰 고원엔 「고원 굴」(방 다섯 · 열쇠 문 · 정예 수호자 · 큰 상자),
     나머지 고원엔 돌탑(능력 포인트) · 하늘 상자 · 고원의 수호자 · 전망대 · 은둔자 · 별똥별(밤) 가운데 하나. 처음 오르면 알림(고원 k/N). */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, TS = TL.TS, O = OB.O;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const RANK = { green: 0, red: 1, blue: 2, amber: 2, yellow: 3, purple: 4, mist: 4, rainbow: 5, white: 6, gray: 7, black: 8, colorful: 9 };
  const MIN = 25;
  const HL = ST.HIGH = { sites: [], caves: {}, stairs: [], paths: 0 };
  const NAME = (n) => (OW.SHORT && OW.SHORT[n]) || n;
  const DAYLEN = 720, today = () => Math.floor(((S().t || 0) + DAYLEN * 0.3) / DAYLEN);
  const isNight = () => (G.story.nightFactor ? G.story.nightFactor() : 0) > 0.5;
  const RARE = {
    lo: ['art_moonslash', 'fc_coral', 'bw_bone', 'art_nova', 'tome_poison', 'ac_roll'],
    mid: ['sw_twin', 'bw_venom', 'fc_orb', 'art_quakeblade', 'tome_barrier', 'tome_blink', 'bw_thunder', 'sw_frost'],
    hi: ['bw_moon', 'fc_moon', 'art_blackhole', 'tome_gravity', 'ac_berserk', 'sw_moon'],
  };
  const LOOT = {
    lo: [['potion_r', 3], ['arrows10', 2], ['bombs5', 1], ['potion_b', 1]],
    mid: [['potion_g', 2], ['potion_b', 2], ['potion_r', 4], ['arrows10', 3]],
    hi: [['potion_max', 1], ['potion_g', 3], ['potion_b', 3]],
  };
  const band = (tier) => (tier >= 6 ? 'hi' : tier >= 3 ? 'mid' : 'lo');
  const okItem = (id, alt) => (G.data.ITEMS[id] ? id : alt);
  const pickRare = (tier, key) => { const l = RARE[band(tier)]; for (let k = 0; k < l.length; k++) { const id = l[(U.hash(key) + k) % l.length]; if (G.data.ITEMS[id]) return id; } return 'potion_g'; };
  const pickLoot = (tier, key) => { const l = LOOT[band(tier)]; const [id, n] = l[U.hash(key) % l.length]; return G.data.ITEMS[id] ? [id, n] : ['potion_r', 2]; };

  /* ───────── 지역마다 고원 굴 ───────── */
  const CAVES = {
    green: { name: '바람 언덕 굴', floor: T.ROOTS, wall: 'root', pal: 'green', amb: 'spores', col: '#5a6a3a', lore: '굴 벽에 아이들 키를 잰 금이 있다. 맨 위 금 옆에: 「언덕 위에서는 탑이 작아 보인다.」' },
    red: { name: '재 덮인 높은 굴', floor: T.ORE, wall: 'mine', pal: 'red', amb: 'sparks', col: '#7a4a3a', lore: '곡괭이 자국. 「광산이 닫힌 날, 우리는 위로 팠다. 아래엔 기사단이 있었으니까.」' },
    blue: { name: '갈매기 벼랑 굴', floor: T.WETSTONE, wall: 'rock', pal: 'blue', amb: 'bubbles', col: '#4a6a7a', lore: '조개껍질로 쓴 글씨. 「밀물이 닿지 않는 곳에 등대지기의 두 번째 등불을 숨겼다.」' },
    yellow: { name: '모래 언덕 위 굴', floor: T.HIERO, wall: 'sand', pal: 'yellow', amb: 'dust', col: '#a8884a', lore: '금화 한 닢이 벽에 박혀 있다. 아무리 당겨도 빠지지 않는다. 그 아래: 「욕심은 위로 오르지 못한다」' },
    purple: { name: '노을 고원 굴', floor: T.MIRROR, wall: 'mirror', pal: 'purple', amb: 'motes', col: '#6a4a7a', lore: '벽에 비친 내 얼굴이 조금 늦게 웃는다. 학원 시험 문제가 새겨져 있다: 「해는 왜 지지 않는가」' },
    white: { name: '눈 덮인 봉우리 굴', floor: T.ICEBRICK, wall: 'ice', pal: 'white', amb: 'motes', col: '#8aa0b8', lore: '얼음 속에 꽃 한 송이. 순례자의 글씨: 「봉우리는 기도를 가장 먼저 듣는다. 대답은 가장 늦게 한다.」' },
    gray: { name: '잿빛 고원 굴', floor: T.GRATE, wall: 'tech', pal: 'gray', amb: 'dust', col: '#6a6a72', lore: '은빛 왕국의 측량 표지. 「612년, 이 고원은 색을 잃지 않았다. 너무 높아서.」' },
    black: { name: '별 없는 고원 굴', floor: T.CAVE, wall: 'castle', pal: 'black', amb: 'motes', col: '#2a2438', dark: 0.55, lore: '벽에 별을 그린 그림 열여섯 장. 해마다 한 장. 마지막 장엔 별 대신 등불이 그려져 있다.' },
    mist: { name: '안개 위 굴', floor: T.WETSTONE, wall: 'root', pal: 'mist', amb: 'mist', col: '#4a6a5a', lore: '안개가 굴 입구에서 멈춘다. 들어오지 않는다. 무언가를 기다리는 것처럼.' },
    amber: { name: '단풍 봉우리 굴', floor: T.DRY, wall: 'sand', pal: 'amber', amb: 'dust', col: '#a85a3a', lore: '단풍잎 하나가 바람 없이 떨어졌다. 땅에 닿자 옛날 목소리가 났다: 「여기까지 올라온 건 네가 처음이야.」' },
  };
  const landFoes = (reg) => (OW.TABLE[reg] || OW.TABLE.green).map(([t]) => t).filter((t) => t !== 'octo' && t !== 'turret');
  for (const [reg, C] of Object.entries(CAVES)) {
    const id = 'hl_' + reg, tier = (OW.TIERS && OW.TIERS[reg]) || 0;
    const tb = landFoes(reg), a = tb[0], b = tb[1 % tb.length], c = tb[2 % tb.length];
    const guard = tier >= 7 ? 'cgolem' : tier >= 4 ? 'berserk' : 'golem';
    const hubVar = U.hash(reg) % 3;
    const hub = hubVar === 0 ? { ter: [['pit', 8, 5, 4, 3]] } : hubVar === 1 ? { ter: [['h', 7, 4, 6, 5, 1]], stairs: [[9, 4, 2]] } : {};
    G.dungeon.def(id, {
      name: C.name, sub: NAME(reg) + ' 고원', pal: C.pal, music: 'hollow', tier, floor: C.floor, wall: C.wall, shape: 'cave', ambient: C.amb, dark: C.dark || 0,
      decor: [O.ROCK, O.PEBBLE, O.RUBBLE], decorRate: 0.07,
      start: ['1,2', 9, 11],
      exit: { at: ['1,2', 9, 13], to: 'world', get tx() { const s = HL.caves[reg]; return s ? s.x : 0; }, get ty() { const s = HL.caves[reg]; return s ? s.y + 2 : 0; } },
      floors: { '1,2': '굴 어귀', '0,1': '바람 굴', '1,1': '바람 굴', '2,1': '바람 굴', '1,0': '봉우리 방' },
      rooms: {
        '1,2': { props: [['sign', 13, 10, { text: C.name + '\n' + C.lore }], ['pot', 3, 10], ['pot', 16, 10], ['torch', 3, 3], ['torch', 16, 3]], foes: [[a, 5, 6], [b, 14, 6]] },
        '1,1': Object.assign({ solve: { type: 'clear' }, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['pot', 3, 11], ['pot', 16, 11]], foes: [[a, 4, 9], [c, 15, 9], [b, 9, 10]] }, hub),
        '0,1': { props: [['chest', 9, 6, { item: 'key_small' }], ['pot', 3, 3], ['pot', 4, 3]], foes: [[b, 5, 9], [c, 14, 9]] },
        '2,1': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'heartpiece', hidden: true }], ['torch', 4, 3], ['torch', 15, 3]], foes: [[a, 5, 8], [a, 14, 8], [c, 9, 10]] },
        '1,0': { solve: { type: 'clear' }, props: [['chest', 9, 5, { item: pickRare(tier, id), hidden: true, col: '#e8c048' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }]],
          foes: [[guard, 9, 7, { elite: true, hpMul: 1.6 }], [b, 5, 9, { elite: true }], [c, 14, 9]] },
      },
      doors: [['1,2', '1,1', 'open'], ['1,1', '0,1', 'open'], ['1,1', '2,1', 'open'], ['1,1', '1,0', 'key']],
      ents(m, Wd) {
        if (!f(id + ':seen')) {
          S().flags[id + ':seen'] = true;
          const n = Object.keys(CAVES).filter((r) => f('hl_' + r + ':seen')).length, N = Object.keys(HL.caves).length || Object.keys(CAVES).length;
          G.ui.toast('고원 굴을 찾았다! (' + n + ' / ' + N + ')', 'gold');
        }
      },
    });
  }

  /* ───────── 대륙을 지을 때: 높은 땅을 잇고 자리를 고른다 ───────── */
  OW.hooks.push((m) => { try { openHighlands(m); } catch (e) { console.error('[highlands]', e); } });
  function openHighlands(m) {
    const SN = G.sanity; if (!SN || !SN.analyze || !SN.carvePath) return;
    const N = m.w * m.h, RN = OW.regName;
    const A = SN.analyze(m, SN.mainsOf(m), SN.linksOf(m), SN.passAll);
    const nc = A.L.nc, comp = A.L.comp;
    const fwd = new Uint8Array(nc), q = [];
    for (const [x, y] of SN.mainsOf(m)) { if (!m.inb(x, y)) continue; const c = comp[m.i(x, y)]; if (c >= 0 && !fwd[c]) { fwd[c] = 1; q.push(c); } }
    while (q.length) { const c = q.pop(); const o = A.J.get(c); if (o) for (const b2 of o) if (!fwd[b2]) { fwd[b2] = 1; q.push(b2); } }
    // 계단이 내려서는 땅: 도구 없이(칼 · 맨손) 마을에서 걸어 가고 돌아올 수 있는 곳 — 물갈퀴 · 장갑 · 폭탄 · 불이 있어야 닿는 땅에 이으면 이른 장에는 못 간다
    const AW = SN.analyze(m, SN.mainsOf(m), SN.linksOf(m), SN.passI);
    const fwdW = new Uint8Array(AW.L.nc);
    for (const [x, y] of SN.mainsOf(m)) { if (!m.inb(x, y)) continue; const c = AW.L.comp[m.i(x, y)]; if (c >= 0 && !fwdW[c]) { fwdW[c] = 1; q.push(c); } }
    while (q.length) { const c = q.pop(); const o = AW.J.get(c); if (o) for (const b2 of o) if (!fwdW[b2]) { fwdW[b2] = 1; q.push(b2); } }
    const conn = new Uint8Array(N);
    for (let i = 0; i < N; i++) { const c = AW.L.comp[i]; if (c >= 0 && fwdW[c] && AW.good[c]) conn[i] = 1; }
    // 닿지 못하는 무리: 칸 목록 · 지역
    const tiles = new Map();
    for (let i = 0; i < N; i++) { const c = comp[i]; if (c < 0 || fwd[c]) continue; let a = tiles.get(c); if (!a) tiles.set(c, a = []); a.push(i); }
    // 길까지의 거리 (계단 자리 고르기)
    const roadD = new Uint16Array(N).fill(999), rq = [];
    if (OW.roadTiles) for (let i = 0; i < N; i++) if (OW.roadTiles[i]) { roadD[i] = 0; rq.push(i); }
    for (let h = 0; h < rq.length; h++) { const i = rq[h], d = roadD[i]; if (d >= 40) continue; const x = i % m.w, y = (i / m.w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue; const j = m.i(nx, ny); if (roadD[j] > d + 1) { roadD[j] = d + 1; rq.push(j); } } }
    const towns = Object.values(OW.towns || {});
    const inTown = (x, y) => towns.some((t) => x >= t.x - 2 && y >= t.y - 2 && x < t.x + t.w + 2 && y < t.y + t.h + 2);
    const nearWarp = (x, y) => (m.warps || []).some((w) => x >= w.x - 3 && x <= w.x + (w.w || 1) + 2 && y >= w.y - 3 && y <= w.y + 4);
    const cands = [];
    for (const [c, list] of tiles) {
      if (list.length < MIN || m.hgt[list[0]] < 1) continue;   // 높은 땅만 (낮은 땅의 막힌 곳은 도구로 여는 길일 수 있다)
      const reg = {}; let bad = false, sx = 0, sy = 0;
      for (const i of list) { const x = i % m.w, y = (i / m.w) | 0; if (inTown(x, y) || nearWarp(x, y)) { bad = true; break; } reg[RN[i]] = (reg[RN[i]] || 0) + 1; sx += x; sy += y; }
      if (bad) continue;
      const r = Object.entries(reg).sort((p, q2) => q2[1] - p[1])[0][0];
      if (r === 'rainbow' || RANK[r] == null) continue;
      cands.push({ c, list, reg: r, h: m.hgt[list[0]], n: list.length, cx: Math.round(sx / list.length), cy: Math.round(sy / list.length) });
    }
    // 낮은 것부터, 같은 높이면 큰 것부터 (아래 고원에 계단이 생겨야 위 고원이 그 위로 이어진다)
    cands.sort((p, q2) => p.h - q2.h || q2.n - p.n);
    const inComp = new Int32Array(N).fill(-1);
    cands.forEach((cd, k) => { for (const i of cd.list) inComp[i] = k; });
    const passAll = (i) => SN.passAll(m, i);
    for (const [k, cd] of cands.entries()) {
      const rk = RANK[cd.reg];
      const okLand = (i) => conn[i] && SN.passI(m, i) && m.ter[i] !== T.WATER && m.ter[i] !== T.DEEP && (RANK[RN[i]] == null || RANK[RN[i]] <= rk);
      // (가) 남쪽 절벽 면 한 줄을 계단으로: 2칸 폭이 되면 더 좋다
      let best = null, bs = 1e9;
      for (const i of cd.list) {
        const x = i % m.w, y = (i / m.w) | 0;
        if (m.T(x, y + 1) !== T.CLIFF) continue;
        if (RANK[RN[i]] != null && RANK[RN[i]] > rk) continue;   // 계단 꼭대기도 그 고원의 지역(또는 먼저 열리는 지역) 쪽에
        let yy = y + 1; while (yy < m.h && m.T(x, yy) === T.CLIFF && yy - y <= 5) yy++;
        if (!m.inb(x, yy) || m.T(x, yy) === T.CLIFF) continue;
        const land = m.i(x, yy); if (!okLand(land) || m.hgt[land] >= cd.h) continue;
        const two = m.inb(x + 1, y) && inComp[m.i(x + 1, y)] === k && m.T(x + 1, y + 1) === T.CLIFF && (() => { let y2 = y + 1; while (m.T(x + 1, y2) === T.CLIFF && y2 - y <= 5) y2++; return y2 === yy && okLand(m.i(x + 1, yy)); })();
        const score = roadD[land] + (two ? 0 : 6) + Math.abs(x - cd.cx) * 0.15;
        if (score < bs) { bs = score; best = { x, y, yy, w: two ? 2 : 1 }; }
      }
      if (best) {
        for (let dx = 0; dx < best.w; dx++) {
          for (let yy = best.y + 1; yy < best.yy; yy++) { const i = m.i(best.x + dx, yy); m.ter[i] = T.STAIRS; m.obj[i] = 0; conn[i] = 1; }
          m.obj[m.i(best.x + dx, best.y)] = 0; m.obj[m.i(best.x + dx, best.yy)] = 0;
        }
        HL.stairs.push([best.x, best.y + 1, best.w, cd.reg]);
      } else {
        // (나) 가장 싼 길: 절벽은 계단 · 물은 다리 · 사물 치우기 (늦게 열리는 지역은 지나지 않는다)
        const own = cd.list.filter((i) => RN[i] === cd.reg);
        const ok = SN.carvePath(m, own.length ? own[(own.length / 2) | 0] : cd.list[(cd.list.length / 2) | 0], (i) => conn[i] && m.ter[i] !== T.WATER && m.ter[i] !== T.DEEP, 260, (j) => RANK[RN[j]] == null || RANK[RN[j]] <= rk);
        if (!ok) continue;
        HL.paths++;
        const path = m.sanCarved && m.sanCarved[m.sanCarved.length - 1]; if (path) for (const i of path) conn[i] = 1;
      }
      for (const i of cd.list) conn[i] = 1;
      cd.open = true;
    }
    // 자리 고르기: 가장자리에서 가장 먼 칸(둘레 3×3이 같은 고원) — 지역마다 가장 큰 고원(60칸 이상)엔 굴
    const opened = cands.filter((cd) => cd.open);
    const caveOf = {};
    for (const cd of opened.slice().sort((p, q2) => q2.n - p.n)) if (CAVES[cd.reg] && !caveOf[cd.reg] && cd.n >= 60) caveOf[cd.reg] = cd;
    const perReg = {};
    for (const cd of opened.slice().sort((p, q2) => q2.n - p.n)) {
      const k = cands.indexOf(cd);
      const dist = new Map(), dq = [];
      const at = (x, y) => (m.inb(x, y) ? inComp[m.i(x, y)] : -2);
      for (const i of cd.list) { const x = i % m.w, y = (i / m.w) | 0; let edge = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (at(x + dx, y + dy) !== k) edge = true; if (edge) { dist.set(i, 0); dq.push(i); } }
      for (let h = 0; h < dq.length; h++) { const i = dq[h], d = dist.get(i); const x = i % m.w, y = (i / m.w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if (at(x + dx, y + dy) !== k) continue; const j = m.i(x + dx, y + dy); if (!dist.has(j)) { dist.set(j, d + 1); dq.push(j); } } }
      const isCave = caveOf[cd.reg] === cd;
      let spot = null, sd = -1;
      for (const i of cd.list) {
        const d = dist.get(i) || 0; if (d <= sd) continue;
        if (RN[i] !== cd.reg) continue;   // 고원이 지역 경계에 걸치면 그 지역 쪽에 (늦게 열리는 옆 지역에 두지 않게)
        const x = i % m.w, y = (i / m.w) | 0;
        let ok = true;
        for (let yy = y - 1; yy <= y + (isCave ? 2 : 1) && ok; yy++) for (let xx = x - 1; xx <= x + (isCave ? 2 : 1); xx++) { if (at(xx, yy) !== k || m.solidExtra[m.i(xx, yy)] || RN[m.i(xx, yy)] !== cd.reg) { ok = false; break; } }
        if (ok) { spot = [x, y]; sd = d; }
      }
      if (!spot) continue;
      const [x, y] = spot;
      for (let yy = y - 1; yy <= y + 2; yy++) for (let xx = x - 1; xx <= x + 2; xx++) if (at(xx, yy) === k) m.obj[m.i(xx, yy)] = 0;
      const ri = perReg[cd.reg] = (perReg[cd.reg] || 0) + 1;
      const site = { id: cd.reg + ':' + ri, reg: cd.reg, tier: (OW.TIERS && OW.TIERS[cd.reg]) || 0, x, y, h: cd.h, n: cd.n };
      if (isCave) {
        site.kind = 'cave'; HL.caves[cd.reg] = site;
        G.build.placeBuilding(m, { special: 'cave', tx: x, ty: y, w: 2, h: 1, to: 'hl_' + cd.reg, id: 'hl_' + cd.reg + '_gate', col: CAVES[cd.reg].col });
      } else site.kind = null;
      HL.sites.push(site);
    }
    // 굴이 아닌 고원: 무엇이 있을지 (지역마다 은둔자는 하나)
    const KINDS = ['cairn', 'chest', 'guardian', 'scope', 'starfall', 'cairn', 'chest', 'hermit'];
    const hermitAt = {};
    for (const s of HL.sites) {
      if (s.kind) continue;
      let kd = KINDS[U.hash('hl:' + s.id) % KINDS.length];
      if (kd === 'hermit' && hermitAt[s.reg]) kd = 'scope';
      if (kd === 'hermit') hermitAt[s.reg] = true;
      if ((kd === 'scope' || kd === 'starfall') && s.h < 2 && U.hash(s.id) % 2) kd = 'cairn';
      s.kind = kd;
    }
    HL.total = HL.sites.length;
  }

  /* ───────── 정상의 것들 ───────── */
  /** 돌탑: 돌을 하나 얹으면 능력 포인트 +1 */
  class Cairn extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'cairn', solid: true, bw: 12, bh: 6 }, o)); }
    blockBox() { return { x: this.x - 6, y: this.y - 6, w: 12, h: 6 }; }
    canUse() { return true; }
    get label() { return f(this.key) ? '돌탑을 본다' : '돌을 얹는다'; }
    use() {
      const key = this.key, reg = this.reg;
      G.script.run(async (c) => {
        if (f(key)) { await c.say(null, '네가 얹은 돌이 맨 위에 있다. 바람이 그 돌만 비켜 간다.', { style: 'sys' }); return; }
        c.flag(key); S().pts = (S().pts || 0) + 1; c.sfx('puzzle'); G.fx.glow(this.x, this.y - 14, '#fff2a8', 20);
        const n = HL.sites.filter((s2) => s2.kind === 'cairn' && f('hl:' + s2.id + ':cairn')).length, N = HL.sites.filter((s2) => s2.kind === 'cairn').length;
        await c.say(null, NAME(reg) + ' 고원의 돌탑. 누군가 여기까지 올라와 돌을 하나씩 얹었다.\n돌을 하나 얹었다. 몸 안의 빛이 한 칸 단단해진다. [y]능력 포인트 +1[/] (돌탑 ' + n + ' / ' + N + ')', { style: 'sys' });
      });
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const st = [[-6, -3, 12, 4, '#8a8a90'], [-5, -6, 10, 4, '#9a9aa2'], [-4, -9, 8, 3, '#7a7a82'], [-3, -12, 6, 3, '#a8a8b0'], [-2, -14, 4, 2, '#8a8a92']];
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x - 7, y - 1, 14, 2);
      for (const [a, b, w, h, col] of st) { g.fillStyle = '#2a2a32'; g.fillRect(x + a - 1, y + b - 1, w + 2, h + 1); g.fillStyle = col; g.fillRect(x + a, y + b, w, h); }
      if (f(this.key)) { g.fillStyle = '#fff2a8'; g.fillRect(x - 2, y - 17, 4, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 17, 2, 1); }
    }
  }
  /** 수호자 자리: 다가가면 고원의 수호자(정예)가 일어나고, 쓰러뜨리면 상자가 드러난다 */
  class Guard extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'hlguard', solid: false, hidden: true }, o)); this.foe = null; }
    update(dt, Wd) {
      const p = Wd.player; if (!p || f(this.key) || this.foe) return;
      if (Math.hypot(p.x - this.x, p.y - this.y) > 96) return;
      const tb = landFoes(this.reg), t = this.tier >= 7 ? 'cgolem' : this.tier >= 4 ? 'berserk' : tb[U.hash(this.key) % tb.length];
      const e = G.foes.spawn(t, this.x + 20, this.y - 6, { tier: Math.min(11, this.tier + 1), elite: true, hpMul: 1.4 });
      e.name = NAME(this.reg) + ' 고원의 수호자'; e.aggro = true; e.home = { x: e.x, y: e.y };
      const key = this.key, od = e.onDie;
      e.onDie = function () { if (od) od.apply(this, arguments); S().flags[key] = true; G.ui.toast('고원의 수호자가 쓰러졌다 — 상자가 드러났다', 'gold'); };
      this.foe = e; G.fx.glow(e.x, e.y - 10, '#ff6a4a', 22); if (G.audio) G.audio.sfx('rumble');
      G.ui.toast(e.name + '가 길을 막아선다!', 'bad');
    }
  }
  /** 별똥별: 밤에 고원에 오르면 별 하나가 떨어진다 (하루에 한 번) */
  class Starfall extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'starfall', solid: false, hidden: true }, o)); this.fallT = -1; this.shard = null; }
    update(dt, Wd) {
      const p = Wd.player; if (!p) return;
      if (this.fallT >= 0) {
        this.fallT += dt;
        const k = Math.min(1, this.fallT / 0.9), sx = this.x + 120 * (1 - k), sy = this.y - 200 * (1 - k);
        G.fx.part({ x: sx, y: sy, z: 0, vx: 0, vy: 0, g: 0, life: 0.35, col: '#fff8c0', size: 2, glow: true });
        if (k >= 1) {
          this.fallT = -1; G.fx.ring(this.x, this.y - 4, '#fff2a8', 24, 0.5, 2); G.fx.sparks(this.x, this.y - 6, 18, '#fff8c0', 60); W().shake(2, 0.3); if (G.audio) G.audio.sfx('white');
          const key = this.key, reg = this.reg, sf = this;
          this.shard = Wd.add(new G.props.Spot({ x: this.x, y: this.y, verb: '별 조각을 줍는다', sparkle: true, text: async (c) => {
            if (S().flags[key] === today()) return;
            S().flags[key] = today();
            const gain = Math.max(20, Math.round(G.data.expNext(S().lv) * 0.12)), gold = 40 + 20 * ((OW.TIERS && OW.TIERS[reg]) || 0);
            const up = G.st.gainExp(S(), gain); c.gold(gold); c.sfx('item');
            await c.say(null, '손바닥만 한 별 조각. 아직 따뜻하다. 쥐자 빛 알갱이로 부서져 몸에 스민다.\n[y]경험 +' + gain + ' · ' + gold + '골드[/]' + (up ? '\n[y]레벨 업![/]' : ''), { style: 'sys' });
            if (sf.shard) { sf.shard.dead = true; sf.shard = null; }
          } }));
        }
        return;
      }
      if (this.shard || !isNight() || S().flags[this.key] === today()) return;
      if (Math.hypot(p.x - this.x, p.y - this.y) > 110) return;
      this.fallT = 0; G.ui.toast('하늘에서 무언가 떨어진다…!', 'gold');
    }
  }
  const W = () => G.world;

  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    for (const s of HL.sites) {
      const X = px(s.x), Y = py(s.y), key = 'hl:' + s.id;
      if (s.kind === 'cave') { Wd.add(new P.Sign({ x: X - 24, y: Y + 30, text: CAVES[s.reg].name + '\n바람이 굴 안쪽에서 바깥으로 분다. 안에 무언가 지키는 것이 있다.' })); continue; }
      if (s.kind === 'cairn') Wd.add(new Cairn({ x: X, y: Y, key: key + ':cairn', reg: s.reg }));
      else if (s.kind === 'chest') { const [id, n] = pickLoot(s.tier, key); Wd.add(new P.Chest({ x: X, y: Y, item: id, n, flagKey: key + ':chest', col: '#8ad8ff' })); }
      else if (s.kind === 'guardian') { Wd.add(new P.Chest({ x: X, y: Y, item: pickRare(s.tier, key), flagKey: key + ':chest', hiddenUntil: key + ':guard', col: '#e8c048' })); if (!f(key + ':guard')) Wd.add(new Guard({ x: X, y: Y, key: key + ':guard', reg: s.reg, tier: s.tier })); }
      else if (s.kind === 'scope') Wd.add(new G.build.Decor({ decor: 'telescope', x: X, y: Y, verb: '망원경을 들여다본다', text: (c) => scope(c, s) }));
      else if (s.kind === 'starfall') { Wd.add(new P.Sign({ x: X - 20, y: Y + 4, look: 'stone', anyDir: true, text: '별을 세는 돌.\n「밤에 여기 서 있으면 하늘이 무언가를 떨어뜨린다. 하루에 하나. 욕심내면 다음 날.」' })); Wd.add(new Starfall({ x: X + 8, y: Y + 2, key: key + ':star', reg: s.reg })); }
      else if (s.kind === 'hermit') Wd.add(new P.NPC({ x: X, y: Y, dir: 'down', look: G.cast.folk(HERMIT[s.reg] ? HERMIT[s.reg][0] : 'oldm'), name: NAME(s.reg) + ' 고원의 은둔자', wanderR: 12, talk: (c, n) => hermit(c, n, s), mark: () => (!f(key + ':gift') ? '!' : null) }));
    }
  });
  /** 전망대: 처음 들여다보면 경험, 그리고 아직 못 간 가장 가까운 고원 굴을 지도에 표시한다 */
  async function scope(c, s) {
    const key = 'hl:' + s.id + ':scope';
    const far = Object.values(HL.caves).filter((cv) => !f('hl_' + cv.reg + ':seen') && G.story.regionOpen(cv.reg)).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
    const dir = (cv) => { const dx = cv.x - s.x, dy = cv.y - s.y; const ns = dy < -8 ? '북' : dy > 8 ? '남' : '', ew = dx > 8 ? '동' : dx < -8 ? '서' : ''; return (ns + ew || '가까운') + '쪽'; };
    let txt = '망원경 너머로 ' + NAME(s.reg) + '의 지붕들이 손톱만 하게 보인다.';
    if (!f(key)) {
      c.flag(key);
      const gain = Math.max(15, Math.round(G.data.expNext(S().lv) * 0.15)); const up = G.st.gainExp(S(), gain);
      txt += '\n이렇게 높이 올라온 건 처음이다. [y]경험 +' + gain + '[/]' + (up ? ' [y]레벨 업![/]' : '');
    }
    if (far) {
      txt += '\n' + dir(far) + ' 먼 고원에 굴 입구가 보인다 — ' + CAVES[far.reg].name + '. (지도에 표시했다)';
      const wm = G.build.get('world'); wm.markers = wm.markers || []; if (!wm.markers.some((mk) => mk.hl === far.reg)) wm.markers.push({ x: far.x, y: far.y, col: '#ffcc4a', hl: far.reg });
      S().flags['hlmark:' + far.reg] = true;
    }
    c.sfx('clickspot');
    await c.say(null, txt, { style: 'sys' });
  }
  // 전망대로 본 굴은 다시 들어와도 지도에 남는다
  ST.onMap('world', (m) => { m.markers = m.markers || []; for (const cv of Object.values(HL.caves)) if (f('hlmark:' + cv.reg) && !f('hl_' + cv.reg + ':seen') && !m.markers.some((mk) => mk.hl === cv.reg)) m.markers.push({ x: cv.x, y: cv.y, col: '#ffcc4a', hl: cv.reg }); });

  /** 은둔자: 지역마다 한 사람. 처음엔 선물, 그다음엔 고원 이야기 */
  const HERMIT = {
    green: ['oldm', '마을이 저렇게 작은 줄 몰랐지? 탑도 여기서 보면 이쑤시개야. 나는 그게 좋아서 내려가지 않는다.'],
    red: ['miner', '광산이 닫히던 날 나는 위로 팠다. 위에는 금이 없더군. 대신 하늘이 있었어. 값은 안 나가지만.'],
    blue: ['sailor', '파도는 여기까지 안 올라와. 그래서 여기서 파도를 보지. 오늘은 어제보다 조금 높다.'],
    yellow: ['merchant', '모래 언덕 위에선 아무도 값을 묻지 않아. 바람이 다 공짜거든. 나는 그 공짜를 팔러 내려갈 생각이 없다.'],
    purple: ['mage', '해가 지지 않는 숲에서, 이 고원만 밤이 온다. 시빌 할멈도 모르는 비밀이지. …아니, 알 거야. 그 할멈은.'],
    white: ['nun', '봉우리는 기도를 가장 먼저 듣는대요. 그래서 여기서 빌어요. 대답은… 아직이에요. 봉우리는 대답이 느리대요.'],
    gray: ['mech', '612년에 색이 빠질 때, 이 고원은 너무 높아서 안 빠졌어. 여기 풀만 초록이지. 아무한테도 말하지 마.'],
    black: ['nightm', '별이 안 보이는 땅에서 제일 높은 곳에 오면, 그래도 하나는 보여. 딱 하나. 나는 그걸 매일 보고 있다.'],
    mist: ['oldw', '안개는 고원을 넘지 못해. 그래서 여기서는 내 얼굴이 제때 웃어. 아래서는 늘 늦게 웃는다오.'],
    amber: ['farmerw', '협곡 단풍은 여기서 시작해. 첫 잎이 떨어지면 아래로 아래로 소문이 나지. 너도 그 소문이야.'],
    colorful: ['inventor', '여기서 날개를 시험해. 여러 번 떨어졌어. 마지막엔 조금 떴지. 아주 조금.'],
  };
  const GIFT = { lo: ['potion_g', 2], mid: ['potion_max', 1], hi: ['potion_max', 2] };
  async function hermit(c, n, s) {
    const key = 'hl:' + s.id + ':gift', h = HERMIT[s.reg] || HERMIT.green;
    await c.say(n, h[1], { face: 'normal' });
    if (!f(key)) {
      c.flag(key);
      await c.say(n, '여기까지 올라온 사람은 오랜만이야. 빈손으로 내려가게 할 수는 없지. 고원에서 딴 거다.', { face: 'smile' });
      const [id, k] = GIFT[band(s.tier)];
      await c.getItem(okItem(id, 'potion_r'), k);
      c.gold(60 + 30 * s.tier);
      const gain = Math.max(20, Math.round(G.data.expNext(S().lv) * 0.1)); G.st.gainExp(S(), gain);
    } else await c.say(n, '내려가면 사람들한테 안부 전해 줘. …아니, 전하지 마. 그러면 다들 올라올 테니.', { face: 'smile' });
  }

  /* ───────── 처음 오르면: 고원 k / N ───────── */
  let chkT = 0;
  ST.onTick.push((dt) => {
    chkT += dt || 1 / 60; if (chkT < 0.5) return; chkT = 0;
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p || G.script.running) return;
    const tx = p.x / TS, ty = p.y / TS;
    for (const s of HL.sites) {
      if (Math.abs(s.x - tx) > 7 || Math.abs(s.y - ty) > 7) continue;
      if (m.H(Math.floor(tx), Math.floor((p.y - 1) / TS)) !== s.h) continue;
      const k = 'hl:' + s.id + ':seen'; if (f(k)) continue;
      S().flags[k] = true;
      const n = HL.sites.filter((s2) => f('hl:' + s2.id + ':seen')).length;
      G.ui.toast('높은 곳에 올랐다 — ' + NAME(s.reg) + ' 고원 (' + n + ' / ' + HL.sites.length + ')', 'gold');
      if (G.audio) G.audio.jingle && G.audio.jingle('secret');
    }
  });
})();
