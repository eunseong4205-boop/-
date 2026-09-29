/* 전투: 렙업 버튼(또는 A)을 두드려 공격하고, B로 막는다.
   적은 머리 위에 다음 행동(의도)을 드러낸다 — 공격 · 강타 · 흡수 · 장막 · 저주.
   · 강타: 길게 모은 뒤 크게 친다. 모으는 동안 충분히 때리면 자세가 무너진다(경직).
   · 막기: 맞기 직전(0.22초 안)에 막으면 완벽 방어 → 피해 없음 + 반격 태세. 막는 동안엔 공격하지 못한다.
   · 장막: 탭 피해를 크게 줄이고, 기술은 두 배로 먹힌다. 깨뜨리면 잠시 비틀거린다.
   · 흡수는 적을 회복시키고, 저주는 잠시 물약을 봉인한다. 물약은 한 전투에 세 번까지.
   · 보스는 HP 30% 아래에서 격노한다: 더 빠르고 더 아프다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, E = G.engine;
  const $ = (id) => document.getElementById(id);
  const BG = {
    green: ['#9ad8ff', '#d8f4ff', '#5fbf4a', '#3f9a3a'], home: ['#9ad8ff', '#d8f4ff', '#5fbf4a', '#3f9a3a'], red: ['#ff9a6a', '#ffd8a8', '#c07a3e', '#9a5a2c'],
    mine: ['#1a1410', '#3a2c20', '#6a5640', '#4c3c2a'], cave: ['#10141e', '#243040', '#4a5a6a', '#3a4a5a'], blue: ['#6ab8f0', '#c8ecff', '#e8d6a8', '#c8b484'],
    yellow: ['#ffc86a', '#fff0c0', '#f0c860', '#d0a444'], purple: ['#3a2a6a', '#8a6ac0', '#6a4a9a', '#4c3278'], rainbow: ['#ffb8e8', '#b8e8ff', '#8ee07e', '#62bc5a'],
    cloud: ['#bfe4ff', '#ffffff', '#e8f4ff', '#c8dcf0'], white: ['#c8d6ea', '#f4f8ff', '#e8f0fa', '#c8d6ea'], gray: ['#6a6a70', '#a8a8a2', '#8a8a86', '#6a6a66'],
    black: ['#0b0a1c', '#2a2244', '#2c2644', '#1e1a32'], castle: ['#0b0a1c', '#3a2a4a', '#4a4460', '#383250'], colorful: ['#ff9ad8', '#ffe8a8', '#7ad86a', '#52b848'],
    space: ['#05040e', '#1a1640', '#5a6478', '#434b5c'], planet: ['#1a1030', '#6a4a2a', '#e8c860', '#c89a38'], interior: ['#3a2a1a', '#6a4a2a', '#c8905a', '#a8703e'],
  };

  /* 적의 의도: 모으는 시간(배수) · 피해 배수 */
  const INTENT = {
    strike: { name: '공격', c: '#e8a040', charge: 1, dmg: 1 },
    heavy: { name: '강타', c: '#ff3a4a', charge: 1.6, dmg: 2.6 },
    drain: { name: '흡수', c: '#c07aff', charge: 1.2, dmg: 0.8 },
    shield: { name: '장막', c: '#6ac8ff', charge: 0.9, dmg: 0 },
    hex: { name: '저주', c: '#8ae08a', charge: 1.3, dmg: 0.5 },
  };
  const ROLE_PAT = {
    n: { strike: 6, heavy: 2, drain: 1 },
    e: { strike: 5, heavy: 3, drain: 1, shield: 2 },
    b: { strike: 4, heavy: 3, drain: 2, shield: 2 },
    x: { strike: 4, heavy: 3, drain: 2, shield: 2, hex: 2 },
  };
  /* 이름난 적은 저마다 싸우는 버릇이 있다 */
  const PATTERN = {
    treant: { strike: 3, drain: 3, heavy: 2, hex: 1 },
    golem0: { strike: 4, heavy: 2, shield: 3 },
    rud1: { strike: 5, heavy: 3, shield: 1 },
    kraken: { strike: 3, drain: 3, heavy: 3 },
    goldie: { strike: 3, drain: 4, heavy: 2, shield: 1 },
    moonbeast: { strike: 3, heavy: 3, drain: 2, hex: 1 },
    edel: { strike: 3, heavy: 4, shield: 2 },
    lumie: { strike: 3, shield: 3, drain: 2, hex: 2 },
    voltmech: { strike: 3, heavy: 3, shield: 4 },
    nocturne: { strike: 2, drain: 3, hex: 3, heavy: 3 },
    herald: { strike: 2, drain: 4, hex: 2, heavy: 2 },
    kairon: { strike: 3, heavy: 5, shield: 2, drain: 1 },
    blacksun: { strike: 2, drain: 4, hex: 3, heavy: 3, shield: 1 },
    hollowking: { strike: 2, drain: 5, hex: 2, heavy: 2, shield: 2 },
  };
  const GUARD_WIN = 0.7, PERFECT = 0.22, GUARD_CD = 1.1;
  const potMax = () => B.opt.potMax || D.B.potMax;

  const B = {
    active: false, mon: null, phase: 'none', t: 0, enemyT: 0, floats: [], slashes: [], parts: [], opt: {}, resolve: null, result: null, hurtT: 0, lunge: 0,
  };

  function start(monId, opt) {
    const md = D.MON[monId];
    if (!md) return Promise.resolve(true);
    const s = G.state;
    opt = opt || {};
    if (!s.flags.tip_intent) {
      s.flags.tip_intent = true;
      return G.ui.say('sys', ['[y]전투의 기본[/]\n적의 머리 위에 [y]다음 행동[/]이 뜬다. 아래 막대가 차면 그 행동이 온다.\n렙업 버튼·A = 공격 · [y]B = 막기[/] (막는 동안엔 공격할 수 없다)',
        '[r]강타[/]는 길게 모았다가 크게 친다. 모으는 동안 몰아쳐 때리면 [y]자세가 무너진다[/].\n맞기 [y]직전[/]에 막으면 [y]완벽 방어[/] — 피해가 없고 반격 태세가 된다.',
        '[b]장막[/]은 탭이 잘 먹히지 않는다. 기술로 깨뜨리자. [p]흡수[/]는 적을 회복시키고, [g]저주[/]는 잠시 물약을 봉인한다.\n물약은 한 전투에 [y]3번[/]까지. 보스는 궁지에 몰리면 [r]격노[/]한다.']).then(() => start(monId, opt));
    }
    s.codex[monId] = s.codex[monId] || { k: 0 };
    const boss = md.role === 'b' || md.role === 'x' || opt.boss;
    const scale = opt.scale || (boss ? 4 : md.role === 'e' ? 3.5 : 3);
    const sprite = G.ui.monSprite(md);
    const white = mask(sprite, '#ffffff'), red = mask(sprite, '#ff2a3a');
    B.mon = { md, id: monId, hp: md.hp * (opt.hpMul || 1), max: md.hp * (opt.hpMul || 1), atk: md.atk * (opt.atkMul || 1), boss, scale, flash: 0, knock: 0, dead: 0, sprite, white, red, shield: 0 };
    B.opt = opt; B.phase = 'intro'; B.t = 0; B.floats = []; B.slashes = []; B.parts = []; B.result = null; B.hurtT = 0; B.lunge = 0; B.taps = 0;
    B.intent = 'strike'; B.last = null; B.charge = B.enemyT = (opt.firstDelay || 1.6); B.stag = 0; B.stunT = 0; B.enraged = false;
    B.guardAt = -9; B.guardCd = 0; B.perfectT = 0; B.counter = 0; B.potUsed = 0; B.hexT = 0;
    B.theme = opt.theme || (G.field.map && (G.field.map.battleBg || G.field.map.theme)) || 'green';
    B.supportT = opt.support ? (opt.supportFirst || 5) : 0; B.supportI = 0;
    B.active = true;
    G.field.busy = true; G.field.held = null;
    G.audio.sfx('encounter');
    G.audio.music(opt.music || (md.role === 'x' ? 'boss2' : boss ? 'boss' : 'battle'));
    $('bhud').hidden = false; $('place').hidden = true;
    $('bh-mname').textContent = md.name; $('bh-mlv').textContent = 'Lv ' + U.fmtInt(md.lv);
    $('lvup').classList.add('battle');
    $('lvup').querySelector('.lv-top').textContent = '공격!';
    drawCmds();
    return new Promise((res) => {
      B.resolve = res;
      B.layer = G.ui.push({ name: 'battle', lv: tap, a: tap, tap: (e) => { if (B.phase === 'end') finish(); else if (e && e.target && e.target.id === 'cv') tap(); }, b: guard, dir() {} });
    });
  }

  function drawCmds() {
    const s = G.state;
    const box = $('bh-cmd');
    let h = '<button class="bcmd run" data-b="run">' + (B.opt.noFlee || B.mon.boss ? '도망 불가' : '도망') + '</button>';
    h += '<button class="bcmd guard" data-b="guard"><span>◆ 막기 (B)</span><i class="cd"></i></button>';
    const pot = bestPotion(), left = potMax() - B.potUsed;
    h += '<button class="bcmd pot" data-b="pot"' + (pot && left > 0 ? '' : ' disabled') + '>♥ ' + (pot ? D.ITEMS[pot].name + ' ' + s.inv[pot] : '물약 없음') + ' <small>' + left + '/' + potMax() + '</small></button>';
    for (const sk of D.SKILLS) if (E.skillUnlocked(s, sk)) h += '<button class="bcmd" data-b="' + sk.id + '"><span>' + sk.icon + ' ' + sk.name + '</span><i class="cd"></i></button>';
    box.innerHTML = h;
    box.onclick = (e) => { const b = e.target.closest('[data-b]'); if (!b || B.phase !== 'fight') return; const k = b.dataset.b; if (k === 'run') flee(); else if (k === 'guard') guard(); else if (k === 'pot') potion(); else skill(k); };
  }
  function mask(sprite, color) {
    const c = document.createElement('canvas'); c.width = sprite.width; c.height = sprite.height;
    const g = c.getContext('2d'); g.drawImage(sprite, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  function bestPotion() { const s = G.state; let best = null; for (let i = 11; i >= 0; i--) if (s.inv['p' + i] > 0) { best = 'p' + i; break; } return best; }
  function potion() {
    if (B.phase !== 'fight') return;
    if (B.hexT > 0) { G.audio.sfx('buzz'); G.ui.toast('저주 때문에 병마개가 열리지 않는다!', 'bad'); return; }
    if (B.potUsed >= potMax()) { G.audio.sfx('buzz'); G.ui.toast('이번 전투에서는 더 마실 수 없다', 'bad'); return; }
    const id = bestPotion(); if (!id) { G.audio.sfx('buzz'); return; }
    E.usePotion(G.state, id); G.audio.sfx('heal'); B.potUsed++;
    addFloat('HP 회복', '#6ee7a8', 0.5, 0.78);
    drawCmds();
  }
  function skill(id) {
    const s = G.state, sk = D.SKILLS.find((k) => k.id === id);
    if (!E.useSkill(s, sk)) { G.audio.sfx('buzz'); return; }
    G.audio.sfx('skill');
    G.ui.flash(id === 'k_legend' ? '#ffe066' : id === 'k_flame' ? '#ff8a3a' : '#ffffff', 300);
    const d = E.derive(s);
    if (id === 'k_flame') hit(d.atk * 15, true, '괴짜의 불꽃!', 0, true);
    if (id === 'k_legend') hit(d.atk * 60, true, '전설의 일격!', 0, true);
    if (id === 'k_heal') { s.hp = Math.min(d.hpMax, s.hp + d.hpMax * 0.6); addFloat('기합! HP 회복', '#6ee7a8', 0.5, 0.78); }
    if (id === 'k_rush') addFloat('연타 폭발!', '#ffd84a', 0.5, 0.78);
    if (id === 'k_guard') addFloat('새싹 방패!', '#8ae08a', 0.5, 0.78);
    if (id === 'k_focus') addFloat('덕질 집중!', '#8ad8ff', 0.5, 0.78);
  }

  /** 막기: 0.7초 동안 자세를 잡는다. 그동안엔 공격하지 못한다. */
  function guard() {
    if (B.phase === 'end') { finish(); return; }
    if (B.phase !== 'fight') return;
    if (B.guardCd > 0) { G.audio.sfx('bump'); return; }
    B.guardAt = B.t; B.guardCd = GUARD_CD;
    G.audio.sfx('select');
  }
  const guarding = () => B.t - B.guardAt <= GUARD_WIN;

  function tap() {
    if (B.phase === 'end') { finish(); return; }
    if (B.phase !== 'fight') return;
    if (guarding()) B.guardAt = -9;   // 공격하면 자세가 풀린다
    const s = G.state, d = E.derive(s);
    B.taps++;
    // 탭 경험치: 그 자리 클릭의 30%
    const fever = E.registerClick(s);
    if (fever) { G.audio.sfx('fever'); G.ui.toast('피버! 8초 동안 모든 것이 두 배!', 'gold'); }
    const base = G.main.placeBase();
    const v = E.clickValue(s, base, G.main.spotMult(), d);
    const ex = v.exp * D.B.battleTapExp, gd = v.gold * D.B.battleTapExp;
    s.tot.taps++;
    G.main.gainExp(ex, false, d); E.addGold(s, gd);
    const counter = B.counter > 0;
    if (counter) B.counter--;
    for (let i = 0; i < d.taps; i++) {
      const crit = counter || Math.random() < d.crit;
      const dmg = d.atk * (0.9 + Math.random() * 0.2) * (crit ? d.critDmg : 1) * (counter ? 1.5 : 1);
      hit(dmg, crit, counter && i === 0 ? '반격!' : null, i);
    }
  }
  function hit(dmg, crit, label, i, isSkill) {
    const m = B.mon, s = G.state;
    if (!m || m.dead) return;
    dmg = U.fin(dmg);
    if (B.stunT > 0) dmg *= 1.5;
    if (m.shield > 0) {
      const k = isSkill ? 2 : 0.35, eff = dmg * k;
      if (eff < m.shield) {
        m.shield -= eff; m.flash = 0.06;
        G.audio.sfx('bump');
        addFloat((label ? label + ' ' : '') + U.fmt(eff), '#8ad8ff', 0.5 + (Math.random() - 0.5) * 0.3, 0.34, 8);
        return;
      }
      dmg = (eff - m.shield) / k; m.shield = 0;
      G.audio.sfx('explode'); G.ui.shake(160, 3);
      addFloat('장막 붕괴!', '#8ad8ff', 0.5, 0.24, 11);
      stun(1.2);
    }
    if (B.intent === 'heavy' && B.stunT <= 0 && B.phase === 'fight') {
      B.stag += dmg;
      if (B.stag >= m.max * (m.boss ? 0.1 : 0.3)) { addFloat('자세 붕괴!', '#ffe066', 0.5, 0.22, 12); G.audio.sfx('surprise'); G.ui.shake(220, 4); stun(2.2); }
    }
    m.hp -= dmg; m.flash = 0.12; m.knock = crit ? 6 : 3;
    if (dmg > s.tot.maxHit) s.tot.maxHit = dmg;
    G.audio.sfx(crit ? 'crit' : 'hit');
    const jx = 0.5 + (Math.random() - 0.5) * 0.3 + (i || 0) * 0.04, jy = 0.36 + (Math.random() - 0.5) * 0.14;
    addFloat((label ? label + ' ' : '') + U.fmt(dmg), crit ? '#ffe066' : '#ffffff', jx, jy, crit ? 11 : 8);
    B.slashes.push({ x: jx, y: jy + 0.04, life: 0.22, a: Math.random() * Math.PI, crit });
    if (crit) G.ui.shake(120, 2);
    if (m.hp <= 0) { m.hp = 0; win(); return; }
    if (m.boss && !B.enraged && m.hp < m.max * 0.3 && B.phase === 'fight') {
      B.enraged = true;
      G.audio.sfx('rumble'); G.ui.shake(400, 5); G.ui.flash('#ff2a3a', 250);
      addFloat('격노!', '#ff5a6a', 0.5, 0.16, 14);
      G.ui.toast(m.md.name + '이(가) 격노했다! 공격이 빨라지고 거세진다', 'bad');
    }
  }
  /** 경직: 적의 행동이 끊기고, 받는 피해가 1.5배 */
  function stun(sec) {
    B.stunT = Math.max(B.stunT, sec); B.stag = 0;
    B.intent = null;
  }
  function every() { return (B.opt.every || D.B.enemyEvery) * (B.mon.md.role === 'x' ? 0.85 : 1) * (B.enraged ? 0.75 : 1); }
  function nextIntent() {
    const m = B.mon;
    const pat = B.opt.pattern || PATTERN[m.id] || ROLE_PAT[m.md.role] || ROLE_PAT.n;
    let pool = Object.keys(pat).filter((k) => !(k === 'shield' && m.shield > 0) && !(k === 'hex' && B.hexT > 0) && !(k !== 'strike' && k === B.last));
    if (!pool.length) pool = ['strike'];
    const w = (k) => pat[k] * (B.enraged && k === 'heavy' ? 1.6 : 1);
    let r = Math.random() * pool.reduce((a, k) => a + w(k), 0), pick = pool[0];
    for (const k of pool) { r -= w(k); if (r <= 0) { pick = k; break; } }
    B.intent = B.last = pick; B.stag = 0;
    B.charge = B.enemyT = every() * INTENT[pick].charge;
  }
  function addFloat(text, color, fx, fy, size) { B.floats.push({ text, color, fx, fy, size: size || 8, life: 0.9 }); if (B.floats.length > 18) B.floats.shift(); }

  /** 먼 곳에서 빛이 닿는다: 회복 + 12초 공격력 두 배 */
  function support(sp) {
    const s = G.state, d = E.derive(s);
    s.hp = Math.min(d.hpMax, s.hp + d.hpMax * 0.35);
    s.buffs.push({ id: 'support', fx: { atk: 1, exp: 1 }, until: s.t + 12 });
    G.ui.toast(sp.text, 'white');
    G.ui.flash(sp.c || '#ffffff', 350);
    addFloat(sp.short || '빛이 닿았다!', sp.c || '#ffffff', 0.5, 0.18, 10);
    G.audio.sfx('white');
  }
  function enemyAttack() {
    const s = G.state, m = B.mon, k = B.intent || 'strike', it = INTENT[k];
    if (k === 'shield') {
      m.shield = m.max * (m.boss ? 0.12 : 0.25);
      G.audio.sfx('magic'); G.ui.flash('#6ac8ff', 200);
      addFloat('장막을 둘렀다', '#8ad8ff', 0.5, 0.2, 10);
      return;
    }
    const held = B.t - B.guardAt, perfect = held <= PERFECT, guarded = held <= GUARD_WIN;
    let dmg = E.enemyDamage(s, m.atk) * it.dmg * (B.enraged ? 1.25 : 1);
    B.lunge = 0.25;
    if (perfect) {
      dmg = 0; B.counter = 3; B.perfectT = 0.4; B.guardAt = -9;
      G.audio.sfx('orb'); G.ui.flash('#ffffff', 160);
      addFloat('완벽 방어! 반격 태세', '#ffe066', 0.5, 0.8, 10);
      if (k === 'heavy') { addFloat('받아쳤다!', '#ffe066', 0.5, 0.22, 12); stun(1.8); }
      return;
    }
    if (guarded) dmg *= k === 'heavy' ? 0.5 : 0.3;
    dmg = Math.max(1, Math.round(dmg));
    s.hp -= dmg;
    B.hurtT = guarded ? 0.12 : 0.3;
    G.audio.sfx(guarded ? 'bump' : 'hurt');
    G.ui.shake(guarded ? 100 : k === 'heavy' ? 320 : 200, guarded ? 2 : k === 'heavy' ? 7 : 4);
    addFloat((guarded ? '막음 -' : '-') + U.fmt(dmg), guarded ? '#c8d0e0' : '#ff6a7a', 0.5, 0.84, k === 'heavy' && !guarded ? 13 : 10);
    if (k === 'drain') {
      const heal = m.max * (m.boss ? 0.05 : 0.1) * (guarded ? 0.5 : 1);
      m.hp = Math.min(m.max, m.hp + heal);
      addFloat('+' + U.fmt(heal), '#d8a8ff', 0.5, 0.3, 9);
    }
    if (k === 'hex') { B.hexT = guarded ? 3.5 : 7; addFloat('저주: 물약 봉인', '#8ae08a', 0.5, 0.74, 9); G.audio.sfx('buzz'); }
    if (s.hp <= 0) { s.hp = 0; lose(); }
  }

  function win() {
    const s = G.state, m = B.mon, md = m.md;
    B.phase = 'dying'; m.dead = 0.001;
    G.audio.sfx('defeat');
    const r = E.killReward(s, md);
    const mult = B.opt.rewardMul == null ? 1 : B.opt.rewardMul;
    const ex = r.exp * mult, gd = r.gold * mult;
    s.tot.kills++; if (m.boss) s.tot.bossKills++;
    s.codex[md.id].k = (s.codex[md.id].k || 0) + 1;
    const lv0 = s.lv;
    G.main.gainExp(ex, false); E.addGold(s, gd);
    const up = s.lv - lv0;
    let drop = null;
    if (md.drop && md.drop[1] > 0 && Math.random() < md.drop[1] * (1 + (E.derive(s).lukF - 1) * 2)) { drop = md.drop[0]; E.give(s, drop, 1); }
    B.reward = { ex, gd, drop, up };
    for (let k = 0; k < 40; k++) B.parts.push({ x: 0.5, y: 0.36, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.8) * 0.9, c: U.pick(md.c), life: 0.6 + Math.random() * 0.6 });
    setTimeout(() => {
      if (!B.active) return;
      B.phase = 'end';
      G.audio.jingle(m.boss ? 'bosswin' : 'win');
      const rw = B.reward;
      if (rw.up) addFloat('레벨 업! Lv ' + U.fmtInt(G.state.lv), '#ffffff', 0.5, 0.42, 10);
      addFloat('경험치 +' + U.fmt(rw.ex), '#6ee7a8', 0.5, 0.5, 9);
      setTimeout(() => B.active && addFloat('골드 +' + U.fmt(rw.gd), '#ffd84a', 0.5, 0.58, 9), 180);
      if (rw.drop) setTimeout(() => B.active && addFloat(D.ITEMS[rw.drop].name + ' 획득!', '#ffb0e8', 0.5, 0.66, 9), 360);
      $('bh-cmd').innerHTML = '<button class="bcmd" data-b="ok" style="margin-left:auto">계속 (A)</button>';
      $('bh-cmd').onclick = () => finish();
      B.autoEnd = setTimeout(() => finish(), m.boss ? 6000 : 2600);
    }, 700);
  }
  function lose() {
    B.phase = 'lost';
    G.audio.music(null);
    G.audio.sfx('faint');
    G.ui.flash('#ff2a3a', 700);
    setTimeout(() => { B.result = false; end(); }, 1100);
  }
  function flee() {
    if (B.phase !== 'fight') return;
    if (B.opt.noFlee || B.mon.boss) { G.audio.sfx('buzz'); G.ui.toast('도망칠 수 없다!', 'bad'); return; }
    G.audio.sfx('run');
    B.result = 'flee';
    end();
  }
  function finish() { if (B.phase !== 'end') return; clearTimeout(B.autoEnd); B.result = true; end(); }
  function end() {
    const res = B.result;
    B.active = false; B.phase = 'none';
    G.ui.pop(B.layer);
    $('bhud').hidden = true; $('place').hidden = false;
    $('lvup').classList.remove('battle');
    $('lvup').querySelector('.lv-top').textContent = '렙업!';
    G.field.busy = G.script.running;
    const r = B.resolve; B.resolve = null;
    G.main.afterBattle(res === true ? 'win' : res === 'flee' ? 'flee' : 'lose', B.mon, B.opt).then(() => r(res === true));
  }

  function update(dt) {
    if (!B.active) return;
    B.t += dt;
    const m = B.mon;
    if (B.phase === 'intro' && B.t > 0.55) { B.phase = 'fight'; if (m.boss && !B.opt.noIntro) G.ui.banner(m.md.name, m.md.role === 'x' ? '강적' : '보스'); }
    if (B.phase === 'fight' && B.opt.support && B.supportI < B.opt.support.length) {
      B.supportT -= dt;
      if (B.supportT <= 0) { B.supportT = B.opt.supportEvery || 7; support(B.opt.support[B.supportI++]); }
    }
    if (B.phase === 'fight') {
      if (B.guardCd > 0) B.guardCd -= dt;
      if (B.perfectT > 0) B.perfectT -= dt;
      if (B.hexT > 0) B.hexT -= dt;
      if (B.stunT > 0) { B.stunT -= dt; if (B.stunT <= 0) nextIntent(); }
      else {
        B.enemyT -= dt;
        if (B.enemyT <= 0) { enemyAttack(); if (B.phase === 'fight') nextIntent(); }
      }
    }
    if (m.flash > 0) m.flash -= dt;
    if (m.knock > 0) m.knock = Math.max(0, m.knock - dt * 40);
    if (m.dead) m.dead += dt;
    if (B.lunge > 0) B.lunge -= dt;
    if (B.hurtT > 0) B.hurtT -= dt;
    for (let i = B.floats.length - 1; i >= 0; i--) { const f = B.floats[i]; f.life -= dt; f.fy -= dt * 0.08; if (f.life <= 0) B.floats.splice(i, 1); }
    for (let i = B.slashes.length - 1; i >= 0; i--) { B.slashes[i].life -= dt; if (B.slashes[i].life <= 0) B.slashes.splice(i, 1); }
    for (let i = B.parts.length - 1; i >= 0; i--) { const p = B.parts[i]; p.life -= dt; p.vy += dt * 1.2; p.x += p.vx * dt * 0.5; p.y += p.vy * dt * 0.5; if (p.life <= 0) B.parts.splice(i, 1); }
    // HUD
    const f = Math.max(0, m.hp / m.max);
    $('bh-mhp-f').style.width = (f * 100).toFixed(1) + '%';
    $('bh-mhp-t').textContent = U.fmt(Math.ceil(m.hp)) + ' / ' + U.fmt(m.max) + (m.shield > 0 ? '  ◇' + U.fmt(Math.ceil(m.shield)) : '');
    $('bh-mshd').style.width = Math.min(100, m.shield / m.max * 100 * 3).toFixed(1) + '%';
    const st = [];
    if (B.enraged) st.push('<b class="rg">격노</b>');
    if (B.stunT > 0) st.push('<b class="sn">경직 ' + B.stunT.toFixed(1) + '</b>');
    if (B.counter > 0) st.push('<b class="ct">반격 ×' + B.counter + '</b>');
    if (B.hexT > 0) st.push('<b class="hx">물약 봉인 ' + Math.ceil(B.hexT) + '</b>');
    const sh = st.join('');
    if (sh !== B.stHtml) { $('bh-st').innerHTML = sh; B.stHtml = sh; }
    const gb = document.querySelector('#bh-cmd [data-b="guard"]');
    if (gb) { gb.classList.toggle('on', guarding()); const bar = gb.querySelector('.cd'); if (bar) bar.style.width = (B.guardCd > 0 ? (1 - B.guardCd / GUARD_CD) * 100 : 100) + '%'; }
    const pb = document.querySelector('#bh-cmd [data-b="pot"]');
    if (pb) pb.disabled = B.phase !== 'fight' || B.hexT > 0 || B.potUsed >= potMax() || !bestPotion();
    const s = G.state;
    document.querySelectorAll('#bh-cmd [data-b^="k_"]').forEach((b) => {
      const sk = D.SKILLS.find((k) => k.id === b.dataset.b); const c = s.cd[sk.id];
      const left = c ? Math.max(0, c.ready - s.t) : 0;
      b.disabled = left > 0;
      const bar = b.querySelector('.cd'); if (bar) bar.style.width = (left > 0 ? (1 - left / sk.cd) * 100 : 100) + '%';
    });
  }

  function render(g, W, H) {
    const m = B.mon;
    const P = BG[B.theme] || BG.green;
    const hz = Math.round(H * 0.56);
    let gr = g.createLinearGradient(0, 0, 0, hz);
    gr.addColorStop(0, P[0]); gr.addColorStop(1, P[1]);
    g.fillStyle = gr; g.fillRect(0, 0, W, hz);
    // 먼 산 실루엣
    g.fillStyle = U.shade(P[3], 0.8);
    for (let x = 0; x < W; x += 2) { const h = 10 + Math.sin(x * 0.045 + 1) * 7 + Math.sin(x * 0.13) * 3; g.fillRect(x, hz - h, 2, h); }
    gr = g.createLinearGradient(0, hz, 0, H);
    gr.addColorStop(0, P[2]); gr.addColorStop(1, P[3]);
    g.fillStyle = gr; g.fillRect(0, hz, W, H - hz);
    if (B.theme === 'space' || B.theme === 'black' || B.theme === 'planet' || B.theme === 'castle') { g.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) { const x = (i * 73.3) % W, y = (i * 37.7) % (hz - 10); if ((i + Math.floor(B.t * 2)) % 7) g.fillRect(Math.round(x), Math.round(y), 1, 1); } }
    // 발판
    const cx = W / 2, cy = Math.round(Math.min(H * 0.4, 36 + 32 * m.scale * 0.62));
    const sw = 32 * m.scale;
    g.fillStyle = 'rgba(0,0,0,0.22)';
    g.beginPath(); g.ellipse(cx, cy + sw * 0.45, sw * 0.55, sw * 0.12, 0, 0, Math.PI * 2); g.fill();
    // 몬스터
    if (!m.dead || m.dead < 0.6) {
      const bob = Math.round(Math.sin(B.t * 3) * 2);
      const lunge = B.lunge > 0 ? Math.sin((B.lunge / 0.25) * Math.PI) * 10 : 0;
      const img = m.sprite;
      const w = img.width * m.scale, h = img.height * m.scale;
      g.save();
      g.imageSmoothingEnabled = false;
      if (m.dead) g.globalAlpha = Math.max(0, 1 - m.dead / 0.6);
      const x = Math.round(cx - w / 2 + (m.knock ? (Math.random() - 0.5) * m.knock : 0)), y = Math.round(cy - h / 2 + bob + lunge - m.knock * 0.3);
      g.drawImage(img, x, y, w, h);
      if (B.enraged && !m.dead) { g.globalAlpha = 0.18 + Math.abs(Math.sin(B.t * 5)) * 0.22; g.drawImage(m.red, x, y, w, h); }
      if (m.flash > 0) { g.globalAlpha = 0.75; g.drawImage(m.white, x, y, w, h); }
      g.restore();
      // 장막
      if (m.shield > 0 && !m.dead) {
        g.save(); g.strokeStyle = 'rgba(138,216,255,' + (0.55 + Math.sin(B.t * 6) * 0.2).toFixed(2) + ')'; g.lineWidth = 2;
        g.fillStyle = 'rgba(106,200,255,0.10)';
        g.beginPath(); g.ellipse(cx, cy, w * 0.62, h * 0.62, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        g.restore();
      }
      // 경직: 머리 위를 도는 별
      if (B.stunT > 0 && !m.dead) {
        g.fillStyle = '#ffe066';
        for (let k = 0; k < 3; k++) { const a = B.t * 5 + k * 2.1; g.fillRect(Math.round(cx + Math.cos(a) * w * 0.3), Math.round(y - 4 + Math.sin(a) * 3), 2, 2); }
      }
    }
    // 적의 의도와 게이지
    if (B.phase === 'fight' && !m.dead) {
      const bw = 64, bx = Math.round(cx - bw / 2), by = Math.round(cy + sw * 0.62);
      g.fillStyle = '#16101f'; g.fillRect(bx - 1, by - 1, bw + 2, 5);
      if (B.stunT > 0) {
        g.fillStyle = '#ffe066'; g.fillRect(bx, by, Math.round(bw * Math.min(1, B.stunT / 2.2)), 3);
        pill(g, cx, by + 6, '경직', '#ffe066');
      } else if (B.intent) {
        const it = INTENT[B.intent], f = 1 - Math.max(0, B.enemyT) / B.charge;
        const warn = f > 1 - PERFECT / B.charge * 1.4;
        g.fillStyle = warn && Math.floor(B.t * 16) % 2 ? '#ffffff' : it.c; g.fillRect(bx, by, Math.round(bw * f), 3);
        pill(g, cx, by + 6, it.name + (B.intent === 'heavy' ? '!' : ''), it.c);
        if (B.intent === 'heavy') {
          const need = m.max * (m.boss ? 0.1 : 0.3), sf = Math.min(1, B.stag / need);
          g.fillStyle = '#16101f'; g.fillRect(bx - 1, by + 21, bw + 2, 4);
          g.fillStyle = '#ffffff'; g.fillRect(bx, by + 22, Math.round(bw * sf), 2);
        }
      }
    }
    // 막는 자세
    if (B.phase === 'fight' && (guarding() || B.perfectT > 0)) {
      const pf = B.perfectT > 0;
      g.save(); g.strokeStyle = pf ? '#ffe066' : 'rgba(200,220,255,0.85)'; g.lineWidth = pf ? 4 : 3;
      g.beginPath(); g.arc(W / 2, H + 18, W * 0.42, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      g.restore();
    }
    // 베기 효과
    for (const sl of B.slashes) {
      const x = sl.x * W, y = sl.y * H;
      const L = (sl.crit ? 26 : 18) * (sl.life / 0.22);
      g.strokeStyle = sl.crit ? '#ffe066' : '#ffffff'; g.lineWidth = sl.crit ? 3 : 2;
      g.beginPath(); g.moveTo(x - Math.cos(sl.a) * L, y - Math.sin(sl.a) * L); g.lineTo(x + Math.cos(sl.a) * L, y + Math.sin(sl.a) * L); g.stroke();
    }
    for (const p of B.parts) { g.fillStyle = p.c; g.fillRect(Math.round(p.x * W), Math.round(p.y * H), 2, 2); }
    // 떠오르는 숫자
    g.textAlign = 'center';
    for (const f of B.floats) {
      g.globalAlpha = Math.min(1, f.life / 0.35);
      g.font = f.size + "px 'Galmuri11', monospace";
      const x = Math.round(f.fx * W), y = Math.round(f.fy * H);
      g.fillStyle = '#16101f'; g.fillText(f.text, x + 1, y + 1); g.fillText(f.text, x - 1, y + 1); g.fillText(f.text, x, y + 2);
      g.fillStyle = f.color; g.fillText(f.text, x, y);
    }
    g.globalAlpha = 1; g.textAlign = 'left';
    // 맞았을 때 붉은 테두리
    if (B.hurtT > 0) { g.fillStyle = 'rgba(255,40,60,' + (B.hurtT * 0.9).toFixed(2) + ')'; g.fillRect(0, 0, W, 3); g.fillRect(0, H - 3, W, 3); g.fillRect(0, 0, 3, H); g.fillRect(W - 3, 0, 3, H); }
    // 시작 연출
    if (B.phase === 'intro') {
      const f = B.t / 0.55;
      g.fillStyle = '#000';
      const bars = 8;
      for (let i = 0; i < bars; i++) { const bh = H / bars; const cover = Math.max(0, 1 - f * 1.4 + (i % 2) * 0.15); g.fillRect(i % 2 ? W - W * cover : 0, i * bh, W * cover, bh + 1); }
      if (f < 0.25) { g.fillStyle = 'rgba(255,255,255,' + (1 - f * 4).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
    }
  }

  function pill(g, x, y, text, c) {
    g.font = "8px 'Galmuri11', monospace";
    const tw = Math.ceil(g.measureText(text).width) + 10, px = Math.round(x - tw / 2), py = Math.round(y);
    g.fillStyle = 'rgba(12,9,22,0.88)'; g.fillRect(px, py, tw, 13);
    g.fillStyle = c; g.fillRect(px, py, 2, 13); g.fillRect(px + tw - 2, py, 2, 13);
    g.textAlign = 'center'; g.fillText(text, Math.round(x), py + 10); g.textAlign = 'left';
  }

  Object.assign(B, { start, update, render, tap, flee, guard, potion, skill, INTENT });
  G.battle = B;
})();
