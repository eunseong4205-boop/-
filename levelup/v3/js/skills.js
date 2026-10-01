/* 스킬 넓히기 — 무기마다 열다섯 (일반 셋 · 고급 넷 · 희귀 넷 · 영웅 셋 · 전설 하나)
   · 등급마다 요구치: 고급 그 무기 능력치 3 · Lv 5 / 희귀 6 · Lv 12 / 영웅 10 · Lv 20 / 전설 16 · Lv 32 (검 힘 · 활 솜씨 · 마법 지력)
   · 숙련: 쓸수록 ★1 → ★5 (15 · 40 · 90 · 180번). ★마다 피해 +8% · 재사용 대기 -5%
   · 얻는 길: 처음 무기 · 재능 나무 스킬 칸 · 기술서(가게) · 던전 보스 첫 승리 · 별관 보물 · 기억의 거울(각성) · 무한의 탑 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, C = G.combat, E = G.ent, D = G.data, H = G.hud;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const SN = G.stance, ASK = SN.ASK, DO = SN.DO, UPD = SN.UPD, GLY = SN.GLY;
  const near = SN.near, hit = SN.hit, magBase = SN.magBase, arrow = SN.arrow;
  const WSTAT = { sword: 'str', bow: 'dex', magic: 'int' };
  const GREQ = [null, null, { s: 3, lv: 5 }, { s: 6, lv: 12 }, { s: 10, lv: 20 }, { s: 16, lv: 32 }];
  const ang = (p) => U.angle(p.face[0], p.face[1]);
  /** 앞쪽 부채꼴 안의 적 */
  const cone = (p, r, half) => { const a = ang(p); return C.foes().filter((e) => { const dd = U.dist(p.x, p.y - 6, e.x, e.y - (e.h || 16) / 2); if (dd > r + (e.r || 8)) return false; let da = Math.atan2(e.y - p.y, e.x - p.x) - a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; return Math.abs(da) < half || dd < 12; }); };
  /** 둘레 폭발 (주인공은 다치지 않는다) */
  function blast(x, y, r, amt, info, col) {
    G.fx.ring(x, y, col || '#ffe8a8', r, 0.4, 3); G.fx.sparks(x, y, 18, col || '#ffb84a', 120); G.fx.dust(x, y, 8); W().shake(3, 0.2);
    for (const e of C.foes()) if (U.dist(x, y, e.x, e.y - 6) < r + (e.r || 8)) { const [nx, ny] = U.norm(e.x - x, e.y - y); hit(e, amt, Object.assign({ kx: nx, ky: ny, power: 1.2 }, info)); }
  }
  const nearest = (x, y, r, skip) => { let best = null, bd = r; for (const e of C.foes()) { if (skip && skip.has(e)) continue; const dd = U.dist(x, y, e.x, e.y); if (dd < bd) { bd = dd; best = e; } } return best; };
  /** 잠깐 떠 있는 스킬 효과 (따라다니는 칼날 · 구슬 · 중력장 · 빛줄기 …) */
  class Fx extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'skillfx', solid: false, sortBias: 6 }, o)); }
    update(dt, Wd) { this.t += dt; if (this.t >= this.life) { this.dead = true; return; } if (this.tick) this.tick(dt, Wd); }
    draw(g, cx, cy) { if (this.paint) this.paint(g, cx, cy); }
  }
  const addFx = (o) => W().add(new Fx(o));
  const busy = (p, id, dur, o) => { p.setState('skill'); p.skill = Object.assign({ id, t: 0, dur }, o || {}); };

  /* ═════════ 새 스킬 서른 ═════════ */
  const NEW = {
    // ── 검 (기력) ──
    a_lunge2: { w: 'sword', grade: 1, name: '번개 찌르기', cost: { st: 14 }, cd: 2.5, desc: '짧게 내달리며 찌른다 (×1.3, 내달리는 동안 무적).' },
    a_upper: { w: 'sword', grade: 1, name: '올려 베기', cost: { st: 16 }, cd: 3, desc: '앞의 적을 올려 베어 1초 띄운다(기절) (×1.5).' },
    a_cross: { w: 'sword', grade: 2, name: '십자 베기', cost: { st: 20 }, cd: 4, desc: '앞쪽을 두 번 엇갈려 벤다 (×1.1 두 번).' },
    a_spin3: { w: 'sword', grade: 2, name: '삼연 회전', cost: { st: 30 }, cd: 7, desc: '세 번 연달아 돈다 (×0.8 세 번, 둘레 모두).' },
    a_shout: { w: 'sword', grade: 2, name: '기합', cost: { st: 20 }, cd: 14, desc: '6초 동안 검 피해 +30%, 기력이 빨리 찬다.' },
    a_storm2: { w: 'sword', grade: 3, name: '칼날 폭풍', cost: { st: 35 }, cd: 12, desc: '1.6초 동안 칼날이 몸을 감싸 돈다 — 걸으며 둘레를 벤다 (0.15초마다 ×0.45).' },
    a_flash2: { w: 'sword', grade: 3, name: '그림자 베기', cost: { st: 24 }, cd: 8, desc: '가장 가까운 적의 등 뒤로 순간 이동해 벤다 (×2, 무적).' },
    a_quake2: { w: 'sword', grade: 4, name: '대지 강타', cost: { st: 40 }, cd: 12, desc: '뛰어올라 내리찍는다. 둘레 세 칸 반 ×2.4 · 기절 (뛰는 동안 무적).' },
    a_phantom: { w: 'sword', grade: 4, name: '환영 검', cost: { st: 36 }, cd: 18, desc: '6초 동안 환영 검 셋이 둘레를 돈다 (닿을 때마다 ×0.6).' },
    a_heaven: { w: 'sword', grade: 5, name: '천검', cost: { st: 50 }, cd: 22, desc: '하늘에서 검 열두 자루가 앞쪽에 쏟아진다 (한 자루 ×1.2).' },
    // ── 활 (화살 · 기력) ──
    a_quick: { w: 'bow', grade: 1, name: '속사', cost: { ar: 3, st: 8 }, cd: 2.5, desc: '곧게 세 발을 빠르게 (한 발 ×0.8).' },
    a_hop: { w: 'bow', grade: 1, name: '옆걸음 사격', cost: { ar: 1, st: 14 }, cd: 3, desc: '옆으로 비켜서며(무적) 모은 화살 한 발 (×1.4).' },
    a_firearrow: { w: 'bow', grade: 2, name: '불화살 세례', cost: { ar: 3, st: 10 }, cd: 5, desc: '불붙은 화살 셋 — 맞은 적이 탄다 (한 발 ×1).' },
    a_icearrow: { w: 'bow', grade: 2, name: '빙결 화살', cost: { ar: 1, st: 10 }, cd: 6, desc: '맞은 적을 1.5초 얼린다 (×1.4).' },
    a_blast: { w: 'bow', grade: 2, name: '폭발 화살', cost: { ar: 2, st: 14 }, cd: 7, desc: '맞은 자리에서 터진다 (직격 ×1.6 · 폭발 ×1.2).' },
    a_homing: { w: 'bow', grade: 3, name: '추적 화살', cost: { ar: 5, st: 16 }, cd: 8, desc: '적을 따라가는 화살 다섯 (한 발 ×0.9).' },
    a_ricochet: { w: 'bow', grade: 3, name: '도탄 사격', cost: { ar: 2, st: 16 }, cd: 8, desc: '맞으면 다음 적으로 튕겨 간다 — 다섯 번까지 (×1.2).' },
    a_barrage: { w: 'bow', grade: 4, name: '화살 폭풍', cost: { ar: 10, st: 30 }, cd: 14, desc: '2초 동안 앞쪽으로 화살 스무 발이 쏟아진다 — 걸으며 쏜다 (한 발 ×0.6).' },
    a_snipe2: { w: 'bow', grade: 4, name: '저격', cost: { ar: 2, st: 24 }, cd: 12, desc: '0.5초 겨눈 뒤 모든 것을 꿰뚫는 한 발 (×5, 치명타).' },
    a_comet: { w: 'bow', grade: 5, name: '유성 화살', cost: { ar: 4, st: 40 }, cd: 22, desc: '하늘로 쏜 화살이 1초 뒤 유성이 되어 떨어진다 (세 칸 ×4, 불).' },
    // ── 마법 (MP) ──
    a_sparks: { w: 'magic', grade: 1, name: '불티', cost: { mp: 6 }, cd: 2.5, desc: '부채꼴로 불티 다섯 (하나 ×0.5).' },
    a_blink2: { w: 'magic', grade: 1, name: '순간 이동', cost: { mp: 8 }, cd: 4, desc: '앞으로 네 칸 순간 이동 (무적).' },
    a_frostring: { w: 'magic', grade: 2, name: '서리 고리', cost: { mp: 14 }, cd: 7, desc: '둘레 세 칸을 얼린다 (×0.8, 1.2초 빙결).' },
    a_chain: { w: 'magic', grade: 2, name: '연쇄 번개', cost: { mp: 14 }, cd: 6, desc: '번개가 적 다섯을 잇는다 (하나 ×1.1, 감전).' },
    a_heal2: { w: 'magic', grade: 2, name: '치유의 빛', cost: { mp: 20 }, cd: 15, desc: '하트 1칸, 이어서 4초 동안 1칸 더.' },
    a_orbs: { w: 'magic', grade: 3, name: '마력 구슬', cost: { mp: 18 }, cd: 12, desc: '8초 동안 구슬 셋이 둘레를 돈다 (닿을 때마다 ×0.6).' },
    a_well: { w: 'magic', grade: 3, name: '중력장', cost: { mp: 22 }, cd: 12, desc: '앞쪽 네 칸에 2초 동안 적을 빨아들이고 조인다 (0.25초마다 ×0.25).' },
    a_meteor3: { w: 'magic', grade: 4, name: '운석 낙하', cost: { mp: 30 }, cd: 14, desc: '가까운 적(없으면 앞쪽)에 운석 (세 칸 ×3.2, 화상).' },
    a_clone: { w: 'magic', grade: 4, name: '분신', cost: { mp: 28 }, cd: 20, desc: '6초 동안 분신이 곁에서 마력탄을 쏜다 (0.8초마다 ×0.7).' },
    a_starfall: { w: 'magic', grade: 5, name: '별의 탄생', cost: { mp: 45 }, cd: 26, desc: '3초 동안 몸에서 뻗은 빛줄기가 둘레를 두 바퀴 넘게 쓸어 간다 (0.15초마다 ×0.5).' },
  };
  for (const id in NEW) ASK[id] = Object.assign({ icon: id }, NEW[id]);
  // 원래 열다섯의 등급
  Object.assign(ASK.a_dash, { grade: 1 }); Object.assign(ASK.a_break, { grade: 2 }); Object.assign(ASK.a_cyclone, { grade: 3 }); Object.assign(ASK.a_parry, { grade: 3 }); Object.assign(ASK.a_wave, { grade: 4 });
  Object.assign(ASK.a_fan, { grade: 1 }); Object.assign(ASK.a_leap, { grade: 2 }); Object.assign(ASK.a_snare, { grade: 3 }); Object.assign(ASK.a_rain, { grade: 3 }); Object.assign(ASK.a_pierce, { grade: 4 });
  Object.assign(ASK.a_nova, { grade: 1 }); Object.assign(ASK.a_drain, { grade: 2 }); Object.assign(ASK.a_ward, { grade: 3 }); Object.assign(ASK.a_slow, { grade: 3 }); Object.assign(ASK.a_twin, { grade: 4 });
  // 등급 요구치
  for (const id in ASK) { const A = ASK[id], q = GREQ[A.grade || 1]; if (q) A.req = { [WSTAT[A.w]]: q.s, lv: q.lv }; }

  /* ── 검 ── */
  DO.a_lunge2 = (p, s, d, m, k) => { busy(p, 'a_lunge2', 0.15, { dir: [...p.face], hit: new Set(), k }); p.inv = Math.max(p.inv, 0.15); sfx('thrust'); };
  UPD.a_lunge2 = (p, K, dt, m, s, d) => {
    E.move(m, p, K.dir[0] * 400 * dt, K.dir[1] * 400 * dt); p.atkFrame = 2;
    for (const e of C.foes()) if (!K.hit.has(e) && U.dist(p.x, p.y - 8, e.x, e.y - (e.h || 16) / 2) < 16 + (e.r || 8)) { K.hit.add(e); hit(e, d.atk * 1.3 * K.k, { src: 'dash', w: 'sword', kx: K.dir[0], ky: K.dir[1], power: 1, el: d.el }); }
    if (Math.random() < 0.6 && p.sheet) { const img = p.sheet.get('atk', p.dir, 2); if (img) G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.35); }
  };
  DO.a_upper = (p, s, d, m, k) => {
    for (const e of cone(p, d.reach + 8, 1.0)) { hit(e, d.atk * 1.5 * k, { src: 'sword', w: 'sword', kx: 0, ky: -0.3, power: 0.4, stun: 1, el: d.el }); G.fx.sparks(e.x, e.y - 14, 6, '#ffe8c8', 90); }
    C.cutArc(m, p.x, p.y - 4, ang(p), d.reach + 4, 1.4); G.fx.ring(p.x + p.face[0] * 12, p.y - 12 + p.face[1] * 8, '#ffe8c8', 12, 0.25, 2); sfx('swing');
    busy(p, 'a_upper', 0.22);
  };
  DO.a_cross = (p, s, d, m, k) => {
    const slash = () => { for (const e of cone(p, d.reach + 6, 0.9)) hit(e, d.atk * 1.1 * k, { src: 'sword', w: 'sword', kx: p.face[0], ky: p.face[1], power: 0.6, el: d.el }); C.cutArc(m, p.x, p.y - 4, ang(p), d.reach + 2, 1.8); G.fx.ring(p.x + p.face[0] * 14, p.y - 10 + p.face[1] * 10, '#fff4d8', 10, 0.2, 2); sfx('swing'); };
    slash(); C.after(0.15, slash); busy(p, 'a_cross', 0.32);
  };
  DO.a_spin3 = (p, s, d, m, k) => {
    for (let i = 0; i < 3; i++) C.after(i * 0.17, () => { const pl = W().player; for (const e of near(pl.x, pl.y - 6, d.reach + 12)) { const [nx, ny] = U.norm(e.x - pl.x, e.y - pl.y); hit(e, d.atk * 0.8 * k, { src: 'spin', w: 'sword', kx: nx, ky: ny, power: 0.8, el: d.el }); } C.cutArc(m, pl.x, pl.y - 4, 0, d.reach + 8, Math.PI * 2); G.fx.ring(pl.x, pl.y - 6, '#ffffff', d.reach + 10, 0.25, 2); sfx('spin'); });
    busy(p, 'a_spin3', 0.5);
  };
  DO.a_shout = (p, s, d, m, k) => { p.shoutT = 6; G.fx.ring(p.x, p.y - 8, '#ff8a5a', 30, 0.45, 3); G.fx.float(p.x, p.y - 32, '기합!', '#ff8a5a', { big: true, life: 0.8 }); W().shake(2, 0.2); sfx('perfect'); busy(p, 'a_shout', 0.25); };
  DO.a_storm2 = (p, s, d, m, k) => {
    sfx('spin'); let tk = 0;
    addFx({ x: p.x, y: p.y, life: 1.6, sortBias: 8, tick(dt) { const pl = W().player; this.x = pl.x; this.y = pl.y; tk -= dt; if (tk > 0) return; tk = 0.15; for (const e of near(pl.x, pl.y - 6, d.reach + 20)) { const [nx, ny] = U.norm(e.x - pl.x, e.y - pl.y); hit(e, d.atk * 0.45 * k, { src: 'spin', w: 'sword', kx: nx, ky: ny, power: 0.3, el: d.el }); } C.cutArc(W().map, pl.x, pl.y - 4, 0, d.reach + 6, Math.PI * 2); },
      paint(g, cx, cy) { const x = this.x - cx, y = this.y - cy - 8, r = d.reach + 16; g.strokeStyle = 'rgba(255,248,220,0.8)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { const a0 = this.t * 14 + i * 2.1; g.beginPath(); g.arc(x, y, r, a0, a0 + 0.9); g.stroke(); } g.lineWidth = 1; } });
  };
  DO.a_flash2 = (p, s, d, m, k) => {
    const e = nearest(p.x, p.y, 96);
    if (!e) { G.fx.float(p.x, p.y - 30, '닿는 적이 없다', '#c8c0d8', { life: 0.6 }); SN.ST.cd.a_flash2 = 0.6; p.stamina = Math.min(p.staminaMax, p.stamina + 24); return; }
    const [nx, ny] = U.norm(e.x - p.x, e.y - p.y), tx = e.x + nx * 16, ty = e.y + ny * 10;
    if (p.sheet) { const img = p.sheet.get('atk', p.dir, 1); if (img) G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.5); }
    if (m.boxFree(tx - p.bw / 2, ty - p.bh, p.bw, p.bh, p.z || 0, p)) { p.x = tx; p.y = ty; }
    p.face = [-nx, -ny]; p.dir = U.dir4(-nx, -ny, p.dir); p.inv = Math.max(p.inv, 0.35);
    hit(e, d.atk * 2 * k, { src: 'sword', w: 'sword', kx: -nx, ky: -ny, power: 1.2, stun: 0.5, el: d.el, crit: true });
    G.fx.ring(e.x, e.y - 10, '#c8b8ff', 16, 0.3, 2); W().hitstop(0.05); sfx('dash'); busy(p, 'a_flash2', 0.2);
  };
  DO.a_quake2 = (p, s, d, m, k) => { busy(p, 'a_quake2', 0.42, { k, done: false }); p.inv = Math.max(p.inv, 0.45); sfx('roll'); };
  UPD.a_quake2 = (p, K, dt, m, s, d) => {
    if (!K.done && Math.random() < 0.5 && p.sheet) { const img = p.sheet.get('atk', p.dir, 1); if (img) G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height - Math.sin(K.t / 0.3 * Math.PI) * 12, 0.3); }
    if (!K.done && K.t >= 0.3) { K.done = true; blast(p.x, p.y - 4, 56, d.atk * 2.4 * K.k, { src: 'sword', w: 'sword', stun: 1, el: d.el }, '#d8a868'); W().shake(6, 0.35); W().hitstop(0.06); sfx('rumble'); C.cutArc(m, p.x, p.y, 0, 40, Math.PI * 2); }
  };
  DO.a_phantom = (p, s, d, m, k) => {
    sfx('mirror');
    addFx({ x: p.x, y: p.y, life: 6, sortBias: 10, tick() { const pl = W().player; this.x = pl.x; this.y = pl.y; for (let i = 0; i < 3; i++) { const a = this.t * 4 + i * 2.094, bx = pl.x + Math.cos(a) * 26, by = pl.y - 8 + Math.sin(a) * 18; for (const e of C.foes()) if (U.dist(bx, by, e.x, e.y - (e.h || 16) / 2) < 10 + (e.r || 8) && !((e._phT || 0) > this.t)) { e._phT = this.t + 0.4; hit(e, d.atk * 0.6 * k, { src: 'beam', w: 'sword', kx: Math.cos(a), ky: Math.sin(a), power: 0.4 }); } } },
      paint(g, cx, cy) { for (let i = 0; i < 3; i++) { const a = this.t * 4 + i * 2.094, x = this.x - cx + Math.cos(a) * 26, y = this.y - cy - 8 + Math.sin(a) * 18; g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(a + Math.PI / 2); g.globalAlpha = 0.75; g.fillStyle = '#c8d8ff'; g.fillRect(-1, -8, 3, 12); g.fillStyle = '#ffffff'; g.fillRect(0, -8, 1, 11); g.fillStyle = '#8a7ab8'; g.fillRect(-3, 3, 7, 2); g.restore(); } g.globalAlpha = 1; } });
  };
  DO.a_heaven = (p, s, d, m, k) => {
    const cx0 = p.x + p.face[0] * 64, cy0 = p.y + p.face[1] * 52;
    for (let i = 0; i < 12; i++) C.after(i * 0.1, () => {
      const x = cx0 + (Math.random() - 0.5) * 92, y = cy0 + (Math.random() - 0.5) * 70;
      G.bosses.warnCircle(x, y, 13, 0.28, () => { addFx({ x, y, life: 0.2, sortBias: 40, paint(g, cx, cy) { const yy = y - cy - 70 * (1 - this.t / 0.2); g.fillStyle = '#fff8e0'; g.fillRect(Math.round(x - cx) - 1, Math.round(yy) - 16, 3, 18); g.fillStyle = '#c8a050'; g.fillRect(Math.round(x - cx) - 3, Math.round(yy) - 16, 7, 2); } }); C.after(0.2, () => blast(x, y, 16, d.atk * 1.2 * k, { src: 'beam', w: 'sword', el: 'light', power: 0.6 }, '#fff4c8')); }, '#fff4c8');
    });
    G.fx.ring(p.x, p.y - 10, '#fff4c8', 30, 0.5, 2); sfx('white'); busy(p, 'a_heaven', 0.3);
  };
  /* ── 활 ── */
  DO.a_quick = (p, s, d, m, k) => { for (let i = 0; i < 3; i++) C.after(i * 0.08, () => { const pl = W().player; arrow(pl, d, ang(pl), { dmg: d.bowAtk * 0.8 * k, charged: false, trail: '#e8e0cc' }); sfx('shoot'); }); busy(p, 'a_quick', 0.26); };
  DO.a_hop = (p, s, d, m, k) => {
    const ax = G.input.axisX || 0, ay = G.input.axisY || 0;
    let dir = [-p.face[1], p.face[0]];
    if (Math.abs(ax) + Math.abs(ay) > 0.3) { const [nx, ny] = U.norm(ax, ay); if (Math.abs(nx * p.face[0] + ny * p.face[1]) < 0.7) dir = [nx, ny]; }
    busy(p, 'a_hop', 0.22, { dir, k, shot: false }); p.inv = Math.max(p.inv, 0.22); sfx('roll');
  };
  UPD.a_hop = (p, K, dt, m, s, d) => { E.move(m, p, K.dir[0] * 280 * (1 - K.t / K.dur) * dt, K.dir[1] * 280 * (1 - K.t / K.dur) * dt); if (!K.shot && K.t > 0.12) { K.shot = true; arrow(p, d, ang(p), { dmg: d.bowAtk * 1.4 * K.k, pierce: 1, trail: '#fff4c0' }); sfx('shootc'); } };
  DO.a_firearrow = (p, s, d, m, k) => { for (const off of [-0.15, 0, 0.15]) arrow(p, d, ang(p) + off, { dmg: d.bowAtk * k, el: 'fire', trail: '#ffb04a' }); sfx('fire'); busy(p, 'a_firearrow', 0.2); };
  DO.a_icearrow = (p, s, d, m, k) => { const sh = arrow(p, d, ang(p), { dmg: d.bowAtk * 1.4 * k, el: 'ice', trail: '#bfe8ff' }); if (sh) sh.onHitFoe = (e) => { e.freezeT = Math.max(e.freezeT || 0, e.boss ? 0.3 : 1.5); G.fx.shards(e.x, e.y - 8, 6, '#bfe8ff'); }; sfx('ice'); busy(p, 'a_icearrow', 0.18); };
  DO.a_blast = (p, s, d, m, k) => {
    const sh = arrow(p, d, ang(p), { dmg: d.bowAtk * 1.6 * k, trail: '#ffb84a' });
    if (sh) { const boom = (x, y) => { if (sh.boomed) return; sh.boomed = true; blast(x, y, 30, d.bowAtk * 1.2 * k, { src: 'arrow', w: 'bow', el: 'fire' }, '#ffb84a'); sfx('explode'); }; sh.onHitFoe = (e) => boom(e.x, e.y - 6); const die0 = sh.die.bind(sh); sh.die = function () { boom(this.x, this.y); die0(); }; }
    sfx('shootc'); busy(p, 'a_blast', 0.2);
  };
  DO.a_homing = (p, s, d, m, k) => {
    const used = new Set(), a = ang(p);
    for (let i = 0; i < 5; i++) { const tg = nearest(p.x, p.y, 220, used) || nearest(p.x, p.y, 220); if (tg) used.add(tg); arrow(p, d, a + (i - 2) * 0.22, Object.assign({ dmg: d.bowAtk * 0.9 * k, sp: 250, life: 1.5, trail: '#c8f0a0' }, tg ? { homing: 11, target: tg } : {})); }
    sfx('shootc'); busy(p, 'a_homing', 0.22);
  };
  DO.a_ricochet = (p, s, d, m, k) => {
    const sh = arrow(p, d, ang(p), { dmg: d.bowAtk * 1.2 * k, life: 1.4, trail: '#e8f0ff' });
    if (sh) { sh.bounces = 0; sh.onHitFoe = function (e) { if (this.bounces >= 4) return; const nx = nearest(e.x, e.y, 130, this.hit); if (!nx) return; this.bounces++; const [ux, uy] = U.norm(nx.x - e.x, nx.y - 8 - (e.y - 8)), sp = U.len(this.vx, this.vy); this.vx = ux * sp; this.vy = uy * sp; this.x = e.x; this.y = e.y - 8; this.pierce = 1; this.t = 0; G.fx.sparks(e.x, e.y - 8, 5, '#e8f0ff', 60); sfx('clank'); }; }
    sfx('shoot'); busy(p, 'a_ricochet', 0.18);
  };
  DO.a_barrage = (p, s, d, m, k) => { p.barrageT = 2; p.barrageK = k; p.barrageTick = 0; sfx('shootc'); };
  DO.a_snipe2 = (p, s, d, m, k) => { busy(p, 'a_snipe2', 0.62, { k, shot: false }); sfx('draw'); };
  UPD.a_snipe2 = (p, K, dt, m, s, d) => {
    if (!K.shot && Math.random() < 0.5) { const a = ang(p); G.fx.part({ x: p.x + Math.cos(a) * (20 + Math.random() * 80), y: p.y - 6 + Math.sin(a) * (20 + Math.random() * 60), z: 0, vz: 0, g: 0, life: 0.15, col: '#ff6a7a', size: 1 }); }
    if (!K.shot && K.t >= 0.5) { K.shot = true; arrow(p, d, ang(p), { dmg: d.bowAtk * 5 * K.k, sp: 700, pierce: 99, heavy: true, r: 5, life: 0.9, crit: true, trail: '#ffffff' }); W().shake(4, 0.2); W().hitstop(0.04); sfx('shootc'); }
  };
  DO.a_comet = (p, s, d, m, k) => {
    const tg = nearest(p.x + p.face[0] * 60, p.y + p.face[1] * 50, 120), x = tg ? tg.x : p.x + p.face[0] * 80, y = tg ? tg.y : p.y + p.face[1] * 64;
    addFx({ x: p.x, y: p.y, life: 0.35, sortBias: 40, paint(g, cx, cy) { const yy = this.y - cy - 20 - this.t * 400; g.fillStyle = '#fff8c0'; g.fillRect(Math.round(this.x - cx), Math.round(yy), 2, 10); } });
    G.bosses.warnCircle(x, y, 46, 1.0, () => {
      addFx({ x, y, life: 0.25, sortBias: 40, paint(g, cx, cy) { const yy = y - cy - 90 * (1 - this.t / 0.25); g.fillStyle = '#ffd84a'; g.beginPath(); g.arc(Math.round(x - cx), Math.round(yy), 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff8c0'; g.fillRect(Math.round(x - cx) - 2, Math.round(yy) - 24, 4, 20); } });
      C.after(0.25, () => { blast(x, y, 50, d.bowAtk * 4 * k, { src: 'arrow', w: 'bow', el: 'fire', stun: 0.8 }, '#ffb84a'); for (const e of C.foes()) if (U.dist(x, y, e.x, e.y) < 56) e.burnT = Math.max(e.burnT || 0, 3); W().shake(7, 0.4); sfx('explode'); });
    }, '#ffb84a');
    sfx('shootc'); busy(p, 'a_comet', 0.25);
  };
  /* ── 마법 ── */
  DO.a_sparks = (p, s, d, m, k) => { const a = ang(p); for (const off of [-0.4, -0.2, 0, 0.2, 0.4]) C.shoot({ skill: true, kind: 'fire', x: p.x + Math.cos(a + off) * 10, y: p.y - 2 + Math.sin(a + off) * 8, vx: Math.cos(a + off) * 230, vy: Math.sin(a + off) * 230, dmg: magBase(s, d) * 0.5 * k, src: 'spell', w: 'magic', el: 'fire', r: 3, life: 0.4, trail: '#ffb04a', owner: 'player' }); sfx('fire'); busy(p, 'a_sparks', 0.18); };
  DO.a_blink2 = (p, s, d, m, k) => {
    const x0 = p.x, y0 = p.y; let bx = p.x, by = p.y;
    for (let r = 8; r <= 64; r += 4) { const tx = x0 + p.face[0] * r, ty = y0 + p.face[1] * r; if (m.boxFree(tx - p.bw / 2, ty - p.bh, p.bw, p.bh, p.z || 0, p) && !m.hazardAt(tx, ty - 2)) { bx = tx; by = ty; } }
    G.fx.glow(x0, y0 - 10, '#c8b8ff', 14); p.x = bx; p.y = by; p.inv = Math.max(p.inv, 0.3); G.fx.glow(bx, by - 10, '#c8b8ff', 16); G.fx.ring(bx, by - 8, '#c8b8ff', 14, 0.3, 2); sfx('warp'); busy(p, 'a_blink2', 0.12);
  };
  DO.a_frostring = (p, s, d, m, k) => { for (const e of near(p.x, p.y - 6, 50)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); hit(e, magBase(s, d) * 0.8 * k, { src: 'spell', w: 'magic', el: 'ice', kx: nx, ky: ny, power: 0.6 }); if (!e.boss) e.freezeT = Math.max(e.freezeT || 0, 1.2); } G.fx.ring(p.x, p.y - 6, '#bfe8ff', 50, 0.4, 3); G.fx.shards(p.x, p.y - 6, 14, '#bfe8ff'); sfx('ice'); busy(p, 'a_frostring', 0.22); };
  DO.a_chain = (p, s, d, m, k) => {
    let from = { x: p.x, y: p.y + 2 }; const seen = new Set();
    for (let i = 0; i < 5; i++) { const e = nearest(from.x, from.y, i ? 76 : 124, seen); if (!e) break; seen.add(e); C.bolts.push({ x0: from.x, y0: from.y - 10, x1: e.x, y1: e.y - 8, t: 0 }); hit(e, magBase(s, d) * 1.1 * k, { src: 'spell', w: 'magic', el: 'bolt', stun: 0.4, kx: 0, ky: 0 }); from = e; }
    if (!seen.size) C.bolts.push({ x0: p.x, y0: p.y - 30, x1: p.x + p.face[0] * 40, y1: p.y + p.face[1] * 30, t: 0 });
    sfx('bolt'); busy(p, 'a_chain', 0.22);
  };
  DO.a_heal2 = (p, s, d, m, k) => { const dd = G.st.derive(s); s.hp = Math.min(dd.hpMax, s.hp + 4); p.healT = 4; p.healTick = 0; G.fx.ring(p.x, p.y - 8, '#8ae0a0', 22, 0.5, 2); G.fx.float(p.x, p.y - 30, '+1칸', '#8ae0a0'); sfx('heal'); busy(p, 'a_heal2', 0.3); };
  DO.a_orbs = (p, s, d, m, k) => {
    sfx('cast');
    addFx({ x: p.x, y: p.y, life: 8, sortBias: 10, tick() { const pl = W().player; this.x = pl.x; this.y = pl.y; for (let i = 0; i < 3; i++) { const a = -this.t * 3 + i * 2.094, bx = pl.x + Math.cos(a) * 24, by = pl.y - 8 + Math.sin(a) * 16; for (const e of C.foes()) if (U.dist(bx, by, e.x, e.y - (e.h || 16) / 2) < 8 + (e.r || 8) && !((e._orbT || 0) > this.t)) { e._orbT = this.t + 0.4; hit(e, magBase(s, d) * 0.6 * k, { src: 'spell', w: 'magic', el: 'light', kx: Math.cos(a), ky: Math.sin(a), power: 0.4 }); } } },
      paint(g, cx, cy) { for (let i = 0; i < 3; i++) { const a = -this.t * 3 + i * 2.094, x = Math.round(this.x - cx + Math.cos(a) * 24), y = Math.round(this.y - cy - 8 + Math.sin(a) * 16); g.globalAlpha = 0.35; g.fillStyle = '#a8c8ff'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.fillStyle = '#e8f0ff'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); } } });
  };
  DO.a_well = (p, s, d, m, k) => {
    const x = p.x + p.face[0] * 64, y = p.y + p.face[1] * 52; let tk = 0;
    addFx({ x, y, life: 2, sortBias: -20, tick(dt) { for (const e of C.foes()) { if (e.boss || U.dist(x, y, e.x, e.y) > 70) continue; const [nx, ny] = U.norm(x - e.x, y - e.y); E.move(W().map, e, nx * 80 * dt, ny * 80 * dt); } tk -= dt; if (tk > 0) return; tk = 0.25; for (const e of near(x, y, 46)) hit(e, magBase(s, d) * 0.25 * k, { src: 'spell', w: 'magic', el: 'dark', kx: 0, ky: 0, power: 0 }); },
      paint(g, cx, cy) { const X0 = Math.round(this.x - cx), Y0 = Math.round(this.y - cy); for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(160,110,255,' + (0.5 - i * 0.12) + ')'; g.beginPath(); g.ellipse(X0, Y0, 40 - i * 12 - (this.t * 30) % 12, (40 - i * 12 - (this.t * 30) % 12) * 0.45, 0, 0, Math.PI * 2); g.stroke(); } g.fillStyle = '#2a1040'; g.beginPath(); g.ellipse(X0, Y0, 6, 3, 0, 0, Math.PI * 2); g.fill(); } });
    sfx('mirror'); busy(p, 'a_well', 0.25);
  };
  DO.a_meteor3 = (p, s, d, m, k) => {
    const tg = nearest(p.x, p.y, 144), x = tg ? tg.x : p.x + p.face[0] * 80, y = tg ? tg.y : p.y + p.face[1] * 64;
    G.bosses.warnCircle(x, y, 44, 0.8, () => {
      addFx({ x, y, life: 0.22, sortBias: 40, paint(g, cx, cy) { const yy = y - cy - 100 * (1 - this.t / 0.22); g.fillStyle = '#ff8a3a'; g.beginPath(); g.arc(Math.round(x - cx), Math.round(yy), 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffe080'; g.beginPath(); g.arc(Math.round(x - cx) - 2, Math.round(yy) - 2, 4, 0, Math.PI * 2); g.fill(); } });
      C.after(0.22, () => { blast(x, y, 46, magBase(s, d) * 3.2 * k, { src: 'spell', w: 'magic', el: 'fire', stun: 0.6 }, '#ff8a3a'); for (const e of C.foes()) if (U.dist(x, y, e.x, e.y) < 52) e.burnT = Math.max(e.burnT || 0, 3); W().shake(6, 0.35); sfx('explode'); });
    }, '#ff8a3a');
    sfx('cast'); busy(p, 'a_meteor3', 0.3);
  };
  DO.a_clone = (p, s, d, m, k) => {
    const ox = -p.face[1] * 18, oy = p.face[0] * 12; let tk = 0.3;
    G.fx.glow(p.x + ox, p.y + oy - 10, '#d8b0ff', 16); sfx('mirror');
    const img = p.sheet ? p.sheet.get('idle', p.dir, 0) || p.sheet.get('walk', p.dir, 0) : null;
    addFx({ x: p.x + ox, y: p.y + oy, life: 6, sortBias: 0, tick(dt) { const pl = W().player; this.x = U.lerp(this.x, pl.x + ox, dt * 4); this.y = U.lerp(this.y, pl.y + oy, dt * 4); tk -= dt; if (tk > 0) return; tk = 0.8; const e = nearest(this.x, this.y, 150); if (!e) return; const [nx, ny] = U.norm(e.x - this.x, e.y - 8 - (this.y - 8)); C.shoot({ skill: true, kind: 'orb', col: '#d8b0ff', x: this.x, y: this.y - 8, vx: nx * 220, vy: ny * 220, dmg: magBase(s, d) * 0.7 * k, src: 'spell', w: 'magic', el: 'light', r: 3, life: 0.9, trail: '#d8b0ff', owner: 'player', z: pl.z }); sfx('cast'); },
      paint(g, cx, cy) { g.globalAlpha = 0.5 + Math.sin(this.t * 8) * 0.1; if (img) g.drawImage(img, Math.round(this.x - cx - img.width / 2), Math.round(this.y - cy - img.height)); else { g.fillStyle = '#d8b0ff'; g.fillRect(Math.round(this.x - cx) - 4, Math.round(this.y - cy) - 20, 8, 20); } g.globalAlpha = 1; } });
    busy(p, 'a_clone', 0.25);
  };
  DO.a_starfall = (p, s, d, m, k) => {
    const a0 = ang(p); let tk = 0;
    addFx({ x: p.x, y: p.y, life: 3, sortBias: 30, tick(dt) { const pl = W().player; this.x = pl.x; this.y = pl.y; this.a = a0 + this.t * Math.PI * 1.6; tk -= dt; if (tk > 0) return; tk = 0.15; const ex = pl.x + Math.cos(this.a) * 100, ey = pl.y - 8 + Math.sin(this.a) * 76; for (const e of C.foes()) { const t2 = U.clamp(((e.x - pl.x) * (ex - pl.x) + (e.y - 8 - pl.y + 8) * (ey - pl.y + 8)) / (Math.pow(ex - pl.x, 2) + Math.pow(ey - pl.y + 8, 2)), 0, 1); const qx = pl.x + (ex - pl.x) * t2, qy = pl.y - 8 + (ey - pl.y + 8) * t2; if (U.dist(qx, qy, e.x, e.y - (e.h || 16) / 2) < 9 + (e.r || 8)) hit(e, magBase(s, d) * 0.5 * k, { src: 'spell', w: 'magic', el: 'light', kx: Math.cos(this.a), ky: Math.sin(this.a), power: 0.3 }); } },
      paint(g, cx, cy) { const x = this.x - cx, y = this.y - cy - 8, a = this.a || a0, ex = x + Math.cos(a) * 100, ey = y + Math.sin(a) * 76; g.strokeStyle = 'rgba(255,248,200,0.5)'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.lineWidth = 1; g.fillStyle = '#fff8c0'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); } });
    G.fx.ring(p.x, p.y - 8, '#fff8c0', 30, 0.5, 3); sfx('white'); busy(p, 'a_starfall', 0.3);
  };

  /* ── 매 프레임: 기합 · 화살 폭풍 · 치유 ── */
  const up0 = C.update;
  let hooked = false;
  C.update = function (dt) {
    const r = up0.apply(this, arguments);
    if (!hooked && G.story && G.story.onTick) { hooked = true; G.story.onTick.push(() => SK.tick()); }   // 이야기(world)는 나중에 실린다
    const p = W().player, s = S(); if (!p || !s) return r;
    if (p.shoutT > 0) { p.shoutT -= dt; p.stamina = Math.min(p.staminaMax, p.stamina + dt * 12); if (Math.random() < dt * 8) G.fx.part({ x: p.x + (Math.random() - 0.5) * 12, y: p.y, z: 4 + Math.random() * 12, vz: 16, g: 0, life: 0.4, col: '#ff8a5a', size: 1, glow: true }); }
    if (p.barrageT > 0) {
      p.barrageT -= dt; p.barrageTick -= dt;
      if (p.barrageTick <= 0 && !G.script.running) { p.barrageTick = 0.1; const d = G.st.derive(s); arrow(p, d, ang(p) + (Math.random() - 0.5) * 0.7, { dmg: d.bowAtk * 0.6 * (p.barrageK || 1), charged: false, sp: 300 + Math.random() * 60, trail: '#e8f0c0' }); sfx('shoot'); }
    }
    if (p.healT > 0) { p.healT -= dt; p.healTick += dt; if (p.healTick >= 1) { p.healTick = 0; const d = G.st.derive(s); s.hp = Math.min(d.hpMax, s.hp + 1); G.fx.float(p.x, p.y - 26, '+¼', '#8ae0a0', { life: 0.5 }); } }
    return r;
  };
  const mod0 = C.dmgMod;
  C.dmgMod = function (e, info) { let k = mod0 ? mod0.apply(this, arguments) : 1; if (k === 0) return 0; const p = W().player; if (p && p.shoutT > 0 && (info.w === 'sword' || ['sword', 'spin', 'dash', 'beam'].includes(info.src))) k *= 1.3; return k; };

  /* ═════════ 숙련 ═════════ */
  const RANK_AT = [0, 0, 15, 40, 90, 180];
  function rank(s, id) { const n = (s.askUse && s.askUse[id]) || 0; let r = 1; for (let i = 2; i <= 5; i++) if (n >= RANK_AT[i]) r = i; return r; }
  SN.rank = rank;
  SN.used = function (s, id) {
    s.askUse = s.askUse || {};
    const before = rank(s, id); s.askUse[id] = (s.askUse[id] || 0) + 1; const after = rank(s, id);
    if (after > before) { G.ui.toast('숙련 [y]' + '★'.repeat(after) + '[/] — 「' + ASK[id].name + '」 피해 +' + (after - 1) * 8 + '% · 재사용 대기 -' + (after - 1) * 5 + '%', 'gold'); sfx('skill'); }
  };
  SN.nextRank = (s, id) => { const r = rank(s, id); return r >= 5 ? null : RANK_AT[r + 1] - ((s.askUse && s.askUse[id]) || 0); };

  /* ═════════ 그림 ═════════ */
  Object.assign(GLY, {
    sbook: [[' bbbbbbbb  ', ' bWWWWWWb  ', ' bWyyyyWb  ', ' bWWWWWWb  ', ' bWyyyyWb  ', ' bWWWWWWb  ', ' bWyyyWWb  ', ' bWWWWWWb  ', ' bbbbbbbb  ', '  rr      '], { b: '#6a4a8a', W: '#f0e8d8', y: '#8a7ab8', r: '#d84a5a' }],
    a_lunge2: [['            ', '       y    ', 'wwwwwwwwwyW ', '       y    ', '  y   y     ', ' y   y      '], { w: '#e8eef8', y: '#ffe066', W: '#ffffff' }],
    a_upper: [['     w      ', '    www     ', '   w w w    ', '     w      ', '     w      ', '   rrrrr    ', '  r     r   '], { w: '#ffe8c8', r: '#c8a070' }],
    a_cross: [['w        w  ', ' w      w   ', '  w    w    ', '   w  w     ', '    ww      ', '   w  w     ', '  w    w    ', ' w      w   ', 'w        w  '], { w: '#fff4d8' }],
    a_spin3: [['  wwwwww    ', ' w  ww  w   ', 'w  w  w  w  ', 'w w ww w w  ', 'w  w  w  w  ', ' w  ww  w   ', '  wwwwww    '], { w: '#ffffff' }],
    a_shout: [['  r   r   r ', '   r  r  r  ', '    rrrrr   ', ' rrrrWWrrrr ', '    rrrrr   ', '   r  r  r  ', '  r   r   r '], { r: '#ff8a5a', W: '#fff4c8' }],
    a_storm2: [[' w   ww   w ', '  w w  w w  ', '   w    w   ', ' ww  bb  ww ', '   w    w   ', '  w w  w w  ', ' w   ww   w '], { w: '#fff8dc', b: '#8a7ab8' }],
    a_flash2: [['   pppp     ', '  p    p    ', '  p ww p    ', '   pwwp     ', '    ww      ', '   w  w     ', '  w    w    '], { p: '#c8b8ff', w: '#e8e0ff' }],
    a_quake2: [['     ww     ', '     ww     ', '   wwwwww   ', '     ww     ', ' d   ww   d ', 'ddd dddd ddd'], { w: '#e8eef8', d: '#d8a868' }],
    a_phantom: [['  b     b   ', ' bWb   bWb  ', '  b     b   ', '     b      ', '    bWb     ', '     b      '], { b: '#c8d8ff', W: '#ffffff' }],
    a_heaven: [[' y  y  y  y ', ' w  w  w  w ', ' w  w  w  w ', '            ', ' g  g  g  g '], { y: '#ffd84a', w: '#fff8e0', g: '#c8a050' }],
    a_quick: [['            ', 'aaaaa>      ', '     aaaaa> ', 'aaaaa>      '], { a: '#c8b890', '>': '#ffffff' }],
    a_hop: [['    aaaaA   ', '            ', ' ll   ll    ', 'l  l l  l   '], { a: '#c8b890', A: '#fff', l: '#c8f0a0' }],
    a_firearrow: [['  r     r   ', 'aaaar  aaaar', '  r     r   ', '     r      ', '  aaaar     ', '     r      '], { a: '#c8b890', r: '#ff8a3a' }],
    a_icearrow: [['     b      ', '   b b b    ', 'aaaaabbbb   ', '   b b b    ', '     b      '], { a: '#c8b890', b: '#bfe8ff' }],
    a_blast: [['   r r r    ', '    rrr     ', 'aaarrYrr    ', '    rrr     ', '   r r r    '], { a: '#c8b890', r: '#ff8a3a', Y: '#ffe066' }],
    a_homing: [['        g   ', '   aaaa g   ', '  a    gg   ', ' a          ', 'a           '], { a: '#c8f0a0', g: '#e8f0c0' }],
    a_ricochet: [['a       a   ', ' a     a a  ', '  a   a   a ', '   a a      ', '    a       '], { a: '#e8f0ff' }],
    a_barrage: [['a a a a a a ', ' a a a a a  ', 'a a a a a a ', ' a a a a a  '], { a: '#e8f0c0' }],
    a_snipe2: [['     r      ', '   rrrrr    ', '  r  r  r   ', ' rrrrWrrrr  ', '  r  r  r   ', '   rrrrr    ', '     r      '], { r: '#ff6a7a', W: '#ffffff' }],
    a_comet: [['        yy  ', '       yYy  ', '      yy    ', '    yy      ', '  yy        ', ' r r r      '], { y: '#ffd84a', Y: '#ffffff', r: '#ff8a3a' }],
    a_sparks: [['  r  r  r   ', '   r r r    ', '    rrr     ', ' rrrrYrrrr  ', '            '], { r: '#ff8a3a', Y: '#ffe066' }],
    a_blink2: [['p    pppp   ', 'p   p    p  ', 'p   p WW p  ', 'p   p WW p  ', 'p    pppp   '], { p: '#c8b8ff', W: '#ffffff' }],
    a_frostring: [['  bbbbbbb   ', ' b   W   b  ', 'b  W   W  b ', 'b    W    b ', 'b  W   W  b ', ' b   W   b  ', '  bbbbbbb   '], { b: '#bfe8ff', W: '#ffffff' }],
    a_chain: [['y          ', ' y    y    ', '  y  y y   ', '   yy   y  ', '         y '], { y: '#ffe066' }],
    a_heal2: [['    gg      ', '    gg      ', ' gggggggg   ', ' gggggggg   ', '    gg      ', '    gg      '], { g: '#8ae0a0' }],
    a_orbs: [['  b     b   ', ' bWb   bWb  ', '  b     b   ', '     b      ', '    bWb     ', '     b      '], { b: '#a8c8ff', W: '#e8f0ff' }],
    a_well: [['   pppp     ', '  p    p    ', ' p  pp  p   ', ' p p  p p   ', ' p  pp  p   ', '  p    p    ', '   pppp     '], { p: '#a06eff' }],
    a_meteor3: [['        rr  ', '       rYr  ', '      rr    ', '    rr      ', '  rr        ', ' d d d      '], { r: '#ff8a3a', Y: '#ffe080', d: '#8a6a3a' }],
    a_clone: [['  pp   pp   ', ' pWWp pWWp  ', '  pp   pp   ', ' pppp pppp  ', ' p  p p  p  '], { p: '#d8b0ff', W: '#ffffff' }],
    a_starfall: [['     W      ', '  w  W  w   ', '   w W w    ', 'WWWWWWWWWW  ', '   w W w    ', '  w  W  w   ', '     W      '], { W: '#fff8c0', w: '#ffd84a' }],
  });

  /* ═════════ 기술서 ═════════ */
  const PRICE = [0, 600, 2400, 9000, 26000, 0];
  for (const id in ASK) {
    const A = ASK[id];
    D.ITEMS['sb_' + id] = { id: 'sb_' + id, type: 'sbook', skill: id, grade: A.grade || 1, icon: 'sbook', price: PRICE[A.grade || 1], name: '기술서: ' + A.name, desc: '읽으면 ' + SN.WNAME[A.w] + ' 스킬 「' + A.name + '」을 익힌다. ' + A.desc };
  }
  const give0 = G.st.give;
  G.st.give = function (s, id, n) {
    const it = D.ITEMS[id];
    if (it && it.type === 'sbook') {
      if (s.askills && s.askills[it.skill]) { const g = Math.round((it.price || 4000) * 0.5); s.gold += g; if (G.ui && G.ui.toast) G.ui.toast('이미 아는 스킬 — 기술서를 팔아 ◎' + g, ''); return; }
      SN.learn(s, it.skill); return;
    }
    return give0.apply(this, arguments);
  };
  // 가게: 기술서 (등급 차례로)
  const LATE = [];   // 이야기 쪽(world)에서 생기는 가게 — 98_balance가 마지막에 채운다
  const put = (sh, list) => { LATE.push([sh, list]); };   // 가게 목록은 이야기 쪽에서 다시 만들어지기도 해서 늘 마지막에
  put('green', ['a_upper']); put('red', ['a_lunge2', 'a_quick']); put('blue', ['a_hop', 'a_sparks']); put('amber_market', ['a_blink2', 'a_leap']);
  put('yellow', ['a_break', 'a_firearrow', 'a_chain']); put('purple', ['a_drain', 'a_heal2', 'a_frostring']); put('rainbow', ['a_spin3', 'a_blast', 'a_shout']);
  put('white', ['a_cyclone', 'a_snare', 'a_ward']); put('gray', ['a_slow', 'a_rain', 'a_parry', 'a_orbs']); put('black', ['a_wave', 'a_pierce', 'a_twin']); put('colorful', ['a_quake2', 'a_barrage', 'a_meteor3']);
  // 던전 보스 첫 승리 (예전 기록에도: 이미 이긴 보스는 다음에 들어설 때 받는다)
  const BOSS_BOOK = { d1: 'a_shout', d2: 'a_icearrow', d3: 'a_frostring', d4: 'a_storm2', d5: 'a_orbs', d6: 'a_homing', d7: 'a_flash2', d8: 'a_meteor3', d9: 'a_quake2', d11: 'a_barrage', d12: 'a_ricochet', d13: 'a_well', d14: 'a_snipe2', d15: ['a_phantom', 'a_clone'] };
  let bossBusy = false;
  const tick0 = () => {
    const s = S(); if (!s || bossBusy || G.script.running || !W().player) return;
    for (const did in BOSS_BOOK) {
      if (!s.flags[did + ':boss'] || s.flags['bbook:' + did]) continue;
      s.flags['bbook:' + did] = true;
      const list = [].concat(BOSS_BOOK[did]);
      const here = W().map && W().map.dungeon === did;
      if (here) { bossBusy = true; G.script.run(async (c) => { await c.wait(1.2); for (const b of list) await c.getItem('sb_' + b); bossBusy = false; }); }
      else { for (const b of list) G.st.give(s, 'sb_' + b); G.ui.toast('지난 승리의 기억 — 스킬 「' + list.map((b) => ASK[b].name).join(' · ') + '」을 익혔다', 'gold'); }
      return;
    }
  };
  // 별관 보물방의 기술서 (위험도에 맞는 등급, 던전마다 다르게)
  const WING_POOL = { 2: ['a_cross', 'a_spin3', 'a_blast', 'a_firearrow', 'a_heal2', 'a_chain', 'a_break', 'a_leap', 'a_drain'], 3: ['a_parry', 'a_cyclone', 'a_rain', 'a_snare', 'a_ward', 'a_slow', 'a_storm2', 'a_homing', 'a_orbs', 'a_well', 'a_ricochet', 'a_flash2'], 4: ['a_wave', 'a_pierce', 'a_twin', 'a_phantom', 'a_snipe2', 'a_clone', 'a_quake2', 'a_barrage', 'a_meteor3'] };
  const wingUsed = new Set();
  function wingBook(did, tier) {
    const g = tier <= 2 ? 2 : tier <= 6 ? 3 : 4;
    const pool = WING_POOL[g].filter((x) => !wingUsed.has(x));
    const list = pool.length ? pool : WING_POOL[g];
    const id = list[U.hash('wbook:' + did) % list.length]; wingUsed.add(id);
    return 'sb_' + id;
  }

  /* ═════════ 얻는 곳 (스킬 화면에 보인다) ═════════ */
  function sources(id) {
    const out = [], A = ASK[id];
    if ({ a_dash: 1, a_fan: 1, a_nova: 1 }[id]) out.push('처음 ' + SN.WNAME[A.w] + '을 얻으면');
    const node = D.SKILLS.find((k) => k.act === id); if (node) out.push('재능 「' + node.tree + '」 ' + node.row + '줄');
    for (const [k, sh] of Object.entries(D.SHOPS)) if (sh.items.includes('sb_' + id)) out.push('기술서 — ' + sh.name);
    for (const [did, b] of Object.entries(BOSS_BOOK)) if ([].concat(b).includes(id)) out.push((G.dungeon.DUN[did] ? G.dungeon.DUN[did].name : did) + ' 보스 첫 승리');
    for (const [did, b] of Object.entries(SK.wingBooks || {})) if (b === 'sb_' + id) out.push((G.dungeon.DUN[did] ? G.dungeon.DUN[did].name : did) + ' 별관 보물');
    for (const x of SK.extra[id] || []) out.push(x);
    return out;
  }
  const placeLate = () => { for (const [sh, list] of LATE.splice(0)) { const S2 = D.SHOPS[sh] || D.SHOPS.blue; for (const k of list) if (!S2.items.includes('sb_' + k)) S2.items.push('sb_' + k); } };   // 그 가게가 끝내 없으면 블루 항구에
  const SK = { NEW, RANK_AT, rank, sources, wingBook, wingBooks: {}, BOSS_BOOK, tick: tick0, GREQ, placeLate,
    extra: { a_heaven: ['기억의 거울 — 각성한 그림자 녹턴', '무한의 탑 50층'], a_comet: ['기억의 거울 — 각성한 빈 왕', '무한의 탑 35층'], a_starfall: ['기억의 거울 — 각성한 벨루', '무한의 탑 45층'] } };
  G.skills = SK;

  // 기록: 숙련 칸
  const mig0 = G.prog.migrate;
  G.prog.migrate = function (s) { s = mig0.apply(this, arguments); s.askUse = s.askUse || {}; return s; };
})();
