/* 이야기 실행기: async 함수로 쓰는 장면. c.say · c.choice · c.move · c.cam · c.cinema · c.getItem · c.battle …
   G.script.run(async (c) => { … })  — 한 번에 하나만 돈다. 도는 동안 주인공은 조작을 받지 않는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, E = G.ent;
  const TS = TL.TS;
  const W = () => G.world;
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const SC = { running: false, queue: [], waiters: [], visitors: [] };

  /** 다음 프레임들을 기다리는 약속: 게임 시간으로 */
  function frames(fn) { return new Promise((res) => SC.waiters.push({ fn, res })); }
  function update(dt) {
    if (W() && W().ents) updLeaving(dt);
    const list = SC.waiters; SC.waiters = [];
    for (const w of list) { if (w.fn(dt)) w.res(); else SC.waiters.push(w); }
  }
  const wait = (sec) => { let t = 0; return frames((dt) => (t += dt) >= sec); };

  /** 인물 찾기: 문자열이면 지도 위 NPC id, 객체면 그대로 */
  function who(x) {
    if (!x) return null;
    if (typeof x === 'object') return x;
    if (x === 'hero' || x === 'me') return W().player;
    return W().ents.find((e) => e.cid === x && !e.dead) || null;
  }
  /** 이름으로 곁의 사람 찾기 (이름만 넘긴 말 · 고르기에 얼굴을 붙이려고) — 지금 지도에서 주인공과 가장 가까운 그 이름의 사람 */
  function byName(name) {
    const p = W().player; let best = null, bd = 1e9;
    for (const e of W().ents) { if (!e.npc || e.dead || e.hidden || e.name !== name || !e.look) continue; const d = p ? Math.hypot(e.x - p.x, e.y - p.y) : 0; if (d < bd) { bd = d; best = e; } }
    return best && bd < 260 ? best : null;
  }

  /** 대사 속 인물을 곁에 세운다: 빈 자리를 찾아 몇 걸음 밖에서 걸어 들어오고(world/96d_presence), 장면이 끝나면 걸어 나간다 */
  function arrive(c, cid, opt) {
    const cc = G.cast && G.cast.get(cid);
    const Wd = W(), p = Wd.player, m = Wd.map;
    if (!cc || !cc.look || !p || !m) return null;
    const offs = [[-22, 2], [22, 2], [0, 20], [-18, 16], [18, 16], [-30, -6], [30, -6], [0, -22], [-40, 8], [40, 8]];
    let x = p.x - 22, y = p.y + 2;
    for (const [dx, dy] of offs) { const tx = p.x + dx, ty = p.y + dy; if (m.boxFree(tx - 5, ty - 6, 10, 6, p.z, null)) { x = tx; y = ty; break; } }
    const vision = !!(opt && opt.vision);
    const e = c.spawn({ cid, x, y, look: cc.look, name: cc.name, dir: U.dir4(p.x - x, p.y - y), vision, noEnter: vision });
    e.visitor = true;
    if (vision) { e.vision = true; G.fx.glow(x, y - 12, '#fff2a8', 22, 40); if (G.light) G.light.flare(x, y, 90, 3); if (G.presence) G.presence.fadeIn(e, 0.6); }
    SC.visitors.push(e);
    return e;
  }
  /** 장면이 끝나면 불러 세운 사람들은 걸어 나간다 */
  function dismiss() {
    const p = W().player;
    for (const e of SC.visitors) {
      if (e.dead || e.stay) continue;
      if (e.vision) { G.fx.glow(e.x, e.y - 12, '#fff2a8', 18, 30); e.dead = true; continue; }
      const [nx, ny] = p ? U.norm(e.x - p.x || 1, e.y - p.y) : [1, 0];
      e.leaving = { vx: nx * 50, vy: ny * 40, t: 0 };
    }
    SC.visitors = [];
  }
  function updLeaving(dt) {
    for (const e of W().awake()) {
      if (!e.leaving || e.dead) continue;
      const L = e.leaving; L.t += dt;
      G.ent.move(W().map, e, L.vx * dt, L.vy * dt);
      e.state = 'walk'; e.walkT = (e.walkT || 0) + dt; e.dir = U.dir4(L.vx, L.vy, e.dir);
      if (L.t > 1.3) e.dead = true;   // 화면 안이면 걸어가며 흐려진다 (world/96d_presence)
    }
  }

  function ctx() {
    const c = {
      wait, frames,
      who,
      /** 말: who = NPC · 인물 id · 'hero' · null(서술). opt: { face, style, shake, name, bubble, auto } */
      async say(w, text, opt) {
        opt = opt || {};
        let e = who(w);
        // 이름만 넘긴 말(가게 주인 · 마을 사람)은 곁에 선 그 사람의 얼굴로
        if (!e && w == null && opt.name && !/narr|sys|remote/.test(opt.style || '')) e = byName(opt.name);
        // 말하는 사람이 지도에 없으면 곁으로 불러 세운다 (방송 · 편지 · 목소리는 opt.remote)
        const remote = opt.remote || /^\((방송|편지|목소리|통신|기록|녹음)/.test(text || '');
        if (!e && !remote && typeof w === 'string' && w !== 'hero' && w !== 'me') e = arrive(c, w, opt);
        if (remote) opt = Object.assign({ style: 'remote' }, opt);
        const cid = typeof w === 'string' ? w : e && e.cid ? e.cid : null;
        if (opt.bubble && e) { G.cine.bubble(e, text, { life: opt.life || 2.4, kind: opt.kind }); return wait(opt.wait || Math.min(3, 0.6 + text.length * 0.05)); }
        if (e && e !== W().player && e.npc && !opt.noTurn) { const p = W().player; e.dir = U.dir4(p.x - e.x, p.y - e.y, e.dir); }
        // 들판의 얼굴은 넷(웃음 · 슬픔 · 화 · 놀람)뿐이라 가까운 것으로 — 기쁨 · 수줍음 · 비웃음은 웃음, 울음은 슬픔 (예전엔 무표정으로 굳었다)
        if (e && opt.face && e.npc) e.mood = ({ smile: 'smile', happy: 'smile', blush: 'smile', smirk: 'smile', sad: 'sad', cry: 'sad', angry: 'angry', shock: 'shock' })[opt.face] || null;
        if (e && e.npc) e.talking = true;
        // 이야기 인물 목록에 없는 id(집 안 주민 tw_… 등)는 얼굴을 그 사람의 모습으로 그린다 — id만 넘기면 얼굴 칸이 비었다
        const inCast = !!(cid && G.cast && G.cast.get(cid));
        const r = await G.ui.say({ who: inCast ? cid : (e && e.look ? e : cid), ent: e, name: opt.name || (e ? e.name : cid ? G.cast && G.cast.name(cid) : null), text, face: opt.face, style: opt.style, shake: opt.shake, auto: opt.auto });
        if (e && e.npc) { e.talking = false; if (!opt.keepMood) e.mood = null; }
        return r;
      },
      /** 서술 (가운데 정렬, 얼굴 없음) */
      narr(text, opt) { return G.ui.say(Object.assign({ text, style: 'narr' }, opt || {})); },
      sys(text) { return G.ui.say({ text, style: 'sys' }); },
      /** 고르기: opts = ['…', {t, tag, if, sub}] → 고른 번호 (조건으로 빠진 것도 원래 번호) */
      async choice(prompt, opts, o) {
        // 고르기 앞의 말도 얼굴을: who가 없고 이름만 있으면 곁에 선 그 사람으로
        let fw = (o && o.who) || null;
        if (!fw && o && o.name && !/narr|sys|remote/.test(o.style || '')) { const e2 = byName(o.name); if (e2) fw = e2.cid && G.cast && G.cast.get(e2.cid) ? e2.cid : e2; }
        else if (typeof fw === 'string' && !(G.cast && G.cast.get(fw))) { const e2 = who(fw); if (e2 && e2.look) fw = e2; }
        if (prompt) await G.ui.say({ who: fw, name: o && o.name, text: prompt, style: o && o.style, keep: true });
        const list = opts.map((x, i) => (typeof x === 'string' ? { t: x, i } : Object.assign({ i }, x))).filter((x) => x.if == null || x.if);
        const k = await G.ui.choose(list);
        G.ui.closeDialog();
        return list[k].i;
      },
      async confirm(prompt, yes, no) { return (await c.choice(prompt, [yes || '예', no || '아니요'])) === 0; },

      /* ── 움직임 ── */
      /** 걸어가기: 픽셀 좌표.
          예전엔 0.6초 막히면 목적지로 순간 이동했다 — 이제 막히면 칸 길을 찾아 돌아가고, 길이 없으면 그대로 비집고 걸어간다 */
      move(w, x, y, o) {
        const e = who(w); if (!e) return Promise.resolve();
        o = o || {};
        const sp = o.speed || (e === W().player ? 70 : 46);
        e.script = true;
        let stuck = 0, way = null, wi = 0, tried = false, ghost = !!(o.ghost || e.noClip), map0 = W().map;
        return frames((dt) => {
          if (e.dead || W().map !== map0) { e.script = false; return true; }
          const d = U.dist(e.x, e.y, x, y);
          if (d < 1.5) { e.x = x; e.y = y; e.state = 'idle'; e.vx = e.vy = 0; e.script = false; if (o.face) e.dir = o.face; E.settle(W().map, e); return true; }
          let gx = x, gy = y;
          if (way) { while (wi < way.length - 1 && U.dist(e.x, e.y, way[wi][0], way[wi][1]) < 2) wi++; gx = way[wi][0]; gy = way[wi][1]; }
          const gd = U.dist(e.x, e.y, gx, gy);
          const [nx, ny] = U.norm(gx - e.x, gy - e.y);
          const step = Math.min(gd, sp * dt);
          const ox = e.x, oy = e.y;
          if (ghost) { e.x += nx * step; e.y += ny * step; } else E.move(W().map, e, nx * step, ny * step);
          if (U.dist(ox, oy, e.x, e.y) < step * 0.2) {
            stuck += dt;
            if (stuck > 0.45) {
              stuck = 0;
              if (!tried && G.presence) { tried = true; way = G.presence.pathAround(W().map, e, x, y); wi = 0; if (!way || !way.length) { way = null; ghost = true; } }
              else ghost = true;   // 돌아갈 길도 없다: 사람 사이 · 물건 틈을 비집고 간다 (순간 이동하지 않는다)
            }
          } else stuck = 0;
          e.dir = U.dir4(nx, ny, e.dir); e.state = 'walk'; e.walkT = (e.walkT || 0) + dt * sp / 46; e.vx = nx * sp; e.vy = ny * sp;
          return false;
        });
      },
      /** 칸 좌표로 걸어가기 */
      walk(w, tx, ty, o) { return c.move(w, tx * TS + 8, ty * TS + 12, o); },
      /** 여러 명 동시에 */
      all(...ps) { return Promise.all(ps); },
      face(w, d) { const e = who(w); if (!e) return; if (typeof d === 'string') e.dir = d; else { const t = who(d); if (t) e.dir = U.dir4(t.x - e.x, t.y - e.y, e.dir); } },
      faceEach(a, b) { c.face(a, b); c.face(b, a); },
      emote(w, k, life) { const e = who(w); if (!e) return; e.emote = { k, t: 0, life: life || 1.2 }; sfx(k === '!' ? 'surprise' : k === '?' ? 'question' : 'emote'); },
      bubble(w, text, o) { const e = who(w); if (e) G.cine.bubble(e, text, o || {}); },
      anim(w, a, sec) { const e = who(w); if (!e) return; e.forceAnim = a; e.forceFps = 6; if (sec) return wait(sec).then(() => { e.forceAnim = null; }); },
      stopAnim(w) { const e = who(w); if (e) e.forceAnim = null; },
      /** 주인공 걷기를 잠그기 */
      lock(v) { const p = W().player; if (p) { p.locked = v !== false; if (p.locked) { p.state = 'idle'; p.vx = p.vy = 0; } } },
      jump(w, h) { const e = who(w); if (!e) return; let t = 0; sfx('jump'); return frames((dt) => { t += dt; e.jz = Math.sin(Math.min(1, t / 0.35) * Math.PI) * (h || 8); if (t >= 0.35) { e.jz = 0; return true; } return false; }); },
      shakeEnt(w, sec) { const e = who(w); if (!e) return; const x0 = e.x; let t = 0; return frames((dt) => { t += dt; e.x = x0 + (Math.floor(t * 30) % 2 ? 1 : -1); if (t >= (sec || 0.4)) { e.x = x0; return true; } return false; }); },

      /* ── 카메라 · 화면 ── */
      cam(x, y, speed) { W().cam.lock = { x, y, speed: speed || 3 }; },
      camOn(w, speed) { const e = who(w); if (e) W().cam.lock = { get x() { return e.x; }, get y() { return e.y - 12; }, speed: speed || 4 }; },
      camFree() { W().cam.lock = null; },
      /** 카메라가 목표에 닿을 때까지 */
      camWait() { return frames(() => { const cm = W().cam, v = W().view; if (!cm.lock) return true; const tx = cm.lock.x - v.w / 2, ty = cm.lock.y - v.h / 2; return Math.abs(cm.x - tx) < 2 && Math.abs(cm.y - ty) < 2 || true; }).then(() => wait(0.6)); },
      cinema(on) { G.cine.letterbox(on !== false); return wait(0.4); },
      fade(out, o) { return G.cine.fade(out, o); },
      flash(col, sec) { G.cine.flash(col || '#fff', sec || 0.3); },
      shake(a, s) { W().shake(a || 3, s || 0.3); },
      slow(f, s) { W().slowmo(f, s); },
      chapter(no, title, sub) { return G.cine.chapter(no, title, sub); },
      area(name, sub) { G.cine.area(name, sub); },
      cutin(o) { return G.cine.cutin(o); },
      banner(t, sub, sec) { G.ui.banner(t, sub, sec); },
      toast(t, k) { G.ui.toast(t, k); },
      music(id) { if (G.audio) G.audio.music(id); },
      stopMusic(sec) { if (G.audio) G.audio.stop(sec); },
      sfx,
      jingle(id) { if (G.audio) G.audio.jingle(id); },
      filter(kind) { G.cine.filter(kind); },

      /* ── 상태 ── */
      get s() { return S(); },
      flag(k, v) { S().flags[k] = v == null ? true : v; },
      has(k) { return !!S().flags[k]; },
      unflag(k) { delete S().flags[k]; },
      give(id, n) { G.st.give(S(), id, n || 1); },
      take(id, n) { return G.st.take(S(), id, n || 1); },
      gold(n) { S().gold = Math.max(0, S().gold + n); if (n > 0) sfx('coin'); },
      exp(n) { const up = G.st.gainExp(S(), n); if (up) G.combat.levelUp(W().player, up); },
      /** 세력 마음: dawn(새벽단) · order(질서 · 기사단) · night(밤 · 미드나잇) */
      route(k, n, quiet) {
        const s = S();
        s.route[k] = (s.route[k] || 0) + (n || 1);
        if (!quiet) G.ui.toast({ dawn: '[r]새벽[/]의 마음이 기울었다', order: '[b]질서[/]의 마음이 기울었다', night: '[p]밤[/]의 마음이 기울었다' }[k] + ' (+' + (n || 1) + ')', 'white');
      },
      bond(id, n) { const s = S(); s.bond[id] = (s.bond[id] || 0) + (n || 1); },
      quest(id, st) { const s = S(); const q = s.quests[id] = s.quests[id] || { st: 'on', t: s.t }; const was = q.st; q.st = st || 'on'; const Q = G.data.QUESTS && G.data.QUESTS[id]; if (Q && was !== q.st) { if (q.st === 'on' && !was) { G.ui.toast('새 부탁: ' + Q.name, 'gold'); if (G.audio) G.audio.jingle('quest'); } else if (q.st === 'done') { G.ui.toast('부탁 완료: ' + Q.name, 'good'); if (G.audio) G.audio.jingle('quest'); } } },
      truth(id) { const s = S(); if (s.truth[id]) return false; s.truth[id] = s.t; const T = G.data.TRUTHS && G.data.TRUTHS[id]; G.ui.toast('진실의 조각: ' + (T ? T.name : id), 'white'); if (G.audio) G.audio.jingle('secret'); return true; },
      book(id) { const s = S(); if (s.books[id]) return false; s.books[id] = s.t; return true; },
      abyss(id) { const s = S(); if (s.abyss[id]) return false; s.abyss[id] = s.t; return true; },
      journal(text) { const s = S(); s.log.unshift({ t: s.t, text }); if (s.log.length > 120) s.log.pop(); },
      save() { G.st.save(S(), true); },   // 장면 안에서 일부러 남기는 기록 (장면이 끝나는 자리)
      heal() { const s = S(), d = G.st.derive(s); s.hp = d.hpMax; s.mp = d.mpMax; delete s.flags.revived; },

      /* ── 물건 ── */
      /** 아이템을 머리 위로 들어 올린다 (젤다식) */
      async getItem(id, n, o) {
        o = o || {};
        const s = S(), p = W().player, it = G.data.ITEMS[id] || { name: id, desc: '' };
        G.st.give(s, id, n || 1);
        const big = it.big || (it.grade || 0) >= 4 || ['sword', 'tool', 'key'].includes(it.type) || id === 'heart_c' || id === 'heartpiece' || id === 'key_big' || it.type === 'tome';
        if (id === 'key_small') { const d = W().map.dungeon; s.keys[d] = (s.keys[d] || 0) + (n || 1) - 0; if (s.inv.key_small) delete s.inv.key_small; }
        if (id === 'key_big') { s.bigkeys[W().map.dungeon] = true; if (s.inv.key_big) delete s.inv.key_big; }
        if (id === 'map_d') { s.flags['dmap:' + W().map.dungeon] = true; if (s.inv.map_d) delete s.inv.map_d; }
        if (id === 'compass') { s.flags['dcomp:' + W().map.dungeon] = true; if (s.inv.compass) delete s.inv.compass; }
        if (p) { p.state = 'hold'; p.holdItem = id; p.dir = 'down'; }
        if (G.audio) G.audio.jingle(big ? 'key' : 'item');
        G.fx.glow(p.x, p.y - 26, '#fff8c0', big ? 20 : 8);
        if (big) G.fx.ring(p.x, p.y - 20, '#fff2a8', 28, 0.6, 2);
        const qty = (n || 1) > 1 ? ' ×' + n : '';
        const obj = U.josa(it.name + qty, '을/를').slice((it.name + qty).length);
        let text = '[y]' + it.name + qty + '[/]' + obj + ' 얻었다!' + (id === 'heartpiece' ? ' (' + (s.pieces || 4) + '/4)' : '');
        if (it.desc && !o.quiet) text += '\n[s]' + it.desc + '[/]';
        if (it.grade && it.grade >= 2 && G.prog) text = text.replace('[y]' + it.name, '[g' + it.grade + ']' + it.name) + ' [s](' + G.prog.gradeOf(it).name + ')[/]';
        if (it.req && G.prog && !G.prog.reqOk(s, it.req)) text += '\n[r]아직 다룰 수 없다 — 필요: ' + G.prog.reqText(s, it.req).replace(/\[\/?r\]/g, '') + '[/]';
        await G.ui.say({ text, style: 'sys', item: id });
        if (p) { p.state = 'idle'; p.holdItem = null; }
        if (it.onGet) await it.onGet(c);
      },
      async rest() {
        await c.fade(true, { sec: 0.6 });
        c.heal(); c.save();
        if (G.audio) G.audio.jingle('rest');
        await wait(1.2);
        if (G.story && G.story.onRest) await G.story.onRest(c);   // 가끔 꿈
        await c.fade(false, { sec: 0.6 });
        G.ui.toast('푹 쉬었다. (기록함)', 'good');
      },

      /* ── 존재 ── */
      spawn(spec) {
        if (spec.cid) for (const v of SC.visitors) if (v.cid === spec.cid && !v.dead) { v.dead = true; if (spec.x == null) { spec.x = v.x; spec.y = v.y; } }
        const n = new G.props.NPC(spec);
        if (spec.cid) for (const e of W().ents) if (e.walker && e.cid === spec.cid && !e.dead) e.hideIf = () => !n.dead; /* 길 위의 같은 사람은 장면 동안 숨는다 */
        n.x = spec.x; n.y = spec.y;
        if (!n.look || !Object.keys(n.look).length) { const cc = spec.cid && G.cast.get(spec.cid); if (cc) n.look = cc.look; }
        if (n.look && n.look.kind && !spec.drawFn && G.story.beastDraw) n.drawFn = G.story.beastDraw(n, n.look.kind);
        if (!n.name && spec.cid) n.name = G.cast.name(spec.cid);
        E.settle(W().map, n);
        W().add(n);
        // 화면 안에 세우면 빈 땅에 뚝 나타나지 않고 몇 걸음 밖에서 걸어 들어온다 (world/96d_presence)
        if (G.presence && !spec.noEnter) { try { G.presence.enter(n, spec); } catch (err) { console.error('[enter]', err); } }
        return n;
      },
      remove(w) { const e = who(w); if (e) e.dead = true; },
      foe(type, x, y, o) { return G.foes.spawn(type, x, y, o); },
      /** 다른 지도로 */
      async warp(mapId, x, y, dir, o) {
        o = o || {};
        if (!o.noFade) await c.fade(true, { sec: 0.3 });
        if (G.game.prepare) await G.game.prepare(mapId);
        G.game.goto(mapId, x, y, dir, o);
        if (!o.noFade) await c.fade(false, { sec: 0.3 });
      },
      /** 보스전: 보스 존재를 받아 쓰러질 때까지 기다린다 */
      async battle(boss, o) {
        o = o || {};
        const lockCam = o.arena;
        G.hud.setBoss(boss);
        if (o.music !== false) c.music(o.music || 'boss');
        SC.running = false;              // 싸우는 동안은 조작한다
        SC.battle = true;
        await frames(() => boss.dead || (W().player && W().player.state === 'dead'));
        SC.battle = false;
        SC.running = true;
        void lockCam;
        return !boss.dead ? false : true;
      },
      /** 연출 없이 조작을 잠깐 돌려준다 (예: 짧은 전투) */
      async freeWhile(fn) { SC.running = false; await frames(fn); SC.running = true; },
      /** 이야기 결투: 막대가 다 닳으면 이긴다(true).
          예전엔 주인공 체력이 1이 되면 바로 끝나서, 바닥난 채로 들어오면 시작하자마자 · 큰 한 방에 상대 막대가 남은 채로 끝나 버렸다.
          이제 시작할 때 숨을 고르고, 쓰러뜨릴 일격을 맞으면 무릎이 꺾인다 — 다시 일어설지(처음부터 다시) 고른다. 받아들이면 false.
          o.rescue(c): 고르는 대신 누군가 일으켜 세운다(상대 막대는 그대로, 싸움은 이어진다) */
      async duel(boss, o) {
        o = o || {};
        const s = S();
        c.heal(); s.duelDown = false;
        for (;;) {
          await c.freeWhile(() => boss.hp <= 1 || boss.dead || boss.dying || s.duelDown);
          if (boss.hp <= 1 || boss.dead || boss.dying) { s.duelDown = false; return true; }
          const p = W().player;
          boss.holdT = 99;   // 고르는 동안 상대도 멈춘다
          for (const e of W().ents) if (e.kind === 'shot' && e.owner !== 'player') e.dead = true;
          W().slowmo(0.3, 0.6); c.sfx('hurt');
          if (p) { p.vx = p.vy = 0; p.setState('hurt'); }
          if (o.rescue) await o.rescue(c);
          else {
            const k = await c.choice('무릎이 꺾였다. ' + U.josa(boss.name, '은/는') + ' 아직 서 있다.', [{ t: '다시 일어선다', sub: '숨을 고르고 처음부터 다시 겨룬다' }, '패배를 받아들인다']);
            if (k === 1) { boss.holdT = 0; s.duelDown = false; return false; }
            // 다시 일어선다: 숨을 고르는 동안(잠깐 어두워진다) 상대도 제자리로 — 눈앞에서 순간 이동하지 않게
            await c.fade(true, { sec: 0.35 });
            if (boss.resetDuel) boss.resetDuel();
            for (const e of W().ents) if (e.kind === 'shot' && e.owner !== 'player') e.dead = true;
            c.heal(); if (p) { p.vx = p.vy = 0; p.setState('idle'); }
            await wait(0.25);
            await c.fade(false, { sec: 0.4 });
          }
          c.heal(); s.duelDown = false;
          if (p) { p.inv = 1.4; p.setState('idle'); }
          boss.holdT = 0.8;
        }
      },
      shop(id) { return G.ui.shop(id); },
      forge() { return G.ui.forge(); },
      async ending(id) { return G.game.ending(id); },
    };
    return c;
  }

  /** 장면 실행. 이미 도는 중이면 줄 세운다 */
  function run(fn, o) {
    return new Promise((resolve) => {
      SC.queue.push({ fn, o: o || {}, resolve });
      if (!SC.running && !SC.busy) next();
    });
  }
  async function next() {
    const job = SC.queue.shift();
    if (!job) { SC.busy = false; SC.running = false; return; }
    SC.busy = true; SC.running = true;
    const p = W().player;
    if (p && p.state !== 'dead') { if (p.carry && !job.o.keepCarry) p.carry = null; if (p.busy && p.state !== 'hold') p.setState('idle'); p.vx = p.vy = 0; }
    G.input.eatAll();
    const c = ctx();
    try { await job.fn(c); }
    catch (err) { console.error(err); }
    finally {
      G.ui.closeDialog();
      try { dismiss(); } catch (e2) { console.error(e2); }
      if (G.cine.isLetterbox() && !job.o.keepCinema) G.cine.letterbox(false);
      if (!job.o.keepCam) W().cam.lock = null;
      if (p) p.locked = false;
      SC.running = false; SC.busy = false;
      G.input.eatAll();
      job.resolve();
      if (SC.queue.length) next();
    }
  }
  /** 칸 트리거 · 지역 진입에서 한 번만 */
  function once(key, fn, o) { const s = S(); if (s.flags[key]) return Promise.resolve(); s.flags[key] = true; return run(fn, o); }

  Object.assign(SC, { run, once, update, wait, frames, ctx, who });
  G.script = SC;
})();
