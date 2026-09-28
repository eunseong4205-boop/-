/* 화면 위 DOM: 입력 층(layer) · 대화 · 선택지 · 알림 · 배너 · 메뉴 · 상점 · 등급소 · 지도 · 타이틀 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data, E = G.engine;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UI = { layers: [], heldDir: null };

  /* ───────── 입력 층 ─────────
     맨 위 층이 입력을 받는다. {name, dir(d), a(), b(), lv(), tap(), repeat} */
  function push(layer) { UI.layers.push(layer); G.field && (G.field.held = null); return layer; }
  function pop(layer) { const i = UI.layers.lastIndexOf(layer); if (i >= 0) UI.layers.splice(i, 1); }
  function top() { return UI.layers[UI.layers.length - 1] || null; }
  UI.push = push; UI.pop = pop; UI.top = top;
  UI.free = () => !top() || top().name === 'base';

  function route(kind, arg) {
    const L = top();
    if (!L) return;
    const fn = L[kind];
    if (fn) fn.call(L, arg);
  }
  UI.route = route;

  /* ───────── 조작부 ───────── */
  let repeatT = null, repeatDir = null;
  function dirDown(d) {
    if (repeatDir === d) return;
    dirUp();
    repeatDir = d; UI.heldDir = d;
    document.querySelectorAll('.dp').forEach((b) => b.classList.toggle('on', b.dataset.dir === d));
    route('dir', d);
    const L = top();
    if (L && L.repeat) repeatT = setTimeout(function rep() { if (repeatDir !== d) return; route('dir', d); repeatT = setTimeout(rep, 95); }, 330);
  }
  function dirUp() {
    clearTimeout(repeatT); repeatT = null; repeatDir = null; UI.heldDir = null;
    document.querySelectorAll('.dp.on').forEach((b) => b.classList.remove('on'));
    route('dirUp');
  }
  function flashBtn(el) { if (!el) return; el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 90); }

  function initInput() {
    const dp = $('dpad');
    let dpId = null;
    const dirAt = (e) => {
      const r = dp.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return null;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    };
    dp.addEventListener('pointerdown', (e) => { e.preventDefault(); dpId = e.pointerId; try { dp.setPointerCapture(e.pointerId); } catch (_) { /* 무시 */ } G.audio && G.audio.unlock(); const d = dirAt(e); if (d) dirDown(d); });
    dp.addEventListener('pointermove', (e) => { if (e.pointerId !== dpId) return; const d = dirAt(e); if (d && d !== repeatDir) dirDown(d); });
    const end = (e) => { if (e.pointerId !== dpId) return; dpId = null; dirUp(); };
    dp.addEventListener('pointerup', end); dp.addEventListener('pointercancel', end); dp.addEventListener('lostpointercapture', end);
    const btn = (id, kind) => {
      const el = $(id);
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); G.audio && G.audio.unlock(); flashBtn(el); route(kind); });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
    };
    btn('bA', 'a'); btn('bB', 'b'); btn('lvup', 'lv');
    $('bMenu').addEventListener('click', () => { G.audio && G.audio.unlock(); if (UI.free()) UI.menu(); });
    $('bMap').addEventListener('click', () => { G.audio && G.audio.unlock(); if (UI.free()) UI.worldMap(); });
    $('bBag').addEventListener('click', () => { G.audio && G.audio.unlock(); if (UI.free()) UI.menu('bag'); });
    $('screen').addEventListener('pointerdown', (e) => {
      if (e.target.closest('#modal, #choices, .bcmd, #title')) return;
      G.audio && G.audio.unlock();
      const L = top(); if (L && L.tap) { e.preventDefault(); L.tap(e); }
    });
    const keyDir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;
      G.audio && G.audio.unlock();
      const d = keyDir[e.key];
      if (d) { e.preventDefault(); if (!e.repeat) dirDown(d); return; }
      if (e.repeat) return;
      if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter' || e.key === 'j' || e.key === 'J') { e.preventDefault(); flashBtn($('bA')); route('a'); }
      else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape' || e.key === 'Backspace' || e.key === 'k' || e.key === 'K') { e.preventDefault(); flashBtn($('bB')); route('b'); }
      else if (e.key === ' ' || e.key === 'l' || e.key === 'L') { e.preventDefault(); flashBtn($('lvup')); route('lv'); }
      else if ((e.key === 'm' || e.key === 'M') && UI.free()) UI.worldMap();
      else if ((e.key === 'i' || e.key === 'I' || e.key === 'Tab') && UI.free()) { e.preventDefault(); UI.menu(); }
    });
    window.addEventListener('keyup', (e) => { const d = keyDir[e.key]; if (d && d === repeatDir) dirUp(); });
    window.addEventListener('blur', dirUp);
  }

  /* ───────── 알림 · 배너 · 장 제목 · 화면 효과 ───────── */
  function toast(msg, cls) {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (cls || '');
    el.innerHTML = markup(msg);
    box.appendChild(el);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    setTimeout(() => el.remove(), 2700);
  }
  function banner(title, sub) {
    const b = $('banner');
    b.hidden = true; void b.offsetWidth;
    $('banner-title').textContent = title; $('banner-sub').textContent = sub || '';
    b.hidden = false;
    clearTimeout(banner.t); banner.t = setTimeout(() => { b.hidden = true; }, 2900);
  }
  function chapter(no, title, sub) {
    return new Promise((res) => {
      const el = $('chapter');
      $('chapter-no').textContent = no; $('chapter-title').textContent = title; $('chapter-sub').textContent = sub || '';
      el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
      G.audio && G.audio.sfx('chapter');
      let done = false;
      const L = push({ name: 'chapter', a: fin, b: fin, lv: fin, tap: fin });
      const t = setTimeout(fin, 4200);
      function fin() { if (done) return; done = true; clearTimeout(t); pop(L); el.hidden = true; res(); }
    });
  }
  function fade(to, ms, white) {
    return new Promise((res) => {
      const f = $('fade');
      f.classList.toggle('white', !!white);
      f.style.transition = 'opacity ' + (ms || 350) + 'ms';
      requestAnimationFrame(() => { f.style.opacity = to; setTimeout(res, (ms || 350) + 20); });
    });
  }
  function flash(color, ms) {
    const f = $('fade');
    f.style.transition = 'none'; f.style.background = color || '#fff'; f.style.opacity = 0.85;
    requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity ' + (ms || 400) + 'ms'; f.style.opacity = 0; setTimeout(() => { f.style.background = ''; }, (ms || 400) + 30); }));
  }
  function shake(ms, amp) {
    const s = $('screen');
    const t0 = performance.now(); amp = amp || 4;
    (function k() { const t = performance.now() - t0; if (t > (ms || 400)) { s.style.transform = ''; return; } const a = amp * (1 - t / (ms || 400)); s.style.transform = 'translate(' + ((Math.random() - 0.5) * 2 * a).toFixed(1) + 'px,' + ((Math.random() - 0.5) * 2 * a).toFixed(1) + 'px)'; requestAnimationFrame(k); })();
  }
  Object.assign(UI, { toast, banner, chapter, fade, flash, shake });

  /* ───────── 대화 ───────── */
  // 표시: [y]금색[/] [w]흰빛[/] [r][b][g][p] 색, [s]작게[/], [big]크게[/]
  function markup(text) {
    let out = '', open = false;
    const s = esc(nameSub(text));
    out = s.replace(/\[(\/|[a-z]+)\]/g, (m, t) => {
      if (t === '/') { const r = open ? '</span>' : ''; open = false; return r; }
      const r = (open ? '</span>' : '') + '<span class="' + t + '">'; open = true; return r;
    });
    return out + (open ? '</span>' : '');
  }
  function nameSub(text) { return U.nameSub(text, (G.state && G.state.name) || '하늘'); }
  function segments(text) {
    const segs = []; let cls = '';
    const s = nameSub(text);
    let last = 0;
    s.replace(/\[(\/|[a-z]+)\]/g, (m, t, i) => { if (i > last) segs.push({ cls, t: s.slice(last, i) }); cls = t === '/' ? '' : t; last = i + m.length; return m; });
    if (last < s.length) segs.push({ cls, t: s.slice(last) });
    return segs;
  }
  UI.markup = markup;

  function whoInfo(who) {
    if (!who) return null;
    let id = who, emo = 'normal';
    const k = who.indexOf(':');
    if (k >= 0) { id = who.slice(0, k); emo = who.slice(k + 1); }
    if (id === '@') return { id, emo, name: (G.state && G.state.name) || '하늘', color: '#b8f0a8', voice: 1.15 };
    const ch = G.chars[id];
    if (!ch) return { id, emo, name: id, color: '#ffe8a8', voice: 1 };
    return { id, emo, name: U.nameSub(ch.name, G.state.name), color: ch.color, voice: ch.voice };
  }

  /** say(who, text|[pages], opt) — who: 'gran' 'gran:happy' '@' null(해설) 'sys' */
  function say(who, text, opt) {
    const pages = Array.isArray(text) ? text : [text];
    return pages.reduce((p, t) => p.then(() => sayOne(who, t, opt || {})), Promise.resolve());
  }
  function sayOne(who, text, opt) {
    return new Promise((res) => {
      const box = $('dialog'), tx = $('dlg-text'), nm = $('dlg-name'), cv = $('dlg-cv'), face = $('dlg-face');
      const info = who && who !== 'sys' ? whoInfo(who) : null;
      box.classList.toggle('narr', !who); box.classList.toggle('sys', who === 'sys');
      box.classList.toggle('noface', !info || opt.noface);
      nm.textContent = info ? info.name : ''; nm.style.setProperty('--nm', info ? info.color : '');
      if (info) {
        const pc = G.portraits.portrait(info.id, info.emo);
        const g = cv.getContext('2d'); cv.width = pc.width; cv.height = pc.height; g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(pc, 0, 0);
        face.style.setProperty('--face', U.shade(info.color.length === 7 ? info.color : '#8a7ab0', 0.32));
      }
      box.hidden = false;
      $('dlg-next').hidden = true;
      tx.innerHTML = '';
      const segs = segments(text);
      const spans = segs.map((sg) => { const sp = document.createElement('span'); if (sg.cls) sp.className = sg.cls; tx.appendChild(sp); return sp; });
      let si = 0, ci = 0, typing = true, wait = 0, blip = 0;
      const speed = [0.5, 1, 2, 99][G.state.settings.textSpeed == null ? 1 : G.state.settings.textSpeed] || 1;
      const cps = 42 * speed;
      let acc = 0, lastT = performance.now();
      function step(now) {
        if (!typing) return;
        acc += Math.min(0.1, (now - lastT) / 1000) * cps; lastT = now;
        while (acc >= 1 && typing) {
          if (wait > 0) { wait--; acc -= 1; continue; }
          const sg = segs[si];
          if (!sg) { finish(); break; }
          const c = sg.t[ci++];
          spans[si].textContent += c;
          if (ci >= sg.t.length) { si++; ci = 0; }
          acc -= 1;
          if ('.!?…'.indexOf(c) >= 0) wait = 5; else if (c === ',') wait = 2;
          if (c !== ' ' && c !== '\n' && ++blip % 2 === 0 && info) G.audio && G.audio.blip(info.voice);
        }
        if (typing) requestAnimationFrame(step);
      }
      function finish() { typing = false; segs.forEach((sg, i) => { spans[i].textContent = sg.t; }); $('dlg-next').hidden = !!opt.keep; if (opt.keep) done(); }
      requestAnimationFrame(step);
      let closed = false;
      const L = opt.keep ? null : push({ name: 'dialog', a: adv, b: adv, lv: adv, tap: adv });
      function adv() { if (typing) { finish(); return; } done(); }
      function done() { if (closed) return; closed = true; if (L) pop(L); if (!opt.keep) box.hidden = true; G.audio && G.audio.sfx('tick'); res(); }
      if (opt.keep && !typing) done();
      if (opt.auto) setTimeout(() => { if (typing) finish(); setTimeout(done, 300); }, opt.auto);
    });
  }
  function hideDialog() { $('dialog').hidden = true; }

  /** ask(question, options[], who, opt) → 고른 번호. opt.cancel = B를 누르면 고를 번호 */
  function ask(q, options, who, opt) {
    opt = opt || {};
    return (q ? sayOne(who || null, q, { keep: true }) : Promise.resolve()).then(() => new Promise((res) => {
      const box = $('choices');
      box.innerHTML = '';
      box.classList.toggle('center', !q);
      let sel = 0;
      const items = options.map((o, i) => {
        const b = document.createElement('button');
        const off = typeof o === 'object' && o.off;
        b.className = 'ch' + (off ? ' off' : '');
        b.innerHTML = markup(typeof o === 'object' ? o.t : o);
        b.addEventListener('click', () => pick(i));
        b.addEventListener('pointerenter', () => { sel = i; draw(); });
        box.appendChild(b);
        return b;
      });
      function draw() { items.forEach((b, i) => b.classList.toggle('sel', i === sel)); items[sel] && items[sel].scrollIntoView({ block: 'nearest' }); }
      draw();
      box.hidden = false;
      const L = push({ name: 'ask', repeat: true,
        dir(d) { if (d === 'up') sel = (sel + items.length - 1) % items.length; if (d === 'down') sel = (sel + 1) % items.length; G.audio && G.audio.sfx('move'); draw(); },
        a() { pick(sel); }, lv() { pick(sel); },
        b() { if (opt.cancel != null) pick(opt.cancel); } });
      function pick(i) { const o = options[i]; if (typeof o === 'object' && o.off) { G.audio && G.audio.sfx('buzz'); return; } pop(L); box.hidden = true; hideDialog(); G.audio && G.audio.sfx('select'); res(i); }
    }));
  }
  Object.assign(UI, { say, ask, hideDialog });

  /* ───────── HUD ───────── */
  const hudCache = {};
  function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
  function setW(id, f) { const v = (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%'; if (hudCache[id] !== v) { hudCache[id] = v; $(id).style.width = v; } }
  function hud() {
    const s = G.state; if (!s) return;
    const d = E.derive(s);
    setText('hud-name', s.name);
    setText('hud-rank', s.flags.champion ? '챔피언' : E.rankName(s));
    setText('hud-gold', U.fmt(s.gold));
    setText('hud-lv', U.fmtInt(s.lv));
    const p = E.expProgress(s);
    setW('hud-exp-f', p.f); setText('hud-exp-t', 'EXP ' + U.fmt(Math.floor(p.cur)) + ' / ' + U.fmt(Math.ceil(p.need)));
    setW('hud-hp-f', s.hp / d.hpMax); setText('hud-hp-t', 'HP ' + U.fmt(Math.ceil(s.hp)) + ' / ' + U.fmt(d.hpMax));
    const fv = $('fever'); const fOn = d.feverOn; if (fv.hidden === fOn) fv.hidden = !fOn;
  }
  UI.hud = hud;

  /* ───────── 모달 공통 ───────── */
  function modal(title, opt) {
    opt = opt || {};
    return new Promise((res) => {
      const m = $('modal');
      m.innerHTML = '<div class="m-head"><div class="m-title">' + markup(title) + '</div><button class="m-close" data-act="close">닫기 ✕</button></div>' +
        (opt.tabs ? '<div class="m-tabs"></div>' : '') + '<div class="m-body"></div>' + (opt.foot !== false ? '<div class="m-foot"></div>' : '');
      m.hidden = false;
      const body = m.querySelector('.m-body'), foot = m.querySelector('.m-foot'), tabs = m.querySelector('.m-tabs');
      let tab = opt.tab || (opt.tabs && opt.tabs[0][0]);
      const api = {
        body, foot, m,
        get tab() { return tab; },
        refresh() {
          if (tabs) tabs.innerHTML = opt.tabs.map(([k, n]) => '<button class="m-tab' + (k === tab ? ' on' : '') + '" data-tab="' + k + '">' + n + '</button>').join('');
          const top0 = body.scrollTop;
          body.innerHTML = opt.render(tab, api);
          hydrate(body);
          if (api.keepScroll) body.scrollTop = top0; api.keepScroll = false;
          if (foot) foot.innerHTML = (opt.foot ? opt.foot(tab) : '') + '<span class="gold">● ' + U.fmt(G.state.gold) + '</span>';
          const on = tabs && tabs.querySelector('.on'); on && on.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        },
        close() { pop(L); m.hidden = true; m.innerHTML = ''; G.audio && G.audio.sfx('cancel'); res(api.result); },
        setTab(k) { tab = k; body.scrollTop = 0; api.refresh(); },
      };
      m.onclick = (e) => {
        const t = e.target.closest('[data-tab],[data-act]');
        if (!t) return;
        if (t.dataset.tab) { G.audio && G.audio.sfx('move'); api.setTab(t.dataset.tab); return; }
        if (t.dataset.act === 'close') { api.close(); return; }
        if (t.disabled) return;
        api.keepScroll = true;
        if (opt.act) opt.act(t.dataset.act, t.dataset, api, t);
      };
      const L = push({ name: 'modal', repeat: true,
        b() { api.close(); }, a() {}, lv() {},
        dir(d) {
          if (d === 'up' || d === 'down') body.scrollTop += d === 'up' ? -48 : 48;
          else if (opt.tabs) { const i = opt.tabs.findIndex((x) => x[0] === tab); const n = opt.tabs[(i + (d === 'left' ? -1 : 1) + opt.tabs.length) % opt.tabs.length][0]; G.audio && G.audio.sfx('move'); api.setTab(n); }
        } });
      api.refresh();
    });
  }
  UI.modal = modal;

  function hydrate(root) {
    root.querySelectorAll('canvas[data-face]').forEach((c) => { const pc = G.portraits.portrait(c.dataset.face, c.dataset.emo); c.width = pc.width; c.height = pc.height; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(pc, 0, 0); });
    root.querySelectorAll('canvas[data-mon]').forEach((c) => { const md = D.MON[c.dataset.mon]; const cv = monSprite(md); c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'); if (c.dataset.dark) g.filter = 'brightness(0)'; g.drawImage(cv, 0, 0); });
  }
  function monSprite(md) { return G.sprites.monster(U.hash(md.id) % 100000, md.arch, md.c[0], md.c[1], md.c[2], md.role === 'b' || md.role === 'x'); }
  UI.monSprite = monSprite;

  /* ───────── 아이템 표시 ───────── */
  const TYPE_IC = { tool: '✋', weapon: '⚔', armor: '🛡', acc: '◆', potion: '♥', food: '🍞', key: '★', mat: '▲' };
  const TYPE_N = { tool: '도구', weapon: '무기', armor: '방어구', acc: '장신구', potion: '물약', food: '음식', key: '중요한 물건', mat: '재료' };
  function itemLine(it) {
    if (it.type === 'weapon') return '공격력 +' + U.fmt(it.atk);
    if (it.type === 'armor') return 'HP +' + U.fmt(it.hp) + ' · 방어 +' + U.fmt(it.def);
    if (it.type === 'tool') return it.stat;
    return it.desc;
  }
  UI.itemLine = itemLine;

  /* ───────── 메인 메뉴 ───────── */
  const TABS = [['status', '상태'], ['bag', '가방'], ['rank', '등급'], ['quest', '일지'], ['people', '인물'], ['codex', '도감'], ['books', '서재'], ['opt', '설정']];
  function menu(tab) {
    G.audio && G.audio.sfx('open');
    return modal('모험 수첩', { tabs: TABS, tab: tab || 'status', render: renderMenu, act: menuAct, foot: () => '<span>플레이 ' + U.fmtTime(G.state.tot.playTime) + '</span>' });
  }
  UI.menu = menu;

  function renderMenu(tab) {
    const s = G.state, d = E.derive(s);
    if (tab === 'status') {
      const p = E.expProgress(s);
      const statDesc = { str: ['힘', '공격력 +2'], vit: ['체력', '최대 HP +10, 방어 +0.5'], agi: ['민첩', '치명타 확률·피해'], int: ['지능', '클릭 경험치 배율'], luk: ['행운', '클릭 골드 배율'] };
      let h = '<div class="row" style="border:0"><canvas class="portrait-sm" data-face="@"></canvas><div class="nm"><b>' + esc(s.name) + ' · ' + (s.flags.champion ? '챔피언' : E.rankName(s)) + '</b><small>Lv ' + U.fmtInt(s.lv) + ' · 다음 레벨까지 ' + U.fmt(p.need - p.cur) + ' EXP</small></div></div>';
      h += '<dl class="kv card"><dt>HP</dt><dd>' + U.fmt(Math.ceil(s.hp)) + ' / ' + U.fmt(d.hpMax) + '</dd><dt>공격력</dt><dd>' + U.fmt(d.atk) + '</dd><dt>방어</dt><dd>' + U.fmt(d.def) + '</dd>' +
        '<dt>치명타</dt><dd>' + Math.round(d.crit * 100) + '% · ×' + d.critDmg.toFixed(2) + '</dd><dt>클릭 경험치 배율</dt><dd>' + U.fmtMult(d.expM) + '</dd><dt>클릭 골드 배율</dt><dd>' + U.fmtMult(d.goldM) + '</dd>' +
        '<dt>도구</dt><dd>' + U.fmtMult(d.tool) + '</dd><dt>등급 배율</dt><dd>' + U.fmtMult(d.rc) + '</dd></dl>';
      h += '<div class="sec">능력치 · 남은 포인트 <b style="color:var(--gold)">' + U.fmt(s.sp) + '</b></div>';
      for (const k of E.STATS) {
        h += '<div class="stat"><span class="sn">' + statDesc[k][0] + '</span><span class="sd">' + statDesc[k][1] + '</span><span class="sv">' + U.fmt(s.st[k]) + '</span>' +
          (s.sp > 0 ? '<button class="btn" data-act="alloc" data-k="' + k + '" data-n="1">+1</button><button class="btn" data-act="alloc" data-k="' + k + '" data-n="all">+전부</button>' : '') + '</div>';
      }
      h += '<div class="sec">자동 분배 ' + (s.auto ? '켜짐' : '꺼짐') + '</div><div class="pill-row">' +
        '<button class="btn' + (s.auto ? ' pri' : '') + '" data-act="auto">' + (s.auto ? '자동 분배 끄기' : '자동 분배 켜기') + '</button>' +
        [['bal', '균형'], ['atk', '전투형'], ['grind', '수련형'], ['rich', '부자형']].map(([k, n]) => '<button class="btn" data-act="preset" data-k="' + k + '">' + n + '</button>').join('') + '</div>' +
        '<p class="note" style="margin-top:6px">비율: 힘 ' + s.ratio.str + ' · 체력 ' + s.ratio.vit + ' · 민첩 ' + s.ratio.agi + ' · 지능 ' + s.ratio.int + ' · 행운 ' + s.ratio.luk + '<br>레벨이 오를 때마다 포인트 5개가 이 비율대로 나뉜다.</p>' +
        '<button class="btn" data-act="reset">능력치 되돌리기 (무료)</button>';
      const t = s.tot;
      h += '<div class="sec" style="margin-top:12px">기록</div><dl class="kv card"><dt>렙업 버튼</dt><dd>' + U.fmt(t.clicks) + '번</dd><dt>쓰러뜨린 적</dt><dd>' + U.fmt(t.kills) + '</dd><dt>보스</dt><dd>' + U.fmt(t.bossKills) + '</dd><dt>걸음</dt><dd>' + U.fmt(t.steps) + '</dd><dt>기절</dt><dd>' + U.fmt(t.faints) + '</dd><dt>최대 피해</dt><dd>' + U.fmt(t.maxHit) + '</dd><dt>모은 경험치</dt><dd>' + U.fmt(t.exp) + '</dd><dt>모은 골드</dt><dd>' + U.fmt(t.gold) + '</dd></dl>';
      return h;
    }
    if (tab === 'bag') {
      const groups = ['potion', 'food', 'weapon', 'armor', 'acc', 'tool', 'mat', 'key'];
      let h = '';
      if (s.buffs.some((b) => b.until > s.t)) h += '<div class="card note">' + s.buffs.filter((b) => b.until > s.t).map((b) => '<b style="color:var(--gold)">' + (D.ITEMS[b.id] ? D.ITEMS[b.id].name : '대륙의 빛') + '</b> 효과 ' + U.fmtTime(b.until - s.t) + ' 남음').join('<br>') + '</div>';
      for (const g of groups) {
        const ids = Object.keys(s.inv).filter((id) => D.ITEMS[id] && D.ITEMS[id].type === g && s.inv[id] > 0);
        if (!ids.length) continue;
        h += '<div class="sec">' + TYPE_N[g] + '</div>';
        for (const id of ids) {
          const it = D.ITEMS[id];
          const eq = s.eq.weapon === id || s.eq.armor === id || s.eq.acc === id;
          let btn = '';
          if (g === 'potion') btn = '<button class="btn" data-act="use" data-id="' + id + '">쓰기</button>';
          if (g === 'food') btn = '<button class="btn" data-act="eat" data-id="' + id + '">먹기</button>';
          if (g === 'weapon' || g === 'armor' || g === 'acc') btn = eq ? '<span class="chip on">장착 중</span>' : '<button class="btn" data-act="equip" data-id="' + id + '">장착</button>';
          if (g === 'tool') btn = E.toolIndex(s) === +id.slice(1) ? '<span class="chip on">사용 중</span>' : '';
          h += '<div class="row"><span class="ic">' + TYPE_IC[g] + '</span><span class="nm"><b>' + esc(it.name) + (s.inv[id] > 1 ? ' ×' + U.fmt(s.inv[id]) : '') + '</b><small>' + esc(itemLine(it)) + '</small></span>' + btn + '</div>';
        }
      }
      return h || '<p class="note">가방이 비어 있다.</p>';
    }
    if (tab === 'rank') return renderRanks(false);
    if (tab === 'quest') return renderQuests();
    if (tab === 'people') {
      let h = '<p class="note">만난 인물 ' + G.CHAR_ORDER.filter((id) => s.seen[id]).length + ' / ' + G.CHAR_ORDER.length + '</p>';
      for (const id of G.CHAR_ORDER) {
        const c = G.chars[id];
        if (!s.seen[id]) { h += '<div class="row"><span class="ic">?</span><span class="nm"><b style="color:var(--muted)">???</b><small>아직 만나지 못했다.</small></span></div>'; continue; }
        const lines = c.bio.filter((b) => !b[1] || s.flags[b[1]]).map((b) => esc(U.nameSub(b[0], s.name)));
        const more = c.bio.length - lines.length;
        h += '<div class="row" style="align-items:flex-start"><canvas class="portrait-sm" data-face="' + id + '"></canvas><span class="nm"><b style="color:' + c.color + '">' + esc(c.name) + '</b><small>' + esc(c.title || '') + '</small><small style="color:var(--paper-dim);margin-top:4px">' + lines.join('<br>') + (more ? '<br><span style="color:var(--muted)">… 아직 모르는 이야기가 ' + more + '개 있다.</span>' : '') + '</small></span></div>';
      }
      return h;
    }
    if (tab === 'codex') {
      const ids = Object.keys(D.MON);
      const seen = ids.filter((id) => s.codex[id]);
      let h = '<p class="note">본 몬스터 ' + seen.length + ' / ' + ids.length + '</p>';
      for (const id of ids) {
        const md = D.MON[id], cx = s.codex[id];
        if (!cx) { h += '<div class="row"><canvas class="portrait-sm" data-mon="' + id + '" data-dark="1" style="background:#000"></canvas><span class="nm"><b style="color:var(--muted)">???</b><small>' + D.REGIONS[md.reg].name + '</small></span></div>'; continue; }
        h += '<div class="row" style="align-items:flex-start"><canvas class="portrait-sm" data-mon="' + id + '" style="background:#1a1428"></canvas><span class="nm"><b>' + esc(md.name) + ' <span style="color:var(--muted);font-size:11px">Lv ' + U.fmtInt(md.lv) + '</span></b><small>' + esc(md.desc) + '</small><small>HP ' + U.fmt(md.hp) + ' · 공격 ' + U.fmt(md.atk) + ' · 처치 ' + U.fmt(cx.k || 0) + '</small></span></div>';
      }
      return h;
    }
    if (tab === 'books') {
      const ids = Object.keys(G.books || {});
      const got = ids.filter((id) => s.books[id]);
      let h = '<p class="note">모은 이야기 ' + got.length + ' / ' + ids.length + ' · 책장과 비석, 쪽지를 살펴보면 모인다.</p>';
      for (const id of ids) {
        const b = G.books[id];
        h += s.books[id] ? '<div class="row"><span class="ic">📖</span><span class="nm"><b>' + esc(b.title) + '</b><small>' + esc(b.where || '') + '</small></span><button class="btn" data-act="read" data-id="' + id + '">읽기</button></div>'
          : '<div class="row"><span class="ic">?</span><span class="nm"><b style="color:var(--muted)">???</b><small>' + esc(b.where || '') + '</small></span></div>';
      }
      return h;
    }
    if (tab === 'opt') {
      const st = s.settings;
      const sw = (k, on, n) => '<div class="row"><span class="nm"><b>' + n + '</b></span><button class="btn' + (on ? ' pri' : '') + '" data-act="set" data-k="' + k + '">' + (on ? '켜짐' : '꺼짐') + '</button></div>';
      let h = sw('music', st.music, '음악') + sw('sfx', st.sfx, '효과음');
      h += '<div class="row"><span class="nm"><b>소리 크기</b></span>' + [0.3, 0.5, 0.7, 1].map((v) => '<button class="btn' + (Math.abs(st.vol - v) < 0.01 ? ' pri' : '') + '" data-act="vol" data-v="' + v + '">' + Math.round(v * 100) + '</button>').join('') + '</div>';
      h += '<div class="row"><span class="nm"><b>글자 속도</b></span>' + ['느림', '보통', '빠름', '즉시'].map((n, i) => '<button class="btn' + (st.textSpeed === i ? ' pri' : '') + '" data-act="speed" data-v="' + i + '">' + n + '</button>').join('') + '</div>';
      h += '<div class="sec" style="margin-top:12px">저장</div><p class="note">이 브라우저에 20초마다 자동으로 저장된다. 다른 기기로 옮기려면 저장 코드를 복사해 두자.</p>' +
        '<div class="pill-row"><button class="btn pri" data-act="save">지금 저장</button><button class="btn" data-act="export">저장 코드 복사</button><button class="btn" data-act="import">저장 코드 불러오기</button></div>' +
        '<textarea id="savecode" rows="3" style="width:100%;margin-top:8px;box-sizing:border-box;background:#000;color:var(--paper-dim);border:1px solid var(--line);font:11px monospace;display:none"></textarea>' +
        '<div class="sec" style="margin-top:12px">조작</div><p class="note">십자키: 이동 · A: 말 걸기/조사/확인 · B: 취소 · 렙업!: 그 자리의 기운으로 수련 (전투에서는 공격)<br>키보드: 방향키/WASD · Z/Enter=A · X/Esc=B · Space=렙업 · M=지도 · I=메뉴</p>' +
        '<div class="sec" style="margin-top:12px">처음부터</div><button class="btn" data-act="wipe">' + (UI.wipeArm ? '정말 지울까? 한 번 더 누르면 지워진다' : '저장 지우고 처음부터') + '</button>' +
        '<p class="note" style="margin-top:14px">글꼴: 갈무리 (Galmuri, SIL Open Font License 1.1)</p>';
      return h;
    }
    return '';
  }
  const PRESETS = { bal: { str: 3, vit: 2, agi: 1, int: 3, luk: 1 }, atk: { str: 5, vit: 3, agi: 2, int: 1, luk: 0 }, grind: { str: 2, vit: 1, agi: 0, int: 6, luk: 1 }, rich: { str: 2, vit: 1, agi: 1, int: 2, luk: 4 } };
  function menuAct(act, ds, api) {
    const s = G.state;
    if (act === 'alloc') { E.allocate(s, ds.k, ds.n === 'all' ? s.sp : 1); G.audio.sfx('select'); }
    if (act === 'auto') { s.auto = !s.auto; if (s.auto) E.autoAlloc(s); }
    if (act === 'preset') { s.ratio = Object.assign({}, PRESETS[ds.k]); E.resetStats(s); s.auto = true; E.autoAlloc(s); toast('능력치를 다시 나눴다.'); }
    if (act === 'reset') { E.resetStats(s); s.auto = false; toast('능력치 포인트를 모두 돌려받았다.'); }
    if (act === 'use') { if (E.usePotion(s, ds.id)) { G.audio.sfx('heal'); toast(D.ITEMS[ds.id].name + '을(를) 썼다.', 'good'); } }
    if (act === 'eat') { if (E.eat(s, ds.id)) { G.audio.sfx('heal'); toast(D.ITEMS[ds.id].name + ' 냠냠. ' + D.ITEMS[ds.id].desc.split('. ')[1], 'good'); } }
    if (act === 'equip') { E.equip(s, ds.id); G.audio.sfx('equip'); }
    if (act === 'read') { G.audio.sfx('page'); readBook(ds.id); return; }
    if (act === 'set') { s.settings[ds.k] = !s.settings[ds.k]; G.audio.applySettings(); }
    if (act === 'vol') { s.settings.vol = +ds.v; G.audio.applySettings(); G.audio.sfx('select'); }
    if (act === 'speed') { s.settings.textSpeed = +ds.v; }
    if (act === 'save') { G.main.save(true); }
    if (act === 'export') { const ta = document.getElementById('savecode'); ta.style.display = 'block'; ta.value = G.main.exportCode(); ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => toast('저장 코드를 복사했다.'), () => toast('코드를 길게 눌러 복사하자.')); } catch (_) { toast('코드를 길게 눌러 복사하자.'); } return; }
    if (act === 'import') {
      const ta = document.getElementById('savecode');
      if (ta.style.display !== 'block' || !ta.value.trim()) { ta.style.display = 'block'; ta.value = ''; ta.placeholder = '여기에 저장 코드를 붙여넣고 다시 「불러오기」를 누르자.'; ta.focus(); return; }
      if (G.main.importCode(ta.value.trim())) { api.close(); toast('저장 코드를 불러왔다.', 'good'); } else toast('저장 코드가 올바르지 않다.', 'bad');
      return;
    }
    if (act === 'wipe') { if (!UI.wipeArm) { UI.wipeArm = true; setTimeout(() => { UI.wipeArm = false; }, 4000); } else { UI.wipeArm = false; G.main.wipe(); return; } }
    if (act === 'rankup') { G.main.doRankUp(+ds.i); }
    api.refresh();
  }

  function readBook(id) {
    const b = G.books[id];
    const pages = b.text.split('\n\n');
    let i = 0;
    return modal(b.title, {
      foot: () => '<span>' + (i + 1) + ' / ' + pages.length + '</span><button class="btn" data-act="prev"' + (i ? '' : ' disabled') + '>◀</button><button class="btn" data-act="next"' + (i < pages.length - 1 ? '' : ' disabled') + '>▶</button>',
      render: () => '<div class="book">' + (i === 0 ? '<h4>' + esc(b.title) + '</h4>' : '') + markup(pages[i]) + '</div>' + (b.author && i === pages.length - 1 ? '<p class="note" style="text-align:right;margin-top:10px">— ' + esc(b.author) + '</p>' : ''),
      act(a, ds, api) { if (a === 'next' && i < pages.length - 1) i++; if (a === 'prev' && i > 0) i--; G.audio.sfx('page'); api.keepScroll = false; api.body.scrollTop = 0; api.refresh(); },
    });
  }
  UI.readBook = readBook;

  /* ───────── 등급 ───────── */
  function renderRanks(office) {
    const s = G.state;
    let h = office ? '<p class="note">등급을 올리면 렙업 버튼으로 얻는 경험치와 골드, 그리고 모든 전투 능력이 커진다. 새 등급의 문은 그 색 구슬에 새겨진 숫자를 모두 더한 <em style="color:var(--gold);font-style:normal">비밀번호</em>로 열린다.</p>' : '';
    D.RANKS.forEach((rk, i) => {
      const cur = s.ranks[rk.id] || 0;
      const done = cur >= rk.tiers;
      const c = E.canRankUp(s, i);
      let st = '';
      if (done) st = '완료';
      else if (!E.lineUnlocked(s, i)) st = '🔒 비밀번호 필요';
      else if (!E.lineOpen(s, i)) st = '이전 등급을 모두 마쳐야 한다';
      else st = cur + 1 + '차 — Lv ' + U.fmtInt(c.lv) + ' · ● ' + U.fmt(c.cost);
      h += '<div class="card"><div class="row" style="border:0;padding:0 0 4px"><span class="ic" style="color:var(--' + rk.id + ')">◆</span><span class="nm"><b style="color:var(--' + rk.id + ')">' + rk.name + ' <span style="color:var(--paper-dim)">' + cur + ' / ' + rk.tiers + '차</span></b><small>' + esc(rk.desc) + '</small></span></div>' +
        '<div class="bar exp" style="height:6px;margin:2px 0 6px"><i style="width:' + (cur / rk.tiers * 100) + '%;background:var(--' + rk.id + ')"></i></div>' +
        '<div class="row" style="border:0;padding:0"><span class="nm"><small>' + st + '<br>차수마다 클릭 배율 +' + rk.click + ' · 전투 능력 +' + (rk.power * 90).toFixed(1) + '%</small></span>' +
        (office && c.ok ? '<button class="btn pri" data-act="rankup" data-i="' + i + '">전직 심사</button>' : '') +
        (office && !done && !E.lineUnlocked(s, i) ? '<button class="btn gold" data-act="pw" data-i="' + i + '">비밀번호</button>' : '') + '</div>';
      if (rk.orb) {
        const orbs = D.ORBS.filter((o) => o.c === rk.orb);
        h += '<div class="pill-row" style="margin-top:4px">' + orbs.map((o) => s.orbs[o.id] ? '<span class="chip" style="color:' + D.ORB_COLORS[o.c].color + ';border-color:' + D.ORB_COLORS[o.c].color + '">● ' + o.v + '</span>' : '<span class="chip">○ ' + esc(o.hint) + '</span>').join('') + '</div>';
      }
      h += '</div>';
    });
    h += '<div class="sec" style="margin-top:10px">등급 기술</div>';
    for (const sk of D.SKILLS) {
      const on = E.skillUnlocked(s, sk);
      const rk = D.RANKS.find((r) => r.id === sk.rank);
      h += '<div class="row"><span class="ic">' + sk.icon + '</span><span class="nm"><b' + (on ? '' : ' style="color:var(--muted)"') + '>' + sk.name + '</b><small>' + sk.desc + ' · 재사용 ' + sk.cd + '초' + (on ? '' : ' · ' + rk.name + ' ' + sk.tier + '차에 배움') + '</small></span></div>';
    }
    return h;
  }
  function rankOffice(clerk) {
    G.audio && G.audio.sfx('open');
    return modal('등급소', {
      render: () => renderRanks(true),
      act(a, ds, api) {
        if (a === 'rankup') { G.main.doRankUp(+ds.i).then(() => api.refresh()); return; }
        if (a === 'pw') { password(+ds.i).then(() => api.refresh()); }
      },
    });
  }
  function password(i) {
    const rk = D.RANKS[i];
    let code = '';
    return new Promise((res) => {
      const m = modal(rk.name + ' 비밀번호', {
        render: () => '<p class="note">「' + D.ORB_COLORS[rk.orb].name + '에 새겨진 숫자를 모두 더하라.」</p><div class="pw-show">' + (code || '&nbsp;') + '</div><div class="keypad">' +
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="k" data-n="' + n + '">' + n + '</button>').join('') + '<button data-act="del">←</button><button data-act="k" data-n="0">0</button><button data-act="ok" style="color:var(--gold)">확인</button></div>',
        act(a, ds, api) {
          if (a === 'k' && code.length < 9) { code += ds.n; G.audio.sfx('move'); }
          if (a === 'del') { code = code.slice(0, -1); G.audio.sfx('cancel'); }
          if (a === 'ok') {
            if (E.tryPassword(G.state, rk.id, code)) { G.audio.sfx('unlock'); toast(rk.name + ' 등급의 문이 열렸다!', 'gold'); api.close(); return; }
            G.audio.sfx('buzz'); toast('비밀번호가 맞지 않는다.', 'bad'); code = '';
          }
          api.refresh();
        },
      });
      m.then(res);
    });
  }
  UI.rankOffice = rankOffice;
  /** 숫자 자판 → 입력한 문자열 (닫으면 null) */
  function keypad(title, hint) {
    let code = '', out = null;
    return modal(title, {
      render: () => (hint ? '<p class="note">' + markup(hint) + '</p>' : '') + '<div class="pw-show">' + (code || '&nbsp;') + '</div><div class="keypad">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="k" data-n="' + n + '">' + n + '</button>').join('') + '<button data-act="del">←</button><button data-act="k" data-n="0">0</button><button data-act="ok" style="color:var(--gold)">확인</button></div>',
      act(a, ds, api) {
        if (a === 'k' && code.length < 9) { code += ds.n; G.audio.sfx('move'); }
        if (a === 'del') { code = code.slice(0, -1); G.audio.sfx('cancel'); }
        if (a === 'ok') { out = code; api.result = out; api.close(); return; }
        api.refresh();
      },
    }).then(() => out);
  }
  UI.keypad = keypad;

  /* ───────── 일지 ───────── */
  function renderQuests() {
    const s = G.state, Q = G.quests || {};
    let h = '';
    const main = Object.keys(Q).filter((id) => Q[id].main && s.quests[id] != null);
    const side = Object.keys(Q).filter((id) => !Q[id].main && s.quests[id] != null);
    const line = (id) => {
      const q = Q[id], st = s.quests[id];
      const doneQ = st === 'done';
      const desc = doneQ ? (q.done || '끝냈다.') : q.stages[Math.min(st, q.stages.length - 1)];
      return '<div class="row" style="align-items:flex-start"><span class="ic" style="color:' + (doneQ ? 'var(--muted)' : 'var(--gold)') + '">' + (doneQ ? '✓' : q.main ? '★' : '!') + '</span><span class="nm"><b' + (doneQ ? ' style="color:var(--muted)"' : '') + '>' + esc(q.name) + '</b><small>' + markup(desc) + '</small>' + (q.where && !doneQ ? '<small style="color:var(--gold-d)">' + esc(q.where) + '</small>' : '') + '</span></div>';
    };
    h += '<div class="sec">이야기</div>' + (main.filter((id) => s.quests[id] !== 'done').map(line).join('') || '<p class="note">지금은 따라갈 이야기가 없다.</p>');
    const act = side.filter((id) => s.quests[id] !== 'done');
    h += '<div class="sec" style="margin-top:10px">부탁 · ' + act.length + '개 진행 중</div>' + (act.map(line).join('') || '<p class="note">받아 둔 부탁이 없다. 머리 위에 [y]![/]가 뜬 사람에게 말을 걸어 보자.</p>');
    const dn = side.filter((id) => s.quests[id] === 'done').concat(main.filter((id) => s.quests[id] === 'done'));
    if (dn.length) h += '<div class="sec" style="margin-top:10px">끝낸 일 ' + dn.length + '</div>' + dn.map(line).join('');
    return h;
  }

  /* ───────── 상점 ───────── */
  function shop(id) {
    const sh = D.SHOPS[id];
    G.audio && G.audio.sfx('open');
    return modal(sh.name, {
      tabs: [['buy', '사기'], ['sell', '팔기']],
      render(tab) {
        const s = G.state;
        let h = '';
        if (tab === 'buy') {
          for (const iid of sh.items) {
            const it = D.ITEMS[iid];
            const own = s.inv[iid] || 0;
            const unique = ['tool', 'weapon', 'armor', 'acc'].includes(it.type);
            let cmp = '';
            if (it.type === 'weapon') { const cur = s.eq.weapon ? D.ITEMS[s.eq.weapon].atk : 0; cmp = it.atk > cur ? ' <span style="color:var(--exp)">▲' + U.fmt(it.atk - cur) + '</span>' : ''; }
            if (it.type === 'armor') { const cur = s.eq.armor ? D.ITEMS[s.eq.armor].hp : 0; cmp = it.hp > cur ? ' <span style="color:var(--exp)">▲' + U.fmt(it.hp - cur) + '</span>' : ''; }
            if (it.type === 'tool') { cmp = D.TOOL_MULT[+iid.slice(1)] > D.TOOL_MULT[E.toolIndex(s)] ? ' <span style="color:var(--exp)">▲</span>' : ''; }
            const can = s.gold >= it.price && !(unique && own);
            h += '<div class="row"><span class="ic">' + TYPE_IC[it.type] + '</span><span class="nm"><b>' + esc(it.name) + cmp + '</b><small>' + esc(itemLine(it)) + (own ? ' · 가진 것 ' + U.fmt(own) : '') + '</small></span>' +
              (unique && own ? '<span class="chip">있음</span>' : '<button class="btn gold" data-act="buy" data-id="' + iid + '" data-n="1"' + (can ? '' : ' disabled') + '>● ' + U.fmt(it.price) + '</button>' +
                (!unique ? '<button class="btn" data-act="buy" data-id="' + iid + '" data-n="10"' + (s.gold >= it.price * 10 ? '' : ' disabled') + '>×10</button>' : '')) + '</div>';
          }
          if (sh.note) h += '<p class="note" style="margin-top:8px">' + markup(sh.note) + '</p>';
        } else {
          const ids = Object.keys(s.inv).filter((iid) => { const it = D.ITEMS[iid]; return it && it.type !== 'key' && it.type !== 'tool' && s.inv[iid] > 0 && s.eq.weapon !== iid && s.eq.armor !== iid && s.eq.acc !== iid && E.sellPrice(iid) > 0; });
          if (!ids.length) h = '<p class="note">팔 만한 물건이 없다. 몬스터가 떨어뜨리는 재료는 좋은 값에 팔린다.</p>';
          for (const iid of ids) {
            const it = D.ITEMS[iid];
            h += '<div class="row"><span class="ic">' + TYPE_IC[it.type] + '</span><span class="nm"><b>' + esc(it.name) + ' ×' + U.fmt(s.inv[iid]) + '</b><small>하나에 ● ' + U.fmt(E.sellPrice(iid)) + '</small></span><button class="btn" data-act="sell" data-id="' + iid + '" data-n="1">1개</button><button class="btn gold" data-act="sell" data-id="' + iid + '" data-n="all">전부</button></div>';
          }
        }
        return h;
      },
      act(a, ds) {
        const s = G.state;
        if (a === 'buy') { if (E.buy(s, ds.id, +ds.n)) { G.audio.sfx('coin'); toast(D.ITEMS[ds.id].name + (+ds.n > 1 ? ' ×' + ds.n : '') + '을(를) 샀다.', 'gold'); G.main.onBuy && G.main.onBuy(ds.id); } else G.audio.sfx('buzz'); }
        if (a === 'sell') { const n = ds.n === 'all' ? s.inv[ds.id] : 1; if (E.sell(s, ds.id, n)) G.audio.sfx('coin'); }
      },
    });
  }
  UI.shop = shop;

  /* ───────── 지도 ───────── */
  function worldMap() {
    G.audio && G.audio.sfx('open');
    let pick = null;
    const tick = setInterval(() => { const c = document.getElementById('wmcv'); if (!c) { if (!$('modal').hidden) return; clearInterval(tick); return; } G.main.drawWorldMap(c); }, 80);
    return modal('이리스 대륙', {
      render() {
        const s = G.state;
        const W = G.world;
        let h = '<div class="wmap"><canvas id="wmcv" width="160" height="168"></canvas></div>';
        const here = G.maps[s.map];
        h += '<p class="note" style="margin-top:6px">지금 있는 곳: <b style="color:var(--gold)">' + esc(here ? here.name : '?') + '</b>' + (here && here.region ? ' · ' + D.REG[here.region].name + ' 지방' : '') + '</p>';
        const canTravel = s.flags.travel && here && here.town;
        h += '<div class="sec">마을 ' + (canTravel ? '· 눌러서 이동' : s.flags.travel ? '· 마을 안에서만 이동할 수 있다' : '') + '</div>';
        for (const t of W.towns) {
          const known = s.flags['visit_' + t.map];
          if (!known) { h += '<div class="row"><span class="ic">?</span><span class="nm"><b style="color:var(--muted)">???</b><small>' + esc(t.hint) + '</small></span></div>'; continue; }
          h += '<div class="row"><span class="ic" style="color:' + t.color + '">◆</span><span class="nm"><b>' + esc(t.name) + '</b><small>' + esc(t.desc) + '</small></span>' +
            (canTravel && s.map !== t.map ? '<button class="btn pri" data-act="go" data-m="' + t.map + '">이동</button>' : '') + '</div>';
        }
        if (!s.flags.travel) h += '<p class="note" style="margin-top:6px">한 번 가 본 마을 사이를 오가는 방법은 이야기를 따라가다 보면 생긴다.</p>';
        return h;
      },
      act(a, ds, api) { if (a === 'go') { pick = ds.m; api.result = pick; api.close(); } },
    }).then((r) => { if (r) G.main.travel(r); }).finally(() => {});
  }
  UI.worldMap = worldMap;
  // 지도 캔버스는 main이 그린다 (modal이 열린 동안)

  /* ───────── 타이틀 ───────── */
  function title(hasSave) {
    return new Promise((res) => {
      const el = $('title');
      el.hidden = false;
      let gender = 'boy', stage = 'menu';
      function draw() {
        if (stage === 'menu') {
          el.innerHTML = '<canvas class="bg" id="tcv"></canvas><div class="t-logo"><small>INFINITE LEVEL UP</small>무한렙업<br>대모험</div>' +
            '<p class="t-sub">「모든 성장은 한 번의 누름에서 시작된다.」</p><div class="t-menu">' +
            (hasSave ? '<button class="t-btn pri" data-t="cont">이어하기</button>' : '') + '<button class="t-btn' + (hasSave ? '' : ' pri') + '" data-t="new">처음부터</button></div>' +
            '<div class="t-foot">십자키로 걷고, 렙업! 버튼으로 수련하고, A로 말을 건다</div>';
        } else {
          el.innerHTML = '<canvas class="bg" id="tcv"></canvas><div class="t-logo" style="font-size:22px">너의 이름은?</div><div class="t-field"><label for="nm">이름 (한글 6자까지)</label><input id="nm" maxlength="6" value="하늘" autocomplete="off"></div>' +
            '<div class="t-field"><span>모습</span><div class="t-gender"><button data-g="boy"' + (gender === 'boy' ? ' class="on"' : '') + '><canvas data-hero="boy" width="18" height="18"></canvas>소년</button><button data-g="girl"' + (gender === 'girl' ? ' class="on"' : '') + '><canvas data-hero="girl" width="18" height="18"></canvas>소녀</button></div></div>' +
            '<div class="t-menu"><button class="t-btn pri" data-t="start">모험 시작</button><button class="t-btn" data-t="back">돌아가기</button></div>' +
            (hasSave ? '<p class="t-sub" style="color:#ff8a8a">처음부터 시작하면 지금 저장된 모험은 지워진다.</p>' : '');
          el.querySelectorAll('canvas[data-hero]').forEach((c) => { const spr = G.field.heroSprite({ gender: c.dataset.hero }); const g = c.getContext('2d'); g.drawImage(spr.down[0], 0, 0); });
        }
        G.main.titleBg && G.main.titleBg(document.getElementById('tcv'));
      }
      draw();
      el.onclick = (e) => {
        G.audio && G.audio.unlock();
        const g = e.target.closest('[data-g]');
        if (g) { const v = (document.getElementById('nm') || {}).value; gender = g.dataset.g; draw(); const i = document.getElementById('nm'); if (i && v != null) i.value = v; return; }
        const t = e.target.closest('[data-t]');
        if (!t) return;
        G.audio && G.audio.sfx('select');
        if (t.dataset.t === 'cont') { el.hidden = true; res({ mode: 'continue' }); }
        if (t.dataset.t === 'new') { stage = 'name'; draw(); const i = document.getElementById('nm'); i && setTimeout(() => i.select(), 50); }
        if (t.dataset.t === 'back') { stage = 'menu'; draw(); }
        if (t.dataset.t === 'start') {
          let name = (document.getElementById('nm').value || '').trim().replace(/[<>{}\[\]]/g, '').slice(0, 6);
          if (!name) name = '하늘';
          el.hidden = true; res({ mode: 'new', name, gender });
        }
      };
    });
  }
  UI.title = title;

  UI.init = function () { initInput(); };
  G.ui = UI;
})();
