#!/usr/bin/env node
/* 진행 속도 시뮬레이터: 실제 data.js · engine.js 규칙으로 플레이어가 장마다 관문을 넘는 데
   드는 클릭 수와 시간을 잰다. 이야기(읽기) · 이동 · 전투 시간은 장마다 어림값을 더한다.
   사용법: node levelup/tools/sim.js [casual|normal|grinder|all] */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src', 'js');
const ctx = vm.createContext({ console });
for (const f of ['util.js', 'data.js', 'engine.js']) vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f });
const G = ctx.G, D = G.data, E = G.engine, U = G.u;

/* 실험용 덮어쓰기: --K=20 (경험치 무게) --rank=2 (등급 값 배율) --tool=2 (장갑 값 배율) --gear=2 (무기·갑옷·장신구 값 배율) */
const OPT = {};
for (const a of process.argv.slice(2)) { const m = /^--(\w+)=([\d.]+)$/.exec(a); if (m) OPT[m[1]] = +m[2]; }
if (OPT.K) D.B.expK = OPT.K;
if (OPT.rank) { const f = D.rankTierCost; D.rankTierCost = (rk, t) => f(rk, t) * OPT.rank; }
for (const it of Object.values(D.ITEMS)) {
  if (OPT.tool && it.type === 'tool') it.price *= OPT.tool;
  if (OPT.gear && (it.type === 'weapon' || it.type === 'armor' || it.type === 'acc')) it.price *= OPT.gear;
}

/* ───────── 플레이어 유형 ─────────
   cps: 버튼 누르는 속도(초당) · spot: 수련 샘(×3) 위에서 누르는 비율 · fever: 피버(×2) 비율
   food: 음식 효과가 켜져 있는 비율 · read: 초당 읽는 글자 수 · walk: 장마다 이동·탐험 배율 */
const PROFILES = {
  casual: { cps: 4, spot: 0.5, fever: 0.1, food: 0.1, read: 9, walk: 1.3 },
  normal: { cps: 5, spot: 0.6, fever: 0.25, food: 0.3, read: 11, walk: 1 },
  grinder: { cps: 7, spot: 0.95, fever: 0.7, food: 1, read: 16, walk: 0.7 },
};

const ki = (r, f) => { const R = D.REG[r]; return Math.round(R.lv[0] * Math.pow(R.lv[1] / R.lv[0], f)); };
const boss = (id) => Math.round(D.MON[id].lv * (D.MON[id].role === 'x' ? 1 : 0.97));
const hangul = (file) => { try { return (fs.readFileSync(path.join(SRC, 'world', file), 'utf8').match(/[가-힣]/g) || []).length; } catch (_) { return 0; } };

