/* 제6장 「천년제」 — 하늘섬 무지개 · 천년제 · 무지개 서커스 · 구름 투기장 · 도장 모으기 · 구름 신전 · 봉헌식
   구름고래를 타고 온 흰빛. 대륙의 모든 색이 모인 축제에서 지금까지 만난 사람들을 다시 만난다.
   크로마 위원장의 부탁(구름 신전의 불씨) → 광대 롤로의 비밀(무지개 기둥은 가장 큰 징수탑) →
   봉헌식 밤, 그라우스의 반란 → 모두가 보는 앞에서 흰빛이 깨어난다 → 카이론 → 세 사람이 손을 내민다(두 번째 길이 굳는다) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const RT = OW.towns.rainbow, X0 = RT.x, Y0 = RT.y;      // 150, 18
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const RX = (x) => OW.T('rainbow', x, 0)[0], RY = (y) => OW.T('rainbow', 0, y)[1];   // 옛 좌표 → 넓어진 대륙 (무지개 마을과 함께 옮김)
  const TEMPLE = { x: RX(145), y: RY(22) };                       // 구름 신전 (섬 북서쪽)
  const STAGE = { x0: RX(162), y0: RY(20), w: 12, h: 4 };         // 봉헌식 무대 (한 칸 높다)
  const festival = () => f('ch:c6') && !f('c6_done');
  ST.RAINBOW = { X0, Y0, TEMPLE, STAGE };

  ST.CH.push({ no: '제6장', id: 'c6', title: '천년제', sub: '천 년에 한 번, 대륙의 모든 색이 한곳에 모인다. 빛도, 그림자도.',
    goal(s) {
      if (!f('c6_chroma')) return { text: '천년제 위원회의 크로마 위원장을 만나자.', map: 'world', x: RX(179), y: RY(23) };
      if (!f('c6_rolo')) return { text: '축제를 둘러보자. 서커스 천막의 광대가 무언가 알고 있다.', map: 'world', x: RX(155), y: RY(23) };
      if (!f('d6:boss')) return { text: '섬 북서쪽 구름 신전에서 「무지개 불씨」를 가져오자.', map: 'world', x: TEMPLE.x + 2, y: TEMPLE.y + 2 };
      if (!f('c6_ember')) return { text: '불씨를 크로마 위원장에게 가져가자.', map: 'world', x: RX(179), y: RY(23) };
      if (!f('c6_finale')) return { text: '봉헌식이 시작된다. 준비되면 크로마 위원장에게.', map: 'world', x: RX(179), y: RY(23) };
      return { text: '북쪽 설산 화이트로. 힘 장갑으로 바위 고개를 연다.', map: 'world', x: OW.towns.white.x + 16, y: OW.towns.white.y + 12 };
    } });
  ST.closedMsg.white = '북쪽 설산 고개는 바위와 눈보라로 막혀 있어. 무거운 바위를 들 힘이 있으면 모를까… 찍.';

  /* ───────── 이야기용 물건 ───────── */
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('ember', { type: 'key', name: '무지개 불씨', desc: '구름 신전 둥지 속 일곱 빛깔 불씨. 손에 쥐어도 뜨겁지 않다. 대신 조금 배가 고프다.' });
  item('ac_rainbow', { type: 'acc', name: '무지개 깃털', fx: { roll: 0.25, special: 0.25 }, desc: '천년제 도장 일곱 개의 상. 구르기 기력 -25%, 필살 게이지 +25%.' });
  item('ac_laurel', { type: 'acc', name: '구름 투기장 월계관', fx: { crit: 0.08, stamina: 20 }, desc: '천년제 투기장 우승 기념. 치명타 +8%, 기력 +20.' });
  item('food_cotton', { type: 'use', name: '무지개 솜사탕', heal: 3, buff: { stamina: 1.5, t: 90 }, price: 30, desc: '하트 반 칸 반, 90초 동안 기력 회복이 빠르다. 혀가 일곱 색이 된다.' });
  G.data.SHOPS.rainbow = { name: '구름 잡화 노점', items: ['potion_r', 'potion_b', 'food_cotton', 'arrows10', 'bombs5', 'ac_roll'] };
  G.data.BOOKS.b_aurum = { name: '구름 신전의 벽화', short: '둥지 옆 벽에 새긴 그림', pages: ['첫째 칸: 하늘에서 검은 해가 내려온다. 사람들이 색을 잃고 쓰러진다.', '둘째 칸: 금빛 머리의 소년이 일곱 빛깔 불씨를 들고 구름 위에 선다. 온 세상 사람이 소년에게 손을 뻗는다.', '셋째 칸: 소년이 불씨를 삼킨다. 소년이 하얗게 빛난다. 검은 해가 물러간다.', '넷째 칸은 깎여 있다. 누군가 일부러 끌로 긁어냈다. 가장자리에 검은 점 하나만 남았다.'] };

  /* ───────── 축제 건물 그림 ───────── */
  const B = G.build, X = G.gfx, R = B.ramp, poly = B.poly, OUT = B.OUT;
  B.SPECIAL.bigtent = function (o) { // 줄무늬 서커스 천막
    const w = (o.w || 8) * TS, h = 76, b = X.brush(w, h);
    const A = R('#e8465a'), Wt = R('#fff4ec');
    for (let y = 10; y < h - 4; y++) {
      const k = (y - 10) / (h - 14);
      const hw = 6 + Math.pow(k, 0.7) * (w / 2 - 6);
      for (let x = Math.round(w / 2 - hw); x <= w / 2 + hw; x++) {
        const a = Math.atan2(y - 6, x - w / 2), band = Math.floor((a + Math.PI) * 5) % 2;
        const sh = x < w / 2 - hw * 0.55 ? 3 : x > w / 2 + hw * 0.5 ? 1 : 2;
        b.px(x, y, band ? A[sh] : Wt[sh]);
      }
    }
    for (let x = 0; x < w; x += 8) b.ellipse(x + 4, h - 6, 4.5, 3, Math.floor(x / 8) % 2 ? A[2] : '#ffd84a');
    b.rect(0, h - 5, w, 5, A[1]);
    poly(b, [[w / 2 - 12, h], [w / 2, h - 30], [w / 2 + 12, h]], '#1a0c18'); poly(b, [[w / 2 - 12, h], [w / 2 - 3, h - 26], [w / 2 - 6, h]], A[2]); poly(b, [[w / 2 + 12, h], [w / 2 + 3, h - 26], [w / 2 + 6, h]], A[2]);
    b.vline(w / 2, 0, 11, '#6a4424'); poly(b, [[w / 2 + 1, 0], [w / 2 + 11, 3], [w / 2 + 1, 6]], '#ffd84a');
    for (let i = 0; i < 6; i++) b.px(8 + i * (w - 16) / 5, h - 12, '#ffffff');
    return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS, door: true };
  };
  B.SPECIAL.arena = function (o) { // 둥근 투기장 (돌 원형 벽 + 깃발)
    const w = (o.w || 8) * TS, h = 60, b = X.brush(w, h);
    const C = R('#d8c8b0');
    b.ellipse(w / 2, h - 16, w / 2 - 1, 28, C[1]); b.ellipse(w / 2, h - 18, w / 2 - 3, 26, C[2]);
    for (let x = 4; x < w - 4; x += 10) { b.rect(x, h - 38 + Math.abs(x - w / 2) * 0.18, 6, 26, C[3]); b.vline(x + 5, h - 38 + Math.abs(x - w / 2) * 0.18, h - 13, C[1]); }
    b.rect(0, h - 14, w, 14, C[1]); b.hline(0, w - 1, h - 14, C[3]);
    b.rect(w / 2 - 10, h - 24, 20, 24, '#1a1020'); b.rect(w / 2 - 12, h - 27, 24, 4, C[4]);
    const fl = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#8a6aff', '#c87aff'];
    for (let i = 0; i < 7; i++) { const x = 8 + i * (w - 16) / 6, y = 6 + Math.abs(i - 3) * 3; b.vline(Math.round(x), y, y + 14, '#6a4424'); poly(b, [[x + 1, y], [x + 9, y + 3], [x + 1, y + 6]], fl[i]); }
    return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS, door: true };
  };
  B.SPECIAL.pillar = function (o) { // 무지개 기둥: 가장 큰 징수탑. 고리 일곱 개
    const w = 3 * TS, h = 156, b = X.brush(w, h);
    const C = R(o.broken ? '#8a8494' : '#e8e0f0');
    const rings = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#6a6aff', '#c87aff'];
    for (let y = 22; y < h; y++) { const hw = 7 + (y / h) * 12; for (let x = Math.round(w / 2 - hw); x <= w / 2 + hw; x++) b.px(x, y, x < w / 2 - hw * 0.4 ? C[3] : x > w / 2 + hw * 0.45 ? C[1] : C[2]); }
    if (!o.broken) for (let i = 0; i < 7; i++) { const y = 34 + i * 16, hw = 8 + (y / h) * 12; b.hline(Math.round(w / 2 - hw), Math.round(w / 2 + hw), y, rings[i]); b.hline(Math.round(w / 2 - hw), Math.round(w / 2 + hw), y + 1, R(rings[i])[1]); }
    else { b.line(w / 2 - 6, 40, w / 2 + 4, 70, '#2a2030'); b.line(w / 2 + 4, 70, w / 2 - 2, 104, '#2a2030'); poly(b, [[w / 2 - 12, 22], [w / 2 - 4, 14], [w / 2 + 2, 24], [w / 2 + 12, 18], [w / 2 + 10, 26], [w / 2 - 12, 26]], C[1]); }
    if (!o.broken) { b.ellipse(w / 2, 14, 11, 11, '#fff8e8'); b.ellipse(w / 2, 14, 7, 7, '#ffffff'); for (let a = 0; a < 7; a++) b.line(w / 2, 14, w / 2 + Math.cos(a * 0.9) * 18, 14 + Math.sin(a * 0.9) * 14, rings[a]); }
    b.rect(w / 2 - 6, h - 18, 12, 18, '#1a1020');
    return { c: X.outline(b.put(), OUT), W: w, H: h, footH: 2 * TS };
  };
  /* ───────── 축제 꾸미기: 깃발 줄 · 불꽃놀이 ───────── */
  class Bunting extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'deco', solid: false, bw: 1, bh: 1 }, o)); this.y = Math.max(o.ay, o.by) + 2; this.sortBias = 30; }
    update(dt) { this.t += dt; }
    draw(g, cx, cy) {
      const ax = this.ax - cx, ay = this.ay - cy - 30, bx = this.bx - cx, by = this.by - cy - 30;
      const n = Math.max(4, Math.floor(Math.hypot(bx - ax, by - ay) / 9));
      const cols = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#8a6aff', '#c87aff'];
      g.strokeStyle = '#6a4a3a'; g.lineWidth = 1; g.beginPath();
      for (let i = 0; i <= n; i++) { const k = i / n, x = ax + (bx - ax) * k, y = ay + (by - ay) * k + Math.sin(k * Math.PI) * 10; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
      for (let i = 1; i < n; i++) {
        const k = i / n, x = Math.round(ax + (bx - ax) * k), y = Math.round(ay + (by - ay) * k + Math.sin(k * Math.PI) * 10);
        const sway = Math.round(Math.sin(this.t * 3 + i) * 1.2);
        g.fillStyle = cols[(i + this.seed) % 7]; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.lineTo(x + sway, y + 6); g.closePath(); g.fill();
      }
    }
  }
  class Fireworks extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'deco', solid: false, bw: 1, bh: 1 }, o)); this.cool = 0.5; this.sortBias = 200; }
    update(dt) {
      this.t += dt;
      const night = G.story.nightFactor() > 0.5 || this.always;
      if (!night) return;
      this.cool -= dt * (this.rate || 1);
      if (this.cool <= 0) { this.cool = 0.7 + Math.random() * 1.4; ST.burst(this.x + (Math.random() - 0.5) * (this.spread || 200), this.y - 90 - Math.random() * 60); }
    }
    draw() {}
  }
  /** 불꽃 한 송이: 솟는 불똥 → 터지며 원으로 퍼지는 빛 */
  ST.burst = function (x, y, col) {
    const cols = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#8a6aff', '#c87aff', '#ffffff'];
    const c0 = col || U.pick(cols), c1 = U.pick(cols);
    const n = 26;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, sp = 60 + Math.random() * 30; G.fx.part({ x, y, z: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8, vz: 0, g: 0, drag: 2.2, life: 0.9 + Math.random() * 0.4, col: i % 3 ? c0 : c1, size: 1.5, glow: true }); }
    G.fx.ring(x, y, c0, 26, 0.5, 1);
    if (G.light) G.light.flare(x, y, 120, 0.8, c0);
    if (G.audio && U.dist(x, y, G.world.player.x, G.world.player.y) < 400) G.audio.sfx('firework');
  };

  /* ───────── 넓은 지도 ───────── */
  /** 칸 사각형을 한 단 높인다 (남쪽에 면, 가운데 계단) */
  function raise(m, x0, y0, w, h, ter, stairX) {
    const base = m.hgt[m.i(x0, y0 + h)];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const i = m.i(x, y); m.hgt[i] = base + 1; m.ter[i] = ter; m.obj[i] = 0; m.solidExtra[i] = 0; }
    for (let x = x0; x < x0 + w; x++) { const i = m.i(x, y0 + h); m.ter[i] = T.CLIFF; m.hgt[i] = base; m.obj[i] = 0; }
    for (const sx of stairX) { const i = m.i(sx, y0 + h); m.ter[i] = T.STAIRS; }
  }
  OW.hooks.push((m) => {
    const road = RT.road || T.TILE;
    // 봉헌식 무대 + 무지개 기둥
    OW.clear(m, STAGE.x0 - 1, RY(17), STAGE.w + 2, 9, m.hgt[m.i(STAGE.x0, RY(26))], road);
    raise(m, STAGE.x0, STAGE.y0, STAGE.w, STAGE.h, T.WOOD, [RX(167), RX(168)]);
    G.build.placeBuilding(m, { special: 'pillar', tx: RX(166), ty: RY(18), w: 3, h: 2, door: false });
    // 건물
    ST.house(m, { id: 'r_circus', region: 'rainbow', special: 'bigtent', tx: X0 + 1, ty: Y0 + 1, w: 8, h: 4, name: '무지개 서커스',
      room: { w: 20, h: 13, floor: T.RUG, music: 'rainbow', rug: [5, 4, 10, 6], furn: [['bench', 3, 10], ['bench', 7, 10], ['bench', 12, 10], ['bench', 16, 10], ['barrel', 1, 3], ['crate', 18, 3], ['lamp', 4, 3], ['lamp', 15, 3], ['painting', 9, 1, { wall: true, v: '#e8465a', text: '서커스 포스터. 「광대 롤로의 무지개 곡예! 색이 없는 광대가 색을 보여 드립니다」' }]] } });
    ST.house(m, { id: 'r_hall', region: 'rainbow', style: 'rainbow', tx: X0 + 26, ty: Y0 + 1, w: 7, h: 4, name: '천년제 위원회', sign: 'bar',
      room: { w: 16, h: 11, floor: T.CARPET, music: 'rainbow', rug: [5, 4, 6, 4], furn: [['desk', 7, 3, { text: '크로마 위원장의 책상. 봉헌식 순서표. 맨 아래 줄: 「흰빛의 손님 — 불씨 점화」.' }], ['shelf', 1, 2], ['shelf', 14, 2], ['table', 3, 7], ['chair', 2, 8], ['chair', 5, 8], ['plant', 1, 9], ['plant', 14, 9], ['painting', 11, 1, { wall: true, v: '#ffb84a', text: '천 년 전 아우룸의 초상. 금빛 머리 소년이 불씨를 들고 있다. 소년의 눈이 이상하게 슬프다.' }]] } });
    ST.house(m, { id: 'rb_inn', region: 'rainbow', style: 'rainbow', tx: X0 + 2, ty: Y0 + 16, w: 6, h: 4, name: '구름 베개 여관', sign: 'inn',
      room: { w: 14, h: 10, floor: T.WOOD, music: 'calm', rug: [4, 5, 6, 3], furn: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', 8, 5], ['chair', 7, 6], ['chair', 10, 6], ['bed2', 12, 3, { v: '#ff8ab0' }], ['bed2', 12, 6, { v: '#8ab8ff' }], ['plant', 1, 8]] } });
    ST.house(m, { id: 'r_shop', region: 'rainbow', style: 'rainbow', tx: X0 + 10, ty: Y0 + 17, w: 5, h: 4, name: '구름 잡화', sign: 'shop',
      room: { w: 12, h: 9, floor: T.WOOD, music: 'rainbow', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2], ['shelf', 10, 2], ['crate', 2, 6], ['barrel', 9, 6]] } });
    ST.house(m, { id: 'r_arena', region: 'rainbow', special: 'arena', tx: X0 + 25, ty: Y0 + 16, w: 8, h: 4, name: '구름 투기장',
      room: { w: 20, h: 14, floor: T.SAND, music: 'rainbow', furn: [['bench', 2, 3], ['bench', 6, 3], ['bench', 13, 3], ['bench', 17, 3], ['barrel', 1, 11], ['crate', 18, 11]] } });
    // 도장 노점 일곱 (빨주노초파남보)
    for (const bo of BOOTHS) { OW.clear(m, bo.tx, bo.ty, 3, 1, m.hgt[m.i(bo.tx, bo.ty + 1)], null); G.build.placeBuilding(m, { special: 'stall', tx: bo.tx, ty: bo.ty, w: 3, h: 1, col: bo.col, door: false }); }
    // 구름 신전
    OW.clear(m, TEMPLE.x - 2, TEMPLE.y - 3, 10, 8, m.hgt[m.i(TEMPLE.x + 2, TEMPLE.y + 2)], T.CLOUD);
    G.build.placeBuilding(m, { special: 'temple', tx: TEMPLE.x, ty: TEMPLE.y, w: 5, h: 1, col: '#e8eef8', glyph: '#8ab8ff', to: 'd6', id: 'd6_gate', cond: () => f('c6_chroma'), msg: '신전 문에 무지개 무늬 자물쇠. 천년제 위원회의 허락이 있어야 열린다.' });
    for (let x = TEMPLE.x + 2; x <= RX(150); x++) for (const y of [TEMPLE.y + 1, TEMPLE.y + 2]) { const i = m.i(x, y); if (m.ter[i] !== T.CLIFF && m.ter[i] !== T.STAIRS) { m.ter[i] = x < TEMPLE.x + 5 ? T.CLOUD : road; m.obj[i] = 0; } }
    for (let y = TEMPLE.y + 1; y <= RY(30); y++) for (const x of [RX(150), RX(151)]) { const i = m.i(x, y); if (m.ter[i] !== T.CLIFF && m.ter[i] !== T.STAIRS) { m.ter[i] = road; m.obj[i] = 0; } }
    // 꾸미기: 가로등 · 벚꽃
    for (const [x, y] of [[161, 26], [174, 26], [161, 34], [174, 34], [155, 29], [180, 29], [155, 33], [180, 33]].map(([a, b]) => [RX(a), RY(b)])) { m.obj[m.i(x, y)] = O.LAMP; m.lights.push({ x: x * TS + 8, y: y * TS + 2, r: 56, warm: 'rgba(255,200,230,0.22)' }); }
    for (const [x, y] of [[X0, Y0 + 12], [X0 + 33, Y0 + 12], [X0 + 1, Y0 + 23], [X0 + 32, Y0 + 23], [X0 + 16, Y0 + 23]]) if (m.inb(x, y) && !m.solidExtra[m.i(x, y)]) m.obj[m.i(x, y)] = O.BLOSSOM;
    // 설산으로 가는 길목의 바위 (힘 장갑)
    const W = m.w, H = m.h, reg = OW.regName;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (!OW.roadTiles[i] || reg[i] !== 'white') continue;
      for (const j of [i - 1, i + 1, i - W, i + W]) if (OW.roadTiles[j] && reg[j] !== 'white' && m.ter[j] !== T.STAIRS && m.ter[j] !== T.BRIDGE && m.ter[j] !== T.CLIFF) m.obj[j] = O.ROCK;
    }
  });
  const BOOTHS = [
    { id: 'red', name: '빨강', col: '#e84a4a', tx: RX(151), ty: RY(27), who: 'volkan' },
    { id: 'orange', name: '주황', col: '#ff9a3a', tx: RX(156), ty: RY(27), who: 'goldy' },
    { id: 'yellow', name: '노랑', col: '#f0d040', tx: RX(175), ty: RY(27), who: 'yana' },
    { id: 'green', name: '초록', col: '#4ac860', tx: RX(180), ty: RY(27), who: 'marien' },
    { id: 'blue', name: '파랑', col: '#4a8ae8', tx: RX(151), ty: RY(33), who: 'hemia' },
    { id: 'indigo', name: '남색', col: '#5a4ad8', tx: RX(156), ty: RY(33), who: 'lyra' },
    { id: 'violet', name: '보라', col: '#b86ae8', tx: RX(175), ty: RY(33), who: 'viola' },
  ];
  const stamps = () => BOOTHS.filter((b) => f('stamp:' + b.id)).length;
  async function stamp(c, bo) {
    if (f('stamp:' + bo.id)) return;
    c.flag('stamp:' + bo.id); c.sfx('clickspot'); c.jingle('item');
    await c.say(null, '[y]' + bo.name + ' 도장[/]을 받았다! (' + stamps() + '/7)', { style: 'sys' });
    if (stamps() === 7) await c.say('toria', '찍! 일곱 개 다 모았어! 위원회에 가져가자!', { face: 'happy' });
  }

  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(RT.plaza.x + 3), y: py(RT.plaza.y + 3), wid: 'w_rainbow', name: '하늘섬 무지개' }));
    Wd.add(new P.Waystone({ x: px(TEMPLE.x + 7), y: py(TEMPLE.y + 3), wid: 'w_temple', name: '구름 신전' }));
    Wd.add(new P.Sign({ x: px(RX(165)), y: py(RY(26)), text: '천년제 — 제1000회\n「천 년 전 오늘, 흰빛이 전쟁을 끝냈다」\n봉헌식: 축제 마지막 밤, 무지개 기둥 앞' }));
    Wd.add(new P.Sign({ x: px(TEMPLE.x + 6), y: py(TEMPLE.y + 2), text: '구름 신전\n「바람을 거스르지 마라. 바람에 실려라.」' }));
    // 노점 팻말: 노점 앞이 막혔으면(투기장 담 · 집) 위나 옆 빈칸에
    const signAt = (bo) => [[bo.tx + 1, bo.ty + 1, 2], [bo.tx + 1, bo.ty - 1, 0], [bo.tx - 1, bo.ty, 0], [bo.tx + 3, bo.ty + 1, 2]].find(([x, y]) => m.inb(x, y) && !m.blocked(x, y)) || [bo.tx + 1, bo.ty + 1, 2];
    for (const bo of BOOTHS) Wd.add(new P.Sign({ x: px(signAt(bo)[0]), y: py(signAt(bo)[1]) + signAt(bo)[2], text: bo.name + ' 노점 — 천년제 도장 모으기\n「일곱 빛깔 도장을 모두 모으면 위원회에서 상을 드립니다」' }));
    if (!f('c6_done')) {
      const cols = [[155, 29, 161, 26], [161, 26, 174, 26], [174, 26, 180, 29], [155, 33, 161, 34], [161, 34, 174, 34], [174, 34, 180, 33]].map(([a, b2, c2, d]) => [RX(a), RY(b2), RX(c2), RY(d)]);
      cols.forEach(([a, b2, c2, d], i) => Wd.add(new Bunting({ ax: px(a), ay: py(b2), bx: px(c2), by: py(d), x: px((a + c2) / 2), seed: i })));
      if (festival()) Wd.add(new Fireworks({ x: px(RX(167)), y: py(RY(30)), spread: 260 }));
    }
  });

  /* ───────── 제6장 시작: 구름고래가 내려앉는다 ───────── */
  ST.onTick.push(() => {
    if (!f('c5_done') || f('ch:c6')) return;
    const Wd = G.world, m = Wd.map; if (!m || !m.overworld || G.script.running) return;
    const p = Wd.player; if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'rainbow') return;
    S().flags['ch:c6'] = true;
    G.script.run(async (c) => {
      c.lock(true);
      await ST.setChapter(c, 'c6');
      c.music('rainbow');
      for (let i = 0; i < 4; i++) { ST.burst(p.x + (Math.random() - 0.5) * 200, p.y - 100 - Math.random() * 40); await c.wait(0.35); }
      await c.say('toria', '찍——! 불꽃! 낮인데 불꽃! 저기 봐, 솜사탕이 일곱 색이야!', { face: 'happy' });
      await c.say('toria', '레드 사람, 블루 사람, 옐로 사람… 대륙이 다 여기 있어. 아는 얼굴도 있을 것 같아.', { face: 'happy' });
      const nb = c.spawn({ cid: 'nube', x: p.x + 30, y: p.y + 10, dir: 'left' });
      await c.say('nube', '우우웅. 천년제 위원회는 광장 동쪽 끝이오. 크로마 위원장이 기다리오. 우웅. 나는 여기서 잠깐 떠 있겠소.', { face: 'normal' });
      nb.dead = true;
      c.lock(false);
      c.journal('구름고래를 타고 하늘섬 무지개에 내렸다. 제1000회 천년제. 대륙의 모든 색이 모였다.');
    });
  });

  /* ───────── 사람들이 축제에 왔다: 집을 잠깐 비운다 ───────── */
  const GUESTS = ['volkan', 'goldy', 'marien', 'berna', 'karel', 'hemia', 'yana', 'lyra', 'viola', 'cassian', 'lea', 'rud', 'pika', 'luce'];
  for (const [mid, list] of Object.entries(ST.people)) {
    if (/^r_/.test(mid)) continue;
    for (const sp of list) if (sp.id && GUESTS.includes(sp.id)) { const old = sp.when; sp.when = (s) => !(s.flags['ch:c6'] && !s.flags.c6_done) && (old ? old(s) : true); }
  }

  /* ───────── 크로마 위원장 ───────── */
  ST.person('r_hall', { id: 'chroma', x: 7, y: 4, dir: 'down', when: () => !f('c6_finale') || f('c6_done'), mark: () => (!f('c6_chroma') || (f('d6:boss') && !f('c6_ember')) || (f('c6_ember') && !f('c6_finale')) || (stamps() === 7 && !f('c6_stamps')) ? '!' : null), talk: async (c, n) => {
    c.flag('met:chroma');
    if (!f('c6_chroma')) { await chromaFirst(c, n); return; }
    if (stamps() === 7 && !f('c6_stamps')) {
      await c.say(n, '어머나, 일곱 빛깔을 다! 천 년 동안 이걸 다 모은 사람은 손에 꼽아요.', { face: 'happy' });
      c.flag('c6_stamps'); await c.getItem('ac_rainbow'); await c.getItem('heartpiece');
      await c.say(n, '…축제는 좋은 거예요. 그렇죠? 모두가 웃잖아요. 적어도 오늘 밤까지는.', { face: 'sad' });
      return;
    }
    if (f('d6:boss') && !f('c6_ember')) { await chromaEmber(c, n); return; }
    if (f('c6_ember') && !f('c6_finale')) {
      const ok = await c.confirm('봉헌식을 시작할까요? 한번 시작하면 끝날 때까지 되돌릴 수 없어요.', '시작한다', '조금 더 둘러본다');
      if (ok) await finale(c);
      return;
    }
    if (f('c6_done')) { await c.say(n, ST.lines({ c6: '기둥이 무너지고 나서야 알았어요. 나는 천 년 동안 불씨를 지키는 줄 알았는데, 사실은 불쏘시개를 모으고 있었다는 걸.', c8: '롤로가 새 공연을 만들었대요. 제목이 「색은 나눌수록」. 보러 와요.' }), { face: 'sad' }); return; }
    await c.say(n, '구름 신전은 섬 북서쪽이에요. 신전 문은 이미 열어 두었어요. 폭풍새를 조심해요.', { face: 'normal' });
  } });
  async function chromaFirst(c, n) {
    c.lock(true);
    await c.cinema(true);
    await c.say(n, '어서 와요, 흰빛의 손님! 나는 크로마. 천년제 준비 위원장이에요. 사십 년째 이 일을 하고 있지요.', { face: 'happy' });
    await c.say(n, '천 년 전 오늘, 초대 챔피언 아우룸께서 흰빛으로 색 전쟁을 끝내셨어요. 천년제는 그날을 기리는 축제예요.', { face: 'normal' });
    await c.say(n, '축제 마지막 밤에는 [y]봉헌식[/]을 해요. 모두가 광장 무지개 기둥 앞에 모여서, 한 해 동안 얻은 빛을 조금씩 바치지요. 흑점을 막는 방패가 되도록.', { face: 'normal' });
    await c.say('toria', '찍… 바친다고요? 탑에서 빨아 가는 거랑 뭐가 달라요?', { face: 'think' });
    await c.say(n, '…스스로 바치는 거랑 빼앗기는 건 다르잖아요. 그렇게 믿고 사십 년을 살았어요.', { face: 'sad' });
    await c.say(n, '부탁이 하나 있어요. 봉헌식의 첫 불은 늘 「가장 밝은 손님」이 붙여요. 천 년 전 아우룸처럼. 올해는 당신이에요.', { face: 'normal' });
    await c.say(n, '섬 북서쪽 [y]구름 신전[/] 꼭대기, 폭풍새의 둥지에 [y]무지개 불씨[/]가 있어요. 그걸 가져와 줘요. 신전 문은 열어 둘게요.', { face: 'normal' });
    await c.say(n, '서두를 건 없어요. 축제를 즐겨요! 노점마다 도장을 찍어 주니 일곱 개 다 모아 오면 상도 있어요.', { face: 'happy' });
    c.flag('c6_chroma');
    await c.cinema(false);
    c.lock(false);
    c.journal('천년제 위원장 크로마에게 부탁을 받았다. 구름 신전의 「무지개 불씨」로 봉헌식의 첫 불을 붙여 달라고.');
  }
  async function chromaEmber(c, n) {
    c.lock(true);
    await c.say(n, '불씨…! 정말로 가져왔군요. 천 년 동안 폭풍새가 지키던 걸.', { face: 'shock' });
    c.flag('c6_ember');
    if (f('c6_rolo')) {
      await c.say('toria', '위원장님. 롤로 아저씨가 그랬어요. 무지개 기둥은… 탑이라고. 제일 큰 징수탑이라고.', { face: 'sad' });
      await c.say(n, '…롤로가.', { face: 'sad' });
      await c.say(n, '기둥이 빛을 모으는 건 맞아요. 하지만 한 사람한테서 조금씩이에요. 백 명이 조금씩 내면, 한 명도 쓰러지지 않아요. 그게 원리예요. 카이론 님이 짜신 거예요.', { face: 'normal' });
      await c.say(n, '작년 예행연습 때… 롤로는 쓰러졌지요. 아무도 예상 못 한 일이었어요. 나는 그 뒤로 그 숫자들을 한 번도 다시 들여다보지 않았어요.', { face: 'sad' });
    }
    await c.say(n, '봉헌식은 오늘 밤이에요. 준비되면 다시 말을 걸어요. 불씨를 기둥에 넣을지 말지는… 그때 당신이 정해요.', { face: 'closed' });
    c.lock(false);
  }

  /* ───────── 광대 롤로 · 무지개 서커스 ───────── */
  ST.person('r_circus', { id: 'rolo', x: 9, y: 4, dir: 'down', when: () => !f('c6_finale') || f('c6_done'), mark: () => (f('c6_chroma') && !f('c6_rolo') ? '!' : null), talk: async (c, n) => {
    c.flag('met:rolo');
    // 이야기가 먼저: 크로마를 만난 뒤라면 곡예보다 분장 뒤 이야기부터 (풍선 사냥은 언제든 다시)
    if (!f('c6_rolo') && f('c6_chroma')) { await roloSecret(c, n); return; }
    if (!f('c6_rolo_show')) {
      await c.say(n, '어서 오세요, 어서 오세요! 색이 없는 광대, 롤로의 무지개 곡예! 오늘의 손님은… 오, 흰빛이시군!', { face: 'happy' });
      await c.say(n, '오늘의 순서는 [y]풍선 사냥[/]! 천막 안에 풍선 여덟 개가 춤을 춰요. 스무 초 안에 여섯 개를 활로 터뜨리면 박수 갈채!', { face: 'happy' });
      if (!(await c.confirm('풍선 사냥에 도전할까?', '도전한다', '나중에'))) return;
      const won = await balloonGame(c, n);
      if (!won) { await c.say(n, '아쉽다, 아쉬워! 광대는 몇 번이고 다시 해요. 넘어지는 게 일이니까.', { face: 'smile' }); return; }
      c.flag('c6_rolo_show');
      await c.say(n, '브라보! 브라보! …이런 박수, 오랜만이네.', { face: 'happy' });
      await c.getItem('heartpiece');
    }
    await c.say(n, ST.lines({ c6: f('c6_rolo') ? '불씨를 넣을지 말지는 당신 몫이에요. 광대는 웃기만 해요. 울어야 할 때도.' : '크로마 위원장님은 좋은 분이에요. 좋은 사람도 나쁜 결정을 해요.', c7: '거울을 봤어요. 얼굴에 색이 있어요. 칠하지 않은 색이. 아침마다 봐요. 매일 봐요.' }), { face: 'smile' });
  } });
  class Balloon extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'balloon', solid: false, bw: 1, bh: 1 }, o)); this.bx = this.x; this.by = this.y; this.ph = Math.random() * 6; }
    update(dt) { this.t += dt; this.x = this.bx + Math.sin(this.t * this.sp + this.ph) * this.ax; this.y = this.by + Math.cos(this.t * this.sp * 0.7 + this.ph) * this.ay; }
    shotHit(shot) { if (this.popped) return false; if (this.need && !(shot.src === 'spell' || shot.kind === 'fire' || shot.kind === 'ice')) return false; this.popped = true; this.dead = true; G.fx.shards(this.x, this.y - 18, 10, this.col); G.fx.ring(this.x, this.y - 18, '#ffffff', 10, 0.3); if (G.audio) G.audio.sfx('pop'); if (this.onPop) this.onPop(); return true; }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy), 4, 1.5, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 18);
      if (this.lantern) { g.fillStyle = '#3a2438'; g.fillRect(x - 4, y - 6, 8, 12); g.fillStyle = this.col; g.fillRect(x - 3, y - 5, 6, 10); g.fillStyle = '#fff4c8'; g.fillRect(x - 1, y - 3, 2, 5); return; }
      g.strokeStyle = '#6a5a6a'; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + Math.sin(this.t * 3) * 2, y + 16); g.stroke();
      g.fillStyle = '#1a1224'; g.beginPath(); g.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = this.col; g.beginPath(); g.ellipse(x, y, 5, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x - 3, y - 4, 2, 2);
      g.fillStyle = this.col; g.fillRect(x - 1, y + 6, 2, 1);
    }
  }
  ST.Balloon = Balloon;
  /** 과녁 놀이: n개를 떠다니게 하고 sec 안에 need개를 맞히면 이긴다 */
  async function targetGame(c, o) {
    const Wd = G.world, cols = ['#ff5a5a', '#ffb84a', '#ffe85a', '#6ae07a', '#5ab8ff', '#8a6aff', '#c87aff', '#ff8ab0'];
    let hit = 0; const bs = [];
    for (let i = 0; i < o.n; i++) {
      const b = Wd.add(new Balloon({ x: o.x0 + (i % 4) * o.dx, y: o.y0 + Math.floor(i / 4) * o.dy, col: o.lantern ? '#ffb84a' : cols[i % 8], sp: 0.8 + Math.random() * 1.2, ax: 14 + Math.random() * 20, ay: 6 + Math.random() * 10, need: o.spellOnly, lantern: o.lantern }));
      b.onPop = () => { hit++; G.ui.toast(hit + ' / ' + o.need, 'good'); };
      bs.push(b);
    }
    c.banner(o.title, o.sub, 1.6);
    let t = 0;
    await c.freeWhile(() => { t += 1 / 60; return hit >= o.need || t > o.sec; });
    for (const b of bs) b.dead = true;
    return hit >= o.need;
  }
  async function balloonGame(c) {
    const r = G.world.map;
    return targetGame(c, { n: 8, need: 6, sec: 20, x0: 4 * TS, y0: 5 * TS, dx: 4 * TS, dy: 3 * TS, title: '풍선 사냥', sub: '20초 · 여섯 개 · 활로!' + (r ? '' : '') });
  }
  async function roloSecret(c, n) {
    c.lock(true);
    await c.cinema(true);
    c.music('sad');
    await c.say(n, '…흰빛. 잠깐 천막 뒤로 와요. 분장 지우는 거 보여 줄게요.', { face: 'normal' });
    await c.narr('롤로가 젖은 수건으로 얼굴을 닦았다. 빨강, 노랑, 파랑이 지워지고 — 그 아래는 회색이었다.\n잿빛도 아니고 은빛도 아닌, 비 온 뒤 보도블록 같은 회색.');
    await c.say(n, '작년 봉헌식 예행연습. 기둥 앞에 제일 가까이 서 있었어요. 광대니까, 제일 앞에서 웃어야 하니까.', { face: 'sad' });
    await c.say(n, '기둥이 빛을 빨아들였어요. 사람들한테서 조금씩. …나한테서는 조금이 아니었어요. 어른들 예상이 틀렸대요. 기둥 옆자리는 원래 비워 둬야 했대요.', { face: 'sad' });
    await c.say(n, '무지개 기둥은 장식이 아니에요. [r]대륙에서 제일 큰 징수탑[/]이에요. 봉헌식 날 밤에만 제대로 켜지는.', { face: 'angry' });
    await c.say('toria', '찍… 그럼 불씨를 넣으면…', { face: 'shock' });
    await c.say(n, '기둥이 깨어나요. 천 년 치 불씨로. 그날 밤 광장에 선 모두한테서 빛을 모아서 — 어디론가 보내요. 천년성으로.', { face: 'sad' });
    await c.say(n, '광대가 이런 말 하면 아무도 안 믿어요. 그래서 당신한테 해요. 당신은 흰빛이니까. 모두가 당신을 보니까.', { face: 'normal' });
    const k = await c.choice('롤로에게 뭐라고 할까?', [
      { t: '「불씨를 기둥에 넣지 않을게요.」', tag: 'dawn', sub: '약속한다.' },
      { t: '「위원장님께 먼저 여쭤볼게요.」', tag: 'order', sub: '정해진 길로 확인한다.' },
      { t: '「기둥이 빛을 어디로 보내는지 알아볼게요.」', tag: 'night', sub: '끝까지 따라가 본다.' },
    ]);
    c.route(['dawn', 'order', 'night'][k], 1);
    await c.say(n, ['…고마워요. 광대는 약속을 믿어요. 무대 위에선 다 거짓말이라서.', '크로마 님은 좋은 분이에요. 좋은 사람한테 물어보는 건 좋은 일이에요. 대답이 좋을지는 몰라도.', '천년성까지 가려면 오래 걸릴 텐데. …가는 길에 광대 얘기도 해 줘요.'][k], { face: 'smile' });
    c.flag('c6_rolo');
    c.music('rainbow');
    await c.cinema(false);
    c.lock(false);
    c.journal('광대 롤로가 분장을 지웠다. 얼굴이 회색이었다. 무지개 기둥은 대륙에서 가장 큰 징수탑이라고 했다.');
  }

  /* ───────── 도장 노점 일곱 ───────── */
  const boothAt = (id) => BOOTHS.find((b) => b.id === id);
  const bp = (id) => { const b = boothAt(id); return { x: b.tx + 3, y: b.ty }; };
  // 빨강: 볼칸의 「망치 한 방」 (눈금 맞추기)
  ST.person('world', { id: 'volkan', x: bp('red').x, y: bp('red').y, dir: 'left', when: festival, mark: () => (!f('stamp:red') ? '♪' : null), talk: async (c, n) => {
    await c.say(n, f('stamp:red') ? '또 왔냐. 망치질은 하루에 천 번이다. 모자라.' : ST.lines({ c6: '오, 녀석! 에벨린 누님 손주! 망치 한 방 해 봐라. 종을 울리면 빨강 도장이다.' }), { face: 'happy' });
    if (f('stamp:red')) return;
    if (!(await c.confirm('망치 한 방 (10골드). 흔들리는 눈금이 가운데 올 때 공격 버튼!', '한다', '안 한다'))) return;
    if (S().gold < 10) { await c.say(n, '돈이 없으면 망치도 없다. 공짜는… 이건 골디 대사지.', { face: 'smirk' }); return; }
    c.gold(-10);
    const q = await ST.gauge(c, { speed: 1.6, sweet: 0.12 });
    if (q >= 0.8) { c.sfx('bell'); c.shake(2, 0.3); ST.burst(n.x, n.y - 80, '#ff5a5a'); await c.say(n, '땡——! 하하, 종이 울렸다! 세린도 한 번에 울렸지. 아니, 걔는 마법으로 울렸던가.', { face: 'happy' }); await stamp(c, boothAt('red')); }
    else await c.say(n, q > 0.4 ? '아깝다! 반만 올라갔다. 손목에 힘 빼라.' : '헛방이다! 망치가 운다, 운다.', { face: 'angry' });
  } });
  // 주황: 골디의 「행운의 수레바퀴」
  ST.person('world', { id: 'goldy', x: bp('orange').x, y: bp('orange').y, dir: 'left', when: festival, mark: () => (!f('stamp:orange') ? '♪' : null), talk: async (c, n) => {
    const k = await c.choice(f('stamp:orange') ? '또 돌리나? 공짜는 없어.' : '흰빛 아닌가. 축제에 금화왕이 없으면 되나. 수레바퀴 한 번 100골드. 돌리면 주황 도장.', ['돌린다 (100골드)', '그만둔다'], { who: 'goldy', name: '금화왕 골디' });
    if (k !== 0) return;
    if (S().gold < 100) { await c.say(n, '빈 지갑으론 행운도 안 온다.', { face: 'smirk' }); return; }
    c.gold(-100); c.sfx('spin');
    await c.wait(1.2);
    const r = Math.random();
    if (r < 0.05) { c.gold(1000); ST.burst(n.x, n.y - 80, '#ffd84a'); await c.say(n, '…대박이군. 천 골드. 공짜는 없다고 했지만, 운은 공짜다. 가끔은.', { face: 'shock' }); }
    else if (r < 0.3) { await c.getItem('potion_g'); await c.say(n, '초록 영약. 원가는 비밀이다.', { face: 'smirk' }); }
    else if (r < 0.6) { await c.getItem('arrows10'); await c.say(n, '화살 열 개. 본전은 못 찾았군.', { face: 'smile' }); }
    else await c.say(n, '꽝. 꽝도 인생이다. 금화왕이 꽝이 제일 많다는 거 알아? 그래서 금화왕이지.', { face: 'smirk' });
    await stamp(c, boothAt('orange'));
  } });
  // 노랑: 야나의 「별자리 퀴즈」
  ST.person('world', { id: 'yana', x: bp('yellow').x, y: bp('yellow').y, dir: 'left', when: festival, mark: () => (!f('stamp:yellow') ? '♪' : null), talk: async (c, n) => {
    if (f('stamp:yellow')) { await c.say(n, '모래바다 별은 여기서도 보여. 저기, 맨 동쪽. 저게 우리 엄마 별이야.', { face: 'smile' }); return; }
    await c.say(n, '어, 흰빛! 사막 밖에서 보니까 이상하다. 나 별자리 퀴즈 노점 해. 세 문제 다 맞히면 노랑 도장!', { face: 'happy' });
    if (!(await c.confirm('퀴즈를 풀까?', '푼다', '나중에'))) return;
    const Q = [
      ['첫 번째! 블루 대도서관 옥타비오 관장님의 다리는 몇 개?', ['여섯', '여덟', '열'], 1],
      ['두 번째! 금화왕 골디의 입버릇은?', ['「돈이 최고야」', '「공짜는 없어」', '「계산은 끝났다」'], 1],
      ['세 번째! 토리아의 레벨은 몇?', ['9', '19', '99'], 0],
    ];
    for (const [q, opts, ans] of Q) { const k = await c.choice(q, opts, { who: 'yana', name: '야나' }); if (k !== ans) { await c.say(n, '땡! 모래바다에선 틀리면 길을 잃어. 다시 와!', { face: 'smirk' }); return; } c.sfx('clickspot'); }
    await c.say('toria', '찍! 세 번째 문제는 반칙이야! …맞혀 줘서 고마워.', { face: 'blush' });
    await c.say(n, '다 맞혔어! 역시 길잡이가 데려간 손님이야.', { face: 'happy' });
    await stamp(c, boothAt('yellow'));
  } });
  // 초록: 마리엔 아줌마 — 길 잃은 베르나와 카렐
  ST.person('world', { id: 'marien', x: bp('green').x, y: bp('green').y, dir: 'left', when: festival, mark: () => (!f('stamp:green') ? '♪' : null), talk: async (c, n) => {
    if (f('stamp:green')) { await c.say(n, '초록 꼬치 하나 더 먹을래? 그린 감자로 만든 거야. 브람네 감자. 올해 알이 굵어.', { face: 'happy' }); return; }
    if (f('c6_kids')) { await c.say(n, '애들 찾았어?! 투기장에?! 아이고 이 녀석들… 고마워! 초록 도장이다, 두 개 찍어 주고 싶네!', { face: 'happy' }); await stamp(c, boothAt('green')); return; }
    await c.say(n, '어머, 우리 마을 영웅! …영웅 맞지? 그린에선 다들 그렇게 불러.', { face: 'happy' });
    await c.say(n, '큰일이야. 베르나랑 카렐을 데리고 왔는데 한눈판 사이에 없어졌어. 둘 다 검 얘기만 하던데…', { face: 'sad' });
    c.flag('c6_kids_q');
  } });
  // 파랑: 헤미아의 수수께끼
  ST.person('world', { id: 'hemia', x: bp('blue').x, y: bp('blue').y, dir: 'left', when: festival, mark: () => (!f('stamp:blue') ? '♪' : null), talk: async (c, n) => {
    if (f('stamp:blue')) { await c.say(n, '과, 관장님은 도서관을 지키셔. 여, 여덟 다리로 문을 다 잡고 계셔.', { face: 'smile' }); return; }
    await c.say(n, '아, 안녕! 수, 수수께끼 노점이야. 세 개 맞히면 파랑 도장.', { face: 'blush' });
    const Q = [
      ['나, 날개가 없는데 날고, 눈이 없는데 우는 것은?', ['바람', '구름', '새'], 1],
      ['많이 가질수록 가, 가벼워지는 것은?', ['구멍', '금화', '빛'], 0],
      ['나, 나누면 커지고 혼자 가지면 작아지는 것은?', ['빵', '비밀', '기쁨'], 2],
    ];
    for (const [q, opts, ans] of Q) { const k = await c.choice(q, opts, { who: 'hemia', name: '헤미아' }); if (k !== ans) { await c.say(n, '아, 아니야. 다시 생각해 봐. 채, 책은 도망 안 가.', { face: 'normal' }); return; } c.sfx('clickspot'); }
    await c.say(n, '마지막 건 세, 세린 노트에 있던 거야. 금서고에서… 아, 아무것도 아니야!', { face: 'shock' });
    await stamp(c, boothAt('blue'));
  } });
  // 남색: 리라의 노래
  ST.person('world', { id: 'lyra', x: bp('indigo').x, y: bp('indigo').y, dir: 'left', when: festival, mark: () => (!f('stamp:indigo') ? '♪' : null), talk: async (c, n) => {
    if (f('stamp:indigo')) { await c.say(n, ST.route() === 'night' ? '봉헌식 날 밤엔 나도 무대에 서요. 노래 한 곡. …그 노래가 끝나면 무슨 일이 생길지는, 고양이만 알아요.' : '다음 노래는 봉헌식에서. 들으러 와요. 끝까지.', { face: 'smile' }); return; }
    await c.say(n, '어머, 또 만났네요. 남색 노점은 노래 노점이에요. 끝까지 들으면 도장.', { face: 'smile' });
    if (!(await c.confirm('리라의 노래를 들을까?', '듣는다', '나중에'))) return;
    await c.cinema(true);
    c.music('dream');
    await c.narr('[p]두 개의 등불이 있었네 / 하나는 하늘로, 하나는 숲으로[/]');
    await c.narr('[p]하늘의 등불은 모두를 비추고 / 숲의 등불은 아무도 몰랐네[/]');
    await c.narr('[p]하늘의 등불이 꺼질 때까지 / 숲의 등불은 기다렸네 / 누나를, 언니를, 자기를[/]');
    await c.say('toria', '찍… 이상하다. 이 노래, 에벨린 할머니가 부르던 자장가랑 가락이 같아.', { face: 'think' });
    await c.say(n, '…그래요? 오래된 노래라서 그래요. 오래된 노래는 다 비슷하게 생겼어요.', { face: 'closed' });
    c.music('rainbow');
    await c.cinema(false);
    c.bond('lyra', 1);
    await stamp(c, boothAt('indigo'));
  } });
  // 보라: 비올라의 등불 과녁 (마법만)
  ST.person('world', { id: 'viola', x: bp('violet').x, y: bp('violet').y, dir: 'left', when: festival, mark: () => (!f('stamp:violet') ? '♪' : null), talk: async (c, n) => {
    if (f('stamp:violet')) { await c.say(n, '공연 연습 중이야. 방해하지 마. …보러 올 거지? 봉헌식 전에 해.', { face: 'blush' }); return; }
    await c.say(n, '또 당신이야? 흥. 보라 노점은 학원 대표 노점. 등불 과녁 다섯 개를 [p]마법으로만[/] 15초 안에.', { face: 'smirk' });
    await c.say(n, '이번엔 내가 기록 세웠어. 9.4초. 깨 봐.', { face: 'smirk' });
    if (!(await c.confirm('등불 과녁에 도전할까?', '도전한다', '나중에'))) return;
    const t0 = S().t;
    const won = await targetGame(c, { n: 5, need: 5, sec: 15, x0: px(bp('violet').x - 4), y0: py(bp('violet').y + 3), dx: 2 * TS, dy: TS, spellOnly: true, lantern: true, title: '등불 과녁', sub: '마법으로만 · 15초' });
    const dt = S().t - t0;
    if (!won) { await c.say(n, '거봐. 흰빛도 마법은 공부해야 해.', { face: 'smirk' }); return; }
    if (dt < 9.4) { await c.say(n, dt.toFixed(1) + '초…?! 또?! …이번엔 인정 안 해. 다음에 또 해.', { face: 'shock' }); c.bond('viola', 1); c.flag('viola_lost2'); }
    else await c.say(n, dt.toFixed(1) + '초. 내 기록은 못 깼네. 흥. 도장은 줄게.', { face: 'smile' });
    await stamp(c, boothAt('violet'));
  } });
  // 베르나 · 카렐: 투기장에 숨어 있다
  ST.person('r_arena', { id: 'berna', x: 3, y: 5, dir: 'right', when: () => festival() && !f('c6_kids'), mark: () => (f('c6_kids_q') ? '!' : null), talk: async (c, n) => {
    await c.say(n, '어?! 형' + (S().gender === 'girl' ? '… 아니 언니' : '') + '!! 여기서 뭐 해? 우리? 우린… 견학 중이야!', { face: 'shock' });
    await c.say('karel', '베르나가 투기장 보자고 했어. 나는 말렸어. 진짜야.', { face: 'normal' });
    await c.say(n, '거짓말! 카렐이 먼저 뛰었어! …그런데 형, 투기장 나가? 나가면 나 응원할게! 목검 들고!', { face: 'happy' });
    if (f('c6_kids_q')) { await c.say('toria', '찍. 마리엔 아줌마가 울기 직전이야. 초록 노점으로 돌아가.', { face: 'angry' }); await c.say(n, '…힝. 알았어. 대신 형 시합은 꼭 볼 거야!', { face: 'sad' }); c.flag('c6_kids'); }
  } });
  ST.person('r_arena', { id: 'karel', x: 4, y: 6, dir: 'right', when: () => festival() && !f('c6_kids'), talk: async (c, n) => { await c.say(n, '베르나는 전설이 될 거래. 나는 베르나보다 먼저 될 거야. …근데 전설은 어떻게 돼?', { face: 'think' }); } });

  /* ───────── 눈금 맞추기 (망치 · 활 시위 등) ───────── */
  class Gauge extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'gauge', solid: false, bw: 1, bh: 1 }, o)); this.v = 0; this.sortBias = 300; }
    update(dt) {
      this.t += dt; if (this.done) return;
      this.v = (Math.sin(this.t * this.speed * Math.PI) + 1) / 2;
      if (this.t > 0.25 && (G.input.pressed('confirm') || G.input.pressed('attack'))) { this.done = true; const d = Math.abs(this.v - 0.5); this.q = d < this.sweet / 2 ? 1 : Math.max(0, 1 - d * 2); this.resolve(this.q); }
      if (this.t > 8 && !this.done) { this.done = true; this.resolve(0); }
    }
    draw(g, cx, cy) {
      const p = G.world.player; const x = Math.round(p.x - cx - 30), y = Math.round(p.y - cy - 44);
      g.fillStyle = '#1a1224'; g.fillRect(x - 1, y - 1, 62, 8);
      const grd = g.createLinearGradient(x, 0, x + 60, 0); grd.addColorStop(0, '#5a8ad8'); grd.addColorStop(0.5, '#ffe066'); grd.addColorStop(1, '#5a8ad8');
      g.fillStyle = grd; g.fillRect(x, y, 60, 6);
      g.fillStyle = '#ff5a5a'; g.fillRect(x + 30 - Math.round(this.sweet * 30), y, Math.round(this.sweet * 60), 6);
      g.fillStyle = '#ffffff'; g.fillRect(x + Math.round(this.v * 58), y - 3, 2, 12);
    }
  }
  ST.gauge = function (c, o) { return new Promise((res) => { const gg = G.world.add(new Gauge({ x: G.world.player.x, y: G.world.player.y, speed: o.speed || 1.5, sweet: o.sweet || 0.15, resolve: (q) => { gg.dead = true; res(q); } })); }); };

  /* ───────── 구름 투기장 ───────── */
  ST.person('r_arena', { name: '사회자 폼포', folk: 'clown', x: 9, y: 3, dir: 'down', mark: () => (f('c6_chroma') && !f('c6_arena') ? '!' : null), talk: async (c, n) => {
    if (f('c6_arena')) { await c.say(n, '챔피언께서 오셨다! 여러분, 박수! …아, 한 번 우승한 분은 명예의 전당에만 오를 수 있어요.', { face: 'happy' }); return; }
    await c.say(n, '구름 투기장에 어서 오세요! 천년제 특별 대회! 세 판을 연달아 이기면 월계관과 금화 천 닢!', { face: 'happy' });
    await c.say(n, '규칙은 간단해요. 쓰러지기 직전이면 지는 겁니다. 목숨은 안 걸어요. 천년제니까요!', { face: 'happy' });
    if (!(await c.confirm('대회에 나갈까? (세 판 연속)', '나간다', '다음에'))) return;
    await tournament(c, n);
  } });
  async function tournament(c, n) {
    const Wd = G.world, C0 = { x: 10 * TS, y: 8 * TS };
    const p = Wd.player;
    const rounds = [
      { name: '첫째 판 — 모래바다 도적 형제', foes: [['bandit', -40, -10], ['bandit', 40, -10]] },
      { name: '둘째 판 — 퇴역 기사와 떠돌이 마법사', foes: [['knight', -30, -20], ['mage', 40, -30]] },
      { name: '마지막 판 — 특별 시범 경기', boss: true },
    ];
    S().duel = true;
    let lost = false;
    for (let r = 0; r < rounds.length && !lost; r++) {
      const R0 = rounds[r];
      c.lock(true);
      p.x = C0.x; p.y = C0.y + 40; p.dir = 'up';
      await c.say(n, R0.name + '! 시작!', { face: 'happy' });
      if (R0.boss) {
        const rt = ST.route();
        const cs = c.spawn({ cid: 'cassian', x: C0.x, y: C0.y - 30, dir: 'down' });
        c.flag('met:cassian');
        await c.say('cassian', rt === 'order' ? '스승님의 명으로 시범 경기를 맡았다. 상대가 너라니. …봐주지 않는다, 후보.' : rt === 'dawn' ? '새벽단 목도리를 두른 채 투기장에 서다니. 대담하군. 좋다. 검으로 말하지.' : '밤의 편이 투기장에? 너는 늘 보이지 않는 데서 싸우는 줄 알았는데.', { face: 'smirk' });
        await c.say('cassian', f('c3_duel_win') ? '블루에서의 빚을 갚지.' : '블루에서보다 나아졌길 바란다.', { face: 'normal' });
        cs.dead = true;
        const boss = G.bosses.spawn('cassian', C0.x, C0.y - 30, { hpMul: 1.3 });
        boss.duel = true; boss.home = { x: C0.x, y: C0.y - 20 }; G.bosses.duelTo(boss, 0.2);
        c.lock(false); boss.start(); G.hud.setBoss(boss); c.music('boss2');
        let win = false;
        await c.freeWhile(() => { if (boss.hp <= 1) { win = true; return true; } return S().hp <= 1; });
        const bx = boss.x, by = boss.y; boss.dead = true; G.hud.boss = null;
        c.lock(true);
        const cs2 = c.spawn({ cid: 'cassian', x: bx, y: by }); c.faceEach('hero', cs2);
        if (win) { await c.say('cassian', '…졌다. 두 번째다. 스승님께 뭐라고 보고하지.', { face: 'shock' }); await c.say('cassian', '「흰빛은 검도 쓸 줄 안다.」 …그렇게 쓰겠다.', { face: 'smile' }); c.bond('cassian', 1); }
        else { lost = true; await c.say('cassian', '아직이다. 그래도 — 나쁘지 않았다.', { face: 'smirk' }); }
        cs2.dead = true;
        c.music('rainbow');
      } else {
        const fs = R0.foes.map(([t, dx, dy]) => G.foes.spawn(t, C0.x + dx, C0.y + dy, { tier: 5 }));
        c.lock(false);
        await c.freeWhile(() => fs.every((e) => e.dead) || S().hp <= 1);
        if (S().hp <= 1) lost = true;
        for (const e of fs) e.dead = true;
      }
      c.heal();
    }
    S().duel = false;
    c.lock(true);
    if (lost) { await c.say(n, '아아, 아쉽습니다! 하지만 멋진 경기였어요! 다음 도전을 기다립니다!', { face: 'sad' }); c.lock(false); return; }
    c.jingle('win'); ST.burst(p.x, p.y - 80, '#ffd84a');
    await c.say(n, '우승——!! 천년제 구름 투기장의 새 챔피언! 흰빛의 손님입니다!', { face: 'happy' });
    if (!f('c6_kids')) await c.say('berna', '형' + (S().gender === 'girl' ? '… 아니 언니' : '') + '——!! 나 봤어!! 전설이야!! 나도 저렇게 될 거야!!', { face: 'happy' });
    c.flag('c6_arena'); c.gold(1000);
    await c.getItem('ac_laurel');
    c.lock(false);
    c.journal('구름 투기장 천년제 특별 대회에서 우승했다. 마지막 판은 카시안과의 시범 경기였다.');
  }

  /* ───────── 축제의 다른 얼굴들 ───────── */
  ST.folk('world', { id: 'cassian', name: '카시안', x: RX(176), y: RY(38), dir: 'down', when: () => festival() && !f('c6_arena'), lines: { c6: async (c, n) => { const rt = ST.route(); await c.say(n, rt === 'order' ? '봉헌식 경호를 맡았다. 스승님은 오지 않으신다고 했다. …그 말을 들은 그라우스가 웃었다. 기분 나쁘게.' : rt === 'dawn' ? '새벽단이 섬에 들어왔다는 첩보가 있다. 네가 모른다고 하면, 믿어 주지. 이번만.' : '리라라는 음유시인. 네 친구지? 그 여자 노래를 들으면 경호원들이 졸아. 우연인가?', { face: 'normal' }); await c.say(n, '투기장 시범 경기에 나간다. 네가 나오면… 반가울 거다. 봐주진 않겠지만.', { face: 'smirk' }); } } });
  ST.folk('world', { id: 'lea', name: '레아', x: RX(159), y: RY(38), dir: 'down', when: festival, lines: { c6: async (c, n) => { const rt = ST.route(); if (rt === 'dawn') { await c.say(n, '쉿. 솜사탕 장수야, 지금은. 봉헌식 밤에 기둥 밑에 화약을 심을 거야. 새벽단 스무 명이 섬에 들어와 있어.', { face: 'smirk' }); await c.say(n, '네가 무대 위에 있을 거라며. 신호는 네가 줘. 불씨를 기둥에 넣지 않으면 — 그게 신호야.', { face: 'normal' }); } else { await c.say(n, '솜사탕 하나 사. 무지개맛. …얼굴 기억하는 척하지 마. 오늘은 그냥 장사꾼이야.', { face: 'smirk' }); } const k = await c.choice('무지개 솜사탕 (30골드)', ['산다', '안 산다'], { who: 'lea', name: '레아' }); if (k === 0 && S().gold >= 30) { c.gold(-30); await c.getItem('food_cotton'); } } } });
  ST.folk('world', { id: 'rud', name: '루드', x: RX(161), y: RY(39), dir: 'up', when: festival, lines: { c6: ['천년제 입장객 사만 이천. 봉헌식 참가 예상 삼만. 기둥 효율을 따져 봤어. …따져 보지 말걸.', '누나가 솜사탕을 판다. 솜사탕 원가는 설탕 한 숟갈. 이익률이… 아니, 그 얘기가 아니지.'] } });
  ST.folk('world', { id: 'pika', name: '피카', x: RX(170), y: RY(37), dir: 'down', wander: 30, when: festival, lines: { c6: ['헤헤, 축제는 지갑 축제야! …농담. 참새단 애들 데리고 구경 왔어. 골디 아저씨가 여비 줬어. 공짜로. 세상에.', '봉헌식? 우린 안 가. 참새들은 높은 데 앉아서 봐. 그게 제일 잘 보여.'] } });
  ST.folk('world', { id: 'luce', name: '루체', x: RX(183), y: RY(30), dir: 'left', when: festival, lines: { c6: '구름 위에서 보니까 블루 등대가 보여! 아빠 일지에 그랬어. 「하늘섬에선 모든 등대가 보인다」. 진짜였어.' } });
  ST.folk('world', { name: '축제 손님', folk: 'kidg', x: RX(164), y: RY(31), wander: 40, when: festival, barks: ['솜사탕!', '불꽃 또 터져!'], lines: { c6: ['봉헌식 때 기둥이 일곱 색으로 빛난대! 엄마가 맨 앞에서 보재!', '롤로 아저씨 곡예 봤어? 아저씨는 왜 늘 얼굴에 색칠해?'] } });
  ST.folk('world', { name: '축제 손님', folk: 'merchant', x: RX(170), y: RY(32), wander: 40, when: festival, lines: { c6: ['옐로에서 왔소. 천년제 대목이오. 흰빛 인형이 제일 잘 팔려. 당신 닮았는데?', '작년 예행연습 날 광장 앞줄 사람들이 쓰러졌다는 소문? 에이, 더위 먹은 거겠지.'] } });
  ST.folk('world', { name: '축제 손님', folk: 'sailor', x: RX(158), y: RY(30), wander: 30, when: festival, lines: { c6: '블루에서 배 타고 레드까지, 레드에서 구름고래로. 천년에 한 번인데 와 봐야지!' } });
  ST.folk('world', { name: '축제 손님', folk: 'oldw', x: RX(172), y: RY(29), wander: 20, when: festival, lines: { c6: ['나는 구백구십 회 천년제 때도 왔어. 농담이야. 그땐 없었지. 그래도 세 번은 왔어.', '봉헌식 다음 날은 다들 좀 피곤해해. 축제라서 그런가 봐.'] } });
  ST.folk('world', { name: '위원회 일꾼', folk: 'farmer', x: RX(183), y: RY(24), when: festival, lines: { c6: '기둥 고리 일곱 개에 기름칠하느라 죽겠어. 기름이 아니라 빛을 먹는 기둥인데 왜 기름칠을 하냐고? 나도 몰라.' } });
  ST.folk('r_shop', { name: '구름 잡화 주인', folk: 'clown', x: 5, y: 3, lines: { c6: async (c) => { const k = await c.choice('어서 와요! 솜사탕, 물약, 바람 깃털!', ['물건을 산다', '괜찮아요'], { name: '구름 잡화 주인' }); if (k === 0) await c.shop('rainbow'); } } });
  ST.folk('rb_inn', { name: '구름 베개 주인', folk: 'oldw', x: 4, y: 3, lines: { c6: async (c) => { const k = await c.choice('구름으로 속을 채운 베개예요. 꿈을 안 꿔요. (50골드)', ['쉰다', '괜찮아요'], { name: '구름 베개 주인' }); if (k === 0) { if (S().gold >= 50) c.gold(-50); await c.rest(); } } } });
  ST.person('world', { id: 'nube', x: RX(167), y: RY(39), dir: 'left', when: () => f('ch:c6'), talk: async (c) => {
    const k = await c.choice('우우웅. 어디로 가겠소?', ['퍼플 — 해 질 녘의 숲', '그냥 쓰다듬는다', '아무 데도'], { who: 'nube', name: '누베' });
    if (k === 0) { await c.fade(true, { sec: 0.6 }); G.game.goto('world', px(OW.towns.purple.x + 16), py(OW.towns.purple.y + 5), 'down'); await c.fade(false, { sec: 0.6 }); }
    else if (k === 1) { c.sfx('wind'); await c.say('nube', '우우…웅. 좋소. 구름은 쓰다듬으면 조금 커지오.', { face: 'smile' }); c.bond('nube', 1); }
  } });
  ST.person('world', { id: 'nube', x: OW.towns.purple.x + 16, y: OW.towns.purple.y + 3, dir: 'down', when: () => f('ch:c6'), talk: async (c) => { if (await c.confirm('하늘섬 무지개로 갈까?', '간다', '아직')) { await c.fade(true, { sec: 0.6 }); G.game.goto('world', px(RX(167)), py(RY(38)), 'up'); await c.fade(false, { sec: 0.6 }); } } });

  /* ───────── 바람 길 (구름 신전): 실려 가면 구덩이 위도 떠서 건넌다 ───────── */
  class Gust extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'gust', solid: false, bw: 1, bh: 1 }, o)); this.lines = []; for (let i = 0; i < 10; i++) this.lines.push({ k: Math.random(), l: Math.random() }); }
    get rect() { return { x: this.x0 * TS, y: this.y0 * TS, w: this.w * TS, h: this.h * TS }; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player, r = this.rect;
      const [dx, dy] = U.DV[this.dir];
      for (const l of this.lines) { l.k += dt * 1.4; if (l.k > 1) { l.k = 0; l.l = Math.random(); } }
      if (!p || p.state === 'fall' || G.script.running) return;
      if (p.x > r.x && p.x < r.x + r.w && p.y - 4 > r.y && p.y - 4 < r.y + r.h) {
        p.floatT = 0.15;
        G.ent.move(Wd.map, p, dx * (this.power || 90) * dt, dy * (this.power || 90) * dt);
        if (Math.random() < dt * 20) G.fx.part({ x: p.x + (Math.random() - 0.5) * 10, y: p.y, z: 2, vx: dx * 60, vy: dy * 60, vz: 4, g: 0, life: 0.4, col: '#ffffff', size: 1 });
      }
    }
    drawShadow(g, cx, cy) {
      const r = this.rect, [dx, dy] = U.DV[this.dir];
      g.fillStyle = 'rgba(220,240,255,0.22)'; g.fillRect(Math.round(r.x - cx), Math.round(r.y - cy), r.w, r.h);
      // 흐름 방향 화살표
      g.fillStyle = 'rgba(255,255,255,0.5)';
      const ph = (this.t * 1.2) % 1;
      for (let k = 0; k < 4; k++) {
        const q = (k / 4 + ph) % 1;
        const ax = dx ? r.x + (dx > 0 ? q : 1 - q) * r.w : r.x + r.w / 2, ay = dy ? r.y + (dy > 0 ? q : 1 - q) * r.h : r.y + r.h / 2;
        const X2 = Math.round(ax - cx), Y2 = Math.round(ay - cy);
        for (let j = 0; j < 4; j++) { if (dy) g.fillRect(X2 - j, Y2 + dy * j * -1, 1 + j * 2, 1); else g.fillRect(X2 + dx * j * -1, Y2 - j, 1, 1 + j * 2); }
      }
      g.fillStyle = 'rgba(255,255,255,0.75)';
      for (const l of this.lines) {
        const x = dx ? r.x + (dx > 0 ? l.k : 1 - l.k) * r.w : r.x + 3 + l.l * (r.w - 6);
        const y = dy ? r.y + (dy > 0 ? l.k : 1 - l.k) * r.h : r.y + 3 + l.l * (r.h - 6);
        g.fillRect(Math.round(x - cx), Math.round(y - cy), dx ? 6 : 1, dy ? 6 : 1);
      }
    }
    draw() {}
  }
  const gust = (x0, y0, w, h, dir, power) => ({ fn: (x, y, Wd, m) => { const rk = Object.values(m.rooms).find((rr) => x >= rr.x0 * TS && x < (rr.x0 + (m.RW || G.dungeon.RW)) * TS && y >= rr.y0 * TS && y < (rr.y0 + (m.RH || G.dungeon.RH)) * TS); return Wd.add(new Gust({ x, y, x0: rk.x0 + x0, y0: rk.y0 + y0, w, h, dir, power })); } });

  /* ═════════ 구름 신전 (던전 6) ═════════ */
  G.dungeon.def('d6', {
    name: '구름 신전', sub: '폭풍새의 둥지', pal: 'rainbow', music: 'hollow', tier: 5, floor: T.CLOUD, dark: 0,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: TEMPLE.x + 2, ty: TEMPLE.y + 2 },
    rooms: {
      '1,3': { ter: [['pit', 1, 5, 4, 3], ['pit', 15, 5, 4, 3], ['stone', 8, 2, 4, 11]], props: [['sign', 9, 4, { text: '구름 신전\n「바람을 거스르지 마라. 바람에 실려라.」\n발밑의 구름이 뚫린 곳은 하늘이다. 떨어지면 아래층이 없다.' }], ['pot', 2, 11], ['pot', 17, 11], ['pot', 2, 3]], foes: [['wisp', 5, 9], ['wisp', 14, 9], ['bat', 9, 6]] },
      '1,2': { ter: [['pit', 1, 4, 18, 3]], props: [['fn', 9, 7, gust(9, 3, 2, 5, 'up', 80)], ['eye', 5, 2, { sets: 'd6:eye' }], ['sign', 13, 10, { text: '「눈을 뜨게 하려면 멀리서 쏴라」' }]], foes: [['bat', 4, 10], ['bat', 15, 10]] },
      '0,2': { ter: [['pit', 6, 2, 8, 11]], props: [['post', 5, 7], ['post', 14, 4], ['chest', 2, 3, { item: 'key_small' }], ['pot', 1, 11]], foes: [['bat', 9, 5], ['bat', 10, 9]] },
      '2,2': { props: [['crystal', 9, 8], ['cblock', 9, 3], ['cblock', 10, 3], ['cblock', 15, 3, { blue: false }], ['cblock', 16, 4, { blue: false }], ['cblock', 17, 3, { blue: false }], ['chest', 16, 3, { item: 'compass' }], ['pot', 2, 11], ['pot', 3, 11]], foes: [['wisp', 5, 6], ['wisp', 14, 9], ['mage', 9, 11]] },
      '2,1': { ter: [['pit', 1, 4, 18, 7]], props: [['fn', 14, 11, gust(14, 3, 2, 9, 'up', 85)], ['fn', 4, 3, gust(4, 3, 2, 9, 'down', 85)], ['chest', 9, 2, { item: 'heartpiece' }], ['chest', 11, 2, { item: 'map_d' }]], foes: [['wisp', 8, 11], ['wisp', 12, 11]] },
      '1,1': { solve: { type: 'clear' }, props: [['chest', 9, 5, { item: 'glove', hidden: true, col: '#e8c048' }], ['sign', 9, 10, { text: '「바위를 드는 손이 둥지로 가는 문을 연다」' }]], foes: [['golem', 9, 6], ['wisp', 4, 9], ['wisp', 15, 9]] },
      '0,1': { objs: [['rock', 1, 4], ['rock', 2, 4], ['rock', 3, 4], ['rock', 3, 3], ['rock', 3, 2], ['rock', 8, 6], ['rock', 8, 7], ['rock', 8, 8], ['rock', 11, 10]], props: [['chest', 2, 3, { item: 'key_big', big: true }], ['spot', 14, 3, { verb: '벽화를 본다', text: async (c) => { c.book('b_aurum'); const B2 = G.data.BOOKS.b_aurum; for (const pg of B2.pages) await c.narr(pg); if (!c.has('seen_aurum_mural')) { c.flag('seen_aurum_mural'); await c.say('toria', '찍… 아우룸이 불씨를 삼켰어. 그리고 넷째 칸은… 누가 지웠어. 왜 지웠을까.', { face: 'think' }); } } }], ['pot', 16, 11], ['pot', 17, 11]], foes: [['wisp', 12, 5], ['bat', 14, 9], ['bat', 6, 10]] },
      '1,0': { boss: true, ter: [['pit', 1, 2, 2, 11], ['pit', 17, 2, 2, 11]], props: [['boss', 9, 5, { type: 'roc' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'switch', 'd6:eye'], ['2,2', '2,1', 'open'], ['1,1', '0,1', 'open'], ['1,1', '1,0', 'big']],
    ents(m, Wd) {
      const r = m.rooms['1,0'];
      const boss = Wd.ents.find((e) => e.boss);
      if (!boss) return;
      const out = () => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: TEMPLE.x + 2, toy: TEMPLE.y + 3 });
      if (f('d6:boss')) { boss.dead = true; Wd.add(out()); return; }
      boss.onDieFn = () => { G.script.run(async (c) => {
        await c.wait(0.8);
        if (!f('d6:heart')) G.world.add(new G.props.HeartItem({ x: (r.x0 + 7) * TS + 8, y: (r.y0 + 8) * TS + 12, flagKey: 'd6:heart' }));
        G.world.add(out());
        c.lock(true);
        c.music('dream');
        await c.narr('폭풍새가 둥지로 떨어졌다. 깃털이 눈처럼 흩날린다. 둥지 한가운데, 알 대신 작은 불씨 하나가 일곱 색으로 깜빡인다.');
        await c.say('toria', '찍… 폭풍새는 이걸 지키고 있었어. 천 년 동안. 알을 낳을 자리에.', { face: 'sad' });
        await c.getItem('ember');
        await c.narr('불씨를 쥐자, 가슴 안쪽 어딘가가 꿀꺽 소리를 냈다. 배가 고팠다. 아주 조금.');
        if (c.abyss('ember_hunger') || true) await c.say('toria', '…왜 불씨를 그렇게 봐? 먹을 거 아니야. 먹을 거 아니지?', { face: 'shock' });
        c.lock(false);
        c.journal('구름 신전 꼭대기에서 폭풍새를 쓰러뜨리고 「무지개 불씨」를 얻었다. 쥐는 순간 배가 고팠다.');
      }); };
      r.ctl.R.onEnter = () => { G.script.run(async (c) => {
        c.lock(true); await c.cinema(true); c.camOn(boss, 3);
        if (!f('d6:intro')) { c.flag('d6:intro'); await c.say('toria', '찍?! 저 새… 날개 한 짝이 섬만 해!', { face: 'shock' }); await c.cutin({ who: 'toria', title: '폭풍새', small: '구름 신전의 주인', sub: '떠 있을 땐 칼이 안 닿는다 — 화살로 세 번!', col: '#4a8ad8', face: 'shock', sec: 1.8 }); }
        c.camFree(); await c.cinema(false); c.lock(false); boss.start(); await c.battle(boss, { music: 'boss' });
      }); };
    },
  });

  /* ═════════ 봉헌식 — 천년제 마지막 밤 ═════════ */
  ST.toNight = function () { const s = S(), DAY = 720; const base = Math.floor(s.t / DAY) * DAY; s.t = base + DAY * 0.5; if (G.story.nightFactor() < 0.9) s.t = base + DAY * 0.52; };
  ST.toMorning = function () { const s = S(), DAY = 720; s.t = (Math.floor(s.t / DAY) + 1) * DAY + DAY * 0.02; };
  async function finale(c) {
    const s = S();
    c.flag('c6_finale');
    c.lock(true);
    await c.cinema(true);
    await c.fade(true, { sec: 1 });
    ST.toNight();
    G.game.goto('world', px(RX(167)) + 8, py(RY(26)), 'up');
    await c.wait(0.2);
    const Wd = G.world, p = Wd.player;
    const crowd = [];
    const add = (spec) => { const n = c.spawn(spec); crowd.push(n); return n; };
    // 무대 위: 크로마 · 리라 · 카시안 / 광장: 사람들
    const ch = add({ cid: 'chroma', x: px(RX(167)) + 8, y: py(RY(21)), dir: 'down' });
    const ly = add({ cid: 'lyra', x: px(RX(164)), y: py(RY(22)), dir: 'down' });
    const cs = add({ cid: 'cassian', x: px(RX(171)), y: py(RY(22)), dir: 'down' });
    const ro = add({ cid: 'rolo', x: px(RX(163)), y: py(RY(28)), dir: 'up' });
    const vi = add({ cid: 'viola', x: px(RX(172)), y: py(RY(28)), dir: 'up' });
    const le = add({ cid: 'lea', x: px(RX(160)), y: py(RY(30)), dir: 'up' });
    add({ cid: 'rud', x: px(RX(159)), y: py(RY(31)), dir: 'up' });
    add({ cid: 'volkan', x: px(RX(175)), y: py(RY(30)), dir: 'up' });
    add({ cid: 'goldy', x: px(RX(177)), y: py(RY(29)), dir: 'up' });
    add({ cid: 'berna', x: px(RX(165)), y: py(RY(30)), dir: 'up' }); add({ cid: 'karel', x: px(RX(166)), y: py(RY(31)), dir: 'up' });
    add({ cid: 'marien', x: px(RX(164)), y: py(RY(32)), dir: 'up' }); add({ cid: 'yana', x: px(RX(170)), y: py(RY(31)), dir: 'up' });
    add({ cid: 'hemia', x: px(RX(171)), y: py(RY(32)), dir: 'up' }); add({ cid: 'pika', x: px(RX(158)), y: py(RY(27)), dir: 'up' });
    for (let i = 0; i < 14; i++) add({ x: px(158 + (i % 7) * 3), y: py(33 + Math.floor(i / 7)), dir: 'up', look: G.cast.folk(['farmer', 'farmerw', 'kid', 'kidg', 'merchant', 'sailor', 'oldw', 'student'][i % 8]), name: '축제 손님' });
    const fw = Wd.add(new Fireworks({ x: px(RX(167)), y: py(RY(24)), spread: 240, always: true, rate: 1.6 }));
    c.music('rainbow');
    await c.fade(false, { sec: 1.2 });
    await c.narr('천년제 마지막 밤. 광장이 사람으로 가득 찼다. 무지개 기둥의 고리 일곱 개가 차례로 희미하게 빛난다.');
    c.camOn(ch, 2);
    await c.say(n0(ch), '여러분! 제1000회 천년제의 마지막 밤입니다! 천 년 전 오늘, 초대 챔피언 아우룸께서 흰빛으로 색 전쟁을 끝내셨습니다!', { face: 'happy' });
    await c.say(n0(ch), '올해는 특별한 손님이 계십니다. 흰빛의 손님이 첫 불을 붙여 주실 겁니다!', { face: 'happy' });
    await c.narr('환호. 누군가 이름을 부른다. 또 누군가. 수천 개의 눈이 무대 앞의 너를 본다.');
    c.camOn(ly, 2);
    await c.say(n0(ly), '불을 붙이기 전에 한 곡 할게요. 천 년 전 노래예요.', { face: 'closed' });
    c.music('dream');
    await c.narr('[p]금빛 소년이 불씨를 삼켰네 / 온 세상이 소년에게 손을 뻗었네[/]');
    await c.narr('[p]소년은 하얗게 빛났고 / 온 세상은 그 빛을 먹었네 / 그래서 아무도 몰랐네, 소년이 배고팠다는 걸[/]');
    await c.say(n0(cs), '…이건 천년제 노래가 아니다.', { face: 'shock' });
    c.music('rainbow');
    c.camFree();
    await c.say(n0(ch), '자, 흰빛의 손님! 무대로 올라와 불씨를 기둥에!', { face: 'happy' });
    await c.walk('hero', RX(167), RY(23));
    c.face('hero', 'up');
    const opts = [{ t: '불씨를 기둥에 넣는다', sub: '천 년의 전통대로. 모두가 기다린다.' }];
    opts.push({ t: '넣지 않는다', sub: f('c6_rolo') ? '롤로의 회색 얼굴이 떠오른다.' : '어쩐지 손이 움직이지 않는다.', tag: 'dawn' });
    const k = await c.choice('무지개 기둥이 불씨를 기다린다.', opts);
    if (k === 0) {
      c.take('ember'); c.sfx('fire'); c.flash('#ffffff', 0.3);
      await c.narr('불씨가 기둥 속으로 빨려 들어갔다. 고리 일곱 개가 한꺼번에 타올랐다. 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라.');
      c.filter('half');
      await c.narr('광장의 색이 한 겹 옅어졌다. 사람들은 웃고 있다. 박수를 친다. 자기 색이 빠져나가는 줄 모르고.');
      await c.say(n0(ro), '안 돼——!! 모두 기둥에서 떨어져요!!', { face: 'angry' });
      c.flag('c6_lit');
    } else {
      c.route('dawn', 1);
      await c.narr('너는 불씨를 쥔 손을 내렸다. 광장이 조용해진다.');
      await c.say(n0(ch), '…손님?', { face: 'shock' });
      if (ST.route() === 'dawn') await c.say(n0(le), '신호다. 얘들아——!', { face: 'smirk' });
    }
    // 그라우스
    c.stopMusic(0.3);
    c.sfx('rumble'); c.shake(3, 1);
    const gr = add({ cid: 'graus', x: px(RX(167)) + 8, y: py(RY(21)) + 2, dir: 'down' });
    G.fx.dust(gr.x, gr.y, 10);
    await c.say(gr, '불씨를 넣든 말든 상관없다.', { face: 'smirk' });
    c.emote(ch, '!'); await c.move(ch, px(RX(164)) + 8, py(RY(21)), { speed: 90 });
    gr.jz = 120; c.camOn(gr, 3);
    for (let t = 0; t < 1; t += 1 / 30) { gr.jz = 120 * (1 - t) * (1 - t); await c.wait(1 / 30); }
    gr.jz = 0; c.shake(4, 0.4); c.sfx('impact');
    const rt = ST.route();
    await c.say(n0(gr), rt === 'order' ? '오랜만이군, 흰빛. 네 장부 덕에 석 달을 천년성 감옥에서 보냈다. 나오는 데 금화 삼만이 들더군. 챔피언께서 공로를 참작하셨지.' : rt === 'dawn' ? '광산에서 착즙기를 박살 낸 꼬마. 덕분에 증거는 사라졌지만, 내 체면도 사라졌다. 부단장이 광부 앞에서 웃음거리가 됐지.' : '내 금고를 턴 고양이의 친구. 금화 사만 칠천. 밤마다 세어 봤다. 몇 번을 세어도 영이더군.', { face: 'angry' });
    await c.say(n0(gr), '챔피언께선 흑점까지 백이십 일이라고 하셨다. 탑 천 개로 막겠다는 거지. 나는 다른 답을 냈다.', { face: 'smirk' });
    await c.say(n0(gr), '[r]흰빛 하나면 탑 천 개보다 낫다.[/] 그 빛을 챔피언께 바치면 나는 단장이 되고, 내가 가지면 — 내가 챔피언이다.', { face: 'smirk' });
    await c.say(n0(cs), '그라우스! 이건 명령에 없다! 무기를 내려놓아라!', { face: 'angry' });
    await c.say(n0(gr), '명령? 꼬마 감찰관. 장부엔 명령보다 숫자가 먼저다. 잿빛 장부단, 기둥을 끝까지 올려라!', { face: 'angry' });
    c.filter('drain'); c.sfx('drain');
    await c.narr('기둥이 울부짖었다. 고리가 하얗게 달아올랐다. 광장의 사람들이 하나둘 무릎을 꿇는다. 색이 연기처럼 기둥으로 빨려 올라간다.');
    await c.say(n0(vi), '…몸이, 무거워. 마법이 안 나와…!', { face: 'cry' });
    await c.say('toria', '찍…! 나, 나도… 날개가…', { face: 'cry' });
    await c.cutin({ who: 'graus', title: '그라우스', small: '징수 기사단 부단장', sub: '정면은 방패로 막는다 — 돌진 뒤 빈틈을!', col: '#6a1a2a', face: 'angry', sec: 1.8 });
    c.camFree();
    gr.dead = true;
    const boss = G.bosses.spawn('graus', px(RX(167)) + 8, py(RY(26)), { hpMul: 1.5 });
    boss.duel = true; boss.home = { x: px(RX(167)) + 8, y: py(RY(28)) };
    const knights = [G.foes.spawn('knight', px(RX(160)), py(RY(29)), { tier: 5 }), G.foes.spawn('knight', px(RX(175)), py(RY(29)), { tier: 5 })];
    for (const n of crowd) if (n !== gr) n.solid = false;
    s.duel = true;
    await c.cinema(false);
    c.lock(false);
    boss.start(); G.hud.setBoss(boss); c.music('boss2');
    let saves = 0;
    for (;;) {
      await c.freeWhile(() => boss.hp <= 1 || s.hp <= 1);
      if (boss.hp <= 1) break;
      // 쓰러지기 직전: 누군가 막아선다 — 싸움을 멈추지 않고 화면 아래 자막 한 줄로
      saves++;
      const who = [rt === 'dawn' ? 'lea' : rt === 'order' ? 'cassian' : 'lyra', 'toria', 'viola'][Math.min(2, saves - 1)];
      G.bossfx.say(who, who === 'toria' ? '찍——!! 일어나! 날 수는 없어도 물 수는 있어!' : who === 'lea' ? '누워 있을 시간 없어! 새벽은 쓰러진 채로 안 와!' : who === 'cassian' ? '일어서라, 후보! 네가 쓰러지면 이 광장 전부가 쓰러진다!' : who === 'lyra' ? '…이 노래를 들어요. 끝날 때까지 쓰러지면 안 돼요.' : '당신이 지면 내 기록도 의미 없어져! 일어나!', { face: 'angry', col: '#ffe8a8', b: boss });
      c.heal(); c.flash('#ffffff', 0.2); c.sfx('heal');
      p.inv = Math.max(p.inv || 0, 1.2);
      G.fx.ring(p.x, p.y - 8, '#ffe8a8', 30, 0.5, 2); G.fx.glow(p.x, p.y - 10, '#ffe8a8', 20, 40);
    }
    s.duel = false;
    for (const kn of knights) kn.dead = true;
    c.lock(true);
    await c.cinema(true);
    G.hud.boss = null;
    const gx = boss.x, gy = boss.y; boss.dead = true;
    const gr2 = add({ cid: 'graus', x: gx, y: gy, dir: 'up' });
    c.camOn(gr2, 3);
    await c.say(n0(gr2), '헉… 헉… 틀렸군. 좋다. 그럼 마지막 수다.', { face: 'angry' });
    await c.move(gr2, p.x, p.y + 6, { speed: 160 });
    c.shake(3, 0.4); c.sfx('impact');
    await c.say(n0(gr2), '[r]흰빛을 기둥에 통째로 넣으면 된다.[/]', { face: 'smirk' });
    await c.narr('그라우스가 너를 무대 위로 끌어올렸다. 기둥의 입이 열린다. 하얀 소용돌이가 네 가슴을 붙잡는다.');
    c.stopMusic(0.2);
    c.sfx('heartbeat'); await c.wait(0.8); c.sfx('heartbeat'); await c.wait(0.6);
    // 깨어남
    await c.narr('빨려 들어간다. 빛이. 너의 빛이. 할머니가 16년 동안 침대 밑에 감춰 둔 빛이.');
    await c.narr('그런데 — 기둥이 너를 삼키는 게 아니었다.\n[w]네가 기둥을 삼키고 있었다.[/]');
    c.music('epic');
    c.flash('#ffffff', 1.2); c.shake(6, 1.4); c.sfx('white');
    for (let i = 0; i < 12; i++) { ST.burst(p.x + (Math.random() - 0.5) * 260, p.y - 40 - Math.random() * 120, '#ffffff'); }
    c.flag('white_hair');
    if (G.world.player) G.world.player.look = ST.heroLook(s);
    await c.wait(0.6);
    await c.narr('흰빛이 터졌다. 기둥 속 천 년 치 빛이 한꺼번에 되돌아 나온다. 광장으로. 사람들에게로. 무릎 꿇은 이들의 머리칼에, 뺨에, 옷깃에 — 색이 돌아온다.');
    c.filter('bright');
    await c.narr('기둥의 고리가 하나씩 깨진다. 빨강. 주황. 노랑. 초록. 파랑. 남색. 보라.\n마지막으로, 기둥이 가운데에서 부러졌다.');
    c.flag('pillar_broken');
    for (const e of G.world.ents) if (e.kind === 'building' && e.special === 'pillar') e.art = G.build.SPECIAL.pillar({ broken: true });
    G.st.learnSpell(s, 'light');
    await c.say(null, '[w]흰빛[/]이 깨어났다! 숨은 것을 드러내고 망자와 어둠을 기절시킨다. 앞머리 한 가닥이 하얗게 셌다.', { style: 'sys' });
    await c.wait(0.6);
    c.camOn(ro, 2);
    await c.say(n0(ro), '…어? 어어? 손이… 손등이… 살구색이야. 칠하지 않았는데.', { face: 'shock' });
    await c.say(n0(ro), '색이다. 내 색이다. 하하… 하하하…', { face: 'cry' });
    c.camFree();
    c.filter('');
    // 카이론
    c.stopMusic(1);
    await c.wait(0.8);
    c.sfx('rumble');
    await c.narr('그때, 하늘이 조용해졌다. 불꽃이 멈췄다. 바람도.');
    fw.dead = true;
    const ka = add({ cid: 'kairon', x: p.x + 40, y: p.y - 10, dir: 'left' });
    ka.jz = 160;
    c.music('kairon');
    for (let t = 0; t < 1; t += 1 / 40) { ka.jz = 160 * (1 - t) * (1 - t); if (Math.random() < 0.5) G.fx.part({ x: ka.x + (Math.random() - 0.5) * 16, y: ka.y, z: ka.jz + 10, vz: -20, g: 0, life: 0.6, col: '#fff0a8', size: 1, glow: true }); await c.wait(1 / 40); }
    ka.jz = 0; c.shake(2, 0.3);
    c.camOn(ka, 3);
    await c.narr('챔피언 카이론. 레벨 99만 9999. 망토 끝에 구름이 매달려 있었다.');
    await c.say(n0(cs), '…스승님. 오지 않으신다고…', { face: 'shock' });
    await c.say('kairon', '오지 않으려 했다. 계산에 없는 빛이 보여서 왔다.', { face: 'closed' });
    c.face(ka, 'left'); c.face('hero', 'right');
    await c.say('kairon', '…세린.', { face: 'sad' });
    await c.say('kairon', '아니군. 눈이 다르다. 세린은 늘 조금 웃고 있었지.', { face: 'normal' });
    c.camOn(gr2, 3);
    await c.say(n0(gr2), '챠, 챔피언! 저는 흰빛을 확보하려고… 챔피언을 위해서…', { face: 'shock' });
    await c.say('kairon', '그라우스. 너는 내 장부의 오류다. 오류는 지운다.', { face: 'normal' });
    c.sfx('white'); c.flash('#fff0a8', 0.3);
    await c.narr('카이론이 손가락을 들었다. 그라우스가 소리도 없이 무릎을 꿇었다. 눈이 텅 비었다. 숨은 쉰다. 그것뿐이다.');
    c.abyss('graus_erased');
    c.camOn(ka, 3);
    await c.say('kairon', '흑점까지 백이십 일. 탑 천 개와 기둥 백 개로 막을 작정이었다. 기둥 하나가 방금 무너졌다.', { face: 'closed' });
    await c.say('kairon', '천년성으로 와라, 흰빛. 너를 어디에 넣어야 하는지 — 나는 이미 알고 있다.', { face: 'normal' });
    await c.say('kairon', '……할머니한테 안부 전해라. 초록 창에게.', { face: 'sad' });
    await c.move(ka, ka.x, ka.y, {});
    for (let t = 0; t < 1; t += 1 / 40) { ka.jz = 200 * t * t; gr2.jz = 200 * t * t; await c.wait(1 / 40); }
    ka.dead = true; gr2.dead = true;
    c.stopMusic(1.5);
    c.camFree();
    await c.wait(1);
    await c.narr('카이론은 그라우스를 데리고 하늘로 사라졌다. 광장에는 부러진 기둥과, 색을 되찾은 사람들과, 머리 한 가닥이 하얗게 센 네가 남았다.');
    // 세 사람이 손을 내민다 — 두 번째 길이 굳는다
    c.music('sad');
    const L = add({ cid: 'lea', x: p.x - 30, y: p.y + 20, dir: 'up' });
    const Cc = n0(cs); Cc.x = p.x + 30; Cc.y = p.y + 20;
    const Ly = n0(ly); Ly.x = p.x; Ly.y = p.y + 34;
    void L; void le;
    await c.say('lea', '같이 가자. 설산 화이트에 새벽단 은신처가 있어. 카이론이 널 「넣을 곳」을 정했다면, 우리가 먼저 그 판을 엎어야 해.', { face: 'normal' });
    await c.say('cassian', '스승님께 가자. 내가 곁에 있겠다. 밖에서 부수는 건 새벽단이 할 거다. 나는 — 안에서 스승님의 마음을 바꾸겠다. 너와 함께라면 할 수 있을지도 모른다.', { face: 'normal' });
    await c.say('lyra', '아무에게도 가지 마요. 밤은 누구의 편도 아니에요. 그래서 안전해요. 미드나잇이 당신을 기다려요. 천 년 전 이야기의 넷째 칸을 알고 있거든요.', { face: 'closed' });
    const cur = ST.route();
    const pick = await c.choice('세 사람이 손을 내민다. 이 선택으로 남은 길이 굳는다.', [
      { t: '레아의 손을 잡는다', tag: 'dawn', sub: (cur === 'dawn' ? '(지금까지 걸어온 길) ' : '') + '새벽단과 함께. 부수고, 되돌려 준다.' },
      { t: '카시안의 손을 잡는다', tag: 'order', sub: (cur === 'order' ? '(지금까지 걸어온 길) ' : '') + '기사단과 함께. 안에서, 규칙으로 바꾼다.' },
      { t: '리라의 손을 잡는다', tag: 'night', sub: (cur === 'night' ? '(지금까지 걸어온 길) ' : '') + '밤과 함께. 아무도 모르게, 끝까지 안다.' },
    ]);
    const route = ['dawn', 'order', 'night'][pick];
    s.flags.route_lock = route; c.route(route, 3);
    c.flag('c6_route_' + route);
    if (route === 'dawn') { await c.say('lea', '좋아. 새벽은 온다. 우리가 데려오면.', { face: 'smirk' }); await c.say('rud', '…확률을 뽑아 봤어. 이길 확률 삼 퍼센트. 삼 퍼센트면 충분해. 누나가 그랬어.', { face: 'smile' }); }
    else if (route === 'order') { await c.say('cassian', '…고맙다. 스승님이 틀렸다면, 스승님께 그걸 증명하는 게 제자의 일이다.', { face: 'smile' }); await c.say('lea', '기사단이라. 뭐, 네 선택이야. 부수고 싶어지면 불러.', { face: 'normal' }); }
    else { await c.say('lyra', '…고마워요. 밤은 약속을 안 해요. 대신 잊지도 않아요.', { face: 'smile' }); await c.say('cassian', '밤의 편이라. 다음에 만날 때 우리가 같은 편이길 바란다.', { face: 'sad' }); }
    await c.fade(true, { sec: 1.2 });
    for (const n of crowd) n.dead = true;
    ST.toMorning();
    c.stopMusic(0.5);
    G.game.goto('world', px(RX(179)), py(RY(24)), 'up');
    await c.fade(false, { sec: 1 });
    await c.narr('다음 날 아침. 광장에는 부러진 기둥이 그대로 누워 있었다. 아무도 치우지 않았다. 아무도 치우자고 하지 않았다.');
    c.music('rainbow');
    const ch2 = c.spawn({ cid: 'chroma', x: px(RX(179)), y: py(RY(24)) - 30, dir: 'down' });
    await c.say(n0(ch2), '…사십 년. 나는 사십 년 동안 불씨를 지키는 줄 알았어요. 사실은 불쏘시개를 모으고 있었는데.', { face: 'cry' });
    await c.say(n0(ch2), '설산 화이트로 가는 고개는 바위로 막혀 있어요. 그 장갑이면 들 수 있을 거예요. 루미에 성녀님이 계신 곳이에요. 병든 사람들이 모이는 곳.', { face: 'normal' });
    await c.say(n0(ch2), '…흰빛. 당신 머리. 한 가닥이 하얘요. 아프진 않아요?', { face: 'sad' });
    await c.say('toria', '찍. 멋있어. 할머니 머리랑 똑같은 색이야.', { face: 'smile' });
    ch2.dead = true;
    if (!f('c6_rolo_thanks')) { c.flag('c6_rolo_thanks'); await c.getItem('fairy'); await c.say(null, '롤로가 새벽에 두고 갔다. 쪽지: 「광대의 요정. 넘어지면 일으켜 줘요. 색 고마워요. — 롤로」', { style: 'sys' }); }
    c.flag('c6_done'); c.flag('open:white');
    ST.refreshPeople();
    await c.cinema(false);
    c.lock(false);
    c.journal(route === 'dawn' ? '봉헌식 밤, 그라우스가 기둥을 폭주시켰다. 흰빛이 깨어나 기둥을 부쉈다. 카이론이 그라우스를 지웠다. 나는 레아의 손을 잡았다 — [r]새벽[/].' : route === 'order' ? '봉헌식 밤, 그라우스가 기둥을 폭주시켰다. 흰빛이 깨어나 기둥을 부쉈다. 카이론이 그라우스를 지웠다. 나는 카시안의 손을 잡았다 — [b]질서[/].' : '봉헌식 밤, 그라우스가 기둥을 폭주시켰다. 흰빛이 깨어나 기둥을 부쉈다. 카이론이 그라우스를 지웠다. 나는 리라의 손을 잡았다 — [p]밤[/].');
    c.save();
  }
  /** spawn한 NPC를 대사 주인으로 쓸 때: 그대로 돌려준다 (가독성용) */
  function n0(n) { return n; }
  // 축제 동안 대륙에 내려와 있으면: 하늘섬까지 걸어 오르는 길은 멀다 — 퍼플 마을의 누베부터 안내한다
  const goal0 = ST.goal;
  ST.goal = function () {
    const g = goal0.apply(this, arguments);
    if (!g || g.map !== 'world' || g.x == null || !f('ch:c6') || f('c6_done')) return g;
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !p) return g;
    let x = p.x / TS, y = p.y / TS;
    if (!m.overworld) { const lw = S().lastWorld; if (!lw || lw.x == null) return g; x = lw.x; y = lw.y; }   // 실내 · 던전이면 마지막으로 밟은 들판
    if (OW.regionOf(Math.floor(x), Math.floor(y)) === 'rainbow' || OW.regionOf(Math.floor(g.x), Math.floor(g.y)) !== 'rainbow') return g;
    return { text: '하늘섬 무지개로 — 퍼플 마을의 구름고래 누베에게. (' + g.text + ')', map: 'world', x: OW.towns.purple.x + 16, y: OW.towns.purple.y + 4 };
  };

  /* ───────── 기둥이 부러진 뒤 ───────── */
  const oldPillar = B.SPECIAL.pillar;
  B.SPECIAL.pillar = function (o) { return oldPillar(Object.assign({}, o, { broken: o.broken || (G.state && G.state.flags && G.state.flags.pillar_broken) })); };
})();
