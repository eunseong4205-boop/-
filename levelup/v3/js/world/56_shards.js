/* 조각들 — 흑점에서 떨어진 검은 유리 조각 일곱
   만지면 다른 시대, 다른 사람이 된다. 그 사람으로 걸어 다니며 말을 걸고 물건을 만지고, 마지막에 고른다.
   과거는 바뀌지 않는다. 다만 무엇을 기억할지는 고를 수 있다 — 조각마다 흑점 속 목소리 하나의 「이름」이 남는다.
   · 첫 한 입 (퍼플 · 5장) — 천 년 전, 금빛 소년의 어깨 위 고양이
   · 소금 바다의 노래 (블루 · 3장) — 팔백 년 전, 어부의 아이
   · 모래 위의 별지기 (옐로 · 4장) — 사백오십 년 전, 대상의 낙타
   · 광맥을 마신 왕 (그레이 · 8장) — 612년, 왕의 서기
   · 흰 수녀원의 겨울 (화이트 · 7장) — 이백 년 전, 수련 수녀
   · 등불지기의 약속 (블랙 · 9장) — 백 년 전, 첫 등불지기
   · 허용 손실 (무지개 · 6장) — 983년 봄, 기사단 회계실의 젊은 서기
   이름 여섯을 모으면 마지막 선택에 「이름을 불러 준다」가 열린다 (95b_endings) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const folk = (k, o) => G.cast.folk(k, o || {});

  /* ═════════ 무대 방 ═════════ */
  function room(id, spec) {
    G.build.def(id, {
      build() {
        const rm = G.build.room(Object.assign({ id }, spec));
        rm.stage = true; rm.noCard = true; rm.noFollow = true; rm.memory = true;
        if (spec.dark != null) rm.dark = spec.dark;
        if (spec.darkCol) rm.darkCol = spec.darkCol;
        if (spec.weather) rm.weather = spec.weather;
        return rm;
      },
    });
  }
  /** 바깥 무대: 글자 그림으로 그린다. 빈칸 = 허공(막힘) · 글자마다 바닥과 물건 (spec.key로 덧붙인다) */
  const OB = G.objs.O;
  const KEY = {
    '.': null, ',': 'floor2', g: [T.GRASS], m: [T.MEADOW], d: [T.DIRT], s: [T.SAND], n: [T.SNOW], c: [T.COBBLE], p: [T.PLAZA], k: [T.PLANK], b: [T.BRICK],
    r: [T.ROAD], w: [T.WATER], W: [T.DEEP], i: [T.ICE], o: [T.STONE], u: [T.MARBLE], y: [T.DRY], e: [T.SANDSTONE], x: [T.CHECKER], q: [T.ICEBRICK], v: [T.GRAVEL], h: [T.ASH],
    T: [T.GRASS, OB.TREE], Y: [T.SNOW, OB.SNOWTREE], P: [T.SAND, OB.PALM], D: [T.DRY, OB.DEAD], B: [null, OB.BOULDER], f: [null, OB.FLOWER], t: [null, OB.TALL], L: [null, OB.LAMP],
    H: [null, OB.HEDGE], '=': [null, OB.FENCEH], '|': [null, OB.FENCEV], R: [T.WATER, OB.REED], G: [null, OB.GRAVE], N: [T.SAND, OB.NET], X: [null, OB.CRATE], O: [null, OB.BARREL],
    K: [T.BRIDGE], Q: [T.WALL], A: [null, OB.PILLAR], F: [null, OB.BANNER], V: [null, OB.HAY], J: [null, OB.BENCH], Z: [null, OB.POTS], U: [null, OB.WELL], E: [null, OB.PEBBLE],
  };
  function field(id, spec) {
    G.build.def(id, {
      build() {
        const rows = spec.rows, h = rows.length, w = Math.max(...rows.map((r) => r.length));
        const m = new G.GameMap({ id, name: spec.name || '', w, h, region: TL.REGIONS.indexOf(spec.region || 'green'), music: spec.music || 'dream', edge: T.VOID });
        m.palName = spec.pal || spec.region || 'green';
        const fl = spec.floor != null ? spec.floor : T.GRASS, fl2 = spec.floor2 != null ? spec.floor2 : fl;
        const key = Object.assign({}, KEY, spec.key || {});
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const ch = rows[y][x] || ' ', i = m.i(x, y);
          if (ch === ' ') { m.ter[i] = T.VOID; continue; }
          const k = key[ch];
          if (k === undefined) { m.ter[i] = fl; continue; }
          if (k === null) { m.ter[i] = fl; continue; }
          if (k === 'floor2') { m.ter[i] = fl2; continue; }
          m.ter[i] = k[0] != null ? k[0] : fl;
          if (k[1]) m.obj[i] = k[1];
        }
        m.entry = { x: px(spec.start ? spec.start[0] : Math.floor(w / 2)), y: py(spec.start ? spec.start[1] : h - 2) };
        m.dark = spec.dark || 0; if (spec.darkCol) m.darkCol = spec.darkCol;
        if (spec.weather) m.weather = spec.weather;
        m.lights = (spec.lights || []).map((l) => ({ x: px(l[0]), y: py(l[1]) - 10, r: l[2] || 44, warm: l[3] || 'rgba(255,200,110,0.3)' }));
        m.spawnList = [];
        for (const f0 of spec.furn || []) m.spawnList.push({ decor: f0[0], tx: f0[1], ty: f0[2], o: f0[3] || {} });
        m.stage = true; m.noCard = true; m.noFollow = true; m.memory = true;
        return m;
      },
    });
  }
  room('m_tower', { region: 'yellow', name: '천 년 전 · 금빛 언덕의 막사', w: 15, h: 10, floor: T.SANDSTONE, music: 'dream', dark: 0.3, rug: [6, 3, 4, 4],
    furn: [['desk', 7, 3], ['bookpile', 5, 3], ['lamp', 10, 3], ['window', 4, 1, { wall: true, v: 'night' }], ['window', 10, 1, { wall: true, v: 'night' }], ['crate', 1, 7], ['crate', 13, 7]] });
  room('m_sea', { region: 'blue', name: '팔백 년 전 · 소금 바다의 오두막', w: 15, h: 10, floor: T.SAND, music: 'calm', weather: 'mist',
    furn: [['barrel', 1, 3], ['barrel', 2, 3], ['table', 7, 4], ['chair', 6, 5], ['window', 4, 1, { wall: true, v: 'sea' }], ['window', 10, 1, { wall: true, v: 'sea' }], ['crate', 12, 6]] });
  room('m_desert', { region: 'yellow', name: '사백오십 년 전 · 모래바다의 야영지', w: 16, h: 10, floor: T.SAND, music: 'dream', dark: 0.45, darkCol: 'rgba(10,8,30,1)', weather: 'stars',
    furn: [['crate', 2, 3], ['crate', 3, 3], ['barrel', 13, 3], ['bench', 7, 6]] });
  room('m_palace', { region: 'gray', name: '612년 · 은빛 왕궁의 서고', w: 15, h: 11, floor: T.MARBLE, music: 'dread', dark: 0.2, rug: [6, 3, 3, 7],
    furn: [['altar', 7, 2], ['shelf', 1, 2], ['shelf', 2, 2], ['shelf', 12, 2], ['shelf', 13, 2], ['desk', 3, 6], ['lamp', 5, 2], ['lamp', 9, 2], ['clock', 11, 1, { wall: true }]] });
  room('m_abbey', { region: 'white', name: '이백 년 전 · 흰 수녀원', w: 15, h: 11, floor: T.ICEBRICK, music: 'white', weather: 'snow',
    furn: [['bed2', 2, 4], ['bed2', 2, 7], ['bed2', 11, 4], ['altar', 7, 2], ['desk', 11, 7], ['lamp', 5, 2], ['lamp', 9, 2], ['window', 4, 1, { wall: true }]] });
  room('m_lamp', { region: 'black', name: '백 년 전 · 해가 지지 않던 마지막 밤', w: 16, h: 11, floor: T.CHECKER, music: 'dream', dark: 0.72, darkCol: 'rgba(6,4,18,1)',
    furn: [['bench', 7, 5], ['crate', 1, 8], ['barrel', 14, 8], ['window', 7, 1, { wall: true, v: 'night' }]] });
  room('m_office', { region: 'rainbow', name: '983년 봄 · 기사단 회계실', w: 15, h: 10, floor: T.CHECKER, music: 'dread', dark: 0.3,
    furn: [['shelf', 2, 2], ['shelf', 3, 2], ['shelf', 4, 2], ['shelf', 10, 2], ['shelf', 11, 2], ['shelf', 12, 2], ['counter', 10, 5], ['crate', 1, 7], ['barrel', 13, 7], ['lamp', 6, 3]] });

  /* ═════════ 들어가고 나오기 ═════════
     조각 하나는 여러 장면(acts)으로 흐른다: 앞 장면 → 고르는 장면 → 그 뒤. 장면이 끝나면 next()로 다음 장면에 선다.
     한 장면을 마칠 때마다 어디까지 보았는지 적어 두어, 중간에 빠져나와도 그 장면부터 다시 볼 수 있다 */
  const MEM = { cur: null, st: null, act: null, ai: 0 };
  ST.memNow = () => MEM.cur;
  const actsOf = (sh) => sh.acts || [sh];
  const ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
  async function enter(c, sh, from) {
    const s = S(), p0 = W().player;
    s.stageRet = { map: s.map, x: p0.x, y: p0.y, dir: p0.dir };
    c.lock(true);
    c.sfx('white');
    await c.narr(from ? '검은 유리에 다시 손을 댔다. 아까 그 숨소리가 기다리고 있었다.' : '검은 유리에 손끝이 닿았다. 차갑다. 그리고 — 배가 고프다. 누군가의 배고픔이 손가락을 타고 올라온다.');
    await c.fade(true, { sec: 1 });
    ST.staging = true; MEM.cur = sh;
    const pr = from && s.shardProg && s.shardProg[sh.id];
    MEM.st = pr && pr.st ? JSON.parse(JSON.stringify(pr.st)) : {};
    MEM.pick = pr ? pr.pick : null; MEM.label = pr ? pr.label : null;
    MEM.lantern = !!p0.lantern;
    if (G.hud) G.hud.hidden = true;
    c.filter('memory');
    await stageAct(c, from || 0, true);
  }
  /** 장면 하나를 세운다: 방 · 모습 · 사람 · 물건 · 들어가는 말 */
  async function stageAct(c, ai, first) {
    const sh = MEM.cur, acts = actsOf(sh), A = acts[ai];
    MEM.ai = ai; MEM.act = A;
    // 방 등불은 지도에 남으므로(지도는 한 번 지어 둔다) 들어올 때마다 처음 상태로
    const rm0 = G.build.get(A.room); rm0.lights0 = rm0.lights0 || (rm0.lights || []).slice(); rm0.lights = rm0.lights0.slice();
    G.game.goto(A.room, px(A.start[0]), py(A.start[1]), A.dir || 'up', { quiet: true, keepMusic: true });
    const p = W().player, pov = A.pov || sh.pov;
    p.look = pov.look; p.sheet = null; p.hidden = false; p.lantern = !!A.lantern;
    disarm(p);
    p.beast = pov.look && pov.look.kind && ST.beastDraw ? ST.beastDraw(p, pov.look.kind) : null;
    if (G.hud) G.hud.hidden = true;
    c.music(A.music || sh.music || rm0.music || 'dream');
    for (const npc of A.npcs || []) if (!npc.later) addNpc(npc);
    for (const sp of A.spots || []) W().add(new MemSpot({ mk: sp.mk, x: px(sp.x) + (sp.dx || 0), y: py(sp.y) + (sp.dy || 0), verb: sp.verb, reach: sp.reach || 18, when: () => !sp.when || sp.when(MEM.st), text: async (c2) => { MEM.used[sp.mk] = 1; await sp.text(c2, MEM.st); } }));
    MEM.used = {}; MEM.idle = 0; MEM.sig = ''; MEM.age = 0;
    await c.wait(0.3);
    await c.fade(false, { sec: 1.2 });
    G.cine.area(sh.title + (acts.length > 1 ? ' · ' + ORD[ai] + ' 장면' : ''), A.era || sh.era);
    await c.wait(1.6);
    if (A.intro) await A.intro(c, MEM.st);
    if (first) await c.narr('[s](조각 속에서는 ' + U.josa(pov.name, '으로/로') + ' 걷는다.' + (acts.length > 1 ? ' 이 기억은 장면 ' + acts.length + '개로 이어진다.' : '') + ' 위의 띠가 할 일을 알려 준다 — 빛나는 것은 만져 보고, [y]![/] 표시가 뜬 사람에게는 말을 걸자. 메뉴 키로 언제든 빠져나올 수 있다.)[/]');
    else if (A.pov && A.pov !== acts[ai - 1].pov) await c.narr('[s](이번에는 ' + U.josa(pov.name, '으로/로') + ' 걷는다.)[/]');
    c.lock(false);
  }
  /** 기억 속 사람 하나 (장면 중간에 나타나는 사람도: npc.later면 처음엔 세우지 않는다) */
  function addNpc(npc, at) {
    const x = at ? at.x : px(npc.x), y = at ? at.y : py(npc.y);
    const e = W().add(new G.props.NPC({ x, y, dir: npc.dir || 'down', look: npc.look, name: npc.name, talk: npc.talk ? (c2, n) => npc.talk(c2, n, MEM.st) : null, lookAt: npc.lookAt, mark: () => (isTarget(npc.key) ? '!' : null) }));
    e.memKey = npc.key; e.voiceOff = true; if (npc.wander) e.wanderR = npc.wander;
    if (npc.state) e.state = npc.state;
    if (npc.look && npc.look.kind && ST.beastDraw) e.drawFn = ST.beastDraw(e, npc.look.kind);
    return e;
  }
  /** 장면 끝: 다음 장면으로, 마지막이면 조각을 녹인다. k · label은 고른 것 (고르는 장면에서만) */
  async function next(c, k, label) {
    if (k != null) { MEM.pick = k; MEM.st.pick = k; }
    if (label) MEM.label = label;
    const sh = MEM.cur, acts = actsOf(sh);
    if (MEM.ai + 1 >= acts.length) { const s = S(); if (s.shardProg) delete s.shardProg[sh.id]; return leave(c, sh, MEM.pick == null ? 0 : MEM.pick, MEM.label); }
    const s = S(); s.shardProg = s.shardProg || {};
    s.shardProg[sh.id] = { ai: MEM.ai + 1, pick: MEM.pick, label: MEM.label, st: JSON.parse(JSON.stringify(MEM.st || {})) };
    c.lock(true);
    if (G.cine.letterbox) G.cine.letterbox(false);
    c.sfx('white');
    await c.fade(true, { sec: 1.4 });
    await c.wait(0.4);
    await stageAct(c, MEM.ai + 1, false);
  }
  async function leave(c, sh, pick, nameLabel) {
    const s = S();
    MEM.stEnd = MEM.st || {};
    s.shards = s.shards || {};
    s.shards[sh.id] = { pick, name: sh.name };
    c.flag('shard:' + sh.id);
    c.sfx('white');
    await c.narr('[w]「' + sh.name + '」[/]\n흑점 속 목소리 하나에 이름이 붙었다.' + (nameLabel ? '\n[s]' + nameLabel + '[/]' : ''));
    await c.fade(true, { sec: 1.2 });
    backToWorld(c);
    await c.wait(0.3);
    await c.fade(false, { sec: 1 });
    const n = Object.keys(s.shards).length;
    await c.say('toria', n === 1 ? '찍…? 너 잠깐 멍하게 서 있었어. 눈이 딴 데 가 있었어. 어디 갔다 왔어?' : n >= 6 ? '또 갔다 왔구나. …너 요즘 흑점을 쳐다볼 때 얼굴이 달라. 무서워하는 얼굴이 아니야. 누굴 찾는 얼굴이야.' : '또 조각이야? 이번엔 누구였어? …찍, 말 안 해도 돼. 얼굴에 써 있어.', { face: n >= 6 ? 'sad' : 'normal' });
    c.journal('검은 조각 — ' + sh.title + ' (' + sh.era + '). ' + sh.journal(pick) + (sh.journal2 ? ' ' + sh.journal2(MEM.stEnd || {}) : '') + ' 이름: ' + sh.name + '. (모은 이름 ' + n + ' / 7)');
    if (n === 6) { await c.say(null, '[y]이름 여섯[/] — 흑점 속 목소리들의 이름을 거의 다 알게 되었다. 마지막 선택에서 무언가를 할 수 있을 것 같다.', { style: 'sys' }); }
    s.pts = (s.pts || 0) + 1;
    await c.say(null, '조각이 손바닥에서 녹아 사라졌다. [y]성장 점수 +1[/]', { style: 'sys' });
  }
  /* 기억 속의 몸: 칼 · 활 · 마법 · 도구 · 구르기는 없다. J는 말 걸기 · 만지기만 */
  const MEM_ACTS = { attack: { input(p) { if (!G.input.pressed('attack')) return false; if (G.interact && G.interact.tryAt(p)) { G.input.eat('attack'); return true; } return false; } } };
  const NOOP = () => {};
  function disarm(p) { p.actions = MEM_ACTS; p.tryRoll = () => false; p.carry = null; if (!p.memDraw) p.memDraw = [p.onDraw, p.behindWeapon]; p.onDraw = NOOP; p.behindWeapon = NOOP; }   // 기억 속 사람은 주인공의 검을 들고 있지 않다
  function rearm(p) { p.actions = G.combat.actions; delete p.tryRoll; if (p.memDraw) { p.onDraw = p.memDraw[0]; p.behindWeapon = p.memDraw[1]; delete p.memDraw; } }
  /** 기억에서 들판으로: 모습 · 화면 · 손을 되돌린다 (끝까지 보았든, 중간에 빠져나왔든) */
  function backToWorld(c) {
    const s = S();
    c.filter('');
    ST.staging = false; MEM.cur = null; MEM.st = null; MEM.act = null; MEM.ai = 0;
    if (G.hud) G.hud.hidden = false;
    const r = s.stageRet || { map: 'world', x: px(99), y: py(182), dir: 'down' };
    G.game.goto(r.map, r.x, r.y, r.dir || 'down', { quiet: true });
    const p = W().player; p.look = ST.heroLook(s); p.sheet = null; p.hidden = false; p.beast = null; p.lantern = !!MEM.lantern;
    rearm(p);
    delete s.stageRet;
  }
  /** 중간에 빠져나오기: 조각은 그 자리에 남는다 */
  async function abort(c) {
    const sh = MEM.cur;
    c.lock(true);
    const pov = (MEM.act && MEM.act.pov) || (sh && sh.pov);
    await c.narr('손을 뗐다. 누군가의 숨소리가 멀어진다. ' + (pov ? pov.name + '의 이야기는 아직 끝나지 않았다.' : ''));
    await c.fade(true, { sec: 0.8 });
    backToWorld(c);
    await c.wait(0.2);
    await c.fade(false, { sec: 0.8 });
    const pr = sh && S().shardProg && S().shardProg[sh.id];
    await c.say('toria', '찍…! 너 갑자기 숨을 몰아쉬었어. 괜찮아? …조각은 그대로 있어. 나중에 다시 만져 봐도 돼.' + (pr ? ' 아까 본 데서부터 이어서 볼 수도 있을 거야.' : ''), { face: 'sad' });
    c.lock(false);
  }
  // 기억 속에서 메뉴 키: 수첩 대신 「빠져나올까」
  G.ui.menuGate = () => {
    if (!MEM.cur) return false;
    if (!G.script.running) G.script.run(async (c) => { const k = await c.choice('여기는 기억 속이다.', ['계속 머문다', '기억에서 빠져나온다 (조각은 그 자리에 남는다)']); if (k === 1) await abort(c); });
    return true;
  };
  /* ═════════ 기억 속 길잡이 ═════════
     조각마다 goals: [{ text, targets: [물건 mk · 사람 key], done(st), prog(st) }] — 앞에서부터 끝나지 않은 것이 지금 할 일.
     지금 할 일의 물건은 크게 빛나고, 사람 머리 위에는 ! . 위 가운데 띠에 할 일, 20초 넘게 아무 진척이 없으면 화살표 */
  function goalNow() {
    const A = MEM.cur && MEM.act; if (!A || !A.goals) return null;
    for (const g0 of A.goals) if (!g0.done || !g0.done(MEM.st || {})) return g0;
    return A.goals[A.goals.length - 1];
  }
  function isTarget(key) {
    const g0 = goalNow(); if (!g0 || !g0.targets.includes(key)) return false;
    const td = MEM.act.tdone && MEM.act.tdone[key];
    return !(td && td(MEM.st || {}));
  }
  /** 기억 속 물건: 지금 볼 것은 크게 빛나고, 한 번 본 것 · 지금 쓸 수 없는 것은 빛나지 않는다 */
  class MemSpot extends G.props.Spot {
    draw(g, cx, cy) {
      if (!this.canUse(W().player)) return;
      const t = W().t, x = Math.round(this.x - cx), y = Math.round(this.y - cy - 10);
      if (isTarget(this.mk)) {
        const r = 5 + Math.sin(t * 4) * 1.5;
        g.globalAlpha = 0.35; g.fillStyle = '#e8c8ff'; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 3, 2, 6); g.fillRect(x - 3, y - 1, 6, 2);
        g.fillStyle = '#c8a8ff'; g.fillRect(x, y - 5 - Math.round(Math.sin(t * 4) * 2), 1, 2);
      } else if (!MEM.used[this.mk] && Math.sin(t * 2.5 + this.x) > 0.3) {
        g.fillStyle = '#fff8c0'; g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + 1, 3, 1);
      }
    }
  }
  function nearestTarget() {
    const g0 = goalNow(), p = W().player; if (!g0 || !p) return null;
    let best = null, bd = 1e9;
    for (const e of W().ents) {
      if (e.dead) continue;
      const key = e.mk || e.memKey; if (!key || !isTarget(key)) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; best = e; }
    }
    return best && bd > 40 ? best : null;
  }
  ST.memIsTarget = (key) => !!MEM.cur && isTarget(key);   // 시험용
  ST.memInfo = function () {
    const sh = MEM.cur; if (!sh) return null;
    const g0 = goalNow();
    const n = actsOf(sh).length, pov = (MEM.act && MEM.act.pov) || sh.pov;
    return { title: pov.name + (n > 1 ? ' · ' + (MEM.ai + 1) + '/' + n : ''), act: MEM.ai, acts: n, fresh: (MEM.age || 0) < 6, text: g0 ? g0.text : '', prog: g0 && g0.prog ? '(' + g0.prog(MEM.st || {}) + ')' : '', arrow: MEM.idle > 20 ? nearestTarget() : null };
  };
  ST.onTick.push((dt) => {
    if (!MEM.cur) return;
    const sig = JSON.stringify(MEM.st || {});
    if (!G.script.running) MEM.age = (MEM.age || 0) + dt;
    if (sig !== MEM.sig || G.script.running) { MEM.sig = sig; MEM.idle = 0; } else MEM.idle += dt;
  });

  ST.shardNames = () => Object.values(S().shards || {}).map((x) => x.name);
  // 조각 속에서 저장한 채로 다시 열면(33d_threads가 돌아갈 곳으로 보낸다) 모습 · 화면을 되돌린다
  ST.enterHooks.push((m) => { if (!m.memory && !ST.staging) { const p = W().player; if (p && G.hud && G.hud.hidden && !MEM.cur) G.hud.hidden = false; } });

  const POV = (name, look) => ({ name, look });
  // 짐승이 된 주인공: 사람 그림 대신 짐승 걸음 그림으로 (무기 · 그림자 덧그림 없이)
  const pd0 = G.Player.prototype.draw;
  G.Player.prototype.draw = function (g, cx, cy) { if (this.beast) return this.beast(g, cx, cy); return pd0.apply(this, arguments); };
  const me = () => W().player;
  const says = (c, name) => (t, o) => c.say(me(), t, Object.assign({ name }, o || {}));

  /* ═════════ 1. 첫 한 입 — 천 년 전, 고양이 ═════════ */
  const SH = [];
  SH.push({
    id: 'aurum', title: '첫 한 입', era: '천 년 전 · 색 전쟁이 끝난 밤', region: 'purple', from: 'c5', off: [-9, 12],
    name: '오루', room: 'm_tower', start: [7, 8], dir: 'up', music: 'dream',
    pov: POV('검은 고양이', { kind: 'cat' }),
    intro: async (c) => {
      await c.narr('발이 넷이다. 꼬리가 있다. 바닥이 아주 가깝다.\n막사 안. 촛불 하나. 책상에 금빛 머리의 소년이 엎드려 무언가를 세고 있다.');
      await c.narr('밖에서는 오늘 밤 처음으로 비명이 들리지 않는다. 다섯 부족의 전쟁이 끝났다. 이 소년의 손에서 나온 흰빛이 끝냈다.');
    },
    npcs: [{ key: 'boy', name: '금빛 소년', x: 7, y: 4, dir: 'down', look: G.cast.get('aurum') ? G.cast.get('aurum').look : folk('kid', { hc: '#f0d060' }), talk: async (c, n, st) => {
      if (!st.map || !st.window) {
        const lines = ['…너 또 왔구나. 배고파? 미안, 오늘은 생선이 없어. 다들 춤추느라 저녁을 안 했대.', '창밖 봤어? 하늘에… 아니야. 보지 마. 나만 봤으면 됐어.', '탁자 위 지도 좀 봐 줄래. 고양이도 지도는 볼 줄 알지?'];
        await c.say(n, lines[(st.k = (st.k || 0) + 1) % lines.length], { face: 'normal' });
        return;
      }
      c.lock(true); await c.cinema(true);
      await c.say(n, '…봤구나. 하늘의 눈.', { face: 'sad' });
      await c.say(n, '흰빛을 쓴 순간 저게 떴어. 내 빛이 너무 한곳에 모여서. 저건 모인 빛을 먹으러 와.', { face: 'closed' });
      await c.say(n, '그래서 쪼갤 거야. 다섯으로. 부족마다 하나씩. 다시는 한곳에 모이지 않게. 사람들한텐 여신이 그랬다고 할 거야. 내가 그랬다고 하면 다들 나한테 모아 줄 테니까.', { face: 'normal' });
      await c.say(n, '근데 문제가 하나 있어. …나는 이미 너무 많이 먹었어. 쪼개도, 내 안에 남는 게 있어. 저 눈은 그걸 알아.', { face: 'sad' });
      await c.narr('소년이 고양이를 안아 올린다. 손이 차갑다. 천 년 뒤 누군가가 「배고프다」고 말할 때와 같은 온도.');
      await c.say(n, '이름 하나만 기억해 줄래? 「아우룸」 말고. 그건 사람들이 붙인 거야. 금빛이라고. 엄마는 나를 「오루」라고 불렀어. 작은 금덩이.', { face: 'smile' });
      const k = await c.choice('소년이 대답을 기다린다.', ['「야옹.」 (곁에 있겠다)', '손등을 핥는다', '등을 돌린다 — 가지 마']);
      if (k === 0) await c.say(n, '…고마워. 너는 오래 살 거야. 고양이는 아홉 번 산다며. 나 대신 봐 줘. 사람들이 다시 모으지 않는지.', { face: 'smile' });
      else if (k === 1) await c.say(n, '간지러워. …엄마도 이렇게 했어. 손등에. 「오루, 손이 차구나.」', { face: 'cry' });
      else await c.say(n, '알아. 너도 화났구나. 나도 화났어. 그래도 가야 해. 내가 안 가면 저게 여기로 와.', { face: 'sad' });
      await c.narr('그날 밤 소년은 빛을 다섯으로 쪼갰다. 그리고 하늘로 올라갔다. 고양이는 막사 지붕에서 밤새 하늘을 봤다. 검은 눈이 한 입을 먹는 것을.');
      await c.narr('천 년 뒤, 밤의 나라 정보상은 이 이야기를 팔지 않았다. 아무리 비싸게 불러도.');
      await c.cinema(false);
      await next(c, k, '소년은 「아우룸」이 아니라 「오루」였다.');
    } }],
    spots: [
      { mk: 'map', x: 9, y: 4, verb: '탁자 위 지도를 본다', text: async (c, st) => { st.map = true; await c.narr('다섯 부족의 땅에 다섯 빛깔로 금이 그어져 있다. 금마다 소년의 글씨: 「여기는 초록. 여기는 빨강. 서로 멀리.」\n지도 한가운데, 하늘 쪽에 작은 구멍이 뚫려 있다. 촛불에 그을린 구멍.'); } },
      { mk: 'window', x: 4, y: 2, dy: 6, verb: '창문으로 올라가 하늘을 본다', text: async (c, st) => { st.window = true; c.sfx('rumble'); await c.narr('창틀에 뛰어올랐다. 별 사이로 — 눈 하나. 검은 눈동자가 막사를 보고 있다. 소년을 보고 있다.\n털이 곤두선다. 꼬리가 두 배로 부푼다.'); } },
      { mk: 'box', x: 2, y: 7, verb: '상자 냄새를 맡는다', text: async (c) => { await c.narr('생선 냄새는 없다. 대신 아이 옷 냄새. 작은 망토 하나, 금실로 「오루」라고 수놓았다.'); } },
    ],
    goals: [
      { text: '탁자 위 지도와 창밖 하늘을 살펴보자', targets: ['map', 'window'], done: (st) => st.map && st.window },
      { text: '금빛 소년에게 다가가자', targets: ['boy'] }],
    tdone: { map: (st) => st.map, window: (st) => st.window },
    journal: (k) => ['고양이는 곁에 있겠다고 했다.', '고양이는 소년의 차가운 손등을 핥았다.', '고양이는 가지 말라고 등을 돌렸다.'][k] + ' 소년은 빛을 다섯으로 쪼개고 하늘로 올라가, 흑점의 첫 한 입이 되었다.',
  });

  /* ═════════ 2. 소금 바다의 노래 — 팔백 년 전, 어부의 아이 ═════════ */
  SH.push({
    id: 'maren', title: '소금 바다의 노래', era: '팔백 년 전 · 블루 해안 마을', region: 'blue', from: 'c3', off: [11, 10],
    name: '마렌', room: 'm_sea', start: [7, 8], dir: 'up', music: 'calm',
    pov: POV('어부의 아이 탐', folk('kid', { hc: '#3a2a1a', tc: '#4a7ab8', skin: 'tan' })),
    intro: async (c) => { await c.narr('작은 손. 손바닥에 그물 자국. 소금기가 입술에 말라붙었다.\n오두막 안에서 누나 마렌이 노래를 부른다. 노래가 끝날 때마다 바다 쪽 창이 희미하게 밝아진다.'); },
    npcs: [
      { key: 'maren', name: '마렌', x: 7, y: 3, dir: 'down', look: folk('farmerw', { hc: '#2a3a5a', tc: '#e8f0f8', gender: 'girl', hair: 'long' }), talk: async (c, n, st) => {
        if (!st.net) { await c.say(n, U.pick(['탐, 그물 좀 가져와. 오늘은 고등어가 온대. 노래가 그렇게 말해.', '노래하면 손에서 빛이 나와. 물고기들이 그 빛을 좋아해. 나는 그냥 노래가 좋아서 부르는 건데.']), { face: 'smile' }); return; }
        if (!st.man) { st.talked = true; await c.say(n, '고마워. …창밖에 누가 와. 은빛 단추. 영주님 사람이야. 탐, 문 열지 마.', { face: 'shock' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '「빛 그물」 값이래. 내 빛으로 고기를 모으니까, 고기 값의 반을 빛으로 내래. 빛을 어떻게 반만 내.', { face: 'angry' });
        await c.say(n, '…탐. 바다는 세금을 안 걷잖아. 그치?', { face: 'normal' });
        const say = says(c, '탐');
        const k = await c.choice('누나가 문을 본다. 문 너머 은빛 단추가 기다린다.', ['누나를 통 뒤에 숨긴다', '문을 열고 징수인에게 덤빈다', '아무것도 못 하고 누나 손만 잡는다']);
        if (k === 0) { await say('누나, 여기. 통 뒤. 내가 아무도 없다고 할게.'); await c.say(n, '…탐은 거짓말을 못 하잖아. 귀가 빨개져.', { face: 'smile' }); }
        else if (k === 1) { await say('나가! 우리 누나 노래는 누나 거야!'); await c.narr('은빛 단추의 손등이 탐의 뺨을 쳤다. 바닥이 차갑다. 누나가 탐을 일으켜 세운다.'); await c.say(n, '착한 동생. …바보 같은 동생.', { face: 'cry' }); }
        else { await c.narr('누나 손을 잡았다. 손이 빛났다. 따뜻했다. 탐은 그 따뜻함을 평생 기억한다.'); await c.say(n, '괜찮아. 누나가 정했어.', { face: 'smile' }); }
        await c.narr('그날 밤 마렌은 노래를 부르며 바다로 걸어 들어갔다. 발목, 무릎, 허리. 노래는 끝까지 끊기지 않았다.\n「바다는 세금을 안 걷잖아.」');
        await c.narr('이튿날 아침부터 그 해안에서는 고기가 잡히지 않았다. 대신 밤마다 바다가 희미하게 밝아졌다. 마을 사람들은 그 빛을 「마렌의 그물」이라 불렀다. 팔백 년 동안.');
        await c.narr('…그리고 바다 밑에서, 빛은 조금씩 배가 고파졌다. 노래를 들어 줄 사람이 없어서.');
        await c.cinema(false);
        await next(c, k, '바다를 밝히던 빛은 「마렌」이라는 누나였다.');
      } },
      { key: 'man', name: '은빛 단추의 징수인', x: 11, y: 8, dir: 'left', look: folk('guard', { tc: '#c8c8d8' }), when: null, talk: async (c, n, st) => {
        if (!st.talked) { await c.say(n, '…꼬마. 비켜라. 너랑은 볼일 없다.', { face: 'normal' }); return; }
        st.man = true; await c.say(n, '영주님 명이다. 빛 그물 사용료. 오늘 밤까지. 못 내면 빛으로 받는다. 전부.', { face: 'normal' });
      } },
    ],
    spots: [
      { mk: 'net', x: 12, y: 7, dy: -6, verb: '그물을 챙긴다', text: async (c, st) => { st.net = true; c.sfx('lift'); await c.narr('그물이 무겁다. 어제 누나가 노래로 모은 고기 비늘이 그물코에 별처럼 박혀 있다.'); } },
      { mk: 'sea', x: 4, y: 2, dy: 6, verb: '창밖 바다를 본다', text: async (c) => { await c.narr('바다가 숨을 쉰다. 누나 노래가 끝나면 파도가 한 번 쉬었다가 다시 온다. 바다도 박자를 맞춘다.'); } },
    ],
    goals: [
      { text: '오두막 구석에서 그물을 챙기자', targets: ['net'], done: (st) => st.net },
      { text: '그물을 누나 마렌에게 가져가자', targets: ['maren'], done: (st) => st.talked },
      { text: '문 앞의 은빛 단추 사내에게 가 보자', targets: ['man'], done: (st) => st.man },
      { text: '누나에게 돌아가자', targets: ['maren'] }],
    journal: (k) => ['탐은 누나를 숨기려 했다.', '탐은 징수인에게 덤볐다.', '탐은 누나의 손만 잡았다.'][k] + ' 누나 마렌은 노래를 부르며 바다로 들어갔고, 바다 밑의 빛은 팔백 년 동안 배가 고파졌다.',
  });

  /* ═════════ 3. 모래 위의 별지기 — 사백오십 년 전, 낙타 ═════════ */
  SH.push({
    id: 'saif', title: '모래 위의 별지기', era: '사백오십 년 전 · 모래바다 한가운데', region: 'yellow', from: 'c4', off: [-12, 10],
    name: '사이프', room: 'm_desert', start: [8, 8], dir: 'up', music: 'dream',
    pov: POV('대상의 낙타 느림보', { kind: 'camel' }),
    intro: async (c) => { await c.narr('다리가 길다. 등이 무겁다. 입안에서 무언가를 계속 씹고 있다.\n사람들은 너를 「느림보」라고 부른다. 너는 그 이름이 싫지 않다. 빠른 낙타는 먼저 지친다.'); await c.narr('모닥불 곁에 소년 하나가 별을 보고 앉아 있다. 대상의 별지기. 소년의 손끝에서 작은 빛들이 떠올라 별 사이에 섞인다.'); },
    npcs: [
      { key: 'saif', name: '별지기 소년', x: 8, y: 4, dir: 'down', look: folk('student', { hc: '#1a1a22', tc: '#3a2a6a', skin: 'brown' }), talk: async (c, n, st) => {
        if (!st.torch) { await c.say(n, U.pick(['느림보, 또 씹어? 별 세다가 너 씹는 소리에 숫자 잊어버려.', '저 별 보여? 저건 진짜 별 아니야. 내가 띄운 거야. 쉿.', '별은 세금이 없어. 그래서 나는 별이 되고 싶어.']), { face: 'smile' }); st.talk = true; return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '…횃불. 저건 영주들 징수대야. 렙업 빛을 쫓아온 거야. 내 빛.', { face: 'shock' });
        await c.say(n, '대상 사람들이 다칠 거야. 내가 여기 있으면.', { face: 'sad' });
        const k = await c.choice('소년이 네 목을 끌어안는다. 횃불이 모래 언덕을 넘는다.', ['등에 태우고 달린다', '무릎을 꿇어 소년을 그늘에 숨긴다', '하늘을 보고 크게 운다']);
        if (k === 0) await c.narr('달렸다. 평생 처음으로 빨리. 느림보가 아니었다. 그래도 횃불이 더 빨랐다. 언덕 끝에서 소년이 등에서 내렸다.');
        else if (k === 1) await c.narr('무릎을 꿇었다. 소년이 배 밑 그늘로 기어들었다. 따뜻했다. 횃불이 지나갈 때까지 숨을 참았다. 횃불은 지나가지 않았다.');
        else await c.narr('울었다. 낙타의 울음은 사막 끝까지 간다. 횃불들이 멈칫했다. 그 틈에 소년이 일어섰다.');
        await c.say(n, '느림보. 고마워. 이제 내가 별이 될게. 하늘에는 횃불이 못 와.', { face: 'smile' });
        await c.narr('소년의 몸이 빛으로 풀렸다. 빛은 별 사이로 올라가 별 하나가 되었다. 횃불들이 하늘을 올려다봤다. 아무도 별에 세금을 매기지 못했다.');
        await c.narr('그날부터 모래바다에는 별 하나가 늘 낮게 떴다. 대상들은 그 별을 따라갔다. 길을 잃지 않았다.\n…다만 그 별은 해가 갈수록 조금씩 어두워졌다. 별도 먹어야 빛나는데, 아무도 그 별에게 빛을 나눠 주지 않았으니까.');
        await c.cinema(false);
        await next(c, k, '모래바다의 낮은 별은 「사이프」라는 별지기였다.');
      } },
      { key: 'chief', name: '대상의 우두머리', x: 3, y: 6, dir: 'right', look: folk('merchant', { tc: '#a8703a', skin: 'tan' }), talk: async (c, n, st) => {
        await c.say(n, st.talk ? '그 아이 이름은 사이프다. 별을 띄워 길을 그리지. 우리 대상의 눈이야. …요즘 영주들이 별 보는 아이를 찾는다더군.' : '느림보, 오늘 밤은 별이 많구나. 너도 보이냐? 낙타는 별을 안 본다던데.', { face: 'normal' });
      } },
    ],
    spots: [
      { mk: 'dune', x: 11, y: 2, dy: 6, reach: 20, verb: '모래 언덕 너머를 본다', when: (st) => !!st.talk, text: async (c, st) => { st.torch = true; c.sfx('rumble'); await c.narr('언덕 너머에 불빛 열둘. 흔들리며 다가온다. 횃불이다. 바람에 쇠 냄새가 섞였다.'); } },
      { mk: 'pack', x: 2, y: 3, dy: 6, verb: '짐 냄새를 맡는다', text: async (c) => { await c.narr('대추야자. 소금. 그리고 낡은 별지도 한 장. 지도 귀퉁이에 아이 글씨: 「사이프 — 별을 그리는 아이」.'); } },
    ],
    goals: [
      { text: '모닥불 곁 별지기 소년에게 다가가자', targets: ['saif'], done: (st) => st.talk },
      { text: '바람에 쇠 냄새가 섞였다 — 모래 언덕 너머를 보자', targets: ['dune'], done: (st) => st.torch },
      { text: '소년에게 돌아가자. 횃불이 온다', targets: ['saif'] }],
    journal: (k) => ['낙타는 소년을 태우고 달렸다.', '낙타는 무릎을 꿇어 소년을 숨겼다.', '낙타는 하늘을 보고 울었다.'][k] + ' 별지기 소년 사이프는 별이 되었고, 아무도 빛을 나눠 주지 않은 그 별은 해마다 어두워졌다.',
  });

  /* ═════════ 4. 광맥을 마신 왕 — 612년, 왕의 서기 ═════════ */
  SH.push({
    id: 'silvan', title: '광맥을 마신 왕', era: '612년 봄 · 은빛 왕국', region: 'gray', from: 'c8', off: [10, 11],
    name: '실반', room: 'm_palace', start: [7, 9], dir: 'up', music: 'dread',
    pov: POV('왕의 서기 엘린', folk('scholar', { hc: '#c8c8d8', tc: '#6a6a80' })),
    intro: async (c) => { await c.narr('오른손에 깃펜. 손가락 끝이 은빛 잉크로 물들었다. 너는 왕의 말을 적는 사람이다. 모든 말을.\n서고 가운데 은잔 하나가 놓여 있다. 잔 안에서 빛이 물처럼 출렁인다. 대광맥에서 길어 올린 빛.'); },
    npcs: [
      { key: 'king', name: '은빛 왕', x: 7, y: 4, dir: 'down', look: folk('knight', { hc: '#e8e8f0', tc: '#c8c8e0', cape: '#8a8aa8', beard: '#e8e8f0', age: 'old' }), talk: async (c, n, st) => {
        if (!st.cup || !st.bella) { await c.say(n, U.pick(['엘린. 오늘 일은 적지 마라. …아니, 적어라. 적지 않으면 아무도 믿지 않을 테니.', '과학원이 그릇 후보를 뽑았다. 제2호. 내 딸이다. 벨라.', '잔을 봤나. 왕국 사백 년 치 빛이다. 한 모금이면 하늘이 나를 본다고 하더군.']), { face: 'sad' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '하늘의 검은 눈은 빛이 가장 많이 모인 곳으로 온다. 과학원 예측으로는 내 딸이 그 「가장 많은 곳」이 될 거다. 그릇이 되면.', { face: 'closed' });
        await c.say(n, '그럼 딸보다 더 많은 빛을 가진 자가 있으면 된다. 왕이. 왕이 광맥을 마시면, 눈은 딸 대신 나를 볼 거다.', { face: 'normal' });
        await c.say(n, '엘린. 이건 어떻게 적을 텐가.', { face: 'sad' });
        const k = await c.choice('깃펜 끝에서 은빛 잉크가 떨어진다.', ['「왕이 딸을 위해 광맥을 마셨다.」', '「역병이 돌았다.」 (공식 기록)', '깃펜을 내려놓는다']);
        if (k === 0) await c.say(n, '…그래. 그게 사실이지. 사실은 늘 별로 아름답지 않다.', { face: 'smile' });
        else if (k === 1) await c.say(n, '역병. 좋다. 백성들은 왕을 원망하지 않겠지. 병을 원망하겠지. …그 편이 낫다.', { face: 'closed' });
        else await c.say(n, '적지 않겠다고? 하하. 사백 년 동안 왕의 말을 다 적던 서기가. …고맙구나. 처음으로 나를 왕 말고 아비로 봤어.', { face: 'cry' });
        await c.narr('왕은 은잔을 비웠다. 서고의 등불이 일제히 흔들렸다. 왕의 눈이 은빛으로 차올랐다.\n이튿날 아침, 왕은 말했다. 「배가 고프다.」 사흘째, 하늘에 검은 점이 떴다.');
        await c.narr('공주 벨라는 아버지의 배고픔을 보았다. 사흘 동안, 매일 밤. 아버지의 손을 잡고.');
        await c.narr(k === 1 ? '그해 연대기에는 「역병」이라고 적혔다. 그 글자 위에 누군가 몇 번이나 덧칠했다. 엘린이었다. 평생.' : k === 0 ? '엘린의 기록은 은판에 새겨졌다. 사백 년 뒤 기록 보관소에서 누군가 읽을 때까지 아무도 읽지 않았다.' : '그날 이후 엘린은 아무것도 적지 않았다. 대신 왕의 이름을 외웠다. 매일 밤. 잊히지 않게.');
        await c.cinema(false);
        await next(c, k, '광맥을 마신 왕은 딸의 아버지 「실반」이었다.');
      } },
      { key: 'bella', name: '공주 벨라', x: 3, y: 7, dir: 'right', look: folk('student', { gender: 'girl', hair: 'long', hc: '#e8e8f0', tc: '#8a8ab8' }), talk: async (c, n, st) => {
        st.bella = true;
        await c.say(n, U.pick(['엘린, 아버지가 이상해. 잔을 보면서 내 이름을 불러. 내가 바로 옆에 있는데.', '과학원 언니들이 그러는데, 그릇이 되면 하늘에서 별을 본대. 나는 별보다 아버지 얼굴이 좋아.', '엘린은 아버지 말을 다 적지? 그럼 오늘은 내 말도 적어 줘. 「벨라는 무섭지 않다.」 …거짓말이지만.']), { face: 'normal' });
      } },
    ],
    spots: [
      { mk: 'cup', x: 7, y: 2, dy: 8, verb: '은잔을 들여다본다', text: async (c, st) => { st.cup = true; await c.narr('잔 속 빛이 너를 비춘다. 비친 얼굴이 배부르게 웃고 있다. 너는 웃고 있지 않은데.\n— 거울 연못과 같은 빛이다. 원하지 않는 것을 보여 주는.'); } },
      { mk: 'desk', x: 4, y: 6, dy: -2, reach: 20, verb: '서기의 책상을 본다', text: async (c) => { await c.narr('어제 날짜의 기록. 「왕께서 공주를 안고 오래 우셨다. 기록할 가치 없음.」\n「기록할 가치 없음」에 줄이 그어져 있다. 네 글씨로.'); } },
    ],
    goals: [
      { text: '서고 가운데 은잔을 들여다보고, 공주 벨라의 말을 듣자', targets: ['cup', 'bella'], done: (st) => st.cup && st.bella },
      { text: '왕에게 가자. 기록할 시간이다', targets: ['king'] }],
    tdone: { cup: (st) => st.cup, bella: (st) => st.bella },
    journal: (k) => ['서기는 진실을 적었다.', '서기는 「역병」이라 적고 평생 덧칠했다.', '서기는 깃펜을 내려놓았다.'][k] + ' 은빛 왕 실반은 딸 벨라 대신 하늘의 눈에 보이려고 광맥을 마셨다. 배고픔은 거기서 두 번째 한 입이 되었다.',
  });

  /* ═════════ 5. 흰 수녀원의 겨울 — 이백 년 전, 수련 수녀 ═════════ */
  SH.push({
    id: 'elia', title: '흰 수녀원의 겨울', era: '이백 년 전 · 설원의 수녀원', region: 'white', from: 'c7', off: [-10, 10],
    name: '엘리아', room: 'm_abbey', start: [7, 9], dir: 'up', music: 'white',
    pov: POV('수련 수녀 리네', folk('nun', { hc: '#8a6a4a', tc: '#e8f0f8', age: 'child' })),
    intro: async (c) => { await c.narr('손이 시리다. 열네 살. 수련 수녀. 엄마에게 보내는 편지를 쓰다가 잉크가 얼었다.\n병실에 아이 셋. 그리고 엘리아 수녀님. 수녀님이 손을 대면 아이들 손끝의 투명함이 물러난다.'); },
    npcs: [
      { key: 'elia', name: '엘리아 수녀', x: 7, y: 4, dir: 'down', look: folk('nun', { hc: '#f4f0e8', tc: '#f4f8ff' }), talk: async (c, n, st) => {
        if (!st.letter || !st.child) { await c.say(n, U.pick(['리네, 장작 하나 더. 아이들 발이 차.', '내 손이 왜 차냐고? 아이들 손이 따뜻해지는 만큼 차가워지는 거야. 공평하지.', '편지는 다 썼니? 엄마한테 「춥지 않다」고 쓰렴. 거짓말도 사랑이야.']), { face: 'smile' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '리네. 대성당에서 사람이 왔어. 내 빛을 모아 두면 더 많은 아이를 살릴 수 있대. 얼음 창고에. 「성녀」라는 이름으로.', { face: 'normal' });
        await c.say(n, '나는 가도 될까. 여기 아이들 셋을 두고, 천 명을 위해.', { face: 'sad' });
        const say = says(c, '리네');
        const k = await c.choice('수녀님 손끝이 눈처럼 비친다.', ['「가지 마세요.」', '「가세요. 제가 여기 아이들을 볼게요.」', '대답 대신 수녀님 손을 감싼다']);
        if (k === 0) { await say('가지 마세요. 천 명은 몰라요. 저는 수녀님을 알아요.'); await c.say(n, '…그 말이 듣고 싶었어. 고마워. 그래도 갈 거야.', { face: 'cry' }); }
        else if (k === 1) { await say('가세요. 제가 장작 할게요. 편지도 대신 쓸게요.'); await c.say(n, '리네는 강하구나. …나보다.', { face: 'smile' }); }
        else { await c.narr('수녀님 손을 감쌌다. 차가웠다. 네 손의 온기가 조금 건너갔다. 수녀님이 놀란 얼굴로 너를 봤다.'); await c.say(n, '받기만 해 본 적이 없어서… 이게 이런 거구나.', { face: 'cry' }); }
        await c.narr('엘리아 수녀는 대성당으로 갔다. 첫 「성녀」. 그녀의 빛은 얼음 창고에 모였다. 천 명이 살았다. 그녀는 매일 조금씩 투명해졌다.');
        await c.narr('겨울 끝, 대성당 종이 네 번 울렸다. 리네는 수녀원 창가에서 그 소리를 셌다. 넷.\n…얼음 창고의 빛은 녹지 않았다. 엘리아의 빛은 천 명에게 나눠졌지만, 엘리아에게는 아무도 나눠 주지 않았다.');
        await c.cinema(false);
        await next(c, k, '첫 성녀는 「엘리아」라는 이름의 수녀였다.');
      } },
      { key: 'child', name: '병실 아이', x: 2, y: 5, dir: 'right', state: 'sit', look: folk('kidg', { hc: '#d8d4d0' }), talk: async (c, n, st) => { st.child = true; await c.say(n, U.pick(['리네 언니, 엘리아 수녀님 손이 얼음 같아. 나 때문이야?', '어젯밤에 수녀님이 울었어. 소리 안 내고. 창밖 보면서.']), { face: 'sad' }); } },
    ],
    spots: [
      { mk: 'letter', x: 11, y: 7, dy: -4, verb: '쓰다 만 편지를 읽는다', text: async (c, st) => { st.letter = true; c.sfx('page'); await c.narr('「엄마. 여긴 춥지 않아요. (거짓말이에요.) 엘리아 수녀님은 사람들 아픈 걸 손으로 가져가요. 가져간 아픔은 어디로 가냐고 물었더니, 웃기만 했어요. 엄마, 아픔은 어디로 가요?」'); } },
      { mk: 'win', x: 4, y: 2, dy: 6, verb: '창밖 대성당을 본다', text: async (c) => { await c.narr('눈보라 너머 대성당 종탑. 종이 세 번 울린다. 아침, 낮, 저녁. 네 번째는 아직.'); } },
    ],
    goals: [
      { text: '책상 위 쓰다 만 편지를 읽고, 병실 아이의 말을 듣자', targets: ['letter', 'child'], done: (st) => st.letter && st.child },
      { text: '엘리아 수녀에게 가자', targets: ['elia'] }],
    tdone: { letter: (st) => st.letter, child: (st) => st.child },
    journal: (k) => ['리네는 가지 말라고 했다.', '리네는 가라고, 남은 아이들을 보겠다고 했다.', '리네는 대답 대신 손을 감쌌다.'][k] + ' 엘리아는 첫 성녀가 되어 천 명을 살렸고, 아무도 그녀에게는 빛을 나눠 주지 않았다.',
  });

  /* ═════════ 6. 등불지기의 약속 — 백 년 전, 첫 등불지기 ═════════ */
  SH.push({
    id: 'noeul', title: '등불지기의 약속', era: '백 년 전 · 밤이 처음 내려앉던 거리', region: 'black', from: 'c9', off: [11, -9],
    name: '노을', room: 'm_lamp', start: [8, 9], dir: 'up', music: 'dream', lantern: true,
    pov: POV('첫 등불지기 로웬', folk('nightm', { tc: '#3a3450', trim: '#ffd86a' })),
    intro: async (c) => { await c.narr('손에 장대. 끝에 불씨. 이 거리에 해가 마지막으로 진 지 사흘째.\n벤치에 여자아이가 앉아 있다. 아이 몸이 희미하게 빛난다. 빛을 걷는 사람들이 그 빛을 찾고 있다.'); await c.narr('[s]아이 둘레에 등불 셋을 켜면, 아이 빛이 등불 빛에 섞여 보이지 않는다.[/]'); },
    npcs: [{ key: 'kid', name: '빛나는 아이', x: 8, y: 5, dir: 'down', state: 'sit', look: folk('kidg', { hc: '#ffd8a0', tc: '#ff9a6a' }), talk: async (c, n, st) => {
      const lit = st.lamps || 0;
      if (lit < 3) { await c.say(n, U.pick(['아저씨, 나 숨어야 해? 엄마가 그랬어. 내 빛은 노을 같대서 이름이 노을이야.', '어두우면 무서워. 근데 밝으면 사람들이 와. 어떡해?', '등불 켜는 거 나도 해 볼래. …안 돼? 내가 켜면 내 빛이 들킨대.']), { face: 'normal' }); return; }
      c.lock(true); await c.cinema(true);
      await c.narr('등불 셋 사이에서 아이의 빛이 사라졌다. 거리 끝에서 횃불들이 지나갔다. 아무도 멈추지 않았다.');
      await c.say(n, '…갔어? 아저씨 최고야.', { face: 'smile' });
      await c.say(n, '근데 아저씨, 나 배고파. 빛이 나오기만 하고 안 들어와. 다들 숨기만 해. 아무도 나한테 빛을 안 줘.', { face: 'sad' });
      const say = says(c, '로웬');
      const k = await c.choice('아이가 장대 끝 불씨를 본다.', ['등불을 하나 더 켠다', '아이를 안고 거리를 떠난다', '약속한다 — 매일 밤 등불을 켜겠다고']);
      if (k === 0) { await say('하나 더. 노을이 춥지 않게.'); await c.say(n, '따뜻해. …근데 이건 등불 빛이야. 내 배는 그대로야.', { face: 'sad' }); }
      else if (k === 1) { await say('가자. 해가 뜨는 데로.'); await c.narr('거리 끝까지 걸었다. 거리 끝에도 밤이었다. 그 너머에도. 밤은 그날부터 이 땅 전체에 내려앉았다.'); }
      else { await say('매일 밤 켤게. 네가 어디 있든, 등불 옆이면 안 들키게.'); await c.say(n, '약속이야? …그럼 나도 약속할게. 배고파도 안 울게.', { face: 'smile' }); }
      await c.narr('노을은 밤 속에서 자랐다. 숨는 법은 배웠지만, 나누는 법은 아무도 가르쳐 주지 않았다.');
      await c.cinema(false);
      await next(c, k, '밤 속에 숨겨졌던 아이는 「노을」이었다.');
    } }],
    spots: [
      { mk: 'l1', x: 5, y: 5, dy: -2, verb: '등불을 켠다', when: (st) => !st.l1, text: async (c, st) => { st.l1 = true; st.lamps = (st.lamps || 0) + 1; c.sfx('lamp'); G.fx.glow(W().player.x, W().player.y - 12, '#ffd86a', 14); if (W().map) (W().map.lights = W().map.lights || []).push({ x: px(5), y: py(5) - 14, r: 46, warm: 'rgba(255,200,110,0.35)' }); await c.narr('등불 하나. 아이 왼쪽에 노란 원이 생겼다. (' + st.lamps + ' / 3)'); } },
      { mk: 'l2', x: 11, y: 5, dy: -2, verb: '등불을 켠다', when: (st) => !st.l2, text: async (c, st) => { st.l2 = true; st.lamps = (st.lamps || 0) + 1; c.sfx('lamp'); if (W().map) (W().map.lights = W().map.lights || []).push({ x: px(11), y: py(5) - 14, r: 46, warm: 'rgba(255,200,110,0.35)' }); await c.narr('등불 하나 더. 아이 오른쪽. (' + st.lamps + ' / 3)'); } },
      { mk: 'l3', x: 8, y: 2, dy: 6, verb: '등불을 켠다', when: (st) => !st.l3, text: async (c, st) => { st.l3 = true; st.lamps = (st.lamps || 0) + 1; c.sfx('lamp'); if (W().map) (W().map.lights = W().map.lights || []).push({ x: px(8), y: py(2) - 4, r: 50, warm: 'rgba(255,200,110,0.35)' }); await c.narr('마지막 등불. 아이 뒤. 세 빛이 아이를 감쌌다. (' + st.lamps + ' / 3)'); } },
    ],
    goals: [
      { text: '아이 둘레에 등불 셋을 켜자', targets: ['l1', 'l2', 'l3'], done: (st) => (st.lamps || 0) >= 3, prog: (st) => (st.lamps || 0) + ' / 3' },
      { text: '빛나는 아이에게 가자', targets: ['kid'] }],
    tdone: { l1: (st) => st.l1, l2: (st) => st.l2, l3: (st) => st.l3 },
    journal: (k) => ['로웬은 등불을 하나 더 켰다.', '로웬은 아이를 안고 거리를 떠났다. 밤은 그날부터 땅 전체에 내려앉았다.', '로웬은 매일 밤 등불을 켜겠다고 약속했다.'][k] + ' 숨는 법만 배운 아이 노을은 열여섯에 하늘로 올라갔다.',
  });

  /* ═════════ 7. 허용 손실 — 983년 봄, 젊은 서기 ═════════ */
  SH.push({
    id: 'loss', title: '허용 손실', era: '983년 봄 · 천년성 지하', region: 'rainbow', from: 'c6', off: [-11, 11],
    name: '이천삼백열두 사람', room: 'm_office', start: [7, 8], dir: 'up', music: 'dread',
    pov: POV('젊은 서기 오스본', folk('scholar', { hc: '#6a4a2a', tc: '#5a5a7a' })),
    intro: async (c) => { await c.narr('스물두 살. 기사단 회계실 서기. 첫 출근 석 달째.\n오늘 새 장부의 첫 장을 짠다. 탑이 대륙의 빛을 걷기 시작하면, 걷다가 생기는 「손실」을 적을 칸이 필요하다.'); },
    npcs: [
      { key: 'regina', name: '서기 레지나', x: 11, y: 5, dir: 'left', look: folk('nun', { hat: null, hc: '#4a3a2a', tc: '#5a5a7a' }), talk: async (c, n, st) => { st.reg = true; await c.say(n, U.pick(['오스본, 칸 이름은 정했어? 위에서 「깔끔하게」 지으래. 읽는 사람이 놀라지 않게.', '나는 손수건을 가져왔어. 장부 쓰다 울면 글씨가 번지잖아. …농담이야. 반만.']), { face: 'normal' }); } },
      { key: 'graus', name: '견습 기사 그라우스', x: 3, y: 5, dir: 'right', look: folk('knight', { hc: '#3a3448', tc: '#5a5a7a' }), talk: async (c, n, st) => { st.graus = true; await c.say(n, U.pick(['하나, 둘, 셋… 이번 기수 동기들 이름을 세는 중이야. 마흔하나. 다 외웠어. 숫자로 세면 아무도 안 빠지거든.', '난 숫자가 좋아. 숫자는 누굴 미워하지 않아. 공평하잖아.']), { face: 'smile' }); } },
      { key: 'kairon', name: '그림자 속의 사내', x: 7, y: 3, dir: 'down', look: G.cast.get('kairon') ? G.cast.get('kairon').look : folk('knight'), talk: async (c, n, st) => {
        if (!st.desk) { await c.say(n, '…장부부터 짜라. 이야기는 그다음이다.', { face: 'normal' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '칸 이름을 봤다.', { face: 'normal' });
        await c.say(n, st.col === 2 ? '…뒷장에 이름을 적었군. 지우라고는 하지 않겠다. 하지만 아무도 그 장은 읽지 않을 거다.' : st.col === 1 ? '「빌린 빛」. 갚을 생각이 있다는 뜻이군. 좋은 이름이다. 위에서는 바꾸겠지만.' : '「허용 손실」. 정확하군. 읽는 사람이 놀라지 않을 거다.', { face: 'closed' });
        await c.say(n, '이 칸에 이천삼백열두 명이 들어간다. 계산은 끝났다. 흑점이 오면 대륙 전체가 들어간다. 그보다는 적다.', { face: 'normal' });
        await c.say(n, '…적는 손이 떨리면, 떨려도 적어라. 떨리지 않는 손으로 적는 건 더 나쁘다.', { face: 'sad' });
        await c.narr('그 사내는 그날 이후 십육 년 동안 회계실에 오지 않았다. 장부는 매달 그의 책상으로 올라갔다. 이천삼백열두 칸이 다 찰 때까지.');
        await c.narr('…그 사람들은 그릇이 아니었다. 그냥 빛을 조금 더 낸 사람들이었다. 흑점 속에서 그들은 하나의 목소리가 되었다. 「허용 손실」이라는 이름이 싫다고 말하는.');
        await c.cinema(false);
        await next(c, st.col || 0, '흑점 속 수많은 목소리는 「이천삼백열두 사람」이었다. 숫자가 아니라.');
      } },
    ],
    spots: [
      { mk: 'ledger', x: 7, y: 5, dy: -3, verb: '장부의 첫 장을 짠다', when: (st) => !st.desk, text: async (c, st) => {
        c.sfx('page');
        await c.narr('빈 장부. 첫 줄에 칸 이름을 적어야 한다. 빛을 걷다가 사람이 쓰러지면 적을 칸.');
        const k = await c.choice('칸 이름을 적는다.', ['「허용 손실」', '「빌린 빛」', '칸 이름 대신, 뒷장에 이름을 적을 자리를 만든다']);
        st.col = k; st.desk = true;
        await c.narr(['깔끔한 글씨. 읽는 사람이 놀라지 않을 이름.', '「빌린 빛」. 언젠가 돌려줄 수 있을 것처럼 들린다.', '앞장에는 아무 이름도 적지 않았다. 뒷장 맨 위에 작게: 「여기 적히는 사람들의 이름」.'][k]);
      } },
    ],
    goals: [
      { text: '책상에서 장부의 첫 장을 짜자', targets: ['ledger'], done: (st) => st.desk },
      { text: '그림자 속의 사내에게 장부를 보이자', targets: ['kairon'] }],
    journal: (k) => ['젊은 오스본은 칸 이름을 「허용 손실」이라 지었다.', '젊은 오스본은 칸 이름을 「빌린 빛」이라 지었다.', '젊은 오스본은 장부 뒷장에 이름을 적을 자리를 만들었다.'][k] + ' 983년 봄, 이천삼백열두 사람의 빛이 그 칸에 들어갔다.',
  });

  /* ═════════ 들판의 조각 ═════════ */
  class Shard extends G.props.Spot {
    draw(g, cx, cy) {
      if (!this.canUse(W().player)) return;   // 아직 때가 아니거나 · 이미 녹은 조각은 보이지 않는다 (예전엔 보이는데 만져지지 않았다)
      const t = W().t, x = Math.round(this.x - cx), y = Math.round(this.y - cy - 8 + Math.sin(t * 2 + this.x) * 1.5);
      g.globalAlpha = 0.25 + Math.sin(t * 3) * 0.08; g.fillStyle = '#7a3ab8'; g.beginPath(); g.ellipse(x, y + 8, 9, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      g.fillStyle = '#0b0614'; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 5, y - 1); g.lineTo(x + 2, y + 6); g.lineTo(x - 4, y + 3); g.lineTo(x - 5, y - 3); g.closePath(); g.fill();
      g.fillStyle = '#5a3a8a'; g.fillRect(x - 1, y - 6, 1, 6); g.fillStyle = '#c8a8ff'; g.fillRect(x + 1, y - 4, 1, 2);
      if (Math.random() < 0.06) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y, z: 10, vz: 10, g: 0, life: 0.8, col: '#b87aff', size: 1, glow: true });
    }
  }
  const SPOT = {};
  function placeAll(m) {
    let A = null; try { A = G.sanity && G.sanity.fresh(m); } catch (e) { A = null; }
    const good = (x, y) => { if (!A) return true; const i = m.i(x, y), c0 = A.L.comp[i]; return c0 >= 0 && !!A.good[c0]; };
    for (const sh of SH) {
      const t = OW.towns[sh.region]; if (!t || !t.plaza) continue;
      const q = OW.near(m, t.plaza.x + sh.off[0], t.plaza.y + sh.off[1], (x, y, ter) => ter !== T.ROAD && good(x, y), 14);
      SPOT[sh.id] = q;
    }
  }
  ST.onMap('world', (m, Wd) => {
    if (!Object.keys(SPOT).length) placeAll(m);
    for (const sh of SH) {
      const q = SPOT[sh.id]; if (!q) continue;
      Wd.add(new Shard({ x: px(q[0]), y: py(q[1]), reach: 18, verb: '검은 조각을 만진다', when: () => ST.after(sh.from) && !f('shard:' + sh.id) && !MEM.cur, text: async (c) => {
        const pr = S().shardProg && S().shardProg[sh.id], n = actsOf(sh).length;
        if (pr && pr.ai > 0 && pr.ai < n) {
          const k = await c.choice('검은 유리 조각. 아까 보다 만 기억이 아직 따뜻하다. (' + n + '장면 중 ' + pr.ai + '장면까지 보았다)', [ORD[pr.ai] + ' 장면부터 이어서 본다', '처음부터 다시 본다', '그만둔다']);
          if (k === 2) return;
          if (k === 1) delete S().shardProg[sh.id];
          await enter(c, sh, k === 0 ? pr.ai : 0);
          return;
        }
        const k = await c.choice('검은 유리 조각. 흑점에서 떨어진 것 같다. 가까이 가면 누군가의 숨소리가 들린다.' + (n > 1 ? ' [s](장면 ' + n + '개로 이어진 기억)[/]' : ''), ['만진다', '그만둔다']);
        if (k !== 0) return;
        await enter(c, sh);
      } }));
    }
  });
  /* ── 부탁 「검은 조각」: 토리아가 처음 알아챈 뒤부터. 남은 조각이 어느 마을 어느 쪽 들판에 있는지 ── */
  const DIR8 = (dx, dy) => { const a = Math.atan2(dy, dx) * 180 / Math.PI; const k = Math.round(((a + 360) % 360) / 45) % 8; return ['동', '남동', '남', '남서', '서', '북서', '북', '북동'][k]; };
  const avail = (sh) => ST.after(sh.from) && (!ST.regionOpen || ST.regionOpen(sh.region)) && !f('shard:' + sh.id);
  G.data.QUESTS.shards = { id: 'shards', name: '검은 조각', who: '토리아',
    desc: (s) => {
      const got = Object.keys(s.shards || {}).length, left = SH.filter(avail);
      const where = left.map((sh) => (OW.SHORT && OW.SHORT[sh.region] || sh.region) + ' 마을 ' + DIR8(sh.off[0], sh.off[1]) + '쪽 들판').join(' · ');
      return '흑점에서 떨어진 검은 유리 조각. 만지면 누군가의 기억 속을 걷는다. (이름 ' + got + ' / 7)' + (where ? ' 숨소리가 들리는 곳: ' + where + ' — 지도에 ◆ 보라색으로 표시된다.' : got < 7 ? ' 다른 조각은 이야기가 더 흘러가야 나타난다.' : '');
    },
    after: '흑점 속 목소리 일곱에 모두 이름이 붙었다.' };
  ST.onTick.push(() => {
    const s = S(); if (!s || !s.quests) return;
    const q = s.quests.shards, n = Object.keys(s.shards || {}).length;
    if (!q && (s.flags.shard_hint || n > 0)) s.quests.shards = { st: 'on' };
    else if (q && q.st === 'on' && n >= 7) q.st = 'done';
  });
  const mx0 = ST.mapExtras;
  ST.mapExtras = function (cv, SCm) {
    if (mx0) mx0(cv, SCm);
    const s = S(); if (!s.quests || !s.quests.shards) return;
    const g = cv.getContext('2d');
    for (const sh of SH) {
      const q = SPOT[sh.id]; if (!q || !avail(sh)) continue;
      const x = q[0] * SCm, y = q[1] * SCm;
      g.fillStyle = '#0a0812'; g.beginPath(); g.moveTo(x, y - 5); g.lineTo(x + 5, y); g.lineTo(x, y + 5); g.lineTo(x - 5, y); g.closePath(); g.fill();
      g.fillStyle = '#b87aff'; g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y + 3); g.lineTo(x - 3, y); g.closePath(); g.fill();
    }
  };
  ST.SHARDS = SH;
  // 장면을 덧붙이는 파일(56b_memacts)이 쓰는 도구
  ST.memKit = { room, field, next, says, POV, me, folk, px, py, MEM, actsOf, addNpc };
  // 처음 조각을 볼 만한 때에 토리아가 알려 준다 (6장 이후, 아직 하나도 안 만졌으면)
  ST.onTick && ST.onTick.push(() => {
    const s = S(); if (!s || s.flags.shard_hint || !ST.after('c4') || G.script.running || MEM.cur) return;
    const Wd = W(), m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p) return;
    for (const sh of SH) { const q = SPOT[sh.id]; if (!q || !ST.after(sh.from) || s.flags['shard:' + sh.id]) continue; if (Math.abs(p.x - px(q[0])) < 140 && Math.abs(p.y - py(q[1])) < 100) { s.flags.shard_hint = true; G.script.run(async (c) => { await c.say('toria', '찍…? 저기 까만 거 봐. 유리 조각 같은데… 배고픈 냄새가 나. 흑점 냄새야.', { face: 'shock' }); c.journal('들판에서 검은 유리 조각을 보았다. 흑점에서 떨어진 것 같다. 대륙 곳곳에 있을지도 모른다.'); }); return; } }
  });
})();
