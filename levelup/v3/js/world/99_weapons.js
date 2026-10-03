/* 세 무기의 장단점 — 검 · 활 · 마법을 같은 잣대로 (진짜 키 입력으로 잰 초당 피해 · 자원 소모)
   예전: 같은 등급 장비 · 같은 투자에서 활 51~72%, 마법은 MP가 저절로 차지 않아 3~5초 쏟고 나면 끝.
     활은 화살 30개가 연사로 5초, 쓰러뜨려도 8% 확률로 5개 — 사실상 쓸 수 없었다.
   · 검  — 가장 세고 자원이 들지 않는다. 대신 붙어서 싸워야 한다(맞는다). 휘두르면 여럿을 함께 벤다.  (그대로)
   · 활  — 멀리서 안전하게, 멀수록 아프다(세 칸 밖부터 열두 칸까지 최대 +20%). 화살이 든다.
           피해 ×1.15(스킬 · 필살기 포함), 다 모은 화살 ×2 → ×2.5 · 한 적을 꿰뚫고 · 모으는 시간 -0.1초
           맞힌 화살은 적에 박혀 쓰러뜨리면 돌아온다(50% + 솜씨 1.2%마다, 최대 80%), 화살이 더 자주 떨어지고(솜씨만큼 많이),
           화살이 10개 밑이면 저절로 깎는다(솜씨가 높을수록 빨리), 가게에 화살 30개 묶음
   · 마법 — 여럿을 한꺼번에 · 얼리고 태우고 기절시킨다. MP가 든다.
           MP가 저절로 찬다: 초당 2.5 + 지력 × 0.25 (20 넘는 지력은 반), 1.5초 동안 MP를 쓰지 않으면 ×1.6
           주문 MP ×0.75 안팎, 기본 주문 피해 ×1.15 (스킬 · 필살기는 그대로 — 이미 같은 잣대로 맞춰 둠) */
