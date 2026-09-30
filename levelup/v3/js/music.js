/* 음악: 직접 쓴 선율(MML) + 화음 진행. 베이스와 반주는 audio.js가 화음에서 만든다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const T = {};

  // 테마 「무한렙업의 노래」 — 버튼을 처음 누른 날의 기분
  T.title = { bpm: 126, chords: 'C G Am Em F C Dm G C G Am Em F G C C', bass: 'oct', arp: 'up16', drums: 'rock', leadWave: 'sq25',
    lead: 'o5 l8 e4 g e c4 e g d4 g4 b4. a c4 e c <a4> c e g4. e d4 e4 f4 a f c4 f a g4 e g >c4< g4 f4 e d e4 f4 d2. r4 ' +
      'e4 g e >c4< b a b4 a g d4 g4 a4 >c< a e4 a g g4 e d e2 f4 a >c d4 c< a b4 >d< b g4 a b >c2< g4 e4 c2. r4' };
  T.ending = Object.assign({}, T.title, { bpm: 92, bass: 'long', arp: 'bell', drums: 'soft', leadWave: 'sq12' });
  // 할머니 집 — 아궁이 옆의 느린 오후
  T.home = { bpm: 92, chords: 'F C Dm Bb F C Bb:2 C:2 F', bass: 'long', arp: 'broken8', arpVol: 0.05, drums: 'none', leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l8 a4. g f4 c4 e4. f g2 f4. e d4 a4 f4. d <b-2> c4 f a >c4.< a g4. e c4 e4 d4 f4 e4 g4 f2. r4' };
  // 그린 마을 — 느긋한 새싹의 골짜기
  T.green = { bpm: 112, chords: 'G C G D G C D G Em C G D C D G G', bass: 'walk', arp: 'broken8', drums: 'soft',
    lead: 'o5 l8 d4 g4 b4 a g e4. g >c4< b a g4 d4 b a g4 a2. r4 b4. a g4 d4 e4 g e c4 e g f+4 a f+ d4 e f+ g2. r4 ' +
      'b4 >d4< b4 g4 a4 g e g2 b4 a g d4. g a2 f+4 a4 g4 e c e4 g a f+4 d e f+4 a4 g4 b a b4 >d4< g2. r4' };
  // 들판 — 걸음이 빨라지는 모험의 노래
  T.field = { bpm: 136, chords: 'D A Bm G D A G A Bm G D A G A D D', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'rock',
    lead: 'o5 l8 f+4 a4 >d4.< a e4 a4 >c+4.< a b4 a f+ d4. f+ g2 f+4 e4 f+4. a >d4 c+ d< e4 c+ e a4 e4 d4 e f+ g4 f+ e e2. r4 ' +
      'd4 f+ b4 a f+ d e4 g b >d4< b g f+4 a f+ d4 a4 c+4. d e2 b4 a g f+4 g a a4 g f+ e4 f+ g a4 >d4< a4 f+4 d2. r4' };
  // 속삭이는 숲 · 신비로운 곳
  T.forest = { bpm: 100, chords: 'Am F G Em Am F E E', bass: 'sparse', arp: 'bell', arpVol: 0.05, drums: 'none', leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l8 e2 a4 >c4< b4. a f2 g4. f d2 e1 c4 e a >c4. <b a4. f c2 b4. g+ e2 e2. r4' };
  // 레드 마을 — 망치 소리에 맞춘 행진
  T.red = { bpm: 124, chords: 'Em D C D Em D C B', bass: 'gallop', arp: 'stab', arpVol: 0.06, drums: 'march', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 e4 e g a4 g e f+4 f+ a b4 a f+ g4 g e c4 e g a2 f+4 d4 b4 b >d e4 d< b a4 a f+ d4 f+ a g4 e g c4 e g f+2 d+4 f+4' };
  // 동굴 · 광산 · 던전
  T.cave = { bpm: 88, chords: 'Dm Dm Bb A Dm Gm A A', bass: 'long', arp: 'pad', arpVol: 0.05, drumMML: 'l4 [k r r r]', leadWave: 'sq12', leadVol: 0.11,
    lead: 'o4 l8 d2 f4 e4 d2. r4 f2 d4 f4 e2. r4 a2 g4 f4 g2 b-4 a4 a4 g f e4 c+4 e2. r4' };
  // 블루 마을 — 파도와 책장 넘기는 소리
  T.blue = { bpm: 100, chords: 'Bb F Gm Eb Bb F Eb F', bass: 'root', arp: 'updown', arpVol: 0.045, drums: 'soft', leadWave: 'sq25', leadVol: 0.11,
    lead: 'o5 l8 d4. f b-4. a a4. f c2 b-4. a g4 d4 e-2. r4 f4. g f4 d4 c4. d e-4 f4 g4. f e-4 d4 c2. r4' };
  // 옐로 마을 — 모래바람의 시장
  T.yellow = { bpm: 116, chords: 'E F E Dm E F G F:2 E:2', bass: 'pulse', arp: 'off8', drumMML: 'l8 [k r h k s r h h]', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 e4 f g+ f e4 r f4 g+ a g+ f e4 b4. a g+ f e4 d4. f a2 e4 g+ b >c4< b a a4 g+ f g+4 a4 b4 >d< b g4 f g f4 e d e2' };
  // 퍼플 마을 — 해 질 녘 숲의 왈츠 (3박)
  T.purple = { bpm: 96, bpb: 3, chords: 'Em C Am B7 Em C D G C Am Em B7 C D Em Em', bass: 'waltz', arp: 'waltz', drums: 'waltz', leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l4 b2 g e2 g a2. f+2 d+ e g b >c2< b a f+ d g2. e g >c< >c< b a g2 e d+2. g >c e< >d2< a b2 g e2.' };
  // 무지개 마을 — 축제의 춤
  T.rainbow = { bpm: 144, chords: 'C F C G C F G C', bass: 'oct', arp: 'off8', drums: 'dance', leadWave: 'sq25',
    lead: 'o5 l8 c e g >c< g e g e f4 a >c4< a f a g4 e c e g >c4< b4 >d< b g2 >c4< b a g4 e g a4 >c< a f4 a g g b >d< b g4 f4 e g >c2.<' };
  // 화이트 마을 — 눈 내리는 대성당
  T.white = { bpm: 80, chords: 'D Bm G A D Bm Em A', bass: 'long', arp: 'bell', arpVol: 0.05, drums: 'none', leadWave: 'sine', leadVol: 0.16,
    lead: 'o5 l8 a2 f+2 f+4. e d2 d4. e g2 e1 a2 >d2< >c+4.< b f+2 g4. f+ e2 e2. r4' };
  // 그레이 마을 — 녹슨 톱니
  T.gray = { bpm: 116, chords: 'Am Am F G Am Am Dm E', bass: 'pulse', arp: 'up16', arpVol: 0.04, drums: 'rock', leadWave: 'sq50', leadVol: 0.09,
    lead: 'o4 l8 a4 r a >c4< a e a4 r a g4 e g f4 r f a4 >c< a g4 r g b4 >d< b >c4 r c e4 d c< >c4 r c< b4 a g f4 a >d4 c< a f g+2 e2' };
  // 블랙 마을 — 영원한 밤의 재즈
  T.black = { bpm: 90, chords: 'Cm7 Fm7 Ddim G7 Cm7 Ab7 G7 G7', bass: 'walk', arp: 'off8', arpVol: 0.05, drums: 'shuffle', drumVol: 0.7, leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l8 g4. e- c4 b-4 a-4. g f2 f4 e- d a-4. f g2 <b4> d4 e-4. g >c4.< b- a-4 g- e- c4 e- r d4 f a- g4 f d b2. r4' };
  // 알록달록 마을 — 불꽃놀이 행진
  T.colorful = { bpm: 152, chords: 'F Bb C F F Bb C C', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'dance', leadWave: 'sq25',
    lead: 'o5 l8 c f a >c< a f c f d f b- >d< b- f d f e4 g >c4< g e4 f4. a >c2< a4 g f c4 d e f4 d <b-4> d f g a4 g e g4 b- a g2. r4' };
  // 하늘 정거장 — 400년의 정적
  T.space = { bpm: 96, chords: 'Ebmaj7 F Ebmaj7 F Cm7 Bb Ab Bb', bass: 'long', arp: 'up16', arpWave: 'sine', arpVol: 0.06, drums: 'none', leadWave: 'sine', leadVol: 0.15,
    lead: 'o5 l8 g2 b-2 a2. r4 g4. b- >d2< >c1< e-2 g4 b-4 f2 d2 e-2 c2 d2. r4' };
  // 절대 강자 행성 아스트라
  T.planet = { bpm: 104, chords: 'Dm Bb F C Dm Bb C A', bass: 'root', arp: 'updown', arpVol: 0.05, drums: 'half', leadWave: 'sq25',
    lead: 'o5 l8 a2 d4. e f2 b-4. a a2 c4. d e2. r4 a4 >d4 c4< a4 b-4 a g f2 g4. a b-4 >c4< c+2. r4' };
  // 전투
  T.battle = { bpm: 160, chords: 'Am F G E Am F G:2 E:2 Am', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'battle', leadWave: 'sq25',
    lead: 'o5 l8 a4 e a >c4< b a f4 c f a4 g f g4 d g b4 a g g+2 e4 b4 >c4< a >c e4 d c< a4 f a >c4< a f b4 g b g+4 b g+ a4 a e a2' };
  T.boss = { bpm: 166, chords: 'Dm Dm Bb C Dm Dm Gm A', bass: 'gallop', arp: 'up16', arpVol: 0.045, drums: 'boss', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 d4 d f a4 g f e4 f g a2 b-4 a g f4 g a g2 e4 c4 >d4< a >d f4 e d< >c4< a f d4 f a b-4 a g b-4 >d4< c+2 e2' };
  // 사천왕전
  T.boss2 = { bpm: 172, chords: 'Em C D B Em C Am B', bass: 'oct', arp: 'up16', arpVol: 0.05, drums: 'boss', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 e4 g b >e4< b g >c4< g e c4 e g a4 f+ d a4 b >c< b2 d+4 f+4 g4 f+ e b4 e g >c4 d e< b4 g e a4 >c e< a4 >c e< d+2 f+2' };
  // 카이론 — 절대 강자의 주제
  T.kairon = { bpm: 150, chords: 'Bm G A F# Bm G Em F#', bass: 'gallop', arp: 'up16', arpVol: 0.05, drums: 'boss', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 f+2 b4. a g4 f+ e d2 e4 f+ g a2 a+2. r4 b4 >c+ d f+4 e d< b4 a g d4 g a b4. a g4 e4 f+2 a+2' };
  // 흑점 — 마지막 싸움
  T.final = { bpm: 176, chords: 'Cm Ab Bb G Cm Ab Fm G Ab Bb Cm Cm Ab Bb G G', bass: 'gallop', arp: 'up16', arpVol: 0.05, drums: 'final', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 c4 e- g >c4< g e- a-4 e- c a-4 >c e-< b-4 f d b-4 f d g2 b4 >d4< >c4< b- a- g4 f e- e-4 f g a-4 g f f4 a- >c< f4 e- d d2 b2 ' +
      '>c4. e-4. c4< b-4. >d4. f4< >g2 e-2< >c2.< r4 a-4 g f e-4 f g b-4 a- g f4 g a- g4 b >d4< b g d g2. r4' };
  // 슬픔
  T.sad = { bpm: 70, chords: 'Am F C G Am F E Am', bass: 'long', arp: 'broken8', arpVol: 0.04, drums: 'none', leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l8 e2 a4. g f2 c4. d e2 g4. e d1 c4. d e2 a4. g f2 e4. d <b2> <a1>' };
  // 세린의 주제 — 어머니
  T.mother = { bpm: 76, chords: 'G Em C D G Em C:2 D:2 G', bass: 'long', arp: 'broken8', arpVol: 0.045, drums: 'none', leadWave: 'sq12', leadVol: 0.13,
    lead: 'o5 l8 d4 g4 b2 a4. g e2 g4. e c2 d1 b4 >d4 g2< f+4. e d2 e4. c d4 f+4 g1' };
  // 긴장 · 위기
  T.danger = { bpm: 132, chords: 'Em F Em F:2 G:2', bass: 'pulse', drums: 'tick', drumVol: 0.8, leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l8 e4 r e f4 r e f4 r f g4 r f e4 r e b4 a g f4 e f g4 f g' };
  // 징수탑 · 천년성
  T.castle = { bpm: 84, chords: 'Cm Cm Ab G Cm Cm Db G', bass: 'long', arp: 'pad', arpVol: 0.05, drumMML: 'l2 [k r]', leadWave: 'sq12', leadVol: 0.11,
    lead: 'o4 l8 c2 e-4 g4 f2 e-4 d4 c2 e-4 a-4 g1 >c2< b-4 a-4 g2 f4 e-4 d-2 f4 a-4 g1' };
  // 여관 · 쉼터 · 도서관
  T.calm = { bpm: 84, chords: 'Cmaj7 Am7 Fmaj7 G Cmaj7 Am7 Fmaj7 G', bass: 'long', arp: 'updown', arpWave: 'sine', arpVol: 0.06, drums: 'none', leadWave: 'sine', leadVol: 0.13,
    lead: 'o5 l8 e2 g4 e4 c2. r4 a2 g4 f4 d2. r4 e4. f g4 >c4< a2 g4 e4 f4. e d4 f4 g2. r4' };

  // 소름 — 심장 소리와 낮게 긁는 소리. 무언가가 이쪽을 보고 있다
  T.dread = { bpm: 60, chords: 'Cm Cm Dbmaj7 Cm Cm Cm Gdim Cm', bass: 'long', bassVol: 0.22, arp: 'pad', arpWave: 'sine', arpVol: 0.03,
    drumMML: 'l8 [k k r r r r r r]', drumVol: 0.55, leadWave: 'sine', leadVol: 0.09,
    lead: 'o6 l4 r1 c2. <b4 r1 r2 >c4 d-4 c1 r1 r2. <b4 f+1',
    harm: 'o3 l1 c c d- c c c <b >c', harmWave: 'sawtooth', harmVol: 0.03 };
  // 정적 — 거의 아무 소리도 없다. 가끔 멀리서 한 음
  T.hollow = { bpm: 50, chords: 'Am:8 F:8 Am:8 E:8', bass: 'long', bassVol: 0.1, drums: 'none', leadWave: 'sine', leadVol: 0.06,
    lead: 'o6 l1 r r e r d r r c' };
  // 꿈 — 물속에서 듣는 자장가
  T.dream = { bpm: 72, chords: 'Fmaj7 Em7 Dm7 Cmaj7 Fmaj7 Em7 Am7 G', bass: 'long', bassVol: 0.18, arp: 'updown', arpWave: 'sine', arpVol: 0.05, drums: 'none', leadWave: 'sine', leadVol: 0.12,
    lead: 'o6 l4 c2 <a4 g4 e2. r4 f2 e4 d4 e2. r4 >c2 <a4 >c4 e2 d4 c4 <b2. r4 a1',
    harm: 'o5 l2 e f e d c d e c e f e d c <b >c e', harmWave: 'sine', harmVol: 0.045 };
  // 진혼곡 — 떠난 사람과 남은 사람
  T.requiem = { bpm: 58, chords: 'Dm Bb Gm A Dm Bb Gm:2 A:2 Dm', bass: 'long', arp: 'broken8', arpVol: 0.035, drums: 'none', leadWave: 'sq12', leadVol: 0.12,
    lead: 'o5 l4 a2 f4 d4 b-2. a4 g2 f4 e4 c+2. e4 f2 a4 >d4< d2. c4 b-4 a4 g4 e4 d1' };
  // 웅장 — 대륙이 한목소리를 낼 때
  T.epic = { bpm: 100, chords: 'Dm Bb C F Gm Bb A A', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'march', drumVol: 0.8, leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 d4. e f4 a4 b-4. a g4 f4 e4. f g4 c4 f2. r4 g4. a b-4 >d4 c4< b- a g4 d4 a4. g f4 e4 c+2 e2',
    harm: 'o5 l8 <a4. >c d4 f4 g4. f e4 d4 c4. d e4 <a4 >c2. r4 e4. f g4 b-4 a4 g f e4 <b-4> f4. e d4 c+4 <a2 >c+2', harmWave: 'sq25', harmVol: 0.06 };

  /* ───────── 상황마다 다른 음악 (밤 · 비 · 들판 싸움 · 정예 · 던전 꼴 · 격노 · 탑 · 오락기 · 숨은 곳 · 새 지역) ───────── */
  // 밤의 들판 — 걸음을 늦추는 종소리
  T.field_night = { bpm: 88, chords: 'D Bm G A D Bm G A', bass: 'long', arp: 'bell', arpVol: 0.045, drums: 'none', leadWave: 'sine', leadVol: 0.13,
    lead: 'o5 l4 f+2 a2 | o5 d2. e4 | o5 d2 o4 b2 | o5 c+1 | o5 f+2 a2 | o6 d2. c+4 | o5 b2 g2 | o5 a1' };
  // 밤의 마을 — 창문 불빛 자장가
  T.town_night = { bpm: 80, chords: 'F Dm Bb C F Dm Bb C', bass: 'long', arp: 'broken8', arpVol: 0.035, drums: 'none', leadWave: 'sq12', leadVol: 0.1,
    lead: 'o5 l4 a2 g4 f4 | o5 d2. r4 | o5 f2 e4 d4 | o5 c2. r4 | o5 a2 o6 c4 o5 a4 | o5 f2. d4 | o5 f2 e4 g4 | o5 f1' };
  // 비 오는 들판 — 젖은 풀 냄새
  T.rain = { bpm: 84, chords: 'Am Em F G Am Em Dm E', bass: 'long', arp: 'pad', arpWave: 'sine', arpVol: 0.04, drumMML: 'l8 [h r h h r h r h]', drumVol: 0.4, leadWave: 'sine', leadVol: 0.1,
    lead: 'o5 l4 e2 d4 c4 | o4 b2. r4 | o5 c2 o4 a4 o5 c4 | o5 d2. r4 | o5 e2 g4 e4 | o5 d2 c4 o4 a4 | o4 b1 | r1' };
  // 들판 싸움 — 몰려올 때
  T.skirmish = { bpm: 156, chords: 'Em C D Em Em C D B', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'battle', leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l8 e4 g a b4 a g | o5 e4 d e g4 e d | o5 f+4 a b o6 d4 o5 b a | o5 b2 r4 e4 | o5 e4 g a b4 o6 d e | o6 c4 o5 b a g4 e c | o5 d4 f+ a o6 d4 c o5 b | o5 b2 d+2' };
  // 정예 — 이름표가 번쩍이는 적
  T.elite = { bpm: 150, chords: 'Cm Ab Bb G Cm Ab Fm G', bass: 'gallop', arp: 'up16', arpVol: 0.045, drums: 'battle', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 c4 e- g o6 c4 o5 b- g | o5 a-4 e- c a-4 o6 c o5 a- | o5 b-4 f d b-4 o6 d o5 b- | o5 b2 g2 | o6 c4 o5 g e- c4 e- g | o5 a-4 o6 c e- d4 c o5 a- | o5 f4 a- o6 c o5 b-4 a- g | o5 g2 b2' };
  // 퍼즐 방 — 발판과 블록의 셈
  T.dungeon_puzzle = { bpm: 104, chords: 'C Am F G C Am Dm G', bass: 'walk', arp: 'off8', arpVol: 0.04, drums: 'soft', drumVol: 0.6, leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l8 e g e c d f d o4 b | o5 c e c o4 a b o5 d c o4 b | o4 a o5 c f a g f e d | o5 e4 d4 o4 b4 g4 | o5 e g e c d f d o4 b | o5 c e c o4 a b o5 d c o4 b | o4 a o5 d f a g f d o4 b | o5 c2 r2' };
  // 미로 — 같은 모퉁이를 또 도는 기분
  T.dungeon_maze = { bpm: 112, chords: 'Am Am Bb Bb Am Am E E', bass: 'pulse', arp: 'up16', arpVol: 0.035, drumMML: 'l8 [k r h r k h r h]', drumVol: 0.6, leadWave: 'sq12', leadVol: 0.1,
    lead: 'o5 l8 a b- a e a b- a e | o5 a b- a e a b- a e | o5 b- o6 c o5 b- f b- o6 c o5 b- f | o5 b- o6 c o5 b- f b- o6 d c o5 b- | o5 a b- a e a o6 c o5 b- a | o5 a b- a e a b- a e | o5 g+ a g+ e g+ b g+ e | o5 g+2 e2' };
  // 어둠 — 횃불 밖은 심장 소리뿐
  T.dungeon_dark = { bpm: 64, chords: 'Dm Dm Dm C Dm Dm Bb A', bass: 'long', bassVol: 0.2, drumMML: 'l4 [k r r r]', drumVol: 0.5, leadWave: 'sine', leadVol: 0.08,
    lead: 'o5 l2 r1 | a2 r2 | r1 | g2 f2 | r1 | d2 r2 | f2 e2 | c+1', harm: 'o3 l1 d d d c d d <b- a', harmWave: 'sawtooth', harmVol: 0.025 };
  // 깊은 구역 — 지도에 없는 층
  T.dungeon_deep = { bpm: 92, chords: 'Em Em C C Am Am B B', bass: 'sparse', arp: 'pad', arpVol: 0.05, drumMML: 'l4 [k r s r]', drumVol: 0.5, leadWave: 'sq12', leadVol: 0.11,
    lead: 'o4 l4 e2 g4 b4 | o4 a2 g4 f+4 | o4 e2. r4 | o4 g2 e2 | o4 a2 o5 c4 e4 | o5 d2 c4 o4 b4 | o4 b2 o5 d+4 f+4 | o5 b1' };
  // 격노 — 보스가 절반을 넘겼을 때
  T.boss_rage = { bpm: 184, chords: 'Em Em C D Em Em Am B', bass: 'gallop', arp: 'up16', arpVol: 0.05, drums: 'final', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 e4 e g b4 a g | o5 e4 f+ g a2 | o5 g4 a b o6 c4 o5 b a | o5 b2 f+2 | o5 e4 e g b4 o6 d e | o6 c4 o5 b a e4 a b | o6 c4 o5 b a b4 a g | o5 f+2 d+2' };
  // 무한의 탑 — 한 층 더
  T.tower = { bpm: 128, chords: 'C G Am F C G F G', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'march', drumVol: 0.8, leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l8 c4 e g o6 c4 o5 g e | o5 d4 g b o6 d4 o5 b g | o5 c4 e a o6 c4 o5 a e | o5 f2 a2 | o5 e4 g o6 c e4 d c | o5 d4 g b o6 d4 c o5 b | o5 a4 o6 c o5 a f4 a o6 c | o5 b2 o6 d2',
    harm: 'o4 l2 e g e d c d a b e g e d c d c d', harmWave: 'sq12', harmVol: 0.05 };
  T.tower_high = { bpm: 142, chords: 'Am F G E Am F G E', bass: 'gallop', arp: 'up16', arpVol: 0.045, drums: 'boss', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 a4 o6 c e a4 e c | o5 a4 o6 c f a4 f c | o5 b4 o6 d g b4 g d | o5 g+2 b2 | o5 a4 o6 c e a4 o7 c o6 a | o6 f4 a o7 c o6 f4 c o5 a | o5 g4 b o6 d g4 d o5 b | o5 g+2 e2' };
  // 옛 오락기 — 「무한으로 렙업하기」에 바치는 가락
  T.arcade = { bpm: 168, chords: 'C C F G C C G G', bass: 'oct', arp: 'up16', arpVol: 0.05, drums: 'dance', leadWave: 'sq50', leadVol: 0.1,
    lead: 'o5 l8 c e g o6 c o5 g e c e | o5 c e g o6 c e4 c o5 g | o5 f a o6 c f c o5 a f a | o5 g b o6 d g d o5 b g b | o5 c e g o6 c o5 g e c e | o5 c e g o6 c e4 g4 | o6 g f e d e4 d4 | o6 c2 r2' };
  // 별똥별 구덩이 — 떨어진 별의 숨
  T.crater = { bpm: 76, chords: 'Fmaj7 G Em Am Fmaj7 G Am Am', bass: 'long', arp: 'bell', arpVol: 0.05, drums: 'none', leadWave: 'sine', leadVol: 0.13,
    lead: 'o6 l4 c2 o5 b4 a4 | o5 b2 o6 d2 | o5 g2 e2 | o5 a1 | o6 c2 o5 b4 o6 e4 | o6 d2 o5 b2 | o6 c2 o5 a4 e4 | o5 a1',
    harm: 'o5 l1 a b g e a b e e', harmWave: 'sine', harmVol: 0.04 };
  // 안개 늪 — 가라앉은 것들의 물가
  T.mist = { bpm: 78, chords: 'Dm Am Bb F Dm Am E E', bass: 'sparse', arp: 'pad', arpVol: 0.04, drumMML: 'l2 [k r]', drumVol: 0.4, leadWave: 'sq12', leadVol: 0.1,
    lead: 'o5 l4 d2 f4 a4 | o5 e2. r4 | o5 f2 d4 o4 b-4 | o5 c2. r4 | o5 d2 f4 a4 | o6 c2 o5 a4 e4 | o5 g+2 e2 | o5 e1' };
  // 단풍 협곡 — 메아리가 사는 골짜기 (3박)
  T.amber = { bpm: 108, bpb: 3, chords: 'G Em C D G Em C D', bass: 'waltz', arp: 'waltz', drums: 'waltz', leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l4 d g b | o5 a2 g | o5 e g o6 c | o5 b2 a | o5 d g b | o6 d2 c | o5 b a f+ | o5 g2.' };
  // 축제의 밤 — 불꽃이 다 지고 난 뒤
  T.festival_night = { bpm: 96, chords: 'C Am F G C Am F G', bass: 'long', arp: 'bell', arpVol: 0.045, drums: 'soft', drumVol: 0.5, leadWave: 'sine', leadVol: 0.12,
    lead: 'o5 l4 e2 g4 e4 | o5 c2. r4 | o5 a2 o6 c4 o5 a4 | o5 g2. r4 | o5 e2 g4 o6 c4 | o5 b2 a4 g4 | o5 f2 a4 f4 | o5 g1' };
  // 먼 길 — 여덟 번째 장부터의 들판
  T.journey = { bpm: 118, chords: 'Am F C G Am F G G', bass: 'oct', arp: 'up16', arpVol: 0.045, drums: 'rock', leadWave: 'sq25', leadVol: 0.1,
    lead: 'o5 l8 e4 a4 o6 c4 o5 b a | o5 f4 a4 o6 c4 o5 a f | o5 e4 g4 o6 c4 d e | o6 d2 o5 b2 | o5 c4 e4 a4 g f | o5 f4 a4 o6 c4 d c | o5 b4 o6 d4 o5 b4 g a | o5 b2. r4' };

  /* ───────── 팡파르 ───────── */
  const J = {
    levelup: { bpm: 200, parts: [{ mml: 'o5 l16 c e g >c8< g8 >c4.<', wave: 'sq50', vol: 0.12 }, { mml: 'o3 l16 c8 r8 g8 >c4.<', wave: 'triangle', vol: 0.3 }] },
    item: { bpm: 180, parts: [{ mml: 'o5 l16 g >c e g4.<', wave: 'sq25', vol: 0.12 }] },
    key: { bpm: 150, parts: [{ mml: 'o5 l8 c e g >c4 e4 c2<', wave: 'sq25', vol: 0.12 }, { mml: 'o3 l2 c g >c2<', wave: 'triangle', vol: 0.3 }] },
    orb: { bpm: 110, parts: [{ mml: 'o6 l8 e g >c< g >c e4 c2<', wave: 'sine', vol: 0.14 }, { mml: 'o4 l4 c e g >c2<', wave: 'sq12', vol: 0.06 }] },
    win: { bpm: 170, parts: [{ mml: 'o5 l16 g8 g8 g8 >c4< r8 a4 b4 >c2<', wave: 'sq50', vol: 0.11 }, { mml: 'o3 l8 c c c c4 r f4 g4 c2', wave: 'triangle', vol: 0.3 }] },
    bosswin: { bpm: 150, parts: [{ mml: 'o5 l16 c8 e8 g8 >c4< r8 a-4 b-4 >c4 r8 e8 d8 c8 e2<', wave: 'sq50', vol: 0.11 }, { mml: 'o3 l8 c4 c4 c4 r a-4 b-4 >c4< r c c c2', wave: 'triangle', vol: 0.3 }, { mml: 'l8 k r s r k k s r k s k s k k s o', drum: true }] },
    rest: { bpm: 90, parts: [{ mml: 'o5 l4 c e g >c2< g4 >c2.<', wave: 'sq12', vol: 0.12 }, { mml: 'o3 l2 c e g >c2.<', wave: 'triangle', vol: 0.25 }] },
    rankup: { bpm: 170, parts: [{ mml: 'o5 l16 c e g >c e g >c2<<', wave: 'sq25', vol: 0.12 }, { mml: 'o4 l16 g >c e g >c e g2<<', wave: 'sq12', vol: 0.07 }, { mml: 'o3 l4 c g >c2<', wave: 'triangle', vol: 0.3 }] },
    quest: { bpm: 160, parts: [{ mml: 'o5 l16 e g >c8<', wave: 'sq25', vol: 0.1 }] },
    secret: { bpm: 140, parts: [{ mml: 'o5 l16 g f+ d+ <a g+ >e g+ >c4<', wave: 'sq25', vol: 0.12 }] },
    white: { bpm: 100, parts: [{ mml: 'o6 l8 c g >c< e g >c4<', wave: 'sine', vol: 0.14 }, { mml: 'o4 l2 c g >c2<', wave: 'sq12', vol: 0.05 }] },
  };

  G.music = { tracks: T, jingles: J };
})();
