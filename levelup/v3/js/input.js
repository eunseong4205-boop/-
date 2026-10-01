/* 입력: 키보드 · 터치(가상 스틱과 버튼) · 게임패드를 하나의 「동작」으로 모은다.
   매 프레임 I.update()가 눌림 순간(pressed) · 뗀 순간(released) · 누른 시간(t)을 계산한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;

  const ACTIONS = ['up', 'down', 'left', 'right', 'attack', 'dodge', 'bow', 'magic', 'tool', 'special', 'menu', 'map', 'cycle', 'cycleL', 'confirm', 'cancel', 'aimfire'];
  const KEYS = {
    ArrowUp: ['up'], KeyW: ['up'], ArrowDown: ['down'], KeyS: ['down'], ArrowLeft: ['left'], KeyA: ['left'], ArrowRight: ['right'], KeyD: ['right'],
    KeyJ: ['attack', 'confirm'], KeyZ: ['attack', 'confirm'], Enter: ['attack', 'confirm'], NumpadEnter: ['attack', 'confirm'],
    Space: ['dodge', 'confirm'], KeyX: ['dodge', 'cancel'],
    KeyK: ['bow'], KeyC: ['bow'], KeyL: ['magic'], KeyV: ['magic'], KeyI: ['tool'], KeyB: ['tool'], KeyO: ['special'], KeyF: ['special'],
    KeyQ: ['cycleL'], KeyE: ['cycle'], Escape: ['menu', 'cancel'], Tab: ['menu'], Backspace: ['cancel'], KeyM: ['map'],
  };
  const PAD = { 0: ['attack', 'confirm'], 1: ['dodge', 'cancel'], 2: ['bow'], 3: ['magic'], 4: ['cycleL'], 5: ['tool'], 6: ['cycle'], 7: ['special'], 8: ['map'], 9: ['menu'], 12: ['up'], 13: ['down'], 14: ['left'], 15: ['right'] };

  const I = {
    st: {}, raw: { key: {}, touch: {}, pad: {}, arrow: {}, mouse: {} }, latch: {},
    // 360° 조준: 마우스 · 오른쪽 스틱 · 버튼 끌기(휴대폰) · 방향키(조준 모드). 없으면 바라보는 쪽 + 자동 조준
    mouse: { x: 0, y: 0, t: -99, inside: false, used: false }, padAim: { x: 0, y: 0 }, touchAim: { x: 0, y: 0, on: false, act: null, keep: 0 }, arrowAim: false, now: 0,
    axisX: 0, axisY: 0, stick: { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 },
    lastSource: 'key', touchMode: false, nav: { dir: null, t: 0, rep: 0 },
  };
  for (const a of ACTIONS) I.st[a] = { down: false, pressed: false, released: false, t: 0, eaten: false };

  /* ───────── 키보드 ───────── */
  function onKey(e, down) {
    const acts = KEYS[e.code];
    if (!acts) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    // 방향키 조준 모드: WASD로 걷고 방향키로 겨눠 쏜다 (메뉴에서는 그대로 위아래)
    if (I.arrowAim && e.code.startsWith('Arrow')) {
      I.raw.arrow[acts[0]] = down; if (down) I.latch['arrow_' + acts[0]] = true; else I.raw.key[acts[0]] = false;
      if (down) { const r = I.raw.arrow, x = (r.right ? 1 : 0) - (r.left ? 1 : 0), y = (r.down ? 1 : 0) - (r.up ? 1 : 0); if (x || y) { const n = U.norm(x, y); I.lastArrow = { x: n[0], y: n[1], t: I.now }; } } I.lastSource = 'key'; if (down && I.touchMode) setTouchMode(false); return; }
    for (const a of acts) { I.raw.key[a] = down; if (down) I.latch[a] = true; }
    I.lastSource = 'key';
    if (down && I.touchMode) setTouchMode(false);
  }
  addEventListener('keydown', (e) => { if (!e.repeat) onKey(e, true); else if (KEYS[e.code]) e.preventDefault(); });
  addEventListener('keyup', (e) => onKey(e, false));
  addEventListener('blur', () => { I.raw.key = {}; I.raw.touch = {}; I.raw.arrow = {}; I.raw.mouse = {}; I.stick.active = false; I.touchAim.on = false; });

  /* ───────── 마우스: 움직이면 그쪽을 겨눈다 · 왼쪽 = 공격 · 오른쪽 = 스킬 · 바퀴/가운데 = 무기 바꾸기 ───────── */
  function bindMouse() {
    const cv = document.getElementById('cv'), stage = document.getElementById('stage');
    if (!cv || !stage) return;
    const mine = (e) => e.pointerType === 'mouse' && e.target === cv;
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const M = I.mouse; M.x = e.clientX; M.y = e.clientY; M.inside = true;
      if (Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) > 0 || !M.used) { M.t = I.now; M.used = true; }
    });
    stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') I.mouse.inside = false; });
    cv.addEventListener('pointerdown', (e) => {
      if (!mine(e)) return;
      e.preventDefault();
      const M = I.mouse; M.x = e.clientX; M.y = e.clientY; M.t = I.now; M.used = true; M.inside = true;
      const a = e.button === 0 ? 'attack' : e.button === 2 ? 'magic' : e.button === 1 ? 'bow' : null;
      if (!a) return;
      I.raw.mouse[a] = true; I.latch[a] = true; I.lastSource = 'mouse';
      try { cv.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
    });
    const up = (e) => { if (e.pointerType !== 'mouse') return; const a = e.button === 0 ? 'attack' : e.button === 2 ? 'magic' : e.button === 1 ? 'bow' : null; if (a) I.raw.mouse[a] = false; else I.raw.mouse = {}; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { I.raw.mouse = {}; });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    let wheelAt = -9;
    cv.addEventListener('wheel', (e) => { e.preventDefault(); if (I.now - wheelAt > 0.18) { wheelAt = I.now; I.latch.bow = true; } }, { passive: false });
  }
  /** 마우스 조준이 살아 있나: 화면 안에서 최근 30초 안에 움직였거나 눌렀다 (터치 모드 · 설정 끔이면 아니다) */
  function mouseAimOn() {
    const M = I.mouse;
    if (!M.used || !M.inside || I.touchMode || I.mouseAimOff) return false;
    return I.now - M.t < 30 || !!(I.raw.mouse.attack || I.raw.mouse.magic);
  }
  /** 직접 겨눈 방향 — {x, y, src} (마우스는 화면 좌표 mx · my를 함께), 없으면 null */
  function aimDir() {
    const T = I.touchAim;
    if (T.on || T.keep > 0) return { x: T.x, y: T.y, src: 'touch' };
    if (U.len(I.padAim.x, I.padAim.y) > 0.35) { const n = U.norm(I.padAim.x, I.padAim.y); return { x: n[0], y: n[1], src: 'pad' }; }
    if (I.arrowAim) { const r = I.raw.arrow; const x = (r.right ? 1 : 0) - (r.left ? 1 : 0), y = (r.down ? 1 : 0) - (r.up ? 1 : 0); if (x || y) { const n = U.norm(x, y); I.lastArrow = { x: n[0], y: n[1], t: I.now }; return { x: n[0], y: n[1], src: 'arrow' }; }
      if (I.lastArrow && I.now - I.lastArrow.t < 0.25) return { x: I.lastArrow.x, y: I.lastArrow.y, src: 'arrow' }; }
    if (mouseAimOn()) return { mx: I.mouse.x, my: I.mouse.y, src: 'mouse' };
    return null;
  }

  /* ───────── 터치: 가상 스틱 (왼쪽) · 버튼 (오른쪽) ───────── */
  function setTouchMode(on) {
    if (I.touchMode === on && document.documentElement.classList.contains('touch') === on) return;
    I.touchMode = on;
    document.documentElement.classList.toggle('touch', on);
    // 세로 화면은 터치판 자리만큼 게임 화면이 줄어든다 → 크기를 다시 잰다
    if (G.game && G.game.resize) requestAnimationFrame(() => G.game.resize());
  }
  // 키보드를 쓰다가 화면을 손가락으로 만지면 터치판이 다시 나온다 (터치판이 숨어 있어도)
  addEventListener('pointerdown', (e) => { if ((e.pointerType === 'touch' || e.pointerType === 'pen') && !I.touchMode) { setTouchMode(true); I.lastSource = 'touch'; } }, true);
  function stickEl() { return document.getElementById('stick'); }
  function bindTouch() {
    const zone = document.getElementById('stickzone');
    if (!zone) return;
    const knob = document.getElementById('knob');
    const R = 34;
    const move = (e) => {
      const s = I.stick;
      let dx = e.clientX - s.ox, dy = e.clientY - s.oy;
      const l = U.len(dx, dy);
      if (l > R) { dx *= R / l; dy *= R / l; }
      s.x = dx / R; s.y = dy / R;
      if (knob) knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    };
    zone.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (I.stick.active) return;
      setTouchMode(true); I.lastSource = 'touch';
      const s = I.stick; s.active = true; s.id = e.pointerId;
      const st = stickEl();
      const zr = zone.getBoundingClientRect();
      // 스틱은 처음 닿은 자리에 생긴다 (가장자리에서는 안쪽으로 당김)
      s.ox = U.clamp(e.clientX, zr.left + R + 6, zr.right - R - 6); s.oy = U.clamp(e.clientY, zr.top + R + 6, zr.bottom - R - 6);
      if (st) { st.style.left = (s.ox - zr.left) + 'px'; st.style.top = (s.oy - zr.top) + 'px'; st.classList.add('on'); }
      try { zone.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
      move(e);
    });
    zone.addEventListener('pointermove', (e) => { if (I.stick.active && e.pointerId === I.stick.id) move(e); });
    const up = (e) => {
      if (e.pointerId !== I.stick.id) return;
      const s = I.stick; s.active = false; s.x = 0; s.y = 0; s.id = null;
      if (knob) knob.style.transform = '';
      const st = stickEl(); if (st) st.classList.remove('on');
    };
    zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
    // 버튼: data-act="attack" 등. 여러 손가락을 동시에 쓸 수 있다.
    // 공격 · 스킬 · 필살 버튼은 누른 채 끌면 그쪽으로 겨눈다 (360°).
    // 공격은 누르는 순간 나가고(끌면 다음 베기 · 활 조준이 따라온다), 스킬 · 필살은 뗄 때 나간다 — 톡 치면 자동 조준, 끌었다 떼면 끈 쪽으로
    const AIMABLE = { attack: 'now', magic: 'release', special: 'release' };
    document.querySelectorAll('[data-act]').forEach((b) => {
      const acts = b.dataset.act.split(' ');
      const mode = AIMABLE[acts[0]] || null;
      let o = null;
      const set = (v) => { for (const a of acts) { I.raw.touch[a] = v; if (v) I.latch[a] = true; } b.classList.toggle('on', v); };
      const drag = (e) => {
        if (!o || e.pointerId !== o.id) return;
        const dx = e.clientX - o.x, dy = e.clientY - o.y, l = U.len(dx, dy);
        if (l > 12) { o.moved = true; Object.assign(I.touchAim, { x: dx / l, y: dy / l, on: true, act: acts[0], len: Math.min(1, l / 70) }); }
        else if (o.moved) I.touchAim.on = false;
      };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault(); setTouchMode(true); I.lastSource = 'touch';
        if (mode) { o = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }; I.touchAim.on = false; I.touchAim.act = acts[0]; }
        if (mode === 'release') b.classList.add('on'); else set(true);
        try { b.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ }
      });
      b.addEventListener('pointermove', drag);
      const end = (fire) => {
        if (mode === 'release') { b.classList.remove('on'); if (fire && o) { for (const a of acts) I.latch[a] = true; } }
        else set(false);
        // 끌어서 겨눈 방향은 뗀 뒤 몇 프레임 더 남겨 둔다 (그 사이에 스킬 · 화살이 나간다)
        if (o && o.moved && I.touchAim.on) { I.touchAim.on = false; I.touchAim.keep = 0.12; }
        else if (o) { I.touchAim.on = false; I.touchAim.keep = 0; }
        o = null;
      };
      b.addEventListener('pointerup', () => end(true));
      b.addEventListener('pointercancel', () => end(false));
      b.addEventListener('lostpointercapture', () => { if (o) end(mode !== 'release'); else if (!mode) set(false); });
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  /* ───────── 게임패드 ───────── */
  function pollPad() {
    I.raw.pad = {};
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) {
      if (!p || !p.connected) continue;
      for (const k in PAD) if (p.buttons[k] && p.buttons[k].pressed) { for (const a of PAD[k]) I.raw.pad[a] = true; I.lastSource = 'pad'; }
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      if (Math.abs(ax) > 0.25 || Math.abs(ay) > 0.25) { I.padX = ax; I.padY = ay; I.lastSource = 'pad'; } else { I.padX = 0; I.padY = 0; }
      // 오른쪽 스틱 = 조준
      const rx = p.axes[2] || 0, ry = p.axes[3] || 0;
      if (U.len(rx, ry) > 0.35) { I.padAim.x = rx; I.padAim.y = ry; I.lastSource = 'pad'; } else { I.padAim.x = 0; I.padAim.y = 0; }
      return;
    }
    I.padX = 0; I.padY = 0; I.padAim.x = 0; I.padAim.y = 0;
  }

  /* ───────── 매 프레임 ───────── */
  function update(dt) {
    I.now += dt;
    const st0 = G.state && G.state.settings;
    I.arrowAim = !!(st0 && st0.arrowAim); I.mouseAimOff = !!(st0 && st0.mouseAim === false);
    if (!I.arrowAim) I.raw.arrow = {};
    if (I.touchAim.keep > 0) I.touchAim.keep -= dt;
    pollPad();
    // 축: 스틱 > 게임패드 > 키보드
    let x = 0, y = 0;
    const k = I.raw.key, p = I.raw.pad;
    if (k.left || p.left) x -= 1; if (k.right || p.right) x += 1; if (k.up || p.up) y -= 1; if (k.down || p.down) y += 1;
    if (x || y) { const n = U.norm(x, y); x = n[0]; y = n[1]; }
    if (I.padX || I.padY) { x = I.padX; y = I.padY; }
    if (I.stick.active) {
      const l = U.len(I.stick.x, I.stick.y);
      if (l > 0.18) { x = I.stick.x; y = I.stick.y; if (l > 1) { x /= l; y /= l; } } else { x = 0; y = 0; }
    }
    I.axisX = x; I.axisY = y;
    for (const a of ACTIONS) {
      const s = I.st[a];
      // 한 프레임보다 짧은 톡 누름도 놓치지 않는다 (latch)
      let v = !!(k[a] || I.raw.touch[a] || p[a] || I.latch[a] || I.raw.mouse[a] || I.raw.arrow[a] || I.latch['arrow_' + a]);
      if (a === 'aimfire') { const r = I.raw.arrow; v = !!(I.arrowAim && (r.up || r.down || r.left || r.right || I.latch.arrow_up || I.latch.arrow_down || I.latch.arrow_left || I.latch.arrow_right)); }
      // 방향 동작은 축에서도 (메뉴 이동용)
      if (a === 'up') v = v || y < -0.6; else if (a === 'down') v = v || y > 0.6; else if (a === 'left') v = v || x < -0.6; else if (a === 'right') v = v || x > 0.6;
      s.pressed = v && !s.down;
      s.released = !v && s.down;
      if (s.pressed) { s.t = 0; s.eaten = false; }
      else if (v) s.t += dt;
      s.down = v;
      if (s.released) s.eaten = false;
    }
    I.latch = {};
    // 메뉴 이동: 누르고 있으면 반복
    const nd = ['up', 'down', 'left', 'right'].find((d) => I.st[d].down) || null;
    if (nd !== I.nav.dir) { I.nav.dir = nd; I.nav.t = 0; I.nav.rep = nd ? 1 : 0; }
    else if (nd) { I.nav.t += dt; I.nav.rep = 0; if (I.nav.t > 0.34) { I.nav.t -= 0.09; I.nav.rep = 1; } }
  }

  /** 이번 프레임에 막 눌렸나 (먹힌 입력은 무시) */
  I.pressed = (a) => { const s = I.st[a]; return !!(s && s.pressed && !s.eaten); };
  I.down = (a) => { const s = I.st[a]; return !!(s && s.down && !s.eaten); };
  I.released = (a) => { const s = I.st[a]; return !!(s && s.released && !s.eaten); };
  I.held = (a) => { const s = I.st[a]; return s && s.down && !s.eaten ? s.t : 0; };
  /** 한 번 쓴 입력은 먹어서 다른 곳에서 다시 쓰지 않게 */
  I.eat = (...as) => { for (const a of as) { const s = I.st[a]; if (s) s.eaten = true; } };
  I.eatAll = () => { for (const a of ACTIONS) I.st[a].eaten = true; };
  /** 메뉴용 방향 (반복 포함) */
  I.nav4 = () => (I.nav.rep ? I.nav.dir : null);
  I.clear = () => { I.raw.key = {}; I.raw.touch = {}; I.raw.arrow = {}; I.raw.mouse = {}; I.touchAim.on = false; I.touchAim.keep = 0; I.latch = {}; for (const a of ACTIONS) Object.assign(I.st[a], { down: false, pressed: false, released: false, t: 0 }); };

  Object.assign(I, { update, bindTouch, bindMouse, setTouchMode, ACTIONS, aimDir, mouseAimOn });
  // 처음 화면이 닿기 전에도 터치 기기라면 터치 모드
  if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) document.documentElement.classList.add('touch'), (I.touchMode = true);
  G.input = I;
})();
