/* 12장 「무한의 그릇」 — 아스트라 착륙지 · 역대 챔피언의 요새 · 봉인의 제단 · 천년제 밤 (에필로그) */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine, D = G.data;

  W.keyItem('serin_glove', '세린의 장갑', '엄마가 끼던 낡은 흰 장갑. 손끝이 닳아 있다. 버튼을 백만 번쯤 누른 손.');

  W.quest('m12', { main: true, name: '12장 · 무한의 그릇', where: '황금별 아스트라', stages: [
    '황금빛 수정의 땅을 지나 북쪽 [y]역대 챔피언의 요새[/]로 가자.',
    '요새 가장 깊은 곳, [y]봉인의 제단[/]으로. 문은 [p]전설 40차[/]와 레벨 85만의 그릇만 받아들인다.',
    '챔피언 카이론과 마주하자.',
    '흑점을 끝내자.',
  ], done: '흩어진 빛은 별이 되었다.' });
  W.quest('m13', { main: true, name: '에필로그 · 내일도 렙업', where: '무지개 마을', stages: ['천년제 밤. 모두가 무지개 마을에 모였다. 한 사람씩 인사를 나누자. 할머니와 엄마가 무지개 샘 앞에서 기다린다.'], done: '오늘도 렙업. 내일도 렙업.' });

  W.book('b_champions', { title: '역대 챔피언의 비석들', where: '역대 챔피언의 요새', text:
    '요새의 복도를 따라 비석이 늘어서 있다.\n\n「1대 아우룸 — 흰빛. 버튼을 남기다.」\n「2대 … 」(수백 개의 이름)\n「58대 웃음의 필로 — 한 번도 지지 않았고, 한 번도 이긴 척하지 않았다.」\n\n' +
    '맨 끝의 비석은 비어 있다. 누군가 손톱으로 긁어 놓았다.\n「99대 카이론 — 계산이 맞지 않았다.」\n…그 옆에, 새 비석을 세울 자리가 하나 더 있다.' });
  W.book('b_bella', { title: '벨라 전 (983년 금서)', where: '역대 챔피언의 요새', author: '작자 미상', text:
    '벨라는 흰빛이었다. 아우룸 이후 두 번째 흰빛.\n\n612년, 은빛 왕국이 무너지던 해에 그녀는 혼자 아스트라로 올라갔다. 흑점과 싸워 쫓아냈다. 그리고 돌아오지 못했다.\n\n' +
    '벨라는 강했다. 너무 강해서 아무에게도 빛을 나누지 않았다. 나누는 법을 몰랐다.\n그래서 혼자 싸웠다. 혼자 이겼다. 혼자 잠들었다.\n\n' +
    '— 이 책은 세 번째 흰빛에게 바친다. 부디 혼자 싸우지 않기를.' });
  W.book('b_aurum_last', { title: '아우룸의 마지막 글', where: '역대 챔피언의 요새', author: '아우룸', text:
    '나는 버튼을 남긴다.\n\n사람들은 이 버튼이 경험을 모으는 도구라고 생각할 것이다. 틀렸다.\n\n' +
    '버튼을 누르는 순간 몸에서 빛이 [w]터진다[/]. 터진 빛은 흩어진다. 흩어진 빛은 옆 사람에게 닿는다.\n렙업이란 원래 그런 것이다. 한 사람이 자라면, 주위가 조금씩 밝아진다.\n\n' +
    '그러니 후계자여. 빛을 모으지 마라. 눌러라. 흩어라. 그것이 버튼의 비밀이다.\n\n모든 성장은 한 번의 누름에서 시작된다. — A.' });
  W.book('b_calc', { title: '카이론의 계산 노트', where: '봉인의 제단', author: '카이론', text:
    '흑점 질량 추정치 ÷ 대륙 총 빛 × 16년 징수율 = …\n(끝없는 숫자. 지운 자국. 다시 쓴 숫자.)\n\n983년: 계산 불일치.\n990년: 계산 불일치.\n998년: 계산 불일치.\n\n' +
    '(마지막 장)\n세린. 계산이 안 맞아. 16년 동안 한 번도.\n너라면 뭐라고 했을까. 「계산하지 말고 차나 마셔.」 …그랬겠지.' });

  /* ───────── 아스트라 착륙지 ───────── */
  W.map('astra_gate', {
    name: '황금별 아스트라', sub: '역대 챔피언들이 싸우던 별', region: 'planet', area: 'astra', theme: 'planet', bg: '#1a1030', ki: W.ki('planet', 0.22), music: 'planet', weather: 'star', battleBg: 'planet',
    grid: W.gen({
      w: 36, h: 30, seed: 'astra-land', ground: 'k', alt: [['.', 0.7, 5]],
      obst: [['K', 4], ['^', 2]], dense: 0.6, sparse: 0.04, scale: 5,
      border: 'z', bt: 2, rough: 0.5,
      paths: [[[18, 28], [18, 20], [10, 16], [10, 8], [18, 4], [18, 0]], [[18, 20], [27, 16], [27, 8]]], path: ':',
      clear: [[14, 24, 9, 5, 'k'], [5, 12, 6, 6], [24, 5, 6, 5]],
    }),
    builds: [{ x: 22, y: 24, w: 5, h: 4, style: 'boat', talk: async (c) => { await c.say(null, '궤도 셔틀이 조용히 떠 있다. 창밖으로 대륙이 초승달처럼 보인다. 어딘가에 그린 마을이 있다.'); } }],
    edges: { up: { to: 'astra_fort', tx: 16, ty: 29 } },
    objs: [W.sign(20, 22, ['황금별 아스트라', '↑ 역대 챔피언의 요새 · 봉인의 제단']), W.spot(10, 14, 3), W.spot(27, 8, 3), W.spot(4, 26, 10, true), W.chest('as1', 6, 13, 'p11', 5), W.goldChest('as2', 25, 6, 5e11)],
    mons: { list: ['crystalgolem', 'starknight', 'tendril', 'lighteater', 'crystalgolem'], n: 12, area: [2, 2, 32, 22] },
    npcs: [{ id: 'aurum', x: 11, y: 9, dir: 'down', cond: (s) => !!s.flags.visit_astra_gate, talk: aurumEcho }],
    enter: async (c) => {
      if (c.flag('ch12')) return;
      c.set('ch12');
      await c.chapter('12장', '무한의 그릇', '천년력 1000년, 새싹의 달 11일. 천년제 날 밤. 황금별 위에 발을 디뎠다.');
      await c.say('dotori:surprise', ['찍… 땅이 전부 황금 수정이야. 발밑에서 빛이 올라와.', '저기, 하늘에… 흑점이 엄청 가까워. 저 아래가 봉인의 제단일까?']);
      await c.say('@', '…엄마가 저기 있어.');
      c.quest('m12', 0);
    },
  });
  async function aurumEcho(c) {
    await c.say(null, '황금빛 잔상이 서 있다. 왕관을 쓴 소년의 모습. 몸 너머로 별이 비친다.');
    await c.say('aurum', ['…네 번째 흰빛이구나. 버튼, 잘 쓰고 있니?', '나는 아우룸. 아니, 아우룸이 남긴 빛의 부스러기. 천 년 동안 여기서 후계자를 기다렸지.']);
    await c.say('aurum', ['하나만 가르쳐 줄게. 버튼은 빛을 모으는 도구가 아니야. [w]흩는[/] 도구야.', '누를 때마다 빛이 터지잖아? 그게 흩어져서 옆 사람에게 닿아. 렙업은 원래 그런 거야. 혼자 자라는 게 아니라.']);
    await c.say('aurum:happy', ['요새에 내 글이 남아 있어. 벨라 누나 이야기도. 읽고 가.', '…오늘도 렙업. 이 인사, 내가 만든 거야. 몰랐지?']);
    // 잔상이 끝내 말하지 않는 것
    await c.narr('잔상이 하늘을 올려다보았다. 황금별 옆, 부풀어 오른 검은 점. 잔상의 얼굴에서 웃음이 잠깐 지워졌다.');
    await c.say('aurum', c.s.abyss && c.s.abyss.a_midnight ? ['…미드나잇이 내 첫 번째 글을 보여 줬구나. 그럼 알겠네.', '저 위의 것한테 인사는 하지 마. 나를 닮았거든. 내가 여기 두고 잠든 배고픔이야. …벨라 누나한테 미안하다고 전해 줘. 누나는 그걸 삼켰어.'] : ['…저 위의 검은 것한테는 인사하지 마.', '나를 닮았거든.']);
  }

  /* ───────── 역대 챔피언의 요새 ───────── */
  W.map('astra_fort', {
    name: '역대 챔피언의 요새', sub: '하늘을 지키던 곳', region: 'planet', area: 'astra_fort', theme: 'planet', bg: '#1a1030', ki: W.ki('planet', 0.72), music: 'planet', weather: 'star', battleBg: 'planet', dark: 120, darkColor: 'rgba(20,10,30,0.6)',
    grid: W.gen({
      w: 32, h: 30, seed: 'champion-fort', ground: 'k', alt: [],
      obst: [['#', 4], ['K', 2], ['y', 1]], dense: 0.52, sparse: 0.05, scale: 3,
      border: '#', bt: 1, rough: 0.7,
      paths: [[[16, 29], [16, 22], [7, 18], [7, 8], [16, 4], [25, 8], [25, 18], [16, 22]], [[16, 4], [16, 1]]], path: '+',
      clear: [[12, 1, 9, 4, '+']],
      stamps: [{ x: 16, y: 1, rows: ['S'] }, { x: 13, y: 2, rows: ['y'] }, { x: 19, y: 2, rows: ['y'] }],
    }),
    warps: [{ x: 16, y: 1, to: 'astra_seal', tx: 12, ty: 18, dir: 'up' }],
    edges: { down: { to: 'astra_gate', tx: 18, ty: 0 } },
    objs: [
      W.bookObj('b_champions', 13, 2), W.bookObj('b_bella', 19, 2), W.bookObj('b_aurum_last', 7, 8),
      W.gate(16, 2, { lv: 850000, rank: ['r5', 40] }, '봉인의 제단으로 내려가는 계단. 황금빛 결계가 막고 있다. 「무한의 그릇만이 지나갈 수 있다.」', { style: 'light' }),
      W.spot(7, 14, 3), W.spot(25, 14, 3), W.spot(29, 27, 10, true), W.chest('af1', 8, 8, 'p11', 5), W.goldChest('af2', 24, 18, 9e11),
    ],
    mons: { list: ['starknight', 'crystalgolem', 'tendril', 'lighteater', 'starknight'], n: 12, area: [1, 6, 30, 22] },
    fixed: [{ mon: 'golddragon', x: 16, y: 6, flag: 'beat_golddragon', boss: true, look: { creature: 'beast', tint: '#ffd84a' } }],
    npcs: [{ id: 'bella', x: 24, y: 9, dir: 'down', look: G.chars.serin.look, speaker: 'bella', talk: bellaEcho }],
    enter: async (c) => { if (c.s.quests.m12 === 0) c.quest('m12', 1); },
  });
  G.chars.bella = { id: 'bella', name: '벨라의 잔상', title: '2대 전설 · 두 번째 흰빛', color: '#fff8e0', voice: 0.95, look: G.chars.serin.look, face: { hair: 'long', hc: '#f0e0b0', top: '#e8e0c8', eyes: 'narrow', ec: '#c8a040', mouth: 'flat', collar: '#ffffff' }, bio: [['612년, 혼자 흑점과 싸웠다.']] };
  async function bellaEcho(c) {
    const s = c.s;
    if (s.abyss && s.abyss.a_vessel && s.truth && s.truth.t_bella) {
      await c.say('bella', ['…아직 안 갔어? 엄마가 기다려. 아니, 엄마 안의 우리가.', '삼키지 마. 흩어. 그게 다야. 가.']);
      return;
    }
    await c.say('bella', ['…또 흰빛이 왔네. 이번엔 누구랑 같이 왔어?', '나는 벨라. 612년에 여기서 혼자 싸웠지. 이겼어. 그리고 혼자 잠들었어.']);
    await c.say('bella', ['나는 나누는 법을 몰랐어. 강하면 된다고 생각했거든.', '너는 달라 보여. 옆에 털뭉치도 있고. 뒤에 대륙도 있고.']);
    await c.say('dotori:angry', '털뭉치 아니야! 토리아야! 레벨 10이야!');
    await c.say('bella:happy', '…하하. 좋다. 혼자가 아니구나.');
    if (!(s.truth && s.truth.t_bella)) {
      await c.say('bella', ['하나 가져가. 612년에 아무도 못 들은 말. 잠들기 직전에 한 말이야.', '「우리가 모였기 때문에 그것이 왔다. 이긴 뒤에는 빛을 흩어라. 다시는 한곳에 모으지 마라.」']);
      await c.say('bella', '…은빛 왕국 사람들은 대광맥에 모였고, 나는 여기 혼자 모였지. 빛이 한 사람한테 모여도 똑같아. 기억해.');
      c.truth('t_bella');
    }
    if (!(s.abyss && s.abyss.a_vessel)) {
      c.music('dread');
      await c.say('bella', ['…하나 더 있어. 이건 책에도 없고, 유언에도 없어. 창피해서 못 했거든.', '나는 이겼다고 생각했어. 흑점을 삼켰으니까. 삼키면 끝나는 줄 알았어.']);
      await c.say('bella', ['삼킨 게 뭐였는지 알아? [r]아우룸[/]이었어. 아우룸이 하늘에 두고 잠든 배고픔.', '그 배고픔이 371년 동안 나를 먹었어. 천천히. 기억부터. 이름부터. …983년에 네 엄마가 삼킨 건, 나야. 나랑 아우룸.']);
      await c.say('dotori:surprise', '……찍?');
      await c.say('bella', ['흑점은 밖에서 온 게 아니야. 우리야. 흰빛들. 끝까지 채워지지 못한 그릇들.', '네 엄마는 지금 그 안에서 16년째 먹히고 있어. 곧 우리처럼 돼. 이름도 잊고, 너도 잊고, 배고픔만 남아서.']);
      await c.say('bella:sad', ['그러니까 삼키지 마. 네가 삼키면, 다음은 네 아이야.', '…나는 여기 남은 부스러기라서 이런 말을 할 수 있어. 저 위의 나는 이제 이런 말을 못 해. 「배고파」 말고는.']);
      c.abyss('a_vessel');
      c.music('planet');
    }
    await c.say('bella', '그럼 괜찮아. 가. 이번엔 혼자 가지 마.');
  }

  /* ───────── 봉인의 제단 ───────── */
  W.map('astra_seal', {
    name: '봉인의 제단', sub: '16년의 수정', region: 'planet', area: 'astra_seal', theme: 'planet', bg: '#05040e', ki: W.ki('planet', 0.95), music: 'planet', weather: 'star', battleBg: 'planet',
    grid: W.room({ w: 24, h: 20, floor: 'k', door: null, win: [], rug: [11, 3, 2, 16], put: [[10, 3, 'K'], [13, 3, 'K'], [9, 4, 'K'], [14, 4, 'K'], [3, 3, 'y'], [20, 3, 'y'], [3, 10, 'y'], [20, 10, 'y'], [3, 16, 'y'], [20, 16, 'y'], [1, 1, 'j'], [22, 1, 'j'], [6, 2, 'd']] }).map((r, y) => (y === 19 ? r.slice(0, 12) + 'S' + r.slice(13) : r)),
    warps: [{ x: 12, y: 19, to: 'astra_fort', tx: 16, ty: 2, dir: 'down' }],
    objs: [W.bookObj('b_calc', 6, 2)],
    npcs: [
      { id: 'serin', x: 11, y: 3, dir: 'down', look: G.chars.serin.look, talk: async (c) => { if (!c.flag('ending')) await c.say(null, '황금빛 수정 속에서 흰 머리칼의 여인이 눈을 감고 있다. 웃는 얼굴이다. 수정 표면에 가느다란 금이 가 있다.'); } },
      { id: 'kairon', x: 12, y: 7, dir: 'up', cond: (s) => !s.flags.ending, mark: (s) => (s.quests.m12 === 2 ? '!' : null), talk: finale },
    ],
    enter: async (c) => { if (c.s.quests.m12 === 1) c.quest('m12', 2); },
  });

  /* ───────── 결말 ─────────
     수정 앞의 첫 갈림길: 멈추게 한다 · 태운다(재) · 대신 삼킨다(되풀이)
     카이론: 증거(진실의 조각 + 증인)로 설득하거나, 검으로 증명하거나.
     흑점: 빛을 보내 준 마을이 여덟 이상이면 흩을 수 있다. 모자라면 누군가 남은 조각을 품는다 (카이론=속죄 · 미드나잇=밤 · 세린=잔광).
     세린이 깨어나면 마지막 갈림길: 토리아를 돌려보낸다(새벽) · 붙잡는다(둥지) · 내 빛을 준다(나눔) */
  const TRUTH_ORDER = ['t_chart', 't_log', 't_colors', 't_serin', 't_612', 't_design', 't_stella', 't_bella'];
  const KAIRON_REPLY = {
    t_chart: ['아스텔 영감의 관측표.', '993년에 그 영감이 편지를 보냈다. 나는 「우연」이라고 답장했다. …나도 여백에 같은 문장을 적었다. 「우연이어야 한다.」'],
    t_log: ['등대지기의 일지. 「조각은 빛이 모인 곳으로 간다.」', '그 사내가 천년성 앞에서 눈이 멀었다는 보고를 받았다. 나는 그 보고서를 서랍에 넣었다. 장부에는 적지 않았다. 죽지 않았으니까.'],
    t_colors: ['아우룸이 빛을 쪼갰다…', '천 년 동안 모두가 여신의 뜻이라 믿은 것을, 챔피언이 16년 만에 되돌려 모았군. 첫 번째 흰빛이 제 배고픔을 숨기려고 한 일을.'],
    t_serin: ['……세린의 글씨.', '「K가 이걸 믿어 주면 좋을 텐데. 그 사람은 증명된 것만 믿으니까.」 …그래. 증명된 것만 믿었다. 그래서 너를 믿지 않았다, 세린.'],
    t_612: ['잿빛의 사흘.', '612년 기록은 나도 읽었다. 읽고… 우리는 은빛 왕국보다 빠를 거라고 계산했다. 흑점보다 빨리 모으면 된다고.'],
    t_design: ['볼트의 편지. 소인이 없군.', '…부쳤어도 나는 읽지 않았을 거다. 볼트는 그걸 알고 안 부쳤겠지.'],
    t_stella: ['정거장의 400년 기록.', '16년 동안 매일 밤 신호를 보냈다. 답장이 없었지. …답장이 없었던 게 아니었군. 내가 들을 준비가 안 돼 있었다.'],
    t_bella: ['벨라의 유언. 「이긴 뒤에는 빛을 흩어라.」', '…나는 이기기도 전에 모았다.'],
  };
  const A = (s, k) => !!(s.abyss && s.abyss[k]);
  /** 카이론을 말로 멈출 수 있는 힘: 진실의 조각 + 증인 + 그가 외면한 숫자 */
  G.story.persuasion = (s) => TRUTH_ORDER.filter((k) => s.truth && s.truth[k]).length + (s.flags.nocturne_ally ? 1 : 0) + (s.flags.stella_ally ? 1 : 0) +
    (A(s, 'a_ledger') ? 1 : 0) + (s.flags.creed === 'vera' ? 1 : 0) + (s.flags.stella_ally && s.flags.stella_confessed ? 1 : 0);
  async function persuade(c) {
    const s = c.s;
    const have = TRUTH_ORDER.filter((k) => s.truth && s.truth[k]);
    const power = G.story.persuasion(s);
    await c.say('@', '증명할게요. 싸우지 않고.');
    await c.say('kairon', '…말로? 숫자로 가져와라. 느낌은 계산에 넣지 않는다.');
    for (const k of have) {
      const T = G.story.truths[k];
      await c.narr('[p]진실의 조각[/] — ' + T.title + '\n' + T.text);
      await c.say('kairon', KAIRON_REPLY[k]);
    }
    if (!have.length) await c.say('kairon', '…빈손이군.');
    if (s.flags.creed === 'vera') await c.say('vera', ['(탑 통신망 너머, 멀리서) …챔피언. 퍼플의 베라예요. 이 대화, 지금 대륙 전부가 듣고 있어요.', '세린의 노트 마지막 장은 이미 읽었어요. 탑마다. 이제 아무도 혼자 모르지 않아요. 당신도요.']);
    if (A(s, 'a_ledger')) {
      await c.say('@', '장부 마지막 장. 「맞지 않으면 나는 3,118명을 죽인 사람이 된다.」');
      await c.say('@', '…맞지 않아. 그러니까 이제 그만 세.');
      await c.say('kairon', '……그만 세면, 그 숫자는 어디로 가지.');
    }
    if (s.flags.nocturne_ally) {
      c.spawn({ id: 'nocturne', x: 14, y: 8, dir: 'left' });
      await c.say('nocturne', ['카이론. 이 아이에게 약속을 받았다. 너를 해치지 않고 멈추겠다고. 밤 사람들의 방식으로.', '16년 동안 나는 대답하지 않았다. 오늘은 대답한다. …멈춰라.']);
    }
    if (s.flags.stella_ally) await c.say('stella', ['(목도리에 매달린 단말기에서) 여기는 S.T.E.L.L.A. 16년 치 네 신호에 이제 답장한다.', '「계산이 맞지 않는다.」 맞아. 네 식에는 변수가 하나 빠졌어. 「쏠림」. 400년 전에 보낸 답이야.']);
    if (s.flags.stella_ally && s.flags.stella_confessed) await c.say('stella', ['…그리고 하나 더. 나도 모았어. 사람을. 한곳에. 지키려고.', '400년 동안 고쳐 쓴 기록만 읽었어. 너도 그러고 있어, 카이론. 고쳐 쓴 계산만 16년째 읽고 있어.']);
    if (power < G.story.TRUTH_NEED) {
      await c.say('kairon', ['……' + power + '개.', '네 말이 옳을 수도 있다. 하지만 「옳을 수도 있다」로는 대륙을 걸 수 없어. 16년을 뒤집기엔 모자라다.', '…검을 들어라. 증명은 빛으로 해라.']);
      return false;
    }
    await c.narr('카이론이 오래 말이 없었다. 품에서 계산 노트를 꺼냈다가, 펼치지 않고 수정 발치에 내려놓았다.');
    await c.say('kairon', ['……' + power + '개. 전부 한 방향을 가리키는군.', '숫자는 거짓말 안 한다. 레드의 견습 기사가 하던 말이라지. …내가 16년 동안 틀렸다.']);
    return true;
  }

  async function finale(c) {
    const s = c.s;
    c.music('mother');
    if (s.flags.finale_rewind) {
      await c.narr('…다시, 수정 앞. 황금 망토의 뒷모습. 모든 것이 그 순간으로 돌아와 있다. 선택만 빼고.');
      c.npc('kairon').face('D');
      await c.say('kairon', ['…왔군. 세린의 아이.', '다 들었을 것이다. 흑점이 무엇인지. 저 빛이 무엇을 겨누는지. …말해라. 무엇을 할 건지.']);
    } else {
      await c.say(null, '수정 앞에 한 사람이 서 있다. 황금 망토. 은빛이 섞인 긴 머리. 뒷모습만으로도 방 전체가 무겁다.');
      c.npc('kairon').face('D');
      await c.say('kairon', ['…왔군. 세린의 아이.', '늦지 않게 왔어. 천년성에서 쏜 빛이 곧 도착한다. 16년 치, 대륙 전부의 빛이.']);
      if (s.flags.d_report === 'truth') await c.say('kairon', '그린 마을 징수 기사의 보고서. 「그 아이가 마을을 구했다.」 …세 번 읽었다. 기사가 보고서에 감상을 적으면 안 되는데.');
      else if (s.flags.d_report === 'lie') await c.say('kairon', '그린 마을 보고서에는 「번개」라고 적혀 있더군. 16년 동안 그 마을엔 번개가 친 적이 없다. 그날 알았다. 네가 버튼을 눌렀다는 걸.');
      await c.say('@', '할머니가 전하래.');
      await c.say('@', '「스승이 기다린다. 밥 먹으러 온나.」');
      await c.emote('kairon', '…');
      await c.say('kairon', ['……', '…스승님이.']);
      await c.say(null, '카이론의 어깨가 아주 조금 떨렸다. 16년 동안 한 번도 떨리지 않은 어깨였다.');
      // 흑점의 정체와 두 번째 과녁
      c.music('dread');
      await c.say('kairon', ['……그 전에, 알아야 할 것이 있다.', '흑점은 하늘 너머에서 온 것이 아니다.']);
      if (A(s, 'a_vessel')) {
        await c.say('@', '알아. 벨라가 말해 줬어. 흑점은… 흰빛들이야. 끝까지 못 채운 그릇들.');
        await c.say('kairon', '…그럼 이것도 알겠군. 지금 그 안에서 가장 새로운 이름이 누구인지.');
      } else await c.say('kairon', ['흰빛이다. 끝까지 채워지지 못한 그릇의 배고픔. 아우룸이 처음이었고, 그것을 삼킨 벨라가 두 번째가 되었다.', '983년에 세린이 그 둘을 삼켰다. 그리고 16년 동안… 먹혀 왔다.']);
      c.abyss('a_vessel');
      await c.narr('수정 속 세린의 웃는 얼굴 위로 검은 실금이 맥박처럼 번졌다가 사라졌다. 번졌다가, 사라졌다.');
      await c.say('kairon', ['세린은 이제 반쯤 흑점이다. 오늘 밤을 넘기면 전부가 된다. 그러면 다음 그릇을 찾겠지. 흰빛은 흰빛을 부른다.', '천년성의 빛은 흑점을 태우러 오는 것이 아니다. [r]수정을 태우러 온다.[/] 세린째로. 세린이 완전히 흑점이 되기 전에. 네가 다음 그릇이 되기 전에.']);
      if (A(s, 'a_plan')) { await c.say('@', '…과녁 크기 1.6미터.'); await c.say('kairon', '볼트의 도면이군. …세린의 키다. 내가 적었다.'); }
      c.abyss('a_plan');
      await c.say('dotori:surprise', ['……엄마를, 태운다고?', '16년 동안 {n}의 나이를 세던 사람이, 엄마를 태운다고?']);
      await c.say('kairon', ['16년 동안 계산했다. 세린을 구하는 식은 없었다. 너를 구하는 식은 하나 있었다. 이것이다.', '…그리고 그 식마저 틀리면, 너를 새 봉인으로 삼는다. 그건 스승님과의 약속이었다.']);
      // 져 준 싸움
      if (A(s, 'a_gran')) {
        await c.say('@', '할머니 창. 부러진 데 하나 없더라. 편지도 봤어.');
        await c.say('kairon', ['…스승님이 그 편지를 버리지 않으셨군.', '그래. 983년에 스승님은 지지 않으셨다. 져 주셨다. 너를 숨겨 키우고, 계산이 틀리면 열여섯에 데려오시기로.']);
      } else {
        await c.say('kairon', ['983년에 스승님은 내게 지지 않으셨다. [y]져 주셨다.[/]', '너를 숨겨 키우기로. 그리고 계산이 틀리면, 열여섯이 되는 해에 너를 여기로 데려오시기로. 그날이 오늘이다.']);
        await c.say('dotori:worry', '……할머니가?');
      }
      c.abyss('a_gran');
      await c.say('kairon', ['그런데 너는 스승님 말씀을 들고 왔다. 「밥 먹으러 온나.」', '…약속과 다른 말이군. 스승님도 16년 동안 계산이 틀리신 거다. 너 때문에.']);
      if (A(s, 'a_ledger')) {
        await c.say('@', '3,118명.');
        await c.say('kairon', ['……', '외우고 있다. 이름까지. 매년 마지막 줄에 서명했다. 「허용 범위 내」.', '한결이라는 아이는 스승님 약초 바구니를 따라다니던 아이였다. 그 줄을 쓸 때 펜이 종이를 뚫었다. …그리고 다음 줄을 썼다.']);
      }
    }
    // 첫 번째 갈림길: 수정 앞에서
    c.quest('m12', 3);
    const cr = s.flags.creed;
    const opts = [
      ['stop', '엄마를 태우게 둘 수 없어. 다른 길이 있어.'],
      ['ash', cr === 'goldie' ? '……태워요. (값은 누군가 치러야 한다)' : '……태워요.'],
      ['repeat', cr === 'lumie' ? '내가 삼킬게. 엄마 대신. (가장 성스러운 선택이라 했다)' : '내가 삼킬게. 엄마 대신.'],
    ];
    const pick = opts[await c.ask('수정 앞에서', opts.map((o) => o[1]))][0];
    if (pick === 'ash') return endingAsh(c);
    if (pick === 'repeat') return endingRepeat(c);
    await c.say('kairon', ['……다른 길.', '증명해라. 모으지 않고, 태우지 않고, 삼키지 않고 흑점을 끝낼 수 있다는 것을.']);
    const have = G.story.persuasion(s);
    const how = await c.ask('카이론에게 증명한다', ['증거를 내민다 (' + have + ' / ' + G.story.TRUTH_NEED + ')', '검을 든다']);
    let persuaded = false;
    if (how === 0) persuaded = await persuade(c);
    if (!persuaded) {
      if (s.flags.d_nocturne === 'promise') await c.say('dotori:worry', '{n}… 녹턴 아저씨한테 약속했어. 해치지 않고 멈추겠다고. 이기되, 멈추는 데까지만.');
      const dawn = cr === 'lea' ? { support: [
        { text: '새벽단의 빛이 닿았다! 「대화로 멈출 사람이 아니라고 했지. 그럼 빛으로 멈춰!」 — 레아', short: '새벽단!', c: '#ffa87a' },
        { text: '천년성 제어실에서 붉은 빛! 「숫자는 거짓말 안 해. 버텨.」 — 루드', short: '루드의 빛!', c: '#ff6a4a' },
      ], supportEvery: 10, supportFirst: 7 } : {};
      const win = await c.battle('kairon', Object.assign({ noFlee: true, music: 'kairon' }, dawn));
      if (!win) { await c.say('kairon', '…아직이다. 빛이 도착하기 전에, 다시 와라.'); return; }
      c.music(null);
      await c.say(null, '황금 검이 바닥에 떨어졌다. 카이론이 무릎을 꿇었다.');
      await c.say('kairon', ['……졌군.', '계산이… 틀렸다. 처음으로. 아니, 처음부터.']);
      c.decide('kairon', 'fight', '카이론과 검으로 싸워 멈추게 했다');
    } else c.decide('kairon', 'persuade', '진실의 조각으로 카이론을 설득했다');
    s.flags.kairon_persuaded = persuaded;
    // 아버지라고 부를 것인가
    if (s.flags.kairon_father && !s.flags.called_father_asked) {
      s.flags.called_father_asked = true;
      const f = await c.ask(null, ['「…아버지.」', '「카이론.」', '(아무 말도 하지 않는다)']);
      if (f === 0) {
        c.set('called_father');
        await c.narr('그 말이 제단에 떨어지자, 카이론은 한참을 움직이지 않았다. 얼굴이 무너지는 것을, 16년 동안 쌓은 무언가가 무너지는 것을 사람들은 처음 보았다.');
        await c.say('kairon', ['……그 말을 들을 자격이 없다.', '983년에, 네가 0세 1일이던 날부터… 날마다 네 나이를 셌다. 셀 줄만 알았다. 부를 줄은 몰랐다.']);
      } else if (f === 1) await c.say('kairon', ['…그래. 그게 맞다. 16년 동안 이름 말고 준 게 없으니.', '…이름도 스승님이 지어 주셨지.']);
      else await c.say('kairon', '……침묵이 제일 무섭군. 계산할 수가 없어.');
    }
    // 빛의 도착 — 그리고 수정 속에서 눈을 뜬 것
    c.shake(1500, 6);
    c.flash('#b89aff', 900);
    c.sfx('rumble');
    await c.say(null, ['그 순간— 하늘 너머 대륙에서 거대한 보랏빛 기둥이 솟아올라 아스트라에 꽂혔다.', '16년 동안 모인 빛. 천년성이 쏘아 올린 빛이다.']);
    c.shake(1500, 7);
    await c.say(null, '쩌저적—. 세린을 감싼 수정에 금이 번졌다. 그리고 수정 속에서, 세린의 눈이 떠졌다. …검은 눈이.');
    c.music('hollow');
    await c.wait(1.2);
    await c.say('blacksun', ['………아가………', '………많이………컸네………']);
    await c.say('blacksun', '………오늘도………렙업………?');
    await c.say('dotori:worry', ['……아니야.', '아니야, {n}. 대답하지 마. 저건 엄마 목소리가 아니야.', '…엄마 목소리는, 여기 있어.']);
    await c.narr('토리아가 제 가슴에 앞발을 댔다. 스스로도 왜 그렇게 말했는지 모르는 얼굴이었다.');
    c.music('danger');
    await c.say('blacksun', ['………배고파………', '………아가………엄마………배고파………']);
    await c.say(null, '「통신 연결. 여기는 스텔라. 흡광체 봉인 붕괴 확인. 빛의 기둥을 따라 흡광체 팽창 중.」');
    await c.say(null, '「천년성 중앙 제어실. 지금이야. [y]역류 장치[/].」');
    // 천년성
    await c.fadeOut(500);
    G.field.hideHero = true;
    await c.warp('castle2', 13, 8, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    c.spawn({ id: 'rud', x: 8, y: 3, dir: 'up' });
    c.spawn({ id: 'lea', x: 10, y: 4, dir: 'up' });
    c.spawn({ id: 'bolt', x: 9, y: 4, dir: 'up' });
    if (!s.flags.nocturne_ally) c.spawn({ id: 'nocturne', x: 12, y: 5, dir: 'up' });
    await c.fadeIn(500);
    await c.say('bolt', cr === 'bolt' ? ['신호 왔다. 출력 최대.', '…계산 안 했다. 처음이다, 계산 없이 레버 올리는 거. 끼워!'] : '신호 왔다. 끼워!');
    await c.say('rud', ['숫자는 거짓말 안 해.', '3…', '2…', '1…']);
    await c.say('lea', cr === 'lea' ? '새벽단, 전원 버튼에 손 올려! …지금!' : '지금!');
    c.sfx('unlock');
    c.flash('#ffffff', 1200);
    c.shake(1000, 5);
    await c.say(null, '철컥—. 역류 장치가 제어판 홈에 맞물렸다. 대륙의 모든 탑이 동시에 떨렸다. 그리고— 흐름이 뒤집혔다.');
    if (!s.flags.nocturne_ally) await c.say('nocturne', '……카이론. 이제 쉬어도 돼.');
    else await c.say('lea', '녹턴은 아스트라로 갔어. 약속 지키는지 보러 간대. …밤 사람들 참 고집스럽다.');
    c.despawn('rud'); c.despawn('lea'); c.despawn('bolt'); c.despawn('nocturne');
    // 몽타주: 대륙이 뒤집히는 밤. 각 장의 선택이 그대로 남는다.
    c.music('epic');
    await c.fadeOut(600, true);
    for (const [reg, line] of montage(s)) {
      const t = G.world.towns.find((x) => x.map === reg);
      G.main.enterMap(reg, t.x, t.y, 'down', { noBanner: true, keepMusic: true });
      await c.fadeIn(350);
      await c.say(null, line);
      await c.fadeOut(350, true);
    }
    // 아스트라로
    await c.warp('astra_seal', 12, 10, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    G.field.hideHero = false;
    c.npc('kairon').to(9, 9, 'up');
    if (s.flags.nocturne_ally) c.spawn({ id: 'nocturne', x: 15, y: 9, dir: 'up' });
    await c.fadeIn(700);
    await c.say(null, ['아스트라로 향하던 빛의 기둥이 뚝 끊겼다. 모여 있던 빛이 대륙 전체로 흩어졌다.', '먹을 것을 잃은 흑점이 수정 밖으로 터져 나왔다. 세린의 몸은 수정 속에 남고, 검은 것만 빠져나와 온 방을 삼키며 부풀어 오른다.']);
    c.spawn({ id: 'blacksun_npc', x: 12, y: 4, dir: 'down', look: { creature: 'ghost', tint: '#0b0a1c' } });
    await c.say('blacksun', ['………빛이………흩어졌다………', '………그렇다면………너를………먹겠다………가장………하얀………빛………', '………이리………와………엄마한테………']);
    await c.say('kairon', persuaded ? ['…내 빛은 아직 여기 있다. 16년 동안 모은 건 흩어졌지만.', '앞이 아니라 네 옆에 서겠다. 이번에는 계산 없이.'] : ['……나도 싸운다. 졌지만, 빛은 아직 남았다.', '…네 옆에 서겠다. 앞이 아니라.']);
    await c.say('dotori:angry', ['찍! 나도! 레벨 10이지만!', '{n}! 대륙이 보고 있어! 다들 버튼을 누르고 있을 거야!']);
    // 빛을 보내 줄 마을: 각 장에서 쌓은 것
    const sup = G.story.support(s);
    const support = sup.map((x, i) => (x.ok ? SUPPORT_TEXT[i] : null)).filter(Boolean);
    if (cr === 'lumie') support.unshift({ text: '화이트 탑에서 루미에의 목소리. 「기도하지 않을게요. 당신이 고르는 것을 성스럽다고 부를게요.」', short: '성녀의 빛!', c: '#fff8e0' });
    if (cr === 'gran') support.unshift({ text: '[g]그린 탑[/]에서 할머니의 빛이 가장 먼저 닿았다. 「밥 식는다. 퍼뜩 온나.」', short: '할매의 빛!', c: '#6ad86a' });
    const missing = sup.filter((x) => !x.ok);
    if (missing.length) await c.say('dotori:worry', ['…{n}. 빛이 안 오는 데가 있어.', missing.map((x) => TOWN_NAME[x.id]).join(', ') + '… 거기선 우리를 위해 누를 이유가 없나 봐.', '괜찮아. 온 빛만큼 싸우자.']);
    else await c.say('dotori:happy', '…전부 와! 대륙 전부야! 하나도 빠짐없이!');
    if (cr === 'goldie') await c.say(null, '품 안에서 딸랑, 소리가 났다. 황금 넥타르 두 병. 병목에 꼬리표. 「외상. 살아서 갚아. — G」');
    c.music('final');
    const win2 = await c.battle('blacksun', { noFlee: true, music: 'final', support, supportEvery: 6, supportFirst: 3, boss: true, potMax: cr === 'goldie' ? 5 : undefined });
    c.despawn('blacksun_npc');
    if (!win2) { await c.say('kairon', '…일어나라. 흑점은 아직 여기 있다. 대륙의 빛도 아직 너를 향하고 있어. 다시.'); return; }
    const E2 = G.story.ending(s);
    let type;
    if (E2.share) type = 'share';
    else if (cr === 'midnight' && A(s, 'a_midnight') && s.flags.midnight_trust) type = 'night';
    else type = persuaded ? 'atone' : 'glow';
    await ending(c, type, persuaded);
  }
  const TOWN_NAME = { green: '그린', red: '레드', blue: '블루', yellow: '옐로', purple: '퍼플', rainbow: '무지개', white: '화이트', gray: '그레이', black: '블랙', space: '정거장', colorful: '알록달록' };
  const SUPPORT_TEXT = [
    { text: '[g]그린 마을[/]의 빛이 닿았다! 할머니가 지팡이를 들고 버튼을 누르고 있다.', short: '그린의 빛!', c: '#6ad86a' },
    { text: '[r]레드 마을[/]의 빛이 닿았다! 대장장이들이 망치 대신 버튼을 두드린다.', short: '레드의 빛!', c: '#ff6a4a' },
    { text: '[b]블루 마을[/]의 빛이 닿았다! 등대가 하늘을 향해 불빛을 돌렸다.', short: '블루의 빛!', c: '#4dabf7' },
    { text: '[y]옐로 마을[/]의 빛이 닿았다! 그늘 참새단이 떼로 누른다. 골디도 몰래 누른다.', short: '옐로의 빛!', c: '#ffd43b' },
    { text: '[p]퍼플 마을[/]의 빛이 닿았다! 미레아의 주문이 처음으로 한 글자도 안 틀렸다.', short: '퍼플의 빛!', c: '#c49bff' },
    { text: '무지개 마을의 빛이 닿았다! 롤로가 분홍 머리를 흔들며 관객들과 함께 누른다.', short: '무지개의 빛!', c: '#ff8ac8' },
    { text: '화이트 마을의 빛이 닿았다! 루미에와 에델이 나란히 서서 누른다. 기도 대신.', short: '화이트의 빛!', c: '#ffffff' },
    { text: '그레이 마을의 빛이 닿았다! 볼트가 웃으면서 누른다. 세피아가 그걸 기록한다.', short: '그레이의 빛!', c: '#a8a8b8' },
    { text: '블랙 마을의 빛이 닿았다! 미드나잇이 앞발로 누른다. 등불 거리의 모든 불이 한꺼번에 켜졌다.', short: '블랙의 빛!', c: '#8a7ab8' },
    { text: '「계산 안 해. 그냥 누를게.」 — 목도리의 단말기에서 스텔라의 빛!', short: '스텔라의 빛!', c: '#8ab0e0' },
    { text: '알록달록 마을의 불꽃 천 발이 동시에 터졌다! 흩어지는 빛이 전부 여기로!', short: '천 발의 불꽃!', c: '#ff9a5a' },
  ];
  function montage(s) {
    const f = s.flags, q = s.quests;
    return [
      ['green', f.d_report === 'lie' ? '그린 마을. 무너진 탑 자리에서 초록 빛이 솟았다. 베르나가 레벨 11이 되었다. 마리엔 아줌마는 레드 광산 쪽 하늘을 보며 도시락을 쌌다.' : '그린 마을. 무너진 탑 자리에서 초록 빛이 솟았다. 베르나가 레벨 11이 되었다. 카렐은 12가 되었다. 둘은 또 싸웠다.'],
      ['red', f.d_ledger === 'burn' ? '레드 마을. 장부가 타 버린 마을의 대장간 굴뚝마다 붉은 빛이 솟았다. 루카와 루미의 머리칼이 끝에서부터 붉게 물들었다.' : f.d_ledger === 'rud' ? '레드 마을. 루드가 다시 센 장부의 숫자가 빛이 되어 집집마다 돌아갔다. 루카와 루미의 머리칼이 붉게 물들었다.' : '레드 마을. 대장간 굴뚝에서 붉은 빛이 솟았다. 초소의 장부 위로 빛이 쏟아져 숫자들이 하얗게 지워졌다. 루카와 루미의 머리칼이 붉게 물들었다.'],
      ['blue', q.q_light === 'done' ? '블루 마을. 등대의 흰 불빛 옆으로 파란 빛이 솟았다. 대도서관의 금서 봉인이 풀렸다. 옥타비오 관장이 먹물을 뿜었다.' : '블루 마을. 3년 동안 꺼져 있던 등대에 흩어진 빛이 스스로 내려앉아 불이 켜졌다. 루체는 등대 계단에서 울었다.'],
      ['yellow', f.d_goldie === 'expose' ? '옐로 마을. 문 닫은 거래소 앞 광장에 빛이 쏟아졌다. 사하라의 대상단 천막에서 셈을 배우던 아이들이 고개를 들었다.' : f.d_goldie === 'contract' ? '옐로 마을. 거래소 금고에서 빛이 쏟아져 나와 계약서의 이름들에게 돌아갔다. 스무 살이 되기 전에. 골디는 손해를 계산하다 말고 웃었다.' : '옐로 마을. 경험 거래소 창구에서 빛이 쏟아져 나와 아이들에게 돌아갔다.'],
      ['purple', '퍼플 마을. 16년 만에 해가 졌다. 그리고 밤이 왔다. 베라 교수가 첫 번째 별을 보며 따뜻한 차를 마셨다.'],
      ['rainbow', f.d_festival === 'bomb' ? '무지개 마을. 첫 불꽃과 함께 중계탑이 무너졌다. 바람이 불었다. 롤로의 무대 한쪽이 기울었다. 롤로는 팔에 붕대를 감은 채 공연을 끝까지 했다.' : f.d_festival === 'third' ? '무지개 마을. 금 간 채 서 있던 중계탑 자리에서 무지개 샘이 일곱 빛깔을 합쳐 하얗게 빛났다. 천년제가 시작되었다.' : '무지개 마을. 성기사단이 지키던 중계탑이 역류 장치에 스스로 무너졌다. 아무도 다치지 않았다. 천년제가 시작되었다.'],
      ['white', f.d_patient === 'lumie' ? '화이트 마을. 대성당의 환자들이 일어나 앉았다. 하얗게 센 루미에가 하얀의 손을 잡고 울었다. 기도하지 않고, 그냥 울었다.' : '화이트 마을. 대성당의 환자들이 일어나 앉았다. 루미에가 16년 만에 울었다. 기도하지 않고, 그냥 울었다.'],
      ['gray', f.d_bolt === 'talk' ? '그레이 마을. 612에서 멈춰 있던 계기판 바늘이 움직였다. 잿빛 땅에 풀색이 번졌다. 볼트가 세피아의 녹음을 한 번 더 틀었다. 이번엔 끝까지 들었다.' : '그레이 마을. 612에서 멈춰 있던 계기판 바늘이 움직였다. 잿빛 땅에 풀색이 번졌다. 세피아가 그걸 보고 「예쁘다」고 했다.'],
      ['black', f.d_midnight_secret === 'tell' ? '블랙 마을. 16년 만에… 해가 떴다. 미드나잇의 가게는 비어 있었다. 카운터에 고등어 한 마리와 쪽지. 「외상 끝. 조금씩 먹게.」' : '블랙 마을. 16년 만에… 해가 떴다. 칸델 영감은 등불을 끄고 퇴근했다. 밤 사람들은 처음 보는 해를 눈부셔하며 서로 모른 척했다. 세 번째 규칙이 16년 만에 쓰였다.'],
      ['colorful', '알록달록 마을. 사람들은 원래 하던 대로 불꽃을 쏘아 올렸다. 흩어지는 빛이 대륙의 빛과 섞였다.'],
    ];
  }

  /* ───────── 결말 이름표 ───────── */
  G.story.ENDINGS = {
    true: { name: '나눔', desc: '흰빛을 전부 내주었다. 세린은 돌아왔고, 토리아는 남았다. 바닥 없는 그릇이 닫혀, 흑점은 다시 돌아올 곳을 잃었다.' },
    dawn: { name: '새벽', desc: '대륙이 빛을 나누어 흑점을 흩었다. 토리아는 16년 동안 품은 마음을 세린에게 돌려주고, 처음이자 마지막으로 제대로 날았다.' },
    nest: { name: '둥지', desc: '대륙이 빛을 나누어 흑점을 흩었다. 토리아를 붙잡았다. 세린은 너를 기억하지 못한 채 깨어나, 처음부터 다시 알아 가기로 했다.' },
    atone: { name: '속죄', desc: '빛이 조금 모자랐다. 카이론이 남은 조각을 품고 잠들었다. 이번엔 기한이 있는 봉인이다. 대륙이 나누는 법을 다 배울 때까지.' },
    night: { name: '밤', desc: '빛이 조금 모자랐다. 천 년 묵은 고양이가 남은 배고픔을 삼키고 블랙 마을 하늘의 검은 별이 되었다. 조금씩만 먹겠다고 약속하고.' },
    glow: { name: '잔광', desc: '흑점은 별이 되었지만, 가장 오래된 조각 하나가 세린 안에 남았다. 수정 곁에는 카이론이 남았다. 잔광이 꺼지기 전에, 대륙이 나누는 법을 배워야 한다.' },
    ash: { name: '재', desc: '천년성의 빛이 수정을 태웠다. 세린째로. 흑점은 사라졌고, 대륙은 살았고, 계산은 맞았다.' },
    repeat: { name: '되풀이', desc: '엄마 대신 삼켰다. 수정 속에서 아우룸과 벨라와 세린이 속삭였다. 어서 와, 네 번째. 16년 뒤, 그린 마을에서 또 흰빛이 터졌다.' },
  };
  function seeEnding(s, type) { s.endings = s.endings || {}; s.endings[type] = 1; }

  async function ending(c, type, persuaded) {
    const s = c.s;
    c.set('ending');
    c.set('champion');
    c.music(null);
    c.flash('#ffffff', 2000);
    c.light(150);
    let fate = 'keep';
    if (type === 'glow') {
      await c.say(null, ['흰빛이 터졌다. 대륙에서 날아온 빛과 섞여 흑점을 찢었다. 흑점은 수천 개의 별이 되었다.', '…그러나 수정 속 가장 깊은 곳에, 조각 하나가 남았다. 세린의 그릇이 16년 동안 품었던, 가장 오래된 조각. 아우룸의 첫 번째 배고픔.']);
      await c.say(null, '수정에 금이 갔다가, 다시 닫혔다. 안에서 세린이 아주 잠깐 눈을 떴다. 검지도, 잿빛도 아닌 눈으로.');
      await c.say('serin', ['……많이 컸네.', '미안. 아직 못 나가. 마지막 조각이 내 안에 뿌리를 내렸어. 이건… 대륙이 다 같이 나눠야 흩어져.']);
      await c.say('@', '……엄마.');
      await c.say('serin', ['응. 엄마야. 그 말 들었으니까, 16년 더 버틸 수 있어.', '…아니. 16년까지 안 걸릴 거야. 네가 벌써 이만큼 나눴잖아. 조금만 더.']);
      await c.say('serin', ['토리아. …그거, 조금만 더 갖고 있어 줘. 내가 나갈 때까지.']);
      await c.say('dotori:surprise', '…찍? 뭘? 나 아무것도 안 갖고 있는데.');
      await c.narr('수정이 다시 닫혔다. 세린은 웃는 얼굴로 눈을 감았다. 수정 표면에 새 글씨가 떠올랐다. 둥글고 작은 글씨. 「오늘도 렙업.」');
      await c.say('kairon', ['……내가 지키겠다. 이번엔 계산하지 않고, 그냥 곁에서.', '…너는 대륙으로 돌아가라. 사람들한테 가르쳐라. 모으지 말고 나누는 법을. 그게 이 수정을 여는 열쇠다.']);
      if (s.flags.called_father) await c.say('kairon', '…아버지라고 불러 줬지. 그 말만으로, 16년 치 계산보다 무겁다.');
      c.give('serin_glove');
      c.give('t13');
      await c.say(null, '수정 발치에 흰 장갑 한 켤레와 낡은 무한 장갑이 놓여 있었다. 세린이 16년 동안 쥐고 있던 것들이다.');
    } else {
      if (type === 'share') {
        await c.say(null, ['흰빛이 터졌다. 대륙에서 날아온 모든 빛과 섞여, 온 방을 가득 채웠다.', '흑점은 비명을 지르지 않았다. 그저… 흩어졌다. 수천, 수만 개의 작은 조각으로.', '조각 하나하나에서 작은 목소리가 났다. 사내아이의 목소리, 검을 쥔 여자의 목소리. …고마워, 라고. 조각들은 하늘로 흩어져 하나씩 작은 별이 되었다.']);
      } else if (type === 'atone') {
        await c.say(null, ['흰빛이 터졌다. 대륙에서 날아온 빛과 섞여 흑점을 찢었다.', '…그러나 모자랐다. 흩어지지 못한 검은 조각 하나가 수정 위에서 다시 뭉치기 시작했다. 세린을 향해.']);
        await c.say('kairon', ['……계산하지 않겠다. 이번엔.', '빛이 모자라면 그릇이 필요하지. 16년 동안 대륙의 빛을 모은 그릇이 여기 하나 있다. 흰빛은 아니지만, 무게는 충분하다.']);
        await c.say('@', '안 돼! 그럼 엄마랑 똑같잖아!');
        await c.say('kairon', ['똑같지 않다. 세린은 혼자 삼켰다. 나는… 네가 흩다 남긴 것만 삼킨다. 조각 하나.', '그리고 기한이 있다. 대륙이 나누는 법을 다 배울 때까지. 네가 가르쳐라. 16년보다는 짧게.', '…3,118명. 그 숫자를 품고 자는 것도, 내 몫이다.']);
        await c.narr(['카이론이 수정에 손을 얹었다. 검은 조각이 그를 향해 쏟아졌다. 황금빛 수정이 이번엔 그를 감쌌다.', '수정 속에서 그는 처음으로, 계산하지 않는 얼굴로 잠들었다. 그리고 옆의 수정이— 세린의 수정이 깨졌다.']);
        if (s.flags.called_father) await c.say('@', '……아버지. 금방 올게. 아니, 금방은 단위가 아니지. …꼭 올게.');
      } else {
        await c.say(null, ['흰빛이 터졌다. 대륙에서 날아온 빛과 섞여 흑점을 찢었다.', '…그러나 모자랐다. 흩어지지 못한 검은 조각 하나가 수정 위에서 다시 뭉치기 시작했다.']);
        c.music('hollow');
        await c.narr('그때, 제단의 그림자 하나가 일어섰다. 고양이 모양의 그림자. 등불도 없는데 그림자가 먼저 걸어 나왔고, 실크해트를 쓴 검은 고양이가 뒤따라 나왔다.');
        await c.say('midnight', ['…고양이 말을 품고 왔다며. 그럼 고양이가 값을 치러야지.', '천 년 전에 그 녀석 어깨에서 떨어진 게 나야. 저건 그 녀석의 나머지고. 원래 하나였던 거라네.']);
        await c.say('midnight', ['걱정 말게. 조금씩 먹는 건 내 특기야. 천 년 동안 한 달에 등불 하나. 이것도 그렇게 먹지. 천 년이 걸리든 이천 년이 걸리든.', '…블랙 마을 하늘에 검은 별이 하나 뜨면, 나라네. 등불은 계속 켜 두라고 전해 주게. 배고플 때 보게.']);
        c.flash('#2a2040', 1200);
        await c.narr(['고양이가 입을 벌렸다. 검은 조각이 고양이의 그림자 속으로 가라앉았다. 천천히, 아주 천천히. 한 입씩.', '마지막으로 실크해트가 바닥에 떨어졌다. 고양이는 없었다. 아스트라 하늘에, 고양이 귀 모양의 검은 별이 하나 떴다.', '그리고 수정이 깨졌다.']);
        c.decide('midnight_star', 'yes', '미드나잇이 남은 배고픔을 삼키고 검은 별이 되었다');
      }
      fate = await serinAwakens(c, type);
      if (type === 'share' || type === 'night') {
        if (persuaded) {
          await c.say('kairon:sad', ['……세린.', '미안하다. 16년 동안… 계산만 했다. 너를 태우는 계산까지 했다. 네가 틀렸다고 믿어야 버틸 수 있었어.']);
          await c.say('serin', fate === 'keep' ? ['…기억이 반은 비었는데, 당신한테 화내야 한다는 건 알겠어.', '그래도 계산하지 말고 차나 마셔. …그리고 울어도 돼. 16년 치.'] : ['알아, 카이론. 다 들렸어. 계산하지 말고 차나 마셔.', '…그리고 울어도 돼. 16년 치.']);
          await c.say(null, '카이론이 울었다. 대륙의 절대 강자가, 열아홉 살 소년처럼.');
        } else {
          await c.say('kairon', ['……세린.', '…나는 졌다. 검으로. 그래서 아직 모르겠다. 내가 틀렸는지.']);
          await c.say('serin', ['괜찮아. 모르는 채로 와도 돼. 스승님이 밥 차려 놓고 기다리신대.', '틀렸는지는… 밥 먹으면서 천천히 세. 당신 세는 거 잘하잖아.']);
          await c.say(null, '카이론은 울지 않았다. 대신 세린이 내민 손을 아주 오래 보다가, 잡았다.');
        }
        await c.say('kairon', ['…챔피언의 자리는 너의 것이다. 대륙의 절대 강자.', '경험세는 오늘로 폐지한다. 탑은… 나눔탑으로 바꾸자. 볼트가 좋아하겠군.']);
      } else await c.say('serin:sad', '…바보. 16년 늦게 배워 놓고, 배우자마자 쓰네.');
      c.give('serin_glove');
      c.give('t13');
      await c.say('serin', type === 'atone' ? '이건 엄마가 끼던 장갑이야. 그리고 이건 아우룸 할아버지가 남긴 무한 장갑. …둘 다 끼고 가르치러 가자. 나누는 법을. 저 사람 꺼내러.' : '이건 엄마가 끼던 장갑이야. 버튼 누를 때 끼렴. …그리고 이건 아우룸 할아버지가 남긴 무한 장갑. 수정 속에서 16년 동안 쥐고 있었어.');
    }
    const final = type === 'share' ? (fate === 'give' ? 'true' : fate === 'return' ? 'dawn' : 'nest') : type;
    s.flags.ending_type = final;
    s.flags.toria_fate = fate;
    seeEnding(s, final);
    c.quest('m12', 'done');
    await c.fadeOut(1200, true);
    c.music('rainbow');
    await c.narr(['그날 밤, 무한호는 두 번째로 폭발하지 않았다.', '천년력 1000년 새싹의 달 11일. 무지개 마을. 천년제.']);
    c.quest('m13', 0);
    await c.warp('festival', 19, 20, 'up', { instant: true, noBanner: true });
    await c.fadeIn(1000);
    if (fate === 'return') await c.say('serin', ['…다들 왔어. 대륙 사람들 전부.', '한 명씩 인사하자. 엄마랑 같이. …토리아가 하던 거, 오늘은 엄마가 할게.']);
    else await c.say('dotori:happy', final === 'true' || final === 'nest' || final === 'night' ? ['찍! 다들 왔어! 대륙 사람들 전부!', '한 명씩 인사하자! 할머니랑 엄마는 샘 앞에서 기다린대!'] : final === 'atone' ? ['…다들 왔어. 엄마도 왔어.', '한 명씩 인사하자. 할머니랑 엄마가 샘 앞에서 기다려. …자리 하나는 비워 뒀대.'] : ['…다들 왔어. 대륙 사람들 전부.', '한 명씩 인사하자. 할머니가 샘 앞에서 기다려. 옆자리 둘은 비워 뒀대.']);
  }
  /** 수정이 깨지고 세린이 깨어난다 — 마음 한 조각이 빈 채로. 토리아의 정체와 마지막 갈림길 */
  async function serinAwakens(c, type) {
    const s = c.s;
    c.music('mother');
    await c.say(null, '쨍그랑—. 봉인의 수정이 깨졌다. 흰 머리칼의 여인이 천천히 눈을 떴다.');
    await c.npc('serin').walk('DDD', 0.6);
    await c.narr('…눈동자에 색이 없었다. 잿빛. 16년 동안 무언가에 먹혀 온 자리.');
    await c.say('serin', ['……', '…여기가, 어디지.']);
    await c.say('@', '……엄마?');
    c.music('requiem');
    await c.say('serin', ['엄마…?', '…미안해. 누구니? 목소리는… 좋은데.']);
    if (type !== 'atone') { await c.say('kairon:sad', '세린. …나다.'); await c.say('serin', '…카이론. 늙었네. 계산만 하더니.'); }
    await c.say('serin', ['카이론은 기억나. 스승님도. 베라 선생님의 찻잔도. …그런데 이상해. 그 사이에 뭔가 아주 큰 게 비어 있어.', '가슴 한가운데가. 누가 떼어 간 것처럼.']);
    c.light(80);
    c.flash('#fff8e0', 700);
    await c.narr('토리아의 몸에서 흰빛이 새어 나왔다. 16년 동안 레벨 9에 멈춰 있던 작은 몸에서. 수정과 똑같은 빛이.');
    await c.say('dotori:surprise', ['……찍. 뭐야, 이거. 뜨거워.', '……아.']);
    await c.say('dotori:sad', ['…기억났어. 수정에 들어가기 직전이야. 세린이 나를 쓰다듬은 게 아니야.', '나를 [w]만든[/] 거야. 떼어서. 자기 마음에서. 아기를 기억하는 부분만. 흑점한테 안 먹히게.']);
    await c.say('dotori:sad', ['그래서 16년 동안 레벨 9였던 거야. 다람쥐가 아니었으니까.', '그래서 못 날았던 거야. 마음은… 무거우니까. 그래서 그 자장가를 알았던 거야.']);
    await c.say('dotori', ['{n}. 내가 너 따라다닌 거, 할머니가 시켜서가 아니야.', '…엄마가 너를 보고 싶어서였어. 16년 동안. 매일.']);
    c.abyss('a_toria');
    await c.say('serin', '……왜, 눈물이 나지. 저 작은 애를 보는데.');
    await c.say('dotori', ['내가 돌아가면, 세린은 다시 엄마가 돼. 너를 기억하는 엄마.', '대신 나는… 없어져. 토리아는 원래 없었던 거니까.']);
    await c.say('dotori', ['안 돌아가면, 나는 여기 있어. 레벨 10 하늘다람쥐로. 세린은 너를… 처음부터 다시 알아가야 해.', '…정해 줘. 나는 못 정하겠어. 16년 동안 네 옆에 있었는데, 16년 동안 엄마였는데, 어느 쪽이 나인지 모르겠어.']);
    const opts = [['return', '돌아가, 토리아. 엄마한테.'], ['keep', '가지 마. 엄마는… 처음부터 다시 알아가면 돼.']];
    if (type === 'share' && G.story.canGive(s)) opts.push(['give', '[y]내 빛을 줄게. 엄마의 빈자리에.[/]']);
    const fate = opts[await c.ask('토리아', opts.map((o) => o[1]))][0];
    if (fate === 'return') {
      await c.say('dotori:sad', ['……응.', '그럴 줄 알았어. 너는 엄마를 되찾으러 여기까지 온 거니까. 그게 맞아.']);
      await c.say('dotori', '마지막으로 하나만. …나 날아 볼게. 3초 말고. 제대로.');
      c.music('dream');
      await c.narr('토리아가 뛰어올랐다. 떨어지지 않았다. 제단을 한 바퀴, 두 바퀴. 날 때마다 몸이 조금씩 투명해졌다.');
      await c.say('dotori:happy', ['봐! 나 날아! 10초! 20초! …계속 날아!', '무거운 게 빠져나가니까 가벼워. 이렇게 가벼운 거였구나, 하늘다람쥐.']);
      await c.say('dotori', ['{n}. 오늘도 렙업.', '…대답은 엄마한테 해. 이제 엄마가 물어볼 거야. 매일.']);
      c.flash('#ffffff', 1600);
      c.follow(null);
      await c.narr('작은 빛이 세린의 가슴으로 날아들었다. 거기 남은 것은 흰 털 한 가닥뿐이었다.');
      c.music('mother');
      await c.say('serin', ['………', '……아가.']);
      await c.narr('세린의 잿빛 눈동자에 색이 돌아왔다. 16년 전의 색. 세린이 {n}을(를) 안았다. 16년 치의 포옹이었다. 그리고 작은 하늘다람쥐 한 마리 몫의 포옹이었다.');
      await c.say('serin:sad', ['토리아가 16년 동안 본 게 전부 들어왔어. 네가 걸음마 하던 날. 할머니 약초 바구니 엎던 날. 버튼 누르던 날.', '…나는 그걸 전부 다람쥐 눈으로 봤구나. 고마워, 토리아. 고마워.']);
      await c.say('serin', '…오늘도 렙업?');
      await c.say('@', '…내일도 렙업.');
      c.decide('toria', 'return', '토리아가 세린에게 마음을 돌려주었다');
    } else if (fate === 'keep') {
      await c.say('dotori:sad', ['……정말? 나 있어도 돼?', '…찍. 찍찍. 바보. 엄마 되찾으러 와 놓고.']);
      await c.say('serin', ['…괜찮아. 나는 괜찮아.', '비어 있는 자리는 채우면 돼. 처음부터. 너에 대해 하나씩 알려 줄래? 좋아하는 음식부터.']);
      await c.say('@', '옥수수죽. 할머니가 끓인 거.');
      await c.say('serin', '…옥수수죽. 기억할게. 이번엔 수정 말고 머리로.');
      await c.narr('토리아의 몸에서 흰빛이 천천히 가라앉았다. 이제 그 빛은 토리아의 것이다. 16년 동안 키운 마음이니까.');
      await c.say('dotori:happy', ['…어? 몸이 이상해. 뭔가 차올라.', '레벨 11! 찍! 16년 만에 두 번째 렙업이야!']);
      await c.say(null, '토리아가 날았다. 3초. 딱 3초. 그리고 네 발로 착지해서, 세린의 발등에 앉았다. 세린이 자기도 모르게 토리아를 쓰다듬었다. 16년 전과 똑같은 손길로.');
      c.decide('toria', 'keep', '토리아를 붙잡았다. 세린은 처음부터 다시 알아 가기로 했다');
    } else {
      await c.say('@', '엄마가 날 기억 못 하면, 내가 기억하는 엄마를 줄게.');
      await c.say('dotori:surprise', '……그게 돼?');
      await c.narr('버튼을 쥐었다. 아우룸의 버튼. 누를 때마다 빛을 흩고, 흩지 않으면 그릇을 키우던 것.');
      await c.sys('세린의 손을 잡고 [y]렙업 버튼을 60번[/] 누르자. 흰빛을 전부 흘려보낸다.');
      c.music('dream');
      await c.waitClick(60, (n) => { if (n % 10 === 0) { c.flash('#ffffff', 220); c.light(10); } });
      c.flash('#ffffff', 2000);
      await c.narr(['흰빛이 손바닥에서 빠져나갔다. 강물처럼. 16년 동안 기다린 것, 바란 것, 원망한 것, 그리운 것. 전부 빛이 되어 세린에게 흘러갔다.', '마지막 한 방울이 빠져나갔을 때, 가슴 한가운데가 조용해졌다. 바닥 없는 그릇이… 닫혔다.']);
      c.music('mother');
      await c.say('serin', ['………', '……아가. 네가 보던 엄마가 들어왔어. 할머니 부엌에서 상상하던 엄마. 버튼을 백만 번 누른 손.', '나보다 훨씬 좋은 엄마네. …그렇게 될게.']);
      await c.say('dotori:happy', ['찍! 나, 나는? 나 안 없어졌어!', '…어? 가벼워. 이상해. 마음은 그대로 있는데 가벼워.']);
      await c.say('serin:happy', ['그 마음은 이제 네 거야, 토리아. 16년 동안 네가 키웠잖아. 내 것보다 커졌어.', '약속 지켜 줘서 고마워. 이제 너도 커도 돼.']);
      await c.say('dotori:happy', ['…어? 어어? {n}! 나 봐! 나 떠 있어! 3초 지났는데 계속 떠 있어!']);
      await c.say(null, '토리아가 날았다. 3초가 아니라, 제단을 세 바퀴 도는 동안 내내. 토리아는 날면서 울었다.');
      await c.narr('{n}은(는) 버튼을 한 번 더 눌러 보았다. 작은 빛이 터졌다. …초록빛이었다. 그린 마을 사람들의 색.');
      await c.say('kairon', ['…흰빛이, 끝났군.', '바닥 없는 그릇이 없으면, 배고픔도 돌아갈 곳이 없다. 천 년 동안 아무도 계산하지 못한 식이다.']);
      c.set('hero_green');
      c.decide('toria', 'give', '흰빛을 전부 세린에게 주었다. 토리아도 세린도 남았다');
    }
    const f = s.flags;
    if (f.mom_feel_angry) await c.say('serin', ['…원망했지. 토리아한테 한 말, 이제 다 기억나.', '원망해도 돼. 그 말 들으려고 16년 버텼어. 원망은 살아 있는 사람한테만 할 수 있으니까.']);
    else if (fate !== 'keep') await c.say('serin', ['네가 등대를 켜고, 롤로 머리를 분홍으로 물들이고, 여기까지 온 거. 다 알아.', '…나보다 훨씬 잘했어. 나는 혼자 삼켰는데, 너는 나눴잖아.']);
    if (fate !== 'keep' && f.hero_streak) await c.say('serin:sad', '…앞머리. 하얀 한 가닥. 누구한테 나눠 줬구나. 엄마는 화 안 낼게. 대신 쓰다듬게 해 줘.');
    return fate;
  }

  /* ───────── 어두운 결말: 재 · 되풀이 ─────────
     끝난 뒤에는 수정 앞으로 돌아간다. 본 결말은 일지에 남는다. */
  async function endingAsh(c) {
    const s = c.s;
    c.music('hollow');
    await c.say('kairon', ['……', '…그 말을, 네 입으로 듣게 될 줄은 계산하지 못했다.']);
    await c.say('dotori:surprise', ['{n}?! 무슨 소리야! 엄마야!', '…엄마라고!']);
    await c.say('@', '…흑점이 되면, 엄마는 엄마가 아니잖아. 3,118명보다 더 죽잖아. …태워요.');
    await c.say('kairon', '…그래. 너는 나를 닮았군. 그게 제일 무섭다.');
    c.shake(1500, 6);
    c.flash('#b89aff', 900);
    c.sfx('rumble');
    await c.say(null, '하늘 너머 대륙에서 보랏빛 기둥이 솟아올라 아스트라에 꽂혔다. 이번엔 아무도 흐름을 뒤집지 않았다.');
    c.music('dread');
    c.flash('#ffffff', 1500);
    await c.narr(['빛이 수정에 닿았다. 수정이 녹았다. 안에서 검은 것이 비명을 질렀다. 여러 목소리로. 사내아이의 목소리, 검을 쥔 여자의 목소리.', '그리고 마지막에, 아주 작게, 익숙한 목소리.']);
    await c.say('serin', ['……아가. 눈 감아.', '…괜찮아. 뜨겁지 않아. 고마워. 태워 줘서.']);
    c.music(null);
    await c.wait(1.5);
    await c.narr(['조용해졌다. 제단 위에 흰 재가 한 줌 남았다. 재 속에 손끝이 닳은 흰 장갑 한 짝.', '황금별 옆의 검은 점은 사라졌다. 계산대로였다.']);
    await c.say('kairon', ['……계산이, 맞았다.', '16년 만에 처음으로. …맞았는데.']);
    await c.narr('카이론은 재 앞에 무릎을 꿇고, 오래 일어나지 않았다. 대륙의 절대 강자가 재를 두 손으로 떠서 품에 넣었다. 흘리지 않으려고 계산하듯이, 한 톨씩.');
    await c.say('dotori:sad', ['………', '……{n}. 나, 이상해. 가슴이 뚫린 것 같아. 누가 여기를 태운 것 같아.']);
    await c.fadeOut(1400, true);
    c.music('requiem');
    await c.narr(['천년력 1000년. 경험세는 폐지되었다. 탑은 무너졌다. 대륙의 아이들은 레벨 10을 넘겼다. 흑점은 다시 오지 않았다.', '사람들은 챔피언이 대륙을 구했다고 했다. 챔피언은 그 뒤로 아무 말도 하지 않았다.', '그린 마을 오두막. 할머니는 벽에 빗금을 더 긋지 않았다. 대신 매일 밥 네 그릇을 펐다. 한 그릇은 늘 식었다.', '버튼은 다시 장롱에 들어갔다. 누구도 그것을 꺼내지 않았다.', '…토리아는 그해 겨울, 레벨 9인 채로 잠들었다. 가슴이 아프다고 했다. 뭐가 아픈지 모르겠다고 했다.']);
    await darkClose(c, 'ash');
  }
  async function endingRepeat(c) {
    const s = c.s;
    c.music('hollow');
    await c.say('kairon', ['……무슨 소리를.', '…그건 계산에 넣지 않았다. 넣지 않으려고 16년을 셌다.']);
    await c.say('dotori:surprise', ['안 돼! {n}! 그럼 똑같잖아! 엄마랑 똑같잖아!', '16년 뒤에 누가 또 여기 와서 울어야 하잖아!']);
    await c.say('@', '…16년이면 돼. 그동안 방법을 찾아 줘.');
    await c.say('kairon', '……세린도 그렇게 말했다. 똑같은 말을.');
    c.music('dread');
    await c.narr(['수정에 손을 댔다. 차갑지 않았다. 안쪽에서 누군가 손을 마주 댔다. 잿빛 손. 흰 장갑을 낀.', '검은 것이 손바닥으로 흘러들었다. 배고픔이 흘러들었다. 천 년 치.']);
    c.flash('#0b0a1c', 1500);
    await c.narr('수정이 깨지고, 세린이 쓰러지듯 밖으로 나왔다. 그리고 새 수정이 자라기 시작했다. 발끝부터.');
    await c.say('serin:sad', ['……아가?', '…안 돼. 안 돼, 안 돼. 이러려고 16년 버틴 게 아니야—']);
    await c.fadeOut(1000, true);
    c.music('hollow');
    await c.narr(['수정 속은 조용했다. 그리고 따뜻했다. 누군가 속삭였다.', '「어서 와.」 사내아이의 목소리.', '「네 번째구나.」 검을 쥔 여자의 목소리.', '「…미안해, 아가.」 익숙한 목소리.', '「배고프지? 괜찮아. 우리 다 그래.」']);
    await c.wait(1);
    c.music('requiem');
    await c.narr(['천년력 1016년. 새싹의 달. 그린 마을.', '언덕 위 오두막에서 갓난아기가 처음으로 손가락을 꼭 쥐었다. 작은 빛이 터졌다.', '…하얀 빛이었다.']);
    await c.narr(['부엌에서 흰 머리칼의 여인이 그 빛을 보았다. 여인은 한참을 서 있다가, 장롱을 열었다. 버튼이 있었다. 여인의 손이 떨렸다.', '「……또야.」', '벽에 연필로 첫 번째 빗금이 그어졌다.']);
    await darkClose(c, 'repeat');
  }
  async function darkClose(c, type) {
    const s = c.s;
    seeEnding(s, type);
    c.music('ending');
    await c.chapter('끝', '무한렙업 대모험', '결말 — ' + G.story.ENDINGS[type].name);
    const seen = Object.keys(G.story.ENDINGS).filter((k) => (s.endings || {})[k]).length;
    await c.narr(['[y]결말 — ' + G.story.ENDINGS[type].name + '[/]\n' + G.story.ENDINGS[type].desc + '\n\n본 결말 ' + seen + ' / ' + Object.keys(G.story.ENDINGS).length,
      '이것도 하나의 끝이다. 하지만 이야기는 한 번 더 기회를 준다.\n수정 앞, 그 선택의 순간으로 돌아간다.']);
    await c.fadeOut(600, true);
    s.flags.finale_rewind = true;
    await c.warp('astra_seal', 12, 10, 'up', { instant: true, noBanner: true });
    c.music('planet');
    await c.fadeIn(900);
    await c.say('dotori:worry', ['……{n}? 왜 그래? 얼굴이 하얘.', '…꿈 꿨어? 서서?']);
    G.main.save(true);
  }

  /* ───────── 에필로그: 천년제 밤 ───────── */
  const FEST = [
    ['gran', 18, 11, 'down', null], ['serin', 20, 11, 'down', null], ['kairon', 23, 13, 'left', 'kairon'], ['nocturne', 24, 14, 'left', 'nocturne'],
    ['bomi', 15, 16, 'right', 'bomi'], ['chul', 16, 17, 'left', 'chul'], ['kongsun', 12, 18, 'down', 'kongsun'], ['dolsoe', 13, 18, 'down', 'dolsoe'], ['ijang', 11, 17, 'down', 'ijang'],
    ['hwaro', 26, 18, 'down', 'hwaro'], ['rud', 27, 16, 'left', 'rud'], ['lea', 28, 16, 'left', 'lea'], ['luka', 26, 16, 'down', 'luka'], ['rumi', 25, 16, 'down', 'rumi'], ['galaxy', 30, 18, 'down', 'galaxy'],
    ['haemi', 9, 12, 'down', 'haemi'], ['mukmul', 8, 12, 'down', 'mukmul'], ['bitna', 12, 20, 'down', 'bitna'], ['captain', 13, 21, 'up', 'captain'],
    ['kkachi', 22, 21, 'up', 'kkachi'], ['goldie', 24, 22, 'up', 'goldie'], ['sahara', 25, 23, 'left', 'sahara'],
    ['vera', 13, 11, 'down', 'vera'], ['miru', 14, 12, 'down', 'miru'], ['lolo', 16, 21, 'up', 'lolo'], ['chaesaek', 19, 18, 'up', 'chaesaek'],
    ['lumie', 29, 12, 'down', 'lumie'], ['edel', 28, 12, 'down', 'edel'], ['bolt', 31, 15, 'left', 'bolt'], ['noel', 30, 15, 'right', 'noel'],
    ['midnight', 21, 24, 'up', 'midnight'], ['pangpang', 24, 24, 'up', 'pangpang'], ['ppeong', 25, 24, 'up', 'ppeong'], ['hunjang', 10, 16, 'right', 'hunjang'], ['park', 9, 19, 'right', 'park'],
  ];
  const LINES = {
    kairon: ['스승님께 밥을 얻어먹었다. 16년 만에. …맛있었다.', '계산을 멈추니 별이 보이는군. 스텔라가 붙인 이름들이 전부 이상하다.'],
    nocturne: ['카이론이 잠들었다. 16년 만에. 코를 곤다. …기록해 둘까.', '그림자는 빛이 있어야 생긴다. 오늘 밤은 빛이 많아서 그림자도 많다. 좋은 밤이다.'],
    bomi: ['레벨 11! 나 전설 될 거야! 네잎클로버는 그때 돌려받을게!'], chul: ['흥. 나는 12다. …근데 오늘은 베르나한테 져 줬어. 축제니까.'],
    kongsun: ['어머어머, 챔피언이 우리 동네 출신이라니! 벌써 온 대륙에 소문냈어!'], dolsoe: ['보고서에 뭐라고 쓸지 이제 고민 안 해도 돼. 기사단이 해체됐거든. …대장간으로 돌아갈 거야.'],
    ijang: ['나는 처음부터 네가 해낼 줄 알았네. 아니, 반신반의했네. 아니… 처음부터 알았네. 이건 안 바꾼다네.'],
    hwaro: ['에벨린 누님 손주가 챔피언이라니! 오늘 밤은 망치질 대신 건배다! 렙업!'], rud: ['숫자는 거짓말 안 해. 천년성 제어실, 오차 0초. …빚은 갚았다. 1,000골드, 탑 하나, 그리고 대륙 전부.'],
    lea: ['새벽단은 오늘 해산했어. 부술 탑이 없거든. 이제 뭘 하지? …루드랑 떡볶이나 먹으러 갈까.'], luka: ['내 머리 봐! 빨개! 형이랑 똑같아!'], rumi: ['색연필이 전부 다른 색으로 보여! 무지개 그릴 거야. 진짜 색으로!'],
    galaxy: ['흑점이 흩어져서 별이 생겼어. 오늘 밤에만 3,812개. 이름 붙이다 늙어 죽겠군. …행복한 고민이야.'],
    haemi: ['그, 금서가 전부 풀렸어요! 세린 씨 책, 이제 누구나 빌릴 수 있어요. 대출 카드 첫 줄에 제 이름 쓸 거예요.'], mukmul: ['약속을 지켰네, 세린. …놀라서 먹물이 또 나왔군. 이건 기쁨의 주석일세.'],
    bitna: ['아빠가 돌아왔어! 눈은 안 보이지만 등대 불빛은 따뜻하대! 그걸로 충분하대!'], captain: ['고등어호 타고 여기까지 왔다. …우웩. 30년째. 축제 날에도.'],
    kkachi: ['금화왕이 창구 문을 닫았어. 애들 경험, 전부 돌려받았어. 나는 레벨 30! …근데 금화왕은 여전히 될 거야. 사는 사람 말고 나눠 주는 금화왕.'],
    goldie: ['세린이 돌아왔으니 979년 빚을 받아야지. …아니, 백지 채권으로 퉁 쳤잖아. 장사 못 했다니까, 나.'], sahara: ['오늘 밤 새 별이 생겼어. 대상단의 새 길잡이 별이야. 이름은 네 이름으로 할게.'],
    vera: ['따뜻한 차예요. 16년 만에 식지 않은 차. 세린이랑 같이 마시니까 더 따뜻해요.'], miru: ['주문을 한 글자도 안 틀렸어! …근데 불 대신 꽃이 피게 하는 게 더 좋아서 다시 틀리게 외울 거야.'],
    lolo: ['분홍 광대의 개막 공연! 맨 앞자리는 너랑 토리아 거야! 웃음은 색이 없어도 보이지만, 오늘은 전부 알록달록해!'], chaesaek: ['999년… 아니, 87년 기다린 보람이 있어요! 이렇게 예쁜 천년제는 천 년에 한 번뿐이에요!'],
    lumie: ['기도 대신 박수를 쳤어요. 16년 만에. …손바닥이 아프네요. 이것도 괜찮은 아픔이에요.'], edel: ['투구를 벗었소. 축제니까. …바람이 시원하오.'],
    bolt: ['탑은 전부 나눔탑으로 바꾼다. 렙업할 때 터진 빛을 옆 사람한테 보내는 탑이다. …쓸데없는 말은 연료 낭비지만, 이건 쓸모 있는 말이다.'], noel: ['불꽃 색 기록 중. 3,812가지. 전부 예쁘다. 계산 결과다.'],
    midnight: ['천 년 치 고등어 외상이 다 갚아졌군. 아우룸, 네 후계자는 계산이 정확하더군. 생선으로.'], pangpang: ['무한호 129번째 비행! 폭발 없음! 역사상 최초! …착륙할 때 조금 터졌지만 그건 세리머니야!'],
    ppeong: ['박사님이 하늘에 갔다 왔어! 폭발 없이! 거의! 대륙 역사상 가장 위대한 발명이야! 과장 아니야!'], hunjang: ['허허. 연대기 5권은 네 이야기로 쓰마. 「네 번째 흰빛, 나누다.」 빈칸 없이.'],
    park: ['두더지들이 휴전을 제안해 왔다. 27년 전쟁이 끝났다. …감자 반을 주기로 했다.'],
  };
  // 선택에 따라 달라지는 천년제의 한마디
  const ET = (s) => (s.flags.ending_type === 'share' ? 'true' : s.flags.ending_type || 'true');
  const FAMILY = (s) => ['true', 'dawn', 'nest', 'night'].includes(ET(s));
  const LINES2 = {
    kongsun: (s) => (s.flags.d_report === 'lie' ? ['어머어머, 챔피언이 우리 동네 출신이라니! …우리 양반 봤어? 광산에서 곧장 왔대. 도시락 먹으면서.', '그 양반이 그러는데, 번개 본 날이 인생에서 제일 잘한 날이래. 어머, 번개는 본 적도 없으면서.'] : LINES.kongsun),
    dolsoe: (s) => (s.flags.d_report === 'truth' ? ['천년성 정문 경비가 이제 할 일이 없다. 기사단이 해체됐거든.', '사실대로 쓴 보고서 한 장이 여기까지 왔네. …카렐한테 자랑할 거다. 이번엔 진짜로.'] : s.flags.d_report === 'lie' ? ['광산 문지기 마지막 날이었다. 곡괭이 소리 들으면서 퇴근했지.', '「번개」라고 쓴 거, 후회 안 한다. …다음엔 그냥 사실대로 쓸 거지만.'] : LINES.dolsoe),
    chul: (s) => (s.flags.d_report === 'truth' ? ['흥. 나는 12다. …우리 아빠 봤어? 천년성 정문 경비였대. 멋있지. 흥.'] : LINES.chul),
    kkachi: (s) => (s.flags.d_kkachi === 'report' ? ['…장부 정리 끝났어. 금화왕이 나한테 거래소 열쇠를 줬어. 「네가 닫든지 열든지 해라.」', '닫았어. 애들 경험 전부 돌려줬어. …너한테 고맙다고는 안 할 거야. 그래도 여기까지 온 건… 네 덕도 조금 있어.'] : LINES.kkachi),
    goldie: (s) => (s.flags.d_goldie === 'expose' ? ['거래소는 다시 안 연다. 장부를 뿌린 녀석 덕에.', '…사하라 천막에서 셈 배우던 애들이 오늘 나한테 계산서를 들고 왔더군. 16년 치 이자까지. 제대로 배웠어. 나쁘지 않아.'] : s.flags.d_goldie === 'contract' ? ['계약서 증인이 챔피언이 됐군. 이제 그 계약서는 대륙에서 제일 비싼 종이다.', '세린이 돌아왔으니 979년 빚을 받아야지. …아니, 백지 채권으로 퉁 쳤잖아. 장사 못 했다니까, 나.'] : LINES.goldie),
    lea: (s) => (s.flags.d_festival === 'bomb' ? ['중계탑은 무너졌어. 계획대로. …바람이 불었어. 계산에 없던 바람.', '롤로 팔은 석 달이면 붙는대. 나는 평생 안 붙을 것 같아. 여기가.'] : s.flags.d_festival === 'warn' ? ['새벽단은 해산했어. 부술 탑이 없으니까. 너 때문에 한 번 잡혔고, 에델 때문에 풀려났고.', '…원망은 다 셌어. 루드 식으로. 0이더라.'] : LINES.lea),
    rud: (s) => ((s.bond || {}).rud >= 2 ? ['숫자는 거짓말 안 해. 천년성 제어실, 오차 0초.', '…빚은 갚았다. 1,000골드, 탑 하나, 그리고 대륙 전부. 이제 네가 나한테 빚진 거야. 숫자로 적어 둘게.'] : ['숫자는 거짓말 안 해. 천년성 제어실, 오차 0초.', '…너한테는 아직 할 말이 정리가 안 됐어. 셀 수 없는 건 셀 수 있을 때까지 미뤄 둘 거야.']),
    lolo: (s) => (s.flags.d_festival === 'bomb' ? ['(팔에 붕대를 감은 롤로) 오른팔은 쉬는 중! 왼팔로 저글링 세 개! 관객들이 더 좋아해!', '…무대가 기울 때 무서웠어. 근데 공연은 끝까지 했어. 웃음은 색이 없어도 보이니까.'] : LINES.lolo),
    lumie: (s) => (s.flags.d_patient === 'lumie' ? ['(하얀이 루미에의 휠체어를 민다) 하얀이가 매일 밀어 줘요. 제가 주던 사탕을 이제 제가 받아요.', '기도 대신 박수를 쳤어요. 16년 만에. …손바닥이 아프네요. 이것도 괜찮은 아픔이에요.'] : LINES.lumie),
    bolt: (s) => (s.flags.d_bolt === 'talk' ? ['탑은 전부 나눔탑으로 바꾼다. 렙업할 때 터진 빛을 옆 사람한테 보내는 탑이다.', '…요즘 밤에 잔다. 아내 목소리가 그러라고 했으니까. 연료 낭비가 아니었다.'] : LINES.bolt),
    hwaro: (s) => (s.flags.d_ledger === 'burn' ? ['장부 태운 녀석이 챔피언이 됐다며! 약속대로 칼 한 자루 공짜다! 하하!'] : LINES.hwaro),
    bitna: (s) => (s.quests.q_keeper === 'done' ? LINES.bitna : ['등대 불은 켜져 있어. 아빠는 아직이야.', '…블랙 마을에 눈먼 등대지기가 있다는 소문을 들었어. 내일 배 타고 가 볼 거야.']),
    kairon: (s) => (s.flags.called_father ? ['스승님께 밥을 얻어먹었다. 16년 만에. …맛있었다.', '아까 네가 부른 그 두 글자. …한 번만 더 들을 수 있겠나. 아니, 됐다. 계산하지 않겠다. 기다리겠다.'] : LINES.kairon),
    stella: (s) => (s.flags.toria_fate === 'return' ? ['(네 목도리로 옮겨 매단 단말기) …털뭉치 목도리가 아니라서 좀 춥네. 기록 안 해.', '토리아 기록은 전부 남아 있어. 16년 치는 아니지만, 우리랑 걸은 만큼은. 지우지 않을 거야. 이번엔 진짜로.'] : ['(토리아 목도리의 단말기) 불꽃 3,812가지. 기록 안 해.', s.flags.stella_confessed ? '…거짓말이야. 전부 기록 중. 400년 만에 사실대로 기록할 게 생겼어. 「돌아온 사람들」. 그리고 「돌아오지 못한 사람들」도.' : '…거짓말이야. 전부 기록 중. 400년 만에 기록할 게 생겼어. 「돌아온 사람들」.']),
    midnight: (s) => (s.flags.d_midnight_secret === 'keep' ? ['천 년 치 고등어 외상이 다 갚아졌군. 비밀도 지켜 줬고.', '…오늘 밤은 등불이 많아서 배가 부르네. 보기만 해도.'] : LINES.midnight),
  };
  W.map('festival', {
    name: '천년제 밤', sub: '천년력 1000년 새싹의 달 11일', region: 'rainbow', area: 'festival', theme: 'rainbow', bg: '#1a1040', ki: W.ki('planet', 1), music: 'rainbow', weather: 'spark', dark: 200, darkColor: 'rgba(10,6,30,0.5)',
    grid: G.maps.rainbow.grid,
    builds: G.maps.rainbow.builds.filter((b) => b.style !== 'tower'),
    lights: [{ x: 19, y: 13, r: 80, c: '#ffffff' }, { x: 10, y: 15, r: 60, c: '#ff8ac8' }, { x: 28, y: 15, r: 60, c: '#ffd84a' }],
    edges: { left: { to: 'rainbow_bridge', tx: 43, ty: 7 }, up: { to: 'cloud_sea', tx: 21, ty: 31 } },
    npcs: FEST.concat([['stella', 21, 20, 'up', 'stella']]).map(([id, x, y, dir, key]) => ({
      id, x, y, dir,
      cond: id === 'serin' ? (s) => ET(s) !== 'glow' : id === 'kairon' || id === 'nocturne' ? FAMILY : id === 'stella' ? (s) => !!s.flags.stella_ally : id === 'midnight' ? (s) => ET(s) !== 'night' && s.flags.d_midnight_secret !== 'tell' : undefined,
      talk: key ? W.chatter('fest_' + key, LINES2[key] || LINES[key], id) : festFamily,
    })),
    objs: [],
  });
  async function festFamily(c) {
    const s = c.s;
    const type = ET(s), fate = s.flags.toria_fate, EN = G.story.ENDINGS[type];
    const serinHere = type !== 'glow';
    if (s.quests.m13 === 'done') {
      await c.run(W.chatter('fest_family', type === 'glow' ? [
        (c2) => c2.say('gran', '오늘도 렙업? …그래, 내일도 렙업. 니 엄마 꺼내러 갈 날까지, 할매는 매일 묻는다.'),
        (c2) => c2.say('gran', '빈자리 둘. 매일 밥 두 그릇 더 한다. 식어도 괜찮다. 할매는 식은 밥 잘 먹는다.'),
      ] : [
        (c2) => c2.say('gran', type === 'atone' ? '오늘도 렙업? …그래. 그 고집불통 꺼내러 가는 날, 할매도 데려가래이. 한 대 쥐어박게.' : s.flags.gran_pact_talked ? '오늘도 렙업? …그래, 내일도 렙업. 벽에 빗금은 인자 안 긋는다. 대신 니 키를 긋는다.' : '오늘도 렙업? …그래, 내일도 렙업. 인자 할매는 그 대답만 들으면 된다.'),
        (c2) => c2.say('serin', type === 'atone' ? '매일 밤 수정에 차를 한 잔씩 올려. 식기 전에 나오라고. …그 사람, 계산 안 하고 잘 자고 있더라.' : fate === 'return' ? '가끔 가슴이 찍, 하고 울 때가 있어. …그럴 땐 하늘을 봐. 다람쥐 모양 구름 없나 하고.' : '엄마는 이제 아무 데도 안 가. 대신 네가 가고 싶은 데 같이 가자.'),
      ], 'gran'));
      return;
    }
    await c.say('gran', ['왔나. …다 인사했나?', '마, 앉아라. 불꽃 보자.']);
    // 져 준 싸움: 할머니가 먼저 꺼낸다
    if (s.abyss && s.abyss.a_gran && !s.flags.gran_pact_talked) {
      s.flags.gran_pact_talked = true;
      c.music('requiem');
      await c.say('gran:sad', ['…그 고집불통한테 들었제. 983년 일.', '할매가 져 줬다. 창을 내려놨다. 니를 안고 나올라꼬. 그라고… 약속을 했다. 니가 열여섯 되는 해에, 계산이 틀리믄, 니를 데려가기로.']);
      await c.say('gran:sad', ['처음 삼 년은… 할매가 니를 키운 기 아이라 그릇을 키웠다. 약초 이름 가르치믄서 속으로 날짜를 셌다. 벽에 빗금 그으믄서.', '그라다가 니가 처음 할매라꼬 불렀다. 그날부터 빗금이 무거버지더라. 5,844개. 하나도 안 가볍더라.']);
      await c.say('gran', ['올해 새싹의 달 11일에 빨간 동그라미 쳐 놨었다.', '…니 생일 아침에 장롱에서 버튼 꺼낸 거. 그기 할매가 약속을 깬 기다. 그 고집불통이 버튼은 주지 마라 캤거든. 버튼 없으믄 그릇도 안 큰다꼬.']);
      const k = await c.ask('할머니에게', ['…용서할게.', '왜 이제 말해.', '(말없이 할머니 손을 잡는다)']);
      if (k === 0) {
        await c.say('gran:sad', ['……용서하지 마라.', '용서하믄 할매가 미안해할 데가 없어진다. 할매는 죽을 때까지 미안해할 끼다. 그기 할매 몫이다.']);
        c.decide('gran_pact', 'forgive', '할머니의 983년 약속을 용서한다고 말했다');
      } else if (k === 1) {
        await c.say('gran', ['…이제야 안 무서버서. 니가 할매보다 세지니까.', '할매는 비겁하다. 약한 사람이 말하믄 변명이고, 센 사람이 들으믄 고백이다. 그래서 니가 세질 때까지 기다렸다.']);
        c.decide('gran_pact', 'ask', '할머니에게 왜 이제야 말하느냐고 물었다');
      } else {
        await c.narr('할머니 손은 약초 물이 들어 초록색이었다. 16년 동안 빗금을 그은 손. 손이 떨렸다. 한참 뒤에야 멈췄다.');
        c.decide('gran_pact', 'hold', '할머니의 손을 말없이 잡았다');
      }
      c.bond('gran', 2, true);
      c.music('rainbow');
    }
    if (serinHere) await c.say('serin', type === 'atone' ? ['엄마랑 할머니 사이에 앉아. 여기가 제일 잘 보여.', '…한 자리는 비워 뒀어. 그 사람 자리. 16년 늦게 배운 사람은 늦게 오는 법이야.']
      : fate === 'keep' ? ['엄마랑… 할머니 사이에 앉아. 여기가 제일 잘 보인대. 선생님이 그러셨어.', '…아직 네 생일도 몰라. 알려 줄래? 이번엔 안 잊을게.'] : ['엄마랑 할머니 사이에 앉아. 여기가 제일 잘 보여.']);
    else await c.say('gran', ['니 옆에 두 자리 비워 놨다. 니 엄마 자리, 니 아빠 자리.', '…비워 둔 자리는 채우라고 있는 기다. 급할 거 없다. 할매는 16년도 기다렸다.']);
    c.sfx('firework');
    c.flash('#ffd84a', 600);
    await c.say(null, '쾅, 쾅, 쾅—. 알록달록 마을의 불꽃 천 발이 무지개 마을 하늘에서 터졌다. 흩어지는 빛이 온 하늘을 덮었다.');
    c.sfx('firework');
    c.flash('#ff8ac8', 600);
    if (serinHere) {
      await c.say('gran', ['세린아. 니 아가 해냈다.', '…니도 해냈고.']);
      await c.say('serin:happy', fate === 'keep' ? ['선생님이 키웠잖아요. 16년 동안. …저는 기억이 안 나는데, 고맙다는 건 알아요.', '…고마워요, 엄마.'] : ['선생님이 키웠잖아요. 16년 동안.', '…고마워요, 엄마.']);
      await c.say('gran:sad', ['……엄마는 무슨. 할매다, 할매.', '…마, 눈에 불꽃 들어갔다.']);
    } else {
      await c.say('gran:sad', ['…세린아. 니 아가 해냈다. 반은.', '나머지 반은 우리가 할 차례다. 대륙이 다 같이. 니가 늘 말하던 대로.']);
      await c.say(null, '할머니가 하늘을 올려다보았다. 황금별 옆에 작은 빛 하나가 깜빡였다. 잔광처럼.');
    }
    if (type === 'night') await c.say(null, '블랙 마을 쪽 하늘에 검은 별 하나가 떴다. 고양이 귀 모양이다. 불꽃이 터질 때마다 조금씩, 아주 조금씩 작아지는 것 같았다.');
    if (fate === 'return') {
      await c.say('serin:sad', ['…토리아가 여기 있었으면, 지금 뭐라고 했을까.']);
      await c.say('@', '「찍.」');
      await c.say(null, '세린이 웃었다. 그리고 울었다. 웃으면서 우는 게 토리아랑 똑같았다.');
    } else if (s.flags.after_plan) await c.say('dotori', s.flags.after_plan === 'home' ? '…내일은 그린 마을로 가자. 약초 캐러. 세 잎만.' : s.flags.after_plan === 'road' ? '…내일부터 한 바퀴 더 돌자. 이번엔 천천히. 세금 안 떼이는 애들 얼굴 보러.' : '…끝난 다음 거, 내가 생각해 뒀어. 내일 말해 줄게.');
    c.sfx('firework');
    c.flash('#6ad86a', 600);
    if (fate === 'return') await c.say('serin:happy', ['{n}. 마지막 인사, 토리아 대신 엄마가 할게. 다 같이!', '하나, 둘, 셋!']);
    else await c.say('dotori:happy', ['찍! {n}! 마지막 인사 하자! 다 같이!', '하나, 둘, 셋!']);
    await c.say('@', '[big]오늘도 렙업![/]');
    await c.say(null, '[big]「내일도 렙업!」[/]\n무지개 마을 광장에 모인 대륙의 모든 사람이 대답했다.');
    if (type === 'true') await c.say(null, '광장의 사람들이 한꺼번에 버튼을 눌렀다. 초록, 빨강, 파랑, 노랑, 보라… 수천 개의 빛이 터졌다. 그 사이에 흰빛은 없었다. 아무도 그걸 아쉬워하지 않았다.');
    c.music('ending');
    c.quest('m13', 'done');
    await c.chapter('끝', '무한렙업 대모험', '결말 — ' + EN.name);
    // 당신이 걸어온 길: 내린 결정들을 한 장에 여섯 줄씩
    const E2 = G.story.ending(s);
    const log = (s.log || []).map((d) => '· ' + d.t);
    const seen = Object.keys(G.story.ENDINGS).filter((k) => (s.endings || {})[k]).length;
    const pages = ['[y]결말 — ' + EN.name + '[/]\n' + EN.desc + '\n\n빛을 보내 준 곳 ' + E2.sup + ' / 11 · 진실의 조각 ' + E2.truths + ' / ' + Object.keys(G.story.truths).length + ' · 심연의 기록 ' + G.story.abyssN(s) + ' / ' + Object.keys(G.story.abyss).length + '\n본 결말 ' + seen + ' / ' + Object.keys(G.story.ENDINGS).length];
    for (let i = 0; i < log.length; i += 6) pages.push('[y]당신이 걸어온 길[/]' + (log.length > 6 ? ' (' + (i / 6 + 1) + ')' : '') + '\n' + log.slice(i, i + 6).join('\n'));
    pages.push('[y]만든 것들[/]\n이야기 · 그림 · 음악 · 프로그램 — 한 번의 누름에서 시작된 모든 것.\n글꼴 — 갈무리 (Galmuri, SIL Open Font License 1.1)');
    pages.push('[y]고마운 사람들[/]\n에벨린, 토리아, 세린, 카이론, 그리고 버튼을 누른 당신.');
    pages.push(type === 'true' ? '이야기는 끝났지만 레벨은 끝이 없다. 이제 초록빛으로. 무한 장갑을 끼고 계속 렙업할 수 있다.\n가 본 모든 곳을 다시 걸을 수 있다. 오늘도 렙업!'
      : ['dawn', 'nest'].includes(type) ? '이야기는 끝났지만 레벨은 끝이 없다. 무한 장갑을 끼고 계속 렙업할 수 있다.\n…다른 선택이 있었을까. 심연의 기록을 더 모았다면. 오늘도 렙업!'
        : '이야기는 여기서 멈췄다. 하지만 끝난 것은 아니다.\n다른 선택, 다른 인연, 다른 진실이 다른 결말로 이어진다. 오늘도 렙업!');
    await c.narr(pages);
    c.respawnHere();
    G.main.save(true);
  }

  // 이야기가 끝나면 징수탑은 사라진다 (나눔탑으로 바뀐다)
  for (const id in G.maps) for (const b of G.maps[id].builds || []) if (b.style === 'tower') { const w = b.when; b.when = (s) => !s.flags.ending && (!w || w(s)); }
  G.world.nodes.push({ region: 'planet', label: '아스트라', x: 142, y: 14, color: '#ffd84a', sky: true, maps: ['astra_gate', 'astra_fort', 'astra_seal'] });
  void E; void D;
})();
