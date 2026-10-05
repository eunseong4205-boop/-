/* 제7장 「눈과 기도」 — 화이트 · 이리스 대성당 · 병동 · 얼음 예배당 · 설원 · 대성당 지하(서리 무덤)
   성녀 루미에는 병자를 공짜로 고친다. 그 빛은 기도등에서 온다. 기도등은 믿는 이들의 빛을 조금씩 모은다.
   갈래마다 지하로 내려가는 까닭이 다르다(새벽: 얼음 창고를 부순다 · 질서: 감찰 · 밤: 창고의 행방).
   서리 거인 → 얼음 창고의 빛을 어떻게 할까 → 노아의 마지막 단계(설화초 · 내 빛 · 성녀의 빛) → 에델의 투구 → 루미에 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const WT = OW.towns.white, X0 = WT.x, Y0 = WT.y;         // 56, 28
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const GRAVE = { x: X0 + 4, y: Y0 - 3 };                   // 대성당 서북쪽 묘지 (지하로 가는 뚜껑문)
  const buddy = () => ({ dawn: 'rud', order: 'cassian', night: 'lyra' }[S().flags.route_lock || 'order']);
  const girl = () => S().gender === 'girl';
  const hyung = () => (girl() ? '누나' : '형아');
  ST.WHITE = { X0, Y0, GRAVE };

  ST.CH.push({ no: '제7장', id: 'c7', title: '눈과 기도', sub: '가장 따뜻한 성녀가 사는, 가장 추운 땅. 기도는 공짜가 아니다.',
    goal(s) {
      if (!f('c7_lumie')) return { text: '화이트 한가운데 이리스 대성당. 성녀 루미에를 만나자.', map: 'world', x: X0 + 16, y: Y0 + 7 };
      if (!f('c7_iska')) return { text: '동쪽 얼음 예배당의 눈먼 사제, 이스카를 찾아가자.', map: 'world', x: X0 + 26, y: Y0 + 15 };
      if (!f('c7_plan')) return { text: ({ dawn: '서쪽 설원, 새벽단 은신처로. 레아가 기다린다.', order: '카시안과 함께 성녀에게 지하 감찰을 청하자.', night: '묘지에서 리라와 만나자. 밤이 되면.' })[s.flags.route_lock || 'order'], map: 'world', x: s.flags.route_lock === 'dawn' ? HIDE.x : s.flags.route_lock === 'night' ? GRAVE.x : X0 + 16, y: s.flags.route_lock === 'dawn' ? HIDE.y + 1 : s.flags.route_lock === 'night' ? GRAVE.y + 1 : Y0 + 7 };
      if (!f('d7:boss')) return f('c7_under_ok') || s.flags.route_lock === 'order'
        ? { text: '대성당 제단 뒤 계단으로 내려가, 서리 무덤 가장 깊은 곳으로.', map: 'world', x: X0 + 16, y: Y0 + 7 }
        : { text: '묘지의 눈 덮인 쇠 뚜껑문으로 대성당 지하에 숨어든다. 서리 무덤 가장 깊은 곳으로.', map: 'world', x: GRAVE.x + 1, y: GRAVE.y + 2 };
      if (!f('c7_noah')) return { text: '병동으로. 노아가 위험하다.', map: 'world', x: X0 + 26, y: Y0 + 6 };
      if (!f('c7_edel')) return { text: '대성당을 나서려는데, 에델이 문을 막는다.', map: 'world', x: X0 + 16, y: Y0 + 7 };
      if (!f('c7_done')) return { text: '루미에와 이야기하자.', map: 'world', x: X0 + 16, y: Y0 + 7 };
      return { text: '서쪽 잿빛 땅 그레이로. 강철공 볼트를 찾아서.', map: 'world', x: OW.towns.gray.x + 15, y: OW.towns.gray.y + 11 };
    } });
  ST.closedMsg.gray = '서쪽은 잿빛 땅 그레이. 공장 연기가 길을 막고 있어. 아직은 갈 이유가 없어, 찍.';

  /* ───────── 이야기용 물건 ───────── */
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('snowherb', { type: 'key', name: '설화초', desc: '서리 무덤 안뜰에 핀 하얀 꽃. 줄기에 빛바랜 쪽지: 「빛바램 마지막 단계에. 달여서 세 모금. — S」' });
  item('crystal_snow', { type: 'key', name: '눈 결정', desc: '얼음 도깨비불이 흘린 결정. 니베가 모은다.' });
  item('letter_lumie', { type: 'letter', name: '부치지 못한 편지', desc: '루미에가 세린에게 쓴 편지. 16년 치.', read: '「세린. 오늘도 세 사람을 고쳤어. 머리가 조금 더 하얘졌어. 너처럼 되고 싶어서 그러는 건 아니야. …아니, 그런 것 같아. 너는 나눠 주라고 했지. 나는 내 걸 다 줘 버리는 방법밖에 몰라. 그게 나눔이 아니라는 걸, 알아. 알면서도.」' });
  G.data.BOOKS.b_saint = { name: '초대 성녀의 비문', short: '서리 무덤 제단 옆 비문', pages: ['「희생 없는 구원은 없다.」 — 초대 성녀', '그 아래 둥근 글씨로 누군가 긁어 썼다. 「나눔 없는 희생은 배고픔이 된다. — S」', '그 아래 또 다른 글씨. 떨리는 손. 「알아. — L」'] };

  /* ───────── 대성당 그림 ───────── */
  const B = G.build, X = G.gfx, R = B.ramp, poly = B.poly, OUT = B.OUT;
  B.SPECIAL.cathedral = function (o) {
    const w = (o.w || 11) * TS, h = 118, b = X.brush(w, h);
    const C = R('#e8eef8'), Rf = R('#6a7a9a');
    b.rect(8, 44, w - 16, h - 44, C[2]); b.rect(8, 44, 10, h - 44, C[3]); b.rect(w - 18, 44, 10, h - 44, C[1]);
    poly(b, [[4, 48], [w / 2, 16], [w - 4, 48]], Rf[2]); poly(b, [[w / 2, 16], [w - 4, 48], [w * 0.62, 48]], Rf[1]);
    for (let x = 6; x < w - 4; x += 3) b.px(x, 47 - Math.round(Math.abs(x - w / 2) * 0.0), '#ffffff');
    // 첨탑 둘
    for (const sx of [2, w - 22]) { b.rect(sx, 24, 20, h - 24, C[2]); b.rect(sx, 24, 6, h - 24, C[3]); poly(b, [[sx - 1, 26], [sx + 10, 0], [sx + 21, 26]], Rf[2]); b.vline(sx + 10, 0, 4, '#e8c860'); b.rect(sx + 6, 40, 8, 12, '#3a4a7a'); b.rect(sx + 7, 41, 6, 10, '#8ab8e8'); b.hline(sx + 7, sx + 12, 46, '#e8c860'); }
    // 장미창
    const cx = w / 2, cy = 62;
    b.ellipse(cx, cy, 15, 15, '#3a4a7a'); b.ellipse(cx, cy, 13, 13, '#8ab8e8');
    const gl = ['#ff8ab0', '#ffe066', '#8ae0a0', '#b87aff', '#6ab8ff', '#ffb84a'];
    for (let a = 0; a < 6; a++) { const ax = cx + Math.cos(a * 1.047) * 8, ay = cy + Math.sin(a * 1.047) * 8; b.ellipse(ax, ay, 3.5, 3.5, gl[a]); }
    b.ellipse(cx, cy, 3, 3, '#ffffff');
    // 문
    b.rect(cx - 13, h - 34, 26, 34, '#2a2a3a'); b.ellipse(cx, h - 34, 13, 8, '#2a2a3a'); b.rect(cx - 11, h - 32, 22, 32, '#6a4a3a'); b.ellipse(cx, h - 32, 11, 6, '#6a4a3a'); b.vline(cx, h - 38, h - 1, '#3a2a1a'); b.px(cx - 3, h - 16, '#e8c860'); b.px(cx + 2, h - 16, '#e8c860');
    // 눈 쌓임
    for (let x = 4; x < w - 4; x++) { const y = 47 - Math.round((1 - Math.abs(x - w / 2) / (w / 2)) * 31); b.px(x, y + 1, '#ffffff'); b.px(x, y + 2, '#f4f8ff'); }
    b.rect(0, h - 3, w, 3, C[0]);
    return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS, door: true };
  };

  /* ───────── 넓은 지도 ───────── */
  const HIDE = OW.pt(44, 36);           // 새벽단 은신처 (서쪽 설원 동굴)
  const SPRING = { x: X0 + 28, y: Y0 + 20 }; // 온천
  OW.hooks.push((m) => {
    ST.house(m, { id: 'w_cath', region: 'white', special: 'cathedral', tx: X0 + 11, ty: Y0 + 1, w: 11, h: 5, name: '이리스 대성당',
      room: { w: 24, h: 17, floor: T.TILE, music: 'white', rug: [11, 3, 2, 13], furn: [['altar', 11, 3, { text: '제단. 은빛 성배에 빛 알갱이가 가득하다. 믿는 이들이 기도하며 떨어뜨린 빛이라고 한다.' }], ['pew', 4, 6], ['pew', 7, 6], ['pew', 15, 6], ['pew', 18, 6], ['pew', 4, 9], ['pew', 7, 9], ['pew', 15, 9], ['pew', 18, 9], ['pew', 4, 12], ['pew', 7, 12], ['pew', 15, 12], ['pew', 18, 12], ['lamp', 2, 3], ['lamp', 21, 3], ['window', 6, 1, { wall: true, v: '#8ab8e8', text: '색유리 창. 흰 옷의 여인이 검은 해를 품에 안고 있다. 발치에 아이 하나.' }], ['window', 17, 1, { wall: true, v: '#ffb0d0', text: '색유리 창. 금빛 머리의 소년이 무릎을 꿇고 기도한다. 소년의 그림자만 까맣다.' }], ['plant', 1, 15], ['plant', 22, 15], ['bookpile', 20, 4, { text: '기도문 묶음. 「빛을 바치는 자는 복되다. 받는 자는 더 복되다.」 누가 연필로 「받는 자」에 줄을 그었다.' }]] } });
    ST.house(m, { id: 'w_ward', region: 'white', style: 'white', tx: X0 + 24, ty: Y0 + 2, w: 7, h: 4, name: '성녀의 병동', sign: 'inn',
      room: { w: 18, h: 11, floor: T.WOOD, music: 'sad', furn: [['bed2', 2, 3, { v: '#e8eef8' }], ['bed2', 5, 3, { v: '#e8eef8' }], ['bed2', 8, 3, { v: '#e8eef8' }], ['bed2', 11, 3, { v: '#e8eef8' }], ['bed2', 14, 3, { v: '#c8e0f8' }], ['fireplace', 16, 7], ['table', 8, 7], ['chair', 7, 8], ['plant', 1, 9], ['cauldron', 3, 8, { v: '#e8f4ff', text: '약탕기. 비어 있다. 성녀님은 약 대신 손을 쓰신다고 한다.' }]] } });
    ST.house(m, { id: 'w_inn', region: 'white', style: 'white', tx: X0 + 2, ty: Y0 + 13, w: 6, h: 4, name: '눈꽃 난로 여관', sign: 'inn',
      room: { w: 14, h: 10, floor: T.WOOD, music: 'calm', rug: [4, 5, 6, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['fireplace', 8, 2], ['table', 8, 6], ['chair', 7, 7], ['chair', 10, 7], ['bed2', 12, 3, { v: '#8a9ab8' }], ['bed2', 12, 6, { v: '#b8a8c8' }], ['plant', 1, 8]] } });
    ST.house(m, { id: 'w_shop', region: 'white', style: 'white', tx: X0 + 3, ty: Y0 + 4, w: 5, h: 4, name: '설원 상점', sign: 'shop',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'white', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['fireplace', 9, 6], ['crate', 2, 6]] } });
    ST.house(m, { id: 'w_iska', region: 'white', style: 'white', tx: X0 + 24, ty: Y0 + 12, w: 5, h: 4, name: '얼음 예배당', colors: { roof: '#8ab8e8' },
      room: { w: 12, h: 10, floor: T.ICE, music: 'dream', rug: [5, 3, 2, 5], furn: [['altar', 5, 3, { text: '얼음 제단. 촛불 하나 없이도 환하다. 얼음 속에 빛이 갇혀 있다.' }], ['pew', 3, 6], ['pew', 8, 6], ['crystalball', 9, 3, { text: '얼음 구슬. 이스카가 매일 닦는다. 눈이 보이지 않는데도 먼지 하나 없다.' }]] } });
    // 새벽단 은신처 (동굴)
    ST.cave(m, { x: HIDE.x, y: HIDE.y, to: 'w_hide', id: 'w_hide_gate', col: '#8a9ab0', ground: T.SNOW, road: T.SNOW, cover: O.PINE });
    // 온천: 김이 나는 작은 못
    OW.clear(m, SPRING.x - 2, SPRING.y - 1, 6, 4, m.hgt[m.i(SPRING.x, SPRING.y)], T.STONE);
    for (let y = SPRING.y; y < SPRING.y + 2; y++) for (let x = SPRING.x - 1; x < SPRING.x + 3; x++) m.ter[m.i(x, y)] = T.WATER;
    // 묘지 (대성당 뒤): 비석 + 뚜껑문
    OW.clear(m, GRAVE.x - 2, GRAVE.y - 1, 8, 5, m.hgt[m.i(GRAVE.x, GRAVE.y + 2)], T.SNOW);
    for (const [dx, dy] of [[-1, 0], [1, 0], [3, 0], [-1, 2], [3, 2]]) G.build.placeBuilding(m, { special: 'statue', tx: GRAVE.x + dx, ty: GRAVE.y + dy, w: 1, h: 1, col: '#a8b0c0', door: false, veil: dx === 3 });
    m.warps.push({ x: GRAVE.x + 1, y: GRAVE.y + 1, w: 1, h: 1, to: 'd7', id: 'd7_hatch', cond: () => (f('c7_plan') && S().flags.route_lock !== 'order') || f('d7:boss'),   /* 보스를 이긴 뒤에는 어느 갈래든 (질서 갈래는 이 문이 영영 잠겨 있었다) */ msg: '눈 덮인 쇠 뚜껑문. 자물쇠가 얼어붙었다. 아직은 열 까닭이 없다.' });
    // 꾸미기: 화로 · 전나무
    for (const [dx, dy] of [[12, 8], [20, 8], [12, 13], [20, 13]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 60, warm: 'rgba(255,190,120,0.25)' }); }
    for (const [dx, dy] of [[0, 9], [31, 9], [0, 20], [31, 18], [9, 21], [22, 21]]) if (m.inb(X0 + dx, Y0 + dy) && !m.solidExtra[m.i(X0 + dx, Y0 + dy)]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.PINE;
  });
  // 새벽단 은신처 실내
  G.build.def('w_hide', { build() { const rm = G.build.room({ id: 'w_hide', region: 'white', name: '새벽단 은신처', w: 16, h: 10, floor: T.STONE, music: 'hollow', back: ['world', HIDE.x, HIDE.y + 1], furn: [['table', 7, 4, { text: '대성당 지하 지도. 「얼음 창고」에 붉은 동그라미. 옆에 루드 글씨: 「폭약 필요량 — 확인 끝」.' }], ['crate', 2, 3], ['crate', 3, 3], ['barrel', 13, 3], ['bed2', 12, 6, { v: '#8a5a3a' }], ['fireplace', 2, 7]] }); rm.dark = 0.3; return rm; } });

  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(WT.plaza.x + 3), y: py(WT.plaza.y + 3), wid: 'w_white', name: '화이트 이리스 대성당' }));
    Wd.add(new P.Sign({ x: px(X0 + 14), y: py(Y0 + 21), text: '화이트 — 눈과 기도의 땅\n「추운 자에게 불을, 아픈 자에게 빛을」 — 이리스 대성당' }));
    Wd.add(new P.Sign({ x: px(SPRING.x - 2), y: py(SPRING.y - 1), text: '성녀의 온천\n몸을 담그면 추위가 가신다. 물이 조금 반짝인다.' }));
    Wd.add(new P.Spot({ x: px(SPRING.x), y: py(SPRING.y - 1), verb: '온천에 몸을 담근다', text: async (c) => { await c.fade(true, { sec: 0.5 }); c.heal(); ST.coldT = 0; await c.wait(0.6); await c.fade(false, { sec: 0.5 }); await c.say('toria', '찍… 녹는다… 꼬리부터 녹는다…', { face: 'happy' }); } }));
    // 니베의 눈사람 (결정 모으기)
    Wd.add(new G.build.Decor({ decor: 'dummy', v: '#ffffff', x: px(X0 + 7), y: py(Y0 + 19) + 3, text: '니베가 만든 눈사람. 코는 당근, 눈은 석탄. 옆에 아기 설인 발자국이 빙빙 돈다.' }));
  });

  /* ───────── 추위: 방한복 없이 설원에 오래 있으면 ───────── */
  ST.coldT = 0;
  ST.onTick.push((dt) => {
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p || G.script.running) { return; }
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    const reg = OW.regionOf(tx, ty);
    const inTown = tx >= X0 - 1 && ty >= Y0 - 1 && tx < X0 + WT.w + 1 && ty < Y0 + WT.h + 1;
    const d = G.st.derive(S());
    if (reg !== 'white' || inTown || d.warm) { ST.coldT = Math.max(0, ST.coldT - dt * 3); return; }
    ST.coldT += dt;
    if (ST.coldT > 7) {
      ST.coldT = 3.5;
      G.combat.hurtPlayer(p, 1, null, { noKnock: true, why: 'cold', inv: 0.2 });
      G.fx.shards(p.x, p.y - 12, 5, '#e8f8ff');
      if (!ST.coldWarned) { ST.coldWarned = true; G.ui.toast('추위가 뼛속까지 스민다 — 털 외투나 눈꽃 빵이 필요하다', 'bad'); }
    }
  });
  const oldSky7 = G.story.skyTint;
  G.story.skyTint = () => { const Wd = G.world, p = Wd.player; if (Wd.map && Wd.map.overworld && p && OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) === 'white') return 'rgba(170,200,255,' + (0.25 + Math.min(0.3, ST.coldT * 0.04)).toFixed(2) + ')'; return oldSky7 ? oldSky7() : null; };

  /* ───────── 제7장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c6_done') || f('ch:c7')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'white') return;
    S().flags['ch:c7'] = true; S().flags.noah_to_white = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c7');
      const b = buddy();
      ST.join(b);
      c.music('white');
      await c.say('toria', '찍…! 추, 추워! 꼬리털이 얼어서 바삭바삭해!', { face: 'cry' });
      if (b === 'rud') { await c.say('rud', '화이트 평균 기온 영하 십이 도. 누나는 먼저 은신처로 갔어. 서쪽 설원 동굴. …목도리 두 개 챙겨 올걸.', { face: 'normal' }); }
      else if (b === 'cassian') { await c.say('cassian', '성녀 루미에. 사천왕 하양의 자리. 스승님이 유일하게 「계산 밖」이라고 부르는 사람이다. 감찰관 자격으로 왔다. 네 곁에 있겠다고 했으니까.', { face: 'normal' }); }
      else { await c.say('lyra', '눈은 소리를 먹어요. 여기선 비밀 얘기를 해도 아무도 못 들어요. …그래서 성녀님은 이 땅을 골랐을까요.', { face: 'closed' }); }
      if (!G.st.derive(S()).warm) await c.say('toria', '마을 밖 설원에 오래 있으면 얼어. 마을 안은 화로가 있어서 괜찮대. 털 외투를 사든가… 빵이라도 먹자.', { face: 'sad' });
      c.lock(false);
      c.journal('설산 화이트에 닿았다. 이리스 대성당의 첨탑이 눈보라 사이로 보인다.');
    });
  });

  /* ───────── 루미에 ───────── */
  ST.person('w_cath', { id: 'lumie', x: 10, y: 4, dir: 'down', when: () => !f('c7_done') || true, mark: () => (!f('c7_lumie') || (f('c7_edel') && !f('c7_done')) || (S().flags.route_lock === 'order' && f('c7_iska') && !f('c7_plan')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:lumie');
    if (!f('c7_lumie')) { await lumieFirst(c, n); return; }
    if (S().flags.route_lock === 'order' && f('c7_iska') && !f('c7_plan')) { await orderPlan(c, n); return; }
    if (f('c7_edel') && !f('c7_done')) { await lumieLast(c, n); return; }
    if (f('c7_done')) { await c.say(n, ST.lines({ c7: '기도는 이제 당신을 위해 써요. 가두는 데가 아니라.', c9: '밤의 성에 가요? …에델을 데려가요. 그 애는 이제 스스로 판단할 줄 알아요.' }), { face: 'smile' }); return; }
    const k = await c.choice('성녀 루미에', ['치료를 받는다', '세린에 대해', '그만둔다'], { who: 'lumie', name: '성녀 루미에' });
    if (k === 0) { c.heal(); c.sfx('heal'); G.fx.glow(G.world.player.x, G.world.player.y - 10, '#fff4d0', 16); await c.say(n, '다 나았어요. 공짜예요. …공짜는 아니지만, 당신이 낼 건 없어요.', { face: 'smile' }); }
    else if (k === 1) await c.say(n, '세린은 웃음이 많았어요. 나는 걔 옆에서 웃는 법을 배웠고… 걔가 없어지고 나서 잊어버렸어요.', { face: 'sad' });
  } });
  async function lumieFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    c.music('white');
    await c.say(n, '어서 와요, 흰빛의 아이. 먼 길이었죠. 머리에 눈이 쌓였네요. 이리 와요, 털어 줄게요.', { face: 'smile' });
    await c.narr('루미에의 머리칼은 눈보다 하얬다. 뿌리부터 끝까지. 손끝은 따뜻했다. 따뜻한데, 조금 비쳤다.');
    await c.say(n, '나는 루미에. 사천왕 하양의 자리에 앉아 있지만… 그냥 아픈 사람을 돌보는 사람이에요. 세린의 친구였어요.', { face: 'normal' });
    if (!G.st.derive(S()).warm && !S().inv.ar_cold) { await c.say(n, '이 옷으로 설원을 건넜어요? 세상에. 이걸 입어요. 병동 아이들 겨울옷을 짓다가 남은 천으로 만든 거예요.', { face: 'sad' }); await c.getItem('ar_cold'); }
    await c.say(n, '천년제 소식은 들었어요. 기둥을 부쉈다죠. …그리고 머리 한 가닥이 하얘졌다고.', { face: 'sad' });
    await c.say(n, '그건 빛을 너무 많이 쓴 사람한테 생기는 거예요. 나처럼.', { face: 'closed' });
    await c.say(n, '병동에 노아라는 아이가 있어요. 블루에서 옮겨 왔어요. 여기가 마지막 병원이거든요. 당신 이름을 불러요, 가끔.', { face: 'sad' });
    await c.say(n, '…그리고 하나 더. 말하지 않으면 당신은 모르고 천년성에 가겠죠. 그러면 안 돼요.', { face: 'normal' });
    await c.say(n, '카이론의 생각은 이래요. 흑점이 오면, 아스트라의 수정 속 [y]세린의 그릇[/]으로는 더 막을 수 없어요. 16년 동안 닳았으니까.', { face: 'normal' });
    await c.say(n, '[r]그래서 새 그릇이 필요해요. 세린의 아이.[/]', { face: 'sad' });
    await c.say('toria', '찍——!! 말도 안 돼! 새 그릇이라니, 수정 속에 넣는다는 거잖아! 엄마처럼!', { face: 'angry' });
    await c.say(n, '…나는 그게 사랑이라고 믿어요. 한 사람이 모두를 위해 빛나는 것. 세린이 그랬던 것처럼. 나도 매일 조금씩 그렇게 해요.', { face: 'closed' });
    await c.say(n, '그러니 여기 있어요. 대성당은 따뜻해요. 그날이 올 때까지, 내가 당신을 지킬게요.', { face: 'smile' });
    const b = buddy();
    if (b === 'cassian') await c.say('cassian', '…스승님은 나한테 그 이야기를 하신 적이 없다. 단 한 번도.', { face: 'shock' });
    else if (b === 'rud') await c.say('rud', '그러니까 대륙 전체를 위해서 한 명을. 계산상으로는 맞아. …계산상으로는.', { face: 'angry' });
    else await c.say('lyra', '……', { face: 'sad' });
    await c.say(n, '동쪽 얼음 예배당에 이스카라는 아이가 있어요. 눈이 보이지 않지만 빛을 봐요. 당신 빛을 한번 보여 줘요. 그 애가 당신을 어떻게 보는지, 나도 궁금해요.', { face: 'normal' });
    c.flag('c7_lumie');
    await c.cinema(false);
    c.lock(false);
    c.journal('성녀 루미에를 만났다. 카이론의 계획: 흑점을 막으려면 세린의 그릇 대신 새 그릇 — 나를 쓴다.');
  }

  /* ───────── 이스카: 눈먼 얼음 사제 ───────── */
  ST.person('w_iska', { id: 'iska', x: 6, y: 5, dir: 'down', mark: () => (f('c7_lumie') && !f('c7_iska') ? '!' : null), talk: async (c, n) => {
    c.flag('met:iska');
    if (!f('c7_lumie')) { await c.say(n, '…발소리가 따뜻하네요. 성녀님을 먼저 뵈어요. 그다음에 와요.', { face: 'closed' }); return; }
    if (!f('c7_iska')) {
      c.lock(true);
      await c.cinema(true);
      await c.say(n, '거기 서 있어요. 가까이 오지 말고요. …보여요.', { face: 'closed' });
      await c.narr('이스카의 눈은 얼음처럼 맑고 아무것도 비추지 않았다. 그런데 그 눈이, 정확히 네 가슴께를 보고 있었다.');
      await c.say(n, '하얘요. 눈부시게. 성녀님보다 더. 그런데 — 바닥이 없어요.', { face: 'shock' });
      await c.say(n, '바닥에 검은 점이 하나 있어요. 아주 작은. 그 점이 숨을 쉬어요. 당신이 빛을 쓸 때마다 조금씩 커져요.', { face: 'sad' });
      await c.say('toria', '찍… 그게 무슨 말이야. 무섭게 하지 마.', { face: 'shock' });
      await c.say(n, '나도 어릴 때 그릇 후보였어요. 대성당에서 시험을 봤지요. 떨어졌어요. 대신 눈의 빛을 바쳤어요. 성녀님이 그 빛으로 아이 셋을 살렸대요.', { face: 'closed' });
      await c.say(n, '후회는 안 해요. …가끔, 눈이 오는 소리를 보고 싶을 뿐이에요.', { face: 'smile' });
      await c.say(n, '대성당 지하에 [y]서리 무덤[/]이 있어요. 그 밑에 [y]얼음 창고[/]. 기도등이 모은 빛을 얼려서 보관하는 곳. 성녀님이 병자를 고치는 빛은 전부 거기서 나와요.', { face: 'normal' });
      await c.say(n, '요즘 창고가 넘쳐요. 그리고 무덤 가장 깊은 곳의 [r]서리 거인[/]이 뒤척여요. 이 눈보라, 거인의 숨이에요.', { face: 'sad' });
      await c.say(n, '서리 거인은… 옛날 사람이었어요. 초대 성녀님 시절에 그릇이 되려다 실패한 사람. 빛을 너무 많이 삼켰는데 채워지지 않아서, 배가 고파서 얼어 버렸대요.', { face: 'closed' });
      c.flag('c7_iska');
      c.abyss('iska_saw');
      const rt = S().flags.route_lock || 'order';
      await c.say(n, rt === 'dawn' ? '당신 친구들, 새벽단이 창고를 부수려고 해요. 서쪽 설원 동굴에 있어요. 부수면 빛은 돌아가요. 그런데 거인도 깨어나요.' : rt === 'order' ? '감찰관님이 계시네요. 성녀님께 지하 감찰을 청해 보세요. 성녀님은 거절하지 못할 거예요. 거짓말을 못 하시거든요.' : '밤이 되면 묘지로 가 보세요. 대성당 뒤. 누군가 뚜껑문 얼음을 녹여 두었어요. 발소리가 고양이 같았어요.', { face: 'normal' });
      await c.cinema(false);
      c.lock(false);
      c.journal('얼음 예배당의 이스카가 내 빛을 봤다. 「하얗다. 그런데 바닥이 없다. 바닥에 검은 점이 숨을 쉰다.」');
      return;
    }
    await c.say(n, ST.lines({ c7: f('d7:boss') ? '거인의 숨이 멎었어요. 눈이 조용히 와요. 이런 눈은 처음 봐요. …들려요, 보이는 것처럼.' : '당신 빛이 흔들려요. 겁이 나면 흔들리는 거예요. 괜찮아요.', c9: '밤의 성에서도 당신이 보일 거예요. 거기선 당신밖에 빛나지 않으니까.' }), { face: 'smile' });
  } });

  /* ───────── 갈래마다 다른 지하행 ───────── */
  // 질서: 성녀에게 감찰을 청한다
  async function orderPlan(c, n) {
    c.lock(true);
    await c.say('cassian', '성녀님. 기사단 감찰관 카시안입니다. 대성당 지하, 「얼음 창고」의 감찰을 청합니다. 챔피언께 보고되지 않은 빛의 보관은 방위령 위반입니다.', { face: 'normal' });
    await c.say(n, '……', { face: 'sad' });
    await c.say(n, '거짓말은 못 해요. 있어요. 16년 동안 모았어요. 보고하지 않은 건… 카이론이 가져갈까 봐서요. 여기 아픈 사람들 몫이라서요.', { face: 'closed' });
    await c.say('cassian', '…규칙대로라면 압수입니다. 그러나 감찰이 먼저입니다. 서리 거인이 깨어난다면 보관 자체가 위험하니까.', { face: 'normal' });
    await c.say(n, '제단 뒤 계단이에요. 조심해요. 거인은 불을 싫어해요.', { face: 'normal' });
    c.flag('c7_plan'); c.flag('c7_under_ok');
    c.lock(false);
    c.journal('카시안이 감찰관 자격으로 성녀에게 지하 감찰을 청했다. 성녀는 거짓말을 하지 않았다.');
  }
  // 새벽: 은신처의 레아
  ST.person('w_hide', { id: 'lea', x: 7, y: 6, dir: 'down', when: () => ST.after('c7') && !f('c7_done'), mark: () => (S().flags.route_lock === 'dawn' && f('c7_iska') && !f('c7_plan') ? '!' : null), talk: async (c, n) => {
    const rt = S().flags.route_lock;
    if (rt !== 'dawn') { await c.say(n, '여긴 새벽단 은신처야. 네가 우리 쪽이 아닌 건 알아. 그래도 추우면 불 쬐고 가.', { face: 'normal' }); return; }
    if (!f('c7_iska')) { await c.say(n, '왔구나. 먼저 성녀랑 예배당 사제를 만나 봐. 적을 알아야 부수지.', { face: 'smirk' }); return; }
    if (f('c7_plan')) { await c.say(n, '뚜껑문은 묘지에. 폭약은 루드가 들고 있어. 창고 앞에서 신호해.', { face: 'smirk' }); return; }
    c.lock(true);
    await c.say(n, '얼음 창고. 16년 치 기도등 빛이 얼어 있어. 탑 수백 개 분량이야. 성녀는 그걸로 병자를 고친대. 공짜로.', { face: 'normal' });
    await c.say(n, '공짜? 그 빛은 기도한 사람들 거야. 성녀가 조금씩 떼어 먹은 거라고. 착하게 떼어 먹은 거.', { face: 'angry' });
    await c.say('rud', '창고를 부수면 빛이 눈보라처럼 흩어져서 원래 주인들한테 돌아가. 어림해 봤어. 대부분은.', { face: 'normal' });
    await c.say(n, '묘지 뚜껑문 얼음은 녹여 놨어. 오늘 밤에 가.', { face: 'smirk' });
    c.flag('c7_plan');
    c.lock(false);
    c.journal('새벽단 은신처에서 레아의 계획을 들었다. 대성당 지하 얼음 창고를 부순다.');
  } });
  // 밤: 묘지에서 리라와 미드나잇 (리라는 동료로 함께 있다)
  ST.onTick.push(() => {
    if (S().flags.route_lock !== 'night' || !f('c7_iska') || f('c7_plan') || G.script.running) return;
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p) return;
    if (U.dist(p.x, p.y, px(GRAVE.x + 1), py(GRAVE.y + 1)) > 70) return;
    S().flags.c7_plan = true;
    G.script.run(async (c) => {
      c.lock(true);
      await c.say('lyra', '쉿. 발소리 줄여요. 성녀님은 잠귀가 밝아요. 기도하느라 잘 안 자거든요.', { face: 'closed' });
      const mn = c.spawn({ cid: 'midnight', x: px(GRAVE.x + 1), y: py(GRAVE.y + 2), dir: 'down' });
      c.jump(mn, 10);
      await c.say('midnight', '냐옹. 오랜만이군, 흰빛. 뚜껑문 얼음은 내가 녹였다. 고양이 혀는 따뜻하거든.', { face: 'smirk' });
      await c.say('lyra', '미드나잇이 궁금해하는 건 창고 자체가 아니에요. 창고의 빛이 [p]어디로 새고 있는지[/]예요. 16년 치치고는 너무 적대요.', { face: 'normal' });
      await c.say('midnight', '누군가 빼돌리고 있다. 성녀는 아니다. 성녀는 거짓말을 못 하니까. 내려가서 봐라. 보이는 걸 다 기억해라.', { face: 'normal' });
      await c.move(mn, mn.x + 80, mn.y, { speed: 120 }); mn.dead = true;
      c.flag('met:midnight');
      c.lock(false);
      c.journal('묘지에서 리라와 미드나잇을 만났다. 얼음 창고의 빛이 어딘가로 새고 있다.');
    });
  });
  // 질서 갈래의 계단: 대성당 제단 뒤
  class StairDown extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'stairdown', solid: false, bw: 1, bh: 1 }, o)); }
    update(dt, Wd) {
      this.t += dt; const p = Wd.player; if (!p || G.script.running) return;
      const near = Math.abs(p.x - this.x) < 12 && Math.abs(p.y - this.y) < 8;
      if (!near) { this.warned = false; return; }
      if (this.cond()) { if (!this.used) { this.used = true; G.game.useWarp({ to: 'd7', dir: 'up', sfx: 'stairs' }); } }
      else if (!this.warned) { this.warned = true; G.ui.toast('제단 뒤 계단. 쇠사슬이 걸려 있다.', 'bad'); }
    }
    drawShadow(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const cols = ['#a8b0c0', '#7a8298', '#4a5268', '#262a3a'];
      for (let k = 0; k < 4; k++) { g.fillStyle = cols[k]; g.fillRect(x - 12 + k, y - 12 + k * 3, 24 - k * 2, 3); }
      if (!this.cond()) { g.fillStyle = '#8a8a9a'; for (let k = -10; k < 10; k += 3) g.fillRect(x + k, y - 8 + (k & 2 ? 1 : 0), 2, 1); }
    }
    draw() {}
  }
  ST.onMap('w_cath', (m, Wd) => { Wd.add(new StairDown({ x: 16 * TS + 8, y: 3 * TS + 10, cond: () => f('c7_under_ok') || (f('d7:boss') && f('c7_plan')) })); });

  /* ───────── 병동: 노아 · 환자 셋 ───────── */
  ST.person('w_ward', { id: 'noah', x: 14, y: 4, dir: 'down', state: 'sit', when: () => ST.after('c7'), mark: () => (f('d7:boss') && !f('c7_noah') ? '!' : null), talk: async (c, n) => {
    if (f('d7:boss') && !f('c7_noah')) { await noahCrisis(c, n); return; }
    await c.say(n, ST.lines({ c7: f('c7_noah') ? hyung() + '. 손이 따뜻해. 이번엔 진짜로. 오래 갈 것 같아.' : hyung() + '…! 왔다. 진짜 왔다. 나 여기 추워서 싫었는데, ' + hyung() + ' 오니까 괜찮아.||머리가 이제 다 하얘. 성녀님이랑 똑같대. 칭찬인지 모르겠어.', c9: '창밖이 까매. 밤의 땅 쪽이래. ' + hyung() + '는 거기 가지? 돌아오면 눈사람 만들자.' }), { face: 'smile' });
  } });
  for (const [i, x] of [[0, 2], [1, 5], [2, 8]]) {
    ST.person('w_ward', { name: '환자', folk: ['farmer', 'oldw', 'kidg'][i], x, y: 4, dir: 'down', state: 'sit', mark: () => (!f('ward' + i) && f('c7_lumie') ? '?' : null), talk: async (c, n) => {
      if (f('ward' + i)) { await c.say(n, ['손이 따뜻해요. 오랜만에 꿈을 꿨어요. 색이 있는 꿈.', '고마워요, 흰빛. 성녀님 말고 다른 손은 처음이었어요.', '언니, 나 이제 눈사람 만들 수 있어!'][i], { face: 'smile' }); return; }
      await c.say(null, ['침대의 사내. 머리칼과 눈썹이 하얗게 바랬다. 손끝이 유리처럼 조금 비친다.', '할머니 환자. 「성녀님이 오늘은 안 오시네…」 목소리가 눈 위의 발자국처럼 희미하다.', '어린 여자아이. 창밖의 눈을 세고 있다. 「백 개까지 세면 엄마가 온대.」'][i], { style: 'narr' });
      const k = await c.choice('어떻게 할까?', [{ t: '손을 잡고 빛을 조금 나눈다', sub: '나눈 만큼 조금 지친다.', tag: 'dawn' }, { t: '빨간 물약을 건넨다', sub: S().inv.potion_r ? '물약 하나.' : '물약이 없다.', if: !!S().inv.potion_r }, { t: '그냥 둔다' }]);
      if (k === 0) { c.flag('ward' + i); S().shareCount = (S().shareCount || 0) + 1; c.route('dawn', 1, true); c.sfx('heal'); G.fx.glow(n.x, n.y - 10, '#fff4d0', 12); const d = G.st.derive(S()); S().mp = Math.max(0, S().mp - Math.round(d.mpMax * 0.3)); await c.narr('손바닥으로 빛이 흘러간다. 강물처럼 천천히. 환자의 손끝에서 유리 같은 투명함이 물러난다.'); c.bond('lumie', 1); }
      else if (k === 1 && S().inv.potion_r) { c.take('potion_r'); c.flag('ward' + i); await c.narr('물약을 마시자 뺨에 조금 핏기가 돈다. 빛바램은 그대로지만, 오늘 밤은 잘 잘 것이다.'); }
    } });
  }
  async function noahCrisis(c, n) {
    c.lock(true);
    await c.cinema(true);
    c.music('sad');
    await c.narr('노아가 기침을 했다. 그리고 멈추지 않았다. 손가락이 — 손가락 끝이 유리처럼 투명해졌다. 손목까지.');
    await c.say(n, hyung() + '… 손이 안 보여. 이상하다. 안 아파. 그냥… 가벼워.', { face: 'sad' });
    const lu = c.spawn({ cid: 'lumie', x: n.x - 30, y: n.y + 20, dir: 'right' });
    await c.move(lu, n.x - 16, n.y + 10, { speed: 120 });
    await c.say(lu, '마지막 단계예요. 이 단계는 손을 잡고 나누는 걸로는 안 돼요. 누군가의 빛이 통째로 들어가야 해요.', { face: 'sad' });
    await c.say(lu, '내가 할게요. 16년 동안 해 온 일이에요. 머리칼이 조금 더 하얘질 뿐이에요. …조금 더.', { face: 'smile' });
    const ed = c.spawn({ cid: 'edel', x: n.x + 30, y: n.y + 24, dir: 'left' });
    await c.say(ed, '성녀님. 지난달에도 그러셨소. 지난주에도. 이번엔 머리칼이 아니라 숨이 하얘질 거요.', { face: 'angry' });
    const opts = [];
    if (S().inv.snowherb) opts.push({ t: '설화초를 달인다', sub: '서리 무덤 안뜰의 하얀 꽃. 쪽지에 「S」.' });
    opts.push({ t: '내 빛을 넣는다', sub: '통째로는 아니다. 필요한 만큼만. 앞머리가 더 하얘질지도.', tag: 'dawn' });
    opts.push({ t: '성녀에게 맡긴다', sub: '그녀가 원하는 일이다.', tag: 'order' });
    const k = await c.choice('노아의 손목이 투명해진다.', opts);
    const pick = opts[k].t;
    if (pick === '설화초를 달인다') {
      c.take('snowherb');
      await c.narr('수녀가 약초를 달였다. 김이 오르자 병동에 겨울 아침 냄새가 퍼졌다.\n한 모금. 노아의 손목에서 투명함이 물러났다. 두 모금. 손가락이 돌아왔다. 세 모금.');
      await c.say(n, '…' + hyung() + '. 손이 보여. 손톱에 때도 보여. 헤헤.', { face: 'happy' });
      await c.say(lu, '……약초로? 빛을 쓰지 않고?', { face: 'shock' });
      await c.say(lu, '서리 무덤에 16년 동안 다녔는데… 한 번도 안뜰의 꽃을 들여다보지 않았어요. 기도만 했어요.', { face: 'sad' });
      await c.say(lu, '세린. 당신은 희생 말고 다른 걸 심어 두고 갔군요. 누가 찾아 주길 바라면서.', { face: 'cry' });
      c.flag('noah_herb'); c.bond('lumie', 2); c.bond('noah', 2);
    } else if (pick === '내 빛을 넣는다') {
      c.flash('#ffffff', 0.4); c.sfx('white');
      await c.narr('손바닥에서 빛이 빠져나갔다. 강물처럼. 팔이 차가워지고, 시야 가장자리가 하얗게 바랬다.\n노아가 숨을 크게 들이쉬었다. 그리고 울었다. 살아 있는 아이의 울음이었다.');
      await c.say('toria', '찍…! 너 앞머리… 하얀 게 두 가닥이 됐어.', { face: 'shock' });
      await c.say(lu, '……당신도 결국 스스로를 내주는군요. 세린처럼.', { face: 'sad' });
      await c.say(lu, '…아니에요. 세린이랑은 달라요. 당신은 나눠 준 뒤에도 서 있잖아요. 필요한 만큼만. …그런 방법도 있었군요.', { face: 'shock' });
      c.flag('noah_own'); S().shareCount = (S().shareCount || 0) + 2; c.abyss('noah_own'); c.bond('noah', 3); c.route('dawn', 1);
    } else {
      await c.narr('루미에가 노아의 가슴에 손을 얹었다. 남아 있던 금빛이 — 뿌리 쪽에 아주 조금 남아 있던 금빛이 — 눈 한 번 깜빡이는 사이에 사라졌다.\n노아는 살았다. 루미에는 그 자리에 무릎을 꿇었다.');
      await c.say(lu, '…괜찮아요. 이게 제 일이에요. 맡겨 줘서… 기뻐요. 정말로.', { face: 'smile' });
      await c.say(ed, '……', { face: 'sad' });
      c.flag('noah_lumie'); c.route('order', 1); c.bond('noah', 1);
    }
    lu.dead = true; ed.dead = true;
    c.flag('c7_noah');
    c.music('white');
    await c.cinema(false);
    c.lock(false);
    c.journal(f('noah_herb') ? '노아가 마지막 단계에 들었다. 세린이 심어 둔 설화초가 노아를 살렸다.' : f('noah_own') ? '노아가 마지막 단계에 들었다. 내 빛을 필요한 만큼 나눴다. 앞머리가 두 가닥 하얘졌다.' : '노아가 마지막 단계에 들었다. 루미에가 남은 빛을 다 썼다. 노아는 살았다.');
  }

  /* ───────── 에델: 대성당 문 앞 ───────── */
  ST.enterHooks.push((m) => {
    if (m.id !== 'world' || !f('c7_noah') || f('c7_edel')) return;
    S().flags.c7_edel_go = true;
    G.script.run(edelDuel);
  });
  async function edelDuel(c) {
    const p = G.world.player;
    c.lock(true);
    await c.cinema(true);
    const ed = c.spawn({ cid: 'edel', x: p.x, y: p.y + 40, dir: 'up' });
    c.faceEach('hero', ed);
    await c.say(ed, '……미안하오. 성녀님의 명이오.', { face: 'normal' });
    await c.say(ed, '그대를 화이트 밖으로 내보낼 수 없소. 흑점의 날까지 대성당에 머무르게 하라 하셨소. 그대를 지키는 것이 성녀님을 지키는 일이라 하셨소.', { face: 'normal' });
    await c.say('toria', '찍! 비켜! 우린 갈 거야!', { face: 'angry' });
    await c.say(ed, '그렇다면 백은 기사의 창을 넘어가시오. 한 수 청하오.', { face: 'angry' });
    await c.cutin({ who: 'edel', title: '에델', small: '백은 기사', sub: '긴 창 — 찌르기 뒤 빈틈을!', col: '#4a6ad8', face: 'angry', sec: 1.6 });
    ed.dead = true;
    const boss = G.bosses.spawn('cassian', p.x, p.y + 40, { hpMul: 1.6 });
    boss.look = Object.assign({}, G.cast.get('edel').look); boss.name = '에델'; boss.title = '백은 기사 · 에델'; boss.atk = 5;
    boss.duel = true; boss.home = { x: p.x, y: p.y + 30 }; G.bosses.duelTo(boss, 0.2);
    S().duel = true;
    await c.cinema(false);
    c.lock(false);
    boss.start(); G.hud.setBoss(boss); c.music('boss2');
    const win = await c.duel(boss);
    S().duel = false;
    const bx = boss.x, by = boss.y; boss.dead = true; G.hud.boss = null;
    c.lock(true);
    await c.cinema(true);
    const ed2 = c.spawn({ cid: 'edel', x: bx, y: by }); c.faceEach('hero', ed2);
    c.music('white');
    if (!win) {
      await c.say(ed2, '…아직이오. 그대의 빛이 더 자라면 다시 오시오. 나는 여기 있겠소.', { face: 'normal' });
      ed2.dead = true; S().flags.c7_edel_go = false;
      c.heal();
      G.game.goto('w_cath', 12 * TS + 8, 14 * TS + 12, 'up');
      await c.cinema(false); c.lock(false);
      return;
    }
    await c.say(ed2, '……졌소.', { face: 'shock' });
    await c.say(ed2, '백은 기사의 서약 셋째 조항. 「성녀와 약한 자가 부딪칠 때, 백은 기사는 투구를 벗고 스스로 판단한다.」', { face: 'closed' });
    await c.narr('에델이 처음으로 투구를 벗었다. 투구 아래에는 은색 머리칼의 젊은 여인이 있었다. 한쪽 눈썹이 하얗게 바래 있었다.');
    await c.say(ed2, '어릴 적 나는 빛바램병으로 죽어 가고 있었소. 성녀님이 나를 살렸소. 그래서 성녀님의 모든 명을 따랐소. 16년을.', { face: 'sad' });
    await c.say(ed2, f('noah_herb') ? '그런데 오늘 그대는 꽃 한 송이로 아이를 살렸소. 희생 없이.' : f('noah_own') ? '그런데 오늘 그대는 필요한 만큼만 나누고 서 있었소. 쓰러지지 않고.' : '그런데 오늘 성녀님이 무릎 꿇는 것을 보았소. 기쁘다고 하셨소. 나는… 기쁘지 않았소.', { face: 'normal' });
    await c.say(ed2, '이 검을 가져가시오. 성기사의 [y]백은검[/]. 망자와 어둠을 벤다. 성녀님을 막는 데 쓰시오. 성녀님도… 사실은 누군가 자신을 막아 주길 기다리고 계셨소.', { face: 'normal' });
    await c.getItem('sw_silver');
    c.flag('c7_edel'); c.bond('edel', 2);
    ed2.dead = true;
    c.heal();
    await c.cinema(false);
    c.lock(false);
    c.journal('에델이 투구를 벗었다. 「스스로 판단한다」. 백은검을 받았다.');
  }

  /* ───────── 루미에와의 마지막 이야기 ───────── */
  async function lumieLast(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '에델이 투구를 벗었군요. 16년 만에.', { face: 'sad' });
    await c.say(n, '…말해 줘요. 희생 말고 다른 길이 정말 있어요? 나는 16년 동안 찾지 못했어요.', { face: 'normal' });
    const k = await c.choice('루미에에게 뭐라고 할까?', [
      { t: '「세린은 나눠 주라고 했어요. 다 주라고 하지 않았어요.」', sub: '세린의 노트.', if: !!S().truth.t_note },
      { t: '「설화초를 심은 건 엄마예요. 누가 찾길 바라면서.」', if: f('noah_herb') },
      { t: '「필요한 만큼만 나눠도 서 있을 수 있어요.」', if: f('noah_own') || (S().shareCount || 0) >= 2 },
      { t: '「모르겠어요. 그래도 수정 속에 들어가진 않을 거예요.」' },
    ]);
    if (k === 3) await c.say(n, '…그 말이 제일 정직하네요. 나도 16년 전에 그렇게 말할 걸 그랬어요.', { face: 'sad' });
    else { await c.say(n, '……', { face: 'cry' }); await c.say(n, '16년 동안 나는 세린의 희생을 사랑이라고 불렀어요. 그렇게 부르지 않으면 견딜 수 없었으니까. 그런데 세린은… 희생을 원한 게 아니었죠.', { face: 'cry' }); c.bond('lumie', 2); c.flag('lumie_moved'); }
    await c.say(n, '이걸 가져가요. [y]치유의 빛[/]. 내 기도를 당신 손에 옮겨 둘게요. 이제 기도는 당신을 지키는 데 쓸게요. 가두는 데가 아니라.', { face: 'smile' });
    G.st.learnSpell(S(), 'heal'); c.sfx('heal'); c.flash('#e8fff0', 0.3);
    await c.say(null, '[g]치유의 빛[/]을 배웠다! 하트 2칸을 천천히 채운다.', { style: 'sys' });
    await c.say(n, '그리고 이것. 부치지 못한 편지예요. 세린에게 쓴 거예요. 16년 치. …이제 당신한테 부칠게요.', { face: 'sad' });
    await c.getItem('letter_lumie');
    await c.say(n, '그레이 지방의 [y]강철공 볼트[/]를 만나요. 징수탑을 설계한 사람이에요. 은빛 왕국이 왜 잿빛이 되었는지, 그는 알아요. …그리고 16년 동안 모른 척했을 거예요. 나처럼.', { face: 'normal' });
    c.flag('c7_done'); c.flag('open:gray');
    ST.leave(buddy());
    await c.cinema(false);
    c.lock(false);
    c.journal('루미에에게 치유의 빛과 부치지 못한 편지를 받았다. 다음은 그레이의 강철공 볼트.');
    G.script.run(toriaNight);
  }
  // 토리아의 밤: 도망가자
  async function toriaNight(c) {
    c.lock(true);
    await c.fade(true, { sec: 1 });
    ST.toNight && ST.toNight();
    G.game.goto('w_inn', 8 * TS + 8, 5 * TS + 12, 'down');
    await c.fade(false, { sec: 1 });
    c.music('calm');
    await c.narr('눈꽃 난로 여관. 장작이 탁탁 튄다. 토리아가 목도리 속으로 파고들었다. 꼬리만 밖에 내놓고.');
    await c.say('toria', '…새 그릇이라니. 너를 수정 속에 넣는다는 거잖아. 엄마처럼. 나 그거 허락 못 해. 다람쥐가 허락하고 말고가 어딨냐고 하겠지만. 못 해.', { face: 'angry' });
    await c.say('toria', '…도망가자. 지금. 창문으로. 나 창문 여는 거 잘해. 설원 건너면 아무도 못 찾아.', { face: 'sad' });
    const k = await c.choice('토리아가 창문 걸쇠에 발을 올린다.', [{ t: '「안 가. 끝까지 갈 거야.」' }, { t: '「…나도 도망가고 싶어.」' }]);
    if (k === 0) await c.say('toria', '…그럴 줄 알았어. 그냥 한번 말해 본 거야. 말해 봐야 네가 안 간다는 걸 확인하니까. 확인하면 나도 안 무서우니까.', { face: 'smile' });
    else { await c.say('toria', '……처음 들었다. 네가 그런 말 하는 거.', { face: 'shock' }); await c.say('toria', '괜찮아. 도망가고 싶은 거랑 도망가는 거는 달라. 할머니가 그랬어. 할머니도 983년에 도망가고 싶었대. 그래서 초록 창을 부러뜨린 척했대.', { face: 'smile' }); c.bond('toria', 2); c.flag('told_toria_scared'); }
    await c.say('toria', '…이거. 내 깃털. 날지는 못해도 가볍잖아. 달고 다녀. 무서울 때 만지면 나 생각나게.', { face: 'blush' });
    await c.getItem('ac_feather');
    await c.narr('토리아는 목도리 속에서 금방 잠들었다. 잠꼬대로 「찍」 한 번.');
    c.lock(false);
  }

  /* ───────── 주민 · 가게 ───────── */
  ST.folk('w_shop', { name: '설원 상점 주인', folk: 'merchant', x: 5, y: 3, lines: { c7: async (c) => { const k = await c.choice('털 외투, 눈꽃 빵, 물약! 설원에선 셋 다 목숨이오.', ['물건을 산다', '괜찮아요'], { name: '설원 상점 주인' }); if (k === 0) await c.shop('white'); } } });
  ST.folk('w_inn', { name: '난로 여관 주인', folk: 'oldw', x: 4, y: 3, lines: { c7: async (c) => { const k = await c.choice('장작 하나에 이야기 하나. 쉬어 가요. (50골드)', ['쉰다', '괜찮아요'], { name: '난로 여관 주인' }); if (k === 0) { if (S().gold >= 50) c.gold(-50); await c.rest(); } } } });
  ST.folk('w_cath', { name: '수녀', folk: 'nun', x: 5, y: 14, wander: 20, lines: { c7: ['성녀님은 하루에 세 번 기도하시고, 네 번 병동에 가세요. 잠은… 모르겠어요.', '기도등이요? 제단 앞 은빛 성배요. 기도하는 사람 손에서 빛이 한 방울씩 떨어져요. 그게 다 어디로 가냐고요? …얼음 창고로요.'], c8: '성녀님이 웃으세요. 요즘. 에델 기사님도요. 투구를 벗고 다니세요. 추울 텐데.' } });
  ST.folk('w_cath', { name: '기도하는 순례자', folk: 'oldm', x: 17, y: 10, dir: 'up', lines: { c7: ['삼십 년째 기도하오. 기도할 때마다 조금씩 피곤해지오. 그게 믿음이라고 배웠소.', '성녀님이 내 손녀를 고쳐 주셨소. 공짜로. 그러니 나는 내 빛을 바치오. 이것도 공짜요. 그렇지 않소?'] } });
  ST.folk('world', { name: '장작 패는 아저씨', folk: 'smith', x: X0 + 8, y: Y0 + 11, lines: { c7: ['장작이 떨어지면 화이트는 끝이야. 요즘 눈보라가 이상해. 대성당 밑에서 부는 것 같아.', '성녀님 머리 봤나? 작년엔 은빛이었는데, 올해는 눈빛이야.'], c8: '눈보라가 멎었어! 장작이 남아돌아. 이런 해는 처음이야.' } });
  ST.folk('world', { name: '순례자', folk: 'nun', x: X0 + 18, y: Y0 + 15, wander: 30, lines: { c7: ['대륙 끝에서 걸어왔어요. 성녀님 손 한 번 잡으려고.', '흰빛님이세요? …머리 한 가닥. 성녀님처럼 되시려는 거예요?'] } });
  ST.folk('world', { name: '얼음 낚시꾼', folk: 'sailor', x: SPRING.x + 4, y: SPRING.y + 1, lines: { c7: '온천 옆은 얼음이 얇아. 물고기가 따뜻한 데로 모이거든. 사람이랑 똑같지.' } });
  // 니베: 아기 설인의 엄마 (눈 결정 열 개)
  ST.person('world', { id: 'nive', x: X0 + 8, y: Y0 + 20, dir: 'down', mark: () => (!f('nive_done') ? '?' : null), talk: async (c, n) => {
    const got = S().snowC || 0;
    if (f('nive_done')) { await c.say(n, '아기 설인이 엄마 눈사람 옆에서 자! 코를 골아. 눈사람이 녹으면 어떡하지? …또 만들면 되지!', { face: 'happy' }); return; }
    if (got >= 10) {
      S().snowC -= 10; delete S().inv.crystal_snow;
      await c.say(n, '눈 결정 열 개! 이걸로 엄마 설인을 만들 수 있어! (뚝딱뚝딱)', { face: 'happy' });
      await c.narr('눈사람이 조금 커지고, 반짝이는 눈이 생겼다. 어딘가에서 커다란 아기 설인이 뒤뚱뒤뚱 걸어와 눈사람 옆에 앉았다. 그리고 잠들었다.');
      c.flag('nive_done'); await c.getItem('heartpiece');
      return;
    }
    await c.say(n, '쉿! 저기 설원에 아기 설인 있지? 엄마를 잃어버렸대. 밤마다 울어.||눈사람으로 엄마를 만들어 주고 싶은데, 반짝이는 [y]눈 결정[/]이 열 개 필요해. 얼음 도깨비불이 가지고 있어. (' + got + '/10)', { face: 'sad' });
    c.flag('nive_q');
  } });
  ST.killHooks.push((e, s) => { if (e.type === 'icewisp' && s.flags.nive_q && !s.flags.nive_done) { s.snowC = (s.snowC || 0) + 1; s.inv.crystal_snow = Math.min(10, s.snowC); G.ui.toast('눈 결정 ' + Math.min(10, s.snowC) + '/10', 'good'); } });

  /* ───────── 빛 씨앗 (화이트) ───────── */
  ST.seed('w1', 'world', X0 - 8, Y0 + 6, { under: true });
  ST.seed('w2', 'world', X0 + 36, Y0 + 4, {});
  ST.seed('w3', 'world', HIDE.x - 3, HIDE.y + 6, { under: true });
  ST.seed('w4', 'world', SPRING.x + 2, SPRING.y + 3, {});

  /* ═════════ 서리 무덤 (던전 7) ═════════ */
  G.dungeon.def('d7', {
    name: '서리 무덤', sub: '이리스 대성당 지하', pal: 'white', music: 'hollow', tier: 6, floor: T.STONE, dark: 0.25, darkCol: 'rgba(10,20,40,1)',
    start: ['1,3', 9, 11],
    // 질서 갈래는 대성당 제단 뒤로, 다른 갈래는 묘지 뚜껑문으로 드나든다 (지도를 지을 때 정해진다)
    exit: { at: ['1,3', 9, 13], get to() { return S().flags.route_lock === 'order' ? 'w_cath' : 'world'; }, get tx() { return S().flags.route_lock === 'order' ? 12 : GRAVE.x + 1; }, get ty() { return S().flags.route_lock === 'order' ? 14 : GRAVE.y + 2; } },
    rooms: {
      '1,3': { ter: [['ice', 3, 3, 14, 3]], objs: [['icespike', 4, 8], ['icespike', 4, 9], ['icespike', 15, 8], ['icespike', 15, 9], ['icespike', 9, 3], ['icespike', 10, 3]], props: [['sign', 9, 10, { text: '「희생 없는 구원은 없다.」 — 초대 성녀\n얼음 가시는 불에 녹는다.' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['pot', 2, 11], ['pot', 17, 11]], foes: [['icewisp', 6, 6], ['icewisp', 13, 6]] },
      '1,2': { ter: [['deep', 1, 5, 18, 3]], props: [['sign', 9, 10, { text: '물길 너머 계단. 「얼음창은 물 위에 길을 낸다 — 잠깐만.」' }], ['torch', 3, 9], ['torch', 16, 9]], foes: [['icewisp', 5, 10], ['bat', 14, 3]] },
      '0,2': { ter: [['ice', 1, 2, 18, 11]], objs: [['icespike', 6, 4], ['icespike', 6, 5], ['icespike', 12, 8], ['icespike', 12, 9], ['icespike', 12, 10], ['icespike', 3, 10]], props: [['chest', 2, 3, { item: 'key_small' }], ['pot', 17, 11]], foes: [['icewisp', 9, 5], ['golem', 9, 9]] },
      '2,2': { solve: { type: 'torches', flag: 'd7:torch', msg: '상자가 떠올랐다' }, props: [['torch', 4, 4, { burn: 12 }], ['torch', 15, 4, { burn: 12 }], ['torch', 4, 10, { burn: 12 }], ['torch', 15, 10, { burn: 12 }], ['chest', 9, 7, { item: 'compass', hidden: 'd7:torch' }], ['sign', 9, 3, { text: '「네 불이 모두 탈 때 — 바람이 끄기 전에」' }]], foes: [['icewisp', 9, 5], ['wisp', 9, 10]] },
      '2,1': { ter: [['grass', 4, 4, 12, 7], ['snow', 1, 2, 18, 2]], props: [['spot', 9, 6, { verb: '하얀 꽃을 살핀다', text: async (c) => { if (c.has('got_herb')) { await c.narr('꽃을 딴 자리에 새싹이 벌써 올라온다. 이 안뜰만 봄이다.'); return; } c.flag('got_herb'); await c.narr('얼음 무덤 한가운데, 여기만 흙이 따뜻하다. 하얀 꽃이 무더기로 피어 있다.\n줄기 하나에 빛바랜 종이가 묶여 있다. 「빛바램 마지막 단계에. 달여서 세 모금. 아무도 희생하지 않아도 돼. — S」'); await c.getItem('snowherb'); await c.say('toria', '…「S」. 엄마 글씨야. 금서고에서 본 거랑 똑같아. 엄마가 여기 꽃을 심었어. 16년 전에.', { face: 'cry' }); } }], ['chest', 16, 3, { item: 'map_d' }]], foes: [['ghost', 4, 3], ['ghost', 15, 11]] },
      '1,1': { solve: { type: 'clear' }, props: [['chest', 9, 5, { item: 'key_big', big: true, hidden: true }], ['spot', 15, 3, { verb: '비문을 읽는다', text: async (c) => { c.book('b_saint'); for (const pg of G.data.BOOKS.b_saint.pages) await c.narr(pg); if (!c.has('saw_saint')) { c.flag('saw_saint'); await c.say('toria', 'L… 루미에 성녀님이야. 「알아」. 성녀님은 알고 있었어.', { face: 'sad' }); } } }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }]], foes: [['hollow', 6, 7], ['hollow', 13, 7], ['icewisp', 9, 10]] },
      '0,1': { ter: [['ice', 1, 2, 18, 11]], props: [['chest', 9, 6, { item: 'heartpiece' }], ['chest', 3, 3, { item: 'arrows10' }], ['spot', 16, 10, { verb: '얼음 속을 들여다본다', text: async (c) => { await c.narr('얼음 속에 기도등 수백 개가 갇혀 있다. 등마다 빛 한 방울. 그런데 절반은 비었다.\n빈 등 밑에 작은 쇠 관이 이어져 있다. 관은 벽 속으로, 남쪽으로 — 천년성 쪽으로 뻗어 있다.'); if (!c.has('saw_leak')) { c.flag('saw_leak'); c.route('night', 1); await c.say('toria', '찍…! 성녀님이 모은 빛, 절반이 어디론가 새고 있어. 성녀님은 알까?', { face: 'shock' }); } } }]], foes: [['icewisp', 5, 8], ['icewisp', 14, 8], ['wisp', 9, 4]] },
      '1,0': { boss: true, ter: [['ice', 3, 3, 14, 9]], props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'frost' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'open'], ['2,2', '2,1', 'open'], ['1,1', '0,1', 'bomb'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const order = S().flags.route_lock === 'order';
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: order ? 'w_cath' : 'world', tox: order ? 12 : GRAVE.x + 1, toy: order ? 12 : GRAVE.y + 2 });
      if (f('d7:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d7:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 7) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: 'd7:heart' }));
        G.world.add(out());
        c.lock(true);
        await c.cinema(true);
        c.music('sad');
        await c.narr('서리 거인이 무너졌다. 얼음 조각 사이로 사람 크기의 무언가가 보였다. 웅크린 채 얼어붙은, 아주 오래된 사람.\n그 입이 움직였다. 소리 없이. 「배고파.」');
        c.abyss('frost_hunger');
        await c.say('toria', '…빛을 너무 많이 삼켜서, 그런데 채워지지 않아서. 이스카 언니가 그랬어. 그릇이 되려다 실패한 사람.', { face: 'sad' });
        await c.narr('거인이 누워 있던 자리 뒤로, 푸른 얼음벽이 갈라졌다. 얼음 창고. 기도등 수천 개가 벌집처럼 박혀 빛난다.');
        const rt = S().flags.route_lock || 'order';
        const b = buddy();
        if (b === 'rud') await c.say('rud', '…탑 삼백 개 분량. 아니, 사백. 세다가 손가락이 모자라. 누나가 폭약을 준비해 뒀어. 신호만 하면 돼.', { face: 'shock' });
        else if (b === 'cassian') await c.say('cassian', '보고 대상이다. 규칙대로라면 전부 천년성으로 보내야 한다. …규칙대로라면.', { face: 'normal' });
        else await c.say('lyra', '절반이 비었어요. 쇠 관이 남쪽으로. 미드나잇 말이 맞았어요. 누군가 성녀님 몰래 가져가고 있어요.', { face: 'closed' });
        const k = await c.choice('얼음 창고의 빛을 어떻게 할까?', [
          { t: '부순다 — 빛을 주인들에게 돌려준다', tag: 'dawn', sub: '눈보라처럼 흩어져 기도한 이들에게. 성녀는 더 이상 공짜로 고칠 수 없다.' },
          { t: '성녀에게 맡긴다 — 관만 끊는다', tag: 'order', sub: '새는 관을 막고, 기록으로 남긴다. 병자를 위한 빛은 남는다.' },
          { t: '관을 따라간다 — 흔적만 지우고 그대로 둔다', tag: 'night', sub: '누가 빼돌리는지 알 때까지. 아무도 모르게.' },
        ]);
        const pick = ['dawn', 'order', 'night'][k];
        c.route(pick, 2); c.flag('c7_store_' + pick);
        if (pick === 'dawn') { c.sfx('explode'); c.shake(5, 1); c.flash('#ffffff', 0.5); await c.narr('얼음벽이 터졌다. 수천 개의 빛 방울이 천장을 뚫고 올라갔다. 그날 화이트에는 반짝이는 눈이 내렸다. 눈이 닿은 사람들은 조금 덜 피곤해졌다.'); }
        else if (pick === 'order') { c.sfx('clank'); await c.narr('쇠 관을 백은빛으로 봉했다. 창고는 조용해졌다. 새는 소리가 멎자, 기도등들이 조금 밝아졌다.'); c.flag('c7_report'); }
        else { await c.narr('관에 손을 대지 않았다. 대신 흰빛으로 관 이음새에 작은 표시를 남겼다. 빛을 따라가면 이 표시도 따라간다. 미드나잇이 좋아할 것이다.'); c.flag('c7_marked'); }
        await c.cinema(false);
        c.lock(false);
        c.flag('c7p_' + pick);
        c.journal(pick === 'dawn' ? '서리 거인을 쓰러뜨리고 얼음 창고를 부쉈다. 빛이 눈이 되어 내렸다.' : pick === 'order' ? '서리 거인을 쓰러뜨리고 얼음 창고의 새는 관을 막았다. 기록으로 남긴다.' : '서리 거인을 쓰러뜨렸다. 얼음 창고의 새는 관에 흰빛 표시를 남겼다. 따라가 볼 것이다.');
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d7:intro')) { c.flag('d7:intro'); await c.say('toria', '찍… 숨 쉴 때마다 눈보라가 나와. 저게 거인의 숨이야!', { face: 'shock' }); await c.cutin({ who: 'toria', title: '서리 거인', small: '서리 무덤의 주인', sub: '불이 약점 — 화염구와 불꽃 검으로!', col: '#4a8ad8', face: 'shock', sec: 1.8 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
      }); };
    },
  });
})();
