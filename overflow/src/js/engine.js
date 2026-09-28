/* 게임 엔진: 상태, 공식, 틱, 행동 (DOM 없음 — Node 시뮬레이터에서도 사용) */
(function () {
  'use strict';
  const OF = (globalThis.OF = globalThis.OF || {});
  const N = OF.num;
  const { B, TOWNS, FINAL_ZONE, BOSS_TITLES, CLASSES, ORB_COLORS, ORBS, EQUIP, COMPANIONS, SKILLS, FRAG_UPG, ACH, LEVEL_TITLES } = OF.data;
  const MAX = Number.MAX_VALUE;
  const STAT_KEYS = ['str', 'vit', 'agi', 'int', 'luk'];
  const SAVE_VERSION = 1;

  /* ───────── 상태 ───────── */
  function newRun() {
    return {
      exp: 0, level: 1, sp: 0,
      stats: { str: 0, vit: 0, agi: 0, int: 0, luk: 0 },
      gold: 0,
      zone: 1, maxZone: 1, kills: 0,
      equip: { weapon: 0, armor: 0, ring: 0, amulet: 0 },
      comps: {},
      maxLevelRun: 1,
    };
  }

  function newState() {
    const s = Object.assign(newRun(), {
      v: SAVE_VERSION,
      name: '제로',
      created: Date.now(), lastSave: Date.now(),
      t: 0,
      bestZone: 1,
      autoAdvance: true,
      autoAlloc: true,
      ratio: { str: 4, vit: 2, agi: 1, int: 2, luk: 1 },
      autoBuy: false,
      cls: {},            // 계열별 차수
      pw: { c1: true },    // 비번 해금된 계열
      orbs: {},
      spots: {},           // 탐색 완료 지점
      talks: {},           // NPC 대화 횟수
      seen: {},            // 본 스토리 장면
      ach: {},
      codex: {},
      frags: 0, fragsTotal: 0, fragUpg: {},
      rebirths: 0,
      sk: {},
      tot: { taps: 0, kills: 0, bossKills: 0, gold: 0, exp: 0, maxLevel: 1, maxDmg: 0, crits: 0, playTime: 0, fails: 0 },
      flags: {},
      relics: {},
      settings: { notation: 'kr', sound: true, vibrate: true, fx: true },
      misc: { portraitTaps: 0, verTaps: 0, bagTaps: 0 },
      enemy: null,
      bf: null,
      autoAcc: 0,
      events: [],
    });
    spawn(s);
    return s;
  }

  /* ───────── 구역/몬스터 ───────── */
  function townOf(z) { return Math.min(TOWNS.length - 1, Math.floor((Math.min(z, FINAL_ZONE - 1) - 1) / B.zonesPerTown)); }
  function zoneK(z) { return ((z - 1) % B.zonesPerTown) + 1; }
  function isFinal(z) { return z >= FINAL_ZONE; }
  function isTownBoss(z) { return !isFinal(z) && zoneK(z) === B.zonesPerTown; }
  function isBossZone(z) { return isFinal(z) || zoneK(z) % 5 === 0; }
  function hLog(z) { const x = Math.min(z, FINAL_ZONE - 1) - 1; return B.hpBase + B.hpA * x + B.hpB * x * x; }
  function diffLog(z) {
    const x = Math.min(z, FINAL_ZONE - 1) - 1;
    return B.diffA * Math.min(x, B.diffZ) + B.diffB * x + B.diffEps * hLog(z);
  }
  function monsterHpLog(z) {
    let h = hLog(z) + diffLog(z);
    if (isTownBoss(z)) h += B.townBossLog; else if (isBossZone(z)) h += B.bossLog;
    return h;
  }
  function killExp(z) { return B.expBase * N.pow10(B.expExp * hLog(z)); }
  function killGold(z) { return B.goldBase * N.pow10(B.goldExp * hLog(z)); }
  function bossAtk(z) { return N.pow10(B.bossAtkLog * (hLog(z) + diffLog(z)) + B.bossAtkC); }
  function bossTimeFor(s, z) {
    const base = isTownBoss(z) ? B.townBossTime : B.bossTime;
    return base + fu(s, 'f_time') * 3;
  }
  function zoneLabel(z) {
    if (isFinal(z)) return '∞';
    return (townOf(z) + 1) + '-' + zoneK(z);
  }

  function spawn(s) {
    const z = s.zone;
    const t = townOf(z);
    const town = TOWNS[t];
    const seedBase = N.hashStr(town.id);
    let e;
    if (isFinal(z)) {
      e = { name: '오버플로우', kind: 3, key: 'final', t, mi: -1, hp: MAX, maxHp: MAX, seed: 777 };
    } else if (isTownBoss(z)) {
      e = { name: town.boss[0], kind: 2, key: 'b' + t, t, mi: -1, seed: seedBase + 999 };
    } else if (isBossZone(z)) {
      const idx = zoneK(z) / 5 - 1; // 0,1,2
      const mi = (idx + 2) % 5;
      e = { name: '[' + BOSS_TITLES[idx] + '] ' + town.mobs[mi][0], kind: 1, key: t + '_' + mi, t, mi, seed: seedBase + mi };
    } else {
      const avail = Math.min(5, 2 + Math.floor((zoneK(z) - 1) / 4));
      const mi = Math.floor(Math.random() * avail);
      e = { name: town.mobs[mi][0], kind: 0, key: t + '_' + mi, t, mi, seed: seedBase + mi };
    }
    if (e.kind !== 3) {
      const hp = N.pow10(monsterHpLog(z)) * (0.9 + Math.random() * 0.2 * (e.kind === 0 ? 1 : 0));
      e.hp = e.maxHp = N.fin(hp);
    }
    s.enemy = e;
    if (e.kind >= 1) {
      const d = derive(s);
      s.bf = { time: e.kind === 3 ? Infinity : bossTimeFor(s, z), maxTime: bossTimeFor(s, z), php: d.hp, pmax: d.hp, atkT: B.bossAtkEvery };
    } else {
      s.bf = null;
    }
  }

  /* ───────── 파생 수치 ───────── */
  function fu(s, id) { return s.fragUpg[id] || 0; }
  function eqMult(n, e) { return (1 + e.per * n) * Math.pow(e.msm, Math.floor(n / e.ms)); }
  function skillOn(s, id) { const k = s.sk[id]; return !!(k && k.until > s.t); }
  function achCount(s) { let c = 0; for (const k in s.ach) if (s.ach[k]) c++; return c; }

  // 전직 차수별 누적 로그 배율 표 (차수가 담당하는 난이도 구간에 비례)
  let CLS_TABLE = null;
  function buildClassTable() {
    CLS_TABLE = {};
    const baseH = (z) => hLog(z) + diffLog(z);
    let prevH = baseH(1);
    for (const c of CLASSES) {
      const arr = [0];
      let acc = 0;
      for (let t = 1; t <= c.tiers; t++) {
        const h = baseH(Math.round(tierZone(c, t)));
        acc += Math.max(0.05, h - prevH);
        prevH = h;
        arr.push(acc);
      }
      CLS_TABLE[c.id] = arr;
    }
  }
  function tierLog(c, t) { if (!CLS_TABLE) buildClassTable(); return CLS_TABLE[c.id][t] - CLS_TABLE[c.id][t - 1]; }
  /** 해당 차수의 공격력/경험치/골드 배율 */
  function tierBonus(c, t) {
    const l = tierLog(c, t);
    return { m: N.pow10(B.clsK * l) * B.clsFlat, e: N.pow10(B.clsKe * l) * B.clsFlatE, g: N.pow10(B.clsKg * l) };
  }
  function classMults(s) {
    if (!CLS_TABLE) buildClassTable();
    let lm = 0, n = 0;
    for (const c of CLASSES) {
      const t = s.cls[c.id] || 0;
      if (t > 0) { lm += CLS_TABLE[c.id][t]; n += t; }
    }
    return { m: N.pow10(B.clsK * lm) * Math.pow(B.clsFlat, n), e: N.pow10(B.clsKe * lm) * Math.pow(B.clsFlatE, n), g: N.pow10(B.clsKg * lm), sp: 1 };
  }
  function curClass(s) {
    let cur = null;
    for (const c of CLASSES) { if ((s.cls[c.id] || 0) > 0) cur = c; }
    return cur;
  }
  function className(s) {
    const c = curClass(s);
    if (!c) return '무직';
    const t = s.cls[c.id];
    return c.name + ' ' + t + '차' + (c.tierNames[t] ? ' · ' + c.tierNames[t] : '');
  }

  function compBaseCostLog(i) { return N.log10(killGold(COMPANIONS[i].unlock)) + 1.2; }
  function compCoef(i) { return 0.35 * Math.pow(10, B.compCoefExp * (compBaseCostLog(i) - compBaseCostLog(0))); }
  function compFactorOf(i, lv) { return lv <= 0 ? 0 : compCoef(i) * lv * Math.pow(2, Math.floor(lv / B.compMs)); }

  function derive(s) {
    const st = s.stats;
    const cm = classMults(s);
    const ac = Math.pow(1.03, achCount(s));
    const fp = 1 + B.fragPassive * s.fragsTotal;
    const end = s.flags.ending ? 1e6 : 1;
    const rel = relicMult(s);
    const cheat = skillOn(s, 'cheat') ? 100 : 1;

    const atkBase = 10 + 3 * st.str;
    let atk = atkBase * eqMult(s.equip.weapon, EQUIP[0]) * cm.m * ac * fp * Math.pow(2, fu(s, 'f_atk')) * end * cheat * rel;
    if (skillOn(s, 'rage')) atk *= 10;
    if (skillOn(s, 'nopatch')) atk *= 1e4;

    let hp = (100 + 25 * st.vit) * eqMult(s.equip.armor, EQUIP[1]) * cm.m * ac * fp * Math.pow(2, fu(s, 'f_hp')) * end * rel;

    const lagi = N.log10(1 + st.agi);
    const critChance = Math.min(0.6, 0.05 + 0.55 * (1 - 1 / (1 + lagi / 12)));
    const critMult = 2 + lagi * 0.6;

    let expMult = Math.pow(1 + st.int, B.intExp) * eqMult(s.equip.amulet, EQUIP[3]) * cm.e * ac * Math.pow(2, fu(s, 'f_exp')) * end * cheat;
    if (skillOn(s, 'study')) expMult *= 5;
    let goldMult = Math.pow(1 + st.luk, B.lukGold) * eqMult(s.equip.ring, EQUIP[2]) * cm.g * ac * Math.pow(3, fu(s, 'f_gold')) * end * cheat;
    if (skillOn(s, 'midas')) goldMult *= 10;

    let compF = 0;
    for (let i = 0; i < COMPANIONS.length; i++) compF += compFactorOf(i, s.comps[COMPANIONS[i].id] || 0);
    compF *= Math.pow(1 + st.int, B.intComp) * Math.pow(3, fu(s, 'f_comp'));
    if (skillOn(s, 'squad')) compF *= 20;

    atk = N.fin(atk); hp = N.fin(hp);
    const tapBase = N.fin(atk * (1 + 0.2 * compF));
    const compDps = N.fin(atk * compF);
    const autoTaps = fu(s, 'f_auto') + (skillOn(s, 'rush') ? 15 : 0);
    const spPer = B.spPerLevel * Math.pow(1.5, fu(s, 'f_sp')) * Math.pow(1.25, (s.cls.c1 || 0) + (s.cls.c2 || 0) * 0.5);

    return { atk, hp, critChance, critMult, expMult: N.fin(expMult), goldMult: N.fin(goldMult), compF, tapBase, compDps, autoTaps, spPer,
      avgTap: tapBase * (1 + critChance * (critMult - 1)) };
  }

  function relicLog(t) {
    const zb = (t + 1) * B.zonesPerTown;
    const zn = Math.min(zb + B.zonesPerTown, FINAL_ZONE - 1);
    return B.relicK * (monsterHpLog(zn) - monsterHpLog(zb)) + B.relicC;
  }
  function relicMult(s) {
    let l = 0;
    for (const k in s.relics) if (s.relics[k]) l += relicLog(+k);
    return N.pow10(l);
  }

  /* ───────── 레벨 ───────── */
  function levelFromExp(exp) { return Math.floor(Math.pow(exp / B.levelA, 1 / B.levelP)) + 1; }
  function expForLevel(lv) { return B.levelA * Math.pow(lv - 1, B.levelP); }

  function addExp(s, x, d) {
    if (!(x > 0)) return;
    s.exp = N.fin(s.exp + x);
    s.tot.exp = N.fin(s.tot.exp + x);
    const nl = levelFromExp(s.exp);
    if (nl > s.level) {
      const gained = nl - s.level;
      s.sp = N.fin(s.sp + gained * (d ? d.spPer : derive(s).spPer));
      const from = s.level;
      s.level = nl;
      if (nl > s.maxLevelRun) s.maxLevelRun = nl;
      if (nl > s.tot.maxLevel) s.tot.maxLevel = nl;
      emit(s, 'levelup', { from, to: nl });
    }
  }
  function addGold(s, x) {
    if (!(x > 0)) return;
    s.gold = N.fin(s.gold + x);
    s.tot.gold = N.fin(s.tot.gold + x);
  }

  function emit(s, type, data) {
    if (s.events.length > 200) s.events.splice(0, 100);
    s.events.push(Object.assign({ type }, data || {}));
  }

  /* ───────── 전투 ───────── */
  function doTap(s, auto) {
    const d = derive(s);
    let crit = Math.random() < d.critChance;
    let dmg = d.tapBase * (crit ? d.critMult : 1);
    s.tot.taps += auto ? 0 : 1;
    if (crit) s.tot.crits++;
    const z = s.zone;
    addExp(s, killExp(z) * B.tapExpFrac * d.expMult, d);
    addGold(s, killGold(z) * B.tapGoldFrac * d.goldMult);
    const rawDmg = dmg;
    if (isFinite(dmg) && dmg > s.tot.maxDmg) s.tot.maxDmg = dmg;
    const res = dealDamage(s, rawDmg, d);
    return { dmg: rawDmg, crit, killed: res.killed, auto };
  }

  function dealDamage(s, dmg, d) {
    let killed = 0;
    const e0 = s.enemy;
    if (!e0) { spawn(s); return { killed }; }
    if (e0.kind === 3) {
      // 최종 보스: 오직 무한대(오버플로우)만이 천장을 뚫는다. 버튼의 각성: ×10만
      dmg = dmg * B.finalBoost;
      if (!isFinite(dmg) || dmg >= MAX) {
        e0.hp = 0;
        killEnemy(s, d);
        killed = 1;
      } else {
        e0.lastRatio = dmg / MAX;
      }
      return { killed };
    }
    dmg = N.fin(dmg);
    let guard = 0;
    while (dmg > 0 && guard < B.cascadeCap) {
      const e = s.enemy;
      if (e.kind === 3) break;
      if (dmg >= e.hp) {
        dmg -= e.hp;
        const wasBoss = e.kind >= 1;
        killEnemy(s, d);
        killed++;
        guard++;
        if (wasBoss || s.enemy.kind >= 1) break;
      } else {
        e.hp -= dmg;
        dmg = 0;
      }
    }
    return { killed };
  }

  function killEnemy(s, d) {
    const e = s.enemy;
    const z = s.zone;
    const mult = e.kind === 2 ? 20 : e.kind === 1 ? 5 : 1;
    addExp(s, killExp(z) * mult * d.expMult, d);
    addGold(s, killGold(z) * mult * d.goldMult);
    s.tot.kills++;
    s.codex[e.key] = (s.codex[e.key] || 0) + 1;
    if (e.kind >= 1) { s.tot.bossKills++; }
    emit(s, 'kill', { kind: e.kind, name: e.name, z });
    if (e.kind === 3) {
      s.flags.ending = true;
      s.bf = null;
      emit(s, 'overflow', {});
      s.zone = FINAL_ZONE - 1;
      spawn(s);
      return;
    }
    if (e.kind >= 1) {
      // 보스 격파 → 구역 해제
      s.bf = null;
      if (e.kind === 2 && !s.relics[e.t]) { s.relics[e.t] = true; emit(s, 'relic', { t: e.t }); }
      emit(s, 'bossClear', { z, kind: e.kind, name: e.name });
      if (z >= s.maxZone) { s.maxZone = z + 1; s.kills = 0; }
      if (s.autoAdvance || z + 1 === s.maxZone) advanceTo(s, z + 1); else spawn(s);
      return;
    }
    if (z >= s.maxZone) {
      s.kills++;
      if (s.kills >= B.killsPerZone) {
        s.maxZone = z + 1;
        s.kills = 0;
        if (s.autoAdvance) { advanceTo(s, z + 1); return; }
      }
    } else if (s.autoAdvance) {
      advanceTo(s, z + 1);
      return;
    }
    spawn(s);
  }

  function advanceTo(s, z) {
    z = Math.max(1, Math.min(z, s.maxZone, FINAL_ZONE));
    s.zone = z;
    if (z > s.bestZone) {
      s.bestZone = z;
      emit(s, 'reach', { z });
    }
    spawn(s);
  }

  function setZone(s, z) {
    if (s.enemy && s.enemy.kind === 3 && z < FINAL_ZONE) s.bf = null;
    advanceTo(s, z);
  }

  function bossFail(s, reason) {
    s.tot.fails++;
    s.autoAdvance = false;
    const z = s.zone;
    emit(s, 'bossFail', { reason, z });
    s.zone = Math.max(1, z - 1);
    spawn(s);
  }

  /* ───────── 틱 ───────── */
  let achTimer = 0, buyTimer = 0;
  function tick(s, dt) {
    s.t += dt;
    s.tot.playTime += dt;
    const d = derive(s);

    // 자동 탭
    if (d.autoTaps > 0) {
      s.autoAcc += d.autoTaps * dt;
      let n = 0;
      while (s.autoAcc >= 1 && n < 30) { s.autoAcc -= 1; n++; const r = doTap(s, true); emit(s, 'autotap', r); }
      if (s.autoAcc > 5) s.autoAcc = 0;
    }
    // 동료 피해
    if (d.compDps > 0) {
      const res = dealDamage(s, d.compDps * dt, d);
      if (s.enemy && s.enemy.kind === 3 && !isFinite(d.compDps)) { /* handled */ }
      if (res.killed) emit(s, 'compkill', { n: res.killed });
    }
    // 보스 전투
    if (s.bf && s.enemy && s.enemy.kind >= 1 && s.enemy.kind < 3) {
      s.bf.time -= dt;
      s.bf.atkT -= dt;
      if (s.bf.atkT <= 0) {
        s.bf.atkT += B.bossAtkEvery;
        const dmg = bossAtk(s.zone) * (s.enemy.kind === 2 ? B.townBossAtkMult : 1);
        s.bf.php -= dmg;
        emit(s, 'bossHit', { dmg });
      }
      if (s.bf.php <= 0) bossFail(s, 'hp');
      else if (s.bf.time <= 0) bossFail(s, 'time');
    }
    // 자동 분배
    if (s.autoAlloc && s.sp >= 1) autoAllocate(s);
    // 자동 구매
    buyTimer += dt;
    if (buyTimer >= 1) {
      buyTimer = 0;
      if (s.autoBuy && fu(s, 'f_autobuy') > 0) autoBuyAll(s);
    }
    // 업적
    achTimer += dt;
    if (achTimer >= 1) { achTimer = 0; checkAch(s); }
  }

  /* ───────── 스탯 ───────── */
  function autoAllocate(s) {
    let sum = 0;
    for (const k of STAT_KEYS) sum += Math.max(0, s.ratio[k] || 0);
    if (sum <= 0) return;
    const pool = s.sp;
    for (const k of STAT_KEYS) {
      const add = pool * Math.max(0, s.ratio[k] || 0) / sum;
      s.stats[k] = N.fin(s.stats[k] + add);
    }
    s.sp = 0;
  }
  function allocate(s, k, amount) {
    amount = Math.min(amount, s.sp);
    if (!(amount > 0)) return false;
    s.stats[k] = N.fin(s.stats[k] + amount);
    s.sp -= amount;
    if (s.sp < 1e-9) s.sp = 0;
    return true;
  }
  function resetStats(s) {
    let tot = s.sp;
    for (const k of STAT_KEYS) { tot += s.stats[k]; s.stats[k] = 0; }
    s.sp = N.fin(tot);
  }

  /* ───────── 장비 ───────── */
  function eqCost(i, lv, k) { const e = EQUIP[i]; return N.geoSum(e.base, e.rate, lv, k || 1); }
  function eqMaxAfford(s, i) { const e = EQUIP[i]; return N.geoMaxAfford(e.base, e.rate, s.equip[e.id], s.gold); }
  function buyEquip(s, i, k) {
    const e = EQUIP[i];
    const lv = s.equip[e.id];
    if (k === 'max') k = eqMaxAfford(s, i);
    if (!(k > 0)) return 0;
    const c = eqCost(i, lv, k);
    if (c > s.gold) return 0;
    s.gold -= c;
    s.equip[e.id] = lv + k;
    return k;
  }
  function eqName(i, lv) {
    const e = EQUIP[i];
    const tier = Math.floor(lv / 25);
    const n = e.names[Math.min(tier, e.names.length - 1)];
    const extra = tier >= e.names.length ? tier - e.names.length + 1 : 0;
    return n + (extra > 0 ? ' ★' + extra : '') + ' +' + (lv % 25);
  }

  /* ───────── 동료 ───────── */
  function compUnlocked(s, i) { return s.bestZone > COMPANIONS[i].unlock || !!s.flags['comp_' + COMPANIONS[i].id]; }
  function compCost(i, lv, k) { return N.geoSum(N.pow10(compBaseCostLog(i)), B.compRate, lv, k || 1); }
  function compMaxAfford(s, i) { return N.geoMaxAfford(N.pow10(compBaseCostLog(i)), B.compRate, s.comps[COMPANIONS[i].id] || 0, s.gold); }
  function buyComp(s, i, k) {
    if (!compUnlocked(s, i)) return 0;
    const id = COMPANIONS[i].id;
    const lv = s.comps[id] || 0;
    if (k === 'max') k = compMaxAfford(s, i);
    if (!(k > 0)) return 0;
    const c = compCost(i, lv, k);
    if (c > s.gold) return 0;
    s.gold -= c;
    s.comps[id] = lv + k;
    return k;
  }

  function autoBuyAll(s) {
    // 가장 싼 것부터 반복 구매 (최대 60회)
    for (let n = 0; n < 60; n++) {
      let best = null, bc = Infinity;
      for (let i = 0; i < EQUIP.length; i++) {
        const c = eqCost(i, s.equip[EQUIP[i].id], 1) * (i >= 2 ? 1.5 : 1);
        if (c < bc) { bc = c; best = ['e', i]; }
      }
      for (let i = 0; i < COMPANIONS.length; i++) {
        if (!compUnlocked(s, i)) continue;
        const c = compCost(i, s.comps[COMPANIONS[i].id] || 0, 1);
        if (c < bc) { bc = c; best = ['c', i]; }
      }
      if (!best) return;
      const real = best[0] === 'e' ? eqCost(best[1], s.equip[EQUIP[best[1]].id], 1) : compCost(best[1], s.comps[COMPANIONS[best[1]].id] || 0, 1);
      if (real > s.gold) return;
      if (best[0] === 'e') buyEquip(s, best[1], 1); else buyComp(s, best[1], 1);
    }
  }

  /* ───────── 전직 ───────── */
  function classIndex(id) { return CLASSES.findIndex((c) => c.id === id); }
  function tierZone(c, t) {
    const f = c.tiers > 1 ? (t - 1) / (c.tiers - 1) : 0;
    return c.z[0] + (c.z[1] - c.z[0]) * f;
  }
  function tierReq(c, t) {
    const zt = tierZone(c, t);
    const zi = Math.floor(zt), fr = zt - zi;
    const h = hLog(zi) * (1 - fr) + hLog(zi + 1) * fr;
    const lv = Math.max(2, Math.floor(N.pow10(B.clsLvA * h + B.clsLvB)));
    const gold = B.clsGoldK * B.goldBase * N.pow10(B.goldExp * h);
    return { lv, gold };
  }
  function lineAvailable(s, i) {
    if (i === 0) return true;
    const prev = CLASSES[i - 1];
    return (s.cls[prev.id] || 0) >= prev.tiers;
  }
  function lineUnlocked(s, i) { return !!s.pw[CLASSES[i].id]; }
  /** 다음 전직 가능 여부: {ok, reason, req} */
  function canPromote(s, i) {
    const c = CLASSES[i];
    const t = (s.cls[c.id] || 0) + 1;
    if (t > c.tiers) return { ok: false, reason: 'done' };
    if (!lineAvailable(s, i)) return { ok: false, reason: 'prev' };
    if (!lineUnlocked(s, i)) return { ok: false, reason: 'pw' };
    const req = tierReq(c, t);
    req.zone = Math.max(1, Math.floor(tierZone(c, t)));
    if (s.bestZone < req.zone) return { ok: false, reason: 'zone', req };
    if (s.level < req.lv) return { ok: false, reason: 'lv', req };
    if (s.gold < req.gold) return { ok: false, reason: 'gold', req };
    return { ok: true, req };
  }
  function promote(s, i) {
    const r = canPromote(s, i);
    if (!r.ok) return false;
    const c = CLASSES[i];
    s.gold -= r.req.gold;
    s.cls[c.id] = (s.cls[c.id] || 0) + 1;
    emit(s, 'promote', { cls: c.id, tier: s.cls[c.id] });
    return true;
  }
  function passwordFor(line) {
    const col = Object.keys(ORB_COLORS).find((k) => ORB_COLORS[k].line === line);
    return ORBS.filter((o) => o.c === col).reduce((a, o) => a + o.v, 0);
  }
  function tryPassword(s, line, code) {
    if (parseInt(code, 10) === passwordFor(line)) {
      s.pw[line] = true;
      emit(s, 'pwOk', { line });
      return true;
    }
    return false;
  }
  function grantOrb(s, id) {
    if (s.orbs[id]) return false;
    s.orbs[id] = true;
    emit(s, 'orb', { id });
    return true;
  }

  /* ───────── 스킬 ───────── */
  function skillUnlocked(s, sk) { return (s.cls[sk.req[0]] || 0) >= sk.req[1]; }
  function skillCd(s, sk) { return sk.cd * (1 - 0.06 * fu(s, 'f_skill')); }
  function useSkill(s, id) {
    const sk = SKILLS.find((x) => x.id === id);
    if (!sk || !skillUnlocked(s, sk)) return false;
    const k = s.sk[id] || { until: 0, cd: 0 };
    if (k.cd > s.t) return false;
    k.until = s.t + sk.dur;
    k.cd = s.t + skillCd(s, sk);
    s.sk[id] = k;
    emit(s, 'skill', { id });
    return true;
  }

  /* ───────── 환생 ───────── */
  function rebirthUnlocked(s) { return s.bestZone > B.rebirthZone; }
  function fragGain(s) {
    if (s.maxZone <= B.rebirthZone + 1) return 0;
    const g = Math.floor(B.fragK * Math.pow(10, B.fragPhi * (hLog(s.maxZone) - B.fragH0)));
    return g >= 1 ? N.fin(g) : 0;
  }
  function warpZone(s) {
    let z = 1 + fu(s, 'f_warp') * 5;
    z = Math.min(z, s.bestZone - 1);
    while (z > 1 && isBossZone(z)) z--;
    return Math.max(1, z);
  }
  function rebirth(s) {
    if (!rebirthUnlocked(s)) return false;
    const g = fragGain(s);
    if (g < 1) return false;
    s.frags = N.fin(s.frags + g);
    s.fragsTotal = N.fin(s.fragsTotal + g);
    s.rebirths++;
    Object.assign(s, newRun());
    s.sk = {};
    s.autoAdvance = true;
    const z = warpZone(s);
    s.zone = z; s.maxZone = z;
    spawn(s);
    emit(s, 'rebirth', { gain: g });
    return g;
  }
  function fragCost(u, lv) { return Math.ceil(u.base * Math.pow(u.rate, lv)); }
  function buyFrag(s, id) {
    const u = FRAG_UPG.find((x) => x.id === id);
    const lv = fu(s, id);
    if (u.max && lv >= u.max) return false;
    const c = fragCost(u, lv);
    if (s.frags < c) return false;
    s.frags -= c;
    s.fragUpg[id] = lv + 1;
    if (id === 'f_autobuy') s.autoBuy = true;
    return true;
  }

  /* ───────── 업적 ───────── */
  function checkAch(s) {
    for (const a of ACH) {
      if (s.ach[a.id]) continue;
      let ok = false;
      try { ok = a.test(s); } catch (e) { ok = false; }
      if (ok) {
        s.ach[a.id] = true;
        emit(s, 'ach', { id: a.id });
        if (a.orb) grantOrb(s, a.orb);
      }
    }
  }

  /* ───────── 레벨 칭호 ───────── */
  function levelTitle(lv) {
    let t = LEVEL_TITLES[0][1];
    for (const [n, name] of LEVEL_TITLES) if (lv >= n) t = name;
    return t;
  }

  /* ───────── 오프라인 ───────── */
  function offlineGain(s, sec) {
    const capH = 2 + fu(s, 'f_off');
    sec = Math.min(sec, capH * 3600);
    if (sec < 60) return null;
    const d = derive(s);
    const z = Math.min(s.zone, FINAL_ZONE - 1);
    const hp = N.pow10(hLog(z));
    const dps = d.compDps + d.avgTap * fu(s, 'f_auto');
    const kps = Math.min(10, dps / hp);
    const eff = 0.5;
    const kills = kps * sec * eff;
    const exp = kills * killExp(z) * d.expMult;
    const gold = kills * killGold(z) * d.goldMult;
    return { sec, kills, exp: N.fin(exp), gold: N.fin(gold) };
  }
  function applyOffline(s, g) {
    if (!g) return;
    addExp(s, g.exp);
    addGold(s, g.gold);
    s.tot.kills += Math.floor(g.kills);
  }

  /* ───────── 저장 ───────── */
  function serialize(s) {
    const o = Object.assign({}, s);
    delete o.events;
    o.lastSave = Date.now();
    return JSON.stringify(o, (k, v) => (v === Infinity ? 'Infinity' : v));
  }
  function deserialize(str) {
    const o = JSON.parse(str, (k, v) => (v === 'Infinity' ? Infinity : v));
    const s = newState();
    // 깊은 병합 (기본값 유지)
    for (const k of Object.keys(o)) {
      if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) && s[k] && typeof s[k] === 'object') s[k] = Object.assign(s[k], o[k]);
      else s[k] = o[k];
    }
    s.events = [];
    // 숫자 보정
    for (const k of ['exp', 'gold', 'sp', 'frags', 'fragsTotal']) s[k] = N.fin(+s[k] || 0);
    for (const k of STAT_KEYS) s.stats[k] = N.fin(+s.stats[k] || 0);
    s.level = levelFromExp(s.exp);
    if (!s.enemy || !(s.enemy.hp >= 0)) spawn(s);
    else spawn(s);
    return s;
  }

  OF.engine = {
    SAVE_VERSION, STAT_KEYS, newState, newRun, derive, tick, doTap, dealDamage, spawn,
    townOf, zoneK, isBossZone, isTownBoss, isFinal, hLog, diffLog, monsterHpLog, killExp, killGold, bossAtk, zoneLabel,
    levelFromExp, expForLevel, addExp, addGold, emit,
    allocate, autoAllocate, resetStats,
    eqCost, eqMaxAfford, buyEquip, eqName, eqMult,
    compUnlocked, compCost, compMaxAfford, buyComp, compFactorOf, compCoef, autoBuyAll,
    classIndex, classMults, tierReq, tierBonus, tierZone, lineAvailable, lineUnlocked, canPromote, promote, passwordFor, tryPassword, grantOrb, curClass, className,
    skillUnlocked, skillCd, useSkill, skillOn,
    rebirthUnlocked, fragGain, rebirth, fragCost, buyFrag, warpZone, fu,
    relicLog, relicMult, checkAch, achCount, levelTitle, offlineGain, applyOffline,
    setZone, advanceTo, serialize, deserialize,
  };
})();
