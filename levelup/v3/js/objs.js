/* 들판의 고정 사물: 나무 · 덤불 · 바위 · 꽃 · 풀숲 · 선인장 …
   obj 격자에 번호로 들어간다. ground: 바닥 묶음에 함께 그림(밟고 지나감) · solid: 막힘 · cut: 칼로 벤다 · lift/bomb/burn */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles;

  const O = {
    NONE: 0, TREE: 1, PINE: 2, PALM: 3, DEAD: 4, BLOSSOM: 5, SHROOM: 6, CRYSTAL: 7, BUSH: 8, ROCK: 9, BOULDER: 10,
    FLOWER: 11, TALL: 12, STUMP: 13, CACTUS: 14, REED: 15, ICESPIKE: 16, PEBBLE: 17, FENCEH: 18, FENCEV: 19, LILY: 20,
    SNOWTREE: 21, BIGTREE: 22, GRAVE: 23, BONES: 24, CORAL: 25, LAMP: 26, SIGNPOST: 27, WELL: 28, PILLAR: 29, RUBBLE: 30,
  };
  const DEF = [];
  const def = (id, p) => { DEF[id] = Object.assign({ id }, p); };
  def(O.TREE, { name: '나무', solid: 1, big: 1, burn: 1 });
  def(O.BIGTREE, { name: '고목', solid: 1, big: 1 });
  def(O.PINE, { name: '전나무', solid: 1, big: 1, burn: 1 });
  def(O.SNOWTREE, { name: '눈 덮인 전나무', solid: 1, big: 1 });
  def(O.PALM, { name: '야자수', solid: 1, big: 1 });
  def(O.DEAD, { name: '마른 나무', solid: 1, big: 1, burn: 1 });
  def(O.BLOSSOM, { name: '꽃나무', solid: 1, big: 1 });
  def(O.SHROOM, { name: '큰 버섯', solid: 1, big: 1 });
  def(O.CRYSTAL, { name: '수정', solid: 1, big: 1 });
  def(O.BUSH, { name: '덤불', solid: 1, cut: 1, lift: 1, burn: 1, drop: 'bush' });
  def(O.ROCK, { name: '돌', solid: 1, lift: 2, drop: 'rock' });
  def(O.BOULDER, { name: '바위', solid: 1, bomb: 1, big: 1 });
  def(O.FLOWER, { name: '꽃', ground: 1 });
  def(O.TALL, { name: '풀숲', ground: 1, cut: 1, burn: 1, drop: 'grass', wade: 1 });
  def(O.PEBBLE, { name: '자갈', ground: 1 });
  def(O.STUMP, { name: '그루터기', solid: 1 });
  def(O.CACTUS, { name: '선인장', solid: 1, cut: 1, hurt: 1 });
  def(O.REED, { name: '갈대', ground: 1, cut: 1, wade: 1 });
  def(O.LILY, { name: '연잎', ground: 1 });
  def(O.ICESPIKE, { name: '얼음 가시', solid: 1, burn: 1, melt: 1 });
  def(O.FENCEH, { name: '울타리', solid: 1 });
  def(O.FENCEV, { name: '울타리', solid: 1 });
  def(O.GRAVE, { name: '묘비', solid: 1 });
  def(O.BONES, { name: '뼈', ground: 1 });
  def(O.CORAL, { name: '산호', solid: 1 });
  def(O.LAMP, { name: '가로등', solid: 1, light: '#ffd86a' });
  def(O.SIGNPOST, { name: '이정표', solid: 1 });
  def(O.WELL, { name: '우물', solid: 1, big: 1 });
  def(O.PILLAR, { name: '돌기둥', solid: 1, big: 1 });
  def(O.RUBBLE, { name: '잔해', solid: 1, bomb: 1 });

  const n2 = U.noise2;
  const cache = {};

  /* ───────── 그림 ───────── */
  // 둥근 잎 뭉치: 왼쪽 위에서 빛
  function blob(b, cx, cy, r, cols, seed) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const wob = (n2(x, y, seed) - 0.5) * 1.6;
      if (dx * dx + dy * dy > (r + wob * 0.6) * (r + wob * 0.6)) continue;
      const lit = (-dx * 0.6 - dy * 0.8) / r + (n2(x >> 1, y >> 1, seed + 1) - 0.5) * 0.5;
      b.px(x, y, lit > 0.45 ? cols[3] : lit > 0.05 ? cols[2] : lit > -0.45 ? cols[1] : cols[0]);
    }
  }
  function leafPal(reg, kind) {
    const P = TL.PAL[reg] || TL.PAL.green;
    if (kind === 'blossom') return ['#b04a7a', '#e070a8', '#ff9ccc', '#ffd6ec'];
    if (kind === 'dead') return ['#3a2a22', '#5a4232', '#7a5c44', '#9a7a5e'];
    const g = P.g;
    return [U.shade(g[0], 0.7), g[0], g[1], g[2]];
  }
  function tree(reg, v, kind) {
    const W = 36, H = 44, b = X.brush(W, H);
    const cols = leafPal(reg, kind);
    const cx = 18 + ((v * 3) % 3) - 1;
    // 줄기
    const bark = kind === 'dead' ? ['#2e2018', '#4a3426', '#6a4c36'] : ['#3e2a1c', '#5e4028', '#7e5a3a'];
    for (let y = 26; y < 42; y++) for (let x = cx - 3; x <= cx + 2; x++) b.px(x, y, x === cx - 3 ? bark[0] : x >= cx + 1 ? bark[0] : x === cx - 2 ? bark[2] : bark[1]);
    b.px(cx - 4, 41, bark[0]); b.px(cx + 3, 41, bark[0]); b.px(cx - 5, 42, bark[1]); b.px(cx + 4, 42, bark[1]);
    if (kind === 'dead') {
      b.line(cx, 26, cx - 9, 12, bark[1]); b.line(cx - 1, 26, cx + 8, 10, bark[1]); b.line(cx - 5, 18, cx - 12, 16, bark[1]);
      b.line(cx + 4, 18, cx + 12, 19, bark[1]); b.line(cx, 20, cx + 1, 6, bark[2]);
      return X.outline(b.put());
    }
    // 잎: 큰 뭉치 셋 + 작은 뭉치
    const s = v * 7 + 3;
    blob(b, cx - 6, 18, 9, cols, s); blob(b, cx + 6, 17, 9, cols, s + 5); blob(b, cx, 11, 10, cols, s + 9);
    blob(b, cx, 21, 8, cols, s + 13);
    // 열매 · 꽃
    const P = TL.PAL[reg] || TL.PAL.green;
    if (kind !== 'blossom' && (v % 3 === 0)) for (let i = 0; i < 4; i++) b.px(cx - 8 + ((i * 7 + v) % 16), 9 + ((i * 5 + v * 3) % 14), P.g[3]);
    return X.outline(b.put());
  }
  function pine(reg, v, snowy) {
    const W = 28, H = 46, b = X.brush(W, H);
    const cols = leafPal(reg);
    const dark = U.shade(cols[1], 0.75);
    const cx = 14;
    for (let y = 36; y < 44; y++) { b.px(cx - 1, y, '#3e2a1c'); b.px(cx, y, '#5e4028'); b.px(cx + 1, y, '#3e2a1c'); }
    for (let tier = 0; tier < 4; tier++) {
      const top = 3 + tier * 8, hgt = 13, half = 5 + tier * 2.3;
      for (let y = top; y < top + hgt; y++) {
        const w = ((y - top) / hgt) * half;
        for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) {
          const rel = (x - cx) / (half + 0.01);
          let c = rel < -0.3 ? cols[2] : rel > 0.4 ? dark : cols[1];
          if (y === top + hgt - 1 || (y > top + hgt - 3 && n2(x, y, v) > 0.5)) c = dark;
          if (snowy && (y - top) < 3 + (n2(x, tier, 7) * 3) && rel < 0.5) c = (y - top) < 2 ? '#ffffff' : '#dce8f6';
          b.px(x, y, c);
        }
      }
      if (snowy) for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) if (n2(x, tier, 9) > 0.45) b.px(x, top + hgt - 1, '#eef4ff');
    }
    return X.outline(b.put());
  }
  function palm(v) {
    const W = 34, H = 46, b = X.brush(W, H);
    let x = 17;
    for (let y = 44; y > 14; y--) { x += Math.sin(y * 0.18 + v) * 0.25; b.px(Math.round(x) - 1, y, '#8a6a3e'); b.px(Math.round(x), y, y % 3 === 0 ? '#6a4e2c' : '#a8845a'); b.px(Math.round(x) + 1, y, '#6a4e2c'); }
    const tx = Math.round(x), ty = 14;
    const fronds = [[-14, 4], [-10, -6], [0, -9], [10, -6], [14, 5], [-6, 9], [6, 9]];
    for (const [fx, fy] of fronds) {
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, px = tx + fx * t, py = ty + fy * t + Math.sin(t * Math.PI) * -3 + t * t * 5;
        b.px(px, py, '#3a8a3a'); b.px(px, py + 1, '#56b04a'); if (i % 2) b.px(px + (fx > 0 ? -1 : 1), py + 2, '#2a6a2e');
      }
    }
    b.ellipse(tx, ty + 2, 2.5, 2, '#6a4a2a'); b.px(tx - 1, ty + 1, '#a8804a');
    return X.outline(b.put());
  }
  function shroom(v) {
    const W = 30, H = 36, b = X.brush(W, H);
    for (let y = 18; y < 34; y++) for (let x = 12; x <= 17; x++) b.px(x, y, x < 14 ? '#e8e0f0' : x > 16 ? '#a8a0c0' : '#d0c8e0');
    for (let y = 4; y < 20; y++) for (let x = 2; x < 28; x++) {
      const dx = (x - 15) / 13, dy = (y - 17) / 13;
      if (dx * dx + dy * dy * 2.2 > 1 || y > 18) continue;
      let c = dy < -0.7 ? '#e070c0' : dx < -0.3 ? '#c050a8' : '#a03a90';
      if (y === 18) c = '#6a2a64';
      b.px(x, y, c);
    }
    for (let i = 0; i < 6; i++) b.ellipse(5 + ((i * 7 + v) % 20), 8 + ((i * 3) % 8), 1.6, 1.3, '#ffd6f4');
    return X.outline(b.put());
  }
  function crystal(v) {
    const W = 24, H = 34, b = X.brush(W, H);
    const shards = [[12, 4, 5], [6, 12, 3.5], [17, 10, 3.5], [9, 18, 3], [15, 17, 3]];
    for (const [cx, top, w] of shards) for (let y = top; y < 32; y++) {
      const hw = y < top + w ? (y - top) : w;
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) b.px(x, y, x < cx ? '#fff0a8' : x === Math.round(cx) ? '#ffffff' : '#d8a840');
    }
    return X.outline(b.put(), '#4a2e10');
  }
  function bush(reg, v, burnt) {
    const b = X.brush(18, 16);
    const cols = leafPal(reg);
    blob(b, 6, 9, 5, cols, v * 3 + 1); blob(b, 12, 9, 5, cols, v * 3 + 2); blob(b, 9, 6, 5, cols, v * 3 + 3);
    if (v % 2) { b.px(5, 6, '#ff7a8a'); b.px(12, 8, '#ff7a8a'); }
    return X.outline(b.put());
  }
  function rock(reg, v, big) {
    const P = TL.PAL[reg] || TL.PAL.green;
    const C = P.c;
    const W = big ? 30 : 16, H = big ? 26 : 14, b = X.brush(W, H);
    const cx = W / 2, cy = H / 2 + 1, rx = W / 2 - 1, ry = H / 2 - 1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      const wob = (n2(x >> 1, y >> 1, v + 30) - 0.5) * 0.25;
      if (dx * dx + dy * dy > 1 + wob) continue;
      const lit = -dx * 0.6 - dy * 0.9 + (n2(x, y, v) - 0.5) * 0.3;
      b.px(x, y, lit > 0.5 ? U.mix(C[2], '#ffffff', 0.25) : lit > 0 ? C[2] : lit > -0.6 ? C[1] : C[0]);
    }
    if (big) { b.line(8, 10, 13, 16, C[0]); b.line(13, 16, 12, 21, C[0]); b.line(20, 8, 22, 14, C[0]); }
    return X.outline(b.put());
  }
  function simple(id, reg, v) {
    const P = TL.PAL[reg] || TL.PAL.green;
    switch (id) {
      case O.FLOWER: {
        const b = X.brush(16, 16);
        const cols = [P.g[3], '#ffffff', '#ff8aa8', '#8ac8ff', '#ffd84a'];
        for (let i = 0; i < 3; i++) {
          const x = 2 + ((v * 5 + i * 5) % 12), y = 3 + ((v * 3 + i * 4) % 10), c = cols[(v + i) % cols.length];
          b.px(x, y + 1, U.shade(P.g[0], 0.9)); b.px(x - 1, y, c); b.px(x + 1, y, c); b.px(x, y - 1, c); b.px(x, y, '#ffe060');
        }
        return b.put();
      }
      case O.TALL: {
        const b = X.brush(16, 16);
        for (let i = 0; i < 7; i++) {
          const x = 1 + ((i * 5 + v) % 14), h = 5 + ((i * 3 + v) % 4);
          for (let y = 0; y < h; y++) b.px(x + (y > h - 3 ? (i % 2 ? 1 : -1) : 0), 14 - y, y > h - 2 ? P.g[2] : y < 2 ? P.g[0] : P.g[1]);
        }
        return b.put();
      }
      case O.REED: {
        const b = X.brush(16, 16);
        for (let i = 0; i < 5; i++) { const x = 2 + i * 3; for (let y = 3; y < 15; y++) b.px(x + (y < 6 ? 1 : 0), y, y < 5 ? '#8a6a3a' : '#5a8a3a'); }
        return b.put();
      }
      case O.LILY: {
        const b = X.brush(16, 16);
        b.ellipse(8, 9, 5, 3.5, '#3a8a3a'); b.ellipse(7.5, 8.5, 3.5, 2.2, '#56aa48'); b.px(8, 9, '#2a6a2a'); b.px(9, 9, '#2a6a2a');
        if (v % 3 === 0) { b.px(6, 7, '#ffb0d0'); b.px(7, 6, '#ffd6e8'); }
        return b.put();
      }
      case O.PEBBLE: case O.BONES: {
        const b = X.brush(16, 16);
        if (id === O.BONES) { b.hline(4, 11, 10, '#e8e0cc'); b.px(3, 9, '#e8e0cc'); b.px(3, 11, '#e8e0cc'); b.px(12, 9, '#e8e0cc'); b.px(12, 11, '#e8e0cc'); b.ellipse(10, 5, 2.4, 2, '#e8e0cc'); b.px(9, 5, '#2a2020'); b.px(11, 5, '#2a2020'); return b.put(); }
        for (let i = 0; i < 3; i++) { const x = 3 + ((v * 7 + i * 5) % 10), y = 4 + ((v * 3 + i * 6) % 9); b.px(x, y, P.c[2]); b.px(x + 1, y, P.c[1]); b.px(x, y + 1, P.c[0]); }
        return b.put();
      }
      case O.STUMP: {
        const b = X.brush(16, 16);
        b.rect(3, 6, 10, 8, '#5e4028'); b.ellipse(8, 6, 5, 2.5, '#a8845a'); b.ellipse(8, 6, 3, 1.4, '#c8a47a'); b.px(8, 6, '#8a6a3e');
        return X.outline(b.put());
      }
      case O.CACTUS: {
        const b = X.brush(16, 22);
        b.rect(6, 2, 4, 19, '#4a9a4a'); b.rect(7, 2, 1, 19, '#6ac06a'); b.rect(2, 8, 3, 6, '#4a9a4a'); b.rect(2, 13, 5, 2, '#4a9a4a'); b.rect(11, 5, 3, 6, '#4a9a4a'); b.rect(9, 10, 5, 2, '#4a9a4a');
        for (let y = 3; y < 20; y += 3) { b.px(5, y, '#e8f0c0'); b.px(10, y + 1, '#e8f0c0'); }
        if (v % 2) { b.px(7, 1, '#ff6a8a'); b.px(8, 1, '#ff9ab0'); }
        return X.outline(b.put());
      }
      case O.ICESPIKE: {
        const b = X.brush(16, 22);
        for (const [cx, top, w] of [[8, 1, 3], [4, 8, 2], [12, 7, 2]]) for (let y = top; y < 21; y++) { const hw = Math.min(w, (y - top) * 0.5); for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) b.px(x, y, x < cx ? '#e8f8ff' : '#8ac8f0'); }
        return X.outline(b.put(), '#2a4a6a');
      }
      case O.FENCEH: case O.FENCEV: {
        const b = X.brush(16, 16);
        if (id === O.FENCEH) { b.rect(0, 5, 16, 2, '#a8784a'); b.rect(0, 10, 16, 2, '#8a5e38'); b.rect(2, 3, 3, 11, '#7a5030'); b.rect(11, 3, 3, 11, '#7a5030'); b.px(3, 3, '#a8784a'); b.px(12, 3, '#a8784a'); }
        else { b.rect(6, 0, 4, 16, '#8a5e38'); b.rect(7, 0, 1, 16, '#a8784a'); }
        return X.outline(b.put());
      }
      case O.GRAVE: {
        const b = X.brush(14, 16);
        b.rect(2, 4, 10, 11, '#7a7a86'); b.ellipse(7, 4, 5, 3, '#8a8a96'); b.rect(3, 4, 2, 10, '#9a9aa6'); b.hline(5, 9, 7, '#5a5a66'); b.vline(7, 5, 10, '#5a5a66');
        return X.outline(b.put());
      }
      case O.CORAL: {
        const b = X.brush(16, 16);
        for (let i = 0; i < 4; i++) { const x = 3 + i * 3; for (let y = 4 + (i % 2) * 2; y < 15; y++) b.px(x + (y % 4 === 0 ? 1 : 0), y, i % 2 ? '#ff7a8a' : '#ff9a5a'); }
        return X.outline(b.put());
      }
      case O.LAMP: {
        const b = X.brush(12, 30);
        b.rect(5, 8, 2, 21, '#2a2a34'); b.rect(3, 27, 6, 2, '#2a2a34'); b.rect(3, 2, 6, 7, '#3a3a44'); b.rect(4, 3, 4, 5, '#ffe08a'); b.px(5, 4, '#ffffff');
        return X.outline(b.put());
      }
      case O.SIGNPOST: {
        const b = X.brush(16, 18);
        b.rect(7, 6, 2, 11, '#6a4424'); b.rect(1, 3, 14, 6, '#a8784a'); b.hline(2, 13, 3, '#c8a070'); b.hline(3, 11, 6, '#6a4424');
        return X.outline(b.put());
      }
      case O.WELL: {
        const b = X.brush(22, 26);
        b.rect(3, 14, 16, 10, '#8a8a96'); b.hline(3, 18, 14, '#aaaab6'); b.ellipse(11, 14, 8, 3, '#2a3a5a'); b.rect(3, 3, 2, 12, '#6a4424'); b.rect(17, 3, 2, 12, '#6a4424'); b.rect(2, 2, 18, 3, '#9a3a3a');
        for (let x = 4; x < 18; x += 4) b.vline(x, 16, 22, '#6a6a76');
        return X.outline(b.put());
      }
      case O.PILLAR: {
        const b = X.brush(16, 32);
        b.rect(3, 4, 10, 26, P.c[1]); b.rect(4, 4, 2, 26, P.c[2]); b.rect(11, 4, 2, 26, P.c[0]); b.rect(2, 2, 12, 3, P.c[2]); b.rect(2, 28, 12, 3, P.c[0]);
        return X.outline(b.put());
      }
      case O.RUBBLE: {
        const b = X.brush(18, 14);
        rockInto(b, 5, 8, 4, P, v); rockInto(b, 12, 9, 5, P, v + 1); rockInto(b, 9, 5, 3, P, v + 2);
        return X.outline(b.put());
      }
      default: return null;
    }
  }
  function rockInto(b, cx, cy, r, P, v) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy > r * r) continue; b.px(x, y, dx + dy < -r * 0.5 ? P.c[2] : dx + dy > r * 0.4 ? P.c[0] : P.c[1]); } }

  /** 사물 그림 (캔버스, 발 기준 좌표 ox·oy) */
  function sprite(id, reg, v) {
    v = v & 3;
    const key = id + ':' + reg + ':' + v;
    if (cache[key]) return cache[key];
    let c = null;
    switch (id) {
      case O.TREE: c = tree(reg, v); break;
      case O.BIGTREE: c = tree(reg, v + 7, 'big'); break;
      case O.BLOSSOM: c = tree(reg, v, 'blossom'); break;
      case O.DEAD: c = tree(reg, v, 'dead'); break;
      case O.PINE: c = pine(reg, v, false); break;
      case O.SNOWTREE: c = pine(reg, v, true); break;
      case O.PALM: c = palm(v); break;
      case O.SHROOM: c = shroom(v); break;
      case O.CRYSTAL: c = crystal(v); break;
      case O.BUSH: c = bush(reg, v); break;
      case O.ROCK: c = rock(reg, v, false); break;
      case O.BOULDER: c = rock(reg, v, true); break;
      default: c = simple(id, reg, v);
    }
    // 발 기준점: 칸 가운데 아래
    const out = { c, ox: Math.round(c ? c.width / 2 : 8), oy: c ? c.height - (DEF[id] && DEF[id].ground ? 16 : 3) : 0 };
    if (id === O.BUSH || id === O.ROCK || id === O.STUMP) out.oy = c.height - 2;
    return (cache[key] = out);
  }

  G.objs = { O, DEF, sprite };
})();
