/* 이어지는 실타래 — 한 번 나오고 끝나지 않는 사람들
   · 첫 장면: 983년 겨울, 아스트라. 세린이 수정에 들어가던 밤 (새 게임을 열면 먼저 본다)
   · 막간: 장이 바뀌고 조금 걸으면, 다른 곳에서 같은 시각에 벌어진 일 (카이론 · 그라우스 · 녹턴 · 리라 · 에벨린 · 카시안 · 이스카)
   · 꿈: 쉴 때 가끔. 세는 목소리, 얼음 너머의 손, 배고픔
   · 숨은 이야기: 토리아의 아홉 · 리라의 이름 · 카시안의 사과 값 · 그라우스의 두 번째 장부
   · 다시 나오는 사람들: 이스카 · 피카(영원한 밤) · 야나(색을 잃은 땅) · 루드(안개 늪) · 그라우스(아스트라)
   · 마지막 싸움 앞: 도와준 사람들의 목소리가 빛이 되어 온다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '누나' : '형');
  const inParty = (id) => (S().party || []).includes(id);

  /* ═════════ 무대: 주인공 없이 다른 곳을 비추는 방 ═════════ */
  function stage(id, spec) {
    G.build.def(id, {
      build() {
        const rm = G.build.room(Object.assign({ id }, spec));
        rm.noFollow = true; rm.stage = true; rm.noCard = true; rm.sub = spec.sub || '';
        if (spec.dark != null) rm.dark = spec.dark;
        if (spec.darkCol) rm.darkCol = spec.darkCol;
        return rm;
      },
      ents: spec.ents,
    });
  }
  /** 수정: 비어 있거나(983년 그날 밤 전) 세린이 잠들어 있다 */
  class StageCrystal extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'crystal', solid: true, bw: 24, bh: 10 }, o)); this.sealed = o.sealed !== false; }
    update(dt) { this.t += dt; if (Math.random() < dt * 3) G.fx.part({ x: this.x + (Math.random() - 0.5) * 30, y: this.y - 10, z: 20, vz: 10, g: 0, life: 1, col: '#e8f4ff', size: 1, glow: true }); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const shape = (a, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 15 - a, y - 1 + a); g.lineTo(x - 10 - a, y - 51); g.lineTo(x, y - 62 - a); g.lineTo(x + 10 + a, y - 51); g.lineTo(x + 15 + a, y - 1 + a); g.closePath(); g.fill(); };
      shape(2, '#1a1224');
      shape(0, this.sealed ? 'rgba(210,235,255,0.7)' : 'rgba(210,235,255,0.35)');
      if (this.sealed) {
        const L = G.cast.get('serin').look;
        G.sprites.drawChar(g, { x: this.x, y: this.y - 18, dir: 'down', look: L, state: 'idle', t: 0, anim: 'idle' }, cx, cy);
        shape(0, 'rgba(210,235,255,0.35)');
        if (this.dot) { g.fillStyle = '#05030a'; g.beginPath(); g.arc(x, y - 30, 3 + Math.sin(this.t * 2) * (this.dot > 1 ? 2 : 1), 0, Math.PI * 2); g.fill(); }
      } else {
        const a = 0.25 + Math.sin(this.t * 1.7) * 0.1;
        g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(x - 6, y - 44, 12, 34);
      }
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 8, y - 48, 2, 30);
    }
  }
  // 983년 · 지금의 아스트라 수정 성소
  stage('x_core', { region: 'planet', name: '수정 성소', w: 21, h: 13, floor: T.CRYSTAL, music: 'kairon', dark: 0.35, darkCol: 'rgba(20,10,40,1)', rug: [9, 6, 3, 6],
    furn: [['desk', 4, 4, {}], ['bookpile', 2, 5], ['bookpile', 3, 6], ['lamp', 6, 3], ['clock', 7, 1, { wall: true }], ['shelf', 15, 2], ['shelf', 17, 2], ['plant', 1, 10], ['plant', 19, 10], ['telescope', 17, 5]],
    ents(m, Wd) { Wd.add(new StageCrystal({ x: px(10), y: py(4), sealed: !ST.coldOpen })); } });
  // 천년성 · 챔피언의 서재
  stage('x_study', { region: 'rainbow', name: '챔피언의 서재', w: 16, h: 11, floor: T.CARPET, music: 'kairon', dark: 0.3, rug: [6, 4, 4, 4],
    furn: [['desk', 7, 3], ['crystalball', 9, 3], ['shelf', 2, 2], ['shelf', 3, 2], ['shelf', 12, 2], ['shelf', 13, 2], ['window', 5, 1, { wall: true, v: 'night' }], ['window', 10, 1, { wall: true, v: 'night' }], ['clock', 8, 1, { wall: true }], ['lamp', 1, 4], ['lamp', 14, 4], ['chair', 4, 6], ['bookpile', 12, 7], ['bookpile', 13, 7]] });
  // 천년성 지하 · 징수 기사단 회계실
  stage('x_office', { region: 'rainbow', name: '기사단 회계실', w: 15, h: 10, floor: T.CHECKER, music: 'dread', dark: 0.35,
    furn: [['desk', 7, 3], ['shelf', 2, 2], ['shelf', 3, 2], ['shelf', 4, 2], ['shelf', 10, 2], ['shelf', 11, 2], ['shelf', 12, 2], ['crate', 1, 7], ['crate', 2, 7], ['barrel', 13, 7], ['lamp', 6, 3], ['counter', 10, 5]] });
  // 영원한 밤의 성 · 서쪽 탑
  stage('x_night', { region: 'black', name: '밤의 성 · 서쪽 탑', w: 14, h: 10, floor: T.CARPET, music: 'dream', dark: 0.5, darkCol: 'rgba(10,6,24,1)', rug: [5, 3, 4, 5],
    furn: [['window', 4, 1, { wall: true, v: 'night' }], ['window', 9, 1, { wall: true, v: 'night' }], ['harp', 2, 4], ['mirror', 11, 2], ['desk', 7, 3], ['lamp', 12, 5], ['telescope', 2, 7], ['bookpile', 11, 7]] });
  // 백은 대성당
  stage('x_chapel', { region: 'white', name: '백은 대성당', w: 15, h: 12, floor: T.ICEBRICK, music: 'white', dark: 0.2, rug: [6, 2, 3, 9],
    furn: [['altar', 7, 2], ['pew', 3, 5], ['pew', 11, 5], ['pew', 3, 7], ['pew', 11, 7], ['pew', 3, 9], ['pew', 11, 9], ['lamp', 5, 2], ['lamp', 9, 2], ['window', 3, 1, { wall: true }], ['window', 11, 1, { wall: true }]] });

  /* 무대에 있는 동안은 동료를 부르지 않는다 (토리아는 주인공 곁에 있다) */
  const followers0 = ST.followers;
  ST.followers = function () { return ST.staging ? [] : followers0.apply(this, arguments); };
  // 무대 위에서 저장된 채로 다시 열었다면: 돌아갈 곳으로
  ST.enterHooks.push((m) => {
    if (!m.stage || ST.staging) return;
    const r = S().stageRet;
    setTimeout(() => G.script.run(async (c) => { await c.fade(true, { sec: 0.01 }); G.game.goto(r ? r.map : 'g_home', r ? r.x : px(6), r ? r.y : py(6), 'down', { quiet: true }); const p = W().player; if (p) p.hidden = false; delete S().stageRet; await c.fade(false, { sec: 0.4 }); }), 0);
  });
  function mapMusic() {
    const m = W().map, p = W().player;
    if (!m) return null;
    if (m.overworld) { const n = OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)); return G.story.musicFor ? G.story.musicFor(n) : OW.MUSIC[n]; }
    return typeof m.music === 'function' ? m.music() : m.music;
  }
  /** 다른 곳을 잠깐 비춘다. body(c, A)가 끝나면 원래 자리로 */
  ST.stage = async function (c, id, body, o) {
    o = o || {};
    const s = S(), p0 = W().player;
    const ret = { map: s.map, x: p0.x, y: p0.y, dir: p0.dir };
    s.stageRet = ret;
    await c.fade(true, { sec: 0.6 });
    ST.staging = true;
    await c.cinema(true);
    try {
      if (id) {
        G.game.goto(id, px(o.px || 10), py(o.py || 9), 'up', { quiet: true });
        const q = W().player; q.hidden = true; q.locked = true;
        if (o.cam) c.cam(px(o.cam[0]), py(o.cam[1]), 99);
      }
      if (o.music) c.music(o.music);
      if (o.filter) c.filter(o.filter);
      await c.wait(0.2);
      if (id) await c.fade(false, { sec: 0.8 });
      await body(c);
    } finally {
      await c.fade(true, { sec: 0.7 });
      c.filter(''); c.camFree();
      ST.staging = false;
      if (id) G.game.goto(ret.map, ret.x, ret.y, ret.dir, { quiet: true, keepMusic: true });
      const p2 = W().player; if (p2) { p2.hidden = false; p2.locked = true; }
      delete s.stageRet;
      const mus = mapMusic(); if (mus) c.music(mus);
      await c.cinema(false);
      await c.fade(false, { sec: 0.7 });
    }
  };

  /* ═════════ 첫 장면: 983년 겨울 ═════════ */
  const prologue0 = ST.prologue;
  ST.prologue = function (s) {
    ST.coldOpen = true; ST.staging = true;
    G.game.goto('x_core', px(10), py(10), 'up', { fresh: true, quiet: true, keepMusic: true });
    const p = W().player; p.hidden = true; p.locked = true;
    G.script.run(async (c) => {
      try { await coldOpen(c); } finally { ST.coldOpen = false; ST.staging = false; }
      prologue0(s);
    });
  };
  async function coldOpen(c) {
    c.lock(true);
    await c.fade(true, { sec: 0.01 });
    await c.cinema(true);
    c.filter('memory');
    c.cam(px(10), py(6), 99);
    const cr = W().ents.find((e) => e instanceof StageCrystal);
    const ka = c.spawn({ cid: 'kairon', x: px(4), y: py(5), dir: 'up' });
    ka.forceAnim = 'cast'; ka.forceFps = 3;
    c.music('kairon');
    await c.fade(false, { sec: 1.8 });
    await c.narr('천년력 983년, 겨울. 밤 열한 시.');
    await c.narr('황금별 아스트라. 대륙의 모든 빛이 모이는 곳.\n그 한가운데, 사람 하나가 들어갈 만한 빈 수정.');
    c.sfx('page');
    await c.say(ka, '……삼백열하나. 삼백열둘.', { face: 'closed' });
    c.sfx('page');
    await c.say(ka, '삼백열셋.', { face: 'closed' });
    const se = c.spawn({ cid: 'serin', x: px(10), y: py(12), dir: 'up' });
    c.sfx('door');
    await c.move(se, px(10), py(8), { speed: 40 });
    await c.say(se, '또 세고 있어?', { face: 'sad' });
    ka.forceAnim = null; c.face(ka, 'right');
    await c.say(ka, '흑점까지 남은 날. 사흘.', { face: 'normal' });
    await c.say(ka, '탑 쉰두 개가 더 서면 막을 수 있다. 계산은 끝났다. 사흘만—', { face: 'normal' });
    await c.say(se, '사흘 전에도 사흘이라고 했어.', { face: 'smile' });
    await c.move(se, px(10), py(6), { speed: 30 });
    c.face(se, 'up');
    await c.say(ka, '세린. 그 안에 들어가면 나올 수 없다. 흑점을 안고 있는 동안은.', { face: 'shock' });
    await c.say(se, '알아. 그러니까 내가 가는 거야. 당신은 세는 사람이고, 나는 안는 사람이니까.', { face: 'normal' });
    await c.say(ka, '……다른 그릇을 찾으면 된다.', { face: 'closed' });
    c.face(se, 'left');
    await c.say(se, '다른 그릇.', { face: 'sad' });
    await c.say(se, '당신 장부 맨 끝에 적힌 두 줄 말이야?', { face: 'angry' });
    c.stopMusic(0.4);
    c.sfx('heartbeat');
    await c.wait(0.9);
    await c.say(ka, '……만일을 위한 줄이다.', { face: 'closed' });
    await c.say(se, '만일은 언제나 와, 카이론.', { face: 'sad' });
    await c.say(se, '그러니까 내가 안고 있을게. 그 애들이 아무것도 세지 않아도 되는 날까지.', { face: 'smile' });
    c.music('requiem');
    c.face(se, 'up');
    await c.move(se, px(10), py(5), { speed: 20 });
    await c.narr('세린이 수정에 손을 댔다. 수정이 그녀를 받아들였다. 물이 사람을 받아들이듯, 조용히.');
    c.flash('#ffffff', 0.9); c.sfx('crystal'); c.shake(3, 0.8);
    se.dead = true; if (cr) { cr.sealed = true; cr.dot = 1; }
    G.fx.glow(px(10), py(4) - 20, '#ffffff', 30, 50);
    await c.wait(0.8);
    await c.narr('그날 밤, 아스트라가 두 번 깜빡였다.');
    await c.move(ka, px(8), py(6), { speed: 30 });
    c.face(ka, 'up');
    await c.say(ka, '……세린.', { face: 'cry' });
    await c.wait(1.2);
    await c.move(ka, px(4), py(5), { speed: 30 });
    c.face(ka, 'up'); ka.forceAnim = 'cast'; ka.forceFps = 2;
    c.sfx('page');
    await c.narr('[r]허용 손실 장부 · 983년 겨울[/]\n「세린 — 봉인. 손실 아님.」');
    await c.narr('펜이 멈췄다가, 다시 움직였다.\n「[r]예비 그릇 (1).[/]」\n「[r]예비 그릇 (2).[/]」');
    const nc = c.spawn({ cid: 'nocturne', x: px(17), y: py(8), dir: 'left' });
    await c.move(nc, px(14), py(7), { speed: 26 });
    await c.say(nc, '……아이들은.', { face: 'closed' });
    ka.forceAnim = null;
    await c.say(ka, '장부에 있다. 그걸로 됐다.', { face: 'normal' });
    await c.narr('그림자는 대답하지 않았다. 대신 그의 손이 칼자루를 쥐었다.\n아주, 천천히.');
    await c.fade(true, { sec: 1.6 });
    c.filter('');
    c.stopMusic(1);
    c.sfx('heartbeat'); await c.wait(0.7); c.sfx('heartbeat'); await c.wait(0.9);
    await c.narr('[w]그리고, 16년.[/]');
    await c.cinema(false);
    c.camFree();
  }

  /* ═════════ 막간: 장이 바뀌고, 조금 걸으면 ═════════ */
  const who = (cid, tx, ty, dir) => ({ cid, x: px(tx), y: py(ty), dir: dir || 'down' });
  const ILUDES = {
    c2: { room: 'x_study', cam: [8, 5], title: '세는 사람', play: async (c) => {
      const ka = c.spawn(who('kairon', 8, 4, 'up')); ka.forceAnim = 'cast'; ka.forceFps = 3;
      await c.narr('[s]막간[/] — 같은 시각, 천년성. 챔피언의 서재.');
      const gr = c.spawn(who('graus', 8, 9, 'up'));
      c.sfx('door');
      await c.move(gr, px(8), py(6), { speed: 40 });
      await c.say(gr, '그린 마을 특별 징수, 보고드립니다. 봉헌량은 평년의 두 배. 그리고— 흰빛의 흔적, 한 건.', { face: 'normal' });
      await c.say(ka, '이름.', { face: 'closed' });
      await c.say(gr, '아직 모릅니다. 열여섯. 약초꾼 노파의 손주라고 합니다.', { face: 'smirk' });
      ka.forceAnim = null;
      await c.narr('펜이 멈췄다.');
      await c.say(ka, '……에벨린.', { face: 'closed' });
      await c.say(gr, '잡아 올까요? 흰빛 한 줌이면 탑 열 개 몫입니다.', { face: 'smirk' });
      await c.say(ka, '손대지 마라. 지켜보기만 해라. 빛이 다 자랄 때까지.', { face: 'normal' });
      await c.say(gr, '…다 자라면요?', { face: 'smirk' });
      await c.say(ka, '그때 계산한다.', { face: 'normal' });
      await c.move(gr, px(8), py(10), { speed: 50 }); gr.dead = true; c.sfx('door');
      c.face(ka, 'right');
      await c.narr('수정 구슬 속, 얼음 안에서 잠든 여자. 가슴께에 검은 점 하나.');
      await c.say(ka, '……오늘도 렙업했다, 세린. 그 아이가.', { face: 'sad' });
      await c.say(ka, '네가 웃던 얼굴로.', { face: 'closed' });
      c.sfx('page');
      await c.narr('[r]허용 손실 장부[/]에 새 줄이 늘었다.\n「예비 그릇 (2) — 그린 마을. [r]확인[/].」');
    } },
    c3: { room: 'x_office', cam: [7, 5], title: '두 권의 장부', play: async (c) => {
      const gr = c.spawn(who('graus', 7, 4, 'up')); gr.forceAnim = 'cast'; gr.forceFps = 4;
      await c.narr('[s]막간[/] — 천년성 지하. 징수 기사단 회계실.');
      await c.narr('책상 위에 장부가 두 권이었다.');
      c.sfx('coin');
      await c.say(gr, '챔피언의 장부에 아홉. …내 장부에 하나.', { face: 'normal' });
      c.sfx('coin');
      await c.say(gr, '아홉. 하나. 아홉. 하나.', { face: 'closed' });
      gr.forceAnim = null;
      await c.say(gr, '(작은 유리병을 불빛에 비춘다) 한 줌만 더. 한 줌만 더 있으면—', { face: 'smirk' });
      const cs = c.spawn(who('cassian', 7, 9, 'up'));
      c.sfx('door');
      await c.move(cs, px(7), py(6), { speed: 50 });
      c.face(gr, 'down');
      await c.say(cs, '부단장님. 제 심사 명단에 흰빛 후보를 올리셨더군요. 스승님 명령입니까?', { face: 'normal' });
      await c.say(gr, '(병을 서랍에 넣는다) 챔피언의 뜻이지. 늘 그렇듯.', { face: 'smirk' });
      await c.say(cs, '스승님은 아이를 심사하라는 명령을 내리신 적이 없습니다.', { face: 'angry' });
      await c.say(gr, '카시안. 넌 검은 잘 쓰는데 셈을 못 해. 셈을 못 하는 사람은 오래 못 살아.', { face: 'smirk' });
      await c.say(cs, '……셈 잘하는 사람이 오래 사는 건 봤습니다. 그 옆 사람이 오래 사는 건 못 봤고요.', { face: 'normal' });
      await c.move(cs, px(7), py(10), { speed: 60 }); cs.dead = true; c.sfx('door');
      c.face(gr, 'up');
      c.stopMusic(0.6);
      await c.say(gr, '(서랍을 연다) …조금만 기다려라. 아빠가 곧—', { face: 'sad' });
      await c.narr('그라우스가 입을 다물었다. 서랍 안쪽에 작은 그림 한 장.\n삐뚤빼뚤한 글씨 한 자. [w]「ㄴ」[/].');
    } },
    c4: { room: 'x_night', cam: [7, 5], title: '왼쪽 입꼬리', play: async (c) => {
      const ly = c.spawn(who('lyra', 4, 3, 'up'));
      const nc = c.spawn(who('nocturne', 9, 5, 'left'));
      await c.narr('[s]막간[/] — 영원한 밤의 성. 서쪽 탑.');
      await c.say(ly, '봤어요. 레드 광산에서, 블루 부두에서. 멀리서요.', { face: 'normal' });
      await c.say(nc, '가까이 가지 말라고 했다.', { face: 'closed' });
      c.face(ly, 'right');
      await c.say(ly, '안 갔어요. …그 애, 웃을 때 왼쪽 입꼬리만 올라가요.', { face: 'smile' });
      await c.say(nc, '……', { face: 'closed' });
      await c.say(ly, '누구처럼요.', { face: 'sad' });
      await c.say(nc, '…세린처럼.', { face: 'sad' });
      const mn = c.spawn({ cid: 'midnight', x: px(11), y: py(7), dir: 'left', look: G.cast.get('midnight').look });
      c.emote(mn, '♪');
      await c.say(mn, '흑점이 또 반 뼘 가까워졌군. 반 뼘이면 고양이 걸음으로 천 년이고, 사람 걸음으로는 백 일쯤이지.', { face: 'smirk' });
      await c.say(nc, '카이론은.', { face: 'normal' });
      await c.say(mn, '여전히 세고 있지. 이번엔 탑이 아니라 날짜를.', { face: 'normal' });
      await c.say(ly, '…언제 말해도 돼요? 16년이면 충분히 기다렸잖아요.', { face: 'angry' });
      await c.say(nc, '네 이름을 장부에서 지운 칼이 아직 내 손에 있다. 이름을 다시 부르면, 줄이 다시 생긴다.', { face: 'closed' });
      c.face(ly, 'up');
      await c.say(ly, '[p]♪ 세는 사람아 세는 사람아 / 하나만 빼먹어라\n♪ 빼먹은 하나가 / 밤에 숨어 자란다[/]', { face: 'closed' });
    } },
    c5: { room: 'g_home', cam: [8, 4], px: 7, py: 6, title: '침대 밑', play: async (c) => {
      const ev = c.who('evelyn') || c.spawn(who('evelyn', 9, 4, 'left'));
      await c.narr('[s]막간[/] — 그린 마을. 네가 떠난 오두막.');
      const mr = c.spawn(who('marien', 6, 7, 'up'));
      c.sfx('door');
      await c.move(mr, px(7), py(5), { speed: 50 });
      c.face(ev, mr);
      await c.say(mr, '에벨린! 기사들이 또 왔어요. 그 애 이름을 묻대요. 생일이 언제냐, 머리칼 색이 어떠냐.', { face: 'shock' });
      await c.say(ev, '뭐라 캤노.', { face: 'normal' });
      await c.say(mr, '모른다 했죠. 우리 동네엔 흰머리 애는 없다고. …거짓말은 아니잖아요. 아직은.', { face: 'smirk' });
      await c.say(ev, '허허.', { face: 'smile' });
      c.sfx('hurt');
      await c.narr('할머니가 웃다가, 기침을 했다. 오래.');
      await c.say(mr, '…에벨린.', { face: 'sad' });
      await c.say(ev, '괜찮다. 옥수수빵 싸 가라.', { face: 'closed' });
      await c.move(mr, px(7), py(8), { speed: 50 }); mr.dead = true; c.sfx('door');
      await c.move(ev, px(12), py(4), { speed: 24 });
      c.face(ev, 'up');
      await c.narr('할머니가 침대 밑에서 상자를 꺼냈다. 부러진 초록 창 한 자루. 손으로 베낀 장부 스무 권.');
      await c.say(ev, '세린아. 니 아가 벌써 다섯 번째 땅을 밟았다.', { face: 'sad' });
      await c.say(ev, '니는 그 아한테 셈을 물려주지 말라 캤제. …내는 셈 대신 뭘 물려줬는지 모르겠다. 옥수수빵 굽는 법?', { face: 'closed' });
      c.sfx('door');
      const gd = c.spawn(who('gordi', 7, 8, 'up'));
      await c.move(gd, px(8), py(6), { speed: 40 });
      c.face(ev, gd);
      await c.say(gd, '할머니. …징수 장부에 할머니 이름이 올라갔습니다. 「은닉」.', { face: 'normal' });
      await c.say(ev, '그래서. 잡아갈 끼가.', { face: 'angry' });
      await c.narr('고르디가 투구를 벗었다.');
      await c.say(gd, '저는 오늘 이 집에 안 왔습니다. 그리고 할머니 옥수수빵은 맛이 없었습니다.', { face: 'closed' });
      await c.say(ev, '……두 개 싸 가라.', { face: 'smile' });
      c.flag('gordi_kind');
      gd.dead = true;
    } },
    c6: { room: 'x_study', cam: [8, 5], title: '조금만 더', play: async (c) => {
      const ka = c.spawn(who('kairon', 9, 4, 'up'));
      await c.narr('[s]막간[/] — 천년성. 천년제 전날 밤.');
      await c.say('nocturne', '(통신) 천년제에 갈 건가.', { face: 'normal' });
      await c.say(ka, '가지 않는다.', { face: 'closed' });
      await c.say('nocturne', '(통신) 그 아이가 온다.', { face: 'normal' });
      await c.say(ka, '그래서 가지 않는다.', { face: 'closed' });
      await c.say('nocturne', '(통신) …그라우스가 기둥 근처를 서성인다. 기사들을 모으고 있다.', { face: 'closed' });
      await c.say(ka, '안다. 오류는 스스로 드러나게 둔다. 그래야 지울 수 있다.', { face: 'normal' });
      c.stopMusic(0.5);
      c.sfx('heartbeat');
      await c.narr('수정 구슬 속 여자의 입술이 움직였다.');
      await c.say('serin', '(목소리) 카…이…론.', { face: 'closed' });
      c.face(ka, 'down'); c.emote(ka, '!');
      await c.say('serin', '(목소리) 배… 고파.', { face: 'sad' });
      c.music('dread');
      await c.narr('16년 동안 한 번도 없던 일이었다.');
      c.face(ka, 'up');
      await c.say(ka, '…조금만 더 안고 있어 줘. 조금만. 계산이 거의 끝났어.', { face: 'cry' });
      await c.narr('구슬을 짚은 챔피언의 손끝이 검게 물들어 있었다.');
    } },
    c7: { room: 'x_study', cam: [8, 5], title: '열여섯', play: async (c) => {
      const ka = c.spawn(who('kairon', 8, 4, 'up')); ka.forceAnim = 'cast'; ka.forceFps = 3;
      const gr = c.spawn(who('graus', 4, 7, 'right'));
      await c.narr('[s]막간[/] — 천년성. 천년제가 끝난 밤.');
      await c.say(gr, '하나. 둘. 셋. 넷.', { face: 'closed' });
      const cs = c.spawn(who('cassian', 8, 10, 'up'));
      c.sfx('door');
      await c.move(cs, px(8), py(6), { speed: 50 });
      await c.say(cs, '스승님. 그라우스를… 왜 곁에 두십니까.', { face: 'normal' });
      await c.say(ka, '오류는 지우지만, 버리지는 않는다. 같은 오류를 두 번 내지 않으려고.', { face: 'closed' });
      await c.say(gr, '다섯. 여섯. 일곱.', { face: 'closed' });
      await c.say(cs, '천년제에서 그 아이를 보셨지요. 기둥을 삼킨 아이.', { face: 'normal' });
      await c.say(ka, '봤다.', { face: 'closed' });
      await c.say(cs, '그 아이를 수정에 넣으실 겁니까.', { face: 'angry' });
      ka.forceAnim = null;
      await c.narr('펜 소리가 멈췄다.');
      await c.say(ka, '계산이 그렇게 나오면.', { face: 'normal' });
      await c.say(gr, '열. 열하나. 열둘.', { face: 'closed' });
      await c.narr('카시안이 감찰관 휘장을 책상 위에 내려놓았다.');
      await c.say(cs, '…그럼 저는 스승님의 계산에서 빠지겠습니다.', { face: 'closed' });
      await c.say(ka, '카시안. 네가 빠지면 계산이 틀린다.', { face: 'shock' });
      await c.say(cs, '스승님이 가르쳐 주셨습니다. 틀린 계산은 다시 하면 된다고. …열두 살 때요. 제가 사과 한 알을 훔쳤을 때.', { face: 'sad' });
      await c.move(cs, px(8), py(10), { speed: 60 }); cs.dead = true; c.sfx('door');
      await c.say(gr, '열넷. 열다섯. 열여섯.', { face: 'closed' });
      c.stopMusic(0.3);
      c.face(gr, 'up');
      await c.narr('그라우스가 멈췄다. 열여섯에서. 텅 빈 눈이 카이론을 보았다.');
      await c.say(gr, '……열여섯.', { face: 'normal' });
      c.flag('cassian_left');
    } },
    c8: { room: 'x_chapel', cam: [7, 5], title: '빛으로 보는 눈', play: async (c) => {
      const lu = c.spawn(who('lumie', 7, 3, 'up'));
      const ed = c.spawn(who('edel', 10, 4, 'left'));
      await c.narr('[s]막간[/] — 백은 대성당. 기도가 끝난 새벽.');
      const is = c.spawn(who('iska', 7, 10, 'up'));
      await c.move(is, px(7), py(5), { speed: 26 });
      await c.say(is, '성녀님. 그 아이의 빛을 봤어요. 제 눈으로요. …눈이 아니라, 빛으로.', { face: 'normal' });
      c.face(lu, 'down');
      await c.say(lu, '흰빛이지요. 신께서 대륙에 주신.', { face: 'smile' });
      await c.say(is, '아니요. 흰빛이 둘로 갈라져 있었어요. 하나는 그 아이 가슴에. 하나는— 아주 멀리, 밤 속에. 두 빛이 서로를 찾고 있어요.', { face: 'closed' });
      await c.say(lu, '……', { face: 'shock' });
      c.music('dread');
      await c.say(is, '그리고 세 번째 빛도 봤어요. 하늘에서. 검은 빛이요. 그게 두 빛을 동시에 보고 있어요. 배고픈 눈으로.', { face: 'sad' });
      await c.say(ed, '이스카 님, 성녀님을 놀라게 하지 마시오.', { face: 'angry' });
      await c.say(lu, '괜찮아요, 에델. …이스카. 어디로 가려는 거죠.', { face: 'sad' });
      await c.say(is, '밤으로요. 해가 뜨지 않는 곳에선, 눈 뜬 사람들보다 제가 더 잘 보니까요.', { face: 'smile' });
      c.flag('iska_to_black');
    } },
    c9: { room: 'x_core', cam: [10, 5], px: 10, py: 10, title: '반 뼘', play: async (c) => {
      const cr = W().ents.find((e) => e instanceof StageCrystal); if (cr) cr.dot = 2;
      const ka = c.spawn(who('kairon', 10, 7, 'up'));
      await c.narr('[s]막간[/] — 아스트라. 수정 앞.');
      await c.say('serin', '(목소리) …카이론. 그 애들… 만났어?', { face: 'closed' });
      await c.say(ka, '하나는 만났다. 천년제에서. 기둥을 삼키더군. 너처럼.', { face: 'closed' });
      await c.say('serin', '(목소리) 하나는?', { face: 'normal' });
      await c.say(ka, '……장부에 없다.', { face: 'normal' });
      await c.say('serin', '(목소리) 다행이다.', { face: 'smile' });
      await c.narr('수정 속 여자가 웃었다. 아주 조금.');
      await c.say(ka, '세린. 흑점까지 아흔 일. 탑은 모자라다. 너도 모자라다.', { face: 'sad' });
      await c.say('serin', '(목소리) 알아. 그래서 요즘 자꾸 배가 고파.', { face: 'sad' });
      c.stopMusic(0.5); c.sfx('heartbeat');
      await c.say('serin', '(목소리) 카이론. 내가 먼저 먹히면— 그때는 나를 세지 마.', { face: 'closed' });
      await c.narr('카이론은 대답하지 않았다. 대신, 수정에 댄 손을 떼지 않았다.\n손목까지 검게 물든 손을.');
    } },
    c10: { room: 'x_night', cam: [7, 5], title: '발자국 편지', play: async (c) => {
      const nc = c.spawn(who('nocturne', 7, 4, 'up')); nc.forceAnim = 'cast'; nc.forceFps = 3;
      await c.narr('[s]막간[/] — 영원한 밤의 성. 16년 만에 커튼을 걷은 방.');
      await c.say(nc, '「에벨린. 약속을 어겼다. 아이들이 만났다.」', { face: 'closed' });
      await c.say(nc, '「첫째는 노래를 한다. 둘째는 검을 쓴다. 둘 다… 세린을 닮았다. 셈을 싫어하는 얼굴이.」', { face: 'sad' });
      nc.forceAnim = null;
      const mn = c.spawn({ cid: 'midnight', x: px(10), y: py(6), dir: 'left', look: G.cast.get('midnight').look });
      await c.say(mn, '편지는 고양이가 안 날라. 그 부지런한 우편배달부한테 맡기지. 핀이라던가. 대륙 끝까지 가더군.', { face: 'smirk' });
      await c.say(nc, '…카이론에게도 한 통 쓰고 싶다.', { face: 'closed' });
      await c.say(mn, '뭐라고?', { face: 'normal' });
      await c.say(nc, '「그만 세라.」', { face: 'sad' });
      await c.say(mn, '그건 편지로는 안 돼. 그 애들이 직접 가서 말해야지.', { face: 'normal' });
      await c.narr('녹턴이 펜을 내려놓았다. 창밖, 16년 만에 처음으로— 하늘 끝이 조금 밝았다.');
      c.flag('nocturne_letter');
    } },
    c11: { room: null, title: '같은 하늘', play: async (c) => {
      await c.narr('[s]막간[/] — 무한호가 떠오르던 날. 대륙의 여러 하늘 아래.');
      await c.narr('[g]그린 마을.[/]');
      await c.say('marien', '(목소리) 저거 봐요! 별이 거꾸로 떨어져요! …아니, 올라가요!', { face: 'shock' });
      await c.say('evelyn', '(목소리) ……밥은 묵고 갔나 모르겠다.', { face: 'closed' });
      await c.narr('[r]레드.[/]');
      await c.say('volkan', '(목소리) 망치 내려놔라, 다들. …오늘은 하늘 보는 날이다.', { face: 'normal' });
      await c.narr('[b]백은 대성당 병동.[/]');
      await c.say('noah', '(목소리) 엄마, 저기 ' + sib() + '야. 진짜야. 빛이 ' + sib() + ' 색이야.', { face: 'happy' });
      await c.narr('[y]천년성.[/]');
      await c.say('graus', '(목소리) ……하나.', { face: 'closed' });
      await c.say('graus', '(목소리) 하나. 하나. 하나.', { face: 'closed' });
      await c.narr('그라우스가 다시 세기 시작했다. 이번엔 하나만. 하늘로 올라가는 빛 하나만.');
    } },
  };
  let freeT = 0;
  function calm() {
    const Wd = W(), p = Wd.player;
    for (const e of Wd.ents) if (e.foe && !e.dead && (e.aggro || U.dist(e.x, e.y, p.x, p.y) < 120)) return false;
    return true;
  }
  ST.onTick.push((dt) => {
    const s = S(), Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !p || G.script.running || s.duel || (G.game && G.game.scene && G.game.scene !== 'play') || p.state === 'dead') { freeT = 0; return; }
    if (!(m.overworld || m.id === 'station' || m.id === 'astra')) { freeT = 0; return; }
    const IL = ILUDES[s.ch];
    if (!IL || s.flags['ilude:' + s.ch]) return;
    if (!calm()) { freeT = Math.min(freeT, 3); return; }
    freeT += dt;
    if (freeT < (IL.delay || 5)) return;
    freeT = 0; s.flags['ilude:' + s.ch] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.stage(c, IL.room, async (c2) => { await IL.play(c2); }, IL);
      c.lock(false);
      c.journal('막간 「' + IL.title + '」을 보았다.');
    });
  });
  ST.ILUDES = ILUDES;

  /* ═════════ 꿈: 쉴 때 가끔 ═════════ */
  const DREAMS = [
    { id: 'toria', when: (s) => ST.after('c6') && inParty('toria') && !s.quests.toria_nine, play: async (c) => {
      await c.narr('한밤중. 누군가 작게 말하는 소리에 눈이 떠졌다.');
      await c.say('toria', '(잠꼬대) …세린 언니, 무거워. 그래도 안 놓을게. 약속했으니까…', { face: 'closed' });
      await c.wait(0.5);
      c.emote('toria', '!');
      await c.say('toria', '찍?! …나 잠꼬대했어? 뭐라고 했어?', { face: 'shock' });
      const k = await c.choice('토리아가 묻는다.', ['「세린 언니라고 했어.」', '모른 척한다']);
      if (k === 0) await c.say('toria', '…세린 언니. 나, 그 이름을 알아. 어떻게 아는지는 몰라. 16년 동안 가슴 어딘가가 무거웠어. 거기서 나는 이름 같아.', { face: 'sad' });
      else await c.say('toria', '…거짓말. 표정에 다 써 있어. 찍. 나도 알아. 가슴이 무거워. 16년 동안. 레벨 9에서 안 올라가는 거, 그거 때문인 것 같아.', { face: 'sad' });
      await c.say('toria', '퍼플의 시빌 할멈 연못… 거기선 「되고 싶지 않은 나」가 보인댔지. 나한테 뭐가 붙어 있는지도 보일까?', { face: 'normal' });
      c.quest('toria_nine', 'on');
      c.journal('토리아가 잠꼬대로 세린의 이름을 불렀다. 16년 동안 가슴이 무거웠다고 한다.');
    } },
    { id: 'lyra', when: (s) => ST.after('c10') && f('lyra_sister') && !s.quests.lyra_name, play: async (c) => {
      await c.narr('꿈인지 생시인지. 낮은 허밍 소리.');
      await c.say('lyra', '[p]♪ 등불아 등불아 / 눈을 감아라…[/]', { face: 'closed' });
      await c.say('lyra', '…깼어요? 미안해요. 잠이 안 와서.', { face: 'smile' });
      await c.say('lyra', '있잖아요. 내 이름, 누가 지었는지 알아요? 나도 몰라요. 녹턴은 안 알려 줬어요. 「이름은 지키는 것이지 짓는 게 아니다」래요.', { face: 'sad' });
      await c.say('lyra', '블루 대도서관엔 대륙의 출생 기록이 다 있대요. 983년 장을 보면… 알 수 있을까요. 나도, 너도.', { face: 'normal' });
      c.quest('lyra_name', 'on');
    } },
    { id: 'count', when: (s) => f('c1_tower'), play: async (c) => {
      await c.narr('꿈. 끝없는 서가. 책장마다 같은 장부가 꽂혀 있다.');
      await c.narr('누군가 네 이름 옆의 숫자를 센다.\n[r]「열하나. 열둘. 열셋.」[/]');
      await c.narr('그 숫자가 네 레벨과 같다는 걸 깨닫는 순간— 목소리가 멈춘다.\n[r]「…예비.」[/]');
      c.sfx('heartbeat'); c.shake(2, 0.4);
      if (inParty('toria')) await c.say('toria', '찍… 또 악몽? 이마가 땀범벅이야. 누가 널 센대?', { face: 'sad' });
    } },
    { id: 'ice', when: () => ST.after('c4'), play: async (c) => {
      await c.narr('꿈. 두꺼운 얼음 너머에 손바닥 하나. 네 손바닥과 크기가 같다.');
      await c.say('serin', '(목소리) 렙업했구나. 잘했어.', { face: 'smile' });
      await c.narr('얼음이 조금 녹는다. 녹은 물이 발밑으로 흐른다.\n물이— 검다.');
      c.sfx('heartbeat');
    } },
    { id: 'hunger', when: () => f('pillar_broken'), play: async (c) => {
      await c.narr('꿈. 기둥 속. 천 년 치 빛이 목구멍으로 흘러든다. 달다.');
      await c.narr('더. 더. 조금만 더.\n멈추려는데 멈춰지지 않는다. 입이 네 것이 아니다.');
      c.sfx('heartbeat'); c.shake(3, 0.6);
      if (inParty('toria')) await c.say('toria', '찍! 일어나! 너 자면서… 뭘 먹는 시늉을 했어. 계속. 계속.', { face: 'shock' });
      c.abyss('dream_hunger');
    } },
    { id: 'spear', when: () => ST.after('c8'), play: async (c) => {
      await c.narr('꿈. 983년 겨울. 눈밭. 초록 창을 든 여자가 황금빛 사내 앞에 선다.');
      await c.say('evelyn', '(목소리) 카이론. 그 아들 데려가면, 내 창이 니 목을 딴다.', { face: 'angry' });
      await c.narr('한 합. 창이 부러졌다. 여자가 눈밭에 무릎을 꿇었다. 그리고 웃었다.');
      await c.say('evelyn', '(목소리) …됐다. 시간은 벌었다. 녹턴, 가라. 뒤돌아보지 말고.', { face: 'smile' });
      await c.narr('눈보라 너머, 그림자 하나가 무언가를 품에 안고 사라졌다.');
      c.flag('dream_spear');
    } },
    { id: 'last', when: () => ST.after('c11'), play: async (c) => {
      await c.narr('꿈. 수정 속. 네가 누워 있다. 밖에서 누군가 센다.');
      await c.narr('이번엔 목소리가 둘이다. 하나는 카이론.\n다른 하나는— [r]너[/].');
      c.sfx('heartbeat'); c.shake(2, 0.5);
    } },
  ];
  ST.onRest = async function (c) {
    const s = S();
    if (ST.staging || !W().map) return;
    const Dm = DREAMS.find((d) => !s.flags['dream:' + d.id] && d.when(s));
    if (!Dm) return;
    s.flags['dream:' + Dm.id] = true;
    c.music('dream'); c.filter('dream');
    await Dm.play(c);
    c.filter('');
    const mus = mapMusic(); if (mus) c.music(mus);
  };

  /* ═════════ 보상 · 부탁 ═════════ */
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };
  item('ac_toria', { type: 'acc', grade: 5, name: '열 번째 깃털', fx: { exp: 0.15, sta: 4, dex: 3 }, desc: '토리아가 16년 만에 렙업하며 떨군 깃털. 얻는 빛 +15%, 스태미나 +4, 솜씨 +3.' });
  item('ac_lyra', { type: 'acc', grade: 4, name: '리라의 현', fx: { int: 5, dex: 3, crit: 0.05 }, req: { lv: 26 }, desc: '리라가 류트에서 끊어 준 줄 하나. 지력 +5, 솜씨 +3, 치명타 +5%.' });
  item('sw_cassian', { type: 'sword', grade: 4, name: '두 번째 칼 「사과 값」', atk: 14, reach: 25, crit: 0.08, speed: 0.92, col: '#ffd0d8', glow: '#ff8a9a', req: { str: 16, dex: 10, lv: 24 }, desc: '카이론이 열두 살 카시안에게 준 연습검의 짝. 베는 속도 빠름, 치명타 +8%.' });
  item('ledger_graus', { type: 'key', name: '그라우스의 두 번째 장부', desc: '매달 같은 칸. 「N에게 — 빛 한 줌」. 맨 뒷장에 아이 그림.', read: '991년부터 매달 한 줄. 「N에게 — 빛 한 줌」. 가장자리마다 붉은 도장: 「재징수」.' });
  const Q = (id, o) => { D.QUESTS[id] = Object.assign({ id }, o); };
  Q('toria_nine', { name: '토리아의 아홉', who: '토리아', desc: (s) => (!s.flags.toria_mirror ? '퍼플, 시빌 할멈의 거울 연못에 토리아를 비춰 본다.' : !s.flags.toria_story ? '그린 마을 에벨린 할머니에게 토리아 가슴의 흰 방울에 대해 묻는다.' : '그린 마을 할머니 오두막 옆 큰 참나무 아래에서, 토리아와 함께 방울을 놓아준다.'), after: '토리아가 16년 만에 렙업했다. 한 뼘, 떠올랐다.' });
  Q('lyra_name', { name: '두 개의 이름', who: '리라', desc: (s) => (!s.flags.lyra_page ? '블루 대도서관 사서 헤미아에게 983년 출생 기록을 묻는다.' : '찢긴 장의 나머지를 그린 마을 에벨린 할머니가 가지고 있을지도 모른다.'), after: '리라의 이름은 엄마가 지었다. 네 이름은 할머니가.' });
  Q('cassian_last', { name: '사과 값', who: '카시안', desc: '단풍 협곡에서 혼자 검을 휘두르는 카시안과 겨룬다.', after: '카시안이 스승에게 전할 말을 맡겼다. 「사과 값은 아직 못 갚았다」.' });
  Q('graus_ledger', { name: '두 번째 장부', who: '그라우스', desc: (s) => (!s.flags.graus_noah_told ? '장부 맨 뒷장의 그림. 「노아」. 백은 대성당 병동의 노아에게 보여 줄까.' : '아스트라 어딘가에 그라우스가 있다. 장부를 돌려준다.'), after: '그라우스가 숫자가 아닌 첫 말을 했다. 「노아」.' });

  /* ═════════ 토리아의 아홉 ═════════ */
  ST.hookTalk('p_sybil', 'sybil', (s) => !!(s.quests.toria_nine && !s.flags.toria_mirror), async (c, n) => {
    c.lock(true); await c.cinema(true);
    await c.say(n, '다람쥐도 거울을 볼 자격은 있지. 이리 오너라, 작은 것.', { face: 'closed' });
    c.music('dread');
    await c.narr('연못에 토리아가 비친다. 그런데 연못 속 토리아의 가슴에— 흰 불씨 하나. 작은 심장처럼 뛴다.');
    await c.say(n, '남의 빛이구나. 아주 오래된. 흰빛의 한 방울.', { face: 'normal' });
    await c.say('toria', '…세린 언니 거야. 기억났어. 983년 겨울. 언니가 나한테 넣어 줬어. 「안고 있어. 탑이 세지 못하게.」', { face: 'cry' });
    await c.say(n, '그 방울이 너를 붙잡고 있다. 레벨도, 날개도. 누가 맡겼는지 아는 사람에게 가 보거라.', { face: 'closed' });
    await c.say('toria', '……할머니.', { face: 'sad' });
    c.flag('toria_mirror');
    c.music('forest');
    await c.cinema(false); c.lock(false);
  });
  ST.hookTalk('g_home', 'evelyn', (s) => !!(s.flags.toria_mirror && !s.flags.toria_story) || !!(s.flags.lyra_page && !s.flags.lyra_named), async (c, n) => {
    if (f('toria_mirror') && !f('toria_story')) return toriaStory(c, n);
    return lyraName(c, n);
  });
  async function toriaStory(c, n) {
    c.lock(true); await c.cinema(true);
    c.music('mother');
    await c.say(n, '…결국 봤나. 연못에서.', { face: 'closed' });
    await c.say(n, '983년 겨울. 세린이가 이 집 문을 두드렸다. 품에 아가 하나, 어깨에 다람쥐 하나.', { face: 'sad' });
    await c.say(n, '다람쥐는 레벨 9였다. 하늘다람쥐는 열이 되면 난다 카더라.', { face: 'normal' });
    await c.say(n, '세린이가 그 다람쥐 가슴에 흰빛 한 방울을 넣었다. 「이 아가 렙업할 때마다 탑이 흰빛을 알아챌 거야. 토리아가 그 소리를 대신 삼켜 줄 거야.」', { face: 'closed' });
    await c.say('toria', '…그래서 16년 동안 탑이 너를 못 찾은 거야? 내가… 삼켜서?', { face: 'shock' });
    await c.say(n, '그래. 니 레벨이 9에서 안 오른 것도 그 때문이다. 니는 16년 동안 이 아 렙업을 대신 삼켰다. 한 번도 안 빼고.', { face: 'sad' });
    await c.say('toria', '생일날 탑이 널 알아챈 건… 검을 뽑아서 빛이 너무 커져서구나. 내가 다 못 삼켰어. …찍.', { face: 'cry' });
    await c.say(n, '세린이가 그랬다. 「이 아가 제 빛을 스스로 감당할 수 있을 때, 방울을 돌려줘. 그럼 토리아도 날 거야.」', { face: 'normal' });
    await c.say(n, '놓아줄 데는 저 참나무 아래다. 세린이가 처음 흰빛을 낸 데. 칼자국 옆에 빗금 두 개 있제. 그것도 세린이가 그었다.', { face: 'closed' });
    c.flag('toria_story');
    c.music('home');
    await c.cinema(false); c.lock(false);
  }
  ST.onMap('world', (m, Wd) => {
    const { X0, Y0 } = ST.GREEN;
    Wd.add(new G.props.Spot({ x: px(X0 + 8), y: py(Y0 + 4), reach: 18, verb: '토리아와 참나무 아래 선다', when: () => f('toria_story') && !f('toria_ten'), sparkle: true, text: async (c) => toriaRelease(c) }));
  });
  async function toriaRelease(c) {
    const s = S();
    if (!inParty('toria')) { await c.narr('토리아가 곁에 있어야 한다.'); return; }
    c.lock(true); await c.cinema(true);
    c.music('mother');
    await c.narr('참나무 아래. 칼로 새긴 S · K. 그 밑의 빗금 두 개.');
    await c.say('toria', f('lyra_sister') ? '빗금 두 개… 너랑 리라 언니야. 언니가 새긴 거야. 이제 알겠어.' : '빗금 두 개… 아가 둘? 언니가 새긴 거래. …둘?', { face: 'sad' });
    await c.say('toria', '놓을게. …무서워. 16년 동안 안고 있었는데. 놓으면 나 아무것도 아닐까 봐.', { face: 'cry' });
    const k = await c.choice('토리아가 떨고 있다.', ['「넌 토리아야. 방울이 없어도.」', '「안 놓아도 돼.」', '말없이 손을 내민다']);
    if (k === 1) await c.say('toria', '…찍. 그 말 들으니까, 놓을 수 있을 것 같아.', { face: 'smile' });
    else if (k === 0) await c.say('toria', '…응. 토리아야. 레벨 9 말고. 찍.', { face: 'cry' });
    else await c.say('toria', '(작은 앞발이 네 손가락 하나를 꼭 쥔다) …찍.', { face: 'smile' });
    const p = W().player;
    c.sfx('white'); c.flash('#ffffff', 0.8);
    G.fx.glow(p.x, p.y - 14, '#ffffff', 26, 40);
    await c.narr('토리아의 가슴에서 흰 방울 하나가 떠올랐다. 작은 별처럼. 방울이 떨렸다. 그리고— 목소리가 났다.');
    await c.say('serin', '(목소리) …토리아. 이걸 듣고 있다면, 놓아준 거구나.', { face: 'smile' });
    await c.say('serin', '(목소리) 고마워. 16년이지? 무거웠지. 내 아이의 렙업 소리, 전부 네가 삼켰구나.', { face: 'sad' });
    await c.say('serin', '(목소리) 그 소리들, 나한테도 들렸어. 수정 속에서. 하나도 안 빼고.', { face: 'closed' });
    await c.say('serin', '(목소리) 그러니까 이제— 네가 날 차례야.', { face: 'smile' });
    await c.narr('방울이 네 가슴으로 스며들었다. 따뜻했다. 16년 치의 렙업 소리가 한꺼번에 울렸다.');
    c.sfx('levelup');
    G.fx.ring(p.x, p.y - 10, '#fff4a8', 30, 0.6, 2);
    await c.say(null, '[y]토리아[/]가 레벨 [y]10[/]이 되었다! (16년 만의 렙업)', { style: 'sys' });
    await c.say('toria', '찍! 찍찍! 10이야! 10! 16년 만에!', { face: 'happy' });
    await c.narr('토리아가 날개를 폈다. 바람이 날개 밑으로 들어왔다.\n토리아가— 한 뼘, 떠올랐다. 그리고 떨어졌다.');
    await c.say('toria', '…아직 한 뼘. 그래도 가벼워. 처음으로.', { face: 'cry' });
    c.flag('toria_ten'); c.quest('toria_nine', 'done'); c.bond('toria', 2);
    await c.getItem('ac_toria');
    s.pts = (s.pts || 0) + 2;
    await c.say(null, '방울의 빛이 스며들었다. [y]성장 점수 +2[/]', { style: 'sys' });
    c.journal('참나무 아래에서 토리아가 세린의 방울을 놓아주었다. 16년 동안 토리아는 내 렙업 소리를 대신 삼키고 있었다. 세린은 그 소리를 전부 듣고 있었다.');
    c.music('home');
    await c.cinema(false); c.lock(false);
  }

  /* ═════════ 리라의 이름 ═════════ */
  ST.hookTalk('b_lib', 'hemia', (s) => !!(s.quests.lyra_name && !s.flags.lyra_page), async (c, n) => {
    c.lock(true);
    await c.say(n, '구, 구백팔십삼 년 출생 등록부… 여, 여기요. 이 서가 맨 위 칸이에요.', { face: 'normal' });
    c.sfx('page');
    await c.say(n, '그, 그런데… 한 장이 찢겨 나갔어요. 칼로 자른 것처럼 반듯하게. 남은 건 모서리 하나.', { face: 'shock' });
    await c.narr('모서리에 남은 글씨. 가늘고 둥근 손글씨.\n「…라. 노래하는 아이. 둘째는 ㅇ…」');
    await c.say('lyra', '「…라」.', { face: 'shock' });
    await c.say(n, '이, 이 글씨… 세린 님 글씨예요. 도서관 대출 카드에 똑같은 글씨가 있어요. 「구름의 모양」 스물여섯 번 빌리셨어요.', { face: 'smile' });
    c.flag('lyra_page');
    c.lock(false);
  });
  async function lyraName(c, n) {
    c.lock(true); await c.cinema(true);
    const ly = c.who('lyra') || c.spawn({ cid: 'lyra', x: W().player.x - 16, y: W().player.y, dir: 'up' });
    c.face(n, ly);
    c.music('mother');
    await c.say(n, '……', { face: 'shock' });
    await c.say(n, '니가. 첫째가.', { face: 'sad' });
    await c.say(ly, '처음 뵙겠습니다… 는 아니죠. 983년에 한 번 봤을 테니까.', { face: 'smile' });
    await c.say(n, '울기만 하던 아가였다. 목청이 좋았제. 노래할 줄 알았다.', { face: 'cry' });
    await c.narr('할머니가 침대 밑 상자에서 종이 반 장을 꺼냈다. 한쪽이 칼로 자른 듯 반듯했다.');
    await c.narr('세린의 글씨.\n[w]「첫째: 리라 — 노래하는 아이. 밤이 지켜 줄 거야.」[/]\n[w]「둘째: 이름은 엄마가 지어 줘. 엄마가 부르기 좋은 이름으로.」[/]');
    await c.say(n, '그래서 니 이름은 내가 지었다. ' + (S().name || '아린') + '. 부르기 좋제.', { face: 'smile' });
    await c.say(ly, '…녹턴이 지어 준 줄 알았어요. 16년 동안. …엄마가 지었구나. 내 이름.', { face: 'cry' });
    await c.say(n, '녹턴은 그 이름을 지키기만 했다. 칼로. 장부에서 지우고, 종이에서 오리고.', { face: 'closed' });
    await c.say(n, '…옥수수빵 무라. 네 개 구웠다. 한 사람 더 올지 모른다 캤제.', { face: 'smile' });
    await c.say(ly, '(빵을 받아 든다) …따뜻해요.', { face: 'cry' });
    await c.say(ly, '이거 받아요. 류트 줄 하나. 노래 값이에요. 이번엔 내가 내는.', { face: 'smile' });
    c.flag('lyra_named'); c.quest('lyra_name', 'done'); c.bond('lyra', 2);
    await c.getItem('ac_lyra');
    c.journal('리라의 이름은 세린이 지었다. 내 이름은 할머니가 지었다. 할머니는 옥수수빵을 네 개 구웠다.');
    c.music('home');
    await c.cinema(false); c.lock(false);
  }

  /* ═════════ 카시안: 사과 값 ═════════ */
  G.bosses.variant('cassian2', 'cassian', { name: '카시안', title: '스승을 떠난 제자 · 카시안', hp: 170, atk: 6, speed: 96, exp: 900 });
  ST.person('world', { id: 'cassian', at: () => { const t = OW.towns.amber; const P = t.plaza || { x: t.x + 10, y: t.y + 8 }; return [P.x + 9, P.y - 5]; }, dir: 'left',
    when: (s) => s.flags.cassian_left && ST.after('c8') && !s.flags.cassian_duel && !s.flags.ending,
    mark: () => '!',
    talk: async (c, n) => {
      c.flag('met:cassian');
      c.lock(true);
      if (!f('cassian_talk')) {
        c.flag('cassian_talk'); c.quest('cassian_last', 'on');
        await c.say(n, '…흰빛. 여기까진 스승님의 눈이 닿지 않더군.', { face: 'normal' });
        await c.say(n, '휘장은 두고 왔다. 검을 내려놓으면 무엇이 남는지 알고 싶었다. 아무것도 안 남더군. 그래서 다시 들었다.', { face: 'closed' });
        await c.say(n, '겨루자. 스승님께 배운 마지막 초식으로. 네가 이기면 이 검을 가져가라. 내가 이기면… 아무것도 없다. 그냥 내가 이긴 거다.', { face: 'smirk' });
      }
      const k = await c.choice('카시안이 검을 뽑는다.', [{ t: '겨룬다', sub: '카이론의 마지막 제자. 전보다 훨씬 강하다.' }, '나중에']);
      if (k !== 0) { await c.say(n, '기다리지. 검은 기다리는 걸 잘한다.', { face: 'normal' }); c.lock(false); return; }
      await c.cutin({ who: 'cassian', title: '카시안', small: '스승을 떠난 제자', sub: '방패를 든 정면은 막힌다 — 완벽 회피 뒤에 반격을', col: '#8a1a2a', face: 'smirk', sec: 1.6 });
      const bx = n.x, by = n.y; n.dead = true;
      const boss = G.bosses.spawn('cassian2', bx, by, {});
      boss.duel = true; boss.home = { x: bx, y: by };
      S().duel = true;
      c.lock(false);
      boss.start(); G.hud.setBoss(boss); c.music('boss2');
      let win = false;
      await c.freeWhile(() => { if (boss.hp <= boss.maxHp * 0.2) { win = true; return true; } return S().hp <= 1; });
      S().duel = false;
      const x2 = boss.x, y2 = boss.y; boss.dead = true; G.hud.boss = null;
      c.lock(true); await c.cinema(true);
      const cs = c.spawn({ cid: 'cassian', x: x2, y: y2 }); c.faceEach('hero', cs);
      c.music('sad');
      if (!win) { await c.say(cs, '아직이다. 네 검 끝이 아직 화가 덜 났군. 다시 와라.', { face: 'smirk' }); c.heal(); cs.dead = true; await c.cinema(false); c.lock(false); ST.refreshPeople(); return; }
      await c.say(cs, '……하. 두 번째다. 스승님 말고 나를 무릎 꿇린 건.', { face: 'smile' });
      await c.say(cs, '열두 살 때, 회색 땅 고아였다. 사과 한 알을 훔쳤다. 나를 잡은 사람이 스승님이었다.', { face: 'closed' });
      await c.say(cs, '스승님은 사과 값을 대신 내고, 장부에 적었다. 「카시안 — 사과 한 알. 갚을 것.」 그리고 이 검을 주셨다. 한 쌍 중 하나를.', { face: 'sad' });
      await c.say(cs, '…그 장부는 사람을 살리는 장부였다. 언제부터 사람을 빼는 장부가 됐을까.', { face: 'cry' });
      await c.say(cs, '두 번째 칼이다. 가져가라. 첫 칼은 내가 쥔다. 둘 다 스승님을 베는 데는 쓰지 않을 거다.', { face: 'normal' });
      await c.getItem('sw_cassian');
      await c.say(cs, '아스트라에 가면, 스승님께 전해 다오. 사과 값은 아직 못 갚았다고. …그러니까 살아 계시라고.', { face: 'sad' });
      c.flag('cassian_duel'); c.quest('cassian_last', 'done'); c.bond('cassian', 2); c.exp(400);
      cs.dead = true;
      await c.cinema(false); c.lock(false);
      ST.refreshPeople();
    } });

  /* ═════════ 그라우스의 두 번째 장부 ═════════ */
  ST.onMap('world', (m, Wd) => {
    const t = OW.towns.rainbow; if (!t) return;
    const P = t.plaza || { x: t.x + 10, y: t.y + 8 };
    const sp = new G.props.Spot({ x: px(P.x - 7), y: py(P.y - 6), reach: 16, verb: '부서진 궤짝을 뒤진다', sparkle: true, when: () => f('pillar_broken') && !S().inv.ledger_graus && !f('graus_ledger_got'), text: async (c) => {
      c.lock(true);
      await c.narr('무대 뒤, 기사단 궤짝 하나가 부서져 있다. 찢어진 망토 밑에 가죽 장부 한 권.');
      c.flag('graus_ledger_got'); c.give('ledger_graus', 1);
      c.music('dread');
      await c.narr('그라우스의 글씨. 991년부터 매달 한 줄.\n[w]「N에게 — 빛 한 줌.」[/]\n가장자리마다 붉은 도장: [r]「재징수 — 개인 송금은 경험세 대상」[/].');
      await c.narr('맨 뒷장에 아이 그림 한 장. 투구를 쓴 사람과 작은 사람. 삐뚤빼뚤한 글씨.\n[w]「아빠 기사 되면 나 다 나아? — 노아」[/]');
      await c.say('toria', '…노아? 그린 마을 노아? 빛바램병 노아?', { face: 'shock' });
      await c.say('toria', '그라우스가 떼어 먹은 빛… 전부 노아한테 보내려던 거야? 근데 탑이 그걸 또 걷어 갔어. 한 번도 안 빼고.', { face: 'sad' });
      c.quest('graus_ledger', 'on');
      c.music('rainbow');
      c.lock(false);
    } });
    if (G.ent.settle) G.ent.settle(m, sp);
    Wd.add(sp);
  });
  ST.hookTalk('w_ward', 'noah', (s) => !!(s.inv.ledger_graus && !s.flags.graus_noah_told), async (c, n) => {
    c.lock(true); await c.cinema(true);
    c.music('sad');
    await c.narr('노아에게 장부를 펴 보였다. 맨 뒷장의 그림.');
    await c.say(n, '…아빠 글씨야. 「ㄴ」을 꼭 이렇게 써. 꼬리를 길게.', { face: 'shock' });
    await c.say(n, '아빠는 내가 네 살 때 기사가 됐어. 빛을 벌어 오겠다고. 한 번도 안 왔어. 엄마는 아빠가 우릴 버렸대.', { face: 'sad' });
    await c.say(n, '…매달 한 줌씩 보냈네. 근데 우린 한 번도 못 받았어. 탑이… 먹었네. 아빠가 지키던 탑이.', { face: 'cry' });
    await c.say(n, sib() + '. 아빠 어디 있어?', { face: 'cry' });
    const k = await c.choice('노아가 묻는다.', ['「…찾아서 이거 돌려줄게.」', '「모르겠어.」']);
    if (k === 0) await c.say(n, '그럼 이것도 같이 줘. (그림 한 장을 더 그린다) 이번엔 아빠 투구 안 그렸어. 얼굴만.', { face: 'smile' });
    else await c.say(n, '…응. 괜찮아. 나 기다리는 거 잘해. 16… 아니, 12년 기다렸으니까.', { face: 'sad' });
    c.flag('graus_noah_told');
    await c.cinema(false); c.lock(false);
  });
  // 아스트라: 카이론이 데려온 그라우스. 정원 옆에서 센다
  ST.person('astra', { id: 'graus', x: 31, y: 36, dir: 'right', when: (s) => !s.flags.ending,
    mark: () => (S().inv.ledger_graus && f('graus_noah_told') && !f('graus_noah') ? '!' : null),
    talk: async (c, n) => {
      if (f('graus_noah')) { await c.say(n, '……노아. 노아. …옥수수빵.', { face: 'closed' }); return; }
      if (!(S().inv.ledger_graus && f('graus_noah_told'))) {
        await c.say(n, U.pick(['천이백. 천이백하나. 천이백둘.', '…다음 그릇. 하나.', '하나. 하나. 하나.']), { face: 'closed' });
        await c.say('toria', '찍… 이 사람, 뭘 세는 거지? 눈이 텅 비었는데 입만 움직여.', { face: 'sad' });
        return;
      }
      c.lock(true); await c.cinema(true);
      c.music('sad');
      await c.say(n, '천삼백. 천삼백하나.', { face: 'closed' });
      await c.narr('장부를 펴서, 그라우스의 무릎 위에 올려놓았다. 맨 뒷장. 그리고 노아가 새로 그린 그림.');
      await c.say(n, '천삼백……', { face: 'closed' });
      c.stopMusic(0.8);
      await c.wait(1.2);
      await c.say(n, '……노아.', { face: 'cry' });
      await c.narr('텅 빈 눈에서 물이 흘렀다. 숫자가 아닌, 첫 말이었다.');
      await c.say('toria', '…세는 걸 멈췄어.', { face: 'cry' });
      c.take('ledger_graus'); c.flag('graus_noah'); c.quest('graus_ledger', 'done');
      c.journal('아스트라에서 그라우스에게 장부를 돌려주었다. 그는 「노아」라고 말했다.');
      c.music('planet');
      await c.cinema(false); c.lock(false);
    } });

  /* ═════════ 다시 나오는 사람들 ═════════ */
  const townAt = (k, dx, dy) => () => { const t = OW.towns[k]; if (!t) return [10, 10]; const P = t.plaza || { x: t.x + (t.w >> 1), y: t.y + (t.h >> 1) }; return [P.x + dx, P.y + dy]; };
  ST.folk('world', { id: 'iska', name: '이스카', at: townAt('black', -6, 3), dir: 'down', when: (s) => ST.after('c9') && s.flags['met:iska'] && !s.flags.ending,
    lines: { c9: async (c, n) => {
      await c.say(n, '여기선 제가 제일 잘 봐요. 다들 등불을 찾는데, 저는 등불이 필요 없거든요.', { face: 'smile' });
      await c.say(n, f('lyra_sister') ? '두 빛이 이제 나란히 걸어요. 한쪽이 조금 더 밝고, 한쪽이 조금 더 따뜻해요. 보기 좋아요.' : '…당신 빛 옆에, 똑같은 모양의 빛이 하나 더 있어요. 성 안에. 노래하는 모양이에요.', { face: 'normal' });
    }, c10: '성녀님께 편지를 썼어요. 「신의 뜻이 아니라 사람의 장부였어요」라고. 답장이 왔어요. 「알고 있었다」래요. …그래도 기도는 계속하신대요.', c12: '하늘의 검은 빛이 당신만 봐요. 무서워하지 마요. 저도 보고 있으니까요.' } });
  ST.folk('world', { id: 'pika', name: '피카', at: townAt('black', 5, 4), dir: 'left', wander: 20, when: (s) => ST.after('c9') && s.flags['met:pika'] && !s.flags.ending,
    lines: { c9: ['참새단 배달! 등불 기름이요! …칸델 아저씨가 16년 치 야근 수당을 나눠 준대서 왔어요. 헤헤.', '밤 동네 애들은 해를 그림으로만 봤대요. 그래서 우리가 노래를 가르쳐 줬어요. 「해님 해님」. 리라 언니한테 배운 거.'], c10: '무한호 연료통에 우리 참새단 사인도 있어요! 하늘까지 가는 거예요, 우리 이름이!' } });
  ST.folk('world', { id: 'yana', name: '야나', at: townAt('gray', 6, -4), dir: 'down', when: (s) => ST.after('c8') && s.flags['met:yana'] && !s.flags.ending,
    lines: { c8: ['회색 땅엔 별이 안 보여. 그래도 나는 알아. 저 구름 위에 어떤 별이 있는지. 길잡이는 안 보이는 걸 외우는 사람이야.', '모래바다 대상들이 회색 땅까지 소금을 날라. 여기 사람들, 소금 맛이 뭔지 잊었대. …색이랑 같이.'], c10: '하늘로 간다며? 별자리 하나 알려 줄게. 「두 마리 여우」. 꼬리가 맞닿아 있어. 쌍둥이 별이야.' } });
  ST.folk('world', { id: 'rud', name: '루드', at: townAt('mist', -8, 4), dir: 'right', when: (s) => ST.after('c8') && s.flags['met:rud'] && !s.flags.ending,
    lines: { c8: async (c, n) => {
      await c.say(n, '늪 나루터 장부를 조사하러 왔어. 983년 기록에 이상한 게 있거든.', { face: 'normal' });
      await c.say(n, '「983년 봄. 두 사람 — [r]한 사람 요금[/]. 사공 재량.」 …배 부른 여자는 한 사람 요금이래. 숫자는 거짓말 안 해. 근데 숫자는 가끔 봐주더라.', { face: 'smile' });
    }, c10: '누나는 새벽단 사람들이랑 대륙 탑을 하나씩 멈추고 있어. 나는 멈춘 탑의 장부를 태우지 않고 모으는 중이야. 언젠가 누가 셈을 따질 때 필요하니까.' } });

  /* 핀의 편지 몇 통 더 */
  if (ST.LETTERS) {
    ST.LETTERS.push(
      { id: 'l_nocturne', from: '녹턴', when: (s) => ST.after('c10') && s.flags.nocturne_letter, text: '「세린의 아이에게. 네 할머니에게 편지를 썼다. 답장은 오지 않을 것이다. 에벨린은 답장을 쓰지 않는 사람이니까.\n…대신 옥수수빵이 왔다. 세 개. 하나는 고양이가 먹었다. — 녹턴」' },
      { id: 'l_gordi', from: '고르디', when: (s) => ST.after('c7') && s.flags.gordi_kind, text: '「할머니 댁에 안 갔습니다. 옥수수빵도 안 먹었습니다. 맛도 없었습니다. …두 개 다 먹었습니다. 보고 끝. — 그린 마을 담당 징수 기사 고르디」' },
      { id: 'l_iska', from: '이스카', when: (s) => ST.after('c9') && s.flags.iska_to_black && s.flags['met:iska'], text: '「밤의 도시에 왔어요. 여기선 모두가 저처럼 더듬어 걸어요. 처음으로 제가 길을 알려 주는 쪽이 됐어요. 기분이 이상해요. 좋은 쪽으로요.」' },
      { id: 'l_cassian2', from: '카시안', when: (s) => s.flags.cassian_duel && ST.after('c10'), text: '「협곡에서 사과나무를 봤다. 한 알 땄다. 값은 나무 밑에 두고 왔다. …처음으로 갚았다. 스승님께는 아직이다.」' },
    );
  }

  /* ═════════ 증거: 숨은 이야기도 카이론을 멈추는 말이 된다 ═════════ */
  const evidence0 = ST.evidence;
  if (evidence0) ST.evidence = function () {
    const list = evidence0.apply(this, arguments);
    if (f('cassian_duel')) list.push('카시안의 사과 값');
    if (f('graus_noah')) list.push('그라우스의 두 번째 장부');
    if (f('toria_ten')) list.push('토리아가 삼킨 16년');
    if (f('lyra_named')) list.push('세린이 지은 이름');
    return list;
  };

  /* ═════════ 마지막 싸움 앞: 도와준 사람들의 목소리 ═════════ */
  ST.rally = async function (c) {
    const s = S();
    const V = [
      ['evelyn', () => true, '(목소리) 밥은 묵었나. …묵고 싸워라. 옥수수빵 네 개 구워 놨다.'],
      ['toria', () => f('toria_ten'), '(목소리) 찍! 방울 소리 들려? 16년 치야. 전부 네 거야!'],
      ['noah', () => f('met:noah'), '(목소리) ' + sib() + '! 나 머리카락 까매진 거 세 올이야! 그러니까 지지 마!'],
      ['cassian', () => f('cassian_duel') || (s.bond.cassian || 0) >= 3, '(목소리) 검 끝이 떨리는 건 화가 나서다. 좋은 칼이다. …가라, 후배.'],
      ['lea', () => f('met:lea') && s.flags.route_lock === 'dawn', '(목소리) 새벽단 전원, 탑 불 껐다! 대륙 빛이 전부 네 쪽으로 간다!'],
      ['gordi', () => f('gordi_kind'), '(목소리) 보고드립니다. 그린 마을 옥수수밭 이상 없음. …돌아오십시오.'],
      ['volkan', () => f('haru_done') || f('met:volkan'), '(목소리) 망치는 두 번 떨어뜨렸다. 세 번은 안 떨어뜨린다. 가라!'],
      ['viola', () => f('met:viola'), '(목소리) 세린 님 기록은 내가 다 깼어. 네 기록은 네가 깨. 이번 판만은 져 줄게!'],
      ['iska', () => f('met:iska'), '(목소리) 보여요. 당신 빛이 제일 밝아요. 검은 것보다 훨씬.'],
      ['pika', () => f('met:pika'), '(목소리) 참새단 전원 하늘 보는 중! 헤헤, 눈 깜빡이면 벌금이다!'],
      ['morgan', () => f('morgan_done'), '(목소리) 노는 한 번 더 저어 두었다. 돌아올 배다.'],
      ['yuna', () => f('yuna_done'), '(목소리) 유안 몫까지 응원할게! 두 배야!'],
      ['sepia', () => f('met:sepia'), '(목소리) 색 표본 병, 마지막 칸 비워 뒀어. 네가 돌아올 때 하늘 색 가져와.'],
      ['graus', () => f('graus_noah'), '(목소리) ……노아. 노아에게… 돌아가라.'],
    ];
    const on = V.filter((v) => v[1]());
    if (on.length < 2) return;
    await c.narr('흑점이 입을 벌리는 순간— 멀리서, 아주 멀리서 목소리들이 들렸다. 대륙 곳곳의 등불이 하나씩 켜지는 소리.');
    for (const v of on.slice(0, 7)) await c.say(v[0], v[2], { face: 'normal' });
    if (on.length > 7) await c.narr('그리고 이름을 다 셀 수 없는 목소리들. ' + (on.length - 7) + '개, 그보다 많이.');
    const k = on.length;
    const atk = 1 + Math.min(0.4, k * 0.035), def = 1 - Math.min(0.3, k * 0.025);
    s.buffs = (s.buffs || []).filter((b) => b.until > s.t);
    s.buffs.push({ atk, def, until: s.t + 900, col: '#fff4a8' });
    c.heal();
    c.sfx('white'); c.flash('#fff4a8', 0.6);
    await c.say(null, '[y]연대의 빛[/] ×' + k + ' — 공격 +' + Math.round((atk - 1) * 100) + '%, 받는 피해 -' + Math.round((1 - def) * 100) + '%. 체력이 가득 찼다.', { style: 'sys' });
  };

  /* ═════════ 결말 · 그 뒤: 새로 이어진 사람들 ═════════ */
  ST.moreFates = ST.moreFates || [];
  ST.moreFates.push((id, add, out) => {
    const s = S();
    const set = (who, text) => { const e = out.find((x) => x.who === who); if (e) e.text = text; else add(who, text); };
    if (f('toria_ten')) add('toria', id === 'repeat' ? '토리아는 수정 앞에서 날개를 편다. 한 뼘. 레벨 10의 한 뼘. 언젠가 두 뼘이 되면 수정을 넘어 날아가 볼 거라고 한다.' : '토리아는 이제 레벨 10이다. 여전히 한 뼘밖에 못 난다. 매일 한 뼘씩 늘리는 중이다. 「찍. 내일은 두 뼘.」');
    if (f('lyra_named')) add('lyra', '리라는 그린 마을 쉼터에서 노래한다. 첫 곡은 늘 같다. 엄마가 지어 준 이름으로 시작하는 노래. 할머니는 맨 앞자리에서 존다.');
    else if (f('lyra_sister')) add('lyra', '리라는 다시 떠돌이가 되었다. 이번엔 돌아올 집이 있는 떠돌이.');
    if (f('cassian_duel')) set('cassian', '카시안은 회색 땅 고아원에 사과나무를 심었다. 나무에 장부 한 권을 걸어 두었다. 「가져갈 것. 갚지 말 것.」');
    if (f('graus_noah') && id !== 'repeat') set('graus', '그라우스는 봄에 흰 방을 나왔다. 숫자는 여전히 서툴다. 이름 하나만은 틀리지 않는다. 노아가 아빠에게 옥수수빵 먹는 법부터 다시 가르친다.');
    if (f('gordi_kind')) add('gordi', '고르디는 징수 기사 휘장을 반납했다. 지금은 그린 마을 옥수수밭을 지킨다. 까마귀에게는 세금을 걷지 않는다.');
    if (f('met:nocturne') || f('c9_done')) add('nocturne', id === 'night' ? '녹턴은 다시 밤이 되었다. 이번엔 누군가의 그림자가 아니라, 제 이름을 가진 밤.' : '녹턴은 성의 커튼을 모두 떼어 냈다. 영원한 밤의 성에 처음으로 아침이 들었다. 그림자는 이제 해를 따라 움직인다.');
    if (f('met:iska')) add('iska', '이스카는 밤의 도시에 남았다. 해가 뜬 뒤에도. 「눈부신 건 여전히 안 보여요. 그래서 좋아요.」');
    if (f('morgan_done')) add('morgan', '모르간은 안개가 걷힌 늪에서 여전히 노를 젓는다. 요금표를 새로 붙였다. 「배 부른 사람: 한 사람 요금.」');
    if (f('yuna_done')) add('yuna', '유나는 해마다 백합을 두 송이 산다. 한 송이는 늪에 띄우고, 한 송이는 자기 머리에 꽂는다.');
    if (f('bell_done')) add('bell', '벨은 그림자 사냥을 그만두었다. 그림자가 줄었기 때문이다. 지금은 단풍 협곡에서 활을 가르친다. 로완이 조교다.');
    if (f('haru_done')) add('haru', '하루는 레드에 대장간을 하나 더 열었다. 볼칸과 망치 소리가 엇박으로 울린다. 둘 다 그게 좋다고 한다.');
    if (f('met:fin')) add('fin', '핀은 여전히 편지를 나른다. 요즘은 아스트라 행 우편도 받는다. 「느려요. 그래서 좋아요.」');
    return s;
  });
})();
