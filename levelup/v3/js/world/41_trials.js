/* 다시 오게 만드는 곳들
   ─ 숨은 던전 둘: 별똥별 구덩이(사막 동쪽, 별이 떨어진 밤에 열린다) · 옛 렙업의 땅(그린 남서쪽, 옛 오락기 열쇠)
   ─ 각성 재도전: 쓰러뜨린 보스의 방에 「기억의 거울」 — 레벨에 맞춰 세진 보스와 다시. 처음 이기면 각성의 파편 · 몇몇은 영웅 · 전설 장비
   ─ 무한의 탑: 그린 북동쪽. 끝없는 층, 다섯 층마다 보스, 이정표 층마다 보상 · 기록
   ─ 던전 입구 카드에 위험도 ★ */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles, O = G.objs.O;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const D = G.data, I = D.ITEMS;
  const item = (id, o) => { I[id] = Object.assign(I[id] || { id, price: 0, desc: '' }, o); I[id].id = id; return I[id]; };
  const night = () => (G.story.nightFactor ? G.story.nightFactor() : 0) > 0.5;

  /* ───────── 새 물건 ───────── */
  item('key_origin', { type: 'key', name: '옛 오락기 열쇠', desc: '「무한으로 렙업하기」라고 적힌 작은 열쇠. 그린 남서쪽 낡은 굴의 자물쇠에 맞을 것 같다.' });
  item('awake_shard', { type: 'mat', name: '각성의 파편', desc: '각성한 보스를 이기면 남는 빛 조각. 다섯 개를 모으면 무언가가 된다.' });
  item('ac_awake', { type: 'acc', grade: 5, name: '각성의 왕관', fx: { str: 3, vit: 3, sta: 3, int: 3, dex: 3, special: 0.25 }, desc: '각성의 파편 다섯이 스스로 엮였다. 모든 능력치 +3, 필살 게이지 +25%.' });
  item('ac_infinity', { type: 'acc', grade: 5, name: '무한의 증표', fx: { exp: 0.5, str: 2, vit: 2, sta: 2, int: 2, dex: 2 }, desc: '무한의 탑 마흔 번째 층의 증표. 얻는 빛 알갱이 +50%, 모든 능력치 +2. 렙업에는 끝이 없다.' });

  /* ───────── 자리 ───────── */
  const GATE = { tower: { x: 156, y: 192 }, crater: { x: 369, y: 174 }, origin: { x: 111, y: 288 } };
  OW.poi.inf_tower = GATE.tower; OW.poi.sec_crater = GATE.crater; OW.poi.sec_origin = GATE.origin;
  OW.hooks.push((m) => {
    const G0 = GATE.tower, h0 = m.hgt[m.i(G0.x, G0.y + 3)];
    OW.clear(m, G0.x - 3, G0.y - 3, 9, 8, h0, T.STONE);
    G.build.placeBuilding(m, { special: 'tower', tx: G0.x, ty: G0.y, w: 3, h: 2, col: '#c8a050', to: 'inf_tower', id: 'inf_gate', cond: () => S().lv >= 10, msg: '탑 문에 새겨진 글씨: 「열 번 렙업한 자만 들어오라. 그다음은 끝이 없다.」 (Lv 10)' });
    for (let y = G0.y + 2; y < G0.y + 5; y++) for (const x of [G0.x + 1]) { const i = m.i(x, y); m.ter[i] = T.STONE; m.obj[i] = 0; }
    ST.cave(m, { x: GATE.crater.x, y: GATE.crater.y, id: 'crater_gate', to: 'sec_crater', col: '#4a3a6a', rx: 9, ry: 4, ground: T.ASH, cond: () => f('secret:crater'), msg: '구덩이 바닥의 굴이 식은 별똥별 돌에 막혀 있다. 별이 떨어지는 밤이라면…' });
    for (const [dx, dy] of [[-6, 2], [7, 1], [-4, 4], [5, 4]]) { const i = m.i(GATE.crater.x + dx, GATE.crater.y + dy); if (!m.solidExtra[i]) m.obj[i] = O.CRYSTAL; }
    ST.cave(m, { x: GATE.origin.x, y: GATE.origin.y, id: 'origin_gate', to: 'sec_origin', col: '#5a8a4a', rx: 6, ry: 3, cond: () => f('secret:origin') || !!S().inv.key_origin, msg: '낡은 굴. 자물쇠 옆에 누군가 「Lv.1」이라고 새겨 두었다. 안에서 옛 오락기 소리가 난다. 열쇠가 필요하다.' });
  });
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Sign({ x: px(GATE.tower.x - 2), y: py(GATE.tower.y + 3), text: async (c) => { const t = S().tower || {}; await c.narr('무한의 탑\n「렙업에는 끝이 없다. 탑에도 끝이 없다.」\n[s]다섯 층마다 문지기. 이정표 층(5 · 10 · 15 · 20 · 25 · 30 · 40)에 처음 오르면 선물.[/]' + (t.best ? '\n[y]가장 높이 오른 층: ' + t.best + '층[/]' : '')); } }));
    Wd.add(new P.Sign({ x: px(GATE.crater.x - 3), y: py(GATE.crater.y + 3), look: 'stone', text: async (c) => {
      if (night() && !f('secret:crater')) { c.flag('secret:crater'); c.sfx('white'); c.shake(3, 0.4); await c.narr('하늘에서 빛줄기 하나가 곧장 구덩이로 떨어졌다. 쿵 — 굴을 막던 돌이 산산이 부서졌다.\n[y]별똥별 구덩이가 열렸다.[/]'); return; }
      await c.narr(f('secret:crater') ? '별똥별 구덩이. 바닥에서 아직 별 조각이 반짝인다.' : '움푹 꺼진 구덩이. 사막 사람들은 「별이 쉬어 가는 자리」라고 부른다.\n[s]밤이면 가끔 별이 떨어진다고 한다.[/]');
    } }));
    Wd.add(new P.Sign({ x: px(GATE.origin.x - 2), y: py(GATE.origin.y + 3), look: 'stone', text: '낡은 팻말.\n「무한으로 렙업하기 — 여기서 시작」\n그 아래 누가 덧써 놓았다: 「무한으로 렙업하자!!」' }));
  });

  /* ═════════ 숨은 던전 1: 별똥별 구덩이 ═════════ */
  const def = (id, Dn) => G.dungeon.def(id, Dn);
  const portalOut = (m, r, to) => new ST.Portal({ x: (r.x0 + 12) * TS + 8, y: (r.y0 + 10) * TS + 12, to: 'world', tox: to[0], toy: to[1] });
  function bossEnd(id, back, after) {
    return function (m, Wd) {
      const bk = Object.keys(m.rooms).find((k) => m.rooms[k].R.boss); if (!bk) return;
      const r = m.rooms[bk], boss = Wd.ents.find((e) => e.boss);
      if (f(id + ':boss')) { if (boss) boss.dead = true; Wd.add(portalOut(m, r, back)); return; }
      if (!boss) return;
      boss.onDieFn = () => G.script.run(async (c) => { await c.wait(0.8); G.world.add(portalOut(m, r, back)); if (after) await after(c); });
    };
  }
  def('sec_crater', {
    name: '별똥별 구덩이', sub: '숨은 던전 · 사막 동쪽', pal: 'yellow', music: 'hollow', tier: 6, floor: T.CRYSTAL, wall: 'vein', shape: 'cave', ambient: 'sparks', dark: 0.45,
    decor: [O.CRYSTAL, O.ROCK, O.PEBBLE], decorRate: 0.08, glowObjs: [O.CRYSTAL], glowCol: 'rgba(200,180,255,0.3)',
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: GATE.crater.x, ty: GATE.crater.y + 2 },
    floors: { '1,3': '구덩이 바닥', '0,2': '별 조각 굴', '1,2': '식은 별의 방', '2,2': '빛나는 틈', '1,1': '별의 길', '1,0': '두꺼비의 연못' },
    rooms: {
      '1,3': { props: [['sign', 13, 10, { text: '돌에 새긴 별자리 그림. 별 하나에 굵은 동그라미.\n「이 별은 먹혔다.」' }], ['torch', 4, 3, { lit: true }], ['torch', 15, 3, { lit: true }], ['pot', 3, 10], ['pot', 16, 10]], foes: [['wisp', 6, 6], ['wisp', 13, 6]] },
      '1,2': { solve: { type: 'clear' }, ter: [['pit', 8, 5, 4, 3]], props: [['torch', 3, 3], ['torch', 16, 3]], foes: [['golem', 5, 5], ['golem', 14, 5], ['wisp', 9, 10]] },
      '0,2': { dark: 0.85, props: [['torch', 4, 4], ['torch', 15, 4], ['torch', 4, 10], ['torch', 15, 10], ['chest', 9, 7, { item: 'key_small' }]], solve: { type: 'torches', msg: '네 불이 켜지자 별 조각이 반짝였다' }, foes: [['bat', 6, 6], ['bat', 13, 8], ['icewisp', 9, 4]] },
      '2,2': { ter: [['pit', 3, 4, 3, 7], ['pit', 14, 4, 3, 7]], props: [['chest', 9, 10, { item: 'heartpiece' }], ['chest', 9, 4, { item: 'm_moon', n: 3 }]], foes: [['drone', 6, 6], ['drone', 13, 6]] },
      '1,1': { solve: { type: 'plates', flag: 'crater:plates', msg: '별자리가 맞춰졌다 — 문이 열린다' }, props: [['plate', 5, 5], ['plate', 14, 5], ['plate', 9, 10], ['block', 7, 7], ['block', 12, 7], ['block', 9, 4], ['chest', 16, 11, { item: 'key_big', big: true }]], foes: [['golem', 9, 7]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'toadstar' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'key'], ['1,2', '1,1', 'open'], ['1,1', '1,0', 'big']],
    ents: bossEnd('sec_crater', [GATE.crater.x, GATE.crater.y + 3], async (c) => {
      c.lock(true); await c.cinema(true);
      await c.narr('두꺼비가 쓰러지며 삼킨 별들을 토해 냈다. 별 조각들이 천장으로 떠올라, 구덩이 위 밤하늘 제자리로 돌아갔다.');
      await c.say('toria', '찍! 저 별 하나, 방금 우리한테 윙크했어.', { face: 'happy' });
      await c.getItem('bw_seeker');
      await c.cinema(false); c.lock(false);
    }),
  });

  /* ═════════ 숨은 던전 2: 옛 렙업의 땅 ═════════ */
  def('sec_origin', {
    name: '옛 렙업의 땅', sub: '숨은 던전 · 모든 렙업이 시작된 곳', pal: 'green', music: 'field', tier: 10, floor: T.CHECKER, wall: 'marble', shape: 'rect', ambient: 'motes',
    decor: [O.FLOWER, O.TALL, O.BUSH], decorRate: 0.05,
    start: ['1,3', 9, 11],
    exit: { at: ['1,3', 9, 13], to: 'world', tx: GATE.origin.x, ty: GATE.origin.y + 2 },
    floors: { '1,3': '시작의 방 — Lv.1', '0,2': '초록 들판 — Lv.10', '1,2': '빨강 광산 — Lv.30', '2,2': '파랑 바다 — Lv.50', '0,1': '노랑 사막 — Lv.100', '1,1': '무한의 복도 — Lv.???', '2,1': '저장소', '1,0': '왕좌 — Lv.9999' },
    rooms: {
      '1,3': { props: [['sign', 13, 10, { text: '낡은 화면 같은 벽에 글자가 깜박인다.\n「무한으로 렙업하기」\n> 새로 시작\n> 이어하기\n그 옆에 누가 작게 써 놓았다: 「이어하기가 안 되면 새로 시작하면 된다. 렙업은 다시 하면 된다.」' }], ['torch', 4, 3, { lit: true }], ['torch', 15, 3, { lit: true }]], foes: [['slime', 6, 7], ['slime', 13, 7], ['slime', 9, 9]] },
      '1,2': { solve: { type: 'clear' }, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['sign', 9, 11, { text: '「Lv.30 — 곡괭이 대신 칼을 든 날」' }]], foes: [['bomber', 5, 5], ['golem', 14, 5], ['bandit', 9, 8], ['boar', 4, 10]] },
      '0,2': { props: [['chest', 9, 6, { item: 'key_small' }], ['sign', 9, 10, { text: '「Lv.10 — 초록 마을 촌장의 첫 부탁. 슬라임 다섯 마리.」' }]], foes: [['bigslime', 6, 6], ['bigslime', 13, 6], ['plant', 9, 9]] },
      '2,2': { ter: [['water', 2, 2, 16, 3], ['deep', 6, 6, 8, 2]], props: [['chest', 9, 10, { item: 'heartpiece' }], ['sign', 3, 10, { text: '「Lv.50 — 배를 탔다. 어느 배였는지는 기억 안 난다.」' }]], foes: [['crab', 5, 9], ['crab', 14, 9], ['octo', 9, 4]] },
      '0,1': { props: [['chest', 9, 7, { item: 'm_moon', n: 4 }], ['sign', 9, 11, { text: '「Lv.100 — 세 자리. 여기서부터가 진짜라고 누가 그랬다.」' }]], foes: [['worm', 6, 7], ['worm', 13, 7], ['turret', 9, 4]] },
      '1,1': { solve: { type: 'waves', msg: '경험치의 물결이 멎었다' }, waves: [[['slime', 5, 5], ['slime', 14, 5], ['bat', 9, 4]], [['boar', 4, 9], ['wolf', 15, 9], ['bigslime', 9, 7]], [['knight', 6, 6], ['mage', 13, 6], ['ghost', 9, 9]], [['golem', 5, 8], ['golem', 14, 8], ['shade', 9, 5]]], props: [['chest', 9, 11, { item: 'key_big', big: true, hidden: true }]] },
      '2,1': { props: [['chest', 6, 6, { item: 'potion_max', n: 2 }], ['chest', 13, 6, { item: 'fc_origin' }], ['sign', 9, 10, { text: '「세이브 파일 몇 개가 여기 쌓여 있다. 이름은 전부 지워졌다. 레벨만 남았다: 12, 37, 99, 9998.」' }]] },
      '1,0': { boss: true, props: [['torch', 3, 3, { lit: true }], ['torch', 16, 3, { lit: true }], ['torch', 3, 11, { lit: true }], ['torch', 16, 11, { lit: true }], ['boss', 9, 5, { type: 'lvslime' }]] },
    },
    doors: [['1,3', '1,2', 'open'], ['1,2', '0,2', 'open'], ['1,2', '2,2', 'open'], ['0,2', '0,1', 'key'], ['1,2', '1,1', 'open'], ['1,1', '2,1', 'bomb'], ['1,1', '1,0', 'big']],
    ents: bossEnd('sec_origin', [GATE.origin.x, GATE.origin.y + 3], async (c) => {
      c.lock(true); await c.cinema(true);
      await c.narr('슬라임의 머리 위 숫자가 깜박였다. 9999… 10000… 그리고 숫자가 넘쳐, 0이 되었다.\n슬라임은 아주 작아졌다. Lv.1.');
      await c.say(null, '「…렙업, 재미있었어?」', { style: 'remote' });
      await c.say('toria', '찍. 재미있었지. 끝이 없어서.', { face: 'smile' });
      await c.getItem('art_thousand');
      await c.cinema(false); c.lock(false);
    }),
  });

  /* ═════════ 각성 재도전: 기억의 거울 ═════════ */
  const AWAKE = {
    d1: '가시덩굴 여왕', d2: '황금 두더지왕', d3: '새끼 크라켄', d4: '스핑크스', d5: '거울 속 나', d6: '폭풍새', d7: '서리 거인', d8: '빈 왕', d9: '그림자 녹턴',
    d12: '울림', d13: '벨루', d14: '트리아', d15: '부르는 자', sec_crater: '유성두꺼비', sec_origin: 'Lv.9999',
  };
  const AWAKE_GIFT = { d5: 'fc_star', d7: 'tome_blizzard', d9: 'sw_blood' };
  function bossOf(id) { const Dn = G.dungeon.DUN[id]; if (!Dn) return null; for (const [k, R] of Object.entries(Dn.rooms)) if (R.boss) { const pr = (R.props || []).find((q) => q[0] === 'boss'); if (pr) return { k, type: pr[3].type }; } return null; }
  for (const id of Object.keys(AWAKE)) {
    ST.onMap(id, (m, Wd) => {
      if (!f(id + ':boss')) return;
      const bo = bossOf(id); if (!bo || !m.rooms[bo.k]) return;
      const r = m.rooms[bo.k];
      const mirror = new G.props.Spot({ x: px(r.x0 + 5), y: py(r.y0 + 10), verb: '기억의 거울을 들여다본다', sparkle: true, text: async (c) => {
        if (Wd.ents.some((e) => e.boss && !e.dead)) { await c.narr('거울 속이 흔들린다. 지금은 싸움 중이다.'); return; }
        const s = S(), rec = s.flags['awake:' + id];
        const k = await c.choice('거울 속에서 ' + AWAKE[id] + '이(가) 눈을 뜬다. 지금의 너만큼 강해져서.' + (rec ? '\n[y]지난 기록: ' + rec + '초[/]' : '\n[s]처음 이기면 각성의 파편' + (AWAKE_GIFT[id] ? ' · 특별한 선물' : '') + '.[/]'), ['다시 싸운다', '그만둔다']);
        if (k !== 0) return;
        c.sfx('warp'); c.flash('#e8e0ff', 0.4); await c.wait(0.3);
        const B = G.bosses.B[bo.type];
        const lv = s.lv;
        const b = G.bosses.spawn(bo.type, px(r.x0 + 9), py(r.y0 + 5), { room: bo.k, hpMul: Math.max(2, (60 + lv * 9) / B.hp) });
        b.atk = Math.max(B.atk + 2, Math.round(3 + lv / 8)); b.speed *= 1.15; b.exp = Math.round(B.exp * 0.6); b.gold = Math.round((B.gold || 100) * 1.5);
        b.name = '각성한 ' + b.name; b.title = '기억의 거울 · 각성한 ' + (B.name || '');
        b.awake = true; b.start && b.start(); b.aggro = true;
        const t0 = s.t;
        c.music('boss');
        b.onDieFn = () => G.script.run(async (c2) => {
          const sec = Math.round(s.t - t0);
          const first = !rec; if (!rec || sec < rec) s.flags['awake:' + id] = sec;
          await c2.wait(0.6);
          if (first) {
            await c2.narr('거울이 한 번 크게 울렸다. 각성의 파편이 떨어졌다.' + (sec ? ' (' + sec + '초)' : ''));
            await c2.getItem('awake_shard');
            if (AWAKE_GIFT[id]) await c2.getItem(AWAKE_GIFT[id]);
            if ((s.inv.awake_shard || 0) >= 5 && !s.inv.ac_awake && !f('awake:crown')) { c2.flag('awake:crown'); G.st.take(s, 'awake_shard', 5); await c2.narr('파편 다섯이 스스로 떠올라 엮였다.'); await c2.getItem('ac_awake'); }
          } else { c2.gold(400 + lv * 30); await c2.narr('다시 이겼다. ' + sec + '초' + (sec < rec ? ' — [y]새 기록![/]' : '.')); }
        });
      } });
      Wd.add(mirror);
    });
  }

  /* ═════════ 무한의 탑 ═════════ */
  const BOSS_CYCLE = ['thornqueen', 'moleking', 'salamander', 'kraken', 'sphinx', 'roc', 'echogiant', 'frost', 'swampqueen', 'hollowking', 'toadstar', 'trialshade', 'forgotking', 'core', 'lvslime'];
  const MILE = { 5: [['potion_max', 3]], 10: [['key_origin', 1]], 15: [['art_galaxy', 1]], 20: [['sw_sky', 1]], 25: [['bw_heaven', 1]], 30: [['art_genesis', 1]], 40: [['ac_infinity', 1]] };
  const POOL = ['slime', 'bat', 'boar', 'bandit', 'wolf', 'bomber', 'golem', 'crab', 'octo', 'worm', 'mage', 'ghost', 'plant', 'bigslime', 'bug', 'icewisp', 'hollow', 'drone', 'turret', 'knight', 'shade'];
  const tw = () => { const s = S(); s.tower = s.tower || { cur: 1, best: 0 }; return s.tower; };
  G.build.def('inf_tower', {
    build() {
      const rm = G.build.room({ id: 'inf_tower', region: 'gray', name: '무한의 탑', w: 22, h: 15, floor: T.CHECKER, music: 'battle', back: ['world', GATE.tower.x + 1, GATE.tower.y + 3], rug: [9, 3, 4, 10] });
      rm.noCard = true; rm.dark = 0.15;
      // 싸우는 동안에는 문이 닫힌다 (밀려서 나가 버리지 않게)
      for (const w of rm.warps) { w.cond = () => !G.combat.foes().some((e) => !e.dead); w.msg = '싸우는 동안에는 탑 문이 열리지 않는다'; }
      return rm;
    },
    ents(m, Wd) {
      const t = tw(), n = t.cur, s = S();
      G.cine.area('무한의 탑', n + '층' + (n % 5 === 0 ? ' — 문지기' : '') + (t.best ? ' · 최고 ' + t.best + '층' : ''));
      const cx = px(11), cy = py(7);
      const lvl = Math.max(s.lv, 10);
      const done = () => {
        if (n > t.best) t.best = n;
        const gift = MILE[n] && !f('tower:gift' + n) ? MILE[n] : null;
        G.script.run(async (c) => {
          c.sfx('puzzle'); await c.wait(0.4);
          if (gift) { c.flag('tower:gift' + n); await c.narr('[y]' + n + '층 돌파![/] 탑이 선물을 내민다.'); for (const [id, k] of gift) await c.getItem(id, k); }
          else if (n % 5 === 0) { c.gold(200 + n * 60); c.exp(40 + n * 25); }
          const up = new G.props.Spot({ x: px(11), y: py(3), verb: n + 1 + '층으로 오른다', sparkle: true, text: async (c2) => { t.cur = n + 1; c2.sfx('stairs'); G.game.useWarp({ to: 'inf_tower', tx: 11, ty: 11, dir: 'up', sfx: 'stairs' }); } });
          W().add(up);
          if (n % 5 === 0) G.fx.float(px(11), py(3) - 30, '여기서 나가면 다음에 ' + (n + 1) + '층부터', '#ffe066', { life: 3 });
        });
      };
      // 나가면 다섯 층 단위 쉼터부터 다시
      if (!t.cp || n < t.cp) t.cp = Math.max(1, Math.floor((n - 1) / 5) * 5 + 1);
      if (n % 5 === 0) {
        const type = BOSS_CYCLE[(n / 5 - 1) % BOSS_CYCLE.length], B = G.bosses.B[type];
        const b = G.bosses.spawn(type, cx, cy - 20, { hpMul: Math.max(1.4, (50 + n * 18 + lvl * 4) / B.hp) });
        b.atk = Math.round(Math.max(B.atk, 3 + n / 5 + lvl / 12)); b.exp = Math.round(B.exp * 0.5); b.gold = 100 + n * 20;
        b.name = n + '층 문지기 · ' + b.name; b.start && b.start(); b.aggro = true;
        b.onDieFn = () => { t.cp = n + 1; done(); };
        G.script.run(async (c) => { c.music('boss'); });
      } else {
        const tier = Math.min(11, 1 + Math.floor(n / 3)), count = 3 + Math.min(9, Math.floor(n / 2));
        const rnd = U.rng(n * 7919);
        const types = POOL.slice(0, Math.min(POOL.length, 6 + n));
        const waves = n >= 12 ? 3 : n >= 4 ? 2 : 1;
        const spawnWave = () => {
          for (let i = 0; i < count; i++) {
            const a = rnd() * Math.PI * 2, x = cx + Math.cos(a) * (60 + rnd() * 50), y = cy + Math.sin(a) * (30 + rnd() * 25);
            const e = G.foes.spawn(types[Math.floor(rnd() * types.length)], x, y, { tier, elite: n >= 6 && rnd() < Math.min(0.5, n * 0.02) });
            e.aggro = true;
          }
          G.ui.toast(n + '층 — 파도 ' + (k + 1) + ' / ' + waves, 'bad');
        };
        // 방 지기: 적이 다 쓰러지면 다음 파도 · 다 끝나면 위층 계단
        let k = 0, wait = 0.8, fin = false;
        Wd.add(new G.ent.Ent({ kind: 'towerctl', solid: false, hidden: true, update(dt) {
          if (fin) return;
          if (wait > 0) { wait -= dt; if (wait <= 0) spawnWave(); return; }
          if (G.combat.foes().some((e) => !e.dead)) return;
          k++;
          if (k < waves) { wait = 1; return; }
          fin = true; done();
        } }));
      }
    },
  });
  // 탑에서 쓰러지면: 쉼터 층부터
  ST.onTick.push(() => { const m = W().map; if (m && m.id !== 'inf_tower' && S().tower && S().tower.cp && S().tower.cur > S().tower.cp && !G.script.running) { S().tower.cur = S().tower.cp; } });

  /* ═════════ 위험도 ★ (던전 입구 카드) ═════════ */
  const area0 = G.cine.area;
  G.cine.area = function (name, sub) {
    const m = W().map;
    if (m && m.dungeon && G.dungeon.DUN[m.dungeon]) {
      const tier = G.dungeon.DUN[m.dungeon].tier || 0, n = U.clamp(Math.ceil((tier + 1) / 2), 1, 5);
      sub = (sub ? sub + '  ·  ' : '') + '위험 ' + '★'.repeat(n) + '☆'.repeat(5 - n) + (f(m.dungeon + ':boss') ? '  ·  기억의 거울' : '');
    }
    return area0.call(this, name, sub);
  };

  G.trials = { GATE, AWAKE, bossOf };
})();