/* 장: 수련할 수 있는 맵의 기운(레벨) · 넘어야 할 관문(레벨·등급·보스) · 이 장에서 열리는 등급 비밀번호 · 어림 이동 시간(분) */
const CHAPTERS = [
  { name: '1장 그린', file: '01_green.js', shop: 0, maps: [1, ki('green', 0.45), ki('green', 0.78)], lv: 30, bosses: ['treant', 'golem0'], acc: 'x10', walk: 12 },
  { name: '2장 레드', file: '02_red.js', shop: 1, maps: [ki('red', 0.18), ki('red', 0.62)], lv: 150, bosses: ['rud1', 'salamander'], walk: 14 },
  { name: '3장 블루', file: '03_blue.js', shop: 2, maps: [ki('blue', 0.1), ki('blue', 0.28), ki('blue', 0.42), ki('blue', 0.46), ki('blue', 0.84)], bosses: ['moleking', 'kraken'], pw: 'r2', acc: 'x2', walk: 16 },
  { name: '4장 옐로', file: '04_yellow.js', shop: 3, maps: [ki('yellow', 0.3), ki('yellow', 0.46), ki('yellow', 0.82)], lv: 2000, bosses: ['sphinx', 'goldie'], walk: 13 },
  { name: '5장 퍼플', file: '05_purple.js', shop: 4, maps: [ki('purple', 0.08), ki('purple', 0.52), ki('purple', 0.85)], lv: 6000, rank: ['r2', 1], pw: 'r3', walk: 13 },
  { name: '6장 무지개', file: '06_rainbow.js', shop: 5, maps: [ki('rainbow', 0.2), ki('rainbow', 0.5), ki('rainbow', 0.86)], lv: 25000, rank: ['r3', 5], bosses: ['storm'], acc: 'x5', walk: 13 },
  { name: '7장 화이트', file: '07_white.js', shop: 6, maps: [ki('white', 0.12), ki('white', 0.8)], lv: 60000, rank: ['r3', 15], bosses: ['edel', 'lumie'], walk: 11 },
  { name: '8장 그레이', file: '08_gray.js', shop: 7, maps: [ki('gray', 0.12), ki('gray', 0.5), ki('gray', 0.84)], lv: 120000, rank: ['r4', 1], bosses: ['voltmech'], pw: 'r4', walk: 11 },
  { name: '9장 블랙', file: '09_black.js', shop: 8, maps: [ki('black', 0.12), ki('black', 0.6), ki('black', 0.85)], lv: 250000, rank: ['r4', 15], bosses: ['gargoyle', 'nocturne'], walk: 12 },
  { name: '10장 알록달록', file: '10_colorful.js', shop: 9, maps: [ki('colorful', 0.45), ki('colorful', 0.85)], lv: 400000, rank: ['r5', 1], bosses: ['megafirework'], pw: 'r5', walk: 11 },
  { name: '11장 하늘 정거장', file: '11_space.js', shop: 10, maps: [ki('space', 0.2), ki('space', 0.8)], lv: 600000, rank: ['r5', 20], bosses: ['herald'], acc: 'x9', walk: 8 },
  { name: '12장 아스트라', file: '12_planet.js', shop: 11, maps: [ki('planet', 0.22), ki('planet', 0.72), ki('planet', 0.95)], lv: 850000, rank: ['r5', 40], bosses: ['golddragon', 'kairon', 'blacksun'], walk: 12 },
];

