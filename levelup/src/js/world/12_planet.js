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
    await c.say('aurum', ['…세 번째 흰빛이구나. 버튼, 잘 쓰고 있니?', '나는 아우룸. 아니, 아우룸이 남긴 빛의 부스러기. 천 년 동안 여기서 후계자를 기다렸지.']);
    await c.say('aurum', ['하나만 가르쳐 줄게. 버튼은 빛을 모으는 도구가 아니야. [w]흩는[/] 도구야.', '누를 때마다 빛이 터지잖아? 그게 흩어져서 옆 사람에게 닿아. 렙업은 원래 그런 거야. 혼자 자라는 게 아니라.']);
    await c.say('aurum:happy', ['요새에 내 글이 남아 있어. 벨라 누나 이야기도. 읽고 가.', '…오늘도 렙업. 이 인사, 내가 만든 거야. 몰랐지?']);
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
    await c.say('bella', ['…또 흰빛이 왔네. 이번엔 누구랑 같이 왔어?', '나는 벨라. 612년에 여기서 혼자 싸웠지. 이겼어. 그리고 혼자 잠들었어.']);
    await c.say('bella', ['나는 나누는 법을 몰랐어. 강하면 된다고 생각했거든.', '너는 달라 보여. 옆에 털뭉치도 있고. 뒤에 대륙도 있고.']);
    await c.say('dotori:angry', '털뭉치 아니야! 도토리야! 레벨 10이야!');
    await c.say('bella:happy', '…하하. 좋다. 혼자가 아니구나. 그럼 괜찮아. 가.');
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

  async function finale(c) {
    const s = c.s;
    c.music('mother');
    await c.say(null, '수정 앞에 한 사람이 서 있다. 황금 망토. 은빛이 섞인 긴 머리. 뒷모습만으로도 방 전체가 무겁다.');
    c.npc('kairon').face('D');
    await c.say('kairon', ['…왔군. 세린의 아이.', '늦지 않게 왔어. 천년성에서 쏜 빛이 곧 도착한다. 16년 치, 대륙 전부의 빛이.']);
    await c.say('kairon', ['계산은 끝났다. 그 빛으로 흑점을 태운다. 태우지 못하면…', '…너를 새 봉인으로 삼는다. 세린이 그랬던 것처럼.']);
    await c.say('@', '할머니가 전하래.');
    await c.say('@', '「스승이 기다린다. 밥 먹으러 온나.」');
    await c.emote('kairon', '…');
    await c.say('kairon', ['……', '…스승님이.']);
    await c.say(null, '카이론의 어깨가 아주 조금 떨렸다. 16년 동안 한 번도 떨리지 않은 어깨였다.');
    await c.say('kairon', ['……늦었다. 빛은 이미 출발했어. 계산을 멈추면… 전부 무너진다.', '증명해라. 네 방식이 옳다는 것을. 모으지 않고, 나눠서, 흑점을 이길 수 있다는 것을.']);
    c.quest('m12', 3);
    const win = await c.battle('kairon', { noFlee: true, music: 'kairon' });
    if (!win) { await c.say('kairon', '…아직이다. 빛이 도착하기 전에, 다시 와라.'); return; }
    c.music(null);
    await c.say(null, '황금 검이 바닥에 떨어졌다. 카이론이 무릎을 꿇었다.');
    await c.say('kairon', ['……졌군.', '계산이… 틀렸다. 처음으로. 아니, 처음부터.']);
    // 빛의 도착
    c.shake(1500, 6);
    c.flash('#b89aff', 900);
    c.sfx('rumble');
    await c.say(null, ['그 순간— 하늘 너머 대륙에서 거대한 보랏빛 기둥이 솟아올라 아스트라에 꽂혔다.', '16년 동안 모인 빛. 천년성이 쏘아 올린 빛이다.']);
    c.shake(1500, 7);
    await c.say(null, '쩌저적—. 세린을 감싼 수정에 금이 번졌다. 그리고 수정 속에서 검은 것이 눈을 떴다.');
    c.music('danger');
    await c.say('blacksun', ['………빛………', '………이렇게………많은………빛………']);
    await c.say(null, '「통신 연결. 여기는 스텔라. 흡광체 봉인 붕괴 확인. 빛의 기둥을 따라 흡광체 팽창 중.」');
    await c.say(null, '「천년성 중앙 제어실. 지금이야. [y]역류 장치[/].」');
    // 천년성
    await c.fadeOut(500);
    G.field.hideHero = true;
    await c.warp('castle2', 13, 8, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    c.spawn({ id: 'rud', x: 8, y: 3, dir: 'up' });
    c.spawn({ id: 'lea', x: 10, y: 4, dir: 'up' });
    c.spawn({ id: 'bolt', x: 9, y: 4, dir: 'up' });
    c.spawn({ id: 'nocturne', x: 12, y: 5, dir: 'up' });
    await c.fadeIn(500);
    await c.say('bolt', '신호 왔다. 끼워!');
    await c.say('rud', ['숫자는 거짓말 안 해.', '3…', '2…', '1…']);
    await c.say('lea', '지금!');
    c.sfx('unlock');
    c.flash('#ffffff', 1200);
    c.shake(1000, 5);
    await c.say(null, '철컥—. 역류 장치가 제어판 홈에 맞물렸다. 대륙의 모든 탑이 동시에 떨렸다. 그리고— 흐름이 뒤집혔다.');
    await c.say('nocturne', '……카이론. 이제 쉬어도 돼.');
    c.despawn('rud'); c.despawn('lea'); c.despawn('bolt'); c.despawn('nocturne');
    // 몽타주
    c.music('title');
    await c.fadeOut(600, true);
    const mont = [
      ['green', '그린 마을. 무너진 탑 자리에서 초록 빛이 솟았다. 봄이가 레벨 11이 되었다. 철이는 12가 되었다. 둘은 또 싸웠다.'],
      ['red', '레드 마을. 대장간 굴뚝에서 붉은 빛이 솟았다. 루카와 루미의 머리칼이 끝에서부터 붉게 물들었다.'],
      ['blue', '블루 마을. 등대의 흰 불빛 옆으로 파란 빛이 솟았다. 대도서관의 금서 봉인이 풀렸다. 먹물 관장이 먹물을 뿜었다.'],
      ['yellow', '옐로 마을. 경험 거래소 창구에서 빛이 쏟아져 나와 아이들에게 돌아갔다. 까치가 레벨 30이 되었다. 골디는 창구 문을 닫고 웃었다.'],
      ['purple', '퍼플 마을. 16년 만에 해가 졌다. 그리고 밤이 왔다. 베라 교수가 첫 번째 별을 보며 따뜻한 차를 마셨다.'],
      ['rainbow', '무지개 마을. 무지개 샘이 일곱 빛깔을 합쳐 하얗게 빛났다. 천년제가 시작되었다.'],
      ['white', '화이트 마을. 대성당의 환자들이 일어나 앉았다. 루미에가 16년 만에 울었다. 기도하지 않고, 그냥 울었다.'],
      ['gray', '그레이 마을. 612에서 멈춰 있던 계기판 바늘이 움직였다. 잿빛 땅에 풀색이 번졌다. 노을이 그걸 보고 「예쁘다」고 했다.'],
      ['black', '블랙 마을. 16년 만에… 해가 떴다. 호롱 영감은 등불을 끄고 퇴근했다.'],
      ['colorful', '알록달록 마을. 사람들은 원래 하던 대로 불꽃을 쏘아 올렸다. 흩어지는 빛이 대륙의 빛과 섞였다.'],
    ];
    for (const [reg, line] of mont) {
      G.main.enterMap(reg, G.world.towns.find((t) => t.map === reg).x, G.world.towns.find((t) => t.map === reg).y, 'down', { noBanner: true, keepMusic: true });
      await c.fadeIn(350);
      await c.say(null, line);
      await c.fadeOut(350, true);
    }
    // 아스트라로
    await c.warp('astra_seal', 12, 10, 'up', { instant: true, noBanner: true, keepMusic: true, noEnter: true });
    G.field.hideHero = false;
    c.npc('kairon').to(9, 9, 'up');
    await c.fadeIn(700);
    await c.say(null, ['아스트라로 향하던 빛의 기둥이 뚝 끊겼다. 모여 있던 빛이 대륙 전체로 흩어졌다.', '길을 잃은 흑점이 수정 밖으로 터져 나왔다. 성난 듯 온 방을 삼키며 부풀어 오른다.']);
    c.spawn({ id: 'blacksun_npc', x: 12, y: 4, dir: 'down', look: { creature: 'ghost', tint: '#0b0a1c' } });
    await c.say('blacksun', ['………빛이………흩어졌다………', '………그렇다면………너를………먹겠다………가장………하얀………빛………']);
    await c.say('kairon', ['……나도 싸운다. 16년 동안 모은 빛은 흩어졌지만, 내 빛은 아직 여기 있다.', '…아니. 네 옆에 서겠다. 앞이 아니라.']);
    await c.say('dotori:angry', ['찍! 나도! 레벨 10이지만!', '{n}! 대륙이 보고 있어! 다들 버튼을 누르고 있을 거야!']);
    c.music('final');
    const support = [
      { text: '[g]그린 마을[/]의 빛이 닿았다! 할머니가 지팡이를 들고 버튼을 누르고 있다.', short: '그린의 빛!', c: '#6ad86a' },
      { text: '[r]레드 마을[/]의 빛이 닿았다! 대장장이들이 망치 대신 버튼을 두드린다.', short: '레드의 빛!', c: '#ff6a4a' },
      { text: '[b]블루 마을[/]의 빛이 닿았다! 등대가 하늘을 향해 불빛을 돌렸다.', short: '블루의 빛!', c: '#4dabf7' },
      { text: '[y]옐로 마을[/]의 빛이 닿았다! 그늘 참새단이 떼로 누른다. 골디도 몰래 누른다.', short: '옐로의 빛!', c: '#ffd43b' },
      { text: '[p]퍼플 마을[/]의 빛이 닿았다! 미루의 주문이 처음으로 한 글자도 안 틀렸다.', short: '퍼플의 빛!', c: '#c49bff' },
      { text: '무지개 마을의 빛이 닿았다! 롤로가 분홍 머리를 흔들며 관객들과 함께 누른다.', short: '무지개의 빛!', c: '#ff8ac8' },
      { text: '화이트 마을의 빛이 닿았다! 루미에와 에델이 나란히 서서 누른다. 기도 대신.', short: '화이트의 빛!', c: '#ffffff' },
      { text: '그레이 마을의 빛이 닿았다! 볼트가 웃으면서 누른다. 노을이 그걸 기록한다.', short: '그레이의 빛!', c: '#a8a8b8' },
      { text: '블랙 마을의 빛이 닿았다! 미드나잇이 앞발로 누른다. 고등어 한 마리 값이다.', short: '블랙의 빛!', c: '#8a7ab8' },
      { text: '하늘 정거장의 빛이 닿았다! 「계산 안 해. 그냥 누를게.」 — 스텔라', short: '정거장의 빛!', c: '#8ab0e0' },
      { text: '알록달록 마을의 불꽃 천 발이 동시에 터졌다! 흩어지는 빛이 전부 여기로!', short: '천 발의 불꽃!', c: '#ff9a5a' },
    ];
    const win2 = await c.battle('blacksun', { noFlee: true, music: 'final', support, supportEvery: 6, supportFirst: 3, boss: true });
    c.despawn('blacksun_npc');
    if (!win2) { await c.say('kairon', '…일어나라. 흑점은 아직 여기 있다. 대륙의 빛도 아직 너를 향하고 있어. 다시.'); c.unset('ending_try'); return; }
    await ending(c);
  }

  async function ending(c) {
    c.set('ending');
    c.set('champion');
    c.music(null);
    c.flash('#ffffff', 2000);
    c.light(150);
    await c.say(null, ['흰빛이 터졌다. 대륙에서 날아온 모든 빛과 섞여, 온 방을 가득 채웠다.', '흑점은 비명을 지르지 않았다. 그저… 흩어졌다. 수천, 수만 개의 작은 조각으로.', '조각들은 하늘로 흩어져, 하나씩 하나씩 작은 별이 되었다.']);
    c.music('mother');
    await c.say(null, '쨍그랑—. 봉인의 수정이 깨졌다. 흰 머리칼의 여인이 천천히 눈을 떴다.');
    await c.npc('serin').walk('DDD', 0.6);
    await c.say('serin', ['……', '…많이 컸네.']);
    await c.say('@', '……엄마.');
    await c.say('serin:happy', ['응. 엄마야.', '…오늘도 렙업?']);
    await c.say('@', '…내일도 렙업.');
    await c.say(null, '세린이 {n}을(를) 안았다. 16년 치의 포옹이었다.');
    await c.say('serin', ['수정 속에서 다 들렸어. 네가 등대를 켜고, 롤로 머리를 분홍으로 물들이고, 도토리를 날게 한 거.', '…나보다 훨씬 잘했어. 나는 혼자 삼켰는데, 너는 나눴잖아.']);
    await c.say('kairon:sad', ['……세린.', '미안하다. 16년 동안… 계산만 했다. 네가 틀렸다고 믿어야 버틸 수 있었어.']);
    await c.say('serin', ['알아, 카이론. 계산하지 말고 차나 마셔.', '…그리고 울어도 돼. 16년 치.']);
    await c.say(null, '카이론이 울었다. 대륙의 절대 강자가, 열아홉 살 소년처럼.');
    await c.say('dotori:happy', ['찍… 찍찍! 다들 울면 나도 울어!', '…어? 어어? {n}! 나 봐! 나 떠 있어! 3초 지났는데 계속 떠 있어!']);
    await c.say(null, '도토리가 날았다. 3초가 아니라, 제단을 세 바퀴 도는 동안 내내. 도토리는 날면서 울었다.');
    await c.say('serin:happy', ['도토리. 내가 쓰다듬어 준 게 16년 전인데, 기억하는구나.', '거봐. 날 수 있다고 했잖아.']);
    await c.say('kairon', ['…챔피언의 자리는 너의 것이다. 대륙의 절대 강자.', '경험세는 오늘로 폐지한다. 탑은… 나눔탑으로 바꾸자. 볼트가 좋아하겠군.']);
    c.give('serin_glove');
    c.give('t13');
    await c.say('serin', '이건 엄마가 끼던 장갑이야. 버튼 누를 때 끼렴. …그리고 이건 아우룸 할아버지가 남긴 무한 장갑. 수정 속에서 16년 동안 쥐고 있었어.');
    c.quest('m12', 'done');
    await c.fadeOut(1200, true);
    c.music('rainbow');
    await c.narr(['그날 밤, 무한호는 두 번째로 폭발하지 않았다.', '천년력 1000년 새싹의 달 11일. 무지개 마을. 천년제.']);
    c.quest('m13', 0);
    await c.warp('festival', 19, 20, 'up', { instant: true, noBanner: true });
    await c.fadeIn(1000);
    await c.say('dotori:happy', ['찍! 다들 왔어! 대륙 사람들 전부!', '한 명씩 인사하자! 할머니랑 엄마는 샘 앞에서 기다린대!']);
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
    bomi: ['레벨 11! 나 전설 될 거야! 네잎클로버는 그때 돌려받을게!'], chul: ['흥. 나는 12다. …근데 오늘은 봄이한테 져 줬어. 축제니까.'],
    kongsun: ['어머어머, 챔피언이 우리 동네 출신이라니! 벌써 온 대륙에 소문냈어!'], dolsoe: ['보고서에 뭐라고 쓸지 이제 고민 안 해도 돼. 기사단이 해체됐거든. …대장간으로 돌아갈 거야.'],
    ijang: ['나는 처음부터 네가 해낼 줄 알았네. 아니, 반신반의했네. 아니… 처음부터 알았네. 이건 안 바꾼다네.'],
    hwaro: ['방순 누님 손주가 챔피언이라니! 오늘 밤은 망치질 대신 건배다! 렙업!'], rud: ['숫자는 거짓말 안 해. 천년성 제어실, 오차 0초. …빚은 갚았다. 1,000골드, 탑 하나, 그리고 대륙 전부.'],
    lea: ['새벽단은 오늘 해산했어. 부술 탑이 없거든. 이제 뭘 하지? …루드랑 떡볶이나 먹으러 갈까.'], luka: ['내 머리 봐! 빨개! 형이랑 똑같아!'], rumi: ['색연필이 전부 다른 색으로 보여! 무지개 그릴 거야. 진짜 색으로!'],
    galaxy: ['흑점이 흩어져서 별이 생겼어. 오늘 밤에만 3,812개. 이름 붙이다 늙어 죽겠군. …행복한 고민이야.'],
    haemi: ['그, 금서가 전부 풀렸어요! 세린 씨 책, 이제 누구나 빌릴 수 있어요. 대출 카드 첫 줄에 제 이름 쓸 거예요.'], mukmul: ['약속을 지켰네, 세린. …놀라서 먹물이 또 나왔군. 이건 기쁨의 주석일세.'],
    bitna: ['아빠가 돌아왔어! 눈은 안 보이지만 등대 불빛은 따뜻하대! 그걸로 충분하대!'], captain: ['고등어호 타고 여기까지 왔다. …우웩. 30년째. 축제 날에도.'],
    kkachi: ['금화왕이 창구 문을 닫았어. 애들 경험, 전부 돌려받았어. 나는 레벨 30! …근데 금화왕은 여전히 될 거야. 사는 사람 말고 나눠 주는 금화왕.'],
    goldie: ['세린이 돌아왔으니 979년 빚을 받아야지. …아니, 백지 채권으로 퉁 쳤잖아. 장사 못 했다니까, 나.'], sahara: ['오늘 밤 새 별이 생겼어. 대상단의 새 길잡이 별이야. 이름은 네 이름으로 할게.'],
    vera: ['따뜻한 차예요. 16년 만에 식지 않은 차. 세린이랑 같이 마시니까 더 따뜻해요.'], miru: ['주문을 한 글자도 안 틀렸어! …근데 불 대신 꽃이 피게 하는 게 더 좋아서 다시 틀리게 외울 거야.'],
    lolo: ['분홍 광대의 개막 공연! 맨 앞자리는 너랑 도토리 거야! 웃음은 색이 없어도 보이지만, 오늘은 전부 알록달록해!'], chaesaek: ['999년… 아니, 87년 기다린 보람이 있어요! 이렇게 예쁜 천년제는 천 년에 한 번뿐이에요!'],
    lumie: ['기도 대신 박수를 쳤어요. 16년 만에. …손바닥이 아프네요. 이것도 괜찮은 아픔이에요.'], edel: ['투구를 벗었소. 축제니까. …바람이 시원하오.'],
    bolt: ['탑은 전부 나눔탑으로 바꾼다. 렙업할 때 터진 빛을 옆 사람한테 보내는 탑이다. …쓸데없는 말은 연료 낭비지만, 이건 쓸모 있는 말이다.'], noel: ['불꽃 색 기록 중. 3,812가지. 전부 예쁘다. 계산 결과다.'],
    midnight: ['천 년 치 고등어 외상이 다 갚아졌군. 아우룸, 네 후계자는 계산이 정확하더군. 생선으로.'], pangpang: ['무한호 129번째 비행! 폭발 없음! 역사상 최초! …착륙할 때 조금 터졌지만 그건 세리머니야!'],
    ppeong: ['박사님이 하늘에 갔다 왔어! 폭발 없이! 거의! 대륙 역사상 가장 위대한 발명이야! 과장 아니야!'], hunjang: ['허허. 연대기 5권은 네 이야기로 쓰마. 「세 번째 흰빛, 나누다.」 빈칸 없이.'],
    park: ['두더지들이 휴전을 제안해 왔다. 27년 전쟁이 끝났다. …감자 반을 주기로 했다.'],
  };
  W.map('festival', {
    name: '천년제 밤', sub: '천년력 1000년 새싹의 달 11일', region: 'rainbow', area: 'festival', theme: 'rainbow', bg: '#1a1040', ki: W.ki('planet', 1), music: 'rainbow', weather: 'spark', dark: 200, darkColor: 'rgba(10,6,30,0.5)',
    grid: G.maps.rainbow.grid,
    builds: G.maps.rainbow.builds.filter((b) => b.style !== 'tower'),
    lights: [{ x: 19, y: 13, r: 80, c: '#ffffff' }, { x: 10, y: 15, r: 60, c: '#ff8ac8' }, { x: 28, y: 15, r: 60, c: '#ffd84a' }],
    edges: { left: { to: 'rainbow_bridge', tx: 43, ty: 7 }, up: { to: 'cloud_sea', tx: 21, ty: 31 } },
    npcs: FEST.map(([id, x, y, dir, key]) => ({ id, x, y, dir, talk: key ? W.chatter('fest_' + key, LINES[key], id) : festFamily })),
    objs: [],
  });
  async function festFamily(c) {
    const s = c.s;
    if (s.quests.m13 === 'done') {
      await c.run(W.chatter('fest_family', [
        (c2) => c2.say('gran', '오늘도 렙업? …그래, 내일도 렙업. 인자 할매는 그 대답만 들으면 된다.'),
        (c2) => c2.say('serin', '엄마는 이제 아무 데도 안 가. 대신 네가 가고 싶은 데 같이 가자. 레벨은 무한이니까.'),
      ], 'gran'));
      return;
    }
    await c.say('gran', ['왔나. …다 인사했나?', '마, 앉아라. 불꽃 보자.']);
    await c.say('serin', ['엄마랑 할머니 사이에 앉아. 여기가 제일 잘 보여.']);
    c.sfx('firework');
    c.flash('#ffd84a', 600);
    await c.say(null, '쾅, 쾅, 쾅—. 알록달록 마을의 불꽃 천 발이 무지개 마을 하늘에서 터졌다. 흩어지는 빛이 온 하늘을 덮었다.');
    c.sfx('firework');
    c.flash('#ff8ac8', 600);
    await c.say('gran', ['세린아. 니 아가 해냈다.', '…니도 해냈고.']);
    await c.say('serin:happy', ['선생님이 키웠잖아요. 16년 동안.', '…고마워요, 엄마.']);
    await c.say('gran:sad', ['……엄마는 무슨. 할매다, 할매.', '…마, 눈에 불꽃 들어갔다.']);
    c.sfx('firework');
    c.flash('#6ad86a', 600);
    await c.say('dotori:happy', ['찍! {n}! 마지막 인사 하자! 다 같이!', '하나, 둘, 셋!']);
    await c.say('@', '[big]오늘도 렙업![/]');
    await c.say(null, '[big]「내일도 렙업!」[/]\n무지개 마을 광장에 모인 대륙의 모든 사람이 대답했다.');
    c.music('ending');
    c.quest('m13', 'done');
    await c.chapter('끝', '무한렙업 대모험', '모든 성장은 한 번의 누름에서 시작된다.');
    await c.narr([
      '[y]만든 것들[/]\n이야기 · 그림 · 음악 · 프로그램 — 한 번의 누름에서 시작된 모든 것.\n글꼴 — 갈무리 (Galmuri, SIL Open Font License 1.1)',
      '[y]고마운 사람들[/]\n오방순, 도토리, 세린, 카이론, 그리고 버튼을 누른 당신.',
      '이야기는 끝났지만 레벨은 끝이 없다. 무한 장갑을 끼고 계속 렙업할 수 있다.\n가 본 모든 곳을 다시 걸을 수 있다. 오늘도 렙업!',
    ]);
    c.respawnHere();
    G.main.save(true);
  }

  // 이야기가 끝나면 징수탑은 사라진다 (나눔탑으로 바뀐다)
  for (const id in G.maps) for (const b of G.maps[id].builds || []) if (b.style === 'tower') { const w = b.when; b.when = (s) => !s.flags.ending && (!w || w(s)); }
  G.world.nodes.push({ region: 'planet', label: '아스트라', x: 142, y: 14, color: '#ffd84a', sky: true, maps: ['astra_gate', 'astra_fort', 'astra_seal'] });
  void E; void D;
})();
