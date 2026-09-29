/* 게임 데이터: 지역표, 성장 공식, 등급, 아이템, 몬스터, 스킬, 구슬, 상점
   원칙: 모든 수치(장소별 클릭 경험치, 가격, 몬스터 능력치·보상)는 지역표에서 파생된다. */
(function () {
  'use strict';
  const G = globalThis.G;

  /* ───────── 성장 공식 ───────── */
  const B = {
    spPerLevel: 5,
    ratio: { str: 3, vit: 2, agi: 1, int: 3, luk: 1 },
    battleTapExp: 0.3,   // 전투 중 탭 1회 = 그 자리 클릭의 30%
    killExp: 24,         // 일반 몬스터 처치 = 기대 클릭 24회분
    goldRatio: 1.25,     // 골드는 경험치의 1.25배 흐름
    tapsToKill: 7,
    hitsToDie: 11,
    enemyEvery: 2.0,
    regen: 0.06,
    feverClicks: 24,     // 3초 안에 24번 누르면 피버
    feverTime: 8,
    expK: 16,            // 긴 여정의 무게: 레벨 하나에 드는 경험치 배율
    expRamp: 10,         // 레벨 1에서는 ×1, 이 레벨까지 서서히 ×expK로 무거워진다
  };
  /* 레벨 L → L+1 에 드는 경험치 = (10 + 3L) × 무게(L).
     무게는 레벨 1~expRamp 동안 1에서 expK까지 곧게 오르고 그 뒤로는 expK. 누적값은 닫힌 식으로 구한다. */
  function weight(L) { const R = B.expRamp; return L >= R ? B.expK : 1 + (B.expK - 1) * (L - 1) / (R - 1); }
  function need(L) { return (10 + 3 * L) * weight(L); }
  /** 오르막 구간 합: l = 1..n 의 (10 + 3l)(a + c·l) */
  function rampSum(n) {
    const c = (B.expK - 1) / (B.expRamp - 1), a = 1 - c;
    return 10 * a * n + (10 * c + 3 * a) * n * (n + 1) / 2 + 3 * c * n * (n + 1) * (2 * n + 1) / 6;
  }
  /** 레벨 L이 되기까지 모은 경험치 총량 */
  function totalExp(L) {
    const R = B.expRamp;
    if (L <= R) return rampSum(L - 1);
    return rampSum(R - 1) + B.expK * (10 * (L - R) + 1.5 * ((L - 1) * L - (R - 1) * R));
  }
  function levelFromTotal(E) {
    const R = B.expRamp, K = B.expK;
    let lv = 1;
    if (E >= totalExp(R)) {
      // R 위에서는 2차식: 1.5K·L² + K(10 - 1.5)L + (C - 10KR - 1.5K(R-1)R) = E
      const a = 1.5 * K, b = 8.5 * K, c = rampSum(R - 1) - 10 * K * R - 1.5 * K * (R - 1) * R - E;
      lv = Math.max(R, Math.floor((-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)));
    }
    while (totalExp(lv + 1) <= E) lv++;
    while (lv > 1 && totalExp(lv) > E) lv--;
    return lv;
  }

  /* ───────── 지역표 ─────────
     lv: [입장, 목표] · click: 기대 상태에서 한 번 누를 때의 경험치 · weapon/armor: 그 지역 장비 · rank: 기대 등급 차수 합 */
  const REGIONS = [
    { id: 'green', name: '그린 마을', lv: [1, 30], click: 4, weapon: 10, armor: 20, rank: 1 },
    { id: 'red', name: '레드 마을', lv: [30, 150], click: 16, weapon: 90, armor: 180, rank: 5 },
    { id: 'blue', name: '블루 마을', lv: [150, 600], click: 190, weapon: 450, armor: 900, rank: 5 },
    { id: 'yellow', name: '옐로 마을', lv: [600, 2000], click: 1600, weapon: 1800, armor: 3600, rank: 8 },
    { id: 'purple', name: '퍼플 마을', lv: [2000, 6000], click: 13000, weapon: 6000, armor: 12000, rank: 13 },
    { id: 'rainbow', name: '무지개 마을', lv: [6000, 25000], click: 210000, weapon: 18000, armor: 36000, rank: 17 },
    { id: 'white', name: '화이트 마을', lv: [25000, 60000], click: 1050000, weapon: 75000, armor: 150000, rank: 26 },
    { id: 'gray', name: '그레이 마을', lv: [60000, 120000], click: 3500000, weapon: 180000, armor: 360000, rank: 34 },
    { id: 'black', name: '블랙 마을', lv: [120000, 250000], click: 14000000, weapon: 360000, armor: 720000, rank: 46 },
    { id: 'colorful', name: '알록달록 마을', lv: [250000, 400000], click: 35000000, weapon: 750000, armor: 1500000, rank: 62 },
    { id: 'space', name: '하늘 정거장', lv: [400000, 600000], click: 80000000, weapon: 1200000, armor: 2400000, rank: 78 },
    { id: 'planet', name: '절대 강자 행성', lv: [600000, 900000], click: 130000000, weapon: 1800000, armor: 3600000, rank: 100 },
  ];
  const REG = {};
  REGIONS.forEach((r, i) => { r.i = i; REG[r.id] = r; });
  function regionAt(L) { let r = REGIONS[0]; for (const x of REGIONS) if (L >= x.lv[0]) r = x; return r; }

  /** 레벨 L에서 기대하는 클릭 1회 경험치 (지역 경계 사이 로그 보간) */
  function targetClick(L) {
    for (let i = REGIONS.length - 1; i >= 0; i--) {
      const r = REGIONS[i];
      if (L >= r.lv[0]) {
        const nx = REGIONS[i + 1];
        if (!nx) return r.click * Math.pow(L / r.lv[0], 1);
        const f = Math.log(L / r.lv[0]) / Math.log(nx.lv[0] / r.lv[0]);
        return r.click * Math.pow(nx.click / r.click, Math.max(0, Math.min(1, f)));
      }
    }
    return REGIONS[0].click;
  }

  /* ───────── 등급 ───────── */
  const RANKS = [
    { id: 'r1', name: '평민', tiers: 5, lv: [5, 30], click: 0.1, power: 0.04, color: '#c3cad6', orb: null, desc: '모든 사람의 시작. 이리스 대륙 인구의 아홉 할이 평민이다.' },
    { id: 'r2', name: '괴짜', tiers: 10, lv: [700, 5500], click: 0.2, power: 0.05, color: '#ff6b6b', orb: 'red', desc: '평범함의 틀을 벗어난 자. 사람들은 괴짜를 두려워하면서도 부러워한다.' },
    { id: 'r3', name: '덕후', tiers: 20, lv: [8000, 60000], click: 0.3, power: 0.05, color: '#4dabf7', orb: 'blue', desc: '한 우물을 끝까지 판 자. 한 가지를 파고든 자만이 닿는 깊이가 있다.' },
    { id: 'r4', name: '짱', tiers: 30, lv: [70000, 260000], click: 0.4, power: 0.05, color: '#ffd43b', orb: 'yellow', desc: '한 지역에서 당할 자가 없는 자. 짱이 지나가면 동네 개도 짖지 않는다.' },
    { id: 'r5', name: '전설', tiers: 40, lv: [300000, 880000], click: 0.5, power: 0.05, color: '#c49bff', orb: 'purple', desc: '살아서 이야기가 된 자. 아이들이 잠들기 전에 듣는 이름.' },
  ];
  function rankTierLevel(rk, t) {
    const f = rk.tiers > 1 ? (t - 1) / (rk.tiers - 1) : 0;
    return Math.round(rk.lv[0] * Math.pow(rk.lv[1] / rk.lv[0], f));
  }
  function rankTierCost(rk, t) {
    const L = rankTierLevel(rk, t);
    // 평민 줄은 첫걸음이라 가볍게(1차 등록은 레벨 5에 모은 돈으로 바로), 그 뒤 줄은 여정의 무게를 조금 따른다
    const f = rk.id === 'r1' ? (t === 1 ? 30 : 90) : 260 * Math.max(1, weight(L) * 0.15);
    return Math.max(50, Math.round(targetClick(L) * B.goldRatio * f / 10) * 10);
  }
  /** 기대 등급 배율 (차수 합 n일 때 대략) */
  function expectedRankClick(n) { return 1 + n * 0.28; }

  /* ───────── 기대 배율 ───────── */
  const TOOL_MULT = [1, 1.6, 2.5, 4, 6, 9, 13, 19, 28, 40, 58, 85, 120, 170];
  function expectedMult(L, withTool) {
    const r = regionAt(L);
    const intF = 1 + Math.sqrt(1.5 * L) / 20;
    const tool = withTool ? TOOL_MULT[r.i] : 1;
    return tool * intF * expectedRankClick(r.rank);
  }
  /** 장소의 클릭 기본값 (기대 상태에서 targetClick이 되도록) */
  function clickBase(L, k) { return Math.max(1, (targetClick(L) * (k || 1)) / expectedMult(L, true)); }

  /* ───────── 기대 전투력 (몬스터 능력치 산출용) ───────── */
  /** reg: 몬스터가 사는 지역 (지역 끝의 보스가 다음 지역 장비 기준으로 계산되지 않도록) */
  function expected(L, reg) {
    const r = reg != null ? REGIONS[reg] : regionAt(L);
    const sp = B.spPerLevel * (L - 1);
    const str = sp * 0.3, vit = sp * 0.2;
    const pm = 1 + r.rank * 0.045;
    const atk = (10 + 2 * str + r.weapon) * pm;
    const hp = (100 + 10 * vit + 2 * L + r.armor) * pm;
    const def = vit * 0.5 + r.armor * 0.25;
    return { atk, hp, def, r };
  }

  /* ───────── 가격 ─────────
     값 = 그 지역 클릭 1번의 골드 × 배수 × 여정의 무게.
     레벨이 무거워지면(expK) 한 지역에서 누르는 횟수도 늘어나므로, 값도 그 무게를 따라 오른다.
     wf는 물건마다 무게를 얼마나 따르는지(장갑 0.75 · 장비 0.25 · 음식 1.5 …). 그린 마을은 늘 ×1. */
  function price(i, factor, wf) {
    const r = REGIONS[Math.min(i, REGIONS.length - 1)];
    const w = Math.max(1, weight(r.lv[0]) * (wf || 0));
    return Math.max(10, Math.round(r.click * B.goldRatio * factor * w));
  }

  /* ───────── 아이템 ───────── */
  const ITEMS = {};
  function item(id, o) { ITEMS[id] = Object.assign({ id }, o); }
  const TOOLS = [
    ['맨손', ''], ['나무 장갑', '나뭇결이 손에 착 붙는다. 누르는 맛이 있다.'], ['가죽 장갑', '레드 마을 무두장이의 역작. 땀이 차지 않는다.'],
    ['파도 장갑', '바닷물에 절인 가죽. 손끝이 파도처럼 리듬을 탄다.'], ['황금 장갑', '손가락마다 금 고리. 누를 때마다 짤랑거린다.'],
    ['달빛 장갑', '달빛을 머금은 천. 누를수록 밤처럼 고요해진다.'], ['무지개 장갑', '일곱 빛깔 실로 짠 축제 장갑.'],
    ['눈꽃 장갑', '눈의 결정으로 짰다. 차갑지만 손은 따뜻하다.'], ['톱니 장갑', '관절마다 톱니가 돈다. 기계가 대신 눌러 주는 것 같다.'],
    ['그림자 장갑', '그림자처럼 소리 없이 누른다.'], ['폭죽 장갑', '누를 때마다 작은 불꽃이 튄다.'], ['별빛 장갑', '400년 전 정거장 조종사들이 끼던 장갑.'],
    ['아스트라 장갑', '절대 강자 행성의 황금 수정으로 만든 장갑.'], ['무한 장갑', '끝이 없는 손. 이 장갑을 낀 자는 아직 없다.'],
  ];
  TOOLS.forEach(([n, d], i) => { if (i) item('t' + i, { name: n, type: 'tool', mult: TOOL_MULT[i], price: price(i - 1, 900, 0.75), desc: d, stat: '클릭 경험치·골드 ×' + TOOL_MULT[i] }); });

  const WEAPONS = [
    ['목검', '그린 마을 아이들이 휘두르는 나무 칼. 손에 익으면 제법 맵다.'], ['불꽃 철검', '레드 마을 대장간의 기본 검. 날에 불꽃 무늬.'],
    ['산호 작살', '블루 어부들이 쓰는 작살. 파도를 가른다.'], ['황금 곡도', '옐로 상인들의 호신용 칼. 칼집이 칼보다 비싸다.'],
    ['달빛 지팡이', '라벤더 학원의 수련용 지팡이. 휘두르면 별가루가 떨어진다.'], ['일곱빛 채찍', '무지개 서커스의 채찍. 휘두를 때 무지개가 선다.'],
    ['성은 창', '화이트 성기사단의 창. 끝이 늘 차갑게 빛난다.'], ['톱니 대검', '그레이 기술자가 만든 대검. 칼날이 돈다.'],
    ['그림자 단검', '블랙 마을 그림자 길드의 단검. 소리 없이 벤다.'], ['폭죽 망치', '피로스 박사의 발명품. 때리면 터진다.'],
    ['궤도 광선검', '하늘 정거장 무기고에서 400년 잠든 검.'], ['아스트라 성검', '역대 챔피언이 쓰던 황금 수정의 검.'],
  ];
  WEAPONS.forEach(([n, d], i) => item('w' + i, { name: n, type: 'weapon', atk: REGIONS[i].weapon, price: price(i, 520, 0.25), desc: d }));
  const ARMORS = [
    ['무명 옷', '할머니가 기워 준 옷. 팔꿈치에 새싹 무늬 덧댐.'], ['불꽃 가죽 갑옷', '화산 도마뱀 가죽. 불에 강하다.'], ['비늘 갑옷', '푸른 물고기 비늘을 엮었다.'],
    ['사막 로브', '모래바람을 막는 두꺼운 천.'], ['별자리 망토', '밤하늘 무늬가 수놓인 망토.'], ['축제 예복', '너무 화려해서 적이 눈이 부시다.'],
    ['백은 갑주', '성기사의 갑옷. 기도로 단련되었다.'], ['강철 외골격', '그레이의 기계 갑옷. 삐걱거린다.'], ['밤의 외투', '밤을 한 벌 잘라 만든 옷.'],
    ['불꽃놀이 조끼', '터지지는 않는다. 아마도.'], ['우주복', '400년 된 우주복. 의외로 냄새가 안 난다.'], ['아스트라 갑주', '입으면 별이 된 기분이다.'],
  ];
  ARMORS.forEach(([n, d], i) => item('a' + i, { name: n, type: 'armor', hp: REGIONS[i].armor, def: Math.round(REGIONS[i].armor * 0.25), price: price(i, 420, 0.25), desc: d }));
  const ACCS = [
    ['x0', '새싹 목걸이', { crit: 0.03 }, 0, '할머니가 걸어 준 목걸이. 치명타 +3%'],
    ['x1', '행운의 편자', { gold: 0.3 }, 1, '대장간 벽에 걸려 있던 편자. 골드 +30%'],
    ['x2', '학자의 안경', { exp: 0.3 }, 2, '대도서관 사서들의 안경. 경험치 +30%'],
    ['x3', '상인의 저울', { gold: 0.6 }, 3, '옐로 상인의 황금 저울 장식. 골드 +60%'],
    ['x4', '달의 귀걸이', { crit: 0.08, critDmg: 0.5 }, 4, '치명타 +8%, 치명 피해 +50%'],
    ['x5', '무지개 리본', { exp: 0.6, gold: 0.6 }, 5, '경험치·골드 +60%'],
    ['x6', '성녀의 묵주', { regen: 0.05, hp: 0.3 }, -1, '루미에가 준 묵주. 최대 HP +30%, 회복 +5%'],
    ['x7', '톱니 반지', { tap: 1 }, -1, '볼트가 만든 반지. 탭 한 번에 두 번 공격'],
    ['x8', '그림자 브로치', { crit: 0.15, critDmg: 1 }, -1, '녹턴의 브로치. 치명타 +15%, 치명 피해 +100%'],
    ['x9', '별의 심장', { exp: 1, gold: 1, crit: 0.1 }, -1, '스텔라가 준 부품. 경험치·골드 +100%, 치명타 +10%'],
    ['x10', '토리아의 깃털', { exp: 0.2, gold: 0.2, crit: 0.05 }, -1, '토리아가 처음 날던 날 빠진 털. 모든 것 조금씩 +'],
  ];
  ACCS.forEach(([id, n, fx, reg, d]) => item(id, { name: n, type: 'acc', fx, price: reg >= 0 ? price(reg, 650, 0.25) : 0, desc: d }));
  const POTIONS = [['빨간 약초', 0.3], ['불꽃 물약', 0.35], ['파도 물약', 0.4], ['선인장 즙', 0.45], ['달빛 이슬', 0.5], ['무지개 사탕', 0.55],
    ['성수', 0.6], ['수리 키트', 0.65], ['밤의 꿀', 0.7], ['폭죽 캔디', 0.75], ['우주 식량', 0.8], ['황금 넥타르', 1]];
  POTIONS.forEach(([n, h], i) => item('p' + i, { name: n, type: 'potion', heal: h, price: price(i, 6, 0.5), desc: '전투 중 HP를 ' + Math.round(h * 100) + '% 회복한다.' }));
  const FOODS = [
    ['옥수수빵', { exp: 1 }, '그린 마을 명물. 5분간 경험치 ×2'], ['화산 떡볶이', { atk: 1 }, '입에서 불이 난다. 5분간 공격력 ×2'],
    ['파도 우동', { gold: 1 }, '국물까지 마시면 운이 트인다. 5분간 골드 ×2'], ['모래 커피', { exp: 1, gold: 1 }, '잠이 안 온다. 5분간 경험치·골드 ×2'],
    ['달빛 수프', { exp: 2 }, '한 입에 별이 보인다. 5분간 경험치 ×3'], ['일곱빛 솜사탕', { exp: 2, gold: 2 }, '5분간 경험치·골드 ×3'],
    ['눈꽃 빵', { atk: 2, exp: 1 }, '5분간 공격력 ×3, 경험치 ×2'], ['볼트 쿠키', { exp: 3 }, '진짜 볼트가 들어 있다. 5분간 경험치 ×4'],
    ['밤하늘 젤리', { exp: 3, gold: 3 }, '5분간 경험치·골드 ×4'], ['폭죽 팝콘', { exp: 4, atk: 2 }, '5분간 경험치 ×5, 공격력 ×3'],
    ['우주 아이스크림', { exp: 4, gold: 4 }, '얼려서 말린 아이스크림. 5분간 경험치·골드 ×5'], ['별사탕', { exp: 5, atk: 3, gold: 3 }, '5분간 경험치 ×6, 공격력·골드 ×4'],
  ];
  FOODS.forEach(([n, fx, d], i) => item('f' + i, { name: n, type: 'food', fx, sec: 300, price: price(i, 60, 1.5), desc: d }));

  const KEYS = {
    button: ['시작의 버튼', '「모든 성장은 한 번의 누름에서 시작된다 — A.」 누르면 흰빛이 스며 나온다.'],
    letter_gran: ['할머니의 편지', '레드 마을 관측소의 아스텔 박사에게 전할 편지. 봉투에 새싹 도장.'],
    stick: ['단단한 나뭇가지', '속삭이는 숲의 참나무 가지. 목검 재료로 딱이다.'],
    herb_red: ['불꽃 약초', '붉은 산길 바위틈에 자라는 약초. 빛바램병에 좋다.'],
    star_note: ['별지기의 쪽지', '「광산 비밀번호 = 천문 번호 + 은빛 왕국이 무너진 해」'],
    mine_pick: ['황금 곡괭이', '광부 대장이 준 곡괭이.'],
    serin_book: ['「무한의 그릇에 관하여」', '어머니 세린이 쓴 책. 마지막 장에 편지가 끼워져 있다.'],
    ferry_pass: ['항해 허가증', '옐로 마을행 연락선 「고등어호」 승선권.'],
    log_book: ['등대지기의 항해일지', '루체의 아버지가 남긴 일지. 바다에서 본 「검은 별」 이야기가 있다.'],
    caravan_seal: ['대상단 통행패', '보랏빛 숲으로 가는 사막 대상단의 통행패.'],
    moon_herb: ['달맞이꽃', '보랏빛 숲에서만 피는 꽃. 포션의 실험 재료.'],
    fest_ticket: ['천년제 초대권', '무지개 마을 천년제 전야제 초대권.'],
    snow_badge: ['설원 통행증', '화이트 성기사단이 발행한 통행증.'],
    color_jar: ['색 표본 병', '세피아가 준 병. 지역마다 색을 하나씩 담는다.'],
    gear_heart: ['톱니 심장', '볼트가 만든 로켓 엔진의 심장.'],
    gold_bond: ['금화왕의 채권', '골디가 서명한 백지 채권. 로켓 자금.'],
    prayer_crystal: ['기도의 수정', '루미에가 기도를 담은 수정. 로켓의 방어막이 된다.'],
    night_key: ['밤의 열쇠', '녹턴이 준 열쇠. 하늘 정거장의 문을 연다.'],
    rocket_fuel: ['별빛 연료', '피로스 박사가 20년 모은 연료.'],
    reverser: ['역류 장치', '볼트의 설계도로 만든 장치. 징수탑의 흐름을 거꾸로 돌린다.'],
    fish_gold: ['황금 고등어', '미드나잇이 좋아하는 생선. 블루 어시장 한정.'],
  };
  for (const k in KEYS) item(k, { name: KEYS[k][0], type: 'key', desc: KEYS[k][1] });
  const MATS = [
    ['m0', '말랑 젤리', 0], ['m1', '토끼 꼬리', 0], ['m2', '불씨 조각', 1], ['m3', '도마뱀 비늘', 1], ['m4', '금빛 모래', 1], ['m5', '산호 조각', 2],
    ['m6', '갈매기 깃털', 2], ['m7', '전갈 독침', 3], ['m8', '선인장 꽃', 3], ['m9', '반딧불 가루', 4], ['m10', '달버섯', 4], ['m11', '솜구름', 5],
    ['m12', '눈 결정', 6], ['m13', '녹슨 톱니', 7], ['m14', '그림자 실', 8], ['m15', '폭죽 화약', 9], ['m16', '우주 먼지', 10], ['m17', '황금 수정', 11],
  ];
  MATS.forEach(([id, n, reg]) => item(id, { name: n, type: 'mat', price: price(reg, 14, 0.5), desc: '몬스터가 떨어뜨린 재료. 상점에 팔거나 의뢰에 쓴다.' }));

  /* ───────── 몬스터 ─────────
     [id, 이름, 형태, 주색, 보조색, 강조색, 지역, 레벨 위치(0~1), 역할, 설명, 떨굼] */
  const MON = {};
  function mon(a) {
    const [id, name, arch, c1, c2, c3, reg, frac, role, desc, drop] = a;
    const r = REGIONS[reg];
    const L = Math.round(r.lv[0] * Math.pow(r.lv[1] / r.lv[0], frac));
    const P = expected(L, reg);
    // [탭 수, 공격 배율, 보상 배율] — 보스는 레벨만 맞추면 물약 없이도 이길 만하게, 강적(사천왕·챔피언)은 물약이나 기술이 한두 번 필요하게
    const k = { n: [B.tapsToKill, 1, 1], e: [34, 1.35, 5], b: [90, 1.25, 40], x: [170, 1.5, 120] }[role];
    const hp = Math.round(P.atk * k[0]);
    const atk = Math.round((P.hp / B.hitsToDie) * k[1] + P.def);
    const base = targetClick(L) * B.killExp * k[2] / (expectedMult(L, false));
    MON[id] = { id, name, arch, c: [c1, c2, c3], reg, lv: L, role, hp, atk, exp: Math.max(3, Math.round(base)), gold: Math.max(2, Math.round(base * B.goldRatio)), desc, drop: drop || null };
  }
  [
    // 그린
    ['slime', '말랑 슬라임', 'blob', '#6ad86a', '#3a9a3e', '#ffffff', 0, 0.1, 'n', '그린 마을 아이들의 첫 상대. 밟으면 말랑, 맞으면 은근히 아프다.', ['m0', 0.3]],
    ['rabbit', '깡총 토끼', 'beast', '#e8c89a', '#b8946a', '#ff9aa8', 0, 0.25, 'n', '당근밭을 노리는 토끼. 뒷발차기 한 방에 허수아비가 날아갔다는 소문.', ['m1', 0.3]],
    ['bee', '꿀벌 병정', 'bug', '#ffd84a', '#3a2a1a', '#ffffff', 0, 0.4, 'n', '벌집을 지키는 병정. 침은 한 번뿐이라 신중하다.', ['m0', 0.2]],
    ['mole', '감자밭 두더지', 'beast', '#8a6a4a', '#5a4030', '#ff9aa8', 0, 0.5, 'n', '감자밭의 원수. 땅속에서 불쑥 나와 감자를 들고 사라진다.', ['m1', 0.2]],
    ['shroom', '수다쟁이 버섯', 'plant', '#e84a4a', '#f0e0c8', '#ffffff', 0, 0.7, 'n', '속삭이는 숲의 버섯. 포자로 수다를 떤다. 대부분 남 얘기다.', ['m0', 0.3]],
    ['thorn', '가시 덤불', 'plant', '#4a9a3a', '#2a6a2a', '#ff5a5a', 0, 0.85, 'n', '걸어 다니는 덤불. 옷을 좋아한다. 입고 있는 옷을.', ['m1', 0.3]],
    ['kingslime', '대왕 슬라임', 'blob', '#4ac84a', '#2a8a2a', '#ffd84a', 0, 0.8, 'e', '슬라임 백 마리가 뭉쳤다. 누가 왕인지는 슬라임들도 모른다.', ['m0', 1]],
    ['treant', '속삭임의 나무 정령', 'plant', '#5aa84a', '#6a4a2a', '#ffe08a', 0, 0.9, 'b', '속삭이는 숲의 주인. 천 년 동안 숲의 수다를 들어 왔다.', ['x10', 0]],
    ['golem0', '징수 골렘', 'machine', '#8a7ab0', '#5a4a80', '#e8d8ff', 0, 0.95, 'b', '징수탑이 고장 나자 튀어나온 경비 골렘. 「경험. 납부. 하시오.」', null],
    // 레드
    ['lizard', '불도마뱀', 'dragon', '#e8502a', '#a8301a', '#ffd84a', 1, 0.05, 'n', '화룡산 기슭의 도마뱀. 화가 나면 꼬리에 불이 붙는다. 자주 화가 난다.', ['m3', 0.3]],
    ['bat', '화산 박쥐', 'bird', '#8a2a3a', '#4a1a2a', '#ff8a3a', 1, 0.2, 'n', '온천 김을 좋아하는 박쥐. 따뜻한 곳이면 어디든 매달린다.', ['m2', 0.3]],
    ['crab', '바위 게', 'bug', '#a86a5a', '#6a4a42', '#ffd84a', 1, 0.35, 'n', '등껍질이 바위다. 옆으로 걷는 게 아니라 바위가 굴러가는 것이다.', ['m3', 0.2]],
    ['ember', '불씨 정령', 'wisp', '#ff8a3a', '#ff4a1a', '#ffe08a', 1, 0.5, 'n', '대장간 화로에서 튀어나온 불씨가 자아를 가졌다.', ['m2', 0.3]],
    ['bandit', '산적 망치꾼', 'humanoid', '#c8845a', '#6a4a3a', '#8a8a92', 1, 0.6, 'n', '징수를 피해 산으로 도망친 대장장이들. 망치질 솜씨는 진짜다.', ['m2', 0.2]],
    ['armor', '녹슨 갑옷', 'golem', '#9a8070', '#6a5040', '#ff5a3a', 1, 0.8, 'n', '버려진 갑옷에 불씨가 들어가 움직인다. 안은 비어 있다. 아마도.', ['m3', 0.3]],
    ['salamander', '대왕 불도롱뇽', 'dragon', '#ff5a1a', '#b8301a', '#ffe08a', 1, 0.75, 'e', '화룡의 먼 친척이라 주장한다. 증거는 없다.', ['m3', 1]],
    ['rud1', '징수 기사 견습 루드', 'humanoid', '#d8402a', '#3a3a4a', '#c8c8d0', 1, 0.45, 'b', '레드 마을의 징수 기사단 견습. 「숫자는 거짓말 안 해.」', null],
    // 광산
    ['minemole', '광산 두더지', 'beast', '#7a6a5a', '#4a3a2a', '#ffd84a', 2, 0.25, 'n', '광부들이 떠난 뒤 광산을 차지한 두더지들. 안전모를 주워 쓰고 있다.', ['m4', 0.3]],
    ['goldbat', '금박쥐', 'bird', '#e8b84a', '#8a6a2a', '#ffffff', 2, 0.3, 'n', '금가루를 뒤집어써서 금박쥐가 되었다. 본인은 부자인 줄 안다.', ['m4', 0.4]],
    ['gemgolem', '보석 골렘', 'golem', '#5ac8e8', '#3a7a9a', '#ff5ae8', 2, 0.38, 'n', '보석이 박힌 골렘. 캐 가려 하면 화낸다.', ['m4', 0.4]],
    ['cartghost', '광차 유령', 'ghost', '#c8b8a8', '#8a7a6a', '#ffd84a', 2, 0.42, 'n', '마지막 광차를 기다리는 광부의 유령. 광차는 오지 않는다.', ['m4', 0.3]],
    ['moleking', '황금 두더지왕', 'beast', '#ffd84a', '#b8902a', '#ff5a5a', 2, 0.5, 'b', '광산 가장 깊은 곳의 왕. 황금 왕관은 광차 바퀴로 만들었다.', null],
    // 블루
    ['sandcrab', '모래게', 'bug', '#f0c888', '#c89858', '#ff7a5a', 2, 0.05, 'n', '모래사장 청소부. 떨어진 건 뭐든 집게로 가져간다. 신발도.', ['m5', 0.3]],
    ['gull', '갈매기 도둑', 'bird', '#f4f4f4', '#9aa4ae', '#ffb84a', 2, 0.2, 'n', '어시장의 공공의 적. 파도 우동 면발을 노린다.', ['m6', 0.3]],
    ['jelly', '파랑 해파리', 'ghost', '#8ac8ff', '#5a8ad8', '#ffffff', 2, 0.35, 'n', '바닷바람을 타고 해안길까지 올라온 해파리. 찌릿하다.', ['m5', 0.2]],
    ['starfish', '춤추는 불가사리', 'plant', '#ff8a6a', '#d85a4a', '#ffe08a', 2, 0.5, 'n', '밤마다 모래 위에서 춤춘다. 낮에는 부끄러워한다.', ['m5', 0.3]],
    ['wslime', '파도 슬라임', 'blob', '#4aa8e8', '#2a78c8', '#dff3ff', 2, 0.65, 'n', '파도가 굳어서 생겼다. 몸 안에 작은 물고기가 산다.', ['m6', 0.2]],
    ['pirat', '해적 쥐', 'beast', '#8a8a92', '#5a5a62', '#e84a4a', 2, 0.75, 'n', '난파선에서 살아남은 쥐. 안대를 하고 있지만 두 눈 다 멀쩡하다.', ['m5', 0.3]],
    ['eel', '전기뱀장어', 'fish', '#e8e84a', '#3a8a9a', '#ffffff', 2, 0.85, 'n', '해저 동굴의 조명 담당. 가끔 누전된다.', ['m6', 0.3]],
    ['clam', '대왕 조개', 'blob', '#e8d8f0', '#b8a8c8', '#ff9ae8', 2, 0.9, 'e', '입을 다물면 아무도 못 연다. 입을 열면 진주가 보인다.', ['m5', 1]],
    ['skelsailor', '해골 선원', 'humanoid', '#e8e0d0', '#3a4a8a', '#ffd84a', 2, 0.92, 'n', '아직 항해 중이라고 믿는 선원. 배는 100년 전에 가라앉았다.', ['m6', 0.3]],
    ['kraken', '새끼 크라켄', 'eye', '#8a4ab0', '#5a2a8a', '#ffd84a', 2, 1, 'b', '해저 동굴의 주인. 아직 새끼라 다리가 여덟 개밖에 없다.', null],
    // 옐로
    ['scorpion', '황금 전갈', 'bug', '#e8b84a', '#a87a2a', '#ff5a3a', 3, 0.1, 'n', '금빛 껍질의 전갈. 상인들이 잡아서 장신구로 판다. 전갈은 그게 싫다.', ['m7', 0.3]],
    ['sandworm', '모래 벌레', 'fish', '#d8b878', '#a88848', '#ff9a6a', 3, 0.25, 'n', '모래 밑을 헤엄친다. 발밑이 꿈틀거리면 뛰어라.', ['m8', 0.2]],
    ['mummy', '붕대 미라', 'humanoid', '#f0e8d0', '#c8b890', '#ffd84a', 3, 0.4, 'n', '태양 피라미드의 경비병. 붕대가 풀리면 부끄러워한다.', ['m7', 0.3]],
    ['cactus', '선인장 권투가', 'plant', '#5aa85a', '#3a7a3a', '#ff7aa8', 3, 0.55, 'n', '가시 글러브를 낀 선인장. 원투 스트레이트가 일품.', ['m8', 0.3]],
    ['mirage', '신기루 정령', 'wisp', '#ffe8a8', '#f0c860', '#ffffff', 3, 0.7, 'n', '오아시스처럼 보이다가 사라진다. 사막 여행자의 적.', ['m8', 0.2]],
    ['sandwolf', '모래 늑대', 'beast', '#d8a860', '#a8783a', '#ffffff', 3, 0.85, 'n', '대상단을 노리는 늑대 무리. 모래색이라 잘 안 보인다.', ['m7', 0.3]],
    ['sphinx', '수수께끼 스핑크스', 'beast', '#e8c860', '#a8883a', '#3a78c8', 3, 0.8, 'e', '「아침엔 네 발, 점심엔 두 발…」 답을 말해도 싸운다.', ['m7', 1]],
    ['goldie', '금화왕 골디', 'humanoid', '#ffd84a', '#8a5a1a', '#ffffff', 3, 1, 'x', '사천왕 노랑의 자리. 「공짜는 없어, 꼬마.」', null],
    // 퍼플
    ['moonbat', '달빛 박쥐', 'bird', '#8a6ac0', '#4a3278', '#ffe08a', 4, 0.1, 'n', '보랏빛 숲의 박쥐. 초음파로 시를 읊는다.', ['m9', 0.3]],
    ['fairyfire', '도깨비불', 'wisp', '#c87aff', '#8a4ad8', '#ffffff', 4, 0.25, 'n', '길 잃은 사람을 더 깊은 숲으로 데려간다. 악의는 없다. 길치일 뿐.', ['m9', 0.3]],
    ['poison', '독버섯 신사', 'plant', '#a84ad8', '#f0e0f8', '#5ae85a', 4, 0.4, 'n', '모자를 벗어 인사한다. 포자가 쏟아진다.', ['m10', 0.3]],
    ['shadowfox', '그림자 여우', 'beast', '#5a4a7a', '#2a2240', '#ff9ae8', 4, 0.55, 'n', '꼬리가 아홉 개라고 주장하지만 세어 보면 하나다.', ['m10', 0.2]],
    ['witchcat', '마녀의 고양이', 'beast', '#2a2438', '#1a1626', '#ffe066', 4, 0.7, 'n', '주인을 잃은 마녀의 고양이. 마법을 반쯤 배웠다.', ['m9', 0.3]],
    ['mirrorghost', '거울 유령', 'ghost', '#e8e0ff', '#b8a8e8', '#c87aff', 4, 0.85, 'n', '거울 연못에서 나온 유령. 당신의 모습을 흉내 낸다. 조금 못생기게.', ['m10', 0.3]],
    ['moonbeast', '달빛 마수', 'beast', '#c8b8ff', '#6a4ab0', '#ffe08a', 4, 1, 'b', '보름달이 뜨면 깨어나는 숲의 수호수. 라벤더 학원 교수들도 피해 다닌다.', null],
    // 무지개
    ['cloudsheep', '구름 양', 'blob', '#ffffff', '#dfe8f8', '#ffb8d8', 5, 0.1, 'n', '털이 구름이다. 깎으면 비가 온다.', ['m11', 0.3]],
    ['rainbird', '무지개 새', 'bird', '#ff7a7a', '#7ab8ff', '#ffe066', 5, 0.25, 'n', '날개 깃마다 색이 다르다. 한 번에 한 색씩 떨군다.', ['m11', 0.2]],
    ['candy', '솜사탕 정령', 'wisp', '#ffb8e8', '#ff8ac8', '#ffffff', 5, 0.4, 'n', '축제 솜사탕이 바람을 타고 살아났다. 달다.', ['m11', 0.3]],
    ['balloon', '풍선 도깨비', 'eye', '#ff5a8a', '#c83a6a', '#ffffff', 5, 0.55, 'n', '터지면 사라진다. 그래서 늘 조심스럽다.', ['m11', 0.2]],
    ['clowndoll', '태엽 광대 인형', 'humanoid', '#ffffff', '#e84a8a', '#4ae8a8', 5, 0.7, 'n', '서커스 창고에서 나온 인형. 태엽이 다 풀릴 때까지 웃는다.', ['m11', 0.3]],
    ['shootstar', '별똥 꼬마', 'wisp', '#ffe066', '#ffb84a', '#ffffff', 5, 0.85, 'n', '하늘에서 떨어진 작은 별. 집에 가고 싶어 한다.', ['m11', 0.3]],
    ['storm', '폭풍 구름', 'blob', '#6a7a9a', '#3a4a6a', '#ffe066', 5, 1, 'b', '구름 섬의 골칫거리. 기분이 나쁘면 번개를 친다. 늘 기분이 나쁘다.', null],
    // 화이트
    ['snowwolf', '눈 늑대', 'beast', '#e8f0fa', '#9ab0c8', '#6ab0e0', 6, 0.1, 'n', '설원의 사냥꾼. 눈 속에 숨으면 코만 보인다.', ['m12', 0.3]],
    ['yeti', '아기 설인', 'golem', '#f4f8ff', '#c4d2e4', '#6a8ab0', 6, 0.25, 'n', '엄마를 찾는 아기 설인. 크기는 이미 어른만 하다.', ['m12', 0.2]],
    ['icebat', '고드름 박쥐', 'bird', '#bfe8ff', '#6ab0e0', '#ffffff', 6, 0.4, 'n', '날개가 얼음이라 잘 날지 못한다. 대신 잘 떨어진다.', ['m12', 0.3]],
    ['snowman', '눈사람 전사', 'blob', '#ffffff', '#c8d6ea', '#ff8a3a', 6, 0.55, 'n', '아이들이 만든 눈사람에 빛이 깃들었다. 당근 코가 자랑.', ['m12', 0.3]],
    ['icespirit', '얼음 정령', 'wisp', '#8ae8ff', '#4ab0e0', '#ffffff', 6, 0.7, 'n', '숨결이 닿으면 얼어붙는다. 본인도 추위를 탄다.', ['m12', 0.3]],
    ['penguin', '펭귄 기사', 'bird', '#2a3040', '#f4f4f4', '#ffd84a', 6, 0.85, 'n', '성기사단을 동경해 투구를 쓴 펭귄. 창 대신 생선을 든다.', ['m12', 0.3]],
    ['edel', '백은 기사 에델', 'humanoid', '#e8eef8', '#9aa4ae', '#6ab0e0', 6, 0.8, 'b', '성녀 루미에의 기사. 「한 수 청하오.」', null],
    ['lumie', '성녀 루미에', 'humanoid', '#ffffff', '#c8d6ea', '#ffe08a', 6, 1, 'x', '사천왕 하양의 자리. 「괜찮아요, 아이야. 아프지 않게 할게요.」', null],
    // 그레이
    ['drone', '잿빛 드론', 'machine', '#9aa4ae', '#5a6470', '#ff5a5a', 7, 0.1, 'n', '400년째 순찰 중인 드론. 순찰할 나라는 없다.', ['m13', 0.3]],
    ['rustbot', '녹슨 로봇', 'machine', '#a86a3a', '#6a4a2a', '#ffd84a', 7, 0.25, 'n', '기름칠을 해 주면 따라온다. 해 주지 않아도 따라온다.', ['m13', 0.3]],
    ['ashgolem', '재 골렘', 'golem', '#8a8a86', '#5a5a58', '#ff8a3a', 7, 0.4, 'n', '탈색된 땅의 재가 뭉쳤다. 비가 오면 진흙 골렘이 된다.', ['m13', 0.2]],
    ['scraprat', '고철 쥐', 'beast', '#7a6a5a', '#4a4038', '#c8c8c8', 7, 0.55, 'n', '나사를 갉아 먹는 쥐. 이빨이 드라이버다.', ['m13', 0.3]],
    ['oilslime', '기름 슬라임', 'blob', '#2a2a30', '#141418', '#8a6aff', 7, 0.7, 'n', '폐공장의 기름이 뭉쳤다. 무지갯빛 막이 반짝인다.', ['m13', 0.3]],
    ['watcheye', '감시의 눈', 'eye', '#c8c8d0', '#6a6a72', '#ff3a3a', 7, 0.85, 'n', '잿빛 제국이 남긴 감시 장치. 아직도 누군가에게 보고하고 있다.', ['m13', 0.3]],
    ['voltmech', '볼트 MK-7', 'machine', '#8a96aa', '#4a5468', '#ffd84a', 7, 1, 'x', '사천왕 회색의 자리 볼트가 탄 거대 기계. 「쓸데없는 말은 연료 낭비다.」', null],
    // 블랙
    ['shadowwolf', '그림자 늑대', 'beast', '#2a2440', '#141026', '#ff3a5a', 8, 0.1, 'n', '달이 없는 밤에만 그림자가 생긴다. 이 숲은 늘 달이 없다.', ['m14', 0.3]],
    ['crow', '밤 까마귀', 'bird', '#1a1626', '#3a3450', '#ffd84a', 8, 0.25, 'n', '소문을 물어 나르는 까마귀. 미드나잇의 정보원이라는 설.', ['m14', 0.3]],
    ['nightmare', '악몽 유령', 'ghost', '#4a3a6a', '#2a2040', '#ff5ae8', 8, 0.4, 'n', '잠든 사람의 꿈에서 빠져나왔다. 무서운 표정을 연습 중.', ['m14', 0.2]],
    ['lantern', '등불 도깨비', 'wisp', '#ffd86a', '#c8902a', '#ffffff', 8, 0.55, 'n', '밤길을 비추는 척하다가 등불을 훔쳐 간다.', ['m14', 0.3]],
    ['skelknight', '해골 기사', 'humanoid', '#d8d0c0', '#3a3450', '#8a1a3a', 8, 0.7, 'n', '천년성을 지키다 잠든 기사. 교대 시간이 천 년째 오지 않는다.', ['m14', 0.3]],
    ['spider', '칠흑 거미', 'bug', '#1a1626', '#3a3450', '#ff3a5a', 8, 0.8, 'n', '밤하늘을 거미줄로 엮는다. 별이 걸리면 먹는다.', ['m14', 0.3]],
    ['gargoyle', '천년성 가고일', 'dragon', '#6a6a78', '#3a3a48', '#ff3a5a', 8, 0.9, 'e', '천년성 성벽의 석상. 밤이 되면 움직인다. 여긴 늘 밤이다.', ['m14', 1]],
    ['nocturne', '그림자 녹턴', 'humanoid', '#1a1626', '#3a3450', '#ff3a5a', 8, 1, 'x', '사천왕 검정의 자리. 카이론의 그림자.', null],
    // 알록달록
    ['firefairy', '폭죽 요정', 'wisp', '#ff5a8a', '#ffd84a', '#5ae8ff', 9, 0.3, 'n', '불꽃놀이 탑에 사는 요정. 기분이 좋으면 터진다.', ['m15', 0.3]],
    ['balloonbear', '풍선 곰', 'blob', '#ff8a5a', '#d85a3a', '#ffffff', 9, 0.5, 'n', '서커스에서 탈출한 풍선 곰. 바람이 빠지면 운다.', ['m15', 0.3]],
    ['toysoldier', '장난감 병정', 'humanoid', '#e84a4a', '#3a3a8a', '#ffd84a', 9, 0.7, 'n', '태엽 병정. 적과 아군 구별 없이 경례한다.', ['m15', 0.3]],
    ['firebird', '불꽃 새', 'bird', '#ff6a2a', '#ffd84a', '#ffffff', 9, 0.85, 'n', '불꽃놀이가 새 모양으로 터졌다가 그대로 날아갔다.', ['m15', 0.3]],
    ['megafirework', '대폭죽 「천발이」', 'eye', '#ff3a6a', '#ffd84a', '#5ae8ff', 9, 1, 'b', '천 발을 한 번에 쏘도록 만든 폭죽. 아직 한 발도 안 쐈다.', null],
    // 하늘 정거장
    ['guarddrone', '경비 드론', 'machine', '#b4c0d2', '#626e84', '#ff3a3a', 10, 0.1, 'n', '400년 동안 「침입자 없음」을 보고해 온 드론. 드디어 할 일이 생겼다.', ['m16', 0.3]],
    ['spacejelly', '우주 해파리', 'ghost', '#8a6aff', '#4a3ab0', '#6ae8ff', 10, 0.3, 'n', '진공 속을 떠다니는 해파리. 어떻게 숨 쉬는지 아무도 모른다.', ['m16', 0.3]],
    ['voidshard', '흑점의 파편', 'eye', '#0b0a1c', '#2a2040', '#ff3a5a', 10, 0.5, 'n', '흑점에서 떨어져 나온 조각. 빛을 보면 달려든다.', ['m16', 0.3]],
    ['orbitspider', '궤도 거미', 'bug', '#8a96aa', '#4a5468', '#6ae8ff', 10, 0.7, 'n', '정거장 외벽을 수리하던 로봇. 지금은 뭐든 수리하려 든다. 당신도.', ['m16', 0.3]],
    ['zeroslime', '무중력 슬라임', 'blob', '#6ae8ff', '#3ab0d8', '#ffffff', 10, 0.85, 'n', '둥둥 떠다닌다. 붙잡으면 도망가고 놓으면 따라온다.', ['m16', 0.3]],
    ['herald', '흑점의 전령', 'wisp', '#2a2040', '#0b0a1c', '#ff3a5a', 10, 1, 'b', '흑점이 먼저 보낸 그림자. 「빛… 더 많은 빛을…」', null],
    // 절대 강자 행성
    ['crystalgolem', '수정 골렘', 'golem', '#e8c860', '#a8883a', '#ffffff', 11, 0.1, 'n', '아스트라의 수정이 모여 만든 골렘. 역대 챔피언들의 요새를 지킨다.', ['m17', 0.3]],
    ['starknight', '별의 기사', 'humanoid', '#fff0a8', '#c89a38', '#6ae8ff', 11, 0.3, 'n', '역대 챔피언들의 잔상. 도전자를 시험한다.', ['m17', 0.3]],
    ['tendril', '흑점 촉수', 'plant', '#1a1626', '#0b0a1c', '#ff3a5a', 11, 0.5, 'n', '하늘의 흑점에서 내려온 촉수. 빛을 향해 뻗는다.', ['m17', 0.3]],
    ['lighteater', '빛 먹는 자', 'ghost', '#2a2040', '#0b0a1c', '#ffe08a', 11, 0.7, 'n', '빛을 먹을수록 투명해진다. 다 먹으면 사라진다.', ['m17', 0.3]],
    ['golddragon', '황금 용', 'dragon', '#ffd84a', '#c89a38', '#ff5a3a', 11, 0.85, 'e', '아우룸이 타고 다녔다는 용의 후손. 도전자를 태워 줄지 시험한다.', ['m17', 1]],
    ['kairon', '챔피언 카이론', 'humanoid', '#e8eef8', '#c8a030', '#ffd84a', 11, 0.97, 'x', '대륙의 절대 강자. 레벨 99만 9999.', null],
    ['blacksun', '흑점', 'eye', '#0b0a1c', '#1a1030', '#ff3a5a', 11, 1, 'x', '빛을 먹는 떠돌이 어둠.', null],
  ].forEach(mon);
  // 특별 보정: 이야기 보스
  MON.golem0.hp = Math.round(MON.golem0.hp * 0.35); MON.golem0.atk = Math.round(MON.golem0.atk * 0.5);
  MON.rud1.hp = Math.round(MON.rud1.hp * 0.5);
  MON.kairon.hp *= 2; MON.blacksun.hp *= 3; MON.blacksun.atk = Math.round(MON.blacksun.atk * 0.8);   // 흑점은 대륙의 빛(지원)과 함께 싸운다

  /* ───────── 구슬 ───────── */
  const ORB_COLORS = {
    red: { name: '빨간 구슬', color: '#ff6b6b', rank: 'r2' }, blue: { name: '파란 구슬', color: '#4dabf7', rank: 'r3' },
    yellow: { name: '노란 구슬', color: '#ffd43b', rank: 'r4' }, purple: { name: '보라 구슬', color: '#c49bff', rank: 'r5' },
  };
  const ORBS = [
    { id: 'o_r1', c: 'red', v: 1200, hint: '그린 마을 어딘가의 물속' }, { id: 'o_r2', c: 'red', v: 345, hint: '속삭이는 숲의 주인' },
    { id: 'o_r3', c: 'red', v: 3000, hint: '레드 마을에서 별과 가장 가까운 곳' }, { id: 'o_r4', c: 'red', v: 777, hint: '황금 광산의 왕' },
    { id: 'o_b1', c: 'blue', v: 2024, hint: '블루 대도서관의 잠긴 서고' }, { id: 'o_b2', c: 'blue', v: 518, hint: '해저 동굴의 주인' },
    { id: 'o_b3', c: 'blue', v: 4096, hint: '옐로 카지노의 행운' }, { id: 'o_b4', c: 'blue', v: 1111, hint: '진실을 비추는 연못' },
    { id: 'o_y1', c: 'yellow', v: 9000, hint: '구름 섬 고래의 등' }, { id: 'o_y2', c: 'yellow', v: 3500, hint: '화이트 아이들의 겨울 놀이' },
    { id: 'o_y3', c: 'yellow', v: 12345, hint: '얼음 신전 제단' }, { id: 'o_y4', c: 'yellow', v: 612, hint: '잿빛 제국의 기록' },
    { id: 'o_p1', c: 'purple', v: 99999, hint: '밤의 정보상과의 거래' }, { id: 'o_p2', c: 'purple', v: 1000, hint: '천년성의 가장 높은 곳' },
    { id: 'o_p3', c: 'purple', v: 50000, hint: '불꽃놀이 탑 꼭대기' }, { id: 'o_p4', c: 'purple', v: 8001, hint: '로봇 소녀의 소원' },
  ];
  function passwordOf(color) { return ORBS.filter((o) => o.c === color).reduce((a, o) => a + o.v, 0); }

  /* ───────── 스킬 ───────── */
  const SKILLS = [
    { id: 'k_rush', name: '연타 폭발', rank: 'r1', tier: 3, cd: 20, dur: 5, desc: '5초간 탭 한 번에 두 번 공격', icon: '👊' },
    { id: 'k_guard', name: '새싹 방패', rank: 'r1', tier: 5, cd: 30, dur: 8, desc: '8초간 받는 피해 -70%', icon: '🌱' },
    { id: 'k_flame', name: '괴짜의 불꽃', rank: 'r2', tier: 1, cd: 25, dur: 0, desc: '공격력 ×15 일격', icon: '🔥' },
    { id: 'k_focus', name: '덕질 집중', rank: 'r3', tier: 1, cd: 40, dur: 6, desc: '6초간 치명타 100%', icon: '🎯' },
    { id: 'k_heal', name: '짱의 기합', rank: 'r4', tier: 1, cd: 45, dur: 0, desc: 'HP 60% 회복', icon: '💪' },
    { id: 'k_legend', name: '전설의 일격', rank: 'r5', tier: 1, cd: 60, dur: 0, desc: '공격력 ×60 일격', icon: '⭐' },
  ];

  /* ───────── 상점 ───────── */
  const SHOPS = {
    green: { name: '초록 바구니 잡화점', keeper: 'kongsun', items: ['t1', 'w0', 'a0', 'p0', 'f0'] },
    red: { name: '불꽃 상점', keeper: 'hwaro', items: ['t2', 'w1', 'a1', 'x1', 'p1', 'f1'] },
    observatory: { name: '관측소 2층 매점', keeper: 'clerk', items: ['p1', 'p2', 'f1', 'x2'] },
    blue: { name: '파도 상회', keeper: 'clerk', items: ['t3', 'w2', 'a2', 'x2', 'p2', 'f2'] },
    yellow: { name: '대바자르', keeper: 'clerk', items: ['t4', 'w3', 'a3', 'x3', 'p3', 'f3'] },
    purple: { name: '마법 잡화점 「별가루」', keeper: 'clerk', items: ['t5', 'w4', 'a4', 'x4', 'p4', 'f4'] },
    rainbow: { name: '축제 노점', keeper: 'clerk', items: ['t6', 'w5', 'a5', 'x5', 'p5', 'f5'] },
    white: { name: '성당 보급소', keeper: 'clerk', items: ['t7', 'w6', 'a6', 'p6', 'f6'] },
    gray: { name: '고철 시장', keeper: 'clerk', items: ['t8', 'w7', 'a7', 'p7', 'f7'] },
    black: { name: '그림자 길드 상점', keeper: 'clerk', items: ['t9', 'w8', 'a8', 'p8', 'f8'] },
    colorful: { name: '발명품 가게', keeper: 'clerk', items: ['t10', 'w9', 'a9', 'p9', 'f9'] },
    space: { name: '정거장 보급 창고', keeper: 'clerk', items: ['t11', 'w10', 'a10', 'p10', 'f10'] },
    planet: { name: '별의 제단', keeper: 'clerk', items: ['t12', 'w11', 'a11', 'p11', 'f11'] },
  };

  G.data = { B, need, totalExp, levelFromTotal, REGIONS, REG, regionAt, targetClick, clickBase, expectedMult, expected, price,
    RANKS, rankTierLevel, rankTierCost, ITEMS, TOOL_MULT, MON, ORB_COLORS, ORBS, passwordOf, SKILLS, SHOPS };
})();