function run(P, verbose) {
  const s = E.newState('시뮬', 'boy');
  let sec = 0, clicks = 0, battles = 0, story = 0;
  const rows = [];
  const shopsOpen = new Set();
  const accs = [];
  const spent = { tool: 0, gear: 0, rank: 0, food: 0 };
  const pay = (k, before) => { spent[k] += before - s.gold; };
  const buyBest = () => {
    for (const i of shopsOpen) {
      const list = D.SHOPS[D.REGIONS[i].id].items;
      for (const id of list) {
        const it = D.ITEMS[id];
        const g0 = s.gold;
        if (it.type === 'tool' && !s.inv[id] && s.gold >= it.price) { E.buy(s, id); pay('tool', g0); }
        if ((it.type === 'weapon' || it.type === 'armor') && !s.inv[id] && s.gold >= it.price * 3) { E.buy(s, id); pay('gear', g0); }
        if (it.type === 'acc' && it.fx.exp && !s.inv[id] && s.gold >= it.price * 2) { E.buy(s, id); accs.push(id); pay('gear', g0); }
      }
    }
    // 경험치가 가장 높은 장신구를 낀다
    let best = s.eq.acc, bv = best ? (D.ITEMS[best].fx.exp || 0) : -1;
    for (const id of accs) if ((D.ITEMS[id].fx.exp || 0) > bv) { best = id; bv = D.ITEMS[id].fx.exp; }
    if (best) s.eq.acc = best;
    // 등급: 열린 줄의 다음 차수를 살 수 있으면 산다
    for (let guard = 0; guard < 20; guard++) {
      const i = E.curLine(s);
      const g0 = s.gold;
      if (i < 0 || !E.rankUp(s, i)) break;
      pay('rank', g0);
    }
  };
  const bestFood = () => { let f = null; for (const i of shopsOpen) for (const id of D.SHOPS[D.REGIONS[i].id].items) if (D.ITEMS[id].type === 'food' && D.ITEMS[id].fx.exp && (!f || D.ITEMS[id].fx.exp > D.ITEMS[f].fx.exp)) f = id; return f; };

  const fights = [];
  /** 보스 앞에 선 순간의 전투 어림: 탭 수 · 이기는 데 걸리는 시간 · 버티는 시간
      적의 의도(battle.js)를 평균 내어 본다: 강타 ×2.6, 흡수 ×0.8(+회복), 장막 0(탭 피해 흡수), 저주 ×0.5 */
  const INT = { strike: [1, 1], heavy: [1.6, 2.6], drain: [1.2, 0.8], shield: [0.9, 0], hex: [1.3, 0.5] };
  const PAT = { e: { strike: 5, heavy: 3, drain: 1, shield: 2 }, b: { strike: 4, heavy: 3, drain: 2, shield: 2 }, x: { strike: 4, heavy: 3, drain: 2, shield: 2, hex: 2 } };
  const judge = (id) => {
    const md = D.MON[id], d = E.derive(s);
    const perTap = d.atk * (1 + d.crit * (d.critDmg - 1)) * d.taps;
    const pat = PAT[md.role] || PAT.b, W = Object.values(pat).reduce((a, b) => a + b, 0);
    let cyc = 0, mul = 0;
    for (const k in pat) { cyc += pat[k] / W * INT[k][0]; mul += pat[k] / W * INT[k][1]; }
    const every = D.B.enemyEvery * (md.role === 'x' ? 0.85 : 1) * cyc;
    // 장막(12%)과 흡수(5%)만큼 더 두드려야 한다
    const extra = 1 + (pat.shield || 0) / W * 0.12 * 2.8 + (pat.drain || 0) / W * 0.05;
    const taps = Math.ceil(md.hp * extra / perTap);
    const hitDmg = Math.max(md.atk * 0.12, md.atk - d.def) * mul;
    const hits = Math.ceil(d.hpMax / Math.max(1, hitDmg));
    const survive = 1.6 + (hits - 1) * every;             // 막지도 마시지도 않을 때 쓰러지기까지 걸리는 초
    const tps = 6;
    fights.push({ id, name: md.name, lv: s.lv, mlv: md.lv, taps, win: taps / tps, survive, hits, gear: (s.eq.weapon || '-') + '/' + (s.eq.armor || '-') + ' ' + E.rankName(s) });
  };
  for (const ch of CHAPTERS) {
    const c0 = clicks, t0 = sec, b0 = battles, g0 = s.tot.gold, sp0 = Object.assign({}, spent);
    let lag = 0;   // 레벨은 됐는데 등급 값이 모자라 더 누른 시간
    shopsOpen.add(ch.shop);
    if (ch.pw) s.pw[ch.pw] = true;
    if (ch.acc) { s.inv[ch.acc] = 1; accs.push(ch.acc); }
    const goalLv = Math.max(ch.lv || 0, ...(ch.bosses || []).map(boss));
    const done = () => s.lv >= goalLv && (!ch.rank || (s.ranks[ch.rank[0]] || 0) >= ch.rank[1]);
    const food = P.food > 0 ? bestFood() : null;
    let foodPaid = 0;
    // 1초 단위로 누른다
    const pending = (ch.bosses || []).slice();
    while (!done()) {
      buyBest();
      for (let i = pending.length - 1; i >= 0; i--) if (s.lv >= boss(pending[i])) { judge(pending[i]); pending.splice(i, 1); }
      if (s.lv >= goalLv) lag++;
      // 이길 수 있는 맵 가운데 기운이 가장 높은 곳에서 수련한다
      const mapsOk = ch.maps.filter((k) => k <= s.lv * 1.15);
      const L = mapsOk.length ? Math.max(...mapsOk) : Math.min(...ch.maps);
      const base = D.clickBase(L);
      const d = E.derive(s);
      let foodM = 1;
      if (food) {
        // 음식은 food 비율만큼 켜 둔다 (값은 5분마다 치른다)
        foodM = 1 + D.ITEMS[food].fx.exp * P.food;
        foodPaid += P.food / 300;
        while (foodPaid >= 1 && s.gold >= D.ITEMS[food].price) { s.gold -= D.ITEMS[food].price; spent.food += D.ITEMS[food].price; foodPaid -= 1; }
      }
      const spot = 1 + 2 * P.spot, fever = 1 + P.fever;
      const m = d.tool * spot * fever * foodM;
      const n = P.cps;
      E.addExp(s, base * m * d.expM * n);
      E.addGold(s, base * D.B.goldRatio * m * d.goldM * n);
      clicks += n; sec += 1;
      // 제자리에서 누르고 있어도 맵의 몬스터가 45초에 한 번쯤 부딪친다 → 전투 8초
      if (sec % 45 === 0 && L > 1) {
        battles++; sec += 8;
        const monL = Math.max(1, Math.round(L * 0.95));
        const kill = D.targetClick(monL) * D.B.killExp / D.expectedMult(monL, false);
        E.addExp(s, kill * d.expM); E.addGold(s, kill * D.B.goldRatio * d.goldM);
      }
      if (sec > 60 * 3600) { console.log('!! 60시간 넘게 막힘: ' + ch.name + ' Lv' + s.lv); return null; }
    }
    buyBest();
    for (const id of pending) judge(id);
    const read = (hangul(ch.file) * 0.8) / P.read;       // 대사 · 책의 80%를 읽는다
    const walk = ch.walk * 60 * P.walk;                    // 이동 · 탐험 · 상점
    const bossT = (ch.bosses || []).length * 70;            // 보스전: 막기·경직·물약을 섞어 싸우는 시간
    story += read + walk + bossT;
    rows.push({ ch: ch.name, lv: s.lv, clicks: clicks - c0, grind: (sec - t0) / 60, battles: battles - b0, story: (read + walk + bossT) / 60, total: (sec + story) / 3600, gold: s.gold, lag: lag / 60, earned: s.tot.gold - g0, sp: Object.fromEntries(Object.keys(spent).map((k) => [k, spent[k] - sp0[k]])), ranks: E.rankName(s), tool: E.toolIndex(s) });
  }
  const total = (sec + story) / 3600;
  if (verbose) {
    console.log('장'.padEnd(12) + '레벨'.padStart(10) + '클릭'.padStart(9) + '수련(분)'.padStart(9) + '전투'.padStart(6) + '이야기(분)'.padStart(10) + '누적(시간)'.padStart(10) + '등급대기'.padStart(8) + '  등급 · 장갑 · 남은 골드');
    for (const r of rows) console.log(r.ch.padEnd(12) + U.fmtInt(r.lv).padStart(10) + String(Math.round(r.clicks)).padStart(9) + r.grind.toFixed(1).padStart(9) + String(r.battles).padStart(6) + r.story.toFixed(1).padStart(10) + r.total.toFixed(2).padStart(10) + r.lag.toFixed(1).padStart(8) + '  ' + r.ranks + ' · t' + r.tool + ' · ' + U.fmt(r.gold));
    if (OPT.boss) {
      console.log('\n보스'.padEnd(18) + '내 레벨'.padStart(9) + '보스 레벨'.padStart(10) + '탭'.padStart(6) + '이기기(초)'.padStart(10) + '버티기(초)'.padStart(10) + '  (초당 6탭, 물약·기술 없이)');
      for (const f of fights) console.log(f.name.padEnd(16) + U.fmtInt(f.lv).padStart(9) + U.fmtInt(f.mlv).padStart(10) + String(f.taps).padStart(6) + f.win.toFixed(1).padStart(10) + f.survive.toFixed(1).padStart(10) + (f.win > f.survive ? '  ← 물약·기술 필요' : '') + '  ' + f.gear);
    }
    if (OPT.gold) {
      console.log('\n장'.padEnd(13) + '번 골드'.padStart(10) + '장갑%'.padStart(7) + '장비%'.padStart(7) + '등급%'.padStart(7) + '음식%'.padStart(7));
      for (const r of rows) console.log(r.ch.padEnd(12) + U.fmt(r.earned).padStart(10) + ['tool', 'gear', 'rank', 'food'].map((k) => (100 * r.sp[k] / r.earned).toFixed(0).padStart(7)).join(''));
    }
    console.log('합계: 클릭 ' + Math.round(clicks) + '번 · 수련 ' + (sec / 3600).toFixed(2) + '시간 · 이야기·이동 ' + (story / 3600).toFixed(2) + '시간 · 전투 ' + battles + '번 → 총 ' + total.toFixed(2) + '시간');
  }
  return { total, clicks, grindH: sec / 3600, storyH: story / 3600 };
}

const which = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'all';
for (const k of which === 'all' ? Object.keys(PROFILES) : [which]) {
  console.log('\n■ ' + k + ' ' + JSON.stringify(PROFILES[k]));
  run(PROFILES[k], true);
}
