/* 대륙의 삶: 진실의 조각 · 낚시와 물속의 편지 · 들짐승 · 벤치 · 동행과의 대화 · 쉬는 밤의 대화 · 결말 판정
   장마다 흩어진 이야기를 한데 묶는다. 어느 순서로 모아도 되고, 모은 만큼 마지막이 달라진다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, U = G.u, D = G.data, E = G.engine;

  /* ───────── 진실의 조각 ─────────
     경험세가 모은 빛은 방패가 아니라 등대였다. 흑점은 빛의 「양」이 아니라 「쏠림」을 따라온다.
     다섯 조각 이상을 알면 마지막에 카이론과 싸우지 않고 말로 설득할 수 있다. */
  Object.assign(G.story.truths, {
    t_chart: { title: '흑점의 걸음', text: '아스텔 박사의 관측표. 983년 이후 대륙에 징수탑이 하나씩 설 때마다 흑점의 걸음이 빨라졌다. 박사는 여백에 「우연이어야 한다」고 적었다.', hint: '레드 · 별만 보는 노인의 책상 서랍' },
    t_log: { title: '등대지기의 항해일지', text: '「검은 별의 조각은 빛이 모인 곳으로 간다.」 바다 위에서 본 흑점은 해안의 탑 불빛을 따라 방향을 틀었다.', hint: '블루 · 삼 년째 불 꺼진 등대' },
    t_colors: { title: '다섯 빛깔의 이유', text: '창세 신화의 진짜 모습. 천 년 전 아우룸은 흑점의 눈을 속이려고 한곳에 모인 흰빛을 다섯 빛깔로 쪼개 대륙에 흩었다. 등급 제도도, 구슬도 빛이 다시 한곳에 모이지 않게 하려는 장치였다.', hint: '블루 · 잠긴 서고 가장 안쪽 / 블랙 · 천 년을 산 정보상' },
    t_serin: { title: '무한의 그릇 · 지워진 마지막 장', text: '세린의 연구 노트. 「그릇은 삼키는 것이 아니라 나누는 것이어야 한다. 삼키면 봉인이고, 나누면 끝이다. 나에게는 나눌 사람도, 시간도 없었다.」', hint: '퍼플 · 베라 교수의 금 간 찻잔' },
    t_612: { title: '잿빛의 사흘', text: '은빛 왕국은 대광맥의 빛을 수도 한 점에 모았다. 사흘 뒤 흑점이 처음 하늘에 나타났고, 왕국의 색이 빠졌다.', hint: '그레이 · 612년에 멈춘 기록 보관소' },
    t_design: { title: '부치지 않은 편지', text: '볼트의 글씨. 「탑들이 모은 빛을 한 점으로 쏘아 올리면 그 점은 방패가 아니라 등대가 된다. 멈춰라. — 990년 가을」 우표는 붙어 있고 소인은 없다.', hint: '그레이 · 설계자가 잠가 둔 서랍 (열쇠는 세피아가)' },
    t_stella: { title: '400년의 관측', text: '하늘 정거장의 기록. 흑점은 빛이 가장 짙은 곳이 아니라 빛이 가장 「쏠린」 곳을 향한다. 스텔라는 400년 전에 이 계산을 끝냈지만, 들어 줄 사람이 없었다.', hint: '하늘 정거장 · 혼자 남은 목소리' },
    t_bella: { title: '벨라의 마지막 말', text: '「우리가 모였기 때문에 그것이 왔다. 이긴 뒤에는 빛을 흩어라. 다시는 한곳에 모으지 마라.」 612년, 두 번째 전설의 유언.', hint: '아스트라 · 두 번째 전설의 요새' },
  });
  const TRUTH_NEED = 5;
  G.story.TRUTH_NEED = TRUTH_NEED;

  /* ───────── 결말 판정 ─────────
     마지막 싸움에 빛을 보내 주는 마을 (각 장의 선택과 인연이 정한다) */
  G.story.support = (s) => {
    const f = s.flags, d = (k) => f['d_' + k], b = (id) => (s.bond || {})[id] || 0;
    return [
      { id: 'green', ok: true, why: '할머니' },
      { id: 'red', ok: b('rud') >= 1 || b('lea') >= 1 || d('ledger') === 'burn', why: '루드와 레아' },
      { id: 'blue', ok: s.quests.q_light === 'done' || b('bitna') >= 2, why: '등대의 불' },
      { id: 'yellow', ok: d('kkachi') === 'spare' || d('goldie') === 'contract', why: '피카 또는 골디' },
      { id: 'purple', ok: b('vera') >= 1 || s.quests.q_miru === 'done', why: '베라와 학원' },
      { id: 'rainbow', ok: d('festival') !== 'bomb', why: '천년제' },
      { id: 'white', ok: d('patient') !== 'lumie' || b('lumie') >= 2, why: '루미에' },
      { id: 'gray', ok: d('bolt') === 'talk' || s.quests.q_noel === 'done', why: '볼트와 세피아' },
      { id: 'black', ok: d('nocturne') === 'promise' || s.quests.q_lamps === 'done', why: '녹턴 또는 등불 거리' },
      { id: 'space', ok: d('stella') === 'carry', why: '스텔라' },
      { id: 'colorful', ok: true, why: '불꽃 천 발' },
    ];
  };
  G.story.ending = (s) => {
    // 볼트의 말을 품고 가면 역류 장치의 출력이 올라, 마을 하나 몫의 빛이 더 모인다
    const sup = G.story.support(s).filter((x) => x.ok).length + (s.flags.creed === 'bolt' ? 1 : 0);
    const truths = Object.keys(s.truth || {}).filter((k) => G.story.truths[k]).length;
    return { sup, truths, share: sup >= 8, persuade: truths >= TRUTH_NEED };
  };

  /* ───────── 낚시 ───────── */
  const FISH = {
    green: [['f_crucian', '연못 붕어', 60, 12, '그린 마을 연못의 터줏대감. 느림보 영감이 40년 동안 한 번도 못 낚은 바로 그 종류.'], ['f_loach', '초록 미꾸라지', 30, 30, '손에서 자꾸 빠져나간다. 할머니는 추어탕을 끓인다.'], ['f_koi', '황금 잉어', 8, 120, '비늘마다 햇빛이 고여 있다. 그린 사람들은 이걸 낚으면 한 해가 풍년이라고 믿는다.']],
    blue: [['f_mackerel', '고등어', 55, 12, '블루 어시장의 주인공. 등 무늬가 파도처럼 흐른다.'], ['f_horse', '은빛 전갱이', 30, 30, '떼로 다니는 물고기. 한 마리가 방향을 틀면 전부 튼다.'], ['f_octo', '파랑 문어', 12, 60, '옥타비오 관장의 먼 친척이라는 소문이 있다. 본인들은 부인한다.'], ['fish_gold', '황금 고등어', 3, 0, '']],
    yellow: [['f_catfish', '오아시스 메기', 55, 12, '사막 한가운데서 수염을 기른 물고기. 모래바람이 불면 바닥에 숨는다.'], ['f_eel', '모래 뱀장어', 30, 30, '물과 모래를 가리지 않고 헤엄친다.'], ['f_pearl', '사막 진주조개', 8, 120, '입을 열면 진주가 보인다. 상인들은 이걸로 금화 대신 셈을 치르기도 한다.']],
    purple: [['f_minnow', '보랏빛 송사리', 55, 12, '해 질 녘 색을 그대로 입었다. 16년째 저녁인 숲에서 자랐다.'], ['f_mirror', '거울 잉어', 30, 30, '비늘에 낚은 사람의 얼굴이 비친다. 조금 슬픈 얼굴로.'], ['f_moon', '달그림자 붕어', 8, 120, '달빛이 닿는 곳에만 산다. 숲에 16년 동안 달이 뜨지 않아서 몹시 귀하다.']],
    rainbow: [['f_cloudanch', '구름 멸치', 55, 12, '구름 바다를 떼 지어 헤엄친다. 말리면 솜처럼 가볍다.'], ['f_candyfish', '솜사탕 복어', 30, 30, '화가 나면 부푼다. 부풀면 달콤한 냄새가 난다.'], ['f_flying', '무지개 날치', 8, 120, '구름 위로 뛰어오를 때마다 짧은 무지개가 선다.']],
    white: [['f_smelt', '얼음 빙어', 55, 12, '몸이 투명해서 뼈까지 보인다. 성기사들의 겨울 간식.'], ['f_salmon', '눈꽃 연어', 30, 30, '얼음 밑을 거슬러 오른다. 대성당 창문에 새겨진 물고기가 이것이다.'], ['f_cod', '수정 대구', 8, 120, '얼음 신전 물밑에서만 산다. 기도하는 사람 그림자를 따라다닌다는 말이 있다.']],
    black: [['f_blind', '눈 없는 메기', 55, 12, '해가 뜨지 않는 도시의 우물에서 자랐다. 눈이 필요 없었다.'], ['f_nighteel', '밤 뱀장어', 30, 30, '등불 빛을 싫어한다. 등불을 켜 두면 우물 밑바닥으로 숨는다.'], ['f_starfish', '별 삼킨 붕어', 8, 120, '배 속에서 희미한 빛이 난다. 블랙 사람들은 이걸 보면 소원을 빈다.']],
    colorful: [['f_firegizzard', '폭죽 전어', 55, 12, '구우면 기름이 튀어 작은 불꽃이 선다. 알록달록 사람들은 그게 좋아서 굽는다.'], ['f_tropic', '알록달록 열대어', 30, 30, '비늘마다 색이 다르다. 등급 따위 모르는 물고기.'], ['f_ray', '불꽃 가오리', 8, 120, '물속에서 날개를 펴면 수면이 잠깐 붉게 빛난다.']],
  };
  const REG_I = { green: 0, red: 1, blue: 2, yellow: 3, purple: 4, rainbow: 5, white: 6, gray: 7, black: 8, colorful: 9, space: 10, planet: 11 };
  for (const reg in FISH) for (const [id, name, , f, desc] of FISH[reg]) {
    if (D.ITEMS[id]) continue;
    D.ITEMS[id] = { id, name, type: 'mat', price: D.price(REG_I[reg], f, 0.5), desc: desc + ' 상점에 팔 수 있다.' };
  }
  G.story.FISH = FISH;
  G.story.canFish = (s) => E.has(s, 'rod');
  /** 가방에 있는 낚은 물고기 하나 (황금 고등어는 빼고, 흔한 것부터) */
  G.story.fishIn = (s) => {
    const all = [];
    for (const reg in FISH) for (const f of FISH[reg]) if (f[0] !== 'fish_gold' && E.has(s, f[0])) all.push(f);
    all.sort((a, b) => b[2] - a[2]);
    return all.length ? all[0][0] : null;
  };

  /* 물속의 편지: 983년, 아스트라로 떠나던 세린이 지나는 물마다 던진 편지. 물은 결국 어디에나 닿으니까. */
  const LETTER_AT = { green: 'l_green', blue: 'l_blue', yellow: 'l_yellow', purple: 'l_purple', rainbow: 'l_rainbow', white: 'l_white', black: 'l_black', colorful: 'l_colorful' };
  W.book('l_green', { title: '물속의 편지 · 첫 번째', where: '그린 마을 물가 (낚시)', author: '세린', text:
    '아가에게.\n\n이 편지를 누가 건질지 모르겠어. 물고기일 수도 있고, 느림보 영감님일 수도 있어. 그래도 엄마는 네가 건질 거라고 믿어. 물은 결국 어디로든 흐르고, 너는 결국 어디로든 갈 테니까.\n\n' +
    '지금 너는 에벨린 선생님 품에서 자고 있어. 선생님은 무서운 분이야. 창을 들면 산적도 길을 비켜. 그런데 너를 안으니까 손이 떨리시더라. 그 손을 오래 기억해 줘.\n\n' +
    '네 이름은 엄마가 짓지 않기로 했어. 선생님께 부탁드렸어. 엄마가 지으면 자꾸 부르고 싶어질 테니까. 멀리서도, 수정 속에서도.\n\n내일 떠나. 열여섯의 너에게, 열아홉의 엄마가.' });
  W.book('l_blue', { title: '물속의 편지 · 두 번째', where: '블루 바다 (낚시)', author: '세린', text:
    '대도서관에 내 책을 맡겼어. 「무한의 그릇에 관하여」. 옥타비오 관장님은 금서로 묶겠대. 천년성이 태울까 봐.\n\n' +
    '고백할 게 있어. 그 책에는 그릇이 흑점을 삼킨다고 썼어. 쓰면서도 틀렸다고 생각했어. 삼키는 건 쉬워. 혼자 하면 되니까. 어려운 건 나누는 거야. 나눌 사람이 있어야 하니까.\n\n' +
    '시간이 조금만 더 있었다면 나누는 법을 찾았을 거야. 그러니까 이건 숙제야. 엄마가 못 푼 숙제.' });
  W.book('l_yellow', { title: '물속의 편지 · 세 번째', where: '옐로 오아시스 (낚시)', author: '세린', text:
    '골디가 아스트라에 따라오겠다고 떼를 썼어. 말렸어. 누군가는 남아서 세상을 먹여 살려야 하잖아. 골디는 그런 걸 제일 잘하는 사람이고.\n\n' +
    '골디는 차값을 늘 더 내. 거스름돈은 다음에 받겠대. 다음이 없을지도 모르는 사람한테 그러는 게 골디식 작별이야. 그 사람은 가난이 얼마나 무서운지 너무 잘 알아서, 가끔 무서운 짓을 해. 그래도 미워하지 말아 줘. 셈이 정직한 사람은 결국 돌아와.' });
  W.book('l_purple', { title: '물속의 편지 · 네 번째', where: '보랏빛 숲의 물 (낚시)', author: '세린', text:
    '거울 연못이 내 기억을 보여 줬어. 너를 처음 안은 날. 그리고 네 아빠.\n\n' +
    '네 아빠 얘기를 아직 안 했지. 그 사람은 계산을 잘해. 너무 잘해서 탈이야. 슬픔까지 숫자로 바꿔 버려. 그래야 버틸 수 있는 사람이라서, 나는 그 사람 옆에서 대신 울어 주곤 했어.\n\n' +
    '엄마가 없으면 그 사람은 누구 옆에서 울까. 그게 제일 걱정이야. 너보다 더.\n…미안. 엄마가 이런 말을 하면 안 되는데.' });
  W.book('l_rainbow', { title: '물속의 편지 · 다섯 번째', where: '구름 바다 (낚시)', author: '세린', text:
    '무지개 마을은 천년제 준비로 시끄러워. 17년 뒤에 열린대. 천 년째 되는 해. 너랑 같이 오고 싶었어.\n\n' +
    '무지개 샘에서 들은 이야기. 다섯 빛깔은 원래 하나였대. 흰빛. 누군가 그걸 일부러 쪼갰대. 모이면 안 되는 이유가 있었다고.\n\n' +
    '그 이유를 알 것 같아서 무서워. 우리가 지금 하려는 일이 딱 그 반대거든. 대륙에서 가장 밝은 셋이 한곳에 모이는 일.' });
  W.book('l_white', { title: '물속의 편지 · 여섯 번째', where: '화이트 얼음 구멍 (낚시)', author: '세린', text:
    '루미에가 내 앞길을 축복해 줬어. 희생은 아름다운 거래. 루미에는 진심이야. 그래서 더 아팠어.\n\n' +
    '아가. 희생은 아름답지 않아. 필요할 뿐이야. 필요한 날에도 아름답다고 부르면 안 돼. 그렇게 부르는 순간, 다음 사람한테도 시키게 되니까.\n\n' +
    '네가 커서 누군가를 위해 스스로를 버리겠다고 하면, 엄마는 수정 속에서도 화낼 거야. 진짜로.' });
  W.book('l_black', { title: '물속의 편지 · 일곱 번째', where: '블랙 마을 우물 (낚시)', author: '세린', text:
    '녹턴은 말이 없어. 대신 밤새 불 옆을 지켜. 우리가 잘 때도, 싸울 때도. 그림자는 빛이 있어야 생긴다고 농담을 했더니, 처음으로 웃었어.\n\n' +
    '이제 네 아빠 얘기를 끝까지 할게. 그 사람은 챔피언이야. 대륙에서 가장 강한 사람. 그런데 나를 붙잡을 힘은 없대. 내가 가겠다고 했거든.\n\n' +
    '그 사람이 너를 찾아오지 않는다면, 그건 너를 사랑하지 않아서가 아니야. 자기가 무슨 계산을 하게 될지 무서워서야.\n\n미워해도 돼. 하지만 미워하는 채로 끝내지는 마.' });
  W.book('l_colorful', { title: '물속의 편지 · 여덟 번째', where: '알록달록 곶 (낚시)', author: '세린', text:
    '피로스 박사님께 로켓을 부탁했어. 네가 탈 로켓. 박사님은 스무 번쯤 터뜨릴 거래. 스물한 번째에 날 거래.\n\n' +
    '이게 마지막 편지야. 여기서부터는 물이 없어.\n\n' +
    '엄마가 못 한 걸 네가 해 줬으면 좋겠어. 삼키지 말고, 나눠. 혼자 하지 말고, 같이. 그리고 꼭 돌아와. 엄마는 못 돌아왔지만, 너는 돌아와서 할머니한테 밥 먹었다고 말해.\n\n오늘도 렙업. 내일도 렙업.\n— 세린' });
  G.story.LETTER_AT = LETTER_AT;

  /** 물가에서 A: 입질을 기다렸다가 A */
  G.story.fishing = async (c, x, y, poolId) => {
    const s = c.s;
    const reg = poolId || (G.field.map && G.field.map.fishPool) || (G.field.map && G.field.map.region) || 'green';
    const pool = FISH[reg] || FISH.green;
    if (!s.flags.tip_fish) {
      s.flags.tip_fish = true;
      await c.sys(['느림보 영감의 낚싯대를 드리웠다.', '찌가 흔들리며 머리 위에 [y]![/]가 뜨면 곧바로 [y]A[/]! 너무 빨라도, 늦어도 놓친다. [y]B[/]는 그만두기.']);
    }
    c.sfx('splash');
    G.field.emote(G.field.player, '…', 2.5);
    const r = await c.bite(1.2 + Math.random() * 3.2, 0.75);
    if (r === 'cancel') { await c.say(null, '낚싯줄을 감았다.'); return; }
    if (r === 'early') { await c.say(null, '너무 서둘렀다. 물고기가 찌만 건드리고 달아났다.'); return; }
    if (r === 'miss') { await c.say(null, '찌가 쑥 들어갔다가… 다시 떠올랐다. 놓쳤다.'); return; }
    c.sfx('splash');
    s.fishLog = s.fishLog || {};
    const key = 'n_' + reg;
    s.fishLog[key] = (s.fishLog[key] || 0) + 1;
    // 물속의 편지: 그 물에서 몇 번 낚으면 반드시 걸린다
    const lid = LETTER_AT[reg];
    if (lid && !s.books[lid] && (Math.random() < 0.18 || s.fishLog[key] >= 4)) {
      await c.say(null, '묵직하다… 물고기가 아니다. 밀랍으로 입구를 막은 작은 유리병이다. 안에 접힌 종이가 들어 있다.');
      await c.book(lid);
      const n = Object.values(LETTER_AT).filter((b) => s.books[b]).length;
      if (n === 1) await c.say('dotori:surprise', ['…이 글씨. 나, 이 글씨 알아.', '둥글고 작은 글씨. 비석 뒤에 「성장은 나누는 거예요」라고 쓴 사람이야.']);
      else if (n === 8) await c.say('dotori:sad', ['여덟 통. 세린은 지나는 물마다 한 통씩 던졌던 거야.', '…16년 동안 물속에서 너를 기다렸네.']);
      if (lid === 'l_black' && !s.flags.kairon_father) {
        await c.say('dotori:surprise', ['…챔피언. 대륙에서 가장 강한 사람.', '{n}. 975년부터 지금까지 챔피언은 한 사람뿐이야.']);
        await c.say('dotori:sad', '……카이론.');
        s.flags.kairon_father = true; s.flags.father_from = 'letter';
      }
      return;
    }
    // 세나의 미끼: 귀한 물고기가 두 배로 잘 문다
    const wt = (f) => f[2] * (f[2] <= 8 && E.has(s, 'bait_old') ? 2 : 1);
    const tot = pool.reduce((a, f) => a + wt(f), 0);
    let v = Math.random() * tot, pick = pool[0];
    for (const f of pool) { v -= wt(f); if (v <= 0) { pick = f; break; } }
    const [id, name] = pick;
    if (id === 'fish_gold' && E.has(s, 'fish_gold')) { c.give('f_mackerel'); await c.say(null, '고등어를 낚았다! …금빛이었으면 좋았을 텐데.'); return; }
    c.give(id);
    s.fishLog[id] = (s.fishLog[id] || 0) + 1;
    const rare = pick[2] <= 8;
    if (rare) { c.jingle('secret'); await c.say(null, '[y]' + name + '[/]! 흔히 볼 수 없는 녀석이다. 팔을 타고 물기가 흘러내린다.'); }
    else if (id === 'fish_gold') await c.say('dotori:surprise', ['찍?! 황금 고등어! 어시장에서 5만 골드 하는 그거!', '…미드나잇이 좋아한다던 그 생선이다.']);
    else await c.say(null, name + '을(를) 낚았다.');
  };

  /* ───────── 들짐승 ───────── */
  G.story.critter = async (c, n) => {
    const reg = (G.field.map && G.field.map.region) || 'green';
    const L = {
      cat: ['고양이가 눈을 가늘게 뜨고 이쪽을 본다. 한참 보다가, 흥미 없다는 듯 하품을 한다.', '고양이가 발등에 머리를 한 번 비비고 가 버렸다. 허락받은 기분이다.', '고양이 꼬리 끝이 까딱까딱한다. 무언가 계산 중인 것 같다.', reg === 'black' ? '까만 고양이다. 미드나잇의 부하일지도 모른다. 눈을 마주치자 먼저 고개를 돌렸다.' : '털에 재가 조금 묻어 있다. 이 동네에서 꽤 오래 산 모양이다.'],
      bird: ['새가 고개를 갸웃한다. 가까이 가자 한 걸음씩 물러선다. 딱 한 걸음씩.', '작은 새가 땅에서 무언가를 쪼고 있다. 부스러기다. 누군가 매일 뿌려 주는 모양이다.', reg === 'gray' ? '잿빛 새다. 원래 무슨 색이었는지는 새도 모를 것이다.' : '새가 짹, 하고 한 번 울더니 날아올랐다가 다시 내려앉았다.'],
      squirrel: ['다람쥐가 볼이 터지도록 토리아를 물고 있다. 토리아와 눈이 마주치자 둘 다 얼어붙었다.', '다람쥐가 이쪽을 본다. …토리아를 동족으로 보는 걸까, 경쟁자로 보는 걸까.'],
    }[n.critter] || ['작은 동물이 고개를 갸웃한다.'];
    await c.say(null, U.pick(L));
    if (n.critter === 'squirrel' && G.state.follower === 'dotori' && !c.flag('sq_meet')) { c.set('sq_meet'); await c.say('dotori', '…나보다 레벨 높아 보여. 찍.'); }
  };

  /* ───────── 벤치에 앉으면 ───────── */
  G.story.benchThought = async (c) => {
    const s = c.s, reg = (G.field.map && G.field.map.region) || 'green';
    const T = {
      green: ['바람이 풀을 한 방향으로 눕혔다가 다시 일으킨다. 이 마을에서 열여섯 해를 살았는데, 이렇게 가만히 본 건 처음이다.', '저 멀리 오두막 굴뚝에서 연기가 오른다. 할머니는 지금 된장을 휘젓고 계실 것이다.'],
      red: ['대장간 망치 소리가 일정하다. 탕, 탕, 탕. 세 번에 한 번은 탑이 가져간다.', '재가 소매에 내려앉는다. 털어 내도 또 내려앉는다. 이 마을 사람들은 털지 않는다.'],
      blue: ['파도가 들어왔다가 나간다. 들어올 때보다 나갈 때 소리가 크다.', '멀리 등대가 보인다. ' + (s.quests.q_light === 'done' ? '이제 밤마다 불이 켜진다.' : '불이 꺼져 있다.')],
      yellow: ['금화 세는 소리가 사방에서 들린다. 가만히 앉아 있는 사람은 나밖에 없다.', '모래바람이 잦아들자 광장 끝의 아이들이 보인다. 다들 조금씩 말랐다.'],
      purple: ['해가 지고 있다. 16년째. 지는 해를 이렇게 오래 볼 수 있다는 게 이상하게 슬프다.', '숲 어딘가에서 누가 시를 읊는다. 운이 안 맞는다.'],
      rainbow: ['광장에 걸린 깃발 일곱 장이 서로 다른 방향으로 펄럭인다.', '천년제 연습 중인 악단이 같은 마디를 열두 번째 틀렸다. 아무도 화내지 않는다.'],
      white: ['눈이 소리를 다 먹어 버렸다. 내 숨소리만 들린다.', '대성당 종이 울린다. 누군가 또 나아졌거나, 누군가 또 떠났다는 뜻이다.'],
      gray: ['색이 없는 거리에 앉아 있으니 내 초록 옷이 너무 시끄럽게 느껴진다.', '어디선가 톱니가 헛도는 소리가 난다. 400년째 멈추지 못한 기계가 있는 모양이다.'],
      black: ['별이 아주 많다. 해가 뜨지 않는 도시라서 별이 쉬지 않는다.', '등불 하나가 꺼졌다가 다시 켜졌다. 누군가 기름을 채우고 갔다.'],
      colorful: ['하늘에서 불꽃이 터진다. 누가 쏘는지 아무도 모른다. 다들 그냥 좋아한다.', '어디선가 또 폭발음이 났다. 박수 소리가 따라왔다.'],
      space: ['창밖으로 대륙이 보인다. 초승달 모양이다. 저기 어딘가에 할머니가 있다.'],
      planet: ['황금빛 모래가 발밑에서 사각거린다. 여기서 몇 명의 챔피언이 싸우다 쓰러졌을까.'],
    }[reg] || ['잠깐 앉아 숨을 골랐다.'];
    await c.say(null, U.pick(T));
    if (s.follower === 'dotori' && Math.random() < 0.35) await c.say('dotori', U.pick(['…좋다. 이렇게 앉아 있는 거.', '다리 아파? 나는 아파. 너보다 다리가 짧으니까 두 배로 걸었어.', '할머니도 이런 데 앉는 거 좋아했어. 앉자마자 졸았지만.']));
  };

  /* ───────── 동행과의 대화 ─────────
     G.story.talks: { id, when(s), map?, run(c) } — 아직 안 나눈 이야기 가운데 지금 맞는 것 하나. 없으면 그 지역의 짧은 말. */
  const REGION_SMALL = {
    green: ['그린 마을 공기는 풀 냄새가 나. 다른 데 가면 이 냄새가 그리워질까?', '할머니가 된장 항아리 뚜껑 닫았는지 모르겠다. 찍.'],
    red: ['여기 사람들은 화가 나면 망치를 더 세게 쳐. 그래서 칼이 좋대.', '재가 자꾸 코에 들어가. 에취.'],
    blue: ['바다는 끝이 안 보여. 끝이 안 보이는 건 무서운데, 이상하게 좋아.', '도서관 책 냄새, 나 좋아해. 오래된 종이 냄새.'],
    yellow: ['여기선 다들 뭔가를 세고 있어. 금화든, 경험이든, 남은 날이든.', '피카네 애들, 밥은 먹었을까.'],
    purple: ['여기 해는 지기만 해. 뜨지를 않아. 누가 시간을 붙잡아 둔 것 같아.', '이 숲 냄새… 자꾸 뭔가 생각날 것 같아.'],
    rainbow: ['여기 사람들은 다 머리색이 달라. 그래서 아무도 서로 안 쳐다봐. 좋다.', '구름 위를 걷는 거, 아직도 무서워.'],
    white: ['추워. 너 목도리 있어? …나 털 있으니까 괜찮아. 거짓말이야, 추워.', '여기 사람들은 기도를 많이 해. 뭘 그렇게 비는 걸까.'],
    gray: ['여긴 색이 없어서 네 흰빛이 더 잘 보여. 좀… 눈에 띄어.', '기계들이 다 우리를 보는 것 같아.'],
    black: ['해가 안 뜨니까 몇 시인지 모르겠어. 배꼽시계는 점심이래.', '여기선 다들 목소리가 작아. 밤이라서 그런가.'],
    colorful: ['여기 사람들은 등급을 안 물어봐. 처음 봤어, 그런 동네.', '또 터졌어! …나도 이제 안 놀라.'],
    space: ['창밖이 까매. 까만데 반짝여.', '숨 쉬는 거 신경 쓰여. 원래 이렇게 신경 쓰면서 쉬는 거였나.'],
    planet: ['발밑이 금이야. 골디 아저씨가 보면 기절하겠다.', '…세린이 여기 어딘가에 있어.'],
  };
  G.story.companion = async (c) => {
    const s = c.s;
    if (s.follower !== 'dotori') { await c.say(s.follower || null, '……'); return; }
    const mapId = G.field.id;
    const open = G.story.talks.filter((t) => !s.flags['talk_' + t.id] && (!t.map || t.map === mapId || (Array.isArray(t.map) && t.map.includes(mapId))) && (!t.when || t.when(s)));
    open.sort((a, b) => (b.map ? 1 : 0) - (a.map ? 1 : 0) || (b.pri || 0) - (a.pri || 0));
    const t = open[0];
    if (t) { s.flags['talk_' + t.id] = 1; await t.run(c); return; }
    const reg = (G.field.map && G.field.map.region) || 'green';
    const L = REGION_SMALL[reg] || REGION_SMALL.green;
    await c.say('dotori', U.pick(L));
  };

  /* ───────── 쉬는 밤의 대화 ───────── */
  G.story.night = async (c) => {
    const s = c.s;
    const n = G.story.nights.find((x) => !s.flags['night_' + x.id] && (!x.when || x.when(s)));
    if (!n) return;
    s.flags['night_' + n.id] = 1;
    const prev = G.audio.current && G.audio.current();
    c.music(n.music || 'calm');
    await c.narr(n.intro || '밤이 깊었다. 창밖으로 별이 보인다.');
    await n.run(c);
    if (prev) c.music(prev); else G.main.resumeMusic();
  };

  /* ───────── 대륙 곳곳의 들짐승 ───────── */
  const CRIT = {
    green: ['bird', 'bird', 'cat'], green_field: ['bird', 'bird', 'squirrel'], green_forest: ['squirrel', 'bird'],
    red: ['cat', 'cat'], red_path: ['bird'], blue: ['cat', 'bird', 'bird'], coast: ['bird', 'bird'], beach: ['bird', 'bird'],
    yellow: ['cat', 'cat', 'bird'], purple: ['cat', 'bird'], purple_forest: ['squirrel', 'bird'], rainbow: ['bird', 'bird', 'cat'],
    white: ['bird'], gray: ['cat', 'bird'], black: ['cat', 'cat', 'cat'], colorful: ['cat', 'bird', 'bird'], cape: ['bird', 'bird'],
  };
  for (const id in CRIT) if (G.maps[id]) W.critters(id, CRIT[id].map((k) => (k === 'cat' && (id === 'black') ? { k, tint: '#2a2438' } : k === 'bird' && id === 'gray' ? { k, tint: '#9a9aa4' } : k)));

  /* ───────── 인물 소개에 남는 결정의 흔적 ─────────
     사람들 탭의 소개는 함께한 일에 따라 한 줄씩 열린다. 같은 사람이라도 어떤 선택을 했느냐에 따라 다른 줄이 열린다. */
  const d = (k, v) => (s) => s.flags['d_' + k] === v;
  const fl = (k) => (s) => !!s.flags[k];
  const BIO = {
    dotori: [['세린이 떼어 둔 마음 한 조각. 아기를 기억하는 부분만. 그래서 16년 동안 레벨 9였고, 그래서 날지 못했다.', (s) => !!(s.abyss && s.abyss.a_toria)], ['마음을 세린에게 돌려주고, 처음이자 마지막으로 제대로 날았다.', (s) => s.flags.toria_fate === 'return'], ['16년 동안 키운 마음을 제 것으로 삼았다. 레벨 11.', (s) => s.flags.toria_fate === 'keep' || s.flags.toria_fate === 'give'], ['레벨 10이 된 날 3초 동안 날았다. 그 3초를 평생 자랑할 생각이다.', fl('dotori_lv10')], ['네가 「무섭다」고 말한 밤을 기억한다. 처음으로 네 옆이 아니라 네 앞에 서고 싶었다.', fl('hero_afraid')]],
    gran: [['983년, 카이론에게 져 주었다. 아이를 숨겨 키우고, 계산이 틀리면 열여섯에 아스트라로 데려가기로 약속했다.', (s) => !!(s.abyss && s.abyss.a_gran)], ['벽에 5,844개의 빗금을 그었다. 마지막 칸의 빨간 동그라미는 끝내 지우지 못했다.', (s) => !!s.flags.gran_pact_talked], ['세 가지 물음 가운데 둘에만 대답할 수 있었다. 나머지 하나는 멀리 다녀온 손주에게 먼저 꺼냈다.', fl('gran_night3')], ['카이론이 {n}의 아버지라는 것을 16년 동안 혼자 알았다. 로켓 격납고에서 처음으로 그 말을 했다.', fl('gran_confessed')], ['「미워하지 않게 될까 봐 더 무서웠다.」 할머니가 네 잎을 딴 이유.', fl('gran_confessed')]],
    dolsoe: [['보고서에 흰빛을 사실대로 적었다. 끝에 한 줄을 덧붙였다. 「그 아이가 마을을 구했다.」', d('report', 'truth')], ['「번개」라고 적었다가 광산 문지기가 되었다. 기사가 된 뒤 처음 해 본 기사다운 짓이라고 한다.', d('report', 'lie')], ['「원인 불명」. 거짓말은 아니었다. 그는 정말로 흰빛이 뭔지 몰랐다.', d('report', 'unknown')], ['정직한 보고의 상으로 천년성 정문 경비가 되었고, 그 문을 제 손으로 열었다.', d('castle', 'gate')]],
    kongsun: [['남편이 쫓겨난 날, 도시락에 쪽지를 두 장 넣었다. 「밥은 먹고 다니소.」 그리고 「자랑스럽소.」', fl('kongsun_letter')]],
    chul: [['아버지가 징수 기사인 게 부끄러웠다. 어느 날부터 자랑이 되었다.', fl('chul_dad')]],
    slowpoke: [['40년 동안 미끼를 달지 않았다. 아내 세나와의 약속이 끝날까 봐.', (s) => s.quests.q_koi != null], ['황금 잉어를 놓아주던 날, 연못에 번진 물결이 다 사라질 때까지 보았다.', (s) => s.quests.q_koi === 'done' && !!s.inv.bait_old]],
    rud: [['견습 휘장을 흰빛에게 맡겼다. 뒷면에 새긴 「루카, 루미」와 함께.', d('rud', 'badge')], ['미납 장부를 한 집씩 다시 셌다. 12조와 13조를 빼니 빚이 삼분의 일로 줄었다.', d('ledger', 'rud')], ['누나를 고발한 흰빛을 아직 셀 수 없다. 셀 수 없는 건 미뤄 둔다.', d('festival', 'warn')]],
    lea: [['「계산상으로는 아무도 안 다쳐.」 카이론을 미워하면서 카이론처럼 말했다. 그걸 가장 먼저 알아챈 것은 그녀 자신이었다.', (s) => !!s.flags.d_festival], ['흰빛이 폭약 없이 중계탑에 금을 내던 밤, 16년 만에 계산 없이 웃었다.', d('festival', 'third')], ['천년제 밤의 바람을 계산하지 못했다. 롤로의 붕대를 볼 때마다 그 밤을 다시 센다.', d('festival', 'bomb')], ['성기사단에 붙잡혔다가 에델의 셋째 조항으로 풀려났다. 원망은 루드 식으로 셌다. 0.', fl('edel_freed_lea')]],
    hwaro: [['레드 장부가 탄 날, 대장간 불이 유난히 셌다. 누가 태웠는지는 모르는 척한다.', d('ledger', 'burn')]],
    galaxy: [['관측표 여백에 「우연이어야 한다」를 세 번 덧그렸다. 바라는 것을 적은 것이다.', (s) => !!(s.truth && s.truth.t_chart)]],
    haemi: [['여섯 살 때 서고에서 책등 없는 책을 읽다 덮었다. 그 책을 끝까지 읽어 준 사람에게 처음으로 안 더듬고 고맙다고 했다.', fl('haemi_told')]],
    bitna: [['아버지의 항해일지를 흰빛에게 건넸다. 「아빠가 못 간 곳까지 가 줘.」', (s) => s.quests.q_light === 'done']],
    kkachi: [['흰빛이 경비대에 자신을 넘기지 않았다. 빚으로 적어 두었다. 황금궁 부엌 뒷길로 갚았다.', d('kkachi', 'spare')], ['경비대에 넘겨졌다. 달아나지 않았다. 「애들한테 손대지 마. 나 혼자 했어.」 지금은 금화왕의 장부를 맡고 있다.', d('kkachi', 'report')]],
    goldie: [['아이들에게서 산 경험의 칠 할을 천년성에 납품했다. 옐로의 탑이 늘 할당량을 채운 이유.', (s) => !!s.flags.d_goldie], ['흰빛이 쓴 조건으로 계약했다. 아이 매입가 세 배, 스무 살에 되살 권리. 처음으로 손해 보는 장사.', d('goldie', 'contract')], ['장부가 광장에 뿌려진 다음 날 거래소 문을 닫았다. 「정의는 배를 채워 주지 않아.」 그래도 다시 열지는 않았다.', d('goldie', 'expose')]],
    vera: [['16년 동안 찻잔 받침 밑에 세린 노트의 마지막 장을 깔아 두었다.', fl('vera_page')], ['그 마지막 장을 흰빛과 함께 태웠다. 16년 만에 무언가를 내려놓았다.', d('serin_page', 'burn')]],
    lumie: [['설원에서 온 아이 하얀을 살리려 머리칼을 전부 내주었다. 기뻤다고 말했다. 거짓말은 아니었다.', d('patient', 'lumie')], ['세린이 얼음 틈에 심어 둔 약초가 아이를 살리는 것을 보았다. 16년 동안 그 틈을 들여다본 적이 없었다.', d('patient', 'herb')]],
    edel: [['투구를 벗은 날 셋째 조항을 처음 썼다. 그리고 붙잡힌 새벽단 단장의 문도 열었다.', fl('edel_freed_lea')]],
    bolt: [['990년 가을, 탑이 등대가 된다는 계산을 끝냈다. 편지를 썼다. 부치지 않았다.', (s) => !!(s.truth && s.truth.t_design)], ['9년 동안 틀지 않은 아내의 녹음을 폐공장에서 들었다. 그날 밤부터 잠을 잔다.', d('bolt', 'talk')]],
    noel: [['볼트의 서랍 열쇠를 「볼트가 울 수 있게 되면」이라는 명령보다 먼저 건넸다. 자신의 판단이었다.', fl('noel_key')]],
    midnight: [['고양이가 아니다. 아우룸의 어깨에서 떨어진 첫 번째 어둠. 천 년 동안 한 달에 등불 한 개씩만 먹었다.', (s) => !!(s.abyss && s.abyss.a_midnight)], ['「배고파?」 천 년 만에 처음 들은 물음이었다.', (s) => s.flags.d_midnight_secret === 'keep' && (s.bond || {}).midnight >= 3], ['남은 배고픔을 삼키고 블랙 마을 하늘의 검은 별이 되었다.', (s) => s.flags.ending_type === 'night'], ['천 년 전 아우룸의 어깨 위에서 빛이 쪼개지는 밤을 보았다. 고양이는 기억력이 나쁘다고 우긴다.', (s) => !!s.flags.m_black_midnight], ['황금 고등어 대신 흰빛의 비밀 하나를 받았다. 가게 밖으로는 나가지 않는다.', d('midnight', 'secret')]],
    nocturne: [['「해치지 않고 멈추겠다」는 약속을 받고 길을 비켰다. 그리고 약속을 지키는지 보러 아스트라에 갔다.', d('nocturne', 'promise')], ['981년 봄, 그린 마을 참나무 아래 혼례의 증인이었다. 16년 동안 그 사실에 대답하지 않았다.', fl('kairon_father')]],
    stella: [['승무원 열두 명을 재우고, 관측을 위해 캡슐의 동력을 끊었다. 기록에는 「전원 귀환」이라고 적었다.', (s) => !!(s.abyss && s.abyss.a_crew)], ['400년 만에 기록을 사실대로 고쳐 썼다. 「관리 인공지능의 선택.」', d('cryo', 'truth')], ['승무원 열두 명의 이름을 소리 내어 불렀다. 하늘, 단비, 새벽…', d('cryo', 'names')], ['400년 동안 별에 이름을 붙였다. 「돌아올 거야」「금방」「금방은 단위가 아니야」.', fl('m_space_truth')], ['단말기에 옮겨져 토리아 목도리에 매달린 채 아스트라까지 갔다. 기록은 안 한다고 했다. 전부 기록했다.', d('stella', 'carry')], ['별의 심장을 건네고 400년 만에 쉬었다. 마지막 별에 {n}의 이름을 붙였다.', d('stella', 'off')]],
    kairon: [['983년부터 해마다 장부 마지막 줄에 서명했다. 「허용 범위 내」. 3,118명.', (s) => !!(s.abyss && s.abyss.a_ledger)], ['집광포의 과녁을 봉인의 제단 한가운데로 적었다. 과녁 크기 1.6미터. 세린의 키.', (s) => !!(s.abyss && s.abyss.a_plan)], ['{n}의 아버지. 983년부터 매일 밤 하늘 정거장에 아이의 나이를 적어 보냈다.', fl('kairon_father')], ['「아버지」라는 두 글자를 들었다. 16년 치 계산보다 무거웠다.', fl('called_father')], ['증거 앞에서 계산 노트를 내려놓았다. 「내가 16년 동안 틀렸다.」', fl('kairon_persuaded')], ['흰빛이 흩다 남긴 조각을 품고 수정 속에서 잠들었다. 이번엔 기한이 있는 봉인이다.', (s) => s.flags.ending_type === 'atone']],
    serin: [['983년, 흑점을 삼키기 직전 마음 한 조각을 떼어 새끼 하늘다람쥐에게 맡겼다.', (s) => !!(s.abyss && s.abyss.a_toria)], ['기억이 반쯤 빈 채로 깨어나, 아이를 처음부터 다시 알아 가기로 했다.', (s) => s.flags.toria_fate === 'keep'], ['지나는 물마다 편지를 던졌다. 물은 결국 어디로든 흐르니까.', (s) => Object.values(LETTER_AT).some((b) => s.books[b])], ['얼음 신전 틈에 약초를 심어 두고 떠났다. 희생 말고 다른 것도 남겼다.', d('patient', 'herb')], ['수정 속에 남은 마지막 조각. 대륙이 나누는 법을 배울 때까지 웃는 얼굴로 기다린다.', (s) => s.flags.ending_type === 'glow']],
  };
  for (const id in BIO) { const ch = G.chars[id]; if (ch) ch.bio = (ch.bio || []).concat(BIO[id]); }
})();
