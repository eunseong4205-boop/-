/* 화면 UI(DOM): 알림 · 대사창(얼굴 · 이름 · 타자기) · 선택지 · 메뉴(가방 · 장비 · 기술 · 부탁 · 수첩 · 지도 · 설정) · 상점 · 대장간 · 이정표 · 타이틀 · 쓰러짐
   키보드 · 게임패드 · 터치 모두 같은 규칙: 방향으로 고르고, 공격(확인)으로 정하고, 구르기/Esc(취소)로 닫는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, I = G.input, X = G.gfx;
  const $ = (id) => document.getElementById(id);
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const UI = { dlg: null, ch: null, modal: null, tap: false, toastN: 0 };

  /* ───────── 글 꾸미기: [y]금색[/] [r] [b] [g] [p] [w] [s] [big] [shake] · {n} 이름 · | 멈춤 ───────── */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function nameSub(t) { const s = S(); return U.nameSub(t, (s && s.name) || '아린'); }
  function segs(text) {
    const out = [];
    let cls = [];
    const re = /\[(\/|y|r|b|g[1-5]|g|p|w|s|big|shake)\]/g;
    let last = 0, m;
    text = nameSub(text);
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ cls: cls.slice(), t: text.slice(last, m.index) });
      if (m[1] === '/') cls.pop(); else cls.push(m[1]);
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ cls: cls.slice(), t: text.slice(last) });
    return out;
  }
  function render(sg, n) {
    let html = '', left = n == null ? 1e9 : n;
    for (const s of sg) {
      if (left <= 0) break;
      const t = s.t.replace(/\|/g, '');
      const part = t.slice(0, left); left -= t.length;
      const inner = esc(part).replace(/\n/g, '<br>');
      html += s.cls.length ? '<span class="' + s.cls.join(' ') + '">' + inner + '</span>' : inner;
    }
    return html;
  }
  function markup(text) { return render(segs(text)); }
  function plainLen(sg) { return sg.reduce((a, s) => a + s.t.replace(/\|/g, '').length, 0); }

  /* ───────── 알림 · 현수막 ───────── */
  function toast(text, kind) {
    const box = $('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.innerHTML = markup(text);
    box.appendChild(el);
    while (box.children.length > 4) box.firstChild.remove();
    setTimeout(() => el.remove(), 2900);
  }
  function banner(title, sub, sec) {
    const el = $('banner');
    $('banner-title').textContent = title; $('banner-sub').textContent = sub || '';
    el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(UI.bannerT); UI.bannerT = setTimeout(() => { el.hidden = true; }, (sec || 2.4) * 1000);
  }

  /* ───────── 대사창 ───────── */
  const SPEED = [0, 22, 40, 90];
  function say(o) {
    return new Promise((resolve) => {
      const d = $('dialog');
      const sg = segs(o.text || '');
      UI.dlg = { o, sg, n: 0, len: plainLen(sg), t: 0, pause: 0, resolve, done: false, raw: sg.map((s) => s.t).join('') };
      d.hidden = false;
      d.className = (o.style || '') + (o.who || o.ent ? '' : ' noface');
      $('dlg-name').textContent = o.name ? nameSub(o.name) : '';
      const col = o.who && G.cast ? G.cast.color(typeof o.who === 'string' ? o.who : null) : null;
      d.style.setProperty('--nm', col || '');
      d.style.setProperty('--face', col ? U.shade(col, 0.35) : '');
      const fc = $('dlg-cv');
      if ((o.who || o.ent) && G.portraits) G.portraits.draw(fc, o.who || o.ent, o.face || 'normal');
      $('dlg-text').innerHTML = '';
      $('dlg-text').classList.toggle('shake', !!o.shake);
      $('dlg-next').hidden = true;
      if (o.shake) { G.world.shake(2, 0.25); }
      if (o.auto) UI.dlg.auto = o.auto;
    });
  }
  function closeDialog() { const d = $('dialog'); d.hidden = true; UI.dlg = null; }
  function updDialog(dt) {
    const D = UI.dlg; if (!D) return;
    const adv = I.pressed('confirm') || I.pressed('attack') || tapped();
    const spd = SPEED[(S() && S().settings.textSpeed) || 2] || 40;
    if (!D.done) {
      if (adv) { D.n = D.len; }
      else if (D.pause > 0) D.pause -= dt;
      else {
        D.t += dt * spd;
        while (D.t >= 1 && D.n < D.len) {
          D.t -= 1; D.n++;
          // | 는 잠깐 멈춤, 문장부호 뒤는 조금 쉰다
          const ch = charAt(D, D.n - 1);
          if (ch === '.' || ch === '?' || ch === '!' || ch === '…') { D.pause = 0.12; break; }
          if (ch === ',') { D.pause = 0.05; break; }
          if (D.n % 2 === 0 && ch !== ' ' && G.audio) G.audio.blip(D.o.voice || voiceOf(D.o.who));
        }
        if (pauseAt(D)) D.pause = 0.28;
      }
      $('dlg-text').innerHTML = render(D.sg, D.n);
      if (D.n >= D.len) { D.done = true; $('dlg-next').hidden = !!D.o.keep; D.doneT = 0; }
      if (adv) I.eat('confirm', 'attack', 'dodge');
      return;
    }
    D.doneT += dt;
    if (D.o.keep) { const r = D.resolve; UI.dlg = Object.assign({}, D, { resolve: null, kept: true }); if (r) r(); UI.dlg = null; return; }
    if ((adv && D.doneT > 0.08) || (D.auto && D.doneT > D.auto)) {
      I.eat('confirm', 'attack', 'dodge');
      sfx('tick');
      const r = D.resolve;
      UI.dlg = null;
      $('dialog').hidden = true;
      r(true);
    }
  }
  function charAt(D, i) { const s = D.sg.map((x) => x.t.replace(/\|/g, '')).join(''); return s[i]; }
  function pauseAt(D) {
    // 원문에서 n번째 글자 바로 뒤에 | 가 있으면
    let k = 0;
    for (const s of D.sg) for (let i = 0; i < s.t.length; i++) { if (s.t[i] === '|') { if (k === D.n && !D.pausedAt?.[k]) { D.pausedAt = D.pausedAt || {}; D.pausedAt[k] = 1; return true; } continue; } k++; }
    return false;
  }
  function voiceOf(w) { if (!w) return 1; if (typeof w === 'string' && G.cast) return G.cast.voice(w); if (w.voice) return w.voice; return 1; }
  function tapped() { const t = UI.tap; UI.tap = false; return t; }

  /* ───────── 선택지 ───────── */
  function choose(list) {
    return new Promise((resolve) => {
      const box = $('choices');
      box.innerHTML = '';
      list.forEach((x, i) => {
        const b = document.createElement('button');
        b.className = 'ch';
        b.innerHTML = '<span>' + markup(x.t) + (x.sub ? '<small style="display:block;color:var(--muted);font-size:11px">' + markup(x.sub) + '</small>' : '') + '</span>' + (x.tag ? '<span class="tag ' + x.tag + '">' + ({ dawn: '새벽', order: '질서', night: '밤' }[x.tag] || x.tag) + '</span>' : '');
        b.addEventListener('click', (e) => { e.stopPropagation(); if (UI.ch) pick(i); });
        b.addEventListener('pointerenter', () => { if (UI.ch) { UI.ch.sel = i; hl(); } });
        box.appendChild(b);
      });
      box.hidden = false;
      UI.ch = { list, sel: 0, resolve, t: 0 };
      hl();
      sfx('open');
    });
  }
  function hl() { const C = UI.ch; if (!C) return; [...$('choices').children].forEach((b, i) => b.classList.toggle('sel', i === C.sel)); const el = $('choices').children[C.sel]; if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); }
  function pick(i) { const C = UI.ch; UI.ch = null; $('choices').hidden = true; sfx('select'); I.eat('confirm', 'attack', 'dodge'); C.resolve(i); }
  function updChoice(dt) {
    const C = UI.ch; if (!C) return;
    C.t += dt;
    const nv = I.nav4();
    if (nv === 'up') { C.sel = (C.sel + C.list.length - 1) % C.list.length; hl(); sfx('move'); }
    if (nv === 'down') { C.sel = (C.sel + 1) % C.list.length; hl(); sfx('move'); }
    if (C.t > 0.15 && (I.pressed('confirm') || I.pressed('attack'))) pick(C.sel);
    tapped();
  }

  /* ───────── 모달 (메뉴 · 상점 …) ───────── */
  /** tabs: [{id, name, render(body, M)}] */
  function openModal(o) {
    const el = $('modal');
    el.innerHTML = '';
    const M = { o, tab: o.tab || (o.tabs && o.tabs[0].id), sel: 0, el, onClose: o.onClose, sub: null };
    UI.modal = M;
    const head = document.createElement('div'); head.className = 'm-head';
    head.innerHTML = '<div class="m-title">' + esc(o.title) + '</div>';
    const close = document.createElement('button'); close.className = 'm-close'; close.textContent = '닫기';
    close.addEventListener('click', () => closeModal());
    head.appendChild(close);
    el.appendChild(head);
    if (o.tabs && o.tabs.length > 1) {
      const tabs = document.createElement('div'); tabs.className = 'm-tabs';
      for (const t of o.tabs) { const b = document.createElement('button'); b.className = 'm-tab'; b.textContent = t.name; b.dataset.tab = t.id; b.addEventListener('click', () => setTab(t.id)); tabs.appendChild(b); }
      el.appendChild(tabs);
      M.tabsEl = tabs;
    }
    const body = document.createElement('div'); body.className = 'm-body'; el.appendChild(body); M.body = body;
    const foot = document.createElement('div'); foot.className = 'm-foot'; el.appendChild(foot); M.foot = foot;
    el.hidden = false;
    sfx('open');
    I.eatAll();
    refresh();
    return new Promise((res) => { M.resolve = res; });
  }
  function setTab(id) { const M = UI.modal; if (!M) return; M.tab = id; M.sel = 0; M.sub = null; sfx('page'); refresh(); M.body.scrollTop = 0; }
  function refresh() {
    const M = UI.modal; if (!M) return;
    if (M.tabsEl) [...M.tabsEl.children].forEach((b) => b.classList.toggle('on', b.dataset.tab === M.tab));
    const t = M.o.tabs ? M.o.tabs.find((x) => x.id === M.tab) : null;
    M.body.innerHTML = '';
    if (t) t.render(M.body, M); else if (M.o.render) M.o.render(M.body, M);
    const s = S();
    M.foot.innerHTML = (M.o.foot ? M.o.foot() : '') + '<span class="gold">◎ ' + U.fmtInt(s.gold) + '</span>';
    const navs = navList();
    M.sel = U.clamp(M.sel, 0, Math.max(0, navs.length - 1));
    hlNav();
  }
  function navList() { const M = UI.modal; return M ? [...M.body.querySelectorAll('.nav')] : []; }
  function hlNav() {
    const M = UI.modal, navs = navList();
    navs.forEach((n, i) => n.classList.toggle('sel', i === M.sel));
    const el = navs[M.sel]; if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }
  function closeModal(v) {
    const M = UI.modal; if (!M) return;
    UI.modal = null; $('modal').hidden = true; $('modal').innerHTML = '';
    sfx('cancel');
    I.eatAll();
    if (M.onClose) M.onClose();
    if (M.resolve) M.resolve(v);
  }
  function updModal() {
    const M = UI.modal; if (!M) return;
    if (I.pressed('cancel') || I.pressed('menu') && M.o.menuCloses !== false) {
      if (M.sub) { M.sub = null; refresh(); sfx('cancel'); I.eatAll(); return; }
      closeModal(); return;
    }
    const navs = navList();
    const cur = navs[M.sel];
    const grid = cur && cur.closest('[data-cols]');
    const cols = grid ? +grid.dataset.cols : 0;
    const nv = I.nav4();
    const tabs = M.o.tabs || [];
    const tabStep = (d) => { if (tabs.length < 2) return; const i = tabs.findIndex((x) => x.id === M.tab); setTab(tabs[(i + d + tabs.length) % tabs.length].id); };
    if (nv === 'up') { M.sel = Math.max(0, M.sel - (cols || 1)); hlNav(); sfx('move'); }
    else if (nv === 'down') { M.sel = Math.min(navs.length - 1, M.sel + (cols || 1)); hlNav(); sfx('move'); }
    else if (nv === 'left') { if (cols) { M.sel = Math.max(0, M.sel - 1); hlNav(); sfx('move'); } else tabStep(-1); }
    else if (nv === 'right') { if (cols) { M.sel = Math.min(navs.length - 1, M.sel + 1); hlNav(); sfx('move'); } else tabStep(1); }
    if (I.pressed('cycle')) tabStep(1);
    if (I.pressed('cycleL')) tabStep(-1);
    if ((I.pressed('confirm') || I.pressed('attack')) && cur) { I.eatAll(); cur.click(); }
  }

  /* 줄 하나 */
  function row(o) {
    const r = document.createElement(o.onClick ? 'button' : 'div');
    r.className = 'row' + (o.onClick ? ' nav' : '') + (o.dim ? ' dim' : '');
    r.style.width = '100%'; r.style.textAlign = 'left';
    let ic = '';
    r.innerHTML = (o.icon ? '<div class="ic"></div>' : '') + '<div class="nm"><b>' + markup(o.name) + '</b>' + (o.desc ? '<small>' + markup(o.desc) + '</small>' : '') + '</div>' + (o.v != null ? '<div class="v">' + markup(String(o.v)) + '</div>' : '');
    if (o.icon) { const c = o.icon.cloneNode ? o.icon : null; const box = r.querySelector('.ic'); const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; if (c) g.drawImage(o.icon, Math.round((16 - o.icon.width) / 2), Math.round((16 - o.icon.height) / 2)); box.appendChild(cv); }
    void ic;
    if (o.onClick) r.addEventListener('click', () => { o.onClick(); });
    return r;
  }
  function sec(body, t, cls) { const d = document.createElement('div'); d.className = 'sec' + (cls ? ' ' + cls : ''); d.textContent = t; body.appendChild(d); return d; }
  function note(body, html) { const d = document.createElement('div'); d.className = 'note'; d.innerHTML = html; body.appendChild(d); return d; }
  function itemIcon(id) {
    const it = G.data.ITEMS[id]; const H = G.hud;
    if (!it) return H.icon('none');
    if (it.icon) return H.icon(it.icon);
    if (it.type === 'use') return H.icon(it.heal ? 'heart' : 'light');
    if (it.type === 'sword') return swordIcon(it.col);
    if (it.type === 'bow') return H.icon('bow');
    if (it.type === 'ammo') return H.icon(it.ammo === 'arrows' ? 'arrows' : 'bomb');
    if (it.type === 'tome') return H.icon(it.spell);
    if (it.type === 'art') return H.icon('art');
    if (id === 'heartpiece' || id === 'heart_c') return H.icon('heart');
    return G.combat.icons ? G.combat.icons.item : H.icon('none');
  }
  const SWI = {};
  function swordIcon(col) { if (SWI[col]) return SWI[col]; const b = X.brush(12, 12); b.line(3, 8, 10, 1, col); b.line(3, 9, 10, 2, '#ffffff'); b.line(1, 8, 4, 11, '#e8c860'); b.px(2, 10, '#6a4424'); b.px(1, 11, '#6a4424'); SWI[col] = X.outline(b.put(), '#0b0914'); return SWI[col]; }

  /* ───────── 메뉴 ───────── */
  function menu(tab) {
    if (UI.modal || G.script.running) return;
    const D = G.data;
    return openModal({
      title: '비전 수첩', tab: tab || 'bag',
      tabs: [
        { id: 'bag', name: '가방', render: tabBag },
        { id: 'gear', name: '장비', render: tabGear },
        { id: 'stat', name: '성장', render: (b) => { tabStats(b); tabTree(b); } },
        { id: 'arts', name: '기술', render: tabArts },
        { id: 'quest', name: '부탁', render: tabQuest },
        { id: 'book', name: '수첩', render: tabBook },
        { id: 'map', name: '지도', render: tabMap },
        { id: 'opt', name: '설정', render: tabOpt },
      ],
      foot: () => { const s = S(); return '<span>Lv ' + s.lv + '</span><span' + (s.pts > 0 ? ' style="color:var(--gold)"' : '') + '>성장 점수 ' + (s.pts || 0) + '</span><span>' + G.prog.diff().name + '</span><span>' + U.fmtTime(s.t) + '</span>'; },
    });
    void D;
  }
  function useItem(id) {
    const s = S(), it = G.data.ITEMS[id], d = G.st.derive(s);
    if (it.revive) { toast('쓰러질 때 저절로 날아오른다', ''); return; }
    if (it.forget) {
      const spent = Object.values(s.stats).reduce((a, b) => a + b, 0) + Object.keys(s.skills).length;
      if (!spent) { toast('아직 잊을 것이 없다', ''); sfx('buzz'); return; }
      G.st.take(s, id); const back = G.prog.refund(s); s.hp = Math.min(s.hp, G.st.derive(s).hpMax);
      sfx('warp'); toast('쓴 성장 점수 ' + back + '점을 돌려받았다. 다시 고를 수 있다.', 'gold'); refresh(); return;
    }
    if (it.heal && s.hp >= d.hpMax && !it.mp && !it.buff) { toast('이미 가득하다', ''); sfx('buzz'); return; }
    if (!G.st.take(s, id)) return;
    if (it.heal) s.hp = Math.min(d.hpMax, s.hp + Math.round(it.heal * d.herb));
    if (it.mp) s.mp = Math.min(d.mpMax, s.mp + it.mp * d.herb);
    if (it.buff) { const b = Object.assign({}, it.buff); b.until = s.t + (b.t || 60); b.col = b.atk ? '#ff8a5a' : b.def ? '#8ac8ff' : b.warm ? '#ffd8a8' : '#8ae0a0'; delete b.t; s.buffs = s.buffs.filter((x) => x.until > s.t); s.buffs.push(b); }
    sfx('heal'); toast(it.name + '을(를) 썼다'.replace('을(를)', U.josa(it.name, '을/를').slice(it.name.length)), 'good');
    refresh();
  }
  function tabBag(body) {
    const s = S(), I2 = G.data.ITEMS;
    const ids = Object.keys(s.inv).filter((k) => s.inv[k] > 0);
    sec(body, '쓸 것');
    const use = ids.filter((k) => I2[k] && I2[k].type === 'use');
    if (!use.length) note(body, '물약과 음식은 가게에서 산다. 풀숲과 항아리에서도 가끔 나온다.');
    for (const k of use) body.appendChild(row({ icon: itemIcon(k), name: I2[k].name, desc: I2[k].desc, v: '×' + s.inv[k], onClick: () => useItem(k) }));
    sec(body, '화살 · 폭탄');
    body.appendChild(row({ icon: G.hud.icon('arrows'), name: '화살', v: s.ammo.arrows + ' / ' + s.ammo.arrowsMax, desc: s.tools.bow ? '' : '활이 없다' }));
    body.appendChild(row({ icon: G.hud.icon('bomb'), name: '폭탄', v: s.ammo.bombs + ' / ' + s.ammo.bombsMax, desc: s.tools.bomb ? '' : '폭탄 가방이 없다' }));
    const mats = ids.filter((k) => I2[k] && I2[k].type === 'mat');
    sec(body, '재료');
    if (!mats.length) note(body, '몬스터를 쓰러뜨리면 가끔 재료가 떨어진다. 대장간 강화와 부탁에 쓴다.');
    for (const k of mats) body.appendChild(row({ icon: itemIcon(k), name: I2[k].name, v: '×' + s.inv[k] }));
    sec(body, '소중한 것');
    const keys = ids.filter((k) => I2[k] && (I2[k].type === 'key' || I2[k].type === 'letter'));
    body.appendChild(row({ icon: G.hud.icon('heart'), name: '하트 조각', v: s.pieces + ' / 4', desc: '네 개를 모으면 하트가 한 칸 는다.' }));
    for (const k of keys) body.appendChild(row({ icon: itemIcon(k), name: I2[k].name, desc: I2[k].desc, onClick: I2[k].read ? () => readLetter(k) : null }));
  }
  function readLetter(k) {
    const it = G.data.ITEMS[k];
    closeModal();
    G.script.run(async (c) => { await c.narr(it.read); });
  }
  const SLOTS = [['sword', '검'], ['shield', '방패'], ['armor', '옷'], ['bow', '활'], ['acc1', '장신구 1'], ['acc2', '장신구 2']];
  const GRADE_TAG = (it) => '[g' + ((it && it.grade) || 1) + ']';
  /** 등급 색을 입힌 이름 */
  function gname(it) { return it ? GRADE_TAG(it) + it.name + '[/]' : ''; }
  function gradeLabel(it) { const g = G.prog.gradeOf(it); return GRADE_TAG(it) + g.name + '[/]'; }
  function statLine(it) {
    if (!it) return '';
    const p = [];
    if (it.grade) p.push(gradeLabel(it));
    if (it.atk) p.push('공격 ' + it.atk);
    if (it.reach) p.push('사거리 ' + it.reach);
    if (it.speed && it.speed !== 1) p.push(it.speed < 1 ? '빠름' : '느림');
    if (it.el) p.push({ fire: '불', ice: '얼음', light: '빛', bolt: '번개', poison: '독', dark: '어둠' }[it.el] + ' 속성');
    if (it.multi) p.push(it.multi + '갈래');
    if (it.type === 'shield' && it.lv) p.push('막기 ' + it.lv + '단계');
    if (it.def && it.def < 1) p.push('피해 -' + Math.round((1 - it.def) * 100) + '%');
    if (it.resist) p.push({ heat: '더위', cold: '추위', all: '더위 · 추위' }[it.resist] + ' 막음');
    if (it.fx) for (const k of ['str', 'vit', 'sta', 'int', 'dex']) if (it.fx[k]) p.push(G.prog.STAT_NAME[k] + (it.fx[k] > 0 ? ' +' : ' ') + it.fx[k]);
    if (it.req) p.push('필요 ' + G.prog.reqText(S(), it.req));
    return p.join(' · ');
  }
  function canEquip(it) { return G.prog.reqOk(S(), it && it.req); }
  function tabGear(body, M) {
    const s = S(), I2 = G.data.ITEMS, d = G.st.derive(s);
    if (M.sub === 'special') {
      sec(body, '필살기 고르기 — 게이지가 가득 차면 필살 버튼');
      for (const k of Object.keys(G.data.SPECIALS)) {
        const sp = G.data.SPECIALS[k], have = !!s.specials[k], ok = G.prog.reqOk(s, sp.req), on = s.specialMove === k;
        if (!have) { body.appendChild(row({ name: '[s]??? — ' + G.prog.gradeOf(sp).name + '[/]', desc: '아직 익히지 못한 필살기. 비기 두루마리를 사거나 찾거나 받아서 익힌다.', dim: true })); continue; }
        body.appendChild(row({ icon: G.hud.icon('special'), name: (on ? '[y]◆[/] ' : '') + gname(sp), desc: gradeLabel(sp) + ' — ' + sp.desc + (sp.req ? ' · 필요 ' + G.prog.reqText(s, sp.req) : ''), dim: !ok, onClick: () => {
          if (!ok) { toast('아직 다룰 수 없다: ' + G.prog.reqText(s, sp.req).replace(/\[\/?r\]/g, ''), 'bad'); sfx('buzz'); return; }
          s.specialMove = k; M.sub = null; sfx('equip'); toast('필살기: ' + sp.name, 'gold'); refresh();
        } }));
      }
      return;
    }
    if (M.sub) {
      const slot = M.sub, type = slot.startsWith('acc') ? 'acc' : slot;
      sec(body, SLOTS.find((x) => x[0] === slot)[1] + ' 고르기');
      const own = Object.keys(s.inv).filter((k) => I2[k] && I2[k].type === type && s.inv[k] > 0);
      if (type === 'armor' && !own.includes('ar_tunic')) own.unshift('ar_tunic');
      own.sort((a, b) => (I2[b].grade || 1) - (I2[a].grade || 1));
      if (type === 'acc') body.appendChild(row({ name: '(비우기)', onClick: () => { s.equip[slot] = null; M.sub = null; sfx('equip'); refresh(); } }));
      if (!own.length) note(body, '가진 것이 없다.');
      for (const k of own) {
        const on = s.equip[slot] === k, other = type === 'acc' && (slot === 'acc1' ? s.equip.acc2 : s.equip.acc1) === k, ok = canEquip(I2[k]);
        body.appendChild(row({ icon: itemIcon(k), name: (on ? '[y]◆[/] ' : '') + gname(I2[k]), desc: (statLine(I2[k]) ? statLine(I2[k]) + ' — ' : '') + I2[k].desc, dim: other || !ok, onClick: other ? null : () => {
          if (!ok) { toast('아직 다룰 수 없다: ' + G.prog.reqText(s, I2[k].req).replace(/\[\/?r\]/g, ''), 'bad'); sfx('buzz'); return; }
          s.equip[slot] = k; M.sub = null; sfx('equip'); s.hp = Math.min(s.hp, G.st.derive(s).hpMax); refresh();
        } }));
      }
      return;
    }
    sec(body, '지금 차림');
    for (const [slot, lab] of SLOTS) {
      const k = s.equip[slot], it = k ? I2[k] : null;
      body.appendChild(row({ icon: k ? itemIcon(k) : G.hud.icon('none'), name: lab + ' — ' + (it ? gname(it) : '[s]없음[/]'), desc: it ? statLine(it) : '', onClick: () => { M.sub = slot; M.sel = 0; sfx('select'); refresh(); } }));
    }
    const spc = G.data.SPECIALS[s.specialMove] || G.data.SPECIALS.flash;
    body.appendChild(row({ icon: G.hud.icon('special'), name: '필살기 — ' + gname(spc), desc: gradeLabel(spc) + ' · ' + spc.desc + ' (익힌 것 ' + Object.keys(s.specials).length + ' / ' + Object.keys(G.data.SPECIALS).length + ')', onClick: () => { M.sub = 'special'; M.sel = 0; sfx('select'); refresh(); } }));
    sec(body, '능력치');
    const dl = document.createElement('dl'); dl.className = 'kv card';
    const kv = [['하트', (d.hpMax / 4) + '칸'], ['검 공격', d.atk.toFixed(1) + (d.el ? ' (' + { fire: '불', ice: '얼음', light: '빛', bolt: '번개', poison: '독', dark: '어둠' }[d.el] + ')' : '')], ['활 공격', d.bowAtk.toFixed(1)], ['마법 배율', '×' + d.magMul.toFixed(2)], ['치명타', Math.round(d.crit * 100) + '%'], ['받는 피해', Math.round(d.def * 100 * G.prog.diff().hurt) + '%'], ['MP', Math.floor(s.mp) + ' / ' + d.mpMax], ['기력', Math.round(d.stamMax)], ['구르기 무적', d.rollIframes.toFixed(2) + '초']];
    dl.innerHTML = kv.map(([a, b]) => '<dt>' + a + '</dt><dd>' + b + '</dd>').join('');
    body.appendChild(dl);
  }
  /* ── 능력: 성장 점수를 능력치에 ── */
  function tabStats(body) {
    const s = S(), d = G.st.derive(s), P = G.prog;
    note(body, markup('렙업할 때마다 [y]성장 점수 ' + P.PTS_PER_LV + '점[/]. 능력치 한 칸에 1점, 재능(기술 탭)은 한 칸에 2~5점. 어디에 쓸지가 곧 싸우는 방식이다.\n[s]망각의 차를 마시면 쓴 점수를 모두 돌려받는다. 20을 넘긴 능력치는 한 점의 효과가 반으로 준다.[/]'));
    sec(body, '남은 성장 점수 ' + (s.pts || 0));
    const effect = { str: () => '검 피해 ×' + (1 + P.soft(d.stats.str, 0.04)).toFixed(2), vit: () => '하트 +' + (Math.floor(d.stats.vit / 3) / 4) + '칸 · 피해 -' + (Math.min(20, d.stats.vit * 0.4)).toFixed(1) + '%', sta: () => '기력 ' + Math.round(d.stamMax) + ' · 회복 ×' + d.stamRegen.toFixed(2), int: () => '마법 ×' + d.magMul.toFixed(2) + ' · MP ' + d.mpMax, dex: () => '활 ' + d.bowAtk.toFixed(1) + ' · 치명타 ' + Math.round(d.crit * 100) + '%' };
    for (const st of P.STATS) {
      const base = s.stats[st.id] || 0, bonus = d.stats[st.id] - base;
      const r = row({ name: '<b style="color:' + st.col + '">' + st.name + '</b>  ' + base + (bonus ? ' <span class="g">+' + bonus + '</span>' : ''), desc: st.desc + ' — 지금: ' + effect[st.id](), v: s.pts > 0 ? '＋ 1점' : '', onClick: () => {
        if (!(s.pts > 0)) { toast('성장 점수가 없다 — 렙업하면 ' + P.PTS_PER_LV + '점', 'bad'); sfx('buzz'); return; }
        const couldBefore = new Set(Object.keys(s.inv).filter((k) => G.data.ITEMS[k] && G.data.ITEMS[k].req && P.reqOk(s, G.data.ITEMS[k].req)));
        s.pts--; s.stats[st.id] = base + 1; sfx('skill');
        for (const k of Object.keys(s.inv)) { const it = G.data.ITEMS[k]; if (it && it.req && !couldBefore.has(k) && P.reqOk(s, it.req)) toast('이제 ' + gname(it) + '을(를) 다룰 수 있다!', 'gold'); }
        if (st.id === 'vit') { const d2 = G.st.derive(s); if (Math.floor((base + 1) / 3) > Math.floor(base / 3)) s.hp = Math.min(d2.hpMax, s.hp + 1); }
        if (st.id === 'int') s.mp = Math.min(G.st.derive(s).mpMax, s.mp + 3);
        refresh();
      } });
      r.querySelector('.nm b').innerHTML = '<span style="color:' + st.col + '">' + st.name + '</span>  ' + base + (bonus ? ' <span style="color:#7ee08a">(+' + bonus + ')</span>' : '');
      body.appendChild(r);
    }
  }
  function tabArts(body) {
    const s = S(), D = G.data, P = G.prog;
    sec(body, '도구 (도구 버튼)');
    const tools = Object.keys(s.tools).filter((k) => k !== 'bow');
    if (!tools.length) note(body, '아직 도구가 없다. 던전 깊은 곳 큰 상자에 잠들어 있다.');
    for (const k of tools) body.appendChild(row({ icon: G.hud.icon(D.ITEMS[k].icon || k), name: (s.tool === k ? '[y]◆ ' : '') + D.ITEMS[k].name + (s.tool === k ? '[/]' : ''), desc: D.ITEMS[k].desc, onClick: () => { s.tool = k; sfx('equip'); refresh(); } }));
    sec(body, '마법 (마법 버튼)');
    const sp = Object.keys(s.spells);
    if (!sp.length) note(body, '아직 마법을 모른다.');
    for (const k of sp) {
      const S2 = D.SPELLS[k], ok = P.reqOk(s, S2.req);
      body.appendChild(row({ icon: G.hud.icon(S2.icon), name: (s.spell === k ? '[y]◆[/] ' : '') + gname(S2), v: 'MP ' + Math.round(S2.mp * G.st.derive(s).mpCost), desc: gradeLabel(S2) + ' — ' + S2.desc + (S2.req ? ' · 필요 ' + P.reqText(s, S2.req) : ''), dim: !ok, onClick: () => {
        if (!ok) { toast('아직 다룰 수 없다: ' + P.reqText(s, S2.req).replace(/\[\/?r\]/g, ''), 'bad'); sfx('buzz'); return; }
        s.spell = k; sfx('equip'); refresh();
      } }));
    }
  }
  function tabTree(body) {
    const s = S(), D = G.data, P = G.prog;
    sec(body, '재능 나무 — 남은 성장 점수 ' + (s.pts || 0));
    note(body, '줄마다 요구 레벨이 있다. [y]⇄[/] 표시는 갈림길 — 둘 중 하나만 고를 수 있다. 망각의 차로 다시 고를 수 있다.'.replace('[y]', '<span class="y">').replace('[/]', '</span>'));
    const narrow = (innerWidth || 800) < 600;
    const grid = document.createElement('div'); grid.className = 'tree' + (narrow ? ' narrow' : ''); grid.dataset.cols = narrow ? 1 : 4;
    const cols = D.TREES.map((tr) => D.SKILLS.filter((x) => x.tree === tr));
    // 넓은 화면: 줄 × 갈래 격자 · 좁은 화면: 갈래마다 차례로
    const order = [];
    if (narrow) { for (const col of cols) for (let r = 1; r <= 6; r++) order.push([r, col]); }
    else for (let r = 1; r <= 6; r++) for (const col of cols) order.push([r, col]);
    for (const [r, col] of order) {
      {
        const cell = document.createElement('div'); cell.className = 'tcell';
        const list = col.filter((x) => x.row === r);
        if (r === 1) cell.insertAdjacentHTML('beforeend', '<small class="ttl">' + col[0].tree + '</small>');
        list.forEach((sk, idx) => {
          const block = P.skillBlock(s, sk), have = !!s.skills[sk.id], can = !block;
          const b = document.createElement('button');
          b.className = 'skill nav g' + sk.grade + (have ? ' have' : can ? ' can' : block && block.startsWith('갈림길') ? ' shut' : '');
          b.innerHTML = '<b>' + (sk.gate ? '⇄ ' : '') + esc(sk.name) + '</b><span>' + esc(sk.desc) + '</span><small>' + (have ? '배움' : esc(block || (sk.cost + '점 — 배울 수 있다'))) + '</small>';
          b.addEventListener('click', () => {
            const blk = P.skillBlock(s, sk);   // 누르는 순간 다시 확인 (빠르게 두 번 눌러 갈림길 둘을 다 배우지 않게)
            if (s.skills[sk.id]) return;
            if (blk) { toast(blk, 'bad'); sfx('buzz'); return; }
            s.pts -= sk.cost; s.skills[sk.id] = true; sfx('skill'); toast('재능: ' + sk.name + ' (' + P.gradeOf(sk).name + ')', 'gold');
            if (sk.id === 'sv_heart') s.hp = G.st.derive(s).hpMax;
            if (sk.id === 'bw_quiver') { s.ammo.arrowsMax += 30; }
            refresh();
          });
          cell.appendChild(b);
          if (sk.gate && idx === 0 && list.length > 1) cell.insertAdjacentHTML('beforeend', '<i class="or">또는</i>');
        });
        grid.appendChild(cell);
      }
    }
    body.appendChild(grid);
  }
  function tabQuest(body) {
    const s = S(), Q = G.data.QUESTS || {};
    sec(body, '지금 할 일');
    const goal = G.story && G.story.goalText ? G.story.goalText() : '';
    note(body, goal ? markup(goal) : '마음 가는 대로.');
    const on = Object.keys(s.quests).filter((k) => s.quests[k].st === 'on' && Q[k]);
    const done = Object.keys(s.quests).filter((k) => s.quests[k].st === 'done' && Q[k]);
    sec(body, '받은 부탁 ' + on.length);
    if (!on.length) note(body, '머리 위에 [y]![/] 가 뜬 사람이 부탁을 한다.');
    for (const k of on) body.appendChild(row({ name: Q[k].name, desc: (Q[k].who ? Q[k].who + ' — ' : '') + (typeof Q[k].desc === 'function' ? Q[k].desc(s) : Q[k].desc) }));
    sec(body, '끝낸 부탁 ' + done.length);
    for (const k of done) body.appendChild(row({ name: '[s]' + Q[k].name + '[/]', desc: Q[k].after || '', dim: true }));
  }
  function tabBook(body) {
    const s = S(), T = G.data.TRUTHS || {}, B = G.data.BOOKS || {};
    sec(body, '마음의 기울기');
    const r = s.route, tot = Math.max(1, r.dawn + r.order + r.night);
    const bars = document.createElement('div'); bars.className = 'card';
    bars.innerHTML = [['dawn', '새벽 — 부수고 되찾는다', '#ffa87a'], ['order', '질서 — 지키고 고친다', '#c8dcff'], ['night', '밤 — 숨기고 품는다', '#c49bff']].map(([k, l, col]) => '<div style="display:flex;justify-content:space-between;font-size:12px;margin:4px 0 3px"><span style="color:' + col + '">' + l + '</span><span>' + r[k] + '</span></div><div class="bar"><i style="width:' + Math.round((r[k] / tot) * 100) + '%;background:' + col + '"></i></div>').join('');
    body.appendChild(bars);
    if (G.story && G.story.routeNote) note(body, markup(G.story.routeNote()));
    sec(body, '진실의 조각 ' + Object.keys(s.truth).length + ' / ' + Object.keys(T).length);
    for (const k of Object.keys(T)) { const have = !!s.truth[k]; body.appendChild(row({ name: have ? T[k].name : '???', desc: have ? T[k].text : T[k].hint, dim: !have, onClick: have && T[k].long ? () => { closeModal(); G.script.run(async (c) => { for (const l of T[k].long) await c.narr(l); }); } : null })); }
    if (Object.keys(s.abyss).length) { sec(body, '심연 ' + Object.keys(s.abyss).length, 'abyss'); note(body, '들여다본 어둠. 너무 많이 알면, 그만큼 무거워진다.'); }
    const met = G.cast ? G.cast.met() : [];
    sec(body, '만난 사람 ' + met.length);
    for (const c of met) body.appendChild(row({ name: c.name, desc: c.note ? c.note(s) : c.desc, v: s.bond[c.id] ? '♥'.repeat(Math.min(5, s.bond[c.id])) : '' }));
    const books = Object.keys(s.books).filter((k) => B[k]);
    if (books.length) { sec(body, '읽은 글 ' + books.length); for (const k of books) body.appendChild(row({ name: B[k].name, desc: B[k].short || '', onClick: () => { closeModal(); G.script.run(async (c) => { for (const l of B[k].pages) await c.narr(l); }); } })); }
    sec(body, '일지');
    if (!s.log.length) note(body, '아직 적은 것이 없다.');
    for (const l of s.log.slice(0, 40)) { const d = document.createElement('div'); d.className = 'note'; d.style.margin = '4px 0'; d.innerHTML = '· ' + markup(l.text); body.appendChild(d); }
  }
  function tabMap(body) {
    if (G.story && G.story.drawWorldMap) { G.story.drawWorldMap(body); return; }
    note(body, '지도가 없다.');
  }
  function tabOpt(body) {
    const s = S(), st = s.settings;
    sec(body, '난이도');
    for (const D2 of G.prog.DIFF) body.appendChild(row({ name: ((st.diff == null ? 1 : st.diff) === D2.id ? '[y]◆ ' + D2.name + '[/]' : D2.name), desc: D2.desc, onClick: () => { st.diff = D2.id; sfx('select'); toast('난이도: ' + D2.name, D2.id >= 3 ? 'bad' : ''); refresh(); } }));
    sec(body, '소리 · 화면');
    const tog = (k, name) => body.appendChild(row({ name, v: st[k] === false ? '끔' : '켬', onClick: () => { st[k] = st[k] === false; if (G.audio) G.audio.applySettings(); refresh(); } }));
    tog('music', '음악'); tog('sfx', '효과음'); tog('shake', '화면 흔들림'); tog('minimap', '작은 지도');
    body.appendChild(row({ name: '음량', v: Math.round((st.vol == null ? 0.7 : st.vol) * 10) + ' / 10', onClick: () => { st.vol = ((Math.round((st.vol == null ? 0.7 : st.vol) * 10) % 10) + 1) / 10; if (G.audio) G.audio.applySettings(); refresh(); } }));
    body.appendChild(row({ name: '글자 속도', v: ['', '느리게', '보통', '빠르게'][st.textSpeed || 2], onClick: () => { st.textSpeed = ((st.textSpeed || 2) % 3) + 1; refresh(); } }));
    sec(body, '기록');
    body.appendChild(row({ name: '지금 기록하기', desc: '빛의 이정표와 침대에서 쉬어도 기록된다.', onClick: () => { if (G.script.running || G.script.busy || !G.st.save(s)) { toast('지금은 기록할 수 없다 — 벌어지고 있는 일을 먼저 끝내자', 'bad'); return; } toast('기록했다', 'good'); sfx('save'); } }));
    body.appendChild(row({ name: '타이틀로', desc: '기록하지 않은 것은 사라진다.', onClick: () => { closeModal(); G.game.toTitle(); } }));
    sec(body, '조작');
    const k = document.createElement('div'); k.className = 'keys card';
    k.innerHTML = [['WASD · 방향키', '이동'], ['J · Z · Enter', '공격 · 말 걸기 (길게: 회전 베기)'], ['Space · X', '구르기 (기력)'], ['K · C', '활 (누른 채 조준, 떼면 쏜다)'], ['L · V', '마법'], ['I · B', '도구'], ['O · F', '필살기 (게이지 가득)'], ['Q · E', '메뉴 탭 넘기기'], ['Esc · Tab', '메뉴'], ['M', '지도'], ['턱을 밀기', '뛰어내리기']].map(([a, b]) => '<kbd>' + a + '</kbd><span>' + b + '</span>').join('');
    body.appendChild(k);
  }

  /* ───────── 상점 · 대장간 ───────── */
  function shop(id) {
    const D = G.data, sh = D.SHOPS[id];
    if (!sh) return Promise.resolve();
    const tabs = [{ id: 'buy', name: '사기', render: (body) => shopBuy(body, sh) }, { id: 'sell', name: '팔기', render: shopSell }];
    if (sh.forge) tabs.push({ id: 'forge', name: '강화', render: forgeTab });
    return openModal({ title: sh.name, tabs });
  }
  function shopBuy(body, sh) {
    const s = S(), I2 = G.data.ITEMS;
    for (const k of sh.items) {
      const it = I2[k]; if (!it) continue;
      const owned = ['sword', 'shield', 'armor', 'bow', 'acc'].includes(it.type) && s.inv[k] > 0 || it.type === 'tome' && s.spells[it.spell] || it.type === 'art' && s.specials[it.special];
      const price = it.price;
      body.appendChild(row({ icon: itemIcon(k), name: gname(it) + (owned ? ' [s](가짐)[/]' : ''), desc: (statLine(it) ? statLine(it) + ' — ' : '') + it.desc, v: '◎ ' + U.fmtInt(price), dim: owned || s.gold < price, onClick: () => {
        if (owned) { toast('이미 가지고 있다', ''); return; }
        if (s.gold < price) { toast('골드가 모자란다', 'bad'); sfx('buzz'); return; }
        if (it.type === 'ammo' && !s.tools[it.ammo === 'arrows' ? 'bow' : 'bomb']) { toast(it.ammo === 'arrows' ? '활이 없다' : '폭탄 가방이 없다', 'bad'); sfx('buzz'); return; }
        s.gold -= price; G.st.give(s, k, 1); sfx('coin'); toast(it.name + ' 샀다', 'gold'); refresh();
      } }));
    }
  }
  function shopSell(body) {
    const s = S(), I2 = G.data.ITEMS;
    const mats = Object.keys(s.inv).filter((k) => I2[k] && I2[k].type === 'mat' && s.inv[k] > 0);
    note(body, '재료를 판다. 대장간 강화에 쓸 것은 남겨 두자.');
    for (const k of mats) body.appendChild(row({ icon: itemIcon(k), name: I2[k].name + ' ×' + s.inv[k], v: '◎ ' + I2[k].price, onClick: () => { if (G.st.take(s, k)) { s.gold += I2[k].price; sfx('coin'); refresh(); } } }));
  }
  function forgeTab(body) {
    const s = S(), D = G.data, I2 = D.ITEMS;
    note(body, '검을 맡기면 재료를 녹여 넣어 다음 검으로 두드린다.');
    const sw = s.equip.sword;
    const F = sw && D.FORGE[sw];
    if (!F) { note(body, sw ? '이 검은 더 두드릴 수 없다. 이미 완성된 검이다.' : '맡길 검이 없다.'); return; }
    const to = I2[F.to];
    const lack = Object.entries(F.mats).filter(([m, n]) => (s.inv[m] || 0) < n);
    body.appendChild(row({ icon: itemIcon(F.to), name: I2[sw].name + ' → [y]' + to.name + '[/]', desc: statLine(to) + ' — 재료: ' + Object.entries(F.mats).map(([m, n]) => I2[m].name + ' ' + (s.inv[m] || 0) + '/' + n).join(', '), v: '◎ ' + U.fmtInt(F.gold), dim: lack.length || s.gold < F.gold, onClick: () => {
      if (lack.length) { toast('재료가 모자란다: ' + lack.map(([m]) => I2[m].name).join(', '), 'bad'); sfx('buzz'); return; }
      if (s.gold < F.gold) { toast('골드가 모자란다', 'bad'); sfx('buzz'); return; }
      s.gold -= F.gold; for (const [m, n] of Object.entries(F.mats)) G.st.take(s, m, n);
      G.st.take(s, sw); G.st.give(s, F.to); s.equip.sword = F.to;
      closeModal();
      G.script.run(async (c) => { c.sfx('rumble'); await c.wait(0.6); c.sfx('clank'); c.flash('#fff', 0.3); await c.wait(0.3); await c.getItem(F.to, 1, { quiet: false }).catch(() => {}); });
    } }));
  }
  function forge() { return shop('red'); }

  /* ───────── 빛의 이정표: 이동 ───────── */
  function waystoneMenu(ws) {
    const s = S();
    return openModal({ title: '빛의 이정표 — ' + ws.name, render: (body) => {
      note(body, '체력과 MP가 가득 찼다. 기록했다.<br>불이 켜진 이정표로 곧장 갈 수 있다.');
      sec(body, '이동');
      const list = Object.entries(s.waystones);
      for (const [id, w] of list) body.appendChild(row({ name: w.name, dim: id === ws.wid, onClick: () => { if (id === ws.wid) return; closeModal(); G.script.run(async (c) => { c.sfx('warp'); G.fx.ring(G.world.player.x, G.world.player.y - 8, '#8ad8ff', 30, 0.5, 2); await c.wait(0.3); await c.warp(w.map, w.x, w.y, 'down'); }); } }));
    } });
  }

  /* ───────── 매 프레임 ───────── */
  function update(dt) {
    if (UI.modal) { updModal(); return; }
    if (UI.ch) { updChoice(dt); return; }
    if (UI.dlg) { updDialog(dt); return; }
    if (G.game.scene !== 'play') return;
    if (!G.script.running) {
      if (I.pressed('menu')) { I.eat('menu'); menu(); }
      else if (I.pressed('map')) { I.eat('map'); menu('map'); }
      else if (I.pressed('cycle') || I.pressed('cycleL')) cycleEquip(I.pressed('cycle') ? 1 : -1);
    }
    UI.tap = false;
  }
  /** 바꾸기 버튼: 도구 → 다음 도구 (도구가 하나면 마법) */
  function cycleEquip(d) {
    const s = S();
    I.eat('cycle', 'cycleL');
    const tools = Object.keys(s.tools).filter((k) => k !== 'bow');
    const spells = Object.keys(s.spells);
    if (tools.length > 1) { const i = tools.indexOf(s.tool); s.tool = tools[(i + d + tools.length) % tools.length]; toast('도구: ' + G.data.ITEMS[s.tool].name, ''); sfx('equip'); }
    else if (spells.length > 1) { const i = spells.indexOf(s.spell); s.spell = spells[(i + d + spells.length) % spells.length]; toast('마법: ' + G.data.SPELLS[s.spell].name, ''); sfx('equip'); }
    if (tools.length > 1 && spells.length > 1 && I.held('cycle') > 0.3) { /* 길게 누르면 마법 */ }
  }
  function blocking() { return !!(UI.dlg || UI.ch || UI.modal); }
  function paused() { return !!UI.modal; }

  // 대사창 · 화면 두드리기
  function bindTap() {
    const d = $('dialog');
    d.addEventListener('pointerdown', (e) => { e.preventDefault(); UI.tap = true; });
    $('chapter').addEventListener('pointerdown', () => { UI.tap = true; });
  }

  /* ───────── 타이틀 ───────── */
  function title() {
    const el = $('title');
    const save = G.st.load();
    el.innerHTML = '';
    const bg = document.createElement('canvas'); bg.className = 'bg'; el.appendChild(bg);
    UI.titleBg = bg;
    el.insertAdjacentHTML('beforeend', '<div class="t-logo"><small>빛의 검과 무한의 그릇</small>무한렙업 대모험<em>이리스 대륙 · 천년력 999년</em></div>' +
      '<div class="t-sub">열여섯 번째 생일 아침, 장롱 속에서 검 한 자루가 빛났다.<br>대륙의 빛은 하늘로 빨려 가고, 황금별 옆에 검은 점이 다시 떴다.</div>');
    const menu2 = document.createElement('div'); menu2.className = 't-menu';
    const btns = [];
    const add = (t, pri, fn) => { const b = document.createElement('button'); b.className = 't-btn' + (pri ? ' pri' : ''); b.textContent = t; b.addEventListener('click', () => { sfx('select'); fn(); }); menu2.appendChild(b); btns.push(b); };
    if (save) add('이어하기 — ' + save.name + ' · Lv ' + save.lv + ' · ' + U.fmtTime(save.t), true, () => { hideTitle(); G.game.continueGame(save); });
    add('새로 시작', !save, () => newGameForm(el));
    add('조작 안내', false, () => keysHelp(el));
    el.appendChild(menu2);
    el.insertAdjacentHTML('beforeend', '<div class="t-foot">가로 화면 권장 · 휴대폰은 왼쪽 스틱, 오른쪽 버튼 · 글꼴: 갈무리(SIL OFL)</div>');
    el.hidden = false;
    UI.title = { btns, sel: 0 };
    hlTitle();
    G.game.scene = 'title';
    if (G.audio) G.audio.music('title');
  }
  function hlTitle() { const T = UI.title; if (!T) return; T.btns.forEach((b, i) => b.classList.toggle('sel', i === T.sel)); }
  function titleUpdate() {
    const T = UI.title; if (!T || !T.btns.length) return;
    const nv = I.nav4();
    if (nv === 'up') { T.sel = (T.sel + T.btns.length - 1) % T.btns.length; hlTitle(); sfx('move'); }
    if (nv === 'down') { T.sel = (T.sel + 1) % T.btns.length; hlTitle(); sfx('move'); }
    if (I.pressed('confirm') && !(document.activeElement && document.activeElement.tagName === 'INPUT')) { I.eatAll(); T.btns[T.sel].click(); }
  }
  function titleDraw(g, w, h) {
    // 타이틀 뒤 캔버스: 별밤과 황금별, 흑점
    const t = performance.now() / 1000;
    const bg = UI.titleBg;
    if (!bg) { g.fillStyle = '#05040a'; g.fillRect(0, 0, w, h); return; }
    if (bg.width !== w) { bg.width = w; bg.height = h; }
    const c = bg.getContext('2d');
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#07051a'); gr.addColorStop(0.6, '#1a1238'); gr.addColorStop(1, '#2a1a30');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { const x = (U.hash('sx' + i) % 1000) / 1000 * w, y = (U.hash('sy' + i) % 1000) / 1000 * h * 0.7; if (Math.sin(t * 2 + i) > -0.3) { c.fillStyle = i % 7 ? '#ffffff' : '#ffe8a8'; c.fillRect(Math.round(x), Math.round(y), 1, 1); } }
    const sx = w * 0.72, sy = h * 0.22;
    c.fillStyle = 'rgba(255,220,120,0.12)'; c.beginPath(); c.arc(sx, sy, 20 + Math.sin(t) * 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(sx, sy, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0a0612'; c.beginPath(); c.arc(sx + 16 + Math.sin(t * 0.3) * 2, sy + 4, 5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,60,90,0.35)'; c.beginPath(); c.arc(sx + 16 + Math.sin(t * 0.3) * 2, sy + 4, 6.5, 0, Math.PI * 2); c.stroke();
    // 언덕
    for (let layer = 0; layer < 3; layer++) {
      c.fillStyle = ['#1a1430', '#141024', '#0c0a16'][layer];
      c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) c.lineTo(x, h * (0.66 + layer * 0.1) + Math.sin(x / (40 + layer * 30) + layer) * (10 - layer * 2) + U.vnoise(x / 30, layer, 3) * 8);
      c.lineTo(w, h); c.fill();
    }
    g.fillStyle = '#05040a'; g.fillRect(0, 0, w, h);
  }
  function hideTitle() { $('title').hidden = true; UI.title = null; }
  function newGameForm(el) {
    el.innerHTML = '';
    const bg = UI.titleBg; if (bg) el.appendChild(bg);
    el.insertAdjacentHTML('beforeend', '<div class="t-logo" style="font-size:24px"><small>새 이야기</small>이름을 정한다</div>');
    const f = document.createElement('div'); f.className = 't-field';
    f.innerHTML = '<label>이름 (한글 1~6자)</label><input id="t-name" maxlength="6" value="아린" autocomplete="off"><label>모습</label>';
    const gd = document.createElement('div'); gd.className = 't-gender';
    let gender = 'boy';
    const mk = (gid, lab) => {
      const b = document.createElement('button'); b.dataset.g = gid;
      const cv = document.createElement('canvas'); cv.width = 24; cv.height = 32;
      const sh = G.sprites.sheet(G.story && G.story.heroLook ? G.story.heroLook({ gender: gid, flags: {} }) : { gender: gid });
      const img = sh.get('idle', 'down', 0); cv.getContext('2d').drawImage(img, 0, 0);
      b.appendChild(cv); b.insertAdjacentHTML('beforeend', '<span>' + lab + '</span>');
      b.addEventListener('click', () => { gender = gid; [...gd.children].forEach((x) => x.classList.toggle('on', x.dataset.g === gid)); sfx('select'); });
      gd.appendChild(b);
    };
    mk('boy', '소년'); mk('girl', '소녀');
    gd.firstChild.classList.add('on');
    f.appendChild(gd);
    // 난이도 (나중에 설정에서 바꿀 수 있다)
    let diff = 1;
    f.insertAdjacentHTML('beforeend', '<label>난이도 <small style="color:var(--muted)">— 설정에서 언제든 바꿀 수 있다</small></label>');
    const dd = document.createElement('div'); dd.className = 't-diff';
    const dn = document.createElement('div'); dn.className = 't-diffnote';
    for (const D2 of G.prog.DIFF) {
      const b = document.createElement('button'); b.dataset.d = D2.id; b.textContent = D2.name;
      b.addEventListener('click', () => { diff = D2.id; [...dd.children].forEach((x) => x.classList.toggle('on', +x.dataset.d === diff)); dn.textContent = D2.desc; sfx('select'); });
      dd.appendChild(b);
    }
    dd.children[1].classList.add('on'); dn.textContent = G.prog.DIFF[1].desc;
    f.appendChild(dd); f.appendChild(dn);
    el.appendChild(f);
    const m = document.createElement('div'); m.className = 't-menu';
    const go = document.createElement('button'); go.className = 't-btn pri'; go.textContent = '시작한다';
    go.addEventListener('click', () => {
      let name = ($('t-name').value || '').trim().replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 6);
      if (!name) name = gender === 'girl' ? '아린' : '아린';
      if (G.audio) G.audio.unlock();
      hideTitle();
      G.game.newGame(name, gender, diff);
    });
    const back = document.createElement('button'); back.className = 't-btn'; back.textContent = '돌아가기'; back.addEventListener('click', () => title());
    m.appendChild(go); m.appendChild(back);
    el.appendChild(m);
    UI.title = { btns: [go, back], sel: 0 };
    hlTitle();
  }
  function keysHelp(el) {
    el.innerHTML = '';
    const bg = UI.titleBg; if (bg) el.appendChild(bg);
    el.insertAdjacentHTML('beforeend', '<div class="t-logo" style="font-size:24px"><small>조작</small>이렇게 움직인다</div>');
    const k = document.createElement('div'); k.className = 'keys card'; k.style.maxWidth = '420px';
    k.innerHTML = [['이동', 'WASD · 방향키 / 왼쪽 스틱'], ['공격 · 말 걸기', 'J · Z · Enter / 빨간 버튼 (길게 눌렀다 떼면 회전 베기)'], ['구르기', 'Space · X / 파란 버튼 — 적의 공격 직전에 구르면 완벽 회피'], ['활', 'K · C (누른 채 방향으로 조준)'], ['마법', 'L · V'], ['도구', 'I · B (폭탄 · 갈고리 · 등불 …)'], ['필살기', 'O · F (게이지가 가득 찼을 때)'], ['바꾸기', 'Q · E / ⇄'], ['메뉴 · 지도', 'Esc · Tab / M'], ['높은 곳', '낮은 쪽 턱을 밀면 뛰어내린다. 오를 때는 계단으로']].map(([a, b]) => '<kbd>' + a + '</kbd><span>' + b + '</span>').join('');
    el.appendChild(k);
    const m = document.createElement('div'); m.className = 't-menu';
    const back = document.createElement('button'); back.className = 't-btn pri'; back.textContent = '돌아가기'; back.addEventListener('click', () => title());
    m.appendChild(back); el.appendChild(m);
    UI.title = { btns: [back], sel: 0 }; hlTitle();
  }

  /* ───────── 쓰러짐 ───────── */
  function gameOver() {
    return openModal({ title: '쓰러졌다', menuCloses: false, render: (body) => {
      note(body, '빛이 몸을 감싼다. 이리스 대륙에서는 싸움에 져도 죽지 않는다.<br>마지막으로 쉬었던 곳에서 눈을 뜬다.');
      body.appendChild(row({ name: '[y]일어난다[/]', desc: '마지막 이정표 · 쉼터에서 하트 3칸으로', onClick: () => { closeModal('retry'); } }));
      body.appendChild(row({ name: '타이틀로', onClick: () => { closeModal('title'); } }));
    } });
  }

  Object.assign(UI, { toast, banner, say, closeDialog, choose, markup, openModal, closeModal, refresh, menu, shop, forge, waystoneMenu, update, blocking, paused, bindTap, title, titleUpdate, titleDraw, hideTitle, gameOver, tapped, row, sec, note, itemIcon, useItem });
  G.ui = UI;
})();
