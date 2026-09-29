/* 저장되는 상태: 주인공 · 장비 · 가방 · 마법 · 재능 · 깃발 · 부탁 · 위치 · 세력 마음
   파생 능력치(공격 · 방어 · 최대 체력 …)는 매번 계산한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const D = G.data;
  const VERSION = 3;
  const KEY = 'levelup-v3-save';

  function fresh(name, gender) {
    return {
      v: VERSION, name: name || '아린', gender: gender || 'boy', t: 0,
      hearts: 3, hp: 12, mp: 30, mpMaxBase: 30, stamBase: 100,
      lv: 1, exp: 0, sp: 0, gold: 0,
      equip: { sword: null, shield: null, armor: 'ar_tunic', bow: null, acc1: null, acc2: null },
      tool: null, spell: null, special: 0,
      tools: {}, spells: {}, skills: {},
      ammo: { arrows: 0, bombs: 0, arrowsMax: 30, bombsMax: 10 },
      inv: {}, keys: {}, bigkeys: {}, pieces: 0,
      flags: {}, quests: {}, log: [], books: {}, truth: {}, abyss: {}, bond: {}, endings: {}, seen: {},
      route: { dawn: 0, order: 0, night: 0 },
      map: null, x: 0, y: 0, respawn: null, waystones: {}, visited: {}, buffs: [],
      settings: { music: true, sfx: true, vol: 0.7, textSpeed: 2, shake: true, minimap: true },
    };
  }

  /** 파생 능력치 */
  function derive(s) {
    const I = D.ITEMS;
    const sw = s.equip.sword ? I[s.equip.sword] : null;
    const ar = s.equip.armor ? I[s.equip.armor] : I.ar_tunic;
    const bw = s.equip.bow ? I[s.equip.bow] : null;
    const acc = [s.equip.acc1, s.equip.acc2].filter(Boolean).map((id) => I[id].fx || {});
    const sum = (k) => acc.reduce((a, f) => a + (f[k] || 0), 0);
    const now = s.t;
    const buff = (k, def) => s.buffs.filter((b) => b.until > now && b[k] != null).reduce((a, b) => a * b[k], def);
    const sk = (id) => !!s.skills[id];
    return {
      atk: ((sw ? sw.atk : 1) + (s.lv - 1) * 0.22) * buff('atk', 1),
      reach: sw ? sw.reach : 16,
      el: sw ? sw.el : null,
      beam: !!(sw && sw.beam),
      swordCol: sw ? sw.col : '#c8a070', swordGlow: sw ? sw.glow : null,
      def: (ar.def || 1) * buff('def', 1) * (sk('sv_iron') ? 0.9 : 1),
      resist: ar.resist || null,
      bowAtk: bw ? bw.atk + (s.lv - 1) * 0.12 : 0, draw: (bw ? bw.draw : 0.6) * (sk('bw_fast') ? 0.7 : 1),
      hpMax: (s.hearts + (sk('sv_heart') ? 1 : 0)) * 4,
      mpMax: s.mpMaxBase + (sk('mg_pool') ? 30 : 0) + (s.lv - 1),
      stamMax: s.stamBase + sum('stamina') + (sk('sv_stam') ? 30 : 0),
      crit: 0.05 + sum('crit'),
      mpRegen: sum('mpRegen') + (sk('mg_flow') ? 0.8 : 0),
      regen: sum('regen'),
      rollCost: 24 * (1 - sum('roll')),
      rollIframes: 0.28 * (sk('sv_roll') ? 1.5 : 1) + sum('roll') * 0.1,
      expMul: 1 + sum('exp'),
      specialMul: 1 + sum('special'),
      magMul: sk('mg_power') ? 1.5 : 1,
      chargeTime: sk('sw_charge') ? 0.3 : 0.5,
      stamRegen: buff('stamina', 1),
      warm: s.buffs.some((b) => b.until > now && b.warm) || ar.resist === 'cold' || ar.resist === 'all',
      heatOk: ar.resist === 'heat' || ar.resist === 'all',
      stealth: !!ar.stealth,
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
    if (id === 'heart_c') { s.hearts++; s.hp = derive(s).hpMax; return; }
    if (id === 'heartpiece') { s.pieces++; if (s.pieces >= 4) { s.pieces -= 4; s.hearts++; s.hp = derive(s).hpMax; } return; }
    s.inv[id] = (s.inv[id] || 0) + n;
    // 처음 얻은 장비는 바로 찬다 (더 좋은 것이면)
    const slot = { sword: 'sword', shield: 'shield', armor: 'armor', bow: 'bow' }[it.type];
    if (slot) { const cur = s.equip[slot] ? D.ITEMS[s.equip[slot]] : null; if (!cur || (it.atk || 0) > (cur.atk || 0) || (it.lv || 0) > (cur.lv || 0) || (it.def || 1) < (cur.def || 1)) s.equip[slot] = id; }
    if (it.type === 'acc' && !s.equip.acc1) s.equip.acc1 = id; else if (it.type === 'acc' && !s.equip.acc2 && s.equip.acc1 !== id) s.equip.acc2 = id;
  }
  function take(s, id, n) { n = n || 1; if (!has(s, id, n)) return false; s.inv[id] -= n; if (s.inv[id] <= 0) delete s.inv[id]; return true; }
  function learnSpell(s, id) { s.spells[id] = true; if (!s.spell) s.spell = id; }

  /** 빛 알갱이(경험). 렙업하면 참을 돌려준다 */
  function gainExp(s, n) {
    s.exp += n * derive(s).expMul;
    let up = 0;
    while (s.exp >= D.expNext(s.lv)) { s.exp -= D.expNext(s.lv); s.lv++; s.sp++; up++; }
    if (up) { const d = derive(s); s.hp = Math.min(d.hpMax, s.hp + 4); s.mp = d.mpMax; }
    return up;
  }

  function serialize(s) { return JSON.stringify(s); }
  function save(s) { try { s.saved = Date.now(); localStorage.setItem(KEY, serialize(s)); return true; } catch (_) { return false; } }
  function load() { try { const raw = localStorage.getItem(KEY); if (!raw) return null; const s = JSON.parse(raw); if (!s || s.v !== VERSION) return null; return Object.assign(fresh(), s); } catch (_) { return null; } }
  function clear() { try { localStorage.removeItem(KEY); } catch (_) { /* 무시 */ } }

  G.st = { fresh, derive, has, give, take, learnSpell, gainExp, save, load, clear, serialize, VERSION };
  G.state = fresh();
})();
