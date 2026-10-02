/* 성장: 등급 · 능력치 · 장비 · 재능 나무 · 필살기 · 마법 · 난이도
   렙업하면 성장 점수 3점. 능력치 한 칸에 1점, 재능은 칸마다 2~5점 — 어디에 쓸지 고르는 것이 곧 빌드다.
   재능 나무는 줄마다 요구 레벨 · 능력치가 있고, 몇몇 줄은 둘 중 하나만 고를 수 있다(갈림길) — 회차마다 다른 모양이 나온다.
   장비 · 필살기 · 마법은 일반 → 고급 → 희귀 → 영웅 → 전설. 윗 등급일수록 세고 화려하며, 레벨이나 능력치를 요구한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const D = G.data;
  const ITEMS = D.ITEMS;

  /* ───────── 등급 ───────── */
  const GRADES = [null,
    { n: 1, name: '일반', col: '#dcdce8', glow: null },
    { n: 2, name: '고급', col: '#7ee08a', glow: '#7ee08a' },
    { n: 3, name: '희귀', col: '#6ab8ff', glow: '#8ad0ff' },
    { n: 4, name: '영웅', col: '#c48aff', glow: '#d8a8ff' },
    { n: 5, name: '전설', col: '#ffc84a', glow: '#fff0a8' },
  ];
  const gradeOf = (x) => GRADES[Math.max(1, Math.min(5, (x && x.grade) || 1))];

  /* ───────── 능력치 ───────── */
  const STATS = [
    { id: 'str', name: '힘', col: '#ff8a6a', desc: '검 피해 · 넉백. 무거운 검을 든다.' },
    { id: 'vit', name: '체력', col: '#ff6a8a', desc: '6점마다 하트 한 칸 · 받는 피해 조금 줄임.' },
    { id: 'sta', name: '기력', col: '#8ae07a', desc: '최대 기력 · 기력 회복 · 구르기 부담.' },
    { id: 'int', name: '지력', col: '#8ab8ff', desc: '마법 피해 · 최대 MP · 필살 게이지.' },
    { id: 'dex', name: '솜씨', col: '#ffe066', desc: '활 피해 · 치명타 · 시위 당기는 속도.' },
  ];
  const STAT_NAME = { str: '힘', vit: '체력', sta: '기력', int: '지력', dex: '솜씨', lv: 'Lv' };
  /** 20까지는 한 점이 온전히, 그 뒤로는 반만 (한쪽으로만 몰면 얻는 것이 줄어든다) */
  const soft = (v, k) => (Math.min(v, 20) + Math.max(0, v - 20) * 0.5) * k;

  /* ───────── 장비 (기존 것에 등급 · 요구치를 붙이고 새로 더한다) ───────── */
  const item = (id, o) => { ITEMS[id] = Object.assign(ITEMS[id] || { id, price: 0, desc: '' }, o); ITEMS[id].id = id; return ITEMS[id]; };
  // 검: atk · reach · speed(휘두르는 시간 배율, 작을수록 빠르다) · heavy(넉백 배율) · crit
  item('sw_wood', { grade: 1 });
  item('sw_start', { grade: 2, atk: 3.5 });
  item('sw_iron', { grade: 2, req: { str: 4 }, price: 900 });
  item('sw_dagger', { type: 'sword', grade: 2, name: '쌍단검 「제비」', atk: 3.5, reach: 18, speed: 0.72, crit: 0.08, col: '#d8e8f0', price: 2600, req: { dex: 6 }, desc: '짧고 가볍다. 세 번 벨 시간에 네 번 벤다. 치명타 +8%.' });
  item('sw_flame', { grade: 3, req: { str: 8 } });
  item('sw_tide', { grade: 3, req: { dex: 8, str: 5 } });
  item('sw_great', { type: 'sword', grade: 3, name: '거인의 대검', atk: 11, reach: 29, speed: 1.35, heavy: 1.6, col: '#b8b0a8', price: 9800, req: { str: 16 }, desc: '레드 광부들이 바위를 쪼개던 날. 느리지만 한 번에 벽이 무너진다. 넉백 +60%.' });
  item('sw_thorn', { type: 'sword', grade: 3, name: '가시덩굴 채찍검', atk: 6, reach: 36, speed: 0.95, el: 'poison', col: '#7ad86a', price: 11000, req: { dex: 10 }, desc: '라벤더 숲의 가시로 엮은 검. 멀리 닿고, 베인 적은 독이 오른다.' });
  item('sw_silver', { grade: 4, req: { str: 12 } });
  item('sw_storm', { type: 'sword', grade: 4, name: '폭풍의 검 「천둥새」', atk: 12, reach: 25, el: 'bolt', col: '#ffe88a', glow: '#fff4a8', price: 26000, req: { str: 14, int: 8 }, desc: '고철 시장 지하에서 굴러다니던 시제품. 벨 때마다 가까운 적에게 번개가 옮는다.' });
  item('sw_moon', { type: 'sword', grade: 4, name: '월광검', atk: 13, reach: 24, crit: 0.12, speed: 0.9, col: '#c8d8ff', glow: '#a8c0ff', price: 32000, req: { dex: 14, str: 8 }, desc: '밤의 가게 주인이 「주인을 기다리던 검」이라며 꺼냈다. 치명타 +12%. 밤에는 더 날카롭다.' });
  item('sw_ember', { type: 'sword', grade: 4, name: '용암 참마도', atk: 16, reach: 27, speed: 1.2, heavy: 1.4, el: 'fire', col: '#ff8a4a', glow: '#ffb070', req: { str: 22 }, desc: '화산 분화구 깊은 곳, 식지 않는 바위에 꽂혀 있었다. 무겁고, 닿는 것마다 불이 붙는다.' });
  item('sw_light', { grade: 5, atk: 16, req: { lv: 40 } });
  item('sw_dawn', { type: 'sword', grade: 5, name: '새벽의 검 「아우룸」', atk: 19, reach: 27, el: 'light', beam: true, beamAt: 0.75, col: '#fff4c8', glow: '#ffe066', req: { str: 26, lv: 38 }, desc: '초대 챔피언이 마지막으로 쥐었던 검. 체력이 ¾ 이상이면 검기가 날아간다.' });
  item('sw_void', { type: 'sword', grade: 5, name: '심연의 검', atk: 21, reach: 26, el: 'dark', drain: 0.06, col: '#8a5ad8', glow: '#c49bff', req: { str: 20, int: 16, lv: 40 }, desc: '삼킨 빛을 돌려주는 검. 벤 만큼 체력이 조금 돌아온다. 쥐고 있으면 누군가 속삭인다.' });
  // 활
  item('bw_short', { grade: 1 });
  item('bw_bone', { type: 'bow', grade: 2, name: '뼈 활', atk: 4, draw: 0.5, price: 900, req: { dex: 4 }, desc: '짐승 뼈를 깎아 만든 활. 가볍고 정직하다.' });
  item('bw_long', { grade: 2, req: { dex: 8 } });
  item('bw_wind', { type: 'bow', grade: 3, name: '바람의 활', atk: 6, draw: 0.3, price: 8800, req: { dex: 12 }, desc: '축제의 궁수 대회 우승 상품. 시위가 바람처럼 가볍다.' });
  item('bw_frost', { type: 'bow', grade: 3, name: '서리 활', atk: 7, draw: 0.42, el: 'ice', price: 12500, req: { dex: 14 }, desc: '설원 사냥꾼의 활. 모은 화살은 적을 얼린다.' });
  item('bw_star', { grade: 4, multi: 3 });
  item('bw_dragon', { type: 'bow', grade: 4, name: '용뼈 대궁', atk: 11, draw: 0.5, el: 'fire', pierce: 2, col: '#ff9a5a', req: { dex: 20, str: 10 }, desc: '누군가 바다 동굴 끝에 숨겨 둔 대궁. 모든 화살이 불붙고 꿰뚫는다.' });
  item('bw_dawn', { type: 'bow', grade: 5, name: '여명의 활', atk: 13, draw: 0.3, el: 'light', multi: 5, col: '#fff0a8', req: { dex: 28, lv: 40 }, desc: '해가 뜨는 쪽으로만 쏠 수 있다고 전해지는 활. 모으면 빛 화살 다섯 갈래.' });
  // 방패
  item('sh_wood', { grade: 1 });
  item('sh_iron', { grade: 2, req: { vit: 4 } });
  item('sh_spike', { type: 'shield', grade: 3, name: '가시 방패', lv: 2, thorns: 3, price: 14000, req: { vit: 10 }, desc: '막을 때 가까이 있던 적이 가시에 찔린다. 불덩이까지 막는다.' });
  item('sh_mirror', { grade: 4 });
  item('sh_aegis', { type: 'shield', grade: 5, name: '새벽의 성벽', lv: 4, thorns: 5, guardAll: true, req: { vit: 22, lv: 36 }, desc: '기사단이 천 년 동안 지켜 온 방패. 앞에서 오는 것은 무엇이든 막고, 마법은 되받아친다.' });
  // 옷: def(받는 피해 배율) · fx(능력치 보너스)
  item('ar_tunic', { grade: 1 });
  item('ar_leather', { grade: 1, def: 0.9 });
  item('ar_chain', { type: 'armor', grade: 2, name: '사슬 갑옷', def: 0.8, price: 2200, req: { vit: 6 }, fx: { sta: -2 }, desc: '받는 피해 -20%. 조금 무거워 기력 -2.' });
  item('ar_heat', { grade: 2 });
  item('ar_ranger', { type: 'armor', grade: 3, name: '숲지기 망토', def: 0.84, fx: { dex: 5, roll: 0.15 }, req: { dex: 8 }, desc: '받는 피해 -16%, 솜씨 +5, 구르기 기력 -15%. 뿌리굴 안쪽 비밀방에 걸려 있었다.' });
  item('ar_scale', { type: 'armor', grade: 3, name: '비늘 갑옷', def: 0.72, price: 9000, req: { vit: 10 }, desc: '바다뱀 비늘을 엮었다. 받는 피해 -28%.' });
  item('ar_cold', { grade: 3 });
  item('ar_mage', { type: 'armor', grade: 3, name: '마도사의 로브', def: 0.88, fx: { int: 6, mpRegen: 0.6 }, price: 11000, req: { int: 10 }, desc: '받는 피해 -12%, 지력 +6, MP가 조금씩 찬다.' });
  item('ar_shadow', { grade: 4, req: { dex: 12 } });
  item('ar_knight', { grade: 4, req: { vit: 18, str: 12 } });
  item('ar_star', { grade: 5 });
  // 장신구
  item('ac_sprout', { grade: 1 });
  item('ac_str', { type: 'acc', grade: 2, name: '힘의 팔찌', fx: { str: 4 }, price: 1500, desc: '힘 +4.' });
  item('ac_shell', { type: 'acc', grade: 2, name: '거북 등딱지', fx: { vit: 5 }, price: 1800, desc: '체력 +5.' });
  item('ac_thief', { type: 'acc', grade: 2, name: '도둑의 장갑', fx: { gold: 0.5 }, price: 4200, desc: '떨어뜨리는 골드 +50%.' });
  item('ac_roll', { grade: 2 });
  item('ac_ring_crit', { grade: 3, fx: { crit: 0.1, dex: 2 }, desc: '치명타 +10%, 솜씨 +2.' });
  item('ac_mp', { grade: 3 });
  item('ac_int', { type: 'acc', grade: 3, name: '현자의 돌', fx: { int: 6 }, price: 9000, req: { lv: 14 }, desc: '지력 +6.' });
  item('ac_combo', { type: 'acc', grade: 3, name: '잔상의 방울', fx: { speed: 0.15 }, price: 12000, req: { dex: 10 }, desc: '베는 속도 +15%.' });
  item('ac_heart', { grade: 3 });
  item('ac_feather', { grade: 3 });
  item('ac_berserk', { type: 'acc', grade: 4, name: '광전사의 송곳니', fx: { berserk: 0.35 }, price: 30000, req: { str: 14 }, desc: '체력이 절반 아래면 공격 +35%.' });
  item('ac_vamp', { type: 'acc', grade: 4, name: '흡혈 송곳니', fx: { vamp: 1 }, price: 36000, req: { lv: 30 }, desc: '적을 쓰러뜨릴 때마다 하트 ¼칸.' });
  item('ac_crown', { grade: 4 });
  item('ac_star', { grade: 5 });
  item('ac_phoenix', { type: 'acc', grade: 5, name: '불사조의 깃털', fx: { phoenix: 1, regen: 0.5 }, req: { lv: 32 }, desc: '쓰러지면 한 번 하트 두 칸으로 되살아난다(쉬면 다시 찬다). 체력이 조금씩 찬다.' });
  // 소모품
  item('potion_forget', { type: 'use', grade: 3, name: '망각의 차', forget: true, price: 3000, desc: '마시면 쓴 성장 점수를 모두 돌려받는다. 능력치와 재능을 다시 고를 수 있다.' });
  item('potion_max', { type: 'use', grade: 3, name: '황금 영약', heal: 99, mp: 99, buff: { atk: 1.2, def: 0.85, t: 60 }, price: 2400, desc: '전부 회복, 1분 동안 공격 +20% · 받는 피해 -15%.' });

  /* ───────── 마법 (등급 · 요구치) ───────── */
  const SP = D.SPELLS;
  Object.assign(SP.fire, { grade: 1 });
  Object.assign(SP.ice, { grade: 2, req: { int: 4 } });
  Object.assign(SP.heal, { grade: 2 });
  Object.assign(SP.bolt, { grade: 3, req: { int: 8 } });
  Object.assign(SP.light, { grade: 4 });
  SP.wind = { name: '바람 칼날', mp: 9, icon: 'wind', col: '#b8ffd8', grade: 2, req: { int: 3 }, desc: '초승달 모양 바람 셋이 퍼져 나간다. 적을 밀어낸다.' };
  SP.quake = { name: '대지 울림', mp: 22, icon: 'quake', col: '#d8a868', grade: 3, req: { int: 12, lv: 18 }, desc: '땅을 내리쳐 주변 적을 띄우고 기절시킨다.' };
  SP.meteor = { name: '유성', mp: 40, icon: 'meteor', col: '#ff7a4a', grade: 5, req: { int: 24, lv: 36 }, desc: '하늘에서 불타는 별 다섯이 떨어진다.' };
  item('tome_wind', { type: 'tome', grade: 2, name: '바람 칼날 마도서', spell: 'wind', price: 2800, desc: '읽으면 바람 칼날을 배운다.' });
  item('tome_ice', { grade: 2 });
  item('tome_bolt', { grade: 3 });
  item('tome_quake', { type: 'tome', grade: 3, name: '대지 울림 마도서', spell: 'quake', price: 18000, desc: '읽으면 대지 울림을 배운다.' });
  item('tome_meteor', { type: 'tome', grade: 5, name: '유성 마도서', spell: 'meteor', desc: '별이 떨어지던 밤을 적은 책. 읽으면 유성을 부른다.' });

  /* ───────── 필살기 (게이지가 가득 차면) ───────── */
  const SPECIALS = {
    flash: { name: '빛의 일섬', grade: 1, desc: '빛처럼 앞으로 베며 지나간다.' },
    whirl: { name: '회오리 베기', grade: 2, req: { str: 6 }, desc: '세 바퀴 도는 회오리로 주변 적을 빨아들여 벤다.' },
    rain: { name: '화살비', grade: 2, req: { dex: 6 }, desc: '앞쪽 넓은 곳에 화살이 쏟아진다.' },
    triple: { name: '백열 삼연참', grade: 3, req: { str: 12, lv: 14 }, desc: '가까운 적 셋에게 차례로 뛰어들어 벤다.' },
    flame: { name: '불꽃 폭풍', grade: 3, req: { int: 10, lv: 14 }, desc: '주변에 불기둥이 둘러선다.' },
    frost: { name: '얼음 감옥', grade: 3, req: { int: 12, lv: 16 }, desc: '넓은 곳의 적을 모두 얼린다.' },
    shadow: { name: '그림자 분신', grade: 4, req: { dex: 12, sta: 10, lv: 22 }, desc: '분신 넷이 사방의 적을 벤다.' },
    starshot: { name: '별빛 화살', grade: 4, req: { dex: 16, lv: 24 }, desc: '모든 것을 꿰뚫는 거대한 빛 화살.' },
    thunder: { name: '천둥 강림', grade: 4, req: { int: 18, lv: 26 }, desc: '화면의 적 여덟에게 벼락이 떨어진다.' },
    meteor: { name: '유성 낙하', grade: 4, req: { str: 16, int: 10, lv: 28 }, desc: '높이 뛰어올라 내리찍는다. 큰 충격파.' },
    dance: { name: '새벽의 검무', grade: 5, req: { str: 22, lv: 36 }, desc: '여섯 번 뛰어들며 베고, 마지막에 빛이 터진다.' },
    judge: { name: '흰빛 심판', grade: 5, req: { int: 24, lv: 38 }, desc: '하늘에서 빛기둥이 내려 화면의 모든 적을 벌한다.' },
  };
  const art = (id, sp, o) => item(id, Object.assign({ type: 'art', special: sp, grade: SPECIALS[sp].grade, name: '비기: ' + SPECIALS[sp].name, desc: '읽으면 필살기 「' + SPECIALS[sp].name + '」을 익힌다. ' + SPECIALS[sp].desc }, o || {}));
  art('art_whirl', 'whirl', { price: 3200 });
  art('art_rain', 'rain', { price: 3200 });
  art('art_triple', 'triple', { price: 12000 });
  art('art_flame', 'flame', { price: 12000 });
  art('art_frost', 'frost', { price: 14000 });
  art('art_shadow', 'shadow', { price: 34000 });
  art('art_starshot', 'starshot', { price: 38000 });
  art('art_thunder', 'thunder', { price: 36000 });
  art('art_meteor', 'meteor');
  art('art_dance', 'dance');
  art('art_judge', 'judge');

  /* ───────── 재능 나무: 네 갈래 × 여섯 줄. 같은 gate의 두 칸은 하나만 ───────── */
  const T = (tree, row, id, name, cost, desc, o) => Object.assign({ id, tree, row, name, cost, desc, grade: [1, 1, 2, 3, 3, 4, 5][row] }, o || {});
  const ROW_REQ = [null, { lv: 1 }, { lv: 6 }, { lv: 12 }, { lv: 18 }, { lv: 26 }, { lv: 36 }];
  const SKILLS = [
    T('검술', 1, 'sw_combo', '네 번째 베기', 2, '연속 베기 끝에 올려 베기가 붙는다.'),
    T('검술', 2, 'sw_charge', '빠른 모으기', 2, '회전 베기를 모으는 시간 -40%.'),
    T('검술', 2, 'sw_lunge', '돌진 찌르기', 2, '달리다 공격하면 멀리 뛰어들며 찌른다 (피해 ×1.8).'),
    T('검술', 3, 'sw_counter', '반격', 3, '완벽 회피 직후 공격은 치명타.', { gate: 'sw3', str: 6 }),
    T('검술', 3, 'sw_parry', '튕겨내기', 3, '적의 공격이 닿는 순간 베면 튕겨내고 적이 비틀거린다.', { gate: 'sw3', str: 6 }),
    T('검술', 4, 'sw_great', '대회전', 3, '회전 베기가 두 바퀴 돌고 범위가 넓어진다.', { str: 10 }),
    T('검술', 4, 'sw_wave', '검풍', 3, '다 모은 회전 베기가 사방으로 충격파를 날린다.', { str: 10 }),
    T('검술', 5, 'sw_frenzy', '광란', 4, '적을 쓰러뜨리면 8초 동안 베는 속도 +30%.', { gate: 'sw5', str: 16 }),
    T('검술', 5, 'sw_execute', '처형', 4, '체력 ¼ 아래의 적은 언제나 치명타.', { gate: 'sw5', str: 16 }),
    T('검술', 6, 'sw_master', '검성', 5, '모든 베기 피해 +20%. 마지막 베기마다 검기가 난다.', { str: 24 }),

    T('궁술', 1, 'bw_fast', '빠른 시위', 2, '활을 당기는 시간 -30%.'),
    T('궁술', 2, 'bw_pierce', '꿰뚫기', 2, '모은 화살이 적을 꿰뚫는다.'),
    T('궁술', 2, 'bw_quiver', '큰 화살통', 2, '화살을 30개 더 가지고 다닌다.'),
    T('궁술', 3, 'bw_fire', '불화살', 3, '모은 화살에 불이 붙는다 (MP 4).', { gate: 'bw3', dex: 6 }),
    T('궁술', 3, 'bw_ice', '얼음화살', 3, '모은 화살이 적을 얼린다 (MP 4).', { gate: 'bw3', dex: 6 }),
    T('궁술', 4, 'bw_multi', '세 갈래', 3, '모은 화살이 세 갈래로 나간다.', { dex: 10 }),
    T('궁술', 4, 'bw_snipe', '저격', 3, '멀리 있는 적일수록 피해가 커진다 (최대 +60%).', { dex: 10 }),
    T('궁술', 5, 'bw_rapid', '연사', 4, '모으지 않은 화살을 두 발씩 쏜다.', { gate: 'bw5', dex: 16 }),
    T('궁술', 5, 'bw_heavy', '극한 조준', 4, '다 모은 뒤 더 버티면 거대한 관통 화살 (피해 ×3).', { gate: 'bw5', dex: 16 }),
    T('궁술', 6, 'bw_master', '신궁', 5, '치명타 +15%. 쏜 화살의 30%가 돌아온다.', { dex: 24 }),

    T('마법', 1, 'mg_pool', '깊은 샘', 2, '최대 MP +30.'),
    T('마법', 2, 'mg_flow', '흐르는 빛', 2, 'MP가 천천히 저절로 찬다.'),
    T('마법', 2, 'mg_quick', '빠른 영창', 2, '마법을 거는 동작이 짧아진다.'),
    T('마법', 3, 'mg_power', '증폭', 3, '마법 피해 +50%.', { gate: 'mg3', int: 6 }),
    T('마법', 3, 'mg_thrift', '절약', 3, '마법 MP 소모 -35%.', { gate: 'mg3', int: 6 }),
    T('마법', 4, 'mg_echo', '메아리', 3, '마법을 쓰면 25% 확률로 한 번 더.', { int: 10 }),
    T('마법', 4, 'mg_deep', '원소 심화', 3, '화상 · 빙결 · 감전 · 독이 두 배 오래 간다.', { int: 10 }),
    T('마법', 5, 'mg_over', '과부하', 4, 'MP가 80% 이상이면 마법 피해 ×1.8.', { gate: 'mg5', int: 16 }),
    T('마법', 5, 'mg_siphon', '마나 흡수', 4, '마법으로 적을 쓰러뜨리면 MP 8 회복.', { gate: 'mg5', int: 16 }),
    T('마법', 6, 'mg_master', '대마도사', 5, '모든 마법 피해 +30%, 필살 게이지가 마법으로도 빨리 찬다.', { int: 24 }),

    T('생존', 1, 'sv_stam', '단련', 2, '최대 기력 +30.'),
    T('생존', 2, 'sv_roll', '바람 발', 2, '구르기 무적 시간 +50%.'),
    T('생존', 2, 'sv_herb', '약초학', 2, '물약과 음식의 회복 +50%.'),
    T('생존', 3, 'sv_heart', '두근', 3, '하트 1칸이 는다.', { gate: 'sv3', vit: 6 }),
    T('생존', 3, 'sv_regen', '재생', 3, '싸우지 않을 때 체력이 조금씩 찬다.', { gate: 'sv3', vit: 6 }),
    T('생존', 4, 'sv_second', '버팀', 3, '하트 반 칸 이상이면 한 방에 쓰러지지 않는다.', { sta: 8 }),
    T('생존', 4, 'sv_dodgeatk', '회피 베기', 3, '구르기 끝에 공격하면 돌진 베기 (피해 ×1.6).', { sta: 8 }),
    T('생존', 5, 'sv_iron', '강철 피부', 4, '받는 피해 -15%.', { gate: 'sv5', vit: 14 }),
    T('생존', 5, 'sv_adren', '아드레날린', 4, '체력이 낮을수록 공격 · 필살 게이지 증가 (최대 +40%).', { gate: 'sv5', vit: 14 }),
    T('생존', 6, 'sv_master', '불굴', 5, '쓰러지면 한 번 하트 두 칸으로 일어선다 (쉬면 다시).', { vit: 20 }),
  ];
  for (const k of SKILLS) k.req = Object.assign({}, ROW_REQ[k.row], k.str ? { str: k.str } : {}, k.dex ? { dex: k.dex } : {}, k.int ? { int: k.int } : {}, k.vit ? { vit: k.vit } : {}, k.sta ? { sta: k.sta } : {});
  D.SKILLS = SKILLS;
  D.SPECIALS = SPECIALS;
  D.TREES = ['검술', '궁술', '마법', '생존'];

  /* ───────── 가게 물건 (마을마다 그 마을에 어울리는 것 · 장이 갈수록 윗 등급) ───────── */
  Object.assign(D.SHOPS, {
    green: { name: '초록 바구니 잡화점', items: ['potion_r', 'food_corn', 'arrows10', 'ar_leather', 'bw_bone', 'ac_str', 'ac_shell'] },
    red: { name: '볼칸의 대장간', items: ['sw_iron', 'sh_iron', 'ar_chain', 'ar_heat', 'potion_r', 'bombs5', 'food_tteok', 'art_whirl'], forge: true },
    blue: { name: '파도 잡화점', items: ['sw_tide', 'sw_dagger', 'ar_scale', 'potion_r', 'potion_b', 'arrows10', 'food_udon', 'ac_roll', 'tome_wind'] },
    yellow: { name: '대바자르', items: ['bw_long', 'sw_great', 'ac_ring_crit', 'ac_thief', 'potion_g', 'bombs5', 'arrows10', 'ac_mp', 'art_rain', 'art_triple'] },
    purple: { name: '라벤더 마도구점', items: ['potion_b', 'potion_g', 'ac_mp', 'tome_ice', 'tome_bolt', 'ar_mage', 'ac_int', 'sw_thorn', 'art_frost', 'art_flame', 'potion_forget'] },
    rainbow: { name: '축제 노점', items: ['potion_r', 'food_corn', 'arrows10', 'bombs5', 'bw_wind', 'ac_combo', 'potion_forget'] },
    white: { name: '설원 상점', items: ['ar_cold', 'food_bread', 'potion_r', 'potion_g', 'bw_frost', 'sh_spike', 'potion_max'] },
    gray: { name: '고철 시장', items: ['bombs5', 'arrows10', 'potion_r', 'potion_b', 'ac_heart', 'sw_storm', 'tome_quake', 'art_thunder', 'potion_max'] },
    black: { name: '밤의 가게', items: ['ar_shadow', 'potion_g', 'arrows10', 'bombs5', 'sw_moon', 'ac_berserk', 'art_shadow', 'potion_forget'] },
    colorful: { name: '발명 공방', items: ['bombs5', 'potion_g', 'arrows10', 'ac_vamp', 'art_starshot', 'potion_max', 'potion_forget'] },
  });
  // 대장간: 강화 길이 둘로 갈린다 (불꽃 → 백은 / 불꽃 → 용암)
  Object.assign(D.FORGE, {
    sw_wood: { to: 'sw_start', gold: 0, mats: {}, hide: true },
    sw_iron: { to: 'sw_flame', gold: 2500, mats: { m_scale: 5, m_ore: 6 } },
    sw_dagger: { to: 'sw_moon', gold: 18000, mats: { m_moon: 6, m_fang: 8 } },
    sw_great: { to: 'sw_ember', gold: 24000, mats: { m_scale: 10, m_stone: 8 } },
  });
  delete D.FORGE.sw_wood;

  /* ───────── 난이도 ───────── */
  const DIFF = [
    { id: 0, name: '쉬움', desc: '이야기를 따라가고 싶을 때. 받는 피해가 적고 적이 무르다.', hurt: 0.65, hp: 0.85, spd: 0.92, heal: 1.4, exp: 1.2, tele: 1.25 },
    { id: 1, name: '보통', desc: '처음이라면. 적도 방심하지 않는다 — 구르기와 방패를 쓰게 된다.', hurt: 1.25, hp: 1.15, spd: 1, heal: 1, exp: 1, tele: 1 },
    { id: 2, name: '어려움', desc: '한 번 한 번이 싸움이다. 받는 피해 +30%, 적 체력 +20%, 회복이 드물다.', hurt: 1.65, hp: 1.4, spd: 1.07, heal: 0.75, exp: 1.1, tele: 0.85 },
    { id: 3, name: '악몽', desc: '한 번의 실수가 무겁다. 받는 피해 거의 두 배, 적 체력 +50%, 회복이 아주 드물다.', hurt: 2.3, hp: 1.75, spd: 1.13, heal: 0.5, exp: 1.2, tele: 0.72 },
  ];
  const diff = () => DIFF[(G.state && G.state.settings && G.state.settings.diff != null) ? G.state.settings.diff : 1] || DIFF[1];

  /* ───────── 요구치 ───────── */
  /** 장비 보너스를 더한 능력치 (요구치 확인은 맨몸 기준) */
  function reqOk(s, req) {
    if (!req) return true;
    for (const k in req) { const have = k === 'lv' ? s.lv : ((s.stats && s.stats[k]) || 0); if (have < req[k]) return false; }
    return true;
  }
  function reqText(s, req) {
    if (!req) return '';
    return Object.keys(req).map((k) => { const have = k === 'lv' ? s.lv : ((s.stats && s.stats[k]) || 0); const ok = have >= req[k]; return (ok ? '' : '[r]') + STAT_NAME[k] + ' ' + req[k] + (ok ? '' : '[/]'); }).join(' · ');
  }
  /** 재능 한 칸을 배울 수 있는가 → null(된다) 또는 막힌 까닭 */
  function skillBlock(s, sk) {
    if (s.skills[sk.id]) return '배움';
    if (sk.gate) { const other = SKILLS.find((x) => x.gate === sk.gate && x.id !== sk.id && s.skills[x.id]); if (other) return '갈림길: 「' + other.name + '」을 골랐다'; }
    const prevRow = SKILLS.filter((x) => x.tree === sk.tree && x.row === sk.row - 1);
    if (prevRow.length && !prevRow.some((x) => s.skills[x.id])) return '앞 줄을 먼저';
    if (!reqOk(s, sk.req)) return '필요: ' + reqText(s, sk.req).replace(/\[\/?r\]/g, '');
    if ((s.pts || 0) < sk.cost) return '점수 ' + sk.cost + '점 필요';
    return null;
  }
  /** 성장 점수를 전부 돌려받는다 (망각의 차) */
  function refund(s) {
    let back = 0;
    for (const k of STATS) { back += s.stats[k.id] || 0; s.stats[k.id] = 0; }
    for (const id of Object.keys(s.skills)) { const sk = SKILLS.find((x) => x.id === id); if (sk) back += sk.cost; }
    s.skills = {};
    s.pts = (s.pts || 0) + back;
    return back;
  }
  /** 옛 기록(재능 점수만 있던 때)을 새 방식으로 */
  function migrate(s) {
    if (!s.stats) {
      s.stats = { str: 0, vit: 0, sta: 0, int: 0, dex: 0 };
      const spent = Object.keys(s.skills || {}).reduce((a, id) => { const sk = SKILLS.find((x) => x.id === id); return a + (sk ? sk.cost : 0); }, 0);
      // 옛 재능은 그대로 두고, 레벨만큼 새 점수를 준다
      s.pts = Math.max(0, (s.lv - 1) * 3 - spent) + (s.sp || 0);
      s.sp = 0;
    }
    if (!s.specials) s.specials = { flash: true };
    if (!s.specialMove) s.specialMove = 'flash';
    if (s.settings && s.settings.diff == null) s.settings.diff = 1;
    for (const id of Object.keys(s.skills || {})) if (!SKILLS.find((x) => x.id === id)) delete s.skills[id];
    return s;
  }

  G.prog = { GRADES, gradeOf, STATS, STAT_NAME, soft, SPECIALS, SKILLS, DIFF, diff, reqOk, reqText, skillBlock, refund, migrate, PTS_PER_LV: 3 };
})();
