/* 6장 「천년제 전야」 — 무지개 다리 · 무지개 마을 · 서커스 · 새벽단 은신처 · 구름 바다 · 구름고래 섬 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data;

  W.keyItem('dawn_scarf', '새벽단 목도리', '레아가 준 붉은 목도리. 새벽단원의 표식이다. 「해가 뜨기 직전이 가장 어둡다.」');
  D.SHOPS.festival = { name: '천년제 노점', keeper: 'clown', items: ['f5', 'p5', 'f4', 'x5'] };

  W.quest('m6', { main: true, name: '6장 · 천년제 전야', where: '무지개 마을', stages: [
    '무지개 다리를 건너 [y]무지개 마을[/]로 가자.',
    '천년제 준비 위원장 [y]채색 할머니[/]를 만나자. 마을 한가운데 무지개 샘 근처에 있다.',
    '서커스 천막에서 광대 [y]롤로[/]의 공연을 보자.',
    '[y]새벽단 은신처[/]로 가자. 구름 바다 서쪽, 무지개 다리 밑이라고 했다.',
    '[y]구름고래 뭉게[/]의 섬에서 천년제를 망치려는 폭풍 구름을 쫓아내자. 구름 바다 북쪽 끝이다.',
    '채색 위원장에게 알리자.',
    '[y]레벨 25000[/]과 [b]덕후 5차[/]가 되면 마을 북동쪽 설원길로 화이트 마을에 가자. 성녀 루미에가 기다린다.',
  ], done: '눈 내리는 성지로 향했다.' });
  W.quest('q_cloud', { name: '천년제 장식', where: '무지개 마을', stages: ['몬스터에게서 [y]솜구름[/] 10개를 모아 채색 위원장에게 가져가자.'], done: '마을이 솜구름 장식으로 폭신해졌다.' });
  W.quest('q_star', { name: '집에 가고 싶은 별', where: '구름 바다', stages: ['구름 바다의 [y]별똥 꼬마[/] 6마리를 하늘로 돌려보내자. (쓰러뜨리면 하늘로 돌아간다)', '롤로에게 알리자.'], done: '그날 밤, 무지개 마을 하늘에 별 여섯 개가 새로 떴다.' });
  W.quest('q_applause', { name: '박수 부대', where: '서커스', stages: ['롤로의 공연에서 10초 동안 [y]90번[/] 박수를 치자. (렙업 버튼 연타)'], done: '서커스 천막이 떠나갈 듯한 박수. 롤로는 인사를 열 번 했다.' });

  W.book('b_festival', { title: '천년제의 유래', where: '무지개 마을', author: '천년제 위원회', text:
    '원년, 아우룸은 색 전쟁을 끝내고 무지개 샘 앞에서 다섯 부족과 약속했다.\n「천 년 뒤 이 샘 앞에 다시 모이자. 그때도 서로를 미워하지 않는다면, 그날을 축제로 삼자.」\n\n' +
    '그로부터 천 년. 천년력 1000년 새싹의 달, 무지개 마을은 대륙의 모든 색을 초대해 [y]천년제[/]를 연다.\n\n' +
    '전설에 따르면 천년제 날 밤, 무지개 샘은 일곱 빛깔을 합쳐 하얗게 빛난다고 한다.\n\n' +
    '(위원장 메모) 올해는 알록달록 마을 불꽃놀이 천 발이 천년성으로 가지 않고 여기서 터진다. 16년 만이다.' });
  W.book('b_spring', { title: '무지개 샘 안내문', where: '무지개 마을', text:
    '대륙에서 기운이 가장 짙게 솟는 샘. 색 전쟁의 원인이 되었던 곳.\n\n아우룸은 이 샘의 빛을 다섯 갈래로 나누어 대륙에 흘려보냈다. 그래서 이 샘의 빛은 가두면 안 된다.\n\n' +
    '※ 983년 이후 샘 옆에 대형 징수탑이 섰습니다. 샘의 빛 일부도 과세 대상입니다. — 천년성' });
  W.book('b_manifesto', { title: '새벽단 선언문', where: '새벽단 은신처', author: '새벽단', text:
    '우리는 빛을 되찾는다.\n\n탑은 하늘을 지킨다고 했다. 16년 동안 하늘은 지켜졌는가? 흑점은 다시 커지고 있다.\n탑은 아이들의 빛을 먹었다. 16년 동안 아이들은 레벨 10을 넘지 못했다.\n\n' +
    '우리는 탑을 부순다. 부순 탑에서 빛이 쏟아지면 아이들이 렙업한다. 그 빛이 우리의 새벽이다.\n\n' +
    '해가 뜨기 직전이 가장 어둡다. 우리는 그 어둠 속을 걷는다.\n— 새벽단 단장 레아' });
  W.book('b_lolo', { title: '롤로의 분장 노트', where: '서커스 천막', author: '롤로', text:
    '오늘의 분장: 코는 빨강. 볼은 분홍. 눈 위에는 파랑.\n\n나는 내 머리칼이 무슨 색이었는지 기억이 안 난다. 거울을 보면 회색이다. 사진도 회색이다.\n\n' +
    '관객석의 아이 하나가 물었다. 「광대 아저씨는 왜 얼굴에 색을 칠해요?」\n나는 대답했다. 「웃음은 색이 없어도 보이지만, 색이 있으면 더 멀리서도 보이거든.」\n\n' +
    '사실은 무섭다. 분장을 지우면 내가 투명해질 것 같아서.' });

  /* ───────── 무지개 다리 ───────── */
  W.map('rainbow_bridge', {
    name: '무지개 다리', sub: '하늘로 가는 길', region: 'rainbow', area: 'rainbow_bridge', theme: 'rainbow', bg: '#9fd4ff', ki: W.ki('rainbow', 0.05), music: 'field', weather: 'petal',
    grid: W.gen({
      w: 44, h: 15, seed: 'rainbow-bridge', ground: 'c', alt: [],
      obst: [['v', 1]], dense: 2, sparse: 0,
      border: 'v', bt: 1,
      clear: [[0, 3, 44, 9, 'v'], [0, 5, 44, 5, 'c'], [0, 6, 44, 3, '='], [18, 9, 6, 3, 'c'], [20, 12, 2, 3, 'c']],
      paths: [],
      stamps: [{ x: 12, y: 5, rows: ['l'] }, { x: 24, y: 5, rows: ['l'] }, { x: 36, y: 5, rows: ['l'] }, { x: 12, y: 9, rows: ['l'] }, { x: 36, y: 9, rows: ['l'] }],
    }),
    edges: { left: { to: 'purple', tx: 35, ty: 16 }, right: { to: 'rainbow', tx: 0, ty: 15 }, down: { to: 'dawn_base', tx: 8, ty: 2 } },
    objs: [W.sign(3, 5, ['무지개 다리 — 괴짜 이상 통행 가능', '→ 무지개 마을 (천년제 준비 중)']), W.spot(21, 10, 3), W.sign(22, 9, ['다리 아래로 구름 계단이 이어져 있다. 누군가 자주 오르내린 흔적이 있다.'])],
    mons: { list: ['rainbird', 'cloudsheep', 'rainbird'], n: 6, area: [4, 5, 36, 5] },
    enter: async (c) => {
      if (c.flag('ch6')) return;
      c.set('ch6');
      c.quest('m5', 'done');
      await c.chapter('6장', '천년제 전야', '다리 위로 일곱 빛깔 깃발이 펄럭였다. 천 년에 한 번 오는 축제가 다가오고 있었다.');
      await c.say('dotori:happy', ['찍! 발밑이 구름이야! 무지개 위를 걷고 있어!', '저 끝이 무지개 마을이야. 천년제 준비로 난리래!']);
      c.quest('m6', 0);
    },
  });

  /* ───────── 무지개 마을 ───────── */
  W.map('rainbow', {
    name: '무지개 마을', sub: '모든 색이 만나는 하늘 마을', region: 'rainbow', area: 'rainbow', theme: 'rainbow', bg: '#9fd4ff', ki: W.ki('rainbow', 0.03), town: true, weather: 'petal',
    grid: W.gen({
      w: 38, h: 30, seed: 'rainbow-town', ground: '.', alt: [['"', 0.64, 3], [',', 0.72, 4]],
      obst: [['f', 2], ['t', 2], ['T', 1]], dense: 0.82, sparse: 0.015, scale: 5,
      border: (x, y) => ((x + y) % 5 === 0 ? 'c' : 'v'), bt: 2, rough: 0.5,
      lakes: [{ x: 19, y: 14, rx: 3, ry: 2.2, edge: ':' }],
      paths: [[[0, 15], [15, 15]], [[23, 15], [37, 15]], [[19, 17], [19, 23]], [[19, 11], [19, 0]], [[9, 9], [9, 15]], [[29, 9], [29, 15]], [[9, 21], [9, 17], [15, 17]], [[29, 21], [29, 17], [23, 17]], [[33, 4], [33, 0]]],
      path: '=',
      clear: [[14, 10, 11, 9, ':'], [5, 4, 7, 5], [26, 4, 7, 5], [4, 21, 8, 5], [26, 21, 7, 5], [30, 2, 6, 3]],
      stamps: [{ x: 14, y: 10, rows: ['l'] }, { x: 24, y: 10, rows: ['l'] }, { x: 14, y: 18, rows: ['l'] }, { x: 24, y: 18, rows: ['l'] }, { x: 17, y: 12, rows: [' ~~~ ', '~~~~~', ' ~~~ '] }],
    }),
    builds: [
      { x: 4, y: 21, w: 8, h: 5, door: 4, style: 'tent', roof: '#e84a8a', to: 'circus', tx: 7, ty: 9 },
      { x: 5, y: 4, w: 7, h: 4, door: 4, roof: '#8ae07a', wall: 'candy', icon: 'star', signColor: '#ffe0f0', to: 'festival_hq', tx: 5, ty: 6 },
      { x: 26, y: 4, w: 7, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'candy', icon: 'star', signColor: '#c8d0ff', to: 'rainbow_rank', tx: 5, ty: 6 },
      { x: 26, y: 21, w: 7, h: 4, door: 3, roof: '#7ab8ff', wall: 'candy', icon: 'bed', to: 'rainbow_inn', tx: 5, ty: 6 },
      { x: 23, y: 10, w: 2, h: 3, style: 'tower' },
      { x: 30, y: 12, w: 3, h: 2, style: 'tent', roof: '#ffd84a' },
    ],
    edges: { left: { to: 'rainbow_bridge', tx: 43, ty: 7 }, up: { to: 'cloud_sea', tx: 21, ty: 31 }, right: { to: 'snowfield', tx: 0, ty: 18, req: { lv: 25000, rank: ['r3', 5] }, msg: '동쪽 설원길. 성기사단 초소: 「화이트 성지는 덕후 5차 이상만 들어갈 수 있다.」' } },
    objs: [
      W.sign(2, 14, ['무지개 마을 — 모든 색이 만나는 하늘 마을', '천년제 D-?? 준비 중! ↑ 구름 바다   → 설원길 (화이트 성지)']),
      W.bookObj('b_festival', 15, 11), W.bookObj('b_spring', 22, 17),
      W.spot(19, 18, 3), W.spot(35, 27, 10, true),
      { t: 'sign', x: 23, y: 12, invisible: true, text: ['무지개 샘 옆의 거대한 징수탑. 다른 마을 탑보다 세 배는 크다.', '샘에서 솟는 일곱 빛깔 기운이 탑으로 빨려 들어가 회색이 된다.'] },
    ],
    npcs: [
      { id: 'chaesaek', x: 17, y: 17, dir: 'down', mark: (s) => (s.quests.m6 === 1 || s.quests.m6 === 5 || (s.flags.m_rainbow_share && s.quests.q_cloud == null) || (s.quests.q_cloud === 0 && E.has(s, 'm11', 10)) ? '!' : null), talk: chaesaekTalk },
      { id: 'lumie', x: 21, y: 11, dir: 'down', cond: (s) => !!s.flags.lumie_rainbow, talk: lumieRainbow },
      { id: 'edel', x: 22, y: 11, dir: 'down', cond: (s) => !!s.flags.lumie_rainbow, talk: async (c) => { await c.say('edel', ['백은 기사 에델이오. 성녀님을 모시고 있소.', '천년제 축복 의식을 위해 왔소. …그대의 빛, 성녀님이 오래 기다리셨소.']); } },
      { id: 'clown', x: 10, y: 19, dir: 'down', talk: async (c) => { await c.say('clown', ['천년제 노점이에요! 일곱빛 솜사탕은 천 년에 한 번 먹는 맛!', '…사실 매일 팔아요.']); await c.shop('festival'); } },
      { id: 'clown2', speaker: 'clown', x: 31, y: 14, dir: 'down', look: G.chars.clown.look, talk: async (c) => { await c.say('clown', '무지개 장갑이랑 축제 예복 있어요! 천년제엔 화려하게!'); await c.shop('rainbow'); } },
      { id: 'kid', x: 13, y: 13, dir: 'right', wander: 2, talk: W.chatter('rb_kid', ['천년제 날엔 불꽃놀이 천 발이 터진대! 원래는 천년성에 바치는 건데 올해는 여기서 터진대!', '롤로 아저씨 공연 봤어? 아저씨는 색이 없는데 제일 웃겨!', '무지개 샘이 하얗게 빛나는 날이 온대. 천 년에 한 번!']) },
      { id: 'villager2', x: 27, y: 18, dir: 'left', wander: 2, talk: W.chatter('rb_v', ['여기 사람들은 부모가 다 다른 지방 출신이야. 나는 아빠가 레드, 엄마가 블루. 렙업하면 보라색 빛이 나.', '저 큰 탑 좀 봐. 무지개 샘의 빛까지 먹어. 샘 빛이 회색이 되어 가.', '새벽단이 천년제 날 탑을 부순다는 소문이 있어. 쉿.']) },
    ],
    enter: async (c) => {
      if (c.flag('rainbow_intro')) return;
      c.set('rainbow_intro');
      await c.say('dotori:surprise', ['찍! 온 마을이 알록달록해! 깃발, 풍선, 솜사탕!', '저기 무지개 샘 옆에… 엄청 큰 탑이 있어. 다른 탑보다 세 배는 커.']);
      c.quest('m6', 1);
    },
  });
  W.town({ map: 'rainbow', x: 19, y: 20, name: '무지개 마을', color: '#ff8ac8', desc: '모든 색이 만나는 하늘 마을. 천년제 준비 중.', hint: '퍼플 마을 동쪽 무지개 다리 너머' });

  async function chaesaekTalk(c) {
    const s = c.s;
    if (s.quests.m6 === 1) {
      await c.say('chaesaek', ['어머나, 손님! 천년제 준비 위원장 채색이에요. 999년 동안 이 날을 기다렸죠. …실제 나이는 여든일곱이지만.', '천 년 만의 축제에 이것저것 할 일이 산더미예요!']);
      await c.say('chaesaek', ['우선 서커스 천막에서 [y]롤로[/]의 리허설을 봐 줘요. 천년제 개막 공연이거든요.', '롤로는… 요즘 몸이 안 좋아요. 빛바램병이 심해져서요. 그래도 무대에 서겠대요.']);
      c.quest('m6', 2);
      return;
    }
    if (s.quests.m6 === 5) {
      await c.say('chaesaek:happy', ['폭풍 구름을 쫓아냈다고요? 이제 천년제 날 비는 안 오겠네요!', '고마워요, 흰빛 손님. 천년제 날엔 꼭 와요. 제일 좋은 자리를 비워 둘게요.']);
      await c.say('chaesaek', ['그리고… 성녀 루미에 님이 당신을 찾으셨어요. 동쪽 설원길 너머 [y]화이트 마을[/] 대성당으로 오래요.', '설원길은 성기사단이 지켜요. [b]덕후 5차[/]는 돼야 들여보내 줘요.']);
      c.gold(400000000);
      c.quest('m6', 6);
      return;
    }
    if (s.quests.q_cloud === 0 && E.has(s, 'm11', 10)) {
      c.take('m11', 10);
      await c.say('chaesaek:happy', '솜구름 열 개! 이걸로 광장을 폭신폭신하게 꾸밀 수 있겠어요!');
      c.gold(200000000); c.give('f5', 5);
      c.quest('q_cloud', 'done');
      return;
    }
    if (s.flags.m_rainbow_share && s.quests.q_cloud == null) {
      await c.say('chaesaek', '부탁이 하나 더 있어요. 장식할 [y]솜구름[/]이 모자라요. 구름 양이나 무지개 새가 떨어뜨리는데 10개만 구해 줄래요?');
      c.quest('q_cloud', 0);
      return;
    }
    await c.run(W.chatter('chaesaek', ['천년제 날 밤엔 무지개 샘이 하얗게 빛난대요. 전설이니까 믿어야죠!', '알록달록 마을 팡팡 박사님이 불꽃놀이 천 발을 준비하고 있어요. 올해는 천년성에 안 보내고 여기서 터뜨린대요.', '루미에 성녀님이 축복 의식을 해 주러 오신대요. 대성당 밖으로 나오시는 건 16년 만이래요.']));
  }
  async function lumieRainbow(c) {
    await c.say('lumie', ['…아, 흰빛의 아이. 기다리고 있었어요.', '당신을 보니… 오래전 친구가 생각나요. 따뜻하고, 조금 슬픈 빛.']);
    await c.say('lumie', ['화이트 마을로 와요. 이리스 대성당에서 기다릴게요. 당신이 알아야 할 것이 있어요.', '그리고… 당신을 지켜 주고 싶어요. 누구보다도.']);
    await c.say('dotori:worry', '(작게) …찍. 착한 사람 같은데, 왜 좀 무섭지.');
  }

  /* ── 서커스 ── */
  W.map('circus', {
    name: '무지개 서커스', region: 'rainbow', area: 'rainbow', theme: 'interior', bg: '#1a0a1e', ki: W.ki('rainbow', 0.05), music: 'rainbow', banner: false,
    grid: W.room({ w: 15, h: 11, floor: '+', door: 7, win: [], rug: [4, 2, 7, 3], put: [[1, 2, 'b'], [13, 2, 'b'], [1, 7, 'd'], [2, 7, 'd'], [12, 7, 'd'], [13, 7, 'd'], [4, 8, 'd'], [10, 8, 'd'], [1, 9, 'p'], [13, 9, 'p']] }),
    warps: [W.exit(7, 10, 'rainbow', 8, 26)],
    objs: [W.bookObj('b_lolo', 13, 2)],
    npcs: [{ id: 'lolo', x: 7, y: 3, dir: 'down', mark: (s) => (s.quests.m6 === 2 || s.quests.q_star === 1 || (s.flags.m_rainbow_share && s.quests.q_applause == null) ? '!' : null), talk: loloTalk }],
  });
  async function loloTalk(c) {
    const s = c.s;
    if (s.quests.m6 === 2) return loloScene(c);
    if (s.quests.q_star === 1) {
      await c.say('lolo:happy', ['별똥 꼬마들이 하늘로 돌아갔다고? 오늘 밤 별이 여섯 개 늘겠네!', '고마워. 그 녀석들, 서커스 천막 위에서 매일 울었거든. 집에 가고 싶다고.']);
      c.gold(200000000); c.give('p5', 5);
      c.quest('q_star', 'done');
      return;
    }
    if (s.flags.m_rainbow_share && s.quests.q_applause == null) {
      await c.say('lolo', ['이제 무대가 무섭지 않아! 박수만 있으면 돼!', '리허설 좀 도와줄래? 10초 동안 박수 [y]90번[/]! 관객석이 텅 비어서 연습이 안 돼.']);
      c.quest('q_applause', 0);
    }
    if (s.quests.q_applause === 0) {
      if (!(await c.yes('박수를 칠까?', 'lolo', '짝짝짝!', '나중에'))) return;
      const n = await c.clickRace(10);
      if (n >= 90) { await c.say('lolo:happy', n + '번! 천막이 무너질 것 같아! 최고의 관객이야!'); c.gold(300000000); c.give('f5', 3); c.quest('q_applause', 'done'); if (s.quests.q_star == null) { await c.say('lolo', ['아 참, 구름 바다에 [y]별똥 꼬마[/]들이 떨어져서 울고 있어. 쓰러뜨려 주면 하늘로 돌아갈 수 있대.', '여섯 마리만 돌려보내 줄래?']); W.markKills(s, 'shootstar', 'q_star_base'); c.quest('q_star', 0); } }
      else await c.say('lolo', n + '번… 좀 더 크게! 관객 한 명이 백 명처럼 쳐 줘야 해!');
      return;
    }
    if (s.quests.q_star === 0 && W.killsSince(s, 'shootstar', 'q_star_base') >= 6) { c.quest('q_star', 1); return loloTalk(c); }
    await c.run(W.chatter('lolo', [
      '웃음은 색이 없어도 보여. 그런데 색이 있으면… 더 멀리서도 보이더라.',
      '분장을 지워도 괜찮아졌어. 거울 속의 내가 분홍색이거든. 분홍 광대! 멋지지?',
      '천년제 개막 공연은 내가 해. 관객석 맨 앞자리는 너랑 도토리 거야.',
    ]));
  }
  async function loloScene(c) {
    c.music('rainbow');
    await c.say(null, '무대 위에서 얼굴에 알록달록 분장을 한 광대가 공 다섯 개를 저글링하고 있다.');
    await c.say('lolo', ['오, 관객이다! 어서 와, 어서 와! 롤로의 무지개 서커스에 온 걸 환영해!', '자, 공 다섯 개! 여섯 개! 일곱 개—']);
    c.music(null);
    c.sfx('bump');
    await c.say(null, '공이 하나씩 바닥에 떨어졌다. 롤로가 무릎을 꿇었다.');
    await c.emote('lolo', '💧');
    await c.say('lolo:sad', ['…하하. 미안. 요즘 손이 잘 안 보여서.', '봐. 손끝이… 투명해지고 있어.']);
    await c.say(null, '롤로의 손끝이 유리처럼 비쳐 보였다. 빛바램병의 마지막 단계. 색이 빠진 자리에 이제 몸까지 흐려지고 있었다.');
    await c.say('dotori:sad', '찍… {n}. 베라 교수님이 그랬잖아. 흰빛은… 나눌 수 있다고.');
    await c.say('@', '……');
    const k = await c.ask(null, ['롤로의 손을 잡는다', '…할 수 있을까?']);
    if (k === 1) await c.say('dotori', '할 수 있어! 등대도 켰잖아! 이번엔 사람이야. 더 따뜻하게!');
    await c.say(null, '{n}은(는) 롤로의 투명해진 손을 잡았다.');
    await c.sys('롤로의 손을 잡고 [y]렙업 버튼을 20번[/] 눌러 흰빛을 나눠 주자.');
    c.music('mother');
    await c.waitClick(20, (k2) => { if (k2 % 5 === 0) { c.flash('#ffffff', 250); c.light(15); } });
    c.flash('#ffffff', 1600);
    c.light(120);
    c.sfx('white');
    await c.wait(1);
    await c.say(null, ['흰빛이 손끝에서 롤로에게로 흘러 들어갔다. 투명하던 손가락에 살색이 돌아왔다.', '그리고— 회색이던 롤로의 곱슬머리가 끝에서부터 물들기 시작했다.']);
    await c.emote('lolo', '!');
    await c.say('lolo:surprise', ['……분홍색?', '내 머리… 분홍색이었어? 16년 동안 몰랐어. 나, 분홍색이었구나.']);
    await c.say('lolo:happy', ['하하… 하하하! 분홍 광대라니! 이게 뭐야, 너무 웃기잖아!', '웃음은 색이 없어도 보여. 그런데… 색이 있으니까 더 잘 보이네.']);
    c.set('m_rainbow_share');
    await c.wait(0.4);
    await c.say('dotori:surprise', '찍?!');
    await c.dotori.jump();
    await c.dotori.jump();
    await c.say(null, '흰빛의 여운이 도토리에게도 튀었다. 도토리가 폴짝 뛰어오르더니— 내려오지 않았다.');
    await c.say('dotori:surprise', ['나, 나… 떠 있어! 날고 있어! 찍! 찍찍!', '…어, 어어? 어어어—']);
    c.sfx('bump');
    await c.say(null, '3초. 도토리는 정확히 3초 동안 날았다. 그리고 롤로의 공 위에 떨어졌다.');
    await c.say('dotori:happy', ['날았어! 16년 만에 처음으로! 3초나!', '…그리고 {n}, 나 방금 [y]레벨 10[/] 됐어! 16년 만에! 찍! 찍찍찍!']);
    await c.say('lolo:happy', '하하하! 오늘 공연은 대성공이야!');
    c.set('dotori_lv10');
    await c.wait(0.3);
    c.spawn({ id: 'lea', x: 7, y: 9, dir: 'up' });
    await c.npc('lea').walk('UUUU');
    await c.say('lea', ['…정말이었군. 흰빛은 나눌 수 있다.', '레드 마을 지붕 위에서 처음 봤을 때부터 궁금했어. 탑을 부순 흰빛이 어떤 아이인지.']);
    await c.emote('@', '!');
    await c.say('lea', ['나는 레아. 새벽단 단장이지. 탑을 부수고 다니는 사람들.', '할 얘기가 있어. 무지개 다리 밑 구름 계단으로 내려와. 우리 은신처가 거기 있어.']);
    await c.say('lea', '…그리고 거기, 네가 아는 녀석도 있을 거야.');
    await c.npc('lea').walk('DDDDDD');
    c.despawn('lea');
    c.quest('m6', 3);
    c.music('rainbow');
  }
  W.map('festival_hq', {
    name: '천년제 위원회', region: 'rainbow', area: 'rainbow', theme: 'interior', bg: '#1a0a1e', ki: W.ki('rainbow', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'h'], [2, 2, 'f'], [7, 2, 'f'], [8, 2, 'h'], [3, 4, 'd'], [4, 4, 'd'], [5, 4, 'd'], [6, 4, 'd'], [1, 6, 'b'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'rainbow', 9, 8)],
    npcs: [{ id: 'clown', x: 4, y: 5, dir: 'up', talk: W.chatter('hq_clown', ['위원회 회의 중이에요. 풍선 색깔로 세 시간째 싸우는 중이에요.', '천년제 초대장은 대륙 모든 마을에 보냈어요. 천년성에도요. 답장은 없었어요.']) }],
  });
  W.map('rainbow_rank', {
    name: '무지개 마을 등급소', region: 'rainbow', area: 'rainbow', theme: 'interior', bg: '#1a0a1e', ki: W.ki('rainbow', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'f'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'rainbow', 29, 8)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상만은 아무것도 들고 있지 않다. 두 손을 펴고 있다.', '받침돌: 「나누는 손」'] }],
    npcs: [W.clerk('clerk_rb', 5, 3, { hello: '등급소예요! 오늘은 무슨 색 도장이 좋을까요? 기분이 좋으니까 분홍!', bye: '다음엔 초록으로 찍어 줄게요!' })],
  });
  W.map('rainbow_inn', {
    name: '일곱빛 여관', region: 'rainbow', area: 'rainbow', theme: 'interior', bg: '#1a0a1e', ki: W.ki('rainbow', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '+', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'f'], [8, 6, 'f']] }),
    warps: [W.exit(5, 7, 'rainbow', 29, 25)],
    npcs: [W.innkeeper('innkeeper', 4, 4, 0, '일곱빛 여관이에요! 천년제 기간엔 방이 없는데… 흰빛 손님은 특별히 공짜!')],
  });

  /* ── 새벽단 은신처 ── */
  W.map('dawn_base', {
    name: '새벽단 은신처', sub: '무지개 다리 밑', region: 'rainbow', area: 'dawn', theme: 'cave', bg: '#0a1020', ki: W.ki('rainbow', 0.2), music: 'black', dark: 90, battleBg: 'cloud',
    grid: W.room({ w: 16, h: 12, floor: 'o', door: null, win: [], put: [[1, 2, 'b'], [2, 2, 'X'], [13, 2, 'b'], [14, 2, 'h'], [6, 5, 'd'], [7, 5, 'd'], [8, 5, 'd'], [9, 5, 'd'], [1, 9, 'q'], [2, 9, 'q'], [14, 9, 'l'], [1, 5, 'l']] }).map((r, y) => (y <= 1 ? r.slice(0, 8) + 'S' + r.slice(9) : r)),
    warps: [{ x: 8, y: 1, to: 'rainbow_bridge', tx: 21, ty: 13, dir: 'up' }],
    lights: [{ x: 7, y: 5, r: 60, c: '#ffd86a' }],
    objs: [W.bookObj('b_manifesto', 14, 2)],
    npcs: [
      { id: 'lea', x: 7, y: 4, dir: 'down', mark: (s) => (s.quests.m6 === 3 ? '!' : null), talk: leaTalk },
      { id: 'rud', x: 10, y: 4, dir: 'down', talk: rudDawnTalk },
      { id: 'dawn', x: 3, y: 7, dir: 'right', talk: W.chatter('dawn_member', ['새벽단원이다. 레드 출신, 블루 출신, 옐로 출신… 여긴 출신이 없어.', '천년제 날 밤 무지개 샘 옆의 대형 탑을 부순다. 그게 계획이야.', '단장님은 전직 징수 기사였어. 983년 첫 징수의 날, 제 손으로 걷은 첫 빛을 보고 그날 밤 기사단을 떠났대.']) },
    ],
  });
  async function leaTalk(c) {
    const s = c.s;
    if (s.quests.m6 !== 3) {
      await c.run(W.chatter('lea', [
        ['천년제 날 밤, 무지개 샘 옆 탑을 부순다. 그 탑은 대륙 모든 탑의 빛이 천년성으로 가기 전에 모이는 중계탑이야.', '부수면 16년 치 빛이 쏟아져. 무지개 샘으로. 그리고 대륙으로.'],
        '루드는 숫자를 잘 세. 새벽단 장부를 맡겼어. …누나로서 해 줄 수 있는 게 그것뿐이라.',
        '카이론이 뭘 하려는지 우리도 몰라. 하지만 빛을 모으는 사람은 믿으면 안 된다는 건 알아.',
      ]));
      return;
    }
    await c.say('lea', ['왔군. 앉아. 차는 없어. 구름 계단 밑이라 불을 못 피워.', '새벽단은 탑을 부순다. 16년째. 부순 탑이 서른한 개, 다시 세워진 탑이 서른한 개.']);
    await c.say('lea', ['탑을 부수는 건 끝이 없어. 기사단이 다시 세우거든. 그런데 너는 달라.', '너는 빛을 [w]나눌 수 있어[/]. 탑이 빛을 모으는 동안, 너는 빛을 흩을 수 있지.']);
    await c.say('lea', ['천년제 날 밤, 우리는 무지개 샘 옆 대형 탑을 부순다. 16년 치 빛이 쏟아질 거야.', '그 빛을 흩어 줄 사람이 필요해. 흰빛의 사람이.']);
    const k = await c.ask(null, ['돕겠어', '생각해 볼게']);
    if (k === 0) await c.say('lea', '…고마워. 단원들한테 널 소개할게. 그리고 이거.');
    else await c.say('lea', '생각해도 돼. 천년제까진 시간이 있어. 그래도 이건 가져가.');
    c.give('dawn_scarf');
    c.set('m_rainbow_lea');
    await c.say('rud', '……');
    await c.say('lea', ['루드. 인사해. …아는 사이지?', '(루드에게) 그리고… 미안해. 너를 두고 떠나서. 8년 동안.']);
    await c.say('rud', s.flags.helped_rud ? ['…흥. 누나 사과는 나중에 숫자로 받을 거야.', '(흰빛에게) 빚 갚으러 왔다. 1,000골드. 새벽단 장부에 네 이름 적어 뒀어. 이자는… 탑 하나.'] : ['…흥. 누나 사과는 나중에 숫자로 받을 거야.', '(흰빛에게) 너한테 진 거, 아직 안 잊었어. 이번엔 같은 편에서 숫자를 세 주지.']);
    await c.say('lea', ['그리고 하나 더. 천년제 전에 루미에 성녀가 너를 찾을 거야. 성녀는 다정해. 누구보다.', '…그래서 조심해. 다정한 사람이 가장 무서운 부탁을 하는 법이거든.']);
    await c.say('lea', ['그 전에 구름 바다 북쪽 [y]구름고래[/] 섬에 폭풍 구름이 산다. 천년제 날 비를 뿌리면 불꽃놀이가 망해.', '채색 할머니가 부탁할 거야. 해 줘. 축제는 망치면 안 되니까. 우리가 부술 건 탑이지 축제가 아니야.']);
    c.set('lumie_rainbow');
    c.quest('m6', 4);
  }
  async function rudDawnTalk(c) {
    const s = c.s;
    if (!s.flags.m_rainbow_lea) { await c.say('rud', '…누나한테 먼저 가. 난 장부 정리 중이야.'); return; }
    await c.run(W.chatter('rud_dawn', [
      ['새벽단 장부. 부순 탑 31개. 되찾은 빛은 평민 5만 명분. 다시 빼앗긴 빛은 평민 5만 명분.', '…0이야. 16년 동안 0. 숫자는 거짓말 안 해.'],
      ['누나는 날 두고 떠났어. 약값 벌어 오겠다고. 8년 동안 편지 한 통 없었어.', '…근데 매달 약값이 익명으로 들어왔어. 숫자는 거짓말 안 하지. 나만 몰랐던 거야.'],
      '루카랑 루미가 너한테 안부 전하래. 머리 색은 아직 회색이지만… 요새 그림을 그려. 무지개를.',
    ], 'rud'));
  }

  /* ───────── 구름 바다 ───────── */
  W.map('cloud_sea', {
    name: '구름 바다', sub: '무지개 마을 북쪽', region: 'rainbow', area: 'cloud_sea', theme: 'cloud', bg: '#9fd4ff', ki: W.ki('rainbow', 0.5), music: 'field', weather: 'petal',
    grid: W.gen({
      w: 42, h: 32, seed: 'cloud-sea', ground: 'c', alt: [['.', 0.7, 5]],
      obst: [['v', 5], ['t', 1]], dense: 0.58, sparse: 0.03, scale: 5,
      border: 'v', bt: 2, rough: 0.6,
      paths: [[[21, 31], [21, 24], [12, 18], [12, 10], [21, 6], [30, 10], [30, 18], [21, 24]], [[21, 6], [21, 0]], [[12, 14], [4, 14]]], path: '=',
      clear: [[2, 11, 6, 6, 'c'], [26, 20, 7, 5, 'c']],
    }),
    edges: { down: { to: 'rainbow', tx: 19, ty: 0 }, up: { to: 'whale_isle', tx: 14, ty: 21 } },
    objs: [W.sign(22, 28, ['구름 바다', '↑ 구름고래 섬   구멍 조심! 떨어지면 무지개 마을 광장이다. (아프다)']), W.spot(4, 14, 3), W.spot(30, 22, 3), W.spot(38, 4, 10, true), W.chest('cs1', 3, 12, 'p5', 5), W.goldChest('cs2', 31, 21, 600000000)],
    mons: { list: ['cloudsheep', 'rainbird', 'candy', 'balloon', 'clowndoll', 'shootstar'], n: 13, area: [2, 2, 38, 28] },
  });
  W.map('whale_isle', {
    name: '구름고래 섬', sub: '뭉게의 등 위', region: 'rainbow', area: 'whale', theme: 'cloud', bg: '#bfe4ff', ki: W.ki('rainbow', 0.86), music: 'rainbow', weather: 'rain',
    grid: W.gen({
      w: 28, h: 22, seed: 'whale-back', ground: '.', alt: [['"', 0.6, 3]],
      obst: [['T', 2], ['f', 1], ['t', 1]], dense: 0.7, sparse: 0.03, scale: 4,
      border: 'v', bt: 2, rough: 0.5,
      paths: [[[14, 21], [14, 12], [8, 8], [14, 4], [20, 8], [14, 12]]],
      clear: [[10, 2, 8, 4]],
    }),
    edges: { down: { to: 'cloud_sea', tx: 21, ty: 0 } },
    objs: [W.spot(8, 8, 3), W.spot(4, 16, 10, true), { t: 'orbshine', orb: 'o_y1', x: 14, y: 3, need: (s) => !!s.flags.beat_storm, hint: '섬 한가운데서 노란 빛이 반짝인다. 폭풍 구름이 그 위를 맴돌고 있다.' }],
    mons: { list: ['rainbird', 'shootstar', 'candy'], n: 6, area: [2, 2, 24, 18] },
    fixed: [{ mon: 'storm', x: 14, y: 5, flag: 'beat_storm', boss: true, look: { creature: 'ghost', tint: '#6a7a9a' }, talk: stormTalk }],
    npcs: [{ id: 'mungge', x: 20, y: 8, dir: 'left', talk: munggeTalk }],
  });
  async function stormTalk(c, mo) {
    await c.say(null, '먹구름 한 덩이가 섬 한가운데를 맴돌며 번개를 치고 있다. 기분이 아주 나빠 보인다.');
    await c.say('dotori', '찍! 저게 폭풍 구름이야! 천년제 날 비를 뿌리면 불꽃놀이가 망해!');
    const win = await c.battle('storm', { noFlee: true });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_storm');
    await c.say(null, '폭풍 구름이 쪼그라들더니 작은 흰 구름이 되어 둥실 떠갔다. 기분이 좀 나아진 것 같다.');
    if (c.s.quests.m6 === 4) c.quest('m6', 5);
  }
  async function munggeTalk(c) {
    await c.say('mungge', ['…………안…………녕…………', '…………나는…………뭉게…………구름…………고래…………']);
    await c.say('dotori', '찍… 한 문장에 반나절 걸린다더니 진짜네.');
    await c.say('mungge', ['…………내…………등…………위…………노란…………구슬…………', '…………폭풍이…………지키고…………있어…………가져가…………']);
    if (c.flag('beat_storm')) await c.say('mungge:happy', '…………고마워…………이제…………비…………안…………와…………천년제…………나도…………보러…………갈게…………');
  }

  G.world.nodes.push({ region: 'rainbow', label: '무지개', x: 132, y: 64, color: '#ff8ac8', maps: ['rainbow', 'rainbow_bridge', 'cloud_sea', 'whale_isle', 'circus', 'festival_hq', 'rainbow_rank', 'rainbow_inn', 'dawn_base'] });
})();
