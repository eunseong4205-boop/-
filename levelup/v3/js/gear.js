/* 장비 — 등급이 높을수록 멀리 닿고, 장비마다 고유한 능력 하나 · 손에 든 모습과 가방 그림 · 휘두르기 · 쏘기 · 주문 동작
   · 등급 기본: 검 사거리 +0/1/2/3/4 · 화살 · 주문이 날아가는 거리 +0/8/16/24/32% · 방패가 막는 폭 · 옷의 구르기 무적
   · 고유 능력(◆): 희귀부터는 거의 모든 무기에 하나 — 불씨 · 칼바람 · 땅울림 · 처형 · 기세 · 도탄 · 폭발촉 · 표식 · 넘치는 마력 …
     전설은 그 무기만의 것(하늘가르개의 천공참, 심연의 균열, 프리즘의 삼색, 여명의 빛 갈래, 근원의 이중 영창 …)
   · 수치는 그 등급의 무기 공격력에 맞춘 덤(대개 공격력의 ×0.3~0.8, 재사용 대기 · 확률로 묶음) — 장비를 바꾸는 손맛은 크게, 균형은 그대로
   · 그림: 장비마다 날 모양 · 코등이 · 손잡이 감기 · 보석 · 빛을 정해 그때그때 그린다(검 15가지 · 활 10가지 · 지팡이 12가지 모양) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, C = G.combat, D = G.data, I = G.input, E = G.ent;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const ITEMS = D.ITEMS;
  const mix = U.mix, shade = U.shade;
  const EL_COL = { fire: '#ff8a3a', ice: '#9ad8ff', bolt: '#ffe066', light: '#fff4c8', dark: '#9a6ad8', poison: '#7ad86a', wind: '#c8f0ff', earth: '#d8a868' };
  const GLOW = [null, null, '#7ee08a', '#8ad0ff', '#d8a8ff', '#fff0a8'];

  /* ───────── 생김새 ───────── */
  // 검: style(날 모양) · blade(날 색) · guard(코등이) · grip(손잡이 두 색) · gem(자루 끝 보석)
  const LOOK = {
    sw_wood: { style: 'straight', blade: '#b8905a', guard: 'bar', grip: ['#6a4a2a', '#8a6a3a'], gem: '#8a6a3a', wood: true },
    sw_start: { style: 'straight', blade: '#d8e0e8', guard: 'cross', grip: ['#3a6a3a', '#5a9a4a'], gem: '#7ad87a' },
    sw_iron: { style: 'straight', blade: '#c8ccd8', guard: 'cross', grip: ['#5a2a2a', '#8a3a3a'], gem: '#d84a4a' },
    sw_dagger: { style: 'dagger', blade: '#d8e8f0', guard: 'bar', grip: ['#2a3a5a', '#4a6a8a'], gem: '#8ad8ff' },
    sw_rapier: { style: 'thin', blade: '#e8eef8', guard: 'disc', grip: ['#4a4a6a', '#8a8aa8'], gem: '#c8c8e8' },
    sw_wind: { style: 'dagger', blade: '#c8f0e8', guard: 'wing', grip: ['#2a5a4a', '#5a9a7a'], gem: '#a8ffd8' },
    sw_axe: { style: 'axe', blade: '#a8b0b8', guard: 'none', grip: ['#6a4a2a', '#8a6a3a'], gem: '#6a4a2a' },
    sw_flame: { style: 'flame', blade: '#ff7a3a', guard: 'wing', grip: ['#5a2a1a', '#8a3a1a'], gem: '#ffd84a' },
    sw_frost: { style: 'crystal', blade: '#a8e0ff', guard: 'cross', grip: ['#2a4a6a', '#4a7aa8'], gem: '#e8f8ff' },
    sw_tide: { style: 'curved', blade: '#7ac8e8', guard: 'wing', grip: ['#1a4a5a', '#3a7a8a'], gem: '#a8f0ff' },
    sw_great: { style: 'broad', blade: '#b8b0a8', guard: 'cross', grip: ['#4a3a2a', '#6a5a3a'], gem: '#8a7a6a', len: 1.1 },
    sw_guard2: { style: 'straight', blade: '#d8d8e0', guard: 'wing', grip: ['#2a3a6a', '#4a5a9a'], gem: '#6a8aff', wide: 1 },
    sw_switch: { style: 'twin', blade: '#e8d8a8', guard: 'cross', grip: ['#5a2a6a', '#2a6a4a'], gem: '#ffd84a' },
    sw_thorn: { style: 'whip', blade: '#5ab84a', guard: 'none', grip: ['#3a5a2a', '#5a7a3a'], gem: '#c84a8a' },
    sw_twin: { style: 'curved', blade: '#e8e0f8', guard: 'bar', grip: ['#3a2a5a', '#6a4a8a'], gem: '#c8a8ff' },
    sw_blood: { style: 'blood', blade: '#c83a4a', guard: 'wing', grip: ['#2a0a1a', '#5a1a2a'], gem: '#ff4a5a' },
    sw_cassian: { style: 'thin', blade: '#d8e0f0', guard: 'disc', grip: ['#5a3a1a', '#c8a050'], gem: '#e84a3a' },
    sw_ember: { style: 'flame', blade: '#ff6a2a', guard: 'cross', grip: ['#2a1a1a', '#5a2a1a'], gem: '#ffb040', wide: 1, len: 1.05 },
    sw_horn: { style: 'horn', blade: '#e8e0c8', guard: 'none', grip: ['#5a4a3a', '#8a7a5a'], gem: '#c8a878', wide: 1 },
    sw_moon: { style: 'curved', blade: '#c8d8ff', guard: 'disc', grip: ['#1a2a4a', '#3a4a7a'], gem: '#e8f0ff', moon: true },
    sw_silver: { style: 'holy', blade: '#e8eef8', guard: 'wing', grip: ['#4a4a6a', '#c8c8e8'], gem: '#fff8d8' },
    sw_storm: { style: 'storm', blade: '#ffe88a', guard: 'wing', grip: ['#3a3a5a', '#5a5a8a'], gem: '#fff4a8' },
    sw_titan: { style: 'hammer', blade: '#8a8a98', guard: 'none', grip: ['#4a3a2a', '#6a5a3a'], gem: '#c8a050' },
    sw_dawn: { style: 'holy', blade: '#fff4c8', guard: 'wing', grip: ['#8a6a2a', '#e8c860'], gem: '#ffe066', wide: 1 },
    sw_light: { style: 'holy', blade: '#f8f8ff', guard: 'wing', grip: ['#6a6a8a', '#e8e8ff'], gem: '#ffffff' },
    sw_prism: { style: 'prism', blade: '#ffffff', guard: 'wing', grip: ['#5a3a8a', '#3a8a8a'], gem: '#ff8ad8' },
    sw_sky: { style: 'sky', blade: '#d8f0ff', guard: 'wing', grip: ['#2a4a8a', '#8ac8ff'], gem: '#ffffff', len: 1.1 },
    sw_void: { style: 'void', blade: '#5a3a8a', guard: 'wing', grip: ['#1a0a2a', '#3a1a5a'], gem: '#c49bff' },
    // 활: style(활 몸) · wood · string · deco
    bw_short: { style: 'simple', wood: '#a86a3a', string: '#e8e0cc' },
    bw_bone: { style: 'simple', wood: '#e8e0c8', string: '#c8b8a0', deco: 'bone' },
    bw_cross: { style: 'cross', wood: '#8a5a30', string: '#e8e0cc', metal: '#a8a8b8' },
    bw_hunter2: { style: 'recurve', wood: '#7a5a2a', string: '#e8e0cc', deco: 'feather' },
    bw_long: { style: 'long', wood: '#9a6a3a', string: '#e8e0cc' },
    bw_frost: { style: 'recurve', wood: '#8ac8e8', string: '#e8f8ff', deco: 'ice' },
    bw_thunder: { style: 'recurve', wood: '#4a4a6a', string: '#ffe066', deco: 'bolt' },
    bw_twin2: { style: 'twin', wood: '#8a6a4a', string: '#e8e0cc' },
    bw_venom: { style: 'recurve', wood: '#4a7a3a', string: '#a8e88a', deco: 'thorn' },
    bw_wind: { style: 'long', wood: '#a8d8c8', string: '#ffffff', deco: 'feather' },
    bw_dragon: { style: 'dragon', wood: '#c86a3a', string: '#ffd8a8', deco: 'spike' },
    bw_echo: { style: 'recurve', wood: '#8a7ab8', string: '#e8d8ff', deco: 'ring' },
    bw_moon: { style: 'moon', wood: '#c8d8f0', string: '#ffffff' },
    bw_seeker: { style: 'recurve', wood: '#5a4a3a', string: '#ff8a8a', deco: 'eye' },
    bw_star: { style: 'long', wood: '#3a4a8a', string: '#fff8c0', deco: 'star' },
    bw_dawn: { style: 'sun', wood: '#ffe8a8', string: '#ffffff', deco: 'star' },
    bw_heaven: { style: 'moon', wood: '#a8c8ff', string: '#ffffff', deco: 'star' },
    bw_sun: { style: 'sun', wood: '#ff9a4a', string: '#fff0a8', deco: 'flame' },
    // 마도구: style(머리 모양) · shaft · head · glow
    fc_twig: { style: 'twig', shaft: '#8a6a3a', head: '#6ac85a' },
    fc_coral: { style: 'coral', shaft: '#d8a8a0', head: '#ff8a9a' },
    fc_ember: { style: 'brazier', shaft: '#5a3a2a', head: '#ff8a3a' },
    fc_rune: { style: 'rune', shaft: '#4a4a5a', head: '#8ad8ff' },
    fc_orb: { style: 'orb', shaft: '#6a5a8a', head: '#c8a8ff' },
    fc_storm: { style: 'storm', shaft: '#3a3a5a', head: '#ffe066' },
    fc_tide: { style: 'hook', shaft: '#3a6a8a', head: '#8ae0ff' },
    fc_mirror2: { style: 'shard', shaft: '#8a8aa8', head: '#e8e0ff' },
    fc_moon: { style: 'tome', shaft: '#2a3a6a', head: '#c8d8ff' },
    fc_star: { style: 'star', shaft: '#3a3a6a', head: '#fff0a8' },
    fc_chaos: { style: 'chaos', shaft: '#2a1a3a', head: '#ff5ad8' },
    fc_origin: { style: 'origin', shaft: '#e8d8a8', head: '#ffffff' },
  };
  function lookOf(it) {
    if (!it) return null;
    const L = LOOK[it.id];
    if (L) return L;
    // 이름 붙은 표가 없는 장비: 능력치에서 모양을 정한다
    if (it.type === 'sword') {
      const style = it.el === 'fire' ? 'flame' : it.el === 'ice' ? 'crystal' : it.el === 'bolt' ? 'storm' : it.el === 'dark' ? 'void' : it.el === 'light' ? 'holy' : (it.heavy || 1) >= 1.3 ? 'broad' : (it.reach || 20) >= 33 ? 'whip' : (it.speed || 1) < 0.8 ? 'dagger' : it.crit ? 'thin' : 'straight';
      return (LOOK[it.id] = { style, blade: it.col || '#c8ccd8', guard: (it.grade || 1) >= 4 ? 'wing' : 'cross', grip: ['#4a3a2a', '#7a5a3a'], gem: GLOW[it.grade || 1] || '#a8a8b8' });
    }
    if (it.type === 'bow') return (LOOK[it.id] = { style: (it.grade || 1) >= 4 ? 'recurve' : 'simple', wood: it.col || '#a86a3a', string: '#e8e0cc', deco: it.multi ? 'star' : null });
    if (it.type === 'focus') return (LOOK[it.id] = { style: 'orb', shaft: '#6a5a4a', head: it.col || '#a8c8ff' });
    return null;
  }

  /* ───────── 검 그림 (가로, 오른쪽이 칼끝 · 손잡이 끝이 x=0) ───────── */
  const SWIMG = {};
  function swordImg(id, reach) {
    const key = id + ':' + reach;
    if (SWIMG[key]) return SWIMG[key];
    const it = ITEMS[id] || { id, type: 'sword', grade: 1, col: '#c8ccd8' };
    const L0 = lookOf(it) || LOOK.sw_iron, gr = it.grade || 1;
    let Lb = Math.round((reach || it.reach || 20) * 0.74 * (L0.len || 1));
    if (L0.style === 'dagger') Lb = Math.round(Lb * 0.8);
    const H = 13, cy = 6, x0 = 9, Wd = x0 + Lb + 3;
    const c = X.canvas(Wd, H), g = c.getContext('2d');
    const px = (x, y, col) => { if (x < 0 || y < 0 || x >= Wd || y >= H) return; g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const base = L0.blade, lite = mix(base, '#ffffff', 0.55), dark = shade(base, 0.62), mid = shade(base, 0.84);
    const glow = gr >= 4 ? (it.glow || GLOW[gr]) : null;
    // 손잡이 · 자루 끝 보석
    const [ga, gb] = L0.grip;
    for (let x = 2; x <= 6; x++) { px(x, cy, (x % 2) ? ga : gb); px(x, cy - 1, shade((x % 2) ? gb : ga, 0.8)); }
    px(0, cy - 1, shade(L0.gem, 0.7)); px(1, cy - 1, L0.gem); px(0, cy, L0.gem); px(1, cy, mix(L0.gem, '#ffffff', 0.6));
    if (gr >= 3) { px(0, cy - 2, shade(L0.gem, 0.6)); px(1, cy + 1, shade(L0.gem, 0.6)); }
    // 코등이
    const gc = gr >= 5 ? '#ffd84a' : gr >= 4 ? '#c8a8ff' : gr >= 3 ? '#c8a050' : '#a8906a', gl = mix(gc, '#ffffff', 0.5);
    const gw = 2 + (L0.wide || 0) + (gr >= 4 ? 1 : 0);
    if (L0.guard === 'cross' || L0.guard === 'wing') {
      for (let y = cy - gw; y <= cy + gw - 1; y++) { px(7, y, gc); px(8, y, shade(gc, 0.75)); }
      px(7, cy - gw, gl);
      if (L0.guard === 'wing') { px(9, cy - gw, gc); px(9, cy + gw - 1, gc); px(10, cy - gw - 1, gl); px(10, cy + gw, gc); }
    } else if (L0.guard === 'disc') { for (let y = cy - 2; y <= cy + 1; y++) for (let x = 6; x <= 8; x++) px(x, y, (x === 6 || y === cy - 2) ? gl : gc); px(8, cy + 2, shade(gc, 0.7)); px(8, cy - 3, shade(gc, 0.7)); }
    else if (L0.guard === 'bar') { for (let y = cy - 1; y <= cy; y++) px(7, y, gc); px(7, cy - 2, gl); px(7, cy + 1, shade(gc, 0.7)); }
    // 날
    const st = L0.style;
    const col = (i, row, hw) => {   // row: 위쪽 -hw … 아래 +hw
      if (st === 'prism') { const PR = ['#ff6a6a', '#ffb04a', '#ffe66a', '#7ae07a', '#6ab8ff', '#b88aff']; const c0 = PR[Math.floor(i / Math.max(2, Lb / 6)) % 6]; return row < 0 ? mix(c0, '#ffffff', 0.6) : row > 0 ? shade(c0, 0.8) : c0; }
      if (st === 'flame') { const k = i / Lb; const c0 = mix(base, '#ffe66a', k * 0.8); return row < 0 ? mix(c0, '#ffffff', 0.4) : row > 0 ? shade(c0, 0.7) : c0; }
      if (st === 'void') { if (Math.abs(row) === hw) return '#c49bff'; return ((i * 7 + row * 3) % 11 === 0) ? '#ffffff' : (row === 0 ? '#1a0a2a' : base); }
      if (st === 'crystal') { const f = ((i + (row + 9)) >> 1) % 3; return f === 0 ? lite : f === 1 ? base : mid; }
      if (st === 'horn') return (i % 4 === 0) ? shade(base, 0.8) : row < 0 ? lite : base;
      if (st === 'holy' && row === 0 && hw >= 1) return (i % 3 === 1) ? '#ffd84a' : mid;
      if (st === 'blood' && row === 0) return '#5a0a1a';
      if (hw === 0) return lite;
      if (row === -hw) return lite;
      if (row === hw) return dark;
      if (row === 0 && hw >= 1 && st !== 'dagger') return mid;
      return base;
    };
    for (let i = 0; i < Lb; i++) {
      const x = x0 + 1 + i, k = i / Math.max(1, Lb - 1);
      let hw = 1, off = 0, top = null;
      switch (st) {
        case 'broad': hw = 2; if (i > Lb - 4) hw = Math.max(0, 2 - (i - (Lb - 4))); break;
        case 'thin': hw = 0; if (i < 3) hw = 1; break;
        case 'dagger': hw = k > 0.15 && k < 0.6 ? 2 : 1; if (i > Lb - 3) hw = 0; break;
        case 'curved': off = -Math.round(k * k * 3); hw = i > Lb - 3 ? 0 : 1; break;
        case 'flame': hw = 1 + (Math.sin(i * 0.95) > 0.35 ? 1 : 0); if (i > Lb - 3) hw = 0; break;
        case 'storm': off = ((i >> 1) % 2) ? -1 : 0; hw = i > Lb - 2 ? 0 : 1; break;
        case 'crystal': hw = i > Lb - 4 ? Math.max(0, 2 - (i - (Lb - 4))) : 2; break;
        case 'whip': hw = (i % 4 === 3) ? -1 : 1; break;
        case 'axe': hw = 0; break;
        case 'hammer': hw = 0; break;
        case 'horn': off = Math.round(k * k * 2); hw = Math.max(0, Math.round(2 - k * 2)); break;
        case 'sky': off = -Math.round(k * k * 2); hw = i > Lb - 4 ? 0 : 1; break;
        case 'twin': hw = 1; break;
        default: hw = i > Lb - 3 ? (i === Lb - 1 ? 0 : 1) : 1;
      }
      if (st === 'broad' || st === 'holy' || st === 'void' || st === 'blood' || st === 'prism') { if (L0.wide && i < Lb - 4) hw = Math.max(hw, 2); }
      if (hw < 0) continue;   // 채찍 마디 사이
      for (let r = -hw; r <= hw; r++) px(x, cy + off + r, top || col(i, r, hw));
      if (st === 'whip' && i % 4 === 1) { px(x, cy + off - 2, '#c84a8a'); px(x + 1, cy + off + 2, shade(base, 0.7)); }
      if (st === 'blood' && (i === Math.round(Lb * 0.35) || i === Math.round(Lb * 0.7))) { px(x, cy + off + hw + 1, '#a81a2a'); px(x, cy + off + hw + 2, '#6a0a1a'); }
      if (st === 'sky' && i % 5 === 2) px(x, cy + off - hw - 1, 'rgba(255,255,255,0.7)');
      if (st === 'twin') px(x, cy + off - 3, i % 2 ? lite : mid);   // 쌍두: 위에 얇은 날 하나 더
    }
    // 끝 모양: 도끼 · 망치 머리
    if (st === 'axe') { const hx = x0 + Lb - 6; for (let i = 0; i < 6; i++) for (let r = -4 + Math.abs(i - 2) * 0; r <= 1; r++) { const edge = r === -4 || i === 5; px(hx + i, cy + r - (i === 0 || i === 5 ? -1 : 0), edge ? lite : r === 1 ? dark : base); } }
    if (st === 'hammer') { const hx = x0 + Lb - 7; for (let i = 0; i < 7; i++) for (let r = -4; r <= 4; r++) px(hx + i, cy + r, (i === 0 || i === 6 || Math.abs(r) === 4) ? dark : (r < -1 ? lite : base)); px(hx + 3, cy, '#c8a050'); px(hx + 3, cy - 1, '#ffe8a8'); }
    // 칼끝 반짝
    px(x0 + Lb, cy + (st === 'curved' ? -3 : st === 'sky' ? -2 : st === 'horn' ? 2 : 0), '#ffffff');
    // 영웅 · 전설: 날 둘레에 엷은 빛
    let img = c;
    if (glow) {
      const c2 = X.canvas(Wd + 2, H + 2), g2 = c2.getContext('2d');
      g2.globalAlpha = gr >= 5 ? 0.55 : 0.4; g2.drawImage(X.silhouette(c, glow), 0, 1); g2.drawImage(X.silhouette(c, glow), 2, 1); g2.drawImage(X.silhouette(c, glow), 1, 0); g2.drawImage(X.silhouette(c, glow), 1, 2);
      g2.globalAlpha = 1; g2.drawImage(c, 1, 1); img = c2;
      SWIMG[key] = { img, ox: 1, oy: cy + 1, L: Lb };
    } else SWIMG[key] = { img, ox: 0, oy: cy, L: Lb };
    return SWIMG[key];
  }

  /* ───────── 활 그림 (세로 · 겨누는 쪽이 오른쪽, 손잡이 x=gx) ───────── */
  const BWIMG = {};
  function bowImg(id) {
    if (BWIMG[id]) return BWIMG[id];
    const it = ITEMS[id] || { id, type: 'bow', grade: 1 };
    const L0 = lookOf(it) || LOOK.bw_short, gr = it.grade || 1;
    const st = L0.style, half = st === 'long' ? 11 : st === 'cross' ? 6 : st === 'moon' || st === 'sun' || st === 'dragon' ? 10 : 9;
    const Hh = half * 2 + 1, Wd = 11, gx = 8, cy = half;
    const c = X.canvas(Wd, Hh + 2), g = c.getContext('2d');
    const px = (x, y, col) => { if (x < 0 || y < 0 || x >= Wd || y >= Hh + 2) return; g.fillStyle = col; g.fillRect(x, y + 1, 1, 1); };
    const wood = L0.wood, lite = mix(wood, '#ffffff', 0.45), dark = shade(wood, 0.6);
    const tips = [];
    if (st === 'cross') {
      // 석궁: 가로 몸통 + 짧은 활
      for (let x = 0; x <= 9; x++) { px(x, cy, x % 3 ? wood : dark); px(x, cy + 1, dark); }
      for (let r = -half; r <= half; r++) { const d = Math.abs(r) / half; px(9 - Math.round(d * d * 3), cy + r, r < 0 ? '#c8c8d8' : L0.metal); }
      tips.push([6, 0], [6, Hh - 1]);
    } else {
      for (let r = -half; r <= half; r++) {
        const d = Math.abs(r) / half;
        let x = gx - Math.round(d * d * (st === 'long' ? 5 : 6));
        if (st === 'recurve' || st === 'dragon') { if (d > 0.78) x += Math.round((d - 0.78) * 12); }
        if (st === 'moon') x = gx - Math.round(Math.sqrt(Math.max(0, 1 - (1 - d) * (1 - d))) * 6);
        const th = d < 0.3 ? 2 : 1;
        for (let t = 0; t < th; t++) px(x - t, cy + r, t === 0 ? (r < 0 ? lite : wood) : dark);
        if (st === 'twin') px(x - 3, cy + r, d < 0.85 ? shade(wood, 0.8) : wood);
        if (Math.abs(r) === half) tips.push([x, cy + r]);
      }
      // 손잡이 감기
      for (let r = -1; r <= 1; r++) { px(gx, cy + r, '#5a3a2a'); px(gx + 1, cy + r, r === 0 ? '#c8a878' : '#3a2a1a'); }
      // 장식
      const D2 = L0.deco;
      const tipDeco = (x, y, s) => {
        if (D2 === 'star') { px(x, y + s, '#fff8c0'); px(x - 1, y + s, '#ffe066'); px(x + 1, y + s, '#ffe066'); px(x, y + s * 2, '#ffe066'); }
        else if (D2 === 'flame') { px(x, y + s, '#ffd84a'); px(x - 1, y + s * 2, '#ff8a3a'); px(x + 1, y, '#ff5a2a'); }
        else if (D2 === 'spike') { px(x - 1, y + s, dark); px(x + 2, y + s * 3, '#fff0d0'); px(x + 2, y - s * 3 + s * 6, '#fff0d0'); }
        else if (D2 === 'ice') { px(x + 1, y + s, '#e8f8ff'); px(x - 1, y + s * 2, '#bfe8ff'); }
        else if (D2 === 'bolt') { px(x + 1, y + s, '#ffe066'); px(x, y + s * 2, '#ffe066'); }
        else if (D2 === 'feather') { px(x - 1, y + s, '#e8e8f0'); px(x - 2, y + s * 2, '#c8c8d8'); }
        else if (D2 === 'thorn') { px(x + 1, y + s * 2, '#c84a8a'); }
        else if (D2 === 'bone') { px(x - 1, y, '#fff8e8'); px(x + 1, y, '#fff8e8'); }
        else if (D2 === 'ring') { px(x + 1, y + s, '#e8d8ff'); px(x + 1, y + s * 2, '#a898d8'); }
        else if (D2 === 'eye') { px(gx - 1, cy - 3, '#ff6a6a'); px(gx - 1, cy + 3, '#ff6a6a'); }
      };
      if (tips.length >= 2) { tipDeco(tips[0][0], tips[0][1], 1); tipDeco(tips[1][0], tips[1][1], -1); }
      if (st === 'sun' || st === 'moon') { px(gx + 2, cy, gr >= 5 ? '#ffe066' : '#e8f0ff'); px(gx + 2, cy - 1, 'rgba(255,255,255,0.6)'); }
    }
    let img = c;
    if (gr >= 4) {
      const gl = it.glow || GLOW[gr];
      const c2 = X.canvas(Wd + 2, Hh + 4), g2 = c2.getContext('2d');
      g2.globalAlpha = gr >= 5 ? 0.5 : 0.35; for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) g2.drawImage(X.silhouette(c, gl), dx, dy);
      g2.globalAlpha = 1; g2.drawImage(c, 1, 1); img = c2;
      BWIMG[id] = { img, gx: gx + 1, cy: cy + 2, half, tipX: (tips[0] ? tips[0][0] : 2) + 1, string: L0.string, cross: st === 'cross', twin: st === 'twin' };
    } else BWIMG[id] = { img, gx, cy: cy + 1, half, tipX: tips[0] ? tips[0][0] : 2, string: L0.string, cross: st === 'cross', twin: st === 'twin' };
    return BWIMG[id];
  }

  /* ───────── 지팡이 그림 (세로 · 머리가 위, 손 자리 hx,hy) ───────── */
  const FCIMG = {};
  function focusImg(id) {
    if (FCIMG[id]) return FCIMG[id];
    const it = ITEMS[id] || { id, type: 'focus', grade: 1 };
    const L0 = lookOf(it) || LOOK.fc_twig, gr = it.grade || 1, st = L0.style;
    const Wd = 11, Hh = 24, cx = 5;
    const c = X.canvas(Wd, Hh), g = c.getContext('2d');
    const px = (x, y, col) => { if (x < 0 || y < 0 || x >= Wd || y >= Hh) return; g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const sh = L0.shaft, hd = L0.head, hl = mix(hd, '#ffffff', 0.6), hdk = shade(hd, 0.65);
    const top = 8;
    if (st !== 'tome') {
      for (let y = top; y < Hh - 1; y++) { px(cx, y, (y % 4 === 0 && gr >= 3) ? mix(sh, '#ffd84a', 0.5) : sh); if (y > top + 2) px(cx + 1, y, shade(sh, 0.7)); }
      px(cx, Hh - 1, shade(sh, 0.5));
    }
    const orb = (x, y, r, col) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + 0.5) px(x + dx, y + dy, dx + dy < -r * 0.6 ? mix(col, '#ffffff', 0.6) : dx + dy > r * 0.8 ? shade(col, 0.7) : col); };
    switch (st) {
      case 'twig': px(cx - 1, top - 1, sh); px(cx - 2, top - 2, sh); px(cx + 1, top - 2, sh); px(cx + 2, top - 3, sh); px(cx - 3, top - 3, hd); px(cx - 2, top - 3, hl); px(cx + 3, top - 4, hd); px(cx + 2, top - 4, hl); px(cx, top - 1, hd); break;
      case 'coral': for (const [dx, dy] of [[0, -1], [-1, -2], [-2, -3], [-2, -4], [1, -2], [2, -3], [2, -5], [0, -3], [0, -4], [-1, -5]]) px(cx + dx, top + dy, dy < -3 ? hl : hd); break;
      case 'brazier': for (let dx = -2; dx <= 2; dx++) px(cx + dx, top - 1, '#8a6a3a'); px(cx - 2, top - 2, '#8a6a3a'); px(cx + 2, top - 2, '#8a6a3a'); for (const [dx, dy, cc] of [[0, -2, '#ffd84a'], [-1, -2, '#ff8a3a'], [1, -2, '#ff8a3a'], [0, -3, '#ff8a3a'], [0, -4, '#ff5a2a'], [-1, -3, '#ff5a2a']]) px(cx + dx, top + dy, cc); break;
      case 'rune': for (let y = top - 4; y < top + 6; y++) px(cx, y, y % 3 === 0 ? hd : '#5a5a6a'); px(cx - 1, top - 4, hd); px(cx + 1, top - 4, hd); px(cx, top - 5, hl); break;
      case 'orb': px(cx - 2, top - 1, sh); px(cx + 2, top - 1, sh); px(cx - 2, top - 2, sh); px(cx + 2, top - 2, sh); orb(cx, top - 4, 2, hd); px(cx - 1, top - 5, '#ffffff'); break;
      case 'storm': orb(cx, top - 3, 2, '#5a5a7a'); orb(cx + 1, top - 4, 1, '#7a7a9a'); px(cx, top - 1, hd); px(cx - 1, top, hd); px(cx, top + 1, hd); px(cx + 2, top - 2, hd); break;
      case 'hook': for (const [dx, dy] of [[0, -1], [0, -2], [0, -3], [1, -4], [2, -4], [3, -3], [3, -2], [2, -1]]) px(cx + dx, top + dy, dy < -2 ? hl : hd); px(cx + 2, top - 2, '#ffffff'); break;
      case 'shard': for (let dy = 0; dy < 6; dy++) for (let dx = -Math.floor((6 - dy) / 3); dx <= Math.floor((6 - dy) / 3); dx++) px(cx + dx, top - 1 - dy, dx < 0 ? hl : dx > 0 ? hdk : hd); break;
      case 'tome': {
        // 떠 있는 마도서: 지팡이 대신 책
        for (let y = 6; y <= 15; y++) for (let x = 1; x <= 9; x++) px(x, y, x === 5 ? '#c8a050' : (y === 6 || y === 15 || x === 1 || x === 9) ? shade(sh, 0.6) : sh);
        for (let y = 8; y <= 13; y += 2) { px(3, y, hd); px(7, y, hd); }
        orb(5, 10, 1, hl);
        break;
      }
      case 'star': for (const [dx, dy] of [[0, -6], [0, -5], [-1, -4], [0, -4], [1, -4], [-3, -3], [-2, -3], [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [-1, -2], [0, -2], [1, -2], [-2, -1], [2, -1]]) px(cx + dx, top + dy, (dx === 0 && dy === -3) ? '#ffffff' : dy < -3 ? hl : hd); break;
      case 'chaos': { const PR = ['#ff5ad8', '#5ad8ff', '#ffd84a', '#8aff5a']; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; px(cx + Math.round(Math.cos(a) * 3), top - 4 + Math.round(Math.sin(a) * 3), PR[i % 4]); } orb(cx, top - 4, 1, '#2a0a3a'); px(cx, top - 4, '#ffffff'); px(cx - 1, top - 1, '#8a5ad8'); px(cx + 1, top - 1, '#8a5ad8'); break; }
      case 'origin': { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; px(cx + Math.round(Math.cos(a) * 4), top - 4 + Math.round(Math.sin(a) * 3), i % 2 ? '#ffd84a' : '#fff8d8'); } orb(cx, top - 4, 1, '#ffffff'); px(cx, top - 1, '#ffd84a'); px(cx - 1, top - 2, '#ffd84a'); px(cx + 1, top - 2, '#ffd84a'); break; }
      default: orb(cx, top - 3, 2, hd);
    }
    let img = c;
    const tip = st === 'tome' ? [5, 10] : [cx, top - 4];
    if (gr >= 4) {
      const gl = it.glow || GLOW[gr];
      const c2 = X.canvas(Wd + 2, Hh + 2), g2 = c2.getContext('2d');
      g2.globalAlpha = gr >= 5 ? 0.5 : 0.35; for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) g2.drawImage(X.silhouette(c, gl), dx, dy);
      g2.globalAlpha = 1; g2.drawImage(c, 1, 1); img = c2;
      FCIMG[id] = { img, hx: cx + 1, hy: Hh - 5, tipX: tip[0] + 1, tipY: tip[1] + 1, col: hd, tome: st === 'tome' };
    } else FCIMG[id] = { img, hx: cx, hy: Hh - 6, tipX: tip[0], tipY: tip[1], col: hd, tome: st === 'tome' };
    return FCIMG[id];
  }

  /* ───────── 가방 그림 (32×32, 장비마다) ───────── */
  const ICO = {};
  function pxl(g) { return (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); }; }
  /** 가로 그림을 45° 기울여 옮긴다 (점 그림이 성기지 않게 한 칸 옆도 채운다) */
  function diag(src, ox, oy) {
    const g0 = src.getContext('2d'), d = g0.getImageData(0, 0, src.width, src.height).data;
    const c = X.canvas(32, 32), g = c.getContext('2d');
    const out = g.createImageData(32, 32), o = out.data;
    const put = (u, v, i) => { if (u < 0 || v < 0 || u >= 32 || v >= 32) return; const j = (v * 32 + u) * 4; if (o[j + 3] > d[i + 3]) return; o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = d[i + 3]; };
    for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
      const i = (y * src.width + x) * 4; if (d[i + 3] < 20) continue;
      const u = ox + Math.round((x + (y - oy)) * 0.72), v = 31 - ox - Math.round((x - (y - oy)) * 0.72);
      put(u, v, i); put(u + 1, v, i);
    }
    g.putImageData(out, 0, 0);
    return c;
  }
  function outline32(c, col) {
    const o = X.canvas(32, 32), g = o.getContext('2d');
    const sil = X.silhouette(c, col || '#0b0914');
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(sil, dx, dy);
    g.drawImage(c, 0, 0);
    return o;
  }
  function gradeBack(g, gr) {
    if (gr < 3) return;
    const col = GLOW[gr];
    g.globalAlpha = gr >= 5 ? 0.28 : 0.18; g.fillStyle = col;
    for (let r = 13; r >= 6; r -= 3) { g.beginPath(); g.arc(16, 16, r, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1;
  }
  const ARMOR = {
    ar_tunic: ['tunic', '#3a8a4a', '#c8a050'], ar_leather: ['vest', '#8a5a30', '#5a3a1a'], ar_chain: ['chain', '#a8aab8', '#6a6a7a'], ar_heat: ['suit', '#d8a868', '#8a5a3a'],
    ar_swift: ['tunic', '#5ab8a8', '#e8e8f0'], ar_cold: ['coat', '#c8a888', '#f0e8e0'], ar_mage: ['robe', '#4a3a8a', '#e8c860'], ar_monk: ['robe', '#c87a3a', '#5a3a2a'],
    ar_ranger: ['cloak', '#3a6a3a', '#a8c870'], ar_scale: ['scale', '#3a8a8a', '#a8e8e0'], ar_knight: ['plate', '#d8dce8', '#6a8aff'], ar_plate: ['plate', '#a8aab8', '#c8a050'],
    ar_shadow: ['cloak', '#2a2a4a', '#8a6ad8'], ar_tri: ['cloak', '#c84a4a', '#4a8ac8'], ar_dawn2: ['plate', '#fff0c8', '#ffd84a'], ar_star: ['robe', '#2a3a7a', '#fff0a8'],
  };
  function armorIcon(it) {
    const [kind, col, trim] = ARMOR[it.id] || ['tunic', it.col || '#8a8a9a', '#c8a050'];
    const c = X.canvas(32, 32), g = c.getContext('2d'), px = pxl(g);
    gradeBack(g, it.grade || 1);
    const lite = mix(col, '#ffffff', 0.4), dk = shade(col, 0.65);
    const body = (x0, x1, y0, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const v = f ? f(x, y) : null; if (v === false) continue; px(x, y, v || (x < 16 ? (x < x0 + 3 ? lite : col) : (x > x1 - 3 ? dk : col))); } };
    if (kind === 'robe' || kind === 'coat') {
      body(10, 21, 6, 27, (x, y) => (y > 14 && (x < 10 + Math.floor((y - 14) / 3) * -1 || x > 21 + Math.floor((y - 14) / 3)) ? false : null));
      for (let y = 15; y <= 27; y++) { const s = Math.floor((y - 14) / 3); px(10 - s, y, lite); px(21 + s, y, dk); for (let x = 10 - s + 1; x < 10; x++) px(x, y, lite); for (let x = 22; x < 21 + s; x++) px(x, y, dk); }
      for (let x = 7; x <= 24; x++) px(x, 27, trim);
      for (let y = 6; y <= 27; y++) px(16, y, trim);
      body(6, 9, 7, 16); body(22, 25, 7, 16);
      px(13, 6, trim); px(18, 6, trim); px(14, 7, trim); px(17, 7, trim);
      if (kind === 'coat') for (let x = 6; x <= 25; x++) { px(x, 6, '#f8f0e8'); px(x, 7, '#e8e0d8'); }
    } else if (kind === 'cloak') {
      for (let y = 5; y <= 28; y++) { const w = 4 + Math.floor((y - 5) * 0.5); for (let x = 16 - w; x <= 16 + w; x++) px(x, y, x < 16 - w + 2 ? lite : x > 16 + w - 2 ? dk : col); }
      for (let x = 12; x <= 19; x++) px(x, 5, trim); px(15, 7, trim); px(16, 7, '#ffffff'); px(16, 8, trim);
      for (let y = 9; y <= 28; y += 4) px(16, y, dk);
    } else {
      // 갑옷 · 튜닉 · 조끼
      body(9, 22, 6, 24); body(5, 8, 7, 15); body(23, 26, 7, 15);
      for (let x = 9; x <= 22; x++) px(x, 24, trim);
      px(14, 6, dk); px(15, 7, dk); px(16, 7, dk); px(17, 6, dk);
      if (kind === 'chain') for (let y = 8; y <= 23; y++) for (let x = 10; x <= 21; x++) if ((x + y) % 2 === 0) px(x, y, (x + y) % 4 === 0 ? lite : dk);
      if (kind === 'scale') for (let y = 9; y <= 23; y += 2) for (let x = 10 + (y % 4 === 1 ? 1 : 0); x <= 21; x += 2) { px(x, y, lite); px(x, y + 1, dk); }
      if (kind === 'plate') { for (let x = 9; x <= 22; x++) { px(x, 12, dk); px(x, 17, dk); } for (let y = 7; y <= 23; y++) px(16, y, lite); px(5, 7, trim); px(26, 7, trim); px(16, 10, trim); px(15, 10, trim); px(17, 10, trim); }
      if (kind === 'vest') { for (let y = 8; y <= 22; y++) { px(15, y, dk); px(17, y, dk); } for (let y = 9; y <= 21; y += 3) px(16, y, trim); }
      if (kind === 'tunic') { for (let x = 9; x <= 22; x++) px(x, 15, trim); px(16, 15, '#ffe8a8'); }
      if (kind === 'suit') { for (let y = 8; y <= 23; y += 3) for (let x = 10; x <= 21; x++) px(x, y, mix(col, '#ffffff', 0.15)); px(16, 9, '#ff8a3a'); }
    }
    if ((it.grade || 1) >= 5) { px(8, 4, '#ffffff'); px(24, 5, '#fff0a8'); px(25, 25, '#ffffff'); }
    return outline32(c);
  }
  const ACC = [
    [/깃털|깃 /, 'feather'], [/송곳니|이빨/, 'fang'], [/왕관|월계관|머리띠/, 'crown'], [/반지|고리/, 'ring'], [/귀걸이|방울|풍경/, 'earring'], [/팔찌|완장|장갑/, 'band'],
    [/목걸이|펜던트|호부|부적|증표/, 'amulet'], [/등딱지|조개/, 'shell'], [/톱니/, 'gear'], [/연꽃/, 'lotus'], [/핵|심장|돌|인장|눈/, 'gem'], [/휘장/, 'badge'], [/현/, 'string'], [/매듭/, 'ring'],
  ];
  function accIcon(it) {
    const kind = (ACC.find(([re]) => re.test(it.name || '')) || [0, 'amulet'])[1];
    const c = X.canvas(32, 32), g = c.getContext('2d'), px = pxl(g);
    const gr = it.grade || 1; gradeBack(g, gr);
    const gem = it.col || ({ 1: '#8ad87a', 2: '#7ee08a', 3: '#6ab8ff', 4: '#c48aff', 5: '#ffc84a' })[gr] || '#c8c8d8';
    const gold = gr >= 4 ? '#ffd84a' : '#c8a050', gl = mix(gold, '#ffffff', 0.5), gd = shade(gold, 0.6);
    const disc = (x0, y0, r, col, hole) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d2 = x * x + y * y; if (d2 > r * r + r * 0.6) continue; if (hole && d2 < hole * hole) continue; px(x0 + x, y0 + y, (x + y < -r * 0.5) ? mix(col, '#ffffff', 0.55) : (x + y > r * 0.7) ? shade(col, 0.65) : col); } };
    if (kind === 'ring') { disc(16, 18, 8, gold, 5); disc(16, 9, 3, gem); px(15, 8, '#ffffff'); }
    else if (kind === 'feather') { for (let i = 0; i < 20; i++) { const x = 9 + Math.round(i * 0.7), y = 26 - i; px(x, y, gl); for (let w = 1; w <= Math.round(4 * Math.sin(i / 20 * Math.PI)); w++) { px(x + w, y + 1, gem); px(x - w, y - 1 + (w > 2 ? 1 : 0), shade(gem, 0.8)); } } px(23, 6, '#ffffff'); }
    else if (kind === 'fang') { for (let y = 6; y <= 26; y++) { const w = Math.max(0, Math.round((26 - y) * 0.28)); for (let x = -w; x <= w; x++) px(16 + x + Math.round((y - 6) * 0.15), y, x < 0 ? '#fff8e8' : '#e8d8c0'); } for (let x = 10; x <= 22; x++) px(x, 5, '#5a3a2a'); px(16, 4, gem); }
    else if (kind === 'crown') { for (let x = 6; x <= 25; x++) for (let y = 16; y <= 22; y++) px(x, y, y === 16 ? gl : y === 22 ? gd : gold); for (const cx of [7, 12, 16, 20, 24]) for (let y = 9; y <= 15; y++) if (Math.abs(16 - cx) * 0 + (y >= 9 + Math.abs(cx - 16) % 3)) px(cx, y, gl); for (const cx of [10, 16, 22]) disc(cx, 19, 1, gem); disc(16, 8, 1, gem); }
    else if (kind === 'earring') { disc(16, 7, 2, gold, 1); for (let y = 9; y <= 14; y++) px(16, y, gd); disc(16, 19, 5, gem); px(14, 17, '#ffffff'); px(15, 17, '#ffffff'); }
    else if (kind === 'band') { for (let y = 11; y <= 21; y++) for (let x = 6; x <= 25; x++) { const e = y === 11 || y === 21; px(x, y, e ? gd : (y < 14 ? gl : gold)); } for (const cx of [10, 16, 22]) disc(cx, 16, 2, gem); }
    else if (kind === 'shell') { for (let y = 8; y <= 25; y++) { const w = Math.round(Math.sqrt(Math.max(0, 81 - (y - 17) * (y - 17))) * 1.2); for (let x = -w; x <= w; x++) px(16 + x, y, (x % 3 === 0) ? shade(gem, 0.7) : gem); } }
    else if (kind === 'gear') { disc(16, 16, 9, '#a8a8b8', 3); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; disc(16 + Math.round(Math.cos(a) * 10), 16 + Math.round(Math.sin(a) * 10), 2, '#c8c8d8'); } disc(16, 16, 2, gem); }
    else if (kind === 'lotus') { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.45; for (let r = 2; r <= 10; r++) { const w = Math.round(Math.sin(r / 10 * Math.PI) * 2); for (let k = -w; k <= w; k++) px(16 + Math.round(Math.cos(a) * r - Math.sin(a) * k), 22 + Math.round(Math.sin(a) * r + Math.cos(a) * k), r > 7 ? mix(gem, '#ffffff', 0.5) : gem); } } for (let x = 9; x <= 23; x++) px(x, 23, '#3a8a5a'); }
    else if (kind === 'badge') { for (let y = 6; y <= 24; y++) { const w = y < 18 ? 8 : 8 - (y - 18); for (let x = -w; x <= w; x++) px(16 + x, y, Math.abs(x) === w || y === 6 ? gd : gem); } for (let i = 8; i <= 22; i++) px(16, i, gl); px(13, 12, gl); px(19, 12, gl); }
    else if (kind === 'string') { for (let i = 0; i < 22; i++) px(6 + i, 6 + i, i % 2 ? gl : gold); disc(8, 8, 2, gem); disc(26, 26, 2, gem); for (let i = 0; i < 4; i++) px(14 + i * 3, 22 - i * 2, '#ffffff'); }
    else if (kind === 'gem') { for (let y = 8; y <= 24; y++) { const w = y < 14 ? (y - 8) + 3 : 9 - Math.round((y - 14) * 0.9); for (let x = -w; x <= w; x++) px(16 + x, y, y < 14 ? (x < 0 ? mix(gem, '#ffffff', 0.6) : mix(gem, '#ffffff', 0.25)) : (x < 0 ? gem : shade(gem, 0.7))); } px(13, 10, '#ffffff'); }
    else { for (let i = 0; i < 9; i++) { px(9 + i, 5 + Math.round(i * 0.6), gd); px(23 - i, 5 + Math.round(i * 0.6), gd); } disc(16, 18, 7, gold); disc(16, 18, 4, gem); px(14, 16, '#ffffff'); }
    if (gr >= 5) { px(5, 6, '#ffffff'); px(26, 9, '#fff0a8'); px(25, 26, '#ffffff'); }
    return outline32(c);
  }
  const SHIELD = { sh_wood: ['#9a6a3a', '#5a3a1a', null], sh_iron: ['#a8aab8', '#5a5a6a', '#d84a4a'], sh_spike: ['#6a6a7a', '#3a3a4a', '#d8d8e8'], sh_mirror: ['#c8d8f0', '#7a8aa8', '#ffffff'], sh_aegis: ['#fff0c8', '#c8a050', '#ffd84a'] };
  function shieldIcon(it) {
    const [col, rim, emb] = SHIELD[it.id] || ['#a8aab8', '#5a5a6a', null];
    const c = X.canvas(32, 32), g = c.getContext('2d'), px = pxl(g);
    gradeBack(g, it.grade || 1);
    for (let y = 5; y <= 27; y++) { const w = y < 18 ? 10 : Math.round(10 - (y - 18) * 1.1); for (let x = -w; x <= w; x++) px(16 + x, y, (Math.abs(x) >= w - 1 || y <= 6) ? rim : (x < -3 ? mix(col, '#ffffff', 0.35) : x > 3 ? shade(col, 0.8) : col)); }
    if (it.id === 'sh_wood') for (let x = 8; x <= 24; x += 4) for (let y = 7; y <= 24; y++) px(x, y, shade(col, 0.75));
    if (it.id === 'sh_spike') for (const [x, y] of [[16, 3], [7, 8], [25, 8], [16, 29]]) { px(x, y, emb); px(x, y + 1, emb); }
    if (emb) { for (let y = 10; y <= 21; y++) px(16, y, emb); for (let x = 11; x <= 21; x++) px(x, 14, emb); }
    if (it.id === 'sh_mirror') for (let i = 0; i < 6; i++) px(10 + i, 9 + i, '#ffffff');
    return outline32(c);
  }
  function icon(id) {
    if (ICO[id]) return ICO[id];
    const it = ITEMS[id]; if (!it) return null;
    let c = null;
    try {
      if (it.type === 'sword') { const S0 = swordImg(id, it.reach || 20), cc = X.canvas(32, 32), g = cc.getContext('2d'); gradeBack(g, it.grade || 1); const dg = diag(S0.img, 1, S0.oy); g.drawImage(dg, 0, 0); c = outline32(cc); }
      else if (it.type === 'bow') {
        const B = bowImg(id), cc = X.canvas(32, 32), g = cc.getContext('2d'); gradeBack(g, it.grade || 1);
        const bx = 16 - B.gx + 2, by = 16 - B.cy;
        g.drawImage(B.img, bx, by);
        g.strokeStyle = B.string; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + B.tipX + 0.5, by + B.cy - B.half + 0.5); g.lineTo(bx + B.tipX - 3 + 0.5, by + B.cy + 0.5); g.lineTo(bx + B.tipX + 0.5, by + B.cy + B.half + 0.5); g.stroke();
        g.fillStyle = '#c8b890'; g.fillRect(bx + B.tipX - 3, by + B.cy, 17, 1); g.fillStyle = '#e8e8f0'; g.fillRect(bx + B.tipX + 13, by + B.cy - 1, 2, 3); g.fillStyle = '#ff8a8a'; g.fillRect(bx + B.tipX - 4, by + B.cy - 1, 2, 1); g.fillRect(bx + B.tipX - 4, by + B.cy + 1, 2, 1);
        c = outline32(cc);
      } else if (it.type === 'focus') { const F = focusImg(id), cc = X.canvas(32, 32), g = cc.getContext('2d'); gradeBack(g, it.grade || 1); g.drawImage(F.img, 16 - Math.round(F.img.width / 2), 16 - Math.round(F.img.height / 2)); c = outline32(cc); }
      else if (it.type === 'armor') c = armorIcon(it);
      else if (it.type === 'acc') c = accIcon(it);
      else if (it.type === 'shield') c = shieldIcon(it);
    } catch (e) { console.error('[gear icon]', id, e); c = null; }
    ICO[id] = c;
    return c;
  }

  /* ───────── 등급 기본 능력 ───────── */
  const REACH_G = [0, 0, 1, 2, 3, 4], BOWR_G = [1, 1, 1.08, 1.16, 1.24, 1.32], SPR_G = [1, 1, 1.07, 1.14, 1.21, 1.28], ROLL_G = [0, 0, 0.01, 0.02, 0.03, 0.04];
  const grade = (id) => (id && ITEMS[id] && ITEMS[id].grade) || 1;

  /* ───────── 고유 능력 (◆) ─────────
     w: 어느 무기로 칠 때 (sword · bow · magic · any) — 그 장비를 차고 그 무기로 칠 때만 */
  const PERK = {
    firststrike: { name: '첫 칼', d: '체력이 가득한 적에게 +25%' },
    momentum: { name: '기세', d: '1.5초 안에 이어 맞힐 때마다 +4% (여섯 번까지)' },
    flare: { name: '섬광', d: '치명타가 터지면 둘레에 빛이 번진다 (공격력 ×0.4)' },
    ember: { name: '불씨', d: '타고 있는 적을 치면 불꽃이 터진다 (×0.45, 둘레)' },
    shatter: { name: '얼음 파편', d: '얼어붙은 적을 치면 파편이 튄다 (×0.5, 둘레)' },
    tide: { name: '밀물', d: '맞은 적이 더 밀려나고 1.5초 느려진다' },
    quake: { name: '땅울림', d: '마지막 베기 · 회전 베기가 땅을 울린다 (×0.5, 둘레 · 기절)' },
    cleave: { name: '칼바람', d: '마지막 베기에 짧은 칼바람이 날아간다 (×0.55, 둘 꿰뚫음)' },
    snare: { name: '휘감기', d: '맞힐 때 20% 확률로 적을 0.8초 묶는다' },
    execute: { name: '마무리', d: '체력이 30% 아래인 적에게 +40%' },
    smite: { name: '퇴마', d: '망자 · 어둠의 적에게 +60%, 빛이 터진다' },
    storm: { name: '낙뢰', d: '네 번 맞힐 때마다 벼락이 떨어진다 (×0.7)' },
    bloodmoon: { name: '피의 달', d: '적을 쓰러뜨리면 2.5초 동안 베기가 빨라진다' },
    moon: { name: '달빛', d: '어두운 곳에서 치명타 +12%' },
    twinfang: { name: '쌍두', d: '바꿔 든 직후 첫 베기가 칼바람을 날린다' },
    // 전설 검
    aurum: { name: '아우룸', d: '세 번 휘두를 때마다 해의 칼날이 날아간다 (×0.9, 모두 꿰뚫음)' },
    radiant: { name: '빛의 검', d: '검기가 적에게 닿으면 빛이 터진다 (×0.5, 둘레)' },
    prism: { name: '삼색', d: '맞힐 때마다 불 → 얼음 → 번개가 번갈아 터진다 (×0.45)' },
    skyrend: { name: '천공참', d: '네 번 휘두를 때마다 거대한 바람 칼날 (×1.1, 모두 꿰뚫음)' },
    rift: { name: '균열', d: '이 검으로 쓰러뜨린 자리에 균열이 열려 둘레 적을 끌어당기며 벤다' },
    // 활
    pin: { name: '꿰매기', d: '다 모은 화살이 0.5초 더 묶는다' },
    rapid: { name: '연발', d: '세 발마다 한 발이 덤으로 나간다' },
    mark: { name: '사냥감 표식', d: '맞은 적에게 4초 표식 — 모든 피해 +25%' },
    venom: { name: '독침', d: '독이 오른 적에게 화살 +20%' },
    gale: { name: '질풍', d: '모으지 않은 화살이 30% 빠르고 더 밀어낸다' },
    split: { name: '갈래 화살', d: '다 모은 화살이 맞으면 두 갈래로 갈라진다 (×0.5)' },
    explode: { name: '폭발촉', d: '다 모은 화살이 맞은 자리에서 터진다 (×0.6, 둘레)' },
    ricochet: { name: '도탄', d: '화살이 한 번 튕겨 가까운 적에게 (×0.6)' },
    moonpierce: { name: '그림자 관통', d: '치명타 화살은 모든 것을 꿰뚫는다' },
    starshot: { name: '별 추적', d: '다 모은 화살이 조금 휘어 적을 쫓는다' },
    dawnsplit: { name: '여명', d: '다 모은 화살이 맞으면 빛이 터진다 (×0.5, 둘레)' },
    galaxy: { name: '은하수', d: '네 번째 모은 화살마다 맞은 자리에 별 셋이 떨어진다 (×0.8)' },
    sunfire: { name: '정오의 불길', d: '다 모은 화살이 지나간 자리가 1.5초 탄다' },
    // 마도구
    rune: { name: '룬 새김', d: '네 번째 주문마다 MP를 쓰지 않는다' },
    overload: { name: '넘치는 마력', d: '12% 확률로 MP를 돌려받고 주문이 +40%' },
    kindle: { name: '불쏘시개', d: '불 주문이 터진 자리가 1.2초 탄다' },
    mirror: { name: '거울 영창', d: '25% 확률로 같은 주문을 한 번 더' },
    moonlit: { name: '월광', d: '어두운 곳에서 주문 +15%' },
    star: { name: '별 떨구기', d: '다섯 번째 주문마다 가까운 적에게 별이 떨어진다 (×1.0)' },
    chaos: { name: '혼돈', d: '주문마다 불 · 얼음 · 번개 가운데 하나가 덤으로 터진다 (×0.4)' },
    origin: { name: '근원', d: '세 번째 주문마다 마법진이 열려 두 번 건다' },
    // 방패 · 옷
    brace: { name: '버팀', d: '막으면 기력 10이 돌아온다' },
    aegis: { name: '성벽', d: '막을 때 둘레 적을 밀어낸다' },
    scales: { name: '비늘', d: '10초에 한 번, 받는 피해 절반' },
    stalwart: { name: '굳건함', d: '맞아도 밀려나지 않는다' },
    shadowstep: { name: '그림자 걸음', d: '완벽 회피하면 1.5초 동안 적이 놓치고 다음 공격이 치명타' },
    swiftshot: { name: '날랜 활', d: '구른 직후 쏜 화살은 다 모은 화살' },
    flow: { name: '흐름', d: '완벽 회피하면 기력 30' },
    arcane: { name: '마력 실', d: '주문 MP -10%' },
    radiance: { name: '광휘', d: '맞으면 둘레에 빛이 터진다 (6초에 한 번)' },
    starveil: { name: '별의 장막', d: '12초마다 한 번 받는 피해를 막는 장막' },
  };
  // 장비 → 능력 (희귀부터 거의 모두, 고급은 몇몇, 전설은 고유)
  const HAS = {
    sw_start: 'firststrike', sw_iron: 'firststrike', sw_dagger: 'momentum', sw_rapier: 'flare', sw_wind: 'momentum', sw_axe: 'quake',
    sw_flame: 'ember', sw_frost: 'shatter', sw_tide: 'tide', sw_great: 'quake', sw_guard2: 'cleave', sw_switch: 'twinfang', sw_thorn: 'snare', sw_twin: 'momentum',
    sw_blood: 'bloodmoon', sw_cassian: 'execute', sw_ember: 'ember', sw_horn: 'quake', sw_moon: 'moon', sw_silver: 'smite', sw_storm: 'storm', sw_titan: 'quake',
    sw_dawn: 'aurum', sw_light: 'radiant', sw_prism: 'prism', sw_sky: 'skyrend', sw_void: 'rift',
    bw_bone: 'firststrike', bw_cross: 'rapid', bw_hunter2: 'mark', bw_long: 'pin',
    bw_frost: 'shatter', bw_thunder: 'storm', bw_twin2: 'split', bw_venom: 'venom', bw_wind: 'gale',
    bw_dragon: 'explode', bw_echo: 'ricochet', bw_moon: 'moonpierce', bw_seeker: 'mark', bw_star: 'starshot',
    bw_dawn: 'dawnsplit', bw_heaven: 'galaxy', bw_sun: 'sunfire',
    fc_coral: 'tide', fc_ember: 'kindle', fc_rune: 'rune', fc_orb: 'overload', fc_storm: 'storm', fc_tide: 'tide', fc_mirror2: 'mirror', fc_moon: 'moonlit', fc_star: 'star', fc_chaos: 'chaos', fc_origin: 'origin',
    sh_iron: 'brace', sh_aegis: 'aegis',
    ar_scale: 'scales', ar_knight: 'stalwart', ar_plate: 'stalwart', ar_shadow: 'shadowstep', ar_ranger: 'swiftshot', ar_monk: 'flow', ar_mage: 'arcane', ar_dawn2: 'radiance', ar_star: 'starveil',
  };
  const SLOT_W = { sword: 'sword', bow: 'bow', focus: 'magic', shield: 'any', armor: 'any' };
  const SRCW = { sword: 'sword', spin: 'sword', dash: 'sword', beam: 'sword', lunge: 'sword', arrow: 'bow', spell: 'magic' };
  const wOf = (info) => info.w || SRCW[info.src] || null;
  /** 지금 찬 장비의 능력: { 능력: 무기갈래 } */
  let PK = {}, pkKey = '';
  function perks() {
    const s = S(); if (!s) return PK;
    const e = s.equip, key = [e.sword, e.bow, e.focus, e.shield, e.armor].join('|');
    if (key === pkKey) return PK;
    pkKey = key; PK = {};
    for (const slot of ['sword', 'bow', 'focus', 'shield', 'armor']) { const id = e[slot], k = id && HAS[id]; if (k && (!G.prog || G.prog.reqOk(s, ITEMS[id].req))) PK[k] = SLOT_W[slot]; }
    return PK;
  }
  const has = (k, w) => { const P = perks(); return P[k] && (P[k] === 'any' || !w || P[k] === w); };
  const isDark = () => { const m = W() && W().map; if (!m) return false; return (m.dark || 0) > 0.3 || !!(m.outdoor && G.story && G.story.nightFactor && G.story.nightFactor() > 0.5); };
  const RT = { swings: 0, casts: 0, hits: {}, mom: 0, momT: 0, scalesT: 0, veilT: 0, radT: 0, galaxy: 0, shots: 0, zones: [] };

  /* ───────── 능력치에 더하기 ───────── */
  const der0 = G.st.derive;
  G.st.derive = function (s) {
    const d = der0.apply(this, arguments);
    if (!s || !s.equip) return d;
    d.reach += REACH_G[grade(s.equip.sword)] || 0;
    d.bowRange = BOWR_G[grade(s.equip.bow)] || 1;
    d.spellRange = SPR_G[grade(s.equip.focus)] || 1;
    d.rollIframes += ROLL_G[grade(s.equip.armor)] || 0;
    const P = perks();
    if (P.moon && isDark()) d.crit = Math.min(0.7, d.crit + 0.12);
    if (P.arcane) d.mpCost *= 0.9;
    return d;
  };

  /* ───────── 덤 공격 (능력이 일으키는 것 — 다시 능력을 부르지 않는다) ───────── */
  const foes = () => C.foes();
  const near = (x, y, r, ex) => foes().filter((f) => f !== ex && U.dist(x, y, f.x, f.y - (f.h || 16) / 2) < r + (f.r || 8));
  const procHit = (e, amt, o) => C.damage(e, amt, Object.assign({ proc: true, skill: true, kx: 0, ky: 0, power: 0.4 }, o));
  function burst(x, y, r, amt, col, o) {
    G.fx.ring(x, y, col, r, 0.3, 2); G.fx.sparks(x, y, 10, col, 90); G.fx.glow(x, y, col, 8, 20);
    for (const f of near(x, y, r)) { const [nx, ny] = U.norm(f.x - x, f.y - y); procHit(f, amt, Object.assign({ kx: nx, ky: ny }, o || {})); }
  }
  function strike(e, amt) {
    C.bolts.push({ x0: e.x + (Math.random() - 0.5) * 20, y0: e.y - 90, x1: e.x, y1: e.y - 6, t: 0 });
    procHit(e, amt, { el: 'bolt', stun: 0.5, src: 'spell', w: 'magic' }); sfx('bolt'); W().shake(1.5, 0.1);
  }
  function wave(p, a, o) {
    const sp = o.sp || 250, col = o.col || '#ffffff', big = o.big || 1;
    C.shoot({ kind: 'orb', x: p.x + Math.cos(a) * 12, y: p.y - 4 + Math.sin(a) * 9, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: o.dmg, src: 'beam', w: 'sword', proc: true, skill: true, r: 5 * big, life: o.life || 0.24, pierce: o.pierce == null ? 2 : o.pierce, trail: col, ghost: true, power: 0.8,
      drawFn(g, x, y) { const an = Math.atan2(this.vy, this.vx), k = Math.min(1, this.t / 0.06); g.save(); g.translate(x, y); g.rotate(an); g.globalAlpha = 0.85 * k; g.strokeStyle = col; g.lineWidth = 2 * big; g.beginPath(); g.arc(-4 * big, 0, 8 * big, -1.25, 1.25); g.stroke(); g.globalAlpha = 0.9 * k; g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(-3 * big, 0, 8 * big, -1, 1); g.stroke(); g.globalAlpha = 0.25 * k; g.fillStyle = col; g.beginPath(); g.arc(-4 * big, 0, 8 * big, -1.25, 1.25); g.fill(); g.restore(); } });
  }
  function quakeAt(x, y, r, amt) {
    W().shake(2.5, 0.15); G.fx.dust(x, y, 10); G.fx.ring(x, y, '#d8b888', r, 0.35, 2); sfx('impact');
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; G.fx.part({ x: x + Math.cos(a) * r * 0.6, y: y + Math.sin(a) * r * 0.4, z: 0, vz: 50 + Math.random() * 40, g: 240, life: 0.5, col: Math.random() < 0.5 ? '#a8784a' : '#d8b080', size: 2 }); }
    for (const f of near(x, y - 4, r)) if (!f.fly) { const [nx, ny] = U.norm(f.x - x, f.y - y); procHit(f, amt, { kx: nx, ky: ny, stun: 0.4, src: 'sword', w: 'sword', power: 0.9, el: 'earth' }); }
  }
  function zone(o) { RT.zones.push(Object.assign({ t: 0, tick: 0 }, o)); if (RT.zones.length > 40) RT.zones.shift(); }

  /* ───────── 피해 배율 (치기 전) ───────── */
  const mod0 = C.dmgMod;
  C.dmgMod = function (e, info, amt) {
    let k = mod0 ? mod0.apply(this, arguments) : 1;
    if (k === 0 || info.proc) return k;
    const w = wOf(info); if (!w) return k;
    const P = perks(); if (!Object.keys(P).length) return k;
    const own = (id) => P[id] && (P[id] === 'any' || P[id] === w);
    if (own('firststrike') && e.hp >= e.maxHp * 0.999) k *= 1.25;
    if (own('execute') && e.hp < e.maxHp * 0.3) k *= 1.4;
    if (own('momentum')) k *= 1 + 0.04 * RT.mom;
    if (own('smite') && (e.undead || e.dark)) k *= 1.6;
    if (own('venom') && e.poisonT > 0) k *= 1.2;
    if (own('moonlit') && isDark()) k *= 1.15;
    if (w === 'magic' && RT.boostT > 0) k *= 1.4;
    return k;
  };

  /* ───────── 맞힌 뒤 ───────── */
  const dmg0 = C.onDamage;
  C.onDamage = function (e, info, dmg, crit) {
    if (dmg0) dmg0.apply(this, arguments);
    if (info.proc) return;
    const w = wOf(info); if (!w) return;
    const P = perks(); if (!Object.keys(P).length) return;
    const own = (id) => P[id] && (P[id] === 'any' || P[id] === w);
    const s = S(), d = G.st.derive(s), p = W().player;
    const base = w === 'sword' ? d.atk : w === 'bow' ? d.bowAtk : (4 + s.lv * 0.25) * d.magMul;
    const ex = e.x, ey = e.y - (e.h || 16) / 2, t = W().t;
    RT.hits[w] = (RT.hits[w] || 0) + 1;
    if (own('momentum')) { RT.mom = Math.min(6, RT.mom + 1); RT.momT = 1.5; }
    if (own('flare') && crit) burst(ex, ey, 20, base * 0.4, '#fff4c8', { src: 'beam', w: 'sword', el: 'light' });
    if (own('ember') && e.burnT > 0 && t - (RT.emberAt || -9) > 0.6) { RT.emberAt = t; burst(ex, ey, 22, base * 0.45, '#ff8a3a', { el: 'fire', src: w === 'magic' ? 'spell' : 'beam', w }); sfx('fire'); }
    if (own('shatter') && e.freezeT > 0 && t - (RT.shatAt || -9) > 0.5) { RT.shatAt = t; G.fx.shards(ex, ey, 12, '#bfe8ff'); burst(ex, ey, 22, base * 0.5, '#bfe8ff', { el: 'ice', src: 'beam', w }); sfx('ice'); }
    if (own('tide') && !e.boss) { e.slowT = Math.max(e.slowT || 0, 1.5); if (info.kx != null && e.kx != null) { e.kx *= 1.4; e.ky *= 1.4; } }
    if (own('snare') && Math.random() < 0.2) { e.stunT = Math.max(e.stunT || 0, 0.8); G.fx.ring(ex, e.y, '#7ad86a', 10, 0.3, 1); }
    if (own('smite') && (e.undead || e.dark)) { G.fx.glow(ex, ey, '#fff8d0', 8, 24); }
    if (own('storm') && RT.hits[w] % 4 === 0) strike(e, base * 0.7);
    if (own('mark')) { if (w === 'bow' && (info.charged || P.mark && ITEMS[s.equip.bow] && s.equip.bow === 'bw_seeker')) e.markUntil = t + 4; }
    if (own('prism')) { const kind = RT.hits[w] % 3; if (kind === 0) burst(ex, ey, 18, base * 0.45, '#ff8a3a', { el: 'fire', src: 'beam', w: 'sword' }); else if (kind === 1) { e.freezeT = Math.max(e.freezeT || 0, 0.6); G.fx.shards(ex, ey, 6, '#bfe8ff'); procHit(e, base * 0.45, { el: 'ice', src: 'beam', w: 'sword' }); } else { const n2 = near(ex, ey, 60, e)[0]; if (n2) { C.bolts.push({ x0: ex, y0: ey, x1: n2.x, y1: n2.y - 8, t: 0 }); procHit(n2, base * 0.45, { el: 'bolt', stun: 0.4, src: 'beam', w: 'sword' }); } } }
    if (own('radiant') && info.src === 'beam') burst(ex, ey, 20, base * 0.5, '#fff8d0', { el: 'light', src: 'beam', w: 'sword' });
    // 활: 맞은 화살로 일으키는 것
    const sh = info.shot;
    if (w === 'bow' && sh && !sh.gearDone) {
      if (own('pin') && info.charged) e.stunT = Math.max(e.stunT || 0, 0.5 + (info.stun || 0));
      if (own('explode') && info.charged) { sh.gearDone = true; burst(ex, ey, 24, base * 0.6, '#ff9a5a', { el: 'fire', src: 'arrow', w: 'bow' }); sfx('explode'); W().shake(1.5, 0.1); }
      if (own('dawnsplit') && info.charged) { sh.gearDone = true; burst(ex, ey, 24, base * 0.5, '#fff0a8', { el: 'light', src: 'arrow', w: 'bow' }); }
      if (own('split') && info.charged && !sh.split) {
        sh.gearDone = true; const a = Math.atan2(sh.vy, sh.vx);
        for (const off of [-0.5, 0.5]) C.shoot({ kind: 'arrow', x: ex, y: ey + 6, vx: Math.cos(a + off) * 260, vy: Math.sin(a + off) * 260, dmg: base * 0.5, src: 'arrow', w: 'bow', proc: true, split: true, r: 2, life: 0.4, trail: '#e8e0cc', owner: 'player', hit: new Set([e]) });
      }
      if (own('ricochet') && !sh.bounced) {
        const n2 = near(ex, ey, 80, e).filter((f) => !(sh.hit && sh.hit.has(f)))[0];
        if (n2) { const [nx, ny] = U.norm(n2.x - ex, n2.y - (n2.h || 16) / 2 - ey); C.shoot({ kind: 'arrow', x: ex, y: ey + 6, vx: nx * 300, vy: ny * 300, dmg: base * 0.6, src: 'arrow', w: 'bow', proc: true, bounced: true, r: 3, life: 0.5, trail: '#e8d8ff', owner: 'player', hit: new Set([e]) }); G.fx.sparks(ex, ey, 4, '#e8d8ff', 60); sfx('clank'); }
      }
      if (own('galaxy') && info.charged) { RT.galaxy++; if (RT.galaxy % 4 === 0) { sh.gearDone = true; for (let i = 0; i < 3; i++) { const tx = ex + (Math.random() - 0.5) * 30, ty = e.y + (Math.random() - 0.5) * 16, dl = 0.25 + i * 0.15; C.marks.push({ x: tx, y: ty, t: 0, life: dl, r: 12, col: '#a8c8ff' }); C.after(dl, () => { burst(tx, ty - 4, 20, base * 0.8, '#c8d8ff', { el: 'light', src: 'arrow', w: 'bow' }); W().shake(1.5, 0.1); }); } sfx('magic'); } }
    }
  };

  /* ───────── 휘두르기 · 회전 · 주문 · 쓰러뜨림 ───────── */
  const swing0 = C.onSwing;
  C.onSwing = function (p, sw) {
    if (swing0) swing0.apply(this, arguments);
    const P = perks(); if (!P) return;
    RT.swings++;
    sw.gearN = RT.swings;
  };
  const mid0 = C.onSwingMid;
  C.onSwingMid = function (p, sw) {
    if (mid0) mid0.apply(this, arguments);
    const P = perks(), s = S(), d = G.st.derive(s), a = U.angle(p.face[0], p.face[1]);
    const last = sw.stage === (s.skills.sw_combo ? 3 : 2) || sw.stage === 2 || sw.lunge;
    if (P.cleave && last) wave(p, a, { dmg: d.atk * 0.55, col: '#e8f0ff' });
    if (P.twinfang && G.stance && p.t - G.stance.ST.swapAt < 1.5 && !RT.twinUsed) { RT.twinUsed = true; wave(p, a, { dmg: d.atk * 0.55, col: '#ffe8a8' }); }
    if (P.quake && last) quakeAt(p.x + Math.cos(a) * 16, p.y + Math.sin(a) * 12, 26 + (grade(s.equip.sword) >= 4 ? 6 : 0), d.atk * 0.5);
    if (P.aurum && sw.gearN % 3 === 0) { wave(p, a, { dmg: d.atk * 0.9, col: '#ffe066', pierce: 99, sp: 280, life: 0.45, big: 1.5 }); sfx('beam'); }
    if (P.skyrend && sw.gearN % 4 === 0) { wave(p, a, { dmg: d.atk * 1.1, col: '#c8f0ff', pierce: 99, sp: 320, life: 0.5, big: 2 }); sfx('whoosh'); G.fx.ring(p.x, p.y - 8, '#c8f0ff', 18, 0.3, 2); }
  };
  const spin0 = C.onSpin;
  C.onSpin = function (p, sp) {
    if (spin0) spin0.apply(this, arguments);
    const P = perks(), d = G.st.derive(S());
    if (P.quake) C.after(0.12, () => quakeAt(p.x, p.y, 40, d.atk * 0.6));
  };
  const cast0 = C.onCast;
  C.onCast = function (p, id, d, a) {
    if (cast0) cast0.apply(this, arguments);
    if (RT.inEcho) return;
    const P = perks(), s = S(), sp = D.SPELLS[id];
    RT.casts++;
    const cost = sp ? Math.round(sp.mp * d.mpCost) : 0;
    if (P.rune && RT.casts % 4 === 0 && cost) { s.mp = Math.min(d.mpMax, s.mp + cost); G.fx.float(p.x, p.y - 30, '룬', '#8ad8ff', { life: 0.6 }); G.fx.ring(p.x, p.y - 6, '#8ad8ff', 14, 0.3, 1); }
    if (P.overload && Math.random() < 0.12) { if (cost) s.mp = Math.min(d.mpMax, s.mp + cost); RT.boostT = 0.6; G.fx.float(p.x, p.y - 30, '넘치는 마력!', '#c8a8ff', { life: 0.8 }); G.fx.glow(p.x, p.y - 10, '#c8a8ff', 14, 30); sfx('fever'); }
    const echo = (delay) => C.after(delay, () => { RT.inEcho = true; try { C.castSpell(p, id, G.st.derive(S())); } finally { RT.inEcho = false; } });
    if (P.mirror && Math.random() < 0.25) { echo(0.18); G.fx.float(p.x, p.y - 30, '거울 영창', '#e8e0ff', { life: 0.6 }); }
    if (P.origin && RT.casts % 3 === 0) { echo(0.22); RT.circle = { x: p.x, y: p.y, t: 0, col: '#fff0a8' }; sfx('crystal'); }
    if (P.star && RT.casts % 5 === 0) {
      const tg = foes().sort((x1, x2) => U.dist(p.x, p.y, x1.x, x1.y) - U.dist(p.x, p.y, x2.x, x2.y))[0];
      if (tg && U.dist(p.x, p.y, tg.x, tg.y) < 200) { const tx = tg.x, ty = tg.y; C.marks.push({ x: tx, y: ty, t: 0, life: 0.4, r: 14, col: '#fff0a8' }); C.after(0.4, () => { burst(tx, ty - 4, 22, (4 + s.lv * 0.25) * d.magMul, '#fff0a8', { el: 'light', src: 'spell', w: 'magic' }); W().shake(2, 0.12); sfx('explode'); }); }
    }
    if (P.chaos) {
      const k = Math.floor(Math.random() * 3), tx = p.x + Math.cos(a) * 50, ty = p.y + Math.sin(a) * 40, amt = (4 + s.lv * 0.25) * d.magMul * 0.4;
      C.after(0.25, () => { if (k === 0) burst(tx, ty, 22, amt, '#ff8a3a', { el: 'fire', src: 'spell', w: 'magic' }); else if (k === 1) burst(p.x, p.y - 6, 30, amt, '#bfe8ff', { el: 'ice', src: 'spell', w: 'magic' }); else { const tg = near(tx, ty, 70)[0]; if (tg) strike(tg, amt * 1.4); } });
    }
    if (P.kindle && sp && (id === 'fire' || id === 'meteor')) RT.kindle = W().t + 1.2;
  };
  const kill0 = C.onKill;
  C.onKill = function (e, info) {
    if (kill0) kill0.apply(this, arguments);
    if (info.proc && !info.w) return;
    const w = wOf(info), P = perks(), p = W().player; if (!p) return;
    if (P.rift && w === 'sword') { zone({ kind: 'rift', x: e.x, y: e.y - 4, life: 1.6, r: 50, amt: G.st.derive(S()).atk * 0.25 }); sfx('drain'); }
    if (P.bloodmoon && w === 'sword') { p.frenzyT = Math.max(p.frenzyT || 0, 2.5); G.fx.glow(p.x, p.y - 10, '#ff5a6a', 10, 30); }
    if (P.execute && w === 'sword' && e.maxHp > 6) G.fx.float(e.x, e.y - 30, '끝!', '#ff8a96', { life: 0.6 });
  };
  const shoot0 = C.onShoot;
  C.onShoot = function (o) {
    o = (shoot0 ? shoot0.apply(this, arguments) : null) || o;
    if (!o || o.owner === 'foe' || o.foe || o.proc) return o;
    const d = G.st.derive(S()), P = perks(), p = W().player;
    if (o.src === 'arrow') {
      o.life = (o.life || 0.9) * (d.bowRange || 1);
      if (P.gale && !o.charged) { o.vx *= 1.3; o.vy *= 1.3; o.power = (o.power || 0.5) * 1.6; }
      if (P.moonpierce && Math.random() < d.crit) { o.crit = true; o.pierce = 99; o.trail = '#c8d0ff'; }
      if (P.starshot && o.charged && !o.homing) { let best = null, bd = 1e9; const a = Math.atan2(o.vy, o.vx); for (const f of foes()) { const dd = U.dist(o.x, o.y, f.x, f.y); const da = Math.abs(U.angDiff(a, Math.atan2(f.y - o.y, f.x - o.x))); if (dd < 220 && da < 0.8 && dd + da * 80 < bd) { bd = dd + da * 80; best = f; } } if (best) { o.homing = 0.35; o.target = best; } }
      if (P.sunfire && o.charged) o.sunfire = true;
      if (P.swiftshot && p && p.t - (p.rollEndT || -9) < 0.5 && !o.charged && !o.skill) { o.charged = true; o.dmg *= 2; o.trail = '#fff4c0'; }
      if (P.rapid && !o.skill) { RT.shots++; if (RT.shots % 3 === 0) { const c2 = Object.assign({}, o, { proc: true, hit: new Set() }); const a = Math.atan2(o.vy, o.vx) + (Math.random() - 0.5) * 0.12, sp = U.len(o.vx, o.vy); c2.vx = Math.cos(a) * sp; c2.vy = Math.sin(a) * sp; C.after(0.07, () => { C.shoot(c2); sfx('shoot'); }); } }
    } else if (o.src === 'spell') {
      o.life = (o.life || 0.8) * (d.spellRange || 1);
      if (P.kindle && o.el === 'fire') o.kindle = true;
    }
    return o;
  };
  // 활 · 주문이 남기는 불길: 날아가는 동안 · 터진 자리
  const sh0 = C.Shot && C.Shot.prototype.update;
  if (sh0) C.Shot.prototype.update = function (dt, Wd) {
    if (this.sunfire && !this.dead) { this.sfT = (this.sfT || 0) - dt; if (this.sfT <= 0) { this.sfT = 0.06; zone({ kind: 'fire', x: this.x, y: this.y + 4, life: 1.5, r: 9, amt: G.st.derive(S()).bowAtk * 0.18 }); } }
    const was = this.dead;
    const r = sh0.apply(this, arguments);
    if (this.kindle && this.dead && !was) zone({ kind: 'fire', x: this.x, y: this.y + 4, life: 1.2, r: 18, amt: (4 + S().lv * 0.25) * G.st.derive(S()).magMul * 0.2 });
    return r;
  };

  /* ───────── 맞을 때 · 완벽 회피 ───────── */
  const hm0 = C.hurtMod;
  C.hurtMod = function (p, q, src, opt) {
    let r = hm0 ? hm0.apply(this, arguments) : true;
    if (r === false) return false;
    if (typeof r === 'number') q = r;
    const P = perks(), t = W().t;
    if (P.starveil && RT.veilT <= 0) { RT.veilT = 12; G.fx.ring(p.x, p.y - 10, '#fff0a8', 20, 0.4, 2); G.fx.sparks(p.x, p.y - 10, 10, '#fff0a8', 90); G.fx.float(p.x, p.y - 30, '별의 장막', '#fff0a8', { life: 0.7 }); sfx('crystal'); p.inv = Math.max(p.inv, 0.4); return false; }
    if (P.stalwart && opt) opt.noKnock = true;
    if (P.scales && RT.scalesT <= 0 && q > 1) { RT.scalesT = 10; q = Math.max(1, Math.ceil(q / 2)); G.fx.float(p.x, p.y - 30, '비늘', '#a8e8e0', { life: 0.6 }); G.fx.sparks(p.x, p.y - 10, 6, '#a8e8e0', 60); }
    if (P.radiance && t - (RT.radT || -99) > 6) { RT.radT = t; const d = G.st.derive(S()); C.after(0.05, () => { burst(p.x, p.y - 8, 40, d.atk * 1.0, '#fff0c8', { el: 'light', src: 'beam', w: 'sword', stun: 0.8 }); W().shake(2, 0.15); sfx('white'); }); }
    return q;
  };
  C.onPerfect = (function (pf0) {
    return function (p) {
      if (pf0) pf0.apply(this, arguments);
      const P = perks();
      if (P.flow) { p.stamina = Math.min(p.staminaMax, p.stamina + 30); G.fx.float(p.x, p.y - 40, '기력 +30', '#8ae07a', { life: 0.6 }); }
      if (P.shadowstep) { p.cloakT = 1.5; p.critNext = true; G.fx.glow(p.x, p.y - 10, '#8a6ad8', 12, 20); }
    };
  })(C.onPerfect);
  // 막기 (방패): 버팀 · 성벽
  const blk0 = C.onBlock;
  C.onBlock = function (p, src) {
    if (blk0) blk0.apply(this, arguments);
    const P = perks();
    if (P.brace) p.stamina = Math.min(p.staminaMax, p.stamina + 10);
    if (P.aegis) { G.fx.ring(p.x, p.y - 8, '#fff0c8', 26, 0.3, 2); for (const f of near(p.x, p.y - 8, 34)) { const [nx, ny] = U.norm(f.x - p.x, f.y - p.y); f.kx = nx * 220; f.ky = ny * 220; f.stunT = Math.max(f.stunT || 0, 0.5); } }
  };

  /* ───────── 매 프레임: 장판 · 시간 ───────── */
  const up0 = C.update;
  C.update = function (dt) {
    const r = up0.apply(this, arguments);
    const p = W() && W().player; if (!p) return r;
    if (RT.momT > 0) { RT.momT -= dt; if (RT.momT <= 0) RT.mom = 0; }
    if (RT.scalesT > 0) RT.scalesT -= dt;
    if (RT.veilT > 0) { RT.veilT -= dt; if (RT.veilT <= 0 && perks().starveil) { G.fx.ring(p.x, p.y - 10, '#fff0a8', 16, 0.4, 1); sfx('crystal'); } }
    if (RT.boostT > 0) RT.boostT -= dt;
    if (p.cloakT > 0) { p.cloakT -= dt; if (Math.random() < dt * 20) G.fx.part({ x: p.x + (Math.random() - 0.5) * 12, y: p.y - Math.random() * 18, z: 0, vz: 12, g: 0, life: 0.4, col: '#6a5aa8', size: 1 }); }
    if (RT.circle) { RT.circle.t += dt; if (RT.circle.t > 0.7) RT.circle = null; }
    if (RT.flash) { RT.flash.t += dt; if (RT.flash.t > RT.flash.life) RT.flash = null; }
    if (G.stance && G.stance.ST.swapAt !== RT.lastSwap) { RT.lastSwap = G.stance.ST.swapAt; RT.twinUsed = false; }
    // 별의 장막이 차 있으면 별 하나가 둘레를 돈다
    if (perks().starveil && RT.veilT <= 0 && Math.random() < dt * 10) { const a = W().t * 3; G.fx.part({ x: p.x + Math.cos(a) * 11, y: p.y - 10 + Math.sin(a) * 5, z: 0, vz: 0, g: 0, life: 0.25, col: '#fff0a8', size: 1, glow: true }); }
    for (const z of RT.zones) {
      z.t += dt; z.tick -= dt;
      if (z.kind === 'rift') {
        for (const f of near(z.x, z.y, z.r)) if (!f.boss && !f.heavy) { const [nx, ny] = U.norm(z.x - f.x, z.y - f.y); f.kx = nx * 70; f.ky = ny * 70; }
        if (Math.random() < dt * 30) { const a = Math.random() * Math.PI * 2, rr = z.r * (0.4 + Math.random() * 0.6); G.fx.part({ x: z.x + Math.cos(a) * rr, y: z.y + Math.sin(a) * rr * 0.5, z: 2, vx: -Math.cos(a) * rr * 2, vy: -Math.sin(a) * rr, vz: 0, g: 0, life: 0.4, col: Math.random() < 0.5 ? '#c49bff' : '#5a3a8a', size: 1, glow: true }); }
      }
      if (z.tick <= 0) {
        z.tick = z.kind === 'rift' ? 0.3 : 0.4;
        for (const f of near(z.x, z.y, z.kind === 'rift' ? z.r * 0.6 : z.r)) if (!(z.kind === 'fire' && f.fly)) procHit(f, z.amt, z.kind === 'rift' ? { el: 'dark', src: 'beam', w: 'sword' } : { el: 'fire', src: 'spell', w: 'magic' });
      }
    }
    RT.zones = RT.zones.filter((z) => z.t < z.life);
    return r;
  };

  /* ───────── 그리기: 바닥 (장판 · 마법진) ───────── */
  function magicCircle(g, x, y, r, col, rot, alpha) {
    g.save(); g.globalAlpha = alpha; g.strokeStyle = col; g.lineWidth = 1;
    g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(x, y, r * 0.72, r * 0.32, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = col;
    for (let i = 0; i < 8; i++) { const a = rot + i / 8 * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * r * 0.86) - 1, Math.round(y + Math.sin(a) * r * 0.39), 2, 1); }
    for (let i = 0; i < 3; i++) { const a = -rot * 1.5 + i / 3 * Math.PI * 2, b = a + Math.PI * 2 / 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.32); g.lineTo(x + Math.cos(b) * r * 0.72, y + Math.sin(b) * r * 0.32); g.stroke(); }
    g.globalAlpha = alpha * 0.18; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  function drawUnder(g, cx, cy) {
    const p = W().player, t = W().t;
    for (const z of RT.zones) {
      const k = z.t / z.life, x = Math.round(z.x - cx), y = Math.round(z.y - cy);
      if (z.kind === 'fire') { g.globalAlpha = 0.5 * (1 - k); g.fillStyle = '#ff7a2a'; g.beginPath(); g.ellipse(x, y, z.r, z.r * 0.45, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.6 * (1 - k); g.fillStyle = '#ffd84a'; g.beginPath(); g.ellipse(x, y, z.r * 0.5, z.r * 0.22, 0, 0, Math.PI * 2); g.fill(); if (Math.random() < 0.3) G.fx.part({ x: z.x + (Math.random() - 0.5) * z.r, y: z.y, z: 0, vz: 30, g: 0, life: 0.3, col: Math.random() < 0.5 ? '#ffb040' : '#ff5a2a', size: 1, glow: true }); }
      else if (z.kind === 'rift') { const rr = z.r * 0.6 * Math.min(1, z.t * 6) * (1 - Math.max(0, k - 0.8) * 5); g.globalAlpha = 0.55; g.fillStyle = '#1a0a2a'; g.beginPath(); g.ellipse(x, y, rr, rr * 0.45, 0, 0, Math.PI * 2); g.fill(); magicCircle(g, x, y, rr, '#c49bff', -t * 4, 0.8); }
    }
    g.globalAlpha = 1;
    if (!p) return;
    // 주문을 거는 동안 발밑 마법진 (주문 색)
    let circ = null;
    if (p.state === 'cast') { const sp = D.SPELLS[p.castSpell]; circ = { col: (sp && sp.col) || '#a8c8ff', k: Math.min(1, p.st / 0.12), r: 14 }; }
    else if (p.state === 'skill' && p.skill && G.stance && G.stance.ASK[p.skill.id] && G.stance.ASK[p.skill.id].w === 'magic') circ = { col: (G.vfx && G.vfx.skillCol && G.vfx.skillCol(p.skill.id)) || '#a8c8ff', k: Math.min(1, p.skill.t / 0.1), r: 16 + (G.stance.ASK[p.skill.id].grade || 1) * 2 };
    else if (p.state === 'sp' && p.spx && G.data.SPECIALS[p.spx.id] && G.data.SPECIALS[p.spx.id].type === 'magic') circ = { col: (G.prog.GRADES[G.data.SPECIALS[p.spx.id].grade] || {}).glow || '#fff0a8', k: Math.min(1, p.spx.t / 0.15), r: 22 };
    // 마법진의 꼴은 마도구마다 다르다 (vfx.js)
    const circle = G.vfx && G.vfx.circle ? (g2, x, y, r, col, rot, a) => G.vfx.circle(g2, x, y, r, col, rot, a, S().equip.focus) : magicCircle;
    if (circ) circle(g, Math.round(p.x - cx), Math.round(p.y - cy), circ.r * (0.6 + circ.k * 0.4), circ.col, t * 3, 0.75 * circ.k);
    if (RT.circle) { const c = RT.circle, k = c.t / 0.7; circle(g, Math.round(c.x - cx), Math.round(c.y - cy), 18 + k * 10, c.col, t * 4, 0.9 * (1 - k)); }
  }

  /* ───────── 손에 든 무기 ───────── */
  const SIL = new Map();
  const silOf = (img, col) => { const k = img; let m = SIL.get(k); if (!m) { m = {}; SIL.set(k, m); } return m[col] || (m[col] = X.silhouette(img, col)); };
  const easeOut3 = (k) => 1 - Math.pow(1 - k, 3);
  function swordBody(g, hx, hy, a, s, reach, glowK, lift) {
    const id = s.equip.sword || 'sw_wood', S0 = swordImg(id, reach);
    g.save(); g.translate(hx, hy + 2 - (lift || 0)); g.rotate(a);
    g.drawImage(S0.img, -3 - S0.ox, -S0.oy);
    if (glowK > 0) { g.globalAlpha = glowK; g.drawImage(silOf(S0.img, '#fff2a8'), -3 - S0.ox, -S0.oy); g.globalAlpha = 1; }
    // 스킬을 쓸 때: 날을 따라 흐르는 빛
    if (RT.flash && RT.flash.w === 'sword') { const k = RT.flash.t / RT.flash.life, x = -3 + 8 + k * S0.L; g.globalAlpha = 1 - k; g.fillStyle = '#ffffff'; g.fillRect(Math.round(x), -2, 3, 4); g.fillRect(Math.round(x) + 1, -3, 1, 6); g.globalAlpha = 1; }
    g.restore();
  }
  function trailArc(g, hx, hy, a0, a1, r0, r1, k, col, gr, spin) {
    g.save();
    const fade = 1 - (k > 0.8 ? (k - 0.8) * 4 : 0);
    const quad = (aa, ab, ra, rb) => { g.beginPath(); g.moveTo(hx + Math.cos(aa) * ra, hy + 2 + Math.sin(aa) * ra * 0.8); g.lineTo(hx + Math.cos(aa) * rb, hy + 2 + Math.sin(aa) * rb * 0.8); g.lineTo(hx + Math.cos(ab) * rb, hy + 2 + Math.sin(ab) * rb * 0.8); g.lineTo(hx + Math.cos(ab) * ra, hy + 2 + Math.sin(ab) * ra * 0.8); g.fill(); };
    const n = 14;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, aa = U.lerp(a0, a1, t0), ab = U.lerp(a0, a1, t1);
      const base = (spin ? 0.42 : 0.6) * t1 * t1 * fade;
      if (gr >= 4) { g.globalAlpha = base * 0.45; g.fillStyle = gr >= 5 ? '#ffc84a' : col; quad(aa, ab, r1 - 1, r1 + 3); }
      g.globalAlpha = base * 0.7; g.fillStyle = col; quad(aa, ab, r0, r1 - 2);
      g.globalAlpha = base * 1.4; g.fillStyle = '#ffffff'; quad(aa, ab, r1 - 2, r1);
      // 속도선
      if (i % 3 === 0 && t1 > 0.4) { g.globalAlpha = base * 0.9; g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy + 2, r1 + 3, Math.min(aa, ab), Math.max(aa, ab)); g.stroke(); }
    }
    g.restore();
    // 날 모양마다 더하는 것 (불 혀 · 번개 · 무지개 · 심연 …) — vfx.js
    if (G.vfx && G.vfx.trail) G.vfx.trail(g, hx, hy, a0, a1, r0, r1, k, col, gr, spin);
  }
  function bowBody(g, hx, hy, a, s, pull, full, t) {
    const B = bowImg(s.equip.bow || 'bw_short');
    g.save(); g.translate(hx, hy + 3); g.rotate(a);
    // 활 몸 (당길수록 휘어 든다)
    g.save(); g.translate(8, 0); g.scale(1 - pull * 0.14, 1); g.drawImage(B.img, -B.gx, -B.cy); g.restore();
    const tipX = 8 + (B.tipX - B.gx) * (1 - pull * 0.14), nock = 8 - 2 - pull * 7;
    // 시위
    const vib = RT.relT != null && t - RT.relT < 0.2 ? Math.sin((t - RT.relT) * 70) * 2 * (1 - (t - RT.relT) / 0.2) : 0;
    g.strokeStyle = B.string; g.lineWidth = 1; g.beginPath(); g.moveTo(tipX, -B.half + 0.5); g.lineTo(pull > 0 ? nock : tipX - 1 + vib, 0.5); g.lineTo(tipX, B.half + 0.5); g.stroke();
    if (B.twin) { g.globalAlpha = 0.6; g.beginPath(); g.moveTo(tipX - 1, -B.half + 1.5); g.lineTo(pull > 0 ? nock - 1 : tipX - 2, 1.5); g.lineTo(tipX - 1, B.half - 0.5); g.stroke(); g.globalAlpha = 1; }
    // 걸친 화살
    if (pull > 0) {
      const d = G.st.derive(s), el = d.bowEl, hc = el === 'fire' ? '#ffb040' : el === 'ice' ? '#bfe8ff' : el === 'light' ? '#fff0a8' : el === 'bolt' ? '#ffe066' : el === 'poison' ? '#9ae86a' : '#e8e8f0';
      g.fillStyle = '#c8a878'; g.fillRect(Math.round(nock), 0, 17, 1);
      g.fillStyle = hc; g.fillRect(Math.round(nock) + 16, -1, 2, 3); g.fillRect(Math.round(nock) + 18, 0, 1, 1);
      g.fillStyle = '#ff8a8a'; g.fillRect(Math.round(nock) - 1, -1, 3, 1); g.fillRect(Math.round(nock) - 1, 1, 3, 1);
      if (full) { const gl = 0.5 + Math.sin(t * 24) * 0.3; g.globalAlpha = gl; g.fillStyle = '#fff8c0'; g.beginPath(); g.arc(Math.round(nock) + 18, 0.5, 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }
    g.restore();
  }
  function staffBody(g, hx, hy, a, s, glowCol, k, t) {
    const F = focusImg(s.equip.focus || 'fc_twig');
    // 손을 겨눈 쪽으로 뻗어 지팡이 머리가 겨눈 쪽을 향한다
    const ux = Math.cos(a), uy = Math.sin(a);
    const bx = hx + ux * 5, by = hy + 4 + uy * 3;
    g.save(); g.translate(bx, by);
    if (F.tome) { g.translate(ux * 4, -6 + Math.sin(t * 4) * 1.5); g.drawImage(F.img, -Math.round(F.img.width / 2), -Math.round(F.img.height / 2)); }
    else { g.rotate(a + Math.PI / 2); g.drawImage(F.img, -F.hx, -F.hy); }
    g.restore();
    // 머리 끝 빛
    const tipD = F.tome ? 6 : F.hy - F.tipY;
    const tx = F.tome ? bx + ux * 4 : bx + ux * tipD, ty = F.tome ? by - 6 : by + uy * tipD;
    if (k > 0) {
      g.globalAlpha = 0.35 * k; g.fillStyle = glowCol; g.beginPath(); g.arc(tx, ty, 5 + Math.sin(t * 30) * 1.5, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.9 * k; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(tx, ty, 1.5 + k, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      if (Math.random() < 0.5) { const aa = Math.random() * Math.PI * 2; G.fx.part({ x: tx + W().rcx + Math.cos(aa) * 10, y: ty + W().rcy + Math.sin(aa) * 8 + 11, z: 11, vx: -Math.cos(aa) * 40, vy: -Math.sin(aa) * 32, vz: 0, g: 0, life: 0.22, col: glowCol, size: 1, glow: true }); }
      if (G.vfx && G.vfx.staffTip) G.vfx.staffTip(tx + W().rcx, ty + W().rcy + 11, k);
    }
  }
  const ANG4 = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
  function drawWeapon(g, p, cx, cy) {
    const s = S(); if (!s) return;
    const d = G.st.derive(s), t = W().t;
    const hx = Math.round(p.x - cx), hy = Math.round(p.y - cy - 11 - (p.jz || 0));
    const fa = Math.atan2(p.face[1], p.face[0]);
    const spM = p.state === 'sp' && p.spx && G.specials && G.specials.MOVES[p.spx.id];
    const spDraw = spM ? (spM.draw || 'sword') : null;
    const ask = p.state === 'skill' && p.skill && G.stance ? G.stance.ASK[p.skill.id] : null;
    const gr = d.grade || 1, GC = G.prog ? G.prog.GRADES[gr] : null;
    const elCol = d.el === 'fire' ? '#ffb070' : d.el === 'ice' ? '#bfe8ff' : d.el === 'light' ? '#fff8d0' : d.el === 'bolt' ? '#fff08a' : d.el === 'poison' ? '#9ae86a' : d.el === 'dark' ? '#c49bff' : d.el === 'wind' ? '#c8f0ff' : null;
    const tcol = elCol || (gr >= 2 && GC ? GC.glow : '#ffffff');
    // ── 검 ──
    const swordState = (p.state === 'attack' && p.swing) || p.state === 'spin' || p.state === 'charge' || p.state === 'dash' || spDraw === 'sword' || spDraw === 'spin' || (ask && ask.w === 'sword');
    if (swordState) {
      let a, reach = d.reach, tr = null, lift = 0;
      if (p.state === 'attack') {
        const sw = p.swing, k = Math.min(1, sw.t / sw.dur), sgn = Math.sign(sw.a1 - sw.a0) || 1;
        reach = sw.reach;
        if (sw.stage === 2 || sw.lunge) {
          // 찌르기: 뒤로 당겼다가 쭉 내민다
          a = U.lerp(sw.a0, sw.a1, 0.5);
          const off = k < 0.22 ? -4 * (k / 0.22) : -4 + 12 * easeOut3((k - 0.22) / 0.78);
          swordBody(g, hx + Math.cos(a) * off, hy + Math.sin(a) * off * 0.8, a, s, reach, p.chargeFull ? 0.4 : 0);
          if (k > 0.22 && k < 0.9) { g.save(); g.globalAlpha = 0.55 * (1 - k); g.fillStyle = tcol; g.translate(hx, hy + 2); g.rotate(a); g.fillRect(6, -2, reach + 8, 4); g.globalAlpha = 0.8 * (1 - k); g.fillStyle = '#ffffff'; g.fillRect(10, -1, reach + 4, 1); for (let i = 0; i < 3; i++) g.fillRect(4 + i * 7, (i - 1) * 4, 6, 1); g.restore(); }
          drawExtras(g, p, hx, hy);
          return;
        }
        const wind = 0.32;
        if (k < 0.16) a = sw.a0 - sgn * wind * easeOut3(k / 0.16);
        else a = U.lerp(sw.a0 - sgn * wind, sw.a1, easeOut3((k - 0.16) / 0.84));
        if (k >= 0.16) tr = { a0: sw.a0 - sgn * wind * 0.5, a1: a, k };
        lift = k < 0.16 ? 2 * (k / 0.16) : 2 * (1 - k);
      } else if (p.state === 'spin') { const sp = p.spin; a = sp.a0 + (sp.t / sp.dur) * Math.PI * 2 * sp.turns; reach = sp.reach; tr = { a0: a - 2.4, a1: a, k: 0.5, spin: true }; }
      else if (p.state === 'charge') { a = fa + Math.PI * 0.85 + Math.sin(t * (p.chargeFull ? 40 : 8)) * 0.04; lift = 3; }
      else if (p.state === 'dash') { a = Math.atan2(p.dash.dir[1], p.dash.dir[0]); tr = { a0: a - 0.3, a1: a + 0.3, k: 0.5 }; }
      else if (spDraw === 'spin') { a = p.spinA || 0; reach = d.reach + 6; tr = { a0: a - 2.6, a1: a, k: 0.5, spin: true }; }
      else if (spDraw === 'sword') { a = fa + Math.sin(p.t * 40) * 0.8; tr = { a0: a - 1.4, a1: a, k: 0.5 }; }
      else if (ask) {
        // 검 스킬: 돌진형은 앞으로, 나머지는 크게 내려친다
        const K = p.skill, k = Math.min(1, K.t / Math.max(0.05, K.dur));
        if (K.dir) { a = Math.atan2(K.dir[1], K.dir[0]); tr = { a0: a - 0.35, a1: a + 0.35, k: 0.4 }; }
        else if (K.n > 1) {
          // 여러 번 베는 스킬(검무): 좌우로 번갈아
          const kk = (k * K.n) % 1, sg = Math.floor(k * K.n) % 2 ? -1 : 1;
          a = fa + sg * U.lerp(-1.1, 1.1, easeOut3(kk)); tr = { a0: fa - sg * 1.1, a1: a, k: kk }; lift = 2;
        } else { a = k < 0.3 ? fa - 1.6 - 0.4 * (k / 0.3) : U.lerp(fa - 2.0, fa + 1.3, easeOut3((k - 0.3) / 0.7)); if (k >= 0.3) tr = { a0: fa - 1.8, a1: a, k }; lift = k < 0.3 ? 4 * (k / 0.3) : 4 * (1 - k); }
      }
      if (tr) trailArc(g, hx, hy - lift, tr.a0, tr.a1, 6 - Math.min(3, gr * 0.5), reach + 1 + gr * 0.8, tr.k, tcol, gr, tr.spin);
      swordBody(g, hx, hy, a, s, reach, p.chargeFull ? 0.35 + Math.sin(t * 20) * 0.15 : (d.swordGlow && Math.random() < 0.15 ? 0.25 : 0), lift);
      if (gr >= 5 && tr && tr.k < 0.8) { g.globalAlpha = 0.5; g.fillStyle = '#fff8d0'; g.beginPath(); g.arc(hx + Math.cos(a) * (reach + 2), hy - lift + 2 + Math.sin(a) * (reach + 2) * 0.8, 3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }
    // ── 활 ──
    else if (p.state === 'bow' || spDraw === 'bow' || (ask && ask.w === 'bow')) {
      let a, pull, full = false;
      if (p.state === 'bow') { a = p.aim; pull = Math.min(1, p.bowT / (d.draw + 0.35)); full = !!p.bowFull; }
      else if (ask) { const K = p.skill, k = Math.min(1, K.t / Math.max(0.05, K.dur)); a = K.dir ? Math.atan2(-K.dir[1], -K.dir[0]) : fa; pull = k < 0.55 ? k / 0.55 : 0; full = k > 0.4 && k < 0.55; }
      else { a = p.aim != null ? p.aim : fa; pull = Math.min(1, p.spx.t / 0.4); full = pull >= 1; }
      // 스킬 · 필살기마다 다른 자세 (하늘로 · 무릎 꿇고 · 빠르게 …) — vfx.js
      const pose = p.state !== 'bow' && G.vfx && G.vfx.bowPose ? G.vfx.bowPose(p, ask ? p.skill : null, spDraw === 'bow' ? p.spx : null) : null;
      if (pose) { if (pose.a != null) a = pose.a; if (pose.pull != null) pull = pose.pull; if (pose.full != null) full = pose.full; }
      bowBody(g, hx, hy, a, s, pull, full, t);
      if (p.state === 'bow') { g.globalAlpha = 0.3 + (full ? 0.2 : 0); g.fillStyle = full ? '#fff8c0' : '#ffffff'; for (let i = 2; i < 10; i++) g.fillRect(Math.round(hx + Math.cos(a) * i * 9), Math.round(hy + 3 + Math.sin(a) * i * 9), 1, 1); g.globalAlpha = 1; }
    }
    // ── 마법 (주문 · 마법 스킬 · 마법 필살기) ──
    else if (p.state === 'cast' || spDraw === 'cast' || (ask && ask.w === 'magic')) {
      const sp = p.state === 'cast' ? D.SPELLS[p.castSpell] : null;
      const col = sp ? sp.col : spDraw === 'cast' ? ((G.prog.GRADES[(G.data.SPECIALS[p.spx.id] || {}).grade || 1] || {}).glow || '#fff0a8') : '#a8c8ff';
      const k = p.state === 'cast' ? Math.min(1, p.st / 0.14) : 1;
      const sa = G.vfx && G.vfx.staffAngle ? G.vfx.staffAngle(p, fa) : fa;   // 하늘로 드는 주문 · 돌리는 주문 …
      if (s.equip.focus) staffBody(g, hx, hy, sa, s, col, k, t);
      else { g.globalAlpha = 0.6; g.fillStyle = col; g.beginPath(); g.arc(hx + Math.cos(sa) * 6, hy - 2 + Math.sin(sa) * 4, 4 + Math.sin(t * 30) * 1.5, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; if (G.vfx && G.vfx.staffTip) G.vfx.staffTip(hx + Math.cos(sa) * 6 + W().rcx, hy - 2 + Math.sin(sa) * 4 + W().rcy + 11, k); }
    }
    // 쏜 직후: 활이 잠깐 남아 시위가 떤다
    else if (RT.relT != null && t - RT.relT < 0.22 && p.state !== 'roll' && C.weapon && C.weapon() === 'bow' && s.equip.bow) bowBody(g, hx, hy, RT.relA, s, 0, false, t);
    drawExtras(g, p, hx, hy);
  }
  /** 갈고리 · 든 물건 · 꺼낸 물건 (예전과 같다) · 기세 표시 */
  function drawExtras(g, p, hx, hy) {
    const cx = hx - p.x, cy = hy - p.y;   // 화면 좌표 → 세계 차이
    void cx; void cy;
    if (p.hook) {
      const h = p.hook, rx = W().rcx, ry = W().rcy;
      g.strokeStyle = '#a8a8b8'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(hx, hy + 2); g.lineTo(Math.round(h.x - rx), Math.round(h.y - ry)); g.stroke();
      g.fillStyle = '#e8e8f0'; g.fillRect(Math.round(h.x - rx) - 2, Math.round(h.y - ry) - 2, 4, 4);
    }
    if (p.carry && p.carry.img) g.drawImage(p.carry.img, hx - p.carry.img.width / 2, hy - 14 - p.carry.img.height / 2);
    if (p.state === 'hold' && p.holdItem && G.ui.itemIcon) { const ic = G.ui.itemIcon(p.holdItem); const bob = Math.sin(W().t * 4); g.globalAlpha = 0.35; g.fillStyle = '#fff8c0'; g.beginPath(); g.arc(hx, hy - 20, 9 + bob, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; const sz = ic.width > 16 ? 0.5 : 1; g.drawImage(ic, Math.round(hx - ic.width * sz / 2), Math.round(hy - 20 - ic.height * sz / 2 + bob), ic.width * sz, ic.height * sz); }
    if (RT.mom > 0 && perks().momentum) { for (let i = 0; i < RT.mom; i++) { g.fillStyle = i < 3 ? '#ffd8a8' : '#ff9a5a'; g.fillRect(hx - RT.mom * 2 + i * 4 + 1, hy - 22, 2, 2); } }
  }
  /** 쉬는 동안 · 걷는 동안: 든 무기를 등에 멘다 */
  function drawCarry(g, p, cx, cy) {
    const s = S(); if (!s || !p || p.carry) return;
    if (!['idle', 'walk', 'hurt', 'roll', 'jump', 'lift'].includes(p.state)) return;
    if (p.state === 'idle' && RT.relT != null && W().t - RT.relT < 0.22) return;
    const w = C.weapon ? C.weapon() : 'sword';
    const bob = p.state === 'walk' ? Math.round(Math.sin((p.walkT || 0) * Math.PI * 3.6) * 0.6) : 0;
    const hx = Math.round(p.x - cx), hy = Math.round(p.y - cy - 12 - (p.jz || 0)) + bob;
    const flip = p.dir === 'left' ? -1 : 1;
    g.save();
    if (w === 'sword' && s.equip.sword) {
      const S0 = swordImg(s.equip.sword, G.st.derive(s).reach);
      const a = p.dir === 'up' ? -2.25 : p.dir === 'down' ? 2.2 : (flip > 0 ? 2.45 : 0.7);
      const bx = p.dir === 'up' ? hx - 3 : p.dir === 'down' ? hx + 4 : hx - flip * 3;
      g.translate(bx, hy - 6); g.rotate(p.dir === 'up' ? 0.95 : a); g.drawImage(S0.img, -2 - S0.ox, -S0.oy);
    } else if (w === 'bow' && s.equip.bow) {
      const B = bowImg(s.equip.bow);
      g.translate(hx + (p.dir === 'left' ? 3 : p.dir === 'right' ? -3 : 1), hy - 2); g.rotate(p.dir === 'up' ? -0.5 : 0.5); g.drawImage(B.img, -B.gx, -B.cy);
    } else if (w === 'magic' && s.equip.focus) {
      const F = focusImg(s.equip.focus);
      if (F.tome) { g.translate(hx + (p.dir === 'left' ? 8 : -8), hy - 12 + Math.sin(W().t * 3) * 1.5); g.scale(0.75, 0.75); g.drawImage(F.img, -F.img.width / 2, -F.img.height / 2); }
      else { g.translate(hx + (p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 3), hy - 1); g.rotate(p.dir === 'up' ? 0.35 : -0.35); g.drawImage(F.img, -F.hx, -F.hy); }
    }
    g.restore();
  }

  /* ───────── 스킬 · 필살기를 쓸 때의 손맛 ───────── */
  const WCOL = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  function flourish(p, w, big, id) {
    RT.flash = { w, t: 0, life: 0.28 };
    if (G.vfx && G.vfx.flourish && G.vfx.flourish(p, w, big, id)) return;   // 스킬 · 필살기마다 다른 시작 (vfx2.js)
    G.fx.ring(p.x, p.y - 8, WCOL[w] || '#ffffff', big ? 30 : 18, 0.3, big ? 3 : 2);
    G.fx.glow(p.x, p.y - 10, WCOL[w] || '#ffffff', big ? 16 : 8, big ? 40 : 24);
    if (w === 'magic') RT.circle = { x: p.x, y: p.y, t: 0.2, col: WCOL.magic };
    for (let i = 0; i < (big ? 14 : 6); i++) { const a = Math.random() * Math.PI * 2; G.fx.part({ x: p.x + Math.cos(a) * 4, y: p.y - 10 + Math.sin(a) * 3, z: 0, vx: Math.cos(a) * 70, vy: Math.sin(a) * 50, vz: 10, g: 0, drag: 3, life: 0.3, col: WCOL[w] || '#ffffff', size: 1, glow: true }); }
  }
  if (G.stance) {
    const used0 = G.stance.used;
    G.stance.used = function (s, id) { const r = used0 ? used0.apply(this, arguments) : undefined; const A = G.stance.ASK[id], p = W().player; if (A && p) flourish(p, A.w, A.grade >= 4, id); return r; };
  }
  if (G.specials && G.specials.start) {
    const st0 = G.specials.start;
    G.specials.start = function (p, id) { const r = st0.apply(this, arguments); const sp = D.SPECIALS[id]; if (sp && p) { flourish(p, sp.type || 'sword', true, 'sp:' + id); W().shake(2.5, 0.2); } return r; };
  }
  // 쏜 순간을 기억 (시위 떨림)
  const shootR = C.onShoot;
  C.onShoot = function (o) {
    o = (shootR ? shootR.apply(this, arguments) : null) || o;
    const p = W() && W().player;
    if (p && o && o.src === 'arrow' && !o.proc && !o.foe && o.owner !== 'foe') { RT.relT = W().t; RT.relA = Math.atan2(o.vy, o.vx); }
    return o;
  };

  /* ───────── 메뉴 ───────── */
  function line(it) {
    if (!it) return '';
    const out = [], gr = it.grade || 1;
    if (it.type === 'sword' && REACH_G[gr]) out.push('[g]사거리 +' + REACH_G[gr] + '[/]');
    if (it.type === 'bow' && BOWR_G[gr] > 1) out.push('[g]사정거리 +' + Math.round((BOWR_G[gr] - 1) * 100) + '%[/]');
    if (it.type === 'focus' && SPR_G[gr] > 1) out.push('[g]주문 거리 +' + Math.round((SPR_G[gr] - 1) * 100) + '%[/]');
    if (it.type === 'armor' && ROLL_G[gr]) out.push('[g]구르기 무적 +' + Math.round(ROLL_G[gr] * 1000) / 1000 + '초[/]');
    const k = HAS[it.id]; if (k && PERK[k]) out.push('[y]◆ ' + PERK[k].name + '[/]');
    return out.join(' · ');
  }
  for (const id in HAS) { const it = ITEMS[id], P = PERK[HAS[id]]; if (it && P && !it._perkDesc) { it._perkDesc = true; it.desc = (it.desc || '') + ' [y]◆ ' + P.name + '[/] — ' + P.d + '.'; } }

  G.gear = { LOOK, PERK, HAS, RT, icon, swordImg, bowImg, focusImg, drawWeapon, drawCarry, drawUnder, line, perks, has, lookOf, REACH_G, BOWR_G, SPR_G };
  C.drawWeapon = drawWeapon;
})();
