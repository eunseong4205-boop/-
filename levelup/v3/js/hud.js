/* 화면 위 정보: 하트 · MP · 필살 게이지 · 렙과 빛 · 골드 · 장착한 활/마법/도구 · 기력 고리 · 보스 체력 · 작은 지도 · 피격 붉은 테 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles;
  const TS = TL.TS;
  const H = { hurtT: 0, readyT: 0, boss: null, bossShow: 0, expShow: 0, lastExp: 0, lastLv: 0, mini: null, miniT: 0, hidden: false, goldShow: 0, lastGold: 0 };
  const touch = () => document.documentElement.classList.contains('touch');

  /* ───────── 아이콘 ───────── */
  const ICON = {};
  function icon(id) {
    if (ICON[id]) return ICON[id];
    const b = X.brush(12, 12);
    const P = (rows, pal) => b.stamp(0, 0, rows, pal);
    switch (id) {
      case 'heart': P(['            ', ' rrr  rrr   ', 'rwwrrrrrrr  ', 'rwrrrrrrrr  ', 'rrrrrrrrrr  ', ' rrrrrrrr   ', '  rrrrrr    ', '   rrrr     ', '    rr      '], { r: '#ff3a5a', w: '#ffc8d0' }); break;
      case 'bow': P(['      bbb   ', '     b   s  ', '    b     s ', '   b      s ', '  b  aaaaaA', '   b      s ', '    b     s ', '     b   s  ', '      bbb   '], { b: '#a86a3a', s: '#e8e0cc', a: '#c8b890', A: '#e8e8f0' }); break;
      case 'arrows': P(['   A        ', '  AAA       ', '   a   A    ', '   a  AAA   ', '   a   a    ', '   a   a    ', '  f f  a    ', '      f f   '], { a: '#8a5a30', A: '#e8e8f0', f: '#e8e0cc' }); break;
      case 'bomb': P(['       y    ', '      o     ', '     o      ', '   kkkk     ', '  kwkkkk    ', ' kwkkkkkk   ', ' kkkkkkkk   ', ' kkkkkkkk   ', '  kkkkkk    ', '   kkkk     '], { k: '#2a2a4a', w: '#8a8ab8', o: '#8a6a3a', y: '#ffd84a' }); break;
      case 'hook': P(['    cccc    ', '   c    c   ', '   c    c   ', '       c    ', '      c     ', '     c      ', '    c       ', '   c        ', '  ll        ', ' ll         ', 'll          '], { c: '#d8d8e8', l: '#8a6a4a' }); break;
      case 'lantern': P(['    kk      ', '   k  k     ', '  kkkkkk    ', '  kyyyyk    ', '  kywwyk    ', '  kywwyk    ', '  kyyyyk    ', '  kkkkkk    '], { k: '#5a4a3a', y: '#ffc84a', w: '#fff8d8' }); break;
      case 'mirror': P(['   gggg     ', '  gbbbbg    ', ' gbwbbbbg   ', ' gbbwbbbg   ', ' gbbbbbbg   ', '  gbbbbg    ', '   gggg     ', '    gg      ', '    gg      ', '   gggg     '], { g: '#e8c860', b: '#8a6ad8', w: '#e8e0ff' }); break;
      case 'rod': P(['          s ', '         l s', '        l  s', '       l   s', '      l    s', '     l     s', '    l     rr', '   ll       ', '  ll        '], { l: '#8a5a30', s: '#e8e8f0', r: '#ff4a4a' }); break;
      case 'fire': P(['     r      ', '    ro      ', '   roo r    ', '   rooror   ', '  rooyoor   ', '  royyyor   ', '  roywyor   ', '   rooor    ', '    rrr     '], { r: '#d83a2a', o: '#ff8a3a', y: '#ffd84a', w: '#ffffff' }); break;
      case 'ice': P(['     w      ', '    wbw     ', '    bBb     ', '   wbBbw    ', '    bBb     ', '    bBb     ', '    bBb     ', '     b      '], { w: '#ffffff', b: '#8ad8ff', B: '#d8f4ff' }); break;
      case 'bolt': P(['      yy    ', '     yy     ', '    yy      ', '   yyyyy    ', '     yy     ', '    yy      ', '   yy       ', '  y         '], { y: '#ffe066' }); break;
      case 'heal': P(['    gg      ', '    gg      ', '  gggggg    ', '  gggggg    ', '    gg      ', '    gg      '], { g: '#6ae07a' }); break;
      case 'light': P(['     w      ', '  w  w  w   ', '   wwww     ', ' wwwyywww   ', '   wwww     ', '  w  w  w   ', '     w      '], { w: '#ffffff', y: '#fff2a8' }); break;
      case 'coin': P(['   yyyy     ', '  yYYyyy    ', ' yYyyyyoy   ', ' yYyyyyoy   ', ' yyyyyyoy   ', '  yyyooy    ', '   yyyy     '], { y: '#e8b83a', Y: '#fff0a8', o: '#a87a1a' }); break;
      case 'key': P(['  yyy       ', ' y   y      ', ' y   y      ', '  yyy       ', '   y        ', '   y        ', '   yy       ', '   y        ', '   yy       '], { y: '#e8c850' }); break;
      case 'bigkey': P([' yyyyy      ', 'y rrr y     ', 'y r r y     ', 'y rrr y     ', ' yyyyy      ', '   y        ', '   yyy      ', '   y        ', '   yyy      ', '   y        '], { y: '#e8c850', r: '#d83a5a' }); break;
      case 'wind': P(['            ', '  ggggg     ', ' g     g    ', '      gg    ', ' ggggg      ', '        g   ', '  gggggg    ', '         g  ', '   ggggg    '], { g: '#b8ffd8' }); break;
      case 'quake': P(['     b      ', '    bb      ', '   bbb  b   ', '  bbbbbbb   ', ' bbBbbBbbb  ', 'bbbbbbbbbbb ', ' d d  d d  ', 'd  d d  d d '], { b: '#c8985a', B: '#e8c890', d: '#8a6a3a' }); break;
      case 'meteor': P(['          o ', '        oo  ', '      ooo   ', '    rrr     ', '  rrYYr     ', ' rYYYYr     ', ' rYYYr      ', '  rrr       '], { o: '#ffb07a', r: '#ff5a3a', Y: '#fff0a8' }); break;
      case 'special': P(['     y      ', '    yWy     ', ' y  yWy  y  ', '  yyWWWyy   ', 'yyWWWWWWWyy ', '  yyWWWyy   ', ' y  yWy  y  ', '    yWy     ', '     y      '], { y: '#ffc84a', W: '#fff8d0' }); break;
      case 'art': P(['  pppppp    ', ' pWWWWWWp   ', ' pWyyyyWp   ', ' pWWWWWWp   ', ' pWyyyWWp   ', ' pWWWWWWp   ', '  pppppp    '], { p: '#a86ad8', W: '#f4ecd8', y: '#c8a050' }); break;
      case 'none': P(['            ', '   ssssss   ', '  s      s  ', '  s      s  ', '   ssssss   '], { s: '#4a4058' }); break;
      default: b.rect(2, 2, 8, 8, '#8a8098'); break;
    }
    ICON[id] = X.outline(b.put(), '#0b0914');
    return ICON[id];
  }

  /* ───────── 하트 그리기 ───────── */
  const HEART = {};
  function heartImg(q) {
    if (HEART[q]) return HEART[q];
    const b = X.brush(8, 7);
    const shape = [' xx xx ', 'xxxxxxx', 'xxxxxxx', ' xxxxx ', '  xxx  ', '   x   '];
    shape.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === 'x') b.px(x, y, '#3a1424'); });
    // q: 0~4 (¼ 단위로 채움, 왼쪽 위 → 시계방향)
    const fill = (x, y) => { const left = x < 3.5, top = y < 3; const idx = left && top ? 0 : !left && top ? 1 : !left && !top ? 2 : 3; return idx < q; };
    shape.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === 'x' && fill(x, y)) b.px(x, y, '#ff3a5a'); });
    if (q > 0) { b.px(1, 1, '#ffc8d0'); b.px(2, 1, '#ffc8d0'); b.px(1, 2, '#ff9aaa'); }
    HEART[q] = X.outline(b.put(), '#0b0914');
    return HEART[q];
  }

  function spellIcon(id) { return icon(id || 'none'); }
  function toolIcon(id) { return icon(id || 'none'); }

  /* ───────── 그리기 ───────── */
  function draw(g, w, h) {
    const W = G.world, p = W.player, s = G.state;
    if (!p || H.hidden || (G.cine && G.cine.active && G.cine.active())) { drawBoss(g, w, h); drawVignette(g, w, h); return; }
    const d = G.st.derive(s);
    // ── 하트 ──
    const perRow = 10;
    const hearts = Math.ceil(d.hpMax / 4);
    const low = s.hp <= 4 && s.hp > 0;
    for (let i = 0; i < hearts; i++) {
      const q = U.clamp(s.hp - i * 4, 0, 4);
      const x = 6 + (i % perRow) * 9, y = 5 + Math.floor(i / perRow) * 8;
      let yy = y;
      if (low && q > 0 && i === Math.ceil(s.hp / 4) - 1) yy += Math.round(Math.sin(W.t * 12) * 1);
      g.drawImage(heartImg(q), x, yy);
    }
    let y = 5 + Math.ceil(hearts / perRow) * 8 + 2;
    // ── MP ──
    const barW = 64;
    if (Object.keys(s.spells).length) {
      bar(g, 7, y, barW, 3, s.mp / d.mpMax, '#4a8aff', '#8ac8ff', '#14203a');
      y += 5;
    }
    // ── 필살 ──
    const sp = s.special / 100;
    const ready = sp >= 1;
    bar(g, 7, y, barW, 2, sp, ready ? (Math.floor(W.t * 8) % 2 ? '#fff2a8' : '#ffcc4a') : '#d8a040', '#ffe8a8', '#2a2010');
    if (ready) { g.globalAlpha = 0.4 + Math.sin(W.t * 8) * 0.2; g.fillStyle = '#ffe8a8'; g.fillRect(6, y - 1, barW + 2, 4); g.globalAlpha = 1; }
    y += 5;
    // ── 렙 · 빛 ──
    const need = G.data.expNext(s.lv);
    if (s.exp !== H.lastExp || s.lv !== H.lastLv) { H.expShow = 3; H.lastExp = s.exp; H.lastLv = s.lv; }
    X.digits(g, 'LV', 7, y + 1, '#9d93b6');
    X.digits(g, s.lv, 16, y + 1, '#ffffff');
    const lx = 20 + X.digitsWidth(String(s.lv)) + 2;
    bar(g, lx, y + 2, Math.max(20, barW + 7 - lx), 2, s.exp / need, '#e8e0ff', '#ffffff', '#201a30');
    if (s.pts > 0) { g.fillStyle = Math.floor(W.t * 3) % 2 ? '#ffe066' : '#fff'; g.fillRect(barW + 10, y + 1, 3, 3); }
    y += 9;
    // ── 버프 ──
    const now = s.t;
    let bx = 7;
    for (const b of s.buffs) if (b.until > now) { const left = b.until - now; g.fillStyle = b.col || '#8ae0a0'; g.globalAlpha = left < 5 && Math.floor(W.t * 6) % 2 ? 0.4 : 1; g.fillRect(bx, y, 5, 5); g.globalAlpha = 1; bx += 7; }

    // ── 오른쪽 위: 골드 · 열쇠 · 작은 지도 ──
    const rx = w - 6;
    const mm = drawMini(g, w, h);
    let ry = mm ? mm.y + mm.h + 4 : 5;
    if (touch()) ry = Math.max(ry, 34);
    if (s.gold !== H.lastGold) { H.goldShow = 2; H.lastGold = s.gold; }
    const gs = String(s.gold);
    g.drawImage(icon('coin'), rx - X.digitsWidth(gs) - 16, ry - 1);
    X.digits(g, gs, rx - X.digitsWidth(gs), ry + 3, H.goldShow > 0 ? '#fff0a8' : '#e8d8a8');
    ry += 11;
    const m = W.map;
    if (m && m.dungeon) {
      const k = (s.keys[m.dungeon] || 0);
      g.drawImage(icon('key'), rx - 20, ry - 1); X.digits(g, 'x' + k, rx - X.digitsWidth('x' + k), ry + 3, '#e8d8a8');
      if (s.bigkeys[m.dungeon]) g.drawImage(icon('bigkey'), rx - 34, ry - 2);
      ry += 12;
    }

    // ── 장착 칸: 활 · 마법 · 도구 (PC는 오른쪽 아래, 휴대폰은 버튼이 대신) ──
    if (!touch()) {
      const slots = [
        { k: 'K', ic: s.tools.bow ? icon('bow') : null, n: s.tools.bow ? s.ammo.arrows : null, lab: '활' },
        { k: 'L', ic: s.spell ? spellIcon(s.spell) : null, n: null, lab: s.spell ? G.data.SPELLS[s.spell].name : '마법', mp: s.spell ? G.data.SPELLS[s.spell].mp : 0 },
        { k: 'I', ic: s.tool ? toolIcon(s.tool) : null, n: s.tool === 'bomb' ? s.ammo.bombs : null, lab: s.tool ? G.data.ITEMS[s.tool].name : '도구' },
      ];
      let sx = w - 6 - slots.length * 24;
      const sy = h - 26;
      for (const sl of slots) {
        g.fillStyle = 'rgba(11,9,20,0.72)'; g.fillRect(sx, sy, 21, 21);
        g.strokeStyle = sl.ic ? 'rgba(240,204,110,0.55)' : 'rgba(157,147,182,0.25)'; g.lineWidth = 1; g.strokeRect(sx + 0.5, sy + 0.5, 20, 20);
        if (sl.ic) g.drawImage(sl.ic, sx + 3, sy + 3);
        if (sl.n != null) X.digits(g, sl.n, sx + 20 - X.digitsWidth(String(sl.n)), sy + 15, sl.n > 0 ? '#ffffff' : '#ff6a7a');
        if (sl.mp && s.mp < sl.mp) { g.fillStyle = 'rgba(0,0,40,0.5)'; g.fillRect(sx + 1, sy + 1, 19, 19); }
        drawKey(g, sl.k, sx + 1, sy - 7);
        sx += 24;
      }
      // 필살 준비 표시
      if (ready) { g.font = "12px 'Galmuri11', monospace"; g.textAlign = 'right'; txt(g, '필살 준비 [O]', w - 6, h - 36, Math.floor(W.t * 4) % 2 ? '#ffe8a8' : '#ffcc4a'); g.textAlign = 'left'; }
    }

    // ── 기력 고리 (주인공 옆) ──
    if (p.stamina < p.staminaMax - 0.5 || p.exhausted) {
      const cx = Math.round(p.x - W.cam.x + 11), cy = Math.round(p.y - W.cam.y - 22 - (p.jz || 0));
      const k = p.stamina / p.staminaMax;
      g.lineWidth = 2;
      g.strokeStyle = 'rgba(11,9,20,0.7)'; g.beginPath(); g.arc(cx, cy, 4, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = p.exhausted ? (Math.floor(W.t * 8) % 2 ? '#ff5a3a' : '#ffa03a') : k < 0.3 ? '#ffd84a' : '#8ae07a';
      g.beginPath(); g.arc(cx, cy, 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke();
    }
    // 카운터 기회
    if (p.counterT > 0 && s.skills.sw_counter) { g.font = "12px 'Galmuri11', monospace"; g.textAlign = 'center'; txt(g, '반격!', Math.round(p.x - W.cam.x), Math.round(p.y - W.cam.y - 34), '#8ad8ff'); g.textAlign = 'left'; }

    // ── 말 걸기 · 조사 안내 ──
    if (G.interact && G.interact.hint) {
      const ht = G.interact.hint;
      const hx = Math.round(ht.x - W.rcx), hy = Math.round(ht.y - W.rcy - (ht.h || 26) - 8 + Math.sin(W.t * 5));
      g.font = "12px 'Galmuri11', monospace";
      const label = ht.label;
      const tw = Math.ceil(g.measureText(label).width) + (touch() ? 8 : 18);
      const bx = Math.round(hx - tw / 2);
      g.fillStyle = 'rgba(11,9,20,0.85)'; g.fillRect(bx, hy - 12, tw, 15);
      g.fillStyle = '#f0cc6e'; g.fillRect(bx, hy + 3, tw, 1);
      if (!touch()) { g.fillStyle = '#f0cc6e'; g.fillRect(bx + 3, hy - 9, 9, 9); g.fillStyle = '#0b0914'; g.font = "12px 'Galmuri11', monospace"; g.fillText('J', bx + 5, hy - 1); }
      g.font = "12px 'Galmuri11', monospace"; txt(g, label, bx + (touch() ? 4 : 14), hy, '#f4ecdc');
    }

    drawBoss(g, w, h);
    drawVignette(g, w, h);
    // 추위 · 더위 경고
    if (H.env) { g.font = "12px 'Galmuri11', monospace"; txt(g, H.env.text, 7, y + 12, H.env.col); }
  }
  function drawVignette(g, w, h) {
    const s = G.state;
    const d = G.st.derive(s);
    let a = 0;
    if (H.hurtT > 0) a = H.hurtT * 1.4;
    if (s.hp > 0 && s.hp <= 4 && d.hpMax > 4) a = Math.max(a, 0.18 + Math.sin(G.world.t * 5) * 0.08);
    if (a > 0) {
      const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.7);
      gr.addColorStop(0, 'rgba(160,0,30,0)'); gr.addColorStop(1, 'rgba(160,0,30,' + Math.min(0.6, a) + ')');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
  }
  function drawBoss(g, w, h) {
    const b = H.boss;
    const tag = bossTag();
    if (!b || (b.dead && H.bossShow <= 0)) { if (!tag.hidden) tag.hidden = true; return; }
    const bw = Math.min(220, w - 120), x = Math.round((w - bw) / 2), y = h - 10;
    const k = Math.max(0, b.hp / b.maxHp);
    H.bossLag = H.bossLag == null ? k : U.lerp(H.bossLag, k, 0.04);
    g.fillStyle = 'rgba(11,9,20,0.85)'; g.fillRect(x - 2, y - 2, bw + 4, 8);
    // 이름은 화면 해상도 그대로(작고 또렷하게) — 캔버스 글씨는 3배로 커진다
    const full = b.title || b.name, cut = full.lastIndexOf('·');
    const key = full + '|' + (b.phase2 ? 1 : 0);
    if (tag.dataset.k !== key) { tag.dataset.k = key; tag.innerHTML = (cut > 0 ? '<small>' + full.slice(0, cut).trim() + '</small>' : '') + '<b>' + (cut > 0 ? full.slice(cut + 1).trim() : full) + '</b>'; tag.classList.toggle('rage', !!b.phase2); }
    if (tag.hidden) tag.hidden = false;
    g.fillStyle = '#2a1020'; g.fillRect(x, y, bw, 4);
    g.fillStyle = '#ffe8a8'; g.fillRect(x, y, Math.round(bw * H.bossLag), 4);
    g.fillStyle = b.phase2 ? '#c83aff' : '#ff3a5a'; g.fillRect(x, y, Math.round(bw * k), 4);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, y, Math.round(bw * k), 1);
    if (b.phases) for (const ph of b.phases) { g.fillStyle = '#0b0914'; g.fillRect(x + Math.round(bw * ph), y, 1, 4); }
  }
  function bossTag() {
    if (H.tag) return H.tag;
    const d = document.createElement('div'); d.id = 'bosstag'; d.hidden = true;
    document.getElementById('stage').appendChild(d);
    H.tag = d; return d;
  }
  function bar(g, x, y, w, h, k, c1, c2, bg) {
    g.fillStyle = '#0b0914'; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    const fw = Math.round(w * U.clamp(k, 0, 1));
    g.fillStyle = c1; g.fillRect(x, y, fw, h);
    g.fillStyle = c2; g.fillRect(x, y, fw, 1);
  }
  function drawKey(g, k, x, y) { g.fillStyle = 'rgba(11,9,20,0.8)'; g.fillRect(x - 1, y - 1, 6, 7); X.digits(g, k, x, y, '#9d93b6', false); }
  function txt(g, s, x, y, col) { g.fillStyle = '#0b0914'; g.fillText(s, x + 1, y + 1); g.fillText(s, x, y + 1); g.fillStyle = col; g.fillText(s, x, y); }

  /* ───────── 작은 지도 (넓은 지도에서만) ───────── */
  function drawMini(g, w) {
    const W = G.world, m = W.map, s = G.state;
    if (!m || !m.minimap || s.settings.minimap === false) return null;
    if (!m.miniImg) buildMini(m);
    const mw = 64, mh = 44;
    const x = w - mw - 6, y = touch() ? 40 : 5;
    const p = W.player;
    const ptx = p.x / TS, pty = p.y / TS;
    const sc = m.miniScale || 1; // 칸당 픽셀
    const sx = U.clamp(ptx * sc - mw / 2, 0, m.miniImg.width - mw), sy = U.clamp(pty * sc - mh / 2, 0, m.miniImg.height - mh);
    g.fillStyle = 'rgba(11,9,20,0.8)'; g.fillRect(x - 1, y - 1, mw + 2, mh + 2);
    g.globalAlpha = 0.9; g.drawImage(m.miniImg, Math.round(sx), Math.round(sy), mw, mh, x, y, mw, mh); g.globalAlpha = 1;
    // 안개 (가 본 곳만)
    if (m.fog) { g.drawImage(m.fogCanvas(), Math.round(sx), Math.round(sy), mw, mh, x, y, mw, mh); }
    // 표시: 이정표 · 목적지
    for (const mk of (m.markers || [])) {
      const mx = x + mk.x * sc - sx, my = y + mk.y * sc - sy;
      if (mx < x || my < y || mx > x + mw || my > y + mh) continue;
      g.fillStyle = mk.col || '#8ad8ff'; g.fillRect(Math.round(mx) - 1, Math.round(my) - 1, 2, 2);
    }
    const goal = G.story && (G.story.goalOn ? G.story.goalOn(m.id) : G.story.goal && G.story.goal());   // 다른 지도의 목표는 그리로 가는 문을
    if (goal && goal.map === m.id) {
      let gx = x + goal.x * sc - sx, gy = y + goal.y * sc - sy;
      const inside = gx >= x && gy >= y && gx <= x + mw && gy <= y + mh;
      gx = U.clamp(gx, x + 1, x + mw - 2); gy = U.clamp(gy, y + 1, y + mh - 2);
      if (inside || Math.floor(W.t * 3) % 2) { g.fillStyle = '#ffcc4a'; g.fillRect(Math.round(gx) - 1, Math.round(gy) - 1, 3, 3); }
    }
    g.fillStyle = Math.floor(W.t * 4) % 2 ? '#ffffff' : '#ff4a6a';
    g.fillRect(Math.round(x + ptx * sc - sx) - 1, Math.round(y + pty * sc - sy) - 1, 3, 3);
    g.strokeStyle = 'rgba(240,204,110,0.45)'; g.strokeRect(x - 0.5, y - 0.5, mw + 1, mh + 1);
    return { x, y, w: mw, h: mh };
  }
  /** 지도 한 장을 칸당 1픽셀 그림으로 */
  function buildMini(m) {
    const sc = m.miniScale || 1;
    const c = X.canvas(m.w * sc, m.h * sc), g = X.ctx(c);
    const img = g.createImageData(m.w, m.h), d = img.data;
    const colOf = {};
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.T(x, y), hh = m.H(x, y), o = m.O(x, y), rg = m.regName(x, y);
      const key = t + '|' + rg + '|' + (o && G.objs.DEF[o] && G.objs.DEF[o].solid ? 1 : 0);
      let col = colOf[key];
      if (!col) {
        const P = TL.PAL[rg] || TL.PAL.green;
        col = TL.miniCol(t, P);
        if (key.endsWith('|1')) col = U.shade(col, 0.7);
        colOf[key] = col;
      }
      const [r, gg, bb] = U.rgb(col);
      const f = 0.86 + hh * 0.05;
      const i = (y * m.w + x) * 4;
      d[i] = Math.min(255, r * f); d[i + 1] = Math.min(255, gg * f); d[i + 2] = Math.min(255, bb * f); d[i + 3] = 255;
    }
    const tmp = X.canvas(m.w, m.h); tmp.getContext('2d').putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, m.w * sc, m.h * sc);
    // 건물 표시
    for (const b of (m.buildings || [])) { g.fillStyle = '#e8c890'; g.fillRect(b.x * sc, b.y * sc, Math.max(1, b.w * sc), Math.max(1, b.h * sc)); }
    m.miniImg = c;
  }

  function update(dt) {
    if (H.hurtT > 0) H.hurtT -= dt;
    if (H.expShow > 0) H.expShow -= dt;
    if (H.goldShow > 0) H.goldShow -= dt;
    if (H.boss && H.boss.dead) H.bossShow -= dt;
    // 휴대폰 버튼 표시 갱신
    H.btnT = (H.btnT || 0) - dt;
    if (H.btnT <= 0 && touch()) { H.btnT = 0.25; syncButtons(); }
  }
  const btnCache = {};
  function syncButtons() {
    const s = G.state;
    const set = (act, label, dim, ready) => {
      const key = act + label + dim + ready;
      if (btnCache[act] === key) return;
      btnCache[act] = key;
      const el = document.querySelector('.tb[data-act="' + act + '"]');
      if (!el) return;
      el.querySelector('small').textContent = label;
      el.style.opacity = dim ? '0.28' : '';
      if (act === 'special') el.classList.toggle('ready', !!ready);
    };
    set('bow', s.tools.bow ? '활 ' + s.ammo.arrows : '활', !s.tools.bow);
    set('magic', s.spell ? G.data.SPELLS[s.spell].name : '마법', !s.spell || s.mp < (s.spell ? G.data.SPELLS[s.spell].mp : 99));
    set('tool', s.tool ? G.data.ITEMS[s.tool].name + (s.tool === 'bomb' ? ' ' + s.ammo.bombs : '') : '도구', !s.tool);
    set('special', s.special >= 100 ? '필살!' : Math.floor(s.special) + '%', false, s.special >= 100);
  }
  function hurt() { H.hurtT = 0.35; }
  function specialReady() { H.readyT = 1; if (G.ui && G.ui.toast) G.ui.toast('필살기 준비 — [O] 빛의 일섬', 'gold'); }
  function setBoss(b) { H.boss = b; H.bossShow = 2; H.bossLag = 1; }
  function cutin(text, sub, col) { if (G.cine && G.cine.cutin) G.cine.cutin({ who: 'hero', title: text, sub: sub || '', short: true, col, face: 'angry', sfx: 'skill' }); }

  Object.assign(H, { draw, update, hurt, specialReady, setBoss, cutin, icon, heartImg, buildMini, syncButtons });
  G.hud = H;
})();
