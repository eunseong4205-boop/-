/* 재능 · 장비 넓히기 — 고민되는 갈림길
   · 갈래 여섯: 검술 · 궁술 · 마법 · 생존 + 새 갈래 「전환」(무기를 섞어 싸우기 — 또는 한 우물) · 「도구」(폭탄 · 갈고리 · 등불 · 거울)
   · 줄마다 거의 둘 중 하나(택1), 일곱째 줄(Lv 44)은 갈래마다 궁극 둘 중 하나. 무기 갈래의 2~4줄에는 스킬(L 버튼)을 여는 칸
   · 모든 칸의 값을 더하면 Lv 50의 성장 점수(약 150)를 훨씬 넘는다 — 다 배울 수 없다
   · 장비: 무기 바꾸기 · 스킬 재사용 · 갈래별 스킬 피해를 다루는 새 장비 스물셋, 등급마다 세기를 맞춰 가게와 숨은 곳에 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, C = G.combat, E = G.ent, P = G.prog;
  const W = () => G.world, S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const sk = (id) => !!(S().skills && S().skills[id]);
  const SK = D.SKILLS;
  const ROW_REQ = [null, { lv: 1 }, { lv: 6 }, { lv: 12 }, { lv: 18 }, { lv: 26 }, { lv: 36 }, { lv: 44 }];
  const T = (tree, row, id, name, cost, desc, o) => { const k = Object.assign({ id, tree, row, name, cost, desc, grade: [1, 1, 2, 3, 3, 4, 5, 5][row] }, o || {}); k.req = Object.assign({}, ROW_REQ[row], (o && o.need) || {}); delete k.need; return k; };
  const gate = (id, g) => { const k = SK.find((x) => x.id === id); if (k) k.gate = g; };

  /* ───────── 무기 갈래: 갈림길 · 스킬 칸 · 궁극 ───────── */
  // 검술
  gate('sw_combo', 'sw1'); gate('sw_master', 'sw6');
  SK.push(
    T('검술', 1, 'sw_grip', '굳은 손', 2, '검 피해 +10%. 막는 적을 베면 조금 더 밀려난다.', { gate: 'sw1' }),
    T('검술', 2, 'as_break', '스킬: 방패 깨기', 2, '스킬 「방패 깨기」를 익힌다 — 막는 적도 뚫는 내리찍기.', { act: 'a_break' }),
    T('검술', 3, 'as_cyclone', '스킬: 회오리 칼날', 3, '스킬 「회오리 칼날」 — 모으지 않고 바로 넓게 한 바퀴.', { act: 'a_cyclone', gate: 'swa3', need: { str: 6 } }),
    T('검술', 3, 'as_parry', '스킬: 반격 자세', 3, '스킬 「반격 자세」 — 맞는 순간 막고 크게 되받아친다.', { act: 'a_parry', gate: 'swa3', need: { str: 6 } }),
    T('검술', 4, 'as_wave', '스킬: 대지 가르기', 3, '스킬 「대지 가르기」 — 앞으로 나아가는 충격파.', { act: 'a_wave', need: { str: 10 } }),
    T('검술', 6, 'sw_reaper', '사신', 5, '검으로 준 피해의 3%만큼 체력이 돌아온다. 쓰러뜨린 적 둘레가 잠깐 겁에 질린다(비틀).', { gate: 'sw6', need: { str: 24 } }),
    T('검술', 7, 'sw_god', '검신', 5, '검 스킬 피해 +40%, 검 스킬 재사용 대기 -35%.', { gate: 'sw7', need: { str: 30 } }),
    T('검술', 7, 'sw_gale', '칼바람', 5, '검으로 벨 때마다 12% 확률로 검기가 그 적을 향해 날아간다.', { gate: 'sw7', need: { str: 30 } }),
  );
  // 궁술
  gate('bw_fast', 'bw1'); gate('bw_master', 'bw6');
  SK.push(
    T('궁술', 1, 'bw_light', '가벼운 화살', 2, '화살이 40% 빠르고 30% 멀리 간다.', { gate: 'bw1' }),
    T('궁술', 2, 'as_leap', '스킬: 물러나 쏘기', 2, '스킬 「물러나 쏘기」 — 뒤로 뛰며 다 모은 화살.', { act: 'a_leap' }),
    T('궁술', 3, 'as_snare', '스킬: 덫 화살', 3, '스킬 「덫 화살」 — 맞은 자리 둘레의 적을 묶는다.', { act: 'a_snare', gate: 'bwa3', need: { dex: 6 } }),
    T('궁술', 3, 'as_rain', '스킬: 작은 화살비', 3, '스킬 「작은 화살비」 — 앞쪽에 1.5초 동안 쏟아진다.', { act: 'a_rain', gate: 'bwa3', need: { dex: 6 } }),
    T('궁술', 4, 'as_pierce', '스킬: 관통 일격', 3, '스킬 「관통 일격」 — 모으지 않고 바로 거대한 관통 화살.', { act: 'a_pierce', need: { dex: 10 } }),
    T('궁술', 6, 'bw_hunter', '사냥꾼', 5, '정예 · 보스에게 화살 피해 +35%.', { gate: 'bw6', need: { dex: 24 } }),
    T('궁술', 7, 'bw_god', '궁신', 5, '활 스킬이 화살을 쓰지 않고, 재사용 대기 -35%.', { gate: 'bw7', need: { dex: 30 } }),
    T('궁술', 7, 'bw_swarm', '화살 떼', 5, '모은 화살이 적에게 맞으면 작은 화살 셋으로 갈라진다.', { gate: 'bw7', need: { dex: 30 } }),
  );
  // 마법
  gate('mg_pool', 'mg1'); gate('mg_master', 'mg6');
  SK.push(
    T('마법', 1, 'mg_spark', '불꽃 손끝', 2, '모든 MP 소모 -20%.', { gate: 'mg1' }),
    T('마법', 2, 'as_drain', '스킬: 흡수의 고리', 2, '스킬 「흡수의 고리」 — 둘레 적에게서 하트를 빨아들인다.', { act: 'a_drain' }),
    T('마법', 3, 'as_ward', '스킬: 마나 방패', 3, '스킬 「마나 방패」 — 6초 동안 피해를 MP로 받는다.', { act: 'a_ward', gate: 'mga3', need: { int: 6 } }),
    T('마법', 3, 'as_slow', '스킬: 시간 늦추기', 3, '스킬 「시간 늦추기」 — 둘레 적을 4초 동안 절반 빠르기로.', { act: 'a_slow', gate: 'mga3', need: { int: 6 } }),
    T('마법', 4, 'as_twin', '스킬: 쌍둥이 주문', 3, '스킬 「쌍둥이 주문」 — 고른 주문을 연달아 두 번.', { act: 'a_twin', need: { int: 10 } }),
    T('마법', 6, 'mg_arcane', '비전', 5, '마법 스킬 MP -40%, 마법 스킬 피해 +30%.', { gate: 'mg6', need: { int: 24 } }),
    T('마법', 7, 'mg_god', '현자', 5, '주문 피해 +20%. 주문이 맞을 때 15% 확률로 MP 4가 돌아온다.', { gate: 'mg7', need: { int: 30 } }),
    T('마법', 7, 'mg_rift', '균열', 5, '마법으로 쓰러뜨린 적의 자리에 0.5초 뒤 작은 폭발이 인다.', { gate: 'mg7', need: { int: 30 } }),
  );
  // 생존
  gate('sv_stam', 'sv1'); gate('sv_master', 'sv6');
  SK.push(
    T('생존', 1, 'sv_thick', '두꺼운 피부', 2, '받는 피해 -6%.', { gate: 'sv1' }),
    T('생존', 6, 'sv_last', '배수진', 5, '체력이 ¼ 이하일 때 모든 피해 +30%, 구르기 기력 절반.', { gate: 'sv6', need: { vit: 20 } }),
    T('생존', 7, 'sv_god', '불사신', 5, '하트 2칸이 는다.', { gate: 'sv7', need: { vit: 26 } }),
    T('생존', 7, 'sv_rest', '회복의 숨', 5, '4초 동안 다치지 않고 싸우지 않으면 1.5초마다 하트 ¼칸.', { gate: 'sv7', need: { vit: 26 } }),
  );
  // 전환 (새 갈래)
  SK.push(
    T('전환', 1, 'tr_quick', '빠른 손', 2, '무기를 바꾸는 틈 0.22초 → 0.08초.'),
    T('전환', 2, 'tr_open', '첫 수', 2, '바꾼 뒤 2초 안의 첫 공격 피해 +35%.', { gate: 'tr2' }),
    T('전환', 2, 'tr_flow', '흐름', 2, '바꿀 때 기력 10 · MP 4가 찬다 (1.5초마다).', { gate: 'tr2' }),
    T('전환', 3, 'tr_mark', '연계 표식', 3, '한 적을 다른 무기로 3초 안에 이어 치면 피해 +30%, 잠깐 비틀거린다.', { gate: 'tr3', need: { dex: 4, str: 4 } }),
    T('전환', 3, 'tr_guard', '바꿔 막기', 3, '바꾸는 순간 0.3초 무적 (3초마다).', { gate: 'tr3', need: { sta: 6 } }),
    T('전환', 4, 'tr_trinity', '삼위일체', 3, '6초 안에 검 · 활 · 마법으로 모두 맞히면 8초 동안 모든 피해 +25%.', { gate: 'tr4', need: { int: 6 } }),
    T('전환', 4, 'tr_focus', '한 우물', 3, '같은 무기만 10초 넘게 쓰면 그 무기 피해 +25% — 바꾸지 않는 길.', { gate: 'tr4' }),
    T('전환', 5, 'tr_charge', '전환 충전', 4, '바꿀 때마다 필살 게이지 +4 (1초마다).', { gate: 'tr5' }),
    T('전환', 5, 'tr_cool', '재정비', 4, '바꿔 든 무기의 스킬 재사용 대기가 30% 줄어든다.', { gate: 'tr5' }),
    T('전환', 6, 'tr_master', '만능', 5, '최근 8초에 쓴 무기 가짓수마다 피해 +12% (최대 +36%).', { gate: 'tr6', need: { str: 10, dex: 10, int: 10 } }),
    T('전환', 6, 'tr_echo', '잔향', 5, '바꾸는 순간 앞 무기가 한 번 더 — 검은 검기, 활은 화살, 마법은 주문(MP 없이).', { gate: 'tr6', need: { str: 8, dex: 8, int: 8 } }),
    T('전환', 7, 'tr_god', '무기의 춤', 5, '바꾸는 틈이 없어지고, 바꿀 때마다 둘레에 작은 충격파.', { gate: 'tr7' }),
    T('전환', 7, 'tr_one', '한 손의 길', 5, '무기 바꾸기를 봉인한다. 대신 든 무기 피해 +40%, 스킬 재사용 대기 -25%.', { gate: 'tr7' }),
  );
  // 도구 (새 갈래)
  SK.push(
    T('도구', 1, 'tl_pouch', '큰 주머니', 2, '폭탄 · 화살을 10개씩 더 가지고 다닌다.', { onLearn: (s) => { s.ammo.arrowsMax += 10; s.ammo.bombsMax += 10; } }),
    T('도구', 2, 'tl_blast', '큰 폭발', 2, '폭탄 범위 +40%, 피해 +40%.', { gate: 'tl2' }),
    T('도구', 2, 'tl_quick', '짧은 심지', 2, '폭탄이 0.9초 만에 터진다.', { gate: 'tl2' }),
    T('도구', 3, 'tl_stun', '갈고리 강타', 3, '갈고리가 지나가며 닿은 적을 1.5초 기절시킨다.', { gate: 'tl3' }),
    T('도구', 3, 'tl_reach', '긴 사슬', 3, '갈고리가 50% 더 멀리 닿는다.', { gate: 'tl3' }),
    T('도구', 4, 'tl_lamp', '정화의 등불', 3, '등불을 켜 두면 둘레의 망령 · 그림자 · 해골이 천천히 다친다.', { gate: 'tl4' }),
    T('도구', 4, 'tl_mirror', '되비추기', 3, '거울을 쓰면 2초 동안 날아오는 것을 되받아친다.', { gate: 'tl4' }),
    T('도구', 5, 'tl_salvage', '주워 담기', 4, '적이 화살 · 폭탄을 더 자주 떨어뜨린다.', { gate: 'tl5' }),
    T('도구', 5, 'tl_craft', '즉석 제작', 4, '20초마다 폭탄 하나 · 화살 셋이 저절로 생긴다.', { gate: 'tl5' }),
    T('도구', 6, 'tl_master', '도구 장인', 5, '폭탄을 놓을 때 30% 확률로 줄지 않는다. 폭탄 피해 +30%.'),
    T('도구', 7, 'tl_bomber', '폭탄 비', 5, '폭탄을 놓으면 둘레에 작은 폭탄 둘이 더 떨어진다.', { gate: 'tl7' }),
    T('도구', 7, 'tl_engineer', '기술자', 5, '도구를 쓸 때마다 든 무기의 스킬 재사용 대기 -2초.', { gate: 'tl7' }),
  );
  // 갈래 순서: 같은 갈래 · 같은 줄끼리 붙여 둔다 (화면이 줄 단위로 읽는다)
  const TREES = ['검술', '궁술', '마법', '전환', '생존', '도구'];
  SK.sort((a, b) => TREES.indexOf(a.tree) - TREES.indexOf(b.tree) || a.row - b.row);
  D.TREES = TREES;
  // 망각의 차: 재능으로 배운 스킬도 함께 잊는다
  const ref0 = P.refund;
  P.refund = function (s) {
    const had = Object.keys(s.skills || {});
    if (had.includes('tl_pouch')) { s.ammo.arrowsMax = Math.max(30, s.ammo.arrowsMax - 10); s.ammo.bombsMax = Math.max(10, s.ammo.bombsMax - 10); s.ammo.arrows = Math.min(s.ammo.arrows, s.ammo.arrowsMax); s.ammo.bombs = Math.min(s.ammo.bombs, s.ammo.bombsMax); }
    const back = ref0.apply(this, arguments);
    for (const id of had) { const k = SK.find((x) => x.id === id); if (k && k.act && s.askills) { delete s.askills[k.act]; for (const t of [s.wskill, s.wskill2]) for (const w in t || {}) if (t[w] === k.act) delete t[w]; } }
    return back;
  };

  /* ───────── 효과 ───────── */
  // 능력치 (받는 피해 · 하트 · MP 소모 · 구르기)
  const der0 = G.st.derive;
  G.st.derive = function (s) {
    const d = der0.apply(this, arguments);
    const has = (id) => !!(s.skills && s.skills[id]);
    if (has('sv_thick')) d.def *= 0.94;
    if (has('sv_god')) d.hpMax += 8;
    if (has('mg_spark')) d.mpCost *= 0.8;
    if (has('sv_last') && s.hp <= d.hpMax / 4) d.rollCost *= 0.5;
    return d;
  };
  // 피해 (무기 바꾸기 피해 조정 뒤에 겹친다)
  const mod0 = C.dmgMod;
  const SRCW = { sword: 'sword', spin: 'sword', dash: 'sword', beam: 'sword', arrow: 'bow', spell: 'magic' };
  C.dmgMod = function (e, info, amt) {
    let k = mod0 ? mod0.apply(this, arguments) : 1;
    if (k === 0) return 0;
    const s = S(), p = W().player, w = info.w || SRCW[info.src] || null;
    const d = G.st.derive(s);
    if (w === 'sword') {
      if (sk('sw_grip')) k *= 1.1;
      if (sk('sw_god') && info.skill) k *= 1.4;
      if (sk('sw_reaper') && amt) { s.hp = Math.min(d.hpMax, s.hp + amt * k * 0.03); }
      if (sk('sw_gale') && !info.skill && !info.storm && info.src === 'sword' && p && Math.random() < 0.12) {
        const a = U.angle(e.x - p.x, e.y - p.y);
        C.shoot({ kind: 'beam', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, dmg: d.atk * 0.8, src: 'beam', storm: true, r: 4, life: 0.5, pierce: 1, trail: '#fff8c0', owner: 'player' });
      }
    }
    if (w === 'bow' && sk('bw_hunter') && (e.elite || e.boss)) k *= 1.35;
    if (w === 'magic') {
      if (sk('mg_arcane') && info.skill) k *= 1.3;
      if (sk('mg_god')) { k *= 1.2; if (Math.random() < 0.15) s.mp = Math.min(d.mpMax, s.mp + 4); }
    }
    if (sk('sv_last') && s.hp <= d.hpMax / 4) k *= 1.3;
    if (sk('tr_one') && w) k *= 1.4;
    if (info.src === 'bomb' && sk('tl_master')) k *= 1.3;
    if (info.src === 'bomb' && sk('tl_blast')) k *= 1.4;
    return k;
  };
  // 스킬: 재사용 대기 · 비용
  const SN = G.stance;
  SN.cdK = function (s, w) {
    let k = 1;
    if (w === 'sword' && sk('sw_god')) k *= 0.65;
    if (w === 'bow' && sk('bw_god')) k *= 0.65;
    if (sk('tr_one')) k *= 0.75;
    return k;
  };
  SN.costK = function (s, w, kind) {
    if (kind === 'ar' && sk('bw_god')) return 0;
    if (kind === 'mp' && w === 'magic' && sk('mg_arcane')) return 0.6;
    return 1;
  };
  SN.swapBlocked = () => sk('tr_one');
  SN.swapTimeK = () => (sk('tr_god') ? 0.1 : 1);
  SN.onSwap = function (p, s, from, to) {
    const d = G.st.derive(s);
    if (sk('tr_god')) { for (const e of C.foes()) if (U.dist(p.x, p.y, e.x, e.y) < 44) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, Math.max(d.atk, d.bowAtk) * 0.6, { src: 'special', w: to, kx: nx, ky: ny, power: 1.2 }); } G.fx.ring(p.x, p.y - 6, '#ffffff', 44, 0.3, 2); }
    if (sk('tr_echo')) {
      const a = U.angle(p.face[0], p.face[1]);
      if (from === 'sword') C.shoot({ kind: 'beam', x: p.x + Math.cos(a) * 10, y: p.y - 2 + Math.sin(a) * 8, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, dmg: d.atk * 0.9, src: 'beam', r: 4, life: 0.45, pierce: 1, trail: '#ffd8a8', owner: 'player' });
      else if (from === 'bow' && s.tools.bow) C.shoot({ kind: 'arrow', x: p.x + Math.cos(a) * 8, y: p.y - 2 + Math.sin(a) * 6, ox: p.x, oy: p.y, vx: Math.cos(a) * 320, vy: Math.sin(a) * 320, dmg: d.bowAtk * 1.2, src: 'arrow', charged: true, r: 3, life: 0.8, owner: 'player', trail: '#e8f0c0' });
      else if (from === 'magic' && s.spell && C.castSpell) C.castSpell(p, s.spell, d);
    }
  };
  // 화살: 가벼운 화살 · 화살 떼 (모든 화살이 거치는 쏘기 갈고리)
  const shoot0 = C.shoot, pre0 = C.onShoot;
  C.onShoot = function (o) {
    if (pre0) o = pre0(o) || o;
    if (o && o.owner !== 'foe' && o.kind === 'arrow' && !o.split) {
      if (sk('bw_light')) { o.vx *= 1.4; o.vy *= 1.4; o.life = (o.life || 1) * 1.3; }
      if (sk('bw_swarm') && o.charged) {
        const prev = o.onHitFoe;
        o.onHitFoe = function (e) {
          if (prev) prev.call(this, e);
          if (this.swarmed) return; this.swarmed = true;
          const a0 = U.angle(this.vx, this.vy);
          for (const off of [-0.7, 0, 0.7]) shoot0({ kind: 'arrow', split: true, x: e.x, y: e.y - 6, vx: Math.cos(a0 + off) * 260, vy: Math.sin(a0 + off) * 260, dmg: this.dmg * 0.35, src: 'arrow', r: 2, life: 0.35, owner: 'player', hit: new Set([e]) });
        };
      }
    }
    return o;
  };
  // 도구
  C.bombFuse = () => (sk('tl_quick') ? 0.9 : 1.6);
  C.bombPower = () => (sk('tl_blast') ? 1.4 : 1);
  C.hookMul = () => (sk('tl_reach') ? 1.5 : 1);
  C.freeTool = (k) => k === 'bomb' && sk('tl_master') && Math.random() < 0.3;
  C.toolUsed = function (k, p, obj) {
    const s = S();
    if (sk('tl_engineer') && SN) for (const id of SN.equippedAll(s, SN.cur(s))) if (SN.ST.cd[id] > 0) SN.ST.cd[id] = Math.max(0, SN.ST.cd[id] - 2);
    if (k === 'bomb' && sk('tl_bomber') && obj) for (const [dx, dy] of [[-18, 6], [18, 6]]) C.after(0.15, () => { const b = new obj.constructor({ x: obj.x + dx, y: obj.y + dy, fuse: (obj.fuse || 1.6) + 0.2, power: (obj.power || 1) * 0.6 }); W().add(b); });
    if (k === 'mirror' && sk('tl_mirror') && p) { p.reflectT = 2; G.fx.ring(p.x, p.y - 8, '#d8b0ff', 20, 0.4, 2); }
  };
  C.extraDrop = function (e) {
    if (!sk('tl_salvage')) return;
    const s = S(), r = Math.random();
    if (r < 0.25 && s.tools.bow) C.spawnPickup(e.x, e.y, 'arrow', 3); else if (r < 0.37 && s.tools.bomb) C.spawnPickup(e.x, e.y, 'bomb', 1);
  };
  // 마법으로 쓰러뜨린 자리의 균열 (쓰러질 때 마지막으로 맞은 무기를 본다)
  const onKill = ((e) => { if (sk('mg_rift') && e.lastW === 'magic') { const x = e.x, y = e.y; C.after(0.5, () => C.explode(x, y - 4, 'player', 0.7)); } if (sk('sw_reaper') && e.lastW === 'sword') for (const o of C.foes()) if (o !== e && U.dist(o.x, o.y, e.x, e.y) < 48 && !o.boss) o.stunT = Math.max(o.stunT || 0, 0.5); });
  let hooked = false;   // 이야기(world)는 나중에 실리니 첫 프레임에 건다
  // 매 프레임: 즉석 제작 · 회복의 숨 · 정화의 등불 · 갈고리 강타 · 되비추기
  let craftT = 0, restT = 0, lastHp = null, calmT = 0, lampT = 0;
  const up0 = C.update;
  C.update = function (dt) {
    const r = up0.apply(this, arguments);
    if (!hooked && G.story && G.story.killHooks) { hooked = true; G.story.killHooks.push(onKill); }
    const p = W().player, s = S(); if (!p || !s || !s.skills) return r;
    if (sk('tl_craft')) { craftT += dt; if (craftT > 20) { craftT = 0; if (s.tools.bomb) s.ammo.bombs = Math.min(s.ammo.bombsMax, s.ammo.bombs + 1); if (s.tools.bow) s.ammo.arrows = Math.min(s.ammo.arrowsMax, s.ammo.arrows + 3); } }
    if (lastHp != null && s.hp < lastHp) calmT = 0; lastHp = s.hp;
    const fighting = C.foes().some((e) => !e.dead && e.aggro && U.dist(e.x, e.y, p.x, p.y) < 160);
    if (fighting) calmT = Math.min(calmT, 0); calmT += dt;
    if (sk('sv_rest') && calmT > 4) { restT += dt; if (restT > 1.5) { restT = 0; const d = G.st.derive(s); if (s.hp < d.hpMax) { s.hp = Math.min(d.hpMax, s.hp + 1); lastHp = s.hp; } } }
    if (sk('tl_lamp') && p.lantern) { lampT += dt; if (lampT > 0.5) { lampT = 0; for (const e of C.foes()) if ((e.undead || e.dark || e.ghost || /ghost|shade|skel|wraith|hollow/.test(e.type || '')) && U.dist(e.x, e.y, p.x, p.y) < 64) C.damage(e, 1 + s.lv * 0.05, { src: 'lamp', el: 'light', kx: 0, ky: 0, power: 0 }); } }
    if (sk('tl_stun') && p.hook) { const h = p.hook, hx = h.x + Math.cos(h.a) * h.d, hy = h.y + Math.sin(h.a) * h.d; h.stunned = h.stunned || new Set(); for (const e of C.foes()) if (!h.stunned.has(e) && U.dist(hx, hy, e.x, e.y - 8) < 12) { h.stunned.add(e); e.stunT = Math.max(e.stunT || 0, e.boss ? 0.4 : 1.5); G.fx.sparks(e.x, e.y - 8, 6, '#ffe066', 60); } }
    if (p.reflectT > 0) {
      p.reflectT -= dt;
      for (const e of W().ents) if (e instanceof C.Shot && e.owner !== 'player' && !e.dead && U.dist(e.x, e.y, p.x, p.y - 8) < 26) { e.owner = 'player'; e.vx = -e.vx; e.vy = -e.vy; e.reflected = true; e.hit = new Set(); G.fx.ring(e.x, e.y, '#d8b0ff', 8, 0.2, 1); sfx('clank'); }
    }
    return r;
  };

  /* ───────── 새 장비 ───────── */
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id, price: 0, desc: '' }, o); D.ITEMS[id].id = id; return D.ITEMS[id]; };
  // 검 (무기에 붙은 fx는 무기 바꾸기 · 스킬에만 쓰인다)
  item('sw_wind', { type: 'sword', grade: 2, name: '바람 단검', atk: 3, reach: 17, speed: 0.6, crit: 0.06, col: '#d8f0e8', price: 1900, req: { dex: 4 }, desc: '아주 짧고 아주 빠르다. 치명타 +6%. 활 · 마법과 번갈아 쓰기 좋다.' });
  item('sw_switch', { type: 'sword', grade: 3, name: '전환검 「쌍두」', atk: 8, reach: 22, col: '#e8c8ff', fx: { swapHit: 0.4 }, price: 12800, req: { str: 8, dex: 6 }, desc: '머리가 둘 달린 검. 다른 무기에서 바꿔 든 직후 첫 베기 +40%.' });
  item('sw_guard2', { type: 'sword', grade: 3, name: '수호자의 장검', atk: 9, reach: 25, col: '#c8d8e8', fx: { cd_sword: 0.2 }, price: 13500, req: { str: 10, vit: 4 }, desc: '설원 수도원 기사들의 검. 검 스킬 재사용 대기 -20%.' });
  item('sw_titan', { type: 'sword', grade: 4, name: '거인 망치검', atk: 15, reach: 26, speed: 1.45, heavy: 2.0, col: '#a8a098', fx: { skill_sword: 0.25 }, price: 31000, req: { str: 18 }, desc: '느리고 무겁다. 넉백 두 배, 검 스킬 피해 +25%.' });
  item('sw_prism', { type: 'sword', grade: 5, name: '프리즘 「무지개 칼날」', atk: 18, reach: 27, el: 'light', col: '#fff4ff', glow: '#ffd8ff', fx: { swapHit: 0.5, tri: 0.15 }, req: { str: 18, dex: 10, int: 10, lv: 38 }, desc: '빛을 일곱으로 가르는 칼날. 바꿔 든 직후 첫 베기 +50%, 삼위일체 중 피해 +15%.' });
  // 활
  item('bw_hunter2', { type: 'bow', grade: 2, name: '사냥꾼의 활', atk: 4.5, draw: 0.5, fx: { skill_bow: 0.15 }, price: 2400, req: { dex: 5 }, desc: '숲지기들이 쓰는 활. 활 스킬 피해 +15%.' });
  item('bw_twin2', { type: 'bow', grade: 3, name: '쌍시위 활', atk: 6, draw: 0.55, multi: 2, price: 12000, req: { dex: 10 }, desc: '시위가 둘. 모은 화살이 두 갈래로 나간다.' });
  item('bw_echo', { type: 'bow', grade: 4, name: '메아리 활', atk: 10, draw: 0.4, col: '#c8e8ff', fx: { cd_bow: 0.3 }, price: 30000, req: { dex: 16 }, desc: '메아리 협곡의 단풍나무로 깎았다. 활 스킬 재사용 대기 -30%.' });
  item('bw_sun', { type: 'bow', grade: 5, name: '태양궁 「정오」', atk: 14, draw: 0.32, el: 'fire', pierce: 2, col: '#ffd86a', glow: '#fff0a8', fx: { dmg_bow: 0.15, swapHit: 0.3 }, req: { dex: 26, lv: 38 }, desc: '그림자를 남기지 않는 활. 불화살이 꿰뚫고, 활 피해 +15%, 바꿔 든 첫 화살 +30%.' });
  // 마도구
  item('fc_rune', { type: 'focus', grade: 2, name: '룬 막대', mag: 1.12, cost: 0.85, col: '#a8d8ff', fx: { cd_magic: 0.1 }, price: 2900, req: { int: 4 }, desc: '마법 ×1.12, MP -15%, 마법 스킬 재사용 대기 -10%.' });
  item('fc_tide', { type: 'focus', grade: 3, name: '조류 지팡이', mag: 1.22, elb: { ice: 1.3, bolt: 1.2 }, col: '#6ac8e8', fx: { skill_magic: 0.2 }, price: 13800, req: { int: 10 }, desc: '마법 ×1.22, 얼음 · 번개 강화, 마법 스킬 피해 +20%.' });
  item('fc_mirror2', { type: 'focus', grade: 4, name: '거울 수정', mag: 1.28, col: '#e8d8ff', fx: { cd: 0.2, int: 3 }, price: 33000, req: { int: 16 }, desc: '마법 ×1.28, 모든 스킬 재사용 대기 -20%, 지력 +3.' });
  item('fc_chaos', { type: 'focus', grade: 5, name: '혼돈의 홀', mag: 1.5, echo: 0.12, col: '#ff8ad8', glow: '#ffb8e8', fx: { dmg_magic: 0.1, swapSp: 4 }, req: { int: 24, lv: 38 }, desc: '마법 ×1.5, 12% 확률로 한 번 더, 마법 피해 +10%, 무기를 바꿀 때 필살 게이지 +4.' });
  // 옷
  item('ar_swift', { type: 'armor', grade: 2, name: '날랜 옷', def: 0.9, fx: { swap: 0.5, dex: 2 }, price: 2600, desc: '받는 피해 -10%, 무기 바꾸는 틈 절반, 솜씨 +2.' });
  item('ar_monk', { type: 'armor', grade: 3, name: '수도복', def: 0.86, fx: { sta: 6, stamina: 20 }, price: 10500, req: { sta: 6 }, desc: '받는 피해 -14%, 기력 +6 · 최대 기력 +20. 검 · 활 스킬을 더 자주.' });
  item('ar_plate', { type: 'armor', grade: 4, name: '판금 갑옷', def: 0.6, fx: { sta: -4, roll: -0.2 }, price: 34000, req: { vit: 16, str: 10 }, desc: '받는 피해 -40%. 무거워서 기력 -4, 구르기 기력 +20%.' });
  item('ar_tri', { type: 'armor', grade: 4, name: '삼색 망토', def: 0.8, fx: { tri: 0.2, swapHit: 0.2 }, price: 32000, req: { lv: 24 }, desc: '받는 피해 -20%. 삼위일체 중 피해 +20%, 바꿔 든 첫 공격 +20%.' });
  item('ar_dawn2', { type: 'armor', grade: 5, name: '새벽 갑주', def: 0.62, fx: { vit: 6, str: 4, cd: 0.1 }, req: { vit: 20, lv: 40 }, desc: '받는 피해 -38%, 체력 +6 · 힘 +4, 스킬 재사용 대기 -10%.' });
  // 장신구
  item('ac_swap', { type: 'acc', grade: 2, name: '전환의 반지', fx: { swapHit: 0.25 }, price: 2600, desc: '바꿔 든 직후 첫 공격 +25%.' });
  item('ac_clock', { type: 'acc', grade: 3, name: '시계 톱니', fx: { cd: 0.2 }, price: 9800, req: { lv: 12 }, desc: '모든 스킬 재사용 대기 -20%.' });
  item('ac_blade', { type: 'acc', grade: 3, name: '검사 휘장', fx: { skill_sword: 0.3, str: 2 }, price: 9500, desc: '검 스킬 피해 +30%, 힘 +2.' });
  item('ac_hunter', { type: 'acc', grade: 3, name: '사냥꾼 부적', fx: { skill_bow: 0.3, dex: 2 }, price: 9500, desc: '활 스킬 피해 +30%, 솜씨 +2.' });
  item('ac_sage', { type: 'acc', grade: 3, name: '현자의 펜던트', fx: { skill_magic: 0.3, int: 2 }, price: 9500, desc: '마법 스킬 피해 +30%, 지력 +2.' });
  item('ac_tri', { type: 'acc', grade: 4, name: '삼원 목걸이', fx: { swapSp: 5, tri: 0.1 }, price: 29000, req: { lv: 22 }, desc: '무기를 바꿀 때 필살 게이지 +5 (1초마다), 삼위일체 중 피해 +10%.' });
  item('ac_chime', { type: 'acc', grade: 4, name: '풍경 귀걸이', fx: { cd: 0.15, mpRegen: 0.4 }, price: 31000, req: { lv: 24 }, desc: '스킬 재사용 대기 -15%, MP가 조금씩 찬다.' });
  item('ac_storm', { type: 'acc', grade: 5, name: '폭풍의 눈', fx: { dmg_sword: 0.1, dmg_bow: 0.1, dmg_magic: 0.1, cd: 0.1 }, req: { lv: 40 }, desc: '검 · 활 · 마법 피해 +10%, 스킬 재사용 대기 -10%.' });

  const SHOP_LATE = [];   // 98_balance가 마지막에 넣는다 (가게 목록이 이야기 쪽에서 다시 만들어지기도 한다)
  const put = (id, list) => { SHOP_LATE.push([id, list]); };
  put('red', ['sw_wind', 'bw_hunter2']);
  put('blue', ['ar_swift', 'fc_rune', 'ac_swap']);
  put('yellow', ['bw_twin2', 'ac_hunter']);
  put('purple', ['fc_tide', 'ac_sage', 'ac_clock']);
  put('rainbow', ['ac_blade', 'sw_switch']);
  put('white', ['ar_monk', 'sw_guard2']);
  put('gray', ['ar_plate', 'bw_echo', 'fc_mirror2']);
  put('black', ['ar_tri', 'ac_tri', 'sw_titan', 'ac_chime']);
  // 전설은 숨은 곳 · 고원 굴 · 다시 도전 보상으로
  if (G.arsenal && G.arsenal.TOP) { const T2 = G.arsenal.TOP; T2.sword.push('sw_prism'); T2.bow.push('bw_sun'); T2.focus.push('fc_chaos'); (T2.armor = T2.armor || []).push('ar_dawn2'); (T2.acc = T2.acc || []).push('ac_storm'); }
  G.talents = { LEGEND: ['sw_prism', 'bw_sun', 'fc_chaos', 'ar_dawn2', 'ac_storm'], placeLate() { for (const [id, list] of SHOP_LATE.splice(0)) { const sh = D.SHOPS[id]; if (sh) for (const k of list) if (!sh.items.includes(k)) sh.items.push(k); } } };
})();
