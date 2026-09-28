/* 전투: 렙업 버튼(또는 A)을 두드려 공격한다. 적은 2초마다 반격한다. */
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

  const B = {
    active: false, mon: null, phase: 'none', t: 0, enemyT: 0, floats: [], slashes: [], parts: [], opt: {}, resolve: null, result: null, hurtT: 0, lunge: 0,
  };

  function start(monId, opt) {
    const md = D.MON[monId];
    if (!md) return Promise.resolve(true);
    const s = G.state;
    opt = opt || {};
    s.codex[monId] = s.codex[monId] || { k: 0 };
    const boss = md.role === 'b' || md.role === 'x' || opt.boss;
    const scale = opt.scale || (boss ? 4 : md.role === 'e' ? 3.5 : 3);
    const sprite = G.ui.monSprite(md);
    const white = document.createElement('canvas'); white.width = sprite.width; white.height = sprite.height;
    { const wg = white.getContext('2d'); wg.drawImage(sprite, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = '#ffffff'; wg.fillRect(0, 0, white.width, white.height); }
    B.mon = { md, id: monId, hp: md.hp * (opt.hpMul || 1), max: md.hp * (opt.hpMul || 1), atk: md.atk * (opt.atkMul || 1), boss, scale, flash: 0, knock: 0, dead: 0, sprite, white };
    B.opt = opt; B.phase = 'intro'; B.t = 0; B.enemyT = (opt.firstDelay || 1.6); B.floats = []; B.slashes = []; B.parts = []; B.result = null; B.hurtT = 0; B.lunge = 0; B.taps = 0;
    B.theme = opt.theme || (G.field.map && (G.field.map.battleBg || G.field.map.theme)) || 'green';
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
      B.layer = G.ui.push({ name: 'battle', lv: tap, a: tap, tap: (e) => { if (B.phase === 'end') finish(); else if (e && e.target && e.target.id === 'cv') tap(); }, b: flee, dir() {} });
    });
  }

  function drawCmds() {
    const s = G.state;
    const box = $('bh-cmd');
    let h = '<button class="bcmd run" data-b="run">' + (B.opt.noFlee || B.mon.boss ? '도망 불가' : '도망 (B)') + '</button>';
    const pot = bestPotion();
    h += '<button class="bcmd" data-b="pot"' + (pot ? '' : ' disabled') + '>♥ ' + (pot ? D.ITEMS[pot].name + ' ' + s.inv[pot] : '물약 없음') + '</button>';
    for (const sk of D.SKILLS) if (E.skillUnlocked(s, sk)) h += '<button class="bcmd" data-b="' + sk.id + '"><span>' + sk.icon + ' ' + sk.name + '</span><i class="cd"></i></button>';
    box.innerHTML = h;
    box.onclick = (e) => { const b = e.target.closest('[data-b]'); if (!b || B.phase !== 'fight') return; const k = b.dataset.b; if (k === 'run') flee(); else if (k === 'pot') potion(); else skill(k); };
  }
  function bestPotion() { const s = G.state; let best = null; for (let i = 11; i >= 0; i--) if (s.inv['p' + i] > 0) { best = 'p' + i; break; } return best; }
  function potion() {
    const id = bestPotion(); if (!id) { G.audio.sfx('buzz'); return; }
    E.usePotion(G.state, id); G.audio.sfx('heal');
    addFloat('HP 회복', '#6ee7a8', 0.5, 0.78);
    drawCmds();
  }
  function skill(id) {
    const s = G.state, sk = D.SKILLS.find((k) => k.id === id);
    if (!E.useSkill(s, sk)) { G.audio.sfx('buzz'); return; }
    G.audio.sfx('skill');
    G.ui.flash(id === 'k_legend' ? '#ffe066' : id === 'k_flame' ? '#ff8a3a' : '#ffffff', 300);
    const d = E.derive(s);
    if (id === 'k_flame') hit(d.atk * 25, true, '괴짜의 불꽃!');
    if (id === 'k_legend') hit(d.atk * 200, true, '전설의 일격!');
    if (id === 'k_heal') { s.hp = Math.min(d.hpMax, s.hp + d.hpMax * 0.6); addFloat('기합! HP 회복', '#6ee7a8', 0.5, 0.78); }
    if (id === 'k_rush') addFloat('연타 폭발!', '#ffd84a', 0.5, 0.78);
    if (id === 'k_guard') addFloat('새싹 방패!', '#8ae08a', 0.5, 0.78);
    if (id === 'k_focus') addFloat('덕질 집중!', '#8ad8ff', 0.5, 0.78);
  }

  function tap() {
    if (B.phase === 'end') { finish(); return; }
    if (B.phase !== 'fight') return;
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
    for (let i = 0; i < d.taps; i++) {
      const crit = Math.random() < d.crit;
      const dmg = d.atk * (0.9 + Math.random() * 0.2) * (crit ? d.critDmg : 1);
      hit(dmg, crit, null, i);
    }
  }
  function hit(dmg, crit, label, i) {
    const m = B.mon, s = G.state;
    if (!m || m.dead) return;
    dmg = U.fin(dmg);
    m.hp -= dmg; m.flash = 0.12; m.knock = crit ? 6 : 3;
    if (dmg > s.tot.maxHit) s.tot.maxHit = dmg;
    G.audio.sfx(crit ? 'crit' : 'hit');
    const jx = 0.5 + (Math.random() - 0.5) * 0.3 + (i || 0) * 0.04, jy = 0.36 + (Math.random() - 0.5) * 0.14;
    addFloat((label ? label + ' ' : '') + U.fmt(dmg), crit ? '#ffe066' : '#ffffff', jx, jy, crit ? 11 : 8);
    B.slashes.push({ x: jx, y: jy + 0.04, life: 0.22, a: Math.random() * Math.PI, crit });
    if (crit) G.ui.shake(120, 2);
    if (m.hp <= 0) { m.hp = 0; win(); }
  }
  function addFloat(text, color, fx, fy, size) { B.floats.push({ text, color, fx, fy, size: size || 8, life: 0.9 }); if (B.floats.length > 18) B.floats.shift(); }

  function enemyAttack() {
    const s = G.state, m = B.mon;
    const dmg = E.enemyDamage(s, m.atk);
    s.hp -= dmg;
    B.lunge = 0.25; B.hurtT = 0.3;
    G.audio.sfx('hurt');
    G.ui.shake(200, 4);
    addFloat('-' + U.fmt(dmg), '#ff6a7a', 0.5, 0.84, 10);
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
    if (B.phase === 'fight') {
      B.enemyT -= dt;
      if (B.enemyT <= 0) { B.enemyT = (B.opt.every || D.B.enemyEvery) * (m.md.role === 'x' ? 0.85 : 1); enemyAttack(); }
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
    $('bh-mhp-t').textContent = U.fmt(Math.ceil(m.hp)) + ' / ' + U.fmt(m.max);
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
      if (m.flash > 0) { g.globalAlpha = 0.75; g.drawImage(m.white, x, y, w, h); }
      g.restore();
    }
    // 적 공격 게이지
    if (B.phase === 'fight') {
      const every = (B.opt.every || D.B.enemyEvery) * (m.md.role === 'x' ? 0.85 : 1);
      const f = 1 - Math.max(0, B.enemyT) / every;
      const bw = 60, bx = Math.round(cx - bw / 2), by = Math.round(cy + sw * 0.62);
      g.fillStyle = '#16101f'; g.fillRect(bx - 1, by - 1, bw + 2, 5);
      g.fillStyle = f > 0.8 ? '#ff5a6a' : '#e8a040'; g.fillRect(bx, by, Math.round(bw * f), 3);
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

  Object.assign(B, { start, update, render, tap, flee, potion, skill });
  G.battle = B;
})();
