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
    stopT: 0, slow: 1, slowT: 0,
  };

  function load(map, x, y, dir) {
    W.map = map;
    W.ents = W.ents.filter((e) => e === W.player);
    const p = W.player;
    if (p) { p.x = x; p.y = y; if (dir) p.dir = dir; G.ent.settle(map, p); p.jz = 0; p.vx = p.vy = 0; }
    snap();
    W.lastTx = Math.floor(x / TS); W.lastTy = Math.floor((y - 2) / TS);
    map.warm(x, y, 360);
    if (G.world.onLoad) G.world.onLoad(map);
  }
  function add(e) { W.ents.push(e); return e; }
  function remove(e) { e.dead = true; }

  /** 소품(상자 · 블록 · 문 등)이 막는가 */
  function propBlock(x, y, w, h, who) {
    for (const e of W.ents) {
      if (e === who || !e.solid || e.dead || !e.blockBox) continue;
      // 사람은 주인공이 계속 밀면 비켜 준다 (다리 · 문 앞 · 좁은 길에서 영영 막히지 않게)
      if (e.npc && e.passT > 0 && who && who === W.player) continue;
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
  function hitstop(sec) { W.stopT = Math.max(W.stopT, sec); }
  function slowmo(f, sec) { W.slow = f; W.slowT = sec; }

  /* ───────── 갱신 ───────── */
  // 존재 하나가 오류를 내도 다른 존재 · 카메라 · 문 판정은 계속 돈다 (종류마다 한 번만 남긴다)
  const entErrSeen = {};
  function entErr(e, err) { const k = (e && (e.kind || (e.constructor && e.constructor.name))) || '?'; if (!entErrSeen[k]) { entErrSeen[k] = 1; console.error('[ent ' + k + ']', err); } }
  function update(dt) {
    if (W.stopT > 0) { W.stopT -= dt; updateCam(dt); G.fx && G.fx.update(dt * 0.2); return; }
    if (W.slowT > 0) { W.slowT -= dt; dt *= W.slow; if (W.slowT <= 0) W.slow = 1; }
    W.t += dt;
    if (!W.paused) {
      for (const e of W.ents.slice()) if (!e.dead && e.update) { try { e.update(dt, W); } catch (err) { entErr(e, err); } }
      W.ents = W.ents.filter((e) => !e.dead || e === W.player);
    }
    if (G.fx) G.fx.update(dt);
    updateCam(dt);
    checkTiles();
  }

  /* ───────── 발밑 칸: 문(다른 지도) · 칸 트리거 ───────── */
  function checkTiles() {
    const p = W.player, m = W.map;
    if (!p || !m) return;
    const tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 2) / TS);
    if (tx === W.lastTx && ty === W.lastTy) return;
    if (G.script.running || G.script.busy || p.state === 'jump' || p.state === 'dead' || p.state === 'fall') return;
    // 맞아서 밀려난 걸음으로는 문을 지나지 않는다 (다시 걸어 들어가면 된다)
    if (p.state === 'hurt' || Math.abs(p.kx || 0) + Math.abs(p.ky || 0) > 30) return;
    W.lastTx = tx; W.lastTy = ty;
    for (const w of m.warps || []) {
      if (tx < w.x || ty < w.y || tx >= w.x + (w.w || 1) || ty >= w.y + (w.h || 1)) continue;
      if (w.cond && !w.cond()) { if (w.msg) { G.ui.toast(typeof w.msg === 'function' ? w.msg() : w.msg, 'bad', 'warp:' + (w.id || w.to)); const [ux, uy] = U.DV[p.dir]; p.x -= ux * 6; p.y -= uy * 6; } continue; }
      if (G.game.useWarp) G.game.useWarp(w);
      return;
    }
    for (const t of m.triggers || []) {
      if (tx < t.x || ty < t.y || tx >= t.x + (t.w || 1) || ty >= t.y + (t.h || 1)) continue;
      if (t.once && G.state.flags[t.once]) continue;
      if (t.cond && !t.cond()) continue;
      if (t.once) G.state.flags[t.once] = true;
      t.fn(p, m);
      return;
    }
  }

  /* ───────── 그리기 ───────── */
  function render(g) {
    const v = W.view, c = W.cam, m = W.map;
    const cx = Math.round(c.x + c.sx), cy = Math.round(c.y + c.sy);
    W.rcx = cx; W.rcy = cy;
    g.fillStyle = '#000'; g.fillRect(0, 0, v.w, v.h);
    m.drawGround(g, cx, cy, v.w, v.h, 2);
    // 물결 · 용암 빛
    const tx0 = Math.floor(cx / TS) - 1, ty0 = Math.floor(cy / TS) - 1, tx1 = Math.floor((cx + v.w) / TS) + 1, ty1 = Math.floor((cy + v.h) / TS) + 1;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) TL.waterFx(g, m, tx, ty, tx * TS - cx, ty * TS - cy, W.t);
    // 바닥에 붙는 것 (그림자 · 떨어진 물건 · 효과)
    for (const e of W.ents) if (!e.dead && !e.hidden && e.drawShadow && e.x > cx - 60 && e.x < cx + v.w + 60 && e.y > cy - 20 && e.y < cy + v.h + 60) e.drawShadow(g, cx, cy);
    if (G.fx) G.fx.drawUnder(g, cx, cy);
    if (G.gear && G.gear.drawUnder) { try { G.gear.drawUnder(g, cx, cy); } catch (_) { /* 무시 */ } }
    // y 정렬: 서 있는 사물 + 존재
    const list = [];
    m.collect(list, tx0, ty0, tx1, ty1 + 3);
    const x0 = cx - 80, x1 = cx + v.w + 80, y0 = cy - 40, y1 = cy + v.h + 170;
    for (const e of W.ents) if (!e.dead && !e.hidden && e.draw && e.x > x0 && e.x < x1 && e.y > y0 && e.y < y1) list.push({ y: e.y + (e.sortBias || 0), ent: e });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) {
      if (it.ent) { try { it.ent.draw(g, cx, cy); } catch (err) { entErr(it.ent, err); } }
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
    if (G.combat && G.combat.drawBolts) G.combat.drawBolts(g, cx, cy);
    if (G.combat && G.combat.drawAim) { try { G.combat.drawAim(g, cx, cy); } catch (_) { /* 무시 */ } }
    if (G.fx) G.fx.drawOver(g, cx, cy);
    if (G.light) G.light.draw(g, cx, cy);
    // 덧그림: 지역 날씨 장막 등 (빛 위에)
    if (W.overlays) for (const f of W.overlays) { try { f(g, cx, cy, v); } catch (err) { if (!W.ovErr) { W.ovErr = true; console.error('[overlay]', err); } } }
  }

  Object.assign(W, { load, add, remove, propBlock, snap, update, render, shake, hitstop, slowmo });
  G.world = W;
})();
