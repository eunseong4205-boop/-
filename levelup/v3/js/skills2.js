/* 스킬 · 필살기 · 재능 더 넓히기
   · 무기마다 스킬 다섯을 더해 스물 (검: 발도 · 회오리 돌진 · 초승달 칼바람 · 검무 · 일도양단 / 활: 산탄 사격 · 연속 사격 · 지뢰 화살 · 질풍 화살 · 태양 화살 /
     마법: 번개 창 · 덩굴 감옥 · 거울 방벽 · 해일 · 일식)
   · 필살기 열 (검 셋 · 활 넷 · 마법 셋) — 모두 서른하나
   · 재능 나무 여섯 갈래에 칸 서른아홉 (갈래마다 6~7): 줄마다 셋 중 하나가 되는 곳이 많다
   · 얻는 길을 넓힌다: 기술서 · 재능 칸 · 보스 · 별관 · 거울 · 탑에 더해 「연성」(숙련 ★3 두 기술 + 골드로 새 기술 · 필살기 둘로 새 필살기)과
     「비문」(세상 곳곳의 옛 돌에 새겨진 기술 — 그 무기 능력치가 되어야 읽힌다)
   · 밸런스: 모든 스킬 · 필살기를 같은 잣대로 쟀다(기본 공격 한 번 = 1). 등급마다 한 번 쓸 때의 몫과 재사용 대기를 맞추고, 너무 세거나 약한 것은 배율로 고쳤다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, C = G.combat, E = G.ent, D = G.data, I = G.input;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const SN = G.stance, ASK = SN.ASK, DO = SN.DO, UPD = SN.UPD, GLY = SN.GLY;
  const near = SN.near, hit = SN.hit, magBase = SN.magBase, arrow = SN.arrow;
  const WSTAT = { sword: 'str', bow: 'dex', magic: 'int' };
  const GREQ = (G.skills && G.skills.GREQ) || [null, null, { s: 3, lv: 5 }, { s: 6, lv: 12 }, { s: 10, lv: 20 }, { s: 16, lv: 32 }];
  const ang = (p) => U.angle(p.face[0], p.face[1]);
  const busy = (p, id, dur, o) => { p.setState('skill'); p.skill = Object.assign({ id, t: 0, dur }, o || {}); };
  class Fx extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'skillfx', solid: false, sortBias: 6 }, o)); }
    update(dt, Wd) { this.t += dt; if (this.t >= this.life) { this.dead = true; if (this.end) this.end(); return; } if (this.tick) this.tick(dt, Wd); }
    draw(g, cx, cy) { if (this.paint) this.paint(g, cx, cy); }
  }
  const addFx = (o) => W().add(new Fx(o));
  /** 선분 둘레의 적 */
  function onLine(x0, y0, x1, y1, wdt) {
    const L2 = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) || 1;
    return C.foes().filter((e) => { const ey = e.y - (e.h || 16) / 2; const t = U.clamp(((e.x - x0) * (x1 - x0) + (ey - y0) * (y1 - y0)) / L2, 0, 1); return U.dist(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, e.x, ey) < wdt + (e.r || 8); });
  }
  function blast(x, y, r, amt, info, col) {
    G.fx.ring(x, y, col || '#ffe8a8', r, 0.4, 3); G.fx.sparks(x, y, 16, col || '#ffb84a', 120); G.fx.dust(x, y, 6); W().shake(2.5, 0.18);
    for (const e of C.foes()) if (U.dist(x, y, e.x, e.y - 6) < r + (e.r || 8)) { const [nx, ny] = U.norm(e.x - x, e.y - y); hit(e, amt, Object.assign({ kx: nx, ky: ny, power: 1.1 }, info)); }
  }
  const nearestIn = (p, r, cone) => { const a = ang(p); let best = null, bd = 1e9; for (const e of C.foes()) { const dd = U.dist(p.x, p.y, e.x, e.y); if (dd > r) continue; const da = Math.abs(U.angDiff(a, U.angle(e.x - p.x, e.y - p.y))); if (cone && da > cone) continue; const sc = dd + da * 60; if (sc < bd) { bd = sc; best = e; } } return best; };

  /* ═════════ 새 스킬 열다섯 ═════════ */
  const NEW = {
    a_draw: { w: 'sword', grade: 2, name: '발도', cost: { st: 22 }, cd: 5, desc: '칼을 거뒀다가 0.3초 만에 한 줄기로 뽑아 벤다 — 앞으로 다섯 칸, 지나가며 (×2.2, 치명타 확률 +40%).' },
    a_tornado: { w: 'sword', grade: 3, name: '회오리 돌진', cost: { st: 30 }, cd: 8, desc: '돌며 앞으로 세 칸 나아간다 (0.12초마다 둘레 ×0.55).' },
    a_crescent: { w: 'sword', grade: 3, name: '초승달 칼바람', cost: { st: 26 }, cd: 9, desc: '커다란 초승달이 천천히 나아가며 지나가는 적을 여러 번 벤다 (0.2초마다 ×0.5).' },
    a_blades: { w: 'sword', grade: 4, name: '검무', cost: { st: 34 }, cd: 11, desc: '0.8초 동안 앞쪽을 다섯 번 벤다 — 걸으며 (×0.85 다섯 번).' },
    a_judgment: { w: 'sword', grade: 5, name: '일도양단', cost: { st: 50 }, cd: 24, desc: '0.6초 모아 앞으로 아홉 칸을 가른다. 모든 것을 꿰뚫는 한 칼 (×6.5, 치명타).' },
    a_scatter: { w: 'bow', grade: 2, name: '산탄 사격', cost: { ar: 4, st: 10 }, cd: 4, desc: '가까이에서 일곱 발이 넓게 퍼진다 — 쏜 반동으로 조금 물러난다 (한 발 ×0.65).' },
    a_volley2: { w: 'bow', grade: 3, name: '연속 사격', cost: { ar: 8, st: 14 }, cd: 8, desc: '1.2초 동안 겨눈 쪽으로 여덟 발 — 걸으며 겨누며 (한 발 ×0.75).' },
    a_mine: { w: 'bow', grade: 3, name: '지뢰 화살', cost: { ar: 2, st: 12 }, cd: 6, desc: '땅에 꽂힌 화살이 8초 기다렸다가 적이 다가오면 터진다 (×1.9, 셋까지).' },
    a_gale: { w: 'bow', grade: 4, name: '질풍 화살', cost: { ar: 2, st: 24 }, cd: 10, desc: '거대한 바람 화살이 꿰뚫으며 적을 끝까지 밀어붙인다 (×2.2).' },
    a_sunrain: { w: 'bow', grade: 5, name: '태양 화살', cost: { ar: 6, st: 40 }, cd: 24, desc: '하늘로 쏜 화살이 2초 동안 불화살 비가 되어 쏟아진다 (한 발 ×0.55, 불).' },
    a_lance: { w: 'magic', grade: 2, name: '번개 창', cost: { mp: 12 }, cd: 5, desc: '곧은 번개 창이 앞으로 아홉 칸을 꿰뚫는다 (×1.8, 감전).' },
    a_vine: { w: 'magic', grade: 3, name: '덩굴 감옥', cost: { mp: 18 }, cd: 10, desc: '겨눈 곳의 적을 3초 묶고 독을 올린다 (0.5초마다 ×0.35).' },
    a_mirrorwall: { w: 'magic', grade: 3, name: '거울 방벽', cost: { mp: 16 }, cd: 12, desc: '3초 동안 둘레에 거울벽 — 날아오는 것을 되받아치고(×1.5) 닿는 적을 밀어낸다.' },
    a_tidal: { w: 'magic', grade: 4, name: '해일', cost: { mp: 26 }, cd: 12, desc: '넓은 물결이 밀려가며 적을 쓸고(×1.7) 적신다 — 젖은 적은 번개에 ×1.5 (4초).' },
    a_eclipse: { w: 'magic', grade: 5, name: '일식', cost: { mp: 50 }, cd: 28, desc: '2초 동안 해가 가려지고 화면의 적마다 검은 빛이 일곱 번 떨어진 뒤 빛이 터진다 (×0.8 일곱 번 + ×1.6).' },
  };
  for (const id in NEW) { ASK[id] = Object.assign({ icon: id }, NEW[id]); const q = GREQ[NEW[id].grade]; if (q) ASK[id].req = { [WSTAT[NEW[id].w]]: q.s, lv: q.lv }; }

  /* ── 검 ── */
  DO.a_draw = (p, s, d, m, k) => { busy(p, 'a_draw', 0.42, { k, noMove: true, done: false }); sfx('draw'); };
  UPD.a_draw = (p, K, dt, m, s, d) => {
    if (!K.done && K.t < 0.3 && Math.random() < 0.6) { const a = Math.random() * Math.PI * 2; G.fx.part({ x: p.x + Math.cos(a) * 14, y: p.y - 9 + Math.sin(a) * 10, z: 0, vx: -Math.cos(a) * 50, vy: -Math.sin(a) * 36, vz: 0, g: 0, life: 0.2, col: '#fff4d8', size: 1, glow: true }); }
    if (!K.done && K.t >= 0.3) {
      K.done = true;
      const a = ang(p), L = 80, x0 = p.x, y0 = p.y - 9, x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L * 0.85;
      for (const e of onLine(x0, y0, x1, y1, 10)) hit(e, d.atk * 2.2 * K.k, { src: 'sword', w: 'sword', kx: Math.cos(a), ky: Math.sin(a), power: 1.2, el: d.el, crit: Math.random() < 0.4 + d.crit });
      // 칼이 지나간 줄 · 몸은 반 줄 앞으로
      if (p.sheet) { const img = p.sheet.get('atk', p.dir, 1); if (img) G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.6); }
      for (let i = 0; i < 8; i++) E.move(m, p, Math.cos(a) * 5, Math.sin(a) * 4);
      addFx({ x: x0, y: y0 + 9, life: 0.25, sortBias: 30, paint(g, cx, cy) { const k2 = this.t / 0.25; g.save(); g.globalAlpha = 1 - k2; g.strokeStyle = '#ffffff'; g.lineWidth = 3 * (1 - k2) + 1; g.beginPath(); g.moveTo(x0 - cx, y0 - cy); g.lineTo(x1 - cx, y1 - cy); g.stroke(); g.strokeStyle = '#ffd8a8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - cx, y0 - cy - 3); g.lineTo(x1 - cx, y1 - cy - 3); g.stroke(); g.restore(); } });
      C.cutArc(m, p.x, p.y - 4, a, 40, 0.3); W().hitstop(0.05); W().shake(2.5, 0.15); sfx('slash');
    }
  };
  DO.a_tornado = (p, s, d, m, k) => { busy(p, 'a_tornado', 0.72, { k, dir: [...p.face], tk: 0 }); sfx('spin'); };
  UPD.a_tornado = (p, K, dt, m, s, d) => {
    E.move(m, p, K.dir[0] * 125 * dt, K.dir[1] * 100 * dt);
    p.spinA = (p.spinA || 0) + dt * 22; p.atkFrame = 1;
    K.tk -= dt;
    if (K.tk <= 0) { K.tk = 0.12; for (const e of near(p.x, p.y - 6, d.reach + 14)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); hit(e, d.atk * 0.55 * K.k, { src: 'spin', w: 'sword', kx: nx, ky: ny, power: 0.5, el: d.el }); } C.cutArc(m, p.x, p.y - 4, 0, d.reach + 8, Math.PI * 2); G.fx.ring(p.x, p.y - 6, '#e8f4ff', d.reach + 12, 0.2, 1); }
    if (Math.random() < 0.8) { const a = p.spinA; G.fx.part({ x: p.x + Math.cos(a) * 22, y: p.y - 6 + Math.sin(a) * 14, z: 2, vz: 20, g: 0, life: 0.25, col: '#e8f4ff', size: 1, glow: true }); }
  };
  DO.a_crescent = (p, s, d, m, k) => {
    const a = ang(p), hitAt = new Map();
    addFx({ x: p.x + Math.cos(a) * 14, y: p.y + Math.sin(a) * 10, life: 1.3, sortBias: 20, tick(dt) {
      this.x += Math.cos(a) * 120 * dt; this.y += Math.sin(a) * 100 * dt;
      if (!W().map.shotFree(this.x, this.y - 8, W().player.z || 0)) { this.t = this.life; return; }
      for (const e of C.foes()) { if (U.dist(this.x, this.y - 8, e.x, e.y - (e.h || 16) / 2) > 18 + (e.r || 8)) continue; if ((hitAt.get(e) || -9) > this.t - 0.2) continue; hitAt.set(e, this.t); hit(e, d.atk * 0.5 * k, { src: 'beam', w: 'sword', kx: Math.cos(a) * 0.4, ky: Math.sin(a) * 0.4, power: 0.3, el: d.el }); }
      C.cutArc(W().map, this.x, this.y - 4, a, 14, 0.9);
    }, paint(g, cx, cy) { const x = this.x - cx, y = this.y - cy - 8, f = Math.min(1, (this.life - this.t) / 0.25); g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha = 0.85 * f; g.strokeStyle = '#e8f4ff'; g.lineWidth = 4; g.beginPath(); g.arc(-10, 0, 18, -1.3, 1.3); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.beginPath(); g.arc(-8, 0, 18, -1.1, 1.1); g.stroke(); g.globalAlpha = 0.25 * f; g.fillStyle = '#a8c8ff'; g.beginPath(); g.arc(-10, 0, 18, -1.3, 1.3); g.fill(); g.restore(); } });
    busy(p, 'a_crescent', 0.3, { k }); sfx('beam');
  };
  DO.a_blades = (p, s, d, m, k) => { busy(p, 'a_blades', 0.82, { k, n: 5, done: 0 }); };
  UPD.a_blades = (p, K, dt, m, s, d) => {
    const step = K.dur / 5;
    while (K.done < 5 && K.t >= K.done * step + 0.02) {
      K.done++;
      const a = ang(p), A0 = a + (K.done % 2 ? -1 : 1) * 0.9;
      for (const e of C.foes()) { const dd = U.dist(p.x, p.y - 6, e.x, e.y - (e.h || 16) / 2); if (dd > d.reach + 12 + (e.r || 8)) continue; const da = Math.abs(U.angDiff(a, U.angle(e.x - p.x, e.y - p.y))); if (da > 1.15 && dd > 12) continue; hit(e, d.atk * 0.85 * K.k, { src: 'sword', w: 'sword', kx: Math.cos(a) * 0.5, ky: Math.sin(a) * 0.5, power: 0.4, el: d.el }); }
      G.fx.slash(p.x + Math.cos(a) * 16, p.y - 9 + Math.sin(a) * 12, A0 + Math.PI / 2, '#fff4d8', 16);
      C.cutArc(m, p.x, p.y - 4, a, d.reach, 1.2); sfx(K.done % 2 ? 'swing' : 'slash');
    }
  };
  DO.a_judgment = (p, s, d, m, k) => { busy(p, 'a_judgment', 1.0, { k, noMove: true, done: false }); p.inv = Math.max(p.inv, 0.7); sfx('charge'); G.fx.ring(p.x, p.y - 8, '#fff4c8', 26, 0.6, 2); };
  UPD.a_judgment = (p, K, dt, m, s, d) => {
    if (!K.done) {
      p.atkFrame = 0;
      if (Math.random() < 0.9) { const a = Math.random() * Math.PI * 2, r = 30 - K.t * 30; G.fx.part({ x: p.x + Math.cos(a) * r, y: p.y - 9 + Math.sin(a) * r * 0.7, z: 0, vx: -Math.cos(a) * 60, vy: -Math.sin(a) * 40, vz: 0, g: 0, life: 0.22, col: Math.random() < 0.5 ? '#fff4c8' : '#ffd84a', size: 1, glow: true }); }
      if (K.t >= 0.6) {
        K.done = true;
        const a = ang(p), L = 144, x0 = p.x, y0 = p.y - 9, x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L * 0.85;
        for (const e of onLine(x0, y0, x1, y1, 16)) hit(e, d.atk * 6.5 * K.k, { src: 'sword', w: 'sword', kx: Math.cos(a), ky: Math.sin(a), power: 2.2, el: d.el, crit: true, unblockable: true, stun: 1 });
        for (let i = 1; i <= 8; i++) { const x = x0 + Math.cos(a) * i * 18, y = y0 + 9 + Math.sin(a) * i * 15; C.marks.push({ x, y, t: 0, life: 0.5, r: 8, col: '#fff4c8' }); G.fx.dust(x, y, 3); }
        addFx({ x: x0, y: y0 + 9, life: 0.45, sortBias: 40, paint(g, cx, cy) { const k2 = this.t / 0.45; g.save(); g.globalAlpha = 1 - k2; g.strokeStyle = '#fff8e0'; g.lineWidth = 10 * (1 - k2) + 1; g.beginPath(); g.moveTo(x0 - cx, y0 - cy); g.lineTo(x1 - cx, y1 - cy); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - cx, y0 - cy); g.lineTo(x1 - cx, y1 - cy); g.stroke(); g.restore(); } });
        if (G.cine && G.cine.flash) G.cine.flash('#fff', 0.15, 0.25);
        W().hitstop(0.12); W().shake(6, 0.4); sfx('impact'); sfx('white'); C.cutArc(m, p.x, p.y - 4, a, 90, 0.2);
      }
    } else p.atkFrame = 2;
  };
  /* ── 활 ── */
  DO.a_scatter = (p, s, d, m, k) => {
    const a = ang(p);
    for (let i = 0; i < 7; i++) { const off = (i - 3) * 0.19 + (Math.random() - 0.5) * 0.06; arrow(p, d, a + off, { dmg: d.bowAtk * 0.65 * k, charged: false, sp: 330 + Math.random() * 40, life: 0.3, power: 1, trail: '#e8e0cc' }); }
    for (let i = 0; i < 6; i++) E.move(m, p, -Math.cos(a) * 3, -Math.sin(a) * 2.5);
    G.fx.ring(p.x + Math.cos(a) * 12, p.y - 8 + Math.sin(a) * 9, '#fff4c8', 10, 0.2, 2); W().shake(1.5, 0.1); sfx('shootc'); busy(p, 'a_scatter', 0.2, { k });
  };
  DO.a_volley2 = (p, s, d, m, k) => { p.volleyT = 1.2; p.volleyTick = 0; p.volleyK = k; busy(p, 'a_volley2', 0.08, { k }); };
  DO.a_mine = (p, s, d, m, k) => {
    const a = ang(p); let x = p.x, y = p.y;
    for (let r = 8; r <= 72; r += 4) { const tx = p.x + Math.cos(a) * r, ty = p.y + Math.sin(a) * r * 0.85; if (!m.shotFree(tx, ty - 6, p.z || 0)) break; x = tx; y = ty; if (C.foes().some((e) => U.dist(tx, ty, e.x, e.y) < 10)) break; }
    const mines = W().ents.filter((e) => e.kind === 'skillfx' && e.mine && !e.dead);
    if (mines.length >= 3) mines[0].t = mines[0].life;
    addFx({ x, y, life: 8, mine: true, sortBias: -4, tick() { if (this.t < 0.3) return; for (const e of C.foes()) if (U.dist(this.x, this.y, e.x, e.y) < 18 + (e.r || 8)) { this.t = this.life; blast(this.x, this.y - 4, 30, d.bowAtk * 1.9 * k, { src: 'arrow', w: 'bow', el: 'fire', skill: true }, '#ff9a5a'); sfx('explode'); return; } },
      paint(g, cx, cy) { const x2 = Math.round(this.x - cx), y2 = Math.round(this.y - cy); g.fillStyle = '#8a5a30'; g.fillRect(x2, y2 - 7, 1, 7); g.fillStyle = '#e8e8f0'; g.fillRect(x2 - 1, y2 - 9, 3, 2); const bl = Math.floor(this.t * 4) % 2; g.fillStyle = bl ? '#ff5a3a' : '#ffd84a'; g.fillRect(x2 - 1, y2 - 3, 3, 2); g.globalAlpha = 0.25; g.strokeStyle = '#ff9a5a'; g.beginPath(); g.ellipse(x2, y2, 18, 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } });
    arrow(p, d, a, { dmg: 0.1, life: Math.max(0.05, U.dist(p.x, p.y, x, y) / 320), pierce: 99, trail: '#ff9a5a', charged: false });
    sfx('shoot'); busy(p, 'a_mine', 0.2, { k });
  };
  DO.a_gale = (p, s, d, m, k) => {
    const a = ang(p);
    C.shoot({ skill: true, kind: 'orb', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, dmg: d.bowAtk * 2.2 * k, src: 'arrow', w: 'bow', el: 'wind', r: 9, life: 1.0, pierce: 99, power: 3.2, ghost: true, owner: 'player', z: p.z, trail: '#c8f0ff',
      onHitFoe(e) { if (!e.boss) { e.kx = Math.cos(a) * 420; e.ky = Math.sin(a) * 420; e.stunT = Math.max(e.stunT || 0, 0.6); } },
      drawFn(g, x, y) { const an = Math.atan2(this.vy, this.vx); g.save(); g.translate(x, y); g.rotate(an); g.fillStyle = '#e8e0cc'; g.fillRect(-14, -1, 22, 2); g.fillStyle = '#ffffff'; g.fillRect(8, -2, 4, 4); g.strokeStyle = 'rgba(200,240,255,0.85)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-6 - i * 6, 0, 6 + i * 2, -1.2 + this.t * 20, 1.2 + this.t * 20); g.stroke(); } g.restore(); } });
    G.fx.ring(p.x + Math.cos(a) * 12, p.y - 8 + Math.sin(a) * 9, '#c8f0ff', 16, 0.3, 2); W().shake(2, 0.12); sfx('whoosh'); sfx('shootc'); busy(p, 'a_gale', 0.24, { k });
  };
  DO.a_sunrain = (p, s, d, m, k) => {
    const a = ang(p), cx0 = p.x + Math.cos(a) * 80, cy0 = p.y + Math.sin(a) * 64;
    arrow(p, d, -Math.PI / 2, { dmg: 0.1, life: 0.3, pierce: 99, trail: '#ffb04a', charged: true });
    C.marks.push({ x: cx0, y: cy0, t: 0, life: 0.6, r: 56, col: '#ffb04a' });
    for (let i = 0; i < 34; i++) C.after(0.6 + i * 0.06, () => {
      const r2 = Math.sqrt(Math.random()) * 56, a2 = Math.random() * Math.PI * 2, x = cx0 + Math.cos(a2) * r2, y = cy0 + Math.sin(a2) * r2 * 0.7;
      G.fx.part({ x, y, z: 70, vz: -460, g: 0, life: 0.14, col: '#ffb04a', size: 1, glow: true, streak: true });
      C.after(0.14, () => { G.fx.sparks(x, y, 3, '#ff9a4a', 40); for (const e of C.foes()) if (U.dist(x, y, e.x, e.y) < 13 + (e.r || 8) * 0.5) hit(e, d.bowAtk * 0.55 * k, { src: 'arrow', w: 'bow', el: 'fire', kx: 0, ky: 0, power: 0.2 }); if (i % 4 === 0) sfx('shoot'); });
    });
    sfx('shootc'); busy(p, 'a_sunrain', 0.3, { k });
  };
  /* ── 마법 ── */
  DO.a_lance = (p, s, d, m, k) => {
    const a = ang(p); let L = 8;
    for (; L < 150; L += 6) if (!m.shotFree(p.x + Math.cos(a) * L, p.y - 9 + Math.sin(a) * L * 0.85, p.z || 0)) break;
    const x0 = p.x + Math.cos(a) * 8, y0 = p.y - 9 + Math.sin(a) * 7, x1 = p.x + Math.cos(a) * L, y1 = p.y - 9 + Math.sin(a) * L * 0.85;
    for (const e of onLine(x0, y0, x1, y1, 8)) hit(e, magBase(s, d) * 1.8 * k, { src: 'spell', w: 'magic', el: 'bolt', stun: 0.6, kx: Math.cos(a) * 0.3, ky: Math.sin(a) * 0.3, power: 0.3 });
    for (let i = 0; i < 3; i++) C.bolts.push({ x0, y0: y0 + (i - 1), x1, y1: y1 + (i - 1), t: i * 0.03 });
    addFx({ x: x0, y: y0 + 9, life: 0.2, sortBias: 30, paint(g, cx, cy) { const k2 = this.t / 0.2; g.save(); g.globalAlpha = 0.6 * (1 - k2); g.strokeStyle = '#fff8a8'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 - cx, y0 - cy); g.lineTo(x1 - cx, y1 - cy); g.stroke(); g.restore(); } });
    W().shake(2, 0.12); sfx('bolt'); busy(p, 'a_lance', 0.22, { k });
  };
  DO.a_vine = (p, s, d, m, k) => {
    const t = nearestIn(p, 150, 0.8), a = ang(p);
    const x = t ? t.x : p.x + Math.cos(a) * 70, y = t ? t.y : p.y + Math.sin(a) * 56;
    let tk = 0; const held = new Set();
    addFx({ x, y, life: 3, sortBias: -6, tick(dt) {
      for (const e of C.foes()) if (U.dist(this.x, this.y, e.x, e.y) < 36 + (e.r || 8)) { held.add(e); if (!e.boss) { e.stunT = Math.max(e.stunT || 0, 0.25); e.kx = 0; e.ky = 0; } else e.slowT = Math.max(e.slowT || 0, 0.3); e.poisonT = Math.max(e.poisonT || 0, 1); }
      tk -= dt; if (tk <= 0) { tk = 0.5; for (const e of held) if (!e.dead && U.dist(this.x, this.y, e.x, e.y) < 44) hit(e, magBase(s, d) * 0.35 * k, { src: 'spell', w: 'magic', el: 'poison', kx: 0, ky: 0, power: 0 }); }
    }, paint(g, cx, cy) { const x2 = this.x - cx, y2 = this.y - cy, gr = Math.min(1, this.t * 5), f = Math.min(1, (this.life - this.t) * 3); g.save(); g.globalAlpha = 0.3 * f; g.fillStyle = '#3a8a3a'; g.beginPath(); g.ellipse(x2, y2, 36 * gr, 16 * gr, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.9 * f; g.strokeStyle = '#5ac84a'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const a2 = i / 7 * Math.PI * 2 + this.t * 0.5, r2 = 30 * gr; g.beginPath(); g.moveTo(x2 + Math.cos(a2) * r2, y2 + Math.sin(a2) * r2 * 0.45); g.quadraticCurveTo(x2 + Math.cos(a2 + 0.6) * r2 * 0.5, y2 - 14 * gr + Math.sin(this.t * 4 + i) * 2, x2 + Math.cos(a2 + 1.2) * r2 * 0.3, y2 - 20 * gr); g.stroke(); } g.fillStyle = '#c84a8a'; for (let i = 0; i < 5; i++) { const a2 = i * 1.3; g.fillRect(Math.round(x2 + Math.cos(a2) * 18 * gr), Math.round(y2 - 8 + Math.sin(a2) * 6), 2, 2); } g.restore(); } });
    sfx('magic'); busy(p, 'a_vine', 0.25, { k });
  };
  DO.a_mirrorwall = (p, s, d, m, k) => {
    let tk = 0;
    addFx({ x: p.x, y: p.y, life: 3, sortBias: 12, tick(dt) {
      const pl = W().player; this.x = pl.x; this.y = pl.y;
      for (const e of W().ents) if (e instanceof C.Shot && e.owner !== 'player' && !e.dead && U.dist(e.x, e.y, pl.x, pl.y - 8) < 28) { e.owner = 'player'; e.vx = -e.vx * 1.2; e.vy = -e.vy * 1.2; e.dmg = (e.dmg || 1) * 1.5 * k; e.reflected = true; e.hit = new Set(); G.fx.ring(e.x, e.y, '#e8e0ff', 8, 0.2, 1); sfx('clank'); }
      tk -= dt; if (tk <= 0) { tk = 0.3; for (const e of near(pl.x, pl.y - 6, 26)) { const [nx, ny] = U.norm(e.x - pl.x, e.y - pl.y); hit(e, magBase(s, d) * 0.4 * k, { src: 'spell', w: 'magic', el: 'light', kx: nx, ky: ny, power: 1.6 }); } }
    }, paint(g, cx, cy) { const x2 = this.x - cx, y2 = this.y - cy - 9, f = Math.min(1, (this.life - this.t) * 3); g.save(); g.globalAlpha = 0.65 * f; g.strokeStyle = '#e8e0ff'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 6; i++) { const a2 = this.t * 1.5 + i / 6 * Math.PI * 2; const px2 = x2 + Math.cos(a2) * 24, py2 = y2 + Math.sin(a2) * 17; if (i) g.lineTo(px2, py2); else g.moveTo(px2, py2); } g.stroke(); g.globalAlpha = 0.12 * f; g.fillStyle = '#c8b8ff'; g.fill(); g.globalAlpha = 0.8 * f; g.fillStyle = '#ffffff'; const a3 = this.t * 6; g.fillRect(Math.round(x2 + Math.cos(a3) * 24), Math.round(y2 + Math.sin(a3) * 17), 2, 2); g.restore(); } });
    sfx('mirror'); busy(p, 'a_mirrorwall', 0.2, { k });
  };
  DO.a_tidal = (p, s, d, m, k) => {
    const a = ang(p), px = -Math.sin(a), py = Math.cos(a), done = new Set();
    addFx({ x: p.x + Math.cos(a) * 10, y: p.y + Math.sin(a) * 8, life: 0.85, sortBias: 18, tick(dt) {
      this.x += Math.cos(a) * 190 * dt; this.y += Math.sin(a) * 160 * dt;
      for (const e of C.foes()) { if (done.has(e)) continue; const dx = e.x - this.x, dy = e.y - this.y; const along = dx * Math.cos(a) + dy * Math.sin(a), side = dx * px + dy * py; if (Math.abs(along) < 12 && Math.abs(side) < 34) { done.add(e); e.wetT = 4; hit(e, magBase(s, d) * 1.7 * k, { src: 'spell', w: 'magic', el: 'ice', kx: Math.cos(a), ky: Math.sin(a), power: 2.4 }); G.fx.splash(e.x, e.y); } }
    }, paint(g, cx, cy) { const x2 = this.x - cx, y2 = this.y - cy - 6, f = Math.min(1, (this.life - this.t) * 4); g.save(); g.translate(x2, y2); g.rotate(a); g.globalAlpha = 0.5 * f; g.fillStyle = '#4a9ad8'; g.beginPath(); g.ellipse(0, 0, 9, 34, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.85 * f; g.strokeStyle = '#d8f4ff'; g.lineWidth = 2; g.beginPath(); g.arc(-8, 0, 30, -1.1, 1.1); g.stroke(); g.fillStyle = '#ffffff'; for (let i = -3; i <= 3; i++) g.fillRect(4 + Math.sin(this.t * 20 + i) * 2, i * 9, 2, 2); g.restore(); if (Math.random() < 0.6) G.fx.splash(this.x + px * (Math.random() - 0.5) * 60, this.y + py * (Math.random() - 0.5) * 60); } });
    sfx('splash'); W().shake(2, 0.2); busy(p, 'a_tidal', 0.3, { k });
  };
  DO.a_eclipse = (p, s, d, m, k) => {
    const Wd = W(), v = Wd.view;
    const onScreen = (e) => e.x > Wd.rcx - 8 && e.x < Wd.rcx + v.w + 8 && e.y > Wd.rcy - 8 && e.y < Wd.rcy + v.h + 24;
    if (G.cine && G.cine.flash) G.cine.flash('#1a0a2a', 0.5, 0.4);
    let n = 0;
    addFx({ x: p.x, y: p.y, life: 2.4, sortBias: 50, tick(dt) {
      this.tk = (this.tk || 0) - dt;
      if (this.tk <= 0 && n < 7) { this.tk = 0.3; n++; const list = C.foes().filter(onScreen).slice(0, 8); for (const e of list) { C.bolts.push({ x0: e.x + (Math.random() - 0.5) * 10, y0: e.y - 120, x1: e.x, y1: e.y - 8, t: 0.1 }); hit(e, magBase(s, d) * 0.8 * k, { src: 'spell', w: 'magic', el: 'dark', kx: 0, ky: 0, power: 0.1 }); G.fx.sparks(e.x, e.y - 8, 4, '#c49bff', 60); } if (list.length) sfx('drain'); }
    }, end() { const pl = W().player; if (G.cine && G.cine.flash) G.cine.flash('#fff', 0.2, 0.3); for (const e of C.foes().filter(onScreen)) hit(e, magBase(s, d) * 1.6 * k, { src: 'spell', w: 'magic', el: 'light', kx: 0, ky: 0, power: 0.6, crit: true }); W().shake(4, 0.3); sfx('white'); if (pl) G.fx.ring(pl.x, pl.y - 8, '#fff8d0', 60, 0.5, 3); },
    paint(g) { const f = Math.min(1, this.t * 4, (this.life - this.t) * 4); g.save(); g.globalAlpha = 0.35 * f; g.fillStyle = '#0a0414'; g.fillRect(0, 0, v.w, v.h); g.globalAlpha = 0.9 * f; const sx = v.w * 0.8, sy = 24; g.fillStyle = '#fff8d0'; g.beginPath(); g.arc(sx, sy, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0a0414'; g.beginPath(); g.arc(sx + 3 - Math.min(3, this.t * 6), sy, 9.5, 0, Math.PI * 2); g.fill(); g.restore(); } });
    p.inv = Math.max(p.inv, 0.4); sfx('drain'); busy(p, 'a_eclipse', 0.4, { k });
  };
  // 젖은 적: 번개 ×1.5 · 연속 사격 (걸으며 겨눈 쪽으로)
  const modW = C.dmgMod;
  C.dmgMod = function (e, info, amt) { let kk = modW ? modW.apply(this, arguments) : 1; if (kk === 0) return 0; if (e.wetT > 0 && info.el === 'bolt') kk *= 1.5; return kk; };

  /* ═════════ 필살기 열 ═════════ */
  const SPS = D.SPECIALS, MV = G.specials.MOVES;
  const onScreen = (e) => { const Wd = W(), v = Wd.view; return e.x > Wd.rcx - 8 && e.x < Wd.rcx + v.w + 8 && e.y > Wd.rcy - 8 && e.y < Wd.rcy + v.h + 24; };
  const spHit = (e, amt, o) => C.damage(e, amt, Object.assign({ src: 'special', kx: 0, ky: 0, power: 0.4, unblockable: true, skill: true }, o));
  const NEWSP = {
    skysplit: { type: 'sword', name: '하늘 가르기', grade: 3, req: { str: 11, lv: 16 }, desc: '뛰어올라 앞쪽 일직선에 거대한 칼날 셋을 내리꽂는다.' },
    bladestorm: { type: 'sword', name: '검의 폭풍', grade: 4, req: { str: 15, lv: 26 }, desc: '4초 동안 칼날 소용돌이가 곁을 따라다니며 둘레를 베고 끌어당긴다 — 그동안 마음대로 싸운다.' },
    oblivion: { type: 'sword', name: '무명', grade: 5, req: { str: 21, lv: 40 }, desc: '시간이 멎은 사이 화면의 적 여덟을 차례로 베고 돌아온다. 마지막에 모두 갈라진다.' },
    arrowwall: { type: 'bow', name: '화살 장벽', grade: 3, req: { dex: 11, lv: 16 }, desc: '겨눈 쪽 세 칸 앞에 3초 동안 화살 벽 — 넘어오는 적은 계속 꽂히고 느려진다.' },
    phoenix: { type: 'bow', name: '불사조', grade: 4, req: { dex: 15, lv: 26 }, desc: '불새가 앞으로 날아가며 모든 것을 꿰뚫고, 지나간 자리를 태운다.' },
    skyfall: { type: 'bow', name: '천공 연사', grade: 4, req: { dex: 16, lv: 28 }, desc: '하늘로 쏜 화살 스물넷이 화면의 적들에게 셋씩 떨어진다.' },
    aurora: { type: 'bow', name: '오로라', grade: 5, req: { dex: 22, lv: 40 }, desc: '빛줄기 다섯이 부채꼴로 1.4초 동안 쏟아진다. 겨눈 쪽을 따라 돈다.' },
    tempest: { type: 'magic', name: '폭풍우', grade: 3, req: { int: 11, lv: 16 }, desc: '3초 동안 비가 쏟아지고 화면의 적에게 벼락이 열두 번 떨어진다.' },
    glacier: { type: 'magic', name: '빙하 시대', grade: 4, req: { int: 16, lv: 28 }, desc: '얼음 가시가 세 겹으로 솟아 둘레를 모두 얼린다.' },
    supernova: { type: 'magic', name: '초신성', grade: 5, req: { int: 22, lv: 40 }, desc: '1.2초 모은 별빛이 화면 전체로 터진다 (모으는 동안 무적).' },
  };
  Object.assign(SPS, NEWSP);
  const sd = () => G.st.derive(S());
  Object.assign(MV, {
    skysplit: {
      start(p) { p.spx.dur = 0.85; p.spx.a = ang(p); p.spx.n = 0; sfx('jump'); },
      update(p) {
        const X = p.spx, k = X.t / 0.35; p.jz = X.t < 0.35 ? Math.sin(Math.min(1, k) * Math.PI) * 18 : 0; p.atkFrame = X.t < 0.3 ? 0 : 2;
        while (X.t >= 0.35 + X.n * 0.12 && X.n < 3) {
          X.n++; const d = sd(), dist = 18 + X.n * 26, x = p.x + Math.cos(X.a) * dist, y = p.y + Math.sin(X.a) * dist * 0.85;
          addFx({ x, y, life: 0.35, sortBias: 40, paint(g, cx, cy) { const k2 = this.t / 0.35, h = 60 * (1 - k2 * 0.3); g.save(); g.globalAlpha = 1 - k2; g.fillStyle = '#fff8e0'; g.fillRect(Math.round(x - cx) - 3, Math.round(y - cy) - h, 6, h); g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - cx) - 1, Math.round(y - cy) - h, 2, h); g.restore(); } });
          for (const e of C.foes()) if (U.dist(x, y, e.x, e.y) < 24 + (e.r || 8)) spHit(e, d.atk * 3 * d.specialMul, { el: d.el, stun: 0.8, power: 1 });
          G.fx.ring(x, y, '#fff4c8', 22, 0.3, 2); G.fx.dust(x, y, 8); W().shake(3, 0.15); sfx('impact'); C.cutArc(W().map, x, y - 4, 0, 18, Math.PI * 2);
        }
        return X.t >= X.dur;
      },
    },
    bladestorm: {
      start(p) {
        p.spx.dur = 0.3; const d = sd(); let tk = 0;
        addFx({ x: p.x, y: p.y, life: 4, sortBias: 10, tick(dt) {
          const pl = W().player; this.x = pl.x; this.y = pl.y; tk -= dt;
          for (const e of C.foes()) if (!e.boss && (e.weight || 1) < 4 && U.dist(pl.x, pl.y, e.x, e.y) < 70) { const [nx, ny] = U.norm(pl.x - e.x, pl.y - e.y); E.move(W().map, e, nx * 40 * dt, ny * 40 * dt); }
          if (tk <= 0) { tk = 0.15; for (const e of near(pl.x, pl.y - 6, 40)) { const [nx, ny] = U.norm(e.x - pl.x, e.y - pl.y); spHit(e, d.atk * 0.62 * d.specialMul, { kx: nx * 0.2, ky: ny * 0.2, el: d.el }); } C.cutArc(W().map, pl.x, pl.y - 4, 0, 34, Math.PI * 2); }
          if (Math.random() < 0.3) sfx('swing');
        }, paint(g, cx, cy) { const x = this.x - cx, y = this.y - cy - 8, f = Math.min(1, (this.life - this.t) * 3); g.save(); g.globalAlpha = 0.8 * f; for (let i = 0; i < 5; i++) { const a = this.t * 9 + i * 1.256, r = 22 + Math.sin(this.t * 6 + i) * 6; g.save(); g.translate(Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r * 0.7)); g.rotate(a + Math.PI / 2); g.fillStyle = '#e8eef8'; g.fillRect(-1, -6, 3, 10); g.fillStyle = '#ffffff'; g.fillRect(0, -6, 1, 9); g.fillStyle = '#c8a050'; g.fillRect(-2, 3, 5, 1); g.restore(); } g.strokeStyle = 'rgba(232,244,255,0.4)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 34, 24, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } });
        sfx('spin');
      },
      update(p) { p.atkFrame = 1; return p.spx.t >= p.spx.dur; },
    },
    oblivion: {
      start(p) {
        const X = p.spx; X.list = C.foes().filter(onScreen).sort((a, b) => U.dist(p.x, p.y, a.x, a.y) - U.dist(p.x, p.y, b.x, b.y)).slice(0, 8); X.i = 0; X.home = [p.x, p.y]; X.dur = 0.3 + X.list.length * 0.11 + 0.5;
        W().slowmo(0.2, X.dur); if (G.cine && G.cine.flash) G.cine.flash('#2a2440', 0.4, 0.3);
      },
      update(p) {
        const X = p.spx, d = sd();
        while (X.i < X.list.length && X.t >= 0.25 + X.i * 0.11) {
          const e = X.list[X.i++]; if (e.dead) continue;
          if (p.sheet) { const img = p.sheet.get('atk', p.dir, 1); if (img) G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.7); }
          const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); p.x = e.x - nx * 10; p.y = e.y - ny * 8; p.face = [nx, ny]; p.dir = U.dir4(nx, ny, p.dir);
          spHit(e, d.atk * 4 * d.specialMul, { el: d.el, kx: nx * 0.3, ky: ny * 0.3, crit: true });
          G.fx.slash(e.x, e.y - 8, Math.atan2(ny, nx), '#ffffff', 20); sfx('slash');
        }
        if (X.i >= X.list.length && !X.back && X.t >= 0.3 + X.list.length * 0.11) {
          X.back = true; p.x = X.home[0]; p.y = X.home[1]; G.ent.settle(W().map, p);
          C.after(0.2, () => { if (G.cine && G.cine.flash) G.cine.flash('#fff', 0.2, 0.3); for (const e of X.list) if (!e.dead) { G.fx.slash(e.x, e.y - 8, Math.random() * 3, '#fff4c8', 26); spHit(e, d.atk * 2.5 * d.specialMul, { el: 'light', crit: true }); } W().shake(5, 0.35); sfx('white'); });
        }
        p.atkFrame = 1;
        return X.t >= X.dur;
      },
    },
    arrowwall: {
      start(p) {
        p.spx.dur = 0.35; const d = sd(), a = ang(p), cx0 = p.x + Math.cos(a) * 48, cy0 = p.y + Math.sin(a) * 40, px = -Math.sin(a), py = Math.cos(a); let tk = 0;
        addFx({ x: cx0, y: cy0, life: 3, sortBias: 4, tick(dt) {
          tk -= dt; if (tk > 0) return; tk = 0.25;
          for (const e of C.foes()) { const dx = e.x - cx0, dy = e.y - cy0, along = dx * Math.cos(a) + dy * Math.sin(a), side = dx * px + dy * py; if (Math.abs(along) < 14 && Math.abs(side) < 44) { spHit(e, d.bowAtk * 0.85 * d.specialMul, { src: 'arrow', w: 'bow' }); e.slowT = Math.max(e.slowT || 0, 0.5); } }
        }, paint(g, cx, cy) { const f = Math.min(1, this.t * 6, (this.life - this.t) * 4); g.save(); g.globalAlpha = f; for (let i = -5; i <= 5; i++) { const x = Math.round(cx0 + px * i * 8 - cx), y = Math.round(cy0 + py * i * 8 - cy); g.fillStyle = '#8a5a30'; g.fillRect(x, y - 9, 1, 9); g.fillStyle = '#e8e8f0'; g.fillRect(x - 1, y - 11, 3, 2); g.fillStyle = '#ff8a8a'; g.fillRect(x - 1, y - 2, 3, 1); } g.restore(); } });
        for (let i = -5; i <= 5; i++) C.after(0.02 * (i + 5), () => G.fx.part({ x: cx0 + px * i * 8, y: cy0 + py * i * 8, z: 60, vz: -400, g: 0, life: 0.15, col: '#fff4c8', size: 1, glow: true, streak: true }));
        sfx('shootc');
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    phoenix: {
      start(p) {
        p.spx.dur = 0.4; const d = sd(), a = ang(p);
        C.shoot({ kind: 'orb', skill: true, x: p.x + Math.cos(a) * 12, y: p.y - 4 + Math.sin(a) * 10, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210, dmg: d.bowAtk * 4 * d.specialMul, src: 'special', w: 'bow', el: 'fire', r: 14, life: 1.4, pierce: 99, power: 1.4, ghost: true, owner: 'player', z: p.z, trail: '#ffb04a',
          onUpdate() { if (Math.random() < 0.5) for (const e of C.foes()) if (U.dist(this.x, this.y, e.x, e.y) < 30) e.burnT = Math.max(e.burnT || 0, 3); },
          drawFn(g, x, y) { const an = Math.atan2(this.vy, this.vx), fl = Math.sin(this.t * 30); g.save(); g.translate(x, y); g.rotate(an); g.globalAlpha = 0.5; g.fillStyle = '#ff5a2a'; g.beginPath(); g.moveTo(-26, 0); g.lineTo(-8, -6 - fl * 3); g.lineTo(-8, 6 + fl * 3); g.fill(); g.globalAlpha = 0.95; g.fillStyle = '#ff8a3a'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-6, -14 - fl * 4); g.lineTo(-2, 0); g.lineTo(-6, 14 + fl * 4); g.closePath(); g.fill(); g.fillStyle = '#ffd84a'; g.beginPath(); g.ellipse(2, 0, 7, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(6, -1, 2, 2); g.restore(); } });
        sfx('fire'); sfx('shootc'); W().shake(2.5, 0.2);
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    skyfall: {
      start(p) {
        p.spx.dur = 0.4; const d = sd(), list = C.foes().filter(onScreen);
        for (let i = 0; i < 24; i++) G.fx.part({ x: p.x + (Math.random() - 0.5) * 8, y: p.y - 10, z: 0, vz: 420, g: 0, life: 0.25, col: '#fff4c8', size: 1, glow: true, streak: true });
        let n = 0;
        for (const e of list.slice(0, 8)) for (let j = 0; j < 3; j++) { const dl = 0.45 + (n++) * 0.04; C.after(dl, () => { if (e.dead) return; G.fx.part({ x: e.x + (Math.random() - 0.5) * 6, y: e.y, z: 70, vz: -460, g: 0, life: 0.14, col: '#fff4c8', size: 1, glow: true, streak: true }); C.after(0.14, () => { if (!e.dead) { spHit(e, d.bowAtk * 1.4 * d.specialMul, { src: 'arrow', w: 'bow', stun: 0.2 }); G.fx.sparks(e.x, e.y - 6, 3, '#fff4c8', 40); } }); if (j === 0) sfx('shoot'); }); }
        sfx('shootc');
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    aurora: {
      start(p) {
        p.spx.dur = 1.5; const d = sd(); let tk = 0; const COL = ['#8affd8', '#8ad8ff', '#c8a8ff', '#ffa8d8', '#fff0a8'];
        addFx({ x: p.x, y: p.y, life: 1.45, sortBias: 40, tick(dt) {
          const pl = W().player; this.x = pl.x; this.y = pl.y; this.a = U.angle(pl.face[0], pl.face[1]);
          tk -= dt; if (tk > 0) return; tk = 0.1;
          for (let i = 0; i < 5; i++) { const a = this.a + (i - 2) * 0.22, x1 = pl.x + Math.cos(a) * 160, y1 = pl.y - 9 + Math.sin(a) * 136; for (const e of onLine(pl.x, pl.y - 9, x1, y1, 6)) spHit(e, d.bowAtk * 0.3 * d.specialMul, { src: 'arrow', w: 'bow', el: 'light' }); }
        }, paint(g, cx, cy) { const x = this.x - cx, y = this.y - cy - 9, f = Math.min(1, this.t * 6, (this.life - this.t) * 5), a0 = this.a || 0; g.save(); for (let i = 0; i < 5; i++) { const a = a0 + (i - 2) * 0.22, x1 = x + Math.cos(a) * 160, y1 = y + Math.sin(a) * 136; g.globalAlpha = 0.45 * f; g.strokeStyle = COL[i]; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x1, y1); g.stroke(); g.globalAlpha = 0.9 * f; g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x1, y1); g.stroke(); } g.restore(); } });
        sfx('beam'); if (G.light && G.light.flare) G.light.flare(p.x, p.y, 120, 3, '#c8f0ff');
      },
      update(p) { if (Math.random() < 0.2) sfx('beam'); return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    tempest: {
      start(p) {
        p.spx.dur = 0.4; const d = sd(); let n = 0;
        addFx({ x: p.x, y: p.y, life: 3.1, sortBias: 60, tick(dt) {
          this.tk = (this.tk || 0) - dt;
          if (this.tk <= 0 && n < 12) { this.tk = 0.25; n++; const list = C.foes().filter(onScreen); if (list.length) { const e = list[Math.floor(Math.random() * list.length)]; C.bolts.push({ x0: e.x + (Math.random() - 0.5) * 30, y0: e.y - 130, x1: e.x, y1: e.y - 8, t: 0 }); for (const f of C.foes()) if (U.dist(f.x, f.y, e.x, e.y) < 22) spHit(f, (4 + S().lv * 0.25) * d.magMul * 0.55 * d.specialMul, { src: 'spell', w: 'magic', el: 'bolt', stun: 0.5 }); W().shake(2, 0.1); sfx('bolt'); } }
        }, paint(g) { const v = W().view, f = Math.min(1, this.t * 4, (this.life - this.t) * 4); g.save(); g.globalAlpha = 0.25 * f; g.fillStyle = '#1a2440'; g.fillRect(0, 0, v.w, v.h); g.globalAlpha = 0.55 * f; g.strokeStyle = '#a8c8e8'; g.lineWidth = 1; for (let i = 0; i < 40; i++) { const x = (i * 37 + this.t * 300) % v.w, y = (i * 53 + this.t * 900) % v.h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 8); g.stroke(); } g.restore(); } });
        sfx('thunder');
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    glacier: {
      start(p) {
        p.spx.dur = 0.9; const d = sd(), mb = (4 + S().lv * 0.25) * d.magMul;
        for (let w2 = 0; w2 < 3; w2++) C.after(0.15 + w2 * 0.22, () => {
          const r = 30 + w2 * 30, pl = W().player;
          for (let i = 0; i < 10 + w2 * 6; i++) { const a = i / (10 + w2 * 6) * Math.PI * 2, x = pl.x + Math.cos(a) * r, y = pl.y + Math.sin(a) * r * 0.7; addFx({ x, y, life: 0.7, sortBias: 2, paint(g, cx, cy) { const k2 = this.t / 0.7, h = (k2 < 0.2 ? k2 / 0.2 : 1 - (k2 - 0.2) * 0.6) * 14; g.save(); g.globalAlpha = 1 - Math.max(0, k2 - 0.7) * 3; g.fillStyle = '#bfe8ff'; g.beginPath(); g.moveTo(Math.round(x - cx) - 3, Math.round(y - cy)); g.lineTo(Math.round(x - cx), Math.round(y - cy) - h); g.lineTo(Math.round(x - cx) + 3, Math.round(y - cy)); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - cx) - 1, Math.round(y - cy - h * 0.7), 1, Math.round(h * 0.5)); g.restore(); } }); }
          for (const e of C.foes()) { const dd = U.dist(pl.x, pl.y, e.x, e.y); if (dd > r - 18 && dd < r + 16 + (e.r || 8)) { spHit(e, mb * 2 * d.specialMul, { src: 'spell', w: 'magic', el: 'ice' }); e.freezeT = Math.max(e.freezeT || 0, 2); } }
          G.fx.ring(pl.x, pl.y, '#bfe8ff', r + 8, 0.35, 2); W().shake(2.5, 0.15); sfx('freeze'); sfx('ice');
        });
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    supernova: {
      start(p) { p.spx.dur = 1.6; p.spx.boom = false; p.inv = Math.max(p.inv, 1.5); sfx('charge'); W().slowmo(0.6, 1.2); },
      update(p) {
        const X = p.spx;
        if (!X.boom) {
          if (Math.random() < 0.9) { const a = Math.random() * Math.PI * 2, r = 50 - X.t * 30; G.fx.part({ x: p.x + Math.cos(a) * r, y: p.y - 10 + Math.sin(a) * r * 0.7, z: 0, vx: -Math.cos(a) * 80, vy: -Math.sin(a) * 56, vz: 0, g: 0, life: 0.3, col: ['#fff8d0', '#ffd84a', '#ff8ad8', '#8ad8ff'][Math.floor(Math.random() * 4)], size: 1, glow: true }); }
          p.inv = Math.max(p.inv, 0.3);
          if (X.t >= 1.2) {
            X.boom = true; const d = sd(), mb = (4 + S().lv * 0.25) * d.magMul;
            if (G.cine && G.cine.flash) G.cine.flash('#fff', 0.5, 0.5);
            for (const e of C.foes()) if (U.dist(p.x, p.y, e.x, e.y) < 170) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); spHit(e, mb * 9 * d.specialMul, { src: 'spell', w: 'magic', el: 'light', kx: nx, ky: ny, power: 2, crit: true }); }
            for (let i = 0; i < 4; i++) G.fx.ring(p.x, p.y - 8, ['#ffffff', '#fff0a8', '#ff8ad8', '#8ad8ff'][i], 40 + i * 40, 0.6 + i * 0.1, 3);
            W().shake(8, 0.6); W().hitstop(0.15); sfx('explode'); sfx('white'); if (G.light && G.light.flare) G.light.flare(p.x, p.y, 220, 8, '#fff8d0');
          }
        }
        return X.t >= X.dur;
      }, draw: 'cast',
    },
  });
  // 비기 (필살기 책)
  const ART_PRICE = { 3: 13000, 4: 36000, 5: 0 };
  for (const id in NEWSP) { const sp = NEWSP[id]; D.ITEMS['art_' + id] = { id: 'art_' + id, type: 'art', special: id, grade: sp.grade, price: ART_PRICE[sp.grade] || 0, name: '비기: ' + sp.name, desc: '읽으면 필살기 「' + sp.name + '」을 익힌다. ' + sp.desc }; }

  /* ═════════ 재능 나무 — 갈래마다 여섯 · 일곱 칸 더 ═════════ */
  const SK = D.SKILLS, P = G.prog;
  const ROW_REQ = [null, { lv: 1 }, { lv: 6 }, { lv: 12 }, { lv: 18 }, { lv: 26 }, { lv: 36 }, { lv: 44 }];
  const COST = [0, 2, 2, 3, 3, 4, 5, 5];
  const T = (tree, row, id, name, desc, o) => { const k = Object.assign({ id, tree, row, name, cost: COST[row], desc, grade: [1, 1, 1, 2, 3, 3, 4, 5][row] }, o || {}); k.req = Object.assign({}, ROW_REQ[row], (o && o.need) || {}); delete k.need; return k; };
  const gate = (id, g) => { const k = SK.find((x) => x.id === id); if (k) k.gate = g; };
  const has = (id) => !!(S() && S().skills && S().skills[id]);
  // 검술
  SK.push(
    T('검술', 1, 'sw_swift', '가벼운 걸음', '베는 동안 · 검 스킬을 쓰는 동안 걷는 빠르기 +60%.', { gate: 'sw1' }),
    T('검술', 2, 'as_draw', '스킬: 발도', '스킬 「발도」 — 거뒀다가 한 줄기로 뽑아 벤다.', { act: 'a_draw' }),
    T('검술', 3, 'sw_crit', '급소', '검으로 칠 때 10% 확률로 치명타가 더 터진다.', { gate: 'sw3', need: { str: 6 } }),
    T('검술', 4, 'as_moon', '스킬: 초승달 칼바람', '스킬 「초승달 칼바람」 — 천천히 나아가며 여러 번 벤다.', { act: 'a_crescent', need: { str: 10 } }),
    T('검술', 5, 'as_blades', '스킬: 검무', '스킬 「검무」 — 걸으며 앞쪽을 다섯 번 벤다.', { act: 'a_blades', need: { str: 14 } }),
    T('검술', 6, 'sw_vortex', '소용돌이', '회전 베기와 도는 검 스킬이 둘레 적을 끌어당긴다. 회전 베기 피해 +25%.', { gate: 'sw6', need: { str: 20 } }),
    T('검술', 7, 'as_judgment', '스킬: 일도양단', '스킬 「일도양단」 — 모았다가 아홉 칸을 가르는 한 칼.', { act: 'a_judgment', gate: 'sw7', need: { str: 26 } }),
  );
  // 궁술
  SK.push(
    T('궁술', 1, 'bw_steady', '침착', '활을 당기는 동안 · 활 스킬을 쓰는 동안 걷는 빠르기 +60%.', { gate: 'bw1' }),
    T('궁술', 2, 'as_scatter', '스킬: 산탄 사격', '스킬 「산탄 사격」 — 가까이에서 일곱 발이 퍼진다.', { act: 'a_scatter' }),
    T('궁술', 3, 'bw_trick', '곡사', '다 모은 화살이 벽에 한 번 튕긴다.', { gate: 'bw3', need: { dex: 6 } }),
    T('궁술', 4, 'as_volley2', '스킬: 연속 사격', '스킬 「연속 사격」 — 걸으며 겨눈 쪽으로 여덟 발.', { act: 'a_volley2', need: { dex: 10 } }),
    T('궁술', 5, 'as_mine', '스킬: 지뢰 화살', '스킬 「지뢰 화살」 — 땅에 꽂혀 다가오는 적을 터뜨린다.', { act: 'a_mine', need: { dex: 14 } }),
    T('궁술', 6, 'bw_wind', '바람의 가호', '화살 피해 +15%, 화살이 30% 빠르다.', { gate: 'bw6', need: { dex: 20 } }),
    T('궁술', 7, 'as_sunrain', '스킬: 태양 화살', '스킬 「태양 화살」 — 2초 동안 불화살 비.', { act: 'a_sunrain', gate: 'bw7', need: { dex: 26 } }),
  );
  // 마법
  SK.push(
    T('마법', 1, 'mg_glide', '떠 걷기', '주문을 거는 동안 · 마법 스킬을 쓰는 동안 걷는 빠르기 +60%.', { gate: 'mg1' }),
    T('마법', 2, 'as_lance', '스킬: 번개 창', '스킬 「번개 창」 — 곧은 번개가 꿰뚫는다.', { act: 'a_lance' }),
    T('마법', 3, 'mg_elem', '원소 공명', '앞 주문과 다른 원소의 주문을 3초 안에 이어 걸면 그 주문 +30%.', { gate: 'mg3', need: { int: 6 } }),
    T('마법', 4, 'as_vine', '스킬: 덩굴 감옥', '스킬 「덩굴 감옥」 — 겨눈 곳을 묶고 독을 올린다.', { act: 'a_vine', need: { int: 10 } }),
    T('마법', 5, 'as_mirror', '스킬: 거울 방벽', '스킬 「거울 방벽」 — 날아오는 것을 되받아친다.', { act: 'a_mirrorwall', need: { int: 14 } }),
    T('마법', 6, 'mg_cycle', '마력 순환', '어떤 스킬이든 쓰면 MP 8이 돌아오고, 마법 스킬 재사용 대기 -15%.', { gate: 'mg6', need: { int: 20 } }),
    T('마법', 7, 'as_eclipse', '스킬: 일식', '스킬 「일식」 — 화면의 적에게 검은 빛이 일곱 번.', { act: 'a_eclipse', gate: 'mg7', need: { int: 26 } }),
  );
  // 전환
  gate('tr_quick', 'tr1');
  SK.push(
    T('전환', 1, 'tr_ready', '채비', '바꿔 든 뒤 2초 동안 그 무기가 30% 빠르다 (베기 · 당기기 · 영창).', { gate: 'tr1' }),
    T('전환', 2, 'tr_relay', '이어달리기', '바꾸면 내려놓은 무기의 스킬 재사용 대기가 1.5초 준다.', { gate: 'tr2' }),
    T('전환', 3, 'tr_roll', '바꿔 구르기', '구르는 동안 바꾸면 무적이 0.3초 늘고 기력 15가 돌아온다.', { gate: 'tr3' }),
    T('전환', 4, 'tr_combo', '삼연 연계', '검 · 활 · 마법을 차례로(순서는 상관없이) 한 적에게 맞히면 셋째 공격 ×2와 폭발.', { gate: 'tr4', need: { str: 4, dex: 4, int: 4 } }),
    T('전환', 5, 'tr_surge', '전환 폭발', '바꿀 때 겨눈 쪽에 든 무기의 힘이 터진다 (4초마다).', { gate: 'tr5' }),
    T('전환', 6, 'tr_stance', '세 자세', '검을 들면 받는 피해 -12%, 활은 걷는 빠르기 +12%, 마법은 MP가 초마다 1 찬다.', { gate: 'tr6' }),
  );
  // 생존
  SK.push(
    T('생존', 2, 'sv_swift', '날쌘 발', '걷는 빠르기 +8%.'),
    T('생존', 3, 'sv_aid', '응급 방벽', '체력이 절반 아래로 떨어지면 한 번 막아 주는 방벽 (40초마다).', { gate: 'sv3', need: { vit: 6 } }),
    T('생존', 4, 'sv_riposte', '역습', '완벽 회피하면 둘레에 충격파 (든 무기 공격력 ×1.2).', { need: { sta: 8 } }),
    T('생존', 5, 'sv_vamp', '흡혈', '적을 쓰러뜨리면 12% 확률로 하트 ¼칸.', { gate: 'sv5', need: { vit: 12 } }),
    T('생존', 6, 'sv_tough', '강인함', '맞아도 밀려나지 않고, 받는 피해 -8%.', { gate: 'sv6', need: { vit: 18 } }),
    T('생존', 7, 'sv_ember', '불꽃 심장', '체력이 ¼ 아래로 떨어지는 순간 불꽃이 터지며(둘레 ×3) 3초 무적 (60초마다).', { gate: 'sv7', need: { vit: 22 } }),
  );
  // 도구
  gate('tl_pouch', 'tl1'); gate('tl_master', 'tl6');
  SK.push(
    T('도구', 1, 'tl_throw', '폭탄 던지기', '폭탄을 발밑에 놓지 않고 겨눈 쪽 세 칸 앞으로 던진다.', { gate: 'tl1' }),
    T('도구', 2, 'tl_sticky', '끈끈이 폭탄', '폭탄이 닿은 적에게 달라붙는다.', { gate: 'tl2' }),
    T('도구', 3, 'tl_chain', '쇠사슬 당기기', '갈고리에 걸린 작은 적을 끌어오고 1초 기절시킨다.', { gate: 'tl3' }),
    T('도구', 4, 'tl_flash', '섬광등', '등불을 켜는 순간 둘레 적이 1.5초 기절한다 (10초마다).', { gate: 'tl4' }),
    T('도구', 5, 'tl_mine', '매설', '놓아 둔 폭탄은 적이 다가오면 심지보다 먼저 터진다.', { gate: 'tl5' }),
    T('도구', 6, 'tl_alchemy', '연금술', '화살 · 폭탄을 주우면 MP 4 · 기력 10도 찬다. 물약 효과 +30%.', { gate: 'tl6' }),
  );
  gate('sw_combo', 'sw1'); gate('sw_grip', 'sw1');
  const TREES = D.TREES || ['검술', '궁술', '마법', '전환', '생존', '도구'];
  SK.sort((a, b) => TREES.indexOf(a.tree) - TREES.indexOf(b.tree) || a.row - b.row);

  /* ── 재능 효과 ── */
  const der0 = G.st.derive;
  G.st.derive = function (s) {
    const d = der0.apply(this, arguments);
    const k = (id) => !!(s.skills && s.skills[id]);
    const p = W() && W().player;
    if (k('tr_ready') && p && p.readyT > 0) { d.draw *= 0.7; d.castMul = (d.castMul || 1) * 0.7; }
    if (k('sv_tough')) d.def *= 0.92;
    if (k('tr_stance') && G.stance && G.stance.cur(s) === 'sword') d.def *= 0.88;
    if (k('tl_alchemy')) d.herb *= 1.3;
    return d;
  };
  const cdK0 = SN.cdK;
  SN.cdK = function (s, w) { let kk = cdK0 ? cdK0.apply(this, arguments) : 1; if (w === 'magic' && has('mg_cycle')) kk *= 0.85; return kk; };
  const SRCW = { sword: 'sword', spin: 'sword', dash: 'sword', beam: 'sword', lunge: 'sword', arrow: 'bow', spell: 'magic' };
  const TR = { elLast: null, elAt: -9, comboE: null, surgeAt: -9, aidAt: -999, emberAt: -999 };
  const modT = C.dmgMod;
  C.dmgMod = function (e, info, amt) {
    let kk = modT ? modT.apply(this, arguments) : 1; if (kk === 0) return 0;
    const w = info.w || SRCW[info.src]; const p = W().player;
    if (w === 'sword' && has('sw_crit') && !info.crit && Math.random() < 0.1) info.crit = true;
    if (info.src === 'spin' && has('sw_vortex')) kk *= 1.25;
    if (w === 'bow' && has('bw_wind')) kk *= 1.15;
    if (w === 'magic' && info.src === 'spell' && has('mg_elem') && TR.elBoostUntil > W().t) kk *= 1.3;
    // 삼연 연계: 한 적에게 세 무기를 차례로
    if (has('tr_combo') && w && p && !info.proc) {
      const c = e._combo || (e._combo = { ws: [], t: 0 });
      if (W().t - c.t > 4) c.ws = [];
      c.t = W().t;
      if (!c.ws.includes(w)) c.ws.push(w);
      if (c.ws.length >= 3) { c.ws = []; kk *= 2; const ex = e.x, ey = e.y - 8; C.after(0.05, () => { G.fx.ring(ex, ey, '#ffffff', 26, 0.35, 3); G.fx.float(ex, ey - 14, '삼연!', '#ffffff', { big: true, life: 0.8 }); for (const f of near(ex, ey, 28)) C.damage(f, Math.max(G.st.derive(S()).atk, G.st.derive(S()).bowAtk), { src: 'special', proc: true, skill: true, kx: 0, ky: 0, power: 1 }); sfx('crit'); }); }
    }
    return kk;
  };
  const cast2 = C.onCast;
  C.onCast = function (p, id) {
    if (cast2) cast2.apply(this, arguments);
    const sp = D.SPELLS[id], el = ({ fire: 'fire', ice: 'ice', bolt: 'bolt', wind: 'wind', quake: 'earth', meteor: 'fire', light: 'light', heal: 'light' })[id] || (sp && sp.el) || id;
    if (has('mg_elem') && TR.elLast && TR.elLast !== el && W().t - TR.elAt < 3) { TR.elBoostUntil = W().t + 0.8; G.fx.float(p.x, p.y - 30, '공명', '#a8c8ff', { life: 0.5 }); }
    TR.elLast = el; TR.elAt = W().t;
  };
  const onSwap0 = SN.onSwap;
  SN.onSwap = function (p, s, from, to) {
    if (onSwap0) onSwap0.apply(this, arguments);
    if (has('tr_ready')) { p.readyT = 2; if (to === 'sword') p.frenzyT = Math.max(p.frenzyT || 0, 2); }
    if (has('tr_relay')) { const id = SN.equipped(s, from); if (id && SN.ST.cd[id] > 0) SN.ST.cd[id] = Math.max(0, SN.ST.cd[id] - 1.5); }
    if (has('tr_roll') && p.state === 'roll') { p.inv = Math.max(p.inv, 0.3) + 0.3; p.stamina = Math.min(p.staminaMax, p.stamina + 15); G.fx.ring(p.x, p.y - 8, '#8ad8ff', 14, 0.25, 1); }
    if (has('tr_surge') && W().t - TR.surgeAt > 4) {
      TR.surgeAt = W().t; const d = G.st.derive(s), a = U.angle(p.face[0], p.face[1]), x = p.x + Math.cos(a) * 30, y = p.y + Math.sin(a) * 24;
      const col = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' }[to], amt = to === 'sword' ? d.atk : to === 'bow' ? d.bowAtk : magBase(s, d);
      blast(x, y - 4, 26, amt * 1.1, { src: to === 'magic' ? 'spell' : to === 'bow' ? 'arrow' : 'sword', w: to, proc: true }, col); sfx('explode');
    }
  };
  // 걷는 빠르기 (공격 중 · 평소) · MP · 응급 방벽 · 불꽃 심장
  const up2 = C.update;
  let lastHp2 = null;
  C.update = function (dt) {
    const r = up2.apply(this, arguments);
    const p = W() && W().player, s = S(); if (!p || !s) return r;
    if (p.readyT > 0) p.readyT -= dt;
    const st = p.state, w = G.stance.cur(s);
    let am = 1;
    if (has('sw_swift') && (st === 'attack' || st === 'spin' || st === 'charge' || (st === 'skill' && w === 'sword'))) am = 1.6;
    if (has('bw_steady') && (st === 'bow' || (st === 'skill' && w === 'bow'))) am = 1.6;
    if (has('mg_glide') && (st === 'cast' || (st === 'skill' && w === 'magic'))) am = 1.6;
    p.actMoveMul = am;
    p.baseSpeed = p.baseSpeed || p.speed;
    p.speed = p.baseSpeed * (has('sv_swift') ? 1.08 : 1) * (has('tr_stance') && w === 'bow' ? 1.12 : 1);
    if (has('tr_stance') && w === 'magic') { const d = G.st.derive(s); s.mp = Math.min(d.mpMax, s.mp + dt); }
    // 연속 사격
    if (p.volleyT > 0) {
      p.volleyT -= dt; p.volleyTick -= dt;
      if (p.volleyTick <= 0 && !G.script.running) { p.volleyTick = 0.15; const d = G.st.derive(s), a = C.faceAim ? C.faceAim(p, 'bow') : U.angle(p.face[0], p.face[1]); arrow(p, d, a, { dmg: d.bowAtk * 0.75 * (p.volleyK || 1), charged: false, trail: '#e8f0c0' }); sfx('shoot'); }
    }
    const d = G.st.derive(s);
    if (lastHp2 != null && s.hp < lastHp2) {
      if (has('sv_aid') && s.hp < d.hpMax / 2 && lastHp2 >= d.hpMax / 2 && W().t - TR.aidAt > 40) { TR.aidAt = W().t; p.barrier = Math.max(p.barrier || 0, 1); G.fx.ring(p.x, p.y - 10, '#fff4c8', 18, 0.4, 2); G.fx.float(p.x, p.y - 34, '응급 방벽', '#fff4c8', { life: 0.8 }); sfx('barrier'); }
      if (has('sv_ember') && s.hp <= d.hpMax / 4 && lastHp2 > d.hpMax / 4 && W().t - TR.emberAt > 60) { TR.emberAt = W().t; p.inv = Math.max(p.inv, 3); blast(p.x, p.y - 8, 44, Math.max(d.atk, d.bowAtk, magBase(s, d)) * 3, { src: 'special', el: 'fire', proc: true }, '#ff8a3a'); G.fx.float(p.x, p.y - 36, '불꽃 심장', '#ffb04a', { big: true, life: 1 }); sfx('explode'); }
    }
    lastHp2 = s.hp;
    // 갈고리: 쇠사슬 당기기
    if (has('tl_chain') && p.hook) { const h = p.hook, hx = h.x + Math.cos(h.a) * h.d, hy = h.y + Math.sin(h.a) * h.d; h.pulled = h.pulled || new Set(); for (const e of C.foes()) if (!h.pulled.has(e) && !e.boss && (e.weight || 1) < 3 && U.dist(hx, hy, e.x, e.y - 8) < 12) { h.pulled.add(e); const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 320; e.ky = ny * 320; e.stunT = Math.max(e.stunT || 0, 1); G.fx.sparks(e.x, e.y - 8, 5, '#d8d8e8', 60); sfx('hook'); } }
    // 섬광등
    if (has('tl_flash') && p.lantern && !TR.lampWas && W().t - (TR.flashAt || -99) > 10) { TR.flashAt = W().t; G.fx.ring(p.x, p.y - 8, '#fff8d0', 50, 0.4, 2); if (G.light && G.light.flare) G.light.flare(p.x, p.y, 120, 3); for (const e of near(p.x, p.y, 56)) e.stunT = Math.max(e.stunT || 0, e.boss ? 0.5 : 1.5); sfx('white'); }
    TR.lampWas = !!p.lantern;
    return r;
  };
  // 강인함: 밀려나지 않는다
  const hm2 = C.hurtMod;
  C.hurtMod = function (p, q, src, opt) { const r = hm2 ? hm2.apply(this, arguments) : true; if (r === false) return false; if (has('sv_tough') && opt) opt.noKnock = true; return r; };
  // 역습: 완벽 회피의 충격파
  C.onPerfect = (function (pf0) { return function (p) { if (pf0) pf0.apply(this, arguments); if (has('sv_riposte')) { const s = S(), d = G.st.derive(s), w = G.stance.cur(s), amt = w === 'sword' ? d.atk : w === 'bow' ? d.bowAtk : magBase(s, d); C.after(0.05, () => blast(p.x, p.y - 8, 36, amt * 1.2, { src: 'special', w, proc: true }, '#8ad8ff')); } }; })(C.onPerfect);
  // 흡혈 · 소용돌이 · 마력 순환 (스킬을 쓸 때)
  const kill2 = C.onKill;
  C.onKill = function (e, info) { if (kill2) kill2.apply(this, arguments); if (has('sv_vamp') && Math.random() < 0.12) { const s = S(), d = G.st.derive(s); if (s.hp < d.hpMax) { s.hp = Math.min(d.hpMax, s.hp + 1); G.fx.float(W().player.x, W().player.y - 30, '+¼', '#ff8a96', { life: 0.5 }); } } };
  const spinV = C.onSpin;
  C.onSpin = function (p) { if (spinV) spinV.apply(this, arguments); if (has('sw_vortex')) pull(p, 64, 0.5); };
  function pull(p, r, dur) { let t = 0; const tick = () => { t += 0.05; for (const e of C.foes()) if (!e.boss && (e.weight || 1) < 4 && U.dist(p.x, p.y, e.x, e.y) < r) { const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); E.move(W().map, e, nx * 6, ny * 5); } if (t < dur) C.after(0.05, tick); }; tick(); G.fx.ring(p.x, p.y - 6, '#c8d8ff', r, 0.35, 1); }
  const used2 = SN.used;
  SN.used = function (s, id) {
    const r = used2 ? used2.apply(this, arguments) : undefined;
    const p = W().player;
    if (p && has('sw_vortex') && ['a_cyclone', 'a_spin3', 'a_storm2', 'a_tornado'].includes(id)) pull(p, 64, 0.6);
    if (has('mg_cycle')) { const d = G.st.derive(s); s.mp = Math.min(d.mpMax, s.mp + 8); }
    return r;
  };
  // 곡사: 다 모은 화살이 벽에 한 번 튕긴다
  const shT = C.onShoot;
  C.onShoot = function (o) {
    o = (shT ? shT.apply(this, arguments) : null) || o;
    if (o && o.owner !== 'foe' && o.src === 'arrow' && !o.proc) {
      if (has('bw_wind')) { o.vx *= 1.3; o.vy *= 1.3; }
      if (has('bw_trick') && o.charged) o.wallBounce = (o.wallBounce || 0) + 1;
    }
    return o;
  };
  if (C.Shot) {
    const su = C.Shot.prototype.update;
    C.Shot.prototype.update = function (dt, Wd) {
      if (this.wallBounce > 0 && !this.dead && Wd && Wd.map) {
        const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt, z = this.z || 0;
        if (!Wd.map.shotFree(nx, ny - (this.zoff || 10) * 0, z)) {
          const hx = !Wd.map.shotFree(nx, this.y, z), hy = !Wd.map.shotFree(this.x, ny, z);
          if (hx || !hy) this.vx = -this.vx; if (hy || !hx) this.vy = -this.vy;
          this.wallBounce--; this.hit = new Set(); G.fx.sparks(this.x, this.y, 4, '#e8e0cc', 50); sfx('clank');
        }
      }
      return su.apply(this, arguments);
    };
  }
  // 폭탄: 던지기 · 끈끈이 · 매설 · 연금술(주울 때)
  const tool2 = C.toolUsed;
  C.toolUsed = function (k, p, obj) {
    if (tool2) tool2.apply(this, arguments);
    if (k !== 'bomb' || !obj) return;
    if (has('tl_throw')) { const a = C.aimFor ? C.aimFor(p, 'throw').a : U.angle(p.face[0], p.face[1]); let tx = obj.x, ty = obj.y; const m = W().map; for (let r = 10; r <= 50; r += 4) { const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * 0.85; if (!m.shotFree(x, y - 6, p.z || 0)) break; tx = x; ty = y; } obj.thr = { x0: obj.x, y0: obj.y, x1: tx, y1: ty, t: 0, dur: 0.35 }; sfx('throw'); }
    if (has('tl_sticky')) obj.sticky = true;
    if (has('tl_mine')) obj.mine = true;
  };
  const bombProto = { patched: false };
  function patchBomb(b) {
    if (bombProto.patched || !b) return; bombProto.patched = true;
    const B = Object.getPrototypeOf(b), bu = B.update;
    B.update = function (dt) {
      if (this.thr) { const T2 = this.thr; T2.t += dt; const k2 = Math.min(1, T2.t / T2.dur); this.x = U.lerp(T2.x0, T2.x1, k2); this.y = U.lerp(T2.y0, T2.y1, k2); this.jz = Math.sin(k2 * Math.PI) * 14; if (k2 >= 1) { this.thr = null; this.jz = 0; G.fx.dust(this.x, this.y, 3); } }
      if (this.sticky && !this.stuck) for (const e of C.foes()) if (U.dist(this.x, this.y, e.x, e.y) < 12 + (e.r || 8)) { this.stuck = e; this.sx = this.x - e.x; this.sy = this.y - e.y; break; }
      if (this.stuck) { if (this.stuck.dead) this.stuck = null; else { this.x = this.stuck.x + this.sx * 0.5; this.y = this.stuck.y + this.sy * 0.5; } }
      if (this.mine && this.t > 0.25 && this.t < this.fuse - 0.15) for (const e of C.foes()) if (U.dist(this.x, this.y, e.x, e.y) < 16 + (e.r || 8)) { this.t = this.fuse - 0.12; break; }
      return bu.apply(this, arguments);
    };
    const bd = B.draw;
    B.draw = function (g, cx, cy) { if (this.jz) { g.save(); g.translate(0, -this.jz); bd.call(this, g, cx, cy); g.restore(); } else bd.call(this, g, cx, cy); };
  }
  const tool3 = C.toolUsed;
  C.toolUsed = function (k, p, obj) { if (k === 'bomb' && obj) patchBomb(obj); return tool3.apply(this, arguments); };
  // 연금술: 주울 때
  const pick0 = C.onPickup;
  C.onPickup = function (pk) { if (pick0) pick0.apply(this, arguments); if (has('tl_alchemy') && (pk.what === 'arrow' || pk.what === 'bomb')) { const s = S(), d = G.st.derive(s), p = W().player; s.mp = Math.min(d.mpMax, s.mp + 4); if (p) p.stamina = Math.min(p.staminaMax, p.stamina + 10); } };

  /* ═════════ 밸런스 — 같은 잣대 (기본 공격 한 번 = 1) ═════════
     목표: 한 번 쓸 때 한 적에게 일반 3 · 고급 4.5 · 희귀 6.5 · 영웅 9 · 전설 14 (둘레를 넓게 치는 것은 ×0.7, 무리 전체 몫은 등급 몫 ×3까지)
     재사용 대기도 등급마다 3~4 · 4~7 · 6~12 · 10~18 · 22~28초 — 쟀던 값에서 모자라거나 넘치는 만큼 배율로 고친다 */
  const BAL = {
    a_dash: 1.01, a_lunge2: 1.5, a_upper: 1.26, a_break: 1.42, a_cross: 1.58, a_spin3: 1.11, a_cyclone: 2.6, a_flash2: 2.02, a_storm2: 0.78, a_wave: 2.6, a_quake2: 1.7, a_phantom: 1.19, a_heaven: 3.4,
    a_draw: 0.9, a_tornado: 1.23, a_crescent: 2.6, a_blades: 1.19, a_judgment: 0.81,
    a_fan: 1.09, a_quick: 0.88, a_hop: 1.33, a_leap: 2.08, a_firearrow: 1.71, a_icearrow: 2.22, a_blast: 0.91, a_snare: 2.6, a_rain: 0.72, a_homing: 1.17, a_ricochet: 2.38, a_pierce: 1.31, a_barrage: 1.03, a_snipe2: 0.79, a_comet: 1.81,
    a_scatter: 1.96, a_volley2: 0.94, a_mine: 1.47, a_gale: 1.8, a_sunrain: 5,
    a_nova: 1.07, a_sparks: 1.42, a_drain: 2.01, a_frostring: 2.6, a_chain: 2.19, a_well: 1.52, a_orbs: 0.76, a_meteor3: 1.98, a_clone: 1.15, a_starfall: 2.56,
    a_lance: 1.75, a_vine: 1.13, a_tidal: 2.6, a_eclipse: 0.59,
  };
  // 필살기 (게이지 한 번에 한 적 몫: 일반 8 · 고급 10 · 희귀 13 · 영웅 17 · 전설 24, 무리 전체는 그 3배 남짓까지)
  const BAL_SP = { flash: 0.8, whirl: 0.91, rain: 2.19, triple: 1.2, flame: 3, frost: 4.2, shadow: 3, starshot: 2.12, thunder: 3, meteor: 8, dance: 1.53, judge: 2.46, moonslash: 2.34, quakeblade: 3, thousand: 1.66, bombarrow: 3, galaxy: 0.75, nova: 3, blackhole: 1, genesis: 2.37,
    skysplit: 1.29, bladestorm: 0.64, oblivion: 0.9, arrowwall: 0.61, phoenix: 2.37, skyfall: 1.01, aurora: 1, tempest: 1, glacier: 2.32, supernova: 0.47 };
  const sk0 = SN.skillMul;   // 스킬 피해 배율 길목: stance가 DO에 넘기는 k
  const DO0 = Object.assign({}, DO);
  for (const id of Object.keys(DO)) { const f = DO[id]; DO[id] = function (p, s, d, m, k) { return f.call(this, p, s, d, m, k * (BAL[id] || 1)); }; }
  void sk0; void DO0;
  // 필살기: 시작 · 진행 · 그 사이에 걸어 둔 것(C.after · 쏜 것 · 효과)이 모두 그 필살기의 몫
  const RS = { inSp: null };
  const spStart0 = G.specials.start, spUpd0 = G.specials.update;
  G.specials.start = function (p, id) { RS.inSp = id; try { return spStart0.apply(this, arguments); } finally { RS.inSp = null; } };
  G.specials.update = function (p) { RS.inSp = p.spx && p.spx.id; try { return spUpd0.apply(this, arguments); } finally { RS.inSp = null; } };
  const after0 = C.after;
  C.after = function (t, fn) { const id = RS.inSp; if (!id) return after0.apply(this, arguments); return after0.call(this, t, function () { const was = RS.inSp; RS.inSp = id; try { return fn.apply(this, arguments); } finally { RS.inSp = was; } }); };
  const shS = C.onShoot;
  C.onShoot = function (o) { o = (shS ? shS.apply(this, arguments) : null) || o; if (o && RS.inSp) o.spId = RS.inSp; return o; };
  const fxUp = Fx.prototype.update;
  Fx.prototype.update = function () { if (this.spId) { const was = RS.inSp; RS.inSp = this.spId; try { return fxUp.apply(this, arguments); } finally { RS.inSp = was; } } return fxUp.apply(this, arguments); };
  const addFx0 = addFx;
  void addFx0;
  const modB = C.dmgMod;
  C.dmgMod = function (e, info, amt) {
    let kk = modB ? modB.apply(this, arguments) : 1; if (kk === 0) return 0;
    const sp = RS.inSp || (info.shot && info.shot.spId);
    if (sp && BAL_SP[sp]) kk *= BAL_SP[sp];
    return kk;
  };

  /* ═════════ 그림 ═════════ */
  Object.assign(GLY, {
    a_draw: [['            ', ' b       W  ', ' bbbbbbbbWWW', ' b       W  ', '            ', 'llllll      '], { b: '#6a4a2a', W: '#ffffff', l: '#ffd8a8' }],
    a_tornado: [['   wwww     ', '  w    w    ', ' w  ww  w>> ', ' w w  w w>> ', '  w    w    ', '   wwww     '], { w: '#e8f4ff', '>': '#ffd8a8' }],
    a_crescent: [['    www     ', '      ww    ', '       ww   ', '       ww   ', '      ww    ', '    www     '], { w: '#e8f4ff' }],
    a_blades: [['w  w  w     ', ' w  w  w    ', '  w  w  w   ', '   w  w  w  ', '    w  w  w '], { w: '#fff4d8' }],
    a_judgment: [['     W      ', '     W      ', '    WWW     ', '     W      ', '     W      ', '     W      ', 'yyyyyyyyyyy '], { W: '#ffffff', y: '#ffd84a' }],
    a_scatter: [['    a       ', '   a  a     ', '>>a a a a   ', '   a  a     ', '    a       '], { a: '#e8e0cc', '>': '#c8f0a0' }],
    a_volley2: [['aaa>  aaa>  ', '            ', '  aaa>  aaa>', '            ', 'aaa>  aaa>  '], { a: '#c8b890', '>': '#ffffff' }],
    a_mine: [['    a       ', '    a       ', '    a       ', '   rYr      ', '  r   r     ', ' dddddddd   '], { a: '#c8b890', r: '#ff8a3a', Y: '#ffe066', d: '#8a6a3a' }],
    a_gale: [['  c   c     ', ' c   c      ', 'aaaaaaaa>   ', ' c   c      ', '  c   c     '], { a: '#e8e0cc', '>': '#ffffff', c: '#c8f0ff' }],
    a_sunrain: [['  yyy       ', ' yWWWy      ', '  yyy       ', ' r r r r    ', '  r r r r   ', ' r r r r    '], { y: '#ffd84a', W: '#ffffff', r: '#ff8a3a' }],
    a_lance: [['            ', 'y           ', 'yyyyyyyyyyY ', 'y           ', '            '], { y: '#ffe066', Y: '#ffffff' }],
    a_vine: [['  g  g  g   ', ' g g g g g  ', ' g  gpg  g  ', '  g  g  g   ', 'gggggggggg  '], { g: '#5ac84a', p: '#c84a8a' }],
    a_mirrorwall: [['  pppppp    ', ' p      p   ', 'p  WW    p  ', 'p   WW   p  ', ' p      p   ', '  pppppp    '], { p: '#e8e0ff', W: '#ffffff' }],
    a_tidal: [['     bbb    ', '   bbWWWb   ', ' bbWW   bb  ', 'bWW        b', 'bbbbbbbbbbbb'], { b: '#4a9ad8', W: '#d8f4ff' }],
    a_eclipse: [['   yyyy     ', '  yKKKKy    ', ' yKKKKKKy   ', ' yKKKKKKy   ', '  yKKKKy    ', '   yyyy     '], { y: '#fff8d0', K: '#1a0a2a' }],
  });

  /* ═════════ 얻는 길 ═════════ */
  // 기술서 (새 스킬도 가게 · 별관에) — skills.js와 같은 값
  const PRICE = [0, 600, 2400, 9000, 26000, 0];
  for (const id in NEW) { const A = ASK[id]; D.ITEMS['sb_' + id] = { id: 'sb_' + id, type: 'sbook', skill: id, grade: A.grade, icon: 'sbook', price: PRICE[A.grade], name: '기술서: ' + A.name, desc: '읽으면 ' + SN.WNAME[A.w] + ' 스킬 「' + A.name + '」을 익힌다. ' + A.desc }; }
  const LATE = [];
  const put = (sh, list) => LATE.push([sh, list]);
  put('purple', ['sb_a_scatter', 'sb_a_lance']); put('rainbow', ['sb_a_draw']); put('white', ['sb_a_volley2', 'sb_a_vine', 'art_skysplit']); put('gray', ['sb_a_crescent', 'sb_a_mine', 'art_arrowwall', 'art_tempest']); put('black', ['sb_a_tornado', 'sb_a_mirrorwall', 'sb_a_gale', 'art_bladestorm', 'art_phoenix']); put('colorful', ['sb_a_blades', 'sb_a_tidal', 'art_skyfall', 'art_glacier']);
  // 연성: 숙련 ★3 두 기술 + 골드 → 새 기술 / 가진 필살기 둘 + 골드 → 새 필살기 (재료는 사라지지 않는다 — 깨달음일 뿐)
  const RECIPE = [
    { out: 'a_draw', a: 'a_lunge2', b: 'a_upper', gold: 1500 },
    { out: 'a_tornado', a: 'a_cyclone', b: 'a_dash', gold: 5000 },
    { out: 'a_crescent', a: 'a_wave', b: 'a_cross', gold: 5000 },
    { out: 'a_blades', a: 'a_cross', b: 'a_spin3', gold: 14000 },
    { out: 'a_judgment', a: 'a_quake2', b: 'a_flash2', gold: 30000 },
    { out: 'a_scatter', a: 'a_fan', b: 'a_quick', gold: 1500 },
    { out: 'a_volley2', a: 'a_quick', b: 'a_hop', gold: 5000 },
    { out: 'a_mine', a: 'a_snare', b: 'a_blast', gold: 5000 },
    { out: 'a_gale', a: 'a_pierce', b: 'a_leap', gold: 14000 },
    { out: 'a_sunrain', a: 'a_barrage', b: 'a_firearrow', gold: 30000 },
    { out: 'a_lance', a: 'a_chain', b: 'a_sparks', gold: 1500 },
    { out: 'a_vine', a: 'a_slow', b: 'a_drain', gold: 5000 },
    { out: 'a_mirrorwall', a: 'a_ward', b: 'a_blink2', gold: 5000 },
    { out: 'a_tidal', a: 'a_frostring', b: 'a_well', gold: 14000 },
    { out: 'a_eclipse', a: 'a_meteor3', b: 'a_orbs', gold: 30000 },
    { out: 'sp:oblivion', a: 'sp:triple', b: 'sp:shadow', gold: 40000 },
    { out: 'sp:aurora', a: 'sp:starshot', b: 'sp:hawk', gold: 40000 },
    { out: 'sp:supernova', a: 'sp:thunder', b: 'sp:blackhole', gold: 40000 },
    { out: 'sp:bladestorm', a: 'sp:whirl', b: 'sp:quakeblade', gold: 22000 },
    { out: 'sp:skyfall', a: 'sp:rain', b: 'sp:bombarrow', gold: 22000 },
  ];
  const isSp = (k) => k.startsWith('sp:'), spId = (k) => k.slice(3);
  const nameOf = (k) => (isSp(k) ? '필살기 「' + (SPS[spId(k)] || {}).name + '」' : '「' + (ASK[k] || {}).name + '」');
  const owns = (s, k) => (isSp(k) ? !!(s.specials && s.specials[spId(k)]) : !!(s.askills && s.askills[k]));
  const ready = (s, k) => (isSp(k) ? owns(s, k) : owns(s, k) && (G.skills ? G.skills.rank(s, k) : 1) >= 3);
  function recipeState(s, r) {
    const done = owns(s, r.out), ka = owns(s, r.a), kb = owns(s, r.b), ra = ready(s, r.a), rb = ready(s, r.b);
    return { done, seen: ka || kb || done, ok: ra && rb && !done && s.gold >= r.gold, ra, rb, ka, kb };
  }
  function craft(s, r) {
    const st = recipeState(s, r); if (!st.ok) return false;
    s.gold -= r.gold;
    if (isSp(r.out)) { s.specials = s.specials || {}; s.specials[spId(r.out)] = true; }
    else SN.learn(s, r.out, true);
    s.flags['craft:' + r.out] = true;
    return true;
  }
  /** 스킬 화면 아래: 그 무기의 연성 */
  function craftSection(body, w, h) {
    const s = S(), list = RECIPE.filter((r) => (isSp(r.out) ? (SPS[spId(r.out)].type || 'sword') : ASK[r.out].w) === w);
    h.sec(body, '연성 — 숙련 ★3 두 기술을 섞어 새 기술을 깨닫는다');
    h.note(body, h.markup('[s]재료는 사라지지 않는다. 재료 하나라도 알면 무엇이 나오는지 보인다. 필살기는 두 필살기를 지니기만 하면 된다.[/]'));
    for (const r of list) {
      const st = recipeState(s, r);
      const ing = (k, has, rd) => (isSp(k) ? nameOf(k) : nameOf(k) + ' ★3') + (rd ? ' [g]✓[/]' : has ? ' [s](숙련 부족)[/]' : ' [s](모름)[/]');
      const name = st.done ? '[s]' + nameOf(r.out) + ' — 깨달음[/]' : st.seen ? nameOf(r.out) : '[s]??? — 재료를 하나라도 알면 보인다[/]';
      const desc = st.seen || st.done ? ing(r.a, st.ka, st.ra) + ' + ' + ing(r.b, st.kb, st.rb) : '[s]' + SN.WNAME[w] + '의 두 기술[/]';
      body.appendChild(h.row({ icon: G.hud.icon(isSp(r.out) ? 'special' : (st.seen ? r.out : 'sbook')), name, desc, v: st.done ? '' : '◎ ' + U.fmtInt(r.gold), dim: !st.ok, onClick: () => {
        if (st.done) return;
        if (!st.ok) { h.toast(!st.seen ? '아직 무엇이 나올지 모른다' : s.gold < r.gold ? '골드가 모자란다' : '두 기술을 ★3까지 다루어야 한다', 'bad'); sfx('buzz'); return; }
        if (craft(s, r)) { sfx('learn'); h.toast('연성 — ' + nameOf(r.out) + '을 깨달았다!', 'gold'); if (G.world.player) { G.fx.ring(G.world.player.x, G.world.player.y - 8, '#fff0a8', 30, 0.5, 2); G.fx.glow(G.world.player.x, G.world.player.y - 10, '#fff0a8', 16, 40); } h.refresh(); }
      } }));
    }
  }
  // 비문: 세상 곳곳의 옛 돌. 그 무기 능력치가 되어야 읽힌다 (자리는 이야기 쪽 48_tablets에서)
  const TABLETS = [
    { id: 'tb_tornado', teach: 'a_tornado', need: { str: 8 }, title: '바람 언덕의 비문', text: ['「돌며 나아가는 자는 넘어지지 않는다.」', '돌 위에 칼자국이 소용돌이 모양으로 겹쳐 있다. 누군가 이 언덕에서 한참을 돌았던 것 같다.'] },
    { id: 'tb_gale', teach: 'a_gale', need: { dex: 12 }, title: '절벽 끝의 비문', text: ['「바람을 쏘아라. 바람은 꺾이지 않는다.」', '비문 아래에 오래된 화살촉이 바람에 깎여 매끈하다.'] },
    { id: 'tb_tidal', teach: 'a_tidal', need: { int: 12 }, title: '가라앉은 비문', text: ['「물은 밀어내고, 물은 돌아온다.」', '바닷물에 반쯤 잠긴 돌. 글자 틈마다 조개가 붙어 있다.'] },
    { id: 'tb_blades', teach: 'a_blades', need: { str: 12 }, title: '무희의 비문', text: ['「다섯 걸음, 다섯 칼. 춤은 멈추지 않는다.」', '발자국 다섯이 새겨진 둥근 돌. 그 위에 서 보니 몸이 저절로 움직인다.'] },
    { id: 'tb_judgment', teach: 'a_judgment', need: { str: 18, lv: 32 }, title: '갈라진 바위의 비문', text: ['「단 한 번. 그 한 번에 모두를 건다.」', '한가운데가 곧게 갈라진 큰 바위. 갈라진 면이 거울처럼 매끄럽다.'] },
    { id: 'tb_sunrain', teach: 'a_sunrain', need: { dex: 18, lv: 32 }, title: '해맞이 비문', text: ['「해가 뜨는 쪽으로 쏘면 해가 되어 떨어진다.」', '동쪽을 향해 기울어진 돌기둥. 해가 뜨면 그림자가 화살 모양이 된다고 한다.'] },
    { id: 'tb_eclipse', teach: 'a_eclipse', need: { int: 18, lv: 32 }, title: '검은 해의 비문', text: ['「빛이 가려질 때, 모든 그림자는 하나가 된다.」', '돌 한가운데에 검게 그을린 원. 손을 대니 차갑다.'] },
    { id: 'tb_glacier', teach: 'sp:glacier', need: { int: 16, lv: 28 }, title: '얼어붙은 비문', text: ['「겨울은 세 번 온다.」', '얼음 속에 갇힌 비문. 녹지 않는 얼음 너머로 글자가 비친다.'] },
    { id: 'tb_phoenix', teach: 'sp:phoenix', need: { dex: 15, lv: 26 }, title: '불새의 둥지', text: ['「타 버린 깃털 하나가 다시 날아오른다.」', '재로 덮인 둥지 한가운데 붉은 돌. 아직 따뜻하다.'] },
    { id: 'tb_storm', teach: 'sp:bladestorm', need: { str: 15, lv: 26 }, title: '칼 무덤의 비문', text: ['「버려진 칼들도 바람을 타면 다시 싸운다.」', '녹슨 칼들이 둥글게 꽂혀 있다. 바람이 불 때마다 칼끝이 함께 떤다.'] },
  ];
  function tabletRead(s, tb) {
    if (s.flags['tablet:' + tb.id]) return 'read';
    if (G.prog && !G.prog.reqOk(s, tb.need)) return 'need';
    return 'ok';
  }
  function learnTeach(s, k) { if (isSp(k)) { s.specials = s.specials || {}; s.specials[spId(k)] = true; } else SN.learn(s, k, true); }

  // 얻는 곳 (스킬 화면) — 연성 · 비문 · 기술서를 더한다
  const src0 = G.skills.sources;
  G.skills.sources = function (id) {
    const out = src0 ? src0.apply(this, arguments) : [];
    for (const [sh, list] of LATE) if (list.includes('sb_' + id)) { const S2 = D.SHOPS[sh]; out.push('기술서 — ' + (S2 ? S2.name : sh)); }
    const r = RECIPE.find((x) => x.out === id); if (r) out.push('연성: ' + nameOf(r.a) + ' + ' + nameOf(r.b));
    const tb = TABLETS.find((x) => x.teach === id); if (tb) out.push('비문 — ' + tb.title);
    const node = D.SKILLS.find((k) => k.act === id); if (node && !out.some((x) => x.startsWith('재능'))) out.push('재능 「' + node.tree + '」 ' + node.row + '줄');
    return [...new Set(out)];
  };
  function placeLate() { for (const [sh, list] of LATE) { const S2 = D.SHOPS[sh] || D.SHOPS.blue; if (S2) for (const k of list) if (!S2.items.includes(k)) S2.items.push(k); } }
  // 성장 점수: 레벨 10 · 20 · 30 · 40 · 50에 3점씩 더 (칸이 늘어난 만큼)
  const gain0 = G.st.gainExp;
  G.st.gainExp = function (s) {
    const lv0 = s.lv; const up = gain0.apply(this, arguments);
    for (let L = lv0 + 1; L <= s.lv; L++) if (L % 10 === 0) { s.pts = (s.pts || 0) + 3; if (G.ui && G.ui.toast) G.ui.toast('Lv ' + L + ' 이정표 — 성장 점수 +3 더', 'gold'); }
    return up;
  };
  const mig0 = G.prog.migrate;
  G.prog.migrate = function (s) { s = mig0.apply(this, arguments); if (s.ptsMile !== 1) { s.ptsMile = 1; s.pts = (s.pts || 0) + 3 * Math.floor((s.lv || 1) / 10); } return s; };
  const fresh0 = G.st.fresh;
  G.st.fresh = function () { const s = fresh0.apply(this, arguments); s.ptsMile = 1; return s; };

  G.skills2 = { NEW, NEWSP, BAL, BAL_SP, RECIPE, TABLETS, craft, recipeState, craftSection, tabletRead, learnTeach, placeLate, RS, isSp, nameOf };
})();
