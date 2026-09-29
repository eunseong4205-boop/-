/* 존재(엔티티): 발 위치 · 발 상자 · 높이 · 속도. 이동은 축을 나눠 충돌을 보고, 모서리에 걸리면 살짝 비켜 준다.
   모든 좌표는 지도 픽셀. x, y는 발 한가운데. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const TS = TL.TS;

  let nextId = 1;
  class Ent {
    constructor(o) {
      Object.assign(this, {
        id: 'e' + (nextId++), kind: 'ent', x: 0, y: 0, z: 0, bw: 10, bh: 6, vx: 0, vy: 0, kx: 0, ky: 0, dir: 'down',
        jz: 0, jvz: 0, onStairs: false, swim: false, fly: false, dead: false, t: 0, anim: 'idle', at: 0, hidden: false, solid: true,
        hp: 1, maxHp: 1, inv: 0, flash: 0, shadow: true, noClip: false,
      }, o);
    }
    get box() { return { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh }; }
    get tx() { return Math.floor(this.x / TS); }
    get ty() { return Math.floor((this.y - 1) / TS); }
  }

  /** 높이 갱신: 발 가운데가 계단이면 높이 자유, 아니면 그 칸의 높이 */
  function settle(m, e) {
    const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - e.bh / 2) / TS);
    const t = m.T(tx, ty);
    if (t === TL.T.STAIRS) { e.onStairs = true; return; }
    // 상자가 아직 계단에 걸쳐 있으면 계단 상태 유지
    const b = e.box;
    let touch = false;
    for (const [px, py] of [[b.x, b.y], [b.x + b.w - 0.01, b.y], [b.x, b.y + b.h - 0.01], [b.x + b.w - 0.01, b.y + b.h - 0.01]]) if (m.T(Math.floor(px / TS), Math.floor(py / TS)) === TL.T.STAIRS) touch = true;
    e.onStairs = touch;
    if (!touch) e.z = m.H(tx, ty);
  }

  /** 한 축씩 움직인다. 막히면 모서리 비켜 가기(젤다처럼) */
  function move(m, e, dx, dy) {
    if (e.noClip) { e.x += dx; e.y += dy; return { hitX: false, hitY: false }; }
    let hitX = false, hitY = false;
    const free = (x, y) => m.boxFree(x - e.bw / 2, y - e.bh, e.bw, e.bh, e.z, e) && !(G.world && G.world.propBlock(x - e.bw / 2, y - e.bh, e.bw, e.bh, e));
    // 가로
    if (dx) {
      const steps = Math.ceil(Math.abs(dx) / 4);
      for (let s = 0; s < steps; s++) {
        const sx = dx / steps;
        if (free(e.x + sx, e.y)) { e.x += sx; continue; }
        hitX = true;
        // 모서리 밀어주기: 위아래 4픽셀 안에 빈 곳이 있으면 그쪽으로
        if (!dy) for (const n of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) if (free(e.x + sx, e.y + n) && free(e.x, e.y + Math.sign(n))) { e.y += Math.sign(n) * Math.min(1, Math.abs(sx)); break; }
        break;
      }
    }
    if (dy) {
      const steps = Math.ceil(Math.abs(dy) / 4);
      for (let s = 0; s < steps; s++) {
        const sy = dy / steps;
        if (free(e.x, e.y + sy)) { e.y += sy; continue; }
        hitY = true;
        if (!dx) for (const n of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) if (free(e.x + n, e.y + sy) && free(e.x + Math.sign(n), e.y)) { e.x += Math.sign(n) * Math.min(1, Math.abs(sy)); break; }
        break;
      }
    }
    settle(m, e);
    return { hitX, hitY };
  }

  /** 발밑이 낮은 쪽으로 뛰어내릴 수 있나: 진행 방향 앞 칸을 본다 */
  function ledgeAhead(m, e, dx, dy) {
    if (e.onStairs) return null;
    const d = U.dir4(dx, dy);
    const [ux, uy] = U.DV[d];
    // 발 상자 앞쪽 가장자리의 가운데
    const fx = e.x + ux * (e.bw / 2 + 2), fy = e.y - e.bh / 2 + uy * (e.bh / 2 + 2);
    const tx = Math.floor(fx / TS), ty = Math.floor(fy / TS);
    const t = m.T(tx, ty);
    const h = m.H(tx, ty);
    if (!(t === TL.T.CLIFF || h < e.z)) return null;
    // 옆으로 너무 비껴 있으면 안 된다 (칸 가운데 쪽으로 향할 때만)
    const land = m.ledgeLanding(Math.floor(e.x / TS), Math.floor((e.y - e.bh / 2) / TS), ux, uy, e.z, e);
    if (!land) return null;
    // 착지 칸 전체가 비어 있어야
    const lx = ux ? land.tx * TS + 8 : e.x, ly = uy ? land.ty * TS + 12 : e.y;
    if (!m.boxFree(lx - e.bw / 2, ly - e.bh, e.bw, e.bh, land.h, e)) return null;
    return { x: lx, y: ly, h: land.h, dir: d };
  }

  G.ent = { Ent, move, settle, ledgeAhead };
})();
