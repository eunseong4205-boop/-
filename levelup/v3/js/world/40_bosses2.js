/* 빛깔만 바꾼 보스를 몸과 싸움법이 전부 다른 보스로 — 그리고 숨은 던전의 보스 둘
   메아리 협곡   : 메아리 박쥐 여왕 「울림」 — 모든 공격이 1.2초 뒤 방 반대편에서 메아리로 되돌아온다 · 어둠 속에 숨으면 울음이 모습을 비춘다
   가라앉은 사원 : 늪거북 「벨루」 — 등의 종을 울려 물결 고리 · 껍질에 숨어 벽을 튕기며 돌진 · 어지러울 때 종을 친다
   시련의 탑     : 세 갈래의 시험관 「트리아」 — 검 · 활 · 지팡이를 번갈아 든다. 갈래마다 뚫리는 방법이 다르다
   잊힌 묘지     : 무덤지기 「부르는 자」 — 거의 보이지 않는다. 등불 · 빛 · 횃불 곁에서만 칼이 닿는다
   별똥별 구덩이 : 유성두꺼비 — 떨어진 별을 삼키면 달아오른다. 별을 먼저 부수면 굶는다
   옛 렙업의 땅  : 렙업 슬라임 「Lv.9999」 — 작은 슬라임을 먹을수록 레벨이 오른다. 먹히기 전에 잡아라 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, E = G.ent, BS = G.bosses;
  const { art, poly, R, aim, shoot, roomRect, clampRoom, warnCircle, warnRect, hitCircle, minion, ring } = BS;
  const def = BS.def;
  const W = () => G.world, C = () => G.combat, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);

  /** 퍼져 나가는 물결 · 소리 고리: 고리가 지나가는 순간 닿으면 다친다 (구르면 넘는다) */
  function wave(x, y, o) {
    return W().add(new E.Ent({ kind: 'wave', solid: false, x, y, r: 4, t: 0, sp: o.sp || 90, max: o.max || 160, dmg: o.dmg || 2, col: o.col || '#bfe8ff', hitDone: false,
      update(dt) {
        this.t += dt; this.r += this.sp * dt;
        const p = W().player;
        if (p && !this.hitDone) { const d = U.dist(p.x, (p.y - 4) * 1, this.x, this.y); if (Math.abs(d * 1 - this.r) < 7 && p.state !== 'jump') { this.hitDone = true; C().hurtPlayer(p, this.dmg, { x: this.x, y: this.y }, {}); } }
        if (this.r > this.max) this.dead = true;
      },
      drawShadow(g, cx, cy) { g.strokeStyle = this.col; g.globalAlpha = Math.max(0, 1 - this.r / this.max) * 0.9; g.lineWidth = 2; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, this.r, this.r * 0.6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; },
      draw() {},
    }));
  }
  const mirrorPt = (e, x, y) => { const rr = roomRect(e), cx = (rr.x0 + rr.x1) / 2, cy = (rr.y0 + rr.y1) / 2; return [cx * 2 - x, cy * 2 - y]; };

  /* ═════════ 1. 메아리 박쥐 여왕 「울림」 (메아리 협곡) ═════════ */
  def('echogiant', { name: '울림', title: '메아리 협곡 · 메아리 박쥐 여왕 「울림」', hp: 230, atk: 6, r: 20, h: 34, col: '#c8783a', fly: true, weak: ['light', 'bolt'], exp: 420, gold: 260, speed: 70, noContact: false,
    init(e) { e.echoes = []; },
    guards(e, info) { if (e.hid > 0 && e.seen <= 0 && !info.unblockable && info.el !== 'light') { G.fx.float(e.x, e.y - 40, '보이지 않는다', '#c8a0ff'); return true; } return false; },
    phase2(e) { e.hid = 1; G.cine.bubble(e, '끼이이 —', { life: 1.5 }); },
    ai(e, dt, Wd) {
      const p = Wd.player, rr = roomRect(e);
      e.seen = (e.seen || 0) - dt;
      if (e.phase2) e.hid = 1;
      // 메아리: 예약된 공격을 방 반대편에서 다시
      for (const q of e.echoes) { q.t -= dt; if (q.t <= 0 && !q.done) { q.done = true; q.fn(); } }
      e.echoes = e.echoes.filter((q) => !q.done);
      const echo = (fn, d) => e.echoes.push({ t: d || 1.2, fn });
      if (e.st === 'idle') {
        const cx = (rr.x0 + rr.x1) / 2, cy = (rr.y0 + rr.y1) / 2 - 10, a = e.t * 0.9;
        e.toward(cx + Math.cos(a) * 70, cy + Math.sin(a) * 34, e.speed, dt);
        if (e.stT > (e.phase2 ? 1.0 : 1.4)) e.set(['screech', 'dive', 'screech', 'swarm'][e.pat++ % 4]);
      }
      if (e.st === 'screech') {
        if (e.stT < 0.02) { e.telegraph(0.6); e.seen = 1.2; sfx('telegraph'); }
        if (e.stT > 0.6 && !e.did) {
          e.did = true; const x = e.x, y = e.y - 12, n = e.phase2 ? 12 : 9, off = Math.random();
          const fire = (xx, yy, tint) => { for (let i = 0; i < n; i++) { const a = off + i / n * Math.PI * 2; shoot({ kind: 'orb', x: xx, y: yy, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95, dmg: e.atk, col: tint, r: 4, life: 2.4, blockLv: 2 }); } G.fx.ring(xx, yy, tint, 30, 0.4, 2); sfx('shriek'); };
          fire(x, y, '#ffb05a');
          const [mx, my] = mirrorPt(e, x, y);
          warnCircle(mx, my + 12, 18, 1.1, null, '#c8a0ff');
          echo(() => fire(mx, my, '#c8a0ff'));
        }
        if (e.stT > 1.1) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'dive') {
        if (e.stT < 0.02) { e.telegraph(0.7); e.seen = 1.5; const a = U.angle(p.x - e.x, p.y - e.y); e.dv = [Math.cos(a), Math.sin(a)]; const len = 220; warnRect(Math.min(e.x, e.x + e.dv[0] * len) - 8, Math.min(e.y, e.y + e.dv[1] * len) - 8, Math.abs(e.dv[0] * len) + 16, Math.abs(e.dv[1] * len) + 16, 0.7, null); e.d0 = [e.x, e.y]; }
        if (e.stT > 0.7 && e.stT < 1.3) { e.x += e.dv[0] * 330 * dt; e.y += e.dv[1] * 330 * dt; clampRoom(e); if (Math.random() < 0.5) G.fx.part({ x: e.x, y: e.y - 16, z: 0, vz: 0, g: 0, life: 0.3, col: '#c8783a', size: 2 }); }
        if (e.stT >= 1.3 && !e.did) {
          e.did = true;
          // 메아리 돌진: 반대편에서 거꾸로
          const [ax, ay] = mirrorPt(e, e.d0[0], e.d0[1]), dv = [-e.dv[0], -e.dv[1]];
          warnRect(Math.min(ax, ax + dv[0] * 220) - 8, Math.min(ay, ay + dv[1] * 220) - 8, Math.abs(dv[0] * 220) + 16, Math.abs(dv[1] * 220) + 16, 1.1, null, '#c8a0ff');
          echo(() => { let x = ax, y = ay; for (let k = 0; k < 11; k++) { x += dv[0] * 20; y += dv[1] * 20; G.fx.part({ x, y, z: 12, vz: 0, g: 0, life: 0.4, col: '#c8a0ff', size: 2, glow: true }); const pl = W().player; if (pl && U.dist(pl.x, pl.y, x, y) < 16) { C().hurtPlayer(pl, e.atk, { x, y }, {}); break; } } sfx('run'); });
        }
        if (e.stT > 1.6) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'swarm') {
        if (e.stT < 0.02) { e.seen = 1; G.cine.bubble(e, '끼익!', { life: 1 }); const alive = Wd.ents.filter((m) => m.minion && !m.dead).length; if (alive < 4) { minion(e, 'bat', e.x - 30, e.y); minion(e, 'bat', e.x + 30, e.y); } }
        if (e.stT > 0.8) e.set('idle');
      }
      // 숨은 동안: 1.6초마다 울음이 모습을 비춘다
      if (e.hid) { e.pingT = (e.pingT || 0) - dt; if (e.pingT <= 0) { e.pingT = 1.6; e.seen = 0.7; G.fx.ring(e.x, e.y - 14, '#c8a0ff', 40, 0.5, 1); sfx('clickspot'); } }
    },
    draw(e, g, cx, cy) {
      const im = BS.B.echogiant.art(e);
      const a = e.hid && e.seen <= 0 ? 0.12 : 1;
      const x = Math.round(e.x - cx - im.width / 2), y = Math.round(e.y - cy - im.height - 8 + Math.sin(e.t * 5) * 3);
      g.globalAlpha = a; g.drawImage(im, x, y);
      if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8) * a; g.drawImage(X.silhouette(im, '#ffffff'), x, y); }
      g.globalAlpha = 1;
      if (e.tele > 0 && Math.floor(e.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx) - 1, y - 10, 3, 6); }
    },
    art(e) {
      const f = Math.floor(e.t * 7) % 2;
      return art('echo' + f + (e.phase2 ? 1 : 0), 72, 42, (b) => {
        const wing = '#3a2440', mem = e.phase2 ? '#8a4ad8' : '#c8783a';
        const up = f ? -6 : 4;
        poly(b, [[36, 20], [4, 8 + up], [8, 20 + up], [2, 30 + up], [14, 28], [24, 32]], wing);
        poly(b, [[36, 20], [68, 8 + up], [64, 20 + up], [70, 30 + up], [58, 28], [48, 32]], wing);
        poly(b, [[34, 22], [10, 13 + up], [12, 22 + up], [22, 28]], mem); poly(b, [[38, 22], [62, 13 + up], [60, 22 + up], [50, 28]], mem);
        b.ellipse(36, 24, 9, 11, '#4a2e3a'); b.ellipse(36, 26, 6, 7, '#6a4a4a');
        poly(b, [[29, 16], [26, 4], [33, 14]], '#4a2e3a'); poly(b, [[43, 16], [46, 4], [39, 14]], '#4a2e3a');
        b.ellipse(27, 7, 3, 3, '#ffd87a'); b.ellipse(45, 7, 3, 3, '#ffd87a'); b.px(27, 7, '#3a2440'); b.px(45, 7, '#3a2440');
        b.rect(32, 20, 3, 2, '#ffe066'); b.rect(38, 20, 3, 2, '#ffe066');
        b.px(34, 29, '#ffffff'); b.px(38, 29, '#ffffff');
      });
    } });

  /* ═════════ 2. 늪거북 「벨루」 (가라앉은 사원) ═════════ */
  def('swampqueen', { name: '벨루', title: '가라앉은 사원 · 종을 진 늪거북 「벨루」', hp: 260, atk: 6, r: 24, h: 38, col: '#5a8a5a', weak: ['bolt'], resist: ['ice'], exp: 460, gold: 280, speed: 30, weight: 99,
    guards(e, info) { if ((e.st === 'shell' || e.st === 'spin') && !info.unblockable) { sfx('clank'); G.fx.sparks(e.x, e.y - 16, 6, '#e8e0c8', 80); return true; } return false; },
    phase2(e) { G.cine.bubble(e, '뎅 — 뎅 —', { life: 1.5 }); },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); clampRoom(e); if (e.stT > 1.6) e.set(['bell', 'shell', 'bubble', 'bell', 'shell'][e.pat++ % 5]); }
      if (e.st === 'bell') {
        if (e.stT < 0.02) { e.telegraph(0.7); }
        const rings = e.phase2 ? 3 : 2;
        for (let k = 0; k < rings; k++) if (e.stT > 0.7 + k * 0.55 && !(e.rung & (1 << k))) { e.rung = (e.rung || 0) | (1 << k); wave(e.x, e.y - 4, { sp: 110, max: 200, dmg: e.atk, col: '#e8d8a0' }); sfx('bell'); W().shake(2, 0.2); }
        if (e.stT > 0.9 + rings * 0.55) { e.rung = 0; e.set('idle'); }
      }
      if (e.st === 'shell') { e.vx = e.vy = 0; if (e.stT < 0.02) { sfx('clank'); e.telegraph(0.6); } if (e.stT > 0.7) { const a = U.angle(p.x - e.x, p.y - e.y); e.sv = [Math.cos(a), Math.sin(a)]; e.bounces = 0; e.set('spin'); } }
      if (e.st === 'spin') {
        const sp = e.phase2 ? 250 : 200, rr = roomRect(e);
        e.x += e.sv[0] * sp * dt; e.y += e.sv[1] * sp * dt;
        if (e.x < rr.x0 || e.x > rr.x1) { e.sv[0] *= -1; e.bounces++; W().shake(3, 0.15); sfx('impact'); G.fx.dust(e.x, e.y, 6); }
        if (e.y < rr.y0 || e.y > rr.y1) { e.sv[1] *= -1; e.bounces++; W().shake(3, 0.15); sfx('impact'); G.fx.dust(e.x, e.y, 6); }
        clampRoom(e);
        if (Math.random() < 0.6) G.fx.part({ x: e.x, y: e.y, z: 2, vz: 20, g: 60, life: 0.3, col: '#8ab8a0', size: 1 });
        if (e.bounces >= (e.phase2 ? 5 : 4)) { e.set('dizzy'); G.fx.float(e.x, e.y - 44, '어질어질!', '#ffe066', { big: true }); }
      }
      if (e.st === 'dizzy') { e.vx = e.vy = 0; e.exposed = 1; if (e.stT > 2.6) { e.exposed = 0; e.set('idle'); } }
      if (e.st === 'bubble') {
        if (e.stT < 0.02) e.telegraph(0.4);
        if (e.stT > 0.4 && !e.did) { e.did = true; for (let i = -2; i <= 2; i++) { const a = aim(e, p, 20) + i * 0.28; shoot({ kind: 'orb', x: e.x, y: e.y - 20, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, dmg: e.atk, col: '#9ae8c8', r: 5, life: 3, blockLv: 1, reflectable: true }); } sfx('splash'); if (e.phase2 && Wd.ents.filter((m) => m.minion && !m.dead).length < 2) minion(e, 'octo', e.x, e.y + 30); }
        if (e.stT > 1) { e.did = false; e.set('idle'); }
      }
    },
    over(e, g, cx, cy) { if (e.st === 'dizzy') for (let i = 0; i < 3; i++) { const a = e.t * 6 + i * 2.1; g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 16), Math.round(e.y - cy - 46 + Math.sin(a) * 4), 2, 2); } },
    art(e) {
      const shell = e.st === 'shell' || e.st === 'spin', f = shell ? (Math.floor(e.t * 12) % 2) + 2 : Math.floor((e.walkT || 0) * 3) % 2;
      return art('belu' + f, 76, 56, (b) => {
        const r = R('#4a7a4a');
        if (!shell) { b.ellipse(14, 44, 7, 6, '#6a8a5a'); b.ellipse(62, 44, 7, 6, '#6a8a5a'); b.ellipse(20, 50 - f * 2, 6, 5, '#5a7a4a'); b.ellipse(56, 50 - (1 - f) * 2, 6, 5, '#5a7a4a'); }
        b.ellipse(38, 38, 30, 16, r[1]); b.ellipse(38, 34, 27, 13, r[2]); b.ellipse(30, 30, 10, 5, r[3]);
        for (let i = 0; i < 5; i++) b.ellipse(18 + i * 10, 36, 4, 3, r[0]);
        for (let i = 0; i < 9; i++) b.px(14 + i * 6, 42 + (i % 2), '#2a4a2a');
        // 종
        b.rect(34, 8, 8, 3, '#6a4a2a'); b.ellipse(38, 18, 8, 9, '#c8a050'); b.rect(30, 22, 16, 4, '#c8a050'); b.ellipse(36, 15, 2, 4, '#f0d890'); b.rect(37, 25, 2, 3, '#6a4a2a');
        if (shell && f === 3) b.ellipse(38, 18, 9, 10, '#f0d890', 0.4);
        if (!shell) { b.ellipse(68, 34, 8, 7, '#6a8a5a'); b.ellipse(70, 32, 2, 2, '#ffe88a'); b.px(70, 32, '#2a2a1a'); b.rect(72, 36, 3, 1, '#2a4a2a'); }
        b.ellipse(24, 26, 2, 3, '#8ad8a8'); b.ellipse(52, 24, 3, 2, '#8ad8a8');
      });
    } });

  /* ═════════ 3. 세 갈래의 시험관 「트리아」 (시련의 탑) ═════════ */
  const MODES = { sword: { name: '검의 시험', tip: '앞에서 베는 칼은 막힌다 — 돌진을 피해 등 뒤를 노려라', col: '#ff8a6a' }, bow: { name: '활의 시험', tip: '활을 든 동안은 느리다 — 파고들어 베어라', col: '#ffe066' }, staff: { name: '마법의 시험', tip: '장막은 화살 · 마법 세 번에 깨진다', col: '#8ab8ff' } };
  def('trialshade', { name: '트리아', title: '시련의 탑 꼭대기 · 세 갈래의 시험관 「트리아」', hp: 320, atk: 7, r: 12, h: 40, col: '#d8d0e8', fly: true, exp: 700, gold: 500, speed: 80,
    init(e) { e.mode = 'sword'; e.modeT = 0; e.veil = 3; },
    guards(e, info) {
      if (info.unblockable) return false;
      if (e.mode === 'sword' && (info.src === 'sword' || info.src === 'spin')) {
        const p = W().player; const f = e.face || [0, 1]; const [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
        if (f[0] * nx + f[1] * ny > 0.2 && e.st !== 'recover') { sfx('clank'); G.fx.sparks(e.x + f[0] * 10, e.y - 20, 6, '#ffffff', 80); return true; }
      }
      if (e.mode === 'staff' && e.veil > 0) {
        if (info.src === 'arrow' || info.src === 'spell' || info.src === 'shot' || info.src === 'beam') { e.veil--; G.fx.ring(e.x, e.y - 20, '#8ab8ff', 20, 0.3, 2); sfx('crystal'); if (e.veil <= 0) { G.fx.float(e.x, e.y - 50, '장막이 깨졌다!', '#8ab8ff', { big: true }); e.bare = 3.5; } return true; }
        sfx('clank'); return true;
      }
      return false;
    },
    phase2(e) { G.cine.bubble(e, '세 갈래를 한꺼번에 보여 주지.', { life: 2 }); },
    ai(e, dt, Wd) {
      const p = Wd.player;
      e.modeT += dt; if (e.bare > 0) { e.bare -= dt; if (e.bare <= 0) e.veil = 3; }
      const span = e.phase2 ? 6 : 8;
      if (e.modeT > span && e.st === 'idle') {
        e.modeT = 0; e.mode = { sword: 'bow', bow: 'staff', staff: 'sword' }[e.mode]; e.veil = 3; e.bare = 0;
        const M = MODES[e.mode]; G.fx.ring(e.x, e.y - 20, M.col, 30, 0.5, 2); G.cine.bubble(e, M.name, { life: 1.6 }); sfx('skill');
        if (!S().flags['tip:tria:' + e.mode]) { S().flags['tip:tria:' + e.mode] = true; G.ui.toast(M.name + ' — ' + M.tip, 'white'); }
      }
      if (e.st === 'idle') {
        e.face = U.norm(p.x - e.x, p.y - e.y);
        const want = e.mode === 'bow' ? 110 : e.mode === 'staff' ? 70 : 20, d = U.dist(p.x, p.y, e.x, e.y);
        if (d > want + 10) e.toward(p.x, p.y, e.speed * (e.mode === 'bow' ? 0.6 : 1), dt); else if (d < want - 10) e.toward(e.x * 2 - p.x, e.y * 2 - p.y, e.speed * 0.8, dt);
        clampRoom(e);
        if (e.stT > (e.phase2 ? 0.9 : 1.3)) e.set(e.mode === 'sword' ? 'slash' : e.mode === 'bow' ? 'volley' : 'circle');
      }
      if (e.st === 'slash') {
        if (e.stT < 0.02) { e.n = e.phase2 ? 3 : 2; e.k = 0; }
        const T0 = e.k * 0.8;
        if (e.stT >= T0 && e.stT < T0 + 0.02) { e.telegraph(0.45); const a = U.angle(p.x - e.x, p.y - e.y); e.dv = [Math.cos(a), Math.sin(a)]; e.face = e.dv; warnRect(Math.min(e.x, e.x + e.dv[0] * 120) - 10, Math.min(e.y, e.y + e.dv[1] * 120) - 10, Math.abs(e.dv[0] * 120) + 20, Math.abs(e.dv[1] * 120) + 20, 0.45, null, '#ff8a6a'); }
        if (e.stT > T0 + 0.45 && e.stT < T0 + 0.7) { e.x += e.dv[0] * 420 * dt; e.y += e.dv[1] * 420 * dt; clampRoom(e); if (U.dist(p.x, p.y, e.x, e.y) < 18) C().hurtPlayer(p, e.atk, e, {}); G.fx.slash(e.x, e.y - 20, Math.atan2(e.dv[1], e.dv[0]), '#ffd0c0', 20); }
        if (e.stT > T0 + 0.8) { e.k++; if (e.k >= e.n) { e.set('recover'); } }
      }
      if (e.st === 'recover') { if (e.stT > 1.1) e.set('idle'); }   // 돌진 뒤: 등이 비었다
      if (e.st === 'volley') {
        if (e.stT < 0.02) e.telegraph(0.5);
        if (e.stT > 0.5 && !e.did) { e.did = true; const base = aim(e, p, 20), n = e.phase2 ? 7 : 5; for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * 0.16; shoot({ kind: 'arrow', x: e.x, y: e.y - 20, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, dmg: e.atk, col: '#ffe066', r: 3, life: 1.4, blockLv: 1, reflectable: true }); } sfx('shoot'); if (e.phase2) for (let i = 0; i < 4; i++) { const x = p.x + (Math.random() - 0.5) * 80, y = p.y + (Math.random() - 0.5) * 60; warnCircle(x, y, 12, 0.9, function () { hitCircle(this.x, this.y, 12, e.atk); G.fx.sparks(this.x, this.y, 6, '#ffe066', 60); }, '#ffe066'); } }
        if (e.stT > 1.2) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'circle') {
        if (e.stT < 0.02) { e.telegraph(0.4); const n = e.phase2 ? 3 : 2; for (let i = 0; i < n; i++) C().after(i * 0.35, () => { const pl = W().player; warnCircle(pl.x, pl.y, 26, 0.9, function () { hitCircle(this.x, this.y, 26, e.atk); G.fx.ring(this.x, this.y, '#8ab8ff', 26, 0.4, 2); sfx('bolt'); }, '#8ab8ff'); }); }
        if (e.stT > 0.8 && !e.did) { e.did = true; for (let i = 0; i < 3; i++) shoot({ kind: 'orb', x: e.x + (i - 1) * 14, y: e.y - 30, vx: (i - 1) * 40, vy: -40, dmg: e.atk, col: '#8ab8ff', r: 4, life: 3.5, homing: 1.1, target: p, blockLv: 2, reflectable: true }); }
        if (e.stT > 1.5) { e.did = false; e.set('idle'); }
      }
    },
    over(e, g, cx, cy) {
      const x = e.x - cx, y = e.y - cy - 22;
      // 둘레를 도는 세 무기 (지금 든 것만 밝다)
      const items = [['sword', '#ff8a6a'], ['bow', '#ffe066'], ['staff', '#8ab8ff']];
      items.forEach(([k, col], i) => {
        const a = e.t * 1.6 + i * 2.09, X2 = Math.round(x + Math.cos(a) * 20), Y2 = Math.round(y + Math.sin(a) * 9);
        g.globalAlpha = e.mode === k ? 1 : 0.35; g.fillStyle = col;
        if (k === 'sword') { g.fillRect(X2, Y2 - 6, 2, 10); g.fillRect(X2 - 2, Y2 + 2, 6, 1); }
        else if (k === 'bow') { g.fillRect(X2 - 3, Y2 - 5, 1, 10); g.fillRect(X2 - 2, Y2 - 6, 2, 1); g.fillRect(X2 - 2, Y2 + 5, 2, 1); g.fillStyle = '#fff'; g.fillRect(X2, Y2 - 5, 1, 10); }
        else { g.fillRect(X2, Y2 - 6, 1, 12); g.beginPath(); g.arc(X2, Y2 - 7, 2.5, 0, Math.PI * 2); g.fill(); }
      });
      g.globalAlpha = 1;
      if (e.mode === 'staff' && e.veil > 0) { g.strokeStyle = 'rgba(138,184,255,0.7)'; g.beginPath(); g.ellipse(x, y, 16, 22, 0, 0, Math.PI * 2); g.stroke(); }
    },
    art(e) {
      const f = Math.floor(e.t * 2) % 2;
      return art('tria' + f + e.mode, 34, 48, (b) => {
        const r = R('#b8b0c8'), c = MODES[e.mode].col;
        poly(b, [[17, 46], [6, 30], [10, 18], [24, 18], [28, 30]], '#2a2438');
        poly(b, [[17, 44], [9, 30], [12, 20], [22, 20], [25, 30]], r[1]);
        b.rect(12, 20, 10, 3, r[3]);
        b.ellipse(17, 12, 7, 8, r[2]); b.rect(11, 10, 12, 3, '#1a1428'); b.rect(13, 11, 2, 1, c); b.rect(19, 11, 2, 1, c);
        poly(b, [[10, 6], [17, 0 + f], [24, 6]], r[3]);
        b.rect(4, 22, 5, 9, r[1]); b.rect(25, 22, 5, 9, r[1]);
        b.rect(16, 24, 2, 14, c);
      });
    } });

  /* ═════════ 4. 무덤지기 「부르는 자」 (잊힌 묘지) ═════════ */
  def('forgotking', { name: '부르는 자', title: '잊힌 묘지 · 무덤지기 「부르는 자」', hp: 330, atk: 7, r: 10, h: 44, col: '#8ab8d8', undead: true, dark: true, weak: ['light', 'fire'], exp: 760, gold: 520, speed: 50, noContact: true,
    init(e) { e.lit = 0; },
    guards(e, info) { if (e.lit > 0 || info.unblockable || info.el === 'light') return false; G.fx.float(e.x, e.y - 50, '빛이 없다…', '#8ab8d8'); sfx('wind'); return true; },
    phase2(e) { const m = W().map; e.dark0 = m.dark; m.dark = Math.max(m.dark || 0, 0.75); G.cine.bubble(e, '이름을… 불러 주오…', { life: 2.2 }); },
    ai(e, dt, Wd) {
      const p = Wd.player; e.lit = Math.max(0, e.lit - dt);
      // 빛: 주인공의 등불 · 켜진 횃불 곁 · 빛 공격을 맞았을 때 · 제가 부를 때
      if (p.lantern && U.dist(p.x, p.y, e.x, e.y) < 96) e.lit = Math.max(e.lit, 0.2);
      for (const t of Wd.ents) if (t.lit && t.kind !== 'foe' && t.flagKey && /torch/.test(t.flagKey) && U.dist(t.x, t.y, e.x, e.y) < 64) e.lit = Math.max(e.lit, 0.2);
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed * 0.6, dt); clampRoom(e); if (e.stT > (e.phase2 ? 1.1 : 1.5)) e.set(['hands', 'flames', 'call', 'blink'][e.pat++ % 4]); }
      if (e.st === 'hands') {
        if (e.stT < 0.02) { e.lit = Math.max(e.lit, 0.8); e.telegraph(0.4); const n = e.phase2 ? 5 : 3; for (let i = 0; i < n; i++) C().after(i * 0.28, () => { const pl = W().player; warnCircle(pl.x, pl.y, 16, 0.8, function () { hitCircle(this.x, this.y, 16, e.atk); for (let k = 0; k < 6; k++) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y, z: 0, vz: 80, g: 200, life: 0.5, col: '#e8e0d0', size: 2 }); sfx('impact'); }, '#8ab8d8'); }); }
        if (e.stT > 1.4) e.set('idle');
      }
      if (e.st === 'flames') {
        if (e.stT < 0.02) { e.lit = Math.max(e.lit, 1); e.telegraph(0.5); }
        if (e.stT > 0.5 && !e.did) { e.did = true; for (let i = 0; i < 3; i++) { const a = aim(e, p, 30) + (i - 1) * 0.5; shoot({ kind: 'orb', x: e.x, y: e.y - 30, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, dmg: e.atk, col: '#6ad8ff', r: 5, life: 4, homing: 0.9, target: p, blockLv: 2, reflectable: true, el: 'fire' }); } sfx('fire'); }
        if (e.stT > 1.1) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'call') {
        if (e.stT < 0.02) { e.lit = Math.max(e.lit, 0.6); G.cine.bubble(e, U.pick(['일어나라…', '누가 너를 잊었느냐…', '이름을 말해 보아라…']), { life: 1.6 }); const alive = Wd.ents.filter((m) => m.minion && !m.dead).length; if (alive < 4) { const rr = roomRect(e); minion(e, e.phase2 ? 'shade' : 'ghost', U.lerp(rr.x0, rr.x1, 0.2), U.lerp(rr.y0, rr.y1, 0.7)); minion(e, 'hollow', U.lerp(rr.x0, rr.x1, 0.8), U.lerp(rr.y0, rr.y1, 0.7)); } }
        if (e.stT > 1) e.set('idle');
      }
      if (e.st === 'blink') {
        if (e.stT < 0.02) { G.fx.glow(e.x, e.y - 20, '#8ab8d8', 12, 30); sfx('warp'); const rr = roomRect(e); e.x = U.lerp(rr.x0, rr.x1, 0.15 + Math.random() * 0.7); e.y = U.lerp(rr.y0, rr.y1, 0.2 + Math.random() * 0.6); G.fx.glow(e.x, e.y - 20, '#8ab8d8', 12, 30); }
        if (e.stT > 0.6) e.set('idle');
      }
    },
    draw(e, g, cx, cy) {
      const im = BS.B.forgotking.art(e);
      const a = e.lit > 0 ? 1 : 0.1 + Math.max(0, Math.sin(e.t * 2)) * 0.06;
      const x = Math.round(e.x - cx - im.width / 2), y = Math.round(e.y - cy - im.height + 1 - 4 + Math.sin(e.t * 2) * 2);
      g.globalAlpha = a; g.drawImage(im, x, y);
      if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8) * a; g.drawImage(X.silhouette(im, '#ffffff'), x, y); }
      g.globalAlpha = 1;
      // 등불은 늘 보인다 (어디 있는지 짐작만)
      const lx = Math.round(e.x - cx + 12), ly = Math.round(e.y - cy - 26 + Math.sin(e.t * 2) * 2);
      g.fillStyle = 'rgba(106,216,255,0.25)'; g.beginPath(); g.arc(lx, ly, 7 + Math.sin(e.t * 6), 0, Math.PI * 2); g.fill();
      g.fillStyle = '#bff0ff'; g.fillRect(lx - 1, ly - 2, 3, 4);
      if (e.tele > 0 && Math.floor(e.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx) - 1, y - 10, 3, 6); }
    },
    art(e) {
      const f = e.st === 'call' || e.st === 'hands' ? 1 : 0;
      return art('keeper' + f, 36, 58, (b) => {
        poly(b, [[18, 2], [6, 20], [4, 56], [32, 56], [30, 20]], '#1e1a2a');
        poly(b, [[18, 5], [9, 20], [8, 54], [28, 54], [27, 20]], '#3a3450');
        b.ellipse(18, 16, 6, 7, '#0a0810'); b.px(16, 16, '#8ad8ff'); b.px(20, 16, '#8ad8ff');
        for (let y = 26; y < 54; y += 4) b.hline(10, 26, y, '#2a2440');
        b.line(30, 8, 33, 56, '#6a5a4a'); if (f) { b.rect(2, 22, 6, 3, '#e8e0d0'); b.rect(0, 20, 2, 3, '#e8e0d0'); }
        b.rect(28, 30, 4, 2, '#8a8aa0');
      });
    } });

  /* ═════════ 5. 유성두꺼비 (별똥별 구덩이) ═════════ */
  def('toadstar', { name: '유성두꺼비', title: '별똥별 구덩이 · 별을 삼킨 유성두꺼비', hp: 240, atk: 6, r: 22, h: 34, col: '#7a6ad8', weak: ['ice', 'bolt'], exp: 520, gold: 360, speed: 40,
    init(e) { e.hot = 0; },
    ai(e, dt, Wd) {
      const p = Wd.player; e.hot = Math.max(0, e.hot - dt);
      const pw = e.hot > 0 ? 1.5 : 1;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); clampRoom(e); if (e.stT > (e.hot > 0 ? 0.8 : 1.4)) e.set(['leap', 'tongue', 'stars', 'leap'][e.pat++ % 4]); }
      if (e.st === 'leap') {
        if (e.stT < 0.02) { e.telegraph(0.5); e.to = [p.x, p.y]; e.from = [e.x, e.y]; warnCircle(p.x, p.y, 34, 0.9, null, '#b8a8ff'); sfx('jump'); }
        const k = U.clamp((e.stT - 0.3) / 0.6, 0, 1);
        if (e.stT > 0.3) { e.x = U.lerp(e.from[0], e.to[0], k); e.y = U.lerp(e.from[1], e.to[1], k); e.jz = Math.sin(k * Math.PI) * 50; }
        if (k >= 1 && !e.did) { e.did = true; e.jz = 0; hitCircle(e.x, e.y, 34, Math.round(e.atk * pw)); W().shake(6, 0.3); G.fx.dust(e.x, e.y, 16); G.fx.ring(e.x, e.y, '#b8a8ff', 40, 0.4, 3); sfx('impact'); if (e.hot > 0) wave(e.x, e.y, { sp: 120, max: 150, dmg: e.atk, col: '#ffe066' }); }
        if (e.stT > 1.3) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'tongue') {
        if (e.stT < 0.02) { e.telegraph(0.45); const a = U.angle(p.x - e.x, p.y - e.y + 8); e.ta = a; warnRect(Math.min(e.x, e.x + Math.cos(a) * 130) - 6, Math.min(e.y, e.y + Math.sin(a) * 130) - 6, Math.abs(Math.cos(a) * 130) + 12, Math.abs(Math.sin(a) * 130) + 12, 0.45, null, '#ff8aa8'); }
        if (e.stT > 0.45 && !e.did) { e.did = true; let x = e.x, y = e.y - 10; for (let k = 0; k < 13; k++) { x += Math.cos(e.ta) * 10; y += Math.sin(e.ta) * 10; G.fx.part({ x, y, z: 6, vz: 0, g: 0, life: 0.25, col: '#ff8aa8', size: 3 }); if (U.dist(p.x, p.y - 6, x, y) < 12) { C().hurtPlayer(p, Math.round(e.atk * pw), e, {}); const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); p.kx = nx * 260; p.ky = ny * 260; break; } } sfx('swing'); }
        if (e.stT > 0.9) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'stars') {
        if (e.stT < 0.02) {
          G.cine.bubble(e, '꾸르륵… 별이다…', { life: 1.4 }); const rr = roomRect(e); e.fallen = [];
          for (let i = 0; i < (e.phase2 ? 6 : 4); i++) { const x = U.lerp(rr.x0, rr.x1, 0.1 + Math.random() * 0.8), y = U.lerp(rr.y0, rr.y1, 0.2 + Math.random() * 0.7); warnCircle(x, y, 14, 1 + i * 0.15, function () { hitCircle(this.x, this.y, 14, e.atk); G.fx.shards(this.x, this.y, 10, '#fff4a8'); sfx('explode'); const star = W().add(new E.Ent({ kind: 'starbit', solid: false, x: this.x, y: this.y, hp: 1, life: 6, update(dt2) { this.life -= dt2; if (this.life <= 0) this.dead = true; if (Math.random() < 0.3) G.fx.part({ x: this.x, y: this.y - 4, z: 2, vz: 20, g: 0, life: 0.4, col: '#fff4a8', size: 1, glow: true }); }, swordHit() { this.dead = true; G.fx.sparks(this.x, this.y - 4, 8, '#fff4a8', 80); sfx('crystal'); G.fx.float(this.x, this.y - 20, '별을 부쉈다', '#fff4a8'); }, shotHit() { this.swordHit(); return true; }, draw(g, cx, cy) { const X2 = Math.round(this.x - cx), Y2 = Math.round(this.y - cy - 6); g.fillStyle = '#fff4a8'; g.fillRect(X2 - 2, Y2 - 1, 5, 3); g.fillRect(X2 - 1, Y2 - 2, 3, 5); } })); e.fallen.push(star); }, '#fff4a8'); }
        }
        if (e.stT > 2.2) e.set('eat');
      }
      if (e.st === 'eat') {
        const st = (e.fallen || []).find((s2) => !s2.dead);
        if (!st) { if (e.stT > 0.2) { G.fx.float(e.x, e.y - 40, '배고파…', '#b8a8ff'); e.set('idle'); } return; }
        e.toward(st.x, st.y, e.speed * 2.2, dt);
        if (U.dist(e.x, e.y, st.x, st.y) < 16) { st.dead = true; e.hot = 6; e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.04); G.fx.ring(e.x, e.y - 16, '#ffe066', 24, 0.4, 2); G.cine.bubble(e, '꿀꺽!', { life: 1 }); sfx('heal'); }
        if (e.stT > 4) e.set('idle');
      }
    },
    over(e, g, cx, cy) { if (e.hot > 0) { g.globalAlpha = 0.35 + Math.sin(e.t * 12) * 0.15; g.fillStyle = '#ffe066'; g.beginPath(); g.ellipse(e.x - cx, e.y - cy - 16 - (e.jz || 0), 26, 18, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } },
    art(e) {
      const f = e.st === 'tongue' ? 2 : Math.floor((e.walkT || e.t) * 2) % 2;
      return art('toad' + f, 60, 44, (b) => {
        const r = R('#6a5ab8');
        b.ellipse(30, 30, 26, 14, r[1]); b.ellipse(30, 27, 22, 11, r[2]); b.ellipse(22, 24, 8, 4, r[3]);
        b.ellipse(14, 38, 8, 5, r[1]); b.ellipse(46, 38, 8, 5, r[1]);
        b.ellipse(18, 14, 7, 7, r[2]); b.ellipse(42, 14, 7, 7, r[2]); b.ellipse(18, 13, 4, 4, '#fff4a8'); b.ellipse(42, 13, 4, 4, '#fff4a8'); b.rect(17, 12, 2, 3, '#1a1028'); b.rect(41, 12, 2, 3, '#1a1028');
        b.hline(16, 44, 32, '#2a1a4a'); if (f === 2) { b.rect(28, 32, 4, 6, '#ff8aa8'); }
        // 등에 박힌 별돌
        poly(b, [[30, 12], [34, 20], [42, 21], [36, 26], [38, 34], [30, 29], [22, 34], [24, 26], [18, 21], [26, 20]], '#fff0a8');
        b.ellipse(30, 24, 3, 3, '#ffffff');
        for (let i = 0; i < 6; i++) b.px(10 + i * 8, 30 + (i % 2) * 3, '#8a7ae8');
      });
    } });

  /* ═════════ 6. 렙업 슬라임 「Lv.9999」 (옛 렙업의 땅) ═════════ */
  def('lvslime', { name: 'Lv.9999', title: '옛 렙업의 땅 · 렙업 슬라임 「Lv.9999」', hp: 420, atk: 7, r: 22, h: 36, col: '#6ae07a', exp: 999, gold: 999, speed: 36,
    init(e) { e.lvN = 9990; e.grow = 0; },
    phase2(e) { G.cine.bubble(e, '렙업! 렙업! 렙업!', { life: 2 }); },
    ai(e, dt, Wd) {
      const p = Wd.player;
      // 작은 슬라임들이 몸으로 모여든다 → 닿으면 렙업
      for (const m of Wd.ents) if (m.minion && !m.dead && m.type !== 'boss' && U.dist(m.x, m.y, e.x, e.y) < e.r + 8) {
        m.dead = true; e.lvN++; e.grow = Math.min(8, e.grow + 1); e.atk += 0.5; e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.05);
        G.fx.float(e.x, e.y - 50, '렙업! Lv.' + e.lvN, '#ffe066', { big: true }); G.fx.ring(e.x, e.y - 16, '#ffe066', 30, 0.4, 2); sfx('levelup');
      }
      for (const m of Wd.ents) if (m.minion && !m.dead && m.feeds) { const [nx, ny] = U.norm(e.x - m.x, e.y - m.y); E.move(Wd.map, m, nx * 26 * dt, ny * 26 * dt); }
      e.r = 22 + e.grow; e.h = 36 + e.grow * 2;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); clampRoom(e); if (e.stT > 1.3) e.set(['bounce', 'spawn', 'bounce', 'nova'][e.pat++ % 4]); }
      if (e.st === 'bounce') {
        if (e.stT < 0.02) { e.telegraph(0.4); e.to = [p.x, p.y]; e.from = [e.x, e.y]; warnCircle(p.x, p.y, 26 + e.grow * 2, 0.8, null, '#8ae08a'); }
        const k = U.clamp((e.stT - 0.2) / 0.6, 0, 1);
        if (e.stT > 0.2) { e.x = U.lerp(e.from[0], e.to[0], k); e.y = U.lerp(e.from[1], e.to[1], k); e.jz = Math.sin(k * Math.PI) * 40; }
        if (k >= 1 && !e.did) { e.did = true; e.jz = 0; hitCircle(e.x, e.y, 26 + e.grow * 2, e.atk); W().shake(5, 0.25); sfx('squish'); G.fx.ring(e.x, e.y, '#8ae08a', 30, 0.35, 2); }
        if (e.stT > 1.1) { e.did = false; e.set('idle'); }
      }
      if (e.st === 'spawn') {
        if (e.stT < 0.02) {
          G.cine.bubble(e, '얘들아, 경험치 주러 와!', { life: 1.6 });
          const rr = roomRect(e), n = e.phase2 ? 5 : 3;
          for (let i = 0; i < n; i++) { const corner = [[rr.x0, rr.y0], [rr.x1, rr.y0], [rr.x0, rr.y1], [rr.x1, rr.y1], [(rr.x0 + rr.x1) / 2, rr.y1]][i % 5]; const m = minion(e, 'slime', corner[0], corner[1]); m.feeds = true; m.aggro = false; m.hp = m.maxHp = 6 + S().lv * 0.3; }
        }
        if (e.stT > 1) e.set('idle');
      }
      if (e.st === 'nova') {
        if (e.stT < 0.02) e.telegraph(0.6);
        if (e.stT > 0.6 && !e.did) { e.did = true; ring(e, 10 + e.grow, 90, { kind: 'orb', col: '#8ae08a', blockLv: 1 }); if (e.phase2) C().after(0.4, () => ring(e, 10 + e.grow, 120, { kind: 'orb', col: '#ffe066', off: 0.3, blockLv: 1 })); sfx('squish'); }
        if (e.stT > 1.2) { e.did = false; e.set('idle'); }
      }
    },
    over(e, g, cx, cy) {
      const x = Math.round(e.x - cx), y = Math.round(e.y - cy - e.h - 16 - (e.jz || 0));
      g.font = "10px 'Galmuri11', sans-serif"; g.textAlign = 'center';
      g.fillStyle = '#140c1c'; g.fillText('Lv.' + e.lvN, x + 1, y + 1); g.fillStyle = e.lvN >= 9999 ? '#ff6a8a' : '#ffe066'; g.fillText('Lv.' + e.lvN, x, y); g.textAlign = 'left';
    },
    draw(e, g, cx, cy) {
      const im = BS.B.lvslime.art(e), s = 1 + e.grow * 0.06;
      const w = Math.round(im.width * s), h = Math.round(im.height * s * (1 + Math.sin(e.t * 6) * 0.04));
      const x = Math.round(e.x - cx - w / 2), y = Math.round(e.y - cy - h + 1 - (e.jz || 0));
      g.drawImage(im, x, y, w, h);
      if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8); g.drawImage(X.silhouette(im, '#ffffff'), x, y, w, h); g.globalAlpha = 1; }
      if (e.tele > 0 && Math.floor(e.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx) - 1, y - 18, 3, 6); }
      BS.B.lvslime.over(e, g, cx, cy);
    },
    art(e) {
      return art('lvs' + (e.phase2 ? 1 : 0), 52, 40, (b) => {
        const r = R(e.phase2 ? '#e0c04a' : '#4ac85a');
        b.ellipse(26, 26, 24, 14, r[1]); b.ellipse(26, 22, 22, 14, r[2]); b.ellipse(18, 16, 7, 5, r[3]); b.ellipse(15, 14, 3, 2, '#ffffff');
        b.rect(16, 22, 4, 5, '#140c1c'); b.rect(32, 22, 4, 5, '#140c1c'); b.px(17, 23, '#ffffff'); b.px(33, 23, '#ffffff');
        b.hline(22, 30, 30, '#140c1c'); b.px(21, 29, '#140c1c'); b.px(31, 29, '#140c1c');
        // 왕관 (옛 렙업 게임의 슬라임 왕)
        poly(b, [[16, 10], [18, 2], [22, 7], [26, 0], [30, 7], [34, 2], [36, 10]], '#ffd84a'); b.px(26, 4, '#ff5a7a');
      });
    } });
})();
