/* 별관 — 위험도(★)만큼 길어지는 던전
   본 던전마다 깊은 구역으로 내려가는 길목에 별관이 끼어든다: 2 + ★/2 방 (★0 둘 … ★10 일곱). 마지막 방의 수호자를 이겨야 깊은 구역 계단이 열린다.
   고원 굴 · 숨은 던전에는 곁가지 별관 (1 + ★/3, 2 + ★/3 방).
   방마다 다른 장치 — 던전마다 고르는 장치가 다르고, 차례도 다르다:
   · 인장의 방 — 검 · 활 · 마법 인장을 각각 그 무기로 쳐서 깨운다 (★5부터는 8초 안에 모두)
   · 내성 투기장 — 파도마다 한 무기가 튕기는 적. 마지막엔 내성이 바뀌는 정예
   · 불기둥 회랑 — 천장에서 내리꽂는 불길 사이로 건너 발판을 밟는다
   · 굴러오는 바위 — 굴러 내려오는 바위 사이로 건너 발판을 밟는다
   · 어둠의 방 — 빛이 없다. 불 마법으로 횃불 셋을 밝힌다
   · 시간 경주 — 발판을 밟으면 문이 열린다. 닫히기 전에 건너라
   · 흐르는 바닥 — 움직이는 바닥 위에서 싸운다. 끝에는 가시
   · 공명 수정 — 표지판의 가락대로 수정을 친다 (아무 무기나). 틀리면 처음부터
   · 별관의 수호자 — 내성이 바뀌는 정예. 이기면 위험도에 맞는 장비 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent, C = G.combat, D = G.data, H = G.hud;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const DUN = G.dungeon.DUN;
  const PR = G.props;
  const WN = { sword: '검', bow: '활', magic: '마법' }, WC = { sword: '#ffd8a8', bow: '#c8f0a0', magic: '#a8c8ff' };
  const flag = (k) => !!S().flags[k];
  const setFlag = (k, v) => { S().flags[k] = v == null ? true : v; };
  const roomAt = (m, px, py) => (G.rules ? G.rules.roomOf(m, px, py) : null);

  /* ═════════ 장치 ═════════ */
  /** 인장: 제 무기로 쳐야 깨어난다. 한 무리가 모두 깨면 깃발 (timer초 안에) */
  class Sigil extends PR.Prop {
    constructor(o) { super(Object.assign({ bw: 12, bh: 8, shadowW: 7 }, o)); this.lit = false; this.litAt = 0; this.cool = 0; }
    get done() { return flag(this.group); }
    hitBy(w) {
      if (this.cool > 0 && w === this.lastW) return; this.cool = 0.3; this.lastW = w;   // 같은 무기 연타만 막는다
      if (this.done || this.lit) { sfx('click'); return; }
      if (w !== this.w) { sfx('buzz'); G.fx.float(this.x, this.y - 30, WN[this.w] + '의 인장 — ' + WN[this.w] + '으로', WC[this.w], { life: 0.8 }); G.fx.sparks(this.x, this.y - 14, 4, '#8a8098', 40); return; }
      this.lit = true; this.litAt = W().t; sfx('switch'); G.fx.glow(this.x, this.y - 14, WC[this.w], 16); G.fx.ring(this.x, this.y - 14, WC[this.w], 14, 0.35, 2);
    }
    swordHit() { this.hitBy('sword'); }
    shotHit(sh) { if (sh.owner === 'foe') return false; this.hitBy(sh.kind === 'arrow' ? 'bow' : sh.src === 'spell' ? 'magic' : sh.kind === 'beam' ? 'sword' : null); return true; }
    bombed() { sfx('clank'); }
    update(dt, Wd) {
      this.t += dt; if (this.cool > 0) this.cool -= dt;
      if (this.done || !this.lit || this.lead === false) return;
      const grp = Wd.ents.filter((e) => e instanceof Sigil && e.group === this.group);
      if (grp[0] !== this) return;   // 무리의 첫 인장이 판정한다
      const lit = grp.filter((e) => e.lit);
      if (lit.length === grp.length) { setFlag(this.group); sfx('puzzle'); for (const e of grp) G.fx.ring(e.x, e.y - 14, '#ffffff', 22, 0.5, 2); G.ui.toast('인장이 모두 깨어났다', 'good'); return; }
      if (this.timer && lit.length) {
        const first = Math.min(...lit.map((e) => e.litAt));
        const left = this.timer - (Wd.t - first);
        if (left <= 0) { for (const e of grp) e.lit = false; sfx('buzz'); G.ui.toast('인장이 다시 잠들었다 — ' + this.timer + '초 안에 모두 깨워라', 'bad'); }
      }
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const on = this.lit || this.done, col = WC[this.w];
      g.fillStyle = '#140c1c'; g.fillRect(x - 7, y - 25, 14, 25);
      g.fillStyle = '#5a5470'; g.fillRect(x - 6, y - 24, 12, 23); g.fillStyle = '#7a7490'; g.fillRect(x - 6, y - 24, 3, 23);
      g.fillStyle = on ? col : '#2a2436'; g.beginPath(); g.arc(x, y - 15, 6, 0, Math.PI * 2); g.fill();
      if (on) { g.globalAlpha = 0.35 + Math.sin(this.t * 6) * 0.15; g.beginPath(); g.arc(x, y - 15, 10, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      const ic = H.icon(this.w); g.globalAlpha = on ? 1 : 0.55; g.drawImage(ic, x - 6, y - 21); g.globalAlpha = 1;
      if (this.timer && !this.done) {
        const grp = W().ents.filter((e) => e instanceof Sigil && e.group === this.group), lit = grp.filter((e) => e.lit);
        if (lit.length && this.lit) { const left = Math.max(0, this.timer - (W().t - Math.min(...lit.map((e) => e.litAt)))); g.fillStyle = '#ffe066'; g.fillRect(x - 6, y - 28, Math.round(12 * left / this.timer), 2); }
      }
    }
  }
  /** 불기둥: 벽에서 한 줄로 내리꽂는다. 깜빡이면 곧 뿜는다 */
  class Jet extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'jet', solid: false, sortBias: -40 }, o)); }
    phaseK() { return ((W().t + this.phase) % this.period) / this.period; }
    get on() { return this.phaseK() < this.onK; }
    get warn() { return this.phaseK() > 1 - 0.22; }
    inLane(x, y) { return x > this.tx * TS - 2 && x < (this.tx + 1) * TS + 2 && y > this.ty * TS && y < (this.ty + this.len) * TS + 2; }
    update(dt, Wd) {
      this.t += dt;
      if (!this.on) return;
      const p = Wd.player;
      if (p && !p.jz && p.state !== 'dead' && this.inLane(p.x, p.y - 2)) C.hurtPlayer(p, this.dmg, { x: p.x, y: p.y - 12 }, { el: 'fire' });
      for (const e of C.foes()) { if (e.boss || e.fly || !this.inLane(e.x, e.y - 2)) continue; if ((e._jetT = (e._jetT || 0) - dt) > 0) continue; e._jetT = 0.5; C.damage(e, this.fdmg, { src: 'rule', el: 'fire', kx: 0, ky: 0, power: 0.2 }); }
      if (Math.random() < dt * 30) G.fx.part({ x: this.tx * TS + 8 + (Math.random() - 0.5) * 10, y: (this.ty + Math.random() * this.len) * TS, z: 4, vz: 20, g: 0, life: 0.3, col: Math.random() < 0.5 ? '#ffb040' : '#ff6a2a', size: 1, glow: true });
    }
    drawShadow(g, cx, cy) {
      const x = this.tx * TS - cx, y = this.ty * TS - cy, h = this.len * TS;
      // 노즐
      g.fillStyle = '#2a2030'; g.fillRect(x + 3, y - 6, 10, 6); g.fillStyle = this.on ? '#ff8a3a' : this.warn && Math.floor(this.t * 12) % 2 ? '#ffd84a' : '#5a4a50'; g.fillRect(x + 5, y - 3, 6, 3);
      if (this.on) {
        g.globalAlpha = 0.45 + Math.random() * 0.2; g.fillStyle = '#ff6a2a'; g.fillRect(x + 1, y, 14, h);
        g.globalAlpha = 0.85; g.fillStyle = '#ffd04a'; g.fillRect(x + 5 + Math.round(Math.random() * 2 - 1), y, 6, h);
        g.globalAlpha = 1;
      } else if (this.warn) { g.globalAlpha = 0.25 + 0.2 * (Math.floor(this.t * 12) % 2); g.fillStyle = '#ffb040'; g.fillRect(x + 4, y, 8, h); g.globalAlpha = 1; }
      else { g.fillStyle = 'rgba(40,20,20,0.25)'; g.fillRect(x + 5, y, 6, h); }
    }
    draw() {}
  }
  /** 바위 굴림통: 천장에서 바위가 굴러 내려온다 */
  class Chute extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'chute', solid: false, sortBias: -40 }, o)); this.next = o.phase || 0.5; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player; if (!p) return;
      const r = roomAt(Wd.map, p.x, p.y); if (!r || r.k !== this.room) return;   // 그 방에 있을 때만
      if ((this.next -= dt) > 0) { if (this.next < 0.5 && Math.random() < dt * 20) G.fx.part({ x: this.x + (Math.random() - 0.5) * 12, y: this.y, z: 2, vz: 10, g: 0, life: 0.3, col: '#8a7a6a', size: 1 }); return; }
      this.next = this.period;
      Wd.add(new Boulder({ x: this.x, y: this.y + 8, vy: this.speed, dmg: this.dmg, fdmg: this.fdmg }));
      sfx('rock');
    }
    drawShadow(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillStyle = '#140c1c'; g.fillRect(x - 9, y - 6, 18, 8); g.fillStyle = this.next < 0.5 && Math.floor(this.t * 12) % 2 ? '#ffd84a' : '#3a3040'; g.fillRect(x - 7, y - 4, 14, 4); }
    draw() {}
  }
  class Boulder extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'boulder', solid: false, sortBias: 2 }, o)); this.hitP = false; this.hitF = new Set(); }
    update(dt, Wd) {
      this.t += dt; this.y += this.vy * dt;
      const m = Wd.map, tx = Math.floor(this.x / TS), ty = Math.floor((this.y + 6) / TS);
      if (m.T(tx, ty) === T.WALL || this.t > 6) { this.dead = true; G.fx.shards(this.x, this.y - 4, 8, '#8a7a6a'); G.fx.dust(this.x, this.y, 5); sfx('rock'); return; }
      const p = Wd.player;
      if (p && !this.hitP && !p.jz && U.dist(p.x, p.y - 4, this.x, this.y - 4) < 12) { if (C.hurtPlayer(p, this.dmg, { x: this.x, y: this.y - 10 }, {})) this.hitP = true; }
      for (const e of C.foes()) if (!e.boss && !this.hitF.has(e) && U.dist(e.x, e.y - 4, this.x, this.y - 4) < 14) { this.hitF.add(e); C.damage(e, this.fdmg, { src: 'rule', kx: 0, ky: 1, power: 1.4, stun: 0.6 }); }
    }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy), 8, 3, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy) - 8, a = this.t * 8;
      g.fillStyle = '#3a3038'; g.beginPath(); g.arc(x, y, 8, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#7a6a64'; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#9a8a80'; g.beginPath(); g.arc(x - 2, y - 2, 3, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#4a3a40'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); g.lineTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6); g.stroke();
    }
  }
  /** 흐르는 바닥: 위에 선 것을 한쪽으로 나른다 */
  class Belt extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'belt', solid: false, sortBias: -60 }, o)); }
    inside(x, y) { return x > this.tx * TS && x < (this.tx + this.w) * TS && y > this.ty * TS && y < (this.ty + this.h) * TS; }
    update(dt, Wd) {
      this.t += dt;
      const m = Wd.map, p = Wd.player, [dx, dy] = this.dir, v = this.speed;
      if (p && !p.jz && !p.noClip && !['hook', 'fall', 'dead', 'jump'].includes(p.state) && this.inside(p.x, p.y - 2)) E.move(m, p, dx * v * dt, dy * v * dt);
      for (const e of C.foes()) if (!e.boss && !e.fly && this.inside(e.x, e.y - 2)) E.move(m, e, dx * v * dt, dy * v * dt);
    }
    drawShadow(g, cx, cy) {
      const x0 = this.tx * TS - cx, y0 = this.ty * TS - cy, w = this.w * TS, h = this.h * TS, [dx, dy] = this.dir;
      g.fillStyle = 'rgba(20,16,28,0.55)'; g.fillRect(x0, y0, w, h);
      g.strokeStyle = 'rgba(255,224,140,0.55)'; g.lineWidth = 1;
      const off = (this.t * this.speed) % 8;
      g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
      if (dy) for (let yy = -8; yy < h + 8; yy += 8) { const Y = y0 + yy + off * dy; for (let xx = 4; xx < w; xx += 16) { g.beginPath(); g.moveTo(x0 + xx, Y); g.lineTo(x0 + xx + 4, Y + 3 * dy); g.lineTo(x0 + xx + 8, Y); g.stroke(); } }
      else for (let xx = -8; xx < w + 8; xx += 8) { const X0 = x0 + xx + off * dx; for (let yy = 4; yy < h; yy += 16) { g.beginPath(); g.moveTo(X0, y0 + yy); g.lineTo(X0 + 3 * dx, y0 + yy + 4); g.lineTo(X0, y0 + yy + 8); g.stroke(); } }
      g.restore();
    }
    draw() {}
  }
  /** 시간 경주: 발판을 밟으면 문이 열리고, 시간이 다하면 닫힌다. 건너가면 영영 열림 */
  class Race extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'race', solid: false, sortBias: 9000 }, o)); this.left = 0; this.run = false; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player; if (!p) return;
      this.x = p.x; this.y = p.y;
      if (flag(this.flag + ':ok')) { if (!flag(this.flag)) setFlag(this.flag); return; }
      const pl = this.plate;
      if (!this.run && pl && pl.down) { this.run = true; this.left = this.T; setFlag(this.flag); sfx('door'); G.ui.toast('문이 열렸다 — ' + this.T + '초!', 'gold'); }
      if (!this.run) return;
      const r = roomAt(Wd.map, p.x, p.y);
      if (r && r.k === this.next) { this.run = false; setFlag(this.flag + ':ok'); sfx('puzzle'); G.ui.toast('해냈다! 문은 이제 열려 있다', 'good'); return; }
      if (G.script.running) return;
      this.left -= dt;
      if (this.left <= 0) {
        // 문 칸 위에 서 있으면 비킬 때까지 기다린다 (문에 끼지 않게)
        if (this.door && Math.abs(p.x - this.door[0]) < 26 && Math.abs(p.y - this.door[1]) < 26) return;
        this.run = false; setFlag(this.flag, false); if (pl) pl.down = false; sfx('block'); G.ui.toast('문이 닫혔다 — 발판을 다시 밟아라', 'bad');
      }
    }
    draw(g, cx, cy) {
      if (!this.run) return;
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy) - 34;
      const n = Math.ceil(this.left);
      g.font = "8px 'Galmuri11', monospace"; g.textAlign = 'center';
      g.fillStyle = 'rgba(11,9,20,0.7)'; g.fillRect(x - 9, y - 8, 18, 11);
      g.fillStyle = n <= 2 ? '#ff6a7a' : '#ffe066'; g.fillText(String(n), x, y + 1); g.textAlign = 'left';
    }
  }
  /** 공명 수정: 가락대로 친다 */
  const NOTE = [{ g: '해', c: '#ffb84a' }, { g: '달', c: '#d8e0ff' }, { g: '별', c: '#fff4a8' }, { g: '물', c: '#6ab8ff' }];
  class Chime extends PR.Prop {
    constructor(o) { super(Object.assign({ bw: 10, bh: 6, shadowW: 5 }, o)); this.cool = 0; this.flashT = 0; }
    ring() {
      if (this.cool > 0) return; this.cool = 0.35; this.flashT = 0.4;
      const st = this.st, nt = NOTE[this.n];
      G.fx.ring(this.x, this.y - 12, nt.c, 14, 0.35, 2); sfx('crystal');
      if (flag(st.flag)) return;
      if (st.seq[st.pos] === this.n) {
        st.pos++;
        G.fx.float(this.x, this.y - 30, nt.g + ' (' + st.pos + '/' + st.seq.length + ')', nt.c, { life: 0.6 });
        if (st.pos >= st.seq.length) { setFlag(st.flag); sfx('puzzle'); G.ui.toast('가락이 맞았다 — 수정이 함께 울린다', 'good'); }
      } else {
        st.pos = 0; sfx('buzz'); W().shake(2, 0.2); G.ui.toast('가락이 어긋났다 — 처음부터', 'bad');
        const r = W().map.rooms[this.room];
        if (st.punish && r && r.ctl && (st.wrong = (st.wrong || 0) + 1) <= 2) r.ctl.spawnList(st.punish, W());
      }
    }
    swordHit() { this.ring(); }
    shotHit(sh) { if (sh.owner === 'foe') return false; this.ring(); return true; }
    bombed() { this.ring(); }
    update(dt) { this.t += dt; if (this.cool > 0) this.cool -= dt; if (this.flashT > 0) this.flashT -= dt; }
    draw(g, cx, cy) {
      const nt = NOTE[this.n], on = this.flashT > 0 || flag(this.st.flag);
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      g.fillStyle = '#3a3448'; g.fillRect(x - 5, y - 6, 10, 6);
      const r = X.ramp(nt.c, 5);
      for (let k = 0; k < 14; k++) { const w2 = k < 7 ? k : 13 - k; g.fillStyle = on ? r[3] : r[1]; g.fillRect(x - Math.ceil(w2 / 1.6), y - 7 - k, Math.ceil(w2 / 1.6) * 2 + 1, 1); }
      g.fillStyle = on ? '#ffffff' : r[2]; g.fillRect(x - 1, y - 18, 1, 8);
      if (on) { g.globalAlpha = 0.3; g.fillStyle = nt.c; g.beginPath(); g.arc(x, y - 13, 11, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      g.font = "8px 'Galmuri11', monospace"; g.textAlign = 'center'; g.fillStyle = 'rgba(11,9,20,0.7)'; g.fillRect(x - 5, y + 1, 10, 9); g.fillStyle = nt.c; g.fillText(nt.g, x, y + 9); g.textAlign = 'left';
    }
  }
  const X = G.gfx;

  /* ═════════ 방 짓기 ═════════ */
  const NAME = { sigil: '인장의 방', ward: '내성 투기장', jets: '불기둥 회랑', boulder: '굴러오는 바위', dark: '어둠의 방', race: '시간 경주', belt: '흐르는 바닥', chime: '공명 수정', vault: '별관의 수호자' };
  const fn = (x, y, f) => ['fn', x, y, { fn: f }];
  const SPOTS = [[5, 5], [14, 5], [5, 10], [14, 10], [12, 4], [7, 11], [12, 11], [7, 4]];
  function foesFor(ctx, n, off) { const r = ctx.rnd; const out = []; for (let j = 0; j < n; j++) { const sp = SPOTS[(j + (off || 0)) % SPOTS.length]; out.push([ctx.pool[Math.floor(r() * ctx.pool.length)], sp[0], sp[1]]); } return out; }
  /** 들어온 쪽의 반대편 구석 (발판 · 목표 자리) */
  function farCorner(ctx) { const s = ctx.inSide; return s === 'R' ? [2, 4] : s === 'B' ? [17, 3] : s === 'T' ? [17, 11] : [17, 4]; }
  function nearCorner(ctx) { const s = ctx.inSide; return s === 'R' ? [16, 4] : s === 'B' ? [6, 11] : s === 'T' ? [6, 3] : [3, 4]; }
  const B = {
    sigil(ctx) {
      const ws = ctx.wset.slice(0, 3), timer = ctx.tier >= 5 ? 8 : 0, grp = ctx.flag;
      const at = [[4, 4], [15, 4], [15, 11], [4, 11]];
      const props = ws.map((w, j) => fn(at[j][0], at[j][1], (x, y, Wd) => { const e = new Sigil({ x, y, w, group: grp, timer }); e.room = ctx.k; return Wd.add(e); }));
      // 같은 무기 인장이 하나뿐인 방(검만 있는 던전)은 둘
      if (ws.length < 2) props.push(fn(at[1][0], at[1][1], (x, y, Wd) => { const e = new Sigil({ x, y, w: ws[0], group: grp, timer }); e.room = ctx.k; return Wd.add(e); }));
      props.push(['sign', 12, 3, { text: '「검은 검으로, 활은 활로, 마법은 날아가는 주문으로. 인장은 제 무기만 안다.」' + (timer ? '\n(' + timer + '초 안에 모두 깨워야 한다)' : '') }]);
      props.push(['pot', 4, 7], ['pot', 15, 8]);
      return { shape: 'round', props, foes: foesFor(ctx, 2 + Math.floor(ctx.tier / 4), 4), solve: { type: 'flag', flag: grp, msg: '인장의 문이 열린다' } };
    },
    ward(ctx) {
      const ws = ctx.wset, nW = 2 + (ctx.tier >= 6 ? 1 : 0), waves = [];
      for (let j = 0; j < nW; j++) {
        const w = ws.length > 1 ? ws[j % ws.length] : false, cnt = 2 + Math.floor(ctx.tier / 4) + (j === nW - 1 ? 1 : 0);
        const list = foesFor(ctx, cnt, j * 3).map((f) => [f[0], f[1], f[2], { ward: w }]);
        if (j === nW - 1) list[0][3] = { ward: ws.length > 1 ? 'cycle' : false, elite: true };
        waves.push(list);
      }
      return { shape: 'hall', waves, props: [['sign', 13, 3, { text: '「무기 하나로는 이 방을 나갈 수 없다.」 — 머리 위 표식의 무기는 튕긴다' }], ['pot', 2, 3], ['pot', 17, 12]], solve: { type: 'waves', flag: ctx.flag, msg: '투기장의 문이 열린다' } };
    },
    jets(ctx) {
      const period = Math.max(1.7, 2.6 - ctx.tier * 0.07), dmg = 2 + Math.floor(ctx.tier / 3), fdmg = 4 + ctx.tier * 2;
      const props = [4, 7, 12, 15].map((cx2, j) => fn(cx2, 2, (x, y, Wd) => Wd.add(new Jet({ x: cx2 * TS + 8 + ctx.x0 * TS, y: (ctx.y0 + 8) * TS, tx: ctx.x0 + cx2, ty: ctx.y0 + 2, len: 11, period, onK: 0.38, phase: j * period * 0.27, dmg, fdmg }))));
      const [px, py] = farCorner(ctx);
      props.push(['plate', px, py, { sets: ctx.flag, hold: false }], ['sign', 13, 3, { text: '「불길은 숨을 쉰다. 숨을 고를 때 건너라.」 — 건너편 발판' }], ['pot', 2, 12], ['pot', 17, 12]);
      return { shape: 'rect', props, foes: foesFor(ctx, 1 + Math.floor(ctx.tier / 4), 2), solve: { type: 'flag', flag: ctx.flag, msg: '불길 너머의 문이 열린다' } };
    },
    boulder(ctx) {
      const period = Math.max(1.6, 2.4 - ctx.tier * 0.06), dmg = 2 + Math.floor(ctx.tier / 3), fdmg = 6 + ctx.tier * 3, speed = 95 + ctx.tier * 4;
      const props = [5, 8, 11, 14].map((cx2, j) => fn(cx2, 2, (x, y, Wd) => { const e = new Chute({ x: (ctx.x0 + cx2) * TS + 8, y: (ctx.y0 + 2) * TS + 4, period, phase: 0.4 + j * period * 0.31, dmg, fdmg, speed }); e.room = ctx.k; return Wd.add(e); }));
      const [px, py] = farCorner(ctx);
      props.push(['plate', px, py, { sets: ctx.flag, hold: false }], ['sign', 13, 3, { text: '「바위는 길을 고르지 않는다. 네가 골라라.」 — 건너편 발판' }], ['pot', 2, 12]);
      return { shape: 'rect', props, foes: foesFor(ctx, 1 + Math.floor(ctx.tier / 3), 1), solve: { type: 'flag', flag: ctx.flag, msg: '바위 너머의 문이 열린다' } };
    },
    dark(ctx) {
      const props = [['torch', 4, 4], ['torch', 15, 4], ['torch', 15, 11], ['sign', 6, 11, { text: '「불을 가진 자만 이 방을 본다.」 — 횃불 셋 (불 마법)' }]];
      return { shape: 'cavern', rock: 0.35, dark: 0.95, props, foes: foesFor(ctx, 2 + Math.floor(ctx.tier / 3), 5), solve: { type: 'torches', flag: ctx.flag, msg: '횃불이 모두 타올랐다' } };
    },
    race(ctx) {
      const T0 = Math.max(5, Math.round(8 - ctx.tier * 0.25)), [px, py] = nearCorner(ctx);
      const vert = ctx.inSide === 'T' || ctx.inSide === 'B' || ctx.outSide === 'T' || ctx.outSide === 'B';
      const props = [];
      let plate = null;
      props.push(fn(px, py, (x, y, Wd) => { plate = Wd.add(new PR.Plate({ x, y: y + 4, sets: ctx.flag + ':p', hold: false })); plate.room = ctx.k; return plate; }));
      props.push(fn(px, py, (x, y, Wd) => { const e = Wd.add(new Race({ flag: ctx.flag, T: T0, next: ctx.nextK, door: ctx.door, x, y })); e.plate = plate; if (plate) plate.down = false; S().flags[ctx.flag + ':p'] = false; return e; }));
      if (vert) props.push(['spikes', 3, 5, { w: 14, h: 1, period: 1.5 }], ['spikes', 3, 10, { w: 14, h: 1, period: 1.5, phase: 0.75 }]);
      else props.push(['spikes', 6, 3, { w: 1, h: 10, period: 1.5 }], ['spikes', 13, 3, { w: 1, h: 10, period: 1.5, phase: 0.75 }]);
      props.push(['crumble', 8, 7, { w: 4, h: 2 }], ['sign', 15, 3, { text: '「문은 오래 기다리지 않는다.」 — 발판을 밟으면 ' + T0 + '초' }]);
      return { shape: 'rect', props, foes: ctx.tier >= 4 ? foesFor(ctx, 1, 6) : [], solve: { type: 'flag', flag: ctx.flag, msg: '문이 열렸다 — 달려라!' } };
    },
    belt(ctx) {
      const v = 34 + ctx.tier * 2;
      const props = [
        fn(3, 3, (x, y, Wd) => Wd.add(new Belt({ x: (ctx.x0 + 4) * TS, y: (ctx.y0 + 7) * TS, tx: ctx.x0 + 3, ty: ctx.y0 + 3, w: 3, h: 8, dir: [0, 1], speed: v }))),
        fn(14, 4, (x, y, Wd) => Wd.add(new Belt({ x: (ctx.x0 + 15) * TS, y: (ctx.y0 + 8) * TS, tx: ctx.x0 + 14, ty: ctx.y0 + 4, w: 3, h: 8, dir: [0, -1], speed: v }))),
        fn(7, 7, (x, y, Wd) => Wd.add(new Belt({ x: (ctx.x0 + 9) * TS, y: (ctx.y0 + 8) * TS, tx: ctx.x0 + 7, ty: ctx.y0 + 6, w: 6, h: 4, dir: [ctx.inSide === 'R' ? 1 : -1, 0], speed: v * 0.8 }))),
        ['spikes', 3, 11, { w: 3, h: 1, period: 1.3 }], ['spikes', 14, 2, { w: 3, h: 1, period: 1.3, phase: 0.6 }],
        ['sign', 12, 12, { text: '「바닥이 너를 데려가는 곳이 늘 좋은 곳은 아니다.」' }],
      ];
      return { shape: 'rect', props, foes: foesFor(ctx, 3 + Math.floor(ctx.tier / 3), 0), solve: { type: 'clear', flag: ctx.flag, msg: '바닥이 멈췄다 — 문이 열린다' } };
    },
    chime(ctx) {
      const r = ctx.rnd, len = Math.min(7, 4 + Math.floor(ctx.tier / 3)), seq = [];
      while (seq.length < len) { const n = Math.floor(r() * 4); if (n !== seq[seq.length - 1]) seq.push(n); }
      const st = { seq, pos: 0, flag: ctx.flag, punish: foesFor(ctx, 2, 3) };
      const at = [[4, 4], [15, 4], [4, 11], [15, 11]];
      const props = at.map(([x2, y2], n) => fn(x2, y2, (x, y, Wd) => { const e = new Chime({ x, y, n, st }); e.room = ctx.k; return Wd.add(e); }));
      props.push(['sign', 12, 3, { text: '수정의 가락: ' + seq.map((n) => NOTE[n].g).join(' → ') + '\n「들은 차례대로 쳐라. 칼이든 화살이든 주문이든. 틀리면 처음부터.」' }]);
      return { shape: 'round', props, foes: ctx.tier >= 3 ? foesFor(ctx, 1 + Math.floor(ctx.tier / 5), 6) : [], solve: { type: 'flag', flag: ctx.flag, msg: '수정이 함께 울린다 — 문이 열린다' } };
    },
    vault(ctx) {
      const strong = ctx.pool[ctx.pool.length - 1], foes = [[strong, 9, 5, { elite: true, ward: ctx.wset.length > 1 ? 'cycle' : false }]];
      if (ctx.tier >= 6) foes.push([ctx.pool[Math.floor(ctx.rnd() * ctx.pool.length)], 5, 9, { elite: true, ward: ctx.wset.length > 1 ? 'auto' : false }]);
      foes.push(...foesFor(ctx, 1 + Math.floor(ctx.tier / 3), 2));
      const props = [['chest', 13, 4, { item: ctx.reward, big: true, hidden: ctx.flag, col: '#e8c048' }], ['chest', 6, 4, { item: ctx.tier >= 5 ? 'potion_g' : 'potion_r', hidden: ctx.flag }], ['torch', 4, 9, { lit: true }], ['torch', 15, 9, { lit: true }]];
      props.push(['sign', 12, 12, { text: '「별관의 수호자 — 머리 위 표식이 바뀐다. 무기도 따라 바꿔라.」' }]);
      return { shape: 'round', props, foes, solve: { type: 'clear', flag: ctx.flag, msg: '수호자가 쓰러졌다 — 별관의 보물' + (ctx.mandatory ? ' · 깊은 구역 계단이 열린다' : '') } };
    },
  };

  /* ═════════ 던전마다 ═════════ */
  const WSET = { d1: ['sword'], d2: ['sword', 'bow'], hl_green: ['sword'], hl_red: ['sword', 'bow'] };
  const THEME = {
    d1: ['jets', 'boulder', 'race'], d2: ['sigil', 'boulder', 'race', 'ward'], d3: ['chime', 'race', 'ward', 'belt', 'dark'], d4: ['sigil', 'jets', 'chime', 'race', 'dark'],
    d5: ['chime', 'sigil', 'ward', 'dark', 'race'], d6: ['sigil', 'race', 'boulder', 'ward', 'belt'], d7: ['dark', 'ward', 'boulder', 'chime', 'sigil'],
    d8: ['dark', 'sigil', 'boulder', 'ward', 'jets', 'chime'], d9: ['ward', 'sigil', 'chime', 'jets', 'race', 'dark'], d11: ['belt', 'jets', 'sigil', 'ward', 'race', 'chime', 'boulder'],
    d12: ['chime', 'race', 'sigil', 'ward'], d13: ['dark', 'chime', 'ward', 'belt', 'sigil'], d14: ['ward', 'sigil', 'race', 'jets', 'chime', 'boulder'], d15: ['dark', 'ward', 'sigil', 'chime', 'boulder', 'race'],
    sec_crater: ['sigil', 'boulder', 'chime', 'race'], sec_origin: ['ward', 'jets', 'chime', 'race', 'belt'],
    hl_green: ['jets', 'race'], hl_red: ['boulder', 'sigil'], hl_blue: ['belt', 'chime'], hl_yellow: ['jets', 'sigil'], hl_amber: ['chime', 'race'], hl_purple: ['sigil', 'chime'],
    hl_white: ['dark', 'boulder', 'ward'], hl_mist: ['dark', 'chime', 'race'], hl_gray: ['jets', 'belt', 'ward'], hl_black: ['dark', 'ward', 'sigil'],
  };
  const FIRST_OK = new Set(['sigil', 'ward', 'chime', 'dark', 'belt']);   // 계단으로 들어서는 첫 방 (들어오는 자리를 모른다)
  const SKIP_FOE = new Set(['mino', 'dummy', 'turret']);
  // 상 · 위험도에 맞는 장비 (가게에 있는 것, 겹치지 않게)
  const used = new Set();
  function reward(did, tier) {
    const want = tier <= 1 ? 2 : tier <= 4 ? 3 : tier <= 7 ? 4 : 5;
    for (let g = want; g >= 2; g--) {
      const c = Object.keys(D.ITEMS).filter((id) => { const it = D.ITEMS[id]; return ['sword', 'bow', 'focus', 'armor', 'acc'].includes(it.type) && (it.grade || 1) === g && it.price > 0 && !used.has(id); }).sort();
      if (c.length) { const id = c[U.hash('wing:' + did) % c.length]; used.add(id); return id; }
    }
    return 'potion_g';
  }
  function poolOf(Dn) {
    const seen = [];
    for (const R of Object.values(Dn.rooms)) {
      if ((R.props || []).some((pr) => pr[0] === 'boss')) continue;
      for (const f of (R.foes || []).concat(...(R.waves || []))) if (f && f[0] && !SKIP_FOE.has(f[0]) && !seen.includes(f[0]) && G.foes.T[f[0]]) seen.push(f[0]);
    }
    if (!seen.length) seen.push('slime');
    // 센 놈을 뒤로 (수호자): 체력 큰 차례
    return seen.sort((a, b) => (G.foes.T[a].hp || 1) - (G.foes.T[b].hp || 1));
  }

  function wing(did, opt) {
    const Dn = DUN[did]; if (!Dn) return;
    const tier = Dn.tier || 0, keys = Object.keys(Dn.rooms);
    const P = (k) => (Dn.pos && Dn.pos[k]) || k.split(',').map(Number);
    const maxY = Math.max(...keys.map((k) => P(k)[1]));
    Dn.pos = Dn.pos || {}; Dn.doors = Dn.doors || []; Dn.floors = Dn.floors || {};
    const n = opt.n, cols = n <= 4 ? n : Math.ceil(n / 2);
    const at = []; for (let i = 0; i < n; i++) { const row = Math.floor(i / cols), c = i % cols; at.push([row % 2 ? cols - 1 - c : c, maxY + 1 + row]); }
    const side = (a, b) => (b[0] > a[0] ? 'R' : b[0] < a[0] ? 'L' : b[1] > a[1] ? 'B' : 'T');
    const opp = { R: 'L', L: 'R', T: 'B', B: 'T' };
    const rnd = U.rng(U.hash('wing:' + did));
    // 방 차례: 테마를 섞고, 첫 방은 자리를 가리지 않는 장치로, 마지막은 수호자
    const theme = (THEME[did] || ['ward', 'sigil', 'chime']).slice();
    for (let i = theme.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [theme[i], theme[j]] = [theme[j], theme[i]]; }
    const types = [];
    for (let i = 0; i < n - 1; i++) types.push(theme[i % theme.length]);
    if (types.length && !FIRST_OK.has(types[0])) { const j = types.findIndex((t) => FIRST_OK.has(t)); if (j > 0) [types[0], types[j]] = [types[j], types[0]]; else types[0] = 'ward'; }
    const ws = WSET[did] || ['sword', 'bow', 'magic'];
    for (let i = 0; i < types.length; i++) {
      if (types[i] === 'dark' && !ws.includes('magic')) types[i] = i === 0 ? 'ward' : 'boulder';
      if (types[i] === 'sigil' && ws.length < 2 && i > 0) types[i] = 'jets';
    }
    types.push('vault');
    const pool = poolOf(Dn), K = (i) => 'x' + i;
    const finalFlag = did + ':wing';
    const RW = Dn.rw || 20, RH = Dn.rh || 14;
    for (let i = 0; i < n; i++) {
      const k = K(i), type = types[i];
      const inSide = i === 0 ? 'S' : opp[side(at[i - 1], at[i])], outSide = i < n - 1 ? side(at[i], at[i + 1]) : null;
      let door = null;
      if (outSide) { const [ax, ay] = at[i], [bx, by] = at[i + 1]; door = ay === by ? [Math.max(ax, bx) * RW * TS, (ay * RH + (RH >> 1)) * TS + 8] : [(ax * RW + (RW >> 1)) * TS, Math.max(ay, by) * RH * TS]; }
      const ctx = { did, k, i, n, tier, pool, rnd, wset: ws, inSide, outSide, nextK: i < n - 1 ? K(i + 1) : null, door, x0: at[i][0] * RW, y0: at[i][1] * RH, flag: type === 'vault' ? finalFlag : did + ':x' + i, mandatory: !!opt.mandatory, reward: type === 'vault' ? reward(did, tier) : null };
      const R = B[type](ctx);
      R.wing = type;
      Dn.rooms[k] = R; Dn.pos[k] = at[i];
      Dn.floors[k] = '별관 · ' + NAME[type];
      if (i < n - 1) Dn.doors.push([k, K(i + 1), R.solve && R.solve.flag ? 'switch' : 'open', R.solve && R.solve.flag]);
    }
    // 잇기: 깊은 구역으로 가던 계단을 별관 끝으로 옮기고, 원래 자리에서 별관으로
    const deep = opt.mandatory ? Dn.doors.find((d) => !String(d[0]).startsWith('w_') && !String(d[0]).startsWith('x') && String(d[1]).startsWith('w_')) : null;
    const host = deep ? deep[0] : opt.host || (Dn.start ? Dn.start[0] : keys[0]);
    if (deep) { deep[0] = K(n - 1); deep[2] = 'switch'; deep[3] = finalFlag; }
    Dn.doors.push([host, K(0), 'open']);
    Dn.wingRooms = n; Dn.wingMandatory = !!deep;
    // 첫 방에 들어서면 한 번 알린다
    const R0 = Dn.rooms[K(0)], enter0 = R0.onEnter;
    R0.onEnter = function (ctl, Wd) { if (enter0) enter0.apply(this, arguments); G.ui.toast('별관 — 위험도 ★' + tier + ': 방 ' + n + '개' + (deep ? ' · 수호자를 넘어야 깊은 구역으로' : ' (곁가지)'), 'gold'); };
  }
  for (const did of Object.keys(THEME)) {
    const Dn = DUN[did]; if (!Dn) continue;
    const t = Dn.tier || 0;
    if (/^d\d+$/.test(did)) wing(did, { n: 2 + Math.round(t * 0.5), mandatory: true });
    else if (did.startsWith('hl_')) wing(did, { n: 1 + Math.floor(t / 3) });
    else wing(did, { n: 2 + Math.floor(t / 3) });
  }

  G.wings = { Sigil, Jet, Chute, Boulder, Belt, Race, Chime, NAME, THEME };
})();
