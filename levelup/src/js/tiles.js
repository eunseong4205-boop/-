/* 타일 그래픽: 지역별 팔레트 + 절차적 16×16 타일 + 건물 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const TS = 16;

  /* ───────── 팔레트 ───────── */
  const BASE = {
    grass: ['#5fbf4a', '#3f9a3a', '#86d65b'], path: ['#d2ab70', '#aa8450', '#e6c68e'], road: ['#b9b2a8', '#8f887f', '#d6d0c8'],
    water: ['#3a86d8', '#2a64b0', '#8cc8f8'], tree: ['#2f8a3a', '#46ab4d', '#1c5e28', '#7a4a2a'], bush: ['#3a9640', '#58b852'],
    rock: ['#9a948e', '#6e6a66', '#c2bdb6'], cliff: ['#8a7658', '#665438', '#a89272'], sand: ['#ecd59a', '#d2b877', '#f7e7bb'],
    snow: ['#f4f8ff', '#d4e2f4', '#ffffff'], ice: ['#bfe8ff', '#8ccbf0', '#e8f8ff'], flowers: ['#ffffff', '#ffd84a', '#ff7aa8', '#b48cff'],
    floor: ['#c8905a', '#a8703e', '#dca676'], wall: ['#e8d8b8', '#c8b690', '#f6ead2'], carpet: ['#b8403a', '#8c2c28', '#d86a5a'],
    cave: ['#6e5c4a', '#52422f', '#86735e'], cavewall: ['#3a2e26', '#2a2018', '#4e4034'], metal: ['#9aa4ae', '#707a86', '#c2cad2'],
    lava: ['#ff6a1f', '#d8380f', '#ffc04a'], cloud: ['#ffffff', '#dfefff', '#ffffff'], void: ['#9fd4ff', '#bfe4ff', '#e6f5ff'],
    crystal: ['#e8c860', '#c89a38', '#fff0a8'], stars: ['#0b0a1c', '#1a1640', '#ffffff'], fence: ['#a8784a', '#7a5230'],
    ruin: ['#a09a92', '#7a746c', '#c8c2b8'], scrap: ['#7a6a5a', '#4e4034', '#a86a3a'], lamp: ['#3a3450', '#ffd86a'],
    mush: ['#b04ad8', '#ff8ae8', '#f6e8ff'], cactus: ['#4a9a4a', '#2f7434', '#7ac06a'], pine: ['#2f6e5e', '#1f4e42', '#f4f8ff'],
  };
  const THEMES = {
    green: {},
    home: { floor: ['#c8905a', '#a8703e', '#dca676'], wall: ['#f0e0c0', '#d0bc94', '#fff4dc'] },
    red: { grass: ['#c07a3e', '#9a5a2c', '#dc9a52'], tree: ['#c8402c', '#ec7038', '#8c2a1c', '#6a3a22'], bush: ['#b8482e', '#dc6a3a'],
      path: ['#8a6450', '#6a4a3a', '#a8826a'], rock: ['#8a5a4a', '#643c30', '#aa7a66'], cliff: ['#7a4a38', '#56301f', '#9a6650'] },
    mine: { cave: ['#6a5640', '#4c3c2a', '#84705a'], cavewall: ['#3a2c20', '#281c12', '#52402e'] },
    blue: { grass: ['#58b88c', '#3a946c', '#7ed4a8'], road: ['#dfe8f0', '#b4c2d0', '#f4f8fc'], path: ['#e8d6a8', '#c8b484', '#f6ead0'] },
    yellow: { grass: ['#d8b858', '#b89838', '#ecd078'], path: ['#e0a848', '#b88430', '#f0c870'], sand: ['#f0c860', '#d0a444', '#fbe092'],
      rock: ['#c08a4a', '#96662e', '#dca86a'], cliff: ['#b07a3e', '#86582a', '#cc9a5e'], road: ['#e8d0a0', '#c4a878', '#f6e6c4'] },
    purple: { grass: ['#6a4a9a', '#4c3278', '#8a6ac0'], tree: ['#5a2a8a', '#7a4ab0', '#3a1a60', '#3a2a4a'], bush: ['#5a3490', '#8458c0'],
      path: ['#9a8ab8', '#786896', '#b8aad4'], water: ['#5a4ac8', '#3a2a98', '#a898f8'], rock: ['#7a6a90', '#584a6e', '#9a8ab0'] },
    rainbow: { grass: ['#8ee07e', '#62bc5a', '#b4f0a0'], path: ['#f6d0e0', '#e0a8c0', '#fff0f6'], road: ['#f0e6ff', '#cfc0ec', '#ffffff'] },
    cloud: { grass: ['#b8f0c8', '#8ad0a0', '#e0fff0'] },
    white: { grass: ['#e8f0fa', '#c8d6ea', '#ffffff'], path: ['#c8d4e4', '#a4b2c6', '#e4ecf6'], tree: ['#2f6e5e', '#3f8a74', '#1f4e42', '#5a4030'],
      rock: ['#a8b4c4', '#7c8a9c', '#d0dae6'], road: ['#dde6f2', '#b4c2d4', '#f4f8fc'], water: ['#6ab0e0', '#4a88c0', '#c8ecff'] },
    gray: { grass: ['#8a8a86', '#6a6a66', '#a8a8a2'], path: ['#6e6a64', '#54504a', '#8a867e'], tree: ['#5a5a58', '#7a7a76', '#3e3e3c', '#4a4038'],
      rock: ['#6a6a70', '#4a4a50', '#8a8a92'], water: ['#5a6a6e', '#40504e', '#8a9ea0'], road: ['#7e8288', '#5e6268', '#9ea2a8'] },
    black: { grass: ['#2c2644', '#1e1a32', '#3c3658'], path: ['#3e3656', '#2c2640', '#52486e'], tree: ['#161226', '#241e3c', '#0c0a16', '#2a2238'],
      rock: ['#3a3450', '#28243a', '#4e4868'], water: ['#1a2248', '#10163a', '#3a4a8a'], road: ['#4a4462', '#342f48', '#5e5878'] },
    castle: { floor: ['#4a4460', '#383250', '#5e5878'], wall: ['#2a2440', '#1c1830', '#3c3456'], carpet: ['#8a1a3a', '#621028', '#b02a50'] },
    colorful: { grass: ['#7ad86a', '#52b848', '#a6f08a'], path: ['#ffd0a8', '#f0a878', '#ffe8d4'], road: ['#ffe066', '#ffb04a', '#fff2a8'] },
    space: { floor: ['#5a6478', '#434b5c', '#78849a'], wall: ['#2a3040', '#1c2230', '#3e4658'], metal: ['#8a96aa', '#626e84', '#b4c0d2'] },
    planet: { grass: ['#e8c860', '#c89a38', '#fff0a8'], rock: ['#b89a58', '#8a6e34', '#dcc07a'], path: ['#f6e0a0', '#d8bc70', '#fff4cc'] },
    interior: {},
    cave: {},
  };
  function pal(theme) {
    const t = THEMES[theme] || {};
    const p = Object.assign({}, BASE, t);
    p.name = theme;
    return p;
  }

  /* ───────── 타일 정의 ───────── */
  // 걷기 가능 여부
  const WALK = new Set(['.', ',', '"', ':', '=', '_', 'I', '-', '+', 's', '*', 'i', 'o', 'm', 'c', 'k', 'S', 'D', 'x']);
  const WATERY = new Set(['~', 'L', 'v']);
  function walkable(ch) { return WALK.has(ch); }

  const cache = new Map();
  function mk() { const c = document.createElement('canvas'); c.width = TS; c.height = TS; return c; }
  function px(g, x, y, c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); }
  function rect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }

  function speckle(g, r, cols, n) { for (let i = 0; i < n; i++) px(g, Math.floor(r() * TS), Math.floor(r() * TS), cols[i % cols.length]); }

  function drawGround(g, P, ch, r) {
    switch (ch) {
      case '.': case 'x': rect(g, 0, 0, TS, TS, P.grass[0]); speckle(g, r, [P.grass[1], P.grass[1], P.grass[2]], 14); break;
      case ',': rect(g, 0, 0, TS, TS, P.grass[0]); speckle(g, r, [P.grass[1]], 6);
        for (let k = 0; k < 4; k++) { const x = 1 + Math.floor(r() * 12), y = 3 + Math.floor(r() * 10); px(g, x, y, P.grass[1]); px(g, x + 1, y - 1, P.grass[1]); px(g, x + 2, y, P.grass[1]); px(g, x + 1, y, P.grass[2]); } break;
      case '"': rect(g, 0, 0, TS, TS, P.grass[0]); speckle(g, r, [P.grass[1], P.grass[2]], 10);
        for (let k = 0; k < 3; k++) { const x = 2 + Math.floor(r() * 11), y = 2 + Math.floor(r() * 11), c = P.flowers[Math.floor(r() * P.flowers.length)]; px(g, x, y, c); px(g, x + 1, y, c); px(g, x, y + 1, c); px(g, x + 1, y + 1, c); px(g, x, y, '#ffe86a'); } break;
      case ':': rect(g, 0, 0, TS, TS, P.path[0]); speckle(g, r, [P.path[1], P.path[2], P.path[1]], 12); break;
      case '=': rect(g, 0, 0, TS, TS, P.road[0]);
        for (let y = 0; y < TS; y += 4) { rect(g, 0, y, TS, 1, P.road[1]); const o = (y / 4) % 2 ? 4 : 0; for (let x = o; x < TS; x += 8) rect(g, x, y, 1, 4, P.road[1]); }
        speckle(g, r, [P.road[2]], 5); break;
      case '_': rect(g, 0, 0, TS, TS, P.fence[0]); for (let x = 0; x < TS; x += 4) rect(g, x, 0, 1, TS, P.fence[1]); rect(g, 0, 0, TS, 1, P.fence[1]); rect(g, 0, 15, TS, 1, P.fence[1]); break;
      case 'I': rect(g, 0, 0, TS, TS, P.fence[0]); for (let y = 0; y < TS; y += 4) rect(g, 0, y, TS, 1, P.fence[1]); rect(g, 0, 0, 1, TS, P.fence[1]); rect(g, 15, 0, 1, TS, P.fence[1]); break;
      case '-': rect(g, 0, 0, TS, TS, P.floor[0]); for (let y = 0; y < TS; y += 4) rect(g, 0, y, TS, 1, P.floor[1]); { const o = Math.floor(r() * 3) * 5; rect(g, o, 1, 1, 3, P.floor[1]); rect(g, (o + 8) % 16, 9, 1, 3, P.floor[1]); } speckle(g, r, [P.floor[2]], 4); break;
      case '+': rect(g, 0, 0, TS, TS, P.carpet[0]); rect(g, 0, 0, TS, 1, P.carpet[1]); rect(g, 0, 15, TS, 1, P.carpet[1]); for (let x = 2; x < TS; x += 4) px(g, x, 8, P.carpet[2]); break;
      case 's': rect(g, 0, 0, TS, TS, P.sand[0]); speckle(g, r, [P.sand[1], P.sand[2]], 12); if (r() < 0.3) { const x = Math.floor(r() * 10) + 2; rect(g, x, 8, 4, 1, P.sand[1]); } break;
      case '*': rect(g, 0, 0, TS, TS, P.snow[0]); speckle(g, r, [P.snow[1], P.snow[1], P.snow[2]], 10); break;
      case 'i': rect(g, 0, 0, TS, TS, P.ice[0]); rect(g, 2, 3, 5, 1, P.ice[2]); rect(g, 9, 10, 4, 1, P.ice[2]); speckle(g, r, [P.ice[1]], 6); break;
      case 'o': rect(g, 0, 0, TS, TS, P.cave[0]); speckle(g, r, [P.cave[1], P.cave[2], P.cave[1]], 14); break;
      case 'm': rect(g, 0, 0, TS, TS, P.metal[0]); rect(g, 0, 0, TS, 1, P.metal[2]); rect(g, 0, 0, 1, TS, P.metal[2]); rect(g, 15, 0, 1, TS, P.metal[1]); rect(g, 0, 15, TS, 1, P.metal[1]); px(g, 3, 3, P.metal[1]); px(g, 12, 3, P.metal[1]); px(g, 3, 12, P.metal[1]); px(g, 12, 12, P.metal[1]); break;
      case 'c': rect(g, 0, 0, TS, TS, P.cloud[0]); speckle(g, r, [P.cloud[1]], 10); break;
      case 'k': rect(g, 0, 0, TS, TS, P.crystal[0]); for (let k = 0; k < 3; k++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); rect(g, x, y, 3, 1, P.crystal[2]); px(g, x + 1, y + 1, P.crystal[1]); } speckle(g, r, [P.crystal[1]], 6); break;
      case 'S': rect(g, 0, 0, TS, TS, P.floor[1]); for (let y = 1; y < TS; y += 3) { rect(g, 1, y, 14, 2, P.floor[2]); rect(g, 1, y + 2, 14, 1, P.floor[1]); } break;
      case 'D': rect(g, 0, 0, TS, TS, '#5a3a22'); rect(g, 2, 2, 12, 14, '#7a4e2c'); rect(g, 7, 2, 1, 14, '#5a3a22'); px(g, 10, 9, '#ffd84a'); break;
      default: rect(g, 0, 0, TS, TS, P.grass[0]);
    }
  }

  function drawBlock(g, P, ch, r, theme) {
    switch (ch) {
      case 'T': { // 활엽수
        const [d, m, dk, tr] = P.tree;
        rect(g, 6, 11, 4, 5, tr); rect(g, 7, 11, 1, 5, U.shade(tr, 1.25));
        rect(g, 2, 3, 12, 8, m); rect(g, 3, 1, 10, 2, m); rect(g, 1, 5, 14, 5, m); rect(g, 4, 11, 8, 1, dk);
        rect(g, 3, 8, 11, 3, d); rect(g, 1, 8, 2, 2, d); px(g, 4, 3, U.shade(m, 1.25)); rect(g, 5, 2, 3, 1, U.shade(m, 1.2)); rect(g, 3, 4, 2, 2, U.shade(m, 1.2));
        speckle(g, r, [d], 6); break;
      }
      case 't': rect(g, 0, 0, TS, TS, P.grass[0]); rect(g, 2, 5, 12, 9, P.bush[0]); rect(g, 3, 3, 10, 3, P.bush[0]); rect(g, 4, 4, 4, 2, P.bush[1]); rect(g, 2, 12, 12, 2, U.shade(P.bush[0], 0.75)); speckle(g, r, [P.bush[1]], 4); break;
      case 'P': { const [a, b, sn] = P.pine; rect(g, 7, 13, 2, 3, '#5a4030'); for (let y = 1; y < 13; y++) { const w = Math.min(14, 2 + Math.floor(y * 1.1)); rect(g, 8 - w / 2, y, w, 1, y % 4 === 0 ? b : a); } rect(g, 6, 1, 4, 2, sn); rect(g, 4, 5, 3, 1, sn); rect(g, 10, 8, 3, 1, sn); break; }
      case 'C': rect(g, 6, 2, 4, 14, P.cactus[0]); rect(g, 7, 2, 1, 14, P.cactus[2]); rect(g, 2, 6, 3, 2, P.cactus[0]); rect(g, 2, 3, 2, 4, P.cactus[0]); rect(g, 11, 8, 3, 2, P.cactus[0]); rect(g, 12, 5, 2, 4, P.cactus[0]); px(g, 9, 5, '#ff7aa8'); break;
      case 'M': rect(g, 6, 8, 4, 8, '#f0e0f8'); rect(g, 1, 3, 14, 6, P.mush[0]); rect(g, 3, 1, 10, 2, P.mush[0]); px(g, 4, 4, P.mush[2]); px(g, 10, 3, P.mush[2]); px(g, 7, 6, P.mush[2]); rect(g, 1, 8, 14, 1, U.shade(P.mush[0], 0.7)); break;
      case '^': rect(g, 1, 4, 14, 12, P.rock[0]); rect(g, 3, 1, 9, 4, P.rock[0]); rect(g, 4, 2, 4, 2, P.rock[2]); rect(g, 2, 5, 3, 3, P.rock[2]); rect(g, 1, 12, 14, 4, P.rock[1]); rect(g, 9, 6, 1, 5, P.rock[1]); break;
      case '#': {
        if (['home', 'interior', 'castle', 'space'].includes(theme)) { rect(g, 0, 0, TS, TS, P.wall[0]); rect(g, 0, 12, TS, 4, P.wall[1]); rect(g, 0, 11, TS, 1, P.wall[2]); for (let x = 0; x < TS; x += 8) rect(g, x, 0, 1, 11, P.wall[1]); }
        else if (theme === 'mine' || theme === 'cave') { rect(g, 0, 0, TS, TS, P.cavewall[0]); speckle(g, r, [P.cavewall[1], P.cavewall[2]], 18); if (theme === 'mine' && r() < 0.35) { rect(g, 5, 6, 2, 2, '#ffd84a'); px(g, 9, 10, '#ffe88a'); } }
        else { rect(g, 0, 0, TS, TS, P.cliff[0]); rect(g, 0, 0, TS, 3, P.cliff[2]); rect(g, 0, 12, TS, 4, P.cliff[1]); for (let x = 2; x < TS; x += 5) rect(g, x, 4, 1, 7, P.cliff[1]); }
        break;
      }
      case 'w': rect(g, 0, 0, TS, TS, P.wall[0]); rect(g, 0, 12, TS, 4, P.wall[1]); rect(g, 3, 2, 10, 8, '#6a4a2a'); rect(g, 4, 3, 8, 6, '#9fd8ff'); rect(g, 8, 3, 1, 6, '#6a4a2a'); rect(g, 4, 6, 8, 1, '#6a4a2a'); px(g, 5, 4, '#ffffff'); break;
      case '|': rect(g, 0, 0, TS, TS, P.grass[0]); rect(g, 0, 6, TS, 2, P.fence[0]); rect(g, 0, 10, TS, 2, P.fence[0]); rect(g, 2, 3, 2, 11, P.fence[1]); rect(g, 12, 3, 2, 11, P.fence[1]); break;
      case 'R': rect(g, 3, 1, 10, 15, P.ruin[0]); rect(g, 3, 1, 10, 2, P.ruin[2]); rect(g, 5, 4, 1, 11, P.ruin[1]); rect(g, 9, 4, 1, 11, P.ruin[1]); rect(g, 2, 14, 12, 2, P.ruin[1]); break;
      case '@': rect(g, 6, 1, 4, 14, '#bfe8ff'); rect(g, 3, 5, 3, 10, '#8cc8f8'); rect(g, 10, 4, 3, 11, '#8cc8f8'); rect(g, 7, 2, 1, 10, '#ffffff'); rect(g, 2, 14, 12, 2, '#5a86b0'); break;
      case 'X': rect(g, 1, 6, 14, 10, P.scrap[0]); rect(g, 3, 3, 6, 4, P.scrap[2]); rect(g, 9, 2, 4, 5, P.scrap[0]); rect(g, 2, 9, 5, 2, P.scrap[1]); rect(g, 9, 11, 4, 3, P.scrap[2]); px(g, 11, 4, '#c8c8c8'); break;
      case 'l': rect(g, 7, 4, 2, 12, P.lamp[0]); rect(g, 5, 13, 6, 3, P.lamp[0]); rect(g, 5, 1, 6, 4, P.lamp[0]); rect(g, 6, 2, 4, 2, P.lamp[1]); break;
      case 'b': rect(g, 2, 3, 12, 12, '#9a6a3a'); rect(g, 2, 3, 12, 2, '#b8844a'); rect(g, 2, 8, 12, 1, '#6a4422'); rect(g, 2, 13, 12, 2, '#6a4422'); break;
      case 'd': rect(g, 1, 4, 14, 8, '#a8703e'); rect(g, 1, 4, 14, 2, '#c8905a'); rect(g, 2, 12, 2, 4, '#7a4e2c'); rect(g, 12, 12, 2, 4, '#7a4e2c'); break;
      case 'h': rect(g, 0, 0, TS, TS, '#7a4e2c'); for (let y = 2; y < 16; y += 5) { rect(g, 1, y, 14, 4, '#3a2412'); for (let x = 1; x < 15; x += 2) rect(g, x, y + (x % 3 === 0 ? 1 : 0), 1, 4 - (x % 3 === 0 ? 1 : 0), U.pick(['#c84a3a', '#3a78c8', '#e8c84a', '#58a858', '#a858c8'], r())); } break;
      case 'q': rect(g, 1, 1, 14, 14, '#7a4e2c'); rect(g, 2, 2, 12, 12, '#f4f0e8'); rect(g, 2, 7, 12, 7, '#4a8ad8'); rect(g, 2, 7, 12, 1, '#2a64b0'); rect(g, 3, 3, 10, 3, '#ffffff'); break;
      case 'n': rect(g, 0, 3, TS, 13, '#8a5a32'); rect(g, 0, 3, TS, 3, '#b07a44'); rect(g, 0, 10, TS, 1, '#6a4422'); break;
      case 'g': rect(g, 0, 0, TS, TS, P.grass[0]); rect(g, 4, 3, 8, 12, '#9a9aa2'); rect(g, 5, 2, 6, 1, '#9a9aa2'); rect(g, 6, 6, 4, 1, '#6a6a72'); rect(g, 7, 4, 2, 5, '#6a6a72'); rect(g, 3, 14, 10, 2, '#6a6a72'); break;
      case 'f': rect(g, 1, 8, 14, 8, '#7a4a2a'); rect(g, 1, 8, 14, 2, '#9a6a3a'); for (let k = 0; k < 5; k++) { const x = 2 + k * 3; rect(g, x, 3 + (k % 2) * 2, 2, 2, P.flowers[k % P.flowers.length]); rect(g, x, 5 + (k % 2) * 2, 1, 3, '#3a9a3a'); } break;
      case 'p': rect(g, 4, 9, 8, 7, '#b0603a'); rect(g, 4, 9, 8, 2, '#c8784a'); rect(g, 3, 2, 10, 8, '#3a9a4a'); rect(g, 5, 1, 6, 2, '#58b858'); break;
      case 'y': rect(g, 3, 12, 10, 4, '#8a8a92'); rect(g, 5, 4, 6, 8, '#b4b4bc'); rect(g, 6, 1, 4, 4, '#c8c8d0'); rect(g, 4, 6, 8, 2, '#b4b4bc'); px(g, 7, 2, '#6a6a72'); break;
      case 'z': rect(g, 0, 0, TS, TS, P.stars[0]); speckle(g, r, [P.stars[1]], 8); if (r() < 0.5) px(g, Math.floor(r() * 16), Math.floor(r() * 16), P.stars[2]); break;
      case 'j': rect(g, 0, 0, TS, TS, '#2a3040'); rect(g, 2, 2, 12, 12, '#0b0a1c'); rect(g, 2, 2, 12, 1, '#8a96aa'); px(g, 5, 6, '#ffffff'); px(g, 10, 9, '#ffe08a'); px(g, 12, 4, '#ffffff'); break;
      case 'u': rect(g, 0, 0, TS, TS, '#3a4458'); rect(g, 2, 2, 12, 12, '#1a2230'); for (let y = 4; y < 13; y += 3) rect(g, 3, y, Math.floor(r() * 8) + 3, 1, U.pick(['#6ae8ff', '#6affa0', '#ffd86a'], r())); break;
      case 'K': rect(g, 3, 6, 10, 10, '#c89a38'); rect(g, 5, 1, 6, 8, '#fff0a8'); rect(g, 6, 2, 2, 5, '#ffffff'); rect(g, 2, 12, 12, 4, '#8a6e34'); break;
    }
  }

  function drawAnim(g, P, ch, frame) {
    if (ch === '~') {
      rect(g, 0, 0, TS, TS, P.water[0]);
      for (let k = 0; k < 3; k++) { const y = (k * 5 + frame * 2) % 16, x = (k * 7 + frame * 3) % 12; rect(g, x, y, 4, 1, P.water[2]); rect(g, (x + 8) % 14, (y + 8) % 16, 3, 1, P.water[1]); }
    } else if (ch === 'L') {
      rect(g, 0, 0, TS, TS, P.lava[0]);
      for (let k = 0; k < 3; k++) { const y = (k * 5 + frame * 3) % 16, x = (k * 6 + frame * 2) % 12; rect(g, x, y, 4, 2, P.lava[2]); rect(g, (x + 7) % 14, (y + 9) % 16, 3, 1, P.lava[1]); }
    } else if (ch === 'v') {
      rect(g, 0, 0, TS, TS, P.void[0]);
      for (let k = 0; k < 2; k++) { const x = (k * 9 + frame * 2) % 16, y = (k * 7 + 3) % 14; rect(g, x, y, 5, 2, P.void[2]); rect(g, x + 1, y - 1, 3, 1, P.void[2]); }
    }
  }

  /** 타일 한 칸 (이웃에 따라 가장자리 처리) */
  function tile(theme, ch, tx, ty, nb, frame) {
    const variant = Math.floor(U.noise2(tx, ty, 7) * 4);
    const key = theme + '|' + ch + '|' + variant + '|' + nb + '|' + (frame || 0);
    let c = cache.get(key);
    if (c) return c;
    c = mk();
    const g = c.getContext('2d');
    const P = pal(theme);
    const r = U.rng(U.hash(theme + ch) + variant * 977);
    if (WATERY.has(ch)) drawAnim(g, P, ch, frame || 0);
    else if (WALK.has(ch)) drawGround(g, P, ch, r);
    else {
      // 블록: 바탕을 먼저 깔고 위에 그린다
      const under = { T: '.', t: '.', P: '*', C: 's', M: '.', '^': '.', '|': '.', R: '.', '@': 'o', X: '.', l: '.', b: '.', g: '.', y: '.', f: '.', p: '-', d: '-', h: '-', q: '-', n: '-', K: 'k' }[ch];
      if (under) drawGround(g, P, under === '.' && ['white'].includes(theme) ? '*' : under === '.' && ['yellow'].includes(theme) && ch === 'C' ? 's' : under, r);
      drawBlock(g, P, ch, r, theme);
    }
    // 가장자리: nb 비트 (1=위,2=오른쪽,4=아래,8=왼쪽 이웃이 '다른 지형')
    if (nb) {
      if (ch === '~' || ch === 'L') {
        const edge = ch === 'L' ? '#3a2014' : P.water[2];
        if (nb & 1) rect(g, 0, 0, TS, 2, edge);
        if (nb & 2) rect(g, 14, 0, 2, TS, edge);
        if (nb & 4) rect(g, 0, 14, TS, 2, edge);
        if (nb & 8) rect(g, 0, 0, 2, TS, edge);
      } else if (ch === ':' || ch === 's' || ch === '=') {
        const gc = P.grass[0];
        const rr = U.rng(key.length * 31 + variant);
        if (nb & 1) for (let x = 0; x < TS; x++) { const h = rr() < 0.5 ? 1 : 2; rect(g, x, 0, 1, h, gc); }
        if (nb & 4) for (let x = 0; x < TS; x++) { const h = rr() < 0.5 ? 1 : 2; rect(g, x, TS - h, 1, h, gc); }
        if (nb & 8) for (let y = 0; y < TS; y++) { const w = rr() < 0.5 ? 1 : 2; rect(g, 0, y, w, 1, gc); }
        if (nb & 2) for (let y = 0; y < TS; y++) { const w = rr() < 0.5 ? 1 : 2; rect(g, TS - w, y, w, 1, gc); }
      }
    }
    cache.set(key, c);
    return c;
  }

  /* ───────── 건물 ───────── */
  const ICONS = {
    bed: ['..........', '.wwww.....', '.wwwwbbbbb', 'bbbbbbbbbb', 'b........b'],
    sword: ['.......ww.', '......ww..', '.....ww...', '.g..ww....', '..gww.....', '..gg......', '.g..g.....'],
    potion: ['...ww...', '...ww...', '..wrrw..', '.wrrrrw.', '.wrrrrw.', '..wwww..'],
    star: ['....y....', '...yyy...', 'yyyyyyyyy', '.yyyyyyy.', '..yy.yy..', '.yy...yy.'],
    book: ['bbbbbbb.', 'bwwwwwbb', 'bwwwwwbb', 'bwwwwwbb', 'bbbbbbb.'],
    coin: ['..yyy..', '.yyyyy.', 'yyy.yyy', 'yyy.yyy', '.yyyyy.', '..yyy..'],
    hammer: ['wwwww...', 'wwwww...', '..g.....', '..g.....', '..g.....', '..g.....'],
    glove: ['.w.w.w..', '.w.w.w.w', '.wwwwwww', '.wwwwww.', '..wwww..'],
    scope: ['......ww', '....wwww', '..wwww..', 'wwww....', '..g.....', '.g.g....'],
  };
  const ICON_COL = { w: '#ffffff', b: '#5a3a22', g: '#8a8a92', r: '#ff5a6a', y: '#ffd84a' };

  function drawBuilding(g, b, theme, ox, oy, t) {
    const P = pal(theme);
    const x0 = ox + b.x * TS, y0 = oy + b.y * TS, w = b.w * TS, h = b.h * TS;
    const roofH = Math.max(TS, Math.round(h * (b.roofRatio || 0.55)));
    const wallC = { wood: ['#c8a070', '#a07848'], stone: ['#c8c0b4', '#9e968a'], brick: ['#c0664a', '#96483a'], sand: ['#f0d8a0', '#d0b476'],
      snow: ['#eef4fc', '#c4d2e4'], metal: ['#9aa4ae', '#707a86'], dark: ['#3e3656', '#2c2640'], candy: ['#fff0f6', '#f0c8dc'], purple: ['#c8b4e0', '#a08cc0'] }[b.wall || 'wood'];
    const roof = b.roof || '#c8483a';
    const style = b.style || 'house';
    if (style === 'tent') {
      for (let i = 0; i < h; i++) {
        const ww = Math.round(w * (0.3 + 0.7 * i / h));
        rect(g, x0 + (w - ww) / 2, y0 + i, ww, 1, Math.floor(i / 4) % 2 ? roof : '#ffffff');
      }
      rect(g, x0 + w / 2 - 5, y0 + h - 14, 10, 14, '#2a1a12');
      rect(g, x0 + w / 2 - 1, y0 - 4, 2, 6, '#5a3a22'); rect(g, x0 + w / 2 + 1, y0 - 4, 5, 3, '#ffd84a');
      return;
    }
    if (style === 'tower') {
      // 징수탑: 수정 오벨리스크
      const cx = x0 + w / 2;
      rect(g, x0 + 3, y0 + h - 10, w - 6, 10, '#4a4458');
      rect(g, x0 + 5, y0 + h - 12, w - 10, 3, '#6a6480');
      for (let i = 0; i < h - 14; i++) { const ww = Math.max(4, Math.round((w - 12) * (0.35 + 0.65 * i / (h - 14)))); rect(g, cx - ww / 2, y0 + i + 2, ww, 1, i % 6 === 0 ? '#3a3450' : '#58507a'); }
      const glow = 0.5 + 0.5 * Math.sin((t || 0) * 3);
      rect(g, cx - 4, y0 - 2, 8, 8, U.mix('#8a6aff', '#e8d8ff', glow));
      rect(g, cx - 2, y0 - 4, 4, 2, '#e8d8ff'); rect(g, cx - 1, y0, 2, 4, '#ffffff');
      return;
    }
    if (style === 'lighthouse') {
      const cx = x0 + w / 2;
      rect(g, x0 + 2, y0 + h - 6, w - 4, 6, '#8a8a92');
      for (let i = 0; i < h - 14; i++) { const ww = Math.round(10 + (i / (h - 14)) * 8); rect(g, cx - ww / 2, y0 + 12 + i, ww, 1, Math.floor(i / 7) % 2 ? '#d8403a' : '#f4f4f4'); }
      rect(g, cx - 7, y0 + 6, 14, 7, '#3a3a48'); rect(g, cx - 5, y0 + 7, 10, 5, b.lit ? '#ffffff' : '#6a6a78');
      rect(g, cx - 6, y0 + 2, 12, 4, '#d8403a'); rect(g, cx - 1, y0, 2, 2, '#3a3a48');
      if (b.lit) { g.globalAlpha = 0.35 + 0.2 * Math.sin((t || 0) * 3); g.fillStyle = '#fff8c8'; g.beginPath(); g.moveTo(cx, y0 + 9); g.lineTo(cx + 60, y0 - 4); g.lineTo(cx + 60, y0 + 22); g.fill(); g.globalAlpha = 1; }
      if (b.door !== undefined) { const dx = x0 + b.door * TS + 3, dy = y0 + h - 13; rect(g, dx, dy, 10, 13, '#5a3a22'); px(g, dx + 7, dy + 7, '#ffd84a'); }
      return;
    }
    if (style === 'rocket') {
      const cx = x0 + w / 2;
      for (let i = 0; i < h - 12; i++) { const ww = Math.round(Math.min(w - 16, 6 + i * 1.3)); rect(g, cx - ww / 2, y0 + 8 + i, ww, 1, i % 9 === 0 ? '#9aa4ae' : i % 9 < 3 ? '#eef0f4' : '#d8dce4'); }
      rect(g, cx - 3, y0 + 3, 6, 6, '#e84a4a'); rect(g, cx - 1, y0, 2, 3, '#e84a4a');
      rect(g, cx - 5, y0 + 22, 10, 10, '#3a4a6a'); rect(g, cx - 4, y0 + 23, 8, 8, b.lit ? '#ffe08a' : '#8ad8ff'); px(g, cx - 2, y0 + 25, '#ffffff');
      rect(g, x0 + 5, y0 + h - 22, 7, 16, '#e84a4a'); rect(g, x0 + w - 12, y0 + h - 22, 7, 16, '#e84a4a'); rect(g, cx - 1, y0 + h - 20, 2, 14, '#c83a3a');
      rect(g, cx - 8, y0 + h - 7, 16, 3, '#6a7280');
      for (let i = 0; i < 6; i++) rect(g, cx - 10 + i * 4, y0 + 40 + (i % 2) * 7, 2, 2, '#4a4450');
      if (b.lit) { const f = Math.round(Math.sin((t || 0) * 22) * 2); rect(g, cx - 6, y0 + h - 4, 12, 4, '#ffd84a'); rect(g, cx - 4, y0 + h, 8, 3 + f, '#ff8a3a'); }
      return;
    }
    if (style === 'boat') {
      const hy = y0 + h - 12;
      rect(g, x0 + 4, hy, w - 8, 10, '#6a4a2a'); rect(g, x0 + 2, hy - 2, w - 4, 3, '#8a6a3a'); rect(g, x0 + 8, hy + 10, w - 16, 2, '#4a3218');
      rect(g, x0 + 6, hy + 3, w - 12, 1, '#ffd84a');
      const mx = x0 + Math.round(w / 2);
      rect(g, mx - 1, y0 + 2, 2, hy - y0 - 2, '#5a3a22');
      for (let i = 0; i < hy - y0 - 8; i++) { const ww = Math.round(4 + i * 0.7); rect(g, mx + 1, y0 + 4 + i, ww, 1, i % 6 === 0 ? '#e8e0c8' : '#f4f0e0'); }
      rect(g, mx - 1, y0, 8, 3, '#3a78c8');
      return;
    }
    // 벽
    rect(g, x0, y0 + roofH - 2, w, h - roofH + 2, wallC[0]);
    for (let yy = y0 + roofH + 2; yy < y0 + h; yy += 5) rect(g, x0, yy, w, 1, wallC[1]);
    rect(g, x0, y0 + h - 2, w, 2, wallC[1]);
    // 창문
    const wy = y0 + roofH + 3;
    if (h - roofH >= 12) for (let wx = x0 + 5; wx + 8 < x0 + w - 3; wx += 16) {
      const dx = b.door !== undefined ? b.x * TS + b.door * TS + ox : -99;
      if (Math.abs(wx + 4 - (dx + 8)) < 10) continue;
      rect(g, wx, wy, 8, 7, '#5a3a22'); rect(g, wx + 1, wy + 1, 6, 5, b.night ? '#ffd86a' : '#9fd8ff'); rect(g, wx + 4, wy + 1, 1, 5, '#5a3a22'); px(g, wx + 2, wy + 2, '#ffffff');
    }
    // 지붕
    if (style === 'flat' || style === 'castle') {
      rect(g, x0 - 1, y0, w + 2, roofH, roof); rect(g, x0 - 1, y0 + roofH - 3, w + 2, 3, U.shade(roof, 0.7));
      if (style === 'castle') for (let cx = x0; cx < x0 + w; cx += 8) rect(g, cx, y0 - 4, 5, 5, roof);
    } else if (style === 'dome') {
      for (let i = 0; i < roofH; i++) { const f = Math.sqrt(1 - Math.pow(1 - i / roofH, 2)); const ww = Math.round(w * f); rect(g, x0 + (w - ww) / 2, y0 + i, ww, 1, i % 5 === 0 ? U.shade(roof, 0.85) : roof); }
      rect(g, x0 + w / 2 - 1, y0 - 5, 2, 6, '#ffd84a');
    } else {
      for (let i = 0; i < roofH; i++) {
        const inset = Math.max(0, Math.round((roofH - i) * 0.35) - 2);
        rect(g, x0 - 2 + inset, y0 + i, w + 4 - inset * 2, 1, i % 3 === 0 ? U.shade(roof, 0.82) : roof);
      }
      rect(g, x0 - 2, y0 + roofH - 3, w + 4, 3, U.shade(roof, 0.65));
      if (b.chimney) { rect(g, x0 + w - 12, y0 - 4, 6, 8, '#8a5a4a'); rect(g, x0 + w - 13, y0 - 5, 8, 2, '#6a4032'); }
    }
    // 문
    if (b.door !== undefined) {
      const dx = x0 + b.door * TS + 3, dy = y0 + h - 13;
      rect(g, dx - 1, dy - 1, 12, 14, U.shade(wallC[1], 0.8)); rect(g, dx, dy, 10, 13, b.doorColor || '#7a4e2c'); rect(g, dx + 5, dy, 1, 13, U.shade(b.doorColor || '#7a4e2c', 0.7)); px(g, dx + 7, dy + 7, '#ffd84a');
    }
    // 간판
    if (b.icon && ICONS[b.icon]) {
      const ic = ICONS[b.icon];
      const iw = ic[0].length, ih = ic.length;
      const sx = x0 + (b.door !== undefined ? b.door * TS + 8 : w / 2) - Math.floor(iw / 2) - 1, sy = y0 + roofH - ih - 6;
      rect(g, sx - 2, sy - 2, iw + 4, ih + 4, '#3a2412'); rect(g, sx - 1, sy - 1, iw + 2, ih + 2, b.signColor || '#e8c888');
      for (let yy = 0; yy < ih; yy++) for (let xx = 0; xx < iw; xx++) { const ch = ic[yy][xx]; if (ch !== '.') px(g, sx + xx, sy + yy, ICON_COL[ch] === '#ffffff' ? '#3a2412' : ICON_COL[ch]); }
    }
  }

  G.tiles = { TS, THEMES, pal, walkable, tile, drawBuilding, WATERY, WALK };
})();
