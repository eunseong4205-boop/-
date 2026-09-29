/* 보스: 커다란 도트 · 두 단계(절반 체력에서 격해진다) · 약점을 찾아야 쓰러진다.
   가시덩굴 여왕 · 황금 두더지왕 · 불도롱뇽 · 새끼 크라켄 · 스핑크스 · 거울 속 나 · 폭풍새 · 서리 거인 · 빈 왕
   · 그림자 녹턴 · 방위 핵 · 그라우스 · 카시안 · 카이론 · 흑점 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, E = G.ent, TL = G.tiles;
  const TS = TL.TS;
  const W = () => G.world;
  const C = () => G.combat;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const R = (c) => X.ramp(c, 5);
  const OUT = '#140c1c';

  const B = {};
  const def = (id, o) => { B[id] = Object.assign({ id, hp: 60, atk: 4, r: 16, h: 32, speed: 40, weight: 99, exp: 120, gold: 60 }, o); };

  /* ───────── 그림 도우미 ───────── */
  const AC = new Map();
  function art(key, w, h, f) { let c = AC.get(key); if (!c) { const b = X.brush(w, h); f(b); c = X.outline(b.put(), OUT); AC.set(key, c); } return c; }

  /* ───────── 보스 몸 ───────── */
  class Boss extends G.foes.Foe {
    constructor(type, o) {
      const D = B[type];
      super('slime', Object.assign({}, o));
      Object.assign(this, { type, D, name: D.name, title: D.title || D.name, boss: true, ai: 'boss', r: D.r, h: D.h, weight: D.weight, fly: !!D.fly, weak: D.weak, resist: D.resist, undead: D.undead, dark: D.dark, look: D.look ? Object.assign({}, D.look) : null });
      this.maxHp = this.hp = Math.round(D.hp * (o.hpMul || 1));
      this.atk = D.atk; this.exp = D.exp; this.gold = D.gold; this.speed = D.speed;
      this.st = 'wait'; this.stT = 0; this.phase2 = false; this.pat = 0; this.parts = [];
      this.phases = [0.5];
      this.noContact = !!D.noContact; this.col = D.col || '#ffffff';
      this.dir = 'down'; this.state = 'idle';
      if (D.init) D.init(this);
    }
    start() { if (this.st === 'wait') { this.set('idle'); this.aggro = true; } }
    update(dt, Wd) {
      this.t += dt; this.stT += dt;
      if (this.inv > 0) this.inv -= dt;
      if (this.flash > 0) this.flash -= dt;
      if (this.tele > 0) this.tele -= dt;
      if (this.hurtT > 0) this.hurtT -= dt;
      if (this.freezeT > 0) { this.freezeT -= dt; return; }
      if (this.stunT > 0) { this.stunT -= dt; this.vx = this.vy = 0; if (this.D.stunned) this.D.stunned(this, dt, Wd); return; }
      if (this.burnT > 0) { this.burnT -= dt; this.burnTick = (this.burnTick || 0) + dt; if (this.burnTick > 0.6) { this.burnTick = 0; this.hp -= 1; this.flash = 0.05; } }
      if (this.kx || this.ky) { E.move(Wd.map, this, this.kx * dt, this.ky * dt); this.kx = U.approach(this.kx, 0, 900 * dt); this.ky = U.approach(this.ky, 0, 900 * dt); }
      if (this.st === 'wait' || this.dead) return;
      if (!this.phase2 && this.hp <= this.maxHp * 0.5) { this.phase2 = true; this.enrage(); }
      this.D.ai(this, dt, Wd);
      this.walkT = (this.walkT || 0) + dt * (U.len(this.vx || 0, this.vy || 0) > 5 ? 1 : 0);
      const p = Wd.player;
      if (p && !this.noContact && p.state !== 'dead' && !this.dying) {
        if (U.dist(this.x, this.y - this.h / 2, p.x, p.y - 8) < this.r + 4 && (this.fly || Math.abs((p.z || 0) - (this.z || 0)) < 1 || p.onStairs)) C().hurtPlayer(p, this.atk, this, {});
      }
    }
    enrage() { sfx('growl'); W().shake(4, 0.5); G.fx.ring(this.x, this.y - this.h / 2, '#ff5a7a', 50, 0.6, 3); this.speed *= 1.3; if (this.D.phase2) this.D.phase2(this); if (G.ui) G.ui.toast(this.name + '이(가) 격노한다!'.replace('이(가)', U.josa(this.name, '이/가').slice(this.name.length)), 'bad'); }
    guards(info) { return this.D.guards ? this.D.guards(this, info) : false; }
    preKill(info) {
      if (this.dying) return true;
      if (this.duel) { this.hp = 1; this.stunT = 1; return true; }
      if (this.D.preKill && this.D.preKill(this, info)) return true;
      // 쓰러질 때 연출: 잠깐 버티며 폭발
      this.dying = true; this.hp = 0; this.noContact = true;
      for (const e of W().ents) if (e.foe && !e.boss && !e.dead && (e.minion || e.room === this.room)) e.dead = true;
      for (const e of W().ents) if (e.kind === 'shot' && e.owner !== 'player') e.dead = true;
      let t = 0;
      const self = this;
      W().add(new E.Ent({ kind: 'bossdie', solid: false, hidden: true, update(dt) {
        t += dt;
        if (Math.random() < dt * 14) { const x = self.x + (Math.random() - 0.5) * self.r * 2.4, y = self.y - Math.random() * self.h; G.fx.sparks(x, y, 10, '#ffe8a8', 120); G.fx.ring(x, y, '#ffffff', 16, 0.3, 2); sfx('explode'); W().shake(3, 0.1); }
        self.flash = 0.1;
        if (t > 1.8) { this.dead = true; self.dead = true; self.dying = false; G.fx.shards(self.x, self.y - 10, 60, self.col); G.cine.flash('#fff', 0.5); sfx('bossdie'); C().drops(self); if (self.onDieFn) self.onDieFn(self); if (G.audio) G.audio.jingle('bosswin'); if (self.did) G.state.flags[self.did + ':boss'] = true; }
      } }));
      W().slowmo(0.3, 1.2);
      return true;
    }
    img() { return this.D.art(this); }
    draw(g, cx, cy) {
      if (this.hidden) return;
      if (this.D.draw) { this.D.draw(this, g, cx, cy); return; }
      if (this.look) {
        this.onDraw = (gg, xx, yy) => { if (this.D.gear) this.D.gear(this, gg, xx, yy); };
        G.sprites.drawChar(g, this, cx, cy);
      } else {
        const im = this.img();
        const x = Math.round(this.x - cx - im.width / 2), y = Math.round(this.y - cy - im.height + 1 - (this.jz || 0) - (this.fly ? 8 + Math.sin(this.t * 3) * 3 : 0));
        const flip = this.D.flip && this.dirX < 0 ? X.flipX(im) : im;
        if (this.freezeT > 0) g.drawImage(X.tint(flip, '#bfe8ff', 0.6), x, y); else g.drawImage(flip, x, y);
        if (this.flash > 0) { g.globalAlpha = Math.min(1, this.flash * 8); g.drawImage(X.silhouette(flip, '#ffffff'), x, y); g.globalAlpha = 1; }
      }
      const ex = Math.round(this.x - cx), top = Math.round(this.y - cy - this.h - 10);
      if (this.tele > 0 && Math.floor(this.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(ex - 1, top - 8, 3, 6); g.fillRect(ex - 1, top, 3, 2); }
      if (this.stunT > 0) for (let i = 0; i < 4; i++) { const a = this.t * 5 + i * 1.6; g.fillStyle = '#ffe066'; g.fillRect(Math.round(ex + Math.cos(a) * 12), Math.round(top + 6 + Math.sin(a) * 3), 2, 2); }
      if (this.D.over) this.D.over(this, g, cx, cy);
    }
    drawShadow(g, cx, cy) {
      if (this.hidden || this.D.noShadow) return;
      const w = this.r * 1.1;
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), w, w * 0.35, 0, 0, Math.PI * 2); g.fill();
    }
  }
  /* 공통 동작 */
  const shoot = (o) => C().shoot(Object.assign({ owner: 'foe', r: 4, life: 2, blockable: true, blockLv: 1 }, o));
  const aim = (e, p, oy) => U.angle(p.x - e.x, p.y - 8 - (e.y - (oy || e.h / 2)));
  function ring(e, n, sp, o) { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (o && o.off || 0); shoot(Object.assign({ kind: 'orb', x: e.x, y: e.y - e.h / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: e.atk, col: e.col }, o || {})); } }
  function minion(e, type, x, y) { const m = G.foes.spawn(type, x, y, { tier: e.tier || 0 }); m.minion = true; m.aggro = true; m.room = e.room; G.fx.glow(x, y - 6, '#b8a8ff', 8); return m; }
  function roomRect(e) { const RW = G.dungeon.RW, RH = G.dungeon.RH; const m = W().map; const r = e.room && m.rooms ? m.rooms[e.room] : null; if (!r) return { x0: e.home.x - 140, y0: e.home.y - 90, x1: e.home.x + 140, y1: e.home.y + 70 }; return { x0: (r.x0 + 1.5) * TS, y0: (r.y0 + 2.5) * TS, x1: (r.x0 + RW - 1.5) * TS, y1: (r.y0 + RH - 1.5) * TS }; }
  const clampRoom = (e) => { const r = roomRect(e); e.x = U.clamp(e.x, r.x0, r.x1); e.y = U.clamp(e.y, r.y0, r.y1); };
  /** 선형 공격 경고: 바닥에 붉은 띠 */
  class Warn extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'warn', solid: false, life: 0.8 }, o)); }
    update(dt) { this.t += dt; if (this.t >= this.life) { this.dead = true; if (this.fire) this.fire(); } }
    drawShadow(g, cx, cy) {
      const k = this.t / this.life; g.globalAlpha = 0.25 + 0.35 * (Math.floor(this.t * 12) % 2);
      g.fillStyle = this.col || '#ff3a5a';
      if (this.circle) { g.beginPath(); g.ellipse(this.x - cx, this.y - cy, this.r * (0.4 + 0.6 * k), this.r * 0.5 * (0.4 + 0.6 * k), 0, 0, Math.PI * 2); g.fill(); }
      else g.fillRect(Math.round(this.x - cx), Math.round(this.y - cy), this.w, this.h);
      g.globalAlpha = 1;
    }
  }
  function warnRect(x, y, w, h, life, fire, col) { return W().add(new Warn({ x, y, w, h, life, fire, col })); }
  function warnCircle(x, y, r, life, fire, col) { return W().add(new Warn({ x, y, r, life, fire, circle: true, col })); }
  function hitRect(x, y, w, h, dmg, src) { const p = W().player; if (p && p.x > x && p.x < x + w && p.y > y && p.y < y + h + 6) C().hurtPlayer(p, dmg, src || { x: x + w / 2, y: y + h / 2 }, {}); }
  function hitCircle(x, y, r, dmg) { const p = W().player; if (p && U.dist(p.x, p.y, x, y) < r) C().hurtPlayer(p, dmg, { x, y }, {}); }

  /* ═════════════ 1. 가시덩굴 여왕 (뿌리굴) ═════════════
     꽃봉오리 몸은 움직이지 않는다. 덩굴이 줄을 따라 내리친다. 눈이 열렸을 때 화살 → 봉오리가 숙인다 → 벤다 */
  def('thornqueen', { name: '가시덩굴 여왕', title: '뿌리굴의 주인 · 가시덩굴 여왕', hp: 42, atk: 3, r: 18, h: 36, col: '#d84a6a', noContact: false, exp: 60, gold: 40,
    init(e) { e.eyeOpen = false; e.vulnerable = false; },
    guards(e, info) { if (info.src === 'arrow' || info.src === 'beam') { if (e.eyeOpen && !e.vulnerable) { e.vulnerable = true; e.stunT = 3.2; e.eyeOpen = false; sfx('shriek'); G.fx.sparks(e.x, e.y - 30, 14, '#ffe066'); G.ui.toast('봉오리가 고개를 숙였다 — 지금!', 'gold'); } return true; } if (!e.vulnerable || e.stunT <= 0) { sfx('clank'); return true; } return false; },
    stunned(e) { e.vulnerable = e.stunT > 0; },
    ai(e, dt, Wd) {
      const p = Wd.player; e.vulnerable = false;
      if (e.phase2) { e.x = e.home.x + Math.sin(e.t * 0.7) * 60; }
      if (e.st === 'idle' && e.stT > (e.phase2 ? 1 : 1.6)) { e.set(['lash', 'seed', 'eye'][e.pat++ % 3]); }
      if (e.st === 'lash' && e.stT < 0.01) {
        const n = e.phase2 ? 3 : 2;
        for (let i = 0; i < n; i++) { const x = p.x - 12 + (i - (n - 1) / 2) * 36; warnRect(x, e.y, 24, 150, 0.8, () => { hitRect(x, e.y, 24, 150, e.atk); W().shake(3, 0.2); sfx('impact'); for (let y = e.y; y < e.y + 150; y += 16) G.fx.leaves(x + 12, y, 2, '#3a8a3a'); }); }
      }
      if (e.st === 'lash' && e.stT > 1.1) e.set('idle');
      if (e.st === 'seed' && e.stT > 0.4 && !e.did) { e.did = true; for (let i = -2; i <= 2; i++) { const a = aim(e, p) + i * 0.25; shoot({ kind: 'rock', x: e.x, y: e.y - 20, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, dmg: e.atk, drawFn(g, x, y) { g.fillStyle = '#6a3a1a'; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = '#a8703a'; g.fillRect(x - 1, y - 2, 2, 1); } }); } sfx('foeshot'); if (e.phase2) minion(e, 'slime', e.x + (Math.random() < 0.5 ? -40 : 40), e.y + 30); }
      if (e.st === 'seed' && e.stT > 1) { e.set('idle'); e.did = false; }
      if (e.st === 'eye') { if (e.stT < 0.05) e.telegraph(0.4); e.eyeOpen = e.stT > 0.4 && e.stT < 2.4; if (e.stT > 2.6) { e.eyeOpen = false; e.set('idle'); } }
    },
    art(e) {
      const f = e.stunT > 0 ? 2 : e.eyeOpen ? 1 : 0;
      return art('tq' + f + (e.phase2 ? 1 : 0), 64, 56, (b) => {
        const r = R(e.phase2 ? '#c83a8a' : '#d84a6a'), gr = R('#3a8a3a');
        for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI; b.line(32, 44, 32 + Math.cos(a) * 30, 44 + Math.sin(a) * 18, gr[1]); b.line(32, 45, 32 + Math.cos(a) * 28, 45 + Math.sin(a) * 16, gr[2]); }
        b.ellipse(32, 50, 24, 6, gr[1]); for (let x = 10; x < 56; x += 6) b.ellipse(x, 50, 4, 3, gr[2]);
        const hy = f === 2 ? 34 : 24;
        b.ellipse(32, hy, 18, 16, r[1]); b.ellipse(32, hy - 2, 16, 13, r[2]); b.ellipse(26, hy - 7, 6, 5, r[3]);
        for (let a = 0; a < 5; a++) { const x = 32 + Math.cos(-Math.PI / 2 + (a - 2) * 0.5) * 16, y = hy - 12 + Math.abs(a - 2) * 3; b.ellipse(x, y, 4, 6, r[3]); }
        if (f === 1) { b.ellipse(32, hy + 1, 7, 6, '#fbf8ff'); b.ellipse(32, hy + 1, 4, 5, '#e8c048'); b.ellipse(32, hy + 1, 1.5, 4, OUT); b.px(30, hy - 2, '#ffffff'); }
        else if (f === 2) { b.line(26, hy + 1, 38, hy + 1, OUT); for (const x of [24, 40]) b.px(x, hy - 1, '#ffe066'); }
        else b.line(26, hy + 2, 38, hy + 2, r[0]);
        for (let i = 0; i < 8; i++) b.px(16 + i * 4, hy + 12 + (i % 2), '#fbf8ff');
      });
    } });

  /* ═════════════ 2. 황금 두더지왕 (황금 광산) ═════════════
     땅속을 파고 다니며 흙더미가 움직인다. 나와서 금덩이를 던진다. 흙더미 옆에 폭탄 → 튀어나와 기절 → 벤다 */
  def('moleking', { name: '황금 두더지왕', title: '광맥의 왕 · 황금 두더지왕', hp: 70, atk: 4, r: 18, h: 30, col: '#e8c048', exp: 110, gold: 120, speed: 60,
    init(e) { e.under = true; e.hidden = false; e.noContact = true; e.st = 'wait'; },
    guards(e, info) { if (e.under && info.el !== 'bomb') { return true; } if (e.under && info.el === 'bomb') { e.under = false; e.stunT = 3.5; e.set('stun'); sfx('shriek'); G.ui.toast('두더지왕이 튀어나와 뒹군다!', 'gold'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      const rr = roomRect(e);
      if (e.st === 'idle' || e.st === 'stun') { e.set('dig'); e.under = true; e.noContact = true; }
      if (e.st === 'dig') {
        e.toward(p.x, p.y, e.speed * (e.phase2 ? 1.4 : 1), dt); clampRoom(e);
        if (Math.random() < dt * 20) G.fx.dust(e.x, e.y, 1);
        if (e.stT > (e.phase2 ? 2.2 : 3)) { e.set('rise'); e.telegraph(0.5); }
      } else if (e.st === 'rise') {
        if (e.stT > 0.5) { e.under = false; e.noContact = false; e.set('throw'); W().shake(3, 0.2); G.fx.dust(e.x, e.y, 14); hitCircle(e.x, e.y, 20, e.atk); sfx('impact'); }
      } else if (e.st === 'throw') {
        if (e.stT > 0.3 && !e.did) { e.did = true; const n = e.phase2 ? 5 : 3; for (let i = 0; i < n; i++) { const a = aim(e, p, 16) + (i - (n - 1) / 2) * 0.3; shoot({ kind: 'rock', x: e.x, y: e.y - 16, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, dmg: e.atk, drawFn(g, x, y) { g.fillStyle = '#e8c048'; g.fillRect(x - 3, y - 2, 6, 4); g.fillStyle = '#fff0a8'; g.fillRect(x - 2, y - 2, 2, 1); } }); } sfx('throw'); }
        if (e.stT > 1.4) { e.did = false; e.set('idle'); if (e.phase2) { for (let i = 0; i < 3; i++) { const x = U.lerp(rr.x0, rr.x1, Math.random()); warnCircle(x, rr.y0 + Math.random() * (rr.y1 - rr.y0), 12, 1, function () { hitCircle(this.x, this.y, 14, 3); G.fx.shards(this.x, this.y, 8, '#8a7a6a'); sfx('rock'); }); } } }
      }
    },
    draw(e, g, cx, cy) {
      if (e.under) {
        const im = art('molemound', 30, 14, (b) => { b.ellipse(15, 10, 14, 5, '#8a6a4a'); b.ellipse(15, 8, 10, 4, '#a8886a'); for (let i = 0; i < 6; i++) b.px(4 + i * 4, 6 + (i % 2) * 2, '#6a4a3a'); });
        g.drawImage(im, Math.round(e.x - cx - 15), Math.round(e.y - cy - 12 + Math.sin(e.t * 20)));
        return;
      }
      const f = e.st === 'throw' && e.stT < 0.4 ? 1 : e.stunT > 0 ? 2 : 0;
      const im = art('mole' + f, 48, 44, (b) => {
        const r = R('#8a6a4a');
        b.ellipse(24, 30, 18, 14, r[1]); b.ellipse(24, 28, 16, 12, r[2]); b.ellipse(24, 34, 10, 7, '#e8c8a8');
        b.ellipse(24, 20, 10, 5, '#ffb8b0'); b.ellipse(24, 18, 4, 3, '#ff8a8a');
        if (f === 2) { b.line(14, 22, 18, 26, OUT); b.line(14, 26, 18, 22, OUT); b.line(30, 22, 34, 26, OUT); b.line(30, 26, 34, 22, OUT); } else { b.rect(14, 22, 4, 2, OUT); b.rect(30, 22, 4, 2, OUT); }
        // 광차 바퀴 왕관
        b.ellipse(24, 10, 11, 4, '#e8c048'); for (const x of [15, 20, 24, 28, 33]) b.rect(x - 1, 3, 3, 7, '#f0d060'); b.ellipse(24, 10, 4, 2, '#8a5a2a'); b.px(24, 5, '#ff4a6a');
        // 발톱
        const up = f === 1 ? -6 : 0;
        b.ellipse(8, 34 + up, 6, 4, '#e8d0b0'); b.ellipse(40, 34 + up, 6, 4, '#e8d0b0');
        for (let i = 0; i < 3; i++) { b.px(4 + i * 3, 36 + up, '#fff8e8'); b.px(38 + i * 3, 36 + up, '#fff8e8'); }
      });
      g.drawImage(im, Math.round(e.x - cx - 24), Math.round(e.y - cy - 44));
      if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8); g.drawImage(X.silhouette(im, '#ffffff'), Math.round(e.x - cx - 24), Math.round(e.y - cy - 44)); g.globalAlpha = 1; }
      if (e.stunT > 0) for (let i = 0; i < 4; i++) { const a = e.t * 5 + i * 1.6; g.fillStyle = '#ffe066'; g.fillRect(Math.round(e.x - cx + Math.cos(a) * 14), Math.round(e.y - cy - 48 + Math.sin(a) * 3), 2, 2); }
    } });

  /* ═════════════ 3. 불도롱뇽 (화산) — 얼음이 약점 ═════════════ */
  def('salamander', { name: '불도롱뇽', title: '화산의 심장 · 불도롱뇽', hp: 90, atk: 5, r: 18, h: 26, col: '#ff7a3a', weak: ['ice'], resist: ['fire'], exp: 150, gold: 120, speed: 70, flip: true,
    ai(e, dt, Wd) {
      const p = Wd.player; e.dirX = Math.sign(p.x - e.x) || e.dirX;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed * 0.5, dt); clampRoom(e); if (e.stT > 1.4) e.set(['charge', 'breath', 'lava'][e.pat++ % 3]); }
      if (e.st === 'charge') { if (e.stT < 0.02) { e.telegraph(0.6); e.cv = U.norm(p.x - e.x, p.y - e.y); } if (e.stT > 0.6) { const r = e.go(e.cv[0] * 260 * dt, e.cv[1] * 260 * dt); if (Math.random() < dt * 30) G.fx.sparks(e.x, e.y, 2, '#ff8a3a', 40); if (r.hitX || r.hitY || e.stT > 1.6) { if (r.hitX || r.hitY) { e.stunT = 1.2; W().shake(4, 0.3); sfx('impact'); } e.set('idle'); } } }
      if (e.st === 'breath') { if (e.stT < 0.02) e.telegraph(0.5); if (e.stT > 0.5 && e.stT < 1.6 && Math.random() < dt * 30) { const a = aim(e, p, 10) + (Math.random() - 0.5) * 0.6; shoot({ kind: 'fire', x: e.x + e.dirX * 14, y: e.y - 10, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dmg: e.atk - 1, r: 4, life: 0.7, blockLv: 2, el: 'fire', col: '#ff8a3a' }); sfx('fire'); } if (e.stT > 1.8) e.set('idle'); }
      if (e.st === 'lava') { if (e.stT < 0.02) { const n = e.phase2 ? 6 : 4; for (let i = 0; i < n; i++) { const x = p.x + (Math.random() - 0.5) * 120, y = p.y + (Math.random() - 0.5) * 80; warnCircle(x, y, 16, 1, () => { hitCircle(x, y, 16, e.atk); G.fx.sparks(x, y, 12, '#ff8a3a', 90); sfx('fire'); }, '#ff7a2a'); } } if (e.stT > 1.2) e.set('idle'); }
    },
    art(e) {
      const f = e.st === 'charge' && e.stT > 0.6 ? 2 : Math.floor((e.walkT || 0) * 6) % 2;
      return art('sal' + f + e.phase2, 56, 30, (b) => {
        const r = R(e.phase2 ? '#ff4a2a' : '#ff7a3a');
        const lg = f === 1 ? 2 : f === 2 ? 4 : 0;
        for (const [x, o] of [[14, lg], [22, -lg], [34, lg], [42, -lg]]) b.rect(x + o, 22, 4, 7, r[1]);
        b.ellipse(26, 18, 18, 8, r[1]); b.ellipse(26, 16, 16, 6, r[2]); for (let x = 12; x < 40; x += 4) b.ellipse(x, 11, 2, 2.5, '#ffd84a');
        b.line(8, 18, 0, 12, r[1]); b.line(8, 19, 1, 14, r[2]);
        b.ellipse(46, 16, 9, 7, r[2]); b.rect(50, 18, 6, 3, r[1]); b.rect(46, 12, 3, 3, '#ffe066'); b.px(47, 13, OUT);
        if (f === 2) b.rect(52, 19, 4, 2, '#ffe8a8');
      });
    }, flip: true });

  /* ═════════════ 4. 새끼 크라켄 (해저 동굴) — 다리를 먼저 ═════════════ */
  def('kraken', { name: '새끼 크라켄', title: '해저 동굴의 주인 · 새끼 크라켄', hp: 80, atk: 4, r: 22, h: 30, col: '#b87aff', exp: 160, gold: 100, noContact: true,
    init(e) { e.legs = []; e.subm = true; },
    guards(e) { if (e.subm) { sfx('splash'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      e.legs = e.legs.filter((l) => !l.dead);
      if (e.st === 'idle') {
        e.subm = true;
        if (e.legs.length === 0 && e.stT > 0.5) {
          const n = e.phase2 ? 4 : 3;
          for (let i = 0; i < n; i++) { const l = new Tentacle({ x: e.x + (i - (n - 1) / 2) * 44, y: e.y + 40 + (i % 2) * 20, boss: false, owner: e }); W().add(l); e.legs.push(l); }
          e.set('legs');
        }
      }
      if (e.st === 'legs') { if (e.legs.length === 0) { e.set('surface'); e.subm = false; sfx('splash'); G.fx.splash(e.x, e.y); W().shake(3, 0.3); } else if (e.stT > 3 && Math.random() < dt) { ring(e, e.phase2 ? 10 : 7, 90, { col: '#3a2a4a', kind: 'dark', blockLv: 1 }); sfx('foeshot'); e.stT = 0; } }
      if (e.st === 'surface') { if (e.stT > 3.5) { e.subm = true; e.set('idle'); ring(e, 8, 100, { col: '#8ad8ff', kind: 'orb' }); } }
    },
    draw(e, g, cx, cy) {
      const up = e.subm ? 18 : 0;
      const im = art('kraken' + (e.subm ? 1 : 0), 60, 44, (b) => {
        const r = R('#b87aff');
        b.ellipse(30, 22, 26, 22, r[1]); b.ellipse(30, 20, 24, 19, r[2]); b.ellipse(22, 12, 9, 7, r[3]);
        for (const [x, y] of [[40, 10], [44, 18], [18, 24]]) b.ellipse(x, y, 2, 2, r[1]);
        for (const x of [20, 40]) { b.ellipse(x, 28, 7, 6, '#ffffff'); b.ellipse(x, 29, 4, 5, '#3a1a4a'); b.px(x - 2, 26, '#ffffff'); }
      });
      const h = im.height - up;
      g.drawImage(im, 0, 0, im.width, h, Math.round(e.x - cx - 30), Math.round(e.y - cy - h), im.width, h);
      if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 8); g.drawImage(X.silhouette(im, '#ffffff'), 0, 0, im.width, h, Math.round(e.x - cx - 30), Math.round(e.y - cy - h), im.width, h); g.globalAlpha = 1; }
      g.fillStyle = 'rgba(200,230,255,0.5)'; g.fillRect(Math.round(e.x - cx - 32), Math.round(e.y - cy - 2), 64, 2);
    }, noShadow: true });
  class Tentacle extends G.foes.Foe {
    constructor(o) { super('slime', o); this.maxHp = this.hp = 14; this.r = 9; this.h = 30; this.atk = 4; this.weight = 99; this.noKnock = true; this.name = '크라켄 다리'; this.col = '#b87aff'; this.st = 'rise'; this.minion = true; this.exp = 4; }
    update(dt, Wd) {
      this.t += dt; this.stT += dt; if (this.inv > 0) this.inv -= dt; if (this.flash > 0) this.flash -= dt; if (this.hpShow > 0) this.hpShow -= dt; if (this.hurtT > 0) { this.hurtT -= dt; this.hpShow = 2; }
      this.kx = this.ky = 0;
      if (this.freezeT > 0) { this.freezeT -= dt; return; }
      if (this.stunT > 0) { this.stunT -= dt; return; }
      const p = Wd.player;
      if (this.st === 'rise' && this.stT > 0.6) this.set('sway');
      if (this.st === 'sway' && this.stT > 1.6) { this.set('slam'); this.telegraph(0.5); this.tx = p.x; this.ty = p.y; }
      if (this.st === 'slam' && this.stT > 0.5 && !this.hit) { this.hit = true; const [nx, ny] = U.norm(this.tx - this.x, this.ty - this.y); for (let k = 0; k < 5; k++) G.fx.splash(this.x + nx * k * 12, this.y + ny * k * 12); const px = p.x - this.x, py = p.y - this.y; const along = px * nx + py * ny, side = Math.abs(px * ny - py * nx); if (along > 0 && along < 70 && side < 12) C().hurtPlayer(p, this.atk, this, {}); sfx('impact'); W().shake(2, 0.2); }
      if (this.st === 'slam' && this.stT > 1.1) { this.hit = false; this.set('sway'); }
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      const k = this.st === 'rise' ? Math.min(1, this.stT / 0.6) : 1;
      const len = 30 * k;
      let ang = -Math.PI / 2 + Math.sin(this.t * 3) * 0.3;
      if (this.st === 'slam' && this.stT > 0.5) ang = U.angle(this.tx - this.x, this.ty - this.y);
      const L = this.st === 'slam' && this.stT > 0.5 ? 70 : len;
      g.lineCap = 'round';
      g.strokeStyle = OUT; g.lineWidth = 9; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(ang + 0.6) * L * 0.5, y + Math.sin(ang + 0.6) * L * 0.5, x + Math.cos(ang) * L, y + Math.sin(ang) * L); g.stroke();
      g.strokeStyle = this.flash > 0 ? '#ffffff' : this.freezeT > 0 ? '#bfe8ff' : '#b87aff'; g.lineWidth = 7; g.stroke();
      g.strokeStyle = '#e0c0ff'; g.lineWidth = 2; g.stroke();
      g.lineCap = 'butt';
      g.fillStyle = 'rgba(200,230,255,0.6)'; g.fillRect(x - 8, y - 1, 16, 2);
      if (this.tele > 0 && Math.floor(this.tele * 16) % 2 === 0) { g.fillStyle = '#ffe066'; g.fillRect(x - 1, y - 40, 3, 6); }
      if (this.hpShow > 0) { g.fillStyle = OUT; g.fillRect(x - 8, y - 44, 16, 3); g.fillStyle = '#ff4a5e'; g.fillRect(x - 7, y - 43, Math.round(14 * this.hp / this.maxHp), 1); }
    }
    drawShadow() {}
  }

  /* ═════════════ 5. 스핑크스 (태양 피라미드) — 눈빛은 거울 방패로 ═════════════ */
  def('sphinx', { name: '스핑크스', title: '태양 피라미드의 수호자 · 스핑크스', hp: 120, atk: 5, r: 22, h: 44, col: '#e8c860', exp: 220, gold: 200, speed: 30,
    guards(e, info) { if (info.refl) { e.stunT = 2.5; G.fx.sparks(e.x, e.y - 30, 16, '#ffe066'); sfx('crit'); return false; } if (e.st !== 'roar' && e.stunT <= 0) { if (info.src === 'sword') sfx('clank'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (e.st === 'idle') { if (e.stT > 1.2) e.set(['laser', 'paw', 'roar', 'worms'][e.pat++ % 4]); }
      if (e.st === 'laser') {
        if (e.stT < 0.02) e.telegraph(0.6);
        if (e.stT > 0.6 && e.stT < 2.6 && Math.floor(e.stT * 8) !== e.lastB) { e.lastB = Math.floor(e.stT * 8); const a = aim(e, p, 34) + Math.sin(e.stT * 3) * 0.3; shoot({ kind: 'beam', x: e.x, y: e.y - 34, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, dmg: e.atk, col: '#ff5a5a', blockable: true, reflectable: true, blockLv: 3, r: 3, life: 1.4, onHitFoe: null, src2: 'sphinx' }); sfx('beam'); }
        if (e.stT > 3) e.set('idle');
      }
      if (e.st === 'paw') { if (e.stT < 0.02) { e.telegraph(0.5); const x = p.x, y = p.y; warnCircle(x, y, 26, 0.7, () => { hitCircle(x, y, 26, e.atk + 1); W().shake(4, 0.3); G.fx.dust(x, y, 12); sfx('impact'); }); } if (e.stT > 1) e.set('idle'); }
      if (e.st === 'roar') { if (e.stT < 0.02) { sfx('growl'); W().shake(3, 0.8); G.ui.toast('이마의 보석이 드러났다!', 'gold'); } if (e.stT > 2.4) e.set('idle'); }
      if (e.st === 'worms') { if (e.stT < 0.02) { minion(e, 'worm', e.x - 60, e.y + 40); if (e.phase2) minion(e, 'worm', e.x + 60, e.y + 40); } if (e.stT > 1) e.set('idle'); }
    },
    art(e) {
      const f = e.st === 'roar' ? 1 : 0;
      return art('sph' + f, 72, 60, (b) => {
        const r = R('#d8b060');
        b.rect(6, 36, 60, 22, r[1]); b.rect(6, 36, 60, 5, r[3]);
        b.ellipse(14, 54, 10, 6, r[2]); b.ellipse(58, 54, 10, 6, r[2]); for (let i = 0; i < 4; i++) { b.px(6 + i * 3, 58, '#fff0c8'); b.px(52 + i * 3, 58, '#fff0c8'); }
        poly(b, [[18, 40], [36, 2], [54, 40]], '#3a5aa8'); for (let y = 8; y < 40; y += 5) b.hline(36 - (y - 2) * 0.47, 36 + (y - 2) * 0.47, y, '#e8c048');
        b.ellipse(36, 26, 11, 13, r[2]); b.ellipse(33, 22, 5, 5, r[3]);
        b.rect(28, 24, 5, 3, f ? '#ff5a5a' : OUT); b.rect(39, 24, 5, 3, f ? '#ff5a5a' : OUT);
        b.ellipse(36, 13, 4, 3, f ? '#ff4a6a' : '#8a3a2a'); if (f) b.px(35, 12, '#ffffff');
        if (f) { b.ellipse(36, 34, 5, 3, '#3a0a1a'); } else b.hline(32, 40, 34, r[0]);
      });
    } });
  function poly(b, pts, col) { let y0 = 1e9, y1 = -1e9; for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) { const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; const yy = y + 0.5; if ((ay <= yy && by > yy) || (by <= yy && ay > yy)) xs.push(ax + ((yy - ay) / (by - ay)) * (bx - ax)); } xs.sort((a, c) => a - c); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) b.px(x, y, col); } }

  /* ═════════════ 사람 보스 공통: 검객 ═════════════ */
  function swordsman(e, dt, Wd, o) {
    const p = Wd.player;
    const d = e.dist();
    e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir);
    if (e.st === 'idle') {
      e.state = 'walk';
      const want = o.keep || 34;
      const [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
      const side = Math.sin(e.t * 1.3) > 0 ? 1 : -1;
      const sp = e.speed;
      if (d > want + 10) e.go(nx * sp * dt, ny * sp * dt); else if (d < want - 10) e.go(-nx * sp * dt, -ny * sp * dt); else e.go(-ny * side * sp * 0.6 * dt, nx * side * sp * 0.6 * dt);
      e.vx = nx * sp; e.vy = ny * sp;
      clampRoom(e);
      if (e.stT > (e.phase2 ? o.cool2 || 0.8 : o.cool || 1.2)) e.set(o.pick(e));
      return true;
    }
    return false;
  }
  function slashArc(e, reach, dmg, arc) {
    const p = W().player; const f = U.DV[e.dir];
    const a = U.angle(p.x - e.x, p.y - e.y), fa = U.angle(f[0], f[1]);
    if (U.dist(e.x, e.y, p.x, p.y) < reach && Math.abs(U.angDiff(a, fa)) < (arc || 1.3)) C().hurtPlayer(p, dmg, e, {});
    G.fx.ring(e.x + f[0] * 12, e.y - 8 + f[1] * 8, '#ffffff', reach * 0.6, 0.2, 2);
    sfx('swing');
  }
  const swordGear = (col) => (e, g, x, y) => {
    const cx = x + 12, cy = y + 12;
    const f = U.DV[e.dir];
    let a = U.angle(f[0], f[1]) + 0.9;
    if (e.st === 'windup' || e.st === 'charge') a = U.angle(f[0], f[1]) - 2;
    if (e.st === 'slash' || e.st === 'dash' || e.st === 'spin') a = U.angle(f[0], f[1]) + (e.st === 'spin' ? e.t * 20 : Math.min(1, e.stT / 0.12) * 2.4 - 1.2);
    g.save(); g.translate(cx, cy); g.rotate(a);
    g.fillStyle = '#3a2418'; g.fillRect(2, -1, 4, 2); g.fillStyle = '#e8c048'; g.fillRect(6, -3, 1, 6);
    g.fillStyle = col; g.fillRect(7, -1, 16, 2); g.fillStyle = '#ffffff'; g.fillRect(7, -1, 16, 1);
    g.restore();
    if (e.st === 'slash' && e.stT < 0.2) { g.globalAlpha = 0.5; g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 24, U.angle(f[0], f[1]) - 1.2, U.angle(f[0], f[1]) + 1.2); g.fill(); g.globalAlpha = 1; }
  };

  /* ═════════════ 카시안 — 정면을 막는다. 완벽 회피 뒤 반격, 회전 베기, 폭탄 ═════════════ */
  def('cassian', { name: '카시안', title: '카이론의 마지막 제자 · 카시안', hp: 60, atk: 4, r: 8, h: 22, speed: 70, exp: 140, gold: 0, look: null,
    init(e) { e.look = Object.assign({}, G.cast.get('cassian').look); e.guardT = 0; },
    guards(e, info) {
      if (e.st === 'slash' || e.st === 'dash' || e.stunT > 0 || info.unblockable || info.crit) return false;
      const p = W().player, f = U.DV[e.dir];
      const [nx, ny] = U.norm(p.x - e.x, p.y - e.y);
      if (f[0] * nx + f[1] * ny > 0.3) { e.guardT = 0.3; if (info.src === 'sword' && Math.random() < 0.5 && !e.phase2) { e.set('riposte'); } return true; }
      return false;
    },
    ai(e, dt, Wd) {
      if (e.guardT > 0) e.guardT -= dt;
      if (swordsman(e, dt, Wd, { keep: 40, pick: (x) => (x.pat++ % 3 === 2 ? 'dash' : 'windup') })) return;
      const p = Wd.player;
      if (e.st === 'windup') { e.state = 'attack'; e.atkFrame = 0; if (e.stT < 0.02) e.telegraph(0.35); if (e.stT > 0.35) { e.set('slash'); const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 280; e.ky = ny * 280; } }
      else if (e.st === 'slash') { e.state = 'attack'; e.atkFrame = 1; if (!e.did) { e.did = true; slashArc(e, 34, e.atk); } if (e.stT > 0.35) { e.did = false; e.set(e.phase2 && Math.random() < 0.5 && !e.chain ? 'windup' : 'idle'); e.chain = !e.chain; } }
      else if (e.st === 'riposte') { e.state = 'attack'; e.atkFrame = 1; if (e.stT < 0.02) { sfx('clank'); G.fx.float(e.x, e.y - 30, '받아치기!', '#ff8a9a'); } if (e.stT > 0.12 && !e.did) { e.did = true; slashArc(e, 30, e.atk + 1); } if (e.stT > 0.4) { e.did = false; e.set('idle'); } }
      else if (e.st === 'dash') {
        if (e.stT < 0.02) { e.telegraph(0.5); e.cv = U.norm(p.x - e.x, p.y - e.y); }
        if (e.stT > 0.5 && e.stT < 0.8) { e.go(e.cv[0] * 360 * dt, e.cv[1] * 360 * dt); const img = e.sheet && e.sheet.get('atk', e.dir, 1); if (img) G.fx.afterimage(img, e.x - 12, e.y - 32, 0.4); if (U.dist(e.x, e.y, p.x, p.y) < 14) C().hurtPlayer(p, e.atk + 1, e, {}); }
        if (e.stT > 1.1) { e.set('idle'); if (e.phase2) { const a = aim(e, p, 10); shoot({ kind: 'beam', x: e.x, y: e.y - 10, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, dmg: e.atk, col: '#ff8a9a', blockLv: 2, reflectable: true }); sfx('beam'); } }
      }
    },
    gear: swordGear('#e8e8f8'),
    over(e, g, cx, cy) { if (e.guardT > 0) { g.globalAlpha = e.guardT * 2; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(e.x - cx + U.DV[e.dir][0] * 8, e.y - cy - 12 + U.DV[e.dir][1] * 6, 10, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } } });

  /* ═════════════ 그라우스 — 장부 방패 · 돌진 · 부하 ═════════════ */
  def('graus', { name: '그라우스', title: '징수 기사단 부단장 · 그라우스', hp: 110, atk: 5, r: 9, h: 24, speed: 48, exp: 200, gold: 300,
    init(e) { e.look = Object.assign({}, G.cast.get('graus').look); },
    guards(e, info) { if (e.st === 'charge' || e.st === 'slam' || e.stunT > 0 || info.unblockable) return false; const p = W().player, f = U.DV[e.dir]; const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); return f[0] * nx + f[1] * ny > 0.2; },
    ai(e, dt, Wd) {
      if (swordsman(e, dt, Wd, { keep: 50, cool: 1.4, cool2: 1, pick: (x) => ['charge', 'slam', 'call', 'coins'][x.pat++ % 4] })) return;
      const p = Wd.player;
      if (e.st === 'charge') { if (e.stT < 0.02) { e.telegraph(0.6); e.cv = U.norm(p.x - e.x, p.y - e.y); sfx('growl'); } if (e.stT > 0.6) { const r = e.go(e.cv[0] * 240 * dt, e.cv[1] * 240 * dt); if (U.dist(e.x, e.y, p.x, p.y) < 16) C().hurtPlayer(p, e.atk + 1, e, {}); if (r.hitX || r.hitY) { e.stunT = 2; W().shake(4, 0.3); sfx('impact'); e.set('idle'); } else if (e.stT > 1.6) e.set('idle'); } }
      if (e.st === 'slam') { e.state = 'attack'; if (e.stT < 0.02) { e.telegraph(0.7); warnCircle(e.x, e.y, 42, 0.8, () => { hitCircle(e.x, e.y, 42, e.atk); W().shake(5, 0.3); G.fx.dust(e.x, e.y, 16); G.fx.ring(e.x, e.y, '#ffd8a8', 42, 0.4, 3); sfx('impact'); }); } if (e.stT > 1.2) e.set('idle'); }
      if (e.st === 'call') { if (e.stT < 0.02) { G.cine.bubble(e, U.pick(['세금은 목숨보다 먼저 내는 것이다.', '장부에 적힌 대로!', '기사들, 저놈을 계산에서 지워라!']), { life: 2 }); const n = e.phase2 ? 2 : 1; for (let i = 0; i < n; i++) minion(e, i ? 'bandit' : 'knight', e.x + (i ? 50 : -50), e.y + 20); } if (e.stT > 1) e.set('idle'); }
      if (e.st === 'coins') { if (e.stT < 0.02) { ring(e, e.phase2 ? 14 : 10, 110, { kind: 'rock', drawFn(g, x, y) { g.fillStyle = '#e8c048'; g.fillRect(x - 2, y - 2, 4, 4); g.fillStyle = '#fff0a8'; g.fillRect(x - 1, y - 2, 1, 1); } }); sfx('coin'); } if (e.stT > 0.8) e.set('idle'); }
    },
    gear(e, g, x, y) {
      swordGear('#c8c8d8')(e, g, x, y);
      if (e.st !== 'charge' && e.stunT <= 0) { const f = U.DV[e.dir]; const sx = x + 12 + f[0] * 8 - 5, sy = y + 12 + f[1] * 5; if (e.dir !== 'up') { g.fillStyle = OUT; g.fillRect(sx - 1, sy - 1, 12, 14); g.fillStyle = '#6a4424'; g.fillRect(sx, sy, 10, 12); g.fillStyle = '#e8e0cc'; g.fillRect(sx + 2, sy + 2, 6, 8); g.fillStyle = '#6a6a7a'; for (let i = 0; i < 3; i++) g.fillRect(sx + 3, sy + 3 + i * 2, 4, 1); } }
    } });

  /* ═════════════ 거울 속 나 — 거울을 비추면 진짜가 보인다 ═════════════ */
  def('mirror', { name: '거울 속 나', title: '거울 연못 · 거울 속 나', hp: 80, atk: 4, r: 8, h: 22, speed: 80, exp: 180, gold: 0,
    init(e) { e.look = Object.assign({}, G.story.heroLook(G.state), { hc: '#2a2440', tc: '#3a2a5a', eye: '#ff4a6a', skin: 'ash' }); e.clones = []; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (e.st === 'idle') { e.state = 'walk'; e.toward(p.x + (p.x > e.x ? -36 : 36), p.y, e.speed, dt); clampRoom(e); e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); if (e.stT > 1) e.set(['slash', 'mimic', 'split'][e.pat++ % (e.phase2 ? 3 : 2)]); }
      if (e.st === 'slash') { e.state = 'attack'; if (e.stT < 0.02) e.telegraph(0.3); if (e.stT > 0.3 && !e.did) { e.did = true; const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 260; e.ky = ny * 260; slashArc(e, 32, e.atk); } if (e.stT > 0.6) { e.did = false; e.set('idle'); } }
      if (e.st === 'mimic') { // 주인공의 움직임을 거울처럼
        e.state = 'walk'; const cxr = (roomRect(e).x0 + roomRect(e).x1) / 2; e.x = U.lerp(e.x, cxr * 2 - p.x, dt * 6); e.y = U.lerp(e.y, p.y, dt * 6); e.dir = U.dir4(p.x - e.x, 0, e.dir);
        if (e.stT > 2.4) { const a = aim(e, p, 10); shoot({ kind: 'dark', x: e.x, y: e.y - 10, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, dmg: e.atk, col: '#8a3aff', reflectable: true, blockLv: 2 }); sfx('foeshot'); e.set('idle'); }
      }
      if (e.st === 'split') { if (e.stT < 0.02) { e.clones = []; for (let i = 0; i < 2; i++) { const c = new MirrorClone({ x: e.x + (i ? 40 : -40), y: e.y, look: e.look, owner: e }); W().add(c); e.clones.push(c); } G.ui.toast('진짜는 하나 — 진실의 거울로 비춰 보자', 'gold'); e.hideT = 0; } e.state = 'idle'; if (e.stT > 5) { for (const c of e.clones) c.dead = true; e.set('idle'); } }
    },
    gear: swordGear('#8a3aff') });
  class MirrorClone extends G.foes.Foe {
    constructor(o) { super('slime', o); this.maxHp = this.hp = 1; this.look = o.look; this.r = 8; this.h = 22; this.atk = 3; this.dir = 'down'; this.state = 'walk'; this.minion = true; this.exp = 0; this.gold = 0; }
    update(dt, Wd) { this.t += dt; const p = Wd.player; this.toward(p.x, p.y, 50, dt); this.walkT = (this.walkT || 0) + dt; this.dir = U.dir4(p.x - this.x, p.y - this.y, this.dir); if (U.dist(this.x, this.y, p.x, p.y) < 12) C().hurtPlayer(p, this.atk, this, {}); if (this.revealed) this.dead = true; }
    reveal() { this.revealed = true; G.fx.shards(this.x, this.y - 10, 12, '#b8a8ff'); sfx('mirror'); }
    draw(g, cx, cy) { G.sprites.drawChar(g, this, cx, cy); }
    preKill() { G.fx.shards(this.x, this.y - 10, 10, '#8a3aff'); this.dead = true; return true; }
  }

  /* ═════════════ 폭풍새 (구름 신전) — 화살로 떨어뜨린다 ═════════════ */
  def('roc', { name: '폭풍새', title: '구름 신전 · 폭풍새', hp: 110, atk: 5, r: 20, h: 30, col: '#8ab8ff', fly: true, exp: 220, gold: 160, speed: 90, weak: ['bolt'],
    guards(e, info) { if (e.st !== 'ground' && e.stunT <= 0 && info.src === 'sword') return true; return false; },
    onHurt(e, dmg, info) {},
    ai(e, dt, Wd) {
      const p = Wd.player; const rr = roomRect(e);
      if (e.st === 'ground') { e.fly = false; if (e.stT > 3) { e.fly = true; e.set('idle'); } return; }
      e.fly = true;
      if (e.hurtT > 0 && !e.fly2) { e.hits = (e.hits || 0) + 1; e.fly2 = true; if (e.hits >= 3) { e.hits = 0; e.set('ground'); e.stunT = 0.5; sfx('shriek'); W().shake(3, 0.3); G.fx.leaves(e.x, e.y, 12, '#e8f0ff'); } }
      if (e.hurtT <= 0) e.fly2 = false;
      if (e.st === 'idle') { e.phaseA = (e.phaseA || 0) + dt; e.x = U.lerp(e.x, (rr.x0 + rr.x1) / 2 + Math.cos(e.phaseA) * 100, dt * 2); e.y = U.lerp(e.y, rr.y0 + 30 + Math.sin(e.phaseA * 2) * 20, dt * 2); if (e.stT > 1.8) e.set(['swoop', 'feathers', 'gust'][e.pat++ % 3]); }
      if (e.st === 'swoop') { if (e.stT < 0.02) { e.telegraph(0.5); e.cv = U.norm(p.x - e.x, p.y - e.y); } if (e.stT > 0.5) { e.x += e.cv[0] * 260 * dt; e.y += e.cv[1] * 260 * dt; if (U.dist(e.x, e.y, p.x, p.y) < 20) C().hurtPlayer(p, e.atk, e, {}); } if (e.stT > 1.3) e.set('idle'); clampRoom(e); }
      if (e.st === 'feathers') { if (e.stT > 0.3 && Math.floor(e.stT * 6) !== e.lf && e.stT < 1.6) { e.lf = Math.floor(e.stT * 6); const a = aim(e, p) + (Math.random() - 0.5) * 0.5; shoot({ kind: 'arrow', x: e.x, y: e.y, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, dmg: e.atk - 1 }); sfx('shoot'); } if (e.stT > 1.8) e.set('idle'); }
      if (e.st === 'gust') { if (e.stT < 0.02) { e.telegraph(0.4); sfx('wind'); } if (e.stT > 0.4 && e.stT < 2) { const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); p.kx = nx * 120; p.ky = ny * 120; if (Math.random() < dt * 30) G.fx.part({ x: p.x + (Math.random() - 0.5) * 60, y: p.y - Math.random() * 30, z: 6, vx: nx * 200, vy: ny * 200, g: 0, life: 0.3, col: '#ffffff', size: 1 }); } if (e.stT > 2.2) e.set('idle'); }
    },
    art(e) {
      const f = e.st === 'ground' ? 2 : Math.floor(e.t * 8) % 2;
      return art('roc' + f, 72, 44, (b) => {
        const r = R('#8ab8ff');
        if (f === 2) { b.ellipse(36, 30, 16, 12, r[2]); b.ellipse(20, 34, 14, 6, r[1]); b.ellipse(52, 34, 14, 6, r[1]); }
        else { const up = f === 0; for (const s of [-1, 1]) { const pts = up ? [[36, 22], [36 + s * 34, 4], [36 + s * 30, 16], [36 + s * 12, 28]] : [[36, 22], [36 + s * 34, 36], [36 + s * 26, 40], [36 + s * 10, 30]]; poly(b, pts, r[1]); b.line(36, 22, pts[1][0], pts[1][1], r[3]); } b.ellipse(36, 24, 12, 11, r[2]); }
        b.ellipse(36, 14, 8, 7, r[3]); poly(b, [[42, 14], [50, 17], [42, 19]], '#ffd84a'); b.rect(37, 12, 2, 2, OUT); b.px(38, 12, '#ffffff');
        poly(b, [[30, 8], [26, 0], [34, 7]], '#ffffff');
      });
    } });

  /* ═════════════ 서리 거인 (대성당 지하) — 불이 약점 ═════════════ */
  def('frost', { name: '서리 거인', title: '눈 아래 잠든 것 · 서리 거인', hp: 160, atk: 6, r: 20, h: 48, col: '#bfe8ff', weak: ['fire'], resist: ['ice'], exp: 260, gold: 180, speed: 26,
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); clampRoom(e); if (e.stT > 1.5) e.set(['smash', 'icicles', 'wave'][e.pat++ % 3]); }
      if (e.st === 'smash') { if (e.stT < 0.02) { e.telegraph(0.8); warnCircle(p.x, p.y, 30, 0.9, function () { hitCircle(this.x, this.y, 30, e.atk); W().shake(6, 0.4); G.fx.shards(this.x, this.y, 14, '#e8f8ff'); sfx('impact'); }); } if (e.stT > 1.3) e.set('idle'); }
      if (e.st === 'icicles') { if (e.stT < 0.02) { const rr = roomRect(e); const n = e.phase2 ? 9 : 6; for (let i = 0; i < n; i++) { const x = U.lerp(rr.x0, rr.x1, Math.random()), y = U.lerp(rr.y0, rr.y1, Math.random()); warnCircle(x, y, 10, 1 + Math.random() * 0.5, function () { hitCircle(this.x, this.y, 12, e.atk - 1); G.fx.shards(this.x, this.y, 6, '#bfe8ff'); sfx('ice'); }, '#8ad8ff'); } } if (e.stT > 1.7) e.set('idle'); }
      if (e.st === 'wave') { if (e.stT < 0.02) e.telegraph(0.5); if (e.stT > 0.5 && !e.did) { e.did = true; ring(e, e.phase2 ? 16 : 12, 100, { kind: 'ice', col: '#bfe8ff', el: 'ice', blockLv: 2 }); sfx('freeze'); } if (e.stT > 1.2) { e.did = false; e.set('idle'); } }
    },
    art(e) {
      const f = e.st === 'smash' ? 1 : Math.floor((e.walkT || e.t) * 3) % 2;
      return art('frost' + f + e.phase2, 56, 60, (b) => {
        const r = R('#a8c8e8');
        b.rect(16, 44, 9, 16, r[1]); b.rect(31, 44, 9, 16, r[1]);
        b.ellipse(28, 34, 20, 16, r[2]); b.ellipse(22, 28, 10, 8, r[3]);
        for (let i = 0; i < 5; i++) poly(b, [[10 + i * 9, 22], [14 + i * 9, 8 + (i % 2) * 4], [18 + i * 9, 22]], '#e8f8ff');
        b.ellipse(28, 20, 9, 7, r[2]); b.rect(22, 18, 4, 2, '#4ad8ff'); b.rect(31, 18, 4, 2, '#4ad8ff');
        const up = f === 1 ? -10 : 0;
        b.ellipse(6, 36 + up, 7, 10, r[1]); b.ellipse(50, 36 + up, 7, 10, r[1]); b.ellipse(6, 44 + up, 7, 5, '#e8f8ff'); b.ellipse(50, 44 + up, 7, 5, '#e8f8ff');
        if (e.phase2) { b.line(20, 30, 26, 40, '#ff8a6a'); b.line(32, 28, 36, 36, '#ff8a6a'); }
      });
    } });

  /* ═════════════ 빈 왕 (대광맥 바닥) — 흰빛에 속이 드러난다 ═════════════ */
  def('hollowking', { name: '빈 왕', title: '대광맥 바닥의 왕좌 · 빈 왕', hp: 180, atk: 6, r: 14, h: 40, col: '#bfe8ff', undead: true, dark: true, weak: ['light'], exp: 320, gold: 0, speed: 34,
    guards(e, info) { if (e.exposed > 0 || info.el === 'light' || info.unblockable) return false; if (info.src === 'sword') { sfx('clank'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player; e.exposed = Math.max(0, (e.exposed || 0) - dt);
      if (e.stunT > 0) e.exposed = Math.max(e.exposed, 0.2);
      if (e.st === 'idle') { e.toward(p.x, p.y, e.speed, dt); clampRoom(e); if (e.stT > 1.3) e.set(['wave', 'summon', 'hunger'][e.pat++ % 3]); }
      if (e.st === 'wave') { if (e.stT < 0.02) e.telegraph(0.5); if (e.stT > 0.5 && !e.did) { e.did = true; for (let i = -1; i <= 1; i++) { const a = aim(e, p, 20) + i * 0.3; shoot({ kind: 'beam', x: e.x, y: e.y - 20, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, dmg: e.atk, col: '#bfe8ff', blockLv: 2, reflectable: true, r: 5 }); } sfx('beam'); } if (e.stT > 1) { e.did = false; e.set('idle'); } }
      if (e.st === 'summon') { if (e.stT < 0.02) { minion(e, 'hollow', e.x - 40, e.y + 20); if (e.phase2) minion(e, 'hollow', e.x + 40, e.y + 20); G.cine.bubble(e, '……배가……고프다……', { life: 2 }); } if (e.stT > 1) e.set('idle'); }
      if (e.st === 'hunger') { // 빛을 빨아들인다: 가까이 있으면 MP가 준다
        if (e.stT < 0.02) { e.telegraph(0.4); sfx('heartbeat'); }
        const d = U.dist(p.x, p.y, e.x, e.y);
        if (d < 120) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); p.kx = nx * 60; p.ky = ny * 60; G.state.mp = Math.max(0, G.state.mp - dt * 6); if (Math.random() < dt * 20) G.fx.part({ x: p.x, y: p.y - 10, z: 4, vx: (e.x - p.x) * 2, vy: (e.y - p.y) * 2, g: 0, life: 0.5, col: '#ffffff', size: 1, glow: true }); }
        if (e.stT > 2.2) e.set('idle');
      }
    },
    over(e, g, cx, cy) { if (e.exposed > 0) { g.globalAlpha = 0.6; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(e.x - cx, e.y - cy - 24, 6 + Math.sin(e.t * 20) * 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } },
    art(e) {
      const f = e.st === 'hunger' ? 1 : 0;
      return art('hk' + f, 44, 52, (b) => {
        const r = R('#b8c0d8');
        b.rect(6, 44, 32, 8, '#5a5068'); b.rect(8, 30, 28, 16, r[1]); b.rect(9, 30, 10, 14, r[3]);
        b.ellipse(22, 22, 13, 14, r[2]); b.ellipse(18, 17, 5, 5, r[3]); b.rect(12, 20, 20, 5, '#05040a'); b.rect(20, 25, 4, 8, '#05040a');
        b.px(16, 22, f ? '#ffffff' : '#bfe8ff'); b.px(28, 22, f ? '#ffffff' : '#bfe8ff');
        poly(b, [[10, 10], [16, 2], [22, 8], [28, 2], [34, 10]], '#e8c048');
        b.rect(0, 28, 7, 16, r[1]); b.rect(37, 28, 7, 16, r[1]);
        for (let y = 34; y < 44; y += 3) b.hline(12, 20, y, r[0]);
      });
    } });

  /* ═════════════ 그림자 녹턴 (천년성) — 순간이동 · 분신 · 어둠 ═════════════ */
  def('nocturne', { name: '그림자 녹턴', title: '사천왕 · 검정의 자리 · 그림자 녹턴', hp: 150, atk: 6, r: 8, h: 22, speed: 110, dark: true, weak: ['light'], exp: 300, gold: 0,
    init(e) { e.look = Object.assign({}, G.cast.get('nocturne').look); },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (swordsman(e, dt, Wd, { keep: 60, cool: 1, cool2: 0.7, pick: (x) => ['blink', 'daggers', 'blink', 'shadow'][x.pat++ % 4] })) return;
      if (e.st === 'blink') { if (e.stT < 0.02) { G.fx.glow(e.x, e.y - 10, '#3a1a5a', 12); sfx('warp'); const a = Math.random() * Math.PI * 2; e.x = p.x + Math.cos(a) * 40; e.y = p.y + Math.sin(a) * 30; clampRoom(e); e.telegraph(0.3); } e.state = 'attack'; if (e.stT > 0.3 && !e.did) { e.did = true; e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); slashArc(e, 32, e.atk); } if (e.stT > 0.6) { e.did = false; e.set('idle'); } }
      if (e.st === 'daggers') { if (e.stT < 0.02) e.telegraph(0.3); if (e.stT > 0.3 && !e.did) { e.did = true; const n = e.phase2 ? 7 : 5; for (let i = 0; i < n; i++) { const a = aim(e, p, 10) + (i - (n - 1) / 2) * 0.18; shoot({ kind: 'arrow', x: e.x, y: e.y - 8, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, dmg: e.atk - 1, blockLv: 1 }); } sfx('shoot'); } if (e.stT > 0.8) { e.did = false; e.set('idle'); } }
      if (e.st === 'shadow') { if (e.stT < 0.02) { for (let i = 0; i < (e.phase2 ? 3 : 2); i++) minion(e, 'shade', e.x + (i - 1) * 40, e.y); if (G.light) W().map.dark = Math.max(W().map.dark || 0, 0.75); G.ui.toast('어둠이 짙어진다 — 등불을!', 'bad'); } if (e.stT > 1) e.set('idle'); }
    },
    gear: swordGear('#b87aff') });

  /* ═════════════ 방위 핵 (하늘 정거장) ═════════════ */
  def('core', { name: '방위 핵', title: '하늘 정거장 · 방위 핵 「파수꾼」', hp: 200, atk: 6, r: 22, h: 40, col: '#6ad8ff', weak: ['bolt'], exp: 360, gold: 0, noContact: true,
    init(e) { e.shield = 3; },
    guards(e, info) { if (e.shield > 0) { sfx('clank'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      e.drones = (e.drones || []).filter((d) => !d.dead);
      if (e.shield > 0 && e.drones.length === 0 && e.stT > 0.5) { if (e.st !== 'open') { const n = 3; for (let i = 0; i < n; i++) e.drones.push(minion(e, 'drone', e.x + Math.cos(i * 2.1) * 60, e.y + 30 + Math.sin(i * 2.1) * 30)); e.shield--; if (e.shield === 0) { e.set('open'); G.ui.toast('방어막이 꺼졌다!', 'gold'); } } }
      if (e.st === 'open') { if (e.stT > 6) { e.shield = e.phase2 ? 2 : 3; e.set('idle'); } }
      if (e.st !== 'open' && Math.floor(e.t * 1.2) !== e.lb) { e.lb = Math.floor(e.t * 1.2); const a = aim(e, p, 20); for (let i = -1; i <= 1; i++) shoot({ kind: 'beam', x: e.x, y: e.y - 20, vx: Math.cos(a + i * 0.2) * 160, vy: Math.sin(a + i * 0.2) * 160, dmg: e.atk - 1, col: '#ff5a5a', blockLv: 2, reflectable: true }); sfx('beam'); }
    },
    art(e) {
      return art('core' + (e.shield > 0 ? 1 : 0) + (Math.floor(e.t * 4) % 2), 56, 56, (b) => {
        b.ellipse(28, 28, 26, 26, '#2a3448'); b.ellipse(28, 28, 22, 22, '#4a5468');
        b.ellipse(28, 28, 12, 12, e.shield > 0 ? '#6ad8ff' : '#ff5a5a'); b.ellipse(28, 28, 6, 6, '#ffffff');
        for (let a = 0; a < 8; a++) b.rect(Math.round(28 + Math.cos(a * 0.785 + e.t) * 20) - 2, Math.round(28 + Math.sin(a * 0.785 + e.t) * 20) - 2, 4, 4, '#8a98b0');
        if (e.shield > 0) for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; b.px(Math.round(28 + Math.cos(t) * 25), Math.round(28 + Math.sin(t) * 25), '#bfeaff'); }
      });
    }, noShadow: false });

  /* ═════════════ 카이론 — 대륙의 절대 강자 ═════════════ */
  def('kairon', { name: '카이론', title: '챔피언 · 레벨 99만 9999 · 카이론', hp: 320, atk: 7, r: 9, h: 24, speed: 90, exp: 800, gold: 0,
    init(e) { e.look = Object.assign({}, G.cast.get('kairon').look); },
    guards(e, info) { if (e.st === 'idle' && !info.unblockable && !info.crit && Math.random() < 0.5) { e.set('counter'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      if (swordsman(e, dt, Wd, { keep: 44, cool: 0.9, cool2: 0.6, pick: (x) => ['windup', 'beam', 'dash', 'windup', 'pillars'][x.pat++ % 5] })) return;
      if (e.st === 'windup') { e.state = 'attack'; if (e.stT < 0.02) e.telegraph(0.3); if (e.stT > 0.3) { const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); e.kx = nx * 300; e.ky = ny * 300; e.set('slash'); } }
      else if (e.st === 'slash') { e.state = 'attack'; if (!e.did) { e.did = true; slashArc(e, 38, e.atk + 1, 1.5); } if (e.stT > 0.3) { e.did = false; e.combo = (e.combo || 0) + 1; e.set(e.combo < (e.phase2 ? 3 : 2) ? 'windup' : 'idle'); if (e.st === 'idle') e.combo = 0; } }
      else if (e.st === 'counter') { e.state = 'attack'; if (e.stT < 0.02) { sfx('clank'); G.cine.bubble(e, U.pick(['계산대로다.', '느리다.', '그 검은 아직 네 것이 아니다.']), { life: 1.4 }); } if (e.stT > 0.15 && !e.did) { e.did = true; slashArc(e, 36, e.atk + 2); } if (e.stT > 0.5) { e.did = false; e.set('idle'); } }
      else if (e.st === 'beam') { if (e.stT < 0.02) e.telegraph(0.5); if (e.stT > 0.5 && !e.did) { e.did = true; const n = e.phase2 ? 5 : 3; for (let i = 0; i < n; i++) { const a = aim(e, p, 10) + (i - (n - 1) / 2) * 0.22; shoot({ kind: 'beam', x: e.x, y: e.y - 10, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, dmg: e.atk, col: '#fff0a8', blockLv: 3, reflectable: true, r: 5 }); } sfx('special'); } if (e.stT > 1) { e.did = false; e.set('idle'); } }
      else if (e.st === 'dash') { if (e.stT < 0.02) { e.telegraph(0.4); e.cv = U.norm(p.x - e.x, p.y - e.y); } if (e.stT > 0.4 && e.stT < 0.7) { e.go(e.cv[0] * 420 * dt, e.cv[1] * 420 * dt); const img = e.sheet && e.sheet.get('atk', e.dir, 1); if (img) G.fx.afterimage(img, e.x - 12, e.y - 32, 0.5); if (U.dist(e.x, e.y, p.x, p.y) < 16) C().hurtPlayer(p, e.atk + 2, e, {}); } if (e.stT > 1) e.set('idle'); }
      else if (e.st === 'pillars') { if (e.stT < 0.02) { const n = e.phase2 ? 8 : 5; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + e.t; const x = p.x + Math.cos(a) * 40, y = p.y + Math.sin(a) * 30; warnCircle(x, y, 14, 0.9, () => { hitCircle(x, y, 14, e.atk); G.fx.glow(x, y, '#fff8c0', 14, 80); sfx('white'); }, '#fff0a8'); } warnCircle(p.x, p.y, 14, 1.2, function () { hitCircle(this.x, this.y, 14, e.atk + 1); G.fx.glow(this.x, this.y, '#ffffff', 20, 100); }, '#ffffff'); } if (e.stT > 1.4) e.set('idle'); }
    },
    gear: swordGear('#fff8e0') });

  /* ═════════════ 흑점 — 마지막 ═════════════
     검은 태양. 다섯 빛깔 구슬이 흑점을 지킨다: 구슬을 부수면 속이 드러난다. 마지막엔 필살기로 */
  def('blacksun', { name: '흑점', title: '채워지지 못한 그릇들의 배고픔 · 흑점', hp: 400, atk: 7, r: 30, h: 60, col: '#1a1028', fly: true, dark: true, weak: ['light'], exp: 0, gold: 0, noContact: true,
    init(e) { e.orbs = []; e.core = false; },
    guards(e, info) { if (!e.core) { if (info.src === 'sword' || info.src === 'arrow') sfx('clank'); return true; } return false; },
    ai(e, dt, Wd) {
      const p = Wd.player;
      e.orbs = e.orbs.filter((o) => !o.dead);
      if (!e.core && e.orbs.length === 0) {
        if (e.opened) { e.core = true; e.coreT = 6; G.ui.toast('흑점의 속이 열렸다 — 흰빛을!', 'white'); sfx('crystal'); }
        else { e.opened = true; const cols = ['#6ae07a', '#ff5a4a', '#4a8aff', '#ffd84a', '#b87aff']; cols.forEach((col, i) => { const o = G.foes.spawn('wisp', e.x + Math.cos(i * 1.256) * 70, e.y + Math.sin(i * 1.256) * 40, { tier: 11 }); o.col = col; o.minion = true; o.room = e.room; o.name = '빛 구슬'; o.home = { x: e.x, y: e.y }; o.orbA = i * 1.256; o.orbit = e; o.update = orbUpdate; e.orbs.push(o); }); }
      }
      if (e.core) { e.coreT -= dt; if (e.coreT <= 0) { e.core = false; e.opened = false; } }
      e.x = e.home.x + Math.sin(e.t * 0.5) * 40; e.y = e.home.y + Math.sin(e.t * 0.8) * 10;
      if (e.stT > (e.phase2 ? 1.4 : 2)) {
        e.stT = 0;
        const k = e.pat++ % 3;
        if (k === 0) { ring(e, e.phase2 ? 20 : 14, 80, { kind: 'dark', col: '#3a1a5a', blockLv: 2, off: e.t }); sfx('foeshot'); }
        else if (k === 1) { for (let i = 0; i < (e.phase2 ? 3 : 2); i++) minion(e, 'shade', e.x + (i - 1) * 60, e.y + 50); }
        else { const x = p.x, y = p.y; warnCircle(x, y, 34, 1, () => { hitCircle(x, y, 34, e.atk + 1); G.fx.glow(x, y, '#3a1a5a', 30, 60); W().shake(5, 0.4); sfx('impact'); }, '#8a3aff'); }
      }
      // 빛을 빨아들이는 배고픔
      const d = U.dist(p.x, p.y, e.x, e.y);
      if (d < 160) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); p.kx += nx * 40 * dt * 10; p.ky += ny * 40 * dt * 10; }
    },
    draw(e, g, cx, cy) {
      const x = Math.round(e.x - cx), y = Math.round(e.y - cy - 60);
      const r = 30 + Math.sin(e.t * 2) * 2;
      const gr = g.createRadialGradient(x, y, r * 0.4, x, y, r * 2.2);
      gr.addColorStop(0, 'rgba(255,40,90,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4);
      g.fillStyle = e.flash > 0 ? '#ffffff' : '#05030a'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#ff2a5a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + e.t * 0.6; g.strokeStyle = 'rgba(30,10,50,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.lineTo(x + Math.cos(a + 0.2) * (r + 14 + Math.sin(e.t * 3 + i) * 6), y + Math.sin(a + 0.2) * (r + 14 + Math.sin(e.t * 3 + i) * 6)); g.stroke(); }
      if (e.core) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 8 + Math.sin(e.t * 20) * 2, 0, Math.PI * 2); g.fill(); }
      else { for (const s of [-1, 1]) { g.fillStyle = '#ff2a5a'; g.fillRect(x + s * 10 - 3, y - 4, 6, 3); g.fillStyle = '#ffd0d8'; g.fillRect(x + s * 10 - 1, y - 4, 2, 1); } }
      g.lineWidth = 1;
    }, noShadow: true });
  function orbUpdate(dt, Wd) {
    this.t += dt; if (this.inv > 0) this.inv -= dt; if (this.flash > 0) this.flash -= dt; if (this.hpShow > 0) this.hpShow -= dt; if (this.hurtT > 0) { this.hurtT -= dt; this.hpShow = 2; }
    const o = this.orbit; if (!o || o.dead) { this.dead = true; return; }
    this.orbA += dt * 0.8; this.x = o.x + Math.cos(this.orbA) * 80; this.y = o.y + 20 + Math.sin(this.orbA) * 46;
    if (Math.random() < dt * 0.5) { const p = Wd.player; const a = U.angle(p.x - this.x, p.y - this.y); C().shoot({ kind: 'orb', owner: 'foe', x: this.x, y: this.y - 10, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, dmg: 4, col: this.col, r: 3, life: 2, blockable: true, blockLv: 2 }); }
  }

  /* ───────── 만들기 ───────── */
  function spawn(type, x, y, o) {
    const b = new Boss(type, Object.assign({ x, y }, o || {}));
    b.home = { x, y };
    if (W().map) E.settle(W().map, b);
    return W().add(b);
  }

  G.bosses = { B, Boss, spawn, def, warnRect, warnCircle, hitRect, hitCircle, minion, ring, Tentacle, MirrorClone };
})();
