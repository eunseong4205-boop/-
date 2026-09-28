#!/usr/bin/env node
/* 맵을 글자 그림으로 찍는다 (좌표 눈금 · 사람 · 물건 · 출입구 · 건물 표시). 소품과 살펴볼 곳의 자리를 고를 때 쓴다.
   사용법: node levelup/tools/mapdump.js green red_path …  (빌드된 levelup.html을 읽는다) */
'use strict';
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const FILE = path.resolve(path.join(__dirname, '..', '..', 'levelup.html'));
const ids = process.argv.slice(2);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + FILE);
  await p.waitForTimeout(300);
  const out = await p.evaluate((ids) => {
    const list = ids.length ? ids : Object.keys(G.maps);
    return list.map((id) => {
      const m = G.maps[id];
      if (!m) return { id, err: 'no map' };
      const rows = m.grid.map((r) => r.split(''));
      const mark = (x, y, ch) => { if (rows[y] && rows[y][x] !== undefined) rows[y][x] = ch; };
      for (const b of m.builds || []) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) mark(x, y, b.style === 'tower' ? '¥' : '▓');
      for (const b of m.builds || []) if (b.door !== undefined) mark(b.x + b.door, b.y + b.h - 1, '▯');
      const legend = [];
      for (const o of m.objs || []) {
        const ch = { sign: o.invisible ? '·' : '♠', book: 'B', chest: 'C', spot: o.hidden ? '✧' : '☆', gate: 'G', pickup: 'P', orbshine: 'O', lamp: 'i', prop: 'p' }[o.t] || '?';
        mark(o.x, o.y, ch);
      }
      for (const w of m.warps || []) mark(w.x, w.y, 'W');
      (m.npcs || []).forEach((n, i) => { const c = String.fromCharCode(97 + (i % 26)); mark(n.x, n.y, c); legend.push(c + '=' + n.id + '(' + n.x + ',' + n.y + ')'); });
      for (const f of m.fixed || []) { mark(f.x, f.y, 'M'); legend.push('M=' + f.mon + '(' + f.x + ',' + f.y + ')'); }
      const W = Math.max(...rows.map((r) => r.length));
      const tens = '    ' + Array.from({ length: W }, (_, x) => (x % 10 === 0 ? String(Math.floor(x / 10)) : ' ')).join('');
      const ones = '    ' + Array.from({ length: W }, (_, x) => String(x % 10)).join('');
      const body = rows.map((r, y) => String(y).padStart(3) + ' ' + r.join('')).join('\n');
      const edges = Object.entries(m.edges || {}).map(([k, e]) => k + '→' + e.to).join(' ');
      return { id, text: m.name + ' [' + id + '] ' + W + '×' + rows.length + '  ' + edges + '\n' + tens + '\n' + ones + '\n' + body + '\n' + legend.join('  ') };
    });
  }, ids);
  for (const o of out) console.log((o.err ? o.id + ': ' + o.err : o.text) + '\n');
  await b.close();
})();
