/* 무기고: 검 · 활 · 마법을 따로따로 넓힌다
   ─ 검 여섯 · 활 여섯 · 마도구(새 칸: 지팡이 · 수정구 · 마도서) 여덟
   ─ 새 마법 다섯 (독안개 · 빛의 방벽 · 순간이동 · 중력장 · 눈보라)
   ─ 새 필살기 아홉 (검 셋 · 활 셋 · 마법 셋)
   ─ 재능 나무에 갈래마다 세 칸씩 (찌르기 달인 · 가르기 · 뒷걸음 사격 · 표식 · 화살 폭풍 · 집중 · 연쇄 · 피의 영창 …)
   등급마다 세기의 폭을 맞춘다: 검 공격 일반 1~2 · 고급 3.5~6 · 희귀 6~11 · 영웅 12~16 · 전설 16~21, 활은 그 ⅔쯤, 마도구는 마법 배율 ×1.1~×1.55. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, C = G.combat, E = G.ent;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const foes = () => C.foes();
  const near = (x, y, r, n) => foes().filter((e) => U.dist(x, y, e.x, e.y) < r).sort((a, b) => U.dist(x, y, a.x, a.y) - U.dist(x, y, b.x, b.y)).slice(0, n || 99);
  const onScreen = (e) => { const Wd = W(), v = Wd.view; return e.x > Wd.rcx - 8 && e.x < Wd.rcx + v.w + 8 && e.y > Wd.rcy - 8 && e.y < Wd.rcy + v.h + 24; };
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id, price: 0, desc: '' }, o); D.ITEMS[id].id = id; return D.ITEMS[id]; };

  /* ═════════ 검 ═════════ */
  item('sw_rapier', { type: 'sword', grade: 2, name: '은빛 레이피어', atk: 4, reach: 23, speed: 0.82, thrust: 0.6, crit: 0.06, col: '#e8eef8', price: 2400, req: { dex: 5, str: 3 }, desc: '가늘고 곧다. 셋째 베기(찌르기)가 +60% 깊이 들어간다. 치명타 +6%.' });
  item('sw_axe', { type: 'sword', grade: 2, name: '나무꾼의 도끼검', atk: 6, reach: 19, speed: 1.18, heavy: 1.35, col: '#a8a098', price: 2600, req: { str: 6 }, desc: '장작 패던 도끼에 날을 세웠다. 느리지만 한 번에 적이 밀려난다. 넉백 +35%.' });
  item('sw_frost', { type: 'sword', grade: 3, name: '서리 송곳검', atk: 9, reach: 24, el: 'ice', col: '#bfe8ff', glow: '#e8f8ff', price: 12800, req: { str: 10 }, desc: '화이트 수녀원 지하에서 녹지 않던 고드름을 벼렸다. 베인 적이 잠깐 언다.' });
  item('sw_twin', { type: 'sword', grade: 3, name: '쌍월도', atk: 7, reach: 21, speed: 0.78, twin: 0.55, crit: 0.1, col: '#d8c8ff', price: 15000, req: { dex: 10, str: 6 }, desc: '두 자루가 한 벌. 한 번 벨 때 두 번째 날이 55%로 따라 들어간다. 치명타 +10%.' });
  item('sw_blood', { type: 'sword', grade: 4, name: '붉은 달', atk: 14, reach: 25, drain: 0.08, bleed: true, col: '#ff5a6a', glow: '#ff8a9a', req: { str: 16, lv: 24 }, desc: '달이 붉던 밤에 벼린 검. 베인 자리에서 피가 멎지 않고(출혈), 벤 만큼 체력이 돌아온다.' });
  item('sw_sky', { type: 'sword', grade: 5, name: '하늘가르개', atk: 20, reach: 30, beam: true, beamAt: 0, el: 'wind', col: '#e8fff4', glow: '#b8ffd8', req: { str: 24, dex: 12, lv: 40 }, desc: '구름 신전 꼭대기, 바람이 멈추는 자리에 꽂혀 있었다. 휘두를 때마다 검기가 난다. 사거리가 가장 길다.' });

  /* ═════════ 활 ═════════ */
  item('bw_cross', { type: 'bow', grade: 2, name: '연발 석궁', atk: 3.5, draw: 0.62, rapid: true, col: '#8a7a6a', price: 3000, req: { dex: 6 }, desc: '고철 시장의 발명품. 모으지 않고 쏘면 화살 한 발 값으로 두 발이 나간다.' });
  item('bw_venom', { type: 'bow', grade: 3, name: '독침 활', atk: 6, draw: 0.45, el: 'poison', price: 11800, req: { dex: 10 }, desc: '안개 늪 사냥꾼의 활. 모든 화살에 독이 묻어 있다.' });
  item('bw_thunder', { type: 'bow', grade: 3, name: '천둥 활', atk: 7, draw: 0.48, el: 'bolt', price: 14500, req: { dex: 12, int: 4 }, desc: '시위를 놓으면 번개가 튄다. 맞은 적 옆의 적에게 번개가 옮는다.' });
  item('bw_seeker', { type: 'bow', grade: 4, name: '추적자의 활', atk: 10, draw: 0.4, homing: 3.2, col: '#c8e8a8', req: { dex: 16, lv: 22 }, desc: '화살이 겨눈 쪽의 가장 가까운 적을 쫓아간다.' });
  item('bw_moon', { type: 'bow', grade: 4, name: '달그림자 활', atk: 11, draw: 0.36, crit: 0.12, pierce: 1, col: '#a8b8ff', price: 34000, req: { dex: 18 }, desc: '밤의 가게 깊은 서랍에서. 소리 없이 꿰뚫는다. 화살 치명타 +12%, 한 번 더 꿰뚫는다.' });
  item('bw_heaven', { type: 'bow', grade: 5, name: '천궁 「은하수」', atk: 15, draw: 0.3, el: 'light', multi: 3, homing: 2.2, ret: true, col: '#fff4c8', req: { dex: 26, lv: 40 }, desc: '별을 쏘아 올려 은하수를 만들었다는 활. 모으면 빛 화살 셋이 적을 쫓고, 쏜 화살은 되돌아온다.' });

  /* ═════════ 마도구 (새 칸) ═════════ */
  // mag: 마법 배율 · cost: MP 소모 배율 · cast: 영창 시간 배율 · elb: 원소 강화 · chain: 번개 +대상 · blast: 불 폭발 배율 · echo: 한 번 더 · fx: 능력치
  item('fc_twig', { type: 'focus', grade: 1, name: '견습생의 지팡이', mag: 1.1, col: '#a8784a', price: 600, desc: '마법 피해 ×1.1. 그린 학교 아이들이 쓰던 것.' });
  item('fc_coral', { type: 'focus', grade: 2, name: '산호 지팡이', mag: 1.12, cost: 0.9, elb: { ice: 1.3 }, col: '#ff9aa8', price: 2800, req: { int: 4 }, desc: '마법 ×1.12, MP -10%, 얼음 마법 +30%.' });
  item('fc_ember', { type: 'focus', grade: 2, name: '불씨 홀', mag: 1.12, elb: { fire: 1.35 }, blast: 1.6, col: '#ff8a4a', price: 3000, req: { int: 4 }, desc: '마법 ×1.12, 불 마법 +35%, 불덩이 폭발이 크다.' });
  item('fc_orb', { type: 'focus', grade: 3, name: '라벤더 수정구', mag: 1.25, fx: { mpRegen: 0.5, int: 2 }, col: '#c49bff', price: 12500, req: { int: 10 }, desc: '마법 ×1.25, 지력 +2, MP가 조금씩 찬다.' });
  item('fc_storm', { type: 'focus', grade: 3, name: '뇌운의 봉', mag: 1.2, chain: 2, elb: { bolt: 1.3 }, col: '#ffe88a', price: 15000, req: { int: 12 }, desc: '마법 ×1.2, 번개가 둘 더 옮고 +30%.' });
  item('fc_moon', { type: 'focus', grade: 4, name: '달의 마도서', mag: 1.3, elb: { light: 1.4, dark: 1.4 }, fx: { int: 4 }, col: '#c8d8ff', price: 36000, req: { int: 16 }, desc: '마법 ×1.3, 지력 +4, 빛 · 어둠 마법 +40%.' });
  item('fc_star', { type: 'focus', grade: 4, name: '별지기의 지팡이', mag: 1.35, cast: 0.7, echo: 0.15, col: '#fff0a8', req: { int: 18, lv: 26 }, desc: '마법 ×1.35, 영창 -30%, 15% 확률로 한 번 더.' });
  item('fc_origin', { type: 'focus', grade: 5, name: '근원의 홀', mag: 1.55, cost: 0.8, echo: 0.1, fx: { int: 6 }, col: '#fffbe8', req: { int: 26, lv: 40 }, desc: '처음 빛을 부른 사람이 쥐었다는 홀. 마법 ×1.55, MP -20%, 지력 +6.' });

  /* ═════════ 새 마법 ═════════ */
  const SP = D.SPELLS;
  SP.poison = { name: '독안개', mp: 10, icon: 'poison', col: '#9ae86a', grade: 2, req: { int: 4 }, desc: '겨눈 곳에 독안개를 3초 깐다. 들어온 적은 중독된다.' };
  SP.barrier = { name: '빛의 방벽', mp: 18, icon: 'barrier', col: '#fff4c8', grade: 3, req: { int: 10 }, desc: '6초 동안 공격 세 번을 막는다(지력이 높으면 더). 막는 동안 날아오는 탄을 녹인다.' };
  SP.blink = { name: '순간이동', mp: 12, icon: 'blink', col: '#c8b8ff', grade: 3, req: { int: 8 }, desc: '바라보는 쪽으로 세 칸을 건너뛴다. 떠난 자리와 닿은 자리에서 빛이 터진다.' };
  SP.gravity = { name: '중력장', mp: 26, icon: 'gravity', col: '#8a6ad8', grade: 4, req: { int: 16, lv: 20 }, desc: '앞에 검은 구슬을 두어 2초 동안 적을 끌어당긴 뒤 짓누른다.' };
  SP.blizzard = { name: '눈보라', mp: 30, icon: 'blizzard', col: '#e8f8ff', grade: 4, req: { int: 18, lv: 24 }, desc: '3초 동안 둘레에 눈보라가 휘몰아친다. 닿는 적은 얼고 계속 다친다.' };
  item('tome_poison', { type: 'tome', grade: 2, name: '독안개 마도서', spell: 'poison', price: 3200, desc: '읽으면 독안개를 배운다.' });
  item('tome_barrier', { type: 'tome', grade: 3, name: '빛의 방벽 마도서', spell: 'barrier', price: 13000, desc: '읽으면 빛의 방벽을 배운다.' });
  item('tome_blink', { type: 'tome', grade: 3, name: '순간이동 마도서', spell: 'blink', price: 11000, desc: '읽으면 순간이동을 배운다.' });
  item('tome_gravity', { type: 'tome', grade: 4, name: '중력장 마도서', spell: 'gravity', price: 32000, desc: '읽으면 중력장을 배운다.' });
  item('tome_blizzard', { type: 'tome', grade: 4, name: '눈보라 마도서', spell: 'blizzard', desc: '읽으면 눈보라를 배운다.' });

  const Sh = () => C.Shot;
  C.spellFx = {
    poison(p, d, a, mm) {
      const x = p.x + Math.cos(a) * 46, y = p.y + Math.sin(a) * 36;
      C.marks.push({ x, y, t: 0, life: 0.2, r: 30, col: '#9ae86a' });
      sfx('cast');
      W().add(new E.Ent({ kind: 'cloud', solid: false, x, y, life: 3, tick: 0, update(dt) {
        this.life -= dt; this.tick -= dt; if (this.life <= 0) { this.dead = true; return; }
        for (let i = 0; i < 3; i++) G.fx.part({ x: this.x + (Math.random() - 0.5) * 56, y: this.y + (Math.random() - 0.5) * 40, z: Math.random() * 10, vz: 6, g: 0, life: 0.7, col: Math.random() < 0.5 ? '#9ae86a' : '#6ab84a', size: 2 });
        if (this.tick <= 0) { this.tick = 0.4; for (const e of near(this.x, this.y, 32)) { e.poisonT = Math.max(e.poisonT || 0, 3.5); C.damage(e, (0.8 + S().lv * 0.04) * mm, { src: 'spell', el: 'poison', kx: 0, ky: 0, power: 0 }); } }
      } }));
    },
    barrier(p, d) {
      p.barrier = 3 + Math.floor((d.stats.int || 0) / 12); p.barrierT = 6;
      G.fx.ring(p.x, p.y - 10, '#fff4c8', 20, 0.5, 2); sfx('white');
      G.fx.float(p.x, p.y - 34, '방벽 ×' + p.barrier, '#fff4c8');
    },
    blink(p, d, a, mm) {
      const m = W().map; const x0 = p.x, y0 = p.y;
      let best = null;
      for (let r = 48; r >= 12; r -= 4) { const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * 0.85; const tx = Math.floor(x / 16), ty = Math.floor((y - 3) / 16); const z = m.T(tx, ty) === G.tiles.T.STAIRS ? p.z : m.H(tx, ty); if (Math.abs(z - p.z) > 0) continue; if (m.boxFree(x - p.bw / 2, y - p.bh, p.bw, p.bh, z, p) && !W().propBlock(x - p.bw / 2, y - p.bh, p.bw, p.bh, p)) { best = [x, y]; break; } }
      const burst = (x, y) => { G.fx.ring(x, y - 8, '#c8b8ff', 22, 0.35, 2); G.fx.sparks(x, y - 8, 12, '#e8e0ff', 90); for (const e of near(x, y, 26)) C.damage(e, (3 + S().lv * 0.14) * mm, { src: 'spell', el: 'light', kx: 0, ky: 0, stun: 0.6, power: 0.8 }); };
      burst(x0, y0);
      if (best) { if (p.sheet) { const img = p.sheet.get('atk', p.dir, 1); G.fx.afterimage(G.gfx.silhouette ? G.gfx.silhouette(img, '#c8b8ff') : img, x0 - img.width / 2, y0 - img.height, 0.7); } p.x = best[0]; p.y = best[1]; G.ent.settle(m, p); p.inv = Math.max(p.inv, 0.35); burst(p.x, p.y); }
      sfx('warp');
    },
    gravity(p, d, a, mm) {
      const x = p.x + Math.cos(a) * 52, y = p.y + Math.sin(a) * 40;
      sfx('cast');
      W().add(new E.Ent({ kind: 'well', solid: false, x, y, t: 0, update(dt) {
        this.t += dt;
        for (const e of near(this.x, this.y, 96)) { if (e.boss || (e.weight || 1) >= 5) continue; const [nx, ny] = U.norm(this.x - e.x, this.y - e.y); E.move(W().map, e, nx * 70 * dt, ny * 70 * dt); }
        if (Math.random() < 0.8) { const aa = Math.random() * Math.PI * 2, r = 30 + Math.random() * 50; G.fx.part({ x: this.x + Math.cos(aa) * r, y: this.y + Math.sin(aa) * r * 0.7, z: 6, vx: -Math.cos(aa) * r * 1.6, vy: -Math.sin(aa) * r * 1.1, vz: 0, g: 0, life: 0.55, col: '#8a6ad8', size: 1, glow: true }); }
        if (this.t >= 2) {
          this.dead = true; W().shake(5, 0.3); sfx('explode'); G.fx.ring(this.x, this.y - 6, '#b89aff', 60, 0.45, 3);
          for (const e of near(this.x, this.y, 60)) { const [nx, ny] = U.norm(e.x - this.x, e.y - this.y); C.damage(e, (8 + S().lv * 0.22) * mm, { src: 'spell', el: 'dark', kx: nx, ky: ny, power: 1.2, stun: 1 }); }
        }
      }, draw(g, cx, cy) { const X = Math.round(this.x - cx), Y = Math.round(this.y - cy - 10); const r = 7 + Math.sin(this.t * 12) * 1.5; g.fillStyle = 'rgba(30,10,60,0.85)'; g.beginPath(); g.arc(X, Y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#c49bff'; g.lineWidth = 1; g.beginPath(); g.arc(X, Y, r + 2, 0, Math.PI * 2); g.stroke(); } }));
    },
    blizzard(p, d, a, mm) {
      sfx('ice'); if (G.light) G.light.flare(p.x, p.y, 110, 3, '#e8f8ff');
      W().add(new E.Ent({ kind: 'storm', solid: false, x: p.x, y: p.y, t: 0, tick: 0, update(dt) {
        const pl = W().player; if (pl) { this.x = pl.x; this.y = pl.y; }
        this.t += dt; this.tick -= dt;
        for (let i = 0; i < 4; i++) { const aa = Math.random() * Math.PI * 2, r = 20 + Math.random() * 70; G.fx.part({ x: this.x + Math.cos(aa) * r, y: this.y + Math.sin(aa) * r * 0.7, z: 10 + Math.random() * 20, vx: Math.cos(aa + 1.6) * 80, vy: Math.sin(aa + 1.6) * 50, vz: -10, g: 0, life: 0.5, col: '#ffffff', size: 1 }); }
        if (this.tick <= 0) { this.tick = 0.5; for (const e of near(this.x, this.y, 88)) { C.damage(e, (1.6 + S().lv * 0.07) * mm, { src: 'spell', el: 'ice', kx: 0, ky: 0, power: 0.2 }); e.freezeT = Math.max(e.freezeT || 0, e.boss ? 0.4 : 1.2); } }
        if (this.t >= 3) this.dead = true;
      } }));
    },
  };
  // 방벽 시간 · 모습
  const pu0 = G.Player.prototype.update;
  G.Player.prototype.update = function (dt) {
    pu0.apply(this, arguments);
    if (this.barrierT > 0) {
      this.barrierT -= dt; if (this.barrierT <= 0) this.barrier = 0;
      // 방벽 둘레의 적 탄을 녹인다
      for (const e of W().ents) if (e.kind !== 'foe' && e.owner === 'foe' && !e.dead && U.dist(e.x, e.y, this.x, this.y - 8) < 22) { e.dead = true; G.fx.sparks(e.x, e.y, 5, '#fff4c8', 60); }
      if (Math.random() < 0.4) { const aa = Math.random() * Math.PI * 2; G.fx.part({ x: this.x + Math.cos(aa) * 14, y: this.y - 8 + Math.sin(aa) * 12, z: 0, vz: 0, g: 0, life: 0.3, col: '#fff4c8', size: 1, glow: true }); }
    }
    if (this.hawkT > 0) this.hawkT -= dt;
  };

  /* ═════════ 새 필살기 ═════════ */
  const SPC = D.SPECIALS;
  Object.assign(SPC, {
    moonslash: { name: '초승달 베기', grade: 2, type: 'sword', req: { str: 8 }, desc: '[검] 크게 휘둘러 초승달 검기를 날린다. 모든 것을 꿰뚫는다.' },
    quakeblade: { name: '대지 가르기', grade: 3, type: 'sword', req: { str: 14, lv: 16 }, desc: '[검] 검을 땅에 꽂아 앞으로 바위 기둥이 줄지어 솟는다.' },
    thousand: { name: '천검난무', grade: 5, type: 'sword', req: { str: 26, lv: 40 }, desc: '[검] 빛의 검 스물넷이 하늘에서 쏟아져 둘레의 적을 꿰뚫는다.' },
    bombarrow: { name: '폭렬 화살', grade: 2, type: 'bow', req: { dex: 8 }, desc: '[활] 부채꼴로 터지는 화살 셋.' },
    hawk: { name: '매의 눈', grade: 3, type: 'bow', req: { dex: 14, lv: 16 }, desc: '[활] 8초 동안 모든 화살이 적을 쫓고 반드시 치명타. 시위도 빨라진다.' },
    galaxy: { name: '유성우 궁', grade: 5, type: 'bow', req: { dex: 26, lv: 40 }, desc: '[활] 하늘로 쏜 화살이 서른 개의 별이 되어 적을 쫓아 떨어진다.' },
    nova: { name: '마력 폭발', grade: 2, type: 'magic', req: { int: 8 }, desc: '[마법] 몸 둘레로 마력을 터뜨려 적을 날려 보낸다.' },
    blackhole: { name: '검은 별', grade: 4, type: 'magic', req: { int: 20, lv: 28 }, desc: '[마법] 화면 가운데 검은 별이 떠 모든 적을 빨아들이고 무너진다.' },
    genesis: { name: '창세의 빛', grade: 5, type: 'magic', req: { int: 28, lv: 40 }, desc: '[마법] 빛줄기를 한 바퀴 휘둘러 화면의 적을 모두 태운다.' },
  });
  // 옛 필살기에도 갈래 표시
  for (const [k, t] of Object.entries({ flash: 'sword', whirl: 'sword', triple: 'sword', shadow: 'sword', meteor: 'sword', dance: 'sword', rain: 'bow', starshot: 'bow', flame: 'magic', frost: 'magic', thunder: 'magic', judge: 'magic' })) if (SPC[k]) { SPC[k].type = t; if (!/^\[/.test(SPC[k].desc)) SPC[k].desc = '[' + { sword: '검', bow: '활', magic: '마법' }[t] + '] ' + SPC[k].desc; }
  const art = (id, sp, o) => item(id, Object.assign({ type: 'art', special: sp, grade: SPC[sp].grade, name: '비기: ' + SPC[sp].name, desc: '읽으면 필살기 「' + SPC[sp].name + '」을 익힌다. ' + SPC[sp].desc }, o || {}));
  art('art_moonslash', 'moonslash', { price: 3600 });
  art('art_quakeblade', 'quakeblade', { price: 14000 });
  art('art_thousand', 'thousand');
  art('art_bombarrow', 'bombarrow', { price: 3600 });
  art('art_hawk', 'hawk', { price: 15000 });
  art('art_galaxy', 'galaxy');
  art('art_nova', 'nova', { price: 3600 });
  art('art_blackhole', 'blackhole', { price: 40000 });
  art('art_genesis', 'genesis');

  const MV = G.specials.MOVES;
  Object.assign(MV, {
    moonslash: {
      start(p) {
        const d = G.st.derive(S()), a = Math.atan2(p.face[1], p.face[0]);
        C.after(0.12, () => {
          C.shoot({ kind: 'beam', x: p.x + Math.cos(a) * 12, y: p.y - 4 + Math.sin(a) * 10, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, dmg: d.atk * 3.2, src: 'special', el: d.el, r: 12, life: 0.7, pierce: 99, power: 1.6, ghost: true, z: p.z, trail: '#e8f4ff',
            drawFn(g, x, y) { const an = Math.atan2(this.vy, this.vx); g.save(); g.translate(x, y); g.rotate(an); g.strokeStyle = 'rgba(232,244,255,0.95)'; g.lineWidth = 3; g.beginPath(); g.arc(-8, 0, 14, -1.2, 1.2); g.stroke(); g.strokeStyle = 'rgba(160,200,255,0.6)'; g.lineWidth = 1; g.beginPath(); g.arc(-11, 0, 14, -1.1, 1.1); g.stroke(); g.restore(); } });
          W().shake(3, 0.2); sfx('beam');
        });
        p.spx.dur = 0.4;
      },
      update(p) { p.atkFrame = p.spx.t < 0.12 ? 0 : 1; return p.spx.t >= p.spx.dur; },
    },
    quakeblade: {
      start(p) {
        const d = G.st.derive(S()), [fx, fy] = p.face;
        for (let i = 0; i < 7; i++) C.after(0.12 + i * 0.07, () => {
          const x = p.x + fx * (18 + i * 16), y = p.y + fy * (14 + i * 12);
          G.fx.dust(x, y, 6); for (let k = 0; k < 6; k++) G.fx.part({ x: x + (Math.random() - 0.5) * 10, y, z: 0, vz: 90 + Math.random() * 60, g: 300, life: 0.5, col: Math.random() < 0.5 ? '#a8784a' : '#d8b080', size: 2 });
          G.fx.ring(x, y, '#d8a868', 14, 0.3, 2); W().shake(2, 0.08);
          for (const e of near(x, y, 20)) { if (e.fly) continue; C.damage(e, d.atk * 2.6, { src: 'special', el: 'earth', kx: 0, ky: -0.2, power: 0.6, stun: 1.2, unblockable: true }); }
          sfx('rumble');
        });
        p.spx.dur = 0.62;
      },
      update(p) { p.atkFrame = 1; return p.spx.t >= p.spx.dur; },
    },
    thousand: {
      start(p) {
        const d = G.st.derive(S()), list = foes().filter(onScreen);
        for (let i = 0; i < 24; i++) C.after(0.15 + i * 0.045, () => {
          const e = list.length ? list[i % list.length] : null;
          const x = e && !e.dead ? e.x + (Math.random() - 0.5) * 10 : p.x + (Math.random() - 0.5) * 140, y = e && !e.dead ? e.y : p.y + (Math.random() - 0.5) * 90;
          G.fx.part({ x, y, z: 70, vz: -520, g: 0, life: 0.13, col: '#ffe066', size: 2, glow: true, streak: true });
          C.after(0.13, () => { G.fx.slash(x, y - 6, Math.PI / 2, '#fff4c8', 18); G.fx.sparks(x, y - 4, 5, '#ffe066', 60); for (const f of near(x, y, 16)) C.damage(f, d.atk * 1.6, { src: 'special', el: 'light', kx: 0, ky: 0, power: 0.3, unblockable: true, chain: true }); });
          if (i % 3 === 0) sfx('swing');
        });
        C.after(1.35, () => { G.cine.flash('#fff', 0.2, 0.35); W().shake(5, 0.3); sfx('white'); for (const e of list) if (!e.dead) C.damage(e, d.atk * 3, { src: 'special', el: 'light', kx: 0, ky: 0, crit: true, unblockable: true }); });
        p.spx.dur = 0.7;
      },
      update(p) { p.atkFrame = 1; return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    bombarrow: {
      start(p) {
        const d = G.st.derive(S()), a0 = Math.atan2(p.face[1], p.face[0]);
        for (const off of [-0.3, 0, 0.3]) C.shoot({ kind: 'arrow', x: p.x + Math.cos(a0 + off) * 8, y: p.y - 2 + Math.sin(a0 + off) * 6, vx: Math.cos(a0 + off) * 300, vy: Math.sin(a0 + off) * 300, dmg: d.bowAtk * 2 + 2, src: 'arrow', r: 4, life: 0.7, z: p.z, trail: '#ffb04a', explode: 1.1, power: 1 });
        sfx('shootc'); p.spx.dur = 0.35;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    hawk: {
      start(p) { p.hawkT = 8; G.fx.ring(p.x, p.y - 10, '#c8e8a8', 30, 0.5, 2); G.fx.float(p.x, p.y - 36, '매의 눈', '#c8e8a8', { big: true }); sfx('charged'); p.spx.dur = 0.3; },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    galaxy: {
      start(p) {
        const d = G.st.derive(S());
        G.fx.part({ x: p.x, y: p.y - 10, z: 10, vz: 400, g: 0, life: 0.3, col: '#fff4c8', size: 3, glow: true, streak: true });
        sfx('shootc');
        for (let i = 0; i < 30; i++) C.after(0.45 + i * 0.04, () => {
          const list = foes().filter((e) => !e.dead && onScreen(e));
          const t = list.length ? list[i % list.length] : null;
          const a = Math.random() * Math.PI * 2;
          C.shoot({ kind: 'arrow', x: p.x + Math.cos(a) * 60, y: p.y - 60 + Math.sin(a) * 20, vx: Math.cos(a) * 60, vy: 120, dmg: d.bowAtk * 1.8 + 2, src: 'arrow', el: 'light', r: 4, life: 1.6, pierce: 1, ghost: true, trail: '#fff4c8', homing: 6, target: t, z: p.z });
        });
        p.spx.dur = 0.5;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'bow',
    },
    nova: {
      start(p) {
        const d = G.st.derive(S());
        G.fx.ring(p.x, p.y - 6, '#c8b8ff', 64, 0.45, 3); G.fx.glow(p.x, p.y - 8, '#c8b8ff', 20, 40); sfx('explode'); W().shake(4, 0.25);
        for (const e of near(p.x, p.y, 66)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, (4 + S().lv * 0.18) * d.magMul, { src: 'spell', el: 'light', kx: nx, ky: ny, power: 2.4, stun: 0.8 }); }
        p.spx.dur = 0.35;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    blackhole: {
      start(p) {
        const d = G.st.derive(S()), Wd = W(), v = Wd.view;
        const cx = Wd.rcx + v.w / 2, cy = Wd.rcy + v.h / 2 + 10;
        C.spellFx.gravity({ x: cx - p.face[0] * 52, y: cy - p.face[1] * 40, z: p.z }, d, Math.atan2(p.face[1], p.face[0]), d.magMul * 1.6);
        p.spx.dur = 0.4;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    genesis: {
      start(p) { p.spx.dur = 1.3; p.spx.a0 = Math.atan2(p.face[1], p.face[0]); p.spx.hit = new Map(); sfx('beam'); if (G.light) G.light.flare(p.x, p.y, 160, 4, '#fff8d0'); },
      update(p) {
        const X = p.spx, d = G.st.derive(S());
        const k = Math.min(1, X.t / 1.1), a = X.a0 + k * Math.PI * 2, len = 150;
        for (let r = 12; r < len; r += 10) if (Math.random() < 0.5) G.fx.part({ x: p.x + Math.cos(a) * r, y: p.y - 8 + Math.sin(a) * r * 0.8, z: 4, vz: 0, g: 0, life: 0.18, col: r % 20 ? '#fff8d0' : '#ffe066', size: 2, glow: true });
        for (const e of foes()) {
          const ea = U.angle(e.x - p.x, e.y - p.y + 8), dd = U.dist(p.x, p.y, e.x, e.y);
          if (dd > len || Math.abs(U.angDiff(a, ea)) > 0.18) continue;
          const last = X.hit.get(e) || -9; if (X.t - last < 0.35) continue;
          X.hit.set(e, X.t);
          C.damage(e, (10 + S().lv * 0.35) * d.magMul, { src: 'spell', el: 'light', kx: 0, ky: 0, power: 0.5, crit: true });
        }
        if (Math.random() < 0.3) W().shake(2, 0.05);
        return X.t >= X.dur;
      },
      draw: 'cast',
    },
  });
  /* ═════════ 활: 매의 눈 · 화살 폭풍 ═════════ */
  const Shot0 = C.Shot;
  const wadd0 = G.world.add;
  G.world.add = function (e) {
    const p = G.world.player;
    if (e && e instanceof Shot0 && e.owner !== 'foe' && e.src === 'arrow' && p && p.hawkT > 0) {
      e.crit = true; e.homing = e.homing || 3;
      if (!e.target) { let bd = 1e9; for (const f of foes()) { const dd = U.dist(e.x, e.y, f.x, f.y); if (dd < 240 && dd < bd) { bd = dd; e.target = f; } } }
    }
    return wadd0.apply(this, arguments);
  };
  const od0 = C.onDamage;
  C.onDamage = function (e, info, dmg, crit) {
    if (od0) od0.apply(this, arguments);
    const s = S(), p = W().player;
    if (info.src === 'arrow' && s.skills.bw_storm && p && !info.chain) {
      p.arrowHits = (p.arrowHits || 0) + 1;
      if (p.arrowHits >= 4) {
        p.arrowHits = 0;
        const d = G.st.derive(s), cx = e.x, cy = e.y;
        C.marks.push({ x: cx, y: cy, t: 0, life: 0.35, r: 26, col: '#fff0a8' });
        for (let i = 0; i < 10; i++) C.after(0.3 + i * 0.03, () => { const aa = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 26, x = cx + Math.cos(aa) * r, y = cy + Math.sin(aa) * r * 0.75; G.fx.part({ x, y, z: 50, vz: -420, g: 0, life: 0.12, col: '#fff4c8', size: 1, glow: true, streak: true }); C.after(0.12, () => { for (const f of near(x, y, 12)) C.damage(f, d.bowAtk * 0.8, { src: 'arrow', kx: 0, ky: 0, power: 0.2, chain: true }); }); });
      }
    }
  };
  // 매의 눈: 시위도 빨리
  const der0 = G.st.derive;
  G.st.derive = function (s) { const d = der0.apply(this, arguments); const p = G.world && G.world.player; if (p && p.hawkT > 0) d.draw *= 0.5; return d; };

  /* ═════════ 재능: 갈래마다 세 칸 더 ═════════ */
  const SK = D.SKILLS, ROW_REQ = [null, { lv: 1 }, { lv: 6 }, { lv: 12 }, { lv: 18 }, { lv: 26 }, { lv: 36 }];
  const T = (tree, row, id, name, cost, desc, o) => { const k = Object.assign({ id, tree, row, name, cost, desc, grade: [1, 1, 2, 3, 3, 4, 5][row] }, o || {}); k.req = Object.assign({}, ROW_REQ[row], o && o.need || {}); return k; };
  const add = (after, k) => { const i = SK.findIndex((x) => x.id === after); SK.splice(i + 1, 0, k); };
  add('sw_lunge', T('검술', 2, 'sw_thrust', '찌르기 달인', 2, '셋째 베기(찌르기) 피해 +40%. 레이피어와 잘 맞는다.'));
  add('sw_wave', T('검술', 4, 'sw_rend', '가르기', 3, '베인 적은 2.5초 동안 피를 흘린다(조금씩 다친다).', { need: { str: 10 } }));
  add('sw_execute', T('검술', 5, 'sw_guard', '철벽 자세', 4, '방패로 막아 낸 순간 필살 게이지 +15, 다음 베기 치명타.', { gate: 'sw5', need: { str: 16, vit: 6 } }));
  add('bw_quiver', T('궁술', 2, 'bw_step', '뒷걸음 사격', 2, '구른 직후 0.5초 안에 쏜 화살은 다 모은 화살이 된다.'));
  add('bw_snipe', T('궁술', 4, 'bw_mark', '표식', 3, '모은 화살에 맞은 적은 5초 동안 모든 피해를 25% 더 받는다.', { need: { dex: 10 } }));
  add('bw_heavy', T('궁술', 5, 'bw_storm', '화살 폭풍', 4, '화살이 네 번 맞을 때마다 그 자리에 작은 화살비가 내린다.', { gate: 'bw5', need: { dex: 16 } }));
  add('mg_quick', T('마법', 2, 'mg_focus', '집중', 2, '마도구(지팡이 · 수정구 · 마도서)의 효과가 1.5배.'));
  add('mg_deep', T('마법', 4, 'mg_chain', '연쇄', 3, '번개가 한 번 더 옮고, 얼음이 적 하나를 더 꿰뚫는다.', { need: { int: 10 } }));
  add('mg_siphon', T('마법', 5, 'mg_blood', '피의 영창', 4, 'MP가 모자라면 체력으로 건다 (MP 10 = 하트 ¼칸).', { gate: 'mg5', need: { int: 16 } }));

  /* ═════════ 가게 · 상자에 놓기 ═════════ */
  const SHOP = D.SHOPS, put = (id, list) => { if (SHOP[id]) for (const k of list) if (!SHOP[id].items.includes(k)) SHOP[id].items.push(k); };
  put('green', ['fc_twig']);
  put('red', ['sw_axe', 'fc_ember', 'art_moonslash']);
  put('blue', ['sw_rapier', 'fc_coral', 'tome_poison']);
  put('yellow', ['art_bombarrow', 'tome_blink']);
  put('purple', ['fc_orb', 'art_nova', 'tome_barrier', 'bw_venom']);
  put('rainbow', ['art_hawk']);
  put('white', ['sw_frost']);
  put('gray', ['bw_cross', 'bw_thunder', 'fc_storm', 'art_quakeblade']);
  put('black', ['sw_twin', 'bw_moon', 'fc_moon', 'tome_gravity']);
  put('colorful', ['art_blackhole']);
  // 영웅 · 전설: 던전 깊은 곳 · 숨은 곳 · 다시 도전 보상 (world/40_trials.js · 41_secrets.js)
  G.arsenal = { TOP: { sword: ['sw_blood', 'sw_sky'], bow: ['bw_seeker', 'bw_heaven'], focus: ['fc_star', 'fc_origin'], spell: ['tome_blizzard'], art: ['art_thousand', 'art_galaxy', 'art_genesis'] } };

  /* ═════════ 아이콘 ═════════ */
  const H = G.hud, ic0 = H.icon, X = G.gfx, ICO = {};
  H.icon = function (id) {
    if (ICO[id]) return ICO[id];
    const rows = {
      poison: [['    gg      ', '  gggggg    ', ' ggGGgggg   ', 'gggggGGggg  ', ' gGgggggg   ', '  gggGgg    ', '   gggg     '], { g: '#6ab84a', G: '#b8f08a' }],
      barrier: [['   yyyyyy   ', '  y      y  ', ' y  wwww  y ', ' y w    w y ', ' y w    w y ', ' y  wwww  y ', '  y      y  ', '   yyyyyy   '], { y: '#ffe066', w: '#fff8d8' }],
      blink: [['  p     p   ', '   p   p    ', '    ppp     ', '  ppWWWpp   ', '    ppp     ', '   p   p    ', '  p     p   '], { p: '#a88aff', W: '#ffffff' }],
      gravity: [['   pppp     ', '  p kk p    ', ' p kkkk p   ', ' p kkkk p   ', '  p kk p    ', '   pppp     '], { p: '#c49bff', k: '#1a0a2a' }],
      blizzard: [['  w   w  w  ', '    b    w  ', ' w  bWb     ', '   bWWWb w  ', ' w  bWb     ', '    b   w   ', '  w    w    '], { w: '#ffffff', b: '#8ad8ff', W: '#e8f8ff' }],
      focus: [['        yy  ', '       yWWy ', '       yWWy ', '      l yy  ', '     l      ', '    l       ', '   l        ', '  l         ', ' l          '], { l: '#8a5a30', y: '#c49bff', W: '#f0e8ff' }],
    }[id];
    if (!rows) return ic0(id);
    const b = X.brush(12, 12); b.stamp(0, 0, rows[0], rows[1]);
    ICO[id] = X.outline(b.put(), '#0b0914');
    return ICO[id];
  };
})();
