/* 필살기: 게이지가 가득 차면 필살 버튼. 장비 탭에서 하나를 골라 둔다.
   등급이 높을수록 연출이 크다 — 희귀부터 컷인, 영웅은 느린 화면, 전설은 섬광과 큰 흔들림. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, E = G.ent;
  const C = G.combat;
  const W = () => G.world;
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const foes = () => C.foes();
  const near = (p, r, n) => foes().filter((e) => U.dist(p.x, p.y, e.x, e.y) < r).sort((a, b) => U.dist(p.x, p.y, a.x, a.y) - U.dist(p.x, p.y, b.x, b.y)).slice(0, n || 99);
  const onScreen = (e) => { const Wd = W(), v = Wd.view; return e.x > Wd.rcx - 8 && e.x < Wd.rcx + v.w + 8 && e.y > Wd.rcy - 8 && e.y < Wd.rcy + v.h + 24; };
  const ghost = (p) => { const sh = p.sheet; if (!sh) return; const img = sh.get('atk', p.dir, 1); G.fx.afterimage(img, p.x - img.width / 2, p.y - img.height, 0.55); };

  /** 시작 연출 (등급별) */
  function open(p, id) {
    const sp = G.data.SPECIALS[id], gr = sp.grade || 1, GC = G.prog.GRADES[gr];
    p.inv = Math.max(p.inv, 0.6);
    sfx('special');
    G.fx.ring(p.x, p.y - 8, GC.glow || '#fff8c0', 26 + gr * 4, 0.4, 2 + (gr >= 4 ? 1 : 0));
    // 컷인은 화면 위쪽 얇은 띠 — 가운데 싸움은 그대로 보인다. 섬광도 옅게
    if (gr >= 2 && G.hud && G.hud.cutin) G.hud.cutin(sp.name, GC.name + ' 필살기', GC.glow || GC.col);
    if (gr >= 4) W().slowmo(0.35, 0.18 + gr * 0.03);
    if (gr >= 5) { G.cine.flash('#fff', 0.3, 0.35); W().shake(5, 0.4); if (G.light) G.light.flare(p.x, p.y, 160, 5); }
    else W().shake(2 + gr * 0.6, 0.25);
  }

  const MOVES = {
    // 회오리: 세 바퀴 돌며 주변을 빨아들인다
    whirl: {
      start(p) { p.spx.turns = 3; p.spx.dur = 0.9; p.spx.a0 = Math.atan2(p.face[1], p.face[0]); p.spx.hit = new Map(); },
      update(p, dt) {
        const X = p.spx, d = G.st.derive(S());
        const a = X.a0 + (X.t / X.dur) * Math.PI * 2 * X.turns, turn = Math.floor((X.t / X.dur) * X.turns);
        p.dir = ['right', 'down', 'left', 'up'][Math.floor((((a % (Math.PI * 2)) + Math.PI * 2 + Math.PI / 4) % (Math.PI * 2)) / (Math.PI / 2)) % 4];
        p.atkFrame = 1; p.spinA = a;
        for (const e of near(p, 90)) {
          if (!e.boss && e.weight < 4) { const [nx, ny] = U.norm(p.x - e.x, p.y - e.y); E.move(W().map, e, nx * 90 * dt, ny * 90 * dt); }
          if (U.dist(p.x, p.y - 8, e.x, e.y - 8) < d.reach + 18 && X.hit.get(e) !== turn) { X.hit.set(e, turn); const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, d.atk * 1.6, { src: 'special', kx: nx * 0.4, ky: ny * 0.4, el: d.el, power: 0.6, unblockable: true }); }
        }
        if (Math.random() < 0.6) G.fx.part({ x: p.x + Math.cos(a) * 26, y: p.y - 4 + Math.sin(a) * 18, z: 4, vz: 20, g: 0, life: 0.3, col: '#e8f4ff', size: 1, glow: true });
        C.cutArc(W().map, p.x, p.y - 4, a, 28, 0.4);
        return X.t >= X.dur;
      },
      draw: 'spin',
    },
    // 화살비: 앞쪽 넓은 곳에
    rain: {
      start(p) {
        const d = G.st.derive(S());
        const cx = p.x + p.face[0] * 64, cy = p.y + p.face[1] * 52;
        C.marks.push({ x: cx, y: cy, t: 0, life: 0.5, r: 46, col: '#fff0a8' });
        const dmg = Math.max(d.bowAtk * 1.1, d.atk * 0.7);
        for (let i = 0; i < 34; i++) {
          C.after(0.35 + i * 0.035, () => {
            const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 46, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.75;
            G.fx.part({ x, y, z: 60, vz: -420, g: 0, life: 0.14, col: '#fff4c8', size: 1, glow: true, streak: true });
            C.after(0.14, () => { G.fx.sparks(x, y, 2, '#e8d8b0', 30); for (const e of foes()) if (U.dist(x, y, e.x, e.y) < 12) C.damage(e, dmg, { src: 'arrow', kx: 0, ky: 0, power: 0.2, stun: 0.2 }); });
          });
        }
        sfx('shootc'); p.spx.dur = 0.35;
      },
      update(p) { p.state = 'sp'; return p.spx.t >= p.spx.dur; },
      draw: 'bow',
    },
    // 삼연참: 가까운 적 셋에게 차례로
    triple: {
      start(p) { p.spx.list = near(p, 130, 3); p.spx.i = 0; p.spx.dur = 0.62; },
      update(p) {
        const X = p.spx, d = G.st.derive(S());
        const step = Math.floor(X.t / 0.2);
        if (step > X.i && X.i < 3) {
          const e = X.list[X.i % Math.max(1, X.list.length)];
          X.i++;
          if (e && !e.dead) {
            ghost(p);
            const [nx, ny] = U.norm(e.x - p.x, e.y - p.y);
            const tx = e.x + nx * 14, ty = e.y + ny * 10;
            if (W().map.boxFree(tx - p.bw / 2, ty - p.bh, p.bw, p.bh, p.z, p)) { p.x = tx; p.y = ty; }
            p.dir = U.dir4(-nx, -ny, p.dir); p.face = [-nx, -ny];
            C.damage(e, d.atk * 3, { src: 'special', kx: -nx, ky: -ny, el: d.el, power: 1.4, unblockable: true, crit: X.i === 3 });
            G.fx.slash && G.fx.slash(e.x, e.y - 8, Math.atan2(ny, nx), '#fff8c0', 22);
            sfx('swing');
          } else { ghost(p); p.x += p.face[0] * 20; p.y += p.face[1] * 14; }
        }
        p.atkFrame = 1;
        return X.t >= X.dur;
      },
    },
    // 불꽃 폭풍: 둘러선 불기둥이 퍼져 나간다
    flame: {
      start(p) {
        const d = G.st.derive(S());
        for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 + ring * 0.4, r = 26 + ring * 30;
          const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * 0.75;
          C.after(0.1 + ring * 0.25 + i * 0.02, () => {
            for (let k = 0; k < 10; k++) G.fx.part({ x: x + (Math.random() - 0.5) * 6, y, z: Math.random() * 6, vz: 70 + Math.random() * 60, g: 0, life: 0.45, col: Math.random() < 0.5 ? '#ffb040' : '#ff5a2a', size: 2, glow: true });
            for (const e of foes()) if (U.dist(x, y, e.x, e.y) < 18) C.damage(e, (5 + S().lv * 0.2) * d.magMul + d.atk * 0.3, { src: 'spell', el: 'fire', kx: 0, ky: 0, power: 0.8 });
            C.cutAt(W().map, Math.floor(x / 16), Math.floor(y / 16), 'burn');
          });
        }
        sfx('fire'); p.spx.dur = 0.5;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    // 얼음 감옥
    frost: {
      start(p) {
        const d = G.st.derive(S());
        G.fx.ring(p.x, p.y - 4, '#bfe8ff', 120, 0.6, 3); if (G.light) G.light.flare(p.x, p.y, 130, 3, '#bfe8ff');
        for (const e of near(p, 125)) { C.damage(e, (4 + S().lv * 0.15) * d.magMul, { src: 'spell', el: 'ice', kx: 0, ky: 0, power: 0 }); e.freezeT = Math.max(e.freezeT || 0, e.boss ? 1.2 : 3.5); G.fx.shards(e.x, e.y - 10, 10, '#e8f8ff'); }
        sfx('ice'); p.spx.dur = 0.4;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    // 그림자 분신: 넷이 흩어져 벤다
    shadow: {
      start(p) {
        const d = G.st.derive(S());
        const list = near(p, 140, 4);
        const img = p.sheet ? p.sheet.get('atk', 'down', 1) : null;
        const sil = img ? G.gfx.silhouette(img, '#3a2a5a') : null;
        for (let i = 0; i < 4; i++) {
          const e = list[i % Math.max(1, list.length)];
          const a = i * Math.PI / 2 + 0.6;
          const tx = e ? e.x : p.x + Math.cos(a) * 50, ty = e ? e.y : p.y + Math.sin(a) * 40;
          for (let k = 0; k < 5; k++) C.after(k * 0.04 + i * 0.05, () => { if (sil) G.fx.afterimage(sil, U.lerp(p.x, tx, k / 4) - sil.width / 2, U.lerp(p.y, ty, k / 4) - sil.height, 0.7); });
          C.after(0.25 + i * 0.05, () => { if (e && !e.dead) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, d.atk * 2.4, { src: 'special', kx: nx, ky: ny, power: 1, unblockable: true }); G.fx.slash && G.fx.slash(e.x, e.y - 8, a, '#c49bff', 20); } });
          C.after(0.42 + i * 0.05, () => { if (e && !e.dead) C.damage(e, d.atk * 1.6, { src: 'special', kx: 0, ky: 0, power: 0.5, unblockable: true }); });
        }
        sfx('dash'); p.spx.dur = 0.55;
      },
      update(p) { p.atkFrame = 1; return p.spx.t >= p.spx.dur; },
    },
    // 별빛 화살
    starshot: {
      start(p) { p.spx.dur = 0.55; p.aim = Math.atan2(p.face[1], p.face[0]); sfx('draw'); },
      update(p) {
        const X = p.spx;
        if (X.t > 0.3 && !X.shot) {
          X.shot = true;
          const d = G.st.derive(S()), a = p.aim;
          C.shoot({ kind: 'beam', col: '#fff4c8', x: p.x + Math.cos(a) * 10, y: p.y - 4 + Math.sin(a) * 8, vx: Math.cos(a) * 440, vy: Math.sin(a) * 440, dmg: d.bowAtk * 5 + d.atk, src: 'arrow', el: 'light', r: 10, life: 0.9, pierce: 99, power: 2, ghost: true, trail: '#fff8d0', stun: 1 });
          W().shake(5, 0.3); sfx('beam'); G.fx.ring(p.x + Math.cos(a) * 14, p.y - 8 + Math.sin(a) * 10, '#fff8d0', 22, 0.4, 3);
        }
        return X.t >= X.dur;
      },
      draw: 'bow',
    },
    // 천둥 강림
    thunder: {
      start(p) {
        const d = G.st.derive(S());
        const list = foes().filter(onScreen).sort((a, b) => U.dist(p.x, p.y, a.x, a.y) - U.dist(p.x, p.y, b.x, b.y)).slice(0, 8);
        list.forEach((e, i) => C.after(0.2 + i * 0.09, () => {
          if (e.dead) return;
          C.bolts.push({ x0: e.x + (Math.random() - 0.5) * 20, y0: e.y - 120, x1: e.x, y1: e.y - 6, t: 0 });
          C.damage(e, (9 + S().lv * 0.3) * d.magMul, { src: 'spell', el: 'bolt', stun: 2, kx: 0, ky: 0 }); G.fx.sparks(e.x, e.y - 6, 12, '#fff08a', 90); W().shake(3, 0.1); sfx('bolt');
        }));
        if (!list.length) C.bolts.push({ x0: p.x, y0: p.y - 120, x1: p.x + p.face[0] * 40, y1: p.y + p.face[1] * 30, t: 0 });
        p.spx.dur = 0.5;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
    // 유성 낙하: 뛰어올라 내리찍는다
    meteor: {
      start(p) { p.spx.dur = 0.75; sfx('jump'); },
      update(p) {
        const X = p.spx, d = G.st.derive(S());
        const k = X.t / 0.5;
        p.jz = X.t < 0.5 ? Math.sin(Math.min(1, k) * Math.PI * 0.5) * 38 : Math.max(0, 38 * (1 - (X.t - 0.5) / 0.08));
        if (X.t < 0.45) { p.x += p.face[0] * 30 * (1 / 60); p.y += p.face[1] * 24 * (1 / 60); }
        if (X.t >= 0.58 && !X.slam) {
          X.slam = true; p.jz = 0;
          C.explode(p.x, p.y - 2, 'player', 1.6);
          for (const e of near(p, 84)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, d.atk * 4 + 4, { src: 'special', kx: nx, ky: ny, power: 2.4, stun: 1.2, unblockable: true }); }
          G.fx.ring(p.x, p.y - 2, '#ffb070', 84, 0.5, 4); G.fx.dust(p.x, p.y, 24); W().shake(7, 0.4); W().hitstop(0.1);
        }
        p.atkFrame = X.t < 0.5 ? 0 : 1;
        return X.t >= X.dur;
      },
    },
    // 새벽의 검무
    dance: {
      start(p) { p.spx.list = near(p, 150, 6); p.spx.i = 0; p.spx.dur = 1.15; },
      update(p) {
        const X = p.spx, d = G.st.derive(S());
        const step = Math.floor(X.t / 0.14);
        if (step > X.i && X.i < 6) {
          const pool = X.list.filter((e) => !e.dead);
          const e = pool[X.i % Math.max(1, pool.length)];
          X.i++;
          ghost(p);
          if (e) {
            const [nx, ny] = U.norm(e.x - p.x, e.y - p.y), side = X.i % 2 ? 1 : -1;
            const tx = e.x + nx * 14 + ny * 8 * side, ty = e.y + ny * 10 - nx * 8 * side;
            if (W().map.boxFree(tx - p.bw / 2, ty - p.bh, p.bw, p.bh, p.z, p)) { p.x = tx; p.y = ty; }
            p.dir = U.dir4(-nx, -ny, p.dir);
            C.damage(e, d.atk * 2.5, { src: 'special', kx: nx * 0.3, ky: ny * 0.3, el: 'light', power: 0.5, unblockable: true });
            G.fx.slash && G.fx.slash(e.x, e.y - 8, Math.atan2(ny, nx) + side * 0.6, '#ffe066', 24);
          }
          sfx('swing');
        }
        if (X.t >= 0.95 && !X.burst) {
          X.burst = true;
          G.cine.flash('#fff', 0.25, 0.35); G.fx.ring(p.x, p.y - 8, '#ffe066', 96, 0.5, 4); if (G.light) G.light.flare(p.x, p.y, 150, 5);
          for (const e of near(p, 96)) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); C.damage(e, d.atk * 4, { src: 'special', kx: nx, ky: ny, el: 'light', power: 2, crit: true, unblockable: true }); }
          W().shake(6, 0.35); sfx('white');
        }
        p.atkFrame = 1;
        return X.t >= X.dur;
      },
    },
    // 흰빛 심판
    judge: {
      start(p) {
        const d = G.st.derive(S());
        const list = foes().filter(onScreen);
        for (const e of list) C.marks.push({ x: e.x, y: e.y, t: 0, life: 0.6, r: 14, col: '#ffffff' });
        C.after(0.6, () => {
          G.cine.flash('#fff', 0.3, 0.4); W().shake(6, 0.4); sfx('white');
          for (const e of list) {
            if (e.dead) continue;
            for (let k = 0; k < 16; k++) G.fx.part({ x: e.x + (Math.random() - 0.5) * 10, y: e.y, z: k * 8, vz: 0, g: 0, life: 0.45, col: '#fffbe8', size: 2, glow: true });
            C.damage(e, ((14 + S().lv * 0.35) * d.magMul + 10) * (e.undead || e.dark ? 2 : 1), { src: 'spell', el: 'light', stun: 2.5, kx: 0, ky: 0, crit: true });
          }
        });
        p.spx.dur = 0.8;
      },
      update(p) { return p.spx.t >= p.spx.dur; }, draw: 'cast',
    },
  };

  function start(p, id) {
    const M = MOVES[id]; if (!M) return;
    open(p, id);
    p.setState('sp'); p.spx = { id, t: 0, dur: 0.5 };
    M.start(p);
  }
  function update(p, dt) {
    const X = p.spx; if (!X) { p.setState('idle'); return; }
    X.t += dt;
    const M = MOVES[X.id];
    p.inv = Math.max(p.inv, 0.1);
    if (!M || M.update(p, dt)) { p.spx = null; p.jz = 0; p.setState('idle'); }
  }
  /** 필살기 동안 주인공이 어떤 동작으로 보이는가 */
  function anim(p) {
    const M = p.spx && MOVES[p.spx.id];
    if (!M) return null;
    if (M.draw === 'cast') return { anim: 'cast', frame: Math.floor(p.t * 8) };
    if (M.draw === 'bow') return { anim: 'bow', frame: 1 };
    return { anim: 'atk', frame: p.atkFrame != null ? p.atkFrame : 1 };
  }

  G.specials = { start, update, anim, MOVES };
})();
