/* 새 던전 넷 — 저마다 다른 종류
   d12 메아리 협곡 (단풍 협곡): 하늘이 뚫린 협곡 미로. 층층 바위턱 · 수정을 쳐서 여는 문 · 메아리 거인
   d13 가라앉은 사원 (안개 늪): 물에 잠긴 사원. 깊은 물 · 얼음 발판 · 발판 퍼즐 · 늪의 여왕
   d14 시련의 탑 (안개 늪 북쪽): 다섯 층을 올라가며 몰려오는 적을 버티는 도전의 탑. 전설 장비
   d15 잊힌 묘지 (단풍 협곡 서쪽, 숨겨진 입구): 폭탄으로만 열리는 벽 너머 칠흑의 묘지. 등불 · 거울 · 잊힌 왕
   그리고 지역마다 숨은 동굴 — 덤불 뒤 · 금 간 바위 · 열기 · 물 · 모래 · 어둠. 등급 높은 장비가 잠들어 있다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles, O = G.objs.O;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;

  /* ───────── 변종 보스 ───────── */
  const BV = G.bosses.variant;
  BV('echogiant', 'frost', { name: '메아리 거인', title: '메아리 협곡 · 메아리 거인', hp: 240, atk: 7, col: '#e8903a', tint: '#ff9a4a', tintA: 0.45, weak: ['light', 'bomb'], resist: ['ice'], exp: 420, gold: 260 });
  BV('swampqueen', 'thornqueen', { name: '늪의 여왕', title: '가라앉은 사원 · 늪의 여왕', hp: 230, atk: 6, col: '#4ab88a', tint: '#3ec8a0', tintA: 0.45, exp: 460, gold: 280 });
  BV('trialshade', 'mirror', { name: '시련의 그림자', title: '시련의 탑 꼭대기 · 시련의 그림자', hp: 300, atk: 8, exp: 700, gold: 500 });
  BV('forgotking', 'hollowking', { name: '잊힌 왕', title: '잊힌 묘지 · 이름을 잃은 왕', hp: 320, atk: 8, col: '#b08aff', tint: '#8a5ad8', tintA: 0.5, exp: 760, gold: 520 });

  /* ───────── 입구 ───────── */
  const GATE = { d12: OW.pt(226, 270), d13: OW.pt(366, 157), d14: OW.pt(350, 46), d15: OW.pt(80, 280) };
  OW.hooks.push((m) => {
    ST.cave(m, { x: GATE.d12.x, y: GATE.d12.y, id: 'd12_gate', to: 'd12', col: '#a85a3a', rx: 8, ry: 4, h: 2 });
    OW.clear(m, GATE.d13.x - 1, GATE.d13.y - 1, 9, 5, m.hgt[m.i(GATE.d13.x, GATE.d13.y + 2)], null);
    G.build.placeBuilding(m, { special: 'temple', tx: GATE.d13.x, ty: GATE.d13.y, w: 7, h: 2, col: '#5a7a6e', glyph: '#9ae8c8', to: 'd13', id: 'd13_gate' });
    OW.clear(m, GATE.d14.x - 2, GATE.d14.y - 2, 7, 6, m.hgt[m.i(GATE.d14.x, GATE.d14.y + 2)], null);
    G.build.placeBuilding(m, { special: 'tower', tx: GATE.d14.x, ty: GATE.d14.y, w: 3, h: 2, col: '#6a4ab8', to: 'd14', id: 'd14_gate', cond: () => S().lv >= 28, msg: '탑 문에 새겨진 글씨: 「스물여덟 번의 렙업을 견딘 자만 오르라.」 (Lv 28 필요)' });
    ST.cave(m, { x: GATE.d15.x, y: GATE.d15.y, id: 'd15_gate', to: 'd15', col: '#4a3a5a', rx: 6, ry: 3, cond: () => f('secret:d15'), msg: '금 간 바위가 입구를 막고 있다. 안에서 찬 바람이 샌다.' });
    for (const [dx, dy] of [[-4, 3], [5, 3], [-3, 5], [4, 6], [-6, 6]]) { const i = m.i(GATE.d15.x + dx, GATE.d15.y + dy); if (!m.solidExtra[i]) m.obj[i] = O.GRAVE; }
  });
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Sign({ x: px(GATE.d12.x - 2), y: py(GATE.d12.y + 3), text: '메아리 협곡\n「대답하지 마시오. 협곡이 대신 대답하오.」 — 메아리 암자' }));
    Wd.add(new P.Sign({ x: px(GATE.d14.x - 2), y: py(GATE.d14.y + 3), text: '시련의 탑\n옛 징수탑을 뒤집어 세운 탑. 층마다 쌓인 빛이 사람을 시험한다.\n「꼭대기의 그림자는 너를 닮았다」' }));
    // 잊힌 묘지: 폭탄으로 여는 벽
    if (!f('secret:d15')) { const cr = new P.Crack({ x: px(GATE.d15.x) + 8, y: py(GATE.d15.y) + 2 }); cr.onOpen = () => { S().flags['secret:d15'] = true; G.ui.toast('숨은 입구가 열렸다', 'gold'); }; Wd.add(cr); }
  });

  const def = (id, D) => G.dungeon.def(id, D);
  const portalOut = (id, m, r, to) => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: to[0], toy: to[1] });
  function bossEnd(id, back, after) {
    return function (m, Wd) {
      const bk = Object.keys(m.rooms).find((k) => m.rooms[k].R.boss); if (!bk) return;
      const r = m.rooms[bk], boss = Wd.ents.find((e) => e.boss);
      if (f(id + ':boss')) { if (boss) boss.dead = true; Wd.add(portalOut(id, m, r, back)); return; }
      if (!boss) return;
      boss.onDieFn = () => G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f(id + ':heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 7) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: id + ':heart' }));
        G.world.add(portalOut(id, m, r, back));
        if (after) await after(c);
      });
    };
  }

  /* ───────── d12 메아리 협곡 ───────── */
  def('d12', {
    name: '메아리 협곡', sub: '단풍 협곡 동쪽 굴', pal: 'amber', music: 'yellow', tier: 4, floor: T.DRY, wall: 'sand', shape: 'cave', ambient: 'dust', decor: [O.ROCK, O.PEBBLE, O.DEAD, O.RUBBLE], decorRate: 0.1,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: GATE.d12.x, ty: GATE.d12.y + 2 },
    floors: { '1,3': '협곡 어귀', '0,2': '메아리 벼랑', '1,2': '메아리 벼랑', '2,2': '메아리 벼랑', '0,1': '바위 턱', '1,1': '바위 턱', '2,1': '바위 턱', '1,0': '거인의 골' },
    rooms: {
      '1,3': { props: [['sign', 13, 10, { text: '바위에 새긴 글씨.\n「소리 내지 마라. 협곡이 네 목소리를 배운다.」\n그 아래 작은 글씨: 「눈을 쏘면 벼랑이 대답한다.」' }], ['pot', 3, 10], ['pot', 16, 10], ['torch', 4, 3, { lit: true }], ['torch', 15, 3, { lit: true }]], ter: [['h', 2, 2, 5, 4, 1], ['h', 13, 2, 5, 4, 1]], foes: [['wolf', 6, 7], ['wolf', 13, 7]] },
      '1,2': { solve: { type: 'clear' }, ter: [['pit', 8, 5, 4, 3]], props: [['torch', 3, 3], ['torch', 16, 3]], foes: [['bandit', 4, 5], ['bandit', 15, 5], ['wolf', 9, 10]] },
      '0,2': { ter: [['h', 2, 2, 7, 5, 1], ['h', 2, 7, 4, 5, 2]], stairs: [[5, 2, 2], [3, 7, 2]], props: [['eye', 4, 9, { sets: 'd12:c1' }], ['chest', 7, 3, { item: 'key_small' }], ['torch', 17, 3]], foes: [['golem', 13, 8]] },
      '2,2': { ter: [['pit', 3, 4, 3, 7], ['pit', 14, 4, 3, 7]], props: [['post', 9, 3], ['chest', 9, 10, { item: 'map_d' }], ['eye', 16, 11, { sets: 'd12:c2' }]], foes: [['bat', 6, 6], ['bat', 13, 6], ['worm', 9, 7]] },
      '1,1': { solve: { type: 'clear' }, ter: [['h', 7, 4, 6, 5, 1]], stairs: [[9, 4, 2]], props: [['chest', 9, 5, { item: 'key_big', big: true }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]], foes: [['golem', 5, 9], ['golem', 14, 9]] },
      '0,1': { props: [['chest', 9, 6, { item: 'heartpiece' }], ['spot', 4, 4, { verb: '벽의 긁힌 자국을 본다', text: '벽에 가득한 손톱자국. 세어 보니 날짜다. 삼 년. 누군가 여기서 거인을 기다렸다.\n맨 아래 이름: 「로완」.' }]], foes: [['boar', 9, 9], ['boar', 14, 6]] },
      '2,1': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'bombs5' }], ['chest', 12, 6, { item: 'arrows10' }]], foes: [['bandit', 5, 8], ['bomber', 14, 8]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'echogiant' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd12:c1'], ['1,1', '0,1', 'bomb'], ['1,1', '2,1', 'switch', 'd12:c2'], ['1,1', '1,0', 'big']],
    ents: bossEnd('d12', [GATE.d12.x, GATE.d12.y + 3], async (c) => {
      c.lock(true); await c.cinema(true);
      await c.narr('거인이 무너지며 마지막 소리를 냈다. 그것은 비명이 아니었다. 협곡이 삼 년 동안 배운 모든 목소리가, 한꺼번에, 「고마워」라고 했다.');
      await c.getItem('art_meteor');
      await c.cinema(false); c.lock(false);
    }),
  });

  /* ───────── d13 가라앉은 사원 ───────── */
  def('d13', {
    name: '가라앉은 사원', sub: '안개 늪 호수 아래', pal: 'mist', music: 'hollow', tier: 6, floor: T.WETSTONE, wall: 'rock', shape: 'round', ambient: 'bubbles', decor: [O.REED, O.CORAL, O.PEBBLE, O.LILY], decorRate: 0.1, dark: 0.4,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: GATE.d13.x + 3, ty: GATE.d13.y + 3 },
    floors: { '1,3': '물에 잠긴 회랑', '0,2': '지하 1층', '1,2': '지하 1층', '2,2': '지하 1층', '0,1': '지하 2층', '1,1': '지하 2층', '2,1': '지하 2층', '1,0': '여왕의 연못' },
    pos: { '1,3': [1, 0], '0,2': [0, 2], '1,2': [1, 2], '2,2': [2, 2], '0,1': [0, 4], '1,1': [1, 4], '2,1': [2, 4], '1,0': [1, 6] },
    rooms: {
      '1,3': { ter: [['water', 2, 3, 16, 2], ['deep', 6, 6, 8, 3]], props: [['sign', 4, 10, { text: '돌판의 글씨는 반쯤 지워졌다.\n「…물에 잠긴 것은 잊히지 않는다. 다만 젖을 뿐…」' }], ['torch', 3, 11], ['torch', 16, 11]], foes: [['octo', 9, 7], ['octo', 12, 3]] },
      '1,2': { solve: { type: 'plates', flag: 'd13:plates', msg: '물이 빠지는 소리가 났다' }, ter: [['deep', 2, 5, 4, 5], ['deep', 14, 5, 4, 5]], props: [['plate', 7, 5], ['plate', 12, 5], ['plate', 9, 10], ['block', 9, 7], ['block', 5, 3]], foes: [['plant', 3, 3], ['plant', 16, 3]] },
      '0,2': { ter: [['deep', 3, 3, 14, 3]], props: [['chest', 9, 10, { item: 'key_small' }], ['post', 4, 8], ['post', 15, 8]], foes: [['ghost', 6, 9], ['ghost', 13, 9]] },
      '2,2': { props: [['torch', 4, 4], ['torch', 15, 4], ['torch', 4, 10], ['torch', 15, 10], ['chest', 9, 7, { item: 'compass' }]], solve: { type: 'torches', msg: '네 등잔에 불이 붙자 벽이 물러났다' }, foes: [['bug', 9, 4], ['bug', 11, 10]] },
      '1,1': { solve: { type: 'clear' }, ter: [['water', 2, 2, 16, 11], ['stone', 7, 5, 6, 4]], props: [['chest', 9, 6, { item: 'key_big', big: true, hidden: true }]], foes: [['octo', 4, 4], ['octo', 15, 4], ['bigslime', 9, 10]] },
      '0,1': { props: [['chest', 6, 6, { item: 'lamp_morgan' }], ['spot', 13, 6, { verb: '물에 잠긴 벽화를 본다', text: '벽화: 배 한 척. 노 젓는 늙은이. 배에 탄 여인의 배가 불룩하다. 여인의 손끝에서 흰 빛이 물에 떨어진다. 떨어진 자리마다 백합이 피었다.' }]], foes: [['ghost', 9, 9]] },
      '2,1': { ter: [['deep', 2, 2, 16, 11], ['stone', 8, 6, 4, 3]], props: [['chest', 9, 6, { item: 'heartpiece' }]], foes: [['octo', 5, 5], ['octo', 14, 9]] },
      '1,0': { boss: true, ter: [['water', 2, 9, 16, 4]], props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['boss', 9, 5, { type: 'swampqueen' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd13:plates'], ['1,1', '0,1', 'open'], ['1,1', '2,1', 'bomb'], ['1,1', '1,0', 'big']],
    ents: bossEnd('d13', [GATE.d13.x + 3, GATE.d13.y + 3], async (c) => {
      c.lock(true); await c.cinema(true);
      await c.narr('여왕의 덩굴이 물속으로 풀려 내려갔다. 그 아래, 가라앉은 징수탑의 꼭대기가 드러났다. 탑 안에서 누군가의 빛이 아직 깜박이고 있었다. 30년 된 빛. 아이 하나 몫.');
      await c.say('toria', '…찍. 이거, 유나 동생 거야. 탑이 아직도 안고 있었어.', { face: 'sad' });
      await c.getItem('ac_phoenix');
      await c.cinema(false); c.lock(false);
    }),
  });

  /* ───────── d14 시련의 탑: 다섯 층, 층마다 몰려오는 적 ───────── */
  let W14n = 0;
  const W14 = (list) => ({ solve: { type: 'clear', flag: 'd14:f' + (++W14n), msg: W14n + '층을 버텼다 — 위층 계단이 열렸다' }, respawn: false, foes: list, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }]] });
  def('d14', {
    name: '시련의 탑', sub: '뒤집어 세운 징수탑', pal: 'purple', music: 'boss', tier: 8, floor: T.MIRROR, wall: 'castle', shape: 'round', ambient: 'motes', sconce: 'rgba(200,160,255,0.24)',
    start: ['0,5', 9, 11],
    exit: { at: ['0,5', 9, 13], to: 'world', tx: GATE.d14.x + 1, ty: GATE.d14.y + 3 },
    pos: { '0,5': [0, 8], '0,4': [0, 6], '0,3': [0, 4], '0,2': [0, 2], '0,1': [0, 0] },
    floors: { '0,5': '1층 — 늑대와 도적', '0,4': '2층 — 기사와 마도사', '0,3': '3층 — 돌과 빈 갑옷', '0,2': '4층 — 그림자', '0,1': '꼭대기 — 시련의 그림자' },
    rooms: {
      '0,5': Object.assign(W14([['wolf', 5, 5], ['wolf', 14, 5], ['bandit', 9, 4], ['bandit', 4, 9], ['wolf', 15, 9]]), {}),
      '0,4': Object.assign(W14([['knight', 6, 5], ['knight', 13, 5], ['mage', 9, 3], ['mage', 4, 9], ['archer', 15, 9]].filter((x) => G.foes.T[x[0]])), {}),
      '0,3': Object.assign(W14([['golem', 6, 6], ['hollow', 13, 5], ['hollow', 5, 10], ['golem', 14, 10]]), { props: [['chest', 9, 7, { item: 'sh_aegis', big: false, hiddenUntil: 'd14:f3' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]] }),
      '0,2': Object.assign(W14([['shade', 5, 5], ['shade', 14, 5], ['ghost', 9, 3], ['drone', 4, 10], ['drone', 15, 10], ['shade', 9, 10]]), {}),
      '0,1': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'trialshade' }]] },
    },
    doors: [['0,5', '0,4', 'switch', 'd14:f1'], ['0,4', '0,3', 'switch', 'd14:f2'], ['0,3', '0,2', 'switch', 'd14:f3'], ['0,2', '0,1', 'switch', 'd14:f4']],
    ents(m, Wd) {
      bossEnd('d14', [GATE.d14.x + 1, GATE.d14.y + 3], async (c) => {
        c.lock(true); await c.cinema(true); c.music('dream');
        await c.narr('그림자가 무릎을 꿇었다. 네 얼굴을 하고 있었다. 입을 열었다. 네 목소리였다.');
        await c.narr('[r]「잘했어. 이제 너는 더 많이 가질 수 있어. 더 강해질 수 있어. …그게 그 사람이 한 일이야.」[/]');
        await c.say('toria', '…찍. 저 그림자, 카이론 말투야.', { face: 'shock' });
        await c.getItem('sw_dawn');
        await c.getItem('art_dance');
        await c.cinema(false); c.lock(false);
      })(m, Wd);
    },
  });

  /* ───────── d15 잊힌 묘지 ───────── */
  def('d15', {
    name: '잊힌 묘지', sub: '장부에서 지워진 사람들', pal: 'black', music: 'dread', tier: 8, floor: T.STONE, wall: 'castle', shape: 'cave', ambient: 'motes', dark: 0.9, darkCol: 'rgba(6,4,12,1)', decor: [O.GRAVE, O.BONES, O.GRAVE, O.RUBBLE], decorRate: 0.12,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: GATE.d15.x, ty: GATE.d15.y + 2 },
    floors: { '1,3': '묘지 입구', '0,2': '이름 없는 무덤', '1,2': '이름 없는 무덤', '2,2': '이름 없는 무덤', '0,1': '지워진 장부', '1,1': '지워진 장부', '1,0': '잊힌 왕의 방' },
    rooms: {
      '1,3': { props: [['torch', 4, 4], ['torch', 15, 4], ['sign', 9, 9, { text: '묘비들에 이름이 없다. 대신 숫자가 적혀 있다.\n「허용 손실 #4,112」 「허용 손실 #4,113」 …' }]], foes: [['bat', 6, 6], ['bat', 13, 6]] },
      '1,2': { solve: { type: 'torches', flag: 'd15:torch', msg: '등잔이 모두 켜지자 무덤 하나가 열렸다' }, props: [['torch', 3, 3], ['torch', 16, 3], ['torch', 3, 11], ['torch', 16, 11]], foes: [['ghost', 9, 7], ['hollow', 5, 6]] },
      '0,2': { props: [['veil', 18, 7, { cells: [[18, 6], [18, 7], [18, 8], [19, 6], [19, 7], [19, 8]] }], ['veil', 9, 1, { cells: [[9, -1], [10, -1], [9, 0], [10, 0], [9, 1], [10, 1]] }], ['chest', 5, 7, { item: 'key_small' }]], foes: [['ghost', 10, 5], ['ghost', 10, 9]] },
      '2,2': { props: [['chest', 9, 7, { item: 'tome_meteor' }], ['spot', 4, 4, { verb: '무덤을 들여다본다', text: '작은 무덤. 숫자 대신 이름이 긁혀 있다. 「유안」. 누군가 몰래 새겨 넣었다.' }]], foes: [['hollow', 6, 9], ['hollow', 13, 9], ['shade', 9, 5]] },
      '1,1': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'key_big', big: true, hidden: true }], ['spot', 15, 4, { verb: '장부를 읽는다', text: async (c) => { await c.narr('불에 그을린 장부. 「허용 손실」 칸이 끝없이 이어진다. 한 장 한 장, 이름을 지우고 숫자를 쓴 흔적.'); await c.narr('맨 마지막 장에만 이름이 남아 있었다. 지우다 만 것처럼. [w]세린[/]. 그 옆에 다른 손글씨: 「이 칸은 내가 지우지 못한다. — K」'); } }]], foes: [['knight', 5, 5], ['knight', 14, 5], ['hollow', 9, 10]] },
      '0,1': { props: [['chest', 9, 6, { item: 'heartpiece' }], ['torch', 4, 4], ['torch', 15, 4]], foes: [['shade', 6, 8], ['shade', 13, 8]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'forgotking' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd15:torch'], ['0,2', '0,1', 'wall'], ['1,1', '1,0', 'big']],
    ents: bossEnd('d15', [GATE.d15.x, GATE.d15.y + 3], async (c) => {
      c.lock(true); await c.cinema(true); c.music('requiem');
      await c.narr('잊힌 왕의 갑옷 안에서 종이 한 장이 떨어졌다. 징수탑 설계도의 첫 장이었다. 설계자 서명란: 「아우룸」.');
      await c.say('toria', '………찍. 초대 챔피언이… 탑을 설계했어?', { face: 'shock' });
      await c.narr('뒷면에 작은 글씨. 「빛을 모으면 흑점이 온다. 알면서 모았다. 한 사람이 다 짊어지면 나머지는 살 수 있으니까. — 그 한 사람이 매번 다른 사람이 될 줄은 몰랐다.」');
      c.flag('aurum_tower');
      await c.getItem('bw_dawn');
      await c.getItem('art_judge');
      await c.cinema(false); c.lock(false);
    }),
  });

  /* ───────── 지역마다 숨은 동굴 ───────── */
  const SECRETS = [
    { id: 'sec_green', region: 'green', x: 122, y: 150, name: '덤불 속 옛 샘', how: 'bush', loot: [['ar_ranger'], ['heartpiece']], foes: [['plant', 5, 6], ['plant', 10, 6]], note: '덤불을 베어 내자 이끼 낀 동굴 입구가 드러났다.' },
    { id: 'sec_red', region: 'red', x: 60, y: 184, name: '식지 않는 굴', how: 'heat', loot: [['art_triple'], ['heartpiece']], foes: [['wisp', 5, 5], ['wisp', 10, 5], ['golem', 7, 7]], msg: '안에서 뿜어 나오는 열기에 숨이 막힌다. 방열복이 있어야 한다.' },
    { id: 'sec_blue', region: 'blue', x: 206, y: 222, name: '밀물 동굴', how: 'swim', loot: [['bw_dragon'], ['heartpiece']], foes: [['octo', 5, 6], ['crab', 10, 6]], msg: '동굴 입구가 물에 잠겨 있다. 헤엄칠 수 있어야 한다.' },
    { id: 'sec_yellow', region: 'yellow', x: 292, y: 164, name: '모래에 묻힌 방', how: 'bomb', loot: [['sw_moon'], ['heartpiece']], foes: [['worm', 5, 6], ['bandit', 10, 6]], note: '폭탄에 모래 벽이 무너지고, 묻혀 있던 방이 드러났다.' },
    { id: 'sec_white', region: 'white', x: 30, y: 46, name: '얼어붙은 천문대', how: 'bomb', loot: [['tome_meteor'], ['heartpiece']], foes: [['icewisp', 5, 5], ['icewisp', 10, 5], ['golem', 7, 7]], note: '얼음벽이 깨지자 둥근 천문대가 나타났다. 망원경이 별 하나를 가리킨 채 얼어 있다.' },
    { id: 'sec_gray', region: 'gray', x: 40, y: 124, name: '고철 금고', how: 'bomb', loot: [['ac_vamp'], ['heartpiece']], foes: [['drone', 5, 5], ['drone', 10, 5]], note: '폭탄에 녹슨 철문이 떨어져 나갔다. 은빛 왕국 시대의 금고다.' },
    { id: 'sec_black', region: 'black', x: 292, y: 70, name: '삼킨 자의 무덤', how: 'abyss', loot: [['sw_void']], foes: [['shade', 5, 5], ['shade', 10, 5], ['hollow', 7, 7]], msg: '문이 열리지 않는다. 문에 새겨진 글씨: 「어둠을 셋 이상 들여다본 자만」.' },
    { id: 'sec_purple', region: 'purple', x: 110, y: 120, name: '거울 뒤 서재', how: 'mirror', loot: [['ac_combo'], ['heartpiece']], foes: [['mage', 5, 5], ['ghost', 10, 5]], msg: '그냥 바위벽이다. …아닌가? 무언가 비치는 것 같다.' },
  ];
  for (const sc of SECRETS) {
    [sc.x, sc.y] = OW.P(sc.x, sc.y);   // 넓어진 대륙의 자리
    const cond = () => {
      const s = S();
      if (sc.how === 'heat') return G.st.derive(s).heatOk;
      if (sc.how === 'swim') return !!s.inv.flippers;
      if (sc.how === 'abyss') return Object.keys(s.abyss || {}).length >= 3;
      if (sc.how === 'bomb' || sc.how === 'mirror') return f('secret:' + sc.id);
      return true;
    };
    OW.hooks.push((m) => {
      ST.cave(m, { x: sc.x, y: sc.y, id: sc.id + '_gate', to: sc.id, col: sc.region === 'white' ? '#8aa0b8' : sc.region === 'black' ? '#2a2438' : '#6e5640', cond, msg: sc.msg || '입구가 막혀 있다.' });
      if (sc.how === 'bush') for (let dy = 1; dy <= 3; dy++) for (let dx = -1; dx <= 2; dx++) { const i = m.i(sc.x + dx, sc.y + dy); if (!m.solidExtra[i] && m.ter[i] !== T.CLIFF) m.obj[i] = O.BUSH; }
    });
    if (sc.how === 'bomb') ST.onMap('world', (m, Wd) => { if (f('secret:' + sc.id)) return; const cr = new G.props.Crack({ x: px(sc.x) + 8, y: py(sc.y) + 2 }); cr.onOpen = () => { S().flags['secret:' + sc.id] = true; G.ui.toast(sc.note || '숨은 입구가 열렸다', 'gold'); }; Wd.add(cr); });
    if (sc.how === 'mirror') ST.onMap('world', (m, Wd) => { if (f('secret:' + sc.id)) return; Wd.add(new G.props.Spot({ x: px(sc.x) + 8, y: py(sc.y) + 4, verb: '바위벽을 살펴본다', when: () => !f('secret:' + sc.id), reveal() { S().flags['secret:' + sc.id] = true; G.ui.toast('거울에 비친 벽이 사라졌다 — 숨은 서재', 'gold'); G.fx.glow(this.x, this.y - 8, '#d8b0ff', 20); }, text: sc.msg })); });
    G.build.def(sc.id, {
      build() {
        const rm = G.build.room({ id: sc.id, region: sc.region, name: sc.name, w: 16, h: 11, floor: sc.region === 'white' ? T.ICE : sc.region === 'yellow' ? T.SANDSTONE : T.STONE, music: 'hollow', back: ['world', sc.x, sc.y + 1], furn: sc.id === 'sec_white' ? [['telescope', 7, 2]] : sc.id === 'sec_purple' ? [['shelf', 2, 2], ['shelf', 12, 2], ['bookpile', 7, 3]] : [] });
        rm.sub = '숨은 곳'; rm.dark = sc.region === 'black' ? 0.8 : 0.35;
        return rm;
      },
      ents(m, Wd) {
        sc.loot.forEach(([it], k) => Wd.add(new G.props.Chest({ x: px(6 + k * 4), y: py(4), item: it, big: false })));
        if (!f(sc.id + ':clear')) {
          const list = sc.foes.map(([t, x, y]) => G.foes.spawn(t, px(x + 1), py(y + 1), { tier: { green: 1, red: 2, blue: 3, yellow: 4, purple: 5, white: 6, gray: 7, black: 8 }[sc.region] || 4 }));
          list.forEach((e) => { e.aggro = true; const od = e.onDie; e.onDie = (i) => { if (od) od(i); if (list.every((x) => x.dead || x === e)) { S().flags[sc.id + ':clear'] = true; } }; });
        }
        if (!f(sc.id + ':seen')) { S().flags[sc.id + ':seen'] = true; S().flags['secrets'] = (S().flags.secrets || 0) + 1; G.ui.toast('숨은 곳을 찾았다! (' + S().flags.secrets + ' / ' + SECRETS.length + ')', 'gold'); }
      },
    });
  }
  ST.SECRETS = SECRETS;
})();
