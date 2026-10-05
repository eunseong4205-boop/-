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
    if (map.warmView) map.warmView(Math.round(W.cam.x), Math.round(W.cam.y), W.view.w, W.view.h); else map.warm(x, y, 360);   // 둘레는 걸으면서 미리 칠한다
    if (G.world.onLoad) G.world.onLoad(map);
  }
  function add(e) { W.ents.push(e); return e; }
  function remove(e) { e.dead = true; }

  /** 소품(상자 · 블록 · 문 등)이 막는가.
      주인공이 미는 동안 비켜 서는 사람(yieldT)은 주인공을 막지 않는다 (96_sanity의 비켜 주기).
      걸음 하나마다 여러 번 불리므로, 세계가 도는 동안에는 64픽셀 칸 격자에서 근처 것만 본다 —
      예전에는 들판의 존재 760여 개를 걸음마다 전부 훑어 그것만으로 한 프레임이 넘게 걸렸다 */
  const PB = { cell: 64, grid: new Map(), arr: null, len: 0, n: -1, stamp: 0, r: null };
  function hits(e, x, y, w, h, who) {
    if (e === who || !e.solid || e.dead || !e.blockBox) return false;
    if (who && who === W.player && (e.yieldT > 0 || (e.npc && e.passT > 0))) return false;
    const b = e.blockBox();
    return !!(b && x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y);
  }
  function pbBuild() {
    const C = PB.cell, grid = PB.grid; grid.clear();
    PB.arr = W.ents; PB.len = W.ents.length; PB.n = W.tickN;
    // 넓은 들판에서는 깨어 있는 둘레(+160픽셀)의 것만 칸에 넣는다. 그 밖을 묻는 일(멀리서 깨어 있는 것)은 전부 훑는다
    const r = PB.r = W.cullR ? { x0: W.cullR.x0 - 160, x1: W.cullR.x1 + 160, y0: W.cullR.y0 - 160, y1: W.cullR.y1 + 160 } : null;
    for (const e of W.ents) {
      if (!e.solid || e.dead || !e.blockBox) continue;
      if (r && (e.x < r.x0 || e.x > r.x1 || e.y < r.y0 || e.y > r.y1)) continue;
      const b = e.blockBox() || { x: e.x - 8, y: e.y - 8, w: 16, h: 16 };   // 지금은 막지 않는 것(숨은 사람)도 곧 막을 수 있다
      const x0 = Math.floor((b.x - 16) / C), x1 = Math.floor((b.x + b.w + 16) / C), y0 = Math.floor((b.y - 16) / C), y1 = Math.floor((b.y + b.h + 16) / C);
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const k = cx + cy * 8192; let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(e); }
    }
  }
  function propBlock(x, y, w, h, who) {
    if (!W.inTick) { for (const e of W.ents) if (hits(e, x, y, w, h, who)) return true; return false; }
    if (PB.arr !== W.ents || PB.n !== W.tickN) pbBuild();
    const r = PB.r;
    if (r && (x < r.x0 + 100 || x + w > r.x1 - 100 || y < r.y0 + 100 || y + h > r.y1 - 100)) { for (const e of W.ents) if (hits(e, x, y, w, h, who)) return true; return false; }
    const C = PB.cell, st = ++PB.stamp;
    const x0 = Math.floor(x / C), x1 = Math.floor((x + w) / C), y0 = Math.floor(y / C), y1 = Math.floor((y + h) / C);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      const a = PB.grid.get(cx + cy * 8192); if (!a) continue;
      for (const e of a) { if (e._pbs === st) continue; e._pbs = st; if (hits(e, x, y, w, h, who)) return true; }
    }
    for (let i = PB.len; i < W.ents.length; i++) if (hits(W.ents[i], x, y, w, h, who)) return true;   // 이번 갱신 중에 새로 생긴 것
    return false;
  }

  /** 지금 깨어 있는 것들: 넓은 들판에서는 화면 둘레의 것만 (주인공 앞 상호작용 · 적 찾기에 쓴다). 그 밖에는 전부 */
  function awake() { return W.act && W.actMap === W.map && W.actN === W.tickN ? W.act : W.ents; }

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
      W.tickN = (W.tickN || 0) + 1;
      // 넓은 들판에서는 화면 둘레(±280픽셀) 밖의 것은 쉬게 한다: 들판 하나에 사람 · 표지판 · 상자 · 건물이 760개 넘게 있다.
      // 주인공 · 동료 · 연출이 움직이는 것 · 보스 · 깨어 있어야 하는 것(keepAwake)은 늘 돈다
      const m = W.map, cull = m && (m.overworld || W.ents.length > 200);
      const c = W.cam, M = 280, ax0 = c.x - M, ax1 = c.x + W.view.w + M, ay0 = c.y - M, ay1 = c.y + W.view.h + M;
      W.cullR = cull ? { x0: ax0, x1: ax1, y0: ay0, y1: ay1 } : null;
      W.inTick = true;
      const act = cull ? [] : null;
      const arr = W.ents, n = arr.length;   // 이번 갱신 중에 생긴 것은 다음 갱신부터 (예전의 slice()와 같다)
      try {
        for (let i = 0; i < n; i++) {
          const e = arr[i];
          if (e.dead) continue;
          if (cull) {
            if ((e.x < ax0 || e.x > ax1 || e.y < ay0 || e.y > ay1) && e !== W.player && !e.follower && !e.script && !e.boss && !e.keepAwake) continue;
            act.push(e);
          }
          if (!e.update) continue;
          try { e.update(dt, W); } catch (err) { entErr(e, err); }
        }
      } finally { W.inTick = false; }
      W.act = act; W.actMap = m; W.actN = W.tickN;
      let anyDead = false; for (const e of W.ents) if (e.dead && e !== W.player) { anyDead = true; break; }
      if (anyDead) W.ents = W.ents.filter((e) => !e.dead || e === W.player);
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
    if (m.prefetch) { const p = W.player; m.prefetch(cx, cy, v.w, v.h, 2.5, p ? p.vx : 0, p ? p.vy : 0); }
    // 물결 · 용암 빛
    const tx0 = Math.floor(cx / TS) - 1, ty0 = Math.floor(cy / TS) - 1, tx1 = Math.floor((cx + v.w) / TS) + 1, ty1 = Math.floor((cy + v.h) / TS) + 1;
    const TT = TL.T, ter = m.ter, mw = m.w;
    for (let ty = Math.max(0, ty0); ty <= Math.min(m.h - 1, ty1); ty++) for (let tx = Math.max(0, tx0); tx <= Math.min(mw - 1, tx1); tx++) {
      const t = ter[ty * mw + tx];
      if (t === TT.WATER || t === TT.DEEP || t === TT.LAVA) TL.waterFx(g, m, tx, ty, tx * TS - cx, ty * TS - cy, W.t);
    }
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
    if (G.fx && G.fx.drawGlow) G.fx.drawGlow(g, cx, cy);   // 마법 · 불 · 별빛은 어둠 위에서도 빛난다
    // 덧그림: 지역 날씨 장막 등 (빛 위에)
    if (W.overlays) for (const f of W.overlays) { try { f(g, cx, cy, v); } catch (err) { if (!W.ovErr) { W.ovErr = true; console.error('[overlay]', err); } } }
  }

  Object.assign(W, { load, add, remove, propBlock, awake, snap, update, render, shake, hitstop, slowmo });
  G.world = W;
})();
