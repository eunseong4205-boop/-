/* 계단이 나무 · 풀에 가려 · 막혀 오르지 못하던 것 (대륙을 다 지은 뒤 — 96_sanity의 길 내기까지 마친 다음)
   예전: 숲 한가운데 계단은 앞에 선 나무의 잎에 덮여 보이지 않았고(전나무 숲은 거의 다), 계단 바로 위 · 아래 칸에 나무가 서서 오르내릴 수 없는 곳도 있었다.
   · 계단마다 앞(아래 세 줄 — 나무 잎이 위로 덮는다) · 양옆 · 위 두 줄의 자연물(나무 · 덤불 · 풀숲 · 갈대 · 그루터기 · 선인장 · 큰 버섯 · 수정)을 치운다.
     폭탄 바위 · 들 돌 · 얼음 가시 · 잔해처럼 도구로 여는 관문, 울타리 · 돌담 · 가로등 같은 마을 것은 그대로 둔다.
   · 계단이 내려서는 땅(아래 · 위 착지)이 나무에 갇힌 작은 웅덩이면, 같은 높이의 가까운 넓은 땅까지 자연물을 치워 길을 낸다(지형은 바꾸지 않는다) */
(function () {
  'use strict';
  const G = globalThis.G;
  const TL = G.tiles, OB = G.objs, SN = G.sanity;
  const T = TL.T, O = OB.O, PROP = TL.PROP;
  if (!SN || !G.build) return;
  const NAT = new Set([O.TREE, O.BIGTREE, O.PINE, O.SNOWTREE, O.PALM, O.DEAD, O.BLOSSOM, O.SHROOM, O.CRYSTAL, O.BUSH, O.TALL, O.REED, O.STUMP, O.CACTUS].filter((v) => v != null));
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function flightsOf(m) {
    const N = m.w * m.h, seen = new Uint8Array(N), out = [];
    for (let i = 0; i < N; i++) {
      if (seen[i] || m.ter[i] !== T.STAIRS) continue;
      const st = [i], list = []; seen[i] = 1;
      while (st.length) {
        const j = st.pop(); list.push(j);
        const x = j % m.w, y = (j / m.w) | 0;
        for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue; const k = m.i(nx, ny); if (!seen[k] && m.ter[k] === T.STAIRS) { seen[k] = 1; st.push(k); } }
      }
      let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (const j of list) { const x = j % m.w, y = (j / m.w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      // 오르내리는 쪽: 위 · 아래 착지의 높이가 다르면 남북, 아니면 동서
      const ground = (x, y) => m.inb(x, y) && m.T(x, y) !== T.CLIFF && m.T(x, y) !== T.STAIRS;
      let ns = false;
      for (let x = x0; x <= x1 && !ns; x++) if (ground(x, y0 - 1) && ground(x, y1 + 1) && m.H(x, y0 - 1) !== m.H(x, y1 + 1)) ns = true;
      const lands = [];
      if (ns) for (let x = x0; x <= x1; x++) { lands.push([x, y0 - 1]); lands.push([x, y1 + 1]); }
      else for (let y = y0; y <= y1; y++) { lands.push([x0 - 1, y]); lands.push([x1 + 1, y]); }
      out.push({ x0, x1, y0, y1, ns, lands: lands.filter(([x, y]) => ground(x, y)) });
    }
    return out;
  }
  /** 걸을 수 있는 땅(지형만): 막힘 · 위험 · 깊은 물이 아니고 건물이 서 있지 않은 칸 */
  const landOK = (m, i) => { const p = PROP[m.ter[i]]; return !!p && !p.s && !p.h && !m.solidExtra[i]; };

  function clearStairs(m) {
    const fl = flightsOf(m);
    let cleared = 0, paths = 0;
    const take = (x, y) => { if (!m.inb(x, y)) return; const i = m.i(x, y), o = m.obj[i]; if (o && NAT.has(o)) { m.obj[i] = 0; cleared++; } };
    // 1) 계단 둘레를 비운다 — 앞(아래) 세 줄은 나무 잎이 계단을 덮는 자리
    for (const F of fl) {
      const xa = F.x0 - (F.ns ? 1 : 2), xb = F.x1 + (F.ns ? 1 : 2), ya = F.y0 - (F.ns ? 2 : 1), yb = F.y1 + 3;
      for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) take(x, y);
    }
    // 2) 착지가 나무에 갇힌 작은 웅덩이면 같은 높이의 넓은 땅까지 길을 낸다
    const pass = (mm, i) => mm.ter[i] !== T.STAIRS && SN.passI(mm, i);
    const L = SN.label(m, pass);
    const SMALL = 16;
    for (const F of fl) for (const [lx, ly] of F.lands) {
      const s0 = m.i(lx, ly), c0 = L.comp[s0];
      if (c0 >= 0 && L.size[c0] >= SMALL) continue;
      const h0 = m.hgt[s0];
      // 같은 높이 · 지형만 보는 가장 싼 길 (자연물은 치울 수 있다, 그 밖의 막힘은 지나지 않는다)
      const dist = new Map([[s0, 0]]), prev = new Map(), open = [[0, s0]];
      let hit = -1;
      while (open.length) {
        let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
        const [d, i] = open[bi]; open[bi] = open[open.length - 1]; open.pop();
        if (d > dist.get(i)) continue;
        const ci = L.comp[i];
        if (i !== s0 && ci >= 0 && ci !== c0 && L.size[ci] >= SMALL) { hit = i; break; }
        if (d > 24) break;
        const x = i % m.w, y = (i / m.w) | 0;
        for (const [dx, dy] of D4) {
          const nx = x + dx, ny = y + dy; if (!m.inb(nx, ny)) continue;
          const j = m.i(nx, ny);
          if (m.hgt[j] !== h0 || m.ter[j] === T.STAIRS || !landOK(m, j)) continue;
          const o = m.obj[j], od = o && OB.DEF[o];
          let cst = 1;
          if (od && od.solid && !(od.cut || od.lift === 1)) { if (!NAT.has(o)) continue; cst = 4; }
          const nd = d + cst;
          if (nd < (dist.has(j) ? dist.get(j) : 1e9)) { dist.set(j, nd); prev.set(j, i); open.push([nd, j]); }
        }
      }
      if (hit < 0) continue;
      for (let k = hit; k != null; k = prev.get(k)) { const o = m.obj[k]; if (o && NAT.has(o)) { m.obj[k] = 0; cleared++; } }
      paths++;
    }
    m.stairClear = { flights: fl.length, cleared, paths };
    return m.stairClear;
  }

  const done = new WeakSet();
  const get0 = G.build.get;
  G.build.get = function (id) {
    const m = get0.apply(this, arguments);
    if (m && m.overworld && !done.has(m)) { done.add(m); try { clearStairs(m); } catch (e) { console.error('[stairs]', e); } }
    return m;
  };
  G.stairClear = { clearStairs, flightsOf };
})();
