/* 게임: 부팅 · 캔버스 크기(가로 기본, 세로 대응) · 고정 시간 갱신 루프 · 장면 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, I = G.input, W = G.world, TL = G.tiles;
  const $ = (id) => document.getElementById(id);

  const GM = { scene: 'boot', acc: 0, last: 0, fps: 60, frames: 0, fpsT: 0, scale: 1 };
  G.ui = G.ui || { blocking: () => false };
  G.script = G.script || { running: false };

  /* ───────── 캔버스 크기: 세로 216 고정(가로 화면), 세로 화면이면 가로 240 기준 ───────── */
  function resize() {
    const st = $('stage'), cv = $('cv');
    const r = st.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    const aspect = r.width / r.height;
    const portrait = aspect < 1.05;
    // 정수 배율로 화면을 꽉 채운다: 세로 기준 216(가로 화면) · 가로 기준 256(세로 화면)
    let s = portrait ? Math.max(1, Math.round(r.width / 256)) : Math.max(1, Math.round(r.height / 216));
    let LW = Math.ceil(r.width / s), LH = Math.ceil(r.height / s);
    if (!portrait && (LW > 440 || LH > 250)) { LH = 216; LW = U.clamp(Math.round(216 * aspect), 280, 440); s = Math.min(r.width / LW, r.height / LH); }
    if (portrait && (LW > 300 || LH > 380)) { LW = 256; LH = U.clamp(Math.round(256 / aspect), 216, 360); s = Math.min(r.width / LW, r.height / LH); }
    if (cv.width !== LW || cv.height !== LH) { cv.width = LW; cv.height = LH; }
    GM.scale = s;
    const w = Math.round(LW * s), h = Math.round(LH * s);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.style.left = Math.round((r.width - w) / 2) + 'px'; cv.style.top = Math.round((r.height - h) / 2) + 'px';
    W.view.w = LW; W.view.h = LH;
    if (W.map) W.snap();
  }

  /* ───────── 루프 ───────── */
  const STEP = 1 / 60;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!GM.last) GM.last = ts;
    let dt = Math.min(0.1, (ts - GM.last) / 1000);
    GM.last = ts;
    GM.acc += dt;
    GM.fpsT += dt; GM.frames++;
    if (GM.fpsT >= 1) { GM.fps = GM.frames; GM.frames = 0; GM.fpsT = 0; }
    let n = 0;
    while (GM.acc >= STEP && n < 4) { tick(STEP); GM.acc -= STEP; n++; }
    if (n === 4) GM.acc = 0;
    draw();
  }
  function tick(dt) {
    I.update(dt);
    if (G.script && G.script.update) G.script.update(dt);
    if (GM.scene === 'play') {
      if (G.ui && G.ui.update) G.ui.update(dt);
      const paused = G.ui.paused && G.ui.paused();
      if (!paused) {
        W.update(dt);
        if (G.combat) G.combat.update(dt);
        if (G.state) G.state.t += dt;
      }
      if (G.interact) G.interact.update();
      if (G.cine && G.cine.update) G.cine.update(dt);
      if (G.hud && G.hud.update) G.hud.update(dt);
    } else if (GM.scene === 'title' && G.ui && G.ui.titleUpdate) G.ui.titleUpdate(dt);
  }
  function draw() {
    const cv = $('cv'), g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    W.ctx = g;
    if (GM.scene === 'play' && W.map) {
      W.render(g);
      if (G.cine && G.cine.draw) G.cine.draw(g, W.view.w, W.view.h);
      if (G.hud && G.hud.draw) G.hud.draw(g, W.view.w, W.view.h);
    } else if (G.ui && G.ui.titleDraw) G.ui.titleDraw(g, cv.width, cv.height);
    else { g.fillStyle = '#05040a'; g.fillRect(0, 0, cv.width, cv.height); }
    if (GM.debug) { g.fillStyle = '#fff'; g.font = "8px 'Galmuri11'"; g.fillText(GM.fps + 'fps', 4, cv.height - 4); }
  }

  /* ───────── 개발용 시험 지도 ───────── */
  function devMap() {
    const GN = G.gen, O = G.objs.O, T = TL.T;
    const m = new G.GameMap({ id: 'dev', name: '시험 들판', w: 72, h: 52, region: 0 });
    m.ter.fill(T.GRASS);
    GN.ellipse(m, 30, 16, 16, 9, null, 1, 3);
    GN.ellipse(m, 32, 13, 7, 4, null, 2, 5);
    GN.ellipse(m, 55, 36, 9, 6, T.WATER, 0, 7);
    GN.ellipse(m, 55, 36, 5, 3, T.DEEP, 0, 8);
    GN.fill(m, 0, 44, 72, 8, T.SAND, 0);
    GN.ellipse(m, 12, 40, 7, 4, T.DIRT, null, 9);
    GN.cliffs(m);
    GN.stairsBelow(m, 30, 20, 2);
    GN.stairsBelow(m, 32, 15, 1);
    GN.path(m, [[4, 30], [30, 30], [30, 26], [40, 40], [66, 42]], T.DIRT, 2, 'dev');
    GN.clump(m, 0, 0, 72, 44, O.TREE, 0.42, (x, y, t, h) => t === T.GRASS && h === 0, 'forest', 6);
    GN.scatter(m, 0, 0, 72, 44, O.BUSH, 0.02, (x, y, t) => t === T.GRASS, 'bush');
    GN.scatter(m, 0, 0, 72, 44, O.FLOWER, 0.05, (x, y, t) => t === T.GRASS, 'fl');
    GN.scatter(m, 0, 0, 72, 44, O.TALL, 0.06, (x, y, t) => t === T.GRASS, 'tall');
    GN.scatter(m, 0, 0, 72, 52, O.ROCK, 0.01, (x, y, t) => t !== T.WATER && t !== T.DEEP && t !== T.CLIFF, 'rock');
    GN.scatter(m, 0, 44, 72, 8, O.PALM, 0.04, (x, y, t) => t === T.SAND, 'palm');
    GN.scatter(m, 44, 28, 24, 16, O.LILY, 0.12, (x, y, t) => t === T.WATER, 'lily');
    for (let y = 26; y < 34; y++) for (let x = 2; x < 8; x++) m.obj[m.i(x, y)] = 0;
    return m;
  }

  /** 주인공을 전투 · 그리기와 잇는다 */
  function makePlayer(x, y) {
    const s = G.state;
    const p = new G.Player({ x, y });
    p.look = G.story && G.story.heroLook ? G.story.heroLook(s) : { gender: s.gender === 'girl' ? 'girl' : 'boy', hair: s.gender === 'girl' ? 'long' : 'spiky', hc: '#6a4a3a', top: 'tunic', tc: '#3aa84a', eye: '#4a9a6a' };
    p.actions = G.combat.actions;
    p.behindWeapon = () => { if (p.dir === 'up') G.combat.drawWeapon(W.ctx, p, W.rcx, W.rcy); };
    p.onDraw = () => { if (p.dir !== 'up') G.combat.drawWeapon(W.ctx, p, W.rcx, W.rcy); };
    return p;
  }

  function startDev() {
    const m = devMap();
    const s = G.state = G.st.fresh('아린', 'boy');
    G.st.give(s, 'sw_wood'); G.st.give(s, 'sh_wood'); G.st.give(s, 'bow'); s.ammo.arrows = 30; G.st.give(s, 'bomb'); G.st.learnSpell(s, 'fire'); G.st.learnSpell(s, 'ice'); G.st.learnSpell(s, 'bolt');
    const p = makePlayer(5 * 16 + 8, 30 * 16 + 12);
    W.player = p; W.ents = [p];
    W.load(m, p.x, p.y, 'right');
    const F = G.foes;
    if (F) { F.spawn('slime', 16 * 16, 30 * 16); F.spawn('slime', 18 * 16, 33 * 16); F.spawn('boar', 22 * 16, 38 * 16); F.spawn('bandit', 26 * 16, 34 * 16); F.spawn('knight', 14 * 16, 36 * 16); F.spawn('bat', 20 * 16, 28 * 16); F.spawn('plant', 10 * 16, 38 * 16); }
    const P = G.props;
    if (P) { W.add(new P.Chest({ x: 7 * 16 + 8, y: 27 * 16 + 12, item: 'potion_r', pid: 'c1' })); W.add(new P.Pot({ x: 3 * 16 + 8, y: 27 * 16 + 12 })); W.add(new P.Pot({ x: 4 * 16 + 8, y: 27 * 16 + 12 })); W.add(new P.Sign({ x: 6 * 16 + 8, y: 33 * 16 + 12, text: '시험 들판. 동쪽: 적들 · 북쪽: 언덕' })); }
    GM.scene = 'play';
  }

  function boot(hot) {
    I.bindTouch();
    if (G.combat) G.combat.makeIcons();
    if (G.ui && G.ui.bindTap) G.ui.bindTap();
    addEventListener('resize', resize);
    addEventListener('orientationchange', () => setTimeout(resize, 200));
    resize();
    GM.debug = /debug/.test(location.search) || (hot && hot.debug);
    if (G.game.start) G.game.start(hot); else startDev();
    requestAnimationFrame(frame);
  }

  Object.assign(GM, { boot, resize, devMap, startDev, makePlayer });
  // 다른 모듈이 먼저 G.game에 붙인 것(start 등)을 살리고, 이후로는 같은 객체를 쓴다
  G.game = Object.assign(GM, G.game || {});
})();
