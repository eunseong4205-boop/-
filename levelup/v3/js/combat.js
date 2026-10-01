/* 전투: 검(3연격 · 모으기 · 회전 베기) · 활(조준 · 강사) · 마법 다섯 · 도구(폭탄 · 갈고리 · 등불 · 들기/던지기) · 필살기(빛의 일섬)
   피해 계산 · 넉백 · 경직 · 속성 · 완벽 회피 · 방패 막기 · 투사체 · 떨어진 것(빛 알갱이 · 골드 · 하트) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs, I = G.input, E = G.ent, X = G.gfx;
  const TS = TL.TS;
  const W = () => G.world;
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const ANG = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

  const C = {};
  const foes = () => W().ents.filter((e) => e.foe && !e.dead && !e.dormant);

  /* ───────── 피해 ───────── */
  const dmgOf = (a) => Math.min(1, a / 8);
  /** 적에게 피해. info: { src, kx, ky, el, crit, stun, power, pierce } */
  function damage(e, amt, info) {
    info = info || {};
    if (!e || e.dead || e.dying || (e.inv > 0 && !info.skill)) return false;   // 스킬 타격은 맞은 직후 무적을 무시한다 (여러 발 · 여러 번 맞히는 스킬)
    // 막기 (방패 든 적: 정면)
    if (e.guards && e.guards(info) && !info.unblockable) {
      sfx('clank'); G.fx.sparks(e.x, e.y - 8, 6, '#ffffff', 80);
      if (info.src === 'sword') { const p = W().player; const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); p.kx = nx * 140; p.ky = ny * 140; W().hitstop(0.05); }
      e.onBlocked && e.onBlocked(info);
      return false;
    }
    const d = G.st.derive(S());
    let mult = 1;
    if (C.dmgMod) { const k = C.dmgMod(e, info, amt); if (k === 0) return false; mult *= k; }
    if (info.el && e.weak && e.weak.includes(info.el)) mult *= 2;
    if (info.el && e.resist && e.resist.includes(info.el)) mult *= 0.35;
    if (e.stunT > 0) mult *= 1.5;
    const sk = S().skills;
    const melee = info.src === 'sword' || info.src === 'spin' || info.src === 'special' || info.src === 'dash';
    let crit = info.crit || Math.random() < d.crit + (info.src === 'arrow' ? d.bowCrit : 0);
    if (e.markUntil && W().t < e.markUntil) mult *= 1.25;                       // 표식
    if (info.src === 'spell' && d.elBoost && d.elBoost[info.el]) mult *= d.elBoost[info.el];   // 마도구의 원소 강화
    if (!crit && sk.sw_execute && melee && e.hp <= e.maxHp * 0.25) crit = true;
    if (crit) mult *= 1.6;
    if (info.src === 'arrow' && sk.bw_snipe && info.travel) mult *= 1 + Math.min(0.6, info.travel / 260);
    if (info.src === 'spell' && sk.mg_over && S().mp >= d.mpMax * 0.8) mult *= 1.8;
    const dmg = Math.max(1, Math.round(amt * mult * 10) / 10);
    e.hp -= dmg;
    e.flash = 0.12; if (!info.skill) e.inv = info.src === 'spin' ? 0.12 : 0.14;
    e.hurtT = 0.2;
    const kb = (info.power || 1) * 160 / (e.weight || 1) * (melee ? d.heavy : 1);
    if (info.kx != null) { e.kx = info.kx * kb; e.ky = info.ky * kb; }
    if (info.stun) e.stunT = Math.max(e.stunT || 0, info.stun);
    const deep = sk.mg_deep ? 2 : 1;
    if (info.el === 'fire' && !(e.resist || []).includes('fire')) e.burnT = 3 * deep;
    if (info.el === 'ice' && !(e.resist || []).includes('ice')) e.freezeT = Math.max(e.freezeT || 0, (info.src === 'spell' ? 2.5 : 0.8) * deep);
    if (info.el === 'poison') e.poisonT = Math.max(e.poisonT || 0, 4 * deep);
    if (info.src === 'arrow' && info.charged && sk.bw_mark) e.markUntil = W().t + 5;
    if (info.el === 'bolt' && (melee || info.src === 'arrow') && !info.chain) {
      // 번개 검: 가까운 다른 적에게 옮는다
      const n2 = foes().filter((f) => f !== e && U.dist(f.x, f.y, e.x, e.y) < 56).sort((a2, b2) => U.dist(a2.x, a2.y, e.x, e.y) - U.dist(b2.x, b2.y, e.x, e.y))[0];
      if (n2) { C.bolts.push({ x0: e.x, y0: e.y - 8, x1: n2.x, y1: n2.y - 8, t: 0 }); setTimeout(() => damage(n2, amt * 0.45, { src: 'spell', el: 'bolt', stun: 0.5 * deep, chain: true, kx: 0, ky: 0 }), 60); }
    }
    if (melee && d.drain && !info.chain) { const s2 = S(); s2.hp = Math.min(d.hpMax, s2.hp + (Math.random() < d.drain * 4 * dmgOf(amt) ? 1 : 0)); }
    G.fx.float(e.x + (Math.random() - 0.5) * 8, e.y - (e.h || 16) - 2, Math.round(dmg * 10) / 10 + '', crit ? '#ffe066' : mult > 1 ? '#ffb070' : '#ffffff', { life: 0.7 });
    // 타격감: 등급이 높을수록 불꽃이 크고 빛이 번진다 · 무거운 검은 멈춤이 길다
    const gr = melee ? d.grade : info.src === 'arrow' ? d.bowGrade : 1;
    const GC = G.prog ? G.prog.GRADES[gr] : null;
    const scol = crit ? '#ffe066' : info.el === 'fire' ? '#ff9a4a' : info.el === 'ice' ? '#bfe8ff' : info.el === 'poison' ? '#9ae86a' : info.el === 'bolt' ? '#fff08a' : info.el === 'dark' ? '#c49bff' : gr >= 3 && GC ? GC.glow : '#ffffff';
    const hy = e.y - (e.h || 16) / 2;
    G.fx.sparks(e.x, hy, (crit ? 10 : 5) + gr, scol, 60 + gr * 12);
    if (melee || info.src === 'arrow') G.fx.slash && G.fx.slash(e.x, hy, info.kx != null ? Math.atan2(info.ky || 0, info.kx || 1) : 0, scol, 8 + gr * 2 + (crit ? 5 : 0));
    if (gr >= 4 || crit) G.fx.ring(e.x, hy, scol, crit ? 16 : 11, 0.22, 1);
    if (gr >= 5 && Math.random() < 0.5) G.fx.glow(e.x, hy, GC.glow, 10, 18);
    sfx(crit ? 'crit' : 'hit');
    const heavyHit = melee && d.heavy > 1.25;
    W().hitstop((crit ? 0.075 : 0.045) + (heavyHit ? 0.025 : 0) + (info.src === 'special' ? 0.02 : 0));
    if (crit || heavyHit) W().shake(crit ? 2.2 : 1.5, 0.12);
    e.squash = 0.18;
    addSpecial((info.src === 'spell' ? (sk.mg_master ? 8 : 4) : 7) * (crit ? 1.5 : 1));
    if (C.onDamage) C.onDamage(e, info, dmg, crit);
    if (e.onHurt) e.onHurt(dmg, info);
    if (e.hp <= 0) kill(e, info);
    return true;
  }
  function kill(e, info) {
    if (e.preKill && e.preKill(info || {})) return;
    e.hp = 0; e.dead = true;
    sfx(e.boss ? 'bossdie' : 'defeat');
    // 쓰러지는 순간 하얀 실루엣이 번쩍 — 한 박자 멈춤
    try { const im = e.look && e.sheet ? e.sheet.get('hurt', e.dir || 'down', 0) : e.img ? e.img() : null; if (im) G.fx.afterimage(X.silhouette(im, '#ffffff'), e.x - im.width / 2, e.y - im.height - (e.fly ? 6 : 0), 0.95); } catch (_) { /* 무시 */ }
    W().hitstop(e.boss ? 0.2 : 0.06);
    G.fx.shards(e.x, e.y - 8, e.boss ? 40 : 12, e.col || '#ffffff');
    G.fx.ring(e.x, e.y, '#ffffff', 18, 0.35);
    if (e.onDie) e.onDie(info);
    {
      const s = S(), d = G.st.derive(s), p = W().player, src = (info || {}).src;
      if (p && s.skills.sw_frenzy && (src === 'sword' || src === 'spin' || src === 'special' || src === 'dash')) { p.frenzyT = 8; }
      if (d.vamp && !e.boss) { s.hp = Math.min(d.hpMax, s.hp + 1); }
      if (s.skills.mg_siphon && src === 'spell') s.mp = Math.min(d.mpMax, s.mp + 8);
    }
    drops(e);
    if (G.story && G.story.onKill) G.story.onKill(e);
  }
  /** 떨어뜨리기: 빛 알갱이(경험) · 골드 · 하트 · MP · 화살 · 재료 */
  function drops(e) {
    const s = S();
    const exp = e.exp || 1;
    for (let i = 0; i < Math.min(12, Math.ceil(exp / 3)); i++) spawnPickup(e.x, e.y, 'exp', Math.ceil(exp / Math.min(12, Math.ceil(exp / 3))));
    const r = Math.random();
    const d = G.st.derive(s);
    const hk = G.prog ? G.prog.diff().heal : 1;
    if (r < 0.28) spawnPickup(e.x, e.y, 'gold', Math.round((e.gold || 3) * d.goldMul));
    else if (r < 0.28 + 0.14 * hk && s.hp < d.hpMax) spawnPickup(e.x, e.y, 'heart', 4);
    else if (r < 0.52 && s.spells && Object.keys(s.spells).length) spawnPickup(e.x, e.y, 'mp', 12);
    else if (r < 0.6 && s.tools.bow) spawnPickup(e.x, e.y, 'arrow', 5);
    else if (r < 0.64 && s.tools.bomb) spawnPickup(e.x, e.y, 'bomb', 2);
    if (e.mat && Math.random() < (e.matRate || 0.25)) spawnPickup(e.x, e.y, 'item', 1, e.mat);
    if (C.extraDrop) C.extraDrop(e);
  }

  /** 주인공이 맞았을 때. q: 하트 ¼칸 단위 */
  function hurtPlayer(p, q, src, opt) {
    opt = opt || {};
    if (p.dead || p.state === 'dead') return false;
    // 연출(레터박스) 중에는 다치지 않는다
    if (G.cine && G.cine.active && G.cine.active() && !opt.force) return false;
    // 스킬이 대신 받는다 (반격 자세 · 마나 방패)
    if (C.hurtMod && !opt.force && !(p.inv > 0)) { const r = C.hurtMod(p, q, src, opt); if (r === false) return false; if (typeof r === 'number') q = r; }
    if (p.inv > 0 && !opt.force) {
      // 구르기 무적 중 막 맞을 뻔했다 → 완벽 회피
      if (p.state === 'roll' && p.perfectWin > 0 && !p.perfectDone) {
        p.perfectDone = true;
        W().slowmo(0.3, 0.45);
        addSpecial(25);
        G.fx.float(p.x, p.y - 30, '완벽 회피!', '#8ad8ff', { big: true, life: 1 });
        G.fx.ring(p.x, p.y - 10, '#8ad8ff', 26, 0.5, 2);
        sfx('perfect');
        p.counterT = 0.9;
      }
      return false;
    }
    // 빛의 방벽: 남은 막음 수만큼 받아낸다
    if (p.barrier > 0 && !opt.force) {
      p.barrier--; p.inv = 0.5; sfx('clank'); G.fx.ring(p.x, p.y - 10, '#fff4c8', 18, 0.3, 2); G.fx.sparks(p.x, p.y - 10, 8, '#fff4c8', 80);
      if (p.barrier <= 0) { G.fx.float(p.x, p.y - 30, '방벽이 깨졌다', '#fff4c8'); p.barrierT = 0; }
      return false;
    }
    const s = S(), d = G.st.derive(s);
    // 튕겨내기: 베기를 막 시작한 순간 맞으면 쳐낸다
    if (s.skills.sw_parry && p.state === 'attack' && p.swing && p.swing.t < 0.13 && src && !opt.force) {
      sfx('clank'); W().hitstop(0.09); W().shake(2, 0.1);
      G.fx.sparks(p.x, p.y - 12, 12, '#fff2a8', 110); G.fx.ring(p.x, p.y - 10, '#fff2a8', 18, 0.25, 2);
      G.fx.float(p.x, p.y - 30, '튕겨내기!', '#fff2a8', { big: true, life: 0.8 });
      if (src.foe) { src.stunT = Math.max(src.stunT || 0, src.boss ? 0.6 : 1.4); const [nx, ny] = U.norm(src.x - p.x, src.y - p.y); src.kx = nx * 200; src.ky = ny * 200; }
      else if (src.owner && src.owner !== 'player') src.dead = true;
      addSpecial(15); p.critNext = true;
      return false;
    }
    // 방패: 공격하지 않을 때 정면 투사체
    if (src && src.blockable && s.equip.shield && !p.busy && p.state !== 'roll') {
      const a = U.angle(src.x - p.x, src.y - p.y), f = faceAng(p);
      const lv = G.data.ITEMS[s.equip.shield].lv || 1;
      if (Math.abs(U.angDiff(a, f)) < 1.0 && (src.blockLv || 1) <= lv) {
        sfx('shield'); G.fx.sparks(p.x + Math.cos(f) * 8, p.y - 10 + Math.sin(f) * 6, 6, '#ffffff', 70);
        if (s.skills.sw_guard) { addSpecial(15); p.critNext = true; p.counterT = 0.9; }      // 철벽 자세
        if (src.reflectable && lv >= 3) { src.vx *= -1.3; src.vy *= -1.3; src.owner = 'player'; src.reflected = true; src.hit = new Set(); return false; }
        src.dead = true; return false;
      }
    }
    let dq = Math.max(1, Math.round(q * d.def * (G.prog ? G.prog.diff().hurt : 1)));
    if (s.skills.sv_second && s.hp >= 2 && dq >= s.hp) dq = s.hp - 1;
    if (s.duel && dq >= s.hp) dq = Math.max(0, s.hp - 1);
    s.hp -= dq;
    p.inv = opt.inv || 0.9; p.flash = 0.2; p.flashCol = '#ff4a5e';
    if (!opt.noKnock && src) { const [nx, ny] = U.norm(p.x - src.x, p.y - src.y); p.kx = nx * 220; p.ky = ny * 220; }
    if (p.state !== 'roll' && p.state !== 'fall') { if (p.carry) dropCarry(p); p.setState('hurt'); }
    sfx('hurt'); W().shake(3, 0.2); W().hitstop(0.06);
    addSpecial(6);
    if (G.hud) G.hud.hurt();
    if (s.hp <= 0) {
      s.hp = 0;
      if (G.st.take(s, 'fairy')) { s.hp = Math.min(d.hpMax, 20); G.fx.glow(p.x, p.y - 10, '#ffb0e0', 30); sfx('fairy'); G.ui.toast('병 속 요정이 날아올랐다!', 'good'); return true; }
      // 불사조의 깃털 · 불굴: 쉬기 전까지 한 번
      if ((d.phoenix || s.skills.sv_master) && !s.flags.revived) {
        s.flags.revived = true; s.hp = Math.min(d.hpMax, 8); p.inv = 2; p.setState('idle');
        G.fx.glow(p.x, p.y - 10, d.phoenix ? '#ff9a4a' : '#fff2a8', 34, 60); G.fx.ring(p.x, p.y - 8, d.phoenix ? '#ff9a4a' : '#fff2a8', 40, 0.6, 3); W().slowmo(0.3, 0.6); sfx('fairy');
        G.ui.toast(d.phoenix ? '불사조의 깃털이 타올랐다!' : '쓰러지지 않는다 — 불굴!', 'gold'); return true;
      }
      s.deaths = (s.deaths || 0) + 1;
      p.setState('dead');
      if (G.game.onDeath) G.game.onDeath(p);
    }
    return true;
  }

  function addSpecial(n) {
    const s = S();
    const before = s.special;
    s.special = Math.min(100, s.special + n * G.st.derive(s).specialMul);
    if (before < 100 && s.special >= 100) { sfx('ready'); if (G.hud) G.hud.specialReady(); }
  }

  /* ───────── 사물 베기 · 태우기 · 부수기 ───────── */
  function cutAt(m, tx, ty, how) {
    const o = m.O(tx, ty);
    if (!o) return false;
    const D = OB.DEF[o];
    if (!D) return false;
    const ok = (how === 'cut' && D.cut) || (how === 'burn' && D.burn) || (how === 'bomb' && (D.bomb || D.cut)) || (how === 'melt' && D.melt);
    if (!ok) return false;
    m.setO(tx, ty, how === 'burn' && D.big ? OB.O.STUMP : 0);
    const x = tx * TS + 8, y = ty * TS + 12;
    const reg = m.regName(tx, ty);
    if (how === 'burn') { G.fx.sparks(x, y - 6, 12, '#ff9a3a', 60); G.fx.glow(x, y, '#ffb84a', 8); sfx('burn'); }
    else if (how === 'melt') { G.fx.splash(x, y); sfx('melt'); }
    else if (D.big || how === 'bomb') { G.fx.shards(x, y - 6, 10, TL.PAL[reg] ? TL.PAL[reg].c[1] : '#888'); sfx('rock'); }
    else { G.fx.leaves(x, y - 4, 7, TL.PAL[reg] ? TL.PAL[reg].g[1] : '#6ac85a'); sfx('cut'); }
    // 풀숲 · 덤불에서 가끔 나오는 것
    if (D.drop === 'grass' || D.drop === 'bush') {
      const r = Math.random();
      if (r < 0.1) spawnPickup(x, y, 'heart', 4); else if (r < 0.22) spawnPickup(x, y, 'gold', 1); else if (r < 0.28) spawnPickup(x, y, 'exp', 1);
      else if (r < 0.32 && S().tools.bow) spawnPickup(x, y, 'arrow', 3);
    }
    if (G.world.onCut) G.world.onCut(tx, ty, o, how);
    return true;
  }
  /** 호 모양 범위 안의 칸들을 벤다 */
  function cutArc(m, px, py, ang, reach, spread) {
    for (let r = 6; r <= reach; r += 6) for (let a = -spread; a <= spread; a += 0.35) {
      const x = px + Math.cos(ang + a) * r, y = py + Math.sin(ang + a) * r;
      cutAt(m, Math.floor(x / TS), Math.floor(y / TS), 'cut');
    }
  }

  /* ───────── 투사체 ───────── */
  class Shot extends E.Ent {
    constructor(o) {
      super(Object.assign({ kind: 'shot', bw: 4, bh: 4, solid: false, life: 1.2, dmg: 2, pierce: 0, hit: new Set(), owner: 'player', r: 4, shadow: true, zoff: 10 }, o));
    }
    update(dt, Wd) {
      const m = Wd.map;
      this.t += dt;
      if (this.homing && this.target && !this.target.dead) { const [nx, ny] = U.norm(this.target.x - this.x, this.target.y - 8 - this.y); const sp = U.len(this.vx, this.vy); this.vx = U.lerp(this.vx, nx * sp, dt * this.homing); this.vy = U.lerp(this.vy, ny * sp, dt * this.homing); }
      if (this.accel) { this.vx *= 1 + this.accel * dt; this.vy *= 1 + this.accel * dt; }
      const steps = Math.ceil(U.len(this.vx, this.vy) * dt / 4);
      for (let k = 0; k < steps; k++) {
        this.x += this.vx * dt / steps; this.y += this.vy * dt / steps;
        if (!this.ghost && !m.shotFree(this.x, this.y, this.z)) { this.hitWall(m); return; }
        if (this.checkHits()) return;
      }
      if (this.trail && Math.random() < 0.6) G.fx.part({ x: this.x, y: this.y, z: this.zoff, vz: 0, g: 0, life: 0.25, col: this.trail, size: 1, glow: true });
      if (this.t > this.life) { this.expire(m); }
    }
    checkHits() {
      const Wd = W();
      if (this.owner === 'player') {
        for (const e of foes()) {
          if (this.hit.has(e) || e.fly === 'high') continue;
          if (U.dist(this.x, this.y, e.x, e.y - (e.h || 16) / 2) < (e.r || 8) + this.r) {
            this.hit.add(e);
            const [nx, ny] = U.norm(this.vx, this.vy);
            damage(e, this.reflected ? this.dmg * 2 : this.dmg, { src: this.src || 'shot', w: this.w, skill: this.skill, kx: nx, ky: ny, el: this.el, stun: this.stun, power: this.power || 0.6, refl: this.reflected, travel: this.ox != null ? U.dist(this.ox, this.oy, this.x, this.y) : 0, charged: this.charged, crit: this.crit, shot: this });
            if (this.onHitFoe) this.onHitFoe(e);
            if (this.pierce-- <= 0) { this.die(); return true; }
          }
        }
        // 소품(스위치 · 표적 · 횃불)
        for (const e of Wd.ents) if (e.shotHit && !e.dead && U.dist(this.x, this.y, e.x, e.y - 8) < 10) { if (e.shotHit(this)) { this.die(); return true; } }
      } else {
        const p = Wd.player;
        if (p && !p.dead && U.dist(this.x, this.y, p.x, p.y - 8) < 7 + this.r) {
          const was = p.inv;
          if (hurtPlayer(p, this.dmg, this, {}) && this.onHitPlayer) this.onHitPlayer(p);
          if (!this.dead && !(this.owner === 'player')) { if (was <= 0 || p.state !== 'roll') this.die(); }
          return true;
        }
      }
      return false;
    }
    hitWall(m) {
      const tx = Math.floor(this.x / TS), ty = Math.floor(this.y / TS);
      if (this.el === 'fire') cutAt(m, tx, ty, 'burn');
      if (this.el === 'bomb' || this.explode) { explode(this.x, this.y, this.owner, this.explode || 1); }
      if (this.kind === 'arrow') { G.fx.sparks(this.x, this.y, 3, '#c8b890', 40); sfx('thunk'); }
      else if (this.el === 'fire') { G.fx.sparks(this.x, this.y, 8, '#ff9a3a', 60); }
      else if (this.el === 'ice') { G.fx.shards(this.x, this.y, 5, '#bfe8ff'); }
      this.die();
    }
    expire(m) {
      const tx = Math.floor(this.x / TS), ty = Math.floor(this.y / TS);
      if (this.el === 'ice' && this.owner === 'player' && m.T(tx, ty) === TL.T.WATER || (this.el === 'ice' && m.T(tx, ty) === TL.T.DEEP)) freezeWater(m, tx, ty);
      if (this.el === 'fire') cutAt(m, tx, ty, 'burn');
      if (this.explode) explode(this.x, this.y, this.owner, this.explode);
      this.die();
    }
    die() { this.dead = true; if (this.ret && this.kind === 'arrow' && this.owner === 'player') { const s = S(); s.ammo.arrows = Math.min(s.ammo.arrowsMax, s.ammo.arrows + 1); } if (this.onDie) this.onDie(); }
    drawShadow(g, cx, cy) { if (!this.shadow) return; g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(Math.round(this.x - cx - 2), Math.round(this.y - cy), 4, 2); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - this.zoff);
      const a = Math.atan2(this.vy, this.vx);
      if (this.kind === 'arrow') {
        g.save(); g.translate(x, y); g.rotate(a);
        g.fillStyle = '#6a4424'; g.fillRect(-8, -0.5, 10, 1);
        g.fillStyle = this.el === 'fire' ? '#ffb040' : '#e8e8f0'; g.fillRect(2, -1, 3, 2); g.fillRect(5, -0.5, 1, 1);
        g.fillStyle = '#e8e0cc'; g.fillRect(-9, -1.5, 2, 1); g.fillRect(-9, 0.5, 2, 1);
        if (this.charged) { g.fillStyle = 'rgba(255,240,160,0.6)'; g.fillRect(-10, -2, 16, 4); }
        if (this.heavy) { g.fillStyle = 'rgba(255,248,200,0.8)'; g.fillRect(-16, -3, 26, 6); g.fillStyle = '#ffffff'; g.fillRect(-14, -1, 22, 2); }
        else if (this.grade >= 4) { g.globalAlpha = 0.5; g.fillStyle = this.trail || '#fff'; g.fillRect(-12, -1.5, 18, 3); g.globalAlpha = 1; }
        g.restore();
      } else if (this.kind === 'orb' || this.kind === 'fire' || this.kind === 'ice' || this.kind === 'beam' || this.kind === 'dark') {
        const col = this.col || { fire: '#ff8a3a', ice: '#bfe8ff', beam: '#fff8c0', dark: '#8a3aff', orb: '#ff5a8a' }[this.kind];
        const pul = 1 + Math.sin(this.t * 30) * 0.15;
        g.globalAlpha = 0.35; g.fillStyle = col; g.beginPath(); g.arc(x, y, this.r * 1.8 * pul, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1; g.beginPath(); g.arc(x, y, this.r * pul, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x - 1, y - 1, Math.max(1, this.r * 0.4), 0, Math.PI * 2); g.fill();
        if (this.kind === 'beam') { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(255,248,200,0.7)'; g.fillRect(-14, -2, 14, 4); g.restore(); }
      } else if (this.kind === 'rock' || this.kind === 'thrown') {
        if (this.img) g.drawImage(this.img, x - this.img.width / 2, y - this.img.height / 2 - Math.sin(Math.min(1, this.t / this.life) * Math.PI) * 10);
        else { g.fillStyle = '#8a7a6a'; g.fillRect(x - 3, y - 3, 6, 6); }
      } else if (this.drawFn) this.drawFn(g, x, y);
    }
  }
  function shoot(o) {
    // 쏘기 전 갈고리 (재능 · 던전 법칙이 화살 · 주문을 바꾼다)
    if (C.onShoot) o = C.onShoot(o) || o;
    // 높이를 안 준 탄: 쏜 이의 높이에서 난다 (높은 마을 · 고원에서 마법 · 적 탄이 바로 벽에 부딪혀 사라지던 것)
    if (o.z == null) {
      const Wd = W(), m = Wd.map, p = Wd.player;
      if (o.owner !== 'foe' && p) o.z = p.z || 0;
      else {
        let best = null, bd = 30;
        for (const e of Wd.ents) if ((e.kind === 'foe' || e.boss) && !e.dead) { const d = U.dist(e.x, e.y, o.x, o.y + 8); if (d < bd) { bd = d; best = e; } }
        o.z = best ? best.z || 0 : m ? m.H(Math.floor(o.x / TS), Math.floor((o.y + 10) / TS)) : 0;
      }
    }
    return W().add(new Shot(o));
  }

  function freezeWater(m, tx, ty) {
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const t = m.T(tx + dx, ty + dy);
      if (t === TL.T.WATER || t === TL.T.DEEP) { cells.push([tx + dx, ty + dy, t]); m.setT(tx + dx, ty + dy, TL.T.ICE); }
    }
    if (!cells.length) return;
    sfx('freeze');
    G.fx.shards(tx * TS + 8, ty * TS + 8, 8, '#e8f8ff');
    W().add(new E.Ent({ kind: 'timer', solid: false, hidden: true, life: 8, update(dt) { this.life -= dt; if (this.life <= 0) { for (const [x, y, t] of cells) m.setT(x, y, t); this.dead = true; const p = W().player; if (p && m.T(p.tx, p.ty) === TL.T.DEEP && !p.swim) p.startFall('pit'); } } }));
  }

  /* ───────── 폭발 ───────── */
  function explode(x, y, owner, power) {
    const Wd = W(), m = Wd.map;
    const R = 28 * (power || 1);
    sfx('explode'); Wd.shake(5, 0.35); Wd.hitstop(0.05);
    G.fx.sparks(x, y, 30, '#ffb84a', 160); G.fx.ring(x, y, '#ffe8a8', R, 0.4, 3); G.fx.dust(x, y, 14);
    for (const e of foes()) if (U.dist(x, y, e.x, e.y - 8) < R + (e.r || 8)) { const [nx, ny] = U.norm(e.x - x, e.y - y); damage(e, 8 * (power || 1), { src: 'bomb', kx: nx, ky: ny, power: 1.6, el: 'bomb', unblockable: true, stun: 0.6 }); }
    const p = Wd.player;
    if (p && U.dist(x, y, p.x, p.y - 8) < R) hurtPlayer(p, 4, { x, y }, {});
    for (let ty = Math.floor((y - R) / TS); ty <= Math.floor((y + R) / TS); ty++) for (let tx = Math.floor((x - R) / TS); tx <= Math.floor((x + R) / TS); tx++) {
      if (U.dist(x, y, tx * TS + 8, ty * TS + 8) > R + 8) continue;
      cutAt(m, tx, ty, 'bomb');
    }
    for (const e of Wd.ents) if (e.bombable && !e.dead && U.dist(x, y, e.x, e.y - 8) < R + 12) e.bombed();
  }

  /* ───────── 떨어진 것 ───────── */
  class Pickup extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'pickup', solid: false, bw: 6, bh: 4, life: 14, jz: 0 }, o)); this.vz = 60 + Math.random() * 40; const a = Math.random() * Math.PI * 2; this.vx = Math.cos(a) * 40; this.vy = Math.sin(a) * 25; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player;
      if (this.t > 0.35 && p && !p.dead) {
        const d = U.dist(this.x, this.y, p.x, p.y - 4);
        const mag = this.what === 'exp' ? 70 : this.what === 'gold' ? 34 : 14;
        if (d < mag) { const [nx, ny] = U.norm(p.x - this.x, p.y - 4 - this.y); const sp = 90 + (mag - d) * 6; this.vx = nx * sp; this.vy = ny * sp; }
        if (d < 8) { collect(this); this.dead = true; return; }
      }
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.vx *= 1 - Math.min(1, 3 * dt); this.vy *= 1 - Math.min(1, 3 * dt);
      this.vz -= 300 * dt; this.jz += this.vz * dt;
      if (this.jz < 0) { this.jz = 0; this.vz = Math.abs(this.vz) > 30 ? -this.vz * 0.4 : 0; }
      if (this.t > this.life) this.dead = true;
    }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Math.round(this.x - cx - 2), Math.round(this.y - cy), 5, 1); }
    draw(g, cx, cy) {
      if (this.t > this.life - 3 && Math.floor(this.t * 10) % 2) return;
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - this.jz - 3 + Math.sin(this.t * 6) * (this.jz ? 0 : 1));
      const icon = C.icons[this.what === 'item' ? 'item' : this.what];
      if (icon) g.drawImage(icon, x - (icon.width >> 1), y - (icon.height >> 1));
    }
  }
  function spawnPickup(x, y, what, n, id) { return W().add(new Pickup({ x, y, what, n, id })); }
  function collect(pk) {
    const s = S(), d = G.st.derive(s), p = W().player;
    switch (pk.what) {
      case 'exp': {
        const up = G.st.gainExp(s, pk.n);
        sfx('orb');
        if (up) levelUp(p, up);
        break;
      }
      case 'gold': s.gold += pk.n; sfx('coin'); break;
      case 'heart': s.hp = Math.min(d.hpMax, s.hp + pk.n); sfx('heart'); break;
      case 'mp': s.mp = Math.min(d.mpMax, s.mp + pk.n); sfx('mp'); break;
      case 'arrow': s.ammo.arrows = Math.min(s.ammo.arrowsMax, s.ammo.arrows + pk.n); sfx('item'); break;
      case 'bomb': s.ammo.bombs = Math.min(s.ammo.bombsMax, s.ammo.bombs + pk.n); sfx('item'); break;
      case 'item': G.st.give(s, pk.id, pk.n); sfx('item'); G.fx.float(p.x, p.y - 30, G.data.ITEMS[pk.id].name, '#ffe8a8', { life: 1 }); break;
      default: break;
    }
  }
  function levelUp(p, n) {
    const s = S();
    sfx('levelup'); if (G.audio) G.audio.jingle('levelup');
    G.fx.ring(p.x, p.y - 4, '#ffffff', 30, 0.6, 2);
    G.fx.glow(p.x, p.y - 10, s.flags.hero_green ? '#8ae0a0' : '#ffffff', 26, 50);
    G.fx.float(p.x, p.y - 34, '렙업!  Lv ' + s.lv, '#ffffff', { big: true, life: 1.4, vy: -20 });
    W().slowmo(0.5, 0.3);
    if (G.ui && G.ui.toast) G.ui.toast('[y]렙업![/] Lv ' + s.lv + ' · 재능 점수 +' + n, 'white');
    if (G.story && G.story.onLevel) G.story.onLevel(s.lv);
  }

  /* ───────── 360° 조준 ─────────
     겨누는 쪽: 직접 겨눈 방향(마우스 · 오른쪽 스틱 · 버튼 끌기 · 방향키 조준) → 없으면 바라보는 쪽(걷는 방향, 8방향 · 아날로그)에서
     그 무기 사거리 · 원뿔 안의 가장 알맞은 적(자동 조준, 설정에서 끔) → 그것도 없으면 바라보는 쪽 그대로.
     공격 · 스킬 · 필살기가 시작할 때 주인공이 그쪽을 바라보고(p.face), 동작 중에도 걸을 수 있다(player.js) */
  const AIMR = { sword: [64, 1.05], bow: [210, 0.75], magic: [190, 0.8], skill: [170, 0.9], special: [190, 0.95], throw: [120, 0.75] };
  function explicitAim(p) {
    const A = I.aimDir ? I.aimDir() : null;
    if (!A) return null;
    if (A.src === 'mouse') {
      const cv = typeof document !== 'undefined' && document.getElementById('cv'); if (!cv || !W()) return null;
      const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return null;
      const wx = (A.mx - r.left) * cv.width / r.width + (W().rcx || 0), wy = (A.my - r.top) * cv.height / r.height + (W().rcy || 0);
      const dx = wx - p.x, dy = wy - (p.y - 9 - (p.jz || 0));
      if (U.len(dx, dy) < 4) return null;
      const n = U.norm(dx, dy); return { x: n[0], y: n[1], src: 'mouse', wx, wy };
    }
    return A;
  }
  function autoTarget(p, a0, range, cone) {
    let best = null, bs = 1e9;
    for (const e of foes()) {
      if (e.hidden || e.dying || e.friendly || e.cloakT > 0 || e.submerged) continue;
      const ex = e.x, ey = e.y - (e.h || 16) / 2;
      const dd = U.dist(p.x, p.y - 9, ex, ey); if (dd > range + (e.r || 8)) continue;
      const da = Math.abs(U.angDiff(a0, U.angle(ex - p.x, ey - (p.y - 9))));
      if (da > cone && dd > 20) continue;
      const sc = dd + da * 70 - (e.boss ? 16 : 0);
      if (sc < bs) { bs = sc; best = e; }
    }
    return best;
  }
  function aimFor(p, kind) {
    const ex = explicitAim(p);
    if (ex) return { a: U.angle(ex.x, ex.y), src: ex.src };
    const a0 = U.angle(p.face[0], p.face[1]);
    const st = (S() && S().settings) || {};
    if (st.autoAim !== false) {
      const R = AIMR[kind] || AIMR.skill, t = autoTarget(p, a0, R[0], R[1]);
      if (t) return { a: U.angle(t.x - p.x, t.y - (t.h || 16) / 2 - (p.y - 9)), src: 'auto', target: t };
    }
    return { a: a0, src: 'face' };
  }
  /** 겨눈 쪽을 바라본다 — 각도를 돌려준다 */
  function faceAim(p, kind) {
    const r = aimFor(p, kind);
    p.face = [Math.cos(r.a), Math.sin(r.a)]; p.dir = U.dir4(p.face[0], p.face[1], p.dir);
    p.aimA = r.a; p.aimSrc = r.src; p.aimTgt = r.target || null; p.aimT = p.t;
    return r.a;
  }
  C.explicitAim = explicitAim; C.aimFor = aimFor; C.faceAim = faceAim; C.autoTarget = autoTarget;

  /* ───────── 주인공 동작 ───────── */
  function swordAngle(p) { return faceAim(p, 'sword'); }
  const faceAng = (p) => U.angle(p.face[0], p.face[1]);
  const atk = {
    input(p, m) {
      const s = S();
      const fire = I.pressed('aimfire');   // 방향키 조준 모드: 겨누면서 바로 공격
      const w0 = C.weapon ? C.weapon() : 'sword';
      // 마법은 누르고 있으면 이어서 건다 (걸면서 겨누기 좋게)
      const key = fire || (I.down('aimfire') && !I.down('attack')) ? 'aimfire' : 'attack';
      const repeat = w0 === 'magic' && I.held(key) > 0.3 && p.t - (p.castAt || -9) > 0.38 && !p.carry;
      if (!I.pressed('attack') && !fire && !repeat) return false;
      if (!fire && !repeat) {
        // 먼저 말 걸기 · 조사 · 들기
        if (G.interact && G.interact.tryAt(p)) { I.eat('attack'); return true; }
        if (p.carry) { throwCarry(p); I.eat('attack'); return true; }
        const L = liftTarget(p, m);
        if (L && (!s.equip.sword || OB.DEF[L.o].drop === 'rock')) { startLift(p, m, L); I.eat('attack'); return true; }
      } else if (p.carry) { throwCarry(p); return true; }
      // 든 무기로 (검 · 활 · 마법 — 바꾸기 버튼으로 바꾼다). 바꾸는 틈에는 쉬어 간다
      if (p.swapT > 0) return false;
      p.atkKey = key;
      if (w0 === 'bow') return startBow(p, key);
      if (w0 === 'magic') { p.castAt = p.t; return castMagic(p); }
      if (!s.equip.sword) return false;
      startSwing(p, 0);
      return true;
    },
    update(p, dt, m, ctl) { updSwing(p, dt, m, ctl); },
  };
  function startSwing(p, stage) {
    const s = S(), d = G.st.derive(s);
    p.setState('attack');
    p.combo = stage; p.hitSet = new Set(); p.queued = false; p.chargeOk = true;
    const spd = d.swing * (p.frenzyT > 0 ? 0.7 : 1);
    p.swing = { a0: 0, a1: 0, t: 0, dur: (stage === 2 ? 0.2 : 0.18) * spd, reach: d.reach + 4 + (stage === 2 ? 6 : 0), stage };   // 앞으로 조금 더 길게 (+4, 찌르기 +10) — 지난 판 +6/+13에서 살짝 되돌림
    const base = swordAngle(p);
    const sweep = stage === 2 ? 0.4 : 2.15;   // 양옆으로 조금 더 넓게 (기본 1.9 · 지난 판 2.3)
    const flip = stage === 1 ? -1 : 1;
    p.swing.a0 = base - sweep / 2 * flip; p.swing.a1 = base + sweep / 2 * flip;
    if (stage === 3) { p.swing.a0 = base + 1.4; p.swing.a1 = base - 1.4; p.swing.dur = 0.24 * spd; p.swing.reach += 4; }
    // 앞으로 조금 내딛는다 (무거운 검은 덜, 빠른 검은 더)
    const [ux, uy] = p.face;
    p.lunge = (stage === 2 ? 70 : 40) / Math.max(0.8, d.swing); p.lungeDir = [ux, uy];
    // 돌진 찌르기 (달리다 공격) · 회피 베기 (구르기 끝에 공격)
    const dodgeAtk = s.skills.sv_dodgeatk && p.t - (p.rollEndT || -9) < 0.32;
    if (stage === 0 && ((s.skills.sw_lunge && (p.moveT || 0) > 0.45) || dodgeAtk)) {
      p.swing.stage = 2; p.swing.lunge = true; p.swing.a0 = base - 0.2; p.swing.a1 = base + 0.2; p.swing.dur = 0.26 * spd; p.swing.reach += 8;
      p.lunge = dodgeAtk ? 230 : 190; p.swing.mul = dodgeAtk ? 1.6 : 1.8;
      G.fx.ring(p.x, p.y - 8, '#ffffff', 12, 0.2, 1); sfx('dash');
    }
    p.atkFrame = 0;
    sfx(stage === 2 ? 'thrust' : 'swing');
    // 반격 (완벽 회피 직후)
    p.critNext = p.counterT > 0 && s.skills.sw_counter;
    p.counterT = 0;
  }
  function updSwing(p, dt, m, ctl) {
    const s = S(), d = G.st.derive(s);
    const sw = p.swing;
    if (p.state === 'charge') return updCharge(p, dt, m, ctl);
    if (p.state === 'spin') return updSpin(p, dt, m);
    if (p.state === 'dash') return updDash(p, dt, m);
    if (p.state === 'sp') return G.specials ? G.specials.update(p, dt, m) : p.setState('idle');
    if (p.state === 'lift') { if (p.st > 0.2) p.setState('idle'); return; }
    if (p.state === 'bow') return updBow(p, dt, m, ctl);
    if (p.state === 'cast') return updCast(p, dt, m);
    if (p.state !== 'attack' || !sw) { p.setState('idle'); return; }
    sw.t += dt;
    const k = Math.min(1, sw.t / sw.dur);
    p.atkFrame = k < 0.25 ? 0 : k < 0.85 ? 1 : 2;
    if (p.lunge > 0) { E.move(m, p, p.lungeDir[0] * p.lunge * dt, p.lungeDir[1] * p.lunge * dt); p.lunge = Math.max(0, p.lunge - 500 * dt); }
    // 판정: 휘두르는 동안
    if (k > 0.1 && k < 0.95) {
      const a = U.lerp(sw.a0, sw.a1, U.ease.out(k));
      const cxp = p.x, cyp = p.y - 9;
      const dmgMul = sw.mul || (sw.stage === 2 ? 1.5 : sw.stage === 3 ? 1.3 : 1);
      for (const e of foes()) {
        if (p.hitSet.has(e)) continue;
        const ex = e.x, ey = e.y - (e.h || 16) / 2;
        const dd = U.dist(cxp, cyp, ex, ey);
        if (dd > sw.reach + (e.r || 8)) continue;
        const ea = U.angle(ex - cxp, ey - cyp);
        const lo = Math.min(sw.a0, a), hi = Math.max(sw.a0, a);
        const within = dd < 11 || (U.angDiff(lo, ea) >= -0.4 && U.angDiff(ea, hi) >= -0.4);
        if (!within) continue;
        p.hitSet.add(e);
        const [nx, ny] = U.norm(ex - p.x, ey - p.y + 9);
        // 찌르기(셋째 베기): 레이피어 · 찌르기 달인은 더 깊다
        const thrustMul = sw.stage === 2 ? (1 + d.thrust) * (s.skills.sw_thrust ? 1.4 : 1) : 1;
        const hit = damage(e, d.atk * dmgMul * thrustMul, { src: 'sword', kx: nx, ky: ny, el: d.el, crit: p.critNext, power: sw.stage === 2 ? 1.6 : 1, from: p });
        if (hit && e.hp > 0 && !e.boss) e.stunT = Math.max(e.stunT || 0, 0.15);
        // 쌍검: 한 박자 뒤 두 번째 날
        if (hit && d.twin) after(0.07, () => { if (!e.dead) damage(e, d.atk * dmgMul * d.twin, { src: 'sword', kx: nx * 0.3, ky: ny * 0.3, el: d.el, power: 0.4, chain: true }); });
        if (hit && (d.bleed || s.skills.sw_rend) && !e.dead) { e.poisonT = Math.max(e.poisonT || 0, d.bleed ? 3.5 : 2.5); e.bleed = true; }
      }
      // 등급 3 이상: 칼끝에서 빛 가루
      if (d.grade >= 3 && Math.random() < 0.7) { const GC = G.prog.GRADES[d.grade]; G.fx.part({ x: cxp + Math.cos(a) * sw.reach, y: cyp + 2 + Math.sin(a) * sw.reach * 0.8, z: 2, vz: 20, g: 40, life: 0.3, col: d.grade >= 5 ? '#ffe066' : GC.glow, size: d.grade >= 4 ? 2 : 1, glow: true }); }
      // 풀 · 덤불 베기
      cutArc(m, cxp, cyp + 4, a, sw.reach - 4, 0.3);
      // 소품 치기 (스위치 · 항아리)
      for (const e of W().ents) if (e.swordHit && !e.dead && !p.hitSet.has(e) && U.dist(cxp, cyp, e.x, e.y - 6) < sw.reach + 6) { p.hitSet.add(e); e.swordHit(p); }
    }
    // 검기: 체력이 넉넉한 빛의 검 · 검성은 마지막 베기마다
    const lastStage = s.skills.sw_combo ? 3 : 2;
    const itemBeam = G.data.ITEMS[s.equip.sword] && G.data.ITEMS[s.equip.sword].beam && s.hp >= d.hpMax * d.beamAt && sw.stage !== 3;
    const masterBeam = s.skills.sw_master && sw.stage === lastStage;
    if (sw.t >= sw.dur * 0.5 && !sw.beamed && (itemBeam || masterBeam)) {
      sw.beamed = true;
      const a = faceAng(p);
      shoot({ kind: 'beam', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, dmg: d.atk * 0.8, src: 'beam', el: 'light', r: 4, life: 0.6, pierce: 1, trail: '#fff8c0' });
      sfx('beam');
    }
    if (ctl && (I.pressed('attack') || I.pressed('aimfire'))) p.queued = true;
    if (sw.t >= sw.dur) {
      const maxStage = s.skills.sw_combo ? 3 : 2;
      if (p.queued && sw.stage < maxStage) { startSwing(p, sw.stage + 1); return; }
      // 누르고 있으면 모으기
      // (연속 베기 중간에 꾹 눌러도 모은다: 몇 번 베다가 누르고 있으면 회전 베기가 안 나가던 것.
      //  마지막 베기 중에 눌러 그대로 누르고 있을 때도 — 이어 벨 단계가 없으니 모으기로)
      if (ctl && I.down(p.atkKey || 'attack') && p.chargeOk) { p.setState('charge'); p.chargeT = 0; p.queued = false; return; }
      if (sw.t >= sw.dur + (p.queued ? 0 : 0.08)) { p.swing = null; p.setState('idle'); }
    }
  }
  function updCharge(p, dt, m, ctl) {
    const d = G.st.derive(S());
    p.chargeT += dt;
    // 모으는 중에는 천천히 걸을 수 있다 (방향 고정)
    const ax = ctl ? I.axisX : 0, ay = ctl ? I.axisY : 0;
    if (U.len(ax, ay) > 0.2) { const n = U.norm(ax, ay); E.move(m, p, n[0] * 34 * dt, n[1] * 34 * dt); p.walkT += dt * 0.6; }
    if (p.chargeT >= d.chargeTime && !p.chargeFull) { p.chargeFull = true; sfx('charged'); G.fx.ring(p.x, p.y - 8, '#fff2a8', 16, 0.3); }
    if (p.chargeFull && Math.random() < dt * 30) G.fx.sparks(p.x + (Math.random() - 0.5) * 14, p.y - 10 + (Math.random() - 0.5) * 10, 1, '#fff2a8', 20);
    if (!ctl || !I.down(p.atkKey || 'attack')) {
      if (p.chargeFull) startSpin(p); else { p.setState('idle'); }
      p.chargeFull = false;
    }
  }
  function startSpin(p) {
    const s = S();
    p.setState('spin');
    p.hitSet = new Set();
    p.spin = { t: 0, dur: s.skills.sw_great ? 0.55 : 0.36, turns: s.skills.sw_great ? 2 : 1, reach: G.st.derive(s).reach + (s.skills.sw_great ? 12 : 6), a0: swordAngle(p) };
    sfx('spin');
    G.fx.ring(p.x, p.y - 6, '#ffffff', p.spin.reach + 4, 0.35, 2);
    if (s.skills.sw_wave) {
      const d = G.st.derive(s);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; shoot({ kind: 'orb', col: '#e8f4ff', x: p.x + Math.cos(a) * 12, y: p.y - 4 + Math.sin(a) * 10, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, dmg: d.atk * 0.9, src: 'beam', r: 3, life: 0.32, pierce: 2, trail: '#e8f4ff', ghost: true }); }
    }
  }
  function updSpin(p, dt, m) {
    const d = G.st.derive(S());
    const sp = p.spin;
    sp.t += dt;
    const a = sp.a0 + (sp.t / sp.dur) * Math.PI * 2 * sp.turns;
    const dirs = ['right', 'down', 'left', 'up'];
    p.dir = dirs[Math.floor((((a % (Math.PI * 2)) + Math.PI * 2 + Math.PI / 4) % (Math.PI * 2)) / (Math.PI / 2)) % 4];
    p.atkFrame = 1;
    const cxp = p.x, cyp = p.y - 9;
    for (const e of foes()) {
      if (p.hitSet.has(e)) continue;
      if (U.dist(cxp, cyp, e.x, e.y - (e.h || 16) / 2) > sp.reach + (e.r || 8)) continue;
      p.hitSet.add(e);
      const [nx, ny] = U.norm(e.x - p.x, e.y - p.y);
      damage(e, d.atk * (sp.mul || 2.2), { src: 'spin', kx: nx, ky: ny, el: d.el, power: sp.power || 1.8, unblockable: true });
    }
    cutArc(m, cxp, cyp + 4, a, sp.reach - 4, 0.4);
    for (const e of W().ents) if (e.swordHit && !e.dead && !p.hitSet.has(e) && U.dist(cxp, cyp, e.x, e.y - 6) < sp.reach + 6) { p.hitSet.add(e); e.swordHit(p); }
    // 두 바퀴째에 한 번 더 맞힐 수 있게
    if (sp.turns > 1 && !sp.reset && sp.t > sp.dur / 2) { sp.reset = true; p.hitSet = new Set(); }
    if (sp.t >= sp.dur) { p.spin = null; p.setState('idle'); }
  }

  /* ── 활 ── */
  const bow = {
    update(p, dt, m, ctl) { updBow(p, dt, m, ctl); },
    input(p) {
      if (!I.pressed('bow')) return false;
      return startBow(p, 'bow');
    },
  };
  /** 활 당기기 시작: key를 누르고 있는 동안 당기고, 떼면 쏜다 */
  function startBow(p, key) {
    const s = S();
    if (!s.tools.bow || p.carry) return false;
    p.setState('bow'); p.bowT = 0; p.bowFull = false; p.bowHeavy = false; p.aim = faceAim(p, 'bow'); p.bowKey = key || 'bow';
    sfx('draw');
    return true;
  }
  function updBow(p, dt, m, ctl) {
    const s = S(), d = G.st.derive(s);
    p.bowT += dt;
    // 당기는 동안 겨눈 쪽을 따라 돈다 (걸으면서 · 마우스 · 오른쪽 스틱 · 끌기 — 없으면 걷는 쪽의 적을 자동으로)
    if (ctl) p.aim = faceAim(p, 'bow');
    if (p.bowT > d.draw + 0.35 && !p.bowFull) { p.bowFull = true; sfx('charged'); }
    if (p.bowFull && s.skills.bw_heavy && p.bowT > d.draw + 1.2 && !p.bowHeavy) { p.bowHeavy = true; sfx('charged'); G.fx.ring(p.x, p.y - 8, '#fff8c0', 14, 0.3, 2); }
    if (!ctl || !I.down(p.bowKey || 'bow')) {
      if (s.ammo.arrows <= 0) { sfx('buzz'); G.ui.toast('화살이 없다', 'bad'); p.setState('idle'); return; }
      if (p.bowT < 0.12) { p.bowT = 0.12; }
      s.ammo.arrows--;
      const charged = p.bowFull || !!(s.skills.bw_step && p.t - (p.rollEndT || -9) < 0.5);   // 뒷걸음 사격: 구른 직후는 다 모은 화살
      // 추적자의 활: 겨눈 쪽에서 가장 가까운 적을 쫓는다
      let tgt = null;
      if (d.bowHoming) { let bd = 1e9; for (const e of foes()) { const dd = U.dist(p.x, p.y, e.x, e.y); if (dd > 220) continue; const da = Math.abs(U.angDiff(p.aim, U.angle(e.x - p.x, e.y - p.y))); if (da > 0.9) continue; const sc = dd + da * 80; if (sc < bd) { bd = sc; tgt = e; } } }
      const heavy = charged && s.skills.bw_heavy && p.bowT > d.draw + 1.2;
      let el = d.bowEl;
      if (charged && !el && s.mp >= 4 && ((s.skills.bw_fire && s.spells.fire) || s.skills.bw_ice)) { el = s.skills.bw_fire ? 'fire' : 'ice'; s.mp -= 4; }
      const sp = heavy ? 420 : charged ? 340 : 260;
      const GC = G.prog ? G.prog.GRADES[d.bowGrade] : null;
      const trailCol = el === 'fire' ? '#ffb040' : el === 'ice' ? '#bfe8ff' : el === 'light' ? '#fff0a8' : heavy ? '#fff8c0' : charged ? '#fff4c0' : d.bowGrade >= 3 && GC ? GC.glow : null;
      const mk = (off, extra) => shoot(Object.assign({ kind: 'arrow', x: p.x + Math.cos(p.aim + off) * 8, y: p.y - 2 + Math.sin(p.aim + off) * 6, ox: p.x, oy: p.y, vx: Math.cos(p.aim + off) * sp, vy: Math.sin(p.aim + off) * sp, dmg: d.bowAtk * (heavy ? 3 : charged ? 2 : 1), src: 'arrow', pierce: heavy ? 99 : (charged && s.skills.bw_pierce ? 3 : 0) + d.bowPierce, charged, heavy, el, trail: trailCol, r: heavy ? 6 : 3, life: heavy ? 1.2 : 0.9, z: p.z, stun: heavy ? 0.8 : charged ? 0.3 : 0, power: heavy ? 2 : charged ? 1 : 0.5, grade: d.bowGrade, ret: (s.skills.bw_master && Math.random() < 0.3) || d.bowRet }, tgt ? { homing: d.bowHoming, target: tgt } : {}, extra || {}));
      mk(0);
      const n = charged ? Math.max(d.bowMulti, s.skills.bw_multi ? 3 : 1) : 1;
      for (let i = 1; i < n; i++) { const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1); mk(k * 0.2); }
      if (!charged && (s.skills.bw_rapid || d.bowRapid) && s.ammo.arrows > 0) { if (!d.bowRapid) s.ammo.arrows--; after(0.08, () => mk((Math.random() - 0.5) * 0.08)); }
      if (!charged && s.skills.bw_rapid && d.bowRapid && s.ammo.arrows > 0) { s.ammo.arrows--; after(0.16, () => mk((Math.random() - 0.5) * 0.12)); }
      if (heavy) { W().shake(3, 0.2); G.fx.ring(p.x + Math.cos(p.aim) * 12, p.y - 8 + Math.sin(p.aim) * 8, '#fff8c0', 14, 0.3, 2); }
      sfx(charged ? 'shootc' : 'shoot');
      p.setState('idle');
      p.st = 0;
    }
  }

  /* ── 마법 ── */
  const magic = {
    input(p) {
      if (!I.pressed('magic')) return false;
      return castMagic(p);
    },
  };
  /** 고른 주문을 건다 (MP · 요구치 확인) */
  function castMagic(p) {
    {
      const s = S();
      if (!s.spell || p.carry) return false;
      const sp = G.data.SPELLS[s.spell];
      if (G.prog && !G.prog.reqOk(s, sp.req)) { sfx('buzz'); G.fx.float(p.x, p.y - 30, '아직 못 다룬다', '#8ab8ff'); G.ui.toast(sp.name + ' — 필요: ' + G.prog.reqText(s, sp.req).replace(/\[\/?r\]/g, ''), 'bad'); return true; }
      const cost = Math.round(sp.mp * G.st.derive(s).mpCost);
      if (s.mp < cost && s.skills.mg_blood && s.hp > Math.ceil((cost - s.mp) / 10) + 1) {
        // 피의 영창: 모자란 MP 10마다 하트 ¼칸
        const q = Math.ceil((cost - s.mp) / 10); s.hp -= q; s.mp = cost; G.fx.float(p.x, p.y - 30, '피의 영창 -' + (q / 4) + '칸', '#ff6a8a'); sfx('hurt');
      }
      if (s.mp < cost) { sfx('buzz'); G.fx.float(p.x, p.y - 30, 'MP 부족', '#8ab8ff'); return true; }
      s.mp -= cost;
      faceAim(p, 'magic');
      p.setState('cast'); p.castSpell = s.spell; p.castDone = false;
      sfx('cast');
      return true;
    }
  }
  function updCast(p, dt, m) {
    const s = S(), d = G.st.derive(s);
    const q = (s.skills.mg_quick ? 0.5 : 1) * (d.castMul || 1);
    if (!p.castDone && p.st > 0.14 * q) {
      p.castDone = true;
      faceAim(p, 'magic');
      castSpell(p, p.castSpell, d);
      if (d.echo && Math.random() < d.echo) after(0.18, () => castSpell(p, p.castSpell, G.st.derive(S())));
    }
    if (p.st > 0.32 * q) p.setState('idle');
  }
  function castSpell(p, id, d) {
    const a = U.angle(p.face[0], p.face[1]);
    const mm = d.magMul;
    if (id === 'fire') { shoot({ kind: 'fire', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 210, vy: Math.sin(a) * 210, dmg: (4 + S().lv * 0.25) * mm, src: 'spell', el: 'fire', r: 4, life: 0.8, trail: '#ffb04a', explode: d.fireBlast || 0.6 }); sfx('fire'); }
    else if (id === 'ice') { shoot({ kind: 'ice', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, dmg: (3 + S().lv * 0.2) * mm, src: 'spell', el: 'ice', r: 4, life: 0.7, trail: '#e8f8ff', pierce: d.icePierce || 2, ghost: false }); sfx('ice'); }
    else if (id === 'bolt') {
      const list = foes().filter((e) => U.dist(p.x, p.y, e.x, e.y) < 110 + (d.boltChain - 3) * 20).sort((a2, b2) => U.dist(p.x, p.y, a2.x, a2.y) - U.dist(p.x, p.y, b2.x, b2.y)).slice(0, d.boltChain || 3);
      let fx = p.x, fy = p.y - 10;
      for (const e of list) { C.bolts.push({ x0: fx, y0: fy, x1: e.x, y1: e.y - 8, t: 0 }); fx = e.x; fy = e.y - 8; damage(e, (5 + S().lv * 0.22) * mm, { src: 'spell', el: 'bolt', stun: 1.2, kx: 0, ky: 0 }); }
      if (!list.length) C.bolts.push({ x0: p.x, y0: p.y - 40, x1: p.x + Math.cos(a) * 40, y1: p.y + Math.sin(a) * 30, t: 0 });
      W().shake(3, 0.2); sfx('bolt'); G.fx.float(p.x, p.y - 30, '번개!', '#ffe066');
    } else if (id === 'wind') {
      for (const off of [-0.35, 0, 0.35]) shoot({ kind: 'wind', x: p.x + Math.cos(a + off) * 10, y: p.y - 2 + Math.sin(a + off) * 8, vx: Math.cos(a + off) * 250, vy: Math.sin(a + off) * 250, dmg: (2.5 + S().lv * 0.15) * mm, src: 'spell', el: 'wind', r: 5, life: 0.5, pierce: 3, power: 2.4, trail: '#b8ffd8', ghost: true, drawFn(g, x, y) { const an = Math.atan2(this.vy, this.vx); g.save(); g.translate(x, y); g.rotate(an); g.strokeStyle = 'rgba(200,255,220,0.9)'; g.lineWidth = 2; g.beginPath(); g.arc(-3, 0, 6, -1.2, 1.2); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.beginPath(); g.arc(-5, 0, 6, -1, 1); g.stroke(); g.restore(); } });
      sfx('swing'); G.fx.leaves && G.fx.leaves(p.x, p.y - 6, 4);
    } else if (id === 'quake') {
      W().shake(5, 0.4); sfx('rumble'); G.fx.ring(p.x, p.y - 2, '#d8a868', 70, 0.45, 3); G.fx.dust(p.x, p.y, 18);
      for (let i = 0; i < 14; i++) { const a2 = Math.random() * Math.PI * 2, r2 = 10 + Math.random() * 60; G.fx.part({ x: p.x + Math.cos(a2) * r2, y: p.y + Math.sin(a2) * r2 * 0.7, z: 0, vz: 60 + Math.random() * 60, g: 260, life: 0.6, col: Math.random() < 0.5 ? '#a8784a' : '#d8b080', size: 2 }); }
      for (const e of foes()) { const dd = U.dist(p.x, p.y, e.x, e.y); if (dd < 72 && !e.fly) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); damage(e, (6 + S().lv * 0.25) * mm, { src: 'spell', el: 'earth', stun: 1.6, kx: nx, ky: ny, power: 1.4 }); } }
    } else if (id === 'meteor') {
      sfx('cast'); W().shake(2, 0.3);
      const targets = foes().filter((e) => U.dist(p.x, p.y, e.x, e.y) < 160).sort((a2, b2) => U.dist(p.x, p.y, a2.x, a2.y) - U.dist(p.x, p.y, b2.x, b2.y)).slice(0, 5);
      for (let i = 0; i < 5; i++) {
        const t = targets[i % Math.max(1, targets.length)];
        const tx = t ? t.x + (Math.random() - 0.5) * 12 : p.x + Math.cos(a) * (40 + i * 18) + (Math.random() - 0.5) * 30, ty = t ? t.y : p.y + Math.sin(a) * (40 + i * 18) + (Math.random() - 0.5) * 30;
        const dly = 0.35 + i * 0.16;
        C.marks.push({ x: tx, y: ty, t: 0, life: dly, r: 16, col: '#ff7a4a' });
        after(dly, () => { explode(tx, ty - 4, 'player', 1.3); for (const e of foes()) if (U.dist(tx, ty, e.x, e.y) < 30) damage(e, (12 + S().lv * 0.35) * mm, { src: 'spell', el: 'fire', kx: 0, ky: 0, power: 1.5, stun: 0.6 }); W().shake(4, 0.2); G.fx.shards(tx, ty - 8, 14, '#ff9a5a'); });
      }
    } else if (C.spellFx && C.spellFx[id]) { C.spellFx[id](p, d, a, mm);
    } else if (id === 'heal') {
      G.fx.glow(p.x, p.y - 8, '#8ae0a0', 24, 40); sfx('heal');
      p.healLeft = 8;
    } else if (id === 'light') {
      G.fx.ring(p.x, p.y - 8, '#ffffff', 90, 0.6, 3); G.fx.glow(p.x, p.y - 8, '#ffffff', 40, 60); sfx('white');
      if (G.light) G.light.flare(p.x, p.y, 140, 6);
      for (const e of foes()) if (U.dist(p.x, p.y, e.x, e.y) < 110) { if (e.undead || e.dark) damage(e, (6 + S().lv * 0.2) * mm, { src: 'spell', el: 'light', stun: 2.5, kx: 0, ky: 0 }); else e.stunT = Math.max(e.stunT || 0, 0.8); }
      for (const e of W().ents) if (e.reveal && U.dist(p.x, p.y, e.x, e.y) < 120) e.reveal();
    }
  }

  /* ── 도구 ── */
  const tool = {
    input(p, m) {
      const s = S();
      if (!I.pressed('tool') || !s.tool || p.carry) return false;
      if (s.tool === 'bomb') {
        if (s.ammo.bombs <= 0) { sfx('buzz'); G.ui.toast('폭탄이 없다', 'bad'); return true; }
        if (!(C.freeTool && C.freeTool('bomb'))) s.ammo.bombs--;
        const [ux, uy] = U.DV[p.dir];
        const bo = W().add(new Bomb({ x: p.x + ux * 10, y: p.y + uy * 8, fuse: C.bombFuse ? C.bombFuse() : 1.6, power: C.bombPower ? C.bombPower() : 1 }));
        if (C.toolUsed) C.toolUsed('bomb', p, bo);
        sfx('fuse');
        return true;
      }
      if (s.tool === 'hook') { startHook(p, m); if (C.toolUsed) C.toolUsed('hook', p); return true; }
      if (s.tool === 'lantern') { p.lantern = !p.lantern; sfx(p.lantern ? 'lamp' : 'click'); if (G.interact) G.interact.lanternAt(p); return true; }
      if (s.tool === 'mirror') { if (G.light) G.light.flare(p.x, p.y, 80, 2, '#d8b0ff'); for (const e of W().ents) if (e.reveal && U.dist(p.x, p.y, e.x, e.y) < 90) e.reveal(); sfx('mirror'); if (C.toolUsed) C.toolUsed('mirror', p); return true; }
      if (s.tool === 'rod') { if (G.story && G.story.fish) G.story.fish(p); return true; }
      return false;
    },
  };
  class Bomb extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'bomb', solid: false, bw: 8, bh: 6, fuse: 1.6 }, o)); }
    update(dt) { this.t += dt; if (Math.random() < 0.5) G.fx.part({ x: this.x + 2, y: this.y - 10, z: 0, vz: 20, g: 0, life: 0.3, col: '#ffd84a', size: 1, glow: true }); if (this.t >= this.fuse) { this.dead = true; explode(this.x, this.y - 4, 'player', this.power || 1); } }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, 5, 2, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 5);
      const pulse = this.t > this.fuse - 0.6 && Math.floor(this.t * 16) % 2;
      g.fillStyle = pulse ? '#ff5a3a' : '#2a2a4a'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5a5a8a'; g.fillRect(x - 3, y - 3, 2, 2);
      g.fillStyle = '#8a6a3a'; g.fillRect(x + 1, y - 8, 1, 3);
    }
  }
  function startHook(p, m) {
    if (p.hook) return;
    const a = ANG[p.dir];
    p.hook = { x: p.x, y: p.y - 8, a, d: 0, out: true, max: 160 * (C.hookMul ? C.hookMul() : 1), hit: null };
    p.setState('hook');
    sfx('hook');
  }
  /** 갈고리로 끌려가 내려설 칸: 걸린 곳 바로 앞(주인공 쪽) 칸 가운데. 구덩이 · 물 · 막힌 칸이면 걸린 곳 둘레의 가장 가까운 안전한 칸.
      (예전에는 걸린 곳에서 몇 픽셀 앞에서 멈춰, 구덩이 너머 말뚝을 걸면 구덩이 위에 내려서 떨어졌다) */
  function hookLanding(m, p, ptx, pty, dx, dy) {
    const safe = (x, y) => {
      if (!m.inb(x, y) || m.hazardAt(x * TS + 8, y * TS + 10)) return false;
      const t = m.T(x, y); if (t === TL.T.DEEP && !p.swim) return false;
      const z = t === TL.T.STAIRS ? p.z : m.H(x, y);
      return m.boxFree(x * TS + 8 - p.bw / 2, y * TS + 12 - p.bh, p.bw, p.bh, z, p) && !W().propBlock(x * TS + 8 - p.bw / 2, y * TS + 12 - p.bh, p.bw, p.bh, p);
    };
    const fx = ptx - dx, fy = pty - dy;   // 주인공 쪽 앞 칸
    const cand = [[fx, fy], [ptx - dy, pty - dx], [ptx + dy, pty + dx], [fx - dy, fy - dx], [fx + dy, fy + dx], [ptx + dx, pty + dy]];
    for (const [x, y] of cand) if (safe(x, y)) return [x * TS + 8, y * TS + 12];
    return null;
  }
  const hookAct = {
    update(p, dt, m) {
      const h = p.hook;
      if (!h) { p.setState('idle'); return; }
      if (h.out) {
        h.d += 360 * dt;
        const x = p.x + Math.cos(h.a) * h.d, y = p.y - 8 + Math.sin(h.a) * h.d;
        h.x = x; h.y = y;
        // 걸리는 곳: 말뚝 소품 · 나무 · 적 · 상자
        const post = W().ents.find((e) => e.hookable && !e.dead && U.dist(x, y, e.x, e.y - 8) < 9);
        const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
        const o = m.O(tx, ty);
        if (post || (o && OB.DEF[o] && OB.DEF[o].big)) {
          // 걸린 곳 바로 앞(주인공 쪽)에 내려선다
          const hx0 = post ? post.x : tx * TS + 8, hy0 = post ? post.y : ty * TS + 14;
          h.out = false; h.pull = true; sfx('clank');
          const L = hookLanding(m, p, post ? Math.floor(post.x / TS) : tx, post ? Math.floor((post.y - 3) / TS) : ty, Math.round(Math.cos(h.a)), Math.round(Math.sin(h.a)));
          if (L) { h.tx = L[0]; h.ty = L[1]; h.exact = true; }
          else { h.tx = hx0 - Math.cos(h.a) * 12; h.ty = hy0 - Math.sin(h.a) * 10 + (Math.sin(h.a) < -0.5 ? 12 : 2); }
          return;
        }
        const f = foes().find((e) => U.dist(x, y, e.x, e.y - 8) < (e.r || 8) + 3);
        if (f) { h.out = false; h.foe = f; if (!f.boss && (f.weight || 1) < 2) { f.stunT = 1; } damage(f, 1, { src: 'hook', stun: 1.2, kx: 0, ky: 0 }); return; }
        const pk = W().ents.find((e) => e.kind === 'pickup' && U.dist(x, y, e.x, e.y) < 8);
        if (pk) { pk.x = p.x; pk.y = p.y; h.out = false; return; }
        if (h.d >= h.max || !m.shotFree(x, y, p.z + 2)) { h.out = false; if (h.d < h.max) sfx('thunk'); }
      } else if (h.pull) {
        // 주인공이 끌려간다 (구덩이 · 물 위로)
        p.noClip = true; p.inv = Math.max(p.inv, 0.1);
        const [nx, ny] = U.norm(h.tx - p.x, h.ty - p.y);
        const step = 300 * dt;
        if (U.dist(p.x, p.y, h.tx, h.ty) <= step + (h.exact ? 0 : 12)) { if (h.exact) { p.x = h.tx; p.y = h.ty; } p.noClip = false; p.hook = null; p.setState('idle'); E.settle(m, p); p.safe = { x: p.x, y: p.y, z: p.z }; const safe = m.boxFree(p.x - p.bw / 2, p.y - p.bh, p.bw, p.bh, p.z, p); if (!safe) { p.y += 6; E.settle(m, p); } return; }
        p.x += nx * step; p.y += ny * step;
        h.x = h.tx; h.y = h.ty - 8;
      } else {
        h.d -= 420 * dt;
        h.x = p.x + Math.cos(h.a) * h.d; h.y = p.y - 8 + Math.sin(h.a) * h.d;
        if (h.foe && !h.foe.dead && !h.foe.boss && (h.foe.weight || 1) < 2) { h.foe.x = h.x; h.foe.y = h.y + 8; }
        if (h.d <= 0) { p.hook = null; p.setState('idle'); }
      }
    },
  };

  /* ── 들기 · 던지기 ── */
  function liftTarget(p, m) {
    const [ux, uy] = U.DV[p.dir];
    const tx = Math.floor((p.x + ux * 12) / TS), ty = Math.floor((p.y - 3 + uy * 10) / TS);
    const o = m.O(tx, ty);
    if (!o || !OB.DEF[o] || !OB.DEF[o].lift) return null;
    if (OB.DEF[o].lift > 1 && !S().inv.glove) return null;
    return { tx, ty, o };
  }
  function startLift(p, m, L) {
    m.setO(L.tx, L.ty, 0);
    p.carry = { o: L.o, img: OB.sprite(L.o, m.regName(L.tx, L.ty), 0).c };
    p.setState('lift');
    sfx('lift');
    if (OB.DEF[L.o].drop === 'bush') G.fx.leaves(L.tx * TS + 8, L.ty * TS + 10, 5);
  }
  function throwCarry(p) {
    const c = p.carry; p.carry = null;
    const a = faceAim(p, 'throw');
    shoot({ kind: 'thrown', img: c.img, x: p.x + Math.cos(a) * 6, y: p.y - 4 + Math.sin(a) * 4, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, dmg: c.o === OB.O.ROCK ? 6 : 3, src: 'throw', r: 6, life: 0.4, power: 1.2, zoff: 14, z: p.z,
      onDie() { G.fx.shards(this.x, this.y, 8, c.pot ? '#c87a4a' : c.o === OB.O.ROCK ? '#8a7a6a' : '#5aa84a'); sfx(c.pot || c.o === OB.O.ROCK ? 'rock' : 'cut'); if (c.pot) { c.pot.x = this.x; c.pot.y = this.y; c.pot.dropLoot(); } } });
    sfx('throw');
  }
  function dropCarry(p) { p.carry = null; }

  /* ── 필살기: 빛의 일섬 ── */
  const special = {
    input(p) {
      const s = S();
      if (!I.pressed('special') || s.special < 100 || p.carry) return false;
      const mv = (C.specialFor ? C.specialFor(s) : null) || s.specialMove || 'flash';
      faceAim(p, 'special');
      if (mv !== 'flash' && G.specials && G.data.SPECIALS[mv] && G.prog.reqOk(s, G.data.SPECIALS[mv].req)) { s.special = 0; G.specials.start(p, mv); return true; }
      s.special = 0;
      p.setState('dash'); p.dash = { t: 0, dur: 0.24, dir: [...p.face], hit: new Set() };
      p.inv = 0.5;
      W().slowmo(0.35, 0.18); W().shake(4, 0.3);
      sfx('special'); G.fx.ring(p.x, p.y - 8, '#fff8c0', 30, 0.4, 3);
      if (G.hud) G.hud.cutin && G.hud.cutin('빛의 일섬');
      return true;
    },
  };
  function updDash(p, dt, m) {
    const D2 = p.dash, d = G.st.derive(S());
    D2.t += dt;
    const sp = 420;
    const r = E.move(m, p, D2.dir[0] * sp * dt, D2.dir[1] * sp * dt);
    if (Math.random() < 0.8) { const sh = p.sheet; if (sh) { const img = sh.get('atk', p.dir, 1); G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.5); } }
    for (const e of foes()) {
      if (D2.hit.has(e)) continue;
      if (U.dist(p.x, p.y - 8, e.x, e.y - (e.h || 16) / 2) < 20 + (e.r || 8)) { D2.hit.add(e); damage(e, d.atk * 4 + 6, { src: 'special', kx: D2.dir[0], ky: D2.dir[1], el: 'light', power: 2.2, unblockable: true, crit: true, stun: 1 }); }
    }
    cutArc(m, p.x, p.y - 4, Math.atan2(D2.dir[1], D2.dir[0]), 16, 1.2);
    if (D2.t >= D2.dur || (r.hitX && r.hitY)) { p.setState('idle'); p.dash = null; G.fx.ring(p.x, p.y - 6, '#ffffff', 24, 0.3, 2); }
  }

  /* ───────── 검 · 활 · 갈고리 그리기 (주인공 위/아래) ───────── */
  function drawWeapon(g, p, cx, cy) {
    const d = G.st.derive(S());
    const hx = Math.round(p.x - cx), hy = Math.round(p.y - cy - 11 - (p.jz || 0));
    const spDraw = p.state === 'sp' && p.spx && G.specials && G.specials.MOVES[p.spx.id] ? (G.specials.MOVES[p.spx.id].draw || 'sword') : null;
    if (spDraw === 'cast') { const sp = G.data.SPECIALS[p.spx.id], col = G.prog.GRADES[sp.grade].glow || '#fff'; g.globalAlpha = 0.6; g.fillStyle = col; g.beginPath(); g.arc(hx, hy - 8, 5 + Math.sin(W().t * 30) * 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    else if (spDraw === 'bow') { const a = p.aim != null ? p.aim : Math.atan2(p.face[1], p.face[0]); g.save(); g.translate(hx, hy + 3); g.rotate(a); g.strokeStyle = '#8a5a30'; g.lineWidth = 2; g.beginPath(); g.arc(4, 0, 8, -1.2, 1.2); g.stroke(); g.fillStyle = 'rgba(255,240,160,0.8)'; g.fillRect(-1, -1.5, 18, 3); g.restore(); }
    if ((p.state === 'attack' && p.swing) || p.state === 'spin' || p.state === 'charge' || p.state === 'dash' || spDraw === 'sword' || spDraw === 'spin') {
      let a, reach = d.reach, trail = null;
      if (p.state === 'attack') { const sw = p.swing, k = Math.min(1, sw.t / sw.dur); a = U.lerp(sw.a0, sw.a1, U.ease.out(k)); reach = sw.reach; trail = { a0: sw.a0, a1: a, k, thrust: sw.stage === 2 }; }
      else if (p.state === 'spin') { const sp = p.spin; a = sp.a0 + (sp.t / sp.dur) * Math.PI * 2 * sp.turns; reach = sp.reach; trail = { a0: a - 2.2, a1: a, k: 0.5, spin: true }; }
      else if (p.state === 'dash') { a = Math.atan2(p.dash.dir[1], p.dash.dir[0]); }
      else if (spDraw === 'spin') { a = p.spinA || 0; reach = d.reach + 6; trail = { a0: a - 2.6, a1: a, k: 0.5, spin: true }; }
      else if (spDraw === 'sword') { a = Math.atan2(p.face[1], p.face[0]) + Math.sin(p.t * 40) * 0.8; trail = { a0: a - 1.4, a1: a, k: 0.5 }; }
      else { a = ANG[p.dir] + Math.PI * 0.75; reach = 14; }
      // 휘두른 자리의 빛 궤적
      if (trail && !trail.thrust) {
        g.save();
        // 등급이 높을수록 궤적이 넓고 밝다 · 영웅부터 바깥 빛테 · 전설은 금빛 두 겹
        const gr = d.grade || 1, GC = G.prog ? G.prog.GRADES[gr] : null;
        const elCol = d.el === 'fire' ? '#ffb070' : d.el === 'ice' ? '#bfe8ff' : d.el === 'light' ? '#fff8d0' : d.el === 'bolt' ? '#fff08a' : d.el === 'poison' ? '#9ae86a' : d.el === 'dark' ? '#c49bff' : null;
        const col = elCol || (gr >= 2 && GC ? GC.glow : '#ffffff');
        const r0 = 6 - Math.min(3, gr * 0.5), r1 = reach + 1 + gr * 0.8;
        const n = 12, fade = (1 - (trail.k > 0.8 ? (trail.k - 0.8) * 4 : 0));
        const quad = (aa, ab, ra, rb) => { g.beginPath(); g.moveTo(hx + Math.cos(aa) * ra, hy + 2 + Math.sin(aa) * ra * 0.8); g.lineTo(hx + Math.cos(aa) * rb, hy + 2 + Math.sin(aa) * rb * 0.8); g.lineTo(hx + Math.cos(ab) * rb, hy + 2 + Math.sin(ab) * rb * 0.8); g.lineTo(hx + Math.cos(ab) * ra, hy + 2 + Math.sin(ab) * ra * 0.8); g.fill(); };
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n;
          const aa = U.lerp(trail.a0, trail.a1, t0), ab = U.lerp(trail.a0, trail.a1, t1);
          const base = (trail.spin ? 0.42 : 0.55) * t1 * t1 * fade;
          if (gr >= 4) { g.globalAlpha = base * 0.45; g.fillStyle = gr >= 5 ? '#ffc84a' : col; quad(aa, ab, r1 - 1, r1 + 3); }
          g.globalAlpha = base; g.fillStyle = col; quad(aa, ab, r0, r1);
          // 앞쪽 가장자리의 흰 심
          g.globalAlpha = base * 1.3; g.fillStyle = '#ffffff'; quad(aa, ab, r1 - 2, r1);
        }
        if (gr >= 5 && trail.k < 0.8) { g.globalAlpha = 0.5 * fade; g.fillStyle = '#fff8d0'; const aT = trail.a1; g.beginPath(); g.arc(hx + Math.cos(aT) * r1, hy + 2 + Math.sin(aT) * r1 * 0.8, 3, 0, Math.PI * 2); g.fill(); }
        g.restore();
      }
      if (trail && trail.thrust) { g.globalAlpha = 0.6; g.fillStyle = '#ffffff'; g.save(); g.translate(hx, hy + 2); g.rotate(a); g.fillRect(4, -2, reach + 4, 4); g.restore(); g.globalAlpha = 1; }
      // 검 몸
      g.save(); g.translate(hx, hy + 2); g.rotate(a);
      const L = Math.round(reach * 0.72);
      g.fillStyle = '#6a4424'; g.fillRect(2, -1, 4, 2);
      g.fillStyle = '#e8c860'; g.fillRect(6, -3, 1, 6);
      g.fillStyle = d.swordCol; g.fillRect(7, -1, L, 2);
      g.fillStyle = '#ffffff'; g.fillRect(7, -1, L, 1);
      g.fillRect(7 + L, 0, 1, 1);
      if (d.swordGlow || p.chargeFull) { g.globalAlpha = 0.35 + Math.sin(W().t * 20) * 0.15; g.fillStyle = d.swordGlow || '#fff2a8'; g.fillRect(6, -3, L + 3, 6); g.globalAlpha = 1; }
      g.restore();
    } else if (p.state === 'bow') {
      const a = p.aim;
      g.save(); g.translate(hx, hy + 3); g.rotate(a);
      const pull = Math.min(1, p.bowT / (d.draw + 0.35));
      g.strokeStyle = '#8a5a30'; g.lineWidth = 2; g.beginPath(); g.arc(4, 0, 8, -1.2, 1.2); g.stroke();
      g.strokeStyle = '#e8e0cc'; g.lineWidth = 1; g.beginPath(); g.moveTo(4 + Math.cos(-1.2) * 8, Math.sin(-1.2) * 8); g.lineTo(4 - pull * 5, 0); g.lineTo(4 + Math.cos(1.2) * 8, Math.sin(1.2) * 8); g.stroke();
      g.fillStyle = '#e8e8f0'; g.fillRect(4 - pull * 5, -0.5, 14, 1);
      if (p.bowFull) { g.fillStyle = 'rgba(255,240,160,0.7)'; g.fillRect(14 - pull * 5, -1.5, 5, 3); }
      g.restore();
      // 조준선
      g.globalAlpha = 0.35; g.fillStyle = '#ffffff';
      for (let i = 2; i < 9; i++) g.fillRect(Math.round(hx + Math.cos(a) * i * 9), Math.round(hy + 3 + Math.sin(a) * i * 9), 1, 1);
      g.globalAlpha = 1;
    } else if (p.state === 'cast') {
      const sp = G.data.SPELLS[p.castSpell];
      g.globalAlpha = 0.6; g.fillStyle = sp ? sp.col : '#fff';
      g.beginPath(); g.arc(hx, hy - 8, 4 + Math.sin(W().t * 30) * 1.5, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    }
    if (p.hook) {
      const h = p.hook;
      g.strokeStyle = '#a8a8b8'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(hx, hy + 2); g.lineTo(Math.round(h.x - cx), Math.round(h.y - cy)); g.stroke();
      g.fillStyle = '#e8e8f0'; g.fillRect(Math.round(h.x - cx) - 2, Math.round(h.y - cy) - 2, 4, 4);
    }
    if (p.carry && p.carry.img) g.drawImage(p.carry.img, hx - p.carry.img.width / 2, hy - 14 - p.carry.img.height / 2);
    if (p.state === 'hold' && p.holdItem && G.ui.itemIcon) { const ic = G.ui.itemIcon(p.holdItem); const bob = Math.sin(W().t * 4); g.globalAlpha = 0.35; g.fillStyle = '#fff8c0'; g.beginPath(); g.arc(hx, hy - 20, 9 + bob, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.drawImage(ic, Math.round(hx - ic.width / 2), Math.round(hy - 20 - ic.height / 2 + bob)); }
  }

  /* ───────── 번개 줄기 · 매 프레임 ───────── */
  C.bolts = [];
  C.timers = [];
  C.marks = [];   // 떨어질 자리 표시 (유성 · 화살비 · 심판)
  /** 연출 시간표: sec 뒤에 fn (게임 시간 기준 — 멈춤 · 느림을 따른다) */
  function after(sec, fn) { C.timers.push({ t: sec, fn }); }
  function update(dt) {
    const p = W().player, s = S();
    if (!p) return;
    const d = G.st.derive(s);
    // MP · 체력 자연 회복, 치유 마법
    if (d.mpRegen) s.mp = Math.min(d.mpMax, s.mp + d.mpRegen * dt);
    if (p.healLeft > 0) { const k = Math.min(p.healLeft, dt * 4); p.healLeft -= k; s.hp = Math.min(d.hpMax, s.hp + k); }
    if (d.regen && p.state === 'idle') { p.regenT = (p.regenT || 0) + dt; if (p.regenT > 6) { p.regenT = 0; s.hp = Math.min(d.hpMax, s.hp + 1); } }
    if (p.counterT > 0) p.counterT -= dt;
    if (p.state !== 'roll') p.perfectDone = false;
    p.staminaMax = d.stamMax; p.rollCost = d.rollCost; p.rollIframes = d.rollIframes; p.stamRegenMul = d.stamRegen;
    if (p.frenzyT > 0) { p.frenzyT -= dt; if (Math.random() < dt * 14) G.fx.part({ x: p.x + (Math.random() - 0.5) * 10, y: p.y, z: Math.random() * 20, vz: 26, g: 0, life: 0.3, col: '#ff6a5a', size: 1, glow: true }); }
    p.moveT = p.state === 'walk' ? (p.moveT || 0) + dt : 0;
    if (C.timers.length) { for (const tm of C.timers) { tm.t -= dt; if (tm.t <= 0 && !tm.done) { tm.done = true; try { tm.fn(); } catch (e) { console.error(e); } } } C.timers = C.timers.filter((tm) => !tm.done); }
    p.swim = !!s.inv.flippers;
    for (const b of C.bolts) b.t += dt;
    for (const mk of C.marks) mk.t += dt;
    C.marks = C.marks.filter((mk) => mk.t < mk.life);
    C.bolts = C.bolts.filter((b) => b.t < 0.25);
  }
  /** 조준 표시: 주인공 둘레의 꺾쇠(겨눈 쪽) · 마우스 조준점 · 버튼을 끌 때 안내선 · 자동 조준이 잡은 적 */
  const WCOLA = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  function drawAim(g, cx, cy) {
    const p = W().player, s = S();
    if (!p || !s || p.state === 'dead' || G.script.running || (G.ui && G.ui.blocking && G.ui.blocking())) return;
    if (s.settings && s.settings.aimMark === false) return;
    const ex = explicitAim(p);
    const col = WCOLA[C.weapon ? C.weapon() : 'sword'] || '#ffffff';
    const ox = p.x - cx, oy = p.y - 9 - (p.jz || 0) - cy;
    let a = null, alpha = 0.75;
    if (ex) a = U.angle(ex.x, ex.y);
    else if (p.state === 'bow' && p.aim != null) a = p.aim;
    else if (p.aimT != null && p.t - p.aimT < 0.35 && p.aimA != null) { a = p.aimA; alpha = 0.75 * (1 - (p.t - p.aimT) / 0.35); }
    if (a != null) {
      const r = 17 + Math.sin(W().t * 6) * 0.8;
      const hx = ox + Math.cos(a) * r, hy = oy + Math.sin(a) * r * 0.85;
      g.save(); g.globalAlpha = alpha; g.translate(Math.round(hx), Math.round(hy)); g.rotate(a);
      g.fillStyle = 'rgba(10,8,20,0.6)'; g.beginPath(); g.moveTo(4, 0); g.lineTo(-3, -4); g.lineTo(-1, 0); g.lineTo(-3, 4); g.closePath(); g.fill();
      g.fillStyle = col; g.beginPath(); g.moveTo(3, 0); g.lineTo(-2, -3); g.lineTo(-0.5, 0); g.lineTo(-2, 3); g.closePath(); g.fill();
      g.restore();
    }
    // 휴대폰: 스킬 · 필살 버튼을 끄는 동안 — 어디로 나갈지 길게
    if (ex && ex.src === 'touch' && I.touchAim.on) {
      const L = I.touchAim.act === 'attack' ? 34 : 70;
      g.save(); g.globalAlpha = 0.55; g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([4, 3]); g.lineDashOffset = -W().t * 20;
      g.beginPath(); g.moveTo(ox + Math.cos(a) * 12, oy + Math.sin(a) * 10); g.lineTo(ox + Math.cos(a) * L, oy + Math.sin(a) * L * 0.85); g.stroke();
      g.setLineDash([]); g.globalAlpha = 0.35; g.beginPath(); g.ellipse(ox + Math.cos(a) * L, oy + Math.sin(a) * L * 0.85, 7, 4, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    // 마우스 조준점
    if (ex && ex.src === 'mouse') {
      const mx = Math.round(ex.wx - cx), my = Math.round(ex.wy - cy);
      g.save(); g.globalAlpha = 0.85; g.strokeStyle = 'rgba(10,8,20,0.7)'; g.lineWidth = 3;
      g.beginPath(); g.arc(mx + 0.5, my + 0.5, 4, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(mx + 0.5, my + 0.5, 4, 0, Math.PI * 2); g.stroke();
      g.fillStyle = col; g.fillRect(mx - 7, my, 3, 1); g.fillRect(mx + 5, my, 3, 1); g.fillRect(mx, my - 7, 1, 3); g.fillRect(mx, my + 5, 1, 3);
      g.restore();
    }
    // 자동 조준이 잡은 적: 발밑 꺾쇠 (활을 당기는 동안 · 막 겨눈 뒤)
    const t = p.aimSrc === 'auto' && p.aimTgt && !p.aimTgt.dead && (p.state === 'bow' || p.t - (p.aimT || -9) < 0.4) ? p.aimTgt : null;
    if (t) {
      const tx = Math.round(t.x - cx), ty = Math.round(t.y - cy), w2 = (t.r || 8) + 3;
      g.save(); g.globalAlpha = 0.7; g.strokeStyle = col; g.lineWidth = 1;
      for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(tx + sx * w2, ty - 3); g.lineTo(tx + sx * w2, ty + 1); g.lineTo(tx + sx * (w2 - 3), ty + 1); g.stroke(); }
      g.restore();
    }
  }
  function drawBolts(g, cx, cy) {
    for (const mk of C.marks) {
      const k = Math.min(1, mk.t / mk.life);
      g.globalAlpha = 0.25 + k * 0.45; g.strokeStyle = mk.col; g.lineWidth = 1;
      g.beginPath(); g.ellipse(Math.round(mk.x - cx), Math.round(mk.y - cy), mk.r * (1.4 - k * 0.4), mk.r * 0.5 * (1.4 - k * 0.4), 0, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 0.12 + k * 0.2; g.fillStyle = mk.col; g.fill(); g.globalAlpha = 1;
    }
    for (const b of C.bolts) {
      g.strokeStyle = b.t < 0.08 ? '#ffffff' : '#ffe066'; g.lineWidth = b.t < 0.1 ? 2 : 1;
      g.beginPath(); g.moveTo(b.x0 - cx, b.y0 - cy);
      const n = 6;
      for (let i = 1; i <= n; i++) { const k = i / n; g.lineTo(U.lerp(b.x0, b.x1, k) - cx + (i < n ? (Math.random() - 0.5) * 10 : 0), U.lerp(b.y0, b.y1, k) - cy + (i < n ? (Math.random() - 0.5) * 10 : 0)); }
      g.stroke();
    }
  }

  /* ───────── 작은 아이콘 (떨어진 것 · HUD) ───────── */
  function makeIcons() {
    const mk = (w, h, f) => { const b = X.brush(w, h); f(b); return X.outline(b.put()); };
    C.icons = {
      exp: mk(5, 5, (b) => { b.px(2, 0, '#ffffff'); b.rect(1, 1, 3, 3, '#fff6c8'); b.px(2, 4, '#ffffff'); b.px(0, 2, '#ffffff'); b.px(4, 2, '#ffffff'); b.px(2, 2, '#ffffff'); }),
      gold: mk(6, 7, (b) => { b.ellipse(3, 3.5, 3, 3.5, '#e8b83a'); b.rect(2, 1, 1, 5, '#fff0a8'); b.px(4, 5, '#a87a1a'); }),
      heart: mk(9, 8, (b) => { b.stamp(0, 0, [' rr rr ', 'rwrrrrr', 'rrrrrrr', ' rrrrr ', '  rrr  ', '   r   '], { r: '#ff4a6a', w: '#ffd0d8' }); }),
      mp: mk(6, 8, (b) => { b.stamp(0, 0, ['  b  ', ' bbb ', 'bwbbb', 'bbbbb', ' bbb '], { b: '#4a8aff', w: '#d8e8ff' }); }),
      arrow: mk(9, 4, (b) => { b.hline(1, 6, 2, '#8a5a30'); b.px(7, 1, '#e8e8f0'); b.px(8, 2, '#e8e8f0'); b.px(7, 3, '#e8e8f0'); b.px(0, 1, '#e8e0cc'); b.px(0, 3, '#e8e0cc'); }),
      bomb: mk(7, 8, (b) => { b.ellipse(3.5, 4.5, 3.5, 3.5, '#2a2a4a'); b.px(2, 3, '#6a6a9a'); b.px(4, 0, '#ffd84a'); b.px(4, 1, '#8a6a3a'); }),
      item: mk(7, 7, (b) => { b.rect(1, 1, 5, 5, '#c8a878'); b.px(2, 2, '#fff0c8'); b.hline(1, 5, 5, '#8a6a48'); }),
      key: mk(4, 8, (b) => { b.rect(0, 0, 4, 3, '#e8c850'); b.px(1, 1, '#2a2020'); b.vline(1, 3, 7, '#e8c850'); b.px(2, 5, '#e8c850'); b.px(2, 7, '#e8c850'); }),
    };
  }

  Object.assign(C, { drops, damage, kill, hurtPlayer, addSpecial, cutAt, shoot, Shot, Pickup, spawnPickup, explode, update, drawWeapon, drawBolts, drawAim, makeIcons, levelUp, freezeWater, foes, after, cutArc, startSpin, startBow, castMagic, castSpell, startSwing });
  C.hookLanding = hookLanding;
  C.actions = { attack: atk, bow, magic, tool, special, hook: hookAct, charge: atk, spin: atk, dash: atk, lift: atk, cast: atk, sp: atk };
  G.combat = C;
})();
