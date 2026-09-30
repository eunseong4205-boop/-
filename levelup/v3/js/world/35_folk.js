/* 넓어진 동네에 사는 사람들: 집마다 한 사람(또는 한 식구)과 그 사람의 이야기.
   - 장(章)이 바뀌면 말이 바뀐다: 대륙에서 일어난 일(탑 · 광산 · 배 · 천년제 · 흰머리 · 영원한 밤 · 로켓)을 사람들이 듣고 말한다.
   - 굳은 갈래(새벽 · 질서 · 밤)에 따라 다르게 말하는 사람도 있다.
   - 편지 다섯 통: 마을과 마을을 잇는 심부름 (보상: 하트 조각 · 돈 · 물건). 받은 사람은 답장을 하거나, 나중에 다른 곳에 나타난다.
   - 씨앗지기 올리브: 빛 씨앗을 모아 가면 화살통 · 폭탄 가방 · 하트 조각을 준다.
   - 길을 걷는 사람들: 골목을 오가며 혼잣말을 한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };

  item('letter_hanna', { type: 'letter', name: '한나의 편지와 보리빵', desc: '「블루, 등대 옆 소피에게」. 빵 봉지가 아직 따뜻하다.', read: '봉투에 밀가루 손자국이 찍혀 있다.' });
  item('letter_sophie', { type: 'letter', name: '소피의 답장', desc: '「그린, 보리 한 줌 한나에게」. 조개껍데기가 하나 들어 있다.', read: '꾹꾹 눌러 쓴 글씨가 비친다: 「엄마, 나 잘 지내.」' });
  item('letter_osborn', { type: 'letter', name: '오스본의 편지', desc: '「화이트, 레지나 수녀에게」. 봉투가 두껍다. 장부 한 장이 접혀 들어 있는 듯하다.', read: '열어 보면 안 될 것 같다.' });
  item('letter_dora', { type: 'letter', name: '도라의 꾸러미', desc: '「그레이, 광부 루크에게」. 털양말 두 켤레와 편지.', read: '양말에서 화산 흙 냄새가 난다.' });
  item('letter_zara', { type: 'letter', name: '자라의 편지', desc: '「퍼플, 라벤더 학원 카심에게」. 고추 한 봉지가 같이 묶여 있다.', read: '봉투에서 매운 냄새가 난다.' });
  item('letter_lumen', { type: 'letter', name: '루멘의 등불 설계도', desc: '「알록달록 곶, 스파크에게」. 불이 꺼지지 않는 등불의 그림.', read: '선이 아주 가늘다. 등불 가게의 솜씨다.' });

  /* ───────── 실내 가구 틀 ───────── */
  function room(kind, w, h, region) {
    const cx = w >> 1;
    const F = {
      home: [['bed2', 2, 3], ['table', cx, 5], ['chair', cx - 1, 6], ['chair', cx + 2, 6], ['shelf', w - 3, 2], ['plant', 1, h - 3], ['window', 4, 1, { wall: true }], ['painting', cx + 2, 1, { wall: true }]],
      bakery: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['stove', w - 3, 2, { text: '돌 화덕. 안쪽에서 빵이 부풀고 있다.' }], ['shelf', w - 6, 2, { v: 'bread', text: '갓 구운 빵이 줄지어 식고 있다.' }], ['barrel', 1, h - 3], ['barrel', 2, h - 3], ['table', cx + 1, 6, { v: 'cloth' }], ['chair', cx, 7]],
      elder: [['fireplace', 2, 2], ['clock', w - 3, 2, { wall: true }], ['bed2', w - 3, 4], ['shelf', cx, 2], ['table', cx - 1, 6], ['chair', cx - 2, 7], ['painting', 6, 1, { wall: true, v: '#6a8ab8' }]],
      workshop: [['gears', 2, 3], ['desk', cx, 3], ['crate', w - 3, 3], ['crate', w - 2, 3], ['barrel', 1, h - 3], ['anvil', w - 4, 6], ['shelf', w - 3, h - 4]],
      herbal: [['cauldron', cx, 4, { v: '#8ae07a' }], ['shelf', 1, 2, { v: 'jars' }], ['shelf', w - 3, 2, { v: 'jars' }], ['plant', 2, h - 3], ['plant', w - 3, h - 3], ['plant', 4, h - 3], ['table', cx + 2, 6]],
      scholar: [['shelf', 1, 2], ['shelf', 4, 2], ['shelf', w - 3, 2], ['desk', cx, 4], ['bookpile', cx + 3, 5], ['bookpile', 2, h - 3], ['telescope', w - 3, h - 4]],
      smith: [['anvil', cx, 4], ['stove', w - 3, 2, { text: '풀무 화덕. 숯이 빨갛게 숨 쉰다.' }], ['barrel', 1, h - 3], ['crate', w - 2, h - 3], ['shelf', 1, 2]],
      fisher: [['barrel', 1, 3], ['barrel', 2, 3], ['crate', w - 3, 3], ['table', cx, 5], ['chair', cx - 1, 6], ['window', 4, 1, { wall: true, v: 'sea' }], ['painting', cx + 2, 1, { wall: true, v: '#3a7ad8' }], ['bed2', w - 3, h - 5]],
      tavern: [['counter', 2, 3, { v: 3, bw: 44, bh: 10 }], ['table', cx + 1, 5, { v: 'cloth' }], ['chair', cx, 6], ['chair', cx + 3, 6], ['barrel', w - 2, 3], ['barrel', w - 2, 4], ['fireplace', w - 5, 2]],
      chapel: [['altar', cx - 1, 2], ['pew', 2, 5], ['pew', w - 5, 5], ['lamp', 1, 2], ['lamp', w - 2, 2]],
      tailor: [['mirror', 2, 3], ['wardrobe', w - 3, 2], ['table', cx, 5, { v: 'cloth' }], ['chair', cx - 1, 6], ['plant', 1, h - 3]],
      music: [['harp', cx, 4], ['bench', 2, 6], ['shelf', w - 3, 2], ['plant', w - 2, h - 3]],
      empty: [['crate', 2, 3], ['shelf', w - 3, 2, { text: '먼지 속에 빈 액자 하나.' }], ['bed2', 2, h - 5, { v: '#8a8a8a' }]],
    }[kind] || [];
    const floor = { red: T.BRICK, yellow: T.SANDSTONE, white: T.WOOD, gray: T.METAL, black: T.CHECKER, rainbow: T.MARBLE, purple: T.WOOD }[region] || T.WOOD;
    const music = { tavern: 'calm', chapel: 'hollow', empty: 'sad', music: 'calm' }[kind] || 'home';
    return { w, h, floor: kind === 'workshop' || kind === 'smith' ? T.STONE : floor, music, rug: kind === 'home' || kind === 'elder' ? [cx - 2, 4, 5, 3] : null, furn: F };
  }

  /* ───────── 사람들 ─────────
     { name, house, kind, folk, look(덧칠), lines{장: '말||말'}, route{갈래: 말}, talk(특별한 일) } */
  const L = (o) => o;
  const FOLK = {
    green: [
      L({ id: 'hanna', name: '한나', house: '빵집 「보리 한 줌」', kind: 'bakery', folk: 'farmerw', look: { hat: null, hc: '#9a5a2a', tc: '#e8d0a0' }, sign: 'shop',
        lines: { c1: '생일이라며? 보리빵 냄새 맡고 왔구나.||할머니한텐 비밀이야. 설탕을 두 숟갈 넣었거든.', c2: '레드 광산이 막혔대. 밀가루 값이 벌써 두 배야.||징수탑은 빵 굽는 불까지 세는 걸까.', c4: '소피 편지 잘 받았어. 조개껍데기를 창틀에 올려 뒀지. 바다 소리가 날 것 같아.', c6: '천년제 소문 들었어. 네 머리칼… 괜찮은 거지?||빵은 늘 똑같이 구워 둘게. 언제 와도 먹을 수 있게.', c9: '밤이 길어졌어. 반죽이 부풀 시간이 늘었지 뭐. 좋은 일도 하나는 있어야지.', c10: '하늘로 간다며. 보리빵 싸 줄게. 하늘에서도 배는 고플 테니까.', c12: '돌아오면 제일 먼저 여기 들러. 갓 구운 거 줄게. 약속.' } }),
      L({ id: 'finn', name: '양치기 핀', house: '핀네 집', kind: 'home', folk: 'kid', look: { hc: '#c8a060', tc: '#6aa84a' },
        lines: { c1: '양이 한 마리 모자라. 뿌리굴 쪽으로 간 것 같은데…||거기 들어가지 말라고 할머니가 그랬지?', c2: '양 찾았어! 뿌리굴 앞에서 떨고 있더라. 무서운 게 사라졌대. 너 덕분이야?', c5: '퍼플은 해가 안 진다며? 양들이 잠을 못 자겠다.', c6: '천년제에 양 대신 풍선을 몰고 갈 거야! 하늘섬은 바람이 세대.', c7: '하얀 머리가 됐네. 눈 나라에도 양이 있어? 털이 하얀 양이면 좋겠다.', c11: '밤하늘에 반짝이는 거, 너야? 양들한테 손 흔들어 줘.' } }),
      L({ id: 'osborn', name: '오스본 영감', house: '오스본 영감 댁', kind: 'elder', folk: 'oldm', look: { tc: '#5a5a7a' },
        lines: { c1: '983년, 첫 탑을 세울 때 나는 스물둘이었다.||빛을 「조금만」 걷는다고 했지. 조금만.', c2: '탑 아래를 지나면 발끝이 시리지? 그게 네 빛이 빠져나가는 소리다.', c4: '장부는 둘이었다. 사람들이 보는 것, 챔피언만 보는 것.||나는 둘 다 봤다. 그래서 여기 숨어 산다.', c6: '방송에서 방패라고 했지. 나는 그 장부를 봤어.||방패는 한 번도 쓰인 적이 없어. 모으기만 했지.', c9: '「허용 손실」… 그 말을 처음 적은 손이 내 손이었을지도 모른다.||용서해 달라고는 안 하마.', c12: '끝나면 돌아와서 말해 다오. 탑이 무너지는 소리가 어땠는지.' } }),
      L({ id: 'bartol', name: '목수 바르톨', house: '바르톨 목공소', kind: 'workshop', folk: 'farmer', look: { hat: null, hc: '#6a4a2a', tc: '#6a8a9a', build: 'broad' },
        lines: { c1: '울타리를 고치는 중이야. 탑이 선 뒤로 멧돼지가 사나워졌어.||숲도 배가 고픈 거지.', c3: '블루 항구에 배를 한 척 짜 줬어. 세 척 중 하나는 내 솜씨야. 어느 배를 탔니?', c6: '천년제 무대 기둥을 내가 깎았다고. 무너졌다며? …내 탓은 아니겠지?', c8: '그레이 사람들이 나무를 사 가. 나무는 색이 안 빠진다나. 뿌리가 깊어서.', c10: '로켓 받침대 나무를 보내 달래서 참나무를 골랐어. 네 할머니 참나무 옆의 것으로.' } }),
      L({ id: 'mira', name: '약초꾼 미라', house: '미라의 약초방', kind: 'herbal', folk: 'scholar', look: { glasses: false, hc: '#3a6a3a', tc: '#6a9a5a', acc: [] },
        lines: { c1: '에벨린 선생님 제자야. 선생님 손바닥 굳은살은 약초꾼 게 아니야.||창을 오래 쥔 손이지. 모르는 척해 줘.', c2: '빛바램병에 듣는 약은 아직 없어. 이슬 한 방울이 시간을 조금 벌어 줄 뿐.', c5: '라벤더 학원에서 약초 책을 보내왔어. 「그릇은 넓어질 뿐」… 약초 얘기가 아닌 것 같아.', c7: '화이트 설화초가 병을 늦춘대. 노아한테 필요한 거지? 꼭 구해.', c12: '선생님이 그러셨어. 「그 애는 돌아온다. 약초 말려 둬라.」||그래서 말려 두는 중이야.' } }),
      L({ id: 'olive', name: '씨앗지기 올리브', house: '씨앗 도서관', kind: 'scholar', folk: 'oldw', look: { tc: '#6aa84a', hc: '#e8e0c0' }, seedKeeper: true,
        lines: { c1: '빛 씨앗을 모으는 늙은이란다. 대륙 곳곳에 떨어진 작은 빛 말이야.||가져오면 쓸 만한 걸로 바꿔 주마.' } }),
      L({ id: 'twins', name: '쌍둥이 릴리', house: '릴리 · 루루네', kind: 'home', folk: 'kidg', look: { hc: '#e8b050', tc: '#ff9ab8' },
        lines: { c1: '숨바꼭질 하자! …벌써 찾았네. 루루는 밭 허수아비 뒤에 있어.', c4: '옐로 모래는 반짝인대. 한 줌만 가져다줄래? 거짓말이야, 무거워.', c6: '하얀 머리가 됐네! 우리 할머니도 하얀 머리야. 똑같아!', c9: '밤이 무서워서 루루랑 손 잡고 자. 너도 누가 손 잡아 줘?', c12: '루루가 그러는데, 하늘에 해가 두 개 떴다가 하나가 됐대. 진짜야?' } }),
    ],
    red: [
      L({ id: 'dora', name: '도라', house: '광부 루크네', kind: 'home', folk: 'farmerw', look: { hat: null, skin: 'tan', hc: '#3a2a1a', tc: '#b86a4a' },
        lines: { c2: '남편은 광부야. 그라우스 기사단이 광산 입구를 막았어. 빛을 짜낸다나.', c3: '광산이 다시 열렸다며? 너였구나. 루크가 다시 곡괭이를 들었어. 고마워.', c6: '루크가 그레이 폐광에 일하러 갔어. 돈은 되지만… 거긴 색이 빠지는 곳이잖아.', c11: '루크가 돌아왔어! 머리칼 끝이 조금 하얘졌지만 웃는 건 그대로야.' } }),
      L({ id: 'gon', name: '곤 할배', house: '곤 할배 방앗간', kind: 'bakery', folk: 'oldm', look: { tc: '#a85a3a' },
        lines: { c2: '마그다 할매 떡볶이 떡은 내가 뽑는다. 쌀이 반, 불이 반.||레드 떡은 불맛이지.', c5: '카이론 방송 들었나? 목소리가 식은 떡처럼 굳어 있더구먼.', c7: '화이트로 떡을 보냈어. 얼면 딱딱해진다고 했더니 거기선 구워 먹는다나.', c9: '밤이 와도 방아는 돈다. 사람은 먹어야 사니까.', c12: '돌아오면 떡 한 판 쪄 주마. 흰 떡으로.' } }),
      L({ id: 'igni', name: '도제 이그니', house: '이그니의 풀무간', kind: 'smith', folk: 'smith', look: { hc: '#c84a2a', build: null },
        lines: { c2: '볼칸 스승님은 983년 이후로 제일 좋은 검은 안 만든대. 누굴 위해서도.', c3: '스승님이 요즘 밤마다 뭘 두드려. 네 검이랑 모양이 비슷했어.', c6: '천년제 망치 노점 봤어? 스승님이 사람들 앞에서 웃는 거 처음 봤어.', c8: '그레이 강철은 색이 없어서 불에 넣어도 빛이 안 나. 이상하지?', c10: '로켓 노즐! 스승님이랑 사흘 밤을 새웠어. 내 망치 자국도 하나 있다.' } }),
      L({ id: 'bel', name: '관측 조수 벨', house: '벨의 다락방', kind: 'scholar', folk: 'student', look: { gender: 'girl', hair: 'bob', hc: '#5a3a2a', tc: '#8a3a2a', glasses: true },
        lines: { c2: '아스텔 박사님은 별을 세. 요즘은 검은 점도 센대. 조금씩 커진다나.', c4: '박사님이 말을 안 해. 계산을 끝낸 사람 얼굴이야.', c5: '관측표 봤어? 흑점은 빛이 제일 많은 곳을 따라온대. 양이 아니라… 쏠림.', c9: '블랙은 별이 제일 잘 보인대. 밤이 안 끝나니까. 부러워.', c11: '정거장에서 보는 별은 어때? 박사님이 부러워서 잠을 못 주무셔.' } }),
      L({ id: 'roen', name: '꼬마 로엔', house: '로엔네', kind: 'home', folk: 'kid', look: { hc: '#8a3a2a', tc: '#5a3a2a', acc: ['scarf'], scarfC: '#ff7a4a' },
        lines: { c2: '루드 형이 새벽단이래! 탑 같은 건 다 부숴 버려야 해.', c3: '형이 그러는데 탑을 부수면 빛이 돌아온대. 나 벌써 망치 있어.' },
        route: { dawn: '새벽단이랑 같이 간다며? 나도 크면 들어갈 거야. 망치는 벌써 있어.', order: '기사단이랑 손잡았다고? 루드 형이 한숨 쉬던데.||…그래도 너는 나쁜 사람 아니지?', night: '밤의 사람들이 네 이름을 속삭인대. 멋있다. 나도 속삭여 볼까.' }, routeFrom: 'c4' }),
      L({ id: 'haru', name: '도예가 하루', house: '흙불 공방', kind: 'workshop', folk: 'merchantw', look: { hc: '#2a1a1a', tc: '#c86a4a' },
        lines: { c2: '화산 흙은 굽고 나면 노을빛이 돼. 퍼플 사람들이 좋아하지.', c7: '화이트 사람들이 내 찻잔을 좋아해. 추운 데선 따뜻한 게 최고니까.', c8: '그레이에 찻잔을 보냈더니 답장이 왔어. 「색이 있는 걸 오랜만에 봤다」고.', c12: '찻잔 하나가 깨졌어. 금으로 이었지. 깨진 자리가 제일 예뻐.' } }),
    ],
    blue: [
      L({ id: 'sophie', name: '필사공 소피', house: '등대 옆 소피네', kind: 'scholar', folk: 'farmerw', look: { hat: null, hc: '#9a5a2a', tc: '#4a6a9a', acc: ['book'] },
        lines: { c3: '빵 냄새… 그린에서 왔구나? 나는 대도서관 필사공이야.||엄마 가게 이름이 「보리 한 줌」이야. 알아?', c5: '금서고 책을 베끼다 손이 떨렸어. 「다섯 빛깔은 쪼갠 것이다.」 누가 쪼갠 걸까.', c7: '엄마가 또 빵을 보냈어. 이번엔 네 몫도 있대. 하나 가져가.', c10: '루체 씨가 로켓 나침반을 만든대. 필사한 별지도를 드렸어. 내 글씨가 하늘에 가!' } }),
      L({ id: 'marco', name: '어부 마르코', house: '마르코네 그물 창고', kind: 'fisher', folk: 'sailor', look: { hc: '#3a2a1a' },
        lines: { c3: '바다가 요즘 조용해. 크라켄 때문이라나. 고기가 다 해저 동굴로 숨었어.', c4: '해저 동굴이 조용해졌대. 네가 한 거지? 오늘 그물은 무거웠어!', c6: '하늘섬에 생선을 팔러 갔었어. 구름고래가 반은 먹어 버렸지 뭐야.', c9: '블랙에 눈먼 등대지기가 있다는 소문이… 루체 아버지 얘기 아니야?', c12: '밤바다에 하늘이 비쳐. 해가 두 개였다가 하나가 되던 날, 바다가 울었어.' } }),
      L({ id: 'ian', name: '사서 견습 이안', house: '이안의 하숙방', kind: 'scholar', folk: 'student', look: { hc: '#2a3a5a', tc: '#3a5a8a' },
        lines: { c3: '금서고 열쇠는 관장님만 갖고 있어. 나는 먼지만 털어.', c5: '창세 신화가 지어낸 거라는 책이 금서고에 있었대. 누가 빌려 갔는지 기록이 없어.', c8: '은빛 왕국 기록 보관소에 가 봤어? 612년의 글씨는 어떤 모양이야?', c11: '정거장에 과학원 여덟이 잠들어 있다고? 400년 된 책을 쓴 사람들이야. 만나고 싶다.' } }),
      L({ id: 'niko', name: '조선공 니코', house: '니코 조선소', kind: 'workshop', folk: 'mech', look: { hat: null, hc: '#3a5a8a' },
        lines: { c3: '세 척을 띄우는 중이야. 새벽단 배, 기사단 배, 그리고… 이름 없는 배.' },
        route: { dawn: '새벽단 배는 빨라. 부서져도 다시 짜면 되니까. 네가 탄 배 소식은 늘 먼저 와.', order: '기사단 배는 무거워. 느리지만 가라앉지는 않지. 네가 탄 배야.', night: '이름 없는 배는 밤에만 떠. 누가 탔는지는 나도 몰라. …너라는 소문은 있어.' }, routeFrom: 'c4' }),
      L({ id: 'thea', name: '간호사 테아', house: '간호사 숙소', kind: 'home', folk: 'nun', look: { hat: null, hc: '#6a4a3a', tc: '#e8f0f8' },
        lines: { c3: '요양원에 그린에서 온 아이가 있어. 노아. 색연필 흰색이 안 닳는 아이.', c5: '노아가 네 얘기를 해. 다람쥐랑 다니는 칼잡이. 그림도 그렸어.', c7: '노아가 화이트 병동으로 옮겼어. 마지막 단계래.||눈이 맑아서 더 마음이 아파.', c12: '노아가 그림을 보냈어. 하얀 해 옆에 너랑 다람쥐가 있어.' } }),
      L({ id: 'mare', name: '마레 선장', house: '마레 선장 댁', kind: 'elder', folk: 'oldw', look: { tc: '#2a3a6a', hat: null },
        lines: { c3: '983년 겨울, 하늘에서 흰 줄기가 떨어지는 걸 봤어. 루체 아비도 봤지.||그 뒤로 그 사람은 하늘만 봤어.', c6: '천년제 불꽃이 여기서도 보였어. 흰 불꽃 하나가 제일 높이 올라가더군.', c9: '등대지기가 살아 있다고? …그 사람은 눈이 멀었으니 오히려 흑점을 봤을 거야.', c12: '바다는 기억해. 사람은 잊어도.' } }),
    ],
    yellow: [
      L({ id: 'zara', name: '향신료 상인 자라', house: '자라의 향신료 가게', kind: 'bakery', folk: 'merchantw', look: { tc: '#c83a3a' }, sign: 'shop',
        lines: { c4: '대바자르에서 제일 매운 건 골디의 셈법이야. 둘째가 내 고추.', c6: '천년제에 고추를 팔러 갔다가 다 팔고 왔어. 하늘섬 사람들은 매운 걸 몰라.', c8: '그레이 사람들이 내 고추를 사 가. 색이 빨개서래. 맵다고 울면서도 사.', c12: '돌아오면 제일 매운 걸로 대접할게. 울어도 돼.' } }),
      L({ id: 'hasim', name: '낙타몰이 하심', house: '하심의 마구간', kind: 'home', folk: 'merchant', look: { tc: '#a8703a' },
        lines: { c4: '모래바다는 밤에 건너. 낮엔 모래가 사람을 삼키거든.', c6: '낙타를 하늘섬에 데려가려다 실패했어. 구름은 발이 빠진대.', c8: '그레이까지 짐을 날랐어. 거기 사람들 빵을 보면 우는 거 알아? 색이 있어서.', c10: '로켓 연료통을 날랐어. 낙타들이 무서워서 사흘을 안 먹었지.' } }),
      L({ id: 'chico', name: '참새단 치코', house: '참새 둥지 옆집', kind: 'home', folk: 'kid', look: { hc: '#2a1a1a', skin: 'brown', tc: '#c8a060' },
        lines: { c4: '피카 누나가 너 쫓았지? 미안. 우리 둥지는 그늘 골목이야. 배고파서 그래.', c5: '골디가 참새단한테 일을 줬어! 수레바퀴 닦기. 돈 받는 일!', c7: '추운 나라에서도 참새가 산대. 참새는 어디든 가.', c10: '로켓 외판 닦는 거 우리가 했어. 반짝반짝하지?' } }),
      L({ id: 'nur', name: '점성술사 누르', house: '누르의 별 천막', kind: 'scholar', folk: 'mage', look: { hat: 'hood', hatC: '#3a2a6a', tc: '#3a2a6a', skin: 'brown' },
        lines: { c4: '야나가 별자리 퀴즈를 낸다고? 그 애는 별 이름을 백 개 넘게 알아.', c5: '하늘에 검은 점이 있어. 별이 아니야. 별은 빛을 내는데 그건 빛을 먹어.', c9: '밤이 안 끝나는 곳에 갔었다며. 별은 거기서도 같은 자리에 있었어?', c11: '정거장에서 별을 보면 모래알 같다며? 부럽다.' } }),
      L({ id: 'radia', name: '세공사 라디아', house: '라디아 보석방', kind: 'workshop', folk: 'merchantw', look: { hc: '#e8d0a0', tc: '#e8b83a' },
        lines: { c4: '황금궁 금화는 내가 찍어. 테두리 톱니 개수가 골디의 기분이야.', c6: '거울 방패 봤어. 내가 닦았으면 더 반짝였을 텐데.', c12: '아스트라는 온통 황금 모래라며. 한 줌만… 아니, 농담이야.' } }),
      L({ id: 'umar', name: '물지기 우마르', house: '오아시스 물지기 집', kind: 'elder', folk: 'oldm', look: { skin: 'brown', tc: '#e8d8b0' },
        lines: { c4: '오아시스가 줄고 있어. 탑이 선 뒤로 물빛도 흐려.', c7: '눈이 녹으면 물이 된다며. 화이트 눈을 한 수레만 가져왔으면.', c9: '물은 공짜다. 골디도 물값은 못 받아. 그게 이 모래 나라의 첫째 법이지.' } }),
    ],
    purple: [
      L({ id: 'kasim', name: '학생 카심', house: '하숙 「보라 등불」', kind: 'scholar', folk: 'student', look: { hc: '#1a1a1a', skin: 'tan' },
        lines: { c5: '옐로에서 왔어. 여기 음식은 안 매워서 혀가 심심해.', c6: '베라 교수님 수업에서 「그릇」을 배웠어. 넓어질 뿐, 채워지지 않는다.||…어째선지 엄마 얼굴이 떠올랐어.', c9: '밤의 나라 얘기를 들었어. 거기 학생들은 등불 아래서 공부한대.' } }),
      L({ id: 'lucian', name: '화가 루시안', house: '루시안 화실', kind: 'tailor', folk: 'student', look: { hc: '#b87ab8', tc: '#6a3a6a' },
        lines: { c5: '노을만 그려. 여기선 해가 안 지니까 주황 물감이 늘 모자라.', c7: '하얀 머리가 된 너를 그리고 싶어. 가만히 있어 봐. …못 참는구나.', c8: '그레이에 가면 색을 가져다줘. 아니, 거긴 색이 없지. 그럼 색이 없는 걸 가져다줘.', c12: '하늘을 그렸어. 검은 점 없이. 처음으로.' } }),
      L({ id: 'mor', name: '버섯꾼 모르', house: '모르의 버섯 광', kind: 'herbal', folk: 'farmer', look: { hat: 'hood', hatC: '#5a3a6a', tc: '#6a5a8a' },
        lines: { c5: '큰 버섯은 먹지 마. 꿈을 꿔. 너무 좋은 꿈이라 안 깨고 싶어져.', c6: '거울 연못을 너무 오래 보면 버섯처럼 돼. 뿌리가 내린다고.', c9: '밤의 나라 버섯은 빛이 나. 등불 대신 쓴대.' } }),
      L({ id: 'tik', name: '시계공 티크', house: '티크 시계방', kind: 'workshop', folk: 'mech', look: { hat: null, hc: '#8a6ab8', glasses: true },
        lines: { c5: '퍼플 시계는 늘 저녁 여섯 시에 멈춰 있어. 고치면 안 된대. 베라 교수님이.', c8: '은빛 왕국 시계가 612년에 멈췄다며. 우리랑 비슷해.', c12: '시계가 움직였어! 6시 1분. 무슨 일이 있었던 거지?' } }),
      L({ id: 'ophelia', name: '책방 할매 오필리아', house: '오필리아 책방', kind: 'scholar', folk: 'oldw', look: { tc: '#6a4a8a', glasses: true },
        lines: { c5: '세린이라는 학생이 여기서 책을 제일 많이 빌렸지.||반납은 한 번도 안 했어.', c6: '세린의 책… 네가 돌려주러 온 건 아니지? 아니면 됐어. 가지고 있어.', c12: '세린이 돌아오면 전해 줘. 연체료는 안 받는다고.' } }),
      L({ id: 'eon', name: '뱃사공 에온', house: '뱃사공 오두막', kind: 'fisher', folk: 'sailor', look: { tc: '#4a3a6a', hc: '#2a1a3a' },
        lines: { c5: '거울 연못은 배로 건너면 안 돼. 물에 비친 네가 노를 뺏어.', c6: '연못에 비친 하늘에 검은 점이 두 개였어. 하나는 진짜, 하나는 거꾸로.', c10: '로켓이 뜨는 날 연못에도 로켓이 떴어. 거꾸로.' } }),
    ],
    rainbow: [
      L({ id: 'mirabel', name: '곡예사 미라벨', house: '곡예단 숙소', kind: 'home', folk: 'clown', look: { gender: 'girl', hair: 'twin', hc: '#ff8ab8', tc: '#8ad8ff' },
        lines: { c6: '롤로 오빠가 색을 잃었어. 웃겨도 웃음이 회색이야.||너라면 뭔가 해 줄 수 있을 것 같아.', c7: '롤로 오빠 코가 다시 빨개졌어! 제일 먼저 너한테 말하고 싶었어.', c10: '곶에서 로켓 쏘는 날 공중그네를 탈 거야. 제일 높은 데서 볼래.' } }),
      L({ id: 'paul', name: '풍선장수 폴', house: '풍선 가게', kind: 'tailor', folk: 'merchant', look: { tc: '#ff7ab8', hat: null },
        lines: { c6: '천년제 풍선이야! 구름바다 위에선 풍선이 안 떠. 이미 떠 있으니까.', c7: '봉헌식 날 풍선이 전부 하얘졌어. 네가 빛날 때.', c9: '밤의 나라에 풍선을 팔러 갔어. 까만 풍선만 팔렸지.' } }),
      L({ id: 'bern', name: '구름목수 베른', house: '구름 목공소', kind: 'workshop', folk: 'farmer', look: { hat: null, hc: '#e8e8f0', tc: '#8ab8e8' },
        lines: { c6: '구름 다리는 매일 고쳐야 해. 구름은 게으르거든.', c7: '기둥이 무너진 자리에 구름을 채웠어. 푹신하지만 올라서진 마.', c11: '하늘 정거장까지 다리를 놓을 수 있냐고? 구름이 그만큼 부지런하진 않아.' } }),
      L({ id: 'echo', name: '시인 에코', house: '에코의 다락', kind: 'music', folk: 'student', look: { gender: 'girl', hair: 'long', hc: '#b8a8ff', tc: '#ffffff' },
        lines: { c6: '천 번째 천년제 시를 쓰는 중이야. 「천 번 모여 한 번 빛나니」… 너무 흔해?', c7: '봉헌식 이야기를 시로 쓸 거야. 흰빛이 모두 앞에서 깨어난 날.||너는 시에서 어떤 얼굴로 나오고 싶어?', c12: '마지막 줄을 비워 뒀어. 네가 돌아와서 채워 줘.' } }),
      L({ id: 'mama', name: '국수집 마마', house: '천년제 국수집', kind: 'tavern', folk: 'merchantw', look: { tc: '#ffd84a', hc: '#6a3a2a' },
        lines: { c6: '구름 국수 한 그릇! 면이 구름처럼 풀어져. 빨리 먹어.', c8: '그레이에서 온 손님이 국수를 먹고 울었어. 따뜻하다고.', c12: '하늘에서 돌아오면 곱빼기로 줄게.' } }),
      L({ id: 'grego', name: '퇴역병 그레고', house: '그레고의 쉼터', kind: 'elder', folk: 'guard', look: { hat: null, hc: '#8a8a8a' },
        lines: { c6: '그라우스 밑에서 십 년을 일했어. 그 녀석은 장부에 적힌 숫자밖에 몰라.', c7: '그라우스가 기둥을 폭주시켰다며. …끝내 숫자에 먹혔군.', c9: '카이론이 그라우스를 「장부의 오류」라고 불렀대. 사람을 오류라니.' } }),
    ],
    white: [
      L({ id: 'regina', name: '수녀 레지나', house: '레지나의 방', kind: 'chapel', folk: 'nun', look: { age: 'old', hc: '#d8d0d0' },
        lines: { c7: '나는 한때 징수원이었어요. 983년의. 지금은 그 빛이 어디로 갔는지 기도하죠.', c9: '장부를 태우려 했어요. 못 했어요. 그게 증거니까.', c12: '기도가 끝났어요. 이제 무엇을 빌어야 할지 모르겠네요. …좋은 일이죠.' } }),
      L({ id: 'helga', name: '약사 헬가', house: '헬가 약방', kind: 'herbal', folk: 'oldw', look: { tc: '#8ab8e8' },
        lines: { c7: '설화초는 눈 속에서만 피어. 캐는 순간부터 시들지. 병을 늦추는 꽃이 제일 먼저 죽어.', c8: '노아는 요즘 어때? 그 아이 눈이 참 맑았지.', c12: '설화초가 올해는 두 번 피었어. 처음 있는 일이야.' } }),
      L({ id: 'kris', name: '얼음 조각가 크리스', house: '얼음 공방', kind: 'workshop', folk: 'farmer', look: { hat: null, hc: '#e8f0f8', tc: '#6a8ab8' },
        lines: { c7: '대성당 앞 얼음 성녀상은 내가 깎았어. 루미에 님보다 조금 더 웃고 있지.', c8: '얼음은 녹아. 그래서 매년 새로 깎아. 똑같이 깎은 적은 한 번도 없어.', c12: '너를 깎아 보고 싶어. 다람쥐도. 녹기 전에 보러 와.' } }),
      L({ id: 'anna', name: '순례자 안나', house: '순례자 숙소', kind: 'home', folk: 'dawnw', look: { tc: '#c8d0e0', acc: [] },
        lines: { c7: '딸이 빛바램병이에요. 성녀님 손이 한 번 닿으면 낫는다는 소문을 믿고 왔어요.', c8: '성녀님이… 병을 낫게 하는 게 아니라 옮겨 가신다는 걸 알았어요.', c12: '딸 머리칼에 색이 돌아왔어요. 끝에서부터요. 기도를 누구에게 드려야 할까요.' } }),
      L({ id: 'toll', name: '종지기 톨', house: '종탑 아래 집', kind: 'elder', folk: 'oldm', look: { tc: '#5a6a8a' },
        lines: { c7: '대성당 종은 하루에 세 번 울려. 네 번 울리면 누가 떠난 거야.', c9: '어젯밤 종이 네 번 울렸어. 병동에서… 아니, 말하지 말자.', c12: '종을 다섯 번 쳤어. 다섯 번은 한 번도 없던 거야. 기뻐서 쳤지.' } }),
      L({ id: 'berndt', name: '광부 베른트', house: '요양 숙소', kind: 'home', folk: 'miner', look: { hc: '#c8c8d0' },
        lines: { c7: '그레이 폐광에서 일하다 빛이 바랬어. 손끝이 유리 같지?', c8: '루크라는 친구가 아직 거기 있어. 레드 사람이야. 몸조심하라고 전해 줘.', c12: '손끝에 핏기가 돌아. 봐, 분홍색이야.' } }),
    ],
    gray: [
      L({ id: 'luke', name: '광부 루크', house: '광부 합숙소', kind: 'home', folk: 'miner', look: { skin: 'tan', hc: '#3a2a1a' },
        lines: { c8: '레드에서 왔어. 여기 폐광은 돈이 되거든. 색이 빠지는 게 흠이지.', c9: '밤에 광맥이 울어. 누가 배고프다고 하는 것 같아.', c10: '집에 가기로 했어. 도라가 기다려. 양말도 다 해졌고.' } }),
      L({ id: 'pinch', name: '고철상 핀치', house: '핀치 고철점', kind: 'workshop', folk: 'oldw', look: { tc: '#6a6a70', hat: 'goggles' },
        lines: { c8: '색 있는 고철은 비싸. 빨간 나사 하나가 빵 세 개야.', c9: '볼트 녀석이 요즘 웃어. 세피아 덕이지. 기계가 사람을 웃게 하다니.', c12: '고철 더미에서 풀이 났어. 초록색. 초록색이라고!' } }),
      L({ id: 'tint', name: '색 모으는 틴트', house: '틴트의 은신처', kind: 'home', folk: 'kidg', look: { hc: '#b8b8b8', tc: '#8a8a8a' },
        lines: { c8: '색 있는 거 있어? 조금만 보여 줘. …예쁘다.||세피아 언니가 그 말을 가르쳐 줬어. 「예쁘다.」', c9: '밤의 나라엔 색이 있어? 까만색도 색이야?', c12: '내 머리칼이 분홍이 됐어! 조금이지만!' } }),
      L({ id: 'argen', name: '기록지기 아르겐', house: '기록지기의 집', kind: 'scholar', folk: 'scholar', look: { gender: 'boy', hair: 'neat', hc: '#8a8a96', tc: '#5a5a66' },
        lines: { c8: '우리 집안은 400년 동안 은빛 왕국 기록을 지켰어. 읽는 사람이 없어도.', c9: '612년 기록판을 가져갔다며. 괜찮아. 기록은 읽히려고 있는 거야.', c11: '정거장의 여덟 사람이 우리 조상이야. 잠든 채로… 400년이라니.' } }),
      L({ id: 'gear', name: '수리공 기어', house: '기어 수리점', kind: 'workshop', folk: 'mech', look: { hc: '#5a5a5a' },
        lines: { c8: 'MK 시리즈를 고쳐 본 적 있어. 일곱 번째는 무서워서 못 열었어.', c10: '로켓 연료 펌프를 봐 달래. 볼트 씨가 부탁한 거라 밤을 새웠지.', c12: '고칠 게 없어졌어. 심심하다. 좋은 쪽으로.' } }),
      L({ id: 'dusty', name: '먼지 쌓인 집', house: '빈 집', kind: 'empty', folk: null,
        note: '탁자 위에 쪽지가 있다: 「612년 봄. 왕이 광맥을 마셨다. 이튿날 배고프다 하셨다. 우리는 떠난다. 누가 이 집에 오거든, 창문을 열어 주오.」' }),
    ],
    black: [
      L({ id: 'lumen', name: '등불장이 루멘', house: '등불 공방', kind: 'workshop', folk: 'nightm', look: { tc: '#3a3450', trim: '#ffd86a' }, sign: 'magic',
        lines: { c9: '이 거리 등불은 전부 내가 만들었어. 꺼지지 않는 등불. 비밀은… 기름을 아끼지 않는 거야.', c10: '곶의 스파크한테 설계도가 갔지? 하늘에서도 안 꺼지는 등불이 될 거야.', c12: '등불을 하나 껐어. 처음으로. 해가 떴거든. 잠깐이었지만.' } }),
      L({ id: 'nox', name: '밤빵집 녹스', house: '밤빵집', kind: 'bakery', folk: 'nightw', look: { tc: '#3a3450', hc: '#4a3a5a' }, sign: 'shop',
        lines: { c9: '밤빵은 달빛으로 부풀려. 해가 안 뜨니까 빵이 늘 따끈해.', c10: '그린 빵집 한나 씨한테 편지를 받았어. 보리빵 비법을 나눠 주겠대. 빵집끼리는 통해.', c12: '빵이 아침 햇빛에 부풀었어. 모양이 이상해. 맛은 좋아.' } }),
      L({ id: 'graves', name: '묘지기 모르트', house: '묘지기 오두막', kind: 'elder', folk: 'oldm', look: { tc: '#2a2438', hat: 'hood', hatC: '#1a1626' },
        lines: { c9: '밤의 나라 묘에는 이름이 없어. 녹턴의 장부에서 지워진 사람들이니까.', c10: '리라라는 이름은 장부에도 묘에도 없었지. 살아 있으니까.', c12: '묘마다 이름을 새기고 있어. 늦었지만.' } }),
      L({ id: 'shade', name: '정보상 견습 쉐이드', house: '골목 끝 방', kind: 'home', folk: 'nightw', look: { age: 'child', hc: '#1a1626' },
        lines: { c9: '미드나잇 님 밑에서 일해. 정보 한 개에 빵 한 개. 너에 대한 정보는 빵 열 개야.', c10: '네 누나(언니) 얘기는 공짜로 줄게. 리라 님은 네 얘기를 할 때만 노래를 틀려.', c12: '정보를 전부 태웠어. 미드나잇 님이 그래도 된대. 이제 필요 없다고.' } }),
      L({ id: 'serena', name: '밤의 악사 세레나', house: '세레나의 방', kind: 'music', folk: 'nightw', look: { hc: '#6a3a8a', tc: '#2a2438', acc: ['earring'] },
        lines: { c9: '리라 언니한테 자장가를 배웠어. 「흰 밤, 흰 꽃, 돌아오렴」… 누구한테 부르는 노래였을까.', c12: '자장가 끝 구절을 바꿨어. 「돌아왔구나」로.' } }),
      L({ id: 'kyle', name: '전 기사 카일', house: '카일의 방', kind: 'home', folk: 'knight', look: { hat: null, hc: '#4a4a4a', cape: null },
        lines: { c9: '기사단을 나왔어. 장부의 「허용 손실」 칸에 내 누이 이름이 있었거든.' },
        route: { dawn: '새벽단이 탑을 부순다며. 부술 거면 제대로 부숴. 다시 못 세우게.', order: '기사단 안에서 고친다고? 네가 한다면… 믿어 볼게. 한 번만.', night: '밤의 방식이 옳았는지도 몰라. 말하지 않고, 지키는.' }, routeFrom: 'c10' }),
    ],
    colorful: [
      L({ id: 'spark', name: '조수 스파크', house: '스파크 공방 2호', kind: 'workshop', folk: 'inventor', look: { hc: '#ffd84a', tc: '#5ab8ff' },
        lines: { c10: '피로스 박사님 조수야! 로켓은 99퍼센트 완성. 남은 1퍼센트가 제일 무거워.', c11: '로켓이 떴어! 내가 조인 나사가 하늘에 있어!', c12: '박사님이 울어. 기쁘대. 기쁜데 왜 울지?' } }),
      L({ id: 'pang', name: '폭죽 할매 팡', house: '팡 할매 폭죽집', kind: 'tavern', folk: 'oldw', look: { tc: '#ff5a3a' },
        lines: { c10: '천년제 불꽃은 내가 만들었지! 흰 불꽃 하나는 내 게 아니었어. 그게 너였다며?', c11: '로켓 불꽃 봤어? 내 폭죽 백 년 치보다 밝았어. 분하다!', c12: '돌아오는 날 폭죽을 쏠 거야. 제일 큰 걸로.' } }),
      L({ id: 'pipe', name: '배관공 파이프', house: '배관 공방', kind: 'workshop', folk: 'mech', look: { tc: '#e85a4a' },
        lines: { c10: '연료관을 까는 중이야. 한 군데라도 새면 쾅. 이 동네 이름이 왜 쾅쾅이겠어.', c12: '관을 다 걷었어. 이제 꽃밭으로 쓴대.' } }),
      L({ id: 'kiki', name: '비둘기 조련사 키키', house: '비둘기 집', kind: 'home', folk: 'kidg', look: { hc: '#ff8a3a', tc: '#8ad8a8' },
        lines: { c10: '대륙 전체에 편지를 날라. 그린까지 사흘, 블랙까지 닷새. 블랙은 밤이라 느려.', c11: '비둘기가 로켓을 따라가려다 돌아왔어. 너무 높대.', c12: '하늘에서 온 편지는 없어? 없어도 괜찮아. 네가 돌아오면 되니까.' } }),
    ],
  };
  OW.FOLK = FOLK;

  /* ───────── 편지 다섯 통 ───────── */
  // 누가 → 누구: [보내는 사람, 받는 사람, 편지, 열리는 장, 보상]
  const CHAINS = {
    hanna: { to: 'sophie', item: 'letter_hanna', from: 'c3', ask: '블루에 딸 소피가 살아. 등대 옆 집이야. 이 편지랑 빵 좀 전해 줄래?||갓 구운 거라 식기 전에… 는 무리겠지. 부탁해.', thanks: '엄마 편지다! 빵도…! 아직 조금 따뜻해.||고마워. 이거 받아. 등대 계단에서 주운 거야. 그리고 답장 좀 부탁해도 될까?', reward: 'heartpiece', reply: 'letter_sophie', replyThanks: '소피 답장이다…! 조개껍데기까지. 이 애는 참.||고마워. 이거 가져가. 보리빵 스무 개어치 돈이야. 빵으로 주면 무겁잖아.', replyReward: { gold: 300 } },
    osborn: { to: 'regina', item: 'letter_osborn', from: 'c7', ask: '화이트 대성당 옆에 레지나라는 수녀가 있다. 983년에 나와 같이 장부를 적던 사람이지.||이걸 전해 다오. 우리가 적은 숫자의 끝을, 그 사람도 알아야 해.', thanks: '오스본… 살아 있었군요. 이 장부 한 장.||「허용 손실: 그린 마을 몫」. 우리 손으로 적은 거예요.||기도만으로는 안 되겠네요. 이걸 가져가요. 대성당 창고에서 오래 잠자던 거예요.', reward: 'heartpiece' },
    dora: { to: 'luke', item: 'letter_dora', from: 'c8', ask: '그레이에 가면 우리 루크한테 이것 좀. 털양말하고 편지야.||거긴 추워서 발이 시리대. 색도 없고.', thanks: '도라 양말이다…! 화산 흙 냄새가 나. 집 냄새.||고마워. 이거 가져가. 폐광에서 캔 은빛 조각을 판 돈이야.||…나, 집에 가야겠어.', reward: { gold: 800, item: 'bombs5' } },
    zara: { to: 'kasim', item: 'letter_zara', from: 'c5', ask: '아들 카심이 퍼플 라벤더 학원에 있어. 편지 좀 전해 줘.||밥은 먹고 다니는지. 고추도 한 봉지 넣었어.', thanks: '엄마 편지…! 고추까지. 여기 음식은 하나도 안 매워서 죽을 뻔했어.||고마워. 이거 가져가. 학원 약초실에서 몰래… 아니, 정당하게 받은 거야.', reward: { item: 'potion_g', gold: 200 } },
    lumen: { to: 'spark', item: 'letter_lumen', from: 'c9', ask: '곶에 스파크라는 발명가 조수가 있어. 꺼지지 않는 등불 설계도를 보내기로 했거든.||하늘에서도 꺼지지 않게. 전해 줄 수 있어?', thanks: '루멘 씨 설계도다! 기름을 아끼지 않는 것… 이게 비밀이었구나.||로켓 안에 달 거야. 고마워, 이거 받아!', reward: 'heartpiece' },
  };
  const folkName = (id) => { for (const arr of Object.values(FOLK)) for (const P of arr) if (P.id === id) return P.name + ' (' + P.house + ')'; return id; };
  const chainOf = {}; for (const [a, ch] of Object.entries(CHAINS)) { chainOf[a] = { role: 'from', ch, key: a }; chainOf[ch.to] = { role: 'to', ch, key: a }; }
  async function reward(c, r) {
    if (!r) return;
    if (typeof r === 'string') { await c.getItem(r); return; }
    if (r.item) await c.getItem(r.item);
    if (r.gold) { c.gold(r.gold); G.ui.toast(r.gold + '원을 받았다', 'good'); }
  }
  /** 편지 심부름: 처리했으면 true */
  async function chainTalk(c, n, id) {
    const s = S(), cf = chainOf[id]; if (!cf) return false;
    const { ch, key } = cf, k = 'mail:' + key;
    if (cf.role === 'from') {
      if (!ST.after(ch.from)) return false;
      if (!s.flags[k + ':asked']) { for (const l of ch.ask.split('||')) await c.say(n, l); c.flag(k + ':asked'); await c.getItem(ch.item); c.journal(n.name + '에게서 편지를 받았다. 받을 사람: ' + folkName(ch.to)); return true; }
      if (ch.reply && s.flags[k + ':done'] && s.inv[ch.reply] && !s.flags[k + ':replied']) { c.take(ch.reply); for (const l of ch.replyThanks.split('||')) await c.say(n, l, { face: 'happy' }); c.flag(k + ':replied'); await reward(c, ch.replyReward); c.bond && c.bond('toria', 1); return true; }
      if (!s.flags[k + ':done'] && s.inv[ch.item]) { await c.say(n, '편지는 아직이야? 급하진 않아. 천천히.'); return true; }
      return false;
    }
    // 받는 사람
    if (s.inv[ch.item] && !s.flags[k + ':done']) {
      c.take(ch.item);
      for (const l of ch.thanks.split('||')) await c.say(n, l, { face: 'happy' });
      c.flag(k + ':done'); await reward(c, ch.reward);
      if (ch.reply) await c.getItem(ch.reply);
      c.journal(n.name + '에게 편지를 전했다.');
      return true;
    }
    return false;
  }

  /* ───────── 씨앗지기 ───────── */
  const SEED_TIERS = [
    [5, 'arrows', '화살통을 넓혀 주마. 화살 40개까지.'], [10, 'bombs', '폭탄 가방을 넓혀 주마. 폭탄 15개까지.'], [15, 'heart', '빛 씨앗 열다섯. 이건 하트 조각으로 바꿔 주마.'],
    [22, 'arrows2', '화살통을 한 번 더. 화살 50개까지.'], [30, 'bombs2', '폭탄 가방을 한 번 더. 폭탄 20개까지.'], [40, 'heart2', '마흔 개라니. 대륙을 다 뒤졌구나. 하트 조각이다.'], [50, 'heart3', '쉰 개… 네가 모은 빛이 대륙을 한 바퀴 돌았구나. 마지막 하트 조각이다.'],
  ];
  async function seedTalk(c, n) {
    const s = S(), have = s.seeds || 0;
    let gave = false;
    for (const [need, key, msg] of SEED_TIERS) {
      if (have < need || s.flags['seedk:' + key]) continue;
      await c.say(n, msg, { face: 'happy' }); c.flag('seedk:' + key); gave = true;
      if (key.startsWith('arrows')) { s.ammo.arrowsMax = key === 'arrows' ? 40 : 50; s.ammo.arrows = s.ammo.arrowsMax; c.sfx && c.sfx('item'); G.ui.toast('화살통이 넓어졌다 (' + s.ammo.arrowsMax + ')', 'good'); }
      else if (key.startsWith('bombs')) { s.ammo.bombsMax = key === 'bombs' ? 15 : 20; s.ammo.bombs = s.ammo.bombsMax; c.sfx && c.sfx('item'); G.ui.toast('폭탄 가방이 넓어졌다 (' + s.ammo.bombsMax + ')', 'good'); }
      else await c.getItem('heartpiece');
    }
    if (!gave) {
      const next = SEED_TIERS.find(([need, key]) => !s.flags['seedk:' + key]);
      if (next) await c.say(n, '지금 가진 빛 씨앗은 ' + have + '개. ' + next[0] + '개가 되면 다시 오너라.||씨앗은 풀숲 밑, 지붕 그늘, 물가, 사람이 잘 안 가는 곳을 좋아한단다.');
      else await c.say(n, '더 줄 게 없구나. 대신 이야기 하나 해 주마. 빛 씨앗은 누군가 나눈 빛의 부스러기란다. 나눈 사람은 모르지.');
    }
  }

  /* ───────── 짓기: 집마다 건물 · 실내 · 사람 ───────── */
  function folkTalk(P) {
    return async (c, npc) => {
      npc.name = P.name;
      if (await chainTalk(c, npc, P.id)) return;
      if (P.seedKeeper) { await seedTalk(c, npc); return; }
      if (P.id === 'hanna' && !f('gift:hanna')) { await c.say(npc, '자, 보리빵. 설탕 두 숟갈. 할머니한텐 비밀이야.', { face: 'happy' }); c.flag('gift:hanna'); await c.getItem('food_corn'); return; }
      if (P.id === 'sophie' && ST.after('c7') && !f('gift:sophie')) { await c.say(npc, '엄마가 또 빵을 보냈어. 이번엔 네 몫이래.', { face: 'happy' }); c.flag('gift:sophie'); await c.getItem('food_corn'); return; }
      const rt = ST.route();
      let t = P.route && P.route[rt] && ST.after(P.routeFrom || 'c4') ? P.route[rt] : ST.lines(P.lines || {});
      if (!t) t = '…오늘도 렙업!';
      c.flag('met:tw_' + P.id);
      for (const l of String(t).split('||')) await c.say(npc, l.trim());
    };
  }
  function folkMark(P) {
    return (s) => {
      const cf = chainOf[P.id];
      if (!cf) { if (!P.seedKeeper) return null; const nx = SEED_TIERS.find(([nd, key]) => !s.flags['seedk:' + key]); return nx && (s.seeds || 0) >= nx[0] ? '!' : null; }
      const k2 = 'mail:' + cf.key;
      if (cf.role === 'from') return ST.after(cf.ch.from) && !s.flags[k2 + ':asked'] ? '!' : (cf.ch.reply && s.inv[cf.ch.reply]) ? '!' : null;
      return s.inv[cf.ch.item] ? '!' : null;
    };
  }
  OW.hooks.push((m) => {
    for (const [n, list] of Object.entries(FOLK)) {
      const homes = OW.homes[n] || [];
      const C = OW.towns[n];
      list.forEach((P, k) => {
        const hm = homes[k];
        const look = P.folk ? G.cast.folk(P.folk, P.look || {}) : null;
        if (!hm) {
          // 집이 없으면 동네 길가에 선다
          if (P.note || !C) return;
          const E = C.outer || { x0: C.x, y0: C.y, x1: C.x + C.w, y1: C.y + C.h };
          const sx = k % 2 ? E.x1 - 3 - k : E.x0 + 3 + k, sy = k % 3 === 0 ? C.y - 2 : k % 3 === 1 ? C.y + C.h + 1 : C.plaza.y + 3;
          const [x, y] = OW.near(m, sx, sy, (xx, yy, t) => t === OW.PLAN[n].pave || t === OW.PLAN[n].lane || t === T.PLAZA, 14);
          ST.person('world', { id: 'tw_' + P.id, name: P.name, look, x, y, dir: 'down', wander: 2, talk: folkTalk(P), mark: folkMark(P) });
          return;
        }
        const w = hm.w, h = hm.h;
        const rw = 11 + (w > 4 ? 2 : 0), rh = 9 + (h > 3 ? 1 : 0);
        const hid = hm.id;
        const opts = { id: hid, region: n, style: n, tx: hm.tx, ty: hm.ty, w, h, name: P.house, sub: OW.SHORT[n] + ' 마을', path: 1, room: room(P.kind, rw, rh, n) };
        if (P.sign) opts.sign = P.sign;
        hm.doorAt = ST.house(m, opts);
        const px = rw >> 1, py = 4 + (rh > 9 ? 1 : 0);
        if (P.note) { ST.onMap(hid, (mm, Wd) => { Wd.add(new G.props.Sign({ x: (px + 1) * TS + 8, y: (py + 1) * TS + 12, text: P.note, anyDir: true })); }); return; }
        ST.person(hid, { id: 'tw_' + P.id, name: P.name, look, x: px, y: py + 1, dir: 'down', wander: 1, talk: folkTalk(P), mark: folkMark(P) });
      });
      // 남는 집: 문이 잠긴 집
      for (let k = list.length; k < homes.length; k++) {
        const hm = homes[k];
        hm.doorAt = ST.house(m, { id: hm.id, region: n, style: n, tx: hm.tx, ty: hm.ty, w: hm.w, h: hm.h, name: '', path: 1 });
      }
    }
    // 길을 걷는 사람들: 마을마다 둘
    const WALK = {
      green: [['farmer', '농부 댄', ['올해 보리는 알이 작아. 탑 때문인지 날씨 때문인지.', '할머니 참나무 밑에서 쉬면 허리가 낫는대.']], ['kidg', '꼬마 넬', ['토리아다! 찍찍!', '광장 탑 밑에 가면 머리가 어지러워.']]],
      red: [['miner', '광부 조', ['곡괭이는 무겁지만 빛은 가볍지.', '마그다 할매 떡볶이 먹었어? 안 먹었으면 레드에 안 온 거야.']], ['smith', '짐꾼 바크', ['화산이 요즘 코를 골아.', '오늘도 렙업! …아, 인사 안 받아 주네.']]],
      blue: [['sailor', '선원 킷', ['갈매기가 내 빵을 채 갔어.', '등대 불빛이 요즘 두 번씩 깜빡여.']], ['scholar', '필사공 로라', ['금서고 먼지는 400년 묵었대.', '책은 파도처럼 와서 파도처럼 가.']]],
      yellow: [['merchant', '행상 알리', ['세 개 사면 하나 더! 네 개 사면… 그냥 네 개.', '골디 님 금화는 테두리를 세어 봐.']], ['merchantw', '물장수 샤', ['물 한 잔 5원. 오아시스 물이야.', '모래바다에 신기루가 떴어. 탑이 없는 도시였어.']]],
      purple: [['student', '학생 오린', ['과제가 「그릇을 설명하시오」야. 누가 좀 설명해 줘.', '베라 교수님 찻잔 밑에 뭐가 있대.']], ['mage', '마녀 견습 플로', ['빗자루는 아직 못 타. 대신 잘 쓸어.', '연못에 너무 오래 비치면 안 돼.']]],
      rainbow: [['clown', '광대 피피', ['풍선 하나에 웃음 하나!', '구름 밑은 보지 마. 발이 저려.']], ['kidg', '꼬마 무무', ['구름고래 누베 봤어? 등에 탈 수 있대!', '천년제 도장 몇 개 모았어?']]],
      white: [['nun', '수련 수녀 이리', ['발밑을 조심하세요. 얼음이 기도를 안 들어줘요.', '성녀님은 요즘 잠을 못 주무세요.']], ['farmer', '나무꾼 오드', ['장작 하나에 온기 하나.', '온천에 가면 얼어붙은 게 다 풀려. 마음도.']]],
      gray: [['mech', '고철 줍는 칼', ['색 있는 나사를 찾으면 부자야.', '은빛 왕국 사람들은 은빛 머리였대. 지금은 그냥 회색이지.']], ['kid', '꼬마 핍', ['세피아 누나 봤어? 로봇인데 웃어!', '폐공장에서 쿵쿵 소리가 나.']]],
      black: [['nightm', '등불지기 로그', ['등불 하나에 이야기 하나.', '해가 뜨면 어떻게 되냐고? 몰라. 본 적 없어.']], ['nightw', '밤 산책꾼 미아', ['밤의 나라는 조용해. 조용해서 좋아.', '미드나잇 님 고양이 눈은 금색이야.']]],
      colorful: [['inventor', '발명가 지망생 톡', ['쾅! …아니, 오늘은 안 터졌어.', '로켓에 이름이 있어? 무한호래. 멋지지?']], ['kid', '꼬마 콩', ['봄바 봤어? 폭탄 로봇! 착해!', '박사님 머리는 매일 탄다.']]],
    };
    for (const [n, arr] of Object.entries(WALK)) {
      const C = OW.towns[n]; if (!C || !C.outer) continue;
      const E = C.outer;
      arr.forEach(([kind, name, barks], k) => {
        const [x, y] = OW.near(m, k ? E.x1 - 6 : E.x0 + 6, C.y - 2 + (k ? 0 : C.h + 2), (xx, yy, t) => t === OW.PLAN[n].lane || t === OW.PLAN[n].pave, 10);
        ST.person('world', { id: 'walk_' + n + k, name, look: G.cast.folk(kind), x, y, wander: 5, barks, talk: async (c, npc) => { await c.say(npc, U.pick(barks)); } });
      });
    }
  });

  /* ───────── 다시 만나는 사람들: 마을 밖에 나타나는 이웃 ───────── */
  // 핀: 천년제(6장)에 하늘섬 광장에 · 루크: 10장부터 레드 집으로 돌아온다 · 치코: 10장 곶
  OW.hooks.push(() => {
    const T6 = OW.towns.rainbow, TC = OW.towns.colorful;
    if (T6 && T6.plaza) ST.person('world', { id: 'tw_finn_fest', name: '양치기 핀', look: G.cast.folk('kid', { hc: '#c8a060', tc: '#6aa84a' }), x: T6.plaza.x + 6, y: T6.plaza.y + 3, wander: 2, when: (s) => s.ch === 'c6',
      talk: async (c, n) => { await c.say(n, '양 대신 풍선을 몰고 왔어! 하늘섬은 바람이 세서 자꾸 날아가.||그린 사람들 다 왔어. 한나 아줌마도, 바르톨 아저씨도. 너 보러.'); } });
    if (TC && TC.plaza) ST.person('world', { id: 'tw_chico_launch', name: '참새단 치코', look: G.cast.folk('kid', { hc: '#2a1a1a', skin: 'brown', tc: '#c8a060' }), x: TC.plaza.x - 5, y: TC.plaza.y + 3, wander: 2, when: (s) => s.ch === 'c10',
      talk: async (c, n) => { await c.say(n, '외판 닦으러 왔어! 참새단 전원 출동. 피카 누나가 반짝이는 건 못 참거든.'); } });
  });
  // 루크가 집에 돌아오면 도라의 집에 둘이
  ST.onMap('tw_red_0', (m, Wd) => {
    if (!ST.after('c11') && !f('mail:dora:done')) return;
    if (!ST.after('c10')) return;
    const npc = new G.props.NPC({ cid: 'tw_luke_home', x: 3 * TS + 8, y: 6 * TS + 12, dir: 'right', look: G.cast.folk('miner', { skin: 'tan', hc: '#3a2a1a', hat: null }), name: '광부 루크', talk: async (c, n) => { await c.say(n, f('mail:dora:done') ? '양말 고마웠어. 그레이 추위도 발은 못 이기더라. 이제 여기 있어. 집에.' : '돌아왔어. 그레이엔 이제 안 가. 색이 좋아.'); } });
    npc.fromPeople = true; Wd.add(npc);
  });
})();
