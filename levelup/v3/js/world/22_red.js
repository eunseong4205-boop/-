/* 제2장 「불꽃과 쇠」 — 레드 마을 · 황금 광산 · 붉은 산 관측소
   볼칸에게 할머니의 편지 → 광산을 차지한 그라우스 → 갈래마다 다른 길로 광산에 들어간다 → 폭탄 → 두더지왕
   → 빛 착즙기 앞 두 번째 갈림길(부순다 · 고발한다 · 밤에 맡긴다) → 루드의 선택이 갈린다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const RT = OW.towns.red, X0 = RT.x, Y0 = RT.y;     // 36, 200
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const MINE = OW.pt(60, 193);
  const OBS = OW.pt(64, 178);
  ST.RED = { X0, Y0, MINE, OBS };

  ST.CH.push({ no: '제2장', id: 'c2', title: '불꽃과 쇠', sub: '망치 소리가 심장 소리처럼 울리는 마을. 광산 깊은 곳에서 무언가가 빛을 짜내고 있다.',
    goal(s) {
      if (!f('c2_letter')) return { text: '레드 마을 대장간의 볼칸에게 할머니의 편지를 전하자.', map: 'world', x: X0 + 5, y: Y0 + 6 };
      if (!f('c2_mine_ok')) return { text: '황금 광산 입구를 기사들이 막고 있다. 마을에서 방법을 찾자. (루드 · 광부 쉼터)', map: 'world', x: X0 + 24, y: Y0 + 18 };
      if (!f('d2:boss')) return { text: '황금 광산 깊은 곳으로. 폭탄을 찾아 막힌 길을 열자.', map: 'world', x: MINE.x, y: MINE.y };
      if (!f('c2_extractor')) return { text: '두더지왕이 지키던 문 너머, 광산 가장 깊은 방으로.', map: 'd2' };
      if (!f('c2_done')) return { text: '볼칸에게 돌아가자.', map: 'world', x: X0 + 5, y: Y0 + 6 };
      // 산사태를 치우기 전에는 표시가 바위 앞(열린 쪽)을 가리킨다: 블루 항구는 아직 닫힌 땅이라 그쪽만 가리키면 헤맨다
      if (!f('slide_clear') && ST.RED.slideAt) return { text: '블루 가는 길의 산사태를 폭탄으로 치우자. (도구 버튼으로 폭탄을 놓는다)', map: 'world', x: ST.RED.slideAt[0] - 2, y: ST.RED.slideAt[1] };
      return { text: '산사태가 치워졌다. 블루 항구로.', map: 'world', ...OW.pt(136, 196) };
    } });
  ST.closedMsg.blue = '찍… 블루 가는 길은 산사태로 막혔대. 폭탄이라도 있으면 몰라.';

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'r_forge', region: 'red', style: 'red', tx: X0 + 2, ty: Y0 + 2, w: 7, h: 4, name: '볼칸의 불꽃 대장간', sign: 'forge',
      room: { w: 15, h: 10, floor: T.STONE, music: 'red', furn: [['anvil', 7, 5, { text: '모루. 수천 번 두드린 자리가 거울처럼 반짝인다.' }], ['fireplace', 11, 2, { text: '대장간 화로. 불꽃이 숨 쉬듯 커졌다 작아진다.' }], ['barrel', 2, 7], ['crate', 3, 7], ['shelf', 1, 2, { text: '망치 서른두 개. 손잡이마다 이름이 새겨져 있다. 「에벨린」이라고 적힌 것도 하나.' }], ['counter', 4, 3, { v: 2, bw: 30, bh: 10 }], ['gears', 12, 7]] } });
    ST.house(m, { id: 'r_rud', region: 'red', style: 'red', tx: X0 + 2, ty: Y0 + 14, w: 5, h: 4, name: '루드네 집',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'sad', furn: [['bed2', 2, 3, { v: '#c88a8a' }], ['bed2', 4, 3, { v: '#c8a08a' }], ['table', 8, 5], ['chair', 7, 6], ['shelf', 10, 2, { text: '약병 여섯 개. 전부 비었다. 장부처럼 반듯하게 줄 서 있다.' }], ['window', 6, 1, { wall: true }]] } });
    ST.house(m, { id: 'r_magda', region: 'red', style: 'red', tx: X0 + 21, ty: Y0 + 2, w: 5, h: 4, name: '마그다 할매 떡볶이', sign: 'bar',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'calm', furn: [['cauldron', 5, 3, { v: '#ff5a3a', text: '빨간 떡볶이가 부글부글. 냄새만으로 눈물이 난다.' }], ['table', 3, 6], ['table', 8, 6], ['chair', 2, 7], ['chair', 9, 7], ['barrel', 10, 3]] } });
    ST.house(m, { id: 'r_inn', region: 'red', style: 'red', tx: X0 + 21, ty: Y0 + 14, w: 7, h: 4, name: '광부 쉼터 「곡괭이」', sign: 'inn',
      room: { w: 15, h: 10, floor: T.WOOD, music: 'calm', rug: [5, 5, 5, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 9, 5], ['chair', 8, 6], ['chair', 11, 6], ['fireplace', 12, 2], ['barrel', 1, 7], ['barrel', 2, 7], ['bed2', 13, 6]] } });
    OW.clear(m, X0 + 26, Y0 + 8, 5, 5, 0, null);
    G.build.placeBuilding(m, { special: 'tower', tx: X0 + 27, ty: Y0 + 9, w: 3, h: 2, id: 'r_tower', col: '#8a6a6a', broken: false });
    // 관측소 (붉은 산 동쪽 기슭)
    ST.house(m, { id: 'r_obs', region: 'red', style: 'red', tx: OBS.x - 2, ty: OBS.y - 3, w: 5, h: 4, name: '붉은 산 관측소', sign: 'lab', path: 3,
      room: { w: 12, h: 10, floor: T.WOOD, music: 'space', furn: [['telescope', 9, 3, { text: '망원경. 황금별 옆 검은 점이 맨눈보다 훨씬 크게 보인다.' }], ['desk', 3, 3], ['shelf', 1, 2], ['bookpile', 6, 6], ['bookpile', 7, 6], ['window', 5, 1, { wall: true, v: 'night' }]] } });
    // 황금 광산 입구
    ST.cave(m, { x: MINE.x, y: MINE.y, to: 'd2', id: 'd2_gate', col: '#8a5a3a', cover: O.ROCK, ground: T.DIRT, cond: () => f('c2_mine_ok'), msg: '기사들이 광산 입구를 막고 있다.' });
    // 마을 꾸미기
    for (const [dx, dy] of [[12, 5], [18, 5], [12, 17], [18, 17]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 50, warm: 'rgba(255,180,100,0.2)' }); }
    for (const [dx, dy] of [[0, 9], [29, 1], [29, 20], [0, 21]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.DEAD;
  });
  OW.hooks.push((m) => {
    // 블루 지역 경계의 길 칸들을 찾아 바위를 쌓는다
    let found = null;
    const [bx0, by0] = OW.P(120, 150), [bx1, by1] = OW.P(160, 230), [bx2] = OW.P(170, 200);
    for (let y = by0; y < by1 && !found; y++) for (let x = bx0; x < bx1; x++) { const i = m.i(x, y); if (OW.roadTiles[i] && OW.regName[i] === 'blue' && OW.regName[i - 1] === 'green') { found = [x, y]; break; } }
    if (!found) for (let y = by0; y < by1 && !found; y++) for (let x = bx0; x < bx2; x++) { const i = m.i(x, y); if (OW.roadTiles[i] && OW.regName[i] === 'blue') { found = [x, y]; break; } }
    if (found) { ST.RED.slideAt = found; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 2; dx++) { const x = found[0] + dx, y = found[1] + dy; if (OW.roadTiles[m.i(x, y)]) { m.obj[m.i(x, y)] = O.BOULDER; } } }
  });

  /* ───────── 소품 ───────── */
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(RT.plaza.x + 3), y: py(RT.plaza.y - 3), wid: 'w_red', name: '레드 마을' }));
    Wd.add(new P.Sign({ x: px(X0 + 13), y: py(Y0 - 1), text: '레드 마을 — 불꽃과 쇠\n↗ 황금 광산 · 붉은 산 관측소\n→ 그린 마을' }));
    Wd.add(new P.Sign({ x: px(MINE.x + 3), y: py(MINE.y + 2), text: f('c2_extractor') ? '황금 광산 — 광부 조합 관리\n「다시는 아무도 빛을 짜내지 않는다」' : '황금 광산 — 징수 기사단 관리 구역\n출입 금지. 위반 시 빛 몰수.' }));
    // 광산을 막는 기사들
    if (!f('c2_mine_ok')) for (const dx of [-1, 2]) { const n = new P.NPC({ x: px(MINE.x + dx), y: py(MINE.y + 2), look: G.cast.folk('knight'), name: '징수 기사', dir: 'down', talk: async (c, npc) => { await c.say(npc, U.pick(['돌아가라. 여긴 부단장님 관할이다.', '광부가 아니면 들어갈 수 없다. 광부라도 들어가면 못 나오지만.', '…그 검, 이상하게 빛나는군. 저리 가.'])); } }); Wd.add(n); }
    // 관측소 앞 망원경 · 불꽃 고추 (마그다의 부탁)
    for (const [i, [x, y]] of [[66, 172], [40, 182], [56, 186]].map(([a, b]) => OW.P(a, b)).entries()) if (!f('pepper' + i) && S().quests.magda && S().quests.magda.st === 'on') Wd.add(new P.Spot({ x: px(x), y: py(y), verb: '고추를 딴다', sparkle: true, flagKey: 'pepper' + i, text: async (c) => { c.flag('pepper' + i); S().pepper = (S().pepper || 0) + 1; c.sfx('item'); c.toast('불꽃 고추 ' + S().pepper + ' / 3', 'gold'); for (const e of G.world.ents) if (e.flagKey === 'pepper' + i) e.dead = true; } }));
    // 산사태 앞 표지
    if (ST.RED.slideAt && !f('slide_clear')) Wd.add(new P.Sign({ x: px(ST.RED.slideAt[0] - 2), y: py(ST.RED.slideAt[1] + 1), text: '산사태. 길이 막혔다.\n「바위를 치울 폭약이 있으면 좋으련만」' }));
  });
  // 산사태: 바위가 모두 부서지면 길이 열린다
  ST.onTick.push(() => {
    if (f('slide_clear') || !ST.RED.slideAt) return;
    const m = G.world.map; if (!m || !m.overworld) return;
    const [sx, sy] = ST.RED.slideAt;
    let left = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 2; dx++) if (m.O(sx + dx, sy + dy) === O.BOULDER) left++;
    const R0 = ST.RED; if (R0.slideN == null || left > R0.slideN) R0.slideN = left;
    // 절반을 부수면 나머지는 저절로 무너진다 (경계 너머 바위까지 폭탄이 닿지 않던 것)
    if (left > 0 && left <= R0.slideN / 2) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 2; dx++) if (m.O(sx + dx, sy + dy) === O.BOULDER) { m.setO(sx + dx, sy + dy, 0); G.fx.dust((sx + dx) * TS + 8, (sy + dy) * TS + 10, 8); }
      G.world.shake(4, 0.5); if (G.audio) G.audio.sfx('rock');
      left = 0;
    }
    if (left === 0) { S().flags.slide_clear = true; S().flags['open:blue'] = true; G.ui.toast('산사태가 치워졌다 — 블루 항구로 가는 길이 열렸다!', 'gold'); if (G.audio) G.audio.jingle('secret'); }
  });

  /* ───────── 제2장 시작: 레드에 처음 들어서면 ───────── */
  ST.onTick.push(() => {
    if (!f('c1_done') || f('ch:c2')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'red') return;
    S().flags['ch:c2'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c2');
      await c.say('toria', '찍! 뜨거워! 땅에서 김이 올라와! 저 산 좀 봐, 연기가 나!', { face: 'shock' });
      await c.say('toria', '할머니가 볼칸 아저씨한테 편지 전하랬지? 대장간은… 망치 소리 나는 쪽!', { face: 'happy' });
      c.lock(false);
    });
  });

  /* ───────── 사람들 ───────── */
  ST.person('r_forge', { id: 'volkan', x: 7, y: 3, dir: 'down', mark: () => (!f('c2_letter') ? '!' : f('c2_extractor') && !f('c2_done') ? '!' : null), talk: async (c, n) => {
    c.flag('met:volkan');
    if (!f('c2_letter')) { await volkanLetter(c, n); return; }
    if (f('c2_extractor') && !f('c2_done')) { await volkanFarewell(c, n); return; }
    const k = await c.choice(ST.lines({ c2: '뭐냐. 망치 식는다.', c4: '왔냐. 검 좀 보자.', default: '뭐냐.' }), ['물건을 산다 · 검을 두드린다', '에벨린 할머니 이야기', '그만둔다'], { who: 'volkan', name: '볼칸 아저씨' });
    if (k === 0) await c.shop('red');
    else if (k === 1) await c.say(n, ST.lines({ c2: '초록 창 얘기? …그 창은 부러진 적 없다. 983년에 내가 날을 세웠으니까 안다. 부러진 게 아니라, 내려놓은 거다.', c6: '천년제에서 흰빛이 터졌다며. 에벨린이 16년 동안 무슨 약속을 지켰는지, 이제 너도 알 때가 됐겠지.', c9: '밤의 성까지 갔다고? 에벨린 제자답다. 걔도 겁이 없었지.' }));
  } });
  async function volkanLetter(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '손님이면 줄 서고, 구경꾼이면 꺼져라. 망치 식는다.', { face: 'angry' });
    await c.say('toria', '찍! 편지예요! 그린 마을 에벨린 할머니가요!', { face: 'happy' });
    c.emote(n, '!'); c.sfx('clank');
    await c.say(n, '………에벨린?', { face: 'shock' });
    c.take('letter_volkan');
    await c.narr('볼칸이 봉투를 받아 든다. 망치를 쥐던 손이 조금 떨린다. 밀랍을 뜯는 소리가 유난히 크다.');
    await c.wait(1.2);
    await c.say(n, '…16년 만에 편지 한 장. 그것도 석 줄.', { face: 'sad' });
    await c.say(n, '「아이가 열여섯이 됐다. 검이 깼다. 부탁한다.」', { face: 'closed' });
    await c.say(n, '…하, 부탁이라니. 에벨린 입에서 부탁이 다 나오네.', { face: 'smile' });
    c.face(n, 'hero');
    await c.say(n, '네 할미는 옛날에 창을 들었다. [y]초록 창[/]. 사천왕 초록의 자리. 내가 그 창의 날을 세웠지.');
    await c.say(n, '983년에 챔피언이랑 겨뤄서 한 합에 졌다고들 한다. 헛소리다. 그 창은 부러진 적이 없다.', { face: 'angry' });
    const k = await c.choice('할머니가 사천왕이었다니…', [{ t: '그럼 왜 졌다고 했어요?' }, { t: '엄마 세린을 알아요?' }, { t: '저한테 필요한 게 뭐예요?' }]);
    if (k === 0) await c.say(n, '내가 아냐. 지는 척을 할 때는 지키고 싶은 게 있을 때다. 너 같은 거.', { face: 'closed' });
    else if (k === 1) await c.say(n, '…흰 옷 입은 아가씨. 여기 한 번 왔었다. 검을 들고. 그 검을 내 모루에 올려 보라 했더니, 모루가 울었다.', { face: 'sad' });
    else await c.say(n, '힘. 그리고 길. 둘 다 저 산에 있다.');
    await c.say(n, '블루 가는 길이 산사태로 막혔다. 치우려면 폭약이 필요하다. 폭약은 [y]황금 광산[/]에 있다.');
    await c.say(n, '문제는 광산을 기사단이 차지했다는 거다. 부단장 [r]그라우스[/] 놈. 금을 캐는 게 아니라… 사람을 캔다.', { face: 'angry' });
    await c.say('toria', '찍? 사람을?', { face: 'shock' });
    await c.say(n, '광부들이 안 돌아와. 돌아온 놈은 머리가 하얗게 셌다. 빛을 짜내는 기계가 있다는 소문이다.');
    const rt = ST.route();
    if (rt === 'dawn') await c.say(n, '…그 주황 목도리. 새벽단이냐. 광부 쉼터에 가 봐라. 주황색 좋아하는 놈들이 모여 있다.');
    else if (rt === 'order') await c.say(n, '등급 후보 통행증? 흥. 기사단 종이가 기사단 문을 열어 줄지도 모르지. 탑 앞에 루드라는 견습이 있다.');
    else await c.say(n, '…까만 깃털이라. 밤 사람들이 네 편인가 보구나. 쉼터의 도르간 영감을 찾아라. 광산 구멍은 그 영감이 제일 잘 안다.');
    await c.say(n, '그리고 이거. 에벨린 부탁이니까.', { face: 'closed' });
    await c.getItem('ar_leather', 1);
    c.flag('c2_letter'); c.flag('met:volkan');
    await c.cinema(false);
    c.lock(false);
    c.journal('볼칸 아저씨에게 편지를 전했다. 할머니는 옛 사천왕 [y]초록 창[/]이었다. 황금 광산을 그라우스가 차지하고 사람의 빛을 짜낸다.');
  }
  async function volkanFarewell(c, n) {
    c.lock(true);
    await c.say(n, '폭약을 가져왔다고? 광산이 조용해졌다더니… 네 짓이냐.', { face: 'shock' });
    const rt = S().flags.c2_route;
    await c.say(n, rt === 'dawn' ? '착즙기를 박살 냈다며. 광부들이 네 얘기만 한다. 속이 다 시원하다!' : rt === 'order' ? '장부를 기사단에 넘겼다며. 종이 한 장이 망치보다 셀 때도 있지. 그라우스 놈 얼굴 좀 보고 싶구먼.' : '광산의 기계가 하룻밤 새 조용해졌다더라. 아무도 누가 그랬는지 몰라. …그렇게 해 두자.', { face: 'smile' });
    await c.say(n, '폭약으로 산사태를 치워라. 블루 항구의 대도서관 [y]옥타비오[/]를 찾아가. 네 엄마가 무엇을 찾아 헤맸는지, 그 문어가 안다.');
    await c.say(n, '그리고 검 좀 줘 봐라.');
    c.sfx('clank'); await c.wait(0.4); c.sfx('clank'); await c.wait(0.4); c.sfx('clank'); c.flash('#fff', 0.3);
    await c.say(n, '…날은 안 건드렸다. 이 검은 내 모루가 감당 못 해. 손잡이만 감았다. 덜 미끄러울 거다.', { face: 'closed' });
    await c.say(n, '하나 더. 레드 사람은 불을 다룬다. 손바닥에 열을 모아 던지는 법이다. 네 할미가 나한테 가르친 걸 돌려주는 거다.', { face: 'normal' });
    G.st.learnSpell(S(), 'fire'); c.sfx('fire'); c.flash('#ff8a3a', 0.4);
    await c.say(null, '[r]화염구[/]를 배웠다! ([K]로 마법을 들고 공격 버튼 · MP 8) 풀과 얼음을 태우고, 횃불에 불을 붙인다.', { style: 'sys' });
    c.exp(40);
    c.flag('c2_done'); c.quest('main', 'on');
    await c.say(n, '가라. 레드 사람은 인사를 길게 안 한다.', { face: 'angry' });
    c.lock(false);
    c.journal('볼칸 아저씨가 시작의 검 손잡이를 감아 주었다. 블루 항구의 옥타비오 관장을 찾아가자.');
  }

  // 루드 (징수탑 앞)
  ST.person('world', { id: 'rud', x: X0 + 26, y: Y0 + 12, dir: 'left', when: () => !f('c2_extractor'), mark: () => (f('c2_letter') && !f('c2_mine_ok') && ST.route() === 'order' ? '!' : null), talk: async (c, n) => {
    c.flag('met:rud');
    if (!f('c2_letter')) { await c.say(n, '숫자는 거짓말 안 해. 레드 마을 올해 목표 대비 칠십팔 퍼센트. …비켜, 세고 있으니까.', { face: 'normal' }); return; }
    if (!f('c2_mine_ok')) {
      if (ST.route() === 'order') { await rudEscort(c, n); return; }
      await c.say(n, '광산? 거긴 부단장님 관할이야. 견습은 장부만 세. 들어가면… 안 돼.', { face: 'sad' });
      await c.say(n, '…동생들이 아파. 빛바램병. 기사단 봉급이 아니면 약값을 못 내. 그러니까 나한테 묻지 마.', { face: 'angry' });
      return;
    }
    await c.say(n, '광산 안에서 숫자가 안 맞아. 들어간 빛이랑 올라간 빛이. 어디로 새는 거지…', { face: 'think' });
  } });
  async function rudEscort(c, n) {
    c.lock(true);
    await c.say(n, '…등급 후보? 카시안 님 서명이네. 진짜야?', { face: 'shock' });
    await c.say(n, '카시안 님한테서 전서구가 왔어. 「광산 장부를 감사하라. 후보가 동행한다.」 네가 그 후보구나.', { face: 'normal' });
    await c.say(n, '좋아. 숫자는 거짓말 안 해. 들어가서 세 보자. 들어간 빛이랑 나온 빛.', { face: 'smile' });
    c.flag('c2_mine_ok'); c.bond('rud', 1);
    await c.say(null, '루드가 광산 기사들에게 명령서를 내민다. 기사들이 마지못해 길을 비킨다.', { style: 'narr' });
    c.lock(false);
  }

  // 광부 쉼터: 도르간 · 레아 · 주인
  ST.person('r_inn', { id: 'dorgan', x: 9, y: 4, dir: 'left', state: 'sit', mark: () => (f('c2_letter') && !f('c2_mine_ok') && ST.route() === 'night' ? '!' : !S().quests.dorgan && f('c2_mine_ok') ? '!' : null), talk: async (c, n) => {
    c.flag('met:dorgan');
    if (f('c2_letter') && !f('c2_mine_ok') && ST.route() === 'night') {
      await c.say(n, '까만 깃털… 허, 밤 사람들이 보냈구먼. 고양이가 먼저 와서 네 얘기를 하고 갔다. 말하는 고양이. 늙으니 별걸 다 본다.', { face: 'shock' });
      await c.say(n, '광산엔 광부만 아는 구멍이 있다. 기사 놈들은 정문만 지키지. 오늘 밤, 입구 옆 바위틈으로 들어가라.', { face: 'smirk' });
      c.flag('c2_mine_ok'); c.bond('dorgan', 1);
      await c.say(null, '밤이 되자, 입구를 지키던 기사들의 등불이 이상하게 꺼져 있었다.', { style: 'narr' });
      return;
    }
    if (!S().quests.dorgan && f('c2_mine_ok')) {
      await c.say(n, '광산에 들어간다고? 그럼 부탁 하나. 내 곡괭이가 안에 있다. 삼십 년 쓴 거다. 기사 놈들이 쫓아낼 때 두고 나왔어.');
      c.quest('dorgan', 'on');
      return;
    }
    if (S().quests.dorgan && S().quests.dorgan.st === 'on' && S().inv.pickaxe) {
      c.take('pickaxe'); c.quest('dorgan', 'done');
      await c.say(n, '…이 녀석. 살아 있었구나.', { face: 'cry' });
      await c.say(n, '받아라. 광부의 비밀 지도다. 이 산 어디에 빛이 숨었는지 적혀 있다.', { face: 'smile' });
      c.gold(150); await c.getItem('heartpiece');
      return;
    }
    await c.say(n, ST.lines({ c2: '광산은 원래 금을 캐는 곳이었다. 빛이 아니라.', c3: '광산이 다시 광부들 손에 왔다. 네 덕이다.', default: '곡괭이질 소리가 다시 들린다. 좋은 소리지.' }));
  } });
  ST.person('r_inn', { id: 'lea', x: 12, y: 7, dir: 'left', when: () => ST.route() === 'dawn' && !f('c2_extractor'), mark: () => (f('c2_letter') && !f('c2_mine_ok') ? '!' : null), talk: async (c, n) => {
    c.flag('met:lea');
    if (!f('c2_mine_ok')) {
      await c.say(n, '역시 왔네, 흰빛 꼬맹이. 그 목도리 아직 두르고 있구나.', { face: 'smile' });
      await c.say(n, '제대로 인사할게. 새벽단 단장 [y]레아[/]. 전직 징수 기사. 탑을 부수는 게 요즘 일이야.', { face: 'smile' });
      await c.say(n, '광산 입구? 우리가 동쪽 창고에서 불꽃놀이를 좀 할 거야. 기사들이 그쪽으로 뛰어가면, 그때 들어가.', { face: 'smirk' });
      await c.say(n, '…그리고 탑 앞에 서 있는 빨간 머리 견습. 루드. 내 동생이야. 걔한테는 말하지 마. 아직은.', { face: 'sad' });
      c.flag('c2_mine_ok'); c.bond('lea', 1);
      c.sfx('explode'); c.shake(3, 0.4);
      await c.say(null, '멀리서 폭음. 광산 앞 기사들이 동쪽으로 달려가는 소리가 들린다.', { style: 'narr' });
      return;
    }
    await c.say(n, '광산 안에서 봐. 늦으면 네 몫까지 내가 부술 거야.', { face: 'smirk' });
  } });
  ST.folk('r_inn', { name: '쉼터 주인 베르타', folk: 'oldw', x: 4, y: 3, lines: { c2: async (c, n) => { const k = await c.choice('쉬어 가요? (30골드)', ['쉰다', '괜찮아요'], { name: '쉼터 주인 베르타' }); if (k === 0) { if (S().gold >= 30) c.gold(-30); await c.rest(); } } } });

  // 루카 · 루미 (루드의 동생들)
  ST.folk('r_rud', { name: '루카', look: { age: 'child', hair: 'short', hc: '#b8b0b0', skin: 'pale', top: 'tunic', tc: '#8a5a5a', bottom: 'shorts', bc: '#4a3a3a' }, x: 2, y: 4, state: 'sit', lines: {
    c2: ['형은 매일 밤 숫자를 세. 잠꼬대로도 세.', '나 괜찮아. 머리가 좀 하얘졌을 뿐이야. 할아버지 같지?'],
    c3: () => S().flags.c2_route === 'night' ? async (c, n) => { await c.say(n, '누가 문 앞에 약을 두고 갔어! 한 달 치! 쪽지에는 고양이 발자국만 찍혀 있었어.', { face: 'happy' }); } : S().flags.c2_route === 'dawn' ? '형이 기사 옷을 벗었어. 요즘은 주황 목도리를 해. 엄마가 보면 좋아했을 거래.' : '형이 요즘 웃어. 카시안이라는 사람이 형 장부를 칭찬했대.',
  } });
  ST.folk('r_rud', { name: '루미', look: { gender: 'girl', age: 'child', hair: 'long', hc: '#c8c0c0', skin: 'pale', top: 'dress', tc: '#a86a6a', bottom: 'skirt', bc: '#4a3a3a' }, x: 4, y: 4, state: 'sit', lines: { c2: ['오빠 친구야? 오빠는 친구가 없는데.', '빨간 머리가 하얘지면 무슨 색이 될까? 분홍?'], c3: ['요즘은 아침이 덜 추워.'] } });

  // 마그다 할매 (떡볶이 · 부탁)
  ST.person('r_magda', { name: '마그다 할매', folk: 'oldw', x: 6, y: 4, dir: 'down', mark: () => (!S().quests.magda ? '!' : S().quests.magda.st === 'on' && (S().pepper || 0) >= 3 ? '!' : null), talk: async (c, n) => {
    const q = S().quests.magda;
    if (!q) {
      await c.say(n, '어서 온나! 화산 떡볶이 원조! 맵기가 레벨 백은 된다!', { face: 'happy' });
      await c.say(n, '근데 큰일이다. [r]불꽃 고추[/]가 똑 떨어졌다. 산기슭에 세 포기 자라는데, 요즘 도깨비불이 많아서 못 간다.');
      if (await c.confirm('불꽃 고추 세 개를 따다 줄래?', '따 올게요', '다음에')) { c.quest('magda', 'on'); await c.say(n, '관측소 가는 길, 광산 가는 길, 그리고 산 서쪽. 반짝거리니까 알아볼 끼다.'); }
      return;
    }
    if (q.st === 'on' && (S().pepper || 0) >= 3) { c.quest('magda', 'done'); await c.say(n, '이 색 봐라! 올해 고추 풍년이다! 자, 한 그릇 무라. 그라고 이거.', { face: 'happy' }); c.give('food_tteok', 3); await c.getItem('heartpiece'); return; }
    const k = await c.choice(null, ['떡볶이를 산다 (80골드)', '이야기', '그만둔다']);
    if (k === 0) { if (S().gold < 80) { await c.say(n, '돈이 모자라나? 에이, 한 그릇은 외상.'); c.give('food_tteok'); } else { c.gold(-80); c.give('food_tteok'); c.sfx('item'); } }
    else if (k === 1) await c.say(n, ST.lines({ c2: '루드 그놈 불쌍하다. 누나는 집을 나가고, 동생들은 아프고.', c3: '광산이 다시 돌아간다. 광부들이 떡볶이를 두 그릇씩 먹는다. 장사 잘된다!' }));
  } });
  D_QUEST();
  function D_QUEST() {
    const Q = G.data.QUESTS;
    Q.magda = { id: 'magda', name: '불꽃 고추 세 포기', who: '마그다 할매', desc: (s) => '레드 산기슭의 반짝이는 불꽃 고추를 딴다. (' + Math.min(3, s.pepper || 0) + '/3)', after: '떡볶이 맛이 돌아왔다.' };
    Q.dorgan = { id: 'dorgan', name: '삼십 년 된 곡괭이', who: '광부 대장 도르간', desc: '황금 광산 어딘가에 두고 나온 도르간의 곡괭이를 찾는다.', after: '도르간이 울었다. 곡괭이도 울었을지 모른다.' };
    G.data.ITEMS.pickaxe = { id: 'pickaxe', type: 'key', name: '도르간의 곡괭이', desc: '손잡이에 삼십 년치 손때.' };
  }

  // 레드 주민들
  ST.folk('world', { name: '대장장이 견습', folk: 'smith', x: X0 + 8, y: Y0 + 8, wander: 10, barks: ['땅! 땅! 땅!'], lines: { c2: ['볼칸 아저씨는 망치 소리로 사람을 알아봐. 너는… 아직 소리가 없대.', '레드 사람은 인사가 짧아. 오늘도 렙업!'], c3: ['광산이 풀려서 쇠가 다시 들어와. 망치가 신났어.'] } });
  ST.folk('world', { name: '광부의 아내', folk: 'farmerw', x: X0 + 16, y: Y0 + 16, wander: 16, lines: { c2: ['우리 남편이 광산에 들어간 지 석 달째야. 편지 한 장이 없어.', '기사들이 그러는데, 빛을 조금만 짜면 금이 더 나온대. 사람이 레몬도 아니고.'], c3: () => S().flags.c2_route ? '남편이 돌아왔어! 머리는 하얘졌지만… 돌아왔어.' : '…' } });
  ST.folk('world', { name: '떠돌이 상인', folk: 'merchant', x: X0 + 14, y: Y0 + 11, lines: { c2: ['블루 가는 길이 막혀서 물건이 안 들어와. 옐로 금화만 잔뜩 쌓였지.'], c3: ['길이 뚫렸다! 오늘도 렙업!'] } });

  // 아스텔 박사 (관측소)
  ST.person('r_obs', { id: 'astel', x: 7, y: 4, dir: 'right', talk: async (c, n) => {
    c.flag('met:astel');
    if (!S().truth.t_chart) {
      await c.say(n, '…누구냐. 아, 망원경 보러 왔나. 요즘은 아무도 하늘을 안 봐. 땅만 보지. 빛을 세느라.', { face: 'sad' });
      await c.say(n, '저 검은 점. 16년 전보다 두 배 크다. 가까워지고 있다는 뜻이지.');
      const k = await c.choice(null, [{ t: '왜 가까워지는 거예요?' }, { t: '카이론은 알아요?' }]);
      if (k === 0) {
        await c.say(n, '…993년에 계산을 하나 했다. 빛을 많이 보낼수록 흑점이 빨라진다는. 양이 아니라 쏠림이야. 한 점에 모으니까.', { face: 'closed' });
        await c.say(n, '그 표는 금고에 넣고 다시는 안 꺼냈다. 챔피언이 틀렸다는 계산을 누가 믿겠나.');
      } else await c.say(n, '편지를 열한 번 보냈다. 답장은 한 번. 「계산은 끝났다.」 네 글자.', { face: 'angry' });
      if (await c.confirm('금고의 표를 보여 줄 수 있어요?', '보여 주세요', '괜찮아요')) {
        await c.say(n, '…흰빛이 나는 아이라. 그래, 네가 봐야 할지도 모르지.', { face: 'closed' });
        c.truth('t_chart');
        for (const l of G.data.TRUTHS.t_chart.long) await c.narr(l);
        c.exp(30);
      }
      return;
    }
    await c.say(n, ST.lines({ c2: '그 표, 누구한테 보여 주든 네 마음이다. 다만 챔피언한테 보여 줄 거면 — 계산이 아니라 사람을 들고 가라.', c9: '흑점이 또 가까워졌다. 서둘러라.' }));
  } });

  /* ───────── 빛 씨앗 (레드) ───────── */
  ST.seed('r1', 'world', ...OW.P(44, 196), { under: true });
  ST.seed('r2', 'world', ...OW.P(70, 186), {});
  ST.seed('r3', 'world', ...OW.P(30, 210), { under: true });
  ST.seed('r4', 'world', ...OW.P(52, 182), {});
  OW.hooks.push((m) => { m.obj[m.i(...OW.P(44, 196))] = O.ROCK; m.obj[m.i(...OW.P(30, 210))] = O.BUSH; for (const [x, y] of [[70, 186], [52, 182]].map(([a, b]) => OW.P(a, b))) m.obj[m.i(x, y)] = 0; });

  /* ═════════ 황금 광산 (던전 2) ═════════ */
  G.dungeon.def('d2', {
    name: '황금 광산', sub: '빛을 캐는 굴', pal: 'red', music: 'cave', tier: 1, floor: T.DIRT, dark: 0.45,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: MINE.x, ty: MINE.y + 1 },
    rooms: {
      '1,3': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 5, { text: '「3번 갱도 — 빛 착즙 작업 중. 광부는 쉬지 않는다.」' }], ['pot', 2, 10], ['pot', 3, 10], ['decor', 15, 9, { decor: 'crate' }], ['decor', 16, 9, { decor: 'barrel' }]], foes: [['bat', 6, 6], ['bat', 13, 7]] },
      '1,2': { props: [['torch', 2, 3, { lit: true }], ['torch', 17, 3, { lit: true }], ['pot', 9, 9]], foes: [['bomber', 5, 7], ['boar', 14, 8]], ter: [['h', 7, 4, 6, 3, 1]], stairs: [[9, 4, 2]] },
      '0,2': { solve: { type: 'clear', msg: '상자가 나타났다' }, props: [['torch', 9, 3, { lit: true }], ['chest', 9, 6, { item: 'key_small', hidden: true }], ['decor', 3, 4, { decor: 'crate' }], ['decor', 16, 4, { decor: 'crate' }]], foes: [['bomber', 5, 8], ['bomber', 14, 8], ['wisp', 9, 9]] },
      '1,1': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['chest', 9, 5, { item: 'bomb', col: '#8a3a5a' }], ['sign', 9, 9, { text: '「폭약 창고 — 금 간 벽 근처에서 불장난 금지」 (누군가 「금지」에 줄을 그었다)' }]], foes: [['wisp', 5, 8], ['wisp', 14, 8]] },
      '0,1': { solve: { type: 'clear' }, props: [['torch', 9, 3, { lit: true }], ['chest', 9, 6, { item: 'key_big', big: true, hidden: true }], ['chest', 3, 10, { item: 'pickaxe' }], ['chest', 16, 10, { item: 'map_d' }]], foes: [['golem', 9, 8, { hpMul: 0.6 }]] },
      '2,2': { props: [['torch', 2, 3, { lit: true }], ['crystal', 4, 9], ['cblock', 9, 3, { blue: true }], ['cblock', 10, 3, { blue: true }], ['cblock', 9, 2, { blue: true }], ['cblock', 10, 2, { blue: true }], ['cblock', 14, 7, { blue: false }], ['cblock', 15, 7, { blue: false }], ['chest', 17, 10, { item: 'compass' }]], foes: [['bat', 12, 8], ['bomber', 6, 5]] },
      '2,1': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['block', 6, 8], ['block', 13, 8], ['plate', 6, 5], ['plate', 13, 5], ['chest', 9, 10, { item: 'bombs5', hidden: true }]], solve: { type: 'plates', msg: '어딘가 문이 열리는 소리' }, foes: [['boar', 9, 7]], ter: [['pit', 2, 9, 3, 3], ['pit', 15, 9, 3, 3]] },
      '2,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 6, { type: 'moleking' }]] },
      '3,0': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['decor', 9, 4, { decor: 'gears', text: '빛 착즙기. 톱니 사이로 초록 · 빨강 · 파랑 빛이 섞여 흐른다. 사람의 빛이다.' }], ['decor', 12, 4, { decor: 'console' }], ['decor', 6, 4, { decor: 'gears' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '1,1', 'open'], ['1,2', '2,2', 'key'], ['1,1', '0,1', 'bomb'], ['2,2', '2,1', 'open'], ['2,1', '2,0', 'big'], ['2,0', '3,0', 'switch', 'd2:boss']],
    ents(m, Wd) {
      const r = m.rooms['2,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (boss) {
        if (f('d2:boss')) boss.dead = true;
        else {
          boss.onDieFn = () => { G.script.run(async (c) => { await c.wait(0.8); if (!f('d2:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 9) * TS + 8, y: (r.y0 + 9) * TS + 12, flagKey: 'd2:heart' })); c.music('cave'); await c.say('toria', '찍… 두더지왕 머리에 기계 조각이 박혀 있었어. 누가 저렇게 만든 거야?', { face: 'sad' }); }); };
          r.ctl.R.onEnter = () => { G.script.run(async (c) => {
            c.lock(true); await c.cinema(true); c.camOn(boss, 3);
            if (!f('d2:intro')) { c.flag('d2:intro'); await c.say('toria', '찍! 땅이 움직여! 흙더미가 이리로 와!', { face: 'shock' }); await c.cutin({ who: 'toria', title: '황금 두더지왕', small: '광맥의 왕', sub: '흙더미 옆에 폭탄을!', col: '#e8c048', face: 'shock', sec: 1.8 }); }
            c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
          }); };
        }
      }
      const r3 = m.rooms['3,0'];
      r3.ctl.R.onEnter = () => { if (!f('c2_extractor')) G.script.run(async (c) => { await extractorScene(c, m, r3); }); };
      if (f('c2_extractor')) Wd.add(new ST.Portal({ x: (r3.x0 + 9) * TS + 8, y: (r3.y0 + 9) * TS + 12, to: 'world', tox: MINE.x, toy: MINE.y + 2 }));
    },
  });

  /* ═════════ 빛 착즙기 — 두 번째 갈림길 ═════════ */
  async function extractorScene(c, m, r) {
    const X = r.x0, Y = r.y0;
    c.lock(true);
    await c.cinema(true);
    c.music('dread');
    c.cam((X + 9) * TS, (Y + 5) * TS, 3);
    await c.narr('거대한 톱니바퀴들이 돌고 있다. 벽을 따라 늘어선 유리관 속에서 광부들이 잠든 채 숨을 쉰다.\n그들의 몸에서 흘러나온 빛이, 톱니 사이로 빨려 들어간다.');
    await c.say('toria', '찍… 사람이야. 전부 사람이야…!', { face: 'cry' });
    const rud = c.spawn({ cid: 'rud', x: (X + 3) * TS, y: (Y + 10) * TS });
    await c.move(rud, (X + 7) * TS, (Y + 7) * TS, { speed: 70 });
    await c.say('rud', '……', { face: 'shock' });
    await c.narr('루드가 기계 옆에 떨어진 두꺼운 장부를 줍는다. 페이지를 넘기는 손이 점점 빨라진다.');
    await c.say('rud', '들어간 빛, 삼백사십만. 천년성으로 올라간 빛, 이백십만.', { face: 'normal' });
    await c.say('rud', '백삼십만이 비어. …부단장님 인장이 찍힌 개인 금고로.', { face: 'angry' });
    await c.say('rud', '숫자는 거짓말 안 해. 그런데… 사람은 해.', { face: 'cry' });
    const rt = ST.route();
    let ally = null;
    if (rt === 'dawn') { ally = c.spawn({ cid: 'lea', x: (X + 16) * TS, y: (Y + 10) * TS }); await c.move(ally, (X + 12) * TS, (Y + 7) * TS, { speed: 80 }); await c.say('lea', '늦었네, 흰빛. …루드?', { face: 'shock' }); await c.say('rud', '…누나?', { face: 'shock' }); await c.say('lea', '…3년 만이네. 키 컸다.', { face: 'sad' }); }
    else if (rt === 'order') { await c.say('rud', '카시안 님께 드릴 증거로 충분해. 이거면 부단장님도 끝이야.', { face: 'normal' }); }
    else { ally = c.spawn({ cid: 'midnight', x: (X + 14) * TS, y: (Y + 6) * TS }); c.emote(ally, '♪'); await c.say('midnight', '흐음. 맛있는 냄새가 나는군. 짜낸 빛은 늘 조금 쓰지만.', { face: 'smirk', name: '검은 고양이' }); await c.say('toria', '찍?! 고양이가 말을 해!', { face: 'shock' }); await c.say('midnight', '다람쥐도 말을 하잖나. 피차 일반이지.', { face: 'smile', name: '검은 고양이' }); }
    c.music('danger');
    const k = await c.choice('착즙기가 윙윙 돈다. 유리관 속 광부들의 머리칼이 한 올씩 하얘진다.', [
      { t: '착즙기를 부순다. 지금 당장.', tag: 'dawn', sub: '광부들이 풀려난다. 그라우스는 증거를 잃지만, 모두가 본다.' },
      { t: '기계를 멈추고 장부를 카시안에게 보낸다', tag: 'order', sub: '느리지만 확실하게. 그라우스를 법정에 세운다.' },
      { t: '고양이에게 맡긴다 — 빛을 삼키게 하고, 그라우스의 금은 루드 동생들 약값으로', tag: 'night', sub: '아무도 누가 했는지 모른다. 그라우스도.' },
    ]);
    const p = G.world.player;
    if (k === 0) {
      c.route('dawn', 2); c.flag('c2_route', 'dawn');
      c.sfx('swing'); p.state = 'attack'; await c.wait(0.2); p.state = 'idle';
      c.flash('#fff', 0.6); c.sfx('explode'); c.shake(7, 1);
      G.fx.sparks((X + 9) * TS, (Y + 4) * TS, 60, '#ffe8a8', 200); G.fx.shards((X + 9) * TS, (Y + 4) * TS, 40, '#8a8098');
      await c.narr('톱니가 멈추고, 유리관이 차례로 깨진다. 광부들이 기침을 하며 눈을 뜬다.\n빼앗긴 빛이 무지개처럼 흩어져 주인에게 돌아간다.');
      await c.say('rud', '…장부가 불에 탔어. 증거가…', { face: 'shock' });
      if (ally) await c.say('lea', '증거는 여기 서 있잖아. 광부 스물세 명이. 루드, 기사 옷 벗어. 누나랑 가자.', { face: 'smile' });
      await c.say('rud', '………', { face: 'sad' });
      await c.narr('루드가 가슴의 기사단 휘장을 뜯어, 부서진 기계 위에 올려놓는다.');
      await c.say('rud', '숫자를 셀 줄 아는 새벽단원도 하나쯤 있어야겠지.', { face: 'smile' });
      c.flag('rud_dawn'); c.bond('rud', 2); c.bond('lea', 2);
    } else if (k === 1) {
      c.route('order', 2); c.flag('c2_route', 'order');
      c.sfx('switch'); await c.wait(0.3); c.sfx('rumble');
      await c.narr('루드가 비상 정지 손잡이를 당긴다. 톱니가 끼익 소리를 내며 멈춘다. 유리관이 열리고, 광부들이 부축을 받으며 걸어 나온다.');
      await c.say('rud', '장부는 내가 들고 갈게. 카시안 님이 법정을 열 거야. 부단장님도 이번엔 못 빠져나가.', { face: 'normal' });
      await c.say('rud', '…고마워. 숫자를 믿게 해 줘서. 사람도 조금은.', { face: 'smile' });
      c.flag('rud_order'); c.flag('graus_trial'); c.bond('rud', 2); c.bond('cassian', 1);
    } else {
      c.route('night', 2); c.flag('c2_route', 'night');
      if (ally) { c.emote(ally, '♪'); await c.say('midnight', '그럼 실례.', { face: 'smile', name: '검은 고양이' }); }
      c.sfx('heartbeat');
      const mm = G.world.map; const old = mm.dark;
      for (let i = 0; i < 20; i++) { mm.dark = 0.45 + i / 20 * 0.5; await c.wait(0.04); }
      await c.narr('어둠이 톱니를 감싼다. 무언가가 오래, 천천히, 기계 속의 빛을 삼킨다. 톱니가 배부른 짐승처럼 조용해진다.');
      for (let i = 20; i >= 0; i--) { mm.dark = 0.45 + i / 20 * 0.5; await c.wait(0.03); }
      mm.dark = old;
      await c.say('midnight', '광부들의 빛은 돌려줬다. 나는 기계가 모은 찌꺼기만 먹었지. 배가 고프지 않을 만큼만.', { face: 'closed', name: '검은 고양이' });
      await c.say('midnight', '그리고 부단장의 금고는… 오늘 밤 레드 마을 어느 집 문 앞에 약상자로 놓일 거다. 쪽지엔 발자국만.', { face: 'smirk', name: '검은 고양이' });
      await c.say('rud', '…무슨 소리야? 무슨 약상자?', { face: 'think' });
      await c.say('midnight', '아무 소리도 아니다, 견습. 너는 오늘 아무것도 못 봤다. 좋은 밤.', { face: 'smile', name: '검은 고양이' });
      if (ally) ally.dead = true;
      c.flag('rud_night'); c.flag('met:midnight_cat'); c.bond('midnight', 1);
    }
    c.flag('c2_extractor'); c.exp(60);
    c.journal(k === 0 ? '황금 광산의 빛 착즙기를 부쉈다. 루드가 기사단을 떠나 누나 레아의 새벽단에 들었다.' : k === 1 ? '빛 착즙기를 멈추고 그라우스의 횡령 장부를 카시안에게 보냈다. 루드가 증인이 되었다.' : '검은 고양이가 착즙기 속 빛을 삼켰다. 그라우스의 금은 루드네 문 앞에 약상자로 놓였다. 아무도 누가 했는지 모른다.');
    await c.say('toria', '찍… 이제 볼칸 아저씨한테 돌아가자. 폭약도 잔뜩 있어.', { face: 'sad' });
    await c.cinema(false);
    c.camFree();
    c.lock(false);
    if (rud) rud.dead = true;
    if (ally && !ally.dead) ally.dead = true;
    G.world.add(new ST.Portal({ x: (X + 9) * TS + 8, y: (Y + 9) * TS + 12, to: 'world', tox: MINE.x, toy: MINE.y + 2 }));
  }
})();
