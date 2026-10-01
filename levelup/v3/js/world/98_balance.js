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

  // 가게: 기술서 · 새 장비 (가게 목록이 이야기 쪽에서 다시 만들어지기도 해서 맨 마지막에)
  if (G.skills && G.skills.placeLate) G.skills.placeLate();
  if (G.talents && G.talents.placeLate) G.talents.placeLate();
  if (G.skills2 && G.skills2.placeLate) G.skills2.placeLate();

  G.balance = { PTS: 4, NEW_TIER_HP: NEW };
})();
