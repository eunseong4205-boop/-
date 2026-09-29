/* 7장 「눈과 기도」 — 설원길 · 화이트 마을 · 이리스 대성당 · 얼음 신전 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine;

  W.keyItem('snowball_trophy', '눈싸움 우승 깃발', '화이트 마을 아이들이 준 깃발. 삐뚤빼뚤한 글씨로 「우승」.');

  W.quest('m7', { main: true, name: '7장 · 눈과 기도', where: '화이트 마을', stages: [
    '[y]레벨 25000[/]과 [b]덕후 5차[/]가 되면 무지개 마을 동쪽 설원길로 화이트 마을에 가자.',
    '[y]이리스 대성당[/]에서 성녀 루미에를 만나자.',
    '루미에의 부탁대로 마을 북쪽 [y]얼음 신전[/]의 제단에서 기도하고 오자.',
    '대성당으로 돌아가 루미에에게 알리자.',
    '백은 기사 에델이 길을 막았다. 에델을 넘어서자. (보스 · 레벨 5만 부근)',
    '성녀 루미에에게 네 빛을 보여 주자. (강적 · 레벨 6만 부근)',
    '[y]레벨 60000[/]과 [b]덕후 15차[/]가 되면 화이트 마을 서쪽 잿빛 고개로 그레이 마을에 가자. 볼트가 탑을 만들었다.',
  ], done: '색이 빠진 땅으로 내려갔다.' });
  W.quest('q_snowball', { name: '눈싸움 대장', where: '화이트 마을', stages: ['아이들과 눈싸움! 10초 동안 눈덩이를 [y]110개[/] 던지자. (렙업 버튼 연타)'], done: '아이들은 눈밭에서 찾은 노란 구슬을 우승 상품으로 줬다.' });
  W.quest('q_patients', { name: '대성당의 환자들', where: '이리스 대성당', stages: ['대성당에 누운 빛바램병 환자 세 명에게 흰빛을 나눠 주자. (0/3)', '대성당에 누운 빛바램병 환자 세 명에게 흰빛을 나눠 주자. (1/3)', '대성당에 누운 빛바램병 환자 세 명에게 흰빛을 나눠 주자. (2/3)'], done: '세 사람의 머리칼에 색이 돌아왔다. 수녀들이 조용히 울었다.' });
  W.quest('q_yeti', { name: '엄마를 찾는 설인', where: '설원길', stages: ['몬스터에게서 [y]눈 결정[/] 10개를 모아 니베에게 가져가자. 아기 설인에게 엄마 눈사람을 만들어 준대.'], done: '눈사람 엄마가 생겼다. 아기 설인은 그 옆에서 잠들었다.' });

  W.book('b_prayer', { title: '성녀의 기도문', where: '이리스 대성당', author: '루미에', text:
    '여신 이리스여.\n오늘도 누군가 대신 아프게 하소서.\n그 대신 아픈 이가 저이게 하소서.\n\n' +
    '오늘도 누군가 대신 희생하게 하소서.\n그 대신 희생하는 이가 저이게 하소서.\n\n' +
    '…저이게 하지 않으신다면,\n그 희생을 사랑이라 부를 수 있는 마음을 제게 주소서.' });
  W.book('b_oath', { title: '백은 기사의 서약', where: '성기사단 숙소', author: '에델', text:
    '하나. 백은 기사는 성녀를 지킨다.\n둘. 백은 기사는 약한 자를 지킨다.\n셋. 둘이 부딪칠 때, 백은 기사는 자신의 투구를 벗고 스스로 판단한다.\n\n' +
    '(여백, 단정한 글씨) 셋째 조항은 아직 한 번도 쓴 적이 없소. 쓰는 날이 오지 않기를 바라오. — 에델' });
  W.book('b_ledger', { title: '대성당 환자 명부', where: '이리스 대성당', text:
    '983년 — 빛바램병 환자 3명\n986년 — 41명\n990년 — 320명\n995년 — 1,200명\n998년 — 4,100명\n\n' +
    '거의 모두 평민 등급. 경험세율 3할의 등급.\n\n(수녀의 메모) 성녀님은 한 명도 돌려보내지 않으셨다. 성녀님의 머리칼 끝이 조금씩 하얘지고 있다. 원래 금발이셨다.' });
  W.book('b_ice_altar', { title: '얼음 신전 비문', where: '얼음 신전', text:
    '「희생 없는 구원은 없다.」\n— 초대 성녀\n\n' +
    '그 아래, 누군가 얼음을 긁어 덧붙였다. 둥글고 작은 글씨.\n「나눔 없는 희생도 없다. — S」\n\n' +
    '다시 그 아래, 떨리는 글씨.\n「그럼 나는 16년 동안 무엇을 믿어 온 걸까요. — L」' });
  W.book('b_lumie_letter', { title: '부치지 못한 편지', where: '성녀의 방', author: '루미에', text:
    '세린에게.\n\n당신이 수정 속에 잠든 지 16년이 되었어요. 나는 매일 당신을 위해 기도해요. 당신의 희생이 헛되지 않도록.\n\n' +
    '카이론이 말했어요. 봉인이 풀리면 당신의 아이가 필요하다고. 흰빛의 그릇만이 흑점을 가둘 수 있으니까.\n나는 그것이 사랑이라고 믿기로 했어요. 당신이 그랬던 것처럼.\n\n' +
    '그런데 세린. 당신 아이의 얼굴을 봤어요. 당신과 똑같이 웃어요.\n\n나는 16년 동안 당신이 틀렸다고 믿고 싶었던 걸까요, 아니면 옳았다고 믿고 싶었던 걸까요.\n\n— 부치지 못한 채, 루미에' });

  /* ───────── 설원길 ───────── */
  W.map('snowfield', {
    name: '설원길', sub: '화이트 성지로 가는 길', region: 'white', area: 'snowfield', theme: 'white', bg: '#c8d6ea', ki: W.ki('white', 0.12), music: 'white', weather: 'snow',
    grid: W.gen({
      w: 40, h: 30, seed: 'snow-road', ground: '*', alt: [['.', 0.7, 5], ['i', 0.82, 4]],
      obst: [['P', 5], ['^', 2]], dense: 0.6, sparse: 0.04, scale: 5,
      border: 'P', bt: 2, rough: 0.5,
      paths: [[[0, 18], [10, 18], [18, 12], [28, 14], [39, 14]], [[18, 12], [18, 5]], [[10, 18], [10, 25]]],
      clear: [[14, 2, 8, 5], [6, 23, 7, 5]],
    }),
    edges: { left: { to: 'rainbow', tx: 37, ty: 15 }, right: { to: 'white', tx: 0, ty: 15 } },
    objs: [W.sign(3, 17, ['설원길 — 화이트 성지', '→ 화이트 마을 · 이리스 대성당']), W.spot(18, 4, 3), W.spot(9, 25, 3), W.spot(36, 4, 10, true), W.chest('sf1', 16, 3, 'p6', 5), W.goldChest('sf2', 8, 26, 2000000000)],
    mons: { list: ['snowwolf', 'yeti', 'icebat', 'snowman', 'snowwolf'], n: 12, area: [2, 2, 36, 26] },
    npcs: [{ id: 'snowflake', x: 11, y: 24, dir: 'down', mark: (s) => (s.quests.q_yeti == null || (s.quests.q_yeti === 0 && E.has(s, 'm12', 10)) ? '!' : null), talk: snowflakeYeti }],
    enter: async (c) => {
      if (c.flag('ch7')) return;
      c.set('ch7');
      c.quest('m6', 'done');
      await c.chapter('7장', '눈과 기도', '눈이 소리 없이 쌓였다. 멀리서 종소리가 울렸다. 누군가를 위해 기도하는 소리였다.');
      await c.say('dotori:worry', ['추워. 꼬리털이 얼 것 같아.', '저 멀리 하얀 첨탑이 보여. 이리스 대성당이야. 루미에 성녀가 기다린다고 했지.']);
      c.quest('m7', 1);
    },
  });
  async function snowflakeYeti(c) {
    const s = c.s;
    if (s.quests.q_yeti === 0 && E.has(s, 'm12', 10)) {
      c.take('m12', 10);
      await c.say('snowflake:happy', ['눈 결정 열 개! 이걸로 엄마 설인을 만들 수 있어!', '(뚝딱뚝딱) …짠! 아기 설인아, 엄마야!']);
      await c.say(null, '어딘가에서 커다란 아기 설인이 뒤뚱뒤뚱 걸어와 눈사람 옆에 앉았다. 그리고 잠들었다.');
      c.gold(2500000000); c.give('f6', 3);
      c.quest('q_yeti', 'done');
      return;
    }
    if (s.quests.q_yeti == null) {
      await c.say('snowflake', ['쉿! 저기 아기 설인 보여? 엄마를 잃어버렸대. 밤마다 울어.', '눈사람으로 엄마를 만들어 주고 싶은데, 반짝이는 [y]눈 결정[/]이 10개 필요해. 몬스터들이 떨어뜨려!']);
      c.quest('q_yeti', 0);
      return;
    }
    await c.say('snowflake', '눈 결정 열 개! 부탁해!');
  }

  /* ───────── 화이트 마을 ───────── */
  W.map('white', {
    name: '화이트 마을', sub: '눈과 기도의 성지', region: 'white', area: 'white', theme: 'white', bg: '#c8d6ea', ki: W.ki('white', 0.03), town: true, weather: 'snow',
    grid: W.gen({
      w: 36, h: 30, seed: 'white-holy', ground: '*', alt: [['.', 0.76, 5]],
      obst: [['P', 3], ['^', 1]], dense: 0.8, sparse: 0.015, scale: 5,
      border: 'P', bt: 2, rough: 0.5,
      paths: [[[0, 15], [18, 15]], [[18, 15], [18, 10]], [[18, 15], [30, 15], [30, 20]], [[18, 15], [18, 24], [8, 24], [8, 20]], [[18, 24], [18, 29]], [[27, 10], [27, 15]], [[9, 10], [9, 15]], [[18, 5], [18, 0]]],
      path: '=',
      clear: [[12, 2, 13, 8], [4, 6, 7, 5], [24, 6, 7, 5], [4, 17, 7, 5], [27, 17, 7, 4], [22, 21, 8, 6, '*']],
      stamps: [{ x: 16, y: 12, rows: ['l.l'] }, { x: 23, y: 22, rows: ['y'] }, { x: 28, y: 25, rows: ['y'] }, { x: 16, y: 20, rows: ['l'] }, { x: 20, y: 20, rows: ['l'] }],
    }),
    builds: [
      { x: 12, y: 2, w: 13, h: 7, door: 6, style: 'castle', roof: '#e8f0fa', wall: 'snow', icon: 'star', signColor: '#fff8d0', to: 'cathedral', tx: 9, ty: 14 },
      { x: 4, y: 6, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'snow', icon: 'star', signColor: '#c8d0ff', to: 'white_rank', tx: 5, ty: 6 },
      { x: 24, y: 6, w: 6, h: 4, door: 3, roof: '#9ab0c8', wall: 'snow', icon: 'potion', to: 'white_shop', tx: 5, ty: 6 },
      { x: 4, y: 17, w: 6, h: 4, door: 4, roof: '#c8483a', wall: 'snow', icon: 'bed', to: 'white_inn', tx: 5, ty: 6 },
      { x: 27, y: 17, w: 6, h: 3, door: 3, style: 'castle', roof: '#9aa4ae', wall: 'stone', icon: 'sword', to: 'knight_hall', tx: 5, ty: 5 },
      { x: 19, y: 11, w: 2, h: 3, style: 'tower' },
    ],
    edges: { left: { to: 'snowfield', tx: 39, ty: 14 }, up: { to: 'ice_temple', tx: 15, ty: 28 }, down: { to: 'ash_pass', tx: 20, ty: 0, req: { lv: 60000, rank: ['r3', 15] }, msg: '남쪽 잿빛 고개. 성기사: 「그 너머는 색이 빠진 땅이오. 덕후 15차는 되어야 버티오.」' } },
    objs: [
      W.sign(2, 14, ['화이트 마을 — 눈과 기도의 성지', '↑ 이리스 대성당 · 얼음 신전   ↓ 잿빛 고개 (그레이 지방)']),
      W.spot(25, 24, 3), W.spot(33, 3, 10, true),
      { t: 'sign', x: 19, y: 13, invisible: true, text: ['화이트 마을의 징수탑. 탑 둘레에 촛불이 켜져 있다. 사람들은 탑 앞에서도 기도한다.', '「이 빛이 하늘을 지키기를.」'] },
    ],
    npcs: [
      { id: 'snowflake', x: 24, y: 23, dir: 'right', mark: (s) => (s.flags.white_intro && s.quests.q_snowball == null ? '!' : null), talk: snowballTalk },
      { id: 'kid', x: 26, y: 24, dir: 'left', talk: W.chatter('w_kid', ['눈싸움 할래? 니베 누나는 한 번도 안 졌어!', '성녀님은 우리한테 사탕을 주셔. 근데 성녀님 머리가 요즘 하얘져.']) },
      { id: 'nun', x: 14, y: 15, dir: 'down', wander: 2, talk: W.chatter('w_nun', ['대성당은 누구에게나 열려 있어요. 빛바램병 환자들이 대륙 곳곳에서 와요.', '성녀님은 16년 동안 한 번도 쉬지 않으셨어요. 아픈 사람의 손을 잡고 기도하시다 그대로 잠드세요.', '에델 경은 성녀님의 기사예요. 투구를 벗은 얼굴을 본 사람이 없어요.']) },
      { id: 'guard', x: 22, y: 15, dir: 'down', look: G.chars.edel.look, speaker: 'guard', talk: W.chatter('w_guard', ['성기사단이오. 화이트 성지의 질서를 지키오.', '펭귄들이 자꾸 성기사단에 들어오겠다고 하오. 투구까지 쓰고 왔소. …곤란하오.']) },
    ],
    enter: async (c) => { if (!c.flag('white_intro')) { c.set('white_intro'); await c.say('dotori', ['찍… 조용하다. 다들 소곤소곤 말해.', '저기 제일 큰 하얀 건물이 대성당이야.']); } },
  });
  W.town({ map: 'white', x: 18, y: 17, name: '화이트 마을', color: '#e0ecff', desc: '눈과 기도의 성지. 이리스 대성당.', hint: '무지개 마을 동쪽 설원길 너머' });

  async function snowballTalk(c) {
    const s = c.s;
    if (s.quests.q_snowball === 'done') { await c.say('snowflake', '다음엔 안 봐줄 거야! …지난번에도 안 봐줬지만.'); return; }
    if (s.quests.q_snowball == null) {
      await c.say('snowflake', ['눈싸움 할래? 나 한 번도 진 적 없어!', '10초 동안 눈덩이 [y]110개[/]! 이기면 우리가 눈밭에서 찾은 보물 줄게!']);
      c.quest('q_snowball', 0);
    }
    if (!(await c.yes('눈싸움을 할까?', 'snowflake', '덤벼!', '다음에'))) return;
    const n = await c.clickRace(10);
    if (n >= 110) {
      await c.say('snowflake:surprise', [n + '개?! 눈밭이 다 날아갔어!', '…졌다. 처음으로 졌어! 약속대로 보물 줄게.']);
      c.give('snowball_trophy');
      await c.orb('o_y2');
      c.quest('q_snowball', 'done');
    } else await c.say('snowflake:happy', n + '개? 흥, 나는 백 개도 넘게 던졌거든! 다시 해!');
  }

  /* ── 이리스 대성당 ── */
  const pews = [];
  for (const y of [7, 9, 11]) for (const x of [3, 4, 5, 6, 12, 13, 14, 15]) pews.push([x, y, 'd']);
  W.map('cathedral', {
    name: '이리스 대성당', sub: '성녀의 기도', region: 'white', area: 'cathedral', theme: 'interior', bg: '#10141e', ki: W.ki('white', 0.05), music: 'white',
    grid: W.room({ w: 19, h: 16, floor: '-', door: 9, win: [3, 6, 12, 15], rug: [8, 3, 3, 12], put: pews.concat([[9, 2, 'y'], [1, 2, 'f'], [17, 2, 'f'], [1, 13, 'q'], [2, 13, 'q'], [16, 13, 'q'], [17, 13, 'q'], [1, 4, 'h'], [17, 4, 'h'], [4, 2, 'l'], [14, 2, 'l']]) }),
    warps: [W.exit(9, 15, 'white', 18, 9), { x: 18, y: 8, to: 'lumie_room', tx: 2, ty: 4, dir: 'right' }],
    patch: (s) => (s.flags.m_white_lumie ? [[18, 8, 'D']] : []),
    objs: [
      W.bookObj('b_prayer', 1, 4), W.bookObj('b_ledger', 17, 4),
      { t: 'sign', x: 9, y: 2, invisible: true, text: ['여신 이리스의 석상. 두 손을 모으고 있다. 석상의 발치에 촛불이 수백 개 켜져 있다.'] },
    ],
    npcs: [
      { id: 'lumie', x: 9, y: 4, dir: 'down', cond: (s) => !s.flags.lumie_fled, mark: (s) => (s.quests.m7 === 1 || s.quests.m7 === 3 || s.quests.m7 === 5 ? '!' : null), talk: lumieTalk },
      { id: 'edel', x: 11, y: 5, dir: 'down', cond: (s) => !s.flags.beat_edel_story || s.flags.m_white_lumie, mark: (s) => (s.quests.m7 === 4 ? '!' : null), talk: edelTalk },
      { id: 'pat1', x: 1, y: 12, dir: 'down', look: { hair: 'short', hc: '#d8d8d0', top: '#e8e0d0', bottom: '#c8c0b0', skin: '#f0e4d8' }, talk: patient },
      { id: 'pat2', x: 2, y: 12, dir: 'down', look: { hair: 'long', hc: '#e0e0d8', top: '#e8e0d0', bottom: '#c8c0b0', skin: '#f0e4d8' }, talk: patient },
      { id: 'pat3', x: 16, y: 12, dir: 'down', look: { hair: 'bald', hc: '#e0e0d8', top: '#e8e0d0', bottom: '#c8c0b0', skin: '#f0e4d8' }, talk: patient },
      { id: 'nun', x: 16, y: 10, dir: 'left', talk: W.chatter('cath_nun', ['환자분들은 조용히 쉬고 계세요. 흰빛… 혹시 흰빛이세요? 환자분들 손을 한 번만 잡아 주실래요?', '성녀님의 머리칼이 원래 금발이었다는 거 아세요? 환자를 한 명 고칠 때마다 조금씩 하얘지셨어요.']) },
    ],
  });
  async function patient(c, o) {
    const s = c.s;
    const key = 'healed_' + o.id;
    if (s.flags[key]) { await c.say(null, '환자가 편안하게 잠들어 있다. 머리칼에 옅은 색이 돌아왔다.'); return; }
    await c.say(null, ['침대에 누운 환자의 머리칼과 눈썹이 하얗게 바래 있다. 손끝이 조금 투명하다.', '빛바램병이다.']);
    if (!(await c.yes('손을 잡고 흰빛을 나눠 줄까?', null, '나눠 준다', '그만둔다'))) return;
    if (s.quests.q_patients == null) c.quest('q_patients', 0);
    await c.sys('[y]렙업 버튼을 15번[/] 눌러 흰빛을 나눠 주자.');
    await c.waitClick(15, (k) => { if (k % 5 === 0) { c.flash('#ffffff', 200); c.light(10); } });
    c.flash('#ffffff', 900);
    c.light(60);
    s.flags[key] = true;
    const n = ['pat1', 'pat2', 'pat3'].filter((p) => s.flags['healed_' + p]).length;
    await c.say(null, ['환자의 손끝에 온기가 돌았다. 하얗던 머리칼이 끝에서부터 갈색으로 물든다.', n < 3 ? '환자가 잠결에 중얼거렸다. 「…따뜻해…」' : '마지막 환자가 눈을 뜨고, 울면서 웃었다.']);
    if (n >= 3) { c.quest('q_patients', 'done'); c.set('healed_all'); await c.say('nun:sad', '…성녀님이 16년 동안 하지 못한 일을… 하루 만에.'); }
    else c.quest('q_patients', n);
  }
  async function lumieTalk(c) {
    const s = c.s;
    if (s.quests.m7 === 1) {
      c.music('white');
      await c.say('lumie', ['어서 와요, 흰빛의 아이. 이리스 대성당에 온 걸 환영해요.', '먼 길이었죠. 춥지 않았어요? 따뜻한 차를 준비할게요.']);
      await c.say('lumie', ['나는 루미에. 사천왕 하양의 자리에 있지만… 그냥 아픈 사람을 돌보는 사람이에요.', '당신 어머니, 세린의 친구였어요.']);
      await c.say('@', '거울 연못에서 봤어요. 엄마가… 흑점을 삼키는 걸.');
      await c.say('lumie:sad', ['…그랬군요. 그럼 알겠네요. 세린이 얼마나 용감했는지.', '세린의 희생 덕분에 우리는 16년을 살았어요. 나는 매일 그 희생에 감사하며 기도해요.']);
      await c.say('lumie', ['봉인은 천년제 날 밤 풀려요. 그때 누군가 다시 흑점을 막아야 해요.', '그 이야기는… 조금 뒤에 해요. 먼저 마을 북쪽 [y]얼음 신전[/]에 다녀와요. 제단에서 기도하면 마음이 맑아질 거예요.']);
      c.quest('m7', 2);
      return;
    }
    if (s.quests.m7 === 3) return lumieProposal(c);
    if (s.quests.m7 === 5) return lumieFight(c);
    if (s.flags.m_white_lumie) {
      await c.run(W.chatter('lumie_after', [
        '천년제 날 밤, 나도 무지개 마을에 갈게요. 이번엔 기도만 하지 않을 거예요.',
        ['볼트를 만나요. 탑을 설계한 사람이에요. 그는 은빛 왕국이 왜 무너졌는지 알고 있을 거예요.', '…그리고 16년 동안 그걸 모른 척했을 거예요. 나처럼.'],
        '환자들의 머리칼에 색이 돌아왔어요. 내가 16년 동안 기도해도 안 되던 일이에요. …고마워요.',
      ]));
      return;
    }
    await c.say('lumie', '얼음 신전은 마을 북쪽이에요. 조심히 다녀와요.');
  }
  async function lumieProposal(c) {
    const s = c.s;
    c.music('sad');
    await c.say('lumie', ['돌아왔군요. 기도는 했나요? …얼음 비문을 봤군요. 얼굴에 쓰여 있어요.', '앉아요. 이제 이야기할게요.']);
    await c.say('lumie', ['천년제 날 밤 봉인이 풀리면 흑점이 돌아와요. 흑점을 가둘 수 있는 건 흰빛의 그릇뿐이에요.', '세린의 그릇은 16년 동안 흑점을 품느라 닳았어요. 새 그릇이 필요해요.']);
    await c.say('@', '……나?');
    await c.say('lumie:sad', ['카이론의 계획이에요. 16년 동안 대륙의 빛을 모아 흑점을 없애려 했지만… 계산이 맞지 않으면,', '[r]세린의 아이를 새 봉인으로 삼는다.[/]']);
    await c.say('dotori:angry', '찍! 말도 안 돼! {n}은(는) 봉인 같은 게 아니야!');
    await c.say('lumie', ['나는 그것이 사랑이라고 믿어요. 한 사람이 모두를 위해 빛나는 것. 세린이 그랬던 것처럼.', '그러니 여기 머물러요. 대성당에서. 안전하게, 따뜻하게. 그날이 올 때까지 내가 지켜 줄게요.']);
    const k = await c.ask(null, ['싫어. 엄마는 그런 걸 원하지 않았어', '…조금 생각해 볼게']);
    if (k === 1) await c.say('lumie', ['생각할 시간은 충분해요. 대성당 방은 따뜻해요.', '…에델. 이 아이가 밖으로 나가지 않게 해 주세요. 춥잖아요.']);
    else { await c.say('@', '엄마 책에 그렇게 쓰여 있었어. 「빛을 한곳에 모으면 안 된다. 나눠 줘.」'); await c.say('lumie:sad', ['…세린다운 말이네요.', '그래도 나는 당신을 보낼 수 없어요. 에델. 이 아이를 지켜 주세요. 대성당 밖으로 나가지 못하게.']); }
    c.set('m_white_truth');
    c.quest('m7', 4);
  }
  async function edelTalk(c) {
    const s = c.s;
    if (s.quests.m7 === 4) {
      await c.say('edel', ['……미안하오. 성녀님의 명이오.', '그대를 대성당 밖으로 내보낼 수 없소. 그대를 지키는 것이 성녀님을 지키는 일이라 하셨소.']);
      await c.say('dotori:angry', '찍! 비켜! 우리는 갈 거야!');
      await c.say('edel', '그렇다면 백은 기사의 창을 넘어가시오. 한 수 청하오.');
      const win = await c.battle('edel', { noFlee: true, music: 'boss' });
      if (!win) { await c.say('edel', '…아직이오. 그대의 빛이 더 자라면 다시 오시오. 나는 여기 있겠소.'); return; }
      c.set('beat_edel_story');
      c.set('m_white_edel');
      await c.say('edel', ['……졌소.', '백은 기사의 서약 셋째 조항. 「성녀와 약한 자가 부딪칠 때, 백은 기사는 투구를 벗고 스스로 판단한다.」']);
      await c.say(null, '에델이 처음으로 투구를 벗었다. 투구 아래에는 은색 머리칼의 젊은 여인이 있었다. 한쪽 눈썹이 하얗게 바래 있었다.');
      await c.say('edel', ['어릴 적 나는 빛바램병으로 죽어 가고 있었소. 성녀님이 나를 살렸소. 그래서 성녀님의 모든 명을 따랐소.', '…그런데 오늘, 그대가 환자들에게 빛을 나누는 걸 보았소. 그 빛은 가두어서는 안 되는 빛이오.']);
      await c.say('edel', '성녀님께 가시오. 성녀님도… 사실은 누군가 자신을 막아 주길 기다리고 계셨소.');
      c.quest('m7', 5);
      return;
    }
    await c.run(W.chatter('edel', ['성녀님은 16년 동안 한 번도 울지 않으셨소. 우는 대신 기도하셨소.', '펭귄 기사들이 입단 시험을 보겠다고 하오. …생선을 창 대신 든 자를 기사로 받을 순 없소.', '그대의 빛은 따뜻하오. 성녀님의 빛과 닮았소. 다만 성녀님의 빛은 조금 춥소.'], 'edel'));
  }
  async function lumieFight(c) {
    await c.say('lumie:sad', ['에델이 투구를 벗었군요. 16년 만에.', '…그렇다면 보여 줘요. 당신의 빛이 내 기도보다 강한지. 희생 말고 다른 길이 정말 있는지.']);
    const win = await c.battle('lumie', { noFlee: true, music: 'boss2' });
    if (!win) { await c.say(null, '…정신을 차리니 대성당 침대였다. 루미에가 이마에 손을 얹고 기도하고 있었다. 「…아직이에요. 더 자라서 와요.」'); return; }
    c.music('mother');
    c.set('m_white_lumie');
    await c.say('lumie:sad', ['……', '…따뜻하네요. 당신 빛은. 세린이랑 똑같아.']);
    await c.say('lumie:sad', ['16년 동안 나는 세린의 희생을 사랑이라고 불렀어요. 그렇게 부르지 않으면 견딜 수 없었으니까.', '그런데 세린은… 희생을 원한 게 아니었죠. 나눔을 원했어요. 수정 속에서도 그렇게 말했을 거예요. 「오늘도 렙업」.']);
    await c.say('lumie', ['이걸 가져가요. [y]성녀의 묵주[/]. 내 기도를 담았어요. 이제 기도는 당신을 지키는 데 쓸게요. 가두는 데가 아니라.']);
    c.give('x6');
    await c.say('lumie', ['그레이 지방의 [y]볼트[/]를 만나요. 징수탑을 설계한 사람이에요. 은빛 왕국이 왜 무너졌는지, 그는 알고 있어요.', '…그리고 16년 동안 모른 척했을 거예요. 나처럼.']);
    await c.say('lumie', '내 방에 부치지 못한 편지가 있어요. 세린에게 쓴 거예요. 읽어도 돼요. 이제 부칠 수 있을 것 같아요. 당신한테.');
    c.quest('m7', 6);
  }
  W.map('lumie_room', {
    name: '성녀의 방', region: 'white', area: 'cathedral', theme: 'interior', bg: '#10141e', ki: W.ki('white', 0.05), music: 'mother', banner: false,
    grid: W.room({ w: 8, h: 7, floor: '-', door: null, win: [3, 5], put: [[1, 2, 'q'], [6, 2, 'd'], [6, 5, 'f']] }).map((r, y) => (y === 4 ? 'D' + r.slice(1) : r)),
    warps: [{ x: 0, y: 4, to: 'cathedral', tx: 17, ty: 8, dir: 'left' }],
    objs: [W.bookObj('b_lumie_letter', 6, 2)],
  });
  W.map('knight_hall', {
    name: '성기사단 숙소', region: 'white', area: 'white', theme: 'castle', bg: '#10141e', ki: W.ki('white', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 7, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [4, 2, 'h'], [1, 5, 'b'], [8, 5, 'b']] }),
    warps: [W.exit(5, 6, 'white', 30, 20)],
    objs: [W.bookObj('b_oath', 4, 2)],
    npcs: [{ id: 'guard', x: 6, y: 4, dir: 'down', look: G.chars.edel.look, talk: W.chatter('hall_guard', ['성기사단 숙소요. 에델 경의 침대는 늘 반듯하오. 누워 자는 걸 본 적이 없소.', '서약서 셋째 조항은 아무도 써 본 적이 없소. 쓰면 기사단을 떠나야 한다는 소문도 있소.'], 'guard') }],
  });
  W.map('white_rank', {
    name: '화이트 마을 등급소', region: 'white', area: 'white', theme: 'interior', bg: '#10141e', ki: W.ki('white', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'l'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'white', 7, 10)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 두 손을 모으고 기도하고 있다.', '화이트 사람들은 아우룸이 성자였다고 믿는다.'] }],
    npcs: [W.clerk('clerk_w', 5, 3, { hello: '(속삭이며) …등급소입니다. …조용히 심사하겠습니다.', bye: '(속삭이며) …가세요.' })],
  });
  W.map('white_shop', {
    name: '성당 보급소', region: 'white', area: 'white', theme: 'interior', bg: '#10141e', ki: W.ki('white', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [2, 7], put: [[1, 2, 'h'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'b']] }),
    warps: [W.exit(5, 7, 'white', 27, 10)],
    npcs: [W.keeper('nun', 'white', 4, 3, '성당 보급소예요. 성수와 눈꽃 빵이 있어요. 수익금은 전부 환자분들을 위해 써요.')],
  });
  W.map('white_inn', {
    name: '눈꽃 여관', region: 'white', area: 'white', theme: 'interior', bg: '#10141e', ki: W.ki('white', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [4, 2, 'L'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'white', 8, 21)],
    examine: (x, y, ch) => (ch === 'L' ? '벽난로 불이 탁탁 튄다. 설원을 건너온 몸이 녹는다.' : null),
    npcs: [W.innkeeper('innkeeper', 5, 4, 0, '눈꽃 여관이에요. 벽난로 옆 자리가 비었어요. 푹 쉬어 가요.')],
  });

  /* ───────── 얼음 신전 ───────── */
  W.map('ice_temple', {
    name: '얼음 신전', sub: '기도의 제단', region: 'white', area: 'ice_temple', theme: 'white', bg: '#8ab0d0', ki: W.ki('white', 0.8), music: 'white', weather: 'snow', dark: 110, darkColor: 'rgba(20,30,60,0.55)',
    grid: W.gen({
      w: 30, h: 30, seed: 'ice-temple', ground: 'i', alt: [['*', 0.66, 4]],
      obst: [['@', 4], ['P', 1], ['^', 2]], dense: 0.55, sparse: 0.05, scale: 4,
      border: '@', bt: 2, rough: 0.6,
      paths: [[[15, 29], [15, 22], [8, 18], [8, 10], [15, 6], [22, 10], [22, 18], [15, 22]], [[15, 6], [15, 3]]], path: '*',
      clear: [[11, 2, 9, 5, 'i']],
      stamps: [{ x: 14, y: 2, rows: ['y.y'] }],
    }),
    edges: { down: { to: 'white', tx: 18, ty: 0 } },
    objs: [
      W.bookObj('b_ice_altar', 14, 2), { t: 'orbshine', orb: 'o_y3', x: 15, y: 3, need: (s) => s.quests.m7 != null && s.quests.m7 >= 2, hint: '제단 위 얼음 속에 노란 구슬이 박혀 있다.', talk: altar },
      W.spot(8, 12, 3), W.spot(22, 16, 3), W.spot(3, 26, 10, true), W.chest('it1', 12, 3, 'p6', 5), W.goldChest('it2', 25, 25, 4000000000),
    ],
    mons: { list: ['icespirit', 'penguin', 'icebat', 'snowman', 'penguin'], n: 12, area: [2, 6, 26, 22] },
  });
  async function altar(c) {
    const s = c.s;
    if (s.quests.m7 == null || s.quests.m7 < 2) { await c.say(null, '얼음 제단이다. 누군가 기도한 흔적이 서리처럼 남아 있다.'); return; }
    if (!s.orbs.o_y3) {
      await c.say(null, ['제단 앞에 무릎을 꿇었다. 얼음 속 노란 구슬이 흰빛에 반응해 따뜻해진다.', '얼음이 녹고, 구슬이 손바닥 위로 굴러 떨어졌다.']);
      await c.orb('o_y3');
      await c.say(null, '제단 옆 비문이 눈에 들어온다. 「희생 없는 구원은 없다.」 그 아래 누군가 긁어 쓴 둥근 글씨…');
      G.main.unlockBook('b_ice_altar');
      await G.ui.readBook('b_ice_altar');
      await c.say('dotori', '…「S」. 엄마 글씨야. 서재에서 본 글씨랑 똑같아.');
      if (s.quests.m7 === 2) c.quest('m7', 3);
      return;
    }
    await c.say(null, '얼음 제단. 비문의 세 글씨가 나란히 새겨져 있다. 초대 성녀, S, 그리고 L.');
  }

  /* ───────── 화이트의 결: 마지막 단계의 아이 · 눈꽃 약초 · 소품 · 혼잣말 · 곁의 이야기 ───────── */
  W.keyItem('snow_herb', '눈꽃 약초', '얼음 신전 틈에 핀 하얀 꽃. 줄기에 종이가 묶여 있다. 「빛바램병 마지막 단계에. 달여서 한 모금. — S, 982」');
  // 16년 전 세린이 얼음 틈에 심어 둔 약초 (신전 가장 깊은 서쪽 구석)
  W.addObjs('ice_temple', [{ t: 'pickup', id: 'snowherb', x: 3, y: 5, item: 'snow_herb', c: '#e8f4ff', text: '얼음 틈에 하얀 꽃이 피어 있다. 줄기에 빛바랜 종이가 묶여 있다. 「빛바램병 마지막 단계에. 달여서 한 모금. — S, 982」', after: async (c) => { await c.say('dotori:surprise', '찍…! S. 엄마야. 16년 전에 여기 심어 놓고 간 거야. 누가 필요할 줄 알고.'); } }]);
  async function patientChild(c) {
    c.set('patient_arrived');
    c.music('sad');
    c.spawn({ id: 'hayan', x: 9, y: 11, dir: 'up', look: { hair: 'pony', hc: '#f4f4f8', top: '#e8e0d0', bottom: '#c8c0b0', skin: '#f4f0ec' } });
    await c.narr(['대성당 문이 벌컥 열렸다. 수녀 둘이 들것을 들고 뛰어 들어왔다.', '들것 위의 아이는 대여섯 살쯤. 머리칼은 눈처럼 하얗고, 손가락 끝이 유리처럼 비친다. 숨소리가 거의 들리지 않는다.']);
    await c.say('nun', ['성녀님! 설원길에서 쓰러진 아이예요. 이름은 하얀이래요. 엄마가 업고 사흘을 걸었대요.', '…엄마는 대성당 계단에서 쓰러졌어요.']);
    await c.say('lumie:sad', ['……마지막 단계네요. 몸이 투명해지기 시작했어요.', '이 단계는 손을 잡고 나누는 걸로는 안 돼요. 누군가의 빛이 통째로 들어가야 해요. 그 사람의 빛이 바래요.']);
    await c.say('lumie', ['제가 할게요. 16년 동안 해 온 일이에요. 머리칼이 조금 더 하얘질 뿐이에요.', '…조금 더.']);
    await c.say('edel', '성녀님. 지난달에도 그러셨소. 지난주에도. 이번엔 머리칼이 아니라 숨이 하얘질 거요.');
    const opts = [['own', '내 빛을 나누겠어요.'], ['lumie', '…성녀님께 맡긴다.']];
    if (E.has(c.s, 'snow_herb')) opts.unshift(['herb', '[y]얼음 신전의 눈꽃 약초를 달인다[/]']);
    const k = await c.ask('하얀의 마지막 숨', opts.map((o) => o[1]));
    const id = opts[k][0];
    if (id === 'herb') {
      c.take('snow_herb');
      await c.narr(['수녀가 약초를 달였다. 김이 오르자 대성당 안에 겨울 아침 냄새가 퍼졌다.', '한 모금. 아이의 손가락 끝에서 투명함이 물러났다. 두 모금. 하얀 머리칼 끝이 연한 갈색으로 물들었다.']);
      await c.say('lumie:surprise', ['……약초로? 빛을 쓰지 않고?', '얼음 신전에 16년 동안 다녔는데… 저는 한 번도 그 틈을 들여다보지 않았어요. 기도만 했어요.']);
      await c.say('lumie:sad', '세린. 당신은 희생 말고 다른 걸 심어 두고 갔군요. 누가 찾아 주길 바라면서.');
      c.decide('patient', 'herb', '세린이 남긴 눈꽃 약초로 하얀을 살렸다');
      c.bond('lumie', 2);
    } else if (id === 'own') {
      await c.sys('하얀의 손을 두 손으로 감싸고 [y]렙업 버튼을 40번[/] 누르자. 내 빛이 통째로 흘러간다.');
      await c.waitClick(40, (n) => { if (n % 8 === 0) { c.flash('#ffffff', 220); c.light(12); } });
      c.flash('#ffffff', 1400);
      await c.narr(['손바닥에서 빛이 빠져나갔다. 강물처럼. 팔이 차가워지고, 시야 가장자리가 하얗게 바랬다.', '아이가 숨을 크게 들이쉬었다. 그리고 울었다. 살아 있는 아이의 우는 소리였다.']);
      await c.say('dotori:worry', '{n}…! 너 머리… 앞머리 한 가닥이 하얘졌어.');
      c.s.buffs.push({ id: 'faded', fx: { exp: -0.3 }, until: c.s.t + 600 });
      c.set('hero_streak');
      await c.sys('[r]빛바램의 여운[/] — 10분 동안 경험치 -30%. 앞머리 한 가닥은 돌아오지 않았다.');
      await c.say('lumie:sad', ['……당신도 결국 스스로를 내주는군요. 세린처럼.', '…아니에요. 세린이랑은 달라요. 당신은 나눠 준 뒤에도 서 있잖아요. 가진 걸 전부가 아니라, 필요한 만큼만.']);
      c.decide('patient', 'own', '내 빛을 통째로 나누어 하얀을 살렸다');
      c.bond('lumie', 1);
    } else {
      await c.narr(['루미에가 아이의 가슴에 손을 얹었다. 금빛이었을 머리칼이 뿌리부터 끝까지, 눈 한 번 깜빡이는 사이에 하얘졌다.', '아이는 살았다. 루미에는 그 자리에 무릎을 꿇은 채 한참 일어나지 못했다. 에델이 투구 속에서 무언가를 삼켰다.']);
      await c.say('lumie', ['…괜찮아요. 이게 제 일이에요. 한 사람이 모두를 위해 빛나는 것.', '당신이 맡겨 줘서… 기뻐요. 정말로.']);
      await c.say('edel', '……');
      c.decide('patient', 'lumie', '하얀의 목숨을 성녀 루미에에게 맡겼다');
      c.bond('edel', -1);
    }
    await c.say('nun', '…하얀이 웃어요. 엄마를 찾아요. 계단에서 쓰러진 엄마도 깨어났대요.');
    c.despawn('hayan');
    c.music('white');
  }
  G.hooks.enter.push((id) => {
    const s = G.state;
    if (id === 'cathedral' && s.quests.m7 === 3 && !s.flags.patient_arrived && !G.script.running) G.script.run(patientChild);
  });
  G.chars.hayan = Object.assign({}, G.chars.kid || {}, { id: 'hayan', name: '하얀', title: '설원에서 온 아이' });

  // 새벽단을 고발했다면: 붙잡힌 레아가 성기사단 숙소에
  W.addNpcs('knight_hall', [{ id: 'lea', x: 2, y: 4, dir: 'right', cond: (s) => s.flags.d_festival === 'warn' && !s.flags.m_white_edel, talk: async (c) => {
    if (!c.flag('lea_cell')) {
      c.set('lea_cell');
      await c.say('lea', ['…왔네. 구경하러? 아니면 확인하러?', '원망 안 해. 네 계산이 그랬던 거잖아. 나도 16년 동안 내 계산대로 살았어.']);
      const k = await c.ask(null, ['아무도 다치지 않길 바랐어.', '당신 방식은 카이론이랑 똑같았어.']);
      if (k === 0) await c.say('lea', ['…알아. 그래서 더 화가 나. 나도 그걸 바랐거든.', '바라기만 하면 16년이 가. 그래서 폭약을 샀던 거야.']);
      else { await c.say('lea', ['……', '…그 말, 루드가 할 줄 알았는데 네가 하는구나.', '그래. 똑같았어. 「계산상으로는」. 나는 카이론을 미워하면서 카이론처럼 말했어.']); c.bond('lea', 1); }
      return;
    }
    await c.run(W.chatter('lea_cell', ['에델이라는 기사, 매일 밥을 직접 가져와. 투구는 안 벗고.', '루드는 면회를 안 와. …숫자로 세고 있겠지. 누나를 또 잃은 날을.'], 'lea'));
  } }]);
  W.wrapNpc('cathedral', 'edel', (s) => s.flags.m_white_edel && s.flags.d_festival === 'warn' && !s.flags.edel_freed_lea, async (c, n, orig) => {
    c.set('edel_freed_lea');
    await c.say('edel', ['숙소에 붙잡아 둔 새벽단 단장 말이오. 오늘 아침 풀어 주었소. 셋째 조항이오.', '탑을 부수려던 자를 가두는 것이 옳은지, 나는 이제 모르겠소. 모를 때는 문을 여는 쪽을 택하겠소.']);
    await orig(c, n);
  });

  W.addObjs('white', [
    W.prop('fire', 17, 17, '광장의 모닥불. 대성당에서 나온 수녀들이 환자 가족에게 수프를 나눠 준다.'),
    W.prop('bench', 13, 20),
    W.prop('board', 21, 16, (s) => ['대성당 게시판. 「빛바램병 환자 가족 쉼터 — 눈꽃 여관 2층」', s.flags.d_patient === 'lumie' ? '「성녀님께서 당분간 치료를 쉬십니다. 기도해 주십시오.」' : s.flags.healed_all ? '「대성당 환자 세 분, 색이 돌아옴! 흰빛의 손님께 감사를.」' : '「올해 환자 4,100명. 성녀님은 한 분도 돌려보내지 않으셨습니다.」']),
    W.prop('hole', 30, 25, '눈밭 한가운데 얼음 구멍. 아이들이 뚫어 놓은 모양이다. 물이 검푸르다.', { pool: 'white' }),
  ]);
  W.addObjs('snowfield', [W.prop('fire', 17, 5, '설원 순례자들의 모닥불 자리. 돌 위에 누군가 두고 간 털장갑 한 짝.'), W.prop('hole', 31, 16, '얼음 구멍. 설원을 건너는 순례자들이 여기서 빙어를 낚아 끼니를 때운다.', { pool: 'white' })]);
  W.addObjs('cathedral', [W.look(9, 13, (s) => (s.flags.d_patient ? '하얀이 누웠던 들것 자국이 바닥에 남아 있다. 수녀가 그 자리를 닦지 않고 두었다.' : '대성당 바닥. 수백 명이 무릎 꿇은 자리가 반들반들하게 닳았다.'), { solid: false })]);
  W.barks('white', { snowflake: ['덤벼!', '한 번도 안 졌어!'], kid: ['눈싸움!'], nun: ['쉿…', '기도해요.'], guard: ['질서를 지키오.', '펭귄은 곤란하오.'] });
  W.barks('cathedral', { lumie: (s) => (s.flags.m_white_lumie ? ['…따뜻하네요.'] : ['여신이여…', '괜찮아요.']), edel: ['……'], nun: ['쉿.'], pat1: ['…춥다.'], pat3: ['…빛이…'] });

  /* 토리아와의 이야기 (7장) */
  G.story.talks.push(
    { id: 'w_cold', map: 'snowfield', run: async (c) => {
      await c.say('dotori', ['…목도리 속에 들어가도 돼? 꼬리만 밖에 내놓을게.', '(목도리 안에서) …따뜻하다. 네 목에서 흰빛 냄새 나. 햇볕 냄새 같은 거.']);
      c.bond('dotori', 1);
    } },
    { id: 'w_seal', when: (s) => !!s.flags.m_white_truth, pri: 5, run: async (c) => {
      await c.say('dotori:angry', ['새 봉인이라니. 너를 수정 속에 넣는다는 거잖아. 엄마처럼.', '…나 그거 허락 못 해. 다람쥐가 허락하고 말고가 어딨냐고 하겠지만. 못 해.']);
      const k = await c.ask(null, ['나도 싫어.', '…다른 방법이 없으면?', '엄마는 왜 그걸 골랐을까.']);
      if (k === 0) await c.say('dotori', '…응. 싫은 거 싫다고 해도 돼. 너 그런 말 잘 안 하잖아.');
      else if (k === 1) { await c.say('dotori:sad', ['……', '그럼 방법을 만들어. 엄마가 숙제라고 했잖아. 너 숙제 늘 늦게 했어도 결국 했잖아.']); c.bond('dotori', 1); }
      else await c.say('dotori', ['…나눌 사람도, 시간도 없었대. 엄마 노트에 그렇게 써 있었다며.', '너한테는 있어. 할머니, 나, 롤로 아저씨, 루드 형… 벌써 이만큼.']);
    } },
    { id: 'w_patient', when: (s) => !!s.flags.d_patient, run: async (c) => {
      const d = c.s.flags.d_patient;
      if (d === 'own') await c.say('dotori', ['앞머리. 하얀 거. 아파?', '…안 아프다고 하지 마. 너 아플 때 코 찡긋하는 거 알아.']);
      else if (d === 'lumie') await c.say('dotori:sad', ['성녀님 머리 봤어? 한순간에 하얘졌어.', '성녀님은 기쁘다고 했어. 근데 에델 아저씨… 아니, 언니는 투구 속에서 울었을 거야.']);
      else await c.say('dotori:happy', ['엄마가 16년 전에 심어 둔 꽃이 하얀이를 살렸어.', '엄마는 희생만 한 게 아니었어. 이런 것도 했어. 아무도 모르게.']);
    } },
  );
  /* 쉬는 밤 (7장) */
  G.story.nights.push(
    { id: 'w_run', when: (s) => !!s.flags.m_white_truth && !s.flags.m_white_lumie, intro: '눈꽃 여관. 벽난로 불이 작아졌다. 창밖으로 성기사의 횃불이 오간다. 여관을 지키고 있다.', run: async (c) => {
      await c.say('dotori', ['{n}. 도망가자.', '지금. 창문으로. 나 창문 여는 거 잘해. 설원 건너면 아무도 못 찾아.']);
      const k = await c.ask(null, ['도망 안 가.', '…도망가고 싶어.']);
      if (k === 0) await c.say('dotori', ['…그럴 줄 알았어. 그냥 한번 말해 본 거야.', '말해 봐야 네가 안 간다는 걸 내가 확인하니까. 확인하면 나도 안 무서우니까.']);
      else { await c.say('dotori:sad', ['……', '…처음 들었다. 네가 그런 말 하는 거.', '괜찮아. 도망가고 싶은 거랑 도망가는 거는 달라. 할머니가 그랬어. 할머니도 983년에 도망가고 싶었대.']); c.bond('dotori', 2); c.set('hero_afraid'); }
    } },
  );

  G.world.nodes.push({ region: 'white', label: '화이트', x: 138, y: 52, color: '#e0ecff', maps: ['white', 'snowfield', 'ice_temple', 'cathedral', 'lumie_room', 'knight_hall', 'white_rank', 'white_shop', 'white_inn'] });
})();
