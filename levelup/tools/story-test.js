#!/usr/bin/env node
/* 이야기 전체 자동 진행 테스트: 프롤로그부터 천년제까지 모든 주요 장면을 실제 브라우저에서 돌린다.
   대사는 넘기고, 선택지는 정해진 답을 고르고, 전투는 즉시 이기고, 미니게임은 통과시킨다.
   사용법: node levelup/tools/story-test.js [levelup.html 경로] */
'use strict';
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'levelup.html'));
// [이름, 준비(state), 대상, 기대(state) , 선택 답]
const SCENES = [
  ['프롤로그: 버튼', { map: 'home', x: 7, y: 3, dir: 'right' }, { npc: 'gran' }, (s) => s.flags.m_button && s.quests.m0 === 1],
  ['등급소: 평민 1차', { lv: 6, gold: 5000, quests: { m0: 2 }, map: 'green_rank', x: 5, y: 5, dir: 'up' }, { npc: 'clerk_g', rankup: 0 }, (s) => s.quests.m0 === 'done' && s.quests.m1 === 0],
  ['할머니: 나뭇가지', { lv: 12, quests: { m1: 1 }, map: 'home', x: 7, y: 3, dir: 'right' }, { npc: 'gran' }, (s) => s.quests.m1 === 2],
  ['속삭이는 숲: 나무 정령', { lv: 20, map: 'green_forest', x: 18, y: 6, dir: 'up' }, { fixed: 'treant' }, (s) => s.quests.m1 === 3 && s.orbs.o_r2],
  ['할머니: 목검', { map: 'home', x: 7, y: 3, dir: 'right' }, { npc: 'gran' }, (s) => s.quests.m1 === 4 && s.inv.w0],
  ['광장: 징수탑', { lv: 24, map: 'green', x: 19, y: 10, dir: 'down' }, { trigger: 0 }, (s) => s.flags.green_tower_broken && s.quests.m1 === 5],
  ['할머니: 편지', { map: 'home', x: 7, y: 3, dir: 'right' }, { npc: 'gran' }, (s) => s.quests.m1 === 'done' && s.inv.letter_gran],
  ['붉은 산길', { lv: 35, map: 'red_path', x: 10, y: 1 }, { enter: true }, (s) => s.flags.ch2],
  ['레드 마을 도착', { map: 'red', x: 18, y: 0, dir: 'down' }, { enter: true }, (s) => s.flags.red_intro && s.quests.m2 === 1],
  ['관측소: 은하수 박사', { lv: 80, map: 'observatory', x: 7, y: 3, dir: 'right' }, { npc: 'galaxy' }, (s) => s.flags.m_red_galaxy && s.orbs.o_r3 && s.quests.m2 === 2],
  ['광장: 루드', { lv: 90, gold: 5000, map: 'red', x: 18, y: 11, dir: 'down' }, { trigger: 0 }, (s) => s.flags.m_red_rud && s.quests.m2 === 3, [0]],
  ['광산 철문', { lv: 260, quests: { q_mine: 0 }, map: 'red', x: 5, y: 25, dir: 'up' }, { build: 'mineDoor', keypad: '999' }, (s) => s.flags.mine_open],
  ['두더지왕', { lv: 320, map: 'mine2', x: 21, y: 5, dir: 'right' }, { fixed: 'moleking' }, (s) => s.orbs.o_r4],
  ['해안길', { lv: 160, map: 'coast', x: 3, y: 1 }, { enter: true }, (s) => s.quests.m3 === 0],
  ['먹물 관장', { map: 'library', x: 11, y: 6, dir: 'up' }, { npc: 'mukmul' }, (s) => s.quests.m3 === 1],
  ['해미의 수수께끼', { map: 'library', x: 9, y: 13, dir: 'up' }, { npc: 'haemi' }, (s) => s.flags.stacks_open && s.quests.m3 === 2, [0, 0, 1, 2]],
  ['세린의 책', { books: { b_serin: 1 }, map: 'library', x: 11, y: 6, dir: 'up' }, { npc: 'mukmul' }, (s) => s.quests.m3 === 3 && s.flags.travel],
  ['고선장', { map: 'blue', x: 21, y: 23, dir: 'right' }, { npc: 'captain' }, (s) => s.quests.m3 === 4],
  ['크라켄', { lv: 560, map: 'seacave', x: 16, y: 3, dir: 'up' }, { fixed: 'kraken' }, (s) => s.quests.m3 === 5 && s.inv.compass],
  ['항해 허가증', { map: 'blue', x: 21, y: 23, dir: 'right' }, { npc: 'captain' }, (s) => s.quests.m3 === 6 && s.inv.ferry_pass],
  ['고등어호 · 옐로 도착', { lv: 650, map: 'blue', x: 23, y: 25, dir: 'right' }, { build: 'ferryTalk' }, (s) => s.flags.button_stolen && s.quests.m4 === 1],
  ['그늘 골목: 까치', { map: 'hideout', x: 5, y: 4, dir: 'up' }, { npc: 'kkachi' }, (s) => s.flags.button_back && s.quests.m4 === 2 && s.inv.button],
  ['경험 거래소', { map: 'yellow', x: 29, y: 12, dir: 'up' }, { obj: [29, 11] }, (s) => s.quests.m4 === 3],
  ['황금궁 문지기', { gold: 2e6, map: 'yellow', x: 21, y: 9, dir: 'up' }, { npc: 'guard' }, (s) => s.flags.palace_open && s.quests.m4 === 4],
  ['금화왕 골디', { lv: 2000, map: 'palace', x: 9, y: 4, dir: 'up' }, { npc: 'goldie' }, (s) => s.quests.m4 === 6 && s.flags.m_yellow_bond],
  ['사하라의 통행패', { map: 'caravan', x: 9, y: 11, dir: 'left' }, { npc: 'sahara' }, (s) => s.inv.caravan_seal],
  ['대상단 길', { lv: 2100, map: 'purple_road', x: 14, y: 32 }, { enter: true }, (s) => s.quests.m5 === 1],
  ['베라 교수', { map: 'academy', x: 10, y: 6, dir: 'up' }, { npc: 'vera' }, (s) => s.quests.m5 === 2],
  ['달맞이꽃', { map: 'purple_forest', x: 21, y: 5, dir: 'up' }, { pickup: 'moonherb1' }, (s) => s.inv.moon_herb],
  ['베라: 연못으로', { map: 'academy', x: 10, y: 6, dir: 'up' }, { npc: 'vera' }, (s) => s.quests.m5 === 3],
  ['거울 연못: 983년', { map: 'mirror_pond', x: 16, y: 17, dir: 'down' }, { npc: 'bichu' }, (s) => s.flags.vision_seen && s.quests.m5 === 4],
  ['베라: 진실', { map: 'academy', x: 10, y: 6, dir: 'up' }, { npc: 'vera' }, (s) => s.quests.m5 === 5 && s.flags.lab_open],
  ['무지개 다리', { lv: 7000, map: 'rainbow_bridge', x: 1, y: 7 }, { enter: true }, (s) => s.quests.m6 === 0],
  ['무지개 마을', { map: 'rainbow', x: 1, y: 15 }, { enter: true }, (s) => s.quests.m6 === 1],
  ['채색 위원장', { map: 'rainbow', x: 17, y: 18, dir: 'up' }, { npc: 'chaesaek' }, (s) => s.quests.m6 === 2],
  ['롤로 · 흰빛 나눔', { map: 'circus', x: 7, y: 4, dir: 'up' }, { npc: 'lolo' }, (s) => s.flags.m_rainbow_share && s.quests.m6 === 3],
  ['새벽단 은신처', { map: 'dawn_base', x: 7, y: 5, dir: 'up' }, { npc: 'lea' }, (s) => s.flags.m_rainbow_lea && s.quests.m6 === 4],
  ['폭풍 구름', { lv: 22000, map: 'whale_isle', x: 14, y: 6, dir: 'up' }, { fixed: 'storm' }, (s) => s.quests.m6 === 5],
  ['채색: 화이트로', { map: 'rainbow', x: 17, y: 18, dir: 'up' }, { npc: 'chaesaek' }, (s) => s.quests.m6 === 6],
  ['설원길', { lv: 26000, map: 'snowfield', x: 1, y: 18 }, { enter: true }, (s) => s.quests.m7 === 1],
  ['루미에', { map: 'cathedral', x: 9, y: 5, dir: 'up' }, { npc: 'lumie' }, (s) => s.quests.m7 === 2],
  ['얼음 신전 제단', { lv: 50000, map: 'ice_temple', x: 15, y: 4, dir: 'up' }, { obj: [15, 3] }, (s) => s.orbs.o_y3 && s.quests.m7 === 3],
  ['루미에의 부탁', { map: 'cathedral', x: 9, y: 5, dir: 'up' }, { npc: 'lumie' }, (s) => s.quests.m7 === 4, [0]],
  ['에델', { map: 'cathedral', x: 11, y: 6, dir: 'up' }, { npc: 'edel' }, (s) => s.quests.m7 === 5],
  ['루미에와의 싸움', { lv: 60000, map: 'cathedral', x: 9, y: 5, dir: 'up' }, { npc: 'lumie' }, (s) => s.quests.m7 === 6 && s.flags.m_white_lumie],
  ['잿빛 고개', { lv: 62000, map: 'ash_pass', x: 20, y: 1 }, { enter: true }, (s) => s.quests.m8 === 1],
  ['볼트', { map: 'workshop', x: 9, y: 5, dir: 'up' }, { npc: 'bolt' }, (s) => s.quests.m8 === 2],
  ['기록 보관소', { books: { b_silver: 1, b_report: 1 }, map: 'archive', x: 7, y: 4, dir: 'up' }, { obj: [7, 3] }, (s) => s.orbs.o_y4 && s.quests.m8 === 3],
  ['볼트: 등대', { map: 'workshop', x: 9, y: 5, dir: 'up' }, { npc: 'bolt' }, (s) => s.quests.m8 === 4],
  ['폐공장: MK-7', { lv: 120000, map: 'factory', x: 16, y: 25, dir: 'up' }, { npc: 'bolt' }, (s) => s.quests.m8 === 5],
  ['볼트: 역류 장치', { map: 'workshop', x: 9, y: 5, dir: 'up' }, { npc: 'bolt' }, (s) => s.quests.m8 === 6 && s.inv.reverser],
  ['노을의 소원', { quests: { q_noel: 7 }, inv: { color_jar: 1 }, map: 'gray', x: 22, y: 16, dir: 'up' }, { npc: 'noel' }, (s) => s.orbs.o_p4],
  ['밤의 숲', { lv: 130000, map: 'night_forest', x: 38, y: 16 }, { enter: true }, (s) => s.quests.m9 === 1],
  ['미드나잇', { inv: { fish_gold: 1 }, map: 'midnight_shop', x: 4, y: 5, dir: 'up' }, { npc: 'midnight' }, (s) => s.quests.m9 === 3 && s.orbs.o_p1],
  ['묘지 뒷길', { map: 'black', x: 32, y: 23, dir: 'up' }, { obj: [32, 22] }, (s) => s.flags.castle_open && s.quests.m9 === 4],
  ['녹턴 · 카이론', { lv: 250000, map: 'castle2', x: 13, y: 6, dir: 'up' }, { npc: 'nocturne' }, (s) => s.quests.m9 === 6 && s.inv.night_key],
  ['알록달록 마을', { map: 'colorful', x: 18, y: 1 }, { enter: true }, (s) => s.quests.m10 === 1],
  ['팡팡 박사', { map: 'hangar', x: 12, y: 8, dir: 'right' }, { npc: 'pangpang' }, (s) => s.quests.m10 === 2],
  ['볼트의 선물', { map: 'workshop', x: 9, y: 5, dir: 'up' }, { npc: 'bolt' }, (s) => s.inv.gear_heart],
  ['골디의 선물', { map: 'palace', x: 9, y: 4, dir: 'up' }, { npc: 'goldie' }, (s) => s.inv.gold_bond],
  ['루미에의 선물', { map: 'cathedral', x: 9, y: 5, dir: 'up' }, { npc: 'lumie' }, (s) => s.inv.prayer_crystal],
  ['천발이', { lv: 400000, map: 'fw_tower', x: 14, y: 4, dir: 'up' }, { fixed: 'megafirework' }, (s) => s.flags.beat_megafirework],
  ['별빛 연료', { map: 'fw_tower', x: 18, y: 3, dir: 'up' }, { pickup: 'fuel' }, (s) => s.inv.rocket_fuel],
  ['발사', { lv: 420000, ranks: { r1: 5, r2: 10, r3: 20, r4: 30, r5: 1 }, map: 'hangar', x: 12, y: 8, dir: 'right' }, { npc: 'pangpang' }, (s) => s.flags.launched && s.map === 'station'],
  ['하늘 정거장', { map: 'station', x: 16, y: 26 }, { enter: true }, (s) => s.quests.m11 === 0],
  ['스텔라', { map: 'station_core', x: 9, y: 5, dir: 'up' }, { npc: 'stella' }, (s) => s.quests.m11 === 2],
  ['흑점의 전령', { lv: 600000, map: 'deck', x: 12, y: 8, dir: 'up' }, { fixed: 'herald' }, (s) => s.quests.m11 === 3],
  ['스텔라: 셔틀', { map: 'station_core', x: 9, y: 5, dir: 'up' }, { npc: 'stella' }, (s) => s.quests.m11 === 4 && s.inv.x9],
  ['궤도 셔틀', { lv: 650000, ranks: { r5: 20 }, map: 'deck', x: 12, y: 5, dir: 'up' }, { obj: [12, 4] }, (s) => s.map === 'astra_gate'],
  ['아스트라', { map: 'astra_gate', x: 18, y: 28 }, { enter: true }, (s) => s.quests.m12 === 0],
  ['봉인의 제단 · 결말', { lv: 900000, ranks: { r5: 40 }, quests: { m12: 2 }, map: 'astra_seal', x: 12, y: 8, dir: 'up' }, { npc: 'kairon' }, (s) => s.flags.ending && s.map === 'festival'],
  ['천년제 밤', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
];

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE);
  await p.waitForTimeout(500);
  await p.click('[data-t="new"]');
  await p.click('[data-t="start"]');
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    G.state.settings.textSpeed = 3; G.state.settings.music = false; G.state.settings.sfx = false;
    const orig = G.script.ctx;
    G.script.ctx = () => { const c = orig(); c.clickRace = async () => 999; c.waitClick = async (n, cb) => { for (let k = 1; k <= (n || 1); k++) { G.main.clickField(true); if (cb) cb(k); } }; return c; };
    window.__answers = [];
    const ask = G.ui.ask;
    G.ui.ask = (q, opts, who, o) => { const pr = ask(q, opts, who, o); window.__asking = true; return pr.then((r) => { window.__asking = false; return r; }); };
  });
  async function drive(maxMs) {
    const t0 = Date.now();
    for (;;) {
      if (Date.now() - t0 > (maxMs || 60000)) return 'timeout';
      const st = await p.evaluate(() => ({ run: G.script.running, top: G.ui.top() && G.ui.top().name, bat: G.battle.active, modal: !document.getElementById('modal').hidden, title: (document.querySelector('.m-title') || {}).textContent || '' }));
      if (!st.run && !st.bat && st.top === 'base') return 'done';
      if (st.top === 'battle' || st.bat) { await p.evaluate(() => { if (G.battle.mon && G.battle.phase === 'fight') G.battle.mon.hp = Math.min(G.battle.mon.hp, 0.5); }); await p.keyboard.press('Space'); await p.waitForTimeout(40); continue; }
      if (st.top === 'ask') {
        // 선택지는 뜬 직후 잠깐 확정을 받지 않는다 → 기다렸다가 고른다
        await p.waitForTimeout(260);
        const k = await p.evaluate(() => (window.__answers.length ? window.__answers.shift() : 0));
        for (let i = 0; i < k; i++) await p.keyboard.press('ArrowDown');
        await p.keyboard.press('z'); await p.waitForTimeout(40); continue;
      }
      if (st.modal) {
        const typed = await p.evaluate(() => {
          const code = window.__keypad;
          if (!code || !document.querySelector('.keypad')) return false;
          for (const ch of code) document.querySelector('[data-act="k"][data-n="' + ch + '"]').click();
          document.querySelector('[data-act="ok"]').click();
          window.__keypad = null;
          return true;
        });
        if (typed) { await p.waitForTimeout(60); continue; }
        const ru = await p.evaluate(() => window.__rankup);
        if (ru != null) { await p.evaluate((i) => { const b = document.querySelector('[data-act="rankup"][data-i="' + i + '"]'); if (b) b.click(); window.__rankup = null; }, ru); await p.waitForTimeout(100); continue; }
        await p.keyboard.press('x'); await p.waitForTimeout(30); continue;
      }
      await p.keyboard.press('z');
      await p.waitForTimeout(15);
    }
  }
  await drive(20000);
  let ok = 0, fail = 0;
  for (const [name, prep, target, expect, answers] of SCENES) {
    const before = errs.length;
    await p.evaluate(([prep, answers, target]) => {
      const s = G.state;
      if (prep.lv && s.lv < prep.lv) { const E = G.engine; E.addExp(s, G.data.totalExp(prep.lv) - s.exp); }
      if (prep.gold) s.gold = Math.max(s.gold, prep.gold);
      Object.assign(s.quests, prep.quests || {}); Object.assign(s.books, prep.books || {}); Object.assign(s.inv, prep.inv || {});
      for (const k in prep.ranks || {}) s.ranks[k] = Math.max(s.ranks[k] || 0, prep.ranks[k]);
      for (const r of ['r2', 'r3', 'r4', 'r5']) s.pw[r] = true;
      s.hp = G.engine.derive(s).hpMax;
      window.__answers = (answers || []).slice();
      window.__keypad = target.keypad || null; window.__rankup = target.rankup != null ? target.rankup : null;
      if (prep.map) G.main.enterMap(prep.map, prep.x, prep.y, prep.dir || 'up', { noBanner: true });
    }, [prep, answers, target]);
    await p.waitForTimeout(80);
    await p.evaluate((t) => {
      const F = G.field, m = F.map;
      if (t.npc) { const n = F.npcs.find((x) => x.id === t.npc && (!x.cond || x.cond(G.state))); if (!n) throw new Error('NPC 없음: ' + t.npc); F.onInteract({ type: 'npc', npc: n }); }
      else if (t.fixed) { const mo = F.mons.find((x) => x.mon === t.fixed); if (!mo) throw new Error('몬스터 없음: ' + t.fixed); F.onEncounter(mo); }
      else if (t.trigger != null) { const tr = m.triggers[t.trigger]; if (tr.once) G.state.flags[tr.once] = true; G.script.run(tr.run); }
      else if (t.enter) { if (m.enter) G.script.run(m.enter); }
      else if (t.obj) { const o = F.objAt(t.obj[0], t.obj[1]); if (!o) throw new Error('오브젝트 없음 ' + t.obj); F.onInteract({ type: 'obj', obj: o }); }
      else if (t.pickup) { const o = F.objs.find((x) => x.id === t.pickup); if (!o) throw new Error('줍기 없음'); F.onInteract({ type: 'obj', obj: o }); }
      else if (t.build) { const bb = F.builds.find((x) => x.talk && x.talk.name === t.build); if (!bb) throw new Error('건물 없음 ' + t.build); F.onInteract({ type: 'door', b: bb }); }
    }, target).catch((e) => errs.push(name + ': ' + e.message));
    const res = await drive(90000);
    const s = await p.evaluate(() => JSON.parse(G.engine.serialize(G.state)));
    const good = res === 'done' && expect(s) && errs.length === before;
    if (good) ok++; else fail++;
    console.log((good ? '  ✓ ' : '  ✗ ') + name + (good ? '' : ' — ' + res + ' · 상태 ' + JSON.stringify({ map: s.map, lv: s.lv, q: s.quests }).slice(0, 400) + (errs.length > before ? ' · 오류: ' + errs.slice(before).join(' / ') : '')));
  }
  console.log('통과 ' + ok + ' · 실패 ' + fail + (errs.length ? ' · 전체 오류 ' + errs.length : ''));
  await b.close();
  process.exitCode = fail ? 1 : 0;
})();
