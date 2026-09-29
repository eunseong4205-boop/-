#!/usr/bin/env node
/* 갈림길 테스트: 이야기의 대안 경로, 심연의 기록, 여덟 가지 결말을 실제 브라우저에서 돌린다.
   story-test.js가 기본 선택(늘 첫 번째 답)으로 끝까지 가는 길을 확인한다면, 이쪽은 다른 답을 고른 길을 확인한다.
   사용법: node levelup/tools/branch-test.js [levelup.html 경로] */
'use strict';
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const FILE = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'levelup.html'));

const ALL_TRUTHS = ['t_chart', 't_log', 't_colors', 't_serin', 't_612', 't_design', 't_stella', 't_bella'];
const GOOD = { d_ledger: 'burn', d_kkachi: 'spare', d_festival: 'third', d_patient: 'herb', d_bolt: 'talk', d_nocturne: 'promise', nocturne_ally: true, d_stella: 'carry', stella_ally: true, kairon_father: true };
const BAD = { d_ledger: 'post', d_kkachi: 'report', d_goldie: 'expose', d_festival: 'bomb', d_patient: 'lumie', d_bolt: 'fight', d_nocturne: 'force', d_stella: 'off' };
const FINAL = { lv: 900000, ranks: { r5: 40 }, quests: { m12: 2 }, map: 'astra_seal', x: 12, y: 8, dir: 'up' };

