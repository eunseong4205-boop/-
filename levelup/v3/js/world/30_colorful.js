/* 제10장 「무한호」 — 알록달록 곶 · 발명가 피로스와 조수 봄바 · 로켓 「무한호」
   40년째 짓는 로켓에 부품 여섯이 모자란다. 부품은 대륙 곳곳, 지금까지 만난 사람들에게 있다.
   (불꽃 노즐 — 볼칸 · 은빛 연료 — 볼트 · 별 나침반 — 루체 · 황금 외판 — 골디 · 구름 돛 — 롤로 · 백은 방열판 — 루미에와 에델)
   발사 날, 기사단의 방해 → 발사할 빛을 어디서 얻을까(탑 · 대륙의 등불 · 내 빛) → 하늘로 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const CT = OW.towns.colorful, X0 = CT.x, Y0 = CT.y;       // 284, 204
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const PAD = OW.pt(302, 205);                            // 발사대
  const girl = () => S().gender === 'girl';
  const PARTS = [
    { id: 'nozzle', name: '불꽃 노즐', who: 'volkan', where: '레드 볼칸의 대장간', map: 'r_forge' },
    { id: 'fuel', name: '은빛 연료', who: 'bolt', where: '그레이 볼트의 공방', map: 'g_work' },
    { id: 'compass', name: '별 나침반', who: 'luce', where: '블루 등대의 루체', map: 'b_light' },
    { id: 'plating', name: '황금 외판', who: 'goldy', where: '옐로 황금궁의 골디', map: 'y_palace' },
    { id: 'sail', name: '구름 돛', who: 'rolo', where: '무지개 서커스의 롤로', map: 'r_circus' },
    { id: 'shield', name: '백은 방열판', who: 'lumie', where: '화이트 대성당의 루미에', map: 'w_cath' },
  ];
  const got = () => PARTS.filter((p) => f('part:' + p.id)).length;
  ST.COLORFUL = { X0, Y0, PAD, PARTS };

  ST.CH.push({ no: '제10장', id: 'c10', title: '무한호', sub: '40년 동안 한 번도 날지 못한 로켓. 하늘로 가는 부품은 대륙 곳곳, 네가 만난 사람들 손에 있다.',
    goal(s) {
      if (!f('c10_pyros')) return { text: '곶의 발명 공방, 피로스 박사를 찾자.', map: 'world', ...OW.pt(289, 211) };
      if (got() < 6) {
        const n = PARTS.find((p) => !f('part:' + p.id));
        // 표시는 그 부품을 가진 사람이 있는 집 문 앞
        const wm = G.build.get('world'), b = wm.buildings.find((bb) => bb.id === n.map || bb.to === n.map);
        const w = !b && (wm.warps || []).find((ww) => ww.to === n.map);
        const at = b ? { x: b.doorX, y: b.doorY } : w ? { x: w.x, y: w.y + 1 } : OW.pt(289, 211);
        return { text: '부품 모으기 (' + got() + '/6) — 다음: ' + n.name + ' (' + n.where + ')', map: 'world', ...at };
      }
      // 발사대 방어 중에는 공방이 아니라 발사대를 가리킨다
      if (ST.COLORFUL.defendT != null && !f('c10_launch')) return { text: '발사대를 지켜라! 다가오는 기사단을 막는다 — 예열 ' + Math.min(100, Math.floor(ST.COLORFUL.defendT / 60 * 100)) + '%', map: 'world', x: PAD.x + 3, y: PAD.y + 9 };
      if (!f('c10_launch')) return { text: '부품이 다 모였다. 피로스 박사에게!', map: 'world', ...OW.pt(289, 211) };
      return { text: '하늘 정거장으로. (발사대의 무한호에 탄다)', map: 'world', x: PAD.x + 3, y: PAD.y + 8 };
    } });

  /* ───────── 물건 ───────── */
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  for (const p of PARTS) item('part_' + p.id, { type: 'key', name: p.name, desc: '로켓 「무한호」 부품. ' + p.where + '에게서.' });
  item('drawing', { type: 'key', name: '노아의 그림', desc: '크레파스 그림. 로켓 창문에 붙일 거래. 로켓 안에 사람이 넷. 다람쥐 하나.' });

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'c_lab', region: 'colorful', style: 'colorful', tx: X0 + 1, ty: Y0 + 1, w: 8, h: 5, name: '피로스 발명 공방', sign: 'shop', colors: { roof: '#e85a4a' },
      room: { w: 22, h: 13, floor: T.METAL, music: 'colorful', furn: [['desk', 4, 3, { text: '설계도 더미. 맨 위 장: 「무한호 제412안」. 아래 장들은 전부 X 표시. 제1안 날짜는 960년.' }], ['gears', 9, 2], ['gears', 11, 2], ['anvil', 15, 4], ['console', 19, 3, { text: '발사 계기판. 「연료 0%」 「노즐 없음」 「방열판 없음」 「외판 불량」 「돛?」 「나침반?」 빨간불 여섯.' }], ['barrel', 2, 9], ['barrel', 3, 9], ['crate', 19, 9], ['shelf', 1, 2], ['bookpile', 7, 8, { text: '「하늘까지의 거리 — 계산 중」 「하늘은 생각보다 가깝다 — 아스텔」 「하늘은 생각보다 멀다 — 볼트」 여백에 봄바 글씨: 「그냥 가 보면 알지!」' }]] } });
    ST.house(m, { id: 'c_inn', region: 'colorful', style: 'colorful', tx: X0 + 2, ty: Y0 + 14, w: 6, h: 4, name: '쾅쾅 여관', sign: 'inn',
      room: { w: 14, h: 10, floor: T.WOOD, music: 'calm', furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 8, 6], ['chair', 7, 7], ['chair', 10, 7], ['bed2', 12, 3, { v: '#ff8a5a' }], ['bed2', 12, 6, { v: '#5ab8ff' }], ['plant', 1, 8]] } });
    ST.house(m, { id: 'c_shop', region: 'colorful', style: 'colorful', tx: X0 + 17, ty: Y0 + 14, w: 5, h: 4, name: '발명 공방 가게', sign: 'shop',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'colorful', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['gears', 1, 2], ['shelf', 10, 2], ['crate', 2, 6], ['barrel', 9, 6]] } });
    // 발사대
    OW.clear(m, PAD.x - 1, PAD.y - 1, 9, 10, m.hgt[m.i(PAD.x + 2, PAD.y + 8)], T.METAL);
    G.build.placeBuilding(m, { special: 'rocket', tx: PAD.x + 2, ty: PAD.y + 4, w: 3, h: 2, door: false });
    for (const [dx, dy] of [[0, 2], [7, 2], [0, 7], [7, 7]]) { m.obj[m.i(PAD.x + dx, PAD.y + dy)] = O.LAMP; m.lights.push({ x: (PAD.x + dx) * TS + 8, y: (PAD.y + dy) * TS + 2, r: 50, warm: 'rgba(255,200,120,0.2)' }); }
    for (const [dx, dy] of [[6, 6], [11, 6], [6, 11], [20, 6], [24, 11]]) if (!m.solidExtra[m.i(X0 + dx, Y0 + dy)]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.FLOWER;
  });
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(CT.plaza.x - 3), y: py(CT.plaza.y + 3), wid: 'w_colorful', name: '알록달록 곶' }));
    Wd.add(new P.Sign({ x: px(PAD.x + 6), y: py(PAD.y + 9), text: '무한호 발사대\n「제412안. 이번엔 진짜다」 — 피로스\n「지난번에도 그랬다」 — 봄바' }));
    Wd.add(new P.Sign({ x: px(X0 + 12), y: py(Y0 + 21), text: '알록달록 곶 — 쾅! 소리는 성공의 소리\n「폭발은 실패가 아니다. 방향이 틀렸을 뿐이다」' }));
  });

  /* ───────── 제10장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c9_done') || f('ch:c10')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'colorful') return;
    S().flags['ch:c10'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c10');
      c.music('colorful');
      c.sfx('explode'); c.shake(4, 0.6);
      ST.burst && ST.burst(px(PAD.x + 3), py(PAD.y) - 60, '#ff8a3a');
      await c.say('toria', '찍——?! 저쪽에서 뭐가 터졌어! 연기가 하트 모양이야!', { face: 'shock' });
      await c.say('lyra', '알록달록 곶은 원래 그래요. 하루에 세 번 터져요. 아침, 점심, 저녁.', { face: 'smile' });
      await c.say('lyra', '…하늘로 가요. 아버지한테. 같이.', { face: 'closed' });
      c.lock(false);
      c.journal('알록달록 곶에 닿았다. 하루에 세 번 터지는 동네. 리라가 함께 왔다. 하늘로, 아버지에게.');
    });
  });

  /* ───────── 피로스 · 봄바 ───────── */
  ST.person('c_lab', { id: 'pyros', x: 11, y: 5, dir: 'down', mark: () => (!f('c10_pyros') || (got() >= 6 && !f('c10_launch')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:pyros');
    if (!f('c10_pyros')) { await pyrosFirst(c, n); return; }
    if (got() >= 6 && !f('c10_launch')) { await launch(c, n); return; }
    if (f('c10_launch')) { await c.say(n, '무한호는 날았다! 40년! 40년 만에! …나는 이제 뭘 만들지? 하늘에서 내려오는 로켓? 좋아, 제1안!', { face: 'happy' }); return; }
    await c.say(n, '부품 ' + got() + '/6! ' + PARTS.filter((p) => !f('part:' + p.id)).map((p) => p.name + '(' + p.where + ')').join(', ') + '. 서둘러! 아니, 천천히! 서두르면 터진다!', { face: 'happy' });
  } });
  ST.person('c_lab', { id: 'bomba', x: 15, y: 7, dir: 'left', talk: async (c, n) => {
    await c.say(n, ST.lines({ c10: f('c10_pyros') ? ['박사님은 40년 동안 한 번도 포기 안 했어. 한 번도 성공도 안 했지만! 헤헤.', '부품 하나 올 때마다 박사님이 춤춰. 진짜 못 춰. 보면 알아.', '나? 봄바. 폭탄 담당. 폭탄은 무섭지 않아. 안 터지는 게 무서워.'] : '박사님 불러 줄까? 박사님! 손님! …지금 머리가 타고 있어서 못 온대.', c11: '무한호 떠나는 거 봤어! 하늘에 줄이 그어졌어! 나 울었어! 박사님도 울었어! 둘 다 못생기게!' }), { face: 'happy' });
  } });
  async function pyrosFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '어어어— 손님! 흰빛? 진짜 흰빛? 볼트 영감 편지에 쓰여 있던 그 흰빛? 이리 와! 앉지 마, 거기 터져!', { face: 'happy' });
    await c.say(n, '나는 피로스! 발명가! 40년 동안 [y]무한호[/]를 만들었지. 하늘 정거장까지 가는 로켓! 제412안!', { face: 'happy' });
    await c.say(n, '문제는 — 부품이 여섯 개 모자라. 40년 동안 모자랐어. 아무도 안 도와줬거든. 미친 발명가라고.', { face: 'sad' });
    await c.say(n, '볼트 영감 편지에 그러더군. 「흰빛은 사람을 모은다. 부품은 사람한테 있다.」 쓸데없는 말은 안 쓰는 영감이 한 줄을 더 썼어.', { face: 'normal' });
    await c.say(n, '필요한 건 이거야!||[y]불꽃 노즐[/] — 레드의 대장장이. 불을 아는 손.||[y]은빛 연료[/] — 그레이의 볼트. 광맥의 은.||[y]별 나침반[/] — 블루 등대. 하늘 길을 아는 바늘.||[y]황금 외판[/] — 옐로의 금화왕. 비싸겠지.||[y]구름 돛[/] — 무지개 하늘섬. 구름을 붙잡을 천.||[y]백은 방열판[/] — 화이트의 성기사. 하늘은 뜨거워.', { face: 'normal' });
    await c.say('toria', '찍… 전부 우리가 만난 사람들이야. 볼칸 아저씨, 볼트 아저씨, 루체 언니, 골디 아저씨, 롤로 아저씨, 루미에 성녀님.', { face: 'shock' });
    await c.say('lyra', '대륙을 한 바퀴. …이별 인사 같네요.', { face: 'sad' });
    await c.say('toria', '아니야! 다녀오겠다는 인사야!', { face: 'angry' });
    c.flag('c10_pyros'); c.flag('c10_parts');
    await c.cinema(false);
    c.lock(false);
    c.journal('발명가 피로스의 로켓 「무한호」. 부품 여섯이 모자란다. 부품은 지금까지 만난 사람들 손에 있다. 이정표로 대륙을 한 바퀴.');
  }

  /* ───────── 부품: 각자의 자리에서 ───────── */
  /** 지도 mapId의 인물 id에게, 조건이 맞을 때 먼저 할 말을 끼워 넣는다 */
  ST.hookTalk = function (mapId, id, cond, fn) {
    const all = (ST.people[mapId] || []).filter((x) => x.id === id);
    if (!all.length) { ST.person(mapId, { id, x: 5, y: 4, dir: 'down', when: cond, mark: () => '!', talk: fn }); return; }
    // 같은 사람이 장마다 따로 서 있으면(에블린 등) 모두에 건다. 억지로 세우는 건 아무도 안 서 있을 때 첫 사람만 — 둘이 겹쳐 서지 않게
    all.forEach((sp, i) => {
      const old = sp.talk, oldMark = sp.mark, oldWhen = sp.when;
      if (i === 0) { const others = all.slice(1); sp.when = (s) => (oldWhen ? oldWhen(s) : true) || (cond(s) && !others.some((o) => !o.when || o.when(s))); }
      sp.mark = (s) => (cond(s) ? '!' : oldMark ? oldMark(s) : null);
      sp.talk = async (c, n) => (cond(S()) ? fn(c, n) : old ? old(c, n) : undefined);
    });
  };
  const need = (id) => () => f('c10_parts') && !f('part:' + id);
  async function givePart(c, id) { c.flag('part:' + id); await c.getItem('part_' + id); const n = got(); await c.say(null, '무한호 부품 ' + n + '/6', { style: 'sys' }); if (n === 6) await c.say('toria', '찍! 여섯 개 다 모았어! 알록달록 곶으로!', { face: 'happy' }); }

  ST.hookTalk('r_forge', 'volkan', need('nozzle'), async (c, n) => {
    c.lock(true);
    await c.say(n, '로켓? 하늘까지? 하하하! 에벨린 누님 손주가 하늘까지 간다고!', { face: 'happy' });
    const rt = S().flags.c2_route;
    await c.say(n, rt === 'dawn' ? '노즐이라면 좋은 쇠가 있다. 네가 부순 착즙기 고철. 사람 빛을 짜내던 쇠로 하늘 가는 불을 뿜게 해 주지. 그게 대장장이 복수다.' : rt === 'order' ? '노즐이라면 좋은 쇠가 있다. 기사단이 압수했다 돌려준 광산 레일. 법대로 돌아온 쇠다. 튼튼하다.' : '노즐이라면 좋은 쇠가 있다. 누가 밤에 대장간 앞에 두고 간 금괴 녹인 거. 고양이 발자국이 찍혀 있었지. …네 짓 아니지?', { face: 'smirk' });
    c.sfx('anvil'); await c.wait(0.4); c.sfx('anvil'); await c.wait(0.4); c.sfx('anvil'); c.shake(2, 0.3);
    await c.narr('망치 소리가 세 번. 볼칸의 이마에서 땀이 한 방울 떨어져 노즐 위에서 치익, 하고 사라졌다.');
    await c.say(n, '불꽃 노즐. 983년에 누님 창날을 세운 망치로 두드렸다. …하늘에서 누님한테 안부 전해라. 아니, 누님은 그린에 있지. 하하. 늙었나.', { face: 'smile' });
    await givePart(c, 'nozzle');
    c.lock(false);
  });
  ST.hookTalk('g_work', 'bolt', need('fuel'), async (c, n) => {
    c.lock(true);
    await c.say(n, '피로스. 그 미친놈. …연료 배합을 네 번 틀렸더군. 편지로 고쳐 줬다. 쓸데없는 말 빼고 세 장.', { face: 'closed' });
    await c.say(n, '광맥 바닥 은빛 부스러기. 빛이 아니라 은이다. 먹을 수 없는 빛. 태울 수는 있다. 그러니 탑 없이도 난다.', { face: 'normal' });
    await c.say('sepia', '연료통 세 개. 내가 채웠다. 이번엔 1분 만에 이름을 찾았다. 이 감정의 이름: 「응원」.', { face: 'happy' });
    await givePart(c, 'fuel');
    await c.say(n, '…하늘에서 흑점을 보거든, 따지지 마라. 그냥 봐라. 아내가 그랬다. 멈추는 것도 답이라고.', { face: 'sad' });
    c.lock(false);
  });
  ST.person('g_work', { id: 'sepia', x: 15, y: 6, dir: 'left', when: () => ST.after('c9') || f('c8_done'), talk: async (c, n) => { await c.say(n, ST.lines({ c8: '볼트는 요즘 노래를 흥얼거린다. 음정이 3퍼센트 틀린다. 기록하지 않겠다.', c10: '색 표본 병을 새로 만들었다. 하늘색 칸이 비었다. 하늘에서 담아 와 줄 수 있나.' }), { face: 'smile' }); } });
  ST.hookTalk('b_light', 'luce', need('compass'), async (c, n) => {
    c.lock(true);
    if (f('orhan_done')) {
      await c.say(n, '하늘? 하늘까지 간다고? …그럼 이거 가져가. 아빠 나침반. 아빠가 편지에 그랬어. 「바늘이 하늘을 가리키면 이제 쫓지 말라는 뜻이다.」', { face: 'normal' });
      await c.say(n, '바늘이 요즘 계속 위를 가리켜. 그러니까 이건 당신이 쫓아. 아빠 대신. 그리고 아빠가 집에 오는 길은… 내가 등불로 밝힐게.', { face: 'smile' });
    } else {
      await c.say(n, '하늘? …아빠도 하늘을 쫓다가 안 돌아왔어. 983년 겨울에. 흰 줄기가 떨어진 데로.', { face: 'sad' });
      await c.say(n, '이거 가져가. 아빠 나침반. 바늘이 계속 위를 가리켜. 하늘에서 아빠를 보면… 아니, 아무것도 아니야. 조심해서 가.', { face: 'sad' });
    }
    await givePart(c, 'compass');
    c.lock(false);
  });
  ST.hookTalk('y_palace', 'goldy', need('plating'), async (c, n) => {
    c.lock(true);
    await c.say(n, '황금 외판. 로켓 겉에 두를 금. 금화 삼만 닢어치. 공짜는 없어.', { face: 'smirk' });
    const k = await c.choice('금화왕이 턱을 괸다.', [
      { t: '금화 10000을 낸다 (나머지는 외상)', if: S().gold >= 10000 },
      { t: '「하늘에서 본 걸 말해 줄게요. 제일 먼저.」', sub: '돈 대신 이야기로.' },
      { t: '「피카네 참새단도 같이 태워 주면요?」', sub: '농담 반.' },
    ]);
    if (k === 0) { c.gold(-10000); await c.say(n, '만 닢. 좋아. 나머지 이만은… 돌아와서 갚아. 이자는 연 0퍼센트. 처음 해 보는 장사군.', { face: 'smile' }); }
    else if (k === 1) { await c.say(n, '……하. 이야기로 값을 치르겠다. 세린도 그랬지. 「돌아와서 하늘 이야기 해 줄게.」 안 돌아왔어. 그러니까 너는 — 돌아와서 해. 그게 값이다.', { face: 'sad' }); c.bond('goldy', 2); c.flag('goldy_promise'); }
    else { await c.say(n, '하하! 참새들을 로켓에? 그 녀석들이 하늘에서 정거장 전선을 다 훔쳐 올 거다. …좋아, 기분이 좋군. 외판은 공짜다. 오늘만. 평생 처음으로.', { face: 'happy' }); await c.say('pika', '(창문 밖에서) 들었어! 공짜래! 금화왕이 공짜래!', { face: 'happy' }); c.bond('goldy', 1); }
    await givePart(c, 'plating');
    c.lock(false);
  });
  ST.hookTalk('r_circus', 'rolo', need('sail'), async (c, n) => {
    c.lock(true);
    await c.say(n, '구름 돛! 누베가 구름을 조금 떼어 줬어요. 아프냐고 물었더니 구름은 쓰다듬으면 커진대요. 그래서 제가 떼어 낸 자리를 쓰다듬어 줬어요.', { face: 'happy' });
    await c.say(n, '돛에 그림을 그렸어요. 일곱 빛깔. 제 색으로요. 칠한 색 말고, 손등에서 돌아온 색으로.', { face: 'smile' });
    await givePart(c, 'sail');
    await c.say(n, '…광대는 무대에서 떨어지는 게 일이에요. 떨어져도 일어나는 게 공연이고요. 하늘에서 떨어지지 마요. 떨어지면 일어나요.', { face: 'normal' });
    c.lock(false);
  });
  ST.hookTalk('w_cath', 'lumie', need('shield'), async (c, n) => {
    c.lock(true);
    await c.say(n, '하늘까지…. 에델, 가져와요.', { face: 'normal' });
    const ed = c.spawn({ cid: 'edel', x: n.x + 30, y: n.y + 20, dir: 'left' });
    await c.say(ed, '백은 기사의 방패를 녹였소. 열한 개. 대성당에 있던 방패 전부. 방패는 가두는 데 쓰였소. 이제 지키는 데 쓰이길.', { face: 'normal' });
    await c.say(n, '하늘은 뜨거워요. 흑점 가까이는 더. 이 방열판이 당신을 지킬 거예요. 내 기도 대신.', { face: 'smile' });
    await givePart(c, 'shield');
    await c.say(ed, '…그대가 돌아오면, 대성당 종을 치겠소. 한 번도 친 적 없는 종이오. 기쁠 때 치는 종이라서.', { face: 'smile' });
    ed.dead = true;
    c.lock(false);
  });
  // 덤: 노아의 그림 · 비올라의 부양 공식
  ST.hookTalk('w_ward', 'noah', () => f('c10_parts') && !f('c10_drawing'), async (c, n) => {
    await c.say(n, (girl() ? '누나' : '형아') + '! 로켓 탄다며! 이거! 로켓 창문에 붙여!', { face: 'happy' });
    await c.narr('크레파스 그림. 로켓 안에 사람이 넷. 다람쥐 하나. 하늘 꼭대기에 하얀 동그라미와, 그 옆에 까만 동그라미. 까만 동그라미가 웃고 있다.');
    await c.say(n, '까만 거는 흑점이야. 웃게 그렸어. 배부르면 웃잖아.', { face: 'smile' });
    c.flag('c10_drawing'); await c.getItem('drawing');
  });
  ST.person('p_academy', { id: 'viola', x: 14, y: 4, dir: 'down', when: () => ST.after('c10') || f('c6_done'), mark: () => (f('c10_parts') && !f('c10_viola') ? '!' : null), talk: async (c, n) => {
    if (f('c10_parts') && !f('c10_viola')) {
      await c.say(n, '로켓? …부양 공식 필요하지? 세린의 기록 스물다섯째. 아무도 몰라. 나만 알아. 내가 만들었거든.', { face: 'smirk' });
      await c.say(n, '기록 스물다섯: 「누군가를 하늘로 올려 보내기.」 …세린은 못 한 거야. 내가 처음이야. 흥.', { face: 'blush' });
      c.flag('c10_viola'); c.bond('viola', 2);
      await c.say(null, '비올라의 부양 공식을 받았다. 로켓이 조금 더 가볍게 날 것이다.', { style: 'sys' });
      return;
    }
    await c.say(n, ST.lines({ c6: '천년제 공연은 망했어. 기둥이 부러져서. …그래도 당신 흰빛, 제일 앞자리에서 봤어.', c10: '돌아오면 과녁 대결. 세 번째. 이번엔 안 져.' }), { face: 'blush' });
  } });

  /* ───────── 발사 ───────── */
  async function launch(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '여섯 개! 여섯 개가 다 있어! 40년! 봄바! 봄바아아!', { face: 'happy' });
    await c.say('bomba', '박사님 울지 마! 코에서 기름 나와!', { face: 'happy' });
    await c.say(n, '아 참! 이거 입어! 40년 동안 만든 건 로켓만이 아니야. [y]별빛 옷[/]! 하늘은 뜨겁고 차갑거든. 둘 다 막는다!', { face: 'happy' });
    await c.getItem('ar_star');
    await c.fade(true, { sec: 1 });
    ST.toNight && ST.toNight();
    const P = G.world;
    G.game.goto('world', px(PAD.x + 3), py(PAD.y + 10), 'up');
    const py0 = c.spawn({ cid: 'pyros', x: px(PAD.x + 1), y: py(PAD.y + 9), dir: 'up' });
    const bb = c.spawn({ cid: 'bomba', x: px(PAD.x + 5), y: py(PAD.y + 9), dir: 'up' });
    c.music('colorful');
    await c.fade(false, { sec: 1 });
    await c.narr('그날 밤, 발사대에 무한호가 섰다. 불꽃 노즐, 은빛 연료, 별 나침반, 황금 외판, 구름 돛, 백은 방열판.' + (f('c10_drawing') ? ' 창문엔 노아의 그림.' : '') + '\n대륙 한 바퀴가 로켓 한 대가 되어 있었다.');
    await c.say(py0, '마지막 문제. 연료는 있다. 그런데 점화에는 [y]탑 하나만큼의 빛[/]이 필요해. 은은 타지만, 불을 붙이는 건 빛이거든.', { face: 'normal' });
    c.stopMusic(0.5);
    c.sfx('rumble'); c.shake(3, 1);
    await c.say('toria', '찍?! 뭐야, 저 불빛들!', { face: 'shock' });
    await c.narr('곶으로 오는 길에 횃불이 줄지어 있었다. 징수 기사단. 카이론의 문장.');
    const rt = S().flags.route_lock;
    await c.say(null, rt === 'order' ? '카시안의 편지가 화살에 묶여 날아왔다. 「스승님 명령이 아니다. 기사단 일부가 멋대로 움직였다. 그라우스의 부하들이다. 막아라. 나는 반대편 길을 막겠다.」' : rt === 'dawn' ? '레아의 목소리가 어둠 속에서 들렸다. 「새벽단 스무 명, 곶 입구에 있어! 기사단 절반은 우리가 맡는다! 나머지는 부탁해!」' : '까만 깃털이 발치에 떨어졌다. 「그라우스의 잔당이다. 녹턴이 성을 비웠더니 쥐들이 나왔군. 고양이는 쥐를 좋아하지만 이번엔 너한테 양보하지. — M」', { style: 'sys' });
    await c.say(py0, '점화까지 시간이 필요해! 노즐 예열 60초! 발사대를 지켜 줘!', { face: 'shock' });
    py0.dead = true; bb.dead = true;
    await c.cinema(false);
    c.lock(false);
    // 발사대 방어: 60초
    c.music('battle');
    c.banner('발사대를 지켜라', '60초 · 무한호에 다가오는 기사단을 막는다', 2);
    const Wd = G.world, p = Wd.player;
    let t = 0, spawnT = 0, alive = [];
    const types = ['knight', 'knight', 'bandit', 'mage', 'drone'];
    S().duel = true; ST.COLORFUL.defendT = 0;
    await c.freeWhile(() => {
      t += 1 / 60; spawnT -= 1 / 60; ST.COLORFUL.defendT = t;
      alive = alive.filter((e) => !e.dead);
      if (spawnT <= 0 && alive.length < 6 && t < 55) { spawnT = 3.2; const side = Math.random() < 0.5 ? -1 : 1; const e = G.foes.spawn(U.pick(types), px(PAD.x + 3) + side * 150, py(PAD.y + 12) + (Math.random() - 0.5) * 60, { tier: 9 }); e.aggro = true; alive.push(e); }
      if (Math.floor(t) !== Math.floor(t - 1 / 60) && Math.floor(t) % 10 === 0 && t > 1) G.ui.toast('예열 ' + Math.min(100, Math.floor(t / 60 * 100)) + '%', 'gold');
      if (S().hp <= 1) { S().hp = G.st.derive(S()).hpMax >> 1; G.ui.toast('봄바가 물약을 던졌다!', 'good'); }
      return t >= 60;
    });
    S().duel = false; ST.COLORFUL.defendT = null;
    for (const e of alive) if (!e.dead) { G.fx.shards(e.x, e.y - 8, 8, '#ffffff'); e.dead = true; }
    c.lock(true);
    await c.cinema(true);
    c.music('epic');
    const py1 = c.spawn({ cid: 'pyros', x: px(PAD.x + 1), y: py(PAD.y + 9), dir: 'up' });
    await c.say(py1, '예열 끝! 이제 점화할 빛! 어디서 가져오지? 탑 하나만큼!', { face: 'shock' });
    const k = await c.choice('무한호에 불을 붙일 빛.', [
      { t: '가장 가까운 징수탑의 빛을 끌어온다', tag: 'order', sub: '볼트의 역류 장치 설계를 거꾸로. 모인 빛을 한 번만 쓴다.' },
      { t: '탑을 통해 대륙에 부탁한다 — 등불 하나씩', tag: 'dawn', sub: '리라가 노래한다. 들은 사람이 등불을 켜고 빛 한 방울을 보낸다.' },
      { t: '내 빛으로 붙인다', sub: '[r]심연[/]. 가장 확실하다. 무언가를 잃는다.' },
    ]);
    c.flag('c10_fire_' + ['tower', 'voices', 'self'][k]);
    if (k === 0) {
      c.route('order', 2);
      await c.narr('발사대 옆 징수탑의 핵을 열었다. 탑이 모아 둔 빛이 관을 타고 무한호로 흘렀다. 탑이 꺼졌다. 곶의 마을 불빛이 조금 밝아졌다.\n모인 빛을 쓰는 건 이번이 마지막이다. 그렇게 정했다.');
    } else if (k === 1) {
      c.route('dawn', 1); c.route('night', 1);
      const ly = 'lyra';
      await c.say(ly, '…들려요? 탑은 빛만 모으는 게 아니에요. 소리도 날라요. 카이론이 대륙에 방송할 때 썼던 것처럼.', { face: 'closed' });
      c.music('dream');
      await c.narr('[p]두 개의 등불이 있었네 / 하나는 밤으로, 하나는 숲으로\n두 등불이 하늘로 가네 / 불을 빌려 주세요, 한 방울만[/]');
      await c.narr('리라의 노래가 대륙의 모든 탑을 타고 흘렀다.');
      await c.narr('그린의 마리엔 아줌마가 가게 등불을 켰다. 레드의 광부들이 곡괭이 끝에 불을 붙였다. 블루의 루체가 등대를 돌렸다.\n옐로의 참새들이 지붕 위에서 성냥을 그었다. 퍼플의 학생들이 일제히 영창했다. 화이트 대성당의 종이 — 처음으로 울렸다.\n그레이의 볼트가 공방 창문을 열었다. 블랙의 등불 거리 스물세 개가 한꺼번에 하얗게 탔다.');
      await c.narr('빛 한 방울씩이 탑을 거꾸로 타고 곶으로 모였다. 누구의 빛도 바래지 않을 만큼. 조금씩.');
      S().shareCount = (S().shareCount || 0) + 3;
      c.flag('voices');
    } else {
      c.abyss('self_fire'); S().shareCount = (S().shareCount || 0) + 1;
      c.flash('#ffffff', 0.6); c.sfx('white');
      await c.narr('노즐에 손을 대고 흰빛을 쏟았다. 팔이 차가워지고, 시야가 하얗게 바랬다. 무한호의 심장이 뛰기 시작했다.');
      await c.say('toria', '…앞머리. 하얀 게 세 가닥이 됐어. 그만해. 그만!', { face: 'cry' });
    }
    c.sfx('rumble'); c.shake(6, 2);
    await c.say(py1, '점화! 무한호, 발사아아아——!', { face: 'happy' });
    await c.say('bomba', '박사님, 탑승자 명단 불러요! 흰빛! 다람쥐! 리라 언니!' + (S().party.includes('rud') ? ' 루드 형!' : '') + ' …박사님은?!', { face: 'shock' });
    await c.say(py1, '나는 여기서 본다! 40년 동안 이 순간을 밑에서 보는 상상만 했거든! 타는 상상은 한 번도 안 했어!', { face: 'happy' });
    await c.fade(true, { sec: 1.5 });
    c.flag('c10_launch'); c.flag('c10_done');
    await c.narr('불꽃. 굉음. 몸이 의자에 짓눌렸다. 창밖으로 곶이, 대륙이, 바다가 작아졌다.' + (f('voices') ? '\n대륙 곳곳에서 등불이 반짝였다. 누군가가 보낸 빛 한 방울씩이, 로켓이 지나간 자리를 따라 별처럼 남았다.' : ''));
    await c.say('toria', '…날고 있어. 나 날고 있어. 로켓 안이지만. 이것도 나는 거지? 그렇지?', { face: 'cry' });
    await c.say('lyra', '…응. 나는 거예요.', { face: 'smile' });
    c.flag('c10p_' + k);
    c.journal(k === 0 ? '무한호가 떴다. 징수탑 하나의 빛을 마지막으로 끌어 썼다.' : k === 1 ? '무한호가 떴다. 리라의 노래가 탑을 타고 흘렀고, 대륙 사람들이 등불 하나씩을 보냈다.' : '무한호가 떴다. 내 빛으로 불을 붙였다. 앞머리가 세 가닥 하얘졌다.');
    if (ST.startStation) await ST.startStation(c);
    else { await c.fade(false, { sec: 1 }); await c.cinema(false); c.lock(false); }
  }

  /* ───────── 주민 · 가게 ───────── */
  ST.folk('c_shop', { name: '발명 공방 가게', folk: 'inventor', x: 5, y: 3, lines: { c10: async (c) => { const k = await c.choice('폭탄! 물약! 화살! 전부 조금씩 터진다!', ['물건을 산다', '괜찮아요'], { name: '발명 공방 가게' }); if (k === 0) await c.shop('colorful'); } } });
  ST.folk('c_inn', { name: '쾅쾅 여관 주인', folk: 'farmerw', x: 4, y: 3, lines: { c10: async (c) => { const k = await c.choice('베개에 귀마개가 달려 있어요. 쾅 소리 때문에. (60골드)', ['쉰다', '괜찮아요'], { name: '쾅쾅 여관 주인' }); if (k === 0) { if (S().gold >= 60) c.gold(-60); await c.rest(); } } } });
  ST.folk('world', { name: '곶 아이', folk: 'kid', ...OW.pt(295, 214), wander: 30, barks: ['쾅!', '로켓이다!'], lines: { c10: ['피로스 박사님이 로켓을 또 만든대! 지난번 건 우리 집 지붕에 떨어졌어! 지붕에 구멍 났는데 별이 보여서 좋아!', '봄바 누나는 폭탄 던지기 대회 1등이야. 나는 2등. 참가자 둘.'] } });
  ST.folk('world', { name: '곶 어부', folk: 'sailor', ...OW.pt(300, 222), lines: { c10: '바다에서 보면 곶이 하루에 세 번 번쩍여. 그걸로 시간을 알아. 로켓 시계야, 우리는.' } });
})();
