#!/usr/bin/env node
/* 맵 검사기: 모든 맵을 불러와 NPC · 문 · 워프 · 가장자리 · 상자 · 수련 샘이 실제로 닿을 수 있는지 확인한다.
   사용법: node levelup/tools/validate.js [--dump 맵id] */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'js');
const ORDER = ['util', 'data', 'engine', 'tiles', 'sprites', 'portraits', 'chars', 'field', 'ui', 'script', 'battle', 'audio', 'music'];

function fakeCanvas() {
  const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ addColorStop() {} })), set: (t, k, v) => { t[k] = v; return true; } });
  return { width: 16, height: 16, getContext: () => ctx, style: {} };
}
function load() {
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval, performance: { now: () => Date.now() },
    document: { createElement: () => fakeCanvas(), getElementById: () => null, querySelectorAll: () => [], documentElement: { style: { setProperty() {} } } },
    window: { addEventListener() {}, devicePixelRatio: 1 }, requestAnimationFrame: () => 0, navigator: {}, location: {},
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const files = ORDER.map((n) => path.join(SRC, n + '.js'));
  const wdir = path.join(SRC, 'world');
  for (const f of fs.readdirSync(wdir).filter((f) => f.endsWith('.js')).sort()) files.push(path.join(wdir, f));
  files.push(path.join(SRC, 'main.js'));
  for (const f of files) vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.relative(ROOT, f) });
  return sandbox.G;
}

