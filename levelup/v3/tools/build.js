#!/usr/bin/env node
/* v3 빌드: v3/js/*.js를 순서대로 잇고 v3/js/world/*.js를 붙인다.
   node levelup/v3/tools/build.js [--out 경로]
   기본: 저장소 맨 위 levelup.html(완성본) · levelup/dist/levelup-artifact.html(아티팩트 조각) · levelup/dist/v3.html(시험용 사본) */
'use strict';
const fs = require('fs');
const path = require('path');
const V3 = path.resolve(__dirname, '..');
const ROOT = path.resolve(V3, '..');
const ORDER = ['util', 'input', 'gfx', 'tiles', 'objs', 'map', 'ent', 'fx', 'world', 'player', 'sprites', 'portraits', 'data', 'progress', 'state', 'light', 'combat', 'specials', 'enemies', 'bosses', 'monsters', 'props', 'hud', 'ui', 'cine', 'script', 'arsenal', 'stance', 'talents', 'gen', 'audio', 'music'];
const TITLE = '무한렙업 대모험';
const read = (p) => fs.readFileSync(p, 'utf8');
function fonts() {
  const dir = path.join(ROOT, 'assets', 'fonts');
  const faces = [['galmuri11.woff2', 'Galmuri11'], ['galmuri11b.woff2', 'Galmuri11 Bold'], ['galmuri14.woff2', 'Galmuri14']];
  return faces.filter(([f]) => fs.existsSync(path.join(dir, f))).map(([f, fam]) => "@font-face{font-family:'" + fam + "';src:url(data:font/woff2;base64," + fs.readFileSync(path.join(dir, f)).toString('base64') + ") format('woff2');font-display:block}").join('\n');
}
function scripts() {
  const parts = [];
  for (const n of ORDER) { const p = path.join(V3, 'js', n + '.js'); if (fs.existsSync(p)) parts.push(['js/' + n + '.js', read(p)]); }
  const wdir = path.join(V3, 'js', 'world');
  if (fs.existsSync(wdir)) for (const f of fs.readdirSync(wdir).filter((f) => f.endsWith('.js')).sort()) parts.push(['js/world/' + f, read(path.join(wdir, f))]);
  parts.push(['js/game.js', read(path.join(V3, 'js', 'game.js'))]);
  const boot = "(function(){var h=window.claude&&window.claude.hot;var start=function(d){G.game.boot(d||{});};if(h&&h.ready)h.ready(start);else start(h&&h.data||{});})();";
  return parts.map(([n, s]) => '/* ' + n + ' */\n' + s).join('\n') + '\n' + boot;
}
const args = process.argv.slice(2);
const outI = args.indexOf('--out');
const css = fonts() + '\n' + read(path.join(V3, 'style.css'));
const body = read(path.join(V3, 'body.html'));
const js = scripts();
if (js.indexOf('</script') >= 0) throw new Error('스크립트 안에 </script 가 있다');
// 문법 검사: 한 파일이라도 깨지면 게임 전체가 열리지 않으니 쓰기 전에 막는다
try { new (require('vm').Script)(js, { filename: 'bundle' }); }
catch (e) { console.error('문법 오류 — 빌드 중단:\n' + (e.stack || e.message).split('\n').slice(0, 5).join('\n')); process.exit(1); }
const frag = '<title>' + TITLE + '</title>\n<style>\n' + css + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n';
const full = '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n<meta name="theme-color" content="#0b0914">\n' +
  '<title>' + TITLE + '</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n';
const outFull = outI >= 0 ? path.resolve(args[outI + 1]) : path.join(ROOT, 'dist', 'v3.html');
const outFrag = outI >= 0 ? path.resolve(args[outI + 2] || outFull.replace(/\.html$/, '-artifact.html')) : path.join(ROOT, 'dist', 'v3-artifact.html');
fs.mkdirSync(path.dirname(outFull), { recursive: true });
fs.writeFileSync(outFull, full);
fs.writeFileSync(outFrag, frag);
if (outI < 0) {
  fs.writeFileSync(path.join(ROOT, '..', 'levelup.html'), full);
  fs.writeFileSync(path.join(ROOT, 'dist', 'levelup-artifact.html'), frag);
}
console.log(path.relative(process.cwd(), outFull), (full.length / 1024).toFixed(0) + 'KB');
