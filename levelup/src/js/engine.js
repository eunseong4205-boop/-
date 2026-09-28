/* 게임 규칙 엔진 (DOM 없음): 상태, 능력치, 클릭, 레벨업, 등급, 인벤토리, 저장 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, D = G.data;
  const { B, RANKS, ITEMS, TOOL_MULT } = D;
  const STATS = ['str', 'vit', 'agi', 'int', 'luk'];
  const VERSION = 2;

  function newState(name, gender) {
    return {
      v: VERSION, name: name || '하늘', gender: gender || 'boy',
      map: 'home', x: 5, y: 5, dir: 'down',
      lv: 1, exp: 0, sp: 0, st: { str: 0, vit: 0, agi: 0, int: 0, luk: 0 }, auto: true, ratio: Object.assign({}, B.ratio),
      hp: 110, gold: 0,
      inv: { p0: 2 }, eq: { weapon: null, armor: null, acc: null },
      ranks: {}, pw: {}, orbs: {},
      flags: {}, quests: {}, seen: {}, chests: {}, secrets: {}, beaten: {}, books: {}, spots: {}, colors: {},
      codex: {}, buffs: [], cd: {}, clickLog: [], fever: 0,
      bond: {},     // 인연: 인물 id → 점수 (음수면 멀어진 사이)
      log: [],      // 결정의 기록: [{k, v, t, ch}]
      truth: {},    // 진실의 조각
      fishLog: {},  // 낚은 것: id → 마리 수
      tot: { clicks: 0, taps: 0, kills: 0, bossKills: 0, gold: 0, exp: 0, playTime: 0, steps: 0, faints: 0, maxHit: 0 },
      respawn: { map: 'home', x: 5, y: 5 },
      follower: null,
      settings: { music: true, sfx: true, vol: 0.7, textSpeed: 1 },
      t: 0, created: Date.now(), saved: 0,
    };
  }

  /* ───────── 능력치 ───────── */
  function ranksTotal(s) { let n = 0; for (const r of RANKS) n += s.ranks[r.id] || 0; return n; }
  function rankClick(s) { let m = 1; for (const r of RANKS) m += (s.ranks[r.id] || 0) * r.click; return m; }
  function rankPower(s) { let m = 1; for (const r of RANKS) m += (s.ranks[r.id] || 0) * r.power * 0.9; return m; }
  function toolIndex(s) { let best = 0; for (let i = 1; i < TOOL_MULT.length; i++) if (s.inv['t' + i]) best = i; return best; }
  function accFx(s) { const a = s.eq.acc && ITEMS[s.eq.acc]; return (a && a.fx) || {}; }
  function buffSum(s, k) { let v = 0; for (const b of s.buffs) if (b.until > s.t && b.fx[k]) v += b.fx[k]; return v; }
  function skillOn(s, id) { const c = s.cd[id]; return !!(c && c.until > s.t); }

  function derive(s) {
    const st = s.st, fx = accFx(s);
    const w = s.eq.weapon ? ITEMS[s.eq.weapon] : null;
    const a = s.eq.armor ? ITEMS[s.eq.armor] : null;
    const pw = rankPower(s);
    let atk = (10 + 2 * st.str + (w ? w.atk : 0)) * pw * (1 + buffSum(s, 'atk'));
    const hpMax = Math.round((100 + 10 * st.vit + 2 * s.lv + (a ? a.hp : 0)) * pw * (1 + (fx.hp || 0)));
    const def = st.vit * 0.5 + (a ? a.def : 0);
    const agiR = st.agi / (st.agi + 400 + s.lv * 2);
    const crit = Math.min(0.75, 0.05 + 0.4 * agiR + (fx.crit || 0) + (skillOn(s, 'k_focus') ? 1 : 0));
    const critDmg = 2 + (fx.critDmg || 0) + agiR;
    const intF = 1 + Math.sqrt(st.int) / 20;
    const lukF = 1 + Math.sqrt(st.luk) / 20;
    const rc = rankClick(s);
    const expM = intF * rc * (1 + (fx.exp || 0)) * (1 + buffSum(s, 'exp'));
    const goldM = lukF * rc * (1 + (fx.gold || 0)) * (1 + buffSum(s, 'gold'));
    const tool = TOOL_MULT[toolIndex(s)];
    const feverOn = s.fever > s.t;
    return { atk: U.fin(atk), hpMax, def, crit, critDmg, expM, goldM, tool, intF, lukF, rc, feverOn, taps: 1 + (fx.tap || 0) + (skillOn(s, 'k_rush') ? 1 : 0), regen: B.regen + (fx.regen || 0) };
  }

  /* ───────── 경험치 · 레벨 ───────── */
  function addExp(s, x) {
    if (!(x > 0)) return 0;
    s.exp = U.fin(s.exp + x);
    s.tot.exp = U.fin(s.tot.exp + x);
    const nl = D.levelFromTotal(s.exp);
    if (nl <= s.lv) return 0;
    const gained = nl - s.lv;
    s.lv = nl;
    s.sp += gained * B.spPerLevel;
    if (s.auto) autoAlloc(s);
    return gained;
  }
  function addGold(s, x) { if (x > 0) { s.gold = U.fin(s.gold + x); s.tot.gold = U.fin(s.tot.gold + x); } }
  function autoAlloc(s) {
    let sum = 0;
    for (const k of STATS) sum += Math.max(0, s.ratio[k] || 0);
    if (sum <= 0 || s.sp <= 0) return;
    const pool = s.sp;
    let used = 0;
    for (const k of STATS) { const add = Math.floor(pool * (s.ratio[k] || 0) / sum); s.st[k] += add; used += add; }
    // 나머지는 비율이 가장 큰 능력치에
    const top = STATS.slice().sort((a, b) => (s.ratio[b] || 0) - (s.ratio[a] || 0))[0];
    s.st[top] += pool - used;
    s.sp = 0;
  }
  function allocate(s, k, n) { n = Math.min(n, s.sp); if (n <= 0) return 0; s.st[k] += n; s.sp -= n; return n; }
  function resetStats(s) { let t = s.sp; for (const k of STATS) { t += s.st[k]; s.st[k] = 0; } s.sp = t; }
  function expProgress(s) {
    const a = D.totalExp(s.lv), b = D.totalExp(s.lv + 1);
    return { cur: s.exp - a, need: b - a, f: U.clamp((s.exp - a) / (b - a), 0, 1) };
  }

  /* ───────── 클릭 (렙업 버튼) ───────── */
  /** base: {exp, gold} 장소 기본값, mult: 수련 샘 배율 */
  function clickValue(s, base, mult, d) {
    d = d || derive(s);
    const f = (mult || 1) * d.tool * (d.feverOn ? 2 : 1);
    return { exp: U.fin(base.exp * f * d.expM), gold: U.fin(base.gold * f * d.goldM) };
  }
  /** 3초 안에 24번 누르면 피버 */
  function registerClick(s) {
    const now = s.t;
    s.clickLog.push(now);
    while (s.clickLog.length && s.clickLog[0] < now - 3) s.clickLog.shift();
    if (s.fever <= now && s.clickLog.length >= B.feverClicks) { s.fever = now + B.feverTime; s.clickLog.length = 0; return true; }
    return false;
  }
  function click(s, base, mult) {
    const feverStart = registerClick(s);
    const v = clickValue(s, base, mult);
    s.tot.clicks++;
    const lv = addExp(s, v.exp);
    addGold(s, v.gold);
    return { exp: v.exp, gold: v.gold, lv, feverStart };
  }

  /* ───────── 전투 보상 ───────── */
  function killReward(s, mon) {
    const d = derive(s);
    return { exp: U.fin(mon.exp * d.expM), gold: U.fin(mon.gold * d.goldM) };
  }
  /** 적에게 맞았을 때 피해 */
  function enemyDamage(s, atk) {
    const d = derive(s);
    let dmg = Math.max(atk * 0.12, atk - d.def);
    if (skillOn(s, 'k_guard')) dmg *= 0.3;
    return Math.max(1, Math.round(dmg));
  }

  /* ───────── 인벤토리 ───────── */
  function has(s, id, n) { return (s.inv[id] || 0) >= (n || 1); }
  function give(s, id, n) { s.inv[id] = (s.inv[id] || 0) + (n || 1); }
  function take(s, id, n) { n = n || 1; if (!has(s, id, n)) return false; s.inv[id] -= n; if (s.inv[id] <= 0) delete s.inv[id]; return true; }
  function buy(s, id, n) {
    const it = ITEMS[id]; n = n || 1;
    const cost = it.price * n;
    if (s.gold < cost) return false;
    if ((it.type === 'tool' || it.type === 'weapon' || it.type === 'armor' || it.type === 'acc') && has(s, id)) return false;
    s.gold -= cost;
    give(s, id, n);
    if (it.type === 'weapon' || it.type === 'armor' || it.type === 'acc') autoEquip(s, id);
    return true;
  }
  function sellPrice(id) { const it = ITEMS[id]; return Math.floor((it.price || 0) * (it.type === 'mat' ? 1 : 0.4)); }
  function sell(s, id, n) {
    n = n || 1;
    const it = ITEMS[id];
    if (!it || it.type === 'key' || it.type === 'tool' || !has(s, id, n)) return false;
    if (s.eq.weapon === id || s.eq.armor === id || s.eq.acc === id) return false;
    take(s, id, n);
    addGold(s, sellPrice(id) * n);
    return true;
  }
  function slotOf(it) { return it.type === 'weapon' ? 'weapon' : it.type === 'armor' ? 'armor' : it.type === 'acc' ? 'acc' : null; }
  function equip(s, id) {
    const it = ITEMS[id]; const slot = slotOf(it);
    if (!slot || !has(s, id)) return false;
    const before = derive(s).hpMax;
    s.eq[slot] = id;
    const after = derive(s).hpMax;
    s.hp = Math.min(after, s.hp + Math.max(0, after - before));
    return true;
  }
  /** 새로 산 장비가 더 좋으면 바로 장착 */
  function autoEquip(s, id) {
    const it = ITEMS[id]; const slot = slotOf(it);
    if (!slot) return;
    const cur = s.eq[slot] && ITEMS[s.eq[slot]];
    if (!cur) return equip(s, id);
    if (slot === 'weapon' && it.atk > cur.atk) equip(s, id);
    if (slot === 'armor' && it.hp > cur.hp) equip(s, id);
  }
  function usePotion(s, id) {
    const it = ITEMS[id];
    if (!it || it.type !== 'potion' || !take(s, id)) return false;
    const d = derive(s);
    s.hp = Math.min(d.hpMax, s.hp + Math.round(d.hpMax * it.heal));
    return true;
  }
  /** 음식은 한 번에 하나만: 새로 먹으면 먼저 먹은 음식 효과는 사라진다 */
  function isFood(b) { const it = ITEMS[b.id]; return !!(it && it.type === 'food'); }
  function eating(s) { return s.buffs.find((b) => b.until > s.t && isFood(b)) || null; }
  function eat(s, id) {
    const it = ITEMS[id];
    if (!it || it.type !== 'food' || !take(s, id)) return false;
    s.buffs = s.buffs.filter((b) => b.until > s.t && !isFood(b));
    s.buffs.push({ id, fx: it.fx, until: s.t + it.sec });
    return true;
  }

  /* ───────── 등급 (전직) ───────── */
  function rankIdx(id) { return RANKS.findIndex((r) => r.id === id); }
  function lineOpen(s, i) { if (i === 0) return true; const p = RANKS[i - 1]; return (s.ranks[p.id] || 0) >= p.tiers; }
  function lineUnlocked(s, i) { return i === 0 || !!s.pw[RANKS[i].id]; }
  function curLine(s) { for (let i = 0; i < RANKS.length; i++) if ((s.ranks[RANKS[i].id] || 0) < RANKS[i].tiers) return i; return -1; }
  function canRankUp(s, i) {
    const rk = RANKS[i];
    const t = (s.ranks[rk.id] || 0) + 1;
    if (t > rk.tiers) return { ok: false, why: 'done' };
    if (!lineOpen(s, i)) return { ok: false, why: 'prev' };
    if (!lineUnlocked(s, i)) return { ok: false, why: 'pw' };
    const lv = D.rankTierLevel(rk, t), cost = D.rankTierCost(rk, t);
    if (s.lv < lv) return { ok: false, why: 'lv', lv, cost };
    if (s.gold < cost) return { ok: false, why: 'gold', lv, cost };
    return { ok: true, lv, cost };
  }
  function rankUp(s, i) {
    const r = canRankUp(s, i);
    if (!r.ok) return false;
    s.gold -= r.cost;
    s.ranks[RANKS[i].id] = (s.ranks[RANKS[i].id] || 0) + 1;
    s.hp = derive(s).hpMax;
    return true;
  }
  function rankName(s) {
    let cur = null;
    for (const r of RANKS) if ((s.ranks[r.id] || 0) > 0) cur = r;
    if (!cur) return '무등급';
    return cur.name + ' ' + s.ranks[cur.id] + '차';
  }
  function tryPassword(s, rankId, code) {
    const rk = RANKS.find((r) => r.id === rankId);
    if (!rk || !rk.orb) return false;
    if (parseInt(code, 10) === D.passwordOf(rk.orb)) { s.pw[rankId] = true; return true; }
    return false;
  }
  function meets(s, req) {
    if (!req) return true;
    if (req.lv && s.lv < req.lv) return false;
    if (req.rank) { const [id, t] = req.rank; if ((s.ranks[id] || 0) < t) return false; }
    if (req.flag && !s.flags[req.flag]) return false;
    if (req.item && !has(s, req.item)) return false;
    return true;
  }

  /* ───────── 스킬 ───────── */
  function skillUnlocked(s, sk) { return (s.ranks[sk.rank] || 0) >= sk.tier; }
  function skillReady(s, sk) { const c = s.cd[sk.id]; return !c || c.ready <= s.t; }
  function useSkill(s, sk) {
    if (!skillUnlocked(s, sk) || !skillReady(s, sk)) return false;
    s.cd[sk.id] = { ready: s.t + sk.cd, until: s.t + (sk.dur || 0) };
    return true;
  }

  function tick(s, dt, inBattle) {
    s.t += dt;
    s.tot.playTime += dt;
    if (!inBattle) {
      const d = derive(s);
      if (s.hp < d.hpMax) s.hp = Math.min(d.hpMax, s.hp + d.hpMax * d.regen * dt);
    }
    if (s.buffs.length && s.buffs[0] && s.buffs.some((b) => b.until <= s.t)) s.buffs = s.buffs.filter((b) => b.until > s.t);
  }

  /* ───────── 저장 ───────── */
  function serialize(s) { s.saved = Date.now(); return JSON.stringify(s); }
  function deserialize(str) {
    const o = JSON.parse(str);
    const s = newState(o.name, o.gender);
    for (const k of Object.keys(o)) {
      if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) s[k] = Object.assign(s[k], o[k]);
      else s[k] = o[k];
    }
    s.lv = D.levelFromTotal(s.exp);
    s.clickLog = [];
    return s;
  }

  G.engine = { VERSION, STATS, newState, derive, addExp, addGold, autoAlloc, allocate, resetStats, expProgress, clickValue, click, registerClick, killReward, enemyDamage,
    has, give, take, buy, sell, sellPrice, equip, autoEquip, usePotion, eat, eating, rankIdx, lineOpen, lineUnlocked, curLine, canRankUp, rankUp, rankName, tryPassword, meets,
    skillUnlocked, skillReady, useSkill, skillOn, tick, serialize, deserialize, toolIndex, ranksTotal, rankClick };
})();
