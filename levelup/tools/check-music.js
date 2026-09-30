#!/usr/bin/env node
/* 음악 검사: 선율 길이와 화음 진행 길이가 맞는지 확인한다. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const SRC = path.join(__dirname, '..', 'src', 'js');
const sb = { console, globalThis: null, window: {}, document: {} };
sb.globalThis = sb;
vm.createContext(sb);
for (const f of ['util', 'audio', 'music']) vm.runInContext(fs.readFileSync(path.join(SRC, f + '.js'), 'utf8'), sb);
const A = sb.G.audio, T = sb.G.music.tracks;
let bad = 0;
for (const id in T) {
  const tr = T[id];
  const lead = tr.lead ? A.parseMML(tr.lead).len : 0;
  const ch = tr.chords ? A.parseChords(tr.chords, tr.bpb || 4).len : 0;
  const ok = !tr.chords || !tr.lead || Math.abs(lead - ch) < 1e-6;
  if (!ok) bad++;
  console.log((ok ? '  ok ' : '  !! ') + id.padEnd(10) + ' 선율 ' + lead + '박 · 화음 ' + ch + '박 · ' + Math.round(((ch || lead) * 60) / tr.bpm) + '초');
}
console.log(bad ? '길이가 안 맞는 곡 ' + bad + '개' : '모든 곡의 길이가 맞다');
process.exitCode = bad ? 1 : 0;
