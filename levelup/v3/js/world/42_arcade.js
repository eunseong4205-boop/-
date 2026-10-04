/* 오락기 — 「무한으로 렙업하기」에 바치는 자리, 그리고 마을마다 다른 오락기
   · 열두 마을 광장 곁(+ 하늘 정거장)에 오락기. 마을의 빛깔 등급만큼 난이도(★)가 오르고, 동전 값 · 상금 · 메달 점수도 오른다
   · 게임 여덟: 무한으로 렙업하기 · 몬스터 두더지 · 수정 지키기(많이 잡기, 1분) / 동전 러시 · 별똥비 버티기 · 깃발 달리기 · 챔피언 도전 · 기억의 발판
   · 오락기 속에서도 맞으면 진짜로 다친다(많이 잡는 게임은 절반). 체력이 ¼칸만 남으면 그 자리에서 게임 오버 — 쓰러짐의 대가는 없다
   · 기록마다 메달(동 · 은 · 금): 렙업하기는 예전처럼 골드 · 옛 오락기 열쇠 · 렙업 머리띠, 나머지는 골드 · 능력 포인트 · 그 게임의 장신구
   그리고 책장 몇 곳: 「무한으로 렙업하기」 · 「무한으로 렙업하자!!」를 이 대륙의 옛 전설로 읽는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const I = G.data.ITEMS;
  const sfx = (n) => G.audio && G.audio.sfx(n);
  I.ac_lvband = { id: 'ac_lvband', type: 'acc', grade: 4, name: '렙업 머리띠', fx: { exp: 0.25, speed: 0.08 }, price: 0, desc: '옛 오락기 최고 기록의 상. 얻는 빛 알갱이 +25%, 베는 속도 +8%. 이마에 「무한」.' };
  const acc = (id, grade, name, fx, desc) => { I[id] = { id, type: 'acc', grade, name, fx, price: 0, desc }; };
  acc('ac_mallet', 3, '뿅망치 부적', { crit: 0.06, speed: 0.05 }, '몬스터 두더지 금메달. 치명타 +6%, 베는 속도 +5%.');
  acc('ac_guardgem', 3, '수호 수정', { regen: 0.6, stamina: 15 }, '수정 지키기 금메달. 가만히 있으면 체력이 조금씩, 기력 +15.');
  acc('ac_coinpurse', 3, '황금 동전 지갑', { gold: 0.3 }, '동전 러시 금메달. 떨어뜨리는 골드 +30%.');
  acc('ac_starcloak', 3, '별똥 망토 조각', { roll: 0.25, stamina: 10 }, '별똥비 버티기 금메달. 구르기 기력 -25%, 기력 +10.');
  acc('ac_champbelt', 3, '챔피언 벨트', { str: 2, vit: 3 }, '챔피언 도전 금메달. 힘 +2, 체력 +3.');
  acc('ac_runband', 3, '깃발 달리기 띠', { stamina: 25, roll: 0.15 }, '깃발 달리기 금메달. 기력 +25, 구르기 기력 -15%.');
  acc('ac_memring', 3, '기억의 고리', { int: 3, special: 0.15 }, '기억의 발판 금메달. 지혜 +3, 필살 게이지 +15%.');
  acc('ac_snare', 3, '도둑 잡이 방울', { speed: 0.06, gold: 0.15 }, '호박 오락기 「도둑 잡기」 금메달. 베는 속도 +6%, 골드 +15%.');
  acc('ac_balloon', 4, '무지개 풍선 매듭', { crit: 0.08, special: 0.1 }, '무지개 오락기 「색깔 풍선」 금메달. 치명타 +8%, 필살 게이지 +10%.');
  acc('ac_firefly', 4, '반딧불 병', { regen: 0.5, int: 2, mpRegen: 0.5 }, '안개 오락기 「안개 속 사냥」 금메달. 가만히 있으면 체력이 조금씩, 지혜 +2.');
  acc('ac_shepherd', 4, '양치기 피리', { stamina: 25, vit: 3, roll: 0.1 }, '알록달록 오락기 「몬스터 몰이」 금메달. 기력 +25, 체력 +3, 구르기 기력 -10%.');
  acc('ac_giantslayer', 5, '거인 사냥꾼의 증표', { str: 3, crit: 0.06, special: 0.15 }, '별빛 오락기 「거인 사냥」 금메달. 힘 +3, 치명타 +6%, 필살 게이지 +15%.');
  acc('ac_arcking', 4, '오락실의 왕관', { exp: 0.15, gold: 0.15, crit: 0.05 }, '열세 오락기 모두 금메달. 빛 알갱이 · 골드 +15%, 치명타 +5%. 작은 화면 속 영웅의 왕관.');

  /* ───────── 오락기가 놓인 곳: 마을 빛깔 등급 = 난이도 ★ ───────── */
  /* 오락기마다 게임 하나 — 열세 곳 모두 다른 게임 */
  const CABS = {
    green: { D: 0, at: [6, 2], game: 'lvup' },
    red: { D: 1, at: [6, 2], game: 'mole' },
    blue: { D: 2, at: [6, 2], game: 'coins' },
    amber: { D: 3, at: [6, 2], game: 'thief' },
    yellow: { D: 3, at: [6, 2], game: 'rain' },
    purple: { D: 4, at: [6, 2], game: 'simon' },
    rainbow: { D: 5, at: [-6, 4], game: 'balloon' },
    white: { D: 6, at: [6, 2], game: 'flags' },
    mist: { D: 6, at: [6, 2], game: 'dark' },
    gray: { D: 7, at: [6, 2], game: 'defend' },
    black: { D: 8, at: [6, 2], game: 'champ' },
    colorful: { D: 9, at: [5, 3], game: 'herd' },
    station: { D: 10, game: 'giant', name: '별빛 오락기' },
  };
  const ALL = Object.values(CABS).map((K) => K.game);
  const TOWN_OF = {}; for (const [t, K] of Object.entries(CABS)) TOWN_OF[K.game] = t;
  /* 오락기마다 다른 몬스터(그 지역 들판의 몬스터로) · 다른 경품
     mobs: 초반 · 중반 · 후반 무리 / champ: 챔피언 도전 / chase: 동전 러시의 쫓는 것 / mole: 두더지 / seek: 수정을 노리는 것 / theme: 부제
     prize: 이 오락기의 동 · 은 · 금메달 보상(★가 높을수록 값지다) — ['gold', n] 골드 · ['pts', n] 능력 포인트 · 그 밖은 물건
     pool: 판마다 경품 뽑기(성적에 따라 확률) [아이템, 개수, 무게] */
  const ROSTER = {
    green: { theme: '젤리 들판', mobs: [['slime', 'slime', 'bat'], ['slime', 'bat', 'boar', 'plant'], ['boar', 'bigslime', 'bat']], champ: ['boar', 'bigslime', 'plant'], chase: 'wisp', mole: 'slime', seek: ['slime', 'slime', 'bat', 'boar'],
      prize: [[['gold', 500]], [['key_origin', 1]], [['ac_lvband', 1]]], pool: [['potion_r', 1, 3], ['food_corn', 2, 2], ['arrows10', 1, 1]] },
    red: { theme: '불꽃 고개', mobs: [['slime', 'bat', 'wisp'], ['boar', 'bat', 'wisp', 'bomber'], ['boar', 'bomber', 'bandit', 'golem']], champ: ['boar', 'bandit', 'bomber', 'golem'], chase: 'wisp', mole: 'slime', seek: ['boar', 'bat', 'wisp'],
      prize: [[['potion_r', 4], ['food_tteok', 2]], [['ac_shell', 1], ['pts', 1]], [['ac_mallet', 1], ['gold', 350]]], pool: [['potion_r', 1, 3], ['food_tteok', 1, 2], ['bombs5', 1, 1]] },
    blue: { theme: '파도 해변', mobs: [['slime', 'slime', 'bat'], ['crab', 'slime', 'bandit', 'plant'], ['crab', 'bandit', 'bigslime']], champ: ['crab', 'bandit', 'bigslime'], chase: 'ghost', mole: 'crab', seek: ['crab', 'slime', 'crab', 'bigslime'],
      prize: [[['potion_b', 3], ['food_udon', 2]], [['ac_roll', 1], ['pts', 1]], [['ac_coinpurse', 1], ['gold', 500]]], pool: [['potion_b', 1, 3], ['food_udon', 1, 2], ['arrows10', 1, 1], ['m_pearl', 2, 1]] },
    amber: { theme: '단풍 협곡', mobs: [['bat', 'slime', 'boar'], ['boar', 'bandit', 'wolf'], ['wolf', 'golem', 'bandit']], champ: ['bandit', 'wolf', 'golem'], chase: 'wisp', mole: 'worm', seek: ['boar', 'bat', 'wolf'],
      prize: [[['bombs5', 2], ['potion_r', 3]], [['ac_thief', 1], ['pts', 1]], [['ac_snare', 1], ['gold', 650]]], pool: [['potion_r', 2, 2], ['potion_b', 1, 2], ['bombs5', 1, 1], ['m_hide', 3, 1]] },
    yellow: { theme: '황금 사막', mobs: [['bat', 'slime', 'wisp'], ['bandit', 'wisp', 'crab'], ['wolf', 'turret', 'bandit', 'crab']], champ: ['bandit', 'crab', 'wolf', 'golem'], chase: 'wisp', mole: 'worm', seek: ['crab', 'bandit', 'bat'],
      prize: [[['potion_b', 2], ['m_sand', 5]], [['ac_ring_crit', 1], ['pts', 1]], [['ac_starcloak', 1], ['gold', 650]]], pool: [['potion_b', 1, 3], ['m_sand', 3, 2], ['arrows10', 1, 1]] },
    purple: { theme: '가시 숲', mobs: [['bug', 'plant', 'bug'], ['ghost', 'plant', 'bigslime'], ['mage', 'wolf', 'ghost']], champ: ['bigslime', 'ghost', 'wolf', 'mage'], chase: 'ghost', mole: 'bug', seek: ['bug', 'ghost', 'bigslime'],
      prize: [[['potion_g', 1], ['m_dust', 5]], [['ac_mp', 1], ['pts', 1]], [['ac_memring', 1], ['gold', 800]]], pool: [['potion_b', 1, 2], ['potion_g', 1, 2], ['m_dust', 2, 1]] },
    rainbow: { theme: '무지개 축제', mobs: [['bug', 'bat', 'wisp'], ['bug', 'bigslime', 'wisp'], ['bigslime', 'bug', 'mage', 'wisp']], champ: ['bigslime', 'bug', 'wolf', 'mage'], chase: 'wisp', mole: 'bug', seek: ['bug', 'bat', 'bigslime'],
      prize: [[['food_cotton', 5], ['potion_g', 1]], [['ac_combo', 1], ['pts', 1]], [['ac_balloon', 1], ['gold', 950]]], pool: [['food_cotton', 2, 3], ['potion_g', 1, 2], ['m_star', 2, 1]] },
    white: { theme: '눈의 성지', mobs: [['slime', 'icewisp', 'bat'], ['wolf', 'icewisp', 'golem'], ['golem', 'hollow', 'wolf', 'icewisp']], champ: ['wolf', 'hollow', 'golem'], chase: 'icewisp', mole: 'icewisp', seek: ['wolf', 'icewisp', 'golem'],
      prize: [[['food_bread', 3], ['potion_g', 1]], [['ac_clock', 1], ['pts', 1]], [['ac_runband', 1], ['gold', 1100]]], pool: [['food_bread', 1, 3], ['potion_g', 1, 2], ['m_ice', 3, 1]] },
    mist: { theme: '안개 늪', mobs: [['bug', 'plant', 'bug'], ['ghost', 'wisp', 'bigslime'], ['ghost', 'plant', 'bigslime', 'bug']], champ: ['bigslime', 'bug', 'plant', 'ghost'], chase: 'ghost', mole: 'bug', seek: ['bug', 'bigslime', 'wisp'],
      prize: [[['lily', 3], ['potion_max', 1]], [['ac_sage', 1], ['pts', 1]], [['ac_firefly', 1], ['gold', 1100]]], pool: [['lily', 1, 3], ['potion_g', 1, 2], ['m_spore', 2, 1]] },
    gray: { theme: '잿빛 공장', mobs: [['bat', 'drone', 'slime'], ['drone', 'bomber', 'turret', 'hollow'], ['golem', 'hollow', 'bomber', 'drone']], champ: ['drone', 'bomber', 'hollow', 'golem'], chase: 'drone', mole: 'drone', seek: ['drone', 'golem', 'hollow'],
      prize: [[['m_gear', 8], ['potion_max', 1]], [['ac_tri', 1], ['pts', 1]], [['ac_guardgem', 1], ['gold', 1250]]], pool: [['potion_g', 1, 3], ['m_gear', 3, 2], ['bombs5', 1, 1]] },
    black: { theme: '영원한 밤', mobs: [['bat', 'ghost', 'bat'], ['ghost', 'hollow', 'shade'], ['knight', 'shade', 'hollow', 'ghost']], champ: ['hollow', 'ghost', 'shade', 'knight'], chase: 'shade', mole: 'ghost', seek: ['ghost', 'hollow', 'shade'],
      prize: [[['shade_core', 2], ['potion_max', 2]], [['ac_berserk', 1], ['pts', 2]], [['ac_champbelt', 1], ['gold', 1400]]], pool: [['potion_g', 1, 3], ['shade_core', 1, 2], ['potion_max', 1, 1]] },
    colorful: { theme: '알록달록 공방', mobs: [['slime', 'drone', 'bat'], ['drone', 'mage', 'knight', 'bomber'], ['shade', 'knight', 'golem', 'mage']], champ: ['mage', 'hollow', 'knight', 'shade', 'golem'], chase: 'drone', mole: 'drone', seek: ['drone', 'slime', 'golem'],
      prize: [[['m_crystal', 6], ['potion_max', 2]], [['ac_vamp', 1], ['pts', 2]], [['ac_shepherd', 1], ['gold', 1550]]], pool: [['potion_g', 2, 3], ['potion_max', 1, 2], ['m_crystal', 2, 1]] },
    station: { theme: '별빛 격납고', mobs: [['drone', 'bat', 'icewisp'], ['drone', 'turret', 'shade'], ['golem', 'shade', 'knight', 'drone']], champ: ['drone', 'mage', 'shade', 'knight', 'golem'], chase: 'shade', mole: 'drone', seek: ['drone', 'golem', 'shade'],
      prize: [[['potion_max', 3], ['fairy', 1]], [['ac_chime', 1], ['pts', 2]], [['ac_giantslayer', 1], ['gold', 1700]]], pool: [['potion_max', 1, 3], ['m_star', 3, 2], ['fairy', 1, 1]] },
  };
  /** 성적의 기준 점수: 어려운 오락기일수록 낮춘다 (같은 솜씨면 같은 성적) */
  const parAt = (Gm, D) => Gm.par * (1 - 0.04 * Math.min(10, D));
  const itemName = (id, n) => ((G.data.ITEMS[id] && G.data.ITEMS[id].name) || id) + (n > 1 ? ' ×' + n : '');
  const FOE_NAME = (t) => (G.foes.T[t] && G.foes.T[t].name) || t;
  const TOWN_NAME = { green: '그린', red: '레드', blue: '블루', amber: '호박', yellow: '옐로', purple: '퍼플', rainbow: '무지개', white: '화이트', mist: '안개', gray: '그레이', black: '블랙', colorful: '알록달록', station: '하늘 정거장' };
  const cabName = (k) => CABS[k].name || (TOWN_NAME[k] || k) + ' 오락기';
  const costOf = (D) => 10 + D * 15;
  /** 오락기 등급에 맞는 레벨: 이보다 한참 높으면 빛 알갱이 상금이 줄어든다 */
  const EXP_LV = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 45];
  const STARS = (D) => '★' + D;

  /* ───────── 오락기 그림: 난이도 무리마다 빛깔 ───────── */
  const PALS = [
    { body: '#3a2a5a', face: '#5a3a8a', top: '#ffcc4a', top2: '#ff8a3a' },   // ★0~2
    { body: '#1a3a4a', face: '#2a6a7a', top: '#8ae8ff', top2: '#3ab8d8' },   // ★3~5
    { body: '#4a1a2a', face: '#8a2a3a', top: '#ff9a8a', top2: '#d83a4a' },   // ★6~8
    { body: '#14101c', face: '#2a2238', top: '#ffe066', top2: '#e8a020' },   // ★9~10
  ];
  const palOf = (D) => PALS[D >= 9 ? 3 : D >= 6 ? 2 : D >= 3 ? 1 : 0];
  const cabImg = {};
  function cabinet(D) {
    const P = palOf(D), key = P.body;
    if (cabImg[key]) return cabImg[key];
    const X = G.gfx, b = X.brush(18, 28);
    b.rect(2, 4, 14, 22, P.body); b.rect(3, 5, 12, 20, P.face); b.rect(4, 7, 10, 8, '#0b0914');
    b.rect(5, 8, 8, 6, '#1a3a2a'); b.px(6, 12, '#6ae07a'); b.px(7, 12, '#6ae07a'); b.px(10, 10, '#ffe066'); b.px(11, 11, '#ff6a8a');
    b.rect(4, 17, 10, 3, '#2a1a3a'); b.px(6, 18, '#ff4a4a'); b.px(10, 18, '#4ab8ff'); b.px(12, 18, '#ffe066');
    b.rect(2, 1, 14, 4, P.top); b.rect(3, 2, 12, 2, P.top2); b.rect(3, 26, 12, 2, '#2a1a3a');
    cabImg[key] = X.outline(b.put(), '#0b0914');
    return cabImg[key];
  }
  class Arcade extends G.props.Prop {
    constructor(o) { super(Object.assign({ bw: 14, bh: 8, shadowW: 8, town: 'green' }, o)); this.D = (CABS[this.town] || CABS.green).D; }
    canUse() { return true; }
    get label() { return '오락기 (' + STARS(this.D) + ')'; }
    use() { G.script.run(async (c) => menu(c, this)); }
    update(dt) { this.t += dt; }
    draw(g, cx, cy) {
      const im = cabinet(this.D); this.drawImg(g, cx, cy, im, 1);
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 20);
      if (Math.floor(this.t * 3) % 2) { g.fillStyle = 'rgba(106,224,122,0.35)'; g.fillRect(x - 4, y, 8, 6); }
      // 난이도 별: 오락기 머리 위 작은 점
      const n = Math.min(10, this.D); g.fillStyle = palOf(this.D).top;
      for (let i = 0; i < n; i++) g.fillRect(x - 9 + (i % 5) * 4, y - 12 - Math.floor(i / 5) * 3, 2, 2);
      if (Math.random() < 0.05) G.fx.part({ x: this.x + (Math.random() - 0.5) * 8, y: this.y - 18, z: 10, vz: 12, g: 0, life: 0.5, col: '#ffe066', size: 1, glow: true });
    }
  }

  /* ───────── 기록 · 메달 ───────── */
  const best = (gid) => (gid === 'lvup' ? S().flags.arcade_best || 0 : S().flags['arc:best:' + gid] || 0);
  const bestAt = (gid, town) => S().flags['arc:best:' + gid + ':' + town] || 0;
  const MEDAL_FLAG = (gid, k) => (gid === 'lvup' ? ['arcade:20', 'arcade:40', 'arcade:60'][k] : 'arc:' + gid + ':' + (k + 1));
  const medalsOf = (gid) => [0, 1, 2].filter((k) => f(MEDAL_FLAG(gid, k))).length;
  const MEDAL_NAME = ['동', '은', '금'];
  /** 보상 한 줄: 골드 · 능력 포인트 · 물건 */
  const prizeText = (list) => list.map(([id, n]) => (id === 'gold' ? n + '골드' : id === 'pts' ? '능력 포인트 +' + n : itemName(id, n))).join(' + ');
  async function givePrize(c, list) {
    for (const [id, n] of list) {
      if (id === 'gold') { c.gold(n); await c.narr('[y]' + n + '골드[/]'); }
      else if (id === 'pts') { S().pts = (S().pts || 0) + n; await c.narr('몸 안의 빛이 단단해진다. [y]능력 포인트 +' + n + '[/]'); }
      else await c.getItem(id, n);
    }
  }

  async function menu(c, cab) {
    const s = S(), K = CABS[cab.town] || CABS.green, D = K.D, cost = costOf(D);
    const RS = ROSTER[cab.town] || ROSTER.green, gid = K.game, Gm = GAMES[gid];
    const mobs = [...new Set(RS.mobs.flat())].map(FOE_NAME).join(' · ');
    const md = medalsOf(gid), b = best(gid);
    await c.narr('[y]' + cabName(cab.town) + '[/] 「' + RS.theme + '」 — 난이도 [r]' + STARS(D) + '[/] · 동전 ' + cost + '골드\n이 오락기의 게임: [y]「' + Gm.name + '」[/] (' + Gm.time + '초)' + (md ? ' ' + '●'.repeat(md) : '') + (b ? ' · 최고 ' + Gm.fmt(b) : '') + '\n나오는 몬스터: ' + mobs);
    for (;;) {
      const k = await c.choice('어떻게 할까?', ['동전을 넣는다 (' + cost + '골드)', '규칙 보기', '이 오락기의 보상', '모든 오락기 메달', '그만둔다']);
      if (k === 1) { await rules(c, Gm, D); continue; }
      if (k === 2) { await showPrize(c, cab.town); continue; }
      if (k === 3) { await showMedals(c); continue; }
      if (k !== 0) return;
      if (s.hp <= 1) { await c.narr('[r]몸이 너무 지쳤다. 체력을 채우고 오자.[/]'); continue; }
      if (s.gold < cost) { await c.narr('동전이 모자라다.'); continue; }
      s.gold -= cost;
      s.arcadeRet = { map: W().map.id, x: cab.x, y: cab.y + 18 };
      s.arcadeRun = { g: gid, town: cab.town, D };
      c.sfx('coin'); await c.wait(0.2);
      await c.fade(true, { sec: 0.3 });
      const st = Gm.start || [9, 8];
      G.game.goto('arcade_room', px(st[0]), py(st[1]), 'up');
      await c.fade(false, { sec: 0.3 });
      return;
    }
  }
  async function rules(c, Gm, D) {
    const ms = Gm.medals.map((v, i) => MEDAL_NAME[i] + ' ' + Gm.fmt(v)).join(' · ');
    await c.narr('[y]「' + Gm.name + '」[/] ' + Gm.time + '초 · ' + STARS(D) + '\n' + Gm.how + '\n' + (Gm.dmg < 1 ? '[s]맞으면 다친다 — 많이 잡는 게임이라 피해는 절반.[/]' : '[r]맞으면 그대로 다친다.[/]') + ' 체력이 ¼칸만 남으면 게임 오버.\n[s]메달: ' + ms + '[/]');
  }
  async function showPrize(c, town) {
    const RS = ROSTER[town] || ROSTER.green, K = CABS[town] || CABS.green, Gm = GAMES[K.game];
    const lines = RS.prize.map((list, k) => (f(MEDAL_FLAG(K.game, k)) ? '[s]✓ ' : '[y]') + MEDAL_NAME[k] + '메달[/] ' + Gm.fmt(Gm.medals[k]) + ' — ' + prizeText(list));
    const tot = RS.pool.reduce((a, q) => a + q[2], 0);
    const pool = RS.pool.map(([id, n, w]) => itemName(id, n) + ' ' + Math.round(w / tot * 100) + '%').join(' · ');
    await c.narr(cabName(town) + ' 보상 (' + STARS(K.D) + ')\n' + lines.join('\n'));
    await c.narr('판마다: 성적만큼 골드 · 빛 알갱이 + 경품 뽑기\n' + pool + '\n[s]성적이 좋을수록 잘 나오고, 게임 오버면 절반.[/]');
  }
  async function showMedals(c) {
    const lines = ALL.map((gid) => { const Gm = GAMES[gid], md = medalsOf(gid), t = TOWN_OF[gid]; return (md ? '[y]' + '●'.repeat(md) + '[/]' + '○'.repeat(3 - md) : '○○○') + ' ' + (TOWN_NAME[t] || t) + ' ' + STARS(CABS[t].D) + ' 「' + Gm.name + '」' + (best(gid) ? ' 최고 ' + Gm.fmt(best(gid)) : ''); });
    await c.narr('모든 오락기 메달 (1/3)\n' + lines.slice(0, 5).join('\n'));
    await c.narr('모든 오락기 메달 (2/3)\n' + lines.slice(5, 10).join('\n'));
    await c.narr('모든 오락기 메달 (3/3)\n' + lines.slice(10).join('\n') + '\n[s]열세 오락기 모두 금메달이면 「오락실의 왕관」.[/]');
  }

  /* ───────── 오락기 속: 공통 ───────── */
  const FL = { x0: 1, y0: 2, x1: 16, y1: 11 };   // 바닥 칸
  const BX0 = FL.x0 * TS + 10, BX1 = (FL.x1 + 1) * TS - 10, BY0 = FL.y0 * TS + 14, BY1 = (FL.y1 + 1) * TS - 4;   // 바닥 픽셀(여유)
  let RUN = null;
  const foes = () => G.combat.foes();
  const rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  function randSpot(pad, far) {
    const p = W().player;
    for (let i = 0; i < 30; i++) {
      const x = BX0 + pad + rnd() * (BX1 - BX0 - pad * 2), y = BY0 + pad + rnd() * (BY1 - BY0 - pad * 2);
      if (!far || !p || U.dist(x, y, p.x, p.y) > far) return [x, y];
    }
    return [(BX0 + BX1) / 2, (BY0 + BY1) / 2];
  }
  function edgeSpot() {
    const side = Math.floor(rnd() * 4);
    if (side === 0) return [px(2), py(3 + rnd() * 7)];
    if (side === 1) return [px(15), py(3 + rnd() * 7)];
    if (side === 2) return [px(2 + rnd() * 13), py(3)];
    return [px(2 + rnd() * 13), py(10)];
  }
  /** 오락기 몬스터: 경험 · 골드 · 재료를 떨어뜨리지 않는다. 정예는 전리품 없이 */
  function foe(R, type, x, y, o) {
    o = o || {};
    const e = G.foes.spawn(type, x, y, { tier: R.ET, elite: false, hpMul: (o.hpMul || 1) * R.hpMul });
    e.aggro = true; e.arcade = true; e.exp = 0; e.gold = 0; e.mat = null; e.respawn = false;
    if (o.elite && G.foes.makeElite) { G.foes.makeElite(e); e.elite = 'arc'; }
    if (o.ai) { e.ai = o.ai; e.st = 'idle'; e.noContact = false; e.inv = 0; }
    e.atk = Math.max(1, Math.round(e.atk * R.atkMul));
    if (!o.quiet) G.fx.glow(x, y - 6, '#b8a8ff', 8);
    return e;
  }
  function addEnt(R, o) { const e = W().add(new G.ent.Ent(Object.assign({ solid: false, arc: true }, o))); R.ents.push(e); return e; }
  function boom(x, y, r, dmg, col) {
    sfx('explode'); W().shake(3, 0.25); G.fx.sparks(x, y, 18, col || '#ffb84a', 130); G.fx.ring(x, y, col || '#ffe8a8', r, 0.35, 3);
    G.bosses.hitCircle(x, y, r, dmg);
  }
  function float(x, y, t, col, big) { G.fx.float(x, y, t, col || '#ffe066', { big: !!big }); }
  function tone(fq, dur) {
    const A = G.audio; if (!A || !A.ctx || !S().settings.sfx) return;
    try {
      const t = A.ctx.currentTime, o = A.ctx.createOscillator(), gn = A.ctx.createGain();
      o.type = 'square'; o.frequency.value = fq; gn.gain.setValueAtTime(0.05, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(gn); gn.connect(A.ctx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (_) { /* 무시 */ }
  }

  /** HUD 끝: 다음 메달까지 남은 점수 (메달 점수 기준을 지금 오락기 점수로 되돌려) */
  function nextMedal(R) {
    const k = 1, m = R.G.medals.findIndex((v) => Math.round(R.score * k) < v);
    if (m < 0) return ' · 금 ✓';
    return ' · ' + MEDAL_NAME[m] + '까지 ' + Math.max(1, Math.ceil(R.G.medals[m] / k - R.score));
  }
  /* ───────── 게임들 ───────── */
  const GAMES = {};
  function game(id, o) { GAMES[id] = Object.assign({ id, dmg: 1, start: [9, 8], fmt: (v) => String(v) }, o); }
  const AI = G.foes.AI;

  /* 1. 무한으로 렙업하기 — 몰려오는 몬스터를 잡을수록 Lv */
  const LVVAL = { slime: 1, bat: 1, bug: 1, boar: 2, bandit: 2, crab: 2, wisp: 2, icewisp: 2, plant: 2, worm: 2, drone: 2, bigslime: 3, wolf: 3, knight: 3, mage: 3, ghost: 3, bomber: 3, turret: 3, hollow: 3, golem: 4, shade: 4 };
  game('lvup', { name: '무한으로 렙업하기', kind: 'kill', time: 60, dmg: 0.5, par: 160, medals: [80, 150, 240], fmt: (v) => 'Lv.' + v, prizeName: '렙업 머리띠',
    how: '그 마을 들판의 몬스터가 몰려온다. 잡을수록 Lv이 오른다 (약한 것 +1, 보통 +2, 큰 것 · 센 것 +3~4, 정예 +3 더). 시간이 갈수록 빨리, 세게 몰려온다. [y]은메달(메달 점수 150): 옛 오락기 열쇠[/] — 그린 남서쪽 낡은 굴(옛 렙업의 땅)이 열린다.',
    setup(R) { R.score = 1; R.kills = 0; R.spawnT = 0.4; },
    adopt(R, e) { e.onDieFn = () => { R.score += 1; R.kills++; float(e.x, e.y - 24, '렙업! Lv.' + R.score); sfx('levelup'); }; },
    tick(R, dt) {
      R.spawnT -= dt;
      const alive = foes().length, cap = Math.min(16, 5 + Math.floor(R.D / 3) + Math.floor(R.el / 12) * 2);
      // 잡는 만큼 바로 채운다: 점수는 시간이 아니라 잡는 빠르기로 (예전: 한 마리씩 시간마다 — 1분에 90마리, Lv.150 남짓이 끝이었다)
      if (alive < 3) R.spawnT = Math.min(R.spawnT, 0.12);
      if (R.spawnT > 0 || alive >= cap) return;
      R.spawnT = Math.max(0.3, 1.0 - R.D * 0.04 - R.el * 0.01);
      const ph = R.el < 25 ? 0 : R.el < 45 ? 1 : 2;
      const pool = R.K.mobs[ph];   // 오락기마다 그 지역 몬스터
      const [x, y] = edgeSpot(), type = pick(pool);
      const el = R.D >= 3 && rnd() < 0.02 + R.D * 0.01;
      const e = foe(R, type, x, y, { elite: el });
      e.onDieFn = () => { const gain = (LVVAL[type] || 1) + (el ? 3 : 0); R.score += gain; R.kills++; float(e.x, e.y - 24, '렙업! Lv.' + R.score, '#ffe066', gain > 1); sfx('levelup'); };
    },
    hud: (R) => 'Lv.' + R.score + ' (' + R.kills + '마리)' + nextMedal(R),
  });

  /* 2. 몬스터 두더지 — 구멍에서 튀어나오는 그 마을 몬스터를 친다. 금빛 +3, 폭탄은 치면 터진다 */
  const HOLES = [[4, 4], [8.5, 4], [13, 4], [4, 7], [8.5, 7], [13, 7], [4, 10], [8.5, 10], [13, 10]];
  AI.arcMole = function (e, dt) {
    const M = e.mole; if (!M) return;
    M.t += dt; e.vx = e.vy = 0; e.x = M.h.x; e.y = M.h.y; e.kx = e.ky = 0;
    e.jz = M.t < 0.12 ? (M.t / 0.12) * 4 - 4 : 0;
    if (M.kind === 'spike' && !M.shot && M.t > 0.4) {
      M.shot = true; sfx('foeshot');
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; G.bosses.shoot({ kind: 'orb', x: e.x, y: e.y - 6, vx: Math.cos(a) * (60 + M.D * 5), vy: Math.sin(a) * (60 + M.D * 5), dmg: 1 + Math.floor(M.D / 4), col: '#c86aff', r: 3, life: 1.6 }); }
    }
    if (M.t > M.up) { e.dead = true; M.h.busy = false; G.fx.dust(e.x, e.y, 3); }
  };
  game('mole', { name: '몬스터 두더지', kind: 'kill', time: 60, dmg: 0.5, par: 50, medals: [35, 55, 75], fmt: (v) => v + '마리', prizeName: '뿅망치 부적', start: [8.5, 8.6],
    how: '아홉 구멍에서 그 마을 몬스터가 잠깐 튀어나온다. 들어가기 전에 쳐라 (+1, 금빛 +3). [r]검붉은 폭탄[/]은 치면 터지고 -3. 보라 가시는 튀어나오며 가시를 뿜는다(★2부터), ★5부터는 구멍 위에 서 있으면 문다.',
    setup(R) {
      R.score = 0; R.popT = 1.2;
      R.holes = HOLES.map(([tx, ty]) => ({ x: tx * TS + 8, y: ty * TS + 12, busy: false }));
      for (const h of R.holes) addEnt(R, { x: h.x, y: h.y, sortBias: -40, drawShadow(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(x, y - 1, 10, 4.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0b0705'; g.beginPath(); g.ellipse(x, y - 1, 8, 3.2, 0, 0, Math.PI * 2); g.fill(); } });
    },
    tick(R, dt) {
      R.popT -= dt;
      const up = R.holes.filter((h) => h.busy).length, maxUp = 2 + Math.floor(R.D / 3) + (R.el > 30 ? 1 : 0);
      if (R.popT > 0 || up >= maxUp) return;
      R.popT = Math.max(0.26, 0.85 - R.D * 0.04 - R.el * 0.006);
      const free = R.holes.filter((h) => !h.busy); if (!free.length) return;
      const h = pick(free), r = rnd();
      const kind = r < 0.1 ? 'gold' : R.D >= 1 && r < 0.24 + R.D * 0.015 ? 'bomb' : R.D >= 2 && r < 0.36 + R.D * 0.015 ? 'spike' : 'normal';
      const e = foe(R, R.K.mole, h.x, h.y, { ai: 'arcMole', quiet: true });
      e.maxHp = e.hp = 1; h.busy = true;
      e.col = kind === 'gold' ? '#ffd84a' : kind === 'bomb' ? '#5a2a3a' : kind === 'spike' ? '#b86aff' : e.col;
      e.mole = { kind, h, t: 0, D: R.D, up: Math.max(0.5, 1.25 - R.D * 0.06 - R.el * 0.005) * (kind === 'gold' ? 0.7 : 1) };
      e.noContact = !(R.D >= 5 && kind === 'normal');
      G.fx.dust(h.x, h.y, 4); sfx('pop');
      if (kind === 'bomb') { const d0 = e.draw.bind(e); e.draw = (g, cx, cy) => { d0(g, cx, cy); if (Math.floor(e.t * 10) % 2) { g.fillStyle = '#ffd84a'; g.fillRect(Math.round(e.x - cx) - 1, Math.round(e.y - cy) - 17, 2, 3); } }; }
      e.onDieFn = () => {
        h.busy = false;
        if (kind === 'bomb') { R.score = Math.max(0, R.score - 3); float(e.x, e.y - 20, '-3', '#ff6a8a', true); boom(e.x, e.y - 4, 28, 2 + Math.floor(R.D / 3)); return; }
        const v = kind === 'gold' ? 3 : 1; R.score += v; float(e.x, e.y - 20, '+' + v, kind === 'gold' ? '#ffe066' : '#c8ffb8', v > 1); sfx(v > 1 ? 'coin' : 'squish');
      };
    },
    adopt(R, e) { e.dead = true; },
    hud: (R) => R.score + '마리',
  });

  /* 3. 수정 지키기 — 가운데 수정을 노리는 몬스터를 막는다 */
  AI.arcSeek = function (e, dt) {
    const c = RUN && RUN.crystal; if (!c || c.dead) return;
    const d = U.dist(e.x, e.y, c.x, c.y);
    if (d < 13 + (e.r || 6)) { c.hit(e.cdmg || 2, e); e.dead = true; G.fx.shards(e.x, e.y - 6, 8, e.col || '#ffffff'); sfx('crystal'); return; }
    if (e.fly) { const [nx, ny] = U.norm(c.x - e.x, c.y - e.y); e.x += nx * e.speed * e.seekMul * dt; e.y += ny * e.speed * e.seekMul * dt; e.dirX = Math.sign(nx) || e.dirX; }
    else e.toward(c.x, c.y, e.speed * e.seekMul, dt);
  };
  game('defend', { name: '수정 지키기', kind: 'kill', time: 60, dmg: 0.5, par: 30, medals: [20, 35, 50], fmt: (v) => v + '점', prizeName: '수호 수정', start: [8.5, 9],
    how: '가운데 수정으로 몬스터가 몰려든다. 닿기 전에 쓰러뜨려라 (+1, 너를 노리는 사냥꾼 +2). 수정이 깨지면 실패, 1분을 지키면 남은 수정 빛만큼 더.',
    setup(R) {
      R.score = 0; R.spawnT = 1.0;
      const cx = 8.5 * TS + 8, cy = 7 * TS + 10;
      const c = addEnt(R, { kind: 'arccrystal', x: cx, y: cy, solid: true, hp: 30 + R.D * 2, max: 30 + R.D * 2, flashT: 0,
        blockBox() { return { x: this.x - 7, y: this.y - 6, w: 14, h: 6 }; },
        hit(n) { this.hp -= n; this.flashT = 0.2; W().shake(2, 0.15); G.fx.float(this.x, this.y - 30, '-' + n, '#8ad8ff'); if (this.hp <= 0 && RUN && !RUN.over) { this.dead = true; G.fx.shards(this.x, this.y - 12, 30, '#8ad8ff'); sfx('crystal'); end(RUN, 'fail'); } },
        update(dt) { this.t += dt; if (this.flashT > 0) this.flashT -= dt; },
        drawShadow(g, cx2, cy2) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(this.x - cx2, this.y - cy2, 9, 3, 0, 0, Math.PI * 2); g.fill(); },
        draw(g, cx2, cy2) {
          const x = Math.round(this.x - cx2), y = Math.round(this.y - cy2) - 2 + Math.sin(this.t * 2) * 1.5, k = this.hp / this.max;
          g.fillStyle = this.flashT > 0 ? '#ffffff' : k > 0.5 ? '#8ad8ff' : k > 0.25 ? '#ffd84a' : '#ff6a8a';
          g.beginPath(); g.moveTo(x, y - 24); g.lineTo(x + 8, y - 12); g.lineTo(x + 5, y); g.lineTo(x - 5, y); g.lineTo(x - 8, y - 12); g.closePath(); g.fill();
          g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.moveTo(x, y - 22); g.lineTo(x - 5, y - 12); g.lineTo(x - 2, y - 3); g.closePath(); g.fill();
          g.fillStyle = '#0b0914'; g.fillRect(x - 12, y - 32, 24, 3); g.fillStyle = '#8ad8ff'; g.fillRect(x - 12, y - 32, Math.max(0, Math.round(24 * k)), 3);
        } });
      R.crystal = c;
    },
    tick(R, dt) {
      R.spawnT -= dt;
      const cap = 10 + R.D;
      if (R.spawnT > 0 || foes().length >= cap) return;
      R.spawnT = Math.max(0.3, 1.15 - R.D * 0.05 - R.el * 0.01);
      const [x, y] = edgeSpot();
      const hunter = rnd() < 0.16 + R.D * 0.02;
      if (hunter) {
        const e = foe(R, pick(R.K.mobs[0]), x, y);
        e.onDieFn = () => { R.score += 2; float(e.x, e.y - 22, '+2', '#ffe066', true); };
        return;
      }
      const type = pick(R.K.seek);
      const e = foe(R, type, x, y, { ai: 'arcSeek' });
      e.seekMul = (type === 'golem' ? 0.9 : 0.8) + R.D * 0.04; e.cdmg = type === 'golem' ? 4 : R.D >= 5 ? 3 : 2;
      e.onDieFn = () => { R.score += 1; float(e.x, e.y - 22, '+1', '#c8ffb8'); };
    },
    adopt(R, e) { e.ai = 'arcSeek'; e.seekMul = 0.8 + R.D * 0.04; e.cdmg = 1; e.onDieFn = () => { R.score += 1; }; },
    finishBonus(R) { return R.crystal && !R.crystal.dead ? Math.floor(R.crystal.hp / 3) : 0; },
    hud: (R) => R.score + '점 · 수정 ' + Math.max(0, R.crystal ? R.crystal.hp : 0),
  });

  /* 4. 동전 러시 — 동전을 줍고, 쓰러뜨릴 수 없는 유령을 피한다 */
  AI.arcChase = function (e, dt) {
    const p = W().player; if (!p) return;
    e.hp = e.maxHp; e.inv = 0.25; e.fly = true;
    if (e.pauseT > 0) { e.pauseT -= dt; return; }
    const [nx, ny] = U.norm(p.x - e.x, p.y - 4 - e.y), sp = e.chase * (RUN ? 1 + RUN.el * 0.008 : 1);
    e.x = U.clamp(e.x + nx * sp * dt, BX0, BX1); e.y = U.clamp(e.y + ny * sp * dt, BY0, BY1); e.dirX = Math.sign(nx) || e.dirX;
  };
  function coin(R, x, y, v, life) {
    return addEnt(R, { kind: 'arccoin', x, y, v, life: life || 0, sortBias: -2,
      update(dt) {
        this.t += dt; const p = W().player;
        if (this.life && this.t > this.life) { this.dead = true; return; }
        if (p && U.dist(this.x, this.y, p.x, p.y) < 13) { this.dead = true; R.score += this.v; sfx('coin'); float(this.x, this.y - 14, '+' + this.v, '#ffe066', this.v > 1); G.fx.sparks(this.x, this.y - 6, 6, '#ffe066', 60); }
      },
      drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, this.v > 1 ? 6 : 4, 1.6, 0, 0, Math.PI * 2); g.fill(); },
      draw(g, cx, cy) {
        if (this.life && this.t > this.life - 1.2 && Math.floor(this.t * 10) % 2) return;
        const x = Math.round(this.x - cx), y = Math.round(this.y - cy - 7 - Math.abs(Math.sin(this.t * 4)) * 2), w = Math.max(1, Math.abs(Math.cos(this.t * 3)) * (this.v > 1 ? 6 : 4));
        g.fillStyle = '#8a5a10'; g.fillRect(x - w - 1, y - (this.v > 1 ? 6 : 4) - 1, w * 2 + 2, (this.v > 1 ? 12 : 8) + 2);
        g.fillStyle = this.v > 1 ? '#fff0a0' : '#ffd84a'; g.fillRect(x - w, y - (this.v > 1 ? 6 : 4), w * 2, this.v > 1 ? 12 : 8);
      } });
  }
  game('coins', { name: '동전 러시', kind: 'collect', time: 45, dmg: 1, par: 25, medals: [15, 28, 40], fmt: (v) => v + '닢', prizeName: '황금 동전 지갑',
    how: '흩어진 동전을 주워라 (+1, 반짝이는 큰 동전 +5 — 곧 사라진다). 유령은 쓰러뜨릴 수 없다, 쳐서 밀어내고 피하라. 맞으면 동전 둘을 흘린다. ★3부터 바닥 가시.',
    setup(R) { R.score = 0; R.bigT = 6; R.spikeT = 3; R.ghosts = []; },
    tick(R, dt) {
      const coins = R.ents.filter((e) => e.kind === 'arccoin' && !e.dead && !e.life);
      const want = 3 + Math.floor(R.D / 4);
      if (coins.length < want) { const [x, y] = randSpot(8, 50); coin(R, x, y, 1); }
      R.bigT -= dt; if (R.bigT <= 0) { R.bigT = 7; const [x, y] = randSpot(10, 70); coin(R, x, y, 5, Math.max(2.4, 3.6 - R.D * 0.1)); sfx('white'); }
      R.ghosts = R.ghosts.filter((e) => !e.dead);
      const gn = Math.min(5, 1 + Math.floor(R.D / 3) + Math.floor(R.el / 20));
      if (R.ghosts.length < gn) { const [x, y] = edgeSpot(); const e = foe(R, R.K.chase, x, y, { ai: 'arcChase', hpMul: 400 }); e.chase = 22 + R.D * 2.5; e.noKill = true; e.atk = Math.max(1, Math.round(e.atk * 0.5)); R.ghosts.push(e); }
      if (R.D >= 3) {
        R.spikeT -= dt;
        if (R.spikeT <= 0) { R.spikeT = Math.max(1.1, 3 - R.D * 0.15); const p = W().player; const [x, y] = rnd() < 0.5 && p ? [p.x, p.y] : randSpot(10); G.bosses.warnCircle(x, y, 18, 0.8, () => { G.fx.shards(x, y - 4, 10, '#c8c8d8'); sfx('thunk'); G.bosses.hitCircle(x, y, 18, 2 + Math.floor(R.D / 3)); }, 'rgba(200,200,220,0.4)'); }
      }
    },
    onHurt(R) { const p = W().player; for (const g2 of R.ghosts) if (!g2.dead && U.dist(g2.x, g2.y, p.x, p.y) < 40) { const [nx, ny] = U.norm(g2.x - p.x, g2.y - p.y); g2.x = U.clamp(g2.x + nx * 30, BX0, BX1); g2.y = U.clamp(g2.y + ny * 30, BY0, BY1); g2.pauseT = 1.4; } const n = Math.min(2, R.score); R.score -= n; for (let i = 0; i < n; i++) { const a = rnd() * 6.28; coin(R, U.clamp(p.x + Math.cos(a) * 34, BX0, BX1), U.clamp(p.y + Math.sin(a) * 24, BY0, BY1), 1, 4); } if (n) float(p.x, p.y - 34, '-' + n, '#ff6a8a'); },
    adopt(R, e) { e.dead = true; },
    hud: (R) => R.score + '닢',
  });

  /* 5. 별똥비 버티기 — 떨어지는 별똥과 쏟아지는 탄을 피해 버틴다 */
  game('rain', { name: '별똥비 버티기', kind: 'survive', time: 60, dmg: 1, par: 80, medals: [55, 85, 115], fmt: (v) => v + '점', prizeName: '별똥 망토 조각',
    how: '바닥에 붉은 원이 뜨면 곧 별똥이 떨어진다. 벽에서 탄도 날아온다(★1부터). 버틴 1초마다 1점, 반짝이는 별을 주우면 +5, 끝까지 버티면 +15.',
    setup(R) { R.score = 0; R.metT = 1.2; R.fanT = 3; R.starT = 4; R.stars = 0; },
    tick(R, dt) {
      const p = W().player;
      R.metT -= dt;
      if (R.metT <= 0) {
        R.metT = Math.max(0.16, 0.72 - R.D * 0.04 - R.el * 0.006);
        const aim = p && rnd() < 0.38;
        const [x, y] = aim ? [U.clamp(p.x + (p.vx || 0) * 0.5, BX0, BX1), U.clamp(p.y + (p.vy || 0) * 0.5, BY0, BY1)] : randSpot(4);
        const r = 16 + Math.floor(rnd() * 6) + (R.D >= 6 ? 4 : 0);
        G.bosses.warnCircle(x, y, r, Math.max(0.5, 0.95 - R.D * 0.03), () => boom(x, y, r, 2 + Math.floor(R.D / 3), '#ffb84a'), 'rgba(255,90,60,0.4)');
      }
      if (R.D >= 1) {
        R.fanT -= dt;
        if (R.fanT <= 0 && p) {
          R.fanT = Math.max(1.4, 3.4 - R.D * 0.18 - R.el * 0.02);
          const [x, y] = edgeSpot(), n = 3 + Math.floor(R.D / 2), a0 = U.angle(p.x - x, p.y - 8 - y), sp = 70 + R.D * 6;
          sfx('foeshot');
          for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.22; G.bosses.shoot({ kind: 'orb', x, y: y - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: 1 + Math.floor(R.D / 4), col: '#ff8a5a', r: 3, life: 4 }); }
        }
      }
      R.starT -= dt;
      if (R.starT <= 0) {
        R.starT = 5;
        const [x, y] = randSpot(10, 50);
        addEnt(R, { kind: 'arcstar', x, y, update(dt2) { this.t += dt2; if (this.t > 6) { this.dead = true; return; } const pl = W().player; if (pl && U.dist(this.x, this.y, pl.x, pl.y) < 13) { this.dead = true; R.stars++; sfx('white'); float(this.x, this.y - 14, '+5', '#fff2a8', true); } },
          draw(g, cx, cy) { if (this.t > 4.8 && Math.floor(this.t * 10) % 2) return; const x2 = Math.round(this.x - cx), y2 = Math.round(this.y - cy - 8 - Math.sin(this.t * 3) * 2); g.fillStyle = '#fff2a8'; g.fillRect(x2 - 1, y2 - 5, 2, 10); g.fillRect(x2 - 5, y2 - 1, 10, 2); g.fillStyle = '#ffffff'; g.fillRect(x2 - 1, y2 - 1, 2, 2); } });
      }
      R.score = Math.floor(R.el) + R.stars * 5;
    },
    finishBonus(R, why) { return why === 'time' ? 15 : 0; },
    adopt(R, e) { e.dead = true; },
    hud: (R) => Math.floor(R.el) + '초 · 별 ' + R.stars,
  });

  /* 6. 챔피언 도전 — 정예 도전자를 차례로 꺾는다 */
  game('champ', { name: '챔피언 도전', kind: 'duel', time: 90, dmg: 1, par: 7, medals: [4, 8, 12], fmt: (v) => v + '승', prizeName: '챔피언 벨트', start: [8.5, 9.5],
    how: '정예 도전자가 하나씩(★5부터 넷째 판부터 둘씩) 나온다. 판마다 더 단단하다. 90초 동안 몇 명을 꺾을까.',
    setup(R) { R.score = 0; R.round = 0; R.nextT = 1.0; R.champs = []; },
    tick(R, dt) {
      R.champs = R.champs.filter((e) => !e.dead);
      if (R.champs.length) return;
      R.nextT -= dt; if (R.nextT > 0) return;
      R.round++; R.nextT = 1.2;
      const n = R.D >= 5 && R.round >= 4 ? 2 : 1;
      const CP = R.K.champ, top = Math.min(CP.length, 2 + Math.floor(R.round / 2));
      for (let i = 0; i < n; i++) {
        const type = CP[Math.floor(rnd() * top)];
        const x = n === 1 ? 8.5 * TS + 8 : (i ? 12 : 5) * TS + 8;
        const e = foe(R, type, x, py(4), { hpMul: 1.0 + R.round * 0.2 });
        if (G.foes.makeElite) { G.foes.makeElite(e, R.round < 4 && G.foes.AFFIX ? [pick(Object.keys(G.foes.AFFIX).filter((k2) => k2 !== 'summon'))] : null); e.elite = 'arc'; }
        e.atk = Math.max(1, Math.round(e.atk * 0.55)); e.champ = true; R.champs.push(e);
        float(e.x, e.y - 34, '도전자 ' + R.round + ' — ' + (e.name || type), '#ffd84a', true);
        e.onDieFn = () => { R.score++; float(e.x, e.y - 28, R.score + '승!', '#ffe066', true); sfx('learn'); };
      }
      sfx('encounter');
    },
    adopt(R, e) { /* 정예가 부른 졸개는 그냥 둔다 */ },
    hud: (R) => R.score + '승 · ' + R.round + '번째 도전자',
  });

  /* 7. 깃발 달리기 — 나타나는 깃발을 차례로 잡는다. 굴러오는 통나무 · 튀는 가시공 */
  function roller(R, horiz, k, speed, dmg) {
    const warn = Math.max(0.45, 0.9 - R.D * 0.04), dir = rnd() < 0.5 ? 1 : -1;
    if (horiz) G.bosses.warnRect(FL.x0 * TS, k * TS, (FL.x1 - FL.x0 + 1) * TS, TS, warn, null, 'rgba(255,120,60,0.35)');
    else G.bosses.warnRect(k * TS, FL.y0 * TS, TS, (FL.y1 - FL.y0 + 1) * TS, warn, null, 'rgba(255,120,60,0.35)');
    const x0 = horiz ? (dir > 0 ? BX0 - 12 : BX1 + 12) : k * TS + 8, y0 = horiz ? k * TS + 14 : (dir > 0 ? BY0 - 10 : BY1 + 10);
    addEnt(R, { kind: 'arcroll', x: x0, y: y0, wait: warn, sortBias: 2,
      update(dt) {
        this.t += dt; if (this.t < this.wait) return;
        if (horiz) this.x += dir * speed * dt; else this.y += dir * speed * dt;
        if (this.x < BX0 - 30 || this.x > BX1 + 30 || this.y < BY0 - 30 || this.y > BY1 + 30) { this.dead = true; return; }
        const p = W().player; if (p && Math.abs(p.x - this.x) < (horiz ? 9 : 12) && Math.abs(p.y - this.y) < (horiz ? 10 : 8)) G.combat.hurtPlayer(p, dmg, this, {});
      },
      draw(g, cx, cy) {
        if (this.t < this.wait) return;
        const x = Math.round(this.x - cx), y = Math.round(this.y - cy) - 8, r = (this.t * speed / 7) * dir;
        g.fillStyle = '#6a4a2a'; if (horiz) g.fillRect(x - 6, y - 7, 12, 14); else g.fillRect(x - 10, y - 5, 20, 10);
        g.fillStyle = '#a87a4a'; for (let i = 0; i < 3; i++) { const o = ((r + i * 4) % 12 + 12) % 12 - 6; if (horiz) g.fillRect(x - 6, y + Math.round(o), 12, 1); else g.fillRect(x + Math.round(o), y - 5, 1, 10); }
      } });
  }
  game('flags', { name: '깃발 달리기', kind: 'run', time: 45, dmg: 1, par: 18, medals: [14, 22, 30], fmt: (v) => v + '개', prizeName: '깃발 달리기 띠',
    how: '깃발이 하나씩 나타난다. 닿으면 +1, 곧 다른 곳에 새 깃발. 붉은 줄이 뜨면 통나무가 굴러온다, 가시공은 벽에 튕기며 돌아다닌다.',
    setup(R) { R.score = 0; R.rollT = 1.5; R.balls = []; R.flag = null; },
    tick(R, dt) {
      const p = W().player;
      if (!R.flag || R.flag.dead) {
        const [x, y] = randSpot(10, 90);
        R.flag = addEnt(R, { kind: 'arcflag', x, y, update(dt2) { this.t += dt2; const pl = W().player; if (pl && U.dist(this.x, this.y, pl.x, pl.y) < 12) { this.dead = true; R.score++; sfx('clickspot'); float(this.x, this.y - 20, R.score + '!', '#8ae8ff', true); G.fx.sparks(this.x, this.y - 10, 10, '#8ae8ff', 70); } },
          drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, 5, 2, 0, 0, Math.PI * 2); g.fill(); },
          draw(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy); g.fillStyle = '#e8e0c8'; g.fillRect(x, y - 20, 1, 20); const wv = Math.round(Math.sin(this.t * 6) * 1.5); g.fillStyle = '#3ab8ff'; g.fillRect(x + 1, y - 20 + wv, 8, 3); g.fillStyle = '#8ae8ff'; g.fillRect(x + 1, y - 17 + wv, 7, 3); } });
      }
      R.rollT -= dt;
      if (R.rollT <= 0) {
        R.rollT = Math.max(0.65, 2.4 - R.D * 0.12 - R.el * 0.02);
        const horiz = R.D < 4 || rnd() < 0.55;
        const k = horiz ? (p && rnd() < 0.5 ? Math.floor((p.y - 2) / TS) : FL.y0 + 1 + Math.floor(rnd() * 8)) : (p && rnd() < 0.5 ? Math.floor(p.x / TS) : FL.x0 + 1 + Math.floor(rnd() * 14));
        roller(R, horiz, U.clamp(k, horiz ? FL.y0 : FL.x0, horiz ? FL.y1 : FL.x1), 150 + R.D * 12, 2 + Math.floor(R.D / 3));
      }
      R.balls = R.balls.filter((b) => !b.dead);
      const bn = Math.min(5, 1 + Math.floor(R.D / 3) + Math.floor(R.el / 20));
      if (R.balls.length < bn) {
        const [x, y] = randSpot(10, 80), a = rnd() * 6.28, sp = 45 + R.D * 6, dmg = 1 + Math.floor(R.D / 3);
        R.balls.push(addEnt(R, { kind: 'arcball', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          update(dt2) {
            this.t += dt2; this.x += this.vx * dt2; this.y += this.vy * dt2;
            if (this.x < BX0) { this.x = BX0; this.vx = Math.abs(this.vx); } if (this.x > BX1) { this.x = BX1; this.vx = -Math.abs(this.vx); }
            if (this.y < BY0) { this.y = BY0; this.vy = Math.abs(this.vy); } if (this.y > BY1) { this.y = BY1; this.vy = -Math.abs(this.vy); }
            const pl = W().player; if (pl && U.dist(this.x, this.y - 6, pl.x, pl.y - 8) < 11) G.combat.hurtPlayer(pl, dmg, this, {});
          },
          drawShadow(g, cx, cy) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(this.x - cx, this.y - cy, 5, 2, 0, 0, Math.PI * 2); g.fill(); },
          draw(g, cx, cy) { const x = Math.round(this.x - cx), y = Math.round(this.y - cy) - 7; g.fillStyle = '#5a5470'; g.beginPath(); g.arc(x, y, 5, 0, 6.29); g.fill(); g.fillStyle = '#c8c0e0'; for (let i = 0; i < 6; i++) { const a2 = i / 6 * 6.28 + this.t * 4; g.fillRect(Math.round(x + Math.cos(a2) * 6) - 1, Math.round(y + Math.sin(a2) * 6) - 1, 2, 2); } } }));
      }
    },
    adopt(R, e) { e.dead = true; },
    hud: (R) => '깃발 ' + R.score,
  });

  /* 8. 기억의 발판 — 빛나는 차례를 기억해 발판을 밟는다 */
  const PLATES = [{ tx: 8, ty: 2.6, col: '#ff5a5a', hz: 392 }, { tx: 14, ty: 6, col: '#4ab8ff', hz: 523 }, { tx: 8, ty: 9.4, col: '#ffd84a', hz: 659 }, { tx: 2, ty: 6, col: '#6ae07a', hz: 784 }];
  game('simon', { name: '기억의 발판', kind: 'memory', time: 120, dmg: 1, par: 8, medals: [6, 9, 12], fmt: (v) => v + '칸', prizeName: '기억의 고리', start: [8.5, 7.4],
    how: '네 발판이 차례로 빛난다. 같은 차례로 밟아라 — 맞히면 하나 더 길어진다. 틀리거나 오래 머뭇거리면 발판이 친다(세 번 틀리면 끝). ★2부터 방해꾼이 돌아다닌다.',
    setup(R) {
      R.score = 0; R.seq = [0, 1, 2].map(() => Math.floor(rnd() * 4)); R.phase = 'pause'; R.pt = 1.2; R.miss = 0; R.on = -1; R.lit = -1; R.harT = 2;
      R.plates = PLATES.map((P, i) => addEnt(R, { kind: 'arcplate', i, x: P.tx * TS + 16, y: P.ty * TS + 32, sortBias: -60, P, glow: 0,
        update(dt) { this.t += dt; if (this.glow > 0) this.glow -= dt; },
        drawShadow(g, cx, cy) {
          const x = Math.round(this.P.tx * TS - cx), y = Math.round(this.P.ty * TS - cy), on = this.glow > 0 || R.lit === this.i;
          g.fillStyle = '#0b0914'; g.fillRect(x, y, 32, 32);
          g.globalAlpha = on ? 1 : 0.35; g.fillStyle = this.P.col; g.fillRect(x + 2, y + 2, 28, 28); g.globalAlpha = 1;
          if (on) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x + 4, y + 4, 24, 4); }
        } }));
    },
    tick(R, dt) {
      const p = W().player; if (!p) return;
      // 방해꾼
      if (R.D >= 2) {
        R.harT -= dt;
        const want = Math.min(3, Math.floor(R.D / 3) + 1);
        if (R.harT <= 0 && foes().length < want) { R.harT = 4; const [x, y] = edgeSpot(); const e = foe(R, pick(R.K.mobs[0]), x, y); e.atk = Math.max(1, Math.round(e.atk * 0.5)); }
      }
      // 지금 밟은 발판
      let cur = -1;
      for (const P of R.plates) if (p.x > P.P.tx * TS && p.x < P.P.tx * TS + 32 && p.y - 2 > P.P.ty * TS && p.y - 2 < P.P.ty * TS + 32) cur = P.i;
      const stepped = cur >= 0 && cur !== R.on ? cur : -1; R.on = cur;
      const showOn = Math.max(0.22, 0.5 - R.D * 0.025);
      if (R.phase === 'pause') { R.pt -= dt; R.lit = -1; if (R.pt <= 0) { R.phase = 'show'; R.si = 0; R.pt = 0.3; } return; }
      if (R.phase === 'show') {
        R.pt -= dt;
        if (R.pt <= 0) {
          if (R.lit >= 0) { R.lit = -1; R.pt = 0.12; R.si++; return; }
          if (R.si >= R.seq.length) { R.phase = 'input'; R.ii = 0; R.it = 0; G.fx.float(p.x, p.y - 34, '차례대로!', '#ffe066'); return; }
          R.lit = R.seq[R.si]; tone(PLATES[R.lit].hz, showOn); R.pt = showOn;
        }
        return;
      }
      // 입력
      R.it += dt;
      const wrong = () => {
        R.miss++; sfx('buzz'); W().shake(3, 0.2);
        const P = R.plates[stepped >= 0 ? stepped : R.seq[R.ii]];
        G.fx.sparks(P.x, P.y - 16, 14, '#ff6a8a', 100);
        G.combat.hurtPlayer(p, 2 + Math.floor(R.D / 3), { x: P.x, y: P.y - 16 }, { force: true });
        float(p.x, p.y - 34, '틀렸다 (' + R.miss + '/3)', '#ff6a8a', true);
        if (R.miss >= 3) { end(R, 'fail'); return; }
        R.phase = 'pause'; R.pt = 1.4;
      };
      if (stepped >= 0) {
        const P = R.plates[stepped]; P.glow = 0.3; tone(PLATES[stepped].hz, 0.25);
        if (stepped !== R.seq[R.ii]) { wrong(); return; }
        R.ii++; R.it = 0;
        if (R.ii >= R.seq.length) { R.score = R.seq.length; float(p.x, p.y - 34, R.score + '칸!', '#8ae8ff', true); sfx('puzzle'); R.seq.push(Math.floor(rnd() * 4)); R.phase = 'pause'; R.pt = 0.9; }
      } else if (R.it > Math.max(3, 6 - R.D * 0.25)) { wrong(); }
    },
    hud: (R) => R.score + '칸 · ' + (R.phase === 'input' ? '밟아라 ' + R.ii + '/' + R.seq.length : '보아라…') + ' · 틀림 ' + R.miss + '/3',
  });

  /* 9. 도둑 잡기 (호박) — 자루를 멘 도둑을 쫓아 치면 동전이 쏟아진다. 경비 몬스터가 막아선다 */
  AI.arcFlee = function (e, dt) {
    const p = W().player; if (!p) return;
    e.hp = e.maxHp; e.inv = 0;
    if (e.hitCd > 0) e.hitCd -= dt;
    if (e.daze > 0) { e.daze -= dt; e.state = 'idle'; return; }
    let [nx, ny] = U.norm(e.x - p.x, e.y - p.y);
    const wall = Math.min(e.x - BX0, BX1 - e.x, e.y - BY0, BY1 - e.y);
    if (wall < 34) { const [wx, wy] = U.norm((BX0 + BX1) / 2 - e.x, (BY0 + BY1) / 2 - e.y); nx = nx * 0.35 + wx; ny = ny * 0.35 + wy; }
    e.wob = (e.wob || 0) + dt; nx += Math.sin(e.wob * 2.3) * 0.45; ny += Math.cos(e.wob * 1.7) * 0.45;
    const [mx, my] = U.norm(nx, ny), d = U.dist(e.x, e.y, p.x, p.y);
    const sp = e.fleeSp * (d < 70 ? 1 : 0.5);
    e.go(mx * sp * dt, my * sp * dt);
    e.x = U.clamp(e.x, BX0, BX1); e.y = U.clamp(e.y, BY0, BY1);
    e.dir = U.dir4(mx, my, e.dir || 'down'); e.dirX = Math.sign(mx) || e.dirX; e.state = 'walk';
  };
  game('thief', { name: '도둑 잡기', kind: 'chase', time: 60, dmg: 1, par: 55, medals: [35, 60, 85], fmt: (v) => v + '닢', prizeName: '도둑 잡이 방울', start: [8.5, 9],
    how: '자루를 멘 도둑이 달아난다. 쫓아가 칠 때마다 동전이 쏟아진다 — 땅에 떨어진 동전을 주워야 점수(+1, 다섯 번째 칠 때마다 큰 동전 +5). 도둑의 경비가 막아서고, ★3부터 도둑이 덫을 흘린다.',
    setup(R) {
      R.score = 0; R.hitsN = 0; R.guardT = 2; R.trapT = 4;
      const e = foe(R, 'bandit', px(8.5), py(4), { ai: 'arcFlee', hpMul: 400 });
      e.noContact = true; e.fleeSp = 66 + R.D * 3; e.thief = true; e.name = '자루 도둑';
      const oh = e.onHurt.bind(e);
      e.onHurt = function (dmg, info) {
        const r = oh(dmg, info);
        if (!(this.hitCd > 0)) {
          this.hitCd = 0.3; this.daze = 0.35; R.hitsN++;
          const big = R.hitsN % 5 === 0, n = big ? 1 : 1 + (rnd() < 0.35 ? 1 : 0);
          for (let i = 0; i < n; i++) { const a = rnd() * 6.28; coin(R, U.clamp(this.x + Math.cos(a) * 18, BX0, BX1), U.clamp(this.y + Math.sin(a) * 12, BY0, BY1), big ? 5 : 1, 5); }
          sfx('coin'); G.fx.sparks(this.x, this.y - 14, 6, '#ffe066', 70);
        }
        return r;
      };
      R.thief = e;
    },
    tick(R, dt) {
      const guards = foes().filter((e) => !e.thief);
      R.guardT -= dt;
      if (R.guardT <= 0 && guards.length < 1 + Math.floor(R.D / 2) + Math.floor(R.el / 25)) { R.guardT = Math.max(2.5, 6 - R.D * 0.3); const [x, y] = edgeSpot(); foe(R, pick(R.K.mobs[R.el < 30 ? 0 : 1]), x, y); }
      if (R.D >= 3 && R.thief) {
        R.trapT -= dt;
        if (R.trapT <= 0) { R.trapT = Math.max(2, 5 - R.D * 0.2); const t = R.thief, x = t.x, y = t.y; G.bosses.warnCircle(x, y, 14, 1.2, () => { G.fx.shards(x, y - 3, 8, '#c8c8d8'); sfx('thunk'); G.bosses.hitCircle(x, y, 14, 2 + Math.floor(R.D / 3)); }, 'rgba(200,200,220,0.4)'); }
      }
    },
    adopt(R, e) { /* 경비가 부른 것은 그대로 */ },
    hud: (R) => R.score + '닢 · 친 횟수 ' + R.hitsN,
  });

  /* 10. 색깔 풍선 (무지개) — 위에 뜬 색의 풍선만 터뜨린다. 다른 색은 터지며 다친다 */
  const BCOL = [['빨강', '#ff5a5a'], ['파랑', '#4ab8ff'], ['노랑', '#ffd84a'], ['초록', '#6ae07a']];
  AI.arcFloat = function (e, dt) {
    e.y -= e.rise * dt; e.x = U.clamp(e.x + Math.sin(e.t * 2 + e.ph) * 14 * dt, BX0, BX1); e.vx = e.vy = 0;
    if (e.y < BY0 - 8) e.dead = true;
  };
  function balloon(R) {
    const x = BX0 + 8 + rnd() * (BX1 - BX0 - 16), y = BY1 + 6;
    const e = foe(R, 'wisp', x, y, { ai: 'arcFloat', quiet: true });
    e.maxHp = e.hp = 1; e.noContact = true; e.fly = true; e.h = 30; e.r = 7; e.rise = 26 + R.D * 2.5 + rnd() * 12; e.ph = rnd() * 6;
    e.gold = rnd() < 0.07; e.bal = rnd() < 0.3 ? R.target : Math.floor(rnd() * 4);
    e.draw = function (g, cx, cy) {
      const bx = Math.round(this.x - cx), by = Math.round(this.y - cy - 16), col = this.gold ? '#fff2a8' : BCOL[this.bal][1];
      g.strokeStyle = '#e8e0c8'; g.beginPath(); g.moveTo(bx, by + 7); g.lineTo(bx + Math.sin(this.t * 3) * 2, by + 16); g.stroke();
      g.fillStyle = '#140c1c'; g.beginPath(); g.ellipse(bx, by, 7, 8, 0, 0, 6.29); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(bx, by, 6, 7, 0, 0, 6.29); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(bx - 3, by - 4, 2, 3);
      if (this.gold) { g.fillStyle = '#ffd84a'; g.fillRect(bx - 1, by - 1, 2, 2); }
    };
    e.onDieFn = () => {
      if (e.gold) { R.score += 3; float(e.x, e.y - 22, '+3', '#fff2a8', true); sfx('white'); return; }
      if (e.bal === R.target) { R.score += 1; float(e.x, e.y - 22, '+1', BCOL[e.bal][1]); sfx('pop'); return; }
      R.score = Math.max(0, R.score - 2); float(e.x, e.y - 22, '-2 (' + BCOL[e.bal][0] + ')', '#ff6a8a', true); boom(e.x, e.y - 10, 24, 2 + Math.floor(R.D / 3), BCOL[e.bal][1]);
    };
    return e;
  }
  game('balloon', { name: '색깔 풍선', kind: 'aim', time: 60, dmg: 1, par: 60, medals: [35, 65, 95], fmt: (v) => v + '점', prizeName: '무지개 풍선 매듭', start: [8.5, 6],
    how: '풍선이 아래에서 떠오른다. 위쪽 띠에 뜬 [y]목표 색[/]의 풍선만 터뜨려라(+1, 반짝이는 금빛 +3). 다른 색을 터뜨리면 그 자리에서 터져 다치고 -2. 목표 색은 8초마다 바뀐다(바뀌기 전에 깜박인다). 축제 벌레도 날아든다.',
    setup(R) { R.score = 0; R.target = Math.floor(rnd() * 4); R.tgtT = 8; R.popT = 0.5; R.harT = 3; },
    tick(R, dt) {
      R.tgtT -= dt;
      if (R.tgtT <= 0) { let n; do { n = Math.floor(rnd() * 4); } while (n === R.target); R.target = n; R.tgtT = 8; sfx('switch'); float(W().player.x, W().player.y - 36, '목표: ' + BCOL[n][0], BCOL[n][1], true); }
      R.popT -= dt;
      if (R.popT <= 0) { R.popT = Math.max(0.28, 0.75 - R.D * 0.04 - R.el * 0.005); balloon(R); }
      R.harT -= dt;
      const har = foes().filter((e) => e.ai !== 'arcFloat');
      if (R.harT <= 0 && har.length < 1 + Math.floor(R.D / 3)) { R.harT = 4; const [x, y] = edgeSpot(); foe(R, pick(R.K.mobs[0]), x, y); }
    },
    adopt(R, e) { },
    hud: (R) => R.score + '점 · 목표 ' + BCOL[R.target][0] + (R.tgtT < 1.5 && Math.floor(R.t * 6) % 2 ? ' (곧 바뀜)' : ''),
  });

  /* 11. 안개 속 사냥 (안개 늪) — 등불 하나로 보이는 만큼만. 몬스터 눈빛을 보고 잡는다 (많이 잡기) */
  game('dark', { name: '안개 속 사냥', kind: 'kill', time: 60, dmg: 0.5, par: 200, medals: [120, 200, 280], fmt: (v) => v + '점', prizeName: '반딧불 병', start: [8.5, 7.5],
    how: '안개가 짙어 등불 둘레만 보인다. 어둠 속 몬스터는 눈빛만 보인다 — 잡을수록 점수(약한 것 +1 … 센 것 +3~4). 반딧불 병을 주우면 잠깐 넓게 보이고 +2.',
    setup(R) { R.score = 0; R.spawnT = 0.6; R.jarT = 5; R.lightT = 0; R.dark = true; },
    tick(R, dt) {
      if (R.lightT > 0) R.lightT -= dt;
      R.spawnT -= dt;
      const alive = foes().length, cap = Math.min(12, 4 + Math.floor(R.D / 3) + Math.floor(R.el / 15));
      if (alive < 2) R.spawnT = Math.min(R.spawnT, 0.2);
      if (R.spawnT <= 0 && alive < cap) {
        R.spawnT = Math.max(0.45, 1.2 - R.D * 0.04 - R.el * 0.01);
        const ph = R.el < 25 ? 0 : R.el < 45 ? 1 : 2, type = pick(R.K.mobs[ph]);
        const [x, y] = edgeSpot(), e = foe(R, type, x, y, { quiet: true });
        e.onDieFn = () => { const v = LVVAL[type] || 1; R.score += v; float(e.x, e.y - 22, '+' + v, '#c8ffb8'); };
      }
      R.jarT -= dt;
      if (R.jarT <= 0) {
        R.jarT = 7;
        const [x, y] = randSpot(12, 50);
        addEnt(R, { kind: 'arcjar', x, y, glowy: true, update(dt2) { this.t += dt2; if (this.t > 9) { this.dead = true; return; } const pl = W().player; if (pl && U.dist(this.x, this.y, pl.x, pl.y) < 13) { this.dead = true; R.score += 2; R.lightT = 6; sfx('white'); float(this.x, this.y - 16, '+2 · 반딧불!', '#fff2a8', true); } },
          draw(g, cx, cy) { const x2 = Math.round(this.x - cx), y2 = Math.round(this.y - cy - 8); g.fillStyle = '#8ac8e8'; g.fillRect(x2 - 3, y2 - 5, 6, 8); g.fillStyle = '#5a4a3a'; g.fillRect(x2 - 3, y2 - 7, 6, 2); g.fillStyle = Math.floor(this.t * 5) % 2 ? '#fff2a8' : '#ffe066'; g.fillRect(x2 - 1, y2 - 2, 2, 2); } });
      }
    },
    adopt(R, e) { e.onDieFn = () => { R.score += 1; }; },
    hud: (R) => R.score + '점' + (R.lightT > 0 ? ' · 반딧불 ' + Math.ceil(R.lightT) + '초' : '') + nextMedal(R),
  });
  /** 안개: 등불 둘레만 밝고 나머지는 어둡다. 어둠 속 몬스터는 눈빛 · 반딧불 병은 빛으로 보인다 */
  function drawFog(g, cx, cy, v) {
    const R = RUN, p = W().player; if (!R || !R.dark || !p) return;
    const rad = Math.max(30, 56 - R.D * 1.5) + (R.lightT > 0 ? 40 : 0) + Math.sin(R.el * 6) * 1.5;
    const x = p.x - cx, y = p.y - 10 - cy;
    g.save();
    g.fillStyle = 'rgba(8,10,14,0.94)';
    g.beginPath(); g.rect(0, 0, v.w, v.h); g.arc(x, y, rad, 0, 6.29, true); g.fill('evenodd');
    const gr = g.createRadialGradient(x, y, rad * 0.55, x, y, rad);
    gr.addColorStop(0, 'rgba(8,10,14,0)'); gr.addColorStop(1, 'rgba(8,10,14,0.94)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad + 0.5, 0, 6.29); g.fill();
    for (const e of G.combat.foes()) {
      const ex = e.x - cx, ey = e.y - cy - (e.h || 12) * 0.7;
      if (Math.hypot(ex - x, ey - y) < rad * 0.8) continue;
      g.fillStyle = e.elite ? '#ff9a3a' : '#ff4a5a'; g.fillRect(Math.round(ex) - 3, Math.round(ey), 2, 2); g.fillRect(Math.round(ex) + 1, Math.round(ey), 2, 2);
    }
    for (const e of R.ents) if (e.glowy && !e.dead) { const ex = e.x - cx, ey = e.y - cy - 8; const gg = g.createRadialGradient(ex, ey, 0, ex, ey, 12); gg.addColorStop(0, 'rgba(255,242,168,0.7)'); gg.addColorStop(1, 'rgba(255,242,168,0)'); g.fillStyle = gg; g.fillRect(ex - 12, ey - 12, 24, 24); }
    g.restore();
  }

  /* 12. 몬스터 몰이 (알록달록) — 순한 몬스터를 쳐서 밀어 위쪽 우리에 넣는다. 사냥꾼 몬스터가 노린다 */
  const PEN = { x0: 7 * TS, x1: 11 * TS, y0: (FL.y0 + 1) * TS, y1: (FL.y0 + 3) * TS };
  AI.arcSheep = function (e, dt) {
    const p = W().player; e.hp = e.maxHp; e.inv = 0;
    if (!p) return;
    const d = U.dist(e.x, e.y, p.x, p.y);
    e.wT = (e.wT || 0) - dt;
    if (d < 36) { const [nx, ny] = U.norm(e.x - p.x, e.y - p.y); e.go(nx * 26 * dt, ny * 26 * dt); }
    else { if (e.wT <= 0) { e.wT = 1 + rnd() * 1.5; const a = rnd() * 6.28; e.wd = [Math.cos(a), Math.sin(a)]; } e.go(e.wd[0] * 14 * dt, e.wd[1] * 14 * dt); }
    e.x = U.clamp(e.x, BX0, BX1); e.y = U.clamp(e.y, BY0, BY1);
  };
  function sheep(R) {
    const [x, y] = [px(3 + rnd() * 11), py(7 + rnd() * 3)];
    const gold = rnd() < 0.12;
    const e = foe(R, R.K.sheep || 'slime', x, y, { ai: 'arcSheep', hpMul: 400 });
    e.noContact = true; e.sheep = true; e.gold = gold; e.col = gold ? '#ffd84a' : '#e8e8f0'; e.weight = 0.45; e.wd = [0, 0];
    return e;
  }
  game('herd', { name: '몬스터 몰이', kind: 'herd', time: 60, dmg: 1, par: 7, medals: [3, 7, 11], fmt: (v) => v + '마리', prizeName: '양치기 피리', start: [8.5, 10],
    how: '순한 젤리들이 돌아다닌다. 다가가면 달아나고, 치면 밀려난다 — 위쪽 우리 안으로 몰아넣어라(+1, 금빛 +3). 사냥꾼 몬스터가 젤리를 잡아먹으면 -1. 사냥꾼은 쓰러뜨려 막아라.',
    setup(R) {
      R.score = 0; R.hunT = 4; R.sheepN = 3 + (R.D >= 6 ? 1 : 0);
      addEnt(R, { x: (PEN.x0 + PEN.x1) / 2, y: PEN.y1, sortBias: -60, update(dt) { this.t += dt; }, drawShadow(g, cx, cy) {
        const x0 = Math.round(PEN.x0 - cx), y0 = Math.round(PEN.y0 - cy), w = PEN.x1 - PEN.x0, h = PEN.y1 - PEN.y0;
        g.fillStyle = 'rgba(106,224,122,0.3)'; g.fillRect(x0, y0, w, h);
        g.fillStyle = '#3a2a1a'; g.fillRect(x0 - 1, y0 - 1, w + 2, 3); g.fillRect(x0 - 1, y0, 3, h); g.fillRect(x0 + w - 2, y0, 3, h);
        g.fillStyle = '#c89a5a'; for (let xx = 0; xx <= w; xx += 8) g.fillRect(x0 + xx - 1, y0 - 3, 2, 5);
        for (let yy = 0; yy <= h; yy += 8) { g.fillRect(x0 - 1, y0 + yy - 1, 2, 4); g.fillRect(x0 + w - 1, y0 + yy - 1, 2, 4); }
        g.fillRect(x0, y0, w, 1); g.fillRect(x0, y0, 1, h); g.fillRect(x0 + w - 1, y0, 1, h);
        g.fillStyle = 'rgba(255,224,102,' + (0.5 + Math.sin(this.t * 4) * 0.3) + ')'; g.fillRect(x0 + 2, y0 + h - 1, w - 4, 1);
        g.fillStyle = '#ffe066'; g.font = "9px 'Galmuri11', sans-serif"; g.textAlign = 'center'; g.fillText('우리', x0 + w / 2, y0 + h - 4); g.textAlign = 'left';
      } });
    },
    tick(R, dt) {
      const flock = foes().filter((e) => e.sheep);
      for (const e of flock) {
        if (e.x > PEN.x0 + 2 && e.x < PEN.x1 - 2 && e.y > PEN.y0 && e.y < PEN.y1 + 10) {
          e.dead = true; const v = e.gold ? 3 : 1; R.score += v; sfx('puzzle'); G.fx.sparks(e.x, e.y - 8, 12, '#ffe066', 80); float(e.x, e.y - 22, '+' + v, '#ffe066', v > 1);
          continue;
        }
        for (const h of foes()) if (!h.sheep && !h.dead && U.dist(h.x, h.y, e.x, e.y) < 14) { e.dead = true; R.score = Math.max(0, R.score - 1); sfx('growl'); G.fx.shards(e.x, e.y - 6, 10, '#e8e8f0'); float(e.x, e.y - 22, '잡아먹혔다 -1', '#ff6a8a', true); break; }
      }
      if (foes().filter((e) => e.sheep).length < R.sheepN) sheep(R);
      R.hunT -= dt;
      const hun = foes().filter((e) => !e.sheep);
      if (R.hunT <= 0 && hun.length < 1 + Math.floor(R.D / 4) + Math.floor(R.el / 30)) { R.hunT = Math.max(4, 9 - R.D * 0.4); const [x, y] = edgeSpot(); const h = foe(R, pick(R.K.mobs[0]), x, y); h.atk = Math.max(1, Math.round(h.atk * 0.6)); }
    },
    adopt(R, e) { },
    hud: (R) => R.score + '마리' + nextMedal(R),
  });

  /* 13. 거인 사냥 (정거장) — 쓰러지지 않는 거인 젤리에게 90초 동안 피해를 쌓는다 */
  if (G.bosses && G.bosses.variant && G.bosses.B.lvslime) G.bosses.variant('arcgiant', 'lvslime', { name: '별빛 거인', title: '별빛 오락기 · 거인 젤리 「Lv.∞」', col: '#8ad8ff', hp: 420 });
  game('giant', { name: '거인 사냥', kind: 'boss', time: 90, dmg: 1, par: 90, medals: [50, 100, 150], fmt: (v) => v + '%', prizeName: '거인 사냥꾼의 증표', start: [8.5, 10],
    how: '쓰러지지 않는 별빛 거인 젤리와 90초. 준 피해만큼 점수(거인 체력의 %). 체력이 ¼ 아래로 내려가면 다시 일어서며 더 세진다. 졸개 젤리가 거인에게 닿으면 거인이 회복한다 — 졸개부터 막아라.',
    setup(R) {
      R.score = 0; R.dmg = 0; R.ups = 0;
      const b = G.bosses.spawn(G.bosses.B.arcgiant ? 'arcgiant' : 'lvslime', px(8.5), py(5), { hpMul: 10 + R.D, noScale: true });
      b.atk = Math.max(3, Math.round(b.atk * 0.75)); b.aggro = true; if (b.start) b.start(); b.exp = 0; b.gold = 0; b.arcade = true;
      b.preKill = function () { this.hp = this.maxHp; return true; };
      R.giant = b; R.gMax = b.maxHp; R.lastHp = b.hp;
    },
    tick(R, dt) {
      const b = R.giant; if (!b || b.dead) return;
      if (b.hp < R.lastHp) R.dmg += R.lastHp - b.hp;
      if (b.hp < b.maxHp * 0.25) { b.hp = b.maxHp; R.ups++; b.atk += 1; sfx('levelup'); G.fx.ring(b.x, b.y - 16, '#8ad8ff', 40, 0.5, 3); float(b.x, b.y - 60, '거인이 다시 일어섰다! (' + R.ups + ')', '#8ad8ff', true); }
      R.lastHp = b.hp;
      R.score = Math.floor(R.dmg / R.gMax * 100);
    },
    adopt(R, e) { },
    hud: (R) => '피해 ' + R.score + '%' + (R.ups ? ' · 일으킨 ' + R.ups + '번' : '') + nextMedal(R),
  });

  /* ───────── 오락기 속 방 ───────── */
  G.build.def('arcade_room', {
    build() {
      const rm = G.build.room({ id: 'arcade_room', region: 'green', name: '오락기 속', w: 18, h: 13, floor: T.CHECKER, music: 'arcade' });
      rm.noFollow = true; rm.noCard = true; rm.dark = 0.1;
      // 문을 막는다 (끝나면 저절로 나간다)
      rm.warps.length = 0; rm.ter[rm.i(rm.exit.x, rm.exit.y)] = T.WALL;
      return rm;
    },
    ents(m, Wd) {
      const s = S(), run = s.arcadeRun;
      if (!run || !GAMES[run.g]) { RUN = null; return; }
      const Gm = GAMES[run.g], D = run.D || 0;
      const R = RUN = { G: Gm, gid: run.g, town: run.town, K: ROSTER[run.town] || ROSTER.green, D, ET: Math.min(11, D), hpMul: 1.4 + D * 0.04, atkMul: (Gm.kind === 'kill' ? 0.8 : 1) + D * 0.03,
        t: Gm.time, el: 0, ready: 1.6, score: 0, over: false, ents: [], hits: 0 };
      Gm.setup(R, Wd);
      G.cine.area(Gm.name, Gm.time + '초 · ' + STARS(D) + (Gm.dmg < 1 ? ' · 피해 절반' : ''));
      Wd.add(new G.ent.Ent({ kind: 'arcadectl', solid: false, hidden: true, x: 0, y: 0,
        update(dt) {
          if (R.over || RUN !== R || G.script.running) return;
          if (R.ready > 0) { R.ready -= dt; return; }
          R.t -= dt; R.el += dt;
          // 오락기 속에는 경험 · 골드 · 재료가 떨어지지 않는다 (하트는 가끔)
          for (const e of Wd.ents) {
            if (e.kind === 'pickup' && !e.arcOk) { e.arcOk = true; if (e.what === 'gold' || e.what === 'exp' || e.what === 'item' || (e.what === 'heart' && rnd() > 0.35)) e.dead = true; }
            else if (e.foe && !e.arcade && !e.dead) { e.arcade = true; e.exp = 0; e.gold = 0; e.mat = null; if (Gm.adopt) Gm.adopt(R, e); }
          }
          try { Gm.tick(R, dt, Wd); } catch (err) { console.error('[arcade]', err); }
          if (!R.over && R.t <= 0) end(R, 'time');
        } }));
    },
  });
  // 위쪽 띠: 게임 이름 · 점수 · 남은 시간 (왼쪽 하트 · 오른쪽 골드 사이)
  W().overlays = W().overlays || [];
  W().overlays.push((g, cx, cy, v) => { const m = W().map; if (m && m.id === 'arcade_room') drawFog(g, cx, cy, v); });
  W().overlays.push((g, cx, cy, v) => {
    const R = RUN, m = W().map;
    if (!R || !m || m.id !== 'arcade_room') return;
    const x0 = 100, w = Math.max(120, v.w - x0 - 44), y0 = 3;
    g.fillStyle = 'rgba(11,9,20,0.8)'; g.fillRect(x0, y0, w, 30);
    g.fillStyle = palOf(R.D).top; g.fillRect(x0, y0, w, 1);
    const k = Math.max(0, R.t / R.G.time);
    g.fillStyle = '#2a2238'; g.fillRect(x0 + 3, y0 + 26, w - 6, 2);
    g.fillStyle = R.t < 10 ? '#ff6a8a' : '#6ae07a'; g.fillRect(x0 + 3, y0 + 26, Math.round((w - 6) * k), 2);
    g.font = "11px 'Galmuri11', sans-serif"; g.textAlign = 'left'; g.fillStyle = '#e8d8a8';
    g.fillText(R.G.name + ' ' + STARS(R.D), x0 + 4, y0 + 11);
    g.textAlign = 'right'; g.fillStyle = R.t < 10 ? '#ff6a8a' : '#ffe066';
    g.fillText(R.ready > 0 ? '준비…' : Math.max(0, Math.ceil(R.t)) + '초', x0 + w - 4, y0 + 11);
    g.textAlign = 'center'; g.fillStyle = '#ffffff';
    g.fillText(R.G.hud(R), x0 + w / 2, y0 + 23);
    g.textAlign = 'left';
  });

  /** 끝: 몬스터 · 장치를 거두고 결과 · 상금 · 메달 */
  function end(R, why) {
    if (R.over) return;
    R.over = true; R.why = why;
    const s = S();
    for (const e of G.combat.foes()) e.dead = true;
    for (const e of R.ents) e.dead = true;
    for (const e of W().ents) if (e.kind === 'warn' || (e.owner === 'foe' && e.kind !== 'foe')) e.dead = true;
    const Gm = R.G, bonus = Gm.finishBonus ? Gm.finishBonus(R, why) : 0;
    const score = Math.max(0, R.score + bonus);
    const perf = Math.min(2.5, score / parAt(Gm, R.D)), cost = costOf(R.D);
    const half = why === 'down' || why === 'fail';
    const gap = Math.max(0, s.lv - EXP_LV[Math.min(10, R.D)]), ek = U.clamp(1 - gap / 15, 0.15, 1);
    let gold = Math.round(cost * 2.4 * perf * (1 + R.D * 0.08)), exp = Math.round(G.data.expNext(s.lv) * 0.06 * perf * (1 + R.D * 0.12) * ek);
    if (half) { gold = Math.round(gold * 0.5); exp = Math.round(exp * 0.5); }
    const ms = score;
    G.script.run(async (c) => {
      c.sfx('bell'); await c.wait(0.5);
      const head = why === 'down' ? '[r]쓰러졌다 — GAME OVER[/]' : why === 'fail' ? '[r]실패 — GAME OVER[/]' : '[y]TIME UP![/]';
      const old = best(R.gid), oldHere = bestAt(R.gid, R.town);
      await c.narr(head + '\n「' + Gm.name + '」 ' + STARS(R.D) + ' — [y]' + Gm.fmt(score) + '[/]' + (bonus ? ' (보너스 +' + bonus + ')' : '') + (score > old ? '\n[y]새 기록![/]' : '\n최고 기록 ' + Gm.fmt(old)) + (score > oldHere && oldHere ? ' · 이 오락기 새 기록' : '') + (half ? '\n[s]끝까지 못 가서 상금은 절반[/]' : ''));
      if (score > old) { if (R.gid === 'lvup') s.flags.arcade_best = score; else s.flags['arc:best:' + R.gid] = score; }
      if (score > oldHere) s.flags['arc:best:' + R.gid + ':' + R.town] = score;
      if (gold > 0 || exp > 0) { c.gold(gold); c.exp(exp); await c.narr('오락기가 동전을 토해 냈다. [y]' + gold + '골드[/] · 빛 알갱이 ' + exp); }
      // 메달: 이 오락기만의 보상
      const RS = R.K;
      for (let k2 = 0; k2 < 3; k2++) {
        const fl = MEDAL_FLAG(R.gid, k2);
        if (ms < Gm.medals[k2] || f(fl)) continue;
        c.flag(fl); c.sfx('learn');
        await c.narr('[y]' + MEDAL_NAME[k2] + '메달[/] — ' + cabName(R.town) + ' 「' + Gm.name + '」' + (R.gid === 'lvup' && k2 === 1 ? '\n동전 구멍에서 작은 열쇠가 굴러 나왔다.' : ''));
        await givePrize(c, RS.prize[k2]);
      }
      // 판마다 경품 뽑기 (오락기마다 다른 물건)
      const chance = U.clamp(perf * 0.5, 0.1, 0.9) * (half ? 0.5 : 1);
      if (rnd() < chance) {
        const tot = RS.pool.reduce((a, q) => a + q[2], 0); let r2 = rnd() * tot, got = RS.pool[0];
        for (const q of RS.pool) { r2 -= q[2]; if (r2 <= 0) { got = q; break; } }
        c.sfx('item'); await c.narr('경품 뽑기 — 당첨!'); await c.getItem(got[0], got[1]);
      }
      if (!f('arc:allgold') && ALL.every((gid) => f(MEDAL_FLAG(gid, 2)))) { c.flag('arc:allgold'); await c.narr('열세 오락기 화면에 동시에 같은 글씨가 떴다.\n[y]「오락실의 전설」[/]'); await c.getItem('ac_arcking'); }
      const r = s.arcadeRet || { map: 'world', x: px(G.ow.towns.green.plaza.x), y: py(G.ow.towns.green.plaza.y) };
      await c.fade(true, { sec: 0.3 });
      RUN = null; s.arcadeRun = null;
      G.game.goto(r.map, r.x, r.y, 'down');
      s.hp = Math.max(s.hp, 1);
      await c.fade(false, { sec: 0.3 });
    });
  }

  // 오락기 속에서 맞으면: 진짜로 다친다 (많이 잡는 게임은 절반). 체력이 ¼칸 남으면 게임 오버 — 쓰러지지는 않는다
  const hp0 = G.combat.hurtPlayer;
  G.combat.hurtPlayer = function (p, q, src, opt) {
    const m = W().map;
    if (!(m && m.id === 'arcade_room')) return hp0.apply(this, arguments);
    const R = RUN;
    if (!R || R.over || R.ready > 0) return false;
    const s = S(), was = s.duel;
    let ok;
    s.duel = true;
    try { ok = hp0.call(this, p, q * R.G.dmg, src, opt); } finally { s.duel = was; }
    if (ok) { R.hits++; if (R.G.onHurt) R.G.onHurt(R); if (s.hp <= 1) { G.fx.float(p.x, p.y - 34, '그만!', '#ff6a8a', { big: true }); end(R, 'down'); } }
    return ok;
  };
  // 기록 도중 저장되지 않게: 오락기 속에서 이어하기면 밖으로 (96_sanity)
  ST.onMap('arcade_room', () => {});

  // 오락기 자리: 열두 마을 광장 곁 + 하늘 정거장
  ST.onMap('world', (m, Wd) => {
    for (const [n, K] of Object.entries(CABS)) {
      if (!K.at) continue;
      const t = OW.towns[n]; if (!t || !t.plaza) continue;
      // 앞(아래) 두 칸과 양옆이 트인 곳 — 집 뒤 · 지붕 밑에 숨지 않게
      const h0 = m.hgt[m.i(t.plaza.x, t.plaza.y)];
      const open = (xx, yy) => { for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 1; dx++) { const x2 = xx + dx, y2 = yy + dy; if (!m.inb(x2, y2) || m.blocked(x2, y2) || m.hgt[m.i(x2, y2)] !== h0) return false; const t2 = m.ter[m.i(x2, y2)]; if (t2 === T.WATER || t2 === T.DEEP || t2 === T.CLIFF || t2 === T.STAIRS) return false; } return true; };
      let [x, y] = OW.near(m, t.plaza.x + K.at[0], t.plaza.y + K.at[1], (xx, yy) => open(xx, yy), 9);
      if (!open(x, y)) [x, y] = OW.near(m, t.plaza.x + K.at[0], t.plaza.y + K.at[1], null, 5);
      if (x == null) continue;
      Wd.add(new Arcade({ x: px(x), y: py(y), town: n }));
    }
  });
  ST.onMap('station', (m, Wd) => { Wd.add(new Arcade({ x: px(12), y: py(14), town: 'station' })); });

  /* ───────── 옛 전설 책장 ───────── */
  const BOOKS = {
    b_lib: [[3, 2, '『무한으로 렙업하기』', '천 년도 더 된 모험담. 한 용사가 초록 마을에서 시작해 빨강 · 파랑 · 노랑 … 빛깔 이름을 한 마을들을 차례로 지나며 렙업했다는 이야기다.\n마지막 장에는 딱 한 줄: 「그리고 하늘 너머로.」\n[s]여백에 아이 글씨: 「나도 할래! 무한으로!」[/]']],
    p_academy: [[4, 2, '『무한으로 렙업하자!!』', '『무한으로 렙업하기』의 뒷이야기. 다른 용사가 같은 길을 다시 걸으며 「이번엔 더 멀리」라고 외쳤다고 한다.\n책 끝에 찍힌 공방 표시: 블록 모양 도장. 「엔트리 공방에서 찍음」.']],
    g_chief: [[2, 2, '『번쩍이는 기록 보관소』', '옛날 옛적 이야기들을 번쩍이는 판에 새겨 두던 보관소가 있었다고 한다. 판이 멎어도 이야기는 남았다.\n[s]보관소 목록 첫 줄: 「무한으로 렙업하기 — 보관됨」.[/]']],
  };
  for (const [room, list] of Object.entries(BOOKS)) {
    ST.onMap(room, (m, Wd) => {
      for (const [x, y, title, text] of list) Wd.add(new G.props.Spot({ x: px(x), y: py(y) + 2, verb: title + '을 읽는다', text: async (c) => { await c.narr('[y]' + title + '[/]\n' + text); if (!f('book:' + title)) { c.flag('book:' + title); c.exp(30); } } }));
    });
  }
  G.arcade = { Arcade, GAMES, CABS, ROSTER, run: () => RUN, end: (why) => RUN && end(RUN, why || 'time') };
})();
