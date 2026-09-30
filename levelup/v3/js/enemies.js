/* 적: 공통 몸(체력 · 경직 · 넉백 · 불/얼음 상태 · 접촉 피해 · 예고 번쩍임)과 행동 유형들, 그리고 도트 그림.
   지역 단계(tier)에 따라 체력 · 공격 · 색이 달라진다. 사람 모양 적(징수 기사 · 궁수 · 마법사)은 인물 스프라이트를 쓴다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent, X = G.gfx;
  const TS = TL.TS;
  const W = () => G.world;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const C = () => G.combat;

  const TIER_HP = [1, 1.8, 2.6, 3.4, 4.3, 5.2, 6.2, 7.2, 8.4, 9.6, 11, 12.5];
  const tierOf = (reg) => ({ green: 0, red: 1, blue: 2, yellow: 3, purple: 4, rainbow: 5, white: 6, gray: 7, black: 8, colorful: 9, mist: 6, amber: 3, space: 10, planet: 11, dungeon: 0 })[reg] || 0;

  /* ───────── 종류 ───────── */
  // hp: 기본 체력, atk: 하트 ¼칸, r: 맞는 반지름, h: 키, ai: 행동
  const T = {
    slime: { name: '젤리', hp: 4, atk: 2, speed: 34, r: 7, h: 10, exp: 3, gold: 2, weight: 0.8, ai: 'hop', col: '#6ad86a', mat: 'm_slime' },
    bigslime: { name: '큰 젤리', hp: 12, atk: 3, speed: 26, r: 11, h: 16, exp: 10, gold: 6, weight: 2, ai: 'hop', col: '#6ad86a', split: 'slime', mat: 'm_slime', big: true },
    boar: { name: '뿔멧돼지', hp: 9, atk: 4, speed: 40, r: 9, h: 13, exp: 7, gold: 4, weight: 1.6, ai: 'charge', col: '#8a5a3a', mat: 'm_hide' },
    bat: { name: '동굴 박쥐', hp: 3, atk: 2, speed: 70, r: 6, h: 8, exp: 3, gold: 1, weight: 0.5, ai: 'swoop', fly: true, col: '#5a3a7a' },
    bandit: { name: '길목 도적', hp: 8, atk: 3, speed: 48, r: 7, h: 20, exp: 8, gold: 8, weight: 1, ai: 'archer', human: true, col: '#6a5a44', mat: 'm_cloth',
      look: { hair: 'messy', hc: '#3a2a22', top: 'vest', tc: '#6a5a44', bottom: 'pants', bc: '#3a3a44', hat: 'hood', hatC: '#4a3a30', mask: true, acc: ['quiver'], eyeShape: 'sharp' } },
    knight: { name: '징수 기사', hp: 14, atk: 4, speed: 38, r: 8, h: 22, exp: 14, gold: 10, weight: 1.8, ai: 'knight', human: true, shield: true, col: '#8a8aa0', mat: 'm_ore',
      look: { hair: 'short', hc: '#4a3a30', top: 'armor', tc: '#8a8aa8', trim: '#e8c860', bottom: 'pants', bc: '#4a4a5a', hat: 'helm', hatC: '#9a9ab8', cape: '#7a2a3a', eyeShape: 'sharp', build: 'broad' } },
    mage: { name: '보랏빛 마도사', hp: 10, atk: 4, speed: 30, r: 7, h: 22, exp: 12, gold: 8, weight: 0.9, ai: 'mage', human: true, col: '#8a5ad8', mat: 'm_dust',
      look: { gender: 'girl', hair: 'long', hc: '#d8d8f0', top: 'robe', tc: '#5a3a8a', trim: '#e8c860', hat: 'witch', hatC: '#3a2a5a', eyeShape: 'sleepy', eye: '#d85aff', skin: 'pale' } },
    turret: { name: '감시 석상', hp: 16, atk: 3, speed: 0, r: 8, h: 20, exp: 8, gold: 3, weight: 99, ai: 'turret', col: '#8a8a9a', resist: ['fire', 'ice'], weak: ['bomb'], mat: 'm_stone' },
    ghost: { name: '빈 망령', hp: 8, atk: 3, speed: 36, r: 7, h: 16, exp: 10, gold: 0, weight: 0.6, ai: 'ghost', fly: true, undead: true, dark: true, weak: ['light'], col: '#b8c8e8', mat: 'm_dust' },
    plant: { name: '덩굴 입', hp: 8, atk: 3, speed: 0, r: 8, h: 16, exp: 6, gold: 2, weight: 99, ai: 'plant', weak: ['fire'], col: '#4aa84a', mat: 'm_seed' },
    crab: { name: '바위 게', hp: 12, atk: 3, speed: 44, r: 9, h: 12, exp: 8, gold: 4, weight: 1.6, ai: 'crab', guardFront: true, weak: ['bomb'], col: '#c86a4a', mat: 'm_shell' },
    golem: { name: '돌 골렘', hp: 34, atk: 6, speed: 20, r: 12, h: 26, exp: 30, gold: 14, weight: 5, ai: 'golem', weak: ['bomb'], resist: ['fire'], col: '#8a7a6a', big: true, mat: 'm_stone' },
    wisp: { name: '불도깨비', hp: 5, atk: 3, speed: 50, r: 6, h: 12, exp: 6, gold: 2, weight: 0.4, ai: 'wisp', fly: true, el: 'fire', resist: ['fire'], weak: ['ice'], col: '#ff8a3a' },
    icewisp: { name: '얼음 도깨비', hp: 6, atk: 3, speed: 46, r: 6, h: 12, exp: 7, gold: 2, weight: 0.4, ai: 'wisp', fly: true, el: 'ice', resist: ['ice'], weak: ['fire'], col: '#8ad8ff' },
    bomber: { name: '폭탄 고블린', hp: 7, atk: 4, speed: 44, r: 7, h: 14, exp: 8, gold: 6, weight: 0.9, ai: 'bomber', col: '#7aa84a', mat: 'm_powder' },
    bug: { name: '빛벌레', hp: 1.5, atk: 1, speed: 80, r: 4, h: 6, exp: 1, gold: 0, weight: 0.2, ai: 'swarm', fly: true, col: '#e8e060' },
    wolf: { name: '잿빛 늑대', hp: 10, atk: 4, speed: 64, r: 8, h: 14, exp: 9, gold: 3, weight: 1.2, ai: 'wolf', col: '#8a8a94', mat: 'm_hide' },
    worm: { name: '모래 벌레', hp: 14, atk: 5, speed: 60, r: 9, h: 16, exp: 14, gold: 6, weight: 3, ai: 'worm', col: '#c8a060', mat: 'm_shell' },
    octo: { name: '물총 문어', hp: 6, atk: 3, speed: 30, r: 7, h: 12, exp: 6, gold: 3, weight: 1, ai: 'octo', col: '#d85a7a', swimmer: true, mat: 'm_ink' },
    hollow: { name: '빈 기사', hp: 16, atk: 5, speed: 34, r: 8, h: 22, exp: 16, gold: 0, weight: 1.8, ai: 'hollow', undead: true, dark: true, weak: ['light'], col: '#9aa0b0', mat: 'm_tag' },
    mimic: { name: '가짜 상자', hp: 18, atk: 5, speed: 60, r: 8, h: 14, exp: 20, gold: 30, weight: 2, ai: 'mimic', col: '#a87a3a' },
    shade: { name: '흑점의 그림자', hp: 12, atk: 5, speed: 56, r: 8, h: 18, exp: 18, gold: 0, weight: 1, ai: 'shade', fly: true, dark: true, weak: ['light'], col: '#1a1028' },
    dummy: { name: '허수아비', hp: 999, atk: 0, speed: 0, r: 7, h: 20, exp: 0, gold: 0, weight: 99, ai: 'none', col: '#c8a060' },
    drone: { name: '감시 드론', hp: 10, atk: 4, speed: 50, r: 7, h: 12, exp: 12, gold: 6, weight: 1, ai: 'drone', fly: true, weak: ['bolt'], col: '#9aa8b8', mat: 'm_gear' },
  };

  /* ───────── 도트 그림 ───────── */
  const cache = new Map();
  function art(type, frame, v, col) {
    const key = type + '|' + frame + '|' + (v || 0) + '|' + col;
    let c = cache.get(key);
    if (c) return c;
    const f = ART[type] || ART.slime;
    c = X.outline(f(frame, col, v || 0), '#140c1c');
    cache.set(key, c);
    return c;
  }
  const R = (col) => X.ramp(col, 5); // 0 어둠 … 4 밝음
  const EYE = '#140c1c';
  const ART = {
    slime(f, col) {
      const w = 16, h = 14, b = X.brush(w, h), r = R(col);
      const sq = [0, 1, 2, -2][f % 4]; // 찌그러짐
      const rx = 7 + (sq > 0 ? sq * 0.6 : sq * 0.4), ry = 5.5 - sq * 0.5;
      const cy = h - 1 - ry;
      b.ellipse(8, cy, rx, ry, r[1]);
      b.ellipse(8, cy - 0.6, rx - 0.8, ry - 0.8, r[2]);
      b.ellipse(7, cy - 1.5, rx - 2.5, ry - 2.5, r[3]);
      b.ellipse(5.5, cy - ry + 2.2, 1.6, 1.1, '#ffffff', 0.85);
      b.px(10, cy - ry + 2, '#ffffff', 0.6);
      // 속에 떠 있는 씨앗
      b.px(9, Math.round(cy + 1), r[0]); b.px(6, Math.round(cy + 2), r[0]);
      const ey = Math.round(cy - 0.5);
      b.rect(5, ey, 2, 2, EYE); b.rect(10, ey, 2, 2, EYE); b.px(5, ey, '#ffffff'); b.px(10, ey, '#ffffff');
      b.hline(1, 14, h - 1, r[0]);
      return b.put();
    },
    bigslime(f, col) {
      const w = 26, h = 22, b = X.brush(w, h), r = R(col);
      const sq = [0, 1, 2, -2][f % 4];
      const rx = 12 + sq * 0.7, ry = 9 - sq * 0.7, cy = h - 1 - ry;
      b.ellipse(13, cy, rx, ry, r[1]); b.ellipse(13, cy - 1, rx - 1.2, ry - 1.2, r[2]); b.ellipse(11, cy - 2.5, rx - 4, ry - 4, r[3]);
      b.ellipse(8, cy - ry + 3.5, 2.5, 1.6, '#ffffff', 0.85);
      b.ellipse(15, cy + 2, 2, 2, r[0]); b.px(9, Math.round(cy + 3), r[0]);
      const ey = Math.round(cy - 1);
      b.rect(8, ey, 3, 3, EYE); b.rect(16, ey, 3, 3, EYE); b.px(8, ey, '#ffffff'); b.px(16, ey, '#ffffff');
      b.hline(11, 15, ey + 5, EYE); b.px(12, ey + 6, '#ff8aa8');
      return b.put();
    },
    boar(f, col) {
      // 옆모습, 오른쪽을 본다. f: 0,1 걷기 · 2 돌진 · 3 기절
      const w = 24, h = 17, b = X.brush(w, h), r = R(col);
      const leg = f === 2 ? [2, -2] : f === 1 ? [1, -1] : [0, 0];
      // 다리
      for (const [lx, o] of [[6, leg[0]], [9, leg[1]], [15, leg[1]], [18, leg[0]]]) b.rect(lx + o, 12, 2, 4, r[0]);
      // 몸
      b.ellipse(11, 9, 9, 5.2, r[1]); b.ellipse(11, 8, 8, 4.2, r[2]);
      b.ellipse(10, 6, 6, 2, r[3]);
      // 갈기
      for (let x = 4; x < 16; x += 2) b.px(x, 3 + (x % 4 ? 0 : 1), r[0]);
      // 머리
      b.ellipse(19, 9, 4.2, 3.8, r[2]); b.rect(21, 9, 3, 3, '#e8b8a0'); b.px(23, 10, EYE);
      // 뿔 · 엄니
      b.px(20, 12, '#fff8e8'); b.px(21, 13, '#fff8e8'); b.line(18, 6, 20, 3, '#e8e0c8'); b.px(21, 2, '#fff8e8');
      // 눈
      if (f === 3) { b.px(19, 7, EYE); b.px(20, 8, EYE); b.px(20, 6, EYE); } else { b.rect(19, 7, 2, 2, EYE); b.px(19, 7, f === 2 ? '#ff5a3a' : '#ffffff'); }
      b.px(18, 5, r[0]); b.px(17, 5, r[0]);
      b.px(2, 7, r[0]); b.px(1, 6, r[0]); // 꼬리
      return b.put();
    },
    bat(f, col) {
      const w = 18, h = 11, b = X.brush(w, h), r = R(col);
      const up = f % 2 === 0;
      b.ellipse(9, 6, 3, 3, r[2]); b.ellipse(9, 5, 2, 2, r[3]);
      b.px(7, 2, r[1]); b.px(11, 2, r[1]); b.px(7, 3, r[2]); b.px(11, 3, r[2]);
      b.px(8, 5, '#ff4a6a'); b.px(10, 5, '#ff4a6a');
      b.px(8, 8, '#ffffff'); b.px(10, 8, '#ffffff');
      if (up) { b.line(6, 5, 1, 1, r[1]); b.line(6, 6, 1, 2, r[0]); b.line(12, 5, 17, 1, r[1]); b.line(12, 6, 17, 2, r[0]); b.px(2, 2, r[1]); b.px(16, 2, r[1]); b.px(3, 3, r[1]); b.px(15, 3, r[1]); }
      else { b.line(6, 6, 1, 8, r[1]); b.line(6, 7, 2, 9, r[0]); b.line(12, 6, 17, 8, r[1]); b.line(12, 7, 16, 9, r[0]); b.px(4, 7, r[1]); b.px(14, 7, r[1]); }
      return b.put();
    },
    turret(f, col) {
      const w = 16, h = 22, b = X.brush(w, h), r = R(col);
      b.rect(2, 6, 12, 16, r[1]); b.rect(3, 6, 10, 15, r[2]); b.rect(3, 6, 3, 15, r[3]);
      b.rect(1, 4, 14, 3, r[3]); b.hline(1, 14, 6, r[1]);
      b.rect(1, 19, 14, 3, r[1]);
      // 눈
      const open = f % 2 === 0;
      b.ellipse(8, 11, 4, 3, '#140c1c');
      if (open) { b.ellipse(8, 11, 3, 2.2, '#ffe8c8'); b.rect(7, 10, 3, 3, f === 2 ? '#ff3a3a' : '#d83a5a'); b.px(7, 10, '#ffffff'); }
      else b.hline(5, 11, 11, r[0]);
      // 금 간 자국 · 이끼
      b.px(4, 16, r[0]); b.px(5, 17, r[0]); b.px(11, 8, r[0]); b.px(12, 19, '#5a8a4a'); b.px(3, 20, '#5a8a4a');
      return b.put();
    },
    ghost(f, col) {
      const w = 16, h = 19, b = X.brush(w, h), r = R(col);
      const sway = [0, 1, 0, -1][f % 4];
      b.ellipse(8, 7, 6, 6, r[3], 0.9);
      b.rect(2, 7, 12, 7, r[3], 0.9);
      for (let x = 2; x < 14; x++) { const hh = 14 + ((x + sway + 8) % 4 < 2 ? 2 : 0) + (x % 3 === 0 ? 1 : 0); b.vline(x, 13, hh, r[2]); }
      b.ellipse(8, 6, 4, 3, r[4], 0.6);
      // 텅 빈 눈 · 입
      b.rect(5, 6, 2, 3, '#1a1030'); b.rect(9, 6, 2, 3, '#1a1030'); b.ellipse(8, 11, 1.5, 1.2, '#1a1030');
      b.px(5, 6, '#8ad8ff'); b.px(9, 6, '#8ad8ff');
      return b.put();
    },
    plant(f, col) {
      const w = 18, h = 18, b = X.brush(w, h), r = R(col);
      const open = f === 1 || f === 2;
      // 잎
      b.ellipse(4, 15, 4, 2, r[1]); b.ellipse(14, 15, 4, 2, r[1]); b.ellipse(4, 14.5, 3, 1.2, r[3]); b.ellipse(14, 14.5, 3, 1.2, r[3]);
      b.vline(9, 10, 16, r[0]); b.vline(8, 10, 16, r[1]);
      // 머리 (꽃봉오리 입)
      const hy = f === 2 ? 5 : 7;
      b.ellipse(9, hy, 7, 5, '#d84a6a'); b.ellipse(9, hy - 1, 6, 3.5, '#f07a8a');
      for (let x = 4; x < 15; x += 3) b.px(x, hy - 3, '#ffe8f0');
      if (open) { b.ellipse(9, hy + 1, 5, 2.5, '#3a0a1a'); for (let x = 5; x < 14; x += 2) { b.px(x, hy - 0, '#ffffff'); b.px(x + 1, hy + 3, '#ffffff'); } }
      else b.hline(4, 14, hy + 1, '#8a1a3a');
      return b.put();
    },
    crab(f, col) {
      const w = 22, h = 15, b = X.brush(w, h), r = R(col);
      const k = f % 2;
      for (let i = 0; i < 3; i++) { b.line(6 - i * 2, 10, 2 - i + k, 14 - (i === 1 ? k : 0), r[0]); b.line(15 + i * 2, 10, 19 + i - k, 14 - (i === 1 ? k : 0), r[0]); }
      b.ellipse(11, 8, 8, 5, r[1]); b.ellipse(11, 7, 7, 3.8, r[2]); b.ellipse(9, 6, 4, 1.8, r[3]);
      // 등껍질 무늬 (바위)
      b.px(7, 8, r[0]); b.px(13, 9, r[0]); b.px(15, 6, r[0]); b.px(10, 4, '#8a8a8a'); b.px(12, 4, '#8a8a8a');
      // 집게
      b.ellipse(3, 5, 3, 2.5, r[2]); b.ellipse(19, 5, 3, 2.5, r[2]); b.px(1, 3, r[3]); b.px(21, 3, r[3]);
      b.hline(1, 3, 5 + k, '#140c1c'); b.hline(19, 21, 5 + k, '#140c1c');
      // 눈자루
      b.vline(9, 1, 3, r[1]); b.vline(13, 1, 3, r[1]); b.px(9, 0, EYE); b.px(13, 0, EYE);
      return b.put();
    },
    golem(f, col) {
      const w = 28, h = 28, b = X.brush(w, h), r = R(col);
      const up = f === 2 ? -3 : f === 1 ? 1 : 0; // 2: 팔 들기
      // 다리
      b.rect(7, 21, 5, 7, r[1]); b.rect(16, 21, 5, 7, r[1]); b.rect(7, 26, 5, 2, r[0]); b.rect(16, 26, 5, 2, r[0]);
      // 몸통
      b.rect(5, 8, 18, 15, r[1]); b.rect(6, 8, 16, 13, r[2]); b.rect(6, 8, 6, 12, r[3]);
      b.hline(5, 22, 15, r[0]); b.vline(14, 8, 22, r[0]);
      // 빛나는 핵
      b.ellipse(14, 14, 2.5, 2.5, '#ffd84a'); b.px(13, 13, '#ffffff');
      // 머리
      b.rect(9, 1, 10, 8, r[2]); b.rect(10, 1, 4, 7, r[3]); b.rect(10, 4, 8, 2, '#140c1c'); b.px(11, 4, '#ffd84a'); b.px(16, 4, '#ffd84a');
      // 팔
      b.rect(0, 9 + up, 5, 12, r[1]); b.rect(23, 9 + up, 5, 12, r[1]); b.rect(0, 9 + up, 2, 11, r[3]); b.rect(23, 9 + up, 2, 11, r[2]);
      b.rect(0, 19 + up, 5, 3, r[0]); b.rect(23, 19 + up, 5, 3, r[0]);
      // 이끼
      b.px(7, 8, '#5a9a4a'); b.px(8, 8, '#5a9a4a'); b.px(20, 9, '#5a9a4a'); b.px(18, 1, '#5a9a4a');
      return b.put();
    },
    wisp(f, col) {
      const w = 14, h = 16, b = X.brush(w, h), r = R(col);
      const fl = [0, 1, 2][f % 3];
      b.ellipse(7, 10, 5, 5, r[2]); b.ellipse(7, 10, 3.5, 3.5, r[3]); b.ellipse(7, 11, 2, 2, '#ffffff');
      // 불꽃 끝
      const tips = [[4, 5 - fl], [7, 2 + (fl % 2)], [10, 4 + fl % 2]];
      for (const [x, y] of tips) { b.line(x, y, 7, 8, r[2]); b.px(x, y, r[3]); }
      b.px(5, 10, EYE); b.px(9, 10, EYE);
      return b.put();
    },
    bomber(f, col) {
      const w = 16, h = 17, b = X.brush(w, h), r = R(col);
      const step = f % 2;
      b.rect(5 + step, 13, 2, 3, '#5a3a22'); b.rect(9 - step, 13, 2, 3, '#5a3a22');
      b.ellipse(8, 10, 5, 4, '#8a6a4a'); b.hline(4, 12, 11, '#5a3a22');
      b.ellipse(8, 5, 5, 4.5, r[2]); b.ellipse(7, 4, 3.5, 3, r[3]);
      b.px(2, 3, r[2]); b.px(1, 2, r[2]); b.px(14, 3, r[2]); b.px(15, 2, r[2]); // 귀
      b.rect(5, 4, 2, 2, '#ffe060'); b.rect(9, 4, 2, 2, '#ffe060'); b.px(6, 5, EYE); b.px(10, 5, EYE);
      b.hline(6, 10, 7, EYE); b.px(7, 8, '#ffffff'); b.px(9, 8, '#ffffff');
      if (f === 2) { b.ellipse(13, 1.5, 2.2, 2.2, '#2a2a4a'); b.px(14, -1, '#ffd84a'); }
      return b.put();
    },
    bug(f, col) {
      const w = 7, h = 6, b = X.brush(w, h), r = R(col);
      b.ellipse(3.5, 3.5, 2, 2, r[3]); b.px(3, 3, '#ffffff');
      if (f % 2) { b.px(1, 1, '#ffffff'); b.px(5, 1, '#ffffff'); } else { b.px(0, 2, '#ffffff'); b.px(6, 2, '#ffffff'); }
      return b.put();
    },
    wolf(f, col) {
      const w = 24, h = 16, b = X.brush(w, h), r = R(col);
      const run = f === 1 ? 2 : f === 2 ? 3 : 0;
      b.rect(5 - run, 11, 2, 4, r[1]); b.rect(8 + run, 11, 2, 4, r[0]); b.rect(15 - run, 11, 2, 4, r[1]); b.rect(18 + run, 11, 2, 4, r[0]);
      b.ellipse(12, 9, 8, 4, r[1]); b.ellipse(12, 8, 7, 3, r[2]); b.ellipse(11, 7, 5, 1.5, r[3]);
      b.ellipse(19, 6, 3.5, 3, r[2]); b.rect(21, 6, 3, 2, r[2]); b.px(23, 6, EYE);
      b.px(18, 2, r[1]); b.px(19, 3, r[1]); b.px(20, 2, r[1]); // 귀
      b.px(19, 5, f === 2 ? '#ff4a3a' : '#ffe060'); b.px(20, 8, '#ffffff'); b.px(22, 8, '#ffffff');
      b.line(4, 7, 0, 4 + (f % 2), r[1]); b.px(0, 3 + (f % 2), r[3]);
      b.hline(8, 16, 10, r[0]);
      return b.put();
    },
    worm(f, col) {
      const w = 18, h = 20, b = X.brush(w, h), r = R(col);
      // f 0: 모래 속(등만), 1: 나오는 중, 2: 입 벌림
      if (f === 0) { b.ellipse(9, 16, 7, 3, r[1]); b.ellipse(9, 15, 5, 2, r[2]); for (let x = 4; x < 15; x += 3) b.px(x, 14, r[3]); return b.put(); }
      const top = f === 2 ? 1 : 6;
      for (let y = top; y < 18; y += 3) { b.ellipse(9, y + 1, 5, 2, r[1]); b.hline(5, 13, y, r[2]); }
      b.ellipse(9, 18, 8, 2, '#a88a5a');
      b.ellipse(9, top + 2, 5, 4, r[2]);
      if (f === 2) { b.ellipse(9, top + 3, 4, 3, '#3a0a1a'); for (let a = 0; a < 6; a++) b.px(9 + Math.round(Math.cos(a) * 3), top + 3 + Math.round(Math.sin(a) * 2), '#ffffff'); }
      else { b.px(7, top + 2, EYE); b.px(11, top + 2, EYE); }
      return b.put();
    },
    octo(f, col) {
      const w = 16, h = 15, b = X.brush(w, h), r = R(col);
      b.ellipse(8, 6, 6, 5.5, r[2]); b.ellipse(7, 5, 4, 3.5, r[3]); b.px(5, 3, '#ffffff');
      for (let i = 0; i < 4; i++) { const x = 3 + i * 3; b.vline(x, 10, 13 + ((i + f) % 2), r[1]); }
      b.rect(5, 6, 2, 2, EYE); b.rect(9, 6, 2, 2, EYE); b.px(5, 6, '#ffffff'); b.px(9, 6, '#ffffff');
      b.ellipse(8, 9.5, f === 1 ? 2 : 1.4, f === 1 ? 1.6 : 1, r[0]);
      return b.put();
    },
    hollow(f, col) {
      // 속이 빈 갑옷. 투구 틈에 파란 불빛
      const w = 18, h = 24, b = X.brush(w, h), r = R(col);
      const step = f % 2;
      b.rect(5, 18, 3, 6 - step, r[1]); b.rect(10, 18, 3, 5 + step, r[1]);
      b.rect(4, 9, 10, 10, r[1]); b.rect(5, 9, 8, 9, r[2]); b.rect(5, 9, 3, 8, r[3]);
      b.hline(4, 13, 14, r[0]); b.px(9, 11, '#6a3a2a'); b.px(9, 12, '#6a3a2a'); // 녹
      b.rect(5, 1, 8, 8, r[2]); b.rect(5, 1, 3, 7, r[3]); b.rect(6, 4, 6, 2, '#0a0814');
      b.px(7, 4, '#6ad8ff'); b.px(10, 4, '#6ad8ff');
      b.px(8, 0, '#8a2a3a'); b.px(9, 0, '#8a2a3a'); b.px(9, -0, '#8a2a3a');
      // 이름표
      b.rect(10, 15, 2, 2, '#c8a070');
      // 팔 · 녹슨 검
      b.rect(2, 10, 2, 7, r[1]); b.rect(14, 10, 2, 7, r[1]);
      if (f === 2) { b.line(15, 9, 17, 0, '#a8a8b8'); } else { b.line(15, 17, 17, 23, '#a8a8b8'); }
      return b.put();
    },
    mimic(f, col) {
      const w = 16, h = 16, b = X.brush(w, h), r = R(col);
      const open = f > 0 ? (f === 2 ? 5 : 3) : 0;
      b.rect(1, 7, 14, 8, r[1]); b.rect(2, 7, 12, 7, r[2]); b.hline(1, 14, 10, '#e8c860');
      b.rect(1, 3 - open, 14, 5, r[2]); b.rect(2, 3 - open, 12, 2, r[3]); b.rect(7, 6 - open, 2, 3, '#e8c860');
      if (open) { b.rect(2, 8 - open + 3, 12, open - 1, '#3a0a1a'); for (let x = 2; x < 14; x += 2) { b.px(x, 8, '#ffffff'); b.px(x + 1, 8 - open + 3, '#ffffff'); } b.px(5, 5 - open, '#ff3a3a'); b.px(10, 5 - open, '#ff3a3a'); }
      return b.put();
    },
    shade(f, col) {
      const w = 18, h = 20, b = X.brush(w, h);
      const sw = [0, 1, 2, 1][f % 4];
      b.ellipse(9, 8, 7, 7, '#1a1028'); b.ellipse(9, 7, 5, 5, '#2a1a40');
      for (let x = 3; x < 16; x++) b.vline(x, 12, 15 + ((x + sw) % 3), '#1a1028');
      b.rect(5, 6, 3, 2, '#ff3a6a'); b.rect(11, 6, 3, 2, '#ff3a6a'); b.px(6, 6, '#ffd0d8'); b.px(12, 6, '#ffd0d8');
      b.hline(6, 12, 11, '#0a0610');
      return b.put();
    },
    dummy(f) {
      const w = 16, h = 22, b = X.brush(w, h);
      b.vline(8, 8, 21, '#6a4424'); b.hline(1, 14, 10, '#6a4424');
      b.ellipse(8, 13, 5, 6, '#c8a060'); b.ellipse(7, 12, 3, 4, '#e8c888');
      b.ellipse(8, 5, 4, 4, '#e8d8b0'); b.px(6, 5, '#3a2a1a'); b.px(10, 5, '#3a2a1a'); b.hline(6, 10, 7, '#8a6a4a');
      b.ellipse(8, 2, 5, 2, '#a8783a'); for (let x = 3; x < 14; x += 2) b.px(x, 11 + (x % 3), '#a8783a');
      if (f) { b.px(4, 3, '#ff4a4a'); }
      return b.put();
    },
    drone(f, col) {
      const w = 18, h = 12, b = X.brush(w, h), r = R(col);
      b.ellipse(9, 7, 6, 4, r[1]); b.ellipse(9, 6, 5, 3, r[2]); b.ellipse(8, 5, 3, 1.5, r[3]);
      b.ellipse(9, 7, 2, 2, '#140c1c'); b.px(9, 7, f === 2 ? '#ff3a3a' : '#6ad8ff');
      const k = f % 2;
      b.hline(0 + k, 5 - k, 1, '#d8d8e8'); b.hline(12 + k, 17 - k, 1, '#d8d8e8'); b.vline(3, 1, 4, r[0]); b.vline(15, 1, 4, r[0]);
      return b.put();
    },
  };

  /* ───────── 적 몸 ───────── */
  class Foe extends E.Ent {
    constructor(type, o) {
      const D = T[type] || T.slime;
      const tier = o && o.tier != null ? o.tier : 0;
      super(Object.assign({ kind: 'foe', bw: Math.min(12, D.r + 3), bh: 6, solid: false }, o));
      Object.assign(this, { foe: true, type, D, name: D.name, tier, ai: D.ai, speed: D.speed * (1 + tier * 0.03), r: D.r, h: D.h, weight: D.weight, fly: D.fly || false,
        undead: D.undead, dark: D.dark, weak: D.weak, resist: D.resist, el: D.el, mat: D.mat, big: D.big });
      this.maxHp = this.hp = Math.max(1, Math.round(D.hp * TIER_HP[Math.min(11, tier)] * (o && o.hpMul || 1) * (G.prog ? G.prog.diff().hp : 1)));
      this.atk = Math.round(D.atk * (1 + tier * 0.25));   // 지역 등급만큼 세게 (더하기가 아니라 곱하기)
      this.exp = Math.round(D.exp * (1 + tier * 0.9));
      this.gold = Math.round(D.gold * (1 + tier * 0.5));
      this.col = (o && o.col) || D.col;
      this.home = { x: this.x, y: this.y };
      this.st = 'idle'; this.stT = 0; this.tele = 0; this.face = 1; this.frame = 0; this.aT = Math.random() * 2;
      this.stunT = 0; this.burnT = 0; this.freezeT = 0; this.hpShow = 0; this.aggro = false; this.dirX = 1;
      this.blinkSeed = Math.random() * 3;
      if (D.human) { this.look = Object.assign({}, D.look); this.dir = 'down'; this.state = 'idle'; }
      if (this.init) this.init();
      const I = INIT[this.ai]; if (I) I(this);
    }
    get p() { return W().player; }
    dist() { const p = this.p; return p ? U.dist(this.x, this.y, p.x, p.y) : 9999; }
    /** 같은 높이에서 보이는가 */
    sees(range) {
      const p = this.p, m = W().map;
      if (!p || p.dead || p.state === 'dead' || G.script.running) return false;
      const d = this.dist();
      if (d > range) return false;
      if (!this.fly && Math.abs((p.z || 0) - (this.z || 0)) > 0 && !p.onStairs && !this.onStairs) return false;
      if (G.state && G.st.derive(G.state).stealth && d > range * 0.5) return false;
      const n = Math.ceil(d / 10);
      for (let i = 1; i < n; i++) { const k = i / n; if (!m.shotFree(U.lerp(this.x, p.x, k), U.lerp(this.y - 6, p.y - 6, k), Math.max(this.z, p.z))) return false; }
      return true;
    }
    /** 위험한 곳(구덩이 · 용암 · 깊은 물)을 피해서 이동 */
    go(dx, dy) {
      const m = W().map;
      if (!this.fly) {
        const nx = this.x + dx * 4, ny = this.y + dy * 4;
        const hz = m.hazardAt(nx, ny - 2);
        const t = m.groundAt(nx, ny - 2);
        if (hz || (!this.D.swimmer && (t === TL.T.DEEP)) || (this.D.swimmer && t !== TL.T.WATER && t !== TL.T.DEEP)) return { hitX: true, hitY: true };
        return E.move(m, this, dx, dy);
      }
      this.x += dx; this.y += dy;
      return { hitX: false, hitY: false };
    }
    toward(tx, ty, sp, dt) {
      const [nx, ny] = U.norm(tx - this.x, ty - this.y);
      if (Math.abs(nx) > 0.2) this.dirX = Math.sign(nx);
      this.vx = nx * sp; this.vy = ny * sp;
      if (this.look) this.dir = U.dir4(nx, ny, this.dir);
      return this.go(nx * sp * dt, ny * sp * dt);
    }
    wander(dt) {
      this.aT -= dt;
      if (this.aT <= 0) {
        this.aT = 1 + Math.random() * 2;
        if (Math.random() < 0.4) this.wdir = null;
        else { const a = Math.random() * Math.PI * 2; this.wdir = [Math.cos(a), Math.sin(a)]; }
        // 집에서 너무 멀면 돌아간다
        if (U.dist(this.x, this.y, this.home.x, this.home.y) > 64) this.wdir = U.norm(this.home.x - this.x, this.home.y - this.y);
      }
      if (this.wdir) {
        const sp = this.speed * 0.45;
        const r = this.go(this.wdir[0] * sp * dt, this.wdir[1] * sp * dt);
        this.vx = this.wdir[0] * sp; this.vy = this.wdir[1] * sp;
        if (Math.abs(this.wdir[0]) > 0.2) this.dirX = Math.sign(this.wdir[0]);
        if (this.look) { this.dir = U.dir4(this.wdir[0], this.wdir[1], this.dir); this.state = 'walk'; this.walkT = (this.walkT || 0) + dt; }
        if (r.hitX || r.hitY) this.aT = 0;
      } else { this.vx = this.vy = 0; if (this.look) this.state = 'idle'; }
    }
    set(s) { this.st = s; this.stT = 0; }
    telegraph(sec) { this.tele = sec; sfx('telegraph'); }
    update(dt, Wd) {
      const p = Wd.player;
      if (G.prog) dt *= G.prog.diff().spd;   // 난이도: 적이 조금 더 빠르다
      // 멀리 있으면 쉰다
      if (p && U.dist(this.x, this.y, p.x, p.y) > 420 && !this.boss) { this.dormantFar = true; return; }
      this.dormantFar = false;
      this.t += dt; this.stT += dt;
      if (this.inv > 0) this.inv -= dt;
      if (this.flash > 0) this.flash -= dt;
      if (this.hpShow > 0) this.hpShow -= dt;
      if (this.hurtT > 0) { this.hurtT -= dt; this.hpShow = 2.5; this.aggro = true; }
      if (this.tele > 0) this.tele -= dt;
      // 불 · 얼음
      if (this.squash > 0) this.squash -= dt;
      if (this.poisonT > 0) { this.poisonT -= dt; this.poisonTick = (this.poisonTick || 0) + dt; if (this.poisonTick > 0.5) { this.poisonTick = 0; this.hp -= 0.3 + this.maxHp * 0.015; this.flash = 0.04; this.flashCol = '#9ae86a'; if (this.hp <= 0) C().kill(this, { el: 'poison' }); } if (Math.random() < dt * 10) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y, z: Math.random() * this.h, vz: 18, g: 0, life: 0.5, col: '#8ad84a', size: 1 }); }
      if (this.burnT > 0) { this.burnT -= dt; this.burnTick = (this.burnTick || 0) + dt; if (this.burnTick > 0.5) { this.burnTick = 0; this.hp -= 0.5 + this.maxHp * 0.02; this.flash = 0.05; if (this.hp <= 0) C().kill(this, { el: 'fire' }); } if (Math.random() < dt * 20) G.fx.part({ x: this.x + (Math.random() - 0.5) * 10, y: this.y, z: Math.random() * this.h, vz: 30, g: 0, life: 0.35, col: Math.random() < 0.5 ? '#ffb040' : '#ff5a2a', size: 1, glow: true }); }
      // 넉백
      if (this.kx || this.ky) {
        const r = this.fly ? (this.x += this.kx * dt, this.y += this.ky * dt, { hitX: false }) : E.move(Wd.map, this, this.kx * dt, this.ky * dt);
        this.kx = U.approach(this.kx, 0, 700 * dt); this.ky = U.approach(this.ky, 0, 700 * dt);
        if (!this.fly && !this.boss) { const hz = Wd.map.hazardAt(this.x, this.y - 2); if (hz) { this.fallIn(hz); return; } }
        void r;
      }
      if (this.freezeT > 0) { this.freezeT -= dt; return; }
      if (this.stunT > 0) { this.stunT -= dt; this.vx = this.vy = 0; return; }
      if (this.dead) return;
      const A = AI[this.ai];
      if (A) A(this, dt, Wd);
      this.frameT = (this.frameT || 0) + dt;
      // 닿으면 아프다
      if (p && !this.noContact && this.st !== 'hidden' && p.state !== 'dead') {
        const dz = Math.abs((p.z || 0) - (this.z || 0));
        if ((dz === 0 || this.fly || p.onStairs) && U.dist(this.x, this.y - this.h / 2, p.x, p.y - 8) < this.r + 5) C().hurtPlayer(p, this.atk, this, { el: this.el });
      }
    }
    fallIn(kind) {
      this.dead = true;
      G.fx.dust(this.x, this.y, 6);
      if (kind === 'lava') { G.fx.sparks(this.x, this.y, 10, '#ff8a3a'); sfx('burn'); }
      else sfx('fall');
      C().kill(this, { fell: true });
    }
    guards(info) {
      if (this.freezeT > 0 || this.stunT > 0) return false;
      if (!(this.D.shield || this.D.guardFront) || this.st === 'swing' || this.st === 'windup') return false;
      if (!info.from && info.src !== 'arrow' && info.src !== 'sword' && info.src !== 'throw') return false;
      // 정면에서 온 것만
      const p = this.p;
      const fx = this.look ? U.DV[this.dir] : [this.dirX, 0];
      const [nx, ny] = U.norm(p.x - this.x, p.y - this.y);
      return fx[0] * nx + fx[1] * ny > 0.45;
    }
    onHurt() {
      this.aggro = true;
      if (this.ai === 'hop' && this.D.split && this.hp > 0 && this.hp < this.maxHp * 0.5 && !this.didSplit) {
        this.didSplit = true;
        for (let i = 0; i < 2; i++) { const s = spawn(this.D.split, this.x + (i ? 8 : -8), this.y, { tier: this.tier, col: this.col }); s.kx = (i ? 1 : -1) * 120; s.aggro = true; }
        this.hp = 0; C().kill(this, {});
      }
    }
    onDie() { if (this.onDieFn) this.onDieFn(this); }
    /** 빈 기사는 흰빛 · 불이 아니면 한 번 무너졌다 다시 일어난다 */
    preKill(info) {
      if (this.ai !== 'hollow' || this.revived || info.el === 'light' || info.el === 'fire' || info.fell) return false;
      this.revived = true; this.hp = 1; this.set('heap'); this.inv = 0.4;
      G.fx.shards(this.x, this.y - 8, 8, '#9aa0b0'); sfx('rock');
      return true;
    }
    drawShadow(g, cx, cy) {
      if (this.st === 'hidden' && this.ai !== 'worm') return;
      const w = Math.max(4, this.r * 0.9);
      g.fillStyle = 'rgba(0,0,0,0.26)';
      g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), w, w * 0.38, 0, 0, Math.PI * 2); g.fill();
    }
    img() {
      const F = FRAME[this.ai] ? FRAME[this.ai](this) : [this.type, Math.floor(this.t * 4) % 2];
      return art(F[0], F[1], 0, this.col);
    }
    draw(g, cx, cy) {
      if (this.st === 'hidden' && this.ai !== 'worm') return;
      if (this.ai === 'ghost' && !this.revealed && !this.aggro) g.globalAlpha = 0.18 + Math.sin(this.t * 3) * 0.08;
      else if (this.ai === 'ghost') g.globalAlpha = 0.85;
      let x, y, img;
      if (this.look) {
        this.state = this.state || 'idle';
        this.onDraw = (gg, xx, yy) => this.drawGear(gg, xx, yy);
        G.sprites.drawChar(g, this, cx, cy);
        img = null;
      } else {
        img = this.img();
        const fl = this.fly ? Math.sin(this.t * 5) * 2 + 6 + (this.zfly || 0) : 0;
        x = Math.round(this.x - cx - img.width / 2); y = Math.round(this.y - cy - img.height + 1 - fl - (this.jz || 0));
        const im = this.dirX < 0 && FLIP[this.ai] ? X.flipX(img) : img;
        // 늘고 줄기: 맞으면 납작, 공격 예고 중에는 움츠렸다 부푼다, 뛰는 것은 늘어난다
        let sx = 1, sy = 1;
        if (this.squash > 0) { const k = this.squash / 0.18; sx = 1 + 0.22 * k; sy = 1 - 0.2 * k; }
        else if (this.tele > 0) { const k = Math.sin(this.t * 26) * 0.5 + 0.5; sx = 1.06 + k * 0.05; sy = 0.94 - k * 0.04; }
        else if (this.jz > 1) { sx = 0.9; sy = 1.1; }
        else if (!this.fly && (this.ai === 'hop' || this.ai === 'swarm')) { const b = Math.sin(this.t * 6 + (this.blinkSeed || 0)); sx = 1 + b * 0.04; sy = 1 - b * 0.04; }
        const drawIm = (src) => { if (sx === 1 && sy === 1) g.drawImage(src, x, y); else { g.save(); g.translate(x + src.width / 2, y + src.height); g.scale(sx, sy); g.drawImage(src, -src.width / 2, -src.height); g.restore(); } };
        if (this.freezeT > 0) drawIm(X.tint(im, '#bfe8ff', 0.6));
        else drawIm(im);
        if (this.flash > 0) { g.globalAlpha = Math.min(1, this.flash * 8); drawIm(X.silhouette(im, this.flashCol || '#ffffff')); this.flashCol = null; }
      }
      g.globalAlpha = 1;
      const top = Math.round(this.y - cy - this.h - 6 - (this.fly ? 6 : 0));
      const ex = Math.round(this.x - cx);
      if (this.freezeT > 0 && this.look) { g.globalAlpha = 0.45; g.fillStyle = '#bfe8ff'; g.fillRect(ex - 7, top + 6, 14, this.h); g.globalAlpha = 1; }
      // 예고: 번쩍이는 느낌표
      if (this.tele > 0) {
        if (Math.floor(this.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(ex - 1, top - 6, 2, 5); g.fillRect(ex - 1, top, 2, 2); }
      }
      // 기절 별
      if (this.stunT > 0 && this.freezeT <= 0) for (let i = 0; i < 3; i++) { const a = this.t * 6 + i * 2.1; g.fillStyle = '#ffe066'; g.fillRect(Math.round(ex + Math.cos(a) * 7), Math.round(top + 2 + Math.sin(a) * 2), 2, 2); }
      // 체력
      if (this.hpShow > 0 && !this.boss && this.hp > 0) {
        const w = Math.max(12, Math.min(26, this.maxHp)), k = this.hp / this.maxHp;
        g.fillStyle = '#140c1c'; g.fillRect(ex - w / 2 - 1, top - 1, w + 2, 4);
        g.fillStyle = '#3a1a2a'; g.fillRect(ex - w / 2, top, w, 2);
        g.fillStyle = k > 0.5 ? '#6ae07a' : k > 0.25 ? '#ffd84a' : '#ff4a5e'; g.fillRect(ex - w / 2, top, Math.max(1, Math.round(w * k)), 2);
      }
    }
    /** 사람 모양 적의 무기 */
    drawGear(g, x, y) {
      const cx = x + 12, cy = y + 20;
      const f = U.DV[this.dir];
      if (this.D.shield && this.st !== 'swing') {
        // 방패: 바라보는 쪽
        const sx = cx + f[0] * 7 - 3, sy = cy - 6 + f[1] * 4;
        if (this.dir !== 'up') { g.fillStyle = '#5a5a7a'; g.fillRect(sx, sy, 7, 9); g.fillStyle = '#b8b8d0'; g.fillRect(sx + 1, sy + 1, 5, 7); g.fillStyle = '#e8c860'; g.fillRect(sx + 3, sy + 2, 1, 5); g.fillRect(sx + 2, sy + 4, 3, 1); }
      }
      if (this.ai === 'knight') {
        const a = this.st === 'swing' ? this.swingA : this.st === 'windup' ? U.angle(f[0], f[1]) - 1.6 : U.angle(f[0], f[1]) + 0.9;
        g.save(); g.translate(cx, cy - 8); g.rotate(a);
        g.fillStyle = '#5a3a22'; g.fillRect(2, -1, 3, 2); g.fillStyle = '#c8c8d8'; g.fillRect(5, -1, 12, 2); g.fillStyle = '#ffffff'; g.fillRect(5, -1, 12, 1);
        g.restore();
        if (this.st === 'swing') { g.globalAlpha = 0.5; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx, cy - 8); g.arc(cx, cy - 8, 20, this.swingA - 1.2, this.swingA); g.fill(); g.globalAlpha = 1; }
      }
      if (this.ai === 'archer' && this.st === 'aim') {
        const a = this.aim;
        g.save(); g.translate(cx, cy - 8); g.rotate(a);
        g.strokeStyle = '#6a4424'; g.lineWidth = 1; g.beginPath(); g.arc(3, 0, 7, -1.2, 1.2); g.stroke();
        g.fillStyle = '#e8e8f0'; g.fillRect(0, 0, 10, 1);
        g.restore();
      }
      if (this.ai === 'mage' && (this.st === 'cast')) {
        g.globalAlpha = 0.5 + Math.sin(this.t * 30) * 0.3; g.fillStyle = '#d85aff'; g.beginPath(); g.arc(cx, cy - 26, 4, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      }
    }
  }

  /* 그림 칸 고르기 */
  const FLIP = { charge: true, wolf: true, crab: false, hop: false, swoop: false, bomber: true, golem: false, hollow: true, octo: false };
  const FRAME = {
    hop: (e) => [e.type, e.st === 'air' ? 3 : e.st === 'crouch' ? 2 : Math.floor(e.t * 3) % 2],
    charge: (e) => ['boar', e.st === 'dash' ? 2 : e.st === 'dazed' ? 3 : e.st === 'windup' ? (Math.floor(e.t * 12) % 2) : Math.floor((e.walkT || e.t) * 5) % 2],
    swoop: (e) => ['bat', Math.floor(e.t * 10) % 2],
    turret: (e) => ['turret', e.st === 'shut' ? 1 : e.tele > 0 ? 2 : 0],
    ghost: (e) => ['ghost', Math.floor(e.t * 4) % 4],
    plant: (e) => ['plant', e.st === 'bite' ? 2 : e.st === 'open' || e.tele > 0 ? 1 : 0],
    crab: (e) => ['crab', Math.floor(e.t * 6) % 2],
    golem: (e) => ['golem', e.st === 'raise' ? 2 : e.st === 'slam' ? 0 : Math.floor(e.t * 2) % 2],
    wisp: (e) => [e.type === 'icewisp' ? 'wisp' : 'wisp', Math.floor(e.t * 9) % 3],
    bomber: (e) => ['bomber', e.st === 'throw' ? 2 : Math.floor(e.t * 6) % 2],
    swarm: (e) => ['bug', Math.floor(e.t * 16) % 2],
    wolf: (e) => ['wolf', e.st === 'lunge' ? 2 : e.st === 'circle' || e.st === 'chase' ? 1 + (Math.floor(e.t * 8) % 2) - 1 : 0],
    worm: (e) => ['worm', e.st === 'hidden' ? 0 : e.st === 'bite' ? 2 : 1],
    octo: (e) => ['octo', e.tele > 0 ? 1 : Math.floor(e.t * 3) % 2],
    hollow: (e) => ['hollow', e.st === 'swing' ? 2 : e.st === 'heap' ? 0 : Math.floor((e.walkT || 0) * 4) % 2],
    mimic: (e) => ['mimic', e.st === 'sleep' ? 0 : e.st === 'bite' ? 2 : 1],
    shade: (e) => ['shade', Math.floor(e.t * 8) % 4],
    drone: (e) => ['drone', e.tele > 0 ? 2 : Math.floor(e.t * 12) % 2],
    none: (e) => [e.type, e.hurtT > 0 ? 1 : 0],
  };

  /* ───────── 행동 ───────── */
  const INIT = {
    none(e) { e.noContact = true; e.noKnock = true; e.weight = 99; e.preKill = () => { e.hp = e.maxHp; return true; }; },
    turret(e) { e.noKnock = true; e.weight = 99; },
    plant(e) { e.weight = 99; },
    worm(e) { e.st = 'hidden'; e.noContact = true; },
    mimic(e) { e.st = 'sleep'; e.noContact = true; },
    swarm(e) { e.phase = Math.random() * 6; },
    wisp(e) { e.phase = Math.random() * 6; },
  };
  const AI = {
    /* 젤리: 통통 뛰어 다가온다 */
    hop(e, dt) {
      const p = e.p;
      if (e.st === 'idle') {
        if (e.sees(110) || e.aggro) { if (e.stT > 0.5 + Math.random() * 0.3) { e.set('crouch'); } }
        else if (e.stT > 1.2 + Math.random()) { e.set('crouch'); e.wanderHop = true; }
      } else if (e.st === 'crouch') {
        if (e.stT > 0.25) {
          e.set('air');
          const tgt = e.wanderHop || !p ? [e.home.x + (Math.random() - 0.5) * 60, e.home.y + (Math.random() - 0.5) * 40] : [p.x, p.y];
          e.wanderHop = false;
          const [nx, ny] = U.norm(tgt[0] - e.x, tgt[1] - e.y);
          e.hv = [nx * e.speed * 2.2, ny * e.speed * 2.2];
          sfx('squish');
        }
      } else if (e.st === 'air') {
        const k = e.stT / 0.38;
        e.jz = Math.sin(Math.min(1, k) * Math.PI) * (e.big ? 10 : 7);
        e.go(e.hv[0] * dt, e.hv[1] * dt);
        if (k >= 1) { e.jz = 0; e.set('idle'); G.fx.dust(e.x, e.y, 2); }
      }
    },
    /* 멧돼지: 발을 구르다 돌진, 벽에 부딪히면 어지럽다 */
    charge(e, dt, Wd) {
      const p = e.p;
      if (e.st === 'idle') {
        e.wander(dt); e.walkT = (e.walkT || 0) + dt;
        if (e.sees(130) || (e.aggro && e.dist() < 180)) { e.set('windup'); e.telegraph(0.5); e.dirX = Math.sign(p.x - e.x) || 1; }
      } else if (e.st === 'windup') {
        if (Math.random() < dt * 20) G.fx.dust(e.x - e.dirX * 8, e.y, 1);
        e.dirX = Math.sign(p.x - e.x) || e.dirX;
        if (e.stT > 0.55) { e.set('dash'); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('growl'); }
      } else if (e.st === 'dash') {
        const sp = e.speed * 4.2;
        const r = e.go(e.cv[0] * sp * dt, e.cv[1] * sp * dt);
        e.vx = e.cv[0] * sp; e.vy = e.cv[1] * sp;
        if (Math.random() < dt * 30) G.fx.dust(e.x, e.y, 1);
        if (r.hitX || r.hitY) { e.set('dazed'); e.stunT = 1.4; Wd.shake(2, 0.15); sfx('impact'); G.fx.sparks(e.x + e.cv[0] * 10, e.y - 8, 6, '#ffffff'); }
        else if (e.stT > 1.1) e.set('rest');
      } else if (e.st === 'dazed' || e.st === 'rest') { if (e.stT > 0.7) e.set('idle'); }
    },
    /* 박쥐: 매달려 있다가 물결치며 덮친다 */
    swoop(e, dt) {
      const p = e.p;
      if (e.st === 'idle') { if (e.sees(100) || e.aggro) e.set('fly'); else { e.zfly = -6; return; } }
      e.zfly = 0;
      if (e.st === 'fly') {
        e.phase = (e.phase || 0) + dt * 4;
        const tx = p.x + Math.cos(e.phase) * 30, ty = p.y - 6 + Math.sin(e.phase * 1.3) * 20;
        e.toward(tx, ty, e.speed, dt);
        if (e.stT > 2 + Math.random()) { e.set('dive'); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('shriek'); }
      } else if (e.st === 'dive') {
        e.x += e.cv[0] * e.speed * 2.4 * dt; e.y += e.cv[1] * e.speed * 2.4 * dt;
        if (e.stT > 0.5) e.set('fly');
      }
    },
    /* 궁수: 거리를 두고 시위를 당긴다 */
    archer(e, dt) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(150) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'aim') {
        e.aim = U.angle(p.x - e.x, p.y - 6 - (e.y - 10)); e.dir = U.dir4(Math.cos(e.aim), Math.sin(e.aim), e.dir);
        e.state = 'bow';
        if (e.stT > 0.7) {
          C().shoot({ kind: 'arrow', owner: 'foe', x: e.x, y: e.y - 2, vx: Math.cos(e.aim) * 190, vy: Math.sin(e.aim) * 190, dmg: e.atk, r: 3, life: 1.2, blockable: true, reflectable: true, blockLv: 1, z: e.z });
          sfx('shoot'); e.set('move'); e.cool = 1.2 + Math.random();
        }
        return;
      }
      e.cool = (e.cool || 0) - dt;
      // 너무 가까우면 물러나고, 멀면 다가간다
      if (d < 60) { const r = e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); if (r.hitX && r.hitY) e.cool = 0; }
      else if (d > 120) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; }
      else { e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); const s = Math.sin(e.t * 1.5) > 0 ? 1 : -1; const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.go(-ny * s * e.speed * 0.5 * dt, nx * s * e.speed * 0.5 * dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt * 0.6; }
      if (e.cool <= 0 && e.sees(170)) { e.set('aim'); e.telegraph(0.45); }
    },
    /* 징수 기사: 방패로 막으며 다가와 크게 벤다 */
    knight(e, dt) {
      const p = e.p;
      if (!e.sees(140) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'windup') {
        e.state = 'attack'; e.atkFrame = 0;
        if (e.stT > 0.45) { e.set('swing'); const f = U.DV[e.dir]; e.swingA0 = U.angle(f[0], f[1]) - 1.2; e.swingA = e.swingA0; e.hitDone = false; sfx('swing'); const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 160; e.ky = ny * 160; }
        return;
      }
      if (e.st === 'swing') {
        e.state = 'attack'; e.atkFrame = 1;
        e.swingA = e.swingA0 + (e.stT / 0.2) * 2.4;
        if (!e.hitDone && e.dist() < 26) {
          const a = U.angle(p.x - e.x, p.y - 6 - (e.y - 8));
          if (Math.abs(U.angDiff(e.swingA, a)) < 1.2) { e.hitDone = true; C().hurtPlayer(p, e.atk + 1, e, {}); }
        }
        if (e.stT > 0.22) { e.set('recover'); }
        return;
      }
      if (e.st === 'recover') { e.state = 'idle'; if (e.stT > 0.6) e.set('idle'); return; }
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (d > 22) { e.toward(p.x, p.y, e.speed, dt); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); }
      else e.state = 'idle';
      if (d < 30 && e.stT > 0.5) { e.set('windup'); e.telegraph(0.45); }
    },
    /* 마도사: 순간이동 후 따라오는 구슬 */
    mage(e, dt, Wd) {
      const p = e.p;
      e.state = 'idle';
      if (!e.sees(160) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
      if (e.st === 'idle' && e.stT > 1.2) { e.set('cast'); e.telegraph(0.6); }
      else if (e.st === 'cast') {
        e.state = 'cast';
        if (e.stT > 0.7) {
          const n = e.tier >= 4 ? 3 : 1;
          for (let i = 0; i < n; i++) { const a = U.angle(p.x - e.x, p.y - e.y) + (i - (n - 1) / 2) * 0.4; C().shoot({ kind: 'orb', owner: 'foe', x: e.x, y: e.y - 14, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, dmg: e.atk, r: 4, life: 2.6, homing: 1.4, target: p, col: '#d85aff', trail: '#b87aff', blockable: true, reflectable: true, blockLv: 2, ghost: true }); }
          sfx('foeshot'); e.set('blink');
        }
      } else if (e.st === 'blink') {
        if (e.stT > 0.5) {
          // 순간이동: 주인공 주변 빈 곳
          for (let k = 0; k < 12; k++) {
            const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 40;
            const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
            if (Wd.map.boxFree(x - e.bw / 2, y - e.bh, e.bw, e.bh, e.z, e) && !Wd.map.hazardAt(x, y - 2)) { G.fx.glow(e.x, e.y - 10, '#d85aff', 10); e.x = x; e.y = y; G.fx.glow(x, y - 10, '#d85aff', 10); sfx('warp'); break; }
          }
          e.set('idle');
        }
      }
    },
    /* 석상: 눈을 뜨면 쏜다. 뒤에서 치거나 폭탄 */
    turret(e, dt) {
      const p = e.p;
      e.kx = e.ky = 0;
      if (e.st === 'idle' || e.st === 'shut') {
        if (e.sees(170)) { if (e.stT > 1.3) { e.set('aim'); e.telegraph(0.5); } }
        else if (e.stT > 2) e.set('shut');
      } else if (e.st === 'aim') {
        if (e.stT > 0.55) {
          const a = U.angle(p.x - e.x, p.y - 8 - (e.y - 12));
          const spread = e.tier >= 3 ? [-0.25, 0, 0.25] : [0];
          for (const o of spread) C().shoot({ kind: 'orb', owner: 'foe', x: e.x, y: e.y - 12, vx: Math.cos(a + o) * 130, vy: Math.sin(a + o) * 130, dmg: e.atk, r: 3, life: 2, col: '#ff5a7a', blockable: true, reflectable: true, blockLv: 1 });
          sfx('foeshot'); e.set('idle');
        }
      }
    },
    /* 망령: 벽을 지나 천천히. 흰빛 · 등불에 드러난다 */
    ghost(e, dt) {
      const p = e.p;
      if (p.lantern && e.dist() < 60) e.revealed = true;
      if (e.dist() < 150) { const r = e.revealed ? 1 : 0.7; e.toward(p.x, p.y - 4, e.speed * r, dt); }
      e.noContact = !e.revealed && !e.aggro && e.t % 3 > 1.5;
    },
    /* 덩굴 입: 가까이 오면 벌렸다 문다, 멀면 씨앗 */
    plant(e, dt) {
      const p = e.p;
      e.kx = e.ky = 0;
      const d = e.dist();
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (e.st === 'idle') {
        if (d < 34 && e.stT > 0.4) { e.set('open'); e.telegraph(0.35); }
        else if (d < 110 && e.stT > 2.2 && e.sees(110)) { e.set('spit'); e.telegraph(0.4); }
      } else if (e.st === 'open') { if (e.stT > 0.35) { e.set('bite'); sfx('squish'); if (d < 30) C().hurtPlayer(p, e.atk + 1, e, {}); } }
      else if (e.st === 'bite') { if (e.stT > 0.4) e.set('idle'); }
      else if (e.st === 'spit') { if (e.stT > 0.4) { const a = U.angle(p.x - e.x, p.y - e.y); C().shoot({ kind: 'rock', owner: 'foe', x: e.x, y: e.y - 6, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, dmg: e.atk, r: 3, life: 1, blockable: true, blockLv: 1, drawFn(g, x, y) { g.fillStyle = '#6a3a1a'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#a86a3a'; g.fillRect(x - 1, y - 2, 2, 1); } }); sfx('foeshot'); e.set('idle'); } }
    },
    /* 바위 게: 옆으로 걷는다. 앞은 단단하다 */
    crab(e, dt) {
      const p = e.p;
      if (!e.sees(120) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      // 주인공과 가로줄을 맞추려 옆걸음
      const dy = p.y - e.y, dx = p.x - e.x;
      e.dirX = Math.sign(dx) || 1;
      const sp = e.speed;
      if (Math.abs(dy) > 6) e.go(0, Math.sign(dy) * sp * dt);
      else if (Math.abs(dx) > 18) e.go(Math.sign(dx) * sp * 0.7 * dt, 0);
      if (e.stT > 1.6 && Math.abs(dy) < 10 && Math.abs(dx) < 40) { e.set('snap'); e.kx = Math.sign(dx) * 200; sfx('clank'); }
      if (e.st === 'snap' && e.stT > 0.4) e.set('idle');
    },
    /* 골렘: 느리게 걸어와 두 팔로 내려친다 (충격파) */
    golem(e, dt, Wd) {
      const p = e.p;
      if (!e.sees(150) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'raise') {
        if (e.stT > 0.8) {
          e.set('slam'); Wd.shake(5, 0.3); sfx('impact'); G.fx.dust(e.x, e.y, 16); G.fx.ring(e.x, e.y, '#d8c8a8', 44, 0.45, 2);
          if (d < 44 && !p.jz) C().hurtPlayer(p, e.atk, e, {});
          // 석상 · 바위 부서짐
          C().shoot({ kind: 'rock', owner: 'foe', x: e.x, y: e.y, vx: 0, vy: 0, dmg: 0, r: 0, life: 0.01 });
        }
        return;
      }
      if (e.st === 'slam') { if (e.stT > 0.9) e.set('idle'); return; }
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (d > 30) e.toward(p.x, p.y, e.speed, dt);
      if (d < 46 && e.stT > 1) { e.set('raise'); e.telegraph(0.8); sfx('growl'); }
    },
    /* 도깨비불: 주인공 주위를 돌다 달려든다 */
    wisp(e, dt) {
      const p = e.p;
      if (!e.sees(130) && !e.aggro) { e.phase += dt; e.x = e.home.x + Math.cos(e.phase) * 16; e.y = e.home.y + Math.sin(e.phase * 1.4) * 10; return; }
      e.aggro = true;
      if (e.st === 'dash') { e.x += e.cv[0] * 200 * dt; e.y += e.cv[1] * 200 * dt; if (e.stT > 0.45) e.set('idle'); }
      else {
        e.phase += dt * 2.2;
        e.toward(p.x + Math.cos(e.phase) * 44, p.y - 6 + Math.sin(e.phase) * 30, e.speed * 1.4, dt);
        if (e.stT > 2.4) { e.set('dash'); e.telegraph(0.25); e.cv = U.norm(p.x - e.x, p.y - e.y); }
      }
      if (Math.random() < dt * 20) G.fx.part({ x: e.x + (Math.random() - 0.5) * 6, y: e.y, z: 8 + Math.random() * 6, vz: 16, g: 0, life: 0.4, col: e.el === 'ice' ? '#d8f4ff' : '#ffb040', size: 1, glow: true });
    },
    /* 고블린: 폭탄을 던지고 도망 */
    bomber(e, dt) {
      const p = e.p;
      if (!e.sees(140) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (e.st === 'throw') {
        if (e.stT > 0.4 && !e.thrown) {
          e.thrown = true;
          const b = new FoeBomb({ x: e.x, y: e.y, tx: p.x + (p.vx || 0) * 0.5, ty: p.y + (p.vy || 0) * 0.5, dmg: e.atk + 1 });
          W().add(b); sfx('throw');
        }
        if (e.stT > 0.8) { e.set('run'); e.thrown = false; }
        return;
      }
      if (e.st === 'run') { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed * 1.2, dt); if (e.stT > 1) e.set('idle'); return; }
      if (d > 90) e.toward(p.x, p.y, e.speed, dt);
      if (e.stT > 1.3 && d < 130) { e.set('throw'); e.telegraph(0.3); }
    },
    /* 빛벌레 떼 */
    swarm(e, dt) {
      const p = e.p;
      e.phase += dt * 5;
      if (e.sees(120) || e.aggro) { e.aggro = true; e.toward(p.x + Math.cos(e.phase) * 12, p.y - 8 + Math.sin(e.phase * 1.3) * 10, e.speed, dt); }
      else { e.x = e.home.x + Math.cos(e.phase * 0.5) * 10; e.y = e.home.y + Math.sin(e.phase * 0.7) * 6; }
    },
    /* 늑대: 둘레를 돌다 물어뜯는다. 무리로 다닌다 */
    wolf(e, dt) {
      const p = e.p;
      if (!e.sees(160) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      if (e.st === 'lunge') { const r = e.go(e.cv[0] * 230 * dt, e.cv[1] * 230 * dt); if (e.stT > 0.32 || r.hitX || r.hitY) e.set('back'); return; }
      if (e.st === 'back') { e.toward(e.x - (p.x - e.x), e.y - (p.y - e.y), e.speed, dt); if (e.stT > 0.5) e.set('circle'); return; }
      if (e.st === 'crouch') { if (e.stT > 0.35) { e.set('lunge'); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('growl'); } return; }
      e.phase = (e.phase || Math.random() * 6) + dt * 1.4 * (e.id.charCodeAt(1) % 2 ? 1 : -1);
      e.toward(p.x + Math.cos(e.phase) * 48, p.y + Math.sin(e.phase) * 34, e.speed, dt);
      e.st = 'circle';
      if (e.stT > 1.8 + Math.random() && d < 80) { e.set('crouch'); e.telegraph(0.35); e.dirX = Math.sign(p.x - e.x) || 1; }
    },
    /* 모래 벌레: 모래 속을 헤엄쳐 발밑에서 솟는다 */
    worm(e, dt) {
      const p = e.p;
      if (e.st === 'hidden') {
        e.noContact = true;
        if (e.dist() < 150) { e.toward(p.x, p.y, e.speed * 0.9, dt); if (Math.random() < dt * 10) G.fx.dust(e.x, e.y, 1); }
        if (e.dist() < 14 && e.stT > 1) { e.set('rise'); e.telegraph(0.4); }
      } else if (e.st === 'rise') { if (e.stT > 0.4) { e.set('bite'); e.noContact = false; sfx('growl'); G.fx.dust(e.x, e.y, 10); if (e.dist() < 18) C().hurtPlayer(p, e.atk, e, {}); } }
      else if (e.st === 'bite') { if (e.stT > 1.4) { e.set('hidden'); } }
      e.inv = e.st === 'hidden' ? 1 : e.inv > 0.5 ? 0 : e.inv;
    },
    /* 문어: 물 위로 떠올라 돌을 뱉는다 */
    octo(e, dt) {
      const p = e.p;
      e.phase = (e.phase || 0) + dt;
      if (e.sees(140)) { if (e.stT > 1.8) { e.telegraph(0.35); e.set('spit'); } }
      if (e.st === 'spit' && e.stT > 0.35) { const a = U.angle(p.x - e.x, p.y - e.y); C().shoot({ kind: 'rock', owner: 'foe', x: e.x, y: e.y - 4, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, dmg: e.atk, r: 3, life: 1.3, blockable: true, blockLv: 1, drawFn(g, x, y) { g.fillStyle = '#6a6a7a'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#a8a8b8'; g.fillRect(x - 1, y - 2, 2, 1); } }); sfx('foeshot'); e.set('idle'); }
      if (e.st === 'idle') e.go(Math.cos(e.phase) * 12 * dt, Math.sin(e.phase * 0.7) * 8 * dt);
      e.wadeCut = 3;
    },
    /* 빈 기사: 쓰러져도 다시 일어난다 (흰빛 · 불로 끝낸다) */
    hollow(e, dt) {
      const p = e.p;
      if (e.st === 'heap') { e.noContact = true; if (e.stT > 3) { e.hp = Math.ceil(e.maxHp * 0.5); e.set('idle'); e.noContact = false; sfx('clank'); G.fx.glow(e.x, e.y - 8, '#6ad8ff', 8); } return; }
      if (!e.sees(130) && !e.aggro) { e.wander(dt); return; }
      e.aggro = true;
      const d = e.dist();
      e.dirX = Math.sign(p.x - e.x) || 1;
      if (e.st === 'windup') { if (e.stT > 0.5) { e.set('swing'); sfx('swing'); if (d < 26) C().hurtPlayer(p, e.atk, e, {}); } return; }
      if (e.st === 'swing') { if (e.stT > 0.4) e.set('idle'); return; }
      if (d > 20) { e.toward(p.x, p.y, e.speed, dt); e.walkT = (e.walkT || 0) + dt; }
      if (d < 28 && e.stT > 0.8) { e.set('windup'); e.telegraph(0.5); }
    },
    /* 가짜 상자 */
    mimic(e, dt) {
      const p = e.p;
      if (e.st === 'sleep') { e.noContact = true; e.inv = 0; if (e.dist() < 22 || e.aggro) { e.set('wake'); sfx('shriek'); e.noContact = false; W().shake(2, 0.2); } return; }
      if (e.st === 'wake') { if (e.stT > 0.4) e.set('hop'); return; }
      if (e.st === 'hop') {
        e.jz = Math.abs(Math.sin(e.stT * 8)) * 6;
        e.toward(p.x, p.y, e.speed, dt);
        if (e.dist() < 20 && e.stT > 0.4) { e.set('bite'); e.telegraph(0.2); }
      } else if (e.st === 'bite') { e.jz = 0; if (e.stT > 0.5) e.set('hop'); }
    },
    /* 흑점의 그림자: 빛을 먹으러 곧장 */
    shade(e, dt) {
      const p = e.p;
      if (e.st === 'fade') { if (e.stT > 0.6) { const a = Math.random() * Math.PI * 2; e.x = p.x + Math.cos(a) * 70; e.y = p.y + Math.sin(a) * 50; e.set('idle'); } return; }
      e.toward(p.x, p.y - 6, e.speed * (0.8 + Math.sin(e.t * 2) * 0.3), dt);
      if (e.stT > 3 && Math.random() < dt) { e.set('fade'); G.fx.glow(e.x, e.y - 8, '#3a1a5a', 12); }
    },
    /* 드론: 거리 유지하며 레이저 */
    drone(e, dt) {
      const p = e.p;
      if (!e.sees(170) && !e.aggro) { e.phase = (e.phase || 0) + dt; e.x = e.home.x + Math.cos(e.phase) * 24; e.y = e.home.y + Math.sin(e.phase * 2) * 8; return; }
      e.aggro = true;
      const d = e.dist();
      const want = 80;
      const [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
      e.x += (d > want ? nx : -nx) * e.speed * 0.6 * dt + -ny * Math.sin(e.t) * 20 * dt;
      e.y += (d > want ? ny : -ny) * e.speed * 0.6 * dt + nx * Math.sin(e.t) * 20 * dt;
      if (e.stT > 1.6) { e.set('fire'); e.telegraph(0.4); }
      if (e.st === 'fire' && e.stT > 0.4) { const a = U.angle(p.x - e.x, p.y - e.y); C().shoot({ kind: 'beam', owner: 'foe', x: e.x, y: e.y - 6, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, dmg: e.atk, r: 3, life: 1, col: '#ff5a5a', blockable: true, reflectable: true, blockLv: 2 }); sfx('beam'); e.set('idle'); }
    },
  };
  /* 고블린의 폭탄: 포물선으로 날아가 터진다 */
  class FoeBomb extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'foebomb', solid: false, t: 0, fuse: 1.2 }, o)); this.x0 = this.x; this.y0 = this.y; }
    update(dt) {
      this.t += dt;
      const k = Math.min(1, this.t / 0.6);
      if (k < 1) { this.x = U.lerp(this.x0, this.tx, k); this.y = U.lerp(this.y0, this.ty, k); this.jz = Math.sin(k * Math.PI) * 24; }
      else this.jz = 0;
      if (this.t > this.fuse) {
        this.dead = true;
        const p = W().player;
        sfx('explode'); W().shake(4, 0.3); G.fx.sparks(this.x, this.y, 24, '#ffb84a', 140); G.fx.ring(this.x, this.y, '#ffe8a8', 26, 0.4, 3); G.fx.dust(this.x, this.y, 10);
        if (p && U.dist(this.x, this.y, p.x, p.y - 6) < 26) C().hurtPlayer(p, this.dmg, this, {});
        for (const f of C().foes()) if (U.dist(this.x, this.y, f.x, f.y) < 24) C().damage(f, 4, { src: 'bomb', el: 'bomb', unblockable: true });
        const m = W().map;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) C().cutAt(m, Math.floor(this.x / TS) + dx, Math.floor(this.y / TS) + dy, 'bomb');
      }
    }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, 4, 1.6, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 4 - this.jz);
      g.fillStyle = this.t > this.fuse - 0.4 && Math.floor(this.t * 16) % 2 ? '#ff5a3a' : '#2a2a4a';
      g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffd84a'; g.fillRect(x + 1, y - 6, 1, 2);
    }
  }

  function spawn(type, x, y, o) {
    const e = new Foe(type, Object.assign({ x, y }, o));
    const m = W().map;
    if (m) { E.settle(m, e); }
    return W().add(e);
  }

  G.foes = { T, Foe, spawn, art, tierOf, FoeBomb, AI, TIER_HP };
})();
