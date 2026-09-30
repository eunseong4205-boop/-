/* 저장되는 상태: 주인공 · 장비 · 가방 · 마법 · 재능 · 깃발 · 부탁 · 위치 · 세력 마음
   파생 능력치(공격 · 방어 · 최대 체력 …)는 매번 계산한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const D = G.data;
  const U = G.u;
  const VERSION = 3;
  const KEY = 'levelup-v3-save';

  function fresh(name, gender) {
    return {
      v: VERSION, name: name || '아린', gender: gender || 'boy', t: 0,
      hearts: 3, hp: 12, mp: 30, mpMaxBase: 30, stamBase: 100,
      lv: 1, exp: 0, sp: 0, pts: 0, gold: 0,
      stats: { str: 0, vit: 0, sta: 0, int: 0, dex: 0 }, specials: { flash: true }, specialMove: 'flash', deaths: 0,
      equip: { sword: null, shield: null, armor: 'ar_tunic', bow: null, focus: null, acc1: null, acc2: null },
      tool: null, spell: null, special: 0,
      tools: {}, spells: {}, skills: {},
      ammo: { arrows: 0, bombs: 0, arrowsMax: 30, bombsMax: 10 },
      inv: {}, keys: {}, bigkeys: {}, pieces: 0,
      flags: {}, quests: {}, log: [], books: {}, truth: {}, abyss: {}, bond: {}, endings: {}, seen: {},
      route: { dawn: 0, order: 0, night: 0 },
      map: null, x: 0, y: 0, respawn: null, waystones: {}, visited: {}, buffs: [],
      settings: { music: true, sfx: true, vol: 0.7, textSpeed: 2, shake: true, minimap: true, diff: 1 },
    };
  }

  /** 파생 능력치 */
  function derive(s) {
    const I = D.ITEMS, P = G.prog;
    const sw = s.equip.sword ? I[s.equip.sword] : null;
    const ar = s.equip.armor ? I[s.equip.armor] : I.ar_tunic;
    const bw = s.equip.bow ? I[s.equip.bow] : null;
    const fc = s.equip.focus ? I[s.equip.focus] : null;      // 마도구: 지팡이 · 수정구 · 마도서
    const fxs = [ar.fx, fc && fc.fx].concat([s.equip.acc1, s.equip.acc2].filter(Boolean).map((id) => (I[id] && I[id].fx) || {})).filter(Boolean);
    const sum = (k) => fxs.reduce((a, f) => a + (f[k] || 0), 0);
    const now = s.t;
    const buff = (k, def) => s.buffs.filter((b) => b.until > now && b[k] != null).reduce((a, b) => a * b[k], def);
    const sk = (id) => !!s.skills[id];
    const st = s.stats || {};
    const stat = (k) => Math.max(0, (st[k] || 0) + sum(k));
    const STR = stat('str'), VIT = stat('vit'), STA = stat('sta'), INT = stat('int'), DEX = stat('dex');
    const hpMax = (s.hearts + (sk('sv_heart') ? 1 : 0)) * 4 + Math.floor(VIT / 3);
    const low = hpMax > 0 ? 1 - U.clamp(s.hp / hpMax, 0, 1) : 0;
    const rage = (sum('berserk') && s.hp < hpMax / 2 ? 1 + sum('berserk') : 1) * (sk('sv_adren') ? 1 + 0.4 * low : 1);
    const soft = P ? P.soft : (v, k) => v * k;
    // 마도구 효과 (집중 재능이면 1.5배)
    const fk = sk('mg_focus') ? 1.5 : 1;
    const fAmp = (v, base) => (v == null ? base : base + (v - base) * fk);
    const elBoost = {};
    if (fc && fc.elb) for (const k in fc.elb) elBoost[k] = fAmp(fc.elb[k], 1);
    return {
      atk: ((sw ? sw.atk : 1) * (1 + soft(STR, 0.04)) + (s.lv - 1) * 0.06) * buff('atk', 1) * rage * (sk('sw_master') ? 1.2 : 1),
      reach: sw ? sw.reach : 16,
      el: sw ? sw.el : null,
      beam: !!(sw && sw.beam) || sk('sw_master'), beamAt: sw && sw.beamAt ? sw.beamAt : 1,
      swordCol: sw ? sw.col : '#c8a070', swordGlow: sw ? sw.glow : null, grade: sw ? (sw.grade || 1) : 1,
      swing: ((sw && sw.speed) || 1) / (1 + sum('speed')), heavy: ((sw && sw.heavy) || 1) * (1 + Math.min(0.5, STR * 0.01)), drain: (sw && sw.drain) || 0,
      def: (ar.def || 1) * buff('def', 1) * (sk('sv_iron') ? 0.85 : 1) * (1 - Math.min(0.2, VIT * 0.004)),
      resist: ar.resist || null,
      bowAtk: bw ? (bw.atk * (1 + soft(DEX, 0.045)) + (s.lv - 1) * 0.04) * rage : 0, bowEl: bw ? bw.el || null : null, bowGrade: bw ? (bw.grade || 1) : 1, bowMulti: bw ? bw.multi || 1 : 1, bowPierce: bw ? bw.pierce || 0 : 0,
      draw: (bw ? bw.draw : 0.6) * (sk('bw_fast') ? 0.7 : 1) * (1 - Math.min(0.25, DEX * 0.006)),
      hpMax,
      mpMax: s.mpMaxBase + (sk('mg_pool') ? 30 : 0) + INT * 3 + Math.floor(s.lv / 2),
      stamMax: s.stamBase + sum('stamina') + (sk('sv_stam') ? 30 : 0) + STA * 5,
      crit: Math.min(0.6, 0.05 + sum('crit') + ((sw && sw.crit) || 0) + Math.min(0.25, DEX * 0.005) + (sk('bw_master') ? 0.15 : 0)),
      mpRegen: sum('mpRegen') + (sk('mg_flow') ? 0.8 : 0),
      regen: sum('regen') + (sk('sv_regen') ? 0.6 : 0),
      rollCost: 24 * (1 - sum('roll')) * (1 - Math.min(0.3, STA * 0.008)),
      rollIframes: 0.28 * (sk('sv_roll') ? 1.5 : 1) + sum('roll') * 0.1,
      expMul: 1 + sum('exp'),
      goldMul: 1 + sum('gold'),
      specialMul: (1 + sum('special')) * (1 + Math.min(0.4, INT * 0.01)) * (sk('sv_adren') ? 1 + 0.4 * low : 1),
      magMul: (1 + soft(INT, 0.05)) * (sk('mg_power') ? 1.5 : 1) * (sk('mg_master') ? 1.3 : 1) * fAmp(fc && fc.mag, 1),
      mpCost: (sk('mg_thrift') ? 0.65 : 1) * fAmp(fc && fc.cost, 1),
      castMul: fAmp(fc && fc.cast, 1), elBoost, focus: fc ? s.equip.focus : null,
      boltChain: 3 + (sk('mg_chain') ? 1 : 0) + ((fc && fc.chain) || 0), icePierce: 2 + (sk('mg_chain') ? 1 : 0),
      fireBlast: 0.6 * ((fc && fc.blast) || 1), echo: (sk('mg_echo') ? 0.25 : 0) + ((fc && fc.echo) || 0),
      thrust: (sw && sw.thrust) || 0, twin: (sw && sw.twin) || 0, bleed: !!(sw && sw.bleed),
      bowRapid: !!(bw && bw.rapid), bowHoming: (bw && bw.homing) || 0, bowCrit: (bw && bw.crit) || 0, bowRet: !!(bw && bw.ret),
      chargeTime: sk('sw_charge') ? 0.3 : 0.5,
      stamRegen: buff('stamina', 1) * (1 + Math.min(0.6, STA * 0.02)),
      herb: sk('sv_herb') ? 1.5 : 1,
      vamp: sum('vamp'), phoenix: sum('phoenix') > 0,
      warm: s.buffs.some((b) => b.until > now && b.warm) || ar.resist === 'cold' || ar.resist === 'all',
      heatOk: ar.resist === 'heat' || ar.resist === 'all',
      stealth: !!ar.stealth,
      stats: { str: STR, vit: VIT, sta: STA, int: INT, dex: DEX },
    };
  }

  const has = (s, id, n) => (s.inv[id] || 0) >= (n || 1);
  function give(s, id, n) {
    n = n || 1;
    const it = D.ITEMS[id];
    if (!it) return;
    if (it.type === 'ammo') { s.ammo[it.ammo] = Math.min(s.ammo[it.ammo + 'Max'], s.ammo[it.ammo] + it.n * n); return; }
    if (it.type === 'tool') { s.tools[id] = true; if (!s.tool && id !== 'bow') s.tool = id; if (id === 'bow' && !s.equip.bow) s.equip.bow = 'bw_short'; if (id === 'bomb') s.ammo.bombs = Math.max(s.ammo.bombs, 5); return; }
    if (it.type === 'tome') { s.spells[it.spell] = true; if (!s.spell) s.spell = it.spell; return; }
    if (it.type === 'art') { s.specials = s.specials || {}; s.specials[it.special] = true; return; }
    if (id === 'heart_c') { s.hearts++; s.hp = derive(s).hpMax; return; }
    if (id === 'heartpiece') { s.pieces++; if (s.pieces >= 4) { s.pieces -= 4; s.hearts++; s.hp = derive(s).hpMax; } return; }
    s.inv[id] = (s.inv[id] || 0) + n;
    // 처음 얻은 장비는 바로 찬다 (더 좋은 것이면)
    const slot = { sword: 'sword', shield: 'shield', armor: 'armor', bow: 'bow', focus: 'focus' }[it.type];
    if (slot && G.prog && !G.prog.reqOk(s, it.req)) return;   // 아직 못 드는 것은 가방에만
    if (slot) { const cur = s.equip[slot] ? D.ITEMS[s.equip[slot]] : null; if (!cur || (it.atk || 0) > (cur.atk || 0) || (it.lv || 0) > (cur.lv || 0) || (it.def || 1) < (cur.def || 1) || (it.mag || 0) > (cur.mag || 0)) s.equip[slot] = id; }
    if (it.type === 'acc' && G.prog && !G.prog.reqOk(s, it.req)) return;
    if (it.type === 'acc' && !s.equip.acc1) s.equip.acc1 = id; else if (it.type === 'acc' && !s.equip.acc2 && s.equip.acc1 !== id) s.equip.acc2 = id;
  }
  /** 가진 것 중 요구치를 채운 가장 좋은 장비를 찬다 (시험 · 옛 기록 정리용) */
  function autoEquip(s) {
    const I = D.ITEMS, score = (it) => (it.grade || 1) * 10 + (it.atk || 0) + (it.lv || 0) * 3 + (1 - (it.def || 1)) * 40 + (it.mag || 0) * 10;
    for (const slot of ['sword', 'shield', 'armor', 'bow', 'focus']) {
      const own = Object.keys(s.inv).filter((k) => I[k] && I[k].type === slot && s.inv[k] > 0 && (!G.prog || G.prog.reqOk(s, I[k].req)));
      if (slot === 'armor') own.push('ar_tunic');
      own.sort((a, b) => score(I[b]) - score(I[a]));
      if (own[0]) s.equip[slot] = own[0];
    }
  }
  function take(s, id, n) { n = n || 1; if (!has(s, id, n)) return false; s.inv[id] -= n; if (s.inv[id] <= 0) delete s.inv[id]; return true; }
  function learnSpell(s, id) { s.spells[id] = true; if (!s.spell) s.spell = id; }

  /** 빛 알갱이(경험). 렙업하면 참을 돌려준다 */
  function gainExp(s, n) {
    s.exp += n * derive(s).expMul * (G.prog ? G.prog.diff().exp : 1);
    let up = 0;
    while (s.exp >= D.expNext(s.lv)) { s.exp -= D.expNext(s.lv); s.lv++; s.pts = (s.pts || 0) + (G.prog ? G.prog.PTS_PER_LV : 3); up++; }
    if (up) { const d = derive(s); s.hp = Math.min(d.hpMax, s.hp + 4); s.mp = d.mpMax; }
    return up;
  }

  function serialize(s) { return JSON.stringify(s); }
  /** 기록: 이야기 장면이 도는 중(싸움 · 놀이로 잠깐 조작을 돌려준 때 포함)에는 남기지 않는다 — 반쯤 끝난 장면이 기록되면 다시 불러왔을 때 이야기가 멈춘다 */
  function save(s, force) { if (!force && G.script && (G.script.busy || G.script.running)) return false; try { s.saved = Date.now(); localStorage.setItem(KEY, serialize(s)); return true; } catch (_) { return false; } }
  function load() { try { const raw = localStorage.getItem(KEY); if (!raw) return null; const s = JSON.parse(raw); if (!s || s.v !== VERSION) return null; const f = fresh(); const r = Object.assign(f, s); r.settings = Object.assign(fresh().settings, s.settings || {}); return G.prog ? G.prog.migrate(r) : r; } catch (_) { return null; } }
  function clear() { try { localStorage.removeItem(KEY); } catch (_) { /* 무시 */ } }

  G.st = { fresh, derive, has, give, take, autoEquip, learnSpell, gainExp, save, load, clear, serialize, VERSION };
  G.state = fresh();
})();
