/* 빌드: overflow/src/ → ../overflow.html (단독 실행용) + overflow/dist/overflow-artifact.html (아티팩트용) */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const repo = path.join(root, '..');
const src = path.join(root, 'src');
const read = (p) => fs.readFileSync(path.join(src, p), 'utf8');

const JS_ORDER = ['num.js', 'data.js', 'engine.js', 'story.js', 'sprites.js', 'audio.js', 'ui.js', 'main.js'];
const TITLE = '무한 렙업: OVERFLOW';
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=IBM+Plex+Sans+KR:wght@400;500;700&family=Silkscreen&display=swap" rel="stylesheet">';

const css = read('style.css');
const body = read('body.html');
const js = JS_ORDER.map((f) => '/* ── ' + f + ' ── */\n' + read('js/' + f)).join('\n');
if (js.includes('</script')) throw new Error('JS must not contain </script');

const standalone = '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no">\n' +
  '<meta name="theme-color" content="#16122a">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="무한 렙업">\n<meta name="format-detection" content="telephone=no">\n<meta name="description" content="캡이 NULL인 소년의 끝없는 레벨업 — 모바일 방치형 클리커 RPG">\n' +
  '<title>' + TITLE + '</title>\n' + FONTS + '\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n';

// 아티팩트: 뼈대(doctype/head/body)는 게시 시 자동으로 감싸지고 :root가 안전 영역만큼 패딩된다
const artifact = '<title>' + TITLE + '</title>\n' + FONTS + '\n<style>\n' + css +
  '\n:root { --hud-sat: 0px; --tabs-sab: 0px; }\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n';

fs.writeFileSync(path.join(repo, 'overflow.html'), standalone);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'overflow-artifact.html'), artifact);
console.log('built overflow.html (' + (standalone.length / 1024).toFixed(1) + ' KB), overflow/dist/overflow-artifact.html (' + (artifact.length / 1024).toFixed(1) + ' KB)');
