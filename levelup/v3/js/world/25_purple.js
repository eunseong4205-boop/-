/* 제5장 「해 질 녘의 숲」 — 퍼플 · 라벤더 학원 · 진실의 거울 연못 · 거꾸로 선 탑
   베라 교수(세린의 스승) · 천재 비올라(세린의 기록을 깨려는 아이) · 연못지기 시빌
   거울은 「네가 되고 싶지 않은 너」를 비춘다. 더 들여다볼수록 심연이 깊어진다. 끝에 카이론의 방송과 구름고래의 초대장. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const PT = OW.towns.purple, X0 = PT.x, Y0 = PT.y;     // 124, 96
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const POND = OW.pt(138, 112);
  ST.PURPLE = { X0, Y0, POND };

  ST.CH.push({ no: '제5장', id: 'c5', title: '해 질 녘의 숲', sub: '해가 지지 않고, 뜨지도 않는 숲. 거울 연못은 보고 싶지 않은 얼굴을 비춘다.',
    goal(s) {
      if (!f('c5_vera')) return { text: '라벤더 학원의 베라 교수를 찾아가자.', map: 'world', x: X0 + 6, y: Y0 + 6 };
      if (!f('c5_viola')) return { text: '학원 뜰의 천재, 비올라가 기다린다. (마법 과녁 대결)', map: 'world', x: X0 + 10, y: Y0 + 9 };
      if (!f('c5_sybil')) return { text: '거울 연못의 시빌 할멈에게 가자.', map: 'world', x: POND.x, y: POND.y - 6 };
      if (!f('d5:boss')) return { text: '연못 가운데 돌계단으로 내려가, 거꾸로 선 탑 가장 깊은 곳으로.', map: 'world', x: POND.x, y: POND.y };   // 연못 속 입구
      if (!f('c5_tea')) return { text: '베라 교수에게 돌아가자.', map: 'world', x: X0 + 6, y: Y0 + 6 };
      return { text: '구름고래의 초대장. 하늘섬 무지개의 천년제로.', map: 'world', x: X0 + 16, y: Y0 + 2 };
    } });
  ST.closedMsg.rainbow = '하늘섬은 구름 위에 있어. 걸어서는 못 가. 초대장이 있으면 구름고래가 온대.';

  /* ───────── 넓은 지도 ───────── */
  OW.hooks.push((m) => {
    ST.house(m, { id: 'p_academy', region: 'purple', style: 'purple', tx: X0 + 2, ty: Y0 + 1, w: 9, h: 5, name: '라벤더 학원', sign: 'magic',
      room: { w: 20, h: 13, floor: T.TILE, music: 'purple', rug: [7, 4, 6, 7], furn: [['desk', 4, 3, { text: '베라 교수의 책상. 찻잔 받침으로 쓰는 낡은 종이 한 장. 둥근 얼룩이 겹겹이.' }], ['shelf', 1, 2], ['shelf', 16, 2], ['shelf', 18, 2], ['crystalball', 10, 3, { text: '수정구. 들여다보면 해 질 녘의 하늘만 보인다. 이 숲에서는 늘 그렇다.' }], ['cauldron', 14, 6, { v: '#b87aff' }], ['bench', 5, 9], ['bench', 12, 9], ['plant', 1, 10], ['plant', 18, 10], ['mirror', 17, 7, { text: '전신 거울. 비친 얼굴이 조금 늦게 따라 웃는다.' }]] } });
    ST.house(m, { id: 'p_shop', region: 'purple', style: 'purple', tx: X0 + 22, ty: Y0 + 2, w: 5, h: 4, name: '라벤더 마도구점', sign: 'magic',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'purple', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['cauldron', 2, 6, { v: '#8ad8ff' }], ['crystalball', 9, 6]] } });
    ST.house(m, { id: 'p_inn', region: 'purple', style: 'purple', tx: X0 + 22, ty: Y0 + 14, w: 7, h: 4, name: '황혼 쉼터', sign: 'inn',
      room: { w: 15, h: 10, floor: T.WOOD, music: 'calm', rug: [5, 5, 5, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 9, 5], ['chair', 8, 6], ['chair', 11, 6], ['harp', 13, 3], ['bed2', 13, 6, { v: '#8a5ad8' }]] } });
    ST.house(m, { id: 'p_sybil', region: 'purple', style: 'purple', tx: POND.x - 3, ty: POND.y - 10, w: 5, h: 4, name: '연못지기의 오두막', colors: { roof: '#4a3a6a' },
      room: { w: 11, h: 9, floor: T.WOOD, music: 'dream', furn: [['mirror', 5, 2, { text: '작은 손거울이 벽에 가득. 모두 뒤집어 걸려 있다.' }], ['cauldron', 8, 5, { v: '#d8b0ff' }], ['bed2', 1, 3, { v: '#6a5a8a' }], ['bookpile', 3, 6]] } });
    // 거울 연못 가운데 작은 섬과 계단: 여기서 거꾸로 선 탑으로 내려간다
    const ph = m.hgt[m.i(POND.x - 3, POND.y)];
    for (let y = POND.y - 1; y <= POND.y + 1; y++) for (let x = POND.x - 1; x <= POND.x + 2; x++) { const i = m.i(x, y); m.ter[i] = T.STONE; m.obj[i] = 0; m.hgt[i] = ph; }
    for (let y = POND.y - 6; y < POND.y - 1; y++) { const i = m.i(POND.x, y); if (m.ter[i] === T.WATER || m.ter[i] === T.DEEP) m.ter[i] = T.BRIDGE; const j = m.i(POND.x + 1, y); if (m.ter[j] === T.WATER || m.ter[j] === T.DEEP) m.ter[j] = T.BRIDGE; }
    m.warps.push({ x: POND.x, y: POND.y, w: 2, h: 1, to: 'd5', id: 'd5_gate', cond: () => f('c5_sybil'), msg: '연못 가운데 돌계단이 물속으로 이어진다. 시빌 할멈의 허락 없이는 물이 길을 열어 주지 않는다.' });
    // 숲 꾸미기: 버섯 · 가로등
    for (const [dx, dy] of [[0, 8], [31, 3], [31, 20], [1, 22], [16, 23]]) m.obj[m.i(X0 + dx, Y0 + dy)] = O.SHROOM;
    for (const [dx, dy] of [[12, 7], [20, 7], [12, 17], [20, 17]]) { m.obj[m.i(X0 + dx, Y0 + dy)] = O.LAMP; m.lights.push({ x: (X0 + dx) * TS + 8, y: (Y0 + dy) * TS + 2, r: 54, warm: 'rgba(220,170,255,0.2)' }); }
  });
  // 퍼플은 늘 해 질 녘: 지도에 보랏빛 노을
  const oldNight = G.story.nightFactor;
  G.story.nightFactor = function () {
    const Wd = G.world, m = Wd.map;
    if (m && m.overworld && Wd.player && OW.regionOf(Math.floor(Wd.player.x / TS), Math.floor(Wd.player.y / TS)) === 'purple') return 0.35;
    return oldNight();
  };
  const inPurple = () => { const Wd = G.world, m = Wd.map; return m && m.overworld && Wd.player && OW.regionOf(Math.floor(Wd.player.x / TS), Math.floor(Wd.player.y / TS)) === 'purple'; };
  const oldSky = G.story.skyTint, oldDark = G.story.darkCol;
  G.story.skyTint = () => (inPurple() ? 'rgba(255,120,190,0.34)' : oldSky ? oldSky() : null);
  G.story.darkCol = () => (inPurple() ? 'rgba(40,10,60,1)' : oldDark ? oldDark() : null);

  /** 연못 섬 가운데, 물속으로 내려가는 돌계단 */
  class PondStair extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'deco', solid: false, bw: 1, bh: 1 }, o)); }
    update(dt) { this.t += dt; if (f('c5_sybil') && Math.random() < dt * 6) G.fx.part({ x: this.x + (Math.random() - 0.5) * 22, y: this.y - 4, z: 0, vz: 14, g: 0, life: 1.2, col: '#d8b0ff', size: 1, glow: true }); }
    drawShadow(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      // 아래로 내려가는 계단 (가장자리일수록 어둡게)
      const cols = ['#b8a8c8', '#8a7aa0', '#5a4a78', '#34285a', '#1a1238'];
      for (let k = 0; k < 5; k++) { g.fillStyle = cols[k]; g.fillRect(x - 14 + k, y - 14 + k * 3, 28 - k * 2, 3); }
      g.fillStyle = '#e8d8ff'; g.fillRect(x - 14, y - 14, 28, 1);
      const open = f('c5_sybil');
      g.globalAlpha = open ? 0.45 + Math.sin(this.t * 3) * 0.2 : 0.25;
      g.fillStyle = open ? '#c890ff' : '#4a6a9a'; g.fillRect(x - 10, y - 2, 20, 3);
      g.globalAlpha = 1;
    }
    draw() {}
  }
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(PT.plaza.x + 3), y: py(PT.plaza.y - 3), wid: 'w_purple', name: '퍼플 라벤더 학원' }));
    Wd.add(new PondStair({ x: POND.x * TS + 16, y: POND.y * TS + 12 }));
    Wd.add(new P.Sign({ x: px(POND.x + 2), y: py(POND.y - 5), text: '진실의 거울 연못\n「들여다보는 사람은 들여다보이는 사람이다」 — 시빌' }));
    // 비올라의 마법 과녁
    if (f('c5_vera') && !f('c5_viola')) for (const [i, [dx, dy]] of [[5, 11], [9, 12], [13, 11]].entries()) { const t = G.foes.spawn('dummy', px(X0 + dx), py(Y0 + dy)); t.name = '마법 과녁'; t.targetNo = i; }
  });

  /* ───────── 제5장 시작 ───────── */
  ST.onTick.push(() => {
    if (!f('c4_done') || f('ch:c5')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'purple') return;
    S().flags['ch:c5'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c5');
      await c.say('toria', '찍… 해가 저기 걸려서 안 내려가. 졸려. 여긴 시간이 멈춘 것 같아.', { face: 'sad' });
      await c.say('toria', '라벤더 학원. 엄마가… 여기서 공부했대. 골디 아저씨가 그랬어.', { face: 'think' });
      c.lock(false);
    });
  });

  /* ───────── 베라 교수 ───────── */
  ST.person('p_academy', { id: 'vera', x: 5, y: 4, dir: 'down', mark: () => (!f('c5_vera') || (f('d5:boss') && !f('c5_tea')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:vera');
    if (!f('c5_vera')) {
      c.lock(true);
      await c.say(n, '…어머.', { face: 'shock' });
      await c.narr('찻잔을 든 여인이 잔을 내려놓는 것도 잊고 너를 본다. 찻물이 넘쳐 받침 종이를 적신다.');
      await c.say(n, '그 눈. 그 서 있는 모양. 세린이 처음 이 문을 열고 들어왔을 때랑 똑같아.', { face: 'sad' });
      await c.say(n, '라벤더 학원 마법 교수 베라예요. 세린을 가르쳤죠. 가르쳤다기보다는… 따라가느라 숨이 찼지만.', { face: 'smile' });
      await c.say(n, '세린은 입학 첫해에 학원의 모든 기록을 깼어요. 그 기록을 깨려는 아이가 지금 이 학원에 한 명 있어요. [y]비올라[/]. 뜰에 있을 거예요.', { face: 'closed' });
      await c.say(n, '그 아이를 먼저 만나 봐요. 그다음에 이야기해요. 세린에 대해서도, 거울 연못에 대해서도.');
      const rt = ST.route();
      if (rt === 'night') await c.say(n, '…그리고 리라라는 음유시인. 당신 곁에 붙어 다닌다던데. 그 아이 노래는 싫어요. 너무 많이 알아요.', { face: 'angry' });
      c.flag('c5_vera'); c.lock(false);
      return;
    }
    if (f('d5:boss') && !f('c5_tea')) { await veraTea(c, n); return; }
    await c.say(n, ST.lines({ c5: ['비올라는 이겨야 한다고 생각해요. 누구를? 세린을. 죽었는지 살았는지 모를 사람을.', '마법은 빛을 모양으로 만드는 일이에요. 흰빛은… 모양이 없어요. 그래서 무서워요.'], c6: '천년제에서 터진 흰빛. 여기서도 보였어요. 세린이 처음 렙업하던 날이랑 같은 색이었어요.', c9: '밤의 성에서 돌아오면 차 한 잔 해요. 약속해요.' }), { face: 'sad' });
  } });
  async function veraTea(c, n) {
    c.lock(true);
    await c.cinema(true);
    c.music('mother');
    await c.say(n, '거울을 가져왔군요. 표정을 보니, 뭔가를 봤어요.', { face: 'sad' });
    await c.say(n, '…이제 보여 줄 때가 됐네요. 오랫동안 찻잔 받침으로 쓴 종이. 버리지도, 읽지도 못하고.', { face: 'closed' });
    c.truth('t_note');
    for (const l of G.data.TRUTHS.t_note.long) await c.narr(l);
    await c.say(n, '「이 아이에게는 나누는 법을 가르쳐 줘요.」 …나는 가르치지 못했어요. 당신은 여기 없었으니까.', { face: 'cry' });
    await c.say(n, '그러니까 지금 가르칠게요. 늦었지만.', { face: 'smile' });
    const k = await c.choice('베라가 두 손을 모은다. 손바닥 사이에 보랏빛이 고인다.', [{ t: '가르쳐 주세요' }, { t: '나누면… 나는 어떻게 돼요?' }]);
    if (k === 1) await c.say(n, '비어요. 조금. 그런데 이상하게 가벼워요. 세린은 그걸 「닫힌다」고 했어요. 바닥 없는 그릇에 바닥이 생기는 느낌.', { face: 'closed' });
    await c.narr('베라가 네 손을 잡는다. 너의 빛 한 줌이 그녀의 손바닥으로 흘러간다. 그리고 보랏빛이 되어 돌아온다.');
    c.flash('#d8b0ff', 0.4); c.sfx('magic');
    c.flag('c5_tea'); c.flag('learned_share'); c.bond('vera', 2);
    S().skillPts = 0;
    S().sp += 1;
    await c.say(null, '나누는 법을 배웠다. (재능 점수 +1)', { style: 'sys' });
    await c.cinema(false);
    c.lock(false);
    await ST.c5End(c);
  }

  /* ───────── 비올라: 마법 과녁 대결 ───────── */
  ST.person('world', { id: 'viola', x: X0 + 9, y: Y0 + 9, dir: 'down', when: () => f('c5_vera') && !f('c5_viola_join'), mark: () => (!f('c5_viola') ? '!' : null), talk: async (c, n) => {
    c.flag('met:viola');
    if (!f('c5_viola')) {
      c.lock(true);
      await c.say(n, '당신이 세린의 아이? 흥. 별로 안 닮았네. 눈 말고는.', { face: 'angry' });
      await c.say(n, '나는 비올라. 열네 살. 라벤더 학원 최연소 수석. 세린의 기록을 거의 다 깼어. 남은 것도 올해 안에 깰 거야.', { face: 'smirk' });
      await c.say(n, '당신이 정말 흰빛이면, 과녁 세 개쯤은 나보다 빨리 맞히겠지? 활이든 마법이든. 12초.', { face: 'smirk' });
      const ok = await c.confirm('과녁 대결을 받을까?', '받는다', '다음에');
      c.lock(false);
      if (!ok) return;
      await violaDuel(c, n);
      return;
    }
    await c.say(n, '…다음엔 내가 이길 거야.', { face: 'blush' });
  } });
  async function violaDuel(c, n) {
    const Wd = G.world;
    const ts = Wd.ents.filter((e) => e.type === 'dummy' && e.targetNo != null);
    const hit = new Set();
    for (const t of ts) t.onHurt = function (d, info) { if (info.src !== 'sword' && info.src !== 'spin') { hit.add(this); G.fx.ring(this.x, this.y - 10, '#d8b0ff', 12, 0.4); G.audio.sfx('clickspot'); } this.hpShow = 0; };
    await c.say(n, '칼로 치는 건 반칙. 멀리서 맞혀. 시작!', { face: 'smirk' });
    let t = 0;
    await c.freeWhile(() => { t += 1 / 60; return hit.size >= ts.length || t > 12; });
    for (const x of ts) x.onHurt = null;
    c.lock(true);
    if (hit.size >= ts.length) { await c.say(n, t.toFixed(1) + '초…? 나는 ' + (t + 0.8).toFixed(1) + '초였는데.', { face: 'shock' }); await c.say(n, '…인정. 흰빛은 흰빛이네. 기분 나빠.', { face: 'blush' }); c.flag('viola_lost'); c.bond('viola', 1); }
    else await c.say(n, '거봐. 흰빛이라고 다 빠른 건 아니야. …그래도 활 잡는 자세는 나쁘지 않았어.', { face: 'smirk' });
    await c.say(n, '거울 연못 아래 「거꾸로 선 탑」에 갈 거지? 나도 갈 거야. 거기 세린의 스물네 번째 기록이 있대. 아무도 모르는 기록.', { face: 'normal' });
    await c.say(n, '따라가는 거 아니야. 같은 방향일 뿐이야.', { face: 'blush' });
    c.flag('c5_viola'); c.flag('c5_viola_join'); ST.join('viola');
    for (const x of ts) x.dead = true;
    c.lock(false);
    c.journal('라벤더 학원의 천재 비올라와 과녁 대결을 했다. 그녀는 「같은 방향일 뿐」이라며 따라왔다.');
  }

  /* ───────── 시빌: 거울 연못 ───────── */
  ST.person('p_sybil', { id: 'sybil', x: 5, y: 4, dir: 'down', mark: () => (f('c5_viola') && !f('c5_sybil') ? '!' : null), talk: async (c, n) => {
    c.flag('met:sybil');
    if (!f('c5_viola')) { await c.say(n, '거울이 보고 싶은가. 거울은 너를 보고 싶어 하지 않는다. 학원에 먼저 다녀오너라.', { face: 'closed' }); return; }
    if (!f('c5_sybil')) {
      c.lock(true);
      await c.say(n, '흰빛이 왔구나. 연못이 사흘 전부터 잠을 설쳤다.', { face: 'closed' });
      await c.say(n, '거울 연못은 얼굴을 비추지 않는다. 「되고 싶지 않은 너」를 비춘다. 그 아래에 탑이 거꾸로 서 있지. 가장 깊은 곳에 [y]진실의 거울[/]이 있다.', { face: 'normal' });
      await c.say(n, '들어가기 전에, 연못을 한 번 들여다보아라. 규칙이다.', { face: 'closed' });
      await c.cinema(true);
      c.music('dread');
      await c.narr('연못 수면에 네 얼굴이 비친다. 그런데 — 웃고 있다. 너는 웃지 않는데.');
      await c.narr('물속의 네가 입을 벌린다. 주위의 빛이 그 입으로 빨려 들어간다. 토리아의 빛도, 비올라의 빛도.\n물속의 네가 맛있다는 듯 눈을 감는다.');
      const k = await c.choice('연못 속 네가 너를 본다.', [
        { t: '눈을 돌린다', sub: '보지 않아도 되는 것도 있다.' },
        { t: '더 깊이 들여다본다', sub: '[r]심연[/]을 들여다본다. 알게 되는 만큼 무거워진다.' },
      ]);
      if (k === 1) {
        c.abyss('pond'); c.shake(2, 0.6); c.sfx('heartbeat');
        await c.narr('더 깊이. 물속의 너는 점점 커진다. 입이 아니라, 몸 전체가 텅 빈 구멍이 된다.\n그 구멍의 모양을 안다. 황금별 옆의 검은 점과 똑같다.');
        await c.say(n, '…보았구나. 그릇의 바닥을. 바닥이 없다는 것을.', { face: 'sad' });
      } else await c.say(n, '현명하다. 오늘은.', { face: 'closed' });
      c.music('forest');
      await c.cinema(false);
      await c.say(n, '가거라. 연못 가운데 돌계단이 열렸다.', { face: 'normal' });
      c.flag('c5_sybil'); c.lock(false);
      return;
    }
    await c.say(n, ST.lines({ c5: '거울은 거짓말을 못 한다. 그래서 사람들이 거울을 뒤집어 걸지.', c8: '은빛 왕국의 왕도 이 연못을 들여다본 적이 있다. 612년에. 그 뒤로 돌아가 광맥을 마셨지.' }), { face: 'closed' });
  } });

  /* ───────── 주민 ───────── */
  ST.folk('p_shop', { name: '마도구점 주인', folk: 'mage', x: 5, y: 3, lines: { c5: async (c) => { const k = await c.choice('마도서, 물약, 달빛 귀걸이. 무엇을?', ['물건을 산다', '괜찮아요'], { name: '마도구점 주인' }); if (k === 0) await c.shop('purple'); } } });
  ST.folk('p_inn', { name: '황혼 쉼터 주인', folk: 'oldw', x: 4, y: 3, lines: { c5: async (c) => { const k = await c.choice('여긴 늘 해 질 녘이라, 언제 자든 괜찮아요. (40골드)', ['쉰다', '괜찮아요'], { name: '황혼 쉼터 주인' }); if (k === 0) { if (S().gold >= 40) c.gold(-40); await c.rest(); } } } });
  ST.folk('world', { name: '학원생', folk: 'student', x: X0 + 14, y: Y0 + 10, wander: 14, barks: ['영창 연습 중… 불꽃이여…'], lines: { c5: ['비올라? 무서워. 쉬는 시간에도 공부해. 아니, 쉬는 시간이 없어.', '세린 선배 기록 중에 「스물네 번째」는 아무도 몰라. 비밀 기록이래.'], c6: '흰빛이 터졌대! 학원이 난리야. 비올라가 사흘 동안 방에서 안 나왔어.' } });
  ST.folk('world', { name: '학원생', folk: 'mage', x: X0 + 18, y: Y0 + 12, wander: 10, lines: { c5: ['얼음창은 물 위에 발판을 만들어. 비올라는 연못을 얼려서 걸어 다녀.', '망령은 등불이나 흰빛에 약해. 진실의 거울로 비추면 모습이 보여.'] } });
  ST.folk('world', { name: '숲지기', folk: 'farmer', x: X0 + 28, y: Y0 + 8, lines: { c5: ['해가 안 지니까 버섯이 미쳐 자라. 좋은 건지 나쁜 건지.', '밤이 없는 숲이 좋아 보여? 여긴 잠드는 법을 잊은 숲이야.'] } });

  /* ───────── 빛 씨앗 (퍼플) ───────── */
  ST.seed('p1', 'world', ...OW.P(116, 128), { under: true });
  ST.seed('p2', 'world', ...OW.P(160, 100), {});
  ST.seed('p3', 'world', ...OW.P(150, 134), { under: true });
  ST.seed('p4', 'world', POND.x + 6, POND.y + 2, {});
  OW.hooks.push((m) => { m.obj[m.i(...OW.P(116, 128))] = O.SHROOM === 0 ? O.BUSH : O.BUSH; m.obj[m.i(...OW.P(150, 134))] = O.BUSH; m.obj[m.i(...OW.P(160, 100))] = 0; });

  /* ═════════ 거꾸로 선 탑 (던전 5) ═════════ */
  G.dungeon.def('d5', {
    name: '거꾸로 선 탑', sub: '거울 연못 아래', pal: 'purple', music: 'dream', tier: 4, floor: T.TILE, dark: 0.35,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: POND.x, ty: POND.y - 2 },
    rooms: {
      '1,3': { props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 5, { text: '천장에 바닥이, 바닥에 천장이. 계단은 위로 내려간다.\n「거울은 보이지 않는 벽을 지운다」' }], ['pot', 2, 11], ['pot', 17, 11]], foes: [['ghost', 6, 7], ['ghost', 13, 7]] },
      '1,2': { props: [['torch', 3, 3], ['torch', 16, 3], ['torch', 3, 11], ['torch', 16, 11], ['chest', 9, 7, { item: 'key_small', hidden: 'd5:torch' }]], solve: { type: 'torches', flag: 'd5:torch', msg: '상자가 떠올랐다' }, foes: [['mage', 9, 5]] },
      '0,2': { props: [['veil', 18, 7, { cells: [[18, 7], [18, 8]] }], ['chest', 4, 4, { item: 'map_d', mirror: true }], ['chest', 15, 10, { item: 'bombs5' }]], foes: [['ghost', 6, 9], ['plant', 14, 4]] },
      '2,2': { props: [['crystal', 9, 7], ['cblock', 3, 5], ['cblock', 4, 5], ['cblock', 3, 9, { blue: false }], ['cblock', 4, 9, { blue: false }], ['chest', 3, 3, { item: 'compass' }], ['chest', 3, 11, { item: 'heartpiece' }]], foes: [['bug', 12, 5], ['bug', 14, 6], ['bug', 13, 9]] },
      '1,1': { props: [['chest', 9, 4, { item: 'mirror', col: '#8a5ad8' }], ['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 10, { text: '「비추면 보인다. 보이면 있다. 있으면 없앨 수 있다.」' }]], foes: [['bigslime', 6, 8], ['bigslime', 13, 8]] },
      '2,1': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'key_big', big: true, hidden: true }], ['veil', 0, 7, { cells: [[-1, 7], [0, 7], [-1, 8], [0, 8]] }]], foes: [['ghost', 5, 5], ['ghost', 14, 5], ['mage', 9, 9]] },
      '0,1': { props: [['veil', 9, 13, { cells: [[9, 13], [10, 13], [9, 14], [10, 14], [9, 15], [10, 15]] }], ['chest', 9, 5, { item: 'arrows10', mirror: true }], ['spot', 9, 8, { verb: '글씨를 읽는다', text: async (c) => { await c.narr('벽에 새긴 글씨. 둥글고 작은 — 금서고에서 본 그 글씨.\n[w]「기록 스물넷: 거울 속 나를 이기지 않고 안아 주기. — S」[/]'); if (!c.has('seen24')) { c.flag('seen24'); await c.say('viola', '…이게 스물네 번째 기록? 이기는 게 아니라 안는 거라고? 뭐야, 그게.', { face: 'shock' }); c.bond('viola', 1); } } }]], foes: [['ghost', 5, 9], ['ghost', 14, 9]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'mirror' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'open'], ['1,1', '2,1', 'wall'], ['2,2', '2,1', 'open'], ['0,2', '0,1', 'wall'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: POND.x, toy: POND.y - 2 });
      if (f('d5:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d5:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 9) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: 'd5:heart' }));
        G.world.add(out());
        c.music('dream');
        await c.narr('거울 속의 네가 무릎을 꿇는다. 이상하게, 우는 얼굴이다.');
        const k = await c.choice('거울 속의 네가 손을 뻗는다.', [{ t: '벤다', sub: '끝낸다.' }, { t: '안아 준다', sub: '「기록 스물넷」처럼.' }]);
        if (k === 1) { c.flag('hugged_mirror'); c.bond('viola', 1); await c.narr('차갑다. 그리고 곧 따뜻해진다. 거울 속의 네가 빛 조각이 되어 흩어지며, 네 가슴으로 스며든다.'); await c.say('viola', '…세린이 한 것과 똑같이 했어. 기록 스물넷. 나는… 못 했을 거야.', { face: 'cry' }); }
        else { await c.narr('거울 속의 네가 산산조각 난다. 조각마다 네가 비친다. 모두 조금씩 배고픈 얼굴이다.'); c.abyss('mirror'); }
        await c.say('viola', '여기. 얼음창 마도서. 원래 내 거야. …빌려주는 거야. 나중에 돌려받을 거야.', { face: 'blush' });
        G.st.learnSpell(S(), 'ice'); c.sfx('ice'); c.flash('#bfe8ff', 0.3);
        await c.say(null, '[b]얼음창[/]을 배웠다! 맞은 적이 얼어붙고, 물 위에 잠깐 얼음 발판을 만든다.', { style: 'sys' });
        c.journal(k === 1 ? '거꾸로 선 탑의 바닥에서 거울 속 나를 안아 주었다. 세린의 「기록 스물넷」.' : '거꾸로 선 탑의 바닥에서 거울 속 나를 베었다. 조각마다 배고픈 얼굴이 비쳤다.');
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d5:intro')) { c.flag('d5:intro'); await c.say('viola', '저거… 당신이잖아. 까만 당신.', { face: 'shock' }); await c.cutin({ who: 'viola', title: '거울 속 나', small: '거꾸로 선 탑의 바닥', sub: '셋으로 갈라지면 — 진실의 거울!', col: '#8a3aff', face: 'shock', sec: 1.8 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss2' });
      }); };
    },
  });

  /* ───────── 5장의 끝: 카이론의 방송 · 구름고래 ───────── */
  ST.c5End = async function (c) {
    c.lock(true);
    await c.cinema(true);
    c.stopMusic(0.5);
    c.sfx('rumble'); c.shake(2, 1.5);
    await c.say('toria', '찍? 탑이… 울려. 여기 없는 탑들까지. 대륙 전체가.', { face: 'shock' });
    c.music('kairon');
    await c.narr('대륙의 모든 징수탑에서 같은 목소리가 흘러나왔다. 낮고, 지쳐 있고, 한 치의 흔들림도 없는 목소리.');
    await c.say('kairon', '이리스 대륙의 모든 이에게 고한다. 나는 챔피언 카이론이다.', { face: 'closed', remote: true });
    await c.say('kairon', '흑점이 예상보다 빠르게 다가오고 있다. 천년 방위령을 개정한다. 징수율을 두 배로 올린다. 천년제가 끝나는 날까지.', { face: 'normal', remote: true });
    await c.say('kairon', '그리고 — 흰빛을 가진 자는 천년성에 출두하라. 거부하면, 계산에 넣지 않겠다.', { face: 'normal', remote: true });
    await c.say('viola', '…계산에 안 넣는다는 게 무슨 뜻이야?', { face: 'shock' });
    await c.say('toria', '찍… 없는 사람 취급한다는 거야.', { face: 'sad' });
    c.stopMusic(1);
    await c.wait(1);
    c.music('rainbow');
    c.sfx('wind');
    await c.narr('그때, 해 질 녘 하늘을 가르며 커다란 그림자가 내려왔다. 구름으로 된 고래. 등에 무지개 깃발이 꽂혀 있다.');
    await c.say('nube', '우우우웅. 천년제 초대장이오. 흰빛에게. 크로마 위원장이 보냈소.', { face: 'normal' });
    await c.say('nube', '천년제에는 대륙의 모든 색이 모이오. 챔피언도, 사천왕도. 우우웅. 타시오.', { face: 'smile' });
    const rt = ST.route();
    await c.say('viola', '나도 갈 거야. 학원 대표로 천년제 마법 공연에 나가야 해. 대표단이랑 먼저 떠날게. …거기서 보자는 말은 아니야.', { face: 'blush' });
    ST.leave('viola');
    c.flag('c5_done'); c.flag('open:rainbow');
    await c.cinema(false);
    c.lock(false);
    c.journal('카이론이 대륙의 모든 탑으로 방송했다. 흰빛을 가진 자는 천년성에 출두하라. 구름고래 누베가 천년제 초대장을 가져왔다.');
    await c.say('toria', '광장에 구름고래가 기다려. 준비되면 말 걸자.', { face: 'happy' });
    void rt;
  };
  // 누베: 퍼플 광장에서 무지개로
  ST.person('world', { id: 'nube', x: X0 + 16, y: Y0 + 3, dir: 'down', when: () => f('c5_done') && !f('ch:c6'), talk: async (c) => {
    if (!(await c.confirm('구름고래 등에 탈까? 하늘섬 무지개, 천년제로.', '탄다', '아직'))) return;
    await ST.flyToRainbow(c);
  } });
  ST.flyToRainbow = async function (c) {
    c.lock(true);
    await c.cinema(true);
    await c.fade(true, { sec: 0.8 });
    c.music('rainbow');
    await c.narr('구름고래의 등은 폭신하고 차가웠다. 발밑으로 퍼플의 숲이, 레드의 화산이, 블루의 바다가 작아졌다.');
    await c.say('toria', '찍… 나 날고 있어. 고래 등 위지만. 이것도 나는 거지? 그렇지?', { face: 'cry' });
    await c.narr('토리아가 날개를 폈다. 바람이 날개 밑으로 들어왔다. 그러나 토리아는 떠오르지 않았다.\n뭔가 무거운 것이 토리아를 붙잡고 있었다. 가슴 어딘가에.');
    const R = OW.towns.rainbow;
    G.game.goto('world', px(R.x + 17), py(R.y + R.h - 2), 'up');
    await c.fade(false, { sec: 0.8 });
    await c.cinema(false);
    c.lock(false);
  };
})();