(function () {
  'use strict';
  const G = globalThis.G;
  const D = G.data, C = G.combat, U = G.u, P = G.prog;
  const S = () => G.state, W = () => G.world;

  const K = {
    BOW: 1.15, CHARGE: 1.25, FAR: 0.2, FAR_FROM: 48, FAR_TO: 200, DRAW: 0.1,
    RET: 0.5, RET_DEX: 0.012, RET_MAX: 0.8,
    DROP: 0.18, DROP_LOW: 0.17, DROP_HELD: 0.1,
    FLOOR: 10, FLETCH: 4, FLETCH_DEX: 0.08, FLETCH_MIN: 1.5,
    MP_BASE: 2.5, MP_INT: 0.25, CALM_AT: 1.5, CALM: 1.6,
    SPELL: 1.15,
  };
  const WB = { lastSpend: -99, prevMp: null, fletchT: 0 };
  const now = () => (W() ? W().t : 0);
  const soft = P ? P.soft : (v, k) => v * k;
  const retRate = (dex) => Math.min(K.RET_MAX, K.RET + dex * K.RET_DEX);

  /* ── 주문 MP: 공격 주문 ×0.75, 돕는 주문 ×0.85 안팎 ── */
  const COST = { fire: 6, ice: 8, bolt: 12, wind: 7, poison: 8, quake: 17, gravity: 20, blizzard: 23, meteor: 30, heal: 17, light: 10, barrier: 15, blink: 10 };
  for (const [id, mp] of Object.entries(COST)) if (D.SPELLS[id]) D.SPELLS[id].mp = mp;

  /* ── 능력치 ── */
  const der0 = G.st.derive;
  G.st.derive = function (s) {
    const d = der0.apply(this, arguments);
    if (!s || !d.stats) return d;
    d.bowAtk *= K.BOW;
    d.draw = Math.max(0.12, d.draw - K.DRAW);
    const calm = now() - WB.lastSpend > K.CALM_AT;
    d.mpRegenNat = K.MP_BASE + soft(d.stats.int, K.MP_INT);
    d.mpCalm = calm;
    d.mpRegenGear = d.mpRegen || 0;
    d.mpRegen = d.mpRegenGear + d.mpRegenNat * (calm ? K.CALM : 1);
    d.arrowRet = retRate(d.stats.dex);
    d.fletch = Math.max(K.FLETCH_MIN, K.FLETCH - d.stats.dex * K.FLETCH_DEX);
    return d;
  };

  /* ── 활: 다 모은 화살 · 박히는 화살 ── */
  const shoot0 = C.onShoot;
  C.onShoot = function (o) {
    o = (shoot0 ? shoot0.apply(this, arguments) : null) || o;
    if (!o || o.owner === 'foe' || o.foe || o.proc || o.src !== 'arrow') return o;
    if (o.charged && !o.skill && !o.heavy) { o.dmg *= K.CHARGE; o.pierce = Math.max(o.pierce || 0, 1); }
    return o;
  };
  const mod0 = C.dmgMod;
  C.dmgMod = function (e, info, amt) {
    let k = mod0 ? mod0.apply(this, arguments) : 1;
    if (k === 0) return 0;
    if (info.src === 'arrow' && !info.proc) {
      if (info.travel) k *= 1 + K.FAR * U.clamp((info.travel - K.FAR_FROM) / (K.FAR_TO - K.FAR_FROM), 0, 1);
      // 맞힌 화살은 처음 맞힌 적에 박힌다 (쓰러뜨리면 돌아온다) — 한 화살은 한 번만, 스킬 화살 · 저절로 돌아오는 화살은 빼고
      const sh = info.shot;
      if (sh && sh.kind === 'arrow' && !sh.skill && sh.owner === 'player' && !sh.ret && !sh.stuckIn) { sh.stuckIn = true; e.arrowsIn = (e.arrowsIn || 0) + 1; }
    }
    if (info.src === 'spell' && !info.skill && !info.proc) k *= K.SPELL;
    return k;
  };
  const xd0 = C.extraDrop;
  C.extraDrop = function (e) {
    if (xd0) xd0.apply(this, arguments);
    const s = S(); if (!s || !s.tools.bow) return;
    const A = s.ammo, d = G.st.derive(s);
    // 박힌 화살 회수
    if (e.arrowsIn > 0) {
      const n = Math.floor(e.arrowsIn * d.arrowRet + Math.random());
      e.arrowsIn = 0;
      if (n > 0 && C.spawnPickup) { const pk = C.spawnPickup(e.x, e.y, 'arrow', n); if (pk) pk.life = 30; }
    }
    // 화살 더 자주 (화살통이 비어 갈수록 · 활을 든 동안)
    if (A.arrows < A.arrowsMax) {
      const held = G.stance && G.stance.cur && G.stance.cur(s) === 'bow';
      const ch = K.DROP + (A.arrows < A.arrowsMax / 3 ? K.DROP_LOW : 0) + (held ? K.DROP_HELD : 0);
      if (Math.random() < ch && C.spawnPickup) C.spawnPickup(e.x + 4, e.y + 2, 'arrow', 3 + Math.floor(d.stats.dex / 8));
    }
  };

  /* ── 화살 줍기: 멀리서 쏘는 무기라 더 넓게 끌어당기고(36px) 오래 남는다 ── */
  if (C.Pickup) {
    const pu0 = C.Pickup.prototype.update;
    C.Pickup.prototype.update = function (dt, Wd) {
      const p = Wd && Wd.player;
      if (this.what === 'arrow' && p && !p.dead && this.t > 0.35) {
        const dd = U.dist(this.x, this.y, p.x, p.y - 4);
        if (dd < 36 && dd >= 14) { const [nx, ny] = U.norm(p.x - this.x, p.y - 4 - this.y); const sp = 90 + (36 - dd) * 5; this.vx = nx * sp; this.vy = ny * sp; }
      }
      return pu0.apply(this, arguments);
    };
  }

  /* ── 매 프레임: MP를 쓴 때 · 화살 깎기 ── */
  const up0 = C.update;
  C.update = function (dt) {
    const r = up0 ? up0.apply(this, arguments) : undefined;
    const s = S(), p = W() && W().player;
    if (!s || !p) return r;
    if (WB.prevMp != null && s.mp < WB.prevMp - 0.05) WB.lastSpend = now();
    WB.prevMp = s.mp;
    if (s.tools.bow && s.ammo.arrows < Math.min(K.FLOOR, s.ammo.arrowsMax) && !(G.script && G.script.running) && dt > 0) {
      WB.fletchT += dt;
      const every = G.st.derive(s).fletch;
      if (WB.fletchT >= every) { WB.fletchT = 0; s.ammo.arrows++; }
    } else WB.fletchT = 0;
    return r;
  };

  /* ── 가게: 화살 30개 묶음 (10개짜리를 파는 곳마다) ── */
  D.ITEMS.arrows30 = { id: 'arrows30', type: 'ammo', name: '화살 30개', ammo: 'arrows', n: 30, price: 110, desc: '화살 30개 묶음. 열 개씩 사는 것보다 조금 싸다.' };
  for (const sh of Object.values(D.SHOPS)) { const i = sh.items.indexOf('arrows10'); if (i >= 0 && !sh.items.includes('arrows30')) sh.items.splice(i + 1, 0, 'arrows30'); }

  /* ── 안내 글 ── */
  for (const st of P.STATS) {
    if (st.id === 'int') st.desc = '마법 피해 · 최대 MP · MP 회복 · 필살 게이지.';
    if (st.id === 'dex') st.desc = '활 피해 · 치명타 · 시위 속도 · 화살 회수.';
  }
  G.wbal = { K, WB, COST, retRate };
})();
