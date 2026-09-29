/* 8장 「잿빛의 땅」 — 잿빛 고개 · 그레이 마을 · 볼트의 공방 · 은빛 왕국 폐허 · 기록 보관소 · 폐공장 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine;

  G.chars.bolt.bio[1] = ['징수탑을 설계했다. 983년, 카이론의 부탁으로. 7년 뒤 아내 세피아가 빛바램병으로 떠났다.', 'm_gray_bolt'];

  W.quest('m8', { main: true, name: '8장 · 잿빛의 땅', where: '그레이 마을', stages: [
    '[y]레벨 60000[/]과 [b]덕후 15차[/]가 되면 화이트 마을 남쪽 잿빛 고개로 그레이 마을에 가자.',
    '징수탑을 설계한 [y]강철공 볼트[/]를 찾자. 마을 동쪽의 큰 공방이다.',
    '마을 동쪽 [y]은빛 왕국 폐허[/]의 기록 보관소에서 612년의 기록을 찾자.',
    '찾은 기록을 볼트에게 보여 주자.',
    '마을 남쪽 [y]폐공장[/]에서 볼트가 기다린다. (강적 · 레벨 12만 부근)',
    '볼트의 공방으로 돌아가자.',
    '[y]레벨 120000[/]과 [y]짱 1차[/]가 되면 그레이 마을 남쪽 밤의 숲으로 블랙 마을에 가자. 짱의 문은 노란 구슬 넷의 숫자를 더해 연다.',
  ], done: '해가 뜨지 않는 도시로 들어섰다.' });
  W.quest('q_noel', { name: '색을 보고 싶은 로봇', where: '대륙 곳곳', stages: [
    '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. 지방마다 색이 짙게 고인 곳이 있다. (0/7)',
    '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (1/7)', '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (2/7)',
    '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (3/7)', '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (4/7)',
    '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (5/7)', '세피아의 [y]색 표본 병[/]에 일곱 지방의 색을 담아 오자. (6/7)',
    '일곱 색을 모두 담았다! 그레이 마을의 세피아에게 돌아가자.',
  ], done: '세피아는 3분 동안 멈춰 있었다. 과부하가 아니었다.' });
  W.quest('q_oil', { name: '기름칠', where: '그레이 마을', stages: ['몬스터에게서 [y]녹슨 톱니[/] 8개를 모아 녹슬이에게 가져가자.'], done: '녹슬이는 고철 의자를 하나 더 만들었다. 이번엔 안 삐걱거린다.' });

  W.book('b_silver', { title: '은빛 왕국 연대 기록 — 612년', where: '은빛 왕국 기록 보관소', author: '은빛 왕국 기록원', text:
    '611년 겨울. 대광맥 굴착 완료. 땅속 모든 빛이 모이는 곳. 여기서 빛을 한꺼번에 끌어올리면 왕국은 천 년을 쓸 수 있다.\n\n' +
    '612년 봄. 대광맥 개방. 빛의 기둥이 하늘까지 솟았다. 왕국 전체가 축제였다.\n\n' +
    '612년 봄, 사흘 뒤. 하늘에 검은 점이 나타났다. 점은 빛의 기둥을 따라 내려왔다.\n\n' +
    '612년 봄, 닷새 뒤. 땅의 색이 빠진다. 기계가 멈춘다. 사람들의 레벨이 줄어든다. 검은 점이 빛을 먹고 있다.\n\n' +
    '612년 봄, 이레 뒤. (글씨가 크게 흔들린다) 빛을 모으지 말았어야 했다. 우리가 불렀다. 우리가 불렀다. 우리가—' });
  W.book('b_report', { title: '관측 보고서 사본 — 발신: 하늘 정거장', where: '은빛 왕국 기록 보관소', author: '관리 인공지능 S.T.E.L.L.A.', text:
    '[발신] 궤도 관측 정거장 관리 AI\n[수신] 은빛 왕국 과학원\n[날짜] 612년 초봄\n\n' +
    '경고. 외계 흡광체(가칭 「흑점」) 접근 중.\n분석 결과: 흡광체는 빛의 [r]총량[/]이 아니라 [r]밀도[/]에 이끌린다. 빛이 한 점에 모일수록 접근 속도 증가.\n\n' +
    '권고: 대광맥 개방을 즉시 중단할 것. 빛을 분산할 것.\n\n' +
    '[회신] 없음.\n[재발신] 경고. 경고. 경고.\n[회신] 없음.\n\n(보고서 여백, 누군가의 손글씨) 이걸 읽은 사람이 983년에도 있었다면. — B' });
  W.book('b_blueprint', { title: '징수탑 설계도', where: '볼트의 공방', author: '볼트', text:
    '983년. 챔피언 카이론의 요청.\n목적: 대륙 전역에서 렙업 시 방출되는 빛의 일부를 회수, 천년성으로 집중.\n\n' +
    '구조: 수정 흡광부 → 지하 도관 → 중계탑(무지개 마을) → 천년성 → 궤도 송신 → 아스트라.\n\n' +
    '예상 효과: 16년 후, 아스트라에 은빛 왕국 대광맥의 3배에 달하는 빛이 모인다.\n\n' +
    '(여백, 최근의 글씨) 3배. 3배. 왜 이 숫자를 보고도 아무 생각이 없었나.' });
  W.book('b_wife', { title: '세피아의 편지', where: '볼트의 공방', author: '세피아', text:
    '여보. 오늘도 탑 도면을 그리느라 밤을 새웠죠. 잠 좀 자요.\n\n요즘 머리칼이 하얘져요. 늙어서 그런 거겠죠. 괜찮아요.\n\n' +
    '당신이 만든 기계 중에 제일 좋았던 건 탑도 대포도 아니고, 내 생일에 만들어 준 작은 로봇이었어요. 노을빛 눈을 가진.\n그 아이가 색을 볼 수 있었으면 좋겠어요. 나 대신 노을을 봐 줄 수 있게.\n\n— 990년 가을, 세피아' });
  W.book('b_scrap', { title: '고철 시장 농담집', where: '그레이 마을', text:
    '문: 그레이 사람이 제일 좋아하는 색은?\n답: 회색. 다른 색은 본 적이 없으니까.\n\n문: 징수탑이 제일 싫어하는 사람은?\n답: 렙업 안 하는 사람. 세금을 못 걷으니까.\n\n' +
    '문: 볼트가 웃은 날은?\n답: 아직 없음. 쓸데없는 표정은 연료 낭비.' });
  W.book('b_n07', { title: 'N-07 사용 설명서', where: '볼트의 공방', author: '볼트', text:
    '형식: N-07 「세피아」. 가사 보조 로봇.\n특징: 눈에 색 인식 부품 없음(부품 단종). 대신 온도, 소리, 빛의 세기로 세상을 인식함.\n\n' +
    '주의 1. 세피아는 「예쁘다」는 말을 이해하지 못한다. 설명하려 하지 말 것. 그녀는 이해하려고 사흘 동안 멈춘다.\n\n' +
    '주의 2. 세피아가 색 표본 병을 들고 다니면 그냥 두라. 그녀의 유일한 취미다.\n\n(맨 아래) 세피아가 색을 볼 수 있게 되면, 나는 그 녀석한테 아내 얘기를 해 줄 생각이다.' });

  /* ───────── 잿빛 고개 ───────── */
  W.map('ash_pass', {
    name: '잿빛 고개', sub: '색이 빠지는 길', region: 'gray', area: 'ash_pass', theme: 'gray', bg: '#4a4a4e', ki: W.ki('gray', 0.12), music: 'gray', weather: 'ash',
    grid: W.gen({
      w: 32, h: 36, seed: 'ash-pass', ground: '.', alt: [[':', 0.64, 4]],
      obst: [['^', 3], ['X', 2], ['T', 1]], dense: 0.58, sparse: 0.05, scale: 5,
      border: '#', bt: 2, rough: 0.6,
      paths: [[[20, 0], [20, 6], [12, 12], [12, 22], [20, 28], [16, 35]], [[12, 16], [5, 16]], [[20, 28], [27, 26]]],
      clear: [[3, 13, 5, 6], [24, 23, 6, 5]],
    }),
    edges: { up: { to: 'white', tx: 18, ty: 29 }, down: { to: 'gray', tx: 18, ty: 0 } },
    objs: [W.sign(21, 3, ['잿빛 고개', '이 아래는 그레이 지방. 612년 탈색된 땅. 색은 고개를 넘지 못한다.']), W.spot(5, 16, 3), W.spot(27, 25, 3), W.spot(28, 4, 10, true), W.chest('ap1', 4, 14, 'p7', 5), W.goldChest('ap2', 26, 24, 2000000000)],
    mons: { list: ['drone', 'rustbot', 'ashgolem', 'scraprat'], n: 12, area: [2, 2, 28, 32] },
    enter: async (c) => {
      if (c.flag('ch8')) return;
      c.set('ch8');
      c.quest('m7', 'done');
      await c.chapter('8장', '잿빛의 땅', '고개를 넘자 세상에서 색이 빠졌다. 풀도, 하늘도, 사람의 얼굴도 잿빛이었다.');
      await c.say('dotori:worry', ['{n}. 네 초록 옷만 색이 있어. 나머지는 다 회색이야.', '612년에 은빛 왕국이 무너질 때 땅의 색이 빠졌대. 400년이 지났는데 아직도…']);
      c.quest('m8', 1);
    },
  });

  /* ───────── 그레이 마을 ───────── */
  W.map('gray', {
    name: '그레이 마을', sub: '색을 잃은 기계의 땅', region: 'gray', area: 'gray', theme: 'gray', bg: '#4a4a4e', ki: W.ki('gray', 0.03), town: true, weather: 'ash',
    grid: W.gen({
      w: 36, h: 30, seed: 'gray-scrap', ground: '.', alt: [[':', 0.66, 4]],
      obst: [['X', 3], ['^', 1], ['b', 1]], dense: 0.8, sparse: 0.02, scale: 5,
      border: '#', bt: 2, rough: 0.5,
      paths: [[[18, 0], [18, 29]], [[0, 14], [35, 14]], [[9, 10], [9, 14]], [[27, 10], [27, 14]], [[9, 22], [9, 16], [18, 16]], [[27, 22], [27, 16], [18, 16]], [[13, 16], [13, 17]]],
      path: '=',
      clear: [[4, 5, 8, 5], [23, 4, 10, 6], [4, 17, 7, 5], [24, 17, 7, 5], [12, 18, 5, 5, ':']],
      stamps: [{ x: 12, y: 18, rows: ['XuX', 'uXu', 'XuX'] }, { x: 16, y: 13, rows: ['l'] }, { x: 20, y: 13, rows: ['l'] }, { x: 16, y: 17, rows: ['l'] }],
    }),
    builds: [
      { x: 23, y: 4, w: 10, h: 6, door: 4, style: 'flat', roof: '#6a7a8a', wall: 'metal', icon: 'hammer', signColor: '#d8dce0', to: 'workshop', tx: 8, ty: 10 },
      { x: 4, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'metal', icon: 'star', signColor: '#c8d0ff', to: 'gray_rank', tx: 5, ty: 6 },
      { x: 4, y: 17, w: 6, h: 4, door: 3, roof: '#8a5a3a', wall: 'metal', icon: 'bed', to: 'gray_inn', tx: 5, ty: 6 },
      { x: 24, y: 17, w: 3, h: 3, style: 'tent', roof: '#8a8a92' }, { x: 28, y: 17, w: 3, h: 3, style: 'tent', roof: '#6a6a70' },
      { x: 19, y: 10, w: 2, h: 3, style: 'tower' },
    ],
    edges: { up: { to: 'ash_pass', tx: 16, ty: 35 }, right: { to: 'ruins', tx: 0, ty: 17 }, down: { to: 'factory', tx: 15, ty: 1 }, left: { to: 'night_forest', tx: 39, ty: 16, req: { lv: 120000, rank: ['r4', 1] }, msg: '서쪽 밤의 숲. 녹슨 표지판: 「이 너머 블랙 지방. 짱 1차 미만 출입 금지 — 천년성」' } },
    objs: [
      W.sign(19, 2, ['그레이 마을 — 색을 잃은 기계의 땅', '→ 은빛 왕국 폐허   ↓ 폐공장   ← 밤의 숲 (블랙 지방, 짱 1차)']),
      W.bookObj('b_scrap', 25, 21),
      W.spot(31, 25, 3), W.spot(33, 3, 10, true),
      { t: 'sign', x: 13, y: 18, invisible: true, text: ['녹슨 거대 기계의 잔해. 은빛 왕국 시대의 빛 발전기였다고 한다.', '계기판의 바늘이 612라는 숫자에서 멈춰 있다.'] },
      { t: 'sign', x: 19, y: 12, invisible: true, text: ['그레이 마을의 징수탑. 다른 탑과 모양이 조금 다르다. 첫 번째로 만든 시제품이라고 한다.', '받침돌에 작은 글씨: 「설계 · 제작 — 볼트, 983」'] },
    ],
    npcs: [
      { id: 'noel', x: 22, y: 15, dir: 'down', mark: (s) => (s.flags.gray_intro && s.quests.q_noel == null) || s.quests.q_noel === 7 ? '!' : null, talk: noelTalk },
      { id: 'rusty', x: 25, y: 20, dir: 'down', mark: (s) => (s.flags.gray_intro && s.quests.q_oil == null) || (s.quests.q_oil === 0 && E.has(s, 'm13', 8)) ? '!' : null, talk: rustyTalk },
      { id: 'engineer', x: 29, y: 20, dir: 'down', talk: async (c) => { await c.say('engineer', '고철 시장 장비 코너다. 톱니 장갑은 관절마다 톱니가 돈다. 기계가 대신 눌러 주는 기분이지.'); await c.shop('gray'); } },
      { id: 'engineer2', speaker: 'engineer', x: 10, y: 12, dir: 'down', wander: 2, look: G.chars.engineer.look, talk: W.chatter('g_eng', ['농담 하나 할까? 그레이 사람이 제일 좋아하는 색은? 회색. …웃어도 돼. 우린 안 웃지만.', '볼트 영감님은 탑을 만든 사람이야. 이 마을에서 제일 유명하고, 제일 말이 없지.', '저 앞 발전기 잔해 계기판, 612에서 멈췄어. 400년 동안 한 번도 안 움직였지.']) },
      { id: 'kid', x: 14, y: 22, dir: 'up', wander: 2, talk: W.chatter('g_kid', ['세피아 누나는 로봇이야! 색 모으는 게 취미야. 근데 누나는 색을 못 봐.', '너 옷이 초록색이야? 초록이 뭐야? 풀 색? 풀은 회색인데?']) },
    ],
    enter: async (c) => { if (!c.flag('gray_intro')) { c.set('gray_intro'); await c.say('dotori', ['찍… 고철 산더미야. 사람들 표정도 무뚝뚝해.', '볼트는 동쪽 큰 공방에 있대.']); } },
  });
  W.town({ map: 'gray', x: 18, y: 16, name: '그레이 마을', color: '#a8a8b8', desc: '색을 잃은 기계의 땅. 볼트의 공방.', hint: '화이트 마을 남쪽 잿빛 고개 너머' });

  async function noelTalk(c) {
    const s = c.s;
    if (s.quests.q_noel === 7) {
      c.take('color_jar');
      c.music('mother');
      await c.say('noel', ['색 표본 병. 일곱 칸이 전부 찼다. 온도가… 전부 다르다.', '…그래도 나는 볼 수 없다. 색 인식 부품이 없으니까.']);
      await c.say('@', '…손 줘 봐.');
      await c.say(null, '{n}은(는) 세피아의 차가운 금속 손을 잡고 렙업 버튼을 눌렀다.');
      await c.waitClick(10, (k) => { if (k % 5 === 0) { c.flash('#ffffff', 200); c.light(10); } });
      c.flash('#ffffff', 1200);
      c.light(80);
      await c.say(null, ['흰빛이 세피아의 회로로 흘러 들어갔다. 세피아의 눈에 박힌 노을빛 렌즈가 깜빡였다.', '…그리고 세피아는 멈췄다.']);
      await c.wait(1.5);
      await c.say('dotori:worry', '…고장 났어?');
      await c.wait(1.2);
      await c.say('noel:happy', ['……', '…초록. 네 옷. 이게 초록.', '병 안의 이건… 빨강. 파랑. 노랑. 보라. 무지개. 하양.', '…3분 동안 계산했다. 이 감정의 이름을 찾지 못했다.']);
      await c.say('noel:happy', '「예쁘다.」 …이게 예쁘다구나.');
      c.set('q_noel_done');
      c.quest('q_noel', 'done');
      await c.say('noel', ['선물. 볼트가 내 몸 안에 넣어 둔 것. 「소원이 이루어지면 꺼내라」고 했다.', '…나의 소원은 이루어졌다.']);
      await c.orb('o_p4');
      await c.say('noel', '볼트한테 가서 말할 것이다. 세피아가 노을을 봤다고.');
      c.music('gray');
      return;
    }
    if (s.quests.q_noel == null) {
      await c.say('noel', ['안녕하십니까. N-07. 이름은 세피아. 볼트가 만든 일곱 번째 로봇.', '당신 옷의 온도가 다르다. 색이 있는 옷. 그리고… 당신 몸에서 흰빛이 난다. 흥미롭다.']);
      await c.say('noel', ['나는 색을 볼 수 없다. 그래서 색을 모은다. 이 병에.', '부탁이 있다. 대륙 [y]일곱 지방[/]에는 색이 가장 짙게 고인 곳이 있다고 한다. 그 색을 이 병에 담아 와 줄 수 있나?']);
      c.give('color_jar');
      c.quest('q_noel', 0);
      await c.say('noel', ['그린, 레드, 블루, 옐로, 퍼플, 무지개, 화이트. 색이 고인 곳은 반짝인다고 한다.', '…급하지 않다. 나는 400년 된 부품으로 만들어졌다. 기다리는 건 잘한다.']);
      return;
    }
    const n = s.quests.q_noel;
    if (n === 'done') { await c.run(W.chatter('noel_after', ['지금 하늘 색은… 회색. 하지만 이제 회색도 예쁘다는 걸 안다.', '볼트가 웃었다. 처음 봤다. 기록해 두었다. 983년 이후 첫 번째.', '당신의 흰빛은 모든 색을 합친 색이다. 그래서 가장 예쁘다. …계산 결과다.'], 'noel')); return; }
    await c.say('noel', '색 표본 병 상태: ' + n + ' / 7. 지방마다 색이 짙게 고여 반짝이는 곳을 찾아라.');
  }
  async function rustyTalk(c) {
    const s = c.s;
    if (s.quests.q_oil === 0 && E.has(s, 'm13', 8)) {
      c.take('m13', 8);
      await c.say('rusty:happy', ['녹슨 톱니 여덟 개! 이거면 고철 의자 하나 뚝딱이지. 고마워!', '값이야. 고철 시장에선 고철로 셈하는데, 너한텐 골드로 줄게.']);
      c.gold(6000000000); c.give('f7', 3);
      c.quest('q_oil', 'done');
      return;
    }
    if (s.flags.gray_intro && s.quests.q_oil == null) {
      await c.say('rusty', ['고철 팝니다, 고철 삽니다. 녹슬이야.', '부탁 하나 하자. 드론이나 로봇이 떨어뜨리는 [y]녹슨 톱니[/] 8개만 구해 줘. 의자가 하나 모자라거든.']);
      c.quest('q_oil', 0);
    }
    await c.shop('gray');
  }

  /* 색이 고인 곳 — 앞 장의 맵에 반짝이를 심는다 */
  const COLORS = [['green_field', 18, 4, '#6ad86a', '초록'], ['red_mountain', 20, 8, '#ff5a4a', '빨강'], ['beach', 26, 17, '#4dabf7', '파랑'], ['desert', 22, 11, '#ffd43b', '노랑'], ['purple_forest', 22, 6, '#c49bff', '보라'], ['cloud_sea', 21, 7, '#ff8ac8', '무지개'], ['snowfield', 18, 6, '#ffffff', '하양']];
  COLORS.forEach(([mapId, x, y, col, name], i) => {
    const m = G.maps[mapId];
    if (!m) return;
    const id = 'color_' + i;
    m.objs = m.objs || [];
    m.objs.push({ t: 'pickup', id, x, y, c: col, cond: (s) => (s.quests.q_noel != null && s.quests.q_noel !== 'done') || s.chests[id], solid: false,
      text: '색 표본 병을 기울이자 [y]' + name + '[/] 빛이 병 속으로 흘러 들어갔다.',
      after: async (c) => { const n = COLORS.filter((_, j) => c.s.chests['color_' + j]).length; c.quest('q_noel', n >= 7 ? 7 : n); } });
  });

  /* ── 볼트의 공방 ── */
  W.map('workshop', {
    name: '볼트의 공방', region: 'gray', area: 'gray', theme: 'space', bg: '#1c2230', ki: W.ki('gray', 0.05), music: 'gray', banner: false,
    grid: W.room({ w: 17, h: 12, floor: 'm', door: 8, win: [], put: [[1, 2, 'u'], [2, 2, 'u'], [3, 2, 'u'], [13, 2, 'h'], [14, 2, 'h'], [15, 2, 'X'], [5, 5, 'd'], [6, 5, 'd'], [7, 5, 'd'], [11, 5, 'X'], [12, 5, 'X'], [1, 9, 'b'], [15, 9, 'b'], [14, 7, 'd']] }),
    warps: [W.exit(8, 11, 'gray', 27, 10)],
    objs: [W.bookObj('b_blueprint', 5, 5), W.bookObj('b_wife', 14, 7), W.bookObj('b_n07', 13, 2)],
    npcs: [{ id: 'bolt', x: 9, y: 4, dir: 'down', cond: (s) => s.quests.m8 !== 4, mark: (s) => (s.quests.m8 === 1 || s.quests.m8 === 3 || s.quests.m8 === 5 ? '!' : null), talk: boltTalk }],
  });
  async function boltTalk(c) {
    const s = c.s;
    if (s.quests.m8 === 1) {
      await c.say('bolt', ['…용건.', '쓸데없는 말은 연료 낭비다. 한 줄로.']);
      await c.say('@', '징수탑을 만든 사람을 찾아왔어요.');
      await c.say('bolt', ['나다. 983년. 카이론의 부탁. 대륙의 빛을 모아 하늘을 지키는 탑.', '…그리고 지금은 그 빛을 쏠 대포를 만들고 있다. [y]천년포[/]. 흑점을 쏜다. 16년 치 빛으로.']);
      await c.say('@', '엄마 책에 쓰여 있었어요. 빛을 한곳에 모으면 안 된다고.');
      await c.say('bolt', ['근거.', '느낌은 연료가 안 된다. 숫자를 가져와라. 숫자라면 들어 주지.']);
      await c.say('bolt', ['…동쪽에 은빛 왕국 폐허가 있다. 기록 보관소가 무너지지 않고 남았지. 612년의 기록이 있을 거다.', '나는 안 가 봤다. 가 볼 이유가 없었으니까. …가 보고 싶지 않았으니까.']);
      c.set('m_gray_bolt');
      c.quest('m8', 2);
      return;
    }
    if (s.quests.m8 === 3) {
      c.music('sad');
      await c.say('bolt', '…가져왔나. 보여 줘.');
      await c.say(null, '볼트가 은빛 왕국의 기록과 정거장 보고서 사본을 한 장씩 넘겼다. 아주 오랫동안.');
      await c.say('bolt', ['「흡광체는 빛의 총량이 아니라 밀도에 이끌린다. 빛이 한 점에 모일수록 접근 속도 증가.」', '……']);
      await c.say('bolt', ['내 탑은… 16년 동안 대륙의 빛을 아스트라 한 점에 모았다. 은빛 왕국 대광맥의 세 배.', '그러니까 나는… 16년 동안 흑점에게 가장 밝은 [r]등대[/]를 켜 준 거군.']);
      c.set('m_gray_truth');
      await c.say('bolt', ['…아니다. 숫자 두 장으로는 부족하다. 16년을 뒤집으려면 더 큰 증명이 필요해.', '남쪽 [y]폐공장[/]으로 와라. 내 MK-7이 있다. 그걸 이기면… 네 말이 맞다고 인정하지.']);
      c.quest('m8', 4);
      return;
    }
    if (s.quests.m8 === 5) {
      c.music('mother');
      await c.say('bolt', ['쓸데없는 말은 연료 낭비다.', '…그러니 쓸모 있는 걸 만들겠다.']);
      await c.say('bolt', ['[y]역류 장치[/]. 탑의 흐름을 거꾸로 돌리는 장치다. 모인 빛을 다시 대륙으로 흩는다.', '설계도는 지금 그렸다. 부품은 천년성 중앙 제어실에 있다. 거기 끼우면 모든 탑이 한꺼번에 뒤집힌다.']);
      c.give('reverser');
      await c.say('bolt', ['그리고 이건 덤. [y]톱니 반지[/]. 탭 한 번에 두 번 친다. 쓸데없이 두 번 누르지 마라. 연료 낭비다.', '…또 하나. 알록달록 마을의 피로스라는 녀석이 로켓을 만든다더군. 하늘 정거장에 가려면 그 로켓밖에 없다. 로켓 심장은 내가 만들어 두지.']);
      c.give('x7');
      c.set('bolt_heart_promise');
      await c.say('bolt', ['아내가 죽던 해, 나는 그게 빛바램병 때문이라는 걸 알았다. 그 병이 탑 때문이라는 것도… 어렴풋이.', '모른 척했다. 알면 탑을 멈춰야 하니까. 탑을 멈추면 내가 틀린 거니까.', '…세피아한테 가 봐라. 그 녀석이 네게 할 말이 있을 거다.']);
      c.quest('m8', 6);
      c.music('gray');
      return;
    }
    await c.run(W.chatter('bolt', ['…용건.', '천년포는 해체했다. 부품은 역류 장치에 썼다. 연료 낭비는 싫으니까.', s.flags.q_noel_done ? '세피아가 노을을 봤다고 하더군. …그렇군.' : '세피아한테 색을 좀 보여 줘라. 그 녀석 소원이다.']));
  }
  W.map('gray_rank', {
    name: '그레이 마을 등급소', region: 'gray', area: 'gray', theme: 'interior', bg: '#1c2230', ki: W.ki('gray', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: 'm', door: 5, win: [], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'u'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'X'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'gray', 7, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 녹이 슬어 표정을 알 수 없다.', '그레이 사람들은 아우룸이 기술자였다고 믿는다. …믿고 싶어 한다.'] }],
    npcs: [W.clerk('clerk_gr', 5, 3, { hello: '등급소. 삐빅. 심사 시작. …농담이다. 나는 반만 기계다.', bye: '삐빅. 다음.' })],
  });
  W.map('gray_inn', {
    name: '녹슨 톱니 여관', region: 'gray', area: 'gray', theme: 'interior', bg: '#1c2230', ki: W.ki('gray', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: 'm', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'X'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'gray', 7, 21)],
    npcs: [W.innkeeper('innkeeper', 4, 4, 0, '녹슨 톱니 여관이야. 침대가 좀 삐걱거려. 기름칠은 셀프.')],
  });

  /* ───────── 은빛 왕국 폐허 ───────── */
  W.map('ruins', {
    name: '은빛 왕국 폐허', sub: '612년에 멈춘 곳', region: 'gray', area: 'ruins', theme: 'gray', bg: '#4a4a4e', ki: W.ki('gray', 0.5), music: 'cave', weather: 'ash',
    grid: W.gen({
      w: 40, h: 34, seed: 'silver-ruins', ground: '=', alt: [['.', 0.6, 5], [':', 0.7, 4]],
      obst: [['R', 4], ['X', 3], ['^', 1]], dense: 0.56, sparse: 0.06, scale: 5,
      border: '#', bt: 2, rough: 0.6,
      paths: [[[0, 17], [10, 17], [18, 12], [28, 12], [32, 8]], [[18, 12], [18, 25], [28, 26]], [[10, 17], [6, 25]]], path: ':',
      clear: [[26, 3, 10, 7], [24, 23, 8, 6]],
    }),
    builds: [{ x: 27, y: 3, w: 8, h: 5, door: 4, style: 'castle', roof: '#9aa4ae', wall: 'stone', icon: 'book', signColor: '#d8dce0', to: 'archive', tx: 7, ty: 8 }],
    edges: { left: { to: 'gray', tx: 35, ty: 14 } },
    objs: [W.sign(3, 16, ['은빛 왕국 폐허', '612년, 사흘 만에 무너진 나라. 기록 보관소만 남았다.']), W.spot(6, 25, 3), W.spot(28, 26, 3), W.spot(36, 30, 10, true), W.chest('ru1', 25, 24, 'p7', 5), W.goldChest('ru2', 5, 24, 9000000000)],
    mons: { list: ['oilslime', 'watcheye', 'drone', 'ashgolem', 'watcheye'], n: 12, area: [2, 2, 36, 30] },
  });
  W.map('archive', {
    name: '은빛 왕국 기록 보관소', region: 'gray', area: 'ruins', theme: 'space', bg: '#1c2230', ki: W.ki('gray', 0.55), music: 'space', banner: false,
    grid: W.room({ w: 15, h: 10, floor: 'm', door: 7, win: [], put: [[1, 2, 'h'], [2, 2, 'h'], [3, 2, 'h'], [11, 2, 'h'], [12, 2, 'h'], [13, 2, 'h'], [6, 3, 'u'], [7, 3, 'u'], [8, 3, 'u'], [1, 5, 'h'], [13, 5, 'h'], [1, 7, 'h'], [13, 7, 'h']] }),
    warps: [W.exit(7, 9, 'ruins', 31, 8)],
    objs: [W.bookObj('b_silver', 2, 2), W.bookObj('b_report', 12, 2), { t: 'orbshine', orb: 'o_y4', x: 7, y: 3, talk: archiveOrb }],
    enter: async (c) => {
      if (c.flag('archive_seen')) return;
      c.set('archive_seen');
      await c.say(null, ['400년 동안 닫혀 있던 방. 먼지 위에 발자국 하나 없다. 벽을 따라 은빛 기록판이 빼곡하다.', '가운데 제어판에서 노란 불빛 하나가 아직도 깜빡인다.']);
    },
  });
  async function archiveOrb(c) {
    const s = c.s;
    if (!s.orbs.o_y4) {
      await c.say(null, ['제어판 가운데 홈에 노란 구슬이 박혀 있다. 구슬 안의 숫자가 계기판처럼 깜빡인다.', '612.']);
      await c.orb('o_y4');
    }
    if (s.books.b_silver && s.books.b_report) c.truth('t_612');
    if (s.quests.m8 === 2) {
      const read = s.books.b_silver && s.books.b_report;
      if (!read) { await c.say('dotori', '찍, 벽의 기록판부터 읽어 보자. 612년 기록이랑… 저건 보고서 같아.'); return; }
      await c.say('@', '……빛을 모으면, 흑점이 온다.');
      await c.say('dotori:worry', ['그럼 징수탑은… 16년 동안 흑점을 부르고 있었던 거야?', '볼트 아저씨한테 이걸 보여 주자.']);
      c.quest('m8', 3);
    }
  }
  G.hooks.enter.push((id) => {
    const s = G.state;
    if (id === 'archive' && s.quests.m8 === 2 && s.books.b_silver && s.books.b_report && s.orbs.o_y4) G.main.setQuest('m8', 3);
  });

  /* ───────── 폐공장 ───────── */
  W.map('factory', {
    name: '폐공장', sub: '볼트 MK-7의 격납고', region: 'gray', area: 'factory', theme: 'space', bg: '#1c2230', ki: W.ki('gray', 0.84), music: 'cave', dark: 90, battleBg: 'gray',
    grid: W.gen({
      w: 30, h: 30, seed: 'old-factory', ground: 'm', alt: [],
      obst: [['X', 3], ['u', 1], ['#', 3]], dense: 0.55, sparse: 0.05, scale: 4,
      border: '#', bt: 1, rough: 0.6,
      paths: [[[15, 0], [15, 8], [7, 12], [7, 22], [15, 26]], [[15, 8], [23, 12], [23, 22], [15, 26]]], path: '=',
      clear: [[10, 22, 11, 6]],
    }),
    edges: { up: { to: 'gray', tx: 18, ty: 29 } },
    objs: [W.spot(7, 16, 3), W.spot(23, 16, 3), W.spot(27, 3, 10, true), W.chest('fa1', 8, 12, 'p7', 5), W.goldChest('fa2', 22, 12, 20000000000)],
    mons: { list: ['rustbot', 'oilslime', 'watcheye', 'drone', 'scraprat'], n: 12, area: [1, 1, 28, 20] },
    npcs: [{ id: 'bolt', x: 16, y: 24, dir: 'up', cond: (s) => s.quests.m8 === 4, talk: boltFight }],
    fixed: [],
  });
  async function boltFight(c) {
    const s = c.s;
    await c.say('bolt', ['왔군. 이게 MK-7이다. 천년포의 시제품. 대륙에서 제일 큰 기계지.', '내가 16년 동안 옳았다면, 이 녀석이 널 이긴다. 네가 옳다면… 증명해 봐라.']);
    // 세피아가 색을 본 뒤라면: 세피아 몸속에 잠긴 목소리를 들려줄 수 있다
    const canTalk = s.quests.q_noel === 'done';
    if (canTalk) {
      c.spawn({ id: 'noel_f', x: 14, y: 25, dir: 'up', look: G.chars.noel.look });
      await c.say('noel', '…따라왔다. 볼트. 나에게 재생 금지 명령이 걸린 기록이 하나 있다. 990년 가을.');
      await c.say('bolt', '……세피아. 그건 꺼내지 마라.');
    }
    const k = canTalk ? await c.ask(null, ['[y]세피아에게 기록을 재생해 달라고 한다[/]', '기계로 증명한다']) : 1;
    if (k === 0) {
      c.music('mother');
      await c.say('noel', '재생 금지 명령을… 해제한다. 나의 판단이다. 볼트가 가르쳐 준 대로. 「옳은 쪽의 숫자를 따르라.」');
      await c.narr(['세피아의 가슴에서 치직거리는 소리가 났다. 그리고 낮고 쉰, 다정한 여자 목소리가 공장 안에 퍼졌다.', '「여보. 녹음이 되고 있는 거 맞죠? …이 로봇 참 착해요. 가만히 있네.」', '「내 머리칼이 하얘지는 거, 당신 탑 때문인 거 알아요. 당신도 알죠. 계산 잘하잖아.」', '「탑 멈춰요. 당신이 틀려도 괜찮아요. 나는 틀린 당신도 사랑했어요. 맞는 당신은 좀 재미없었고.」', '「…잠 좀 자요. 연료 낭비라고 하지 말고.」']);
      await c.wait(0.8);
      await c.say(null, 'MK-7의 조종석 문이 열린 채로 멈췄다. 볼트는 올라타지 않았다. 대신 바닥에 주저앉았다. 강철 장갑을 벗는 데 한참 걸렸다.');
      await c.say('bolt', ['……9년 동안 한 번도 안 틀었다. 틀면… 내가 틀린 게 되니까.', '……틀렸군. 9년 동안. 아니, 16년 동안.']);
      await c.say('bolt', ['싸울 필요 없다. 증명은 끝났다. 저 목소리가 나보다 계산을 잘했다. 늘 그랬다.', '공방으로 와라. 틀렸으면 고쳐야지. 기술자는 그렇게 산다.']);
      c.decide('bolt', 'talk', '세피아의 목소리로 볼트를 설득했다');
      c.bond('bolt', 2); c.bond('noel', 1);
      c.despawn('noel_f');
      c.quest('m8', 5);
      c.music('gray');
      return;
    }
    if (canTalk) c.despawn('noel_f');
    c.shake(800, 4);
    await c.say(null, '쿠웅— 공장 바닥이 흔들리며 거대한 강철 기계가 일어섰다. 볼트가 조종석에 올라탔다.');
    const win = await c.battle('voltmech', { noFlee: true, music: 'boss2' });
    if (!win) { await c.say('bolt', '…아직이군. 더 강해져서 와라. 나는 여기서 기다린다. 16년도 기다렸다.'); return; }
    c.music('sad');
    await c.say(null, 'MK-7이 무릎을 꿇었다. 연기 속에서 볼트가 조종석에서 내려왔다.');
    await c.say('bolt', ['……증명 끝.', '네가 옳다. 내가 틀렸다. 16년 동안.']);
    await c.say('bolt', ['공방으로 와라. 틀렸으면 고쳐야지. 기술자는 그렇게 산다.']);
    c.decide('bolt', 'fight', 'MK-7을 쓰러뜨려 볼트에게 증명했다');
    c.quest('m8', 5);
  }

  /* ───────── 그레이의 결: 잠긴 서랍 · 세피아의 기록 · 소품 · 혼잣말 · 곁의 이야기 ───────── */
  W.keyItem('drawer_key', '볼트의 서랍 열쇠', '세피아가 몸속에 보관하던 작은 열쇠. 「볼트가 울 수 있게 되면 건네라」는 명령과 함께.');
  // 세피아가 색을 본 뒤: 서랍 열쇠를 건넨다
  W.wrapNpc('gray', 'noel', (s) => s.quests.q_noel === 'done' && !s.flags.noel_key, async (c) => {
    c.set('noel_key');
    await c.say('noel', ['하나 더. 볼트가 내 몸에 넣어 둔 것. 작은 열쇠. 공방 왼쪽 서랍의 열쇠다.', '명령문: 「볼트가 울 수 있게 되면 건네라.」 …볼트는 아직 울지 않았다. 하지만 나는 판단했다. 너에게 건네는 쪽이 울게 만드는 방법에 가깝다.']);
    c.give('drawer_key');
    await c.say('noel', '그리고 기록 하나가 더 있다. 990년 가을. 재생 금지. …필요하면 부르라. 폐공장이든 어디든.');
  });
  W.addObjs('workshop', [W.look(2, 2, '공방 왼쪽 철제 서랍. 자물쇠가 세 겹이다. 녹 하나 없이 반짝인다. 매일 닦은 모양이다.', { talk: async (c) => {
    const s = c.s;
    if (s.truth && s.truth.t_design) { await c.say(null, '비어 있는 서랍. 안쪽 바닥에 오래된 잉크 자국이 번져 있다.'); return; }
    if (!E.has(s, 'drawer_key') && s.flags.d_bolt !== 'talk') { await c.say(null, '공방 왼쪽 철제 서랍. 자물쇠가 세 겹이다. 녹 하나 없이 반짝인다. 매일 닦은 모양이다.'); return; }
    await c.say(null, s.flags.d_bolt === 'talk' && !E.has(s, 'drawer_key') ? '서랍이 열려 있다. 볼트가 열어 둔 모양이다.' : '세피아의 열쇠를 꽂자 자물쇠 세 개가 한꺼번에 풀렸다.');
    await c.narr(['서랍 안에는 봉투 하나. 겉봉에 「천년성 · 챔피언 카이론 귀하」. 우표는 붙어 있는데 소인이 없다. 한 번도 부치지 않았다.', '「카이론. 계산을 끝냈다. 탑들이 모은 빛을 한 점으로 쏘아 올리면, 그 점은 방패가 아니라 등대가 된다.」', '「은빛 왕국 대광맥의 세 배. 흑점이 그 불빛을 못 볼 리가 없다.」', '「멈춰라. 틀렸다고 말하는 건 내가 하겠다. 너는 멈추기만 해라. — 990년 가을, 볼트」']);
    c.truth('t_design');
    await c.say('dotori:worry', ['…9년 전에 다 알았어. 볼트 아저씨.', '알았는데 못 부쳤어. 아내가 떠난 해에.']);
  } })]);
  W.addObjs('gray', [
    W.prop('bench', 15, 21, '녹슬이가 만든 고철 의자. 「앉아도 됨. 삐걱거려도 안 부러짐. — 녹슬이」'),
    W.prop('fire', 22, 12, '기름통 모닥불. 그레이 사람들이 모여 손을 쬔다. 불꽃만은 여기서도 주황색이다. 다들 그걸 한참 본다.'),
    W.prop('board', 14, 12, (s) => ['고철 시장 게시판. 「오늘의 시세 — 녹슨 톱니 3개에 빵 하나」', s.flags.d_bolt ? '그 아래 볼트의 글씨로 짧은 공고: 「천년포 개발 중단. 부품 무료 배포. 연료 낭비 금지.」' : '「천년포 조립 인력 모집 — 볼트 공방」', s.quests.q_noel === 'done' ? '구석에 세피아의 반듯한 글씨: 「오늘의 하늘 — 회색. 예쁨.」' : ''].filter(Boolean)),
  ]);
  W.barks('gray', { noel: (s) => (s.quests.q_noel === 'done' ? ['초록. 예쁨.', '회색도 예쁨.'] : ['색 수집 중.', '온도 측정 중.']), rusty: ['고철 팝니다!'], engineer: ['톱니 장갑!'], engineer2: ['회색. …웃어도 돼.'], kid: ['초록이 뭐야?'] });
  W.barks('workshop', { bolt: ['……', '연료 낭비다.'] });

  /* 토리아와의 이야기 (8장) */
  G.story.talks.push(
    { id: 'gr_color', map: 'gray', run: async (c) => {
      await c.say('dotori', ['여기선 네 초록 옷이 제일 시끄러워. 다들 한 번씩 쳐다봐.', '…부러운 걸까, 싫은 걸까. 나는 갈색이라 티도 안 나.']);
    } },
    { id: 'gr_beacon', when: (s) => !!s.flags.m_gray_truth, pri: 5, run: async (c) => {
      await c.say('dotori:worry', ['등대. 볼트 아저씨가 그랬잖아. 16년 동안 흑점한테 등대를 켜 줬다고.', '…그럼 카이론은 하늘을 지킨 게 아니라, 불렀던 거야?']);
      const k = await c.ask(null, ['카이론은 몰랐을 거야.', '알았어도 멈추지 않았을 거야.', '…우리가 모르는 게 아직 있어.']);
      if (k === 0) await c.say('dotori', '…볼트 아저씨도 몰랐어. 알고 싶지 않아서. 어른들은 모르고 싶은 걸 참 잘 몰라.');
      else if (k === 1) await c.say('dotori', '「이유가 있는 잘못은 멈추질 않는다.」 할머니 말이야. 그 사람한테 이유가 뭘까.');
      else { await c.say('dotori', ['…응. 계산이 안 맞아. 엄마를 잃은 사람이 왜 엄마가 막은 걸 부를까.', '누가 흑점보다 더 무서운 걸까. 그 사람한테는.']); c.bond('dotori', 1); }
    } },
    { id: 'gr_noel', when: (s) => s.quests.q_noel === 'done', run: async (c) => {
      await c.say('dotori', ['세피아 언니가 3분 동안 멈췄을 때 고장 난 줄 알았어.', '…나도 처음 날았을 때 3초 멈췄어. 좋은 건 멈추게 하나 봐.']);
    } },
  );
  /* 쉬는 밤 (8장) */
  G.story.nights.push(
    { id: 'gr_noel_night', when: (s) => s.quests.q_noel === 'done', intro: '녹슨 톱니 여관. 창밖 가로등 아래 세피아가 서 있다. 하늘을 올려다보며, 움직이지 않는다.', run: async (c) => {
      await c.narr('여관 밖으로 나갔다. 세피아가 고개를 돌렸다. 렌즈가 가로등 불빛을 받아 주황색으로 반짝였다.');
      await c.say('noel', ['잠이 없는 부품이다. 그래서 밤하늘을 본다. 오늘 밤 하늘의 색을 기록 중이다.', '…질문이 있다. 「예쁘다」와 「그립다」는 같은 계산식인가.']);
      const k = await c.ask(null, ['비슷한데 달라.', '그리운 건 없어진 걸 예뻐하는 거야.', '…나도 잘 몰라.']);
      if (k === 0) await c.say('noel', '비슷한데 다르다. …사람의 말은 늘 오차가 있다. 그 오차가 좋다.');
      else if (k === 1) { await c.say('noel', ['없어진 것을 예뻐하는 것.', '…그럼 볼트는 매일 그립다. 아내를. 나를 볼 때마다.', '기록해 둔다. 오늘 처음으로 볼트를 조금 계산했다.']); c.bond('noel', 1); }
      else await c.say('noel', '모르는 것도 기록한다. 모른다는 기록은 다음 계산의 시작이다. 볼트가 한 말이다.');
    } },
  );

  G.world.nodes.push({ region: 'gray', label: '그레이', x: 112, y: 32, color: '#a8a8b8', maps: ['gray', 'ash_pass', 'ruins', 'archive', 'factory', 'workshop', 'gray_rank', 'gray_inn'] });
})();
