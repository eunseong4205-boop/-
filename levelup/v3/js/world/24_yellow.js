/* 제4장 「황금과 모래」 — 옐로 · 대바자르 · 황금궁 · 그늘 골목 · 오아시스 · 태양 피라미드
   세 척의 배 중 무엇을 탔느냐에 따라 함께 온 사람이 다르다(루드 · 카시안 · 리라).
   금화왕 골디의 거래 → 소매치기 피카 쫓기 → 길잡이 야나 → 모래바다 → 피라미드(거울 방패 · 스핑크스) → 태양의 눈을 어떻게 할까 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const YT = OW.towns.yellow, X0 = YT.x, Y0 = YT.y;     // 252, 142
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const PYR = OW.pt(232, 124);                       // 피라미드 (발자리 왼쪽 위)
  ST.YELLOW = { X0, Y0, PYR };
  const buddy = () => ({ dawn: 'rud', order: 'cassian', night: 'lyra' }[S().flags.route_lock1 || 'order']);

  ST.CH.push({ no: '제4장', id: 'c4', title: '황금과 모래', sub: '모든 것에 값이 붙은 도시. 빛도, 이름도, 슬픔도.',
    goal(s) {
      if (!f('c4_goldy')) return { text: '옐로 한가운데 황금궁의 주인, 금화왕 골디를 만나자.', map: 'world', x: X0 + 19, y: Y0 + 3 };
      if (!f('c4_pika')) return { text: '대바자르에서 소매치기를 조심하자. 그늘 골목에 무언가 있다.', map: 'world', x: X0 + 5, y: Y0 + 20 };
      if (!f('c4_yana')) return { text: '모래바다를 건널 길잡이, 여우 귀의 야나를 찾자. (오아시스 쪽)', map: 'world', ...OW.pt(274, 129) };   // 야나가 선 자리 바로 앞
      if (!f('d4:boss')) return { text: '모래바다 서쪽, 태양 피라미드 깊은 곳의 「태양의 눈」을 가져오자.', map: 'world', x: PYR.x + 5, y: PYR.y + 3 };
      if (!f('c4_eye')) return { text: '태양의 눈을 들고 황금궁으로.', map: 'world', x: X0 + 19, y: Y0 + 3 };
      return { text: '북서쪽, 해 질 녘의 숲 퍼플로 가는 길이 열렸다.', map: 'world', x: OW.towns.purple.x + 16, y: OW.towns.purple.y + 12 };
    } });
  ST.closedMsg.purple = '해 질 녘의 숲은 아직 문을 닫고 있어. 금화왕 허락 없인 국경을 못 넘는대, 찍.';

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'y_palace', region: 'yellow', style: 'yellow', tx: X0 + 15, ty: Y0 + 1, w: 9, h: 5, name: '황금궁', sign: 'bar', colors: { roof: '#f0c848', wall: '#f0d8a0' },
      room: { w: 20, h: 13, floor: T.CARPET, music: 'yellow', rug: [6, 4, 8, 7], furn: [['counter', 7, 3, { v: 4, bw: 60, bh: 10 }], ['table', 3, 8, { v: 'cloth', text: '주사위 탁자. 금화가 탑처럼 쌓였다가 무너진다.' }], ['table', 15, 8, { v: 'cloth' }], ['chair', 2, 9], ['chair', 5, 9], ['chair', 14, 9], ['chair', 17, 9], ['plant', 1, 3], ['plant', 18, 3], ['lamp', 6, 3], ['lamp', 13, 3], ['painting', 9, 1, { wall: true, v: '#e8c048', text: '골디의 초상화. 금화를 깨무는 모습. 아래 글귀: 「공짜는 없어」.' }]] } });
    ST.house(m, { id: 'y_shop', region: 'yellow', style: 'yellow', tx: X0 + 3, ty: Y0 + 3, w: 5, h: 4, name: '대바자르 상관', sign: 'shop',
      room: { w: 12, h: 9, floor: T.CARPET, music: 'yellow', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['crate', 2, 6], ['barrel', 9, 6]] } });
    ST.house(m, { id: 'y_inn', region: 'yellow', style: 'yellow', tx: X0 + 29, ty: Y0 + 3, w: 7, h: 4, name: '낙타 쉼터', sign: 'inn',
      room: { w: 15, h: 10, floor: T.CARPET, music: 'calm', rug: [5, 5, 5, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 9, 5], ['chair', 8, 6], ['chair', 11, 6], ['barrel', 12, 2], ['bed2', 13, 6, { v: '#e8a040' }], ['plant', 1, 7]] } });
    ST.house(m, { id: 'y_alley', region: 'yellow', style: 'yellow', tx: X0 + 2, ty: Y0 + 17, w: 5, h: 4, name: '그늘 골목 — 참새 둥지', colors: { wall: '#b89868', roof: '#8a6a3a' }, win: 'dark',
      room: { w: 13, h: 9, floor: T.WOOD, music: 'sad', furn: [['bed2', 2, 3, { v: '#8a6a4a' }], ['bed2', 4, 3, { v: '#a88a5a' }], ['bed2', 6, 3, { v: '#6a5a3a' }], ['table', 9, 5], ['crate', 11, 3], ['barrel', 11, 6], ['plant', 1, 7]] } });
    // 대바자르 노점
    for (const [dx, dy, col] of [[10, 10, '#e84a4a'], [14, 10, '#4a8ad8'], [22, 10, '#6ae07a'], [26, 10, '#e8c048'], [10, 18, '#b87aff'], [26, 18, '#ff8a3a']]) { OW.clear(m, X0 + dx, Y0 + dy, 3, 2, 0, null); G.build.placeBuilding(m, { special: 'stall', tx: X0 + dx, ty: Y0 + dy, w: 3, h: 1, col, door: false }); }
    // 오아시스 둘레 야자
    for (const [x, y] of [[270, 130], [278, 130], [271, 135], [277, 135], [268, 132]].map(([a, b]) => OW.P(a, b))) if (m.inb(x, y)) m.obj[m.i(x, y)] = O.PALM;
    // 태양 피라미드
    OW.clear(m, PYR.x - 2, PYR.y - 2, 14, 10, 0, T.SAND);
    G.build.placeBuilding(m, { special: 'pyramid', tx: PYR.x, ty: PYR.y, w: 10, h: 3, to: 'd4', id: 'd4_gate', cond: () => f('c4_yana') || (S().party || []).includes('yana') || f('c4_done') || f('d4:boss'), msg: '모래 폭풍이 입구를 가린다. 모래바다의 길잡이가 필요하다.' });
    for (let y = PYR.y + 3; y < PYR.y + 8; y++) for (const x of [PYR.x + 4, PYR.x + 5]) { const i = m.i(x, y); m.ter[i] = T.ROAD; m.obj[i] = 0; }
    for (const [dx, dy] of [[-1, 4], [10, 4]]) { const x = PYR.x + dx, y = PYR.y + dy; G.build.placeBuilding(m, { special: 'statue', tx: x, ty: y, w: 1, h: 1, col: '#d8b060', door: false }); }
    // 마을 꾸미기
    for (const [dx, dy] of [[1, 12], [36, 12], [1, 24], [36, 24], [18, 23]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.PALM;
    for (const [dx, dy] of [[12, 7], [26, 7], [12, 15], [26, 15]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 50, warm: 'rgba(255,200,110,0.2)' }); }
  });

  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(YT.plaza.x + 3), y: py(YT.plaza.y - 3), wid: 'w_yellow', name: '옐로 대바자르' }));
    Wd.add(new P.Waystone({ x: px(PYR.x + 3), y: py(PYR.y + 7), wid: 'w_pyramid', name: '태양 피라미드' }));
    Wd.add(new P.Sign({ x: px(X0 + 17), y: py(Y0 + Y0 * 0 + 25), text: '옐로 — 황금과 거래의 도시\n「모든 것에는 값이 있다」 — 금화왕 골디' }));
    Wd.add(new P.Sign({ x: px(PYR.x + 7), y: py(PYR.y + 6), text: '태양 피라미드\n「답을 맞혀도, 싸워야 한다」' }));
  });

  /* ───────── 제4장 시작: 배에서 내리면 ───────── */
  ST.onTick.push(() => {
    if (!f('c3_done') || f('ch:c4')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    S().flags['ch:c4'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c4');
      const b = buddy();
      ST.join(b);
      await c.say('toria', '찍! 모래! 금화! 반짝반짝! 여기 공기에서 금 냄새 나!', { face: 'happy' });
      if (b === 'rud') await c.say('rud', '옐로의 연간 거래액은 대륙 전체의 사십일 퍼센트. 그중 금화왕 몫이… 세기 싫다.', { face: 'angry' });
      else if (b === 'cassian') await c.say('cassian', '금화왕 골디. 사천왕 노랑의 자리. 감찰관으로 온 이상, 장부를 봐야겠지. …그 자가 순순히 보여 줄 리 없지만.', { face: 'normal' });
      else await c.say('lyra', '옐로는 낮에는 금빛, 밤에는 그늘빛이에요. 그늘 골목의 참새들을 조심해요. 아니, 조심하지 마요. 친구예요.', { face: 'smile' });
      c.lock(false);
    });
  });

  /* ───────── 골디 (황금궁) ───────── */
  ST.person('y_palace', { id: 'goldy', x: 9, y: 4, dir: 'down', mark: () => (!f('c4_goldy') ? '!' : f('d4:boss') && !f('c4_eye') ? '!' : null), talk: async (c, n) => {
    c.flag('met:goldy');
    if (!f('c4_goldy')) { await goldyFirst(c, n); return; }
    if (f('d4:boss') && !f('c4_eye')) { await goldyEye(c, n); return; }
    const k = await c.choice(ST.lines({ c4: '또 왔군. 시간도 돈이다. 용건은?', c9: '천년성까지 간다고? 이자는 나중에 받지.' }), ['주사위를 굴린다 (도박)', '세린 이야기', '그만둔다'], { who: 'goldy', name: '금화왕 골디' });
    if (k === 0) await dice(c, n);
    else if (k === 1) await c.say(n, f('c4_eye') ? '세린? 그 여자는 나한테 빚진 게 없어. 오히려 내가 졌지. 평생 처음으로 공짜를 받아 봤으니까.' : '거래가 끝나면 말해 주지. 공짜는 없어.', { face: 'smirk' });
  } });
  async function goldyFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    c.music('yellow');
    await c.say(n, '어서 와, 흰빛. 소문이 금화보다 빠르군. 그린에서 탑을, 레드에서 기계를, 블루에서 부두를 시끄럽게 했다며.', { face: 'smirk' });
    await c.say(n, '나는 금화왕 골디. 사천왕 노랑의 자리. 여기선 모든 것에 값이 있다. 빛도, 이름도, 슬픔도.', { face: 'smirk' });
    const b = buddy();
    if (b === 'cassian') { await c.say('cassian', '감찰관으로서 경험 이자 장부를 요구합니다.', { face: 'normal' }); await c.say(n, '감찰? 좋아. 장부 열람료는 금화 백만. 법에 있지. 제7조. 공짜는 없어.', { face: 'smile' }); await c.say('cassian', '………', { face: 'angry' }); }
    if (b === 'rud') { await c.say('rud', '경험 이자율 연 삼십 퍼센트. 그걸 갚느라 아이들이 빛을 팝니다. 따져 봤어요. 합법이지만, 사람이 죽어요.', { face: 'angry' }); await c.say(n, '셈이 되는 새벽단원이라. 드물군. 합법이면 된 거다, 꼬마.', { face: 'smirk' }); }
    if (b === 'lyra') { await c.say(n, '음유시인 리라. 네 노래는 비싸게 팔리더군. 세금 좀 내지?', { face: 'smile' }); await c.say('lyra', '노래는 공짜예요. 듣는 사람이 알아서 울거든요.', { face: 'smirk' }); }
    await c.say(n, '거래하자. 서쪽 모래바다의 [y]태양 피라미드[/]. 거기 「태양의 눈」이라는 렌즈가 있다. 빛을 한 점에 모으는 물건.', { face: 'normal' });
    await c.say(n, '그걸 가져오면 두 가지를 주지. 퍼플로 가는 국경 통행 허가. 그리고 — 네 어미 세린에 대해 내가 아는 것.', { face: 'smirk' });
    await c.say('toria', '찍?! 엄마를 알아요?!', { face: 'shock' });
    await c.say(n, '알지. 딱 한 번 만났다. 그 한 번이 금화 백만보다 비쌌지. 가져와. 공짜는 없어.', { face: 'closed' });
    c.flag('c4_goldy');
    await c.cinema(false);
    c.lock(false);
    c.journal('옐로의 금화왕 골디와 거래했다. 태양 피라미드의 「태양의 눈」을 가져오면 퍼플 통행 허가와 엄마 이야기를 준다.');
    // 황금궁을 나서면 피카가 소매치기
  }
  ST.enterHooks.push((m) => { if (m.id === 'world' && f('c4_goldy') && !f('c4_pika') && !f('c4_pika_chase')) { S().flags.c4_pika_chase = true; G.script.run(pikaChase); } });
  async function pikaChase(c) {
    const p = G.world.player;
    c.lock(true);
    const pk = c.spawn({ cid: 'pika', x: p.x - 20, y: p.y + 20, dir: 'right' });
    await c.move(pk, p.x - 4, p.y + 6, { speed: 140 });
    const stolen = Math.min(S().gold, 200);
    S().gold -= stolen; c.sfx('coin'); c.emote('hero', '!');
    await c.say('pika', '헤헤, 흰빛은 지갑도 하얗네! 고마워!', { face: 'happy' });
    await c.say('toria', '찍!! 돈주머니! 잡아!!', { face: 'angry' });
    c.lock(false);
    // 쫓기: 피카가 골목을 돌며 달아난다
    const path = [[X0 + 12, Y0 + 13], [X0 + 8, Y0 + 13], [X0 + 8, Y0 + 20], [X0 + 4, Y0 + 22], [X0 + 4, Y0 + 21]].map(([x, y]) => [px(x), py(y)]);
    let k = 0, caught = false, t = 0;
    pk.script = true;
    await c.freeWhile(() => {
      t += 1 / 60;
      const [tx, ty] = path[Math.min(k, path.length - 1)];
      const d = U.dist(pk.x, pk.y, tx, ty);
      const sp = U.dist(pk.x, pk.y, p.x, p.y) < 50 ? 95 : 55;
      if (d > 2) { const [nx, ny] = U.norm(tx - pk.x, ty - pk.y); pk.x += nx * sp / 60; pk.y += ny * sp / 60; pk.dir = U.dir4(nx, ny, pk.dir); pk.state = 'walk'; pk.walkT = (pk.walkT || 0) + 1 / 60; } else if (k < path.length - 1) k++;
      if (U.dist(pk.x, pk.y, p.x, p.y) < 14) { caught = true; return true; }
      return t > 30 || (k >= path.length - 1 && d < 3);
    });
    c.lock(true);
    if (caught) { c.gold(stolen); await c.say('pika', '으악! 놔, 놔! 알았어, 돌려줄게! …빠르다, 너.', { face: 'shock' }); c.flag('pika_caught'); }
    else await c.say('pika', '헤헤, 여기가 우리 집이야! 들어올 테면 들어와 봐!', { face: 'smirk' });
    pk.dead = true;
    c.lock(false);
  }

  /* 그늘 골목: 피카와 참새들 */
  ST.person('y_alley', { id: 'pika', x: 9, y: 4, dir: 'down', when: () => f('c4_pika_chase'), mark: () => (!f('c4_pika') ? '!' : S().quests.sparrow && S().quests.sparrow.st === 'on' && (S().inv.food_corn || 0) + (S().inv.food_tteok || 0) >= 3 ? '!' : null), talk: async (c, n) => {
    c.flag('met:pika');
    if (!f('c4_pika')) {
      c.lock(true);
      await c.say(n, f('pika_caught') ? '…따라 들어왔어? 돈은 돌려줬잖아.' : '진짜 들어왔네. 돈? 벌써 빵 샀어. 애들 먹였어. 끝.', { face: 'angry' });
      await c.narr('좁은 방. 침대 셋에 아이가 아홉. 모두 머리칼 끝이 하얗다. 가장 어린 아이는 거의 새하얗다.');
      await c.say(n, '「그늘 참새단」. 내가 두목이야. 다들 경험 이자 못 갚아서 부모가 빛을 판 애들이야. 빛을 다 판 부모는… 안 돌아와.', { face: 'sad' });
      await c.say(n, '금화왕이 태양의 눈을 원한다고? 그게 뭔지 알아? 빛을 한 점에 모으는 렌즈야. 그거 있으면 탑 없이도 사람 빛을 빨아들일 수 있대.', { face: 'angry' });
      await c.say('toria', '찍… 그럼 가져다주면 안 되잖아.', { face: 'sad' });
      await c.say(n, '모래바다 건너려면 [y]야나[/] 누나를 찾아. 오아시스에 있어. 여우 귀. 금화왕이라면 이를 가는 누나야. 네가 골디 편이 아니라는 걸 보여 줘야 할걸.', { face: 'normal' });
      c.flag('c4_pika'); c.bond('pika', 1);
      c.quest('sparrow', 'on');
      await c.say(n, '…그리고 부탁 하나. 애들 먹을 거. 음식 세 개만. 옥수수빵이든 떡볶이든. 훔친 거 말고, 네가 준 걸로 먹이고 싶어.', { face: 'blush' });
      c.lock(false);
      return;
    }
    const q = S().quests.sparrow;
    if (q && q.st === 'on') {
      const have = (S().inv.food_corn || 0) + (S().inv.food_tteok || 0) + (S().inv.food_udon || 0);
      if (have >= 3) {
        let left = 3; for (const id of ['food_corn', 'food_tteok', 'food_udon']) while (left > 0 && S().inv[id]) { c.take(id); left--; }
        c.quest('sparrow', 'done'); c.bond('pika', 2);
        await c.say(n, '…고마워. 진짜로. 애들이 오늘은 싸우지 않고 먹었어.', { face: 'cry' });
        await c.say(n, '이거 받아. 지붕 위에서 주운 거야. 훔친 거 아니야! …아마도.', { face: 'blush' });
        await c.getItem('heartpiece');
        return;
      }
      await c.say(n, '음식 세 개. 대바자르에서 팔아. 옥수수빵이 제일 싸.', { face: 'normal' });
      return;
    }
    await c.say(n, ST.lines({ c4: '참새들은 금화왕 궁 지붕 위를 다 알아. 필요하면 말해.', c6: '천년제에 흰빛이 터졌다며? 애들이 네 흉내를 내. 「렙업! 번쩍!」', c10: '요즘 탑들이 조용해. 애들 머리가… 조금 돌아왔어.' }), { face: 'smile' });
  } });
  G.data.QUESTS.sparrow = { id: 'sparrow', name: '참새들의 저녁', who: '피카', desc: '그늘 골목 아이들에게 음식 세 개를 가져다준다. (옥수수빵 · 떡볶이 · 우동)', after: '아이들이 싸우지 않고 먹었다.' };
  ST.folk('y_alley', { name: '참새단 꼬마', folk: 'kid', x: 3, y: 5, lines: { c4: ['피카 누나는 우리 대장이야. 훔치는 건 나쁜데, 누나는 안 나빠.', '머리가 하얘지면 빛이 없는 거래. 나 아직 반은 검어!'] } });
  ST.folk('y_alley', { name: '참새단 꼬마', folk: 'kidg', x: 5, y: 6, lines: { c4: () => '흰빛 ' + (S().gender === 'girl' ? '언니' : '오빠') + '? 진짜 하얘? 만져 봐도 돼?' } });

  /* ───────── 야나 (오아시스) ───────── */
  ST.person('world', { id: 'yana', ...OW.pt(274, 128), dir: 'down', when: () => !f('c4_yana'), mark: () => (f('c4_pika') ? '!' : null), talk: async (c, n) => {
    c.flag('met:yana');
    if (!f('c4_pika')) { await c.say(n, '길잡이가 필요해? 값은 비싸. 금화왕 돈이면 두 배.', { face: 'smirk' }); return; }
    c.lock(true);
    await c.say(n, '피카가 보냈다고? 그 녀석 소개면 들어는 줄게. …태양 피라미드? 골디 심부름이구나.', { face: 'angry' });
    await c.say(n, '내 마을은 모래바다 한가운데 있었어. 「주황 우물」. 골디가 우물의 빛을 샀어. 빛이 빠진 우물은 모래가 돼. 마을도.', { face: 'sad' });
    const k = await c.choice('야나의 귀가 뒤로 젖혀져 있다.', [
      { t: '태양의 눈은 골디에게 안 줄 거야. 약속해.', tag: 'dawn' },
      { t: '거래는 거래야. 대신 네 마을 일도 골디에게 따져 볼게.', tag: 'order' },
      { t: '가져온 뒤에 어떻게 할지는… 둘만 아는 걸로 하자.', tag: 'night' },
    ]);
    c.route(['dawn', 'order', 'night'][k], 1);
    await c.say(n, ['…흥. 약속은 모래처럼 흘러. 그래도 네 눈은 거짓말 안 하는 눈이네.', '따진다고? 골디한테? 하, 재밌겠다. 그 얼굴 보러라도 가 줄게.', '둘만 아는 거? …좋아. 사막은 비밀을 좋아해.'][k], { face: ['smirk', 'smile', 'blush'][k] });
    await c.say(n, '따라와. 모래 폭풍은 별을 보고 건너야 해. 내가 별을 다 외우거든.', { face: 'smile' });
    c.flag('c4_yana'); c.bond('yana', 1);
    ST.join('yana');
    c.lock(false);
    c.journal('오아시스에서 길잡이 야나를 만났다. 여우 귀. 골디에게 마을의 빛을 빼앗겼다. 함께 모래바다를 건넌다.');
  } });

  /* ───────── 거래의 끝: 태양의 눈 ───────── */
  G.data.ITEMS.sun_eye = { id: 'sun_eye', type: 'key', name: '태양의 눈', big: true, desc: '빛을 한 점에 모으는 황금 렌즈. 들여다보면 눈이 아프다. 속에서 누군가 배고파하는 소리가 난다.' };
  async function goldyEye(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '가져왔군. 어디 보자… 아름답군. 빛을 한 점에 모으는 렌즈. 탑 백 개 값이다.', { face: 'smile' });
    await c.say('yana', '…골디.', { face: 'angry' });
    await c.say(n, '주황 우물의 여우구나. 네 마을 빛은 공정한 값에 샀다. 네 할아버지가 서명했지.', { face: 'normal' });
    const k = await c.choice('태양의 눈을 쥔 손이 뜨겁다. 렌즈 속에서 무언가가 배고프다고 속삭인다.', [
      { t: '렌즈를 바닥에 내리쳐 깬다', tag: 'dawn', sub: '「빛은 팔 물건이 아니다.」 거래는 깨진다.' },
      { t: '약속대로 넘긴다. 대신 주황 우물의 빛값을 다시 매기라고 요구한다', tag: 'order', sub: '거래는 지킨다. 그 안에서 싸운다.' },
      { t: '렌즈를 야나에게 몰래 넘기고, 골디에게는 「피라미드에서 부서졌다」고 한다', tag: 'night', sub: '거짓말에도 값이 있다. 골디는 셈이 빠르다.' },
    ]);
    c.take('sun_eye');
    if (k === 0) {
      c.route('dawn', 2); c.flag('c4_route', 'dawn');
      c.sfx('explode'); c.flash('#ffe8a8', 0.5); c.shake(4, 0.4); G.fx.shards(G.world.player.x, G.world.player.y - 10, 30, '#e8c048');
      await c.say(n, '………', { face: 'shock' });
      await c.say(n, '하. 하하하하! 탑 백 개 값을 바닥에! 흰빛, 너 진짜 셈을 못 하는구나!', { face: 'happy' });
      await c.say(n, '…좋아. 셈 못 하는 놈한테는 이자를 못 받지. 통행 허가는 주마. 대신 다음엔 비싸게 받는다.', { face: 'smirk' });
    } else if (k === 1) {
      c.route('order', 2); c.flag('c4_route', 'order');
      await c.say(n, '재평가? 계약서에 그런 조항은… 있군. 제12조, 「현저한 사정 변경」. 누가 이런 걸 넣었지? 아, 나구나.', { face: 'think' });
      await c.say(n, '좋다. 주황 우물의 빛값, 다시 매기지. 모래가 된 우물이 다시 물을 낼 만큼. …장사꾼은 약속을 지키는 게 장사다.', { face: 'closed' });
      await c.say('yana', '……진짜로?', { face: 'shock' });
      c.bond('yana', 1); c.flag('yana_well');
    } else {
      c.route('night', 2); c.flag('c4_route', 'night');
      await c.say(n, '부서졌다고. 흐음.', { face: 'smirk' });
      await c.say(n, '여우 꼬리가 방금 흔들렸어. 거짓말엔 값이 있다, 흰빛. 금화 오천. 선불.', { face: 'smile' });
      const pay = Math.min(S().gold, 5000); S().gold -= pay; c.sfx('coin');
      await c.say(n, '받았다. 이제 그 렌즈는 「부서진」 거다. 장부에 그렇게 적지. …여우야, 우물에 잘 묻어라.', { face: 'closed' });
      c.flag('yana_well'); c.bond('yana', 2);
    }
    await c.say(n, '약속한 두 번째. 세린.', { face: 'closed' });
    c.music('mother');
    await c.say(n, '17년 전 그늘 골목. 나는 이자 받으러 가는 길이었다. 흰 옷 입은 여자가 골목 아이들한테 렙업 빛을 나눠 주고 있더군. 공짜로.', { face: 'sad' });
    await c.say(n, '「그러다 네가 먼저 말라 죽는다」고 했더니 뭐라는 줄 아나. 「안 말라요. 저는 나눌수록 닫혀요.」', { face: 'closed' });
    await c.say(n, '…나도 그 골목 출신이다. 어릴 때 내 빛을 팔아서 끼니를 이었지. 그날 처음으로, 누가 공짜로 주는 걸 봤다. 기분 나빴다. 아주 많이.', { face: 'sad' });
    await c.say(n, '가라. 퍼플 통행 허가다. 그리고 사천왕 회의가 곧 열린다. 카이론이 흑점 이야기를 할 거라더군. 네 이름도 나올 거다.', { face: 'normal' });
    c.flag('c4_eye'); c.flag('c4_done'); c.flag('open:purple'); c.exp(80);
    await c.cinema(false);
    c.lock(false);
    c.flag('c4p_' + k);
    c.journal(k === 0 ? '태양의 눈을 골디 앞에서 깨뜨렸다. 골디가 웃었다. 퍼플 통행 허가를 받았다.' : k === 1 ? '태양의 눈을 골디에게 넘기고 주황 우물의 빛값을 다시 매기게 했다.' : '태양의 눈을 야나에게 몰래 넘겼다. 골디는 알면서 금화 오천에 눈감아 주었다.');
    await c.say('yana', ST.route() === 'night' || k === 2 ? '…고마워. 이건 평생 갚을게. 사막 여우는 빚을 잊지 않아.' : '고마워. 여기서 헤어지자. 나는 모래바다로 돌아가. 필요하면 오아시스로 와.', { face: 'smile' });
    ST.leave('yana');
    const b = buddy();
    if (b === 'cassian') await c.say('cassian', '나는 천년성으로 돌아가 보고해야 한다. …감찰 보고서에 「흰빛: 위험 요소 아님」이라고 적겠다. 아직은.', { face: 'smile' });
    else if (b === 'rud') await c.say('rud', '나는 누나한테 돌아갈게. 옐로 장부, 누나가 좋아할 거야. 또 보자, 흰빛.', { face: 'smile' });
    else await c.say('lyra', '저는 여기서 잠깐 노래하고 갈게요. 퍼플에서 봐요. 거긴… 제 노래를 싫어하는 사람이 있어요.', { face: 'smirk' });
    ST.leave(b, true);
  }

  /* 주사위 도박 (황금궁) */
  async function dice(c, n) {
    const bet = await c.choice('얼마를 걸겠나? 크다(4~6) · 작다(1~3)를 맞히면 두 배.', ['금화 50', '금화 200', '금화 1000', '안 한다'], { who: 'goldy', name: '금화왕 골디' });
    if (bet === 3) return;
    const amt = [50, 200, 1000][bet];
    if (S().gold < amt) { await c.say(n, '돈이 모자라군. 외상은 이자 삼십 퍼센트.', { face: 'smirk' }); return; }
    const hi = (await c.choice(null, ['크다', '작다'])) === 0;
    const roll = 1 + Math.floor(Math.random() * 6);
    c.sfx('rumble'); await c.wait(0.6);
    const win = (roll >= 4) === hi;
    await c.say(null, '주사위: [y]' + roll + '[/]', { style: 'sys' });
    if (win) { c.gold(amt); await c.say(n, '…운이 좋군. 흰빛은 주사위도 하얗게 만드나.', { face: 'shock' }); S().diceWins = (S().diceWins || 0) + 1; if (S().diceWins === 5 && !f('dice_heart')) { c.flag('dice_heart'); await c.say(n, '다섯 번째 승리. 이런 날도 있어야 손님이 오지. 상품이다.', { face: 'smile' }); await c.getItem('heartpiece'); } }
    else { S().gold -= amt; c.sfx('buzz'); await c.say(n, '고마워. 공짜는 없어.', { face: 'smile' }); }
  }

  /* ───────── 주민 ───────── */
  ST.folk('y_shop', { name: '대바자르 상인', folk: 'merchant', x: 5, y: 3, lines: { c4: async (c) => { const k = await c.choice('무엇이든 팝니다! 빛만 빼고! …아니, 빛도 팝니다.', ['물건을 산다', '괜찮아요'], { name: '대바자르 상인' }); if (k === 0) await c.shop('yellow'); } } });
  ST.folk('y_inn', { name: '낙타 쉼터 주인', folk: 'merchantw', x: 4, y: 3, lines: { c4: async (c, n) => { const k = await c.choice('모래바다 앞 마지막 쉼터예요. (40골드)', ['쉰다', '괜찮아요'], { name: '낙타 쉼터 주인' }); if (k === 0) { if (S().gold >= 40) c.gold(-40); await c.rest(); } } } });
  ST.folk('world', { name: '향신료 상인', folk: 'merchant', x: X0 + 11, y: Y0 + 12, lines: { c4: ['후추 한 알에 금화 하나. 빛 한 줌에 금화 백. 사람 하나에는… 모르지, 골디 님이 정하시겠지.', '사막 도깨비불은 얼음에 약해. 퍼플 마법사들한테 얼음창을 배우면 좋지.'] } });
  ST.folk('world', { name: '사막 대상단장 사하라', folk: 'merchantw', x: X0 + 27, y: Y0 + 12, lines: { c4: ['모래 벌레는 발소리를 듣고 와. 멈춰 서면 헷갈려하지. 솟아오를 때 옆으로 굴러!', '태양 피라미드의 스핑크스는 수수께끼를 내고, 맞혀도 싸운대. 공짜가 없는 동네답지.'] } });
  ST.folk('world', { name: '황금궁 경비', folk: 'guard', x: X0 + 19, y: Y0 + 7, dir: 'down', lines: { c4: ['금화왕 님은 바쁘시다. 시간도 금이니까.'] } });
  ST.folk('world', { name: '빛을 판 남자', folk: 'oldm', x: X0 + 6, y: Y0 + 12, wander: 8, lines: { c4: ['젊을 때 이자 갚느라 빛을 팔았지. 그 뒤로 렙업을 한 번도 못 했어. 빛 없는 렙업은… 소리가 안 나.'], c10: '요즘 탑이 조용해지니까, 어젯밤 렙업을 했어. 사십 년 만에. 초록빛이 아주 조금.' } });
  ST.folk('world', { name: '카지노 손님', folk: 'nightm', x: X0 + 16, y: Y0 + 8, lines: { c4: ['주사위는 다섯 번 이기면 골디가 상을 준대. 아무도 다섯 번은 못 이겼지만.'] } });

  // 블루 요양원의 노아 (4장부터)
  ST.person('b_hosp', { id: 'noah', x: 5, y: 4, dir: 'down', state: 'sit', when: () => ST.after('c4') && !f('noah_to_white'), talk: async (c, n) => {
    c.flag('met:noah');
    await c.say(n, ST.lines({ c4: f('hero_shared') ? '형아' + (S().gender === 'girl' ? '… 누나' : '') + '! 나 여기 블루 요양원으로 왔어. 바다 냄새 좋아. 손끝은 아직 따뜻해.' : '형아' + (S().gender === 'girl' ? '… 누나' : '') + '! 나 여기로 옮겼어. 의사 선생님이 빛을 조금씩 먹여 줘. 쓴맛이야.', c6: '천년제 불꽃, 창문으로 봤어. 한가운데 하얀 빛. 그거 형아' + (S().gender === 'girl' ? '… 누나' : '') + '지?' }), { face: 'smile' });
  } });

  /* ───────── 빛 씨앗 (옐로) ───────── */
  ST.seed('y1', 'world', ...OW.P(282, 126), { under: true });
  ST.seed('y2', 'world', ...OW.P(240, 160), {});
  ST.seed('y3', 'world', ...OW.P(300, 150), { under: true });
  ST.seed('y4', 'world', PYR.x + 11, PYR.y + 1, {});
  ST.seed('y5', 'world', ...OW.P(262, 176), {});
  OW.hooks.push((m) => { m.obj[m.i(...OW.P(282, 126))] = O.ROCK; m.obj[m.i(...OW.P(300, 150))] = O.CACTUS; for (const [x, y] of [[240, 160], [262, 176]].map(([a, b]) => OW.P(a, b))) m.obj[m.i(x, y)] = 0; });

  /* ═════════ 태양 피라미드 (던전 4) ═════════ */
  G.dungeon.def('d4', {
    name: '태양 피라미드', sub: '답을 맞혀도 싸워야 하는 곳', pal: 'yellow', music: 'cave', tier: 3, floor: T.SAND, dark: 0.3,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: PYR.x + 5, ty: PYR.y + 3 },
    rooms: {
      '1,3': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 6, { text: '「불을 넷 켜면 길이 열린다. 태양은 네 번 뜬다.」' }], ['pot', 2, 11], ['pot', 17, 11]], foes: [['worm', 6, 8], ['worm', 13, 8]] },
      '1,2': { solve: { type: 'torches', flag: 'd4:torch', msg: '북쪽에서 돌문이 올라가는 소리' }, props: [['torch', 4, 4], ['torch', 15, 4], ['torch', 4, 10], ['torch', 15, 10], ['sign', 9, 7, { text: '「불꽃이 없으면 태양도 없다」 (화염구 · 불화살 · 불꽃검)' }]], foes: [['wisp', 9, 5]] },
      '0,2': { solve: { type: 'clear', msg: '상자가 나타났다' }, props: [['chest', 9, 6, { item: 'key_small', hidden: true }], ['torch', 3, 3, { lit: true }]], foes: [['bandit', 5, 8], ['bandit', 14, 8], ['worm', 9, 10]] },
      '2,2': { props: [['chest', 9, 4, { item: 'sh_mirror', col: '#e8c048' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 10, { text: '「빛은 거울에 튕겨 돌아간다」' }]], foes: [['turret', 4, 9], ['turret', 15, 9]] },
      '2,1': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'key_big', big: true, hidden: true }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]], foes: [['turret', 9, 3], ['crab', 5, 9], ['crab', 14, 9], ['wisp', 9, 10]] },
      '1,1': { props: [['crystal', 9, 7], ['cblock', 8, 3], ['cblock', 11, 3], ['cblock', 9, 11, { blue: false }], ['cblock', 10, 11, { blue: false }], ['chest', 16, 3, { item: 'compass' }], ['chest', 3, 3, { item: 'map_d' }], ['post', 3, 10]], ter: [['pit', 12, 8, 6, 4]], foes: [['mage', 14, 6]] },
      '0,1': { props: [['chest', 9, 6, { item: 'heartpiece' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]], foes: [['golem', 9, 9, { hpMul: 0.5 }]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'sphinx' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd4:torch'], ['2,2', '2,1', 'open'], ['1,1', '0,1', 'bomb'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: PYR.x + 5, toy: PYR.y + 4 });
      if (f('d4:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d4:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 9) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: 'd4:heart' }));
        G.world.add(out());
        c.music('cave');
        await c.narr('스핑크스가 무너진 자리에 황금 렌즈가 떨어져 있다. 들여다보자 눈이 시리다. 렌즈 속 깊은 곳에서, 무언가가 작게 속삭인다.\n[r]……배고파……[/]');
        await c.getItem('sun_eye');
        await c.say('yana', '…그거, 오래 들여다보지 마. 사막 사람들은 그걸 「굶주린 해」라고 불러.', { face: 'sad' });
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d4:intro')) {
          c.flag('d4:intro');
          await c.say('toria', '찍… 커다란 고양이…?', { face: 'shock' });
          await c.say(null, '「묻겠다, 작은 흰빛. 모든 것을 비추되 스스로는 보지 못하는 것은?」', { style: 'narr' });
          const k = await c.choice(null, ['거울', '태양', '눈']);
          await c.say(null, k === 2 ? '「…맞다. 눈이다. 그러나 답을 맞혀도, 싸워야 한다.」' : '「틀렸다. 그러나 맞혔어도, 싸워야 했다.」', { style: 'narr' });
          if (k === 2) c.exp(30);
          await c.cutin({ who: 'yana', title: '스핑크스', small: '태양 피라미드의 수호자', sub: '눈빛은 거울 방패로 되받아쳐라!', col: '#e8c048', face: 'angry', sec: 1.8 });
        }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
      }); };
    },
  });
})();