// 대본 속 순간이동(c.warp('맵', x, y))도 입구로 친다
function scriptEntries() {
  const out = {};
  const wdir = path.join(SRC, 'world');
  const files = fs.readdirSync(wdir).filter((f) => f.endsWith('.js')).map((f) => path.join(wdir, f)).concat([path.join(SRC, 'main.js')]);
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    const re = /warp\('([a-z0-9_]+)',\s*(\d+),\s*(\d+)/g;
    let m;
    while ((m = re.exec(txt))) (out[m[1]] = out[m[1]] || []).push([+m[2], +m[3], path.basename(f) + ' 대본']);
  }
  return out;
}
function check(G) {
  const T = G.tiles, D = G.data;
  const SCRIPT_IN = scriptEntries();
  const errs = [], warns = [];
  const maps = G.maps;
  const gridOf = (m) => { const W = Math.max(...m.grid.map((r) => r.length)); return m.grid.map((r) => r.padEnd(W, '#')); };
  const S0 = G.engine.newState('검사', 'boy');
  const info = {};
  for (const id in maps) {
    const m = maps[id];
    const grid = gridOf(m);
    const H = grid.length, W = grid[0].length;
    const rows = grid.map((r) => r.split(''));
    const builds = (m.builds || []);
    const inB = (x, y) => builds.some((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && T.walkable(rows[y][x]) && !inB(x, y);
    info[id] = { grid: rows, W, H, walk, inB };
  }
  for (const id in maps) {
    const m = maps[id], I = info[id];
    const { W, H, walk } = I;
    const where = (x, y) => id + ' (' + x + ',' + y + ')';
    if (m.grid.some((r) => r.length !== m.grid[0].length)) warns.push(id + ': 줄 길이가 들쭉날쭉하다');
    // 막히는 오브젝트 · NPC
    const solid = new Set();
    for (const o of m.objs || []) if (o.t === 'chest' || o.t === 'sign' || o.t === 'prop' || o.t === 'statue' || o.t === 'pickup' || o.t === 'lamp' || o.t === 'book') solid.add(o.x + ',' + o.y);
    for (const n of m.npcs || []) solid.add(n.x + ',' + n.y);
    for (const f of m.fixed || []) solid.add(f.x + ',' + f.y);
    const pass = (x, y) => walk(x, y) && !solid.has(x + ',' + y);
    // 입구들
    const entries = [];
    for (const sid in maps) {
      const sm = maps[sid];
      for (const w of sm.warps || []) if (w.to === id) entries.push([w.tx, w.ty, sid + ' 워프']);
      for (const b of sm.builds || []) if (b.to === id) entries.push([b.tx, b.ty, sid + ' 건물']);
      for (const k in sm.edges || {}) { const e = sm.edges[k]; if (e.to === id && e.tx != null) entries.push([e.tx, e.ty, sid + ' 가장자리 ' + k]); }
    }
    for (const t of G.world.towns) if (t.map === id) entries.push([t.x, t.y, '마을 이동']);
    for (const e of SCRIPT_IN[id] || []) entries.push(e);
    if (id === 'home') entries.push([6, 7, '시작']);
    for (const [x, y, from] of entries) if (!walk(x, y)) errs.push(where(x, y) + ': 도착 칸이 막혀 있다 (' + from + ', 타일 ' + (I.grid[y] ? I.grid[y][x] : '?') + ')');
    // 닿는 곳
    const seen = new Set();
    const q = entries.filter(([x, y]) => walk(x, y)).map(([x, y]) => [x, y]);
    for (const [x, y] of q) seen.add(x + ',' + y);
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k) || !pass(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    const reach = (x, y) => seen.has(x + ',' + y);
    const adjReach = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reach(x + dx, y + dy)) || [[2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dy]) => reach(x + dx, y + dy) && ['n'].includes((I.grid[y + dy / 2] || [])[x + dx / 2]));
    if (!entries.length) warns.push(id + ': 들어오는 길이 없다');
    for (const n of m.npcs || []) {
      if (!walk(n.x, n.y)) errs.push(where(n.x, n.y) + ': NPC ' + n.id + '가 막힌 칸에 서 있다 (' + I.grid[n.y][n.x] + ')');
      if (!G.chars[n.id] && !n.look) errs.push(id + ': NPC ' + n.id + ' 인물 정보 없음');
      if (entries.length && !adjReach(n.x, n.y) && !n.cond) warns.push(where(n.x, n.y) + ': NPC ' + n.id + '에게 닿을 수 없다');
    }
    for (const o of m.objs || []) {
      if (o.x < 0 || o.y < 0 || o.x >= W || o.y >= H) { errs.push(where(o.x, o.y) + ': 오브젝트가 맵 밖'); continue; }
      if (o.t === 'spot' && (!walk(o.x, o.y) || (entries.length && !reach(o.x, o.y)))) errs.push(where(o.x, o.y) + ': 수련 샘에 설 수 없다 (' + I.grid[o.y][o.x] + ')');
      if ((o.t === 'chest' || o.t === 'sign' || o.t === 'book' || o.t === 'gate' || o.t === 'orbshine' || o.t === 'pickup') && entries.length && !adjReach(o.x, o.y) && !(o.t === 'gate' && reach(o.x, o.y))) warns.push(where(o.x, o.y) + ': ' + o.t + (o.id ? ' ' + o.id : '') + '에 닿을 수 없다');
      if (o.t === 'book' && !G.books[o.id]) errs.push(id + ': 없는 책 ' + o.id);
      if (o.t === 'chest' && o.item && !D.ITEMS[o.item]) errs.push(id + ': 상자에 없는 아이템 ' + o.item);
    }
    for (const w of m.warps || []) {
      if (!maps[w.to]) { errs.push(where(w.x, w.y) + ': 없는 맵으로 워프 ' + w.to); continue; }
      if (entries.length && !reach(w.x, w.y) && !(walk(w.x, w.y) && adjReach(w.x, w.y))) warns.push(where(w.x, w.y) + ': 워프 칸에 닿을 수 없다');
    }
    for (const b of m.builds || []) {
      if (b.to && !maps[b.to]) { errs.push(id + ': 건물이 없는 맵으로 ' + b.to); continue; }
      if (b.door !== undefined) {
        const fx = b.x + b.door, fy = b.y + b.h;
        if (!walk(fx, fy)) errs.push(where(fx, fy) + ': 건물 문 앞이 막혀 있다 (' + (I.grid[fy] ? I.grid[fy][fx] : '?') + ')');
        else if (entries.length && !reach(fx, fy)) warns.push(where(fx, fy) + ': 건물 문 앞에 닿을 수 없다');
        if (b.to) { const back = (maps[b.to].warps || []).find((w) => w.to === id); if (back && (back.tx !== fx || back.ty !== fy)) warns.push(b.to + ': 나가는 문이 ' + where(back.tx, back.ty) + '로 가는데 건물 문 앞은 (' + fx + ',' + fy + ')'); }
      }
      if (b.x < 0 || b.y < 0 || b.x + b.w > W || b.y + b.h > H) errs.push(id + ': 건물이 맵 밖으로 나갔다');
    }
    for (const k in m.edges || {}) {
      const e = m.edges[k];
      if (!maps[e.to]) { warns.push(id + ': 가장자리 ' + k + ' → 아직 없는 맵 ' + e.to); continue; }
      const edgeTiles = [];
      for (let i = 0; i < (k === 'up' || k === 'down' ? W : H); i++) {
        const x = k === 'left' ? 0 : k === 'right' ? W - 1 : i, y = k === 'up' ? 0 : k === 'down' ? H - 1 : i;
        if (walk(x, y)) edgeTiles.push([x, y]);
      }
      if (!edgeTiles.length) errs.push(id + ': 가장자리 ' + k + '에 나갈 칸이 없다');
      else if (entries.length && !edgeTiles.some(([x, y]) => reach(x, y))) errs.push(id + ': 가장자리 ' + k + ' 출구에 닿을 수 없다');
      if (e.tx == null) warns.push(id + ': 가장자리 ' + k + '에 도착 좌표(tx,ty)가 없다');
    }
    if (m.mons) {
      for (const mid of m.mons.list) if (!D.MON[mid]) errs.push(id + ': 없는 몬스터 ' + mid);
      const a = m.mons.area || [0, 0, W, H];
      let free = 0; for (let y = a[1]; y < a[1] + a[3]; y++) for (let x = a[0]; x < a[0] + a[2]; x++) if (walk(x, y)) free++;
      if (free < m.mons.n * 4) warns.push(id + ': 몬스터 구역이 좁다 (' + free + '칸)');
    }
    for (const f of m.fixed || []) {
      if (!D.MON[f.mon]) errs.push(id + ': 없는 몬스터 ' + f.mon);
      if (!walk(f.x, f.y)) errs.push(where(f.x, f.y) + ': 고정 몬스터 ' + f.mon + '가 막힌 칸');
      else if (entries.length && !adjReach(f.x, f.y)) warns.push(where(f.x, f.y) + ': 고정 몬스터 ' + f.mon + '에 닿을 수 없다');
    }
    for (const tr of m.triggers || []) if (!tr.run) errs.push(id + ': 실행할 대본이 없는 트리거');
    void S0;
  }
  // 이야기 자료
  for (const qid in G.quests) if (!G.quests[qid].stages || !G.quests[qid].name) errs.push('부탁 ' + qid + ' 정보가 모자라다');
  for (const k in D.SHOPS) for (const it of D.SHOPS[k].items) if (!D.ITEMS[it]) errs.push('상점 ' + k + ': 없는 아이템 ' + it);
  return { errs, warns };
}

