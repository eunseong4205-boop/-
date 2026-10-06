/* 밖으로 나오는 자리 (보스를 잡고 빛을 타거나 · 던전 · 집 문을 나설 때)
   예전: 나가는 자리는 이야기마다 정한 숫자(입구 + 2칸 같은)였다 — 대륙이 커지고 바뀌는 사이 몇 곳이 어긋났다.
     블루 해안 동굴(d3)의 빛은 입구 두 칸 아래 「깊은 바다」 위에 내려 주어 움직일 수 없었고, 그레이 고원 굴의 문은 막힌 칸에 내려 주었다.
   이제 대륙으로 나올 때 내릴 칸이 설 수 없는 곳(막힘 · 물 · 구덩이 · 용암 · 절벽 · 다시 들어가는 입구 칸)이거나 들어온 입구에서 멀면,
   들어온 입구 바로 앞에서 가장 가까운 설 수 있는 칸에 내린다. 멀쩡한 자리는 그대로 */
(function () {
  'use strict';
  const G = globalThis.G;
  const TL = G.tiles, OB = G.objs, T = TL.T, PROP = TL.PROP;

  function onWarp(m, x, y) {
    for (const w of m.warps || []) if (x >= w.x && y >= w.y && x < w.x + (w.w || 1) && y < w.y + (w.h || 1)) return true;
    return false;
  }
  function standable(m, x, y) {
    if (!m.inb(x, y)) return false;
    const i = m.i(x, y), t = m.ter[i], P = PROP[t];
    if (!P || P.s || P.h || P.liquid || t === T.CLIFF || m.solidExtra[i]) return false;
    const o = m.obj[i]; if (o && OB.DEF[o] && OB.DEF[o].solid) return false;
    return !onWarp(m, x, y);
  }
  /** 내릴 칸을 고른다 — 그대로 둘 때는 null */
  function landing(m, from, tx, ty) {
    const ents = (m.warps || []).filter((w) => w.to === from);
    const near = (x, y) => !ents.length || ents.some((w) => Math.abs(x - w.x) + Math.abs(y - w.y) <= 8);
    if (standable(m, tx, ty) && near(tx, ty)) return null;
    // 기준: 목적지에서 가장 가까운 입구의 바로 앞(아래) 칸
    let ax = tx, ay = ty;
    if (ents.length) {
      const e = ents.slice().sort((a, b) => (Math.abs(a.x - tx) + Math.abs(a.y - ty)) - (Math.abs(b.x - tx) + Math.abs(b.y - ty)))[0];
      ax = e.x + ((e.w || 1) >> 1); ay = e.y + (e.h || 1);
    }
    const seen = new Set([ax + ',' + ay]), q = [[ax, ay, 0]];
    for (let h = 0; h < q.length; h++) {
      const [x, y, d] = q[h];
      if (standable(m, x, y)) return [x, y];
      if (d >= 12) continue;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!seen.has(k)) { seen.add(k); q.push([x + dx, y + dy, d + 1]); } }
    }
    return null;
  }

  /** game.js useWarp가 문을 지나기 전에 묻는다 — 대륙으로 나올 때 내릴 칸을 바로잡는다 */
  G.exitLanding = function (w) {
    if (!w || w.to !== 'world' || w.tx == null || w.ty == null || !G.build.built || !G.build.built.world) return w;
    const from = G.state && G.state.map;
    if (!from || from === 'world') return w;
    const spot = landing(G.build.get('world'), from, Math.round(w.tx), Math.round(w.ty));
    return spot ? Object.assign({}, w, { tx: spot[0], ty: spot[1] }) : w;
  };
  G.exits = { landing, standable };
})();
