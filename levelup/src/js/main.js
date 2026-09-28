/* 본체: 부팅 · 루프 · 맵 이동 · 렙업 버튼 · 레벨업 연출 · 기절 · 저장 · 순간이동 · 타이틀/지도 그림 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, E = G.engine, F = G.field, UI = G.ui, B = G.battle, S = G.script;
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = 'infinite-levelup-v2';
  const SHELL = {
    green: ['#3aa84a', '#1f6a2c', '#7ad86a'], red: ['#c8483a', '#7a2418', '#ff8a6a'], blue: ['#3a78c8', '#1a3a78', '#7ab8ff'], yellow: ['#c89a28', '#6a4a10', '#ffd870'],
    purple: ['#7a4ab0', '#3a2268', '#c49bff'], rainbow: ['#d85a9a', '#6a2a5a', '#ffb0d8'], white: ['#7a94b4', '#34445e', '#e0ecff'], gray: ['#62626e', '#30303a', '#a8a8b8'],
    black: ['#3a3058', '#15102a', '#8a7ab8'], colorful: ['#e8703a', '#7a3a7a', '#ffd84a'], space: ['#3a4a6a', '#10182a', '#8ab0e0'], planet: ['#b8902a', '#4a3010', '#fff0a8'],
  };
  G.maps = G.maps || {}; G.quests = G.quests || {}; G.books = G.books || {};
  G.hooks = G.hooks || { level: [], rank: [], enter: [], click: [] };
  G.world = G.world || { towns: [] };

  const M = { running: false, lastSave: 0, toastT: 0, pending: [], lvToastT: 0, infoT: 0 };
  let cv, g, VW = 240, VH = 176;

  /* ───────── 화면 크기 ───────── */
  function resize() {
    const sc = $('screen');
    const r = sc.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = window.devicePixelRatio || 1;
    const devW = Math.round(r.width * dpr), devH = Math.round(r.height * dpr);
    const s = Math.max(1, Math.round(devW / 200));
    VW = Math.max(120, Math.floor(devW / s)); VH = Math.max(100, Math.floor(devH / s));
    cv.width = VW; cv.height = VH;
    const cw = (VW * s) / dpr, ch = (VH * s) / dpr;
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.style.left = Math.round((r.width - cw) / 2) + 'px'; cv.style.top = Math.round((r.height - ch) / 2) + 'px';
    g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    F.setView(VW, VH);
  }

  /* ───────── 장소 ───────── */
  function mapRegion(m) { return (m && m.region) || 'green'; }
  /** 장소의 기운 = 그 땅이 머금은 빛의 농도를 레벨로 나타낸 값 (멀고 위험한 곳일수록 높다) */
  function placeLevel() { const m = F.map; return m ? m.ki || D.REG[mapRegion(m)].lv[0] : 1; }
  function placeBase() {
    const m = F.map;
    if (!m) return { exp: 1, gold: 1 };
    if (m.click) return m.click;
    const L = placeLevel();
    const k = D.clickBase(L, m.kiMul || 1);
    return { exp: k, gold: k * D.B.goldRatio };
  }
  function spotMult() { const sp = F.spotHere(); if (!sp) return 1; const s = G.state; if (sp.hidden && !s.spots[F.id + ':' + sp.x + ':' + sp.y]) return 1; return sp.mult || 3; }
  function setShell(region) {
    const c = SHELL[region] || SHELL.green;
    const st = document.documentElement.style;
    st.setProperty('--shell', c[0]); st.setProperty('--shell-d', c[1]); st.setProperty('--shell-l', c[2]);
  }
  function mapMusic(m) { return (m && m.music) || { green: 'green', red: 'red', blue: 'blue', yellow: 'yellow', purple: 'purple', rainbow: 'rainbow', white: 'white', gray: 'gray', black: 'black', colorful: 'colorful', space: 'space', planet: 'planet' }[mapRegion(m)] || 'field'; }
  function resumeMusic() { const m = F.map; G.audio.music(typeof m.musicFn === 'function' ? m.musicFn(G.state) : mapMusic(m)); }

  async function warp(map, x, y, dir, opt) {
    opt = opt || {};
    const s = G.state;
    if (!G.maps[map]) { UI.toast('아직 갈 수 없는 곳이다.', 'bad'); return; }
    if (!opt.instant) { G.audio.sfx(opt.sfx || 'door'); await UI.fade(1, 220); }
    enterMap(map, x, y, dir, opt);
    if (!opt.instant) await UI.fade(0, 260);
    queueEnter(opt);
    void s;
  }
  function enterMap(map, x, y, dir, opt) {
    opt = opt || {};
    const s = G.state;
    const prev = F.map;
    F.load(map, x, y, dir);
    const m = F.map;
    setShell(mapRegion(m));
    if (!opt.keepMusic) resumeMusic();
    $('place-name').textContent = m.name;
    const first = !s.flags['visit_' + map];
    s.flags['visit_' + map] = true;
    if (m.banner !== false && (!prev || prev.area !== m.area || first || opt.banner) && !opt.noBanner) UI.banner(m.name, m.sub || (m.region ? D.REG[m.region].name : ''));
    M.infoT = 0;
  }
  function queueEnter(opt) {
    const m = F.map;
    if (opt && opt.noEnter) return;
    const run = () => { if (m.enter && F.map === m) S.run(m.enter); for (const h of G.hooks.enter) h(m.id || F.id); };
    if (S.running) M.pending.push(run); else run();
  }
  function afterScript() {
    const p = M.pending.splice(0);
    for (const fn of p) fn();
    checkTriggers();
  }
  function refreshWorld() { F.refreshNpcs(); }

  /* ───────── 필드 반응 ───────── */
  function checkTriggers() {
    if (S.running || B.active || !F.map) return;
    const s = G.state, p = F.player;
    for (const tr of F.map.triggers || []) {
      if (tr.once && s.flags[tr.once]) continue;
      if (tr.cond && !tr.cond(s)) continue;
      const w = tr.w || 1, h = tr.h || 1;
      if (p.x >= tr.x && p.x < tr.x + w && p.y >= tr.y && p.y < tr.y + h) {
        if (tr.once) s.flags[tr.once] = true;
        S.run(tr.run);
        return;
      }
    }
  }
  F.onStep = (ev) => {
    const s = G.state;
    if (ev.warp) {
      const w = ev.warp;
      if (w.req && !E.meets(s, w.req)) { gateMsg(w.req, w.msg); return; }
      if (w.cond && !w.cond(s)) { if (w.msg) S.run((c) => c.say(null, w.msg)); return; }
      warp(w.to, w.tx != null ? w.tx : w.x, w.ty != null ? w.ty : w.y, w.dir, { sfx: w.sfx || (w.edge ? 'step' : 'door') });
      return;
    }
    const sp = F.spotHere();
    if (sp) {
      const key = F.id + ':' + sp.x + ':' + sp.y;
      if (sp.hidden && !s.spots[key]) { s.spots[key] = 1; G.audio.jingle('secret'); UI.toast('숨은 수련 샘을 찾았다! 여기서 렙업하면 ×' + (sp.mult || 10), 'white'); F.burst(sp.x * 16 + 8, sp.y * 16 + 8, ['#ffe066', '#ffffff'], 24); }
      else if (!sp.hidden && !s.flags.tip_spot) { s.flags.tip_spot = true; UI.toast('[y]수련 샘[/] 위에서 렙업하면 경험치와 골드가 ×' + (sp.mult || 3) + '!', 'gold'); }
    }
    checkTriggers();
  };
  // edges에서 오는 이동은 field가 {warp:{to,x,y,dir,req}}로 넘긴다
  function gateMsg(req, msg) {
    const s = G.state;
    const parts = [];
    if (req.lv && s.lv < req.lv) parts.push('레벨 [y]' + U.fmtInt(req.lv) + '[/] 이상 (지금 ' + U.fmtInt(s.lv) + ')');
    if (req.rank && (s.ranks[req.rank[0]] || 0) < req.rank[1]) { const rk = D.RANKS.find((r) => r.id === req.rank[0]); parts.push('[y]' + rk.name + ' ' + req.rank[1] + '차[/] 이상'); }
    if (req.item && !E.has(s, req.item)) parts.push('[y]' + D.ITEMS[req.item].name + '[/]');
    if (req.flag && !s.flags[req.flag]) parts.push(req.flagText || '아직 때가 아니다');
    G.audio.sfx('buzz');
    S.run((c) => c.say(null, msg ? (parts.length ? [msg, '필요: ' + parts.join(', ')] : msg) : '이 길은 아직 지나갈 수 없다.' + (parts.length ? '\n필요: ' + parts.join(', ') : '')));
  }
  F.onInteract = (ev) => {
    if (S.running || B.active) return;
    const s = G.state;
    if (ev.type === 'npc') {
      const n = ev.npc;
      S.meet(n.id);
      S.run(async (c) => {
        if (n.talk) await n.talk(c, n);
        else await c.say(n.id, U.pick(['오늘도 렙업!', '좋은 날씨네.', '모험 중이야? 조심해.']));
        if (n.faceBack) n.dir = n.faceBack;
      });
      return;
    }
    if (ev.type === 'obj') { const o = ev.obj; S.run((c) => objAction(c, o)); return; }
    if (ev.type === 'critter') { const n = ev.npc; S.run((c) => (G.story.critter ? G.story.critter(c, n) : c.say(null, '작은 동물이 고개를 갸웃한다.'))); return; }
    if (ev.type === 'follower') { if (G.story.companion) S.run((c) => G.story.companion(c)); return; }
    if (ev.type === 'door') {
      const b = ev.b;
      if (b.cond && !b.cond(s)) { S.run((c) => c.say(null, b.locked || '문이 잠겨 있다.')); return; }
      if (b.talk) { S.run((c) => b.talk(c)); return; }
      if (b.to) warp(b.to, b.tx, b.ty, 'up');
      return;
    }
    if (ev.type === 'tower') { S.run((c) => (F.map.towerTalk ? F.map.towerTalk(c) : c.say(null, ['보랏빛 수정이 박힌 탑. [p]징수탑[/]이다.', '누군가 렙업할 때마다 수정이 희미하게 빛을 빨아들인다.']))); return; }
    if (ev.type === 'none') {
      const ch = ev.ch, m = F.map;
      if (m.examine) { const r = m.examine(ev.x, ev.y, ch); if (r) { S.run(typeof r === 'function' ? r : (c) => c.say(null, r)); return; } }
      if ((ch === '~' || ch === 'v') && G.story.canFish && G.story.canFish(s)) { S.run((c) => G.story.fishing(c, ev.x, ev.y)); return; }
      if (ch === 'n') { const [dx, dy] = F.DIRS[F.player.dir]; const n2 = F.npcAt(ev.x + dx, ev.y + dy); if (n2) { F.onInteract({ type: 'npc', npc: n2 }); n2.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[F.player.dir]; return; } }
      const txt = { h: '책이 빼곡하다. 딱히 눈에 띄는 책은 없다.', '~': '물이 맑다. 얼굴이 비친다.', q: '푹신해 보이는 침대다.', b: '통 안에서 짭짤한 냄새가 난다.', d: '책상 위에 쓰다 만 편지가 있다. 남의 편지는 읽지 않는다.', p: '잘 가꾼 화분이다.', f: '꽃이 예쁘게 피었다.', g: '이름이 닳아 지워진 비석이다.', y: '누군가의 석상이다. 이름표가 없다.', l: '따뜻한 불빛이 흔들린다.', L: '용암이다! 가까이 가면 뜨겁다.', u: '화면에 알 수 없는 숫자가 흐른다.', j: '창밖으로 별이 보인다.', K: '황금빛 수정이 은은하게 빛난다.', '@': '얼음 수정이 차갑게 빛난다.', X: '고철 더미다. 쓸 만한 건 없어 보인다.', R: '오래된 기둥이다. 무늬가 반쯤 지워졌다.', T: '커다란 나무다.', M: '거대한 버섯이다. 포자가 날린다.' }[ch];
      if (txt) S.run((c) => c.say(null, txt));
    }
  };
  async function objAction(c, o) {
    const s = G.state;
    if (o.talk) { await o.talk(c, o); return; }
    if (o.t === 'sign' || o.t === 'prop') {
      // 글은 이야기가 흐르며 바뀔 수 있다: text(s)
      const txt = typeof o.text === 'function' ? o.text(s) : o.text;
      if (txt) await c.say(null, txt);
      const key = 'look_' + F.id + '_' + o.x + '_' + o.y;
      if (o.first && !s.flags[key]) { s.flags[key] = 1; await o.first(c); }
      return;
    }
    if (o.t === 'book') { if (!s.books[o.id]) { unlockBook(o.id); G.audio.sfx('page'); } await UI.readBook(o.id); return; }
    if (o.t === 'chest') {
      if (s.chests[o.id]) { await c.say(null, '빈 상자다.'); return; }
      s.chests[o.id] = 1; G.audio.sfx('chest');
      if (o.item) c.give(o.item, o.n || 1);
      if (o.gold) c.gold(o.gold);
      if (o.text) await c.say(null, o.text);
      return;
    }
    if (o.t === 'pickup') {
      if (s.chests[o.id]) return;
      if (o.need && !o.need(s)) { await c.say(null, o.hint || '무언가 자라고 있다.'); return; }
      s.chests[o.id] = 1;
      if (o.item) c.give(o.item, o.n || 1);
      if (o.text) await c.say(null, o.text);
      if (o.after) await o.after(c);
      return;
    }
    if (o.t === 'orbshine') {
      if (s.orbs[o.orb]) return;
      if (o.need && !o.need(s)) { await c.say(null, o.hint || '무언가 반짝인다. 하지만 지금은 손이 닿지 않는다.'); return; }
      await getOrb(o.orb, c);
      return;
    }
    if (o.t === 'gate') { gateMsg(o.req || {}, o.msg); return; }
  }
  F.onEncounter = (mo) => {
    if (S.running || B.active) return;
    const s = G.state;
    if (mo.stun && mo.stun > s.t) return;
    S.run(async (c) => {
      if (mo.talk) { await mo.talk(c, mo); return; }
      const win = await c.battle(mo.mon, { boss: mo.boss });
      if (win) { F.removeMon(mo); if (mo.flag) c.set(mo.flag); if (mo.after) await mo.after(c, mo); }
      else if (B.lastResult === 'flee') mo.stun = s.t + 3;
    });
  };

  /* ───────── 렙업 버튼 ───────── */
  function clickField(force) {
    if (!G.state || (!force && S.running) || B.active) return;
    const s = G.state;
    const noButton = (msg) => { if (performance.now() - M.toastT > 1200) { M.toastT = performance.now(); UI.toast(msg, 'bad'); G.audio.sfx('buzz'); } };
    if (s.flags.button_stolen) return noButton('시작의 버튼이 없다! 까치를 쫓아가자.');
    if (!E.has(s, 'button')) return noButton('아직 누를 버튼이 없다. 부엌의 할머니가 부르신다.');
    const d = E.derive(s);
    if (E.registerClick(s)) { G.audio.sfx('fever'); UI.toast('[y]피버![/] 8초 동안 경험치·골드 두 배!', 'gold'); }
    const mult = spotMult();
    const v = E.clickValue(s, placeBase(), mult, d);
    s.tot.clicks++;
    gainExp(v.exp, false, d);
    E.addGold(s, v.gold);
    const p = F.player;
    F.addFloat(p.px + 8 + (Math.random() - 0.5) * 10, p.py - 2, '+' + U.fmt(v.exp), mult > 1 ? '#ffe066' : '#b8ffd0', mult >= 10 ? 10 : 8);
    if (Math.random() < 0.5) F.particles.push({ x: p.px + 4 + Math.random() * 8, y: p.py + 10, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 20, c: mult > 1 ? '#ffe066' : '#ffffff', life: 0.5 });
    G.audio.sfx(mult > 1 ? 'clickspot' : 'click');
    for (const h of G.hooks.click) h(s);
  }
  function gainExp(x, show, dBefore) {
    const s = G.state;
    const d0 = dBefore || E.derive(s);
    const up = E.addExp(s, x);
    if (up) { const d1 = E.derive(s); s.hp = Math.min(d1.hpMax, s.hp + Math.max(0, d1.hpMax - d0.hpMax)); onLevelUp(up, B.active); }
    else if (show) UI.toast('경험치 +' + U.fmt(x), 'good');
    return up;
  }
  function onLevelUp(n, inBattle) {
    const s = G.state;
    const now = performance.now();
    if (!inBattle) {
      F.aura = 1;
      const p = F.player;
      F.burst(p.px + 8, p.py + 6, s.flags.lightColor ? [s.flags.lightColor, '#ffffff'] : ['#ffffff', '#f0fff0', '#e8f0ff'], Math.min(40, 10 + n * 4));
      if (now - M.lvToastT > 700) F.addFloat(p.px + 8, p.py - 12, 'LEVEL UP!', '#ffffff', 10);
    }
    if (now - M.lvToastT > 900) { G.audio.sfx('levelup'); M.lvToastT = now; }
    for (const h of G.hooks.level) h(s.lv, n);
  }
  function whiteLight(n) { const p = F.player; F.aura = 1.4; F.burst(p.px + 8, p.py + 6, ['#ffffff', '#ffffff', '#fff8d0'], n || 60); G.audio.jingle('white'); }

  /* ───────── 전투 뒤 · 기절 ───────── */
  async function afterBattle(res, mon, opt) {
    B.lastResult = res;
    const s = G.state;
    if (res === 'lose') {
      if (opt && opt.canLose) { s.hp = Math.max(1, E.derive(s).hpMax * 0.3); resumeMusic(); return; }
      await faint();
      return;
    }
    resumeMusic();
  }
  async function faint() {
    const s = G.state;
    s.tot.faints++;
    await UI.fade(1, 500);
    const r = s.respawn;
    enterMap(r.map, r.x, r.y, 'down', { noBanner: true });
    s.hp = E.derive(s).hpMax;
    await S.wait(0.4);
    await UI.fade(0, 500);
    await UI.say(null, ['눈앞이 캄캄해졌다…', '…정신을 차려 보니 마지막으로 쉬었던 곳이다.\n이리스의 빛이 쓰러진 사람을 지켜 준다.']);
    if (!s.flags.tip_faint) { s.flags.tip_faint = true; await UI.say('sys', '[y]팁[/] 적이 너무 세면 먼저 렙업 버튼으로 레벨을 올리자. 상점에서 무기와 방어구를 사는 것도 잊지 말자.'); }
  }
  function setRespawn() { const s = G.state; s.respawn = { map: s.map, x: F.player.x, y: F.player.y }; }

  /* ───────── 구슬 · 책 · 일지 ───────── */
  async function getOrb(id, c) {
    const s = G.state;
    const o = D.ORBS.find((x) => x.id === id);
    if (!o || s.orbs[id]) return;
    s.orbs[id] = 1;
    const oc = D.ORB_COLORS[o.c];
    G.audio.jingle('orb');
    UI.flash(oc.color, 600);
    F.burst(F.player.px + 8, F.player.py + 4, [oc.color, '#ffffff'], 40);
    F.aura = 1;
    const n = D.ORBS.filter((x) => x.c === o.c && s.orbs[x.id]).length;
    const say = c ? c.say : UI.say;
    await say(null, ['[y]' + oc.name + '[/]을(를) 손에 넣었다! (' + n + ' / 4)', '구슬 안에 숫자가 떠 있다. [big][y]' + o.v + '[/][/]', n === 4 ? '같은 색 구슬 네 개가 모두 모였다. 숫자를 모두 더하면… [y]등급소[/]의 비밀번호가 될 것 같다.' : '같은 색 구슬을 모두 모아 숫자를 더하면 등급소의 문이 열린다고 했다.']);
  }
  function unlockBook(id) { const s = G.state; if (!s.books[id]) { s.books[id] = 1; UI.toast('서재에 [y]「' + G.books[id].title + '」[/]이(가) 꽂혔다.', 'gold'); } }
  function setQuest(id, st) {
    const s = G.state, q = G.quests[id];
    if (!q) return;
    const prev = s.quests[id];
    if (prev === st) return;
    s.quests[id] = st;
    if (st === 'done') { G.audio.jingle('quest'); UI.toast((q.main ? '이야기 진행: ' : '부탁 완료: ') + '[y]' + q.name + '[/]', 'good'); }
    else if (prev == null) { G.audio.jingle('quest'); UI.toast((q.main ? '이야기: ' : '새 부탁: ') + '[y]' + q.name + '[/]', 'gold'); }
    else UI.toast('일지 갱신: [y]' + q.name + '[/]');
  }

  /* ───────── 등급 올리기 ───────── */
  async function doRankUp(i) {
    const s = G.state;
    const rk = D.RANKS[i];
    const before = D.SKILLS.filter((k) => E.skillUnlocked(s, k)).map((k) => k.id);
    if (!E.rankUp(s, i)) { G.audio.sfx('buzz'); return false; }
    G.audio.jingle('rankup');
    UI.flash(rk.color, 500);
    const t = s.ranks[rk.id];
    UI.toast('[y]' + rk.name + ' ' + t + '차[/] 전직! 클릭 배율과 능력이 올랐다.', 'gold');
    for (const k of D.SKILLS) if (E.skillUnlocked(s, k) && before.indexOf(k.id) < 0) UI.toast('새 기술: [y]' + k.icon + ' ' + k.name + '[/] — ' + k.desc, 'good');
    for (const h of G.hooks.rank) h(rk.id, t);
    return true;
  }

  /* ───────── 순간이동 ───────── */
  function travel(mapId) {
    const t = G.world.towns.find((x) => x.map === mapId);
    if (!t) return;
    S.run(async (c) => {
      await UI.fade(1, 300, true);
      G.audio.sfx('magic');
      enterMap(t.map, t.x, t.y, 'down', { banner: true });
      await S.wait(0.2);
      await UI.fade(0, 400);
      void c;
    });
  }

  /* ───────── 저장 ───────── */
  function storage() { try { return window.localStorage; } catch (_) { return null; } }
  function save(manual) {
    const s = G.state; if (!s) return;
    s.map = F.id; s.x = F.player.x; s.y = F.player.y; s.dir = F.player.dir;
    try { const st = storage(); if (st) st.setItem(SAVE_KEY, E.serialize(s)); if (manual) UI.toast('저장했다.', 'good'); }
    catch (_) { if (manual) UI.toast('이 브라우저에는 저장할 수 없다. 저장 코드를 복사해 두자.', 'bad'); }
    M.lastSave = performance.now();
  }
  function loadSave() {
    try { const st = storage(); const raw = st && st.getItem(SAVE_KEY); if (!raw) return null; return E.deserialize(raw); } catch (_) { return null; }
  }
  function exportCode() { save(); return 'ILU2:' + btoa(unescape(encodeURIComponent(E.serialize(G.state)))); }
  function importCode(code) {
    try {
      if (code.indexOf('ILU2:') !== 0) return false;
      const s = E.deserialize(decodeURIComponent(escape(atob(code.slice(5)))));
      if (!s || !G.maps[s.map]) return false;
      G.state = s; G.portraits.clear();
      enterMap(s.map, s.x, s.y, s.dir, { banner: true });
      G.audio.applySettings();
      save();
      return true;
    } catch (_) { return false; }
  }
  function wipe() { try { const st = storage(); st && st.removeItem(SAVE_KEY); } catch (_) { /* 무시 */ } location.reload(); }

  /* ───────── 루프 ───────── */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const s = G.state;
    if (s && M.running && g) {
      E.tick(s, dt, B.active);
      if (B.active) { B.update(dt); B.render(g, VW, VH); }
      else { F.held = UI.top() && UI.top().name === 'base' ? UI.heldDir : null; F.update(dt); F.render(g, VW, VH); }
      UI.hud();
      drawBarks();
      M.infoT -= dt;
      if (M.infoT <= 0) { M.infoT = 0.25; padInfo(); }
      if (now - M.lastSave > 20000 && !S.running && !B.active) save();
    }
    requestAnimationFrame(frame);
  }
  /* 사람들의 혼잣말: 캔버스 위에 또렷한 글씨로 띄운다 */
  const barkEls = new Map();
  function drawBarks() {
    const box = $('barks');
    if (!box) return;
    const show = !B.active && !S.running && M.running;
    const k = cv.clientWidth / VW;
    const live = new Set();
    if (show) {
      for (const n of F.npcs) {
        if (!(n.barkLife > 0) || n.hidden || (n.cond && !n.cond(G.state))) continue;
        live.add(n);
        let el = barkEls.get(n);
        if (!el) { el = document.createElement('div'); el.className = 'bark'; box.appendChild(el); barkEls.set(n, el); }
        if (el.textContent !== n.barkText) el.textContent = n.barkText;
        const x = cv.offsetLeft + (n.px - F.cam.x + 8) * k, y = cv.offsetTop + (n.py - F.cam.y - 4) * k;
        el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%,-100%)';
        el.style.opacity = n.barkLife < 0.4 ? String(n.barkLife / 0.4) : '1';
      }
    }
    for (const [n, el] of barkEls) if (!live.has(n)) { el.remove(); barkEls.delete(n); }
    // A 버튼 아래 글씨: 지금 A로 할 수 있는 일
    const cap = $('a-cap');
    if (cap) { const t = show && F.prompt ? F.prompt.k : ''; if (cap.textContent !== t) cap.textContent = t; }
  }
  function padInfo() {
    const s = G.state, d = E.derive(s);
    const base = placeBase(), mult = spotMult();
    const v = E.clickValue(s, base, mult, d);
    $('lv-val').textContent = B.active ? '두드려서 공격' : !E.has(s, 'button') ? '버튼 없음' : '+' + U.fmt(v.exp) + ' EXP';
    $('lvup').classList.toggle('spot', mult > 1 && !B.active);
    $('place-ki').textContent = '기운 ' + U.fmtInt(placeLevel()) + (mult > 1 ? ' ×' + mult : '');
    $('pi-left').textContent = F.map ? F.map.name : '';
    $('pi-right').textContent = '경험 ' + U.fmtMult(d.expM * d.tool) + ' · 골드 ' + U.fmtMult(d.goldM * d.tool);
  }

  /* ───────── 시작 ───────── */
  const baseLayer = {
    name: 'base',
    dir(d) { if (!S.running && !B.active && M.running) F.tryMove(d); }, dirUp() {},
    a() { if (!S.running && !B.active) F.interact(); },
    b() { if (!S.running && !B.active) UI.menu(); },
    lv() { clickField(); },
  };
  function newGame(name, gender) {
    G.state = E.newState(name, gender);
    G.state.hp = E.derive(G.state).hpMax;
    G.portraits.clear();
    G.audio.applySettings();
    M.running = true;
    enterMap('home', 5, 4, 'down', { noBanner: true });
    if (G.story && G.story.opening) S.run(G.story.opening);
    save();
  }
  function continueGame(s) {
    G.state = s;
    G.portraits.clear();
    G.audio.applySettings();
    M.running = true;
    const m = G.maps[s.map] ? s.map : 'home';
    enterMap(m, s.x, s.y, s.dir, { banner: true });
  }
  async function boot(hotData) {
    cv = $('cv'); g = cv.getContext('2d');
    UI.init();
    UI.push(baseLayer);
    resize();
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe($('screen'));
    requestAnimationFrame(frame);
    if (document.fonts && document.fonts.load) { try { await Promise.race([document.fonts.load("12px 'Galmuri11'"), S.wait(1.5)]); } catch (_) { /* 무시 */ } }
    if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ save: G.state ? E.serialize(G.state) : null }));
    if (hotData && hotData.save) { try { continueGame(E.deserialize(hotData.save)); return; } catch (_) { /* 새로 시작 */ } }
    const saved = loadSave();
    const r = await UI.title(!!saved);
    G.audio.unlock();
    if (r.mode === 'continue' && saved) continueGame(saved);
    else newGame(r.name, r.gender);
  }

  /* ───────── 타이틀 배경 · 대륙 지도 ───────── */
  function titleBg(c) {
    if (!c) return;
    const w = 120, h = 200; c.width = w; c.height = h;
    const x = c.getContext('2d');
    const stars = Array.from({ length: 70 }, (_, i) => [U.noise2(i, 1, 3) * w, U.noise2(i, 2, 3) * h * 0.7, U.noise2(i, 3, 3)]);
    (function k(t) {
      if (!c.isConnected) return;
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#07050e'); gr.addColorStop(0.7, '#1a1440'); gr.addColorStop(1, '#2a2050');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      for (const [sx, sy, p] of stars) { if (Math.sin(t / 400 + p * 20) > -0.3) { x.fillStyle = p > 0.8 ? '#fff0a8' : '#ffffff'; x.fillRect(Math.round(sx), Math.round(sy), 1, 1); } }
      // 황금별 아스트라와 흑점
      x.fillStyle = '#ffd84a'; x.beginPath(); x.arc(86, 34, 5, 0, Math.PI * 2); x.fill();
      x.globalAlpha = 0.25; x.beginPath(); x.arc(86, 34, 9 + Math.sin(t / 300), 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
      x.fillStyle = '#0b0a1c'; x.beginPath(); x.arc(94, 30, 2.5, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#ff3a5a'; x.lineWidth = 0.6; x.beginPath(); x.arc(94, 30, 3, 0, Math.PI * 2); x.stroke();
      // 언덕과 오두막
      x.fillStyle = '#1f3a2a'; for (let i = 0; i < w; i++) { const hh = 26 + Math.sin(i * 0.06) * 8 + Math.sin(i * 0.17) * 3; x.fillRect(i, h - hh, 1, hh); }
      x.fillStyle = '#132418'; for (let i = 0; i < w; i++) { const hh = 14 + Math.sin(i * 0.09 + 2) * 5; x.fillRect(i, h - hh, 1, hh); }
      x.fillStyle = '#0b1810'; x.fillRect(22, h - 40, 14, 9); x.fillStyle = '#ffd86a'; x.fillRect(27, h - 36, 3, 3);
      x.fillStyle = '#0b1810'; for (let i = 0; i < 9; i++) x.fillRect(20 + i, h - 44 + Math.abs(i - 4), 18 - i * 2 > 0 ? 1 : 1, 4);
      // 흰빛
      const pulse = (Math.sin(t / 500) + 1) / 2;
      x.globalAlpha = 0.3 + pulse * 0.4; x.fillStyle = '#ffffff'; x.fillRect(58, h - 34, 2, 2); x.globalAlpha = 1;
      requestAnimationFrame(k);
    })(0);
  }
  function drawWorldMap(c) {
    if (!c) return;
    const x = c.getContext('2d'); const w = c.width, h = c.height;
    x.fillStyle = '#0d1a2e'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { x.fillStyle = i % 3 ? '#12243c' : '#16304a'; x.fillRect((i * 37) % w, (i * 53) % h, 6, 1); }
    const s = G.state;
    const nodes = G.world.nodes || [];
    // 대륙 (초승달)
    x.fillStyle = '#23304a';
    for (const n of nodes) { x.beginPath(); x.arc(n.x, n.y, 17, 0, Math.PI * 2); x.fill(); }
    x.strokeStyle = '#3e5070'; x.lineWidth = 2; x.setLineDash([2, 3]);
    for (let i = 1; i < nodes.length; i++) { const a = nodes[i - 1], b = nodes[i]; if (b.sky) continue; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
    x.setLineDash([]);
    for (const n of nodes) {
      const known = n.maps.some((m) => s.flags['visit_' + m]);
      x.fillStyle = known ? n.color : '#2c3852';
      x.beginPath(); x.arc(n.x, n.y, known ? 9 : 7, 0, Math.PI * 2); x.fill();
      if (known) { x.fillStyle = '#ffffff'; x.font = "8px 'Galmuri11', monospace"; x.textAlign = 'center'; x.fillText(n.label, n.x, n.y + 19); }
      if (n.maps.indexOf(s.map) >= 0 || (G.maps[s.map] && G.maps[s.map].region === n.region && !nodes.some((m) => m.maps.indexOf(s.map) >= 0))) {
        const t = performance.now() / 300;
        x.strokeStyle = '#ffffff'; x.lineWidth = 1.5; x.beginPath(); x.arc(n.x, n.y, 12 + Math.sin(t) * 1.5, 0, Math.PI * 2); x.stroke();
      }
    }
    // 하늘의 황금별
    const star = nodes.find((n) => n.region === 'planet') || { x: w - 18, y: 14 };
    x.fillStyle = s.flags.visit_astra_gate ? '#ffd84a' : '#5a5030'; x.beginPath(); x.arc(star.x, star.y, 5, 0, Math.PI * 2); x.fill();
    if (!s.flags.ending) { x.fillStyle = '#0b0a1c'; x.beginPath(); x.arc(star.x + 6, star.y - 3, 2.5, 0, Math.PI * 2); x.fill(); }
    x.textAlign = 'left';
  }

  G.main = { boot, save, loadSave, exportCode, importCode, wipe, warp, enterMap, refreshWorld, placeBase, spotMult, gainExp, onLevelUp, whiteLight,
    getOrb, unlockBook, setQuest, afterBattle, faint, setRespawn, doRankUp, travel, afterScript, titleBg, drawWorldMap, resumeMusic, clickField, M };
})();
