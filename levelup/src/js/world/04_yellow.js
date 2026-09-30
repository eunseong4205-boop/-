/* 4장 「황금과 거래」 — 옐로 마을 · 그늘 골목 · 경험 거래소 · 카지노 · 모래 사막 · 태양 피라미드 · 황금궁 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data, U = G.u;

  W.keyItem('sun_token', '태양의 증표', '스핑크스가 준 황금 원반. 황금궁 문지기가 이것을 보면 길을 비킨다.');
  D.SHOPS.bazaar = { name: '대바자르 잡화 노점', keeper: 'merchant', items: ['p3', 'f3', 'f2', 'p2', 'x3'] };

  W.quest('m4', { main: true, name: '4장 · 황금과 거래', where: '옐로 마을', stages: [
    '대바자르를 둘러보자.',
    '시작의 버튼을 훔쳐 간 소년을 쫓아 서쪽 [y]그늘 골목[/]으로 가자.',
    '「경험 거래소」를 알아보자. 카지노 앞의 금빛 창구다.',
    '황금궁에 들어가자. 문지기는 [y]100만 골드[/]나 [y]태양의 증표[/](동쪽 사막 태양 피라미드)를 원한다.',
    '황금궁의 금화왕 골디를 만나자.',
    '금화왕 골디에게 도전하자. (강적 · 레벨 2000 부근)',
    '[y]레벨 2000[/]이 되면 사막 북쪽 대상단 길로 보랏빛 숲에 가자. 대상단장 사하라의 통행패가 필요하다.',
  ], done: '대상단은 해 질 녘 숲을 향해 떠났다.' });
  W.quest('q_sparrow', { name: '그늘 참새단의 저녁', where: '그늘 골목', stages: ['그늘 참새단 아이들을 위해 [y]옥수수빵 10개[/]를 가져다주자. 대바자르나 여관에서 살 수 있다.'], done: '참새단 아이들은 빵을 반씩 나눠 먹었다. 피카는 한 입도 안 먹었다.' });
  W.quest('q_sting', { name: '전갈 독침 수집가', where: '대바자르', stages: ['몬스터에게서 [y]전갈 독침[/] 5개를 모아 대바자르 상인에게 가져가자.'], done: '독침은 장신구가 되어 비싸게 팔렸다. 전갈들은 그게 싫다.' });
  W.quest('q_wolf', { name: '대상단의 호위', where: '모래 사막', stages: ['사막의 [y]모래 늑대[/] 8마리를 쫓아내자.', '사하라에게 알리자.'], done: '대상단은 무사히 오아시스에 도착했다.' });
  W.quest('q_casino', { name: '카지노의 행운', where: '황금궁 카지노', stages: ['카지노 룰렛에서 [y]1만 골드 이상[/] 걸고 숫자를 맞혀 잭팟을 터뜨리자.'], done: '카지노 역사상 가장 짧은 잭팟 축하 파티가 열렸다. 럭키는 박수를 두 번 쳤다.' });

  W.book('b_goldie_ad', { title: '경험 거래소 광고지', where: '옐로 마을', author: '금화왕 골디', text:
    '[y]당신의 경험, 최고가 매입![/]\n\n어린 시절의 경험? 삽니다.\n실패한 경험? 삽니다. (할인 매입)\n첫사랑의 경험? 고가 매입!\n\n' +
    '경험은 쌓아 두면 썩지 않지만, 배는 고픕니다.\n지금 파세요. 오늘 저녁이 따뜻해집니다.\n\n' +
    '— 금화왕 골디의 경험 거래소. 공짜는 없습니다. 속임수도 없습니다.' });
  W.book('b_rate', { title: '경험 시세표', where: '경험 거래소', text:
    '오늘의 시세 (경험 1당)\n\n평민 아이의 경험 — 0.3골드\n평민 어른의 경험 — 0.5골드\n괴짜의 경험 — 2골드\n덕후의 경험 — 5골드\n짱의 경험 — 12골드\n전설의 경험 — 매입 불가 (팔 필요가 없으므로)\n\n' +
    '판매가 (경험 1당) — 시세의 세 배\n\n※ 경험세는 판매자 부담' });
  W.book('b_slum_wall', { title: '그늘 골목 벽 낙서', where: '그늘 골목', text:
    '벽에 칼로 새긴 글씨들이 빼곡하다.\n\n「배고프다」\n「오늘 경험 팔았다. 레벨 7이 됐다. 내려갔다.」\n「엄마 보고 싶다」\n\n' +
    '구석에 아주 오래된 글씨.\n「언젠가 금화왕 — G. 948」\n\n그 아래에 새로 새긴 글씨.\n「언젠가 금화왕 — 피카. 998」' });
  W.book('b_sphinx', { title: '스핑크스의 비문', where: '태양 피라미드', text:
    '아침에는 네 발, 점심에는 두 발, 저녁에는 세 발로 걷는 것은?\n\n(아래 작은 글씨) 답을 말해도 싸운다. 스핑크스는 수수께끼보다 싸움을 더 좋아한다.\n\n' +
    '(더 작은 글씨) 정답은 「사람」. 흰빛의 사람이라면 「아침에는 한 발」이라고 덧붙인다. 버튼을 누르는 손가락 하나.' });
  W.book('b_desert_star', { title: '사막의 별 지도', where: '대상단 천막', author: '사하라', text:
    '사막에서는 별이 길이다.\n\n북쪽의 뱃사람 별을 따라가면 보랏빛 숲.\n동쪽의 모루 별을 따라가면 태양 피라미드.\n그리고 가장 밝은 황금별을 따라가면… 아무 데도 못 간다. 황금별은 늘 머리 위에 있으니까.\n\n' +
    '요즘 황금별 옆의 검은 점을 따라가는 짐승들이 늘었다. 짐승들은 빛이 많은 곳을 싫어하는데, 이상하게도 검은 점 쪽으로 몰려간다.' });
  W.book('b_casino_rules', { title: '황금궁 카지노 규칙', where: '카지노', text:
    '1. 모든 판은 공정하다.\n2. 공정하다는 것은 확률이 카지노 편이라는 뜻이다.\n3. 숫자를 맞히면 건 돈의 아홉 배.\n4. 1만 골드 이상 걸고 숫자를 맞히면 잭팟 — 금고의 [b]파란 구슬[/]을 준다. 지금까지 받아 간 사람은 없다.\n5. 금화왕은 카지노에서 돈을 걸지 않는다. 금화왕은 카지노 그 자체이기 때문이다.' });

  /* ───────── 옐로 마을 ───────── */
  W.map('yellow', {
    name: '옐로 마을', sub: '황금과 거래의 도시', region: 'yellow', area: 'yellow', theme: 'yellow', bg: '#5a4a1a', ki: W.ki('yellow', 0.03), town: true, weather: 'sand',
    grid: W.gen({
      w: 40, h: 32, seed: 'yellow-city', ground: 's', alt: [['.', 0.72, 5]],
      obst: [['C', 2], ['^', 1], ['t', 1]], dense: 0.86, sparse: 0.015, scale: 5,
      border: (x, y) => (y >= 30 && x < 16 ? '~' : '#'), bt: 2, rough: 0.35,
      paths: [
        [[6, 26], [6, 22], [20, 22]], [[20, 22], [20, 9]], [[20, 16], [39, 16]], [[20, 16], [9, 16], [4, 12]], [[33, 11], [33, 16]],
        [[11, 9], [11, 16]], [[27, 20], [27, 16]], [[27, 12], [33, 12]], [[20, 9], [30, 4], [30, 0]], [[8, 20], [8, 22]],
      ],
      path: '=',
      clear: [[14, 2, 13, 7], [16, 13, 9, 7, '='], [2, 27, 12, 3, '~'], [5, 25, 2, 5, '_'], [2, 6, 8, 12, 's'], [29, 5, 8, 7], [8, 4, 6, 6], [24, 18, 7, 5], [4, 18, 8, 3]],
      stamps: [
        { x: 3, y: 7, rows: ['b.bX.b', '......', 'X.b..b', '......', 'b..X.b'] },
        { x: 15, y: 13, rows: ['l'] }, { x: 25, y: 13, rows: ['l'] }, { x: 15, y: 20, rows: ['l'] }, { x: 25, y: 20, rows: ['l'] }, { x: 34, y: 15, rows: ['C'] }, { x: 9, y: 24, rows: ['b'] },
      ],
    }),
    builds: [
      { x: 14, y: 2, w: 12, h: 6, door: 6, style: 'castle', roof: '#e8c040', wall: 'sand', icon: 'coin', signColor: '#fff0a8', to: 'palace', tx: 9, ty: 12, cond: (s) => !!s.flags.palace_open, locked: '황금궁 정문이 굳게 닫혀 있다. 문지기에게 말을 걸어 보자.' },
      { x: 29, y: 5, w: 7, h: 5, door: 4, style: 'dome', roof: '#c83a8a', wall: 'sand', icon: 'coin', signColor: '#ffb0e8', to: 'casino', tx: 6, ty: 8 },
      { x: 8, y: 4, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'sand', icon: 'star', signColor: '#c8d0ff', to: 'yellow_rank', tx: 5, ty: 6 },
      { x: 24, y: 18, w: 6, h: 4, door: 3, roof: '#3ab8a8', wall: 'sand', icon: 'bed', to: 'yellow_inn', tx: 5, ty: 6 },
      { x: 16, y: 9, w: 3, h: 3, style: 'tent', roof: '#e84a4a' }, { x: 22, y: 9, w: 3, h: 3, style: 'tent', roof: '#3a78c8' },
      { x: 4, y: 18, w: 6, h: 2, door: 2, style: 'flat', roof: '#6a5a3a', wall: 'dark', to: 'hideout', tx: 4, ty: 5 },
      { x: 27, y: 11, w: 5, h: 1, style: 'flat', roof: '#ffd84a', wall: 'sand' },
      { x: 20, y: 14, w: 2, h: 3, style: 'tower' },
    ],
    edges: { right: { to: 'desert', tx: 0, ty: 17 }, up: { to: 'caravan', tx: 12, ty: 21 } },
    objs: [
      W.sign(7, 24, ['옐로 마을 — 황금과 거래의 도시', '↑ 황금궁 · 대바자르   → 모래 사막   ← 그늘 골목']),
      W.sign(29, 1, '↑ 대상단 천막 (보랏빛 숲행)'),
      W.bookObj('b_slum_wall', 2, 12),
      W.spot(36, 17, 3), W.spot(3, 16, 10, true),
      { t: 'sign', x: 20, y: 16, invisible: true, text: ['옐로 마을의 징수탑. 탑 밑에 금화로 만든 명패가 붙어 있다.', '「이 탑은 금화왕 골디가 기증함」'] },
      { t: 'sign', x: 28, y: 11, invisible: true, talk: exchangeTalk },
      { t: 'sign', x: 29, y: 11, invisible: true, talk: exchangeTalk },
      { t: 'sign', x: 30, y: 11, invisible: true, talk: exchangeTalk },
    ],
    npcs: [
      { id: 'guard', x: 21, y: 8, dir: 'down', cond: (s) => !s.flags.palace_open, mark: (s) => (s.quests.m4 === 3 ? '!' : null), talk: palaceGuard },
      { id: 'merchant', x: 17, y: 12, dir: 'down', mark: (s) => (s.flags.button_back && s.quests.q_sting == null) || (s.quests.q_sting === 0 && E.has(s, 'm7', 5)) ? '!' : null, talk: bazaarTalk },
      { id: 'merchant2', x: 23, y: 12, dir: 'down', look: G.chars.merchant.look, talk: async (c) => { await c.say('merchant', ['어서 오세요! 옐로 최고의 장비! 황금 장갑은 손가락마다 금 고리가 달려서 누를 때마다 짤랑짤랑!', '…소리만 요란한 게 아니라 경험치도 확실히 늘어요.']); await c.shop('yellow'); } },
      { id: 'kkachi', x: 12, y: 20, dir: 'down', cond: (s) => s.flags.button_back, talk: kkachiTown },
      { id: 'kid', x: 5, y: 9, dir: 'down', wander: 1, talk: W.chatter('y_sparrow1', ['…뭘 봐. 그늘 골목은 구경하는 데 아니야.', '피카 형은 우리 대장이야. 훔친 거 삼 할은 꼭 돌려줘. 「우린 징수 기사가 아니거든」이래.']) },
      { id: 'kid2', x: 7, y: 11, dir: 'right', wander: 1, talk: W.chatter('y_sparrow2', ['나 레벨 6이야. 원래 12였는데 경험 팔았어. 빵 세 개 값.', '금화왕도 여기 출신이래. 그래서 우리도 금화왕이 될 수 있대. 피카 형이 그랬어.']) },
      { id: 'oldman', x: 27, y: 23, dir: 'left', wander: 2, talk: W.chatter('y_old', ['젊었을 때 경험을 팔아서 집을 샀지. 지금은 집이 있는데 레벨이 3이야. 뭘 잘못한 건지 모르겠어.', '금화왕 골디는 셈이 정확해. 속이지 않아. 그게 더 무섭지.']) },
      { id: 'sailor', x: 8, y: 25, dir: 'down', talk: async (c) => { await c.say('captain', '블루 마을로 돌아가려면 말해. 고등어호는 늘 여기 있다. …우웩.'); if (await c.yes('고등어호를 타고 블루 마을로 돌아갈까?', 'captain', '돌아간다', '아니')) { await c.fadeOut(400); await c.warp('blue', 22, 23, 'down', { instant: true }); await c.fadeIn(500); } } },
    ],
    enter: async (c) => { if (!c.flag('yellow_intro')) await yellowIntro(c); },
  });
  W.town({ map: 'yellow', x: 20, y: 22, name: '옐로 마을', color: '#ffd43b', desc: '황금과 거래의 도시. 대바자르와 황금궁.', hint: '블루 마을에서 배를 타고 남쪽으로' });

  async function yellowIntro(c) {
    c.set('yellow_intro');
    await c.chapter('4장', '황금과 거래', '모래바람 속에서 금화가 짤랑거렸다. 이 도시에서는 모든 것에 값이 붙어 있다.');
    await c.say('dotori:surprise', ['찍! 모래! 금! 모래! 금! 사람도 엄청 많아!', '저 위에 번쩍이는 궁전 봐. 저게 [y]황금궁[/]이야. 사천왕 골디가 산대.']);
    c.quest('m4', 0);
    await c.hero.walk('UUUU');
    c.spawn({ id: 'kkachi_run', x: 10, y: 22, dir: 'right', look: G.chars.kkachi.look });
    await c.npc('kkachi_run').walk('RRRRR', 2);
    c.shake(200, 2);
    c.sfx('bump');
    await c.say('kkachi', '앗, 미안! 바빠서!');
    await c.npc('kkachi_run').walk('LLLLLL', 2.5);
    c.despawn('kkachi_run');
    await c.wait(0.4);
    await c.emote('follower', '!');
    await c.say('dotori:surprise', ['찍?! {n}! 주머니! 버튼이 없어!', '방금 그 애야! 그늘 골목 쪽으로 도망갔어!']);
    c.take('button');
    c.set('button_stolen');
    c.music('danger');
    c.quest('m4', 1);
    await c.sys('시작의 버튼을 잃어버렸다! 렙업 버튼이 작동하지 않는다. 서쪽 [y]그늘 골목[/]으로 쫓아가자.');
  }
  async function kkachiTown(c) {
    const s = c.s;
    // 참새단을 지켜 주고 빵까지 나눈 사람에게만: 황금궁 부엌 뒷길
    if (s.quests.m4 === 3 && !s.flags.palace_open && s.flags.d_kkachi === 'spare' && s.quests.q_sparrow === 'done') {
      await c.say('kkachi', ['흰빛. 황금궁 들어가려고? 100만 골드는 없어 보이고, 스핑크스는… 무섭지.', '빚 갚을게. 이자는 빼고. 황금궁 부엌으로 이어지는 하수구가 있어. 참새단은 거기로 남은 빵을 가져와.']);
      if (!(await c.yes('피카의 뒷길로 황금궁에 들어갈까?', 'kkachi', '따라간다', '정문으로 가겠다'))) { await c.say('kkachi', '…그래. 정직한 길이 좋으면 그렇게 해. 금화왕도 그런 거 좋아하더라.'); return; }
      await c.fadeOut(500);
      await c.narr(['피카를 따라 골목 끝 배수로 뚜껑을 들어 올렸다. 냄새가… 사막보다 독했다.', '어둠 속을 한참 기어가자 빵 굽는 냄새가 났다. 황금궁 부엌이다. 요리사가 피카를 보고 모르는 척 고개를 돌렸다.']);
      c.set('palace_open'); c.set('palace_sneak');
      c.quest('m4', 4);
      c.decide('palace', 'sneak', '피카가 알려 준 부엌 뒷길로 황금궁에 숨어들었다');
      await c.warp('palace', 9, 12, 'up', { instant: true });
      await c.fadeIn(500);
      return;
    }
    await c.run(W.chatter('kkachi_town', [
      '어, 흰빛. 오늘은 안 훔쳐. 너한테서는 이제 안 훔쳐. 약속했잖아.',
      ['금화왕은 원래 우리 골목 출신이야. 벽에 「언젠가 금화왕 — G」 봤지? 그게 골디야.', '나도 언젠가 금화왕이 될 거야. 그래서 애들 경험을 전부 다시 사 올 거야.'],
      '황금궁 문지기는 돈 아니면 증표야. 금화왕답지. 공짜는 없어.',
    ]));
  }
  async function exchangeTalk(c) {
    const s = c.s;
    await c.say(null, '「금화왕 골디의 경험 거래소」 금빛 창구 앞에 사람들이 줄을 서 있다. 대부분 아이들과 노인이다.');
    if (s.quests.m4 === 2) {
      await c.say('merchant', ['경험을 팔러 왔나? 흠, 평민 등급이 아니군. 시세표를 보여 주지.', '…시작의 버튼? 그 소년은 결국 안 팔았어. 대신 금화왕님이 그 버튼에 관심을 보이셨지.']);
      G.main.unlockBook('b_rate');
      await c.say('merchant', ['금화왕님을 뵙고 싶다고? 황금궁 문지기에게 가 봐. 입장료는 [y]100만 골드[/].', '돈이 없으면 동쪽 사막 태양 피라미드의 스핑크스를 이기고 [y]태양의 증표[/]를 받아 오든가. 금화왕님은 강한 자도 좋아하시거든.']);
      c.quest('m4', 3);
      return;
    }
    G.main.unlockBook('b_goldie_ad');
    await c.say('merchant', '경험을 사고팝니다. 공짜는 없습니다. 속임수도 없습니다. 다음 분!');
  }
  async function palaceGuard(c) {
    const s = c.s;
    if (s.quests.m4 < 3 || s.quests.m4 == null) { await c.say('guard', '황금궁이다. 금화왕님은 아무나 만나 주지 않으신다.'); return; }
    await c.say('guard', ['금화왕님을 뵙겠다고? 입장 조건은 둘 중 하나.', '[y]100만 골드[/]의 입장료, 아니면 태양 피라미드 스핑크스의 [y]태양의 증표[/].']);
    const opts = ['100만 골드를 낸다', '태양의 증표를 보여 준다', '그만둔다'];
    const k = await c.ask(null, opts, 'guard', { cancel: 2 });
    if (k === 0) {
      if (!c.pay(1000000)) { await c.say('guard', '돈이 모자라는군. 금화왕님은 외상을 안 하신다.'); return; }
      await c.say('guard', '…정말 냈군. 금화왕님이 좋아하시겠어. 들어가라.');
      c.decide('palace', 'gold', '100만 골드를 내고 황금궁에 들어갔다');
    } else if (k === 1) {
      if (!E.has(s, 'sun_token')) { await c.say('guard', '증표가 없잖아. 스핑크스는 동쪽 사막 태양 피라미드 가장 안쪽에 있다.'); return; }
      await c.say('guard:surprise', '태양의 증표! 스핑크스를 이겼다고? …들어가라. 금화왕님이 좋아하시겠어.');
      c.decide('palace', 'token', '태양의 증표를 보이고 황금궁에 들어갔다');
    } else return;
    c.set('palace_open');
    c.quest('m4', 4);
    c.refresh();
  }
  async function bazaarTalk(c) {
    const s = c.s;
    if (s.quests.q_sting === 0 && E.has(s, 'm7', 5)) {
      c.take('m7', 5);
      await c.say('merchant', ['전갈 독침 다섯 개! 좋아, 좋아. 이걸로 목걸이를 만들면 부자들이 줄을 서지.', '약속한 값이다. 거래는 정직하게. 옐로의 원칙이지.']);
      c.gold(400000);
      c.quest('q_sting', 'done');
    } else if (s.flags.button_back && s.quests.q_sting == null) {
      await c.say('merchant', ['손님, 부탁 하나 합시다. 사막 전갈의 [y]독침[/] 5개만 구해 주면 두둑이 쳐 드리지.', '요새 부자들 사이에서 전갈 독침 목걸이가 유행이라.']);
      c.quest('q_sting', 0);
    }
    await c.shop('bazaar');
  }

  /* ── 그늘 참새단 아지트 ── */
  W.map('hideout', {
    name: '그늘 참새단 아지트', region: 'yellow', area: 'yellow', theme: 'interior', bg: '#140e06', ki: W.ki('yellow', 0.03), music: 'sad', banner: false,
    grid: W.room({ w: 10, h: 7, floor: '-', door: 4, win: [], put: [[1, 2, 'b'], [2, 2, 'X'], [7, 2, 'q'], [8, 2, 'q'], [1, 5, 'b'], [8, 5, 'X'], [4, 2, 'd']] }),
    warps: [W.exit(4, 6, 'yellow', 6, 20)],
    npcs: [
      { id: 'kkachi', x: 5, y: 3, dir: 'down', mark: (s) => (s.flags.button_stolen ? '!' : s.flags.button_back && s.quests.q_sparrow == null ? '!' : s.quests.q_sparrow === 0 && E.has(s, 'f0', 10) ? '!' : null), talk: kkachiHideout },
      { id: 'kid', x: 2, y: 4, dir: 'right', talk: W.chatter('hide_kid', ['피카 형 괴롭히지 마!', '우리는 그늘 참새단이야. 참새는 작지만 떼로 다니면 무서워.']) },
      { id: 'kid2', x: 7, y: 4, dir: 'left', talk: W.chatter('hide_kid2', ['배고파…', '형이 그러는데 흰빛은 전설에만 나온대. 진짜야?']) },
    ],
  });
  async function kkachiHideout(c) {
    const s = c.s;
    if (s.flags.button_stolen) {
      c.music('yellow');
      await c.say('kkachi', ['쳇, 여기까지 쫓아왔어? 발 빠르네.', '버튼? 이거? …이거 뭐야. 눌러 봐도 아무것도 안 나오던데.']);
      await c.say('@', '돌려줘. 엄마가 남긴 거야.');
      await c.say('kkachi', ['엄마가 남긴 거? …흥. 우리 엄마는 아무것도 안 남겼어.', '이거 경험 거래소에 가져가면 금화왕이 비싸게 사 줄 거야. 아우룸의 유물이라며. 애들 한 달 밥값은 나와.']);
      const k = await c.ask(null, ['한 번만 눌러 볼게', '애들 밥값은 내가 도울게', '힘으로 뺏는다']);
      if (k === 2) {
        await c.say('dotori:angry', '찍! 안 돼, {n}! 쟤들 전부 애들이야!');
        await c.say('@', '……');
      }
      if (k === 1) await c.say('kkachi', '…뭐? 네가 왜? 공짜는 없어. 그건 이 도시 규칙이야.');
      await c.say('@', '이리 줘 봐. 한 번만. 보여 줄게.');
      await c.say(null, '피카가 머뭇거리다 버튼을 내밀었다. {n}이(가) 버튼을 눌렀다.');
      c.take('button'); c.give('button', 1, true);
      c.unset('button_stolen');
      c.light(90);
      c.flash('#ffffff', 900);
      await c.wait(0.8);
      await c.emote('kkachi', '!');
      await c.say('kkachi:surprise', ['……하얀… 빛?', '이거 진짜야? 흰빛이 진짜로 있어? 전설에만 나오는 거 아니었어?']);
      await c.say('kid2', '우와아… 예쁘다…');
      await c.say('kkachi', ['……', '…가져가. 그거 네 거야. 그런 걸 팔면 벌 받을 것 같아.', '대신 하나만 알려 줘. 흰빛이면… 레벨을 사지 않아도 되는 거야? 끝없이 크는 거야?']);
      await c.say('@', '…응. 그런 것 같아.');
      await c.say('kkachi', ['부럽다.', '우린 경험을 팔아서 밥을 먹어. 레벨이 내려가도 배는 불러야 하니까. 금화왕의 [y]경험 거래소[/]가 그렇게 사 줘.']);
      await c.say('kkachi', ['금화왕 골디도 원래 이 골목 출신이야. 벽 낙서 봤어? 「언젠가 금화왕 — G」.', '나도 언젠가 금화왕이 될 거야. 그래서 애들 경험을 전부 다시 사 올 거야.']);
      c.set('button_back');
      c.set('m_yellow_goldie_hint');
      c.quest('m4', 2);
      await c.sys('시작의 버튼을 되찾았다! 카지노 앞 금빛 창구, [y]경험 거래소[/]를 알아보자.');
      return;
    }
    if (s.quests.q_sparrow === 0 && E.has(s, 'f0', 10)) {
      c.take('f0', 10);
      await c.say('kkachi', ['…빵 열 개. 진짜로 가져왔네.', '공짜는 없어. 이건… 빚이야. 언젠가 금화왕이 되면 이자까지 쳐서 갚을게.']);
      await c.say(null, '아이들이 빵을 반씩 쪼개 나눠 먹는다. 피카는 한 입도 먹지 않고 그걸 지켜봤다.');
      c.give('x3');
      await c.say('kkachi', '이거 가져. 전에 훔친… 아니, 주운 저울 장식이야. 골드가 잘 붙는대.');
      c.quest('q_sparrow', 'done');
      return;
    }
    if (s.flags.button_back && s.quests.q_sparrow == null) {
      await c.say('kkachi', ['흰빛. 부탁 하나 해도 돼? …아니, 부탁 아니야. 거래야.', '애들 저녁거리. [y]옥수수빵 10개[/]. 대신 내가 아는 소문 다 알려 줄게.']);
      c.quest('q_sparrow', 0);
      return;
    }
    if (s.quests.q_sparrow === 0) { await c.say('kkachi', '옥수수빵 열 개. 대바자르 노점에서 팔아. …아니면 여관.'); return; }
    await kkachiTown(c);
  }

  /* ── 옐로 안쪽 ── */
  W.map('yellow_rank', {
    name: '옐로 마을 등급소', region: 'yellow', area: 'yellow', theme: 'interior', bg: '#140e06', ki: W.ki('yellow', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'K'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'yellow', 11, 8)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 저울을 들고 있다.', '옐로 사람들은 아우룸이 상인이었다고 믿는다. 증거로 영수증을 보여 준다. 위조다.'] }],
    npcs: [W.clerk('clerk_y', 5, 3, { hello: '등급소입니다. 심사비는 정가입니다. 흥정은 받지 않습니다. 영수증은 세 장 끊어 드립니다.', bye: '영수증 챙기세요.' })],
  });
  W.map('yellow_inn', {
    name: '오아시스 여관', region: 'yellow', area: 'yellow', theme: 'interior', bg: '#140e06', ki: W.ki('yellow', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [4, 2, 'n'], [5, 2, 'n'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'yellow', 27, 22)],
    npcs: [{ id: 'innkeeper', x: 4, y: 3, dir: 'down', talk: async (c) => { await c.say('innkeeper', '오아시스 여관이에요. 사막 한가운데 도시에선 물이 제일 귀해요. 그래서 여기가 제일 비싸죠. …농담이에요. 공짜로 쉬어 가요.'); await c.shop('bazaar'); await c.inn(0, 'innkeeper'); } }],
  });

  /* ── 카지노 ── */
  W.map('casino', {
    name: '황금궁 카지노', region: 'yellow', area: 'yellow', theme: 'castle', bg: '#140e06', ki: W.ki('yellow', 0.05), music: 'black', banner: false,
    grid: W.room({ w: 13, h: 10, floor: '+', door: 6, win: [], put: [[1, 2, 'K'], [11, 2, 'K'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [2, 6, 'd'], [3, 6, 'd'], [9, 6, 'd'], [10, 6, 'd'], [1, 8, 'p'], [11, 8, 'p'], [6, 2, 'h']] }),
    warps: [W.exit(6, 9, 'yellow', 33, 10)],
    objs: [W.bookObj('b_casino_rules', 6, 2)],
    npcs: [
      { id: 'lucky', x: 6, y: 3, dir: 'down', mark: (s) => (!s.orbs.o_b3 ? '?' : null), talk: roulette },
      { id: 'merchant', x: 2, y: 5, dir: 'down', look: G.chars.merchant.look, talk: W.chatter('casino_rich', ['어젯밤에 레벨 300어치 경험을 잃었다네. 괜찮아, 내일 사면 돼.', '금화왕은 카지노에서 돈을 걸지 않아. 금화왕이 곧 카지노니까.']) },
    ],
  });
  async function roulette(c) {
    const s = c.s;
    await c.say('lucky', ['어서 오세요. 룰렛입니다. 0부터 9까지, 숫자를 맞히면 아홉 배.', s.orbs.o_b3 ? '…잭팟은 이미 터졌죠. 당신 손으로.' : '1만 골드 이상 걸고 맞히면 [y]잭팟[/]. 금고의 파란 구슬을 드립니다.']);
    if (s.quests.q_casino == null && !s.orbs.o_b3) c.quest('q_casino', 0);
    for (;;) {
      const bets = [1000, 10000, 100000, 1000000].filter((b) => b <= Math.max(1000, s.gold));
      const k = await c.ask('얼마를 걸까요?', bets.map((b) => '● ' + U.fmt(b)).concat(['그만한다']), 'lucky', { cancel: bets.length });
      if (k >= bets.length) { await c.say('lucky', '현명하시군요. 확률은 늘 카지노 편이니까요.'); return; }
      const bet = bets[k];
      if (!c.pay(bet)) { await c.say('lucky', '칩이 모자라시네요.'); return; }
      const n = await c.ask('숫자를 고르세요.', ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], 'lucky');
      c.sfx('tick');
      await c.say(null, '딸깍 딸깍 딸깍… 룰렛이 돌아간다…');
      const luk = E.derive(s).lukF;
      const res = Math.random() < 0.1 * (1 + (luk - 1) * 0.5) ? n : Math.floor(Math.random() * 10);
      if (res === n) {
        c.jingle('win');
        await c.say('lucky:surprise', '…' + res + '! 맞히셨군요!');
        c.gold(bet * 9);
        if (bet >= 10000 && !s.orbs.o_b3) {
          c.flash('#ffd84a', 600);
          await c.say('lucky', ['잭팟입니다. 카지노 개장 이래 처음이군요.', '약속대로 금고의 구슬을 드리죠. 금화왕님께는… 제가 말씀드리겠습니다. 아마 웃으실 겁니다. 정직한 거래니까.']);
          await c.orb('o_b3');
          c.quest('q_casino', 'done');
        }
      } else await c.say('lucky', res + '입니다. 아쉽군요. 확률은 공정합니다.');
    }
  }

  /* ── 황금궁 ── */
  W.map('palace', {
    name: '황금궁', sub: '금화왕의 옥좌', region: 'yellow', area: 'palace', theme: 'castle', bg: '#140e06', ki: W.ki('yellow', 0.1), music: 'castle',
    grid: W.room({ w: 19, h: 14, floor: '-', door: 9, win: [], rug: [8, 3, 3, 10], put: [[1, 2, 'K'], [2, 2, 'K'], [16, 2, 'K'], [17, 2, 'K'], [4, 4, 'y'], [14, 4, 'y'], [4, 8, 'y'], [14, 8, 'y'], [1, 12, 'K'], [17, 12, 'K'], [9, 2, 'n']] }),
    warps: [W.exit(9, 13, 'yellow', 20, 8)],
    npcs: [{ id: 'goldie', x: 9, y: 3, dir: 'down', mark: (s) => (s.quests.m4 === 4 || s.quests.m4 === 5 ? '!' : null), talk: goldieTalk }],
  });
  async function goldieTalk(c) {
    const s = c.s;
    if (s.quests.m4 === 4) {
      c.music('castle');
      const how = s.flags.d_palace;
      await c.say('goldie', how === 'sneak' ? ['…하수구 냄새가 나는군. 어서 와, 흰빛의 꼬마.', '부엌 뒷길이라. 그 골목 꼬마가 알려 줬겠지. 요리사는 내일 해고… 아니, 됐다. 그 녀석도 그 골목 출신이야.'] : how === 'gold' ? ['어서 와. 흰빛의 꼬마.', '100만 골드를 정말 냈다며? 하하! 입장료를 낸 손님은 3년 만이다. 마음에 드는군. 셈을 아는 녀석이야.'] : ['어서 와. 흰빛의 꼬마.', '스핑크스를 이겼다며? 그 고양이는 나도 못 이겼는데. 기분 나쁘군.']);
      await c.say('goldie', s.flags.d_kkachi === 'report' ? ['버튼을 되찾았다지? 그리고 그 골목 꼬마를 경비대에 넘겼고.', '…이 도시답게 굴었군. 칭찬은 아니다.'] : ['버튼을 되찾았다지? 그 골목 꼬마가 공짜로 돌려줬다고? 쯧. 장사를 못 하는 녀석이군.']);
      await c.say('goldie', ['나는 금화왕 골디. 사천왕, 노랑의 자리. 대륙의 경험을 사고파는 사람이지.', '이 도시에서는 모든 것에 값이 있어. 너도, 나도, 그 흰빛도.']);
      const k = await c.ask(null, ['아이들 경험을 사는 건 옳지 않아', '엄마… 세린을 알아?', '카이론은 뭘 하려는 거야?']);
      if (k === 0) await c.say('goldie', ['옳지 않다? 그 애들이 굶는 게 옳은가? 나는 그 애들한테 저녁을 사 줬어. 경험을 받고.', '나도 그 골목에서 컸다. 여덟 살 때 첫 경험을 팔았지. 레벨 4어치. 빵 두 개.', '공짜는 없어, 꼬마. 세상은 원래 그래.']);
      if (k === 1) await c.say('goldie', ['…세린.', '알지. 그 여자한테 첫 동전을 빌렸어. 979년. 아직 못 갚았고.', '빚을 못 갚는 건 내 평생 그거 하나뿐이다.']);
      if (k === 2) await c.say('goldie', ['정보는 비싸, 꼬마. 카이론에 관한 정보라면 더더욱.']);
      await c.say('goldie', ['궁금한 게 많은 얼굴이군. 좋아. 거래를 하지.', '나를 이기면, 네가 궁금한 걸 공짜로 알려 주마. 내 평생 처음 주는 공짜다.', '지면… 네 흰빛을 1년 치 사겠다. 정가로.']);
      c.quest('m4', 5);
      if (s.lv < 1500) await c.say('goldie', '…라고 말하고 싶지만, 지금 너는 너무 약해. 레벨 2000쯤 되면 다시 와. 약한 상대를 이기는 건 거래가 아니라 강도질이니까.');
      else await challengeGoldie(c);
      return;
    }
    if (s.quests.m4 === 5) {
      if (!(await c.yes('금화왕 골디에게 도전할까?', 'goldie', '도전한다', '아직'))) { await c.say('goldie', '현명하군. 준비가 안 된 거래는 손해니까.'); return; }
      await challengeGoldie(c);
      return;
    }
    const dg = s.flags.d_goldie;
    await c.run(W.chatter('goldie_after', [
      ['카이론은 뭔가를 기다리고 있어. 16년짜리 뭔가를.', '천년제 날 밤. 그날이 그 16년의 끝이야. 나는 그 계산서를 받아 볼 생각이다.'],
      s.flags.d_kkachi === 'report' ? '네가 넘긴 그 꼬마, 피카. 감옥 대신 내 밑에 뒀다. 장부를 맡겼더니 셈이 빠르더군. 여덟 살의 나를 보는 것 같아서… 기분 나빠.' : '그 골목 꼬마, 피카라고 했나. 내가 여덟 살 때랑 눈빛이 똑같더군. 기분 나빠.',
      dg === 'contract' ? '계약서대로 하고 있다. 아이들 매입가 세 배, 스무 살에 되살 권리, 참새단 빵. 계산해 보니… 손해다. 처음으로 손해 보는 장사를 하는군. 나쁘지 않아.'
        : dg === 'expose' ? ['거래소 문을 닫았다. 네가 장부를 뿌린 다음 날, 창구 앞에 돌이 날아왔지.', '그 애들은 이제 뭘 팔아서 먹을까. …사하라가 대상단 식량을 풀었다더군. 네 덕인지, 네 탓인지는 계산 안 해 봤다.']
        : '경험 거래소는 문 닫지 않는다. 공짜는 없으니까.',
    ]));
  }
  async function challengeGoldie(c) {
    c.set('m_yellow_goldie');
    await c.say('goldie', ['좋아. 계약 성립.', '금화왕의 싸움은 비싸다. 한 대 한 대가 금화다!']);
    const win = await c.battle('goldie', { noFlee: true, music: 'boss2' });
    if (!win) { await c.say(null, '…정신을 차려 보니 황금궁 밖이었다. 골디의 목소리가 들린 것 같다. 「계약은 무효로 해 주지. 약한 상대한테 받는 건 강도질이니까.」'); return; }
    c.music('sad');
    await c.say('goldie', ['……하. 하하.', '졌군. 내가. 금화 한 닢 못 챙기고.']);
    await c.say('goldie', ['약속은 약속이지. 공짜로 알려 주마. 평생 처음이자 마지막 공짜다. 잘 들어.']);
    await c.say('goldie', ['16년 전, 카이론과 세린과 녹턴이 아스트라로 갔다. 흑점을 막으러. 나랑 루미에, 볼트는 대륙에 남았고.', '돌아온 건 카이론과 녹턴뿐이었다. 카이론은 그날 밤 경험세를 선포했어.']);
    await c.say('goldie', ['나는 반대하지 않았다. 계산을 해 봤거든. 대륙의 빛을 모아 하늘을 지킨다. 숫자로는 맞아.', '그런데 요즘 계산이 안 맞아. 빛은 16년 동안 모였는데 흑점은 다시 커지고 있어.', '[y]카이론은 뭔가를 기다리고 있다.[/] 16년짜리 뭔가를. 천년제 날 밤이 그 끝이야.']);
    // 금화왕의 장부: 아이들에게서 산 경험은 어디로 가는가
    await c.say('goldie', ['공짜 하나 더. 이건 네가 물어보지 않은 거다.', '경험 거래소가 아이들한테서 산 경험, 그 칠 할이 어디로 가는 줄 아나?']);
    await c.narr('골디가 옥좌 옆 금고에서 두꺼운 장부를 꺼내 펼쳤다. 「천년성 납품」이라는 글씨가 칸마다 찍혀 있다.');
    await c.say('goldie', ['천년성이다. 옐로의 탑이 16년 동안 한 번도 할당량을 못 채운 적이 없는 이유지.', '가난한 애들의 경험을 사서, 카이론의 하늘에 바친다. 애들은 빵을 먹고, 하늘은 빛을 먹고, 나는 차액을 먹는다. 모두가 배부른 거래지.']);
    await c.say('goldie', ['…자, 꼬마. 네가 이겼으니 네가 정해라.', '이 장부를 대바자르 광장에 뿌리면 이 도시는 뒤집힐 거다. 아니면 나랑 계약을 하든가. 조건은 네가 쓰고.']);
    const g = await c.ask('금화왕의 장부', ['계약한다: 아이들 매입가 세 배, 스무 살에 되살 권리', '장부를 광장에 뿌린다']);
    if (g === 0) {
      await c.say('goldie', ['……', '하. 조건이 지독하군. 되살 권리라니. 그럼 나는 경험을 빌려주는 전당포가 되는 건가.']);
      await c.say('goldie', ['좋다. 서명하지. 네 이름은 증인란에.', '…세린이었으면 똑같은 조건을 썼을 거다. 그 여자도 계산은 못 하면서 조건은 잘 썼거든.']);
      c.decide('goldie', 'contract', '금화왕과 경험 거래소 계약을 맺었다: 아이들 매입가 세 배, 되살 권리');
      c.bond('goldie', 2);
    } else {
      await c.say('goldie', ['……해 봐.', '그럼 내일부터 그 애들은 뭘 팔아서 먹지? 정의는 배를 채워 주지 않아, 꼬마.']);
      await c.narr(['다음 날 아침, 대바자르 광장에 장부의 사본이 눈처럼 흩날렸다.', '사람들이 창구 앞에 모였다. 누군가 첫 돌을 던졌다. 그늘 골목의 아이들은 멀리서 그걸 보고만 있었다.']);
      await c.say('goldie', ['…거래소는 오늘부로 문을 닫는다.', '너는 옳은 일을 했다. 그리고 그 값은 네가 아니라 그 애들이 치를 거다. 그걸 잊지 마라.']);
      c.decide('goldie', 'expose', '금화왕의 장부를 대바자르 광장에 뿌렸다');
      c.bond('goldie', -1);
    }
    await c.say('goldie', ['…그리고 이건 덤이다. 세린한테 빌린 동전 값이라고 치지.', '보랏빛 숲의 [y]베라[/]를 만나라. 세린의 스승이다. 그 할망구는 16년 동안 입을 다물고 있지만… 너한테는 열 거다.']);
    c.gold(3000000);
    c.set('m_yellow_bond');
    await c.say('goldie', '대상단장 사하라에게 내 이름을 대. 보랏빛 숲행 통행패를 끊어 줄 거다. …꼬마. 다음에 오면 그 흰빛, 1그램만 팔아라. 비싸게 사 주지.');
    c.quest('m4', 6);
  }

  /* ───────── 대상단 천막 ───────── */
  W.map('caravan', {
    name: '대상단 천막', sub: '보랏빛 숲으로 가는 길목', region: 'yellow', area: 'caravan', theme: 'yellow', bg: '#5a4a1a', ki: W.ki('yellow', 0.3), music: 'yellow', weather: 'sand',
    grid: W.gen({
      w: 26, h: 22, seed: 'caravan-camp', ground: 's', alt: [['.', 0.7, 4]],
      obst: [['C', 3], ['^', 2]], dense: 0.7, sparse: 0.03, scale: 5,
      border: '#', bt: 2, rough: 0.5,
      paths: [[[12, 21], [12, 12], [13, 4], [13, 0]]],
      clear: [[5, 7, 16, 9]],
    }),
    builds: [{ x: 6, y: 7, w: 4, h: 3, style: 'tent', roof: '#c87a3a' }, { x: 15, y: 7, w: 4, h: 3, style: 'tent', roof: '#3a8a8a' }, { x: 10, y: 12, w: 3, h: 2, style: 'tent', roof: '#e8c040' }],
    edges: { down: { to: 'yellow', tx: 30, ty: 0 }, up: { to: 'purple_road', tx: 14, ty: 33, req: { lv: 2000, item: 'caravan_seal' }, msg: '대상단 길은 험하다. 대상단장의 통행패 없이는 길을 잃는다.' } },
    objs: [W.bookObj('b_desert_star', 14, 11), W.spot(20, 14, 3), W.sign(14, 2, '↑ 대상단 길 — 보랏빛 숲 (통행패 필요)')],
    npcs: [
      { id: 'sahara', x: 8, y: 11, dir: 'right', mark: (s) => (s.quests.m4 === 6 && !E.has(s, 'caravan_seal')) || s.quests.q_wolf === 1 || (s.quests.q_wolf == null && s.flags.button_back) ? '!' : null, talk: saharaTalk },
      { id: 'merchant', x: 17, y: 11, dir: 'left', look: G.chars.merchant.look, talk: async (c) => { await c.say('merchant', '대상단 보급품이오. 사막을 건너려면 물약은 넉넉히!'); await c.shop('bazaar'); } },
    ],
  });
  async function saharaTalk(c) {
    const s = c.s;
    if (s.quests.q_wolf === 0 && W.killsSince(s, 'sandwolf', 'q_wolf_base') >= 8) c.quest('q_wolf', 1);
    if (s.quests.q_wolf === 1) {
      await c.say('sahara', ['모래 늑대 여덟을 쫓았다고. 별이 하나 더 밝아졌군.', '대상단의 감사다. 사막에서는 물 다음으로 귀한 거지.']);
      c.gold(800000); c.give('p3', 5); c.give('f3', 3);
      c.quest('q_wolf', 'done');
      return;
    }
    if (s.quests.m4 === 6 && !E.has(s, 'caravan_seal')) {
      await c.say('sahara', ['금화왕의 이름을 대는군. …그리고 흰빛이라.', '사람도 별 같아. 어떤 별은 길을 가리키고, 어떤 별은 길이 된다. 너는 뒤쪽이군.']);
      c.give('caravan_seal');
      await c.say('sahara', ['[y]대상단 통행패[/]다. 대상단 길은 북쪽. 레벨 2000은 넘기고 떠나라.', '보랏빛 숲은 늘 해 질 녘이야. 거기선 시간이 멈춰 있지. 슬픈 사람이 많은 숲이다.']);
      return;
    }
    if (s.quests.q_wolf == null && s.flags.button_back) {
      await c.say('sahara', ['대상단장 사하라다. 사막을 서른 번 건넜지.', '요즘 [y]모래 늑대[/]가 대상단을 노린다. 여덟 마리만 쫓아 줄 수 있나? 동쪽 모래 사막에 있다.']);
      W.markKills(s, 'sandwolf', 'q_wolf_base');
      c.quest('q_wolf', 0);
      return;
    }
    await c.run(W.chatter('sahara', ['별을 봐. 길은 거기 있다.', '황금별 옆 검은 점 쪽으로 짐승들이 몰려간다. 빛을 싫어하는 짐승들이 왜 빛 옆으로 갈까.', '보랏빛 숲의 베라 교수? 알지. 차를 대접하는데 늘 식어 있어.']));
  }

  /* ───────── 모래 사막 ───────── */
  W.map('desert', {
    name: '모래 사막', sub: '옐로 마을 동쪽', region: 'yellow', area: 'desert', theme: 'yellow', bg: '#5a4a1a', ki: W.ki('yellow', 0.46), music: 'yellow', weather: 'sand',
    grid: W.gen({
      w: 44, h: 34, seed: 'gold-desert', ground: 's', alt: [['.', 0.76, 5]],
      obst: [['C', 3], ['^', 3], ['R', 1]], dense: 0.68, sparse: 0.03, scale: 6,
      border: '#', bt: 2, rough: 0.5,
      lakes: [{ x: 20, y: 9, rx: 3, ry: 2, edge: '.' }],
      paths: [[[0, 17], [10, 17], [20, 13], [30, 17], [38, 17], [38, 8]], [[20, 13], [20, 12]], [[30, 17], [30, 27], [16, 28]]],
      clear: [[34, 3, 8, 6], [13, 25, 7, 5]],
      stamps: [{ x: 35, y: 3, rows: ['R####R', 'R#..#R', 'R#..#R'] }],
    }),
    edges: { left: { to: 'yellow', tx: 39, ty: 16 } },
    warps: [{ x: 37, y: 5, to: 'pyramid', tx: 14, ty: 28, dir: 'up' }, { x: 38, y: 5, to: 'pyramid', tx: 15, ty: 28, dir: 'up' }],
    objs: [
      W.sign(3, 16, ['모래 사막 — 물을 챙기시오.', '→ 태양 피라미드   ← 옐로 마을']),
      W.spot(22, 10, 3), W.spot(15, 27, 3), W.spot(5, 30, 10, true),
      W.chest('ds1', 18, 26, 'p3', 5), W.goldChest('ds2', 40, 20, 900000),
    ],
    mons: { list: ['scorpion', 'sandworm', 'cactus', 'mirage', 'sandwolf', 'sandwolf'], n: 12, area: [2, 2, 40, 30] },
  });
  W.map('pyramid', {
    name: '태양 피라미드', sub: '스핑크스의 방', region: 'yellow', area: 'pyramid', theme: 'yellow', bg: '#2a1e0a', ki: W.ki('yellow', 0.82), music: 'cave', dark: 80, darkColor: 'rgba(20,12,0,0.86)', battleBg: 'yellow',
    grid: W.gen({
      w: 30, h: 30, seed: 'sun-pyramid', ground: ':',
      obst: [['#', 5], ['R', 1]], dense: 0.5, sparse: 0.06, scale: 3,
      border: '#', bt: 1, rough: 0.8,
      paths: [[[14, 29], [14, 22], [6, 22], [6, 12], [14, 12], [22, 12], [22, 6], [15, 4]], [[14, 22], [24, 22], [24, 16]]], path: '=',
      clear: [[10, 1, 10, 5]],
      stamps: [{ x: 11, y: 1, rows: ['l......l'] }],
    }),
    warps: [{ x: 14, y: 29, to: 'desert', tx: 37, ty: 6, dir: 'down' }],
    objs: [W.bookObj('b_sphinx', 13, 1), W.spot(24, 16, 3), W.spot(3, 26, 10, true), W.chest('py1', 5, 13, 'p3', 5), W.goldChest('py2', 25, 21, 1500000)],
    mons: { list: ['mummy', 'mirage', 'cactus', 'mummy', 'scorpion'], n: 10, area: [1, 7, 28, 21] },
    fixed: [{ mon: 'sphinx', x: 15, y: 3, flag: 'beat_sphinx', boss: true, look: { creature: 'beast', tint: '#e8c860' }, talk: sphinxTalk }],
  });
  async function sphinxTalk(c, mo) {
    await c.say(null, '황금빛 사자 몸에 사람 얼굴을 한 거대한 석상이 눈을 떴다.');
    await c.say('sphinx', ['「아침에는 네 발, 점심에는 두 발, 저녁에는 세 발로 걷는 것은?」', '(스핑크스의 목소리가 방 안을 울린다)']);
    const k = await c.ask(null, ['사람', '토리아', '모르겠다']);
    if (k === 0) await c.say('sphinx', '「…정답이다. 그럼 싸우자.」');
    else if (k === 1) { await c.say('dotori:angry', '찍! 나는 계속 네 발이거든!'); await c.say('sphinx', '「…틀렸다. 그러니 싸우자.」'); }
    else await c.say('sphinx', '「솔직하군. 마음에 든다. 그러니 싸우자.」');
    const win = await c.battle('sphinx', { noFlee: true });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_sphinx');
    await c.say('sphinx', ['「…강하군. 흰빛의 아이.」', '「이것을 가져가라. 태양의 증표다. 황금궁의 문지기는 이것을 알아본다.」']);
    c.give('sun_token');
  }

  /* ───────── 옐로의 결: 참새단의 두목 · 소품 · 혼잣말 · 곁의 이야기 ───────── */
  // 아지트에서 나오는 순간: 털린 노점 주인과 경비대가 기다리고 있다
  async function sparrowAsk(c) {
    c.set('sparrow_asked');
    c.spawn({ id: 'guard_y', x: 7, y: 21, dir: 'up', look: G.chars.guard.look });
    c.spawn({ id: 'merchant_y', x: 5, y: 21, dir: 'up', look: G.chars.merchant.look });
    await c.emote('merchant_y', '!');
    await c.say('merchant', ['거기! 방금 그 굴에서 나왔지? 참새단 소굴 맞지?', '그 녀석들한테 우리 노점 셋이 털렸어. 한 집은 문을 닫았고. 두목이 누군지만 알려 줘.']);
    await c.say('guard', ['옐로 경비대다. 참새단 두목에게 현상금이 걸려 있다. 30만 골드.', '협조하면 네 버튼 도난 건도 서류로 처리해 주지.']);
    await c.say('dotori:worry', '{n}.');
    const k = await c.ask('참새단의 두목을 알려 줄까', ['모르는 애였다고 한다', '피카가 두목이라고 알려 준다']);
    if (k === 0) {
      await c.say('@', '…모르는 애였어요. 버튼은 골목에 떨어져 있었어요.');
      await c.say('merchant', ['…그래? 쳇. 그 굴에서 나오는 걸 봤는데.', '문 닫은 가게 주인은 애가 넷이야. 그것도 기억해 둬.']);
      c.decide('kkachi', 'spare', '참새단 두목 피카를 경비대에 넘기지 않았다');
      c.bond('kkachi', 1);
    } else {
      await c.say('guard', '피카. 그 녀석이군. 협조에 감사한다.');
      c.gold(300000);
      await c.narr(['그날 저녁, 경비대가 그늘 골목으로 들어갔다. 아이들 몇이 흩어져 달아났다.', '피카는 달아나지 않았다고 한다. 「애들한테 손대지 마. 나 혼자 했어.」']);
      await c.say('merchant', '…고맙다. 이제 좀 장사를 하겠군. 문 닫은 집도 다시 열 수 있을 거야.');
      c.decide('kkachi', 'report', '참새단 두목 피카를 경비대에 넘겼다');
      c.bond('kkachi', -2);
    }
    c.despawn('guard_y'); c.despawn('merchant_y');
  }
  G.hooks.enter.push((id) => {
    const s = G.state;
    if (id === 'yellow' && s.flags.button_back && !s.flags.sparrow_asked && !G.script.running) G.script.run(sparrowAsk);
  });
  const reported = (s) => s.flags.d_kkachi === 'report';
  for (const [mapId, prev] of [['yellow', (s) => s.flags.button_back], ['hideout', () => true]]) {
    const n = G.maps[mapId].npcs.find((x) => x.id === 'kkachi');
    n.cond = (s) => prev(s) && !reported(s);
  }
  W.addNpcs('palace', [{ id: 'kkachi', x: 12, y: 5, dir: 'left', cond: reported, talk: W.chatter('kkachi_palace', [
    '……장부 정리 중이야. 말 걸지 마.',
    ['금화왕이 그러더라. 「감옥이랑 장부 중에 골라.」 …장부를 골랐어.', '애들은 사하라 대상단이 데려갔대. 빵은 먹고 있대. …그거면 됐어.'],
    '넌 틀린 거 안 했어. 노점 아저씨들도 애가 있으니까. …그러니까 미안한 얼굴 하지 마. 그게 더 싫어.',
  ]) }]);
  W.addNpcs('hideout', [{ id: 'kid', x: 5, y: 3, dir: 'down', cond: reported, talk: W.chatter('hide_empty', ['…형 없어. 잡혀갔어.', '누가 일렀대. …너 아니지?']) }]);

  W.addObjs('yellow', [
    W.prop('well', 17, 20, '오아시스 물을 끌어온 공동 우물. 우물가에 「한 사람 한 바가지」라고 적혀 있다. 누군가 「경험세 없음」이라고 덧붙였다.'),
    W.prop('bench', 15, 24),
    W.prop('board', 26, 10, (s) => ['경험 거래소 게시판. 「오늘의 매입가 — 평민 아이 0.3골드」', s.flags.d_goldie === 'contract' ? '그 위에 새 종이: 「아이 매입가 0.9골드. 20세 되살 권리 보장. — 금화왕」' : s.flags.d_goldie === 'expose' ? '종이가 전부 찢겨 있다. 누군가 숯으로 적었다: 「천년성 납품」.' : '구석에 작은 글씨: 「전설의 경험 — 매입 불가」.']),
    W.prop('shrine', 36, 3, '태양 사당. 사막 사람들은 떠나기 전에 여기서 물 한 방울을 바친다. 돌 위에 물 자국이 셀 수 없이 겹쳐 있다.'),
  ]);
  W.addObjs('caravan', [W.prop('fire', 20, 4, '대상단의 모닥불. 사막의 밤은 낮보다 무섭다. 불은 밤새 꺼지지 않는다.')]);
  W.barks('yellow', {
    guard: ['금화왕님은 바쁘시다.'],
    merchant: ['전갈 독침 삽니다!', '정직한 거래!'],
    merchant2: ['짤랑짤랑!'],
    kkachi: ['오늘은 안 훔쳐.', '언젠가 금화왕…'],
    kid: ['…뭘 봐.'],
    kid2: ['배고파.', '레벨 6…'],
    oldman: ['집은 있는데…', '레벨이 3이야.'],
  });
  W.barks('caravan', { sahara: ['별을 봐.'], merchant: ['물약 넉넉히!'] });
  W.barks('casino', { lucky: ['확률은 공정합니다.'] });

  /* 토리아와의 이야기 (4장) */
  G.story.talks.push(
    { id: 'y_nobutton', when: (s) => !!s.flags.button_stolen, pri: 3, run: async (c) => {
      await c.say('dotori', ['너 손이 자꾸 주머니를 더듬어. 버튼 없으니까 이상하지?', '…나도 이상해. 버튼이 없으니까 네가 그냥 열여섯 살 애 같아. 원래 그런데.']);
    } },
    { id: 'y_kids', when: (s) => !!s.flags.button_back, run: async (c) => {
      await c.say('dotori', ['피카네 애들은 레벨을 팔아서 밥을 먹는대.', '나는 레벨이 안 올라서 16년 동안 속상했는데. 쟤들은 일부러 내리고 있어.']);
      const k = await c.ask(null, ['그 애들 잘못이 아니야.', '팔지 않고 버티는 방법도 있을 거야.', '레벨보다 밥이 먼저지.']);
      if (k === 0) await c.say('dotori', '…응. 그럼 누구 잘못이야? 경험을 사는 사람? 세금을 걷는 탑? 탑을 세운 사람? …다 따라가면 끝에 누가 있을까.');
      else if (k === 1) await c.say('dotori', ['…배고파 본 적 있어? 나는 겨울에 도토리 다 떨어졌을 때 한 번.', '버티는 건 배부른 사람 말이래. 할머니가 그랬어. 할머니도 옛날에 배고팠대.']);
      else { await c.say('dotori', '맞아. 레벨은 다시 올릴 수 있지만 굶은 날은 다시 못 먹어.'); c.bond('dotori', 1); }
    } },
    { id: 'y_goldie', when: (s) => !!s.flags.m_yellow_bond, run: async (c) => {
      await c.say('dotori', ['골디 아저씨, 엄마한테 동전 빌리고 못 갚았대.', '16년 동안 갚을 사람이 없는 빚을 들고 있었던 거야. 그래서 그렇게 셈을 따지나 봐.']);
      if (c.s.flags.d_goldie === 'expose') await c.say('dotori:worry', '…우리가 장부 뿌린 거, 잘한 걸까. 광장에서 돌 던지는 사람들 봤을 때 무서웠어. 애들 표정도.');
      else if (c.s.flags.d_goldie === 'contract') await c.say('dotori', '계약서에 네 이름이 증인으로 들어갔어. 엄마가 빌려준 동전이 16년 만에 이자가 붙은 것 같아. 찍.');
    } },
    { id: 'y_mirage', map: 'desert', run: async (c) => {
      await c.say('dotori:surprise', ['찍! 저기 누가 서 있어! 긴 머리, 흰 옷…', '…없어졌다. 신기루래. 사막에선 보고 싶은 게 보인대.']);
      await c.say('dotori', '…나 뭘 보고 싶었던 걸까.');
    } },
  );
  const PS = '\n\n추신. 토리아 발 도장 봤다. 잉크 묻은 발로 이불 밟지 마라 캐라.';
  W.book('b_reply_book', { title: '할머니의 답장', group: 'reply', where: '오아시스 여관', author: '에벨린', text:
    '다 읽었다니. 그 아 글씨는 여전히 둥글더나.\n\n할매는 그 책 끝에 편지가 끼워진 걸 알았다. 16년 동안 알았다. 니가 그 편지를 니 발로 걸어가서 찾기를 바랐다. 할매 손으로 주믄 반쪽밖에 안 되니까.\n\n원망해도 된다. 할매는 원망 들을 자격이 있다.' + PS });
  W.book('b_reply_why', { title: '할머니의 답장', group: 'reply', where: '오아시스 여관', author: '에벨린', text:
    '왜 말 안 해 줬냐고.\n\n무서웠다. 니 엄마 이야기를 하믄, 그 끝에 누가 있는지까지 말해야 되니까. 그 사람 이야기까지.\n\n할매가 비겁했다. 그건 맞다. 그래도 니가 물어봐 줘서 고맙다. 16년 동안 아무도 안 물어봤다. 할매한테 그 아 이야기를.' + PS });
  W.book('b_reply_fine', { title: '할머니의 답장', group: 'reply', where: '오아시스 여관', author: '에벨린', text:
    '밥 잘 먹는다니 됐다. 그거면 된다.\n\n…거짓말하지 마라. 니 글씨는 거짓말할 때 삐뚤어진다. 니 엄마도 그랬다.\n\n힘든 거 있으믄 힘들다 캐라. 할매는 멀리 있어도 그 말 정도는 들을 수 있다.' + PS });
  /* 쉬는 밤 (4장): 할머니의 답장 */
  G.story.nights.push(
    { id: 'y_reply', when: (s) => !!s.flags.letter_gran, intro: '오아시스 여관. 여관 주인이 편지 한 통을 건넸다. 「그린 마을에서 온 우편이에요. 새싹 도장이 찍혀 있네요.」', run: async (c) => {
      const L = c.s.flags.letter_gran;
      await c.book('b_reply_' + L);
      await c.say('dotori', L === 'fine' ? '…들켰다. 찍.' : '…할머니 글씨, 떨렸어. 편지 쓸 때 손이 떨렸나 봐.');
      c.bond('gran', 1, true);
    } },
  );

  G.world.nodes.push({ region: 'yellow', label: '옐로', x: 116, y: 136, color: '#ffd43b', maps: ['yellow', 'desert', 'pyramid', 'palace', 'casino', 'hideout', 'yellow_rank', 'yellow_inn', 'caravan'] });
})();
