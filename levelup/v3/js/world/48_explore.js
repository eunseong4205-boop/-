/* 탐험: 갈 수 없는 땅은 날씨가 막고 · 길 밖에는 작은 이야기가 있고 · 찾은 곳은 수첩에 남는다
   1) 장막 — 아직 열리지 않은 지역은 그 땅의 날씨(홍수 · 산사태 · 모래바람 · 가시덩굴 · 눈보라 · 매연 · 어둠 · 안개 …)가
      경계 너머로 짙어진다. 들어서면 걸음이 무거워지고 바람이 되민다. 한참 깊이 들어가면 길을 잃었다가 왔던 길로 돌아온다.
      (예전: 그 자리로 순간 이동 + 3초마다 같은 말)
      길이 지역을 넘는 곳에는 그 마을이 세운 알림판.
   2) 발견 — 길가 쉼터 · 들판의 자리 · 작은 이야기 · 비문은 처음 다가가면 「발견」으로 수첩에 적히고 지도에 점이 찍힌다.
   3) 작은 이야기 스물여섯 — 가진 물건 · 시간(밤 · 해 질 녘) · 동료 · 든 무기에 따라 다르게 풀린다. 서재에 글이 꽂힌다.
   4) 비문 열 — 들판의 돌에 새긴 기술 (능력치가 모자라면 읽히지 않는다).
   5) 책장 — 마을 집의 책장 · 책 더미를 읽을 수 있다. 블루 대도서관은 갈래마다 한 칸. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs, E = G.ent;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const NAME = (n) => (OW.SHORT && OW.SHORT[n]) || n;
  const DAYLEN = 720, today = () => Math.floor(((S().t || 0) + DAYLEN * 0.3) / DAYLEN);
  const nightK = () => (ST.nightFactor ? ST.nightFactor() : 0);
  const isNight = () => nightK() > 0.5;
  const isDusk = () => { const k = nightK(); return k > 0.15 && k < 0.75; };
  const sfx = (k) => { if (G.audio) G.audio.sfx(k); };
  const inParty = (id) => (S().party || []).includes(id);
  const learn = (id) => { if (G.lib && G.lib.learn(S(), id)) { G.lib.toast(id); return true; } return false; };
  const gainExp = (n) => { const up = G.st.gainExp(S(), Math.round(n)); if (up && W().player) G.combat.levelUp(W().player, up); };
  const hasFood = () => ['food_corn', 'food_tteok', 'food_udon', 'food_bread'].find((k) => (S().inv[k] || 0) > 0);
  const hasFire = () => { const s = S(), sw = s.equip.sword && D.ITEMS[s.equip.sword]; return !!(s.tools.lantern || s.spells.fire || (sw && sw.el === 'fire')); };

  /* ═════════════ 1. 장막: 아직 열리지 않은 땅의 날씨 ═════════════ */
  const VEIL = {
    red: { kind: 'rain', tint: [52, 64, 92], see: '빗줄기가 거세진다. 불어난 강물 소리가 발밑까지 차오른다.', back: '거센 물살에 떠밀려 왔던 길로 돌아왔다.' },
    blue: { kind: 'dust', tint: [112, 88, 60], see: '흙먼지가 자욱하다. 비탈 위에서 돌이 쉬지 않고 굴러 내린다.', back: '쏟아지는 돌을 피해 물러났다.' },
    yellow: { kind: 'sand', tint: [204, 164, 92], see: '모래바람이 눈을 찌른다. 발자국이 생기자마자 지워진다.', back: '모래바람에 길을 잃었다가, 겨우 왔던 길을 찾았다.' },
    purple: { kind: 'thorn', tint: [76, 38, 98], see: '가시덩굴이 발목을 감는다. 숲이 길을 닫고 있다.', back: '가시덩굴에 막혀 돌아 나왔다.' },
    rainbow: { kind: 'cloud', tint: [228, 232, 248], see: '발밑이 구름으로 꺼진다. 더 가면 떨어진다.', back: '구름 끝에서 물러섰다.' },
    white: { kind: 'snow', tint: [214, 226, 244], see: '눈보라가 앞을 지운다. 손끝이 얼어 간다.', back: '눈보라에 떠밀려 왔던 길로 돌아왔다.' },
    gray: { kind: 'smog', tint: [92, 92, 102], see: '매캐한 잿빛 연기. 숨을 쉴 때마다 목이 따갑다.', back: '연기에 숨이 막혀 물러났다.' },
    black: { kind: 'dark', tint: [6, 4, 14], see: '빛이 점점 줄어든다. 발밑조차 보이지 않는다.', back: '어둠 속을 헤매다 겨우 빛 쪽으로 돌아왔다.' },
    colorful: { kind: 'spray', tint: [110, 160, 210], see: '바닷바람이 거세다. 파도가 둑을 넘어 들이친다.', back: '파도에 떠밀려 물러났다.' },
    mist: { kind: 'fog', tint: [196, 206, 200], see: '안개가 너무 짙다. 한 걸음 앞도 보이지 않는다.', back: '안개 속을 맴돌다 왔던 자리로 돌아왔다.' },
    amber: { kind: 'leaves', tint: [168, 92, 34], see: '단풍잎이 회오리친다. 잎 더미가 허리까지 쌓였다.', back: '잎 더미에 막혀 돌아 나왔다.' },
  };
  const FREE = 4;           // 경계에서 이만큼은 그냥 들어설 수 있다 (경계 위의 일 — 산사태 바위 · 문 앞 — 을 마칠 수 있게)
  const CAP = 32;
  const VD = { key: '', d: null, w: 0 };
  function openKey() { return Object.keys(VEIL).filter((n) => ST.regionOpen(n)).join(','); }
  /** 열린 땅까지의 거리(칸, 대각 포함) — 열린 지역이 바뀔 때만 다시 잰다 */
  function field(m) {
    const k = openKey();
    if (VD.d && VD.key === k && VD.w === m.w) return VD.d;
    const N = m.w * m.h, d = new Uint8Array(N).fill(255), q = new Int32Array(N), RN = OW.regName, op = {};
    let qh = 0, qt = 0;
    for (let i = 0; i < N; i++) { const n = RN[i]; let o = op[n]; if (o == null) o = op[n] = !n || !!ST.regionOpen(n); if (o) { d[i] = 0; q[qt++] = i; } }
    while (qh < qt) {
      const i = q[qh++], v = d[i]; if (v >= CAP) continue;
      const x = i % m.w, y = (i / m.w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
        const j = ny * m.w + nx; if (d[j] > v + 1) { d[j] = v + 1; q[qt++] = j; }
      }
    }
    VD.key = k; VD.d = d; VD.w = m.w;
    return d;
  }
  const VS = { depth: 0, reg: null, a: 0, lastOk: null, deepT: 0, quiet: 99, back: false, dir: [0, 0], told: {} };
  ST.VEIL = VEIL; ST.veilState = VS;
  /** 05_story의 checkRegion이 이것을 부른다 (순간 이동 대신) */
  ST.regionVeil = function (dt) {
    const Wd = W(), m = Wd.map, p = Wd.player;
    if (!p) return;
    if (!m || !m.overworld) { p.veilMul = 1; VS.depth = 0; return; }
    if (G.script.running || VS.back) return;
    const d = field(m);
    const tx = U.clamp(Math.floor(p.x / TS), 0, m.w - 1), ty = U.clamp(Math.floor(p.y / TS), 0, m.h - 1), i = ty * m.w + tx, v = d[i];
    VS.depth = v; VS.reg = OW.regName[i];
    if (v === 0) {
      if (p.state !== 'jump' && p.state !== 'fall' && p.state !== 'dead') VS.lastOk = { x: p.x, y: p.y, z: p.z };
      p.veilMul = 1; VS.deepT = 0; VS.quiet += dt;
      return;
    }
    const V = VEIL[VS.reg] || VEIL.mist;
    // 걸음이 무거워진다
    const over = Math.max(0, v - FREE);
    p.veilMul = over > 0 ? Math.max(0.3, 1 - over * 0.15) : Math.max(0.82, 1 - v * 0.04);
    if (!VS.lastOk) return;
    if (over <= 0) { VS.deepT = 0; return; }
    // 처음 깊이 들어섰을 때: 그 땅의 날씨를 말해 준다 (처음 한 번은 장면, 그다음엔 짧게)
    if (VS.quiet > 6) {
      VS.quiet = 0;
      const msg = ST.closedMsg[VS.reg] || '아직은 갈 때가 아니다.';
      if (!f('veil:' + VS.reg)) {
        S().flags['veil:' + VS.reg] = true;
        G.script.run(async (c) => { await c.narr(V.see); if (inParty('toria')) await c.say('toria', msg, { face: 'shock' }); else await c.say(null, msg.replace(/[, ]*찍[.!…]*/g, '.'), { style: 'sys' }); });
        return;
      }
      const tor = Wd.ents.find((e) => e.follower && e.cid === 'toria' && !e.dead);
      if (tor && G.cine && G.cine.bubble) G.cine.bubble(tor, msg, { life: 2.6 }); else G.ui.toast(V.see, '');
    }
    VS.quiet = 0;
    // 바람이 되민다: 열린 땅 쪽(거리가 줄어드는 쪽)으로
    let gx = 0, gy = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = tx + dx, ny = ty + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue; const dv = v - d[ny * m.w + nx]; if (dv > 0) { gx += dx * dv; gy += dy * dv; } }
    if (!gx && !gy) { gx = VS.lastOk.x - p.x; gy = VS.lastOk.y - p.y; }
    const n = U.norm(gx, gy);
    VS.dir = [U.lerp(VS.dir[0], n[0], Math.min(1, dt * 4)), U.lerp(VS.dir[1], n[1], Math.min(1, dt * 4))];
    if (p.state !== 'jump' && p.state !== 'fall' && p.state !== 'dead' && p.state !== 'hurt') {
      const push = 26 * over;
      E.move(m, p, VS.dir[0] * push * dt, VS.dir[1] * push * dt);
    }
    // 너무 깊이(구르기 · 뛰어내리기로) 들어갔거나, 한참을 버티면: 길을 잃었다가 왔던 길로
    VS.deepT += dt;
    if (v >= FREE + 7 || VS.deepT > 9) {
      VS.back = true; VS.deepT = 0;
      const back = V.back, to = VS.lastOk;
      G.script.run(async (c) => {
        try {
          await c.fade(true, { sec: 0.6 });
          const P = W().player; if (P && to) { P.x = to.x; P.y = to.y; P.z = to.z; P.kx = P.ky = 0; if (P.state === 'roll') P.setState('idle'); P.veilMul = 1; }
          await c.wait(0.3);
          await c.fade(false, { sec: 0.6 });
          c.toast(back, '');
        } finally { VS.back = false; }
      });
    }
  };

  /* 날씨 그리기: 경계 너머 칸마다 그 땅의 빛깔이 짙어지고, 그 위로 비 · 눈 · 모래 · 잎 · 연기 */
  const TC = { c: null, g: null, img: null };
  const WP = [];   // 날씨 알갱이
  const MAXW = 260;
  function spawnW(kind, x, y, k) {
    if (WP.length >= MAXW) WP.shift();
    const r = Math.random;
    switch (kind) {
      case 'rain': WP.push({ kind, x, y: y - 60, vx: -30, vy: 340, life: 0.28 + r() * 0.1, t: 0, col: 'rgba(170,190,230,0.75)' }); break;
      case 'snow': WP.push({ kind, x, y: y - 30, vx: 60 + r() * 40, vy: 40 + r() * 30, life: 1.1, t: 0, col: '#ffffff' }); break;
      case 'sand': WP.push({ kind, x: x - 30, y, vx: 160 + r() * 60, vy: (r() - 0.5) * 20, life: 0.5, t: 0, col: 'rgba(150,110,50,0.75)' }); break;
      case 'dust': WP.push({ kind, x, y, vx: (r() - 0.5) * 16, vy: -10 - r() * 12, life: 1.3, t: 0, col: 'rgba(150,120,80,0.55)', s: 2 + (r() * 2 | 0) }); if (r() < 0.12) WP.push({ kind: 'pebble', x, y: y - 50, vx: (r() - 0.5) * 30, vy: 160, life: 0.35, t: 0, col: '#6a5640' }); break;
      case 'thorn': WP.push({ kind, x, y, vx: (r() - 0.5) * 10, vy: -6, life: 1.4, t: 0, col: r() < 0.5 ? 'rgba(150,80,190,0.6)' : 'rgba(60,30,70,0.8)', s: 2 }); break;
      case 'cloud': case 'fog': case 'smog': WP.push({ kind: 'puff', x, y, vx: (kind === 'smog' ? 8 : 14) * (r() < 0.5 ? -1 : 1), vy: kind === 'smog' ? -8 : 0, life: 2.2, t: 0, col: kind === 'smog' ? 'rgba(80,80,90,' : kind === 'fog' ? 'rgba(220,228,222,' : 'rgba(250,252,255,', s: 8 + r() * 10, a: 0.18 + k * 0.12 }); break;
      case 'dark': if (r() < 0.25) WP.push({ kind: 'star', x, y, vx: 0, vy: 0, life: 1.6, t: 0, col: '#b8a8e8' }); break;
      case 'spray': WP.push({ kind, x, y, vx: 40 + r() * 50, vy: -80 - r() * 40, life: 0.6, t: 0, col: 'rgba(230,245,255,0.85)' }); break;
      case 'leaves': WP.push({ kind, x: x - 20, y: y - 10, vx: 90 + r() * 50, vy: (r() - 0.5) * 40, life: 0.9, t: 0, col: ['#e87a2a', '#c84a1a', '#f0b040'][r() * 3 | 0], ph: r() * 6 }); break;
      default: break;
    }
  }
  let spawnAcc = 0;
  function weatherTick(dt) {
    for (let i = WP.length - 1; i >= 0; i--) { const q = WP[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.kind === 'puff') q.vy *= 0.99; if (q.t >= q.life) WP.splice(i, 1); }
    const Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !m.overworld || !p) { WP.length = 0; return; }
    const d = field(m), v = Wd.view;
    spawnAcc += dt * 90;
    const cx = W().rcx || 0, cy = W().rcy || 0;
    let n = 0;
    while (spawnAcc >= 1 && n < 6) {
      spawnAcc -= 1; n++;
      const x = cx + Math.random() * v.w, y = cy + Math.random() * (v.h + 30);
      const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
      if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) continue;
      const dv = d[ty * m.w + tx]; if (!dv) continue;
      const k = Math.min(1, dv / 6);
      if (Math.random() > 0.25 + k * 0.75) continue;
      const V = VEIL[OW.regName[ty * m.w + tx]]; if (V) spawnW(V.kind, x, y, k);
    }
    spawnAcc = Math.min(spawnAcc, 3);
    VS.a = U.lerp(VS.a, Math.min(1, Math.max(0, VS.depth - 1) / 8), Math.min(1, dt * 2.5));
  }
  function drawWeather(g, cx, cy, view) {
    const Wd = W(), m = Wd.map; if (!m || !m.overworld) return;
    const d = field(m), t = Wd.t;
    // 칸 빛깔: 칸마다 한 점씩 작은 그림에 찍고 부드럽게 늘려 그린다 (칸 경계가 계단처럼 보이지 않게)
    const tx0 = Math.max(0, Math.floor(cx / TS) - 1), ty0 = Math.max(0, Math.floor(cy / TS) - 1), tx1 = Math.min(m.w - 1, Math.floor((cx + view.w) / TS) + 1), ty1 = Math.min(m.h - 1, Math.floor((cy + view.h) / TS) + 1);
    const cw = tx1 - tx0 + 1, chh = ty1 - ty0 + 1;
    let any = false;
    if (!TC.c || TC.c.width !== cw || TC.c.height !== chh) { TC.c = G.gfx.canvas(cw, chh); TC.g = G.gfx.ctx(TC.c); TC.img = TC.g.createImageData(cw, chh); }
    const px8 = TC.img.data;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ty * m.w + tx, dv = d[i], o = ((ty - ty0) * cw + (tx - tx0)) * 4;
      if (!dv) { px8[o + 3] = 0; continue; }
      any = true;
      const n = OW.regName[i], dark = n === 'black', c = (VEIL[n] || VEIL.mist).tint;
      let a = Math.min(dark ? 0.82 : 0.52, dv * (dark ? 0.09 : 0.065));
      a *= 0.93 + 0.07 * Math.sin(t * 0.6 + tx * 0.23 + ty * 0.31);
      px8[o] = c[0]; px8[o + 1] = c[1]; px8[o + 2] = c[2]; px8[o + 3] = Math.round(a * 255);
    }
    if (any) {
      TC.g.putImageData(TC.img, 0, 0);
      const sm = g.imageSmoothingEnabled; g.imageSmoothingEnabled = true;
      g.drawImage(TC.c, 0, 0, cw, chh, tx0 * TS - cx, ty0 * TS - cy, cw * TS, chh * TS);
      g.imageSmoothingEnabled = sm;
    }
    // 알갱이
    for (const q of WP) {
      const x = Math.round(q.x - cx), y = Math.round(q.y - cy), k = 1 - q.t / q.life;
      if (x < -20 || y < -40 || x > view.w + 20 || y > view.h + 40) continue;
      switch (q.kind) {
        case 'rain': g.strokeStyle = q.col; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 8); g.stroke(); break;
        case 'snow': g.fillStyle = q.col; g.globalAlpha = k; g.fillRect(x, y, 1 + (q.vx > 80 ? 1 : 0), 1); g.globalAlpha = 1; break;
        case 'sand': g.fillStyle = q.col; g.globalAlpha = k; g.fillRect(x, y, 5, 1); g.globalAlpha = 1; break;
        case 'leaves': g.fillStyle = q.col; g.fillRect(x, y + Math.round(Math.sin(q.t * 9 + q.ph) * 2), Math.sin(q.t * 12 + q.ph) > 0 ? 2 : 1, 1); break;
        case 'puff': g.fillStyle = q.col + (q.a * Math.sin(Math.PI * q.t / q.life)).toFixed(3) + ')'; g.beginPath(); g.arc(x, y, q.s, 0, Math.PI * 2); g.fill(); break;
        case 'star': g.fillStyle = q.col; g.globalAlpha = Math.sin(Math.PI * q.t / q.life) * 0.8; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; break;
        default: g.fillStyle = q.col; g.globalAlpha = Math.max(0, k); g.fillRect(x, y, q.s || 1, q.s || 1); g.globalAlpha = 1; break;
      }
    }
    // 장막 안: 화면 가장자리부터 그 땅의 빛깔로
    if (VS.a > 0.02 && VS.reg && VEIL[VS.reg]) {
      const c = VEIL[VS.reg].tint, a = VS.a * (VS.reg === 'black' ? 0.75 : 0.5);
      const gr = g.createRadialGradient(view.w / 2, view.h / 2, view.h * 0.18, view.w / 2, view.h / 2, view.h * 0.8);
      gr.addColorStop(0, 'rgba(' + c.join(',') + ',' + (a * 0.25).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + c.join(',') + ',' + a.toFixed(3) + ')');
      g.fillStyle = gr; g.fillRect(0, 0, view.w, view.h);
    }
  }
  W().overlays = W().overlays || [];
  W().overlays.push(drawWeather);

  /* 알림판: 길이 아직 닫힌 지역으로 넘어가는 곳 */
  const NOTICE = {
    red: ['통행 주의 — 레드 방면', '봄 홍수로 동쪽 다리가 쓸려 갔습니다. 물이 빠지고 다리를 다시 놓을 때까지 건너지 마십시오.', '그린 마을 이장 베르덱스'],
    blue: ['통행 금지 — 블루 방면 고갯길', '산사태. 굴러 내린 바위가 치워질 때까지 지나갈 수 없습니다. 폭약 소지자는 조합에 신고 바랍니다.', '레드 광산 조합'],
    yellow: ['경고 — 모래바다', '길잡이 없이 들어가지 마십시오. 지난달에도 둘이 돌아오지 않았습니다.', '옐로 대상 조합'],
    purple: ['알림 — 해 질 녘의 숲', '가시덩굴이 길을 닫았습니다. 숲이 길을 열 때까지 기다리십시오. 국경 통행에는 허가가 필요합니다.', '라벤더 학원 숲지기'],
    rainbow: ['안내 — 하늘섬', '걸어서는 갈 수 없습니다. 구름고래 초대장을 확인하십시오.', '무지개 축제 위원회'],
    white: ['통행 주의 — 북쪽 설산 고개', '눈보라와 낙석. 무거운 바위가 고개를 막고 있습니다. 눈꽃 빵 없이 오르지 마십시오.', '화이트 순례자 쉼터'],
    gray: ['출입 제한 — 그레이 공업 지대', '매연 경보. 허가 없는 출입을 금합니다.', '그레이 공방'],
    black: ['경고 — 영원한 밤', '이 너머는 해가 뜨지 않습니다. 사천왕 검정의 땅. 등불 없이 들어가지 마십시오.', '등불 거리 등불지기 조합'],
    colorful: ['안내 — 알록달록 곶', '곶으로 가는 둑길은 파도에 잠겼습니다. 블루 항구의 연락선을 이용하십시오.', '알록달록 발명 조합'],
    mist: ['주의 — 안개 늪', '안개 경보. 늪 뱃사공의 종이 울릴 때까지 들어가지 마십시오.', '늪 뱃사공 모임'],
    amber: ['통행 주의 — 단풍 협곡', '협곡 어귀가 낙엽 더미에 묻혔습니다. 치우는 중입니다.', '협곡 순찰대'],
  };

  /* ═════════════ 2. 그림 ═════════════ */
  function line(g, x0, y0, x1, y1, col) { g.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (let k = 0; k <= n; k++) g.fillRect(Math.round(x0 + (x1 - x0) * k / (n || 1)), Math.round(y0 + (y1 - y0) * k / (n || 1)), 1, 1); }
  function blob(g, x, y, rx, ry, col) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  const ART = {
    tripod(g, x, y, t, st) {
      line(g, x, y - 16, x - 6, y, '#5a3a20'); line(g, x, y - 16, x + 6, y, '#5a3a20'); line(g, x, y - 16, x + 1, y + 1, '#4a2e18');
      g.fillStyle = '#c89a38'; g.fillRect(x - 3, y - 19, 7, 3); g.fillStyle = '#8a6a28'; g.fillRect(x - 1, y - 21, 3, 2); g.fillStyle = '#e8d8a0'; g.fillRect(x + 2, y - 19, 1, 1);
      if (!st) { const w = Math.sin(t * 4) > 0 ? 1 : 0; g.fillStyle = '#f0e8d0'; g.fillRect(x + 2, y - 13 + w, 5, 5); g.fillStyle = '#a89878'; g.fillRect(x + 3, y - 12 + w, 3, 1); g.fillRect(x + 3, y - 10 + w, 2, 1); }
    },
    mound(g, x, y, t) { blob(g, x, y - 2, 9, 4, '#6a4a2a'); blob(g, x, y - 3, 7, 3, '#8a6a3a'); g.fillStyle = '#c83a3a'; line(g, x - 3, y - 6, x + 3, y, '#c83a3a'); line(g, x + 3, y - 6, x - 3, y, '#c83a3a'); if (Math.sin(t * 3) > 0.9) { g.fillStyle = '#fff8c0'; g.fillRect(x, y - 9, 1, 1); } },
    wheel(g, x, y, t, st) {
      const cx = x, cy = y - 13, a0 = st ? t * 1.8 : 0.35;
      g.fillStyle = '#4a3020'; g.fillRect(x - 2, y - 14, 4, 14);
      for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; g.fillStyle = '#6a4424'; g.fillRect(Math.round(cx + Math.cos(a) * 11), Math.round(cy + Math.sin(a) * 11), 2, 2); }
      for (let k = 0; k < 8; k++) { const a = a0 + k * Math.PI / 4; line(g, cx, cy, cx + Math.cos(a) * 10, cy + Math.sin(a) * 10, '#8a5a32'); g.fillStyle = '#5a3a20'; g.fillRect(Math.round(cx + Math.cos(a) * 12) - 1, Math.round(cy + Math.sin(a) * 12) - 1, 3, 3); }
      g.fillStyle = '#3a2418'; g.fillRect(cx - 2, cy - 2, 4, 4);
      if (!st) { g.fillStyle = '#7a5030'; g.fillRect(x - 14, y - 9, 22, 4); g.fillStyle = '#9a6a40'; g.fillRect(x - 14, y - 9, 22, 1); g.fillStyle = '#5a3a20'; g.fillRect(x - 14, y - 8, 2, 2); }
      else if (Math.sin(t * 7) > 0.6) { g.fillStyle = '#c8e8ff'; g.fillRect(x + 8, y - 3, 1, 1); g.fillRect(x + 10, y - 5, 1, 1); }
    },
    kidgrave(g, x, y, t, st) {
      blob(g, x, y - 1, 8, 3, 'rgba(0,0,0,0.25)'); g.fillStyle = '#8a8a90'; g.fillRect(x - 4, y - 10, 8, 10); g.fillStyle = '#a8a8b0'; g.fillRect(x - 4, y - 10, 8, 2); g.fillStyle = '#6a6a70'; g.fillRect(x - 2, y - 7, 4, 1); g.fillRect(x - 1, y - 5, 2, 1);
      g.fillStyle = '#b8884a'; g.fillRect(x + 7, y - 14, 2, 13); g.fillStyle = '#8a5a2a'; g.fillRect(x + 5, y - 6, 6, 2);
      g.fillStyle = '#ff8ab0'; g.fillRect(x - 6, y - 2, 2, 2); g.fillStyle = '#fff2a8'; g.fillRect(x - 3, y - 1, 2, 1);
      if (st) { const a = t * 2; g.globalAlpha = 0.5 + Math.sin(t * 3) * 0.25; g.fillStyle = '#e8fff0'; g.fillRect(Math.round(x + Math.cos(a) * 9), Math.round(y - 14 + Math.sin(a) * 4), 2, 2); g.globalAlpha = 1; }
    },
    rodstick(g, x, y, t) { line(g, x - 4, y, x + 6, y - 20, '#6a4a2a'); const b = Math.sin(t * 2) * 1.5; line(g, x + 6, y - 20, x + 14, y - 4 + b, 'rgba(230,230,240,0.6)'); g.fillStyle = '#e84a4a'; g.fillRect(x + 13, y - 4 + Math.round(b), 3, 2); g.fillStyle = '#ffffff'; g.fillRect(x + 13, y - 5 + Math.round(b), 3, 1); },
    flagpole(g, x, y, t) { g.fillStyle = '#8a6a3a'; g.fillRect(x, y - 26, 2, 26); const w = Math.sin(t * 5); g.fillStyle = '#c84a3a'; for (let k = 0; k < 10; k++) g.fillRect(x + 2 + k, y - 25 + Math.round(Math.sin(t * 6 + k * 0.6) * 1.2), 1, k > 6 ? 4 : 6); g.fillStyle = '#e8c048'; g.fillRect(x + 4, y - 23 + Math.round(w), 2, 2); blob(g, x + 1, y, 7, 2, 'rgba(160,120,60,0.5)'); },
    snowman(g, x, y, t, nose) { blob(g, x, y - 5, 6, 5, '#f4f8ff'); blob(g, x, y - 13, 4.5, 4, '#ffffff'); g.fillStyle = '#2a2a3a'; g.fillRect(x - 2, y - 14, 1, 1); g.fillRect(x + 1, y - 14, 1, 1); g.fillRect(x, y - 6, 1, 1); g.fillRect(x, y - 4, 1, 1); if (nose) { g.fillStyle = '#e8a040'; g.fillRect(x, y - 13, 3, 1); } line(g, x - 5, y - 9, x - 9, y - 12, '#6a4a2a'); line(g, x + 5, y - 9, x + 9, y - 12, '#6a4a2a'); g.fillStyle = '#c83a3a'; g.fillRect(x - 4, y - 10, 8, 1); },
    iceblock(g, x, y, t, st) {
      if (st) { blob(g, x, y - 1, 9, 3, 'rgba(140,190,230,0.45)'); return; }
      g.fillStyle = 'rgba(170,215,250,0.85)'; g.fillRect(x - 7, y - 14, 14, 14); g.fillStyle = 'rgba(230,245,255,0.9)'; g.fillRect(x - 7, y - 14, 14, 2); g.fillRect(x - 7, y - 14, 2, 14);
      g.fillStyle = '#f0e8d0'; g.fillRect(x - 3, y - 10, 6, 5); g.fillStyle = '#a89878'; g.fillRect(x - 2, y - 9, 4, 1); g.fillRect(x - 2, y - 7, 3, 1);
      if (Math.sin(t * 2.5) > 0.85) { g.fillStyle = '#ffffff'; g.fillRect(x + 4, y - 12, 1, 1); }
    },
    automaton(g, x, y, t, st) {
      blob(g, x, y - 1, 10, 3, 'rgba(0,0,0,0.3)'); g.fillStyle = '#6a6a78'; g.fillRect(x - 6, y - 12, 12, 10); g.fillStyle = '#8a8a98'; g.fillRect(x - 6, y - 12, 12, 2);
      g.fillStyle = '#5a5a68'; g.fillRect(x - 9, y - 5, 4, 5); g.fillRect(x + 5, y - 5, 4, 5); g.fillStyle = '#7a7a88'; g.fillRect(x - 4, y - 19, 9, 7); g.fillStyle = st ? '#6ae8ff' : '#3a3a48'; g.fillRect(x - 2, y - 17, 2, 2); g.fillRect(x + 2, y - 17, 2, 2);
      g.fillStyle = '#a86a3a'; g.fillRect(x - 2, y - 9, 4, 4); if (!st) { g.fillStyle = '#2a2a34'; g.fillRect(x - 1, y - 8, 2, 2); }
      if (st && Math.sin(t * 4) > 0.3) { g.fillStyle = '#ffe066'; g.fillRect(x - 1, y - 8, 2, 2); }
    },
    mural(g, x, y, t) {
      g.fillStyle = '#7a7a82'; g.fillRect(x - 16, y - 20, 32, 20); g.fillStyle = '#9a9aa2'; g.fillRect(x - 16, y - 20, 32, 2);
      const cols = ['#a8a8b8', '#b0b4c0', '#9a9ea8', '#b8bcc8']; for (let k = 0; k < 4; k++) { g.fillStyle = cols[k]; g.fillRect(x - 14 + k * 7, y - 15, 6, 10); }
      g.fillStyle = '#d8c890'; g.fillRect(x - 10, y - 18, 3, 3); g.fillStyle = '#2a2a30'; g.fillRect(x + 6, y - 18, 3, 3);
      g.fillStyle = '#5a5a62'; g.fillRect(x + 10, y - 20, 6, 6); g.fillStyle = '#6a6a72'; g.fillRect(x + 12, y - 4, 6, 4);
    },
    lamp(g, x, y, t, lit) {
      g.fillStyle = '#2a2a34'; g.fillRect(x - 1, y - 22, 3, 22); g.fillRect(x - 4, y - 1, 9, 2); g.fillStyle = '#3a3a48'; g.fillRect(x - 3, y - 27, 7, 6); g.fillStyle = lit ? '#ffd860' : '#4a4a58'; g.fillRect(x - 2, y - 26, 5, 4);
      if (lit) { g.fillStyle = '#ffffff'; g.fillRect(x, y - 25 - (Math.sin(t * 9) > 0 ? 1 : 0), 1, 2); g.globalAlpha = 0.18; blob(g, x + 0.5, y - 24, 12, 10, '#ffe080'); g.globalAlpha = 1; }
    },
    cat(g, x, y, t, st) {
      g.fillStyle = '#1a1622'; blob(g, x, y - 4, 4, 4, '#1a1622'); blob(g, x, y - 9, 3, 3, '#1a1622'); g.fillRect(x - 3, y - 13, 1, 2); g.fillRect(x + 2, y - 13, 1, 2);
      const tw = Math.sin(t * 2.2) * 3; line(g, x + 3, y - 2, x + 7, y - 6 + tw, '#1a1622');
      g.fillStyle = st ? '#e8c048' : '#a8e86a'; g.fillRect(x - 2, y - 10, 1, 1); g.fillRect(x + 1, y - 10, 1, 1);
      if (Math.sin(t * 0.7) > 0.97) { g.fillStyle = '#1a1622'; g.fillRect(x - 2, y - 10, 1, 1); g.fillRect(x + 1, y - 10, 1, 1); }
    },
    crater(g, x, y, t, lit) {
      blob(g, x, y - 2, 13, 5, '#3a2a22'); blob(g, x, y - 2, 10, 3.5, '#241a16');
      if (lit) { const a = 0.6 + Math.sin(t * 3) * 0.3; g.globalAlpha = a; blob(g, x, y - 5, 6, 4, '#8ad8ff'); g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 8, 3, 4); g.fillStyle = '#c8f0ff'; g.fillRect(x, y - 10, 1, 2); }
      else { g.fillStyle = '#5a4030'; g.fillRect(x - 2, y - 4, 4, 2); }
    },
    echorock(g, x, y, t) { blob(g, x, y - 9, 14, 11, '#8a6a52'); blob(g, x - 2, y - 11, 11, 8, '#a8826a'); blob(g, x + 1, y - 9, 4, 5, '#3a2a22'); g.fillStyle = '#c8a088'; g.fillRect(x - 8, y - 17, 4, 2); if (Math.sin(t * 1.3) > 0.8) { g.globalAlpha = 0.6; g.fillStyle = '#f0b040'; g.fillRect(x + 6, y - 20, 2, 1); g.globalAlpha = 1; } },
    bootpost(g, x, y, t, st) {
      g.fillStyle = '#6a4a2a'; g.fillRect(x - 1, y - 22, 3, 22); g.fillStyle = '#8a6a3a'; g.fillRect(x - 7, y - 22, 15, 3); blob(g, x + 1, y, 6, 2, 'rgba(0,0,0,0.2)');
      if (st) return;
      const sw = Math.round(Math.sin(t * 3) * 1.5);
      for (const [dx, c] of [[-5, '#7a4a2a'], [3, '#8a5a32']]) { line(g, x + dx + 1, y - 19, x + dx + 1 + sw, y - 14, '#d8c8a0'); g.fillStyle = c; g.fillRect(x + dx + sw, y - 14, 3, 6); g.fillRect(x + dx + sw, y - 9, 5, 2); g.fillStyle = '#c8e8ff'; g.fillRect(x + dx + sw, y - 13, 3, 1); }
      if (Math.sin(t * 2.2) > 0.6) { g.globalAlpha = 0.5; g.fillStyle = '#e8f8ff'; g.fillRect(x + 8, y - 16, 4, 1); g.fillRect(x + 10, y - 12, 3, 1); g.globalAlpha = 1; }
    },
    upsign(g, x, y) { g.fillStyle = '#6a4a2a'; g.fillRect(x - 1, y - 18, 3, 18); g.fillStyle = '#a8804a'; g.fillRect(x - 5, y - 24, 11, 7); g.fillStyle = '#2a1a10'; g.fillRect(x, y - 23, 1, 5); g.fillRect(x - 1, y - 22, 3, 1); g.fillStyle = '#a8804a'; g.fillRect(x - 6, y - 14, 9, 4); g.fillStyle = '#2a1a10'; g.fillRect(x - 3, y - 13, 1, 2); },
    wreck(g, x, y, t) { g.fillStyle = '#8a8a92'; g.fillRect(x - 12, y - 6, 9, 6); g.fillRect(x + 3, y - 10, 8, 10); g.fillStyle = '#a8a8b0'; g.fillRect(x - 12, y - 6, 9, 1); g.fillRect(x + 3, y - 10, 8, 1); g.fillStyle = '#6a6a72'; g.fillRect(x - 3, y - 3, 7, 3); const c = 0.5 + Math.sin(t * 2) * 0.3; g.globalAlpha = c; g.fillStyle = '#b8f0ff'; g.fillRect(x - 1, y - 14, 4, 6); g.globalAlpha = 1; g.fillStyle = '#e8ffff'; g.fillRect(x, y - 13, 1, 2); },
    helmet(g, x, y) { g.fillStyle = '#6a4a2a'; g.fillRect(x - 1, y - 14, 2, 14); blob(g, x, y - 16, 6, 5, '#8a8aa0'); g.fillStyle = '#a8a8c0'; g.fillRect(x - 5, y - 19, 10, 2); g.fillStyle = '#2a2a3a'; g.fillRect(x - 4, y - 16, 8, 1); g.fillStyle = '#c8402a'; g.fillRect(x - 1, y - 23, 2, 3); },
    flowerrock(g, x, y, t, st) {
      blob(g, x, y - 6, 10, 7, '#7a7a82'); blob(g, x - 2, y - 8, 7, 5, '#9a9aa2'); line(g, x - 1, y - 13, x + 2, y - 4, '#3a3a42');
      if (st >= 1) { g.fillStyle = '#4ab84a'; g.fillRect(x, y - 15, 1, 3); g.fillRect(x + 1, y - 14, 1, 1); }
      if (st >= 2) { for (const [dx, dy, c] of [[-5, -13, '#ff8ab0'], [4, -14, '#ffe066'], [0, -17, '#c48aff'], [-2, -11, '#ffffff'], [6, -9, '#ff8a6a']]) { g.fillStyle = '#3a8a3a'; g.fillRect(x + dx, y + dy + 1, 1, 2); g.fillStyle = c; g.fillRect(x + dx - 1, y + dy - 1, 3, 2); } }
    },
    bell(g, x, y, t, sw) { g.fillStyle = '#5a4030'; g.fillRect(x - 1, y - 26, 3, 26); g.fillRect(x - 1, y - 26, 10, 2); const a = sw > 0 ? Math.sin(t * 18) * 3 * Math.min(1, sw) : 0; g.fillStyle = '#c8a048'; g.fillRect(Math.round(x + 6 + a) - 2, y - 23, 5, 5); g.fillStyle = '#8a6a28'; g.fillRect(Math.round(x + 6 + a) - 2, y - 19, 5, 1); },
    glider(g, x, y, t) { line(g, x - 14, y - 8, x + 14, y - 12, '#8a6a4a'); line(g, x - 2, y - 2, x + 2, y - 16, '#6a4a2a'); g.fillStyle = 'rgba(240,230,200,0.85)'; for (let k = -12; k < 12; k += 2) g.fillRect(x + k, y - 9 - Math.round(k / 6), 2, k % 4 ? 4 : 2); g.fillStyle = '#c84a3a'; g.fillRect(x + 8, y - 14, 3, 2); },
    stele(g, x, y, t, st) {
      blob(g, x, y - 1, 9, 3, 'rgba(0,0,0,0.3)'); g.fillStyle = '#6a6878'; g.fillRect(x - 6, y - 26, 12, 26); g.fillStyle = '#8a889a'; g.fillRect(x - 6, y - 26, 12, 2); g.fillRect(x - 6, y - 26, 2, 26); g.fillStyle = '#4a4858'; g.fillRect(x - 7, y - 2, 14, 2);
      const glow = st === 0 ? 0.55 + Math.sin(t * 2.4) * 0.35 : st === 1 ? 0.25 : 0.1;
      g.globalAlpha = glow; g.fillStyle = st === 1 ? '#c8c0d8' : '#8ad8ff'; for (let r = 0; r < 4; r++) { g.fillRect(x - 3, y - 21 + r * 5, 2, 2); g.fillRect(x + 1, y - 22 + r * 5, 2, 3); } g.globalAlpha = 1;
    },
    spear(g, x, y, t) { g.fillStyle = '#7a7a82'; g.fillRect(x - 6, y - 22, 12, 22); g.fillStyle = '#9a9aa2'; g.fillRect(x - 6, y - 22, 12, 2); line(g, x - 3, y - 4, x + 3, y - 19, '#4a8a4a'); g.fillStyle = '#6ae07a'; g.fillRect(x + 2, y - 20, 2, 2); g.fillStyle = '#ffffff'; if (Math.sin(t * 1.7) > 0.9) g.fillRect(x + 3, y - 21, 1, 1); },
    battlefield(g, x, y) { g.fillStyle = '#6a4a2a'; g.fillRect(x, y - 22, 2, 22); g.fillStyle = '#8a3a3a'; g.fillRect(x + 2, y - 21, 7, 5); g.fillRect(x + 2, y - 16, 4, 2); for (const [dx, dy] of [[-8, -1], [-5, 2], [6, 1], [9, -2], [-11, 3]]) { line(g, x + dx, y + dy, x + dx + 2, y + dy - 4, '#8a8a90'); } },
    pond(g, x, y, t) { if (Math.sin(t * 1.6) > 0.7) { g.fillStyle = '#ffffff'; g.globalAlpha = 0.6; g.fillRect(x - 2, y - 2, 1, 1); g.fillRect(x + 3, y - 1, 1, 1); g.globalAlpha = 1; } },
  };

  /* 쓸 수 있는 그림 사물 */
  class Thing extends G.props.Spot {
    constructor(o) { super(Object.assign({ bw: 12, bh: 6 }, o)); this.solid = !!o.solid; }
    blockBox() { return this.solid ? { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh } : null; }
    update(dt) { this.t += dt; if (this.showIf) this.hidden = !this.showIf(); if (this.tick) this.tick(dt, this); }
    canUse(p) { return !this.hidden && (!this.when || this.when(p)); }
    get label() { return typeof this.verb === 'function' ? this.verb() : (this.verb || '살펴본다'); }
    drawShadow() { /* 그림 안에 그린다 */ }
    draw(g, cx, cy) {
      if (this.hidden) return;
      const fn = ART[this.art]; if (fn) fn(g, Math.round(this.x - cx), Math.round(this.y - cy), this.t, this.st ? this.st(this) : 0);
      if (this.glint && this.glint() && Math.sin(this.t * 3 + this.x) > 0.75) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy - (this.gy || 22)); g.fillStyle = '#fff8c0'; g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y + 1, 3, 1); g.fillRect(x, y + 2, 1, 1); }
    }
  }

  /* ═════════════ 3. 작은 이야기 ═════════════ */
  const TALES = [];
  const tale = (o) => TALES.push(Object.assign({ near: 'field', area: [5, 4] }, o));
  const done = (id) => f('tale:' + id);
  const finish = (c, id, line) => { c.flag('tale:' + id); if (line) c.journal(line); };

  // ── 측량사의 수첩: 삼각대 셋 + 묻어 둔 품삯 ──
  const svN = () => ['sv:p1', 'sv:p2', 'sv:p3'].filter(f).length;
  ['green', 'red', 'amber'].forEach((reg, k) => tale({
    id: 'sv' + (k + 1), regs: [reg], name: '측량 삼각대', blurb: '누군가 대륙을 재던 자리. 다리에 기름종이가 묶여 있었다.',
    state: () => (f('sv:p' + (k + 1)) ? (svN() === 3 ? (done('svcache') ? 'done' : 'more') : 'more') : 'new'),
    hint: () => (svN() < 3 ? '삼각대는 셋 — 그린 · 레드 · 단풍 협곡의 들판 어딘가. (' + svN() + '/3)' : done('svcache') ? null : '세 번째 삼각대(단풍 협곡)에서 해 지는 쪽으로 열두 걸음.'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'tripod', solid: true, bw: 10, bh: 5, st: () => (f('sv:p' + (k + 1)) ? 1 : 0), glint: () => !f('sv:p' + (k + 1)), verb: () => (f('sv:p' + (k + 1)) ? '삼각대를 본다' : '묶인 종이를 푼다'), text: async (c) => {
        const pg = D.LIBRARY.f_surveyor.pages[k];
        if (!f('sv:p' + (k + 1))) { c.flag('sv:p' + (k + 1)); c.sfx('book'); await c.narr('삼각대 다리에 기름종이가 묶여 있다. 누군가의 수첩에서 찢어 낸 장이다. (' + svN() + ' / 3)'); gainExp(20 + k * 25); }
        await c.narr('「' + pg + '」');
        if (svN() === 3 && !f('sv:all')) { c.flag('sv:all'); learn('f_surveyor'); await c.narr('세 장이 모였다. 마지막 장 귀퉁이에 작은 그림 — 삼각대 하나, 해 지는 쪽으로 그은 화살표, 그리고 「열두 걸음」.'); if (k !== 2) await c.narr('[s]세 번째 삼각대 — 단풍 협곡의 것 — 에서 해 지는 쪽이다.[/]'); }
        else if (svN() < 3) await c.narr('[s]이야기가 이어지는 것 같다. 다른 삼각대가 어딘가 서 있을 것이다.[/]');
      } }));
    },
  }));
  tale({
    id: 'svcache', regs: ['amber'], near: 'rel:sv3', area: [3, 3], name: '측량사가 묻어 둔 것', blurb: '쓰지 않기로 한 품삯. 「탑을 허무는 데 써 다오.」',
    when: () => f('sv:all'), state: () => (done('svcache') ? 'done' : 'new'), hint: () => (f('sv:all') && !done('svcache') ? '단풍 협곡 삼각대에서 해 지는 쪽(서쪽)으로 열두 걸음.' : null),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'mound', showIf: () => f('sv:all') && !done('svcache'), verb: '흙을 판다', text: async (c) => {
        c.sfx('rock'); await c.narr('흙을 걷어 내자 기름 먹인 나무 상자가 나왔다. 동전이 가득하다. 한 번도 쓰지 않은 품삯.');
        c.gold(600); await c.getItem('heartpiece');
        await c.narr('상자 바닥에 한 줄. 「이 돈은 탑 자리를 잰 값이다. 탑을 허무는 데 써 다오.」');
        finish(c, 'svcache', '측량사가 묻어 둔 품삯을 찾았다. 「탑을 허무는 데 써 다오.」');
      } }));
    },
  });
  // ── 멈춘 물레방아 ──
  tale({
    id: 'mill', regs: ['green'], near: 'water', area: [6, 4], name: '멈춘 물레방아', blurb: '통나무가 바퀴살에 끼어 멈춘 물레방아. 기둥에 키 재기 금 일곱 줄.',
    state: () => (done('mill') ? 'done' : f('mill:seen') ? 'more' : 'new'), hint: () => (done('mill') ? null : '통나무는 맨손으론 꿈쩍도 않는다. 무거운 것을 드는 힘이 있으면…'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'wheel', solid: true, bw: 18, bh: 6, gy: 28, st: () => (done('mill') ? 1 : 0), verb: () => (done('mill') ? '물레방아를 본다' : '물레방아를 살핀다'),
        tick(dt, e) { if (done('mill') && Math.random() < dt * 6) G.fx.part({ x: e.x + 10, y: e.y - 2, z: 2, vz: 30, g: 120, life: 0.4, col: '#c8e8ff', size: 1 }); },
        text: async (c) => {
          if (done('mill')) { await c.narr('물레방아가 돈다. 덜컹, 덜컹. 기둥의 키 재기 금이 물보라에 젖어 반짝인다.'); return; }
          await c.narr('멈춘 물레방아. 통나무 하나가 바퀴살 사이에 단단히 끼어 있다.');
          if (!f('mill:seen')) { c.flag('mill:seen'); learn('f_mill'); }
          await c.narr('기둥에 칼로 그은 금이 일곱 줄. 아이 키를 잰 자국이다. 여덟째 줄은 없다.');
          if (!S().inv.glove) { await c.narr('[s]통나무는 맨손으론 꿈쩍도 않는다. 무거운 것을 들 힘이 있으면 모를까.[/]'); return; }
          const k = await c.choice('힘 장갑을 낀 손이 근질거린다.', ['통나무를 들어 치운다', '그냥 둔다']);
          if (k !== 0) return;
          c.sfx('lift'); c.shake(2, 0.3); await c.wait(0.3); c.sfx('splash');
          await c.narr('통나무가 물에 떨어졌다. 바퀴가 삐걱, 한 바퀴 — 그리고 다시 돈다. 물소리가 마을 쪽으로 흘러간다.');
          c.give('food_corn', 3); c.gold(150); gainExp(60);
          await c.say(null, '물레방아 안쪽 선반에서 [y]옥수수빵 3개[/]와 동전 꾸러미가 나왔다. 「치워 준 사람에게」라는 쪽지와 함께.', { style: 'sys' });
          finish(c, 'mill', '그린 들판의 멈춘 물레방아를 다시 돌게 했다.');
        } }));
    },
  });
  // ── 작은 무덤과 목검 ──
  tale({
    id: 'kidgrave', regs: ['green', 'red'], name: '목검이 꽂힌 작은 무덤', blurb: '「렙업을 꿈꾸던 아이 잠들다. 레벨 3.」 누군가 날마다 목검을 닦는다.',
    state: () => (done('kidgrave') ? 'done' : f('kidgrave:seen') ? 'more' : 'new'), hint: () => (done('kidgrave') ? null : '밤에 다시 와 보자. 작은 빛이 돈다고 한다.'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'kidgrave', solid: true, bw: 10, bh: 5, st: () => (isNight() && !done('kidgrave') ? 1 : 0), verb: '무덤을 본다', text: async (c) => {
        await c.narr('아이 키만 한 작은 비석. 「여기 렙업을 꿈꾸던 아이 잠들다. 레벨 3.」\n옆에 목검 하나가 꽂혀 있다. 손잡이가 반질반질하다. 누군가 날마다 닦는 것 같다.');
        if (!f('kidgrave:seen')) { c.flag('kidgrave:seen'); learn('w_fade'); }
        if (!isNight() || done('kidgrave')) { if (!done('kidgrave')) await c.narr('[s]비석 아래 작게: 「밤이 되면 같이 놀아 줘.」[/]'); return; }
        await c.narr('작은 빛이 목검 둘레를 빙빙 돈다. 반딧불이가 아니다.');
        const k = await c.choice('빛이 목검 손잡이 위에서 멈춘다.', ['목검을 함께 쥔다', '가만히 지켜본다']);
        if (k === 0) {
          c.sfx('fairy'); G.fx.glow(X, Y - 12, '#e8fff0', 20);
          await c.narr('손바닥에 작은 손이 겹쳐진다. 아주 가볍게. 목검이 한 번 휘둘러진다. 휙.\n…「무한으로!」');
          if (inParty('toria')) await c.say('toria', '…찍. 나도 들었어. 레벨 3이면, 나보다 여섯 아래네. 잘 가.', { face: 'sad' });
          gainExp(80); finish(c, 'kidgrave', '목검이 꽂힌 무덤의 아이와 한 번 칼을 휘둘렀다.');
        } else await c.narr('빛이 한참 머물다 비석 뒤로 숨는다. 다음에 다시 놀자는 듯이.');
      } }));
    },
  });
  // ── 주인 잃은 낚싯대 ──
  tale({
    id: 'rod', regs: ['blue', 'mist'], near: 'water', name: '물가에 꽂힌 낚싯대', blurb: '「다음 사람이 써라. 큰 놈은 해 질 녘에 문다.」',
    state: () => (done('rod') ? 'done' : f('rod:seen') ? 'more' : 'new'), hint: () => (done('rod') ? null : S().tools.rod ? '해 질 녘에 찌를 던져 보자.' : '자기 낚싯대가 있어야 할 것 같다. (그린 연못의 엘름 영감)'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'rodstick', verb: '낚싯대를 본다', text: async (c) => {
        c.flag('rod:seen');
        await c.narr('진흙에 깊이 박힌 낚싯대. 손잡이에 쪽지가 감겨 있다.\n「다음 사람이 써라. 큰 놈은 해 질 녘에 문다. — 늙은 뱃사람」');
        if (done('rod')) { await c.narr('[s]네가 낚은 늪 메기 이야기가 쪽지 아래 연필로 덧붙여져 있다. 누가 썼을까.[/]'); return; }
        if (!S().tools.rod) { await c.narr('[s]낚싯대는 뽑히지 않는다. 자기 낚싯대를 가져오라는 뜻 같다.[/]'); return; }
        const k = await c.choice('내 낚싯대가 있다.', ['찌를 던진다', '그만둔다']);
        if (k !== 0) return;
        c.sfx('splash'); await c.wait(0.8);
        if (!isDusk()) { await c.narr('…입질이 없다. 쪽지 말대로라면 해 질 녘이다.'); return; }
        c.sfx('surprise'); c.shake(2, 0.4); await c.wait(0.4);
        await c.narr('찌가 쑥 들어간다! 한참을 버틴 끝에 — 팔뚝만 한 [y]늪 메기[/]다. 수염에 오래된 낚싯바늘이 셋이나 걸려 있다.');
        c.give('m_pearl', 2); c.give('food_udon', 1); gainExp(90);
        await c.say(null, '메기 배 속에서 [y]진주 2개[/]가 나왔다. 메기는 놓아주었다. [y]파도 우동[/] 하나를 대신 끓여 먹었다.', { style: 'sys' });
        finish(c, 'rod', '주인 잃은 낚싯대 자리에서 해 질 녘의 큰 놈을 낚았다.');
      } }));
    },
  });
  // ── 모래에 묻힌 대상 깃발 · 별 나침반 오아시스 ──
  tale({
    id: 'caravan', regs: ['yellow'], name: '모래에 묻힌 깃대', blurb: '「일곱 낙타, 여덟 사람, 아홉째 날.」 사라진 대상의 깃대.',
    state: () => (done('caravan') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'flagpole', solid: true, bw: 6, bh: 4, gy: 30, verb: '깃대를 살핀다', glint: () => !done('caravan'), text: async (c) => {
        learn('f_caravan');
        await c.narr('반쯤 모래에 묻힌 깃대. 찢긴 깃발이 바람에 펄럭인다. 칼끝으로 새긴 글: 「일곱 낙타, 여덟 사람, 아홉째 날.」');
        if (isNight()) await c.narr('[s]밤하늘 아래 깃대 끝의 쇠 장식이 별빛을 받아 북동쪽을 가리킨다. 그쪽에 오아시스가 있다고 한다.[/]');
        if (done('caravan')) return;
        const k = await c.choice('깃대 둘레 모래가 이상하게 볼록하다.', ['손으로 모래를 판다', '그냥 둔다']);
        if (k !== 0) return;
        c.sfx('rock'); await c.wait(0.4);
        await c.narr('모래 속에서 대상의 짐 상자 하나가 나왔다. 향신료 냄새가 아직 진하다.');
        c.give('m_sand', 4); c.gold(250); await c.getItem('potion_g', 1, { quiet: true });
        finish(c, 'caravan', '모래에 묻힌 대상 「일곱 낙타」의 짐을 찾았다.');
      } }));
    },
  });
  tale({
    id: 'oasis', regs: ['yellow'], near: 'water', area: [5, 4], name: '별 나침반 오아시스', blurb: '우물 돌에 새긴 별 나침반. 별이 떠야 읽힌다.',
    state: () => (done('oasis') ? 'done' : 'new'), hint: () => (done('oasis') ? null : '별 나침반은 밤에만 읽을 수 있다.'),
    build(m, x, y) { G.build.placeBuilding(m, { special: 'well', tx: x, ty: y - 1, w: 1, h: 1, door: false }); },
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y + 8, art: 'pond', verb: '우물 돌을 본다', glint: () => isNight() && !done('oasis'), text: async (c) => {
        const st = S(), d = G.st.derive(st); st.hp = Math.min(d.hpMax, st.hp + Math.ceil(d.hpMax / 2)); c.sfx('heal');
        await c.narr('오아시스의 우물. 물이 차고 달다. 몸이 반쯤 살아났다.');
        if (!isNight()) { await c.narr('우물 돌에 별 그림이 빼곡히 새겨져 있다. 해가 떠 있으니 무엇을 가리키는지 모르겠다.\n[s]별이 뜨면 다시 보자.[/]'); return; }
        await c.narr('별빛 아래, 돌에 새긴 별과 하늘의 별이 하나하나 겹친다. 국자 모양 일곱 별. 그 끝에서 다섯 걸음 — 길잡이별.');
        learn('f_stars');
        if (!done('oasis')) { gainExp(70); finish(c, 'oasis', '오아시스 우물의 별 나침반을 읽었다.'); }
      } }));
    },
  });
  // ── 거울 연못의 아이 ──
  tale({
    id: 'mirror', regs: ['purple'], near: 'water', name: '거울 연못', blurb: '물에 비친 얼굴이 반 박자 늦게 웃는 연못.',
    state: () => (done('mirror') ? 'done' : 'new'), hint: () => (done('mirror') ? null : '진실의 거울로 비춰 보면…'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'pond', verb: '물을 들여다본다', text: async (c) => {
        await c.narr('잔잔한 연못. 물에 비친 얼굴이 반 박자 늦게 웃는다.');
        if (done('mirror')) { await c.narr('[s]이제는 제때 웃는다.[/]'); return; }
        if (!S().tools.mirror) { await c.narr('[s]물속 얼굴이 무언가 말하려는 것 같다. 들리지 않는다.[/]'); return; }
        c.sfx('mirror'); G.fx.glow(X, Y, '#c8b0ff', 22);
        await c.narr('진실의 거울을 비추자, 물속에 라벤더 학원 교복을 입은 아이가 보인다. 네 얼굴이 아니다.');
        await c.say(null, '「…시험? 내가 대신 봐 줬어. 합격이야. 축하해.」', { style: 'narr' });
        await c.say(null, '「이제 돌아가도 돼. 근데 너, 그 학생 아니지? …뭐 어때. 이거 가져가. 시험지 대신 들고 있던 거야.」', { style: 'narr' });
        await c.getItem('potion_forget', 1); gainExp(80);
        if (inParty('toria')) await c.say('toria', '찍… 거울 속 아이가 자기가 누구 대신인지 잊어버렸나 봐.', { face: 'think' });
        finish(c, 'mirror', '거울 연못에서 누군가의 대신이던 아이를 만났다.');
      } }));
    },
  });
  // ── 눈사람 셋 ──
  tale({
    id: 'snowmen', regs: ['white'], name: '눈사람 셋', blurb: '하나만 코가 없는 눈사람 셋. 밤이 되면 자리를 바꾼다고 한다.',
    state: () => (done('snowmen') ? 'done' : f('snow:nose') ? 'more' : 'new'), hint: () => (done('snowmen') ? null : f('snow:nose') ? '밤에 다시 와 보자.' : '코 없는 눈사람에게 먹을 것으로 코를 달아 주자.'),
    spawn(Wd, X, Y) {
      const pos = (i) => (isNight() && f('snow:nose') ? [[-14, 6], [0, -2], [14, 6]][i] : [[-14, 0], [0, 2], [14, 0]][i]);
      for (let i = 0; i < 3; i++) {
        const [dx, dy] = pos(i);
        Wd.add(new Thing({ x: X + dx, y: Y + dy, art: 'snowman', solid: true, bw: 10, bh: 5, st: () => (i !== 1 || f('snow:nose') ? 1 : 0), verb: i === 1 && !f('snow:nose') ? '눈사람을 본다' : '눈사람을 본다', text: async (c) => {
          if (i !== 1) { await c.narr(['왼쪽 눈사람. 모자 대신 양동이. 꽤 멋있다.', '', '오른쪽 눈사람. 웃는 입을 조약돌로 만들었다. 하나가 빠져서 윙크하는 것 같다.'][i]); return; }
          if (!f('snow:nose')) {
            await c.narr('가운데 눈사람만 코가 없다. 왠지 시무룩해 보인다.');
            const food = hasFood(); if (!food) { await c.narr('[s]코로 꽂아 줄 만한 게 없다. 먹을 거라도 있으면…[/]'); return; }
            const k = await c.choice('가방에 ' + D.ITEMS[food].name + '이(가) 있다.', ['코로 꽂아 준다', '아깝다']);
            if (k !== 0) return;
            c.take(food); c.flag('snow:nose'); c.sfx('pop'); await c.narr('코가 생겼다. 눈사람이… 조금 웃는 것 같다. 기분 탓이겠지.'); return;
          }
          if (!isNight() || done('snowmen')) { await c.narr(done('snowmen') ? '눈사람 셋이 나란히 서 있다. 밤마다 조금씩 자리가 바뀐다는 소문이다.' : '코 단 눈사람이 의젓하게 서 있다.\n[s]밤이 되면 무언가 달라질 것 같다.[/]'); return; }
          await c.narr('…눈사람들 자리가 바뀌어 있다. 셋이 둥글게, 마치 춤이라도 춘 것처럼. 가운데 눈사람 발치에 작은 꾸러미가 놓여 있다.');
          c.give('food_bread', 2); c.give('m_ice', 3); gainExp(60);
          await c.say(null, '[y]눈꽃 빵 2개[/]와 [y]얼음 결정 3개[/]. 「코 고마워」라고 눈에 새겨져 있다.', { style: 'sys' });
          finish(c, 'snowmen', '눈사람 셋에게서 코 값을 받았다.');
        } }));
      }
    },
  });
  // ── 얼음 속 편지 ──
  tale({
    id: 'iceletter', regs: ['white'], name: '얼음 속 편지', blurb: '983년 겨울, 부치지 못한 병사의 편지.',
    state: () => (done('iceletter') ? 'done' : 'new'), hint: () => (done('iceletter') ? null : '불이 있으면 얼음을 녹일 수 있다. (등불 · 불 주문 · 불꽃 검)'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'iceblock', solid: true, bw: 12, bh: 6, st: () => (done('iceletter') ? 1 : 0), glint: () => !done('iceletter'), verb: '얼음을 본다', text: async (c) => {
        if (done('iceletter')) { await c.narr('얼음이 녹은 자리. 편지는 수첩 사이에 잘 끼워 두었다.'); return; }
        await c.narr('투명한 얼음덩이 속에 접힌 종이 한 장. 봉투에 「어머니께」.');
        if (!hasFire()) { await c.narr('[s]불이 있으면 녹일 수 있겠다. 등불이나 불 주문, 불꽃 검 같은.[/]'); return; }
        c.sfx('fire'); G.fx.sparks(X, Y - 10, 10, '#ffb040'); await c.wait(0.5); c.sfx('melt');
        await c.narr('얼음이 천천히 녹는다. 편지가 젖지 않게 조심히 꺼냈다.');
        learn('f_letter983');
        for (const pg of D.LIBRARY.f_letter983.pages) await c.narr(pg);
        gainExp(70); finish(c, 'iceletter', '983년 겨울의 부치지 못한 편지를 얼음에서 꺼냈다.');
      } }));
    },
  });
  // ── 녹슨 자동인형 ──
  tale({
    id: 'automaton', regs: ['gray', 'colorful'], name: '녹슨 자동인형', blurb: 'N-03. 탑 둘레 빛 흐름을 재던 자동인형. 톱니 셋이 빠졌다.',
    state: () => (done('automaton') ? 'done' : 'new'), hint: () => (done('automaton') ? null : '녹슨 톱니 3개가 있으면 고칠 수 있다. (' + Math.min(3, S().inv.m_gear || 0) + '/3)'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'automaton', solid: true, bw: 14, bh: 6, st: () => (done('automaton') ? 1 : 0), verb: '자동인형을 살핀다', text: async (c) => {
        if (done('automaton')) { await c.narr('N-03이 눈을 반짝이며 하늘을 본다. 아직도 무언가를 재고 있다.'); return; }
        await c.narr('주저앉은 자동인형. 가슴판에 「N-03」. 가슴판이 열려 있고, 톱니 자리 셋이 비어 있다.');
        const have = S().inv.m_gear || 0;
        if (have < 3) { await c.narr('[s]녹슨 톱니 셋이면 맞을 것 같다. (' + have + '/3)[/]'); return; }
        const k = await c.choice('녹슨 톱니가 ' + have + '개 있다.', ['톱니를 끼운다', '그만둔다']);
        if (k !== 0) return;
        c.take('m_gear', 3); c.sfx('clank'); await c.wait(0.4); c.sfx('switch');
        await c.narr('딸깍. 딸깍. 딸깍. 눈에 파란 불이 들어온다. 가슴 속 수정에서 갈라진 목소리가 흘러나온다.');
        learn('f_automaton');
        for (const pg of D.LIBRARY.f_automaton.pages) await c.narr(pg);
        if (inParty('sepia')) await c.say('sepia', '…N-03. 내 언니야. 계속 보고하고 있었구나. 아무도 안 듣는데.', { face: 'sad' });
        c.give('m_star', 2); c.gold(400); gainExp(120);
        await c.say(null, '자동인형이 손바닥을 펼친다. [y]별 부스러기 2개[/]. 재던 것을 모아 둔 것 같다.', { style: 'sys' });
        finish(c, 'automaton', '녹슨 자동인형 N-03을 고쳤다. 그것은 계속 보고하고 있었다.');
      } }));
    },
  });
  // ── 색 바랜 벽화 ──
  tale({
    id: 'mural', regs: ['gray'], area: [6, 4], name: '색 바랜 벽화', blurb: '은빛 왕국 사람들이 그린 벽. 「우리는 빛을 너무 사랑했다.」',
    state: () => (done('mural') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'mural', solid: true, bw: 30, bh: 6, gy: 26, verb: '벽화를 본다', text: async (c) => {
        learn('f_mural');
        for (const pg of D.LIBRARY.f_mural.pages) await c.narr(pg);
        if (!done('mural')) { gainExp(90); finish(c, 'mural', '그레이 들판에서 은빛 왕국의 벽화를 보았다.'); }
      } }));
    },
  });
  // ── 꺼진 등불 기둥 셋 ──
  const lampN = () => [1, 2, 3].filter((i) => f('lamp:' + i)).length;
  tale({
    id: 'lamps', regs: ['black'], area: [13, 4], name: '꺼진 등불 기둥', blurb: '옛 등불지기가 남긴 기둥 셋. 다 켜면 길이 기억하던 곳을 비춘다.',
    state: () => (done('lamps') ? 'done' : lampN() ? 'more' : 'new'), hint: () => (done('lamps') ? null : S().tools.lantern ? '기둥 셋에 모두 불을 붙이자. (' + lampN() + '/3)' : '등불이 있어야 불을 옮겨 붙일 수 있다.'),
    spawn(Wd, X, Y) {
      for (let i = 1; i <= 3; i++) {
        const lx = X + (i - 2) * 80;
        const e = Wd.add(new Thing({ x: lx, y: Y, art: 'lamp', solid: true, bw: 8, bh: 4, gy: 30, st: () => (f('lamp:' + i) ? 1 : 0), verb: () => (f('lamp:' + i) ? '등불을 본다' : '등불을 붙인다'), text: async (c) => {
          if (f('lamp:' + i)) { await c.narr('등불이 조용히 탄다. 어둠이 한 걸음 물러나 있다.'); return; }
          if (!S().tools.lantern) { await c.narr('꺼진 등불 기둥. 유리 안에 심지가 남아 있다.\n[s]불을 옮겨 붙일 등불이 있으면…[/]'); return; }
          c.flag('lamp:' + i); c.sfx('lamp'); G.fx.glow(lx, Y - 24, '#ffe080', 14);
          const n = lampN();
          await c.narr('등불에서 불씨를 옮겨 붙였다. (' + n + ' / 3)');
          if (n === 3) {
            learn('t_lamp'); c.jingle('secret');
            await c.narr('세 기둥이 한꺼번에 밝아진다. 가운데 기둥 아래, 그림자에 묻혀 있던 상자가 드러났다.');
            gainExp(120); finish(c, 'lamps', '블랙의 꺼진 등불 기둥 셋을 다시 밝혔다.');
          }
        } }));
        e.glowR = 0; e.tick = (dt, me) => { const on = f('lamp:' + i); me.glowR = on ? 46 + Math.sin(me.t * 7) : 0; me.lit = on; };
      }
      const prize = S().inv.ac_mp ? 'potion_g' : 'ac_mp';
      const ch = new G.props.Chest({ x: X, y: Y + 22, item: prize, n: 1, flagKey: 'tale:lamps:chest', col: '#6a5aa8' });
      ch.hiddenUntil = 'tale:lamps'; if (!f('tale:lamps')) ch.hidden = true;
      Wd.add(ch);
    },
  });
  // ── 검은 고양이 ──
  tale({
    id: 'cat', regs: ['black', 'blue'], near: 'road', area: [4, 3], name: '상자 위의 검은 고양이', blurb: '빵은 거들떠보지 않는 고양이. 생선 냄새를 좋아한다.',
    state: () => (done('cat') ? 'done' : 'new'), hint: () => (done('cat') ? null : '생선 냄새 나는 음식을 좋아하는 것 같다. (파도 우동)'),
    build(m, x, y) { const i = m.i(x + 1, y); if (m.inb(x + 1, y)) m.obj[i] = O.CRATE; },
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'cat', st: () => (done('cat') ? 1 : 0), verb: '고양이를 부른다', text: async (c) => {
        c.sfx('emote');
        if (done('cat')) { await c.narr('고양이가 네 다리에 몸을 한 번 비비고, 다시 상자 위로 올라간다. 냐.'); return; }
        if ((S().inv.food_udon || 0) > 0) {
          const k = await c.choice('고양이가 가방 냄새를 킁킁 맡는다. 파도 우동 냄새다.', ['우동을 덜어 준다', '안 준다']);
          if (k !== 0) { await c.narr('고양이가 실망한 눈으로 쳐다본다. 오래.'); return; }
          c.take('food_udon'); await c.narr('고양이가 국물까지 싹 핥아 먹었다. 그러더니 상자 뒤로 사라졌다가 — 무언가를 물고 돌아왔다.');
          await c.getItem(S().inv.ac_roll ? 'potion_g' : 'ac_roll', 1); gainExp(40);
          finish(c, 'cat', '검은 고양이에게 우동을 나눠 주고 선물을 받았다.'); return;
        }
        if (hasFood()) { await c.narr('고양이가 빵 냄새를 맡더니 고개를 홱 돌린다. 생선 냄새가 나는 게 좋은가 보다.'); return; }
        await c.narr('고양이가 네 가방을 한 번 보고 하품을 한다.');
      } }));
    },
  });
  // ── 떨어진 별 조각 ──
  tale({
    id: 'starfall', regs: ['mist', 'colorful', 'amber'], name: '그을린 구덩이', blurb: '둥글게 그을린 땅. 밤이 되면 가운데가 빛난다.',
    state: () => (done('starfall') ? 'done' : 'new'), hint: () => (done('starfall') ? null : '밤에 다시 오자.'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'crater', st: () => (isNight() && !done('starfall') ? 1 : 0), glint: () => isNight() && !done('starfall'), verb: '구덩이를 살핀다', text: async (c) => {
        if (done('starfall')) { await c.narr('그을린 구덩이. 이제는 빛나지 않는다.'); return; }
        if (!isNight()) { await c.narr('땅이 둥글게 그을렸다. 가운데가 아직 따뜻하다.\n[s]밤에 다시 와 보면…[/]'); return; }
        c.sfx('crystal'); G.fx.glow(X, Y - 6, '#8ad8ff', 22);
        await c.narr('구덩이 한가운데에서 파란 조각이 빛난다. 손에 쥐자 따끔하고, 따뜻하다. 하늘에서 떨어진 별의 부스러기다.');
        c.give('m_star', 3); gainExp(80);
        await c.say(null, '[y]별 부스러기 3개[/]를 얻었다.', { style: 'sys' });
        finish(c, 'starfall', '그을린 구덩이에서 밤에만 빛나는 별 조각을 주웠다.');
      } }));
    },
  });
  // ── 메아리 바위 ──
  tale({
    id: 'echo', regs: ['amber'], name: '입 벌린 바위', blurb: '말을 걸면 대답하는 바위. 가끔 다른 이름으로.',
    state: () => (done('echo') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'echorock', solid: true, bw: 24, bh: 8, gy: 26, verb: '바위에 말을 건다', text: async (c) => {
        const name = (S().name || '나');
        const k = await c.choice('바위 가운데 입처럼 벌어진 구멍이 있다.', ['내 이름을 부른다', '노래를 부른다', '아무 말도 하지 않는다']);
        c.sfx('wind');
        if (k === 0) { await c.narr('「' + name + '!」\n…' + name + '… ' + name + '… ' + name + '…'); if (!done('echo')) { await c.wait(0.6); await c.narr('…에벨린…\n[s]네가 부르지 않은 이름이 하나 섞여 돌아왔다.[/]'); if (inParty('toria')) await c.say('toria', '찍?! 방금… 할머니 이름 맞지? 협곡이 할머니를 알아?', { face: 'shock' }); } }
        else if (k === 1) await c.narr('흥얼거리자 협곡이 화음을 넣어 따라 부른다. 생각보다 잘 부른다. 조금 분하다.');
        else await c.narr('가만히 있자, 협곡이 먼저 말을 건다.\n…돌아와…\n[s]누구에게 하는 말인지는 알 수 없다.[/]');
        learn('t_echo');
        if (!done('echo')) { gainExp(70); finish(c, 'echo', '단풍 협곡의 입 벌린 바위가 할머니의 이름을 대답했다.'); }
      } }));
    },
  });
  // ── 거꾸로 선 이정표 ──
  tale({
    id: 'upsign', regs: ['mist', 'amber', 'red'], near: 'road', area: [3, 3], name: '하늘을 가리키는 이정표', blurb: '「하늘섬 ↑ 12,000칸 · 땅속 ↓ 3칸」',
    state: () => (done('upsign') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'upsign', solid: true, bw: 8, bh: 4, gy: 28, verb: '이정표를 읽는다', text: async (c) => {
        await c.narr('이정표 둘. 위를 가리키는 판: 「하늘섬 ↑ 12,000칸」. 아래를 가리키는 판: 「땅속 ↓ 3칸」.');
        if (ST.regionOpen('rainbow')) await c.narr('[s]누군가 위쪽 판에 덧썼다: 「구름고래 타면 금방임. — 다녀온 사람」[/]');
        else await c.narr('[s]아래쪽 판 밑을 파 보았다. 3칸쯤에서 지렁이가 인사했다.[/]');
        if (!done('upsign')) { gainExp(25); finish(c, 'upsign'); }
      } }));
    },
  });
  // ── 시험탑 0호의 잔해 ──
  tale({
    id: 'tower0', regs: ['red', 'green'], area: [6, 4], name: '시험탑 0호의 잔해', blurb: '983년 가을, 빛 흐름 역류로 무너진 첫 시험탑.',
    state: () => (done('tower0') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'wreck', solid: true, bw: 24, bh: 6, verb: '잔해를 살핀다', text: async (c) => {
        await c.narr('무너진 탑의 토막들. 쇠판에 새긴 글: 「시험탑 0호. 983년 가을. 빛 흐름 역류로 붕괴. 사상자 없음.」');
        await c.narr('그 아래 누군가 못으로 긁었다: 「사상자 없음? 우리 밭은 그해 아무것도 안 자랐다.」');
        learn('w_tower');
        if (inParty('toria')) await c.say('toria', '찍… 탑도 무너지는구나. 다행이다… 아니, 다행이라고 하면 안 되나?', { face: 'think' });
        if (!done('tower0')) { c.give('m_crystal', 1); gainExp(60); await c.say(null, '꼭대기 수정 조각을 주웠다. 아직 차갑다. [y]황금 수정[/]', { style: 'sys' }); finish(c, 'tower0', '시험탑 0호의 잔해를 보았다.'); }
      } }));
    },
  });
  // ── 기사 제114호의 투구 ──
  tale({
    id: 'helmet', regs: ['red', 'amber', 'yellow'], near: 'road', area: [3, 3], name: '말뚝 위의 투구', blurb: '허용 손실 명단에 서명하지 않은 징수 기사의 투구.',
    state: () => (done('helmet') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'helmet', solid: true, bw: 6, bh: 4, gy: 28, verb: '투구를 본다', text: async (c) => {
        await c.narr('말뚝에 걸린 징수 기사단의 투구. 이마에 「114」. 안쪽에 접힌 쪽지가 끼워져 있다.');
        learn('f_knight');
        for (const pg of D.LIBRARY.f_knight.pages) await c.narr(pg);
        if (!done('helmet')) { c.give('m_tag', 1); gainExp(50); finish(c, 'helmet', '말뚝 위의 투구 — 징수 기사 제114호는 이름이 적힌 명단에 서명하지 않았다.'); }
      } }));
    },
  });
  // ── 꽃이 피는 바위 ──
  tale({
    id: 'flower', regs: ['green', 'purple'], name: '갈라진 바위', blurb: '틈에 흙이 고인 바위. 씨앗을 심으면 다음 날 꽃을 피운다.',
    state: () => (done('flower') ? 'done' : f('flower:day') ? 'more' : 'new'), hint: () => (done('flower') ? null : f('flower:day') ? '하루가 지나면 다시 와 보자.' : '덩굴 씨앗 둘이 있으면 심을 수 있다. (' + Math.min(2, S().inv.m_seed || 0) + '/2)'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'flowerrock', solid: true, bw: 18, bh: 6, st: () => (done('flower') ? 2 : f('flower:day') ? (today() > S().flags['flower:day'] ? 2 : 1) : 0), verb: '바위를 살핀다', text: async (c) => {
        if (done('flower')) { await c.narr('바위가 꽃을 이고 있다. 벌들이 바쁘다.'); return; }
        const pd = S().flags['flower:day'];
        if (pd != null) {
          if (today() <= pd) { await c.narr('바위 틈에 싹이 하나 올라왔다.\n[s]내일이면 피어 있을까.[/]'); return; }
          c.sfx('fairy'); G.fx.leaves(X, Y - 10, 14, '#ffb0e0');
          await c.narr('바위가 꽃을 이고 있다! 다섯 빛깔 꽃. 꽃 사이로 이슬 맺힌 작은 병 하나가 놓여 있다. 누가 두고 간 걸까.');
          await c.getItem('potion_g', 1, { quiet: true }); gainExp(60);
          finish(c, 'flower', '갈라진 바위에 씨앗을 심어 꽃을 피웠다.'); return;
        }
        await c.narr('바위가 한가운데서 갈라져 있다. 틈에 고운 흙이 고였다.');
        if ((S().inv.m_seed || 0) < 2) { await c.narr('[s]씨앗이 있으면 심을 수 있겠다. (덩굴 씨앗 ' + (S().inv.m_seed || 0) + '/2)[/]'); return; }
        const k = await c.choice('덩굴 씨앗이 있다.', ['씨앗 둘을 심는다', '그만둔다']);
        if (k !== 0) return;
        c.take('m_seed', 2); S().flags['flower:day'] = today(); c.sfx('pop'); await c.narr('씨앗을 심고 물병의 물을 조금 부었다.\n[s]하루가 지나면 다시 와 보자.[/]');
      } }));
    },
  });
  // ── 안개 속 종 ──
  tale({
    id: 'bell', regs: ['mist'], near: 'water', name: '늪가의 종 기둥', blurb: '「세 번 치면 내가 간다. 네 번 치면 가지 않는다. 다섯 번은 치지 마라.」',
    state: () => (done('bell') ? 'done' : 'new'), hint: () => (done('bell') ? null : '종은 밤에만 소리가 맑다.'),
    spawn(Wd, X, Y) {
      let swing = 0;
      Wd.add(new Thing({ x: X, y: Y, art: 'bell', solid: true, bw: 6, bh: 4, gy: 30, st: () => swing, tick: (dt) => { if (swing > 0) swing -= dt; }, verb: '종을 친다', text: async (c) => {
        learn('f_ferry');
        await c.narr('기둥 아래 나무판: 「종을 세 번 치면 내가 간다. 네 번 치면 가지 않는다. 다섯 번은 치지 마라.」');
        if (!isNight()) { swing = 1; c.sfx('bell'); await c.narr('종이 젖어 소리가 둔하다. 팅. 안개에 먹힌다.\n[s]밤이면 소리가 맑을까.[/]'); return; }
        const k = await c.choice('종을 몇 번 칠까.', ['세 번', '네 번', '다섯 번', '치지 않는다']);
        if (k === 3) return;
        const n = k + 3;
        for (let i = 0; i < n; i++) { swing = 1; c.sfx('bell'); await c.wait(0.55); }
        if (n === 3) {
          await c.narr('안개 저편에서 노 젓는 소리. 등불 하나가 다가오다가 — 물가 조금 앞에서 멈춘다. 배 위의 사람은 얼굴이 없다. 모자뿐이다.');
          await c.say(null, '「…부른 사람이 너냐. 오랜만이군. 건널 거냐?」', { style: 'narr' });
          await c.say(null, '「…아니라고? 그럼 이야기나 하나 하지. 이 늪엔 기다리는 사람이 많다. 나는 그 사람들을 건네주지 않는다. 기다리는 게 그 사람들 일이니까.」', { style: 'narr' });
          await c.narr('등불이 다시 안개 속으로 멀어진다. 노 소리가 늦게, 아주 늦게 따라간다.');
          if (!done('bell')) { gainExp(80); finish(c, 'bell', '안개 늪의 종을 세 번 쳐 얼굴 없는 뱃사공을 만났다.'); }
        } else if (n === 4) await c.narr('…아무도 오지 않는다. 약속대로.');
        else {
          c.sfx('heartbeat'); c.shake(2, 0.6);
          await c.narr('다섯 번째 종소리가 안개에 먹히지 않고 — 되돌아온다. 한 번 더. 네가 치지 않은 여섯 번째.');
          if (c.abyss('bell5')) await c.narr('[r]무언가 대답했다.[/] 안개 속에서 눈 하나가 떴다가, 감겼다.');
          const e = c.foe('wisp', X + 30, Y + 20, { tier: Math.max(2, OW.TIERS.mist || 4), elite: true }); if (e) { e.aggro = true; e.name = '여섯 번째 종소리'; }
        }
      } }));
    },
  });
  // ── 추락한 글라이더 ──
  tale({
    id: 'glider', regs: ['colorful', 'yellow'], area: [6, 4], name: '추락한 글라이더', blurb: '무한호 제117안. 십이 초 동안 하늘이 진짜 가까웠다.',
    state: () => (done('glider') ? 'done' : f('glider:seen') ? 'more' : 'new'), hint: () => (done('glider') ? null : '찢어진 날개 천을 기울 구름 솜 둘이 있으면… (' + Math.min(2, S().inv.m_cloud || 0) + '/2)'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'glider', solid: true, bw: 24, bh: 6, verb: '글라이더를 살핀다', text: async (c) => {
        if (!f('glider:seen')) { c.flag('glider:seen'); learn('f_glider'); }
        await c.narr('나무 뼈대에 천을 씌운 커다란 날개. 한쪽이 부러졌다. 꼬리에 「제117안」.');
        if (done('glider')) { await c.narr('[s]기운 날개 천이 바람에 부푼다. 언젠가 누가 다시 띄우겠지.[/]'); return; }
        if ((S().inv.m_cloud || 0) < 2) { await c.narr('[s]날개 천이 찢어졌다. 아주 가볍고 질긴 것으로 기우면…(구름 솜 ' + (S().inv.m_cloud || 0) + '/2)[/]'); return; }
        const k = await c.choice('구름 솜이 있다.', ['날개 천을 기운다', '그만둔다']);
        if (k !== 0) return;
        c.take('m_cloud', 2); c.sfx('cut');
        await c.narr('구름 솜으로 찢어진 천을 기웠다. 바람이 불자 날개가 저 혼자 한 뼘 떠오른다. 그리고 내려앉는다. 만족스러운 듯이.');
        c.gold(300); gainExp(90);
        await c.say(null, '조종석 밑 공구함에서 [y]300골드[/]와 쪽지: 「고쳐 준 사람에게. 제118안은 더 멀리 간다. — 봄바」', { style: 'sys' });
        finish(c, 'glider', '추락한 글라이더 제117안의 날개를 기워 주었다.');
      } }));
    },
  });
  // ── 초록 창이 부러진 자리 ──
  tale({
    id: 'spear', regs: ['green'], area: [5, 4], name: '오래된 비석', blurb: '「983년 겨울. 사천왕 초록 에벨린, 챔피언과 겨루다. 한 합.」',
    state: () => (done('spear') ? 'done' : 'new'), hint: () => null,
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'spear', solid: true, bw: 12, bh: 6, gy: 28, verb: '비석을 읽는다', text: async (c) => {
        learn('f_spear');
        for (const pg of D.LIBRARY.f_spear.pages) await c.narr(pg);
        if (inParty('toria') && !done('spear')) await c.say('toria', '…할머니. 「내려놓았을 뿐이다」래. 찍. 누가 새겼을까.', { face: 'sad' });
        if (!done('spear')) { gainExp(50); finish(c, 'spear', '초록 창이 부러졌다는 자리에 섰다. 「내려놓았을 뿐이다.」'); }
      } }));
    },
  });
  // ── 옛 전장 ──
  tale({
    id: 'battle', regs: ['red', 'yellow'], area: [6, 5], name: '색 전쟁의 옛 전장', blurb: '찢긴 깃발과 화살촉. 원년 이전의 싸움터.',
    state: () => (done('battle') ? 'done' : 'new'), hint: () => null,
    build(m, x, y) { for (const [dx, dy] of [[-3, 1], [3, -1], [2, 2]]) { const i = m.i(x + dx, y + dy); if (m.inb(x + dx, y + dy) && !OW.roadTiles[i]) m.obj[i] = O.BONES; } },
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'battlefield', solid: true, bw: 6, bh: 4, gy: 28, verb: '옛 전장을 살핀다', text: async (c) => {
        learn('h_war');
        await c.narr('찢긴 깃발 하나. 땅에는 녹슨 화살촉이 셀 수 없이 박혀 있다. 빛깔을 두고 싸우던 시절의 것이다.');
        const s = S();
        if (s.weapon === 'bow' && s.tools.bow) { await c.narr('활을 든 손이 근질거린다. 아직 쓸 만한 화살촉을 골라 화살을 몇 대 깎았다.'); s.ammo.arrows = s.ammo.arrowsMax; c.sfx('item'); }
        else if (s.weapon === 'magic') await c.narr('땅에 남은 빛의 찌꺼기가 지팡이 끝에서 파르르 떤다. 여기서 많은 빛이 흩어졌다.');
        else await c.narr('칼자국이 난 돌. 누군가 여기서 끝까지 버텼다.');
        if (!done('battle')) { c.give('m_ore', 2); gainExp(50); finish(c, 'battle', '색 전쟁의 옛 전장을 지났다.'); }
      } }));
    },
  });

  // ── 이정표에 매달린 장화 (바람 장화) ──
  tale({
    id: 'boots', regs: ['red', 'yellow'], near: 'road', area: [4, 3], name: '이정표에 매달린 장화', blurb: '「다 닳도록 굴렀다. 이제 네가 굴러라.」 바람이 불면 장화가 저 혼자 달린다.',
    state: () => (done('boots') ? 'done' : 'new'), hint: () => (done('boots') ? null : '레드 · 옐로 길가 어딘가, 바람 부는 이정표.'),
    spawn(Wd, X, Y) {
      Wd.add(new Thing({ x: X, y: Y, art: 'bootpost', solid: true, bw: 8, bh: 5, st: () => (done('boots') ? 1 : 0), glint: () => !done('boots'), verb: () => (done('boots') ? '이정표를 본다' : '장화를 내린다'), text: async (c) => {
        if (done('boots')) { await c.narr('빈 이정표. 장화가 매달렸던 끈 자국만 남았다. 바람이 지나가며 휘파람을 분다.'); return; }
        await c.narr('낡은 이정표에 장화 한 켤레가 끈으로 묶여 매달려 있다. 바람이 불 때마다 장화가 허공을 달리듯 흔들린다.');
        await c.narr('밑창에 칼로 새긴 글씨. 「다 닳도록 굴렀다. 길 위에서 넘어진 적은 많아도 멈춘 적은 없다. 이제 네가 굴러라. — 늙은 파발꾼」');
        await c.getItem('boots');
        await c.say(null, '[y]바람 장화[/] — 가지고만 있으면 구르기가 더 멀리 나간다. 금 간 벽에 굴러 부딪치면 벽이 흔들려 폭탄 자리를 알려 준다.', { style: 'sys' });
        finish(c, 'boots', '길가 이정표에서 늙은 파발꾼의 바람 장화를 물려받았다.');
      } }));
    },
  });

  /* ═════════════ 4. 비문 (기술을 새긴 돌) ═════════════ */
  const TABLET_REG = { tb_tornado: ['amber', 'green'], tb_gale: ['white', 'red'], tb_tidal: ['blue'], tb_blades: ['yellow'], tb_judgment: ['gray'], tb_sunrain: ['colorful', 'yellow'], tb_eclipse: ['black'], tb_glacier: ['white'], tb_phoenix: ['red'], tb_storm: ['mist', 'amber'] };
  function tabletTales() {
    const SK = G.skills2; if (!SK || !SK.TABLETS) return;
    for (const tb of SK.TABLETS) {
      tale({
        id: tb.id, tablet: tb, regs: TABLET_REG[tb.id] || ['green'], near: tb.id === 'tb_tidal' ? 'water' : 'field', area: [4, 4], name: tb.title, blurb: '「' + tb.text[0].replace(/[「」]/g, '') + '」 — ' + SK.nameOf(tb.teach),
        state: () => (S().flags['tablet:' + tb.id] ? 'done' : 'new'), hint: () => (S().flags['tablet:' + tb.id] ? null : '필요: ' + G.prog.reqText(S(), tb.need).replace(/\[\/?[a-z]\]/g, '')),
        spawn(Wd, X, Y) {
          Wd.add(new Thing({ x: X, y: Y, art: 'stele', solid: true, bw: 12, bh: 6, gy: 32, st: () => { const r = SK.tabletRead(S(), tb); return r === 'read' ? 2 : r === 'need' ? 1 : 0; }, glint: () => SK.tabletRead(S(), tb) === 'ok', verb: '비문을 읽는다', text: async (c) => {
            const s = S(), r = SK.tabletRead(s, tb);
            for (const pg of tb.text) await c.narr(pg);
            if (r === 'read') { await c.narr('[s]이미 몸에 새긴 글이다. — ' + SK.nameOf(tb.teach) + '[/]'); return; }
            if (r === 'need') { c.sfx('buzz'); await c.narr('글자가 흐릿하게 떨린다. 아직 읽히지 않는다.\n[s]필요: ' + G.prog.reqText(s, tb.need).replace(/\[\/?[a-z]\]/g, '') + '[/]'); return; }
            s.flags['tablet:' + tb.id] = true; SK.learnTeach(s, tb.teach);
            c.sfx('learn'); G.fx.glow(X, Y - 18, '#8ad8ff', 26); G.fx.ring(X, Y - 14, '#8ad8ff', 30, 0.6, 2);
            await c.say(null, '비문의 글이 몸에 새겨진다 — [y]' + SK.nameOf(tb.teach) + '[/]을(를) 익혔다!' + (SK.isSp(tb.teach) ? ' (필살기 — 성장 › 스킬에서 고른다)' : ' (스킬 — 성장 › 스킬에서 고른다)'), { style: 'sys' });
            c.journal('비문 「' + tb.title + '」에서 ' + SK.nameOf(tb.teach) + '을(를) 익혔다.');
          } }));
        },
      });
    }
  }

  /* ═════════════ 5. 자리 잡기 (넓은 지도를 지을 때) ═════════════ */
  const SITES = [];          // { id, x, y, reg, tale }
  const NOTICES = [];        // { x, y, to, from }
  function reachMap(m) {
    const SN = G.sanity; if (!SN || !SN.analyze) return null;
    try {
      const AW = SN.analyze(m, SN.mainsOf(m), SN.linksOf(m), SN.passI);
      const fw = new Uint8Array(AW.L.nc), q = [];
      for (const [x, y] of SN.mainsOf(m)) { if (!m.inb(x, y)) continue; const c = AW.L.comp[m.i(x, y)]; if (c >= 0 && !fw[c]) { fw[c] = 1; q.push(c); } }
      while (q.length) { const c = q.pop(); const o = AW.J.get(c); if (o) for (const b of o) if (!fw[b]) { fw[b] = 1; q.push(b); } }
      const N = m.w * m.h, conn = new Uint8Array(N);
      for (let i = 0; i < N; i++) { const c = AW.L.comp[i]; if (c >= 0 && fw[c] && AW.good[c]) conn[i] = 1; }
      return conn;
    } catch (e) { console.error('[explore reach]', e); return null; }
  }
  const BADT = new Set([T.CLIFF, T.STAIRS, T.WATER, T.DEEP, T.LAVA, T.BRIDGE, T.CLOUD]);
  function areaOk(m, x0, y0, w, h, own) {
    if (!m.inb(x0, y0) || !m.inb(x0 + w - 1, y0 + h - 1)) return false;
    const hh = m.hgt[m.i(x0, y0)];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const i = m.i(x, y);
      if (m.hgt[i] !== hh || m.solidExtra[i] || OW.roadTiles[i] || OW.sea[i] || BADT.has(m.ter[i])) return false;
    }
    for (const wp of m.warps || []) if (Math.abs(wp.x - x0) < 12 && Math.abs(wp.y - y0) < 12) return false;
    for (const sd of ST.seeds || []) if (sd.map === 'world' && Math.abs(sd.x - x0) < 6 && Math.abs(sd.y - y0) < 6) return false;
    if (OW.inTown(x0, y0, 12) || OW.inTown(x0 + w, y0 + h, 12)) return false;
    for (const s of OW.stops || []) if (Math.abs(s.x - x0) < 11 && Math.abs(s.y - y0) < 11) return false;
    for (const s of SITES) if (s !== own && Math.abs(s.x - x0) < 13 && Math.abs(s.y - y0) < 13) return false;
    const HS = (ST.HIGH && ST.HIGH.sites) || [];
    for (const hs of HS) if (hs && hs.x != null && Math.abs(hs.x - x0) < 9 && Math.abs(hs.y - y0) < 9) return false;
    return true;
  }
  function waterNear(m, x, y, w, h, r) {
    for (let yy = y - r; yy < y + h + r; yy++) for (let xx = x - r; xx < x + w + r; xx++) { if (!m.inb(xx, yy)) continue; const t = m.ter[m.i(xx, yy)]; if (t === T.WATER || t === T.DEEP) return true; }
    return false;
  }
  OW.hooks.push((m) => {
    try {
      tabletTales();
      const conn = reachMap(m);
      // 길까지의 거리
      const N = m.w * m.h, rd = new Uint8Array(N).fill(255), q = [];
      for (let i = 0; i < N; i++) if (OW.roadTiles[i]) { rd[i] = 0; q.push(i); }
      for (let h = 0; h < q.length; h++) { const i = q[h], v = rd[i]; if (v >= 30) continue; const x = i % m.w, y = (i / m.w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue; const j = ny * m.w + nx; if (rd[j] > v + 1) { rd[j] = v + 1; q.push(j); } } }
      const rnd = U.rng(51713);
      for (const tl of TALES) {
        let ok = null;
        if (tl.near && tl.near.startsWith('rel:')) {
          const base = SITES.find((s) => s.id === tl.near.slice(4)); if (!base) continue;
          for (let r = 0; r < 6 && !ok; r++) for (let dy = -r; dy <= r && !ok; dy++) for (let dx = -r; dx <= r && !ok; dx++) { const x = base.x - 12 + dx, y = base.y + dy; if (areaOk(m, x - 1, y - 1, 3, 3, base) && (!conn || conn[m.i(x, y)])) ok = [x, y]; }
          if (!ok) ok = [base.x - 3, base.y + 2];
        } else {
          const [aw, ah] = tl.area;
          // 1차: 조건 그대로 · 2차: 물가 · 길 거리를 느슨하게 · 3차: 지역만 맞으면
          for (let pass = 0; pass < 3 && !ok; pass++) for (let tries = 0; tries < 4000 && !ok; tries++) {
            const x = 4 + Math.floor(rnd() * (m.w - 8)), y = 4 + Math.floor(rnd() * (m.h - 8)), i = m.i(x, y);
            if (!tl.regs.includes(OW.regName[i])) continue;
            if (conn && !conn[i]) continue;
            const r0 = rd[i];
            if (pass < 2 && tl.near === 'road' && (r0 < 3 || r0 > (pass ? 10 : 7))) continue;
            if (pass < 2 && tl.near === 'field' && r0 < (pass ? 4 : 6)) continue;
            if (pass < 2 && tl.near === 'water' && !waterNear(m, x - (aw >> 1), y - (ah >> 1), aw, ah, pass ? 6 : 3)) continue;
            if (!areaOk(m, x - (aw >> 1), y - (ah >> 1), aw, ah)) continue;
            ok = [x, y];
          }
        }
        if (!ok) { console.warn('[explore] 자리 못 찾음', tl.id); continue; }
        const [x, y] = ok, [aw, ah] = tl.area;
        OW.clear(m, x - (aw >> 1), y - (ah >> 1), aw, ah, m.hgt[m.i(x, y)], null);
        // 둘레의 큰 나무는 걷어 숲 속 빈터로 (나뭇잎이 이야기를 가리지 않게)
        for (let yy = y - (ah >> 1) - 1; yy < y - (ah >> 1) + ah + 3; yy++) for (let xx = x - (aw >> 1) - 2; xx < x - (aw >> 1) + aw + 2; xx++) { if (!m.inb(xx, yy)) continue; const k = m.i(xx, yy), od = OB.DEF[m.obj[k]]; if (od && od.big && !OW.roadTiles[k]) m.obj[k] = (U.hash('cl' + k) % 3 === 0) ? O.FLOWER : 0; }
        if (tl.build) tl.build(m, x, y);
        SITES.push({ id: tl.id, x, y, reg: OW.regName[m.i(x, y)], tale: tl });
      }
      // 알림판: 길이 지역을 넘는 자리 (양쪽 3칸 안쪽)
      const RT = OW.roadTiles, RN = OW.regName;
      for (let i = 0; i < N; i++) {
        if (!RT[i]) continue; const x = i % m.w, y = (i / m.w) | 0, a = RN[i];
        for (const [dx, dy] of [[1, 0], [0, 1]]) {
          const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue; const j = ny * m.w + nx, b = RN[j];
          if (!RT[j] || a === b) continue;
          for (const [from, to, sx, sy, ex, ey] of [[a, b, x, y, -dx, -dy], [b, a, nx, ny, dx, dy]]) {
            if (!NOTICE[to] || NOTICES.some((n) => n.to === to && n.from === from && Math.abs(n.x - sx) < 16 && Math.abs(n.y - sy) < 16)) continue;
            // 길을 따라 3칸 물러난 자리 옆
            let bx = sx + ex * 3, by = sy + ey * 3, put = null;
            for (const [ox, oy] of [[ey, ex], [-ey, -ex], [ey * 2, ex * 2], [-ey * 2, -ex * 2]]) {
              const tx = bx + ox, ty = by + oy; if (!m.inb(tx, ty)) continue; const k = m.i(tx, ty);
              if (RT[k] || RN[k] !== from || m.solidExtra[k] || BADT.has(m.ter[k]) || OW.sea[k] || m.obj[k]) continue;
              if ((m.warps || []).some((w) => Math.abs(w.x - tx) < 3 && Math.abs(w.y - ty) < 3)) continue;
              put = [tx, ty]; break;
            }
            if (put) NOTICES.push({ x: put[0], y: put[1], to, from });
          }
        }
      }
    } catch (e) { console.error('[explore place]', e); }
  });

  /* ═════════════ 6. 넓은 지도에 들어설 때 ═════════════ */
  ST.onMap('world', (m, Wd) => {
    for (const st of SITES) { try { st.tale.spawn(Wd, px(st.x), py(st.y), st); } catch (e) { console.error('[tale ' + st.id + ']', e); } }
    for (const n of NOTICES) {
      Wd.add(new G.props.Sign({ x: px(n.x), y: py(n.y), anyDir: true, text: async (c) => {
        const [title, body, by] = NOTICE[n.to];
        if (ST.regionOpen(n.to)) await c.narr('[s]빛바랜 알림판. 「' + title + '」 위에 누군가 크게 덧써 놓았다:[/]\n「길 열림! — ' + NAME(n.to) + ' 쪽으로 무사히 다녀오시오.」');
        else await c.narr('【' + title + '】\n' + body + '\n[s]— ' + by + '[/]');
      } }));
    }
  });

  /* ═════════════ 7. 발견 ═════════════ */
  const SHRINE_NM = { green: '초록의 사당', red: '불꽃의 사당', blue: '파도의 사당', yellow: '황금의 사당', purple: '노을의 사당', rainbow: '일곱 빛깔 사당', white: '눈의 사당', gray: '잿빛 사당', black: '밤의 사당', colorful: '발명의 사당', mist: '안개의 사당', amber: '메아리 사당' };
  const STOP = {
    camp: ['나그네 야영지', '모닥불과 나그네. 쉬어 가며 기록할 수 있다.'], sign: ['갈림길 이정표', '가까운 마을까지의 방향과 거리.'], shrine: [null, '하루 한 번 빌 수 있다. 날마다 축복이 다르다.'],
    peddler: ['떠돌이 행상', '날마다 다른 귀한 물건을 판다.'], ruin: ['무너진 초소', '정예가 지키는 상자. 밤엔 망령 기사가 선다.'], cart: ['부서진 수레', '짐이 그대로 남은 수레. 누군가 기다리고 있을지도.'],
    well: ['길가 우물', '물을 마시면 체력이 반쯤 찬다.'], nest: ['몬스터 둥지', '다 쓰러뜨리면 상자. 이틀이면 다시 찬다.'], riddle: ['수수께끼 비석', '날마다 글이 바뀌는 수수께끼.'],
    lookout: ['옛 전망대', '오르면 둘레의 지도가 밝아진다.'], grove: ['요정 샘 고목', '손을 담그면 몸이 가득 찬다.'], stones: ['선돌 고리', '가운데 서면 MP가 가득 찬다(처음 한 번).'],
    crystal: ['수정 광맥', '사흘마다 다시 자라는 광석.'], grave: ['외딴 무덤', '이름 없는 무덤의 글.'],
  };
  let PLACES = null;
  function places() {
    if (PLACES) return PLACES;
    PLACES = [];
    for (const s of OW.stops || []) { const [nm, blurb] = STOP[s.type] || ['길가의 자리', '']; PLACES.push({ id: 'st:' + s.id, x: s.x, y: s.y, reg: s.reg, kind: s.type, name: nm || SHRINE_NM[s.reg] || '사당', blurb }); }
    for (const st of SITES) PLACES.push({ id: 'tl:' + st.id, x: st.x, y: st.y, reg: st.reg, kind: st.tale.tablet ? 'tablet' : 'tale', name: st.tale.name, blurb: st.tale.blurb, tale: st.tale });
    return PLACES;
  }
  const MILE = [[15, 1], [40, 1], [80, 2]];
  function discover(pl) {
    const s = S(); s.disc = s.disc || {};
    if (s.disc[pl.id]) return;
    s.disc[pl.id] = Math.max(1, Math.round(s.t || 1));
    const all = places().filter((q) => q.reg === pl.reg), got = all.filter((q) => s.disc[q.id]).length;
    G.ui.toast('발견 — [y]' + pl.name + '[/] [s](' + NAME(pl.reg) + ' ' + got + '/' + all.length + ')[/]', 'gold');
    sfx('discover');
    G.fx.float(px(pl.x), py(pl.y) - 30, pl.name, '#ffe8a0', { life: 2.2, vy: -10 });
    gainExp(4 + (OW.TIERS[pl.reg] || 0) * 5);
    const n = Object.keys(s.disc).length;
    for (const [k, pts] of MILE) if (n >= k && !s.flags['disc:mile' + k]) { s.flags['disc:mile' + k] = true; s.pts = (s.pts || 0) + pts; G.ui.toast('발견 ' + k + '곳! [y]성장 점수 +' + pts + '[/]', 'gold'); if (G.audio) G.audio.jingle('secret'); }
    if (pl.kind === 'tale' || pl.kind === 'tablet') { s.log.unshift({ t: s.t, text: '[y]' + pl.name + '[/]을(를) 찾았다 — ' + NAME(pl.reg) + '.' }); if (s.log.length > 120) s.log.pop(); }
  }
  let discAcc = 0, startDone = false;
  ST.onTick.push((dt) => {
    weatherTick(dt);
    const Wd = W(), m = Wd.map, p = Wd.player, s = S();
    if (!p || !m || G.script.running) return;
    // 처음부터 가진 안내서 세 권
    if (!startDone) { startDone = true; if (!s.flags.libStart) { s.flags.libStart = true; for (const id of ['g_note', 'g_aim', 'g_explore']) G.lib.learn(s, id); } }
    if (!m.overworld) return;
    discAcc += dt; if (discAcc < 0.25) return; discAcc = 0;
    const tx = p.x / TS, ty = p.y / TS;
    // 지역: 처음 들어서면 길잡이 글
    const reg = OW.regionOf(Math.floor(tx), Math.floor(ty));
    if (reg && ST.regionOpen(reg) && !s.flags['reglib:' + reg]) { s.flags['reglib:' + reg] = true; learn('r_' + reg); }
    for (const pl of places()) {
      if (Math.abs(pl.x - tx) > 5 || Math.abs(pl.y - ty) > 5) continue;
      if (s.disc && s.disc[pl.id]) continue;
      if (pl.tale && pl.tale.when && !pl.tale.when()) continue;
      if (U.dist(pl.x, pl.y, tx, ty) <= 4.6) discover(pl);
    }
  });

  /* 지도: 찾은 곳에 점 */
  const DOT = { tale: '#ffd84a', tablet: '#c8a0ff', shrine: '#ffb0e0', nest: '#ff6a6a', ruin: '#ff9a6a', camp: '#ffb040', peddler: '#8ae0a0' };
  ST.mapExtras = function (cv, SC) {
    const g = cv.getContext('2d'), s = S(); if (!s.disc) return;
    for (const pl of places()) {
      if (!s.disc[pl.id]) continue;
      const x = pl.x * SC, y = pl.y * SC, col = DOT[pl.kind] || '#e8e0c8';
      const tdone = pl.tale && pl.tale.state && pl.tale.state() === 'done';
      g.fillStyle = '#0a0812'; g.fillRect(x - 3, y - 3, 6, 6);
      g.fillStyle = col; if (pl.kind === 'tale' || pl.kind === 'tablet') { g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y + 3); g.lineTo(x - 3, y); g.closePath(); g.fill(); if (tdone) { g.fillStyle = '#0a0812'; g.fillRect(x - 1, y - 1, 2, 2); } } else g.fillRect(x - 2, y - 2, 4, 4);
    }
  };

  /* ═════════════ 8. 책장 ═════════════ */
  const MUNDANE = [
    '요리책. 「감자는 껍질째 굽는다.」 누군가 밑줄을 두 번 그었다.', '가계부. 올해 세금 칸만 빨간 잉크다.', '빛바랜 편지 묶음. 리본으로 묶여 있다. 읽지 않기로 한다.',
    '아이의 공책. 「커서 챔피언이 될 거다. 아니면 빵집.」', '농사 달력. 「검은 점이 보이는 날엔 씨를 뿌리지 않는다.」', '두꺼운 사전. 「렙업: 빛이 차올라 그릇이 넓어짐. 용례 — 무한으로 ~하다.」',
    '낡은 지도. 지금보다 마을이 하나 더 그려져 있다. 이름 자리가 지워져 있다.', '빈 칸. 책 모양으로 먼지가 비어 있다. 누가 얼마 전에 빼 갔다.', '노래책. 「구름고래야 구름고래야」 장에만 손때가 묻었다.',
    '장부. 숫자 옆마다 작은 그림. 웃는 얼굴, 우는 얼굴, 또 웃는 얼굴.', '뜨개질 책. 털실이 책갈피 대신 끼워져 있다.', '『징수 기사 되는 법』. 중간부터 찢겨 나갔다.',
  ];
  async function readEntry(c, id) {
    const e = D.LIBRARY[id]; if (!e) return;
    c.sfx('page');
    await c.narr('[y]『' + e.title + '』[/]' + (e.by ? '\n[s]' + e.by + '[/]' : ''));
    for (const pg of e.pages) await c.narr(pg);
    if (G.lib.learn(S(), id)) G.lib.toast(id); else G.lib.seen(S(), id);
  }
  function shelfText(m, e, key) {
    return async (c) => {
      const s = S(), fl = s.flags;
      let v = fl[key];
      if (v == null) {
        const h = U.hash(key);
        const pick = h % 100 < 60 ? G.lib.pick(s, { src: ['shelf', 'lib'], reg: m.palName, seed: h }) : null;
        v = fl[key] = pick ? pick.id : 'm' + (h % MUNDANE.length);
      }
      if (v[0] === 'm' && !D.LIBRARY[v]) { await c.narr(MUNDANE[+v.slice(1)] || MUNDANE[0]); return; }
      const ent = D.LIBRARY[v];
      if (G.lib.has(s, v)) { const k = await c.choice('『' + ent.title + '』 — 이미 서재에 꽂아 둔 글이다.', ['다시 읽는다', '그만둔다']); if (k === 0) await readEntry(c, v); return; }
      await readEntry(c, v);
    };
  }
  /** 블루 대도서관: 책장마다 한 갈래 */
  const BLIB = ['world', 'history', 'tale', 'region', 'guide', 'beast', 'world', 'history', 'tale', 'region'];
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  function libShelf(cat) {
    return async (c) => {
      const s = S(), cur = ORD.indexOf(s.ch || 'c1');
      const list = Object.values(D.LIBRARY).filter((e) => e.cat === cat && e.src !== 'find' && ORD.indexOf(e.ch || 'c1') <= cur);
      const cname = (G.lib.CATS.find((x) => x[0] === cat) || [0, cat])[1];
      if (!list.length) { await c.narr('「' + cname + '」 서가. 지금은 비어 있다. 정리 중이라는 쪽지.'); return; }
      const opts = list.map((e) => (G.lib.has(s, e.id) ? '✓ ' : '') + e.title).concat(['그만둔다']);
      const k = await c.choice('「' + cname + '」 서가 — 대도서관 책은 누구나 읽을 수 있다.', opts);
      if (k < 0 || k >= list.length) return;
      await readEntry(c, list[k].id);
    };
  }
  const pop0 = ST.onPopulate;
  ST.onPopulate = function (m, Wd) {
    pop0.apply(this, arguments);
    if (!m || !m.indoor) return;
    try {
      const shelves = Wd.ents.filter((e) => e.kind === 'decor' && (e.decor === 'shelf' || e.decor === 'bookpile') && !e.text && !e.dead && !(e.decor === 'shelf' && e.v) && !e.wall);
      shelves.sort((a, b) => a.y - b.y || a.x - b.x);
      let li = 0;
      for (const e of shelves) {
        // 이야기 자리(사람 · 조사 지점) 바로 옆은 비운다 — 같은 자리에서 둘이 겹치지 않게
        if (Wd.ents.some((o) => o !== e && !o.dead && o.use && o.kind !== 'decor' && U.dist(o.x, o.y, e.x, e.y) < 26)) continue;
        const key = 'shelf:' + m.id + ':' + Math.round(e.x / TS) + ',' + Math.round(e.y / TS);
        if (m.id === 'b_lib' && e.decor === 'shelf') { const cat = BLIB[li++ % BLIB.length]; e.text = libShelf(cat); e.verb = '「' + (G.lib.CATS.find((x) => x[0] === cat) || [0, ''])[1] + '」 서가를 본다'; continue; }
        e.text = shelfText(m, e, key); e.verb = e.decor === 'bookpile' ? '책 더미를 뒤적인다' : '책장을 살핀다';
      }
    } catch (err) { console.error('[shelves]', err); }
  };

  /* ═════════════ 내보내기 (수첩 › 발견) ═════════════ */
  G.explore = {
    VEIL, TALES, SITES, NOTICES, places, discover, readEntry,
    /** 지역마다 [{ pl, found, state, hint }] */
    byRegion() {
      const s = S(), out = {};
      for (const pl of places()) { (out[pl.reg] = out[pl.reg] || []).push({ pl, found: !!(s.disc && s.disc[pl.id]), state: pl.tale && pl.tale.state ? pl.tale.state() : null, hint: pl.tale && pl.tale.hint ? pl.tale.hint() : null }); }
      return out;
    },
    count() { const s = S(), all = places(); return [all.filter((p) => s.disc && s.disc[p.id]).length, all.length]; },
  };
})();
