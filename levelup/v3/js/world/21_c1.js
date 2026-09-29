/* 제1장 「시작의 검」
   생일 아침 → 장롱 속 검 → 마당 수련 → 마을 인사 → 징수탑 특별 징수(첫 갈림길: 새벽 · 질서 · 밤) → 뿌리굴 → 가시덩굴 여왕
   → 노아에게 이슬(빛을 나눌 것인가) → 할머니의 밤 → 레드로 가는 다리 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const { X0, Y0 } = ST.GREEN;
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;

  ST.CH.push({ no: '제1장', id: 'c1', title: '시작의 검', sub: '열여섯 번째 봄, 장롱 속에서 빛이 새어 나왔다.',
    goal(s) {
      const h = { map: 'world' };
      if (!f('c1_sword')) return { text: '할머니가 장롱 맨 아래 칸의 보자기를 가져오라고 했다.', map: 'g_home', x: 10, y: 5 };
      if (!f('c1_trained')) return Object.assign(h, { text: '오두막 앞 마당에서 허수아비 셋을 상대로 검을 휘둘러 보자. (공격 · 길게 눌러 회전 베기 · 구르기)', x: X0 + 5, y: Y0 + 9 });
      if (!f('c1_tower')) return Object.assign(h, { text: '마을 사람들에게 인사하자. 잡화점 마리엔 아줌마, 이장님, 그리고 노아.' + (f('met:noah') && f('met:marien') ? ' 그리고 광장으로.' : ''), x: X0 + 17, y: Y0 + 12 });
      if (!f('c1_dew')) return Object.assign(h, { text: '마을 북쪽 숲, 뿌리굴 가장 깊은 곳에서 나무 정령의 이슬을 가져오자.', x: ST.GREEN.cave.x, y: ST.GREEN.cave.y });
      if (!f('c1_dew_given')) return { text: '노아에게 이슬을 가져다주자.', map: 'world', x: X0 + 5, y: Y0 + 19 };
      if (!f('c1_done')) return { text: '할머니 오두막으로 돌아가자. 할머니가 기다린다.', map: 'world', x: X0 + 4, y: Y0 + 6 };
      return { text: '다리가 고쳐졌다. 서쪽, 레드 마을의 볼칸을 찾아가자.', map: 'world', x: OW.towns.red.x + 15, y: OW.towns.red.y + 10 };
    } });
  ST.closedMsg.red = '찍! 다리가 봄 홍수에 쓸려 갔어. 이장님이 고친다고 했는데…';
  ST.closedMsg.blue = '찍… 블루 가는 길은 산사태로 막혔대. 레드 쪽으로 돌아가야 해.';
  ST.closedMsg.purple = '해 질 녘의 숲은 아직 문을 닫고 있어. 가시덩굴이 길을 막았어, 찍.';
  ST.closedMsg.gray = '잿빛 바람이 불어. 거긴… 뭔가 이상해. 아직은 싫어, 찍.';
  ST.closedMsg.white = '눈보라가 너무 세. 이대로 가면 얼어 버려!';
  ST.closedMsg.yellow = '모래바다야. 길잡이 없이 들어가면 돌아오지 못한대.';
  ST.closedMsg.black = '저쪽은… 해가 안 떠. 영원히. 지금은 아니야.';
  ST.closedMsg.rainbow = '하늘섬은 구름 위에 있어. 걸어서는 못 가.';
  ST.closedMsg.colorful = '알록달록 곶은 바다 건너야 해. 배가 없어.';

  /* ═════════ 프롤로그 ═════════ */
  ST.prologue = function (s) {
    G.game.goto('g_home', px(2), py(4) + 5, 'down', { fresh: true, quiet: true, keepMusic: true });
    G.script.run(async (c) => {
      const p = G.world.player;
      c.lock(true);
      p.forceAnim = 'down';
      await c.fade(true, { sec: 0.01 });
      c.music('hollow');
      await c.cinema(true);
      await c.narr('천년력 999년, 봄.');
      await c.narr('이리스 대륙의 사람들은 렙업할 때마다 작은 빛을 낸다.\n태어난 땅의 색을 닮은 빛. 초록, 빨강, 파랑…');
      await c.narr('그 빛의 일부는 마을마다 선 [y]징수탑[/]으로 빨려 간다.\n챔피언 카이론이 16년 전 선포한 [y]경험세[/].\n빛은 하늘의 황금별 [y]아스트라[/]로 쏘아 올려진다.');
      await c.narr('그리고 올봄, 황금별 옆에 검은 점 하나가 다시 보이기 시작했다.');
      c.sfx('bell');
      await c.chapter('제1장', '시작의 검', '열여섯 번째 봄, 장롱 속에서 빛이 새어 나왔다.');
      c.music('home');
      // 토리아가 침대에서 뛴다
      const tori = c.spawn({ cid: 'toria', x: px(3), y: py(5), name: '토리아' });
      const gm = c.who('evelyn') || c.spawn({ cid: 'evelyn', x: px(10), y: py(3) });
      gm.x = px(10); gm.y = py(3); gm.dir = 'up';
      gm.forceAnim = 'cast'; gm.forceFps = 3;
      await c.fade(false, { sec: 1.2 });
      await c.jump(tori, 10); await c.jump(tori, 12);
      await c.say('toria', '찍! 찍찍! 일어나! 해가 벌써 창틀까지 왔어!', { face: 'happy' });
      await c.jump(tori, 10);
      await c.say('toria', '오늘이 무슨 날인지 알아? 생일! 열여섯 번째 생일! 찍!', { face: 'happy' });
      p.forceAnim = null; p.x = px(3) + 6; p.y = py(6); c.face('hero', 'right'); c.sfx('land');
      await c.wait(0.3);
      c.emote('hero', '…');
      await c.wait(0.6);
      gm.forceAnim = null; c.face(gm, 'hero');
      await c.say('evelyn', '일났나. 아이고, 열여섯이네. …세월 참.', { face: 'smile' });
      await c.say('evelyn', '밥 무라. 옥수수빵 세 개 구웠다. 토리아 니는 한 개만 무라, 저번처럼 다 묵지 말고.');
      await c.say('toria', '찍… (두 개 먹을 거야)', { face: 'smirk' });
      await c.move(gm, px(9), py(5));
      c.face(gm, 'hero');
      await c.wait(0.4);
      await c.say('evelyn', '…{n:아/야}. 밥 묵기 전에 하나만 해 도.', { face: 'closed' });
      await c.say('evelyn', '장롱 맨 아래 칸에 보자기 하나 있제. 그거 좀 꺼내 온나.');
      await c.say('toria', '찍? 장롱 맨 아래는 열면 안 된다고 했잖아요. 십 년 동안 맨날!', { face: 'shock' });
      await c.say('evelyn', '…오늘은 된다.', { face: 'sad' });
      await c.cinema(false);
      c.lock(false);
      tori.dead = true; ST.join('toria');
      c.quest('main', 'on');
    });
  };

  // 오두막: 장롱 · 벽 빗금 · 할머니
  ST.onMap('g_home', (m, Wd, s) => {
    const P = G.props;
    Wd.add(new G.build.Decor({ decor: 'wardrobe', v: f('c1_sword') ? 'open' : '', x: px(11), y: py(7) + 4, text: f('c1_sword') ? '빈 보자기만 남았다. 보자기 안쪽에 수놓인 글씨: 「S」' : null }));
    if (!f('c1_sword')) Wd.add(new P.Spot({ x: px(10), y: py(7), reach: 18, verb: '장롱을 연다', text: (c) => wardrobe(c) }));
    Wd.add(new P.Spot({ x: px(1), y: py(5), reach: 16, verb: '벽을 본다', sparkle: true, flagKey: 'tally', text: async (c) => {
      c.flag('tally:seen');
      await c.narr('서쪽 벽에 빼곡한 빗금. 다섯 개씩 묶어서, 벽 한쪽을 다 채웠다.\n할머니는 「장 담글 날 센다」고 했다.');
      if (f('c1_done')) await c.narr('[w]5,844[/]개. 16년에 이틀 모자란 날수.\n오늘이 마지막 칸이다.');
    } }));
    Wd.add(new P.Bed({ col: '#6ab86a', x: px(2), y: py(4) + 4, solid: !G.script.running || f('c1_sword'), onRest: async (c) => { await c.rest(); } }));
  });
  ST.person('g_home', { id: 'evelyn', x: 9, y: 5, dir: 'left', when: () => !f('c1_night'), talk: async (c, n) => {
    c.flag('met:evelyn');
    if (!f('c1_sword')) { await c.say(n, '장롱 맨 아래 칸. 보자기. 꺼내 온나.', { face: 'closed' }); return; }
    if (!f('c1_trained')) { await c.say(n, '밖에 허수아비 세 개 세워 놨다. 가서 휘둘러 봐라. 몸이 기억할 끼다.', { face: 'closed' }); return; }
    if (!f('c1_tower')) { await c.say(n, '마을 한 바퀴 돌고 온나. 생일인데 인사는 해야제. …탑 근처는 가지 말고.'); return; }
    if (f('c1_quest_dew') && !f('c1_dew')) { await c.say(n, '뿌리굴 깊은 데 나무 정령이 산다. 천 년 묵은 나무라. 그 눈물이면 노아 시간을 좀 벌 수 있을 끼다.', { face: 'sad' }); await c.say(n, '그 검 믿고 너무 앞서지 마래이. 검이 사람을 지키는 기 아이라, 사람이 검을 쓰는 기다.'); return; }
    if (f('c1_dew_given') && !f('c1_done')) { await ST.grandmaNight(c); return; }
    await c.say(n, U.pick(['밥은 묵고 다니나.', '볼칸한테 편지 전했나? 그 영감, 성질은 불같아도 속은 두부다.', '토리아 니, 너무 촐싹대지 마라.']));
  } });
  async function wardrobe(c) {
    const p = G.world.player;
    c.lock(true);
    await c.cinema(true);
    c.face('hero', 'up');
    c.sfx('open');
    for (const e of G.world.ents) if (e.decor === 'wardrobe') { e.img = G.build.decor('wardrobe', 'open'); }
    await c.wait(0.6);
    await c.narr('보자기는 생각보다 무거웠다. 풀자, 칼집 없는 검 한 자루.\n날은 흐린 거울 같고, 손잡이에 단추 같은 둥근 보석이 박혀 있다.');
    c.stopMusic(1);
    await c.wait(0.8);
    c.sfx('heartbeat');
    await c.wait(0.9);
    c.sfx('heartbeat');
    await c.wait(0.6);
    // 흰빛
    c.flash('#fff', 1.2); c.sfx('white'); c.shake(4, 0.8);
    G.fx.ring(p.x, p.y - 12, '#ffffff', 60, 1, 3); G.fx.glow(p.x, p.y - 14, '#ffffff', 50, 60);
    if (G.light) G.light.flare(p.x, p.y, 160, 2);
    await c.wait(0.4);
    await c.getItem('sw_start', 1);
    c.flag('c1_sword');
    const gm = c.who('evelyn');
    if (gm) { c.face(gm, 'hero'); c.emote(gm, '!'); }
    c.sfx('rumble');
    await c.say('toria', '찍…?! 차, 찬장이… 아니 검이… 하, 하얘! 빛이 하얘!', { face: 'shock' });
    await c.wait(0.4);
    await c.say('evelyn', '…………', { face: 'closed' });
    await c.say('evelyn', '역시 니 손에서 깨는구나.', { face: 'sad' });
    c.music('mother');
    const k = await c.choice('검이 손 안에서 맥박처럼 뛴다. 어떻게 할까?', [
      { t: '검을 꽉 쥔다. 이건 내 거다.', tag: 'dawn' },
      { t: '할머니, 이게 뭐예요? 먼저 묻는다.', tag: 'order' },
      { t: '보자기로 도로 싼다. 들키면 안 될 것 같다.', tag: 'night' },
    ]);
    if (k === 0) { c.route('dawn', 1); c.flag('c1_grip'); await c.say('evelyn', '…그래. 쥐어라. 한번 쥔 건 놓지 마라. 니 엄마도 그랬다.', { face: 'sad' }); }
    else if (k === 1) { c.route('order', 1); c.flag('c1_ask'); await c.say('evelyn', '묻는 거 좋다. 모르는 채로 휘두르는 거보다 백 배 낫다.', { face: 'smile' }); }
    else { c.route('night', 1); c.flag('c1_hide'); await c.say('evelyn', '…눈치가 빠르네. 맞다. 아무한테나 보이면 안 된다. 특히 탑 가까이서는.', { face: 'closed' }); }
    await c.say('evelyn', '그 검 이름이 [y]시작의 검[/]이다. 천 년 전 아우룸이 만들었다 카더라. 흰빛 나는 손에서만 깬다고.');
    await c.say('evelyn', '…니 엄마 거였다.');
    await c.say('toria', '찍! 엄마? {n} 엄마? 할머니 그런 얘기 한 번도 안 했잖아요!', { face: 'shock' });
    await c.say('evelyn', '오늘은 여기까지. 밥 식는다.', { face: 'closed' });
    await c.say('evelyn', '묵고, 밖에 나가서 휘둘러 봐라. 허수아비 세 개 세워 놨다. 공격 버튼을 누르면 베고, 길게 눌렀다 떼면 한 바퀴 돈다. 구르면 피하고.');
    await c.cinema(false);
    c.lock(false);
    c.journal('생일 아침, 장롱 속에서 [y]시작의 검[/]을 찾았다. 쥐자 흰빛이 터졌다. 할머니는 「니 엄마 거였다」고 했다.');
  }

  /* ═════════ 마당 수련 ═════════ */
  ST.onTick.push(() => {
    const s = S(); if (!f('c1_sword') || f('c1_trained')) return;
    const Wd = G.world; if (!Wd.map || Wd.map.id !== 'world' || G.script.running) return;
    const ds = Wd.ents.filter((e) => e.type === 'dummy');
    if (!ds.length) return;
    s.train = s.train || { hit: 0, spin: 0, roll: 0 };
    for (const d of ds) if (!d.trainHook) { d.trainHook = true; d.onHurt = function (dmg, info) { s.train.hit++; if (info.src === 'spin') s.train.spin++; this.hpShow = 0; }; }
    const p = Wd.player;
    if (p.state === 'roll' && !p.rollCounted) { p.rollCounted = true; s.train.roll++; }
    if (p.state !== 'roll') p.rollCounted = false;
    const near = ds.some((d) => U.dist(d.x, d.y, p.x, p.y) < 90);
    if (!near) return;
    if (!s.train.shown) { s.train.shown = true; G.ui.toast('수련: 허수아비를 벤다 (공격) · 길게 눌렀다 떼서 회전 베기 · 구르기 (Space / 파란 버튼)', 'gold'); }
    if (s.train.hit >= 6 && s.train.spin >= 1 && s.train.roll >= 2) {
      s.flags.c1_trained = true;
      G.script.run(async (c) => {
        await c.cinema(true);
        const gm = c.spawn({ cid: 'evelyn', x: px(X0 + 4), y: py(Y0 + 6), dir: 'down', look: G.cast.get('evelyn').look, name: '에벨린 할머니' });
        await c.move(gm, px(X0 + 4), py(Y0 + 8));
        c.face(gm, 'hero');
        await c.say('evelyn', '……', { face: 'closed' });
        await c.say('evelyn', '허리가 곧네. 발이 가볍고. 누구 닮았는지 모르겠다.', { face: 'smile' });
        await c.say('toria', '찍! 할머니 방금 웃었다! 십 년에 한 번 웃는데!', { face: 'happy' });
        await c.say('evelyn', '시끄럽다. …{n:아/야}, 마을 한 바퀴 돌고 온나. 마리엔한테 인사하고, 이장한테도. 노아도 보고 오고.');
        await c.say('evelyn', '그라고… 광장 탑 근처는 오늘 가지 마래이. 기사들이 온다 카더라.', { face: 'sad' });
        await c.move(gm, px(X0 + 4), py(Y0 + 6)); gm.dead = true;
        c.exp(10);
        c.journal('마당에서 허수아비를 베었다. 할머니가 웃었다(토리아 말로는 십 년 만).');
      });
    }
  });

  /* ═════════ 징수탑 특별 징수 (첫 갈림길) ═════════ */
  ST.onTick.push(() => {
    if (!f('c1_trained') || f('c1_tower')) return;
    const Wd = G.world; if (!Wd.map || Wd.map.id !== 'world' || G.script.running) return;
    if (!(f('met:noah') && (f('met:marien') || f('met:verdex')))) return;
    const P = OW.towns.green.plaza, p = Wd.player;
    if (U.dist(p.x, p.y, px(P.x), py(P.y)) > 90) return;
    S().flags.c1_tower = true;
    G.script.run(towerEvent);
  });
  async function towerEvent(c) {
    const P = OW.towns.green.plaza;
    const tw = { x: px(X0 + 30), y: py(Y0 + 17) };
    c.lock(true);
    await c.cinema(true);
    c.music('danger');
    c.sfx('rumble'); c.shake(2, 1);
    await c.say('toria', '찍? 땅이… 울려.', { face: 'shock' });
    // 기사단이 들어온다
    const k1 = c.spawn({ x: px(P.x + 12), y: py(P.y + 1), look: G.cast.folk('knight'), name: '징수 기사' });
    const k2 = c.spawn({ x: px(P.x + 13), y: py(P.y), look: G.cast.folk('knight'), name: '징수 기사' });
    const gr = c.spawn({ cid: 'graus', x: px(P.x + 14), y: py(P.y + 1), look: G.cast.get('graus').look, name: '그라우스' });
    const cs = c.spawn({ cid: 'cassian', x: px(P.x + 15), y: py(P.y + 2), look: G.cast.get('cassian').look, name: '카시안' });
    c.camOn(gr, 3);
    await c.all(c.move(k1, px(P.x + 4), py(P.y + 1)), c.move(k2, px(P.x + 4), py(P.y - 1)), c.move(gr, px(P.x + 6), py(P.y)), c.move(cs, px(P.x + 8), py(P.y + 2)));
    // 마을 사람들이 모인다
    const vill = [];
    for (const [dx, dy, folk] of [[-4, 3, 'farmer'], [-3, 4, 'farmerw'], [-5, 2, 'oldm'], [1, 4, 'kid']]) vill.push(c.spawn({ x: px(P.x + dx), y: py(P.y + dy), look: G.cast.folk(folk), name: '마을 사람', dir: 'right' }));
    const noah = c.spawn({ cid: 'noah', x: px(P.x - 2), y: py(P.y + 4), look: G.cast.get('noah').look, name: '노아', dir: 'right' });
    const lyra = c.spawn({ cid: 'lyra', x: px(P.x - 6), y: py(P.y - 2), look: G.cast.get('lyra').look, name: '리라', dir: 'right' });
    c.face('hero', 'right');
    await c.say('graus', '그린 마을 주민들은 들으라.', { face: 'normal' });
    await c.say('graus', '천년 방위령 제9조에 따라, 올해 그린 마을의 부족분 [y]일백팔십만[/]을 [r]특별 징수[/]한다.', { face: 'smirk' });
    await c.say('graus', '걱정 마라. 아프지 않다. 조금 졸릴 뿐이다.', { face: 'smirk' });
    c.emote(vill[0], '!'); c.emote(vill[2], '…');
    await c.say('verdex', '부단장님! 이미 목표의 일곱 할을 냈습니다! 아이들이…', { face: 'sad', name: '베르덱스 이장' });
    await c.say('graus', '장부는 일곱 할을 기억하지 않는다. 장부는 모자란 세 할을 기억하지.', { face: 'normal' });
    // 탑이 빛을 빨아들인다
    c.cam(tw.x, tw.y - 40, 2);
    await c.wait(1);
    c.sfx('heartbeat');
    for (let i = 0; i < 40; i++) { const v = vill[i % vill.length]; G.fx.part({ x: v.x, y: v.y - 10, z: 6, vx: (tw.x - v.x) * 0.9, vy: (tw.y - 100 - v.y) * 0.9, g: 0, life: 1.1, col: '#8ae08a', size: 1, glow: true }); }
    c.sfx('wind');
    for (const v of vill) v.forceAnim = 'hurt';
    await c.wait(1.2);
    c.camOn('hero', 3);
    noah.forceAnim = 'down'; c.sfx('faint');
    await c.say(null, '노아가 쓰러졌다.', { style: 'sys' });
    await c.say('toria', '노아! 찍!!', { face: 'cry' });
    // 검이 반응한다
    const p = G.world.player;
    c.sfx('heartbeat'); await c.wait(0.4);
    c.flash('#fff', 0.8); c.sfx('white'); c.shake(3, 0.5);
    G.fx.ring(p.x, p.y - 12, '#ffffff', 40, 0.8, 2);
    for (let i = 0; i < 30; i++) G.fx.part({ x: tw.x, y: tw.y - 100, z: 6, vx: (p.x - tw.x) * 1.4 + (Math.random() - 0.5) * 30, vy: (p.y - tw.y + 100) * 1.4, g: 0, life: 0.7, col: '#ffffff', size: 1, glow: true });
    await c.wait(0.6);
    c.face(gr, 'hero'); c.emote(gr, '!');
    await c.say('graus', '…흰빛?', { face: 'shock' });
    await c.say('graus', '탑의 빛이 역류했다. 저 아이가 끌어당겼어. 하, 하하…', { face: 'smirk' });
    await c.say('graus', '등급 없는 흰빛은 천년성의 재산이다. [r]잡아라.[/]', { face: 'angry' });
    c.music('battle');
    await c.all(c.move(k1, p.x + 30, p.y - 4), c.move(k2, p.x + 30, p.y + 10));
    await c.say('cassian', '멈춰라.', { face: 'normal' });
    c.face(k1, cs); c.face(k2, cs);
    await c.move(cs, p.x + 20, p.y + 2);
    c.face(cs, gr);
    await c.say('cassian', '부단장님. 챔피언의 명령서가 없습니다. 흰빛에 관한 모든 판단은 챔피언께 올린다. 방위령 제1조입니다.', { face: 'normal' });
    await c.say('graus', '카시안. 스승이 챔피언이라고 법 위에 선 줄 아나. 장부에 적히면 그게 명령이다.', { face: 'angry' });
    await c.say('cassian', '그럼 장부에 적으십시오. 「그라우스, 명령 없이 흰빛에 손댐.」', { face: 'smirk' });
    c.face(cs, 'hero');
    await c.say('cassian', '…그리고 너. 그 검, 떨고 있군. 검이 떠는 건지 네가 떠는 건지.', { face: 'normal' });
    // ── 첫 갈림길 ──
    c.music('danger');
    const k = await c.choice('기사들이 망설이는 사이, 탑이 다시 윙윙 울기 시작한다. 노아의 숨이 가늘다.', [
      { t: '탑으로 달려가 핵을 벤다', tag: 'dawn', sub: '빼앗긴 빛을 돌려받는다. 뒷일은 그다음이다.' },
      { t: '카시안에게 정식 심사를 청한다', tag: 'order', sub: '도망치지 않는다. 법 안에서 싸운다.' },
      { t: '리라와 눈이 마주친다 — 노래가 시작된다', tag: 'night', sub: '보이지 않게, 들키지 않게.' },
    ]);
    if (k === 0) await routeDawn(c, { gr, cs, k1, k2, tw, vill, noah, lyra });
    else if (k === 1) await routeOrder(c, { gr, cs, k1, k2, tw, vill, noah, lyra });
    else await routeNight(c, { gr, cs, k1, k2, tw, vill, noah, lyra });
    // 공통: 노아
    for (const v of vill) v.dead = true;
    await c.fade(true, { sec: 0.5 });
    for (const e of [gr, cs, k1, k2, lyra]) e.dead = true;
    noah.dead = true;
    await c.warp('g_noah', px(5), py(6), 'up', { noFade: true });
    await c.wait(0.2);
    await c.fade(false, { sec: 0.8 });
    c.music('sad');
    const gm = c.spawn({ cid: 'evelyn', x: px(4), y: py(4), dir: 'left', look: G.cast.get('evelyn').look, name: '에벨린 할머니' });
    await c.say('evelyn', '숨은 쉰다. 빛을 너무 많이 빼앗겼다. 머리칼이 반은 하얗게 셌네.', { face: 'sad' });
    await c.say(null, '노아 엄마가 이불 끝을 쥐고 운다.', { style: 'narr' });
    await c.say('evelyn', '…뿌리굴에 나무 정령이 산다. 천 년 묵은 숲의 주인. 그 이슬이면 이 아이 시간을 좀 벌 수 있을 끼다.', { face: 'closed' });
    await c.say('evelyn', '{n:아/야}. 니가 가라. 그 검이 깼으면, 뿌리굴도 니를 들여보낼 끼다.');
    await c.say('toria', '찍! 나도 갈 거야! 난… 레벨 9지만! 16년째 9지만!', { face: 'angry' });
    gm.dead = true;
    c.flag('c1_quest_dew'); c.quest('dew', 'on');
    c.journal(k === 0 ? '광장 징수탑의 핵을 베었다. 빛이 사람들에게 돌아갔다. 그라우스가 내 얼굴을 기억했다.' : k === 1 ? '카시안에게 정식 심사를 청했다. 첫 심사는 뿌리굴의 나무 정령을 진정시키는 것.' : '리라의 노래 속에 숨었다. 등불이 흔들리고, 탑의 빛이 잠깐 꺼졌다. 밤이 나를 도왔다.');
    await c.cinema(false);
  }
  async function routeDawn(c, A) {
    const p = G.world.player;
    c.route('dawn', 2); c.flag('c1_route', 'dawn'); c.flag('c1_tower_broken'); c.flag('graus_grudge', 2);
    c.music('boss');
    await c.move('hero', A.tw.x, A.tw.y + 14, { speed: 140, ghost: true });
    c.face('hero', 'up');
    p.state = 'attack'; p.atkFrame = 1; c.sfx('swing');
    await c.wait(0.2);
    c.flash('#fff', 0.5); c.sfx('explode'); c.shake(6, 0.8);
    G.fx.sparks(A.tw.x, A.tw.y - 100, 40, '#8ae08a', 160); G.fx.shards(A.tw.x, A.tw.y - 60, 30, '#8a8aa8');
    for (let i = 0; i < 50; i++) { const v = A.vill[i % A.vill.length]; G.fx.part({ x: A.tw.x, y: A.tw.y - 100, z: 6, vx: (v.x - A.tw.x) * 1.1, vy: (v.y - A.tw.y + 100) * 1.1, g: 0, life: 1, col: '#8ae08a', size: 1, glow: true }); }
    p.state = 'idle';
    for (const v of A.vill) v.forceAnim = null;
    await c.say(null, '탑의 꼭대기 빛이 꺼졌다. 빼앗긴 초록빛이 사람들에게 쏟아져 돌아온다.', { style: 'narr' });
    await c.say('graus', '이… 이 쥐새끼가!! 방위령 제3조! 탑을 해하는 자는 빛을 몰수한다!', { face: 'angry', shake: true });
    await c.say('cassian', '…빠르군.', { face: 'smirk' });
    // 짧은 싸움: 기사 둘
    c.lock(false);
    const f1 = c.foe('knight', A.k1.x, A.k1.y), f2 = c.foe('knight', A.k2.x, A.k2.y);
    A.k1.dead = true; A.k2.dead = true;
    f1.aggro = true; f2.aggro = true; f1.hpMul = 0.6; f1.hp = Math.round(f1.hp * 0.6); f2.hp = Math.round(f2.hp * 0.6);
    await c.cinema(false);
    G.ui.toast('기사들을 물리쳐라! (정면은 방패로 막는다 — 옆으로 돌아가거나 회전 베기)', 'bad');
    let t = 0;
    await c.freeWhile(() => { t += 1 / 60; return (f1.dead && f2.dead) || t > 40 || G.world.player.state === 'dead'; });
    for (const e of [f1, f2]) if (!e.dead) e.dead = true;
    await c.cinema(true);
    c.lock(true);
    c.sfx('explode'); G.fx.dust(p.x, p.y, 30); G.fx.glow(p.x, p.y, '#ff8a4a', 30);
    const lea = c.spawn({ cid: 'lea', x: p.x - 30, y: p.y + 6, look: G.cast.get('lea').look, name: '주황 목도리' });
    await c.say('lea', '연막이다! 이쪽! 머리 숙여, 흰빛 꼬맹이!', { face: 'angry', name: '주황 목도리의 여자' });
    await c.say('graus', '콜록, 콜록…! 새벽단 쥐새끼들까지…!', { face: 'angry' });
    await c.say('lea', '새벽은 온다. 탑 하나 벤 값은 우리가 치를게. 대신 살아남아. 레드에서 보자.', { face: 'smile', name: '주황 목도리의 여자' });
    c.give('scarf_dawn', 1);
    c.toast('[y]새벽단 목도리[/]를 받았다', 'gold');
    lea.dead = true;
    c.flag('met:lea_masked');
  }
  async function routeOrder(c, A) {
    c.route('order', 2); c.flag('c1_route', 'order'); c.flag('graus_grudge', 1);
    await c.move('hero', A.cs.x - 18, A.cs.y, { speed: 60 });
    c.faceEach('hero', A.cs);
    await c.say(null, '검을 땅에 꽂고, 카시안 앞에 선다.', { style: 'narr' });
    await c.say('cassian', '…도망치지 않겠다는 건가.', { face: 'normal' });
    await c.say('cassian', '좋다. 챔피언의 이름으로 — 이 자를 [y]등급 후보[/]로 등록한다. 흰빛은 심사가 끝날 때까지 누구의 재산도 아니다.', { face: 'normal' });
    await c.say('graus', '카시안…! 이 일은 챔피언께 보고하겠다.', { face: 'angry' });
    await c.say('cassian', '저도 그러려던 참입니다. 오늘 징수 장부와 함께요. 일곱 할을 냈다는 이장의 말, 저도 들었으니까.', { face: 'smirk' });
    c.face(A.gr, 'hero');
    await c.say('graus', '…후보라. 심사에서 떨어지면 네 빛은 탑이 다 먹는다. 기억해 둬라, 흰빛.', { face: 'smirk' });
    await c.move(A.gr, A.gr.x + 120, A.gr.y); A.gr.dead = true;
    await c.say('cassian', '첫 심사다. 뿌리굴의 나무 정령이 앓고 있다. 숲이 마르면 마을도 마른다. 정령을 진정시켜라.', { face: 'normal' });
    await c.say('cassian', '…그리고 이건 개인적인 말인데. 네 검 끝이 떨리는 건 무서워서가 아니라 화가 나서다. 그건 좋은 칼이다.', { face: 'smile' });
    c.give('pass_order', 1); c.toast('[y]등급 후보 통행증[/]을 받았다', 'gold');
    c.bond('cassian', 1);
  }
  async function routeNight(c, A) {
    c.route('night', 2); c.flag('c1_route', 'night'); c.flag('graus_grudge', 1);
    c.faceEach('hero', A.lyra);
    await c.say(null, '군중 너머, 류트를 든 여자와 눈이 마주쳤다. 그녀가 입꼬리를 올린다.', { style: 'narr' });
    c.music('dream');
    await c.say('lyra', '[p]♪ 등불아 등불아 / 눈을 감아라\n♪ 세는 사람은 / 어둠을 못 센다[/]', { face: 'closed' });
    // 등불이 흔들리고 어두워진다
    const m = G.world.map; const old = m.dark;
    for (let i = 0; i < 20; i++) { m.dark = i / 20 * 0.85; await c.wait(0.05); }
    c.sfx('heartbeat');
    await c.say('graus', '뭐냐, 이 어둠은?! 불을 밝혀!', { face: 'shock' });
    await c.say(null, '탑의 빛이 한 번 헐떡이다 꺼진다. 무언가가 그 빛을 한입에 삼킨 것처럼.', { style: 'narr' });
    for (const v of A.vill) v.forceAnim = null;
    const cat = c.spawn({ cid: 'midnight', x: A.tw.x - 10, y: A.tw.y + 6, look: G.cast.get('midnight').look, name: '???' });
    c.emote(cat, '♪');
    await c.wait(0.8);
    cat.dead = true;
    await c.say('lyra', '이쪽이에요, 생일 주인공. 뒤는 밤이 맡을게요.', { face: 'smile' });
    await c.move('hero', A.lyra.x, A.lyra.y, { speed: 90 });
    for (let i = 20; i >= 0; i--) { m.dark = i / 20 * 0.85; await c.wait(0.03); }
    m.dark = old;
    await c.say('lyra', '이거 가져가요. 쥐고 있으면 등불이 당신을 조금 덜 봐요.', { face: 'smile' });
    c.give('feather_night', 1); c.toast('[y]밤의 깃털[/]을 받았다', 'gold');
    await c.say('lyra', '아, 그리고 — 노래 값은 나중에 받을게요. 밤의 사람들은 빚을 잊지 않거든요.', { face: 'smirk' });
    c.bond('lyra', 1);
  }

  /* ═════════ 뿌리굴 (던전 1) ═════════ */
  const D1 = {
    name: '뿌리굴', sub: '속삭이는 숲 아래', pal: 'green', music: 'cave', tier: 0, floor: T.DIRT,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: ST.GREEN.cave.x, ty: ST.GREEN.cave.y + 1 },
    rooms: {
      '1,3': { foes: [['slime', 5, 6], ['slime', 14, 7]], props: [['sign', 9, 4, { text: '「뿌리는 서로 이어져 있다. 한 칸을 밟으면 다른 칸이 안다.」 — 누군가 뿌리에 새긴 글' }], ['pot', 2, 3], ['pot', 3, 3], ['pot', 16, 3]], ter: [['grass', 2, 8, 4, 3], ['grass', 14, 3, 4, 3]] },
      '1,2': { foes: [['bat', 5, 5], ['bat', 14, 5], ['plant', 9, 3]], ter: [['h', 7, 5, 6, 3, 1], ['water', 2, 9, 3, 3], ['water', 15, 9, 3, 3]], stairs: [[9, 5, 2]], props: [['pot', 8, 5], ['pot', 11, 5]] },
      '2,2': { solve: { type: 'plates', msg: '어딘가에서 상자가 나타났다' }, props: [['block', 6, 6], ['block', 12, 8], ['plate', 6, 9], ['plate', 14, 4], ['chest', 16, 10, { item: 'key_small', hidden: true }]], foes: [['slime', 10, 5]] },
      '0,2': { solve: { type: 'clear', msg: '덩굴이 물러났다' }, foes: [['boar', 6, 7], ['plant', 14, 4], ['plant', 4, 4], ['slime', 12, 9]], props: [['chest', 10, 5, { item: 'map_d', hidden: true }]] },
      '1,1': { foes: [['bigslime', 9, 7]], props: [['chest', 9, 4, { item: 'bow', big: false, col: '#8a3a5a' }], ['pot', 2, 3], ['pot', 17, 3], ['pot', 2, 11], ['pot', 17, 11, { drop: { what: 'arrow', n: 10 } }], ['sign', 3, 6, { text: '벽의 눈은 멀리서만 떠진다. 멀리서 맞혀라.' }]] },
      '2,1': { foes: [['plant', 5, 9], ['bat', 12, 6]], props: [['eye', 10, 2, { sets: 'd1:eye' }], ['sign', 10, 10, { text: '→ 눈을 뜨게 하는 것은 칼이 아니라 화살.' }]], ter: [['water', 3, 4, 14, 2]] },
      '2,0': { solve: { type: 'clear', msg: '무언가 떨어지는 소리' }, foes: [['boar', 6, 6], ['boar', 13, 8], ['slime', 9, 9]], props: [['chest', 10, 5, { item: 'key_big', hidden: true, big: true }]] },
      '0,1': { solve: { type: 'clear' }, foes: [['bat', 6, 5], ['bat', 12, 5], ['plant', 9, 9], ['slime', 4, 9]], props: [['chest', 9, 6, { item: 'compass', hidden: true }], ['pot', 16, 3, { drop: { what: 'heart', n: 4 } }]], ter: [['grass', 2, 3, 16, 9]] },
      '1,0': { boss: true, props: [['boss', 9, 5, { type: 'thornqueen' }]], ter: [['grass', 2, 2, 16, 3]] },
    },
    doors: [
      ['1,3', '1,2', 'open'], ['1,2', '2,2', 'open'], ['1,2', '0,2', 'trap'], ['1,2', '1,1', 'key'],
      ['1,1', '2,1', 'open'], ['2,1', '2,0', 'switch', 'd1:eye'], ['1,1', '0,1', 'open'], ['1,1', '1,0', 'big'],
    ],
    ents(m, Wd) {
      // 보스방: 들어서면 연출 후 싸움
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      if (f('d1:boss')) { boss.dead = true; bossAfter(m, Wd, r, true); return; }
      boss.onDieFn = () => { G.script.run(async (c) => { await c.wait(0.8); bossAfter(m, G.world, r, false); c.music('cave'); c.journal('뿌리굴의 가시덩굴 여왕을 쓰러뜨렸다. 그것은 병든 나무 정령의 뿌리가 변한 것이었다.'); await c.wait(0.6); await treantScene(c, r); }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => { await bossIntro(c, boss, r); }); };
    },
  };
  G.dungeon.def('d1', D1);
  async function bossIntro(c, boss, r) {
    c.lock(true);
    await c.cinema(true);
    c.stopMusic(0.5);
    c.camOn(boss, 3);
    await c.wait(1);
    c.sfx('growl'); c.shake(3, 0.8);
    if (!f('d1:intro')) await c.say('toria', '찍… 저, 저게 나무 정령님이야? 아니야… 뿌리가 썩었어. 빛을 다 빨려서…', { face: 'shock' });
    if (!f('d1:intro')) { c.flag('d1:intro'); await c.cutin({ who: 'toria', title: '가시덩굴 여왕', small: '뿌리굴의 주인', sub: '눈이 열릴 때 — 화살로!', col: '#d84a6a', face: 'shock', sec: 1.8 }); }
    c.camFree();
    await c.cinema(false);
    c.lock(false);
    boss.start();
    await c.battle(boss, { music: 'boss' });
  }
  function bossAfter(m, Wd, r, again) {
    const P = G.props;
    const cx = (r.x0 + 9) * TS + 8, cy = (r.y0 + 8) * TS + 12;
    if (!f('d1:heart')) Wd.add(new P.HeartItem({ x: cx, y: cy, flagKey: 'd1:heart' }));
    // 나가는 빛
    Wd.add(new Portal({ x: cx + 40, y: cy, to: 'world', tox: ST.GREEN.cave.x, toy: ST.GREEN.cave.y + 2 }));
    void again;
  }
  async function treantScene(c, r) {
    c.lock(true);
    await c.cinema(true);
    const tr = c.spawn({ cid: 'treant', x: (r.x0 + 9) * TS + 8, y: (r.y0 + 4) * TS + 12, name: '나무 정령', drawFn: null });
    tr.drawFn = (g, cx, cy) => { const x = Math.round(tr.x - cx), y = Math.round(tr.y - cy); g.globalAlpha = 0.6 + Math.sin(tr.t * 2) * 0.2; g.fillStyle = '#b8e8a0'; g.beginPath(); g.arc(x, y - 20, 12, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.fillRect(x - 5, y - 22, 2, 2); g.fillRect(x + 3, y - 22, 2, 2); };
    c.music('forest');
    await c.say('treant', '…고맙구나, 작은 흰빛. 뿌리가 굶주려서… 가시가 되어 있었다.', { name: '나무 정령', face: 'closed' });
    await c.say('treant', '천 년 동안 숲의 수다를 들었다. 요즘 숲은 한 가지 말만 한다. 「배고프다」.', { name: '나무 정령' });
    await c.say('treant', '탑이 땅의 빛을 하늘로 올린다. 뿌리까지 말라 간다. 너는… 그 반대를 할 수 있는 손을 가졌구나.', { name: '나무 정령' });
    await c.say('treant', '이것을 가져가거라. 내 마지막 이슬이다.', { name: '나무 정령' });
    await c.getItem('dew', 1);
    c.flag('c1_dew'); c.quest('dew', 'done');
    await c.say('treant', '그리고 기억하거라. 채우는 것보다 나누는 것이 그릇을 지킨다. 너의 어머니도… 그렇게 말했었다.', { name: '나무 정령', face: 'sad' });
    await c.say('toria', '찍?! 어머니?! 나무 정령님, {n} 엄마를 알아요?!', { face: 'shock' });
    tr.dead = true;
    G.fx.leaves(tr.x, tr.y - 10, 20, '#b8e8a0');
    await c.say(null, '대답 대신 잎사귀 몇 장이 흩어졌다.', { style: 'narr' });
    // 갈래별 카시안
    const rt = S().flags.c1_route;
    await c.cinema(false);
    c.lock(false);
    if (rt === 'order') c.flag('c1_exam1');
  }
  /** 빛의 문: 닿으면 밖으로 */
  class Portal extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'portal', solid: false }, o)); }
    update(dt, Wd) {
      this.t += dt;
      if (Math.random() < dt * 20) G.fx.part({ x: this.x + (Math.random() - 0.5) * 16, y: this.y, z: Math.random() * 20, vz: 20, g: 0, life: 0.8, col: '#bfe8ff', size: 1, glow: true });
      const p = Wd.player;
      if (!this.used && p && U.dist(p.x, p.y, this.x, this.y) < 10 && !G.script.running) { this.used = true; G.game.useWarp({ to: this.to, tx: this.tox, ty: this.toy, dir: 'down', exit: true, sfx: 'warp' }); }
    }
    drawShadow(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.globalAlpha = 0.5 + Math.sin(this.t * 4) * 0.2; g.fillStyle = '#bfe8ff'; g.beginPath(); g.ellipse(x, y - 2, 10, 4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    draw(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.globalAlpha = 0.35; g.fillStyle = '#e8f8ff'; g.fillRect(x - 8, y - 30, 16, 28); g.globalAlpha = 1; }
  }
  ST.Portal = Portal;

  /* ═════════ 노아에게 이슬 — 빛을 나눌 것인가 ═════════ */
  ST.giveDew = async function (c, n) {
    await c.say(n, '…이거, 나무 정령님 눈물이야? 반짝거려.', { face: 'shock' });
    c.take('dew');
    const noah = n;
    const k = await c.choice('이슬을 노아의 입술에 적신다. 노아의 머리칼 끝이 아주 조금 돌아온다. 그런데 — 검이 손 안에서 따뜻하게 뛴다. 빛을 더 줄 수 있을 것 같다.', [
      { t: '이슬만 준다', sub: '지금은 이걸로 충분하다.' },
      { t: '검을 노아의 손에 쥐여 주고, 내 빛을 나눈다', sub: '렙업으로 모은 빛의 절반을 잃는다. 되돌릴 수 없다.' },
    ]);
    if (k === 1) {
      const s = S();
      const p = G.world.player;
      c.flash('#fff', 0.8); c.sfx('white');
      for (let i = 0; i < 40; i++) G.fx.part({ x: p.x, y: p.y - 12, z: 6, vx: (noah.x - p.x) * 1.5 + (Math.random() - 0.5) * 20, vy: (noah.y - p.y) * 1.5, g: 0, life: 0.8, col: '#ffffff', size: 1, glow: true });
      s.exp = Math.floor(s.exp / 2);
      c.flag('hero_shared'); c.flag('shared_noah'); c.bond('noah', 3);
      await c.wait(0.8);
      await c.say(noah, '…따뜻해. 손끝이… 형아' + (s.gender === 'girl' ? '… 누나' : '') + ' 손 같아.', { face: 'smile' });
      await c.narr('노아의 머리칼 끝에 흐린 갈색이 한 뼘 돌아왔다.\n너의 몸속 어딘가가 조금 비었다. 이상하게, 가벼웠다.');
      c.journal('노아에게 이슬과 함께 [w]내 빛을 나눴다[/]. 몸속이 비었는데, 이상하게 가벼웠다.');
    } else {
      await c.say(noah, '…고마워. 아침에 눈 뜨는 게 덜 무서울 것 같아.', { face: 'smile' });
      c.bond('noah', 1);
      c.journal('노아에게 나무 정령의 이슬을 전했다. 노아의 시간이 조금 늘었다.');
    }
    c.flag('c1_dew_given');
    c.exp(20);
    await c.say('toria', '찍… 할머니가 기다릴 거야. 오늘 밤엔 할 얘기가 있다고 했어.', { face: 'sad' });
  };

  /* ═════════ 할머니의 밤 ═════════ */
  ST.grandmaNight = async function (c) {
    c.lock(true);
    await c.cinema(true);
    c.music('mother');
    const s = S();
    const gm = c.who('evelyn');
    await c.say('evelyn', '앉아라.', { face: 'closed' });
    if (gm) { gm.forceAnim = 'sit'; }
    await c.say('evelyn', '…니 엄마 이름은 [w]세린[/]이다.', { face: 'sad' });
    await c.say('evelyn', '흰빛으로 렙업하던 사람. 천 년에 세 명 있다는. 그 세 번째.');
    await c.say('toria', '찍……', { face: 'sad' });
    await c.say('evelyn', '살아 있는지 죽었는지, 나도 모른다. 16년 전에 하늘로 갔다. 니를 내 품에 맡기고.');
    await c.say('evelyn', '니 아비는…', { face: 'closed' });
    await c.wait(1.2);
    await c.say('evelyn', '…그건 내 입으로 할 말이 아이다.', { face: 'sad' });
    const k = await c.choice(null, [{ t: '아버지는 누구예요?' }, { t: '엄마는 왜 하늘로 갔어요?' }, { t: '할머니는 대체 누구예요?' }]);
    if (k === 0) await c.say('evelyn', '묻지 마라. 언젠가 그 사람이 니 앞에 설 끼다. 그때 니 눈으로 봐라.', { face: 'angry' });
    else if (k === 1) await c.say('evelyn', '하늘에 배고픈 게 있다. 니 엄마가 그걸 막으러 갔다. …막았는지는 모른다.', { face: 'sad' });
    else { await c.say('evelyn', '약초꾼이다. 그린 마을 약초꾼 에벨린.', { face: 'closed' }); await c.say('toria', '찍… (거짓말할 때 코 찡긋하는 거 봤어)', { face: 'smirk' }); }
    await c.say('evelyn', '레드 가는 다리, 오늘 이장이 고쳤다. 날 밝으면 가거라.');
    await c.say('evelyn', '레드 마을 대장장이 [y]볼칸[/]한테 이 편지 전해라. 뜯지 말고. 그 영감이 니한테 필요한 걸 알려 줄 끼다.');
    await c.getItem('letter_volkan', 1);
    await c.say('evelyn', '그라고…', { face: 'closed' });
    if (s.flags.hero_shared) await c.say('evelyn', '노아한테 빛을 나눴다며. …니 엄마도 그랬다. 남 렙업하는 거 보면 자기 빛을 떼 줬지. 그 버릇, 잊지 마래이.', { face: 'smile' });
    else await c.say('evelyn', '흰빛은 모으면 무거워진다. 남 렙업하는 거 보고 입에 침이 고이거든… 그땐 멈춰라. 알겠나.', { face: 'sad' });
    await c.say('evelyn', '자라. 내일은 멀리 간다.');
    await c.fade(true, { sec: 1.2 });
    c.flag('c1_night');
    if (gm) gm.dead = true;
    await c.narr('그날 밤, 할머니는 늦게까지 서쪽 벽 앞에 서 있었다.\n마지막 칸에 빗금 하나를 긋고, 오래 그 자리를 쓰다듬었다.');
    await c.narr('침대 밑에서 무언가 길쭉한 것을 꺼내 보다가, 도로 밀어 넣는 소리가 났다.');
    c.flag('c1_done'); c.flag('open:red'); c.quest('main', 'on');
    c.heal(); c.save();
    await c.wait(0.5);
    await c.fade(false, { sec: 1.2 });
    c.music('home');
    await c.say('toria', '찍! 아침이야! 가자, 레드로! 다리 건너서 서쪽!', { face: 'happy' });
    await c.cinema(false);
    c.lock(false);
    c.journal('할머니가 엄마 이름을 알려 줬다. [w]세린[/]. 레드의 대장장이 볼칸에게 편지를 전해야 한다.');
  };

  // 이슬을 전한 뒤 오두막에 들어서면 할머니의 밤
  ST.enterHooks.push((m) => { if (m.id === 'g_home' && f('c1_dew_given') && !f('c1_night')) G.script.run(async (c) => { await c.wait(0.3); await ST.grandmaNight(c); }); });

  /* 토리아 혼잣말 */
  ST.chatter = function (cid) {
    if (cid !== 'toria') return null;
    const s = S(); const reg = G.world.map && G.world.map.overworld ? OW.regionOf(Math.floor(G.world.player.x / TS), Math.floor(G.world.player.y / TS)) : null;
    const lines = {
      green: ['찍, 이 길은 할머니랑 약초 캐러 오던 길이야.', '저 나무 위에서 뛰어내리면 날 수 있을까? …안 되겠지.', '레벨 9. 16년째. 찍.'],
      red: ['뜨거워! 꼬리 탈 것 같아, 찍!', '망치 소리가 심장 소리 같아.'],
      blue: ['바다 냄새! 짭짤해, 찍!', '저 물고기들은 레벨이 몇일까?'],
      yellow: ['모래가 털 사이에 다 들어가, 찍…', '금화 반짝반짝. 하나만 주우면 안 될까?'],
      purple: ['여긴 늘 해 질 녘이야. 졸려…', '나무들이 시처럼 속삭여.'],
      white: ['추, 추워! 네 목도리 속에 들어가도 돼?', '눈이 빛을 머금고 있어. 예뻐.'],
      gray: ['색이 없어… 무서워, 찍.', '바닥에서 은빛 가루가 거꾸로 떠올라.'],
      black: ['해가 안 떠. 영원히. 찍…', '등불 하나하나가 누군가의 약속 같아.'],
    };
    const l = (reg && lines[reg]) || ['찍!', '배고파. 도토리 없어?'];
    if (s.lv >= 20 && Math.random() < 0.2) return '너 요즘 렙업할 때 빛이 점점 커져. 찍.';
    return U.pick(l);
  };
})();
