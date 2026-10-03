/* 던전마다 다른 꼴의 「깊은 구역」
   큰 열쇠가 있던 방에 계단이 생기고, 그 아래로 던전마다 성격이 다른 구역이 이어진다. 큰 열쇠는 이제 그 끝에 있다.
   · 미로(뿌리 미궁 · 거울 미궁 · 파수꾼의 미궁 · 무덤 미궁) — 갈림길과 막다른 길, 구석의 작은 열쇠, 쫓아오는 파수꾼
   · 암흑 굴(무너진 갱도 · 가라앉은 회랑) — 빛 없는 넓은 굴, 발밑이 꺼지는 바닥, 빛 밖에서 보이지 않는 망령
   · 시련의 방(물이 차는 방 · 그림자 투기장 · 격납고 · 시련의 꼭대기) — 문이 닫히고 적이 파도처럼 몰려온다
   · 순서의 방(해와 달의 방 · 메아리 순서) — 글귀를 읽고 발판을 순서대로. 틀리면 벌이 튀어나온다
   · 무너지는 길(구름길) · 얼음 회랑 — 구덩이 위 금 간 다리, 가시, 미끄러운 얼음
   그리고: 던전의 적은 조금 더 단단하고(체력 +25%), 무리마다 한 마리씩 더, 가끔 정예가 섞인다. 들판에도 새 적. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const OW = G.ow, D = G.data;
  const S = () => G.state;

  /* ───────── 들판의 새 얼굴 ───────── */
  const ADD = {
    green: [['spider', 0.6], ['shroom', 0.4]],
    red: [['shroom', 1], ['lancer', 0.4], ['scorp', 0.4]],
    blue: [['spider', 0.8], ['skel', 0.5]],
    yellow: [['scorp', 2.5], ['skel', 1], ['berserk', 0.4]],
    purple: [['eye', 1], ['assassin', 0.6], ['summoner', 0.4], ['spider', 1]],
    rainbow: [['eye', 1], ['priest', 0.5], ['lancer', 0.8]],
    white: [['skel', 1.5], ['berserk', 1], ['cgolem', 0.7], ['wraith', 0.4]],
    gray: [['sniper', 1.5], ['cgolem', 1], ['lancer', 1], ['eye', 0.8]],
    black: [['wraith', 2], ['assassin', 1.2], ['summoner', 0.8], ['skel', 1], ['priest', 0.6]],
    colorful: [['sniper', 1], ['shroom', 1.5], ['berserk', 1]],
    mist: [['spider', 1.5], ['shroom', 1], ['wraith', 0.8], ['eye', 0.6]],
    amber: [['berserk', 1.2], ['spider', 1], ['scorp', 0.8], ['lancer', 0.6]],
  };
  if (OW && OW.TABLE) for (const k of Object.keys(ADD)) if (OW.TABLE[k]) OW.TABLE[k].push(...ADD[k]);

  /* ───────── 구역의 보물 ───────── */
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };
  item('ac_root', { type: 'acc', grade: 2, name: '뿌리 매듭 반지', fx: { vit: 3, regen: 0.15 }, desc: '뿌리 미궁 끝에서. 체력 +3, 체력이 아주 조금씩 찬다.' });
  item('ac_minelamp', { type: 'acc', grade: 2, name: '광부의 목걸이', fx: { dex: 2, gold: 0.25 }, desc: '무너진 갱도 끝에서. 솜씨 +2, 떨어뜨리는 골드 +25%.' });
  item('ac_tide', { type: 'acc', grade: 3, name: '밀물 조개 호부', fx: { vit: 5, sta: 2 }, desc: '물이 차는 방을 버틴 증표. 체력 +5, 스태미나 +2.' });
  item('ac_sun', { type: 'acc', grade: 3, name: '태양 인장', fx: { int: 4, crit: 0.05 }, req: { lv: 12 }, desc: '해와 달의 방에서. 지력 +4, 치명타 +5%.' });
  item('ac_mirror', { type: 'acc', grade: 3, name: '거울 조각 귀걸이', fx: { dex: 4, speed: 0.08 }, req: { lv: 16 }, desc: '거울 미궁 끝에서. 솜씨 +4, 베는 속도 +8%.' });
  item('ac_cloud', { type: 'acc', grade: 3, name: '구름 깃 장식', fx: { sta: 5, roll: 0.2 }, req: { lv: 18 }, desc: '무너지는 구름길 끝에서. 스태미나 +5, 구르기 기력 -20%.' });
  item('ac_frost', { type: 'acc', grade: 4, name: '서리 심장', fx: { int: 5, vit: 3 }, req: { lv: 22 }, desc: '얼음 회랑 끝에서. 지력 +5, 체력 +3.' });
  item('sw_horn', { type: 'sword', grade: 4, name: '파수꾼의 뿔검', atk: 15, reach: 26, speed: 1.15, heavy: 1.5, col: '#e8dcc0', glow: '#fff0c8', req: { str: 20, lv: 26 }, desc: '미궁의 파수꾼이 부러뜨린 뿔을 벼린 검. 무겁고, 맞은 것은 멀리 날아간다.' });
  item('ac_shadowband', { type: 'acc', grade: 4, name: '그림자 완장', fx: { str: 4, crit: 0.08 }, req: { lv: 28 }, desc: '그림자 투기장의 우승 완장. 힘 +4, 치명타 +8%.' });
  item('ac_core', { type: 'acc', grade: 5, name: '격납고 동력 핵', fx: { str: 3, int: 3, dex: 3, speed: 0.1 }, req: { lv: 36 }, desc: '정거장 격납고 끝에서. 힘 · 지력 · 솜씨 +3, 베는 속도 +10%.' });
  item('ac_echo', { type: 'acc', grade: 3, name: '메아리 방울', fx: { sta: 4, exp: 0.1 }, req: { lv: 14 }, desc: '메아리 순서를 맞힌 자에게. 스태미나 +4, 얻는 빛 +10%.' });
  item('ac_lotus', { type: 'acc', grade: 4, name: '가라앉은 연꽃', fx: { regen: 0.3, int: 3 }, req: { lv: 24 }, desc: '어두운 회랑 바닥에 피어 있던 꽃. 체력이 조금씩 차고, 지력 +3.' });
  item('ac_trial', { type: 'acc', grade: 5, name: '시련의 증표', fx: { str: 5, vit: 5 }, req: { lv: 30 }, desc: '시련의 꼭대기를 버텨 낸 증표. 힘 +5, 체력 +5.' });
  item('ac_grave', { type: 'acc', grade: 5, name: '묘지기의 반지', fx: { vamp: 1, dex: 4 }, req: { lv: 32 }, desc: '무덤 미궁 끝에서. 적을 쓰러뜨리면 체력 조금, 솜씨 +4.' });

  /* ───────── 어둠 속 빛버섯 (빛을 내는 작은 버섯) ───────── */
  class GlowCap extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'glowcap', solid: false, bw: 1, bh: 1 }, o)); this.glowR = o.r || 30; this.glowY = 4; this.col = o.col || '#8affd0'; }
    update(dt) { this.t += dt; this.glowR = (this.r0 || (this.r0 = this.glowR)) * (0.9 + Math.sin(this.t * 2 + this.x) * 0.1); }
    draw(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillStyle = '#e8e0d0'; g.fillRect(x - 1, y - 4, 2, 4); g.fillStyle = this.col; g.fillRect(x - 3, y - 6, 6, 2); g.fillRect(x - 2, y - 7, 4, 1); g.globalAlpha = 0.5; g.fillRect(x - 4, y - 5, 8, 1); g.globalAlpha = 1; }
  }
  const glow = (x, y, col) => ['fn', x, y, { fn: (X, Y, Wd) => Wd.add(new GlowCap({ x: X, y: Y, col })) }];

  /* ───────── 구역 붙이기 ───────── */
  const POS = [[4, 4], [15, 4], [4, 10], [15, 10], [9, 7], [12, 5], [7, 9]];
  const CORNER = [[2, 3], [17, 3], [2, 11], [17, 11]];
  function attach(did, W) {
    const Dn = G.dungeon.DUN[did]; if (!Dn) return;
    const keys = Object.keys(Dn.rooms);
    const P = (k) => (Dn.pos && Dn.pos[k]) || k.split(',').map(Number);
    const maxY = Math.max(...keys.map((k) => P(k)[1]));
    Dn.pos = Dn.pos || {};
    const gy0 = maxY + 1;
    const host = keys.find((k) => (Dn.rooms[k].props || []).some((pr) => pr[0] === 'chest' && pr[3] && pr[3].item === 'key_big')) || keys[0];
    const K = (k) => 'w_' + k;
    for (const r of W.rooms) { Dn.rooms[K(r.k)] = r.R; Dn.pos[K(r.k)] = [r.at[0], gy0 + r.at[1]]; }
    Dn.doors = Dn.doors || [];
    Dn.doors.push([host, K(W.entry), 'open']);
    for (const [a, b, kind, extra] of W.doors) Dn.doors.push([K(a), K(b), kind || 'open', extra]);
    for (const [a, b] of W.merge || []) (Dn.merge = Dn.merge || []).push([K(a), K(b)]);
    Dn.floors = Dn.floors || {};
    for (const r of W.rooms) Dn.floors[K(r.k)] = W.name;
    // 큰 열쇠는 구역 끝으로. 원래 상자에는 다른 것을. (49_dungeons2가 다시 본 던전으로 되돌린다 — 자리를 적어 둔다)
    const hr = Dn.rooms[host];
    const ch = (hr.props || []).find((pr) => pr[0] === 'chest' && pr[3] && pr[3].item === 'key_big');
    Dn.deepHost = host; Dn.deepEntry = K(W.entry); Dn.deepFinal = K(W.final); Dn.deepKeyChest = ch || null;
    const fin = Dn.rooms[K(W.final)];
    fin.props = fin.props || [];
    if (ch) { ch[3] = Object.assign({}, ch[3], { item: W.consolation || 'potion_r', big: false }); fin.props.push(['chest', 7, 5, { item: 'key_big', big: true, hidden: !W.finalOpen }]); }
    fin.props.push(['chest', 12, 5, { item: W.trophy, big: true, hidden: !W.finalOpen, col: '#e8c048' }]);
    // 계단 옆 안내판
    const en = Dn.rooms[K(W.entry)]; en.props = en.props || [];
    if (W.sign) en.props.push(['sign', 9, 11, { text: W.sign }]);
    Dn.wing = W.name;
  }
  const rnd0 = (seed) => U.rng(U.hash(seed));
  const pickN = (arr, n, r) => { const out = []; for (let i = 0; i < n; i++) out.push(arr[Math.floor(r() * arr.length)]); return out; };

  /** 미로: cols × rows 칸, 뱀처럼 이어진 방들. 가운데 방 구석에 작은 열쇠, 마지막 방은 열쇠 문 */
  function maze(did, o) {
    const r = rnd0('maze:' + did);
    const order = [];
    for (let y = 0; y < o.rows; y++) for (let i = 0; i < o.cols; i++) order.push([y % 2 ? o.cols - 1 - i : i, y]);
    const rooms = order.map(([x, y], i) => {
      const last = i === order.length - 1;
      const foes = last ? o.final : pickN(o.foes, o.per || 2, r).map((t, j) => [t, POS[(i + j * 3) % POS.length][0], POS[(i + j * 3) % POS.length][1]]);
      const props = [['pot', CORNER[(i + 1) % 4][0], CORNER[(i + 1) % 4][1]]];
      if (!last && i > 0) { const c = CORNER[(i * 3) % 4]; props.push(['chest', c[0], c[1], { item: i === Math.floor(order.length / 2) ? 'key_small' : U.pick(o.loot || ['potion_r', 'arrows10', 'bombs5'], r()) }]); }
      if (o.stalker && i === Math.floor(order.length / 2)) foes.push([o.stalker, 9, 7, { elite: false }]);
      if (o.glow) for (const c of [[5, 7], [14, 7]]) props.push(glow(c[0], c[1], o.glow));
      return { k: 'r' + i, at: [x, y], R: { shape: 'maze', cell: 3, loops: o.loops || 0.1, dark: o.dark, foes, props, solve: last ? { type: 'clear', msg: '미궁 끝의 상자가 모습을 드러냈다' } : undefined } };
    });
    const doors = [];
    for (let i = 0; i + 1 < order.length; i++) doors.push(['r' + i, 'r' + (i + 1), i + 1 === order.length - 1 ? 'key' : 'open']);
    attach(did, { name: o.name, rooms, doors, entry: 'r0', final: 'r' + (order.length - 1), trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }
  /** 암흑 굴: 빛 없는 넓은 굴 셋. 가운데 굴 바닥이 꺼진다 */
  function darkCave(did, o) {
    const r = rnd0('dark:' + did);
    const rooms = [0, 1, 2].map((i) => {
      const last = i === 2;
      const foes = last ? o.final : pickN(o.foes, o.per || 3, r).map((t, j) => [t, POS[(i * 2 + j) % POS.length][0], POS[(i * 2 + j) % POS.length][1]]);
      const props = [];
      for (const c of [[3, 5], [16, 5], [3, 10], [16, 10], [9, 3]]) if (r() < 0.7) props.push(glow(c[0], c[1], o.glow || '#8affd0'));
      props.push(['torch', 9, 4, { lit: i !== 1 }]);
      const ter = [];
      if (i === 1) { ter.push(['pit', 5, 6, 10, 4], ['floor', 5, 7, 10, 2]); props.push(['crumble', 5, 7, { w: 10, h: 2 }]); }
      if (i === 0) props.push(['pot', 2, 11], ['pot', 17, 11]);
      return { k: 'r' + i, at: [i, 0], R: { shape: 'cavern', rock: 0.45, dark: o.dark, foes, props, ter, solve: last ? { type: 'clear', msg: '굴 깊은 곳에서 무언가 빛났다' } : undefined } };
    });
    attach(did, { name: o.name, rooms, doors: [['r0', 'r1', 'open'], ['r1', 'r2', 'open']], entry: 'r0', final: 'r2', trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }
  /** 시련의 방: 두 칸을 튼 넓은 방에서 파도. 다 이기면 옆방 문이 열린다 */
  function arena(did, o) {
    const flag = did + ':arena';
    const rooms = [
      { k: 'a', at: [0, 0], R: { shape: 'hall', waves: o.waves, ter: o.ter || [], props: [['pot', 2, 3], ['pot', 17, 3]], solve: { type: 'waves', flag, msg: '시련이 끝났다. 안쪽 문이 열린다' } } },
      { k: 'b', at: [1, 0], R: { shape: 'hall', props: [['pot', 2, 11], ['pot', 17, 11]] } },
      { k: 'c', at: [2, 0], R: { shape: o.cshape || 'round', props: [['torch', 4, 4, { lit: true }], ['torch', 15, 4, { lit: true }]] } },
    ];
    attach(did, { name: o.name, rooms, doors: [['a', 'b', 'open'], ['b', 'c', 'switch', flag]], merge: [['a', 'b']], entry: 'a', final: 'c', finalOpen: true, trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }
  /** 순서의 방: 글귀대로 발판 → 블록 → 더 긴 글귀. 틀리면 벌 */
  function order(did, o) {
    const f1 = did + ':ord1', f2 = did + ':ord2';
    const seqProps = (list, spots) => list.map((g, n) => ['seq', spots[n][0], spots[n][1], { n, glyph: g }]);
    const spots4 = [[14, 9], [4, 5], [15, 4], [5, 10]];
    const spots6 = [[9, 4], [15, 10], [4, 8], [15, 5], [9, 10], [4, 4]];
    const rooms = [
      { k: 'a', at: [0, 0], R: { shape: 'rect', props: [['sign', 9, 3, { text: o.riddle1 }], ...seqProps(o.seq1, spots4), ['spikes', 8, 7, { w: 4, h: 1, period: 1.8 }]], punish: o.punish, solve: { type: 'order', flag: f1, msg: '발판이 모두 빛났다. 문이 열린다' } } },
      { k: 'b', at: [1, 0], R: { shape: 'rect', props: [['block', 6, 5], ['block', 13, 5], ['plate', 6, 9], ['plate', 13, 9], ['spikes', 2, 7, { w: 3, h: 1, period: 1.4 }], ['spikes', 15, 7, { w: 3, h: 1, period: 1.4, phase: 0.7 }], ['sign', 9, 3, { text: '「무거운 것은 제자리를 안다.」' }]], foes: o.bfoes, solve: { type: 'plates', flag: f2, msg: '돌이 제자리를 찾았다' } } },
      { k: 'c', at: [2, 0], R: { shape: 'rect', props: [['sign', 9, 3, { text: o.riddle2 }], ...seqProps(o.seq2, spots6), ['spikes', 2, 6, { w: 1, h: 3, period: 1.2 }], ['spikes', 17, 6, { w: 1, h: 3, period: 1.2, phase: 0.6 }]], punish: o.punish, solve: { type: 'order', msg: '마지막 발판이 울렸다' } } },
    ];
    attach(did, { name: o.name, rooms, doors: [['a', 'b', 'switch', f1], ['b', 'c', 'switch', f2]], entry: 'a', final: 'c', trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }
  /** 무너지는 길: 구덩이 위 금 간 다리, 양옆에서 쏘는 적 */
  function gauntlet(did, o) {
    const rooms = [0, 1, 2].map((i) => {
      const last = i === 2;
      const ter = last ? [] : [['pit', 2, 4, 16, 8], ['floor', 2, 7, 16, 2]];
      const props = last ? [] : [['crumble', 3, 7, { w: 14, h: 2 }], ['spikes', 9, 7, { w: 2, h: 2, period: 1.6, phase: i * 0.5 }]];
      const foes = last ? o.final : o.shooters.map((t, j) => [t, j % 2 ? 16 : 3, j < 2 ? 3 : 12]);
      return { k: 'r' + i, at: [i, 0], R: { floor: o.floor, ter, props, foes, shape: last ? 'round' : 'rect', solve: last ? { type: 'clear', msg: '길 끝의 상자가 드러났다' } : undefined } };
    });
    attach(did, { name: o.name, rooms, doors: [['r0', 'r1', 'open'], ['r1', 'r2', 'open']], entry: 'r0', final: 'r2', trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }
  /** 얼음 회랑: 미끄러운 바닥, 가시, 구덩이 */
  function iceHall(did, o) {
    const r = rnd0('ice:' + did);
    const rooms = [0, 1, 2].map((i) => {
      const last = i === 2;
      const ter = [['ice', 2, 3, 16, 9]];
      if (!last) ter.push(['pit', 6 + i * 2, 5, 2, 2], ['pit', 12 - i, 9, 2, 2]);
      const props = last ? [] : [['spikes', 3, 7, { w: 2, h: 1, period: 1.5 }], ['spikes', 15, 7, { w: 2, h: 1, period: 1.5, phase: 0.75 }], ['block', 9, 5]];
      const foes = last ? o.final : pickN(o.foes, 3, r).map((t, j) => [t, POS[(i + j * 2) % POS.length][0], POS[(i + j * 2) % POS.length][1]]);
      return { k: 'r' + i, at: [i, 0], R: { shape: 'rect', ter, props, foes, dark: o.dark, solve: last ? { type: 'clear', msg: '얼음이 갈라지며 상자가 나타났다' } : undefined } };
    });
    attach(did, { name: o.name, rooms, doors: [['r0', 'r1', 'open'], ['r1', 'r2', 'open']], entry: 'r0', final: 'r2', trophy: o.trophy, sign: o.sign, consolation: o.consolation });
  }

  /* ═════════ 던전마다 ═════════ */
  maze('d1', { name: '뿌리 미궁', cols: 2, rows: 2, foes: ['slime', 'spider', 'plant', 'bat'], loot: ['potion_r', 'arrows10'], final: [['boar', 9, 7, { elite: ['rage'] }], ['spider', 5, 5], ['spider', 14, 5]], trophy: 'ac_root',
    sign: '「뿌리는 서로 이어져 있다. 길을 잃으면 한 손을 벽에 대고 걸어라.」 — 누군가 새긴 글' });
  darkCave('d2', { name: '무너진 갱도', dark: 0.9, foes: ['bat', 'shroom', 'bomber', 'spider'], final: [['golem', 9, 7, { elite: ['ward'] }], ['shroom', 4, 4], ['shroom', 15, 4], ['bat', 9, 4]], trophy: 'ac_minelamp',
    sign: '광부 경고문.\n「이 아래는 버려진 갱도. 불빛 없이 들어가지 말 것. 바닥이 갈라진 곳은 절대 오래 서 있지 말 것.」' });
  arena('d3', { name: '물이 차는 방', trophy: 'ac_tide', ter: [['water', 2, 3, 3, 3], ['water', 15, 10, 3, 2]],
    waves: [[['crab', 5, 5], ['crab', 14, 9], ['spider', 9, 4]], [['bandit', 4, 9], ['bandit', 15, 4], ['skel', 9, 10], ['spider', 12, 6]], [['crab', 9, 7, { elite: true }], ['skel', 4, 4], ['skel', 15, 10], ['spider', 6, 10], ['spider', 13, 4]]],
    sign: '벽에 조개껍질로 박은 글자.\n「물이 찰 때까지 버텨라. 그러면 바다가 문을 열어 준다.」' });
  order('d4', { name: '해와 달의 방', trophy: 'ac_sun', seq1: ['해', '달', '별', '눈'], seq2: ['물', '잎', '해', '불', '종', '눈'],
    riddle1: '「해가 지면 달이 뜨고, 달이 기울면 별이 뜨고, 별 아래에서 눈을 뜬다.」',
    riddle2: '「물을 주면 잎이 자라고, 잎은 해를 향하고, 해는 불을 낳고, 불이 꺼지면 종이 울리고, 종소리에 눈을 뜬다.」',
    punish: [['scorp', 4, 10], ['skel', 15, 10]], bfoes: [['scorp', 9, 11]],
    sign: '피라미드 안쪽의 안쪽. 바닥에 그림 글자가 새겨진 발판들. 「순서를 모르는 자는 모래가 된다.」' });
  maze('d5', { name: '거울 미궁', cols: 2, rows: 2, dark: 0.55, glow: '#d8b0ff', foes: ['assassin', 'mage', 'ghost', 'eye'], final: [['assassin', 9, 7, { elite: ['blink'] }], ['eye', 5, 4], ['eye', 14, 4]], trophy: 'ac_mirror',
    sign: '「이 미궁의 벽은 모두 거울이었다. 지금은 깨져서, 네 얼굴이 조각조각 따라온다.」' });
  gauntlet('d6', { name: '무너지는 구름길', floor: T.CLOUD, shooters: ['turret', 'eye', 'turret', 'eye'], final: [['lancer', 9, 7, { elite: ['haste'] }], ['priest', 4, 4], ['eye', 15, 4]], trophy: 'ac_cloud',
    sign: '「구름은 오래 밟으면 꺼진다. 멈추지 마라.」' });
  iceHall('d7', { name: '얼음 회랑', foes: ['skel', 'icewisp', 'wraith', 'berserk'], final: [['cgolem', 9, 6, { elite: ['frost'] }], ['skel', 4, 4], ['skel', 15, 4]], trophy: 'ac_frost', dark: 0.4,
    sign: '「서리 무덤의 더 아래. 얼음 위에서 싸우는 자는 두 번 넘어진다.」' });
  maze('d8', { name: '파수꾼의 미궁', cols: 3, rows: 2, dark: 0.93, glow: '#bfe8ff', foes: ['wraith', 'hollow', 'drone', 'skel'], stalker: 'mino', final: [['mino', 9, 7, { elite: false }], ['wraith', 4, 4], ['wraith', 15, 10]], trophy: 'sw_horn',
    sign: '은빛 왕국 기록 제612-3호.\n「광맥 가장 깊은 곳에 미궁을 파고 파수꾼을 두었다. 파수꾼은 벽에 부딪혀야 멈춘다. 벽 가까이 서라.」' });
  arena('d9', { name: '그림자 투기장', trophy: 'ac_shadowband', cshape: 'hall',
    waves: [[['assassin', 5, 5], ['assassin', 14, 9], ['skel', 9, 4], ['skel', 9, 10]], [['summoner', 16, 4], ['priest', 3, 10], ['berserk', 9, 7], ['berserk', 13, 5]], [['assassin', 9, 7, { elite: true }], ['lancer', 4, 4], ['lancer', 15, 10], ['priest', 16, 4]], [['berserk', 9, 7, { elite: ['rage', 'vamp'] }], ['summoner', 4, 10], ['wraith', 15, 4], ['wraith', 4, 4]]],
    sign: '「녹턴의 성 지하 투기장. 그림자들이 주인 없이 16년을 싸웠다. 마지막까지 선 자가 문을 연다.」' });
  arena('d11', { name: '격납고', trophy: 'ac_core', cshape: 'rect',
    waves: [[['drone', 5, 5], ['drone', 14, 5], ['drone', 9, 10], ['sniper', 16, 11]], [['sniper', 3, 3], ['sniper', 16, 11], ['eye', 9, 5], ['eye', 12, 9]], [['cgolem', 9, 7, { elite: true }], ['drone', 4, 4], ['drone', 15, 10], ['sniper', 16, 3]]],
    sign: '「격납고 — 방위 체계 시험장. 경고: 시험은 아직 끝나지 않았습니다.」 (스텔라의 목소리가 녹음되어 있다)' });
  order('d12', { name: '메아리 순서', trophy: 'ac_echo', seq1: ['종', '물', '잎', '해'], seq2: ['눈', '별', '달', '해', '불', '종'],
    riddle1: '「종이 울리면 물이 떨고, 떨린 물에 잎이 지고, 진 잎 위로 해가 든다.」 — 메아리 돌에 새긴 글',
    riddle2: '「눈을 감으면 별이 보이고, 별이 지면 달이, 달이 지면 해가, 해가 타면 불이, 불이 다하면 — 종.」',
    punish: [['scorp', 4, 10], ['berserk', 15, 10]], bfoes: [['spider', 9, 11]],
    sign: '협곡 안쪽의 방. 벽이 목소리를 따라 한다. 발판마다 그림 글자.' });
  darkCave('d13', { name: '가라앉은 회랑', dark: 0.92, glow: '#8ad8ff', foes: ['wraith', 'spider', 'ghost', 'shroom'], final: [['wraith', 9, 7, { elite: ['regen'] }], ['spider', 4, 4], ['spider', 15, 4], ['wraith', 9, 11]], trophy: 'ac_lotus',
    sign: '「물에 잠긴 회랑. 불빛이 닿지 않는 곳에선 무언가 헤엄친다. 공기 속에서.」' });
  arena('d14', { name: '시련의 꼭대기', trophy: 'ac_trial', cshape: 'round',
    waves: [[['lancer', 5, 5], ['lancer', 14, 9], ['priest', 16, 4]], [['sniper', 3, 3], ['berserk', 9, 7], ['berserk', 12, 5], ['priest', 16, 11]], [['assassin', 5, 9], ['assassin', 14, 5], ['summoner', 9, 4], ['lancer', 9, 10, { elite: true }]], [['berserk', 9, 7, { elite: ['ward', 'rage'] }], ['sniper', 16, 3], ['priest', 3, 11], ['eye', 9, 4]]],
    sign: '「뒤집어 세운 징수탑의 꼭대기. 여기서 버틴 빛만 아래로 내려간다.」' });
  maze('d15', { name: '무덤 미궁', cols: 3, rows: 2, dark: 0.9, glow: '#c49bff', foes: ['wraith', 'skel', 'hollow', 'assassin'], stalker: 'mino', final: [['summoner', 9, 7, { elite: ['summon', 'ward'] }], ['skel', 4, 4], ['skel', 15, 10]], trophy: 'ac_grave',
    sign: '「장부에서 지워진 사람들의 묘. 이름이 없으니 길도 없다.」' });

  /* ───────── 이미 있던 방들: 무리마다 한 마리씩 더 ───────── */
  for (const did of Object.keys(G.dungeon.DUN)) {
    const Dn = G.dungeon.DUN[did];
    for (const k of Object.keys(Dn.rooms)) {
      if (k.startsWith('w_')) continue;
      const R = Dn.rooms[k];
      if (R.boss || !R.foes || R.foes.length < 2) continue;
      const src = R.foes[R.foes.length - 1];
      if (!src || src[3]) continue;
      const nx = U.clamp(19 - src[1], 3, 16), ny = U.clamp(src[2] + (src[2] < 7 ? 2 : -2), 3, 11);
      R.foes = R.foes.concat([[R.foes[0][0], nx, ny]]);
    }
  }
})();
