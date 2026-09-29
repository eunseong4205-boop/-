/* 입력: 키보드 · 터치(가상 스틱과 버튼) · 게임패드를 하나의 「동작」으로 모은다.
   매 프레임 I.update()가 눌림 순간(pressed) · 뗀 순간(released) · 누른 시간(t)을 계산한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;

  const ACTIONS = ['up', 'down', 'left', 'right', 'attack', 'dodge', 'bow', 'magic', 'tool', 'special', 'menu', 'map', 'cycle', 'cycleL', 'confirm', 'cancel'];
  const KEYS = {
    ArrowUp: ['up'], KeyW: ['up'], ArrowDown: ['down'], KeyS: ['down'], ArrowLeft: ['left'], KeyA: ['left'], ArrowRight: ['right'], KeyD: ['right'],
    KeyJ: ['attack', 'confirm'], KeyZ: ['attack', 'confirm'], Enter: ['attack', 'confirm'], NumpadEnter: ['attack', 'confirm'],
    Space: ['dodge', 'confirm'], KeyX: ['dodge', 'cancel'],
    KeyK: ['bow'], KeyC: ['bow'], KeyL: ['magic'], KeyV: ['magic'], KeyI: ['tool'], KeyB: ['tool'], KeyO: ['special'], KeyF: ['special'],
    KeyQ: ['cycleL'], KeyE: ['cycle'], Escape: ['menu', 'cancel'], Tab: ['menu'], Backspace: ['cancel'], KeyM: ['map'],
  };
  const PAD = { 0: ['attack', 'confirm'], 1: ['dodge', 'cancel'], 2: ['bow'], 3: ['magic'], 4: ['cycleL'], 5: ['tool'], 6: ['cycle'], 7: ['special'], 8: ['map'], 9: ['menu'], 12: ['up'], 13: ['down'], 14: ['left'], 15: ['right'] };

  const I = {
    st: {}, raw: { key: {}, touch: {}, pad: {} },
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
    for (const a of acts) I.raw.key[a] = down;
    I.lastSource = 'key';
    if (down && I.touchMode) setTouchMode(false);
  }
  addEventListener('keydown', (e) => { if (!e.repeat) onKey(e, true); else if (KEYS[e.code]) e.preventDefault(); });
  addEventListener('keyup', (e) => onKey(e, false));
  addEventListener('blur', () => { I.raw.key = {}; I.raw.touch = {}; I.stick.active = false; });

  /* ───────── 터치: 가상 스틱 (왼쪽) · 버튼 (오른쪽) ───────── */
  function setTouchMode(on) {
    I.touchMode = on;
    document.documentElement.classList.toggle('touch', on);
  }
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
    document.querySelectorAll('[data-act]').forEach((b) => {
      const acts = b.dataset.act.split(' ');
      const set = (v) => { for (const a of acts) I.raw.touch[a] = v; b.classList.toggle('on', v); };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); setTouchMode(true); I.lastSource = 'touch'; set(true); try { b.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ } });
      b.addEventListener('pointerup', () => set(false));
      b.addEventListener('pointercancel', () => set(false));
      b.addEventListener('lostpointercapture', () => set(false));
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
      return;
    }
    I.padX = 0; I.padY = 0;
  }

  /* ───────── 매 프레임 ───────── */
  function update(dt) {
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
      let v = !!(k[a] || I.raw.touch[a] || p[a]);
      // 방향 동작은 축에서도 (메뉴 이동용)
      if (a === 'up') v = v || y < -0.6; else if (a === 'down') v = v || y > 0.6; else if (a === 'left') v = v || x < -0.6; else if (a === 'right') v = v || x > 0.6;
      s.pressed = v && !s.down;
      s.released = !v && s.down;
      if (s.pressed) { s.t = 0; s.eaten = false; }
      else if (v) s.t += dt;
      s.down = v;
      if (s.released) s.eaten = false;
    }
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
  I.clear = () => { I.raw.key = {}; I.raw.touch = {}; for (const a of ACTIONS) Object.assign(I.st[a], { down: false, pressed: false, released: false, t: 0 }); };

  Object.assign(I, { update, bindTouch, setTouchMode, ACTIONS });
  // 처음 화면이 닿기 전에도 터치 기기라면 터치 모드
  if (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) document.documentElement.classList.add('touch'), (I.touchMode = true);
  G.input = I;
})();
