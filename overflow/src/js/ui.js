/* UI: 전투 캔버스, HUD, 탭 패널, 대화, 모달, 토스트 */
(function () {
  'use strict';
  const OF = globalThis.OF;
  const E = OF.engine, N = OF.num, D = OF.data, STY = OF.story, SP = OF.sprites, AU = OF.audio;
  const { TOWNS, CLASSES, EQUIP, COMPANIONS, SKILLS, FRAG_UPG, ACH, ORBS, ORB_COLORS, B: BAL, FINAL_ZONE } = D;
  const fmt = N.fmt, fmtInt = N.fmtInt, fmtMult = N.fmtMult;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const BOSS_P = ['malang', 'gapjil', 'volcano', 'excel', 'underflow', 'pi', 'div', 'loop', 'nan', 'max', 'gc'];
  const STAT_INFO = {
    str: ['힘', 'STR'], vit: ['체력', 'VIT'], agi: ['민첩', 'AGI'], int: ['지능', 'INT'], luk: ['행운', 'LUK'],
  };
  const EQ_ICON = ['🗡️', '🛡️', '💍', '📿'];
  const EQ_STAT = ['공격력', '최대 체력', '골드', '경험치'];

  let S = null;
  const ui = {
    tab: 'stats', sub: 'ach', buyN: 1, townSel: 0, npcSay: {}, spotSay: {}, floats: [], parts: [],
    shake: 0, btnPress: 0, heroHit: 0, monHit: 0, lvFx: null, lvAcc: 0, lvFxT: 0, dlg: null, dlgQueue: [],
    pwInput: '', pwLine: null, hintShown: {}, slot: ['7️⃣', '💎', '🍒'], hudT: 0, bindT: 0, tapCount: 0, glitch: 0,
  };
  let cv, ctx, W = 320, H = 240, dpr = 1;
  const bgCache = {};

  /* ───────── 유틸 ───────── */
  function setT(el, v) { if (el.textContent !== v) el.textContent = v; }
  function setH(el, v) { if (el._h !== v) { el.innerHTML = v; el._h = v; } }
  function pct(x) { return N.fmtPct(x); }
  function vibrate(ms) { if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* 무시 */ } }
  const urlCache = {};
  function canvasURL(key, c) {
    if (urlCache[key]) return urlCache[key];
    const x = document.createElement('canvas');
    x.width = c.width; x.height = c.height;
    x.getContext('2d').drawImage(c, 0, 0);
    return (urlCache[key] = x.toDataURL());
  }
  function mobColors(t, mi) {
    const pal = TOWNS[t].pal;
    const f = [1, 0.85, 1.15, 0.72, 1.28][mi] || 1;
    return mi % 2 ? [SP.shade(pal[4], 1.35), SP.shade(pal[3], f)] : [SP.shade(pal[3], f), pal[4]];
  }
  function mobURL(t, mi) {
    const [a, b] = mobColors(t, mi);
    const c = SP.monsterCanvas(N.hashStr(TOWNS[t].id) + mi, a, b, 0, 3, mi);
    return canvasURL('mob' + t + '_' + mi, c);
  }

  /* ───────── 바인딩 ───────── */
  let BINDS = {};
  function bind(key, fn) { BINDS[key] = fn; return 'data-b="' + key + '"'; }
  function updateBinds() {
    const els = document.querySelectorAll('#panel [data-b], #mbox [data-b]');
    for (const el of els) { const f = BINDS[el.dataset.b]; if (f) f(el); }
  }

  /* ───────── 캔버스 ───────── */
  function resize() {
    const r = $('battle').getBoundingClientRect();
    dpr = Math.min(3, window.devicePixelRatio || 1);
    W = Math.max(200, r.width); H = Math.max(150, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    for (const k in bgCache) delete bgCache[k];
  }
  function lum(hex) { const n = parseInt(hex.slice(1), 16); return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11; }
  function mix(a, b, f) {
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((x >> s) & 255) * (1 - f) + ((y >> s) & 255) * f);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }
  function makeBG(t, w, h) {
    w = Math.ceil(w); h = Math.ceil(h);
    const key = t + '_' + w + 'x' + h;
    if (bgCache[key]) return bgCache[key];
    const town = TOWNS[t], pal = town.pal;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    const gy = Math.round(h * 0.74);
    const grd = g.createLinearGradient(0, 0, 0, gy);
    grd.addColorStop(0, pal[0]); grd.addColorStop(1, pal[1]);
    g.fillStyle = grd; g.fillRect(0, 0, w, gy);
    const rnd = N.rng(N.hashStr(town.id) + 3);
    if (lum(pal[0]) < 90) {
      for (let i = 0; i < 55; i++) { g.fillStyle = rnd() < 0.25 ? '#ffffff' : '#ffffff66'; g.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * gy * 0.8), 2, 2); }
    } else {
      g.fillStyle = '#ffffff88';
      for (let i = 0; i < 4; i++) { const cx = rnd() * w, cy = rnd() * gy * 0.45 + 10, cw = 30 + rnd() * 40; g.fillRect(cx, cy, cw, 8); g.fillRect(cx + 8, cy - 6, cw - 20, 6); }
    }
    if (t === 10) { // 천장: 붉은 선
      g.fillStyle = '#ff3b5c'; g.fillRect(0, 14, w, 3);
      g.fillStyle = '#ff3b5c55'; g.fillRect(0, 10, w, 11);
      g.fillStyle = '#ffb3c1'; g.font = '9px monospace'; g.fillText('1.7976931348623157e308', 8, 30);
    }
    const px = 6;
    g.fillStyle = mix(pal[2], pal[1], 0.5);
    let hh = gy * 0.7;
    for (let x = 0; x < w; x += px) { hh += (rnd() - 0.5) * px * 1.4; hh = Math.max(gy * 0.42, Math.min(gy * 0.88, hh)); g.fillRect(x, Math.round(hh), px, gy - Math.round(hh)); }
    g.fillStyle = mix(pal[2], pal[1], 0.25);
    hh = gy * 0.85;
    for (let x = 0; x < w; x += px) { hh += (rnd() - 0.5) * px * 1.1; hh = Math.max(gy * 0.72, Math.min(gy * 0.96, hh)); g.fillRect(x, Math.round(hh), px, gy - Math.round(hh)); }
    // 건물 실루엣 (도시)
    if ([1, 2, 5, 7, 9].includes(t)) {
      g.fillStyle = mix(pal[2], '#000000', 0.25);
      for (let i = 0; i < 7; i++) { const bx = rnd() * w, bw = 14 + rnd() * 24, bh = 20 + rnd() * gy * 0.35; g.fillRect(Math.round(bx), Math.round(gy - bh), Math.round(bw), Math.round(bh)); }
    }
    g.fillStyle = pal[2]; g.fillRect(0, gy, w, h - gy);
    g.fillStyle = mix(pal[2], '#ffffff', 0.25); g.fillRect(0, gy, w, 3);
    for (let i = 0; i < 70; i++) { g.fillStyle = mix(pal[2], i % 2 ? '#000000' : '#ffffff', 0.12 + rnd() * 0.12); g.fillRect(Math.floor(rnd() * w), gy + 5 + Math.floor(rnd() * (h - gy - 5)), 4 + Math.floor(rnd() * 6), 2); }
    bgCache[key] = c;
    return c;
  }

  function monsterImg(e, sc) {
    if (e.kind === 3) return SP.portrait('overflow', sc + 1);
    if (e.kind === 2) return SP.portrait(BOSS_P[e.t], sc + 1);
    const [a, b] = mobColors(e.t, e.mi);
    return SP.monsterCanvas(e.seed, a, b, e.kind, sc, e.mi);
  }

  function addFloat(x, y, txt, col, sz, life) {
    if (!S.settings.fx && sz < 20) return;
    if (ui.floats.length > 34) ui.floats.shift();
    ui.floats.push({ x, y, txt, col, sz, life: life || 0.9, max: life || 0.9, vy: -40 - Math.random() * 20 });
  }
  function burst(x, y, col, n) {
    if (!S.settings.fx) return;
    for (let i = 0; i < n; i++) {
      if (ui.parts.length > 90) ui.parts.shift();
      const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 120;
      ui.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, col, life: 0.5 + Math.random() * 0.4 });
    }
  }

  function geom() {
    const gy = Math.round(H * 0.74);
    const hs = Math.max(2, Math.floor(H * 0.3 / 18));
    const ms = Math.max(2, Math.floor(H * 0.34 / 16));
    return { gy, hs, ms, mx: W * 0.74, hx: W * 0.28 };
  }

  function draw(now, dt) {
    const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    let sx = 0, sy = 0;
    if (ui.shake > 0) { ui.shake -= dt; sx = (Math.random() - 0.5) * 7; sy = (Math.random() - 0.5) * 7; }
    ctx.save();
    ctx.translate(sx, sy);
    const G = geom();
    const tIdx = E.townOf(Math.min(S.zone, FINAL_ZONE - 1));
    ctx.drawImage(makeBG(tIdx, W, H), 0, 0);
    const e = S.enemy;
    if (e && e.kind === 3) {
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#ff3b5c22' : '#5ef0ff18'; ctx.fillRect(0, (t * 90 + i * 53) % H, W, 3 + (i % 3) * 2); }
    }
    // 동료
    const owned = COMPANIONS.filter((c) => (S.comps[c.id] || 0) > 0);
    const cs = Math.max(1, G.hs - 3);
    for (let i = owned.length - 1; i >= 0; i--) {
      const img = SP.portrait(owned[i].portrait, cs);
      const col = i % 2, row = Math.floor(i / 2);
      const x = Math.round(2 + col * img.width * 0.78);
      const y = Math.round(G.gy - img.height - row * img.height * 0.66 + Math.sin(t * 2.5 + i) * 2);
      ctx.drawImage(img, x, y);
    }
    ctx.globalAlpha = 1;
    // 영웅
    const hero = SP.portrait('zero', G.hs);
    const cc = E.curClass(S);
    const hx = Math.round(G.hx - hero.width / 2), hy = Math.round(G.gy - hero.height + Math.sin(t * 3) * 2);
    if (cc) {
      const rg = ctx.createRadialGradient(G.hx, hy + hero.height / 2, 4, G.hx, hy + hero.height / 2, hero.width * 0.85);
      rg.addColorStop(0, cc.color + '66'); rg.addColorStop(1, cc.color + '00');
      ctx.fillStyle = rg; ctx.fillRect(G.hx - hero.width, hy - 10, hero.width * 2, hero.height + 20);
    }
    ctx.drawImage(hero, hx, hy);
    if (ui.heroHit > 0) { ui.heroHit -= dt; ctx.fillStyle = '#ff3b5c55'; ctx.fillRect(hx, hy, hero.width, hero.height); }
    // 몬스터
    if (e) {
      const img = monsterImg(e, G.ms);
      let sc = 1;
      if (ui.monHit > 0) { ui.monHit -= dt; sc = 1 + ui.monHit * 0.9; }
      const w = img.width * sc, h = img.height * sc;
      const bob = Math.sin(t * (e.kind ? 2 : 3.2)) * 3;
      const mx = Math.round(G.mx - w / 2), my = Math.round(G.gy - h + bob);
      ctx.fillStyle = '#00000044';
      ctx.fillRect(Math.round(G.mx - img.width * 0.35), G.gy - 2, Math.round(img.width * 0.7), 4);
      ctx.drawImage(img, mx, my, Math.round(w), Math.round(h));
      // 이름 + 체력바 (몬스터 머리 위)
      const bw = Math.min(150, W * 0.42), bx = Math.round(Math.min(W - bw - 6, G.mx - bw / 2)), by = Math.max(70, Math.round(G.gy - img.height - 16));
      ctx.font = "700 11px 'IBM Plex Sans KR', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000aa'; ctx.fillText(e.name, bx + bw / 2 + 1, by - 4);
      ctx.fillStyle = e.kind >= 2 ? '#ffcf4a' : e.kind === 1 ? '#ffb4bd' : '#ffffff';
      ctx.fillText(e.name, bx + bw / 2, by - 5);
      ctx.fillStyle = '#0b0818'; ctx.fillRect(bx - 1, by - 1, bw + 2, 12);
      const f = e.kind === 3 ? 1 : Math.max(0, Math.min(1, e.hp / e.maxHp));
      ctx.fillStyle = e.kind === 3 ? '#ff3b5c' : f > 0.5 ? '#6ee7a8' : f > 0.2 ? '#ffcf4a' : '#ff4d5e';
      ctx.fillRect(bx, by, Math.round(bw * f), 10);
      ctx.font = "9px 'Silkscreen', monospace";
      ctx.fillStyle = '#fff';
      ctx.fillText(e.kind === 3 ? '∞ / ∞' : fmt(Math.max(0, e.hp)), bx + bw / 2, by + 8.5);
      ctx.textAlign = 'left';
    }
    // 보스 타이머 / 체력
    if (S.bf && e && e.kind >= 1 && e.kind < 3) {
      const f = Math.max(0, S.bf.time / S.bf.maxTime);
      const y = 46;
      ctx.fillStyle = '#0b0818cc'; ctx.fillRect(8, y, W - 16, 7);
      ctx.fillStyle = f < 0.3 ? '#ff4d5e' : '#ffcf4a'; ctx.fillRect(9, y + 1, Math.round((W - 18) * f), 5);
      const pf = Math.max(0, S.bf.php / S.bf.pmax);
      const pw = hero.width + 10, px = Math.round(G.hx - pw / 2), py = G.gy + 9;
      ctx.fillStyle = '#0b0818'; ctx.fillRect(px - 1, py - 1, pw + 2, 8);
      ctx.fillStyle = pf > 0.3 ? '#6ee7a8' : '#ff4d5e'; ctx.fillRect(px, py, Math.round(pw * pf), 6);
      ctx.font = "8px 'Silkscreen', monospace"; ctx.fillStyle = '#fff'; ctx.fillText('HP', px, py + 16);
    }
    if (e && e.kind === 3) {
      const r = e.lastRatio || 0;
      const lg = r > 0 ? Math.max(0, Math.min(1, (Math.log10(r * BAL.finalBoost) + 20) / 20)) : 0;
      ctx.fillStyle = '#0b0818cc'; ctx.fillRect(8, 46, W - 16, 7);
      ctx.fillStyle = '#ff3b5c'; ctx.fillRect(9, 47, Math.round((W - 18) * lg), 5);
      ctx.font = "9px 'Silkscreen', monospace"; ctx.fillStyle = '#ffb3c1';
      ctx.fillText('OVERFLOW ' + Math.floor(lg * 100) + '%', 10, 64);
    }
    // 버튼
    const bs = Math.max(2, G.hs - 2);
    const bimg = SP.portrait('button', bs);
    let squish = 0;
    if (ui.btnPress > 0) { ui.btnPress -= dt; squish = 0.22; }
    const bw2 = bimg.width, bh2 = Math.round(bimg.height * (1 - squish));
    const bcx = W * 0.5;
    const bxx = Math.round(bcx - bw2 / 2), byy = Math.round(G.gy - bh2 + 2);
    ctx.drawImage(bimg, bxx, byy, bw2, bh2);
    if (S.tot.playTime < 90 && !ui.dlg && Math.floor(t * 2) % 2 === 0) {
      ctx.font = "15px 'Bagel Fat One', sans-serif"; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#120d1c'; ctx.strokeText('TAP!', bcx, byy - 6);
      ctx.fillStyle = '#ffcf4a'; ctx.fillText('TAP!', bcx, byy - 6); ctx.textAlign = 'left';
    }
    // 파티클
    for (let i = ui.parts.length - 1; i >= 0; i--) {
      const p = ui.parts[i];
      p.life -= dt; if (p.life <= 0) { ui.parts.splice(i, 1); continue; }
      p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
    }
    // 레벨업 연출
    if (ui.lvFx) {
      const L = ui.lvFx; L.life -= dt;
      if (L.life <= 0) ui.lvFx = null;
      else {
        const a = Math.min(1, L.life / 0.4), yy = hy - 10 - (1.2 - L.life) * 30;
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#120d1c';
        ctx.font = "17px 'Bagel Fat One', sans-serif";
        ctx.strokeText('LEVEL UP!', G.hx, yy); ctx.fillStyle = '#ff5566'; ctx.fillText('LEVEL UP!', G.hx, yy);
        ctx.font = "12px 'Bagel Fat One', sans-serif";
        const s2 = '+' + fmtInt(L.gained);
        ctx.strokeText(s2, G.hx, yy + 15); ctx.fillStyle = '#ffffff'; ctx.fillText(s2, G.hx, yy + 15);
        ctx.globalAlpha = 1; ctx.textAlign = 'left';
      }
    }
    // 떠오르는 숫자
    ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#120d1c';
    for (let i = ui.floats.length - 1; i >= 0; i--) {
      const f = ui.floats[i];
      f.life -= dt; if (f.life <= 0) { ui.floats.splice(i, 1); continue; }
      f.y += f.vy * dt; f.vy *= 0.96;
      ctx.globalAlpha = Math.min(1, f.life / (f.max * 0.4));
      ctx.font = f.sz + "px 'Bagel Fat One', sans-serif";
      ctx.strokeText(f.txt, f.x, f.y); ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, f.y);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
    ctx.restore();
  }

  /* ───────── 입력 ───────── */
  function onTap() {
    if (ui.dlg || !S) return;
    AU.unlock();
    const r = E.doTap(S, false);
    ui.btnPress = 0.09;
    ui.monHit = 0.08;
    ui.tapCount++;
    const G = geom();
    const x = G.mx + (Math.random() - 0.5) * 70, y = G.gy - 40 + (Math.random() - 0.5) * 30;
    if (r.crit) { addFloat(x, y, fmt(r.dmg) + '!', '#ffcf4a', 21, 1); ui.shake = Math.max(ui.shake, 0.08); }
    else addFloat(x, y, fmt(r.dmg), '#ffffff', 15, 0.8);
    if (ui.tapCount % 4 === 0) {
      const ex = E.killExp(S.zone) * BAL.tapExpFrac * E.derive(S).expMult;
      addFloat(G.hx + (Math.random() - 0.5) * 20, G.gy - 90, '+' + fmt(ex) + ' EXP', '#5fe3f0', 11, 0.9);
    }
    AU.tap(r.crit);
    if (r.crit) vibrate(8);
    ui.afterTap = true;
  }

  function bindGlobal() {
    const bt = $('battle');
    bt.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('button')) return;
      ev.preventDefault();
      onTap();
    });
    bt.addEventListener('contextmenu', (ev) => ev.preventDefault());
    window.addEventListener('keydown', (ev) => {
      if (ui.dlg) { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); dlgAdvance(); } return; }
      if (!$('modal').hidden) return;
      if (ev.key === ' ' || ev.key === 'Enter') { if (document.activeElement && document.activeElement.tagName === 'BUTTON') return; ev.preventDefault(); onTap(); }
    });
    $('zPrev').addEventListener('click', () => { AU.click(); E.setZone(S, S.zone - 1); S.autoAdvance = false; updateHud(); });
    $('zNext').addEventListener('click', () => { AU.click(); E.setZone(S, S.zone + 1); updateHud(); });
    $('zAuto').addEventListener('click', () => {
      AU.click();
      if (S.autoAdvance) S.autoAdvance = false;
      else { S.autoAdvance = true; if (S.zone < S.maxZone) E.setZone(S, S.maxZone); }
      updateHud();
    });
    $('tabs').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-tab]');
      if (!b) return;
      AU.click();
      setTab(b.dataset.tab);
    });
    $('panel').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]');
      if (!b || b.disabled) return;
      act(b.dataset.act, b.dataset.arg, b);
    });
    $('mbox').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-act]');
      if (!b || b.disabled) return;
      act(b.dataset.act, b.dataset.arg, b);
    });
    $('skillBar').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-sk]');
      if (!b) return;
      AU.unlock();
      if (b.dataset.sk === '*') { for (const sk of SKILLS) E.useSkill(S, sk.id); }
      else E.useSkill(S, b.dataset.sk);
    });
    $('dlg').addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('#dlgSkip')) return;
      ev.preventDefault();
      dlgAdvance();
    });
    $('dlgSkip').addEventListener('click', () => dlgSkip());
    window.addEventListener('resize', () => { resize(); });
  }

  /* ───────── HUD ───────── */
  function expInfo() {
    const lv = S.level;
    if (lv < 1e12) {
      const a = E.expForLevel(lv), b = E.expForLevel(lv + 1);
      const f = Math.max(0, Math.min(1, (S.exp - a) / (b - a)));
      return { f, txt: 'EXP ' + fmt(Math.max(0, S.exp - a)) + ' / ' + fmt(b - a) + ' · ' + Math.floor(f * 100) + '%' };
    }
    const lg = Math.log10(S.exp);
    return { f: lg - Math.floor(lg), txt: 'EXP ' + fmt(S.exp) + ' · 초고속 성장 중' };
  }
  function updateHud() {
    const d = E.derive(S);
    setT($('hudLv'), fmtInt(S.level));
    setT($('hudName'), S.name + ' · ' + E.levelTitle(S.level));
    setT($('hudCls'), E.className(S));
    const ei = expInfo();
    const eb = $('expBar');
    eb.firstElementChild.style.width = (ei.f * 100).toFixed(2) + '%';
    setT(eb.lastElementChild, ei.txt);
    setT($('hudGold'), fmt(S.gold));
    $('hudFragChip').hidden = !(S.fragsTotal > 0);
    setT($('hudFrag'), fmt(S.frags));
    setT($('hudDps'), fmt(d.compDps + d.avgTap * d.autoTaps));
    const spc = $('hudSp');
    spc.hidden = !(S.sp >= 1 && !S.autoAlloc);
    if (!spc.hidden) setT(spc.lastElementChild, fmt(Math.floor(S.sp)));
    // 구역
    const z = S.zone;
    let lbl;
    if (E.isFinal(z)) lbl = '<b>∞ 천장 너머</b><small>오버플로우를 일으켜라</small>';
    else {
      const town = TOWNS[E.townOf(z)];
      let sub;
      if (S.bf && S.enemy && S.enemy.kind >= 1) sub = (S.enemy.kind === 2 ? '마을 보스' : '우두머리') + ' · ' + Math.max(0, S.bf.time).toFixed(1) + '초';
      else if (z >= S.maxZone) sub = '처치 ' + S.kills + '/' + BAL.killsPerZone + (E.isBossZone(z + 1) ? ' · 다음: 보스' : '');
      else sub = '돌파한 구역 · 최고 ' + E.zoneLabel(S.maxZone);
      lbl = '<b>' + E.zoneLabel(z) + ' ' + esc(town.field) + '</b><small>' + sub + '</small>';
    }
    setH($('zoneLbl'), lbl);
    const za = $('zAuto');
    za.className = S.autoAdvance ? 'on' : (S.maxZone > S.zone ? 'retry' : '');
    setT(za, S.autoAdvance ? '자동 ON' : (S.maxZone > S.zone ? '재도전' : '자동 OFF'));
    $('zPrev').disabled = S.zone <= 1;
    $('zNext').disabled = S.zone >= S.maxZone;
    updateSkillBar();
    updateTabDots(d);
  }
  function renderSkillBar() {
    const bar = $('skillBar');
    const list = SKILLS.filter((sk) => E.skillUnlocked(S, sk));
    const key = list.map((s) => s.id).join(',');
    if (bar._k === key) return;
    bar._k = key;
    let h = '';
    if (list.length >= 3) h += '<button class="skill all" type="button" data-sk="*" aria-label="모든 스킬 사용">ALL</button>';
    for (const sk of list) h += '<button class="skill" type="button" data-sk="' + sk.id + '" title="' + esc(sk.name + ': ' + sk.desc) + '" aria-label="' + esc(sk.name) + '">' + sk.icon + '<i class="cd"></i><span class="t"></span></button>';
    bar.innerHTML = h;
  }
  function updateSkillBar() {
    renderSkillBar();
    for (const b of $('skillBar').querySelectorAll('[data-sk]')) {
      const id = b.dataset.sk;
      if (id === '*') continue;
      const sk = SKILLS.find((x) => x.id === id);
      const k = S.sk[id] || { until: 0, cd: 0 };
      const on = k.until > S.t;
      const cdLeft = Math.max(0, k.cd - S.t);
      b.classList.toggle('active', on);
      b.querySelector('.cd').style.height = on ? '0%' : (cdLeft > 0 ? (cdLeft / E.skillCd(S, sk) * 100).toFixed(0) + '%' : '0%');
      setT(b.querySelector('.t'), on ? Math.ceil(k.until - S.t) + '' : cdLeft > 0 ? Math.ceil(cdLeft) + '' : '');
    }
  }
  function updateTabDots(d) {
    const dots = {
      stats: S.sp >= 1 && !S.autoAlloc,
      class: CLASSES.some((c, i) => E.canPromote(S, i).ok),
      allies: COMPANIONS.some((c, i) => E.compUnlocked(S, i) && !(S.comps[c.id] > 0)),
      rebirth: E.rebirthUnlocked(S) && E.fragGain(S) >= Math.max(1, S.fragsTotal),
    };
    for (const b of $('tabs').children) {
      const on = !!dots[b.dataset.tab];
      let dot = b.querySelector('.dot');
      if (on && !dot) { dot = document.createElement('i'); dot.className = 'dot'; b.appendChild(dot); }
      else if (!on && dot) dot.remove();
    }
  }

  /* ───────── 탭 렌더 ───────── */
  function setTab(t) {
    ui.tab = t;
    for (const b of $('tabs').children) b.classList.toggle('on', b.dataset.tab === t);
    renderPanel(true);
  }
  function renderPanel(resetScroll) {
    BINDS = {};
    const p = $('panel');
    const sc = p.scrollTop;
    p.innerHTML = RENDER[ui.tab]();
    if (resetScroll) p.scrollTop = 0; else p.scrollTop = sc;
    if (ui.tab === 'town') drawTownHero();
    updateBinds();
  }

  function buySeg() {
    const opts = [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'MAX']];
    return '<div class="seg">' + opts.map(([v, l]) => '<button type="button" data-act="buyN" data-arg="' + v + '" class="' + (String(ui.buyN) === String(v) ? 'on' : '') + '">' + l + '</button>').join('') + '</div>';
  }
  function buyCount(type, i) {
    if (ui.buyN === 'max') {
      const k = type === 'e' ? E.eqMaxAfford(S, i) : E.compMaxAfford(S, i);
      return Math.max(1, k);
    }
    return ui.buyN;
  }
  function buyBtn(el, type, i) {
    const k = buyCount(type, i);
    const lv = type === 'e' ? S.equip[EQUIP[i].id] : (S.comps[COMPANIONS[i].id] || 0);
    const cost = type === 'e' ? E.eqCost(i, lv, k) : E.compCost(i, lv, k);
    const lock = type === 'c' && !E.compUnlocked(S, i);
    setH(el, '+' + k + '<span class="sub">● ' + fmt(cost) + '</span>');
    el.disabled = lock || cost > S.gold;
  }

  const RENDER = {};

  /* 능력 */
  RENDER.stats = function () {
    let h = '<div class="card"><div class="row">' +
      '<img class="pix" data-act="portrait" src="' + SP.portraitURL('zero', 4) + '" width="72" height="72" alt="제로의 초상화">' +
      '<div class="grow"><div class="small" ' + bind('st-title', (el) => setT(el, E.levelTitle(S.level))) + '></div>' +
      '<div class="lvbig" ' + bind('st-lv', (el) => setT(el, 'Lv.' + fmtInt(S.level))) + '></div>' +
      '<div class="small" ' + bind('st-cls', (el) => setT(el, E.className(S))) + '></div></div></div>' +
      '<div class="bar" style="margin-top:8px" ' + bind('st-exp', (el) => { const ei = expInfo(); el.firstElementChild.style.width = (ei.f * 100).toFixed(2) + '%'; setT(el.lastElementChild, ei.txt); }) + '><i></i><span></span></div></div>';
    h += '<h3>스탯 포인트</h3><div class="card">' +
      '<div class="row"><div class="grow">남은 포인트 <b class="c-cyan num" ' + bind('st-sp', (el) => setT(el, fmt(Math.floor(S.sp)))) + '></b>' +
      '<div class="tiny" ' + bind('st-spl', (el) => setT(el, '레벨당 ' + fmt(E.derive(S).spPer) + ' 포인트')) + '></div></div>' +
      '<button type="button" class="btn sm ' + (S.autoAlloc ? 'mint' : 'ghost') + '" data-act="autoAlloc">자동 분배 ' + (S.autoAlloc ? 'ON' : 'OFF') + '</button></div>' +
      (S.autoAlloc ? '<div class="tiny" style="margin-top:4px">비율대로 자동으로 나눕니다. 숫자가 클수록 더 많이 투자해요.</div>' : '') + '<div style="margin-top:4px">';
    for (const k of E.STAT_KEYS) {
      const [nm, en] = STAT_INFO[k];
      h += '<div class="stat-row"><div class="sn">' + nm + '<small>' + en + '</small></div>' +
        '<div><b class="num" ' + bind('sv-' + k, (el) => setT(el, fmt(Math.floor(S.stats[k])))) + '></b>' +
        '<div class="tiny" ' + bind('se-' + k, (el) => setT(el, statEffect(k))) + '></div></div><div>';
      if (S.autoAlloc) {
        h += '<span class="stepper"><button type="button" class="btn sm ghost" data-act="ratio" data-arg="' + k + ':-1" aria-label="' + nm + ' 비율 낮추기">−</button>' +
          '<b>' + S.ratio[k] + '</b><button type="button" class="btn sm ghost" data-act="ratio" data-arg="' + k + ':1" aria-label="' + nm + ' 비율 높이기">+</button></span>';
      } else {
        h += '<span class="stepper"><button type="button" class="btn sm" data-act="alloc" data-arg="' + k + ':0.1" ' + bind('sa1-' + k, (el) => { el.disabled = S.sp < 1; }) + '>10%</button>' +
          '<button type="button" class="btn sm" data-act="alloc" data-arg="' + k + ':1" ' + bind('sa2-' + k, (el) => { el.disabled = S.sp < 1; }) + '>MAX</button></span>';
      }
      h += '</div></div>';
    }
    h += '</div><div class="row" style="margin-top:8px"><button type="button" class="btn sm ghost" data-act="resetStats">스탯 초기화 (무료)</button><span class="tiny">분배한 포인트를 전부 돌려받아요</span></div></div>';
    h += '<h3>전투 능력</h3><div class="card kv" ' + bind('st-kv', (el) => setH(el, kvHTML())) + '></div>';
    h += '<h3>스탯 가이드</h3><div class="card small">힘은 공격력, 체력은 보스의 공격을 버티는 힘입니다. 보스는 1.5초마다 공격하니 체력이 너무 낮으면 쓰러져요. 민첩은 치명타, 지능은 경험치와 동료 피해, 행운은 골드를 늘립니다.</div>';
    return h;
  };
  function statEffect(k) {
    const st = S.stats, d = E.derive(S);
    if (k === 'str') return '공격력 기본값 +' + fmt(3 * st.str);
    if (k === 'vit') return '체력 기본값 +' + fmt(25 * st.vit);
    if (k === 'agi') return '치명타 ' + pct(d.critChance) + ' · 피해 ×' + d.critMult.toFixed(1);
    if (k === 'int') return '경험치 ' + fmtMult(Math.pow(1 + st.int, BAL.intExp)) + ' · 동료 ' + fmtMult(Math.pow(1 + st.int, BAL.intComp));
    return '골드 ' + fmtMult(Math.pow(1 + st.luk, BAL.lukGold));
  }
  function kvHTML() {
    const d = E.derive(S);
    const rows = [
      ['공격력', fmt(d.atk)], ['탭 1회 피해 (평균)', fmt(d.avgTap)], ['치명타', pct(d.critChance) + ' · ×' + d.critMult.toFixed(1)],
      ['최대 체력', fmt(d.hp)], ['동료 초당 피해', fmt(d.compDps)], ['자동 탭', d.autoTaps + '회/초'],
      ['경험치 배율', fmtMult(d.expMult)], ['골드 배율', fmtMult(d.goldMult)],
      ['탭당 경험치', fmt(E.killExp(S.zone) * BAL.tapExpFrac * d.expMult)], ['유물 배율', fmtMult(E.relicMult(S))],
      ['업적 보너스', fmtMult(Math.pow(1.03, E.achCount(S)))],
    ];
    return rows.map(([a, b]) => '<span>' + a + '</span><span>' + b + '</span>').join('');
  }

  /* 장비 */
  RENDER.equip = function () {
    let h = '<div class="row" style="justify-content:space-between;flex-wrap:wrap"><h2>모루의 대장간</h2>' + buySeg() + '</div>';
    if (E.fu(S, 'f_autobuy') > 0) h += '<div class="card row" style="margin-bottom:8px"><div class="grow small">자동 구매: 가장 싼 장비·동료부터 자동 강화</div><button type="button" class="btn sm ' + (S.autoBuy ? 'mint' : 'ghost') + '" data-act="autoBuy">' + (S.autoBuy ? 'ON' : 'OFF') + '</button></div>';
    h += '<div class="stack">';
    EQUIP.forEach((e, i) => {
      h += '<div class="card item"><div class="ico">' + EQ_ICON[i] + '</div><div class="grow">' +
        '<div class="name" ' + bind('eqn' + i, (el) => setT(el, E.eqName(i, S.equip[e.id]))) + '></div>' +
        '<div class="meta" ' + bind('eqm' + i, (el) => setT(el, 'Lv.' + S.equip[e.id] + ' · ' + EQ_STAT[i] + ' ' + fmtMult(E.eqMult(S.equip[e.id], e)))) + '></div>' +
        '<div class="tiny" ' + bind('eqx' + i, (el) => { const lv = S.equip[e.id]; const nx = (Math.floor(lv / e.ms) + 1) * e.ms; setT(el, nx + '강 달성 시 ×' + e.msm + ' (남은 ' + (nx - lv) + ')'); }) + '></div>' +
        '</div><div class="buy"><button type="button" class="btn gold" data-act="buyEq" data-arg="' + i + '" ' + bind('eqb' + i, (el) => buyBtn(el, 'e', i)) + '></button></div></div>';
    });
    h += '</div><p class="tiny" style="margin-top:10px">무기와 갑옷은 25강마다, 반지와 목걸이는 100강마다 효과가 2배가 됩니다. 이름이 바뀌는 순간을 놓치지 마세요.</p>';
    return h;
  };

  /* 동료 */
  RENDER.allies = function () {
    let h = '<div class="row" style="justify-content:space-between;flex-wrap:wrap"><h2>동료</h2>' + buySeg() + '</div>' +
      '<div class="card small" style="margin-bottom:8px">동료는 자동으로 싸웁니다. 동료가 강할수록 탭 1회 피해도 커져요. 초당 피해 <b class="c-dps num" ' + bind('al-dps', (el) => setT(el, fmt(E.derive(S).compDps))) + '></b></div><div class="stack">';
    COMPANIONS.forEach((c, i) => {
      const un = E.compUnlocked(S, i);
      h += '<div class="card item"><div class="ico' + (un ? '' : ' locked') + '"><img alt="" src="' + SP.portraitURL(c.portrait, 3) + '"></div><div class="grow">' +
        '<div class="name">' + (un ? esc(c.name) + ' <span class="tiny">' + esc(c.title) + '</span>' : '???') + '</div>' +
        '<div class="meta" ' + bind('alm' + i, (el) => {
          if (!E.compUnlocked(S, i)) return setT(el, E.zoneLabel(c.unlock) + ' 구역을 돌파하면 합류');
          const lv = S.comps[c.id] || 0;
          const d = E.derive(S);
          let tot = 0; COMPANIONS.forEach((cc, j) => { tot += E.compFactorOf(j, S.comps[cc.id] || 0); });
          const share = tot > 0 ? E.compFactorOf(i, lv) / tot * d.compDps : 0;
          setT(el, 'Lv.' + lv + ' · 초당 ' + fmt(share) + ' · ' + BAL.compMs + '레벨마다 ×2');
        }) + '></div>' +
        (un ? '<div class="tiny">「' + esc(c.line) + '」</div>' : '') +
        '</div><div class="buy"><button type="button" class="btn gold" data-act="buyComp" data-arg="' + i + '" ' + bind('alb' + i, (el) => buyBtn(el, 'c', i)) + '></button></div></div>';
    });
    return h + '</div>';
  };

  /* 전직 */
  function curLine() { for (let i = 0; i < CLASSES.length; i++) if ((S.cls[CLASSES[i].id] || 0) < CLASSES[i].tiers) return i; return -1; }
  function colorOfLine(id) { return Object.keys(ORB_COLORS).find((k) => ORB_COLORS[k].line === id); }
  RENDER.class = function () {
    const cm = E.classMults(S);
    const cc = E.curClass(S);
    let h = '<h2>전직</h2><div class="card"><div class="row"><div class="grow"><div class="small">현재 직업</div>' +
      '<div style="font-family:var(--display);font-size:22px;color:' + (cc ? cc.color : '#fff') + '">' + esc(E.className(S)) + '</div>' +
      '<div class="tiny">' + esc(cc ? cc.desc : '아직 아무것도 아니다. 하지만 캡이 없다.') + '</div></div></div>' +
      '<div class="kv" style="margin-top:8px"><span>전직 공격력·체력</span><span>' + fmtMult(cm.m) + '</span><span>전직 경험치</span><span>' + fmtMult(cm.e) + '</span><span>전직 골드</span><span>' + fmtMult(cm.g) + '</span></div></div>';
    const li = curLine();
    if (li < 0) h += '<h3>다음 전직</h3><div class="card">모든 전직을 마쳤다. 더 이상 이름 붙일 수 있는 직업이 없다.</div>';
    else {
      const c = CLASSES[li];
      const t = (S.cls[c.id] || 0) + 1;
      h += '<h3>다음 전직</h3>';
      if (!E.lineUnlocked(S, li)) {
        const col = colorOfLine(c.id);
        const found = ORBS.filter((o) => o.c === col && S.orbs[o.id]);
        h += '<div class="card"><div style="font-weight:700;color:' + c.color + '">🔒 ' + esc(c.name) + ' 계열</div>' +
          '<div class="small" style="margin:4px 0 8px">' + esc(c.desc) + '<br>비밀번호가 필요합니다. <b style="color:' + ORB_COLORS[col].color + '">' + ORB_COLORS[col].name + '</b> 4개의 숫자를 모두 더하세요. (' + found.length + '/4 발견)</div>' +
          '<button type="button" class="btn gold wide" data-act="pw" data-arg="' + c.id + '">비밀번호 입력</button></div>';
      } else {
        const bon = E.tierBonus(c, t);
        h += '<div class="card"><div class="row"><div class="grow"><div style="font-weight:700;color:' + c.color + '">' + esc(c.name) + ' ' + (t - 1) + '차 → ' + t + '차' + (c.tierNames[t] ? ' · ' + esc(c.tierNames[t]) : '') + '</div>' +
          '<div class="small">공격력·체력 ' + fmtMult(bon.m) + ' · 경험치 ' + fmtMult(bon.e) + ' · 골드 ' + fmtMult(bon.g) +
          (c.id === 'c1' ? ' · 레벨당 SP ×1.25' : c.id === 'c2' ? ' · 레벨당 SP ×1.12' : '') + '</div></div></div>' +
          '<div class="req" style="margin:8px 0" ' + bind('cls-req', (el) => setH(el, reqHTML(li))) + '></div>' +
          '<div class="row"><button type="button" class="btn gold grow" data-act="promote" data-arg="' + li + '" ' + bind('cls-btn', (el) => { el.disabled = !E.canPromote(S, li).ok; }) + '>전직하기</button>' +
          '<button type="button" class="btn" data-act="promoteMax" ' + bind('cls-btn2', (el) => { el.disabled = !E.canPromote(S, li).ok; }) + '>가능한 만큼</button></div></div>';
      }
    }
    h += '<h3>전직 계열</h3><div class="stack">';
    CLASSES.forEach((c, i) => {
      const t = S.cls[c.id] || 0;
      let st;
      if (t >= c.tiers) st = '<span class="pill" style="color:var(--mint)">완료</span>';
      else if (!E.lineAvailable(S, i)) st = '<span class="pill" style="color:var(--dim)">이전 계열 필요</span>';
      else if (!E.lineUnlocked(S, i)) st = '<span class="pill" style="color:var(--red)">비밀번호</span>';
      else st = '<span class="pill" style="color:var(--gold)">진행 중</span>';
      h += '<div class="card"><div class="row"><div class="grow"><b style="color:' + c.color + '">' + esc(c.name) + '</b> <span class="tiny">' + t + '/' + c.tiers + '차 · 구역 ' + E.zoneLabel(c.z[0]) + '~' + E.zoneLabel(c.z[1]) + '</span></div>' + st + '</div>' +
        '<div class="prog" style="margin-top:6px"><i style="width:' + (t / c.tiers * 100) + '%;background:' + c.color + '"></i></div></div>';
    });
    h += '</div><h3>스킬</h3><div class="stack">';
    for (const sk of SKILLS) {
      const un = E.skillUnlocked(S, sk);
      const rc = CLASSES.find((c) => c.id === sk.req[0]);
      h += '<div class="card row"><div class="ico">' + (un ? sk.icon : '🔒') + '</div><div class="grow"><b>' + esc(sk.name) + '</b><div class="small">' + esc(sk.desc) + ' · 재사용 ' + Math.round(E.skillCd(S, sk)) + '초</div>' +
        (un ? '' : '<div class="tiny">' + esc(rc.name) + ' ' + sk.req[1] + '차에 해금</div>') + '</div></div>';
    }
    h += '</div><h3>구슬 가방</h3><div class="small" style="margin-bottom:6px">같은 색 구슬의 숫자를 모두 더하면 그 계열의 비밀번호가 됩니다. 모르는 구슬은 눌러서 힌트를 보세요.</div><div class="orbgrid">';
    for (const col in ORB_COLORS) {
      const oc = ORB_COLORS[col];
      const line = CLASSES.find((c) => c.id === oc.line);
      h += '<div class="card"><b style="color:' + oc.color + '">' + oc.name + '</b> <span class="tiny">→ ' + esc(line.name) + '</span><div class="orbs">';
      for (const o of ORBS.filter((x) => x.c === col)) {
        if (S.orbs[o.id]) h += '<div class="orb" style="background:' + oc.color + '" title="' + esc(o.where) + '">' + o.v + '</div>';
        else h += '<div class="orb unk" data-act="orbHint" data-arg="' + o.id + '">?</div>';
      }
      h += '</div><div class="tiny" style="margin-top:4px">' + ORBS.filter((x) => x.c === col && !S.orbs[x.id] && ui.hintShown[x.id]).map((x) => '· ' + esc(x.hint)).join('<br>') + '</div></div>';
    }
    h += '<div class="card"><b class="c-muted">빈 칸</b><div class="orbs"><div class="orb empty" data-act="bagEmpty" aria-label="빈 칸"></div></div><div class="tiny">아무것도 없다… 아마도.</div></div>';
    return h + '</div>';
  };
  function reqHTML(li) {
    const c = CLASSES[li];
    const t = (S.cls[c.id] || 0) + 1;
    const r = E.tierReq(c, t);
    const zone = Math.max(1, Math.floor(E.tierZone(c, t)));
    const ok = (b) => (b ? '<span class="ok">✓</span>' : '<span class="no">✗</span>');
    return '<div>' + ok(S.bestZone >= zone) + ' 최고 도달 구역 ' + E.zoneLabel(zone) + ' <span class="tiny">(현재 ' + E.zoneLabel(S.bestZone) + ')</span></div>' +
      '<div>' + ok(S.level >= r.lv) + ' 레벨 ' + fmtInt(r.lv) + '</div>' +
      '<div>' + ok(S.gold >= r.gold) + ' 골드 ' + fmt(r.gold) + ' <span class="tiny">(소모)</span></div>';
  }

  /* 마을 */
  function townUnlocked(t) { return S.bestZone >= t * BAL.zonesPerTown + 1; }
  RENDER.town = function () {
    let maxT = 0;
    for (let t = 0; t < TOWNS.length; t++) if (townUnlocked(t)) maxT = t;
    ui.townSel = Math.max(0, Math.min(ui.townSel, maxT));
    const t = ui.townSel, town = TOWNS[t];
    let h = '<div class="townchips">';
    for (let i = 0; i <= maxT; i++) h += '<button type="button" class="btn sm ' + (i === t ? 'gold' : 'ghost') + '" data-act="town" data-arg="' + i + '">' + esc(TOWNS[i].name) + '</button>';
    if (maxT < TOWNS.length - 1) h += '<button type="button" class="btn sm ghost" disabled>???</button>';
    h += '</div><div class="town-hero" style="margin-top:8px"><canvas id="townCv" width="320" height="110"></canvas><div class="cap"><span class="tiny" style="color:#fff">제' + (t + 1) + '장 · ' + esc(town.sub) + '</span><b>' + esc(town.name) + '</b></div></div>' +
      '<p class="small">' + esc(town.desc) + '</p>';
    const z0 = t * BAL.zonesPerTown + 1;
    const can = S.maxZone >= z0;
    h += '<button type="button" class="btn wide ' + (can ? '' : 'ghost') + '" data-act="goTown" data-arg="' + t + '" ' + (can ? '' : 'disabled') + '>⚔ ' + esc(town.field) + '(으)로 이동' +
      '<span class="sub">' + (can ? '구역 ' + E.zoneLabel(z0) + ' ~ ' + E.zoneLabel(Math.min(S.maxZone, z0 + BAL.zonesPerTown - 1)) : '이번 생에서는 아직 도달하지 못했어요') + '</span></button>';
    if (S.relics[t]) h += '<div class="card" style="margin-top:8px"><span class="c-gold">★ 유물</span> ' + esc(STY.RELICS[t]) + ' <span class="tiny">공격력·체력 ' + fmtMult(N.pow10(E.relicLog(t))) + '</span></div>';
    // NPC
    const npcs = (STY.NPCS[t] || []).filter((n) => n.cond !== 'clear' || S.relics[t]);
    if (npcs.length) {
      h += '<h3>주민</h3><div class="stack">';
      npcs.forEach((n) => {
        const ch = STY.CHARS[n.id];
        const key = t + ':' + n.id;
        h += '<div class="card npc"><img class="pix" src="' + SP.portraitURL(n.id, 3) + '" width="48" height="48" alt="">' +
          '<div><div class="row"><b class="grow" style="color:' + ch.color + '">' + esc(ch.name) + '</b><button type="button" class="btn sm" data-act="talk" data-arg="' + t + '|' + n.id + '">대화</button></div>' +
          '<div class="bubble">' + esc(ui.npcSay[key] || '…') + '</div></div></div>';
      });
      h += '</div>';
    }
    // 탐색
    h += '<h3>탐색</h3><div class="spots">';
    (STY.SPOTS[t] || []).forEach((sp, i) => {
      const done = S.spots[t + ':' + sp.id];
      h += '<button type="button" class="spot' + (done ? ' done' : '') + '" data-act="spot" data-arg="' + t + '|' + i + '"><b>' + (done ? '✓ ' : '🔍 ') + esc(sp.name) + '</b><span class="tiny">' + (done ? '다시 보기' : '살펴보기') + '</span></button>';
    });
    h += '</div>' + (ui.spotSay[t] ? '<div class="bubble" style="margin-top:6px">' + esc(ui.spotSay[t]) + '</div>' : '');
    if (t === 4) h += casinoHTML();
    return h;
  };
  function drawTownHero() {
    const c = $('townCv');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.width = Math.max(200, Math.round(r.width)); c.height = 110;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const t = ui.townSel;
    g.drawImage(makeBG(t, c.width, 150), 0, -30);
    const npc = (STY.NPCS[t] || [])[0];
    const pid = S.relics[t] ? BOSS_P[t] : (npc ? npc.id : 'zero');
    const img = SP.portrait(pid, 4);
    g.drawImage(img, c.width - img.width - 10, c.height - img.height + 6);
  }
  function casinoHTML() {
    return '<h3>도박선 올인호</h3><div class="card" style="text-align:center"><div class="row" style="justify-content:center"><img class="pix" src="' + SP.portraitURL('lucky', 2) + '" width="36" height="36" alt=""><span class="small">「인생은 한 방! 7이 세 개면 잭팟이에요~」</span></div>' +
      '<div class="slot" id="slotReels"><div>' + ui.slot[0] + '</div><div>' + ui.slot[1] + '</div><div>' + ui.slot[2] + '</div></div>' +
      '<div class="small" id="slotMsg" style="min-height:20px">' + esc(ui.slotMsg || '골드를 걸어 보세요') + '</div>' +
      '<div class="row" style="justify-content:center;margin-top:6px"><button type="button" class="btn" data-act="slot" data-arg="0.1" ' + bind('slot1', (el) => { el.disabled = S.gold < 10; }) + '>10% 걸기</button>' +
      '<button type="button" class="btn red" data-act="slot" data-arg="0.5" ' + bind('slot2', (el) => { el.disabled = S.gold < 10; }) + '>50% 걸기</button></div>' +
      '<div class="tiny" style="margin-top:6px">7️⃣7️⃣7️⃣ ×20 · 같은 그림 셋 ×5 · 둘 ×2</div></div>';
  }

  /* 환생 */
  RENDER.rebirth = function () {
    let h = '<h2>환생 · 기억의 제단</h2>';
    if (!E.rebirthUnlocked(S)) {
      return h + '<div class="card">🔒 제로빌의 보스 「슬라임 왕 말랑킹」을 쓰러뜨리면 버튼을 「길게」 누를 수 있게 됩니다.<div class="tiny" style="margin-top:6px">환생하면 레벨 1로 돌아가지만, 기억 조각을 얻어 영구적으로 강해집니다.</div></div>';
    }
    h += '<div class="card"><div class="row"><img class="pix" src="' + SP.portraitURL('button', 3) + '" width="54" height="54" alt=""><div class="grow small">「길게 누르면 리셋. 레벨은 사라져도, 기억은 남아.」</div></div>' +
      '<div class="kv" style="margin-top:8px" ' + bind('rb-kv', (el) => setH(el, '<span>보유 기억 조각</span><span class="c-frag">◆ ' + fmt(S.frags) + '</span>' +
        '<span>누적 기억 조각</span><span>◆ ' + fmt(S.fragsTotal) + '</span>' +
        '<span>누적 보너스 (공격력·체력)</span><span>' + fmtMult(1 + BAL.fragPassive * S.fragsTotal) + '</span>' +
        '<span>이번 생 최고 구역</span><span>' + E.zoneLabel(S.maxZone) + '</span>' +
        '<span>환생 횟수</span><span>' + S.rebirths + '회</span>')) + '></div>' +
      '<button type="button" class="btn red wide" style="margin-top:10px" data-act="rebirth" ' + bind('rb-btn', (el) => {
        const g = E.fragGain(S);
        setH(el, '환생하기<span class="sub">' + (g >= 1 ? '◆ +' + fmt(g) + ' 획득' : E.zoneLabel(BAL.rebirthZone + 2) + ' 구역 이상 도달 필요') + '</span>');
        el.disabled = g < 1;
      }) + '></button>' +
      '<div class="tiny" style="margin-top:6px">초기화: 레벨·스탯·골드·장비·동료 레벨·구역 진행 / 유지: 전직·유물·구슬·업적·기억 조각·이야기</div></div>';
    h += '<h3>영구 강화</h3><div class="stack">';
    for (const u of FRAG_UPG) {
      h += '<div class="card item"><div class="ico">◆</div><div class="grow"><div class="name">' + esc(u.name) + '</div><div class="meta">' + esc(u.desc) + '</div>' +
        '<div class="tiny" ' + bind('fu-' + u.id, (el) => { const lv = E.fu(S, u.id); setT(el, 'Lv.' + lv + (u.max ? ' / ' + u.max : '') + ' · ' + fragEffect(u, lv)); }) + '></div></div>' +
        '<div class="buy"><button type="button" class="btn" data-act="buyFrag" data-arg="' + u.id + '" ' + bind('fb-' + u.id, (el) => {
          const lv = E.fu(S, u.id);
          if (u.max && lv >= u.max) { setH(el, 'MAX'); el.disabled = true; return; }
          const c = E.fragCost(u, lv);
          setH(el, '강화<span class="sub">◆ ' + fmt(c) + '</span>');
          el.disabled = S.frags < c;
        }) + '></button></div></div>';
    }
    return h + '</div>';
  };
  function fragEffect(u, lv) {
    switch (u.id) {
      case 'f_atk': case 'f_hp': case 'f_exp': return '현재 ' + fmtMult(Math.pow(2, lv));
      case 'f_gold': case 'f_comp': return '현재 ' + fmtMult(Math.pow(3, lv));
      case 'f_sp': return '현재 ' + fmtMult(Math.pow(1.5, lv));
      case 'f_warp': return '시작 구역 ' + E.zoneLabel(E.warpZone(S));
      case 'f_auto': return '초당 ' + lv + '회';
      case 'f_time': return '+' + lv * 3 + '초';
      case 'f_skill': return '-' + lv * 6 + '%';
      case 'f_off': return '최대 ' + (2 + lv) + '시간';
      case 'f_autobuy': return lv ? '해금됨 ([장비] 탭)' : '미해금';
    }
    return '';
  }

  /* 더보기 */
  RENDER.more = function () {
    const subs = [['ach', '업적'], ['codex', '도감'], ['chars', '인물'], ['relic', '유물'], ['story', '이야기'], ['stat', '통계'], ['set', '설정']];
    let h = '<div class="subtabs">' + subs.map(([k, l]) => '<button type="button" class="btn sm ' + (ui.sub === k ? 'gold' : 'ghost') + '" data-act="sub" data-arg="' + k + '">' + l + '</button>').join('') + '</div>';
    return h + (SUB[ui.sub] || SUB.ach)();
  };
  const SUB = {};
  SUB.ach = function () {
    const n = E.achCount(S);
    let h = '<div class="small" style="margin-bottom:8px">달성 ' + n + ' / ' + ACH.length + ' · 업적 하나마다 공격력·경험치·골드 ×1.03 (현재 ' + fmtMult(Math.pow(1.03, n)) + ')</div><div class="achgrid">';
    for (const a of ACH) h += '<div class="ach' + (S.ach[a.id] ? ' done' : '') + '"><b>' + (S.ach[a.id] ? '★ ' : '') + esc(a.name) + '</b>' + esc(a.desc) + '</div>';
    return h + '</div>';
  };
  SUB.codex = function () {
    let h = '';
    for (let t = 0; t < TOWNS.length; t++) {
      if (!townUnlocked(t)) break;
      const town = TOWNS[t];
      h += '<h3>' + (t + 1) + '. ' + esc(town.name) + ' — ' + esc(town.field) + '</h3><div class="stack">';
      town.mobs.forEach((m, mi) => {
        const k = S.codex[t + '_' + mi] || 0;
        h += '<div class="card item" style="grid-template-columns:auto 1fr"><div class="ico' + (k ? '' : ' locked') + '"><img alt="" src="' + mobURL(t, mi) + '"></div><div><div class="name">' + (k ? esc(m[0]) : '???') + '</div><div class="meta">' + (k ? esc(m[1]) : '아직 만나지 못했다.') + '</div>' + (k ? '<div class="tiny">처치 ' + fmt(k) + '</div>' : '') + '</div></div>';
      });
      const bk = S.codex['b' + t] || 0;
      h += '<div class="card item" style="grid-template-columns:auto 1fr"><div class="ico' + (bk ? '' : ' locked') + '"><img alt="" src="' + SP.portraitURL(BOSS_P[t], 3) + '"></div><div><div class="name c-gold">' + (bk ? esc(town.boss[0]) : '??? (보스)') + '</div><div class="meta">' + (bk ? esc(town.boss[1]) : '마을의 끝에서 기다린다.') + '</div></div></div></div>';
    }
    return h || '<div class="card">아직 기록이 없다.</div>';
  };
  function metChars() {
    const met = new Set(['zero', 'button']);
    for (const id in S.seen) { const sc = STY.SCENES[id]; if (sc) for (const l of sc.lines) met.add(l[0]); }
    met.delete('sys');
    return met;
  }
  SUB.chars = function () {
    const met = metChars();
    let h = '<div class="stack">';
    for (const id in STY.CHARS) {
      if (id === 'sys') continue;
      const c = STY.CHARS[id];
      const m = met.has(id);
      h += '<div class="card npc"><img class="pix' + (m ? '' : ' locked') + '" src="' + SP.portraitURL(id, 3) + '" width="48" height="48" alt=""><div><b style="color:' + (m ? c.color : 'var(--dim)') + '">' + (m ? esc(c.name) : '???') + '</b> <span class="tiny">' + (m ? esc(c.title || '') : '') + '</span><div class="small">' + (m ? esc(c.desc) : '아직 만나지 못한 인물.') + '</div></div></div>';
    }
    h += '</div><h3>설정집</h3><div class="stack">';
    let any = false;
    for (let t = 0; t < STY.SPOTS.length; t++) for (const sp of STY.SPOTS[t]) {
      if (sp.reward.lore && S.spots[t + ':' + sp.id]) { any = true; const l = STY.LORE[sp.reward.lore]; h += '<div class="card"><b>' + esc(l[0]) + '</b><div class="small">' + esc(l[1]) + '</div></div>'; }
    }
    return h + (any ? '' : '<div class="card small">마을을 탐색하면 세계의 비밀이 기록됩니다.</div>') + '</div>';
  };
  SUB.relic = function () {
    let h = '<div class="small" style="margin-bottom:8px">마을 보스를 처음 쓰러뜨리면 유물을 얻습니다. 유물은 환생해도 사라지지 않아요.</div><div class="stack">';
    for (let t = 0; t < TOWNS.length; t++) {
      const has = !!S.relics[t];
      h += '<div class="card row"><div class="ico' + (has ? '' : ' locked') + '"><img alt="" src="' + SP.portraitURL(BOSS_P[t], 3) + '"></div><div class="grow"><b class="' + (has ? 'c-gold' : 'c-muted') + '">' + (has ? esc(STY.RELICS[t]) : '???') + '</b><div class="small">' + (has ? '공격력·체력 ' + fmtMult(N.pow10(E.relicLog(t))) : esc(TOWNS[t].name) + '의 보스가 지니고 있다') + '</div></div></div>';
    }
    return h + '</div>';
  };
  SUB.story = function () {
    const ids = Object.keys(STY.SCENES).filter((id) => S.seen[id]);
    let h = '<div class="small" style="margin-bottom:8px">본 장면을 다시 볼 수 있습니다.</div><div class="stack">';
    for (const id of ids) {
      const sc = STY.SCENES[id];
      const first = sc.lines.find((l) => l[0] !== 'sys') || sc.lines[0];
      h += '<button type="button" class="spot" data-act="replay" data-arg="' + id + '"><b>' + esc(sceneTitle(id)) + '</b><span class="tiny">' + esc(first[1].slice(0, 38)) + '…</span></button>';
    }
    return h + '</div>';
  };
  function sceneTitle(id) {
    const m = /^t(\d+)_(\w+)$/.exec(id);
    if (m) { const t = +m[1]; return '제' + (t + 1) + '장 ' + TOWNS[t].name + ' · ' + ({ arrive: '도착', mid: '만남', boss: '보스', clear: '격파' }[m[2]] || m[2]); }
    return ({ prologue: '프롤로그', first_lv: '첫 레벨업', tip_stat: '튜토리얼: 스탯', tip_equip: '튜토리얼: 장비', tip_boss: '튜토리얼: 보스', tip_class: '튜토리얼: 전직', first_rebirth: '첫 환생', final: '종장: 천장', ending: '엔딩' }[id] || id);
  }
  SUB.stat = function () {
    const T = S.tot;
    const rows = [['플레이 시간', N.fmtTime(T.playTime)], ['탭 횟수', fmt(T.taps)], ['치명타', fmt(T.crits)], ['처치', fmt(T.kills)], ['보스 처치', fmt(T.bossKills)],
      ['보스 실패', fmt(T.fails)], ['최고 레벨', fmtInt(T.maxLevel)], ['최고 한 방 피해', fmt(T.maxDmg)], ['누적 골드', fmt(T.gold)], ['누적 경험치', fmt(T.exp)],
      ['최고 도달 구역', E.zoneLabel(S.bestZone)], ['환생', S.rebirths + '회'], ['발견한 구슬', Object.keys(S.orbs).length + ' / ' + ORBS.length], ['엔딩', S.flags.ending ? '달성 ∞' : '미달성']];
    return '<div class="card kv">' + rows.map(([a, b]) => '<span>' + a + '</span><span>' + b + '</span>').join('') + '</div>';
  };
  SUB.set = function () {
    const nt = S.settings.notation;
    const seg = [['kr', '만·억·조'], ['sci', '1.2e34'], ['en', 'K·M·B']].map(([k, l]) => '<button type="button" data-act="notation" data-arg="' + k + '" class="' + (nt === k ? 'on' : '') + '">' + l + '</button>').join('');
    const tog = (k, l) => '<div class="row"><span class="grow">' + l + '</span><button type="button" class="btn sm ' + (S.settings[k] ? 'mint' : 'ghost') + '" data-act="toggle" data-arg="' + k + '">' + (S.settings[k] ? 'ON' : 'OFF') + '</button></div>';
    return '<div class="card stack"><div class="row"><span class="grow">숫자 표기</span><div class="seg">' + seg + '</div></div>' +
      tog('sound', '효과음') + tog('vibrate', '진동 (치명타)') + tog('fx', '피해 숫자·파티클') + '</div>' +
      '<h3>저장</h3><div class="card stack"><div class="small">15초마다 이 브라우저에 자동 저장됩니다. 다른 기기로 옮기려면 저장 코드를 복사하세요.</div>' +
      '<div class="row"><button type="button" class="btn" data-act="saveNow">지금 저장</button><button type="button" class="btn" data-act="export">저장 코드 복사</button><button type="button" class="btn" data-act="import">불러오기</button></div>' +
      '<button type="button" class="btn ghost" data-act="reset">처음부터 다시 하기</button></div>' +
      '<h3>정보</h3><div class="card small"><b>무한 렙업: OVERFLOW</b><br>캡 없는 소년의 끝없는 레벨업 이야기.<br>모든 캐릭터·세계관·그림은 이 게임을 위해 새로 만든 오리지널입니다.<div class="tiny" style="margin-top:6px;cursor:pointer" data-act="ver">버전 1.0.0 · build ∞</div></div>';
  };

  /* ───────── 행동 ───────── */
  function act(a, arg, el) {
    AU.unlock();
    switch (a) {
      case 'autoAlloc': S.autoAlloc = !S.autoAlloc; AU.click(); renderPanel(); break;
      case 'ratio': { const [k, dv] = arg.split(':'); S.ratio[k] = Math.max(0, Math.min(9, (S.ratio[k] || 0) + +dv)); AU.click(); renderPanel(); break; }
      case 'alloc': { const [k, f] = arg.split(':'); const amt = +f >= 1 ? S.sp : Math.max(1, Math.floor(S.sp * +f)); E.allocate(S, k, amt); AU.click(); updateBinds(); break; }
      case 'resetStats': E.resetStats(S); if (S.autoAlloc) E.autoAllocate(S); AU.click(); toast('스탯을 초기화했습니다.'); updateBinds(); break;
      case 'buyN': ui.buyN = arg === 'max' ? 'max' : +arg; AU.click(); renderPanel(); break;
      case 'buyEq': { const i = +arg; const k = buyCount('e', i); if (E.buyEquip(S, i, ui.buyN === 'max' ? 'max' : k)) AU.click(); updateBinds(); break; }
      case 'buyComp': { const i = +arg; const k = buyCount('c', i); if (E.buyComp(S, i, ui.buyN === 'max' ? 'max' : k)) AU.click(); updateBinds(); break; }
      case 'autoBuy': S.autoBuy = !S.autoBuy; AU.click(); renderPanel(); break;
      case 'promote': if (E.promote(S, +arg)) { afterPromote(); } break;
      case 'promoteMax': { let n = 0; const li = curLine(); while (li >= 0 && E.promote(S, li) && n < 200) n++; if (n) afterPromote(n); break; }
      case 'pw': openPw(arg); break;
      case 'pwKey': pwKey(arg); break;
      case 'orbHint': ui.hintShown[arg] = true; AU.click(); renderPanel(); break;
      case 'bagEmpty': S.misc.bagTaps = (S.misc.bagTaps || 0) + 1; AU.click(); if (S.misc.bagTaps >= 10 && E.grantOrb(S, 'p4')) { processEvents(); renderPanel(); } else if (S.misc.bagTaps < 10) toast('…빈 칸이다. (' + S.misc.bagTaps + ')'); break;
      case 'portrait': S.misc.portraitTaps = (S.misc.portraitTaps || 0) + 1; AU.click(); if (S.misc.portraitTaps >= 7 && E.grantOrb(S, 'y4')) processEvents(); else if (S.misc.portraitTaps < 7) toast('거울 속의 나… (' + S.misc.portraitTaps + ')'); break;
      case 'town': ui.townSel = +arg; AU.click(); renderPanel(true); break;
      case 'goTown': { const t = +arg; const z0 = t * BAL.zonesPerTown + 1; const z = Math.min(S.maxZone, z0 + BAL.zonesPerTown - 1); E.setZone(S, z); S.autoAdvance = z >= S.maxZone; AU.click(); toast(TOWNS[t].field + '(으)로 이동했습니다.'); updateHud(); break; }
      case 'talk': talk(arg); break;
      case 'spot': spot(arg); break;
      case 'slot': slot(+arg); break;
      case 'rebirth': confirmRebirth(); break;
      case 'doRebirth': doRebirth(); break;
      case 'buyFrag': if (E.buyFrag(S, arg)) { AU.click(); updateBinds(); } break;
      case 'sub': ui.sub = arg; AU.click(); renderPanel(true); break;
      case 'replay': startScene(arg, true); break;
      case 'notation': S.settings.notation = arg; N.setNotation(arg); renderPanel(); updateHud(); break;
      case 'toggle': S.settings[arg] = !S.settings[arg]; AU.setEnabled(S.settings.sound); AU.click(); renderPanel(); break;
      case 'saveNow': OF.main.save(); toast('저장했습니다.'); break;
      case 'export': exportSave(); break;
      case 'import': importSave(); break;
      case 'doImport': doImport(); break;
      case 'copyAgain': copyText($('saveCode').value); break;
      case 'reset': confirmReset(); break;
      case 'doReset': OF.main.hardReset(); break;
      case 'closeModal': closeModal(); break;
      case 'ver': S.misc.verTaps = (S.misc.verTaps || 0) + 1; if (S.misc.verTaps >= 5 && E.grantOrb(S, 'o4')) processEvents(); else if (S.misc.verTaps < 5) toast('build ∞ (' + S.misc.verTaps + ')'); break;
    }
  }
  function afterPromote(n) {
    AU.promote();
    const cc = E.curClass(S);
    toast('<b style="color:' + cc.color + '">전직!</b> ' + esc(E.className(S)) + (n > 1 ? ' (+' + n + '차)' : ''), 'button');
    burst(W * 0.2, H * 0.5, cc.color, 24);
    renderSkillBar();
    renderPanel();
  }

  function talk(arg) {
    const [t, id] = arg.split('|');
    const n = STY.NPCS[+t].find((x) => x.id === id);
    const key = t + ':' + id;
    const c = (S.talks[key] || 0) + 1;
    S.talks[key] = c;
    ui.npcSay[key] = n.lines[(c - 1) % n.lines.length];
    AU.blip();
    if (n.orbAt && c >= n.orbAt[0]) { if (E.grantOrb(S, n.orbAt[1])) processEvents(); }
    renderPanel();
  }
  function spot(arg) {
    const [t, i] = arg.split('|').map(Number);
    const sp = STY.SPOTS[t][i];
    const key = t + ':' + sp.id;
    ui.spotSay[t] = sp.text;
    if (!S.spots[key]) {
      S.spots[key] = true;
      const r = sp.reward;
      if (r.orb) { E.grantOrb(S, r.orb); processEvents(); }
      if (r.gold) { const g = E.killGold(Math.max(S.zone, t * BAL.zonesPerTown + 1)) * r.gold * E.derive(S).goldMult; E.addGold(S, g); toast('● +' + fmt(g) + ' 골드를 주웠다!'); AU.orb(); }
      if (r.lore) { toast('📜 설정집에 기록됨: ' + esc(STY.LORE[r.lore][0])); AU.click(); }
    } else AU.click();
    renderPanel();
  }
  function slot(frac) {
    const bet = Math.floor(S.gold * frac);
    if (bet < 1) return;
    S.gold -= bet;
    S.misc.spins = (S.misc.spins || 0) + 1;
    const sym = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
    const r = Math.random();
    let res, mult;
    const pity = !S.flags.jackpot && S.misc.spins >= 15;
    if (pity || r < 0.012) { res = ['7️⃣', '7️⃣', '7️⃣']; mult = 20; }
    else if (r < 0.06) { const s = sym[Math.floor(Math.random() * 4)]; res = [s, s, s]; mult = 5; }
    else if (r < 0.30) { const s = sym[Math.floor(Math.random() * 5)]; let o; do { o = sym[Math.floor(Math.random() * 5)]; } while (o === s); res = [s, s, o].sort(() => Math.random() - 0.5); mult = 2; }
    else { do { res = [0, 1, 2].map(() => sym[Math.floor(Math.random() * 5)]); } while (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]); mult = 0; }
    ui.slot = res;
    const win = bet * mult;
    if (win > 0) E.addGold(S, win);
    if (mult === 20) {
      ui.slotMsg = (pity ? '럭키: 「불쌍해서 드려요…」 ' : '') + '★ JACKPOT! +' + fmt(win);
      S.flags.jackpot = true;
      AU.boss();
      if (E.grantOrb(S, 'y2')) processEvents();
    } else if (mult) { ui.slotMsg = '당첨! ×' + mult + ' (+' + fmt(win) + ')'; AU.orb(); }
    else { ui.slotMsg = '꽝! -' + fmt(bet) + ' 골드'; AU.fail(); }
    renderPanel();
  }

  /* 비밀번호 */
  function openPw(line) {
    ui.pwInput = ''; ui.pwLine = line;
    const c = CLASSES.find((x) => x.id === line);
    const col = colorOfLine(line);
    const oc = ORB_COLORS[col];
    const found = ORBS.filter((o) => o.c === col && S.orbs[o.id]);
    let h = '<h2 style="color:' + c.color + '">' + esc(c.name) + ' 계열 해금</h2><div class="small">' + oc.name + ' 4개의 숫자를 모두 더한 값을 입력하세요.</div>' +
      '<div class="orbs" style="margin:8px 0">' + found.map((o) => '<div class="orb" style="background:' + oc.color + '">' + o.v + '</div>').join('') +
      Array(4 - found.length).fill('<div class="orb unk">?</div>').join('') + '</div>' +
      '<div class="pwshow" id="pwShow">&nbsp;</div><div class="tiny" id="pwMsg" style="min-height:16px;margin-top:4px"></div><div class="keypad">';
    for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']) {
      h += '<button type="button" class="btn ' + (k === 'ok' ? 'gold' : k === 'del' ? 'ghost' : '') + '" data-act="pwKey" data-arg="' + k + '">' + (k === 'del' ? '←' : k === 'ok' ? '확인' : k) + '</button>';
    }
    h += '</div><button type="button" class="btn ghost wide" style="margin-top:8px" data-act="closeModal">닫기</button>';
    openModal(h);
  }
  function pwKey(k) {
    AU.click();
    if (k === 'del') ui.pwInput = ui.pwInput.slice(0, -1);
    else if (k === 'ok') {
      if (E.tryPassword(S, ui.pwLine, ui.pwInput)) {
        const c = CLASSES.find((x) => x.id === ui.pwLine);
        closeModal();
        AU.promote();
        toast('<b style="color:' + c.color + '">' + esc(c.name) + '</b> 계열이 해금되었습니다! 이제 전직할 수 있어요.', 'button');
        renderPanel();
        return;
      }
      $('pwMsg').textContent = '틀렸습니다. 구슬을 모두 찾았는지, 더하기가 맞는지 확인하세요.';
      $('mbox').classList.remove('fx-shake'); void $('mbox').offsetWidth; $('mbox').classList.add('fx-shake');
      AU.fail();
      ui.pwInput = '';
    } else if (ui.pwInput.length < 8) ui.pwInput += k;
    $('pwShow').innerHTML = ui.pwInput ? esc(ui.pwInput) : '&nbsp;';
  }

  /* 환생 */
  function confirmRebirth() {
    const g = E.fragGain(S);
    openModal('<h2>환생할까요?</h2><div class="small">버튼을 길게 누르면 세계가 한 바퀴 돕니다.</div>' +
      '<div class="card" style="margin:10px 0"><div class="kv"><span>획득</span><span class="c-frag">◆ +' + fmt(g) + '</span><span>누적 보너스</span><span>' + fmtMult(1 + BAL.fragPassive * S.fragsTotal) + ' → ' + fmtMult(1 + BAL.fragPassive * (S.fragsTotal + g)) + '</span><span>시작 구역</span><span>' + E.zoneLabel(E.warpZone(S)) + '</span></div></div>' +
      '<div class="tiny">레벨·스탯·골드·장비·동료 레벨·구역 진행이 초기화됩니다. 전직·유물·구슬·업적·기억 조각은 유지됩니다.</div>' +
      '<div class="row" style="margin-top:12px"><button type="button" class="btn ghost grow" data-act="closeModal">취소</button><button type="button" class="btn red grow" data-act="doRebirth">환생하기</button></div>');
  }
  function doRebirth() {
    closeModal();
    const g = E.rebirth(S);
    if (!g) return;
    AU.rebirth();
    flash();
    ui.floats = []; ui.parts = [];
    toast('◆ 기억 조각 +' + fmt(g) + '! 다시, 처음부터.', 'button');
    processEvents();
    renderPanel(true);
    updateHud();
  }

  /* 저장 */
  function copyText(s) {
    try {
      navigator.clipboard.writeText(s).then(() => toast('복사했습니다.'), () => { selectCode(); toast('자동 복사가 막혔어요. 코드를 길게 눌러 복사하세요.'); });
    } catch (e) { selectCode(); toast('코드를 길게 눌러 복사하세요.'); }
  }
  function selectCode() { const ta = $('saveCode'); if (ta) { ta.focus(); ta.select(); } }
  function exportSave() {
    const code = OF.main.exportCode();
    openModal('<h2>저장 코드</h2><div class="small">이 코드를 다른 기기의 [불러오기]에 붙여 넣으세요.</div><textarea id="saveCode" readonly>' + esc(code) + '</textarea>' +
      '<div class="row" style="margin-top:8px"><button type="button" class="btn grow" data-act="copyAgain">복사</button><button type="button" class="btn ghost grow" data-act="closeModal">닫기</button></div>');
    copyText(code);
  }
  function importSave() {
    openModal('<h2>불러오기</h2><div class="small">저장 코드를 붙여 넣으세요. 현재 진행은 덮어써집니다.</div><textarea id="loadCode" placeholder="저장 코드"></textarea><div class="tiny" id="loadMsg"></div>' +
      '<div class="row" style="margin-top:8px"><button type="button" class="btn ghost grow" data-act="closeModal">취소</button><button type="button" class="btn gold grow" data-act="doImport">불러오기</button></div>');
  }
  function doImport() {
    const v = $('loadCode').value.trim();
    if (!OF.main.importCode(v)) $('loadMsg').textContent = '코드를 읽을 수 없습니다. 전체를 정확히 붙여 넣었는지 확인하세요.';
  }
  function confirmReset() {
    openModal('<h2>처음부터 다시?</h2><div class="small">모든 진행(전직, 유물, 구슬, 업적 포함)이 영구히 삭제됩니다. 되돌릴 수 없어요.</div>' +
      '<div class="row" style="margin-top:12px"><button type="button" class="btn ghost grow" data-act="closeModal">취소</button><button type="button" class="btn red grow" data-act="doReset">전부 삭제</button></div>');
  }

  /* ───────── 모달 / 토스트 / 플래시 ───────── */
  function openModal(html) { $('mbox').innerHTML = html; $('modal').hidden = false; }
  function closeModal() { $('modal').hidden = true; $('mbox').innerHTML = ''; }
  function toast(html, por) {
    const box = $('toasts');
    while (box.children.length >= 3) box.firstChild.remove();
    const d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = (por ? '<img alt="" src="' + SP.portraitURL(por, 2) + '">' : '') + '<div>' + html + '</div>';
    box.appendChild(d);
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, 2800);
  }
  function flash() {
    const f = $('flash');
    f.style.transition = 'none'; f.style.opacity = '0.85';
    requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity .6s'; f.style.opacity = '0'; }));
  }

  /* ───────── 대화 ───────── */
  function queueScene(id) { if (S.seen[id] || ui.dlgQueue.includes(id)) return; ui.dlgQueue.push(id); }
  function pumpDialogue() { if (ui.dlg || !ui.dlgQueue.length || !$('modal').hidden) return; startScene(ui.dlgQueue.shift()); }
  function startScene(id, replay) {
    const sc = STY.SCENES[id];
    if (!sc) return;
    if (!replay) S.seen[id] = true;
    ui.dlg = { id, lines: sc.lines, i: -1, shown: 0, full: '', replay: !!replay, acc: 0 };
    $('dlg').hidden = false;
    dlgNext();
  }
  function dlgNext() {
    const d = ui.dlg;
    d.i++;
    if (d.i >= d.lines.length) return dlgEnd();
    const [who, text, fx] = d.lines[d.i];
    const ch = STY.CHARS[who] || STY.CHARS.sys;
    const por = $('dlgPor');
    if (who === 'sys') { por.style.visibility = 'hidden'; }
    else { por.style.visibility = 'visible'; por.src = SP.portraitURL(who, 6); }
    const wEl = $('dlgWho');
    wEl.hidden = who === 'sys';
    wEl.textContent = ch.name; wEl.style.color = ch.color;
    const tx = $('dlgTxt');
    tx.className = 'txt' + (who === 'sys' ? ' sys' : '') + (fx === 'big' ? ' big' : '');
    tx.textContent = '';
    d.full = text; d.shown = 0; d.acc = 0;
    $('dlgCount').textContent = (d.i + 1) + ' / ' + d.lines.length;
    const box = $('dlgBox');
    box.classList.remove('fx-shake', 'fx-glitch'); void box.offsetWidth;
    if (fx === 'shake') { box.classList.add('fx-shake'); vibrate(30); AU.hit(); }
    if (fx === 'glitch') box.classList.add('fx-glitch');
    if (fx === 'flash') { flash(); AU.orb(); }
  }
  function dlgTick(dt) {
    const d = ui.dlg;
    if (!d || d.shown >= d.full.length) return;
    d.acc += dt;
    const step = 0.026;
    let n = 0;
    while (d.acc >= step && d.shown < d.full.length) { d.acc -= step; d.shown++; n++; }
    if (n) {
      $('dlgTxt').textContent = d.full.slice(0, d.shown);
      if (d.shown % 3 === 0) AU.blip();
    }
  }
  function dlgAdvance() {
    const d = ui.dlg;
    if (!d) return;
    if (d.shown < d.full.length) { d.shown = d.full.length; $('dlgTxt').textContent = d.full; return; }
    dlgNext();
  }
  function dlgSkip() { if (ui.dlg) { ui.dlg.i = ui.dlg.lines.length; dlgEnd(); } }
  function dlgEnd() {
    const d = ui.dlg;
    ui.dlg = null;
    $('dlg').hidden = true;
    const sc = STY.SCENES[d.id];
    if (!d.replay && sc.orb) { E.grantOrb(S, sc.orb); }
    if (!d.replay && d.id === 'ending') showCredits();
    if (!d.replay && S.enemy && S.enemy.kind >= 1 && S.enemy.kind < 3 && S.bf) { S.bf.time = S.bf.maxTime; const dd = E.derive(S); S.bf.php = S.bf.pmax = dd.hp; }
    processEvents();
    renderPanel();
    setTimeout(pumpDialogue, 250);
  }
  function showCredits() {
    const T = S.tot;
    openModal('<h2 style="text-align:center;color:var(--red)">OVERFLOW</h2><div style="text-align:center"><img class="pix" src="' + SP.portraitURL('button', 5) + '" width="90" height="90" alt=""></div>' +
      '<p class="small" style="text-align:center">캡 없는 소년의 이야기는 여기서 끝나지 않습니다.<br>엔딩 보너스 <b class="c-gold">모든 공격력·체력·경험치·골드 ×100만</b>이 영구 적용되었습니다.</p>' +
      '<div class="card kv"><span>플레이 시간</span><span>' + N.fmtTime(T.playTime) + '</span><span>최고 레벨</span><span>' + fmtInt(T.maxLevel) + '</span><span>탭</span><span>' + fmt(T.taps) + '</span><span>환생</span><span>' + S.rebirths + '회</span><span>처치</span><span>' + fmt(T.kills) + '</span></div>' +
      '<p class="tiny" style="text-align:center">무한 렙업: OVERFLOW — 플레이해 주셔서 고맙습니다.</p><button type="button" class="btn gold wide" data-act="closeModal">계속하기</button>');
  }

  /* ───────── 이벤트 처리 ───────── */
  function processEvents() {
    if (!S.events.length) return;
    const G = geom();
    let needPanel = false;
    for (const ev of S.events) {
      switch (ev.type) {
        case 'levelup': {
          const gained = ev.to - ev.from;
          ui.lvAcc += gained;
          if (!ui.lvFx || ui.lvFx.life < 0.6) { ui.lvFx = { life: 1.2, gained: ui.lvAcc }; ui.lvAcc = 0; AU.level(); }
          for (const id of STY.scenesFor(ev, S.seen)) queueScene(id);
          let qi = S.misc.quip || 0, q = null;
          while (STY.LEVEL_QUIPS[qi] && S.tot.maxLevel >= STY.LEVEL_QUIPS[qi][0]) { q = STY.LEVEL_QUIPS[qi]; qi++; }
          if (q) { S.misc.quip = qi; toast('<b>버튼</b> 「' + esc(q[1]) + '」', 'button'); }
          break;
        }
        case 'kill':
          if (ev.kind === 0) { if (Math.random() < 0.5) burst(G.mx, G.gy - 30, TOWNS[E.townOf(Math.min(ev.z, FINAL_ZONE - 1))].pal[3], 6); }
          else { burst(G.mx, G.gy - 40, '#ffcf4a', 26); ui.shake = 0.25; }
          if (Math.random() < 0.3) AU.kill();
          break;
        case 'bossClear': AU.boss(); addFloat(G.mx, G.gy - 90, '격파!', '#ffcf4a', 24, 1.2); needPanel = true; break;
        case 'bossFail':
          AU.fail();
          toast(ev.reason === 'hp' ? '보스에게 쓰러졌다! <b>체력(VIT)</b>이나 <b>갑옷</b>을 올려 보세요.' : '시간 초과! 공격력을 올리고 <b>재도전</b>하세요.', 'button');
          break;
        case 'bossHit': ui.heroHit = 0.15; if (Math.random() < 0.5) AU.hit(); addFloat(G.hx, G.gy - 80, '-' + fmt(ev.dmg), '#ff4d5e', 13, 0.8); break;
        case 'reach': {
          const scenes = STY.scenesFor(ev, S.seen);
          for (const id of scenes) queueScene(id);
          if ((ev.z - 1) % BAL.zonesPerTown === 0 && ev.z > 1 && !E.isFinal(ev.z)) toast('🗺️ 새 지역: <b>' + esc(TOWNS[E.townOf(ev.z)].name) + '</b>');
          COMPANIONS.forEach((c, i) => { if (c.unlock + 1 === ev.z) toast('👥 동료 합류 가능: <b>' + esc(c.name) + '</b> — [동료] 탭', c.portrait); });
          needPanel = true;
          break;
        }
        case 'relic':
          for (const id of STY.scenesFor(ev, S.seen)) queueScene(id);
          needPanel = true;
          break;
        case 'orb': {
          const o = ORBS.find((x) => x.id === ev.id);
          const oc = ORB_COLORS[o.c];
          toast('<b style="color:' + oc.color + '">' + oc.name + '</b> 발견! 숫자 <b>' + o.v + '</b> — [전직] 탭의 구슬 가방');
          AU.orb();
          needPanel = true;
          break;
        }
        case 'ach': { const a = ACH.find((x) => x.id === ev.id); toast('🏆 업적 달성: <b>' + esc(a.name) + '</b> <span class="tiny">(모든 능력 ×1.03)</span>'); break; }
        case 'promote': renderSkillBar(); break;
        case 'skill': AU.orb(); break;
        case 'rebirth': for (const id of STY.scenesFor(ev, S.seen)) queueScene(id); break;
        case 'overflow':
          AU.overflow(); flash(); ui.shake = 1.2;
          for (const id of STY.scenesFor(ev, S.seen)) queueScene(id);
          needPanel = true;
          break;
      }
    }
    S.events.length = 0;
    if (needPanel && (ui.tab === 'town' || ui.tab === 'class' || ui.tab === 'allies' || ui.tab === 'rebirth')) ui.panelDirty = true;
    pumpDialogue();
  }

  /* ───────── 프레임 ───────── */
  function frame(now, dt) {
    if (ui.dlg) dlgTick(dt);
    processEvents();
    draw(now, dt);
    ui.hudT += dt;
    if (ui.hudT >= 0.1) { ui.hudT = 0; updateHud(); }
    ui.bindT += dt;
    if (ui.bindT >= 0.25) { ui.bindT = 0; updateBinds(); }
    ui.panelT = (ui.panelT || 0) + dt;
    if (ui.panelDirty && ui.panelT >= 1) { ui.panelT = 0; ui.panelDirty = false; renderPanel(); }
  }

  function init(state) {
    S = state;
    N.setNotation(S.settings.notation);
    AU.setEnabled(S.settings.sound);
    cv = $('cv'); ctx = cv.getContext('2d');
    $('hudAva').src = SP.portraitURL('zero', 2);
    bindGlobal();
    resize();
    setTab('stats');
    renderSkillBar();
    updateHud();
    if (!S.seen.prologue) queueScene('prologue');
    pumpDialogue();
  }
  function setState(s) {
    S = s; ui.dlgQueue = []; ui.floats = []; ui.parts = []; ui.npcSay = {}; ui.spotSay = {};
    N.setNotation(S.settings.notation); AU.setEnabled(S.settings.sound);
    $('skillBar')._k = null; renderSkillBar(); setTab('stats'); updateHud();
    if (!S.seen.prologue) queueScene('prologue');
    pumpDialogue();
  }
  function isPaused() { return !!ui.dlg; }

  OF.ui = { init, frame, setState, toast, openModal, closeModal, processEvents, isPaused, resize, renderPanel, playScene: startScene, setTab };
})();
