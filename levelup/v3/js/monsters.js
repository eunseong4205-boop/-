/* 더 많은 적 · 정예
   새 적 열넷: 독거미(거미줄로 느리게) · 모래 전갈(꼬리 독침) · 해골 병사(뼈 던지기, 한 번 다시 일어남) · 떠도는 눈(휘두르는 광선)
   · 폭발 버섯(달려와 터짐) · 어둠 망령(빛 밖에선 보이지 않음, 벽을 지남) · 미궁의 파수꾼(단단한 몸, 벽에 부딪혀야 틈)
   · 수정 골렘(내려친 뒤 파편 여덟) · 창기병(긴 찌르기 돌진) · 그림자 자객(사라졌다 등 뒤에서 세 번) · 광신 사제(동료 치유 · 보호, 빛기둥)
   · 사령술사(졸개 부르기, 구슬 고리) · 강철 저격수(조준선 뒤 한 방) · 광전사(회전 베기, 궁지에 몰리면 광폭)
   정예: 몇몇 적은 특성(분노 · 보호막 · 흡혈 · 분열 · 자폭 · 신속 · 서리 · 순간이동 · 부름 · 재생)을 달고 나온다. 더 세고, 더 많이 떨군다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles;
  const TS = TL.TS;
  const F = G.foes;
  const { T, ART, FRAME, INIT, FLIP, AI } = F;
  const W = () => G.world;
  const C = () => G.combat;
  const B = () => G.bosses;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const R = (col) => X.ramp(col, 5);
  const EYE = '#140c1c';

  /* ───────── 종류 ───────── */
  Object.assign(T, {
    spider: { name: '독거미', hp: 9, atk: 3, speed: 58, r: 7, h: 10, exp: 9, gold: 3, weight: 0.8, ai: 'spider', col: '#5a4a6a', mat: 'm_silk' },
    scorp: { name: '모래 전갈', hp: 15, atk: 4, speed: 40, r: 9, h: 12, exp: 13, gold: 6, weight: 2, ai: 'scorp', guardFront: true, weak: ['ice'], col: '#c88a3a', mat: 'm_shell' },
    skel: { name: '해골 병사', hp: 12, atk: 4, speed: 36, r: 7, h: 22, exp: 13, gold: 4, weight: 1.1, ai: 'skel', human: true, undead: true, weak: ['light', 'bomb'], col: '#d8d0c0', mat: 'm_bone',
      look: { hair: 'bald', hc: '#e8e0d0', skin: 'ash', eye: '#ff5a3a', eyeShape: 'sharp', top: 'armor', tc: '#6a6058', trim: '#4a4038', bottom: 'pants', bc: '#3a342e', hat: 'helm', hatC: '#7a7066' } },
    eye: { name: '떠도는 눈', hp: 13, atk: 4, speed: 34, r: 8, h: 14, exp: 16, gold: 6, weight: 1, ai: 'eye', fly: true, weak: ['bolt'], col: '#d85a7a', mat: 'm_lens' },
    shroom: { name: '폭발 버섯', hp: 6, atk: 5, speed: 62, r: 6, h: 12, exp: 7, gold: 2, weight: 0.7, ai: 'shroom', weak: ['fire'], col: '#e85a4a', mat: 'm_spore' },
    wraith: { name: '어둠 망령', hp: 14, atk: 4, speed: 44, r: 7, h: 16, exp: 18, gold: 0, weight: 0.5, ai: 'wraith', fly: true, undead: true, dark: true, weak: ['light', 'fire'], col: '#3a2a5a', mat: 'm_dust' },
    mino: { name: '미궁의 파수꾼', hp: 70, atk: 7, speed: 30, r: 13, h: 30, exp: 90, gold: 40, weight: 8, ai: 'mino', big: true, col: '#8a5a4a', mat: 'm_horn' },
    cgolem: { name: '수정 골렘', hp: 38, atk: 6, speed: 22, r: 12, h: 26, exp: 40, gold: 18, weight: 5, ai: 'cgolem', weak: ['bomb'], resist: ['ice'], col: '#8ad8ff', big: true, mat: 'm_stone' },
    lancer: { name: '창기병', hp: 16, atk: 5, speed: 42, r: 8, h: 22, exp: 18, gold: 10, weight: 1.8, ai: 'lancer', human: true, shield: true, col: '#8a9ab8', mat: 'm_ore',
      look: { hair: 'short', hc: '#2a2a3a', top: 'armor', tc: '#5a6a8a', trim: '#d8d8e8', bottom: 'pants', bc: '#3a3a4a', hat: 'helm', hatC: '#8a9ab8', cape: '#2a4a8a', eyeShape: 'sharp', build: 'broad' } },
    assassin: { name: '그림자 자객', hp: 12, atk: 5, speed: 70, r: 7, h: 22, exp: 20, gold: 12, weight: 0.8, ai: 'assassin', human: true, dark: true, weak: ['light'], col: '#4a3a6a', mat: 'm_cloth',
      look: { gender: 'girl', hair: 'pony', hc: '#1a1626', top: 'vest', tc: '#2a2238', bottom: 'pants', bc: '#1a1626', hat: 'hood', hatC: '#2a2238', mask: true, eye: '#d85aff', eyeShape: 'sharp', skin: 'pale' } },
    priest: { name: '광신 사제', hp: 14, atk: 4, speed: 30, r: 7, h: 22, exp: 18, gold: 12, weight: 1, ai: 'priest', human: true, col: '#f0e0a0', mat: 'm_cloth',
      look: { hair: 'long', hc: '#e8e0c8', top: 'robe', tc: '#f4ecd8', trim: '#e8c048', bottom: 'robe', hat: 'hood', hatC: '#e8dcc0', eye: '#e8c048', eyeShape: 'sleepy' } },
    summoner: { name: '사령술사', hp: 15, atk: 4, speed: 28, r: 7, h: 22, exp: 22, gold: 14, weight: 1, ai: 'summoner', human: true, col: '#6a5a9a', mat: 'm_dust',
      look: { hair: 'long', hc: '#c8c8d8', skin: 'pale', top: 'robe', tc: '#2a2238', trim: '#8a5ad8', bottom: 'robe', hat: 'hood', hatC: '#1a1626', eye: '#8ad8ff', eyeShape: 'sleepy' } },
    sniper: { name: '강철 저격수', hp: 12, atk: 6, speed: 36, r: 7, h: 22, exp: 20, gold: 14, weight: 1, ai: 'sniper', human: true, weak: ['bolt'], col: '#9aa8b8', mat: 'm_gear',
      look: { hair: 'short', hc: '#3a3a44', top: 'coat', tc: '#4a5a6a', trim: '#ff5a5a', bottom: 'pants', bc: '#2a2a34', hat: 'helm', hatC: '#6a7a8a', eye: '#ff5a5a', eyeShape: 'sharp', acc: ['quiver'] } },
    berserk: { name: '광전사', hp: 22, atk: 5, speed: 44, r: 8, h: 22, exp: 22, gold: 10, weight: 2, ai: 'berserk', human: true, col: '#c84a3a', mat: 'm_hide',
      look: { hair: 'spiky', hc: '#c8402a', beard: '#c8402a', skin: 'tan', top: 'vest', tc: '#6a3a22', bottom: 'pants', bc: '#3a2a1a', eye: '#ff8a3a', eyeShape: 'sharp', build: 'broad', scar: true } },
  });
  // 새 재료 (가게에서 팔 수 있다)
  const D = G.data;
  const mat = (id, name, price, desc) => { if (!D.ITEMS[id]) D.ITEMS[id] = { id, type: 'mat', name, price, desc }; };
  mat('m_silk', '거미줄 뭉치', 40, '끈적하고 질기다. 활시위로 좋다.');
  mat('m_bone', '오래된 뼈', 35, '두드리면 먼 데서 누가 대답한다.');
  mat('m_lens', '눈의 수정체', 90, '떠도는 눈에서 떨어진 맑은 알. 아직 무언가를 본다.');
  mat('m_spore', '폭발 포자', 50, '조심히 들면 폭탄이 되고, 흔들면 내가 폭탄이 된다.');
  mat('m_horn', '파수꾼의 뿔', 400, '미궁의 파수꾼이 부러뜨린 뿔. 대장장이들이 탐낸다.');

  /* ───────── 그림 ───────── */
  Object.assign(ART, {
    spider(f, col) {
      const b = X.brush(18, 12), r = R(col);
      const k = f % 2;
      for (let i = 0; i < 4; i++) { const lx = 5 + i * 2.6, ly = 6 + (i % 2 === k ? 0 : 1); b.line(Math.round(lx), 6, Math.round(lx - 4 + i * 0.3), Math.round(ly + 4), r[0]); b.line(Math.round(18 - lx), 6, Math.round(18 - lx + 4 - i * 0.3), Math.round(ly + 4 - (i % 2 === k ? 1 : 0)), r[0]); }
      b.ellipse(9, 7, 4.5, 3.4, r[1]); b.ellipse(9, 6.3, 3.6, 2.6, r[2]); b.ellipse(8, 5.4, 1.8, 1, r[3]);
      b.ellipse(9, 3.8, 2.6, 2, r[1]);
      b.px(8, 3, '#ff3a3a'); b.px(10, 3, '#ff3a3a'); b.px(7, 4, '#ff8a8a'); b.px(11, 4, '#ff8a8a');
      b.hline(7, 11, 8, '#e8d84a');
      return b.put();
    },
    scorp(f, col) {
      const b = X.brush(22, 18), r = R(col);
      const sting = f === 2;
      for (let i = 0; i < 3; i++) { b.line(8 + i * 2, 13, 5 + i * 2, 16, r[0]); b.line(13 + i * 2, 13, 16 + i * 2, 16, r[0]); }
      b.ellipse(11, 13, 6, 3, r[1]); b.ellipse(11, 12.4, 5, 2.2, r[2]);
      b.ellipse(3, 11, 2.4, 1.8, r[2]); b.ellipse(19, 11, 2.4, 1.8, r[2]); b.px(2, 10, r[4]); b.px(20, 10, r[4]);
      b.line(6, 12, 4, 11, r[1]); b.line(16, 12, 18, 11, r[1]);
      const tail = sting ? [[11, 10], [12, 7], [13, 5], [12, 3], [10, 2]] : [[11, 10], [12, 7], [14, 5], [15, 3], [14, 1]];
      for (const [x, y] of tail) b.ellipse(x, y, 1.6, 1.4, r[1]);
      const [tx, ty] = tail[tail.length - 1]; b.px(tx - 1, ty, '#ff5a3a'); b.px(tx - 2, ty + 1, '#ff5a3a');
      b.px(9, 11, EYE); b.px(13, 11, EYE);
      return b.put();
    },
    eye(f, col) {
      const b = X.brush(18, 18), r = R(col);
      const blink = f === 3;
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + f * 0.3; b.line(9, 9, Math.round(9 + Math.cos(a) * 8), Math.round(9 + Math.sin(a) * 8), r[1]); }
      b.ellipse(9, 9, 6.5, 6.5, r[0]);
      if (blink) { b.ellipse(9, 9, 5.5, 1.2, r[2]); return b.put(); }
      b.ellipse(9, 9, 5.5, 5.5, '#f4eef8'); b.line(4, 7, 6, 8, '#e8a0b0'); b.line(13, 12, 11, 10, '#e8a0b0');
      const ox = f === 2 ? 0 : f === 1 ? 1 : -1;
      b.ellipse(9 + ox, 9, 3, 3, r[3]); b.ellipse(9 + ox, 9, 1.6, 1.6, EYE); b.px(8 + ox, 7, '#ffffff');
      return b.put();
    },
    shroom(f, col) {
      const b = X.brush(16, 16), r = R(col);
      const big = f >= 2 ? 1 : 0;
      b.rect(6, 9, 4, 6, '#e8dcc8'); b.rect(6, 9, 1, 6, '#c8b8a0');
      b.ellipse(8, 7, 6 + big, 4.4 + big * 0.6, big && f === 3 ? '#ffffff' : r[2]); b.ellipse(8, 6, 5 + big, 3 + big * 0.5, r[3]);
      b.px(5, 5, '#ffffff'); b.px(10, 4, '#ffffff'); b.px(7, 3, '#ffffff'); b.px(11, 7, '#fff0e8');
      b.px(7, 11, EYE); b.px(9, 11, EYE);
      if (f % 2) { b.px(6, 15, '#c8b8a0'); b.px(9, 15, '#c8b8a0'); }
      return b.put();
    },
    mino(f, col) {
      const b = X.brush(30, 32), r = R(col);
      const low = f === 2;
      const hy = low ? 10 : 7;
      b.rect(9, 22, 4, 9, r[1]); b.rect(17, 22, 4, 9, r[1]); b.rect(9, 29, 5, 2, r[0]); b.rect(16, 29, 5, 2, r[0]);
      b.ellipse(15, 18, 9, 7, r[1]); b.ellipse(15, 17, 8, 6, r[2]); b.rect(10, 20, 10, 3, '#5a3a22');
      b.ellipse(5, 17 + (f % 2), 3, 4, r[2]); b.ellipse(25, 17 - (f % 2), 3, 4, r[2]);
      b.ellipse(15, hy + 2, 5, 4.5, r[2]); b.ellipse(15, hy + 4, 3, 2, r[3]);
      b.line(10, hy, 6, hy - 4, '#f0e8d0'); b.line(6, hy - 4, 6, hy - 6, '#f0e8d0'); b.line(20, hy, 24, hy - 4, '#f0e8d0'); b.line(24, hy - 4, 24, hy - 6, '#f0e8d0');
      b.px(13, hy + 1, '#ff3a3a'); b.px(17, hy + 1, '#ff3a3a'); b.px(14, hy + 5, EYE); b.px(16, hy + 5, EYE);
      b.rect(26, 8, 2, 16, '#6a4a2a'); b.ellipse(27, 8, 4, 3, '#b8b8c8'); b.ellipse(27, 8, 3, 2, '#e8e8f0');
      return b.put();
    },
  });
  Object.assign(FRAME, {
    spider: (e) => ['spider', e.st === 'leap' ? 1 : Math.floor(e.t * 8) % 2],
    scorp: (e) => ['scorp', e.st === 'sting' ? 2 : Math.floor(e.t * 5) % 2],
    eye: (e) => ['eye', e.st === 'sweep' ? 2 : e.st === 'charge' ? (Math.floor(e.t * 10) % 2) : Math.floor(e.t * 1.3) % 7 === 6 ? 3 : Math.floor(e.t * 2) % 2],
    shroom: (e) => ['shroom', e.st === 'fuse' ? 2 + (Math.floor(e.t * 14) % 2) : Math.floor(e.t * 6) % 2],
    wraith: (e) => ['ghost', Math.floor(e.t * 5) % 4],
    mino: (e) => ['mino', e.st === 'charge' || e.st === 'snort' ? 2 : Math.floor((e.walkT || e.t) * 4) % 2],
    cgolem: (e) => ['golem', e.st === 'raise' ? 2 : e.st === 'slam' ? 0 : Math.floor(e.t * 2) % 2],
  });
  Object.assign(FLIP, { spider: false, scorp: true, mino: true, shroom: false });
  Object.assign(INIT, {
    shroom(e) { e.st = 'sleep'; },
    mino(e) { e.noKnock = true; e.armored = 0.3; },
    wraith(e) { e.phase = Math.random() * 6; },
    eye(e) { e.phase = Math.random() * 6; },
  });

  /* ───────── 플레이어 상태: 느려짐 · 독 ───────── */
  const up0 = G.Player.prototype.update;
  G.Player.prototype.update = function (dt, Wd) {
    if (this.slowT > 0) { this.slowT -= dt; this.slowMul = this.slowT > 0 ? 0.55 : 1; if (Math.random() < dt * 6) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y, z: 4 + Math.random() * 10, vz: 0, g: 0, life: 0.5, col: '#e8e8f0', size: 1 }); }
    if (this.poisonT > 0) {
      this.poisonT -= dt; this.poisonTick = (this.poisonTick || 0) + dt;
      if (this.poisonTick > 1.3) { this.poisonTick = 0; const s = G.state; if (s.hp > 1) { s.hp -= 1; this.flash = 0.12; this.flashCol = '#9ae86a'; G.fx.float(this.x, this.y - 26, '독', '#9ae86a', { life: 0.6 }); } }
      if (Math.random() < dt * 8) G.fx.part({ x: this.x + (Math.random() - 0.5) * 8, y: this.y, z: 8 + Math.random() * 10, vz: 14, g: 0, life: 0.5, col: '#8ad84a', size: 1 });
    }
    return up0.call(this, dt, Wd);
  };
  const webbed = (p) => { if (!p.slowT || p.slowT <= 0) G.ui.toast('거미줄에 걸렸다 — 느려진다', 'bad'); p.slowT = 1.8; };
  const poisoned = (p) => { if (!p.poisonT || p.poisonT <= 0) G.ui.toast('독에 걸렸다', 'bad'); p.poisonT = 5; };
  const webDraw = (g, x, y) => { g.strokeStyle = '#f0f0f8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.moveTo(x, y - 4); g.lineTo(x, y + 4); g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3); g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3); g.stroke(); };
  const boneDraw = function (g, x, y) { const a = (this.t || 0) * 14; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#f0e8d8'; g.fillRect(-4, -1, 8, 2); g.fillRect(-5, -2, 2, 4); g.fillRect(3, -2, 2, 4); g.restore(); };
  /** 빈 곳으로 순간이동 (주인공 주변 r) */
  function blinkNear(e, Wd, r0, r1, behind) {
    const p = e.p;
    for (let k = 0; k < 16; k++) {
      let a = Math.random() * Math.PI * 2;
      if (behind && k < 8) { const fv = U.DV[p.dir] || [0, 1]; a = Math.atan2(-fv[1], -fv[0]) + (Math.random() - 0.5) * 0.8; }
      const r = r0 + Math.random() * (r1 - r0);
      const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
      if (Wd.map.boxFree(x - e.bw / 2, y - e.bh, e.bw, e.bh, e.z, e) && !Wd.map.hazardAt(x, y - 2)) { G.fx.glow(e.x, e.y - 10, e.col, 10); e.x = x; e.y = y; G.fx.glow(x, y - 10, e.col, 10); sfx('warp'); return true; }
    }
    return false;
  }
  /** 빛 가까이 있는가 (어둠 망령) */
  function nearLight(e, Wd) {
    const p = Wd.player, m = Wd.map;
    if ((m.dark || 0) < 0.3) return true;
    if (p && U.dist(e.x, e.y, p.x, p.y) < (p.lantern ? 72 : 34)) return true;
    for (const l of m.lights || []) if (l.on !== false && U.dist(e.x, e.y, l.x, l.y) < l.r * 0.8) return true;
    return false;
  }

  /* ───────── 행동 ───────── */
  Object.assign(AI, {
    /* 독거미: 뛰어들거나 거미줄을 뱉는다 */
    spider(e, dt, Wd) {
      const p = e.p;
      if (!e.sees(140) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'leap') { const k = e.stT / 0.35; e.jz = Math.sin(Math.min(1, k) * Math.PI) * 10; e.go(e.hv[0] * dt, e.hv[1] * dt); if (k >= 1) { e.jz = 0; e.set('idle'); } return; }
      if (e.st === 'spit') {
        if (e.stT > 0.35) {
          const n = e.tier >= 4 ? 3 : 1, a0 = U.angle(p.x - e.x, p.y - e.y);
          for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.32; C().shoot({ kind: 'web', owner: 'foe', x: e.x, y: e.y - 4, vx: Math.cos(a) * 125, vy: Math.sin(a) * 125, dmg: Math.max(1, e.atk - 1), r: 4, life: 1.3, blockable: true, blockLv: 1, onHitPlayer: webbed, drawFn: webDraw }); }
          sfx('squish'); e.set('idle');
        }
        return;
      }
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (d > 56) e.toward(p.x, p.y, e.speed, dt); else e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed * 0.6, dt);
      if (e.stT > 1.5 && d < 150 && e.sees(150)) {
        if (d < 64 && Math.random() < 0.5) { e.set('leap'); const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.hv = [nx * 175, ny * 175]; e.telegraph(0.2); }
        else { e.set('spit'); e.telegraph(0.35); }
      }
    },
    /* 모래 전갈: 집게는 막고, 꼬리로 멀리 찌른다 (독) */
    scorp(e, dt) {
      const p = e.p;
      if (!e.sees(130) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (e.st === 'aim') { if (e.stT > 0.45) { e.set('sting'); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('thrust'); } return; }
      if (e.st === 'sting') {
        if (!e.hitDone && e.stT > 0.08) { e.hitDone = true; const tx = e.x + e.cv[0] * 36, ty = e.y + e.cv[1] * 30; if (U.dist(tx, ty, p.x, p.y) < 18 || d < 24) { if (C().hurtPlayer(p, e.atk + 1, e, {})) poisoned(p); } G.fx.sparks(tx, ty - 6, 5, '#ff8a3a', 60); }
        if (e.stT > 0.5) { e.set('idle'); e.hitDone = false; }
        return;
      }
      if (d > 30) e.toward(p.x, p.y, e.speed, dt);
      if (d < 44 && e.stT > 1.1) { e.set('aim'); e.telegraph(0.45); }
    },
    /* 해골 병사: 거리를 두고 뼈를 던진다. 무너졌다 한 번 일어난다 */
    skel(e, dt) {
      const p = e.p;
      if (e.st === 'heap') { e.noContact = true; e.state = 'idle'; if (e.stT > 2.5) { e.hp = Math.ceil(e.maxHp * 0.5); e.set('idle'); e.noContact = false; sfx('clank'); G.fx.glow(e.x, e.y - 8, '#ff8a5a', 8); } return; }
      e.state = 'idle';
      if (!e.sees(150) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (e.st === 'throw') {
        e.state = 'attack';
        if (e.stT > 0.4) {
          const n = e.tier >= 6 ? 2 : 1;
          for (let i = 0; i < n; i++) { const a = U.angle(p.x - e.x, p.y - e.y) + (i ? 0.25 : 0); C().shoot({ kind: 'bone', owner: 'foe', x: e.x, y: e.y - 10, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, dmg: e.atk, r: 4, life: 1.3, blockable: true, reflectable: true, blockLv: 1, drawFn: boneDraw }); }
          sfx('throw'); e.set('move');
        }
        return;
      }
      if (d < 60) { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      else if (d > 110) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (e.stT > 1.4 && e.sees(170)) { e.set('throw'); e.telegraph(0.35); }
    },
    /* 떠도는 눈: 가만히 보다가 광선을 휘두른다 */
    eye(e, dt, Wd) {
      const p = e.p;
      e.phase += dt;
      if (!e.sees(170) && !e.aggro) { e.x = e.home.x + Math.cos(e.phase * 0.7) * 18; e.y = e.home.y + Math.sin(e.phase) * 8; return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'charge') { e.beamA = U.angle(p.x - e.x, p.y - 8 - (e.y - 14)); if (e.stT > 0.75) { e.set('sweep'); e.a0 = e.beamA - 0.85 * e.sdir; sfx('beam'); } return; }
      if (e.st === 'sweep') {
        const k = e.stT / 1.3;
        e.beamA = e.a0 + 1.7 * e.sdir * Math.min(1, k);
        // 광선에 닿으면
        const L = 170, bx = Math.cos(e.beamA), by = Math.sin(e.beamA);
        const rx = p.x - e.x, ry = (p.y - 8) - (e.y - 14);
        const along = rx * bx + ry * by, off = Math.abs(rx * by - ry * bx);
        e.beamLen = L;
        for (let s2 = 8; s2 < L; s2 += 8) if (!Wd.map.shotFree(e.x + bx * s2, e.y - 14 + by * s2, 0)) { e.beamLen = s2; break; }
        if (along > 0 && along < e.beamLen && off < 7) C().hurtPlayer(p, e.atk, { x: e.x, y: e.y }, {});
        if (Math.random() < dt * 30) G.fx.sparks(e.x + bx * e.beamLen, e.y - 14 + by * e.beamLen, 2, e.col, 40);
        if (k >= 1) { e.set('rest'); e.beamLen = 0; }
        return;
      }
      if (e.st === 'rest') { if (e.stT > 1.2) e.set('idle'); return; }
      const want = 95, [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
      e.x += (d > want ? nx : -nx) * e.speed * 0.6 * dt; e.y += (d > want ? ny : -ny) * e.speed * 0.6 * dt;
      if (e.stT > 1.8 && d < 170) { e.set('charge'); e.telegraph(0.75); e.sdir = Math.random() < 0.5 ? 1 : -1; }
    },
    /* 폭발 버섯: 잠들어 있다가 달려와 터진다 */
    shroom(e, dt, Wd) {
      const p = e.p;
      if (e.st === 'sleep') { if (e.dist() < 80 || e.aggro) { e.set('run'); sfx('shriek'); } return; }
      const d = e.dist();
      if (e.st === 'run') { e.toward(p.x, p.y, e.speed, dt); if (d < 22 || e.stT > 4) { e.set('fuse'); e.telegraph(0.7); sfx('telegraph'); } return; }
      if (e.st === 'fuse') {
        e.jz = Math.abs(Math.sin(e.stT * 20)) * 2;
        if (e.stT > 0.7) {
          const x = e.x, y = e.y;
          sfx('explode'); Wd.shake(4, 0.3); G.fx.sparks(x, y, 22, '#ff8a4a', 140); G.fx.ring(x, y, '#ffd8a8', 34, 0.4, 3); G.fx.dust(x, y, 10);
          if (p && U.dist(x, y, p.x, p.y - 6) < 36) C().hurtPlayer(p, e.atk + 2, { x, y }, {});
          for (const f of C().foes()) if (f !== e && U.dist(x, y, f.x, f.y) < 30) C().damage(f, 5, { src: 'bomb', el: 'bomb', unblockable: true });
          e.exp = Math.ceil(e.exp / 2); e.hp = 0; C().kill(e, { src: 'self' });
        }
      }
    },
    /* 어둠 망령: 빛 밖에선 보이지 않는다. 벽을 지나 다가와 빛을 빨아 간다 (느려짐) */
    wraith(e, dt, Wd) {
      const p = e.p;
      e.phase += dt;
      e.lightSeen = nearLight(e, Wd);
      e.noContact = false;
      const d = e.dist();
      if (d > 230) { e.x = e.home.x + Math.cos(e.phase * 0.6) * 20; e.y = e.home.y + Math.sin(e.phase * 0.9) * 12; return; }
      e.aggro = true;
      if (e.st === 'shriek') { if (e.stT > 0.5) { B().ring(e, 6, 80, { owner: 'foe', col: '#8a5ad8', r: 3, life: 1.6, blockable: true, blockLv: 2, ghost: true }); sfx('shriek'); e.set('idle'); } return; }
      const [nx, ny] = U.norm(p.x - e.x, p.y - 6 - e.y);
      const sp = e.speed * (e.lightSeen ? 0.75 : 1.1);
      e.x += nx * sp * dt + Math.cos(e.phase * 3) * 10 * dt; e.y += ny * sp * dt;
      if (e.tier >= 6 && e.stT > 4 && d < 120) { e.set('shriek'); e.telegraph(0.5); }
      if (d < 16) p.slowT = Math.max(p.slowT || 0, 0.8);
    },
    /* 미궁의 파수꾼: 단단하다. 보면 콧김을 뿜고 돌진 — 벽에 부딪히면 한참 틈을 보인다 */
    mino(e, dt, Wd) {
      const p = e.p;
      e.vulnerable = e.st === 'dazed';
      if (e.st === 'dazed') { if (Math.random() < dt * 6) G.fx.part({ x: e.x + (Math.random() - 0.5) * 16, y: e.y, z: e.h, vz: 10, g: 0, life: 0.5, col: '#ffe066', size: 1 }); if (e.stT > 2.6) e.set('idle'); return; }
      if (e.st === 'snort') { if (Math.random() < dt * 20) G.fx.dust(e.x - e.dirX * 12, e.y, 1); e.dirX = Math.sign(p.x - e.x) || e.dirX; if (e.stT > 0.8) { e.set('charge'); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('growl'); } return; }
      if (e.st === 'charge') {
        const sp = e.speed * 6;
        const r = e.go(e.cv[0] * sp * dt, e.cv[1] * sp * dt);
        if (Math.random() < dt * 30) G.fx.dust(e.x, e.y, 2);
        if (e.dist() < e.r + 8) C().hurtPlayer(p, e.atk + 2, e, {});
        if (r.hitX || r.hitY) { e.set('dazed'); Wd.shake(5, 0.35); sfx('impact'); G.fx.sparks(e.x + e.cv[0] * 14, e.y - 14, 12, '#ffffff'); G.fx.float(e.x, e.y - e.h - 8, '틈!', '#ffe066', { big: true, life: 1 }); }
        else if (e.stT > 1.6) e.set('idle');
        return;
      }
      if (e.st === 'swing') { if (e.stT > 0.55 && !e.hitDone) { e.hitDone = true; sfx('swing'); Wd.shake(3, 0.2); G.fx.ring(e.x, e.y, '#e8d8c8', 34, 0.3, 2); if (e.dist() < 38) C().hurtPlayer(p, e.atk + 1, e, {}); } if (e.stT > 1) { e.set('idle'); e.hitDone = false; } return; }
      const d = e.dist();
      if (!e.sees(240) && !e.aggro) { e.wander(dt); e.walkT = (e.walkT || 0) + dt; return; }
      e.aggro = true;
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (d > 34) { e.toward(p.x, p.y, e.speed, dt); e.walkT = (e.walkT || 0) + dt; }
      if (d < 40 && e.stT > 0.8) { e.set('swing'); e.telegraph(0.55); }
      else if (d > 70 && e.stT > 1.5 && e.sees(240)) { e.set('snort'); e.telegraph(0.8); }
    },
    /* 수정 골렘: 골렘처럼 내려친 뒤 파편 여덟 */
    cgolem(e, dt, Wd) {
      const was = e.st;
      AI.golem(e, dt, Wd);
      if (was === 'raise' && e.st === 'slam') { B().ring(e, 8, 110, { owner: 'foe', col: '#bfe8ff', r: 3, life: 1.2, blockable: true, blockLv: 1, kind: 'rock' }); sfx('crystal'); }
    },
    /* 창기병: 거리를 재다가 긴 찌르기 돌진 (높은 단계는 두 번) */
    lancer(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(160) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'aim') { e.state = 'attack'; e.atkFrame = 0; if (e.stT < 0.35) { e.cv = U.norm(p.x - e.x, p.y - e.y); e.dir = U.dir4(e.cv[0], e.cv[1], e.dir); } if (e.stT > 0.6) { e.set('thrust'); sfx('thrust'); e.hitDone = false; } return; }
      if (e.st === 'thrust') {
        e.state = 'attack'; e.atkFrame = 1;
        const r = e.go(e.cv[0] * 330 * dt, e.cv[1] * 330 * dt);
        if (!e.hitDone && U.dist(e.x + e.cv[0] * 14, e.y + e.cv[1] * 10, p.x, p.y) < 16) { e.hitDone = true; C().hurtPlayer(p, e.atk + 1, e, {}); }
        if (Math.random() < dt * 30) G.fx.dust(e.x, e.y, 1);
        if (e.stT > 0.24 || r.hitX || r.hitY) { if (e.tier >= 5 && !e.second) { e.second = true; e.set('aim'); e.stT = 0.3; } else { e.second = false; e.set('recover'); } }
        return;
      }
      if (e.st === 'recover') { if (e.stT > 0.7) e.set('idle'); return; }
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (d > 80) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      else if (d < 44) { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed * 0.8, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (e.stT > 1.1 && d < 95 && e.sees(120)) { e.set('aim'); e.telegraph(0.6); e.cv = U.norm(p.x - e.x, p.y - e.y); }
    },
    /* 그림자 자객: 사라졌다가 등 뒤에서 세 번 벤다 */
    assassin(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(150) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'vanish') { e.alpha = Math.max(0.06, 1 - e.stT * 2.5); e.noContact = true; e.inv = 0.2; if (e.stT > 1.1) { blinkNear(e, Wd, 26, 36, true); e.set('appear'); e.telegraph(0.35); e.alpha = 1; } return; }
      if (e.st === 'appear') { e.noContact = false; e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); if (e.stT > 0.35) { e.set('slash'); e.combo = 0; } return; }
      if (e.st === 'slash') {
        e.state = 'attack'; e.atkFrame = e.combo % 2;
        if (e.stT > 0.2) {
          e.combo++; e.stT = 0;
          const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 190; e.ky = ny * 190; sfx('swing');
          if (U.dist(e.x, e.y, p.x, p.y) < 26) C().hurtPlayer(p, e.atk, e, { inv: 0.25 });
          G.fx.slash && G.fx.slash(e.x + nx * 10, e.y - 10 + ny * 6, Math.atan2(ny, nx), '#c49bff', 10);
          if (e.combo >= 3) e.set('retreat');
        }
        return;
      }
      if (e.st === 'retreat') { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed * 1.2, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; if (e.stT > 0.8) e.set('idle'); return; }
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      const s = Math.sin(e.t * 1.2) > 0 ? 1 : -1, [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
      if (d > 90) e.toward(p.x, p.y, e.speed * 0.8, dt); else e.go(-ny * s * e.speed * 0.6 * dt, nx * s * e.speed * 0.6 * dt);
      e.state = 'walk'; e.walkT = (e.walkT || 0) + dt;
      if (e.stT > 1.6) { e.set('vanish'); sfx('warp'); G.fx.glow(e.x, e.y - 10, '#3a1a5a', 12); }
    },
    /* 광신 사제: 동료를 고치고 보호막을 씌운다. 주인공 발밑에 빛기둥 */
    priest(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(170) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (e.st === 'bless') {
        e.state = 'cast';
        if (e.stT > 0.6) {
          let n = 0;
          for (const f of C().foes()) if (f !== e && !f.boss && U.dist(f.x, f.y, e.x, e.y) < 110) { f.hp = Math.min(f.maxHp, f.hp + f.maxHp * 0.3); f.warded = 4; n++; G.fx.glow(f.x, f.y - 8, '#fff4a8', 10); }
          if (n) { sfx('heal'); G.fx.ring(e.x, e.y, '#fff4a8', 110, 0.5, 2); }
          e.set('move');
        }
        return;
      }
      if (e.st === 'pillar') {
        e.state = 'cast';
        if (e.stT > 0.3 && !e.cast) { e.cast = true; const tx = p.x, ty = p.y; const dmg = e.atk + 1; B().warnCircle(tx, ty, 20, 0.8, () => { G.fx.glow(tx, ty - 20, '#fff4a8', 24, 40); G.fx.ring(tx, ty, '#fff4a8', 20, 0.3, 2); sfx('beam'); B().hitCircle(tx, ty, 20, dmg); }, 'rgba(255,240,160,0.35)'); }
        if (e.stT > 0.7) { e.cast = false; e.set('move'); }
        return;
      }
      if (d < 80) { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      else if (d > 140) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (e.stT > 2.2) {
        const hurt = C().foes().some((f) => f !== e && !f.boss && f.hp < f.maxHp * 0.8 && U.dist(f.x, f.y, e.x, e.y) < 110);
        if (hurt && Math.random() < 0.6) { e.set('bless'); e.telegraph(0.6); } else { e.set('pillar'); e.telegraph(0.4); }
      }
    },
    /* 사령술사: 졸개를 부르고, 구슬 고리를 퍼뜨린다 */
    summoner(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(170) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      e.minions = (e.minions || []).filter((m) => !m.dead);
      const d = e.dist();
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (e.st === 'call') {
        e.state = 'cast';
        if (e.stT > 0.8) {
          const kinds = e.tier >= 7 ? ['shade', 'wraith', 'skel'] : e.tier >= 4 ? ['ghost', 'spider', 'skel'] : ['slime', 'bat', 'spider'];
          for (let i = 0; i < 2 && e.minions.length < 4; i++) { const a = Math.random() * Math.PI * 2; const m = B().minion(e, U.pick(kinds), e.x + Math.cos(a) * 24, e.y + Math.sin(a) * 18); m.noElite = true; m.exp = Math.ceil(m.exp * 0.4); e.minions.push(m); }
          sfx('warp'); e.set('move');
        }
        return;
      }
      if (e.st === 'nova') { e.state = 'cast'; if (e.stT > 0.6) { B().ring(e, e.tier >= 5 ? 10 : 8, 90, { owner: 'foe', col: '#8ad8ff', r: 3, life: 1.8, blockable: true, reflectable: true, blockLv: 2, off: e.t }); sfx('foeshot'); e.set('move'); } return; }
      if (d < 90) { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (e.stT > 2) { if (e.minions.length < 3 && Math.random() < 0.6) { e.set('call'); e.telegraph(0.8); } else { e.set('nova'); e.telegraph(0.6); } }
    },
    /* 강철 저격수: 붉은 조준선이 너를 따라오다 멈춘 순간 쏜다 */
    sniper(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(220) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'aim') {
        e.state = 'bow';
        if (e.stT < 0.85) e.aim = U.angle(p.x - e.x, p.y - 8 - (e.y - 12));
        e.dir = U.dir4(Math.cos(e.aim), Math.sin(e.aim), e.dir);
        if (e.stT > 1.15) { C().shoot({ kind: 'beam', owner: 'foe', x: e.x, y: e.y - 12, vx: Math.cos(e.aim) * 440, vy: Math.sin(e.aim) * 440, dmg: e.atk + 2, r: 3, life: 0.9, col: '#ff3a3a', blockable: true, reflectable: true, blockLv: 3 }); sfx('beam'); W().shake(2, 0.15); e.set('move'); e.aim = null; }
        return;
      }
      if (e.st === 'move') { if (d < 110) { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed * 1.2, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; } if (e.stT > 1.4) e.set('idle'); return; }
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (d > 180) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (e.stT > 0.8 && e.sees(220)) { e.set('aim'); sfx('charge'); }
    },
    /* 광전사: 회전 베기로 밀고 들어온다. 궁지에 몰리면 광폭 */
    berserk(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(150) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      if (!e.enraged && e.hp < e.maxHp * 0.4) { e.enraged = true; e.speed *= 1.5; e.atk += 1; G.fx.float(e.x, e.y - 30, '광폭!', '#ff5a3a', { big: true, life: 1 }); sfx('growl'); e.col = '#ff3a2a'; }
      const d = e.dist();
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (e.st === 'wind') { e.state = 'attack'; if (e.stT > 0.45) { e.set('spin'); e.tick = 0; sfx('spin'); } return; }
      if (e.st === 'spin') {
        e.state = 'attack'; e.atkFrame = Math.floor(e.stT * 12) % 2; e.dir = ['down', 'left', 'up', 'right'][Math.floor(e.stT * 14) % 4];
        e.toward(p.x, p.y, e.speed * 1.1, dt);
        e.tick -= dt; if (e.tick <= 0) { e.tick = 0.3; G.fx.ring(e.x, e.y - 6, '#ffd8c8', 26, 0.2, 1); if (e.dist() < 28) C().hurtPlayer(p, e.atk, e, {}); }
        if (e.stT > (e.enraged ? 1.6 : 1.1)) e.set('tired');
        return;
      }
      if (e.st === 'tired') { if (Math.random() < dt * 4) G.fx.part({ x: e.x, y: e.y, z: 20, vz: 10, g: 0, life: 0.6, col: '#d8e8ff', size: 1 }); if (e.stT > (e.enraged ? 0.5 : 1)) e.set('idle'); return; }
      if (d > 24) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      if (d < 50 && e.stT > 0.9) { e.set('wind'); e.telegraph(0.45); }
    },
  });

  /* ───────── 몸 위에 덧그리기: 조준선 · 광선 · 창 · 단검 · 지팡이 ───────── */
  const OVER = {
    eye(e, g, cx, cy) {
      if (e.st === 'charge') { const a = e.beamA || 0; g.globalAlpha = 0.35 + Math.sin(e.t * 30) * 0.2; g.strokeStyle = e.col; g.lineWidth = 1; g.beginPath(); g.moveTo(e.x - cx, e.y - 14 - cy - 6); g.lineTo(e.x - cx + Math.cos(a) * 160, e.y - 14 - cy - 6 + Math.sin(a) * 160); g.stroke(); g.globalAlpha = 1; }
      if (e.st === 'sweep' && e.beamLen) { const a = e.beamA, L = e.beamLen, x0 = e.x - cx, y0 = e.y - 14 - cy - 6; g.globalCompositeOperation = 'lighter'; g.strokeStyle = e.col; g.lineWidth = 6; g.globalAlpha = 0.45; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.globalAlpha = 0.9; g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; g.globalCompositeOperation = 'source-over'; }
    },
    sniper(e, g, cx, cy) {
      if (e.st === 'aim' && e.aim != null) { const a = e.aim, lock = e.stT > 0.85; g.globalAlpha = lock ? 0.9 : 0.35; g.strokeStyle = '#ff3a3a'; g.lineWidth = lock ? 2 : 1; g.beginPath(); g.moveTo(e.x - cx, e.y - 12 - cy); g.lineTo(e.x - cx + Math.cos(a) * 240, e.y - 12 - cy + Math.sin(a) * 240); g.stroke(); g.globalAlpha = 1; g.lineWidth = 1; }
    },
    lancer(e, g, cx, cy) {
      if (e.st === 'aim' && e.cv) { g.fillStyle = 'rgba(255,70,90,' + (0.18 + Math.sin(e.t * 24) * 0.08) + ')'; const x0 = e.x - cx, y0 = e.y - 6 - cy; g.save(); g.translate(x0, y0); g.rotate(Math.atan2(e.cv[1], e.cv[0])); g.fillRect(0, -7, 84, 14); g.restore(); }
    },
    wraith() {},
  };
  const GEAR = {
    lancer(e, g, x, y) {
      const cx = x + 12, cy = y + 20, f = e.cv && (e.st === 'aim' || e.st === 'thrust') ? e.cv : U.DV[e.dir];
      const a = Math.atan2(f[1], f[0]), ext = e.st === 'thrust' ? 8 : e.st === 'aim' ? -4 : 0;
      g.save(); g.translate(cx, cy - 8); g.rotate(a); g.fillStyle = '#6a4a2a'; g.fillRect(-6 + ext, -1, 22, 2); g.fillStyle = '#e8e8f0'; g.fillRect(16 + ext, -2, 6, 4); g.fillStyle = '#ffffff'; g.fillRect(20 + ext, -1, 3, 2); g.restore();
    },
    assassin(e, g, x, y) {
      const cx = x + 12, cy = y + 20, f = U.DV[e.dir];
      for (const s of [-1, 1]) { g.save(); g.translate(cx + s * 5, cy - 8); g.rotate(Math.atan2(f[1], f[0]) + s * 0.5 + (e.st === 'slash' ? Math.sin(e.t * 40) : 0)); g.fillStyle = '#c49bff'; g.fillRect(3, -1, 7, 2); g.restore(); }
    },
    priest(e, g, x, y) { const cx = x + 12 + 6, cy = y + 20; g.fillStyle = '#a8883a'; g.fillRect(cx, cy - 22, 2, 20); g.fillStyle = e.st === 'bless' || e.st === 'pillar' ? '#ffffff' : '#fff4a8'; g.beginPath(); g.arc(cx + 1, cy - 24, 3, 0, Math.PI * 2); g.fill(); },
    summoner(e, g, x, y) { const cx = x + 12 - 7, cy = y + 20; g.fillStyle = '#3a2a4a'; g.fillRect(cx, cy - 22, 2, 20); g.fillStyle = '#8ad8ff'; g.globalAlpha = 0.6 + Math.sin(e.t * 6) * 0.3; g.beginPath(); g.arc(cx + 1, cy - 24, 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; },
    sniper(e, g, x, y) { const cx = x + 12, cy = y + 20, a = e.aim != null ? e.aim : Math.atan2(U.DV[e.dir][1], U.DV[e.dir][0]); g.save(); g.translate(cx, cy - 10); g.rotate(a); g.fillStyle = '#3a3a44'; g.fillRect(-2, -2, 16, 3); g.fillStyle = '#6a7a8a'; g.fillRect(4, -3, 5, 1); g.fillStyle = '#ff5a5a'; g.fillRect(14, -1, 2, 1); g.restore(); },
    berserk(e, g, x, y) { const cx = x + 12, cy = y + 20, f = U.DV[e.dir]; const a = e.st === 'spin' ? e.t * 20 : Math.atan2(f[1], f[0]) + 0.8; g.save(); g.translate(cx, cy - 8); g.rotate(a); g.fillStyle = '#5a3a22'; g.fillRect(0, -1, 14, 2); g.fillStyle = '#c8c8d8'; g.fillRect(10, -4, 5, 8); g.fillStyle = '#ffffff'; g.fillRect(14, -4, 1, 8); g.restore(); },
    skel(e, g, x, y) { if (e.st === 'throw') { const cx = x + 12, cy = y + 20; g.fillStyle = '#f0e8d8'; g.fillRect(cx + 4, cy - 26, 2, 6); } },
  };
  const gear0 = F.Foe.prototype.drawGear;
  F.Foe.prototype.drawGear = function (g, x, y) { gear0.call(this, g, x, y); const f = GEAR[this.ai]; if (f) f(this, g, x, y); };

  /* ═════════ 정예 ═════════ */
  const AFFIX = {
    rage: { name: '분노', col: '#ff5a3a', desc: '체력이 반 아래면 빨라지고 세진다' },
    ward: { name: '보호막', col: '#8ac8ff', desc: '보호막이 먼저 피해를 받는다. 잠시 맞지 않으면 다시 찬다' },
    vamp: { name: '흡혈', col: '#d83a5a', desc: '때리면 체력을 되찾는다' },
    split: { name: '분열', col: '#6ad86a', desc: '쓰러지면 둘로 나뉜다' },
    bomb: { name: '자폭', col: '#ffb84a', desc: '쓰러지면 잠시 뒤 터진다' },
    haste: { name: '신속', col: '#fff08a', desc: '훨씬 빠르다' },
    frost: { name: '서리', col: '#bfe8ff', desc: '맞으면 몸이 굳어 느려진다' },
    blink: { name: '순간이동', col: '#d85aff', desc: '가끔 곁으로 순간이동한다' },
    summon: { name: '부름', col: '#b8a8ff', desc: '졸개를 부른다' },
    regen: { name: '재생', col: '#9ae86a', desc: '체력이 조금씩 찬다' },
  };
  const NOELITE = { dummy: 1, bug: 1, shroom: 1, mino: 1 };
  function makeElite(e, list) {
    if (e.elite === true || e.boss) return e;
    if (!list) {
      const keys = Object.keys(AFFIX).filter((k) => !(k === 'summon' && e.ai === 'summoner') && !(k === 'split' && e.big));
      const n = e.tier >= 5 ? 2 : 1;
      list = [];
      while (list.length < n) { const k = U.pick(keys); if (!list.includes(k)) list.push(k); }
    }
    e.elite = true; e.affix = list;
    e.maxHp = e.hp = Math.round(e.maxHp * 2.6);
    e.atk = Math.round(e.atk * 1.3) + 1;
    e.exp = Math.round(e.exp * 3.2); e.gold = Math.round(e.gold * 3) + 6;
    e.weight = (e.weight || 1) * 1.8; e.matRate = 1;
    if (list.includes('haste')) e.speed *= 1.45;
    if (list.includes('ward')) { e.wardMax = Math.round(e.maxHp * 0.3); e.ward = e.wardMax; }
    e.eliteName = '[' + list.map((a) => AFFIX[a].name).join('·') + '] ' + e.name;
    e.eliteCol = AFFIX[list[0]].col;
    return e;
  }
  function eliteChance(type, o) {
    if (!G.state || NOELITE[type] || o.noElite || o.minion) return 0;
    const m = W().map;
    if (W().ents.some((b) => b.boss && !b.dead)) return 0;   // 보스가 부르는 졸개는 정예가 아니다
    const t = o.tier || 0;
    let c = m && m.dungeon ? 0.06 + t * 0.008 : 0.02 + t * 0.004;
    if (G.state.ch === 'c1' && !(m && m.dungeon)) c = 0;
    const di = G.state.settings.diff != null ? G.state.settings.diff : 1;
    return c * [0.35, 0.85, 1.4, 2.0][di];   // 정예가 나올 확률 — 보통은 조금 덜
  }
  const spawn0 = F.spawn;
  F.spawn = function (type, x, y, o) {
    o = Object.assign({}, o || {});
    const want = o.elite; delete o.elite;
    const e = spawn0(type, x, y, o);
    if (want === false) return e;
    if (want || Math.random() < eliteChance(type, o)) makeElite(e, Array.isArray(want) ? want : null);
    return e;
  };
  F.makeElite = makeElite; F.AFFIX = AFFIX;

  // 정예의 움직임
  const fu0 = F.Foe.prototype.update;
  F.Foe.prototype.update = function (dt, Wd) {
    fu0.call(this, dt, Wd);
    if (this.warded > 0) this.warded -= dt;
    if (!this.elite || this.dead || this.dormantFar) return;
    const A = this.affix, p = Wd.player;
    if (A.includes('rage') && !this.raged && this.hp < this.maxHp * 0.5) { this.raged = true; this.speed *= 1.45; this.atk += 1; G.fx.float(this.x, this.y - (this.h || 16) - 10, '분노!', '#ff5a3a', { big: true, life: 1 }); sfx('growl'); }
    if (A.includes('ward')) { this.wardT = (this.wardT || 0) + dt; if (this.wardT > 6 && this.ward < this.wardMax) { this.ward = this.wardMax; G.fx.ring(this.x, this.y - 8, '#8ac8ff', 18, 0.4, 2); sfx('shield'); } }
    if (A.includes('regen') && this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.02 * dt);
    if (A.includes('blink') && this.aggro && p) { this.blinkT = (this.blinkT || 0) + dt; if (this.blinkT > 5) { this.blinkT = 0; blinkNear(this, Wd, 40, 70, false); } }
    if (A.includes('summon') && this.aggro && p) {
      this.sumT = (this.sumT || 0) + dt; this.sumList = (this.sumList || []).filter((m) => !m.dead);
      if (this.sumT > 8 && this.sumList.length < 3) { this.sumT = 0; const kinds = this.tier >= 6 ? ['ghost', 'skel'] : ['slime', 'bat', 'spider']; for (let i = 0; i < 2; i++) { const a = Math.random() * 6.28; const m = G.bosses.minion(this, U.pick(kinds), this.x + Math.cos(a) * 22, this.y + Math.sin(a) * 16); m.noElite = true; this.sumList.push(m); } sfx('warp'); }
    }
    if (Math.random() < dt * 5) G.fx.part({ x: this.x + (Math.random() - 0.5) * 14, y: this.y, z: 2 + Math.random() * (this.h || 12), vz: 12, g: 0, life: 0.6, col: this.eliteCol, size: 1, glow: true });
  };
  // 보호막 · 단단한 몸 · 사제의 가호: 받은 피해의 일부를 되돌린다 (죽기 전에)
  const oh0 = F.Foe.prototype.onHurt;
  F.Foe.prototype.onHurt = function (dmg, info) {
    let back = 0;
    if (this.armored && !this.vulnerable && info && info.src !== 'bomb') back += dmg * (1 - this.armored);
    if (this.vulnerable && this.armored) { this.hp -= dmg; G.fx.float(this.x, this.y - (this.h || 16) - 12, '약점!', '#ffe066', { life: 0.6 }); }
    if (this.warded > 0) back += dmg * 0.5;
    if (this.elite && this.ward > 0) { const a = Math.min(this.ward, dmg - back); this.ward -= a; back += a; this.wardT = 0; G.fx.sparks(this.x, this.y - 10, 5, '#8ac8ff', 60); if (this.ward <= 0) { sfx('crystal'); G.fx.float(this.x, this.y - (this.h || 16) - 10, '보호막이 깨졌다', '#8ac8ff', { life: 0.8 }); } }
    if (back > 0) { this.hp += back; if (this.armored && !this.vulnerable && Math.random() < 0.3) { sfx('clank'); G.fx.sparks(this.x, this.y - 12, 4, '#ffffff', 60); } }
    return oh0.call(this, dmg, info);
  };
  // 흡혈 · 서리
  const hp0 = G.combat.hurtPlayer;
  G.combat.hurtPlayer = function (p, q, src, opt) {
    const ok = hp0.call(this, p, q, src, opt);
    if (ok && src && src.elite) {
      if (src.affix.includes('vamp')) { src.hp = Math.min(src.maxHp, src.hp + src.maxHp * 0.08); G.fx.glow(src.x, src.y - 8, '#d83a5a', 8); }
      if (src.affix.includes('frost')) { p.slowT = Math.max(p.slowT || 0, 1.6); G.fx.shards(p.x, p.y - 10, 5, '#bfe8ff'); }
    }
    return ok;
  };
  // 쓰러질 때: 분열 · 자폭 · 전리품
  const od0 = F.Foe.prototype.onDie;
  F.Foe.prototype.onDie = function (info) {
    od0.call(this, info);
    if (this.elite !== true) return;
    const x = this.x, y = this.y, tier = this.tier, type = this.type, room = this.room;
    if (this.affix.includes('split') && !this.fromSplit) for (let i = 0; i < 2; i++) { const s2 = F.spawn(type, x + (i ? 10 : -10), y, { tier, hpMul: 0.6, noElite: true }); s2.fromSplit = true; s2.aggro = true; s2.room = room; s2.kx = (i ? 1 : -1) * 140; }
    if (this.affix.includes('bomb')) B().warnCircle(x, y, 34, 0.9, () => { sfx('explode'); W().shake(5, 0.3); G.fx.sparks(x, y, 26, '#ffb84a', 150); G.fx.ring(x, y, '#ffe8a8', 34, 0.4, 3); B().hitCircle(x, y, 34, 4 + tier); }, 'rgba(255,160,60,0.35)');
    // 전리품: 골드 한 줌 더, 가끔 약 · 영약 · 재료
    for (let i = 0; i < 3; i++) C().spawnPickup(x + (Math.random() - 0.5) * 16, y, 'gold', Math.round((this.gold || 6) / 3));
    const r = Math.random();
    const loot = r < 0.12 ? 'potion_max' : r < 0.4 ? 'potion_r' : r < 0.55 ? 'potion_b' : null;
    if (loot && G.data.ITEMS[loot]) { G.st.give(G.state, loot, 1); G.ui.toast('정예의 전리품: ' + G.data.ITEMS[loot].name, 'gold'); }
    G.state.eliteKills = (G.state.eliteKills || 0) + 1;
  };
  // 정예 · 가호 표시, 어둠 망령의 투명, 덧그림
  const dr0 = F.Foe.prototype.draw;
  F.Foe.prototype.draw = function (g, cx, cy) {
    const ex = Math.round(this.x - cx), ey = Math.round(this.y - cy);
    if (this.elite) { const k = 0.35 + Math.sin(this.t * 4) * 0.15; g.globalAlpha = k; g.fillStyle = this.eliteCol; g.beginPath(); g.ellipse(ex, ey - 1, (this.r || 8) + 5, ((this.r || 8) + 5) * 0.4, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    if (this.warded > 0) { g.strokeStyle = 'rgba(255,240,160,' + (0.5 + Math.sin(this.t * 10) * 0.3) + ')'; g.beginPath(); g.ellipse(ex, ey - (this.h || 16) / 2, (this.r || 8) + 4, (this.h || 16) / 2 + 4, 0, 0, Math.PI * 2); g.stroke(); }
    let a = 1;
    if (this.ai === 'wraith') a = this.lightSeen ? 0.9 : 0.07 + Math.max(0, Math.sin(this.t * 5)) * 0.05;
    if (this.ai === 'assassin' && this.st === 'vanish') a = this.alpha != null ? this.alpha : 1;
    if (a < 1) g.globalAlpha = a;
    dr0.call(this, g, cx, cy);
    g.globalAlpha = 1;
    const ov = OVER[this.ai]; if (ov) ov(this, g, cx, cy);
    if (this.elite && this.hp > 0 && (this.aggro || this.hpShow > 0)) {
      const top = Math.round(this.y - cy - (this.h || 16) - 14 - (this.fly ? 6 : 0));
      g.font = '8px Galmuri11, sans-serif'; g.textAlign = 'center';
      g.fillStyle = '#140c1c'; g.fillText(this.eliteName, ex + 1, top + 1); g.fillStyle = this.eliteCol; g.fillText(this.eliteName, ex, top);
      const w = 28, k = this.hp / this.maxHp;
      g.fillStyle = '#140c1c'; g.fillRect(ex - w / 2 - 1, top + 3, w + 2, 4); g.fillStyle = '#3a1a2a'; g.fillRect(ex - w / 2, top + 4, w, 2); g.fillStyle = this.eliteCol; g.fillRect(ex - w / 2, top + 4, Math.max(1, Math.round(w * k)), 2);
      if (this.ward > 0) { g.fillStyle = '#8ac8ff'; g.fillRect(ex - w / 2, top + 7, Math.round(w * this.ward / this.wardMax), 1); }
      g.textAlign = 'left';
    }
  };

  /* ───────── 들판에도 새 얼굴 ───────── */
  if (G.ow && G.ow.TABLE) void 0;   // 들판 표는 세계 파일에서 덧붙인다 (37_bestiary)
  G.monsters = { AFFIX, makeElite, OVER, GEAR, blinkNear };
})();
