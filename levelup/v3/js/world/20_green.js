/* 그린 마을 — 새싹의 골짜기. 할머니 오두막 · 잡화점 · 이장 집 · 노아네 · 쉼터 · 징수탑 · 훈련 마당 · 밭 · 연못
   주민들은 장(章)이 바뀔 때마다 다른 말을 한다. 떠난 뒤 돌아와도 마을은 살아 있다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const ch = () => S().ch || 'c1';
  const after = (id) => { const order = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12']; return order.indexOf(ch()) >= order.indexOf(id); };
  const GT = OW.towns.green;
  const X0 = GT.x, Y0 = GT.y;           // 82, 170
  ST.GREEN = { X0, Y0, cave: OW.pt(94, 155) };   // 넓어진 대륙에서도 마을 북쪽 숲 (예전 좌표 그대로면 그레이 땅에 떨어져 1장에서 들어갈 수 없었다)

  /* ───────── 넓은 지도에 짓기 ───────── */
  OW.hooks.push((m) => {
    const hh = 0;
    // 할머니 오두막 · 참나무
    ST.house(m, { id: 'g_home', region: 'green', style: 'green', tx: X0 + 2, ty: Y0 + 2, w: 5, h: 4, name: '할머니 오두막', sub: '그린 마을',
      room: { w: 13, h: 10, floor: T.WOOD, music: 'home', rug: [4, 5, 5, 3], furn: [
['stove', 10, 2, { text: '할머니의 아궁이. 약초 달이는 냄새가 벽에 배어 있다.' }], ['table', 6, 6, { text: '생일 아침상. 옥수수빵 세 개와 산딸기.' }], ['chair', 5, 7], ['chair', 8, 7],
        ['shelf', 11, 5, { text: '약초 병이 빼곡하다. 이름표 글씨가 군인처럼 반듯하다.' }], ['plant', 1, 7], ['clock', 8, 2, { wall: true }], ['window', 4, 1, { wall: true }], ['painting', 6, 1, { wall: true, v: '#8ac8e8', text: '서툰 그림. 하늘을 나는 다람쥐. 네가 다섯 살 때 그렸다.' }],
      ] } });
    m.obj[m.i(X0 + 9, Y0 + 3)] = O.BIGTREE; m.obj[m.i(X0 + 8, Y0 + 2)] = 0;
    // 잡화점 · 이장 집 · 노아네 · 쉼터
    ST.house(m, { id: 'g_shop', region: 'green', style: 'green', tx: X0 + 20, ty: Y0 + 2, w: 5, h: 4, name: '초록 바구니 잡화점', sign: 'shop',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'calm', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['barrel', 2, 6], ['crate', 9, 6], ['crate', 10, 6], ['plant', 1, 7]] } });
    ST.house(m, { id: 'g_chief', region: 'green', style: 'green', tx: X0 + 26, ty: Y0 + 7, w: 5, h: 4, name: '이장 댁',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'calm', rug: [3, 4, 6, 3], furn: [['desk', 6, 3, { text: '징수 장부. 칸마다 한숨처럼 작은 점이 찍혀 있다. 올해 그린 마을 몫은 작년의 두 배다.' }], ['shelf', 1, 2], ['bed2', 10, 3], ['fireplace', 3, 2, { wall: false }], ['chair', 6, 5]] } });
    ST.house(m, { id: 'g_noah', region: 'green', style: 'green', tx: X0 + 3, ty: Y0 + 15, w: 5, h: 4, name: '노아네 집',
      room: { w: 11, h: 9, floor: T.WOOD, music: 'sad', furn: [['bed2', 2, 3, { v: '#8ab8d8' }], ['table', 6, 5], ['chair', 5, 6], ['window', 2, 1, { wall: true }], ['plant', 9, 7], ['shelf', 9, 2, { text: '색연필 상자. 흰색만 닳지 않았다.' }]] } });
    ST.house(m, { id: 'g_inn', region: 'green', style: 'green', tx: X0 + 20, ty: Y0 + 15, w: 7, h: 4, name: '쉼터 「새싹 둥지」', sign: 'inn',
      room: { w: 15, h: 10, floor: T.WOOD, music: 'calm', rug: [5, 5, 5, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 9, 5, { v: 'cloth' }], ['chair', 8, 6], ['chair', 11, 6], ['fireplace', 12, 2], ['barrel', 1, 7], ['bed2', 1, 2, { text: '손님용 침대. 쉬어 가려면 주인에게.' }]] } });
    // 징수탑
    OW.clear(m, X0 + 28, Y0 + 15, 5, 5, hh, null);
    G.build.placeBuilding(m, { special: 'tower', tx: X0 + 29, ty: Y0 + 16, w: 3, h: 2, id: 'g_tower', to: null });
    // 우물 · 이정표 · 광장 꽃밭
    const P = OW.towns.green.plaza;
    G.build.placeBuilding(m, { special: 'well', tx: P.x - 4, ty: P.y - 3, w: 2, h: 1, door: false });
    // 훈련 마당 (오두막 앞)
    for (let x = X0 + 1; x < X0 + 9; x++) { m.obj[m.i(x, Y0 + 7)] = x === X0 + 4 ? 0 : O.FENCEH; }
    // 밭과 울타리 (마을 동남쪽)
    for (let y = Y0 + 10; y < Y0 + 14; y++) for (let x = X0 + 27; x < X0 + 33; x++) { const i = m.i(x, y); if (m.ter[i] !== T.ROAD) { m.ter[i] = T.FARM; m.obj[i] = (x + y) % 2 ? O.TALL : 0; } }
    for (let x = X0 + 26; x < X0 + 34; x++) { m.obj[m.i(x, Y0 + 9)] = O.FENCEH; m.obj[m.i(x, Y0 + 14)] = O.FENCEH; }
    // 마을 꾸미기: 꽃 · 가로등 · 덤불
    for (const [dx, dy] of [[12, 5], [13, 5], [17, 5], [18, 5], [12, 17], [18, 17], [14, 21], [2, 11], [30, 4]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.FLOWER;
    for (const [dx, dy] of [[14, 9], [19, 15], [8, 12]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 50, warm: 'rgba(255,210,120,0.18)' }); }
    for (const [dx, dy] of [[0, 9], [1, 13], [33, 20], [32, 1], [0, 22]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.TREE;
    // 뿌리굴: 마을 북쪽 숲 속 언덕의 동굴
    const cx = ST.GREEN.cave.x, cy = ST.GREEN.cave.y - 1;
    for (let y = cy - 8; y <= cy; y++) for (let x = cx - 9; x <= cx + 9; x++) { const d = Math.hypot((x - cx) / 9, (y - cy + 4) / 5.5); if (d < 1 && m.inb(x, y)) { m.hgt[m.i(x, y)] = 1; m.obj[m.i(x, y)] = d < 0.7 ? O.TREE : 0; } }
    for (let y = cy - 8; y <= cy + 2; y++) for (let x = cx - 10; x <= cx + 10; x++) if (m.inb(x, y) && m.ter[m.i(x, y)] !== T.WATER && m.ter[m.i(x, y)] !== T.DEEP) { if (m.hgt[m.i(x, y)] === 0 && y > cy - 1) m.obj[m.i(x, y)] = 0; }
    G.gen.caveMouth(m, cx, cy + 1, 2);
    G.build.placeBuilding(m, { special: 'cave', tx: cx, ty: cy + 1, w: 2, h: 1, to: 'd1', toX: null, toY: null, id: 'd1_gate', col: '#6e5640', cond: () => f('c1_quest_dew'), msg: '동굴 안에서 차가운 바람이 분다. 지금은 들어갈 이유가 없다.' });
    // 뿌리굴 앞 길
    for (let y = cy + 2; y < Y0; y++) { for (const x of [cx, cx + 1]) { const i = m.i(x, y); if (m.ter[i] === T.WATER || m.ter[i] === T.DEEP) m.ter[i] = T.BRIDGE; else if (m.ter[i] !== T.CLIFF && m.ter[i] !== T.STAIRS && m.ter[i] !== T.ROAD) m.ter[i] = T.DIRT; m.obj[i] = 0; } }
    // 표지판
    m.obj[m.i(cx + 3, cy + 4)] = 0;
  });

  /* ───────── 소품 (들어설 때마다) ───────── */
  ST.onMap('world', (m, Wd, s) => {
    const P = G.props;
    const add = (e) => Wd.add(e);
    add(new P.Waystone({ x: (OW.towns.green.plaza.x + 3) * TS + 8, y: (OW.towns.green.plaza.y - 3) * TS + 12, wid: 'w_green', name: '그린 마을' }));
    add(new P.Sign({ x: (X0 + 17) * TS + 8, y: (Y0 - 1) * TS + 12, text: '↑ 속삭이는 숲 · 뿌리굴\n← 레드 마을 (다리 공사 중)\n→ 블루 항구 · 퍼플 숲' }));
    add(new P.Sign({ x: (ST.GREEN.cave.x + 3) * TS + 8, y: (ST.GREEN.cave.y + 3) * TS + 12, text: '뿌리굴\n「나무 정령님 주무시는 곳. 떠들지 말 것.」 — 그린 마을 아이들' }));
    add(new P.Spot({ x: (X0 + 9) * TS + 8, y: (Y0 + 4) * TS + 10, reach: 16, verb: '나무껍질을 본다', sparkle: true, flagKey: 'oak', text: async (c) => {
      c.flag('oak:seen');
      await c.narr('오래된 참나무. 어른 키만 한 높이에 칼로 새긴 글자가 있다.\n\n[w]S · K[/]\n\n그 밑에, 더 오래된 듯한 작은 빗금 두 개.');
      if (c.has('truth_sk')) return;
      await c.say('toria', '찍… 할머니가 이 나무 근처에선 늘 걸음이 느려져. 왜인지는 안 알려 줘.', { face: 'sad' });
    } }));
    // 훈련 허수아비 셋
    if (!f('c1_trained') || after('c2')) for (const [dx, dy] of [[2, 9], [5, 10], [8, 9]]) { const d = G.foes.spawn('dummy', (X0 + dx) * TS + 8, (Y0 + dy) * TS + 12); d.name = '허수아비'; d.home = { x: d.x, y: d.y }; }
    // 항아리 · 풀
    for (const [dx, dy] of [[6, 6], [7, 6], [25, 6], [11, 19]]) add(new P.Pot({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 12 }));
    // 징수탑 표지
    add(new P.Sign({ x: (X0 + 28) * TS + 8, y: (Y0 + 19) * TS + 12, text: after('c2') && f('c1_tower_broken') ? '「천년 방위령 제3조: 징수탑을 해하는 자는 빛을 몰수한다.」\n누군가 그 밑에 숯으로 적었다. 「새벽은 온다」' : '「천년 방위령 제3조: 징수탑을 해하는 자는 빛을 몰수한다.」\n그린 마을 올해 목표: 경험 4,200,000' }));
  });

  /* ───────── 사람들 ───────── */
  const W = 'world';
  const tx = (dx) => X0 + dx, ty = (dy) => Y0 + dy;

  // 마리엔 아줌마 (잡화점 안)
  ST.person('g_shop', { id: 'marien', x: 6, y: 3, dir: 'down', mark: () => (!f('c1_marien') ? '!' : null), talk: async (c, n) => {
    c.flag('met:marien');
    if (!f('c1_marien')) {
      c.flag('c1_marien');
      await c.say(n, '어머, {n}! 생일 축하해! 열여섯이면 이제 어엿한 어른이지. 여기, 아줌마가 주는 선물.', { face: 'happy' });
      await c.getItem('potion_r', 2);
      await c.say(n, '요즘 징수탑이 이상해. 밤마다 윙윙거리는 소리가 커져. 이장님 얼굴이 흙빛이더라.', { face: 'sad' });
    }
    if (after('c2') && !f('g_marien_c2')) { c.flag('g_marien_c2'); await c.say(n, after('c2') && f('c1_route') === 'dawn' ? '네가 탑을 벤 다음 날부터 기사들이 두 배로 왔어. 그래도… 마을 사람들 속이 좀 시원했단다. 쉿.' : f('c1_route') === 'order' ? '카시안이라는 기사님이 장부를 다시 셌대. 우리 몫이 조금 줄었어! 네 덕이라던데?' : '요즘 밤이면 등불이 저절로 흔들려. 누가 지켜 주는 것 같기도 하고… 무섭기도 하고.'); }
    const k = await c.choice(null, ['물건을 산다', '소문을 듣는다', '그만둔다']);
    if (k === 0) await c.shop('green');
    else if (k === 1) await c.say(n, U.pick(gossip()));
  } });
  function gossip() {
    const g = ['블루 항구엔 문어가 도서관장이래. 진짜야. 안경도 써.', '레드 마을 가는 다리가 봄 홍수에 쓸려 갔어. 이장님이 고친다고 했는데…', '뿌리굴 나무 정령님이 요즘 기침을 하신대. 숲이 쉰 소리를 내.', '떠돌이 음유시인이 쉼터에 묵고 있어. 노래가 이상하게 슬퍼.'];
    if (after('c2')) g.push('레드 광산에서 사람들이 쓰러졌다는 소문이야. 금이 아니라 빛을 캔다나 봐.');
    if (after('c4')) g.push('옐로의 금화왕이 경험 이자를 올렸대. 공짜는 없다나.');
    if (after('c6')) g.push('천년제에서 흰빛이 터졌대! 그게… 너라는 소문이 있던데?');
    return g;
  }

  // 베르덱스 이장
  ST.person('g_chief', { id: 'verdex', x: 6, y: 5, dir: 'down', mark: () => (f('c1_trained') && !f('c1_tower') && !f('met:verdex') ? '!' : null), talk: async (c, n) => {
    c.flag('met:verdex');
    if (!after('c2')) {
      await c.say(n, '오, {n}. 생일이라며. 축하한다. …허, 경사스러운 날에 이런 얼굴이라 미안하구나.', { face: 'sad' });
      await c.say(n, '올해 그린 마을 징수 목표가 작년의 두 배다. 아이들이 일 년 내내 김을 매도 못 채운다.');
      await c.say(n, '모자라면 탑이 알아서 가져간다더구나. 사람 몸에서. 노아가… 그래서 저렇게 된 거다.', { face: 'angry' });
    } else if (!after('c6')) {
      await c.say(n, f('c1_route') === 'dawn' ? '네가 탑을 베고 떠난 뒤로 기사들이 마을을 뒤졌다. 그래도 아무도 네 이름을 말하지 않았다. 그게 그린 마을이다.' : f('c1_route') === 'order' ? '카시안 기사가 장부를 다시 매겼다. 조금 숨통이 트였어. 기사단에도 사람이 있구나.' : '그 음유시인이 떠나고 나서 밤마다 탑 불빛이 약해진다. 탑이 배탈이라도 난 건지. 허허.');
    } else {
      await c.say(n, '네 소식은 바람 타고 여기까지 온다. 흰빛이라니. 할머니가 왜 그렇게 너를 꽁꽁 싸매 키웠는지 이제 알겠다.');
    }
  } });

  // 노아 · 노아 엄마
  ST.person('g_noah', { id: 'noah', x: 2, y: 4, dir: 'right', state: 'sit', when: () => !f('c1_noah_gone'), mark: () => ((f('c1_quest_dew') && !f('c1_dew_given') && S().inv.dew) || (f('c1_trained') && !f('c1_tower') && !f('met:noah')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:noah');
    if (!f('c1_quest_dew')) {
      await c.say(n, '…{n} 형아' + (S().gender === 'girl' ? '… 아니, 누나' : '') + '? 생일이지. 나도 알아. 엄마가 말해 줬어.', { face: 'smile' });
      await c.say(n, '나 오늘은 색이 좀 남았어? …머리카락. 어제보다 하얘?', { face: 'sad' });
      await c.narr('노아의 머리칼은 끝에서부터 눈처럼 바래 있다. 빛바램병. 빛이 모자란 사람은 색부터 잃는다.');
    } else if (!f('c1_dew_given')) {
      if (S().inv.dew) { await ST.giveDew(c, n); return; }
      await c.say(n, '뿌리굴에 이슬이 있대. 나무 정령님 눈물이래. …가다가 다치면 안 돼.', { face: 'sad' });
    } else if (!after('c4')) {
      await c.say(n, f('hero_shared') ? '요즘은 손끝이 따뜻해. 형아' + (S().gender === 'girl' ? '… 누나' : '') + '가 준 빛이 아직 여기 있는 것 같아.' : '이슬 덕분에 아침에 일어날 수 있어. 고마워. …근데 머리는 아직 하얘.', { face: 'smile' });
      await c.say(n, '나 크면 기사 될 거야. 탑 지키는 기사 말고, 사람 지키는 기사.');
    } else {
      await c.say(n, '엄마가 블루 병원에 가 보자고 했어. 거기 가면 더 좋아진대. 형아' + (S().gender === 'girl' ? '… 누나' : '') + '도 블루 가면 나 보러 와.', { face: 'smile' });
    }
  } });
  ST.person('g_noah', { name: '노아 엄마', folk: 'farmerw', x: 7, y: 5, dir: 'left', when: () => !f('c1_noah_gone'), talk: async (c, n) => {
    await c.say(n, f('c1_dew_given') ? '이슬이… 정말 효과가 있어요. 밤새 기침을 안 했어요. 고마워요, 정말로.' : '의원님은 빛을 먹이는 수밖에 없대요. 빛을요. 우리가 어디서 빛을 구하겠어요. 다 탑이 가져가는데.', { face: f('c1_dew_given') ? 'smile' : 'sad' });
  } });

  // 쉼터 주인 · 리라(1장 밤) · 손님
  ST.person('g_inn', { name: '쉼터 주인 폼', folk: 'oldw', x: 4, y: 3, dir: 'down', talk: async (c, n) => {
    const k = await c.choice('어서 와요. 쉬어 가요? (20골드, 체력 회복 · 기록)', ['쉰다 (20골드)', '이야기한다', '괜찮아요']);
    if (k === 0) { if (S().gold < 20) { await c.say(n, '어머, 골드가 모자라네. …에이, 생일이니까 오늘은 그냥 쉬어.'); } else c.gold(-20); await c.rest(); }
    else if (k === 1) await c.say(n, U.pick(['음유시인 아가씨가 방을 잡았어요. 노래 값 대신 방값을 두 배로 내더라니까요.', '옛날에 흰 옷 입은 아가씨가 묵고 간 적이 있어요. 십팔 년쯤 전인가. 에벨린 할머니랑 같이 왔었지.', '레드 가는 다리가 끊겨서 장사꾼이 뚝 끊겼어요.']));
  } });
  ST.person('g_inn', { id: 'lyra', x: 10, y: 4, dir: 'left', when: () => !after('c2'), mark: () => (!f('met:lyra') ? '?' : null), barks: ['♪ 하늘 끝 황금별, 그 옆의 검은 점…', '♪ 빛을 세는 사람은 빛을 못 본대요…'], talk: async (c, n) => {
    c.flag('met:lyra');
    if (!f('c1_lyra')) {
      c.flag('c1_lyra');
      await c.say(n, '어머, 관객이네. 한 곡 들어 볼래요? 오늘은 공짜. 생일인 사람한테는.', { face: 'smile' });
      await c.narr('[p]♪ 하늘 끝 황금별 옆에 / 까만 점 하나 떴지요\n♪ 빛을 세는 임금님은 / 셈하느라 못 보셨대요\n♪ 초록 창은 부러졌나 / 침대 밑에 잠들었나[/]');
      await c.say(n, '…왜 그렇게 봐요? 그냥 옛날 노래예요. 대륙 어디서나 불러요.', { face: 'smirk' });
      await c.say(n, '나는 리라. 떠돌이예요. 어디든 가고, 아무 데도 안 머물러요. 또 봐요, 흰… 아니, 생일 주인공.', { face: 'smile' });
      await c.say('toria', '찍? 방금 뭐라고 하려다 말았어.', { face: 'shock' });
    } else await c.say(n, U.pick(['노래는 말보다 오래 살아요. 말은 잡혀가도 노래는 안 잡혀가거든요.', '이 마을 등불은 따뜻해요. 블랙 마을 등불은… 음, 언젠가 보게 될 거예요.']), { face: 'smile' });
  } });

  // 마을 사람들 (넓은 지도)
  ST.person(W, { id: 'berna', x: tx(12), y: ty(10), wander: 24, barks: ['천 번 휘두르면 전설이 된대!', '카렐 바보!'], when: () => !after('c6') || true, talk: async (c, n) => {
    c.flag('met:berna');
    if (!f('g_berna_duel')) {
      await c.say(n, '{n}! 그거 진짜 검이야? 우와… 나랑 대련해! 허수아비 셋을 나보다 빨리 쓰러뜨리면 인정해 줄게!', { face: 'happy' });
      const k = await c.choice(null, ['좋아, 해 보자', '다음에']);
      if (k === 0) await ST.bernaDuel(c, n);
    } else await c.say(n, after('c6') ? '나도 언젠가 너처럼 흰빛으로 렙업할 거야! …안 되면 초록빛도 괜찮고.' : '두고 봐. 다음엔 내가 이겨!', { face: 'smile' });
  } });
  ST.person(W, { id: 'karel', x: tx(15), y: ty(11), wander: 20, barks: ['베르나보다 딱 한 번 더 휘두르는 게 내 규칙이야.'], talk: async (c, n) => { c.flag('met:karel'); await c.say(n, U.pick(['베르나가 너한테 대련하재? 걔 목검 진짜 아파.', '내 꿈은 기사단에 들어가는 거야. 아니… 요즘은 잘 모르겠어. 노아 보면.'])); } });
  ST.person(W, { name: '감자 농부 브람', folk: 'farmer', x: tx(34), y: ty(7), dir: 'down', mark: () => (!f('q_bram') ? '!' : S().quests.bram && S().quests.bram.st === 'on' && (S().bramKills || 0) >= 5 ? '!' : null), talk: async (c, n) => {
    const q = S().quests.bram;
    if (!q) {
      await c.say(n, '저 젤리 놈들이 밭을 다 뭉개. 감자가 빛을 먹고 자라야 하는데, 젤리가 먼저 먹어 치워.', { face: 'angry' });
      const k = await c.choice('밭 주변 젤리를 다섯 마리 잡아 줄래?', ['맡겨 주세요', '나중에']);
      if (k === 0) { c.flag('q_bram'); c.quest('bram', 'on'); S().bramKills = 0; await c.say(n, '고맙다! 동쪽 들판에 우글거려.'); }
    } else if (q.st === 'on') {
      if ((S().bramKills || 0) >= 5) { c.quest('bram', 'done'); await c.say(n, '해냈구나! 이거 받아라. 옛날에 밭 갈다 주운 건데 반짝거리더라.', { face: 'happy' }); await c.getItem('heartpiece', 1); c.gold(40); }
      else await c.say(n, '아직 ' + (5 - (S().bramKills || 0)) + '마리 남았다.');
    } else await c.say(n, '올해 감자는 알이 굵다. 네 덕이야.', { face: 'smile' });
  } });
  ST.killHooks.push((e, s) => { if (s.quests.bram && s.quests.bram.st === 'on' && (e.type === 'slime' || e.type === 'bigslime') && G.ow.regionOf(Math.floor(e.x / TS), Math.floor(e.y / TS)) === 'green') { s.bramKills = (s.bramKills || 0) + 1; if (s.bramKills <= 5) G.ui.toast('젤리 ' + s.bramKills + ' / 5', ''); } });
  ST.person(W, { id: 'elm', ...OW.pt(104, 194), dir: 'down', state: 'sit', talk: async (c, n) => {
    c.flag('met:elm');
    if (!S().tools.rod) {
      await c.say(n, '쉿. 물고기가 듣는다. …오, 에벨린네 손주구나. 생일이라고? 허허. 그럼 이거 가져가라. 내 옛날 낚싯대다.');
      await c.getItem('rod', 1);
      await c.say(n, '물가에서 도구 버튼을 누르면 찌를 던진다. 찌가 쑥 들어가면 공격 버튼. 세 마리 잡아 오면 좋은 걸 주지.');
      c.quest('elm', 'on');
    } else if (S().quests.elm && S().quests.elm.st === 'on') {
      if ((S().fish || 0) >= 3) { c.quest('elm', 'done'); await c.say(n, '오호, 제법이다. 에벨린도 젊을 땐 창으로 물고기를 찔러 잡았지. 창으로. 허허, 믿기지 않지?'); await c.getItem('heartpiece', 1); }
      else await c.say(n, '아직 ' + (S().fish || 0) + '마리. 물고기는 급한 사람을 싫어한다.');
    } else await c.say(n, U.pick(['십팔 년 전 봄에 이 연못에서 혼례 잔치 생선을 잡았지. 누구 혼례냐고? …허허, 늙으면 이름을 잊는다.', '물고기는 빛을 따라 올라온다. 요즘은 잘 안 올라와.']));
  } });
  ST.person(W, { name: '마을 아이', folk: 'kidg', x: tx(18), y: ty(6), wander: 30, barks: ['토리아 안녕!', '찍찍! 따라 해 봐!'], talk: async (c, n) => { await c.say(n, U.pick(['토리아는 왜 못 날아? 날개 있잖아.', '할머니가 그러는데 탑 근처에서 놀면 빛을 뺏긴대.'])); } });
  ST.person(W, { id: 'gordi', x: tx(27), y: ty(19), dir: 'left', when: () => !after('c2') || !f('c1_tower_broken'), talk: async (c, n) => {
    c.flag('met:gordi');
    await c.say(n, U.pick(['규칙은 규칙이다. …그렇지만 노아 얘기는 나도 들었다. 미안하다.', '탑 근처에서 뛰지 마라. 탑은 뛰는 사람의 빛을 더 좋아한다.', '나도 그린 마을 출신이다. 징수 기사가 된 건, 딴 사람이 오는 것보다 내가 오는 게 나을 것 같아서였지.']), { face: 'sad' });
  } });

  /* ───────── 낚시 ───────── */
  ST.fish = function (p) {
    const m = G.world.map;
    const [ux, uy] = U.DV[p.dir];
    const tx0 = Math.floor((p.x + ux * 20) / TS), ty0 = Math.floor((p.y - 4 + uy * 20) / TS);
    const t = m.T(tx0, ty0);
    if (t !== T.WATER && t !== T.DEEP) { G.ui.toast('물가에서 물 쪽을 보고 던지자', ''); return; }
    G.script.run(async (c) => {
      c.sfx('throw'); p.forceAnim = 'cast';
      const bx = tx0 * TS + 8, by = ty0 * TS + 8;
      const wait = 1.2 + Math.random() * 3;
      let t2 = 0, bite = false, got = false;
      const bob = new G.ent.Ent({ kind: 'bob', solid: false, x: bx, y: by, draw(g, cx, cy) { const yy = by - cy + (bite ? 2 : Math.sin(this.t * 3)); g.fillStyle = '#ffffff'; g.fillRect(bx - cx - 1, yy - 3, 3, 3); g.fillStyle = '#ff4a4a'; g.fillRect(bx - cx - 1, yy - 1, 3, 2); g.strokeStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.moveTo(p.x - cx, p.y - cy - 16); g.lineTo(bx - cx, yy - 3); g.stroke(); }, update(dt) { this.t += dt; } });
      G.world.add(bob);
      await c.frames((dt) => { t2 += dt; if (!bite && t2 > wait) { bite = true; c.sfx('splash'); G.fx.splash(bx, by); t2 = 0; } if (bite && G.input.pressed('attack')) { got = t2 < 0.6; return true; } if (bite && t2 > 0.9) return true; if (!bite && G.input.pressed('attack')) return true; return false; });
      bob.dead = true; p.forceAnim = null;
      if (got) {
        const s = S(); s.fish = (s.fish || 0) + 1;
        const r = Math.random(), reg = OW.regionOf(tx0, ty0);
        const fish = r < 0.05 ? ['황금 잉어', 'heartpiece'] : r < 0.4 ? ['빛 송사리', 'food_corn'] : ['은빛 붕어', null];
        c.sfx('item'); await c.say(null, '[y]' + fish[0] + '[/]을 낚았다! (' + reg + '의 물고기, 지금까지 ' + s.fish + '마리)', { style: 'sys' });
        if (fish[1] === 'heartpiece' && !f('fish_heart_' + reg)) { c.flag('fish_heart_' + reg); await c.getItem('heartpiece'); }
        else if (fish[1]) c.give(fish[1]);
        c.exp(3);
      } else { c.toast(bite ? '놓쳤다…' : '아직 입질이 없었다', ''); }
    });
  };

  /* ───────── 베르나와 대련 (시간 재기) ───────── */
  ST.bernaDuel = async function (c, n) {
    const Wd = G.world;
    const dummies = Wd.ents.filter((e) => e.type === 'dummy');
    if (dummies.length < 3) { await c.say(n, '허수아비가 없네… 다음에!'); return; }
    await c.say(n, '준비… 시작! 각각 세 번씩 때리면 돼!');
    // 수련 중에 대련해도 수련이 이어지게: 원래 처리를 잠시 비켜 두었다가 되돌린다
    const prevHurt = new Map(dummies.map((d) => [d, d.onHurt])); ST.dummyUntil = performance.now() + 15000;   // 대련이 끊겨도 15초면 풀린다
    const hits = new Map(); dummies.forEach((d) => { hits.set(d, 0); d.onHurt = function () { hits.set(this, hits.get(this) + 1); this.hpShow = 0; if (hits.get(this) === 3) { G.fx.ring(this.x, this.y - 8, '#6ae07a', 14, 0.4); G.audio.sfx('clickspot'); } }; });
    let t = 0;
    const ok = await (async () => { let done = false; await c.freeWhile(() => { t += 1 / 60; done = [...hits.values()].every((v) => v >= 3); return done || t > 12; }); return done; })();
    dummies.forEach((d) => { d.onHurt = prevHurt.get(d) || null; }); ST.dummyUntil = 0;
    c.lock(true);
    if (ok) { c.flag('g_berna_duel'); c.bond('berna', 1); await c.say(n, t.toFixed(1) + '초?! 말도 안 돼… 인정! 오늘부터 너는 내 라이벌 2호야!', { face: 'shock' }); await c.getItem('arrows10', 1).catch(() => {}); c.gold(30); }
    else await c.say(n, '에이, 12초 넘었어! 다시 해!', { face: 'smile' });
  };

  /* ───────── 빛 씨앗 (그린) ───────── */
  ST.seed('g1', 'world', ...OW.P(76, 178), { under: true, hint: '덤불 밑' });
  ST.seed('g2', 'world', ...OW.P(120, 164), { under: true, hint: '바위 밑' });
  ST.seed('g3', 'world', ...OW.P(88, 200), {});
  ST.seed('g4', 'world', ...OW.P(104, 150), {});
  ST.seed('g5', 'world', ...OW.P(130, 186), { under: true });
  OW.hooks.push((m) => { m.obj[m.i(...OW.P(76, 178))] = O.BUSH; m.obj[m.i(...OW.P(120, 164))] = O.ROCK; m.obj[m.i(...OW.P(130, 186))] = O.BUSH; for (const [x, y] of [[88, 200], [104, 150]].map(([a, b]) => OW.P(a, b))) { m.obj[m.i(x, y)] = 0; if (m.ter[m.i(x, y)] === T.WATER) m.ter[m.i(x, y)] = T.GRASS; } });
})();
