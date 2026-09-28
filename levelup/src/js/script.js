/* 이야기 스크립트 실행기: async (c) => { await c.say(...); ... }
   c는 대화 · 선택 · 깃발 · 아이템 · 전투 · 이동 · 연출을 한데 모은 도구 상자다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, E = G.engine;
  const S = { running: false, depth: 0 };
  const DIR = { U: 'up', D: 'down', L: 'left', R: 'right' };
  const wait = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

  function parsePath(p, x, y) {
    if (Array.isArray(p)) return p;
    const out = [];
    for (const ch of p) { const d = DIR[ch]; if (!d) continue; const [dx, dy] = G.field.DIRS[d]; x += dx; y += dy; out.push([x, y]); }
    return out;
  }

  function entity(id) {
    const F = G.field;
    if (id === '@' || id === 'hero') return F.player;
    if (id === 'follower' || (F.follower && F.follower.id === id)) return F.follower;
    return F.npcs.find((n) => n.id === id);
  }

  function npcHandle(id) {
    const F = G.field;
    const get = () => entity(id);
    const h = {
      get x() { const n = get(); return n ? n.x : 0; }, get y() { const n = get(); return n ? n.y : 0; }, get n() { return get(); },
      async walk(path, speed) {
        const n = get(); if (!n) return;
        const steps = parsePath(path, n.x, n.y);
        if (n === F.player) { for (const [tx, ty] of steps) await heroStep(tx, ty); return; }
        if (n === F.follower) { for (const [tx, ty] of steps) { F.stepFollower(tx, ty); await wait(0.16); } return; }
        n.speed = speed || 1;
        await F.walkNpc(n, steps);
        n.speed = 1;
      },
      face(d) { const n = get(); if (!n) return h; if (d === '@') { const p = F.player; d = F.dirTo(n.x, n.y, p.x, p.y) || n.dir; } else if (DIR[d]) d = DIR[d]; n.dir = d; return h; },
      hide() { const n = get(); if (n) n.hidden = true; return h; },
      show() { const n = get(); if (n) n.hidden = false; return h; },
      to(x, y, d) { const n = get(); if (!n) return h; n.x = x; n.y = y; n.px = x * 16; n.py = y * 16; if (d) n.dir = d; return h; },
      emote(sym, dur) { const n = get(); if (n) F.emote(n, sym, dur); G.audio.sfx(sym === '!' ? 'surprise' : sym === '?' ? 'question' : 'emote'); return wait(0.5); },
      async jump() { const n = get(); if (!n) return; n.jump = 0.001; G.audio.sfx('jump'); await wait(0.35); },
      look(look) { const n = get(); if (!n) return h; n.look = look; n.sprite = F.spriteFor(look, G.state); return h; },
    };
    return h;
  }
  function heroStep(tx, ty) {
    const F = G.field, p = F.player;
    return new Promise((res) => {
      p.dir = F.dirTo(p.x, p.y, tx, ty) || p.dir;
      F.forceMove(tx, ty);
      const chk = () => { if (!p.moving) res(); else setTimeout(chk, 30); };
      setTimeout(chk, 30);
    });
  }

  function ctx() {
    const F = G.field, UI = G.ui;
    const s = () => G.state;
    const c = {
      get s() { return G.state; },
      get map() { return G.state.map; },
      get name() { return G.state.name; },
      wait,
      say: (who, text, opt) => { if (who && who !== 'sys') meet(who); return UI.say(who, text, opt); },
      narr: (text) => UI.say(null, text),
      sys: (text) => UI.say('sys', text),
      ask: (q, opts, who, opt) => { if (who) meet(who); return UI.ask(q, opts, who, opt); },
      async yes(q, who, yes, no) { return (await UI.ask(q, [yes || '예', no || '아니요'], who, { cancel: 1 })) === 0; },
      flag: (k) => !!s().flags[k],
      set(k, v) { s().flags[k] = v === undefined ? true : v; G.main.refreshWorld(); },
      unset(k) { delete s().flags[k]; G.main.refreshWorld(); },
      count(k, d) { s().flags[k] = (s().flags[k] || 0) + (d || 1); return s().flags[k]; },
      has: (id, n) => E.has(s(), id, n),
      give(id, n, quiet) {
        n = n || 1; E.give(s(), id, n);
        const it = D.ITEMS[id];
        if (it.type === 'weapon' || it.type === 'armor' || it.type === 'acc') E.autoEquip(s(), id);
        if (!quiet) { G.audio.sfx(it.type === 'key' ? 'key' : 'item'); UI.toast('[y]' + it.name + '[/]' + (n > 1 ? ' ' + n + '개를' : U.josa(it.name, '을/를').slice(it.name.length)) + ' 얻었다!', 'gold'); }
        return c;
      },
      take(id, n) { return E.take(s(), id, n || 1); },
      gold(n) { if (n > 0) { E.addGold(s(), n); G.audio.sfx('coin'); UI.toast('● ' + U.fmt(n) + ' 골드를 받았다.', 'gold'); } else if (n < 0) s().gold = Math.max(0, s().gold + n); },
      pay(n) { if (s().gold < n) return false; s().gold -= n; G.audio.sfx('coin'); return true; },
      exp(n) { G.main.gainExp(n, true); },
      heal() { s().hp = E.derive(s()).hpMax; G.audio.sfx('heal'); },
      orb: (id) => G.main.getOrb(id),
      async book(id) { G.main.unlockBook(id); await UI.readBook(id); },
      quest(id, st) { G.main.setQuest(id, st); },
      qs: (id) => s().quests[id],
      qdone: (id) => s().quests[id] === 'done',
      battle: (mon, opt) => G.battle.start(mon, opt || {}),
      shop: (id) => UI.shop(id),
      rank: (clerk) => UI.rankOffice(clerk),
      async inn(price, who) {
        price = price || 0;
        const q = price ? '하룻밤 쉬어 갈래요? ● ' + U.fmt(price) : '잠깐 쉬어 갈래요? 체력이 다 돌아와요.';
        if (!(await c.yes(q, who, '쉬어 간다', '괜찮다'))) return false;
        if (price && !c.pay(price)) { await c.say(who, '돈이 모자라네요. 다음에 또 와요.'); return false; }
        await c.rest();
        return true;
      },
      async rest() { await UI.fade(1, 400); G.audio.jingle('rest'); c.heal(); G.main.setRespawn(); await wait(1.4); await UI.fade(0, 400); UI.toast('푹 쉬었다. 이곳이 새 쉼터가 되었다.', 'good'); },
      async warp(map, x, y, dir, opt) { await G.main.warp(map, x, y, dir, opt); },
      fadeOut: (ms, white) => UI.fade(1, ms, white),
      fadeIn: (ms) => UI.fade(0, ms),
      shake: (ms, amp) => { UI.shake(ms, amp); G.audio.sfx('rumble'); },
      flash: (color, ms) => UI.flash(color, ms),
      music: (id) => G.audio.music(id),
      sfx: (id) => G.audio.sfx(id),
      jingle: (id) => G.audio.jingle(id),
      banner: (t, sub) => UI.banner(t, sub),
      chapter: (no, t, sub) => UI.chapter(no, t, sub),
      toast: (t, cls) => UI.toast(t, cls),
      npc: (id) => npcHandle(id),
      get hero() { return npcHandle('@'); },
      get dotori() { return npcHandle('follower'); },
      follow(id) { F.setFollower(id); },
      emote(id, sym, dur) { return npcHandle(id).emote(sym, dur); },
      meet,
      spawn(def) { F.addNpc(def); return npcHandle(def.id); },
      despawn(id) { F.removeNpc(id); },
      respawnHere() { G.main.setRespawn(); },
      burst(color, n) { const p = F.player; F.burst(p.px + 8, p.py + 6, Array.isArray(color) ? color : [color || '#ffffff'], n || 30); },
      light(n) { G.main.whiteLight(n); },
      async run(fn) { return fn(c); },
      travelOn() { s().flags.travel = true; },
      /** 제한 시간 동안 렙업 버튼 누르기 대결 → 누른 횟수 */
      clickRace(sec) {
        return new Promise((res) => {
          let k = 0, left = sec, started = false;
          const p = F.player;
          const L = UI.push({ name: 'race', dir() {}, a() {}, b() {}, lv() { if (left <= 0) return; if (!started) { started = true; tick(); } G.main.clickField(true); k++; F.addFloat(p.px + 8, p.py - 14, String(k), '#ffffff', 10); } });
          UI.toast('준비… 누르는 순간 시작! (' + sec + '초)', 'gold');
          function tick() {
            if (left <= 0) { UI.pop(L); UI.toast('끝! ' + k + '번!', 'gold'); res(k); return; }
            if (left <= 3 || left === sec) UI.toast(left + '초', left <= 3 ? 'bad' : '');
            left--; setTimeout(tick, 1000);
          }
        });
      },
      /** 렙업 버튼을 n번 누를 때까지 기다린다 (연습용) */
      waitClick(n, onEach) {
        return new Promise((res) => {
          let k = 0;
          const L = UI.push({ name: 'waitclick', dir() {}, a() {}, b() {}, lv() { G.main.clickField(true); k++; if (onEach) onEach(k); if (k >= (n || 1)) { UI.pop(L); res(); } } });
        });
      },
      refresh() { G.main.refreshWorld(); },
      lv: () => s().lv,
      rankOf: (id) => s().ranks[id] || 0,
    };
    return c;
  }
  function meet(who) {
    const id = String(who).split(':')[0];
    if (id && id !== '@' && G.chars[id] && !G.state.seen[id]) G.state.seen[id] = 1;
  }

  async function run(fn) {
    const F = G.field;
    S.depth++;
    const outer = S.depth === 1;
    if (outer) { S.running = true; F.busy = true; F.held = null; }
    try { await fn(S.ctx()); }
    catch (e) { console.error(e); G.ui.toast('이야기 진행 중 문제가 생겼다: ' + (e && e.message), 'bad'); }
    finally {
      S.depth--;
      if (outer) { S.running = false; F.busy = false; G.ui.hideDialog(); G.main.afterScript && G.main.afterScript(); }
    }
  }

  S.run = run; S.ctx = ctx; S.wait = wait; S.meet = meet;
  G.script = S;
})();
