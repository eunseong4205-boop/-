/* 말: 같은 사람에게 다시 말을 걸면 같은 말만 되풀이하던 것을 고친다
   · 마을 사람(집집마다 · 길을 걷는 사람) — 그 장의 첫 대화는 이야기 그대로. 두 번째부터는 지금의 나를 보고 말한다:
     시간(낮 · 해 질 녘 · 밤) · 다친 몸 · 든 무기와 그 빛깔 · 주머니 · 레벨 · 데리고 다니는 동료 · 들판을 얼마나 다녔는지 · 읽은 글
     · 기운 마음(새벽 · 질서 · 밤) · 들고 있는 편지 · 쓰러진 횟수 · 이야기의 때(초반 · 중반 · 끝 무렵) · 그 지역의 살림 · 몇 번째 말 거는지
     · 말투는 아이 · 어른 · 노인마다 다르다. 방금 한 말은 한동안 다시 하지 않는다. 세 번에 한 번은 처음 이야기를 다시 들려준다.
   · 길을 걷는 사람의 혼잣말(말풍선) — 지역 · 시간마다 늘었다.
   · 동료의 혼잣말 — 토리아 · 야나 · 비올라 · 세피아 · 리라 · 카시안 · 레아: 지역 · 밤 · 다친 몸 · 든 무기 · 날씨 장막 앞에서 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TS = G.tiles.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];

  /* ───────── 지금의 나 ───────── */
  const nightK = () => (ST.nightFactor ? ST.nightFactor() : 0);
  const phase = () => { const k = nightK(); return k > 0.6 ? 'night' : k > 0.2 ? 'dusk' : 'day'; };
  const regionHere = () => { const Wd = W(), m = Wd.map, p = Wd.player; if (!m || !p) return null; if (m.overworld) return OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)); return m.palName || null; };
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  const chi = () => ORD.indexOf(S().ch || 'c1');
  const ageOf = (look) => (look && look.age === 'child' ? 'child' : look && look.age === 'old' ? 'old' : 'adult');
  function gearGrade(s) { const I2 = D.ITEMS, w = s.weapon || 'sword'; const id = w === 'bow' ? s.equip.bow : w === 'magic' ? s.equip.focus : s.equip.sword; const it = id && I2[id]; return it ? (it.grade || 1) : 1; }
  function routeTop(s) { const r = s.route || {}; const arr = [['dawn', r.dawn || 0], ['order', r.order || 0], ['night', r.night || 0]].sort((a, b) => b[1] - a[1]); return arr[0][1] >= 3 && arr[0][1] > arr[1][1] ? arr[0][0] : null; }

  /* ───────── 말 바구니: 상황 → 나이 → 말 ───────── */
  const CTX = {
    night: {
      child: ['엄마가 해 지면 들어오랬는데… 쉿, 비밀이야.', '밤에는 별이 더 많아. 세어 봤는데 백까지밖에 못 셌어.', '어두우면 그림자가 커져. 내 그림자가 어른 같아!', '졸려… 근데 아직 안 졸려. 진짜야.'],
      adult: ['이 시간까지 돌아다녀? 밤엔 몬스터가 사나워. 조심해.', '밤엔 등불 하나가 친구 하나야.', '잠이 안 와서 나왔어. 너도 그런 밤이구나.', '이맘때 하늘 봐. 아스트라가 제일 밝을 때야. …예쁜데, 이상하게 서늘해.'],
      old: ['늙으면 밤이 길어져. 별 세다 보면 아침이 오지.', '밤바람이 차구먼. 목도리라도 두르고 다니게.', '이 시간에 젊은이가 무슨 일인가. 허허, 묻지 않으마.', '밤엔 옛날 생각이 많이 나. 983년 겨울도 이렇게 맑았지.'],
    },
    dusk: {
      child: ['노을 봐! 하늘이 딸기 맛이야.', '저녁밥 냄새 난다. 우리 집 거면 좋겠다.', '해 지기 전에 한 판 더! …뭘 하냐고? 그냥 한 판.'],
      adult: ['해가 지네. 오늘 하루도 무사히 넘겼다.', '저녁 짓는 연기가 오르면 마을이 제일 예뻐.', '노을이 진하면 내일 맑대. 우리 할머니 말이야.'],
      old: ['해 질 녘엔 그림자가 길어져. 사람 마음도 그렇다네.', '하루가 또 가는구먼. 빨리도 가.', '저 노을 좀 보게. 천 년째 똑같은 빛깔이라지.'],
    },
    day: {
      child: ['술래잡기 할래? …칼은 내려놓고!', '오늘 벌레 세 마리 잡았어. 다 놓아줬지만.', '너는 레벨 몇이야? 나는 2야. 곧 3 돼!'],
      adult: ['날이 좋네. 빨래 널기 딱 좋은 날이야.', '바쁘지? 얼굴에 바쁘다고 써 있어.', '요즘 다들 한숨이야. 그래도 해는 뜨지.'],
      old: ['볕이 좋구먼. 늙은 뼈가 좀 펴지는 것 같아.', '젊을 땐 이런 날 가만히 못 있었지. 자네처럼.', '날이 좋으면 몸도 좋고, 몸이 좋으면 마음도 좋다네.'],
    },
    lowhp: {
      child: ['피 나! 괜찮아? 우리 엄마가 약초 잘 바르는데…', '얼굴이 하얘. 무서운 데 갔다 왔어?'],
      adult: ['너 다쳤구나. 무리하지 마. 쉬었다 가도 아무도 뭐라 안 해.', '안색이 안 좋아. 물약 있어? 없으면 가게부터 들러.', '그 몸으로 어딜 또 가려고. 앉았다 가.'],
      old: ['아이고, 그 꼴로 다니면 쓰나. 좀 쉬었다 가게.', '상처는 급하게 다루면 덧난다네. 숨부터 고르게.'],
    },
    bigweapon: {
      child: ['그거 진짜 빛나! 한 번만 만져 봐도 돼? …안 되지?', '우와, 그거 전설 무기야? 이름 있어?'],
      adult: ['손에 든 거, 예사 물건이 아니네. 빛이 새어 나와.', '그런 무기는 주인을 고른다던데. 너를 골랐나 보네.'],
      old: ['허, 그 무기… 옛날 사천왕 겨루기 때나 보던 빛깔이구먼.', '좋은 연장은 주인보다 오래 산다네. 잘 아껴 주게.'],
    },
    bow: {
      child: ['활이다! 나 사과 맞히기 진짜 잘해. 사과가 가만히 있으면.'],
      adult: ['활 쓰는 사람은 눈이 좋더라. 바람도 읽는다면서?', '화살은 아껴. 줍는 것도 실력이야.'],
      old: ['활 든 사람은 숨을 길게 쉬지. 자네 숨이 그렇구먼.'],
    },
    magic: {
      child: ['마법 보여 줘! 불 말고, 반짝이는 걸로!', '지팡이 끝이 반짝여. 그거 뜨거워?'],
      adult: ['마법 쓰는구나. 라벤더 학원 출신이야?', '주문 외우는 사람은 혼잣말이 많대. 너도 그래?'],
      old: ['빛을 다루는 손은 조심해야 한다네. 빛은 늘 어디론가 가고 싶어 하거든.'],
    },
    rich: {
      child: ['주머니에서 짤랑짤랑 소리 나! 부자야?'],
      adult: ['요즘 잘 버나 봐. 주머니가 무거워 보여. 소매치기 조심해.', '돈 있을 때 좋은 물약 사 둬. 돈은 남아도 목숨은 하나야.'],
      old: ['돈은 쓸 데 쓰라고 있는 거라네. 쌓아 두면 그냥 쇠붙이지.'],
    },
    highlv: {
      child: ['너 엄청 세지? 다들 수군거려. 빛 나는 사람 봤냐고.'],
      adult: ['네 이름 이 동네에서도 들었어. 탑 세운 사람들이 싫어한다더라. 조심해.', '레벨이 그쯤 되면 세금도 많이 떼지? …아, 이제 안 내나?'],
      old: ['그 나이에 그만한 빛이라. 무겁겠구먼. 빛은 무거운 거라네.'],
    },
    toria: {
      child: ['그 다람쥐 귀여워! 이름이 뭐야? 토리아? 날 수 있어?', '다람쥐가 나 쳐다봐! 도토리 줄까?'],
      adult: ['네 다람쥐 친구, 아까부터 내 빵만 봐. 하나 줄까?', '하늘다람쥐네. 날지는 못하고? …그래도 잘 따라다니네.'],
      old: ['그 다람쥐, 눈빛이 보통이 아니구먼. 오래 산 눈이야.'],
    },
    explorer: {
      child: ['길 밖에 가 봤어? 엄마가 거긴 가지 말랬는데. 뭐 있어?'],
      adult: ['들판을 많이 다녔나 봐. 신발 밑창이 다 닳았네.', '길에서 벗어나 본 사람만 아는 게 있지. 너도 그런 얼굴이야.'],
      old: ['떠도는 발이구먼. 내 젊을 때 같아. 무덤에 「여기 한 사람이 걸었다」고 새겨 달라 했지.'],
    },
    reader: {
      child: ['책 많이 읽었어? 나 글자 아직 다 몰라. 「렙」은 알아!'],
      adult: ['너한테 책 냄새 나. 대도서관 다녀왔지?', '많이 아는 사람은 말이 적더라. 너는 어때?'],
      old: ['글을 많이 읽은 눈이구먼. 그럼 알겠지. 기록은 이긴 사람이 쓴다는 거.'],
    },
    dawn: {
      child: ['주황 목도리 멋있어! 나도 하나 갖고 싶어.'],
      adult: ['새벽단 얘기 들었어? 탑을 부순대. …나는 아무 말도 안 했다.', '요즘 주황 목도리 맨 사람들이 자주 보여. 너도 그쪽이야?'],
      old: ['부수는 건 금방이지. 다시 세우는 게 오래 걸려. 그걸 아는 사람이 부숴야 해.'],
    },
    order: {
      child: ['기사님들 갑옷 반짝반짝해. 나도 기사 될래. 세금은 안 걷을 거야.'],
      adult: ['기사단 사람들 요즘 표정이 좀 풀렸더라. 네 덕이라던데?', '규칙이 있어야 사람이 살지. 근데 규칙이 사람을 잡아먹으면 안 돼.'],
      old: ['고치는 게 부수는 것보다 어렵다네. 자네는 어려운 쪽을 골랐구먼.'],
    },
    night_r: {
      child: ['밤의 나라엔 고양이가 많대! 진짜야?'],
      adult: ['밤의 사람들이랑 어울린다며? 말 조심해. 그쪽은 말이 곧 값이래.', '숨겨야 사는 것도 있지. 나도 알아.'],
      old: ['품는다는 건 무겁다는 거라네. 비밀은 다 무게가 있지.'],
    },
    letter: {
      child: ['편지다! 누구한테 가? 사랑 편지야? 히히.'],
      adult: ['편지 심부름 중이야? 요즘 그런 사람 드물어. 착하네.', '편지는 빨리 가야 해. 마음이 식기 전에.'],
      old: ['편지 들고 다니는 젊은이라. 그 편지 기다리는 사람은 지금 창밖만 보고 있을 게야.'],
    },
    repeat: {
      child: ['또 왔어! 나랑 놀고 싶구나? 그치?', '너 나 좋아하지? 자꾸 오잖아.'],
      adult: ['또 보네. 이쯤 되면 이웃이야.', '할 말은 다 했는데… 그래, 그냥 서 있다 가.', '자꾸 오는 거 보니 심심하구나. 나도 그래.'],
      old: ['또 왔구먼. 늙은이 말벗 해 주는 겐가. 고맙네.', '허허, 같은 얘기를 세 번 하면 그게 다 내 인생이라네.'],
    },
    fallen: {
      child: ['넘어졌었어? 나도 맨날 넘어져. 일어나면 돼!'],
      adult: ['너 어디서 쓰러졌다 왔지? 눈빛이 한 번 꺼졌다 켜진 사람 같아.'],
      old: ['넘어져 본 사람이 일어설 줄도 알지. 자네는 여러 번 일어섰구먼.'],
    },
    early: {
      child: ['우리 동네 탑 꼭대기 보석, 밤에 반짝여. 근데 쳐다보면 발이 시려.'],
      adult: ['요즘 탑 얘기뿐이야. 세금이 또 오른대.', '아이들 머리가 하얘지는 거, 체질 탓이래. …정말 그럴까.'],
      old: ['983년에도 다들 「조금만」이라고 했지. 조금이 쌓이면 산이 돼.'],
    },
    mid: {
      child: ['천년제 가 봤어? 풍선이 엄청 많대!'],
      adult: ['요즘 소식 들었어? 대륙이 시끄러워. 사천왕이 어떻다느니.', '천년제 얘기 많이 하더라. 천 년이라니, 실감이 안 나.'],
      old: ['천 년 됐다고 잔치를 한다지. 천 년 동안 배고팠던 사람들도 있는데.'],
    },
    late: {
      child: ['하늘에 검은 점, 무서워. 근데 네가 있으면 괜찮을 것 같아.'],
      adult: ['하늘이 좀 이상하지 않아? 검은 점이 커졌대.', '무슨 일이 일어나도 우리 마을은 버틸 거야. 늘 그랬어.'],
      old: ['끝이 가까우면 사람들이 착해진다네. 요즘 다들 착해.', '살 만큼 살았다만, 그래도 내일 해 뜨는 건 보고 싶구먼.'],
    },
  };
  const AGAIN = {
    child: ['아까 한 얘기 또 해 줄까? 잘 들어!', '음… 내가 무슨 얘기 했더라? 아, 그거!'],
    adult: ['아까 그 얘기 말이야, 다시 생각해 봤는데—', '내가 무슨 말을 했더라. 아, 그래.'],
    old: ['늙은이는 했던 말을 또 한다네. 들어 주게.', '어디까지 했더라… 그래, 그 얘기.'],
  };
  /* 지역의 살림 (누구 입에서 나와도 어색하지 않게) */
  const REGION = {
    green: ['보리가 잘 익었어. 올해는 빵이 맛있겠어.', '연못 물고기들 요즘 살쪘더라. 엘름 영감님이 몰래 밥 줘.', '뿌리굴 쪽에서 바람 불면 흙냄새가 달아.', '에벨린 할머니 약초 냄새 맡으면 아픈 게 반은 낫는 기분이야.', '그린은 느려. 느린 게 좋아.'],
    red: ['망치 소리 안 들리면 레드 사람은 불안해.', '광산 먼지 마시면 목이 칼칼해. 떡볶이로 씻어 내야지.', '화산이 기침하면 다 같이 기침해. 레드식 인사야.', '볼칸 아저씨 망치는 소리만 들어도 알아. 쾅, 쾅, 쿵.', '쇠는 뜨거울 때 두드리고, 사람은 식었을 때 말 거는 거야.'],
    blue: ['파도가 높은 날은 배 대신 책을 펴.', '갈매기가 낮게 날면 비가 와. 지금은… 높네.', '관장님 다리가 여덟 개라 책장 넘기는 소리가 빗소리 같아.', '등대 불은 한 번도 안 꺼졌어. 루체가 지키거든.', '조개껍질 귀에 대 봐. 바다가 너한테도 말을 걸 거야.'],
    yellow: ['여기선 물도 돈이야. 웃음은 공짜고. 아직은.', '모래바람 불면 눈 감고 별을 생각해. 그게 길잡이 비결이래.', '골디 님 동상에 금칠을 또 했대. 세금으로.', '낙타는 화나면 침을 뱉어. 사람도 비슷해.', '신기루 속엔 탑 없는 도시가 보인대. 다들 그쪽으로 걷고 싶어 해.'],
    purple: ['숲이 늘 해 질 녘이라 시간을 잘 몰라. 배고프면 저녁이야.', '학원생들 밤새 공부하더니 낮에 졸아.', '거울 연못 너무 오래 보지 마. 거울이 너를 외워.', '라벤더 향 맡으면 잠이 와. 그래서 시험 기간엔 금지야.', '숲이 속삭이는 소리, 들려? 시 같지?'],
    rainbow: ['구름 위라 발밑이 푹신해. 처음엔 다들 멀미해.', '바람이 축제 소리를 실어 와. 일 년 내내.', '구름고래 누베가 지나가면 그늘이 시원해.', '풍선 놓치면 하늘로 가. 하늘에도 풍선 가게가 있을까.', '일곱 빛 분수에 손 담그면 손가락마다 색이 달라져.'],
    white: ['손가락 다섯 개 다 있지? 여기선 매일 세어 봐야 해.', '눈꽃 빵 먹었어? 안 먹었으면 지금 먹어.', '성녀님 발자국엔 눈이 안 쌓여. 정말이야, 봤어.', '눈보라 치는 날은 노래를 해. 서로 어디 있는지 알게.', '온천에 몸 담그면 얼어 있던 말들이 풀려 나와.'],
    gray: ['색 있는 걸 찾으면 주머니에 넣어 둬. 여기선 그게 보물이야.', '공장 연기 냄새엔 익숙해졌어. 익숙해지면 안 되는데.', '은빛 왕국 사람들은 노래를 잘했대. 우리는 기침을 잘해.', '시계탑이 612년에 멈췄대. 우리도 거기서 조금 멈춘 것 같아.', '볼트 선생님은 말이 없어. 대신 망치가 대답해.'],
    black: ['여긴 해가 안 떠. 그래서 시간이 대충이야.', '등불 두 개 들고 다녀. 하나 꺼지면 무섭거든.', '미드나잇 님 고양이 봤어? 금색 눈. 쳐다보면 비밀을 말하게 돼.', '밤의 나라 사람들은 속삭여. 크게 말하면 그림자가 깨거든.', '별이 늘 떠 있어서 별자리를 다 외웠어. 지겨울 만큼.'],
    colorful: ['쾅! 소리 나도 놀라지 마. 오늘 네 번째야.', '여기선 실패작이 자랑이야. 많이 실패한 사람이 존경받아.', '하늘까지 가는 배, 이번엔 될 거래. 매번 그래.', '바닷바람에 기름 냄새 섞이면 발명하기 좋은 날이래.', '봄바한테 폭탄 얘기 꺼내지 마. 신나서 터뜨려.'],
    mist: ['안개 속에선 소리가 늦게 와. 방금 네 인사, 아직 오는 중이야.', '안개 백합 봤어? 달 없는 밤에만 핀대.', '늪에선 발밑을 두 번 봐. 한 번은 땅을, 한 번은 땅 아닌 걸.', '뱃사공 종소리 세 번이면 배가 와. 다섯 번은… 치지 마.', '축축한 게 싫으면 여기 못 살아. 나는 좋아. 피부가 촉촉하거든.'],
    amber: ['단풍잎 밟을 때 바삭 소리, 옛날 목소리래. 믿어?', '협곡에선 이름 부르지 마. 협곡이 대답해.', '여긴 일 년 내내 가을이야. 그래서 다들 조금 쓸쓸해.', '메아리 석상한테 인사하면 한 박자 늦게 답해. 예의 바른 거지.', '낙엽 더미에서 자면 꿈에 옛날 사람들이 나와.'],
  };

  /** 지금 상황에 맞는 말 후보 (무게를 곱해 고른다) */
  function candidates(age, reg, k) {
    const s = S(), d = G.st.derive(s), out = [];
    const add = (key, w) => { const L = CTX[key] && (CTX[key][age] || CTX[key].adult); if (L) for (const l of L) out.push([l, w, key]); };
    if (s.hp <= d.hpMax / 3) add('lowhp', 6);
    if (Object.keys(s.inv).some((id) => D.ITEMS[id] && D.ITEMS[id].type === 'letter' && s.inv[id] > 0)) add('letter', 2.5);
    add(phase(), 1.4);
    if (gearGrade(s) >= 4) add('bigweapon', 1.6);
    if (s.weapon === 'bow') add('bow', 1); if (s.weapon === 'magic') add('magic', 1);
    if ((s.gold || 0) > 20000) add('rich', 1);
    if (s.lv >= 30) add('highlv', 1.2);
    if ((s.party || []).includes('toria')) add('toria', 1.3);
    if (s.disc && Object.keys(s.disc).length >= 20) add('explorer', 1.2);
    if (s.lib && Object.keys(s.lib).length >= 15) add('reader', 1);
    const rt = routeTop(s); if (rt) add(rt === 'night' ? 'night_r' : rt, 1.1);
    if ((s.deaths || 0) >= 3) add('fallen', 0.8);
    add(chi() <= 2 ? 'early' : chi() <= 7 ? 'mid' : 'late', 1.2);
    if (k >= 4) add('repeat', 1.5);
    for (const l of (reg && REGION[reg]) || []) out.push([l, 1.3, 'region']);
    return out;
  }
  function pickLine(id, age, reg, k) {
    const s = S(); s.talkLast = s.talkLast || {};
    const last = s.talkLast[id] || [];
    const pool = candidates(age, reg, k).filter((c) => !last.includes(U.hash(c[0]) % 100000));
    if (!pool.length) return null;
    let sum = pool.reduce((a, c) => a + c[1], 0) * Math.random();
    let pick = pool[0];
    for (const c of pool) { sum -= c[1]; if (sum <= 0) { pick = c; break; } }
    last.push(U.hash(pick[0]) % 100000); while (last.length > 6) last.shift();
    s.talkLast[id] = last;
    return pick[0];
  }

  /* ───────── 마을 사람: 다시 말 걸 때 ───────── */
  function rawIsFn(tbl) {
    const cur = chi(); let best = null;
    for (const k of Object.keys(tbl || {})) { const i = ORD.indexOf(k); if (i >= 0 && i <= cur && (best == null || i > ORD.indexOf(best))) best = k; }
    return typeof (best ? tbl[best] : tbl && tbl.default) === 'function';
  }
  function wrapFolk(sp) {
    if (sp._talk2 || !sp.talk) return;
    sp._talk2 = true;
    const orig = sp.talk;
    const age = ageOf(sp.look);
    sp.talk = async (c, n) => {
      const s = S(); s.talkN = s.talkN || {};
      const key = (sp.id || sp.name || 'npc') + ':' + (s.ch || 'c1');
      const k = s.talkN[key] = (s.talkN[key] || 0) + 1;
      // 부탁 표시가 떠 있거나 · 이 장의 첫 대화거나 · 이야기 갈래가 함수(부탁 처리)인 사람은 그대로
      if (k === 1 || (sp.mark && sp.mark(s)) || (sp.lines && rawIsFn(sp.lines))) return orig(c, n);
      const hasMain = !sp.lines || Object.keys(sp.lines).some((ck) => ORD.indexOf(ck) >= 0 && ORD.indexOf(ck) <= chi()) || sp.lines.default != null;
      if (k % 3 === 0 && hasMain) { await c.say(n, U.pick(AGAIN[age])); return orig(c, n); }
      const line = pickLine(sp.id || sp.name || 'npc', age, regionHere(), k);
      if (!line) return orig(c, n);
      for (const l of line.split('||')) await c.say(n, l.trim());
    };
  }
  /* 길을 걷는 사람: 혼잣말 늘리기 */
  const WALK_EXTRA = {
    day: ['오늘 장 보러 가야 하는데…', '날씨 좋다. 일하기 싫다.', '어제 그 소문 들었어?'],
    dusk: ['벌써 저녁이야? 하루가 짧다.', '저녁 뭐 먹지.', '노을 예쁘다…'],
    night: ['하암… 졸려.', '밤길은 무서워. 빨리 가야지.', '별이 많다. 내일도 맑겠네.'],
  };
  function wrapWalker(sp) {
    if (sp._talk2) return; sp._talk2 = true;
    const base = Array.isArray(sp.barks) ? sp.barks.slice() : [];
    const reg = sp.id.replace(/^walk_/, '').replace(/\d+$/, '');
    const pool = () => base.concat(REGION[reg] || [], WALK_EXTRA[phase()] || []);
    sp.barks = () => U.pick(pool());
    const age = ageOf(sp.look);
    sp.talk = async (c, n) => {
      const s = S(); s.talkN = s.talkN || {}; const k = s.talkN[sp.id] = (s.talkN[sp.id] || 0) + 1;
      const line = k === 1 ? U.pick(base.length ? base : pool()) : (pickLine(sp.id, age, reg, k) || U.pick(pool()));
      for (const l of String(line).split('||')) await c.say(n, l.trim());
    };
  }
  // 마을 사람은 넓은 지도를 지을 때 등록된다 → 그 뒤에 감싼다
  OW.hooks.push(() => {
    for (const list of Object.values(ST.people || {})) for (const sp of list) {
      if (!sp || !sp.id) continue;
      if (sp.id.startsWith('tw_')) {
        wrapFolk(sp);
        // 세 집에 한 집 사람은 가까이 지나가면 혼잣말
        if (!sp.barks && U.hash(sp.id) % 3 === 0) { const age = ageOf(sp.look); sp.barks = () => { const reg = regionHere(); const L = (CTX[phase()] && CTX[phase()][age]) || []; return U.pick(L.concat((reg && REGION[reg]) || [])); }; }
      } else if (sp.id.startsWith('walk_')) wrapWalker(sp);
      else if (sp.lines && typeof sp.folk === 'string') wrapFolk(sp);
    }
  });
  // 장(章)마다 이야기를 들려주는 주민(ST.folk)도 같은 방식 — 지도에 오르기 전에 감싼다
  const f0 = ST.folk;
  if (f0) ST.folk = function (mapId, o) { f0.apply(this, arguments); const list = ST.people[mapId] || []; const sp = list[list.length - 1]; if (sp && sp.lines) wrapFolk(sp); };
  for (const list of Object.values(ST.people || {})) for (const sp of list) if (sp && sp.lines && !String(sp.id || '').startsWith('tw_')) wrapFolk(sp);

  /* ───────── 동료의 혼잣말 ───────── */
  const BUD = {
    toria: {
      green: ['찍, 이 길은 할머니랑 약초 캐러 오던 길이야.', '저 나무 위에서 뛰어내리면 날 수 있을까? …안 되겠지.', '레벨 9. 16년째. 그래도 키는 컸어. 아마.', '도토리 냄새! 저쪽이야, 찍!', '그린 바람은 간지러워. 꼬리털이 다 선다.', '보리밭 사이로 뛰면 파도 타는 기분이야.'],
      red: ['뜨거워! 꼬리 탈 것 같아, 찍!', '망치 소리가 심장 소리 같아.', '화산 냄새는 맵다. 코가 매워.', '광부 아저씨들 손 봤어? 솥뚜껑 같아.', '바위가 따뜻해. 여기서 낮잠 자면 좋겠다.'],
      blue: ['바다 냄새! 짭짤해, 찍!', '저 물고기들은 레벨이 몇일까?', '갈매기가 내 도토리 노려. 안 줘!', '대도서관에 다람쥐 책도 있을까?', '파도 소리 들으면 졸려…'],
      yellow: ['모래가 털 사이에 다 들어가, 찍…', '금화 반짝반짝. 하나만 주우면 안 될까?', '발바닥이 뜨거워. 깡충깡충 뛰어야 해.', '신기루다! …아니, 그냥 더운 거야.', '선인장은 왜 가시가 있을까. 껴안아 줄 사람이 없어서?'],
      purple: ['여긴 늘 해 질 녘이야. 졸려…', '나무들이 시처럼 속삭여.', '거울 연못에 비친 나, 날고 있었어! …꿈이었나.', '라벤더 냄새. 할머니 베개 냄새야.', '학원생들은 왜 다 눈 밑이 까매?'],
      rainbow: ['구름이 푹신해! 여기선 떨어져도 안 아플 것 같아. …그래도 안 떨어질래.', '하늘이 가까워. 손 뻗으면 닿을 것 같아, 찍.', '풍선 하나만! 나 날 수 있을지도 몰라!', '바람이 축제 노래를 불러.'],
      white: ['추, 추워! 네 목도리 속에 들어가도 돼?', '눈이 빛을 머금고 있어. 예뻐.', '발자국 봐! 내 거 작고 귀엽다.', '입김이 나와. 나 지금 용 같지? 찍.', '눈꽃 빵 아직 있어? 반만…'],
      gray: ['색이 없어… 무서워, 찍.', '바닥에서 은빛 가루가 거꾸로 떠올라.', '여기 사람들 웃는 법을 잊은 것 같아.', '공장 소리가 배고픈 소리 같아.', '세피아는 색을 보고 싶대. 나도 보여 주고 싶어.'],
      black: ['해가 안 떠. 영원히. 찍…', '등불 하나하나가 누군가의 약속 같아.', '그림자가 날 따라와. 아, 내 그림자구나.', '여긴 별이 낮에도 떠 있어. 낮이 없으니까.'],
      colorful: ['쾅! 깜짝이야, 찍! 또 터졌어!', '저 기계 꼬리 달렸어. 나랑 친구 할래?', '하늘 가는 배래. 나도 태워 줄까?', '기름 냄새 반, 바다 냄새 반.'],
      mist: ['안개가 털에 맺혀. 축축해, 찍…', '네 목소리가 늦게 들려. 이상해.', '늪에서 뭐가 날 쳐다봐. …개구리구나.', '안개 백합, 오늘 밤에 필까?'],
      amber: ['낙엽 밟는 소리, 바삭바삭! 재밌다, 찍!', '협곡에 대고 내 이름 부르면 협곡도 「찍」 할까?', '단풍잎이 내 털 색이랑 똑같아. 숨바꼭질 하면 내가 이겨.', '가을 냄새는 왜 조금 슬플까.'],
      night: ['밤엔 눈이 더 잘 보여. 다람쥐니까. 찍.', '별 세어 볼래? 하나, 둘… 아스트라는 빼고.', '할머니도 지금 별 보고 있을까?', '부엉이 조심. 걔네 나 좋아해. 먹이로.'],
      lowhp: ['너 피 나! 찍! 물약, 물약 먹어!', '숨 쉬어, 숨. 하나, 둘… 찍.', '쉬자. 응? 쉬자.'],
      bow: ['활 쏠 때 내가 앞에 있으면 안 되지? 찍. 알아.', '화살 주워 올까? 나 그거 잘해!'],
      magic: ['마법 냄새 나. 털이 쭈뼛해.', '지팡이 끝에서 불꽃 튀면 내 꼬리 조심!'],
      veil: ['저쪽 날씨 이상해. 아직 우리가 갈 데가 아닌가 봐, 찍.', '바람이 우리를 밀어내. 「아직 아니야」 하는 것 같아.'],
      high: ['너 요즘 렙업할 때 빛이 점점 커져. 찍.', '내 레벨은 9. 네 레벨은… 세다가 잊어버렸어.'],
    },
    yana: { any: ['별이 보이면 길을 잃을 일은 없어.', '모래 밟는 소리로 땅속이 비었는지 알 수 있어.', '내 귀가 쫑긋하면 뭔가 오는 거야. 지금은… 아니네.', '길잡이 값은 나중에 받을게. 별로.', '대상 사람들은 노래하면서 걸어. 걸음이 맞으면 덜 지쳐.'], night: ['국자 별 보여? 저 끝에서 다섯 걸음. 길잡이별이야.', '사막의 밤은 차. 낮엔 굽고 밤엔 얼고.'] },
    viola: { any: ['세린 선배 기록, 이번 달엔 깰 거야.', '그 주문, 손목이 굳어 있어. 힘 빼.', '나 졸린 거 아니야. 생각 중이야.', '대륙의 빛 흐름을 계산해 보면 이상해. 한쪽으로만 기울어.', '책은 들고 다녀야 읽게 돼. 그래서 가방이 무거워.'], night: ['밤엔 공식이 더 잘 떠올라. 아침엔 다 까먹지만.'] },
    sepia: { any: ['색 감지: 초록 73퍼센트. 기분: 좋음.', '이 빨강은 무슨 맛일까. 나는 맛을 모른다. 그래도 궁금하다.', '보행 속도를 맞추는 중. 너는 가끔 멈춘다. 왜?', '볼트는 말이 없다. 나는 말이 많다. 그래서 균형이 맞는다.', '웃는 법을 연습 중이다. 이렇게? …틀렸나.'], night: ['밤에는 색이 줄어든다. 아깝다.'] },
    lyra: { any: ['♪ 길 위의 발자국은 노래보다 오래 남지 ♪', '이 마을 여관 노래는 내가 다 바꿔 놨어. 가사마다 비밀 하나씩.', '노래는 숨기기 좋아. 다들 가락만 듣거든.', '너 걷는 박자, 세 박자야. 왈츠 출 줄 알아?', '노래 하나 지어 줄까? 제목은 「무한으로」.'], night: ['밤엔 노래가 멀리 가. 그래서 조심해서 불러.'] },
    cassian: { any: ['숫자는 거짓말을 안 해. …사람이 숫자를 고를 뿐이지.', '검을 쥘 때 엄지를 세우지 마. 손목이 먼저 꺾인다.', '스승님은 지금도 계산 중이실 거다.', '걸음이 빨라졌군. 숨은 아직 짧다.'], night: ['밤엔 칼을 닦는다. 생각이 정리된다.'] },
    lea: { any: ['새벽은 제일 어두울 때 온대. 그 말 싫어. 너무 맞아서.', '루드는 아직 화났어. 화가 풀리면 와서 울 거야.', '탑 하나 무너뜨리면 마을 하나가 숨을 쉬어.', '목도리 삐뚤어졌어. 이리 와 봐.'], night: ['밤엔 새벽단 신호를 기다려. 불빛 셋이면 괜찮다는 뜻이야.'] },
  };
  const chat0 = ST.chatter;
  ST.chatter = function (cid) {
    const B = BUD[cid];
    if (!B) return chat0 ? chat0(cid) : null;
    const s = S(), d = G.st.derive(s), reg = regionHere(), pool = [];
    const put = (L, w) => { if (L) for (const l of L) pool.push([l, w]); };
    if (cid === 'toria') {
      if (s.hp <= d.hpMax / 3) put(B.lowhp, 5);
      const VS = ST.veilState; if (VS && VS.depth > 0) put(B.veil, 4);
      if (phase() === 'night') put(B.night, 1.5);
      if (s.weapon === 'bow') put(B.bow, 0.6); if (s.weapon === 'magic') put(B.magic, 0.6);
      if (s.lv >= 20) put(B.high, 0.5);
      put((reg && B[reg]) || B.green, 1.4);
    } else {
      put(B.any, 1.2); if (phase() === 'night') put(B.night, 1.5);
      if (s.hp <= d.hpMax / 3) pool.push(['다쳤잖아. 잠깐 멈춰.', 4]);
    }
    if (!pool.length) return chat0 ? chat0(cid) : null;
    let sum = pool.reduce((a, c) => a + c[1], 0) * Math.random();
    for (const c of pool) { sum -= c[1]; if (sum <= 0) return c[0]; }
    return pool[0][0];
  };

  /* 이 장에 할 이야기가 따로 없는 주민의 첫인사 (예전: 「…오늘도 렙업!」 한 마디) */
  const GREET = {
    child: ['안녕! 처음 보는 얼굴이다. 어디서 왔어?', '너 모험가야? 그 칼 진짜야?', '엄마가 모르는 사람이랑 말하지 말랬는데… 너는 괜찮아 보여.'],
    adult: ['처음 보는 얼굴이네. 여행 중이야?', '어서 와. 이 동네는 처음이지? 천천히 둘러봐.', '무슨 일로 왔어? 길 잃었으면 광장 쪽으로 가 봐.', '바깥 사람이구나. 요즘 길은 좀 어때?'],
    old: ['허허, 낯선 얼굴이구먼. 먼 길 왔나 보군.', '젊은이, 이 동네는 처음인가. 천천히 쉬어 가게.', '어서 오게. 늙은이 말벗이 하나 늘었구먼.'],
  };
  function greet(look) {
    const age = ageOf(look), reg = regionHere();
    const g = U.pick(GREET[age]);
    return reg && REGION[reg] && Math.random() < 0.6 ? g + '||' + U.pick(REGION[reg]) : g;
  }
  // 동료 혼잣말: 방금 한 말은 한동안 다시 안 한다
  const chat1 = ST.chatter, recent = [];
  ST.chatter = function (cid) {
    for (let i = 0; i < 4; i++) { const l = chat1(cid); if (!l || !recent.includes(l)) { if (l) { recent.push(l); while (recent.length > 8) recent.shift(); } return l; } }
    return chat1(cid);
  };
  G.talk = { CTX, REGION, BUD, GREET, pickLine, candidates, greet };
})();
