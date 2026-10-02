/* 던전: 방 격자로 짓는다. 방마다 적 · 퍼즐 · 상자 · 지형, 방 사이 문은 열림 · 작은 열쇠 · 큰 열쇠 · 셔터 · 금 간 벽.
   방 관리자(RoomCtl)가 들어서면 적을 불러내고, 다 쓰러뜨리거나 퍼즐을 풀면 깃발을 세운다.
   def('d1', {...})  — 방 좌표는 'x,y' (격자), 방 안 좌표는 칸 (0,0 = 방 왼쪽 위 벽) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent;
  const T = TL.T, TS = TL.TS;
  const P = () => G.props;
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);

  const DUN = {};
  const RW0 = 20, RH0 = 14;
  const RESPAWN = 1800;              // 쓰러뜨린 던전 적이 다시 나오기까지 (놀이 시간 30분)          // 방 크기 기본값 (벽 포함) — 던전마다 D.rw · D.rh 로 키울 수 있다

  /* 던전 모양 (방마다 또는 던전 전체): rect(네모) · cave(굽은 자연 벽) · round(둥근 방) · open(벽 없이 허공 위의 섬) · hall(기둥이 늘어선 큰 방)
     D.pos: 방 이름 → 격자 자리 (이름은 이야기와 깃발에 쓰이니 그대로, 자리만 옮긴다)
     D.merge: [[방, 방], …] 둘 사이 벽을 허물어 큰 방으로
     이웃하지 않은 방 사이의 문은 계단이 된다: D.stairAt['가>나'] = [[x, y], [x, y]] (각 방 안 자리)
     D.floors: 방 → 층 이름 (지도 · 계단에서 보인다) · D.decor: 벽가에 흩을 사물 · D.ambient: 떠다니는 것 · D.sconce: 벽 횃불 색 */
  /** 미로: 칸(cell) 크기 = 통로 폭 + 벽 1. 막힌 칸(res)은 늘 길. 몇 군데 벽을 더 허물어 고리(loops)를 만든다 */
  function carveMaze(m, x0, y0, RW, RH, res, fl, rnd, cell, loops) {
    const ix0 = 1, iy0 = 2, iw = RW - 2, ih = RH - 3;
    const cw = Math.floor((iw + 1) / cell), chh = Math.floor((ih + 1) / cell);
    if (cw < 2 || chh < 2) return;
    const open = new Uint8Array(iw * ih);
    const setOpen = (x, y) => { if (x >= 0 && y >= 0 && x < iw && y < ih) open[y * iw + x] = 1; };
    const cellFill = (cx, cy) => { for (let y = 0; y < cell - 1; y++) for (let x = 0; x < cell - 1; x++) setOpen(cx * cell + x, cy * cell + y); };
    const seen = new Uint8Array(cw * chh);
    const stack = [[Math.floor(rnd() * cw), Math.floor(rnd() * chh)]];
    seen[stack[0][1] * cw + stack[0][0]] = 1; cellFill(stack[0][0], stack[0][1]);
    const knock = (ax, ay, bx, by) => {   // 두 칸 사이 벽 허물기
      if (ax === bx) { const y = Math.max(ay, by) * cell - 1; for (let x = 0; x < cell - 1; x++) setOpen(ax * cell + x, y); }
      else { const x = Math.max(ax, bx) * cell - 1; for (let y = 0; y < cell - 1; y++) setOpen(x, ay * cell + y); }
    };
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cw && ny < chh && !seen[ny * cw + nx]);
      if (!nb.length) { stack.pop(); continue; }
      const [nx, ny] = nb[Math.floor(rnd() * nb.length)];
      seen[ny * cw + nx] = 1; cellFill(nx, ny); knock(cx, cy, nx, ny); stack.push([nx, ny]);
    }
    for (let cy = 0; cy < chh; cy++) for (let cx = 0; cx < cw; cx++) {
      if (cx + 1 < cw && rnd() < loops) knock(cx, cy, cx + 1, cy);
      if (cy + 1 < chh && rnd() < loops) knock(cx, cy, cx, cy + 1);
    }
    for (let y = 0; y < ih; y++) for (let x = 0; x < iw; x++) {
      const i = m.i(x0 + ix0 + x, y0 + iy0 + y);
      if (res[i]) { if (m.ter[i] === T.WALL) m.ter[i] = fl; continue; }
      if (m.ter[i] !== fl) continue;
      if (!open[y * iw + x]) m.ter[i] = T.WALL;
    }
  }
  /** 넓은 굴: 바위섬이 흩어진 동굴. 비워 둔 칸끼리는 반드시 이어 준다 */
  function carveCavern(m, x0, y0, RW, RH, res, fl, seed, rock) {
    const inside = (x, y) => x >= 1 && y >= 2 && x < RW - 1 && y < RH - 1;
    for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
      const i = m.i(x0 + x, y0 + y); if (res[i] || m.ter[i] !== fl) continue;
      const d = Math.min(x - 1, RW - 2 - x, y - 2, RH - 2 - y);
      const n = U.vnoise((x0 + x) / 3.1, (y0 + y) / 3.1, seed) * 0.75 + U.noise2(x0 + x, y0 + y, seed + 3) * 0.25;
      if (n > 1 - rock * 0.55 || (d < 2 && n > 0.55 - d * 0.1)) m.ter[i] = T.WALL;
    }
    // 이어 주기: 방 가운데에서 퍼져 나가 닿지 않는 비워 둔 칸은 곧은 굴로 잇는다
    const cx = RW >> 1, cy = RH >> 1;
    for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) m.ter[m.i(x0 + x, y0 + y)] = fl;
    const reach = () => { const seen = new Uint8Array(RW * RH); const q = [[cx, cy]]; seen[cy * RW + cx] = 1; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!inside(nx, ny) || seen[ny * RW + nx]) continue; if (m.ter[m.i(x0 + nx, y0 + ny)] === T.WALL) continue; seen[ny * RW + nx] = 1; q.push([nx, ny]); } } return seen; };
    let seen = reach();
    for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
      const i = m.i(x0 + x, y0 + y);
      if (!res[i] || seen[y * RW + x] || m.ter[i] === T.WALL) continue;
      let px = x, py = y;
      while (px !== cx || py !== cy) { if (Math.abs(px - cx) > Math.abs(py - cy)) px += Math.sign(cx - px); else py += Math.sign(cy - py); for (const [dx, dy] of [[0, 0], [1, 0], [0, 1]]) if (inside(px + dx, py + dy) && m.ter[m.i(x0 + px + dx, y0 + py + dy)] === T.WALL) m.ter[m.i(x0 + px + dx, y0 + py + dy)] = fl; }
      seen = reach();
    }
    // 닿지 않는 빈 칸은 메운다 (갇힌 적 · 상자 방지)
    for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) { const i = m.i(x0 + x, y0 + y); if (m.ter[i] === fl && !seen[y * RW + x] && !res[i]) m.ter[i] = T.WALL; }
  }
  function roomPos(D, k) { const p = D.pos && D.pos[k]; return p || k.split(',').map(Number); }
  function build(id, D) {
    const RW = D.rw || RW0, RH = D.rh || RH0;
    const keys = Object.keys(D.rooms);
    const P = {}; for (const k of keys) P[k] = roomPos(D, k);
    const gw = Math.max(...keys.map((k) => P[k][0])) + 1, gh = Math.max(...keys.map((k) => P[k][1])) + 1;
    const m = new G.GameMap({ id, name: D.name, w: gw * RW, h: gh * RH, region: TL.REGIONS.indexOf(D.pal || 'dungeon'), edge: T.VOID, music: D.music || 'cave' });
    m.palName = D.pal || 'dungeon';
    m.dungeon = id; m.dark = D.dark || 0; m.RW = RW; m.RH = RH; m.baseDark = D.dark || 0; m.darkCol = D.darkCol; m.sub = D.sub || '';
    m.wallStyle = D.wall || { green: 'root', red: 'mine', blue: 'rock', yellow: 'sand', purple: 'mirror', rainbow: 'marble', white: 'ice', gray: 'vein', black: 'castle', space: 'tech' }[D.pal] || 'brick';
    m.weather = D.ambient || null;
    m.ter.fill(T.VOID);
    m.rooms = {};
    const floor = D.floor || T.FLOOR;
    const at = {}; for (const k of keys) at[P[k][0] + ',' + P[k][1]] = k;
    const adj = (a, b) => Math.abs(P[a][0] - P[b][0]) + Math.abs(P[a][1] - P[b][1]) === 1;
    for (const k of keys) {
      const R = D.rooms[k];
      const [rx, ry] = P[k];
      const x0 = rx * RW, y0 = ry * RH;
      m.rooms[k] = { k, x0, y0, R, gx: rx, gy: ry, floor: D.floors ? D.floors[k] : null };
      for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
        const i = m.i(x0 + x, y0 + y);
        const wall = y < 2 || x === 0 || x === RW - 1 || y === RH - 1;
        m.ter[i] = wall ? T.WALL : (R.floor || floor);
      }
      // 지형: [종류, x, y, w, h, 높이]
      for (const t of R.ter || []) {
        const [kind, tx, ty, tw, th, hh] = t;
        const tt = { pit: T.PIT, water: T.WATER, deep: T.DEEP, lava: T.LAVA, ice: T.ICE, rug: T.RUG, carpet: T.CARPET, wall: T.WALL, stone: T.STONE, tile: T.TILE, grass: T.GRASS, dirt: T.DIRT, sand: T.SAND, snow: T.SNOW, metal: T.METAL, cloud: T.CLOUD, crystal: T.CRYSTAL, dark: T.DARK, moss: T.MOSS, swamp: T.SWAMP, gravel: T.GRAVEL, floor }[kind];
        for (let y = ty; y < ty + th; y++) for (let x = tx; x < tx + tw; x++) {
          if (kind === 'h') { m.hgt[m.i(x0 + x, y0 + y)] = hh; continue; }
          if (tt != null) m.ter[m.i(x0 + x, y0 + y)] = tt;
        }
      }
    }
    // 방 안 사물 (돌 · 덤불 · 수정 …): [이름, x, y]
    for (const k of keys) { const { x0, y0, R } = m.rooms[k]; for (const [on, ox, oy] of R.objs || []) m.obj[m.i(x0 + ox, y0 + oy)] = G.objs.O[on.toUpperCase()]; }
    // ── 비워 둘 칸 (모양을 깎을 때 건드리지 않는다): 소품 · 적 · 지형 · 문 · 계단 · 입구 둘레
    const res = new Uint8Array(m.w * m.h);
    const mark = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (m.inb(x + dx, y + dy)) res[m.i(x + dx, y + dy)] = 1; };
    for (const k of keys) {
      const { x0, y0, R } = m.rooms[k];
      for (const pr of R.props || []) mark(x0 + pr[1], y0 + pr[2], pr[0] === 'boss' ? 3 : 1);
      for (const fo of R.foes || []) mark(x0 + fo[1], y0 + fo[2], 1);
      for (const t of R.ter || []) for (let y = t[2] - 1; y <= t[2] + t[4]; y++) for (let x = t[1] - 1; x <= t[1] + t[3]; x++) mark(x0 + x, y0 + y, 0);
      for (const st of R.stairs || []) mark(x0 + st[0], y0 + st[1], 2);
      for (const [, ox, oy] of R.objs || []) mark(x0 + ox, y0 + oy, 1);
      // 방 가운데 십자는 늘 트여 있게 (미로 · 동굴은 제 길을 판다)
      const sh0 = R.shape || D.shape || 'rect';
      if (sh0 !== 'maze' && sh0 !== 'cavern') for (let x = 1; x < RW - 1; x++) for (const y of [(RH >> 1), (RH >> 1) + 1]) res[m.i(x0 + x, y0 + y)] = 1;
      if (sh0 !== 'maze' && sh0 !== 'cavern') for (let y = 2; y < RH - 1; y++) for (const x of [(RW >> 1) - 1, RW >> 1]) res[m.i(x0 + x, y0 + y)] = 1;
    }
    if (D.start) { const r = m.rooms[D.start[0]]; mark(r.x0 + D.start[1], r.y0 + D.start[2], 2); }
    if (D.exit) { const r = m.rooms[D.exit.at[0]]; mark(r.x0 + D.exit.at[1], r.y0 + D.exit.at[2], 2); }
    // 방 사이 문: 벽에 2칸 구멍 (이웃한 방) · 계단 (떨어진 방)
    m.doorways = []; m.stairLinks = [];
    const stairRes = new Uint8Array(m.w * m.h);
    // 이웃한 두 방의 문 구멍이 던전 출구 칸과 겹치면(출구 방 바로 아래에 붙은 깊은 구역) 계단으로 잇는다: 그 문으로 걸어가면 밖으로 나가 버렸다
    const exitCells = new Set();
    if (D.exit) { const er = m.rooms[D.exit.at[0]]; if (er) for (let dx = 0; dx < 2; dx++) exitCells.add(m.i(er.x0 + D.exit.at[1] + dx, er.y0 + D.exit.at[2])); }
    const clashExit = (a, b) => {
      if (!exitCells.size) return false;
      const [ax, ay] = P[a], [bx, by] = P[b];
      if (ay === by) return false;
      const y = Math.max(ay, by) * RH, x = ax * RW + (RW >> 1);
      for (const [cx, cy] of [[x - 1, y - 1], [x, y - 1], [x - 1, y], [x, y]]) if (exitCells.has(m.i(cx, cy))) return true;
      return false;
    };
    for (const d of D.doors || []) {
      const [a, b, kind, extra] = d;
      if (!adj(a, b) || clashExit(a, b)) {
        // 계단 자리: 정해 두지 않았으면 방 네 귀퉁이 중 빈 곳
        const pick = (k) => {
          const r = m.rooms[k];
          const cand = [];
          for (let cy = 3; cy <= RH - 4; cy++) for (let cx = 2; cx <= RW - 4; cx++) cand.push([cx, cy, Math.min(cx - 2, RW - 4 - cx) + Math.min(cy - 3, RH - 4 - cy) * 1.5 + (cy > RH / 2 ? 0.5 : 0)]);
          cand.sort((p1, p2) => p1[2] - p2[2]);
          const free = (cx, cy, strict) => { for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 2; x++) { const i = m.i(r.x0 + x, r.y0 + y); if ((strict && res[i]) || stairRes[i] || m.ter[i] !== (r.R.floor || floor) || m.obj[i]) return false; } return true; };
          for (const strict of [true, false]) for (const [cx, cy] of cand) if (free(cx, cy, strict)) return [cx, cy];
          return [RW - 5, 3];
        };
        let sa, sb;
        if (D.stairAt && D.stairAt[a + '>' + b]) [sa, sb] = D.stairAt[a + '>' + b];
        else if (D.stairAt && D.stairAt[b + '>' + a]) [sb, sa] = D.stairAt[b + '>' + a];
        else { sa = pick(a); sb = pick(b); }
        const ra = m.rooms[a], rb = m.rooms[b];
        // 계단 칸과 내려서는 칸(바로 아래)은 늘 단단한 바닥: 구덩이 · 물 방에서 빈자리가 없어 아무 데나 고른 계단이 구덩이 위로 내려놓던 것
        for (const [r2, sp] of [[ra, sa], [rb, sb]]) for (let dy = 0; dy <= 1; dy++) for (let dx = 0; dx <= 1; dx++) { const rx = sp[0] + dx, ry = sp[1] + dy; if (rx < 1 || rx > RW - 2 || ry < 2 || ry > RH - 2) continue; const i = m.i(r2.x0 + rx, r2.y0 + ry); m.ter[i] = r2.R.floor || floor; m.obj[i] = 0; }
        mark(ra.x0 + sa[0], ra.y0 + sa[1], 2); mark(rb.x0 + sb[0], rb.y0 + sb[1], 2);
        for (const [X, Y] of [[ra.x0 + sa[0], ra.y0 + sa[1]], [rb.x0 + sb[0], rb.y0 + sb[1]]]) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 3; dx++) if (m.inb(X + dx, Y + dy)) stairRes[m.i(X + dx, Y + dy)] = 1;
        m.stairLinks.push({ a, b, kind, extra, pa: [ra.x0 + sa[0], ra.y0 + sa[1]], pb: [rb.x0 + sb[0], rb.y0 + sb[1]] });
        m.doorways.push({ a, b, kind, extra, cells: [], stair: true });
        continue;
      }
      const [ax, ay] = P[a], [bx, by] = P[b];
      const horiz = ay === by;             // 좌우로 이웃
      let cells = [];
      if (horiz) { const x = Math.max(ax, bx) * RW; const y = ay * RH + (RH >> 1); cells = [[x - 1, y], [x, y], [x - 1, y + 1], [x, y + 1]]; }
      else { const y = Math.max(ay, by) * RH; const x = ax * RW + (RW >> 1); cells = [[x - 1, y - 1], [x, y - 1], [x - 1, y], [x, y], [x - 1, y + 1], [x, y + 1]]; }
      for (const [x, y] of cells) if (kind !== 'bomb' && kind !== 'wall') m.ter[m.i(x, y)] = floor;
      for (const [x, y] of cells) mark(x, y, 1);
      // 문 앞 통로 (안쪽으로 세 칸)
      for (const [x, y] of cells) for (let k2 = 1; k2 <= 3; k2++) { if (horiz) { mark(x - k2, y, 0); mark(x + k2, y, 0); } else { mark(x, y - k2, 0); mark(x, y + k2, 0); } }
      m.doorways.push({ a, b, kind, extra, cells, horiz });
    }
    // ── 큰 방: 두 방 사이 벽 허물기
    for (const [a, b] of D.merge || []) {
      if (!adj(a, b)) continue;
      const A = m.rooms[a], B = m.rooms[b];
      if (P[a][1] === P[b][1]) { const L2 = P[a][0] < P[b][0] ? A : B; for (let y = L2.y0 + 2; y < L2.y0 + RH - 1; y++) for (const x of [L2.x0 + RW - 1, L2.x0 + RW]) { m.ter[m.i(x, y)] = floor; res[m.i(x, y)] = 1; } }
      else { const U2 = P[a][1] < P[b][1] ? A : B; for (let x = U2.x0 + 1; x < U2.x0 + RW - 1; x++) for (const y of [U2.y0 + RH - 1, U2.y0 + RH, U2.y0 + RH + 1]) { m.ter[m.i(x, y)] = floor; res[m.i(x, y)] = 1; } }
      const dw = m.doorways.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a)); if (dw) dw.kind = 'open';
      A.merged = B.merged = true;
    }
    // ── 모양 깎기
    const baseFloor = (t) => t === floor || t === (D.floor || T.FLOOR);
    for (const k of keys) {
      const { x0, y0, R } = m.rooms[k];
      const shape = R.shape || D.shape || 'rect';
      const seed = U.hash(id + k) % 997;
      if (shape === 'cave') {
        const carved = [];
        for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
          const i = m.i(x0 + x, y0 + y); if (res[i] || !baseFloor(m.ter[i])) continue;
          const d = Math.min(x - 1, RW - 2 - x, y - 2, RH - 2 - y);
          const n = U.vnoise((x0 + x) / 2.3, (y0 + y) / 2.3, seed) * 0.7 + U.noise2(x0 + x, y0 + y, seed) * 0.3;
          const corner = Math.min(x - 1, RW - 2 - x) + Math.min(y - 2, RH - 2 - y) < 2;
          if (corner || n * 2.6 > d + 0.75) { m.ter[i] = T.WALL; carved.push(i); }
        }
        // 외톨이 벽 조각 지우기
        for (const i of carved) { const x = i % m.w, y = (i / m.w) | 0; let nb = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (m.T(x + dx, y + dy) === T.WALL) nb++; if (nb <= 1) m.ter[i] = R.floor || floor; }
      } else if (shape === 'round') {
        const cx = (RW - 1) / 2, cy = (RH + 1) / 2, rx = RW / 2 - 0.6, ry = (RH - 2) / 2;
        for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
          const i = m.i(x0 + x, y0 + y); if (res[i] || !baseFloor(m.ter[i])) continue;
          if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1) m.ter[i] = T.WALL;
        }
      } else if (shape === 'open') {
        // 벽 대신 허공: 벽 칸을 구덩이로 (문 자리는 다리처럼 남는다)
        for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) { const i = m.i(x0 + x, y0 + y); if (m.ter[i] === T.WALL) m.ter[i] = T.PIT; }
        // 가장자리를 조금 들쭉날쭉하게
        for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
          const i = m.i(x0 + x, y0 + y); if (res[i] || !baseFloor(m.ter[i])) continue;
          const d = Math.min(x - 1, RW - 2 - x, y - 2, RH - 2 - y);
          if (d === 0 && U.vnoise((x0 + x) / 2, (y0 + y) / 2, seed) > 0.62) m.ter[i] = T.PIT;
        }
      } else if (shape === 'maze') {
        carveMaze(m, x0, y0, RW, RH, res, R.floor || floor, U.rng(seed + 7), R.cell || D.cell || 3, R.loops != null ? R.loops : D.loops != null ? D.loops : 0.08);
      } else if (shape === 'cavern') {
        carveCavern(m, x0, y0, RW, RH, res, R.floor || floor, seed, R.rock != null ? R.rock : D.rock != null ? D.rock : 0.5);
      } else if (shape === 'hall') {
        for (let y = 4; y < RH - 2; y += 3) for (const x of [3, RW - 4]) { const i = m.i(x0 + x, y0 + y); if (!res[i] && baseFloor(m.ter[i]) && !m.obj[i]) m.obj[i] = G.objs.O.PILLAR; }
      }
      // 붉은 융단 (성)
      if (R.runner || D.runner) {
        for (let y = 2; y < RH - 1; y++) for (const x of [(RW >> 1) - 1, RW >> 1]) { const i = m.i(x0 + x, y0 + y); if (baseFloor(m.ter[i])) m.ter[i] = T.CARPET; }
      }
    }
    // ── 벽가 장식 · 벽 횃불
    m.sconce = new Uint8Array(m.w * m.h);
    m.lights = [];
    const rnd = U.rng(U.hash('dec:' + id));
    for (const k of keys) {
      const { x0, y0, R } = m.rooms[k];
      const shape = R.shape || D.shape || 'rect';
      if (D.decor && shape !== 'open') for (let y = 2; y < RH - 1; y++) for (let x = 1; x < RW - 1; x++) {
        const i = m.i(x0 + x, y0 + y); if (res[i] || !baseFloor(m.ter[i]) || m.obj[i]) continue;
        let nearWall = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1], [0, 1]]) if (m.T(x0 + x + dx, y0 + y + dy) === T.WALL) nearWall = true;
        if (nearWall && rnd() < (D.decorRate || 0.09)) m.obj[i] = U.pick(D.decor, rnd());
      }
      if (D.sconce) for (let x = 3; x < RW - 3; x += 5) {
        const i = m.i(x0 + x, y0 + 1);
        if (m.ter[i] === T.WALL && m.T(x0 + x, y0 + 2) !== T.WALL && m.T(x0 + x, y0 + 2) !== T.VOID) { m.sconce[i] = 1; m.lights.push({ x: (x0 + x) * TS + 8, y: (y0 + 1) * TS + 8, r: 58, warm: D.sconce }); }
      }
    }
    // 방 안 높이 → 절벽 · 계단
    G.gen.cliffs(m);
    for (const k of keys) for (const st of D.rooms[k].stairs || []) { const { x0, y0 } = m.rooms[k]; G.gen.stairsBelow(m, x0 + st[0], y0 + st[1], st[2] || 2); }
    // 입구 (나가는 곳)
    if (D.start) { const [sk, sx, sy] = D.start; const r = m.rooms[sk]; m.entry = { x: (r.x0 + sx) * TS + 8, y: (r.y0 + sy) * TS + 12 }; }
    if (D.exit) { const [ek, ex, ey] = D.exit.at; const r = m.rooms[ek]; for (let dx = 0; dx < 2; dx++) { m.ter[m.i(r.x0 + ex + dx, r.y0 + ey)] = floor; m.warps.push({ x: r.x0 + ex + dx, y: r.y0 + ey, w: 1, h: 1, to: D.exit.to, tx: D.exit.tx, ty: D.exit.ty, dir: 'down', exit: true }); } }
    for (const w of D.warps || []) { const [wk, wx, wy] = w.at; const r = m.rooms[wk]; m.warps.push(Object.assign({ x: r.x0 + wx, y: r.y0 + wy, w: w.w || 1, h: w.h || 1 }, w)); }
    return m;
  }

  /** 층과 층을 잇는 계단: 밟으면 어두워졌다가 이어진 계단 앞에 선다 */
  class StairLink extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'stairlink', solid: false, sortBias: -30 }, o)); this.armed = true; }
    get open() {
      const s = S();
      if (this.kind2 === 'key' || this.kind2 === 'big') return !!s.flags[this.key];
      if (this.kind2 === 'switch') return !!s.flags[this.flag];
      return true;
    }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player; if (!p || G.script.running) return;
      const on = Math.abs(p.x - this.x) < 13 && p.y > this.y - 14 && p.y < this.y + 2;
      if (!on) { this.armed = true; return; }
      if (!this.armed) return;
      if (!this.open) {
        const s = S();
        if (this.kind2 === 'key' && (s.keys[this.did] || 0) > 0) { s.keys[this.did]--; s.flags[this.key] = true; sfx('unlock'); }
        else if (this.kind2 === 'big' && s.bigkeys[this.did]) { s.flags[this.key] = true; sfx('unlock'); }
        else { this.armed = false; G.ui.toast(this.kind2 === 'key' ? '계단 앞 창살에 자물쇠가 걸려 있다 (작은 열쇠)' : this.kind2 === 'big' ? '큰 자물쇠가 계단을 막고 있다' : '계단이 막혀 있다', 'bad'); sfx('buzz'); return; }
      }
      this.armed = false; const to = this.link; to.armed = false;
      G.script.run(async (c) => {
        sfx('stairs'); c.lock(true);
        await c.fade(true, { sec: 0.25 });
        p.x = to.x; p.y = to.y + 16; p.dir = 'down'; p.kx = p.ky = 0; G.world.snap();
        await c.fade(false, { sec: 0.25 });
        c.lock(false);
      });
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx) - 16, y = Math.round(this.y - cy) - 26;
      const down = this.dir === 'down';
      g.fillStyle = '#0a0810'; g.fillRect(x, y, 32, 28);
      for (let k = 0; k < 6; k++) {
        const yy = down ? y + 3 + k * 4 : y + 23 - k * 4;
        const shade = down ? 1 - k * 0.15 : 0.55 + k * 0.08;
        const c = Math.round(150 * shade), c2 = Math.round(130 * shade);
        g.fillStyle = 'rgb(' + c + ',' + c2 + ',' + Math.round(c * 1.1) + ')'; g.fillRect(x + 2 + (down ? k : 0), yy, 28 - (down ? k * 2 : 0), 3);
        g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + 2 + (down ? k : 0), yy + 3, 28 - (down ? k * 2 : 0), 1);
      }
      g.fillStyle = '#2a2436'; g.fillRect(x, y, 2, 28); g.fillRect(x + 30, y, 2, 28);
      if (!this.open) { g.fillStyle = '#8a8098'; for (let i = 3; i < 30; i += 5) g.fillRect(x + i, y + 2, 2, 24); g.fillStyle = this.kind2 === 'big' ? '#d83a5a' : '#e8c850'; g.fillRect(x + 13, y + 10, 6, 7); }
      else if (Math.sin(this.t * 3) > 0.6) { g.fillStyle = 'rgba(255,240,200,0.25)'; g.fillRect(x + 4, y + (down ? 22 : 2), 24, 3); }
    }
  }

  /* ───────── 방 관리자 ───────── */
  class RoomCtl extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'roomctl', solid: false, hidden: true }, o)); this.active = false; this.foes = []; }
    get flagClear() { return this.did + ':' + this.k + ':clear'; }
    /** 쓰러뜨린 적 기록 (방 · 적 차례). 놀이 시간 RESPAWN초가 지나기 전에는 다시 나오지 않는다 */
    slainRec() {
      const s = S(), key = this.did + ':' + this.k;
      s.slain = s.slain || {};
      const r = s.slain[key];
      // 던전을 나갔다 다시 들어왔고(방문 번호가 바뀜) 놀이 시간도 충분히 흘렀을 때만 다시 채운다
      if (r && s.t - r.t >= RESPAWN && r.v !== (s.dgVisit || 0)) { delete s.slain[key]; return null; }
      return r || null;
    }
    spawnList(list, Wd, tag) {
      const s = S();
      const hpK = G.dungeon.HP_MUL;
      const rec = tag ? this.slainRec() : null;
      (list || []).forEach((f, i) => {
        const [type, fx, fy, fo] = f;
        const sid = tag ? tag + i : null;
        if (sid && rec && rec.ids.includes(sid)) return;
        if (fo && fo.once && s.flags[this.did + ':' + this.k + ':f' + fx + fy]) return;
        const e = G.foes.spawn(type, (this.x0 + fx) * TS + 8, (this.y0 + fy) * TS + 12, Object.assign({ tier: this.tier, hpMul: hpK, inDungeon: true }, fo || {}));
        e.room = this.k; e.home = { x: e.x, y: e.y }; e.aggro = !(fo && fo.sleep); e.slainId = sid;
        G.fx.glow(e.x, e.y - 8, '#b8a8ff', 6);
        this.foes.push(e);
      });
    }
    /** 이 방에서 쓰러진 적을 적어 둔다 (방을 나갔다 들어와도 되살아나지 않게) */
    noteSlain() {
      for (const e of this.foes) {
        if (!e.dead || e._slainNoted || !e.slainId || e.hp > 0) continue;
        e._slainNoted = true;
        const s = S(), key = this.did + ':' + this.k;
        const r = this.slainRec() || (s.slain[key] = { t: s.t, ids: [], v: s.dgVisit || 0 });
        if (!r.ids.includes(e.slainId)) r.ids.push(e.slainId);
        r.t = s.t; r.v = s.dgVisit || 0;
      }
    }
    get RW() { return G.world.map.RW || RW0; } get RH() { return G.world.map.RH || RH0; }
    /** 풀지 못한 채 방을 나가면 돌덩이를 처음 자리로 (구석에 밀어 넣거나 구덩이에 빠뜨려 퍼즐이 막히던 것) */
    resetBlocks(Wd) {
      const rr = Wd.map.rooms && Wd.map.rooms[this.k]; if (!rr || !rr.blockSpecs || !rr.blockSpecs.length) return;
      if (S().flags[this.flagClear]) return;
      for (const sp of rr.blockSpecs) {
        const b = sp.ent;
        if (b && !b.dead) { if (!b.moving && (b.x !== sp.x || b.y !== sp.y)) { b.x = sp.x; b.y = sp.y; b.moved = false; b.pushT = 0; } }
        else { const nb = new (P().Block)({ x: sp.x, y: sp.y, col: sp.col }); nb.room = this.k; sp.ent = Wd.add(nb); }
      }
    }
    inside(p) { return p.x > (this.x0 + 1) * TS && p.x < (this.x0 + this.RW - 1) * TS && p.y > (this.y0 + 2) * TS && p.y < (this.y0 + this.RH - 1) * TS + 4; }
    update(dt, Wd) {
      const p = Wd.player; if (!p) return;
      const s = S();
      const inside = this.inside(p);
      if (inside && !this.seen) { this.seen = true; s.flags['room:' + this.did + ':' + this.k] = true; }
      if (inside && this.floorName && Wd.map.curFloor !== this.floorName) { const first = Wd.map.curFloor == null; Wd.map.curFloor = this.floorName; if (!first) G.cine.area(this.floorName, Wd.map.name); }
      if (inside) { const want = this.R.dark != null ? this.R.dark : Wd.map.baseDark; if (want != null && Wd.map.dark !== want) Wd.map.dark = U.approach(Wd.map.dark || 0, want, dt * 1.5); }
      if (inside && !this.active) {
        this.active = true;
        const R = this.R;
        if (R.onEnter && !this.enteredOnce) { this.enteredOnce = true; R.onEnter(this, Wd); }
        const solvedClear = R.solve && (R.solve.type === 'clear' || R.solve.type === 'waves') && s.flags[this.flagClear] && !R.respawn;
        if (!solvedClear) this.spawnList(R.waves ? R.waves[0] : R.foes, Wd, R.waves ? null : 'f:');   // 파도 방은 적지 않는다 (다시 들어오면 첫 파도부터)
        // 「방 정리」 방의 적을 이미 다 쓰러뜨렸으면 풀린 것으로
        this.allSlain = !solvedClear && !R.waves && (R.foes || []).length > 0 && !this.foes.length;
        this.wave = 0;
        if (R.solve && (R.solve.type === 'clear' || R.solve.type === 'waves') && !s.flags[this.flagClear] && this.foes.length) { this.trap = true; sfx('door'); if (R.waves) G.ui.toast('시련의 방 — 파도 1 / ' + R.waves.length, 'bad'); }
      }
      if (this.active) this.noteSlain();
      // 파도: 다 쓰러뜨리면 다음 무리
      if (this.active && this.R.waves && !s.flags[this.flagClear] && this.foes.length && this.foes.every((e) => e.dead) && this.wave < this.R.waves.length - 1) {
        this.waveT = (this.waveT || 0) + dt;
        if (this.waveT > 1.1) { this.waveT = 0; this.wave++; this.foes = []; this.spawnList(this.R.waves[this.wave], Wd); sfx('encounter'); Wd.shake(2, 0.3); G.ui.toast('파도 ' + (this.wave + 1) + ' / ' + this.R.waves.length + (this.wave === this.R.waves.length - 1 ? ' — 마지막!' : ''), 'bad'); }
      }
      if (!inside && this.active && !this.trap) {
        // 방을 나가면 적은 사라진다 (다시 들어오면 새로)
        if (U.dist(p.x, p.y, (this.x0 + this.RW / 2) * TS, (this.y0 + this.RH / 2) * TS) > Math.max(this.RW, this.RH) * TS) { for (const e of this.foes) if (!e.dead) e.dead = true; this.foes = []; this.active = false; this.resetBlocks(Wd); }
      }
      // 퍼즐 · 청소
      const R = this.R;
      if (R.solve && !s.flags[this.flagClear]) {
        const sv = R.solve;
        let ok = false;
        if (sv.type === 'clear') ok = this.active && ((this.foes.length > 0 && this.foes.every((e) => e.dead)) || this.allSlain);
        else if (sv.type === 'waves') ok = this.active && this.foes.length > 0 && this.foes.every((e) => e.dead) && this.wave >= (this.R.waves || [0]).length - 1;
        else if (sv.type === 'order') ok = !!this.seqDone;
        else if (sv.type === 'torches') ok = Wd.ents.filter((e) => e.room === this.k && e instanceof P().Torch).every((t) => t.lit);
        else if (sv.type === 'plates') ok = Wd.ents.filter((e) => e.room === this.k && e instanceof P().Plate).every((pl) => pl.down);
        else if (sv.type === 'flag') ok = !!s.flags[sv.flag];
        if (ok) {
          s.flags[this.flagClear] = true; if (sv.flag) s.flags[sv.flag] = true;
          this.trap = false;
          sfx('puzzle'); if (G.audio) G.audio.jingle('secret');
          if (sv.msg) G.ui.toast(sv.msg, 'good');
          if (sv.onSolve) sv.onSolve(this, Wd);
        }
      }
      if (this.trap && s.flags[this.flagClear]) this.trap = false;
    }
  }
  /** 방 문: 셔터(trap) · 열쇠 · 큰 열쇠 · 스위치 */
  class Gate extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'gate', solid: true }, o)); this.anim = 0; }
    get isOpen() {
      const s = S();
      if (this.kind2 === 'key' || this.kind2 === 'big') return !!s.flags[this.key];
      if (this.kind2 === 'shut') return !!s.flags[this.flag];
      if (this.kind2 === 'trap') { const ctl = this.ctls.find((c) => c.trap); return !ctl; }
      return true;
    }
    blockBox() { return this.isOpen ? null : { x: this.bx, y: this.by, w: this.bw2, h: this.bh2 }; }
    get solid() { return !this.isOpen; } set solid(v) { /* 계산값 */ }
    update(dt) {
      this.t += dt; const want = this.isOpen ? 1 : 0; if (want !== this.last) { if (this.last != null) { sfx(want ? 'door' : 'block'); G.fx.dust(this.bx + this.bw2 / 2, this.by + this.bh2, 4); } this.last = want; } this.anim = U.approach(this.anim, want, dt * 5);
      // 열쇠를 가진 채 자물쇠 문을 밀면 저절로 연다 (J를 몰라도 막히지 않게)
      if (!want && (this.kind2 === 'key' || this.kind2 === 'big')) {
        const p = G.world.player, s = S();
        const has = this.kind2 === 'big' ? !!s.bigkeys[this.did] : (s.keys[this.did] || 0) > 0;
        if (has && p && (p.pushT || 0) > 0.18 && !p.dead) {
          const cx = this.bx + this.bw2 / 2, cy = this.by + this.bh2 / 2, dx = cx - p.x, dy = cy - (p.y - 4);
          const near = Math.abs(dx) < this.bw2 / 2 + 12 && Math.abs(dy) < this.bh2 / 2 + 14;
          if (near && (p.vx || 0) * dx + (p.vy || 0) * dy > 0) this.use(p);
        } else if (!has && this.kind2 === 'big' && p && (p.pushT || 0) > 0.4 && !(this.hintT > this.t)) {
          const dx = this.bx + this.bw2 / 2 - p.x, dy = this.by + this.bh2 / 2 - (p.y - 4);
          if (Math.abs(dx) < this.bw2 / 2 + 12 && Math.abs(dy) < this.bh2 / 2 + 14) { this.hintT = this.t + 6; G.ui.toast('[r]큰 자물쇠[/] — 이 던전 어딘가 [y]붉은 큰 상자[/]에 큰 열쇠가 있다 (지도에서 붉은 표시)', 'bad', 'bigdoor'); }
        }
      }
    }
    canUse(p) { return !this.isOpen && (this.kind2 === 'key' || this.kind2 === 'big') && U.dist(p.x, p.y, this.x, this.y) < 30; }
    get label() { return '연다'; }
    use() {
      const s = S(), d = this.did;
      if (this.kind2 === 'key') { if ((s.keys[d] || 0) > 0) { s.keys[d]--; s.flags[this.key] = true; sfx('unlock'); G.fx.sparks(this.x, this.y - 8, 10, '#e8c850'); } else { G.ui.toast('작은 열쇠가 필요하다', 'bad'); sfx('buzz'); } }
      else if (this.kind2 === 'big') { if (s.bigkeys[d]) { s.flags[this.key] = true; sfx('unlock'); G.world.shake(3, 0.4); G.fx.sparks(this.x, this.y - 8, 18, '#e8c850'); } else { G.ui.toast('큰 열쇠가 필요하다', 'bad'); sfx('buzz'); } }
    }
    draw(g, cx, cy) {
      if (this.anim >= 1) return;
      const k = this.anim;
      const col = this.kind2 === 'big' ? '#8a3a5a' : this.kind2 === 'key' ? '#8a5a2a' : '#5a5470';
      for (const [tx, ty] of this.cells) {
        const x = tx * TS - cx, y = ty * TS - cy;
        const hh = Math.round(16 * (1 - k));
        g.fillStyle = '#140c1c'; g.fillRect(x, y + 16 - hh, 16, hh);
        g.fillStyle = col; g.fillRect(x + 1, y + 16 - hh + 1, 14, Math.max(0, hh - 2));
        g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(x + 1, y + 16 - hh + 1, 14, 2);
        if (this.kind2 === 'trap' || this.kind2 === 'shut') { g.fillStyle = '#8a8098'; for (let i = 2; i < 16; i += 4) g.fillRect(x + i, y + 16 - hh + 2, 2, Math.max(0, hh - 3)); }
      }
      if (hhGuard(k) && (this.kind2 === 'key' || this.kind2 === 'big')) {
        const x = this.x - cx, y = this.y - cy - 10;
        g.fillStyle = '#e8c850'; g.fillRect(x - 3, y - 3, 6, 7); g.fillStyle = this.kind2 === 'big' ? '#d83a5a' : '#140c1c'; g.fillRect(x - 1, y - 1, 2, 3);
      }
    }
  }
  const hhGuard = (k) => k < 0.4;

  /** 눈 스위치: 화살로 맞히면 깃발 */
  class Eye extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'eye', solid: true, bw: 12, bh: 8 }, o)); }
    blockBox() { return { x: this.x - 6, y: this.y - 8, w: 12, h: 8 }; }
    get on() { return !!S().flags[this.sets]; }
    shotHit(sh) { if (sh.kind === 'arrow' || sh.kind === 'beam') { if (!this.on) { S().flags[this.sets] = true; sfx('switch'); G.fx.sparks(this.x, this.y - 12, 10, '#ffe066'); if (this.timer) this.left = this.timer; } return true; } return false; }
    update(dt) { this.t += dt; if (this.left > 0) { this.left -= dt; if (this.left <= 0) { S().flags[this.sets] = false; sfx('click'); } } }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 18);
      g.fillStyle = '#140c1c'; g.fillRect(x - 7, y - 1, 14, 20);
      g.fillStyle = '#6a6480'; g.fillRect(x - 6, y, 12, 18);
      g.fillStyle = '#fbf8ff'; g.fillRect(x - 4, y + 4, 8, 6);
      g.fillStyle = this.on ? '#6ae07a' : '#d83a5a'; g.fillRect(x - 2, y + 5, 4, 4);
      if (!this.on) { g.fillStyle = '#140c1c'; g.fillRect(x - 1, y + 6, 2, 2); }
      if (this.left > 0) { g.fillStyle = '#ffe066'; g.fillRect(x - 6, y + 16, Math.round(12 * this.left / this.timer), 1); }
    }
  }

  /** 환영 벽: 벽처럼 보이지만 진실의 거울 · 흰빛을 비추면 사라진다 */
  class Veil extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'veil', solid: false, hidden: false }, o)); }
    get done() { return !!S().flags[this.flagKey]; }
    apply() { const m = G.world.map; for (const [x, y] of this.cells) m.setT(x, y, this.floor); }
    reveal() { if (this.done) return; S().flags[this.flagKey] = true; this.apply(); sfx('mirror'); for (const [x, y] of this.cells) G.fx.glow(x * TS + 8, y * TS + 8, '#d8b0ff', 6); }
    update(dt) { this.t += dt; if (this.done && !this.applied) { this.applied = true; this.apply(); } }
    draw(g, cx, cy) { if (this.done) return; if (Math.sin(this.t * 2) > 0.8) { for (const [x, y] of this.cells) { g.globalAlpha = 0.15; g.fillStyle = '#d8b0ff'; g.fillRect(x * TS - cx, y * TS - cy, 16, 16); } g.globalAlpha = 1; } }
  }

  /** 순서 발판: 적힌 순서대로 밟아야 한다. 틀리면 모두 되돌아간다 (R.punish: 틀릴 때 튀어나오는 적) */
  const GLYPH = ['해', '달', '별', '눈', '물', '불', '잎', '종'];
  class SeqPlate extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'seqplate', solid: false, bw: 12, bh: 12 }, o)); this.down = false; }
    ctl() { const r = G.world.map.rooms[this.room]; return r && r.ctl; }
    update(dt) {
      this.t += dt;
      const c = this.ctl(); if (!c) return;
      if (S().flags[c.flagClear]) { this.down = true; return; }
      const p = G.world.player;
      const on = (p && !p.jz && Math.abs(p.x - this.x) < 7 && Math.abs(p.y - 6 - (this.y - 8)) < 7) || G.world.ents.some((e) => e.pushable && Math.abs(e.x - this.x) < 6 && Math.abs(e.y - this.y) < 6);
      if (on && !this.down && !this.cool) {
        c.seqNext = c.seqNext || 0;
        if (this.n === c.seqNext) {
          this.down = true; c.seqNext++; sfx('switch'); G.fx.glow(this.x, this.y - 6, '#ffe066', 10);
          const all = G.world.ents.filter((e) => e instanceof SeqPlate && e.room === this.room);
          if (c.seqNext >= all.length) c.seqDone = true;
        } else {
          sfx('buzz'); G.world.shake(2, 0.2); G.ui.toast('순서가 틀렸다 — 발판이 되돌아갔다', 'bad');
          for (const e of G.world.ents) if (e instanceof SeqPlate && e.room === this.room) { e.down = false; e.cool = true; }
          c.seqNext = 0;
          const R = c.R;
          if (R.punish && !(c.punished > 2)) { c.punished = (c.punished || 0) + 1; c.spawnList(R.punish, G.world); }
        }
      }
      if (!on && this.cool) this.cool = false;
    }
    draw() {}
    drawShadow(g, cx, cy) {
      const im = P().ART.plate(this.down); const x = Math.round(this.x - cx - 9), y = Math.round(this.y - cy - 17);
      g.drawImage(im, x, y);
      g.fillStyle = this.down ? '#ffe066' : 'rgba(255,255,255,0.75)'; g.font = '8px Galmuri11, sans-serif'; g.textAlign = 'center'; g.fillText(this.glyph || GLYPH[this.n % 8], x + 9, y + 12); g.textAlign = 'left';
    }
  }
  /** 무너지는 바닥: 밟으면 금이 가다가 꺼진다. 한참 뒤 다시 메워진다 */
  class Crumble extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'crumble', solid: false, hidden: false, sortBias: -60 }, o)); this.cells = []; for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) this.cells.push({ x: o.tx + x, y: o.ty + y, k: 0, gone: 0 }); }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player, m = Wd.map;
      const ptx = p ? Math.floor(p.x / TS) : -9, pty = p ? Math.floor((p.y - 2) / TS) : -9;
      for (const c of this.cells) {
        if (c.gone > 0) { c.gone -= dt; if (c.gone <= 0) { m.setT(c.x, c.y, this.floor); c.k = 0; } continue; }
        if (p && !p.jz && p.state !== 'fall' && c.x === ptx && c.y === pty) c.k += dt;
        else if (c.k > 0 && c.k < 0.1) c.k = 0;
        if (c.k > 0) c.k += dt * 0.5;
        if (c.k > 0.6) { m.setT(c.x, c.y, T.PIT); c.gone = 6; c.k = 0; sfx('rock'); G.fx.dust(c.x * TS + 8, c.y * TS + 12, 5); G.fx.shards(c.x * TS + 8, c.y * TS + 10, 4, '#8a7a6a'); }
      }
    }
    drawShadow(g, cx, cy) {
      for (const c of this.cells) {
        if (c.gone > 0) continue;
        const x = c.x * TS - cx, y = c.y * TS - cy;
        g.strokeStyle = c.k > 0 ? 'rgba(20,10,10,' + (0.4 + c.k) + ')' : 'rgba(20,10,10,0.28)'; g.lineWidth = 1;
        g.beginPath(); g.moveTo(x + 3, y + 4); g.lineTo(x + 8, y + 8); g.lineTo(x + 6, y + 13); g.moveTo(x + 8, y + 8); g.lineTo(x + 13, y + 6); g.stroke();
        if (c.k > 0) { const j = Math.sin(this.t * 60) * c.k * 2; g.fillStyle = 'rgba(0,0,0,' + (c.k * 0.6) + ')'; g.fillRect(x + 1 + j, y + 1, 14, 14); }
      }
    }
    draw() {}
  }
  /** 가시 함정: 일정한 박자로 솟는다 */
  class Spikes extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'spikes', solid: false, sortBias: -50 }, o)); this.period = o.period || 1.6; this.phase = o.phase || 0; }
    get up() { const k = ((G.world.t + this.phase) % this.period) / this.period; return k > 0.55; }
    get warn() { const k = ((G.world.t + this.phase) % this.period) / this.period; return k > 0.4 && k <= 0.55; }
    update(dt, Wd) {
      const p = Wd.player; if (!p || p.jz || !this.up) return;
      const ptx = Math.floor(p.x / TS), pty = Math.floor((p.y - 2) / TS);
      if (ptx >= this.tx && ptx < this.tx + this.w && pty >= this.ty && pty < this.ty + this.h) G.combat.hurtPlayer(p, this.dmg || 3, { x: p.x, y: p.y + 4 }, { noKnock: false });
    }
    drawShadow(g, cx, cy) {
      const up = this.up, warn = this.warn;
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
        const X0 = (this.tx + x) * TS - cx, Y0 = (this.ty + y) * TS - cy;
        g.fillStyle = 'rgba(20,14,24,0.55)'; g.fillRect(X0 + 1, Y0 + 1, 14, 14);
        for (const [a, b] of [[4, 4], [11, 4], [4, 11], [11, 11], [7.5, 7.5]]) {
          if (up) { g.fillStyle = '#d8d8e8'; g.beginPath(); g.moveTo(X0 + a - 2, Y0 + b + 2); g.lineTo(X0 + a, Y0 + b - 5); g.lineTo(X0 + a + 2, Y0 + b + 2); g.fill(); }
          else { g.fillStyle = warn ? '#ff8a5a' : '#4a4458'; g.fillRect(X0 + a - 1, Y0 + b - 1, 2, 2); }
        }
      }
    }
    draw() {}
  }

  /** 던전 등록 */
  function def(id, D) {
    DUN[id] = D;
    G.build.def(id, {
      build() { return build(id, D); },
      ents(m, Wd) {
        const s = S();
        const tier = D.tier || 0;
        for (const k of Object.keys(m.rooms)) {
          const { x0, y0, R } = m.rooms[k];
          m.rooms[k].blockSpecs = [];
          const ctl = Wd.add(new RoomCtl({ did: id, k, x0, y0, R, tier, floorName: m.rooms[k].floor, x: (x0 + m.RW / 2) * TS, y: (y0 + m.RH / 2) * TS }));
          m.rooms[k].ctl = ctl;
          for (const pr of R.props || []) addProp(m, Wd, id, k, x0, y0, pr);
        }
        // 문
        for (const dw of m.doorways) {
          if (dw.kind === 'open' || dw.stair) continue;
          const cells = dw.horiz ? dw.cells.filter(([x, y]) => true) : dw.cells.filter((c, i) => i >= 2 && i < 4);
          const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
          const bx = Math.min(...xs) * TS, by = Math.min(...ys) * TS, bw = (Math.max(...xs) - Math.min(...xs) + 1) * TS, bh = (Math.max(...ys) - Math.min(...ys) + 1) * TS;
          if (dw.kind === 'bomb' || dw.kind === 'wall') {
            // 금 간 벽: 폭탄으로 연다
            const key = id + ':crack:' + dw.a + '-' + dw.b;
            const open = () => { for (const [x, y] of dw.cells) m.setT(x, y, D.floor || T.FLOOR); };
            if (s.flags[key]) open();
            else if (dw.kind === 'bomb') { const c = new (P().Crack)({ x: bx + bw / 2, y: by + bh, flagKey: key, cells: dw.cells.map(([x, y]) => [x, y, D.floor || T.FLOOR]) }); c.done = false; Wd.add(c); }
            continue;
          }
          const ctls = [m.rooms[dw.a].ctl, m.rooms[dw.b].ctl];
          const g = new Gate({ did: id, kind2: dw.kind === 'switch' ? 'shut' : dw.kind, flag: dw.extra, key: id + ':door:' + dw.a + '-' + dw.b, cells, ctls, bx, by, bw2: bw, bh2: bh, x: bx + bw / 2, y: by + bh, sortBias: -8 });
          if (dw.kind === 'trap') g.ctls = ctls.filter(Boolean);
          Wd.add(g);
        }
        // 층 계단
        for (const sl of m.stairLinks || []) {
          const key = id + ':door:' + sl.a + '-' + sl.b;
          const A = new StairLink({ did: id, x: sl.pa[0] * TS + 16, y: sl.pa[1] * TS + 16, dir: 'down', kind2: sl.kind === 'switch' ? 'switch' : sl.kind, flag: sl.extra, key, floor: m.rooms[sl.b].floor || null });
          const B = new StairLink({ did: id, x: sl.pb[0] * TS + 16, y: sl.pb[1] * TS + 16, dir: 'up', kind2: 'open', key, floor: m.rooms[sl.a].floor || null });
          const ay = m.rooms[sl.a].gy, by2 = m.rooms[sl.b].gy;
          if (by2 < ay) { A.dir = 'up'; B.dir = 'down'; }
          A.link = B; B.link = A; A.room = sl.a; B.room = sl.b;
          Wd.add(A); Wd.add(B);
        }
        if (D.ents) D.ents(m, Wd);
      },
      onEnter(m) { if (D.onEnter) D.onEnter(m); },
    });
  }
  /** 소품: [종류, x, y, 옵션] */
  function addProp(m, Wd, did, k, x0, y0, pr) {
    const [kind, px, py, o0] = pr;
    const o = Object.assign({}, o0 || {});
    const x = (x0 + px) * TS + 8, y = (y0 + py) * TS + 12;
    const PR = P();
    const tag = (e) => { e.room = k; return Wd.add(e); };
    switch (kind) {
      case 'chest': {
        const flagKey = did + ':chest:' + k + ':' + px + ',' + py;
        const rk = o.mirror ? did + ':seen:' + k + ':' + px + ',' + py : null;
        const hid = o.mirror ? rk : o.hidden ? (o.hidden === true ? did + ':' + k + ':clear' : o.hidden) : null;
        return tag(new PR.Chest(Object.assign({ x, y, item: o.item, n: o.n, big: o.big, flagKey, hiddenUntil: hid, col: o.col, revealKey: rk }, {})));
      }
      case 'torch': { const t = tag(new PR.Torch({ x, y, flagKey: did + ':torch:' + k + ':' + px + ',' + py, burn: o.burn, alwaysLit: o.lit })); if (o.lit) t.lit = true; return t; }
      case 'plate': return tag(new PR.Plate({ x, y: y + 4, sets: o.sets || (did + ':plate:' + k + ':' + px + ',' + py), hold: o.hold !== false }));
      case 'block': { const spec = { x, y: y + 4, col: o.col }; const bl = tag(new PR.Block(spec)); spec.ent = bl; const rr = m.rooms[k]; (rr.blockSpecs = rr.blockSpecs || []).push(spec); return bl; }
      case 'pot': return tag(new PR.Pot({ x, y, v: o.v, drop: o.drop }));
      case 'crystal': return tag(new PR.Crystal({ x, y }));
      case 'cblock': return tag(new PR.ColorBlock({ x, y: y + 4, blue: o.blue !== false }));
      case 'post': return tag(new PR.Post({ x, y }));
      case 'eye': return tag(new Eye({ x, y, sets: o.sets || (did + ':eye:' + k), timer: o.timer }));
      case 'sign': return tag(new PR.Sign({ x, y, text: o.text, look: o.look || 'stone', anyDir: true }));
      case 'heart': return tag(new PR.HeartItem({ x, y, flagKey: did + ':heart', piece: o.piece }));
      case 'spot': return tag(new PR.Spot(Object.assign({ x, y }, o)));
      case 'npc': return tag(new PR.NPC(Object.assign({ x, y }, o)));
      case 'decor': { const d = new G.build.Decor({ decor: o.decor, v: o.v, x, y: y + 3, text: o.text, solid: o.solid !== false }); return tag(d); }
      case 'ped': return tag(new PR.Pedestal(Object.assign({ x, y }, o)));
      case 'veil': { const cells = (o.cells || [[px, py]]).map(([cx2, cy2]) => [x0 + cx2, y0 + cy2]); const v = new Veil({ x, y, cells, floor: G.dungeon.DUN[did].floor || T.FLOOR, flagKey: did + ':veil:' + k + ':' + px + ',' + py }); if (!v.done) for (const [cx2, cy2] of cells) m.setT(cx2, cy2, T.WALL); return tag(v); }
      case 'boss': { const b = G.bosses.spawn(o.type, x, y, Object.assign({ did, room: k }, o)); return b; }
      case 'fn': return o.fn(x, y, Wd, m);
      case 'seq': return tag(new SeqPlate({ x, y: y + 4, n: o.n, glyph: o.glyph }));
      case 'crumble': return tag(new Crumble({ x, y, tx: x0 + px, ty: y0 + py, w: o.w || 1, h: o.h || 1, floor: m.T(x0 + px, y0 + py) }));
      case 'spikes': return tag(new Spikes({ x, y, tx: x0 + px, ty: y0 + py, w: o.w || 1, h: o.h || 1, period: o.period, phase: o.phase, dmg: o.dmg || (3 + (DUN[did].tier || 0)) }));
      default: return null;
    }
  }

  G.dungeon = { HP_MUL: 1.25, def, DUN, RW: RW0, RH: RH0, SeqPlate, Crumble, Spikes, RoomCtl, Gate, Eye, build, StairLink, addProp, carveMaze };
})();