const G = load();
const arg = process.argv.indexOf('--dump');
if (arg > 0) {
  const id = process.argv[arg + 1];
  const m = G.maps[id];
  const rows = m.grid.map((r) => r.split(''));
  for (const b of m.builds || []) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) rows[y][x] = b.style === 'tower' ? 'Ω' : '▒';
  for (const n of m.npcs || []) rows[n.y][n.x] = '☺';
  for (const o of m.objs || []) rows[o.y][o.x] = { spot: '◎', chest: '▣', sign: '¶', book: '♣', gate: '≡', orbshine: '●' }[o.t] || '?';
  for (const f of m.fixed || []) rows[f.y][f.x] = '♞';
  console.log(id + ' ' + rows[0].length + '×' + rows.length);
  console.log(rows.map((r, i) => String(i).padStart(2) + ' ' + r.join('')).join('\n'));
}
const { errs, warns } = check(G);
console.log('맵 ' + Object.keys(G.maps).length + '개 · 부탁 ' + Object.keys(G.quests).length + '개 · 책 ' + Object.keys(G.books).length + '권 · 인물 ' + Object.keys(G.chars).length + '명');
for (const w of warns) console.log('  주의: ' + w);
for (const e of errs) console.log('  오류: ' + e);
console.log(errs.length ? '오류 ' + errs.length + '개' : '오류 없음');
process.exitCode = errs.length ? 1 : 0;
