#!/usr/bin/env node
/* 한 파일짜리 게임을 만든다.
   (옛 판 · 클리커) 새 판은 levelup/v3/tools/build.js 가 levelup.html을 만든다.
   - levelup/dist/levelup-v2.html: 옛 판 완성본
   - levelup/dist/levelup-v2-artifact.html: 옛 판 아티팩트 조각 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const JS_ORDER = ['util', 'data', 'engine', 'tiles', 'sprites', 'portraits', 'chars', 'field', 'ui', 'script', 'battle', 'audio', 'music'];
const TITLE = '무한렙업 대모험';

function read(p) { return fs.readFileSync(p, 'utf8'); }
function fonts() {
  const dir = path.join(ROOT, 'assets', 'fonts');
  const faces = [['galmuri11.woff2', 'Galmuri11', 'normal'], ['galmuri11b.woff2', 'Galmuri11 Bold', 'normal'], ['galmuri14.woff2', 'Galmuri14', 'normal']];
  return faces.filter(([f]) => fs.existsSync(path.join(dir, f))).map(([f, fam, w]) =>
    "@font-face{font-family:'" + fam + "';src:url(data:font/woff2;base64," + fs.readFileSync(path.join(dir, f)).toString('base64') + ") format('woff2');font-weight:" + w + ';font-display:block}').join('\n');
}
function scripts() {
  const parts = JS_ORDER.map((n) => ['js/' + n + '.js', read(path.join(SRC, 'js', n + '.js'))]);
  const wdir = path.join(SRC, 'js', 'world');
  for (const f of fs.readdirSync(wdir).filter((f) => f.endsWith('.js')).sort()) parts.push(['js/world/' + f, read(path.join(wdir, f))]);
  parts.push(['js/main.js', read(path.join(SRC, 'js', 'main.js'))]);
  const boot = "(function(){var h=window.claude&&window.claude.hot;var start=function(d){G.main.boot(d||{});};if(h&&h.ready)h.ready(start);else start(h&&h.data||{});})();";
  return parts.map(([n, s]) => '/* ' + n + ' */\n' + s).join('\n') + '\n' + boot;
}
function build() {
  const css = fonts() + '\n' + read(path.join(SRC, 'style.css'));
  const body = read(path.join(SRC, 'body.html'));
  const js = scripts();
  if (js.indexOf('</script') >= 0) throw new Error('스크립트 안에 </script 가 있다');
  const frag = '<title>' + TITLE + '</title>\n<style>\n' + css + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n';
  const full = '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n<meta name="theme-color" content="#120e1e">\n' +
    '<title>' + TITLE + '</title>\n<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box}\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n';
  const dist = path.join(ROOT, 'dist');
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, 'levelup-v2-artifact.html'), frag);
  fs.writeFileSync(path.join(dist, 'levelup-v2.html'), full);
  console.log('levelup-v2.html', (full.length / 1024).toFixed(0) + 'KB · artifact', (frag.length / 1024).toFixed(0) + 'KB');
}
build();
