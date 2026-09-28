/* 5장 「해 질 녘의 진실」 — 대상단 길 · 퍼플 마을 · 라벤더 학원 · 세린의 연구실 · 보랏빛 숲 · 진실의 거울 연못 · 983년의 기억 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data;

  W.keyItem('spell_page', '미루의 주문서 쪽지', '마녀의 고양이들이 물어 갔던 주문서 쪽지. 침이 묻어 있다.');
  W.keyItem('teacup', '베라의 찻잔', '금이 간 찻잔. 16년 동안 두 번 떨어졌다.');

  W.quest('m5', { main: true, name: '5장 · 해 질 녘의 진실', where: '퍼플 마을', stages: [
    '[y]레벨 2000[/]을 넘기고 대상단 길을 지나 보랏빛 숲의 퍼플 마을로 가자.',
    '[y]라벤더 학원[/]에서 세린의 스승 베라 교수를 찾자.',
    '보랏빛 숲에서 [y]달맞이꽃[/]을 캐 베라 교수에게 가져가자.',
    '숲 동쪽 끝 [y]진실의 거울 연못[/]에서 비추 할멈을 만나자.',
    '라벤더 학원의 베라 교수에게 돌아가자.',
    '[y]레벨 6000[/]과 [r]괴짜 1차[/]가 되면 북쪽 무지개 다리를 건너 무지개 마을로 가자. 괴짜의 문은 빨간 구슬 넷의 숫자를 더해 연다.',
  ], done: '무지개 다리 너머에서 천년제 준비가 한창이었다.' });
  W.quest('q_miru', { name: '낙제생의 주문서', where: '보랏빛 숲', stages: ['보랏빛 숲의 [y]마녀의 고양이[/] 6마리를 혼내 주고 미루의 주문서 쪽지를 되찾자.', '미루에게 쪽지를 돌려주자.'], done: '미루는 주문을 외웠다. 불 대신 꽃이 피었다. 오늘은 그게 정답이었다.' });
  W.quest('q_teacup', { name: '금 간 찻잔', where: '라벤더 학원', stages: ['몬스터에게서 [y]반딧불 가루[/] 5개를 모아 베라 교수의 찻잔을 붙이자.'], done: '찻잔에 금 자국이 빛난다. 베라 교수는 그게 더 마음에 든다고 했다.' });
  W.quest('q_ghost', { name: '연못을 흐리는 것들', where: '진실의 거울 연못', stages: ['연못 주변의 [y]거울 유령[/] 8마리를 쫓아내자.', '비추 할멈에게 알리자.'], done: '연못물이 다시 맑아졌다.' });

  W.book('b_vera_notes', { title: '베라의 수업 노트 — 빛의 세 원칙', where: '라벤더 학원', author: '베라', text:
    '첫째. 빛은 쌓인다. 반복하는 모든 것은 빛이 된다. 차를 끓이는 것도.\n\n' +
    '둘째. 빛은 흐른다. 가둔 빛은 썩고, 흐르는 빛은 자란다. 그래서 선생은 가르치고, 대장장이는 제자를 둔다.\n\n' +
    '셋째. 빛은 쏠리면 위험하다. 한곳에 너무 많이 모인 빛은 무언가를 부른다. (이 원칙은 983년 이후 교과서에서 삭제되었다. 나는 칠판에 계속 쓴다.)\n\n' +
    '(여백, 둥근 글씨) 교수님, 셋째 원칙 증명할게요. 꼭. — 세린' });
  W.book('b_poems', { title: '퍼플 시집 「해 질 녘」', where: '퍼플 마을', text:
    '이 숲에는 밤이 오지 않는다\n누군가 해가 지는 것을 멈춰 두었다\n\n그래서 우리는 늘 조금 슬프고\n늘 조금 아름답다\n\n' +
    '— 「해 질 녘」 전문\n\n(주석) 983년 이후 이 숲의 해는 한 번도 지지 않았다. 사람들은 숲이 무언가를 기다린다고 말한다.' });
  W.book('b_share', { title: '흰빛 나눔 실험 기록', where: '세린의 연구실', author: '세린, 베라 공저 · 983년 금서', text:
    '실험 1. 빛바램병 환자 A(9세, 평민 1차)의 손을 잡고 렙업. 결과: 환자의 머리칼이 분홍색으로 돌아옴. 연구자의 레벨은 줄지 않음.\n\n' +
    '실험 7. 시든 화분에 손을 얹고 렙업. 결과: 꽃이 핌. 흰빛은 사람이 아닌 것에도 나눌 수 있다.\n\n' +
    '실험 12. 꺼진 등불에 렙업. 결과: 등불이 켜짐. 흰빛으로 켠 불은 꺼지지 않는다.\n\n' +
    '결론. 흰빛은 나눌수록 줄지 않는다. 흰빛의 그릇에 끝이 없는 이유는 담기 위해서가 아니라 [w]흘려보내기 위해서[/]일지도 모른다.\n\n' +
    '추가 관찰 (베라). 이 연구가 알려지면 누군가는 흰빛을 가두려 할 것이다. 흰빛을 가두면 무엇이 되는가? 나는 그것이 두렵다.' });
  W.book('b_serin_diary', { title: '세린의 일기 — 학원 시절', where: '세린의 연구실', author: '세린', text:
    '975년. 오늘 챔피언 결정전을 봤다. 카이론이라는 사람이 이겼다. 열아홉 살. 나보다 한 살 많다. 이기고 나서 하나도 안 웃었다. 이상한 사람.\n\n' +
    '977년. 카이론이 학원에 왔다. 흰빛에 대해 묻고 싶다고. 옆에 그림자 같은 사람이 있었다. 녹턴이라고 했다. 말을 한 마디도 안 했는데, 찻잔을 치워 줬다.\n\n' +
    '980년. 방순 선생님한테 창을 배운다. 선생님은 카이론의 스승이기도 하다. 카이론이 선생님 앞에서는 웃는다. 딱 한 번 봤다.\n\n' +
    '982년. 흑점이 온다. 카이론은 매일 밤 계산을 한다. 나는 그 옆에서 차를 끓인다. 그가 말했다. 「계산이 안 맞아. 누군가 희생해야 해.」 나는 대답하지 않았다.\n\n' +
    '983년 새싹의 달. 아기가 웃었다. 오늘도 렙업, 내일도 렙업.' });
  W.book('b_mirror', { title: '거울 연못의 전설', where: '진실의 거울 연못', text:
    '보랏빛 숲 동쪽 끝에 달이 비치지 않는 연못이 있다. 연못은 얼굴 대신 기억을 비춘다.\n\n' +
    '연못을 들여다본 사람은 가장 알고 싶은 것을 본다. 대부분은 그것을 보고 후회한다. 알고 싶은 것과 알아야 하는 것은 다르기 때문이다.\n\n' +
    '연못지기는 앞을 보지 못한다. 그래서 연못이 보여 주는 것에 속지 않는다.' });
  W.book('b_moon', { title: '보름달과 마수', where: '보랏빛 숲', text:
    '숲의 수호수 달빛 마수는 보름달이 뜨면 깨어난다.\n그런데 983년 이후 이 숲에는 밤이 오지 않는다. 밤이 오지 않으니 보름달도 뜨지 않는다.\n\n' +
    '그럼 마수는? 16년째 반쯤 깨어 있다. 잠결에 사람을 문다. 조심할 것.' });

  /* ───────── 대상단 길 ───────── */
  W.map('purple_road', {
    name: '대상단 길', sub: '사막에서 숲으로', region: 'purple', area: 'purple_road', theme: 'purple', bg: '#2a1a3a', ki: W.ki('purple', 0.08), music: 'field', weather: 'leaf', tint: 'rgba(120,60,40,0.12)',
    grid: W.gen({
      w: 28, h: 34, seed: 'caravan-road', ground: '.', alt: [['s', 0.62, 4], [',', 0.66, 3]],
      obst: [['T', 3], ['^', 2], ['C', 1]], dense: 0.6, sparse: 0.04, scale: 5,
      border: 'T', bt: 2, rough: 0.5,
      paths: [[[14, 33], [14, 26], [8, 20], [8, 12], [16, 8], [16, 0]], [[8, 16], [20, 16]]],
      clear: [[17, 14, 6, 5]],
    }),
    builds: [{ x: 18, y: 14, w: 3, h: 2, style: 'tent', roof: '#c87a3a' }],
    edges: { down: { to: 'caravan', tx: 13, ty: 0 }, up: { to: 'purple', tx: 18, ty: 29 } },
    objs: [W.sign(15, 30, ['대상단 길', '↑ 보랏빛 숲 · 퍼플 마을   ↓ 대상단 천막']), W.spot(20, 17, 3), W.spot(4, 28, 10, true), W.chest('pr1', 22, 17, 'p4', 3)],
    npcs: [{ id: 'sahara', x: 17, y: 17, dir: 'right', talk: W.chatter('sahara_road', ['여기까지가 대상단의 길이다. 숲에는 대상단이 들어가지 않아. 숲이 싫어해.', '숲 안은 늘 해 질 녘이야. 시간이 멈춘 곳이지. 너는 멈추지 마라.']) }],
    mons: { list: ['moonbat', 'fairyfire', 'sandwolf', 'moonbat'], n: 8, area: [2, 2, 24, 30] },
    enter: async (c) => {
      if (c.flag('ch5')) return;
      c.set('ch5');
      c.quest('m4', 'done');
      await c.chapter('5장', '해 질 녘의 진실', '숲에 들어서자 하늘이 주황빛으로 멈췄다. 이 숲에는 16년째 밤이 오지 않는다.');
      await c.say('dotori:worry', ['찍… 하늘이 이상해. 방금까지 한낮이었는데 갑자기 노을이야.', '여기가 보랏빛 숲… 엄마의 스승님이 있는 곳.']);
      c.quest('m5', 1);
    },
  });

  /* ───────── 퍼플 마을 ───────── */
  W.map('purple', {
    name: '퍼플 마을', sub: '늘 해 질 녘인 숲', region: 'purple', area: 'purple', theme: 'purple', bg: '#2a1a3a', ki: W.ki('purple', 0.03), town: true, weather: 'firefly', tint: 'rgba(120,50,80,0.14)',
    grid: W.gen({
      w: 36, h: 30, seed: 'purple-village', ground: '.', alt: [[',', 0.7, 4], ['"', 0.8, 3]],
      obst: [['T', 3], ['M', 1], ['t', 1]], dense: 0.8, sparse: 0.015, scale: 5,
      border: 'T', bt: 2, rough: 0.5,
      lakes: [{ x: 28, y: 22, rx: 3, ry: 2 }],
      paths: [[[18, 29], [18, 10]], [[18, 14], [7, 14], [7, 10]], [[18, 14], [29, 14], [29, 10]], [[18, 10], [18, 0]], [[7, 18], [7, 14]], [[18, 20], [25, 20]], [[35, 16], [29, 16], [29, 14]]],
      clear: [[12, 2, 12, 8], [4, 5, 7, 5], [26, 5, 6, 5], [4, 18, 6, 5], [15, 13, 7, 5, ':']],
      stamps: [{ x: 14, y: 13, rows: ['l'] }, { x: 22, y: 17, rows: ['l'] }, { x: 17, y: 22, rows: ['M'] }, { x: 20, y: 24, rows: ['M'] }],
    }),
    builds: [
      { x: 12, y: 3, w: 12, h: 6, door: 6, style: 'castle', roof: '#6a4ab0', wall: 'purple', icon: 'book', signColor: '#e0c8ff', to: 'academy', tx: 10, ty: 12 },
      { x: 4, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'purple', icon: 'star', signColor: '#c8d0ff', to: 'purple_rank', tx: 5, ty: 6 },
      { x: 26, y: 5, w: 6, h: 4, door: 3, roof: '#8a3ab0', wall: 'purple', icon: 'potion', to: 'purple_shop', tx: 5, ty: 6 },
      { x: 4, y: 18, w: 6, h: 4, door: 3, roof: '#c86a3a', wall: 'wood', icon: 'bed', to: 'purple_inn', tx: 5, ty: 6 },
      { x: 18, y: 15, w: 2, h: 3, style: 'tower' },
    ],
    edges: { down: { to: 'purple_road', tx: 16, ty: 0 }, up: { to: 'purple_forest', tx: 20, ty: 33 }, right: { to: 'rainbow_bridge', tx: 0, ty: 7, req: { lv: 6000, rank: ['r2', 1] }, msg: '동쪽 무지개 다리. 다리 앞 푯말: 「괴짜 이상만 건널 수 있음 — 천년제 위원회」' } },
    objs: [
      W.sign(17, 26, ['퍼플 마을 — 늘 해 질 녘인 숲', '↑ 라벤더 학원 · 보랏빛 숲   → 무지개 다리 (괴짜 1차 · 레벨 6000)']),
      W.bookObj('b_poems', 23, 20),
      W.spot(30, 22, 3), W.spot(32, 4, 10, true),
      { t: 'sign', x: 18, y: 17, invisible: true, text: ['퍼플 마을의 징수탑. 탑 둘레에 누군가 시를 적어 붙였다.', '「빛을 먹는 탑아 / 너는 배부르냐 / 우리는 해 질 녘이다」'] },
    ],
    npcs: [
      { id: 'mage', x: 13, y: 16, dir: 'down', wander: 2, talk: W.chatter('p_mage', ['해 질 녘이 16년째야. 처음엔 아름다웠지. 지금은… 여전히 아름다워. 그게 문제야.', '베라 교수님은 학원 맨 안쪽 연구실에 계셔. 차를 권하시면 마셔. 식었어도.', '보랏빛 숲 동쪽 끝의 거울 연못은 기억을 비춰. 가 본 사람은 다들 한동안 말이 없어져.']) },
      { id: 'mage2', speaker: 'mage', x: 24, y: 12, dir: 'left', look: { hair: 'witch', hc: '#e8a0c8', top: '#8a4ab0', bottom: '#3a2a5a', acc: '#5a3a8a' }, talk: W.chatter('p_mage2', ['여기 사람들은 말을 시처럼 해. 나도 해 볼까? 「오늘도 렙업 / 내일도 렙업 / 모레는 쉬자」', '라벤더 학원 낙제생 미루 알아? 7년째 1학년이야. 착한 애인데 주문을 늘 한 글자씩 틀려.']) },
      { id: 'kid2', x: 8, y: 15, dir: 'right', wander: 2, talk: W.chatter('p_kid', ['나는 밤을 한 번도 본 적 없어. 밤에는 별이 뜬다며? 거짓말 같아.', '반딧불이는 밤에 빛난대. 근데 여기 반딧불이는 해 질 녘에도 빛나. 기다리다 지쳤대.']) },
    ],
  });
  W.town({ map: 'purple', x: 18, y: 19, name: '퍼플 마을', color: '#c49bff', desc: '늘 해 질 녘인 숲 속 마을. 라벤더 학원.', hint: '옐로 사막 북쪽 대상단 길 너머' });

  W.map('purple_rank', {
    name: '퍼플 마을 등급소', region: 'purple', area: 'purple', theme: 'interior', bg: '#140a1e', ki: W.ki('purple', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'purple', 7, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 지팡이를 들고 있다.', '퍼플 사람들은 아우룸이 마법사였다고 믿는다. 시인이었다고 믿는 사람도 있다.'] }],
    npcs: [W.clerk('clerk_p', 5, 3, { hello: '「그대여 레벨과 골드를 가져오라 / 도장은 붉고 / 등급은 높다」 …등급소입니다.', bye: '「가라 그대여 / 오늘도 렙업」' })],
  });
  W.map('purple_shop', {
    name: '마법 잡화점 「별가루」', region: 'purple', area: 'purple', theme: 'interior', bg: '#140a1e', ki: W.ki('purple', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '+', door: 5, win: [2, 7], put: [[1, 2, 'h'], [2, 2, 'M'], [7, 2, 'M'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, '@'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'purple', 29, 9)],
    npcs: [W.keeper('mage', 'purple', 4, 3, '별가루 잡화점이에요. 달빛 장갑은 누를수록 밤처럼 고요해져요. …밤을 모르는 숲에서 파는 게 좀 웃기죠?')],
  });
  W.map('purple_inn', {
    name: '보랏빛 등잔 여관', region: 'purple', area: 'purple', theme: 'interior', bg: '#140a1e', ki: W.ki('purple', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'purple', 7, 22)],
    npcs: [W.innkeeper('innkeeper', 4, 4, 0, '보랏빛 등잔 여관이에요. 창밖이 늘 노을이라 잠들기 어렵다고들 하죠. 커튼은 두꺼워요.')],
  });

  /* ── 라벤더 학원 ── */
  W.map('academy', {
    name: '라벤더 학원', sub: '마법과 시의 학교', region: 'purple', area: 'purple', theme: 'castle', bg: '#140a1e', ki: W.ki('purple', 0.06), music: 'purple',
    grid: W.room({ w: 20, h: 14, floor: '-', door: 10, win: [4, 8, 12, 16], rug: [9, 3, 3, 10], put: [
      [1, 2, 'h'], [2, 2, 'h'], [3, 2, 'h'], [16, 2, 'h'], [17, 2, 'h'], [18, 2, 'h'], [9, 2, 'D'], [10, 2, 'D'], [11, 2, 'D'],
      [3, 5, 'd'], [5, 5, 'd'], [3, 7, 'd'], [5, 7, 'd'], [14, 5, 'd'], [16, 5, 'd'], [14, 7, 'd'], [16, 7, 'd'], [1, 11, 'p'], [18, 11, 'p'], [1, 9, '@'], [18, 9, '@']] }),
    warps: [W.exit(10, 13, 'purple', 18, 9), { x: 10, y: 2, to: 'serin_lab', tx: 6, ty: 7, dir: 'up' }],
    objs: [
      W.gate(9, 2, {}, '「세린의 연구실」 문패가 걸린 방. 문이 잠겨 있다. 16년 동안 한 번도 열리지 않은 것 같다.', { open: (s) => !!s.flags.lab_open }),
      W.gate(10, 2, {}, '「세린의 연구실」 문이 잠겨 있다.', { open: (s) => !!s.flags.lab_open }),
      W.gate(11, 2, {}, '「세린의 연구실」 문이 잠겨 있다.', { open: (s) => !!s.flags.lab_open }),
      W.bookObj('b_vera_notes', 17, 2),
    ],
    npcs: [
      { id: 'vera', x: 10, y: 5, dir: 'down', mark: (s) => (s.quests.m5 === 1 || s.quests.m5 === 2 && E.has(s, 'moon_herb') || s.quests.m5 === 4 || (s.flags.m_purple_vera && s.quests.q_teacup == null) || (s.quests.q_teacup === 0 && E.has(s, 'm9', 5)) ? '!' : null), talk: veraTalk },
      { id: 'miru', x: 4, y: 9, dir: 'right', mark: (s) => (s.flags.m_purple_vera && s.quests.q_miru == null) || s.quests.q_miru === 1 ? '!' : null, talk: miruTalk },
      { id: 'mage', x: 15, y: 9, dir: 'left', talk: W.chatter('ac_mage', ['수업 중이야. …사실 교수님이 차 끓이러 가셔서 자습 중이야. 16년째.', '세린 선배는 전설이야. 흰빛으로 시든 꽃을 피웠대. 학원 화단에 아직 그 꽃이 있어.']) },
    ],
  });
  async function veraTalk(c) {
    const s = c.s;
    if (s.quests.m5 === 1) {
      await c.say(null, '보랏빛 망토의 노부인이 찻잔을 들고 창밖의 노을을 보고 있다.');
      await c.say('vera', '…학원은 견학 신청을 받지 않아요. 차가 식기 전에 용건을 말해요. 이미 식었지만.');
      c.npc('vera').face('@');
      await c.wait(0.4);
      c.sfx('bump');
      await c.say(null, '쨍그랑—. 노부인의 손에서 찻잔이 떨어져 바닥에 금이 갔다.');
      await c.emote('vera', '!');
      await c.say('vera:surprise', ['……', '…두 번째로군. 찻잔을 떨어뜨린 건.']);
      await c.say('vera', ['첫 번째는 흰빛의 제자가 학원 문을 열고 들어오던 날이었어요. 열여섯 살이었지.', '그 아이와 똑같은 눈이군요. …세린의 아이.']);
      await c.say('@', '엄마를 가르치셨다고 들었어요. 엄마에 대해… 알고 싶어요.');
      await c.say('vera', ['…16년 동안, 나는 입을 다물었어요. 천년성의 명령이 무서워서가 아니라, 말하면 그게 사실이 될까 봐.', '그러니 내 입으로는 말하지 않겠어요. 대신 보여 주죠. 숲 동쪽 끝의 [y]진실의 거울 연못[/]이 보여 줄 거예요.']);
      await c.say('vera', ['다만 그 전에 부탁이 있어요. 숲에서 [y]달맞이꽃[/]을 캐다 줘요. 연못을 보고 나면… 그 꽃으로 달인 차가 필요할 거예요.', '달맞이꽃은 원래 밤에만 피는데, 이 숲엔 밤이 없어서 16년째 반쯤 피어 있어요. 숲 한가운데 있을 거예요.']);
      c.set('m_purple_vera');
      c.give('teacup');
      c.quest('m5', 2);
      return;
    }
    if (s.quests.m5 === 2 && E.has(s, 'moon_herb')) {
      await c.say('vera', ['달맞이꽃. 반쯤 핀 채로군요. 우리 숲 같아.', '이제 거울 연못으로 가요. 연못지기 [y]비추[/]가 기다리고 있을 거예요. 앞을 못 보지만, 누구보다 잘 보는 사람이에요.']);
      c.quest('m5', 3);
      return;
    }
    if (s.quests.m5 === 4) return veraReveal(c);
    if (s.quests.q_teacup === 0 && E.has(s, 'm9', 5)) {
      c.take('m9', 5);
      c.take('teacup');
      await c.say('vera', ['반딧불 가루. 이걸로 금을 메우면 금 자국이 빛나요. 동쪽 나라에서는 그걸 깨진 그릇을 더 아름답게 만드는 기술이라 부르죠.', '…고마워요. 이 찻잔은 세린이 준 거예요.']);
      c.give('x4');
      c.quest('q_teacup', 'done');
      return;
    }
    if (s.flags.m_purple_vera && s.quests.q_teacup == null && E.has(s, 'teacup')) {
      await c.say('vera', ['그 찻잔… 금이 간 채로 가지고 있었군요.', '혹시 [y]반딧불 가루[/] 5개를 구해 올 수 있나요? 숲의 달빛 박쥐나 도깨비불이 떨어뜨려요. 그걸로 금을 메울 수 있어요.']);
      c.quest('q_teacup', 0);
      return;
    }
    await c.run(W.chatter('vera', [
      '차 마실래요? 식었어요. 이 숲에서는 차도 해 질 녘에 멈춰요.',
      ['세린은 첫 수업에서 이렇게 말했어요. 「교수님, 빛은 왜 나누면 줄어요?」', '나는 대답했지. 「줄지 않는 빛도 있단다.」 그 아이는 그 말을 평생 증명하려고 했어요.'],
      '흰빛을 나누는 법은 간단해요. 누군가를 향해 렙업하면 돼요. 어려운 건 누구를 향할지 정하는 거죠.',
    ]));
  }
  async function veraReveal(c) {
    c.music('mother');
    await c.say('vera', ['…보고 왔군요. 얼굴을 보니 알겠어요.', '달맞이꽃 차예요. 이번 건 따뜻해요. 16년 만에 처음 데웠어요.']);
    await c.say('@', '…엄마가 흑점을 삼켰어요. 카이론이라는 사람은… 할머니랑 싸웠고요.');
    await c.say('vera', ['그래요. 방순이… 초록의 사천왕 [y]초록 창 오방순[/]은 경험세에 반대한 유일한 사천왕이었어요.', '그리고 졌죠. 카이론은 스승을 이겼어요. 그날 이후 초록의 자리는 16년째 비어 있어요.']);
    await c.say('vera', ['봉인은 16년짜리였어요. 세린의 그릇이 흑점을 가둘 수 있는 시간.', '올해가 999년. 내년이 천년력 1000년. 무지개 마을의 [y]천년제[/] 날 밤이 바로 16년째 되는 날이에요.']);
    await c.say('vera', ['그날 봉인이 풀리면 흑점이 돌아와요. 그리고 세린은…', '……카이론이 무엇을 준비하는지는 나도 몰라요. 하지만 그가 16년 동안 대륙의 빛을 모은 이유가 그날을 위해서라는 건 알아요.']);
    await c.say('vera', ['세린의 연구실을 열어 줄게요. 16년 동안 청소만 하고 아무것도 치우지 않았어요.', '거기 있는 책은 전부 네 거예요. 특히 「흰빛 나눔 실험 기록」. 세린과 내가 같이 쓴, 대륙에서 가장 위험한 책이죠.']);
    c.set('lab_open');
    c.set('m_purple_vision');
    await c.say('vera', ['그리고 무지개 마을로 가요. 천년제 준비가 한창일 거예요. 동쪽 무지개 다리는 [r]괴짜[/] 이상만 건널 수 있어요.', '괴짜의 문은 빨간 구슬 넷의 숫자를 더해 열어요. …모았죠? 세린도 그렇게 올라갔어요.']);
    c.quest('m5', 5);
    c.music('purple');
  }
  async function miruTalk(c) {
    const s = c.s;
    if (s.quests.q_miru === 0 && W.killsSince(s, 'witchcat', 'q_miru_base') >= 6) { c.quest('q_miru', 1); c.give('spell_page', 1, true); }
    if (s.quests.q_miru === 1) {
      c.take('spell_page');
      await c.say('miru:happy', ['내 주문서 쪽지! 고양이 침이 잔뜩 묻었지만… 읽을 수 있어!', '보, 보여 줄게. 불꽃 주문! 「타올라라, 붉은…」']);
      c.flash('#ff8ae8', 400);
      await c.say(null, '펑—. 미루의 지팡이 끝에서 불꽃 대신 분홍 꽃이 한 다발 피어났다.');
      await c.say('miru:sad', '…또 틀렸다. 7년째야.');
      await c.say('@', '예쁜데?');
      await c.say('miru:happy', ['…정말? 예뻐?', '베라 교수님도 그랬어. 「틀린 주문이 늘 틀린 건 아니란다.」 …고마워!']);
      c.give('f4', 3); c.gold(15000000);
      c.quest('q_miru', 'done');
      return;
    }
    if (s.quests.q_miru === 0) { await c.say('miru', '마녀의 고양이들은 숲 곳곳에 있어. 여섯 마리쯤 혼내 주면 쪽지를 뱉어 낼 거야!'); return; }
    if (s.flags.m_purple_vera && s.quests.q_miru == null) {
      await c.say('miru', ['아, 안녕! 나는 미루. 라벤더 학원… 7년 차 1학년이야.', '주문서 쪽지를 숲의 [y]마녀의 고양이[/]들이 물어 갔어. 고양이들이 마법을 반쯤 배워서 무서워…', '여섯 마리만 혼내 주면 쪽지를 돌려받을 수 있을 거야. 부탁해!']);
      W.markKills(s, 'witchcat', 'q_miru_base');
      c.quest('q_miru', 0);
      return;
    }
    await c.say('miru', '흰빛 선배님이다… 아니, 흰빛 후배님인가? 어쨌든 멋지다!');
  }
  W.map('serin_lab', {
    name: '세린의 연구실', region: 'purple', area: 'purple', theme: 'interior', bg: '#140a1e', ki: W.ki('purple', 0.06), music: 'mother', banner: false,
    grid: W.room({ w: 12, h: 9, floor: '-', door: 6, win: [3, 8], put: [[1, 2, 'h'], [2, 2, 'h'], [9, 2, 'h'], [10, 2, 'h'], [5, 3, 'd'], [6, 3, 'd'], [1, 6, 'f'], [2, 6, 'f'], [9, 6, 'p'], [10, 6, 'q']] }),
    warps: [{ x: 6, y: 8, to: 'academy', tx: 10, ty: 3, dir: 'down' }],
    objs: [W.bookObj('b_share', 5, 3), W.bookObj('b_serin_diary', 9, 2), { t: 'sign', x: 1, y: 6, invisible: true, text: ['화분에 흰 꽃이 피어 있다. 16년 동안 한 번도 물을 주지 않았는데 시들지 않았다.', '흰빛으로 피운 꽃은 지지 않는다.'] }],
    enter: async (c) => {
      if (c.flag('lab_seen')) return;
      c.set('lab_seen');
      await c.say(null, ['16년 동안 멈춰 있던 방. 책상 위에 펼쳐진 공책, 식은 찻잔 자국, 창가의 흰 꽃.', '먼지 하나 없다. 누군가 매일 청소했다.']);
      await c.say('dotori:sad', '…찍. 이 냄새… 기억나. 나, 여기 와 본 적 있어.');
      await c.say('dotori:sad', ['아주 어릴 때. 어떤 사람이 나를 쓰다듬어 줬어. 손이… 하얗게 빛났어.', '그래서 나, 16년 동안 날 수 있을 것 같은 기분이었나 봐.']);
    },
  });

  /* ───────── 보랏빛 숲 ───────── */
  W.map('purple_forest', {
    name: '보랏빛 숲', sub: '해가 지지 않는 숲', region: 'purple', area: 'purple_forest', theme: 'purple', bg: '#2a1a3a', ki: W.ki('purple', 0.52), music: 'forest', weather: 'firefly', tint: 'rgba(90,30,110,0.18)',
    grid: W.gen({
      w: 40, h: 34, seed: 'violet-forest', ground: '.', alt: [[',', 0.56, 4], ['"', 0.84, 3]],
      obst: [['T', 6], ['M', 2], ['t', 2]], dense: 0.52, sparse: 0.05, scale: 5,
      border: 'T', bt: 3, rough: 0.6,
      lakes: [{ x: 11, y: 10, rx: 3, ry: 2.5 }],
      paths: [[[20, 33], [20, 25], [13, 20], [13, 14], [22, 10], [32, 12], [39, 14]], [[13, 17], [5, 17]], [[22, 10], [22, 5]], [[20, 25], [30, 26]]],
      clear: [[18, 3, 7, 5], [3, 15, 5, 5], [28, 24, 6, 5]],
    }),
    edges: { down: { to: 'purple', tx: 18, ty: 0 }, right: { to: 'mirror_pond', tx: 0, ty: 13 } },
    objs: [
      W.sign(21, 30, ['보랏빛 숲', '↑ 숲 한가운데   → 진실의 거울 연못']),
      W.bookObj('b_moon', 23, 4),
      W.spot(5, 18, 3), W.spot(31, 26, 3), W.spot(35, 5, 10, true),
      W.chest('pf1', 4, 16, 'p4', 5), W.goldChest('pf2', 32, 25, 25000000),
      { t: 'pickup', id: 'moonherb1', x: 21, y: 4, item: 'moon_herb', c: '#f0e8a0', cond: (s) => (s.quests.m5 != null && s.quests.m5 >= 2) || s.chests.moonherb1, text: '반쯤 핀 달맞이꽃이다. 16년째 밤을 기다리고 있다.' },
    ],
    mons: { list: ['moonbat', 'fairyfire', 'poison', 'shadowfox', 'witchcat', 'witchcat'], n: 12, area: [3, 3, 34, 28] },
  });

  /* ───────── 진실의 거울 연못 ───────── */
  W.map('mirror_pond', {
    name: '진실의 거울 연못', sub: '기억을 비추는 물', region: 'purple', area: 'mirror_pond', theme: 'purple', bg: '#1a0e2a', ki: W.ki('purple', 0.85), music: 'forest', weather: 'star', tint: 'rgba(40,20,90,0.22)',
    grid: W.gen({
      w: 30, h: 26, seed: 'mirror-pond', ground: '.', alt: [['"', 0.7, 3], [',', 0.6, 4]],
      obst: [['T', 5], ['M', 1], ['@', 1]], dense: 0.55, sparse: 0.04, scale: 5,
      border: 'T', bt: 3, rough: 0.6,
      lakes: [{ x: 16, y: 11, rx: 6, ry: 4 }],
      paths: [[[0, 13], [6, 13], [9, 17], [16, 17], [23, 17], [25, 12], [24, 6]], [[16, 17], [16, 22]]],
      clear: [[8, 15, 16, 4], [21, 4, 6, 5]],
    }),
    edges: { left: { to: 'purple_forest', tx: 39, ty: 14 } },
    objs: [
      W.bookObj('b_mirror', 10, 16),
      { t: 'orbshine', orb: 'o_b4', x: 16, y: 15, need: (s) => !!s.flags.vision_seen, hint: '물 밑에서 파란 빛이 일렁인다. 연못지기에게 먼저 말을 걸어 보자.' },
      W.spot(24, 7, 3), W.spot(4, 22, 10, true), W.chest('mp1', 25, 5, 'p4', 5),
    ],
    mons: { list: ['mirrorghost', 'mirrorghost', 'witchcat', 'fairyfire'], n: 8, area: [3, 3, 24, 20] },
    fixed: [{ mon: 'moonbeast', x: 24, y: 5, flag: 'beat_moonbeast', boss: true, look: { creature: 'beast', tint: '#c8b8ff' } }],
    npcs: [{ id: 'bichu', x: 16, y: 18, dir: 'up', mark: (s) => (s.quests.m5 === 3 ? '!' : (s.flags.vision_seen && s.quests.q_ghost == null) || s.quests.q_ghost === 1 ? '!' : null), talk: bichuTalk }],
  });
  async function bichuTalk(c) {
    const s = c.s;
    if (s.quests.q_ghost === 0 && W.killsSince(s, 'mirrorghost', 'q_ghost_base') >= 8) c.quest('q_ghost', 1);
    if (s.quests.q_ghost === 1) {
      await c.say('bichu', '…물이 맑아졌구나. 거울 유령들이 흉내 낼 얼굴을 잃었나 보다. 고맙다, 흰빛의 아이야.');
      c.gold(30000000); c.give('p5', 3);
      c.quest('q_ghost', 'done');
      return;
    }
    if (s.quests.m5 === 3) {
      await c.say('bichu', ['…왔구나. 베라가 보낸 아이. 흰빛의 아이.', '나는 비추. 연못지기다. 눈이 안 보이니 물이 보여 주는 것에 속지 않지.']);
      await c.say('bichu', ['눈이 보는 건 겉이고, 물이 보는 건 속이다.', '연못을 들여다보거라. 네가 가장 알고 싶은 것을 보여 줄 게다. …후회할지도 모른다.']);
      const k = await c.ask(null, ['들여다본다', '…잠깐만']);
      if (k === 1) { await c.say('bichu', '서두를 것 없다. 연못은 16년을 기다렸다. 조금 더 기다릴 수 있지.'); return; }
      await vision(c);
      return;
    }
    if (s.flags.vision_seen && s.quests.q_ghost == null) {
      await c.say('bichu', ['요즘 [y]거울 유령[/]들이 연못을 흐린다. 사람 얼굴을 흉내 내며 물을 휘저어.', '여덟 마리만 쫓아 주겠니. 이 늙은이는 눈이 없어서 잡을 수가 없구나.']);
      W.markKills(s, 'mirrorghost', 'q_ghost_base');
      c.quest('q_ghost', 0);
      return;
    }
    await c.run(W.chatter('bichu', ['연못 바닥의 파란 구슬? 가져가거라. 진실을 본 자의 몫이다.', '흰빛의 아이야. 알고 싶은 것과 알아야 하는 것은 다르단다. 너는 둘 다 보았구나.', '달빛 마수는 16년째 반쯤 깨어 있다. 밤이 오지 않으니까. 불쌍한 녀석이지.']));
  }
  async function vision(c) {
    const s = c.s;
    await c.say(null, '연못 가장자리에 무릎을 꿇고 물을 들여다봤다. 수면에 비친 얼굴이 흔들리더니—');
    c.music(null);
    c.sfx('magic');
    await c.fadeOut(900, true);
    G.field.hideHero = true;
    await c.warp('vision_astra', 10, 13, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    c.music('mother');
    await c.fadeIn(900);
    await c.narr(['— 천년력 983년, 새싹의 달 11일. 황금별 아스트라 —']);
    await c.say('kairon', ['계산이 안 맞아. 흑점의 크기, 우리가 가진 빛, 남은 시간. 어떻게 계산해도 이길 수 없어.', '…한 사람이 희생하면 돼. 흰빛의 그릇이 흑점을 제 몸에 가두면.']);
    await c.say('serin', ['알아, 카이론. 나도 계산했어.', '그래서 왔잖아.']);
    await c.say('kairon:angry', '안 돼. 다른 방법이 있을 거야. 내가 더 강해지면. 대륙의 빛을 전부 모으면—');
    await c.say('serin:sad', ['빛을 한곳에 모으면 안 돼. 교수님이 그랬잖아. 은빛 왕국이 그랬고.', '…그리고 우리 아기는 그런 세상에서 크면 안 돼.']);
    await c.say('nocturne', '……세린.');
    await c.say('serin', ['녹턴. 카이론 부탁해. 이 사람, 혼자 두면 밥도 안 먹고 계산만 할 거야.', '그리고… 방순 선생님한테, 아기를 부탁한다고 전해 줘.']);
    c.spawn({ id: 'blacksun_v', x: 10, y: 3, dir: 'down', look: { creature: 'ghost', tint: '#1a1030' } });
    c.shake(1200, 4);
    await c.say('blacksun', '………빛………더 많은………빛………');
    await c.npc('serin_v').walk('UUUUUU', 0.6);
    c.flash('#ffffff', 1400);
    c.sfx('white');
    await c.say(null, ['세린의 몸에서 새하얀 빛이 터져 나왔다. 검은 점이 빛에 끌려 들어가듯 그녀를 향해 쏟아졌다.', '빛과 어둠이 하나로 엉키더니— 황금빛 수정이 그녀를 감쌌다.']);
    c.despawn('blacksun_v');
    await c.say('kairon:angry', '세린!!!');
    await c.say(null, '뛰어드는 카이론을 녹턴이 붙잡았다. 카이론의 비명이 별 위에 오래 울렸다.');
    await c.say('serin', ['…괜찮아. 16년이면 돼. 16년 동안은 내가 붙잡고 있을게.', '그동안 방법을 찾아. 빛을 모으지 말고… 나누는 방법을.', '…오늘도 렙업.']);
    await c.say(null, '수정이 닫혔다. 그 안에서 세린은 잠든 것처럼 눈을 감고 있었다.');
    await c.fadeOut(900, true);
    await c.warp('vision_castle', 10, 13, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    c.music('castle');
    await c.fadeIn(900);
    await c.narr(['— 사흘 뒤. 천년성 —']);
    await c.say('kairon', ['오늘부로 [r]천년 방위령[/]을 선포한다. 모든 백성은 렙업할 때 터지는 빛의 일부를 나라에 바친다.', '모인 빛은 아스트라로 올라가 하늘을 지킨다. 16년. 16년 안에 흑점을 끝낸다.']);
    await c.say('gran_v', ['카이론. 빛을 한 데 모으믄 안 된다. 세린이 그랬다 아이가!', '니 지금 세린이 목숨 걸고 막은 거를 니 손으로 부르는 기다!']);
    await c.say('kairon', ['스승님. 세린은 틀렸습니다.', '…그리고 세린은 없습니다. 나는 이미 모든 것을 계산했습니다.']);
    await c.say('gran_v', '……이 고집불통아. 그라믄 내가 니를 막아야겠다.');
    c.shake(800, 5);
    c.flash('#6ad86a', 500);
    c.sfx('crit');
    await c.wait(0.4);
    c.flash('#ffe08a', 500);
    c.sfx('crit');
    await c.say(null, ['초록 창과 황금빛 검이 부딪쳤다. 천년성의 기둥이 흔들렸다.', '…그리고 초록 창이 부러졌다.']);
    await c.say('kairon', ['…스승님은 그린 마을로 돌아가십시오. 초록의 자리는 비워 두겠습니다.', '그 아이도 데려가십시오. 16년 뒤에… 필요할지도 모르니.']);
    await c.say('gran_v:sad', ['……', '…필요? 니 지금 아를 뭐라 캤노. 필요?', '……아는 내가 키운다. 니는 니 계산이나 해라.']);
    await c.say(null, '오방순은 부러진 창을 버리고, 강보에 싸인 아기를 안고 천년성을 걸어 나갔다. 한 번도 돌아보지 않았다.');
    await c.fadeOut(1200, true);
    G.field.hideHero = false;
    await c.warp('mirror_pond', 16, 17, 'up', { instant: true, noBanner: true, noEnter: true });
    c.music('sad');
    await c.fadeIn(1000);
    c.set('vision_seen');
    c.set('m_purple_vision');
    await c.say('@', '……');
    await c.say('dotori:sad', ['…{n}.', '할머니가… 할머니가 초록 창이었어. 사천왕이었어. 그리고… 너를 안고…']);
    await c.say('bichu', ['물이 보여 준 건 지나간 일이다. 앞으로의 일은 네가 걸어서 봐야지.', '연못 바닥에 파란 구슬이 있다. 진실을 본 자의 몫이다. 가져가거라. 그리고 베라에게 돌아가 차 한 잔 얻어 마시렴. 이번엔 따뜻할 게다.']);
    c.quest('m5', 4);
    void s;
  }
  // 983년의 기억 (연출 전용 맵)
  W.map('vision_astra', {
    name: '983년 · 아스트라', region: 'planet', area: 'vision', theme: 'planet', bg: '#0b0a1c', ki: 1, music: 'mother', banner: false, weather: 'star', tint: 'rgba(255,255,255,0.08)',
    grid: W.gen({ w: 20, h: 16, seed: 'vision-astra', ground: 'k', obst: [['K', 3], ['^', 1]], dense: 0.66, sparse: 0.03, border: 'z', bt: 2, rough: 0.5, clear: [[4, 3, 12, 11, 'k']], paths: [] }),
    npcs: [
      { id: 'serin_v', x: 10, y: 9, dir: 'up', look: G.chars.serin.look, talk: async () => {} },
      { id: 'kairon_v', x: 8, y: 10, dir: 'right', look: G.chars.kairon.look, talk: async () => {} },
      { id: 'nocturne_v', x: 12, y: 10, dir: 'left', look: G.chars.nocturne.look, talk: async () => {} },
    ],
  });
  W.map('vision_castle', {
    name: '983년 · 천년성', region: 'black', area: 'vision', theme: 'castle', bg: '#0b0a1c', ki: 1, music: 'castle', banner: false, tint: 'rgba(255,255,255,0.08)',
    grid: W.room({ w: 20, h: 16, floor: '-', door: 10, win: [], rug: [8, 3, 4, 12], put: [[3, 4, 'y'], [16, 4, 'y'], [3, 10, 'y'], [16, 10, 'y'], [9, 2, 'n'], [10, 2, 'n']] }),
    npcs: [
      { id: 'kairon_v', x: 10, y: 4, dir: 'down', look: G.chars.kairon.look, talk: async () => {} },
      { id: 'gran_v2', x: 10, y: 9, dir: 'up', look: { hair: 'bun', hc: '#5a4a3a', top: '#2f8a3a', bottom: '#3a4a2a', acc: '#2f8a3a' }, talk: async () => {} },
      { id: 'nocturne_v', x: 12, y: 5, dir: 'down', look: G.chars.nocturne.look, talk: async () => {} },
    ],
  });
  G.chars.gran_v = Object.assign({}, G.chars.gran, { id: 'gran_v', name: '오방순 (983년)', face: Object.assign({}, G.chars.gran.face, { hc: '#5a4a3a', acc: [], top: '#2f8a3a', mouth: 'flat', eyes: 'sharp' }) });

  G.world.nodes.push({ region: 'purple', label: '퍼플', x: 130, y: 108, color: '#c49bff', maps: ['purple', 'purple_road', 'purple_forest', 'mirror_pond', 'academy', 'serin_lab', 'purple_rank', 'purple_shop', 'purple_inn'] });
  void D;
})();
