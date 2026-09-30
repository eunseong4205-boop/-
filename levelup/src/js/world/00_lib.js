/* 세계를 짓는 도구: 맵 등록, 들판 생성기, 방 생성기, 자주 쓰는 인물 대본 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data;
  G.maps = G.maps || {}; G.quests = G.quests || {}; G.books = G.books || {};
  G.world = G.world || { towns: [], nodes: [] };
  G.hooks = G.hooks || { level: [], rank: [], enter: [], click: [] };
  G.story = G.story || {};
  // 장마다 덧붙이는 이야기 조각: 동행과의 대화 · 쉬는 밤의 대화 · 진실의 조각
  G.story.talks = G.story.talks || [];
  G.story.nights = G.story.nights || [];
  G.story.truths = G.story.truths || {};
  G.story.abyss = G.story.abyss || {};

  const W = {};
  const DIR4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  /** 생성된 맵: 수련 샘 · NPC · 보스 · 상자가 막힌 칸에 있거나 길과 끊겨 있으면 길을 뚫는다 */
  function autofix(def) {
    const grid = def.grid;
    if (!grid || !grid.pathCh) return;
    const rows = grid.map((r) => r.split(''));
    const H = rows.length, Wd = rows[0].length;
    const walk = (ch) => G.tiles.walkable(ch);
    const inB = (x, y) => (def.builds || []).some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    const ground = grid.groundCh || '.';
    // 길의 시작점에서 닿는 칸 = 본 연결망
    const main = new Set();
    const flood = (sx, sy) => {
      const st = [[sx, sy]];
      while (st.length) {
        const [x, y] = st.pop(); const k = x + ',' + y;
        if (main.has(k) || x < 0 || y < 0 || x >= Wd || y >= H || !walk(rows[y][x]) || inB(x, y)) continue;
        main.add(k);
        for (const [dx, dy] of DIR4) st.push([x + dx, y + dy]);
      }
    };
    for (const [sx, sy] of grid.seeds || []) flood(sx, sy);
    const connect = (x, y) => {
      if (x < 1 || y < 1 || x >= Wd - 1 || y >= H - 1) return;
      if (!walk(rows[y][x])) rows[y][x] = ground;
      if (main.has(x + ',' + y)) return;
      const prev = new Map([[x + ',' + y, null]]);
      const q = [[x, y]];
      let found = null;
      while (q.length) {
        const [cx, cy] = q.shift();
        if ((cx !== x || cy !== y) && (main.size ? main.has(cx + ',' + cy) : rows[cy][cx] === grid.pathCh || rows[cy][cx] === 'S')) { found = [cx, cy]; break; }
        for (const [dx, dy] of DIR4) {
          const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny;
          if (nx < 1 || ny < 1 || nx >= Wd - 1 || ny >= H - 1 || prev.has(k) || inB(nx, ny)) continue;
          prev.set(k, [cx, cy]); q.push([nx, ny]);
        }
      }
      let k = found;
      while (k) { const [kx, ky] = k; if (!walk(rows[ky][kx])) rows[ky][kx] = rows[ky][kx] === '~' || rows[ky][kx] === 'L' ? (grid.bridgeCh || ground) : ground; k = prev.get(kx + ',' + ky); }
      if (found && main.size) flood(x, y);
    };
    const solidAt = new Set();
    for (const o of def.objs || []) if (o.t === 'chest' || o.t === 'pickup' || o.t === 'sign') solidAt.add(o.x + ',' + o.y);
    for (const o of def.objs || []) {
      if (o.t === 'spot') connect(o.x, o.y);
      else if ((o.t === 'chest' || o.t === 'pickup') && !o.invisible) {
        if (!walk(rows[o.y][o.x])) rows[o.y][o.x] = ground;
        const nb = DIR4.map(([dx, dy]) => [o.x + dx, o.y + dy]).find(([nx, ny]) => ny > 0 && ny < H - 1 && nx > 0 && nx < Wd - 1 && !solidAt.has(nx + ',' + ny) && !inB(nx, ny));
        if (nb) connect(nb[0], nb[1]);
      }
    }
    for (const n of def.npcs || []) if (!inB(n.x, n.y)) connect(n.x, n.y);
    for (const f of def.fixed || []) {
      connect(f.x, f.y);
      const nb = DIR4.map(([dx, dy]) => [f.x + dx, f.y + dy]).find(([nx, ny]) => ny > 0 && ny < H - 1 && nx > 0 && nx < Wd - 1);
      if (nb) connect(nb[0], nb[1]);
    }
    const out = rows.map((r) => r.join(''));
    out.pathCh = grid.pathCh; out.groundCh = grid.groundCh; out.seeds = grid.seeds;
    def.grid = out;
  }
  W.map = (id, def) => { def.id = id; autofix(def); G.maps[id] = def; return def; };
  W.quest = (id, def) => { G.quests[id] = def; return def; };
  W.book = (id, def) => { G.books[id] = def; return def; };
  W.town = (def) => { G.world.towns.push(def); };
  W.keyItem = (id, name, desc) => { D.ITEMS[id] = { id, name, type: 'key', desc }; };
  /** 부탁을 받은 뒤 몬스터를 몇 마리 잡았는지 */
  W.killsSince = (s, mon, key) => ((s.codex[mon] && s.codex[mon].k) || 0) - (s.flags[key] || 0);
  W.markKills = (s, mon, key) => { s.flags[key] = (s.codex[mon] && s.codex[mon].k) || 0; };
  W.node = (def) => { G.world.nodes.push(def); };

  /* ───────── 값 노이즈 ───────── */
  function vnoise(x, y, seed) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = (t) => t * t * (3 - 2 * t);
    const a = U.noise2(xi, yi, seed), b = U.noise2(xi + 1, yi, seed), c = U.noise2(xi, yi + 1, seed), d = U.noise2(xi + 1, yi + 1, seed);
    return U.lerp(U.lerp(a, b, s(xf)), U.lerp(c, d, s(xf)), s(yf));
  }

  /* ───────── 들판 생성기 ─────────
     o: { w, h, seed, ground, alt:[[ch, 임계값]], obst:[[ch, 가중치]], dense(0~1, 낮을수록 빽빽), sparse, border, bt,
          lakes:[{x,y,rx,ry,ch,edge}], paths:[[[x,y],...]], path, pw, clear:[[x,y,w,h,ch]], stamps:[{x,y,rows}], exits:[[x,y]] } */
  W.gen = function (o) {
    const Wd = o.w, H = o.h;
    const seed = U.hash(o.seed || 'field') % 100000;
    const r = U.rng(seed + 7);
    const g = [];
    for (let y = 0; y < H; y++) g.push(new Array(Wd).fill(o.ground || '.'));
    const inb = (x, y) => x >= 0 && y >= 0 && x < Wd && y < H;
    const set = (x, y, c) => { if (inb(x, y)) g[y][x] = c; };
    // 바닥 무늬
    for (const [ch, th, sc] of o.alt || []) for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) if (vnoise(x / (sc || 5), y / (sc || 5), seed + ch.charCodeAt(0)) > th) g[y][x] = ch;
    // 장애물
    const obst = o.obst || [['T', 1]];
    const tot = obst.reduce((a, b) => a + b[1], 0);
    const pickObst = () => { let v = r() * tot; for (const [ch, w] of obst) { v -= w; if (v <= 0) return ch; } return obst[0][0]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
      const n = vnoise(x / (o.scale || 6), y / (o.scale || 6), seed);
      if ((n > (o.dense == null ? 0.68 : o.dense) && r() < 0.85) || r() < (o.sparse == null ? 0.025 : o.sparse)) g[y][x] = pickObst();
    }
    // 호수
    for (const L of o.lakes || []) {
      for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
        const dx = (x + 0.5 - L.x) / L.rx, dy = (y + 0.5 - L.y) / L.ry;
        const d = dx * dx + dy * dy + (vnoise(x / 2.5, y / 2.5, seed + 99) - 0.5) * 0.35;
        if (d <= 1) g[y][x] = L.ch || '~';
        else if (L.edge && d <= 1.45 && g[y][x] !== (L.ch || '~')) g[y][x] = L.edge;
      }
    }
    // 테두리
    const bt = o.bt == null ? 1 : o.bt;
    const border = o.border || 'T';
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
      if (x < bt || y < bt || x >= Wd - bt || y >= H - bt) g[y][x] = typeof border === 'function' ? border(x, y, r) : border;
      else if (o.rough && (x < bt + 1 || y < bt + 1 || x >= Wd - bt - 1 || y >= H - bt - 1) && r() < o.rough) g[y][x] = typeof border === 'function' ? border(x, y, r) : border;
    }
    // 길
    const pth = o.path || ':';
    const pw = o.pw || 1;
    const carve = (x, y, c) => {
      for (let yy = y - (pw > 1 ? 1 : 0); yy <= y + (pw > 2 ? 1 : 0); yy++) for (let xx = x - (pw > 1 ? 1 : 0); xx <= x + (pw > 2 ? 1 : 0); xx++) {
        if (!inb(xx, yy)) continue;
        if (g[yy][xx] === '~' && o.bridge) { g[yy][xx] = o.bridge; continue; }
        g[yy][xx] = c;
      }
      // 길 양옆은 풀어 준다
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, yy = y + dy;
        if (!inb(xx, yy) || xx < 1 || yy < 1 || xx >= Wd - 1 || yy >= H - 1) continue;
        const ch = g[yy][xx];
        if (!G.tiles.walkable(ch) && ch !== '~' && ch !== 'L' && ch !== 'v' && !(o.keep || '').includes(ch)) g[yy][xx] = o.ground || '.';
      }
    };
    for (const line of o.paths || []) {
      for (let i = 1; i < line.length; i++) {
        let [x, y] = line[i - 1];
        const [tx, ty] = line[i];
        let guard = 0;
        carve(x, y, pth);
        while ((x !== tx || y !== ty) && guard++ < 999) {
          const dx = Math.sign(tx - x), dy = Math.sign(ty - y);
          const horiz = dx && (!dy || (o.wiggle !== false && r() < 0.5 + (Math.abs(tx - x) - Math.abs(ty - y)) * 0.08));
          if (horiz) x += dx; else y += dy;
          carve(x, y, pth);
        }
      }
    }
    // 비우기 · 도장
    for (const [x0, y0, w, h, ch] of o.clear || []) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, ch || o.ground || '.');
    for (const st of o.stamps || []) st.rows.forEach((row, dy) => { for (let dx = 0; dx < row.length; dx++) if (row[dx] !== ' ') set(st.x + dx, st.y + dy, row[dx]); });
    const out = g.map((row) => row.join(''));
    out.pathCh = pth; out.groundCh = o.ground || '.'; out.bridgeCh = o.bridge;
    out.seeds = (o.paths || []).map((l) => [Math.min(Math.max(l[0][0], 0), Wd - 1), Math.min(Math.max(l[0][1], 0), H - 1)]);
    return out;
  };

  /* ───────── 방 생성기 ─────────
     o: { w, h, floor, door(x, 아래 벽), win:[x...], put:[[x,y,ch]...], rug:[x,y,w,h] } */
  W.room = function (o) {
    const Wd = o.w, H = o.h;
    const g = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < Wd; x++) {
        if (y < 2 || x === 0 || x === Wd - 1 || y === H - 1) row.push((y === 1 && (o.win || []).includes(x)) ? 'w' : '#');
        else row.push(o.floor || '-');
      }
      g.push(row);
    }
    if (o.rug) { const [rx, ry, rw, rh] = o.rug; for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) g[y][x] = '+'; }
    for (const [x, y, ch] of o.put || []) if (g[y] && g[y][x] !== undefined) g[y][x] = ch;
    if (o.door != null) g[H - 1][o.door] = 'D';
    if (o.door2 != null) g[H - 1][o.door2] = 'D';
    return g.map((r) => r.join(''));
  };
  /** 방 출구: 문 칸에 서면 바깥으로 */
  W.exit = (x, y, to, tx, ty) => ({ x, y, to, tx, ty, dir: 'down' });

  /* ───────── 자주 쓰는 오브젝트 ───────── */
  W.spot = (x, y, mult, hidden) => ({ t: 'spot', x, y, mult: mult || (hidden ? 10 : 3), hidden: !!hidden });
  W.chest = (id, x, y, item, n, extra) => Object.assign({ t: 'chest', id, x, y, item, n: n || 1 }, extra || {});
  W.goldChest = (id, x, y, gold) => ({ t: 'chest', id, x, y, gold });
  W.sign = (x, y, text) => ({ t: 'sign', x, y, text });
  W.bookObj = (id, x, y) => ({ t: 'book', id, x, y });
  W.gate = (x, y, req, msg, extra) => Object.assign({ t: 'gate', x, y, req, msg }, extra || {});
  /** 살펴볼 곳 (보이지 않는다). text는 문자열 · 배열 · (s) => … 로 이야기에 따라 바뀔 수 있다. opt.first: 처음 볼 때 한 번 */
  W.look = (x, y, text, opt) => Object.assign({ t: 'sign', invisible: true, solid: false, x, y, text }, opt || {});
  /** 소품: 우물(물 마시기) · 벤치(앉아 쉬기) · 사당(기도) · 모닥불(불 쬐기) · 낚시 구멍 · 게시판 · 상자 · 석상 · 등불 */
  const PROP = {
    well: { text: '돌로 쌓은 우물이다. 두레박 줄이 반들반들하다.', verb: '물 마시기', act: async (c) => { c.s.hp = Math.min(G.engine.derive(c.s).hpMax, c.s.hp + G.engine.derive(c.s).hpMax * 0.4); c.sfx('heal'); await c.say(null, '차가운 물을 한 모금 마셨다. 목 뒤가 서늘해지며 기운이 돌아온다.'); } },
    bench: { text: null, verb: '앉기', act: async (c) => { await c.fadeOut(300); c.s.hp = Math.min(G.engine.derive(c.s).hpMax, c.s.hp + G.engine.derive(c.s).hpMax * 0.3); await c.wait(0.6); await c.fadeIn(300); await (G.story.benchThought ? G.story.benchThought(c) : c.say(null, '잠깐 앉아 숨을 골랐다.')); } },
    shrine: { text: '작은 돌 사당이다. 누군가 매일 초를 갈아 끼우는 모양이다.', verb: '기도하기', act: async (c) => {
      const st = c.s; if ((st.buffs || []).some((b) => b.id === 'pray' && b.until > st.t)) { await c.say(null, '마음이 이미 따뜻하다. 초가 조용히 탄다.'); return; }
      st.buffs.push({ id: 'pray', fx: { exp: 0.25 }, until: st.t + 180 }); c.sfx('white');
      await c.say(null, ['두 손을 모았다. 무엇을 빌지는 정하지 못했다. 그래도 촛불이 한 번 크게 흔들렸다.', '[y]사당의 온기[/] — 3분 동안 경험치 +25%']);
    } },
    fire: { text: null, verb: '불 쬐기', act: async (c) => { c.s.hp = Math.min(G.engine.derive(c.s).hpMax, c.s.hp + G.engine.derive(c.s).hpMax * 0.5); c.sfx('heal'); await c.say(null, '손을 불에 대고 한참 있었다. 타닥, 타닥. 굳었던 손가락이 풀린다.'); } },
    board: { text: '게시판이다. 붙은 종이가 바람에 들썩인다.', verb: '읽기' },
    crate: { text: '나무 상자다. 못이 단단히 박혀 있다.' },
    statue: { text: '누군가의 석상이다.' },
    lantern: { text: '등불이 흔들린다.' },
    // 낚시 구멍: 물이 없는 곳(얼음 구멍 · 우물)에서도 드리울 수 있다. opt.pool = 어느 물의 물고기인지
    hole: { text: null, verb: '낚시', act: async (c, o) => {
      if (!(G.story.canFish && G.story.canFish(c.s))) { await c.say(null, o.noRod || '물이 깊다. 낚싯대가 있다면 무언가 걸릴지도 모른다.'); return; }
      await G.story.fishing(c, o.x, o.y, o.pool);
    } },
  };
  W.prop = (kind, x, y, text, opt) => {
    const P = PROP[kind] || {};
    const o = Object.assign({ t: 'prop', kind, x, y, verb: P.verb || '살펴보기' }, opt || {});
    const txt = text !== undefined ? text : P.text;
    if (P.act && !o.talk) o.talk = async (c) => { const t = typeof txt === 'function' ? txt(c.s) : txt; if (t) await c.say(null, t); await P.act(c, o); if (o.after) await o.after(c); };
    else o.text = txt;
    return o;
  };
  /** 이미 등록된 맵에 나중에 덧붙이기: 혼잣말 · 오브젝트 · 들짐승 */
  W.barks = (mapId, table) => {
    const m = G.maps[mapId]; if (!m) throw new Error('barks: no map ' + mapId);
    for (const n of m.npcs || []) { const b = table[n.id]; if (b && !n.bark) n.bark = b; }
  };
  W.addObjs = (mapId, objs) => { const m = G.maps[mapId]; if (!m) throw new Error('addObjs: no map ' + mapId); m.objs = (m.objs || []).concat(objs); };
  W.addNpcs = (mapId, npcs) => { const m = G.maps[mapId]; if (!m) throw new Error('addNpcs: no map ' + mapId); m.npcs = (m.npcs || []).concat(npcs); };
  W.critters = (mapId, list) => { const m = G.maps[mapId]; if (!m) throw new Error('critters: no map ' + mapId); m.critters = list; };
  /** 기존 인물의 대사 앞에 끼어드는 장면: 조건이 맞으면 fn, 아니면 원래 대사 */
  W.wrapNpc = (mapId, npcId, cond, fn) => {
    const m = G.maps[mapId]; if (!m) throw new Error('wrapNpc: no map ' + mapId);
    const n = (m.npcs || []).find((x) => x.id === npcId); if (!n) throw new Error('wrapNpc: no npc ' + npcId + ' in ' + mapId);
    const orig = n.talk;
    n.talk = async (c, nn) => { if (cond(c.s)) return fn(c, nn, orig); if (orig) return orig(c, nn); };
    return n;
  };

  /** 지역 레벨 구간에서 frac(0~1) 위치의 레벨 → 맵 기운 */
  W.ki = (region, frac) => { const r = D.REG[region]; return Math.round(r.lv[0] * Math.pow(r.lv[1] / r.lv[0], frac)); };

  /* ───────── 자주 쓰는 인물 대본 ───────── */
  W.clerk = (id, x, y, lines) => ({
    id, x, y, dir: 'down',
    talk: async (c) => {
      const s = c.s;
      await c.say(id, lines && lines.hello ? lines.hello : '등급소입니다. 레벨과 골드가 준비되었다면 다음 차수로 올려 드리죠.');
      if (!s.flags.tip_rank) { s.flags.tip_rank = true; await c.say(id, ['등급을 올리면 렙업 버튼으로 얻는 경험치와 골드가 늘고, 싸움도 강해집니다.', '[y]괴짜[/]부터는 문이 잠겨 있어요. 같은 색 구슬 네 개에 새겨진 숫자를 모두 더한 값이 비밀번호입니다.']); }
      await c.rank(id);
      if (lines && lines.bye) await c.say(id, lines.bye);
    },
  });
  W.keeper = (id, shop, x, y, hello, extra) => Object.assign({
    id, x, y, dir: 'down',
    talk: async (c) => { if (hello) await c.say(id, typeof hello === 'function' ? hello(c.s) : hello); await c.shop(shop); },
  }, extra || {});
  W.innkeeper = (id, x, y, price, hello) => ({
    id, x, y, dir: 'down',
    talk: async (c) => { if (hello) await c.say(id, hello); await c.inn(price, id); },
  });
  /** 한 번씩 돌아가며 하는 말 */
  W.chatter = (id, lines, speaker) => async (c, n) => {
    const k = 'chat_' + id;
    const i = c.s.flags[k] || 0;
    const L = typeof lines === 'function' ? lines(c.s) : lines;
    const line = L[i % L.length];
    c.s.flags[k] = i + 1;
    let who = speaker;
    if (!who) {
      if (G.chars[id]) who = id;
      else if (n && n.speaker) who = n.speaker;
      else if (n && G.chars[n.id]) who = n.id;
      else who = id.split('_').find((p) => G.chars[p]) || 'villager';
    }
    if (typeof line === 'function') await line(c); else await c.say(who, line);
  };

  G.W = W;
})();
