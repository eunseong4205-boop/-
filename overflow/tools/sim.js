/* 밸런스 시뮬레이터: 실제 엔진을 봇이 플레이하여 소요 시간을 측정한다.
   사용법: node tools/sim.js [탭/초=5] [최대시간(h)=12] [verbose=0] */
const path = require('path');
const src = path.join(__dirname, '..', 'src', 'js');
require(path.join(src, 'num.js'));
require(path.join(src, 'data.js'));
require(path.join(src, 'engine.js'));
const OF = globalThis.OF;
const E = OF.engine;
const N = OF.num;
const { CLASSES, EQUIP, COMPANIONS, SKILLS, FRAG_UPG, TOWNS, FINAL_ZONE, B } = OF.data;
if (process.env.SIM_B) Object.assign(B, JSON.parse(process.env.SIM_B));

const TPS = +(process.argv[2] || 5);
const MAXH = +(process.argv[3] || 12);
const VERBOSE = +(process.argv[4] || 0);
const DT = 0.1;

// 비번 해금 시점 (해당 구역 도달 후 구슬을 모두 찾았다고 가정)
const PW_AT = { c2: 31, c3: 91, c4: 151, c5: 211, c6: 271, c7: 301 };

const s = E.newState();
let lastProgressT = 0, lastMaxZone = 0, retryT = 0;
const townTimes = {};
const log = [];
let rebirthLog = [];

function fmtT(t) { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60); return `${h}h${String(m).padStart(2, '0')}m`; }

function buyStuff() {
  // 전직 우선
  for (let i = 0; i < CLASSES.length; i++) {
    const c = CLASSES[i];
    if (!s.pw[c.id] && PW_AT[c.id] && s.bestZone >= PW_AT[c.id] && E.lineAvailable(s, i)) s.pw[c.id] = true;
    let guard = 0;
    while (E.promote(s, i) && guard++ < 50);
  }
  // 전직 골드 저축 판단
  let save = 0;
  for (let i = 0; i < CLASSES.length; i++) {
    const r = E.canPromote(s, i);
    if (r.reason === 'gold' && r.req.gold < s.gold * 30) save = Math.max(save, r.req.gold);
  }
  let budget = s.gold - (save ? save : 0);
  if (save && budget < 0) return;
  for (let n = 0; n < 400; n++) {
    let best = null, bc = Infinity;
    for (let i = 0; i < EQUIP.length; i++) {
      const c = E.eqCost(i, s.equip[EQUIP[i].id], 1) * [1, 1.2, 2.5, 2][i];
      if (c < bc) { bc = c; best = ['e', i]; }
    }
    for (let i = 0; i < COMPANIONS.length; i++) {
      if (!E.compUnlocked(s, i)) continue;
      // 효율: 계수/비용
      const lv = s.comps[COMPANIONS[i].id] || 0;
      const c = E.compCost(i, lv, 1) * 0.8;
      if (c < bc) { bc = c; best = ['c', i]; }
    }
    if (!best) break;
    const real = best[0] === 'e' ? E.eqCost(best[1], s.equip[EQUIP[best[1]].id], 1) : E.compCost(best[1], s.comps[COMPANIONS[best[1]].id] || 0, 1);
    if (real > s.gold - save) break;
    if (best[0] === 'e') E.buyEquip(s, best[1], 1); else E.buyComp(s, best[1], 1);
  }
}

function buyFrags() {
  const prio = { f_atk: 1, f_hp: 1.6, f_exp: 1.2, f_gold: 1.5, f_comp: 1.1, f_sp: 1.3, f_warp: 0.5, f_auto: 0.6, f_time: 2, f_skill: 3, f_off: 50, f_autobuy: 0.1 };
  for (let n = 0; n < 500; n++) {
    let best = null, bc = Infinity;
    for (const u of FRAG_UPG) {
      const lv = s.fragUpg[u.id] || 0;
      if (u.max && lv >= u.max) continue;
      const c = E.fragCost(u, lv) * (prio[u.id] || 5);
      if (c < bc) { bc = c; best = u; }
    }
    if (!best || !E.buyFrag(s, best.id)) break;
  }
}

