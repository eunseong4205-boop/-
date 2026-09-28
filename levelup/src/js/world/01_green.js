/* 프롤로그 · 1장 「흰빛」 — 그린 마을 · 새싹 들판 · 속삭이는 숲 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, U = G.u;

  /* ───────── 물건 ───────── */
  W.keyItem('lunch', '콩순의 도시락', '돌쇠 씨에게 전해 달라는 도시락. 옥수수빵 세 개와 쪽지 한 장.');
  W.keyItem('rod', '느림보 영감의 낚싯대', '40년 동안 물고기 한 마리 못 낚은 낚싯대. 미끼 대신 옥수수빵 조각이 달려 있다.');
  W.keyItem('clover', '네잎클로버', '봄이가 준 네잎클로버. 「전설이 되면 돌려줘.」');

  /* ───────── 이야기 ───────── */
  W.quest('m0', { main: true, name: '프롤로그 · 열여섯 번째 생일', where: '할머니의 오두막', stages: [
    '부엌에 계신 할머니에게 가 보자.',
    '렙업 버튼을 눌러 [y]레벨 5[/]를 만들자. 집 안에서도 누를 수 있다.',
    '마을로 내려가 [y]등급소[/]에서 평민 1차로 등록하자.',
  ], done: '평민 1차가 되었다. 흰빛은 서식에 없었다.' });
  W.quest('m1', { main: true, name: '1장 · 흰빛', where: '그린 마을', stages: [
    '마을 사람들을 도우며 경험을 쌓자. [y]레벨 12[/]가 되면 할머니에게 돌아가자.',
    '할머니가 부르신다. 언덕 위 오두막으로 가자.',
    '북쪽 [y]속삭이는 숲[/] 가장 깊은 곳에서 단단한 나뭇가지를 구해 오자.',
    '단단한 나뭇가지를 들고 할머니에게 돌아가자.',
    '마을 광장의 징수탑이 이상하다…',
    '할머니가 기다린다. 오두막으로 돌아가자.',
  ], done: '징수탑이 무너졌다. 할머니는 편지 한 통을 건넸다.' });
  W.quest('q_mole', { name: '박씨의 감자밭', where: '새싹 들판', stages: ['새싹 들판에서 [y]감자밭 두더지[/]를 5마리 쓰러뜨리자.', '박씨에게 알리자.'], done: '두더지와의 전쟁에서 드디어 4승째.' });
  W.quest('q_lunch', { name: '콩순의 도시락', where: '그린 마을 광장', stages: ['징수탑 옆에서 조는 [y]돌쇠 씨[/]에게 도시락을 전하자.', '콩순 아줌마에게 돌아가자.'], done: '돌쇠 씨는 도시락을 다 먹었다. 쪽지는 주머니에 넣었다.' });
  W.quest('q_rod', { name: '연못의 반짝이', where: '그린 마을 연못', stages: ['느림보 영감이 [y]옥수수빵[/]을 먹고 싶어 한다. 콩순 아줌마의 가게에서 살 수 있다.', '낚싯대를 빌렸다. 연못에서 반짝이는 곳을 조사하자.'], done: '연못 바닥에서 16년 동안 반짝이던 것을 건져 올렸다.' });
  W.quest('q_race', { name: '철이의 도전장', where: '그린 마을', stages: ['10초 동안 렙업 버튼 누르기 대결! 철이의 기록 [y]45번[/]을 넘기자.'], done: '철이는 「오늘은 손가락이 좀 부었어」라고 했다.' });
  W.quest('q_bomi', { name: '봄이의 소원', where: '속삭이는 숲', stages: ['속삭이는 숲 서쪽 빈터의 [y]대왕 슬라임[/]을 쓰러뜨리자.', '봄이에게 알리자.'], done: '봄이는 네잎클로버를 건넸다. 전설이 되면 돌려받기로 했다.' });
  W.quest('q_study', { name: '훈장님의 숙제', where: '새싹 서당', stages: ['그린 마을 곳곳의 책과 비석을 [y]다섯 개[/] 읽고 훈장님께 돌아가자.'], done: '「읽은 것과 믿는 것은 다르니라.」 훈장님은 그렇게만 말했다.' });

  /* ───────── 책 ───────── */
  W.book('b_album', { title: '할머니의 앨범', where: '할머니의 오두막', text:
    '낡은 가죽 앨범. 첫 장에는 젊은 할머니가 긴 창을 들고 웃고 있다. 옆에는 초록 망토를 두른 사람들이 서 있다.\n\n' +
    '중간쯤에 사진 한 장이 빠진 자리가 있다. 사진 틀 아래 연필 글씨.\n「세린과 아기. 983년, 새싹의 달.」\n\n' +
    '마지막 장에는 할머니와 아기가 된 {n}, 그리고 볼이 통통한 하늘다람쥐가 찍혀 있다.\n다람쥐는 그때도 지금과 똑같이 생겼다.' });
  W.book('b_herb', { title: '약초 수첩', where: '할머니의 오두막', author: '오방순', text:
    '빨간 약초 — 상처에. 세 잎이면 충분. 네 잎 따는 놈은 욕심쟁이.\n옥수수수염 — 차로 끓이면 잠이 잘 온다. 도토리는 두 잔 먹고 밤새 떠들었다.\n\n' +
    '빛바램병 — 머리칼부터 색이 빠진다. 약은 없다. 빛을 나눠 줄 수 있는 사람이 있다면 모를까.\n그런 사람은 천 년에 셋뿐이었다.\n\n' +
    '(맨 뒷장, 꾹꾹 눌러 쓴 글씨) 그 아이가 누르는 날이 오면 나는 뭐라 말해야 하노.' });
  W.book('b_chron1', { title: '이리스 연대기 1권 — 창세와 색 전쟁', where: '새싹 서당', author: '서당 훈장 옮김', text:
    '처음에 빛은 하얬다. 여신 이리스가 그 빛을 다섯 빛깔로 나누어 땅을 빚었다. 초록, 빨강, 파랑, 노랑, 보라. 다섯 부족이 그 땅에 났다.\n\n' +
    '땅마다 머금은 빛, 곧 [y]기운[/]이 달랐다. 기운이 짙은 땅에서는 망치질 한 번도 큰 경험이 되었다. 사람들은 더 짙은 땅을 원했다.\n\n' +
    '원년 전 300년, 다섯 부족은 빛이 가장 짙게 솟는 [y]무지개 샘[/]을 두고 싸웠다. 이것이 [r]색 전쟁[/]이다. 전쟁은 삼백 년 동안 이어졌다.\n\n' +
    '원년, 이름 없는 국경 마을에서 한 소년이 [w]흰빛[/]으로 렙업했다. 소년의 이름은 [y]아우룸[/]. 그는 레벨 100만에 이르러 전쟁을 끝냈다.\n\n' +
    '아우룸은 무지개 샘의 빛을 공평하게 나누고, 싸우는 대신 겨루도록 [y]등급 제도[/]를 세웠다. 그리고 대륙 한가운데 [y]천년성[/]을 쌓았다.\n\n' +
    '— 2권 「구슬과 인장」은 블루 대도서관에 있다.' });
  W.book('b_song', { title: '동요 「렙업 노래」', where: '새싹 서당', text:
    '한 번 누르면 새싹이 나고\n두 번 누르면 줄기가 크고\n백 번 누르면 나무가 되지\n오늘도 렙업! 내일도 렙업!\n\n' +
    '한 번 넘어지면 쉼터에 가고\n두 번 넘어지면 할머니한테 혼나고\n백 번 넘어지면 전설이 되지\n오늘도 렙업! 내일도 렙업!\n\n' +
    '(누군가 연필로 적어 넣었다)\n세 번째 줄 — 백 번 누르면 삼십 번은 탑이 먹지' });
  W.book('b_rank', { title: '등급 제도 안내서', where: '그린 마을 등급소', author: '천년성 등급관리국', text:
    '[y]평민[/] 1~5차 — 모든 사람의 시작.\n[r]괴짜[/] 1~10차 — 평범함의 틀을 벗어난 자.\n[b]덕후[/] 1~20차 — 한 우물을 끝까지 판 자.\n[y]짱[/] 1~30차 — 한 지역에서 당할 자가 없는 자.\n[p]전설[/] 1~40차 — 살아서 이야기가 된 자.\n그리고 [w]챔피언[/] — 대륙에 단 한 명.\n\n' +
    '괴짜부터는 등급의 문이 잠겨 있다. 초대 챔피언 아우룸께서 등급의 [y]인장[/]을 색 구슬로 쪼개 대륙 곳곳에 숨기셨기 때문이다.\n\n' +
    '「스스로 대륙을 걸어 구슬을 모은 자만이 다음 등급에 오른다.」\n같은 색 구슬 네 개에 새겨진 숫자를 모두 더하면, 그것이 문을 여는 비밀번호다.\n\n' +
    '※ 천년 방위령에 따라 등급별 경험세율이 다르게 적용됩니다. 평민 3할, 괴짜 2할, 덕후 1할 5푼, 짱 1할, 전설 면제.' });
  W.book('b_minutes', { title: '그린 마을 회의록 983년', where: '이장 댁', author: '서기 변덕수', text:
    '안건: 광장에 징수탑을 세우는 일에 관하여.\n\n' +
    '이장 변덕수: 반대합니다.\n(다음 날) 이장 변덕수: 챔피언님의 뜻이라면 찬성합니다.\n(그다음 날) 이장 변덕수: 원래 반대였음을 기록해 주십시오.\n\n' +
    '오방순: 탑이 먹는 빛이 어디로 가는지 아는 사람 있나. 모르면서 세우는 거는 아이다.\n\n' +
    '결과: 찬성 31, 반대 1, 기권 1(도토리, 발언권 없음).' });
  W.book('b_notice', { title: '천년 방위령 공고문', where: '그린 마을 징수탑', author: '챔피언 카이론', text:
    '이리스의 모든 백성에게 알린다.\n\n' +
    '하늘에서 대륙을 노리는 위협이 있다. 이를 막기 위해 오늘부터 모든 마을에 징수탑을 세운다. 백성은 렙업할 때 터지는 빛의 일부를 등급에 따라 나라에 바친다.\n\n' +
    '거둔 빛은 천년성을 거쳐 하늘로 올라가 대륙을 지키는 방패가 된다.\n\n' +
    '이 명령은 천 년을 위한 것이다. 이유를 묻지 말라. 나는 이미 모든 것을 계산했다.\n\n— 천년력 983년, 챔피언 카이론' });
  W.book('b_aurum_stone', { title: '아우룸의 쉼터 비석', where: '속삭이는 숲', text:
    '「여기서 아우룸이 쉬어 갔다.」\n\n' +
    '비석 뒷면에 작은 글씨가 빼곡하다.\n「나는 백만 번을 눌렀다. 그중 한 번도 혼자 누른 적은 없다. 옆에 누군가가 있었다. 그러니 이 빛은 내 것이 아니다.」\n\n' +
    '그 아래에 누군가 덧붙였다. 글씨가 둥글고 작다.\n「맞아요. 성장은 나누는 거예요. — 세린, 982」' });

  /* ───────── 할머니의 오두막 ───────── */
  W.map('home', {
    name: '할머니의 오두막', region: 'green', area: 'green', theme: 'home', bg: '#1a120c', ki: 1, music: 'home', banner: false,
    grid: W.room({ w: 12, h: 9, floor: '-', door: 6, win: [3, 8], rug: [4, 4, 4, 3],
      put: [[1, 2, 'q'], [10, 2, 'q'], [4, 2, 'h'], [5, 2, 'h'], [8, 2, 'n'], [9, 2, 'n'], [7, 2, 'b'], [1, 7, 'p'], [10, 7, 'p'], [5, 5, 'd'], [6, 5, 'd'], [2, 2, 'p']] }),
    warps: [W.exit(6, 8, 'green', 6, 7)],
    objs: [W.bookObj('b_album', 4, 2), W.bookObj('b_herb', 5, 2)],
    examine: (x, y, ch) => {
      if (ch === 'q' && x === 1) return async (c) => { if (await c.yes('내 침대다. 잠깐 누워서 쉴까?', null, '쉰다', '그만둔다')) await c.rest(); };
      if (ch === 'q') return '할머니 침대다. 이불에서 약초 냄새가 난다.';
      if (ch === 'n') return '아궁이 위에서 옥수수죽이 보글보글 끓고 있다.';
      if (ch === 'b') return '된장 항아리다. 할머니 된장은 레드 마을까지 소문났다.';
      return null;
    },
    npcs: [
      { id: 'gran', x: 8, y: 3, dir: 'up', mark: (s) => (s.quests.m0 === 0 || s.quests.m1 === 1 || s.quests.m1 === 3 || s.quests.m1 === 5 ? '!' : null), talk: granTalk },
      { id: 'dotori', x: 2, y: 4, dir: 'right', cond: (s) => !s.flags.m_button, talk: async (c) => { await c.say('dotori', '할머니가 부엌에서 부르셔! 찍!'); } },
    ],
  });
  G.story.opening = async (c) => {
    await c.fadeOut(1);
    c.music(null);
    c.hero.to(1, 3, 'down');
    await c.chapter('프롤로그', '열여섯 번째 생일', '천년력 999년, 새싹의 달. 그린 마을.');
    await c.narr(['이리스 대륙의 사람들은 무언가를 되풀이할 때마다 몸에 [y]경험[/]이라는 빛이 쌓인다.', '빛이 차오르면 영혼이 한 칸 자란다. 사람들은 그것을 [y]렙업[/]이라고 부른다.', '…그리고 오늘, 그린 마을 언덕 위 오두막에서 한 아이가 열여섯 살이 된다.']);
    c.music('home');
    await c.fadeIn(700);
    await c.wait(0.3);
    await c.npc('dotori').jump();
    await c.npc('dotori').jump();
    await c.say('dotori:happy', '찍! 찍찍! 일어나, {n}! 오늘 네 생일이잖아! 열여섯 번째 생일! 찍!');
    await c.emote('@', '…');
    await c.say('@', '으음… 도토리…? 해도 아직 안 떴잖아…');
    await c.say('dotori:angry', '해는 벌써 떴거든! 할머니가 부엌에서 부르셔. 빨리 가 봐, 찍!');
    c.quest('m0', 0);
    await c.sys('[y]십자키[/]로 걷고, 사람을 향해 [y]A[/] 버튼을 누르면 말을 건다.');
  };
  async function granTalk(c) {
    const s = c.s;
    c.npc('gran').face('@');
    if (!s.flags.m_button) return buttonScene(c);
    if (s.quests.m1 === 1) return stickRequest(c);
    if (s.quests.m1 === 2) { await c.say('gran', ['속삭이는 숲은 마을 북쪽이다. 나뭇가지는 숲 가장 깊은 데 있는 큰 나무 근처에서 줍는 기 제일 단단하다.', '숲 주인한테 인사 잘하고. 그 양반 말이 좀 많다.']); return; }
    if (s.quests.m1 === 3) return swordScene(c);
    if (s.quests.m1 === 5) return letterScene(c);
    if (s.quests.m1 === 4) { await c.say('gran', '광장 쪽이 와 이리 시끄럽노. 함 가 봐라.'); return; }
    if (s.quests.m1 === 'done' && !s.flags.visit_red) { await c.say('gran', ['레벨 30 되믄 남쪽 산길 기사들이 지나가게 해 줄 끼다.', '편지 잃어버리지 말고. 은하수 그 영감한테 꼭 니 손으로 전해래이.']); return; }
    if (s.quests.m0 === 1 || s.quests.m0 === 2) {
      if (s.lv < 5) await c.say('gran', '레벨 5 될 때까지 버튼 눌러라. 집 안이라 기운이 약해도 누르다 보믄 된다.');
      else await c.say('gran', '레벨 5 됐나? 그라믄 마을 내려가서 등급소 가 봐라. 광장 서쪽에 파란 지붕이다.');
      return;
    }
    await c.run(W.chatter('gran', [
      '밥은 뭇나. 모험도 배가 불러야 하는 기다.',
      ['약초는 세 잎만 따는 기다. 네 잎 따는 놈은 욕심쟁이다.', '…도토리 니 말하는 거 아이다.'],
      '쓰러지믄 쉼터에서 눈 뜬다. 그래도 안 쓰러지는 기 제일이다.',
      (c2) => c2.say('gran:sad', '니 눈은… 니 엄마를 쏙 빼닮았다.'),
    ]));
  }
  async function buttonScene(c) {
    await c.say('gran', ['일어났나. 생일 축하한데이, {n:아/야}.', '열여섯이믄 이리스에서는 어른이다. 오늘은 등급소 가서 [y]평민 1차[/] 등록도 해야 되고.']);
    await c.say('gran', '…그라고, 이거.');
    c.give('button');
    await c.narr(['할머니가 손바닥만 한 둥근 버튼을 내밀었다. 하얗고 매끈하다.', '가장자리에 작은 글씨가 새겨져 있다.\n「모든 성장은 한 번의 누름에서 시작된다 — A.」']);
    const k = await c.ask(null, ['이게 뭐야?', '누가 준 거야?']);
    if (k === 0) await c.say('gran', ['[y]시작의 버튼[/]이라 카는 기다. 누르믄 수련 한 번 한 셈이 된다 카더라.', '망치질 백 번이 손가락 한 번이라 카이. 얻는 경험은 그 자리 기운에 따라 다르고.']);
    else await c.say('gran:sad', ['…니 엄마가 남긴 기다.', '16년 동안 장롱 속에 넣어 뒀다. 오늘 주기로 약속했거든.']);
    await c.say('gran', '마, 함 눌러 봐라. 어데 한번 보자.');
    await c.sys('화면 아래 커다란 [y]렙업![/] 버튼을 눌러 보자. (키보드는 스페이스)');
    await c.waitClick(1);
    await c.wait(0.2);
    c.exp(Math.max(0, 13 - c.s.exp));
    c.light(90);
    c.flash('#ffffff', 1000);
    c.music(null);
    await c.wait(1.1);
    await c.emote('gran', '!');
    await c.npc('dotori').jump();
    await c.say('dotori:surprise', '우, 우와아아! 하얀색! 하얀 렙업은 처음 봐! 찍!');
    await c.narr(['[w]렙업의 빛[/]은 태어난 땅의 색을 띤다. 그린 마을 사람은 초록빛으로, 레드 마을 사람은 붉은빛으로 렙업한다.', '그런데 {n}의 빛은 눈이 부시도록 새하얬다.']);
    await c.say('gran', '……');
    await c.say('gran', ['…마, 별거 아이다. 창문으로 들어온 햇빛이 비친 기라.', '레벨 5부터 등급소에서 받아 준다. 버튼 좀 더 눌러 가 레벨 5 만들고 마을 내려가 봐라.']);
    c.music('home');
    await c.say('gran', '도토리 니도 따라가라. 우리 {n} 사고 안 치구로 잘 봐래이.');
    await c.say('dotori:happy', '찍! 맡겨 줘! 나 레벨 9야!');
    await c.say('gran', '니는 16년째 레벨 9다 아이가.');
    await c.say('dotori:sad', '…찍.');
    c.npc('dotori').hide();
    c.follow('dotori');
    c.give('p0', 3);
    c.set('m_button');
    c.quest('m0', 1);
    await c.sys(['렙업 버튼은 어디서나 누를 수 있다. 얻는 경험치는 그 장소의 [y]기운[/]에 따라 달라진다. 멀리 갈수록 기운이 세다.', '[y]B[/] 버튼이나 [y]메뉴[/]를 누르면 모험 수첩이 열린다. 능력치와 가방, 일지를 볼 수 있다.']);
  }
  async function stickRequest(c) {
    await c.say('gran', ['왔나. 레벨 12라… 제법 컸네.', '밖에 나가 보이 어떻드노. 탑은 봤나?']);
    const k = await c.ask(null, ['경험을 빼앗아 간다던데.', '보라색으로 빛나던데.']);
    if (k === 0) await c.say('gran', ['…맞다. 16년 전부터 그렇다. 렙업할 때 터지는 빛의 세 할을 탑이 먹는다.', '마을 아들이 레벨 10을 못 넘기는 것도 그 때문이다.']);
    else await c.say('gran', ['누가 렙업할 때마다 빛을 빨아들여서 그렇다.', '그 빛이 어디로 가는지는… 아무도 모른다 카더라.']);
    await c.say('gran', ['그건 그렇고. 이제 니도 칼 한 자루는 있어야제.', '북쪽 [y]속삭이는 숲[/] 가장 깊은 데 큰 나무가 있다. 그 근처 나뭇가지가 제일 단단하다. 하나 주워 온나. 할매가 목검 깎아 주꾸마.']);
    await c.say('dotori', '숲! 버섯들이 막 떠드는 그 숲? 찍… 나 거기 무서워.');
    await c.say('gran', '니는 레벨 9다 아이가.');
    c.quest('m1', 2);
  }
  async function swordScene(c) {
    await c.say('gran', '오, 가져왔나. 어데 보자.');
    c.take('stick');
    await c.fadeOut(400);
    c.sfx('equip'); await c.wait(0.3); c.sfx('equip'); await c.wait(0.3); c.sfx('equip');
    await c.fadeIn(400);
    c.give('w0');
    await c.say('gran', ['자, [y]목검[/]이다. 나무 정령이 준 가지라 그런가 결이 곱네.', '…숲 주인이 뭐라 카드노.']);
    await c.say('@', '하얀 빛의 아가씨가 16년 전에 그 숲을 지나갔대.');
    await c.emote('gran', '…');
    await c.say('gran:sad', '……그랬나.');
    await c.say('gran', ['마, 오늘은 늦었다. 광장에 가서 사람들한테 인사나 하고 온나.', '니 목검 자랑도 좀 하고.']);
    c.quest('m1', 4);
  }
  async function letterScene(c) {
    c.music('sad');
    await c.say('gran', ['……앉아 봐라.', '징수 기사단이 올 기다. 탑을 부순 아를 그냥 둘 리가 없다.']);
    await c.say('@', '할머니, 그 빛… 하얀 빛이 뭐야? 왜 탑이 나를 먹으려고 했어?');
    await c.say('gran:sad', ['……', '니 엄마 이야기는, 할매가 아직 몬 하겠다. 미안타.']);
    await c.say('gran', ['대신 남쪽 레드 마을 뒷산에 [y]은하수[/]라 카는 영감이 산다. 하늘만 50년 본 괴짜다.', '그 영감한테 이 편지 전해라. 니가 알아야 될 걸 알려 줄 끼다.']);
    c.give('letter_gran');
    await c.say('gran', '그라고 이것도.');
    c.give('x0');
    await c.say('gran', ['[y]새싹 목걸이[/]다. 할매가 처음 창 잡을 때 걸었던 기다.', '…니 엄마도 걸고 떠났었다.']);
    await c.say('dotori', '찍… 할머니, 우리 진짜 떠나는 거야?');
    await c.say('gran', ['떠나는 기 아이다. 크러 가는 기지.', '레벨 30 되믄 산길 기사들이 지나가게 해 줄 끼다. 오늘도 렙업. 알제?']);
    await c.say('@', '…내일도 렙업.');
    await c.say('gran:happy', '하모. 그래야 내 손주지.');
    c.quest('m1', 'done');
    c.music('home');
    await c.chapter('1장 끝', '흰빛', '할머니는 편지 봉투에 새싹 도장을 꾹 눌러 찍었다.');
    c.quest('m2', 0);
    c.respawnHere();
  }

  /* ───────── 그린 마을 ───────── */
  const village = W.gen({
    w: 34, h: 28, seed: 'green-village', ground: '.',
    alt: [[',', 0.74, 4], ['"', 0.8, 3]],
    obst: [['t', 3], ['T', 2]], dense: 0.82, sparse: 0.012, scale: 5,
    border: 'T', bt: 2, rough: 0.45,
    lakes: [{ x: 28.5, y: 23.5, rx: 3.3, ry: 2.1 }],
    clear: [[13, 11, 9, 5, ':'], [4, 3, 5, 5], [21, 5, 5, 5], [9, 15, 6, 5], [22, 16, 6, 5], [3, 18, 5, 5], [26, 2, 6, 9], [7, 9, 5, 3], [30, 11, 2, 2], [23, 21, 2, 3]],
    paths: [
      [[19, 0], [19, 11]], [[19, 15], [19, 27]], [[21, 13], [33, 13]], [[13, 13], [6, 13], [6, 7]],
      [[23, 9], [23, 13]], [[12, 19], [19, 19]], [[24, 20], [19, 20]], [[5, 22], [12, 22], [12, 19]], [[24, 20], [24, 22]], [[29, 10], [29, 13]],
    ],
    stamps: [
      { x: 27, y: 3, rows: ['|||||', '|,,,|', '|,,,|', '|,,,|', '|,,,|', '|,,,|', '||.||'] },
      { x: 9, y: 10, rows: ['y'] }, { x: 21, y: 11, rows: ['b'] }, { x: 13, y: 11, rows: ['f'] }, { x: 21, y: 15, rows: ['f'] },
      { x: 18, y: 5, rows: ['l'] }, { x: 20, y: 23, rows: ['l'] }, { x: 27, y: 12, rows: ['l'] }, { x: 8, y: 12, rows: ['l'] }, { x: 7, y: 8, rows: ['f'] },
    ],
  });
  W.map('green', {
    name: '그린 마을', sub: '새싹의 골짜기', region: 'green', area: 'green', theme: 'green', bg: '#2f6a2a', ki: 1, town: true,
    grid: village,
    patch: (s) => (s.flags.green_tower_broken ? [[16, 12, 'X'], [17, 13, 'X'], [16, 13, '^']] : []),
    builds: [
      { x: 4, y: 3, w: 5, h: 4, door: 2, roof: '#3a8a4a', wall: 'wood', chimney: true, to: 'home', tx: 6, ty: 7 },
      { x: 21, y: 5, w: 5, h: 4, door: 2, roof: '#e8a84a', wall: 'wood', icon: 'potion', to: 'green_shop', tx: 5, ty: 6 },
      { x: 9, y: 15, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'stone', icon: 'star', signColor: '#c8d0ff', to: 'green_rank', tx: 5, ty: 6 },
      { x: 22, y: 16, w: 6, h: 4, door: 2, roof: '#8a5a3a', wall: 'wood', icon: 'book', to: 'green_school', tx: 6, ty: 6 },
      { x: 3, y: 18, w: 5, h: 4, door: 2, roof: '#c8483a', wall: 'brick', to: 'green_chief', tx: 4, ty: 5 },
      { x: 16, y: 11, w: 2, h: 3, style: 'tower', when: (s) => !s.flags.green_tower_broken },
    ],
    edges: {
      up: { to: 'green_forest', tx: 18, ty: 35 },
      right: { to: 'green_field', tx: 0, ty: 13 },
      down: { to: 'red_path', tx: 10, ty: 0, req: { lv: 30 } },
    },
    objs: [
      W.sign(31, 12, ['그린 마을 — 새싹의 골짜기', '→ 새싹 들판   ↑ 속삭이는 숲   ↓ 붉은 산길 (레드 마을)']),
      W.sign(14, 10, ['[y]오늘도 렙업![/]', '그린 마을 광장. 징수탑 근처에서 뛰지 마시오. — 이장']),
      W.gate(19, 25, { lv: 30 }, '징수 기사단 초소: 「붉은 산길은 험하다. 레벨 30이 안 되는 모험가는 돌려보낸다.」', { style: 'light' }),
      W.spot(7, 9, 3),
      W.spot(30, 5, 10, true),
      { t: 'orbshine', orb: 'o_r1', x: 26, y: 22, need: (s) => G.engine.has(s, 'rod'), hint: '연못 물속에서 무언가 반짝인다. 손이 닿지 않는다. 낚싯대가 있다면…', talk: fishOrb },
      { t: 'sign', x: 16, y: 13, invisible: true, text: '…', talk: async (c) => { if (c.flag('green_tower_broken')) await c.say(null, '징수탑의 잔해다. 보랏빛 수정 조각이 흩어져 있다. 이제 아무 빛도 빨아들이지 않는다.'); else { await c.say(null, '징수탑 받침돌에 공고문이 붙어 있다.'); await c.book('b_notice'); } }, cond: (s) => !!s },
    ],
    towerTalk: async (c) => { await c.say(null, ['보랏빛 수정이 박힌 탑. [p]징수탑[/]이다.', '누군가 렙업할 때마다 수정이 희미하게 빛을 빨아들인다.']); await c.book('b_notice'); },
    npcs: [
      { id: 'ijang', x: 20, y: 14, dir: 'down', wander: 2, talk: ijangTalk },
      { id: 'bomi', x: 8, y: 10, dir: 'right', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_bomi == null) || s.quests.q_bomi === 1 ? '!' : null, talk: bomiTalk },
      { id: 'chul', x: 10, y: 10, dir: 'left', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_race == null ? '!' : null), talk: chulTalk },
      { id: 'dolsoe', x: 15, y: 13, dir: 'down', mark: (s) => (s.quests.q_lunch === 0 ? '!' : null), talk: dolsoeTalk },
      { id: 'park', x: 28, y: 10, dir: 'right', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_mole == null) || s.quests.q_mole === 1 ? '!' : null, talk: parkTalk },
      { id: 'slowpoke', x: 24, y: 22, dir: 'right', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_rod == null ? '?' : null), talk: slowTalk },
      { id: 'villager', x: 15, y: 17, dir: 'down', wander: 2, talk: W.chatter('villager', ['오늘도 렙업! …아, 인사를 받아 줘야지. 「내일도 렙업!」이라고.', '우리 애는 레벨 9에서 멈췄어. 탑이 선 뒤로 애들이 다 그래.', '밭일도 렙업이야. 나는 밭을 갈아서 레벨 41이 됐지. 탑이 없었으면 50은 됐을걸.']) },
      { id: 'oldwoman', x: 25, y: 11, dir: 'left', wander: 1, talk: W.chatter('oldwoman', ['방순이네 손주 아니냐. 많이 컸구나. 네 엄마를 똑 닮았어.', '옛날에 방순이가 창을 들고 다닐 때는 말이야, 초록 창이 지나가면 산적들이 알아서 길을 비켰단다.', '…어머, 내가 무슨 말을 했니? 잊어버리렴. 늙으면 헛소리가 늘어.']) },
      { id: 'kid', x: 24, y: 14, dir: 'left', wander: 2, talk: W.chatter('kid', ['형아 누나, 하얀 렙업 한다며? 콩순 아줌마가 온 동네에 말하고 다녔어!', '나도 크면 레드 마을 가 볼 거야. 거기는 떡볶이가 불처럼 맵대.']) },
    ],
    triggers: [
      { x: 13, y: 11, w: 9, h: 5, once: 'ev_tower', cond: (s) => s.quests.m1 === 4, run: towerEvent },
      { x: 18, y: 24, w: 3, h: 2, once: 'ev_south_tip', cond: (s) => s.lv < 30, run: async (c) => { await c.say('dotori', '찍, 저기 보라색 벽은 징수 기사단이 세운 거야. 레벨 30이 되기 전엔 못 지나가!'); } },
    ],
  });
  W.town({ map: 'green', x: 19, y: 16, name: '그린 마을', color: '#6ad86a', desc: '새싹의 골짜기. 할머니의 오두막이 있다.', hint: '모든 것이 시작된 곳' });

  async function fishOrb(c) {
    const s = c.s;
    if (s.orbs.o_r1) return;
    if (!G.engine.has(s, 'rod')) { await c.say(null, '연못 물속에서 무언가 반짝인다. 손이 닿지 않는다. 낚싯대가 있다면…'); return; }
    await c.say(null, '느림보 영감의 낚싯대를 드리웠다.');
    c.sfx('splash');
    await c.wait(0.8);
    await c.say(null, '……');
    await c.wait(0.6);
    await c.emote('@', '!');
    c.sfx('splash');
    await c.say(null, '묵직하다! 힘껏 당겼다!');
    await c.orb('o_r1');
    await c.say('dotori:surprise', '빨간 구슬이다! 16년 동안 연못 바닥에 있었던 거야? 찍!');
    c.quest('q_rod', 'done');
  }

  /* ── 마을 사람들 ── */
  async function ijangTalk(c) {
    const s = c.s;
    if (s.flags.green_tower_broken) {
      await c.run(W.chatter('ijang_after', [
        ['탑이 무너졌다니! 이건 큰일이… 아니, 경사가… 아니, 큰일이야!', '…나는 원래 처음부터 반대였네. 회의록에도 그렇게 적혀 있을걸.'],
        '기사단에 뭐라고 보고해야 할지 모르겠군. 「번개를 맞았다」고 할까, 「노후 시설」이라고 할까. 둘 다 할까.',
        '아이들이 레벨 10을 넘었어. 그것 하나만은… 누가 뭐래도 좋은 일이야. 이건 안 바꾼다네.',
      ]));
      return;
    }
    await c.run(W.chatter('ijang', [
      ['오, {n}! 생일 축하하네. 오늘부터 어른이군.', '어른이 되면 등급소에 가야지. 아니, 밥부터 먹어야지. 아니, 등급소부터…'],
      '징수탑 말인가? 그건… 대륙을 지키는 데 필요한… 아니, 필요 없는… 흠흠. 이장은 말을 아끼는 법이라네.',
      '마을 동쪽이 새싹 들판, 북쪽이 속삭이는 숲이네. 숲은… 가지 말게. 아니, 가도 되네. 조심만 하게.',
      '회의록은 우리 집에 있네. 궁금하면 봐도 돼. 아니, 보지 말게. 아니… 봐도 되네.',
    ]));
  }
  async function bomiTalk(c) {
    const s = c.s;
    const q = s.quests.q_bomi;
    if (s.flags.green_tower_broken && !s.flags.bomi_lv10) {
      c.set('bomi_lv10');
      await c.say('bomi:happy', ['{n} 언니 오빠! 나, 나 레벨 10 됐어! 1년 만에! 으아아앙!', '탑이 무너지니까 몸이 막 가벼워! 전설이 될 수 있을 것 같아!']);
      return;
    }
    if (q === 1) {
      await c.say('bomi:surprise', '정말? 대왕 슬라임을 이겼어? 슬라임 백 마리가 뭉친 그걸?');
      await c.say('bomi:happy', ['역시! 하얀 렙업은 다르구나!', '이거 줄게. 내 보물 1호야. 전설이 되면 돌려줘!']);
      c.give('clover');
      c.gold(120);
      c.quest('q_bomi', 'done');
      return;
    }
    if (q === 0) { await c.say('bomi', '대왕 슬라임은 숲 서쪽 빈터에 있어. 슬라임 백 마리가 뭉쳤대. 조심해!'); return; }
    if (s.quests.m0 === 'done' && q == null) {
      await c.say('bomi', ['나는 커서 [y]전설[/]이 될 거야! 매일 아침 허수아비를 백 번 때려!', '…근데 1년째 레벨 9야. 탑 때문이래.']);
      await c.say('bomi', ['언니 오빠는 하얀 렙업을 한다며? 그럼 부탁이 있어!', '속삭이는 숲에 [y]대왕 슬라임[/]이 산대. 그걸 쓰러뜨리는 걸 보면, 나도 전설이 될 수 있다고 믿을 수 있을 것 같아.']);
      c.quest('q_bomi', 0);
      return;
    }
    await c.say('bomi', '얍! 얍! …허수아비는 레벨이 안 오르나 봐. 백 년째 허수아비래.');
  }
  async function chulTalk(c) {
    const s = c.s;
    const q = s.quests.q_race;
    if (q === 'done') { await c.run(W.chatter('chul_after', ['흥. 다음엔 안 져. 손가락 운동 중이거든.', '우리 아빠가 징수 기사인 거 알아? …별로 자랑할 일은 아니지만.', '봄이가 레벨 10 됐다고 난리야. 나는 11이거든? 흥.'])); return; }
    if (s.quests.m0 !== 'done') { await c.say('chul', '흥, 아직 평민 등록도 안 했어? 난 작년에 했는데.'); return; }
    if (q == null) { await c.say('chul', ['흥, 하얀 렙업이 뭐 대수야? 중요한 건 [y]누르는 속도[/]야!', '나랑 대결하자! 10초 동안 렙업 버튼 누르기! 내 기록은 [y]45번[/]이야.']); c.quest('q_race', 0); }
    if (!(await c.yes('지금 대결할래?', 'chul', '한다!', '다음에'))) { await c.say('chul', '흥, 겁나는구나?'); return; }
    await c.say('chul', '준비됐지? 누르는 순간 시작이야!');
    const n = await c.clickRace(10);
    if (n > 45) {
      await c.say('chul:surprise', n + '번?! 말도 안 돼…');
      await c.say('chul', ['…흥. 인정. 이거 가져. 아빠가 준 건데 나는 안 써.']);
      c.give('p0', 5); c.gold(80);
      c.quest('q_race', 'done');
    } else {
      await c.say('chul:smug', n + '번? 흥, 아직 멀었네! 손목을 써, 손목을!');
    }
  }
  async function dolsoeTalk(c) {
    const s = c.s;
    if (s.quests.q_lunch === 0) {
      await c.say('dolsoe', '하아암… 경험세 납부는 저쪽 탑에… 응? 도시락?');
      c.take('lunch');
      await c.emote('dolsoe', '…');
      await c.say('dolsoe', ['……', '콩순이가…? 쪽지도 있네. 「밥은 먹고 다니소. 안 먹으면 집에 오지 마소.」', '…흠흠. 전해 줘서 고맙다. 가서… 잘 먹었다고 전해 줘. 아니, 그냥… 전해 줘.']);
      c.quest('q_lunch', 1);
      return;
    }
    if (s.flags.green_tower_broken) {
      await c.run(W.chatter('dolsoe_after', [
        ['보고서를 써야 하는데… 「탑이 스스로 흰빛을 먹으려다 배탈이 났다」고 쓰면 믿어 줄까.', '…농담이다. 사실대로 쓰면 너는 끌려간다. 그러니까 나는 「번개」라고 쓸 거다.'],
        '기사단에서 조사단이 올 거다. 너는 그 전에 떠나는 게 좋아. 이건 기사로서가 아니라… 콩순이 남편으로서 하는 말이다.',
      ]));
      return;
    }
    await c.run(W.chatter('dolsoe', [
      '하아암… 경험세 납부는 저 탑에 알아서들… 렙업만 하면 탑이 알아서 가져간다… 쿨…',
      ['나? 징수 기사 돌쇠다. 이 마을 담당이지.', '…이 일이 좋아서 하는 줄 아냐? 레드 마을 대장간에서 망치질하다가 기사가 됐어. 기사는 세금을 안 내거든.'],
      '탑이 거둔 빛은 천년성으로 간다더라. 그다음은 몰라. 나 같은 말단은 모르는 게 편해.',
    ]));
  }
  async function parkTalk(c) {
    const s = c.s;
    const q = s.quests.q_mole;
    if (q === 0) {
      const n = W.killsSince(s, 'mole', 'q_mole_base');
      if (n >= 5) { c.quest('q_mole', 1); }
      else { await c.say('park', '두더지 놈들은 새싹 들판 쪽에서 땅을 파고 넘어온다! 아직 ' + (5 - n) + '마리 남았어!'); return; }
    }
    if (s.quests.q_mole === 1) {
      await c.say('park:happy', ['뭐? 다섯 마리를? 크하하! 27년 만의 쾌거다!', '이걸로 3승 1,204패가 아니라 4승 1,204패다! 받아라, 올해 첫 감자 판 돈이다!']);
      c.gold(200); c.give('p0', 3);
      c.quest('q_mole', 'done');
      return;
    }
    if (q === 'done') { await c.say('park', '두더지 놈들이 복수를 다짐하는 소리가 들린다. 괜찮다. 27년 전쟁에 익숙하다.'); return; }
    if (s.quests.m0 !== 'done') { await c.say('park', '감자밭에 들어가지 마라! …아니, 두더지만 아니면 괜찮다.'); return; }
    await c.say('park:angry', ['이 원수 같은 두더지 놈들! 새싹 들판에서 땅굴을 파서 내 감자밭까지 넘어온다!', '27년 전쟁의 전적이 3승 1,204패다. 이대로는 안 된다!']);
    if (await c.yes('자네, 들판의 [y]감자밭 두더지[/] 다섯 마리만 혼내 줄 수 있겠나?', 'park', '맡겨 주세요', '나중에요')) {
      W.markKills(s, 'mole', 'q_mole_base');
      c.quest('q_mole', 0);
      await c.say('park', '고맙다! 들판 동쪽에 특히 많다!');
    }
  }
  async function slowTalk(c) {
    const s = c.s;
    const q = s.quests.q_rod;
    if (q === 'done') { await c.run(W.chatter('slow_after', ['……건졌구먼……. 16년…… 동안…… 매일…… 봤지……', '……이제…… 뭘…… 보나……. ……물고기라도…… 봐야겠구먼……'], 'slowpoke')); return; }
    if (q === 1) { await c.say('slowpoke', '……낚싯대는…… 천천히…… 돌려주게……. ……한…… 40년 뒤에……'); return; }
    if (q === 0) {
      if (G.engine.has(s, 'f0')) {
        c.take('f0');
        await c.say('slowpoke:happy', ['……오오……. 콩순이네…… 옥수수빵……', '……고맙구먼……. 이거…… 빌려 주지……. ……물고기는…… 안 잡히니…… 기대는…… 말게……']);
        c.give('rod');
        c.quest('q_rod', 1);
      } else await c.say('slowpoke', '……옥수수빵…… 하나면…… 좋겠는데…….');
      return;
    }
    if (s.quests.m0 !== 'done') { await c.say('slowpoke', '……쉿……. ……물고기가…… 듣네……'); return; }
    await c.say('slowpoke', ['……거기…… 연못 속에…… 반짝이는 거…… 보이나……', '……16년 전부터…… 저기 있었지……. ……건지면…… 끝나잖나……. ……그래서…… 안 건졌어……']);
    await c.say('slowpoke', ['……배가…… 고프구먼……. ……옥수수빵…… 하나…… 가져다주면……', '……낚싯대…… 빌려 주지…….']);
    c.quest('q_rod', 0);
  }

  /* ── 징수탑 사건 ── */
  async function towerEvent(c) {
    c.music('danger');
    c.shake(600, 3);
    await c.say(null, '우우우웅—. 징수탑이 떨리기 시작했다. 보랏빛 수정이 {n} 쪽을 향해 번쩍인다.');
    await c.npc('dolsoe').emote('!');
    await c.say('dolsoe:surprise', '뭐, 뭐야? 탑이 왜 이래? 이런 반응은 처음 보는데!');
    await c.say('dotori:surprise', '찍! {n}! 네 몸에서 빛이 빨려 나가고 있어!');
    c.flash('#b89aff', 500);
    c.light(40);
    await c.say(null, '몸 안의 흰빛이 실처럼 풀려 탑으로 빨려 들어간다. 탑의 수정이 점점 하얗게 물든다.');
    c.shake(900, 5);
    await c.say(null, '쩌저적—!\n탑이 흰빛을 감당하지 못하고 금이 갔다!');
    c.sfx('explode');
    c.flash('#ffffff', 900);
    await c.wait(0.6);
    await c.say('dolsoe:surprise', '물러서! 경비 골렘이 튀어나온다! 탑이 고장 나면 나오게 되어 있어!');
    c.spawn({ id: 'golem_npc', x: 17, y: 14, dir: 'down', look: { creature: 'drone', tint: '#8a7ab0' } });
    await c.npc('golem_npc').jump();
    await c.say(null, '「경험. 납부. 하시오. 흰빛. 전량. 압수.」');
    const win = await c.battle('golem0', { noFlee: true, music: 'boss' });
    c.despawn('golem_npc');
    if (!win) { c.unset('ev_tower'); return; }
    c.shake(1000, 6);
    c.sfx('explode');
    await c.say(null, '골렘이 쓰러지자 탑이 마지막 빛을 토해 내며 무너져 내렸다!');
    c.flash('#ffffff', 1200);
    c.set('green_tower_broken');
    c.set('m_green_golem');
    await c.warp('green', 19, 16, 'up', { instant: true, noEnter: true, keepMusic: true, noBanner: true });
    c.music('green');
    await c.narr(['무너진 탑에서 16년 동안 갇혀 있던 빛이 쏟아져 나와 마을 곳곳으로 흩어졌다.', '초록빛, 초록빛, 초록빛. 마을 여기저기서 작은 렙업의 빛이 터졌다.']);
    await c.say('bomi:happy', '언니 오빠아! 나 레벨이 올랐어! 레벨 10! 레벨 10이야아!');
    await c.say('ijang:surprise', '탑이… 탑이 무너졌어! 이건 큰일이… 아니, 경사가… 아니…!');
    await c.say('dolsoe', ['…다들 다친 사람은 없지.', '{n}, 나는 기사단에 보고서를 써야 한다. 「번개」라고 쓸 거다. 그러니까 너는… 할머니한테 가 봐.']);
    await c.say('dotori', '찍… {n}, 괜찮아? 탑이 왜 너를 먹으려고 했을까.');
    c.quest('m1', 5);
  }

  /* ───────── 마을 안쪽 ───────── */
  W.map('green_shop', {
    name: '초록 바구니 잡화점', region: 'green', area: 'green', theme: 'interior', bg: '#1a120c', ki: 1, music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [2, 7], put: [[1, 2, 'h'], [2, 2, 'h'], [3, 2, 'b'], [6, 2, 'h'], [7, 2, 'h'], [8, 2, 'p'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'b'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'green', 23, 9)],
    npcs: [{ id: 'kongsun', x: 4, y: 3, dir: 'down', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_lunch == null) || s.quests.q_lunch === 1 ? '!' : null, talk: kongsunTalk }],
  });
  async function kongsunTalk(c) {
    const s = c.s;
    if (s.quests.q_lunch === 1) {
      await c.say('kongsun:happy', ['그래서? 먹었대? 다 먹었대? 쪽지는? 쪽지 읽었대?', '어머어머, 「잘 먹었다고 전해 줘」라고 했어? 그 양반이? 어머어머!']);
      await c.say('kongsun', '고마워라. 이건 수고비! 옥수수빵은 서비스!');
      c.gold(100); c.give('f0', 2);
      c.quest('q_lunch', 'done');
    } else if (s.quests.m0 === 'done' && s.quests.q_lunch == null) {
      await c.say('kongsun', ['어머 {n}! 소문 들었어! 하얀 렙업이라며? 어머어머. 벌써 마을 절반이 알아. 나머지 절반은 내가 오늘 오후에 알릴 거고.', '참, 부탁 하나만 하자. 우리 집 양반, 그 광장에서 조는 기사 말이야. 도시락 좀 전해 줘.']);
      c.give('lunch');
      c.quest('q_lunch', 0);
      await c.say('kongsun', '내가 직접 가면 창피하다고 도망가거든. 기사가 도망을! 어머어머.');
    } else {
      await c.run(W.chatter('kongsun', [
        '어서 와! 초록 바구니 잡화점이야. 옥수수빵은 대륙 제일! 내가 그렇게 정했어.',
        '나무 장갑은 꼭 사. 렙업 버튼 누를 때 손이 덜 아프고, 경험치도 더 들어온대. 진짜야, 레드 마을 무두장이한테 들었어.',
        '방순 할머니 젊을 적 얘기 알아? …어머, 모르면 됐어. 내가 말했다고 하지 마.',
      ]));
    }
    await c.shop('green');
  }
  W.map('green_rank', {
    name: '그린 마을 등급소', region: 'green', area: 'green', theme: 'interior', bg: '#10141e', ki: 1, music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'h'], [7, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'green', 12, 19)],
    objs: [W.bookObj('b_rank', 8, 2), { t: 'sign', x: 1, y: 2, invisible: true, text: ['초대 챔피언 아우룸의 석상. 한 손을 앞으로 내밀고 있다.', '받침돌 글씨: 「스스로 걸어서 모은 자만이 오른다.」'] }],
    npcs: [{ id: 'clerk_g', x: 5, y: 3, dir: 'down', mark: (s) => (s.quests.m0 === 2 ? '!' : null), talk: clerkTalk }],
  });
  async function clerkTalk(c) {
    const s = c.s;
    if (s.quests.m0 !== 'done' && s.quests.m0 != null && s.lv < 5) { await c.say('clerk_g', ['등급소입니다. 평민 1차 등록은 [y]레벨 5[/]부터 가능합니다.', '또박또박 오시면 됩니다.']); return; }
    await c.say('clerk_g', '등급소입니다. 또박또박 심사해 드리겠습니다.');
    if (!s.flags.tip_rank) { s.flags.tip_rank = true; await c.say('clerk_g', ['등급을 올리면 렙업 버튼으로 얻는 경험치와 골드가 늘고, 전투 능력도 강해집니다.', '레벨과 골드가 모자라면 올릴 수 없습니다. 또박또박 모아 오세요.']); }
    await c.rank('clerk_g');
    if ((s.ranks.r1 || 0) >= 1 && !s.flags.reg_white) {
      c.set('reg_white');
      await c.say('clerk_g', ['자, 평민 1차 등록 서류입니다. 이름 {n}. 나이 열여섯. 출신 그린 마을. 렙업의 빛 색깔은…', '…흰색?']);
      await c.emote('clerk_g', '💧');
      await c.say('clerk_g', ['흰색은… 서식에 없는데요. 초록, 빨강, 파랑, 노랑, 보라, 그리고 「기타」.', '…「기타」에 또박또박 체크하겠습니다.']);
      await c.say('dotori', '찍! 기타라니! {n}은 기타가 아니야!');
      c.quest('m0', 'done');
      c.quest('m1', 0);
      await c.sys(['[y]1장 · 흰빛[/]이 시작되었다.', '머리 위에 [y]![/]가 뜬 사람은 부탁할 일이 있다. 부탁을 들어주면 골드와 물건을 받는다.']);
    }
  }
  W.map('green_school', {
    name: '새싹 서당', region: 'green', area: 'green', theme: 'interior', bg: '#1a120c', ki: 1, music: 'calm', banner: false,
    grid: W.room({ w: 12, h: 8, floor: '-', door: 6, win: [3, 8], put: [[1, 2, 'h'], [2, 2, 'h'], [9, 2, 'h'], [10, 2, 'h'], [3, 4, 'd'], [5, 4, 'd'], [7, 4, 'd'], [9, 4, 'd'], [3, 6, 'd'], [9, 6, 'd'], [5, 2, 'p']] }),
    warps: [W.exit(6, 7, 'green', 24, 20)],
    objs: [W.bookObj('b_chron1', 1, 2), W.bookObj('b_song', 10, 2)],
    npcs: [{ id: 'hunjang', x: 6, y: 3, dir: 'down', mark: (s) => (s.quests.m0 === 'done' && s.quests.q_study == null ? '!' : null), talk: hunjangTalk }],
  });
  const GREEN_BOOKS = ['b_album', 'b_herb', 'b_chron1', 'b_song', 'b_rank', 'b_minutes', 'b_notice', 'b_aurum_stone'];
  async function hunjangTalk(c) {
    const s = c.s;
    const q = s.quests.q_study;
    const read = GREEN_BOOKS.filter((b) => s.books[b]).length;
    if (q === 0 && read >= 5) {
      await c.say('hunjang:happy', ['허허, 다섯 권을 다 읽었느냐. 기특하구나.', '무엇을 읽었는가보다, 무엇이 적혀 있지 않았는가를 생각하거라. 역사는 빈칸에 숨느니라.']);
      c.exp(Math.round(G.data.totalExp(s.lv + 1) - s.exp + 5));
      c.gold(150);
      c.quest('q_study', 'done');
      return;
    }
    if (q === 0) { await c.say('hunjang', '그린 마을 곳곳에 책과 비석이 있느니라. 지금 ' + read + '개를 읽었구나. 다섯이면 되느니라.'); return; }
    if (q === 'done') {
      await c.run(W.chatter('hunjang_after', [
        ['아우룸은 흰빛으로 렙업했다고 연대기는 적고 있느니라. 천 년 동안 흰빛은 셋뿐이었다지.', '첫째가 아우룸이고… 나머지 둘은 연대기에 이름이 없느니라. 빈칸이지. 허허.'],
        '등급 제도는 원래 싸우지 말고 겨루라고 만든 것이니라. 그런데 16년 전부터는… 세금을 매기는 잣대가 되었지.',
        '「읽은 것과 믿는 것은 다르니라.」 이 늙은이가 평생 한 말은 이것 하나뿐이니라.',
      ]));
      return;
    }
    if (s.quests.m0 === 'done' && q == null) {
      await c.say('hunjang', ['허허, 방순이 손주로구나. 어른이 되었으니 숙제를 내 주마.', '그린 마을 곳곳의 [y]책과 비석을 다섯 개[/] 읽고 오너라. 모험가는 발만큼 눈도 부지런해야 하느니라.']);
      c.quest('q_study', 0);
      await c.sys('책장이나 비석 옆에서 반짝이는 것을 [y]A[/]로 살펴보면 [y]서재[/]에 모인다. 메뉴의 서재에서 다시 읽을 수 있다.');
      return;
    }
    await c.say('hunjang', '허허, 서당에 왔으면 책부터 보거라.');
  }
  W.map('green_chief', {
    name: '이장 댁', region: 'green', area: 'green', theme: 'interior', bg: '#1a120c', ki: 1, music: 'calm', banner: false,
    grid: W.room({ w: 9, h: 7, floor: '-', door: 4, win: [2, 6], put: [[1, 2, 'q'], [3, 2, 'd'], [6, 2, 'h'], [7, 2, 'h'], [1, 5, 'p'], [7, 5, 'b']] }),
    warps: [W.exit(4, 6, 'green', 5, 22)],
    objs: [W.bookObj('b_minutes', 3, 2)],
    npcs: [{ id: 'villager2', x: 5, y: 4, dir: 'down', talk: W.chatter('chief_wife', [
      '어머, 방순 언니네 손주로구나. 우리 양반은 광장에서 결정 못 하고 서성이고 있을 거야.',
      '회의록? 책상 위에 있어. 우리 양반 글씨는 알아보기 힘들 거야. 쓰다가 세 번씩 고쳐 쓰거든.',
      '16년 전 그 회의 날, 반대한 사람은 방순 언니 혼자였어. 다들 챔피언이 무서웠지. …나도.',
    ]) }],
  });

  /* ───────── 새싹 들판 ───────── */
  W.map('green_field', {
    name: '새싹 들판', sub: '그린 마을 동쪽', region: 'green', area: 'green_field', theme: 'green', bg: '#2f6a2a', ki: W.ki('green', 0.45), music: 'field', weather: 'petal',
    grid: W.gen({
      w: 40, h: 30, seed: 'sprout-field', ground: '.',
      alt: [[',', 0.6, 4], ['"', 0.78, 3]],
      obst: [['T', 3], ['t', 2], ['^', 1]], dense: 0.66, sparse: 0.02, scale: 6,
      border: 'T', bt: 2, rough: 0.5,
      lakes: [{ x: 27, y: 9, rx: 4, ry: 2.5 }],
      paths: [[[0, 13], [8, 13], [14, 16], [22, 16], [30, 20], [35, 22]], [[14, 16], [14, 6], [20, 4]], [[22, 16], [22, 25], [12, 26]], [[22, 12], [22, 16]]],
      bridge: '_',
      clear: [[18, 2, 6, 4], [33, 20, 5, 5], [9, 24, 6, 4]],
    }),
    edges: { left: { to: 'green', tx: 33, ty: 13 } },
    objs: [
      W.sign(2, 12, ['새싹 들판 — 슬라임 주의! 특히 말랑한 녀석.', '← 그린 마을']),
      W.spot(20, 3, 3), W.spot(35, 22, 3), W.spot(10, 25, 10, true),
      W.chest('gf1', 21, 2, 'p0', 3), W.goldChest('gf2', 36, 21, 150), W.chest('gf3', 13, 25, 'f0', 2),
    ],
    mons: { list: ['slime', 'slime', 'rabbit', 'bee', 'mole'], n: 8, area: [4, 3, 34, 25] },
    npcs: [{ id: 'merchant', x: 23, y: 15, dir: 'down', talk: async (c) => { await c.say('merchant', ['떠돌이 약장수라네. 들판 한가운데서 파는 약이 제일 비싸지. 발품 값이야.', '…농담일세. 마을이랑 값은 같아.']); await c.shop('green'); } }],
    enter: async (c) => {
      if (c.flag('tip_field')) return;
      c.set('tip_field');
      await c.say('dotori', ['찍! 들판이다! 저기 꼬물거리는 거 보여? 슬라임이야!', '몬스터한테 부딪히면 싸움이 시작돼. 싸움에서는 [y]렙업 버튼[/]을 연타해서 공격해!', '그리고 들판은 마을보다 [y]기운[/]이 세서, 여기서 버튼을 누르면 경험치가 더 많이 들어와!']);
    },
  });

  /* ───────── 속삭이는 숲 ───────── */
  W.map('green_forest', {
    name: '속삭이는 숲', sub: '그린 마을 북쪽', region: 'green', area: 'green_forest', theme: 'green', bg: '#1f4e22', ki: W.ki('green', 0.78), music: 'forest', weather: 'firefly', tint: 'rgba(10,40,20,0.16)',
    grid: W.gen({
      w: 36, h: 36, seed: 'whisper-forest', ground: '.',
      alt: [[',', 0.55, 4], ['"', 0.86, 3]],
      obst: [['T', 6], ['t', 2], ['M', 1]], dense: 0.5, sparse: 0.05, scale: 5,
      border: 'T', bt: 3, rough: 0.6,
      paths: [[[18, 35], [18, 28], [12, 24], [12, 16], [18, 12], [18, 7]], [[12, 20], [5, 20]], [[18, 12], [28, 12], [28, 20]]],
      clear: [[13, 3, 11, 6], [3, 18, 5, 5], [26, 18, 5, 4]],
      stamps: [{ x: 22, y: 5, rows: ['g'] }, { x: 14, y: 3, rows: ['M'] }, { x: 22, y: 3, rows: ['M'] }],
    }),
    edges: { down: { to: 'green', tx: 19, ty: 0 } },
    objs: [
      W.bookObj('b_aurum_stone', 22, 5),
      W.spot(6, 22, 3), W.spot(28, 20, 10, true),
      W.chest('gw1', 29, 19, 'p0', 5), W.chest('gw2', 4, 19, 'f0', 2),
      W.sign(18, 30, ['속삭이는 숲 — 버섯의 말을 믿지 마시오.', '(아래에 누군가 덧붙였다) 믿어도 됨. 다 사실임. — 버섯']),
    ],
    mons: { list: ['shroom', 'thorn', 'rabbit', 'bee', 'shroom'], n: 9, area: [3, 8, 30, 26] },
    fixed: [
      { mon: 'kingslime', x: 5, y: 20, flag: 'beat_kingslime', boss: true, after: async (c) => { if (c.s.quests.q_bomi === 0) { c.quest('q_bomi', 1); await c.say('dotori', '찍! 대왕 슬라임을 이겼어! 봄이한테 알려 주자!'); } } },
      { mon: 'treant', x: 18, y: 4, flag: 'beat_treant', boss: true, look: { creature: 'slime', tint: '#5aa84a' }, talk: treantTalk },
    ],
    enter: async (c) => {
      if (c.flag('tip_forest')) return;
      c.set('tip_forest');
      await c.say('dotori:worry', ['찍… 여긴 속삭이는 숲이야. 버섯들이 밤낮으로 수다를 떨어.', '귀 기울이면… 들려. 「흰빛이다」「흰빛이 왔다」…? 찍? 우리 얘기 하는 거야?']);
    },
  });
  async function treantTalk(c, mo) {
    const s = c.s;
    if (s.flags.beat_treant) return;
    await c.say(null, '거대한 나무가 삐걱거리며 몸을 돌렸다. 나무껍질 사이로 두 개의 눈이 뜨인다.');
    await c.say('treant', ['…흰빛… 흰빛의 아이로구나… 수다쟁이 버섯들이 말하더구나…', '16년 전에도… 흰빛이 이 숲을 지나갔지… 긴 머리의… 아가씨였어… 품에 아기를 안고…']);
    await c.emote('@', '!');
    await c.say('treant', ['그 아가씨는… 내 뿌리에 앉아… 아기에게 노래를 불러 주었지… 「오늘도 렙업, 내일도 렙업」…', '…나뭇가지가 필요하냐… 줄 수는 있다… 하지만 흰빛이 진짜인지… 확인해야겠구나…']);
    const win = await c.battle('treant', { noFlee: true });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_treant');
    await c.say('treant', ['…진짜로구나… 따뜻한 흰빛이야… 그 아가씨와… 똑같아…', '가져가거라… 내 가장 단단한 가지를… 그리고 이것도…']);
    c.give('stick');
    await c.orb('o_r2');
    await c.say('treant', ['흰빛의 아이야… 하나만 기억하렴…', '[p]탑은 빛을 먹는단다[/]… 그런데 너의 빛은… 너무 맛있어 보이는구나…']);
    await c.say('dotori:worry', '찍… 무슨 뜻이지?');
    if (s.quests.m1 === 2) c.quest('m1', 3);
  }

  /* ───────── 레벨 · 등급에 따른 이야기 ───────── */
  G.hooks.level.push((lv) => {
    const s = G.state;
    if (lv >= 5 && s.quests.m0 === 1) { G.main.setQuest('m0', 2); G.ui.toast('레벨 5! 마을의 [y]등급소[/]로 가자. 광장 서쪽 파란 지붕이다.', 'gold'); }
    if (lv >= 12 && s.quests.m1 === 0) { G.main.setQuest('m1', 1); G.ui.toast('할머니가 부르신다. 언덕 위 오두막으로 가 보자.', 'gold'); }
  });

  G.world.nodes.push({ region: 'green', label: '그린', x: 40, y: 128, color: '#6ad86a', maps: ['green', 'home', 'green_field', 'green_forest', 'green_shop', 'green_rank', 'green_school', 'green_chief'] });
  void U;
})();
