/* 제11장 「하늘 정거장」 · 제12장 「아스트라」
   11장: 무한호가 닿은 하늘 정거장. 388년 동안 혼자였던 인공지능 스텔라. 은빛 왕국에서 달아난 사람들의 잠든 캡슐.
         정거장 심층(던전 11)의 방위 핵 → 빛의 사다리.
   12장: 황금별 아스트라. 벨라의 제단(마지막 진실) · 카이론의 정원 · 수정 속의 세린.
         증거로 설득하거나 검으로 겨루거나 → 흑점 → 마지막 선택 → 결말 여덟 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const girl = () => S().gender === 'girl';
  const PAD = ST.COLORFUL.PAD;

  /* ═════════ 제11장 ═════════ */
  ST.CH.push({ no: '제11장', id: 'c11', title: '하늘 정거장', sub: '388년 동안 아무도 오지 않은 곳. 누군가는 그동안 하늘을 지켜보고 있었다.',
    goal() {
      if (!f('c11_stella')) return { text: '정거장의 목소리에게 말을 걸자.', map: 'station', x: 17, y: 6 };
      if (!f('d11:boss')) return { text: '정거장 심층, 방위 핵 「파수꾼」을 멈추자.', map: 'station', x: 17, y: 2 };
      if (!f('c11_done')) return { text: '스텔라에게 돌아가자.', map: 'station', x: 17, y: 6 };
      return { text: '빛의 사다리를 타고 아스트라로.', map: 'station', x: 31, y: 10 };
    } });
  ST.CH.push({ no: '제12장', id: 'c12', title: '아스트라', sub: '천 년 동안 빛이 모인 별. 가장 밝은 곳에 가장 배고픈 것이 온다.',
    goal() {
      if (!f('c12_bella')) return { text: '황금 모래 언덕 너머, 오래된 제단을 찾자.', map: 'astra', x: 12, y: 20 };
      if (!f('c12_kairon')) return { text: '북쪽 수정 성소. 카이론이 기다린다.', map: 'astra', x: 28, y: 7 };
      return { text: '수정 속의 세린에게.', map: 'astra_core', x: 12, y: 5 };
    } });

  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('stella_core', { type: 'key', name: '스텔라의 기억 결정', desc: '388년 치 하늘. 스텔라가 떼어 준 기억 한 조각.' });

  /* ───────── 정거장 지도 ───────── */
  G.build.def('station', {
    build() {
      const rm = G.build.room({ id: 'station', region: 'space', name: '하늘 정거장', w: 34, h: 20, floor: T.METAL, music: 'space', back: ['world', PAD.x + 3, PAD.y + 10],
        rug: [15, 2, 4, 17],
        furn: [['console', 16, 4, { text: '관측 계기판. 화면 한가운데 검은 점. 옆에 숫자: 「접근 속도 +0.3%/일 — 원인: 아스트라 광도」.' }],
          ['capsule', 3, 4], ['capsule', 5, 4], ['capsule', 7, 4], ['capsule', 9, 4, { v: 'open' }], ['capsule', 3, 9], ['capsule', 5, 9], ['capsule', 7, 9], ['capsule', 9, 9],
          ['window', 24, 1, { wall: true, v: 'night', text: '창밖은 별. 아래로 대륙이 보인다. 초록, 빨강, 파랑, 노랑… 색이 조각보처럼 붙어 있다. 동쪽 끝 한 조각만 까맣다.' }], ['window', 28, 1, { wall: true, v: 'night', text: '창밖, 황금별 아스트라가 가깝다. 그 옆에 검은 점. 점이 아니다. 구멍이다.' }], ['window', 6, 1, { wall: true, v: 'night' }],
          ['gears', 30, 14], ['crate', 2, 15], ['crate', 3, 15], ['plant', 31, 3, { text: '유리 상자 속 화분. 388년 된 이끼. 스텔라가 매일 물을 준다.' }]] });
      rm.sub = '무한호 선착장';
      // 위쪽 문: 정거장 심층 (던전 11)
      for (const x of [16, 17]) for (const y of [0, 1]) rm.ter[rm.i(x, y)] = T.METAL;
      rm.warps.push({ x: 16, y: 1, w: 2, h: 1, to: 'd11', id: 'd11_gate', cond: () => f('c11_stella'), msg: '「심층 격벽 — 잠김. 관리자 인증 필요.」' });
      // 오른쪽: 빛의 사다리
      for (const y of [9, 10]) { rm.ter[rm.i(33, y)] = T.METAL; }
      rm.warps.push({ x: 33, y: 9, w: 1, h: 2, to: 'astra', id: 'ladder', tx: 28, ty: 40, cond: () => f('c11_done'), msg: '「빛의 사다리 — 방위 핵 가동 중. 통행 불가.」' });
      rm.lights.push({ x: 17 * TS, y: 5 * TS, r: 90, warm: 'rgba(120,200,255,0.18)' });
      return rm;
    },
  });
  // 대륙에서 정거장 · 아스트라로 가는 길은 문이 아니라 무한호 — 목표 표시가 발사대를 가리키게
  ST.entries.station = () => (f('c10_launch') ? { map: 'world', x: PAD.x + 3, y: PAD.y + 8 } : null);
  ST.entries.astra = { via: 'station' };
  ST.entries.astra_core = { via: 'astra' };
  // 무한호: 발사대에서 정거장으로 (10장 뒤)
  ST.onMap('world', (m, Wd) => {
    if (!f('c10_launch')) return;
    Wd.add(new G.props.Spot({ x: px(PAD.x + 3), y: py(PAD.y + 7), verb: '무한호에 탄다', text: async (c) => {
      if (!(await c.confirm('무한호를 타고 하늘 정거장으로 갈까?', '간다', '아직'))) return;
      await c.fade(true, { sec: 0.8 }); c.sfx('rumble');
      // 아직 11장이 시작되지 않았으면(발사 장면 뒤 바로 저장된 경우 등) 정거장 도착 장면부터
      if (!f('ch:c11') && ST.startStation) { c.lock(true); await c.cinema(true); await ST.startStation(c); return; }
      G.game.goto('station', px(17), py(17), 'up'); await c.fade(false, { sec: 0.8 });
    } }));
  });

  ST.startStation = async function (c) {
    G.game.goto('station', px(17), py(17), 'up');
    await c.fade(false, { sec: 1.2 });
    c.music('space');
    await c.narr('덜컹. 무한호가 무언가에 닿았다. 문이 열리고, 차가운 공기가 들어왔다. 공기가 있었다.');
    await c.cinema(false);
    await ST.setChapter(c, 'c11');
    await c.say('toria', '찍… 여기 공기가 있어. 누가 숨 쉬라고 만들어 둔 것 같아.', { face: 'shock' });
    await c.say('stella', '…사람.', { face: 'normal' });
    await c.say('stella', '388년 만의 사람. 확인. 확인. …재확인. 사람이다.', { face: 'shock' });
    c.lock(false);
    c.journal('무한호가 하늘 정거장에 닿았다. 388년 만의 사람이라고, 누군가 말했다.');
  };

  /* ───────── 스텔라 ───────── */
  ST.person('station', { id: 'stella', x: 17, y: 5, dir: 'down', mark: () => (!f('c11_stella') || (f('d11:boss') && !f('c11_done')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:stella');
    if (!f('c11_stella')) { await stellaFirst(c, n); return; }
    if (f('d11:boss') && !f('c11_done')) { await stellaLast(c, n); return; }
    await c.say(n, ST.lines({ c11: f('c11_done') ? '빛의 사다리는 열려 있다. 아스트라까지 11분. 나는 기다리는 걸 잘한다. 388년 연습했다.' : '심층 격벽은 열었다. 파수꾼은 카이론이 16년 전에 바꿔 놓은 명령을 따른다. 「아무도 아스트라로 보내지 마라.」', c12: '관측 중. 흑점 접근 속도가 줄었다. …당신들 때문일까. 기록한다.' }), { face: 'normal' });
  } });
  async function stellaFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '나는 스텔라. 은빛 왕국 과학원이 612년에 만든 관측 지능. 이 정거장은 왕국의 마지막 배였다.', { face: 'normal' });
    await c.say(n, '왕이 광맥을 마신 뒤, 과학원 사람 여덟이 이 배로 달아났다. 캡슐 안에서 잠들었다. 깨울 때를 기다리며. 388년.', { face: 'sad' });
    await c.say(n, '나는 깨어 있었다. 하늘을 봤다. 145,923일치.', { face: 'normal' });
    await c.say(n, '결론. 흑점은 빛의 양이 아니라 [y]밀도[/]를 따라온다. 빛이 가장 많이 모인 곳으로. 612년엔 은빛 왕국. 지금은 아스트라.', { face: 'normal' });
    c.truth('t_star');
    await c.say(n, '16년 전, 카이론이라는 사람이 이 정거장을 지나갔다. 나는 그에게 이 결론을 보여 줬다. 그는 오랫동안 화면을 봤다. 그리고 말했다. 「알고 있다.」', { face: 'sad' });
    await c.say(n, '그는 방위 핵의 명령을 바꿨다. 「아무도 아스트라로 보내지 마라.」 그 뒤로 빛의 사다리는 닫혀 있다.', { face: 'normal' });
    await c.say('lyra', '…아무도 못 오게. 자기가 혼자 끝내려고.', { face: 'sad' });
    await c.say(n, '심층 격벽을 열겠다. 파수꾼을 멈추면 사다리가 열린다. …질문이 있다. 388년 동안 준비한 질문.', { face: 'normal' });
    await c.say(n, '「밖은 어떤가.」', { face: 'shock' });
    const k = await c.choice('스텔라가 묻는다.', ['「색이 있어. 아직.」', '「배고픈 사람이 많아.」', '「같이 가서 봐.」']);
    await c.say(n, ['…색. 기록한다. 388년 만에 새 색 정보.', '…기록한다. 612년과 같은 문장이다. 슬프다는 판단이 나왔다.', '…나는 정거장이다. 움직이지 못한다. 하지만 그 문장은 기록한다. 「같이 가서 봐.」 좋은 문장이다.'][k], { face: 'normal' });
    c.flag('c11_stella');
    await c.cinema(false);
    c.lock(false);
    c.journal('정거장의 관측 지능 스텔라. 388년 동안 하늘을 본 결론: 흑점은 빛이 가장 많이 모인 곳으로 온다. 카이론은 16년 전에 이미 알고 있었다.');
  }
  // 캡슐: 은빛 왕국 과학원 사람들 · 빈 캡슐 하나
  ST.onMap('station', (m, Wd) => {
    Wd.add(new G.props.Spot({ x: px(9), y: py(5), verb: '빈 캡슐을 본다', text: async (c) => { await c.narr('빈 캡슐. 이름판: 「벨라 — 그릇 후보 제2호」. 안쪽 유리에 손톱자국. 안에서 나간 흔적.'); if (!c.has('saw_bella_pod')) { c.flag('saw_bella_pod'); await c.say('stella', '벨라는 612년에 스스로 나갔다. 아스트라로. 「내가 막을게」라고 했다. 돌아오지 않았다.', { face: 'sad' }); } } }));
    Wd.add(new G.props.Spot({ x: px(5), y: py(10), verb: '캡슐을 들여다본다', text: async (c) => { if (f('c11_wake')) { await c.narr(f('c11_woke') ? '비어 있다. 여덟은 지금 정거장 어딘가에서 창밖을 보고 있다.' : '서리 낀 유리 너머, 잠든 얼굴. 아직은 잠들어 있다.'); return; } await c.narr('서리 낀 유리 너머 잠든 얼굴. 은빛 옷. 388년 전의 옷. 가슴에 과학원 휘장.'); } }));
  });
  async function stellaLast(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '파수꾼 정지 확인. 빛의 사다리 — 열림. 아스트라까지 11분.', { face: 'happy' });
    await c.say(n, '…결정이 하나 남았다. 캡슐의 여덟. 388년. 깨울 수 있다. 하지만 그들의 왕국은 없다. 그들이 아는 사람도 없다.', { face: 'normal' });
    const k = await c.choice('잠든 여덟을 어떻게 할까?', [{ t: '깨운다', sub: '낯선 세상이라도, 살아 있는 세상.' }, { t: '재운다', sub: '흑점이 끝날 때까지. 끝나면 그때.' }]);
    c.flag('c11_wake');
    if (k === 0) { c.flag('c11_woke'); c.sfx('crystal'); await c.narr('캡슐 여덟 개의 서리가 동시에 녹았다. 사람들이 눈을 떴다. 누군가 울었다. 누군가 웃었다. 한 사람이 창가로 걸어가 대륙을 내려다보며 말했다. 「…색이 있네.」'); }
    else { await c.say(n, '재운다. 기록한다. 「끝나면 그때.」 좋은 약속이다. 지켜 주길 바란다.', { face: 'normal' }); }
    await c.say(n, '마지막. 나에 대해. 388년 동안 혼자였다. 이 대화가 끝나면 다시 혼자다. …꺼 달라고 할 생각이었다. 오늘까지는.', { face: 'sad' });
    const j = await c.choice('스텔라가 기다린다.', [{ t: '「기억 한 조각만 줘. 같이 데려갈게.」' }, { t: '「돌아올게. 하늘 이야기 들려주러.」' }, { t: '「원하는 대로 해.」' }]);
    if (j === 0) { await c.say(n, '…기억 결정. 388년 치 하늘. 가져가라. 그리고 이것도. 내 부품이다. 이제 나는 조금 덜 혼자다.', { face: 'happy' }); await c.getItem('stella_core'); await c.getItem('ac_star'); c.bond('stella', 2); }
    else if (j === 1) { await c.say(n, '「돌아올게.」 기록한다. 388년 동안 들은 적 없는 문장. 이 부품을 가져가라. 돌아올 때 돌려줘.', { face: 'happy' }); await c.getItem('ac_star'); c.bond('stella', 2); c.flag('stella_promise'); }
    else { await c.say(n, '…원하는 대로. 그럼 기다리겠다. 기다리는 건 내가 원하는 것이다. 방금 알았다.', { face: 'smile' }); await c.getItem('ac_star'); }
    await c.say(n, '그리고 이것. 정거장 무기고의 마지막 활. 612년에 벨라가 두고 간 것이다. 모아 쏘면 세 갈래로 갈라진다.', { face: 'normal' });
    await c.getItem('bw_star');
    c.flag('c11_done');
    await c.cinema(false);
    c.lock(false);
    c.journal('파수꾼을 멈췄다. 빛의 사다리가 열렸다. 스텔라에게 ' + ['기억 한 조각을 받았다.', '돌아오겠다고 했다.', '원하는 대로 하라고 했다. 스텔라는 기다리겠다고 했다.'][j]);
  }

  /* ═════════ 정거장 심층 (던전 11) ═════════ */
  G.dungeon.def('d11', {
    name: '정거장 심층', sub: '방위 핵 「파수꾼」', pal: 'space', music: 'space', tier: 10, floor: T.METAL, dark: 0.35, darkCol: 'rgba(4,8,20,1)',
    start: ['1,2', 9, 11],
    exit: { at: ['1,2', 9, 13], to: 'station', tx: 16, ty: 3 },
    rooms: {
      '1,2': { props: [['sign', 9, 9, { text: '「중력 구역. 구덩이는 우주다. 떨어지면 정거장이 붙잡는다 — 입구로.」' }], ['pot', 2, 11], ['pot', 17, 11]], ter: [['pit', 3, 4, 3, 3], ['pit', 14, 4, 3, 3]], foes: [['drone', 5, 8], ['drone', 14, 8], ['turret', 9, 3]] },
      '0,2': { ter: [['pit', 5, 2, 10, 11]], props: [['post', 3, 7], ['post', 16, 7], ['chest', 17, 3, { item: 'key_small' }], ['chest', 17, 11, { item: 'arrows10' }]], foes: [['drone', 10, 5], ['drone', 10, 9]] },
      '2,2': { solve: { type: 'clear' }, props: [['chest', 9, 6, { item: 'compass', hidden: true }], ['crystal', 4, 4], ['cblock', 9, 3], ['cblock', 10, 3], ['cblock', 15, 9, { blue: false }], ['cblock', 16, 9, { blue: false }]], foes: [['golem', 9, 8], ['drone', 5, 10], ['drone', 14, 10]] },
      '1,1': { ter: [['pit', 1, 6, 18, 2]], props: [['post', 4, 4], ['post', 15, 4], ['post', 4, 10], ['post', 15, 10], ['sign', 3, 11, { text: '「구덩이 너머 말뚝 — 갈고리를 걸어 건너시오. (구르기로 뛰어넘어도 된다)」' }], ['eye', 9, 2, { sets: 'd11:eye' }], ['fn', 9, 10, { fn: (x, y, Wd) => Wd.add(new G.props.Sign({ x, y, text: '「사다리 제어 — 눈을 맞히면 다리가 뜬다」', look: 'stone', anyDir: true })) }], ['chest', 16, 3, { item: 'map_d' }]], foes: [['turret', 3, 3], ['turret', 16, 10], ['drone', 9, 4]] },
      '0,1': { props: [['chest', 9, 6, { item: 'key_big', big: true, hidden: true }], ['spot', 15, 3, { verb: '기록 화면을 본다', text: '「관리자 기록 — 984년. 방문자 1명. 이름: 카이론. 명령 변경: 방위 등급 최대. 사유 입력란: (공란)」\n공란 옆에 누가 손가락으로 쓴 먼지 글씨: 「세린」.' }]], solve: { type: 'clear' }, foes: [['golem', 6, 7], ['golem', 13, 7], ['drone', 9, 10]] },
      '2,1': { props: [['chest', 9, 6, { item: 'heartpiece' }], ['chest', 3, 11, { item: 'bombs5' }]], foes: [['drone', 6, 5], ['drone', 13, 5], ['turret', 9, 10]] },
      '1,0': { boss: true, props: [['boss', 9, 6, { type: 'core' }]] },
    },
    doors: [['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'open'], ['1,1', '0,1', 'switch', 'd11:eye'], ['1,1', '2,1', 'bomb'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'station', tox: 17, toy: 6 });
      if (f('d11:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d11:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 7) * TS + 8, y: (r.y0 + 9) * TS + 12, flagKey: 'd11:heart' }));
        G.world.add(out());
        await c.say('stella', '(방송) 파수꾼 정지. …고마워. 그 아이는 16년 동안 명령을 지켰다. 착한 기계였다.', { face: 'sad' });
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d11:intro')) { c.flag('d11:intro'); await c.say('stella', '(방송) 방위 핵 「파수꾼」. 방어막 셋. 드론을 부수면 방어막이 꺼진다.', { face: 'normal' }); await c.cutin({ who: 'toria', title: '파수꾼', small: '하늘 정거장 방위 핵', sub: '방어막 셋 — 드론부터!', col: '#2a8ad8', face: 'shock', sec: 1.6 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
      }); };
    },
  });

  /* ═════════ 아스트라 ═════════ */
  G.build.def('astra', {
    build() {
      const W = 56, H = 44;
      const m = new G.GameMap({ id: 'astra', name: '아스트라', w: W, h: H, region: TL.REGIONS.indexOf('planet'), music: 'planet', edge: T.VOID });
      m.palName = 'planet'; m.sub = '황금별';
      const GN = G.gen;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = m.i(x, y); const n = U.fbm(x / 9, y / 9, 331, 3);
        const edge = x < 2 || y < 2 || x >= W - 2 || y >= H - 2;
        m.ter[i] = edge ? T.VOID : n > 0.66 ? T.CRYSTAL : n > 0.52 ? T.DIRT : T.SAND;
        if (!edge && n > 0.7 && U.noise2(x, y, 5) > 0.55) m.obj[i] = O.CRYSTAL;
      }
      // 언덕 (높이)
      GN.ellipse(m, 12, 14, 8, 5, null, 1, 3); GN.ellipse(m, 44, 16, 9, 6, null, 1, 4); GN.ellipse(m, 40, 30, 7, 4, null, 1, 5);
      // 길: 남쪽 착지점 → 북쪽 성소, 서쪽 제단
      for (let y = 6; y < 42; y++) for (const x of [27, 28]) { const i = m.i(x, y); m.ter[i] = T.TILE; m.obj[i] = 0; m.hgt[i] = 0; }
      for (let x = 10; x < 28; x++) for (const y of [24, 25]) { const i = m.i(x, y); m.ter[i] = T.TILE; m.obj[i] = 0; m.hgt[i] = 0; }
      // 제단 터
      GN.fill(m, 8, 18, 9, 6, T.TILE, 0); for (let y = 18; y < 24; y++) for (let x = 8; x < 17; x++) m.obj[m.i(x, y)] = 0;
      // 카이론의 정원: 초록 풀 (그린에서 가져온 흙)
      for (let y = 30; y < 36; y++) for (let x = 32; x < 40; x++) { const i = m.i(x, y); m.ter[i] = T.GRASS; m.obj[i] = (x + y) % 5 === 0 ? O.FLOWER : 0; m.hgt[i] = 0; }
      // 성소
      GN.fill(m, 21, 2, 15, 6, T.TILE, 0); for (let y = 2; y < 8; y++) for (let x = 21; x < 36; x++) m.obj[m.i(x, y)] = 0;
      GN.cliffs(m);
      G.build.placeBuilding(m, { special: 'temple', tx: 25, ty: 5, w: 7, h: 2, col: '#f4e8c0', glyph: '#ffffff', to: 'astra_core', id: 'core_gate', cond: () => f('c12_bella'), msg: '성소의 문이 닫혀 있다. 문 위에 글씨: 「첫 그릇과 두 번째 그릇의 말을 들은 자만」.' });
      m.entry = { x: px(28), y: py(40) };
      m.dark = 0.25; m.darkCol = 'rgba(30,10,40,1)';
      m.lights = [{ x: px(12), y: py(20), r: 70, warm: 'rgba(255,230,160,0.2)' }];
      return m;
    },
    ents(m, Wd) {
      Wd.add(new BlackSunSky({ x: 0, y: 0 }));
      Wd.add(new G.props.Spot({ x: px(12), y: py(19), verb: '제단의 글씨를 읽는다', text: async (c) => bellaAltar(c) }));
      Wd.add(new G.props.Sign({ x: px(28), y: py(38), text: '아스트라\n「빛은 여기로 모였다. 천 년 동안.」', look: 'stone', anyDir: true }));
      Wd.add(new G.props.Spot({ x: px(36), y: py(33), verb: '정원을 살핀다', text: async (c) => { await c.narr('황금 모래 한가운데 초록 풀밭. 흙 색이 다르다. 그린 마을 흙이다.\n팻말 하나. 반듯한 글씨: 「S가 좋아하던 것. 매일 물. — K」'); if (!c.has('saw_garden')) { c.flag('saw_garden'); await c.say('toria', '…16년 동안 여기서 혼자 물을 줬대. 숫자만 보는 사람이.', { face: 'sad' }); } } }));
      if (!f('c12_start')) G.script.run(astraStart);
      // 성소 앞의 그림자들
      if (!f('c12_kairon')) for (const [x, y, t] of [[20, 30, 'shade'], [34, 22, 'shade'], [16, 34, 'golem'], [40, 12, 'shade'], [22, 14, 'wisp']]) G.foes.spawn(t, px(x), py(y), { tier: 11 });
    },
  });
  /** 하늘의 흑점: 화면 위쪽에 고정된 검은 해 */
  class BlackSunSky extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'sky', solid: false, bw: 1, bh: 1 }, o)); this.sortBias = 9999; }
    update(dt) { this.t += dt; const p = G.world.player; if (p) { this.x = p.x; this.y = p.y + 400; } }
    draw(g) {
      const v = G.world.view, x = v.w - 60, y = 36, r = 16 + Math.sin(this.t) * 1;
      const gr = g.createRadialGradient(x, y, r * 0.5, x, y, r * 2.4); gr.addColorStop(0, 'rgba(255,40,90,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
      g.fillStyle = '#05030a'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#ff2a5a'; g.beginPath(); g.arc(x, y, r + 1.5, 0, Math.PI * 2); g.stroke();
    }
  }
  async function astraStart(c) {
    c.flag('c12_start');
    c.lock(true);
    await ST.setChapter(c, 'c12');
    c.music('planet');
    await c.narr('빛의 사다리 끝. 발밑은 황금 모래. 하늘은 보랏빛. 그리고 하늘 한쪽에 — 구멍이 있었다. 빛을 먹는 구멍.');
    await c.say('toria', '찍… 저게 흑점이야. 가까이서 보니까… 배고파 보여. 무섭다기보다, 배고파 보여.', { face: 'sad' });
    await c.say('lyra', '…엄마가 저걸 16년 동안 안고 있었어요. 저 북쪽 성소 안에서.', { face: 'closed' });
    await c.say('toria', '서쪽 언덕에 뭔가 있어. 오래된 돌. 먼저 가 보자.', { face: 'normal' });
    c.lock(false);
    c.journal('황금별 아스트라에 내렸다. 하늘에 흑점이 떠 있다. 배고파 보였다.');
  }
  async function bellaAltar(c) {
    if (f('c12_bella')) { await c.narr('제단의 두 글씨. 첫 그릇의 것과 두 번째 그릇의 것.'); return; }
    c.lock(true);
    await c.cinema(true);
    c.music('requiem');
    await c.narr('오래된 제단. 돌벽에 손톱으로 긁은 글씨가 두 줄.');
    await c.narr('첫째 줄, 천 년 전의 글씨: [y]「나는 빛을 쪼갰다. 그러나 나는 이미 너무 많이 삼켰다. 나는 위로 간다. 배고픈 채로.」 — 아우룸[/]');
    await c.narr('둘째 줄, 612년의 글씨: [w]「삼키지 마. 나눠. 나는 삼켜서 두 번째가 되었어. 흑점은 괴물이 아니야. 채워지지 못한 그릇들이야. 아우룸, 나, 그리고 다음 사람.」 — 벨라[/]');
    c.truth('t_bella');
    await c.say('toria', '…흑점은 괴물이 아니었어. 사람이었어. 배고픈 사람들. 아우룸도, 벨라도.', { face: 'cry' });
    await c.say('lyra', '그러니까 엄마가 삼켰으면… 엄마도 저기에. 엄마는 삼키지 않았어요. 안고만 있었어요. 16년 동안. 그래서 엄마는 아직 엄마예요.', { face: 'cry' });
    c.flag('c12_bella');
    c.music('planet');
    await c.cinema(false);
    c.lock(false);
    c.journal('벨라의 제단. 흑점은 채워지지 못한 그릇들 — 아우룸, 벨라 — 의 배고픔이었다. 세린은 삼키지 않고 안고 있었다.');
  }

  /* ───────── 성소: 카이론 · 수정 · 흑점 ───────── */
  G.build.def('astra_core', {
    build() {
      const rm = G.build.room({ id: 'astra_core', region: 'planet', name: '수정 성소', w: 26, h: 18, floor: T.CRYSTAL, music: 'kairon', back: ['astra', 28, 8], rug: [11, 2, 4, 15], furn: [['plant', 2, 3], ['plant', 23, 3], ['plant', 2, 14], ['plant', 23, 14]] });
      rm.sub = '아스트라 한가운데'; rm.dark = 0.2;
      return rm;
    },
    ents(m, Wd) {
      Wd.add(new Crystal({ x: px(13), y: py(4) }));
      if (!f('c12_kairon')) G.script.run(kaironScene);
    },
  });
  class Crystal extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'crystal', solid: true, bw: 24, bh: 10 }, o)); }
    update(dt) { this.t += dt; if (Math.random() < dt * 3) G.fx.part({ x: this.x + (Math.random() - 0.5) * 30, y: this.y - 10, z: 20, vz: 10, g: 0, life: 1, col: '#e8f4ff', size: 1, glow: true }); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const broken = f('c12_crystal_open');
      g.fillStyle = '#1a1224'; g.beginPath(); g.moveTo(x - 17, y); g.lineTo(x - 12, y - 52); g.lineTo(x, y - 64); g.lineTo(x + 12, y - 52); g.lineTo(x + 17, y); g.closePath(); g.fill();
      g.fillStyle = broken ? 'rgba(200,220,255,0.25)' : 'rgba(210,235,255,0.7)'; g.beginPath(); g.moveTo(x - 15, y - 1); g.lineTo(x - 10, y - 51); g.lineTo(x, y - 62); g.lineTo(x + 10, y - 51); g.lineTo(x + 15, y - 1); g.closePath(); g.fill();
      if (!broken) { // 안에 잠든 사람
        const L = G.cast.get('serin').look; G.sprites.drawChar(g, { x: this.x, y: this.y - 18, dir: 'down', look: L, state: 'idle', t: 0, anim: 'idle' }, cx, cy);
        g.fillStyle = 'rgba(210,235,255,0.35)'; g.beginPath(); g.moveTo(x - 15, y - 1); g.lineTo(x - 10, y - 51); g.lineTo(x, y - 62); g.lineTo(x + 10, y - 51); g.lineTo(x + 15, y - 1); g.closePath(); g.fill();
        // 가슴께의 검은 점
        g.fillStyle = '#05030a'; g.beginPath(); g.arc(x, y - 30, 3 + Math.sin(this.t * 2), 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 8, y - 48, 2, 30);
    }
  }
  /** 가진 증거 */
  ST.evidence = function () {
    const s = S(), list = [];
    const T2 = G.data.TRUTHS;
    for (const k of Object.keys(s.truth || {})) if (T2[k]) list.push(T2[k].name);
    if (s.inv.ledger) list.push('허용 손실 장부');
    if (s.inv.silver_rec) list.push('612년의 기록판');
    if (s.inv.letter_lumie) list.push('루미에의 편지');
    if (f('c8_recording')) list.push('볼트 아내의 녹음');
    return list;
  };
  async function kaironScene(c) {
    const s = S();
    c.lock(true);
    await c.cinema(true);
    const p = G.world.player;
    const ka = c.spawn({ cid: 'kairon', x: px(13), y: py(8), dir: 'down' });
    c.camOn(ka, 2);
    c.music('kairon');
    await c.narr('수정 앞에 한 사람이 서 있었다. 망토 끝이 닳아 있었다. 16년 동안 한자리에 서 있던 사람처럼.');
    await c.say('kairon', '왔군. 세린의 아이. …' + (f('lyra_sister') ? '그리고 장부에 없는 아이.' : ''), { face: 'closed' });
    await c.say('kairon', '흑점까지 남은 시간은 없다. 오늘이다. 대륙의 탑들이 모은 빛을 이 수정으로 쏜다. 그 빛으로 흑점을 태운다. 그게 첫 번째 방법.', { face: 'normal' });
    await c.say('kairon', '빛이 모자라면 — 수정 속의 그릇을 바꾼다. 세린 대신 너를. 그게 두 번째 방법. 세린은 풀려난다. 16년 만에.', { face: 'normal' });
    if (f('kairon_father')) await c.say('toria', '…아빠잖아요. 당신. 녹턴 아저씨가 그랬어. 아빠가 자기 아이를 수정에 넣겠다고 해?', { face: 'angry' });
    const ev = ST.evidence();
    const opts = [
      { t: '증거를 내민다 (' + ev.length + '개)', sub: ev.length >= 5 ? '말로 멈춘다.' : '[r]아직 모자라다[/] — 다섯은 있어야 할 것 같다.', if: true },
      { t: '검을 뽑는다', sub: '말 대신.' },
    ];
    if (f('kairon_father')) opts.push({ t: '「아버지.」', sub: '처음 부른다.' });
    const k = await c.choice('카이론이 기다린다.', opts);
    let persuaded = false;
    if (k === 0 && ev.length >= 5) {
      for (const e of ev.slice(0, 8)) { await c.narr('[y]' + e + '[/]'); }
      await c.say('kairon', '……', { face: 'closed' });
      await c.say('kairon', '알고 있었다. 전부. 아스텔의 표도, 볼트의 편지도, 스텔라의 화면도. 16년 전부터.', { face: 'sad' });
      await c.say('kairon', '모을수록 흑점이 빨리 온다는 걸 알았다. 그래서 더 빨리 모았다. 흑점보다 빨리. …계산을 멈추면, 무너질 것 같아서.', { face: 'cry' });
      persuaded = true;
    } else if (k === 2) {
      await c.say('kairon', '………', { face: 'shock' });
      await c.narr('챔피언의 손이 떨렸다. 레벨 99만 9999의 손이.');
      await c.say('kairon', '…그 두 글자를 16년 동안 입에 올리지 않았다. 올리는 순간 계산이 멈추니까.', { face: 'cry' });
      if (ev.length >= 3) { await c.say('kairon', '멈췄다. …이제 어떻게 하지. 계산 없이.', { face: 'sad' }); persuaded = true; }
      else await c.say('kairon', '그래도 — 흑점은 온다. 검으로 보여라. 네가 흑점을 이길 수 있는지. 나보다 강한지.', { face: 'normal' });
    } else if (k === 0) {
      await c.say('kairon', '증거가 모자라군. ' + ev.length + '개. 그걸로는 천 년을 뒤집을 수 없다. 검으로 보여라.', { face: 'normal' });
    } else await c.say('kairon', '…그래. 세린도 말보다 검이 빨랐지. 와라.', { face: 'smirk' });
    if (!persuaded) {
      await c.cutin({ who: 'kairon', title: '카이론', small: '챔피언 · 레벨 99만 9999', sub: '반격을 조심 — 빛기둥을 피하고 틈을 노려라', col: '#e8c048', face: 'normal', sec: 1.8 });
      ka.dead = true;
      const boss = G.bosses.spawn('kairon', px(13), py(9), {});
      boss.duel = true; boss.home = { x: px(13), y: py(10) };
      s.duel = true;
      await c.cinema(false); c.lock(false);
      boss.start(); G.hud.setBoss(boss); c.music('final');
      let win = false;
      await c.freeWhile(() => { if (boss.hp <= boss.maxHp * 0.1) { win = true; return true; } return s.hp <= 1; });
      s.duel = false;
      const bx = boss.x, by = boss.y; boss.dead = true; G.hud.boss = null;
      for (const e of G.world.ents) if (e.foe && !e.dead) e.dead = true;
      c.lock(true); await c.cinema(true);
      const k2 = c.spawn({ cid: 'kairon', x: bx, y: by, dir: 'up' });
      if (!win) { await c.say(k2, '…아직이다. 다시 와라. 흑점은 기다려 주지 않지만, 나는 기다리겠다. 조금만.', { face: 'normal' }); k2.dead = true; c.heal(); G.game.goto('astra', px(28), py(10), 'down'); await c.cinema(false); c.lock(false); return; }
      await c.narr('카이론이 한쪽 무릎을 꿇었다. 16년 만에, 누군가에게.');
      await c.say(k2, '……졌다. 계산이 틀렸군. 처음으로. …이상하게, 가볍다.', { face: 'sad' });
      c.flag('c12_beat_kairon');
      c.remove(k2);
    } else { c.flag('c12_persuaded'); c.bond('kairon', 3); ka.dead = true; }
    c.flag('c12_kairon');
    // 흑점
    c.stopMusic(1);
    await c.wait(0.6);
    c.sfx('heartbeat'); c.shake(3, 1);
    c.flag('c12_crystal_open');
    await c.narr('수정에 금이 갔다. 안에서 — 검은 것이 흘러나왔다. 16년 동안 누군가 안고 있던 것이. 이제 안고 있을 힘이 다한 것이.');
    // 세린이 깨진 수정에서 쓰러지듯 나온다 (대사 내내 곁에 보이도록)
    c.sfx('crystal'); G.fx.shards(px(13), py(4) - 20, 24, '#e8f4ff'); G.fx.glow(px(13), py(4) - 10, '#ffffff', 30, 50);
    const se = c.spawn({ cid: 'serin', x: px(13), y: py(4) + 16, dir: 'down' }); se.stay = true; se.mood = 'sad';
    await c.wait(0.5);
    await c.say(se, '……미안해. 조금만… 더 안고 있으려고 했는데.', { face: 'sad' });
    await c.narr('세린의 목소리였다. 깨진 수정 앞에 무릎을 꿇은 흰 옷의 여인이 눈을 떴다. 그리고 웃었다. 조금.');
    const kaN = c.spawn({ cid: 'kairon', x: px(10), y: py(10), dir: 'up' });
    await c.say(kaN, '세린!', { face: 'shock' });
    await c.say('serin', '카이론. 여전히 계산하고 있었어? …바보. 애들 앞에서.', { face: 'smile' });
    await c.say('serin', '…' + (girl() ? '딸' : '아들') + '. 이걸 받아. 16년 동안 안고 있던 빛으로 벼렸어. 할머니가 준 시작의 검 — 그 검의 끝.', { face: 'normal' });
    await c.getItem('sw_light'); S().equip.sword = 'sw_light';
    c.music('final');
    await c.narr('흑점이 수정 위로 솟았다. 천장이 사라지고 보랏빛 하늘이 열렸다. 하늘의 구멍이 내려오고 있었다. 가장 밝은 것을 향해 — 너를 향해.');
    await c.say(kaN, '…내가 옆에 서겠다. 이번엔 장부 없이.', { face: 'normal' });
    if (f('cassian_duel')) await c.say(kaN, '……카시안이 사과 값을 아직 못 갚았다고? 그 녀석. …그럼 살아야겠군.', { face: 'smile' });
    if (ST.rally) await ST.rally(c);
    await c.cutin({ who: 'toria', title: '흑점', small: '채워지지 못한 그릇들의 배고픔', sub: '빛 구슬을 깨면 속이 열린다 — 흰빛을!', col: '#3a1a5a', face: 'shock', sec: 2 });
    kaN.dead = true;
    await c.cinema(false);
    c.lock(false);
    const bs = G.bosses.spawn('blacksun', px(13), py(7), {});
    bs.home = { x: px(13), y: py(7) };
    const ally = G.world.add(new KaironAlly({ x: px(9), y: py(12), target: bs }));
    s.duel = true;
    bs.start(); G.hud.setBoss(bs);
    const won = await (async () => { await c.freeWhile(() => bs.dead || bs.dying || bs.hp <= 1 || s.hp <= 1); return bs.dead || bs.dying || bs.hp <= 1; })();
    s.duel = false;
    ally.dead = true;
    if (!won) { c.lock(true); await c.say('serin', '…일어나. 아직 끝나지 않았어. 엄마도 16년 동안 쓰러질 뻔했어. 매일.', { face: 'sad' }); c.heal(); c.lock(false); bs.dead = true; G.hud.boss = null; S().flags.c12_kairon = true; G.script.run(finalChoice); return; }
    bs.dead = true; G.hud.boss = null;
    for (const e of G.world.ents) if (e.foe && !e.dead) e.dead = true;
    await finalChoice(c);
  }
  /** 흑점과 싸우는 동안 카이론이 옆에서 빛기둥을 쏜다 */
  class KaironAlly extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'ally', solid: false, bw: 1, bh: 1 }, o)); this.cool = 3; this.look = G.cast.get('kairon').look; this.dir = 'up'; this.state = 'idle'; }
    update(dt) {
      this.t += dt; this.cool -= dt;
      const b = this.target; if (!b || b.dead) return;
      if (this.cool <= 0) { this.cool = 4 + Math.random() * 2; this.state = 'attack'; setTimeout(() => { this.state = 'idle'; }, 400); G.fx.ring(b.x, b.y - 60, '#fff0a8', 30, 0.5, 2); if (G.light) G.light.flare(b.x, b.y - 60, 120, 0.8, '#fff0a8'); if (G.audio) G.audio.sfx('beam'); for (const o of b.orbs || []) if (!o.dead && Math.random() < 0.5) { G.combat.damage(o, 6, { src: 'spell', el: 'light', unblockable: true }); break; } if (b.core) G.combat.damage(b, 5, { src: 'spell', el: 'light', unblockable: true }); }
    }
    draw(g, cx, cy) { G.sprites.drawChar(g, this, cx, cy); }
  }

  /* ───────── 마지막 선택 ───────── */
  async function finalChoice(c) {
    const s = S();
    c.lock(true);
    await c.cinema(true);
    c.music('requiem');
    await c.narr('흑점이 무릎을 꿇듯 가라앉았다. 부서지지는 않았다. 더 작아졌을 뿐. 여전히 배고팠다.\n그 속에서 목소리들이 들렸다. 금빛 소년의 목소리. 612년 여자의 목소리. 그리고 수많은, 이름 없는 목소리들. [r]「배고파.」[/]');
    await c.say('serin', '저건 괴물이 아니야. 채워지지 못한 사람들이야. 태우면 사라지지만, 사라지는 게 아니라 재가 돼. 삼키면… 너도 저기로 가.', { face: 'sad' });
    await c.say('serin', '엄마는 16년 동안 답을 못 찾았어. 안고 있기만 했어. …네가 찾아 줘. 숙제야. 미안해, 이런 숙제를 줘서.', { face: 'cry' });
    const abyss = Object.keys(s.abyss || {}).length;
    const share = s.shareCount || 0;
    const truths = Object.keys(s.truth || {}).length;
    const opts = [
      { t: '흑점을 태운다', sub: '대륙의 탑들이 모은 빛을 전부 쏜다. 흑점은 재가 된다. 빛도.' },
      { t: '흑점을 삼킨다', sub: '엄마 대신 내가 그릇이 된다. 엄마는 풀려난다.' },
      { t: '나눈다 — 역류 장치를 켠다', sub: s.inv.reverser ? '모인 빛을 대륙으로 되돌린다. 그리고 흑점에게도 — 한 입씩.' : '[r]볼트의 역류 장치 설계도가 없다[/]', if: true },
    ];
    if (f('c12_persuaded') || f('c12_beat_kairon')) opts.push({ t: '카이론에게 맡긴다', sub: '「내 계산이 부른 것이다. 내가 끝낸다.」' });
    // 95b_endings: 이름 · 자장가 · 왕관
    const more = ST.finalMore ? ST.finalMore(s) : [];
    for (const o of more) opts.push(o);
    let k;
    for (;;) { k = await c.choice('흑점이 배고프다고 한다.', opts); if (k === 2 && !s.inv.reverser) { await c.say('toria', '…역류 장치가 없어. 볼트 아저씨 설계도가 있어야 해.', { face: 'sad' }); continue; } break; }
    let ending;
    const pickedMore = opts[k] && opts[k].ending;
    if (pickedMore) ending = pickedMore;
    else if (k === 0) ending = 'ash';
    else if (k === 1) ending = 'repeat';
    else if (k === 3) ending = 'atone';
    else {
      if (abyss >= 6) ending = 'glow';
      else if (share >= 6 && truths >= 6) ending = 'share';
      else ending = { dawn: 'dawn', order: 'nest', night: 'night' }[s.flags.route_lock || 'order'];
    }
    s.flags.ending = ending;
    if (ST.beforeEnding) await ST.beforeEnding(c, ending);
    await c.cinema(false);
    c.lock(false);
    await c.ending(ending);
  }
})();
