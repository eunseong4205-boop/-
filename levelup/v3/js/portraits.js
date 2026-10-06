/* 대화 얼굴: 64×64 애니 흉상. 인물 생김새(look) 하나로 표정 열두 가지를 코드로 그린다.
   큰 눈(속눈썹 · 홍채 그라데이션 · 반짝이 둘) · 앞머리 가닥 · 옆머리 · 뒷머리 · 천사 고리 · 볼터치.
   사람이 아닌 이(하늘다람쥐 · 고양이 · 문어 · 인공지능 · 그림자)는 따로 그린다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx;
  const SZ = 64;
  const OUT = '#1c1026';
  const cache = new Map();
  /** 밝은 색일수록 그늘을 보랏빛으로 더 깊게 */
  const tones = (hex) => {
    const [r, g, bb] = U.rgb(hex); const lum = (r * 0.3 + g * 0.59 + bb * 0.11) / 255;
    const deep = lum > 0.7 ? 0.35 : 0;
    return [U.mix(U.shade(hex, 0.42), '#1a0f24', 0.4 + deep * 0.3), U.mix(U.shade(hex, 0.72 - deep * 0.25), '#5a4a7a', deep), hex, U.mix(hex, '#ffffff', 0.28), U.mix(hex, '#ffffff', 0.62)];
  };

  /* ───────── 도형 ───────── */
  function poly(b, pts, col, a) {
    let y0 = 1e9, y1 = -1e9;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        const yy = y + 0.5;
        if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + ((yy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) b.px(x, y, col, a);
    }
  }
  const inEll = (x, y, cx, cy, rx, ry) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; };

  /* ───────── 사람 ───────── */
  function human(look, face) {
    const s = Object.assign({ gender: 'boy', age: 'teen', skin: 'light', hair: 'short', hc: '#5a3a28', eye: '#4a7ad8', top: 'tunic', tc: '#3aa84a', trim: '#e8d8a8', hat: null, acc: [], eyeShape: 'round' }, look);
    const b = X.brush(SZ, SZ);
    const girl = s.gender === 'girl', child = s.age === 'child', old = s.age === 'old';
    const SKC = (G.sprites && G.sprites.SKIN[s.skin]) || s.skin;
    const SK = tones(SKC), H = tones(s.hc), T = tones(s.tc), TR = tones(s.trim || '#e8d8a8'), E = tones(s.eye);
    const oy = child ? 3 : 0;                    // 아이는 얼굴이 조금 아래
    const cx = 32;
    const fy = 33 + oy;                          // 얼굴 가운데
    const faceRx = child ? 14.5 : girl ? 14.5 : 15, faceRy = 13.5;
    const chinY = (child ? 48.5 : girl ? 50 : 50.5) + oy;   // 얼굴 길이를 조금 줄여 턱이 길고 뾰족해 보이지 않게
    const jaw = s.build === 'broad' ? 2 : 0;

    /* 뒷머리 */
    backHair(b, s, H, oy, girl);

    /* 어깨 · 옷 */
    const shY = 54 + oy;
    const shW = s.build === 'broad' ? 26 : girl ? 21 : 23;
    poly(b, [[cx - shW - 4, 64], [cx - shW, shY + 3], [cx - 8, shY - 1], [cx + 8, shY - 1], [cx + shW, shY + 3], [cx + shW + 4, 64]], T[2]);
    poly(b, [[cx - shW - 4, 64], [cx - shW, shY + 3], [cx - shW + 5, shY + 1], [cx - shW + 3, 64]], T[3]);
    poly(b, [[cx + shW + 4, 64], [cx + shW, shY + 3], [cx + shW - 4, shY + 2], [cx + shW - 2, 64]], T[1]);
    /* 목 */
    b.rect(cx - 5, 46 + oy, 10, shY - 45 - oy + 2, SK[2]);
    b.rect(cx - 5, 46 + oy, 10, 3, SK[1]);
    b.vline(cx + 4, 46 + oy, shY, SK[1]);
    /* 옷깃 */
    clothes(b, s, T, TR, SK, cx, shY);

    /* 얼굴 */
    // 턱: 볼에서 턱끝까지 부드럽게 좁아지고 턱끝은 살짝 갸름하게 둥글다 (예전엔 끝이 한 칸으로 모이는 뾰족한 V)
    //   얼굴형마다: round 둥근 · oval 갸름한(기본) · slim 날렵한 — [턱끝 반폭, 좁아지는 정도]
    const FS = { round: [5.6, 3.2], oval: [4.2, 2.8], slim: [3.3, 2.45] }[s.faceShape || (child ? 'round' : 'oval')] || [4.2, 2.8];
    const halfAt = (y) => { const k = (y - fy) / (chinY - fy); let h = FS[0] + (faceRx + jaw - FS[0]) * (1 - Math.pow(k, FS[1])); if (y >= chinY - 0.5) h -= 1.2; return h; };
    const faceIn = (x, y) => y >= 18 + oy && y <= chinY && (inEll(x, y, cx, fy, faceRx + jaw * 0.5, faceRy) || (y > fy && Math.abs(x + 0.5 - cx) <= halfAt(y)));
    for (let y = 18 + oy; y <= chinY; y++) for (let x = 14; x < 50; x++) if (faceIn(x, y)) b.px(x, y, SK[2]);
    // 턱선: 얼굴 가장자리 아래쪽 절반에 짙은 살색 선
    const edge = U.mix(SK[0], SK[1], 0.35);
    const isSkin = (x, y) => sameCol(b, x, y, SK[2]);
    const edges = [];
    for (let y = fy + 2; y <= chinY; y++) for (let x = 14; x < 50; x++) if (isSkin(x, y) && (!isSkin(x - 1, y) || !isSkin(x + 1, y) || !isSkin(x, y + 1))) edges.push([x, y]);
    for (const [x, y] of edges) b.px(x, y, edge);
    // 얼굴 그늘 (오른쪽 · 턱 밑)
    for (let y = fy; y <= chinY; y++) for (let x = cx + 6; x < 50; x++) if (b.get(x, y) && sameCol(b, x, y, SK[2]) && !sameCol(b, x + 1, y, SK[2])) { b.px(x, y, SK[1]); if (y > fy + 6) b.px(x - 1, y, SK[1]); }
    // 귀
    if (s.ears !== 'elf') { b.ellipse(cx - faceRx - 0.5, fy + 2, 2, 3.2, SK[2]); b.ellipse(cx + faceRx + 0.5, fy + 2, 2, 3.2, SK[1]); b.px(cx - faceRx - 1, fy + 2, SK[1]); }
    else { poly(b, [[cx - faceRx + 1, fy - 1], [cx - faceRx - 9, fy - 5], [cx - faceRx + 1, fy + 5]], SK[2]); poly(b, [[cx + faceRx - 1, fy - 1], [cx + faceRx + 9, fy - 5], [cx + faceRx - 1, fy + 5]], SK[1]); b.line(cx - faceRx - 6, fy - 3, cx - faceRx, fy + 1, SK[1]); }

    /* 표정 */
    const F = s.blind ? Object.assign({}, FACES[face] || FACES.normal, { eyes: 'closed', look: 0 }) : (FACES[face] || FACES.normal);
    const ey = (girl ? 33 : 34) + oy + (child ? 1 : 0);
    const eyeW = child ? 8 : 8, eyeH = (girl ? 9 : 7) + (child ? 1 : 0) + (s.eyeBig ? 1 : 0) - (s.eyeShape === 'narrow' ? 2 : 0);
    // 볼터치
    if (F.blush || s.blush || girl && face !== 'angry' && face !== 'shock' && face !== 'empty') blush(b, cx, ey + eyeH + 1, F.blush ? 1 : 0.45);
    // 눈
    eye(b, cx - 12 + (child ? 1 : 0), ey, eyeW, eyeH, E, s, F, false, girl);
    eye(b, cx + 4 - (child ? 1 : 0), ey, eyeW, eyeH, E, s, F, true, girl);
    // 코
    b.px(cx + 1, ey + eyeH + 3, SK[1]); b.px(cx + 1, ey + eyeH + 2, SK[1]); if (!girl && !child) b.px(cx, ey + eyeH + 3, SK[1]);
    // 입
    mouth(b, cx, 46 + oy - (child ? 1 : 0), F, SK, girl);
    // 주근깨 · 점 (사람마다)
    if (s.freckles) for (const [dx, dy] of [[-12, 0], [-9, 1], [-7, 0], [7, 0], [9, 1], [12, 0]]) b.px(cx + dx, ey + eyeH + 2 + dy, U.mix(SK[1], '#8a4a2a', 0.35));
    if (s.mole) { const [mx, my] = s.mole === 2 ? [cx + 6, 48 + oy] : [cx + 11, ey + eyeH + 1]; b.px(mx, my, U.mix(SK[0], OUT, 0.4)); }
    // 흉터 · 수염 · 복면
    if (s.scar) { b.line(cx + 7, ey + eyeH + 1, cx + 11, ey + eyeH + 6, '#c86a6a'); b.px(cx + 8, ey + eyeH + 3, '#ffb8b8'); }
    if (old) { b.px(cx - 11, ey + eyeH + 1, SK[1]); b.px(cx - 10, ey + eyeH + 2, SK[1]); b.px(cx + 10, ey + eyeH + 1, SK[1]); b.px(cx + 11, ey + eyeH + 2, SK[1]); b.hline(cx - 3, cx - 1, ey + eyeH + 6, SK[1]); b.hline(cx + 2, cx + 4, ey + eyeH + 6, SK[1]); }
    if (s.beard) {
      // 수염: 얼굴 모양(턱선)을 그대로 따라 구레나룻 → 볼 → 콧수염 → 턱 아래로 살짝 (예전엔 뾰족한 옛 턱에 맞춘 다각형이라 둥근 턱 밖으로 삐져나왔다)
      const bc = tones(s.beard), my = 46 + oy - (child ? 1 : 0), hc = halfAt(chinY);
      for (let y = fy + 2; y <= chinY + 3; y++) for (let x = 12; x < 52; x++) {
        const dx = Math.abs(x + 0.5 - cx);
        if (!(faceIn(x, y) || (y > chinY && dx <= hc + 0.6 - (y - chinY) * 1.4))) continue;
        const st0 = ey + eyeH + 1;                                               // 구레나룻은 눈 아래부터
        const top = dx > 10.5 ? st0 : dx > 6 ? st0 + (10.5 - dx) * (my - 3 - st0) / 4.5 : my - 3;
        if (y < top) continue;
        if (dx <= 3.6 && y >= my && y <= my + 2) continue;                   // 입은 보이게
        let c = x > cx + 6 ? bc[1] : bc[2];
        if (y >= chinY + 1 || (dx > 10.5 && !faceIn(x + (x < cx ? -1 : 1), y))) c = bc[1];
        if ((x * 3 + y * 7) % 11 === 0 && c === bc[2]) c = bc[3];             // 결
        b.px(x, y, c);
      }
      b.hline(cx - 2, cx + 2, my - 1, bc[0]);
    }
    if (s.mask) { const mc = tones(s.hatC || '#4a3a30'); poly(b, [[cx - faceRx - 1, ey + eyeH + 2], [cx + faceRx + 1, ey + eyeH + 2], [cx + faceRx - 2, chinY], [cx, chinY + 2], [cx - faceRx + 2, chinY]], mc[2]); b.hline(cx - faceRx, cx + faceRx, ey + eyeH + 2, mc[3]); b.line(cx - 4, ey + eyeH + 5, cx + 5, ey + eyeH + 9, mc[1]); }
    if (s.robot) { b.line(cx - 12, fy + 6, cx - 9, fy + 9, '#8a98b0'); b.line(cx + 12, fy + 6, cx + 9, fy + 9, '#8a98b0'); b.rect(cx - 15, fy, 2, 5, '#9aa8c0'); b.rect(cx + 14, fy, 2, 5, '#7a88a0'); }

    /* 앞머리 */
    frontHair(b, s, H, SK, oy, girl, cx);
    // 눈썹: 앞머리 틈으로
    brows(b, cx, ey - 3, F, H, girl, s);
    /* 동물 귀 · 모자 · 장신구 */
    if (s.ears === 'cat' || s.ears === 'fox') animalEars(b, s, H, oy);
    hat(b, s, cx, oy, H);
    if (s.glasses) glasses(b, cx, ey, eyeH);
    accs(b, s, cx, oy, fy, shY, H);
    if (F.sweat) { b.px(cx + 15, ey - 4, '#bfe8ff'); b.px(cx + 15, ey - 3, '#bfe8ff'); b.px(cx + 14, ey - 2, '#bfe8ff'); b.px(cx + 16, ey - 2, '#8ac8f0'); b.px(cx + 15, ey - 1, '#8ac8f0'); }
    if (F.anger) { const ax = cx + 13, ay = 14 + oy; b.px(ax, ay, '#ff4a5a'); b.px(ax + 2, ay, '#ff4a5a'); b.px(ax + 1, ay + 1, '#ff4a5a'); b.px(ax, ay + 2, '#ff4a5a'); b.px(ax + 2, ay + 2, '#ff4a5a'); }
    if (F.gloom) for (let x = cx - 12; x <= cx + 12; x += 3) b.vline(x, 18 + oy, 24 + oy + (x % 2), '#281e50');
    X.fillHoles(b, 60);
    return X.outline(b.put(), OUT);
  }
  function sameCol(b, x, y, hex) { if (x < 0 || y < 0 || x >= SZ || y >= SZ) return false; const i = (y * SZ + x) * 4; const [r, g, bb] = U.rgb(hex); return b.d[i] === r && b.d[i + 1] === g && b.d[i + 2] === bb; }

  const FACES = {
    normal: {},
    smile: { mouth: 'smile', lid: 1 },
    happy: { eyes: 'arc', mouth: 'open', blush: 1 },
    sad: { brow: 'sad', lid: 2, mouth: 'frown' },
    cry: { brow: 'sad', lid: 2, mouth: 'wave', tears: 1 },
    angry: { brow: 'angry', lid: 2, mouth: 'grit', small: 1, anger: 1 },
    shock: { brow: 'up', wide: 1, small: 1, mouth: 'o', sweat: 1 },
    think: { brow: 'one', look: 1, mouth: 'flat' },
    smirk: { lid: 3, mouth: 'smirk', brow: 'one' },
    blush: { blush: 1, mouth: 'small', look: -1 },
    closed: { eyes: 'closed', mouth: 'flat' },
    hurt: { eyes: 'squint', mouth: 'grit', brow: 'sad', sweat: 1 },
    empty: { hollow: 1, mouth: 'flat', gloom: 1 },
    cold: { lid: 2, mouth: 'flat', hollow: 0.5 },
  };

  function eye(b, x, y, w, h, E, s, F, right, girl) {
    if (F.eyes === 'arc') { // ^ ^
      for (let i = 0; i < w; i++) { const dy = Math.round(Math.abs(i - (w - 1) / 2) * 0.7); b.px(x + i, y + 3 + dy - 1, OUT); if (girl) b.px(x + i, y + 2 + dy - 1, OUT); }
      return;
    }
    if (F.eyes === 'closed') { for (let i = 0; i < w; i++) { const dy = Math.round(Math.abs(i - (w - 1) / 2) * 0.35); b.px(x + i, y + h - 3 - dy + 1, OUT); if (girl && i > 0 && i < w - 1) b.px(x + i, y + h - 2 - dy + 1, U.mix(E[0], OUT, 0.5)); } if (girl) { b.px(right ? x + w : x - 1, y + h - 3, OUT); } return; }
    if (F.eyes === 'squint') { for (let i = 0; i < w; i++) { const k = right ? i : w - 1 - i; b.px(x + i, y + 2 + Math.round(k * 0.5), OUT); b.px(x + i, y + 6 - Math.round(k * 0.5), OUT); } return; }
    const sharp = s.eyeShape === 'sharp' || s.eyeShape === 'cat', sleepy = s.eyeShape === 'sleepy', droopy = s.eyeShape === 'droopy', cat = s.eyeShape === 'cat';
    let lid = (F.lid || 0) + (sleepy ? 2 : 0);
    if (F.wide) lid = -1;
    const top = y + Math.max(0, lid), bot = y + h - 1;
    // 눈 모양: 바깥 꼬리가 올라간 둥근 사다리꼴
    const inEye = (xx, yy) => {
      if (yy < top || yy > bot) return false;
      const i = xx - x; if (i < 0 || i >= w) return false;
      const inner = right ? i : w - 1 - i;           // 0 = 코 쪽
      if (yy === bot && (i === 0 || i === w - 1)) return false;
      if (yy === bot - 1 && inner === 0 && girl) return false;
      if (sharp && yy === top && inner < 2) return false;
      if (droopy && yy === top && inner > w - 3) return false;                 // 처진 눈: 바깥 꼬리가 내려간다
      if (cat && yy === bot && inner > w - 3) return false;                    // 고양이 눈: 바깥 꼬리가 치켜 올라간다
      return true;
    };
    for (let yy = top; yy <= bot; yy++) for (let xx = x; xx < x + w; xx++) if (inEye(xx, yy)) b.px(xx, yy, '#fbf8ff');
    // 홍채: 크고 세로로 긴 타원, 위는 짙고 아래는 밝다
    const icx = x + w / 2 + (F.look ? F.look * 1.2 : 0) + (right ? -0.4 : 0.4), icy = y + h / 2 + 0.3;
    const irx = F.small ? 2.1 : girl ? 3.4 : 2.9, iry = F.small ? 2.7 : girl ? 4.8 : 3.8;
    for (let yy = top; yy <= bot; yy++) for (let xx = x; xx < x + w; xx++) {
      if (!inEye(xx, yy) || !inEll(xx, yy, icx, icy, irx, iry)) continue;
      const k = (yy + 0.5 - (icy - iry)) / (iry * 2);
      let col = k < 0.28 ? U.mix(E[0], OUT, 0.35) : k < 0.5 ? E[1] : k < 0.78 ? E[2] : E[3];
      if (k > 0.66 && Math.abs(xx + 0.5 - icx) < irx - 0.8) col = E[3];
      if (k > 0.86) col = E[4];
      b.px(xx, yy, F.hollow ? U.mix(col, '#2a2440', F.hollow) : col);
    }
    if (!F.hollow) {
      // 동공 (세로 타원)
      const px0 = Math.round(icx - 0.5), py0 = Math.round(icy - 0.5);
      b.px(px0, py0, OUT); b.px(px0, py0 - 1, U.mix(E[0], OUT, 0.6)); if (girl) { b.px(px0 - 1, py0, U.mix(E[0], OUT, 0.5)); b.px(px0, py0 + 1, U.mix(E[0], OUT, 0.5)); }
      // 반짝이: 큰 것(왼쪽 위) · 작은 것(오른쪽 아래)
      const hx = Math.floor(icx - irx + (girl ? 1 : 0.6)), hy = Math.floor(icy - iry + 1);
      b.px(hx, hy, '#ffffff'); b.px(hx + 1, hy, '#ffffff'); b.px(hx, hy + 1, '#ffffff'); if (girl) { b.px(hx + 1, hy + 1, '#ffffff'); b.px(hx, hy + 2, '#fff8f0'); }
      b.px(Math.floor(icx + irx - 1.2), Math.floor(icy + iry - 2), '#ffffff');
    }
    // 윗눈꺼풀 · 속눈썹: 소녀는 두껍고 바깥 꼬리가 삐친다
    for (let xx = x - 1; xx <= x + w; xx++) {
      const i = xx - x, inner = right ? i : w - 1 - i;
      let yy = top - 1;
      if (sharp && inner < 2) yy += 1;
      if (droopy && inner > w - 3) yy += 1;
      if (F.brow === 'angry' && inner < 2) yy += 1;
      if (F.brow === 'sad' && inner > w - 3) yy += 1;
      if ((xx === x - 1 && right) || (xx === x + w && !right)) continue;          // 코 쪽 끝은 짧게
      b.px(xx, yy, OUT);
      if (girl || sharp) { if (i >= 0 && i < w) b.px(xx, yy + 1, i === 0 || i === w - 1 ? OUT : U.mix(OUT, E[0], 0.3)); }
    }
    if (cat) { const ox = right ? x + w : x - 1, d = right ? 1 : -1; b.px(ox, top - 1, OUT); b.px(ox + d, top - 2, OUT); b.px(ox + d * 2, top - 3, OUT); }   // 치켜 올린 눈꼬리
    if (girl) { const ox = right ? x + w : x - 1; b.px(ox, top - 2, OUT); b.px(ox + (right ? 1 : -1), top - 3, OUT); b.px(ox, top + (droopy ? 1 : 0), OUT); }
    else { const ox = right ? x + w : x - 1; b.px(ox, top, OUT); }
    // 아랫눈꺼풀: 바깥쪽 짧은 선
    const lo = U.mix(E[0], OUT, 0.35);
    for (let i = 0; i < 3; i++) b.px(right ? x + w - 1 - i : x + i, bot + 1, i === 0 ? lo : U.mix(lo, '#ffffff', 0.35));
    // 눈물
    if (F.tears) { const tx = right ? x + 1 : x + w - 2; for (let k = 0; k < 8; k++) b.px(tx + (k > 3 ? (right ? -1 : 1) : 0), bot + 2 + k, k % 3 === 0 ? '#ffffff' : '#9ad8ff'); }
  }
  function brows(b, cx, y, F, H, girl, s) {
    const col = H[0];
    const len = girl ? 6 : 7;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? cx - 12 : cx + 5 - (girl ? 0 : 1);
      for (let i = 0; i < len; i++) {
        const inner = side < 0 ? i >= len - 2 : i <= 1;
        const outer = side < 0 ? i <= 1 : i >= len - 2;
        let yy = y;
        if (F.brow === 'angry' && inner) yy += 2; else if (F.brow === 'angry' && !outer) yy += 1;
        if (F.brow === 'sad' && inner) yy -= 1; else if (F.brow === 'sad' && outer) yy += 1;
        if (F.brow === 'up') yy -= 2;
        if (F.brow === 'one' && side > 0) yy -= 2;
        if (!F.brow && outer) yy += girl ? 1 : 0;
        if (s.eyeShape === 'sharp' && !F.brow && inner) yy += 1;
        b.px(x0 + i, yy, col);
        if (!girl) b.px(x0 + i, yy - 1, col, 0.55);
      }
    }
  }
  function mouth(b, cx, y, F, SK, girl) {
    const dark = '#6a2a3a', lip = U.mix(SK[1], '#e87a8a', 0.4);
    switch (F.mouth) {
      case 'smile': b.px(cx - 2, y - 1, dark); b.hline(cx - 1, cx + 2, y, dark); b.px(cx + 3, y - 1, dark); break;
      case 'open': b.hline(cx - 2, cx + 3, y - 1, dark); b.rect(cx - 2, y, 6, 2, '#8a2a3a'); b.hline(cx - 1, cx + 2, y + 2, dark); b.hline(cx - 1, cx + 2, y + 1, '#ff8a9a'); break;
      case 'frown': b.px(cx - 2, y + 1, dark); b.hline(cx - 1, cx + 2, y, dark); b.px(cx + 3, y + 1, dark); break;
      case 'wave': b.px(cx - 2, y, dark); b.px(cx - 1, y - 1, dark); b.px(cx, y, dark); b.px(cx + 1, y - 1, dark); b.px(cx + 2, y, dark); b.px(cx + 3, y - 1, dark); break;
      case 'grit': b.rect(cx - 3, y - 1, 7, 3, dark); b.hline(cx - 2, cx + 2, y, '#ffffff'); break;
      case 'o': b.ellipse(cx + 0.5, y + 0.5, 1.8, 2.2, '#6a1a2a'); b.px(cx, y + 1, '#ff8a9a'); break;
      case 'flat': b.hline(cx - 1, cx + 2, y, dark); break;
      case 'smirk': b.hline(cx - 1, cx + 1, y, dark); b.px(cx + 2, y - 1, dark); b.px(cx + 3, y - 2, dark); break;
      case 'small': b.hline(cx, cx + 1, y, dark); break;
      default: b.hline(cx - 1, cx + 1, y, girl ? lip : dark); if (girl) b.px(cx + 2, y - 1, lip); break;
    }
  }
  function blush(b, cx, y, k) {
    for (const x0 of [cx - 13, cx + 6]) {
      b.rect(x0, y, 7, 2, '#ff8aa0', 0.35 * k + 0.1);
      if (k >= 1) for (let i = 0; i < 3; i++) b.px(x0 + 1 + i * 2, y, '#ff6a8a');
    }
  }

  /* ── 머리카락 ── */
  function backHair(b, s, H, oy, girl) {
    const st = s.hair;
    const fill = (pts, c) => poly(b, pts, c || H[1]);
    switch (st) {
      case 'long': fill([[14, 22 + oy], [10, 40], [9, 63], [55, 63], [54, 40], [50, 22 + oy]]); fill([[16, 30], [13, 62], [18, 62]], H[0]); fill([[48, 30], [51, 62], [46, 62]], H[0]); break;
      case 'wavy': for (let y = 22 + oy; y < 64; y++) { const w = 20 + Math.sin(y / 3.2) * 2.5 + (y > 40 ? 3 : 0); b.hline(Math.round(32 - w), Math.round(32 + w), y, H[1]); } break;
      case 'hime': fill([[14, 22 + oy], [12, 60], [52, 60], [50, 22 + oy]]); b.hline(12, 51, 60, H[0]); break;
      case 'bob': fill([[13, 24 + oy], [12, 41 + oy], [14, 46 + oy], [18, 48 + oy], [46, 48 + oy], [50, 46 + oy], [52, 41 + oy], [51, 24 + oy]]); break;   // 단발: 아래 모서리를 둥글게 (네모 상자 같았다)
      case 'pony': fill([[46, 16 + oy], [56, 22 + oy], [58, 44], [52, 56], [49, 40]]); fill([[49, 22 + oy], [55, 30], [53, 48], [50, 36]], H[2]); break;
      case 'twin':
        fill([[12, 18 + oy], [4, 30], [3, 50], [8, 60], [12, 44], [16, 28]]); fill([[52, 18 + oy], [60, 30], [61, 50], [56, 60], [52, 44], [48, 28]]);
        fill([[10, 26], [6, 44], [9, 52], [11, 38]], H[2]); fill([[54, 26], [58, 44], [55, 52], [53, 38]], H[2]);
        break;
      case 'braid': fill([[15, 22 + oy], [13, 49], [51, 49], [49, 22 + oy]]); break;   // 땋은 머리와 턱 사이가 비지 않게 어깨까지
      case 'bun': b.ellipse(32, 11 + oy, 7, 6, H[1]); b.ellipse(31, 10 + oy, 5, 4, H[2]); b.hline(28, 34, 8 + oy, H[3]); break;
      case 'messy': case 'spiky': if (s.gender === 'girl') fill([[15, 22 + oy], [13, 50], [51, 50], [49, 22 + oy]]); break;
      case 'shaggy': { const by = girl ? 52 : 47; fill([[15, 24 + oy], [13, by - 7], [14, by - 2], [18, by], [23, by - 3], [27, by], [37, by], [41, by - 3], [46, by], [50, by - 2], [51, by - 7], [49, 24 + oy]]); break; }   // 늑대 컷: 목덜미까지 층지게
      case 'curly': if (girl) for (let y = 24 + oy; y < 50; y++) { const w = 19 + Math.round(Math.sin(y * 0.9) * 1.5) + (y > 34 ? 2 : 0); b.hline(32 - w, 32 + w, y, H[1]); } break;
      default: if (girl && st !== 'short' && st !== 'buzz' && st !== 'slick' && st !== 'bald') fill([[15, 22 + oy], [14, 44], [50, 44], [49, 22 + oy]]); break;
    }
  }
  function frontHair(b, s, H, SK, oy, girl, cx) {
    const st = s.hair;
    if (st === 'bald') {
      // 민머리: 얼굴 위로 둥근 머리통 + 관자놀이부터 귀 위까지 짧은 옆머리
      //   (예전엔 머리가 얼굴 타원 꼭대기에서 끊겨 납작하고 짧았으며, 윗빛 타원이 머리 밖으로 혹처럼 튀어나왔다)
      const sy = 28 + oy, rx = 16.2, ry = 14.8, fyy = 33 + oy;
      for (let y = Math.floor(sy - ry); y <= fyy; y++) for (let x = 8; x < 56; x++) {
        if (!inEll(x, y, cx, sy, rx, ry)) continue;
        const dx = Math.abs(x + 0.5 - cx), band = dx > 11.5 && y > sy - 5;
        if (y >= 18 + oy && b.get(x, y) && !band) continue;                     // 얼굴은 그대로
        let c = x > cx + 9 ? SK[1] : SK[2];
        if (band) c = x > cx ? (dx > 14.5 ? H[0] : H[1]) : (dx > 14.5 ? H[1] : H[2]);
        b.px(x, y, c);
      }
      b.ellipse(cx - 5, sy - ry + 5.5, 4, 2, SK[3]); b.hline(cx - 6, cx - 3, Math.round(sy - ry + 4), U.mix(SK[3], '#ffffff', 0.4));   // 윗빛 (머리통 안쪽)
      return;
    }
    const capCy = 27 + oy, capRx = 17.5, capRy = st === 'buzz' ? 16 : 17;   // 아주 짧은 머리도 머리통을 덮는다 (예전엔 작은 모자처럼 얹혀 대머리 같았다)
    const topY = capCy - capRy;
    // 가닥 묶음: [뿌리 x, 끝 x, 끝 y, 폭]
    const C = [];
    const base = 19 + oy;                 // 이마의 머리선 (가닥 사이 틈) — 예전 17: 이마가 너무 넓게 보였다
    const clump = (x0, tx, ty, w) => C.push({ x0, tx, ty: ty + oy, w });
    let side = girl ? 46 : 38, sideW = girl ? 4.2 : 3.6;
    switch (st) {
      case 'spiky': clump(17, 15, 34, 5); clump(22, 21, 32, 5); clump(27, 27, 34, 5); clump(32, 33, 31, 5); clump(37, 38, 34, 5); clump(42, 44, 32, 5); clump(47, 49, 34, 4); side = 40; break;
      case 'messy': clump(18, 16, 33, 5); clump(23, 22, 31, 5); clump(28, 29, 33, 5); clump(33, 32, 30, 4); clump(37, 39, 33, 5); clump(42, 44, 31, 5); clump(46, 48, 34, 4); side = girl ? 46 : 40; break;
      case 'short': case 'neat': clump(18, 17, 30, 5); clump(23, 23, 31, 5); clump(28, 28, 30, 5); clump(33, 33, 31, 5); clump(38, 38, 30, 5); clump(43, 44, 31, 5); clump(47, 48, 30, 4); side = girl ? 44 : 37; break;
      // 가운데 가르마: 가운데서 양옆으로 갈라 넘긴 앞머리 (가르마 선으로 이마가 조금 보인다)
      case 'parted': clump(30, 22, 31, 5); clump(26, 19, 33, 5); clump(22, 17, 35, 4.6); clump(34, 42, 31, 5); clump(38, 45, 33, 5); clump(42, 47, 35, 4.6); side = girl ? 48 : 41; sideW = 4.2; break;
      // 곱슬: 짧고 둥근 가닥이 촘촘히
      case 'curly': for (let x = 17; x <= 47; x += 4) clump(x, x + (((x >> 2) & 1) ? 1.5 : -1.5), 28 + ((x >> 2) & 1) * 2, 4.4); side = girl ? 46 : 40; sideW = 4.6; break;
      // 늑대 컷: 층진 긴 가닥, 옆머리가 목까지
      case 'shaggy': clump(17, 14, 36, 5); clump(22, 20, 34, 5); clump(27, 27, 32, 5); clump(32, 31, 34, 5); clump(37, 38, 32, 5); clump(42, 44, 34, 5); clump(47, 50, 36, 4.6); side = girl ? 50 : 46; sideW = 4.4; break;
      // 옆으로 쓸어내린 긴 앞머리: 한쪽 눈썹 · 눈꼬리를 살짝 덮는다
      case 'swept': clump(18, 17, 30, 5); clump(23, 26, 34, 6); clump(28, 33, 36, 6); clump(33, 40, 37, 5.6); clump(38, 45, 35, 5.2); clump(43, 48, 33, 5); side = girl ? 48 : 41; break;
      case 'side': clump(18, 16, 35, 6); clump(23, 22, 34, 6); clump(28, 28, 33, 6); clump(33, 35, 30, 5); clump(38, 41, 28, 5); clump(43, 46, 27, 5); side = girl ? 44 : 39; break;
      case 'long': case 'wavy': case 'braid': case 'pony': clump(18, 17, 32, 5); clump(22, 22, 33, 5); clump(26, 27, 31, 4); clump(30, 30, 26, 3); clump(34, 34, 26, 3); clump(38, 37, 31, 4); clump(42, 42, 33, 5); clump(46, 47, 32, 5); side = st === 'pony' ? 42 : 52; sideW = 4.6; break;
      case 'hime': for (let x = 17; x <= 47; x += 3) clump(x, x, 31, 3.6); side = 50; sideW = 5.2; break;
      case 'bob': clump(17, 17, 32, 5); clump(22, 22, 32, 5); clump(27, 27, 31, 5); clump(32, 32, 31, 5); clump(37, 37, 31, 5); clump(42, 42, 32, 5); clump(47, 47, 32, 5); side = 48; sideW = 5; break;
      case 'twin': case 'bun': clump(18, 17, 32, 5); clump(23, 23, 33, 5); clump(28, 28, 31, 4); clump(32, 32, 27, 3); clump(36, 36, 31, 4); clump(41, 41, 33, 5); clump(46, 47, 32, 5); side = st === 'twin' || girl ? 45 : 40; break;
      // 넘긴 머리: 가르마에서 양옆으로 쓸어 넘긴 짧은 가닥 둘 + 귀 앞 구레나룻 (예전엔 가닥 · 옆머리가 없어 이마가 훤하고 얼굴 둘레에 빈 테만 남았다)
      case 'slick': side = 32; sideW = 3.8; break;
      case 'buzz': side = 30; sideW = 2; break;
      default: clump(18, 17, 30, 5); clump(24, 24, 31, 5); clump(30, 30, 30, 5); clump(36, 36, 31, 5); clump(42, 42, 30, 5); clump(47, 48, 30, 4); break;
    }
    // 옆머리 (얼굴 양옆, 귀 앞)
    if (st !== 'buzz') { C.push({ x0: 16, tx: 15 - (girl ? 1 : 0), ty: side + oy, w: sideW, side: true }); C.push({ x0: 48, tx: 49 + (girl ? 1 : 0), ty: side + oy, w: sideW, side: true }); }
    // 칸마다 어느 가닥이 덮나: 가닥은 뿌리(base)에서 끝(ty)까지 좁아지는 띠
    const owner = new Int16Array(SZ * SZ).fill(-1), u = new Float32Array(SZ * SZ);
    C.forEach((c, i) => {
      const y0 = c.side ? capCy - 6 : base;
      for (let y = y0; y <= c.ty; y++) {
        const k = (y - y0) / Math.max(1, c.ty - y0);            // 0 뿌리 → 1 끝
        const xc = U.lerp(c.x0, c.tx, k * k);
        const half = (c.side ? c.w : c.w * 1.18) * (1 - Math.pow(k, c.side ? 1.8 : 2.7)) + 0.6;   // 앞머리는 끝까지 도톰하게 (가닥 사이로 이마가 덜 보인다)
        for (let x = Math.floor(xc - half); x <= Math.ceil(xc + half); x++) {
          if (x < 0 || x >= SZ) continue;
          if (!c.side && y < capCy && !inEll(x, y, cx, capCy, capRx + 1.2, capRy + 1.2)) continue;   // 앞머리 뿌리가 머리 밖으로 뿔처럼 삐져나오지 않게
          const d = (x + 0.5 - xc) / half;
          if (Math.abs(d) > 1) continue;
          const j = y * SZ + x;
          if (owner[j] < 0 || Math.abs(d) < Math.abs(u[j])) { owner[j] = i; u[j] = d; }
        }
      }
    });
    // 머리 덩어리: 윗 타원 (이마선 위) + 가닥
    for (let y = 2; y < 62; y++) for (let x = 6; x < 58; x++) {
      const j = y * SZ + x;
      // 넘긴 머리: 관자놀이까지 두툼하고 이마선이 가운데로 살짝 올라간다 — 가닥 없이 한 덩어리라 구멍(테두리 고리)이 생기지 않는다
      const sl = st === 'slick' || st === 'buzz';
      const inCap = inEll(x, y, cx, capCy, capRx, capRy) && (y < base + 1 + (sl && Math.abs(x + 0.5 - cx) > 7 ? 2 : 0) || x < (sl ? 20 : 17) || x > (sl ? 43 : 47));
      const inStr = owner[j] >= 0;
      if (!inCap && !inStr) continue;
      let col = H[2];
      if (inStr) {
        const d = u[j], c = C[owner[j]];
        const k = (y - base) / Math.max(1, c.ty - base);
        col = d < -0.45 ? H[3] : d > 0.5 ? H[1] : H[2];
        if (k > 0.82 || (c.side && y > c.ty - 3)) col = H[1];
        if (Math.abs(d) > 0.85 && k > 0.2 && !c.side) col = H[0];
      } else {
        // 윗머리: 왼쪽 위에서 빛
        const lx = (x - (cx - 8)) / capRx, ly = (y - (topY + 5)) / capRy;
        const l = lx * lx + ly * ly;
        col = l < 0.18 ? H[3] : x > cx + 9 ? H[1] : H[2];
        if (st === 'slick' && y > topY + 3 && (x < cx ? (x + y) % 6 === 0 : (x - y + 60) % 6 === 0)) col = col === H[3] ? H[2] : H[1];   // 빗어 넘긴 결: 가운데서 양옆 뒤로 비스듬히
        if (st === 'buzz' && (x * 3 + y * 5) % 7 === 0 && col !== H[3]) col = H[1];                                                       // 짧게 깎은 결
      }
      b.px(x, y, col);
    }
    // 넘긴 머리 · 아주 짧은 머리: 머리 덩어리와 이마 사이 빈틈(바깥선이 이마에 검은 띠로 그려지던 것)을 머리선으로 메운다
    if (st === 'slick' || st === 'buzz') for (let x = 12; x < 52; x++) {
      let y = 4; while (y < 40 && !b.get(x, y)) y++;
      while (y < 40 && b.get(x, y) && !sameCol(b, x, y, SK[2])) y++;
      for (let k = 0; y < 40 && k < 8 && !b.get(x, y); k++, y++) b.px(x, y, k === 0 ? H[2] : H[1]);
    }
    // 곱슬: 머리 둘레가 동글동글
    if (st === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.105), bx = cx + Math.cos(a) * (capRx + 0.5), by = capCy + Math.sin(a) * (capRy + 0.5); b.ellipse(bx, by, 2.6, 2.6, i % 2 ? H[2] : H[1]); b.px(Math.round(bx - 1), Math.round(by - 1), H[3]); }
    // 삐죽머리는 위로도 솟는다
    if (st === 'spiky' || st === 'messy') {
      const tips = st === 'spiky' ? [[17, 13, 7], [24, 9, 8], [32, 8, 9], [40, 9, 8], [47, 13, 7]] : [[20, 11, 5], [30, 9, 6], [41, 10, 5]];
      for (const [tx, ty, h] of tips) { poly(b, [[tx - 4, ty + 6 + oy], [tx + (st === 'spiky' ? 2 : 1), ty - h + 4 + oy], [tx + 4, ty + 6 + oy]], H[2]); b.line(tx - 2, ty + 4 + oy, tx + 1, ty - h + 6 + oy, H[3]); }
    }
    // 천사 고리 (윤기): 끊어진 호
    const ry = 16 + oy;
    for (let x = cx - 13; x <= cx + 11; x++) {
      const yy = ry + Math.round(Math.pow((x - cx + 1) / 13, 2) * 5);
      const seg = (x - cx + 26) % 6;
      if (seg < 4 && b.get(x, yy) && owner[yy * SZ + x] < 0) { b.px(x, yy, seg === 1 || seg === 2 ? H[4] : H[3]); if (seg === 1 || seg === 2) b.px(x, yy + 1, H[3]); }
    }
    // 앞머리 그늘: 가닥 바로 아래 이마에 한 줄
    for (let x = 16; x < 49; x++) for (let y = base; y < 44; y++) { const j = y * SZ + x; if (owner[j] >= 0 && owner[j + SZ] < 0 && y + 1 < 44 && sameCol(b, x, y + 1, SK[2])) { b.px(x, y + 1, SK[1]); break; } }
    if (st === 'braid') { for (let k = 0; k < 7; k++) { b.ellipse(14 - k * 0.3, 42 + k * 3, 3.2, 2.1, k % 2 ? H[1] : H[2]); b.px(13 - k * 0.3, 41 + k * 3, H[3]); } b.rect(11, 62, 5, 2, s.ribbon || '#d84a6a'); }
    // 흰 가닥: 앞머리 한 줄기만 하얗게 (원래 음영 단계를 그대로 옮긴다)
    if (s.streak) {
      const W4 = tones(s.streak);
      for (let y = topY + 3; y < base + 14; y++) {
        const x0 = Math.round(cx - 9 + (y - topY) * 0.22);
        for (let x = x0; x < x0 + 3; x++) { for (let k = 0; k < 5; k++) if (sameCol(b, x, y, H[k])) { b.px(x, y, W4[Math.min(4, k + 1)]); break; } }
      }
    }
    if (s.ahoge) { b.line(cx + 1, topY + 1, cx + 4, topY - 5, H[2]); b.line(cx + 4, topY - 5, cx + 8, topY - 2, H[2]); b.px(cx + 3, topY - 3, H[3]); }
    if (s.ribbon && st !== 'braid' && !s.hat) { const rc = tones(s.ribbon); b.ellipse(45, 14 + oy, 4, 3, rc[2]); b.ellipse(52, 13 + oy, 4, 3, rc[2]); b.rect(47, 12 + oy, 3, 4, rc[1]); b.px(44, 13 + oy, rc[3]); b.px(51, 12 + oy, rc[3]); }
  }
  function animalEars(b, s, H, oy) {
    const fox = s.ears === 'fox';
    for (const [x, d] of [[18, -1], [46, 1]]) {
      poly(b, [[x - 6, 18 + oy], [x + d * 2, (fox ? 1 : 4) + oy], [x + 6, 16 + oy]], H[2]);
      poly(b, [[x - 3, 17 + oy], [x + d * 2, (fox ? 5 : 8) + oy], [x + 3, 16 + oy]], fox ? '#fff0e0' : '#ffb8c8');
    }
  }
  function hat(b, s, cx, oy, H) {
    if (!s.hat) return;
    const hc = tones(s.hatC || '#5a3a8a');
    switch (s.hat) {
      case 'witch':
        poly(b, [[cx - 26, 22 + oy], [cx + 26, 22 + oy], [cx + 18, 17 + oy], [cx - 18, 17 + oy]], hc[1]);
        poly(b, [[cx - 14, 18 + oy], [cx + 3, -2], [cx + 14, 2], [cx + 11, 18 + oy]], hc[2]);
        b.hline(cx - 13, cx + 12, 16 + oy, s.trim || '#e8c860'); b.hline(cx - 13, cx + 12, 15 + oy, s.trim || '#e8c860');
        poly(b, [[cx + 3, -2], [cx + 14, 2], [cx + 9, 5]], hc[1]); b.px(cx - 6, 10, hc[3]); b.px(cx - 5, 8, hc[3]);
        break;
      case 'hood':
        for (let y = 6; y < 58; y++) for (let x = 6; x < 58; x++) { const o = inEll(x, y, cx, 29 + oy, 22, 25), i = inEll(x, y, cx, 34 + oy, 15, 17) && y > 19 + oy; if (o && !i && (y < 46 + oy || x < 17 || x > 47)) b.px(x, y, x > cx + 8 ? hc[1] : hc[2]); }
        b.line(cx - 15, 22 + oy, cx - 8, 16 + oy, hc[3]);
        break;
      case 'helm':
        for (let y = 7; y < 34 + oy; y++) for (let x = 12; x < 53; x++) if (inEll(x, y, cx, 26 + oy, 20, 19) && y < 28 + oy) b.px(x, y, x < cx - 6 ? hc[3] : x > cx + 8 ? hc[1] : hc[2]);
        b.rect(cx - 20, 26 + oy, 41, 3, hc[1]); b.hline(cx - 20, cx + 20, 26 + oy, hc[3]);
        b.rect(cx - 1, 9 + oy, 3, 17, hc[3]); for (const x of [cx - 16, cx + 16]) b.rect(x - 1, 28 + oy, 3, 12, hc[1]);
        if (s.plume) { poly(b, [[cx - 2, 9 + oy], [cx + 10, -1], [cx + 18, 4], [cx + 2, 12 + oy]], s.plume); }
        break;
      case 'crown':
        b.rect(cx - 9, 10 + oy, 19, 5, '#e8c048'); for (const x of [cx - 9, cx - 3, cx + 3, cx + 9]) poly(b, [[x - 2, 11 + oy], [x, 4 + oy], [x + 2, 11 + oy]], '#f0d060');
        b.hline(cx - 9, cx + 9, 10 + oy, '#fff0a8'); b.px(cx, 12 + oy, '#d83a5a'); b.px(cx - 6, 12 + oy, '#4a8ad8'); b.px(cx + 6, 12 + oy, '#4ad88a');
        break;
      case 'band': b.rect(cx - 17, 20 + oy, 35, 3, hc[2]); b.hline(cx - 17, cx + 17, 20 + oy, hc[3]); poly(b, [[cx + 16, 21 + oy], [cx + 24, 26 + oy], [cx + 22, 29 + oy], [cx + 15, 23 + oy]], hc[1]); break;
      case 'ribbon': b.ellipse(cx + 10, 10 + oy, 6, 4, hc[2]); b.ellipse(cx + 21, 9 + oy, 6, 4, hc[2]); b.rect(cx + 13, 7 + oy, 4, 6, hc[1]); b.px(cx + 8, 9 + oy, hc[3]); b.px(cx + 20, 8 + oy, hc[3]); break;
      case 'straw': b.ellipse(cx, 17 + oy, 27, 5, '#e8c878'); b.ellipse(cx, 12 + oy, 14, 8, '#f0d890'); b.rect(cx - 14, 14 + oy, 29, 2, hc[2]); b.ellipse(cx, 18 + oy, 25, 3, '#c8a858'); break;
      case 'veil':
        for (let y = 8; y < 64; y++) for (let x = 4; x < 60; x++) { const o = inEll(x, y, cx, 30 + oy, 22, 26), i = inEll(x, y, cx, 35 + oy, 15, 17) && y > 21 + oy; if (o && !i && !(y > 48 + oy && x > 16 && x < 48)) b.px(x, y, x > cx + 10 ? hc[1] : hc[2]); }
        b.rect(cx - 16, 19 + oy, 33, 3, s.trim || '#ffffff'); break;
      case 'goggles': b.rect(cx - 17, 17 + oy, 35, 3, '#5a3a22'); for (const x of [cx - 8, cx + 8]) { b.ellipse(x, 17 + oy, 5.5, 4.5, '#8a8a9a'); b.ellipse(x, 17 + oy, 4, 3, '#6ad8ff'); b.px(x - 2, 15 + oy, '#ffffff'); } break;
      case 'tophat': b.ellipse(cx, 16 + oy, 18, 3.5, hc[1]); b.rect(cx - 11, 0, 23, 16 + oy, hc[2]); b.rect(cx - 11, 11 + oy, 23, 3, s.trim || '#8a2a3a'); b.rect(cx - 11, 0, 4, 12 + oy, hc[3]); break;
      case 'cap': b.ellipse(cx, 19 + oy, 18, 10, hc[2]); b.rect(cx - 18, 19 + oy, 37, 2, hc[1]); poly(b, [[cx - 4, 20 + oy], [cx + 22, 20 + oy], [cx + 24, 24 + oy], [cx - 2, 23 + oy]], hc[1]); b.px(cx, 10 + oy, hc[3]); break;
      default: break;
    }
  }
  function glasses(b, cx, ey, eh) {
    const c = '#2a2438';
    for (const x of [cx - 13, cx + 3]) { b.hline(x, x + 10, ey - 2, c); b.hline(x, x + 10, ey + eh + 1, c); b.vline(x, ey - 2, ey + eh + 1, c); b.vline(x + 10, ey - 2, ey + eh + 1, c); b.px(x + 2, ey, '#ffffff'); b.px(x + 3, ey - 1, '#ffffff'); }
    b.hline(cx - 2, cx + 2, ey, c);
  }
  function clothes(b, s, T, TR, SK, cx, shY) {
    switch (s.top) {
      case 'armor':
        poly(b, [[cx - 22, 64], [cx - 20, shY + 3], [cx - 9, shY], [cx + 9, shY], [cx + 20, shY + 3], [cx + 22, 64]], T[2]);
        b.ellipse(cx - 19, shY + 5, 7, 5, T[3]); b.ellipse(cx + 19, shY + 5, 7, 5, T[1]);
        b.hline(cx - 9, cx + 9, shY + 1, TR[2]); b.rect(cx - 2, shY + 3, 5, 7, TR[2]); for (const x of [cx - 14, cx + 14]) b.px(x, shY + 8, TR[3]);
        break;
      case 'robe': case 'dress':
        poly(b, [[cx - 7, shY - 1], [cx, shY + 7], [cx + 7, shY - 1]], SK[2]);
        b.line(cx - 7, shY - 1, cx, shY + 7, TR[2]); b.line(cx + 7, shY - 1, cx, shY + 7, TR[2]);
        if (s.top === 'dress') { b.ellipse(cx, shY + 8, 3, 2, s.ribbon || TR[2]); b.px(cx - 4, shY + 9, s.ribbon || TR[1]); b.px(cx + 4, shY + 9, s.ribbon || TR[1]); }
        else { b.rect(cx - 9, shY - 2, 3, 12, TR[1]); b.rect(cx + 7, shY - 2, 3, 12, TR[1]); }
        break;
      case 'coat':
        poly(b, [[cx - 6, shY - 1], [cx, shY + 9], [cx + 6, shY - 1]], '#f0ece0');
        poly(b, [[cx - 10, shY - 2], [cx - 6, shY - 1], [cx - 1, shY + 10], [cx - 6, shY + 10]], T[3]);
        poly(b, [[cx + 10, shY - 2], [cx + 6, shY - 1], [cx + 1, shY + 10], [cx + 6, shY + 10]], T[1]);
        b.px(cx - 4, shY + 8, TR[2]); b.px(cx + 4, shY + 8, TR[2]);
        break;
      case 'vest':
        poly(b, [[cx - 7, shY - 1], [cx, shY + 10], [cx + 7, shY - 1]], '#e8e0d0');
        b.line(cx - 7, shY - 1, cx - 1, shY + 10, T[0]); b.line(cx + 7, shY - 1, cx + 1, shY + 10, T[0]);
        break;
      default: // 튜닉
        poly(b, [[cx - 6, shY - 1], [cx, shY + 5], [cx + 6, shY - 1]], SK[2]);
        b.line(cx - 6, shY - 1, cx, shY + 5, TR[2]); b.line(cx + 6, shY - 1, cx, shY + 5, TR[2]);
        b.hline(cx - 22, cx - 12, shY + 6, T[1]);
        break;
    }
    if (s.cape) { const cc = tones(s.cape); poly(b, [[cx - 26, 64], [cx - 23, shY + 2], [cx - 16, shY + 2], [cx - 18, 64]], cc[2]); poly(b, [[cx + 26, 64], [cx + 23, shY + 2], [cx + 16, shY + 2], [cx + 18, 64]], cc[1]); b.rect(cx - 14, shY, 5, 4, '#e8c860'); }
  }
  function accs(b, s, cx, oy, fy, shY, H) {
    for (const a of s.acc || []) {
      if (a === 'scarf' || s.scarfC && a === 'scarf') { const sc = tones(s.scarfC || '#d83a3a'); b.rect(cx - 9, shY - 3, 19, 5, sc[2]); b.hline(cx - 9, cx + 9, shY - 3, sc[3]); poly(b, [[cx + 4, shY + 1], [cx + 10, shY + 10], [cx + 6, shY + 11], [cx + 2, shY + 2]], sc[1]); }
      if (a === 'necklace') { b.line(cx - 6, shY - 1, cx, shY + 5, '#e8c860'); b.line(cx + 6, shY - 1, cx, shY + 5, '#e8c860'); b.ellipse(cx, shY + 6, 2, 2, s.gem || '#6ae07a'); }
      if (a === 'earring') { b.px(cx - 16, fy + 5, '#e8c860'); b.px(cx - 16, fy + 6, s.gem || '#6ad8ff'); }
      if (a === 'flower') { const fc = s.flowerC || '#ff8ab0'; for (const [dx, dy] of [[0, -2], [2, 0], [0, 2], [-2, 0]]) b.ellipse(45 + dx, 20 + oy + dy, 1.6, 1.6, fc); b.px(45, 20 + oy, '#ffe060'); }
      if (a === 'pauldron') { b.ellipse(cx - 20, shY + 4, 7, 4, '#9a9ab8'); b.hline(cx - 26, cx - 14, shY + 2, '#d8d8e8'); }
      if (a === 'staff') { b.vline(56, 20, 63, '#6a4424'); b.ellipse(56, 18, 3, 3, s.gem || '#b87aff'); b.px(55, 17, '#ffffff'); }
      if (a === 'sword') { b.line(4, 63, 8, 56, '#6a4424'); b.rect(6, 55, 5, 2, '#e8c048'); }
      if (a === 'lute') { b.ellipse(50, 60, 6, 5, '#a8703a'); b.line(46, 56, 58, 40, '#6a4424'); b.ellipse(50, 60, 1.5, 1.5, '#2a1a10'); }
      if (a === 'book') { b.rect(44, 54, 12, 9, '#6a3a8a'); b.hline(44, 55, 54, '#e8c860'); b.vline(49, 54, 62, '#e8c860'); }
      if (a === 'monocle') { b.ellipse(cx + 8, 37 + oy, 5, 5, '#e8c860'); }
    }
    void H;
  }

  /* ───────── 사람이 아닌 이 ───────── */
  const BEAST = {
    squirrel(face) { // 토리아
      const b = X.brush(SZ, SZ), F = tones('#c89a6a'), C = '#fff0dc';
      b.ellipse(32, 64, 22, 12, F[2]); b.ellipse(32, 62, 12, 8, C);
      b.ellipse(14, 16, 8, 9, F[2]); b.ellipse(50, 16, 8, 9, F[1]); b.ellipse(14, 17, 5, 6, '#ffc8b0'); b.ellipse(50, 17, 5, 6, '#e8a890');
      b.ellipse(32, 34, 21, 19, F[2]); b.ellipse(28, 28, 12, 9, F[3]);
      b.ellipse(32, 42, 13, 9, C); b.ellipse(18, 42, 6, 4, C); b.ellipse(46, 42, 6, 4, C);
      // 눈: 크고 까만
      const ey = face === 'shock' ? 30 : 32;
      for (const x of [23, 41]) {
        if (face === 'happy' || face === 'closed') { b.line(x - 4, ey + 2, x, ey - 1, OUT); b.line(x, ey - 1, x + 4, ey + 2, OUT); continue; }
        b.ellipse(x, ey, 4.5, 5.5, '#1a1020'); b.ellipse(x - 1.5, ey - 2, 1.6, 1.8, '#ffffff'); b.px(x + 2, ey + 2, '#ffffff');
        if (face === 'sad' || face === 'cry') b.hline(x - 4, x + 4, ey - 6, F[0]);
        if (face === 'angry') b.line(x - 4, ey - 7 + (x < 32 ? 0 : 2), x + 4, ey - 7 + (x < 32 ? 2 : 0), F[0]);
      }
      if (face === 'cry') { b.vline(20, 38, 46, '#8ad8ff'); b.vline(44, 38, 46, '#8ad8ff'); }
      b.ellipse(32, 39, 2.5, 1.8, '#5a2a3a'); b.px(31, 38, '#ffffff');
      if (face === 'happy' || face === 'smile') { b.line(28, 43, 31, 45, '#5a2a3a'); b.line(33, 45, 36, 43, '#5a2a3a'); b.rect(31, 45, 3, 2, '#ffffff'); }
      else if (face === 'shock') b.ellipse(32, 45, 2, 2.5, '#5a2a3a');
      else { b.hline(30, 34, 44, '#5a2a3a'); b.rect(31, 45, 3, 2, '#ffffff'); }
      b.rect(15, 44, 5, 2, '#ff9ab0', 0.5); b.rect(44, 44, 5, 2, '#ff9ab0', 0.5);
      for (const [x, y] of [[10, 38], [11, 41], [53, 38], [52, 41]]) b.hline(x - 3, x + 2, y, F[0]);
      return X.outline(b.put(), OUT);
    },
    cat(face) { // 미드나잇
      const b = X.brush(SZ, SZ), K = ['#0a0810', '#16121e', '#221c2c', '#3a3048', '#5a4a6a'];
      b.ellipse(32, 64, 22, 12, K[1]); b.rect(26, 52, 12, 12, '#f4f0e8'); b.ellipse(32, 55, 5, 3, '#8a2a3a');
      poly(b, [[12, 24], [14, 4], [26, 16]], K[2]); poly(b, [[52, 24], [50, 4], [38, 16]], K[1]);
      poly(b, [[15, 20], [16, 9], [23, 16]], '#6a3a5a');
      b.ellipse(32, 34, 20, 17, K[2]); b.ellipse(27, 28, 11, 8, K[3]);
      const ey = 32;
      for (const x of [23, 41]) {
        if (face === 'closed' || face === 'happy') { b.line(x - 4, ey, x + 4, ey + (face === 'happy' ? -2 : 1), '#e8c040'); continue; }
        b.ellipse(x, ey, 5, 4, '#e8c040'); b.ellipse(x, ey, 4, 3, '#ffe070'); b.vline(x, ey - 3, ey + 3, '#0a0810'); b.px(x + 1, ey - 3, '#0a0810'); b.px(x - 2, ey - 2, '#ffffff');
        if (face === 'smirk' && x > 32) b.hline(x - 5, x + 5, ey - 3, K[2]);
      }
      // 외알 안경
      b.ellipse(41, 32, 6.5, 6.5, '#e8c860'); b.ellipse(41, 32, 5.5, 5.5, face === 'closed' || face === 'happy' ? K[2] : '#ffe070'); if (!(face === 'closed' || face === 'happy')) { b.ellipse(41, 32, 4, 3, '#ffe070'); b.vline(41, 29, 35, '#0a0810'); } b.line(47, 34, 50, 52, '#e8c860');
      b.px(31, 39, '#e86a8a'); b.px(32, 39, '#e86a8a'); b.px(33, 39, '#e86a8a');
      if (face === 'smile' || face === 'smirk' || face === 'happy') { b.line(28, 42, 31, 43, '#8a6a9a'); b.line(33, 43, 36, 41, '#8a6a9a'); } else b.hline(30, 34, 42, '#8a6a9a');
      for (const [x, y, d] of [[12, 38, -1], [12, 41, -1], [52, 38, 1], [52, 41, 1]]) b.line(x, y, x + d * 8, y - 1, '#8a8098');
      // 실크해트
      b.ellipse(32, 16, 18, 3.5, K[1]); b.rect(21, 0, 23, 15, K[2]); b.rect(21, 10, 23, 3, '#8a2a3a'); b.rect(21, 0, 4, 11, K[3]);
      return X.outline(b.put(), '#000000');
    },
    octopus(face) { // 옥타비오 관장
      const b = X.brush(SZ, SZ), P = tones('#d86a8a');
      for (let i = 0; i < 5; i++) { const x = 12 + i * 10; b.ellipse(x, 58, 4, 7, P[i % 2 ? 1 : 2]); for (let k = 0; k < 3; k++) b.px(x, 55 + k * 3, P[4]); }
      b.ellipse(32, 30, 22, 22, P[2]); b.ellipse(26, 20, 12, 10, P[3]); b.ellipse(22, 16, 4, 3, P[4]);
      for (const [x, y] of [[40, 14], [46, 22], [36, 10]]) b.ellipse(x, y, 1.5, 1.5, P[1]);
      for (const x of [23, 41]) { b.ellipse(x, 34, 5, 5, '#ffffff'); b.ellipse(x + (face === 'think' ? 1 : 0), 35, 2.5, 3, '#2a1a30'); b.px(x - 1, 33, '#ffffff'); }
      // 안경
      for (const x of [23, 41]) { for (let a = 0; a < 40; a++) { const t = (a / 40) * Math.PI * 2; b.px(Math.round(x + Math.cos(t) * 7), Math.round(34 + Math.sin(t) * 7), '#2a2438'); } }
      b.hline(30, 34, 33, '#2a2438');
      if (face === 'smile' || face === 'happy') { b.line(27, 45, 32, 48, '#6a1a3a'); b.line(32, 48, 37, 45, '#6a1a3a'); } else if (face === 'shock') b.ellipse(32, 47, 2.5, 3, '#6a1a3a'); else b.hline(29, 35, 46, '#6a1a3a');
      return X.outline(b.put(), OUT);
    },
    ai(face) { // 스텔라: 렌즈 하나와 고리
      const b = X.brush(SZ, SZ);
      b.ellipse(32, 32, 28, 28, '#101828'); b.ellipse(32, 32, 26, 26, '#18243a');
      for (let a = 0; a < 90; a++) { const t = (a / 90) * Math.PI * 2; if (a % 6 < 4) b.px(Math.round(32 + Math.cos(t) * 23), Math.round(32 + Math.sin(t) * 23), '#4ad8ff'); }
      const col = face === 'angry' ? '#ff5a7a' : face === 'sad' ? '#8a8ad8' : face === 'happy' || face === 'smile' ? '#8affd8' : '#6ad8ff';
      b.ellipse(32, 32, 13, 13, U.shade(col, 0.4)); b.ellipse(32, 32, 10, 10, U.shade(col, 0.7)); b.ellipse(32, 32, 6, 6, col); b.ellipse(32, 32, 2.5, 2.5, '#ffffff'); b.px(28, 28, '#ffffff'); b.px(27, 29, '#ffffff');
      if (face === 'closed') b.rect(18, 30, 29, 4, '#18243a');
      for (let y = 6; y < 60; y += 3) for (let x = 8; x < 57; x++) if (b.get(x, y)) b.px(x, y, '#ffffff', 0.05);
      return X.outline(b.put(), '#000000');
    },
    shade(face) { // 흑점 · 빈 왕 · 그림자
      const b = X.brush(SZ, SZ);
      for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { const d = U.dist(x, y, 32, 30); const n = U.vnoise(x / 6, y / 6, 9); if (d < 24 + n * 8) b.px(x, y, d < 16 ? '#0a0612' : '#1a1028'); }
      const eyes = face === 'closed' ? [] : [[22, 30], [42, 30]];
      for (const [x, y] of eyes) { b.ellipse(x, y, 4, 2.5, '#ff2a5a'); b.hline(x - 1, x + 1, y, '#ffd0d8'); }
      if (face === 'angry' || face === 'shock') { for (let x = 20; x < 45; x++) b.px(x, 44 + Math.round(Math.sin(x) * 1.5), '#ff2a5a'); }
      return X.outline(b.put(), '#000000');
    },
    spirit(face) { // 나무 정령: 잎으로 된 얼굴, 빛나는 눈
      const b = X.brush(SZ, SZ), L = tones('#6ab85a');
      for (let i = 0; i < 70; i++) { const a = (i / 70) * Math.PI * 2, r = 22 + Math.sin(i * 1.7) * 5; b.ellipse(32 + Math.cos(a) * r * 0.9, 32 + Math.sin(a) * r, 5, 4, i % 3 ? L[2] : L[1]); }
      b.ellipse(32, 32, 19, 21, '#5a3a22'); b.ellipse(32, 30, 16, 18, '#7a5232'); for (let y = 16; y < 50; y += 5) b.hline(20, 44, y, '#6a4428');
      const shut = face === 'closed' || face === 'sad';
      for (const x of [25, 39]) { if (shut) b.hline(x - 3, x + 3, 30, '#d8ffb0'); else { b.ellipse(x, 30, 3.5, 3, '#d8ffb0'); b.ellipse(x, 30, 1.5, 1.5, '#ffffff'); } }
      b.ellipse(32, 42, 5, face === 'smile' ? 2 : 1.5, '#3a2414');
      for (let i = 0; i < 8; i++) b.px(10 + i * 6, 8 + (i % 3) * 3, '#e8ffb0');
      return X.outline(b.put(), OUT);
    },
    whale(face) { // 구름고래 누베
      const b = X.brush(SZ, SZ);
      b.ellipse(32, 36, 28, 20, '#bfe4ff'); b.ellipse(28, 30, 20, 12, '#e8f6ff'); b.ellipse(32, 50, 22, 8, '#ffffff');
      for (const [x, y] of [[8, 20], [56, 18], [12, 52], [54, 50]]) b.ellipse(x, y, 6, 4, '#ffffff');
      b.ellipse(22, 34, 3.5, 4, '#1a2a4a'); b.px(21, 32, '#ffffff'); b.line(30, 44, 44, 42, '#6a8ab8');
      b.px(44, 16, '#ffffff'); b.px(46, 12, '#e8f6ff'); b.px(42, 10, '#e8f6ff');
      return X.outline(b.put(), '#4a6a9a');
    },
    armor(face) { // 빈 왕: 속이 빈 은빛 갑옷
      const b = X.brush(SZ, SZ), M = tones('#b8c0d8');
      poly(b, [[6, 64], [10, 50], [22, 46], [42, 46], [54, 50], [58, 64]], M[1]);
      for (let y = 6; y < 50; y++) for (let x = 12; x < 53; x++) if (inEll(x, y, 32, 28, 18, 22)) b.px(x, y, x < 24 ? M[3] : x > 42 ? M[1] : M[2]);
      b.rect(16, 28, 33, 6, '#05040a'); b.rect(30, 34, 5, 12, '#05040a');
      for (const x of [23, 41]) b.ellipse(x, 31, 2, 1.5, face === 'closed' ? '#05040a' : '#bfe8ff');
      poly(b, [[20, 8], [26, 0], [32, 6], [38, 0], [44, 8]], '#e8c048');
      for (let y = 36; y < 46; y += 2) b.hline(20, 28, y, M[0]);
      return X.outline(b.put(), OUT);
    },
  };

  /* ───────── 그리기 ───────── */
  function resolve(who) {
    if (!who) return null;
    if (who === 'hero') return G.story && G.story.heroLook ? G.story.heroLook(G.state) : { gender: G.state.gender };
    if (typeof who === 'string') {
      const c = G.cast && G.cast.get(who); if (c) return c.look;
      // 인물 목록에 없는 id: 지금 지도에 있는 그 사람의 모습으로
      const e = G.world && G.world.ents && G.world.ents.find((x) => x.cid === who && x.look && !x.dead);
      return e ? e.look : null;
    }
    if (who.cid && G.cast && G.cast.get(who.cid)) return G.cast.get(who.cid).look;
    if (who.look) return who.look;
    return who;
  }
  function get(who, face) {
    const look = resolve(who);
    if (!look) return null;
    face = face || 'normal';
    const key = JSON.stringify(look) + '|' + face;
    let c = cache.get(key);
    if (!c) { c = look.kind && BEAST[look.kind] ? BEAST[look.kind](face, look) : human(look, face); cache.set(key, c); if (cache.size > 300) cache.delete(cache.keys().next().value); }
    return c;
  }
  /** 캔버스 하나에 얼굴을 그린다 (64×64) */
  function draw(cv, who, face) {
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    const img = get(who, face);
    if (!img) return;
    const s = cv.width / SZ;
    g.drawImage(img, 0, 0, img.width, img.height, Math.round(-1 * s), Math.round(-1 * s), Math.round(img.width * s), Math.round(img.height * s));
  }

  G.portraits = { draw, get, human, BEAST, FACES: Object.keys(FACES), SZ };
})();
