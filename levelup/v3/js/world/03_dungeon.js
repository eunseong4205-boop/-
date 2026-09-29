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
  const RW = 20, RH = 14;            // 방 크기 (벽 포함)

  /* 던전 모양 (방마다 또는 던전 전체): rect(네모) · cave(굽은 자연 벽) · round(둥근 방) · open(벽 없이 허공 위의 섬) · hall(기둥이 늘어선 큰 방)
     D.pos: 방 이름 → 격자 자리 (이름은 이야기와 깃발에 쓰이니 그대로, 자리만 옮긴다)
     D.merge: [[방, 방], …] 둘 사이 벽을 허물어 큰 방으로
     이웃하지 않은 방 사이의 문은 계단이 된다: D.stairAt['가>나'] = [[x, y], [x, y]] (각 방 안 자리)
     D.floors: 방 → 층 이름 (지도 · 계단에서 보인다) · D.decor: 벽가에 흩을 사물 · D.ambient: 떠다니는 것 · D.sconce: 벽 횃불 색 */
  function roomPos(D, k) { const p = D.pos && D.pos[k]; return p || k.split(',').map(Number); }
  function build(id, D) {
    const keys = Object.keys(D.rooms);
    const P = {}; for (const k of keys) P[k] = roomPos(D, k);
    const gw = Math.max(...keys.map((k) => P[k][0])) + 1, gh = Math.max(...keys.map((k) => P[k][1])) + 1;
    const m = new G.GameMap({ id, name: D.name, w: gw * RW, h: gh * RH, region: TL.REGIONS.indexOf(D.pal || 'dungeon'), edge: T.VOID, music: D.music || 'cave' });
    m.palName = D.pal || 'dungeon';
    m.dungeon = id; m.dark = D.dark || 0; m.darkCol = D.darkCol; m.sub = D.sub || '';
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
      // 방 가운데 십자는 늘 트여 있게
      for (let x = 1; x < RW - 1; x++) for (const y of [(RH >> 1), (RH >> 1) + 1]) res[m.i(x0 + x, y0 + y)] = 1;
      for (let y = 2; y < RH - 1; y++) for (const x of [(RW >> 1) - 1, RW >> 1]) res[m.i(x0 + x, y0 + y)] = 1;
    }
    if (D.start) { const r = m.rooms[D.start[0]]; mark(r.x0 + D.start[1], r.y0 + D.start[2], 2); }
    if (D.exit) { const r = m.rooms[D.exit.at[0]]; mark(r.x0 + D.exit.at[1], r.y0 + D.exit.at[2], 2); }
    // 방 사이 문: 벽에 2칸 구멍 (이웃한 방) · 계단 (떨어진 방)
    m.doorways = []; m.stairLinks = [];
    const stairRes = new Uint8Array(m.w * m.h);
    for (const d of D.doors || []) {
      const [a, b, kind, extra] = d;
      if (!adj(a, b)) {
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
    inside(p) { return p.x > (this.x0 + 1) * TS && p.x < (this.x0 + RW - 1) * TS && p.y > (this.y0 + 2) * TS && p.y < (this.y0 + RH - 1) * TS + 4; }
    update(dt, Wd) {
      const p = Wd.player; if (!p) return;
      const s = S();
      const inside = this.inside(p);
      if (inside && !this.seen) { this.seen = true; s.flags['room:' + this.did + ':' + this.k] = true; }
      if (inside && this.floorName && Wd.map.curFloor !== this.floorName) { const first = Wd.map.curFloor == null; Wd.map.curFloor = this.floorName; if (!first) G.cine.area(this.floorName, Wd.map.name); }
      if (inside && !this.active) {
        this.active = true;
        const R = this.R;
        if (R.onEnter && !this.enteredOnce) { this.enteredOnce = true; R.onEnter(this, Wd); }
        if (!(R.solve && R.solve.type === 'clear' && s.flags[this.flagClear] && !R.respawn)) for (const f of R.foes || []) {
          const [type, fx, fy, fo] = f;
          if (fo && fo.once && s.flags[this.did + ':' + this.k + ':f' + fx + fy]) continue;
          const e = G.foes.spawn(type, (this.x0 + fx) * TS + 8, (this.y0 + fy) * TS + 12, Object.assign({ tier: this.tier }, fo || {}));
          e.room = this.k; e.home = { x: e.x, y: e.y }; e.aggro = true;
          G.fx.glow(e.x, e.y - 8, '#b8a8ff', 6);
          this.foes.push(e);
        }
        if (R.solve && R.solve.type === 'clear' && !s.flags[this.flagClear] && this.foes.length) { this.trap = true; sfx('door'); }
      }
      if (!inside && this.active && !this.trap) {
        // 방을 나가면 적은 사라진다 (다시 들어오면 새로)
        if (U.dist(p.x, p.y, (this.x0 + RW / 2) * TS, (this.y0 + RH / 2) * TS) > RW * TS) { for (const e of this.foes) if (!e.dead) e.dead = true; this.foes = []; this.active = false; }
      }
      // 퍼즐 · 청소
      const R = this.R;
      if (R.solve && !s.flags[this.flagClear]) {
        const sv = R.solve;
        let ok = false;
        if (sv.type === 'clear') ok = this.active && this.foes.length > 0 && this.foes.every((e) => e.dead);
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
    update(dt) { this.t += dt; const want = this.isOpen ? 1 : 0; if (want !== this.last) { if (this.last != null) { sfx(want ? 'door' : 'block'); G.fx.dust(this.bx + this.bw2 / 2, this.by + this.bh2, 4); } this.last = want; } this.anim = U.approach(this.anim, want, dt * 5); }
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
          const ctl = Wd.add(new RoomCtl({ did: id, k, x0, y0, R, tier, floorName: m.rooms[k].floor, x: (x0 + RW / 2) * TS, y: (y0 + RH / 2) * TS }));
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
      case 'block': return tag(new PR.Block({ x, y: y + 4, col: o.col }));
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
      default: return null;
    }
  }

  G.dungeon = { def, DUN, RW, RH, RoomCtl, Gate, Eye, build, StairLink };
})();
