/* 제3장 「파도와 지혜」 — 블루 항구 · 대도서관 · 등대 · 해저 동굴
   옥타비오 관장과 금서고(수수께끼 셋) → 루체의 등대와 물갈퀴 → 해저 동굴(갈고리 · 새끼 크라켄)
   → 항구에서 카시안과 결투 → 세 척의 배: 어느 배를 타느냐로 첫 번째 길이 굳는다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const BT = OW.towns.blue, X0 = BT.x, Y0 = BT.y;     // 160, 204
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const LH = { x: X0 + 38, y: Y0 + 10 };               // 등대
  const CAVE = OW.pt(146, 222);                      // 해저 동굴 입구 (바다 쪽)
  ST.BLUE = { X0, Y0, LH, CAVE };

  ST.CH.push({ no: '제3장', id: 'c3', title: '파도와 지혜', sub: '책장이 파도처럼 넘어가는 항구. 엄마가 찾던 것이 금서고 깊은 곳에 잠들어 있다.',
    goal(s) {
      if (!f('c3_octavio')) return { text: '블루 대도서관의 옥타비오 관장을 찾아가자.', map: 'world', x: X0 + 18, y: Y0 + 6 };
      if (!f('c3_archive')) return f('c3_riddles') ? { text: '수수께끼를 다 풀었다. 뒤쪽 책장의 세 번째 책을 당겨 금서고로.', map: 'b_lib', x: 15, y: 7 } : { text: '사서 헤미아의 수수께끼 셋을 풀고 금서고에 들어가자.', map: 'b_lib', x: 4, y: 4 };
      if (!f('c3_luce')) return { text: '동쪽 등대의 루체가 무언가를 알고 있다고 한다.', map: 'world', x: LH.x, y: LH.y };
      if (!f('d3:boss')) return { text: '물갈퀴로 헤엄쳐 서쪽 바다 동굴로. 루체 아버지의 나침반이 거기 있다.', map: 'world', x: CAVE.x, y: CAVE.y };
      if (!f('c3_luce_done')) return { text: '루체에게 나침반을 돌려주자.', map: 'world', x: LH.x, y: LH.y };
      if (!f('c3_duel')) return { text: '항구 부두로. 누군가 기다리고 있다.', map: 'world', x: X0 + 18, y: Y0 + 20 };
      return { text: '부두에서 배를 고르자. 어느 배를 타느냐가 앞으로의 길을 정한다.', map: 'world', x: X0 + 18, y: Y0 + 20 };
    } });

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'b_lib', region: 'blue', style: 'blue', tx: X0 + 14, ty: Y0 + 1, w: 9, h: 5, name: '블루 대도서관', sign: 'book',
      room: { w: 20, h: 13, floor: T.TILE, music: 'calm', rug: [7, 5, 6, 6], furn: [
        ['shelf', 2, 2], ['shelf', 4, 2], ['shelf', 6, 2], ['shelf', 13, 2], ['shelf', 15, 2], ['shelf', 17, 2],
        ['shelf', 2, 6], ['shelf', 4, 6], ['shelf', 15, 6], ['shelf', 17, 6],
        ['desk', 9, 3, { text: '관장의 책상. 다리 여덟 개가 동시에 쓸 수 있게 펜이 여덟 자루.' }], ['bookpile', 7, 9], ['bookpile', 12, 9], ['plant', 1, 10], ['plant', 18, 10], ['lamp', 8, 6], ['lamp', 11, 6]] } });
    ST.house(m, { id: 'b_shop', region: 'blue', style: 'blue', tx: X0 + 3, ty: Y0 + 3, w: 5, h: 4, name: '파도 잡화점', sign: 'shop',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'calm', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['barrel', 2, 6], ['barrel', 3, 6], ['crate', 9, 6]] } });
    ST.house(m, { id: 'b_inn', region: 'blue', style: 'blue', tx: X0 + 26, ty: Y0 + 3, w: 7, h: 4, name: '선창 쉼터 「갈매기」', sign: 'inn',
      room: { w: 15, h: 10, floor: T.WOOD, music: 'calm', rug: [5, 5, 5, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 9, 5], ['chair', 8, 6], ['chair', 11, 6], ['barrel', 12, 2], ['barrel', 13, 2], ['bed2', 13, 6, { v: '#5a8ad8' }]] } });
    ST.house(m, { id: 'b_hosp', region: 'blue', style: 'blue', tx: X0 + 3, ty: Y0 + 12, w: 7, h: 4, name: '블루 요양원', sign: 'church',
      room: { w: 15, h: 10, floor: T.TILE, music: 'sad', furn: [['bed2', 2, 3, { v: '#e8e8f0' }], ['bed2', 5, 3, { v: '#e8e8f0' }], ['bed2', 8, 3, { v: '#e8e8f0' }], ['bed2', 11, 3, { v: '#e8e8f0' }], ['plant', 1, 7], ['desk', 12, 6], ['window', 7, 1, { wall: true }]] } });
    ST.house(m, { id: 'b_nord', region: 'blue', style: 'blue', tx: X0 + 27, ty: Y0 + 12, w: 5, h: 4, name: '노르드 영감네',
      room: { w: 11, h: 9, floor: T.WOOD, music: 'calm', furn: [['bed2', 2, 3, { v: '#4a6a9a' }], ['table', 6, 5], ['barrel', 9, 3], ['painting', 5, 1, { wall: true, v: '#3a6ab8', text: '폭풍 속 배 그림. 구석에 작게 「983 겨울」.' }]] } });
    // 등대 (동쪽 곶)
    OW.clear(m, LH.x - 3, LH.y - 3, 7, 7, 0, T.GRASS);
    G.build.placeBuilding(m, { special: 'lighthouse', tx: LH.x - 1, ty: LH.y - 1, w: 3, h: 2, to: 'b_light', id: 'b_lighthouse', lit: f('c3_luce_done') });
    G.build.def('b_light', { build() { const rm = G.build.room({ id: 'b_light', region: 'blue', name: '등대', w: 11, h: 11, floor: T.WOOD, music: 'blue', back: ['world', Math.floor(((LH.x - 1) * TS + 24) / TS), LH.y + 1], furn: [['desk', 3, 3, { text: '낡은 항해 도구들. 나침반이 들어 있던 자리만 비어 있다.' }], ['shelf', 8, 2], ['telescope', 8, 6, { text: '망원경. 서쪽 바다 동굴 입구가 보인다.' }], ['barrel', 2, 8], ['bed2', 1, 4, { v: '#e8c048' }]] }); return rm; } });
    // 부두: 만(灣) 쪽으로 다리를 낸다
    for (let y = Y0 + 20; y < Y0 + 30; y++) for (const x of [X0 + 17, X0 + 18]) { const i = m.i(x, y); if (m.inb(x, y) && (m.ter[i] === T.DEEP || m.ter[i] === T.WATER || m.ter[i] === T.SAND)) { m.ter[i] = T.BRIDGE; m.obj[i] = 0; } }
    for (let x = X0 + 12; x < X0 + 24; x++) { const i = m.i(x, Y0 + 26); if (m.ter[i] === T.DEEP || m.ter[i] === T.WATER) m.ter[i] = T.BRIDGE; }
    // 넓어진 대륙에서 물가가 부두 머리보다 위로 올라왔다: 뭍에 닿을 때까지 다리를 잇는다
    for (let y = Y0 + 19; y > Y0 + 8; y--) { let any = false; for (const x of [X0 + 17, X0 + 18]) { const i = m.i(x, y); if (m.ter[i] === T.DEEP || m.ter[i] === T.WATER) { m.ter[i] = T.BRIDGE; m.obj[i] = 0; m.hgt[i] = 0; any = true; } } if (!any) break; }
    // 해저 동굴: 서쪽 해안 절벽, 입구 앞은 깊은 물
    const cx = CAVE.x, cy = CAVE.y;
    for (let y = cy - 6; y <= cy; y++) for (let x = cx - 5; x <= cx + 6; x++) { if (!m.inb(x, y)) continue; const i = m.i(x, y); m.hgt[i] = 1; m.ter[i] = T.GRASS; m.obj[i] = (x + y) % 3 === 0 ? O.PALM : 0; }
    G.gen.caveMouth(m, cx, cy, 2);
    for (const x of [cx, cx + 1]) m.hgt[m.i(x, cy)] = 0;   // 입구는 물높이에: 언덕 위에 두면 앞 물칸이 절벽 면이 된다
    for (let y = cy + 1; y <= cy + 4; y++) for (let x = cx - 3; x <= cx + 4; x++) { if (!m.inb(x, y)) continue; const i = m.i(x, y); m.hgt[i] = 0; m.ter[i] = y === cy + 1 && (x === cx || x === cx + 1) ? T.WATER : T.DEEP; m.obj[i] = 0; }
    G.build.placeBuilding(m, { special: 'cave', tx: cx, ty: cy, w: 2, h: 1, to: 'd3', id: 'd3_gate', col: '#566a72' });
    // 마을 꾸미기
    for (const [dx, dy] of [[12, 8], [24, 8], [12, 17], [24, 17]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 50, warm: 'rgba(200,220,255,0.18)' }); }
    for (const [dx, dy] of [[1, 10], [34, 2], [34, 18], [0, 20]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.PALM;
  });

  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(BT.plaza.x + 3), y: py(BT.plaza.y - 3), wid: 'w_blue', name: '블루 항구' }));
    Wd.add(new P.Sign({ x: px(X0 + 17), y: py(Y0 + 19), text: '블루 항구 부두\n「고등어호」 — 옐로 연안 · 알록달록 곶 (운항 중단)' }));
    Wd.add(new P.Sign({ x: px(LH.x - 3), y: py(LH.y + 3), text: '블루 등대\n「불이 꺼진 지 16년. 루체가 지킨다.」' }));
    // 배 세 척 (결투 뒤)
    spawnBoats(Wd);
  });
  /** 부두의 배 세 척: 결투가 끝난 바로 그 자리에서도, 다시 들어와도 */
  function spawnBoats(Wd) {
    const P = G.props;
    if (f('c3_duel') && !f('c3_boat') && !Wd.ents.some((e) => e.boatRoute && !e.dead)) {
      const boat = (x, y, col, name, route, cid) => { const n = new P.NPC({ x: px(x), y: py(y), look: cid ? G.cast.get(cid).look : G.cast.folk('sailor'), name, cid, dir: 'up', talk: (c) => boatChoice(c, route), mark: () => '!' }); n.boatRoute = route; Wd.add(n); Wd.add(new G.build.Decor({ decor: 'crate', x: px(x), y: py(y + 2) + 4 })); };
      boat(X0 + 14, Y0 + 26, '#ff7a4a', '레아', 'dawn', 'lea');
      boat(X0 + 18, Y0 + 28, '#9ab8e8', '가브 선장', 'order', 'gab');
      boat(X0 + 22, Y0 + 26, '#b87aff', '리라', 'night', 'lyra');
    }
  }

  /* ───────── 제3장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c2_done') || f('ch:c3')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'blue') return;
    S().flags['ch:c3'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c3');
      await c.say('toria', '바다다! 찍! 바다 냄새! 짭짤해!', { face: 'happy' });
      await c.say('toria', '대도서관이 저 큰 건물이야. 문어 관장님… 진짜 문어일까?', { face: 'think' });
      c.lock(false);
    });
  });

  /* ───────── 도서관 ───────── */
  ST.person('b_lib', { id: 'octavio', x: 9, y: 5, dir: 'down', mark: () => (!f('c3_octavio') ? '!' : null), talk: async (c, n) => {
    c.flag('met:octavio');
    if (!f('c3_octavio')) {
      c.lock(true);
      await c.say(n, '어서 오게, 어서 와. 발소리가 가볍군. 레벨이… 어디 보자. 흠. 흠흠?', { face: 'think' });
      await c.say('toria', '찍! 진짜 문어다! 안경 썼어!', { face: 'shock' });
      await c.say(n, '문어가 안경을 쓰면 안 된다는 법은 없지. 대도서관장 옥타비오일세. 볼칸이 전서를 보냈더군. 「망치 소리 없는 녀석이 간다.」', { face: 'smile' });
      await c.say(n, '…자네 어머니. 세린 말일세. 17년 전 여기 왔었네. 한 달을 금서고에서 살았지.', { face: 'sad' });
      await c.say(n, '「그릇」에 관한 책을 찾았네. 흰빛의 그릇. 채워지지 않는 그릇. 그리고 떠나면서 이렇게 말했지. 「답을 찾았어요. 마음에 안 들지만.」');
      await c.say(n, '금서고 열쇠는 사서 헤미아가 가지고 있네. 그 아이는 수수께끼를 좋아해. 셋을 맞히면 열어 줄 걸세. 규칙이거든.', { face: 'smile' });
      c.flag('c3_octavio'); c.lock(false);
      return;
    }
    if (f('c3_archive') && !f('c3_oct2')) {
      c.flag('c3_oct2');
      await c.say(n, '읽었군. 표정을 보니. …그 책의 뒷장은 찢겨 있었지? 세린이 찢어 갔네. 「이 뒤는 아이가 읽으면 안 돼요」 하면서.', { face: 'sad' });
      await c.say(n, '동쪽 등대의 루체를 찾아가 보게. 그 아이 아버지의 항해일지에 983년 겨울 이야기가 있다더군. 자네 어머니가 하늘로 간 해일세.');
      return;
    }
    await c.say(n, ST.lines({ c3: ['책은 파도와 같아. 한 번에 다 오지 않고, 여러 번 밀려오지.', '다리 여덟 개로 책 여덟 권을 동시에 읽는다네. 그래서 늘 결말이 섞여.'], c6: '천년제에서 흰빛이 터졌다지? 도서관에 새 장(章)이 생기겠구먼.', c9: '밤의 성 이야기를 들었네. 조심하게. 기록이 없는 곳은 거짓이 자라기 좋은 곳이야.' }));
  } });
  ST.person('b_lib', { id: 'hemia', x: 4, y: 4, dir: 'down', mark: () => (f('c3_octavio') && !f('c3_archive') ? '!' : null), talk: async (c, n) => {
    c.flag('met:hemia');
    if (!f('c3_octavio')) { await c.say(n, '어, 어서 오세요. 조, 조용히… 책들이 자고 있어요.', { face: 'blush' }); return; }
    if (!f('c3_archive')) { await riddles(c, n); return; }
    await c.say(n, ST.lines({ c3: ['그, 금서고에서 뭘 읽었는지는 묻지 않을게요. 사서의 규칙이에요.', '수, 수수께끼 하나 더 할래요? …아, 아니에요. 다음에.'], c5: '퍼플의 비올라? 아, 알아요. 편지로 수수께끼 대결 중이에요. 제가 지고 있어요…' }), { face: 'blush' });
  } });
  async function riddles(c, n) {
    c.lock(true);
    await c.say(n, '그, 금서고요? 관장님이 허락하셨으면… 규칙대로 해요. 수, 수수께끼 셋.', { face: 'blush' });
    const Q = [
      ['첫 번째. 「색이 다섯인데, 하나로 셀 수 있는 것은?」', ['무지개', '빛', '구슬', '사람'], 1, '힌트: 다섯 빛깔을 합치면… 흰색이 되죠.'],
      ['두 번째. 「세면 셀수록 줄어드는 것은?」', ['금화', '경험', '남은 날', '별'], 2, '힌트: 벽에 빗금을 긋는 사람들이 세는 거요.'],
      ['세 번째. 「채울수록 넓어지는 것은?」', ['주머니', '그릇', '바다', '장부'], 1, '힌트: 흰빛에 관한 책들이 제일 많이 쓰는 낱말이에요.'],
    ];
    for (const [q, opts, ans, hint] of Q) {
      for (;;) {
        const k = await c.choice(q, opts, { who: 'hemia', name: '헤미아' });
        if (k === ans) { c.sfx('clickspot'); await c.say(n, '저, 정답이에요!', { face: 'happy' }); break; }
        c.sfx('buzz'); await c.say(n, '틀, 틀렸어요. ' + hint, { face: 'sad' });
      }
    }
    await c.say(n, '셋 다… 세린 씨도 셋 다 맞혔어요. 17년 전에. 제가 여, 열 살 때요.', { face: 'blush' });
    await c.say(n, '금서고는 저 뒤 책장이에요. 세 번째 책을 당기면 열려요.');
    c.flag('c3_riddles'); c.lock(false);
  }
  ST.onMap('b_lib', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Spot({ x: px(15), y: py(7), reach: 16, verb: f('c3_riddles') ? '세 번째 책을 당긴다' : '책장을 본다', text: async (c) => {
      if (!f('c3_riddles')) { await c.say(null, '두꺼운 책들. 한 권만 유난히 손때가 묻었다. 당겨 보려 해도 꿈쩍 않는다.', { style: 'sys' }); return; }
      await archive(c);
    } }));
    Wd.add(new P.Spot({ x: px(3), y: py(7), verb: '책을 읽는다', text: async (c) => { c.book('b_green'); await c.narr('「그린 마을 연대기」. 983년 항목에 누군가 연필로 적었다. 「진 게 아니라 져 준 것」.'); } }));
  });
  async function archive(c) {
    c.lock(true);
    await c.cinema(true);
    c.sfx('rumble'); c.shake(2, 0.6);
    await c.narr('책장이 안쪽으로 밀려나며 좁은 계단이 드러난다. 먼지 냄새. 촛불 하나가 저절로 켜진다.');
    c.music('dream');
    await c.narr('금서고. 사방이 제목 없는 책이다. 맨 아래 칸에, 서명만 있는 얇은 책 한 권.');
    c.truth('t_five');
    for (const l of G.data.TRUTHS.t_five.long) await c.narr(l);
    await c.narr('마지막 장은 찢겨 나갔다. 찢긴 자리에 연필 자국. 둥글고 작은 글씨.\n[w]「이 뒤는 아이가 읽으면 안 돼요. — S」[/]');
    await c.say('toria', '찍… 「S」. 참나무에도 「S」가 있었어.', { face: 'sad' });
    c.flag('c3_archive'); c.exp(40);
    await c.cinema(false);
    c.lock(false);
    c.journal('블루 금서고에서 아우룸의 고백을 읽었다. 다섯 빛깔은 거짓이다. 흰빛이 모이면 하늘의 무언가가 눈을 뜬다.');
  }

  /* ───────── 등대 · 루체 ───────── */
  ST.person('b_light', { id: 'luce', x: 5, y: 5, dir: 'down', mark: () => (f('c3_archive') && !f('c3_luce') ? '!' : f('d3:boss') && !f('c3_luce_done') ? '!' : null), talk: async (c, n) => {
    c.flag('met:luce');
    if (!f('c3_luce')) {
      if (!f('c3_archive')) { await c.say(n, '등대는 16년째 불이 꺼져 있어. 아빠가 돌아오면 켤 거야.', { face: 'sad' }); return; }
      c.lock(true);
      await c.say(n, '항해일지? …관장님이 보냈구나. 983년 겨울 이야기.', { face: 'sad' });
      await c.say(n, '아빠는 그날 밤 하늘에서 흰 줄기가 떨어지는 걸 봤대. 그걸 적고, 그다음 봄에 서쪽 바다 동굴에 들어갔다가… 안 나왔어.', { face: 'sad' });
      await c.say(n, '일지는 보여 줄게. 대신 부탁이 있어. 동굴 어딘가에 아빠 나침반이 있어. 그걸 찾아 줘.');
      await c.say(n, '이거 아빠 물갈퀴야. 깊은 물을 헤엄칠 수 있어. 동굴 입구는 바다 쪽에 있거든.', { face: 'smile' });
      await c.getItem('flippers', 1);
      c.flag('c3_luce'); c.lock(false);
      return;
    }
    if (f('d3:boss') && !f('c3_luce_done')) {
      c.lock(true);
      if (S().inv.luce_compass) c.take('luce_compass');
      await c.say(n, '…아빠 나침반. 바늘이 아직 북쪽을 가리켜.', { face: 'cry' });
      await c.say(n, '아빠는 이걸로 뭘 찾으려 했을까. 동굴 벽에 뭔가 새겨져 있지 않았어? …아니야, 말하지 마. 내가 언젠가 직접 볼래.', { face: 'sad' });
      await c.say(n, '약속대로. 아빠의 일지야.', { face: 'smile' });
      c.truth('t_log');
      for (const l of G.data.TRUTHS.t_log.long) await c.narr(l);
      await c.say(n, '그리고… 오늘 밤 등대에 불 켤 거야. 16년 만에. 아빠가 아니라, 너희가 돌아올 수 있게.', { face: 'smile' });
      c.flag('c3_luce_done'); c.bond('luce', 2); c.exp(40);
      c.lock(false);
      c.journal('루체에게 아버지의 나침반을 돌려주었다. 983년 겨울, 하늘에서 흰 줄기가 떨어져 바다를 갈랐다. 그날 엄마가 잠들었다.');
      return;
    }
    await c.say(n, ST.lines({ c3: '등대 불이 켜지니까 배들이 다시 들어와. 아빠도… 어디서 보고 있겠지.', c7: '북쪽 하늘에서 가끔 흰 줄기가 보여. 너야?' }), { face: 'smile' });
  } });
  G.data.ITEMS.luce_compass = { id: 'luce_compass', type: 'key', name: '루체 아버지의 나침반', desc: '바늘이 북쪽을 가리킨다. 뒷면에 「루체에게」.' };

  /* ───────── 주민 ───────── */
  ST.folk('b_shop', { name: '잡화점 주인 마린', folk: 'merchantw', x: 5, y: 3, lines: { c3: async (c, n) => { const k = await c.choice('어서 와요, 파도 잡화점!', ['물건을 산다', '괜찮아요'], { name: '잡화점 주인 마린' }); if (k === 0) await c.shop('blue'); } } });
  ST.folk('b_inn', { name: '갈매기 주인', folk: 'sailor', x: 4, y: 3, lines: { c3: async (c, n) => { const k = await c.choice('쉬어 가게. 파도 소리 들으며 자면 꿈도 안 꿔. (30골드)', ['쉰다', '소문', '괜찮아요'], { name: '갈매기 주인' }); if (k === 0) { if (S().gold >= 30) c.gold(-30); await c.rest(); } else if (k === 1) await c.say(n, U.pick(['고등어호 가브 선장은 요즘 기사단 손님만 태워.', '새벽단 배가 밤마다 몰래 들어온다더군.', '떠돌이 음유시인 배는 물 위에서 소리가 안 나. 이상하지.'])); } } });
  ST.person('b_inn', { id: 'lyra', x: 11, y: 6, dir: 'left', when: () => !f('c3_boat'), barks: ['♪ 파도는 세지 않아도 밀려와요…'], talk: async (c, n) => {
    await c.say(n, ST.route() === 'night' ? '또 만났네요. 레드의 약상자 얘기, 벌써 노래가 됐어요. 제목은 「고양이 발자국」.' : '또 만났네요. 이 대륙은 넓은데 노래할 데는 좁아요.', { face: 'smile' });
    await c.say(n, '[p]♪ 등대지기는 흰 줄기를 봤대요 / 문을 닫는 소리를 들었대요\n♪ 황금별이 두 번 깜빡일 때 / 누군가 잠이 들었대요[/]', { face: 'closed' });
  } });
  ST.folk('b_nord', { id: 'nord', name: '노르드 영감', look: G.cast.folk('sailor', { age: 'old', hc: '#e8e8e8', beard: '#e8e8e8' }), x: 5, y: 4, state: 'sit', lines: {
    c3: ['983년 겨울 밤? 기억하지. 바다가 숨을 멈췄어. 파도가 한 번도 안 쳤다. 그러고 하늘이 하얘졌지.', '루체 아비? 좋은 뱃사람이었다. 나침반을 믿었지. 나침반은 북쪽만 가리키는데, 그 녀석은 뭘 찾으러 서쪽으로 갔을까.'],
    c6: '천년제 불꽃이 여기서도 보였다. 그 한가운데 흰빛이… 등대보다 밝더구나.',
  } });
  ST.folk('world', { name: '부두 인부', folk: 'sailor', x: X0 + 20, y: Y0 + 18, wander: 12, barks: ['영차!', '하나 둘, 영차!'], lines: { c3: ['고등어호가 옐로까지 간다고? 요즘은 기사단 증명서 있어야 태워 줘.', '바다 동굴엔 문어 괴물이 산대. 새끼인데도 배만 해.'] } });
  ST.folk('world', { name: '학자', folk: 'scholar', x: X0 + 10, y: Y0 + 9, wander: 14, lines: { c3: ['대도서관 책은 삼십만 권. 금서는 한 권도 목록에 없어. 그러니까 금서지.', '다섯 빛깔 신화? 수업 첫날 배우는 거지. 의심해 본 적은… 없네.'] } });
  ST.folk('world', { name: '어부의 아이', folk: 'kidg', x: X0 + 22, y: Y0 + 14, wander: 20, barks: ['게 잡았다!'], lines: { c3: ['루체 언니는 밤마다 등대 꼭대기에 올라가. 불도 안 켜면서.', '바위 게는 정면이 딱딱해. 뒤로 돌아가서 때려!'] } });

  /* ───────── 빛 씨앗 (블루) ───────── */
  ST.seed('b1', 'world', X0 + 34, Y0 + 3, {});
  ST.seed('b2', 'world', ...OW.P(188, 190), { under: true });
  ST.seed('b3', 'world', ...OW.P(150, 200), { under: true });
  ST.seed('b4', 'world', CAVE.x + 4, CAVE.y - 3, {});
  OW.hooks.push((m) => { m.obj[m.i(...OW.P(188, 190))] = O.BUSH; m.obj[m.i(...OW.P(150, 200))] = O.ROCK; m.obj[m.i(X0 + 34, Y0 + 3)] = 0; });

  /* ═════════ 해저 동굴 (던전 3) ═════════ */
  G.dungeon.def('d3', {
    name: '해저 동굴', sub: '루체 아버지가 들어간 곳', pal: 'blue', music: 'cave', tier: 2, floor: T.STONE, dark: 0.25,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: CAVE.x, ty: CAVE.y + 1 },
    rooms: {
      '1,3': { ter: [['water', 2, 8, 5, 5], ['water', 13, 8, 5, 5], ['sand', 7, 3, 6, 4]], foes: [['crab', 6, 5], ['crab', 13, 5]], props: [['sign', 9, 5, { text: '벽에 새긴 글: 「북쪽은 하늘, 하늘은 흰빛, 흰빛은 서쪽 바다 밑에서 한 번 쉬었다.」 — 루카스 (루체의 아버지)' }], ['pot', 2, 3], ['pot', 17, 3]] },
      '1,2': { ter: [['deep', 2, 5, 16, 4]], foes: [['octo', 6, 6], ['octo', 13, 7]], props: [['pot', 3, 11], ['pot', 16, 11], ['sign', 9, 11, { text: '깊은 물. 물갈퀴가 있으면 헤엄칠 수 있다.' }]] },
      '0,2': { solve: { type: 'clear', msg: '상자가 떠올랐다' }, ter: [['water', 2, 3, 16, 3]], foes: [['crab', 5, 8], ['crab', 14, 8], ['octo', 9, 4]], props: [['chest', 9, 9, { item: 'key_small', hidden: true }]] },
      '1,1': { ter: [['pit', 1, 4, 18, 6]], props: [['chest', 9, 11, { item: 'hook', col: '#3a6ab8' }], ['post', 9, 2], ['sign', 3, 11, { text: '구덩이 너머 말뚝. 갈고리가 있으면 건널 수 있다.' }], ['chest', 13, 2, { item: 'luce_compass' }], ['post', 4, 11]], foes: [['bat', 4, 11], ['bat', 15, 11]] },
      '2,2': { ter: [['water', 2, 2, 16, 11], ['stone', 8, 5, 4, 4]], props: [['eye', 17, 7, { sets: 'd3:eye', timer: 6 }], ['chest', 10, 6, { item: 'map_d' }]], foes: [['octo', 4, 5], ['octo', 14, 10]] },
      '2,1': { solve: { type: 'clear' }, foes: [['bandit', 6, 6], ['bandit', 13, 6], ['crab', 9, 9]], props: [['chest', 9, 5, { item: 'key_big', big: true, hidden: true }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]] },
      '0,1': { ter: [['pit', 1, 4, 18, 2], ['pit', 1, 9, 18, 2]], props: [['post', 9, 7], ['post', 15, 2], ['post', 14, 12], ['chest', 16, 3, { item: 'heartpiece' }], ['chest', 3, 7, { item: 'compass' }], ['sign', 4, 12, { text: '말뚝에서 말뚝으로.' }]], foes: [['bat', 9, 7]] },
      '1,0': { boss: true, ter: [['deep', 2, 2, 16, 5], ['water', 2, 7, 16, 1]], props: [['boss', 9, 4, { type: 'kraken' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'open'], ['1,2', '1,1', 'key'], ['2,2', '2,1', 'switch', 'd3:eye'], ['0,2', '0,1', 'open'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      if (f('d3:boss')) { boss.dead = true; Wd.add(new ST.Portal({ x: (r.x0 + 9) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: CAVE.x, toy: CAVE.y + 2 })); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d3:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 9) * TS + 8, y: (r.y0 + 9) * TS + 12, flagKey: 'd3:heart' }));
        G.world.add(new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: CAVE.x, toy: CAVE.y + 2 }));
        c.music('cave');
        await c.narr('크라켄이 물속으로 가라앉은 자리에, 벽 한 면이 드러났다. 조개와 따개비 사이로 새긴 글씨.');
        await c.narr('[w]「983. 흰 줄기가 여기서 한 번 쉬었다. 따뜻했다. 누군가 이 아래에서 울었다. — 루카스」[/]');
        await c.say('toria', '찍… 누가 울었대. 여기서.', { face: 'sad' });
        c.journal('해저 동굴의 새끼 크라켄을 쓰러뜨렸다. 루체 아버지 루카스가 벽에 남긴 글: 「흰 줄기가 여기서 한 번 쉬었다」.');
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d3:intro')) { c.flag('d3:intro'); await c.say('toria', '찍! 물이 부글거려! 다, 다리가 여러 개야!', { face: 'shock' }); await c.cutin({ who: 'toria', title: '새끼 크라켄', small: '해저 동굴의 주인', sub: '다리를 먼저 끊어라!', col: '#b87aff', face: 'shock', sec: 1.8 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
      }); };
    },
  });

  /* ───────── 항구의 결투: 카시안 ───────── */
  ST.onTick.push(() => {
    if (!f('c3_luce_done') || f('c3_duel')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (U.dist(p.x, p.y, px(X0 + 18), py(Y0 + 17)) > 110) return;
    S().flags.c3_duel = true;
    G.script.run(duel);
  });
  async function duel(c) {
    // 부두 끝(물 위의 두 칸짜리 다리)이 아니라 부두 앞 뭍에서 겨룬다 — 예전엔 카시안이 바다 위에 서서 움직이지 못했다
    const m0 = G.world.map;
    const g0 = G.bosses.groundAt(m0, px(X0 + 18), py(Y0 + 15), 12) || { x: px(X0 + 18), y: py(Y0 + 19) };
    const P0 = { x: g0.x, y: g0.y };
    const gC = G.bosses.groundAt(m0, P0.x + 32, P0.y, 4) || G.bosses.groundAt(m0, P0.x - 32, P0.y, 4) || { x: P0.x, y: P0.y - 32 };
    c.lock(true);
    await c.cinema(true);
    c.music('danger');
    { const pl = G.world.player; await c.move('hero', P0.x, P0.y); if (pl) pl.dir = gC.x > P0.x ? 'right' : 'left'; }
    const cs = c.spawn({ cid: 'cassian', x: gC.x + (gC.x >= P0.x ? 30 : -30), y: gC.y });
    await c.move(cs, gC.x, gC.y);
    c.faceEach('hero', cs);
    const rt = ST.route();
    await c.say('cassian', rt === 'order' ? '두 번째 심사다, 후보. 루드의 장부는 잘 받았다. 그라우스는 지금 천년성 법정에 서 있다. …그런데 챔피언께서 한 가지를 더 물으셨다. 「그 아이, 검은 쓸 줄 아나.」' : rt === 'dawn' ? '광산을 부쉈다더군. 새벽단 목도리를 두르고. …탑 하나, 기계 하나. 다음은 뭐지? 천년성인가?' : '레드에서 그라우스의 금고가 비었다. 루드네 문 앞에는 약상자가 놓였고. 고양이 발자국만 남긴 채로. …네 짓이 아니라고 말해 봐.', { face: 'normal' });
    await c.say('cassian', '말로는 모르겠다. 검으로 묻지.', { face: 'smirk' });
    await c.cutin({ who: 'cassian', title: '카시안', small: '카이론의 마지막 제자', sub: '정면은 막는다 — 완벽 회피 뒤에 반격을', col: '#8a1a2a', face: 'smirk', sec: 1.6 });
    cs.dead = true;
    const boss = G.bosses.spawn('cassian', gC.x, gC.y, { hpMul: 1 });
    boss.duel = true; boss.home = { x: (P0.x + gC.x) / 2, y: (P0.y + gC.y) / 2 };
    S().duel = true;
    await c.cinema(false);
    c.lock(false);
    boss.start(); G.hud.setBoss(boss);
    c.music('boss2');
    let win = false;
    await c.freeWhile(() => { if (boss.hp <= boss.maxHp * 0.25) { win = true; return true; } return S().hp <= 1; });
    S().duel = false;
    c.lock(true);
    await c.cinema(true);
    const bx = boss.x, by = boss.y; boss.dead = true; G.hud.boss = null;
    const cs2 = c.spawn({ cid: 'cassian', x: bx, y: by });
    c.faceEach('hero', cs2);
    c.music('blue');
    if (win) {
      c.flag('c3_duel_win'); c.bond('cassian', 1);
      await c.say('cassian', '………', { face: 'shock' });
      await c.say('cassian', '하. 스승님 말고 나한테 무릎 꿇게 만든 건 네가 처음이다.', { face: 'smile' });
    } else {
      await c.say('cassian', '검이 아직 네 것이 아니군. 괜찮다. 나도 열여섯 땐 그랬다.', { face: 'smirk' });
    }
    await c.say('cassian', '스승님은 틀리신 적이 없다. 경험세도 대륙을 지키기 위한 셈이다.', { face: 'normal' });
    await c.say('cassian', '…그런데 요즘은 가끔, 계산에 사람이 몇 명 들어가 있는지 궁금하다.', { face: 'sad' });
    await c.say('cassian', '옐로로 간다면 배를 고르게 될 거다. 부두에 세 척이 있더군. 어느 배를 타든, 네가 누구 편인지 대륙이 알게 될 거다.', { face: 'normal' });
    await c.move(cs2, bx + 120, by); cs2.dead = true;
    c.flag('c3_duel'); c.exp(50);
    if (G.world.map && G.world.map.overworld) spawnBoats(G.world);
    c.heal();
    await c.cinema(false);
    c.lock(false);
    c.journal(win ? '블루 부두에서 카시안과 겨뤄 이겼다. 그는 「계산에 사람이 몇 명 들어가 있는지 궁금하다」고 했다.' : '블루 부두에서 카시안과 겨뤘다. 그는 「검이 아직 네 것이 아니다」라고 했다.');
  }

  /* ───────── 세 척의 배 — 첫 번째 길이 굳는다 ───────── */
  async function boatChoice(c, route) {
    if (f('c3_boat')) return;
    const txt = {
      dawn: ['레아의 밀수선. 선체에 주황 줄. 「새벽은 온다」', '레아: 타. 옐로 금화왕의 금고도 탑이랑 다를 거 없어. 거기서도 부술 게 많아.'],
      order: ['정기선 「고등어호」. 기사단 문장 깃발.', '가브 선장: 등급 후보라면 태워 주지. 옐로의 금화왕한테 가는 감찰관도 같이 타. 카시안 공이야.'],
      night: ['리라의 작은 배. 돛이 까맣고, 노를 저어도 소리가 안 난다.', '리라: 밤바다는 조용해요. 조용한 배는 아무도 안 세요. 옐로의 그늘 골목에 친구들이 있어요.'],
    }[route];
    await c.narr(txt[0]);
    await c.say(null, txt[1], { style: 'sys' });
    const k = await c.choice('이 배를 탈까? 이 선택으로 앞으로의 길이 한쪽으로 굳는다.', [{ t: '이 배를 탄다', tag: route }, { t: '다른 배도 둘러본다' }]);
    if (k !== 0) return;
    c.lock(true);
    S().flags.route_lock1 = route; S().flags.c3_boat = true;
    for (const e of G.world.ents) if (e.boatRoute) e.dead = true;
    c.route(route, 3);
    await c.fade(true, { sec: 1 });
    c.music('blue');
    await c.narr(route === 'dawn' ? '밀수선은 등불 없이 떠났다. 레아는 키를 잡고 콧노래를 불렀다. 루드가 갑판에서 장부 대신 칼을 갈았다.' : route === 'order' ? '고등어호는 기사단 깃발을 달고 당당히 출항했다. 카시안은 뱃머리에 서서 한 번도 뒤를 돌아보지 않았다.' : '검은 돛은 바람이 없어도 나아갔다. 리라는 노래를 부르지 않았다. 대신 별을 세다가, 다 세지 않고 그만두었다.');
    await c.narr('사흘 뒤, 모래가 반짝이는 해안이 보였다.');
    S().flags['open:yellow'] = true; S().flags.c3_done = true;
    const Y = OW.towns.yellow;
    G.game.goto('world', px(Y.x + 18), py(Y.y + Y.h + 3), 'up');
    await c.fade(false, { sec: 1 });
    c.lock(false);
    c.journal(route === 'dawn' ? '레아의 밀수선을 타고 옐로로 향했다. [r]새벽[/]의 길.' : route === 'order' ? '정기선 고등어호를 타고 옐로로 향했다. 카시안이 함께 탔다. [b]질서[/]의 길.' : '리라의 검은 돛배를 타고 옐로로 향했다. [p]밤[/]의 길.');
  }
})();
