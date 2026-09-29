/* 실행 중인 세계: 지금 지도, 존재 목록, 카메라, 그리기 순서 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const TS = TL.TS;

  const W = {
    map: null, ents: [], player: null, t: 0, paused: false,
    cam: { x: 0, y: 0, shake: 0, shakeT: 0, sx: 0, sy: 0, lock: null, lead: [0, 0], zoom: 1 },
    view: { w: 400, h: 216 },
    hitstop: 0, slow: 1, slowT: 0,
  };

  function load(map, x, y, dir) {
    W.map = map;
    W.ents = W.ents.filter((e) => e === W.player);
    const p = W.player;
    if (p) { p.x = x; p.y = y; if (dir) p.dir = dir; G.ent.settle(map, p); p.jz = 0; p.vx = p.vy = 0; }
    snap();
    map.warm(x, y, 360);
    if (G.world.onLoad) G.world.onLoad(map);
  }
  function add(e) { W.ents.push(e); return e; }
  function remove(e) { e.dead = true; }

  /** 소품(상자 · 블록 · 문 등)이 막는가 */
  function propBlock(x, y, w, h, who) {
    for (const e of W.ents) {
      if (e === who || !e.solid || e.dead || !e.blockBox) continue;
      const b = e.blockBox();
      if (b && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y) return true;
    }
    return false;
  }

  /* ───────── 카메라 ───────── */
  function camTarget() {
    const p = W.player, v = W.view, c = W.cam;
    let tx, ty;
    if (c.lock) { tx = c.lock.x - v.w / 2; ty = c.lock.y - v.h / 2; }
    else {
      // 가는 쪽을 조금 더 보여 준다
      c.lead[0] = U.lerp(c.lead[0], (p.vx || 0) * 0.35, 0.05);
      c.lead[1] = U.lerp(c.lead[1], (p.vy || 0) * 0.25, 0.05);
      tx = p.x - v.w / 2 + c.lead[0]; ty = p.y - 12 - p.jz - v.h / 2 + c.lead[1];
    }
    const m = W.map;
    const mw = m.w * TS, mh = m.h * TS;
    tx = mw <= v.w ? (mw - v.w) / 2 : U.clamp(tx, 0, mw - v.w);
    ty = mh <= v.h ? (mh - v.h) / 2 : U.clamp(ty, 0, mh - v.h);
    return [tx, ty];
  }
  function snap() { if (!W.player || !W.map) return; const [x, y] = camTarget(); W.cam.x = x; W.cam.y = y; }
  function updateCam(dt) {
    const c = W.cam;
    const [tx, ty] = camTarget();
    const k = c.lock && c.lock.speed ? c.lock.speed : 10;
    c.x = U.lerp(c.x, tx, Math.min(1, dt * k));
    c.y = U.lerp(c.y, ty, Math.min(1, dt * k));
    if (c.shakeT > 0) { c.shakeT -= dt; const a = c.shake * Math.min(1, c.shakeT * 6); c.sx = (Math.random() - 0.5) * 2 * a; c.sy = (Math.random() - 0.5) * 2 * a; }
    else { c.sx = 0; c.sy = 0; }
  }
  function shake(amp, sec) { W.cam.shake = Math.max(W.cam.shakeT > 0 ? W.cam.shake : 0, amp); W.cam.shakeT = Math.max(W.cam.shakeT, sec || 0.2); }
  /** 타격감: 아주 잠깐 멈춘다 */
  function hitstop(sec) { W.hitstop = Math.max(W.hitstop, sec); }
  function slowmo(f, sec) { W.slow = f; W.slowT = sec; }

  /* ───────── 갱신 ───────── */
  function update(dt) {
    if (W.hitstop > 0) { W.hitstop -= dt; updateCam(dt); G.fx && G.fx.update(dt * 0.2); return; }
    if (W.slowT > 0) { W.slowT -= dt; dt *= W.slow; if (W.slowT <= 0) W.slow = 1; }
    W.t += dt;
    if (!W.paused) {
      for (const e of W.ents.slice()) if (!e.dead && e.update) e.update(dt, W);
      W.ents = W.ents.filter((e) => !e.dead || e === W.player);
    }
    if (G.fx) G.fx.update(dt);
    updateCam(dt);
  }

  /* ───────── 그리기 ───────── */
  function render(g) {
    const v = W.view, c = W.cam, m = W.map;
    const cx = Math.round(c.x + c.sx), cy = Math.round(c.y + c.sy);
    g.fillStyle = '#000'; g.fillRect(0, 0, v.w, v.h);
    m.drawGround(g, cx, cy, v.w, v.h, 2);
    // 물결 · 용암 빛
    const tx0 = Math.floor(cx / TS) - 1, ty0 = Math.floor(cy / TS) - 1, tx1 = Math.floor((cx + v.w) / TS) + 1, ty1 = Math.floor((cy + v.h) / TS) + 1;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) TL.waterFx(g, m, tx, ty, tx * TS - cx, ty * TS - cy, W.t);
    // 바닥에 붙는 것 (그림자 · 떨어진 물건 · 효과)
    for (const e of W.ents) if (!e.dead && !e.hidden && e.drawShadow) e.drawShadow(g, cx, cy);
    if (G.fx) G.fx.drawUnder(g, cx, cy);
    // y 정렬: 서 있는 사물 + 존재
    const list = [];
    m.collect(list, tx0, ty0, tx1, ty1 + 3);
    for (const e of W.ents) if (!e.dead && !e.hidden && e.draw) list.push({ y: e.y + (e.sortBias || 0), ent: e });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.ent) it.ent.draw(g, cx, cy);
      else {
        // 플레이어가 큰 나무 뒤에 있으면 잎을 조금 비친다
        const p = W.player;
        let alpha = 1;
        if (p && it.img.height > 30 && p.y < it.y && p.y > it.top && Math.abs(p.x - (it.x + it.img.width / 2)) < it.img.width / 2) alpha = 0.55;
        if (alpha < 1) g.globalAlpha = alpha;
        g.drawImage(it.img, Math.round(it.x - cx), Math.round(it.top - cy));
        g.globalAlpha = 1;
      }
    }
    if (G.fx) G.fx.drawOver(g, cx, cy);
    if (G.light) G.light.draw(g, cx, cy);
  }

  Object.assign(W, { load, add, remove, propBlock, snap, update, render, shake, hitstop, slowmo });
  G.world = W;
})();
