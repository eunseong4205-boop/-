/* 제9장 「영원한 밤」 — 블랙 · 등불 거리 · 밤의 정보상 미드나잇 · 눈먼 등대지기 · 녹턴의 성(던전 9)
   해가 뜨지 않는 땅. 사람들은 등불 아래서 소곤소곤 말한다.
   갈래마다 성에 드는 길이 다르다(새벽: 성문을 날린다 · 질서: 정직한 문지기 고르디 · 밤: 묘지의 뒷길).
   성 꼭대기의 녹턴 → 허용 손실 장부 → 카이론의 그림자가 말하는 것 → 리라가 누구인지 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const BT = OW.towns.black, X0 = BT.x, Y0 = BT.y;          // 250, 44
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const CASTLE = OW.pt(262, 32);                          // 녹턴의 성 (마을 북쪽 고원)
  const GRAVE = OW.pt(279, 63);                           // 남동쪽 묘지 (뒷길)
  const LAMPS = [[257, 52], [277, 52], [257, 62], [277, 62], [267, 66]].map(([a, b]) => OW.P(a, b));
  const buddy = () => ({ dawn: 'rud', order: 'cassian', night: 'lyra' }[S().flags.route_lock || 'order']);
  const girl = () => S().gender === 'girl';
  ST.BLACK = { X0, Y0, CASTLE, GRAVE };

  ST.CH.push({ no: '제9장', id: 'c9', title: '영원한 밤', sub: '오랫동안 해가 뜨지 않았다. 그림자는 주인보다 먼저 지쳤다.',
    goal(s) {
      const rt = s.flags.route_lock || 'order';
      if (!f('c9_mid')) return { text: '등불 거리 서쪽, 밤의 정보상 미드나잇을 찾자.', map: 'world', ...OW.pt(255, 50) };
      if (!f('c9_in')) return { text: ({ dawn: '성문 앞. 레아와 루드가 화약을 심고 기다린다.', order: '북쪽 성문. 정문 경비에게 통행증을 보이자.', night: '남동쪽 묘지의 기울어진 비석. 고양이 발자국을 따라.' })[rt], map: 'world', x: rt === 'night' ? GRAVE.x + 1 : CASTLE.x + 6, y: rt === 'night' ? GRAVE.y + 1 : CASTLE.y + 5 };
      if (!f('d9:boss')) return { text: '녹턴의 성 꼭대기로.', map: 'world', x: CASTLE.x + 6, y: CASTLE.y + 5 };
      if (!f('c9_done')) return { text: '성 꼭대기에서 녹턴과 이야기하자.', map: 'world', x: CASTLE.x + 6, y: CASTLE.y + 5 };
      return { text: '남쪽 바다 끝, 알록달록 곶. 발명가 피로스의 로켓.', map: 'world', x: OW.towns.colorful.x + 14, y: OW.towns.colorful.y + 11 };
    } });
  ST.closedMsg.colorful = '알록달록 곶은 쾅쾅 터지는 소리가 나는 동네래. 아직은 갈 이유가 없어, 찍.';

  /* ───────── 물건 · 글 ───────── */
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('key_night', { type: 'key', name: '밤의 열쇠', desc: '하늘 정거장의 문을 여는 열쇠. 아우룸 시대부터 밤의 성에 보관되어 왔다.' });
  item('ledger', { type: 'key', name: '허용 손실 장부', desc: '카이론의 장부 사본. 마을마다 「허용 손실」 숫자. 맨 끝 줄: 「예비 그릇 — 세린의 아이」.' });
  item('letter_orhan', { type: 'letter', name: '눈먼 등대지기의 편지', desc: '블루 등대의 루체에게.', read: '「루체. 아빠다. 검은 별 조각을 쫓다가 눈이 멀었다. 블랙 마을에서 등불지기 일을 거든다. 불 냄새로 일한다. 등불은 켜져 있니? 켜져 있으면 됐다. — 아빠」' });
  item('letter_luce', { type: 'letter', name: '루체의 답장', desc: '블랙의 아빠에게.', read: '「아빠. 불은 켜져 있어. 흰빛으로 켠 불이라 절대 안 꺼져. 그러니까 천천히 와도 돼. 대신 꼭 와. — 루체」' });
  item('fish_gold', { type: 'key', name: '황금 고등어', desc: '비늘이 금화처럼 반짝인다. 고양이가 환장한다고 한다.' });
  G.data.BOOKS.b_ledger = { name: '허용 손실 장부 (사본)', short: '녹턴의 책상 위 두꺼운 장부', pages: ['그린 — 허용 손실 12. 레드 — 40. 블루 — 26. 옐로 — 55. 퍼플 — 9. 무지개 — 0(천년제 기둥 가동 시 300). 화이트 — 성녀 관리. 그레이 — 해당 없음. 블랙 — 녹턴 관리.', '「허용 손실: 흑점 방위를 위해 빛바램으로 잃어도 되는 사람의 수. 해마다 갱신.」 — 카이론', '맨 끝 줄, 다른 잉크로: 「예비 그릇 — 세린의 아이 (1). 예측이 틀릴 경우에 한해.」', '그 아래, 칼로 긁어낸 자국. 한 줄이 통째로 지워져 있다. 긁은 자국이 아주 오래되었다.'] };

  /* ───────── 성 그림 ───────── */
  const B = G.build, X = G.gfx, R = B.ramp, poly = B.poly, OUT = B.OUT;
  B.SPECIAL.castle = function (o) {
    const w = (o.w || 12) * TS, h = 156, b = X.brush(w, h);
    const C = R('#3a3448'), Rf = R('#241e34');
    b.rect(16, 60, w - 32, h - 60, C[2]); b.rect(16, 60, 10, h - 60, C[3]); b.rect(w - 26, 60, 10, h - 60, C[1]);
    for (let x = 16; x < w - 16; x += 10) b.rect(x, 54, 6, 7, C[2]);
    // 탑 셋 (가운데가 가장 높다)
    for (const [tx, th, tw] of [[2, 90, 22], [w / 2 - 14, 150, 28], [w - 24, 90, 22]]) {
      const ty = h - th; b.rect(tx, ty + 16, tw, th - 16, C[2]); b.rect(tx, ty + 16, 6, th - 16, C[3]); poly(b, [[tx - 2, ty + 18], [tx + tw / 2, ty - 2], [tx + tw + 2, ty + 18]], Rf[2]); poly(b, [[tx + tw / 2, ty - 2], [tx + tw + 2, ty + 18], [tx + tw * 0.62, ty + 18]], Rf[1]);
      for (let k = 0; k < 3; k++) { const wy = ty + 28 + k * 22; if (wy > h - 30) break; b.rect(tx + tw / 2 - 3, wy, 6, 10, '#1a1026'); b.rect(tx + tw / 2 - 2, wy + 1, 4, 8, k % 2 ? '#b87aff' : '#ffd86a'); }
    }
    // 가운데 탑 꼭대기 창: 녹턴이 하늘을 보는 방
    b.ellipse(w / 2, 22, 5, 6, '#ffd86a'); b.ellipse(w / 2, 22, 3, 4, '#fff4c8');
    // 성문
    b.rect(w / 2 - 16, h - 40, 32, 40, '#140c1c'); b.ellipse(w / 2, h - 40, 16, 10, '#140c1c'); b.rect(w / 2 - 14, h - 38, 28, 38, o.open === false ? '#3a2a3a' : '#0a0612');
    if (o.open === false) for (let x = w / 2 - 12; x < w / 2 + 14; x += 5) b.vline(x, h - 44, h - 1, '#5a4a5a');
    b.rect(w / 2 - 2, h - 58, 4, 6, '#ff4a5a');
    b.rect(0, h - 3, w, 3, C[0]);
    return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS, door: true };
  };

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'bk_mid', region: 'black', style: 'black', tx: X0 + 3, ty: Y0 + 2, w: 5, h: 4, name: '밤의 정보상', sign: 'magic',
      room: { w: 12, h: 9, floor: T.CARPET, music: 'black', dark: 0.5, furn: [['counter', 4, 4, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['crystalball', 9, 5, { text: '보라 구슬. 들여다보면 고양이 발자국 모양의 별자리가 보인다.' }], ['lamp', 2, 6], ['bookpile', 3, 2, { text: '정보 장부. 고양이 발자국으로 쓴 글씨라 하나도 못 읽겠다.' }]] } });
    ST.house(m, { id: 'bk_inn', region: 'black', style: 'black', tx: X0 + 27, ty: Y0 + 3, w: 6, h: 4, name: '등불 아래 여관', sign: 'inn',
      room: { w: 14, h: 10, floor: T.WOOD, music: 'calm', dark: 0.3, furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['lamp', 8, 2], ['table', 8, 6], ['chair', 7, 7], ['chair', 10, 7], ['bed2', 12, 3, { v: '#3a3450' }], ['bed2', 12, 6, { v: '#4a4060' }]] } });
    ST.house(m, { id: 'bk_shop', region: 'black', style: 'black', tx: X0 + 3, ty: Y0 + 16, w: 5, h: 4, name: '밤의 가게', sign: 'shop',
      room: { w: 12, h: 9, floor: T.CARPET, music: 'black', dark: 0.3, furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['lamp', 2, 6], ['lamp', 9, 6]] } });
    // 녹턴의 성: 고원 위. 길과 계단
    OW.clear(m, CASTLE.x - 1, CASTLE.y - 1, 14, 5, m.hgt[m.i(CASTLE.x + 6, CASTLE.y + 4)], T.STONE);
    G.build.placeBuilding(m, { special: 'castle', tx: CASTLE.x, ty: CASTLE.y, w: 12, h: 3, to: 'd9', id: 'd9_gate', cond: () => f('c9_in') || f('d9:boss'), msg: '성문이 닫혀 있다. 창을 교차한 해골 기사 둘이 꼼짝하지 않는다.' });
    for (let y = CASTLE.y + 3; y <= Y0; y++) for (const x of [CASTLE.x + 5, CASTLE.x + 6]) { const i = m.i(x, y); if (m.ter[i] === T.CLIFF) { m.ter[i] = T.STAIRS; m.obj[i] = 0; continue; } if (m.ter[i] !== T.STAIRS) { m.ter[i] = T.STONE; m.obj[i] = 0; } }
    // 묘지와 기울어진 비석 (뒷길)
    OW.clear(m, GRAVE.x - 2, GRAVE.y - 1, 7, 5, m.hgt[m.i(GRAVE.x, GRAVE.y + 2)], T.DARK);
    for (const [dx, dy] of [[-1, 0], [1, 0], [3, 0], [-1, 2], [3, 2]]) G.build.placeBuilding(m, { special: 'statue', tx: GRAVE.x + dx, ty: GRAVE.y + dy, w: 1, h: 1, col: '#5a5468', door: false });
    m.warps.push({ x: GRAVE.x + 1, y: GRAVE.y + 1, w: 1, h: 1, to: 'd9', id: 'd9_back', cond: () => (S().flags.route_lock === 'night' && f('c9_mid')) || f('d9:boss'),   /* 보스를 이긴 뒤에는 어느 갈래든 뒷길로도 */ msg: '기울어진 비석. 밀어 봐도 꿈쩍 않는다. 고양이 발자국 하나가 찍혀 있다.' });
    // 등불 다섯 (꺼져 있다)
    for (const [x, y] of LAMPS) { m.obj[m.i(x, y)] = O.LAMP; }
    for (const [dx, dy] of [[1, 9], [33, 9], [1, 20], [33, 20]]) if (m.inb(X0 + dx, Y0 + dy) && !m.solidExtra[m.i(X0 + dx, Y0 + dy)]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.DEAD;
  });
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(BT.plaza.x + 3), y: py(BT.plaza.y + 3), wid: 'w_black', name: '블랙 등불 거리' }));
    Wd.add(new P.Sign({ x: px(X0 + 17), y: py(Y0 + 23), text: '블랙 — 영원한 밤\n「소리를 낮추시오. 밤이 듣고 있소」 — 등불지기 조합' }));
    // 등불: 흰빛이나 등불로 켠다
    LAMPS.forEach(([x, y], i) => {
      const key = 'lamp' + i;
      if (f(key)) { m.lights.push({ x: x * TS + 8, y: y * TS + 2, r: 70, warm: 'rgba(255,240,200,0.3)' }); return; }
      Wd.add(new P.Spot({ x: px(x), y: py(y + 1) - 4, verb: '꺼진 등불', text: async (c) => {
        if (f(key)) return;
        if (!S().spells.light && !S().tools.lantern) { await c.narr('꺼진 등불. 유리 안의 심지가 잿빛으로 식어 있다. 기름은 가득한데 불이 붙지 않는다.'); return; }
        c.flag(key); c.sfx('white'); G.fx.glow(px(x), py(y) - 20, '#fff4c8', 14);
        m.lights.push({ x: x * TS + 8, y: y * TS + 2, r: 70, warm: 'rgba(255,240,200,0.3)' });
        const n = LAMPS.filter((_, j) => f('lamp' + j)).length;
        await c.narr('흰빛을 심지에 대자, 등불이 하얗게 타올랐다. (' + n + '/5)');
        if (n === 5) await c.say('toria', '찍! 다섯 개 다 켰어! 등불지기 할아버지한테 가 보자!', { face: 'happy' });
      } }));
    });
  });
  // 블랙은 늘 밤
  const oldSky9 = G.story.skyTint;
  G.story.skyTint = () => { const Wd = G.world, p = Wd.player; if (Wd.map && Wd.map.overworld && p && OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) === 'black') return 'rgba(80,60,160,0.3)'; return oldSky9 ? oldSky9() : null; };

  /* ───────── 제9장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c8_done') || f('ch:c9')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'black') return;
    S().flags['ch:c9'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c9');
      c.music('black');
      const b = buddy();
      ST.join(b);
      await c.say('toria', '찍… 아무것도 안 보여. 네 흰빛만 보여. 여기 사람들은 오래 이렇게 살았대. 해를 그림으로만 봤대.', { face: 'sad' });
      if (b === 'rud') await c.say('rud', '누나는 성문 앞에 먼저 가 있어. 화약 세 통. …준비는 끝났어. 이번엔 숫자가 무서워.', { face: 'normal' });
      else if (b === 'cassian') await c.say('cassian', '녹턴. 스승님의 그림자. 나는 한 번도 그의 얼굴을 본 적이 없다. 스승님조차 그를 「녹턴」이라고만 부른다.', { face: 'normal' });
      else await c.say('lyra', '…돌아왔네요. 나는 여기서 자랐어요. 이 거리 등불은 다 외워요. 그중 다섯은 꺼졌고요.', { face: 'closed' });
      await c.say('toria', '미드나잇이라는 고양이를 찾아야 해. 서쪽 가게래.', { face: 'normal' });
      c.lock(false);
      c.journal('영원한 밤의 땅 블랙에 닿았다. 해가 뜨지 않는 땅.');
    });
  });

  /* ───────── 미드나잇 ───────── */
  ST.person('bk_mid', { id: 'midnight', x: 6, y: 3, dir: 'down', mark: () => (!f('c9_mid') ? '!' : null), talk: async (c, n) => {
    c.flag('met:midnight');
    if (f('c9_mid')) { await c.say(n, ST.lines({ c9: f('d9:boss') ? '녹턴이 창가에서 비켜섰다며. 처음으로. …고양이는 울 줄 몰라서 다행이군.' : '녹턴은 성 꼭대기에 있네. 늘 하늘만 보고 있지.', c10: '로켓? 고양이는 높은 데를 좋아하지. 그런데 그렇게 높은 데는 아니야.' }), { face: 'smirk' }); return; }
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '…어서 오게. 밤의 정보상, 미드나잇이라네. 흰빛이로군. 냄새로 알았지. 천 년 만에 맡는 냄새야. …아니, 그리 오래는 아닌가.', { face: 'smirk' });
    await c.say(n, '정보는 공짜가 아니네. 금화왕 말투 같지만. [y]황금 고등어[/] 한 마리. 아니면… 밤 사람들 식으로 치르든가. [p]네 비밀[/] 하나.', { face: 'normal' });
    const opts = [{ t: '황금 고등어를 준다', if: !!S().inv.fish_gold }, { t: '비밀 하나를 말한다', sub: '남의 비밀은 안 받는다.' }];
    const k = await c.choice('미드나잇이 수염을 떤다.', opts);
    if (k === 0) { c.take('fish_gold'); await c.say(n, '…좋은 고등어군. 거래 성립. 아니, 우정 성립.', { face: 'happy' }); c.bond('midnight', 2); }
    else {
      const j = await c.choice('어떤 비밀을 말할까?', [
        { t: '「사실은 무서워.」' },
        { t: '「가끔 빛이 먹고 싶어.」', sub: '[r]심연[/]', if: !!(S().abyss.ate_vein || S().abyss.pond || S().abyss.mirror) },
        { t: '「할머니한테 한 번도 고맙다고 안 했어.」' },
      ]);
      await c.narr('미드나잇이 눈을 가늘게 떴다. 가게 안의 등불이 한 칸 낮아졌다.');
      await c.say(n, j === 0 ? '…무섭다라. 좋은 비밀이군. 용감한 척하는 녀석들은 그걸 절대 안 말하지. 천 년 전에 똑같은 말을 한 녀석이 있었네.' : j === 1 ? '……알고 있었네. 냄새가 나거든. 그 녀석한테서도 났지. 천 년 전에. 먹지 말게. 먹으면 멈출 수가 없어.' : '…그건 비밀이 아니라 숙제로군. 편지를 쓰게. 그린까지 가는 고양이를 알지.', { face: 'sad' });
      c.bond('midnight', 1);
    }
    await c.say(n, '천 년 전 이야기를 해 주지. 금빛 머리의 소년이 있었네. 아우룸. 나는 그 녀석 어깨 위에 앉아 있던 고양이였고.', { face: 'closed' });
    await c.say(n, '그 녀석이 흰빛으로 전쟁을 끝낸 밤, 하늘에서 무언가가 눈을 떴네. 나는 봤지. 그 녀석 어깨 위에서.', { face: 'normal' });
    await c.say(n, '그 녀석은 밤새 고민했어. 그리고 빛을 쪼갰네. 다섯 갈래, 다섯 빛깔. 모이지 말라고. 창세 신화는 그 녀석이 지어낸 거야. 사람들이 다시 모으지 않게.', { face: 'normal' });
    await c.say(n, '…그런데 그 녀석 자신은 이미 너무 많이 삼킨 뒤였지. 벽화의 넷째 칸을 누가 지웠는지 아나? [p]나일세.[/] 발톱으로.', { face: 'sad' });
    await c.say(n, '넷째 칸엔 이런 그림이 있었네. 소년이 하늘로 올라가, 검은 해의 첫 번째 한 입이 되는 그림.', { face: 'sad' });
    c.flag('c9_aurum'); c.abyss('aurum_truth');
    if (!S().truth.t_five) c.truth('t_five');
    const rt = S().flags.route_lock;
    await c.say(n, rt === 'night' ? '뒷길은 남동쪽 묘지의 기울어진 비석이네. 고양이 발자국을 따라가게. 리라가 길을 아네. …그 애가 자란 길이니까.' : rt === 'dawn' ? '새벽단 꼬마들이 성문에 화약을 심고 있더군. 시끄러운 방법이지만, 밤에는 시끄러운 게 제일 잘 들리네.' : '성문 경비가 새로 왔다더군. 「정직한 기사」로 뽑혀서 좌천됐다나. 그린 출신이라지. 규칙서를 들고 다닌대.', { face: 'smirk' });
    c.flag('c9_mid');
    await c.cinema(false);
    c.lock(false);
    c.journal('밤의 정보상 미드나잇은 천 년 전 아우룸의 고양이였다. 아우룸은 빛을 다섯으로 쪼갰고, 자신은 검은 해의 첫 한 입이 되었다. 벽화 넷째 칸은 미드나잇이 지웠다.');
  } });

  /* ───────── 성으로 드는 길: 갈래마다 ───────── */
  // 질서: 정직한 문지기 고르디
  ST.person('world', { id: 'gordi', x: CASTLE.x + 4, y: CASTLE.y + 4, dir: 'down', when: () => ST.after('c9') && S().flags.route_lock === 'order' && !f('c9_in'), mark: () => (f('c9_mid') ? '!' : null), talk: async (c, n) => {
    if (!f('c9_mid')) { await c.say(n, '「천년성 부속 밤의 성. 허가 없는 자, 출입 불가.」 …규칙서 삼십칠 쪽이다.', { face: 'normal' }); return; }
    c.lock(true);
    await c.say(n, '…역시 왔구나. 그린 마을 탑 앞에서 본 그 꼬마. 해골들 사이에 서 있으니 반갑다.', { face: 'smile' });
    await c.say(n, '보고서를 사실대로 썼더니 「정직한 기사」로 뽑혀서 여기 문지기로 발령났다. 상인지 벌인지.', { face: 'normal' });
    await c.say('cassian', '고르디 기사. 감찰관 카시안이다. 통행을 요구한다. 챔피언의 이름으로.', { face: 'normal' });
    await c.say(n, '규칙서대로라면 막아야 합니다, 감찰관님. …그런데 마리엔 아줌마가 편지에 그랬습니다. 「그 아이가 오면 문 열어 주소. 안 열면 그린에 발 들이지 마소.」', { face: 'sad' });
    await c.say(n, '그린에 못 가면 곤란합니다. 감자가 맛있거든요. 문, 열겠습니다. 규칙서 마지막 쪽: 「스스로 판단하라.」', { face: 'smile' });
    c.flag('c9_in'); c.bond('gordi', 2);
    c.lock(false);
    c.journal('정직한 문지기 고르디가 성문을 열어 주었다. 마리엔 아줌마의 편지 덕분에.');
  } });
  // 새벽: 성문을 날린다
  ST.person('world', { id: 'lea', x: CASTLE.x + 8, y: CASTLE.y + 5, dir: 'left', when: () => ST.after('c9') && S().flags.route_lock === 'dawn' && !f('c9_in'), mark: () => (f('c9_mid') ? '!' : null), talk: async (c, n) => {
    if (!f('c9_mid')) { await c.say(n, '쉿. 미드나잇한테 먼저 가. 성 안 구조를 알아야 해. 화약은 아껴 써야 하거든.', { face: 'smirk' }); return; }
    c.lock(true);
    await c.say(n, '준비됐어? 세 통. 성문 경첩에 하나씩. 루드가 재 봤어.', { face: 'smirk' });
    await c.say('rud', '폭발 반경 사 미터. 우리는 칠 미터 뒤에. …누나, 이번엔 뒤로 물러나. 진짜로.', { face: 'normal' });
    await c.say(n, '알았어, 알았어. 새벽은 온다 — 쾅!', { face: 'happy' });
    c.sfx('explode'); c.shake(8, 1.2); c.flash('#ffb84a', 0.5);
    for (let i = 0; i < 6; i++) G.fx.sparks(px(CASTLE.x + 6), py(CASTLE.y + 2), 16, '#ffb84a', 140);
    await c.wait(0.8);
    await c.say(n, '…열렸다! 해골 기사들은 우리가 맡을게. 너는 꼭대기로!', { face: 'happy' });
    c.flag('c9_in'); c.route('dawn', 1);
    c.lock(false);
    c.journal('새벽단이 녹턴의 성문을 날렸다. 레아와 루드가 해골 기사들을 맡았다.');
  } });
  // 밤: 묘지의 뒷길 (리라가 안다)
  ST.onTick.push(() => {
    if (S().flags.route_lock !== 'night' || !f('c9_mid') || f('c9_in') || G.script.running) return;
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p) return;
    if (U.dist(p.x, p.y, px(GRAVE.x + 1), py(GRAVE.y + 1)) > 60) return;
    S().flags.c9_in = true;
    G.script.run(async (c) => {
      c.lock(true);
      await c.say('lyra', '여기예요. 어릴 때 이 비석 뒤에 숨어서 놀았어요. 술래는 늘 녹턴이었어요. 한 번도 날 못 찾았어요. …찾는 척을 안 했던 거지만.', { face: 'smile' });
      await c.say('lyra', '비석을 밀어요. 발자국 쪽으로.', { face: 'normal' });
      c.sfx('rock'); c.shake(2, 0.4);
      await c.narr('비석이 천천히 기울며 아래로 계단이 드러났다. 계단마다 고양이 발자국.');
      c.lock(false);
    });
  });

  /* ───────── 등불지기 · 눈먼 등대지기 ───────── */
  ST.person('world', { name: '등불지기 칸델', folk: 'oldm', ...OW.pt(267, 54), dir: 'down', mark: () => (!f('lamps_done') ? '?' : null), talk: async (c, n) => {
    const k = LAMPS.filter((_, j) => f('lamp' + j)).length;
    if (f('lamps_done')) { await c.say(n, '드디어 퇴근했어. 집에 가니까 마누라가 누구냐고 하더군. 허허.', { face: 'happy' }); return; }
    if (k >= 5) { c.flag('lamps_done'); await c.say(n, '다섯 개 전부! 등불 거리가 이렇게 밝았던 적이 있었나! 이거 받게. 밀린 야근 수당이야.', { face: 'happy' }); c.gold(3000); await c.getItem('heartpiece'); return; }
    await c.say(n, '등불지기 칸델이다. 해가 안 뜨는 마을이라 퇴근을 못 해.||거리의 등불 다섯 개가 꺼졌어. 기름을 부어도 안 켜져. 탑이 불빛까지 먹는 거야. 흰빛이라면 켤 수 있을지도. (' + k + '/5)', { face: 'sad' });
  } });
  ST.person('world', { name: '눈먼 노인', folk: 'sailor', ...OW.pt(280, 57), dir: 'left', state: 'sit', mark: () => (!f('orhan_done') && (!f('orhan_q') || S().inv.letter_luce) ? '!' : null), talk: async (c, n) => {
    if (f('orhan_done')) { await c.say(n, '…켜져 있다고. 그럼 됐다. 눈이 안 보여도 집을 찾을 수 있겠구나. 봄이 오면 가겠네. 밤이 끝나면.', { face: 'smile' }); return; }
    if (S().inv.letter_luce) {
      c.take('letter_luce');
      await c.narr('루체의 답장을 소리 내어 읽어 주었다.\n「아빠. 불은 켜져 있어. 흰빛으로 켠 불이라 절대 안 꺼져. 그러니까 천천히 와도 돼. 대신 꼭 와. — 루체」');
      await c.say(n, '……켜져 있다고.', { face: 'cry' });
      await c.say(n, '이걸 가져가게. 983년 겨울, 하늘에서 떨어진 검은 별 조각. 이걸 너무 오래 봐서 눈이 멀었지. 이제 볼 필요가 없어.', { face: 'normal' });
      c.flag('orhan_done'); await c.getItem('heartpiece'); c.gold(2000);
      return;
    }
    if (f('orhan_q')) { await c.say(n, '편지를… 블루 등대의 루체에게. 부탁하네.', { face: 'sad' }); return; }
    await c.say(n, '…발소리가 낯설군. 블루 사람인가? 아니, 짠 냄새가 조금 나는군. 블루에 다녀왔나.', { face: 'normal' });
    await c.say(n, '나는… 블루 등대의 등대지기였네. 983년 겨울, 하늘에서 떨어진 검은 별 조각을 쫓아 여기까지 왔지. 조각을 너무 오래 봐서 눈이 멀었고.', { face: 'sad' });
    await c.say('toria', '찍! 루체 언니 아빠야! 살아 있었어!', { face: 'shock' });
    await c.say(n, '루체를… 아는가? …그 애는 잘 있나? 등불은… 켜져 있나? 편지를 써 뒀네. 부칠 방법이 없었지. 전해 줄 수 있겠나.', { face: 'cry' });
    c.flag('orhan_q'); await c.getItem('letter_orhan');
  } });
  // 루체에게 편지 (블루 등대): 원래 루체의 말 앞에 끼워 넣는다
  for (const sp of ST.people.b_light || []) if (sp.id === 'luce') {
    const old = sp.talk, oldMark = sp.mark;
    sp.mark = (s) => (s.inv.letter_orhan ? '!' : oldMark ? oldMark(s) : null);
    sp.talk = async (c, n) => {
      if (!S().inv.letter_orhan) return old(c, n);
      c.take('letter_orhan');
      await c.say(n, '……아빠 글씨야. 아빠… 살아 있어? 블랙 마을에?', { face: 'shock' });
      await c.narr('루체가 편지를 몇 번이고 읽었다. 그러다 소리 내어 울었다.');
      await c.say(n, '눈이 멀었대. 바보 아빠. 그러니까 조각을 그렇게 오래 보지 말랬잖아.', { face: 'cry' });
      await c.say(n, '…답장 써 줄게. 가져가 줘. 불은 켜져 있다고. 절대 안 꺼진다고.', { face: 'smile' });
      await c.getItem('letter_luce');
    };
  }
  // 고르디는 9장부터 밤의 성 문지기로 옮겨 갔다
  for (const [mid, list] of Object.entries(ST.people)) { if (mid === 'world') continue; for (const sp of list) if (sp.id === 'gordi') { const old = sp.when; sp.when = (s2) => !ST.after('c9') && (old ? old(s2) : true); } }
  for (const sp of ST.people.world || []) if (sp.id === 'gordi' && !sp.x0c9) { if (sp.x >= X0 - 20) continue; const old = sp.when; sp.when = (s2) => !ST.after('c9') && (old ? old(s2) : true); }
  ST.folk('bk_shop', { name: '밤의 가게 주인', folk: 'nightm', x: 5, y: 3, lines: { c9: async (c) => { const k = await c.choice('소리 없이 사고, 소리 없이 파오.', ['물건을 산다', '괜찮아요'], { name: '밤의 가게 주인' }); if (k === 0) await c.shop('black'); } } });
  ST.folk('bk_inn', { name: '등불 여관 주인', folk: 'nightw', x: 4, y: 3, lines: { c9: async (c) => { const k = await c.choice('여긴 늘 밤이라 언제 자도 돼요. 대신 아침은 없어요. (60골드)', ['쉰다', '괜찮아요'], { name: '등불 여관 주인' }); if (k === 0) { if (S().gold >= 60) c.gold(-60); await c.rest(); } } } });
  ST.folk('world', { name: '밤 사람', folk: 'nightw', ...OW.pt(262, 58), wander: 24, lines: { c9: ['쉿. 크게 말하면 밤이 들어요. …농담이에요. 녹턴 님이 들어요.', '해? 그림으로 봤어요. 둥글고 노랗다면서요. 무섭지 않아요?'], c10: '어제 동쪽 하늘이 조금 파랬어요! 태어나서 처음 봤어요! 다들 지붕에 올라가서 울었어요.' } });
  ST.folk('world', { name: '밤 아이', folk: 'kid', ...OW.pt(272, 60), wander: 20, lines: { c9: ['리라 누나 알아? 노래하는 누나. 어릴 때 성에서 살았대. 공주님이래!', '흰빛 형아' + (girl() ? '… 아니 누나' : '') + ' 옆에 있으면 그림자가 생겨! 신기해!'] } });
  ST.folk('world', { name: '해골 기사', folk: 'knight', x: CASTLE.x + 3, y: CASTLE.y + 4, dir: 'down', when: () => !f('c9_in'), lines: { c9: '「…밤의 성. 허가 없는 자. 출입. 불가. 교대 시간. 천 년째. 안 옴.」' } });

  /* ═════════ 녹턴의 성 (던전 9) ═════════ */
  G.dungeon.def('d9', {
    name: '녹턴의 성', sub: '영원한 밤의 한가운데', pal: 'black', music: 'castle', tier: 8, floor: T.CARPET, dark: 0.75, darkCol: 'rgba(8,4,18,1)',
    start: ['1,3', 9, 10],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: CASTLE.x + 5, ty: CASTLE.y + 4 },
    rooms: {
      '1,3': { ter: [['rug', 8, 2, 4, 11]], props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 13, 11, { text: '「그림자는 빛이 있어야 생긴다.」 — 밤의 성 입구 비문' }], ['pot', 2, 11], ['pot', 17, 11]], foes: [['knight', 6, 6], ['knight', 13, 6]] },
      '1,2': { ter: [['rug', 8, 2, 4, 11]], props: [['eye', 15, 2, { sets: 'd9:eye' }], ['torch', 3, 3], ['torch', 3, 11], ['spot', 5, 3, { verb: '초상화를 본다', text: '초상화 한 줄. 역대 성주들. 맨 끝 액자는 비어 있다. 액자 밑 이름판: 「녹턴」. 그림은 그리다 만 채로, 가면만 그려져 있다.' }]], foes: [['shade', 6, 8], ['shade', 13, 8], ['mage', 9, 4]] },
      '0,2': { props: [['chest', 3, 3, { item: 'key_small' }], ['spot', 10, 3, { verb: '책장을 살핀다', text: async (c) => { await c.narr('혼인 명부. 981년 봄의 한 장만 손때가 묻어 있다.\n「그린 마을 참나무 아래. 세린 — 카이론. 증인: 에벨린, 녹턴.」'); if (!c.has('saw_wedding')) { c.flag('saw_wedding'); await c.say('toria', '……찍? 세린이랑… 카이론? 결혼?', { face: 'shock' }); } } }], ['torch', 16, 3]], foes: [['ghost', 8, 8], ['ghost', 13, 5], ['knight', 15, 10]] },
      '2,2': { props: [['chest', 16, 3, { item: 'compass' }], ['chest', 3, 11, { item: 'heartpiece' }], ['spot', 9, 5, { verb: '오르골을 연다', text: async (c) => { c.music('dream'); await c.narr('어린아이 방. 작은 침대, 작은 칼, 벽에 그린 해 그림 백 장. 모두 노란 동그라미.\n오르골을 열자 — 에벨린 할머니가 부르던 자장가가 흘러나왔다.'); if (!c.has('saw_lyraroom')) { c.flag('saw_lyraroom'); await c.say('toria', '…이 노래. 할머니 노래야. 왜 여기 있어? 여기 누가 살았어?', { face: 'shock' }); } c.music('castle'); } }], ['torch', 3, 3, { lit: true }]], foes: [['shade', 9, 9], ['bat', 14, 6]] },
      '2,1': { props: [['veil', 9, 6, { cells: [[8, 6], [9, 6], [10, 6], [11, 6]] }], ['chest', 9, 3, { item: 'map_d' }], ['chest', 16, 10, { item: 'bombs5' }], ['torch', 3, 3]], foes: [['shade', 5, 9], ['shade', 14, 9], ['ghost', 9, 11]] },
      '1,1': { solve: { type: 'clear' }, ter: [['pit', 1, 5, 18, 2]], props: [['post', 4, 3], ['post', 15, 9], ['chest', 9, 3, { item: 'key_big', big: true, hidden: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }]], foes: [['knight', 6, 10], ['knight', 13, 10], ['shade', 9, 9], ['mage', 9, 3]] },
      '0,1': { props: [['chest', 9, 6, { item: 'arrows10' }], ['spot', 9, 3, { verb: '종을 본다', text: '종탑. 종에 새긴 글씨: 「밤은 누구의 편도 아니다. 그래서 모두를 숨긴다.」 종 안쪽에 아이 키만 한 곳에 작게: 「L」.' }]], foes: [['bat', 5, 8], ['bat', 14, 8], ['ghost', 9, 10]] },
      '1,0': { boss: true, ter: [['rug', 3, 3, 14, 9]], props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'nocturne' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd9:eye'], ['2,2', '2,1', 'open'], ['1,1', '0,1', 'open'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      if (f('d9:boss')) { boss.dead = true; return; }
      r.ctl.R.onEnter = () => { G.script.run((c) => noctFight(c, boss, r)); };
    },
  });

  async function noctFight(c, boss, r) {
    c.lock(true); await c.cinema(true);
    boss.hidden = true;
    const nc = c.spawn({ cid: 'nocturne', x: boss.x, y: boss.y, dir: 'up' });
    c.camOn(nc, 3);
    c.music('dread');
    await c.narr('창가에 검은 머리칼의 사람이 서 있다. 하늘을 보고 있다. 이쪽을 돌아보지 않는다.');
    await c.say(nc, '……왔군. 세린의 아이.', { face: 'closed' });
    c.face(nc, 'down');
    await c.say(nc, '오랫동안 저 하늘을 봤다. 황금별 옆의 검은 점이 다시 커지는 걸. 카이론은 계산을 했고, 나는 하늘을 봤다. 그게 우리가 그동안 한 일이다.', { face: 'normal' });
    await c.say(nc, '막고 싶다면, 먼저 나를 넘어서라. 나는 카이론의 그림자다. 그림자는 주인을 떠나지 않는다.', { face: 'normal' });
    const k = await c.choice('녹턴이 검을 뽑는다.', [
      { t: '「해치지 않고, 멈추게 할게요. 카이론을.」', sub: '[p]약속[/]. 이 도시에서 약속은 목숨이다.' },
      { t: '검을 뽑는다', sub: '말 대신.' },
    ]);
    const promised = k === 0;
    if (promised) { c.flag('c9_promise'); await c.say(nc, '……약속. 이 도시에서 약속은 목숨이다. 좋다. 그 약속이 진짜인지 — 칼로 확인하겠다. 죽이지는 않는다.', { face: 'shock' }); }
    else await c.say(nc, '…그래. 말이 필요 없는 쪽이 편하다. 나도 그렇다.', { face: 'normal' });
    await c.cutin({ who: 'nocturne', title: '그림자 녹턴', small: '사천왕 · 검정의 자리', sub: '어둠이 짙어지면 — 흰빛으로 걷어 내라!', col: '#3a1a5a', face: 'angry', sec: 1.8 });
    nc.dead = true; boss.hidden = false;
    if (promised) { boss.duel = true; S().duel = true; G.bosses.duelTo(boss, 0.15); }
    c.camFree(); await c.cinema(false); c.lock(false);
    boss.start(); G.hud.setBoss(boss);
    c.music('boss2');
    let won;
    if (promised) { won = await c.duel(boss); S().duel = false; }
    else { won = await c.battle(boss, { music: 'boss2' }); if (!won) return; }
    const bx = boss.x, by = boss.y;
    if (promised) { boss.dead = true; G.hud.boss = null; }
    if (!won) { c.lock(true); const n2 = c.spawn({ cid: 'nocturne', x: bx, y: by }); await c.say(n2, '…다시 와라. 나는 여기 있다.', { face: 'normal' }); await c.fade(true, { sec: 0.6 }); n2.dead = true; c.heal(); G.game.goto('world', px(CASTLE.x + 6), py(CASTLE.y + 5), 'down'); await c.fade(false, { sec: 0.6 }); c.lock(false); return; }
    S().flags['d9:boss'] = true;
    await c.wait(0.6);
    await noctAfter(c, bx, by, r, promised);
  }
  async function noctAfter(c, bx, by, r, promised) {
    for (const e of G.world.ents) if (e.foe && !e.dead) e.dead = true;
    G.world.map.dark = 0.75;
    c.lock(true);
    await c.cinema(true);
    c.music('sad');
    if (!f('d9:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 5) * TS + 8, y: (r.y0 + 9) * TS + 12, flagKey: 'd9:heart' }));
    const nc = c.spawn({ cid: 'nocturne', x: bx, y: by, dir: 'down' });
    c.faceEach('hero', nc);
    await c.narr('녹턴이 무릎을 꿇었다. 얼굴을 가린 천이 흘러내렸다. 지친 눈이었다. 아주 오래 잠을 못 잔 눈.');
    await c.say(nc, '……그림자는, 빛이 있어야 생긴다. 나는 카이론의 그림자였다. 그런데 그의 빛은 16년 전에 꺼졌다. 세린과 함께.', { face: 'sad' });
    if (promised) await c.say(nc, '오래 누군가 그 말을 해 주기를 기다렸다. 「멈추겠다」. 「이기겠다」가 아니라.', { face: 'cry' });
    await c.say(nc, '책상 위의 장부를 봐라. 카이론의 [r]허용 손실 장부[/]. 마을마다 숫자가 있다. 잃어도 되는 사람의 수.', { face: 'normal' });
    c.book('b_ledger'); for (const pg of G.data.BOOKS.b_ledger.pages) await c.narr(pg);
    await c.getItem('ledger');
    await c.say('toria', '…「예비 그릇 — 세린의 아이」. 그리고 그 아래… 한 줄이 지워졌어.', { face: 'shock' });
    await c.say(nc, '내가 지웠다. 칼로.', { face: 'closed' });
    const k = await c.choice('녹턴이 입을 다문다.', [{ t: '「지운 줄에 누가 있었어요?」' }, { t: '「카이론은… 누구예요? 나한테.」' }, { t: '가만히 있는다' }]);
    // 리라 — 지워진 줄
    const Ly = S().party.includes('lyra') ? 'lyra' : c.spawn({ cid: 'lyra', x: bx - 30, y: by + 30, dir: 'up' });
    if (Ly !== 'lyra') { await c.move(Ly, bx - 20, by + 16, { speed: 60 }); }
    c.music('dream');
    await c.say(nc, k === 1 ? '…그것도 대답하겠다. 먼저, 지운 줄부터.' : k === 2 ? '…묻지 않는군. 그래도 말하겠다. 대답하지 않은 것이 내가 한 일의 전부였다. 오늘은 그 일을 그만두겠다.' : '……', { face: 'sad' });
    await c.say(nc, '지운 줄은 이랬다. 「예비 그릇 — 세린의 첫째 (1). 예측이 틀릴 경우 먼저.」', { face: 'closed' });
    await c.say(Ly, '……', { face: 'sad' });
    await c.say(nc, '세린에게는 아이가 둘 있었다. 첫째는 여기, 밤 속에 숨겼다. 카이론의 장부에서 지우고, 이름을 바꾸고, 노래를 가르쳤다. 둘째는 숲으로. 에벨린에게.', { face: 'normal' });
    await c.say(Ly, '…「두 개의 등불이 있었네. 하나는 하늘로, 하나는 숲으로.」 사실은 하나는 밤으로, 하나는 숲으로예요. 가사를 바꿨어요. 들킬까 봐.', { face: 'cry' });
    await c.say(Ly, '나는 리라예요. 세린의 첫째. …당신 ' + (girl() ? '언니' : '누나') + '예요.', { face: 'cry' });
    await c.say('toria', '………찍.', { face: 'shock' });
    await c.say(Ly, '천년제에서도, 블루에서도, 레드 광산에서도… 멀리서 봤어요. 언제 말할까 내내 재기만 했어요. 카이론처럼. …바보 같죠.', { face: 'cry' });
    const j = await c.choice('리라가 울고 있다.', [
      { t: '「' + (girl() ? '언니' : '누나') + '.」', sub: '처음 불러 본다.' },
      { t: '「…왜 이제야 말해.」' },
      { t: '말없이 손을 잡는다' },
    ]);
    if (j === 0) { await c.say(Ly, '……응. 응. 한 번 더 불러 줘요. 아니, 부르지 마요. 울 것 같아요. 이미 울지만.', { face: 'cry' }); c.bond('lyra', 3); }
    else if (j === 1) { await c.say(Ly, '…무서웠어요. 말하면 당신이 내 몫까지 짊어질까 봐. 당신은 그런 사람이니까. 엄마처럼.', { face: 'sad' }); c.bond('lyra', 2); }
    else { await c.narr('리라의 손은 차가웠다. 밤 사람의 손. 그런데 손바닥 한가운데만 따뜻했다. 흰빛이 아주 조금, 숨어 있었다.'); c.bond('lyra', 3); }
    c.flag('lyra_sister');
    // 카이론
    if (k === 1 || k === 2) {
      await c.say(nc, '그리고 카이론은… 세린의 남편이다. 981년 봄, 그린 마을 참나무 아래서. 증인은 에벨린과 나, 둘뿐이었다.', { face: 'closed' });
      await c.say(nc, '너희 둘의 아버지다. 그가 너를 「세린의 아이」라고만 부르는 이유를 생각해 봐라. 「내 아이」라고 부르는 순간, 계산이 멈추니까.', { face: 'sad' });
      c.flag('kairon_father');
      await c.say('toria', '……찍.', { face: 'shock' });
    }
    c.stopMusic(0.5);
    await c.wait(0.6);
    c.sfx('white');
    await c.narr('방 안의 공기가 무거워졌다. 창밖, 영원한 밤의 하늘 한가운데 금빛 빛줄기가 떨어져 성 꼭대기를 비췄다. 빛 속에 형체가 떠올랐다. 멀리 있는 사람의 그림자.');
    c.music('kairon');
    await c.say('kairon', '녹턴. …졌군. 처음으로.', { face: 'closed', vision: true });
    await c.say(nc, '……카이론.', { face: 'sad' });
    await c.say('kairon', '세린의 아이. …장부를 봤군. 틀린 숫자는 없다. 흑점까지 남은 날은 아흔 일. 아스트라에서 기다리겠다. 오지 않으면 내가 끝낸다.', { face: 'normal' });
    if (f('lyra_sister')) { await c.say('kairon', '…그 옆의 아이는 누구지. 장부에 없는 얼굴이군.', { face: 'shock' }); await c.say(Ly, '…장부에 없는 사람이에요. 그러니까 세지 마요.', { face: 'angry' }); await c.say('kairon', '……', { face: 'sad' }); }
    await c.say('kairon', '…오늘도 렙업이군. 세린이 늘 하던 인사다.', { face: 'sad' });
    await c.narr('빛줄기가 거두어졌다. 밤이 다시 내려앉았다. 그런데 — 동쪽 끝 하늘이, 아주 조금, 파래져 있었다.');
    c.music('sad');
    await c.say(nc, '아스트라에 가려면 하늘 정거장을 지나야 한다. 이것을 가져가라. [y]밤의 열쇠[/]. 정거장의 문을 여는 열쇠다. 아우룸 시대부터 이 성에 있었다.', { face: 'normal' });
    await c.getItem('key_night');
    await c.say(nc, '하늘로 가는 길은 남쪽 알록달록 곶의 피로스라는 발명가가 안다. 평생 로켓을 만든다고 한다. …카이론을 구해 다오. 그는 괴물이 아니다. 멈추는 순간 무너질까 봐 쉬지 못하는 사람이다.', { face: 'sad' });
    if (Ly !== 'lyra') { await c.say(Ly, '…나도 갈게요. 이번엔 멀리서 말고, 옆에서.', { face: 'smile' }); Ly.dead = true; }
    c.flag('c9_done'); c.flag('open:colorful');
    nc.dead = true;
    const bud = buddy(); if (bud !== 'lyra') ST.leave(bud);
    ST.join('lyra');
    G.world.add(new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: CASTLE.x + 6, toy: CASTLE.y + 5 }));
    await c.cinema(false);
    c.lock(false);
    c.journal('녹턴을 넘었다. 허용 손실 장부. 지워진 한 줄은 리라였다 — 세린의 첫째, 내 ' + (girl() ? '언니' : '누나') + '. ' + (f('kairon_father') ? '카이론은 우리의 아버지다. ' : '') + '밤의 열쇠를 받았다. 하늘로 가려면 알록달록 곶의 피로스를.');
    c.save();
  }

  /* ───────── 빛 씨앗 (블랙) ───────── */
  ST.seed('bk1', 'world', X0 - 6, Y0 + 5, { under: true });
  ST.seed('bk2', 'world', CASTLE.x - 5, CASTLE.y + 2, {});
  ST.seed('bk3', 'world', GRAVE.x + 6, GRAVE.y + 3, { under: true });
  ST.seed('bk4', 'world', X0 + 36, Y0 + 14, {});
})();
