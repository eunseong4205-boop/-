/* 3장 「파도와 지혜」 — 해안길 · 블루 마을 · 대도서관 · 등대 · 파도 해변 · 해저 동굴 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data;

  W.keyItem('compass', '고선장의 나침반', '크라켄이 삼켰던 놋쇠 나침반. 바늘이 늘 황금별 쪽을 가리킨다.');
  W.keyItem('overdue', '연체된 책', '「등대지기의 노래」. 반납일이 3년 지났다.');
  D.ITEMS.fish_gold.price = 50000;
  D.SHOPS.fish = { name: '블루 어시장', keeper: 'merchant', items: ['fish_gold', 'f2', 'p2'] };

  W.quest('m3', { main: true, name: '3장 · 파도와 지혜', where: '블루 마을', stages: [
    '블루 대도서관에서 어머니가 쓴 책 「무한의 그릇에 관하여」를 찾자.',
    '사서 [y]해미[/]의 수수께끼를 풀어 잠긴 서고를 열자. 도서관 곳곳의 책에 답이 있다.',
    '잠긴 서고에서 어머니의 책을 읽자.',
    '옐로 마을로 가는 배를 알아보자. 부두의 [y]고선장[/]을 찾자.',
    '마을 북쪽 파도 해변 너머 [y]해저 동굴[/]의 새끼 크라켄에게서 나침반을 되찾자.',
    '고선장에게 나침반을 돌려주자.',
    '[y]레벨 600[/]이 되면 부두에서 고등어호를 타고 옐로 마을로 가자.',
  ], done: '고등어호는 모래바람의 도시를 향해 떠났다.' });
  W.quest('q_light', { name: '꺼진 등대', where: '블루 등대', stages: ['등대 꼭대기의 등불에 흰빛을 나눠 주자. 등불 앞에서 [y]렙업 버튼을 30번[/] 누르자.'], done: '3년 만에 블루 등대에 불이 켜졌다.' });
  W.quest('q_overdue', { name: '3년 연체', where: '대도서관', stages: ['빛나에게서 연체된 책 「등대지기의 노래」를 받아 오자.', '해미에게 책을 돌려주자.'], done: '해미는 연체료를 받지 않았다. 대신 책 이야기를 한 시간 했다.' });
  W.quest('q_feather', { name: '짠물 영감의 허풍', where: '블루 부두', stages: ['몬스터에게서 [y]갈매기 깃털[/] 5개를 모아 짠물 영감에게 가져가자.'], done: '영감은 고래를 네 번 삼킨 이야기를 해 주었다. 세 번에서 한 번 늘었다.' });
  W.quest('q_fish', { name: '고등어 포장 대작전', where: '블루 어시장', stages: ['어시장의 루드를 도와 10초 동안 고등어를 [y]60마리[/] 포장하자. (렙업 버튼 연타)'], done: '루드는 숫자를 세다가 처음으로 웃었다.' });

  /* ───────── 책 ───────── */
  W.book('b_chron2', { title: '이리스 연대기 2권 — 구슬과 인장', where: '블루 대도서관', text:
    '색 전쟁이 끝난 뒤, 아우룸은 다섯 등급을 세우고 각 등급에 [y]인장[/]을 두었다. 인장이 있어야 다음 등급으로 오를 수 있었다.\n\n' +
    '그러나 인장을 지닌 자가 곧 권력이 되었다. 인장을 두고 또다시 싸움이 일어나려 하자, 아우룸은 인장을 부수었다.\n\n' +
    '그는 인장을 [y]색 구슬[/]로 쪼개 대륙 곳곳에 숨겼다. 빨강 넷, 파랑 넷, 노랑 넷, 보라 넷. 그리고 구슬마다 숫자를 새겼다.\n\n' +
    '「같은 색 구슬 넷을 모두 찾은 자만이 그 숫자를 더해 문을 열 수 있다. 권력은 앉아서 물려받는 것이 아니라 걸어서 얻는 것이다.」\n\n' +
    '원년 100년, 아우룸은 하늘로 올라갔다. 사람들은 그가 황금별 아스트라가 되었다고 믿었다.\n\n— 3권 「은빛 왕국」에 이어진다.' });
  W.book('b_chron3', { title: '이리스 연대기 3권 — 은빛 왕국', where: '블루 대도서관', text:
    '200년부터 600년까지를 사람들은 [y]황금기[/]라 부른다. 대륙 서쪽에는 [y]은빛 왕국[/]이 있었다. 그들은 빛으로 움직이는 기계를 만들었다.\n\n' +
    '은빛 왕국의 기술자들은 땅속 깊은 곳에 모든 빛이 모이는 [y]대광맥[/]이 있다는 것을 알아냈다. 그들은 그 빛을 직접 파내기 시작했다.\n\n' +
    '612년. 대광맥에서 빛을 한꺼번에 끌어올리던 날, 은빛 왕국의 땅에서 색이 빠졌다. 이것을 [r]탈색[/]이라 한다.\n\n' +
    '나라는 사흘 만에 무너졌다. 이 사흘을 [r]잿빛의 사흘[/]이라 부른다. 같은 해, 하늘에 처음으로 [r]흑점[/]이 나타났다.\n\n' +
    '2대 전설 [y]벨라[/]가 황금별 아스트라로 올라가 흑점과 싸웠다. 흑점은 물러갔다. 벨라는 돌아오지 않았다.\n\n' +
    '(먹물 자국) 은빛 왕국이 무너진 이유는 욕심이었을까, 아니면 빛을 한곳에 모은 것 자체였을까. — 관장의 주석' });
  W.book('b_chron4', { title: '이리스 연대기 4권 — 챔피언들의 시대', where: '블루 대도서관', text:
    '아우룸 이후 챔피언의 자리는 가장 강한 자에게 이어졌다. 챔피언은 천년성에 머물며 대륙을 지킨다.\n\n' +
    '역대 챔피언 가운데 이름난 이: 1대 아우룸(흰빛), 2대 전설 벨라(흰빛, 챔피언은 아니었으나 그 이상의 존경을 받음), 31대 강철 이반, 58대 웃음의 필로…\n\n' +
    '975년, 열아홉 살의 [y]카이론[/]이 역대 최연소로 챔피언이 되었다. 그의 곁에는 여섯 동료가 있었다.\n초록의 오방순, 노랑의 골디, 하양의 루미에, 회색의 볼트, 검정의 녹턴, 그리고 이름이 지워진 한 사람.\n\n' +
    '(이 부분만 누군가 칼로 긁어낸 흔적이 있다)' });
  W.book('b_vessel', { title: '그릇에 관한 속설', where: '블루 대도서관', text:
    '사람마다 경험을 담을 수 있는 [y]그릇[/]의 크기가 다르다고 한다. 대부분은 레벨 수천에서 성장이 느려지고, 수만에 이르면 영웅이라 불린다.\n\n' +
    '그러나 전설에 따르면 그릇의 끝이 없는 사람이 있다. 이를 [w]무한의 그릇[/]이라 한다. 그들은 렙업할 때 흰빛을 낸다고 한다.\n\n' +
    '흰빛은 모든 색이 합쳐진 빛이다. 그래서 흰빛의 사람은 어느 땅에서든 기운을 받아들인다. 그린에서도, 레드에서도, 저 하늘 위에서도.\n\n' +
    '속설에 따르면, 흰빛은 [y]나눌 수도 있다[/]고 한다. 그러나 이것을 확인한 기록은 983년 이후 모두 금서가 되었다.' });
  W.book('b_fading', { title: '빛바램병 연구 노트', where: '블루 대도서관', author: '대도서관 의학 서가', text:
    '983년 이후 새로 보고된 병. 머리칼, 눈동자, 피부 순서로 색이 빠진다. 빛이 모자란 사람에게서 나타난다.\n\n' +
    '환자의 대부분은 평민 등급. 경험세율이 가장 높은 등급이다. 우연일까?\n\n' +
    '치료법: 없음. 증상 완화: 불꽃 약초 달인 물, 햇볕, 웃음.\n\n' +
    '(여백) 빛을 나눠 줄 수 있는 사람이 있다면 고칠 수 있을지도. — 세린' });
  W.book('b_notes8', { title: '먹물 관장의 주석 모음', where: '블루 대도서관', author: '먹물', text:
    '주석 1. 문어는 다리가 여덟이라 책을 여덟 권 동시에 읽는다. 그래서 이야기가 자주 섞인다. 양해 바란다.\n\n' +
    '주석 17. 놀라면 먹물이 나온다. 연대기 3권 612년 항목의 먹물 자국은 주석이 아니라 사고다.\n\n' +
    '주석 88. 983년 새싹의 달, 천년성에서 「흰빛 관련 서적 전부 봉인」 명령이 왔다. 나는 봉인했다. 불태우라는 말은 없었으니까.\n\n' +
    '주석 89. 세린, 네 책은 서고 가장 안쪽에 있다. 네 아이가 오면 줄게. 약속한다.' });
  W.book('b_riddles', { title: '해미의 수수께끼 공책', where: '블루 대도서관', author: '해미', text:
    '서고 문 수수께끼 (초안)\n\n1. 아우룸이 색 전쟁을 끝낸 해는? — 연대기 1권\n2. 천 년 동안 흰빛으로 렙업한 사람의 수는? — 서당 훈장님 말씀, 관측소 기록\n3. 등급의 문을 여는 비밀번호는 무엇을 더한 값? — 연대기 2권\n\n' +
    '(아래) 너무 쉬운가? 아니야. 요즘 사람들은 책을 안 읽으니까 이 정도면 어려울 거야. …그렇겠지?' });
  W.book('b_lighthouse_song', { title: '등대지기의 노래', where: '블루 등대', text:
    '어두운 바다에 불 하나\n배는 불을 보고 돌아온다\n불은 배를 기다리지 않는다\n그냥 켜져 있을 뿐이다\n\n그래서 배는 돌아온다\n그래서 불은 꺼지면 안 된다\n\n(책갈피에 아이 글씨) 아빠가 돌아올 때까지 불을 끄지 않을 거야. — 빛나, 12살' });
  W.book('b_logbook', { title: '등대지기의 항해일지', where: '블루 등대', author: '빛나의 아버지', text:
    '996년 가을. 밤바다에 검은 별이 떨어지는 것을 봤다. 별이 떨어진 자리의 물고기들이 색을 잃었다.\n\n' +
    '996년 겨울. 떨어진 것은 별이 아니다. 조각이다. 하늘의 검은 점에서 떨어져 나온 조각.\n\n' +
    '997년 봄. 조각이 떨어지는 날이 늘었다. 바다가 조금씩 잿빛이 된다. 아무도 믿지 않는다.\n\n' +
    '997년 여름. 조각이 떨어진 곳을 따라가 보려 한다. 빛나에게는 금방 돌아온다고 했다. 불을 부탁한다고 했다.\n\n' +
    '(마지막 장, 흔들리는 글씨) 조각은 빛을 향해 간다. 빛이 가장 많이 모인 곳으로. 천년성? 아니, 그보다 높은 곳…' });
  W.book('b_serin', { title: '무한의 그릇에 관하여', where: '블루 대도서관 잠긴 서고', author: '세린, 라벤더 학원 연구생', text:
    '[y]들어가며[/]\n나는 렙업할 때 흰빛을 낸다. 어릴 때는 그게 부끄러웠다. 친구들은 모두 초록이었으니까.\n\n' +
    '[y]1. 흰빛은 모든 색의 합이다[/]\n흰빛의 사람은 어느 땅의 기운이든 받아들인다. 그래서 그릇에 끝이 없다. 끝이 없다는 건 외로운 일이다. 아무리 담아도 가득 차지 않으니까.\n\n' +
    '[y]2. 흰빛은 나눌 수 있다[/]\n나는 실험했다. 빛바램병에 걸린 아이의 손을 잡고 렙업했다. 아이의 머리칼에 색이 돌아왔다. 분홍색이었다.\n흰빛은 가두면 넘치고, 나누면 채워진다.\n\n' +
    '[y]3. 빛을 한곳에 모으면 안 된다[/]\n은빛 왕국은 빛을 한곳에 모았고, 흑점이 왔다. 나는 이것이 우연이 아니라고 생각한다. 아직 증명하지 못했다.\n\n' +
    '[y]맺으며[/]\n성장은 나누는 거야.\n\n' +
    '[p]― 마지막 장에 끼워진 편지 ―[/]\n\n' +
    '우리 아기에게.\n이 책을 읽고 있다면, 너도 버튼을 눌렀겠구나. 하얗게 빛났겠지. 놀랐지? 엄마도 처음엔 놀랐어.\n\n' +
    '엄마는 흑점이라는 것을 멈추러 가. 친구들이 같이 가 줘. 돌아오지 못할지도 몰라. 미안해. 네가 걸음마 하는 걸 보고 싶었는데.\n\n' +
    '그래도 괜찮아. 너는 혼자가 아니야. 할머니가 있고, 도토리가 있고, 앞으로 만날 많은 사람이 있어.\n\n' +
    '네 빛은 너만의 것이 아니야. 나눠 줘. 그러면 너는 절대 비지 않아.\n\n' +
    '오늘도 렙업. 내일도 렙업.\n— 엄마가, 983년 새싹의 달' });
  W.book('b_decree983', { title: '983년 금서 목록', where: '블루 대도서관 잠긴 서고', author: '천년성 문서청', text:
    '아래 서적은 천년 방위령에 따라 봉인한다.\n\n1. 「무한의 그릇에 관하여」 — 세린\n2. 「흰빛 나눔 실험 기록」 — 세린, 베라 공저\n3. 「벨라 전」 — 작자 미상\n4. 「빛의 쏠림과 흑점의 상관관계」 — 스텔라(?) 인공지능 보고서 사본\n\n' +
    '봉인 사유: 백성의 불안을 막기 위함.\n\n(먹물로 덧씀) 백성의 불안이 아니라 누군가의 불안이겠지.' });

  /* ───────── 해안길 ───────── */
  W.map('coast', {
    name: '해안길', sub: '레드와 블루 사이', region: 'blue', area: 'coast', theme: 'blue', bg: '#1a3a5a', ki: W.ki('blue', 0.1), music: 'field', weather: 'bubble',
    grid: W.gen({
      w: 46, h: 17, seed: 'coast-road', ground: '.', alt: [['s', 0.55, 4], [',', 0.72, 3]],
      obst: [['^', 3], ['T', 2], ['t', 1]], dense: 0.66, sparse: 0.03, scale: 5,
      border: (x, y) => (y >= 14 ? '~' : '#'), bt: 2, rough: 0.4,
      paths: [[[3, 0], [3, 7], [14, 8], [24, 6], [34, 9], [45, 8]], [[24, 6], [24, 11]]],
      clear: [[2, 12, 42, 2, 's'], [21, 10, 6, 3, 's']],
      stamps: [{ x: 22, y: 11, rows: ['bXb'] }],
    }),
    edges: { up: { to: 'red', tx: 18, ty: 29 }, right: { to: 'blue', tx: 0, ty: 14 } },
    objs: [
      W.sign(5, 2, ['해안길 — 블루 지방', '→ 블루 마을 (항구)   ↑ 레드 마을']),
      W.sign(25, 11, ['부서진 배의 잔해. 뱃머리에 「고등어 2호」라고 적혀 있다.', '…1호는 어디 갔을까.']),
      W.spot(24, 12, 3), W.spot(42, 12, 10, true), W.chest('co1', 20, 11, 'p2', 3), W.goldChest('co2', 38, 12, 12000),
    ],
    mons: { list: ['sandcrab', 'gull', 'jelly', 'sandcrab'], n: 8, area: [2, 2, 42, 12] },
    enter: async (c) => {
      if (c.flag('ch3')) return;
      c.set('ch3');
      c.quest('m2', 'done');
      await c.chapter('3장', '파도와 지혜', '처음 보는 바다. 짠 바람에 책장 넘기는 소리가 섞여 있었다.');
      await c.say('dotori:surprise', ['찍! 바다다! 물이 끝이 없어! 전부 짜대!', '저 앞이 블루 마을이야. 대도서관이 있는 곳! 박사님이 말한 책이 거기 있어.']);
      c.quest('m3', 0);
    },
  });

  /* ───────── 블루 마을 ───────── */
  W.map('blue', {
    name: '블루 마을', sub: '파도와 지혜의 항구', region: 'blue', area: 'blue', theme: 'blue', bg: '#1a3a5a', ki: W.ki('blue', 0.04), town: true,
    grid: W.gen({
      w: 38, h: 30, seed: 'blue-port', ground: '.', alt: [[',', 0.74, 4], ['"', 0.82, 3]],
      obst: [['T', 2], ['t', 2]], dense: 0.84, sparse: 0.012, scale: 5,
      border: (x, y) => (y >= 28 ? '~' : '#'), bt: 2, rough: 0.3,
      paths: [
        [[0, 14], [16, 14]], [[16, 14], [22, 14]], [[19, 9], [19, 11]], [[7, 9], [7, 13], [16, 13]], [[29, 9], [29, 13], [22, 13]],
        [[7, 20], [7, 16], [16, 16]], [[19, 17], [19, 23]], [[22, 14], [34, 14], [34, 20]], [[29, 9], [30, 4], [30, 0]], [[19, 23], [22, 23]],
      ],
      path: '=',
      clear: [[16, 11, 7, 6, '='], [14, 3, 10, 6], [4, 5, 6, 5], [27, 5, 6, 5], [4, 16, 6, 5], [33, 12, 3, 8], [2, 23, 34, 1, 's'], [2, 24, 34, 4, '~'], [22, 24, 2, 4, '_'], [13, 18, 10, 5]],
      stamps: [{ x: 15, y: 11, rows: ['l'] }, { x: 23, y: 16, rows: ['l'] }, { x: 12, y: 13, rows: ['l'] }, { x: 26, y: 13, rows: ['l'] }, { x: 17, y: 22, rows: ['b'] }, { x: 21, y: 22, rows: ['b'] }],
    }),
    builds: [
      { x: 14, y: 3, w: 10, h: 6, door: 5, style: 'dome', roof: '#3a5a9a', wall: 'stone', icon: 'book', signColor: '#c8e0ff', to: 'library', tx: 12, ty: 14 },
      { x: 4, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'stone', icon: 'star', signColor: '#c8d0ff', to: 'blue_rank', tx: 5, ty: 6 },
      { x: 27, y: 5, w: 6, h: 4, door: 2, roof: '#3a8ac8', wall: 'wood', icon: 'coin', to: 'blue_shop', tx: 5, ty: 6 },
      { x: 4, y: 16, w: 6, h: 4, door: 3, roof: '#e8e0c8', wall: 'wood', icon: 'bed', to: 'blue_inn', tx: 5, ty: 6 },
      { x: 14, y: 19, w: 3, h: 3, style: 'tent', roof: '#3a78c8' },
      { x: 20, y: 19, w: 3, h: 3, style: 'tent', roof: '#e84a4a' },
      { x: 33, y: 13, w: 3, h: 7, door: 1, style: 'lighthouse', to: 'lighthouse', tx: 4, ty: 6, lit: (s) => !!s.flags.lighthouse_lit },
      { x: 18, y: 11, w: 2, h: 3, style: 'tower' },
      { x: 24, y: 24, w: 6, h: 4, style: 'boat', talk: ferryTalk },
    ],
    edges: { left: { to: 'coast', tx: 45, ty: 8 }, up: { to: 'beach', tx: 20, ty: 25 } },
    objs: [
      W.sign(2, 13, ['블루 마을 — 파도와 지혜의 항구', '↑ 대도서관   ↗ 파도 해변   → 등대   ↓ 부두 (옐로 마을행 연락선)']),
      W.sign(31, 1, '↑ 파도 해변 · 해저 동굴 (썰물 때만)'),
      W.spot(35, 22, 3),
      { t: 'sign', x: 19, y: 13, invisible: true, text: ['블루 마을의 징수탑. 탑 아래에 누군가 분필로 적어 놓았다.', '「책 읽는 경험에도 세금을 매기는 탑」'] },
    ],
    npcs: [
      { id: 'captain', x: 22, y: 23, dir: 'right', mark: (s) => (s.quests.m3 === 3 || s.quests.m3 === 5 ? '!' : null), talk: captainTalk },
      { id: 'jjanmul', x: 12, y: 23, dir: 'down', mark: (s) => (s.flags.ch3 && s.quests.q_feather == null) || (s.quests.q_feather === 0 && E.has(s, 'm6', 5)) ? '!' : null, talk: jjanmulTalk },
      { id: 'merchant', x: 15, y: 22, dir: 'down', talk: async (c) => { await c.say('merchant', ['싱싱한 고등어요! 오늘 아침에 잡은 거!', '저 금빛 나는 거요? [y]황금 고등어[/]. 한 마리 5만 골드. 밤의 도시 고양이들이 환장한다던데.']); await c.shop('fish'); } },
      { id: 'rud', x: 21, y: 22, dir: 'down', cond: (s) => !!s.flags.m_red_rud, mark: (s) => (s.quests.q_fish == null ? '!' : null), talk: rudBlueTalk },
      { id: 'sailor', x: 26, y: 15, dir: 'down', wander: 2, talk: W.chatter('blue_sailor', ['옐로 마을행 연락선은 고선장 배야. 근데 요새 안 떠. 나침반을 잃어버렸거든.', '해저 동굴에 새끼 크라켄이 산대. 다리가 여덟 개래. 새끼라서 여덟 개래.', '밤바다에 검은 별 조각이 떨어지는 거 본 적 있어? …나는 없어. 없어야 해.']) },
      { id: 'scholar', x: 11, y: 10, dir: 'down', wander: 2, talk: W.chatter('blue_scholar', ['대도서관에는 책이 십만 권 있어. 나는 평생 삼천 권 읽었지. 경험세만 아니었으면 사천 권은 읽었을 텐데.', '해미 사서한테 말 걸 때는 천천히 기다려 줘. 더듬지만 대륙에서 제일 똑똑한 사람 중 하나야.', '관장님은 문어야. 놀라면 먹물을 뿜으니까 놀래키지 마.']) },
      { id: 'kid2', x: 27, y: 17, dir: 'left', wander: 2, talk: W.chatter('blue_kid', ['등대가 3년째 꺼져 있어. 빛나 누나는 매일 밤 등대에 올라가.', '어시장의 빨간 머리 형은 숫자를 엄청 빨리 세! 고등어 백 마리를 1초 만에!']) },
    ],
    enter: async (c) => {
      if (c.flag('blue_intro')) return;
      c.set('blue_intro');
      await c.say('dotori', ['찍! 여기가 블루 마을! 저기 큰 동그란 지붕이 [y]대도서관[/]이야!', '엄마 책… 거기 있을까?']);
    },
  });
  W.town({ map: 'blue', x: 19, y: 16, name: '블루 마을', color: '#4dabf7', desc: '파도와 지혜의 항구. 대도서관과 등대.', hint: '레드 마을 남쪽 해안길 너머' });

  async function captainTalk(c) {
    const s = c.s;
    if (s.quests.m3 === 5 && E.has(s, 'compass')) {
      c.take('compass');
      await c.say('captain:happy', ['내 나침반! 크라켄 녀석 뱃속에서 꺼내 왔다고? 하하하! 우웩. …미안, 뱃멀미다. 배 위도 아닌데.', '약속대로 [y]항해 허가증[/]이다. 레벨 600이 되면 언제든 태워 주지.']);
      c.give('ferry_pass');
      c.quest('m3', 6);
      await c.say('captain', '바늘이 늘 황금별 쪽을 가리키는 나침반이다. 옐로 마을은 황금별 반대쪽이지만… 반대로 가면 되니까 괜찮다.');
      return;
    }
    if (s.quests.m3 === 3) {
      await c.say('captain', ['옐로 마을행 연락선 「고등어호」 선장이다. …뱃멀미를 한다. 30년째.', '배를 띄우고 싶어도 못 띄운다. 나침반이 없어. 해저 동굴의 새끼 크라켄이 삼켜 버렸지.']);
      await c.say('captain', ['나침반을 찾아 주면 [y]항해 허가증[/]을 끊어 주지. 해저 동굴은 마을 북쪽 파도 해변 끝에 있다.', '썰물 때만 입구가 열린다. …지금이 썰물이다. 운이 좋군.']);
      c.quest('m3', 4);
      return;
    }
    if (E.has(s, 'ferry_pass')) return ferryTalk(c);
    await c.say('captain', '고등어호 선장이다. 옐로 마을로 가려면 항해 허가증이 필요하다. …지금은 배를 못 띄우지만.');
  }
  async function ferryTalk(c) {
    const s = c.s;
    if (!E.has(s, 'ferry_pass')) { await c.say(null, '「고등어호」. 옐로 마을행 연락선이다. 선원들이 할 일 없이 갑판을 닦고 있다.'); return; }
    if (s.lv < 600) { await c.say('captain', ['허가증은 있는데… 레벨 600은 돼야 한다. 옐로 사막은 만만한 곳이 아니야.', '지금 레벨이 ' + G.u.fmtInt(s.lv) + '이군. 조금만 더 크고 와라.']); return; }
    if (!(await c.yes('고등어호를 타고 옐로 마을로 갈까?', 'captain', '출항!', '아직'))) return;
    await c.fadeOut(500);
    c.music('blue');
    await c.narr(['고등어호가 부두를 떠났다. 등대의 불빛이 점점 작아진다.', '고선장은 뱃머리에서 토했다. 30년째.', '사흘 뒤, 바다 저편에 모래빛 도시가 보이기 시작했다.']);
    c.set('sailed_yellow');
    if (s.quests.m3 !== 'done') c.quest('m3', 'done');
    await c.warp('yellow', 6, 26, 'up', { instant: true });
    await c.fadeIn(600);
  }
  async function jjanmulTalk(c) {
    const s = c.s;
    if (s.quests.q_feather === 0 && E.has(s, 'm6', 5)) {
      c.take('m6', 5);
      await c.say('jjanmul:happy', ['오호, 갈매기 깃털! 이걸로 모자를 장식하면 고래들이 알아보지.', '내가 고래를 네 번 삼킨 이야기를 해 줄까? …세 번이었나? 이제 네 번이다.']);
      c.give('f2', 3); c.gold(20000);
      c.quest('q_feather', 'done');
      return;
    }
    if (s.flags.ch3 && s.quests.q_feather == null) {
      await c.say('jjanmul', ['젊은이, 내가 고래를 세 번 삼킨 적이 있다는 얘기 들었나? 고래가 나를 삼킨 게 아니라, 내가 고래를.', '못 믿겠다고? 그럼 [y]갈매기 깃털[/] 5개를 가져와 보게. 증거를 보여 주지.']);
      c.quest('q_feather', 0);
      return;
    }
    await c.run(W.chatter('jjanmul', [
      '바다는 다 알아. 누가 울었는지, 누가 떠났는지. 파도 소리는 그 얘기를 하는 거야.',
      '3년 전에 등대지기가 검은 별을 쫓아 나갔지. 나는 말렸어. 검은 별은 쫓는 게 아니라고.',
      '황금 고등어는 1년에 한 마리 잡힐까 말까 해. 밤의 도시 고양이 정보상이 그걸 그렇게 좋아한대.',
    ]));
  }
  async function rudBlueTalk(c) {
    const s = c.s;
    if (!s.flags.rud_blue_met) {
      c.set('rud_blue_met');
      await c.say('rud', ['……너냐.', '보다시피 어시장에서 고등어 세고 있다. 기사단에서 잘렸으니까.']);
      await c.say('rud', s.flags.helped_rud ? ['네가 준 돈으로 이번 달 약값은 냈어. 빚은 여기 적어 뒀다.', '(주머니에서 꼬깃한 쪽지를 꺼낸다) 「흰빛 녀석 1,000골드. 반드시 갚음.」'] : ['동정은 필요 없어. 숫자는 거짓말 안 해. 고등어 한 마리 3골드. 하루 400마리. 약값까지 17일.']);
      await c.say('rud', ['…누나가 있었어. 레아라고. 8년 전에 기사단을 그만두고 사라졌지.', '누나가 있었으면 달랐을까. …아니, 숫자는 거짓말 안 해. 가정법은 숫자가 아니야.']);
    }
    if (s.quests.q_fish === 'done') { await c.say('rud', '…또 왔냐. 고등어 3골드. 흰빛 할인은 없다.'); return; }
    await c.say('rud', ['…바쁘다. 오늘 들어온 고등어가 산더미야.', '할 일 없으면 좀 도와. 10초에 60마리. 넌 못 할걸.']);
    if (s.quests.q_fish == null) c.quest('q_fish', 0);
    if (!(await c.yes('고등어 포장을 도울까?', 'rud', '돕는다', '다음에'))) return;
    const n = await c.clickRace(10);
    if (n >= 60) {
      await c.say('rud', ['……' + n + '마리.', '…흥. 숫자는 거짓말 안 하네.']);
      await c.emote('rud', '♪');
      await c.say(null, '루드가 아주 잠깐 웃었다. 금방 표정을 굳혔지만.');
      c.gold(15000); c.give('f2', 2);
      c.quest('q_fish', 'done');
    } else await c.say('rud', n + '마리. 흥, 내 반도 안 되네. 다시 해.');
  }

  /* ── 블루 안쪽 ── */
  W.map('blue_rank', {
    name: '블루 마을 등급소', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.04), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'blue', 7, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 책을 들고 있다.', '블루 사람들은 아우룸이 학자였다고 믿는다.'] }],
    npcs: [W.clerk('clerk_b', 5, 3, { hello: '등급소입니다아. 천천히 심사해 드릴게요오.', bye: '또 오세요오.' })],
  });
  W.map('blue_shop', {
    name: '파도 상회', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.04), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [2, 7], put: [[1, 2, 'h'], [2, 2, 'b'], [7, 2, 'b'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'blue', 29, 9)],
    npcs: [W.keeper('merchant', 'blue', 4, 3, '파도 상회요! 파도 장갑은 손끝이 파도처럼 리듬을 타요. 렙업 버튼이랑 궁합이 최고죠!')],
  });
  W.map('blue_inn', {
    name: '갈매기 여관', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.04), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'blue', 7, 20)],
    npcs: [W.innkeeper('innkeeper', 4, 4, 0, '갈매기 여관이에요. 창밖으로 파도 소리가 들려요. 푹 자고 가요.')],
  });

  /* ── 대도서관 ── */
  const libPut = [];
  for (let x = 1; x <= 10; x++) libPut.push([x, 2, 'h']);
  for (let x = 13; x <= 22; x++) libPut.push([x, 2, 'h']);
  libPut.push([11, 2, 'D'], [12, 2, 'D']);
  for (const y of [5, 6, 7, 10, 11]) { libPut.push([1, y, 'h']); libPut.push([22, y, 'h']); }
  for (const [x, y] of [[5, 6], [6, 6], [9, 6], [16, 6], [17, 6], [5, 10], [6, 10], [17, 10], [18, 10]]) libPut.push([x, y, 'd']);
  libPut.push([8, 12, 'n'], [9, 12, 'n'], [10, 12, 'n'], [1, 14, 'p'], [22, 14, 'p'], [15, 12, 'y']);
  W.map('library', {
    name: '블루 대도서관', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.08), music: 'calm', banner: false,
    grid: W.room({ w: 24, h: 16, floor: '-', door: 12, win: [4, 8, 15, 19], rug: [11, 3, 2, 12], put: libPut }),
    warps: [W.exit(12, 15, 'blue', 19, 9), { x: 11, y: 2, to: 'library_stacks', tx: 6, ty: 7, dir: 'up' }, { x: 12, y: 2, to: 'library_stacks', tx: 6, ty: 7, dir: 'up' }],
    objs: [
      W.gate(11, 2, {}, '「잠긴 서고 — 천년성 명령으로 봉인」\n문에 자물쇠 세 개가 달려 있다. 자물쇠마다 글자판이 있다.', { open: (s) => !!s.flags.stacks_open, style: 'light' }),
      W.gate(12, 2, {}, '「잠긴 서고 — 천년성 명령으로 봉인」', { open: (s) => !!s.flags.stacks_open, style: 'light' }),
      W.bookObj('b_chron2', 3, 2), W.bookObj('b_chron3', 7, 2), W.bookObj('b_chron4', 15, 2), W.bookObj('b_vessel', 20, 2),
      W.bookObj('b_fading', 1, 6), W.bookObj('b_notes8', 22, 6), W.bookObj('b_riddles', 22, 11),
      { t: 'sign', x: 15, y: 12, invisible: true, text: ['커다란 지구본… 이 아니라 이리스 대륙 모형이다. 초승달 모양이다.', '대륙 위 하늘에 작은 황금 구슬이 매달려 있다. 아스트라다.'] },
    ],
    npcs: [
      { id: 'haemi', x: 9, y: 11, dir: 'down', mark: (s) => (s.quests.m3 === 1 || s.quests.q_overdue === 1 ? '!' : s.flags.stacks_open && s.quests.q_overdue == null ? '?' : null), talk: haemiTalk },
      { id: 'mukmul', x: 11, y: 5, dir: 'down', mark: (s) => (s.quests.m3 === 0 || s.quests.m3 === 2 ? '!' : null), talk: mukmulTalk },
      { id: 'scholar', x: 5, y: 8, dir: 'up', talk: W.chatter('lib_scholar', ['쉿. 도서관이야.', '연대기 4권의 한 줄이 칼로 긁혀 있는 거 알아? 「이름이 지워진 한 사람」… 누굴까.', '「그릇에 관한 속설」 읽어 봤어? 흰빛은 나눌 수 있대. 983년 이후로 그 연구는 전부 금서야.']) },
    ],
  });
  async function mukmulTalk(c) {
    const s = c.s;
    if (s.quests.m3 === 0) {
      await c.say('mukmul', ['어서 오게, 젊은이. 대도서관에 온 걸 환영하네. 나는 관장 먹물이라네.', '…흠? 그 목걸이, 새싹 목걸이로군. 그리고 그 눈매…']);
      await c.emote('mukmul', '!');
      c.sfx('splash');
      await c.say(null, '관장의 머리에서 먹물이 퓻 하고 솟았다. 옆에 있던 책 한 권이 까맣게 물들었다.');
      await c.say('mukmul:surprise', ['어이쿠, 미안하네! 놀라면 이러네. 방금 그 책은… 「관장의 주석」이 하나 늘었군.', '자네… 세린의 아이로군. 그렇지?']);
      await c.say('@', '엄마를 아세요? 엄마가 쓴 책을 찾으러 왔어요.');
      await c.say('mukmul', ['알다마다. 세린에게 무한의 그릇을 연구해 보라고 권한 게 바로 나라네.', '…그 일을 16년 동안 후회했지.']);
      await c.say('mukmul', ['자네가 찾는 책은 [y]잠긴 서고[/]에 있네. 983년, 천년성에서 흰빛에 관한 책을 모두 봉인하라는 명령이 왔거든.', '불태우라는 말은 없었으니 봉인만 했지. 서고 문은 사서 [y]해미[/]의 수수께끼로 잠겨 있다네.']);
      await c.say('mukmul', '해미는 입구 쪽 책상에 있을 걸세. 말을 좀 더듬지만 재촉하지 말게. 대륙에서 가장 똑똑한 아이 중 하나야.');
      c.quest('m3', 1);
      return;
    }
    if (s.quests.m3 === 2 && s.books.b_serin) {
      c.music('mother');
      await c.say('mukmul', ['…다 읽었나.', '세린은 이 도서관에서 7년을 공부했네. 늘 저 창가 자리에 앉았지. 책 여덟 권을 동시에 읽는 나보다 빨리 읽었어.']);
      await c.say('mukmul', ['「흰빛은 나눌 수 있다.」 그 아이는 그걸 증명했네. 빛바램병에 걸린 아이의 머리칼에 색을 돌려줬지.', '그런데 983년, 천년성은 그 연구를 전부 봉인했어.']);
      await c.say('mukmul', ['나는 16년 동안 생각했네. 천년성이 두려워한 건 흰빛 자체였을까…', '…아니면 흰빛이 [y]할 수 있는 일[/]이었을까.']);
      await c.say('@', '……엄마는 흑점을 멈추러 간다고 했어요. 흑점이 뭔지… 더 알고 싶어요.');
      await c.say('mukmul', ['흑점에 대해서라면 대륙 동쪽 끝의 사람들이 더 잘 알 걸세. 하지만 거긴 멀지.', '우선 남쪽 바다 건너 [y]옐로 마을[/]로 가게. 그다음은 보랏빛 숲의 [y]라벤더 학원[/]. 세린의 스승 [y]베라 교수[/]가 거기 있네.']);
      await c.say('mukmul', '옐로 마을행 배는 부두의 고선장에게 물어보게. 그리고 이건… 세린이 자주 앉던 책상 서랍에 있던 걸세. 자네가 가져가게.');
      c.give('x2');
      await c.say('mukmul', ['그리고 하나 더. [y]빛의 책갈피[/]일세. 대도서관 사서들이 먼 서고를 오갈 때 쓰던 물건이지.', '한 번 가 본 마을이라면 지도를 펼쳐 책갈피를 꽂는 것만으로 그곳에 갈 수 있다네. 마을 안에서만 쓸 수 있지만.']);
      c.travelOn();
      await c.sys('이제 마을 안에서 [y]지도[/]를 열면 가 본 마을로 순간이동할 수 있다.');
      c.set('m_blue_book');
      c.quest('m3', 3);
      c.music('calm');
      return;
    }
    await c.run(W.chatter('mukmul', [
      '책은 여덟 권씩 읽게. …아, 자네는 팔이 둘이지. 미안하네.',
      '연대기 3권을 읽어 보게. 612년 은빛 왕국 이야기. 거기 먹물 자국은 주석이 아니라 사고라네.',
      '세린은 차를 좋아했어. 도서관은 음식 금지인데, 세린만은 봐줬지. 그 아이는 차를 한 방울도 흘리지 않았거든.',
    ]));
  }
  async function haemiTalk(c) {
    const s = c.s;
    if (s.quests.q_overdue === 1 && E.has(s, 'overdue')) {
      c.take('overdue');
      await c.say('haemi:happy', ['아! 「등, 등대지기의 노래」! 3년 만에 돌아왔네요!', '연체료요? 아, 아니에요. 대신… 이 책 얼마나 좋은지 얘기해도 될까요? 한 시간만요.']);
      await c.say(null, '…한 시간 뒤. 해미는 한 번도 더듬지 않았다.');
      c.gold(40000); c.give('p2', 5);
      G.main.unlockBook('b_lighthouse_song');
      c.quest('q_overdue', 'done');
      return;
    }
    if (s.quests.m3 === 1) {
      await c.say('haemi', ['아, 아, 안녕하세요. 사서 해미예요.', '서, 서고요? 관장님이 보내셨어요? 그, 그러니까… 서고 문은 제가 만든 수수께끼 세 개로 잠겨 있어요.']);
      await c.say('haemi', ['답은 전부 이 도서관 책에 있어요. 모, 모르면 책장을 둘러보고 오세요.', '…준비됐어요?']);
      if (!(await c.yes(null, 'haemi', '준비됐어', '책 좀 보고 올게'))) { await c.say('haemi', '처, 천천히 읽고 오세요. 책은 도망가지 않아요.'); return; }
      const Q = [
        ['첫 번째. 아우룸이 색 전쟁을 끝낸 해는 언제일까요?', ['원년', '100년', '612년', '983년'], 0],
        ['두 번째. 천 년 동안 흰빛으로 렙업한 사람은 모두 몇 명일까요?', ['한 명', '세 명', '다섯 명', '없다'], 1],
        ['세 번째. 등급의 문을 여는 비밀번호는 무엇을 더한 값일까요?', ['레벨과 골드', '역대 챔피언의 레벨', '같은 색 구슬에 새겨진 숫자', '생일'], 2],
      ];
      for (const [q, opts, ans] of Q) {
        const k = await c.ask(q, opts, 'haemi');
        if (k !== ans) { c.sfx('buzz'); await c.say('haemi:worry', ['트, 틀렸어요. 괜찮아요. 저도 처음엔 다 틀렸어요.', '책을 한 번 더 읽고 오세요. 서당 훈장님이 쓰신 1권이나, 연대기 2권에 답이 있어요.']); return; }
        c.sfx('unlock');
        await c.say('haemi:happy', '마, 맞았어요!');
      }
      await c.say('haemi:happy', ['세, 세 개 다요! 요즘 이걸 다 맞힌 사람은 처음이에요!', '서고 문을 열게요. 가장 안쪽 책상에… 관장님이 16년 동안 지켜 온 책이 있어요.']);
      c.set('stacks_open');
      c.quest('m3', 2);
      await c.say(null, '철컥, 철컥, 철컥. 도서관 안쪽에서 자물쇠 세 개가 풀리는 소리가 울렸다.');
      return;
    }
    if (s.flags.stacks_open && s.quests.q_overdue == null) {
      await c.say('haemi', ['저, 저기요. 부탁이 있는데요…', '등대의 빛나가 3년 전에 빌려 간 책이 있어요. 「등대지기의 노래」. 빛나한테 재촉하기가… 좀 그래서요. 아버지 일도 있고.']);
      c.quest('q_overdue', 0);
      return;
    }
    // 연체된 책을 찾아 준 뒤에만: 관장님도 모르는 책장
    if (s.quests.q_overdue === 'done' && !s.flags.haemi_secret) {
      c.set('haemi_secret');
      await c.say('haemi', ['저, 저기요. 비밀 하나 말해도 돼요? 관장님도 몰라요.', '잠긴 서고 오른쪽 책장 맨 아래 칸이요. 책등이 없는 책이 한 권 꽂혀 있어요. 제목도, 저자도 없어요.']);
      await c.say('haemi', ['여섯 살 때 서고에 몰래 들어갔다가 봤어요. 읽다가… 무서워서 도로 꽂았어요.', '지금은 안 무서울 것 같아요. 그, 그래도 혼자 읽긴 싫어서요. 당신이 읽고 저한테 얘기해 주세요.']);
      c.bond('haemi', 1);
      return;
    }
    if (s.truth && s.truth.t_colors && s.flags.haemi_secret && !s.flags.haemi_told) {
      c.set('haemi_told');
      await c.say('haemi', ['읽었어요? …어, 어땠어요?', '……']);
      await c.say('haemi', ['그랬구나. 다섯 빛깔은 원래 하나였고, 누가 일부러 쪼갠 거였구나.', '저는 여섯 살 때 그 부분에서 덮었어요. 「모이면 온다」는 줄에서요. 그때는 귀신 얘기인 줄 알았거든요.']);
      await c.say('haemi:happy', '…고, 고마워요. 이제 그 책은 무섭지 않아요. 슬픈 책이에요.');
      c.bond('haemi', 1);
      return;
    }
    await c.run(W.chatter('haemi', [
      '채, 책은 좋아요. 더듬어도 책은 기다려 주거든요.',
      ['세린 씨가 마지막으로 책을 반납하던 날, 저는 여섯 살이었어요.', '그 책의 대출 카드를 아직 가지고 있어요. 「세린. 반납일: 983년 새싹의 달 8일.」 그다음 날 떠나셨대요.'],
      '수수께끼는 답이 있어서 좋아요. 세상일은… 답이 없는 게 많으니까요.',
    ]));
  }
  W.map('library_stacks', {
    name: '잠긴 서고', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.08), music: 'mother', banner: false,
    grid: W.room({ w: 12, h: 9, floor: '-', door: 6, win: [], put: [[1, 2, 'h'], [2, 2, 'h'], [3, 2, 'h'], [8, 2, 'h'], [9, 2, 'h'], [10, 2, 'h'], [1, 4, 'h'], [1, 5, 'h'], [10, 4, 'h'], [10, 5, 'h'], [5, 3, 'd'], [6, 3, 'd'], [1, 7, 'h'], [10, 7, 'h']] }),
    warps: [{ x: 6, y: 8, to: 'library', tx: 11, ty: 3, dir: 'down' }],
    objs: [W.bookObj('b_serin', 5, 3), W.bookObj('b_decree983', 9, 2), { t: 'orbshine', orb: 'o_b1', x: 6, y: 3 }],
    enter: async (c) => {
      if (c.flag('stacks_seen')) return;
      c.set('stacks_seen');
      await c.say(null, ['먼지 냄새. 오래 닫혀 있던 방이다. 가장 안쪽 책상 위에 책 한 권이 놓여 있다.', '책 옆에서 파란 구슬 하나가 은은하게 빛난다.']);
      await c.say('dotori', '찍… {n}. 저 책이야.');
    },
  });
  G.hooks.enter.push((id) => {
    const s = G.state;
    if (id === 'library' && s.quests.m3 === 2 && s.books.b_serin && !s.flags.serin_read_scene) {
      s.flags.serin_read_scene = true;
      G.script.run(async (c) => { await c.say('dotori:sad', ['……{n}. 괜찮아?', '…관장님한테 가 보자. 뭔가 더 알고 계신 것 같아.']); });
    }
  });

  /* ── 등대 ── */
  W.map('lighthouse', {
    name: '블루 등대', region: 'blue', area: 'blue', theme: 'interior', bg: '#10141e', ki: W.ki('blue', 0.1), music: 'sad', banner: false,
    grid: W.room({ w: 9, h: 8, floor: '-', door: 4, win: [2, 6], put: [[1, 2, 'q'], [4, 2, 'y'], [7, 2, 'h'], [6, 5, 'd'], [1, 6, 'b']] }),
    warps: [W.exit(4, 7, 'blue', 34, 20)],
    objs: [W.bookObj('b_logbook', 7, 2), { t: 'sign', x: 4, y: 2, invisible: true, talk: lampTalk }],
    npcs: [{ id: 'bitna', x: 3, y: 4, dir: 'right', mark: (s) => (!s.flags.lighthouse_lit ? '!' : s.quests.q_overdue === 0 ? '?' : null), talk: bitnaTalk }],
  });
  async function bitnaTalk(c) {
    const s = c.s;
    if (s.quests.q_overdue === 0) {
      await c.say('bitna:surprise', ['아! 「등대지기의 노래」! 3년 동안 까먹고 있었어! 해미 언니 화났지?', '…화 안 났다고? 해미 언니는 원래 화를 안 내. 그래서 더 미안해.']);
      c.give('overdue');
      c.quest('q_overdue', 1);
      return;
    }
    if (!s.flags.lighthouse_lit) {
      await c.say('bitna', ['누구야? 등대는 구경하는 데 아니야.', '…아, 도서관에서 왔어? 흰빛이라는 애가 너야? 동네에 소문 다 났어.']);
      await c.say('bitna', ['우리 아빠가 이 등대의 등대지기였어. 3년 전에 「검은 별」을 쫓아 바다로 나갔지. 금방 온다고 했는데.', '그날부터 등불이 꺼졌어. 등불 수정이 색을 잃었거든. 빛바램병처럼. 아무리 기름을 부어도 안 켜져.']);
      await c.say('bitna', ['…흰빛은 빛을 나눌 수 있다며? 도서관 언니들이 그러던데.', '저 등불에… 네 빛을 조금만 나눠 줄 수 있어? 아빠가 돌아올 때 불이 켜져 있어야 하잖아.']);
      if (s.quests.q_light == null) c.quest('q_light', 0);
      await c.sys('등불 앞에서 [y]A[/]로 등불을 살펴보자.');
      return;
    }
    await c.run(W.chatter('bitna', [
      '불이 켜졌어. 이제 아빠 배가 어디 있든 이 불이 보일 거야.',
      ['아빠의 항해일지는 네가 가져가. 「검은 별의 조각은 빛이 모인 곳으로 간다」…', '너는 끝까지 가 줘. 아빠가 못 간 곳까지.'],
      '해미 언니한테 책 빌린 거 까먹지 말라고 누가 말 좀 해 줘. …아, 나구나.',
    ]));
  }
  async function lampTalk(c) {
    const s = c.s;
    if (s.flags.lighthouse_lit) { await c.say(null, '등불이 하얗게 빛난다. 불빛이 바다 멀리까지 뻗어 나간다.'); return; }
    await c.say(null, '등불 수정이 잿빛으로 식어 있다. 손을 대자 희미하게 떨린다.');
    if (s.quests.q_light !== 0) return;
    await c.sys('등불에 손을 얹고 [y]렙업 버튼을 30번[/] 눌러 흰빛을 나눠 주자.');
    await c.waitClick(30, (k) => { if (k % 10 === 0) { c.flash('#ffffff', 200); c.light(12); } });
    c.flash('#ffffff', 1200);
    c.light(80);
    c.set('lighthouse_lit');
    await c.say(null, ['수정 깊은 곳에서 작은 불씨가 깜빡였다. 그리고—', '쏴아아. 새하얀 빛이 등대 꼭대기에서 바다를 향해 뻗어 나갔다.']);
    await c.npc('bitna').jump();
    await c.say('bitna:sad', ['……켜졌어.', '켜졌어, 아빠. 불 켜 놨어. 이제 돌아와도 돼.']);
    await c.say('dotori', '……찍.');
    await c.say('bitna', ['…고마워. 이거 아빠 항해일지야. 너한테 필요할 것 같아.', '아빠는 검은 별 조각이 빛이 모인 곳으로 간다고 썼어. 무슨 뜻인지 나는 모르겠지만… 너는 알게 될 것 같아.']);
    c.give('log_book');
    G.main.unlockBook('b_logbook');
    c.quest('q_light', 'done');
    c.set('q_bitna_done');
    c.bond('bitna', 2);
    c.truth('t_log');
  }

  /* ───────── 파도 해변 ───────── */
  W.map('beach', {
    name: '파도 해변', sub: '블루 마을 북쪽', region: 'blue', area: 'beach', theme: 'blue', bg: '#1a3a5a', ki: W.ki('blue', 0.46), music: 'field', weather: 'bubble',
    grid: W.gen({
      w: 40, h: 26, seed: 'wave-beach', ground: 's', alt: [['.', 0.62, 5], [',', 0.8, 3]],
      obst: [['^', 3], ['T', 2], ['t', 1]], dense: 0.66, sparse: 0.03, scale: 5,
      border: (x, y) => (x >= 37 ? '~' : '#'), bt: 2, rough: 0.5,
      lakes: [{ x: 33, y: 16, rx: 5, ry: 7 }, { x: 10, y: 8, rx: 3, ry: 2 }],
      paths: [[[20, 25], [20, 18], [14, 14], [14, 8], [24, 5], [31, 4]], [[20, 18], [27, 18]]],
      clear: [[29, 2, 5, 4]],
      stamps: [{ x: 30, y: 2, rows: ['^^#^'], }, { x: 31, y: 3, rows: ['o'] }],
    }),
    edges: { down: { to: 'blue', tx: 30, ty: 0 } },
    warps: [{ x: 31, y: 3, to: 'seacave', tx: 16, ty: 28, dir: 'up' }],
    objs: [
      W.sign(21, 23, ['파도 해변', '해저 동굴 입구는 북동쪽 바위틈. 썰물 때만 들어갈 수 있음.']),
      W.spot(26, 18, 3), W.spot(4, 20, 10, true), W.chest('bc1', 15, 7, 'p2', 5), W.goldChest('bc2', 6, 22, 120000),
    ],
    mons: { list: ['starfish', 'wslime', 'pirat', 'sandcrab', 'gull'], n: 10, area: [2, 2, 34, 22] },
  });
  W.map('seacave', {
    name: '해저 동굴', sub: '크라켄의 굴', region: 'blue', area: 'seacave', theme: 'cave', bg: '#0a1420', ki: W.ki('blue', 0.84), music: 'cave', dark: 70, battleBg: 'cave', weather: 'bubble',
    grid: W.gen({
      w: 32, h: 30, seed: 'sea-cave', ground: 'o',
      obst: [['#', 4], ['^', 2], ['@', 1]], dense: 0.56, sparse: 0.05, scale: 4,
      border: '#', bt: 1, rough: 0.7,
      lakes: [{ x: 8, y: 12, rx: 3, ry: 4 }, { x: 24, y: 20, rx: 3.5, ry: 2.5 }, { x: 16, y: 6, rx: 6, ry: 1.6 }],
      paths: [[[16, 29], [16, 22], [8, 19], [8, 16], [14, 12], [22, 10], [22, 4], [16, 3]], [[16, 22], [26, 16]]], bridge: '_',
      clear: [[12, 1, 9, 4]],
    }),
    warps: [{ x: 16, y: 29, to: 'beach', tx: 31, ty: 4, dir: 'down' }],
    objs: [W.spot(26, 16, 3), W.spot(3, 25, 10, true), W.chest('sc1', 13, 2, 'p3', 3), W.goldChest('sc2', 27, 15, 300000)],
    mons: { list: ['eel', 'skelsailor', 'jelly', 'wslime', 'eel'], n: 10, area: [1, 5, 30, 23] },
    fixed: [
      { mon: 'clam', x: 5, y: 20, flag: 'beat_clam', boss: true, look: { creature: 'slime', tint: '#e8d8f0' } },
      { mon: 'kraken', x: 16, y: 2, flag: 'beat_kraken', boss: true, look: 'octopus', talk: krakenTalk },
    ],
    enter: async (c) => { if (c.flag('tip_seacave')) return; c.set('tip_seacave'); await c.say('dotori:worry', ['발밑이 축축해. 벽에서 물이 떨어져.', '가장 안쪽에서 뭔가 커다란 게 꿈틀거리는 소리가 나…']); },
  });
  async function krakenTalk(c, mo) {
    await c.say(null, '동굴 가장 안쪽 물웅덩이에서 보랏빛 다리 여덟 개가 솟아올랐다. 가운데 커다란 눈 하나가 번뜩인다.');
    await c.say('dotori:surprise', ['새, 새끼라며! 저게 새끼면 엄마는 얼마나 커!', '찍! 저 배 속에서 뭔가 반짝여! 나침반이야!']);
    await c.say(null, '자세히 보니 크라켄의 다리 끝이 잿빛으로 바래 있다. 웅덩이 바닥에 반짝이는 것들이 수북하다. 병뚜껑, 숟가락, 유리구슬… 빛나는 것만 모아 놓았다.');
    await c.say('dotori:worry', ['…배고파 보여. 등대지기 아저씨 일지에 그랬잖아. 검은 조각이 떨어진 바다는 물고기가 색을 잃는다고.', '먹을 게 없어서 반짝이는 걸 삼킨 거 아닐까?']);
    const fish = G.story.fishIn ? G.story.fishIn(c.s) : null;
    const k = fish ? await c.ask(null, ['[y]낚은 물고기를 던져 준다[/] (' + G.data.ITEMS[fish].name + ')', '싸워서 되찾는다']) : 1;
    if (k === 0) {
      c.take(fish);
      c.sfx('splash');
      await c.narr(['물고기를 웅덩이로 던졌다. 크라켄의 눈이 커졌다. 다리 하나가 번개처럼 물고기를 낚아챘다.', '꿀꺽. …크라켄이 한참 가만히 있더니, 몸을 부르르 떨었다.']);
      G.field.removeMon(mo);
      c.set('beat_kraken');
      c.decide('kraken', 'feed', '해저 동굴의 새끼 크라켄에게 물고기를 먹였다');
      await c.say(null, '꾸르륵. 크라켄이 놋쇠 나침반과 파란 구슬을 조심스럽게 뱉어 냈다. 그리고 다리 하나로 숟가락 하나를 이쪽으로 밀어 주었다. 답례인 모양이다.');
      await c.say('dotori:happy', '찍! 숟가락 줬어! …숟가락은 어디다 쓰지?');
    } else {
      const win = await c.battle('kraken', { noFlee: true });
      if (!win) return;
      G.field.removeMon(mo);
      c.set('beat_kraken');
      c.decide('kraken', 'fight', '해저 동굴의 새끼 크라켄과 싸워 나침반을 되찾았다');
      await c.say(null, '크라켄이 꾸르륵 하더니 놋쇠 나침반과 파란 구슬을 뱉어 냈다. 그리고 부끄러운 듯 물속으로 숨었다.');
    }
    c.give('compass');
    await c.orb('o_b2');
    if (c.s.quests.m3 === 4) c.quest('m3', 5);
    await c.say('dotori', '고선장님한테 나침반 갖다 드리자!');
  }

  /* ───────── 레벨에 따른 안내 ───────── */
  G.hooks.level.push((lv) => {
    const s = G.state;
    if (lv >= 150 && s.quests.m2 === 3 && !s.flags.tip150) { s.flags.tip150 = true; G.ui.toast('레벨 150! 레드 마을 남쪽 해안길이 열렸다.', 'gold'); }
    if (lv >= 250 && s.flags.mine_open === undefined && s.quests.q_mine != null && !s.flags.tip250) { s.flags.tip250 = true; G.ui.toast('레벨 250! 황금 광산에 도전할 수 있을 것 같다.', 'gold'); }
    if (lv >= 600 && E.has(s, 'ferry_pass') && !s.flags.tip600) { s.flags.tip600 = true; G.ui.toast('레벨 600! 블루 부두의 고등어호를 탈 수 있다.', 'gold'); }
  });

  /* ───────── 블루의 결: 서고의 책 · 창가 자리 · 소품 · 혼잣말 · 곁의 이야기 ───────── */
  W.addObjs('library_stacks', [W.look(10, 5, (s) => (s.flags.haemi_secret ? null : '빽빽한 책장. 맨 아래 칸은 먼지가 유난히 두껍다.'), { talk: async (c) => {
    const s = c.s;
    if (!s.flags.haemi_secret) { await c.say(null, '빽빽한 책장. 맨 아래 칸은 먼지가 유난히 두껍다. 무언가 더 있을 것 같지만, 어느 책인지 알 수 없다.'); return; }
    if (s.truth && s.truth.t_colors) { await c.say(null, '책등 없는 책. 해미가 여섯 살 때 덮었던 곳에 이제 먼지 대신 손자국이 남아 있다.'); return; }
    await c.say(null, ['맨 아래 칸, 책등이 없는 얇은 책. 표지에 아무것도 적혀 있지 않다.', '첫 장을 넘기자 아주 오래된 글씨가 나왔다. 대륙 말이지만, 철자가 천 년 전 것이다.']);
    await c.narr(['「나는 흰빛으로 전쟁을 끝냈다. 그리고 알았다. 흰빛이 한곳에 모이면, 하늘의 무언가가 눈을 뜬다는 것을.」', '「그래서 나는 빛을 쪼갰다. 초록, 빨강, 파랑, 노랑, 보라. 다섯 땅에 나누어 흩었다. 그것을 여신의 뜻이라고 적게 했다.」', '「등급을 만든 것도, 인장을 구슬로 부순 것도 같은 까닭이다. 빛이, 힘이, 사람이 다시는 한곳에 모이지 않도록.」', '「후대여. 모이면 온다. 나누면 오지 않는다. 이것만은 잊지 마라. — A.」']);
    c.truth('t_colors');
    await c.say('dotori:worry', ['…창세 신화가 거짓말이었어? 여신이 나눈 게 아니라, 아우룸이 일부러?', '「모이면 온다」… 그럼 탑이 빛을 모으는 건…']);
    await c.say('dotori', '…해미 언니한테 얘기해 주자. 혼자 읽기 싫다고 했잖아.');
  } })]);
  W.addObjs('library', [W.look(6, 6, (s) => (s.flags.m_blue_book ? ['세린이 늘 앉던 창가 쪽 책상. 모서리에 찻잔 자국이 동그랗게 남아 있다.', '한 방울도 흘리지 않았다더니, 딱 한 번은 흘린 모양이다. 자국 옆에 손톱으로 긁은 작은 글씨: 「K 바보」.'] : '창가 쪽 책상. 모서리에 오래된 찻잔 자국이 동그랗게 남아 있다.'))]);
  W.addObjs('blue', [
    W.prop('bench', 30, 22),
    W.prop('board', 19, 22, (s) => ['어시장 게시판. 「오늘의 시세 — 고등어 3골드, 전갱이 5골드, 황금 고등어 5만 골드 (1년에 한 마리)」', s.flags.lighthouse_lit ? '그 아래 새 종이: 「등대 불 켜짐! 밤배 출항 재개. — 고선장」' : '그 아래 빛바랜 종이: 「밤바다 검은 조각 목격 시 신고 바람. 만지지 말 것.」']),
    W.prop('shrine', 3, 22, '뱃사람들의 작은 사당. 바다에서 돌아오지 못한 사람들의 이름이 돌에 빼곡하다. 가장 최근 이름은 997년. 「등대지기 한결」.'),
    W.prop('well', 11, 9, '도서관 앞 우물. 「책 읽다 목마르면 여기서」라고 적혀 있다. 해미 글씨다.'),
  ]);
  W.addObjs('coast', [W.prop('bench', 28, 10)]);
  W.addObjs('beach', [W.prop('fire', 25, 12, '해변의 모닥불 자리. 어부들이 밤에 조개를 굽는 곳이다. 재 속에 조개껍데기가 수북하다.')]);
  W.barks('blue', {
    captain: ['우웩… 배 위도 아닌데.', '나침반만 있으면…'],
    jjanmul: ['고래를 세 번… 네 번!', '파도가 말하길…'],
    merchant: ['고등어요!', '황금 고등어 한 마리!'],
    rud: ['…398, 399, 400.', '3골드.'],
    sailor: ['바람이 좋다.', '검은 별은 없어야 해.'],
    scholar: ['삼천 권째…', '쉿.'],
    kid2: ['등대 봤어?', '빨간 머리 형 빨라!'],
  });
  W.barks('library', { haemi: ['채, 책은…', '…쉿.'], mukmul: ['여덟 권째…', '어이쿠, 먹물이.'], scholar: ['쉿.'] });
  W.barks('lighthouse', { bitna: (s) => (s.flags.lighthouse_lit ? ['켜 놨어, 아빠.'] : ['…오늘도 안 켜져.']) });

  /* 도토리와의 이야기 (3장) */
  G.story.talks.push(
    { id: 'b_sea', map: 'coast', run: async (c) => {
      await c.say('dotori', ['바다는 끝이 안 보여.', '엄마도 이 바다를 봤을까? 아스트라로 가는 길에.']);
      const k = await c.ask(null, ['봤을 거야.', '엄마 얘기 그만하자.']);
      if (k === 0) await c.say('dotori', '…그럼 우리 지금 엄마랑 같은 걸 보고 있는 거네. 16년 차이로. 찍.');
      else { await c.say('dotori', '……응. 알았어. 미안.'); c.set('dotori_hush'); }
    } },
    { id: 'b_book', when: (s) => !!s.flags.serin_read_scene, pri: 3, run: async (c) => {
      await c.say('dotori', ['{n}. 엄마 편지 말이야.', '「미안해. 네가 걸음마 하는 걸 보고 싶었는데.」 …너는 어땠어? 읽고 나서.']);
      const k = await c.ask(null, ['원망스러워. 나를 두고 갔잖아.', '보고 싶어. 한 번만이라도.', '…모르겠어. 아무 느낌이 없어.']);
      c.set('mom_feel_' + ['angry', 'miss', 'numb'][k]);
      if (k === 0) await c.say('dotori', ['…원망해도 돼. 편지에 그렇게 써 있었잖아. 「미안해」라고.', '미안하다는 사람은 원망받을 각오가 된 사람이래. 할머니가 그랬어.']);
      else if (k === 1) await c.say('dotori:sad', ['…응.', '나도. 이상하지. 나는 기억도 안 나는데.']);
      else await c.say('dotori', ['…그럴 수 있어. 너무 큰 건 처음엔 아무 느낌이 없대.', '나중에 와. 한꺼번에. 그때 옆에 있을게.']);
      c.bond('dotori', 1);
    } },
    { id: 'b_light', when: (s) => !!s.flags.lighthouse_lit, run: async (c) => {
      await c.say('dotori', ['빛나 누나는 3년 동안 매일 등대에 올라갔대. 켜지지도 않는 불 앞에.', '…기다리는 쪽이 더 힘든 것 같아. 떠난 사람은 적어도 움직이잖아.']);
      await c.say('dotori', '나도 뭔가를 오래 기다린 것 같은 기분이 들어. 뭘 기다렸는지는 모르겠는데. 찍.');
    } },
    { id: 'b_rud', when: (s) => s.quests.q_fish === 'done', run: async (c) => {
      await c.say('dotori', '루드 형 웃는 거 봤어? 딱 1초. 나 셌어. 형처럼.');
    } },
  );
  /* 쉬는 밤 (3장): 할머니에게 쓰는 편지. 답장은 다음 마을에서 온다. */
  G.story.nights.push(
    { id: 'b_letter', when: (s) => !!s.books.b_serin, intro: '갈매기 여관의 밤. 창밖 파도 소리에 잠이 오지 않는다. 여관 주인이 편지지를 빌려주었다.', run: async (c) => {
      await c.say('dotori', '할머니한테 편지 쓰는 거야? 나도 한 줄 써도 돼? 「도토리 잘 있음. 찍.」');
      const k = await c.ask('편지에 무엇을 쓸까', ['엄마 책을 찾았어요. 다 읽었어요.', '잘 지내요. 밥도 잘 먹어요.', '왜 엄마 얘기를 안 해 줬어요?']);
      c.set('letter_gran', ['book', 'fine', 'why'][k]);
      await c.narr(['편지를 접어 봉투에 넣었다. 도토리가 발바닥에 잉크를 묻혀 봉투 구석에 도장을 찍었다.', '내일 아침 우편선에 실으면 그린 마을까지 닷새가 걸린다고 했다.']);
    } },
  );

  G.world.nodes.push({ region: 'blue', label: '블루', x: 88, y: 156, color: '#4dabf7', maps: ['blue', 'coast', 'beach', 'seacave', 'library', 'library_stacks', 'lighthouse', 'blue_rank', 'blue_shop', 'blue_inn'] });
})();