let t = 0, tapAcc = 0, sec = 0, runStart = 0;
let storyLines = 0;
const endT = MAXH * 3600;
let done = false;
while (t < endT && !done) {
  // 수동 탭
  tapAcc += TPS * DT;
  while (tapAcc >= 1) { tapAcc -= 1; E.doTap(s, false); }
  E.tick(s, DT);
  t += DT;
  sec += DT;
  if (s.events.length) {
    for (const ev of s.events) {
      if (ev.type === 'reach' && E.isTownBoss(ev.z) === false && (ev.z - 1) % B.zonesPerTown === 0 && ev.z > 1) {
        const town = (ev.z - 1) / B.zonesPerTown;
        townTimes[town] = t;
        log.push(`${fmtT(t)}  마을${town} 보스격파 → ${TOWNS[Math.min(town, TOWNS.length - 1)].name} 도착 | Lv ${N.fmt(s.level)} | 골드 ${N.fmt(s.gold)} | 조각 ${N.fmt(s.fragsTotal)} | 환생 ${s.rebirths} | ${E.className(s)}`);
      }
      if (ev.type === 'overflow' && !done) { done = true; log.push(`${fmtT(t)}  ★ OVERFLOW 엔딩 ★ Lv ${N.fmt(s.level)} 환생 ${s.rebirths}`); }
    }
    s.events.length = 0;
  }
  if (sec >= 1) {
    sec = 0;
    buyStuff();
    for (const sk of SKILLS) E.useSkill(s, sk.id);
    if (s.maxZone > lastMaxZone) { lastMaxZone = s.maxZone; lastProgressT = t; }
    // 보스 실패 후 재도전
    if (!s.autoAdvance && t - retryT > 20) { retryT = t; s.autoAdvance = true; E.setZone(s, s.maxZone); }
    // 환생 판단
    if (E.rebirthUnlocked(s)) {
      const g = E.fragGain(s);
      const stuck = t - lastProgressT;
      if ((g >= Math.max(3, s.fragsTotal * 1.0) && stuck > 60) || (stuck > 180 && g >= 1)) {
        const d = E.derive(s), L10 = Math.log10;
        rebirthLog.push(`${fmtT(t)} 환생#${s.rebirths + 1} (${Math.round((t - runStart) / 60)}분) z${s.maxZone} HP=${E.monsterHpLog(s.maxZone).toFixed(1)} dps=${L10(d.compDps + d.avgTap * TPS).toFixed(1)} Lv ${N.fmt(s.maxLevelRun)} +${N.fmt(g)} (누적 ${N.fmt(s.fragsTotal + g)}) ${E.className(s)}`);
        runStart = t;
        E.rebirth(s);
        buyFrags();
        lastMaxZone = 0; lastProgressT = t;
      }
    }
    if (VERBOSE && Math.floor(t) % 600 === 0) {
      const d = E.derive(s);
      console.log(`[${fmtT(t)}] z${s.zone}/${s.maxZone} best${s.bestZone} Lv${N.fmt(s.level)} atk${N.fmt(d.atk)} tap${N.fmt(d.tapBase)} comp${N.fmt(d.compDps)} hp${N.fmt(d.hp)} mobHP${N.fmt(N.pow10(E.monsterHpLog(s.zone)))} gold${N.fmt(s.gold)} W${s.equip.weapon} A${s.equip.armor} R${s.equip.ring} M${s.equip.amulet} ${E.className(s)}`);
    }
  }
}
console.log(log.join('\n'));
if (VERBOSE > 1) console.log(rebirthLog.join('\n'));
console.log(`\n총 ${fmtT(t)}  bestZone ${s.bestZone}  환생 ${s.rebirths}  최대Lv ${N.fmt(s.tot.maxLevel)}  maxDmg ${N.fmt(s.tot.maxDmg)} ending=${!!s.flags.ending}`);
