/* 제8장 「색을 잃은 땅」 — 그레이 · 강철공 볼트의 공방 · 로봇 소녀 세피아 · 고철 시장 · 은빛 광맥(던전 8) · 폐공장의 MK-7
   612년, 은빛 왕국의 왕이 광맥의 빛을 마셨다. 이튿날 배가 고프다고 했고, 사흘째 하늘에 검은 점이 떴다.
   탑을 설계한 볼트는 16년 동안 「등대」를 켜 왔다는 걸 알게 된다. 증명 → 역류 장치의 설계도.
   광맥 바닥의 빈 왕 — 그리고 처음으로, 내 안의 배고픔이 대답한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const GT = OW.towns.gray, X0 = GT.x, Y0 = GT.y;           // 18, 100
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const RUIN = { x: 20, y: 125 };                            // 은빛 왕국 폐허 (광맥 입구)
  const FACT = { x: 52, y: 104 };                            // 폐공장
  const girl = () => S().gender === 'girl';
  ST.GRAY = { X0, Y0, RUIN, FACT };

  ST.CH.push({ no: '제8장', id: 'c8', title: '색을 잃은 땅', sub: '400년 전에 색이 빠진 땅. 사람들은 회색 옷을 입고, 회색 빵을 먹고, 회색 꿈을 꾼다.',
    goal(s) {
      if (!f('c8_bolt')) return { text: '고철 공방의 강철공 볼트를 만나자.', map: 'world', x: X0 + 24, y: Y0 + 8 };
      if (!f('d8:boss')) return { text: '남쪽 은빛 왕국 폐허, 광맥 가장 깊은 곳의 기록을.', map: 'world', x: RUIN.x + 3, y: RUIN.y + 2 };
      if (!f('c8_proof')) return { text: '기록을 볼트에게 보여 주자.', map: 'world', x: X0 + 24, y: Y0 + 8 };
      if (!f('c8_mk7')) return { text: '동쪽 폐공장. 볼트가 기다린다.', map: 'world', x: FACT.x + 4, y: FACT.y + 6 };
      if (!f('c8_done')) return { text: '공방으로 돌아가 볼트와 이야기하자.', map: 'world', x: X0 + 24, y: Y0 + 8 };
      return { text: '동쪽 끝, 영원한 밤의 땅 블랙으로.', map: 'world', x: OW.towns.black.x + 17, y: OW.towns.black.y + 12 };
    } });
  ST.closedMsg.black = '동쪽 끝은 해가 안 뜨는 땅이래. 녹턴이라는 사천왕이 지킨대. 아직은… 무서워, 찍.';

  /* ───────── 물건 ───────── */
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('gear_rust', { type: 'key', name: '녹슨 톱니', desc: '드론이 떨어뜨린 톱니. 고철상 러스크가 모은다.' });
  item('reverser', { type: 'key', name: '역류 장치 설계도', desc: '볼트가 하룻밤에 그린 설계도. 탑의 흐름을 거꾸로 돌려 모인 빛을 대륙으로 흩는다. 부품은 천년성 중앙 제어실에.' });
  item('silver_rec', { type: 'key', name: '612년의 기록판', desc: '은빛 왕국 기록 보관소의 은판. 「그릇 계획」 최종 보고.' });
  item('drawer_key', { type: 'key', name: '작은 서랍 열쇠', desc: '세피아가 몸속에 지니고 있던 열쇠. 「볼트가 울 수 있게 되면 건네라.」' });
  G.data.BOOKS.b_silver = { name: '은빛 왕국 연대기 (잔편)', short: '광맥 기록 보관소의 부서진 은판들', pages: ['608년. 대광맥에서 빛이 샘솟는다. 왕국은 은빛으로 빛난다. 백성들은 밤에도 책을 읽는다.', '611년. 과학원이 「그릇 계획」을 올린다. 광맥의 빛을 한 사람에게 모으면 영원히 마르지 않는 왕이 된다.', '612년 봄. 왕이 광맥의 빛을 마신다. 이튿날 왕은 배가 고프다고 한다. 셋째 날 하늘에 검은 점이 뜬다.', '612년 여름. 왕국의 색이 빠진다. 은빛에서 잿빛으로. 기록은 여기서 끊긴다.'] };

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'g_work', region: 'gray', style: 'gray', tx: X0 + 20, ty: Y0 + 2, w: 8, h: 5, name: '볼트의 공방', sign: 'shop', colors: { roof: '#4a5058' },
      room: { w: 22, h: 13, floor: T.METAL, music: 'gray', furn: [['desk', 4, 3, { text: '설계대. 징수탑 단면도 위에 새 도면이 겹쳐 있다. 제목: 「천년포」. 여백에 작은 글씨로 계산식이 빼곡하다.' }], ['gears', 9, 2], ['gears', 12, 2], ['anvil', 16, 4], ['console', 19, 3, { text: '제어판. 녹색 불 하나가 느리게 깜빡인다. 「N-07 : 정상」.' }], ['crate', 2, 9], ['crate', 3, 9], ['barrel', 19, 9], ['shelf', 1, 2], ['clock', 14, 1, { wall: true, text: '벽시계. 9년 전 가을 세 시 십 분에 멈춰 있다. 태엽은 멀쩡하다.' }], ['desk', 7, 8, { verb: '서랍을 연다', text: async (c) => drawer(c) }]] } });
    ST.house(m, { id: 'g_inn', region: 'gray', style: 'gray', tx: X0 + 3, ty: Y0 + 3, w: 6, h: 4, name: '잿빛 모루 여관', sign: 'inn',
      room: { w: 14, h: 10, floor: T.WOOD, music: 'calm', furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['stove', 8, 2], ['table', 8, 6], ['chair', 7, 7], ['chair', 10, 7], ['bed2', 12, 3, { v: '#7a7a82' }], ['bed2', 12, 6, { v: '#8a8a92' }]] } });
    ST.house(m, { id: 'g_shop', region: 'gray', style: 'gray', tx: X0 + 3, ty: Y0 + 14, w: 5, h: 4, name: '고철 시장', sign: 'shop',
      room: { w: 12, h: 9, floor: T.METAL, music: 'gray', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['gears', 1, 2], ['gears', 10, 2], ['crate', 2, 6], ['barrel', 9, 6]] } });
    ST.house(m, { id: 'g_fact', region: 'gray', style: 'gray', tx: FACT.x, ty: FACT.y, w: 9, h: 5, name: '폐공장', colors: { roof: '#3a3e44', wall: '#6a6a70' }, win: 'dark',
      room: { w: 24, h: 16, floor: T.METAL, music: 'dread', furn: [['gears', 3, 2], ['gears', 20, 2], ['console', 11, 2, { text: '「MK-7 시험 운전 기록 — 990년 가을 이후 중단」' }], ['crate', 2, 13], ['crate', 21, 13], ['barrel', 3, 13], ['barrel', 20, 13]] } });
    // 고철 노점
    for (const [dx, dy, col] of [[21, 13, '#8a8a92'], [25, 13, '#a87a4a']]) { OW.clear(m, X0 + dx, Y0 + dy, 3, 1, 0, null); G.build.placeBuilding(m, { special: 'stall', tx: X0 + dx, ty: Y0 + dy, w: 3, h: 1, col, door: false }); }
    // 은빛 왕국 폐허: 무너진 성문과 기둥
    OW.clear(m, RUIN.x - 3, RUIN.y - 2, 13, 8, 0, T.STONE);
    G.build.placeBuilding(m, { special: 'gate', tx: RUIN.x, ty: RUIN.y, w: 6, h: 1, col: '#a8b0c0', to: 'd8', id: 'd8_gate', cond: () => f('c8_bolt'), msg: '무너진 성문 너머로 광맥 냄새. 은빛 먼지가 발목까지 쌓였다. 볼트를 먼저 만나 보자.' });
    for (const [dx, dy] of [[-2, 1], [7, 1], [-2, 4], [7, 4]]) G.build.placeBuilding(m, { special: 'statue', tx: RUIN.x + dx, ty: RUIN.y + dy, w: 1, h: 1, col: '#9aa0b0', door: false, sword: dx < 0 });
    for (let y = RUIN.y + 1; y < RUIN.y + 6; y++) for (const x of [RUIN.x + 2, RUIN.x + 3]) { const i = m.i(x, y); m.ter[i] = T.STONE; m.obj[i] = 0; }
    // 공장 굴뚝 연기 대신 가로등
    for (const [dx, dy] of [[12, 8], [22, 8], [12, 15], [22, 15]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 50, warm: 'rgba(255,170,90,0.2)' }); }
  });
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(GT.plaza.x + 3), y: py(GT.plaza.y + 3), wid: 'w_gray', name: '그레이 고철 광장' }));
    Wd.add(new P.Waystone({ x: px(RUIN.x + 8), y: py(RUIN.y + 4), wid: 'w_ruin', name: '은빛 왕국 폐허' }));
    Wd.add(new P.Sign({ x: px(X0 + 15), y: py(Y0 + 21), text: '그레이 — 쇠와 재의 땅\n「쓸데없는 말은 연료 낭비다」 — 고철 조합' }));
    Wd.add(new P.Sign({ x: px(RUIN.x + 5), y: py(RUIN.y + 5), text: '은빛 왕국 — 608~612\n「우리는 빛났다. 그래서 배가 고팠다」 — 누군가 긁어 쓴 글씨' }));
  });

  /* ───────── 색 없는 땅: 들어서면 색이 빠진다 ───────── */
  const oldSky8 = G.story.skyTint;
  G.story.skyTint = () => { const Wd = G.world, p = Wd.player; if (Wd.map && Wd.map.overworld && p && OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) === 'gray') return 'rgba(140,140,150,0.4)'; return oldSky8 ? oldSky8() : null; };
  let grayOn = false;
  ST.onTick.push(() => {
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !p || !G.cine) return;
    const inGray = (m.overworld && OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) === 'gray') || m.palName === 'gray';
    if (inGray !== grayOn && !G.script.running) { grayOn = inGray; G.cine.filter(inGray && !f('c8_color') ? 'half' : ''); }
  });

  /* ───────── 제8장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c7_done') || f('ch:c8')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'gray') return;
    S().flags['ch:c8'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c8');
      c.music('gray');
      await c.say('toria', '찍… 네 옷만 색이 있어. 나머지는 다 회색이야. 하늘도, 풀도, 사람도.', { face: 'sad' });
      await c.say('toria', '612년에 은빛 왕국이 무너질 때 땅의 색이 빠졌대. 400년이 지났는데 아직도…', { face: 'think' });
      const rt = S().flags.route_lock;
      if (rt === 'order') await c.say(null, '카시안의 편지가 도착해 있었다. 「얼음 창고 보고서를 올렸다. 스승님의 답: 「관은 내가 놓은 것이다. 계산에 필요하다.」 …계산에 사람이 몇 명 들어가 있는지, 이제 묻지 않기로 했다. 대신 네게 묻겠다. — 카시안」', { style: 'sys' });
      else if (rt === 'dawn') await c.say(null, '루드의 쪽지가 모루 여관 문틈에 끼워져 있었다. 「누나가 천년성 밑 수로를 찾았어. 볼트라는 사람 도면이 있으면 빨라. 그 사람, 우리 아버지를 알 거야. 광부였거든. — 루드」', { style: 'sys' });
      else await c.say(null, '여관 창틀에 까만 깃털 한 장. 「얼음 창고의 관은 천년성으로 간다. 그리고 천년성의 관은 — 하늘로. 볼트의 도면을 보면 끝이 보일 거다. — M」', { style: 'sys' });
      c.lock(false);
      c.journal('잿빛 땅 그레이에 닿았다. 색이 없는 땅. 탑을 설계한 강철공 볼트가 여기 산다.');
    });
  });

  /* ───────── 볼트 ───────── */
  ST.person('g_work', { id: 'bolt', x: 11, y: 5, dir: 'down', mark: () => (!f('c8_bolt') || (f('d8:boss') && !f('c8_proof')) || (f('c8_mk7') && !f('c8_done')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:bolt');
    if (!f('c8_bolt')) { await boltFirst(c, n); return; }
    if (f('d8:boss') && !f('c8_proof')) { await boltProof(c, n); return; }
    if (f('c8_mk7') && !f('c8_done')) { await boltLast(c, n); return; }
    if (f('c8_proof') && !f('c8_mk7')) { await c.say(n, '폐공장. 동쪽. …기다리게 하지 마라. 16년도 기다렸다.', { face: 'closed' }); return; }
    await c.say(n, ST.lines({ c8: f('c8_done') ? '역류 장치. 부품은 천년성에. 끼우는 건 네 일이다. 나는 도면까지다. …틀리지 마라.' : '광맥. 남쪽 폐허. 기록을 가져와라. 느낌은 연료가 안 된다.', c10: '알록달록의 피로스 녀석, 로켓 연료 계산을 틀렸더군. 편지로 고쳐 줬다. 쓸데없는 말 빼고 세 장.' }), { face: 'normal' });
  } });
  async function boltFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '…용건. 쓸데없는 말은 연료 낭비다. 한 줄로.', { face: 'closed' });
    const k = await c.choice('볼트에게 한 줄로.', ['「징수탑을 만든 사람을 찾아왔어요.」', '「루미에 성녀님이 보냈어요.」', '「탑이 흑점을 부른대요.」']);
    if (k === 1) await c.say(n, '루미에. …그 여자는 거짓말을 못 하지. 그래서 싫다.', { face: 'angry' });
    if (k === 2) await c.say(n, '「대요」. 전해 들은 말. 연료가 안 된다.', { face: 'angry' });
    await c.say(n, '탑은 내가 설계했다. 983년. 카이론의 부탁. 대륙의 빛을 모아 하늘을 지키는 탑.', { face: 'normal' });
    await c.say(n, '지금은 그 빛을 쏠 대포를 만든다. [y]천년포[/]. 16년 치 빛으로 흑점을 쏜다. 계산은 끝났다.', { face: 'normal' });
    await c.say('toria', '엄마 노트에 그랬어요. 빛을 한곳에 모으면 안 된다고. 나눠 주라고.', { face: 'angry' });
    await c.say(n, '근거. 느낌은 연료가 안 된다. 숫자를 가져와라. 숫자라면 들어 주지.', { face: 'closed' });
    await c.say(n, '…남쪽에 은빛 왕국 폐허가 있다. 광맥 깊은 곳에 기록 보관소가 무너지지 않고 남았다. 612년의 기록이 있을 거다.', { face: 'normal' });
    await c.say(n, '나는 안 가 봤다. 가 볼 이유가 없었으니까. …가 보고 싶지 않았으니까.', { face: 'sad' });
    await c.say(n, '광맥은 어둡다. 등불 없이는 한 발짝도 못 간다. 입구 근처 광부 보관함에 낡은 등불이 있을 거다. 사백 년 전 거라도 쇠는 쇠다.', { face: 'normal' });
    c.flag('c8_bolt');
    await c.cinema(false);
    c.lock(false);
    c.journal('강철공 볼트를 만났다. 탑을 설계한 사람. 「근거. 숫자를 가져와라.」 남쪽 은빛 왕국 광맥으로.');
  }
  async function boltProof(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '…가져왔나. 보여 줘.', { face: 'normal' });
    await c.narr('볼트가 은빛 기록판을 한 장씩 넘겼다. 아주 오랫동안. ' + (S().truth.t_chart ? '아스텔의 관측표를 옆에 펼쳤다. ' : '') + (S().truth.t_star ? '' : '') + '공방의 시계 소리만 났다. 멈춘 시계인데도.');
    await c.say(n, '「흡광체는 빛의 총량이 아니라 밀도에 이끌린다. 빛이 한 점에 모일수록 접근이 빨라진다.」', { face: 'closed' });
    await c.say(n, '……', { face: 'sad' });
    await c.say(n, '내 탑은 16년 동안 대륙의 빛을 아스트라 한 점에 모았다. 은빛 왕국 대광맥의 세 배.', { face: 'sad' });
    await c.say(n, '그러니까 나는… 16년 동안 흑점에게 가장 밝은 [r]등대[/]를 켜 준 거군.', { face: 'shock' });
    await c.say(n, '…아니다. 기록판 한 장으로는 부족하다. 16년을 뒤집으려면 더 큰 증명이 필요하다.', { face: 'angry' });
    await c.say(n, '동쪽 폐공장으로 와라. 내 MK-7이 있다. 천년포의 시제품. 대륙에서 제일 큰 기계. 그걸 이기면 — 네 말이 맞다고 인정하지.', { face: 'angry' });
    c.flag('c8_proof');
    await c.cinema(false);
    c.lock(false);
    c.journal('612년의 기록을 본 볼트: 「나는 16년 동안 흑점에게 등대를 켜 준 거군.」 그래도 증명이 더 필요하다며 폐공장으로 불렀다.');
  }

  /* ───────── 세피아 (N-07) ───────── */
  ST.person('world', { id: 'sepia', x: X0 + 29, y: Y0 + 8, dir: 'down', when: () => ST.after('c8') && !f('c8_sepia_join'), mark: () => (!f('c8_color') ? '?' : null), talk: async (c, n) => {
    c.flag('met:sepia');
    if (!f('c8_color')) {
      c.lock(true);
      await c.say(n, '안녕하십니까. N-07. 이름은 세피아. 볼트가 만든 일곱 번째 로봇입니다.', { face: 'normal' });
      await c.say(n, '당신 옷의 온도가 다르다. 색이 있는 옷. 그리고… 당신 몸에서 흰빛이 난다. 흥미롭다.', { face: 'normal' });
      await c.say(n, '나는 색을 볼 수 없다. 색 인식 부품이 없다. 그래서 색을 병에 모은다. 온도로. 빨강은 따뜻하고, 파랑은 차갑다고 들었다.', { face: 'sad' });
      const k = await c.choice('세피아가 빈 색 표본 병을 들고 있다.', [{ t: '손을 잡고 흰빛을 흘려 본다', sub: '나눈 만큼 조금 지친다.', tag: 'dawn' }, { t: '「색은 말로 설명하기 어려워.」' }]);
      if (k === 1) { await c.say(n, '…그렇다고 들었다. 기록해 둔다. 「어렵다.」', { face: 'normal' }); c.lock(false); return; }
      await c.cinema(true);
      c.sfx('white'); c.flash('#ffffff', 0.3);
      await c.narr('흰빛이 세피아의 금속 손을 타고 회로로 흘러 들어갔다. 세피아의 노을빛 렌즈가 깜빡였다.\n…그리고 세피아는 멈췄다.');
      await c.say('toria', '…고장 났어?', { face: 'shock' });
      await c.wait(1.2);
      c.filter('bright');
      c.flag('c8_color');
      await c.say(n, '……', { face: 'shock' });
      await c.say(n, '…초록. 네 옷. 이게 초록. 다람쥐. 갈색. 갈색은… 따뜻하다.', { face: 'shock' });
      await c.say(n, '하늘은… 회색. 역시 회색. 하지만 회색에도 종류가 있다. 이건 비 오기 전 회색. 저건 연기 회색.', { face: 'happy' });
      await c.say(n, '3분 동안 계산했다. 이 감정의 이름을 찾지 못했다. …「예쁘다.」 이게 예쁘다구나.', { face: 'happy' });
      c.filter('');
      await c.say(n, '볼트한테 가서 말할 것이다. 세피아가 색을 봤다고. …아니. 같이 가겠다. 광맥은 어둡다. 내 렌즈는 어둠에서도 본다.', { face: 'normal' });
      c.flag('c8_sepia_join'); ST.join('sepia'); S().shareCount = (S().shareCount || 0) + 1;
      await c.cinema(false);
      c.lock(false);
      c.journal('로봇 소녀 세피아에게 흰빛을 나눴다. 세피아가 처음으로 색을 봤다. 「예쁘다.」 세피아가 따라나섰다.');
      return;
    }
  } });

  /* ───────── 서랍: 볼트의 부치지 않은 편지 ───────── */
  async function drawer(c) {
    if (S().truth.t_bolt) { await c.narr('비어 있는 서랍. 안쪽 바닥에 오래된 잉크 자국이 번져 있다.'); return; }
    if (!S().inv.drawer_key) { await c.narr('공방 철제 서랍. 자물쇠가 세 겹이다. 녹 하나 없이 반짝인다. 매일 닦은 모양이다.'); return; }
    await c.narr('세피아의 열쇠를 꽂자 자물쇠 세 개가 한꺼번에 풀렸다.\n서랍 안에는 봉투 하나. 겉봉에 「천년성 · 챔피언 카이론 귀하」. 우표는 붙어 있는데 소인이 없다.');
    await c.narr('「카이론. 계산을 끝냈다. 탑들이 모은 빛을 한 점에 모으면 흑점이 온다. 과녁을 바꿔라. 탑을 멈춰라. 아내가 죽었다. 빛바램병이다. 탑 때문이다. …이 편지를 부치면 나는 틀린 사람이 된다. — 990년 가을, 볼트」');
    c.truth('t_bolt');
    await c.say('toria', '…9년 전에 다 알았어. 볼트 아저씨. 알았는데 못 부쳤어. 아내가 떠난 해에.', { face: 'sad' });
  }

  /** 은빛 왕관: 쓰면 빛 알갱이가 잘 모이지만, 배가 고파진다 */
  async function crownUse(c) {
    if (f('d8:crown')) { await c.narr('빈 받침대. 왕관이 있던 자리만 동그랗게 빛난다.'); return; }
    await c.narr('은빛 왕관. 왕좌 앞 받침대에 놓여 있다. 400년 동안 먼지 한 톨 앉지 않았다.\n안쪽에 글씨: 「더, 더, 더.」');
    const k = await c.choice('왕관을 어떻게 할까?', [{ t: '가져간다', sub: '[r]심연[/]. 빛 알갱이가 잘 모인다고 한다. 쓰고 있으면 배가 고프다고 한다.' }, { t: '그대로 둔다' }]);
    if (k === 0) { c.flag('d8:crown'); c.abyss('crown'); await c.getItem('ac_crown'); await c.say('toria', '…그거 쓰지 마. 쓰더라도 나 안 볼 때 써.', { face: 'sad' }); }
    else { c.bond('toria', 1); await c.say('toria', '잘했어. 저건 왕이 배고파서 만든 거야. 배고픈 사람 물건은 배고프게 해.', { face: 'smile' }); }
  }

  /* ═════════ 은빛 광맥 (던전 8) ═════════ */
  G.dungeon.def('d8', {
    name: '은빛 광맥', sub: '은빛 왕국 대광맥', pal: 'gray', music: 'hollow', tier: 7, floor: T.STONE, dark: 0.88, darkCol: 'rgba(4,4,10,1)',
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: RUIN.x + 2, ty: RUIN.y + 2 },
    rooms: {
      '1,3': { props: [['chest', 9, 6, { item: 'lantern', col: '#e8c048' }], ['sign', 13, 10, { text: '광부 보관함.\n「등불을 켜라. 광맥은 빛을 먹는다. 어둠 속에서 오래 서 있지 마라.」' }], ['torch', 3, 3], ['torch', 16, 3], ['pot', 2, 11], ['pot', 17, 11]], foes: [['bat', 5, 4], ['bat', 14, 4]] },
      '1,2': { solve: { type: 'torches', flag: 'd8:torch', msg: '셔터가 열렸다' }, ter: [['crystal', 6, 5, 2, 2], ['crystal', 12, 8, 2, 2]], props: [['torch', 3, 3], ['torch', 16, 3], ['torch', 3, 11], ['torch', 16, 11], ['sign', 9, 7, { text: '「넷이 모두 밝을 때, 문이 열린다. 광맥은 빛을 먹으니 서둘러라.」' }]], foes: [['hollow', 9, 4], ['drone', 5, 10], ['drone', 14, 10]] },
      '0,2': { ter: [['pit', 4, 6, 12, 2]], props: [['post', 3, 3], ['post', 16, 10], ['chest', 2, 11, { item: 'key_small' }], ['torch', 17, 3]], foes: [['golem', 12, 4], ['bat', 6, 10]] },
      '2,2': { props: [['spot', 9, 4, { verb: '기록판을 읽는다', text: async (c) => { c.book('b_silver'); for (const pg of G.data.BOOKS.b_silver.pages) await c.narr(pg); if (!S().truth.t_grey) { c.truth('t_grey'); await c.getItem('silver_rec'); await c.say('toria', '…배가 고프다고 했대. 빛을 다 마신 왕이. 그리고 검은 점이 떴대. 이거 볼트 아저씨한테 보여 주자.', { face: 'shock' }); } } }], ['chest', 16, 3, { item: 'compass' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 11]], foes: [['hollow', 5, 8], ['hollow', 14, 8], ['drone', 9, 10]] },
      '1,1': { solve: { type: 'clear' }, props: [['chest', 9, 8, { item: 'key_big', big: true, hidden: true }], ['ped', 9, 4, { verb: '왕관을 본다', onUse: crownUse }], ['torch', 3, 3], ['torch', 16, 3]], foes: [['hollow', 5, 6], ['hollow', 14, 6], ['golem', 9, 10]] },
      '2,1': { props: [['chest', 9, 5, { item: 'heartpiece' }], ['chest', 15, 10, { item: 'map_d' }], ['torch', 3, 3]], foes: [['bat', 6, 8], ['drone', 13, 8]] },
      '0,1': { props: [['veil', 18, 7, { cells: [[18, 7], [18, 8], [19, 7], [19, 8], [20, 7], [20, 8]] }], ['chest', 5, 5, { item: 'bombs5' }], ['chest', 5, 9, { item: 'arrows10' }], ['spot', 10, 7, { verb: '광부의 낙서를 본다', text: '벽에 광부들의 낙서. 「612. 왕이 마셨다. 우리는 캐기만 했다.」 그 옆에 아이 손바닥 자국 셋. 은빛 가루로 찍었다.' }]], foes: [['hollow', 9, 7]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'hollowking' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd8:torch'], ['1,1', '2,1', 'bomb'], ['1,1', '0,1', 'wall'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      // 어둠 속에서 등불 상자만 희미하게 빛난다
      for (const e of Wd.ents) if (e.item === 'lantern' && !S().tools.lantern) e.glowR = 22;
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: RUIN.x + 2, toy: RUIN.y + 3 });
      if (f('d8:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d8:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 7) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: 'd8:heart' }));
        G.world.add(out());
        c.lock(true);
        await c.cinema(true);
        c.music('dread');
        await c.narr('빈 왕의 갑옷이 무너졌다. 투구가 굴러 발치에 멈췄다. 안은 비어 있었다. 400년 동안 비어 있었다.');
        await c.narr('그런데 — 빈 투구 안에서 목소리가 났다. 네 목소리였다.\n[r]「배고파.」[/]');
        c.stopMusic(0.5); c.sfx('heartbeat');
        await c.narr('가슴 바닥의 검은 점이 대답했다. 처음으로. 광맥에 남은 은빛 부스러기들이 반짝였다. 먹으면 — 아주 조금만 먹으면 — 이 배고픔이 멎을 것 같았다.');
        const k = await c.choice('검은 점이 숨을 쉰다.', [
          { t: '참는다', sub: '배고픔을 그대로 둔다.' },
          { t: '조금만 먹는다', sub: '[r]심연[/]. 몸이 가벼워진다. 무언가를 잃는다.' },
        ]);
        if (k === 1) { c.abyss('ate_vein'); c.flag('ate_light'); c.heal(); c.flash('#ffffff', 0.4); await c.narr('은빛 부스러기가 손바닥으로 빨려 들어왔다. 달았다. 배고픔이 멎었다.\n…토리아가 한 걸음 물러섰다. 처음이었다.'); await c.say('toria', '…너, 방금 눈이 까맸어. 아주 잠깐.', { face: 'shock' }); }
        else { c.bond('toria', 1); await c.narr('주먹을 쥐었다. 배고픔은 멎지 않았다. 대신 토리아가 손등에 코를 댔다. 따뜻했다.'); await c.say('toria', '…배고프면 도토리 줄게. 두 개. 아니 세 개.', { face: 'smile' }); }
        if (S().party.includes('sepia')) await c.say('sepia', '기록. 당신의 온도가 3초 동안 영하였다. …무섭다는 감정의 계산식을 찾았다. 기록하지 않겠다.', { face: 'sad' });
        c.music('gray');
        await c.cinema(false);
        c.lock(false);
        c.journal(k === 1 ? '광맥 바닥의 빈 왕을 쓰러뜨렸다. 빈 투구 안에서 내 목소리가 「배고파」라고 했다. 은빛 부스러기를 조금 먹었다.' : '광맥 바닥의 빈 왕을 쓰러뜨렸다. 빈 투구 안에서 내 목소리가 「배고파」라고 했다. 참았다.');
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d8:intro')) { c.flag('d8:intro'); await c.say('toria', '찍… 왕좌에 갑옷이 앉아 있어. 속이… 비었어.', { face: 'shock' }); await c.cutin({ who: 'toria', title: '빈 왕', small: '612년 은빛 왕국의 마지막 왕', sub: '칼이 튕긴다 — 흰빛으로 드러내라!', col: '#6a8ab0', face: 'shock', sec: 1.8 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss2' });
      }); };
    },
  });
  // 은빛 왕관: 받침대에서 집으면 심연 하나
  ST.onMap('d8', () => {});

  /* ═════════ MK-7 (폐공장) ═════════ */
  const ART = {};
  function mkArt(e) {
    const vent = e.st === 'vent', stomp = e.st === 'stomp' && e.stT > 0.4 && e.stT < 0.7;
    const key = 'mk7' + (vent ? 1 : 0) + (stomp ? 1 : 0) + (Math.floor(e.t * 4) % 2) + (e.phase2 ? 1 : 0);
    if (ART[key]) return ART[key];
    const X = G.gfx, b = X.brush(64, 64), R = G.build.ramp('#8a9098'), Rd = G.build.ramp('#5a5e66');
    const leg = stomp ? 2 : 0;
    // 다리
    b.rect(12, 46 - leg, 10, 16 + leg, Rd[1]); b.rect(42, 46, 10, 16, Rd[1]); b.rect(12, 46 - leg, 3, 16, Rd[3]); b.rect(10, 60, 14, 4, Rd[0]); b.rect(40, 60, 14, 4, Rd[0]);
    // 몸통
    b.rect(8, 18, 48, 30, R[2]); b.rect(8, 18, 48, 4, R[3]); b.rect(8, 44, 48, 4, R[0]); b.rect(8, 18, 6, 30, R[3]); b.rect(50, 18, 6, 30, R[1]);
    for (let x = 16; x < 50; x += 6) b.vline(x, 24, 42, R[1]);
    // 머리 · 눈
    b.rect(22, 6, 20, 14, R[2]); b.rect(22, 6, 20, 3, R[3]);
    b.rect(26, 10, 12, 6, '#1a1224'); b.rect(28 + (Math.floor(e.t * 4) % 2) * 4, 11, 4, 4, e.phase2 ? '#ff4a4a' : '#ffb04a'); b.px(29, 11, '#ffffff');
    // 팔 · 포
    b.rect(0, 22, 9, 20, Rd[2]); b.rect(55, 22, 9, 20, Rd[2]); b.rect(1, 40, 7, 6, '#2a2a32'); b.rect(56, 40, 7, 6, '#2a2a32');
    // 배기구: 과열되면 붉게 열린다
    if (vent) { for (let i = 0; i < 3; i++) { b.rect(16 + i * 12, 30, 8, 10, '#ff6a3a'); b.rect(18 + i * 12, 32, 4, 6, '#ffe07a'); } }
    else for (let i = 0; i < 3; i++) { b.rect(16 + i * 12, 30, 8, 10, '#2a2a32'); b.hline(16 + i * 12, 23 + i * 12, 34, R[0]); b.hline(16 + i * 12, 23 + i * 12, 37, R[0]); }
    b.rect(28, 2, 2, 5, '#6a6a72'); b.px(28, 1, e.phase2 ? '#ff4a4a' : '#6ae07a');
    ART[key] = X.outline(b.put(), '#140c1c');
    return ART[key];
  }
  const BB = G.bosses;
  const C = () => G.combat, W = () => G.world;
  BB.def('mk7', { name: 'MK-7', title: '천년포 시제품 · MK-7', hp: 190, atk: 6, r: 22, h: 60, col: '#ffb04a', exp: 360, gold: 400, speed: 40, weight: 9, noContact: false,
    init(e) { e.heat = 0; },
    guards(e, info) { if (e.st === 'vent' || info.unblockable) return false; if (info.src === 'sword' || info.src === 'shot' || info.src === 'arrow') { G.audio.sfx('clank'); G.fx.sparks(e.x, e.y - 30, 6, '#ffffff', 80); return true; } return false; },
    onHurt(e, dmg, info) { if (info.el === 'ice' && e.st !== 'vent') { e.set('vent'); G.ui.toast('급랭! 배기구가 열렸다!', 'gold'); } },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); if (e.stT > (e.phase2 ? 1 : 1.5)) e.set(['stomp', 'missiles', 'laser', 'charge'][e.pat++ % 4]); }
      if (e.st === 'stomp') {
        if (e.stT < 0.02) { e.telegraph(0.4); BB.warnCircle(p.x, p.y, 34, 0.9, function () { BB.hitCircle(this.x, this.y, 34, e.atk); W().shake(6, 0.4); G.fx.dust(this.x, this.y, 16); G.audio.sfx('impact'); }); e.sx = p.x; e.sy = p.y; }
        if (e.stT > 0.3 && e.stT < 0.9) { e.x = U.lerp(e.x, e.sx, dt * 4); e.y = U.lerp(e.y, e.sy, dt * 4); e.jz = Math.sin((e.stT - 0.3) / 0.6 * Math.PI) * 30; }
        if (e.stT > 0.9) { e.jz = 0; if (e.phase2 && !e.did) { e.did = true; BB.ring(e, 10, 110, { kind: 'rock' }); } }
        if (e.stT > 1.3) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'missiles') {
        if (e.stT < 0.02) { e.telegraph(0.5); G.audio.sfx('charge'); }
        if (e.stT > 0.5 && Math.floor(e.stT * 5) !== e.lm && e.stT < 1.7) { e.lm = Math.floor(e.stT * 5); const tx = p.x + (Math.random() - 0.5) * 60, ty = p.y + (Math.random() - 0.5) * 40; BB.warnCircle(tx, ty, 14, 0.8, function () { BB.hitCircle(this.x, this.y, 16, e.atk - 1); G.fx.sparks(this.x, this.y, 10, '#ffb04a', 80); G.audio.sfx('explode'); }); }
        if (e.stT > 2) e.set('idle');
      }
      if (e.st === 'laser') {
        if (e.stT < 0.02) { e.telegraph(0.7); G.audio.sfx('charge'); const rr = { x0: e.home.x - 170, x1: e.home.x + 170 }; e.ly = p.y; BB.warnRect(rr.x0, p.y - 10, rr.x1 - rr.x0, 18, 1, function () { BB.hitRect(rr.x0, this.y - 4, rr.x1 - rr.x0, 18, e.atk + 1); G.audio.sfx('beam'); W().shake(4, 0.3); for (let x = rr.x0; x < rr.x1; x += 12) G.fx.part({ x, y: this.y + 6, z: 6, vz: 10, g: 0, life: 0.4, col: '#ff6a3a', size: 2, glow: true }); }, '#ff6a3a'); }
        if (e.stT > 1.6) { e.heat++; e.set(e.heat % 2 ? 'vent' : 'idle'); if (e.st === 'vent') G.ui.toast('과열! 배기구가 열렸다', 'gold'); }
      }
      if (e.st === 'charge') {
        if (e.stT < 0.02) { e.telegraph(0.5); e.cv = U.norm(p.x - e.x, p.y - e.y); }
        if (e.stT > 0.5 && e.stT < 1.3) { G.ent.move(Wd.map, e, e.cv[0] * 230 * dt, e.cv[1] * 230 * dt); if (Math.random() < dt * 20) G.fx.dust(e.x, e.y, 2); }
        if (e.stT > 1.5) e.set('idle');
      }
      if (e.st === 'vent') { e.vx = e.vy = 0; if (Math.random() < dt * 14) G.fx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 30, z: 10, vz: 30, g: 0, life: 0.6, col: '#ffffff', size: 2 }); if (e.stT > (e.phase2 ? 2.2 : 3)) e.set('idle'); }
    },
    art: mkArt,
  });

  // 폐공장: 들어서면 볼트와 MK-7
  ST.onMap('g_fact', (m, Wd) => {
    if (!f('c8_proof') || f('c8_mk7')) return;
    G.script.run(async (c) => {
      c.lock(true);
      await c.cinema(true);
      c.music('dread');
      const bo = c.spawn({ cid: 'bolt', x: 12 * TS + 8, y: 5 * TS + 12, dir: 'down' });
      await c.say(bo, '왔군. 이게 MK-7이다. 천년포의 시제품. 대륙에서 제일 큰 기계지.', { face: 'normal' });
      await c.say(bo, '내가 16년 동안 옳았다면, 이 녀석이 널 이긴다. 네가 옳다면… 증명해 봐라.', { face: 'angry' });
      let fight = true;
      if (S().party.includes('sepia')) {
        await c.say('sepia', '…따라왔다. 볼트. 나에게 재생 금지 명령이 걸린 기록이 하나 있다. 990년 가을.', { face: 'normal' });
        await c.say(bo, '……세피아. 그건 꺼내지 마라.', { face: 'shock' });
        const k = await c.choice('세피아가 가슴의 재생 단추에 손을 얹는다.', [{ t: '「틀어 줘, 세피아.」', sub: '싸우지 않는다.' }, { t: '「아니. 싸워서 증명할게.」', sub: 'MK-7과 겨룬다.' }]);
        if (k === 0) {
          fight = false;
          await c.say('sepia', '재생 금지 명령을… 해제한다. 나의 판단이다. 볼트가 가르쳐 준 대로. 「옳은 쪽의 숫자를 따르라.」', { face: 'normal' });
          c.stopMusic(0.5);
          await c.narr('세피아의 가슴에서 치직거리는 소리가 났다. 그리고 낮고 쉰, 다정한 여자 목소리가 공장 안에 퍼졌다.');
          await c.narr('[s]「여보. 녹음이 되고 있는 거 맞죠? …이 로봇 참 착해요. 가만히 있네.\n나 오늘 의사 선생님한테 들었어요. 빛바램병이래요. 탑 근처 마을에 많대요.\n당신 탑 때문이라고 하면 당신은 또 계산부터 하겠죠. 계산하지 마요. 그냥 멈춰요.\n멈추는 건 틀린 게 아니에요. 멈추는 것도 계산이에요. 제일 어려운 계산.」[/]');
          c.music('sad');
          await c.narr('볼트가 바닥에 주저앉았다. 강철 장갑을 벗는 데 한참 걸렸다.');
          await c.say(bo, '……9년 동안 한 번도 안 틀었다. 틀면… 내가 틀린 게 되니까.', { face: 'cry' });
          await c.say(bo, '……틀렸군. 9년 동안. 아니, 16년 동안.', { face: 'cry' });
          await c.say(bo, '싸울 필요 없다. 증명은 끝났다. 저 목소리가 나보다 계산을 잘했다. 늘 그랬다.', { face: 'sad' });
          c.bond('sepia', 2); c.bond('bolt', 2); c.flag('c8_recording');
        }
      }
      if (fight) {
        await c.narr('쿠웅— 공장 바닥이 흔들리며 거대한 강철 기계가 일어섰다. 볼트가 조종석에 올라탔다.');
        await c.cutin({ who: 'bolt', title: 'MK-7', small: '천년포 시제품', sub: '장갑이 칼을 튕긴다 — 과열 · 급랭(얼음창)으로 배기구를 열어라!', col: '#8a5a2a', face: 'angry', sec: 2 });
        bo.dead = true;
        const boss = G.bosses.spawn('mk7', 12 * TS + 8, 6 * TS + 12, {});
        boss.home = { x: 12 * TS + 8, y: 8 * TS };
        await c.cinema(false);
        c.lock(false);
        boss.start();
        const won = await c.battle(boss, { music: 'boss2' });
        if (!won) return;
        c.lock(true);
        await c.cinema(true);
        const bo2 = c.spawn({ cid: 'bolt', x: boss.x, y: boss.y + 10, dir: 'down' });
        await c.narr('MK-7이 무릎을 꿇었다. 연기 속에서 볼트가 조종석에서 내려왔다.');
        await c.say(bo2, '……증명 끝. 네가 옳다. 내가 틀렸다. 16년 동안.', { face: 'sad' });
        c.flag('c8_mk7_fight');
      }
      await c.say('toria', '…아저씨. 공방으로 가요. 틀렸으면 고쳐야죠.', { face: 'sad' });
      await c.say(null, '「틀렸으면 고쳐야지. 기술자는 그렇게 산다.」 볼트가 중얼거렸다.', { style: 'narr' });
      c.flag('c8_mk7');
      c.music('gray');
      await c.cinema(false);
      c.lock(false);
      c.journal(f('c8_recording') ? '폐공장에서 세피아가 990년 가을의 녹음을 틀었다. 볼트의 아내 목소리. 「멈추는 것도 계산이에요.」 볼트가 울었다.' : '폐공장에서 MK-7을 쓰러뜨렸다. 볼트: 「증명 끝. 내가 틀렸다. 16년 동안.」');
    });
  });
  async function boltLast(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '쓸데없는 말은 연료 낭비다. …그러니 쓸모 있는 걸 만들겠다.', { face: 'normal' });
    await c.say(n, '[y]역류 장치[/]. 탑의 흐름을 거꾸로 돌린다. 모인 빛을 다시 대륙으로 흩는다. 설계도는 어젯밤에 그렸다. 부품은 천년성 중앙 제어실에 있다. 거기 끼우면 모든 탑이 거꾸로 돈다.', { face: 'normal' });
    await c.getItem('reverser');
    await c.say(n, '아내가 죽던 해, 나는 그게 빛바램병 때문이라는 걸 알았다. 그 병이 탑 때문이라는 것도… 어렴풋이. 모른 척했다. 알면 탑을 멈춰야 하니까. 멈추면 내가 틀린 거니까.', { face: 'sad' });
    if (S().party.includes('sepia')) {
      await c.say('sepia', '하나 더. 볼트가 내 몸에 넣어 둔 것. 작은 열쇠. 공방 서랍의 열쇠다. 명령문: 「볼트가 울 수 있게 되면 건네라.」', { face: 'normal' });
      await c.say('sepia', f('c8_recording') ? '볼트는 울었다. 조건 충족.' : '…볼트는 아직 울지 않았다. 하지만 나는 판단했다. 조건 충족.', { face: 'smile' });
      await c.getItem('drawer_key');
    }
    await c.say(n, '하늘로 가려면 알록달록 곶의 [y]피로스[/] 녀석을 찾아라. 로켓을 만든다더군. 반쯤 미쳤지만 계산은 반쯤 맞다.', { face: 'normal' });
    await c.say(n, '…그런데 곶으로 가는 가장 빠른 길은 동쪽 끝, [p]영원한 밤[/]을 지난다. 사천왕 녹턴의 땅. 카이론의 그림자. 그 녀석은 계산이 필요 없다. 명령만 있으면 된다.', { face: 'closed' });
    if (S().party.includes('sepia')) { await c.say('sepia', '나는 여기 남는다. 볼트의 계산을 돕는다. 이제 볼트는 틀릴 줄 안다. 틀릴 줄 아는 계산은 오래 걸린다.', { face: 'smile' }); ST.leave('sepia'); }
    c.flag('c8_done'); c.flag('open:black');
    await c.cinema(false);
    c.lock(false);
    c.journal('볼트에게 역류 장치 설계도를 받았다. 부품은 천년성에. 하늘로 가려면 알록달록 곶의 피로스를. 먼저 동쪽 끝, 영원한 밤을 지나야 한다.');
  }

  /* ───────── 주민 · 가게 · 부탁 ───────── */
  ST.folk('g_shop', { name: '고철 시장 주인', folk: 'mech', x: 5, y: 3, lines: { c8: async (c) => { const k = await c.choice('쇳덩이면 뭐든 판다. 톱니 빼고. 톱니는 러스크한테.', ['물건을 산다', '괜찮아'], { name: '고철 시장 주인' }); if (k === 0) await c.shop('gray'); } } });
  ST.folk('g_inn', { name: '모루 여관 주인', folk: 'smith', x: 4, y: 3, lines: { c8: async (c) => { const k = await c.choice('회색 빵, 회색 수프, 회색 침대. 색은 없어도 따뜻하다. (40골드)', ['쉰다', '괜찮아요'], { name: '모루 여관 주인' }); if (k === 0) { if (S().gold >= 40) c.gold(-40); await c.rest(); } } } });
  ST.person('world', { name: '고철상 러스크', folk: 'mech', x: X0 + 24, y: Y0 + 14, dir: 'down', mark: () => (!f('rusk_done') ? '?' : null), talk: async (c, n) => {
    const got = S().gears || 0;
    if (f('rusk_done')) { await c.say(n, '고철 의자 여덟 개. 이제 여관에 손님이 앉을 데가 있어. 색은 없지만 튼튼해.', { face: 'happy' }); return; }
    if (got >= 8) { S().gears -= 8; await c.say(n, '녹슨 톱니 여덟 개! 이거면 의자 하나 뚝딱이지. 고마워! 값이야. 고철 시장에선 고철로 셈하는데, 너한텐 이걸로.', { face: 'happy' }); c.flag('rusk_done'); await c.getItem('heartpiece'); c.gold(300); return; }
    await c.say(n, '고철 팝니다, 고철 삽니다. 러스크야.||부탁 하나 하자. 드론이 떨어뜨리는 [y]녹슨 톱니[/] 여덟 개만 구해 줘. 의자가 하나 모자라거든. (' + got + '/8)', { face: 'normal' });
    c.flag('rusk_q');
  } });
  ST.killHooks.push((e, s) => { if (e.type === 'drone' && s.flags.rusk_q && !s.flags.rusk_done) { s.gears = (s.gears || 0) + 1; G.ui.toast('녹슨 톱니 ' + Math.min(8, s.gears) + '/8', 'good'); } });
  ST.folk('world', { name: '공장 일꾼', folk: 'miner', x: X0 + 10, y: Y0 + 9, wander: 20, lines: { c8: ['색? 그런 거 없어도 쇠는 잘 녹아. …우리 딸은 빨간 게 뭐냐고 물어. 대답을 못 해.', '볼트 영감이 요즘 이상해. 공방 불이 밤새 켜져 있어. 망치 소리는 안 나고.'], c9: '볼트 영감이 탑 도면을 불태웠어! 난로에. 그날 밤 공방에서 노랫소리가 났대. 볼트가? 설마.' } });
  ST.folk('world', { name: '회색 아이', folk: 'kid', x: X0 + 16, y: Y0 + 16, wander: 20, lines: { c8: [(girl() ? '누나' : '형') + ' 옷은 왜 그 색이야? 그게 초록이야? 만져 봐도 돼? …따뜻하지는 않네.', '은빛 왕국 폐허엔 가지 마. 밤에 왕이 운대. 배고프다고.'], c9: '하늘이 조금 파래졌어! 진짜야! 아침에 한 칸만큼!' } });
  ST.folk('world', { name: '늙은 광부', folk: 'miner', x: RUIN.x + 9, y: RUIN.y + 3, lines: { c8: ['우리 할아버지의 할아버지의… 아무튼 그 할아버지가 612년에 광맥을 캤대. 왕이 마시는 걸 봤대.', '「그릇이 되려는 자는 먼저 굶는 법을 배워야 한다.」 광부들 말이야. 무슨 뜻인지는 나도 몰라.'] } });

  /* ───────── 빛 씨앗 (그레이) ───────── */
  ST.seed('gr1', 'world', X0 - 4, Y0 + 6, { under: true });
  ST.seed('gr2', 'world', FACT.x + 11, FACT.y + 2, {});
  ST.seed('gr3', 'world', RUIN.x + 10, RUIN.y - 3, { under: true });
  ST.seed('gr4', 'world', X0 + 31, Y0 + 22, {});
})();
