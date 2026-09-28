/* 9장 「영원한 밤」 — 밤의 숲 · 블랙 마을 · 미드나잇의 가게 · 천년성 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine;

  W.keyItem('keeper_letter', '등대지기의 편지', '블랙 마을의 눈먼 등대지기가 딸 빛나에게 쓴 편지. 삐뚤빼뚤한 글씨.');
  W.keyItem('secret_map', '천년성 뒷길 지도', '미드나잇이 그려 준 지도. 고양이 발자국 모양으로 길이 표시되어 있다.');

  W.quest('m9', { main: true, name: '9장 · 영원한 밤', where: '블랙 마을', stages: [
    '[y]레벨 120000[/]과 [y]짱 1차[/]가 되면 그레이 마을 서쪽 밤의 숲으로 블랙 마을에 가자.',
    '밤의 정보상 [y]미드나잇[/]을 찾자. 등불 거리 끝의 가게다.',
    '미드나잇의 값은 [y]황금 고등어[/]다. 블루 어시장에서 한 마리 사 오자.',
    '천년성 뒷길로 들어가자. 마을 북쪽 성문 옆 묘지에 입구가 있다.',
    '천년성 꼭대기로 올라가자.',
    '천년성 꼭대기의 [y]그림자 녹턴[/]과 마주하자. (강적 · 레벨 25만 부근)',
    '[y]레벨 250000[/]과 [y]짱 15차[/]가 되면 블랙 마을 남쪽 해안으로 알록달록 마을에 가자. 로켓을 만드는 팡팡 박사가 있다.',
  ], done: '밤이 끝나는 곳에서 불꽃이 터지고 있었다.' });
  W.quest('q_keeper', { name: '등대지기의 편지', where: '블랙 마을 → 블루 등대', stages: ['블랙 마을의 눈먼 등대지기가 쓴 편지를 블루 등대의 [y]빛나[/]에게 전하자.', '블랙 마을의 등대지기에게 답장을 전하자.'], done: '등대지기는 편지를 가슴에 대고 오래 웃었다. 「불이 켜져 있다고? …그럼 됐다.」' });
  W.quest('q_lamps', { name: '꺼진 등불', where: '블랙 마을', stages: ['등불 거리의 꺼진 등불 다섯 개에 흰빛을 나눠 주자. (0/5)', '(1/5)', '(2/5)', '(3/5)', '(4/5)'], done: '등불 거리에 16년 만에 모든 불이 켜졌다. 호롱 영감은 처음으로 퇴근했다.' });

  W.book('b_night', { title: '영원한 밤의 도시', where: '블랙 마을', text:
    '블랙 마을은 원래 밤이 긴 마을이었을 뿐, 해가 뜨지 않는 마을은 아니었다.\n\n' +
    '983년, 천년성이 대륙의 빛을 모으기 시작하자 성 주변의 하늘에서 빛이 빠져나갔다. 그날 이후 이 마을에는 해가 뜨지 않는다.\n\n' +
    '사람들은 등불을 켰다. 등불지기는 퇴근하지 못한다. 약속한 사람은 약속을 지켰다. 밤이 길어질수록 약속은 무거워졌다.' });
  W.book('b_promise', { title: '밤 사람들의 규칙', where: '블랙 마을', text:
    '하나. 약속은 목숨처럼.\n둘. 비밀은 약속처럼.\n셋. 밤에 만난 사람은 낮에 모른 척한다. (이 마을엔 낮이 없으므로 이 규칙은 16년째 쓰이지 않는다)\n\n' +
    '넷. 고양이에게 생선을 빚지지 말 것.' });
  W.book('b_ledger_cat', { title: '미드나잇의 거래 장부', where: '미드나잇의 가게', author: '미드나잇', text:
    '원년 — 아우룸. 고등어 1. (외상)\n100년 — 아우룸. 고등어 1. (외상) 「다녀올게, 미드나잇.」\n612년 — 벨라. 고등어 3. 「아스트라 가는 길을 알려 줘.」\n975년 — 카이론. 고등어 0. 거래 거절. 계산만 하는 인간은 고등어 맛을 모른다.\n983년 — 녹턴. 고등어 1. 「그가 무너지지 않게 해 줘.」 …고양이는 그런 건 못 한다.\n999년 — ???. 고등어 ?. (빈칸)' });
  W.book('b_nocturne', { title: '녹턴의 일지', where: '천년성', author: '녹턴', text:
    '983년. 카이론은 오늘도 잠들지 않았다. 계산만 한다. 세린이 끓여 주던 차를 흉내 내 봤다. 그는 마시지 않았다.\n\n' +
    '990년. 볼트의 아내가 죽었다. 카이론은 장례식에 가지 않았다. 대신 밤새 탑의 수치를 확인했다. 수치가 올랐다. 그는 조금 웃었다. 나는 그 웃음이 무서웠다.\n\n' +
    '998년. 흑점이 다시 보인다. 카이론이 말했다. 「계산이 맞지 않으면, 그 아이를 쓴다.」\n나는 대답하지 않았다. 대답하지 않은 것이 16년 동안 내가 한 일의 전부다.' });
  W.book('b_castle', { title: '천년성 건축기', where: '천년성', text:
    '원년, 아우룸이 대륙 한가운데 성을 쌓았다. 천 년 동안 대륙을 지키라는 뜻으로 [y]천년성[/]이라 이름 지었다.\n\n' +
    '성의 가장 높은 곳에는 하늘을 향한 탑이 있다. 아우룸은 그 탑으로 아스트라와 이야기했다고 한다.\n\n' +
    '983년 이후 그 탑은 대륙의 모든 징수탑과 연결되었다. 탑의 [y]중앙 제어실[/]을 거치지 않는 빛은 없다.' });
  W.book('b_keeper', { title: '등대지기의 편지', where: '블랙 마을', author: '빛나의 아버지', text:
    '빛나에게.\n\n아빠는 검은 별의 조각을 따라 여기까지 왔다. 조각은 천년성으로 모이더구나. 빛이 가장 많이 모이는 곳으로.\n\n' +
    '조각을 너무 오래 쳐다봐서 눈이 멀었다. 미안하다. 이제 바다를 건널 수가 없구나.\n\n' +
    '등불은 켜져 있니? 아빠는 여기서 매일 그걸 생각한다. 네가 불을 켜 두면, 아빠는 눈이 안 보여도 집을 찾을 수 있을 것 같다.\n\n— 영원한 밤의 도시에서, 아빠가' });

  /* ───────── 밤의 숲 ───────── */
  W.map('night_forest', {
    name: '밤의 숲', sub: '달이 없는 숲', region: 'black', area: 'night_forest', theme: 'black', bg: '#0b0a1c', ki: W.ki('black', 0.12), music: 'forest', dark: 64, weather: 'firefly',
    grid: W.gen({
      w: 40, h: 32, seed: 'night-forest', ground: '.', alt: [[',', 0.56, 4]],
      obst: [['T', 6], ['t', 2], ['g', 1]], dense: 0.52, sparse: 0.05, scale: 5,
      border: 'T', bt: 3, rough: 0.6,
      paths: [[[39, 16], [30, 16], [22, 12], [14, 16], [8, 22], [8, 31]], [[22, 12], [22, 5]], [[14, 16], [14, 26]]],
      clear: [[18, 3, 8, 4], [11, 24, 6, 4]],
      stamps: [{ x: 21, y: 4, rows: ['l'] }, { x: 13, y: 25, rows: ['l'] }, { x: 29, y: 15, rows: ['l'] }],
    }),
    edges: { right: { to: 'gray', tx: 0, ty: 14 }, down: { to: 'black', tx: 36, ty: 0 } },
    objs: [W.sign(36, 15, ['밤의 숲 — 달이 없는 숲', '↓ 블랙 마을 (등불 거리)']), W.spot(22, 4, 3), W.spot(14, 26, 3), W.spot(4, 5, 10, true), W.chest('nf1', 19, 4, 'p8', 5), W.goldChest('nf2', 12, 25, 50000000000)],
    mons: { list: ['shadowwolf', 'crow', 'nightmare', 'lantern', 'shadowwolf'], n: 12, area: [3, 3, 34, 26] },
    enter: async (c) => {
      if (c.flag('ch9')) return;
      c.set('ch9');
      c.quest('m8', 'done');
      await c.chapter('9장', '영원한 밤', '숲에 들어서자 빛이 끊겼다. 16년 동안 해가 뜨지 않은 땅이었다.');
      await c.say('dotori:worry', ['찍… 아무것도 안 보여. 네 흰빛만 보여.', '이 숲 너머가 블랙 마을이야. 그리고 그 너머가… 천년성. 카이론이 있는 곳.']);
      c.quest('m9', 1);
    },
  });

  /* ───────── 블랙 마을 ───────── */
  const lampIds = ['lamp1', 'lamp2', 'lamp3', 'lamp4', 'lamp5'];
  W.map('black', {
    name: '블랙 마을', sub: '영원한 밤의 도시', region: 'black', area: 'black', theme: 'black', bg: '#0b0a1c', ki: W.ki('black', 0.03), town: true, dark: 70, darkColor: 'rgba(5,3,14,0.82)',
    grid: W.gen({
      w: 38, h: 30, seed: 'black-night', ground: '.', alt: [[',', 0.7, 4]],
      obst: [['T', 2], ['g', 1], ['t', 1]], dense: 0.82, sparse: 0.02, scale: 5,
      border: '#', bt: 2, rough: 0.5,
      paths: [[[36, 0], [36, 6], [28, 6], [28, 14]], [[4, 14], [34, 14]], [[18, 14], [18, 3]], [[9, 10], [9, 14]], [[27, 18], [27, 14]], [[9, 18], [9, 14]], [[18, 14], [18, 29]]],
      path: '=',
      clear: [[4, 5, 7, 5], [22, 18, 7, 5], [4, 17, 7, 5], [12, 1, 13, 4], [30, 20, 6, 6, '.']],
      stamps: [{ x: 6, y: 13, rows: ['l'] }, { x: 12, y: 13, rows: ['l'] }, { x: 22, y: 13, rows: ['l'] }, { x: 30, y: 13, rows: ['l'] }, { x: 31, y: 21, rows: ['g.g', '...', 'g.g'] }],
    }),
    builds: [
      { x: 22, y: 18, w: 7, h: 4, door: 5, roof: '#2a2440', wall: 'dark', icon: 'coin', signColor: '#c8b8e8', night: true, to: 'midnight_shop', tx: 5, ty: 6 },
      { x: 4, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#3a3a6a', wall: 'dark', icon: 'star', signColor: '#c8d0ff', night: true, to: 'black_rank', tx: 5, ty: 6 },
      { x: 4, y: 17, w: 6, h: 4, door: 3, roof: '#4a2a4a', wall: 'dark', icon: 'bed', night: true, to: 'black_inn', tx: 5, ty: 6 },
      { x: 12, y: 1, w: 13, h: 3, style: 'castle', roof: '#1a1626', wall: 'dark', talk: castleGate },
      { x: 13, y: 10, w: 2, h: 3, style: 'tower' },
    ],
    edges: { up: { to: 'night_forest', tx: 8, ty: 31 }, down: { to: 'colorful', tx: 18, ty: 0, req: { lv: 250000, rank: ['r4', 15] }, msg: '남쪽 해안길. 푯말: 「알록달록 마을 — 등급 따위 모름. 단, 짱 15차 미만은 바다에 빠짐 주의」' } },
    lights: [{ x: 18, y: 4, r: 30, c: '#ff3a5a' }],
    objs: [
      W.sign(20, 15, ['블랙 마을 — 영원한 밤의 도시', '↑ 천년성   → 등불 거리 끝 미드나잇의 가게   ↓ 알록달록 해안길 (짱 15차)']),
      W.bookObj('b_night', 7, 14), W.bookObj('b_promise', 26, 13),
      W.spot(20, 25, 3), W.spot(3, 27, 10, true),
      { t: 'sign', x: 13, y: 12, invisible: true, text: ['블랙 마을의 징수탑. 이 탑은 빛을 빨아들이지 않는다. 빨아들일 빛이 없으니까.', '대신 등불 빛을 조금씩 먹는다. 등불지기가 탑에 등불을 걸지 않는 이유다.'] },
      { t: 'sign', x: 32, y: 22, invisible: true, talk: graveEntrance },
      ...[[8, 12], [16, 15], [24, 12], [32, 15], [20, 17]].map(([x, y], i) => ({ t: 'lamp', id: lampIds[i], x, y, talk: lampTalk, lit: (s) => !!s.flags['lit_' + lampIds[i]] })),
    ],
    npcs: [
      { id: 'horong', x: 10, y: 15, dir: 'down', mark: (s) => (s.quests.q_lamps == null && s.flags.black_intro ? '!' : null), talk: horongTalk },
      { id: 'oldman', speaker: 'oldman', x: 33, y: 17, dir: 'left', look: { hair: 'cap', hc: '#9a9a9a', top: '#3a5a7a', bottom: '#2a3a4a', acc: '#e8e0c8', skin: '#e8d8c8' }, mark: (s) => (s.quests.q_keeper == null || s.quests.q_keeper === 1 ? '!' : null), talk: keeperTalk },
      { id: 'shadow', x: 24, y: 15, dir: 'down', wander: 2, talk: W.chatter('b_shadow', ['…밤의 사람이다. 약속은 목숨처럼. 비밀은 약속처럼.', '미드나잇? 등불 거리 끝 가게의 고양이. 천 년을 살았다는 소문이 있어. 본인은 부정도 긍정도 안 해.', '천년성에는 녹턴 님이 계셔. 그림자 같은 분. 밤마다 성벽 위에서 하늘을 봐. 카이론 님 대신.']) },
      { id: 'shadow2', speaker: 'shadow', x: 15, y: 20, dir: 'right', wander: 2, look: G.chars.shadow.look, talk: W.chatter('b_shadow2', ['해가 뜨는 걸 본 적이 없어. 그림으로만 봤지. 노랗고 둥글대.', '천년제? 초대장이 왔더라. 갈 거야. 거기선 불꽃이 터진대. 불꽃은 해 비슷한 거지?']) },
      { id: 'engineer', speaker: 'shadow', x: 29, y: 16, dir: 'left', look: G.chars.shadow.look, talk: async (c) => { await c.say('shadow', '그림자 길드 상점이다. 그림자 장갑은 소리 없이 누른다. 이웃이 깨지 않게.'); await c.shop('black'); } },
    ],
    enter: async (c) => { if (!c.flag('black_intro')) { c.set('black_intro'); await c.say('dotori', ['찍… 등불만 켜져 있어. 사람들이 전부 소곤소곤 말해.', '미드나잇이라는 정보상을 찾아야 해. 천년성에 들어가는 길을 알고 있을 거야.']); } },
  });
  W.town({ map: 'black', x: 18, y: 16, name: '블랙 마을', color: '#8a7ab8', desc: '영원한 밤의 도시. 등불 거리와 천년성.', hint: '그레이 마을 서쪽 밤의 숲 너머' });

  async function horongTalk(c) {
    const s = c.s;
    if (s.quests.q_lamps === 'done') { await c.say('horong:happy', '16년 만에 퇴근했어. 집에 가니까 마누라가 누구냐고 하더군. 허허.'); return; }
    if (s.quests.q_lamps == null) {
      await c.say('horong', ['등불지기 호롱이다. 해가 안 뜨는 마을이라 퇴근을 못 해. 16년째.', '거리의 등불 다섯 개가 꺼졌어. 기름을 부어도 안 켜져. 탑이 불빛까지 먹는 거야.']);
      await c.say('horong', '흰빛이라고 했나? 자네 빛이라면 켤 수 있을지도 몰라. 부탁하네.');
      c.quest('q_lamps', 0);
      return;
    }
    await c.say('horong', '꺼진 등불이 아직 있어. 등불 앞에서 A 버튼을 눌러 봐.');
  }
  async function lampTalk(c, o) {
    const s = c.s;
    const key = 'lit_' + o.id;
    if (s.flags[key]) { await c.say(null, '등불이 하얗게 타오른다. 흰빛으로 켠 불은 꺼지지 않는다.'); return; }
    await c.say(null, '꺼진 등불이다. 유리 안의 심지가 잿빛으로 식어 있다.');
    await c.waitClick(5, () => c.flash('#ffffff', 150));
    c.light(30);
    s.flags[key] = true;
    G.field.lights.push({ x: o.x, y: o.y, r: 50, c: '#ffffff', dy: 4 });
    const n = lampIds.filter((id) => s.flags['lit_' + id]).length;
    if (n >= 5) { c.quest('q_lamps', 'done'); c.gold(70000000000); c.give('f8', 3); await c.say('horong:happy', ['다섯 개 전부! 등불 거리가 이렇게 밝았던 적이 있었나!', '이거 받게. 16년 치 야근 수당이야. 허허.']); }
    else c.quest('q_lamps', n);
  }
  async function keeperTalk(c) {
    const s = c.s;
    if (s.quests.q_keeper === 1) {
      await c.say(null, '{n}은(는) 빛나의 답장을 읽어 주었다.');
      await c.say(null, '「아빠. 불은 켜져 있어. 흰빛으로 켠 불이라 절대 안 꺼져. 그러니까 천천히 와도 돼. 대신 꼭 와. — 빛나」');
      await c.say('oldman:happy', ['……켜져 있다고.', '…그럼 됐다. 눈이 안 보여도 집을 찾을 수 있겠구나.']);
      c.gold(50000000000);
      c.quest('q_keeper', 'done');
      return;
    }
    if (s.quests.q_keeper === 0) { await c.say('oldman', '편지를… 블루 등대의 빛나에게. 부탁하네.'); return; }
    await c.say('oldman', ['…발소리가 낯설군. 블루 사람인가? 짠 냄새가 나.', '나는… 블루 등대의 등대지기였네. 검은 별의 조각을 쫓아 여기까지 왔지. 조각을 너무 오래 봐서 눈이 멀었고.']);
    await c.emote('@', '!');
    await c.say('dotori:surprise', '찍! 빛나의 아빠야! 살아 있었어!');
    await c.say('oldman', ['빛나를… 아는가? …그 애는 잘 있나? 등불은… 켜져 있나?', '편지를 써 뒀네. 부칠 방법이 없었지. 전해 줄 수 있겠나.']);
    c.give('keeper_letter');
    G.main.unlockBook('b_keeper');
    c.quest('q_keeper', 0);
  }
  // 빛나의 답장 — 블루 등대에서
  const lh = G.maps.lighthouse;
  if (lh) {
    const bn = lh.npcs.find((n) => n.id === 'bitna');
    const orig = bn.talk;
    bn.mark = ((m) => (s) => (s.quests.q_keeper === 0 ? '!' : m(s)))(bn.mark);
    bn.talk = async (c) => {
      if (c.s.quests.q_keeper === 0 && E.has(c.s, 'keeper_letter')) {
        c.take('keeper_letter');
        c.music('mother');
        await c.say('bitna:surprise', ['……아빠 글씨야.', '아빠… 살아 있어? 블랙 마을에?']);
        await c.say(null, '빛나가 편지를 읽었다. 두 번, 세 번. 네 번째에는 소리 내어 울었다.');
        await c.say('bitna:happy', ['눈이 멀었대. 바보 아빠. 그러니까 조각을 그렇게 오래 보지 말랬잖아.', '…답장 써 줄게. 가져가 줘. 불은 켜져 있다고. 절대 안 꺼진다고.']);
        c.quest('q_keeper', 1);
        c.music('sad');
        return;
      }
      return orig(c);
    };
  }

  async function castleGate(c) {
    const s = c.s;
    if (s.flags.castle_open) { await c.warp('castle1', 15, 28, 'up'); return; }
    await c.say(null, ['천년성의 정문. 검은 성벽이 하늘을 가린다. 성문 위에 붉은 등 하나가 켜져 있다.', '문지기 해골 기사가 창을 교차한 채 꼼짝하지 않는다.']);
    await c.say('guard', '「…천년성. 허가 없는 자. 출입. 불가. 교대 시간. 천 년째. 안 옴.」');
  }
  async function graveEntrance(c) {
    const s = c.s;
    if (!E.has(s, 'secret_map')) { await c.say(null, '오래된 묘지다. 가운데 비석 하나가 약간 기울어져 있다.'); return; }
    await c.say(null, '미드나잇의 지도에 그려진 고양이 발자국이 이 비석을 가리킨다. 비석을 밀자 아래로 계단이 드러났다.');
    if (!s.flags.castle_open) {
      c.set('castle_open');
      c.spawn({ id: 'lea', x: 30, y: 24, dir: 'up' });
      c.spawn({ id: 'rud', x: 34, y: 24, dir: 'up' });
      await c.say('lea', ['왔군. 새벽단도 같이 간다. 천년성 중앙 제어실… 모든 탑의 빛이 지나가는 곳이야.', '오늘은 부수러 가는 게 아니야. 보러 가는 거지. 거기 뭐가 있는지.']);
      await c.say('rud', ['숫자는 거짓말 안 해. 천년성 경비 해골 기사 312. 거미 90. 가고일 1.', '…가고일이 제일 세. 그놈은 네가 맡아.']);
      c.despawn('lea'); c.despawn('rud');
      c.quest('m9', 4);
    }
    await c.warp('castle1', 15, 28, 'up');
  }

  /* ── 블랙 안쪽 ── */
  W.map('midnight_shop', {
    name: '미드나잇의 가게', sub: '밤의 정보상', region: 'black', area: 'black', theme: 'castle', bg: '#0b0a1c', ki: W.ki('black', 0.05), music: 'black', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '+', door: 5, win: [], put: [[1, 2, 'h'], [2, 2, 'h'], [7, 2, 'h'], [8, 2, 'h'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [1, 6, 'l'], [8, 6, 'l']] }),
    warps: [W.exit(5, 7, 'black', 27, 22)],
    objs: [W.bookObj('b_ledger_cat', 8, 2)],
    npcs: [{ id: 'midnight', x: 4, y: 3, dir: 'down', mark: (s) => (s.quests.m9 === 1 || (s.quests.m9 === 2 && E.has(s, 'fish_gold')) ? '!' : null), talk: midnightTalk }],
  });
  async function midnightTalk(c) {
    const s = c.s;
    if (s.quests.m9 === 1) {
      await c.say('midnight', ['…어서 오게. 밤의 정보상, 미드나잇이라네.', '흰빛이로군. 냄새로 알았지. 천 년 만에 맡는 냄새야. …아니, 16년 만인가.']);
      await c.say('midnight:smug', ['천년성에 들어가고 싶다? 정보는 공짜가 아니지. 금화왕 골디한테 배웠나? 그 녀석보다 나는 싸게 받네.', '[y]황금 고등어[/] 한 마리. 블루 어시장에서 팔지. 돈으로 받으면 거래가 되고, 생선으로 받으면 우정이 되거든.']);
      c.quest('m9', 2);
      if (!E.has(s, 'fish_gold')) return;
    }
    if (s.quests.m9 === 2) {
      if (!E.has(s, 'fish_gold')) { await c.say('midnight', '황금 고등어는? …없군. 블루 어시장. 5만 골드. 싸지?'); return; }
      c.take('fish_gold');
      await c.say(null, '미드나잇이 황금 고등어를 앞발로 받아 들고, 한참 냄새를 맡았다. 그리고 수염을 떨었다.');
      await c.say('midnight:happy', ['…좋은 고등어군. 거래 성립. 아니, 우정 성립.', '천년성 뒷길 지도라네. 마을 남동쪽 묘지의 기울어진 비석. 고양이 발자국을 따라가게.']);
      c.give('secret_map');
      await c.say('midnight', ['그리고 이건 덤. 보라 구슬. 오래전 어떤 친구가 외상으로 맡기고 간 거지. 「내 후계자가 오면 줘.」', '…그 친구 이름이 아우룸이었던가. 기억이 잘 안 나는군. 고양이는 기억력이 나빠.']);
      await c.orb('o_p1');
      c.set('m_black_midnight');
      await c.say('midnight', '천년 치 외상이 이제야 갚아졌군. …가게. 녹턴은 성 꼭대기에 있네. 그 녀석은 16년째 하늘만 보고 있어.');
      c.quest('m9', 3);
      return;
    }
    await c.run(W.chatter('midnight', [
      '고양이에게 생선을 빚지지 말게. 밤 사람들의 네 번째 규칙이지.',
      ['아우룸? 모르는 이름이야. …그 녀석은 고등어를 늘 외상으로 먹었지. 모르는 이름이지만.', '그 녀석도 흰빛이었어. 너처럼 버튼을 눌렀지.'],
      '녹턴은 16년 동안 한 번 여기 왔었네. 고등어 한 마리를 두고 갔지. 「그가 무너지지 않게 해 줘.」 고양이는 그런 건 못 하는데 말이야.',
    ]));
  }
  W.map('black_rank', {
    name: '블랙 마을 등급소', region: 'black', area: 'black', theme: 'castle', bg: '#0b0a1c', ki: W.ki('black', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'l'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'l'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'black', 7, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 한 손에 등불을 들고 있다.', '블랙 사람들은 아우룸이 밤길을 밝히던 사람이었다고 믿는다.'] }],
    npcs: [W.clerk('clerk_bk', 5, 3, { hello: '(속삭임) …등급소… 입니다… (5분 뒤) …심사를… 시작… 합니다…', bye: '(속삭임) …안녕히…' })],
  });
  W.map('black_inn', {
    name: '달 없는 여관', region: 'black', area: 'black', theme: 'castle', bg: '#0b0a1c', ki: W.ki('black', 0.03), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [], put: [[1, 2, 'q'], [2, 2, 'q'], [7, 2, 'q'], [8, 2, 'q'], [4, 2, 'l'], [2, 5, 'd'], [7, 5, 'd'], [1, 6, 'l'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'black', 7, 21)],
    npcs: [W.innkeeper('innkeeper', 5, 4, 0, '달 없는 여관이에요. 여기선 아침이 안 와서 늦잠을 자도 혼나지 않아요.')],
  });

  /* ───────── 천년성 ───────── */
  W.map('castle1', {
    name: '천년성', sub: '아우룸이 쌓은 성', region: 'black', area: 'castle', theme: 'castle', bg: '#0b0a1c', ki: W.ki('black', 0.6), music: 'castle', dark: 80, battleBg: 'castle',
    grid: W.gen({
      w: 32, h: 30, seed: 'millennium-castle', ground: '-', alt: [],
      obst: [['#', 5], ['y', 1], ['l', 1]], dense: 0.5, sparse: 0.05, scale: 3,
      border: '#', bt: 1, rough: 0.7,
      paths: [[[15, 29], [15, 22], [6, 18], [6, 8], [15, 4], [24, 8], [24, 18], [15, 22]], [[15, 4], [15, 2]]], path: '+',
      clear: [[12, 1, 7, 3, '+']],
      stamps: [{ x: 15, y: 1, rows: ['S'] }],
    }),
    warps: [{ x: 15, y: 29, to: 'black', tx: 32, ty: 23, dir: 'down' }, { x: 15, y: 1, to: 'castle2', tx: 13, ty: 22, dir: 'up' }],
    objs: [W.bookObj('b_castle', 12, 2), W.spot(6, 12, 3), W.spot(24, 12, 3), W.spot(2, 27, 10, true), W.chest('ca1', 5, 8, 'p8', 5), W.goldChest('ca2', 25, 18, 100000000000)],
    mons: { list: ['skelknight', 'spider', 'lantern', 'skelknight', 'nightmare'], n: 12, area: [1, 5, 30, 22] },
    fixed: [{ mon: 'gargoyle', x: 15, y: 5, flag: 'beat_gargoyle', boss: true, look: { creature: 'beast', tint: '#6a6a78' } }],
  });
  W.map('castle2', {
    name: '천년성 꼭대기', sub: '하늘을 향한 탑', region: 'black', area: 'castle', theme: 'castle', bg: '#0b0a1c', ki: W.ki('black', 0.85), music: 'castle', weather: 'star',
    grid: W.room({ w: 26, h: 24, floor: '-', door: 13, win: [], rug: [11, 3, 5, 20], put: [[2, 3, 'y'], [23, 3, 'y'], [2, 10, 'y'], [23, 10, 'y'], [2, 17, 'y'], [23, 17, 'y'], [8, 2, 'u'], [9, 2, 'u'], [16, 2, 'u'], [17, 2, 'u'], [12, 2, 'j'], [13, 2, 'j'], [14, 2, 'j'], [1, 21, 'l'], [24, 21, 'l']] }).map((r, y) => (y === 23 ? r.slice(0, 13) + 'S' + r.slice(14) : r)),
    warps: [{ x: 13, y: 23, to: 'castle1', tx: 15, ty: 2, dir: 'down' }],
    objs: [
      W.bookObj('b_nocturne', 17, 2),
      { t: 'orbshine', orb: 'o_p2', x: 13, y: 3, need: (s) => !!s.flags.m_black_nocturne, hint: '가장 높은 창틀에 보라 구슬이 놓여 있다. 녹턴이 그 앞을 막고 서 있다.' },
      { t: 'sign', x: 8, y: 2, invisible: true, text: ['[y]중앙 제어실[/] 제어판. 대륙 모든 징수탑의 수치가 흐른다.', '가운데 빈 홈이 하나 있다. 무언가를 끼우는 자리 같다. …볼트의 역류 장치 모양과 똑같다.'] },
      { t: 'sign', x: 9, y: 2, invisible: true, text: ['제어판 화면: 「누적 집광량 — 은빛 왕국 대광맥 대비 298%. 궤도 송신 대기 중. 송신 예정일: 천년력 1000년 새싹의 달 11일.」', '천년제 날 밤이다.'] },
    ],
    npcs: [{ id: 'nocturne', x: 13, y: 5, dir: 'up', cond: (s) => !s.flags.m_black_kairon, mark: (s) => (s.quests.m9 === 4 || s.quests.m9 === 5 ? '!' : null), talk: nocturneTalk }],
  });
  async function nocturneTalk(c) {
    const s = c.s;
    if (s.quests.m9 === 4) {
      c.music('castle');
      await c.say(null, '검은 머리칼의 사람이 창밖의 하늘을 보고 있다. 이쪽을 돌아보지 않는다.');
      await c.say('nocturne', ['……왔군.', '세린의 아이.']);
      await c.say('nocturne', ['16년 동안 저 하늘을 봤다. 황금별 옆의 검은 점이 다시 커지는 걸.', '카이론은 계산을 했고, 나는 하늘을 봤다. 그게 우리가 16년 동안 한 일이다.']);
      await c.say('@', '카이론은 뭘 하려는 거야? 루미에 성녀님이… 나를 새 봉인으로 삼는 게 계획이라고 했어.');
      await c.say('nocturne', ['…사실이다.', '천년제 날 밤, 탑에 모인 빛을 아스트라로 쏜다. 그 빛으로 흑점을 태운다. 그게 첫 번째 계획.', '빛이 모자라면… 너를 봉인으로 쓴다. 그게 두 번째 계획.']);
      await c.say('dotori:angry', '찍! 그럼 막아야지! 왜 가만히 있었어!');
      await c.say('nocturne', ['……', '막고 싶다면, 먼저 나를 넘어서라. 나는 카이론의 그림자다. 그림자는 주인을 떠나지 않는다.']);
      c.quest('m9', 5);
    }
    if (s.lv < 180000) { await c.say('nocturne', '…아직 약하다. 그 빛으로는 카이론은커녕 나도 넘지 못한다. 더 자라서 와라.'); return; }
    if (!(await c.yes('녹턴에게 도전할까?', 'nocturne', '도전한다', '아직'))) return;
    const win = await c.battle('nocturne', { noFlee: true, music: 'boss2' });
    if (!win) { await c.say('nocturne', '…다시 와라. 나는 여기 있다. 16년째.'); return; }
    await nocturneAfter(c);
  }
  async function nocturneAfter(c) {
    c.music('sad');
    await c.say(null, '녹턴이 무릎을 꿇었다. 얼굴을 가린 천이 흘러내렸다. 지친 눈이었다.');
    await c.say('nocturne', ['……그림자는, 빛이 있어야 생긴다.', '16년 동안 나는 카이론의 그림자였다. 그런데 그의 빛은 16년 전에 꺼졌다. 세린과 함께.']);
    await c.say('nocturne', ['카이론을 구해 다오. 그는 16년 동안 한 번도 잠들지 않았다. 한 번도 울지 않았다.', '그는 괴물이 아니다. 계산을 멈추면 무너질까 봐 무서운… 열아홉 살 소년이다. 아직도.']);
    await c.say('nocturne', ['이것을 가져가라. [y]밤의 열쇠[/]. 하늘 정거장의 문을 여는 열쇠다. 아우룸 시대부터 천년성에 보관되어 왔다.', '그리고 [y]그림자 브로치[/]. 그림자는 빛을 가장 잘 아는 법이다.']);
    c.give('night_key');
    c.give('x8');
    c.set('m_black_nocturne');
    await c.say('nocturne', '창틀의 보라 구슬도 가져가라. 천년성의 가장 높은 곳. 아우룸이 하늘과 이야기하던 자리다.');
    await c.wait(0.5);
    c.music('kairon');
    c.shake(600, 3);
    c.flash('#ffe08a', 800);
    c.spawn({ id: 'kairon', x: 13, y: 9, dir: 'up' });
    await c.say(null, '방 안의 공기가 무거워졌다. 등 뒤에서 황금빛이 번졌다.');
    await c.emote('@', '!');
    await c.say('kairon', ['녹턴.', '…졌군. 16년 만에.']);
    await c.say('nocturne:sad', '……카이론.');
    await c.say('kairon', ['세린의 아이.', '…눈이 똑같군.']);
    await c.say('kairon', ['나는 이미 모든 것을 계산했다. 천년제 날 밤, 16년 치 빛을 아스트라로 쏜다.', '계산이 맞으면 흑점은 사라진다. 계산이 틀리면… 네가 필요하다.']);
    const k = await c.ask(null, ['빛을 모으면 흑점이 더 빨리 와!', '엄마는 그런 걸 원하지 않았어', '……']);
    if (k === 0) await c.say('kairon', ['은빛 왕국의 기록인가. 볼트가 흔들리더군.', '…알고 있다. 16년 전부터. 그래서 더 많이 모았다. 흑점이 오는 속도보다 빨리.']);
    else if (k === 1) await c.say('kairon', ['세린이 원한 것. …세린은 없다.', '없는 사람이 원하는 것으로는 아무도 지킬 수 없다.']);
    else await c.say('kairon', '……말이 없군. 녹턴을 닮았어.');
    await c.say('kairon', ['천년제 날 밤, 아스트라에서 기다리겠다. 오지 않아도 좋다. 오지 않으면 내가 끝낸다.', '…오늘도 렙업이군. 세린이 늘 하던 인사다.']);
    c.flash('#ffe08a', 800);
    c.despawn('kairon');
    c.set('m_black_kairon');
    await c.say('dotori:worry', ['찍… 사라졌어. 저게… 챔피언. 레벨 99만 9999.', '…{n}. 무서워. 그런데 저 사람, 이상하게 슬퍼 보였어.']);
    await c.say('nocturne', ['아스트라에 가려면 하늘 정거장을 지나야 한다. 정거장에 가려면… 하늘을 날아야 하지.', '남쪽 알록달록 마을의 팡팡이라는 발명가가 평생 로켓을 만들고 있다. 세린과 약속했었다더군. 하늘에 가는 법을.']);
    c.quest('m9', 6);
    c.music('castle');
  }

  G.world.nodes.push({ region: 'black', label: '블랙', x: 82, y: 30, color: '#8a7ab8', maps: ['black', 'night_forest', 'castle1', 'castle2', 'midnight_shop', 'black_rank', 'black_inn'] });
})();
