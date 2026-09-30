/* 옛 오락기 「무한으로 렙업하기」 — 원작에 바치는 자리
   그린 · 무지개 · 알록달록 광장 곁의 오락기. 들어가면 30초 동안 몰려오는 몬스터를 잡아 「Lv」을 올린다.
   기록이 남고, 기록마다 선물: Lv 20 골드 · Lv 40 옛 오락기 열쇠(옛 렙업의 땅) · Lv 60 렙업 머리띠.
   그리고 책장 몇 곳: 「무한으로 렙업하기」 · 「무한으로 렙업하자!!」를 이 대륙의 옛 전설로 읽는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const I = G.data.ITEMS;
  I.ac_lvband = { id: 'ac_lvband', type: 'acc', grade: 4, name: '렙업 머리띠', fx: { exp: 0.25, speed: 0.08 }, price: 0, desc: '옛 오락기 최고 기록의 상. 얻는 빛 알갱이 +25%, 베는 속도 +8%. 이마에 「무한」.' };

  /* ───────── 오락기 ───────── */
  const ART = G.props.ART;
  let cab = null;
  function cabinet() {
    if (cab) return cab;
    const X = G.gfx, b = X.brush(18, 28);
    b.rect(2, 4, 14, 22, '#3a2a5a'); b.rect(3, 5, 12, 20, '#5a3a8a'); b.rect(4, 7, 10, 8, '#0b0914');
    b.rect(5, 8, 8, 6, '#1a3a2a'); b.px(6, 12, '#6ae07a'); b.px(7, 12, '#6ae07a'); b.px(10, 10, '#ffe066'); b.px(11, 11, '#ff6a8a');
    b.rect(4, 17, 10, 3, '#2a1a3a'); b.px(6, 18, '#ff4a4a'); b.px(10, 18, '#4ab8ff'); b.px(12, 18, '#ffe066');
    b.rect(2, 1, 14, 4, '#ffcc4a'); b.rect(3, 2, 12, 2, '#ff8a3a'); b.rect(3, 26, 12, 2, '#2a1a3a');
    cab = X.outline(b.put(), '#0b0914');
    return cab;
  }
  class Arcade extends G.props.Prop {
    constructor(o) { super(Object.assign({ bw: 14, bh: 8, shadowW: 8 }, o)); }
    canUse() { return true; }
    get label() { return '오락기를 한다'; }
    use() { G.script.run(async (c) => play(c, this)); }
    update(dt) { this.t += dt; }
    draw(g, cx, cy) {
      const im = cabinet(); this.drawImg(g, cx, cy, im, 1);
      // 화면 깜박임
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 20);
      if (Math.floor(this.t * 3) % 2) { g.fillStyle = 'rgba(106,224,122,0.35)'; g.fillRect(x - 4, y, 8, 6); }
      if (Math.random() < 0.05) G.fx.part({ x: this.x + (Math.random() - 0.5) * 8, y: this.y - 18, z: 10, vz: 12, g: 0, life: 0.5, col: '#ffe066', size: 1, glow: true });
    }
  }
  async function play(c, cab2) {
    const s = S(), best = s.flags.arcade_best || 0;
    await c.narr('오래된 오락기. 화면에 도트 글씨가 흐른다.\n[y]「무한으로 렙업하기」[/]\n> 동전을 넣으세요 (10골드)' + (best ? '\n[s]최고 기록: Lv.' + best + '[/]' : ''));
    const k = await c.choice('30초 동안 몰려오는 몬스터를 잡을수록 레벨이 오른다.', ['동전을 넣는다 (10골드)', '기록 선물을 본다', '그만둔다']);
    if (k === 1) { await c.narr('기록 선물\nLv.20 — 골드 주머니\nLv.40 — 「옛 오락기 열쇠」\nLv.60 — 「렙업 머리띠」' + (best ? '\n[y]지금 최고: Lv.' + best + '[/]' : '')); return; }
    if (k !== 0) return;
    if (s.gold < 10) { await c.narr('동전이 없다.'); return; }
    s.gold -= 10;
    s.arcadeRet = { map: W().map.id, x: cab2.x, y: cab2.y + 18 };
    c.sfx('coin'); await c.wait(0.2);
    await c.fade(true, { sec: 0.3 });
    G.game.goto('arcade_room', px(9), py(8), 'up');
    await c.fade(false, { sec: 0.3 });
  }

  /* ───────── 오락기 속 ───────── */
  G.build.def('arcade_room', {
    build() {
      const rm = G.build.room({ id: 'arcade_room', region: 'green', name: '오락기 속', w: 18, h: 13, floor: T.CHECKER, music: 'battle' });
      rm.noFollow = true; rm.noCard = true; rm.dark = 0.1;
      // 문을 막는다 (끝나면 저절로 나간다)
      rm.warps.length = 0; rm.ter[rm.i(rm.exit.x, rm.exit.y)] = T.WALL;
      return rm;
    },
    ents(m, Wd) {
      const s = S();
      let t = 30, lv = 1, spawnT = 0.8, over = false, killed = 0;
      G.cine.area('무한으로 렙업하기', '30초 · 잡을수록 렙업!');
      Wd.add(new G.ent.Ent({ kind: 'arcadectl', solid: false, sortBias: 9999, x: 0, y: 99999,
        update(dt) {
          if (over) return;
          if (G.script.running) return;
          t -= dt; spawnT -= dt;
          const alive = G.combat.foes().filter((e) => !e.dead);
          if (spawnT <= 0 && alive.length < 8) {
            spawnT = Math.max(0.35, 1.1 - (30 - t) * 0.025);
            const kinds = t > 20 ? ['slime', 'slime', 'bat'] : t > 10 ? ['slime', 'bat', 'boar', 'bigslime'] : ['boar', 'bigslime', 'wolf', 'bat'];
            const side = Math.floor(Math.random() * 4), x = side === 0 ? px(2) : side === 1 ? px(15) : px(3 + Math.random() * 12), y = side === 2 ? py(3) : side === 3 ? py(10) : py(3 + Math.random() * 7);
            const e = G.foes.spawn(U.pick(kinds), x, y, { tier: Math.min(8, Math.floor(s.lv / 6)), elite: false });
            e.aggro = true; e.arcade = true; e.exp = 0; e.gold = 0; e.mat = null;
            const od = e.onDie; e.onDie = function () { if (od) od.apply(this, arguments); killed++; const gain = this.type === 'bigslime' || this.type === 'wolf' ? 3 : this.type === 'boar' ? 2 : 1; lv += gain; G.fx.float(this.x, this.y - 24, '렙업! Lv.' + lv, '#ffe066', { big: gain > 1 }); G.audio && G.audio.sfx('levelup'); };
          }
          if (t <= 0) { over = true; finish(lv, killed); }
        },
        draw(g) {
          const v = W().view; g.font = "12px 'Galmuri11', sans-serif"; g.textAlign = 'center';
          const txt = 'Lv.' + lv + '    남은 시간 ' + Math.max(0, Math.ceil(t));
          g.fillStyle = '#0b0914'; g.fillText(txt, v.w / 2 + 1, 23); g.fillStyle = t < 6 ? '#ff6a8a' : '#ffe066'; g.fillText(txt, v.w / 2, 22); g.textAlign = 'left';
        },
      }));
    },
  });
  function finish(lv, killed) {
    const s = S(), best = s.flags.arcade_best || 0;
    for (const e of G.combat.foes()) e.dead = true;
    G.script.run(async (c) => {
      c.sfx('bell'); await c.wait(0.5);
      await c.narr('GAME OVER\n[y]Lv.' + lv + '[/] (' + killed + '마리)' + (lv > best ? '\n[y]새 기록![/]' : '\n최고 기록 Lv.' + best));
      if (lv > best) s.flags.arcade_best = lv;
      if (lv >= 20 && !f('arcade:20')) { c.flag('arcade:20'); c.gold(500); await c.narr('오락기가 동전을 한 움큼 토해 냈다. [y]500골드[/]'); }
      if (lv >= 40 && !f('arcade:40')) { c.flag('arcade:40'); await c.narr('동전 구멍에서 작은 열쇠가 굴러 나왔다.'); await c.getItem('key_origin'); }
      if (lv >= 60 && !f('arcade:60')) { c.flag('arcade:60'); await c.getItem('ac_lvband'); }
      const r = s.arcadeRet || { map: 'world', x: px(G.ow.towns.green.plaza.x), y: py(G.ow.towns.green.plaza.y) };
      await c.fade(true, { sec: 0.3 });
      G.game.goto(r.map, r.x, r.y, 'down');
      s.hp = Math.max(s.hp, 4);
      await c.fade(false, { sec: 0.3 });
    });
  }
  // 오락기 속에서 쓰러지면: 게임 오버일 뿐 (다치지 않는다)
  const hp0 = G.combat.hurtPlayer;
  G.combat.hurtPlayer = function (p, q, src, opt) {
    const m = W().map;
    if (m && m.id === 'arcade_room') { if (p.inv > 0) return false; p.inv = 0.8; G.fx.float(p.x, p.y - 30, '앗!', '#ff6a8a'); G.audio && G.audio.sfx('hurt'); return false; }
    return hp0.apply(this, arguments);
  };
  // 기록 도중 저장되지 않게: 오락기 속에서 이어하기면 밖으로
  ST.onMap('arcade_room', () => {});

  // 광장 곁 세 곳
  const SPOTS = [['green', 6, 2], ['rainbow', -6, 4], ['colorful', 5, 3]];
  ST.onMap('world', (m, Wd) => {
    for (const [n, dx, dy] of SPOTS) {
      const t = OW.towns[n]; if (!t || !t.plaza) continue;
      const [x, y] = OW.near(m, t.plaza.x + dx, t.plaza.y + dy, null, 5);
      if (x == null) continue;
      Wd.add(new Arcade({ x: px(x), y: py(y) }));
    }
  });

  /* ───────── 옛 전설 책장 ───────── */
  const BOOKS = {
    b_lib: [[3, 2, '『무한으로 렙업하기』', '천 년도 더 된 모험담. 한 용사가 초록 마을에서 시작해 빨강 · 파랑 · 노랑 … 빛깔 이름을 한 마을들을 차례로 지나며 렙업했다는 이야기다.\n마지막 장에는 딱 한 줄: 「그리고 하늘 너머로.」\n[s]여백에 아이 글씨: 「나도 할래! 무한으로!」[/]']],
    p_academy: [[4, 2, '『무한으로 렙업하자!!』', '『무한으로 렙업하기』의 뒷이야기. 다른 용사가 같은 길을 다시 걸으며 「이번엔 더 멀리」라고 외쳤다고 한다.\n책 끝에 찍힌 공방 표시: 블록 모양 도장. 「엔트리 공방에서 찍음」.']],
    g_chief: [[2, 2, '『번쩍이는 기록 보관소』', '옛날 옛적 이야기들을 번쩍이는 판에 새겨 두던 보관소가 있었다고 한다. 판이 멎어도 이야기는 남았다.\n[s]보관소 목록 첫 줄: 「무한으로 렙업하기 — 보관됨」.[/]']],
  };
  for (const [room, list] of Object.entries(BOOKS)) {
    ST.onMap(room, (m, Wd) => {
      for (const [x, y, title, text] of list) Wd.add(new G.props.Spot({ x: px(x), y: py(y) + 2, verb: title + '을 읽는다', text: async (c) => { await c.narr('[y]' + title + '[/]\n' + text); if (!f('book:' + title)) { c.flag('book:' + title); c.exp(30); } } }));
    });
  }
  G.arcade = { Arcade };
})();
