/* 픽셀 아트: 인물 초상화(16×16, 자동 외곽선) + 절차적 몬스터 */
(function () {
  'use strict';
  const OF = (globalThis.OF = globalThis.OF || {});

  const BASE = {
    k: '#1a1426', s: '#ffd6b0', S: '#e8a98a', e: '#1b1530', w: '#ffffff', c: '#ff9aa8', m: '#c0485a',
  };
  const OUTLINE = '#120d1c';

  function pad16(r) { r = r || ''; return (r + '................').slice(0, 16); }
  function mirror(rows, map) {
    return rows.map((r) => {
      const left = (r + '........').slice(0, 8);
      const right = left.split('').reverse().map((ch) => (map && map[ch]) || ch).join('');
      return left + right;
    });
  }
  function P(pal, rows, opt) {
    opt = opt || {};
    let grid = opt.full ? rows.map(pad16) : mirror(rows, opt.map);
    while (grid.length < 16) grid.push('................');
    grid = grid.map((r) => r.split(''));
    if (opt.extra) for (const [x, y, ch] of opt.extra) if (grid[y]) grid[y][x] = ch;
    return { pal: Object.assign({}, BASE, pal), grid: grid.map((r) => r.join('')) };
  }

  const PORTRAITS = {
    zero: P({ h: '#262040', H: '#3d3470', f: '#f2f0ff', F: '#c9c6ea', t: '#3b6cf0', T: '#2748a8', o: '#ffd23f' }, [
      '....h...', '...hhh.h', '..hhhhhh', '.hhhHhhh', '.hhhhhhh', '.hhsshhs', '.hssssss', '.hsewsss',
      '.hseesss', '..csssss', '..sssssm', '...sssss', '..ffffff', '.fFfffff', 'tttttttto'.slice(0, 8), 'TTTTTTTT']),
    button: P({ r: '#ff3b4f', R: '#b81d33', l: '#ff9aa4', g: '#a09dba', G: '#5f5c7a' }, [
      '........', '........', '.....rrr', '...rrrrr', '..rlrrrr', '.rllrrrr', '.rreerrr', '.rrrwerr',
      '.rrreerr', '.Rrrrrrr', '.RRrrrmm', '..RRRRRR', '.ggggggg', 'gGGGGGGG', 'gGGGGGGG', '.ggggggg']),
    elder: P({ b: '#f4f4f4', B: '#cfcfe0', o: '#8a5a3a', O: '#5e3b24', y: '#ffd23f' }, [
      '........', '.....SSS', '...sssss', '..ssssss', '.bssssss', '.bbsssss', '.bbseess', '.bssssss',
      '.bbbssss', '..bbbbbb', '..bbbbbb', '...bbbbb', '.ooobbbb', 'oooooobB', 'oooooooy', 'OOOOOOOy']),
    dot: P({ p: '#ff8ccf', P: '#d9559f', y: '#ffe066' }, [
      '........', '........', '........', '.....y..', '.....yyy', '...ppppp', '...ppppp', '...pewpp',
      '...peepp', '...pcppp', '...ppppm', '...ppppp', '...PPPPP', '....P...', '....P...', '........']),
    brick: P({ r: '#c8553d', R: '#7f2f1f', k: '#22151a', y: '#ffd23f', g: '#8e9aa8', G: '#5d6875' }, [
      '........', '...rrRrr', '..rRrrrR', '.RrrrRrr', '.rrRrrrR', '.RrrrRrr', '.kkkkkkk', '.kkykkkk',
      '.kkkkkkk', '.rrRrrrR', '.RrrrRrr', '..rrRrrr', '.ggggggg', 'gGgggggR', 'gGggggRR', 'gGgggggg']),
    manager: P({ h: '#6b4a32', H: '#8c6645', a: '#3fae5a', A: '#2b7d40', n: '#ffffff', u: '#b9a3c9' }, [
      '........', '...h.hhh', '..hhhhhh', '.hhHhhhh', '.hhhhhhh', '.hhsssss', '.hssssss', '.hseesss',
      '.hsuusss', '..ssssss', '..ssssmm', '...sssss', '..wwaaaa', '.wwaaaaa', 'wwaaaaan', 'wwAAAAAA']),
    gapjil: P({ h: '#3a2a2a', H: '#5a4040', g: '#111118', G: '#55607a', r: '#d64545', R: '#a02f2f', t: '#ffffff' }, [
      '..hh.hh.', '.hhhhhhh', 'hhHhhhHh', 'hhhhhhhh', 'hhssssss', 'hsssssss', '.hgggggg', '.hgGgggg',
      '.hssssss', '..sssmmm', '..ssmmtt', '...ssmmm', '..rrrrrr', '.rrrrrrr', 'rrRrrrrr', 'rrRrrrrr']),
    moru: P({ h: '#c9c9d6', H: '#9d9db0', g: '#6fd3ff', G: '#3a3a4a', l: '#8b5a2b', L: '#6a4020' }, [
      '.....hhh', '....hhhh', '...hhhhh', '..hhhhhh', '.hhGggGG', '.hssssss', '.hssssss', '.hseesss',
      '.hcsssss', '..ssmmmm', '..smwwww', '...sssss', '..llllll', '.lllllll', 'sllllLll', 'slllllll']),
    hammer: P({ g: '#8fa3b8', G: '#5f7389', t: '#ffffff' }, [
      '........', '........', '........', 'gggggggg', 'ewgggggg', 'gggggggg', 'GGGggggg', '...ggggg',
      '...ggggg', '...gtttt', '...gGGGG', '...ggwww', '..gggwww', '.ggggwww', '.G..gwww', '....gwww']),
    volcano: P({ n: '#6d6875', N: '#45404d', f: '#ff7a1a', F: '#ffd23f', r: '#ff3b30' }, [
      '......NN', '......nn', '...nnnnn', '..nnnnnn', '.nnnnnnn', '.nFFnnnn', '.nnFnnnn', '.nnnnnnn',
      '.NNNNNNN', '.NNrrrrr', '.NrfFFff', '.NrffFFf', '.NNrrrrr', '.NNNNNNN', '.n.nn.nn', '.NN..NNN']),
    excel: P({ g: '#62c46b', G: '#3e8a45', v: '#2fbf71', V: '#1d7a47', o: '#ffd23f', t: '#2b2b3a' }, [
      '........', '...vvvvv', '..vvvvvv', '.VVVVVVV', '...ggggg', 'g..ggggg', 'gg.ggggg', 'ggggewgg',
      '.gggeegg', '..gggggg', '..gggwmm', '...ggggg', '..wwwwwt', '.wwwwwwt', 'wwwwwwwt', 'wwwwwwwt'],
      { extra: [[9, 6, 'o'], [10, 6, 'o'], [11, 6, 'o'], [12, 7, 'o'], [12, 8, 'o'], [9, 9, 'o'], [10, 9, 'o'], [11, 9, 'o'], [12, 10, 'o']] }),
    coral: P({ h: '#ff7f9f', H: '#e0507a', t: '#2ec4b6', T: '#1b8a80', y: '#ffe3a3' }, [
      '....hhhh', '..hhhhhh', '.hhHhhhh', '.hhhhhhh', 'hhhsssss', 'hhssssss', 'hhsewsss', 'hhseesss',
      'hhcsssss', 'hhhssssm', 'hhh.ssss', 'hhh..sss', 'hhh.tttt', 'hhhttttt', '.hhttTtt', '..hTTTTT'],
      { extra: [[11, 1, 'y'], [12, 1, 'y'], [11, 2, 'y'], [12, 2, 'y'], [13, 2, 'y']] }),
    underflow: P({ k: '#1d1b26', K: '#3a3650', b: '#2b2b2b', c: '#1f4e8c', C: '#163a6a', y: '#ffd23f' }, [
      '........', 'kk...kkk', 'kkkkkkkk', '.kkkkkkw', '..yyyyyy', '..ssssss', '..seesss', '..ssssss',
      '..bsssss', '.bbbbbbb', '.bbbbmmb', '..bbbbbb', '..cccccc', '.ccycccc', 'cccccccc', 'CCCCCCCC'],
      { extra: [[9, 5, 'k'], [10, 6, 'k'], [11, 6, 'k'], [10, 7, 'k'], [11, 7, 'k'], [12, 5, 'k'], [13, 4, 'k']] }),
    lucky: P({ w: '#f5f5f5', W: '#d0d0dc', p: '#ff9ac1', b: '#e03131', k: '#26262e' }, [
      '...ww...', '...wp...', '...wp...', '...ww...', '..wwwwww', '.wwwwwww', '.wwewwww', '.wwewwww',
      '.wcwwwww', '.wwwwwwp', '..wwwwwm', '...wwwww', '..kkkkbb', '.kkkkkbw', 'kkkkkkkk', 'kkkkkkkk']),
    tangent: P({ v: '#3b3355', V: '#6a5f94', w: '#f4f1ff', y: '#c8b6ff' }, [
      '....vvvvvvvvvvvv', '..vvvvvvvvvvvvvv', '.vvvVvvvvvvvvvvv', '.vvvwwwwwwwwwvvv', 'vvvwssssssssswvv',
      'vvvwssssssssswvv', 'vvvwsewssewsswvv', 'vvvwseesseesswvv', 'vvvwcssssscsswvv', 'vvvwsssmmssswvv',
      '.vvvwwsssssswwvv', '..vvvwwwwwwwwvvv', '..vvvvvvvvvvvvvv', '.vvvvvvwwvvvvvvv', '.vvvvvvyyvvvvvvv', '.vvvvvvvvvvvvvvv'],
      { full: true }),
    pi: P({ w: '#fbf8ef', y: '#e3b341', g: '#caa24a' }, [
      '......ww', '.....www', '....wyyy', '....wwyw', '....wwyw', '...yyyyy', '...sssss', '..sgggss',
      '..sgegss', '..sgggss', '..ssssss', '...sssmm', '..wwwwww', '.wwwyyww', 'wwwwyyww', 'wwwwyyww']),
    half: P({ b: '#4dabf7', B: '#1c7ed6', o: '#ffa94d', O: '#e8590c' }, [
      '........', '...bbbbb', '..bbbbbb', '.bbbbbbb', '.bbsssss', '.bssssss', '.bsewsss', '.bseesss',
      '.bcsssss', '..sssssm', '..ssssss', '...sssss', '..BBBBBB', '.BBBBBBB', 'BBBBBBBB', 'BBBBBBBB'],
      { map: { b: 'o', B: 'O' } }),
    div: P({ w: '#fdfdfd', r: '#ff4757', p: '#8e44ad', n: '#ff2436', y: '#ffd23f', k: '#1d1b26' }, [
      'r.r.....', 'rrr.....', '.rrrwwww', 'rrrwwwwk', 'rrwwwkkk', '.rwwwwwk', '.rwkewww', '.rwwkwww',
      '..wwwwwn', '..wwwwww', '..wrwwww', '...rrrrr', '..yyyyyy', '.yyyyyyy', 'kkkkkkkk', 'kkkkkkkk'],
      { map: { r: 'p' } }),
    loop: P({ g: '#2f8a5a', G: '#1d5c3b', k: '#0d1a14', y: '#9dffb0' }, [
      '......gg', '....gggg', '...ggggg', '..gggggg', '..ggkkkk', '.ggkkkkk', '.ggkwwwk', '.ggkwewk',
      '.ggkwwwk', '.ggkkkkk', '.gggkkkk', '.Ggggkkk', 'GGgggggg', 'GGgggyyg', 'GGggyggy', 'GGGggggg']),
    nan: P({ h: '#ff5ee8', H: '#b83aa8', s: '#f0e6ff', q: '#7a7a8a', c: '#5ef0ff' }, [
      '....hhhhhhh.....', '...hhhhhhhhhh...', '..hhhHhhhhhhhh..', '..hhhhhhhhhhhhh.', '.hhhhhhhsssshhh.',
      '.hhhhhhssssssshh', '.hhhhhhssssewssh', '.hhhhhhsssseessh', '.hhhhhssssssscsh', '.hhhqhssssmsssh.',
      '.hhhhhhssssssh..', '..hhchhhsssshc..', '..hhhqqqqqqhh...', '.c.qqqqqqqqqq.q.', '..qqqqqqqqqqqq..', '.q.qqqq.qqqqq.c.'],
      { full: true }),
    max: P({ h: '#e8eef7', H: '#b9c6d8', y: '#ffd23f', Y: '#c9a227', a: '#3b5bdb', A: '#2b3f99', r: '#e03131' }, [
      '..y..y.y', '..yyyyyy', '..YyYyYy', '.hhhhhhh', 'hhhhhhhh', 'hhhsshhs', '.hssssss', '.hseesss',
      '.hsewsss', '..ssssss', '..sssssm', '...sssss', 'r.aaaaaa', 'rraAaaaa', 'rraaaaaa', 'rrAAAAAA'],
      { extra: [[11, 6, 'm'], [11, 7, 'm'], [12, 8, 'm']] }),
    gc: P({ g: '#8e9aaf', G: '#5b6578', k: '#0a0a12', w: '#f4f4ff' }, [
      '......gg', '....gggg', '...ggggg', '..gggggg', '..ggkkkk', '.ggkkkkk', '.ggkkwkk', '.ggkkkkk',
      '.ggkkkkk', '.gggkkkk', '.Gggggkk', 'GGgggggg', 'GGgggggg', 'GGGggggg', 'GGGGgggg', 'GGGGGggg']),
    overflow: P({ k: '#0b0612', K: '#2a0f3e', r: '#ff3b5c', R: '#ffc2cd', y: '#ffd23f' }, [
      '...KKKKK', '..KKkkkk', '.KKkkkkk', '.Kkkkkkk', 'KkkrrrKk', 'KkkrRrkk', 'Kkkrrrkk', 'Kkkkkkkk',
      'Kkkkkkkk', 'Kkkrkrkr', 'Kkkkrkrk', '.Kkkkkkk', '.KKkkkkk', '..KKkkkk', '...KKKKK', '........'],
      { extra: [[0, 0, 'y'], [15, 1, 'y'], [1, 14, 'y'], [14, 13, 'y'], [2, 15, 'r'], [13, 15, 'y']] }),
    malang: P({ g: '#6fdc8c', G: '#3fae5a', l: '#c4f7d1', y: '#ffd23f', r: '#ff6b6b' }, [
      '........', '.....y.y', '.....yyy', '.....yyr', '....gggg', '...ggggg', '..glgggg', '.gllgggg',
      '.ggewggg', 'gggeeggg', 'gggggggg', 'ggggggmm', 'gggggggg', 'Ggggggggg'.slice(0, 8), 'GGGGGGGG', '.GGGGGGG']),
  };

  /* ───────── 렌더링 ───────── */
  const cache = new Map();
  function makeCanvas(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }
  /** sprite → 캔버스 (외곽선 포함, 크기: (16+2)*scale) */
  function render(sprite, scale, opt) {
    opt = opt || {};
    const key = (opt.key || '') + '|' + scale + '|' + (opt.tint || '') + '|' + (opt.outline === false ? 0 : 1);
    if (opt.key && cache.has(key)) return cache.get(key);
    const g = sprite.grid, H = g.length, W = g[0].length;
    const cv = makeCanvas((W + 2) * scale, (H + 2) * scale);
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const filled = (x, y) => y >= 0 && y < H && x >= 0 && x < W && g[y][x] !== '.';
    if (opt.outline !== false) {
      ctx.fillStyle = opt.outlineColor || OUTLINE;
      for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) {
        if (filled(x, y)) continue;
        if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) ctx.fillRect((x + 1) * scale, (y + 1) * scale, scale, scale);
      }
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = g[y][x];
      if (ch === '.') continue;
      ctx.fillStyle = opt.tint || sprite.pal[ch] || '#ff00ff';
      ctx.fillRect((x + 1) * scale, (y + 1) * scale, scale, scale);
    }
    if (opt.key) cache.set(key, cv);
    return cv;
  }
  function portrait(id, scale, opt) {
    const sp = PORTRAITS[id];
    if (!sp) return null;
    return render(sp, scale, Object.assign({ key: 'p_' + id }, opt || {}));
  }
  /** DOM용 data URL (캐시) */
  const urlCache = new Map();
  function portraitURL(id, scale) {
    const k = id + '@' + scale;
    if (urlCache.has(k)) return urlCache.get(k);
    const sp = PORTRAITS[id];
    if (!sp || typeof document === 'undefined') return '';
    const g = sp.grid;
    const c = document.createElement('canvas');
    c.width = (g[0].length + 2) * scale; c.height = (g.length + 2) * scale;
    const src = render(sp, scale, { key: 'u_' + id });
    c.getContext('2d').drawImage(src, 0, 0);
    const url = c.toDataURL();
    urlCache.set(k, url);
    return url;
  }

  /* ───────── 절차적 몬스터 ───────── */
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f)));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  /** 절차적 몬스터. arch: 0 덩어리 · 1 귀 · 2 버섯 · 3 인간형 · 4 짐승 */
  function monster(seed, main, sub, kind, arch) {
    const rnd = OF.num.rng(seed * 7919 + 17);
    const W = kind >= 1 ? 16 : 14, H = kind >= 1 ? 16 : 14;
    const half = W / 2;
    const g = [];
    for (let y = 0; y < H; y++) g.push(new Array(half).fill('.'));
    const put = (x, y, c) => { if (y >= 0 && y < H && x >= 0 && x < half) g[y][x] = c; };
    const body = (x, y) => (rnd() < 0.86 ? 'a' : 'b');
    const ell = (cx, cy, rx, ry, fn) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < half; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d < 1) put(x, y, fn ? fn(x, y, d) : body(x, y));
      }
    };
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c || body(x, y)); };
    let ey, ex, my;
    arch = arch || 0;
    if (arch === 1) { // 귀 달린 짐승
      ell(half, H * 0.62, half * 0.85, H * 0.36);
      const ex0 = Math.max(1, Math.floor(half * 0.35 + rnd() * 2));
      rect(ex0, 1, ex0 + 1, Math.floor(H * 0.35), 'a'); put(ex0 + 1, 2, 'b'); put(ex0 + 1, 3, 'b');
      ey = Math.floor(H * 0.52); ex = half - 3; my = ey + 3;
    } else if (arch === 2) { // 버섯
      ell(half, H * 0.36, half * 0.98, H * 0.3, (x, y) => (rnd() < 0.18 ? 'w' : 'b'));
      rect(half - 3, Math.floor(H * 0.55), half - 1, H - 2, 's');
      ey = Math.floor(H * 0.62); ex = half - 2; my = ey + 2;
    } else if (arch === 3) { // 인간형
      ell(half, H * 0.26, half * 0.6, H * 0.22);
      rect(half - 3, Math.floor(H * 0.46), half - 1, Math.floor(H * 0.8));
      rect(half - 5, Math.floor(H * 0.5), half - 4, Math.floor(H * 0.7), 'b');
      rect(half - 3, Math.floor(H * 0.82), half - 2, H - 1, 'd');
      ey = Math.floor(H * 0.24); ex = half - 2; my = ey + 3;
    } else if (arch === 4) { // 네발 짐승
      ell(half, H * 0.55, half * 1.05, H * 0.28);
      rect(1, Math.floor(H * 0.75), 2, H - 1, 'd'); rect(half - 3, Math.floor(H * 0.75), half - 2, H - 1, 'd');
      ell(half, H * 0.32, half * 0.45, H * 0.2);
      ey = Math.floor(H * 0.3); ex = half - 2; my = ey + 3;
    } else { // 덩어리
      const rx = half * (0.8 + rnd() * 0.2), ry = H / 2 * (0.72 + rnd() * 0.25);
      ell(half, H - ry - 0.5, rx, ry, (x, y, d) => (d > 0.75 && rnd() < 0.35 ? 'b' : body(x, y)));
      ey = Math.floor(H - ry * 1.15); ex = half - 3 + Math.floor(rnd() * 2); my = ey + 3;
    }
    // 무늬
    for (let i = 0; i < 4; i++) { const x = Math.floor(rnd() * half), y = Math.floor(rnd() * H); if (g[y][x] === 'a') g[y][x] = 'b'; }
    // 눈 · 입
    put(ex, ey, 'w'); put(ex, ey + 1, 'e'); put(ex - 1, ey, 'a'); put(ex - 1, ey + 1, 'a');
    if (rnd() < 0.5) put(ex - 1, ey - 1, 'd');
    for (let x = half - 1 - Math.floor(rnd() * 2); x < half; x++) put(x, Math.min(H - 2, my), 'm');
    if (kind >= 1) { put(Math.max(0, ex - 2), 0, 'h'); put(Math.max(0, ex - 2), 1, 'h'); put(Math.max(0, ex - 1), 1, 'h'); put(Math.max(0, ex - 1), 2, 'h'); }
    const grid = g.map((r) => r.join('')).map((r) => r + r.split('').reverse().join(''));
    const pal = { a: main, b: sub, d: shade(main, 0.65), s: '#f3e3c8', w: '#ffffff', e: '#1b1530', m: '#1b1530', h: '#ffd23f' };
    return { pal, grid };
  }
  function monsterCanvas(seed, main, sub, kind, scale, arch) {
    const key = 'm_' + seed + '_' + main + '_' + kind + '_' + (arch || 0);
    const k2 = key + '|' + scale + '||1';
    if (cache.has(k2)) return cache.get(k2);
    return render(monster(seed, main, sub, kind, arch), scale, { key });
  }

  OF.sprites = { PORTRAITS, render, portrait, portraitURL, monster, monsterCanvas, shade };
})();
