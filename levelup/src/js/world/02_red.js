/* 2장 「불꽃과 쇠」 — 붉은 산길 · 레드 마을 · 붉은 산 · 관측소 · 황금 광산 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine;

  G.data.SHOPS.red_food = { name: '화산 떡볶이 원조집', keeper: 'ddeok', items: ['f1', 'f0', 'p1', 'p0'] };
  W.keyItem('drawing', '루미의 그림', '색이 없는 그림. 연필로 그린 대장간과 형, 그리고 하늘에 동그라미 두 개. 「하나는 해, 하나는 형이 말한 황금별.」');
  W.keyItem('badge_rud', '견습 기사 휘장', '루드가 떨어뜨리고 간 휘장. 뒷면에 작은 글씨로 「루카, 루미」.');

  W.quest('m2', { main: true, name: '2장 · 불꽃과 쇠', where: '레드 마을', stages: [
    '[y]레벨 30[/]을 넘기고 그린 마을 남쪽 붉은 산길을 지나 레드 마을로 가자.',
    '레드 마을 동쪽 [y]붉은 산[/] 꼭대기의 관측소에서 은하수 박사를 찾자.',
    '레드 마을로 돌아가자. 광장 쪽이 소란스럽다.',
    '[y]레벨 150[/]이 되면 레드 마을 남쪽 해안길을 지나 블루 마을로 가자. 박사는 대도서관에 네가 읽어야 할 책이 있다고 했다.',
  ], done: '블루 마을에 닿았다.' });
  W.quest('q_scales', { name: '화로 아저씨의 새 장갑', where: '레드 마을 대장간', stages: ['몬스터에게서 [y]도마뱀 비늘[/] 5개를 모아 화로 아저씨에게 가져가자.'], done: '가죽 장갑을 받았다. 손에 착 감긴다.' });
  W.quest('q_ember', { name: '할매의 불씨', where: '떡볶이집', stages: ['몬스터에게서 [y]불씨 조각[/] 5개를 모아 떡볶이 할매에게 가져가자.'], done: '화산 떡볶이 지옥맛. 먹고 나서 한동안 말을 못 했다.' });
  W.quest('q_herb', { name: '쌍둥이의 약초', where: '붉은 산', stages: ['붉은 산 용암 호수 근처에서 [y]불꽃 약초[/]를 캐 오자.', '루드의 집으로 돌아가 쌍둥이에게 약초를 주자.'], done: '루미가 그림 한 장을 주었다.' });
  W.quest('q_bandit', { name: '산으로 간 대장장이들', where: '붉은 산', stages: ['붉은 산의 [y]산적 망치꾼[/]을 6명 혼내 주자.', '화로 아저씨에게 알리자.'], done: '산에서 내려온 대장장이 몇이 다시 망치를 잡았다.' });
  W.quest('q_mine', { name: '잠든 금맥', where: '황금 광산', stages: ['광부 대장이 말한 [y]광산 비밀번호[/]를 알아내자. 「별을 아는 놈만 들어와라.」', '황금 광산 가장 깊은 곳의 [y]황금 두더지왕[/]을 쓰러뜨리자.', '광부 대장에게 알리자.'], done: '광산에 다시 곡괭이 소리가 울렸다.' });

  W.book('b_guestbook', { title: '산길 찻집 방명록', where: '붉은 산길 찻집', text:
    '975년 — 챔피언 되러 간다. 차 맛있었음. 돌아올 때 또 옴. — K\n(그 아래 다른 글씨) 이 녀석 또 계산 안 하고 감. — 녹\n\n' +
    '979년 — 금화 세 닢 두고 감. 차값보다 많음. 거스름돈은 다음에. — 골디\n\n' +
    '982년 — 아스트라에 가요. 무섭지만, 친구들이 같이 가요. 돌아오면 이 찻집에서 다 같이 차 마셔요. — 세린\n\n' +
    '983년 — (글씨가 번져 있다) 아기가 계속 운다. 차 한 잔만. — 방순\n\n' +
    '991년 — 약값 벌러 기사단 들어감. 누나 몰래. — 루' });
  W.book('b_forge_song', { title: '대장장이의 노래', where: '불꽃 대장간', text:
    '쇠는 불에 달구고\n사람은 일에 달군다\n한 번 치면 불꽃 튀고\n백 번 치면 칼이 된다\n\n렙업! 렙업!\n탑이 세 할 떼어 가도\n네 할 세게 치면 된다\n렙업! 렙업!\n\n(아래에 화로 아저씨 글씨) 틀린 계산인 거 안다. 그래도 친다.' });
  W.book('b_knight_rules', { title: '징수 기사단 규칙서', where: '징수 기사단 초소', author: '천년성 징수청', text:
    '제1조. 모든 경험은 빛이다. 모든 빛은 세금의 대상이다.\n제3조. 징수탑이 거두지 못한 경험(상거래 경험, 교육 경험, 연애 경험 등)은 기사가 직접 계량한다.\n제7조. 징수 기사는 경험세를 면제받는다.\n\n' +
    '제12조. 판매 경험은 판매 금액의 백분의 일을 경험으로 환산하여 과세한다.\n제13조. 제12조의 계산이 이해되지 않는 자는 이해될 때까지 납부한다.\n\n' +
    '제31조. 흰빛을 보거나 들은 자는 즉시 천년성에 보고한다. (983년 추가)' });
  W.book('b_starcat', { title: '이리스 성표 — 밝은 별 목록', where: '붉은 산 관측소', author: '은하수', text:
    '1번 북극별 · 2번 뱃사람의 별 · 3번 대장장이 별자리의 모루…\n\n' +
    '386번 쌍둥이 초롱 — 루카와 루미라는 이름의 아이들이 붙인 별명이 더 유명하다.\n[y]387번 황금별 아스트라[/] — 밤하늘에서 가장 밝은 별. 역대 챔피언들이 싸우던 곳이라 전해진다.\n388번 은빛 부스러기 — 612년 이후 새로 생긴 별. 별이 아니라 무언가의 잔해일지도 모른다.\n\n' +
    '(여백에 누군가의 연필 글씨) 광산 문 비밀번호 = 천문 번호 + 은빛 왕국이 무너진 해. 잊지 마라, 곡괭이.' });
  W.book('b_galaxy_log', { title: '관측 일지 983년', where: '붉은 산 관측소', author: '은하수', text:
    '새싹의 달 3일. 황금별 오른쪽의 검은 점, 여전히 커지는 중. 612년 기록과 같은 모양.\n\n' +
    '새싹의 달 9일. 세린 일행이 아스트라로 떠났다고 방순에게 들었다. 망원경을 밤새 들여다봤다.\n\n' +
    '새싹의 달 11일. 검은 점이 사라졌다. 사라졌다. 사라졌다.\n빛 한 줄기가 아스트라에서 번쩍했고, 그다음엔 아무것도 없었다.\n\n' +
    '새싹의 달 14일. 카이론 혼자 돌아왔다고 한다. 방순이 울었다. 나는 방순이 우는 걸 처음 봤다.\n\n' +
    '999년 새싹의 달. 검은 점이 다시 보인다. 16년. 봉인은 16년짜리였나.' });
  W.book('b_mine_log', { title: '광산 일지 — 마지막 장', where: '황금 광산', author: '곡괭이', text:
    '983년. 징수탑이 섰다. 광부들이 캔 경험의 세 할이 탑으로 간다. 금보다 경험이 비싼 세상이 됐다.\n\n' +
    '984년. 광부 절반이 떠났다. 남은 사람들은 금 대신 경험을 캐려고 더 깊이 판다.\n\n' +
    '985년. 가장 깊은 굴에서 두더지들이 올라왔다. 황금 왕관을 쓴 놈이 제일 크다. 우리가 버린 광차 바퀴로 만든 왕관이다.\n\n' +
    '985년 겨울. 문을 잠근다. 비밀번호는 별을 아는 사람만 알 수 있게 했다. 은하수 영감한테 적어 뒀다. 영감은 잊어버릴 거다. 영감은 다 잊는다. 별 빼고.' });

  /* ───────── 붉은 산길 ───────── */
  W.map('red_path', {
    name: '붉은 산길', sub: '그린과 레드 사이', region: 'red', area: 'red_path', theme: 'red', bg: '#5a2a1a', ki: W.ki('red', 0.18), music: 'field', weather: 'ash',
    grid: W.gen({
      w: 22, h: 46, seed: 'red-path', ground: '.', alt: [[':', 0.66, 4], [',', 0.7, 3]],
      obst: [['^', 3], ['T', 2], ['t', 1]], dense: 0.6, sparse: 0.04, scale: 5,
      border: '#', bt: 2, rough: 0.6,
      lakes: [{ x: 16.5, y: 20.5, rx: 2.4, ry: 1.8 }],
      paths: [[[10, 0], [10, 6], [6, 12], [6, 20], [12, 26], [12, 34], [8, 40], [11, 45]], [[6, 20], [13, 20]], [[12, 32], [16, 33]]],
      clear: [[12, 17, 7, 7], [13, 28, 6, 6]],
    }),
    builds: [{ x: 14, y: 28, w: 5, h: 4, door: 2, roof: '#8a3a2a', wall: 'wood', chimney: true, icon: 'potion', to: 'red_teahouse', tx: 4, ty: 5 }],
    edges: { up: { to: 'green', tx: 19, ty: 27 }, down: { to: 'red', tx: 18, ty: 0 } },
    objs: [
      W.sign(9, 2, ['붉은 산길 — 낙석 주의', '↑ 그린 마을   ↓ 레드 마을']),
      W.spot(14, 20, 3), W.spot(3, 40, 10, true),
      W.chest('rp1', 4, 9, 'p1', 3), W.goldChest('rp2', 18, 38, 900),
      { t: 'sign', x: 17, y: 18, text: ['「온천 — 산길 찻집 운영」', '뜨거운 물에서 수련하면 기운이 잘 돈다는 소문이 있다.'] },
    ],
    mons: { list: ['lizard', 'lizard', 'bat', 'crab'], n: 8, area: [2, 4, 18, 40] },
    enter: async (c) => {
      if (c.flag('ch2')) return;
      c.set('ch2');
      await c.chapter('2장', '불꽃과 쇠', '그린 마을을 떠난 첫날. 산길의 흙이 점점 붉어졌다.');
      await c.say('dotori:happy', ['찍! 흙이 빨개! 나무도 빨개! 여기부터 레드 지방이야!', '할머니가 그랬어. 레드 사람들은 화끈하고 자존심이 세대. 그리고 떡볶이가 불처럼 맵대!']);
      c.quest('m2', 0);
    },
  });
  W.map('red_teahouse', {
    name: '산길 찻집', region: 'red', area: 'red_path', theme: 'interior', bg: '#1a0e0a', ki: W.ki('red', 0.18), music: 'calm', banner: false,
    grid: W.room({ w: 9, h: 7, floor: '-', door: 4, win: [2, 6], rug: [2, 4, 5, 1], put: [[1, 2, 'n'], [2, 2, 'n'], [3, 2, 'b'], [6, 2, 'h'], [7, 2, 'p'], [2, 3, 'd'], [6, 4, 'd']] }),
    warps: [W.exit(4, 6, 'red_path', 16, 32)],
    objs: [W.bookObj('b_guestbook', 6, 2)],
    npcs: [{ id: 'innkeeper', x: 1, y: 3, dir: 'down', talk: async (c) => {
      await c.run(W.chatter('teahouse', [
        '어서 와요. 산길 찻집이에요. 온천물로 끓인 차 한 잔 하고 가요.',
        '방명록 봤어요? 챔피언님도 사천왕님들도 옛날엔 여기서 차를 마셨죠. 다들 계산은 안 했지만.',
        '레드 마을은 요즘 기사단 때문에 분위기가 험해요. 조심해요.',
      ], 'innkeeper'));
      await c.inn(0, 'innkeeper');
    } }],
  });

  /* ───────── 레드 마을 ───────── */
  W.map('red', {
    name: '레드 마을', sub: '불꽃과 쇠의 마을', region: 'red', area: 'red', theme: 'red', bg: '#5a2a1a', ki: W.ki('red', 0.04), town: true, weather: 'ash',
    grid: W.gen({
      w: 36, h: 30, seed: 'red-village', ground: '.', alt: [[':', 0.7, 5]],
      obst: [['^', 2], ['t', 1], ['T', 1]], dense: 0.86, sparse: 0.012, scale: 5,
      border: '#', bt: 2, rough: 0.4,
      paths: [
        [[18, 0], [18, 11]], [[8, 10], [8, 11], [15, 11], [15, 12]], [[27, 9], [27, 11], [22, 11], [22, 12]], [[15, 7], [15, 11]],
        [[7, 17], [7, 18], [15, 18], [15, 16]], [[22, 14], [35, 14]], [[18, 17], [18, 29]], [[18, 25], [5, 25]], [[18, 25], [28, 25]],
      ],
      clear: [[15, 12, 8, 5, ':'], [5, 5, 7, 6], [24, 5, 6, 5], [5, 13, 6, 5], [12, 3, 6, 5], [3, 21, 5, 5], [26, 21, 5, 5], [2, 19, 32, 2, 'L'], [18, 19, 1, 2, '_'], [8, 19, 1, 2, '_'], [28, 19, 1, 2, '_']],
      stamps: [{ x: 14, y: 12, rows: ['l'] }, { x: 23, y: 16, rows: ['l'] }, { x: 17, y: 22, rows: ['l'] }, { x: 12, y: 10, rows: ['b'] }, { x: 4, y: 10, rows: ['b'] }, { x: 31, y: 13, rows: ['l'] }, { x: 20, y: 27, rows: ['^'] }],
    }),
    builds: [
      { x: 5, y: 5, w: 7, h: 5, door: 3, roof: '#6a2a1a', wall: 'brick', chimney: true, icon: 'hammer', signColor: '#ffb88a', to: 'red_forge', tx: 5, ty: 6 },
      { x: 24, y: 5, w: 6, h: 4, door: 3, style: 'flat', roof: '#5a6ab0', wall: 'stone', icon: 'star', signColor: '#c8d0ff', to: 'red_rank', tx: 5, ty: 6 },
      { x: 5, y: 13, w: 6, h: 4, door: 2, roof: '#e84a3a', wall: 'wood', icon: 'bed', to: 'red_ddeok', tx: 5, ty: 6 },
      { x: 12, y: 3, w: 6, h: 4, door: 3, style: 'castle', roof: '#4a3a6a', wall: 'stone', to: 'red_post', tx: 5, ty: 5 },
      { x: 26, y: 21, w: 5, h: 4, door: 2, roof: '#8a4a3a', wall: 'brick', to: 'red_rud', tx: 4, ty: 5 },
      { x: 3, y: 21, w: 5, h: 4, door: 2, style: 'flat', roof: '#4a3a2a', wall: 'stone', talk: mineDoor },
      { x: 18, y: 12, w: 2, h: 3, style: 'tower' },
    ],
    edges: { up: { to: 'red_path', tx: 11, ty: 45 }, right: { to: 'red_mountain', tx: 0, ty: 34 }, down: { to: 'coast', tx: 3, ty: 0, req: { lv: 150 } } },
    objs: [
      W.gate(18, 27, { lv: 150 }, '징수 기사단 초소: 「해안길은 블루 지방이다. 레벨 150이 안 되는 자는 통과 불가.」', { style: 'light' }),
      W.sign(20, 1, ['레드 마을 — 불꽃과 쇠의 마을', '→ 붉은 산 (관측소)   ↓ 해안길 (블루 마을)   ← 황금 광산']),
      W.sign(17, 26, '↓ 해안길 · 블루 마을'),
      W.sign(9, 25, ['황금 광산 — 출입 금지', '(아래에 누군가 긁어 놓았다) 별을 아는 놈만 들어와라']),
      W.spot(33, 15, 3),
      { t: 'sign', x: 18, y: 14, invisible: true, text: ['레드 마을의 징수탑. 대장간에서 망치 소리가 날 때마다 보랏빛 수정이 반짝인다.'] },
    ],
    npcs: [
      { id: 'knight', x: 17, y: 15, dir: 'down', talk: W.chatter('red_knight', ['레드 마을 징수 구역이다. 렙업은 자유다. 세금도 자동이다.', '루드 녀석? 견습인데 숫자 하나는 기가 막히게 세. 동생들 약값 때문이라나.', '(속삭이며) …그린 마을 탑 얘기 들었어? 번개라던데. 맑은 날 번개라니.']) },
      { id: 'smith', x: 10, y: 11, dir: 'down', wander: 2, talk: W.chatter('red_smith', ['망치질 백 번에 렙업 한 번! 그중 세 할은 탑이 가져가지! 하하! …하.', '화로 아저씨는 레드 마을 최고의 대장장이야. 성질도 최고로 급하지만.', '산적 망치꾼들? 원래 우리 동료들이야. 세금 피하려고 산으로 갔지.']) },
      { id: 'villager2', x: 24, y: 15, dir: 'left', wander: 2, talk: W.chatter('red_v2', ['화산 떡볶이 먹어 봤어? 안 먹어 봤으면 레드 마을에 온 게 아니야.', '관측소 영감님은 낮에는 자. 밤에도 자. 별 볼 때만 깨어 있대.', '루드네 쌍둥이가 많이 아프대. 머리칼이 잿빛이 됐어. 빛바램병이야.']) },
      { id: 'kid', x: 13, y: 22, dir: 'down', wander: 2, talk: W.chatter('red_kid', ['용암 도랑에 떨어지면 안 돼! 엄마가 그러는데 신발이 녹는대!', '광산에 황금 두더지왕이 산대! 왕관이 광차 바퀴래!']) },
      { id: 'rud', x: 21, y: 16, dir: 'left', cond: (s) => s.flags.red_intro && !s.flags.red_rud_fight && !s.flags.m_red_galaxy, talk: W.chatter('rud_early', ['…뭘 봐. 숫자는 거짓말 안 해. 너도 세금 내.', '그린 마을에서 온 녀석이군. 탑이 무너졌다지. 「번개」라더군.']) },
    ],
    triggers: [{ x: 15, y: 12, w: 8, h: 5, once: 'ev_rud_fight', cond: (s) => s.flags.m_red_galaxy && !s.flags.red_rud_fight, run: rudFight }],
    enter: async (c) => { if (!c.flag('red_intro')) await redIntro(c); },
  });
  W.town({ map: 'red', x: 18, y: 17, name: '레드 마을', color: '#ff6a4a', desc: '불꽃과 쇠의 마을. 대장간과 화산 떡볶이.', hint: '그린 마을 남쪽 산길 너머' });

  async function redIntro(c) {
    c.set('red_intro');
    c.quest('m2', 1);
    c.spawn({ id: 'hwaro', x: 19, y: 17, dir: 'up' });
    c.spawn({ id: 'rud_scene', x: 19, y: 16, dir: 'down', look: G.chars.rud.look });
    await c.hero.walk('DDDDDDDDDD');
    await c.say(null, '광장 한가운데서 붉은 머리 소년이 덩치 큰 대장장이 앞을 막아서고 있다.');
    await c.say('rud', ['화로 아저씨. 이번 달 대장간 경험세 미납분, [y]3,120[/].', '오늘까지야.']);
    await c.say('hwaro:angry', '미납이라니! 망치 한 번 칠 때마다 탑이 세 할씩 떼 가는데 뭘 더 내라는 거냐!');
    await c.say('rud', ['그건 망치질 경험. 이건 판매 경험. 칼을 팔아서 쌓인 장사 경험도 과세 대상이야.', '규칙서 12조.']);
    await c.say('hwaro:angry', '장사 경험?! 그런 게 어딨어!');
    await c.say('rud', '숫자는 거짓말 안 해.');
    const k = await c.ask(null, ['끼어든다', '지켜본다']);
    if (k === 0) {
      await c.say('@', '그만해! 아저씨 곤란하잖아.');
      c.npc('rud_scene').face('U');
      await c.emote('rud_scene', '…');
    } else {
      await c.say(null, '화로 아저씨가 이를 갈며 품에서 수정 증서를 꺼냈다. 붉은 머리 소년이 숫자를 세다가, 문득 고개를 들어 이쪽을 봤다.');
      c.npc('rud_scene').face('U');
    }
    await c.say('rud', ['…누구야, 넌. 레드 사람 아니지. 초록 옷… 그린 마을?', '그린 마을 징수탑이 무너졌다는 보고가 올라왔어. 원인은 「번개」라더군.', '맑은 날에.']);
    await c.say('dotori:surprise', '찍! 우, 우리는 모르는 일이야!');
    await c.say('rud', ['……', '[r]숫자는 거짓말 안 해.[/] 네가 거짓말하는 거라면, 곧 알게 되겠지.']);
    await c.npc('rud_scene').walk('RRRUUUU');
    c.despawn('rud_scene');
    await c.say('hwaro', ['…휴. 고맙다, 꼬마. 저 녀석 이름은 루드야. 징수 기사단 견습이지.', '원래 저런 애가 아니었어. 우리 대장간에서 풀무질하던 착한 녀석이었는데… 동생들이 빛바램병에 걸린 뒤로 기사단에 들어갔지.']);
    await c.say('hwaro', ['그나저나 그린 마을에서 왔다고? 방순 누님 손주로구나! 누님 창을 벼린 게 바로 나야!', '대장간에 들러라. 레드 마을 무기는 대륙 최고다.']);
    await c.npc('hwaro').walk('LLLLLLLLLLLUUUUUUU');
    c.despawn('hwaro');
    await c.say('dotori', ['찍… 할머니 편지는 관측소의 은하수 박사한테 전하랬지?', '관측소는 동쪽 붉은 산 꼭대기래!']);
  }
  async function rudFight(c) {
    c.set('red_rud_fight');
    c.music('danger');
    c.spawn({ id: 'rud', x: 18, y: 17, dir: 'up' });
    c.spawn({ id: 'knight_a', x: 17, y: 17, dir: 'up', look: G.chars.knight.look });
    c.spawn({ id: 'knight_b', x: 19, y: 17, dir: 'up', look: G.chars.knight.look });
    await c.emote('rud', '!');
    await c.say('rud', ['찾았다. 그린 마을 징수탑 파괴 용의자.', '기사단 본부 명령이다. 너를 천년성으로 연행한다.']);
    await c.say('dotori:angry', '찍! 우리는 탑을 부수지 않았어! 탑이 혼자 배탈 난 거야!');
    await c.say('rud', ['탑이 흰빛을 먹으려다 터졌다는 보고가 있어. 그린 마을 담당 기사는 「번개」라고 썼지만.', '…숫자는 거짓말 안 해. 그 탑이 마지막으로 기록한 빛의 양은, 평민 천 명분이었어.']);
    await c.say('rud', '저항하면 힘으로 데려간다.');
    const win = await c.battle('rud1', { noFlee: true, music: 'boss' });
    if (!win) { c.unset('red_rud_fight'); c.unset('ev_rud_fight'); c.despawn('rud'); c.despawn('knight_a'); c.despawn('knight_b'); return; }
    c.music('sad');
    await c.say(null, '루드가 한쪽 무릎을 꿇었다. 두 기사가 슬금슬금 뒤로 물러난다.');
    await c.say('rud', ['……졌어.', '숫자는… 거짓말 안 하네. 내가 약한 거야.']);
    await c.say('knight', ['루드! 견습 주제에 체포에 실패해? 기사단 망신이다!', '휘장 내놔. 넌 오늘부로 끝이다.']);
    await c.say(null, '기사가 루드의 가슴에서 휘장을 뜯어냈다. 휘장이 바닥에 굴렀다.');
    c.despawn('knight_a'); c.despawn('knight_b');
    await c.say('rud', ['……', '다음 달 약값은. 루카랑 루미 약값은… 어떡하라고.']);
    const k = await c.ask(null, ['[y]1,000골드[/]를 건넨다', '휘장을 주워 건넨다', '아무 말 없이 떠난다']);
    if (k === 0 && c.pay(1000)) {
      c.set('helped_rud');
      await c.say('rud', ['……뭐야, 이거.', '…빚이야. 숫자로 적어 둘 거야. 반드시 갚는다.']);
    } else if (k === 0) {
      await c.say('@', '…골드가 모자라.');
      await c.say('rud', '…됐어. 동정은 필요 없어.');
    } else if (k === 1) {
      c.set('helped_rud_badge');
      c.give('badge_rud');
      await c.say(null, '휘장 뒷면에 작은 글씨가 새겨져 있다. 「루카, 루미」.');
      await c.say('rud', ['…버려. 이제 쓸모없는 거야.', '…아니. 네가 가지고 있어. 내가 다시 찾으러 갈 때까지.']);
    } else {
      await c.say('rud', '……');
    }
    await c.npc('rud').walk('RRRRRRRRDDDDD');
    c.despawn('rud');
    c.set('m_red_rud');
    await c.wait(0.5);
    c.spawn({ id: 'hooded', x: 30, y: 12, dir: 'left', look: G.chars.dawn.look });
    await c.emote('hooded', '…');
    await c.say('dawn', ['(지붕 위, 두건 쓴 사람이 중얼거린다)', '…저 아이가 탑을 부순 흰빛이라. 흥미롭군.']);
    c.despawn('hooded');
    await c.say('dotori:worry', '찍? 방금 지붕 위에 누가 있지 않았어?');
    c.quest('m2', 3);
    c.music('red');
  }
  async function mineDoor(c) {
    const s = c.s;
    if (s.flags.mine_open) { await c.warp('mine1', 14, 27, 'up'); return; }
    await c.say(null, ['광산 입구가 두꺼운 철문으로 막혀 있다. 문 한가운데 숫자 자판이 박혀 있다.', '자판 위에 긁힌 글씨: 「별을 아는 놈만 들어와라」']);
    if (!(await c.yes('비밀번호를 눌러 볼까?'))) return;
    const code = await G.ui.keypad('황금 광산 철문', '「별을 아는 놈만 들어와라」');
    if (code === '999') {
      c.sfx('unlock');
      await c.say(null, '철컥—. 16년 동안 잠겨 있던 철문이 무겁게 열렸다.');
      c.set('mine_open');
      if (s.quests.q_mine === 0) c.quest('q_mine', 1);
      if (s.lv < 250) await c.say('dotori:worry', ['찍… 안에서 무서운 소리가 나. 여기 몬스터들은 엄청 셀 것 같아.', '[y]레벨 250[/]은 넘기고 들어가는 게 좋겠어.']);
      if (await c.yes('광산으로 들어갈까?')) await c.warp('mine1', 14, 27, 'up');
    } else if (code != null) {
      c.sfx('buzz');
      await c.say(null, '삐익—. 아무 일도 일어나지 않았다.');
    }
  }

  /* ── 레드 마을 안쪽 ── */
  W.map('red_forge', {
    name: '불꽃 대장간', region: 'red', area: 'red', theme: 'interior', bg: '#1a0e0a', ki: W.ki('red', 0.04), music: 'red', banner: false,
    grid: W.room({ w: 11, h: 8, floor: '-', door: 5, win: [3, 7], put: [[1, 2, 'L'], [2, 2, 'L'], [4, 2, 'y'], [7, 2, 'h'], [8, 2, 'h'], [9, 2, 'b'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'b'], [9, 6, 'X']] }),
    warps: [W.exit(5, 7, 'red', 8, 10)],
    objs: [W.bookObj('b_forge_song', 7, 2)],
    examine: (x, y, ch) => (ch === 'L' ? '화로 속 불꽃이 쉬지 않고 일렁인다. 16년 동안 한 번도 꺼진 적이 없다고 한다.' : ch === 'y' ? '커다란 모루다. 수천 번 두드린 자국이 반질반질하다.' : null),
    npcs: [{ id: 'hwaro', x: 5, y: 3, dir: 'down', mark: (s) => (s.flags.red_intro && s.quests.q_scales == null) || (s.quests.q_scales === 0 && E.has(s, 'm3', 5)) || s.quests.q_bandit === 1 ? '!' : null, talk: hwaroTalk }],
  });
  async function hwaroTalk(c) {
    const s = c.s;
    if (s.quests.q_bandit === 1) {
      await c.say('hwaro', ['산적 놈들을 혼내 줬다고? 하하! 그놈들 방금 내려왔다. 망치 들고 대장간 일자리 달라더라.', '세금이 무서워서 산에 간 놈들이야. 근데 산에서 굶는 게 더 무서웠나 보지. …고맙다, 꼬마.']);
      c.gold(3000); c.give('p1', 5);
      c.quest('q_bandit', 'done');
      return;
    }
    if (s.quests.q_scales === 0 && E.has(s, 'm3', 5)) {
      c.take('m3', 5);
      await c.say('hwaro:happy', '오! 도마뱀 비늘 다섯 장! 잠깐 기다려라!');
      c.sfx('equip'); await c.wait(0.3); c.sfx('equip');
      c.give('t2');
      await c.say('hwaro', ['자, [y]가죽 장갑[/]이다! 렙업 버튼을 누를 때 손가락이 덜 아프고, 경험치도 훨씬 많이 들어올 거다.', '방순 누님 손주한테 싸구려를 끼울 순 없지!']);
      c.quest('q_scales', 'done');
      return;
    }
    if (s.flags.red_intro && s.quests.q_scales == null) {
      await c.say('hwaro', ['어이, 방순 누님 손주! 버튼 누르는 손을 좀 보자.', '…맨손이냐? 쯧쯧. 손가락 다 닳겠다. 몬스터한테서 [y]도마뱀 비늘[/] 5장만 구해 와라. 가죽 장갑을 만들어 주마.']);
      c.quest('q_scales', 0);
      await c.shop('red');
      return;
    }
    if (s.flags.m_red_rud && s.quests.q_bandit == null) {
      await c.say('hwaro', ['루드 녀석… 기사단에서 쫓겨났다며. 그 녀석 풀무질 솜씨는 좋았는데.', '부탁 하나 하자. 붉은 산에 [y]산적 망치꾼[/]들이 있다. 원래 우리 대장장이들이야. 세금이 무서워 산으로 도망갔지.', '여섯 놈만 혼내 줘라. 정신 차리면 내려올 거다.']);
      W.markKills(s, 'bandit', 'q_bandit_base');
      c.quest('q_bandit', 0);
      await c.shop('red');
      return;
    }
    if (s.quests.q_bandit === 0 && W.killsSince(s, 'bandit', 'q_bandit_base') >= 6) { c.quest('q_bandit', 1); return hwaroTalk(c); }
    await c.run(W.chatter('hwaro', [
      '불꽃 대장간이다! 뭐든 골라 봐라!',
      ['방순 누님은 젊을 때 대륙에서 제일 무서운 창잡이였다.', '[y]초록 창[/]이라고 불렸지. …어, 누님이 말 안 했냐? 그럼 나도 못 들은 걸로 해라.'],
      '렙업 버튼을 누를 때는 손목에 힘 빼고, 어깨로 누르는 거다. 망치질이랑 똑같다.',
      '루드 녀석한테 너무 모질게 대하지 마라. 그 녀석도 숫자 뒤에 숨어 있는 거야.',
    ]));
    await c.shop('red');
  }
  W.map('red_rank', {
    name: '레드 마을 등급소', region: 'red', area: 'red', theme: 'interior', bg: '#10141e', ki: W.ki('red', 0.04), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], rug: [3, 5, 4, 2], put: [[1, 2, 'y'], [8, 2, 'h'], [2, 4, 'n'], [3, 4, 'n'], [4, 4, 'n'], [5, 4, 'n'], [6, 4, 'n'], [7, 4, 'n'], [1, 6, 'p'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'red', 27, 9)],
    objs: [{ t: 'sign', x: 1, y: 2, invisible: true, text: ['아우룸의 석상. 이 석상은 망치를 들고 있다.', '레드 사람들은 아우룸이 대장장이였다고 믿는다. 그린 사람들은 농부였다고 믿는다.'] }],
    npcs: [W.clerk('clerk_r', 5, 3, { hello: '등급소다! 서류는 필요 없다! 도장부터 찍는다! …아, 레벨이랑 골드는 필요해.', bye: '다음! …아, 너 혼자구나.' })],
  });
  W.map('red_ddeok', {
    name: '화산 떡볶이 원조집', region: 'red', area: 'red', theme: 'interior', bg: '#1a0e0a', ki: W.ki('red', 0.04), music: 'calm', banner: false,
    grid: W.room({ w: 10, h: 8, floor: '-', door: 5, win: [3, 6], put: [[1, 2, 'L'], [2, 2, 'n'], [3, 2, 'n'], [7, 2, 'q'], [8, 2, 'q'], [2, 5, 'd'], [3, 5, 'd'], [7, 5, 'd'], [1, 6, 'b'], [8, 6, 'p']] }),
    warps: [W.exit(5, 7, 'red', 7, 17)],
    examine: (x, y, ch) => (ch === 'L' ? '떡볶이 솥 밑의 불이 용암처럼 이글거린다. …진짜 용암이다.' : ch === 'q' ? '손님용 침대다. 떡볶이 냄새가 밴 이불.' : null),
    npcs: [
      { id: 'ddeok', x: 3, y: 3, dir: 'down', mark: (s) => (s.flags.red_intro && s.quests.q_ember == null) || (s.quests.q_ember === 0 && E.has(s, 'm2', 5)) ? '!' : null, talk: ddeokTalk },
      { id: 'gokgwang', x: 4, y: 5, dir: 'left', mark: (s) => (s.flags.red_intro && s.quests.q_mine == null) || s.quests.q_mine === 2 ? '!' : null, talk: gokTalk },
    ],
  });
  async function ddeokTalk(c) {
    const s = c.s;
    if (s.quests.q_ember === 0 && E.has(s, 'm2', 5)) {
      c.take('m2', 5);
      await c.say('ddeok:happy', ['오냐, 불씨 다섯 개! 이걸로 끓여야 진짜 [r]지옥맛[/]이 나지.', '먹어 봐라. 안 맵다고 하면 두 국자 더 준다.']);
      await c.say(null, '…입안에서 화산이 터졌다. 눈물이 앞을 가린다. 하지만 멈출 수 없다.');
      c.give('f1', 5); c.gold(2000);
      c.quest('q_ember', 'done');
      await c.inn(0, 'ddeok');
      return;
    }
    if (s.flags.red_intro && s.quests.q_ember == null) {
      await c.say('ddeok', ['어서 와라. 화산 떡볶이 원조집이다. 2층은 여관이고.', '요새 불이 약해서 큰일이다. 몬스터들이 떨어뜨리는 [y]불씨 조각[/] 5개만 구해 와라. 진짜 떡볶이 맛을 보여 주마.']);
      c.quest('q_ember', 0);
    } else {
      await c.run(W.chatter('ddeok', [
        '맵다고? 한 국자 더.',
        '루드 그놈 어릴 때 여기서 떡볶이 먹고 울었지. 매워서 운 거라고 우겼지만, 그날은 제 엄마 기일이었어.',
        '방순이? 알지. 그 할망구는 여기 오면 늘 「덜 맵게」라고 해. 그래서 두 국자 더 주지.',
      ]));
    }
    await c.shop('red_food');
    await c.inn(0, 'ddeok');
  }
  async function gokTalk(c) {
    const s = c.s;
    const q = s.quests.q_mine;
    if (q === 2) {
      await c.say('gokgwang:happy', ['두더지왕을 쓰러뜨렸다고? 정말이냐! 크하하!', '16년 만에 광산에 다시 곡괭이 소리가 나겠구나. 이건 내가 쓰던 거다. 가져가라.']);
      c.give('mine_pick'); c.gold(15000);
      c.quest('q_mine', 'done');
      return;
    }
    if (q === 1) { await c.say('gokgwang', '문을 열었다고? 크하! 별을 아는 녀석이었구나. 두더지왕은 광산 가장 깊은 곳에 있다. 레벨 250은 넘기고 가라.'); return; }
    if (q === 0) { await c.say('gokgwang', ['비밀번호? 내가 정하긴 했는데… 잊어버렸다. 하하.', '은하수 영감한테 적어 뒀어. 그 영감 관측소 어딘가에 있을 거다. 영감은 다 잊어도 별은 안 잊거든.']); return; }
    if (s.flags.red_intro) {
      await c.say('gokgwang', ['나는 곡괭이. 황금 광산 광부 대장이었지. 지금은 떡볶이집 구석 대장이고.', '광산은 16년 전에 문을 잠갔다. 탑이 선 뒤로 금보다 경험이 비싸졌거든. 그러다 두더지들이 올라왔지.']);
      await c.say('gokgwang', ['가장 깊은 곳에 [y]황금 두더지왕[/]이 산다. 그놈이 빨간 구슬을 삼켰다는 소문이 있어.', '문 비밀번호는… 「별을 아는 놈만 들어와라.」 궁금하면 관측소에 가 봐라.']);
      c.quest('q_mine', 0);
    }
  }
  W.map('red_post', {
    name: '징수 기사단 초소', region: 'red', area: 'red', theme: 'castle', bg: '#0b0a1c', ki: W.ki('red', 0.04), music: 'castle', banner: false,
    grid: W.room({ w: 10, h: 7, floor: '-', door: 5, win: [4], rug: [2, 3, 6, 3], put: [[1, 2, 'h'], [2, 2, 'd'], [7, 2, 'd'], [8, 2, 'h'], [1, 5, 'b'], [8, 5, 'b']] }),
    warps: [W.exit(5, 6, 'red', 15, 7)],
    objs: [W.bookObj('b_knight_rules', 1, 2)],
    npcs: [{ id: 'knight', x: 7, y: 3, dir: 'down', talk: W.chatter('red_post', [
      '초소는 관계자 외 출입 금지… 뭐, 구경만 해. 규칙서는 읽어도 돼. 이해는 못 할 거야.',
      '31조 봤어? 「흰빛을 보거나 들은 자는 즉시 천년성에 보고한다.」 983년에 생긴 조항이야. 이상하지. 흰빛이 뭐라고.',
      '기사단장님은 천년성에 계셔. 녹턴 님이라고… 그림자 같은 분이지. 본 적은 없어. 아무도.',
    ]) }],
  });
  W.map('red_rud', {
    name: '루드의 집', region: 'red', area: 'red', theme: 'interior', bg: '#1a0e0a', ki: W.ki('red', 0.04), music: 'sad', banner: false,
    grid: W.room({ w: 9, h: 7, floor: '-', door: 4, win: [2, 6], put: [[1, 2, 'q'], [2, 2, 'q'], [5, 2, 'd'], [7, 2, 'h'], [7, 5, 'b'], [1, 5, 'p']] }),
    warps: [W.exit(4, 6, 'red', 28, 25)],
    examine: (x, y, ch) => (ch === 'd' ? '책상 위에 계산 공책이 펼쳐져 있다. 약값, 세금, 월급… 숫자가 빼곡하다. 맨 아래 줄은 늘 빨간색이다.' : null),
    npcs: [
      { id: 'luka', x: 1, y: 3, dir: 'right', mark: (s) => (s.flags.m_red_galaxy && s.quests.q_herb == null) || s.quests.q_herb === 1 ? '!' : null, talk: twinsTalk },
      { id: 'rumi', x: 2, y: 3, dir: 'left', talk: twinsTalk },
    ],
  });
  async function twinsTalk(c) {
    const s = c.s;
    if (s.quests.q_herb === 1 || (s.quests.q_herb === 0 && E.has(s, 'herb_red'))) {
      c.take('herb_red');
      await c.say('rumi:happy', ['불꽃 약초다! 이거 달이면 숨쉬기가 편해져!', '고마워. 이거… 내가 그린 거야. 줄게.']);
      c.give('drawing');
      await c.say('luka', ['형한테는 비밀이야. 형은 우리가 부탁하는 거 싫어해.', '형은 우리가 아픈 게 자기 탓인 줄 알아. 바보 형.']);
      c.quest('q_herb', 'done');
      return;
    }
    if (s.quests.q_herb === 0) { await c.say('luka', '불꽃 약초는 붉은 산 용암 호수 옆에 피어 있대. 빨갛고 반짝거려!'); return; }
    if (s.flags.m_red_galaxy && s.quests.q_herb == null) {
      await c.say('luka', ['누구야? …형 친구? 형은 친구 없는데.', '우리는 루카랑 루미. 쌍둥이야. 원래 머리가 형처럼 빨갰는데… 빛바램병 때문에 이렇게 됐어.']);
      await c.say('rumi', ['형이 기사단에 들어간 건 우리 약값 때문이야. 우리가 다 알아.', '…부탁 하나 해도 돼? 붉은 산에 [y]불꽃 약초[/]가 있대. 그걸 달이면 숨쉬기가 편해져. 형은 바빠서 못 가.']);
      c.quest('q_herb', 0);
      return;
    }
    await c.run(W.chatter('twins', [
      (c2) => c2.say('rumi', '나는 그림을 그려. 근데 색연필이 전부 회색으로 보여. 빛바램병은 눈부터 오나 봐.'),
      (c2) => c2.say('luka', '형이 그러는데 황금별 아스트라에 가면 병이 낫는대. 아무도 못 가 봤지만.'),
      (c2) => c2.say('rumi', s.flags.helped_rud ? '형이 요새 웃어. 누가 형한테 빚을 줬대. 빚지고 웃는 사람은 형밖에 없을 거야.' : '형이 요새 밤에 계산 공책을 들여다보면서 한숨을 쉬어.'),
    ]));
  }

  /* ───────── 붉은 산 ───────── */
  W.map('red_mountain', {
    name: '붉은 산', sub: '관측소로 가는 길', region: 'red', area: 'red_mountain', theme: 'red', bg: '#5a2a1a', ki: W.ki('red', 0.62), music: 'field', weather: 'ash',
    grid: W.gen({
      w: 34, h: 40, seed: 'red-mountain', ground: '.', alt: [[':', 0.62, 4]],
      obst: [['^', 4], ['T', 1], ['t', 1]], dense: 0.58, sparse: 0.05, scale: 5,
      border: '#', bt: 2, rough: 0.6,
      lakes: [{ x: 7, y: 14, rx: 3, ry: 4.5, ch: 'L' }, { x: 26, y: 27, rx: 4, ry: 2.6, ch: 'L' }],
      paths: [[[0, 34], [6, 34], [12, 28], [12, 20], [18, 14], [18, 8], [20, 7]], [[12, 24], [22, 24], [22, 22]], [[18, 14], [28, 10]], [[12, 20], [10, 16]]],
      clear: [[15, 2, 10, 6], [20, 21, 5, 3], [26, 8, 5, 5]],
    }),
    builds: [{ x: 17, y: 2, w: 6, h: 5, door: 3, style: 'dome', roof: '#3a4a8a', wall: 'stone', icon: 'scope', to: 'observatory', tx: 5, ty: 7 }],
    edges: { left: { to: 'red', tx: 35, ty: 14 } },
    objs: [
      W.sign(3, 33, ['붉은 산 — 정상에 관측소', '용암 조심. 산적 조심. 관측소 영감의 잔소리 조심.']),
      W.spot(23, 8, 3), W.spot(4, 30, 10, true), W.spot(28, 10, 3),
      W.chest('rm1', 22, 21, 'p1', 5), W.goldChest('rm2', 29, 9, 4000), W.chest('rm3', 10, 16, 'f1', 2),
      { t: 'pickup', id: 'herb_red1', x: 21, y: 22, item: 'herb_red', c: '#ff4a2a', cond: (s) => s.quests.q_herb === 0 || s.chests.herb_red1, text: '용암의 열기를 머금은 약초다. 조심스럽게 캐냈다.', after: async (c) => { c.quest('q_herb', 1); } },
    ],
    mons: { list: ['ember', 'bandit', 'armor', 'lizard', 'bandit', 'bat'], n: 10, area: [2, 8, 30, 30] },
    fixed: [{ mon: 'salamander', x: 26, y: 23, flag: 'beat_salamander', boss: true }],
  });
  W.map('observatory', {
    name: '붉은 산 관측소', region: 'red', area: 'red_mountain', theme: 'space', bg: '#05040e', ki: W.ki('red', 0.62), music: 'space', banner: false,
    grid: W.room({ w: 12, h: 9, floor: 'm', door: 5, win: [], put: [[1, 1, 'j'], [2, 1, 'j'], [3, 1, 'j'], [8, 1, 'j'], [9, 1, 'j'], [10, 1, 'j'], [5, 3, 'y'], [6, 3, 'y'], [1, 2, 'h'], [2, 2, 'h'], [9, 2, 'd'], [10, 2, 'u'], [1, 6, 'n'], [2, 6, 'n'], [10, 6, 'p']] }),
    warps: [W.exit(5, 8, 'red_mountain', 20, 7)],
    objs: [
      W.bookObj('b_starcat', 1, 2), W.bookObj('b_galaxy_log', 9, 2),
      { t: 'sign', x: 5, y: 3, invisible: true, talk: telescope },
      { t: 'sign', x: 6, y: 3, invisible: true, talk: telescope },
    ],
    npcs: [
      { id: 'galaxy', x: 8, y: 3, dir: 'left', mark: (s) => (!s.flags.m_red_galaxy ? '!' : null), talk: galaxyTalk },
      { id: 'scholar', x: 1, y: 7, dir: 'right', talk: async (c) => { await c.say('scholar', '박사님 조수예요. 매점도 제가 봐요. 박사님이 주무시는 동안 관측소의 모든 일은 제가 해요. 그러니까 거의 모든 시간 동안.'); await c.shop('observatory'); } },
    ],
  });
  async function telescope(c) {
    const s = c.s;
    if (!s.flags.m_red_galaxy) { await c.say(null, '거대한 망원경이다. 렌즈 한가운데 붉은 무언가가 박혀 있다.'); return; }
    if (!s.orbs.o_r3) {
      await c.say(null, '망원경을 들여다봤다. 밤하늘 한가운데 황금빛 별이 떠 있다. 그 오른쪽에… 작고 검은 점.');
      await c.say('galaxy', ['렌즈에 박힌 그 빨간 구슬 말이냐? 아우룸 시대 유물이다. 별빛을 모아 준다지.', '가져가라. 나는 이제 이거 없이도 그 검은 점이 보인다. …보고 싶지 않아도 보이지.']);
      await c.orb('o_r3');
      return;
    }
    await c.say(null, '황금별 아스트라가 빛난다. 그 옆의 검은 점은 어제보다 조금 더 커진 것 같다.');
  }
  async function galaxyTalk(c) {
    const s = c.s;
    if (!s.flags.m_red_galaxy) {
      await c.say(null, '흰 수염의 노인이 책상에 엎드려 코를 골고 있다.');
      await c.emote('galaxy', 'z');
      await c.say('galaxy', '……쿨…… 별이…… 다섯 개…… 쿨……');
      const k = await c.ask(null, ['흔들어 깨운다', '렙업 버튼을 누른다']);
      if (k === 0) {
        await c.say('galaxy', '……음냐…… 별이…… 여섯 개…… 쿨……');
        await c.say('dotori', '찍… 안 일어나. 할머니가 그랬어. 이 영감님은 큰 빛이 아니면 안 깬대.');
        await c.sys('박사 옆에서 [y]렙업![/] 버튼을 눌러 보자.');
      }
      await c.waitClick(1);
      c.light(60);
      c.flash('#ffffff', 700);
      await c.emote('galaxy', '!');
      await c.npc('galaxy').jump();
      await c.say('galaxy:surprise', ['눈부셔! 태양이 떴나? 초신성인가?', '…아니. 이건… [w]흰빛[/]?']);
      await c.say('@', '그린 마을에서 왔어요. 할머니가 편지를 전하래요.');
      c.take('letter_gran');
      await c.say(null, '박사가 새싹 도장이 찍힌 봉투를 뜯었다. 편지는 짧았다.');
      await c.say(null, '「은하수 영감. 그 아이가 버튼을 눌렀다. 흰빛이다.\n니가 아는 걸 알려 줘라. 나는 아직 몬 하겠다. — 방순」');
      await c.say('galaxy', ['……', '방순이 녀석. 제일 어려운 건 늘 나한테 떠넘기지.']);
      c.music('mother');
      await c.say('galaxy', ['…얼굴 좀 보자. 그래. 눈매가 똑같구나.', '[y]세린[/]의 아이로구나.']);
      await c.emote('@', '!');
      await c.say('@', '세린…? 우리 엄마 이름이… 세린이에요?');
      await c.say('galaxy:surprise', ['……어. 방순이가 아직 그것도 말 안 했나?', '에잉. 나는 모른다. 못 들은 걸로 해라.']);
      await c.say('dotori', '찍! 벌써 다 들었어!');
      await c.say('galaxy', ['…흠흠. 망원경을 봐라. 저기 가장 밝은 황금별이 보이지? [y]아스트라[/]다. 역대 챔피언들이 싸우던 별이지.', '그 오른쪽에 작은 검은 점이 보일 거다. 우리는 그걸 [r]흑점[/]이라고 부른다.']);
      await c.say('galaxy', ['612년, 서쪽 은빛 왕국이 사흘 만에 무너지던 해에 처음 나타났다. 2대 전설 벨라가 그것과 싸우다 죽었지.', '흑점은 빛을 먹는다. 흑점에 먹힌 곳은 아무것도 자라지 않아. 레벨이 0이 되지.']);
      await c.say('galaxy', ['16년 전, 그 검은 점이 갑자기 사라졌다. 내 일지에 적혀 있다.', '…같은 날 밤, 네 엄마는 돌아오지 않았다.']);
      await c.say('@', '……');
      await c.say('galaxy', ['그리고 올해, 흑점이 다시 보이기 시작했다.', '나는 거기까지만 안다. 나머지는 내가 말할 자격이 없어.']);
      await c.say('galaxy', ['대신 하나만 알려 주마. 블루 마을 [y]대도서관[/]에 네 엄마가 쓴 책이 있다. 「무한의 그릇에 관하여」.', '레벨 150이 되면 해안길 기사들이 지나가게 해 줄 거다. 가서 읽어라. 네가 읽어야 할 책이다.']);
      await c.say('galaxy', '망원경에 박힌 빨간 구슬도 가져가라. 아우룸 시대 유물이다. 자, 들여다봐라.');
      c.set('m_red_galaxy');
      c.music('space');
      await telescope(c);
      c.quest('m2', 2);
      if (s.quests.q_mine === 0) await c.say('galaxy', ['광산 비밀번호? 곡괭이 그 녀석이 나한테 적어 줬다고? …기억 안 나.', '내 성표 어딘가에 끄적였겠지. 책장을 뒤져 봐라.']);
      return;
    }
    await c.run(W.chatter('galaxy', [
      '흑점은 매일 조금씩 커진다. 망원경으로 보면 안다. 안 보면 모르지. 대부분은 안 본다.',
      ['네 엄마는 이 관측소에 자주 왔었다. 별을 보면서 늘 이렇게 말했지.', '「별빛도 결국 누군가가 나눠 준 빛이에요.」'],
      '방순이한테 안부 전해라. 아니, 전하지 마라. 편지 떠넘긴 거 아직 화났다.',
      '광산 비밀번호? 성표 여백을 봐라. 나는 모든 걸 여백에 적는다. 그리고 잊는다.',
    ]));
  }

  /* ───────── 황금 광산 ───────── */
  W.map('mine1', {
    name: '황금 광산 1층', sub: '잠든 금맥', region: 'red', area: 'mine', theme: 'mine', bg: '#0a0806', ki: W.ki('blue', 0.28), music: 'cave', dark: 72, battleBg: 'mine',
    grid: W.gen({
      w: 30, h: 30, seed: 'gold-mine-1', ground: 'o', alt: [],
      obst: [['#', 4], ['^', 2], ['b', 1]], dense: 0.55, sparse: 0.05, scale: 4,
      border: '#', bt: 1, rough: 0.7,
      paths: [[[14, 29], [14, 22], [6, 18], [6, 8], [14, 4], [24, 4], [24, 14], [18, 18], [14, 22]]], path: '=',
      clear: [[22, 2, 4, 3], [4, 6, 4, 4]],
      stamps: [{ x: 24, y: 3, rows: ['S'] }],
    }),
    warps: [{ x: 14, y: 29, to: 'red', tx: 5, ty: 25, dir: 'down' }, { x: 24, y: 3, to: 'mine2', tx: 3, ty: 25, dir: 'up' }],
    objs: [
      W.spot(5, 8, 3), W.spot(20, 16, 10, true),
      W.chest('mn1', 6, 7, 'p2', 3), W.goldChest('mn2', 25, 13, 30000),
      W.bookObj('b_mine_log', 4, 6),
    ],
    mons: { list: ['minemole', 'minemole', 'goldbat', 'gemgolem'], n: 9, area: [1, 1, 28, 27] },
    enter: async (c) => { if (c.flag('tip_mine')) return; c.set('tip_mine'); await c.say('dotori:worry', ['찍… 캄캄해. 광차 레일이 안쪽으로 이어져 있어.', '레일을 따라가면 더 깊은 곳으로 내려가는 계단이 있을 거야.']); },
  });
  W.map('mine2', {
    name: '황금 광산 깊은 굴', sub: '두더지왕의 방', region: 'red', area: 'mine', theme: 'mine', bg: '#0a0806', ki: W.ki('blue', 0.42), music: 'cave', dark: 60, battleBg: 'mine',
    grid: W.gen({
      w: 28, h: 28, seed: 'gold-mine-2', ground: 'o',
      obst: [['#', 4], ['^', 2]], dense: 0.55, sparse: 0.05, scale: 4,
      border: '#', bt: 1, rough: 0.7,
      paths: [[[3, 25], [10, 22], [10, 12], [18, 8], [22, 4]], [[10, 16], [22, 18]]], path: '=',
      clear: [[18, 2, 8, 5], [19, 16, 5, 4]],
      stamps: [{ x: 3, y: 26, rows: ['S'] }, { x: 18, y: 2, rows: ['K'] }, { x: 25, y: 2, rows: ['K'] }],
    }),
    warps: [{ x: 3, y: 26, to: 'mine1', tx: 24, ty: 4, dir: 'down' }],
    objs: [W.spot(21, 17, 3), W.chest('mn3', 23, 18, 'p2', 5), W.goldChest('mn4', 19, 3, 60000)],
    mons: { list: ['cartghost', 'gemgolem', 'goldbat', 'minemole'], n: 9, area: [1, 7, 26, 20] },
    fixed: [{ mon: 'moleking', x: 22, y: 4, flag: 'beat_moleking', boss: true, look: { creature: 'beast', tint: '#ffd84a' }, talk: moleKing }],
  });
  async function moleKing(c, mo) {
    await c.say(null, '광차 바퀴로 만든 황금 왕관을 쓴 거대한 두더지가 금덩이 위에 앉아 있다.');
    await c.say('dotori:surprise', '찍! 저 배 좀 봐! 빨갛게 빛나고 있어! 구슬을 삼켰나 봐!');
    const win = await c.battle('moleking', { noFlee: true });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_moleking');
    await c.say(null, '두더지왕이 꿀꺽꿀꺽 하더니 무언가를 퉤 뱉었다. 붉게 빛나는 구슬이다.');
    await c.orb('o_r4');
    if (c.s.quests.q_mine === 1) c.quest('q_mine', 2);
    await c.say('dotori', '광부 대장 아저씨한테 알려 주자! 떡볶이집에 있을 거야!');
  }

  G.world.nodes.push({ region: 'red', label: '레드', x: 58, y: 150, color: '#ff6a4a', maps: ['red', 'red_path', 'red_mountain', 'observatory', 'red_teahouse', 'red_forge', 'red_rank', 'red_ddeok', 'red_post', 'red_rud'] });
  G.world.nodes.push({ region: 'red', label: '광산', x: 30, y: 158, color: '#ffd84a', maps: ['mine1', 'mine2'] });
})();