// [이름, 준비, 대상, 기대, 답]. fresh: 새 게임에서 시작
const SCENES = [
  ['1장 · 나무 정령에게 노래', { lv: 20, books: { b_song: 1 }, quests: { m1: 2 }, map: 'green_forest', x: 18, y: 6, dir: 'up' }, { fixed: 'treant' }, (s) => s.flags.d_treant === 'song' && s.inv.stick && s.quests.m1 === 3],
  ['1장 · 고르디의 거짓 보고', { lv: 24, quests: { m1: 4 }, map: 'green', x: 19, y: 10, dir: 'down' }, { trigger: 0 }, (s) => s.flags.d_report === 'lie' && s.quests.m1 === 5, [1]],
  ['2장 · 장부를 루드에게', { lv: 90, gold: 5000, flags: { m_red_galaxy: true, red_intro: true }, map: 'red', x: 18, y: 11, dir: 'down' }, { trigger: 0 }, (s) => s.flags.d_ledger === 'rud' && s.flags.d_rud === 'badge', [1, 1]],
  ['2장 · 광산 문지기의 비밀번호', { map: 'red', x: 7, y: 26, dir: 'up' }, { npc: 'dolsoe' }, (s) => s.flags.dolsoe_code && s.flags.dolsoe_mine, [1, 0]],
  ['3장 · 크라켄에게 물고기', { lv: 560, inv: { f_mackerel: 1 }, quests: { m3: 4 }, map: 'seacave', x: 16, y: 3, dir: 'up' }, { fixed: 'kraken' }, (s) => s.flags.d_kraken === 'feed' && s.inv.compass && s.quests.m3 === 5],
  ['4장 · 부엌 뒷길', { flags: { button_back: true, d_kkachi: 'spare', sparrow_asked: true }, quests: { m4: 3, q_sparrow: 'done' }, map: 'yellow', x: 12, y: 21, dir: 'up' }, { npc: 'kkachi' }, (s) => s.flags.palace_open && s.flags.d_palace === 'sneak' && s.quests.m4 === 4],
  ['4장 · 금화왕의 장부를 뿌린다', { lv: 2000, map: 'palace', x: 9, y: 4, dir: 'up' }, { npc: 'goldie' }, (s) => s.flags.d_goldie === 'expose' && s.quests.m4 === 6, [0, 1]],
  ['5장 · 세린의 마지막 장', { quests: { q_teacup: 'done' }, flags: { vision_seen: true, m_purple_vera: true }, map: 'academy', x: 10, y: 6, dir: 'up' }, { npc: 'vera' }, (s) => s.flags.d_serin_page === 'take' && s.truth.t_serin],
  ['6장 · 폭약 없이 중계탑을', { quests: { m6: 3 }, map: 'dawn_base', x: 7, y: 5, dir: 'up' }, { npc: 'lea' }, (s) => s.flags.d_festival === 'third' && s.flags.rainbow_tower_cracked && s.quests.m6 === 4, [1]],
  ['8장 · 세피아의 목소리로 설득', { lv: 120000, quests: { m8: 4, q_noel: 'done' }, map: 'factory', x: 16, y: 25, dir: 'up' }, { npc: 'bolt' }, (s) => s.flags.d_bolt === 'talk' && s.quests.m8 === 5],
  ['8장 · 볼트의 서랍', { inv: { drawer_key: 1 }, map: 'workshop', x: 2, y: 3, dir: 'up' }, { obj: [2, 2] }, (s) => s.truth.t_design],
  ['9장 · 고르디가 연 정문', { flags: { d_report: 'truth' }, bond: { dolsoe: 2 }, quests: { m9: 1 }, map: 'black', x: 18, y: 5, dir: 'up' }, { build: 'castleGate' }, (s) => s.flags.castle_open && s.flags.d_castle === 'gate' && s.quests.m9 === 4],
  ['9장 · 미드나잇에게 비밀을', { map: 'midnight_shop', x: 4, y: 5, dir: 'up' }, { npc: 'midnight' }, (s) => s.flags.d_midnight === 'secret' && s.flags.m_black_midnight && s.truth.t_colors],
  ['9장 · 녹턴과의 약속', { lv: 250000, quests: { m9: 4 }, map: 'castle2', x: 13, y: 6, dir: 'up' }, { npc: 'nocturne' }, (s) => s.flags.d_nocturne === 'promise' && s.flags.nocturne_ally && s.inv.night_key && s.quests.m9 === 6, [1, 0, 1]],
  ['6장 뒤 · 쌍둥이에게 빛을', { flags: { m_rainbow_share: true }, map: 'red_rud', x: 1, y: 4, dir: 'up' }, { npc: 'luka' }, (s) => s.flags.twins_healed],
  ['2장 · 화로가 기억하는 983년', { flags: { red_intro: true }, map: 'red_forge', x: 5, y: 4, dir: 'up' }, { npc: 'hwaro' }, (s) => s.flags.hwaro_983],
  ['3장 · 흰빛이 사라진 해들', { map: 'library', x: 18, y: 9, dir: 'up' }, { obj: [18, 8] }, () => true],
  ['5장 · 거울 연못의 두 그림자', { map: 'mirror_pond', x: 15, y: 16, dir: 'up' }, { obj: [15, 15] }, (s) => s.flags.pond_twice],
  ['7장 · 눈을 가린 세 성녀', { map: 'cathedral', x: 5, y: 4, dir: 'up' }, { obj: [5, 3] }, () => true],
  ['10장 · 갈 때 하나, 올 때 둘', { map: 'hangar', x: 4, y: 4, dir: 'up' }, { obj: [4, 3] }, () => true],
  ['밤 · 토리아의 자장가', {}, { night: 'ab_lullaby' }, (s) => true, [1]],
  ['밤 · 유리 속의 꿈', {}, { night: 'ab_glass' }, (s) => true, [2]],
  ['밤 · 흰 털 한 가닥', { flags: { hero_streak: true } }, { night: 'ab_hair' }, (s) => true],
  ['동행 · 전령의 목소리', {}, { talk: 'ab_herald' }, (s) => true],
  ['9장 · 고양이의 그림자', { flags: { m_black_midnight: true }, map: 'midnight_shop', x: 7, y: 5, dir: 'down' }, { obj: [7, 6] }, (s) => s.flags.saw_shadow],
  ['9장 · 미드나잇의 고백', { map: 'midnight_shop', x: 4, y: 5, dir: 'up' }, { npc: 'midnight' }, (s) => s.abyss.a_midnight && s.flags.midnight_trust && s.flags.d_midnight_secret === 'keep', [2]],
  ['9장 · 허용 손실 장부', { flags: { m_black_nocturne: true, m_black_kairon: true }, map: 'castle2', x: 21, y: 3, dir: 'up' }, { obj: [21, 2] }, (s) => s.abyss.a_ledger && s.books.b_loss],
  ['9장 · 빈 기사의 이름표', { map: 'castle1', x: 21, y: 24, dir: 'down' }, { obj: [21, 25] }, (s) => s.abyss.a_hollow && s.books.b_hollow_song],
  ['뒤 · 할머니의 창', { map: 'home', x: 10, y: 3, dir: 'up' }, { examine: [10, 2, 'q'] }, (s) => s.abyss.a_gran && s.flags.spear_found],
  ['8장 · 과녁 크기', { map: 'workshop', x: 12, y: 3, dir: 'up' }, { obj: [12, 2] }, (s) => s.abyss.a_plan],
  ['11장 · 냉동 수면실', { quests: { q_crew: 'done' }, flags: { m_space_truth: true }, map: 'quarters', x: 10, y: 5, dir: 'down' }, { obj: [10, 6] }, (s) => s.map === 'cryo' && s.flags.cryo_seen],
  ['11장 · 원본 기록', { map: 'cryo', x: 7, y: 6, dir: 'up' }, { obj: [7, 5] }, (s) => s.abyss.a_crew && s.flags.d_cryo === 'truth' && s.flags.stella_confessed, [1]],
  ['11장 · 탑 통신망 (미드나잇)', { lv: 650000, ranks: { r5: 20 }, quests: { m11: 4 }, map: 'deck', x: 12, y: 5, dir: 'up' }, { obj: [12, 4] }, (s) => s.flags.creed === 'midnight' && s.map === 'astra_gate', [0, 5]],
  ['12장 · 벨라의 고백', { map: 'astra_fort', x: 24, y: 10, dir: 'up' }, { npc: 'bella' }, (s) => s.abyss.a_vessel && s.truth.t_bella],
  ['12장 · 아우룸의 잔상', { flags: { visit_astra_gate: true }, map: 'astra_gate', x: 11, y: 10, dir: 'up' }, { npc: 'aurum' }, (s) => s.abyss.a_midnight],
  ['결말 · 나눔 (흰빛을 내려놓다)', Object.assign({ fresh: true, truths: ALL_TRUTHS, flags: Object.assign({ hero_streak: true }, GOOD), bond: { rud: 2, vera: 1 }, quests: { m12: 2, q_light: 'done', q_noel: 'done', q_lamps: 'done', q_miru: 'done' } }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'true' && s.flags.kairon_persuaded && s.flags.called_father && s.flags.hero_green && s.follower === 'dotori' && s.abyss.a_toria && s.map === 'festival', [0, 0, 0, 2]],
  ['결말 · 나눔 천년제 (할머니의 약속)', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done' && s.flags.gran_pact_talked && s.endings.true],
  ['결말 · 베르나의 네잎클로버', { inv: { clover: 1 }, map: 'festival', x: 15, y: 17, dir: 'up' }, { npc: 'bomi' }, (s) => s.flags.clover_asked && !s.inv.clover],
  ['결말 · 새벽 (토리아를 돌려보낸다)', Object.assign({ fresh: true, truths: ALL_TRUTHS, flags: GOOD, bond: { rud: 2, vera: 1 }, quests: { m12: 2, q_light: 'done', q_noel: 'done', q_lamps: 'done', q_miru: 'done' } }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'dawn' && !s.follower && s.map === 'festival', [0, 0, 0, 0]],
  ['결말 · 새벽 천년제', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
  ['결말 · 둥지 (검으로 · 토리아를 붙잡는다)', Object.assign({ fresh: true, truths: ALL_TRUTHS, flags: GOOD, bond: { rud: 2, vera: 1 }, quests: { m12: 2, q_light: 'done', q_noel: 'done', q_lamps: 'done', q_miru: 'done' } }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'nest' && !s.flags.kairon_persuaded && s.follower === 'dotori' && s.map === 'festival', [0, 1, 1, 1]],
  ['결말 · 둥지 천년제', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
  ['결말 · 속죄', Object.assign({ fresh: true, truths: ['t_chart', 't_log', 't_colors', 't_612', 't_bella'], flags: BAD }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'atone' && s.flags.kairon_persuaded && s.map === 'festival', [0, 0, 0]],
  ['결말 · 속죄 천년제', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
  ['결말 · 밤 (미드나잇)', Object.assign({ fresh: true, truths: [], flags: Object.assign({ creed: 'midnight', midnight_trust: true }, BAD), abyss: ['a_midnight'] }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'night' && s.map === 'festival', [0, 1, 1]],
  ['결말 · 밤 천년제', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
  ['결말 · 잔광', Object.assign({ fresh: true, truths: [], flags: BAD }, FINAL), { npc: 'kairon' }, (s) => s.flags.ending_type === 'glow' && !s.flags.kairon_persuaded && s.map === 'festival', [0, 0]],
  ['결말 · 잔광 천년제', { map: 'festival', x: 19, y: 12, dir: 'up' }, { npc: 'gran' }, (s) => s.quests.m13 === 'done'],
  ['결말 · 재 (수정을 태운다)', Object.assign({ fresh: true, truths: [], flags: BAD }, FINAL), { npc: 'kairon' }, (s) => s.endings.ash && !s.flags.ending && s.flags.finale_rewind && s.map === 'astra_seal', [1]],
  ['결말 · 되풀이 (다시, 수정 앞에서)', { map: 'astra_seal', x: 12, y: 8, dir: 'up' }, { npc: 'kairon' }, (s) => s.endings.repeat && s.endings.ash && !s.flags.ending && s.map === 'astra_seal', [2]],
  ['결말 · 되돌아온 뒤 잔광', { map: 'astra_seal', x: 12, y: 8, dir: 'up' }, { npc: 'kairon' }, (s) => s.flags.ending_type === 'glow' && s.endings.glow && s.map === 'festival', [0, 0]],
];

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  async function fresh() {
    await p.goto('file://' + FILE);
    await p.waitForTimeout(400);
    await p.click('[data-t="new"]');
    await p.click('[data-t="start"]');
    await p.waitForTimeout(300);
    await p.evaluate(() => {
      G.state.settings.textSpeed = 3; G.state.settings.music = false; G.state.settings.sfx = false;
      const orig = G.script.ctx;
      G.script.ctx = () => { const c = orig(); c.clickRace = async () => 999; c.waitClick = async (n, cb) => { for (let k = 1; k <= (n || 1); k++) { G.main.clickField(true); if (cb) cb(k); } }; return c; };
      window.__answers = [];
    });
    await drive(20000);
  }
  async function drive(maxMs) {
    const t0 = Date.now();
    for (;;) {
      if (Date.now() - t0 > (maxMs || 60000)) return 'timeout';
      const st = await p.evaluate(() => ({ run: G.script.running, top: G.ui.top() && G.ui.top().name, bat: G.battle.active, modal: !document.getElementById('modal').hidden }));
      if (!st.run && !st.bat && st.top === 'base') return 'done';
      if (st.top === 'battle' || st.bat) { await p.evaluate(() => { if (G.battle.mon && G.battle.phase === 'fight') { G.battle.mon.hp = Math.min(G.battle.mon.hp, 0.5); G.battle.mon.shield = 0; G.battle.guardAt = -9; } }); await p.keyboard.press('Space'); await p.waitForTimeout(40); continue; }
      if (st.top === 'ask') {
        await p.waitForTimeout(260);
        const k = await p.evaluate(() => (window.__answers.length ? window.__answers.shift() : 0));
        for (let i = 0; i < k; i++) await p.keyboard.press('ArrowDown');
        await p.keyboard.press('z'); await p.waitForTimeout(40); continue;
      }
      if (st.modal) { await p.keyboard.press('x'); await p.waitForTimeout(30); continue; }
      await p.keyboard.press('z');
      await p.waitForTimeout(15);
    }
  }
  await fresh();
  let ok = 0, fail = 0;
  for (const [name, prep, target, expect, answers] of SCENES) {
    if (prep.fresh) await fresh();
    const before = errs.length;
    await p.evaluate(([prep, answers]) => {
      const s = G.state;
      if (prep.lv && s.lv < prep.lv) G.engine.addExp(s, G.data.totalExp(prep.lv) - s.exp);
      if (prep.gold) s.gold = Math.max(s.gold, prep.gold);
      Object.assign(s.quests, prep.quests || {}); Object.assign(s.books, prep.books || {}); Object.assign(s.inv, prep.inv || {}); Object.assign(s.flags, prep.flags || {});
      s.bond = Object.assign(s.bond || {}, prep.bond || {});
      if (prep.truths) { s.truth = {}; for (const t of prep.truths) s.truth[t] = 1; }
      if (prep.abyss) { s.abyss = {}; for (const t of prep.abyss) s.abyss[t] = 1; }
      if (prep.fresh) G.field.setFollower('dotori');
      for (const k in prep.ranks || {}) s.ranks[k] = Math.max(s.ranks[k] || 0, prep.ranks[k]);
      for (const r of ['r2', 'r3', 'r4', 'r5']) s.pw[r] = true;
      s.hp = G.engine.derive(s).hpMax;
      window.__answers = (answers || []).slice();
      if (prep.map) G.main.enterMap(prep.map, prep.x, prep.y, prep.dir || 'up', { noBanner: true });
    }, [prep, answers]);
    await p.waitForTimeout(80);
    await p.evaluate((t) => {
      const F = G.field, m = F.map;
      if (t.npc) { const n = F.npcs.find((x) => x.id === t.npc && (!x.cond || x.cond(G.state))); if (!n) throw new Error('NPC 없음: ' + t.npc); F.onInteract({ type: 'npc', npc: n }); }
      else if (t.fixed) { const mo = F.mons.find((x) => x.mon === t.fixed); if (!mo) throw new Error('몬스터 없음: ' + t.fixed); F.onEncounter(mo); }
      else if (t.trigger != null) { const tr = m.triggers[t.trigger]; if (tr.once) G.state.flags[tr.once] = true; G.script.run(tr.run); }
      else if (t.obj) { const o = F.objAt(t.obj[0], t.obj[1]); if (!o) throw new Error('오브젝트 없음 ' + t.obj); F.onInteract({ type: 'obj', obj: o }); }
      else if (t.night) { const n = G.story.nights.find((x) => x.id === t.night); if (!n) throw new Error('밤 없음 ' + t.night); G.script.run(async (c) => { await n.run(c); }); }
      else if (t.talk) { const n = G.story.talks.find((x) => x.id === t.talk); if (!n) throw new Error('대화 없음 ' + t.talk); G.script.run(async (c) => { await n.run(c); }); }
      else if (t.examine) { const fn = m.examine(t.examine[0], t.examine[1], t.examine[2]); if (typeof fn !== 'function') throw new Error('살펴볼 곳 없음 ' + t.examine); G.script.run(fn); }
      else if (t.build) { const bb = F.builds.find((x) => x.talk && x.talk.name === t.build); if (!bb) throw new Error('건물 없음 ' + t.build); F.onInteract({ type: 'door', b: bb }); }
    }, target).catch((e) => errs.push(name + ': ' + e.message));
    const res = await drive(120000);
    const s = await p.evaluate(() => JSON.parse(G.engine.serialize(G.state)));
    const good = res === 'done' && expect(s) && errs.length === before;
    if (good) ok++; else fail++;
    console.log((good ? '  ✓ ' : '  ✗ ') + name + (good ? '' : ' — ' + res + ' · ' + JSON.stringify({ map: s.map, q: s.quests, d: Object.keys(s.flags).filter((k) => k.startsWith('d_')).map((k) => k + '=' + s.flags[k]), end: s.flags.ending_type }).slice(0, 500) + (errs.length > before ? ' · 오류: ' + errs.slice(before).join(' / ') : '')));
  }
  console.log('통과 ' + ok + ' · 실패 ' + fail);
  await b.close();
  process.exitCode = fail ? 1 : 0;
})();
