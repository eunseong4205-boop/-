/* 무기 바꾸기 · 스킬 — 전투의 손잡이
   · 검 · 활 · 마법 가운데 하나만 손에 든다(s.weapon). 공격 버튼(J)은 든 무기로:
     검 — 베기 · 꾹 눌렀다 떼면 회전 베기 / 활 — 누른 채 조준, 떼면 쏜다 / 마법 — 고른 주문
   · 바꾸기 버튼(K): 다음 무기로. 바꾸는 0.22초 동안은 공격하지 못한다(빠른 손 · 날랜 옷으로 줄어든다)
   · 스킬 버튼(L): 든 무기의 스킬 하나(스킬 탭에서 무기마다 골라 둔다) — 검은 기력, 활은 화살과 기력, 마법은 MP. 재사용 대기가 있다
   · 도구 버튼(I): 폭탄 · 갈고리 · 등불 · 거울 · 낚싯대 (도구 탭) / 필살 버튼(O): 든 무기에 맞춰 골라 둔 필살기
   · 무기를 섞어 싸우는 재능(전환 갈래)과 장비가 바꾸기를 보상한다. 무기 내성이 있는 적(검 · 활 · 마법이 튕겨 나간다)은 바꿔서 잡는다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, I = G.input, C = G.combat, E = G.ent, D = G.data;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const foes = () => C.foes();
  const WEAPONS = ['sword', 'bow', 'magic'];
  const WNAME = { sword: '검', bow: '활', magic: '마법' };
  const WCOL = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  const SRCW = { sword: 'sword', spin: 'sword', dash: 'sword', beam: 'sword', lunge: 'sword', arrow: 'bow', spell: 'magic' };
  const ST = { cd: {}, usedAt: { sword: -99, bow: -99, magic: -99 }, swapAt: -99, firstHit: false, stayT: 0, lastW: null, trinityT: 0 };
  const sk = (id) => !!(S().skills && S().skills[id]);

  /* ───────── 무기 ───────── */
  function avail(s) { return WEAPONS.filter((w) => (w === 'sword' ? !!s.equip.sword : w === 'bow' ? !!s.tools.bow : !!s.spell)); }
  function cur(s) { s = s || S(); const a = avail(s); let w = s.weapon || 'sword'; if (!a.includes(w)) w = a[0] || 'sword'; return w; }
  C.weapon = () => cur(S());
  /** 장비 효과 합 (옷 · 마도구 · 장신구 · 무기) */
  function fx(s, k) {
    const I2 = D.ITEMS, e = s.equip;
    let v = 0;
    for (const id of [e.armor, e.focus, e.acc1, e.acc2, e.sword, e.bow, e.shield]) { const it = id && I2[id]; if (it && it.fx && it.fx[k]) v += it.fx[k]; if (it && it[k] != null && typeof it[k] === 'number' && k.startsWith('w_')) v += it[k]; }
    return v;
  }
  function swapTime(s) { return Math.max(0.02, 0.22 * (sk('tr_quick') ? 0.35 : 1) * (1 - Math.min(0.6, fx(s, 'swap'))) * (G.stance.swapTimeK ? G.stance.swapTimeK() : 1)); }
  const BUSY = new Set(['attack', 'charge', 'spin', 'bow', 'cast', 'dash', 'sp', 'hook', 'lift', 'skill', 'jump', 'fall', 'dead']);
  function doSwap(p, s, from, to) {
    const d = G.st.derive(s);
    s.weapon = to; p.swapT = swapTime(s); ST.swapAt = p.t; ST.firstHit = true; ST.stayT = 0;
    G.fx.ring(p.x, p.y - 8, WCOL[to], 12, 0.25, 1); G.fx.float(p.x, p.y - 30, WNAME[to], WCOL[to], { life: 0.55 });
    sfx('equip');
    if (sk('tr_flow') && p.t - (ST.flowAt || -9) > 1.5) { ST.flowAt = p.t; p.stamina = Math.min(p.staminaMax, p.stamina + 10); s.mp = Math.min(d.mpMax, s.mp + 4); }
    if (sk('tr_guard') && p.t - (ST.guardAt || -9) > 3) { ST.guardAt = p.t; p.inv = Math.max(p.inv, 0.3); G.fx.glow(p.x, p.y - 10, '#8ad8ff', 16, 30); }
    if (sk('tr_charge') && p.t - (ST.chargeAt || -9) > 1) { ST.chargeAt = p.t; C.addSpecial(4 + fx(s, 'swapSp')); }
    if (sk('tr_cool')) { const k = equipped(s, to); if (k && ST.cd[k] > 0) ST.cd[k] *= 0.7; }
    const chime = fx(s, 'swapSp'); if (chime && !sk('tr_charge') && p.t - (ST.chargeAt || -9) > 1) { ST.chargeAt = p.t; C.addSpecial(chime); }
    if (G.stance.onSwap) G.stance.onSwap(p, s, from, to);
  }
  const swapAct = {
    input(p) {
      if (!I.pressed('bow')) return false;
      const s = S();
      if (BUSY.has(p.state) || p.carry) return true;
      if (G.stance.swapBlocked && G.stance.swapBlocked()) { sfx('buzz'); G.fx.float(p.x, p.y - 30, '한 손의 길 — 바꾸지 않는다', '#c8c0d8', { life: 0.6 }); return true; }
      const a = avail(s), now = cur(s);
      if (a.length < 2) { sfx('buzz'); if (!ST.warned) { ST.warned = true; G.ui.toast('아직 바꿀 무기가 없다 — 활이나 마법을 얻으면 [K]로 바꿔 든다', ''); } return true; }
      doSwap(p, s, now, a[(a.indexOf(now) + 1) % a.length]);
      return true;
    },
  };
  /** 필살 버튼: 든 무기의 필살기 (골라 둔 것 → 그 무기 갈래에서 아무거나 → 예전 하나) */
  C.specialFor = function (s) {
    const w = cur(s), SP = D.SPECIALS, by = s.specialBy || {};
    const okSp = (k) => k && SP[k] && s.specials[k] && (SP[k].type || 'sword') === w && G.prog.reqOk(s, SP[k].req);
    if (okSp(by[w])) return by[w];
    if (okSp(s.specialMove)) return s.specialMove;
    const any = Object.keys(s.specials || {}).find(okSp);
    return any || s.specialMove || 'flash';
  };

  /* ───────── 스킬 (무기마다 하나를 골라 스킬 버튼으로) ───────── */
  const ASK = {
    // 검 — 기력
    a_dash: { w: 'sword', name: '돌진 베기', icon: 'a_dash', cost: { st: 22 }, cd: 3.5, desc: '앞으로 네 칸 뛰어들며 지나가는 적을 벤다 (공격력 ×1.6, 뛰는 동안 무적).' },
    a_break: { w: 'sword', name: '방패 깨기', icon: 'a_break', cost: { st: 28 }, cd: 6, desc: '크게 내리찍는다. 막는 적도 뚫고 1.2초 비틀거리게 한다 (×2.2).' },
    a_cyclone: { w: 'sword', name: '회오리 칼날', icon: 'a_cyclone', cost: { st: 32 }, cd: 7, desc: '모으지 않고 바로 넓게 한 바퀴 (×1.4, 둘레 적을 밀어낸다).' },
    a_parry: { w: 'sword', name: '반격 자세', icon: 'a_parry', cost: { st: 18 }, cd: 6, desc: '0.7초 자세를 잡는다. 그동안 맞으면 막아 내고 가장 가까운 적을 크게 되받아친다 (×3).' },
    a_wave: { w: 'sword', name: '대지 가르기', icon: 'a_wave', cost: { st: 30 }, cd: 8, desc: '앞으로 땅을 가르는 충격파가 여섯 칸 나아간다 (×1.5, 모두 꿰뚫음).' },
    // 활 — 화살 · 기력
    a_fan: { w: 'bow', name: '부채 사격', icon: 'a_fan', cost: { ar: 3, st: 10 }, cd: 4, desc: '다섯 갈래로 퍼지는 화살 (한 발마다 ×0.9).' },
    a_leap: { w: 'bow', name: '물러나 쏘기', icon: 'a_leap', cost: { ar: 1, st: 20 }, cd: 5, desc: '뒤로 크게 뛰며(무적) 다 모은 화살 한 발 (×2.2, 꿰뚫음).' },
    a_snare: { w: 'bow', name: '덫 화살', icon: 'a_snare', cost: { ar: 1, st: 10 }, cd: 8, desc: '맞은 자리에 덫이 펼쳐져 둘레 두 칸의 적을 2.5초 묶는다.' },
    a_rain: { w: 'bow', name: '작은 화살비', icon: 'a_rain', cost: { ar: 5, st: 15 }, cd: 9, desc: '앞쪽 네 칸 둘레에 1.5초 동안 화살이 쏟아진다.' },
    a_pierce: { w: 'bow', name: '관통 일격', icon: 'a_pierce', cost: { ar: 2, st: 20 }, cd: 7, desc: '모으지 않고 바로 거대한 관통 화살 (×3, 모두 꿰뚫음).' },
    // 마법 — MP
    a_nova: { w: 'magic', name: '마력 폭발', icon: 'a_nova', cost: { mp: 12 }, cd: 5, desc: '둘레로 빛이 터져 적을 밀어내고 다치게 한다.' },
    a_drain: { w: 'magic', name: '흡수의 고리', icon: 'a_drain', cost: { mp: 18 }, cd: 12, desc: '둘레 네 칸의 적에게서 빛을 빨아들여 맞은 적 하나마다 하트 ¼칸.' },
    a_ward: { w: 'magic', name: '마나 방패', icon: 'a_ward', cost: { mp: 15 }, cd: 14, desc: '6초 동안 받는 피해를 MP로 대신 받는다 (¼칸 = MP 6).' },
    a_slow: { w: 'magic', name: '시간 늦추기', icon: 'a_slow', cost: { mp: 20 }, cd: 16, desc: '둘레 일곱 칸의 적이 4초 동안 절반 빠르기로 움직인다.' },
    a_twin: { w: 'magic', name: '쌍둥이 주문', icon: 'a_twin', cost: { mpX: 1.5 }, cd: 10, desc: '고른 주문을 연달아 두 번 건다 (그 주문 MP의 1.5배).' },
  };
  D.ASKILLS = ASK;
  const FIRST = { sword: 'a_dash', bow: 'a_fan', magic: 'a_nova' };
  function equipped(s, w) { const k = s.wskill && s.wskill[w]; return k && s.askills && s.askills[k] ? k : null; }
  /** 스킬 하나를 익힌다 (처음 익힌 것은 그 무기에 바로 끼운다) */
  function learn(s, id, quiet) {
    s.askills = s.askills || {}; s.wskill = s.wskill || {};
    if (s.askills[id]) return false;
    s.askills[id] = true;
    const w = ASK[id].w; if (!equipped(s, w)) s.wskill[w] = id;
    if (!quiet && G.ui) G.ui.toast('스킬: [y]' + ASK[id].name + '[/] — ' + WNAME[w] + '을 들고 [L]', 'gold');
    return true;
  }
  G.stance = { ASK, WEAPONS, WNAME, WCOL, avail, cur, learn, equipped, ST };
  const cdMul = (s, w) => Math.max(0.3, Math.max(0.4, 1 - fx(s, 'cd') - fx(s, 'cd_' + w)) * (G.stance.cdK ? G.stance.cdK(s, w) : 1));
  const skillMul = (s, w) => 1 + fx(s, 'skill_' + w) + fx(s, 'skill');
  const skillAct = {
    input(p, m) {
      if (!I.pressed('magic')) return false;
      const s = S();
      if (BUSY.has(p.state) || p.carry || p.swapT > 0) return true;
      const w = cur(s), id = equipped(s, w);
      if (!id) { sfx('buzz'); G.fx.float(p.x, p.y - 30, WNAME[w] + ' 스킬 없음', '#c8c0d8'); return true; }
      const A = ASK[id];
      // 등급 요구치 (능력치 · 레벨)
      if (A.req && !G.prog.reqOk(s, A.req)) { sfx('buzz'); G.fx.float(p.x, p.y - 30, '필요: ' + G.prog.reqText(s, A.req).replace(/\[\/?r\]/g, ''), '#ff8a96', { life: 0.8 }); return true; }
      if (ST.cd[id] > 0) { sfx('buzz'); G.fx.float(p.x, p.y - 30, ST.cd[id].toFixed(1) + '초', '#c8c0d8', { life: 0.5 }); return true; }
      const c = A.cost, d = G.st.derive(s);
      const ck = (kind) => (G.stance.costK ? G.stance.costK(s, w, kind) : 1);
      const mp = Math.round((c.mpX ? (s.spell && D.SPELLS[s.spell] ? D.SPELLS[s.spell].mp : 10) * c.mpX : (c.mp || 0)) * d.mpCost * ck('mp'));
      const ar = Math.round((c.ar || 0) * ck('ar'));
      if (c.st && p.stamina < c.st * 0.6) { sfx('buzz'); G.fx.float(p.x, p.y - 30, '기력 부족', '#8ae07a'); return true; }
      if (ar && s.ammo.arrows < ar) { sfx('buzz'); G.fx.float(p.x, p.y - 30, '화살 부족', '#e8e0cc'); return true; }
      if (mp && s.mp < mp) { sfx('buzz'); G.fx.float(p.x, p.y - 30, 'MP 부족', '#8ab8ff'); return true; }
      if (c.st) { p.stamina = Math.max(0, p.stamina - c.st); p.stamDelay = 0.5; }
      if (ar) s.ammo.arrows -= ar;
      if (mp) s.mp -= mp;
      // 숙련: 쓸수록 ★이 오르고 (★마다 피해 +8% · 재사용 대기 -5%)
      const rk = G.stance.rank ? G.stance.rank(s, id) : 1;
      ST.cd[id] = A.cd * cdMul(s, w) * (1 - 0.05 * (rk - 1));
      ST.usedAt[w] = p.t;
      DO[id](p, s, d, m, skillMul(s, w) * (1 + 0.08 * (rk - 1)));
      if (G.stance.used) G.stance.used(s, id);
      return true;
    },
  };
  const near = (x, y, r) => foes().filter((e) => U.dist(x, y, e.x, e.y) < r);
  const hit = (e, amt, info) => C.damage(e, amt, Object.assign({ skill: true }, info));
  const magBase = (s, d) => (4 + s.lv * 0.25) * d.magMul;
  function arrow(p, d, ang, o) {
    const sp = o.sp || 320;
    return C.shoot(Object.assign({ skill: true, kind: 'arrow', x: p.x + Math.cos(ang) * 8, y: p.y - 2 + Math.sin(ang) * 6, ox: p.x, oy: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, dmg: d.bowAtk, src: 'arrow', w: 'bow', pierce: 0, charged: true, el: d.bowEl, r: 3, life: 0.9, owner: 'player' }, o));
  }
  const DO = {
    a_dash(p, s, d, m, k) { p.setState('skill'); p.skill = { id: 'a_dash', t: 0, dur: 0.2, dir: [...p.face], hit: new Set(), k }; p.inv = Math.max(p.inv, 0.25); sfx('swing'); },
    a_break(p, s, d, m, k) { p.setState('skill'); p.skill = { id: 'a_break', t: 0, dur: 0.38, k, done: false }; sfx('draw'); },
    a_cyclone(p, s, d, m, k) {
      p.setState('skill'); p.skill = { id: 'a_cyclone', t: 0, dur: 0.32, k };
      for (const e of near(p.x, p.y - 8, d.reach + 18)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); hit(e, d.atk * 1.4 * k, { src: 'spin', w: 'sword', kx: nx, ky: ny, power: 1.4, el: d.el }); }
      C.cutArc(m, p.x, p.y - 4, 0, d.reach + 10, Math.PI * 2);
      G.fx.ring(p.x, p.y - 6, '#ffffff', d.reach + 14, 0.35, 2); sfx('spin');
    },
    a_parry(p, s, d, m, k) { p.setState('skill'); p.skill = { id: 'a_parry', t: 0, dur: 0.7, k }; p.parryT = 0.7; G.fx.ring(p.x, p.y - 8, '#8ad8ff', 14, 0.3, 1); sfx('draw'); },
    a_wave(p, s, d, m, k) {
      const a = U.angle(p.face[0], p.face[1]);
      C.shoot({ skill: true, kind: 'beam', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, dmg: d.atk * 1.5 * k, src: 'sword', w: 'sword', r: 7, life: 0.42, pierce: 99, trail: '#d8a868', owner: 'player', el: d.el });
      W().shake(3, 0.2); G.fx.dust(p.x, p.y, 10); sfx('rumble');
      p.setState('skill'); p.skill = { id: 'a_wave', t: 0, dur: 0.22, k };
    },
    a_fan(p, s, d, m, k) {
      const a = U.angle(p.face[0], p.face[1]);
      for (const off of [-0.5, -0.25, 0, 0.25, 0.5]) arrow(p, d, a + off, { dmg: d.bowAtk * 0.9 * k, trail: '#e8f0c0' });
      sfx('shootc'); p.setState('skill'); p.skill = { id: 'a_fan', t: 0, dur: 0.18, k };
    },
    a_leap(p, s, d, m, k) { p.setState('skill'); p.skill = { id: 'a_leap', t: 0, dur: 0.3, dir: [-p.face[0], -p.face[1]], k, shot: false }; p.inv = Math.max(p.inv, 0.35); sfx('roll'); },
    a_snare(p, s, d, m, k) {
      const a = U.angle(p.face[0], p.face[1]);
      const sh = arrow(p, d, a, { dmg: d.bowAtk * 1.6 * k, trail: '#a8e070' });
      const snare = (x, y) => { G.fx.ring(x, y - 4, '#a8e070', 30, 0.5, 2); for (const e of near(x, y, 34)) if (!e.boss) { e.stunT = Math.max(e.stunT || 0, 2.5); G.fx.float(e.x, e.y - 24, '묶임', '#a8e070', { life: 0.8 }); } else e.stunT = Math.max(e.stunT || 0, 0.6); };
      if (sh) { sh.onHitFoe = (e) => snare(e.x, e.y); const die0 = sh.die.bind(sh); sh.die = function () { if (!this.snared) { this.snared = true; snare(this.x, this.y + 6); } die0(); }; }
      sfx('shoot'); p.setState('skill'); p.skill = { id: 'a_snare', t: 0, dur: 0.15, k };
    },
    a_rain(p, s, d, m, k) {
      const cx = p.x + p.face[0] * 64, cy = p.y + p.face[1] * 56;
      for (let i = 0; i < 15; i++) C.after(0.1 * i, () => {
        const x = cx + (Math.random() - 0.5) * 56, y = cy + (Math.random() - 0.5) * 40;
        G.fx.part({ x, y, z: 60, vz: -260, g: 0, life: 0.22, col: '#e8f0c0', size: 1, glow: true });
        for (const e of near(cx, cy, 36)) if (Math.random() < 0.6) hit(e, d.bowAtk * 0.7 * k, { src: 'arrow', w: 'bow', kx: 0, ky: 0, power: 0.2 });
      });
      G.fx.ring(cx, cy, '#e8f0c0', 34, 1.4, 1); sfx('shootc'); p.setState('skill'); p.skill = { id: 'a_rain', t: 0, dur: 0.2, k };
    },
    a_pierce(p, s, d, m, k) {
      const a = U.angle(p.face[0], p.face[1]);
      arrow(p, d, a, { dmg: d.bowAtk * 3 * k, pierce: 99, sp: 460, heavy: true, r: 5, trail: '#fff8c0' });
      W().shake(3, 0.2); G.fx.ring(p.x + Math.cos(a) * 12, p.y - 8 + Math.sin(a) * 8, '#fff8c0', 14, 0.3, 2); sfx('shootc');
      p.setState('skill'); p.skill = { id: 'a_pierce', t: 0, dur: 0.22, k };
    },
    a_nova(p, s, d, m, k) {
      const dmg = magBase(s, d) * 1.2 * k;
      for (const e of near(p.x, p.y - 6, 60)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); hit(e, dmg, { src: 'spell', w: 'magic', el: 'light', kx: nx, ky: ny, power: 1.6 }); }
      G.fx.ring(p.x, p.y - 6, '#c8d8ff', 60, 0.4, 3); G.fx.glow(p.x, p.y - 8, '#c8d8ff', 30, 40); sfx('white');
      p.setState('skill'); p.skill = { id: 'a_nova', t: 0, dur: 0.24, k };
    },
    a_drain(p, s, d, m, k) {
      let n = 0;
      for (const e of near(p.x, p.y - 6, 66)) { if (hit(e, magBase(s, d) * 0.8 * k, { src: 'spell', w: 'magic', el: 'dark', kx: 0, ky: 0 })) { n++; G.fx.part({ x: e.x, y: e.y - 10, z: 0, vx: (p.x - e.x) * 2, vy: (p.y - e.y) * 2, g: 0, life: 0.5, col: '#ff8ab0', size: 2, glow: true }); } }
      const dd = G.st.derive(s); s.hp = Math.min(dd.hpMax, s.hp + n); if (n) { sfx('heal'); G.fx.float(p.x, p.y - 30, '+' + n / 4 + '칸', '#ff8ab0'); }
      G.fx.ring(p.x, p.y - 6, '#ff8ab0', 66, 0.45, 2);
      p.setState('skill'); p.skill = { id: 'a_drain', t: 0, dur: 0.28, k };
    },
    a_ward(p, s, d, m, k) { p.wardT = 6; G.fx.ring(p.x, p.y - 8, '#8ab8ff', 18, 0.4, 2); sfx('barrier'); p.setState('skill'); p.skill = { id: 'a_ward', t: 0, dur: 0.18, k }; },
    a_slow(p, s, d, m, k) {
      for (const e of near(p.x, p.y, 112)) e.slowT = Math.max(e.slowT || 0, 4 * k);
      G.fx.ring(p.x, p.y - 6, '#d8c8ff', 112, 0.6, 2); sfx('mirror');
      p.setState('skill'); p.skill = { id: 'a_slow', t: 0, dur: 0.24, k };
    },
    a_twin(p, s, d, m, k) {
      if (!s.spell) return;
      C.castSpell(p, s.spell, d); C.after(0.2, () => C.castSpell(p, s.spell, G.st.derive(S())));
      sfx('cast'); p.setState('skill'); p.skill = { id: 'a_twin', t: 0, dur: 0.32, k };
    },
  };
  // 스킬 동작 (상태 'skill') — 스킬마다 따로 움직이는 것은 UPD[스킬]
  const UPD = {};
  Object.assign(G.stance, { DO, UPD, near, hit, magBase, arrow, skillMul, cdMul, fx });
  C.actions.skill = {
    update(p, dt, m) {
      const K = p.skill; if (!K) { p.setState('idle'); return; }
      K.t += dt;
      const s = S(), d = G.st.derive(s);
      if (K.id === 'a_dash') {
        const r = E.move(m, p, K.dir[0] * 330 * dt, K.dir[1] * 330 * dt);
        if (Math.random() < 0.7 && p.sheet) { const img = p.sheet.get('atk', p.dir, 1); G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.45); }
        for (const e of foes()) { if (K.hit.has(e)) continue; if (U.dist(p.x, p.y - 8, e.x, e.y - (e.h || 16) / 2) < 18 + (e.r || 8)) { K.hit.add(e); hit(e, d.atk * 1.6 * K.k, { src: 'dash', w: 'sword', kx: K.dir[0], ky: K.dir[1], power: 1.4, el: d.el }); } }
        C.cutArc(m, p.x, p.y - 4, Math.atan2(K.dir[1], K.dir[0]), 16, 1.2);
        p.atkFrame = 1;
        if (r.hitX && r.hitY) K.t = K.dur;
      } else if (K.id === 'a_break' && !K.done && K.t > 0.16) {
        K.done = true;
        const a = U.angle(p.face[0], p.face[1]), hx = p.x + Math.cos(a) * 14, hy = p.y - 6 + Math.sin(a) * 12;
        for (const e of near(hx, hy, d.reach + 6)) { hit(e, d.atk * 2.2 * K.k, { src: 'sword', w: 'sword', kx: Math.cos(a), ky: Math.sin(a), power: 2, unblockable: true, stun: 1.2, el: d.el }); if (e.guards) e.guardBroken = 2; }
        W().shake(4, 0.25); W().hitstop(0.06); G.fx.ring(hx, hy, '#ffd8a8', 20, 0.3, 2); G.fx.dust(hx, hy + 4, 8); sfx('impact');
        C.cutArc(m, hx, hy, a, 18, 1.6);
      } else if (K.id === 'a_leap') {
        const k2 = 1 - K.t / K.dur;
        E.move(m, p, K.dir[0] * 260 * k2 * dt, K.dir[1] * 260 * k2 * dt);
        if (!K.shot && K.t > K.dur * 0.6) { K.shot = true; arrow(p, d, U.angle(-K.dir[0], -K.dir[1]), { dmg: d.bowAtk * 2.2 * K.k, pierce: 3, sp: 380, trail: '#fff4c0' }); sfx('shootc'); }
      } else if (K.id === 'a_parry') {
        p.atkFrame = 0; if (Math.floor(K.t * 10) % 2) G.fx.part({ x: p.x + (Math.random() - 0.5) * 12, y: p.y - 12, z: 0, vz: 10, g: 0, life: 0.2, col: '#8ad8ff', size: 1, glow: true });
      } else if (UPD[K.id]) UPD[K.id](p, K, dt, m, s, d);   // skills.js의 스킬 동작
      if (K.t >= K.dur) { p.skill = null; p.parryT = 0; p.setState('idle'); }
    },
  };

  /* ───────── 피해 조정: 무기 바꾸기 재능 · 장비 · 무기 내성 ───────── */
  const wOf = (info) => info.w || SRCW[info.src] || (info.src === 'special' ? (ST.spW || cur(S())) : null);
  C.dmgMod = function (e, info) {
    const w = wOf(info); if (!w) return 1;
    const p = W().player, s = S();
    // 무기 내성: 그 무기로는 튕겨 나간다
    if (e.immune && e.immune === w) {
      if (!e.immuneShown || p.t - e.immuneShown > 0.6) { e.immuneShown = p.t; G.fx.float(e.x, e.y - (e.h || 16) - 8, WNAME[w] + ' 내성 — 바꿔라!', '#c8c0d8', { life: 0.7 }); G.fx.sparks(e.x, e.y - 8, 5, '#d8d8e8', 60); sfx('clank'); }
      return 0;
    }
    let k = 1;
    if (e.weakW && e.weakW === w) k *= 1.5;
    if (!p) return k;
    ST.usedAt[w] = p.t;
    // 바꾼 직후 첫 공격 (첫 수 · 전환 장비)
    if (ST.firstHit && p.t - ST.swapAt < 2) {
      ST.firstHit = false;
      const b = (sk('tr_open') ? 0.35 : 0) + fx(s, 'swapHit');
      if (b > 0) { k *= 1 + b; G.fx.float(e.x, e.y - (e.h || 16) - 14, '전환!', WCOL[w], { life: 0.5 }); }
    }
    // 연계 표식: 다른 무기로 3초 안에 이어 치면
    if (sk('tr_mark') && e.lastW && e.lastW !== w && p.t - (e.lastWAt || -9) < 3) { k *= 1.3; e.stunT = Math.max(e.stunT || 0, 0.5); }
    e.lastW = w; e.lastWAt = p.t;
    // 삼위: 6초 안에 세 무기로 모두 맞히면 8초 동안 +25%
    const used = WEAPONS.filter((x) => p.t - ST.usedAt[x] < 6).length;
    if (sk('tr_trinity') && used >= 3 && ST.trinityT <= 0) { ST.trinityT = 8; G.ui.toast('삼위일체 — 8초 동안 피해 +25%', 'gold'); G.fx.ring(p.x, p.y - 8, '#ffffff', 26, 0.5, 2); }
    if (ST.trinityT > 0) k *= 1.25;
    // 한 우물: 10초 넘게 같은 무기만 쓰면 +25%
    if (sk('tr_focus') && ST.stayT >= 10) k *= 1.25;
    // 만능: 최근 8초에 쓴 무기 가짓수마다 +12%
    if (sk('tr_master')) k *= 1 + 0.12 * WEAPONS.filter((x) => p.t - ST.usedAt[x] < 8).length;
    // 장비: 무기 갈래 피해
    k *= 1 + fx(s, 'dmg_' + w) + (ST.trinityT > 0 ? fx(s, 'tri') : 0);
    return k;
  };
  C.hurtMod = function (p, q) {
    const s = S();
    if (p.parryT > 0) {
      p.parryT = 0;
      const t = near(p.x, p.y, 70).sort((a, b) => U.dist(p.x, p.y, a.x, a.y) - U.dist(p.x, p.y, b.x, b.y))[0];
      const d = G.st.derive(s);
      if (t) { const [nx, ny] = U.norm(t.x - p.x, t.y - p.y); hit(t, d.atk * 3 * skillMul(s, 'sword'), { src: 'sword', w: 'sword', kx: nx, ky: ny, power: 2, unblockable: true, stun: 1 }); }
      G.fx.float(p.x, p.y - 30, '반격!', '#8ad8ff', { big: true, life: 0.9 }); G.fx.ring(p.x, p.y - 10, '#8ad8ff', 26, 0.4, 2); W().slowmo(0.4, 0.3); sfx('perfect');
      C.addSpecial(10); p.inv = Math.max(p.inv, 0.4);
      return false;
    }
    if (p.wardT > 0) {
      const need = q * 6;
      if (s.mp >= need) { s.mp -= need; G.fx.ring(p.x, p.y - 8, '#8ab8ff', 14, 0.25, 1); sfx('clank'); p.inv = Math.max(p.inv, 0.3); return false; }
      const left = q - Math.floor(s.mp / 6); s.mp = 0; p.wardT = 0; return Math.max(1, left);
    }
    return true;
  };
  // 시간 늦추기: 느려진 적은 시간을 반만 쓴다
  const Foe = G.foes && G.foes.Foe;
  if (Foe) { const up0 = Foe.prototype.update; Foe.prototype.update = function (dt, Wd) { if (this.slowT > 0) { this.slowT -= dt; dt *= 0.5; if (Math.random() < dt * 6) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y - 14, z: 0, vz: 6, g: 0, life: 0.4, col: '#d8c8ff', size: 1 }); } if (this.guardBroken > 0) this.guardBroken -= dt; return up0.call(this, dt, Wd); }; }

  /* ───────── 매 프레임 ───────── */
  const up0 = C.update;
  C.update = function (dt) {
    const r = up0.apply(this, arguments);
    const p = W().player, s = S();
    if (!p || !s) return r;
    if (p.swapT > 0) p.swapT -= dt;
    if (p.wardT > 0) { p.wardT -= dt; if (Math.random() < dt * 8) G.fx.part({ x: p.x + (Math.random() - 0.5) * 14, y: p.y - 10 + (Math.random() - 0.5) * 10, z: 0, vz: 8, g: 0, life: 0.3, col: '#8ab8ff', size: 1, glow: true }); }
    if (ST.trinityT > 0) ST.trinityT -= dt;
    for (const k in ST.cd) if (ST.cd[k] > 0) ST.cd[k] -= dt;
    const w = cur(s);
    if (ST.lastW === w) ST.stayT += dt; else { ST.lastW = w; ST.stayT = 0; }
    // 처음 얻은 무기에는 기본 스킬 하나
    s.askills = s.askills || {}; s.wskill = s.wskill || {};
    if (s.equip.sword && !s.askills.a_dash) learn(s, 'a_dash', !s.flags.c1_trained);
    if (s.tools.bow && !s.askills.a_fan) learn(s, 'a_fan');
    if (s.spell && !s.askills.a_nova) learn(s, 'a_nova');
    if (s.askills.a_dash && s.flags.c1_trained && !s.flags.skillTold && !G.script.running) { s.flags.skillTold = true; G.ui.toast('스킬 [L]: 돌진 베기 — 기력을 써서 앞으로 뛰어들며 벤다', 'white'); }
    if (s.tools.bow && !s.flags.swapTold && !G.script.running) { s.flags.swapTold = true; G.ui.toast('[K]로 무기를 바꿔 든다 — 지금 든 무기로만 공격한다 (검 → 활 → 마법)', 'white'); }
    return r;
  };
  // 필살기가 어느 무기의 것인지 (피해 갈래 판정)
  if (G.specials && G.specials.start) { const st0 = G.specials.start; G.specials.start = function (p, id) { ST.spW = (D.SPECIALS[id] && D.SPECIALS[id].type) || 'sword'; return st0.apply(this, arguments); }; }

  // 버튼 자리: K = 바꾸기, L = 스킬 (활 · 마법 상태의 갱신은 원래 것을 그대로 쓴다)
  const bow0 = C.actions.bow, magic0 = C.actions.magic;
  swapAct.update = bow0 && bow0.update; skillAct.update = magic0 && magic0.update;
  C.actions.bow = swapAct;
  C.actions.magic = skillAct;

  /* ───────── 아이콘 ───────── */
  const H = G.hud, X = G.gfx, ic0 = H.icon, ICO = {};
  const GLY = {
    sword: [['          ww', '         wsw', '        wsw ', '       wsw  ', '      wsw   ', '  b  wsw    ', '   bwsw     ', '   bbw      ', '  bbbb      ', ' bb  b      '], { w: '#e8eef8', s: '#a8b8c8', b: '#a86a3a' }],
    magic: [['     y      ', '    yWy     ', '   y   y    ', '  yW   Wy   ', '   y   y    ', '    yWy     ', '     y      ', '     l      ', '     l      ', '     l      '], { y: '#a8c8ff', W: '#ffffff', l: '#8a5a30' }],
    swap: [['   yyyyy    ', '  y     y   ', ' y       y  ', 'yyy     y  ', ' y       y  ', '         y  ', '  y     yyy ', '  y       y ', '   y     y  ', '    yyyyy   '], { y: '#f0cc6e' }],
    a_dash: [['            ', ' ww         ', '  www  wwww ', '   wwwwwwwww', '  www  wwww ', ' ww         '], { w: '#ffd8a8' }],
    a_break: [['    ww      ', '    ww      ', '    ww      ', '  wwwwww    ', '    ww      ', '    ww      ', ' r  ww  r   ', 'rrr rr rrr  '], { w: '#e8eef8', r: '#ff8a5a' }],
    a_cyclone: [['   wwwww    ', '  w     w   ', ' w  www  w  ', ' w w   w w  ', ' w  ww  w   ', '  w     w   ', '   wwwww    '], { w: '#ffffff' }],
    a_parry: [['  bbbbbbb   ', '  bWWWWWb   ', '  bWWWWWb   ', '  bWWWWWb   ', '   bWWWb    ', '    bWb     ', '     b      '], { b: '#8ad8ff', W: '#e8f8ff' }],
    a_wave: [['            ', '        w   ', '      www   ', '    wwwww   ', '  wwwwwww   ', 'ddddddddddd '], { w: '#d8a868', d: '#8a6a3a' }],
    a_fan: [['w       w   ', ' w     w    ', '  w   w     ', 'wwwww wwww  ', '  w   w     ', ' w     w    ', 'w       w   '], { w: '#e8f0c0' }],
    a_leap: [['   aaaaaaA  ', '            ', '  ll        ', ' l  l       ', 'l    l      '], { a: '#c8b890', A: '#fff', l: '#8ad8ff' }],
    a_snare: [[' g   g   g  ', '  g  g  g   ', '   ggggg    ', ' ggg   ggg  ', '   ggggg    ', '  g  g  g   ', ' g   g   g  '], { g: '#a8e070' }],
    a_rain: [[' a  a  a  a ', ' a  a  a  a ', '  a  a  a   ', '  a  a  a   ', '            ', 'gggggggggg  '], { a: '#e8f0c0', g: '#6a8a4a' }],
    a_pierce: [['            ', 'yyyyyyyyyyW ', 'YYYYYYYYYYWW', 'yyyyyyyyyyW '], { y: '#fff8c0', Y: '#ffe066', W: '#ffffff' }],
    a_nova: [['  w  w  w   ', '   w w w    ', '    www     ', 'wwwwWWWwwww ', '    www     ', '   w w w    ', '  w  w  w   '], { w: '#c8d8ff', W: '#ffffff' }],
    a_drain: [['   rrrrr    ', '  r     r   ', ' r  ppp  r  ', ' r  pPp  r  ', ' r  ppp  r  ', '  r     r   ', '   rrrrr    '], { r: '#ff8ab0', p: '#c84a7a', P: '#ffffff' }],
    a_ward: [['   bbbbb    ', '  bBBBBBb   ', ' bBBBBBBBb  ', ' bBBBBBBBb  ', '  bBBBBBb   ', '   bBBBb    ', '    bbb     '], { b: '#8ab8ff', B: '#c8e0ff' }],
    a_slow: [['  wwwwwww   ', ' w   w   w  ', 'w    w    w ', 'w    www  w ', 'w         w ', ' w       w  ', '  wwwwwww   '], { w: '#d8c8ff' }],
    a_twin: [['  y     y   ', ' yWy   yWy  ', '  y     y   ', '  l     l   ', '  l     l   '], { y: '#a8c8ff', W: '#ffffff', l: '#8a5a30' }],
  };
  G.stance.GLY = GLY;
  H.icon = function (id) {
    if (ICO[id]) return ICO[id];
    const g2 = GLY[id]; if (!g2) return ic0(id);
    const b = X.brush(12, 12); b.stamp(0, 0, g2[0], g2[1]);
    ICO[id] = X.outline(b.put(), '#0b0914');
    return ICO[id];
  };
  const wIcon = (w, s) => (w === 'bow' ? H.icon('bow') : w === 'magic' ? (s.spell && D.SPELLS[s.spell] ? H.icon(D.SPELLS[s.spell].icon || 'magic') : H.icon('magic')) : H.icon('sword'));

  /* ───────── 화면: 든 무기 · 바꾸기 · 스킬 · 도구 칸 ───────── */
  const draw0 = H.draw;
  H.draw = function (g, w, h) {
    const r = draw0.apply(this, arguments);
    const s = S(), p = W().player; if (!s || !p || !G.input || I.touchMode) return r;
    const X2 = G.gfx, a = avail(s), wc = cur(s), nx = a.length > 1 ? a[(a.indexOf(wc) + 1) % a.length] : null;
    const id = equipped(s, wc), A = id ? ASK[id] : null;
    // 원래의 K · L 칸 자리를 덮어 그린다: [J 든 무기] [K 바꾸기→다음] [L 스킬] (I 도구는 그대로)
    const sy = h - 26, base = w - 6 - 3 * 24;
    const box = (x, on, col) => { g.fillStyle = 'rgba(11,9,20,0.92)'; g.fillRect(x, sy, 21, 21); g.strokeStyle = col || (on ? 'rgba(240,204,110,0.75)' : 'rgba(157,147,182,0.25)'); g.lineWidth = 1; g.strokeRect(x + 0.5, sy + 0.5, 20, 20); };
    const key = (k, x) => { g.fillStyle = '#f0cc6e'; g.fillRect(x + 1, sy - 7, 7, 7); g.fillStyle = '#0b0914'; g.font = "8px 'Galmuri11', monospace"; g.fillText(k, x + 2, sy - 1); };
    // J: 든 무기 (왼쪽에 하나 더)
    const jx = base - 24;
    box(jx, true); g.drawImage(wIcon(wc, s), jx + 3, sy + 3); key('J', jx);
    if (wc === 'bow') X2.digits(g, s.ammo.arrows, jx + 20 - X2.digitsWidth(String(s.ammo.arrows)), sy + 15, s.ammo.arrows > 0 ? '#ffffff' : '#ff6a7a');
    if (p.swapT > 0) { g.fillStyle = 'rgba(240,204,110,0.35)'; g.fillRect(jx + 1, sy + 1, 19, 19); }
    // K: 바꾸기 (다음 무기)
    box(base, false);
    if (nx) { g.globalAlpha = 0.85; g.drawImage(wIcon(nx, s), base + 3, sy + 3); g.globalAlpha = 1; g.drawImage(H.icon('swap'), base + 9, sy + 9); }
    key('K', base);
    // L: 스킬 (재사용 대기)
    const lx = base + 24;
    const GR = A && G.prog.GRADES[A.grade || 1];
    box(lx, !!A, A ? (A.req && !G.prog.reqOk(s, A.req) ? '#ff6a7a' : GR.col) : null);
    if (A) {
      g.drawImage(H.icon(A.icon), lx + 3, sy + 3);
      // 숙련 ★: 아래쪽 점
      const rk = G.stance.rank ? G.stance.rank(s, id) : 1;
      for (let i = 0; i < rk; i++) { g.fillStyle = '#ffe066'; g.fillRect(lx + 3 + i * 3, sy + 18, 2, 2); }
      const cdl = ST.cd[id] || 0;
      if (cdl > 0) { const k = Math.min(1, cdl / (A.cd || 1)); g.fillStyle = 'rgba(0,0,20,0.6)'; g.fillRect(lx + 1, sy + 1 + Math.round(19 * (1 - k)), 19, Math.round(19 * k)); X2.digits(g, Math.ceil(cdl), lx + 20 - X2.digitsWidth(String(Math.ceil(cdl))), sy + 15, '#ffffff'); }
    }
    key('L', lx);
    // 무기 이름 · 스킬 이름 (작게)
    g.font = "8px 'Galmuri11', monospace"; g.textAlign = 'right';
    const lab = WNAME[wc] + (A ? ' · ' + A.name : '');
    g.fillStyle = 'rgba(11,9,20,0.7)'; const tw = g.measureText(lab).width; g.fillRect(jx - 6 - tw, sy + 6, tw + 4, 10);
    g.fillStyle = WCOL[wc]; g.fillText(lab, jx - 4, sy + 14); g.textAlign = 'left';
    return r;
  };
  // 휴대폰 버튼: 공격 → 든 무기 (화살 수), 바꾸기 → 다음 무기, 스킬 → 낀 스킬 이름 · 남은 재사용 대기 · 비용 부족이면 흐리게
  H.weaponButtons = function (set) {
    const s = S(); if (!s) return;
    const a = avail(s), wc = cur(s), nx = a.length > 1 ? a[(a.indexOf(wc) + 1) % a.length] : null, id = equipped(s, wc), cdl = id ? Math.ceil(ST.cd[id] || 0) : 0;
    set('attack', WNAME[wc] + (wc === 'bow' ? ' ' + s.ammo.arrows : wc === 'magic' && s.spell && D.SPELLS[s.spell] ? ' ' + D.SPELLS[s.spell].name : ''), wc === 'bow' && s.ammo.arrows <= 0, false, { sword: '⚔', bow: '➶', magic: '✦' }[wc]);
    set('bow', nx ? '→' + WNAME[nx] : '바꾸기', !nx || (G.stance.swapBlocked && G.stance.swapBlocked()), false, '⇄');
    let short = false;
    if (id && !cdl) { const c = ASK[id].cost || {}, p = W().player; short = (c.st && p && p.stamina < c.st * 0.6) || (c.ar && s.ammo.arrows < c.ar) || (c.mp && s.mp < c.mp); }
    set('magic', id ? (cdl > 0 ? cdl + '초' : ASK[id].name) : '스킬 없음', !id || cdl > 0 || short, false, '✸');
  };

  /* ───────── 기록: 예전 기록에도 새 칸 ───────── */
  const mig0 = G.prog.migrate;
  G.prog.migrate = function (s) { s = mig0.apply(this, arguments); if (!s.weapon) s.weapon = 'sword'; s.askills = s.askills || {}; s.wskill = s.wskill || {}; s.specialBy = s.specialBy || {}; return s; };
  const fresh0 = G.st.fresh;
  G.st.fresh = function () { const s = fresh0.apply(this, arguments); s.weapon = 'sword'; s.askills = {}; s.wskill = {}; s.specialBy = {}; return s; };
})();
