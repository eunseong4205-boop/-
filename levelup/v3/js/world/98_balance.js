/* 전체 밸런스 — 모든 장비 · 주문 · 필살기 · 재능이 정해진 뒤 마지막에 한 번
   검 · 활 · 마법을 바꿔 들며 싸우게 되면서(무기 내성 · 인장 · 칙령) 세 무기의 장비 요구치를 모두 채워야 했다.
   레벨당 3점으로는 Lv 40 전설 장비 셋 + 옷만으로 100점이 들어 재능에 쓸 점수가 거의 남지 않았다 (모형: 장마다 그 장까지의 가게 장비를 요구치 안에서).
   · 성장 점수 레벨당 3 → 4 (예전 기록은 지난 레벨만큼 한 번에 더 받는다)
   · 장비 · 주문 · 필살기 요구치: 그 갈래의 주 능력치 ×0.85, 곁 능력치 ×0.6 (레벨 요구는 그대로)
   · 재능 줄 요구: 5줄 16 → 14, 6줄 24 → 20, 7줄 30 → 26 (생존 체력 14/20/26 → 12/18/22)
   · 위험도 높은 적 체력: ★7부터 곡선을 완만하게 (보통 적 하나에 검 7~9번 → 5~6번, 재능 없이)
   그 결과(모형): 무기 셋을 고루 쓰는 플레이어가 장마다 그 장 가게의 좋은 장비를 다 들어도 점수의 40~55%만 쓰고, 나머지는 재능에 */
(function () {
  'use strict';
  const G = globalThis.G;
  const D = G.data, P = G.prog;

  /* ── 성장 점수 ── */
  P.PTS_PER_LV = 4;
  const mig0 = P.migrate;
  P.migrate = function (s) {
    s = mig0.apply(this, arguments);
    if (s.ptsV !== 4) { if (s.lv > 1) s.pts = (s.pts || 0) + (s.lv - 1); s.ptsV = 4; }
    return s;
  };
  const fresh0 = G.st.fresh;
  G.st.fresh = function () { const s = fresh0.apply(this, arguments); s.ptsV = 4; return s; };

  /* ── 요구치 ── */
  const MAIN = { sword: 'str', bow: 'dex', focus: 'int', armor: 'vit', shield: 'vit', spell: 'int' };
  function scale(req, main) {
    if (!req) return;
    for (const k of Object.keys(req)) {
      if (k === 'lv') continue;
      const v = req[k] * (k === main ? 0.85 : 0.6);
      req[k] = Math.max(1, Math.round(v));
    }
  }
  for (const it of Object.values(D.ITEMS)) if (it.req && !it._reqScaled) { it._reqScaled = true; scale(it.req, MAIN[it.type] || null); }
  for (const sp of Object.values(D.SPELLS)) if (sp.req && !sp._reqScaled) { sp._reqScaled = true; scale(sp.req, 'int'); }
  for (const sp of Object.values(D.SPECIALS)) if (sp.req && !sp._reqScaled) { sp._reqScaled = true; scale(sp.req, { sword: 'str', bow: 'dex', magic: 'int' }[sp.type || 'sword']); }

  /* ── 재능 줄 요구 ── */
  const ROWNEED = { 5: 14, 6: 20, 7: 26 }, VITNEED = { 5: 12, 6: 18, 7: 22 };
  for (const k of D.SKILLS) {
    if (!k.req) continue;
    for (const st of ['str', 'dex', 'int']) if (k.req[st] && ROWNEED[k.row] && k.req[st] > ROWNEED[k.row] && ['검술', '궁술', '마법'].includes(k.tree)) k.req[st] = ROWNEED[k.row];
    if (k.req.vit && VITNEED[k.row] && k.req.vit > VITNEED[k.row]) k.req.vit = VITNEED[k.row];
  }

  /* ── 위험도별 적 체력 (★7부터 완만하게) ── */
  const TH = G.foes.TIER_HP, NEW = [1, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8, 6.4, 7.0, 7.6, 8.4, 9.2];
  for (let i = 0; i < TH.length && i < NEW.length; i++) TH[i] = NEW[i];

  /* ── 경험: 위험도에 비해 가벼운 땅 ──
     장마다 기대 레벨 사이에 드는 경험을 그 장 던전 · 보스 · 들판 적이 주는 경험과 견주면(보통) 던전 밖에서 더 잡아야 할 적이
     c1 111 · c2 38 · c3 63 · c4 52 · c5 110 · c6 158 · c7 90 · c8 73 · c9 72 · c10 213 · c11 88 — 그린 · 무지개 섬(★5) · 알록달록 곶(★9)의 적이
     그 위험도에 비해 가벼웠다(적 하나 평균 4.8 · 40.9 · 97.8, 앞 장 퍼플은 44.6 · 뒤 장 화이트 93.9 · 그레이 128). 그 위험도의 적만 무겁게(퍼플도 조금)
     → c1 81 · c5 91 · c6 96 · c10 152 · c11 63 (나머지는 그대로) */
  const XP = { 0: 1.2, 4: 1.15, 5: 1.35, 9: 1.4 };
  const fsp0 = G.foes.spawn;
  G.foes.spawn = function () {
    const e = fsp0.apply(this, arguments);
    if (e && !e.boss && XP[e.tier] && !e._xp) { e._xp = true; e.exp = Math.round(e.exp * XP[e.tier]); }
    return e;
  };
  /* ── 뒤처진 만큼 (새 장에 들어설 때) ──
     기대 레벨(장마다 바로 가기 상태)보다 두 레벨 넘게 낮으면 그 차이에 드는 경험의 40%를 「새 땅의 빛」으로.
     레벨을 넉넉히 올린 사람에겐 아무것도 없다 — 들판 적은 위험도에 묶여 있어 너무 낮으면 장마다 점점 버거워졌다 */
  const EXPECT = { c2: 8, c3: 12, c4: 16, c5: 20, c6: 25, c7: 30, c8: 35, c9: 40, c10: 44, c11: 48, c12: 50 };
  const ST = G.story;
  if (ST && ST.setChapter) {
    const sc0 = ST.setChapter;
    ST.setChapter = async function (c, id) {
      const r = await sc0.apply(this, arguments);
      try {
        const s = G.state, E = EXPECT[id];
        if (E && s && s.lv < E - 2 && !s.flags['catch:' + id]) {
          s.flags['catch:' + id] = true;
          let gap = -s.exp; for (let l = s.lv; l < E; l++) gap += D.expNext(l);
          const mul = G.st.derive(s).expMul * (P.diff ? P.diff().exp || 1 : 1);
          const n = Math.round(gap * 0.4 / Math.max(0.1, mul));
          if (n > 0) { G.ui.toast('새 땅의 빛이 스며든다 — 경험 +' + Math.round(n * mul), 'gold'); c.exp(n); }
        }
      } catch (e) { console.error('[catch-up]', e); }
      return r;
    };
  }
  G.balance_xp = { XP, EXPECT };

  // 가게: 기술서 · 새 장비 (가게 목록이 이야기 쪽에서 다시 만들어지기도 해서 맨 마지막에)
  if (G.arsenal && G.arsenal.placeLate) G.arsenal.placeLate();
  if (G.skills && G.skills.placeLate) G.skills.placeLate();
  if (G.talents && G.talents.placeLate) G.talents.placeLate();
  if (G.skills2 && G.skills2.placeLate) G.skills2.placeLate();

  G.balance = { PTS: 4, NEW_TIER_HP: NEW };
})();
