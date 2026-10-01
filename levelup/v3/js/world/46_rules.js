/* 던전의 법칙 — 던전마다 그 안에서만 통하는 규칙 하나. 들어서면 알려 주고, 화면 왼쪽에 늘 떠 있다.
   d1 포자 · d2 낙반 · d3 밀물과 썰물 · d4 태양 광선 · d5 거울 반사 · d6 돌풍 · d7 혹한 · d8 정전 · d9 피의 달
   d11 전류 바닥 · d12 메아리 · d13 짙은 안개 · d14 층의 칙령 · d15 뒤따르는 것 · 옛 렙업의 땅 자라는 적 · 별똥별 구덩이 별똥비
   고원 굴 열 곳도 지역에 맞는 법칙을 하나씩 가진다.
   그리고 무기 내성: 던전의 적 몇몇은 한 무기가 튕겨 나간다(머리 위 표식). 다른 무기로 바꿔 잡는다. 약점 무기로 치면 +50%. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent, C = G.combat, DG = G.dungeon, ST = G.story, H = G.hud, X = G.gfx;
  const T = TL.T, TS = TL.TS, PROP = TL.PROP;
  const S = () => G.state, W = () => G.world;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const DUN = DG.DUN;
  const WEAPONS = ['sword', 'bow', 'magic'];
  const WN = { sword: '검', bow: '활', magic: '마법' }, WC = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  const SRCW = { sword: 'sword', spin: 'sword', dash: 'sword', beam: 'sword', lunge: 'sword', arrow: 'bow', spell: 'magic' };
  const avail = () => (G.stance ? G.stance.avail(S()) : ['sword']);
  const wOf = (info) => info.w || SRCW[info.src] || (info.src === 'special' && G.stance ? G.stance.ST.spW || G.stance.cur(S()) : null);

  const RULES = {
    spores: { name: '포자', col: '#a8e070', desc: '뿌리가 숨을 쉴 때마다 포자가 터진다. 맞으면 몸이 무거워지고, 적은 잠든다 — 적을 포자로 꾀어라.' },
    rockfall: { name: '낙반', col: '#d8b080', desc: '천장이 무너진다. 그림자를 피하라 — 떨어지는 돌은 적도 짓누른다.' },
    tide: { name: '밀물과 썰물', col: '#6ab8ff', desc: '물이 차오르면 걸음이 느려지고 불이 약해진다. 대신 얼음 · 번개가 세진다. 썰물에는 불이 세진다.' },
    sunbeam: { name: '태양 광선', col: '#ffe066', desc: '방을 가로지르는 햇살. 노란 줄이 깜빡이면 비켜라 — 햇살은 적도 태운다.' },
    mirror: { name: '거울 반사', col: '#d8b0ff', desc: '화살과 주문이 벽에 한 번 튕긴다(튕긴 뒤 +20%). 적의 탄도 튕긴다.' },
    gust: { name: '돌풍', col: '#e8f8ff', desc: '바람이 몰아친다. 몸이 밀리고 화살이 휜다 — 적은 허공으로 날려 버릴 수 있다.' },
    cold: { name: '혹한', col: '#bfe8ff', desc: '가만히 있으면 몸이 언다. 횃불 곁에 서거나 불 마법을 쓰면 녹는다. 다 얼면 느려진다.' },
    blackout: { name: '정전', col: '#8a98c8', desc: '광맥이 숨을 멈추면 빛이 꺼진다. 등불을 켜 두어라 — 어둠 속 적은 느려진다.' },
    blood: { name: '피의 달', col: '#ff5a6a', desc: '붉은 달이 뜨면 적이 사나워진다. 그동안 쓰러뜨리면 체력이 돌아오고 빛 알갱이가 곱절.' },
    panels: { name: '전류 바닥', col: '#6ae8ff', desc: '바닥 판이 차례로 전기를 띤다. 깜빡이는 판을 피하라 — 적을 판 위로 꾀어라.' },
    echo: { name: '메아리', col: '#c8b8ff', desc: '휘두른 칼 · 쏜 화살 · 건 주문이 잠시 뒤 한 번 더 메아리친다(40~50%). 자리를 잡고 싸워라.' },
    fog: { name: '짙은 안개', col: '#c8d8e8', desc: '안개 너머의 적은 보이지 않는다. 맞히면 잠시 드러난다.' },
    edict: { name: '층의 칙령', col: '#ffd86a', desc: '방마다 한 무기만 통한다. 들어설 때 알려 준다 — 나머지는 튕긴다.' },
    follower: { name: '뒤따르는 것', col: '#c49bff', desc: '이름 없는 망령이 천천히 뒤따라온다. 죽일 수 없다 — 등불을 켜면 다가오지 못하고, 빛 마법에 쫓겨난다.' },
    growth: { name: '자라는 적', col: '#ffb86a', desc: '하나를 쓰러뜨릴 때마다 방의 남은 적이 강해진다. 대신 빛 알갱이 ×1.5 — 센 놈부터.' },
    starfall: { name: '별똥비', col: '#fff4a8', desc: '별이 떨어진다. 맞으면 아프지만, 떨어진 자리에 빛 알갱이가 남는다.' },
  };
  const RULE_OF = {
    d1: 'spores', d2: 'rockfall', d3: 'tide', d4: 'sunbeam', d5: 'mirror', d6: 'gust', d7: 'cold', d8: 'blackout', d9: 'blood', d11: 'panels', d12: 'echo', d13: 'fog', d14: 'edict', d15: 'follower', sec_origin: 'growth', sec_crater: 'starfall',
    hl_green: 'spores', hl_red: 'rockfall', hl_blue: 'tide', hl_yellow: 'sunbeam', hl_amber: 'echo', hl_purple: 'mirror', hl_white: 'cold', hl_mist: 'fog', hl_gray: 'panels', hl_black: 'blood',
  };

  /* ───────── 상태 ───────── */
  const RS = { rule: null, did: null };
  function reset(did) {
    // 들어서는 지도: 지난번에 남은 법칙의 흔적(정전 어둠 · 붉은 달빛)을 지운다
    const m = W().map;
    if (m && m.dungeon && RULE_OF[m.dungeon]) { if (m._base0 != null) m.baseDark = m._base0; if (m._ruleTint) m.tint = null; }
    Object.assign(RS, { rule: did ? RULE_OF[did] || null : null, did: did || null, t: 0, next: 3.5, shown: false, warn: 0, on: 0, dir: [1, 0], chill: 0, warmT: 0, coldTick: 0, frozen: false, high: false, base0: null, echoQ: [], lastSwing: null, roomK: null, edict: {}, follower: null, lightT: 0 });
  }
  reset(null);
  const active = (k) => { const m = W().map; return RS.rule === k && m && m.dungeon && m.dungeon === RS.did; };
  const tierOf = () => (RS.did && DUN[RS.did] ? DUN[RS.did].tier || 0 : 0);

  /* ───────── 방 · 바닥 ───────── */
  function roomOf(m, px, py) {
    if (!m || !m.rooms) return null;
    const RW = m.RW || 20, RH = m.RH || 14;
    if (!m._rAt) { m._rAt = {}; for (const r of Object.values(m.rooms)) m._rAt[r.gx + ',' + r.gy] = r; }
    return m._rAt[Math.floor(px / TS / RW) + ',' + Math.floor(py / TS / RH)] || null;
  }
  const isBossRoom = (r) => r && (r._boss != null ? r._boss : (r._boss = !!(r.R.boss || (r.R.props || []).some((pr) => pr[0] === 'boss'))));
  const floorOk = (m, tx, ty, z) => { const t = m.T(tx, ty), P = PROP[t] || {}; return !P.s && !P.h && t !== T.VOID && m.H(tx, ty) === z && !m.blocked(tx, ty); };
  function spotNear(m, r, p, rad) {
    const z = p.z || 0, RW = m.RW || 20, RH = m.RH || 14;
    for (let k = 0; k < 40; k++) {
      const tx = Math.floor(p.x / TS) + Math.round((Math.random() * 2 - 1) * rad), ty = Math.floor((p.y - 2) / TS) + Math.round((Math.random() * 2 - 1) * rad);
      if (tx <= r.x0 || ty <= r.y0 + 1 || tx >= r.x0 + RW - 1 || ty >= r.y0 + RH - 1) continue;
      if (floorOk(m, tx, ty, z)) return [tx * TS + 8, ty * TS + 10];
    }
    return null;
  }
  const foesIn = (x, y, r) => C.foes().filter((e) => U.dist(x, y, e.x, e.y) < r);
  const hurtP = (amt, x, y, el) => { const p = W().player; if (p) C.hurtPlayer(p, amt, { x, y }, el ? { el } : {}); };
  const zap = (e, amt, o) => C.damage(e, amt, Object.assign({ src: 'rule', kx: 0, ky: 0, power: 0.3 }, o || {}));

  /* ───────── 법칙마다 매 프레임 ───────── */
  const TICK = {
    spores(dt, Wd, p, m, s, r, boss) {
      if (boss || !r) return;
      if ((RS.next -= dt) > 0) return;
      RS.next = 6.5 + Math.random() * 2.5;
      const spots = [[p.x, p.y]];
      for (const rad of [5, 6]) { const o = spotNear(m, r, p, rad); if (o) spots.push(o); }
      for (const [x, y] of spots) G.bosses.warnCircle(x, y, 22, 1.15, () => {
        for (let i = 0; i < 18; i++) G.fx.part({ x: x + (Math.random() - 0.5) * 34, y: y + (Math.random() - 0.5) * 16, z: 2, vz: 10 + Math.random() * 24, g: 0, life: 0.9, col: Math.random() < 0.5 ? '#c8f08a' : '#8ad85a', size: 2 });
        const pl = W().player;
        if (pl && U.dist(pl.x, pl.y, x, y) < 22 && pl.state !== 'roll') { pl.slowT = Math.max(pl.slowT || 0, 1.8); G.fx.float(pl.x, pl.y - 28, '포자 — 몸이 무겁다', '#a8e070', { life: 0.8 }); }
        for (const e of foesIn(x, y, 24)) if (!e.boss) { e.stunT = Math.max(e.stunT || 0, 1.4); G.fx.float(e.x, e.y - (e.h || 16) - 8, '잠듦', '#a8e070', { life: 0.7 }); }
        sfx('melt');
      }, '#a8e070');
    },
    rockfall(dt, Wd, p, m, s, r, boss) { fall(dt, p, m, r, boss, false); },
    starfall(dt, Wd, p, m, s, r, boss) { fall(dt, p, m, r, boss, true); },
    tide(dt, Wd, p, m) {
      const cyc = RS.t % 24, high = cyc > 15;
      if (high !== RS.high) {
        RS.high = high;
        if (high) { G.ui.toast('[b]밀물[/] — 걸음이 느려지고 불이 약해진다. 얼음 · 번개가 세진다', ''); sfx('melt'); }
        else G.ui.toast('[b]썰물[/] — 물이 빠졌다. 불이 세진다', '');
      }
      m.tint = high ? 'rgba(30,80,170,0.14)' : null; m._ruleTint = true;
      if (high) p.slowMul = Math.min(p.slowT > 0 ? 0.55 : 1, 0.8);
      else if (!(p.slowT > 0)) p.slowMul = 1;
      if (high && Math.random() < dt * 14) G.fx.part({ x: p.x + (Math.random() - 0.5) * 220, y: p.y + (Math.random() - 0.5) * 140, z: 0, vz: 8, g: 0, life: 0.7, col: '#8ad8ff', size: 1 });
    },
    sunbeam(dt, Wd, p, m, s, r, boss) {
      if (boss || !r) return;
      if ((RS.next -= dt) > 0) return;
      RS.next = 4.8 + Math.random() * 1.8;
      const RW = m.RW || 20, RH = m.RH || 14, horiz = Math.random() < 0.5;
      const ptx = Math.floor(p.x / TS), pty = Math.floor((p.y - 2) / TS);
      let x, y, w, h;
      if (horiz) { const ty = U.clamp(pty - (Math.random() < 0.5 ? 1 : 0), r.y0 + 2, r.y0 + RH - 3); x = (r.x0 + 1) * TS; y = ty * TS; w = (RW - 2) * TS; h = 2 * TS; }
      else { const tx = U.clamp(ptx - (Math.random() < 0.5 ? 1 : 0), r.x0 + 1, r.x0 + RW - 3); x = tx * TS; y = (r.y0 + 2) * TS; w = 2 * TS; h = (RH - 3) * TS; }
      G.bosses.warnRect(x, y, w, h, 1.1, () => {
        W().add(new Beam({ x: x + w / 2, y: y + h, bx: x, by: y, bw: w, bh: h, life: 0.35 }));
        const pl = W().player, dmg = 2 + Math.floor(tierOf() / 3);
        if (pl && pl.x > x && pl.x < x + w && pl.y - 2 > y && pl.y - 2 < y + h) C.hurtPlayer(pl, dmg, { x: pl.x, y: pl.y + 4 }, { el: 'fire' });
        for (const e of C.foes()) if (!e.boss && e.x > x && e.x < x + w && e.y > y && e.y < y + h + 4) zap(e, 5 + tierOf() * 3, { el: 'light' });
        sfx('white');
      }, '#ffe066');
    },
    gust(dt, Wd, p, m, s, r, boss) {
      if (RS.on > 0) {
        RS.on -= dt;
        const [dx, dy] = RS.dir;
        if (!boss && !p.noClip && !['hook', 'fall', 'dead', 'jump'].includes(p.state)) {
          // 구덩이 앞에서는 약하게, 출구 · 층 계단 위로는 밀지 않는다 (바람에 던전 밖으로 나가 버리지 않게)
          const nx = p.x + dx * 12, ny = p.y - 2 + dy * 12, ntx = Math.floor(nx / TS), nty = Math.floor(ny / TS);
          const onWarp = (m.warps || []).some((w2) => ntx >= w2.x - 1 && ntx < w2.x + (w2.w || 1) + 1 && nty >= w2.y - 1 && nty < w2.y + (w2.h || 1) + 1);
          const onStair = Wd.ents.some((e) => e.kind === 'stairlink' && Math.abs(e.x - nx) < 22 && ny > e.y - 24 && ny < e.y + 8);
          // 구덩이 앞에서는 밀지 않는다 · 세기도 줄였다(44 → 26): 바람에 엉뚱한 곳으로 계속 밀려 다니던 것
          const k = onWarp || onStair || m.hazardAt(nx, ny) || m.hazardAt(p.x + dx * 24, p.y - 2 + dy * 24) ? 0 : 1;
          if (k) E.move(m, p, dx * 26 * k * dt, dy * 26 * k * dt);
        }
        for (const e of C.foes()) {
          if (e.boss || e.fly || e.dead) continue;
          E.move(m, e, dx * 70 * dt, dy * 70 * dt);
          const hz = m.hazardAt(e.x, e.y - 2); if (hz && e.fallIn) { G.fx.float(e.x, e.y - 20, '날아갔다!', '#e8f8ff'); e.fallIn(hz); }
        }
        for (const e of Wd.ents) if (e instanceof C.Shot && !e.dead) { e.vx += dx * 120 * dt; e.vy += dy * 120 * dt; }
        return;
      }
      if (RS.warn > 0) { RS.warn -= dt; if (RS.warn <= 0) { RS.on = 2.4; sfx('rumble'); } return; }
      if ((RS.next -= dt) > 0) return;
      RS.next = 8 + Math.random() * 2.5;
      RS.dir = U.pick([[1, 0], [-1, 0], [0, 1], [0, -1]], Math.random());
      RS.warn = 1.1;
      G.ui.toast('돌풍이 분다 — ' + { '1,0': '→ 동쪽으로', '-1,0': '← 서쪽으로', '0,1': '↓ 남쪽으로', '0,-1': '↑ 북쪽으로' }[RS.dir.join(',')], '');
    },
    cold(dt, Wd, p, m, s) {
      const d = G.st.derive(s);
      // 불 곁: 켜진 횃불 · 방금 쓴 불 마법
      for (const e of Wd.ents) if (e instanceof C.Shot && !e.dead && e.el === 'fire' && e.owner !== 'foe' && !e._warm) { e._warm = true; RS.warmT = 2.5; }
      const torch = Wd.ents.some((e) => e instanceof G.props.Torch && e.lit && U.dist(e.x, e.y, p.x, p.y) < 56);
      if (RS.warmT > 0) RS.warmT -= dt;
      const still = p.state === 'idle';
      if (torch || RS.warmT > 0) RS.chill = Math.max(0, RS.chill - dt * (RS.warmT > 0 ? 45 : 30));
      else RS.chill = Math.min(100, RS.chill + dt * (still ? 7 : 2.2) * (d.warm ? 0.5 : 1));
      const was = RS.frozen;
      RS.frozen = RS.chill >= 100 || (RS.frozen && RS.chill > 60);
      if (RS.frozen && !was) { G.ui.toast('몸이 얼어붙는다 — 횃불이나 불 마법!', 'bad'); sfx('ice'); }
      if (RS.frozen) {
        p.slowMul = Math.min(p.slowT > 0 ? 0.55 : 1, 0.62);
        if ((RS.coldTick += dt) > 3.5) { RS.coldTick = 0; if (s.hp > 1) { s.hp -= 1; p.flash = 0.12; p.flashCol = '#bfe8ff'; G.fx.float(p.x, p.y - 26, '언다', '#bfe8ff', { life: 0.6 }); } }
        if (Math.random() < dt * 10) G.fx.part({ x: p.x + (Math.random() - 0.5) * 12, y: p.y, z: 6 + Math.random() * 12, vz: 6, g: 0, life: 0.5, col: '#e8f8ff', size: 1 });
      } else if (was && !(p.slowT > 0)) p.slowMul = 1;
    },
    blackout(dt, Wd, p, m) {
      if (m._base0 == null) m._base0 = m.baseDark || 0;
      RS.base0 = m._base0;
      if (RS.on > 0) {
        RS.on -= dt;
        if (RS.on <= 0) { m.baseDark = RS.base0; G.ui.toast('빛이 돌아왔다', ''); }
        return;
      }
      if (RS.warn > 0) {
        RS.warn -= dt;
        m.dark = Math.max(m.dark || 0, Math.floor(RS.warn * 12) % 2 ? 0.75 : RS.base0);
        if (RS.warn <= 0) { RS.on = 4.5; m.baseDark = 0.97; sfx('melt'); G.ui.toast('정전 — ' + (p.lantern ? '등불만이 빛난다' : '등불을 켜라!'), 'bad'); }
        return;
      }
      if ((RS.next -= dt) > 0) return;
      RS.next = 12 + Math.random() * 4; RS.warn = 1.2;
    },
    blood(dt, Wd, p, m) {
      if (RS.on > 0) { RS.on -= dt; m._ruleTint = true; m.tint = 'rgba(150,0,30,' + (0.12 + Math.sin(RS.t * 3) * 0.04) + ')'; if (RS.on <= 0) { m.tint = null; G.ui.toast('붉은 달이 졌다', ''); } return; }
      if (RS.warn > 0) { RS.warn -= dt; m._ruleTint = true; m.tint = Math.floor(RS.warn * 6) % 2 ? 'rgba(150,0,30,0.1)' : null; if (RS.warn <= 0) { RS.on = 9; sfx('encounter'); G.ui.toast('[r]피의 달[/] — 적이 사나워진다. 쓰러뜨리면 체력 · 빛 알갱이', 'bad'); } return; }
      if ((RS.next -= dt) > 0) return;
      RS.next = 20 + Math.random() * 6; RS.warn = 1.5;
    },
    panels(dt, Wd, p, m, s, r, boss) {
      if (boss || !r) return;
      const z = p.z || 0;
      if (!p.jz && p.state !== 'dead' && liveAt(m, Math.floor(p.x / TS), Math.floor((p.y - 2) / TS)) && m.H(Math.floor(p.x / TS), Math.floor((p.y - 2) / TS)) === z) {
        if (C.hurtPlayer(p, 1, { x: p.x, y: p.y + 4 }, { el: 'bolt' })) { p.slowT = Math.max(p.slowT || 0, 0.35); G.fx.sparks(p.x, p.y - 6, 8, '#6ae8ff', 70); sfx('clank'); }
      }
      for (const e of C.foes()) {
        if (e.boss || e.fly || e.dead) continue;
        if ((e._zapT = (e._zapT || 0) - dt) > 0) continue;
        if (liveAt(m, Math.floor(e.x / TS), Math.floor((e.y - 2) / TS))) { e._zapT = 0.8; zap(e, 3 + tierOf() * 2, { el: 'bolt', stun: 0.4 }); G.fx.sparks(e.x, e.y - 6, 6, '#6ae8ff', 60); }
      }
    },
    echo(dt, Wd, p) {
      if (p.state === 'attack' && p.swing && p.swing !== RS.lastSwing) {
        RS.lastSwing = p.swing;
        RS.echoQ.push({ t: 0.5, x: p.x, y: p.y, a: Math.atan2(p.face[1], p.face[0]), reach: (p.swing.reach || 18) + 4 });
      }
      for (const q of RS.echoQ) {
        if ((q.t -= dt) > 0) continue;
        q.done = true;
        const d = G.st.derive(S());
        // 메아리는 지금 선 자리에서 그때의 방향으로 (밀려난 적까지 닿게 조금 더 길게)
        q.x = p.x; q.y = p.y; q.reach += 16;
        Wd.add(new Ghost({ x: q.x, y: q.y, a: q.a, r: q.reach, life: 0.22 }));
        for (const e of C.foes()) {
          const dist = U.dist(q.x, q.y - 6, e.x, e.y - (e.h || 16) / 2);
          if (dist > q.reach + (e.r || 8)) continue;
          let da = Math.atan2(e.y - q.y, e.x - q.x) - q.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
          if (Math.abs(da) > 1.15 && dist > 10) continue;
          C.damage(e, d.atk * 0.4, { src: 'sword', w: 'sword', echo: true, kx: Math.cos(q.a), ky: Math.sin(q.a), power: 0.5 });
        }
        sfx('swing');
      }
      RS.echoQ = RS.echoQ.filter((q) => !q.done);
    },
    fog(dt, Wd, p, m) { m.tint = 'rgba(190,200,220,0.10)'; m._ruleTint = true; if (Math.random() < dt * 8) G.fx.part({ x: p.x + (Math.random() - 0.5) * 240, y: p.y + (Math.random() - 0.5) * 160, z: 4, vz: 2, g: 0, life: 1.6, col: '#d8e0ec', size: 3 }); },
    edict(dt, Wd, p, m, s, r, boss) {
      const k = r ? r.k : null;
      if (k === RS.roomK) return;
      RS.roomK = k;
      const w = k && RS.edict[k];
      if (w && C.foes().length + ((r.R.foes || []).length) > 0) { G.ui.toast('칙령 — 이 방에서는 [y]' + WN[w] + '[/]만 통한다', 'gold'); sfx('page'); }
    },
    follower(dt, Wd, p, m, s, r, boss) {
      if (RS.lightT > 0) RS.lightT -= dt;
      for (const e of Wd.ents) if (e instanceof C.Shot && !e.dead && e.owner !== 'foe' && e.el === 'light' && !e._lit) { e._lit = true; RS.lightT = 0.6; RS.lightAt = [e.x, e.y]; }
      if (!RS.follower || RS.follower.dead) {
        if (RS.t > 9 && !boss) { RS.follower = Wd.add(new Follower({ x: m.entry.x, y: m.entry.y })); G.ui.toast('…무언가 뒤따라온다. 등불을 켜라', 'bad'); sfx('encounter'); }
      }
    },
  };
  // 낙반 · 별똥비
  function fall(dt, p, m, r, boss, star) {
    if (boss || !r) return;
    if ((RS.next -= dt) > 0) return;
    RS.next = star ? 4.5 + Math.random() * 2 : 5.5 + Math.random() * 2;
    const spots = [[p.x, p.y]];
    for (const rad of [4, 5, 6]) { const o = spotNear(m, r, p, rad); if (o) spots.push(o); }
    const col = star ? '#fff4a8' : '#d8b080';
    spots.forEach(([x, y], i) => G.bosses.warnCircle(x, y, 13, 1.2 + i * 0.12, () => {
      W().add(new Drop({ x, y, star, life: 0.28 }));
      W().shake(2, 0.15); sfx(star ? 'crystal' : 'rock');
      if (star) G.fx.sparks(x, y - 4, 10, '#fff4a8', 80); else G.fx.shards(x, y - 4, 8, '#8a7a6a');
      G.fx.dust(x, y, 5);
      const pl = W().player, dmg = 2 + Math.floor(tierOf() / 3);
      let hitSome = false;
      if (pl && U.dist(pl.x, pl.y, x, y) < 13) { C.hurtPlayer(pl, dmg, { x, y }, {}); hitSome = true; }
      for (const e of foesIn(x, y, 15)) if (!e.boss) { zap(e, 6 + tierOf() * 3, { stun: 1, power: 0.6 }); hitSome = true; }
      if (star && !hitSome) C.spawnPickup(x, y, 'exp', 2 + tierOf());
    }, col));
  }
  // 전류 바닥: 2×2 판 묶음이 셋씩 돌아가며
  const GROUP = (tx, ty) => ((tx >> 1) + (ty >> 1) * 2) % 3;
  const panelPhase = () => Math.floor(RS.t / 2.6) % 3;
  const panelWarn = () => (RS.t % 2.6) > 1.9;
  function liveAt(m, tx, ty) {
    if (!active('panels')) return false;
    const t = m.T(tx, ty), P = PROP[t] || {};
    if (P.s || P.h || t === T.VOID || t === T.STAIRS) return false;
    if (m.entry && U.dist(tx * TS + 8, ty * TS + 8, m.entry.x, m.entry.y) < 40) return false;
    return GROUP(tx, ty) === panelPhase();
  }

  /* ───────── 그림 ───────── */
  class Beam extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'sunbeam', solid: false, sortBias: 200 }, o)); }
    update(dt) { this.t += dt; if (this.t > this.life) this.dead = true; }
    draw(g, cx, cy) {
      const k = 1 - this.t / this.life;
      g.globalAlpha = 0.55 * k; g.fillStyle = '#fff4b0'; g.fillRect(Math.round(this.bx - cx), Math.round(this.by - cy), this.bw, this.bh);
      g.globalAlpha = 0.9 * k; g.fillStyle = '#ffffff';
      if (this.bw > this.bh) g.fillRect(Math.round(this.bx - cx), Math.round(this.by - cy + this.bh / 2 - 2), this.bw, 4); else g.fillRect(Math.round(this.bx - cx + this.bw / 2 - 2), Math.round(this.by - cy), 4, this.bh);
      g.globalAlpha = 1;
    }
  }
  class Drop extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'rockdrop', solid: false, sortBias: 40 }, o)); }
    update(dt) { this.t += dt; if (this.t > this.life) this.dead = true; }
    draw(g, cx, cy) {
      const k = this.t / this.life, x = Math.round(this.x - cx), y = Math.round(this.y - cy - 60 * (1 - k) - 6);
      if (this.star) { g.fillStyle = '#fff4a8'; g.fillRect(x - 3, y - 1, 7, 3); g.fillRect(x - 1, y - 3, 3, 7); g.globalAlpha = 0.5; g.fillRect(x - 1, y - 12, 3, 9); g.globalAlpha = 1; }
      else { g.fillStyle = '#5a4a3a'; g.fillRect(x - 5, y - 4, 10, 8); g.fillStyle = '#8a7a6a'; g.fillRect(x - 4, y - 4, 7, 5); g.fillStyle = '#a89888'; g.fillRect(x - 3, y - 3, 3, 2); }
    }
  }
  class Ghost extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'echoarc', solid: false, sortBias: 30 }, o)); }
    update(dt) { this.t += dt; if (this.t > this.life) this.dead = true; }
    draw(g, cx, cy) {
      const k = 1 - this.t / this.life;
      g.globalAlpha = 0.7 * k; g.strokeStyle = '#c8b8ff'; g.lineWidth = 3;
      g.beginPath(); g.arc(Math.round(this.x - cx), Math.round(this.y - cy - 6), this.r * (0.7 + 0.3 * (1 - k)), this.a - 1.0, this.a + 1.0); g.stroke();
      g.globalAlpha = 1; g.lineWidth = 1;
    }
  }
  /** 뒤따르는 것: 벽을 지나 천천히 다가온다. 등불 곁에 오지 못하고 빛 마법에 쫓겨난다 */
  class Follower extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'follower', solid: false, sortBias: 20, glowR: 0 }, o)); this.fade = 0; this.rest = 0; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player, m = Wd.map; if (!p || G.script.running) return;
      this.fade = Math.min(1, this.fade + dt * 0.6);
      if (this.rest > 0) { this.rest -= dt; return; }
      const r = roomOf(m, p.x, p.y);
      if (isBossRoom(r)) return;
      const d = U.dist(this.x, this.y, p.x, p.y);
      // 빛 마법: 쫓겨난다
      if (RS.lightT > 0 && RS.lightAt && U.dist(RS.lightAt[0], RS.lightAt[1], this.x, this.y - 10) < 60) { this.banish(); return; }
      if (p.lantern && d < 56) { const [nx, ny] = U.norm(this.x - p.x, this.y - p.y); this.x += nx * 40 * dt; this.y += ny * 40 * dt; if (Math.random() < dt * 6) G.fx.float(this.x, this.y - 30, '…', '#c49bff', { life: 0.4 }); return; }
      const [nx, ny] = U.norm(p.x - this.x, p.y - this.y);
      const sp = 20 + Math.min(14, tierOf() * 1.5);
      this.x += nx * sp * dt; this.y += ny * sp * dt;
      if (d < 11 && this.fade > 0.6) {
        if (C.hurtPlayer(p, 2, this, { el: 'dark' })) { G.fx.float(p.x, p.y - 30, '차가운 손', '#c49bff'); this.banish(true); }
      }
    }
    banish(touch) {
      const m = W().map, p = W().player;
      let best = null, bd = -1;
      for (const rr of Object.values(m.rooms)) { if (isBossRoom(rr)) continue; const x = (rr.x0 + (m.RW || 20) / 2) * TS, y = (rr.y0 + (m.RH || 14) / 2) * TS, dd = U.dist(x, y, p.x, p.y); if (dd > bd) { bd = dd; best = [x, y]; } }
      G.fx.ring(this.x, this.y - 10, '#c49bff', 20, 0.4, 2);
      if (!touch) { G.fx.float(this.x, this.y - 30, '빛에 쫓겨났다', '#fff4c8'); sfx('white'); }
      if (best) { this.x = best[0]; this.y = best[1]; }
      this.fade = 0; this.rest = touch ? 4 : 12;
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy), a = this.fade * (0.55 + Math.sin(this.t * 3) * 0.12);
      if (a <= 0.02) return;
      g.globalAlpha = a;
      const bob = Math.round(Math.sin(this.t * 2) * 2);
      g.fillStyle = '#2a1a3a'; g.beginPath(); g.moveTo(x - 7, y - 2 + bob); g.lineTo(x - 5, y - 24 + bob); g.lineTo(x, y - 30 + bob); g.lineTo(x + 5, y - 24 + bob); g.lineTo(x + 7, y - 2 + bob);
      for (let i = 0; i < 4; i++) g.lineTo(x + 7 - i * 3.5 - 1.75, y - (i % 2 ? 2 : 5) + bob);
      g.closePath(); g.fill();
      g.fillStyle = '#c49bff'; g.fillRect(x - 3, y - 22 + bob, 2, 2); g.fillRect(x + 1, y - 22 + bob, 2, 2);
      g.globalAlpha = 1;
    }
  }
  /** 법칙을 돌리고 그리는 보이지 않는 관리자 (늘 플레이어 곁) */
  class RuleCtl extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'rulectl', solid: false, sortBias: 9000 }, o)); }
    update(dt, Wd) {
      const p = Wd.player, m = Wd.map, s = S(); if (!p || !RS.rule || !m || m.dungeon !== RS.did) return;
      this.x = p.x; this.y = p.y;
      if (G.script.running || p.state === 'dead') return;
      RS.t += dt;
      if (!RS.shown && RS.t > 0.6) { RS.shown = true; const R = RULES[RS.rule]; G.ui.banner('법칙 · ' + R.name, R.desc, 3.6); }
      const r = roomOf(m, p.x, p.y);
      const F = TICK[RS.rule]; if (F) F(dt, Wd, p, m, s, r, isBossRoom(r));
    }
    drawShadow(g, cx, cy) {
      if (!active('panels')) return;
      const m = W().map, v = W().view, ph = panelPhase(), nx = (ph + 1) % 3, warn = panelWarn();
      const tx0 = Math.floor(cx / TS), ty0 = Math.floor(cy / TS), tx1 = tx0 + Math.ceil(v.w / TS) + 1, ty1 = ty0 + Math.ceil(v.h / TS) + 1;
      const p = W().player, r = roomOf(m, p.x, p.y); if (!r || isBossRoom(r)) return;
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const t = m.T(tx, ty), P = PROP[t] || {}; if (P.s || P.h || t === T.VOID || t === T.STAIRS) continue;
        const gr = GROUP(tx, ty), X0 = tx * TS - cx, Y0 = ty * TS - cy;
        if (gr === ph && liveAt(m, tx, ty)) {
          g.globalAlpha = 0.4 + Math.random() * 0.2; g.fillStyle = '#7af0ff'; g.fillRect(X0 + 1, Y0 + 1, 14, 14);
          g.globalAlpha = 0.95; g.strokeStyle = '#ffffff'; g.lineWidth = 1; const j = (Math.random() * 8) | 0;
          g.beginPath(); g.moveTo(X0 + 3 + j, Y0 + 2); g.lineTo(X0 + 7 + (j >> 1), Y0 + 7); g.lineTo(X0 + 4 + j, Y0 + 9); g.lineTo(X0 + 9, Y0 + 14); g.stroke();
          g.globalAlpha = 1;
        } else if (gr === nx && warn && Math.floor(RS.t * 10) % 2) { g.strokeStyle = 'rgba(255,224,102,0.85)'; g.strokeRect(X0 + 1.5, Y0 + 1.5, 13, 13); }
        else { g.strokeStyle = 'rgba(106,232,255,0.08)'; g.strokeRect(X0 + 1.5, Y0 + 1.5, 13, 13); }
      }
    }
    draw(g, cx, cy) {
      const v = W().view;
      if (active('gust') && (RS.on > 0 || RS.warn > 0)) {
        const [dx, dy] = RS.dir, n = RS.on > 0 ? 26 : 8;
        g.strokeStyle = 'rgba(232,248,255,' + (RS.on > 0 ? 0.55 : 0.3) + ')'; g.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          const sx = ((i * 97 + RS.t * 340 * (dx || 0.2)) % (v.w + 60) + v.w + 60) % (v.w + 60) - 30, sy = ((i * 53 + RS.t * 340 * (dy || 0.2)) % (v.h + 60) + v.h + 60) % (v.h + 60) - 30;
          g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - dx * 18, sy - dy * 18); g.stroke();
        }
      }
    }
  }
  /** 법칙이 있는 던전마다 관리자를 둔다 */
  for (const id of Object.keys(RULE_OF)) {
    const Dn = DUN[id]; if (!Dn) continue;
    const ents0 = Dn.ents;
    Dn.ents = function (m, Wd) { if (ents0) ents0.apply(this, arguments); Wd.add(new RuleCtl({ x: m.entry ? m.entry.x : 0, y: m.entry ? m.entry.y : 0 })); };
  }
  // 던전 방문 번호(쓰러뜨린 적이 다시 채워지는 때를 정한다, 03_dungeon): 다른 지도에서 던전으로 들어올 때마다 하나씩
  let lastDg = null;
  ST.enterHooks.push((m) => { const d = m && m.dungeon; if (d && d !== lastDg && S()) S().dgVisit = (S().dgVisit || 0) + 1; lastDg = d || null; });
  ST.enterHooks.push((m) => {
    const did = m && m.dungeon ? m.dungeon : null;
    const p = W().player;
    {   // 들어설 때마다(쓰러져 입구에서 깨어날 때도) 새로 — 언 몸 · 차례가 이어지지 않게
      if (p && !(p.slowT > 0)) p.slowMul = 1;
      reset(did);
      if (did && RS.rule === 'edict') {
        const av = avail();
        if (av.length >= 2) { let i = 0; for (const k of Object.keys(m.rooms).sort()) { const R = m.rooms[k].R; if (k[0] === 'x' || isBossRoom(m.rooms[k]) || !((R.foes || []).length || (R.waves || []).length)) continue; RS.edict[k] = av[i++ % av.length]; } }
      }
    }
  });

  /* ───────── 피해 조정: 법칙 · 무기 내성 표시 ───────── */
  const mod0 = C.dmgMod;
  C.dmgMod = function (e, info, amt) {
    const w = wOf(info), p = W().player;
    // 칙령: 그 방의 무기만
    if (active('edict') && w && p) {
      const r = roomOf(W().map, p.x, p.y), need = r && RS.edict[r.k];
      if (need && w !== need) { if (!e._edShow || p.t - e._edShow > 0.6) { e._edShow = p.t; G.fx.float(e.x, e.y - (e.h || 16) - 8, WN[need] + '만 통한다!', '#ffd86a', { life: 0.7 }); sfx('clank'); } return 0; }
    }
    let k = mod0 ? mod0.apply(this, arguments) : 1;
    if (k === 0) return 0;
    if (e.weakW && w === e.weakW && !e._weakShown) { e._weakShown = true; G.fx.float(e.x, e.y - (e.h || 16) - 14, '약점!', '#ffe066', { life: 0.7 }); }
    if (active('tide')) { if (info.el === 'fire') k *= RS.high ? 0.5 : 1.2; else if (RS.high && (info.el === 'ice' || info.el === 'bolt')) k *= 1.5; }
    if (active('mirror') && info.shot && info.shot.bounced) k *= 1.2;
    if (active('fog')) e.revealT = 2.5;
    return k;
  };
  // 혹한: 다 얼면 기력이 느리게 찬다
  const der0 = G.st.derive;
  G.st.derive = function (s) { const d = der0.apply(this, arguments); if (RS.frozen && active('cold')) d.stamRegen *= 0.5; return d; };
  // 거울 반사: 벽에 한 번 튕긴다
  const BOUNCE = new Set(['arrow', 'fire', 'ice', 'orb', 'beam', 'wind', 'dark', 'shot']);
  const hw0 = C.Shot.prototype.hitWall;
  C.Shot.prototype.hitWall = function (m) {
    if (!this.bounced && BOUNCE.has(this.kind) && active('mirror')) {
      const bx = this.x - this.vx * 0.02, by = this.y - this.vy * 0.02;
      const blockX = !m.shotFree(this.x, by, this.z), blockY = !m.shotFree(bx, this.y, this.z);
      if (blockX || !blockY) this.vx = -this.vx;
      if (blockY || !blockX) this.vy = -this.vy;
      this.x = bx; this.y = by; this.bounced = true; this.hit = new Set(); this.t = Math.max(0, this.t - 0.3);
      G.fx.sparks(this.x, this.y, 5, '#d8b0ff', 50); sfx('clank');
      return;
    }
    return hw0.call(this, m);
  };
  // 메아리: 화살 · 주문이 한 번 더 / 돌풍: 화살이 바람을 탄다(매 프레임)
  const pre0 = C.onShoot;
  C.onShoot = function (o) {
    if (pre0) o = pre0(o) || o;
    if (o && active('echo') && o.owner !== 'foe' && !o.echo && !o.split && (o.kind === 'arrow' || o.src === 'spell')) {
      const c = Object.assign({}, o, { echo: true, dmg: (o.dmg || 1) * 0.5, hit: new Set(), trail: '#c8b8ff', homing: 0, target: null, onHitFoe: null });
      C.after(0.45, () => { if (active('echo')) { C.shoot(c); G.fx.ring(c.x, c.y, '#c8b8ff', 8, 0.25, 1); } });
    }
    return o;
  };
  // 적: 피의 달 · 정전 · 안개 · 내성 바꾸기
  const Foe = G.foes.Foe;
  const fu0 = Foe.prototype.update;
  Foe.prototype.update = function (dt, Wd) {
    if (!this.boss) {
      if (active('blood') && RS.on > 0) dt *= 1.3;
      else if (active('blackout') && RS.on > 0) dt *= 0.72;
    }
    if (this.revealT > 0) this.revealT -= dt;
    if (this.wardCycle && !this.dead) {
      if ((this.wardT = (this.wardT == null ? 5 : this.wardT) - dt) <= 0) {
        const av = avail();
        if (av.length >= 2) { const i = av.indexOf(this.immune); this.immune = av[(i + 1) % av.length]; G.fx.ring(this.x, this.y - 10, WC[this.immune], 18, 0.35, 2); G.fx.float(this.x, this.y - (this.h || 16) - 10, WN[this.immune] + ' 내성', WC[this.immune], { life: 0.8 }); sfx('barrier'); }
        this.wardT = 5.5;
      }
    }
    return fu0.call(this, dt, Wd);
  };
  const fd0 = Foe.prototype.draw;
  Foe.prototype.draw = function (g, cx, cy) {
    let a = 1;
    if (active('fog') && !this.boss && !(this.revealT > 0)) { const p = W().player; if (p) { const d = U.dist(this.x, this.y, p.x, p.y); a = d < 60 ? 1 : d > 118 ? 0.05 : 1 - (d - 60) / 58 * 0.95; } }
    if (a < 1) g.globalAlpha = a;
    const r = fd0.call(this, g, cx, cy);
    if (a < 1) g.globalAlpha = 1;
    if (this.immune && !this.dead && a > 0.3) drawWard(g, this, cx, cy);
    return r;
  };
  function drawWard(g, e, cx, cy) {
    const x = Math.round(e.x - cx), y = Math.round(e.y - cy), top = y - (e.h || 16) - 16;
    // 발밑 고리 · 머리 위 표식 (그 무기 아이콘 위에 빨간 사선)
    g.strokeStyle = WC[e.immune]; g.globalAlpha = 0.55 + Math.sin(W().t * 6) * 0.2; g.lineWidth = 1;
    g.beginPath(); g.ellipse(x, y - 1, (e.r || 8) + 3, ((e.r || 8) + 3) * 0.4, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const ic = H.icon(e.immune === 'magic' ? 'magic' : e.immune);
    g.fillStyle = 'rgba(11,9,20,0.75)'; g.fillRect(x - 8, top - 1, 16, 14);
    g.drawImage(ic, x - 6, top);
    g.strokeStyle = '#ff4a5a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6, top + 11); g.lineTo(x + 6, top + 1); g.stroke(); g.lineWidth = 1;
    if (e.weakW) { g.fillStyle = WC[e.weakW]; g.fillRect(x + 7, top + 4, 3, 3); g.fillStyle = '#ffe066'; g.fillRect(x + 8, top + 1, 1, 2); }
  }

  /* ───────── 무기 내성: 던전의 적 몇몇 ───────── */
  const spawn0 = G.foes.spawn;
  G.foes.spawn = function (type, x, y, o) {
    const e = spawn0.apply(this, arguments);
    if (e && o && o.inDungeon && !e.boss && o.ward !== false) armor(e, o);
    return e;
  };
  function armor(e, o) {
    const av = avail(); if (av.length < 2) return;
    // 칙령의 방(그 방 무기만 통한다)에서는 내성을 붙이지 않는다 — 둘이 겹치면 무기로 잡을 수 없다
    if (RULE_OF[W().map && W().map.dungeon] === 'edict') { const r = roomOf(W().map, e.x, e.y); if (r && r.k[0] !== 'x') return; }
    const tier = o.tier || 0;
    let w = o.ward;
    if (!w) { if (tier < 1 || Math.random() > Math.min(0.4, 0.1 + tier * 0.03)) return; w = 'auto'; }
    if (w === 'cycle') { e.wardCycle = true; e.wardT = 5; w = 'auto'; }
    e.immune = w === 'auto' ? U.pick(av, Math.random()) : (av.includes(w) ? w : null);
    if (!e.immune) return;
    const rest = av.filter((x) => x !== e.immune);
    if (rest.length && Math.random() < 0.6) e.weakW = U.pick(rest, Math.random());
  }
  // 처음 내성 적을 만나면 한 번 알려 준다
  ST.onTick.push(() => {
    const s = S(); if (!s || s.flags.wardTold || G.script.running) return;
    const p = W().player; if (!p) return;
    const e = C.foes().find((f) => f.immune && U.dist(f.x, f.y, p.x, p.y) < 120);
    if (e) { s.flags.wardTold = true; G.ui.toast('머리 위에 [y]' + WN[e.immune] + '[/] 표식 — 그 무기는 튕긴다. [y]K[/]로 바꿔 들어라 (작은 점은 약점 무기)', 'white'); }
  });

  /* ───────── 피의 달 · 자라는 적: 쓰러뜨릴 때 ───────── */
  ST.killHooks.push((e, s) => {
    if (active('blood') && RS.on > 0 && !e.boss) {
      const d = G.st.derive(s); s.hp = Math.min(d.hpMax, s.hp + 1);
      C.spawnPickup(e.x, e.y, 'exp', Math.max(1, Math.round(e.exp || 4)));
      G.fx.float(e.x, e.y - 20, '피의 달 +¼', '#ff8a9a', { life: 0.6 });
    }
    if (active('growth') && !e.boss) {
      C.spawnPickup(e.x, e.y, 'exp', Math.max(1, Math.round((e.exp || 4) * 0.5)));
      for (const o of C.foes()) if (o !== e && !o.boss && o.room === e.room) { o.maxHp = Math.round(o.maxHp * 1.2); o.hp = Math.min(o.maxHp, o.hp * 1.2); o.atk = (o.atk || 1) + 0.5; o.grown = (o.grown || 0) + 1; G.fx.ring(o.x, o.y - 10, '#ffb86a', 14, 0.3, 1); G.fx.float(o.x, o.y - (o.h || 16) - 8, '강해졌다', '#ffb86a', { life: 0.6 }); }
    }
  });

  /* ───────── 화면: 법칙 표 · 혹한 눈금 · 차례 ───────── */
  const draw0 = H.draw;
  H.draw = function (g, w, h) {
    const r = draw0.apply(this, arguments);
    const m = W().map, s = S(), p = W().player;
    if (!RS.rule || !m || m.dungeon !== RS.did || !p || H.hidden || (G.cine && G.cine.active && G.cine.active())) return r;
    const R = RULES[RS.rule], d = G.st.derive(s);
    const rows = Math.ceil(Math.ceil(d.hpMax / 4) / 10);
    let y = 5 + rows * 8 + 2 + (Object.keys(s.spells || {}).length ? 5 : 0) + 5 + 9 + (s.buffs.some((b) => b.until > s.t) ? 7 : 0) + 1;
    g.font = "8px 'Galmuri11', monospace"; g.textBaseline = 'alphabetic';
    const lab = '법칙 · ' + R.name;
    const tw = g.measureText(lab).width;
    g.fillStyle = 'rgba(11,9,20,0.72)'; g.fillRect(5, y, tw + 14, 11);
    g.fillStyle = R.col; g.fillRect(7, y + 3, 4, 4);
    g.fillStyle = '#e8e0f8'; g.fillText(lab, 13, y + 8);
    y += 13;
    // 차례 눈금 (밀물 · 정전 · 피의 달 · 돌풍)
    let k = null, col = R.col;
    if (RS.rule === 'tide') { const c = RS.t % 24; k = RS.high ? 1 - (c - 15) / 9 : c / 15; col = RS.high ? '#6ab8ff' : '#2a4a78'; }
    else if (RS.rule === 'cold') { k = RS.chill / 100; col = RS.frozen ? '#ffffff' : '#bfe8ff'; }
    else if ((RS.rule === 'blackout' || RS.rule === 'blood' || RS.rule === 'gust') && RS.on > 0) k = RS.on / (RS.rule === 'blood' ? 9 : RS.rule === 'gust' ? 2.4 : 4.5);
    if (k != null) { g.fillStyle = 'rgba(11,9,20,0.72)'; g.fillRect(5, y, 52, 4); g.fillStyle = col; g.fillRect(6, y + 1, Math.round(50 * U.clamp(k, 0, 1)), 2); }
    if (RS.rule === 'edict' && RS.edict) { const rr = roomOf(m, p.x, p.y), ww = rr && RS.edict[rr.k]; if (ww) { g.fillStyle = 'rgba(11,9,20,0.72)'; g.fillRect(5, y, 60, 11); g.fillStyle = WC[ww]; g.fillText(WN[ww] + '만 통한다', 8, y + 8); } }
    return r;
  };

  G.rules = { RULES, RULE_OF, RS, active, roomOf, isBossRoom };
})();
