/* 길가와 들판: 넓어진 대륙의 빈 곳을 채운다
   길을 따라 30~46칸마다 쉼터 하나 — 야영지(쉬고 기록) · 길가 사당(축복) · 떠돌이 행상 · 이정표(가까운 마을까지 몇 칸)
   · 폐허(정예가 지키는 상자) · 부서진 수레(열면 매복) · 우물 쉼터 · 몬스터 둥지(다 쓰러뜨리면 상자) · 수수께끼 비석 · 전망대(둘레 안개 걷기)
   길에서 떨어진 들판에는 — 고목(요정 샘) · 선돌 고리 · 수정 광맥 · 외딴 무덤. 지역마다 말과 빛깔이 다르다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;

  /* ───────── 지역마다의 말 ───────── */
  const NAME = (n) => (OW.SHORT && OW.SHORT[n]) || n;
  const TRAVELER = {
    green: [['farmer', '씨앗 장수', '그린 씨앗은 어디 심어도 싹이 나. 탑 근처만 빼고. 거긴 흙이 늘 배고파.'], ['kidg', '길 잃은 아이', '엄마가 이 길로 곧장 가면 집이래. 근데 길이 자꾸 구부러져.']],
    red: [['miner', '떠돌이 광부', '광산이 문을 닫으면 우리는 걸어. 걷는 것도 캐는 거야. 발밑을.'], ['smith', '칼갈이', '칼을 갈아 줄까? …아니, 네 칼은 이미 무언가를 알고 있군.']],
    blue: [['sailor', '뭍에 오른 선원', '파도 소리가 안 들리면 잠이 안 와. 그래서 조개껍질을 귀에 대고 자.'], ['scholar', '방랑 학자', '도서관에 없는 책은 길에 있어. 길이 제일 두꺼운 책이야.']],
    yellow: [['merchant', '대상 우두머리', '모래는 발자국을 삼키지. 그래서 우리는 별을 따라가. 별은 값을 안 받거든.'], ['merchantw', '향신료 장수', '이 향 한 번 맡아 볼래? 공짜야. 두 번째부터 돈이야.']],
    purple: [['mage', '떠돌이 마도사', '이 숲은 해가 지는 중이야. 천 년째. 서두르지 않는 게 이 숲의 매력이지.'], ['student', '도망친 학원생', '시험? 거울 연못에 비친 내가 대신 보러 갔어. …아마도.']],
    rainbow: [['clown', '떠돌이 광대', '색이 빠진 사람들한테 색을 칠해 줘. 공짜로. 웃으면 색이 오래 가.'], ['kidg', '구름 보는 아이', '구름 하나가 고래 모양이었어! 진짜 고래였을지도.']],
    white: [['nun', '순례하는 수녀', '기도는 공짜가 아니래요. 그래서 저는 걸어서 내요. 한 걸음에 한 마디.'], ['oldm', '얼음 낚시꾼', '얼음 밑에도 빛이 있어. 물고기들이 가져가지. 세금 없이.']],
    gray: [['mech', '고철 줍는 이', '회색 땅의 고철엔 색이 조금 묻어 있어. 모으면 한 줌 된다고.'], ['miner', '폐광 순찰', '광맥 쪽엔 가지 마. 빛을 먹는 소리가 들려. 쩝, 쩝.']],
    black: [['nightw', '등불 든 여인', '밤길엔 등불이 둘이면 좋아. 하나는 길을, 하나는 얼굴을 비추게.'], ['nightm', '그림자 세는 사내', '그림자가 주인보다 먼저 지쳤대. 오늘 내 그림자는 좀 쉬고 있어.']],
    colorful: [['inventor', '떠돌이 발명가', '이 수레 바퀴는 네모야. 둥근 건 너무 흔하잖아. …아, 그래서 안 굴러가는구나.'], ['kid', '폭죽 줍는 아이', '어젯밤 불꽃 찌꺼기! 모아서 내가 로켓 만들 거야.']],
    mist: [['sailor', '늪 뱃사공', '안개 속에선 소리가 늦게 와. 방금 네가 한 말, 난 내일 들을지도.'], ['oldw', '백합 캐는 할머니', '안개 백합은 달이 없을 때만 핀다오. 누군가 기다릴 때처럼.']],
    amber: [['farmerw', '단풍 줍는 이', '협곡 단풍잎은 소리를 기억해. 밟으면 옛날 목소리가 바삭거려.'], ['guard', '협곡 순찰병', '메아리 협곡 쪽엔 대답하지 마. 협곡이 대신 대답하거든.']],
  };
  const SHRINE = {
    green: '초록의 사당. 이끼 낀 돌 위에 누군가 매일 새 잎을 올려 둔다.', red: '불꽃의 사당. 식지 않는 돌 하나. 손을 대면 심장 소리가 난다.', blue: '파도의 사당. 조개껍질로 쌓은 탑. 바람이 불면 바다 소리가 난다.',
    yellow: '황금의 사당. 동전이 가득한 그릇. 아무도 가져가지 않는다. 가져가면 모래가 된다고.', purple: '노을의 사당. 늘 해 질 녘의 빛이 머문다.', rainbow: '일곱 빛깔의 사당. 무지개 조각이 박힌 돌.',
    white: '눈의 사당. 얼음 속에 촛불 하나가 녹지 않고 탄다.', gray: '잿빛의 사당. 색 없는 돌에 누군가 분필로 꽃을 그려 두었다.', black: '밤의 사당. 별 모양 구멍 사이로 빛이 샌다.',
    colorful: '발명의 사당. 태엽 달린 작은 신상이 고개를 끄덕인다.', mist: '안개의 사당. 물에 반쯤 잠긴 돌. 비친 얼굴이 조금 늦게 따라온다.', amber: '메아리의 사당. 속삭이면 사당이 한 번 더 속삭인다.',
  };
  const EPITAPH = [
    '「여기 한 사람이 잠들다. 레벨 12. 장부에는 「손실 1」.」', '「세금을 다 내고 떠났다. 남긴 것은 없다. 아이 하나를 빼고.」', '「나는 렙업하지 않았다. 대신 누군가를 업어 주었다.」',
    '「983년 겨울. 이름 대신 숫자 하나.」 — 그 밑에 누군가 손톱으로 이름을 새겨 두었다.', '「빛을 모두 바치고 색을 잃은 사람. 무덤 둘레에만 꽃이 핀다.」', '「기다리다 잠들었다. 깨우지 말 것. 올 사람이 오면 저절로 깬다.」',
  ];
  const RIDDLE = [
    ['세면 셀수록 줄어드는 것은?', ['남은 날', '별', '빛'], 0], ['나누면 나눌수록 커지는 것은?', ['금화', '빛', '장부'], 1],
    ['주인보다 먼저 지치는 것은?', ['발', '그림자', '등불'], 1], ['삼키면 두 번째가 되는 것은?', ['흑점', '이슬', '물'], 0],
    ['다섯 갈래로 쪼갰지만 원래 하나였던 것은?', ['길', '빛', '강'], 1], ['날지 못하지만 매일 아침 지붕에 오르는 것은?', ['닭', '다람쥐', '연기'], 1],
    ['쓰지 않으면 녹슬고, 쓰면 닳는 것은?', ['검', '약속', '이름'], 0], ['세는 사람이 끝내 세지 못한 것은?', ['빗방울', '예비 그릇 하나', '금화'], 1],
  ];
  const LOOT = {
    lo: [['potion_r', 2], ['arrows10', 1], ['bombs5', 1], ['food_bread', 2]],
    mid: [['potion_b', 1], ['potion_g', 1], ['potion_r', 3], ['arrows10', 2]],
    hi: [['potion_max', 1], ['potion_g', 2], ['potion_b', 2]],
  };
  const lootFor = (tier, r) => { const tb = tier >= 7 ? LOOT.hi : tier >= 3 ? LOOT.mid : LOOT.lo; const [id, n] = tb[Math.floor(r * tb.length) % tb.length]; return G.data.ITEMS[id] ? [id, n] : ['potion_r', 1]; };

  /* ───────── 모닥불 · 둥지 ───────── */
  class Campfire extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'campfire', solid: true, bw: 12, bh: 6 }, o)); this.glowR = 64; this.glowY = 6; }
    blockBox() { return { x: this.x - 6, y: this.y - 6, w: 12, h: 6 }; }
    update(dt, Wd) { this.t += dt; this.glowR = 60 + Math.sin(this.t * 9) * 4; const p = Wd.player; if (!p || Math.abs(p.x - this.x) > 320 || Math.abs(p.y - this.y) > 220) return; if (Math.random() < dt * 14) G.fx.part({ x: this.x + (Math.random() - 0.5) * 6, y: this.y - 2, z: 4, vz: 22, g: 0, life: 0.5, col: Math.random() < 0.5 ? '#ffb040' : '#ff7a2a', size: 1, glow: true }); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      g.fillStyle = '#6a4a2a'; g.fillRect(x - 7, y - 3, 14, 3); g.fillStyle = '#4a3220'; g.fillRect(x - 5, y - 5, 10, 2);
      const fl = Math.floor(this.t * 10) % 3;
      g.fillStyle = '#ff7a2a'; g.fillRect(x - 4, y - 8 - fl, 8, 5 + fl); g.fillStyle = '#ffd84a'; g.fillRect(x - 2, y - 7 - fl, 4, 4 + fl); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 5, 2, 2);
      g.fillStyle = '#8a8a90'; for (const [a, b] of [[-8, -1], [7, -1], [-6, 1], [5, 1]]) g.fillRect(x + a, y + b, 2, 2);
    }
  }
  /** 둥지: 가까이 가면 무리가 일어난다. 다 쓰러뜨리면 상자 */
  class Nest extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'nest', solid: false, hidden: true }, o)); this.foes = null; }
    update(dt, Wd) {
      const p = Wd.player; if (!p || f(this.key)) return;
      const d = U.dist(p.x, p.y, this.x, this.y);
      if (!this.foes && d < 110) {
        this.foes = [];
        const tb = OW.TABLE[this.reg] || OW.TABLE.green;
        for (let i = 0; i < this.n; i++) { const a = (i / this.n) * Math.PI * 2; const t = tb[Math.floor(U.hash(this.key + i) % tb.length)][0]; const e = G.foes.spawn(t === 'octo' ? 'slime' : t, this.x + Math.cos(a) * 30, this.y + Math.sin(a) * 20, { tier: this.tier, elite: i === 0 ? true : undefined, noElite: i !== 0 }); e.aggro = true; this.foes.push(e); }
        G.ui.toast('몬스터 둥지다!', 'bad'); if (G.audio) G.audio.sfx('encounter');
      }
      if (this.foes && this.foes.length && this.foes.every((e) => e.dead)) {
        S().flags[this.key] = true; this.dead = true;
        const [id, n] = lootFor(this.tier, U.hash(this.key) % 97 / 97);
        const ch = new G.props.Chest({ x: this.x, y: this.y, item: id, n, flagKey: this.key + ':chest', col: '#e8c048' }); ch.appear = 0.8; Wd.add(ch);
        G.fx.glow(this.x, this.y - 6, '#fff2a8', 18); if (G.audio) G.audio.jingle('secret'); G.ui.toast('둥지를 치웠다 — 상자가 드러났다', 'good');
      }
      if (this.foes && d > 420) { for (const e of this.foes) if (!e.dead) e.dead = true; this.foes = null; }   // 멀리 가면 다음에 다시
    }
  }

  /* ───────── 자리 고르기 ───────── */
  const STOPS = [];   // { type, x, y, reg, tier, id }
  function okArea(m, x0, y0, w, h) {
    const hh = m.hgt[m.i(x0, y0)];
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      if (!m.inb(x, y)) return false;
      const i = m.i(x, y), t = m.ter[i];
      if (m.hgt[i] !== hh || m.solidExtra[i] || OW.roadTiles[i] || OW.sea[i]) return false;
      if (t === T.CLIFF || t === T.STAIRS || t === T.WATER || t === T.DEEP || t === T.LAVA || t === T.BRIDGE || t === T.CLOUD) return false;
    }
    // 이야기 자리 · 문 · 씨앗에서 떨어져
    for (const w of m.warps || []) if (Math.abs(w.x - x0) < 10 && Math.abs(w.y - y0) < 10) return false;
    for (const sd of ST.seeds || []) if (sd.map === 'world' && Math.abs(sd.x - x0) < 5 && Math.abs(sd.y - y0) < 5) return false;
    if (OW.inTown(x0, y0, 12) || OW.inTown(x0 + w, y0 + h, 12)) return false;
    for (const s of STOPS) if (Math.abs(s.x - x0) < 13 && Math.abs(s.y - y0) < 13) return false;
    return true;
  }
  const TYPES = [['camp', 3], ['sign', 2], ['shrine', 2], ['peddler', 1.3], ['ruin', 1.5], ['cart', 1.2], ['well', 1], ['nest', 1.6], ['riddle', 0.9], ['lookout', 0.7]];
  function pickType(r, last) { for (let k = 0; k < 4; k++) { let s = TYPES.reduce((a, t) => a + t[1], 0) * ((r * 7919 + k * 0.37) % 1); for (const [t, w] of TYPES) { s -= w; if (s <= 0) { if (t !== last) return t; break; } } } return 'camp'; }

  OW.hooks.push((m) => {
    const rnd = U.rng(9127);
    // 1) 길 따라
    let last = null;
    for (const poly of OW.roadPaths || []) {
      let acc = 0, gap = 18 + rnd() * 16;
      for (let k = 0; k < poly.length - 1; k++) {
        const [ax, ay] = poly[k], [bx, by] = poly[k + 1];
        const L = Math.hypot(bx - ax, by - ay); if (!L) continue;
        for (let s = 0; s < L; s += 1) {
          acc += 1; if (acc < gap) continue;
          const t = s / L, x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
          const nx = -(by - ay) / L, ny = (bx - ax) / L;
          const type = pickType(rnd(), last);
          const [w, h] = type === 'camp' || type === 'ruin' || type === 'nest' ? [6, 5] : type === 'lookout' || type === 'well' || type === 'cart' ? [5, 4] : [3, 3];
          let cx = 0, cy = 0, ok = false;
          for (const [off, side] of [[4, 1], [4, -1], [6, 1], [6, -1], [8, 1], [8, -1]]) {
            cx = Math.round(x + nx * off * side); cy = Math.round(y + ny * off * side);
            if (m.inb(cx, cy) && okArea(m, cx - (w >> 1), cy - (h >> 1), w, h)) { ok = true; break; }
          }
          if (!ok) continue;
          const reg = OW.regName[m.i(cx, cy)];
          acc = 0; gap = 22 + rnd() * 14; last = type;
          STOPS.push({ type, x: cx, y: cy, reg, tier: OW.TIERS[reg] || 0, id: type + ':' + cx + ',' + cy, road: true });
        }
      }
    }
    // 2) 들판
    const CELLW = 24;
    for (let gy = 0; gy < m.h / CELLW; gy++) for (let gx = 0; gx < m.w / CELLW; gx++) for (let tries = 0; tries < 4; tries++) {
      if (tries === 0 && rnd() > 0.8) break;
      const cx = Math.floor(gx * CELLW + 4 + rnd() * (CELLW - 8)), cy = Math.floor(gy * CELLW + 4 + rnd() * (CELLW - 8));
      if (!m.inb(cx, cy) || OW.sea[m.i(cx, cy)]) continue;
      let nearRoad = false; for (let dy = -6; dy <= 6 && !nearRoad; dy += 2) for (let dx = -6; dx <= 6; dx += 2) if (m.inb(cx + dx, cy + dy) && OW.roadTiles[m.i(cx + dx, cy + dy)]) { nearRoad = true; break; }
      if (nearRoad) continue;
      const reg = OW.regName[m.i(cx, cy)];
      const type = U.pick(['grove', 'stones', 'crystal', 'grave', 'nest', 'ruin', 'camp'], rnd());
      if (!okArea(m, cx - 3, cy - 2, 6, 5)) continue;
      STOPS.push({ type, x: cx, y: cy, reg, tier: OW.TIERS[reg] || 0, id: type + ':' + cx + ',' + cy });
      break;
    }
    // 3) 땅 고르기 · 사물 놓기
    for (const s of STOPS) {
      const { x, y } = s, hh = m.hgt[m.i(x, y)];
      const put = (dx, dy, o) => { const i = m.i(x + dx, y + dy); if (m.inb(x + dx, y + dy) && !m.solidExtra[i] && !OW.roadTiles[i]) m.obj[i] = o; };
      const ground = (w, h, t) => OW.clear(m, x - (w >> 1), y - (h >> 1), w, h, hh, t || null);
      switch (s.type) {
        case 'camp': ground(6, 5, T.DIRT); G.build.placeBuilding(m, { special: 'tent', tx: x - 3, ty: y - 3, w: 2, h: 2, col: s.reg === 'black' ? '#4a3a6a' : s.reg === 'white' ? '#c8d8e8' : '#b8883a', door: false }); put(2, 1, O.BENCH); put(-2, 2, O.CRATE); break;
        case 'shrine': ground(3, 3, T.STONE); G.build.placeBuilding(m, { special: 'statue', tx: x - 1, ty: y - 2, w: 1, h: 1, door: false }); put(-1, 1, O.FLOWER); put(1, 1, O.FLOWER); break;
        case 'peddler': ground(3, 3, null); put(1, -1, O.CART); put(-1, -1, O.BARREL); break;
        case 'sign': put(0, -1, O.SIGNPOST); break;
        case 'ruin': ground(6, 5, T.GRAVEL); for (const [dx, dy] of [[-3, -2], [2, -2], [-3, 2], [3, 1]]) put(dx, dy, O.PILLAR); put(-1, -2, O.RUBBLE); put(1, 2, O.RUBBLE); break;
        case 'cart': ground(5, 4, null); put(-1, -1, O.CART); put(1, -1, O.CRATE); put(2, 0, O.BARREL); put(-2, 1, O.CRATE); break;
        case 'well': ground(5, 4, T.STONE); G.build.placeBuilding(m, { special: 'well', tx: x, ty: y - 1, w: 1, h: 1, door: false }); put(-2, 1, O.BENCH); put(2, 1, O.PLANTER); break;
        case 'nest': ground(6, 5, T.DIRT); for (const [dx, dy] of [[-3, -1], [3, -1], [-2, 2], [2, 2], [0, -2]]) put(dx, dy, O.BONES); put(-3, 1, O.ROCK); put(3, 1, O.ROCK); break;
        case 'riddle': ground(3, 3, null); break;
        case 'lookout': ground(5, 4, T.GRAVEL); G.build.placeBuilding(m, { special: 'tower', tx: x - 1, ty: y - 2, w: 3, h: 2, col: '#8a7a6a', door: false }); break;
        case 'grove': ground(6, 5, null); put(0, -2, O.BIGTREE); for (const [dx, dy] of [[-2, 1], [2, 1], [-1, 2], [1, 2], [-3, 0], [3, 0]]) put(dx, dy, O.FLOWER); break;
        case 'stones': ground(6, 5, null); for (const [dx, dy] of [[-3, 0], [3, 0], [-2, -2], [2, -2], [-2, 2], [2, 2]]) put(dx, dy, O.PILLAR); break;
        case 'crystal': ground(5, 5, null); for (const [dx, dy] of [[-2, -1], [2, -1], [0, -2], [-2, 1], [2, 1]]) put(dx, dy, O.CRYSTAL); put(0, 0, 0); break;
        case 'grave': ground(3, 3, null); put(0, -1, O.GRAVE); put(-1, 0, O.FLOWER); put(1, 0, O.FLOWER); break;
        default: break;
      }
    }
    OW.stops = STOPS;
  });

  /* ───────── 들어설 때: 사람 · 불 · 상자 · 글 ───────── */
  const nearestTowns = (x, y) => Object.entries(OW.towns).map(([n, t]) => [n, t.plaza ? t.plaza.x : t.x, t.plaza ? t.plaza.y : t.y]).map(([n, tx, ty]) => [n, Math.round(Math.hypot(tx - x, ty - y)), tx, ty]).sort((a, b) => a[1] - b[1]).slice(0, 3);
  const dirWord = (dx, dy) => { const a = Math.atan2(dy, dx) * 180 / Math.PI; return a > -22.5 && a <= 22.5 ? '동' : a > 22.5 && a <= 67.5 ? '남동' : a > 67.5 && a <= 112.5 ? '남' : a > 112.5 && a <= 157.5 ? '남서' : a > 157.5 || a <= -157.5 ? '서' : a > -157.5 && a <= -112.5 ? '북서' : a > -112.5 && a <= -67.5 ? '북' : '북동'; };
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    for (const s of OW.stops || []) {
      const X = px(s.x), Y = py(s.y), key = 'poi:' + s.id;
      const r = (U.hash(s.id) % 1000) / 1000;
      switch (s.type) {
        case 'camp': {
          Wd.add(new Campfire({ x: X, y: Y + 4 }));
          const [look, nm, line] = (TRAVELER[s.reg] || TRAVELER.green)[Math.floor(r * 2)];
          Wd.add(new P.NPC({ x: X + 20, y: Y + 2, dir: 'left', look: G.cast.folk(look), name: nm, talk: async (c, n) => {
            await c.say(n, line, { face: 'normal' });
            const k = await c.choice('모닥불이 따뜻하다.', ['불가에서 쉰다 (체력 회복 · 기록)', '이야기를 더 듣는다', '그만둔다']);
            if (k === 0) await c.rest();
            else if (k === 1) await c.say(n, U.pick(['요즘 길에 정예라는 놈들이 돌아다녀. 이름표가 붙어 있고, 빛이 번쩍여. 이겨 내면 주머니가 두둑해진다더군.', '길가 사당에 빌면 몸이 가벼워진대. 한 사당에 한 번씩만.', '저 앞에 부서진 수레가 있었지. 함부로 열지 마. 도적들이 기다려.', '전망대에 올라가면 먼 데까지 보여. 지도가 밝아지지.', '대륙이 넓어졌어. 아니, 우리가 작아진 건지도.']), { face: 'smile' });
          } }));
          break;
        }
        case 'shrine':
          Wd.add(new P.Spot({ x: X, y: Y + 2, verb: f(key) ? '사당을 본다' : '사당에 빈다', sparkle: !f(key), text: async (c) => {
            await c.narr(SHRINE[s.reg] || SHRINE.green);
            if (f(key)) { await c.narr('이미 빌었다. 돌이 조용하다.'); return; }
            c.flag(key); c.sfx('fairy');
            const k = Math.floor(r * 3);
            const st = S(); st.buffs = (st.buffs || []).filter((b) => b.until > st.t);
            if (k === 0) { st.buffs.push({ atk: 1.2, until: st.t + 180, col: '#ff8a5a' }); await c.say(null, '[y]힘의 축복[/] — 3분 동안 공격 +20%', { style: 'sys' }); }
            else if (k === 1) { st.buffs.push({ def: 0.8, until: st.t + 180, col: '#8ac8ff' }); await c.say(null, '[y]보호의 축복[/] — 3분 동안 받는 피해 -20%', { style: 'sys' }); }
            else { c.exp(20 + s.tier * 40); c.heal(); await c.say(null, '[y]빛의 축복[/] — 빛 알갱이를 얻고 몸이 가벼워졌다', { style: 'sys' }); }
            S().shrines = (S().shrines || 0) + 1;
            if (S().shrines === 10) { S().pts = (S().pts || 0) + 2; await c.say(null, '사당 열 곳에서 빌었다. [y]성장 점수 +2[/]', { style: 'sys' }); }
          } }));
          break;
        case 'peddler': {
          const shop = G.data.SHOPS[s.reg] ? s.reg : 'green';
          Wd.add(new P.NPC({ x: X, y: Y + 2, dir: 'down', look: G.cast.folk(r < 0.5 ? 'merchant' : 'merchantw'), name: '떠돌이 행상', talk: async (c, n) => { await c.say(n, U.pick(['길 위의 가게요! 마을보다 조금 비싸고, 마을보다 조금 가까워요.', '어서 와요. 오늘은 ' + NAME(s.reg) + ' 물건이 많아요.', '짐이 무거워서 팔고 싶어요. 도와주는 셈 치고!']), { face: 'smile' }); await c.shop(shop); } }));
          break;
        }
        case 'sign': {
          const near = nearestTowns(s.x, s.y);
          const text = '이정표\n' + near.map(([n, d, tx, ty]) => '→ ' + NAME(n) + ' · ' + dirWord(tx - s.x, ty - s.y) + '쪽 ' + d + '칸').join('\n');
          Wd.add(new P.Sign({ x: X, y: Y, text, anyDir: true }));
          break;
        }
        case 'ruin': {
          const [id, n] = lootFor(s.tier + 1, r);
          Wd.add(new P.Chest({ x: X, y: Y, item: id, n, flagKey: key + ':chest' }));
          if (!f(key + ':chest')) { const tb = OW.TABLE[s.reg] || OW.TABLE.green; const t = tb[Math.floor(r * tb.length)][0]; const e = G.foes.spawn(t === 'octo' || t === 'bug' ? 'golem' : t, X + 24, Y + 10, { tier: s.tier, elite: true }); e.home = { x: e.x, y: e.y }; }
          Wd.add(new P.Sign({ x: X - 30, y: Y + 14, look: 'stone', anyDir: true, text: U.pick(['무너진 기둥에 새긴 글: 「이 탑은 빛을 모으지 않았다. 사람을 모았다.」', '폐허의 초석. 「천년력 612년 — 은빛 왕국 전초기지」', '반쯤 깨진 명판. 「징수소 제' + (s.x % 90 + 10) + '호. 폐쇄.」']) }));
          break;
        }
        case 'cart': {
          const [id, n] = lootFor(s.tier + 1, r);
          const ch = new P.Chest({ x: X + 4, y: Y + 6, item: id, n, flagKey: key + ':chest' });
          const use0 = ch.use.bind(ch);
          ch.use = (p) => { use0(p); if (!f(key + ':ambush')) { S().flags[key + ':ambush'] = true; G.ui.toast('매복이다!', 'bad'); if (G.audio) G.audio.sfx('encounter'); const kinds = s.tier >= 6 ? ['assassin', 'berserk', 'lancer'] : s.tier >= 3 ? ['bandit', 'berserk', 'bandit'] : ['bandit', 'bandit', 'spider']; kinds.forEach((t, i) => { const a = i * 2.1; const e = G.foes.spawn(t, X + Math.cos(a) * 60, Y + Math.sin(a) * 40, { tier: s.tier }); e.aggro = true; }); } };
          Wd.add(ch);
          break;
        }
        case 'well':
          Wd.add(new P.Spot({ x: X, y: Y + 8, verb: '우물물을 마신다', text: async (c) => { const st = S(), d = G.st.derive(st); st.hp = Math.min(d.hpMax, st.hp + Math.ceil(d.hpMax / 2)); c.sfx('heal'); await c.say(null, '차가운 물. 몸이 반쯤 살아났다.', { style: 'sys' }); } }));
          if (r < 0.6) { const [look, nm, line] = (TRAVELER[s.reg] || TRAVELER.green)[1 - Math.floor(r * 2)]; Wd.add(new P.NPC({ x: X - 30, y: Y + 14, dir: 'right', look: G.cast.folk(look), name: nm, talk: async (c, n) => { await c.say(n, line, { face: 'normal' }); } })); }
          break;
        case 'nest':
          if (!f(key)) Wd.add(new Nest({ x: X, y: Y, key, n: 4 + Math.floor(r * 3), reg: s.reg, tier: s.tier }));
          else if (!f(key + ':chest')) { const [id, n] = lootFor(s.tier, U.hash(key) % 97 / 97); Wd.add(new P.Chest({ x: X, y: Y, item: id, n, flagKey: key + ':chest', col: '#e8c048' })); }
          break;
        case 'riddle': {
          const [q, opts, ans] = RIDDLE[Math.floor(r * RIDDLE.length)];
          Wd.add(new P.Sign({ x: X, y: Y, look: 'stone', anyDir: true, text: async (c) => {
            if (f(key)) { await c.narr('수수께끼 비석. 네가 새긴 답이 남아 있다: 「' + opts[ans] + '」'); return; }
            await c.narr('수수께끼 비석.\n「' + q + '」');
            const k = await c.choice('답을 새긴다.', opts);
            if (k === ans) { c.flag(key); c.sfx('puzzle'); const gold = 60 + s.tier * 60; c.gold(gold); c.exp(15 + s.tier * 25); await c.say(null, '비석이 빛났다. 밑에서 작은 주머니가 나왔다. [y]' + gold + '골드[/]', { style: 'sys' }); }
            else { c.sfx('buzz'); await c.narr('비석이 조용하다. 틀린 모양이다. 다음에 다시.'); }
          } }));
          break;
        }
        case 'lookout':
          Wd.add(new P.Spot({ x: X, y: Y + 6, verb: '전망대에 오른다', text: async (c) => {
            const st = S(), W = m.w, H = m.h, FC = 8, cols = Math.ceil(W / FC), rows = Math.ceil(H / FC);
            let fs = st.flags['fog:world']; if (!fs || fs.length !== cols * rows) fs = '0'.repeat(cols * rows);
            const arr = fs.split(''); const fx = Math.floor(s.x / FC), fy = Math.floor(s.y / FC);
            for (let dy = -7; dy <= 7; dy++) for (let dx = -9; dx <= 9; dx++) { const xx = fx + dx, yy = fy + dy; if (xx >= 0 && yy >= 0 && xx < cols && yy < rows && dx * dx / 81 + dy * dy / 49 <= 1) arr[yy * cols + xx] = '1'; }
            st.flags['fog:world'] = arr.join(''); m.fogDirty = true;
            c.sfx('wind'); await c.narr('사다리를 올랐다. 바람이 세다. 멀리 ' + nearestTowns(s.x, s.y).map(([n]) => NAME(n)).join(', ') + '의 지붕이 보인다.\n[y]둘레의 지도가 밝아졌다.[/]');
            if (!f(key)) { c.flag(key); c.exp(10 + s.tier * 15); }
          } }));
          break;
        case 'grove':
          Wd.add(new P.Spot({ x: X, y: Y + 4, verb: '고목 밑 샘에 손을 담근다', sparkle: !f(key), text: async (c) => { c.heal(); c.sfx('fairy'); G.fx.glow(X, Y, '#ffb0e0', 24); await c.narr('작은 빛이 손가락 사이로 올라왔다. 요정 샘이다. 몸이 가득 찼다.'); if (!f(key)) { c.flag(key); c.exp(10 + s.tier * 20); } } }));
          break;
        case 'stones':
          Wd.add(new P.Spot({ x: X, y: Y + 4, verb: '선돌 가운데 선다', text: async (c) => {
            await c.narr(U.pick(['선돌 여섯. 가운데 서면 발밑이 따뜻하다. 오래전 누군가 여기서 빛을 나누었다.', '선돌마다 손바닥 자국. 크기가 제각각이다. 아이 것도 있다.', '선돌 사이로 바람이 지나가며 숫자를 센다. 하나, 둘… 그리고 멈춘다.']));
            if (!f(key)) { c.flag(key); const st = S(); st.mp = G.st.derive(st).mpMax; c.exp(15 + s.tier * 20); await c.say(null, 'MP가 가득 찼다. 빛 알갱이를 조금 얻었다.', { style: 'sys' }); }
          } }));
          break;
        case 'crystal':
          if (!f(key)) Wd.add(new P.Spot({ x: X, y: Y + 4, verb: '수정 조각을 캔다', sparkle: true, text: async (c) => { c.flag(key); const mat = s.tier >= 6 ? 'm_moon' : s.tier >= 3 ? 'm_ore' : 'm_stone'; const id = G.data.ITEMS[mat] ? mat : 'm_stone'; c.give(id, 2 + Math.floor(r * 3)); c.sfx('crystal'); await c.say(null, '[y]' + (G.data.ITEMS[id] ? G.data.ITEMS[id].name : '광석') + '[/]을 캤다.', { style: 'sys' }); } }));
          break;
        case 'grave':
          Wd.add(new P.Sign({ x: X, y: Y - 2, look: 'stone', anyDir: true, text: async (c) => { await c.narr(EPITAPH[Math.floor(r * EPITAPH.length)]); if (!f(key)) { c.flag(key); c.abyss && Math.random() < 0.15 && c.abyss('grave_' + s.id); } } }));
          break;
        default: break;
      }
    }
  });
  ST.STOPS = STOPS;
})();
