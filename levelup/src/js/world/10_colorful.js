/* 10장 「불꽃놀이와 로켓」 — 알록달록 마을 · 알록달록 곶 · 로켓 격납고 · 불꽃놀이 탑 · 동료들의 선물 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data;

  D.SHOPS.colorful_food = { name: '봄바의 간식 수레', keeper: 'ppeong', items: ['f9', 'p9', 'f8'] };
  const PARTS = ['gear_heart', 'gold_bond', 'prayer_crystal', 'night_key', 'rocket_fuel'];

  W.quest('m10', { main: true, name: '10장 · 불꽃놀이와 로켓', where: '알록달록 마을', stages: [
    '[y]레벨 250000[/]과 [y]짱 15차[/]가 되면 블랙 마을 남쪽 해안길로 알록달록 마을에 가자.',
    '로켓을 만드는 [y]피로스 박사[/]를 찾자. 마을 동쪽 격납고다.',
    '로켓 「무한호」의 부품 다섯 개를 모으자. 톱니 심장(그레이 · 볼트), 금화왕의 채권(옐로 · 골디), 기도의 수정(화이트 · 루미에), 밤의 열쇠, 별빛 연료(불꽃놀이 탑 꼭대기).',
    '부품을 모두 모았다! 격납고의 피로스 박사에게 가자.',
    '[y]레벨 400000[/]과 [p]전설 1차[/]가 되면 무한호에 오르자. 전설의 문은 보라 구슬 넷의 숫자를 더해 연다.',
  ], done: '무한호는 불꽃 천 발의 배웅을 받으며 하늘로 올라갔다.' });
  W.quest('q_powder', { name: '봄바의 대폭발', where: '알록달록 마을', stages: ['몬스터에게서 [y]폭죽 화약[/] 10개를 모아 봄바에게 가져가자.'], done: '봄바는 「마을이 반쯤 날아갔다」고 했다. 실제로는 봄바 앞머리가 조금 탔다.' });
  W.quest('q_rehearsal', { name: '천년제 불꽃 리허설', where: '알록달록 곶', stages: ['불꽃놀이 리허설! 10초 동안 폭죽 [y]130발[/]을 쏘아 올리자. (렙업 버튼 연타)'], done: '밤하늘이 잠깐 대낮처럼 밝았다. 블랙 마을 사람들이 그걸 보고 해가 뜬 줄 알았다고 한다.' });

  W.book('b_free', { title: '알록달록 선언', where: '알록달록 마을', text:
    '하나. 우리는 등급을 모른다. 알아도 모른 척한다.\n둘. 우리 마을에는 징수탑이 없다. 대신 해마다 불꽃놀이 천 발을 천년성에 바친다.\n셋. 불꽃은 하늘로 올라가 터진다. 빛은 흩어진다. 탑처럼 모이지 않는다. 그게 우리가 불꽃을 좋아하는 이유다.\n\n' +
    '넷. 폭발은 실패가 아니다. 아직 성공하지 않은 것뿐이다. — 피로스' });
  W.book('b_rocket_log', { title: '무한호 개발 일지', where: '로켓 격납고', author: '피로스', text:
    '983년 — 1호기. 폭발.\n984년 — 2호기~11호기. 전부 폭발.\n990년 — 57호기. 3미터 떴다! 그리고 폭발.\n995년 — 128호기. 구름까지 갔다! 그리고 폭발. 구름에 구멍이 났다. 무지개 마을에서 항의.\n\n' +
    '998년 — 무한호. 이번엔 다르다. 엔진 심장, 방어막, 자금, 열쇠, 연료. 다섯 가지만 있으면 된다. 다섯 가지 전부 내 힘으로는 못 구한다.\n\n그래서 16년이 걸렸다. 혼자서는 하늘에 못 간다는 걸 아는 데.' });
  W.book('b_pang_letter', { title: '세린과의 약속', where: '로켓 격납고', author: '피로스', text:
    '세린, 기억해? 982년 여름, 네가 이 격납고에 왔었지. 「박사님, 하늘에 가는 로켓을 만들어 주세요. 언젠가 제 아이가 탈 거예요.」\n\n' +
    '나는 웃으면서 약속했지. 「세상에서 제일 안 폭발하는 로켓을 만들어 줄게!」\n\n' +
    '16년 동안 128번 폭발했어. 미안해. 그래도 이번엔 진짜야. 네 아이가 왔어. 네 눈을 하고.' });
  W.book('b_thousand', { title: '불꽃놀이 천 발의 역사', where: '불꽃놀이 탑', text:
    '983년부터 알록달록 마을은 징수탑 대신 해마다 불꽃놀이 천 발을 천년성에 바쳤다. 천년성 하늘에서 터진 불꽃의 빛은 탑으로 모였다.\n\n' +
    '올해, 천년제 위원회의 초대로 천 발은 처음으로 무지개 마을 하늘에서 터진다. 모이지 않고 흩어지는 빛으로.\n\n' +
    '탑 꼭대기의 대폭죽 「천발이」는 천 발을 한 번에 쏘도록 만들어졌다. 아직 한 발도 쏜 적이 없다. 쏠 날을 기다리다 성격이 나빠졌다.' });

  /* ───────── 알록달록 마을 ───────── */
  W.map('colorful', {
    name: '알록달록 마을', sub: '모든 색이 뒤섞인 곶', region: 'colorful', area: 'colorful', theme: 'colorful', bg: '#3a2a4a', ki: W.ki('colorful', 0.03), town: true, weather: 'spark',
    grid: W.gen({
      w: 38, h: 30, seed: 'colorful-cape', ground: '.', alt: [['"', 0.6, 3], [':', 0.74, 4]],
      obst: [['f', 2], ['T', 1], ['t', 1], ['b', 1]], dense: 0.8, sparse: 0.02, scale: 5,
      border: (x, y) => (y >= 27 ? '~' : 'T'), bt: 2, rough: 0.5,
      paths: [[[18, 0], [18, 26]], [[4, 14], [37, 14]], [[9, 10], [9, 14]], [[28, 10], [28, 14]], [[9, 18], [9, 14]], [[30, 20], [30, 14]], [[18, 20], [24, 20]]],
      path: '=',
      clear: [[4, 5, 7, 5], [23, 3, 12, 7], [4, 17, 7, 5], [26, 17, 8, 6], [2, 25, 34, 2, 's']],
      stamps: [{ x: 16, y: 12, rows: ['l'] }, { x: 20, y: 12, rows: ['l'] }, { x: 16, y: 16, rows: ['l'] }, { x: 20, y: 16, rows: ['l'] }],
    }),
    builds: [
      { x: 23, y: 3, w: 12, h: 6, door: 5, style: 'dome', roof: '#ff7a3a', wall: 'metal', icon: 'star', signColor: '#ffe0a0', to: 'hangar', tx: 9, ty: 12 },
      { x: 4, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#5ae8a8', wall: 'candy', icon: 'star', signColor: '#c8d0ff', to: 'colorful_rank', tx: 5, ty: 6 },
      { x: 4, y: 17, w: 6, h: 4, door: 3, roof: '#ff5a8a', wall: 'candy', icon: 'bed', to: 'colorful_inn', tx: 5, ty: 6 },
      { x: 27, y: 17, w: 6, h: 3, door: 3, roof: '#ffd84a', wall: 'candy', icon: 'hammer', to: 'invent_shop', tx: 5, ty: 6 },
    ],
    edges: { up: { to: 'black', tx: 18, ty: 29 }, right: { to: 'cape', tx: 0, ty: 15 } },
    objs: [
      W.sign(20, 1, ['알록달록 마을 — 등급 따위 모름', '→ 알록달록 곶 · 불꽃놀이 탑   ↑ 블랙 마을']),
      W.bookObj('b_free', 13, 13),
      W.spot(24, 21, 3), W.spot(35, 4, 10, true),
      W.sign(19, 14, ['광장 한가운데. 원래 징수탑이 설 자리였다.', '대신 커다란 폭죽 조형물이 서 있다. 받침돌: 「우리는 흩어지는 빛을 좋아한다」']),
    ],
    npcs: [
      { id: 'ppeong', x: 20, y: 18, dir: 'down', mark: (s) => (s.flags.color_intro && s.quests.q_powder == null) || (s.quests.q_powder === 0 && E.has(s, 'm15', 10)) ? '!' : null, talk: ppeongTalk },
      { id: 'inventor', x: 12, y: 15, dir: 'down', wander: 2, talk: W.chatter('c_inv', ['등급? 몰라. 나는 레벨도 몰라. 재밌는 것만 알아.', '피로스 박사님 로켓은 128번 터졌어. 129번째는 안 터질 거래. 매번 그렇게 말해.', '천년제 날엔 우리 불꽃 천 발이 무지개 마을 하늘에서 터져! 16년 만에 모이지 않고 흩어지는 빛이야!']) },
      { id: 'kid2', x: 24, y: 12, dir: 'left', wander: 2, talk: W.chatter('c_kid', ['우리 마을엔 탑이 없어! 그래서 나는 레벨 35야! 다른 마을 애들은 9래!', '폭발은 실패가 아니야! 아직 성공 안 한 거야! …봄바 형이 그랬어.']) },
      { id: 'clerk_c', x: 8, y: 15, dir: 'down', talk: async (c) => { await c.say('clerk_c', ['나? 오늘 등급소 심사관이야. 어제는 빵집 주인이었고 내일은 모르겠어.', '등급 올리러 왔으면 등급소 가. 난 지금 퇴근 중이야.']); } },
    ],
    enter: async (c) => {
      if (c.flag('ch10')) return;
      c.set('ch10');
      c.set('color_intro');
      c.quest('m9', 'done');
      await c.chapter('10장', '불꽃놀이와 로켓', '밤이 끝나는 곳에 색이 터지고 있었다. 이 마을에는 탑이 없었다.');
      await c.say('dotori:happy', ['찍! 눈부셔! 여기저기서 폭죽이 터져!', '그리고… {n}, 봐! 광장에 탑이 없어! 대륙에서 유일하게 탑이 없는 마을이래!']);
      c.quest('m10', 1);
    },
  });
  W.town({ map: 'colorful', x: 18, y: 18, name: '알록달록 마을', color: '#ff9a5a', desc: '모든 색이 뒤섞인 곶. 탑이 없는 마을.', hint: '블랙 마을 남쪽 해안길 너머' });

  async function ppeongTalk(c) {
    const s = c.s;
    if (s.quests.q_powder === 0 && E.has(s, 'm15', 10)) {
      c.take('m15', 10);
      c.sfx('explode');
      c.shake(500, 5);
      c.flash('#ffd84a', 500);
      await c.say('ppeong:happy', ['쾅! 봤어? 마을 절반이 날아갔어!', '…앞머리 조금 탔어. 절반은 과장이야. 근데 기분은 절반 날아간 기분이야!']);
      c.gold(120000000000); c.give('f9', 3);
      c.quest('q_powder', 'done');
      return;
    }
    if (s.flags.color_intro && s.quests.q_powder == null) {
      await c.say('ppeong', ['안녕! 피로스 박사님 조수 봄바야! 나는 대륙에서 제일 큰 폭죽을 만들 거야! 하늘이 두 쪽 나는!', '…그러려면 [y]폭죽 화약[/]이 10개 필요해. 곶에 있는 폭죽 요정들이 떨어뜨려!']);
      c.quest('q_powder', 0);
    }
    await c.shop('colorful_food');
  }
  W.map('colorful_rank', {
    name: '알록달록 마을 등급소', region: 'colorful', area: 'colorful', theme: 'interior', bg: '#1a0a1e', ki: W.ki('colorful', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '+', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'f'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'b'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'colorful', 7, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 누군가 석상에 폭죽 모자를 씌워 놓았다.', '알록달록 사람들은 아우룸이 뭐였든 상관없다고 믿는다.'] }],
    npcs: [W.clerk('clerk', 5, 3, { hello: '어, 손님이네. 나 오늘 처음 심사해 봐. 도장 여기 찍는 거 맞지?', bye: '잘 가! 내일은 다른 사람이 앉아 있을 거야.' })],
  });
  W.map('colorful_inn', {
    name: '폭죽 여관', region: 'colorful', area: 'colorful', theme: 'interior', bg: '#1a0a1e', ki: W.ki('colorful', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '+', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'f'], [8, 6, 'f']] }),
    warps: [W.exit(5, 7, 'colorful', 7, 21)],
    npcs: [W.innkeeper('innkeeper', 4, 4, 0, '폭죽 여관이에요! 밤새 폭죽 소리가 나지만 금방 익숙해져요. 안 익숙해지면… 귀마개 드려요.')],
  });
  W.map('invent_shop', {
    name: '발명품 가게', region: 'colorful', area: 'colorful', theme: 'interior', bg: '#1a0a1e', ki: W.ki('colorful', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: 'm', door: 5, win: [2, 7], put: [[1, 2, 'u'], [2, 2, 'X'], [7, 2, 'X'], [8, 2, 'u'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'b'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'colorful', 30, 20)],
    npcs: [W.keeper('inventor', 'colorful', 4, 3, '발명품 가게야! 폭죽 장갑은 누를 때마다 작은 불꽃이 튀어. 화상 주의! 폭죽 망치는 때리면 터져. 적이. 아마도.')],
  });

  /* ── 로켓 격납고 ── */
  W.map('hangar', {
    name: '로켓 격납고', sub: '무한호', region: 'colorful', area: 'colorful', theme: 'space', bg: '#1c2230', ki: W.ki('colorful', 0.05), music: 'colorful', banner: false,
    grid: W.room({ w: 19, h: 14, floor: 'm', door: 9, win: [], put: [[1, 2, 'u'], [2, 2, 'u'], [16, 2, 'h'], [17, 2, 'h'], [1, 11, 'X'], [2, 11, 'b'], [16, 11, 'b'], [17, 11, 'X'], [3, 6, 'd'], [15, 6, 'd']] }),
    builds: [{ x: 7, y: 2, w: 5, h: 7, style: 'rocket', talk: rocketTalk, lit: (s) => PARTS.every((p) => E.has(s, p)) || !!s.flags.launched }],
    warps: [W.exit(9, 13, 'colorful', 28, 9)],
    objs: [W.bookObj('b_rocket_log', 16, 2), W.bookObj('b_pang_letter', 3, 6)],
    npcs: [{ id: 'pangpang', x: 13, y: 8, dir: 'left', mark: (s) => (s.quests.m10 === 1 || s.quests.m10 === 3 || (s.quests.m10 === 4 && s.lv >= 400000 && (s.ranks.r5 || 0) >= 1) ? '!' : null), talk: pangTalk }],
  });
  async function rocketTalk(c) {
    const s = c.s;
    const have = PARTS.filter((p) => E.has(s, p));
    await c.say(null, ['거대한 은빛 로켓 「무한호」. 몸통에 128개의 그을음 자국이 있다. 전부 조금씩 다른 모양이다.', '부품 칸: ' + PARTS.map((p) => (E.has(s, p) ? '●' : '○') + ' ' + D.ITEMS[p].name).join(' · ')]);
    if (have.length === PARTS.length && s.quests.m10 === 2) c.quest('m10', 3);
  }
  async function pangTalk(c) {
    const s = c.s;
    if (s.quests.m10 === 1) {
      c.sfx('explode');
      c.shake(400, 4);
      await c.say(null, '쾅! 격납고 구석에서 작은 폭발이 일어났다. 연기 속에서 머리가 부스스한 사람이 걸어 나왔다.');
      await c.say('pangpang:happy', ['콜록! 괜찮아, 괜찮아! 계획된 폭발이야! 129번째… 아니, 이건 커피 기계였어.', '어서 와! 피로스 박사야! 폭발 발명가지! 발명품의 97%가 폭발하고, 나머지 3%는 나중에 폭발해!']);
      await c.say('pangpang', ['…어? 그 눈.', '……세린?']);
      await c.say('@', '세린의 아이예요.');
      await c.say('pangpang:sad', ['……그렇구나. 16년.', '세린이 여기 왔었어. 982년 여름. 「박사님, 하늘에 가는 로켓을 만들어 주세요. 언젠가 제 아이가 탈 거예요.」']);
      await c.say('pangpang', ['약속했지. 세상에서 제일 안 폭발하는 로켓을 만들어 주겠다고. 그리고 128번 폭발했어. 하하.', '하지만 이번엔 달라! 무한호! 부품 다섯 개만 있으면 하늘 정거장까지 간다!']);
      await c.say('pangpang', ['엔진의 심장이 될 [y]톱니 심장[/] — 그레이의 볼트만 만들 수 있어.', '로켓 값을 댈 [y]금화왕의 채권[/] — 옐로의 골디 영감. 공짜로 줄 리 없지만.', '대기권을 뚫을 방어막, [y]기도의 수정[/] — 화이트의 루미에 성녀.', '정거장 문을 여는 [y]밤의 열쇠[/] — …어? 이미 가지고 있네!', '그리고 [y]별빛 연료[/]. 내가 20년 동안 모은 건데… 불꽃놀이 탑 꼭대기에 뒀어. 근데 거기 천발이가 버티고 있어.']);
      await c.say('pangpang', ['모아 와 줄래? 대륙을 한 바퀴 도는 여행이 될 거야.', '…혼자서는 하늘에 못 가. 그걸 아는 데 16년이 걸렸어.']);
      c.quest('m10', 2);
      return;
    }
    if (s.quests.m10 === 3 || (s.quests.m10 === 2 && PARTS.every((p) => E.has(s, p)))) {
      c.music('mother');
      await c.say('pangpang:happy', ['다섯 개 전부! 톱니 심장, 금화왕 채권, 기도의 수정, 밤의 열쇠, 별빛 연료!', '대륙이 다 같이 만든 로켓이야. 16년 만에… 드디어.']);
      await c.say('pangpang', ['조립은 나랑 봄바가 할게. 그리고 발사에는 조건이 하나 있어.', '대기권 너머 [y]하늘 정거장[/]은 [p]전설[/]이 아니면 버티지 못해. 우주의 기운이 너무 세거든. 레벨도 40만은 넘어야 하고.']);
      c.quest('m10', 4);
      return launchCheck(c);
    }
    if (s.quests.m10 === 4) return launchCheck(c);
    if (s.quests.m10 === 2) {
      const have = PARTS.filter((p) => E.has(s, p)).length;
      await c.say('pangpang', ['부품은 ' + have + '개 모였어! 다섯 개 다 모으면 불러 줘!', !E.has(s, 'gear_heart') ? '톱니 심장은 그레이의 볼트한테!' : !E.has(s, 'gold_bond') ? '금화왕 채권은 옐로 황금궁의 골디한테!' : !E.has(s, 'prayer_crystal') ? '기도의 수정은 화이트 대성당의 루미에한테!' : '별빛 연료는 불꽃놀이 탑 꼭대기에!']);
      return;
    }
    await c.run(W.chatter('pangpang', ['폭발은 실패가 아니야. 아직 성공하지 않은 것뿐이야!', '하늘 정거장에는 400년 전 은빛 왕국이 만든 인공지능이 있대. 성격이 까칠하대. 나랑 비슷하대.', '세린은 로켓에 이름을 붙여 줬어. 무한호. 「끝없이 가는 배」라고.']));
  }
  async function launchCheck(c) {
    const s = c.s;
    if (s.lv < 400000 || (s.ranks.r5 || 0) < 1) {
      await c.say('pangpang', ['지금은 레벨 ' + G.u.fmtInt(s.lv) + ', 전설 ' + (s.ranks.r5 || 0) + '차.', '레벨 40만, [p]전설 1차[/]가 되면 다시 와! 전설의 문은 보라 구슬 넷의 숫자를 더하면 열린다더라.']);
      return;
    }
    await launchScene(c);
  }
  async function launchScene(c) {
    const s = c.s;
    c.music('title');
    await c.say('pangpang', ['됐어! 준비 끝! …그런데 잠깐. 손님이 왔어.']);
    c.spawn({ id: 'gran', x: 9, y: 12, dir: 'up' });
    await c.npc('gran').walk('UUU');
    await c.emote('@', '!');
    await c.say('dotori:surprise', '할머니?!');
    await c.say('gran', ['…오랜만이네. 많이 컸다. 레벨이… 뭐꼬, 이게. 숫자가 안 읽히네.', '피로스가 편지 보냈더라. 「세린 아이가 하늘에 간다」 카길래, 지팡이 짚고 왔다.']);
    await c.say('@', '할머니… 다 알았어. 초록 창. 엄마. 카이론.');
    await c.say('gran:sad', ['……그래. 그렇겠지.', '니 엄마는 말이다. 늘 웃었다. 흰빛을 부끄러워하던 아가 커서, 그 빛을 온 동네에 나눠 주고 다녔다.']);
    await c.say('gran:sad', ['983년에 니를 안고 천년성을 나설 때, 나는 다짐했다. 니는 그냥 평범하게 키우겠다고. 그린 마을 촌구석에서 밭이나 매면서.', '…버튼을 장롱에 16년 넣어 둔 것도 그래서다. 누르지 않으면, 흰빛도 없을 끼라고.']);
    await c.say('gran', ['그런데 생일날 니가 버튼 누르는 거 보고 알았다. 빛은 숨기는 기 아이라는 거.', '니 엄마가 맞았다. 나눠야 되는 기다.']);
    const known = !!s.flags.kairon_father;
    const gq = await c.ask(null, [known ? '…왜 아빠 얘기는 안 해 줬어?' : '할머니. 카이론은… 나한테 어떤 사람이야?', '(묻지 않는다)']);
    if (gq === 0) {
      if (!known) {
        await c.say('gran:sad', ['……', '…니 아빠다.', '981년 봄, 우리 오두막 옆 참나무 아래서 둘이 혼례를 올렸다. 증인은 나랑 녹턴 둘뿐이었다. 세린이 S를 새기고, 그 고집불통이 K를 새겼다. 자로 잰 것맨치로.']);
        s.flags.kairon_father = true; s.flags.father_from = 'gran';
      }
      await c.say('gran:sad', ['말 못 했다. 니가 그 사람을 미워하게 될까 봐 무서웠고…', '…미워하지 않게 될까 봐 더 무서웠다. 미워하지 않으믄 니가 그 사람한테 가 버릴까 봐. 16년 키운 걸 하루 만에 뺏길까 봐.']);
      await c.say('gran', ['할매가 욕심쟁이다. 약초를 네 잎 따는 놈이 욕심쟁이라 캤는데, 할매가 네 잎을 땄다.', '…이제 돌려줄 때가 됐다. 니를. 니 아빠한테가 아이라, 니한테.']);
      c.set('gran_confessed');
      c.bond('gran', 2);
    }
    await c.say('gran', ['가거라. 카이론 그 고집불통한테 가서 전해라.', '「스승이 기다린다. 밥 먹으러 온나.」 …그거면 된다.']);
    await c.say('@', '…응. 다녀올게, 할머니.');
    await c.say('gran:happy', ['오냐. 오늘도 렙업.', '……내일도 렙업. 꼭 돌아와서 대답해래이.']);
    c.despawn('gran');
    c.spawn({ id: 'lea', x: 8, y: 12, dir: 'up' });
    c.spawn({ id: 'rud', x: 10, y: 12, dir: 'up' });
    await c.npc('lea').walk('UU');
    await c.npc('rud').walk('UU');
    await c.say('lea', s.flags.d_festival === 'warn' ? ['…늦지 않았군. 배웅하러 온 건 아니야. 할 일이 있어서 왔어.', '볼트한테 들었어. 역류 장치. 천년성 중앙 제어실에 끼우면 모든 탑이 뒤집힌다고. 폭약 없이. 네 방식이네.'] : ['늦지 않았군. 새벽단도 배웅하러 왔어.', '볼트한테 들었어. 역류 장치. 천년성 중앙 제어실에 끼우면 모든 탑이 뒤집힌다고.']);
    await c.say('@', '…이건 레아랑 루드한테 맡길게. 나는 하늘에 있을 거니까.');
    c.take('reverser');
    await c.say('rud', ['…맡아 두지. 천년제 날 밤, 천년성 중앙 제어실.', '타이밍은 하늘 정거장 인공지능이 알려 준다고 했지? 숫자는 거짓말 안 해. 1초도 안 틀린다.']);
    await c.say('lea', '살아서 와. 탑을 다 뒤집은 다음에, 다 같이 무지개 마을에서 불꽃 보자.');
    c.despawn('lea'); c.despawn('rud');
    c.set('reverser_given');
    await c.say('pangpang', ['자, 탑승! 발사는 네 손으로 해! 엔진 점화는 흰빛으로 해야 하거든!', '[y]렙업 버튼을 힘껏 연타[/]! 10초 동안 150번이면 대기권 돌파!']);
    let n = 0;
    for (;;) {
      n = await c.clickRace(10);
      if (n >= 150) break;
      await c.say('pangpang', [n + '번… 엔진이 콜록거려! 조금만 더! 폭발은 실패가 아니야!', '다시!']);
    }
    c.sfx('explode');
    c.shake(1500, 6);
    c.flash('#ffffff', 1500);
    await c.fadeOut(900, true);
    c.set('launched');
    await c.narr(['쿠구구구구—.', '무한호가 알록달록 곶을 떠났다. 마을 사람들이 불꽃 천 발을 쏘아 올렸다. 흩어지는 빛이 로켓을 배웅했다.', '구름을 뚫고, 무지개를 지나, 하늘이 파랗다가, 남색이 되었다가— 검어졌다.', '별이 가까웠다. 그리고 저 앞에, 400년 동안 혼자였던 은빛 정거장이 떠 있었다.']);
    c.quest('m10', 'done');
    await c.warp('station', 16, 26, 'up', { instant: true });
    await c.fadeIn(900);
    void s;
  }

  /* ── 동료들의 선물: 앞 장의 인물들에게 새 대사를 더한다 ── */
  function wrapTalk(mapId, npcId, cond, fn, markCond) {
    const m = G.maps[mapId];
    if (!m) return;
    const n = (m.npcs || []).find((x) => x.id === npcId);
    if (!n) return;
    const orig = n.talk;
    n.talk = async (c, nn) => { if (cond(c.s)) return fn(c); return orig(c, nn); };
    const om = n.mark;
    n.mark = (s) => (cond(s) && (!markCond || markCond(s)) ? '!' : om ? om(s) : null);
  }
  wrapTalk('workshop', 'bolt', (s) => s.quests.m10 === 2 && !E.has(s, 'gear_heart'), async (c) => {
    await c.say('bolt', ['…피로스의 로켓인가. 쓸데없는 말은 연료 낭비다.', c.s.flags.d_bolt === 'talk' ? '톱니 심장. 역류 장치 만들고 남은 부품으로 만들었다. …요즘은 밤에 잔다. 그 목소리가 자라고 했으니까.' : '톱니 심장. MK-7의 심장을 뜯어서 다시 깎았다. 네가 쓰러뜨린 기계의 심장이다. 이제 날게 해 주지.']);
    await c.say('bolt', '이 심장은 멈추지 않는다. 내 아내 심장은 멈췄지만.');
    c.give('gear_heart');
    await c.say('bolt', '…하늘 정거장의 인공지능한테 전해라. 612년의 경고, 늦게라도 읽었다고.');
  });
  wrapTalk('palace', 'goldie', (s) => s.quests.m10 === 2 && !E.has(s, 'gold_bond') && !!s.flags.m_yellow_bond, async (c) => {
    await c.say('goldie', ['로켓 값? 하하. 그 폭발 발명가한테 대라고?', '…공짜는 없어, 꼬마. 세상은 원래 그래.']);
    const dg = c.s.flags.d_goldie;
    if (dg === 'expose') await c.say('goldie', ['장부를 뿌린 녀석한테 채권을 달라고? 뻔뻔하군.', '…그 애들 중 몇은 굶었고, 몇은 사하라 대상단에서 셈을 배운다. 계산해 보니 반반이다. 반반이면… 줄 만하지.']);
    else if (dg === 'contract') await c.say('goldie', '계약서 증인이 로켓을 탄다라. 증인이 하늘에서 떨어지면 계약이 무효가 되니까, 투자하는 거다. 순전히 장사야.');
    if (c.s.flags.d_kkachi === 'report') await c.say('kkachi', '(골디 옆에서 장부를 들고 있던 피카가 채권을 건넨다) …금화왕이 직접 주기 싫대. 멋없대. 그래서 내가 줘. …가, 흰빛.');
    await c.say('goldie', ['그러니까 이건 공짜가 아니야. [y]백지 채권[/]이다. 액수는 네가 적어. 갚는 건… 세린이 돌아오면 그 여자가 갚게 해.', '979년에 빌린 동전, 이자까지 쳐서 이걸로 퉁 치자고. …장사 참 못 하네, 나.']);
    c.give('gold_bond');
    c.set('m_yellow_bond');
  });
  wrapTalk('cathedral', 'lumie', (s) => s.quests.m10 === 2 && !E.has(s, 'prayer_crystal') && !!s.flags.m_white_lumie, async (c) => {
    const dp = c.s.flags.d_patient;
    if (dp === 'lumie') await c.say('lumie', ['(루미에는 의자에 기대 앉아 있다. 머리칼이 눈처럼 하얗다) …일어나지 못해서 미안해요. 하얀이는 매일 와요. 사탕을 가져와요. 제가 주던 걸 이제 저한테.', '…당신이 맡겨 줘서 기뻤다고 했죠. 거짓말은 아니었어요. 그런데 에이린이 얼굴을 볼 때마다, 당신이 거절해 줬으면 어땠을까 생각해요.']);
    else if (dp === 'herb') await c.say('lumie', '에이린이가 매일 얼음 신전에 가요. 그 틈에 약초를 다시 심겠대요. 세린처럼. 다음 사람을 위해.');
    else if (dp === 'own') await c.say('lumie', '앞머리, 아직 하얗네요. …그건 제가 16년 동안 달고 다닌 거랑 같은 색이에요. 이제 우리 둘이 나눠 가졌네요.');
    await c.say('lumie', ['로켓의 방어막이 필요하군요. 기도의 수정… 16년 동안 세린을 위해 기도한 빛을 모은 수정이에요.', '가두는 데 쓰던 기도를, 이제 지키는 데 쓸게요. 약속했잖아요.']);
    c.give('prayer_crystal');
    await c.say('lumie', '세린을 만나면… 미안하다고 전해 줘요. 아니, 고맙다고. …둘 다요.');
  });

  /* ───────── 알록달록 곶 · 불꽃놀이 탑 ───────── */
  W.map('cape', {
    name: '알록달록 곶', sub: '불꽃놀이 탑 가는 길', region: 'colorful', area: 'cape', theme: 'colorful', bg: '#3a2a4a', ki: W.ki('colorful', 0.45), music: 'field', weather: 'spark',
    grid: W.gen({
      w: 40, h: 30, seed: 'colorful-point', ground: '.', alt: [['"', 0.56, 3], [',', 0.7, 4]],
      obst: [['f', 3], ['T', 2], ['^', 1]], dense: 0.6, sparse: 0.04, scale: 5,
      border: (x, y) => (x >= 37 ? '~' : 'T'), bt: 2, rough: 0.5,
      paths: [[[0, 15], [10, 15], [18, 10], [28, 10], [30, 5]], [[18, 10], [18, 22], [28, 24]]],
      clear: [[26, 2, 8, 5], [24, 21, 8, 6]],
    }),
    builds: [{ x: 29, y: 1, w: 3, h: 4, style: 'lighthouse', lit: () => true, talk: fwTowerDoor }],
    edges: { left: { to: 'colorful', tx: 37, ty: 14 } },
    objs: [W.sign(3, 14, ['알록달록 곶', '→ 불꽃놀이 탑 (천발이 주의)']), W.spot(28, 24, 3), W.spot(4, 26, 10, true), W.chest('cp1', 25, 22, 'p9', 5), W.goldChest('cp2', 33, 25, 150000000000),
      { t: 'sign', x: 20, y: 22, text: '불꽃놀이 리허설장', talk: rehearsal }],
    mons: { list: ['firefairy', 'balloonbear', 'toysoldier', 'firebird', 'firefairy'], n: 12, area: [2, 2, 34, 26] },
  });
  async function rehearsal(c) {
    const s = c.s;
    if (s.quests.q_rehearsal === 'done') { await c.say(null, '리허설장. 바닥에 폭죽 그을음이 별자리처럼 찍혀 있다.'); return; }
    await c.say('inventor', ['천년제 불꽃놀이 리허설 중이야! 흰빛으로 점화하면 더 멀리 날아간대!', '10초 동안 [y]130발[/]! 도와줄래?']);
    if (s.quests.q_rehearsal == null) c.quest('q_rehearsal', 0);
    if (!(await c.yes(null, 'inventor', '점화!', '나중에'))) return;
    const n = await c.clickRace(10);
    c.sfx('firework');
    if (n >= 130) { c.flash('#ffd84a', 800); await c.say('inventor', [n + '발! 하늘이 대낮 같아!', '블랙 마을 사람들이 해 뜬 줄 알겠다!']); c.gold(250000000000); c.give('f9', 5); c.quest('q_rehearsal', 'done'); }
    else await c.say('inventor', n + '발… 조금 모자라! 다시 해 보자!');
  }
  async function fwTowerDoor(c) { await c.warp('fw_tower', 14, 26, 'up'); }
  W.map('fw_tower', {
    name: '불꽃놀이 탑', sub: '천발이의 둥지', region: 'colorful', area: 'fw_tower', theme: 'colorful', bg: '#1a0a1e', ki: W.ki('colorful', 0.85), music: 'cave', dark: 90, battleBg: 'colorful', weather: 'spark',
    grid: W.gen({
      w: 28, h: 28, seed: 'firework-tower', ground: ':', alt: [],
      obst: [['#', 4], ['b', 2], ['X', 1]], dense: 0.52, sparse: 0.05, scale: 3,
      border: '#', bt: 1, rough: 0.7,
      paths: [[[14, 27], [14, 20], [6, 16], [6, 8], [14, 4], [22, 8], [22, 16], [14, 20]]], path: '=',
      clear: [[9, 1, 10, 5]],
    }),
    warps: [{ x: 14, y: 27, to: 'cape', tx: 30, ty: 5, dir: 'down' }],
    objs: [W.bookObj('b_thousand', 10, 2), W.spot(6, 12, 3), W.spot(22, 12, 3), W.spot(3, 24, 10, true), W.chest('ft1', 12, 2, 'p9', 5),
      { t: 'orbshine', orb: 'o_p3', x: 17, y: 2, need: (s) => !!s.flags.beat_megafirework, hint: '탑 꼭대기 받침대에 보라 구슬이 놓여 있다. 거대한 폭죽이 그 앞을 막고 있다.' },
      { t: 'pickup', id: 'fuel', x: 18, y: 2, item: 'rocket_fuel', c: '#6ae8ff', cond: (s) => (!!s.flags.beat_megafirework && s.quests.m10 != null) || s.chests.fuel, text: '반짝이는 연료통이다. 「별빛 연료 — 20년 치. 피로스」' }],
    mons: { list: ['firefairy', 'balloonbear', 'toysoldier', 'firebird'], n: 11, area: [1, 6, 26, 20] },
    fixed: [{ mon: 'megafirework', x: 14, y: 3, flag: 'beat_megafirework', boss: true, look: { creature: 'orb', tint: '#ff3a6a' }, talk: megaTalk }],
  });
  async function megaTalk(c, mo) {
    await c.say(null, '탑 꼭대기에 사람 키의 다섯 배는 되는 거대한 폭죽이 서 있다. 심지에서 불똥이 투덜투덜 튄다.');
    await c.say('dotori:worry', ['저게 천발이야. 천 발을 한 번에 쏘도록 만들었는데 한 번도 못 쐈대.', '쏠 날을 기다리다 성격이 나빠졌대…']);
    const win = await c.battle('megafirework', { noFlee: true });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_megafirework');
    c.sfx('firework');
    c.flash('#ffd84a', 800);
    await c.say(null, ['천발이가 마지막으로 불꽃 한 발을 쏘아 올렸다. 탑 위 하늘에 커다란 꽃이 피었다.', '처음이자 마지막 한 발. 천발이는 만족한 듯 조용해졌다.']);
    await c.say('dotori', '…천 발은 못 쐈지만, 한 발은 쐈네. 찍.');
  }

  /* ───────── 알록달록의 결: 소품 · 혼잣말 · 곁의 이야기 · 떠나기 전날 밤 ───────── */
  W.addObjs('colorful', [
    W.prop('bench', 10, 24, '바닷가 벤치. 등받이에 폭죽 그을음이 별 모양으로 찍혀 있다.'),
    W.prop('fire', 24, 23, '폭죽 불씨로 피운 모닥불. 불꽃이 가끔 초록, 가끔 보라로 튄다. 아무도 이유를 모른다.'),
    W.prop('board', 13, 12, (s) => ['마을 게시판. 「무한호 발사 D-?? — 폭발 확률: 박사님 말로는 3%, 봄바 말로는 97%」', s.flags.launched ? '그 아래 큼직하게: 「129번째는 안 터졌다!!!」' : '「로켓 부품 제보 받음: 톱니 심장 · 금화왕 채권 · 기도의 수정 · 밤의 열쇠 · 별빛 연료」']),
    W.prop('statue', 22, 16, '폭발 기념비. 128개의 작은 금속 조각이 탑처럼 쌓여 있다. 무한호 1호기부터 128호기까지의 파편. 「모두 성공 직전이었다」', { c: '#ff9a5a' }),
  ]);
  W.barks('colorful', { ppeong: ['쾅!', '하늘이 두 쪽!'], inventor: ['재밌는 것만 알아!'], kid2: ['나 레벨 35!', '폭발은 실패가 아니야!'], clerk_c: ['퇴근 중~'] });
  W.barks('hangar', { pangpang: (s) => (s.flags.launched ? ['안 터졌다!'] : ['129번째는 안 터져!', '콜록!']) });

  /* 토리아와의 이야기 (10장) */
  G.story.talks.push(
    { id: 'cf_notower', map: 'colorful', run: async (c) => {
      await c.say('dotori', ['여기 애들은 레벨 35래. 다른 마을 애들은 9인데.', '탑 하나 없는 게 이렇게 달라. …우리가 16년 동안 뭘 잃었는지 여기 와서 알았어.']);
    } },
    { id: 'cf_parts', when: (s) => PARTS.filter((p) => E.has(s, p)).length >= 3, run: async (c) => {
      await c.say('dotori', ['볼트 아저씨 심장, 골디 아저씨 채권, 루미에 언니 수정, 녹턴 아저씨 열쇠.', '엄마 친구들이 하나씩 내놨어. 16년 동안 서로 말도 안 하던 사람들이.']);
      await c.say('dotori:happy', '피로스 박사님이 그랬잖아. 혼자서는 하늘에 못 간다고. 이 로켓이 그 증거야. 찍.');
    } },
  );
  /* 쉬는 밤 (10장): 떠나기 전날 */
  G.story.nights.push(
    { id: 'cf_after', when: (s) => s.quests.m10 === 4 || (s.quests.m10 === 2 && PARTS.every((p) => E.has(s, p))), intro: '폭죽 여관. 밤새 폭죽이 터진다. 토리아가 창틀에 앉아 불꽃을 세고 있다. 백열둘, 백열셋…', run: async (c) => {
      await c.say('dotori', ['…{n}. 다 끝나면 뭐 할 거야?', '하늘 갔다 오고, 흑점이든 뭐든 다 끝나면.']);
      const k = await c.ask(null, ['그린 마을로 돌아가서 약초 캘래.', '대륙을 한 바퀴 더 돌 거야. 이번엔 천천히.', '…끝난 다음은 생각 안 해 봤어.']);
      c.set('after_plan', ['home', 'road', 'none'][k]);
      if (k === 0) await c.say('dotori:happy', ['…좋다. 할머니가 세 잎만 따라고 잔소리하겠지.', '나는 네 옆에서 도토리 굴릴게. 백 개. …아흔 개.']);
      else if (k === 1) await c.say('dotori:happy', ['천천히! 레드 떡볶이 다시 먹고, 블루 도서관에서 헤미아 언니 수수께끼 풀고, 옐로에서 피카 만나고…', '…이번엔 세금 안 떼이고 렙업하는 애들 얼굴 보러 가자.']);
      else await c.say('dotori', ['……', '…그럼 내가 생각해 둘게. 너는 돌아오는 것만 생각해. 약속.']);
      c.bond('dotori', 1);
    } },
  );

  G.world.nodes.push({ region: 'colorful', label: '알록달록', x: 52, y: 46, color: '#ff9a5a', maps: ['colorful', 'cape', 'fw_tower', 'hangar', 'colorful_rank', 'colorful_inn', 'invent_shop'] });
})();
