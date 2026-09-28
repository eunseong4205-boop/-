/* 필드: 맵 로드, 이동, 충돌, NPC·몬스터·오브젝트, 카메라, 렌더링 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, T = G.tiles, SP = G.sprites, D = G.data, E = G.engine;
  const TS = T.TS;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const STEP = 0.15;

  const F = {
    map: null, id: null, W: 0, H: 0, grid: null, block: null, layer: null,
    npcs: [], mons: [], objs: [], builds: [], towers: [],
    player: { x: 0, y: 0, px: 0, py: 0, dir: 'down', moving: false, mt: 0, fx: 0, fy: 0, frame: 0, walkT: 0 },
    follower: null, trail: [],
    cam: { x: 0, y: 0 }, t: 0, busy: false, fx: [], particles: [], held: null, emotes: [], gateCool: false, lights: [], aura: 0, glow: 0,
    onStep: null, onInteract: null, onEncounter: null,
  };

  /* ───────── 맵 로드 ───────── */
  function charAt(x, y) { if (x < 0 || y < 0 || x >= F.W || y >= F.H) return '#'; return F.grid[y][x] || '.'; }
  function isWater(ch) { return ch === '~' || ch === 'L' || ch === 'v'; }
  function isGrassy(ch) { return ch === '.' || ch === ',' || ch === '"' || ch === 'x'; }

  function buildLayer() {
    const c = document.createElement('canvas');
    c.width = F.W * TS; c.height = F.H * TS;
    const g = c.getContext('2d');
    const theme = F.map.theme;
    for (let y = 0; y < F.H; y++) for (let x = 0; x < F.W; x++) {
      const ch = charAt(x, y);
      let nb = 0;
      const nbs = [charAt(x, y - 1), charAt(x + 1, y), charAt(x, y + 1), charAt(x - 1, y)];
      if (isWater(ch)) nbs.forEach((n, i) => { if (!isWater(n) && n !== '#' && n !== '_' && n !== 'I') nb |= 1 << i; });
      else if (ch === ':' || ch === 's' || ch === '=') nbs.forEach((n, i) => { if (isGrassy(n)) nb |= 1 << i; });
      g.drawImage(T.tile(theme, ch, x, y, nb, 0), x * TS, y * TS);
    }
    for (const b of F.builds) if (b.style !== 'tower' && b.style !== 'lighthouse') T.drawBuilding(g, b, theme, 0, 0, 0);
    F.layer = c;
  }

  function computeBlock() {
    F.block = [];
    for (let y = 0; y < F.H; y++) { F.block.push([]); for (let x = 0; x < F.W; x++) F.block[y].push(!T.walkable(charAt(x, y))); }
    for (const b of F.builds) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (y >= 0 && y < F.H && x >= 0 && x < F.W) F.block[y][x] = true;
  }

  function spriteFor(look, s) {
    if (!look) return SP.person({});
    if (typeof look === 'string') {
      if (look === '@') return heroSprite(s);
      const ch = G.chars[look];
      if (ch && ch.look) return spriteFor(ch.look, s);
      return SP.creature(look);
    }
    if (look.creature) return SP.creature(look.creature, look.tint);
    return SP.person(look);
  }
  function heroSprite(s) {
    return SP.person(s.gender === 'girl'
      ? { hair: 'long', hc: '#6a3e22', top: '#3aa84a', bottom: '#e8e0c8', shoe: '#6a4a2a', acc: '#2f8a3a' }
      : { hair: 'spiky', hc: '#5a3a22', top: '#3aa84a', bottom: '#6a5a44', shoe: '#4a3222', acc: '#2f8a3a' });
  }

  function load(id, x, y, dir) {
    const s = G.state;
    const m = G.maps[id];
    if (!m) throw new Error('no map ' + id);
    F.map = m; F.id = id;
    F.grid = m.grid;
    F.H = m.grid.length; F.W = Math.max(...m.grid.map((r) => r.length));
    F.grid = m.grid.map((r) => r.padEnd(F.W, '#'));
    if (m.patch) {
      const rows = F.grid.map((r) => r.split(''));
      for (const [px, py, ch] of m.patch(s) || []) if (rows[py] && rows[py][px] !== undefined) rows[py][px] = ch;
      F.grid = rows.map((r) => r.join(''));
    }
    F.builds = (m.builds || []).filter((b) => !b.when || b.when(s)).map((b) => Object.assign({}, b));
    computeBlock();
    buildLayer();
    F.lights = [];
    if (m.dark) {
      for (let y = 0; y < F.H; y++) for (let x = 0; x < F.W; x++) {
        const ch = F.grid[y][x];
        if (ch === 'l') F.lights.push({ x, y, r: 46, c: '#ffd86a', dy: 3 });
        else if (ch === 'L') F.lights.push({ x, y, r: 30, c: '#ff8a3a', dy: 8 });
        else if (ch === '@' || ch === 'K') F.lights.push({ x, y, r: 26, c: ch === 'K' ? '#fff0a8' : '#8cc8f8', dy: 8 });
      }
      for (const b of F.builds) if (b.night || b.style === 'tower') F.lights.push({ x: b.x + Math.floor(b.w / 2), y: b.y + b.h - 1, r: 40, c: b.style === 'tower' ? '#b89aff' : '#ffd86a', dy: 0 });
      for (const L of m.lights || []) F.lights.push(Object.assign({ r: 40, dy: 8 }, L));
    }
    // NPC
    F.npcs = (m.npcs || []).map((n) => Object.assign({ dir: 'down', px: n.x * TS, py: n.y * TS, mt: 0, moving: false, hidden: false, frame: 0, wt: Math.random() * 3 }, n))
      .map((n) => { n.hx = n.x; n.hy = n.y; n.sprite = spriteFor(n.look || n.id, s); return n; });
    // 오브젝트
    F.objs = (m.objs || []).map((o) => Object.assign({}, o));
    // 몬스터
    F.mons = [];
    if (m.mons) for (let i = 0; i < m.mons.n; i++) spawnMon();
    for (const f of m.fixed || []) {
      if (f.cond && !f.cond(s)) continue;
      if (f.flag && s.flags[f.flag]) continue;
      F.mons.push(makeMon(f.mon, f.x, f.y, f));
    }
    // 플레이어
    const p = F.player;
    p.x = x; p.y = y; p.px = x * TS; p.py = y * TS; p.dir = dir || p.dir; p.moving = false;
    s.map = id; s.x = x; s.y = y; s.dir = p.dir;
    F.trail = [];
    if (s.follower) F.follower = { id: s.follower, x, y, px: x * TS, py: y * TS, dir: p.dir, sprite: spriteFor(s.follower, s), moving: false };
    else F.follower = null;
    F.particles = [];
    snapCam();
  }
  function refreshNpcs() {
    const s = G.state;
    for (const n of F.npcs) n.sprite = spriteFor(n.look || n.id, s);
    if (F.follower) F.follower.sprite = spriteFor(F.follower.id, s);
  }
  function setFollower(id) {
    const s = G.state;
    s.follower = id;
    if (!id) { F.follower = null; return; }
    const p = F.player;
    F.follower = { id, x: p.x, y: p.y, px: p.px, py: p.py, dir: p.dir, sprite: spriteFor(id, s), moving: false };
  }

  /* ───────── 몬스터 ───────── */
  function makeMon(monId, x, y, extra) {
    const md = D.MON[monId];
    const look = { blob: 'slime', beast: 'beast', bird: 'bird', bug: 'beast', plant: 'slime', ghost: 'ghost', golem: 'beast', humanoid: 'ghost', fish: 'slime', dragon: 'beast', machine: 'drone', eye: 'ghost', wisp: 'ghost' }[md.arch] || 'slime';
    return Object.assign({ mon: monId, x, y, px: x * TS, py: y * TS, dir: 'left', moving: false, mt: 0, wt: 1 + Math.random() * 2, frame: 0,
      sprite: extra && extra.look ? spriteFor(extra.look, G.state) : SP.creature(look, md.c[0]) }, extra || {});
  }
  function freeTile(x, y) {
    if (x < 0 || y < 0 || x >= F.W || y >= F.H) return false;
    if (F.block[y][x]) return false;
    const p = F.player;
    if (p.x === x && p.y === y) return false;
    if (F.npcs.some((n) => !n.hidden && n.x === x && n.y === y)) return false;
    if (F.mons.some((m) => m.x === x && m.y === y)) return false;
    return true;
  }
  function spawnMon() {
    const m = F.map.mons;
    const area = m.area || [0, 0, F.W, F.H];
    const p = F.player;
    for (let k = 0; k < 60; k++) {
      const x = area[0] + Math.floor(Math.random() * area[2]), y = area[1] + Math.floor(Math.random() * area[3]);
      if (!freeTile(x, y)) continue;
      const ch = charAt(x, y);
      if (m.on && m.on.indexOf(ch) < 0) continue;
      if (Math.abs(x - p.x) + Math.abs(y - p.y) < 5) continue;
      F.mons.push(makeMon(U.pick(m.list), x, y, { wild: true }));
      return;
    }
  }
  function removeMon(mo) { F.mons = F.mons.filter((m) => m !== mo); if (mo.wild) setTimeout(() => { if (F.map && F.map.mons && F.mons.filter((m) => m.wild).length < F.map.mons.n) spawnMon(); }, 12000 + Math.random() * 12000); }

  /* ───────── 이동 ───────── */
  function objOn(o) { return !o.gone && (!o.cond || o.cond(G.state)); }
  function objAt(x, y) { return F.objs.find((o) => o.x === x && o.y === y && objOn(o)); }
  function gateOpen(o) { return o.t === 'gate' && (o.open ? o.open(G.state) : E.meets(G.state, o.req)); }
  function objSolid(o) { if (o.t === 'gate') return !gateOpen(o); if (o.solid !== undefined) return o.solid; return o.t === 'chest' || o.t === 'sign' || o.t === 'book' || o.t === 'statue' || o.t === 'prop' || (o.t === 'pickup' && !G.state.chests[o.id]); }
  function buildingAt(x, y) { return F.builds.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); }
  function npcAt(x, y) { return F.npcs.find((n) => !n.hidden && n.x === x && n.y === y && (!n.cond || n.cond(G.state))); }
  function monAt(x, y) { return F.mons.find((m) => m.x === x && m.y === y); }

  function tryMove(dir) {
    const p = F.player;
    if (p.moving || F.busy) return;
    p.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = p.x + dx, ny = p.y + dy;
    const mo = monAt(nx, ny);
    if (mo) { if (F.onEncounter) F.onEncounter(mo); return; }
    const b = buildingAt(nx, ny);
    if (b) {
      const isDoor = b.door !== undefined && nx === b.x + b.door && ny === b.y + b.h - 1 && dir === 'up';
      if (isDoor && F.onInteract) F.onInteract({ type: 'door', b });
      return;
    }
    if (nx < 0 || ny < 0 || nx >= F.W || ny >= F.H) { const w = edgeWarp(nx, ny); if (w && F.onStep) F.onStep({ warp: w }); return; }
    if (F.block[ny][nx]) return;
    const n = npcAt(nx, ny);
    if (n) return;
    const o = objAt(nx, ny);
    if (o && objSolid(o)) { if (o.t === 'gate' && F.onInteract && !F.gateCool) { F.gateCool = true; setTimeout(() => { F.gateCool = false; }, 600); F.onInteract({ type: 'obj', obj: o }); } return; }
    // 이동 시작
    F.trail.unshift({ x: p.x, y: p.y, dir: p.dir });
    if (F.trail.length > 4) F.trail.length = 4;
    p.fx = p.x; p.fy = p.y;
    p.x = nx; p.y = ny; p.moving = true; p.mt = 0;
    if (F.follower) {
      const f = F.follower, tr = F.trail[0];
      if (tr && (tr.x !== f.x || tr.y !== f.y)) { f.fx = f.x; f.fy = f.y; f.x = tr.x; f.y = tr.y; f.moving = true; f.mt = 0; f.dir = dirTo(f.fx, f.fy, f.x, f.y) || f.dir; }
    }
  }
  function dirTo(ax, ay, bx, by) { if (bx > ax) return 'right'; if (bx < ax) return 'left'; if (by > ay) return 'down'; if (by < ay) return 'up'; return null; }
  function edgeWarp(x, y) {
    const e = F.map.edges || {};
    if (y < 0 && e.up) return edgeTarget(e.up, x, y);
    if (y >= F.H && e.down) return edgeTarget(e.down, x, y);
    if (x < 0 && e.left) return edgeTarget(e.left, x, y);
    if (x >= F.W && e.right) return edgeTarget(e.right, x, y);
    return null;
  }
  function edgeTarget(e, x, y) {
    const t = G.maps[e.to];
    if (!t) return { to: e.to, x: 0, y: 0, dir: 'down', req: e.req, msg: e.msg, cond: e.cond, edge: true };
    const tw = Math.max(...t.grid.map((r) => r.length)), th = t.grid.length;
    const base = { to: e.to, req: e.req, msg: e.msg, cond: e.cond, edge: true };
    if (e.tx != null && e.ty != null) return Object.assign(base, { x: e.tx, y: e.ty, dir: y < 0 ? 'up' : y >= F.H ? 'down' : x < 0 ? 'left' : 'right' });
    if (y < 0) return Object.assign(base, { x: U.clamp(x + (e.dx || 0), 0, tw - 1), y: th - 1, dir: 'up' });
    if (y >= F.H) return Object.assign(base, { x: U.clamp(x + (e.dx || 0), 0, tw - 1), y: 0, dir: 'down' });
    if (x < 0) return Object.assign(base, { x: tw - 1, y: U.clamp(y + (e.dy || 0), 0, th - 1), dir: 'left' });
    return Object.assign(base, { x: 0, y: U.clamp(y + (e.dy || 0), 0, th - 1), dir: 'right' });
  }
  function arrived() {
    const p = F.player, s = G.state;
    s.x = p.x; s.y = p.y; s.dir = p.dir;
    s.tot.steps++;
    const w = (F.map.warps || []).find((w) => w.x === p.x && w.y === p.y);
    if (F.onStep) F.onStep({ warp: w || null, x: p.x, y: p.y });
  }
  function facing() { const p = F.player; const [dx, dy] = DIRS[p.dir]; return { x: p.x + dx, y: p.y + dy }; }
  function interact() {
    if (F.busy || F.player.moving) return;
    const f = facing();
    const n = npcAt(f.x, f.y);
    if (n) { n.dir = opposite(F.player.dir); return F.onInteract && F.onInteract({ type: 'npc', npc: n }); }
    const mo = monAt(f.x, f.y);
    if (mo) return F.onEncounter && F.onEncounter(mo);
    const o = objAt(f.x, f.y) || objAt(F.player.x, F.player.y);
    if (o && o.t !== 'spot') return F.onInteract && F.onInteract({ type: 'obj', obj: o });
    const b = buildingAt(f.x, f.y);
    if (b && b.door !== undefined && f.x === b.x + b.door && f.y === b.y + b.h - 1) return F.onInteract && F.onInteract({ type: 'door', b });
    if (b && b.style === 'tower') return F.onInteract && F.onInteract({ type: 'tower', b });
    if (b && b.talk) return F.onInteract && F.onInteract({ type: 'door', b });
    return F.onInteract && F.onInteract({ type: 'none', x: f.x, y: f.y, ch: charAt(f.x, f.y) });
  }
  function opposite(d) { return { up: 'down', down: 'up', left: 'right', right: 'left' }[d]; }
  function spotHere() { const p = F.player; return F.objs.find((o) => o.t === 'spot' && o.x === p.x && o.y === p.y); }

  /* ───────── 갱신 ───────── */
  function update(dt) {
    F.t += dt;
    const p = F.player;
    if (p.moving) {
      p.mt += dt;
      const f = Math.min(1, p.mt / STEP);
      p.px = U.lerp(p.fx, p.x, f) * TS; p.py = U.lerp(p.fy, p.y, f) * TS;
      p.walkT += dt;
      if (f >= 1) {
        p.moving = false; p.px = p.x * TS; p.py = p.y * TS;
        if (p.scripted) { p.scripted = false; const s = G.state; s.x = p.x; s.y = p.y; s.dir = p.dir; } else arrived();
      }
    } else if (F.held && !F.busy) tryMove(F.held);
    for (let i = F.emotes.length - 1; i >= 0; i--) { F.emotes[i].life -= dt; if (F.emotes[i].life <= 0) F.emotes.splice(i, 1); }
    if (p.jump) { p.jump += dt * 3; if (p.jump >= 1) p.jump = 0; }
    if (F.aura > 0) F.aura = Math.max(0, F.aura - dt * 1.6);
    const fo = F.follower;
    if (fo && fo.moving) {
      fo.mt += dt;
      const f = Math.min(1, fo.mt / STEP);
      fo.px = U.lerp(fo.fx, fo.x, f) * TS; fo.py = U.lerp(fo.fy, fo.y, f) * TS;
      if (f >= 1) { fo.moving = false; fo.px = fo.x * TS; fo.py = fo.y * TS; }
    }
    // NPC 산책
    for (const n of F.npcs) {
      if (n.hidden) continue;
      if (n.jump) { n.jump += dt * 3; if (n.jump >= 1) n.jump = 0; }
      if (n.moving) {
        n.mt += dt; const f = Math.min(1, n.mt / (STEP * (n.path && n.path.length || n.speed ? 1.3 / (n.speed || 1) : 1.8)));
        n.px = U.lerp(n.fx, n.x, f) * TS; n.py = U.lerp(n.fy, n.y, f) * TS;
        if (f >= 1) { n.moving = false; n.px = n.x * TS; n.py = n.y * TS; if (n.onArrive) { const cb = n.onArrive; n.onArrive = null; cb(); } }
        continue;
      }
      if (n.path && n.path.length) { const [tx, ty] = n.path.shift(); stepNpc(n, tx, ty, true); continue; }
      if (n.wander && !F.busy) {
        n.wt -= dt;
        if (n.wt <= 0) {
          n.wt = 1.5 + Math.random() * 3;
          const d = U.pick(['up', 'down', 'left', 'right']);
          const [dx, dy] = DIRS[d];
          const tx = n.x + dx, ty = n.y + dy;
          if (Math.abs(tx - n.hx) <= (n.wander | 0 || 2) && Math.abs(ty - n.hy) <= (n.wander | 0 || 2) && freeTile(tx, ty) && !objAt(tx, ty)) stepNpc(n, tx, ty);
          else n.dir = d;
        }
      }
    }
    // 몬스터 배회
    for (const m of F.mons) {
      if (m.moving) {
        m.mt += dt; const f = Math.min(1, m.mt / (STEP * 2.2));
        m.px = U.lerp(m.fx, m.x, f) * TS; m.py = U.lerp(m.fy, m.y, f) * TS;
        if (f >= 1) { m.moving = false; m.px = m.x * TS; m.py = m.y * TS; }
        continue;
      }
      if (!m.wild || F.busy) continue;
      m.wt -= dt;
      if (m.wt <= 0) {
        m.wt = 0.8 + Math.random() * 2.2;
        const d = U.pick(['up', 'down', 'left', 'right']);
        const [dx, dy] = DIRS[d];
        const tx = m.x + dx, ty = m.y + dy;
        const area = F.map.mons.area || [0, 0, F.W, F.H];
        if (tx === p.x && ty === p.y && !p.moving && !F.busy) { if (F.onEncounter) F.onEncounter(m); continue; }
        if (tx >= area[0] && ty >= area[1] && tx < area[0] + area[2] && ty < area[1] + area[3] && freeTile(tx, ty) && !objAt(tx, ty) && (!F.map.mons.on || F.map.mons.on.indexOf(charAt(tx, ty)) >= 0)) {
          m.fx = m.x; m.fy = m.y; m.x = tx; m.y = ty; m.moving = true; m.mt = 0; if (dx) m.dir = dx < 0 ? 'left' : 'right';
        }
      }
    }
    updateParticles(dt);
    updateCam(dt);
  }
  function stepNpc(n, tx, ty, force) {
    if (!force && !freeTile(tx, ty)) return false;
    n.fx = n.x; n.fy = n.y; n.dir = dirTo(n.x, n.y, tx, ty) || n.dir; n.x = tx; n.y = ty; n.moving = true; n.mt = 0;
    return true;
  }
  function walkNpc(n, path) { return new Promise((res) => { n.path = path.slice(); const chk = () => { if (!n.moving && (!n.path || !n.path.length)) res(); else setTimeout(chk, 50); }; chk(); }); }
  /** 연출용: 충돌 무시하고 주인공을 한 칸 옮긴다 */
  function forceMove(tx, ty) {
    const p = F.player;
    F.trail.unshift({ x: p.x, y: p.y, dir: p.dir }); if (F.trail.length > 4) F.trail.length = 4;
    p.fx = p.x; p.fy = p.y; p.x = tx; p.y = ty; p.moving = true; p.mt = 0; p.scripted = true;
    const f = F.follower, tr = F.trail[0];
    if (f && tr && (tr.x !== f.x || tr.y !== f.y)) { f.fx = f.x; f.fy = f.y; f.x = tr.x; f.y = tr.y; f.moving = true; f.mt = 0; f.dir = dirTo(f.fx, f.fy, f.x, f.y) || f.dir; }
  }
  function stepFollower(tx, ty) { const f = F.follower; if (!f) return; f.fx = f.x; f.fy = f.y; f.dir = dirTo(f.x, f.y, tx, ty) || f.dir; f.x = tx; f.y = ty; f.moving = true; f.mt = 0; }
  function addNpc(def) {
    removeNpc(def.id);
    const n = Object.assign({ dir: 'down', mt: 0, moving: false, hidden: false, frame: 0, wt: 9 }, def);
    n.px = n.x * TS; n.py = n.y * TS; n.hx = n.x; n.hy = n.y; n.temp = true;
    n.sprite = spriteFor(n.look || n.id, G.state);
    F.npcs.push(n);
    return n;
  }
  function removeNpc(id) { F.npcs = F.npcs.filter((n) => n.id !== id); }
  /* 머리 위 말풍선 */
  const EMO = {
    '!': ['00100', '00100', '00100', '00100', '00000', '00100'], '?': ['01110', '10001', '00010', '00100', '00000', '00100'],
    '♥': ['01010', '11111', '11111', '01110', '00100', '00000'], '…': ['00000', '00000', '00000', '00000', '00000', '10101'],
    '♪': ['00110', '00101', '00100', '01100', '11100', '01000'], '💢': ['01010', '11011', '00000', '11011', '01010', '00000'],
    '💧': ['00100', '01110', '11111', '11111', '01110', '00000'], '★': ['00100', '01110', '11111', '01110', '01010', '00000'],
    'z': ['11110', '00010', '00100', '01000', '11110', '00000'],
  };
  const EMO_C = { '!': '#e8402a', '?': '#3a6ad8', '♥': '#ff4a7a', '…': '#3a3450', '♪': '#3a9a4a', '💢': '#e8402a', '💧': '#4a9ae8', '★': '#e8a820', z: '#6a6aa8' };
  function emote(ent, sym, dur) { F.emotes = F.emotes.filter((e) => e.ent !== ent); F.emotes.push({ ent, sym, life: dur || 1.4 }); }
  function drawEmote(g, x, y, sym) {
    const bm = EMO[sym] || EMO['!'];
    g.fillStyle = '#16101f'; g.fillRect(x + 3, y - 14, 11, 10); g.fillRect(x + 7, y - 4, 3, 2);
    g.fillStyle = '#ffffff'; g.fillRect(x + 4, y - 13, 9, 8); g.fillRect(x + 8, y - 5, 1, 1);
    g.fillStyle = EMO_C[sym] || '#16101f';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) if (bm[r][c] === '1') g.fillRect(x + 6 + c, y - 12 + r, 1, 1);
  }

  /* ───────── 카메라 ───────── */
  let VW = 240, VH = 176;
  function setView(w, h) { VW = w; VH = h; snapCam(); }
  function camTarget() {
    const p = F.player;
    let cx = p.px + TS / 2 - VW / 2, cy = p.py + TS / 2 - VH / 2;
    const mw = F.W * TS, mh = F.H * TS;
    cx = mw <= VW ? (mw - VW) / 2 : U.clamp(cx, 0, mw - VW);
    cy = mh <= VH ? (mh - VH) / 2 : U.clamp(cy, 0, mh - VH);
    return { x: cx, y: cy };
  }
  function snapCam() { if (!F.map) return; const c = camTarget(); F.cam.x = c.x; F.cam.y = c.y; }
  function updateCam() { const c = camTarget(); F.cam.x = c.x; F.cam.y = c.y; }

  /* ───────── 파티클 · 날씨 ───────── */
  function addFloat(x, y, text, color, size) { F.fx.push({ x, y, text, color, size: size || 8, life: 1.1, max: 1.1 }); if (F.fx.length > 24) F.fx.shift(); }
  function burst(x, y, cols, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 20 + Math.random() * 60; F.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, c: U.pick(cols), life: 0.5 + Math.random() * 0.5, g: 90 }); } }
  function updateParticles(dt) {
    for (let i = F.particles.length - 1; i >= 0; i--) {
      const q = F.particles[i];
      q.life -= dt; if (q.life <= 0) { F.particles.splice(i, 1); continue; }
      q.vy += (q.g || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt;
    }
    for (let i = F.fx.length - 1; i >= 0; i--) { const f = F.fx[i]; f.life -= dt; f.y -= 14 * dt; if (f.life <= 0) F.fx.splice(i, 1); }
    // 날씨 입자
    const w = F.map && F.map.weather;
    if (w && F.particles.length < 70) {
      const cx = F.cam.x, cy = F.cam.y;
      const rate = { snow: 0.6, ash: 0.5, sand: 0.8, leaf: 0.25, firefly: 0.2, star: 0.15, petal: 0.3, rain: 1.2, bubble: 0.3, spark: 0.35 }[w] || 0.3;
      if (Math.random() < rate) {
        const q = { x: cx + Math.random() * (VW + 40) - 20, y: cy - 6, vx: 0, vy: 20, c: '#ffffff', life: 8, weather: w };
        if (w === 'snow') { q.vx = -6 + Math.random() * 12; q.vy = 12 + Math.random() * 10; q.c = '#ffffff'; }
        if (w === 'ash') { q.vx = 8 + Math.random() * 8; q.vy = 8 + Math.random() * 6; q.c = U.pick(['#9a9a9a', '#cfcfcf', '#6a6a6a']); }
        if (w === 'sand') { q.x = cx - 6; q.y = cy + Math.random() * VH; q.vx = 60 + Math.random() * 40; q.vy = 4; q.c = U.pick(['#f0d890', '#e8c060']); }
        if (w === 'leaf') { q.vx = -10 + Math.random() * 20; q.vy = 14 + Math.random() * 8; q.c = U.pick(['#e8502a', '#f0a03a', '#c8302a']); }
        if (w === 'firefly' || w === 'star' || w === 'spark') { q.y = cy + Math.random() * VH; q.vx = -4 + Math.random() * 8; q.vy = -4 + Math.random() * 8; q.c = w === 'firefly' ? '#e8ff8a' : w === 'spark' ? U.pick(['#ff5a8a', '#ffd84a', '#5ae8ff']) : '#ffffff'; q.life = 3; q.blink = true; }
        if (w === 'petal') { q.vx = -8 + Math.random() * 16; q.vy = 10 + Math.random() * 8; q.c = U.pick(['#ffb8d8', '#ffe066', '#b8e8ff', '#c8ffb8']); }
        if (w === 'rain') { q.vx = -20; q.vy = 160; q.c = '#9ac8f0'; q.life = 2; q.len = 4; }
        if (w === 'bubble') { q.y = cy + VH + 4; q.vy = -14; q.vx = Math.random() * 6 - 3; q.c = '#bfe8ff'; }
        F.particles.push(q);
      }
    }
  }

  /* ───────── 렌더링 ───────── */
  function drawSprite(g, frames, x, y, frame) { const img = frames[Math.min(frame, frames.length - 1)]; g.drawImage(img, Math.round(x) - 1, Math.round(y) - 1 - (img.height - 18)); }
  function render(g, W, H) {
    const s = G.state;
    g.fillStyle = F.map.bg || '#0b0818';
    g.fillRect(0, 0, W, H);
    const cx = Math.round(F.cam.x), cy = Math.round(F.cam.y);
    g.drawImage(F.layer, -cx, -cy);
    // 애니메이션 타일 (물결)
    const fr = Math.floor(F.t * 2) % 4;
    const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS));
    const x1 = Math.min(F.W - 1, Math.ceil((cx + W) / TS)), y1 = Math.min(F.H - 1, Math.ceil((cy + H) / TS));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ch = F.grid[y][x];
      if (ch === '~' || ch === 'L' || ch === 'v') {
        let nb = 0;
        [charAt(x, y - 1), charAt(x + 1, y), charAt(x, y + 1), charAt(x - 1, y)].forEach((n, i) => { if (!isWater(n) && n !== '#' && n !== '_' && n !== 'I') nb |= 1 << i; });
        g.drawImage(T.tile(F.map.theme, ch, x, y, nb, (fr + x + y) % 4), x * TS - cx, y * TS - cy);
      }
    }
    // 징수탑
    for (const b of F.builds) if (b.style === 'tower' || b.style === 'lighthouse') T.drawBuilding(g, typeof b.lit === 'function' ? Object.assign({}, b, { lit: b.lit(s) }) : b, F.map.theme, -cx, -cy, F.t);
    // 바닥 오브젝트
    for (const o of F.objs) {
      if (!objOn(o)) continue;
      const ox = o.x * TS - cx, oy = o.y * TS - cy;
      if (ox < -TS || oy < -TS || ox > W || oy > H) continue;
      if (o.t === 'spot' && (!o.hidden || s.spots[F.id + ':' + o.x + ':' + o.y])) {
        const pulse = 0.5 + 0.5 * Math.sin(F.t * 4);
        g.globalAlpha = 0.45 + pulse * 0.4;
        g.drawImage(SP.creature('spot').left[0], ox - 1, oy - 1);
        g.globalAlpha = 1;
        if (Math.random() < 0.05) F.particles.push({ x: o.x * TS + 4 + Math.random() * 8, y: o.y * TS + 12, vx: 0, vy: -18, c: '#ffe066', life: 0.8 });
      }
    }
    // 엔티티 (y 정렬)
    const ents = [];
    for (const o of F.objs) {
      if (!objOn(o) || o.invisible) continue;
      const ox = o.x * TS - cx, oy = o.y * TS - cy;
      if (ox < -TS * 2 || oy < -TS * 2 || ox > W + TS || oy > H + TS) continue;
      if (o.t === 'chest') ents.push({ y: o.y * TS, draw: () => g.drawImage(SP.creature(s.chests[o.id] ? 'chestOpen' : 'chest').left[0], ox - 1, oy - 1) });
      if (o.t === 'sign') ents.push({ y: o.y * TS, draw: () => g.drawImage(SP.creature('sign').left[0], ox - 1, oy - 1) });
      if (o.t === 'orbshine' && !s.orbs[o.orb]) ents.push({ y: o.y * TS, draw: () => { const k = Math.floor(F.t * 3) % 3; g.fillStyle = '#ffffff'; if (k) g.fillRect(ox + 7, oy + 6, 2, 2); if (k === 2) { g.fillRect(ox + 5, oy + 7, 1, 1); g.fillRect(ox + 10, oy + 7, 1, 1); g.fillRect(ox + 8, oy + 4, 1, 1); g.fillRect(ox + 8, oy + 9, 1, 1); } } });
      if (o.t === 'book' && !s.books[o.id]) ents.push({ y: o.y * TS + 1, draw: () => { if (Math.floor(F.t * 2 + o.x) % 3 === 0) { g.fillStyle = '#ffe066'; g.fillRect(ox + 12, oy + 2, 1, 3); g.fillRect(ox + 11, oy + 3, 3, 1); } } });
      if (o.t === 'gate' && !gateOpen(o)) ents.push({ y: o.y * TS, draw: () => drawGate(g, ox, oy, o) });
      if (o.t === 'pickup' && !s.chests[o.id]) ents.push({ y: o.y * TS - 1, draw: () => {
        const c = o.c || '#ff5a4a';
        g.fillStyle = '#2a6a2a'; g.fillRect(ox + 7, oy + 8, 2, 6); g.fillRect(ox + 5, oy + 10, 2, 1); g.fillRect(ox + 9, oy + 11, 2, 1);
        g.fillStyle = c; g.fillRect(ox + 6, oy + 5, 4, 3); g.fillRect(ox + 7, oy + 4, 2, 5);
        if (Math.floor(F.t * 3 + o.x) % 3 === 0) { g.fillStyle = '#ffffff'; g.fillRect(ox + 11, oy + 3, 1, 1); g.fillRect(ox + 3, oy + 6, 1, 1); }
      } });
    }
    for (const n of F.npcs) {
      if (n.hidden || (n.cond && !n.cond(s))) continue;
      const fi = n.moving ? 1 + (Math.floor(F.t * 8) % 2) : 0;
      ents.push({ y: n.py, draw: () => { const jy = n.jump ? Math.round(Math.sin(n.jump * Math.PI) * 6) : 0; const fr = n.sprite[n.dir] || n.sprite.down || n.sprite.left; drawSprite(g, fr, n.px - cx, n.py - cy - jy, n.creature || !n.sprite.up || n.sprite.up === n.sprite.right ? Math.floor(F.t * 2 + n.x) % fr.length : fi); if (n.mark && n.mark(s) && !F.busy) drawMark(g, n.px - cx, n.py - cy - jy, n.mark(s)); } });
    }
    for (const m of F.mons) {
      const fi = Math.floor(F.t * 3 + m.x) % 2;
      ents.push({ y: m.py, draw: () => { drawSprite(g, m.sprite[m.dir] || m.sprite.left, m.px - cx, m.py - cy, fi); if (m.boss) drawMark(g, m.px - cx, m.py - cy, '!'); } });
    }
    const p = F.player;
    const pf = p.moving ? 1 + (Math.floor(p.walkT * 7) % 2) : 0;
    const hs = heroSprite(s);
    if (!F.hideHero) ents.push({ y: p.py + 0.1, draw: () => { const jy = p.jump ? Math.round(Math.sin(p.jump * Math.PI) * 6) : 0; if (F.aura > 0) { g.globalAlpha = Math.min(1, F.aura) * 0.5; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(p.px - cx + 8, p.py - cy + 8, 10 + (1 - Math.min(1, F.aura)) * 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } drawSprite(g, hs[p.dir], p.px - cx, p.py - cy - jy, pf); } });
    const fo = F.follower;
    if (fo && !F.hideHero) ents.push({ y: fo.py, draw: () => { const ff = fo.moving ? Math.floor(F.t * 8) % 2 : Math.floor(F.t * 2) % 2; const dir = fo.dir === 'right' || fo.dir === 'up' ? 'right' : 'left'; drawSprite(g, fo.sprite[dir] || fo.sprite.left, fo.px - cx, fo.py - cy - (fo.id === 'dotori' ? 0 : 0), ff); } });
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) e.draw();
    for (const em of F.emotes) { const e = em.ent; if (!e || e.hidden) continue; const jy = e.jump ? Math.round(Math.sin(e.jump * Math.PI) * 6) : 0; drawEmote(g, Math.round(e.px - cx), Math.round(e.py - cy) - jy + (em.life > 1.2 ? 2 : 0), em.sym); }
    // 파티클
    for (const q of F.particles) {
      const x = q.x - cx, y = q.y - cy;
      if (q.blink && Math.floor((q.life + x) * 4) % 2) continue;
      g.fillStyle = q.c;
      if (q.len) g.fillRect(x, y, 1, q.len);
      else g.fillRect(Math.round(x), Math.round(y), q.weather === 'snow' || q.weather === 'petal' ? 2 : 1, q.weather === 'snow' || q.weather === 'petal' ? 2 : 1);
    }
    // 어둠
    if (F.map.dark) {
      const m = F.darkCv || (F.darkCv = document.createElement('canvas'));
      if (m.width !== W || m.height !== H) { m.width = W; m.height = H; }
      const dg = m.getContext('2d');
      dg.globalCompositeOperation = 'source-over';
      dg.clearRect(0, 0, W, H);
      dg.fillStyle = F.map.darkColor || 'rgba(5,3,14,0.9)'; dg.fillRect(0, 0, W, H);
      dg.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r) => { const gr = dg.createRadialGradient(x, y, r * 0.15, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gr; dg.fillRect(x - r, y - r, r * 2, r * 2); };
      hole(p.px - cx + 8, p.py - cy + 8, F.map.dark + (F.glow || 0));
      for (const L of F.lights) { const lx = L.x * TS + 8 - cx, ly = L.y * TS + (L.dy || 4) - cy; if (lx < -60 || ly < -60 || lx > W + 60 || ly > H + 60) continue; hole(lx, ly, L.r + Math.sin(F.t * 7 + L.x * 3) * 2); }
      g.drawImage(m, 0, 0);
      if (F.map.lampGlow !== false) for (const L of F.lights) if (L.c) { const lx = L.x * TS + 8 - cx, ly = L.y * TS + (L.dy || 4) - cy; if (lx < -40 || ly < -40 || lx > W + 40 || ly > H + 40) continue; g.globalAlpha = 0.18; g.fillStyle = L.c; g.beginPath(); g.arc(lx, ly, L.r * 0.55, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }
    if (F.map.tint) { g.fillStyle = F.map.tint; g.fillRect(0, 0, W, H); }
    // 떠오르는 글자
    g.textAlign = 'center';
    for (const f of F.fx) {
      g.globalAlpha = Math.min(1, f.life / (f.max * 0.4));
      g.font = f.size + "px 'Galmuri11', monospace";
      const x = Math.round(f.x - cx), y = Math.round(f.y - cy);
      g.fillStyle = '#16101f';
      g.fillText(f.text, x + 1, y + 1); g.fillText(f.text, x - 1, y + 1); g.fillText(f.text, x, y + 2);
      g.fillStyle = f.color; g.fillText(f.text, x, y);
    }
    g.globalAlpha = 1; g.textAlign = 'left';
  }
  function drawGate(g, x, y, o) {
    if (o.style === 'light') { // 징수 기사단의 빛 장벽
      const a = 0.55 + 0.25 * Math.sin(F.t * 5 + x);
      g.globalAlpha = a; g.fillStyle = '#b89aff'; g.fillRect(x + 1, y, 14, 16); g.globalAlpha = 1;
      g.fillStyle = '#e8d8ff'; for (let i = 0; i < 4; i++) g.fillRect(x + 2 + ((i * 5 + Math.floor(F.t * 8)) % 12), y + 2 + i * 4, 2, 1);
      g.fillStyle = '#4a4458'; g.fillRect(x, y + 12, 2, 4); g.fillRect(x + 14, y + 12, 2, 4);
      return;
    }
    g.fillStyle = '#16101f'; g.fillRect(x, y + 3, 3, 13); g.fillRect(x + 13, y + 3, 3, 13);
    g.fillStyle = '#8a5a32'; g.fillRect(x + 1, y + 4, 1, 12); g.fillRect(x + 14, y + 4, 1, 12);
    for (const yy of [6, 11]) { g.fillStyle = '#16101f'; g.fillRect(x, yy - 1, 16, 4); for (let k = 0; k < 16; k += 4) { g.fillStyle = (k / 4) % 2 ? '#f4f0e8' : '#d8403a'; g.fillRect(x + k, yy, 4, 2); } }
    g.fillStyle = '#ffd84a'; g.fillRect(x + 6, y, 4, 4); g.fillStyle = '#16101f'; g.fillRect(x + 7, y + 1, 2, 2);
  }
  function drawMark(g, x, y, m) {
    const bob = Math.round(Math.sin(F.t * 5) * 1.5);
    const col = m === '!' ? '#ffd84a' : m === '?' ? '#8ad8ff' : '#6ee7a8';
    g.fillStyle = '#16101f'; g.fillRect(x + 5, y - 10 + bob, 7, 9);
    g.fillStyle = col; g.fillRect(x + 6, y - 9 + bob, 5, 7);
    g.fillStyle = '#16101f';
    if (m === '!') { g.fillRect(x + 8, y - 8 + bob, 1, 3); g.fillRect(x + 8, y - 4 + bob, 1, 1); }
    else if (m === '?') { g.fillRect(x + 7, y - 8 + bob, 3, 1); g.fillRect(x + 9, y - 7 + bob, 1, 1); g.fillRect(x + 8, y - 6 + bob, 1, 1); g.fillRect(x + 8, y - 4 + bob, 1, 1); }
    else { g.fillRect(x + 7, y - 6 + bob, 3, 1); g.fillRect(x + 8, y - 7 + bob, 1, 3); }
  }

  Object.assign(F, { load, tryMove, interact, update, render, setView, addFloat, burst, spotHere, facing, charAt, objAt, npcAt, monAt, removeMon, spawnMon, refreshNpcs, setFollower,
    walkNpc, stepNpc, snapCam, heroSprite, spriteFor, freeTile, dirTo, DIRS, buildingAt, forceMove, stepFollower, addNpc, removeNpc, emote, gateOpen, objOn });
  G.field = F;
})();
