/* 등장인물 명부: 이름 · 생김새(스프라이트 · 얼굴이 같은 look을 쓴다) · 이름 색 · 목소리 높이 · 한 줄 소개
   G.cast.get(id) · name(id) · color(id) · voice(id) · met() */
(function () {
  'use strict';
  const G = globalThis.G;
  const C = {};
  const add = (id, o) => { C[id] = Object.assign({ id, voice: 1 }, o); };

  /* ── 주인공 쪽 ── */
  add('toria', { name: '토리아', color: '#f0b070', voice: 1.6, look: { kind: 'squirrel' }, desc: '날지 못하는 하늘다람쥐. 레벨 9에서 16년째 멈춰 있다. 말끝마다 「찍」.' });
  add('evelyn', { name: '에벨린 할머니', color: '#8ae08a', voice: 0.72, desc: '그린 마을 약초꾼. 사투리를 쓴다. 침대 밑에 무언가를 오래도록 두고 산다.',
    look: { gender: 'girl', age: 'old', hair: 'bun', hc: '#d4d0c4', eye: '#5a9a5a', skin: 'light', top: 'robe', tc: '#4a7a4a', trim: '#c8b890', bottom: 'long', bc: '#3a5a3a', glasses: true, acc: ['necklace'], gem: '#6ae07a' } });
  add('serin', { name: '세린', color: '#ffffff', voice: 1.0, desc: '흰빛의 그릇. 아스트라의 수정 속에서 오래 잠들어 있다.',
    look: { gender: 'girl', hair: 'long', hc: '#f4f0e8', eye: '#e8c878', skin: 'fair', top: 'dress', tc: '#f4f4f8', trim: '#e8c878', bottom: 'long', bc: '#e8eef8', eyeShape: 'sleepy', acc: ['necklace'], gem: '#ffffff' } });
  add('kairon', { name: '카이론', color: '#fff0a8', voice: 0.8, desc: '대륙의 챔피언. 레벨 99만 9999. 경험세를 만든 사람.',
    look: { hair: 'long', hc: '#e8e0c8', eye: '#d8a030', eyeShape: 'sharp', skin: 'light', top: 'coat', tc: '#e8eef8', trim: '#e8c048', bottom: 'pants', bc: '#3a3448', boots: '#2a2438', cape: '#7a1a2a', build: 'broad', acc: ['pauldron'] } });
  add('aurum', { name: '아우룸', color: '#ffe066', voice: 0.9, desc: '초대 챔피언. 천 년 전 흰빛으로 전쟁을 끝낸 소년.',
    look: { hair: 'messy', hc: '#f0d060', eye: '#ffe066', top: 'tunic', tc: '#fff0a8', trim: '#e8c048', bottom: 'pants', bc: '#c89a38', cape: '#e8c048' } });

  /* ── 그린 ── */
  add('marien', { name: '마리엔 아줌마', color: '#ffc870', voice: 1.2, desc: '초록 바구니 잡화점 주인. 소문이 제일 빠르다.', look: { gender: 'girl', age: 'old', hair: 'bob', hc: '#5a3a1a', eye: '#a86a3a', top: 'dress', tc: '#e8a84a', trim: '#fff0d0', bottom: 'long', bc: '#8a5a3a' } });
  add('verdex', { name: '베르덱스 이장', color: '#c8e8a0', voice: 0.85, desc: '그린 마을 이장. 징수 장부를 볼 때마다 한숨을 쉰다.', look: { age: 'old', hair: 'bald', hc: '#8a7a6a', beard: '#c8c0b0', eye: '#6a8a4a', top: 'vest', tc: '#8a6a3a', bottom: 'pants', bc: '#4a3a2a' } });
  add('berna', { name: '베르나', color: '#ffb0d0', voice: 1.45, desc: '전설이 되고 싶은 아이. 목검을 하루 천 번 휘두른다.', look: { gender: 'girl', age: 'child', hair: 'pony', hc: '#8a4a2a', eye: '#d85a8a', top: 'tunic', tc: '#ff8ab0', trim: '#fff0f4', bottom: 'shorts', bc: '#6a5aa8', ribbon: '#ffd84a' } });
  add('karel', { name: '카렐', color: '#8ad0ff', voice: 1.35, desc: '베르나의 라이벌이라고 혼자 주장한다.', look: { age: 'child', hair: 'short', hc: '#2a2a2a', eye: '#4a78c8', top: 'tunic', tc: '#4a78c8', bottom: 'shorts', bc: '#3a3a4a', hat: 'cap', hatC: '#e84a4a' } });
  add('noah', { name: '노아', color: '#d8d8e8', voice: 1.5, desc: '빛바램병을 앓는 아이. 머리칼 끝부터 색이 빠지고 있다.', look: { age: 'child', hair: 'messy', hc: '#d8d4d0', eye: '#9aa0b8', skin: 'pale', top: 'tunic', tc: '#b8c0b0', trim: '#e8e8e0', bottom: 'shorts', bc: '#8a8a90', acc: ['scarf'], scarfC: '#8ab8d8' } });
  add('gordi', { name: '징수 기사 고르디', color: '#b8a8e8', voice: 0.8, desc: '그린 마을 담당 징수 기사. 규칙을 좋아하지만 사람을 싫어하진 않는다.', look: { hair: 'short', hc: '#3a3450', eye: '#6a5a90', top: 'armor', tc: '#6a5a90', trim: '#c8c8d0', bottom: 'pants', bc: '#3a3450', hat: 'helm', hatC: '#9aa4ae', build: 'broad' } });
  add('elm', { name: '엘름 영감', color: '#a8d8e8', voice: 0.65, desc: '연못 낚시꾼. 물고기보다 옛날이야기를 더 잘 낚는다.', look: { age: 'old', hair: 'short', hc: '#9a9a9a', beard: '#b8b8b8', eye: '#5a7a9a', top: 'vest', tc: '#5a7a9a', bottom: 'pants', bc: '#4a4a5a', hat: 'straw' } });

  /* ── 레드 ── */
  add('volkan', { name: '볼칸 아저씨', color: '#ff9a6a', voice: 0.75, desc: '불꽃 대장간 주인. 망치 소리로 사람을 판단한다.', look: { hair: 'bald', hc: '#c8402c', beard: '#c8402c', skin: 'tan', eye: '#c85a3a', top: 'vest', tc: '#8a3a2a', bottom: 'pants', bc: '#3a2a22', build: 'broad' } });
  add('rud', { name: '루드', color: '#ff7a6a', voice: 0.95, desc: '징수 기사단 견습. 뺨의 흉터. 「숫자는 거짓말 안 해.」', look: { hair: 'spiky', hc: '#d8402a', eye: '#e8a040', eyeShape: 'sharp', scar: true, top: 'armor', tc: '#6a6a80', trim: '#c8c8d0', bottom: 'pants', bc: '#2a2a32', cape: '#5a2a2a' } });
  add('lea', { name: '레아', color: '#ffa87a', voice: 0.95, desc: '새벽단 단장. 루드의 누나. 전 징수 기사.', look: { gender: 'girl', hair: 'pony', hc: '#c8402a', eye: '#e8a040', eyeShape: 'sharp', top: 'coat', tc: '#5a3a2a', trim: '#ffd84a', bottom: 'pants', bc: '#2a2a32', acc: ['scarf'], scarfC: '#ff7a4a' } });
  add('astel', { name: '아스텔 박사', color: '#a8c8ff', voice: 0.8, desc: '붉은 산 관측소장. 993년 어느 밤 관측표를 덮고 입을 닫았다.', look: { age: 'old', hair: 'messy', hc: '#f0f0f0', eye: '#4a6ab8', top: 'coat', tc: '#2a3a6a', trim: '#e8e8f0', bottom: 'pants', bc: '#2a2a3a', glasses: true } });
  add('dorgan', { name: '광부 대장 도르간', color: '#ffd870', voice: 0.72, desc: '황금 광산의 전 광부 대장.', look: { age: 'old', hair: 'short', hc: '#3a2a1a', beard: '#5a4a3a', eye: '#a8803a', top: 'vest', tc: '#6a5a3a', bottom: 'pants', bc: '#3a3a3a', hat: 'helm', hatC: '#e8c048', build: 'broad' } });

  /* ── 블루 ── */
  add('hemia', { name: '헤미아', color: '#8ad8e8', voice: 1.2, desc: '블루 대도서관 사서. 수수께끼를 좋아하고 말을 더듬는다.', look: { gender: 'girl', hair: 'long', hc: '#2a3a5a', eye: '#4ad8e8', top: 'dress', tc: '#3a8a9a', trim: '#e8f0f0', bottom: 'long', bc: '#2a3a4a', glasses: true, acc: ['book'] } });
  add('octavio', { name: '옥타비오 관장', color: '#d0a8ff', voice: 0.7, look: { kind: 'octopus' }, desc: '대도서관장. 안경 쓴 문어 학자. 다리마다 다른 책을 읽는다.' });
  add('luce', { name: '루체', color: '#ffe070', voice: 1.25, desc: '등대지기의 딸. 아버지의 항해일지를 지킨다.', look: { gender: 'girl', hair: 'short', hc: '#3a2a1a', eye: '#e8b040', top: 'tunic', tc: '#ffd84a', trim: '#ffffff', bottom: 'shorts', bc: '#3a5a8a', acc: ['scarf'], scarfC: '#3a5a8a' } });
  add('gab', { name: '가브 선장', color: '#9ab8e8', voice: 0.8, desc: '연락선 「고등어호」 선장.', look: { hair: 'short', hc: '#2a2a2a', beard: '#2a2a2a', eye: '#3a5a8a', top: 'coat', tc: '#f4f4f4', trim: '#2a3a6a', bottom: 'pants', bc: '#2a3a6a', hat: 'cap', hatC: '#2a3a6a', build: 'broad' } });

  /* ── 옐로 ── */
  add('pika', { name: '피카', color: '#e8e8a0', voice: 1.35, desc: '그늘 골목의 소매치기. 고아들의 「그늘 참새단」 두목.', look: { age: 'child', hair: 'spiky', hc: '#1a1a22', eye: '#e8c040', skin: 'tan', top: 'vest', tc: '#c87a3a', bottom: 'shorts', bc: '#5a4a3a', acc: ['scarf'], scarfC: '#e84a4a' } });
  add('goldy', { name: '금화왕 골디', color: '#ffd84a', voice: 0.9, desc: '사천왕 · 노랑의 자리. 「공짜는 없어.」', look: { hair: 'swept', hc: '#e8c040', eye: '#e89a20', eyeShape: 'sharp', top: 'coat', tc: '#c89a28', trim: '#fff0a8', bottom: 'pants', bc: '#5a3a1a', cape: '#8a1a3a', acc: ['earring', 'necklace'], gem: '#ff4a6a' } });
  add('yana', { name: '야나', color: '#f0c080', voice: 1.15, desc: '모래바다의 길잡이. 여우 귀. 사막의 별자리를 다 외운다.', look: { gender: 'girl', hair: 'bob', hc: '#e8a040', eye: '#40a8a0', skin: 'tan', ears: 'fox', top: 'vest', tc: '#c8905a', trim: '#fff0d0', bottom: 'shorts', bc: '#8a6a4a', acc: ['scarf', 'earring'], scarfC: '#e8d0a0', gem: '#40a8a0' } });

  /* ── 퍼플 ── */
  add('vera', { name: '베라 교수', color: '#d8b0ff', voice: 0.95, desc: '라벤더 학원 마법 교수. 세린의 스승이었다. 늘 찻잔을 들고 다닌다.', look: { gender: 'girl', hair: 'wavy', hc: '#b8a0d8', eye: '#8a5ad8', top: 'robe', tc: '#5a3a8a', trim: '#e8c860', bottom: 'long', bc: '#3a2a5a', hat: 'witch', hatC: '#3a2a5a', glasses: true } });
  add('viola', { name: '비올라', color: '#e0a0ff', voice: 1.3, desc: '라벤더 학원 최연소 수석. 세린의 기록을 깨는 게 목표다.', look: { gender: 'girl', hair: 'twin', hc: '#a86ae8', eye: '#ffd84a', eyeBig: true, top: 'dress', tc: '#3a2a6a', trim: '#ffd84a', bottom: 'skirt', bc: '#2a1a4a', ribbon: '#ffd84a', acc: ['staff'], gem: '#ffd84a' } });
  add('sybil', { name: '시빌 할멈', color: '#e8e0ff', voice: 0.66, desc: '진실의 거울 연못지기.', look: { gender: 'girl', age: 'old', hair: 'long', hc: '#e8e8f0', eye: '#8a7ab0', top: 'robe', tc: '#6a5a8a', bottom: 'long', bc: '#3a2a5a', hat: 'hood', hatC: '#4a3a6a', eyeShape: 'sleepy' } });

  /* ── 무지개 ── */
  add('rolo', { name: '롤로', color: '#ffb0e0', voice: 1.1, desc: '무지개 서커스의 광대. 빛바램으로 색을 잃어 얼굴에 색을 칠하고 산다.', look: { hair: 'messy', hc: '#c8c8c8', eye: '#8a8a9a', skin: 'pale', top: 'coat', tc: '#e84a8a', trim: '#ffd84a', bottom: 'pants', bc: '#4a4ae8', acc: ['scarf'], scarfC: '#4ae8a8', blush: true } });
  add('chroma', { name: '크로마 위원장', color: '#c8f0a8', voice: 0.85, desc: '천년제 준비 위원장.', look: { gender: 'girl', age: 'old', hair: 'bun', hc: '#ff8ab0', eye: '#4a9a6a', top: 'dress', tc: '#8ae08a', bottom: 'long', bc: '#8a8ae8' } });
  add('nube', { name: '누베', color: '#bfe4ff', voice: 0.55, desc: '구름고래. 무지개 마을까지 태워다 준다.', look: { kind: 'whale' } });

  /* ── 화이트 ── */
  add('lumie', { name: '성녀 루미에', color: '#fff4d0', voice: 1.05, desc: '사천왕 · 하양의 자리. 병자를 공짜로 고친다. 희생을 신의 뜻이라 믿는다.', look: { gender: 'girl', hair: 'long', hc: '#f0e8d0', eye: '#8ab8e8', top: 'robe', tc: '#f4f4f8', trim: '#e8c860', bottom: 'long', bc: '#d8e0ea', hat: 'veil', hatC: '#f4f4f8', eyeShape: 'sleepy', acc: ['necklace'], gem: '#8ab8e8' } });
  add('edel', { name: '에델', color: '#d8e8ff', voice: 0.85, desc: '루미에를 지키는 백은 기사. 「~하오」 체.', look: { gender: 'girl', hair: 'hime', hc: '#c8d0dc', eye: '#4a6ad8', eyeShape: 'sharp', top: 'armor', tc: '#e8eef8', trim: '#8ab8e8', bottom: 'pants', bc: '#9aa4ae', cape: '#4a6ad8' } });
  add('iska', { name: '이스카', color: '#bfe8ff', voice: 1.1, desc: '눈먼 얼음 사제. 눈이 아니라 빛으로 사람을 본다.', look: { gender: 'girl', hair: 'hime', hc: '#e8f4ff', eye: '#bfe8ff', skin: 'fair', top: 'robe', tc: '#c8d8f0', trim: '#8ab8e8', bottom: 'long', bc: '#a8b8d8', hat: 'band', hatC: '#e8f0ff', eyeShape: 'sleepy', blind: true } });
  add('nive', { name: '니베', color: '#e8f4ff', voice: 1.5, desc: '설원의 아이.', look: { gender: 'girl', age: 'child', hair: 'bob', hc: '#8a6a4a', eye: '#4a8ad8', top: 'coat', tc: '#ff8a8a', bottom: 'pants', bc: '#6a8ab0', hat: 'hood', hatC: '#ffffff' } });

  /* ── 그레이 ── */
  add('bolt', { name: '강철공 볼트', color: '#c8d0dc', voice: 0.7, desc: '사천왕 · 회색의 자리. 징수탑을 설계했다. 「쓸데없는 말은 연료 낭비다.」', look: { age: 'old', hair: 'short', hc: '#8a8a8a', beard: '#7a7a7a', eye: '#8ab8d8', top: 'vest', tc: '#5a6478', bottom: 'pants', bc: '#3a3a44', hat: 'goggles', build: 'broad' } });
  add('sepia', { name: '세피아', color: '#ffc890', voice: 1.3, desc: '볼트가 만든 로봇 소녀 N-07. 색을 보고 싶어 한다.', look: { gender: 'girl', hair: 'bob', hc: '#c8d0dc', eye: '#ffb86a', skin: 'ash', top: 'dress', tc: '#e88a5a', trim: '#c8d0dc', bottom: 'skirt', bc: '#8a96aa', robot: true } });

  /* ── 블랙 ── */
  add('midnight', { name: '미드나잇', color: '#e8d0ff', voice: 0.9, look: { kind: 'cat' }, desc: '밤의 정보상. 실크해트를 쓴 검은 고양이. 천 년을 살았다는 소문.' });
  add('nocturne', { name: '그림자 녹턴', color: '#b8a8d8', voice: 0.78, desc: '사천왕 · 검정의 자리. 카이론의 그림자.', look: { hair: 'long', hc: '#1a1626', eye: '#b87aff', eyeShape: 'sharp', skin: 'pale', top: 'coat', tc: '#2a2440', trim: '#8a1a3a', bottom: 'pants', bc: '#1a1626', cape: '#1a1626', mask: true, hatC: '#1a1626' } });
  add('lyra', { name: '리라', color: '#c8a8ff', voice: 1.2, desc: '떠돌이 음유시인. 마을마다 여관에서 노래한다. 노래 속에 늘 뭔가가 숨어 있다.', look: { gender: 'girl', hair: 'long', hc: '#2a2440', eye: '#b87aff', skin: 'pale', top: 'coat', tc: '#3a2a50', trim: '#c8a8ff', bottom: 'skirt', bc: '#2a1a3a', acc: ['lute', 'earring'], gem: '#b87aff', ribbon: '#c8a8ff' } });

  /* ── 알록달록 ── */
  add('pyros', { name: '피로스 박사', color: '#ffa0d0', voice: 1.05, desc: '폭발 발명가. 평생 로켓 「무한호」를 만들고 있다.', look: { age: 'old', hair: 'messy', hc: '#3a2a2a', beard: '#3a2a2a', eye: '#d85a8a', top: 'coat', tc: '#f4f4f4', trim: '#ffd84a', bottom: 'pants', bc: '#5a5a8a', hat: 'goggles' } });
  add('bomba', { name: '봄바', color: '#ffe0a0', voice: 1.4, desc: '피로스 박사의 조수.', look: { age: 'child', hair: 'spiky', hc: '#ff8a3a', eye: '#3ad8a8', top: 'tunic', tc: '#5ae8a8', bottom: 'shorts', bc: '#3a3a8a', hat: 'goggles' } });

  /* ── 하늘 ── */
  add('stella', { name: '스텔라', color: '#8af0ff', voice: 1.2, look: { kind: 'ai' }, desc: '하늘 정거장의 인공지능. 400년 동안 혼자였다.' });

  /* ── 새 인물 (v3) ── */
  add('cassian', { name: '카시안', color: '#ff8a9a', voice: 0.95, desc: '카이론의 마지막 제자. 열일곱에 기사단 부단장 자리를 거절했다. 경험세가 옳다고 믿는다 — 아직은.',
    look: { hair: 'side', hc: '#262a40', eye: '#e03a4a', eyeShape: 'sharp', skin: 'fair', top: 'coat', tc: '#1e2438', trim: '#e8c048', bottom: 'pants', bc: '#1a1a28', boots: '#1a1420', cape: '#8a1a2a', acc: ['sword'] } });
  add('graus', { name: '그라우스', color: '#c8a0a0', voice: 0.62, desc: '징수 기사단 부단장. 장부의 숫자를 사랑한다. 숫자에서 조금씩 떼어 먹는 것도.',
    look: { hair: 'slick', hc: '#5a4a44', eye: '#9a8a7a', eyeShape: 'sharp', scar: true, skin: 'light', top: 'armor', tc: '#4a4a5a', trim: '#8a1a2a', bottom: 'pants', bc: '#2a2a32', cape: '#3a0a1a', build: 'broad', beard: '#5a4a44' } });

  /* ── 괴물 · 그림자 ── */
  add('blacksun', { name: '흑점', color: '#ff5a7a', voice: 0.4, look: { kind: 'shade' }, desc: '빛을 먹는 떠돌이 어둠.' });
  add('hollowking', { name: '빈 왕', color: '#bfe8ff', voice: 0.45, look: { kind: 'armor' }, desc: '광맥 바닥의 왕좌에 앉은, 속이 빈 은빛 갑옷.' });
  add('treant', { name: '속삭임의 나무 정령', color: '#b8e8a0', voice: 0.5, look: { kind: 'spirit' }, desc: '천 년 동안 숲의 수다를 들어 왔다.' });

  /* ── 이름 없는 사람들 (모습만) ── */
  const FOLK = {
    farmer: { hair: 'short', hc: '#5a3a1a', top: 'vest', tc: '#8a9a4a', bottom: 'pants', bc: '#5a4a3a', hat: 'straw' },
    farmerw: { gender: 'girl', hair: 'braid', hc: '#6a4a2a', top: 'dress', tc: '#c8a860', bottom: 'long', bc: '#6a5a3a', hat: 'straw' },
    kid: { age: 'child', hair: 'short', hc: '#4a3a2a', top: 'tunic', tc: '#e8c84a', bottom: 'shorts', bc: '#4a6a9a' },
    kidg: { gender: 'girl', age: 'child', hair: 'twin', hc: '#5a3a2a', top: 'dress', tc: '#8ad0ff', bottom: 'skirt', bc: '#4a6a9a' },
    oldm: { age: 'old', hair: 'bald', beard: '#d8d8d0', top: 'robe', tc: '#8a7a6a', bottom: 'pants', bc: '#4a3a2a' },
    oldw: { gender: 'girl', age: 'old', hair: 'bun', hc: '#d8d0d0', top: 'dress', tc: '#a86a8a', bottom: 'long', bc: '#5a4a5a' },
    smith: { hair: 'short', hc: '#2a1a1a', skin: 'tan', top: 'vest', tc: '#6a3a2a', bottom: 'pants', bc: '#2a2a2a', build: 'broad' },
    guard: { hair: 'short', hc: '#3a2a2a', top: 'armor', tc: '#7a7a90', trim: '#c8c8d0', bottom: 'pants', bc: '#3a3a4a', hat: 'helm', hatC: '#9a9ab0' },
    knight: { hair: 'short', hc: '#3a3a3a', top: 'armor', tc: '#8a8aa8', trim: '#e8c860', bottom: 'pants', bc: '#4a4a5a', hat: 'helm', hatC: '#9a9ab8', cape: '#7a2a3a', eyeShape: 'sharp' },
    sailor: { hair: 'messy', hc: '#2a2a2a', skin: 'tan', top: 'tunic', tc: '#f4f4f4', trim: '#2a3a6a', bottom: 'pants', bc: '#2a3a6a', acc: ['scarf'], scarfC: '#2a3a6a' },
    scholar: { gender: 'girl', hair: 'long', hc: '#3a2a4a', top: 'robe', tc: '#3a5a8a', bottom: 'long', bc: '#2a3a5a', glasses: true, acc: ['book'] },
    merchant: { hair: 'short', hc: '#1a1a1a', skin: 'tan', top: 'coat', tc: '#c8903a', trim: '#e8d0a0', bottom: 'pants', bc: '#6a4a2a', hat: 'hood', hatC: '#e8d0a0' },
    merchantw: { gender: 'girl', hair: 'long', hc: '#1a1a1a', skin: 'brown', top: 'dress', tc: '#e8a040', bottom: 'long', bc: '#8a3a2a', acc: ['earring'] },
    mage: { gender: 'girl', hair: 'wavy', hc: '#6a4a9a', top: 'robe', tc: '#6a4a9a', bottom: 'long', bc: '#3a2a5a', hat: 'witch', hatC: '#3a2a5a' },
    student: { hair: 'neat', hc: '#4a3a6a', top: 'coat', tc: '#5a4a8a', trim: '#e8c860', bottom: 'pants', bc: '#2a2a3a' },
    clown: { hair: 'messy', hc: '#ff7a7a', top: 'coat', tc: '#7ab8ff', trim: '#ffd84a', bottom: 'pants', bc: '#ffd84a' },
    nun: { gender: 'girl', hair: 'long', hc: '#e8e0d0', top: 'robe', tc: '#e8eef8', bottom: 'long', bc: '#c8d0e0', hat: 'veil', hatC: '#e8eef8' },
    miner: { hair: 'short', hc: '#3a2a1a', top: 'vest', tc: '#6a5a3a', bottom: 'pants', bc: '#3a3a3a', hat: 'helm', hatC: '#e8c048' },
    mech: { hair: 'messy', hc: '#5a5a5a', top: 'vest', tc: '#6a6a70', bottom: 'pants', bc: '#3a3a3a', hat: 'goggles' },
    nightw: { gender: 'girl', hair: 'hime', hc: '#2a2438', skin: 'pale', top: 'dress', tc: '#3a3450', trim: '#b87aff', bottom: 'long', bc: '#1a1626' },
    nightm: { hair: 'slick', hc: '#1a1626', skin: 'pale', top: 'coat', tc: '#2a2438', trim: '#ffd86a', bottom: 'pants', bc: '#1a1626' },
    inventor: { hair: 'spiky', hc: '#5ae8a8', top: 'coat', tc: '#ff8a5a', bottom: 'pants', bc: '#5a5ae8', hat: 'goggles' },
    dawn: { hair: 'messy', hc: '#8a3a2a', top: 'coat', tc: '#5a3a2a', trim: '#ffa87a', bottom: 'pants', bc: '#2a2a32', acc: ['scarf'], scarfC: '#ff7a4a' },
    dawnw: { gender: 'girl', hair: 'pony', hc: '#3a2a1a', top: 'coat', tc: '#5a3a2a', trim: '#ffa87a', bottom: 'pants', bc: '#2a2a32', acc: ['scarf'], scarfC: '#ff7a4a' },
  };

  function get(id) { return C[id] || null; }
  function name(id) { const c = C[id]; return c ? c.name : id; }
  function color(id) { const c = id && C[id]; return c ? c.color : null; }
  function voice(id) { const c = C[id]; return c ? c.voice : 1; }
  /** 만난 사람 (깃발 met:id) */
  function met() { const s = G.state; return Object.values(C).filter((c) => s.flags['met:' + c.id]); }
  function folk(k, extra) { return Object.assign({}, FOLK[k] || FOLK.farmer, extra || {}); }

  G.cast = { C, get, name, color, voice, met, folk, FOLK };
})();
