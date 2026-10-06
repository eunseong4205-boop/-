/* 나타나고 사라지는 것 — 갑자기 순간 이동하거나 사라지지 않게
   예전: 장면이 사람을 지우면(dead) 다음 프레임에 그 자리에서 뚝 사라졌고, 새로 세우면(spawn) 빈 땅에 뚝 나타났다.
     걸어가다 막히면 0.6초 뒤 목적지로 순간 이동했고, 동료는 200픽셀 넘게 떨어지면 주인공 옆으로 순간 이동했다.
   이제
   · 화면 안에서 지워지는 사람: 걷던 사람은 걷던 쪽으로, 서 있던 사람은 주인공 반대쪽으로 몇 걸음 걸어 나가며 흐려진다
     (누운 · 앉은 · 빛으로 떠오른 모습은 그 자리에서 흐려진다). 같은 자리에 다른 모습(보스 → 사람)이 바로 서면 바꿔치기로 보고 그대로 둔다
   · 화면 안에 새로 세우는 사람: 몇 걸음 밖에서 걸어 들어온다. 방금 화면에서 사라진 같은 사람이 있으면 그 자리에서 걸어온다
   · 숨었다 나타나는 사람(hideIf): 흐려지며 숨고, 흐릿하다가 또렷해지며 나타난다
   · 그 밖에 장면이 화면 안의 사람을 한 번에 멀리 옮기면(20픽셀 넘게): 옛 자리에서 흐려지고 새 자리에서 또렷해진다
   암전(검은 화면) 중이거나 화면 밖이면 아무것도 하지 않는다 — 원래대로 바로 지우고 세운다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, E = G.ent;
  const W = () => G.world;

  /* ───────── 둘레 ───────── */
  let stageEl = null;
  function dark() {
    stageEl = stageEl || document.getElementById('stage');
    if (stageEl && stageEl.classList.contains('blackout')) return true;
    const f = document.getElementById('fade');
    return !!(f && parseFloat(f.style.opacity || '0') > 0.9);
  }
  function onScreen(e, pad) {
    const Wd = W(), v = Wd.view; pad = pad == null ? 12 : pad;
    const cx = Wd.rcx != null ? Wd.rcx : Wd.cam.x, cy = Wd.rcy != null ? Wd.rcy : Wd.cam.y;
    return e.x > cx - pad && e.x < cx + v.w + pad && e.y > cy - pad && e.y < cy + v.h + 30 + pad;
  }
  const ease = (k) => k * k * (3 - 2 * k);
  const POSED = new Set(['sit', 'lie', 'down', 'sleep', 'dead', 'faint', 'kneel', 'pray', 'cast', 'hold']);
  const posed = (e) => !!(e.forceAnim && e.forceAnim !== 'walk' && e.forceAnim !== 'idle') || POSED.has(e.state) || !!(e.look && e.look.kind) || !!e.drawFn || !!e.vision;

  /* 흐리게 그리기: 그림 함수가 스스로 globalAlpha를 1로 되돌리므로, 작은 화폭에 그린 뒤 그 화폭을 흐리게 옮긴다 */
  const CV = {};
  function scratch(n) {
    if (!CV[n]) { const c = document.createElement('canvas'); c.width = c.height = n; CV[n] = { c, g: c.getContext('2d') }; }
    return CV[n];
  }
  function drawFaded(g, e, fn, cx, cy, a, ox, oy) {
    if (a <= 0.02) return;
    const N = e.boss ? 256 : 128, AX = N >> 1, AY = N - 24, S = scratch(N);
    S.g.setTransform(1, 0, 0, 1, 0, 0); S.g.clearRect(0, 0, N, N); S.g.imageSmoothingEnabled = false;
    const bx = Math.round(e.x), by = Math.round(e.y);
    const ctx0 = W().ctx; W().ctx = S.g;   // 그림 함수가 W.ctx로 그리는 것(무기 등)도 화폭으로
    try { fn.call(e, S.g, bx - AX, by - AY); } finally { W().ctx = ctx0; }
    const ga = g.globalAlpha; g.globalAlpha = ga * Math.min(1, a);
    g.drawImage(S.c, bx - cx + Math.round(ox || 0) - AX, by - cy + Math.round(oy || 0) - AY);
    g.globalAlpha = ga;
  }

  /* ───────── 사라지는 모습 ───────── */
  class Fade {
    constructor(src, o) {
      this.kind = 'fadeout'; this.src = src; this.alive = !!o.alive; this.t = 0; this.life = o.life || 0.5;
      this.vx = o.vx || 0; this.vy = o.vy || 0; this.hold = o.hold || 0;
      this.x = src.x; this.y = src.y; this.ox = 0; this.oy = 0; this.keepAwake = true; this.sortBias = src.sortBias || 0;
      this.drawFn = src.draw; this.shadowFn = src.drawShadow || null;
      this.ws = (src.walkT || 0);
    }
    update(dt) {
      this.t += dt;
      const s = this.src;
      if (this.t >= this.life || (this.alive && !s.hidden && !this.moved)) { this.dead = true; return; }
      if (!this.alive) s.t = (s.t || 0) + dt;
      if ((this.vx || this.vy) && !this.alive) {
        const m = W().map;
        const r = m ? E.move(m, s, this.vx * dt, this.vy * dt) : null;
        if (!m) { s.x += this.vx * dt; s.y += this.vy * dt; }
        if (r && (r.hitX || r.hitY)) this.life = Math.min(this.life, this.t + 0.18);   // 막히면 빨리 흐려진다
        s.state = 'walk'; s.walkT = (s.walkT || 0) + dt * Math.hypot(this.vx, this.vy) / 46; s.dir = U.dir4(this.vx, this.vy, s.dir);
        s.forceAnim = null; s.vx = this.vx; s.vy = this.vy;
        this.x = s.x; this.y = s.y;
      }
    }
    alpha() { const k = this.t / this.life; return k < this.hold ? 1 : 1 - ease((k - this.hold) / (1 - this.hold)); }
    drawShadow(g, cx, cy) {
      if (!this.shadowFn) return;
      const ga = g.globalAlpha; g.globalAlpha = ga * this.alpha() * 0.9;
      const s = this.src, sx = s.x, sy = s.y; s.x = this.x; s.y = this.y;
      try { this.shadowFn.call(s, g, cx, cy); } finally { s.x = sx; s.y = sy; g.globalAlpha = ga; }
    }
    draw(g, cx, cy) {
      const s = this.src;
      drawFaded(g, s, this.drawFn, cx, cy, this.alpha(), this.x - s.x, this.y - s.y);
    }
  }

  /** 화면 안의 존재 하나가 막 지워졌다 (world.js가 거르기 직전에 부른다) */
  const recent = [];   // { cid, name, x, y, t }
  function touchRecent(e) {
    const t = W().t;
    while (recent.length && t - recent[0].t > 2) recent.shift();
    recent.push({ cid: e.cid || null, name: e.name || null, x: e.x, y: e.y, t });
  }
  /** 바로 그 자리에 다른 모습이 서 있다 (보스 → 사람, 사람 → 보스) */
  function swapHere(e) {
    for (const o of W().ents) {
      if (o === e || o.dead || o.hidden || !o.draw || o === W().player || o.kind === 'fadeout') continue;
      if (!(o.npc || o.boss || o.foe)) continue;
      if (Math.abs(o.x - e.x) < 10 && Math.abs(o.y - e.y) < 10) return true;
    }
    return false;
  }
  W().onGone = function (e, born) {
    if (e.kind === 'fadeout' || e._noFade || e.noFade) return;
    const person = e.npc && e.draw;
    // 장면 · 보스의 쓰러짐이 거둔 적 (쓰러뜨린 것 · 구덩이에 빠진 것이 아님). 오락기 방의 놀이는 원래대로 바로
    const Wd = W(), lifted = (e.foe || e.boss) && e.draw && e.hp > 0 && !e.dying && G.script.busy && !(Wd.map && Wd.map.id === 'arcade_room');
    if (!person && !lifted) return;
    if (e.hidden || dark() || !onScreen(e) || Wd.map !== loadMap || Wd.t - loadT < 0.3) { if (person) touchRecent(e); return; }
    if (person) touchRecent(e);
    if (swapHere(e)) return;
    const p = W().player;
    const v = Math.hypot(e.vx || 0, e.vy || 0);
    let o;
    if (e.leaving) o = { vx: e.leaving.vx, vy: e.leaving.vy, life: 0.55, hold: 0 };
    else if (person && e.state === 'walk' && v > 5) { const sp = Math.min(60, v); o = { vx: e.vx / v * sp, vy: e.vy / v * sp, life: 0.6, hold: 0.15 }; }
    else if (person && !posed(e) && p) {
      // 서 있던 사람: 주인공 반대쪽으로 몇 걸음
      let [nx, ny] = U.norm(e.x - p.x || (Math.random() - 0.5), e.y - p.y || 0.01);
      if (Math.hypot(e.x - p.x, e.y - p.y) > 150) { const dv = U.DV[e.dir] || [0, 1]; nx = dv[0]; ny = dv[1]; }
      o = { vx: nx * 44, vy: ny * 36, life: 0.75, hold: 0.25 };
    } else o = { life: e.vision ? 0.6 : 0.45, hold: 0.1 };
    if (lifted) { o.vx = o.vy = 0; o.life = 0.4; if (G.fx) G.fx.dust(e.x, e.y, 4); }
    born.push(new Fade(e, o));
  };

  /* ───────── 나타나는 모습 ───────── */
  function wrap(e) {
    if (e._pres) return;
    const own = { draw: Object.prototype.hasOwnProperty.call(e, 'draw'), shadow: Object.prototype.hasOwnProperty.call(e, 'drawShadow') };
    const d0 = e.draw, s0 = e.drawShadow;
    e._pres = { own, d0, s0 };
    e.draw = function (g, cx, cy) {
      const P = this._enter; if (!P) { d0.call(this, g, cx, cy); return; }
      const k = Math.min(1, P.t / P.dur), q = 1 - ease(k), ox = P.ox * q, oy = P.oy * q;
      const a = P.fade ? Math.min(1, 0.1 + k * 1.1) : P.far ? 1 : Math.min(1, 0.25 + k * 2.2);
      // 걸어 들어오는 동안은 걷는 모습으로 (그림에만 — 존재의 상태는 그대로)
      const st = this.state, dir = this.dir, wt = this.walkT, fa = this.forceAnim;
      if (!P.fade && k < 1) { this.state = 'walk'; this.forceAnim = null; this.dir = U.dir4(-P.ox, -P.oy, this.dir); this.walkT = P.t * 1.6; }
      try { drawFaded(g, this, d0, cx, cy, a, ox, oy); } finally { this.state = st; this.dir = dir; this.walkT = wt; this.forceAnim = fa; }
    };
    if (s0) e.drawShadow = function (g, cx, cy) {
      const P = this._enter; if (!P) { s0.call(this, g, cx, cy); return; }
      const k = Math.min(1, P.t / P.dur), q = 1 - ease(k);
      const ga = g.globalAlpha; g.globalAlpha = ga * (P.fade ? k : 1);
      try { s0.call(this, g, cx - P.ox * q, cy - P.oy * q); } finally { g.globalAlpha = ga; }
    };
  }
  function unwrap(e) {
    const R = e._pres; if (!R) return;
    if (R.own.draw) e.draw = R.d0; else delete e.draw;
    if (R.own.shadow) e.drawShadow = R.s0; else delete e.drawShadow;
    e._pres = null; e._enter = null;
  }
  const entering = new Set();
  function start(e, P) { if (!e.draw) return; wrap(e); e._enter = Object.assign({ t: 0 }, P); entering.add(e); }
  function fadeIn(e, dur) { start(e, { ox: 0, oy: 0, dur: dur || 0.4, fade: true }); }
  /** (ox, oy)만큼 떨어진 곳에서 걸어 들어온다 — 존재의 자리는 처음부터 목적지(장면이 그 자리를 바로 쓰도록), 그림만 걸어온다 */
  function walkIn(e, ox, oy, far) { const d = Math.hypot(ox, oy); if (d < 3) return; start(e, { ox, oy, dur: U.clamp(d / 70, 0.35, 1.8), far: !!far }); }

  let loadMap = null, loadT = 0;
  function freeLine(m, e, x0, y0, x1, y1) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
    for (let i = 0; i <= n; i++) { const x = U.lerp(x0, x1, i / n), y = U.lerp(y0, y1, i / n); if (!m.boxFree(x - 4, y - 5, 8, 5, e.z || 0, e)) return false; }
    return true;
  }
  /** 장면이 화면 안에 사람을 세웠다 (script.js의 spawn · arrive가 부른다) */
  function enter(e, o) {
    o = o || {};
    const Wd = W(), m = Wd.map, p = Wd.player;
    if (!e || e.dead || !m || o.noEnter || e.noEnter || dark() || !onScreen(e, 4)) return;
    if (Wd.map !== loadMap || Wd.t - loadT < 0.3) return;   // 막 들어선 지도 (들어서는 장면이 세우는 사람)
    // 바꿔치기: 방금 이 자리에 다른 모습이 있었다 (보스가 쓰러지고 그 사람이 선다)
    for (const o2 of Wd.ents) if (o2 !== e && o2.dead && (o2.npc || o2.boss || o2.foe) && Math.abs(o2.x - e.x) < 12 && Math.abs(o2.y - e.y) < 12) return;
    for (let i = recent.length - 1; i >= 0; i--) { const r = recent[i]; if (Wd.t - r.t < 0.4 && Math.abs(r.x - e.x) < 12 && Math.abs(r.y - e.y) < 12) return; }
    // 같은 사람이 방금(1.5초 안에) 화면 어딘가에 있었다: 그 자리에서 걸어온다
    if (e.cid) {
      let from = null;
      // 이번 프레임에 지워진 같은 사람(곁에 불러 세운 사람을 장면이 다시 세울 때 등): 그 자리에서 걸어온다, 지워진 쪽은 흐려지지 않는다
      for (const o2 of Wd.ents) if (o2 !== e && o2.dead && o2.npc && o2.cid === e.cid && onScreen(o2)) { from = { x: o2.x, y: o2.y }; o2._noFade = true; break; }
      if (!from) for (let i = recent.length - 1; i >= 0; i--) { const r = recent[i]; if (r.cid === e.cid && Wd.t - r.t < 1.5) { from = r; break; } }
      if (!from) for (const o2 of Wd.ents) if (o2 !== e && o2.npc && o2.cid === e.cid && !o2.dead && !o2.hidden && o2.walker && onScreen(o2)) { from = { x: o2.x, y: o2.y }; o2._swapT = Wd.t; break; }
      if (from) { const d = U.dist(from.x, from.y, e.x, e.y); if (d < 4) return; if (d < 200 && !posed(e)) { walkIn(e, from.x - e.x, from.y - e.y, true); return; } }
    }
    if (posed(e)) { fadeIn(e, 0.45); return; }
    // 몇 걸음 밖에서 걸어 들어온다: 주인공 반대쪽(뒤에서 다가오듯), 막혔으면 옆 · 다른 쪽
    let base = p ? Math.atan2(e.y - p.y, e.x - p.x) : Math.PI / 2;
    if (p && Math.hypot(e.x - p.x, e.y - p.y) < 6) { const dv = U.DV[e.dir] || [0, 1]; base = Math.atan2(-dv[1], -dv[0]); }
    const D = 40;
    for (const da of [0, 0.7, -0.7, 1.4, -1.4, Math.PI]) {
      const a = base + da, ox = Math.cos(a) * D, oy = Math.sin(a) * D * 0.8;
      if (freeLine(m, e, e.x + ox, e.y + oy, e.x, e.y)) { walkIn(e, ox, oy); return; }
    }
    fadeIn(e, 0.4);
  }

  /* ───────── 매 프레임: 걸어 들어오기 · 숨기 · 갑자기 옮겨진 사람 ───────── */
  function tick(dt) {
    const Wd = W(), m = Wd.map;
    if (!m) return;
    if (m !== loadMap) { loadMap = m; loadT = Wd.t; for (const e of entering) unwrap(e); entering.clear(); recent.length = 0; }
    for (const e of entering) {
      if (e.dead || !e._enter) { unwrap(e); entering.delete(e); continue; }
      e._enter.t += dt;
      if (e._enter.t >= e._enter.dur) { unwrap(e); entering.delete(e); }
    }
    const isDark = dark(), justLoaded = Wd.t - loadT < 0.3;
    const list = Wd.awake ? Wd.awake() : Wd.ents;
    const born = [];
    for (const e of list) {
      if (!e.npc || e.dead || e === Wd.player || e.follower) continue;
      const vis = onScreen(e);
      // 숨었다 · 나타났다
      if (e._ph !== undefined && e._ph !== !!e.hidden && vis && !isDark && !justLoaded) {
        if (e.hidden) { if (!(e._swapT && Wd.t - e._swapT < 1)) born.push(new Fade(e, { alive: true, life: 0.45, hold: 0.1 })); }
        else fadeIn(e, 0.45);
      }
      e._ph = !!e.hidden;
      // 한 번에 멀리 옮겨졌다 (장면의 자리 바꾸기)
      if (e._lx !== undefined && !e.hidden && vis && !isDark && !justLoaded && !e._enter && !e.noClip && (Math.abs(e.x - e._lx) > 20 || Math.abs(e.y - e._ly) > 20)) {
        const f = new Fade(e, { alive: true, life: 0.35, hold: 0 }); f.x = e._lx; f.y = e._ly; f.moved = true; born.push(f);
        fadeIn(e, 0.35);
      }
      e._lx = e.x; e._ly = e.y;
    }
    for (const b of born) Wd.ents.push(b);
  }
  /* 조작을 막지 않고 걸어가기 (이야기가 바뀌어 사람의 자리가 바뀔 때) */
  const goers = new Map();
  function walkTo(e, x, y, dir) { e.script = true; goers.set(e, { x, y, dir, stuck: 0, way: null, wi: 0, tried: false, ghost: false, map: W().map, t: 0 }); }
  function tickGoers(dt) {
    for (const [e, g] of goers) {
      const m = W().map;
      g.t += dt;
      if (e.dead || m !== g.map || g.t > 20) { e.script = false; goers.delete(e); continue; }
      if (e.busy || G.script.running) { e.state = 'idle'; continue; }   // 말하는 중 · 장면 중에는 기다린다
      const d = U.dist(e.x, e.y, g.x, g.y);
      if (d < 1.5) { e.x = g.x; e.y = g.y; e.state = 'idle'; e.vx = e.vy = 0; e.script = false; e.dir = e.baseDir = g.dir || e.dir; E.settle(m, e); goers.delete(e); continue; }
      let gx = g.x, gy = g.y;
      if (g.way) { while (g.wi < g.way.length - 1 && U.dist(e.x, e.y, g.way[g.wi][0], g.way[g.wi][1]) < 2) g.wi++; gx = g.way[g.wi][0]; gy = g.way[g.wi][1]; }
      const [nx, ny] = U.norm(gx - e.x, gy - e.y), sp = 40, step = Math.min(U.dist(e.x, e.y, gx, gy), sp * dt), ox = e.x, oy = e.y;
      if (g.ghost) { e.x += nx * step; e.y += ny * step; } else E.move(m, e, nx * step, ny * step);
      if (U.dist(ox, oy, e.x, e.y) < step * 0.2) { g.stuck += dt; if (g.stuck > 0.45) { g.stuck = 0; if (!g.tried) { g.tried = true; g.way = pathAround(m, e, g.x, g.y); g.wi = 0; if (!g.way || !g.way.length) { g.way = null; g.ghost = true; } } else g.ghost = true; } } else g.stuck = 0;
      e.dir = U.dir4(nx, ny, e.dir); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt * sp / 46; e.vx = nx * sp; e.vy = ny * sp;
    }
  }

  const up0 = W().update;
  W().update = function (dt) { up0.call(this, dt); if (this.paused) return; try { tick(dt); tickGoers(dt); } catch (err) { if (!tick.err) { tick.err = 1; console.error('[presence]', err); } } };

  /* ───────── 막혀도 순간 이동하지 않는 걸음 ───────── */
  /** 칸 위의 가장 짧은 길 (막힌 칸을 돌아간다). 못 찾으면 null */
  function pathAround(m, e, x, y) {
    const TS = G.tiles.TS;
    const sx = Math.floor(e.x / TS), sy = Math.floor((e.y - 2) / TS), gx = Math.floor(x / TS), gy = Math.floor((y - 2) / TS);
    const R = Math.max(10, Math.abs(gx - sx) + Math.abs(gy - sy) + 8);
    const x0 = Math.min(sx, gx) - R, y0 = Math.min(sy, gy) - R, w = Math.abs(gx - sx) + 2 * R + 1, h = Math.abs(gy - sy) + 2 * R + 1;
    if (w * h > 9000) return null;
    const prev = new Int32Array(w * h).fill(-1), seen = new Uint8Array(w * h);
    const ok = (tx, ty) => m.inb(tx, ty) && m.boxFree(tx * TS + 8 - (e.bw || 8) / 2, ty * TS + 12 - (e.bh || 5), e.bw || 8, e.bh || 5, e.z || 0, e);
    const q = [(sy - y0) * w + (sx - x0)]; seen[q[0]] = 1;
    const goal = (gy - y0) * w + (gx - x0);
    let hit = -1;
    for (let h0 = 0; h0 < q.length; h0++) {
      const i = q[h0]; if (i === goal) { hit = i; break; }
      const ix = i % w, iy = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = ix + dx, ny = iy + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx; if (seen[j]) continue; seen[j] = 1;
        if (j !== goal && !ok(nx + x0, ny + y0)) continue;
        prev[j] = i; q.push(j);
      }
    }
    if (hit < 0) return null;
    const pts = [];
    for (let i = hit; i >= 0 && prev[i] >= 0; i = prev[i]) pts.push([(i % w + x0) * TS + 8, (((i / w) | 0) + y0) * TS + 12]);
    pts.reverse();
    if (pts.length) pts[pts.length - 1] = [x, y];
    return pts;
  }

  G.presence = { enter, fadeIn, walkIn, walkTo, drawFaded, dark, onScreen, pathAround, Fade, posed };
})();
