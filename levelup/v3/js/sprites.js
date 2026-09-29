/* 사람 도트: 미소년 · 미소녀 등신(머리 크고 눈이 큰) 24×32 칸.
   생김새(spec) 하나로 네 방향 × 여러 동작을 코드로 그린다. 한 번 그린 칸은 캐시.
   얼굴은 폭 12 · 눈은 3×4(소녀) / 3×3(소년)에 반짝이, 앞머리는 눈썹까지만, 옆머리로 얼굴선을 감싼다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx;
  const FW = 24, FH = 32;
  const OUT = '#1c1026';

  /** 기준색 → [외곽 가까운 어둠, 어둠, 기본, 밝음, 반짝] */
  function tones(hex) {
    return [U.mix(U.shade(hex, 0.42), '#1a0f24', 0.4), U.shade(hex, 0.74), hex, U.mix(hex, '#ffffff', 0.26), U.mix(hex, '#ffffff', 0.6)];
  }
  const SKIN = { fair: '#ffe4d2', light: '#fbd4b8', tan: '#e4ac80', brown: '#bc7e54', deep: '#80523a', pale: '#f6e8ec', ash: '#cac2d0', blue: '#a8c8e8' };

  function norm(spec) {
    const s = Object.assign({
      gender: 'boy', age: 'teen', skin: 'light', hair: 'short', hc: '#5a3a28', eye: '#4a7ad8',
      top: 'tunic', tc: '#3aa84a', trim: '#e8d8a8', bottom: 'pants', bc: '#6a5a44', boots: '#5a3a22', cape: null, hat: null, acc: [], belt: '#6a4424',
      sleeve: 'short', glasses: false, scar: false, ears: null, mask: false, beard: null, build: 'slim', eyeShape: 'round',
    }, spec || {});
    s.skinC = SKIN[s.skin] || s.skin;
    if (s.hat === 'straw' && !spec.hatC) s.hatC = '#e8c878';
    if (s.hat === 'helm' && !spec.hatC) s.hatC = '#9a9ab8';
    return s;
  }

  /* ───────── 한 칸 ───────── */
  function drawFrame(s, pose) {
    const b = X.brush(FW, FH);
    const dir = pose.dir;
    const child = s.age === 'child', old = s.age === 'old';
    const oy = (pose.bob || 0) + (pose.crouch ? 2 : 0) + (child ? 3 : 0) + (old ? 1 : 0);
    const C = { SK: tones(s.skinC), H: tones(s.hc), T: tones(s.tc), B: tones(s.bc), BT: tones(s.boots), TR: tones(s.trim), E: tones(s.eye) };
    const L = { head: 1 + oy, torso: 15 + oy, waist: 20 + oy, hip: 22 + oy - (child ? 1 : 0), foot: 30 };
    if (s.cape && dir !== 'up') cape(b, s, dir, L, false);
    backHair(b, s, dir, L, C, pose);
    legs(b, s, dir, L, C, pose);
    torso(b, s, dir, L, C, pose);
    if (s.cape && dir === 'up') cape(b, s, dir, L, true);
    arms(b, s, dir, L, C, pose);
    headFace(b, s, dir, L, C, pose);
    for (const a of s.acc) accessory(b, a, s, dir, L, C);
    return X.outline(b.put(), OUT);
  }

  function cape(b, s, dir, L, front) {
    const CP = tones(s.cape);
    const side = dir === 'left';
    for (let y = L.torso; y <= L.foot - 1; y++) {
      const w = 5 + ((y - L.torso) >> 1);
      const x0 = side ? 12 : 12 - w, x1 = side ? 12 + w : 12 + w - 1;
      for (let x = x0; x <= x1; x++) {
        let c = CP[2];
        if (front) c = x < 12 - w + 2 ? CP[3] : x > 12 + w - 3 ? CP[1] : (x + y) % 5 === 0 ? CP[1] : CP[2];
        else c = x <= x0 + 1 ? CP[1] : CP[2];
        if (y === L.foot - 1) c = CP[0];
        b.px(x, y, c);
      }
    }
  }

  function legs(b, s, dir, L, C, pose) {
    const skirt = s.bottom === 'skirt';
    const longSkirt = s.bottom === 'long' || s.top === 'robe' || s.top === 'dress';
    const legCol = skirt || longSkirt ? C.SK : C.B;
    const leg = (x0, lift, fwd) => {
      const top = L.hip, bot = L.foot - lift;
      for (let y = top; y <= bot; y++) {
        const boot = y >= bot - 2;
        const K = boot ? C.BT : legCol;
        const xs = x0 + (dir === 'left' ? Math.round(fwd * (y - top) / 8) : 0);
        b.px(xs, y, K[boot ? 2 : 1]); b.px(xs + 1, y, K[boot ? 3 : 2]); if (!boot || dir !== 'left') b.px(xs + 2, y, K[1]);
        if (boot && y === bot) { if (dir === 'left') { b.px(xs - 1, y, C.BT[1]); } }
      }
    };
    const l = pose.legL || 0, r = pose.legR || 0;
    if (dir === 'left') { leg(11, Math.max(0, r), -r); leg(10, Math.max(0, l), l); }
    else { leg(8, Math.max(0, l), 0); leg(13, Math.max(0, r), 0); }
  }

  function torso(b, s, dir, L, C, pose) {
    const girl = s.gender === 'girl', broad = s.build === 'broad', child = s.age === 'child';
    const side = dir === 'left';
    const skirt = s.bottom === 'skirt', long = s.bottom === 'long' || s.top === 'robe' || s.top === 'dress';
    for (let y = L.torso; y <= L.hip + (long ? 7 : skirt ? 3 : 0); y++) {
      let hw = side ? 4 : broad ? 6 : 5;
      if (!side && girl && y >= L.waist - 1 && y <= L.waist) hw -= 1;
      if (child && !side) hw = 4;
      const inSkirt = y > L.hip - 1 && (skirt || long);
      if (inSkirt) hw += Math.min(long ? 3 : 3, (y - L.hip + 2) >> (long ? 1 : 0));
      const top = y < L.hip && !(long && y >= L.waist);
      const K = inSkirt ? (s.top === 'robe' || s.top === 'dress' ? C.T : C.B) : top ? C.T : C.B;
      const x0 = side ? 9 : 12 - hw, x1 = side ? 9 + hw * 2 - 2 : 12 + hw - 1;
      for (let x = x0; x <= x1; x++) {
        let c = K[2];
        if (side) { if (x >= x1 - 1) c = K[1]; else if (x === x0) c = K[3]; }
        else { if (x === x0) c = K[1]; else if (x === x1) c = K[0]; else if (x === x1 - 1) c = K[1]; else if (x === x0 + 1) c = K[3]; }
        if (dir === 'up') { c = x === x0 ? K[1] : x === x1 ? K[0] : K[2]; }
        if (inSkirt && y === L.hip + (long ? 7 : 3)) c = K[1];
        if (inSkirt && (x - x0) % 3 === 2 && y > L.hip) c = K[1];      // 주름
        b.px(x, y, c);
      }
    }
    // 장식 (앞모습 · 옆모습)
    const TR = C.TR;
    if (dir === 'down') {
      if (s.top === 'tunic' || s.top === 'dress') { b.px(11, L.torso, TR[3]); b.px(12, L.torso, TR[3]); b.px(10, L.torso, TR[2]); b.px(13, L.torso, TR[2]); b.px(11, L.torso + 1, TR[1]); b.px(12, L.torso + 1, TR[1]); }
      if (s.top === 'robe') for (let y = L.torso; y <= L.hip + 6; y++) { b.px(11, y, TR[2]); b.px(12, y, TR[1]); }
      if (s.top === 'coat' || s.top === 'vest') { for (let y = L.torso; y <= L.hip; y++) { b.px(11, y, C.T[0]); } b.px(10, L.torso, TR[2]); b.px(13, L.torso, TR[2]); b.px(10, L.torso + 1, TR[2]); b.px(13, L.torso + 1, TR[2]); if (s.top === 'vest') for (let y = L.torso + 1; y < L.hip; y++) { b.px(10, y, U.mix(s.trim, '#ffffff', 0.2)); b.px(13, y, U.mix(s.trim, '#ffffff', 0.2)); } }
      if (s.top === 'armor') { for (let x = 8; x <= 15; x++) { b.px(x, L.torso + 1, TR[3]); b.px(x, L.torso + 4, TR[1]); } b.px(11, L.torso + 2, TR[4]); b.px(12, L.torso + 2, TR[4]); }
      if (s.top === 'dress') { b.px(12, L.waist, TR[3]); b.px(11, L.waist, TR[2]); }
    } else if (dir === 'left') {
      if (s.top === 'tunic' || s.top === 'dress') { b.px(9, L.torso, TR[2]); b.px(10, L.torso, TR[3]); }
      if (s.top === 'armor') for (let x = 9; x <= 15; x++) b.px(x, L.torso + 1, TR[3]);
    }
    if (s.belt && s.top !== 'robe' && s.top !== 'dress') {
      const BL = tones(s.belt);
      const x0 = side ? 9 : 12 - (broad ? 6 : 5), x1 = side ? 15 : 12 + (broad ? 6 : 5) - 1;
      for (let x = x0; x <= x1; x++) b.px(x, L.hip - 1, BL[1]);
      if (dir === 'down') { b.px(11, L.hip - 1, '#f0d890'); b.px(12, L.hip - 1, '#c8a050'); }
    }
  }

  function arms(b, s, dir, L, C, pose) {
    const long = s.sleeve === 'long' || s.top === 'robe' || s.top === 'coat' || s.top === 'armor';
    const sl = (y) => (long || y < L.torso + 3 ? C.T : C.SK);
    const handTop = L.torso + 5;
    const drawArm = (x, sw, front, sideArm) => {
      if (sw === 'up') { for (let y = L.torso - 5; y <= L.torso + 1; y++) { const hand = y < L.torso - 3; const K = hand ? C.SK : sl(L.torso); b.px(x, y, K[2]); b.px(x + 1, y, K[1]); } return; }
      if (sw === 'fwd') {
        if (dir === 'down') { for (let y = L.torso + 1; y <= L.torso + 8; y++) { const K = y > L.torso + 6 ? C.SK : sl(y); b.px(x, y, K[2]); b.px(x + 1, y, K[1]); } return; }
        if (dir === 'left') { for (let xx = 3; xx <= 11; xx++) { const K = xx < 5 ? C.SK : sl(L.torso); b.px(xx, L.torso + 3, K[2]); b.px(xx, L.torso + 4, K[1]); } return; }
        for (let y = L.torso; y <= L.torso + 4; y++) { b.px(x, y, sl(y)[1]); b.px(x + 1, y, sl(y)[0]); }
        return;
      }
      const w = Math.round(sw || 0);
      for (let y = L.torso + 1; y <= L.torso + 7; y++) {
        const hand = y >= handTop + 1;
        const K = hand ? C.SK : sl(y);
        let xo = 0, yo = 0;
        if (dir === 'left') xo = Math.round(w * (y - L.torso) / 7);
        else yo = w > 0 ? -1 : w < 0 ? 0 : 0;
        b.px(x + xo, y + yo, K[front ? 2 : 1]); b.px(x + 1 + xo, y + yo, K[front ? 1 : 0]);
      }
    };
    const broad = s.build === 'broad', child = s.age === 'child';
    const hw = child ? 4 : broad ? 6 : 5;
    if (dir === 'down') { drawArm(12 - hw - 2, pose.armL, true); drawArm(12 + hw, pose.armR, true); }
    else if (dir === 'up') { drawArm(12 - hw - 2, pose.armR, false); drawArm(12 + hw, pose.armL, false); }
    else { drawArm(11, pose.armL, true); }
  }

  /* ───────── 머리 · 얼굴 ───────── */
  function headFace(b, s, dir, L, C, pose) {
    const t = L.head;           // 머리 꼭대기
    const SK = C.SK;
    // 얼굴 모양: 위는 머리카락이 덮으니 아래쪽 둥근 턱선이 중요하다
    const rows = dir === 'left'
      ? [[5, 7, 15], [6, 6, 15], [7, 5, 15], [8, 5, 15], [9, 5, 15], [10, 5, 15], [11, 5, 14], [12, 6, 14], [13, 7, 13]]
      : [[5, 7, 16], [6, 6, 17], [7, 6, 17], [8, 6, 17], [9, 6, 17], [10, 6, 17], [11, 6, 17], [12, 7, 16], [13, 8, 15]];
    for (const [ry, x0, x1] of rows) {
      const y = t + ry;
      for (let x = x0; x <= x1; x++) {
        let c = SK[2];
        if (dir === 'down') { if (x === x0 && ry > 6) c = SK[1]; if (ry === 13) c = SK[1]; if (x === x1) c = SK[1]; }
        if (dir === 'left' && x >= x1 - 1) c = SK[1];
        if (dir === 'up') c = SK[1];
        b.px(x, y, c);
      }
    }
    // 목
    if (dir !== 'up') { b.px(11, t + 14, SK[1]); b.px(12, t + 14, SK[1]); } else { b.px(11, t + 14, SK[0]); b.px(12, t + 14, SK[0]); }
    // 귀
    if (s.ears === 'elf') {
      if (dir === 'down') { b.px(5, t + 8, SK[2]); b.px(4, t + 7, SK[2]); b.px(3, t + 6, SK[3]); b.px(18, t + 8, SK[1]); b.px(19, t + 7, SK[2]); b.px(20, t + 6, SK[3]); }
      else if (dir === 'left') { b.px(15, t + 8, SK[2]); b.px(16, t + 7, SK[2]); b.px(17, t + 6, SK[3]); }
    }
    if (dir !== 'up') face(b, s, dir, t, C, pose);
    hairFront(b, s, dir, t, C, pose);
    if (s.ears === 'cat' || s.ears === 'fox') animalEars(b, s, dir, t, C);
    if (s.hat) hat(b, s, dir, t, C);
  }

  function face(b, s, dir, t, C, pose) {
    const girl = s.gender === 'girl';
    const E = C.E, SK = C.SK;
    const ey = t + 8;
    const big = girl || s.eyeBig || s.age === 'child';
    const eye = (x, outer) => {
      if (pose.blink || pose.eyes === 'closed') {
        b.px(x, ey + 2, OUT); b.px(x + 1, ey + 2, OUT); b.px(x + 2, ey + 2, OUT);
        if (girl) b.px(x + (outer < 0 ? -1 : 3), ey + 1, OUT);
        return;
      }
      if (pose.eyes === 'happy') { b.px(x, ey + 2, OUT); b.px(x + 1, ey + 1, OUT); b.px(x + 2, ey + 2, OUT); return; }
      // 윗눈꺼풀(속눈썹) 줄
      b.px(x, ey, OUT); b.px(x + 1, ey, OUT); b.px(x + 2, ey, OUT);
      if (girl) { b.px(x + (outer < 0 ? -1 : 3), ey, OUT); b.px(x + (outer < 0 ? -1 : 3), ey - 1, s.eyeShape === 'sharp' ? OUT : null); }
      if (s.eyeShape === 'sharp') { b.px(x + (outer < 0 ? 0 : 2), ey - 1, OUT); }
      // 눈동자: 위 짙게 → 아래 밝게
      const hgt = big ? 3 : 2;
      for (let k = 1; k <= hgt; k++) {
        const K = k === 1 ? E[0] : k === hgt ? E[3] : E[2];
        b.px(x, ey + k, k === 1 ? E[1] : K); b.px(x + 1, ey + k, K); b.px(x + 2, ey + k, k === 1 ? E[1] : K);
      }
      // 동공과 반짝이
      b.px(x + 1, ey + 2, U.shade(s.eye, 0.35));
      b.px(outer < 0 ? x : x + 2, ey + 1, '#ffffff');
      if (big) b.px(outer < 0 ? x + 2 : x, ey + hgt, E[4]);
      if (s.eyeShape === 'sleepy') { b.px(x, ey + 1, SK[1]); b.px(x + 1, ey + 1, SK[1]); b.px(x + 2, ey + 1, SK[1]); b.px(x, ey + 1, OUT); b.px(x + 1, ey + 1, OUT); b.px(x + 2, ey + 1, OUT); }
    };
    if (dir === 'down') {
      eye(7, -1); eye(14, 1);
      // 눈썹 (감정)
      if (pose.brow === 'angry') { b.px(7, ey - 2, OUT); b.px(8, ey - 1, OUT); b.px(16, ey - 2, OUT); b.px(15, ey - 1, OUT); }
      else if (pose.brow === 'sad') { b.px(8, ey - 2, OUT); b.px(7, ey - 1, OUT); b.px(15, ey - 2, OUT); b.px(16, ey - 1, OUT); }
      // 입 · 볼
      const my = t + 12;
      if (pose.mouth === 'open') { b.px(11, my, '#7a2030'); b.px(12, my, '#7a2030'); b.px(11, my + 1, '#d8505e'); b.px(12, my + 1, '#d8505e'); }
      else if (pose.mouth === 'smile') { b.px(10, my, '#a84a5a'); b.px(11, my + 1, '#a84a5a'); b.px(12, my + 1, '#a84a5a'); b.px(13, my, '#a84a5a'); }
      else if (pose.mouth === 'frown') { b.px(11, my, '#8a3a4a'); b.px(12, my, '#8a3a4a'); b.px(10, my + 1, '#8a3a4a'); }
      else { b.px(11, my, U.shade(s.skinC, 0.55)); b.px(12, my, U.shade(s.skinC, 0.7)); }
      if (girl || s.age === 'child' || pose.blush) { b.px(6, t + 11, '#ff8a9a', 0.55); b.px(7, t + 11, '#ff8a9a', 0.35); b.px(17, t + 11, '#ff8a9a', 0.55); b.px(16, t + 11, '#ff8a9a', 0.35); }
      if (s.glasses) { for (const gx of [6, 13]) { b.px(gx, ey - 1, '#d8e4f0'); b.px(gx + 4, ey - 1, '#d8e4f0'); b.px(gx, ey + 3, '#d8e4f0'); b.px(gx + 4, ey + 3, '#d8e4f0'); } b.px(11, ey, '#d8e4f0'); b.px(12, ey, '#d8e4f0'); }
      if (s.scar) { b.px(15, t + 10, '#c85a5a'); b.px(16, t + 11, '#c85a5a'); b.px(14, t + 9, '#c85a5a'); }
      if (s.beard) for (let x = 7; x <= 16; x++) { b.px(x, t + 12, s.beard); b.px(x, t + 13, s.beard); if (x > 8 && x < 15) b.px(x, t + 14, s.beard); }
      if (s.mask) { const mc = typeof s.mask === 'string' ? s.mask : (s.hatC || '#3a3040'); for (let x = 6; x <= 17; x++) for (let y = t + 11; y <= t + 13; y++) b.px(x, y, y === t + 11 ? U.mix(mc, '#ffffff', 0.15) : mc); }
      if (s.tear || pose.tear) { b.px(7, ey + 4, '#8ad8ff'); b.px(7, ey + 5, '#8ad8ff'); }
    } else {
      eye(6, -1);
      b.px(4, t + 10, C.SK[2]); b.px(4, t + 11, C.SK[1]);             // 코끝
      if (pose.mouth === 'open') { b.px(5, t + 12, '#7a2030'); b.px(6, t + 12, '#d8505e'); } else b.px(5, t + 12, U.shade(s.skinC, 0.55));
      if (girl) b.px(9, t + 11, '#ff8a9a', 0.5);
      if (s.glasses) { b.px(5, ey - 1, '#d8e4f0'); b.px(9, ey - 1, '#d8e4f0'); b.px(5, ey + 3, '#d8e4f0'); b.px(10, ey + 1, '#d8e4f0'); }
      if (s.mask) { const mc = typeof s.mask === 'string' ? s.mask : (s.hatC || '#3a3040'); for (let x = 4; x <= 12; x++) for (let y = t + 11; y <= t + 13; y++) b.px(x, y, mc); }
      if (s.beard) for (let x = 5; x <= 11; x++) { b.px(x, t + 12, s.beard); b.px(x, t + 13, s.beard); }
    }
  }

  /* 머리카락: 둥근 덮개 + 스타일별 앞머리 결 + 옆머리. 얼굴선 밖으로 1칸 부풀려 볼륨을 준다 */
  function hairFront(b, s, dir, t, C, pose) {
    const H = C.H, st = s.hair;
    if (st === 'bald') return;
    const cap = dir === 'up'
      ? [[0, 8, 15], [1, 6, 17], [2, 5, 18], [3, 5, 18], [4, 4, 19], [5, 4, 19], [6, 4, 19], [7, 4, 19], [8, 4, 19], [9, 4, 19], [10, 5, 18], [11, 5, 18], [12, 6, 17], [13, 7, 16]]
      : dir === 'left'
        ? [[0, 8, 14], [1, 6, 16], [2, 5, 17], [3, 4, 18], [4, 4, 18], [5, 4, 18], [6, 5, 18], [7, 11, 18], [8, 12, 18], [9, 12, 18], [10, 12, 17], [11, 13, 17]]
        : [[0, 8, 15], [1, 6, 17], [2, 5, 18], [3, 4, 19], [4, 4, 19], [5, 4, 19], [6, 4, 19]];
    for (const [ry, x0, x1] of cap) {
      const y = t + ry;
      for (let x = x0; x <= x1; x++) {
        let c = H[2];
        if (dir === 'up') { c = (x % 3 === 1 && ry > 2) ? H[1] : H[2]; if (x === x0) c = H[3]; if (x === x1) c = H[0]; if (ry <= 1) c = H[3]; if (ry === 2 && x > 7 && x < 12) c = H[4]; }
        else {
          if (x >= x1 - 1) c = H[1];
          if (x === x0) c = H[3];
          if (ry === 2 && x > x0 + 1 && x < x0 + 6) c = H[4];              // 천사 고리
          if (ry === 1 && x > x0 && x < x0 + 5) c = H[3];
        }
        if (st === 'buzz' && dir !== 'up') c = H[1];
        b.px(x, y, c);
      }
    }
    if (dir === 'up') { if (st === 'pony' || st === 'twin' || st === 'bun' || st === 'braid') backHairTop(b, s, t, C); return; }
    // 앞머리: 이마를 덮고 눈썹 선(t+7)까지. 스타일마다 결이 다르다
    const bang = (x, len, shade) => { for (let k = 0; k < len; k++) b.px(x, t + 6 + k, k === len - 1 ? H[1] : shade || H[2]); };
    const x0 = dir === 'left' ? 4 : 5, x1 = dir === 'left' ? 11 : 18;
    for (let x = x0; x <= x1; x++) {
      const i = x - x0;
      let len = 1;
      switch (st) {
        case 'spiky': case 'messy': len = [2, 1, 2, 3, 1, 2, 3, 1, 2, 2, 1, 2, 3, 1][i % 14]; break;
        case 'short': case 'neat': len = [2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2][i % 14]; break;
        case 'side': len = Math.max(1, 3 - Math.floor(i / 3)); break;
        case 'long': case 'wavy': case 'pony': case 'braid': len = i < 4 ? 2 : i < 7 ? 1 : i < 11 ? 2 : 1; break;
        case 'hime': len = 3; break;
        case 'bob': case 'twin': case 'bun': len = i % 3 === 1 ? 1 : 2; break;
        case 'slick': len = 0; break;
        case 'buzz': len = 0; break;
        default: len = 1;
      }
      if (dir === 'left' && i < 1) len = Math.max(len, 1);
      if (len) bang(x, len);
    }
    // 가르마 · 결 표시
    if (st !== 'buzz' && st !== 'slick') { b.px(dir === 'left' ? 7 : 10, t + 5, H[1]); b.px(dir === 'left' ? 8 : 14, t + 5, H[1]); }
    // 스파이크: 위와 옆으로 삐친다
    if (st === 'spiky') {
      for (const [x, y] of dir === 'left' ? [[6, -1], [9, -2], [12, -2], [15, -1], [18, 1], [19, 3]] : [[7, -1], [10, -2], [13, -2], [16, -1], [3, 3], [20, 3]]) { b.px(x, t + y, H[2]); b.px(x, t + y + 1, H[2]); if (y < 0) b.px(x + 1, t + y + 1, H[1]); }
    }
    if (st === 'messy') for (const [x, y] of dir === 'left' ? [[9, -1], [14, 0], [18, 2]] : [[9, -1], [14, -1], [3, 4], [20, 4]]) b.px(x, t + y, H[2]);
    // 옆머리: 귀 앞으로 얼굴선을 감싼다
    const sideLen = { long: 8, hime: 9, wavy: 8, bob: 7, twin: 6, braid: 6, pony: 5, bun: 5, short: 4, neat: 4, spiky: 4, messy: 5, side: 6, slick: 3, buzz: 0 }[st] || 4;
    const girlBonus = s.gender === 'girl' ? 1 : 0;
    if (sideLen) {
      if (dir === 'down') for (let k = 0; k < sideLen + girlBonus; k++) { const y = t + 6 + k; b.px(4, y, H[1]); b.px(5, y, H[2]); b.px(18, y, H[1]); b.px(19, y, H[0]); if (st === 'hime' && k > 2) { b.px(6, y, H[2]); b.px(17, y, H[1]); } }
      else for (let k = 0; k < sideLen + girlBonus; k++) { const y = t + 7 + k; b.px(12, y, H[2]); b.px(13, y, H[1]); }
    }
    if (s.ahoge) { b.px(12, t - 1, H[2]); b.px(13, t - 2, H[2]); b.px(14, t - 3, H[3]); }
    // 흰빛이 깨어난 뒤: 앞머리 한 가닥이 하얗다
    if (s.streak) { const sx = dir === 'left' ? 6 : 8; for (let y = t + 1; y <= t + 7; y++) { b.px(sx + (y > t + 4 ? 1 : 0), y, y === t + 7 ? '#c8c4d8' : s.streak); } b.px(sx + 1, t + 2, '#ffffff'); }
  }
  function backHairTop(b, s, t, C) {
    const H = C.H;
    if (s.hair === 'bun') { b.ellipse(12, t + 1, 3.2, 2.6, H[2]); b.px(11, t, H[3]); }
    if (s.hair === 'pony') { b.px(11, t + 3, s.ribbon || H[0]); b.px(12, t + 3, s.ribbon || H[0]); }
  }
  function backHair(b, s, dir, L, C, pose) {
    const H = C.H, st = s.hair, t = L.head;
    const sw = pose.hairSwing || 0;
    if (st === 'long' || st === 'hime' || st === 'wavy') {
      const len = st === 'hime' ? 27 : 24;
      for (let y = t + 7; y < t + len; y++) {
        const x0 = dir === 'left' ? 12 : 4, x1 = dir === 'left' ? 18 : 19;
        const drift = y > t + 16 ? Math.round(sw * (y - t - 16) / 6) : 0;
        for (let x = x0; x <= x1; x++) {
          const wave = st === 'wavy' ? Math.round(Math.sin(y * 0.7 + x * 0.2)) : 0;
          let c = (x + (st === 'wavy' ? 0 : 0)) % 3 === 0 ? H[1] : H[2];
          if (x === x0) c = H[1]; if (x === x1) c = H[0];
          if (y === t + len - 1 && (x & 1)) continue;
          b.px(x + wave + drift, y, c);
        }
      }
    }
    if (st === 'twin') {
      const tails = dir === 'left' ? [[16, 1]] : dir === 'up' ? [[3, -1], [19, 1]] : [[2, -1], [20, 1]];
      for (const [tx, side] of tails) for (let y = t + 3; y < t + 21; y++) {
        const w = y < t + 5 ? 1 : y > t + 18 ? 1 : 2;
        const drift = y > t + 10 ? Math.round(sw * (y - t - 10) / 6) : 0;
        for (let x = tx - w + 1; x <= tx + w; x++) b.px(x + drift + (y > t + 8 ? side : 0), y, x === tx - w + 1 ? H[1] : x === tx + w ? H[0] : H[2]);
      }
      if (dir !== 'up') { const R = s.ribbon || '#ff5a8a'; for (const rx of dir === 'left' ? [15] : [3, 19]) { b.px(rx, t + 3, R); b.px(rx + 1, t + 2, R); b.px(rx - 1, t + 2, R); b.px(rx, t + 2, U.mix(R, '#ffffff', 0.4)); } }
    }
    if (st === 'pony') {
      const tx = dir === 'left' ? 17 : 12;
      for (let y = t + 2; y < t + 19; y++) {
        const w = y < t + 5 ? 2 : 1;
        const drift = Math.round((dir === 'left' ? (y - t) * 0.25 : 0) + (y > t + 9 ? sw * (y - t - 9) / 5 : 0));
        for (let x = tx - w; x <= tx + w; x++) b.px(x + drift, y, x === tx - w ? H[1] : x === tx + w ? H[0] : H[2]);
      }
    }
    if (st === 'braid') {
      const tx = dir === 'left' ? 15 : dir === 'up' ? 12 : 16;
      for (let y = t + 9; y < t + 24; y++) { b.px(tx + ((y >> 1) & 1), y, (y & 1) ? H[1] : H[2]); b.px(tx + 1 - ((y >> 1) & 1), y, H[2]); }
      b.px(tx, t + 24, s.ribbon || '#ff5a8a'); b.px(tx + 1, t + 24, s.ribbon || '#ff5a8a');
    }
    if (st === 'bob' && dir !== 'down') for (let y = t + 7; y < t + 14; y++) for (let x = dir === 'left' ? 12 : 4; x <= 19; x++) b.px(x, y, x % 3 === 0 ? H[1] : H[2]);
  }
  function animalEars(b, s, dir, t, C) {
    const H = C.H;
    const ears = dir === 'left' ? [14] : [5, 16];
    for (const ex of ears) {
      b.px(ex, t - 1, H[2]); b.px(ex + 1, t - 1, H[2]); b.px(ex + 2, t - 1, H[1]);
      b.px(ex, t - 2, H[2]); b.px(ex + 1, t - 2, s.ears === 'fox' ? '#fff0e0' : H[3]);
      b.px(ex, t - 3, H[3]); b.px(ex + 1, t - 3, H[2]);
      b.px(ex, t - 4, H[2]);
    }
  }
  function hat(b, s, dir, t, C) {
    const HT = tones(s.hatC || '#6a4a8a');
    const kind = s.hat;
    if (kind === 'witch') {
      for (let y = t - 9; y <= t + 1; y++) { const w = Math.max(1, Math.round((y - t + 10) * 0.55)); const lean = y < t - 4 ? (dir === 'left' ? 3 : 2) : 0; for (let x = 12 - w; x < 12 + w; x++) b.px(x + lean, y, x < 12 - w + 2 ? HT[3] : x > 12 + w - 3 ? HT[1] : HT[2]); }
      for (let x = 1; x < 23; x++) { b.px(x, t + 2, HT[2]); b.px(x, t + 3, HT[0]); }
      b.px(10, t + 1, '#ffe08a'); b.px(11, t + 1, '#fff4c0'); b.px(12, t + 1, '#ffe08a');
    } else if (kind === 'cap') {
      for (let y = t - 1; y <= t + 3; y++) for (let x = 4; x <= 19; x++) b.px(x, y, y === t - 1 ? HT[3] : x > 16 ? HT[1] : HT[2]);
      if (dir === 'down') for (let x = 5; x <= 18; x++) b.px(x, t + 4, HT[0]); else if (dir === 'left') for (let x = 1; x <= 6; x++) b.px(x, t + 4, HT[1]);
    } else if (kind === 'hood') {
      for (let y = t - 1; y <= t + 15; y++) for (let x = 3; x <= 20; x++) {
        if (dir === 'down' && y > t + 4 && x > 5 && x < 18 && y < t + 14) continue;
        if (dir === 'left' && y > t + 4 && x < 13 && y < t + 14) continue;
        if (y > t + 12 && (x < 5 || x > 18)) continue;
        b.px(x, y, x < 6 ? HT[3] : x > 17 ? HT[0] : (x + y) % 4 === 0 ? HT[1] : HT[2]);
      }
    } else if (kind === 'helm') {
      for (let y = t - 1; y <= t + 6; y++) for (let x = 4; x <= 19; x++) b.px(x, y, y === t + 6 ? HT[0] : x < 7 ? HT[4] : x > 16 ? HT[1] : HT[2]);
      if (dir === 'down') for (let x = 6; x <= 17; x++) b.px(x, t + 7, HT[1]);
      if (s.plume) for (let y = t - 6; y < t; y++) { b.px(12 + ((y & 1) ? 1 : 0), y, s.plume); b.px(13, y, U.shade(s.plume, 0.75)); }
    } else if (kind === 'crown') {
      for (let x = 7; x <= 16; x++) { b.px(x, t, '#e8b83a'); b.px(x, t - 1, '#ffd84a'); if (x % 3 === 1) { b.px(x, t - 2, '#ffd84a'); b.px(x, t - 3, '#fff0a8'); } }
      b.px(11, t, '#ff3a5a'); b.px(12, t, '#ff7a8a');
    } else if (kind === 'band') {
      for (let x = 4; x <= 19; x++) b.px(x, t + 4, HT[2]);
      if (dir !== 'down') for (let k = 0; k < 5; k++) b.px(19 + (k >> 1), t + 5 + k, k & 1 ? HT[1] : HT[2]);
    } else if (kind === 'ribbon') {
      const R = tones(s.hatC || '#ff5a8a');
      for (const [x, y, c] of [[15, t - 1, 2], [16, t - 2, 2], [17, t - 2, 3], [14, t - 2, 2], [13, t - 3, 3], [15, t - 2, 1], [16, t - 1, 1]]) b.px(x, y, R[c]);
    } else if (kind === 'straw') {
      for (let x = 0; x < 24; x++) { b.px(x, t + 3, HT[2]); b.px(x, t + 4, HT[1]); }
      for (let y = t - 2; y <= t + 2; y++) for (let x = 6; x <= 17; x++) b.px(x, y, y === t + 1 ? '#c83a3a' : x < 9 ? HT[3] : HT[2]);
    } else if (kind === 'veil') {
      // 머리를 덮는 짧은 두건 + 어깨 뒤로 흘러내리는 옅은 천 (얼굴과 몸 앞은 가리지 않는다)
      for (let y = t - 1; y <= t + 16; y++) for (let x = 3; x <= 20; x++) {
        const face = dir === 'down' ? (y > t + 4 && x > 4 && x < 19) : dir === 'left' ? (y > t + 4 && x < 13) : false;
        if (face) continue;
        const drape = y > t + 13;
        if (drape && dir === 'down' && x > 5 && x < 18) continue;
        let c = x < 6 ? HT[3] : x > 17 ? HT[1] : HT[2];
        if (y === t + 4) c = '#ffd84a';
        if (drape && ((x + y) & 1)) continue;
        b.px(x, y, c, drape ? 0.75 : 1);
      }
    } else if (kind === 'goggles') {
      for (let x = 4; x <= 19; x++) b.px(x, t + 3, '#4a3a2a');
      if (dir !== 'up') { b.ellipse(8.5, t + 3.5, 2, 1.6, '#8ad8ff'); b.ellipse(15.5, t + 3.5, 2, 1.6, '#8ad8ff'); b.px(8, t + 3, '#ffffff'); b.px(15, t + 3, '#ffffff'); }
    }
  }
  function accessory(b, a, s, dir, L, C) {
    const top = L.torso;
    if (a === 'scarf') { const SC = tones(s.scarfC || '#d83a3a'); for (let x = 6; x <= 17; x++) { b.px(x, top, SC[2]); b.px(x, top + 1, x > 14 ? SC[0] : SC[1]); } if (dir === 'down') { b.px(15, top + 2, SC[2]); b.px(15, top + 3, SC[1]); b.px(16, top + 4, SC[1]); } else if (dir === 'up') for (let y = top + 2; y < top + 8; y++) { b.px(13, y, SC[2]); b.px(14, y, SC[1]); } else for (let x = 16; x <= 19; x++) b.px(x, top + 1 + (x - 16 >> 1), SC[2]); }
    if (a === 'pauldron') { const P = tones(s.trim); for (const px of dir === 'left' ? [12] : [4, 17]) { b.px(px, top, P[4]); b.px(px + 1, top, P[3]); b.px(px + 2, top, P[2]); b.px(px, top + 1, P[2]); b.px(px + 1, top + 1, P[2]); b.px(px + 2, top + 1, P[1]); b.px(px + 1, top + 2, P[1]); } }
    if (a === 'necklace' && dir === 'down') { b.px(10, top + 1, '#e8e0a8'); b.px(13, top + 1, '#e8e0a8'); b.px(11, top + 2, '#e8e0a8'); b.px(12, top + 2, '#6ad86a'); }
    if (a === 'quiver') { if (dir === 'up') for (let y = top - 3; y < top + 8; y++) { b.px(14, y, '#8a5a30'); b.px(15, y, '#6a4424'); if (y < top - 1) b.px(14, y - 1, '#e8e0cc'); } else if (dir === 'left') for (let y = top - 2; y < top + 6; y++) b.px(16, y, '#8a5a30'); }
    if (a === 'earring' && dir !== 'up') b.px(dir === 'down' ? 5 : 13, L.head + 12, '#ffd84a');
    if (a === 'flower' && dir !== 'up') { const x = dir === 'down' ? 16 : 13; b.px(x, L.head + 3, '#ffe060'); b.px(x - 1, L.head + 3, '#ff8ac8'); b.px(x + 1, L.head + 3, '#ff8ac8'); b.px(x, L.head + 2, '#ffd6ec'); b.px(x, L.head + 4, '#ffd6ec'); }
    if (a === 'book' && dir === 'down') { b.rect(15, top + 4, 4, 5, '#8a3a4a'); b.px(15, top + 4, '#e8d8a8'); }
    if (a === 'staff') { for (let y = top - 8; y < L.foot; y++) b.px(dir === 'left' ? 4 : 19, y, '#8a6a3e'); b.px(dir === 'left' ? 4 : 19, top - 9, '#8ad8ff'); b.px(dir === 'left' ? 3 : 18, top - 9, '#c8f0ff'); }
    if (a === 'sword' && dir !== 'up') { for (let y = top + 1; y < top + 12; y++) b.px(dir === 'left' ? 16 : 5, y, y < top + 3 ? '#8a6a3e' : '#c8d0e0'); }
    if (a === 'lute' && dir === 'down') { b.ellipse(15.5, top + 6, 2.5, 2.2, '#a8784a'); for (let y = top; y < top + 5; y++) b.px(17 + ((top + 5 - y) >> 2), y, '#6a4424'); b.px(15, top + 6, '#3a2418'); }
  }

  /* ───────── 동작 → 포즈 ───────── */
  const ANIM = {
    idle: { n: 2, pose: (f) => ({ bob: f === 1 ? 1 : 0 }) },
    walk: { n: 4, pose: (f) => [{ legL: 2, legR: 0, armL: -1, armR: 1, bob: 0, hairSwing: 0 }, { legL: 0, legR: 0, bob: -1, hairSwing: 1 }, { legL: 0, legR: 2, armL: 1, armR: -1, bob: 0, hairSwing: 0 }, { legL: 0, legR: 0, bob: -1, hairSwing: -1 }][f] },
    run: { n: 4, pose: (f) => [{ legL: 2, legR: -2, armL: -2, armR: 2, bob: -1, hairSwing: 2 }, { legL: 1, legR: 0, bob: -2, hairSwing: 2 }, { legL: -2, legR: 2, armL: 2, armR: -2, bob: -1, hairSwing: 2 }, { legL: 0, legR: 1, bob: -2, hairSwing: 1 }][f] },
    atk: { n: 3, pose: (f) => [{ armL: 'up', armR: 0, legL: 0, legR: 1, bob: 0, brow: 'angry' }, { armL: 'fwd', armR: 'fwd', legL: 1, legR: 0, bob: 1, brow: 'angry', mouth: 'open' }, { armL: 'fwd', armR: 0, legL: 1, legR: 0, bob: 1, brow: 'angry' }][f] },
    bow: { n: 2, pose: (f) => ({ armL: 'fwd', armR: 'fwd', legL: 0, legR: 1, bob: f, brow: 'angry' }) },
    cast: { n: 2, pose: (f) => ({ armL: 'up', armR: 'up', bob: f ? -1 : 0, mouth: 'open', hairSwing: f ? 1 : -1 }) },
    hurt: { n: 1, pose: () => ({ armL: 2, armR: -2, legL: 1, legR: 0, bob: 1, mouth: 'open', brow: 'sad', eyes: 'closed' }) },
    jump: { n: 1, pose: () => ({ armL: 'up', armR: 'up', legL: 2, legR: 2, bob: -2, hairSwing: -1 }) },
    lift: { n: 2, pose: (f) => ({ armL: 'up', armR: 'up', bob: f }) },
    hold: { n: 1, pose: () => ({ armL: 'up', armR: 'up', mouth: 'open', bob: -1, eyes: 'happy' }) },
    sit: { n: 1, pose: () => ({ crouch: 1, legL: 2, legR: 2 }) },
    down: { n: 1, pose: () => ({ crouch: 1, eyes: 'closed', bob: 2 }) },
    roll: { n: 4, pose: () => ({ crouch: 1, armL: 'up', armR: 'up', legL: 2, legR: 2 }) },
    talk: { n: 2, pose: (f) => ({ mouth: f ? 'open' : null, armR: f ? 1 : 0 }) },
    blink: { n: 1, pose: () => ({ blink: true }) },
    smile: { n: 1, pose: () => ({ mouth: 'smile', eyes: 'happy' }) },
    sad: { n: 1, pose: () => ({ mouth: 'frown', brow: 'sad' }) },
    angry: { n: 1, pose: () => ({ brow: 'angry', mouth: 'frown' }) },
    shock: { n: 1, pose: () => ({ mouth: 'open', armL: 2, armR: -2 }) },
  };

  function rotate90(src, k) {
    const c = X.canvas(src.width, src.height), g = X.ctx(c);
    g.translate(src.width / 2, src.height / 2 + 6); g.rotate(k * Math.PI / 2); g.drawImage(src, -src.width / 2, -src.height / 2 - 6);
    return c;
  }

  const cache = new Map();
  function sheet(spec) {
    const key = JSON.stringify(spec || {});
    let sh = cache.get(key);
    if (sh) return sh;
    const s = norm(spec);
    const frames = {};
    sh = {
      s,
      get(anim, dir, f) {
        const A = ANIM[anim] || ANIM.idle;
        f = ((f % A.n) + A.n) % A.n;
        const k = anim + dir + f;
        if (frames[k]) return frames[k];
        const d = dir === 'right' ? 'left' : dir;
        let img;
        if (anim === 'roll') {
          const base = drawFrame(s, Object.assign({ dir: d }, A.pose(0)));
          img = rotate90(base, d === 'left' ? -f : f);
        } else img = drawFrame(s, Object.assign({ dir: d }, A.pose(f)));
        return (frames[k] = dir === 'right' ? X.flipX(img) : img);
      },
      n: (anim) => (ANIM[anim] || ANIM.idle).n,
    };
    cache.set(key, sh);
    return sh;
  }

  /* ───────── 존재 그리기 ───────── */
  function drawChar(g, e, cx, cy) {
    const sh = e.sheet || (e.sheet = sheet(e.look || {}));
    const { anim, frame } = pickAnim(e);
    const img = sh.get(anim, e.dir, frame);
    const x = Math.round(e.x - cx - img.width / 2), y = Math.round(e.y - cy - img.height + 1 - (e.jz || 0));
    if (e.behindWeapon) e.behindWeapon(g, x, y);
    if (e.wadeCut) g.drawImage(img, 0, 0, img.width, img.height - e.wadeCut, x, y + e.wadeCut, img.width, img.height - e.wadeCut);
    else g.drawImage(img, x, y);
    if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 6); g.drawImage(X.silhouette(img, e.flashCol || '#ffffff'), x, y); g.globalAlpha = 1; }
    if (e.onDraw) e.onDraw(g, x, y, img);
  }
  function pickAnim(e) {
    const t = e.t || 0;
    if (e.forceAnim) return { anim: e.forceAnim, frame: Math.floor(t * (e.forceFps || 4)) };
    switch (e.state) {
      case 'walk': { const run = U.len(e.vx || 0, e.vy || 0) > 100; return { anim: run ? 'run' : 'walk', frame: Math.floor((e.walkT || 0) * (run ? 2.4 : 1.8)) }; }
      case 'roll': return { anim: 'roll', frame: Math.floor((e.st || 0) * 12) };
      case 'jump': return { anim: 'jump', frame: 0 };
      case 'hurt': case 'fall': return { anim: 'hurt', frame: 0 };
      case 'attack': case 'spin': case 'dash': return { anim: 'atk', frame: e.atkFrame != null ? e.atkFrame : 1 };
      case 'charge': return { anim: 'atk', frame: 0 };
      case 'bow': return { anim: 'bow', frame: (e.st || 0) > 0.2 ? 1 : 0 };
      case 'cast': return { anim: 'cast', frame: Math.floor(t * 6) };
      case 'lift': case 'carry': return { anim: 'lift', frame: 0 };
      case 'hold': return { anim: 'hold', frame: 0 };
      case 'sit': return { anim: 'sit', frame: 0 };
      case 'down': case 'dead': return { anim: 'down', frame: 0 };
      case 'talk': return { anim: 'talk', frame: Math.floor(t * 5) };
      default: {
        const bl = (t + (e.blinkSeed || 0)) % 3.7;
        if (bl < 0.12) return { anim: 'blink', frame: 0 };
        return { anim: e.mood || 'idle', frame: Math.floor(t * 1.6) };
      }
    }
  }

  G.sprites = { sheet, drawChar, pickAnim, tones, SKIN, FW, FH, ANIM };
})();
