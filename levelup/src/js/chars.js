/* 인물 사전: 이름, 색, 걷는 모습(look), 초상화(face), 목소리, 소개(조건부로 열리는 줄) */
(function () {
  'use strict';
  const G = globalThis.G;
  const C = {};
  /** bio: [문장, 열리는 조건 플래그(없으면 처음부터)] */
  function ch(id, o) { C[id] = Object.assign({ id, voice: 1, color: '#ffe8a8' }, o); }

  /* ───────── 그린 마을 ───────── */
  ch('dotori', {
    name: '토리아', title: '날지 못하는 하늘다람쥐', color: '#f0b070', voice: 1.6,
    look: 'squirrel', face: { special: 'squirrel' },
    bio: [
      ['{n}의 단짝. 할머니 약초밭 울타리 밑에서 주워 온 하늘다람쥐.'],
      ['레벨 9에서 16년째 멈춰 있다. 말끝마다 「찍」을 붙인다.'],
      ['꿈은 하늘을 나는 것. 날개막은 멀쩡한데 이상하게 한 번도 날아 본 적이 없다.'],
      ['토리아가 멈춘 것은 16년 전, 세린이 「이 아이 좀 봐 줄래? 내가 돌아올 때까지」라며 쓰다듬은 날부터다. 약속이 성장을 붙잡았다.', 'dotori_knows'],
      ['에벨린 할머니는 토리아가 「세린이 마지막으로 쓰다듬은 짐승」이라고 한다.', 'm_purple_vision'],
      ['흰빛을 나눠 받은 날, 토리아는 처음으로 날았다. 3초 동안.', 'm_rainbow_share'],
    ],
  });
  ch('gran', {
    name: '에벨린 할머니', title: '그린 마을 약초꾼', color: '#8ae08a', voice: 0.72,
    look: { hair: 'bun', hc: '#c8c8c0', top: '#4a8a4a', bottom: '#5a4a3a', shoe: '#3a2a22' },
    face: { hair: 'bun', hc: '#d0d0c8', top: '#4a8a4a', eyes: 'narrow', acc: ['wrinkle'], mouth: 'flat', collar: '#e8e0c8' },
    bio: [
      ['그린 마을 언덕 위 오두막의 약초꾼. 경상도 말씨를 쓴다. 입은 험해도 손은 따뜻하다.'],
      ['젊었을 때 「한 가락 했다」고만 말한다. 지팡이를 짚지만 가끔 지팡이를 잊고 뛴다.'],
      ['{n}에게 시작의 버튼을 건넨 사람. 버튼이 흰빛을 뿜었을 때 한동안 말을 잃었다.', 'm_button'],
      ['정체는 16년 전 경험세에 반대했다가 물러난 초록의 사천왕 「초록 창」.', 'm_purple_vision'],
      ['카이론의 스승이었다. 그를 미워하지 않는다. 다만 그가 한 번도 울지 않은 것을 걱정한다.', 'm_black_nocturne'],
    ],
  });
  ch('kongsun', {
    name: '마리엔 아줌마', title: '초록 바구니 잡화점 주인', color: '#ffc870', voice: 1.2,
    look: { hair: 'bob', hc: '#3a2a1a', top: '#e8a84a', bottom: '#7a5a3a' },
    face: { hair: 'bob', hc: '#3a2a1a', top: '#e8a84a', mouth: 'open', blush: true, ec: '#6a4a2a' },
    bio: [
      ['그린 마을 소식은 마리엔 아줌마 가게에 먼저 도착한다. 그다음에 당사자한테.'],
      ['옥수수빵 굽는 솜씨는 대륙 제일이라고 본인이 주장한다. 마을 사람들도 딱히 반박하지 않는다.'],
      ['남편은 레드 마을로 돈 벌러 갔다가 징수 기사가 되어 돌아왔다. 그래서 집에 잘 안 들어온다.', (s) => s.quests.q_lunch === 'done'],
    ],
  });
  ch('ijang', {
    name: '베르덱스 이장', title: '그린 마을 이장', color: '#c8e8a0', voice: 0.85,
    look: { hair: 'bald', hc: '#8a7a6a', top: '#8a6a3a', bottom: '#4a3a2a' },
    face: { hair: 'bald', hc: '#8a7a6a', top: '#8a6a3a', acc: ['mustache', 'wrinkle'], eyes: 'dot' },
    bio: [
      ['이름대로 하루에도 마음이 열두 번 바뀐다. 마을 회의는 늘 세 시간짜리다.'],
      ['징수탑이 선 날 반대 서명을 받으러 다녔다가, 다음 날 찬성 서명을 받으러 다녔다.'],
      ['탑이 무너진 뒤로는 「원래 나는 처음부터 반대였어」라고 말한다.', 'm_green_golem'],
    ],
  });
  ch('bomi', {
    name: '베르나', title: '전설이 되고 싶은 아이', color: '#ffb0d0', voice: 1.45,
    look: { hair: 'pony', hc: '#8a4a2a', top: '#ff8ab0', bottom: '#6a5aa8', acc: '#ffd84a' },
    face: { hair: 'twin', hc: '#8a4a2a', top: '#ff8ab0', eyes: 'big', ec: '#6a4a2a', blush: true },
    bio: [
      ['아홉 살. 커서 전설이 되는 게 꿈이다. 매일 아침 나무 막대기로 허수아비를 백 번 때린다.'],
      ['레벨 9에서 1년째 멈춰 있다. 경험세 때문에 마을 아이들 대부분이 그렇다.'],
      ['탑이 무너진 날, 베르나는 레벨 10이 되었다. 마을이 떠나가라 울었다.', 'm_green_golem'],
    ],
  });
  ch('chul', {
    name: '카렐', title: '베르나의 라이벌', color: '#8ad0ff', voice: 1.35,
    look: { hair: 'cap', hc: '#2a2a2a', top: '#4a78c8', bottom: '#3a3a4a', acc: '#e84a4a' },
    face: { hair: 'cap', hc: '#2a2a2a', top: '#4a78c8', ac: '#e84a4a', mouth: 'smirk', acc: ['freckle'] },
    bio: [
      ['열 살. 베르나보다 한 살 많다는 걸 평생 자랑하며 살 예정이다.'],
      ['아버지가 징수 기사라서 마을 아이들 사이에서 조금 외롭다.'],
    ],
  });
  ch('dolsoe', {
    name: '징수 기사 고르디', title: '그린 마을 담당 징수 기사', color: '#b8a8e8', voice: 0.8,
    look: { hair: 'helmet', hc: '#3a3450', top: '#6a5a90', bottom: '#3a3450', acc: '#9aa4ae' },
    face: { hair: 'helmet', hc: '#3a3450', top: '#6a5a90', ac: '#9aa4ae', eyes: 'sleepy', mouth: 'flat' },
    bio: [
      ['그린 마을에 파견된 징수 기사. 하루의 절반은 탑 옆 의자에서 존다.'],
      ['마리엔 아줌마의 남편. 집에서는 「고르디 씨」, 밖에서는 「기사님」. 둘 다 싫어한다.'],
      ['징수탑이 무너진 날 가장 먼저 도망쳤고, 가장 먼저 돌아와 마을 사람들을 대피시켰다.', 'm_green_golem'],
    ],
  });
  ch('park', {
    name: '감자 농부 브람', title: '두더지와 전쟁 중', color: '#e8d098', voice: 0.9,
    look: { hair: 'cap', hc: '#4a3a2a', top: '#8a9a4a', bottom: '#5a4a3a', acc: '#e8d098' },
    face: { hair: 'cap', hc: '#4a3a2a', top: '#8a9a4a', ac: '#e8d098', acc: ['wrinkle'], mouth: 'frown' },
    bio: [['감자밭을 지키는 농부. 두더지와 27년째 전쟁 중이다. 전적은 3승 1,204패.']],
  });
  ch('hunjang', {
    name: '새싹 서당 훈장님', title: '마을의 역사 선생님', color: '#e0e0b0', voice: 0.7,
    look: { hair: 'bald', hc: '#e8e8e0', top: '#e8e0c8', bottom: '#5a5a6a' },
    face: { hair: 'topknot', hc: '#e8e8e0', top: '#e8e0c8', acc: ['longbeard', 'wrinkle'], eyes: 'narrow' },
    bio: [
      ['서당에서 아이들에게 글과 역사를 가르친다. 역사 이야기를 시작하면 해가 진다.'],
      ['아우룸의 연대기를 전부 외운다. 외운 것과 믿는 것은 다르다고 늘 말한다.'],
    ],
  });
  ch('slowpoke', {
    name: '느림보 영감', title: '연못 낚시꾼', color: '#a8d8e8', voice: 0.65,
    look: { hair: 'cap', hc: '#9a9a9a', top: '#5a7a9a', bottom: '#4a4a5a', acc: '#c8b890' },
    face: { hair: 'cap', hc: '#9a9a9a', top: '#5a7a9a', ac: '#c8b890', eyes: 'sleepy', acc: ['beard', 'wrinkle'] },
    bio: [['40년째 같은 자리에서 낚시를 한다. 한 번도 물고기를 잡은 적이 없다. 잡을 생각도 없다.']],
  });
  ch('clerk_g', {
    name: '심사관 또박', title: '그린 마을 등급소', color: '#d8d8ff', voice: 1.05,
    look: { hair: 'short', hc: '#2a2a3a', top: '#3a4a7a', bottom: '#2a2a3a' },
    face: { hair: 'slick', hc: '#2a2a3a', top: '#3a4a7a', acc: ['glasses'], mouth: 'flat', collar: '#ffffff' },
    bio: [['또박또박 말하고 또박또박 도장을 찍는다. 등급 심사관 시험에 일곱 번 떨어지고 여덟 번째에 붙었다.']],
  });

  /* ───────── 레드 마을 ───────── */
  ch('hwaro', {
    name: '볼칸 아저씨', title: '불꽃 대장간 주인', color: '#ff9a6a', voice: 0.75,
    look: { hair: 'bald', hc: '#c8402c', top: '#8a3a2a', bottom: '#3a2a22', skin: '#e8b890' },
    face: { hair: 'bald', hc: '#c8402c', top: '#8a3a2a', skin: '#e8b890', acc: ['headband', 'beard'], ac: '#ffd84a', eyes: 'sharp' },
    bio: [
      ['레드 마을 제일의 대장장이. 망치를 한 번 내리칠 때마다 「렙업!」을 외친다.'],
      ['징수탑이 선 뒤 망치질로 쌓은 경험의 삼 할을 떼인다. 그래서 망치를 네 할 더 세게 친다.'],
      ['젊은 시절 초록 창 에벨린의 창을 벼린 사람이다.', 'm_red_rud'],
    ],
  });
  ch('rud', {
    name: '루드', title: '징수 기사단 견습', color: '#ff7a6a', voice: 0.95,
    look: { hair: 'spiky', hc: '#d8402a', top: '#3a3a4a', bottom: '#2a2a32', acc: '#c8c8d0' },
    face: { hair: 'spiky', hc: '#d8402a', top: '#3a3a4a', eyes: 'sharp', ec: '#a83a2a', acc: ['scar'], mouth: 'flat', collar: '#c8c8d0' },
    bio: [
      ['레드 마을의 징수 기사 견습. 붉은 머리, 뺨의 흉터. 「숫자는 거짓말 안 해.」'],
      ['빛바램병에 걸린 쌍둥이 동생 루카와 루미의 약값 때문에 기사단에 들어갔다.', (s) => s.quests.q_herb != null],
      ['{n}에게 진 뒤 기사단에서 쫓겨났다. 그래도 숫자를 세는 버릇은 못 버렸다.', 'm_red_rud'],
      ['누나 레아가 새벽단 단장이라는 사실을 가장 늦게 알았다.', 'm_rainbow_lea'],
    ],
  });
  ch('luka', {
    name: '루카', title: '루드의 동생', color: '#d8c8c8', voice: 1.5,
    look: { hair: 'short', hc: '#b8b0b0', top: '#8a5a5a', bottom: '#4a3a3a', skin: '#f0dcc8' },
    face: { hair: 'messy', hc: '#c0b8b8', top: '#8a5a5a', skin: '#f0dcc8', eyes: 'big', ec: '#8a6a6a', acc: ['pale'] },
    bio: [['루드의 쌍둥이 동생. 빛바램병으로 붉던 머리칼이 잿빛이 되었다. 형이 최고라고 믿는다.']],
  });
  ch('rumi', {
    name: '루미', title: '루드의 동생', color: '#e8d0d0', voice: 1.55,
    look: { hair: 'long', hc: '#b8b0b0', top: '#a86a6a', bottom: '#4a3a3a', skin: '#f0dcc8' },
    face: { hair: 'long', hc: '#c0b8b8', top: '#a86a6a', skin: '#f0dcc8', eyes: 'big', ec: '#8a6a6a', acc: ['pale'], blush: true },
    bio: [['루카의 쌍둥이. 형보다 먼저 태어났다고 우기지만 증거는 없다. 그림을 그리는데, 색이 없는 그림이다.']],
  });
  ch('galaxy', {
    name: '아스텔 박사', title: '붉은 산 관측소장', color: '#a8c8ff', voice: 0.8,
    look: { hair: 'afro', hc: '#f0f0f0', top: '#2a3a6a', bottom: '#2a2a3a' },
    face: { hair: 'messy', hc: '#f0f0f0', top: '#2a3a6a', acc: ['glasses', 'longbeard', 'wrinkle'], gc: '#c8a040', eyes: 'dot' },
    bio: [
      ['붉은 산 꼭대기 관측소에서 50년째 하늘만 보는 천문학자. 낮에 잔다.'],
      ['에벨린 할머니의 오랜 친구. 둘은 만나면 3분 안에 싸운다.'],
      ['16년 전, 황금별 옆에서 검은 점이 사라지는 것을 관측한 유일한 사람.', 'm_red_galaxy'],
    ],
  });
  ch('ddeok', {
    name: '떡볶이 할매', title: '화산 떡볶이 원조', color: '#ff8a8a', voice: 0.78,
    look: { hair: 'bun', hc: '#e8e0e0', top: '#c83a3a', bottom: '#4a3a3a' },
    face: { hair: 'bun', hc: '#e8e0e0', top: '#c83a3a', acc: ['wrinkle'], eyes: 'narrow', mouth: 'smirk' },
    bio: [['화산 떡볶이 원조집 할머니. 「맵다」고 하면 한 국자 더 준다. 「안 맵다」고 하면 두 국자 더 준다.']],
  });
  ch('gokgwang', {
    name: '광부 대장 곡괭이', title: '황금 광산 전 광부 대장', color: '#ffd870', voice: 0.72,
    look: { hair: 'helmet', hc: '#3a2a1a', top: '#6a5a3a', bottom: '#3a3a3a', acc: '#ffd84a' },
    face: { hair: 'helmet', hc: '#3a2a1a', top: '#6a5a3a', ac: '#e8c040', acc: ['beard'], eyes: 'dot' },
    bio: [
      ['황금 광산의 마지막 광부 대장. 광산이 닫힌 뒤 떡볶이집 구석에서 하루를 보낸다.'],
      ['광산 비밀번호를 걸어 잠근 것도 그다. 「별을 아는 놈만 들어와라.」'],
    ],
  });
  ch('clerk_r', {
    name: '심사관 불똥', title: '레드 마을 등급소', color: '#ffb8a8', voice: 1.1,
    look: { hair: 'short', hc: '#8a2a1a', top: '#8a3a3a', bottom: '#2a2a2a' },
    face: { hair: 'side', hc: '#8a2a1a', top: '#8a3a3a', mouth: 'open', eyes: 'dot', collar: '#ffffff' },
    bio: [['성격이 급하다. 서류를 다 읽기 전에 도장부터 찍는다. 다행히 늘 맞는 서류다.']],
  });
  ch('lea', {
    name: '레아', title: '새벽단 단장', color: '#ffa87a', voice: 0.95,
    look: { hair: 'pony', hc: '#c8402a', top: '#5a3a2a', bottom: '#2a2a32', acc: '#ffd84a' },
    face: { hair: 'pony', hc: '#c8402a', top: '#5a3a2a', eyes: 'sharp', ec: '#c86a2a', acc: ['earring'], mouth: 'smirk', collar: '#e8c888' },
    bio: [
      ['징수탑을 부수고 다니는 저항 조직 새벽단의 단장. 탑 하나를 부술 때마다 흉터가 하나 는다.'],
      ['전 징수 기사. 983년 첫 징수의 날, 제 손으로 첫 경험을 걷고 그날 밤 기사단을 떠났다.', 'm_rainbow_lea'],
      ['루드의 누나. 동생을 두고 떠난 것을 평생의 빚으로 여긴다.', 'm_rainbow_lea'],
    ],
  });

  /* ───────── 블루 마을 ───────── */
  ch('haemi', {
    name: '헤미아', title: '블루 대도서관 사서', color: '#8ad8e8', voice: 1.2,
    look: { hair: 'long', hc: '#2a3a5a', top: '#3a8a9a', bottom: '#2a3a4a' },
    face: { hair: 'bob', hc: '#2a3a5a', top: '#3a8a9a', acc: ['glasses'], gc: '#6a4a2a', eyes: 'big', ec: '#3a6aa8', mouth: 'wave' },
    bio: [
      ['대도서관의 막내 사서. 말을 더듬지만 책 이야기를 할 때만은 한 번도 더듬지 않는다.'],
      ['수수께끼를 좋아한다. 대도서관의 모든 잠긴 서고는 헤미아가 낸 수수께끼로 잠겨 있다.'],
      ['세린이 대도서관에 마지막으로 책을 반납한 날, 헤미아는 여섯 살이었다. 그 책의 대출 카드를 아직 가지고 있다.', 'm_blue_book'],
    ],
  });
  ch('mukmul', {
    name: '옥타비오 관장', title: '블루 대도서관장', color: '#d0a8ff', voice: 0.7,
    look: 'octopus', face: { special: 'octopus' },
    bio: [
      ['대도서관장. 안경 쓴 문어 학자. 여덟 다리로 여덟 권을 동시에 읽는다.'],
      ['놀라면 먹물을 뿜는다. 도서관 책 몇 권은 먹물 자국이 남아 있고, 그걸 「관장의 주석」이라 부른다.'],
      ['세린에게 「무한의 그릇」을 연구하라고 권한 사람. 그 일을 후회하고 있다.', 'm_blue_book'],
    ],
  });
  ch('bitna', {
    name: '루체', title: '등대지기의 딸', color: '#ffe070', voice: 1.25,
    look: { hair: 'short', hc: '#3a2a1a', top: '#ffd84a', bottom: '#3a5a8a', acc: '#ffd84a' },
    face: { hair: 'side', hc: '#3a2a1a', top: '#ffd84a', eyes: 'big', ec: '#3a5a8a', mouth: 'open', acc: ['freckle'] },
    bio: [
      ['블루 등대의 불을 혼자 지키는 열다섯 살. 아버지는 3년 전 「검은 별」을 쫓아 바다로 나갔다.'],
      ['우비는 아버지 것이다. 소매를 네 번 접었다.'],
      ['아버지의 항해일지를 {n}에게 맡겼다. 「대신 끝까지 가 줘.」', 'q_bitna_done'],
    ],
  });
  ch('jjanmul', {
    name: '짠물 영감', title: '블루 항구의 늙은 어부', color: '#a8c8e8', voice: 0.7,
    look: { hair: 'cap', hc: '#e8e8e8', top: '#3a5a7a', bottom: '#2a3a4a', acc: '#e8e0c8' },
    face: { hair: 'cap', hc: '#e8e8e8', top: '#3a5a7a', ac: '#e8e0c8', acc: ['beard', 'wrinkle'], eyes: 'narrow', mouth: 'smirk' },
    bio: [['자기가 고래를 세 번 삼켰다고 주장한다. 고래가 아니라 자기가 삼켰다고.']],
  });
  ch('captain', {
    name: '가브 선장', title: '연락선 「고등어호」 선장', color: '#9ab8e8', voice: 0.8,
    look: { hair: 'cap', hc: '#2a2a2a', top: '#f4f4f4', bottom: '#2a3a6a', acc: '#2a3a6a' },
    face: { hair: 'cap', hc: '#2a2a2a', top: '#f4f4f4', ac: '#2a3a6a', acc: ['beard'], eyes: 'sharp', collar: '#ffd84a' },
    bio: [['블루와 옐로를 잇는 연락선의 선장. 뱃멀미를 한다. 30년째.']],
  });
  ch('clerk_b', {
    name: '심사관 물결', title: '블루 마을 등급소', color: '#a8d8ff', voice: 1.0,
    look: { hair: 'long', hc: '#4a6a9a', top: '#2a5a8a', bottom: '#2a2a3a' },
    face: { hair: 'long', hc: '#4a6a9a', top: '#2a5a8a', eyes: 'narrow', mouth: 'smile', collar: '#ffffff' },
    bio: [['말끝을 늘 길게 늘인다아. 심사도 기일게 한다아.']],
  });

  /* ───────── 옐로 마을 ───────── */
  ch('kkachi', {
    name: '피카', title: '그늘 참새단 두목', color: '#e8e8a0', voice: 1.35,
    look: { hair: 'spiky', hc: '#1a1a22', top: '#c87a3a', bottom: '#5a4a3a', acc: '#e84a4a' },
    face: { hair: 'messy', hc: '#1a1a22', top: '#c87a3a', eyes: 'sharp', ec: '#6a5a2a', acc: ['freckle', 'bandage'], mouth: 'smirk' },
    bio: [
      ['옐로 그늘 골목의 소매치기. 열두 살. 고아들의 「그늘 참새단」을 먹여 살린다.'],
      ['훔친 물건의 삼 할은 반드시 돌려준다. 「우린 징수 기사가 아니거든.」'],
      ['골디가 어린 시절 살던 그 방에서 산다. 벽에 「언젠가 금화왕」이라고 새긴 낙서가 있다.', 'm_yellow_goldie'],
    ],
  });
  ch('goldie', {
    name: '금화왕 골디', title: '사천왕 · 노랑의 자리', color: '#ffd84a', voice: 0.9,
    look: { hair: 'short', hc: '#e8c040', top: '#c89a28', bottom: '#5a3a1a', acc: '#ffffff' },
    face: { hair: 'slick', hc: '#e8c040', top: '#c89a28', acc: ['monocle'], eyes: 'narrow', mouth: 'smirk', collar: '#ffffff' },
    bio: [
      ['옐로 마을의 주인이자 대륙 경험 거래소의 주인. 「공짜는 없어, 꼬마.」'],
      ['그늘 골목 빈민가에서 태어나 어린 시절의 경험을 팔아 끼니를 이었다.', 'm_yellow_goldie'],
      ['가난한 사람의 경험을 사서 부자에게 판다. 이자는 정직하게 받는다. 그게 그가 아는 유일한 정의다.', 'm_yellow_goldie'],
      ['세린에게 첫 동전을 빌렸다. 아직 갚지 못했다.', 'm_yellow_bond'],
    ],
  });
  ch('lucky', {
    name: '딜러 럭키', title: '황금궁 카지노', color: '#ffe8a0', voice: 1.0,
    look: { hair: 'short', hc: '#3a2a1a', top: '#2a2a2a', bottom: '#2a2a2a', acc: '#e84a4a' },
    face: { hair: 'slick', hc: '#3a2a1a', top: '#2a2a2a', eyes: 'narrow', mouth: 'smirk', collar: '#e84a4a' },
    bio: [['카지노의 딜러. 운은 믿지 않는다. 확률을 믿는다. 그리고 확률은 늘 카지노 편이다.']],
  });
  ch('sahara', {
    name: '사하라', title: '사막 대상단장', color: '#f0c080', voice: 0.9,
    look: { hair: 'hood', hc: '#3a2a1a', top: '#c8905a', bottom: '#8a6a4a', acc: '#e8d0a0' },
    face: { hair: 'hood', hc: '#3a2a1a', top: '#c8905a', ac: '#e8d0a0', eyes: 'sharp', ec: '#3a8a8a', skin: '#d8a878', acc: ['earring'] },
    bio: [['사막을 서른 번 건넌 대상단장. 별을 보고 길을 찾는다. 사람도 별로 비유한다.']],
  });
  ch('clerk_y', {
    name: '심사관 금전', title: '옐로 마을 등급소', color: '#ffe8a8', voice: 1.05,
    look: { hair: 'short', hc: '#6a4a1a', top: '#c8a040', bottom: '#3a2a1a' },
    face: { hair: 'slick', hc: '#6a4a1a', top: '#c8a040', mouth: 'smile', eyes: 'narrow', collar: '#ffffff', acc: ['monocle'] },
    bio: [['심사비 영수증을 세 장씩 끊어 준다. 한 장은 골디에게, 한 장은 본인에게, 한 장은 액자에.']],
  });

  /* ───────── 퍼플 마을 ───────── */
  ch('vera', {
    name: '베라 교수', title: '라벤더 학원 마법 교수', color: '#d8b0ff', voice: 0.95,
    look: { hair: 'witch', hc: '#b8a0d8', top: '#5a3a8a', bottom: '#3a2a5a', acc: '#3a2a5a' },
    face: { hair: 'witch', hc: '#c8b0e0', top: '#5a3a8a', ac: '#3a2a5a', acc: ['glasses'], gc: '#c8a040', eyes: 'narrow', mouth: 'smirk' },
    bio: [
      ['라벤더 학원의 마법 교수. 늘 찻잔을 들고 다닌다. 차는 대부분 식어 있다.'],
      ['세린의 스승. 학원에 흰빛의 제자가 들어온 날, 그녀는 찻잔을 떨어뜨렸다. 처음이자 마지막으로.', 'm_purple_vera'],
      ['16년 동안 세린의 연구실을 청소만 하고 아무것도 치우지 않았다.', 'm_purple_vision'],
    ],
  });
  ch('miru', {
    name: '미레아', title: '라벤더 학원 낙제생', color: '#e0c0ff', voice: 1.3,
    look: { hair: 'hood', hc: '#6a4a8a', top: '#8a6ab0', bottom: '#3a2a5a', acc: '#8a6ab0' },
    face: { hair: 'hood', hc: '#6a4a8a', top: '#8a6ab0', ac: '#8a6ab0', eyes: 'big', ec: '#8a4ad8', mouth: 'wave', blush: true },
    bio: [['라벤더 학원 7년 차 1학년. 주문을 외우면 늘 한 글자씩 틀린다. 그래서 불 대신 풀이, 풀 대신 불이 나온다.']],
  });
  ch('bichu', {
    name: '시빌 할멈', title: '진실의 거울 연못지기', color: '#e8e0ff', voice: 0.66,
    look: { hair: 'veil', hc: '#e8e8f0', top: '#6a5a8a', bottom: '#3a2a5a', acc: '#8a7ab0' },
    face: { hair: 'veil', hc: '#e8e8f0', top: '#6a5a8a', ac: '#8a7ab0', eyes: 'closed', acc: ['wrinkle'], mouth: 'flat' },
    bio: [['앞을 보지 못한다. 대신 거울 연못에 비친 것만은 누구보다 잘 본다. 「눈이 보는 건 겉이고, 물이 보는 건 속이다.」']],
  });
  ch('clerk_p', {
    name: '심사관 보랏빛', title: '퍼플 마을 등급소', color: '#e0c8ff', voice: 1.0,
    look: { hair: 'long', hc: '#4a2a6a', top: '#6a4a9a', bottom: '#2a2a3a' },
    face: { hair: 'long', hc: '#4a2a6a', top: '#6a4a9a', eyes: 'sleepy', mouth: 'flat', collar: '#ffffff' },
    bio: [['심사 결과를 시로 읊는다. 불합격도 시로 읊는다. 그래서 더 아프다.']],
  });

  /* ───────── 무지개 마을 ───────── */
  ch('lolo', {
    name: '롤로', title: '무지개 서커스의 광대', color: '#ffb0e0', voice: 1.1,
    look: { hair: 'afro', hc: '#c8c8c8', top: '#e84a8a', bottom: '#4a4ae8', acc: '#ffd84a', skin: '#f4f0f0' },
    face: { hair: 'afro', hc: '#c8c8c8', top: '#e84a8a', skin: '#f4f0f0', acc: ['paint'], eyes: 'dot', mouth: 'open' },
    bio: [
      ['무지개 서커스의 광대. 빛바램병으로 몸의 색을 잃어 얼굴에 색을 칠하고 산다.'],
      ['「웃음은 색이 없어도 보여.」 그의 공연은 늘 그 말로 끝난다.'],
      ['{n}의 흰빛을 나눠 받고, 16년 만에 제 머리칼 색을 보았다. 분홍색이었다.', 'm_rainbow_share'],
    ],
  });
  ch('chaesaek', {
    name: '크로마 위원장', title: '천년제 준비 위원장', color: '#c8f0a8', voice: 0.85,
    look: { hair: 'bun', hc: '#ff8ab0', top: '#8ae08a', bottom: '#8a8ae8' },
    face: { hair: 'bun', hc: '#ff8ab0', top: '#8ae08a', eyes: 'dot', mouth: 'open', acc: ['wrinkle', 'earring'] },
    bio: [['천년제 준비 위원장. 999년 동안 이 날을 기다려 왔다고 한다. 실제 나이는 87세.']],
  });
  ch('mungge', {
    name: '누베', title: '구름고래', color: '#bfe4ff', voice: 0.55,
    look: 'whale', face: { special: 'whale' },
    bio: [['구름 바다를 헤엄치는 고래. 등 위에 작은 섬이 있다. 말이 아주 느리다. 한 문장에 반나절.']],
  });
  ch('clerk_rb', {
    name: '심사관 일곱빛', title: '무지개 마을 등급소', color: '#ffe0ff', voice: 1.15,
    look: { hair: 'pony', hc: '#ff7a7a', top: '#7ab8ff', bottom: '#ffd84a' },
    face: { hair: 'pony', hc: '#ff7a7a', top: '#7ab8ff', eyes: 'big', mouth: 'open', collar: '#ffffff', blush: true },
    bio: [['도장을 일곱 가지 색으로 찍는다. 기분에 따라.']],
  });

  /* ───────── 화이트 마을 ───────── */
  ch('lumie', {
    name: '성녀 루미에', title: '사천왕 · 하양의 자리', color: '#fff4d0', voice: 1.05,
    look: { hair: 'veil', hc: '#f0e8d0', top: '#f4f4f8', bottom: '#d8e0ea', acc: '#ffffff' },
    face: { hair: 'veil', hc: '#f0e8d0', top: '#f4f4f8', ac: '#f8f8ff', eyes: 'closed', mouth: 'smile', acc: ['halo'] },
    bio: [
      ['이리스 대성당의 성녀. 병자를 공짜로 고친다. 눈을 감고 있어도 모든 것을 본다고 한다.'],
      ['983년의 진실을 아는 몇 안 되는 사람. 세린의 희생을 여신의 뜻이라 믿는다.', 'm_white_truth'],
      ['「누군가의 희생으로 모두가 산다면, 그건 사랑이에요.」 그녀는 그 말을 16년째 스스로에게 하고 있다.', 'm_white_lumie'],
    ],
  });
  ch('edel', {
    name: '에델', title: '백은 기사', color: '#d8e8ff', voice: 0.85,
    look: { hair: 'helmet', hc: '#c8d0dc', top: '#e8eef8', bottom: '#9aa4ae', acc: '#c8d0dc' },
    face: { hair: 'helmet', hc: '#c8d0dc', top: '#e8eef8', ac: '#c8d0dc', eyes: 'sharp', ec: '#6ab0e0', mouth: 'flat', cape: true },
    bio: [
      ['루미에를 지키는 백은 기사. 「~하오」 체를 쓴다. 한 번도 투구를 벗은 적이 없다.'],
      ['어릴 적 빛바램병으로 죽어 가던 것을 루미에가 살렸다. 그래서 그녀의 모든 명령을 따른다. 거의.', 'm_white_edel'],
    ],
  });
  ch('snowflake', {
    name: '니베', title: '설원의 아이', color: '#e8f4ff', voice: 1.5,
    look: { hair: 'hood', hc: '#8a6a4a', top: '#ff8a8a', bottom: '#6a8ab0', acc: '#ffffff' },
    face: { hair: 'hood', hc: '#8a6a4a', top: '#ff8a8a', ac: '#ffffff', eyes: 'big', blush: true, mouth: 'open' },
    bio: [['화이트 마을의 아이. 눈싸움에서 한 번도 진 적이 없다. 상대가 봐주기 때문이라는 걸 모른다.']],
  });
  ch('clerk_w', {
    name: '심사관 고요', title: '화이트 마을 등급소', color: '#f0f8ff', voice: 0.9,
    look: { hair: 'short', hc: '#d8d8e0', top: '#c8d6ea', bottom: '#8a9aae' },
    face: { hair: 'short', hc: '#d8d8e0', top: '#c8d6ea', eyes: 'closed', mouth: 'flat', collar: '#ffffff' },
    bio: [['속삭이듯 말한다. 심사 중에 기침을 하면 처음부터 다시 한다.']],
  });

  /* ───────── 그레이 마을 ───────── */
  ch('bolt', {
    name: '강철공 볼트', title: '사천왕 · 회색의 자리', color: '#c8d0dc', voice: 0.7,
    look: { hair: 'short', hc: '#8a8a8a', top: '#5a6478', bottom: '#3a3a44', acc: '#ffd84a' },
    face: { hair: 'messy', hc: '#9a9a9a', top: '#5a6478', acc: ['goggles', 'mustache'], ac: '#6a5a4a', gc: '#8a6a3a', eyes: 'narrow', mouth: 'flat' },
    bio: [
      ['잿빛 제국 기술자의 후손. 「쓸데없는 말은 연료 낭비다.」'],
      ['징수탑을 설계했다. 아내를 빛바램병으로 잃은 해에.', 'm_gray_bolt'],
      ['흑점을 쏠 거대한 빛의 대포를 만들고 있었다. 그것이 흑점을 부르는 등대인 줄 모르고.', 'm_gray_truth'],
    ],
  });
  ch('noel', {
    name: '세피아', title: '로봇 소녀 N-07', color: '#ffc890', voice: 1.3,
    look: { hair: 'robot', hc: '#c8d0dc', top: '#e88a5a', bottom: '#8a96aa', acc: '#c8d0dc', eye: '#ffb86a' },
    face: { special: 'robot' },
    bio: [
      ['볼트가 만든 일곱 번째 로봇. 이름은 볼트의 아내가 좋아하던 하늘에서 따왔다.'],
      ['눈에 색을 구별하는 부품이 없다. 그래서 색을 모으고 있다. 병에 담아서.'],
      ['{n}이 모아 온 색을 처음 「보았」을 때, 세피아는 3분 동안 멈춰 있었다. 과부하가 아니었다.', 'q_noel_done'],
    ],
  });
  ch('rusty', {
    name: '녹슬이', title: '고철 시장 상인', color: '#d8a878', voice: 0.95,
    look: { hair: 'cap', hc: '#4a3a2a', top: '#8a5a3a', bottom: '#3a3a3a', acc: '#6a6a70' },
    face: { hair: 'cap', hc: '#4a3a2a', top: '#8a5a3a', ac: '#6a6a70', acc: ['freckle'], eyes: 'dot', mouth: 'open' },
    bio: [['고철을 판다. 고철을 산다. 고철로 만든 의자에 앉아 고철로 만든 컵으로 차를 마신다.']],
  });
  ch('clerk_gr', {
    name: '심사관 톱니', title: '그레이 마을 등급소', color: '#d8dce0', voice: 0.9,
    look: { hair: 'short', hc: '#5a5a5a', top: '#6a6a70', bottom: '#3a3a3a' },
    face: { hair: 'slick', hc: '#5a5a5a', top: '#6a6a70', acc: ['goggles'], ac: '#4a4a50', eyes: 'dot', mouth: 'flat' },
    bio: [['반은 기계다. 어느 반인지는 본인도 헷갈린다.']],
  });

  /* ───────── 블랙 마을 ───────── */
  ch('midnight', {
    name: '미드나잇', title: '밤의 정보상', color: '#e8d0ff', voice: 0.9,
    look: 'cat', face: { special: 'cat' },
    bio: [
      ['블랙 마을의 검은 고양이 정보상. 실크해트를 쓴다. 천 년을 살았다는 소문이 있다.'],
      ['값은 늘 「황금 고등어」로 받는다. 돈으로 받으면 거래가 된다나. 생선으로 받으면 우정이 되고.'],
      ['아우룸의 고양이였다는 소문도 있다. 본인은 부정하지 않는다. 긍정도 안 한다.', 'm_black_midnight'],
    ],
  });
  ch('nocturne', {
    name: '그림자 녹턴', title: '사천왕 · 검정의 자리', color: '#b8a8d8', voice: 0.78,
    look: { hair: 'long', hc: '#1a1626', top: '#2a2440', bottom: '#1a1626', acc: '#8a1a3a' },
    face: { hair: 'long', hc: '#1a1626', top: '#2a2440', acc: ['mask'], eyes: 'narrow', ec: '#ff3a5a', mouth: 'flat', collar: '#8a1a3a' },
    bio: [
      ['천년성을 지키는 사천왕. 말이 거의 없다. 「카이론의 그림자」라고 불린다.'],
      ['카이론의 소꿉친구. 983년 아스트라에서 세린이 잠드는 것을 함께 보았다.', 'm_black_nocturne'],
      ['그가 바라는 것은 하나뿐이다. 카이론이 무너지지 않는 것.', 'm_black_nocturne'],
    ],
  });
  ch('horong', {
    name: '칸델 영감', title: '등불지기', color: '#ffe08a', voice: 0.72,
    look: { hair: 'cap', hc: '#6a6a6a', top: '#3a3450', bottom: '#2a2438', acc: '#ffd86a' },
    face: { hair: 'cap', hc: '#6a6a6a', top: '#3a3450', ac: '#5a4a2a', acc: ['beard', 'wrinkle'], eyes: 'sleepy' },
    bio: [['블랙 마을 등불 거리의 등불을 켜는 노인. 해가 뜨지 않는 마을이라 퇴근을 못 한다.']],
  });
  ch('clerk_bk', {
    name: '심사관 그늘', title: '블랙 마을 등급소', color: '#c8c0e0', voice: 0.85,
    look: { hair: 'hood', hc: '#2a2438', top: '#3a3450', bottom: '#1a1626', acc: '#2a2438' },
    face: { hair: 'hood', hc: '#2a2438', top: '#3a3450', ac: '#2a2438', eyes: 'narrow', mouth: 'flat' },
    bio: [['속삭이면서 심사한다. 결과도 속삭인다. 합격인지 알아듣는 데 5분 걸린다.']],
  });

  /* ───────── 알록달록 마을 ───────── */
  ch('pangpang', {
    name: '피로스 박사', title: '폭발 발명가', color: '#ffa0d0', voice: 1.05,
    look: { hair: 'afro', hc: '#3a2a2a', top: '#f4f4f4', bottom: '#5a5a8a', acc: '#ffd84a' },
    face: { hair: 'afro', hc: '#3a2a2a', top: '#f4f4f4', acc: ['goggles'], ac: '#e84a4a', gc: '#ffd84a', eyes: 'big', mouth: 'open', collar: '#e8e8f0' },
    bio: [
      ['알록달록 마을의 발명가. 발명품의 97%가 폭발한다. 나머지 3%는 나중에 폭발한다.'],
      ['평생 로켓 「무한호」를 만들고 있다. 하늘 정거장에 가 보는 게 꿈이다.'],
      ['세린에게 「하늘에 가는 법」을 약속했었다. 16년 늦었다.', 'launched'],
    ],
  });
  ch('ppeong', {
    name: '봄바', title: '피로스 박사의 조수', color: '#ffe0a0', voice: 1.4,
    look: { hair: 'spiky', hc: '#ff8a3a', top: '#5ae8a8', bottom: '#3a3a8a', acc: '#ffffff' },
    face: { hair: 'spiky', hc: '#ff8a3a', top: '#5ae8a8', eyes: 'big', mouth: 'open', acc: ['freckle', 'bandage'] },
    bio: [['피로스 박사의 조수. 과장이 심하다. 폭발이 「조금」 났다고 하면 마을 절반이 날아간 것이다.']],
  });
  ch('clerk_c', {
    name: '심사관 아무나', title: '알록달록 마을 등급소', color: '#ffe0c8', voice: 1.1,
    look: { hair: 'messy', hc: '#5ae8a8', top: '#ff8a5a', bottom: '#5a5ae8' },
    face: { hair: 'messy', hc: '#5ae8a8', top: '#ff8a5a', eyes: 'dot', mouth: 'open', collar: '#ffffff' },
    bio: [['알록달록 마을은 등급 따위 신경 안 쓴다. 그래서 심사관도 아무나 한다. 오늘은 이 사람이다.']],
  });

  /* ───────── 하늘 · 아스트라 ───────── */
  ch('stella', {
    name: '스텔라', title: '하늘 정거장 인공지능', color: '#8af0ff', voice: 1.2,
    look: { creature: 'drone', tint: '#8a96aa' }, face: { special: 'screen' },
    bio: [
      ['잿빛 제국이 쏘아 올린 하늘 정거장의 관리 인공지능. 400년 동안 혼자였다.'],
      ['말에 가시가 돋쳐 있다. 400년 동안 대화 상대가 경비 드론뿐이었으니 이해해 주자.'],
      ['흑점을 처음 발견하고 경고를 보낸 것도 스텔라였다. 612년에. 아무도 듣지 않았다.', 'm_space_truth'],
    ],
  });
  ch('kairon', {
    name: '카이론', title: '챔피언 · 대륙의 절대 강자', color: '#fff0a8', voice: 0.8,
    look: { hair: 'long', hc: '#e8e0c8', top: '#e8eef8', bottom: '#c8a030', acc: '#ffd84a' },
    face: { hair: 'long', hc: '#e8e0c8', top: '#e8eef8', acc: ['star'], eyes: 'sharp', ec: '#c8a030', mouth: 'flat', cape: true, ac: '#c8a030', collar: '#ffd84a' },
    bio: [
      ['레벨 99만 9999. 역대 최연소 챔피언. 16년째 경험세를 거두는 사람.'],
      ['「나는 이미 모든 것을 계산했다.」 그가 계산하지 못한 것은 한 가지뿐이다.', 'm_black_kairon'],
      ['에벨린의 제자, 녹턴의 친구, 세린의 동료. 983년 이후 한 번도 잠들지 않았다.', 'm_black_nocturne'],
      ['그의 계획: 봉인이 풀리기 전에 흑점을 없앤다. 실패하면 세린의 아이를 새 봉인으로 삼는다.', 'm_black_kairon'],
    ],
  });
  ch('serin', {
    name: '세린', title: '흰빛의 그릇', color: '#ffffff', voice: 1.0,
    look: { hair: 'long', hc: '#f4f0e8', top: '#f4f4f8', bottom: '#d8e0ea', acc: '#ffffff' },
    face: { hair: 'long', hc: '#f4f0e8', top: '#f4f4f8', eyes: 'big', ec: '#3a8a4a', mouth: 'smile', collar: '#ffffff' },
    bio: [
      ['{n}의 어머니. 천 년 동안 세 명뿐이었던 흰빛의 사람 가운데 하나.', 'm_blue_book'],
      ['「성장은 나누는 거야.」 라벤더 학원 시절 그녀의 논문 첫 문장.', 'm_purple_vera'],
      ['983년, 흑점을 제 몸에 삼켜 아스트라의 수정 속에 잠들었다. 봉인은 16년짜리였다.', 'm_purple_vision'],
    ],
  });
  ch('aurum', {
    name: '아우룸', title: '초대 챔피언', color: '#ffe066', voice: 0.9,
    look: { hair: 'crown', hc: '#e8c040', top: '#fff0a8', bottom: '#c89a38', acc: '#ffd84a' },
    face: { hair: 'crown', hc: '#e8c040', top: '#fff0a8', ac: '#ffd84a', eyes: 'big', ec: '#c8a030', mouth: 'smile', cape: true },
    bio: [
      ['이름 없는 국경 마을의 소년. 흰빛으로 레벨 100만에 이르러 색 전쟁을 끝냈다.'],
      ['등급 제도를 만들고, 인장을 구슬로 쪼개 대륙 곳곳에 숨겼다. 「스스로 걸어서 모은 자만이 오른다.」'],
      ['시작의 버튼을 만든 사람. 버튼에 새긴 글귀의 A는 그의 이름이다.', 'm_button'],
    ],
  });
  ch('treant', { name: '속삭임의 나무 정령', title: '속삭이는 숲의 주인', color: '#b8e8a0', voice: 0.5, look: { creature: 'slime', tint: '#5aa84a' }, face: { special: 'tree' }, bio: [['천 년 동안 숲의 수다를 들어 왔다.']] });
  ch('golem', { name: '징수 골렘', title: '징수탑 경비 장치', color: '#c8b8ff', voice: 0.45, look: { creature: 'drone', tint: '#8a7ab0' }, face: { special: 'golem' }, bio: [['「경험. 납부. 하시오.」']] });
  ch('sphinx', { name: '스핑크스', title: '태양 피라미드의 수호자', color: '#ffe08a', voice: 0.55, look: { creature: 'beast', tint: '#e8c860' }, face: { mon: 'sphinx' }, bio: [['수수께끼를 내고, 답을 맞혀도 싸운다.']] });
  ch('kraken', { name: '새끼 크라켄', title: '해저 동굴의 주인', color: '#d0a8ff', voice: 0.5, look: 'octopus', face: { mon: 'kraken' }, bio: [['아직 새끼라 다리가 여덟 개밖에 없다.']] });
  ch('moleking', { name: '황금 두더지왕', title: '광산의 왕', color: '#ffe08a', voice: 0.6, look: { creature: 'beast', tint: '#ffd84a' }, face: { mon: 'moleking' }, bio: [['광차 바퀴로 만든 왕관을 쓰고 있다.']] });
  ch('blacksun', { name: '흑점', title: '빛을 먹는 떠돌이 어둠', color: '#ff5a7a', voice: 0.4, look: { creature: 'ghost', tint: '#1a1030' }, face: { special: 'blacksun' },
    bio: [['빛이 한곳에 짙게 모인 세계를 냄새 맡고 찾아와 모든 색을 삼킨다.'], ['흑점을 부르는 것은 빛의 양이 아니라 쏠림이다.', 'm_gray_truth']] });

  /* ───────── 이름 없는 사람들 · 괴물 ───────── */
  const extras = {
    villager: ['마을 사람', { hair: 'short', hc: '#5a3a22', top: '#8a9a6a', bottom: '#5a4a3a' }],
    villager2: ['마을 사람', { hair: 'long', hc: '#3a2a1a', top: '#c86a8a', bottom: '#5a4a6a' }],
    oldman: ['할아버지', { hair: 'bald', hc: '#c8c8c8', top: '#7a6a5a', bottom: '#4a4a4a' }],
    oldwoman: ['할머니', { hair: 'bun', hc: '#c8c8c8', top: '#9a6a8a', bottom: '#4a3a4a' }],
    kid: ['아이', { hair: 'short', hc: '#4a3a2a', top: '#e8c84a', bottom: '#4a6a9a' }],
    kid2: ['아이', { hair: 'pony', hc: '#6a3a2a', top: '#8ad88a', bottom: '#8a5a9a' }],
    knight: ['징수 기사', { hair: 'helmet', hc: '#3a3450', top: '#6a5a90', bottom: '#3a3450', acc: '#9aa4ae' }],
    smith: ['대장장이', { hair: 'short', hc: '#2a1a12', top: '#8a4a2a', bottom: '#3a2a22', skin: '#e8b890' }],
    sailor: ['선원', { hair: 'cap', hc: '#2a2a2a', top: '#f4f4f4', bottom: '#2a3a6a', acc: '#2a3a6a' }],
    scholar: ['학자', { hair: 'short', hc: '#3a3a5a', top: '#3a6a8a', bottom: '#2a3a4a' }],
    merchant: ['상인', { hair: 'cap', hc: '#3a2a1a', top: '#c89a48', bottom: '#6a4a2a', acc: '#e8483a' }],
    mage: ['마법사', { hair: 'witch', hc: '#8a6ab0', top: '#6a4a9a', bottom: '#3a2a5a', acc: '#4a3a6a' }],
    clown: ['단원', { hair: 'afro', hc: '#ff8a3a', top: '#e84a8a', bottom: '#4a4ae8' }],
    nun: ['수녀', { hair: 'veil', hc: '#3a3a3a', top: '#2a2a3a', bottom: '#2a2a3a', acc: '#f4f4f8' }],
    engineer: ['기술자', { hair: 'cap', hc: '#4a4a4a', top: '#6a7a8a', bottom: '#3a3a44', acc: '#e8a040' }],
    shadow: ['밤의 사람', { hair: 'hood', hc: '#1a1626', top: '#2a2440', bottom: '#1a1626', acc: '#3a3450' }],
    inventor: ['발명가', { hair: 'messy', hc: '#ff5a8a', top: '#f4f4f4', bottom: '#5a5a8a' }],
    dawn: ['새벽단원', { hair: 'hood', hc: '#5a3a2a', top: '#5a3a2a', bottom: '#2a2a32', acc: '#c8402a' }],
    guard: ['경비병', { hair: 'helmet', hc: '#8a8a92', top: '#6a6a78', bottom: '#3a3a44', acc: '#9aa4ae' }],
    innkeeper: ['여관 주인', { hair: 'bob', hc: '#6a3a2a', top: '#f0e0c0', bottom: '#8a5a3a' }],
    clerk: ['심사관', { hair: 'slick', hc: '#2a2a3a', top: '#3a4a7a', bottom: '#2a2a3a' }],
  };
  for (const k in extras) {
    const [name, look] = extras[k];
    ch(k, { name, look, face: Object.assign({}, look, { hair: look.hair === 'helmet' || look.hair === 'witch' || look.hair === 'veil' || look.hair === 'hood' ? look.hair : look.hair === 'cap' ? 'cap' : look.hair, ac: look.acc }), voice: 1, extra: true });
  }
  C.oldman.face.acc = ['beard', 'wrinkle']; C.oldwoman.face.acc = ['wrinkle']; C.knight.face.eyes = 'sleepy';

  G.chars = C;
  /** 인물 사전에 보이는 인물 순서 */
  G.CHAR_ORDER = ['dotori', 'gran', 'kongsun', 'ijang', 'bomi', 'chul', 'dolsoe', 'park', 'hunjang', 'slowpoke', 'clerk_g',
    'hwaro', 'rud', 'luka', 'rumi', 'galaxy', 'ddeok', 'gokgwang', 'lea',
    'haemi', 'mukmul', 'bitna', 'jjanmul', 'captain',
    'kkachi', 'goldie', 'lucky', 'sahara',
    'vera', 'miru', 'bichu',
    'lolo', 'chaesaek', 'mungge',
    'lumie', 'edel', 'snowflake',
    'bolt', 'noel', 'rusty',
    'midnight', 'nocturne', 'horong',
    'pangpang', 'ppeong',
    'stella', 'kairon', 'serin', 'aurum', 'blacksun'];
})();
