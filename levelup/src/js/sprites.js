/* 캐릭터 스프라이트(16×16, 4방향 걷기) · 특수 생물 · 전투 몬스터(32×32 절차 생성) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const OUT = '#16101f';

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  /** 문자 격자 → 외곽선 포함 캔버스 */
  function renderGrid(grid, colors, opt) {
    opt = opt || {};
    const H = grid.length, W = grid[0].length;
    const pad = opt.outline === false ? 0 : 1;
    const c = canvas(W + pad * 2, H + pad * 2);
    const g = c.getContext('2d');
    const filled = (x, y) => y >= 0 && y < H && x >= 0 && x < W && grid[y][x] !== '.' && grid[y][x] !== ' ';
    if (pad) {
      g.fillStyle = opt.outlineColor || OUT;
      for (let y = -1; y <= H; y++) for (let x = -1; x <= W; x++) {
        if (filled(x, y)) continue;
        if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) g.fillRect(x + pad, y + pad, 1, 1);
      }
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = grid[y][x];
      if (ch === '.' || ch === ' ') continue;
      g.fillStyle = colors[ch] || '#ff00ff';
      g.fillRect(x + pad, y + pad, 1, 1);
    }
    return c;
  }
  function mirrorH(src) { const c = canvas(src.width, src.height); const g = c.getContext('2d'); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }

  /* ───────── 사람 ───────── */
  const BODY = {
    down: [
      ['................', '................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSESSSSESS...', '...SSESSSSESS...',
        '...SSSSSSSSSS...', '....SSSSSSSS....', '.....CCCCCC.....', '....CCCCCCCC....', '...SCCcCCcCCS...', '....PPPPPPPP....', '....PP....PP....', '....FF....FF....'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSESSSSESS...', '...SSESSSSESS...', '...SSSSSSSSSS...',
        '....SSSSSSSS....', '.....CCCCCC.....', '...SCCCCCCCC....', '....CCcCCcCCS...', '....PPPPPPPP....', '....PP....PP....', '....FF.....P....', '...........F....'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSESSSSESS...', '...SSESSSSESS...', '...SSSSSSSSSS...',
        '....SSSSSSSS....', '.....CCCCCC.....', '....CCCCCCCCS...', '...SCCcCCcCC....', '....PPPPPPPP....', '....PP....PP....', '....P.....FF....', '....F...........'],
    ],
    up: [
      ['................', '................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...',
        '...SSSSSSSSSS...', '....SSSSSSSS....', '.....CCCCCC.....', '....CCCCCCCC....', '...SCCCCCCCCS...', '....PPPPPPPP....', '....PP....PP....', '....FF....FF....'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...',
        '....SSSSSSSS....', '.....CCCCCC.....', '...SCCCCCCCC....', '....CCCCCCCCS...', '....PPPPPPPP....', '....PP....PP....', '....FF.....P....', '...........F....'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...', '...SSSSSSSSSS...',
        '....SSSSSSSS....', '.....CCCCCC.....', '....CCCCCCCCS...', '...SCCCCCCCC....', '....PPPPPPPP....', '....PP....PP....', '....P.....FF....', '....F...........'],
    ],
    left: [
      ['................', '................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSS....', '...SSSSSSSSS....', '...SESSSSSSS....', '...SESSSSSSS....',
        '...SSSSSSSSS....', '....SSSSSSS.....', '.....CCCCC......', '.....CCCCC......', '.....CSCcC......', '.....PPPPP......', '.....PP.PP......', '.....FF.FF......'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSS....', '...SSSSSSSSS....', '...SESSSSSSS....', '...SESSSSSSS....', '...SSSSSSSSS....',
        '....SSSSSSS.....', '.....CCCCC......', '....SCCCCC......', '.....CCcCC......', '.....PPPPP......', '....PP...PP.....', '....FF....FF....', '................'],
      ['................', '.....SSSSSS.....', '....SSSSSSSS....', '...SSSSSSSSS....', '...SSSSSSSSS....', '...SESSSSSSS....', '...SESSSSSSS....', '...SSSSSSSSS....',
        '....SSSSSSS.....', '.....CCCCC......', '.....CCCCCS.....', '.....CcCCC......', '.....PPPPP......', '......PPP.......', '......FFF.......', '................'],
    ],
  };
  // 머리 모양: 방향별로 0~11행 덧칠 (H 머리, h 머리 명암, A 장신구, a 장신구 명암, x 지우기)
  const HAIR = {
    short: {
      down: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHhHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...'],
      up: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHhHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHH....', '...HHHhHHHHH....', '....H..HHHHH....', '.......HHHHH....', '........HHHH....', '.........HH.....'],
    },
    spiky: {
      down: ['...H..H..H..H...', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHhHHHHhHHH..', '...HHHHHHHHHH...', '...HHH.HH.HHH...', '...H........H...'],
      up: ['...H..H..H..H...', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHhHHHHHH..', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['....H..H..H.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHhHHHHHHH...', '...HHHHHHHHHH...', '....HH.HHHHHH...', '.......HHHHH....', '........HHHH....', '.........HH.....'],
    },
    long: {
      down: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHhHHHHHH...', '...HHHHHHHHHH...', '..HHH......HHH..', '..HH........HH..', '..HH........HH..', '..HH........HH..', '..HHH......HHH..', '..HH........HH..', '...H........H...'],
      up: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHhHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHhHHHHHH...', '....H..HHHHHH...', '.......HHHHHH...', '.......HHHHHH...', '........HHHHH...', '........HHHHH...', '.........HHHH...', '..........HH....'],
    },
    bun: {
      down: ['......HHHH......', '.....HHhHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '................'],
      up: ['......HHHH......', '.....HHHhHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['.........HHH....', '........HHhHH...', '....HHHHHHHH....', '...HHHHHHHHH....', '...HHHHHHHHH....', '....H..HHHHH....', '........HHHH....', '................'],
    },
    pony: {
      down: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHhHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...'],
      up: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHAAHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....', '......HHHH......', '......HHHH......', '.......HH.......'],
      left: ['................', '.....HHHHHH.....', '....HHHHHHHH....', '...HHHHHHHHHA...', '...HHHhHHHHHHH..', '....H..HHHHHHH..', '.......HHHHH.HH.', '........HHHH.HH.', '.........HH...H.'],
    },
    cap: {
      down: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAaAAAAAA...', '..AAAAAAAAAAAA..', '...HH......HH...', '................'],
      up: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAaAAAAA....', 'AAAAAAAAAAAA....', '....H..HHHHH....', '........HHHH....'],
    },
    hood: {
      down: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '..AAAaAAAAAAAA..', '..AAAHHHHHHAAA..', '..AAH......HAA..', '..AA........AA..', '..AA........AA..', '..AA........AA..', '...AA......AA...'],
      up: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '..AAAAAaAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '...AAAAAAAAAA...'],
      left: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '..AAaAAAAAAAA...', '..AHHHHAAAAAA...', '..AH...AAAAAA...', '..A.....AAAAA...', '..A.....AAAAA...', '...A....AAAA....', '....A..AAAA.....'],
    },
    witch: {
      down: ['.......AA.......', '......AAAA......', '.....AAaAAA.....', '....AAAAAAAA....', 'AAAAAAAAAAAAAAAA', '...HH......HH...', '..HH........HH..', '..HH........HH..', '..HH........HH..', '...H........H...'],
      up: ['.......AA.......', '......AAAA......', '.....AAAAAA.....', '....AAAAAAAA....', 'AAAAAAAAAAAAAAAA', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...'],
      left: ['........AA......', '.......AAAA.....', '......AAaAA.....', '....AAAAAAAA....', 'AAAAAAAAAAAAAA..', '....H..HHHHHH...', '.......HHHHHH...', '........HHHHH...', '........HHHHH...', '.........HHH....'],
    },
    helmet: {
      down: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAaAAAAAA...', '...AAAAAAAAAA...', '...AA......AA...', '...AA......AA...', '...AA......AA...', '....AAAAAAAA....'],
      up: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAAaAAAA...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '....AAAAAAAA....'],
      left: ['................', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAaAAAAA....', '...AAAAAAAAA....', '...A...AAAAA....', '...A...AAAAA....', '...A...AAAAA....', '....AAAAAAA.....'],
    },
    veil: {
      down: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '..AAHHHHHHHHAA..', '..AA........AA..', '..AA........AA..', '..AA........AA..', '..AA........AA..', '..AAA......AAA..', '..AAA......AAA..', '...AA......AA...'],
      up: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '..AAAAAAAAAAAA..', '...AAAAAAAAAA...'],
      left: ['.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '..AHHHAAAAAAA...', '..A....AAAAAA...', '..A....AAAAAA...', '.......AAAAAA...', '.......AAAAAA...', '......AAAAAAA...', '......AAAAAAA...', '.......AAAAA....'],
    },
    bald: {
      down: ['................', '................', '................', '......h.........'],
      up: ['................', '................', '................', '....h.......h...'],
      left: ['................', '................', '................', '.........h......'],
    },
    afro: {
      down: ['...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '.HHHHHhHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHH........HHH.', '..HH........HH..', '..H..........H..'],
      up: ['...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '.HHHHHHHHHHHHHH.', '.HHHHHHhHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '..HHHHHHHHHHHH..', '...HHHHHHHHHH...'],
      left: ['...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '.HHHHhHHHHHHHHH.', '.HHHHHHHHHHHHHH.', '..HHHHHHHHHHHHH.', '...H...HHHHHHHH.', '.......HHHHHHH..', '........HHHHH...'],
    },
    crown: {
      down: ['...A..A..A..A...', '...AAAAAAAAAA...', '...AaAAaAAaAA...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HH......HH...', '...H........H...'],
      up: ['...A..A..A..A...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '....HHHHHHHH....'],
      left: ['...A..A..A......', '...AAAAAAAAA....', '...AaAAaAAAA....', '...HHHHHHHHH....', '...HHHHHHHHH....', '....H..HHHHH....', '.......HHHHH....', '........HHHH....'],
    },
    robot: {
      down: ['.......A........', '.......A........', '.....AAAAAA.....', '....AAAAAAAA....', '...AaaaaaaaaA...', '...AEEEEEEEEA...', '...AaaaaaaaaA...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '....AAAAAAAA....'],
      up: ['.......A........', '.......A........', '.....AAAAAA.....', '....AAAAAAAA....', '...AAAAAAAAAA...', '...AAAAaAAAAA...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '...AAAAAAAAAA...', '....AAAAAAAA....'],
      left: ['........A.......', '........A.......', '.....AAAAAA.....', '....AAAAAAAA....', '...aaaaAAAAA....', '...EEEEAAAAA....', '...aaaaAAAAA....', '...AAAAAAAAA....', '...AAAAAAAAA....', '....AAAAAAA.....'],
    },
  };

  const cache = new Map();
  /** spec: {hair, hc, skin, top, bottom, shoe, acc, eye} → {down:[3], up:[3], left:[3], right:[3]} */
  function person(spec) {
    const key = JSON.stringify(spec);
    if (cache.has(key)) return cache.get(key);
    const colors = {
      S: spec.skin || '#ffd6b0', E: spec.eye || '#2a1a2a', C: spec.top || '#4a8ad8', c: U.shade(spec.top || '#4a8ad8', 0.78),
      P: spec.bottom || '#5a4a3a', F: spec.shoe || '#3a2a22', H: spec.hc || '#5a3a22', h: U.shade(spec.hc || '#5a3a22', 1.35),
      A: spec.acc || '#c8483a', a: U.shade(spec.acc || '#c8483a', 0.75),
    };
    const ALIAS = { bob: 'long', twin: 'pony', slick: 'short', messy: 'spiky', side: 'short', braid: 'long', topknot: 'bun', none: 'bald' };
    const hair = HAIR[spec.hair || 'short'] || HAIR[ALIAS[spec.hair]] || HAIR.short;
    const out = {};
    for (const dir of ['down', 'up', 'left']) {
      out[dir] = BODY[dir].map((rows, fi) => {
        const grid = rows.map((r) => r.split(''));
        const mask = hair[dir];
        const lift = fi === 0 ? 0 : 1; // 걷는 프레임은 머리가 한 칸 위
        for (let y = 0; y < mask.length; y++) {
          const yy = y - lift;
          if (yy < 0 || yy >= 16) continue;
          for (let x = 0; x < 16; x++) {
            const m = mask[y][x];
            if (m === '.' || m === undefined) continue;
            grid[yy][x] = m === 'x' ? '.' : m;
          }
        }
        return renderGrid(grid.map((r) => r.join('')), colors);
      });
    }
    out.right = out.left.map(mirrorH);
    cache.set(key, out);
    return out;
  }

  /* ───────── 특수 생물 (좌/우 2프레임) ───────── */
  const CREATURES = {
    squirrel: { c: { O: '#c8783a', o: '#a85a28', W: '#ffe8c8', E: '#1a1020', N: '#5a2a1a', T: '#e0955a' }, f: [
      ['................', '................', '................', '.........TT.....', '........TTTT....', '..OO....TTTTT...', '.OOOO...TTTTT...', '.OEOOO..TTTT....', 'NOOOOOO.TTT.....', '.OWWOOOOOTT.....', '..WWWOOOOO......', '...WWOOOOO......', '....OO..OO......', '................', '................', '................'],
      ['................', '................', '.........TT.....', '........TTTT....', '..OO....TTTTT...', '.OOOO...TTTTT...', '.OEOOO..TTTT....', 'NOOOOOO.TTT.....', '.OWWOOOOOTT.....', '..WWWOOOOO......', '...WWOOOOO......', '...OO....OO.....', '................', '................', '................', '................']] },
    cat: { c: { K: '#26222e', k: '#3e3848', E: '#ffe066', H: '#1a1620', h: '#8a2a3a', W: '#ffffff' }, f: [
      ['................', '....HHHH........', '....HHHH........', '...HHHHHH.......', '..hhhhhhhh......', '..K.KK.K........', '..KKKKKK........', '..KEKKEK......K.', '..KKKKKK.....K..', '...KKKK.....K...', '...KKKKKKKKKK...', '...KKKKKKKKKK...', '...KkKKKKKKkK...', '...K.K....K.K...', '................', '................'],
      ['................', '....HHHH........', '....HHHH........', '...HHHHHH.......', '..hhhhhhhh......', '..K.KK.K........', '..KKKKKK........', '..KEKKEK.......K', '..KKKKKK......K.', '...KKKK......K..', '...KKKKKKKKKKK..', '...KKKKKKKKKK...', '...KkKKKKKKkK...', '....K.K..K.K....', '................', '................']] },
    octopus: { c: { P: '#a05ad8', p: '#7a3ab0', E: '#1a1020', G: '#e8e8f0', W: '#ffffff' }, f: [
      ['................', '.....PPPPPP.....', '....PPPPPPPP....', '...PPPPPPPPPP...', '...PGGGPPGGGP...', '...PGEGPPGEGP...', '...PGGGPPGGGP...', '...PPPPPPPPPP...', '....PPPPPPPP....', '...PPPPPPPPPP...', '..PP.PP..PP.PP..', '..P..P....P..P..', '.PP..PP..PP..PP.', '................', '................', '................'],
      ['................', '.....PPPPPP.....', '....PPPPPPPP....', '...PPPPPPPPPP...', '...PGGGPPGGGP...', '...PGEGPPGEGP...', '...PGGGPPGGGP...', '...PPPPPPPPPP...', '....PPPPPPPP....', '...PPPPPPPPPP...', '..PP.PP..PP.PP..', '...P..P..P..P...', '..PP.PP..PP.PP..', '................', '................', '................']] },
    ghost: { c: { W: '#eef0ff', w: '#c8ccec', E: '#2a2a4a' }, f: [
      ['................', '.....WWWWWW.....', '....WWWWWWWW....', '...WWWWWWWWWW...', '...WWEWWWWEWW...', '...WWEWWWWEWW...', '...WWWWWWWWWW...', '...WWWWwwWWWW...', '...WWWWWWWWWW...', '...WWWWWWWWWW...', '...WWWWWWWWWW...', '...WW.WWW.WWW...', '...W...W...W....', '................', '................', '................'],
      ['................', '................', '.....WWWWWW.....', '....WWWWWWWW....', '...WWWWWWWWWW...', '...WWEWWWWEWW...', '...WWEWWWWEWW...', '...WWWWWWWWWW...', '...WWWWwwWWWW...', '...WWWWWWWWWW...', '...WWWWWWWWWW...', '...WWW.WWW.WW...', '....W...W...W...', '................', '................', '................']] },
    whale: { c: { B: '#8ac8ff', b: '#5a9ad8', W: '#ffffff', E: '#1a2a4a' }, f: [
      ['................', '................', '................', '.....BBBBBB.....', '...BBBBBBBBBB...', '..BBBBBBBBBBBB.B', '.BBEBBBBBBBBBBBB', '.BBBBBBBBBBBBBB.', '.WWWWWWWWWWWBB..', '..WWWWWWWWWBB...', '...WWWWWWWB.....', '................', '................', '................', '................', '................'],
      ['................', '................', '................', '.....BBBBBB.....', '...BBBBBBBBBB..B', '..BBBBBBBBBBBBBB', '.BBEBBBBBBBBBBB.', '.BBBBBBBBBBBBBB.', '.WWWWWWWWWWWBB..', '..WWWWWWWWWBB...', '...WWWWWWWB.....', '................', '................', '................', '................', '................']] },
    slime: { c: { M: '#58c85a', m: '#3a9a3e', W: '#ffffff', E: '#1a1020' }, f: [
      ['................', '................', '................', '................', '................', '......MMMM......', '....MMMMMMMM....', '...MMWMMMMMMM...', '..MMWMMMMMMMMM..', '..MMMEMMMMEMMM..', '..MMMEMMMMEMMM..', '..MMMMMMMMMMMM..', '..mmmmmmmmmmmm..', '................', '................', '................'],
      ['................', '................', '................', '................', '................', '................', '.....MMMMMM.....', '...MMWMMMMMMM...', '..MMWMMMMMMMMM..', '.MMMMEMMMMEMMMM.', '.MMMMEMMMMEMMMM.', '.MMMMMMMMMMMMMM.', '.mmmmmmmmmmmmmm.', '................', '................', '................']] },
    beast: { c: { M: '#b0784a', m: '#8a5a32', E: '#1a1020', W: '#ffffff', T: '#f0e0c8' }, f: [
      ['................', '................', '................', '..M..M..........', '..MMMMM.........', '.MMEMMM.........', '.MMMMMMMMMMMM...', '.TTMMMMMMMMMMM..', '..MMMMMMMMMMMMM.', '...MMMMMMMMMM.M.', '...M.M....M.M...', '...m.m....m.m...', '................', '................', '................', '................'],
      ['................', '................', '..M..M..........', '..MMMMM.........', '.MMEMMM.........', '.MMMMMMMMMMMM...', '.TTMMMMMMMMMMM..', '..MMMMMMMMMMMMM.', '...MMMMMMMMMM..M', '...M..M..M..M...', '...m..m..m..m...', '................', '................', '................', '................', '................']] },
    bird: { c: { M: '#e8b84a', m: '#c8902a', E: '#1a1020', B: '#ff8a3a' }, f: [
      ['................', '................', '................', '.MM........MM...', '.MMM......MMM...', '..MMM.MM.MMM....', '...MMMMMMMM.....', '....MEMMEM......', '....MMBBMM......', '.....MMMM.......', '......mm........', '................', '................', '................', '................', '................'],
      ['................', '................', '................', '................', '................', '......MM........', '..MMMMMMMMMMM...', '.MMMMMEMMEMMMM..', '.....MMBBMM.....', '.....MMMMMM.....', '......mmmm......', '................', '................', '................', '................', '................']] },
    drone: { c: { M: '#9aa4ae', m: '#6a7480', E: '#ff5a5a', P: '#c8d0d8' }, f: [
      ['................', '................', '..PPPP....PPPP..', '.....M....M.....', '.....MMMMMM.....', '....MMMMMMMM....', '....MmEEEEmM....', '....MMMMMMMM....', '.....MMMMMM.....', '......m..m......', '................', '................', '................', '................', '................', '................'],
      ['................', '................', '.PPPP......PPPP.', '.....M....M.....', '.....MMMMMM.....', '....MMMMMMMM....', '....MmEEEEmM....', '....MMMMMMMM....', '.....MMMMMM.....', '......m..m......', '................', '................', '................', '................', '................', '................']] },
    chest: { c: { B: '#9a6a3a', b: '#6a4422', Y: '#ffd84a' }, f: [
      ['................', '................', '................', '................', '..bbbbbbbbbbbb..', '..bBBBBBBBBBBb..', '..bBBBBBBBBBBb..', '..bbbbbYYbbbbb..', '..bBBBBYYBBBBb..', '..bBBBBBBBBBBb..', '..bBBBBBBBBBBb..', '..bbbbbbbbbbbb..', '................', '................', '................', '................']] },
    chestOpen: { c: { B: '#9a6a3a', b: '#6a4422', K: '#2a1a12' }, f: [
      ['................', '................', '..bbbbbbbbbbbb..', '..bBBBBBBBBBBb..', '..bbbbbbbbbbbb..', '..bKKKKKKKKKKb..', '..bKKKKKKKKKKb..', '..bbbbbbbbbbbb..', '..bBBBBBBBBBBb..', '..bBBBBBBBBBBb..', '..bBBBBBBBBBBb..', '..bbbbbbbbbbbb..', '................', '................', '................', '................']] },
    sign: { c: { B: '#a8784a', b: '#6a4a2a', W: '#e8d0a0' }, f: [
      ['................', '................', '................', '..bbbbbbbbbbbb..', '..bWWWWWWWWWWb..', '..bWbbbbbbbbWb..', '..bWWWWWWWWWWb..', '..bWbbbbbbWWWb..', '..bWWWWWWWWWWb..', '..bbbbbbbbbbbb..', '.......BB.......', '.......BB.......', '.......BB.......', '......bbbb......', '................', '................']] },
    orb: { c: { O: '#ffffff', o: '#dddddd' }, f: [
      ['................', '................', '................', '................', '................', '......oooo......', '.....oOOOOo.....', '.....oOOOOo.....', '.....oOOOOo.....', '......oooo......', '................', '................', '................', '................', '................', '................']] },
    spot: { c: { A: '#ffe066', a: '#ffb84a' }, f: [
      ['................', '................', '................', '................', '................', '................', '................', '................', '.....a.aa.a.....', '...aa......aa...', '..a..........a..', '...aa......aa...', '.....a.aa.a.....', '................', '................', '................']] },
  };
  function creature(id, tint) {
    const key = 'cr_' + id + '_' + (tint || '');
    if (cache.has(key)) return cache.get(key);
    const d = CREATURES[id];
    const cols = Object.assign({}, d.c);
    if (tint) { const k0 = Object.keys(cols)[0]; cols[k0] = tint; if (cols[k0.toLowerCase()] !== undefined) cols[k0.toLowerCase()] = U.shade(tint, 0.72); }
    const left = d.f.map((f) => renderGrid(f, cols));
    const out = { left, right: left.map(mirrorH) };
    out.down = out.left; out.up = out.right;
    cache.set(key, out);
    return out;
  }

  /* ───────── 전투 몬스터 (32×32) ───────── */
  // arch: blob beast bird bug plant ghost golem humanoid fish dragon machine eye wisp
  function monster(seed, arch, main, sub, accent, boss) {
    const key = ['mon', seed, arch, main, sub, accent, boss ? 1 : 0].join('_');
    if (cache.has(key)) return cache.get(key);
    const r = U.rng(seed * 2654435761 + 11);
    const W = 32, H = 32, half = 16;
    const g = [];
    for (let y = 0; y < H; y++) g.push(new Array(half).fill('.'));
    const put = (x, y, c) => { if (y >= 0 && y < H && x >= 0 && x < half) g[y][x] = c; };
    const get = (x, y) => (y >= 0 && y < H && x >= 0 && x < half ? g[y][x] : '.');
    const ell = (cx, cy, rx, ry, fn) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < half; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        const d = dx * dx + dy * dy;
        if (d <= 1) put(x, y, typeof fn === 'function' ? fn(x, y, d) : fn || 'a');
      }
    };
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
    const shadeBody = (x, y, d) => (d > 0.72 ? 'b' : (y < 12 && d < 0.25 && r() < 0.5 ? 'l' : 'a'));
    let ey = 12, ex = 11, eyeSize = 2, mouth = 16;
    switch (arch) {
      case 'blob': { const ry = 9 + r() * 3; ell(16, 31 - ry, 14, ry, shadeBody); ey = Math.floor(31 - ry * 1.1); ex = 10; eyeSize = 3; mouth = ey + 5; break; }
      case 'beast': ell(16, 19, 13, 8, shadeBody); ell(16, 12, 8, 7, shadeBody); rect(4, 24, 6, 31, 'b'); rect(11, 24, 13, 31, 'b');
        put(9, 4, 'a'); put(9, 5, 'a'); put(10, 5, 'a'); put(8, 6, 'a'); put(9, 6, 'a'); put(10, 6, 'a'); ey = 11; ex = 11; mouth = 16; break;
      case 'bird': ell(16, 17, 8, 9, shadeBody); ell(16, 10, 6, 6, shadeBody);
        for (let i = 0; i < 10; i++) rect(1 + i, 9 + i, 5 + i, 10 + i, i % 3 ? 'c' : 'b'); rect(13, 13, 16, 14, 'd'); ey = 9; ex = 12; mouth = 99; break;
      case 'bug': ell(16, 20, 9, 8, shadeBody); ell(16, 10, 6, 5, shadeBody); for (let i = 0; i < 3; i++) rect(4 + i, 16 + i * 4, 8, 17 + i * 4, 'b');
        rect(11, 2, 11, 6, 'b'); rect(10, 1, 10, 2, 'c'); ey = 9; ex = 12; mouth = 13; break;
      case 'plant': rect(14, 18, 16, 31, 'd'); ell(16, 12, 12, 9, (x, y, d) => (d > 0.6 ? 'c' : 'a')); ell(16, 12, 5, 4, 'b');
        rect(6, 24, 13, 26, 'd'); ey = 11; ex = 13; mouth = 14; break;
      case 'ghost': ell(16, 14, 12, 12, shadeBody); rect(4, 14, 15, 26, 'a'); for (let x = 4; x < 16; x += 4) rect(x, 26, x + 1, 29, 'b'); ey = 12; ex = 10; eyeSize = 3; mouth = 19; break;
      case 'golem': rect(5, 10, 15, 26, 'a'); rect(8, 3, 15, 10, 'a'); rect(1, 11, 5, 21, 'b'); rect(7, 27, 11, 31, 'b');
        for (let i = 0; i < 12; i++) put(5 + Math.floor(r() * 11), 10 + Math.floor(r() * 17), 'b'); rect(10, 14, 15, 15, 'c'); ey = 6; ex = 12; mouth = 9; break;
      case 'humanoid': ell(16, 8, 6, 6, shadeBody); rect(9, 14, 15, 24, 'c'); rect(5, 14, 8, 22, 'b'); rect(10, 25, 12, 31, 'd');
        put(10, 1, 'b'); put(9, 2, 'b'); put(10, 2, 'b'); ey = 7; ex = 12; mouth = 10; break;
      case 'fish': ell(16, 16, 14, 8, shadeBody); rect(0, 12, 2, 20, 'c'); rect(12, 7, 15, 9, 'c'); ey = 14; ex = 6; mouth = 18; break;
      case 'dragon': ell(16, 20, 10, 8, shadeBody); ell(16, 9, 6, 6, shadeBody); for (let i = 0; i < 9; i++) rect(1 + i, 6 + i, 3 + i, 7 + i, 'c');
        put(11, 2, 'd'); put(10, 1, 'd'); put(11, 3, 'd'); rect(8, 27, 10, 31, 'b'); ey = 8; ex = 12; mouth = 12; break;
      case 'machine': rect(4, 8, 15, 24, 'a'); rect(6, 10, 15, 22, 'b'); rect(8, 12, 15, 14, 'c'); rect(2, 12, 4, 20, 'd'); rect(6, 25, 9, 31, 'd'); rect(13, 2, 14, 8, 'd');
        ey = 13; ex = 12; eyeSize = 2; mouth = 99; break;
      case 'eye': ell(16, 16, 12, 12, shadeBody); ell(16, 16, 7, 7, 'w'); ell(16, 16, 4, 4, 'c'); ell(16, 16, 2, 2, 'e');
        for (let i = 0; i < 5; i++) { const a = r() * 3 + 1.2; rect(Math.max(0, 16 - Math.round(13 * Math.cos(a))), Math.round(16 - 13 * Math.sin(a)), Math.max(0, 16 - Math.round(13 * Math.cos(a))) + 1, Math.round(16 - 13 * Math.sin(a)) + 1, 'b'); }
        ey = 99; mouth = 99; break;
      case 'wisp': for (let y = 0; y < 30; y++) { const w = Math.round(10 * Math.sin((y / 30) * Math.PI) + (y > 20 ? 0 : 2)); rect(16 - w, y + 1, 15, y + 1, y % 4 < 2 ? 'a' : 'c'); } ell(16, 20, 7, 7, 'l'); ey = 18; ex = 12; mouth = 23; break;
      default: ell(16, 20, 12, 10, shadeBody);
    }
    // 무늬
    for (let i = 0; i < 14; i++) { const x = Math.floor(r() * half), y = Math.floor(r() * H); if (get(x, y) === 'a') put(x, y, r() < 0.5 ? 'b' : 'l'); }
    // 눈
    if (ey < 99) {
      for (let dy = 0; dy < eyeSize; dy++) for (let dx = 0; dx < eyeSize; dx++) put(ex - dx, ey + dy, 'w');
      put(ex - eyeSize + 1, ey + eyeSize - 1, 'e'); put(ex, ey + eyeSize - 1, 'e');
      if (boss) put(ex - eyeSize, ey - 1, 'd');
    }
    if (mouth < 99) { for (let x = 13; x < 16; x++) put(x, mouth, 'm'); if (r() < 0.6) put(13, mouth + 1, 'w'); }
    if (boss) { put(8, 0, 'y'); put(8, 1, 'y'); put(10, 0, 'y'); rect(8, 2, 15, 3, 'y'); put(12, 0, 'y'); put(14, 1, 'y'); }
    const grid = g.map((row) => row.join('')).map((row) => row + row.split('').reverse().join(''));
    const cols = { a: main, b: sub, c: accent, d: U.shade(sub, 0.7), l: U.shade(main, 1.3), w: '#ffffff', e: '#16101f', m: '#2a1020', y: '#ffd84a' };
    const cv = renderGrid(grid, cols);
    cache.set(key, cv);
    return cv;
  }

  G.sprites = { person, creature, monster, renderGrid, mirrorH, HAIR };
})();
