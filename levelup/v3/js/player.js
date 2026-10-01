/* 주인공: 걷기 · 구르기(기력) · 턱에서 뛰어내리기 · 헤엄 · 구덩이/용암 · 무기 동작은 combat.js가 붙인다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, I = G.input, E = G.ent;
  const TS = TL.TS;

  class Player extends E.Ent {
    constructor(o) {
      super(Object.assign({ kind: 'player', bw: 9, bh: 6, speed: 78, sortBias: 0 }, o));
      this.state = 'idle'; this.st = 0;
      this.stamina = 100; this.staminaMax = 100; this.stamDelay = 0; this.exhausted = false;
      this.safe = { x: this.x, y: this.y, z: 0 };       // 마지막으로 안전했던 자리
      this.pushT = 0; this.jump = null; this.walkT = 0; this.frame = 0;
      this.face = [0, 1];                                  // 바라보는 방향 벡터
      this.actions = {};                                   // combat.js가 등록: attack · bow · magic · tool · special
    }
    get busy() { return this.state !== 'idle' && this.state !== 'walk'; }

    update(dt, W) {
      const m = W.map;
      this.t += dt; this.st += dt;
      if (this.inv > 0) this.inv -= dt;
      if (this.flash > 0) this.flash -= dt;
      if (this.landT > 0) this.landT -= dt;
      // 달릴 때 발밑 먼지 (흙 · 모래 · 눈)
      if (this.state === 'walk' && G.fx) { this.stepT = (this.stepT || 0) + dt * U.len(this.vx || 0, this.vy || 0) / 60; if (this.stepT > 0.55) { this.stepT = 0; const gt = m.groundAt(this.x, this.y - 2), T = TL.T; if (gt === T.DIRT || gt === T.SAND || gt === T.SNOW || gt === T.ASH || gt === T.MUD || gt === T.GRAVEL || gt === T.DRY) G.fx.dust(this.x + (Math.random() - 0.5) * 4, this.y, 2); } }
      // 기력 회복
      if (this.stamDelay > 0) this.stamDelay -= dt;
      else this.stamina = Math.min(this.staminaMax, this.stamina + dt * (this.exhausted ? 22 : 34) * (this.stamRegenMul || 1));
      if (this.exhausted && this.stamina >= this.staminaMax * 0.5) this.exhausted = false;
      // 넉백
      if (this.kx || this.ky) {
        E.move(m, this, this.kx * dt, this.ky * dt);
        this.kx = U.approach(this.kx, 0, 900 * dt); this.ky = U.approach(this.ky, 0, 900 * dt);
      }
      const ctl = !this.locked && !G.script.running && !G.ui.blocking();
      switch (this.state) {
        case 'jump': return this.updJump(dt, m);
        case 'roll': return this.updRoll(dt, m, ctl);
        case 'fall': return this.updFall(dt, m);
        case 'hurt': if (this.st > 0.22) this.setState('idle'); break;
        case 'dead': return;
        default: break;
      }
      // 무기 동작 (공격 · 활 · 마법 …)이 진행 중이면 그쪽에 맡긴다 — 그동안에도 느리게 걸을 수 있다 (겨누는 쪽과 따로)
      if (this.state !== 'idle' && this.state !== 'walk' && this.state !== 'hurt') {
        if (ctl && !this.autoMove) this.actMove(dt, m);
        const a = this.actions[this.state];
        if (a && a.update) a.update(this, dt, m, ctl);
        this.checkGround(m, dt);
        return;
      }
      let ax = ctl ? I.axisX : 0, ay = ctl ? I.axisY : 0;
      if (this.autoMove) { ax = this.autoMove[0]; ay = this.autoMove[1]; }
      const mag = Math.min(1, U.len(ax, ay));
      // 직접 겨누고 있으면(마우스 · 오른쪽 스틱 · 방향키 조준) 걷는 쪽과 상관없이 그쪽을 바라본다
      const aimX = ctl && !this.autoMove && G.combat && G.combat.explicitAim ? G.combat.explicitAim(this) : null;
      if (aimX && aimX.src !== 'touch') { this.face = [aimX.x, aimX.y]; this.dir = U.dir4(aimX.x, aimX.y, this.dir); }
      if (mag > 0.05) {
        const n = U.norm(ax, ay);
        this.walkFace = n;
        if (!aimX || aimX.src === 'touch') { this.face = n; this.dir = U.dir4(ax, ay, this.dir); }
        const P = TL.PROP[m.groundAt(this.x, this.y - 2)];
        const sp = this.speed * (P.slow || 1) * (this.swimming ? 0.7 : 1) * (0.35 + 0.65 * mag) * (this.slowMul || 1);
        const r = E.move(m, this, n[0] * sp * dt, n[1] * sp * dt);
        this.vx = n[0] * sp; this.vy = n[1] * sp;
        this.walkT += dt * (sp / 60);
        this.state = 'walk';
        // 턱을 밀고 있으면 뛰어내린다
        if ((r.hitX || r.hitY) && !this.swimming) {
          this.pushT += dt;
          if (this.pushT > 0.12) {
            const L = E.ledgeAhead(m, this, ax, ay);
            if (L) this.startJump(L);
          }
        } else this.pushT = 0;
        if (r.hitX && r.hitY) this.pushT += 0;
      } else {
        this.vx = 0; this.vy = 0; this.pushT = 0;
        if (this.state === 'walk') this.state = 'idle';
      }
      // 버튼
      if (ctl) {
        if (I.pressed('dodge')) this.tryRoll(ax, ay);
        else for (const k of ['attack', 'bow', 'magic', 'tool', 'special']) {
          const a = this.actions[k];
          if (a && a.input && a.input(this, m)) break;
        }
      }
      this.checkGround(m, dt);
    }
    setState(s) { this.state = s; this.st = 0; }
    /** 공격 · 스킬 · 필살기 동안 걷기 (느리게). 겨누지 않을 때는 걷는 쪽이 다음 공격의 방향이 된다 */
    actMove(dt, m) {
      const K = Player.ACT_MOVE[this.state];
      if (!K) return;
      if (this.state === 'skill' && this.skill && (this.skill.dir || this.skill.noMove)) return;   // 스스로 움직이는 스킬 (돌진 · 물러나기 …)
      if (this.state === 'sp' && this.spx && this.spx.noMove) return;
      if (this.state === 'attack' && this.lunge > 30) return;
      const ax = I.axisX, ay = I.axisY, mag = Math.min(1, U.len(ax, ay));
      if (mag < 0.05) { this.vx = 0; this.vy = 0; return; }
      const n = U.norm(ax, ay);
      const P = TL.PROP[m.groundAt(this.x, this.y - 2)] || {};
      const sp = this.speed * K * (P.slow || 1) * (this.swimming ? 0.7 : 1) * (0.35 + 0.65 * mag) * (this.slowMul || 1) * (this.actMoveMul || 1);
      E.move(m, this, n[0] * sp * dt, n[1] * sp * dt);
      this.vx = n[0] * sp; this.vy = n[1] * sp;
      this.walkT += dt * (sp / 60); this.actWalk = 0.12;
      if (!(G.combat && G.combat.explicitAim && G.combat.explicitAim(this))) this.face = n;
    }

    /* ── 구르기: 짧은 무적 · 기력 소모 ── */
    tryRoll(ax, ay) {
      if (this.exhausted || this.swimming) { if (G.audio) G.audio.sfx('buzz'); return false; }
      const cost = this.rollCost || 24;
      if (this.stamina < cost * 0.5) { this.exhausted = true; return false; }
      this.stamina -= cost; this.stamDelay = 0.6;
      if (this.stamina <= 0) { this.stamina = 0; this.exhausted = true; }
      const n = U.len(ax, ay) > 0.2 ? U.norm(ax, ay) : this.face;
      this.rollDir = n; this.dir = U.dir4(n[0], n[1], this.dir);
      this.setState('roll');
      this.inv = Math.max(this.inv, this.rollIframes || 0.28);
      this.perfectWin = 0.16;
      if (G.audio) G.audio.sfx('roll');
      if (G.fx) G.fx.dust(this.x, this.y, 4);
      return true;
    }
    updRoll(dt, m, ctl) {
      const dur = this.rollTime || 0.34;
      const k = 1 - this.st / dur;
      const sp = (this.rollSpeed || 170) * (0.45 + 0.55 * k);
      const r = E.move(m, this, this.rollDir[0] * sp * dt, this.rollDir[1] * sp * dt);
      this.vx = this.rollDir[0] * sp; this.vy = this.rollDir[1] * sp;
      if (this.perfectWin > 0) this.perfectWin -= dt;
      if ((r.hitX || r.hitY) && this.st > 0.05) {
        const L = E.ledgeAhead(m, this, this.rollDir[0], this.rollDir[1]);
        if (L) { this.startJump(L); return; }
      }
      if (G.fx && Math.random() < dt * 20) G.fx.dust(this.x, this.y, 1);
      // 구르는 공 뒤로 옅은 잔상
      this.ghostT = (this.ghostT || 0) - dt;
      if (G.fx && this.sheet && this.ghostT <= 0 && this.st > 0.04) { this.ghostT = 0.05; const pa = G.sprites.pickAnim(this), img = this.sheet.get(pa.anim, this.dir, pa.frame); G.fx.afterimage(img, this.x - img.width / 2, this.y - img.height + 1, 0.3); }
      if (this.st >= dur) { this.setState('idle'); this.rollEndT = this.t; }
      this.checkGround(m, dt);
    }

    /* ── 턱에서 뛰어내리기 ── */
    startJump(L) {
      this.jump = { x0: this.x, y0: this.y, x1: L.x, y1: L.y, h: L.h, dur: 0.3 + U.dist(this.x, this.y, L.x, L.y) / 260 };
      this.setState('jump');
      this.pushT = 0;
      if (G.audio) G.audio.sfx('jump');
    }
    updJump(dt, m) {
      const J = this.jump, k = Math.min(1, this.st / J.dur);
      this.x = U.lerp(J.x0, J.x1, k); this.y = U.lerp(J.y0, J.y1, k);
      this.jz = Math.sin(k * Math.PI) * (10 + J.dur * 10) + (1 - k) * 0;
      if (k >= 1) {
        this.jz = 0; this.z = J.h; this.jump = null;
        E.settle(m, this);
        this.setState('idle'); this.landT = 0.14;
        if (G.fx) G.fx.dust(this.x, this.y, 8);
        if (G.audio) G.audio.sfx('land');
        G.world.shake(1.5, 0.1);
      }
    }

    /* ── 발밑: 물 · 구덩이 · 용암 · 안전한 자리 기억 ── */
    checkGround(m, dt) {
      if (this.state === 'jump' || this.state === 'fall') return;
      const t = m.groundAt(this.x, this.y - 2);
      this.swimming = t === TL.T.DEEP && this.swim;
      const hz = m.hazardAt(this.x, this.y - 2);
      // 바람에 실려 떠 있는 동안은 구덩이 위도 괜찮다
      if (this.floatT > 0) { this.floatT -= dt; this.jz = Math.max(this.jz || 0, 3 + Math.sin(G.world.t * 8)); if (hz) return; }
      else if (this.floatWas) this.jz = 0;
      this.floatWas = this.floatT > 0;
      if (hz && this.state !== 'roll') { this.startFall(hz); return; }
      if (!hz && !this.onStairs && t !== TL.T.WATER && t !== TL.T.DEEP && t !== TL.T.ICE) {
        this.safeT = (this.safeT || 0) + dt;
        if (this.safeT > 0.25) this.safe = { x: this.x, y: this.y, z: this.z };
      } else this.safeT = 0;
    }
    startFall(kind) {
      this.setState('fall'); this.fallKind = kind;
      if (G.audio) G.audio.sfx(kind === 'lava' ? 'burn' : 'fall');
    }
    updFall(dt, m) {
      if (this.st > 0.6) {
        this.x = this.safe.x; this.y = this.safe.y; this.z = this.safe.z;
        this.setState('idle');
        if (G.combat) G.combat.hurtPlayer(this, this.fallKind === 'lava' ? 4 : 2, null, { noKnock: true, why: this.fallKind });
        this.inv = 1;
      }
    }

    drawShadow(g, cx, cy) {
      if (this.state === 'fall') return;
      const s = this.jz > 0 ? Math.max(0.5, 1 - this.jz / 40) : 1;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), 6 * s, 2.5 * s, 0, 0, Math.PI * 2); g.fill();
    }
    draw(g, cx, cy) {
      if (this.inv > 0 && this.state !== 'roll' && Math.floor(this.inv * 20) % 2 === 0 && this.state !== 'dead') return;
      const SP = G.sprites;
      // 물속: 헤엄치면 어깨까지, 얕은 물은 발목까지 잠긴다
      const gt = G.world.map ? G.world.map.groundAt(this.x, this.y - 2) : 0;
      this.wadeCut = this.jz > 2 ? 0 : this.swimming ? 13 : gt === TL.T.WATER ? 4 : gt === TL.T.SWAMP ? 5 : 0;
      if (this.wadeCut) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy - this.wadeCut + 2); g.strokeStyle = 'rgba(230,245,255,0.8)'; g.beginPath(); g.ellipse(x, y, 7 + Math.sin(this.t * 6), 2, 0, 0, Math.PI * 2); g.stroke(); if (this.swimming && Math.random() < 0.1) G.fx.splash(this.x, this.y - 2); }
      if (SP && SP.drawChar) { SP.drawChar(g, this, cx, cy); return; }
      g.fillStyle = '#3aa84a'; g.fillRect(Math.round(this.x - cx - 5), Math.round(this.y - cy - 20 - this.jz), 10, 20);
    }
  }

  // 동작마다 걷는 빠르기 (평소의 몇 배)
  Player.ACT_MOVE = { attack: 0.55, bow: 0.5, cast: 0.6, skill: 0.45, spin: 0.5, sp: 0.4 };
  G.Player = Player;
})();
