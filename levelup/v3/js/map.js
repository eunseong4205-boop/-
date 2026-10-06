/* 지도 모델: 지형 · 높이 · 사물 · 지역 격자, 바닥 묶음(청크) 그리기, 높이를 아는 충돌 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles, OB = G.objs;
  const T = TL.T, TS = TL.TS, PROP = TL.PROP;
  const CH = 16;              // 묶음 한 변의 칸 수
  const CPX = CH * TS;

  class GameMap {
    constructor(o) {
      Object.assign(this, { id: 'map', name: '', w: 32, h: 32, region: 0, palName: null, edge: T.VOID, music: null, dark: 0, weather: null }, o);
      const n = this.w * this.h;
      this.ter = o.ter || new Uint8Array(n);
      this.hgt = o.hgt || new Uint8Array(n);
      this.obj = o.obj || new Uint8Array(n);
      this.reg = o.reg || new Uint8Array(n).fill(this.region);
      this.chunks = new Map();
      this.props = o.props || []; this.npcs = o.npcs || []; this.spawns = o.spawns || []; this.warps = o.warps || []; this.triggers = o.triggers || []; this.lights = o.lights || [];
      this.buildings = o.buildings || [];
      this.solidExtra = new Uint8Array(n);   // 건물 · 문 · 사물 소품이 막는 칸
    }
    i(x, y) { return y * this.w + x; }
    inb(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    T(x, y) { return this.inb(x, y) ? this.ter[y * this.w + x] : this.edge; }
    H(x, y) { if (!this.inb(x, y)) { x = U.clamp(x, 0, this.w - 1); y = U.clamp(y, 0, this.h - 1); } return this.hgt[y * this.w + x]; }
    O(x, y) { return this.inb(x, y) ? this.obj[y * this.w + x] : 0; }
    R(x, y) { if (!this.inb(x, y)) { x = U.clamp(x, 0, this.w - 1); y = U.clamp(y, 0, this.h - 1); } return this.reg[y * this.w + x]; }
    regName(x, y) { return this.palName || TL.REGIONS[this.R(x, y)] || 'green'; }
    pal(x, y) { return TL.PAL[this.regName(x, y)] || TL.PAL.green; }
    setT(x, y, t) { if (!this.inb(x, y)) return; this.ter[this.i(x, y)] = t; this.dirty(x, y); }
    setO(x, y, o) { if (!this.inb(x, y)) return; this.obj[this.i(x, y)] = o; this.dirty(x, y); }
    setH(x, y, h) { if (!this.inb(x, y)) return; this.hgt[this.i(x, y)] = h; this.dirty(x, y); }
    /** 칸이 바뀌면 그 칸과 이웃이 걸친 묶음을 다시 그린다 */
    dirty(x, y) {
      for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const k = (((x + dx) / CH) | 0) + ',' + (((y + dy) / CH) | 0);
        this.chunks.delete(k);
        if (this.jobs) this.jobs.delete(k);   // 그리던 중이면 처음부터 다시
      }
    }
    dirtyAll() { this.chunks.clear(); if (this.jobs) this.jobs.clear(); }

    /* ───────── 그리기 ───────── */
    /* 묶음 하나는 256×256 픽셀을 한 점씩 칠한다 (휴대폰에서 0.2초 남짓).
       한 줄씩 나눠 칠할 수 있게 해 두고, 걸어갈 쪽의 묶음은 프레임마다 조금씩 미리 칠한다 (prefetch) —
       예전에는 새 땅에 들어설 때마다 그 자리에서 다 칠하느라 화면이 멈칫했다 */
    chunk(cx, cy) {
      const k = cx + ',' + cy;
      const c = this.chunks.get(k);
      if (c) return c;
      return this.chunkRows(this.chunkJob(cx, cy), Infinity);
    }
    chunkJob(cx, cy) {
      const k = cx + ',' + cy, J = this.jobs || (this.jobs = new Map());
      let j = J.get(k);
      if (!j) { if (J.size >= 6) J.delete(J.keys().next().value); j = { k, cx, cy, b: X.brush(CPX, CPX), y: 0 }; J.set(k, j); }   // 지나쳐 버린 밑그림은 버린다
      return j;
    }
    /** 칠할 줄을 이어 칠한다: until(performance.now 기준)을 넘기면 멈춘다. 다 칠했으면 그 묶음을, 아니면 null */
    chunkRows(j, until) {
      const d = j.b.d, x0 = j.cx * CPX, y0 = j.cy * CPX;
      while (j.y < CPX) {
        const y = j.y, wy = y0 + y;
        if ((wy >> 4) >= this.h) { j.y = CPX; break; }
        for (let x = 0; x < CPX; x++) {
          const wx = x0 + x;
          if ((wx >> 4) >= this.w) break;
          const col = TL.pixel(this, wx, wy);
          const i = (y * CPX + x) * 4;
          d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
        }
        j.y++;
        if (until !== Infinity && performance.now() > until) return null;
      }
      this.jobs.delete(j.k);
      return this.chunkDone(j);
    }
    chunkDone(j) {
      const { k, cx, cy } = j, x0 = cx * CPX, y0 = cy * CPX;
      const c = j.b.put();
      // 묶음은 최대 64개만 기억한다 (넓은 지도에서 메모리 절약)
      if (this.chunks.size > 64) { const first = this.chunks.keys().next().value; this.chunks.delete(first); }
      // 바닥에 붙은 사물 (꽃 · 풀숲 · 자갈 …)
      const g = X.ctx(c);
      for (let ty = cy * CH; ty < (cy + 1) * CH && ty < this.h; ty++) for (let tx = cx * CH; tx < (cx + 1) * CH && tx < this.w; tx++) {
        const o = this.O(tx, ty);
        if (!o || !OB.DEF[o] || !OB.DEF[o].ground) continue;
        const sp = OB.sprite(o, this.regName(tx, ty), U.noise2(tx, ty, 5) * 4 | 0);
        if (sp.c) g.drawImage(sp.c, tx * TS - x0, ty * TS - y0);
      }
      this.chunks.set(k, c);
      return c;
    }
    /** 보이는 바닥을 그린다. budget: 이번 프레임에 새로 만들 수 있는 묶음 수 */
    drawGround(g, camX, camY, vw, vh, budget) {
      const cx0 = Math.floor(camX / CPX), cy0 = Math.floor(camY / CPX), cx1 = Math.floor((camX + vw) / CPX), cy1 = Math.floor((camY + vh) / CPX);
      let made = 0;
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
        if (cx < 0 || cy < 0 || cx * CH >= this.w || cy * CH >= this.h) continue;
        const k = cx + ',' + cy;
        let c = this.chunks.get(k);
        if (!c) { if (made >= (budget || 99)) { g.fillStyle = '#1a2a1a'; g.fillRect(Math.round(cx * CPX - camX), Math.round(cy * CPX - camY), CPX, CPX); continue; } made++; c = this.chunk(cx, cy); }
        else { this.chunks.delete(k); this.chunks.set(k, c); }      // 최근에 쓴 것은 뒤로
        g.drawImage(c, Math.round(cx * CPX - camX), Math.round(cy * CPX - camY));
      }
    }
    /** 보이는 둘레 한 묶음씩을 시간이 남는 만큼 미리 칠한다 (가는 쪽 · 가까운 것부터) */
    prefetch(camX, camY, vw, vh, ms, vx, vy) {
      const until = performance.now() + ms;
      const ccx = (camX + vw / 2 + (vx || 0) * 1.2) / CPX, ccy = (camY + vh / 2 + (vy || 0) * 1.2) / CPX;
      const cx0 = Math.max(0, Math.floor((camX - CPX * 0.75) / CPX)), cy0 = Math.max(0, Math.floor((camY - CPX * 0.75) / CPX));
      const cx1 = Math.min(Math.ceil(this.w / CH) - 1, Math.floor((camX + vw + CPX * 0.75) / CPX)), cy1 = Math.min(Math.ceil(this.h / CH) - 1, Math.floor((camY + vh + CPX * 0.75) / CPX));
      let want = null;
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
        if (this.chunks.has(cx + ',' + cy)) continue;
        (want || (want = [])).push([(cx + 0.5 - ccx) ** 2 + (cy + 0.5 - ccy) ** 2, cx, cy]);
      }
      if (!want) return;
      want.sort((a, b) => a[0] - b[0]);
      for (const [, cx, cy] of want) { if (!this.chunkRows(this.chunkJob(cx, cy), until)) return; if (performance.now() > until) return; }
    }
    /** 화면에 보일 묶음만 바로 만든다 (지도에 들어설 때 — 둘레는 prefetch가 이어서) */
    warmView(camX, camY, vw, vh) {
      const cx0 = Math.max(0, Math.floor(camX / CPX)), cy0 = Math.max(0, Math.floor(camY / CPX)), cx1 = Math.floor((camX + vw) / CPX), cy1 = Math.floor((camY + vh) / CPX);
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) if (cx * CH < this.w && cy * CH < this.h) this.chunk(cx, cy);
    }
    /** 주변 묶음을 미리 만든다 */
    warm(px, py, r) {
      const cx0 = Math.floor((px - r) / CPX), cy0 = Math.floor((py - r) / CPX), cx1 = Math.floor((px + r) / CPX), cy1 = Math.floor((py + r) / CPX);
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) if (cx >= 0 && cy >= 0 && cx * CH < this.w && cy * CH < this.h) this.chunk(cx, cy);
    }
    /** 보이는 범위의 서 있는 사물을 그리기 목록에 넣는다 (y 정렬용) */
    collect(list, x0, y0, x1, y1) {
      for (let ty = Math.max(0, y0); ty <= Math.min(this.h - 1, y1); ty++) for (let tx = Math.max(0, x0); tx <= Math.min(this.w - 1, x1); tx++) {
        const o = this.obj[ty * this.w + tx];
        if (!o) continue;
        const D = OB.DEF[o];
        if (!D || D.ground) continue;
        const sp = OB.sprite(o, this.regName(tx, ty), U.noise2(tx, ty, 5) * 4 | 0);
        if (!sp.c) continue;
        list.push({ y: ty * TS + 14, img: sp.c, x: tx * TS + 8 - sp.ox, top: ty * TS + 14 - sp.oy, obj: o, tx, ty });
      }
    }

    /* ───────── 충돌 ───────── */
    /** 칸 자체가 막혔나 (높이는 보지 않음) */
    blocked(tx, ty, ent) {
      if (!this.inb(tx, ty)) return true;
      const i = ty * this.w + tx;
      const t = this.ter[i], p = PROP[t];
      if (p.s && !(p.d && ent && ent.swim)) return true;
      if (this.solidExtra[i]) return true;
      const o = this.obj[i];
      if (o && OB.DEF[o] && OB.DEF[o].solid) return true;
      return false;
    }
    /** 높이 z에 선 존재가 이 칸에 들어갈 수 있나 */
    passable(tx, ty, z, ent) {
      if (this.blocked(tx, ty, ent)) return false;
      const t = this.T(tx, ty);
      if (t === T.STAIRS) return true;
      if (ent && ent.onStairs) return true;
      if (ent && ent.fly) return true;
      return this.H(tx, ty) === z;
    }
    /** 발 상자(x, y, w, h: 픽셀)가 전부 들어갈 수 있나 */
    boxFree(x, y, w, h, z, ent) {
      const x0 = Math.floor(x / TS), y0 = Math.floor(y / TS), x1 = Math.floor((x + w - 0.01) / TS), y1 = Math.floor((y + h - 0.01) / TS);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (!this.passable(tx, ty, z, ent)) return false;
      return true;
    }
    /** 투사체: 높이 z로 날아가는 것이 이 픽셀을 지나갈 수 있나 */
    shotFree(px, py, z) {
      const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
      if (!this.inb(tx, ty)) return false;
      const t = this.T(tx, ty);
      if (t === T.WALL || t === T.VOID) return false;
      const o = this.O(tx, ty);
      if (o && OB.DEF[o] && OB.DEF[o].solid && !OB.DEF[o].cut) return false;
      if (t === T.CLIFF) { let k = 1; while (this.T(tx, ty - k) === T.CLIFF && k < 8) k++; return this.H(tx, ty - k) <= z; }
      return this.H(tx, ty) <= z || this.solidExtra[this.i(tx, ty)] === 0 && this.H(tx, ty) <= z + 0;
    }
    /** 뛰어내릴 곳: (tx,ty)에서 dir 쪽으로 낮은 땅을 찾는다 */
    ledgeLanding(tx, ty, dx, dy, z, ent) {
      for (let k = 1; k <= 5; k++) {
        const nx = tx + dx * k, ny = ty + dy * k;
        if (!this.inb(nx, ny)) return null;
        const t = this.T(nx, ny);
        if (t === T.CLIFF) continue;
        if (this.blocked(nx, ny, ent)) return null;
        const h = this.H(nx, ny);
        if (h < z) return { tx: nx, ty: ny, h };
        return null;
      }
      return null;
    }
    hazardAt(px, py) { const t = this.T(Math.floor(px / TS), Math.floor(py / TS)); return PROP[t].h || null; }
    groundAt(px, py) { return this.T(Math.floor(px / TS), Math.floor(py / TS)); }
  }

  G.GameMap = GameMap;
  G.mapc = { CH, CPX };
})();
