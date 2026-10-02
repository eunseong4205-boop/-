/* 던전 다시 짓기 — 흐름 · 보스 · 보상 · 비밀
   · 흐름: 큰 열쇠는 다시 본 던전 안에(깊은 구역 끝까지 갔다가 되돌아오던 것). 별관 · 깊은 구역은 곁가지 — 끝에는 보물과 들어온 곳으로 돌아가는 지름길
   · 모든 던전에 보스: 고원 굴 열 곳에 굴의 주인(바위 거인 · 도깨비불 · 갑옷 집게 · 설인 · 고철 파수꾼)과 큰 열쇠 문
   · 보스 패턴: 보스마다 제 공격에 더해 그 보스다운 공격 셋(나선 · 고리 · 낙하 · 내리찍기 · 돌진 · 줄기 · 추적 · 십자 · 부하 · 지진)이
     체력 ¾ · ½ · ¼에서 하나씩 더 열리고, ¼ 아래에서는 몸부림(두 가지를 겹쳐서)
   · 보스 체력을 위험도 곡선에 맞춘다 (같은 위험도인데 셋 배 차이 나던 것)
   · 보상: 위험도마다 상자의 등급 상한(★0~1 고급 · ~3 희귀 · ~6 영웅 · 그 위 전설), 같은 보물이 두 곳에서 나오지 않게, 물약 · 화살 · 폭탄 상자는 항아리로
   · 비밀: 금 간 벽은 가까이 가야 보이고(등불을 들면 멀리서도), 조각 하트는 벽에 숨은 눈을 쏘아야 상자가 나온다. 고원 굴엔 폭탄으로 여는 숨은 방 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent, X = G.gfx;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const BS = G.bosses, B = BS.B, DUN = G.dungeon.DUN, D = G.data;
  const C = () => G.combat;
  const { shoot, aim, warnCircle, warnRect, hitCircle, hitRect, roomRect, minion } = BS;

  /* ═════════ 보스 공격 모음 ═════════
     fn(e, dt, Wd, X) — X는 그 공격의 기억. 끝나면 true */
  const orb = (e, a, sp, o) => shoot(Object.assign({ kind: 'orb', x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: e.atk, col: e.col, r: 4, life: 3 }, o || {}));
  const tierOf = (e) => (e.dunId && DUN[e.dunId] && DUN[e.dunId].tier) || 3;
  const sp0 = (e) => 85 + tierOf(e) * 5;
  const LIB = {
    spiral: { name: '나선', fn(e, dt, Wd, X) { X.a = (X.a || Math.random() * 6) + dt * (e.phase3 ? 5.2 : 4); X.k = (X.k || 0) - dt; if (X.k <= 0) { X.k = 0.11; const arms = e.phase2 ? 3 : 2; for (let i = 0; i < arms; i++) orb(e, X.a + i * Math.PI * 2 / arms, sp0(e) * 0.9); sfx('foeshot'); } return e.stT > 1.7; } },
    nova: { name: '고리', fn(e, dt, Wd, X) {
      if (!X.n) { X.n = 0; X.k = 0.45; e.telegraph && e.telegraph(0.45); }
      X.k -= dt; if (X.k <= 0 && X.n < (e.phase2 ? 2 : 1)) { X.k = 0.55; X.n++; const p = Wd.player, gapA = aim(e, p) + Math.PI + (Math.random() - 0.5), N = 22; for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; if (Math.abs(U.angDiff(a, gapA)) < 0.42) continue; orb(e, a, sp0(e) * 0.8); } G.fx.ring(e.x, e.y - e.h / 2, e.col, 24, 0.3, 2); sfx('magic'); }
      return e.stT > 1.4; } },
    rain: { name: '낙하', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; const p = Wd.player, rr = roomRect(e), n = e.phase2 ? 7 : 5; for (let i = 0; i < n; i++) { const x = U.clamp(p.x + (Math.random() - 0.5) * 120, rr.x0, rr.x1), y = U.clamp(p.y + (Math.random() - 0.5) * 90, rr.y0, rr.y1); const dl = 0.8 + i * 0.12; C().after(i * 0.12, () => warnCircle(x, y, 13, 0.8, function () { hitCircle(this.x, this.y, 15, e.atk); G.fx.shards(this.x, this.y - 4, 8, e.col); G.fx.dust(this.x, this.y, 4); sfx('rock'); })); void dl; } sfx('rumble'); }
      return e.stT > 1.8; } },
    slam: { name: '내리찍기', fn(e, dt, Wd, X) {
      const p = Wd.player;
      if (!X.go) { X.go = true; X.x0 = e.x; X.y0 = e.y; X.tx = p.x; X.ty = p.y; const rr = roomRect(e); X.tx = U.clamp(X.tx, rr.x0, rr.x1); X.ty = U.clamp(X.ty, rr.y0, rr.y1); warnCircle(X.tx, X.ty, 28, 0.85); sfx('jump'); }
      const k = Math.min(1, e.stT / 0.85);
      e.x = U.lerp(X.x0, X.tx, k); e.y = U.lerp(X.y0, X.ty, k); e.jz = Math.sin(k * Math.PI) * 30;
      if (k >= 1 && !X.landed) { X.landed = true; e.jz = 0; hitCircle(e.x, e.y, 28, e.atk + 1); W().shake(5, 0.3); G.fx.dust(e.x, e.y, 16); G.fx.ring(e.x, e.y, e.col, 34, 0.4, 3); sfx('impact'); const n = e.phase2 ? 12 : 8; for (let i = 0; i < n; i++) orb(e, i / n * Math.PI * 2, sp0(e) * 0.75, { y: e.y - 6 }); }
      return e.stT > 1.3; } },
    charge: { name: '돌진', fn(e, dt, Wd, X) {
      const p = Wd.player;
      if (!X.go) { X.go = true; X.a = aim(e, p, 8); const L = 200; warnRect(Math.min(e.x, e.x + Math.cos(X.a) * L) - 8, Math.min(e.y, e.y + Math.sin(X.a) * L) - 8, Math.abs(Math.cos(X.a) * L) + 16, Math.abs(Math.sin(X.a) * L) + 16, 0.6); X.nc = e.noContact; sfx('growl'); }
      if (e.stT > 0.6 && e.stT < 1.35) {
        e.noContact = false;
        const r = E.move(Wd.map, e, Math.cos(X.a) * 260 * dt, Math.sin(X.a) * 260 * dt);
        if (Math.random() < 0.5) G.fx.dust(e.x, e.y, 1);
        const rr = roomRect(e); if (r.hitX || r.hitY || e.x < rr.x0 || e.x > rr.x1 || e.y < rr.y0 || e.y > rr.y1) { BS.clampRoom(e); if (!X.bonk) { X.bonk = true; W().shake(3, 0.2); sfx('impact'); e.stT = Math.max(e.stT, 1.35); if (e.phase2) for (let i = 0; i < 6; i++) orb(e, i / 6 * Math.PI * 2, sp0(e) * 0.7); } }
        if (U.dist(e.x, e.y - e.h / 2, p.x, p.y - 8) < e.r + 6) C().hurtPlayer(p, e.atk, e, {});
      }
      if (e.stT >= 1.5) { e.noContact = X.nc; return true; }
      return false; } },
    sweep: { name: '줄기', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; const rr = roomRect(e), horiz = Math.random() < 0.5, n = 4, gap = Math.floor(Math.random() * n);
        for (let i = 0; i < n; i++) { if (i === gap) continue; if (horiz) { const h = (rr.y1 - rr.y0) / n, y = rr.y0 + i * h; warnRect(rr.x0 - 16, y, rr.x1 - rr.x0 + 32, h - 4, 1.0, function () { hitRect(this.x, this.y, this.w, this.h, e.atk); for (let k = 0; k < 6; k++) G.fx.sparks(this.x + Math.random() * this.w, this.y + this.h / 2, 2, e.col, 60); }); } else { const w = (rr.x1 - rr.x0) / n, x = rr.x0 + i * w; warnRect(x, rr.y0 - 16, w - 4, rr.y1 - rr.y0 + 32, 1.0, function () { hitRect(this.x, this.y, this.w, this.h, e.atk); for (let k = 0; k < 6; k++) G.fx.sparks(this.x + this.w / 2, this.y + Math.random() * this.h, 2, e.col, 60); }); } }
        sfx('charge'); }
      if (e.stT > 1.0 && !X.boom) { X.boom = true; W().shake(3, 0.2); sfx('beam'); }
      return e.stT > 1.5; } },
    homing: { name: '추적', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; const p = Wd.player, n = e.phase2 ? 4 : 3; for (let i = 0; i < n; i++) { const a = aim(e, p) + (i - (n - 1) / 2) * 0.7; shoot({ kind: 'orb', x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, dmg: e.atk, col: e.col, r: 5, life: 3.6, homing: 0.55, target: p, blockable: true }); } sfx('magic'); G.fx.ring(e.x, e.y - e.h / 2, e.col, 18, 0.3, 2); }
      return e.stT > 1.2; } },
    cross: { name: '십자', fn(e, dt, Wd, X) { X.k = (X.k || 0) - dt; X.n = X.n || 0; if (X.k <= 0 && X.n < 3) { X.k = 0.35; const off = X.n % 2 ? Math.PI / 8 : 0; for (let i = 0; i < 8; i++) orb(e, off + i * Math.PI / 4, sp0(e)); X.n++; sfx('foeshot'); } return e.stT > 1.3; } },
    summon: { name: '부하', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; const alive = Wd.ents.filter((m) => m.minion && !m.dead).length; if (alive < 3) { const rr = roomRect(e), pool = e.minions || ['bat', 'slime']; for (let i = 0; i < 2; i++) { const t = pool[i % pool.length]; if (G.foes.T[t]) minion(e, t, U.clamp(e.x + (i ? 30 : -30), rr.x0, rr.x1), U.clamp(e.y + 10, rr.y0, rr.y1)); } } sfx('growl'); }
      return e.stT > 0.9; } },
    quake: { name: '지진', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; W().shake(2, 0.6); sfx('rumble'); for (let d = 0; d < 4; d++) { const a = d * Math.PI / 2 + (e.phase2 ? Math.PI / 4 : 0); for (let i = 1; i <= 6; i++) { const x = e.x + Math.cos(a) * i * 22, y = e.y + Math.sin(a) * i * 17; C().after(i * 0.12, () => warnCircle(x, y, 11, 0.5, function () { hitCircle(this.x, this.y, 13, e.atk); G.fx.dust(this.x, this.y, 5); G.fx.part({ x: this.x, y: this.y, z: 0, vz: 80, g: 300, life: 0.4, col: '#a8784a', size: 2 }); })); } } }
      return e.stT > 1.6; } },
    blink: { name: '순간 이동', fn(e, dt, Wd, X) {
      if (!X.go) { X.go = true; G.fx.glow(e.x, e.y - e.h / 2, e.col, 12, 30); const rr = roomRect(e), p = Wd.player; let bx = e.x, by = e.y; for (let t = 0; t < 8; t++) { const x = U.lerp(rr.x0, rr.x1, Math.random()), y = U.lerp(rr.y0, rr.y1, Math.random()); if (U.dist(x, y, p.x, p.y) > 70) { bx = x; by = y; break; } } e.x = bx; e.y = by; sfx('warp'); G.fx.ring(e.x, e.y - e.h / 2, e.col, 20, 0.3, 2); }
      if (e.stT > 0.35 && !X.shot) { X.shot = true; const p = Wd.player; for (let i = -2; i <= 2; i++) orb(e, aim(e, p) + i * 0.22, sp0(e) * 1.1); sfx('foeshot'); }
      return e.stT > 0.8; } },
  };
  /* 보스마다: 제 공격에 더하는 셋 (¾ · ½ · ¼에서 하나씩), 부하 */
  const EXTRA = {
    thornqueen: { list: ['rain', 'spiral', 'summon'], minions: ['plant', 'slime'], col: '#a8e86a' },
    moleking: { list: ['quake', 'rain', 'charge'], minions: ['bat'] },
    salamander: { list: ['spiral', 'charge', 'nova'] },
    kraken: { list: ['spiral', 'homing', 'summon'], minions: ['crab', 'bat'] },
    sphinx: { list: ['sweep', 'nova', 'rain'] },
    mirror: { list: ['cross', 'blink', 'homing'] },
    roc: { list: ['rain', 'charge', 'nova'] },
    frost: { list: ['rain', 'quake', 'nova'] },
    hollowking: { list: ['summon', 'homing', 'spiral'], minions: ['skel', 'wraith'] },
    core: { list: ['sweep', 'cross', 'homing'], minions: ['drone'] },
    echogiant: { list: ['nova', 'charge', 'spiral'], minions: ['bat'] },
    swampqueen: { list: ['rain', 'homing', 'quake'], minions: ['crab', 'spider'] },
    forgotking: { list: ['homing', 'summon', 'sweep'], minions: ['skel', 'wraith'] },
    toadstar: { list: ['slam', 'rain', 'nova'] },
    lvslime: { list: ['slam', 'nova', 'summon'], minions: ['slime'] },
    trialshade: { list: ['cross', 'blink', 'sweep'] },
  };
  const SAFE = new Set(['idle']);
  function inject(id, X0) {
    const Dd = B[id]; if (!Dd || Dd._inj) return; Dd._inj = true;
    const ai0 = Dd.ai, init0 = Dd.init;
    Dd.init = function (e) { if (init0) init0.apply(this, arguments); e.xList = X0.list; e.minions = X0.minions; e.xCool = 4; if (X0.col) e.xcol = X0.col; };
    Dd.ai = function (e, dt, Wd) {
      // 체력 ¾ · ½ · ¼: 하나씩 열린다 · ¼ 아래 몸부림
      const hp = e.hp / e.maxHp;
      if (!e.phase3 && hp <= 0.25) { e.phase3 = true; e.xCool = 0; sfx('growl'); W().shake(5, 0.6); G.fx.ring(e.x, e.y - e.h / 2, '#ff5a7a', 60, 0.6, 3); if (G.ui) G.ui.toast(e.name + ' — 필사적으로 몸부림친다!', 'bad'); }
      const open = hp <= 0.25 ? 3 : hp <= 0.5 ? 2 : hp <= 0.75 ? 1 : 0;
      if (e.xp) {
        const P = LIB[e.xp.id];
        let done = false;
        try { done = P.fn(e, dt, Wd, e.xp); } catch (err) { console.error('[boss pattern]', e.xp.id, err); done = true; }
        if (e.xp.twin && !e.xp.twinDone) { try { if (LIB[e.xp.twin].fn(e, dt, Wd, e.xp.tx)) e.xp.twinDone = true; } catch (_) { e.xp.twinDone = true; } }
        if (done && (!e.xp.twin || e.xp.twinDone || e.stT > 3)) { e.xp = null; e.jz = 0; e.set('idle'); e.xCool = e.phase3 ? 3.2 : e.phase2 ? 4.8 : 6.5; }
        return;
      }
      if (e.xCool > 0) e.xCool -= dt;
      if (open > 0 && e.xCool <= 0 && SAFE.has(e.st) && !e.under && !(e.stunT > 0) && !e.vulnerable && !e.dying) {
        const avail = e.xList.slice(0, open);
        const id2 = avail[(e.xn = (e.xn || 0) + 1) % avail.length];
        e.set('x_' + id2); e.xp = { id: id2 };
        if (e.phase3 && avail.length >= 2) { const other = avail.filter((k) => k !== id2 && k !== 'slam' && k !== 'charge' && k !== 'blink')[0]; if (other && id2 !== 'slam' && id2 !== 'charge' && id2 !== 'blink') { e.xp.twin = other; e.xp.tx = {}; } }
        if (G.fx) G.fx.float(e.x, e.y - e.h - 14, LIB[id2].name, '#ffb0c0', { life: 0.6 });
        return;
      }
      return ai0.apply(this, arguments);
    };
    // 그림: 몸부림 중에는 붉은 빛
    const over0 = Dd.over;
    Dd.over = function (e, g, cx, cy) { if (over0) over0.apply(this, arguments); if (e.phase3 && !e.dying) { g.save(); g.globalAlpha = 0.25 + Math.sin(e.t * 12) * 0.12; g.strokeStyle = '#ff5a7a'; g.lineWidth = 2; g.beginPath(); g.ellipse(Math.round(e.x - cx), Math.round(e.y - cy - 1), e.r + 4, (e.r + 4) * 0.4, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } };
  }
  for (const id in EXTRA) inject(id, EXTRA[id]);

  /* ═════════ 보스 체력: 위험도 곡선 ═════════ */
  const HP_T = (t) => Math.round(42 + t * 24 + t * t * 1.2);
  const BOSS_TIER = { thornqueen: 0, moleking: 1, kraken: 2, sphinx: 3, mirror: 4, roc: 5, frost: 6, hollowking: 7, core: 10, echogiant: 4, swampqueen: 6, trialshade: 8, forgotking: 8, toadstar: 6, lvslime: 10 };
  for (const [id, t] of Object.entries(BOSS_TIER)) { const Dd = B[id]; if (!Dd) continue; const k = U.clamp(HP_T(t) / Dd.hp, 0.7, 1.4); Dd.hp = Math.round(Dd.hp * k); Dd.atk = Math.max(Dd.atk, Math.round(3 + t * 0.45)); }

  /* ═════════ 굴의 주인 — 고원 굴 열 곳의 보스 ═════════ */
  const art = BS.art, R = BS.R, OUT = '#140c1c';
  const KIND = {
    golem: {
      hp: 1, r: 18, h: 40, speed: 26, pat: ['slam', 'rain', 'quake', 'charge'],
      paint(c) { return art('gg_golem' + c.col + c.acc, 46, 46, (b) => { const r = R(c.col); b.ellipse(23, 30, 17, 14, r[1]); b.ellipse(23, 28, 15, 12, r[2]); b.ellipse(23, 14, 9, 8, r[2]); b.ellipse(23, 13, 7, 6, r[3]); b.ellipse(7, 30, 6, 9, r[1]); b.ellipse(39, 30, 6, 9, r[1]); b.ellipse(7, 38, 5, 4, r[2]); b.ellipse(39, 38, 5, 4, r[2]); b.rect(18, 13, 3, 2, c.eye); b.rect(26, 13, 3, 2, c.eye); for (let i = 0; i < 9; i++) b.px(12 + (i * 7) % 22, 22 + (i * 5) % 14, c.acc); for (let i = 0; i < 5; i++) b.px(16 + i * 3, 9 + (i % 2), c.acc); b.rect(16, 40, 5, 4, r[0]); b.rect(25, 40, 5, 4, r[0]); }); },
    },
    wisp: {
      hp: 0.85, r: 14, h: 34, speed: 50, fly: true, pat: ['spiral', 'homing', 'blink', 'nova'],
      paint(c) { return art('gg_wisp' + c.col, 34, 40, (b) => { const r = R(c.col); b.ellipse(17, 24, 11, 13, r[2]); b.ellipse(17, 22, 8, 10, r[3]); b.ellipse(17, 20, 5, 6, '#ffffff'); b.rect(13, 19, 2, 3, OUT); b.rect(20, 19, 2, 3, OUT); for (let i = 0; i < 5; i++) b.ellipse(10 + i * 3.5, 10 - (i % 2) * 3, 2, 4, r[3]); b.ellipse(17, 36, 6, 3, r[1]); }); },
      over(e, g, cx, cy) { for (let i = 0; i < 4; i++) { const a = e.t * 2.4 + i * Math.PI / 2, x = Math.round(e.x - cx + Math.cos(a) * 20), y = Math.round(e.y - cy - 22 + Math.sin(a) * 10); g.globalAlpha = 0.85; g.fillStyle = e.col; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 2, 2); g.globalAlpha = 1; } },
    },
    crab: {
      hp: 1.05, r: 20, h: 28, speed: 44, pat: ['charge', 'cross', 'rain', 'summon'], minions: ['crab'],
      paint(c) { return art('gg_crab' + c.col, 52, 34, (b) => { const r = R(c.col); b.ellipse(26, 22, 16, 10, r[1]); b.ellipse(26, 20, 14, 8, r[2]); for (let i = 0; i < 4; i++) { b.line(12, 24 + i * 2, 4 - i, 30 + i, r[0]); b.line(40, 24 + i * 2, 48 + i, 30 + i, r[0]); } b.ellipse(7, 12, 7, 6, r[2]); b.ellipse(45, 12, 7, 6, r[2]); b.rect(3, 6, 4, 4, r[3]); b.rect(45, 6, 4, 4, r[3]); b.rect(20, 10, 2, 5, r[0]); b.rect(30, 10, 2, 5, r[0]); b.rect(19, 8, 4, 3, '#ffffff'); b.rect(29, 8, 4, 3, '#ffffff'); b.px(20, 9, OUT); b.px(31, 9, OUT); for (let i = 0; i < 5; i++) b.px(18 + i * 4, 17, r[4]); }); },
    },
    yeti: {
      hp: 1.1, r: 18, h: 44, speed: 38, pat: ['slam', 'rain', 'nova', 'charge'],
      paint(c) { return art('gg_yeti' + c.col, 44, 48, (b) => { const r = R(c.col); b.ellipse(22, 32, 16, 14, r[3]); b.ellipse(22, 30, 14, 12, r[4]); b.ellipse(22, 14, 10, 9, r[3]); b.ellipse(22, 16, 7, 5, '#8ab8d8'); b.rect(17, 13, 3, 2, OUT); b.rect(24, 13, 3, 2, OUT); b.rect(19, 18, 6, 2, '#ffffff'); b.line(13, 8, 9, 2, '#c8b8a0'); b.line(31, 8, 35, 2, '#c8b8a0'); b.ellipse(6, 30, 6, 10, r[3]); b.ellipse(38, 30, 6, 10, r[3]); b.ellipse(15, 44, 6, 3, r[2]); b.ellipse(29, 44, 6, 3, r[2]); for (let i = 0; i < 8; i++) b.px(10 + (i * 5) % 24, 24 + (i * 3) % 14, '#ffffff'); }); },
    },
    sentry: {
      hp: 1, r: 18, h: 40, speed: 0, noContact: true, pat: ['sweep', 'cross', 'homing', 'summon'], minions: ['drone'],
      paint(c) { return art('gg_sentry' + c.col, 44, 46, (b) => { const r = R(c.col); b.rect(8, 30, 28, 12, r[1]); b.rect(10, 28, 24, 4, r[2]); b.ellipse(22, 20, 13, 12, r[2]); b.ellipse(22, 19, 11, 10, r[3]); b.ellipse(22, 19, 6, 6, OUT); b.ellipse(22, 19, 4, 4, '#ff5a5a'); b.px(21, 17, '#ffffff'); b.rect(2, 16, 8, 4, r[1]); b.rect(34, 16, 8, 4, r[1]); b.rect(0, 15, 3, 6, r[0]); b.rect(41, 15, 3, 6, r[0]); for (let i = 0; i < 6; i++) b.px(10 + i * 4, 36, '#ffe066'); b.rect(14, 42, 16, 3, r[0]); }); },
    },
  };
  function guardian(id, kind, o) {
    const K = KIND[kind], t = o.tier;
    BS.def(id, { name: o.name, title: o.title, hp: Math.round(HP_T(t) * 0.62 * K.hp), atk: Math.round(2 + t * 0.45), r: K.r, h: K.h, col: o.col, fly: !!K.fly, noContact: !!K.noContact, speed: K.speed, exp: 40 + t * 22, gold: 30 + t * 18, weak: o.weak, resist: o.resist,
      init(e) { e.pat = K.pat; e.minions = K.minions || o.minions || ['slime']; e.c = o; e.static = K.speed === 0; },
      ai(e, dt, Wd) {
        const p = Wd.player, hp = e.hp / e.maxHp;
        if (!e.phase3 && hp <= 0.25) { e.phase3 = true; sfx('growl'); W().shake(4, 0.5); if (G.ui) G.ui.toast(e.name + ' — 필사적으로 몸부림친다!', 'bad'); }
        if (e.xp) { let done = false; try { done = LIB[e.xp.id].fn(e, dt, Wd, e.xp); } catch (err) { console.error(err); done = true; } if (done) { e.xp = null; e.jz = 0; e.set('idle'); } return; }
        if (e.st === 'idle') {
          if (!e.static && p) { const d = U.dist(e.x, e.y, p.x, p.y); if (d > 76) e.toward(p.x, p.y, e.speed, dt); else if (d < 36) e.toward(e.x * 2 - p.x, e.y * 2 - p.y, e.speed * 0.8, dt); else { const a = U.angle(e.x - p.x, e.y - p.y) + dt * 0.8; e.toward(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, e.speed * 0.6, dt); } BS.clampRoom(e); }
          if (e.stT > (e.phase3 ? 0.6 : e.phase2 ? 0.9 : 1.3)) {
            const open = 2 + (hp <= 0.66 ? 1 : 0) + (hp <= 0.33 ? 1 : 0);
            const id2 = e.pat.slice(0, open)[(e.pn = (e.pn || 0) + 1) % open];
            e.set('x_' + id2); e.xp = { id: id2 }; e.telegraph && e.telegraph(0.3);
          }
        }
      },
      over: K.over,
      draw(e, g, cx, cy) {
        const im = K.paint(o), bob = K.fly ? Math.sin(e.t * 3) * 3 + 6 : 0;
        const x = Math.round(e.x - cx - im.width / 2), y = Math.round(e.y - cy - im.height + 1 - (e.jz || 0) - bob);
        if (e.freezeT > 0) g.drawImage(X.tint(im, '#bfe8ff', 0.6), x, y); else g.drawImage(im, x, y);
        if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8); g.drawImage(X.silhouette(im, '#ffffff'), x, y); g.globalAlpha = 1; }
        if (e.phase3) { g.globalAlpha = 0.18 + Math.sin(e.t * 12) * 0.08; g.drawImage(X.silhouette(im, '#ff5a7a'), x, y); g.globalAlpha = 1; }
        if (K.over) K.over(e, g, cx, cy);
        if (e.stunT > 0) for (let i = 0; i < 4; i++) { const a = e.t * 5 + i * 1.6; g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 14), Math.round(y - 4 + Math.sin(a) * 3), 2, 2); }
      },
    });
  }
  const GUARD = {
    hl_green: ['golem', { name: '이끼 바위 거인', title: '바람 언덕 굴의 주인 · 이끼 바위 거인', col: '#8a8a7a', acc: '#6ac85a', eye: '#a8ff8a' }],
    hl_red: ['golem', { name: '숯불 바위 거인', title: '재 덮인 높은 굴의 주인 · 숯불 바위 거인', col: '#6a5a5a', acc: '#ff7a3a', eye: '#ffd84a', resist: ['fire'], weak: ['ice'] }],
    hl_blue: ['crab', { name: '갑옷 집게', title: '갈매기 벼랑 굴의 주인 · 갑옷 집게', col: '#4a8ab8', weak: ['bolt'] }],
    hl_yellow: ['golem', { name: '모래 바위 거인', title: '모래 언덕 위 굴의 주인 · 모래 바위 거인', col: '#c8a878', acc: '#e8d8a8', eye: '#ff8a5a' }],
    hl_amber: ['wisp', { name: '단풍 도깨비불', title: '단풍 봉우리 굴의 주인 · 단풍 도깨비불', col: '#ff9a4a', weak: ['ice'] }],
    hl_purple: ['wisp', { name: '노을 도깨비불', title: '노을 고원 굴의 주인 · 노을 도깨비불', col: '#c88aff', weak: ['light'] }],
    hl_mist: ['wisp', { name: '안개 도깨비불', title: '안개 위 굴의 주인 · 안개 도깨비불', col: '#8ad8c8', weak: ['fire'] }],
    hl_white: ['yeti', { name: '봉우리 설인', title: '눈 덮인 봉우리 굴의 주인 · 봉우리 설인', col: '#c8d8e8', weak: ['fire'], resist: ['ice'] }],
    hl_gray: ['sentry', { name: '고철 파수꾼', title: '잿빛 고원 굴의 주인 · 고철 파수꾼', col: '#8a8a98', weak: ['bolt'] }],
    hl_black: ['wisp', { name: '별 없는 도깨비불', title: '별 없는 고원 굴의 주인 · 별 없는 도깨비불', col: '#6a5aa8', weak: ['light'], resist: ['dark'] }],
  };
  for (const [did, [kind, o]] of Object.entries(GUARD)) { const Dn = DUN[did]; if (!Dn) continue; guardian('gd_' + did, kind, Object.assign({ tier: Dn.tier || 0 }, o)); }

  /* ═════════ 보스 깨우기 ═════════
     이야기 던전(1~11장)은 장면이 보스를 깨우지만, 숨은 던전 · 고원 굴의 보스는 깨우는 것이 없어 가만히 서 있었다(맞기만 했다).
     보스 방에 들어서서 1.2초가 지나도(장면이 돌고 있지 않을 때) 잠들어 있으면 깨운다 — 이름 띠 · 체력 막대 · 보스 음악 */
  const ctlUp = G.dungeon.RoomCtl.prototype.update;
  G.dungeon.RoomCtl.prototype.update = function (dt, Wd) {
    const r = ctlUp.apply(this, arguments);
    const p = Wd.player; if (!p || G.script.running) return r;
    if (this.inside(p)) {
      this.inT = (this.inT || 0) + dt;
      if (this.inT > 1.2) {
        const boss = Wd.ents.find((e) => e.boss && !e.dead && !e.dying && e.st === 'wait' && e.room === this.k && !e.duel);
        if (boss && !S().flags[(boss.dunId || this.did) + ':boss']) {
          G.script.run(async (c) => {
            c.lock(true); c.sfx('encounter'); W().shake(3, 0.4);
            if (G.hud && G.hud.cutin) G.hud.cutin(boss.name, boss.title || '', boss.col || '#ff8a96');
            await c.wait(0.9); c.lock(false);
            boss.start(); G.hud.setBoss(boss); c.music(this.tier >= 8 ? 'boss2' : 'boss');
          });
        }
      }
    } else this.inT = 0;
    return r;
  };

  /* ═════════ 큰 열쇠의 방: 어디서 · 어떻게 나오는지 알려 주고, 막히지 않게 ═════════
     · 큰 열쇠 상자가 있는 방에 처음 들어서면: 「큰 열쇠가 이 방에 있다 — 적을 모두 쓰러뜨리면 / 퍼즐을 풀면 상자가 나타난다」
     · 숨은 큰 열쇠 상자 자리에는 바닥에 희미한 열쇠 문양(어디에 나타날지 보이게)
     · 「방 정리」 방: 남은 적이 둘 · 하나가 되면 알림. 방 밖(벽 너머)으로 밀려나거나 벽에 박혀 4초 넘게 못 나오는 적은 쓰러진 것으로 친다
       (예전: 그런 적 하나 때문에 방이 끝나지 않아 큰 열쇠 상자가 영영 나타나지 않을 수 있었다) */
  const keyRoom = (did, k) => { const D2 = DUN[did]; const R2 = D2 && D2.rooms[k]; const pr = R2 && (R2.props || []).find((x) => x[0] === 'chest' && x[3] && x[3].item === 'key_big'); return pr || null; };
  const HOW = { clear: '적을 모두 쓰러뜨리면', waves: '몰려오는 적을 끝까지 막아 내면', plates: '발판을 모두 누르면', torches: '횃불을 모두 밝히면', order: '발판을 차례대로 밟으면', flag: '방의 장치를 풀면' };
  const ctlUp2 = G.dungeon.RoomCtl.prototype.update;
  G.dungeon.RoomCtl.prototype.update = function (dt, Wd) {
    const r = ctlUp2.apply(this, arguments);
    const p = Wd.player; if (!p) return r;
    const s = S(), R = this.R, solved = !!s.flags[this.flagClear];
    // 1) 큰 열쇠의 방 안내
    if (this.active && !this.keyTold && !G.script.running) {
      this.keyTold = true;
      const kr = keyRoom(this.did, this.k);
      if (kr && !(s.bigkeys && s.bigkeys[this.did])) {
        const hid = kr[3].hidden, how = hid && !solved ? (hid === true ? (HOW[R.solve && R.solve.type] || '이 방을 풀면') : '숨은 장치를 찾으면') : null;
        C().after(0.6, () => G.ui.toast('[y]큰 열쇠[/]가 이 방에 있다' + (how ? ' — ' + how + ' 상자가 나타난다' : ' — 붉은 큰 상자를 열자'), 'gold'));
      }
    }
    // 2) 방 정리: 남은 적 알림 · 갇힌 적 정리
    if (solved && this.leftWas > 0) { this.leftWas = 0; const el = document.querySelector('[data-key="left:' + this.did + '"]'); if (el) el.remove(); }
    if (this.active && R.solve && (R.solve.type === 'clear' || R.solve.type === 'waves') && !solved && this.foes.length) {
      const RW2 = this.RW, RH2 = this.RH, m = Wd.map;
      for (const e of this.foes) {
        if (e.dead || e.boss) continue;
        const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 2) / TS);
        const out = tx < this.x0 + 1 || tx > this.x0 + RW2 - 2 || ty < this.y0 + 1 || ty > this.y0 + RH2 - 2;
        const stuck = !e.fly && !e.noClip && m.inb(tx, ty) && !m.boxFree(e.x - (e.bw || 8) / 2, e.y - (e.bh || 6), e.bw || 8, e.bh || 6, e.z || 0, e);
        if (out || stuck) { e.lostT = (e.lostT || 0) + dt; if (e.lostT > 4) { e.hp = 0; e.dead = true; G.fx.glow(e.x, e.y - 8, '#b8a8ff', 8); } }
        else e.lostT = 0;
      }
      const left = this.foes.filter((e) => !e.dead).length;
      if (left !== this.leftWas) {
        if (this.leftWas != null && left > 0 && left <= 2 && keyRoom(this.did, this.k)) G.ui.toast('남은 적 ' + left, '', 'left:' + this.did);
        else if (left === 0) { const el = document.querySelector('[data-key="left:' + this.did + '"]'); if (el) el.remove(); }
        this.leftWas = left;
      }
    }
    return r;
  };
  /** 숨은 큰 열쇠 상자 자리: 바닥의 희미한 열쇠 문양 */
  class KeyMark extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'keymark', solid: false, sortBias: -30, shadow: false }, o)); }
    update(dt) { this.t += dt; if (!this.chest || this.chest.dead || !this.chest.hidden || this.chest.opened) this.dead = true; }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 4), a = 0.38 + Math.sin(this.t * 2.4) * 0.16;
      g.save(); g.globalAlpha = a; g.strokeStyle = '#ffe066'; g.lineWidth = 1;
      g.strokeRect(x - 10.5, y - 7.5, 21, 12);
      g.fillStyle = '#ffe066'; g.fillRect(x - 5, y - 3, 4, 4); g.fillRect(x - 1, y - 2, 8, 2); g.fillRect(x + 5, y, 2, 2); g.fillRect(x + 2, y, 1, 2);
      if (Math.sin(this.t * 1.7) > 0.93) { g.globalAlpha = 0.8; g.fillRect(x + 8, y - 9, 1, 3); g.fillRect(x + 7, y - 8, 3, 1); }
      g.restore();
    }
  }
  G.story.enterHooks.push((m) => {
    if (!m || !m.dungeon) return;
    C().after(0.05, () => { const Wd = W(); for (const e of Wd.ents) if (e instanceof G.props.Chest && e.keyChest && e.hidden && !e.opened) Wd.add(new KeyMark({ x: e.x, y: e.y, chest: e })); });
  });

  /* ═════════ 고원 굴: 방 다섯 + 숨은 방 · 작은 열쇠 → 큰 열쇠 → 굴의 주인 ═════════ */
  const RARE_BY = {
    hl_green: 'art_moonslash', hl_red: 'fc_coral', hl_blue: 'tome_poison', hl_amber: 'bw_bone',
    hl_yellow: 'bw_venom', hl_purple: 'art_quakeblade', hl_mist: 'tome_blink',
    hl_white: 'ac_berserk', hl_gray: 'art_blackhole', hl_black: 'bw_moon',
  };
  const flag = (k) => !!S().flags[k];
  function cave(did) {
    const Dn = DUN[did]; if (!Dn) return;
    // 별관(곁가지)은 걷어 낸다 — 작은 굴은 작게
    for (const k of Object.keys(Dn.rooms)) if (/^x\d+$/.test(k)) { delete Dn.rooms[k]; if (Dn.pos) delete Dn.pos[k]; if (Dn.floors) delete Dn.floors[k]; }
    Dn.doors = (Dn.doors || []).filter((d) => !/^x\d+$/.test(d[0]) && !/^x\d+$/.test(d[1]));
    Dn.wingRooms = 0; if (G.skills && G.skills.wingBooks) delete G.skills.wingBooks[did];
    const R = Dn.rooms, tier = Dn.tier || 0;
    const strip = (k) => { if (R[k]) R[k].props = (R[k].props || []).filter((pr) => pr[0] !== 'chest'); };
    ['0,1', '2,1', '1,0'].forEach(strip);
    // 0,1: 작은 열쇠 · 2,1: 큰 열쇠(방을 정리하면) · 1,0: 굴의 주인과 보물 · 0,0: 숨은 방(폭탄)
    R['0,1'].props.push(['chest', 9, 6, { item: 'key_small' }]);
    R['2,1'].props.push(['chest', 9, 6, { item: 'key_big', big: true, hidden: true }]);
    R['2,1'].solve = { type: 'clear', msg: '조용해졌다 — 큰 상자가 모습을 드러냈다' };
    R['1,0'] = { boss: true, shape: 'round', props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 6, { type: 'gd_' + did }], ['chest', 9, 4, { item: RARE_BY[did] && D.ITEMS[RARE_BY[did]] ? RARE_BY[did] : 'potion_g', big: true, hidden: did + ':boss', col: '#e8c048' }]] };
    R['0,0'] = { shape: 'round', props: [['chest', 9, 6, { item: 'heartpiece' }], ['decor', 5, 4, { decor: G.objs.O.ROCK }], ['decor', 14, 9, { decor: G.objs.O.PEBBLE }], ['sign', 13, 9, { text: '바위 틈에 누군가 남긴 글씨.\n「소리가 다르게 울리는 벽은, 벽이 아니다.」' }]] };
    Dn.floors = Dn.floors || {}; Dn.floors['0,0'] = '숨은 굴'; Dn.floors['1,0'] = '굴의 주인';
    Dn.doors = [['1,2', '1,1', 'open'], ['1,1', '0,1', 'open'], ['1,1', '2,1', 'key'], ['1,1', '1,0', 'big'], ['0,1', '0,0', 'bomb']];
    // 0,1에 귀띔: 금 간 벽 쪽에서 바람 소리
    R['0,1'].props.push(['sign', 3, 10, { text: '바닥에 흙먼지가 한쪽으로만 쓸려 있다. 위쪽 벽에서 아주 희미한 바람 소리.' }]);
    // 보스를 이기면 나가는 빛
    const ents0 = Dn.ents;
    Dn.ents = function (m, Wd) {
      if (ents0) ents0.apply(this, arguments);
      const r2 = m.rooms['1,0']; if (!r2) return;
      const boss = Wd.ents.find((e) => e.boss && e.room === '1,0');
      const back = () => { const s2 = G.story.HIGH && G.story.HIGH.caves[did.slice(3)]; return s2 ? [s2.x, s2.y + 3] : null; };
      const out = () => { const b2 = back(); if (!G.story.Portal) return; if (b2) Wd.add(new G.story.Portal({ x: (r2.x0 + 15) * TS + 8, y: (r2.y0 + 10) * TS + 12, to: 'world', tox: b2[0], toy: b2[1] })); else if (Dn.exit) Wd.add(new G.story.Portal({ x: (r2.x0 + 15) * TS + 8, y: (r2.y0 + 10) * TS + 12, to: 'world', tox: Dn.exit.tx, toy: Dn.exit.ty })); };
      if (flag(did + ':boss')) { if (boss) boss.dead = true; out(); return; }
      if (boss) boss.onDieFn = () => { S().flags[did + ':boss'] = true; G.ui.toast(boss.name + '을(를) 쓰러뜨렸다 — 굴의 보물이 드러났다', 'gold'); C().after(0.8, out); };
    };
  }
  for (const did of Object.keys(DUN)) if (did.startsWith('hl_')) cave(did);

  /* ═════════ 본 던전: 큰 열쇠는 본 던전에, 별관 · 깊은 구역은 곁가지 ═════════ */
  for (const did of Object.keys(DUN)) {
    const Dn = DUN[did];
    if (!/^d\d+$/.test(did) || !Dn.deepHost) continue;
    const host = Dn.deepHost, fin = Dn.deepFinal, entry = Dn.deepEntry;
    // 1) 큰 열쇠를 원래 상자로
    if (Dn.deepKeyChest) { Dn.deepKeyChest[3] = Object.assign({}, Dn.deepKeyChest[3], { item: 'key_big', big: true }); }
    const FR = Dn.rooms[fin];
    if (FR && FR.props) FR.props = FR.props.filter((pr) => !(pr[0] === 'chest' && pr[3] && pr[3].item === 'key_big'));
    // 2) 별관 끝에서 깊은 구역으로 가던 계단을 원래 자리(큰 열쇠 방)로 — 별관은 곁가지
    const deepDoor = Dn.doors.find((d) => d[1] === entry && /^x\d+$/.test(d[0]));
    if (deepDoor) { deepDoor[0] = host; deepDoor[2] = 'open'; deepDoor[3] = undefined; }
    Dn.wingMandatory = false;
    // 3) 깊은 구역 끝 → 큰 열쇠 방으로 돌아가는 지름길 계단
    if (fin && !Dn.doors.some((d) => d[0] === fin && d[1] === host)) Dn.doors.push([fin, host, 'open']);
    // 4) 안내판: 곁가지라는 것을 알린다
    const EN = Dn.rooms[entry];
    if (EN && EN.props) for (const pr of EN.props) if (pr[0] === 'sign' && pr[3] && pr[3].text && !pr[3].side) { pr[3] = Object.assign({}, pr[3], { side: true, text: '[깊은 구역 — 곁가지] 큰 열쇠와는 상관없다. 끝에 보물이 있고, 끝에서 바로 돌아오는 계단이 있다.\n\n' + pr[3].text }); }
    // 별관 끝(보물방)에서 들어온 곳으로 돌아가는 계단
    const wingLast = Object.keys(Dn.rooms).filter((k) => /^x\d+$/.test(k)).sort((a, b) => +a.slice(1) - +b.slice(1)).pop();
    const wingHost = (Dn.doors.find((d) => d[1] === 'x0') || [])[0];
    if (wingLast && wingHost && wingLast !== 'x0' && !Dn.doors.some((d) => d[0] === wingLast && d[1] === wingHost)) Dn.doors.push([wingLast, wingHost, 'open']);
  }

  /* ═════════ 상자: 위험도에 맞는 등급 · 겹치지 않게 · 물약 · 화살 · 폭탄은 항아리로 ═════════ */
  const CAP = (t) => (t <= 1 ? 2 : t <= 3 ? 3 : t <= 6 ? 4 : 5);
  const EQUIP = new Set(['sword', 'bow', 'focus', 'armor', 'acc', 'tome', 'art', 'sbook']);
  const seenItem = new Set();
  const swapFor = (it, cap) => {
    const I = D.ITEMS;
    const same = (x) => x.type === it.type && (it.type !== 'sbook' || (G.stance && G.stance.ASK[x.skill] && G.stance.ASK[it.skill] && G.stance.ASK[x.skill].w === G.stance.ASK[it.skill].w));
    for (let g = cap; g >= 1; g--) { const c = Object.keys(I).filter((id) => same(I[id]) && (I[id].grade || 1) === g && !seenItem.has(id)).sort(); if (c.length) return c[U.hash('dgswap:' + it.id) % c.length]; }
    return 'potion_g';
  };
  const POTDROP = (id) => { const it = D.ITEMS[id]; if (!it) return null; if (it.type === 'ammo') return { what: it.ammo === 'arrows' ? 'arrow' : 'bomb', n: it.n || 5 }; if (it.type === 'use') return { what: 'item', id, n: 1 }; return null; };
  const report = [];
  const order = Object.keys(DUN).sort((a, b) => (DUN[a].tier || 0) - (DUN[b].tier || 0));
  for (const did of order) {
    const Dn = DUN[did], cap = CAP(Dn.tier || 0);
    for (const k of Object.keys(Dn.rooms)) {
      const R = Dn.rooms[k]; if (!R.props) continue;
      R.props = R.props.map((pr) => {
        if (pr[0] !== 'chest' || !pr[3]) return pr;
        const o = pr[3], it = D.ITEMS[o.item]; if (!it) return pr;
        // 소모품 상자 → 항아리 (깨면 그 물건)
        const dr = POTDROP(o.item);
        if (dr && !o.big) { report.push(did + ':' + k + ' ' + o.item + '→항아리'); return ['pot', pr[1], pr[2], { drop: dr }]; }
        if (!EQUIP.has(it.type)) return pr;
        let id = o.item;
        if ((it.grade || 1) > cap) { id = swapFor(it, cap); report.push(did + ' ' + o.item + '(' + it.grade + ')→' + id + ' 상한 ' + cap); }
        else if (seenItem.has(id)) { id = swapFor(it, it.grade || 1); report.push(did + ' ' + o.item + ' 겹침→' + id); }
        seenItem.add(id);
        return id === o.item ? pr : [pr[0], pr[1], pr[2], Object.assign({}, o, { item: id })];
      });
    }
  }

  /* ═════════ 비밀: 숨은 눈 · 금 간 벽 ═════════ */
  const PR = G.props;
  class SecretEye extends G.dungeon.Eye {
    constructor(o) { super(Object.assign({ bw: 8, bh: 6 }, o)); }
    blockBox() { return { x: this.x - 4, y: this.y - 6, w: 8, h: 6 }; }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 20);
      // 벽돌 틈에 박힌 돌 눈: 평소엔 벽과 거의 같은 빛, 3초마다 한 번 붉게 반짝
      const glint = !this.on && (W().t % 3.2) < 0.18;
      g.fillStyle = 'rgba(20,12,28,0.55)'; g.fillRect(x - 3, y - 1, 6, 4);
      g.fillStyle = this.on ? '#6ae07a' : glint ? '#ff5a6a' : 'rgba(120,110,140,0.55)'; g.fillRect(x - 2, y, 4, 2);
      if (glint) { g.fillStyle = '#ffffff'; g.fillRect(x - 1, y, 1, 1); }
    }
  }
  G.dungeon.SecretEye = SecretEye;
  for (const did of Object.keys(DUN)) {
    if (did.startsWith('hl_')) continue;
    const Dn = DUN[did];
    for (const k of Object.keys(Dn.rooms)) {
      const R = Dn.rooms[k]; if (!R.props) continue;
      const ch = R.props.find((pr) => pr[0] === 'chest' && pr[3] && pr[3].item === 'heartpiece' && !pr[3].hidden);
      if (!ch) continue;
      const sets = did + ':hpeye:' + k;
      ch[3] = Object.assign({}, ch[3], { hidden: sets });
      const ex = (U.hash(did + k) % 2) ? 3 : (Dn.rw || 20) - 4;
      R.props.push(['fn', ex, 2, { fn: (X2, Y2, Wd) => { const e = new SecretEye({ x: X2, y: Y2 - 2, sets }); e.room = k; return Wd.add(e); } }]);
    }
  }
  // 조각 하트 상자가 숨은 눈에 묶여 있으면: 눈을 쏘아 맞히는 순간 알린다
  const eyeHit = G.dungeon.Eye.prototype.shotHit;
  SecretEye.prototype.shotHit = function (sh) { const was = this.on; const r = eyeHit.apply(this, arguments); if (!was && this.on) { G.ui.toast('벽 속의 눈이 감겼다 — 어딘가에서 상자가 나타났다', 'gold'); sfx('discover'); } return r; };
  // 금 간 벽: 가까이 가야 보인다 (등불을 들면 더 멀리서)
  if (PR && PR.Crack) {
    const cd0 = PR.Crack.prototype.draw;
    PR.Crack.prototype.draw = function (g, cx, cy) {
      if (this.done) return;
      const p = W().player, d = p ? U.dist(p.x, p.y, this.x, this.y) : 999, lit = p && p.lantern;
      const a = U.clamp(1 - (d - (lit ? 72 : 30)) / 36, lit ? 0.3 : 0.07, 1);
      g.save(); g.globalAlpha = a; cd0.call(this, g, cx, cy); g.restore();
    };
  }

  /* ═════════ 길잡이: 들어설 때 던전의 짜임 · 큰 열쇠를 얻으면 보스 방으로 ═════════ */
  const seenEnter = {};
  G.story.enterHooks.push((m) => {
    const did = m && m.dungeon, Dn = did && DUN[did]; if (!Dn) return;
    const s = S(), v = s.dgVisit || 0; if (seenEnter[did] === v) return; seenEnter[did] = v;
    const side = [];
    if (Object.keys(Dn.rooms).some((k) => /^x\d+$/.test(k))) side.push('별관');
    if (Dn.deepEntry) side.push('깊은 구역');
    if (Object.keys(Dn.rooms).includes('0,0') && did.startsWith('hl_')) side.push('숨은 굴');
    const got = s.bigkeys && s.bigkeys[did];
    const msg = (Dn.name || did) + ' — 위험도 ★' + (Dn.tier || 0) + ' · ' + (s.flags[did + ':boss'] ? '보스를 이긴 던전' : got ? '큰 열쇠가 있다 → 큰 자물쇠 문 너머 보스' : '작은 열쇠 → 큰 열쇠 → 보스') + (side.length ? ' · 곁가지: ' + side.join(' · ') + ' (보물)' : '');
    C().after(1.2, () => { if (G.ui) G.ui.toast(msg, ''); });
  });
  const tick0 = () => {
    const s = S(), m = W() && W().map, did = m && m.dungeon; if (!did || !s.bigkeys || !s.bigkeys[did] || s.flags['bkTold:' + did] || s.flags[did + ':boss']) return;
    s.flags['bkTold:' + did] = true; G.ui.toast('큰 열쇠! — 보스 방은 [y]붉은 큰 자물쇠[/] 문 너머 (지도에서 해골 방)', 'gold');
  };
  if (G.story.onTick) G.story.onTick.push(tick0);

  G.dungeon2 = { LIB, EXTRA, HP_T, CAP, GUARD, report };
})();
