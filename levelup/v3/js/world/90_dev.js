/* 개발 · 시험 도우미: 장(章) 시작 상태로 바로 건너뛰기. 주소에 ?dev=c3&route=night 처럼 쓰거나 G.story.devJump('c3', 'night') */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story;
  const TS = G.tiles.TS;
  // 각 장을 마쳤을 때 세워지는 깃발 · 얻는 것
  const DONE = {
    c1: { flags: ['c1_sword', 'c1_trained', 'c1_tower', 'c1_quest_dew', 'c1_dew', 'c1_dew_given', 'c1_night', 'c1_done', 'open:red', 'ch:c1', 'd1:boss', 'd1:heart', 'met:evelyn', 'met:noah', 'met:marien'], items: ['sw_start', 'bow', 'letter_volkan'], hearts: 1, lv: 4 },
    c2: { flags: ['ch:c2', 'c2_letter', 'c2_mine_ok', 'd2:boss', 'd2:heart', 'c2_extractor', 'c2_done', 'slide_clear', 'open:blue', 'met:volkan', 'met:rud'], items: ['bomb', 'ar_leather'], take: ['letter_volkan'], hearts: 1, lv: 8 },
    c3: { flags: ['ch:c3', 'c3_octavio', 'c3_riddles', 'c3_archive', 'c3_luce', 'd3:boss', 'd3:heart', 'c3_luce_done', 'c3_duel', 'c3_boat', 'c3_done', 'open:yellow'], items: ['flippers', 'hook'], truth: ['t_five', 't_log'], hearts: 1, lv: 12 },
    c4: { flags: ['ch:c4', 'c4_done', 'open:purple', 'd4:boss', 'd4:heart'], items: ['sh_mirror'], hearts: 1, lv: 16 },
    c5: { flags: ['ch:c5', 'c5_vera', 'c5_viola', 'c5_sybil', 'c5_tea', 'c5_done', 'open:rainbow', 'd5:boss', 'd5:heart'], items: ['mirror', 'tome_ice'], truth: ['t_note'], hearts: 1, lv: 20 },
    c6: { flags: ['ch:c6', 'c6_chroma', 'c6_rolo', 'c6_ember', 'c6_finale', 'c6_done', 'open:white', 'd6:boss', 'd6:heart', 'white_hair', 'pillar_broken'], items: ['glove'], spells: ['light'], hearts: 1, lv: 25 },
    c7: { flags: ['ch:c7', 'c7_lumie', 'c7_iska', 'c7_plan', 'c7_noah', 'c7_edel', 'noah_to_white', 'noah_herb', 'c7_done', 'open:gray', 'd7:boss', 'd7:heart'], items: ['sw_silver', 'ar_cold'], spells: ['heal'], hearts: 1, lv: 30 },
    c8: { flags: ['ch:c8', 'c8_bolt', 'c8_color', 'c8_proof', 'c8_mk7', 'c8_recording', 'c8_done', 'open:black', 'd8:boss', 'd8:heart'], items: ['lantern', 'reverser', 'silver_rec'], truth: ['t_grey', 't_bolt'], hearts: 1, lv: 35 },
    c9: { flags: ['ch:c9', 'c9_mid', 'c9_in', 'c9_done', 'lyra_sister', 'open:colorful', 'd9:boss', 'd9:heart'], items: ['bw_long', 'key_night', 'ledger'], join: ['lyra'], hearts: 1, lv: 40 },
    c10: { flags: ['ch:c10', 'c10_pyros', 'c10_parts', 'part:nozzle', 'part:fuel', 'part:compass', 'part:plating', 'part:sail', 'part:shield', 'c10_launch', 'c10_done', 'voices'], items: [], hearts: 1, lv: 44 },
    c11: { flags: ['ch:c11', 'c11_stella', 'c11_wake', 'c11_done', 'd11:boss', 'd11:heart'], items: ['ac_star'], truth: ['t_star'], hearts: 1, lv: 48 },
  };
  const ORDER = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  ST.devJump = function (ch, route) {
    route = route || 'order';
    const s = G.state = G.st.fresh('아린', 'boy');
    s.party = ['toria']; s.ch = ch; s.seeds = 0;
    const upto = ORDER.indexOf(ch);
    for (let i = 0; i < upto; i++) {
      const D = DONE[ORDER[i]]; if (!D) continue;
      for (const k of D.flags) s.flags[k] = true;
      for (const id of D.items || []) G.st.give(s, id);
      for (const id of D.take || []) G.st.take(s, id);
      for (const t of D.truth || []) s.truth[t] = 1;
      for (const j of D.join || []) if (!s.party.includes(j)) s.party.push(j);
      for (const sp of D.spells || []) G.st.learnSpell(s, sp);
      s.hearts += D.hearts || 0;
      s.lv = D.lv || s.lv;
      s.route[route] += 3;
      s.flags['c' + (i + 1) + '_route'] = route;
    }
    if (upto >= 3) s.flags.route_lock1 = route;
    if (upto >= 6) s.flags.route_lock = route;
    s.sp = Math.floor(s.lv / 2); s.gold = 500 * upto; s.ammo.arrows = 30; s.ammo.bombs = s.tools.bomb ? 10 : 0;
    s.hp = G.st.derive(s).hpMax; s.mp = G.st.derive(s).mpMax;
    if (upto >= 1) G.st.learnSpell(s, 'fire');
    const T = G.ow.towns;
    const at = { c1: 'green', c2: 'green', c3: 'red', c4: 'yellow', c5: 'yellow', c6: 'purple', c7: 'rainbow', c8: 'white', c9: 'gray', c10: 'black', c11: 'colorful', c12: 'colorful' }[ch] || 'green';
    G.build.get('world');
    const t = T[at];
    G.world.player = null;
    if (ch === 'c11') { s.ch = 'c10'; G.game.goto('station', 17 * TS + 8, 17 * TS + 12, 'up', { fresh: true }); G.ui.hideTitle(); return; }
    if (ch === 'c12') { s.ch = 'c11'; G.game.goto('astra', 28 * TS + 8, 40 * TS + 12, 'up', { fresh: true }); G.ui.hideTitle(); return; }
    G.game.goto('world', (t.x + (t.w >> 1)) * TS + 8, (t.y + t.h + 1) * TS + 12, 'up', { fresh: true });
    G.ui.hideTitle();
  };
  // 주소로 건너뛰기
  const q = typeof location !== 'undefined' ? location.search : '';
  const m = /[?&]jump=(c\d+)/.exec(q);
  if (m) {
    const r = /[?&]route=(\w+)/.exec(q);
    G.game = G.game || {};
    G.game.start = () => ST.devJump(m[1], r ? r[1] : 'order');
  }
})();
