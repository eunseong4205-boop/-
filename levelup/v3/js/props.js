/* 소품과 사람: 상자 · 표지판 · 문 · 스위치 · 밀 블록 · 횃불 · 항아리 · 금 간 벽 · 갈고리 말뚝 · 빛의 이정표 · 하트 · 마을 사람(NPC)
   그리고 「앞에 있는 것과 상호작용」(G.interact). 열린 상자 · 부서진 벽은 state.flags에 남는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, X = G.gfx, TL = G.tiles, E = G.ent;
  const TS = TL.TS;
  const W = () => G.world;
  const S = () => G.state;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const flag = (k) => !!S().flags[k];
  const setFlag = (k, v) => { S().flags[k] = v == null ? true : v; };

  /* ───────── 그림 ───────── */
  const IMG = {};
  function img(key, w, h, f) { if (IMG[key]) return IMG[key]; const b = X.brush(w, h); f(b); IMG[key] = X.outline(b.put(), '#140c1c'); return IMG[key]; }
  const R = (c) => X.ramp(c, 5);
  const ART = {
    chest(open, big, col) {
      return img('chest' + open + big + col, big ? 22 : 16, big ? 18 : 15, (b) => {
        const w = big ? 22 : 16, h = big ? 18 : 15, r = R(col || (big ? '#8a3a5a' : '#a8703a'));
        const lid = big ? 7 : 6;
        b.rect(0, lid, w, h - lid, r[1]); b.rect(1, lid, w - 2, h - lid - 1, r[2]); b.rect(1, lid, 3, h - lid - 2, r[3]);
        b.hline(0, w - 1, lid + 3, '#e8c860'); b.vline(3, lid, h - 1, '#c8a040'); b.vline(w - 4, lid, h - 1, '#c8a040');
        if (!open) {
          b.rect(0, 1, w, lid, r[2]); b.rect(1, 1, w - 2, 2, r[3]); b.hline(0, w - 1, 0, r[1]); b.hline(0, w - 1, lid - 1, r[0]);
          b.rect((w >> 1) - 2, lid - 2, 4, 5, '#e8c860'); b.px((w >> 1) - 1, lid, '#6a4a10'); b.px(w >> 1, lid, '#6a4a10');
          if (big) { b.vline(3, 1, lid, '#e8c860'); b.vline(w - 4, 1, lid, '#e8c860'); }
        } else {
          b.rect(1, lid - 1, w - 2, 3, '#1a0e0a'); b.rect(0, 0, w, 2, r[1]); b.hline(1, w - 2, 0, r[3]);
        }
      });
    },
    sign() { return img('sign', 16, 16, (b) => { b.vline(7, 8, 15, '#5a3a22'); b.vline(8, 8, 15, '#7a5232'); b.rect(1, 1, 14, 9, '#a8784a'); b.rect(2, 2, 12, 7, '#c8985a'); b.hline(3, 12, 4, '#6a4a2a'); b.hline(3, 10, 6, '#6a4a2a'); }); },
    stone() { return img('stone', 14, 18, (b) => { b.rect(2, 3, 10, 15, '#7a7890'); b.rect(3, 3, 8, 14, '#9a98b0'); b.ellipse(7, 3, 5, 3, '#9a98b0'); b.rect(3, 2, 3, 12, '#b8b8d0'); b.hline(4, 9, 7, '#5a5870'); b.hline(4, 8, 9, '#5a5870'); b.hline(4, 9, 11, '#5a5870'); b.px(10, 16, '#5a8a4a'); b.px(2, 17, '#5a8a4a'); }); },
    pot(v) { return img('pot' + v, 12, 13, (b) => { const r = R(v ? '#8a6ad8' : '#c87a4a'); b.ellipse(6, 8, 5.5, 4.5, r[1]); b.ellipse(6, 7.5, 4.8, 3.8, r[2]); b.ellipse(4.5, 6.5, 1.8, 2.5, r[3]); b.rect(3, 1, 6, 3, r[1]); b.hline(3, 8, 1, r[3]); b.rect(4, 2, 4, 1, '#2a1a10'); b.hline(1, 10, 9, r[0]); }); },
    block(col) { return img('block' + col, 16, 20, (b) => { const r = R(col || '#8a8098'); b.rect(0, 4, 16, 16, r[1]); b.rect(0, 0, 16, 5, r[3]); b.rect(1, 1, 14, 3, r[4]); b.rect(2, 6, 12, 12, r[2]); b.hline(2, 13, 6, r[3]); b.rect(6, 10, 4, 4, r[1]); b.px(7, 11, r[3]); }); },
    torch(lit) { return img('torch' + lit, 10, 18, (b) => { b.rect(3, 8, 4, 10, '#5a5060'); b.rect(3, 8, 1, 10, '#8a8098'); b.rect(1, 6, 8, 3, '#7a7088'); b.hline(1, 8, 6, '#a8a0b8'); b.rect(2, 4, 6, 2, '#3a3040'); }); },
    plate(down) { return img('plate' + down, 16, 16, (b) => { b.rect(1, 1, 14, 14, '#4a4058'); b.rect(2, down ? 3 : 2, 12, 11, down ? '#6a8a5a' : '#8a8a9a'); if (!down) b.hline(2, 13, 2, '#b8b8c8'); b.rect(6, 6 + (down ? 1 : 0), 4, 4, down ? '#8ae07a' : '#c8c8d8'); }); },
    crystal(on) { return img('crys' + on, 12, 18, (b) => { const c = on ? '#6ad8ff' : '#ff6a9a'; const r = R(c); b.rect(3, 12, 6, 6, '#5a5068'); b.hline(2, 9, 12, '#8a8098'); for (let y = 0; y < 12; y++) { const w = y < 6 ? y : 11 - y; b.hline(6 - Math.floor(w / 1.3), 5 + Math.ceil(w / 1.3), y, r[2]); } b.vline(5, 2, 9, r[4]); b.vline(6, 3, 8, r[3]); }); },
    cblock(on, col) { return img('cb' + on + col, 16, on ? 20 : 16, (b) => { const r = R(col); if (on) { b.rect(0, 4, 16, 16, r[1]); b.rect(0, 0, 16, 5, r[3]); b.rect(2, 6, 12, 12, r[2]); b.rect(5, 9, 6, 6, r[3]); } else { b.rect(1, 1, 14, 14, r[0]); b.rect(3, 3, 10, 10, r[1]); b.hline(3, 12, 3, r[2]); } }); },
    post() { return img('post', 10, 18, (b) => { b.rect(3, 4, 4, 14, '#7a5232'); b.rect(3, 4, 1, 14, '#a8784a'); b.ellipse(5, 4, 4, 3, '#c8c8d8'); b.ellipse(5, 3.5, 2.5, 1.8, '#ffffff'); b.px(5, 4, '#6a6a7a'); }); },
    waystone(on) { // 빛의 이정표: 룬을 새긴 받침돌 위에 떠 있는 수정
      return img('way2' + on, 20, 34, (b) => {
        const C = on ? ['#1a4a78', '#3a8ad8', '#8ad8ff', '#e8fbff'] : ['#3a3448', '#5a5068', '#7a7090', '#a8a0b8'];
        // 받침돌
        b.ellipse(10, 29, 8.5, 4, '#2a2436'); b.rect(2, 26, 17, 4, '#4a4258'); b.ellipse(10, 26, 8.5, 3.2, '#6a6078'); b.ellipse(10, 25.5, 6.5, 2.2, '#847a94');
        for (const x of [4, 8, 12, 16]) b.px(x, 28, on ? '#8ad8ff' : '#5a5068');
        // 떠 있는 수정 (다이아몬드, 면을 나눠 칠한다)
        for (let y = 2; y <= 20; y++) { const hw = Math.round(y <= 9 ? (y - 2) * 5 / 7 : (20 - y) * 5 / 11); for (let x = 10 - hw; x <= 10 + hw; x++) b.px(x, y, x < 10 ? (y < 9 ? C[2] : C[1]) : (y < 9 ? C[3] : C[2])); b.px(10 - hw, y, C[0]); b.px(10 + hw, y, C[0]); }
        b.vline(10, 3, 19, on ? '#ffffff' : C[3]); b.px(8, 6, '#ffffff'); b.px(7, 8, on ? '#ffffff' : C[3]);
        // 수정 밑 그림자 (떠 있음)
        b.hline(8, 12, 23, on ? '#5ab8ff' : '#3a3448');
      });
    },
    crack() { return img('crack', 16, 16, (b) => { b.line(3, 2, 7, 7, '#1a1020'); b.line(7, 7, 5, 12, '#1a1020'); b.line(7, 7, 12, 9, '#1a1020'); b.line(12, 9, 14, 14, '#1a1020'); b.px(8, 8, '#2a2030'); }); },
    heart(big) { return img('hc' + big, big ? 14 : 10, big ? 13 : 9, (b) => { const rows = big ? ['  rrr   rrr  ', ' rwwrr rrrrr ', 'rwwrrrrrrrrrr', 'rwrrrrrrrrrrr', 'rrrrrrrrrrrrr', ' rrrrrrrrrrr ', '  rrrrrrrrr  ', '   rrrrrrr   ', '    rrrrr    ', '     rrr     ', '      r      '] : [' rr  rr ', 'rwrrrrrr', 'rrrrrrrr', 'rrrrrrrr', ' rrrrrr ', '  rrrr  ', '   rr   ']; b.stamp(0, 0, rows, { r: '#ff3a5a', w: '#ffd0d8' }); if (!big) { b.px(7, 1, '#1a1020'); b.px(7, 2, '#1a1020'); b.px(6, 3, '#1a1020'); } }); },
    bed(col) { col = col || '#5a8ad8'; return img('bed' + col, 16, 26, (b) => { const r = X.ramp(col, 5); b.rect(0, 0, 16, 26, '#6a4424'); b.rect(1, 1, 14, 24, '#e8e0cc'); b.rect(2, 2, 12, 6, '#ffffff'); b.hline(2, 13, 7, '#d8d0c0'); b.rect(1, 10, 14, 15, r[2]); b.hline(1, 14, 10, r[3]); b.rect(1, 18, 14, 1, r[1]); b.rect(1, 22, 14, 3, r[1]); }); },
    pedestal() { return img('ped', 20, 20, (b) => { b.rect(1, 10, 18, 10, '#6a6480'); b.rect(2, 10, 16, 3, '#9a98b0'); b.rect(3, 14, 14, 5, '#5a5470'); b.hline(0, 19, 19, '#3a3448'); b.ellipse(10, 11, 3, 1.5, '#2a2438'); }); },
  };

  /* ───────── 소품 공통 ───────── */
  class Prop extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'prop', solid: true, bw: 14, bh: 10, prop: true }, o)); }
    blockBox() { return this.solid ? { x: this.x - this.bw / 2, y: this.y - this.bh, w: this.bw, h: this.bh } : null; }
    get key() { return (this.flagKey || ('p:' + (W().map ? W().map.id : '') + ':' + (this.pid || (this.tx + ',' + this.ty)))); }
    drawShadow(g, cx, cy) { if (!this.shadowW) return; g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), this.shadowW, this.shadowW * 0.35, 0, 0, Math.PI * 2); g.fill(); }
    drawImg(g, cx, cy, im, oy) { g.drawImage(im, Math.round(this.x - cx - im.width / 2), Math.round(this.y - cy - im.height + (oy || 0))); }
  }

  /** 상자: item(아이템 id) · gold · 열쇠. big이면 큰 열쇠가 있어야 열린다 */
  class Chest extends Prop {
    constructor(o) {
      super(Object.assign({ bw: 14, bh: 8, shadowW: 8, big: false }, o)); this.opened = flag(this.key); if (this.hiddenUntil && !flag(this.hiddenUntil)) this.hidden = true;
      // 큰 열쇠가 든 상자는 크고 붉게 보이지만 잠겨 있지 않다 (예전: 큰 상자라서 큰 열쇠가 있어야 열려 — 큰 열쇠를 영영 못 얻던 것)
      this.keyChest = this.item === 'key_big';
      if (this.keyChest) { this.big = true; this.col = this.col || '#b83a3a'; }
      // 큰 열쇠로 잠근 보물 상자는 두지 않는다 — 귀한 것은 빛깔로 (영웅 보라 · 전설 금빛)
      else if (this.big) { this.big = false; const it = G.data.ITEMS[this.item]; const gr = it && it.grade || 0; if (!this.col) this.col = gr >= 5 ? '#d8a020' : gr >= 4 ? '#7a4ab8' : gr >= 3 ? '#3a6ab8' : null; }
    }
    update(dt) { this.t += dt; if (this.hidden && this.hiddenUntil && flag(this.hiddenUntil)) { this.hidden = false; this.appear = 0.8; sfx('puzzle'); G.fx.glow(this.x, this.y - 6, '#fff2a8', 18); } if (this.appear > 0) this.appear -= dt; }
    reveal() { if (this.hidden && this.revealKey) { S().flags[this.revealKey] = true; this.hiddenUntil = this.revealKey; } }
    canUse(p) { return !this.opened && !this.hidden && (p.dir === 'up' || this.anyDir); }
    get label() { return '연다'; }
    use(p) {
      const s = S(), m = W().map;
      if (this.big && !this.keyChest && m.dungeon && !s.bigkeys[m.dungeon]) { G.ui.toast('큰 열쇠로 잠긴 상자 — 이 던전의 큰 열쇠가 있어야 열린다', 'bad'); sfx('buzz'); return; }
      this.opened = true; setFlag(this.key);
      sfx('chest');
      G.script.run(async (c) => { await c.getItem(this.item, this.n || 1, { chest: this }); });
    }
    draw(g, cx, cy) {
      if (this.hidden) return;
      if (this.appear > 0) g.globalAlpha = 1 - this.appear;
      this.drawImg(g, cx, cy, ART.chest(this.opened, this.big, this.col), 1);
      g.globalAlpha = 1;
      if (!this.opened && Math.sin(this.t * 2) > 0.95) { g.fillStyle = '#fff'; g.fillRect(Math.round(this.x - cx + 4), Math.round(this.y - cy - 12), 1, 1); }
      // 큰 열쇠 상자: 뚜껑에 열쇠 문양 + 반짝임
      if (this.keyChest && !this.opened) {
        const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 14);
        g.fillStyle = '#ffe066'; g.fillRect(x - 4, y, 3, 3); g.fillRect(x - 1, y + 1, 6, 1); g.fillRect(x + 3, y + 2, 1, 1); g.fillStyle = '#ff5a6a'; g.fillRect(x - 3, y + 1, 1, 1);
        if (Math.sin(this.t * 3.2) > 0.7) { g.globalAlpha = 0.5; g.fillStyle = '#fff2a8'; g.fillRect(x - 9, y - 4, 1, 3); g.fillRect(x - 10, y - 3, 3, 1); g.globalAlpha = 1; }
      }
    }
  }

  /** 표지판 · 비석 · 글 새긴 돌 */
  class Sign extends Prop {
    constructor(o) { super(Object.assign({ bw: 12, bh: 6, shadowW: 6 }, o)); }
    canUse(p) { return p.dir !== 'down' || this.anyDir; }
    get label() { return '읽는다'; }
    use() { const t = this.text; G.script.run(async (c) => { if (typeof t === 'function') await t(c); else await c.say(null, t, { style: 'sys' }); }); }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, this.look === 'stone' ? ART.stone() : ART.sign(), 1); }
  }

  /** 문: lock = 'key'(작은 열쇠) · 'big'(큰 열쇠) · 'switch'(깃발로 열림) · 'clear'(방의 적을 다 쓰러뜨리면) · 'story'(깃발) */
  class Door extends Prop {
    constructor(o) {
      super(Object.assign({ bw: 16, bh: 16, lock: 'key', open: false }, o));
      this.open = flag(this.key) || (this.lock === 'switch' || this.lock === 'story') && this.flagOpen && flag(this.flagOpen);
      this.anim = this.open ? 1 : 0;
      this.solid = !this.open;
    }
    blockBox() { return this.solid ? { x: this.x - 8, y: this.y - 16, w: 16, h: 16 } : null; }
    update(dt) {
      this.t += dt;
      const shouldOpen = this.open;
      if (!this.open && (this.lock === 'switch' || this.lock === 'story') && this.flagOpen && flag(this.flagOpen)) this.openUp(true);
      if (!this.open && this.lock === 'clear' && this.room) {
        const alive = G.combat.foes().some((e) => e.room === this.room);
        if (!alive && this.armed) this.openUp(true);
      }
      if (this.lock === 'clear' && this.room && !this.armed) { const p = W().player; if (p && this.inRoom && this.inRoom(p)) { this.armed = true; if (!this.open) { /* 이미 닫혀 있음 */ } } }
      this.anim = U.approach(this.anim, shouldOpen ? 1 : 0, dt * 4);
    }
    openUp(silent) {
      if (this.open) return;
      this.open = true; this.solid = false; setFlag(this.key);
      sfx(silent ? 'door' : 'unlock');
      if (silent) G.fx.dust(this.x, this.y, 6);
    }
    canUse() { return !this.open && (this.lock === 'key' || this.lock === 'big'); }
    get label() { return '연다'; }
    use() {
      const s = S(), m = W().map, d = m.dungeon;
      if (this.lock === 'key') {
        if ((s.keys[d] || 0) > 0) { s.keys[d]--; this.openUp(); G.fx.sparks(this.x, this.y - 8, 8, '#e8c850'); }
        else { G.ui.toast('작은 열쇠가 필요하다', 'bad'); sfx('buzz'); }
      } else if (this.lock === 'big') {
        if (s.bigkeys[d]) { this.openUp(); G.fx.sparks(this.x, this.y - 8, 14, '#e8c850'); W().shake(2, 0.3); }
        else { G.ui.toast('큰 열쇠가 필요하다', 'bad'); sfx('buzz'); }
      }
    }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx - 8), y = Math.round(this.y - cy - 16);
      if (this.anim >= 1) return;
      const k = this.anim;
      const hgt = Math.round(16 * (1 - k));
      const col = this.lock === 'big' ? '#8a3a5a' : this.lock === 'key' ? '#8a5a2a' : '#5a5470';
      g.fillStyle = '#140c1c'; g.fillRect(x, y + 16 - hgt - 4, 16, hgt + 4);
      g.fillStyle = col; g.fillRect(x + 1, y + 16 - hgt - 3, 14, hgt + 2);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + 1, y + 16 - hgt - 3, 14, 2);
      if (hgt > 8) {
        if (this.lock === 'key') { g.fillStyle = '#e8c850'; g.fillRect(x + 6, y + 6, 4, 5); g.fillStyle = '#140c1c'; g.fillRect(x + 7, y + 8, 2, 2); }
        else if (this.lock === 'big') { g.fillStyle = '#e8c850'; g.fillRect(x + 4, y + 4, 8, 8); g.fillStyle = '#d83a5a'; g.fillRect(x + 6, y + 6, 4, 4); }
        else { g.fillStyle = '#8a8098'; for (let i = 0; i < 3; i++) g.fillRect(x + 3 + i * 4, y + 16 - hgt - 2, 2, hgt); }
      }
    }
  }

  /** 발판 스위치: 주인공 · 블록이 올라가면 깃발 (hold면 떠나면 꺼짐) */
  class Plate extends Prop {
    constructor(o) { super(Object.assign({ solid: false, bw: 12, bh: 12, hold: false }, o)); this.down = !this.hold && flag(this.sets); }
    update(dt) {
      this.t += dt;
      const p = W().player;
      const on = (p && !p.jz && Math.abs(p.x - this.x) < 7 && Math.abs(p.y - 6 - (this.y - 8)) < 7) || W().ents.some((e) => e.pushable && Math.abs(e.x - this.x) < 6 && Math.abs(e.y - this.y) < 6);
      if (on && !this.down) { this.down = true; sfx('switch'); if (this.sets) setFlag(this.sets); if (this.onPress) this.onPress(); }
      else if (!on && this.down && this.hold) { this.down = false; sfx('click'); if (this.sets) setFlag(this.sets, false); }
    }
    draw() {}
    drawShadow(g, cx, cy) { const im = ART.plate(this.down); g.drawImage(im, Math.round(this.x - cx - 9), Math.round(this.y - cy - 17)); }
  }

  /** 수정 스위치: 치면 색 블록이 바뀐다 (던전 전체 깃발) */
  class Crystal extends Prop {
    constructor(o) { super(Object.assign({ bw: 10, bh: 6, shadowW: 5 }, o)); }
    get on() { return !!S().flags['crys:' + (W().map.dungeon || W().map.id)]; }
    toggle() { if (this.cool > 0) return; this.cool = 0.4; const k = 'crys:' + (W().map.dungeon || W().map.id); S().flags[k] = !S().flags[k]; sfx('crystal'); G.fx.sparks(this.x, this.y - 10, 10, this.on ? '#6ad8ff' : '#ff6a9a'); W().shake(1, 0.1); }
    update(dt) { this.t += dt; if (this.cool > 0) this.cool -= dt; }
    swordHit() { this.toggle(); }
    shotHit() { this.toggle(); return true; }
    bombed() { this.toggle(); }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.crystal(this.on), 1); if (Math.sin(this.t * 3) > 0.6) { g.fillStyle = '#fff'; g.fillRect(Math.round(this.x - cx - 1), Math.round(this.y - cy - 14), 1, 1); } }
  }
  /** 색 블록: 수정 스위치 상태에 따라 솟거나 가라앉는다 */
  class ColorBlock extends Prop {
    constructor(o) { super(Object.assign({ bw: 16, bh: 16, blue: true }, o)); }
    get up() { const on = !!S().flags['crys:' + (W().map.dungeon || W().map.id)]; return this.blue ? !on : on; }
    blockBox() { return this.up ? { x: this.x - 8, y: this.y - 16, w: 16, h: 16 } : null; }
    get solid() { return this.up; } set solid(v) { /* 계산값 */ }
    draw(g, cx, cy) { const im = ART.cblock(this.up, this.blue ? '#4a8ad8' : '#d84a7a'); g.drawImage(im, Math.round(this.x - cx - im.width / 2), Math.round(this.y - cy - im.height + 1)); }
  }

  /** 밀 수 있는 블록: 한 방향으로 0.4초 밀면 한 칸 */
  class Block extends Prop {
    constructor(o) { super(Object.assign({ bw: 16, bh: 16, pushable: true, once: false }, o)); this.pushT = 0; this.moving = null; }
    blockBox() { return { x: this.x - 8, y: this.y - 16, w: 16, h: 16 }; }
    update(dt) {
      this.t += dt;
      if (this.moving) {
        const mv = this.moving; mv.t += dt;
        const k = Math.min(1, mv.t / 0.3);
        this.x = U.lerp(mv.x0, mv.x1, k); this.y = U.lerp(mv.y0, mv.y1, k);
        if (k >= 1) { this.moving = null; if (this.onMoved) this.onMoved(this); const hz = W().map.hazardAt(this.x, this.y - 8); if (hz === 'pit') { this.dead = true; sfx('fall'); G.fx.dust(this.x, this.y, 8); } }
        return;
      }
      const p = W().player;
      if (!p || p.state !== 'walk' || (this.once && this.moved)) { this.pushT = 0; return; }
      const [ux, uy] = U.DV[p.dir];
      const fx = p.x + ux * 7, fy = p.y - 3 + uy * 5;
      if (Math.abs(fx - this.x) < 9 && fy > this.y - 17 && fy < this.y + 1) {
        this.pushT += dt;
        if (this.pushT > 0.4) {
          this.pushT = 0;
          const nx = this.x + ux * 16, ny = this.y + uy * 16;
          const m = W().map;
          const tx = Math.floor(nx / TS), ty = Math.floor((ny - 8) / TS);
          const free = !m.blocked(tx, ty) && m.H(tx, ty) === this.z && !W().ents.some((e) => e !== this && e.solid && !e.dead && e.blockBox && (() => { const b = e.blockBox(); return b && Math.abs(b.x + b.w / 2 - nx) < 12 && Math.abs(b.y + b.h - ny) < 12; })());
          if (free) { this.moving = { x0: this.x, y0: this.y, x1: nx, y1: ny, t: 0 }; this.moved = true; sfx('block'); G.fx.dust(this.x, this.y, 3); }
        }
      } else this.pushT = 0;
    }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.block(this.col), 1); }
  }

  /** 횃불: 불로 켠다. 켜진 수를 세는 퍼즐에 쓴다 */
  class Torch extends Prop {
    constructor(o) { super(Object.assign({ bw: 8, bh: 6, shadowW: 4 }, o)); this.lit = this.alwaysLit || (this.sets ? false : false) || flag(this.key); this.light = { x: this.x, y: this.y - 16, r: 54, on: this.lit, warm: 'rgba(255,170,80,0.18)' }; }
    update(dt) {
      this.t += dt;
      const m = W().map;
      if (!this.addedLight) { this.addedLight = true; m.lights = m.lights || []; m.lights.push(this.light); }
      this.light.on = this.lit;
      if (this.lit && this.burn != null) { this.left = (this.left == null ? this.burn : this.left) - dt; if (this.left <= 0) { this.lit = false; this.left = null; sfx('melt'); } }
      if (this.lit && Math.random() < dt * 12) G.fx.part({ x: this.x + (Math.random() - 0.5) * 3, y: this.y, z: 17, vz: 18, g: 0, life: 0.4, col: Math.random() < 0.5 ? '#ffb040' : '#ffe080', size: 1, glow: true });
    }
    ignite() { if (this.lit) return; this.lit = true; sfx('fire'); G.fx.sparks(this.x, this.y - 16, 8, '#ffb040'); if (!this.burn) setFlag(this.key); if (this.onLit) this.onLit(this); }
    shotHit(sh) { if (sh.el === 'fire') { this.ignite(); return true; } return false; }
    swordHit() { if (S().equip.sword === 'sw_flame') this.ignite(); }
    draw(g, cx, cy) {
      this.drawImg(g, cx, cy, ART.torch(this.lit), 1);
      if (this.lit) {
        const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 18);
        const f = Math.floor(this.t * 10) % 3;
        g.fillStyle = '#ff7a2a'; g.fillRect(x - 3, y - 2, 6, 4); g.fillRect(x - 2, y - 5 - f, 4, 4);
        g.fillStyle = '#ffd84a'; g.fillRect(x - 2, y - 1, 4, 3); g.fillRect(x - 1, y - 3 - f, 2, 3);
        g.fillStyle = '#ffffff'; g.fillRect(x - 1, y, 2, 1);
      }
    }
  }

  /** 항아리: 들어서 던진다 · 베면 깨진다 */
  class Pot extends Prop {
    constructor(o) { super(Object.assign({ bw: 12, bh: 7, shadowW: 6 }, o)); }
    breakIt() { this.dead = true; sfx('rock'); G.fx.shards(this.x, this.y - 5, 8, '#c87a4a'); this.dropLoot(); }
    dropLoot() {
      const r = Math.random(), C = G.combat;
      if (this.drop) { C.spawnPickup(this.x, this.y, this.drop.what, this.drop.n, this.drop.id); return; }
      if (r < 0.25) C.spawnPickup(this.x, this.y, 'heart', 4); else if (r < 0.5) C.spawnPickup(this.x, this.y, 'gold', 2 + Math.floor(Math.random() * 4)); else if (r < 0.6 && S().tools.bow) C.spawnPickup(this.x, this.y, 'arrow', 5); else if (r < 0.66 && Object.keys(S().spells).length) C.spawnPickup(this.x, this.y, 'mp', 10);
    }
    swordHit() { this.breakIt(); }
    bombed() { this.breakIt(); }
    get bombable() { return true; }
    canUse(p) { return !p.carry; }
    get label() { return '든다'; }
    use(p) { this.dead = true; p.carry = { o: 0, img: ART.pot(this.v || 0), pot: this }; p.setState('lift'); sfx('lift'); }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.pot(this.v || 0), 1); }
  }

  /** 금 간 벽 / 바위: 폭탄으로 연다 (길이 생긴다) */
  class Crack extends Prop {
    constructor(o) { super(Object.assign({ solid: false, bw: 16, bh: 16 }, o)); this.done = flag(this.key); if (this.done) this.apply(); }
    get bombable() { return !this.done; }
    bombed() { if (this.done) return; this.done = true; setFlag(this.key); this.apply(); sfx('puzzle'); G.fx.shards(this.x, this.y - 8, 16, '#8a8098'); if (this.onOpen) this.onOpen(); }
    apply() { const m = W().map; if (!m) return; for (const [tx, ty, t] of (this.cells || [])) m.setT(tx, ty, t); for (const [tx, ty] of (this.clearObj || [])) m.setO(tx, ty, 0); }
    draw(g, cx, cy) { if (this.done) return; const im = ART.crack(); g.drawImage(im, Math.round(this.x - cx - 8), Math.round(this.y - cy - 16 - (this.wallUp || 0))); }
  }

  /** 갈고리 말뚝 */
  class Post extends Prop {
    constructor(o) { super(Object.assign({ bw: 8, bh: 6, shadowW: 4, hookable: true }, o)); }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.post(), 1); }
  }

  /** 빛의 이정표: 한 번 만지면 빠른 이동 · 기록 · 회복 */
  class Waystone extends Prop {
    constructor(o) { super(Object.assign({ bw: 12, bh: 7, shadowW: 7 }, o)); }
    get on() { return !!S().waystones[this.wid]; }
    update(dt) { this.t += dt; this.glowR = this.on ? 40 + Math.sin(this.t * 2) * 4 : 0; if (this.on && Math.random() < dt * 4) G.fx.part({ x: this.x + (Math.random() - 0.5) * 8, y: this.y, z: 4 + Math.random() * 20, vz: 14, g: 0, life: 1, col: '#8ad8ff', size: 1, glow: true }); }
    canUse() { return true; }
    get label() { return this.on ? '쉰다 · 이동' : '손을 댄다'; }
    use(p) {
      const s = S();
      if (!this.on) {
        s.waystones[this.wid] = { map: W().map.id, x: this.x, y: this.y + 12, name: this.name };
        sfx('warp'); G.fx.ring(this.x, this.y - 12, '#8ad8ff', 40, 0.8, 2); G.fx.glow(this.x, this.y - 14, '#d8f4ff', 30);
        G.ui.toast('빛의 이정표 「' + this.name + '」에 불이 들어왔다', 'white');
      }
      s.respawn = { map: W().map.id, x: this.x, y: this.y + 12 };
      const d = G.st.derive(s);
      s.hp = d.hpMax; s.mp = d.mpMax; p.stamina = p.staminaMax; delete s.flags.revived;
      G.st.save(s);
      sfx('save');
      if (G.ui.waystoneMenu) G.ui.waystoneMenu(this);
    }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.waystone(this.on), 1); }
  }

  /** 하트 그릇 · 하트 조각 (보스를 쓰러뜨린 뒤 · 숨은 곳) */
  class HeartItem extends Prop {
    constructor(o) { super(Object.assign({ solid: false, bw: 10, bh: 8 }, o)); if (flag(this.key)) this.dead = true; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player;
      if (p && U.dist(p.x, p.y - 4, this.x, this.y - 6) < 10) {
        this.dead = true; setFlag(this.key);
        G.script.run(async (c) => { await c.getItem(this.piece ? 'heartpiece' : 'heart_c', 1, {}); });
      }
    }
    draw(g, cx, cy) { const im = ART.heart(!this.piece); g.drawImage(im, Math.round(this.x - cx - im.width / 2), Math.round(this.y - cy - im.height - 4 + Math.sin(this.t * 3) * 2)); }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(Math.round(this.x - cx - 4), Math.round(this.y - cy - 1), 8, 2); }
  }

  /** 침대 · 쉼터: 쉬면 회복 · 저장 */
  class Bed extends Prop {
    constructor(o) { super(Object.assign({ bw: 16, bh: 22 }, o)); }
    blockBox() { return this.solid === false ? null : { x: this.x - 8, y: this.y - 24, w: 16, h: 24 }; }
    canUse() { return true; }
    get label() { return '쉰다'; }
    use() { G.script.run(async (c) => { if (this.onRest) await this.onRest(c); else await c.rest(); }); }
    draw(g, cx, cy) { this.drawImg(g, cx, cy, ART.bed(this.col), 1); }
  }

  /** 그냥 조사하는 곳 (책장 · 창문 · 벽의 빗금 …): 그림 없음 */
  class Spot extends Prop {
    constructor(o) { super(Object.assign({ solid: false, bw: 14, bh: 14 }, o)); }
    canUse(p) { return !this.when || this.when(p); }
    get label() { return this.verb || '살펴본다'; }
    use() { const t = this.text; G.script.run(async (c) => { if (typeof t === 'function') await t(c); else await c.say(null, t, { style: 'sys' }); }); }
    draw(g, cx, cy) { if (this.sparkle && !flag(this.key + ':seen') && Math.sin(W().t * 3 + this.x) > 0.7) { g.fillStyle = '#fff8c0'; g.fillRect(Math.round(this.x - cx), Math.round(this.y - cy - 10), 1, 1); g.fillRect(Math.round(this.x - cx) - 1, Math.round(this.y - cy - 9), 3, 1); } }
  }

  /** 검이 꽂힌 받침대 (연출용) */
  class Pedestal extends Prop {
    constructor(o) { super(Object.assign({ bw: 16, bh: 10, shadowW: 9 }, o)); }
    canUse() { return !!this.onUse; }
    get label() { return this.verb || '잡는다'; }
    use(p) { if (this.onUse) G.script.run(async (c) => this.onUse(c, p)); }
    draw(g, cx, cy) {
      this.drawImg(g, cx, cy, ART.pedestal(), 1);
      if (this.sword) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 10); g.fillStyle = '#e8e8f0'; g.fillRect(x - 1, y - 16, 2, 14); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 16, 1, 14); g.fillStyle = '#e8c860'; g.fillRect(x - 4, y - 18, 8, 2); g.fillStyle = '#6a4424'; g.fillRect(x - 1, y - 23, 2, 5); g.fillStyle = '#8ad8ff'; g.fillRect(x - 1, y - 24, 2, 1); if (Math.sin(W().t * 2) > 0.5) { g.globalAlpha = 0.4; g.fillStyle = '#fff'; g.fillRect(x - 3, y - 18, 6, 18); g.globalAlpha = 1; } }
    }
  }

  /* ───────── 마을 사람 ───────── */
  class NPC extends E.Ent {
    constructor(o) {
      super(Object.assign({ kind: 'npc', bw: 10, bh: 6, solid: true, npc: true, wanderR: 0, speed: 26, look: {}, name: '', talk: null }, o));
      this.home = { x: this.x, y: this.y };
      this.state = 'idle'; this.st = 0; this.walkT = 0; this.aT = 1 + Math.random() * 3;
      this.blinkSeed = Math.random() * 3;
      this.baseDir = this.dir;
    }
    blockBox() { return this.hidden ? null : { x: this.x - 5, y: this.y - 6, w: 10, h: 6 }; }   // 숨은 사람은 길을 막지 않는다
    update(dt, Wd) {
      this.t += dt; this.st += dt;
      if (this.hideIf && this.hideIf()) { this.hidden = true; return; }
      this.hidden = false;
      if (this.script) return;              // 연출이 움직이는 중
      if (this.barkT > 0) this.barkT -= dt;
      const p = Wd.player;
      const near = p && U.dist(p.x, p.y, this.x, this.y) < 40;
      if (near && this.lookAt !== false && !this.busy) { this.dir = U.dir4(p.x - this.x, p.y - this.y, this.dir); if (this.state === 'walk') this.state = 'idle'; }
      else if (this.wanderR && !this.busy) {
        this.aT -= dt;
        if (this.aT <= 0) { this.aT = 1.5 + Math.random() * 3; if (Math.random() < 0.5) { const a = Math.random() * Math.PI * 2; this.wdir = [Math.cos(a), Math.sin(a)]; } else this.wdir = null; if (U.dist(this.x, this.y, this.home.x, this.home.y) > this.wanderR) this.wdir = U.norm(this.home.x - this.x, this.home.y - this.y); }
        if (this.wdir) {
          const r = E.move(Wd.map, this, this.wdir[0] * this.speed * dt, this.wdir[1] * this.speed * dt);
          this.dir = U.dir4(this.wdir[0], this.wdir[1], this.dir); this.state = 'walk'; this.walkT += dt; this.vx = this.wdir[0] * this.speed; this.vy = this.wdir[1] * this.speed;
          if (r.hitX || r.hitY || (p && U.dist(p.x, p.y, this.x, this.y) < 16)) { this.wdir = null; this.state = 'idle'; }
        } else { this.state = 'idle'; this.vx = this.vy = 0; }
      } else if (!near && this.baseDir && !this.busy) this.dir = this.baseDir;
      // 지나가면 한마디
      if (this.barks && near && !(this.barkT > 0) && !G.script.running) { this.barkT = 12 + Math.random() * 8; const b = typeof this.barks === 'function' ? this.barks() : U.pick(this.barks); if (b && G.cine) G.cine.bubble(this, b, { life: 2.6 }); }
    }
    canUse() { return !!this.talk && !this.hidden; }
    get label() { return this.verb || '말 건다'; }
    use(p) {
      const t = this.talk;
      this.dir = U.dir4(p.x - this.x, p.y - this.y, this.dir);
      G.script.run(async (c) => { this.busy = true; try { if (typeof t === 'function') await t(c, this); else if (Array.isArray(t)) { for (const line of t) await c.say(this, line); } else await c.say(this, t); } finally { this.busy = false; } });
    }
    drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.26)'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 1), 6, 2.4, 0, 0, Math.PI * 2); g.fill(); }
    draw(g, cx, cy) {
      if (this.drawFn) { this.drawFn(g, cx, cy); return; }
      if (this.vision) {   // 빛으로 떠오른 모습 (멀리 있는 사람)
        const a = 0.55 + Math.sin(this.t * 3) * 0.12;
        g.globalAlpha = 0.28; g.fillStyle = '#fff2a8'; g.beginPath(); g.ellipse(Math.round(this.x - cx), Math.round(this.y - cy - 14), 12, 20, 0, 0, Math.PI * 2); g.fill();
        g.globalAlpha = a; G.sprites.drawChar(g, this, cx, cy); g.globalAlpha = 1;
        if (Math.random() < 0.3) G.fx.part({ x: this.x + (Math.random() - 0.5) * 12, y: this.y, z: Math.random() * 28, vz: 16, g: 0, life: 0.6, col: '#fff2a8', size: 1, glow: true });
      } else G.sprites.drawChar(g, this, cx, cy);
      // 머리 위 표시: 퀘스트 (!) · 중요 (◆)
      const mark = this.mark ? (typeof this.mark === 'function' ? this.mark() : this.mark) : null;
      if (mark) {
        const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 38 + Math.sin(W().t * 4) * 1.5);
        g.fillStyle = '#140c1c'; g.fillRect(x - 2, y - 1, 5, 9);
        g.fillStyle = mark === '!' ? '#ffcc4a' : mark === '?' ? '#8ad8ff' : '#ffffff';
        if (mark === '!') { g.fillRect(x - 1, y, 3, 5); g.fillRect(x - 1, y + 6, 3, 1); }
        else if (mark === '?') { g.fillRect(x - 1, y, 3, 1); g.fillRect(x + 1, y + 1, 1, 2); g.fillRect(x, y + 3, 1, 2); g.fillRect(x, y + 6, 1, 1); }
        else if (mark === '♪') { g.fillStyle = '#140c1c'; g.fillRect(x - 3, y - 1, 7, 9); g.fillStyle = '#ff9ad8'; g.fillRect(x + 1, y, 1, 5); g.fillRect(x + 2, y, 1, 1); g.fillRect(x + 3, y + 1, 1, 1); g.fillRect(x - 1, y + 4, 3, 2); g.fillStyle = '#ffd8f0'; g.fillRect(x - 1, y + 4, 1, 1); }
        else { g.fillRect(x, y + 1, 1, 5); g.fillRect(x - 1, y + 2, 3, 3); }
      }
      if (this.emote) drawEmote(g, this, cx, cy);
    }
  }
  /** 감정 표시: ! ? ♪ … 💢 */
  function drawEmote(g, e, cx, cy) {
    const em = e.emote; em.t = (em.t || 0) + 1 / 60;
    if (em.t > (em.life || 1.2)) { e.emote = null; return; }
    const x = Math.round(e.x - cx), y = Math.round(e.y - cy - 36 - Math.min(4, em.t * 30));
    g.fillStyle = '#fff8e8'; g.fillRect(x - 5, y - 6, 11, 10); g.fillRect(x - 1, y + 4, 3, 2);
    g.strokeStyle = '#1e1628'; g.strokeRect(x - 5.5, y - 6.5, 12, 11);
    const GL = { '!': ['010', '010', '010', '000', '010'], '?': ['111', '001', '010', '000', '010'], '♪': ['011', '010', '010', '110', '110'], '…': ['000', '000', '000', '000', '101'], '💢': ['101', '010', '101', '000', '000'], '♥': ['000', '101', '111', '010', '000'] };
    const gl = GL[em.k] || GL['…'];
    g.fillStyle = em.k === '!' || em.k === '💢' ? '#d83a3a' : em.k === '?' ? '#3a6ad8' : em.k === '♪' || em.k === '♥' ? '#d83a8a' : '#3a3050';
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (gl[j][i] === '1') g.fillRect(x - 1 + i, y - 4 + j, 1, 1);
    if (em.k === '…') { g.fillRect(x - 3, y, 1, 1); g.fillRect(x + 3, y, 1, 1); }
  }

  /* ───────── 상호작용 ───────── */
  const IA = { hint: null };
  function candidates(p) {
    const e0 = candidatesDir(p, U.DV[p.dir]);
    if (e0) return e0;
    // 마우스 · 스틱으로 다른 쪽을 겨누고 있을 때: 마지막으로 걸어온 쪽 앞의 것도 (말 걸려고 다가갔는데 겨눈 쪽만 보던 것)
    const wf = p.walkFace;
    if (wf && U.dir4(wf[0], wf[1], p.dir) !== p.dir) return candidatesDir(p, U.DV[U.dir4(wf[0], wf[1], p.dir)]);
    return null;
  }
  function candidatesDir(p, dv) {
    const [ux, uy] = dv;
    const fx = p.x + ux * 12, fy = p.y - 4 + uy * 10;
    let best = null, bd = 99;
    for (const e of W().ents) {
      if (e === p || e.dead || e.hidden || !e.use || !e.canUse) continue;
      const ex = e.x, ey = e.y - (e.npc ? 6 : 5);
      const d = U.dist(fx, fy, ex, ey);
      const reach = e.reach || (e.npc ? 14 : 12);
      if (d < reach && d < bd && Math.abs((e.z || 0) - (p.z || 0)) <= (e.npc ? 1 : 0) && e.canUse(p)) { best = e; bd = d; }
    }
    return best;
  }
  function tryAt(p) {
    const e = candidates(p);
    if (!e) {
      // 바닥의 들 수 있는 사물은 검이 없을 때 atk가 처리
      return false;
    }
    e.use(p);
    return true;
  }
  function update() {
    const p = W().player;
    IA.hint = null;
    if (!p || G.script.running || p.busy || (G.ui.blocking && G.ui.blocking())) return;
    const e = candidates(p);
    if (e) IA.hint = { x: e.x, y: e.y, h: e.npc ? 30 : (e.hintH || 20), label: e.label };
  }
  function lanternAt(p) {
    for (const e of W().ents) if (e instanceof Torch && U.dist(p.x, p.y, e.x, e.y) < 22) e.ignite();
  }

  Object.assign(IA, { tryAt, update, lanternAt, candidates });
  G.interact = IA;
  G.props = { Prop, Chest, Sign, Door, Plate, Crystal, ColorBlock, Block, Torch, Pot, Crack, Post, Waystone, HeartItem, Bed, Spot, Pedestal, NPC, ART, drawEmote, flag, setFlag };
})();
