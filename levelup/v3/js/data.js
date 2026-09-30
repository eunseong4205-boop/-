/* 게임 자료: 무기 · 방패 · 옷 · 활 · 장신구 · 도구 · 마법 · 소모품 · 재료 · 재능 나무 · 상점
   피해 단위: 적 체력은 점수, 주인공 체력은 하트 4분의 1(1 = ¼칸) */
(function () {
  'use strict';
  const G = globalThis.G;

  const ITEMS = {};
  const item = (id, o) => { ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); return ITEMS[id]; };

  /* ── 검: atk(한 번 벨 때 피해) · reach(사거리) · el(속성) · beam(체력 가득일 때 검기) ── */
  item('sw_wood', { type: 'sword', name: '연습용 목검', atk: 2, reach: 20, col: '#c8a070', desc: '할머니가 깎아 준 목검. 가볍다.' });
  item('sw_start', { type: 'sword', name: '시작의 검', atk: 3, reach: 22, col: '#e8f0ff', glow: '#ffffff', desc: '아우룸이 남긴 검. 벨 때마다 빛이 흩어진다. 버튼이 아니라 검이었다.', beam: false });
  item('sw_iron', { type: 'sword', name: '레드 강철검', atk: 5, reach: 23, col: '#c8d0e0', price: 900, desc: '볼칸의 대장간에서 두드린 검. 정직하게 무겁다.' });
  item('sw_flame', { type: 'sword', name: '불꽃 강철검', atk: 7, reach: 23, col: '#ffb070', el: 'fire', desc: '불도롱뇽의 비늘을 녹여 넣었다. 베면 불이 붙는다. 풀과 얼음을 태운다.' });
  item('sw_tide', { type: 'sword', name: '파도의 곡검', atk: 8, reach: 26, col: '#8ad8ff', el: 'ice', price: 12000, desc: '블루 어부들의 곡검. 사거리가 길고, 베인 적은 잠깐 얼어붙는다.' });
  item('sw_silver', { type: 'sword', name: '백은검', atk: 11, reach: 24, col: '#f0f4ff', el: 'light', desc: '에델이 넘겨준 성기사의 검. 망자에게 두 배.' });
  item('sw_light', { type: 'sword', name: '빛의 검', atk: 15, reach: 26, col: '#fff8d0', el: 'light', beam: true, glow: '#fff0a8', desc: '세린이 16년 동안 쥐고 있던 검. 체력이 가득하면 검기가 날아간다.' });

  /* ── 방패: 정면 투사체를 막는다. lv가 높을수록 센 것을 막는다 ── */
  item('sh_wood', { type: 'shield', name: '나무 방패', lv: 1, desc: '화살과 돌을 막는다.' });
  item('sh_iron', { type: 'shield', name: '강철 방패', lv: 2, price: 1500, desc: '불덩이까지 막는다.' });
  item('sh_mirror', { type: 'shield', name: '거울 방패', lv: 3, desc: '마법 광선을 되받아친다.' });

  /* ── 옷: def(받는 피해 배율) · resist ── */
  item('ar_tunic', { type: 'armor', name: '초록 튜닉', def: 1, desc: '할머니가 기워 준 옷.' });
  item('ar_leather', { type: 'armor', name: '가죽 갑옷', def: 0.85, price: 600, desc: '받는 피해 -15%.' });
  item('ar_heat', { type: 'armor', name: '방열복', def: 0.85, resist: 'heat', price: 3000, desc: '화산의 열기를 막는다. 받는 피해 -15%.' });
  item('ar_cold', { type: 'armor', name: '털 외투', def: 0.8, resist: 'cold', price: 8000, desc: '설원의 추위를 막는다. 받는 피해 -20%.' });
  item('ar_knight', { type: 'armor', name: '백은 갑옷', def: 0.6, desc: '받는 피해 -40%. 구르기가 조금 무겁다.' });
  item('ar_shadow', { type: 'armor', name: '밤의 옷', def: 0.75, stealth: 1, price: 40000, desc: '받는 피해 -25%. 적이 늦게 알아챈다.' });
  item('ar_star', { type: 'armor', name: '별빛 옷', def: 0.5, resist: 'all', desc: '받는 피해 -50%. 더위도 추위도 막는다.' });

  /* ── 활 ── */
  item('bw_short', { type: 'bow', name: '사냥 활', atk: 3, draw: 0.55, desc: '숲의 뿌리굴에서 찾은 활.' });
  item('bw_long', { type: 'bow', name: '장궁', atk: 5, draw: 0.45, price: 6000, desc: '더 멀리, 더 세게.' });
  item('bw_star', { type: 'bow', name: '별 활', atk: 8, draw: 0.35, desc: '모으면 화살이 세 갈래로 갈라진다.' });

  /* ── 장신구 ── */
  item('ac_sprout', { type: 'acc', name: '새싹 목걸이', fx: { stamina: 20 }, desc: '기력 +20.' });
  item('ac_ring_crit', { type: 'acc', name: '매의 반지', fx: { crit: 0.1 }, price: 5000, desc: '치명타 +10%.' });
  item('ac_mp', { type: 'acc', name: '달빛 귀걸이', fx: { mpRegen: 1 }, price: 7000, desc: 'MP가 저절로 찬다.' });
  item('ac_roll', { type: 'acc', name: '바람 깃털', fx: { roll: 0.3 }, price: 4000, desc: '구르기 기력 -30%, 무적 조금 더 길게.' });
  item('ac_heart', { type: 'acc', name: '생명의 부적', fx: { regen: 1 }, desc: '가만히 있으면 체력이 조금씩 찬다.' });
  item('ac_crown', { type: 'acc', name: '은빛 왕관', fx: { exp: 0.8, crit: 0.05 }, desc: '빛 알갱이 +80%, 치명타 +5%. 쓰고 있으면 이상하게 배가 고프다.' });
  item('ac_feather', { type: 'acc', name: '토리아의 깃털', fx: { stamina: 30, special: 0.3 }, desc: '기력 +30, 필살 게이지 +30%.' });
  item('ac_star', { type: 'acc', name: '별의 심장', fx: { exp: 1, mpRegen: 1.5 }, desc: '스텔라가 준 부품. 빛 알갱이 두 배, MP 회복.' });

  /* ── 도구 (소모 · 영구) ── */
  item('bow', { type: 'tool', name: '활', icon: 'bow', desc: '화살을 쏜다. 멀리 있는 스위치와 눈을 맞힌다.' });
  item('bomb', { type: 'tool', name: '폭탄', icon: 'bomb', ammo: 'bombs', desc: '금 간 벽과 바위를 부순다. 도구 버튼으로 놓는다.' });
  item('hook', { type: 'tool', name: '갈고리', icon: 'hook', desc: '말뚝과 나무에 걸어 틈을 건넌다. 적을 붙잡아 끌어온다.' });
  item('lantern', { type: 'tool', name: '등불', icon: 'lantern', desc: '어두운 곳을 밝히고 횃불에 불을 붙인다.' });
  item('mirror', { type: 'tool', name: '진실의 거울', icon: 'mirror', desc: '비추면 숨은 길과 혼령이 보인다.' });
  item('rod', { type: 'tool', name: '낚싯대', icon: 'rod', desc: '물가에서 도구 버튼. 찌가 흔들리면 공격 버튼.' });
  item('flippers', { type: 'key', name: '물갈퀴', desc: '깊은 물에서 헤엄칠 수 있다.' });
  item('glove', { type: 'key', name: '힘 장갑', desc: '무거운 돌을 들어 던진다.' });
  item('boots', { type: 'key', name: '바람 장화', desc: '구르기가 멀리 나간다. 금 간 벽에 부딪치면 흔들린다.' });

  /* ── 소모품 ── */
  item('potion_r', { type: 'use', name: '빨간 물약', heal: 12, price: 60, desc: '하트 3칸 회복.' });
  item('potion_b', { type: 'use', name: '파란 물약', mp: 40, price: 90, desc: 'MP 40 회복.' });
  item('potion_g', { type: 'use', name: '초록 영약', heal: 99, mp: 99, price: 600, desc: '전부 회복.' });
  item('fairy', { type: 'use', name: '병 속 요정', revive: 1, desc: '쓰러질 때 한 번 살려 준다.' });
  item('food_corn', { type: 'use', name: '옥수수빵', heal: 4, buff: { stamina: 1.5, t: 120 }, price: 20, desc: '하트 1칸, 2분 동안 기력 회복 빠르게.' });
  item('food_tteok', { type: 'use', name: '화산 떡볶이', heal: 6, buff: { atk: 1.25, t: 90 }, price: 80, desc: '하트 1.5칸, 90초 동안 공격 +25%.' });
  item('food_udon', { type: 'use', name: '파도 우동', heal: 8, buff: { def: 0.8, t: 120 }, price: 120, desc: '하트 2칸, 2분 동안 받는 피해 -20%.' });
  item('food_bread', { type: 'use', name: '눈꽃 빵', heal: 8, buff: { warm: 1, t: 180 }, price: 150, desc: '하트 2칸, 3분 동안 추위를 견딘다.' });

  /* ── 재료 (대장간 강화 · 부탁) ── */
  const MATS = [['m_slime', '말랑 젤리'], ['m_fang', '짐승 송곳니'], ['m_ore', '철광석'], ['m_scale', '불꽃 비늘'], ['m_pearl', '진주'], ['m_sand', '황금 모래'], ['m_moon', '달 조각'], ['m_cloud', '구름 솜'], ['m_ice', '얼음 결정'], ['m_gear', '녹슨 톱니'], ['m_shadow', '그림자 실'], ['m_powder', '화약'], ['m_star', '별 부스러기'], ['m_crystal', '황금 수정'], ['m_hide', '짐승 가죽'], ['m_cloth', '낡은 천'], ['m_dust', '마법 가루'], ['m_stone', '단단한 돌'], ['m_seed', '덩굴 씨앗'], ['m_shell', '딱딱한 껍질'], ['m_ink', '문어 먹물'], ['m_tag', '녹슨 이름표']];
  for (const [id, name] of MATS) item(id, { type: 'mat', name, price: 8, desc: '몬스터가 떨어뜨린 재료. 대장간과 부탁에 쓴다.' });
  item('heartpiece', { type: 'key', name: '하트 조각', desc: '네 개를 모으면 하트가 한 칸 는다.' });
  item('key_small', { type: 'key', name: '작은 열쇠', desc: '이 던전의 잠긴 문 하나를 연다.' });
  item('key_big', { type: 'key', name: '큰 열쇠', desc: '이 던전 주인의 문을 연다.' });
  item('heart_c', { type: 'key', name: '하트 그릇', big: true, desc: '최대 하트가 한 칸 늘고 체력이 가득 찬다.' });
  item('map_d', { type: 'key', name: '던전 지도', desc: '이 던전의 방이 전부 지도에 보인다.' });
  item('compass', { type: 'key', name: '나침반', desc: '상자와 이 던전 주인의 자리가 지도에 보인다.' });

  /* ── 마법: mp · 설명 ── */
  const SPELLS = {
    fire: { name: '화염구', mp: 8, icon: 'fire', col: '#ff8a3a', desc: '불덩이를 던진다. 태우고, 녹이고, 횃불에 불을 붙인다.' },
    ice: { name: '얼음창', mp: 10, icon: 'ice', col: '#8ad8ff', desc: '맞은 적이 얼어붙는다. 물 위에 잠깐 얼음 발판을 만든다.' },
    bolt: { name: '번개', mp: 16, icon: 'bolt', col: '#ffe066', desc: '가까운 적 셋에게 번개가 옮겨 붙는다.' },
    heal: { name: '치유의 빛', mp: 20, icon: 'heal', col: '#8ae0a0', desc: '하트 2칸을 천천히 채운다.' },
    light: { name: '흰빛', mp: 12, icon: 'light', col: '#ffffff', desc: '숨은 것을 드러내고 망자와 어둠을 기절시킨다. 흰빛의 그릇만 쓸 수 있다.' },
  };

  /* ── 재능 나무: 렙업할 때마다 1점 ── */
  const SKILLS = [
    // 검술
    { id: 'sw_combo', tree: '검술', name: '네 번째 베기', cost: 1, desc: '연속 베기 마지막에 올려 베기가 붙는다.' },
    { id: 'sw_charge', tree: '검술', name: '빠른 모으기', cost: 1, need: 'sw_combo', desc: '회전 베기를 모으는 시간 -40%.' },
    { id: 'sw_counter', tree: '검술', name: '반격', cost: 2, need: 'sw_charge', desc: '완벽 회피 직후 공격하면 치명타 반격.' },
    { id: 'sw_great', tree: '검술', name: '대회전', cost: 2, need: 'sw_counter', desc: '회전 베기가 두 바퀴 돌고 범위가 넓어진다.' },
    // 궁술
    { id: 'bw_fast', tree: '궁술', name: '빠른 시위', cost: 1, desc: '활을 당기는 시간 -30%.' },
    { id: 'bw_pierce', tree: '궁술', name: '꿰뚫기', cost: 1, need: 'bw_fast', desc: '모은 화살이 적을 꿰뚫는다.' },
    { id: 'bw_fire', tree: '궁술', name: '불화살', cost: 2, need: 'bw_pierce', desc: '화염구를 배웠다면 모은 화살에 불이 붙는다 (MP 4).' },
    { id: 'bw_rain', tree: '궁술', name: '화살비', cost: 2, need: 'bw_fire', desc: '필살기 대신 화살비를 쏟을 수 있다.' },
    // 마법
    { id: 'mg_pool', tree: '마법', name: '깊은 샘', cost: 1, desc: '최대 MP +30.' },
    { id: 'mg_flow', tree: '마법', name: '흐르는 빛', cost: 1, need: 'mg_pool', desc: 'MP가 천천히 저절로 찬다.' },
    { id: 'mg_power', tree: '마법', name: '증폭', cost: 2, need: 'mg_flow', desc: '마법 피해 +50%.' },
    { id: 'mg_echo', tree: '마법', name: '메아리', cost: 2, need: 'mg_power', desc: '마법을 쓰면 20% 확률로 한 번 더.' },
    // 생존
    { id: 'sv_stam', tree: '생존', name: '단련', cost: 1, desc: '최대 기력 +30.' },
    { id: 'sv_roll', tree: '생존', name: '바람 발', cost: 1, need: 'sv_stam', desc: '구르기 무적 시간 +50%.' },
    { id: 'sv_heart', tree: '생존', name: '두근', cost: 2, need: 'sv_roll', desc: '하트 1칸이 는다.' },
    { id: 'sv_second', tree: '생존', name: '버팀', cost: 2, need: 'sv_heart', desc: '하트 반 칸 이상이면 한 방에 쓰러지지 않는다.' },
  ];

  /* ── 대장간 강화: 검 → 재료 ── */
  const FORGE = {
    sw_start: { to: 'sw_iron', gold: 600, mats: { m_ore: 4 } },
    sw_iron: { to: 'sw_flame', gold: 2500, mats: { m_scale: 5, m_ore: 6 } },
    sw_flame: { to: 'sw_silver', gold: 15000, mats: { m_ice: 6, m_moon: 4 } },
  };

  /* ── 상점: 마을 → 물건 ── */
  const SHOPS = {
    green: { name: '초록 바구니 잡화점', items: ['potion_r', 'food_corn', 'arrows10', 'ar_leather'] },
    red: { name: '볼칸의 대장간', items: ['sw_iron', 'sh_iron', 'ar_heat', 'potion_r', 'bombs5', 'food_tteok'], forge: true },
    blue: { name: '파도 잡화점', items: ['sw_tide', 'potion_r', 'potion_b', 'arrows10', 'food_udon', 'ac_roll'] },
    yellow: { name: '대바자르', items: ['bw_long', 'ac_ring_crit', 'potion_g', 'bombs5', 'arrows10', 'ac_mp'] },
    purple: { name: '라벤더 마도구점', items: ['potion_b', 'potion_g', 'ac_mp', 'tome_ice', 'tome_bolt'] },
    rainbow: { name: '축제 노점', items: ['potion_r', 'food_corn', 'arrows10', 'bombs5'] },
    white: { name: '설원 상점', items: ['ar_cold', 'food_bread', 'potion_r', 'potion_g'] },
    gray: { name: '고철 시장', items: ['bombs5', 'arrows10', 'potion_r', 'potion_b', 'ac_heart'] },
    black: { name: '밤의 가게', items: ['ar_shadow', 'potion_g', 'arrows10', 'bombs5'] },
    colorful: { name: '발명 공방', items: ['bombs5', 'potion_g', 'arrows10'] },
  };
  item('arrows10', { type: 'ammo', name: '화살 10개', ammo: 'arrows', n: 10, price: 40, desc: '화살 10개.' });
  item('bombs5', { type: 'ammo', name: '폭탄 5개', ammo: 'bombs', n: 5, price: 120, desc: '폭탄 5개.' });
  item('tome_ice', { type: 'tome', name: '얼음창 마도서', spell: 'ice', price: 6000, desc: '읽으면 얼음창을 배운다.' });
  item('tome_bolt', { type: 'tome', name: '번개 마도서', spell: 'bolt', price: 14000, desc: '읽으면 번개를 배운다.' });

  /* ── 렙업 곡선: 다음 레벨까지 필요한 빛 ── */
  const expNext = (lv) => Math.round(18 + lv * 14 + lv * lv * 2.2);

  G.data = { ITEMS, SPELLS, SKILLS, FORGE, SHOPS, expNext };
})();
