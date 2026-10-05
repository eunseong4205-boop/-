/* 사이 막 하나 · 둘 · 셋 — 그린→레드 「바퀴 자국」 · 레드→블루 「쏠림」 · 옐로→퍼플 「소환장」
   · 바퀴 자국: 그린 탑에서 걷힌 빛이 「천년성 송부」라는 서류를 달고 서쪽(광산)으로 간다. 고르디가 처음으로 의심한다.
     수레를 막는 방법(정면 · 감찰 · 밤) → 항아리(돌려보낸다 · 고르디에게 · 한 모금) → 개울목에서 고르디가 무엇을 지킬지
   · 쏠림: 광산의 기계가 멈춘 밤 하늘의 검은 점이 움찔했다. 아스텔이 처음으로 「한 점에 몰린 빛」 — 너 — 를 말한다.
     사본을 어디로(등대지기 · 카이론 · 불) → 빛을 따라온 것들 → 산사태 → 카시안의 전서구(블루 부두의 두 번째 심사)
   · 소환장: 사천왕 회의 전 천년성의 소환장. 회의 서기를 구하고 안건 둘째 줄 「흰빛 후보의 사용 — 넣을 곳」을 본다.
     국경 초소에서 소환장 · 고르디의 통행패 · 참새단의 폭죽 · 칼 중 하나로 넘는다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TS = G.tiles.TS;
  const ST = G.story, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!(G.state && G.state.flags[k]);
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };
  const K = ST.actKit;
  const { comes, goes, tori } = K;
  const knight = (o) => G.cast.folk('knight', o || {});

  /* ── 물건 · 진실 ── */
  item('a1_pass', { type: 'key', name: '그린 담당 통행패', desc: '징수 기사 고르디가 건넨 나무 패. 기사들 앞에서 한 번쯤은 쓸모가 있다.', read: '패 뒷면에 칼끝으로 새긴 글씨. 「이 사람은 내가 안다. — 고르디」' });
  item('a2_copy', { type: 'key', name: '아스텔의 관측 사본', desc: '광산의 기계가 멈춘 밤, 검은 점이 움찔한 기록. 블루 등대지기에게 보여 주라고 했다.', read: '「광산에서 빛 기둥. 같은 순간, 흑점 가장자리가 광산 쪽으로 일렁임. 한 호흡.」\n귀퉁이에 작은 글씨 — 「두 사람이 본 것을 맞추면 하나가 된다.」' });
  item('a2_letter', { type: 'key', name: '카시안의 전서', desc: '하얀 매가 물고 온 짧은 편지. 「두 번째 심사는 블루에서.」', read: '「두 번째 심사는 블루에서. 부두에서 기다리겠다. 검을 닦아 두어라. — 카시안」' });
  item('a4_summons', { type: 'key', name: '천년성 소환장', desc: '붉은 밀랍 인장. 「흰빛 후보는 사천왕 회의 전까지 천년성에 출두할 것.」', read: '「흰빛 후보는 사천왕 회의 전까지 천년성에 출두할 것. 출두하지 않으면 보호한다.」\n「보호」라는 글자만 잉크가 진하다. 두 번 덧쓴 것처럼.' });
  D.TRUTHS.t_agenda = { name: '회의의 둘째 안건', hint: '사천왕 회의 서기가 나르던 문서.',
    text: '사천왕 회의의 안건은 둘이었다. 하나, 흑점까지 남은 날의 재계산. 둘, 흰빛 후보의 「사용」 — 넣을 곳의 결정.',
    long: ['모래 위에 흩어진 회의 문서. 천년성의 문장이 찍힌 안건표.', '「안건 하나. 흑점 접근 — 남은 날의 재계산.」', '[r]「안건 둘. 흰빛 후보의 사용 — 넣을 곳의 결정.」[/]', '「넣을 곳」 옆에 누군가 연필로 적었다가 지운 자국이 있다. 「수정」.'] };

  /* ═════════ 사이 막 하나 — 바퀴 자국 (그린 → 레드) ═════════ */
  const A1 = ST.act({
    id: 'a1', from: 'c1', to: 'c2', next: 'red', A: 'green', B: 'red', gap: 'g1',
    title: '바퀴 자국', closed: '찍… 아직이야. 고르디 아저씨 부탁부터.',
    openMsg: '사이 막 「바퀴 자국」 — 레드로 가는 길이 열렸다',
    spots: { camp: { frac: 0.3, kind: 'camp' }, ford: { frac: 0.9, kind: 'road' } },
    steps: [
      { id: 'call', kind: 'auto', delay: 5, goal: '서쪽 길로 마을을 나서자.',
        async run(c) {
          const g = await comes(c, { cid: 'gordi' }, 72);
          if (!g) return false;
          await c.chapter('사이 막', '바퀴 자국', '탑에서 걷힌 빛은 하늘로 간다고 했다. 그런데 수레는 서쪽으로 갔다.');
          await c.say(g, '헉… 헉. 기다려! 후보! …아, 후보라고 부르면 안 되나. 장부엔 그렇게만 적혀 있어서.', { face: 'shock' });
          await tori(c, '찍? 탑 지키던 고르디 아저씨다.', 'shock');
          await c.say(g, '오늘 새벽, 탑에서 수레 세 대가 나갔어. 마을 특별 징수분. 서류엔 「천년성 송부」라고 적혀 있고.', { face: 'normal' });
          await c.say(g, '그런데 천년성은 북쪽이야. 수레는 서쪽으로 갔어. 레드 쪽으로. 인장은 부단장님 거고.', { face: 'think' });
          await c.say(g, '나는 규칙을 좋아해. 규칙은 서류랑 바퀴가 같은 쪽으로 가야 한다고 말하지.', { face: 'closed' });
          const k = await c.choice(null, ['수레를 쫓아가 보겠다고 한다', '왜 직접 안 가냐고 묻는다', '항아리에 무엇이 들었냐고 묻는다']);
          c.flag('a1_ask' + k);
          if (k === 0) await c.say(g, '…고마워. 이상하지. 기사가 꼬마한테 부탁을 하다니.', { face: 'sad' });
          else if (k === 1) {
            await c.say(g, '탑을 비우면 「근무지 이탈」. 장부에 적히면 그게 명령이 되거든. …비겁하지. 알아.', { face: 'sad' });
            await c.say(g, '그래서 너한테 부탁하는 거야. 너는 아직 장부에 「후보」라고만 적혀 있으니까.', { face: 'normal' });
          } else {
            await c.say(g, '빛이야. 특별 징수 때 걷은 것. 항아리마다 이름표가 붙어. 누구한테서 걷었는지.', { face: 'closed' });
            await c.say(g, '…노아 이름도 있었어. 그 애는 손끝 빛까지 냈어.', { face: 'sad' });
            await tori(c, '…찍.', 'angry');
          }
          await c.say(g, '서쪽 길을 따라가면 깊게 팬 바퀴 자국이 보일 거야. 항아리가 무거워서.', { face: 'normal' });
          await c.say(g, '무슨 일이 생기면 레드 가는 개울목에서 기다릴게. 교대가 끝나면 그리로 갈 거야.', { face: 'smile' });
          goes(c, g, 60);
          c.journal('그린의 징수 기사 고르디가 부탁했다. 「천년성」으로 가야 할 징수 수레가 서쪽, 레드 쪽으로 갔다고.');
        } },
      { id: 'camp', kind: 'reach', at: 'camp', r: 7, goal: '서쪽 길가, 깊게 팬 바퀴 자국을 따라가자. (징수 수레)',
        wait: [{ name: '호송 반장 브론', look: knight({ hc: '#5a3a2a', beard: '#5a3a2a' }), dx: 0, dy: -1, dir: 'down' }, { name: '징수 기사', look: knight(), dx: -1, dy: 1, dir: 'right' }, { name: '징수 기사', look: knight(), dx: 1, dy: 1, dir: 'left' }],
        async run(c, X) {
          const B = X.npc(0), k1 = X.npc(1), k2 = X.npc(2);
          c.music('danger');
          await c.narr('길가 공터에 수레가 서 있었다. 덮개 아래에서 무언가 희미하게 빛났다. 가끔 아이 울음 같은 소리가 났다.');
          await tori(c, '찍… 항아리가 울어.', 'sad');
          await c.say(k1, '반장님. 천년성은 북쪽 아닙니까?', { face: 'normal' });
          await c.say(B, '장부에 「천년성」이라고 적었으면 천년성이야. 바퀴가 어디로 굴러가든.', { face: 'smirk' });
          await c.say(k2, '부단장님이 광산에 커다란 기계를 들였답니다. 그게 배가 고프대요.', { face: 'normal' });
          await c.say(B, '배고픈 기계라. 우리랑 똑같군. 먹이면 조용해지지.', { face: 'smirk' });
          c.emote(B, '!');
          await c.say(B, '…거기. 그 검. 광장에서 탑을 울린 꼬마로군. 부단장님이 얼굴을 기억해 두라 하셨지.', { face: 'angry' });
          const k = await c.choice('기사들이 일어선다. 덮개 밑에서 항아리가 또 운다.', [
            { t: '「그 빛은 그린 마을 거야. 내려놔.」', tag: 'dawn', sub: '정면으로. 지금.' },
            { t: '「후보의 감찰이다. 송부 장부를 보여 줘.」', tag: 'order', sub: '카시안이 남긴 이름을 댄다.' },
            { t: '물러나는 척하고 해가 지기를 기다린다', tag: 'night', sub: '수레는 밤에도 서 있다.' },
          ]);
          const tag = ['dawn', 'order', 'night'][k];
          c.route(tag, 1); S().flags.a1_way = tag;
          if (k === 0) await c.say(B, '하! 그린 촌놈이 법을 아나? 잡아!', { face: 'angry' });
          else if (k === 1) {
            await c.say(B, '…카시안 님 서명. 진짜군. 쳇.', { face: 'normal' });
            await c.narr('반장이 마지못해 펼친 송부 장부. 받는 곳 칸에는 「천년성」. 그 옆에 아주 작은 글씨 — 「광산 시동분 · 부단장 직할」.');
            await tori(c, '찍! 천년성이 아니라 광산이래!', 'angry');
            c.flag('a1_ledger_seen');
            await c.say(B, '못 본 거다. 후보는 심사나 받아. …얘들아, 후보님 길 좀 「안내」해 드려라.', { face: 'smirk' });
          } else {
            await c.fade(true, { sec: 0.6 });
            await c.narr('해가 졌다. 모닥불 곁에서 기사들이 꾸벅꾸벅 졸았다.');
            await c.fade(false, { sec: 0.6 });
            await c.narr('수레 쪽으로 반쯤 다가갔을 때, 검은 고양이 한 마리가 덮개 위로 뛰어올랐다. 항아리 하나가 굴러떨어지며 울었다.');
            await c.say(k1, '뭐, 뭐야! 쥐새끼다! 사냥개 풀어!', { face: 'shock' });
          }
          await c.say(B, '나는 부단장님께 보고하러 간다. 너희가 처리해!', { face: 'angry' });
          goes(c, B, 80);
          await c.wait(0.3);
        },
        fight: () => {
          const nt = S().flags.a1_way === 'night';
          return [{ type: 'knight', from: 1, hpMul: 0.6 }, { type: 'knight', from: 2, hpMul: 0.6 }, nt ? { type: 'wolf', dx: 2, dy: 2, hpMul: 0.8, name: '징수 사냥개' } : { type: 'knight', dx: 0, dy: 3, hpMul: 0.6 }];
        },
        fightMsg: '징수 기사들을 물리쳐라! (정면은 방패로 막는다 — 옆으로 돌아가거나 회전 베기)',
        fightGoal: '수레를 지키는 징수 기사들을 물리치자.',
        again: '징수 기사들이 수레 앞을 다시 막아선다!',
        async after(c) {
          c.music('sad');
          await c.narr('기사들이 무릎을 꿇었다. 반장 브론은 벌써 서쪽으로 달아난 뒤였다. 레드 쪽으로.');
          await tori(c, '찍. 부단장한테 일러바치러 갔어.', 'angry');
          await c.narr('덮개를 걷자 항아리들이 줄지어 있었다. 마개마다 이름표. 「베르나」 「카렐」 「마리엔」… 그리고 「노아 — 손끝」.');
          const k = await c.choice('항아리 속에서 초록빛이 출렁인다. 검이 손 안에서 따뜻하게 뛴다.', [
            { t: '마개를 연다 — 빛을 그린으로 돌려보낸다', sub: '바람이 마을 쪽으로 분다.' },
            { t: '봉한 채 고르디에게 맡긴다', sub: '이장 앞에서, 이름을 불러 가며 돌려주게.' },
            { t: '…한 모금만 들이마신다', sub: '배가 고프다. 아주 조금만.' },
          ]);
          const p = W().player;
          if (k === 0) {
            c.flag('a1_open'); S().flags.graus_grudge = (S().flags.graus_grudge || 0) + 1;
            c.sfx('white'); c.flash('#c8ffc8', 0.5);
            for (let i = 0; i < 46; i++) G.fx.part({ x: p.x + (Math.random() - 0.5) * 30, y: p.y - 10, z: 6, vx: 120 + Math.random() * 60, vy: -20 + (Math.random() - 0.5) * 40, g: 0, life: 1.2, col: '#8ae08a', size: 1, glow: true });
            await c.narr('마개가 하나씩 열렸다. 초록빛이 실처럼 풀려 동쪽 하늘로 흘렀다. 그린 마을 지붕들 위로, 아주 잠깐 봄볕 같은 것이 내려앉았다.');
            await tori(c, '…노아 손끝, 지금쯤 따뜻해졌을까.', 'smile');
          } else if (k === 1) {
            c.flag('a1_keep');
            await c.narr('덮개를 도로 덮고 끈을 묶었다. 이름표가 보이게.');
            await tori(c, '찍. 느리지만 맞는 방법이야. 할머니라면 「이름 불러 가믄서 돌려줘라」 했을 거야.', 'normal');
          } else {
            c.flag('a1_sip'); c.flag('a1_keep'); c.abyss('a1_sip');
            c.sfx('drain'); c.flash('#ffffff', 0.4); G.fx.glow(p.x, p.y - 10, '#c8ffc8', 16);
            await c.narr('마개를 조금 열고 숨을 들이쉬었다. 초록빛 한 줄기가 목으로 넘어갔다. 달았다. 아주 많이.');
            c.exp(60);
            await c.narr('항아리 하나가 조용해졌다. 이름표의 글씨가 조금 흐려진 것 같았다.');
            await tori(c, '…야. 너 방금 뭐 했어. 할머니가 그랬잖아. 입에 침이 고이면 멈추라고.', 'angry');
            const kk = await c.choice(null, ['「…미안.」', '「조금이었어.」']);
            if (kk === 0) await tori(c, '…응. 미안하다고 하면 됐어. 나머지는 고르디 아저씨한테 맡기자.', 'sad');
            else { c.flag('a1_sip_more'); await tori(c, '조금이 제일 무서운 거래. 조금은 다음에 또 조금이 되니까.', 'sad'); }
          }
          c.exp(30);
          c.journal(k === 0 ? '징수 수레를 막았다. 항아리의 빛을 그린으로 돌려보냈다. 반장 브론은 광산으로 달아났다.' : k === 1 ? '징수 수레를 막았다. 항아리는 봉한 채 고르디에게 맡기기로 했다. 반장 브론은 광산으로 달아났다.' : '징수 수레를 막았다. 항아리의 빛을 한 모금 마셨다. 달았다. 토리아가 화를 냈다.');
        } },
      { id: 'ford', kind: 'reach', at: 'ford', r: 6, goal: '레드 가는 개울목에서 고르디를 만나자.',
        wait: [{ cid: 'gordi', dx: 1, dy: 0, dir: 'left' }],
        async run(c, X) {
          const g = X.npc(0);
          c.faceEach('hero', g);
          await c.say(g, '왔구나. …얼굴 보니 알겠다. 내 서류가 맞았지.', { face: 'sad' });
          if (f('a1_open')) {
            await c.say(g, '아까 마을 쪽 하늘이 초록으로 번쩍였어. 다들 지붕에 올라가 봤지.', { face: 'smile' });
            await c.say(g, '장부엔 「운송 중 분실」이라고 적어야겠네. 거짓말은 아니야. 잃어버렸지. 원래 주인한테로.', { face: 'smirk' });
          } else await c.say(g, '항아리는 내가 이장님 앞에서 하나씩 열게. 이름을 불러 가면서. 늦어도 그게 맞아.', { face: 'normal' });
          if (f('a1_sip')) {
            c.emote(g, '?');
            await c.say(g, '…그런데 너, 눈이 이상해. 빛이 좀 너무 밝아.', { face: 'think' });
            await tori(c, '찍! 아, 아무것도 아니야! 햇빛 때문이야!', 'shock');
          }
          await c.say(g, '반장 브론은 광산으로 갔어. 이제 너는 「얼굴」이 아니라 「이름」이야. 기사단 장부에.', { face: 'closed' });
          await c.say(g, '나도 이제 장부에 적히겠지. 「근무 중 의심함」. …처음이야. 기분이 이상하게 괜찮네.', { face: 'smile' });
          const k = await c.choice(null, ['같이 레드로 가자고 한다', '마을을 지켜 달라고 한다', '「규칙을 계속 믿어도 돼요?」']);
          if (k === 0) { c.flag('a1_g_go'); c.bond('gordi', 1); await c.say(g, '나는 그린 담당이야. 담당이 자리를 비우면 그 자리에 더 나쁜 사람이 와. …그래도 고마워. 같이 가자는 말, 처음 들어 봐.', { face: 'smile' }); }
          else if (k === 1) { c.flag('a1_g_guard'); c.bond('gordi', 2); await c.say(g, '지킬게. 탑 말고 사람을. 그건 규칙에 없어도 할 수 있으니까.', { face: 'smile' }); }
          else { c.flag('a1_g_rule'); c.bond('gordi', 1); await c.say(g, '…규칙은 사람을 지키려고 만든 거야. 짜내려고 만든 게 아니고. 그걸 잊은 규칙은 고쳐야지. 누가 됐든.', { face: 'closed' }); }
          await c.say(g, '이거 받아. 그린 담당 징수 기사의 통행패. 기사들 앞에서 한 번쯤은 쓸모가 있을 거야.', { face: 'normal' });
          await c.getItem('a1_pass');
          await c.say(g, '레드 광산에는 배고픈 기계가 있대. …그 애 이름 기억하지? 노아. 장부 말고 그 이름으로 기억해 줘.', { face: 'sad' });
          goes(c, g, 40);
          c.exp(20);
          await tori(c, '찍. 이 개울만 건너면 레드야. 땅에서 뜨거운 냄새가 나.', 'normal');
          c.journal('개울목에서 고르디가 통행패를 건넸다. 「장부 말고 이름으로 기억해 줘.」 이제 레드로.');
        } },
    ],
  });
  void A1;

  /* ═════════ 사이 막 둘 — 쏠림 (레드 → 블루) ═════════ */
  const BEL = () => ({ name: '관측 조수 벨', look: G.cast.folk('student', { gender: 'girl', hair: 'bob', hc: '#5a3a2a', tc: '#8a3a2a', glasses: true }) });
  const A2 = ST.act({
    id: 'a2', from: 'c2', to: 'c3', next: 'blue', A: 'red', B: 'blue', gap: 'g2',
    title: '쏠림', closed: '찍… 블루는 조금 이따가. 아직 할 일이 있어.',
    openMsg: '사이 막 「쏠림」 — 블루로 가는 길이 열렸다',
    spots: { swarm: { frac: 0.85, kind: 'road' } },
    steps: [
      { id: 'bel', kind: 'auto', delay: 5, goal: '마을을 나서자. 블루 쪽, 산길로.',
        async run(c) {
          const b = await comes(c, BEL(), 78);
          if (!b) return false;
          await c.chapter('사이 막', '쏠림', '광산의 기계가 멈춘 밤, 하늘의 검은 점이 움찔했다.');
          await c.say(b, '찾았다! 그린에서 온 애! 박사님이… 박사님이 당장 데려오래요!', { face: 'shock' });
          await c.say(b, '광산 기계가 멈춘 밤에요, 광산에서 빛 기둥이 솟았거든요. 그런데 그 순간 — 망원경 속 검은 점이 움찔했어요.', { face: 'shock' });
          await c.say(b, '박사님이 오래 안 열던 금고를 열었어요. 그러고는 「흰빛 꼬마를 데려와」 그러셨어요.', { face: 'normal' });
          await tori(c, '찍… 검은 점이 우리를 봤다는 거야?', 'shock');
          await c.say(b, '봤는지는 몰라요. 근데 고개를 돌린 건 맞아요. 관측소에서 기다릴게요!', { face: 'happy' });
          goes(c, b, 80);
          c.journal('관측 조수 벨이 달려왔다. 광산의 기계가 멈춘 밤, 하늘의 검은 점이 움찔했다고. 아스텔 박사가 부른다.');
        } },
      { id: 'astel', kind: 'talk', map: 'r_obs', x: 7, y: 5, goal: '붉은 산 관측소의 아스텔 박사에게 가자.',
        async run(c) {
          const n = c.who('astel');
          c.flag('met:astel');
          c.music('space');
          await c.say('astel', '왔군. 망원경 앞에 서라. 망원경은 서서 보는 거다.', { face: 'closed' });
          await c.narr('망원경 속, 황금별 곁의 검은 점. 그 가장자리가 물결처럼 일렁였다.');
          await c.say('astel', '광산 착즙기가 그날 밤 멈췄지. 갇힌 빛이 한꺼번에 하늘로 솟았다. 그리고 저 점이 그쪽으로 고개를 틀었어. 한순간.', { face: 'normal' });
          if (!S().truth.t_chart) await c.say('astel', '나는 오래전에 표를 하나 그렸다. 빛이 한 점에 몰리면 저게 다가온다는 표. 누가 믿겠나 싶어 덮었지.', { face: 'sad' });
          else await c.say('astel', '내 표, 봤지? 이제 표가 아니라 눈으로 본 거다. 쏠림. 한 점에 몰린 빛.', { face: 'closed' });
          await c.say('astel', '…그런데 지금 이 대륙에서 빛이 가장 한 점에 몰려 있는 건 어디일 것 같나.', { face: 'closed' });
          await tori(c, '…찍? 탑? 천년성?', 'think');
          await c.say('astel', '그것도 맞다. 그런데 오늘 밤엔 하나가 더 있다. 내 앞에 서 있는 아이.', { face: 'sad' });
          await c.say('astel', '흰빛은 나눌수록 넓어진다더군. 반대로 삼키면 — 한 점이 된다. 조심해라. 네가 배부를수록, 저것도 배가 고파진다.', { face: 'normal' });
          if (f('a1_sip')) await tori(c, '…찍. (항아리 한 모금. 말 안 할 거야.)', 'sad');
          const k = await c.choice('아스텔이 바랜 종이 한 장을 내민다. 그날 밤의 관측을 새로 베낀 사본이다.', [
            { t: '블루 등대지기에게 가져가겠다', sub: '17년 전 「흰 줄기」를 적은 항해일지와 맞춰 보라고.' },
            { t: '카이론에게 보내자고 한다', tag: 'order', sub: '이번엔 표가 아니라 증인이 있다.' },
            { t: '태워 버리자고 한다', tag: 'night', sub: '사람들이 알면 겁에 질린다.' },
          ]);
          if (k === 0) {
            c.flag('a2_luce');
            await c.say('astel', '…루체 말이군. 등대지기의 딸. 그 아비가 983년 겨울에 본 것이 있지. 두 사람이 본 걸 맞추면 하나가 된다.', { face: 'smile' });
            await c.getItem('a2_copy');
          } else if (k === 1) {
            c.flag('a2_kairon'); c.route('order', 1);
            await c.say('astel', '편지를 여러 번 보냈다. 답장은 한 줄뿐이었지. 「계산은 끝났다.」', { face: 'closed' });
            await c.say('astel', '좋다. 한 번 더. 이번엔 증인 이름을 적지. 「흰빛 후보, 같이 보았음.」 그 사람은 장부는 읽으니까.', { face: 'sad' });
          } else {
            c.flag('a2_burn'); c.route('night', 1);
            await c.say('astel', '…겁에 질린 사람은 빛을 더 꽉 쥐지. 그것도 쏠림이야. 네 말이 맞을지도 모르겠다.', { face: 'sad' });
            c.sfx('fire');
            await c.narr('사본이 화로 속에서 오그라들었다. 아스텔은 원본만 금고에 다시 넣었다. 이번엔 자물쇠를 채우지 않았다.');
          }
          if (!S().truth.t_chart && await c.confirm('금고의 원본 표도 볼까?', '본다', '괜찮다')) {
            c.truth('t_chart');
            for (const l of D.TRUTHS.t_chart.long) await c.narr(l);
          }
          await c.say('astel', '그리고 하나 더. 돌아가는 길엔 등불을 낮게 들어라. 빛을 따라오는 것들이 있다. 요즘 밤마다 산길에 모여든다.', { face: 'normal' });
          c.exp(30);
          void n;
          c.journal(k === 0 ? '아스텔 박사가 그날 밤의 관측 사본을 건넸다. 블루의 등대지기 루체에게 보여 주기로 했다.' : k === 1 ? '아스텔 박사가 카이론에게 한 번 더 편지를 쓰기로 했다. 이번엔 증인으로 내 이름을 적었다.' : '아스텔 박사의 관측 사본을 태웠다. 겁에 질린 사람은 빛을 더 꽉 쥔다.');
        } },
      { id: 'swarm', kind: 'reach', at: 'swarm', r: 6, goal: '블루 쪽으로. 산길을 따라가자. (등불을 낮게)',
        async run(c) {
          c.music('danger');
          await c.narr('산길이 갑자기 조용해졌다. 풀벌레 소리가 끊겼다. 어둠 속에서 작은 빛들이 하나둘 떠올랐다 — 모두 이쪽을 향해.');
          await tori(c, '찍…! 저것들 우리 쪽으로 와! 너한테로!', 'shock');
          await tori(c, '박사님 말이 맞아. 빛 냄새를 맡은 거야!', 'angry');
        },
        fight: () => [{ type: 'wisp', dx: -3, dy: -2, tier: 1 }, { type: 'wisp', dx: 3, dy: -2, tier: 1 }, { type: 'wisp', dx: 0, dy: -4, tier: 1 }, { type: 'bat', dx: -4, dy: 1, tier: 1 }, { type: 'bat', dx: 4, dy: 1, tier: 1 }],
        fightMsg: '빛을 따라온 것들이 몰려든다!',
        fightGoal: '빛을 따라온 것들을 물리치자.',
        again: '빛을 따라온 것들이 다시 모여든다!',
        async after(c) {
          await c.narr('마지막 빛이 꺼지자 풀벌레 소리가 돌아왔다.');
          await tori(c, '…너 렙업할 때마다 빛이 커지잖아. 그럼 저런 게 점점 더 많이 와?', 'sad');
          const k = await c.choice(null, ['「그럼 나눠야겠다.」', '「그럼 더 세지면 돼.」', '「모르겠어.」']);
          if (k === 0) { c.flag('a2_share'); await tori(c, '…응. 할머니랑 똑같은 말 했어. 찍.', 'smile'); }
          else if (k === 1) { c.flag('a2_strong'); await tori(c, '…세지면 더 많이 와. 그게 쏠림이라며. 찍. 바보.', 'sad'); }
          else await tori(c, '모르는 거 모른다고 하는 거, 좋아. 같이 알아내자.', 'normal');
          c.exp(25);
          c.journal('산길에서 빛을 따라온 것들에게 둘러싸였다. 빛이 한 점에 몰리면 무언가가 따라온다.');
        } },
      { id: 'slide', kind: 'cond', done: () => f('slide_clear'),
        goalFn: () => (ST.RED && ST.RED.slideAt ? { text: '블루 가는 길의 산사태를 폭탄으로 치우자. (도구 버튼으로 폭탄을 놓는다)', map: 'world', x: ST.RED.slideAt[0] - 2, y: ST.RED.slideAt[1] } : null), goal: '블루 가는 길의 산사태를 치우자.' },
      { id: 'hawk', kind: 'auto', delay: 2, inTown: true, goal: '산사태가 치워졌다. 블루 쪽으로.',
        async run(c) {
          c.sfx('wind');
          await c.narr('바위 먼지가 가라앉을 무렵, 하얀 매 한 마리가 내려앉았다. 다리에 붉은 끈. 천년성 기사단의 전서구.');
          await c.say(null, '「후보에게. 그라우스 부단장의 광산 일, 보고받았다.」', { style: 'sys' });
          const rt = S().flags.c2_route;
          await c.say(null, rt === 'dawn' ? '「장부가 불탔다더군. 증거 대신 소문이 남았다. 소문은 칼보다 빠르다.」' : rt === 'order' ? '「루드의 장부는 법정으로 갔다. 부단장은 곧 선다. 네 덕이다. 고맙다는 말은 직접 하겠다.」' : '「부단장의 금고가 비었다. 누가 했는지 아무도 모른다. 나는 모른다고 적었다. 아직은.」', { style: 'sys' });
          if (f('a1_ledger_seen')) await c.say(null, '「그린 송부 장부의 「광산 시동분」 — 고르디가 네가 본 것을 적어 보냈다. 기억해 두마.」', { style: 'sys' });
          if (f('a2_kairon')) await c.say(null, '「붉은 산 관측소에서 온 편지가 천년성에 닿았다. 스승님이 그 편지를 끝까지 읽으셨다. 처음 보는 일이다.」', { style: 'sys' });
          await c.say(null, '「두 번째 심사는 블루에서. 부두에서 기다리겠다. 검을 닦아 두어라. — 카시안」', { style: 'sys' });
          await tori(c, '찍… 카시안. 검으로 묻겠다는 사람이야. 블루 가면 싸워야 해?', 'shock');
          const k = await c.choice('매가 고개를 갸웃거린다. 답장을 기다리는 것 같다.', ['답장을 쓴다: 「부두에서 보자.」', '답장 없이 매를 날려 보낸다', '매에게 도토리를 나눠 준다']);
          if (k === 0) { c.flag('a2_reply'); c.bond('cassian', 1); await c.narr('종이 귀퉁이에 짧게 적어 매 다리에 묶었다. 매가 남쪽 하늘로 날아올랐다.'); }
          else if (k === 1) { c.flag('a2_silent'); await c.narr('매는 한참 기다리다 빈 다리로 날아갔다. 대답하지 않는 것도 대답이다.'); }
          else { c.flag('a2_acorn'); await tori(c, '내 도토리야! …반만. 반만 줄게. 찍. 매가 먹었어! 매도 도토리 먹어!', 'happy'); await c.narr('매는 도토리를 삼키고 토리아를 한참 내려다본 뒤 날아갔다. 어딘가 만족한 얼굴로.'); }
          await c.getItem('a2_letter');
          c.journal('카시안의 전서구가 왔다. 「두 번째 심사는 블루에서. 부두에서 기다리겠다.」');
        } },
    ],
  });
  ST.actTalk(A2, 'astel', 'r_obs', 'astel');

  /* ═════════ 사이 막 셋 — 소환장 (옐로 → 퍼플) ═════════ */
  const A4 = ST.act({
    id: 'a4', from: 'c4', to: 'c5', next: 'purple', A: 'yellow', B: 'purple', gap: 'g4',
    title: '소환장', closed: '찍. 국경 초소를 그냥 지나칠 순 없대. 피카 말 기억나?',
    openMsg: '사이 막 「소환장」 — 퍼플로 가는 길이 열렸다',
    spots: { worm: { frac: 0.45, kind: 'cart' }, fort: { frac: 0.86, kind: 'fort' } },
    steps: [
      { id: 'pika', kind: 'auto', delay: 5, goal: '북서쪽, 퍼플 가는 길로 나서자.',
        async run(c) {
          const n = await comes(c, { cid: 'pika' }, 84);
          if (!n) return false;
          await c.chapter('사이 막', '소환장', '사천왕 회의가 열린다. 탁자 위에 오를 이름은 둘 — 흑점, 그리고 흰빛.');
          await c.say(n, '헥, 헥… 찾았다! 흰빛! 이거, 기사 아저씨 가방에서 「빌린」 건데!', { face: 'happy' });
          await tori(c, '찍. 또 훔쳤어?', 'smirk');
          await c.say(n, '빌린 거야! 돌려줄 거야! …아마도. 근데 여기 네 이름이 있어. 봐 봐.', { face: 'normal' });
          await c.narr('붉은 밀랍 인장. 천년성의 문장. 「흰빛 후보는 사천왕 회의 전까지 천년성에 출두할 것. 출두하지 않으면 보호한다.」');
          await c.say(n, '「보호」가 뭐야? 우리 골목에선 그게 「잡아간다」는 뜻이거든.', { face: 'think' });
          await c.say(n, '그리고 그 기사 아저씨들, 국경 초소로 갔어. 퍼플 가는 길목. 너 기다린대.', { face: 'shock' });
          const k = await c.choice('소환장을 쥔 손에 밀랍 가루가 묻는다.', [
            { t: '소환장을 찢는다', tag: 'dawn', sub: '「갈 때가 되면 내 발로 간다.」' },
            { t: '소환장을 접어 품에 넣는다', tag: 'order', sub: '출두는 하겠다. 다만 내 순서대로.' },
            { t: '피카에게 도로 넣어 두라고 한다', tag: 'night', sub: '받은 적 없는 편지는 답할 필요도 없다.' },
          ]);
          const tag = ['dawn', 'order', 'night'][k];
          c.route(tag, 1); S().flags.a4_way = tag;
          if (k === 0) { c.flag('a4_torn'); c.sfx('cut'); await c.narr('종이가 두 갈래로 찢어졌다. 밀랍 문장이 모래 위에 떨어졌다.'); await c.say(n, '와아… 기사 아저씨들 엄청 화나겠다. 멋있다!', { face: 'happy' }); }
          else if (k === 1) { await c.getItem('a4_summons'); await c.say(n, '갖고 있게? 이상한 애다. 잡아간다는 편지를 왜 갖고 다녀?', { face: 'think' }); await tori(c, '찍. 얘는 원래 이상해.', 'smirk'); }
          else { c.flag('a4_unsent'); await c.say(n, '헤헤. 그럼 이건 원래 가방으로. 기사 아저씨는 편지를 잃어버린 적도, 전한 적도 없는 거야.', { face: 'smirk' }); }
          await c.say(n, '초소 가기 전에 모래 언덕 쪽 조심해. 어제 거기서 수레 하나가 모래 벌레한테 잡혔대. 회의 가는 높은 사람 수레래.', { face: 'normal' });
          goes(c, n, 84);
          c.journal('참새단 피카가 천년성의 소환장을 「빌려」 왔다. 국경 초소에서 기사들이 기다린다고 한다.');
        } },
      { id: 'worm', kind: 'reach', at: 'worm', r: 7, noCalm: true, goal: '모래 언덕의 부서진 수레로. 회의 가는 사람이 위험하다.',
        wait: [{ name: '회의 서기 테오도르', look: G.cast.folk('scholar', { hc: '#8a8a8a', tc: '#5a6a9a' }), dx: 1, dy: 1, dir: 'down', stay: true }],
        async run(c, X) {
          const t = X.npc(0);
          c.music('danger');
          c.emote(t, '!');
          await c.say(t, '거, 거기! 사람이오? 살려 주시오! 모래가… 모래가 움직이오!', { face: 'shock' });
          c.shake(3, 0.6); c.sfx('rumble');
          await tori(c, '찍! 땅 밑에 뭐가 있어!', 'shock');
        },
        fight: () => [{ type: 'worm', dx: -3, dy: 2, tier: 3 }, { type: 'worm', dx: 3, dy: 3, tier: 3 }, { type: 'worm', dx: 0, dy: -3, tier: 3 }],
        fightMsg: '모래 벌레가 솟아오른다!',
        fightGoal: '수레를 덮친 모래 벌레를 물리치자.',
        again: '모래 밑에서 벌레가 다시 솟는다!',
        async after(c, X) {
          const t = X.npc(0);
          c.music('yellow');
          c.faceEach('hero', t);
          await c.say(t, '사, 살았다… 고맙네. 나는 천년성 회의 서기 테오도르. 사천왕 회의 문서를 나르는 중이었지.', { face: 'shock' });
          await c.say(t, '금화왕 몫의 자리 문서야. 골디 님은 늘 회의에 늦게 오시거든. 문서라도 먼저.', { face: 'normal' });
          await c.narr('모래 위에 흩어진 서류 가운데 한 장이 바람에 뒤집혔다. 「안건」이라는 글자가 보였다.');
          const k = await c.choice(null, [{ t: '서류를 주워 주며 슬쩍 읽는다', sub: '「안건」 둘째 줄.' }, { t: '읽지 않고 돌려준다', sub: '남의 문서다.' }, { t: '무슨 회의냐고 묻는다' }]);
          if (k === 0) {
            c.flag('a4_agenda');
            await c.narr('「안건 하나. 흑점 접근 — 남은 날의 재계산.」\n「안건 둘. 흰빛 후보의 「사용」 — 넣을 곳의 결정.」');
            await tori(c, '…「사용」? 사람을 쓴대? 물건처럼?', 'angry');
            await c.say(t, '아, 아니! 그건… 서기는 받아 적을 뿐이네. 받아 적는 것도 죄라면 죄겠지만.', { face: 'sad' });
            c.truth('t_agenda');
          } else if (k === 1) {
            c.flag('a4_honest');
            await c.say(t, '…요즘 그런 사람 드물지. 고맙네. 대신 하나만 말해 주지. 회의 둘째 안건에 자네 이름이 있어. 좋은 뜻은 아닐세.', { face: 'sad' });
          } else {
            c.flag('a4_vera_called');
            await c.say(t, '네 자리 가운데 셋이 모이는 회의라네. 초록 자리는 비어 있고. 챔피언께서 흑점 이야기를 하실 거야. 그리고 자네 이야기도.', { face: 'normal' });
            await c.say(t, '퍼플 학원의 베라 교수도 부르셨네. 증인으로. 세린을 가르친 분이니까.', { face: 'closed' });
          }
          await c.say(t, '국경 초소 대장 하겐은 고지식한 사람이네. 소환장 이야기를 들었다면 자네를 그냥 보내 주지 않을 걸세.', { face: 'normal' });
          goes(c, t, 40);
          c.exp(40);
          c.journal(k === 0 ? '모래 벌레에게서 회의 서기 테오도르를 구했다. 안건 둘째 줄 — 「흰빛 후보의 사용 — 넣을 곳의 결정」.' : '모래 벌레에게서 회의 서기 테오도르를 구했다. 사천왕 회의에 내 이름이 오른다고 한다.');
        } },
      { id: 'fort', kind: 'reach', at: 'fort', r: 7, goal: '국경 초소. 퍼플로 가려면 지나야 한다.',
        wait: [{ name: '초소 대장 하겐', look: knight({ hc: '#8a8a8a', beard: '#9a9a9a', tc: '#5a5a7a' }), dx: 0, dy: 2, dir: 'down', stay: true }, { name: '국경 기사', look: knight(), dx: -2, dy: 2, dir: 'down' }, { name: '국경 기사', look: knight(), dx: 2, dy: 2, dir: 'down' }],
        async run(c, X) {
          const h = X.npc(0), k1 = X.npc(1);
          c.faceEach('hero', h);
          await c.say(h, '멈춰라. 국경 초소다.', { face: 'normal' });
          await c.say(h, '흰빛 후보로군. 천년성에서 소환장이 나갔다. 받았나.', { face: 'closed' });
          const inv = S().inv;
          const opts = [
            { t: '소환장을 보여 준다', if: !!inv.a4_summons },
            { t: '고르디의 통행패를 내민다', if: !!inv.a1_pass },
            { t: '「받은 적 없다.」', if: f('a4_unsent') },
            { t: '「찢었다. 지나가겠다.」', if: f('a4_torn') },
            { t: '「비켜 줘.」' },
          ];
          const k = await c.choice(null, opts);
          if (k === 0) {
            S().flags.a4_fort = 'duel';
            await c.say(h, '…출두 중이라. 천년성은 반대쪽이다만.', { face: 'think' });
            await tori(c, '찍! 퍼플을 지나서 간대! 돌아가는 길이야!', 'smirk');
            await c.say(h, '…좋다. 그럼 출두할 만한 검인지 보자. 나 하나만 넘어 봐라. 기사들은 손대지 마라.', { face: 'smirk' });
          } else if (k === 1) {
            S().flags.a4_fort = 'pass'; c.bond('gordi', 1);
            await c.say(h, '그린 담당 고르디? 그 고지식한 놈이 남한테 패를 줬다고?', { face: 'shock' });
            await c.say(h, '…하. 그놈은 장부에 거짓을 못 적는 놈이다. 그놈이 믿은 사람이면.', { face: 'smile' });
          } else if (k === 2) {
            S().flags.a4_fort = 'sneak';
            await c.say(h, '받은 적이 없다…? 그럼 내 기사가 편지를 잃어버렸다는 거군.', { face: 'angry' });
            await c.say(k1, '저, 저는 분명히 가방에…!', { face: 'shock' });
            c.sfx('firework'); c.flash('#ffd84a', 0.3);
            await c.narr('초소 뒤에서 폭죽이 터졌다. 펑, 펑. 참새단의 웃음소리가 모래 언덕 너머로 멀어졌다.');
            await c.say(h, '참새단 꼬맹이들이다! 잡아라! …사냥개! 사냥개는 저 후보를 쫓아!', { face: 'angry' });
          } else {
            S().flags.a4_fort = 'fight';
            await c.say(h, '그럼 지나갈 수 없다. 규칙이다. 미안하지만, 나는 규칙 쪽 사람이다.', { face: 'closed' });
          }
        },
        fight: () => {
          const w = S().flags.a4_fort;
          if (w === 'pass') return [];
          if (w === 'duel') return [{ type: 'knight', from: 0, tier: 3, hpMul: 2.4, name: '초소 대장 하겐' }];
          if (w === 'sneak') return [{ type: 'wolf', dx: -3, dy: 3, tier: 3, name: '초소 사냥개' }, { type: 'wolf', dx: 3, dy: 3, tier: 3, name: '초소 사냥개' }];
          return [{ type: 'knight', from: 0, tier: 3, hpMul: 1.4, name: '초소 대장 하겐' }, { type: 'knight', from: 1, tier: 3, hpMul: 0.8 }, { type: 'knight', from: 2, tier: 3, hpMul: 0.8 }];
        },
        fightMsg: '국경 초소를 넘어라!',
        fightGoal: '국경 초소를 넘자.',
        again: '초소의 기사들이 다시 길을 막는다!',
        async after(c) {
          const w = S().flags.a4_fort;
          const h = c.spawn({ name: '초소 대장 하겐', look: knight({ hc: '#8a8a8a', beard: '#9a9a9a', tc: '#5a5a7a' }), x: W().player.x + 28, y: W().player.y - 6, dir: 'left', noEnter: w === 'pass' });
          c.faceEach('hero', h);
          if (w === 'duel') await c.say(h, '…됐다. 검은 출두할 만하군. 아니, 출두하기엔 아깝군.', { face: 'smile' });
          else if (w === 'sneak') await c.say(h, '…참새 떼한테 초소가 털렸다. 장부에 뭐라고 적지. 「바람이 셌음」?', { face: 'sad' });
          else if (w === 'fight') await c.say(h, '…크윽. 규칙 쪽 사람이 졌군. 졌으면 비켜야지. 그것도 규칙이다.', { face: 'sad' });
          await c.say(h, '가라. 장부엔 「후보, 퍼플로 출두 중」이라고 적겠다. 틀린 말은 아니니까.', { face: 'closed' });
          if (f('a4_agenda')) {
            await c.say(h, '…회의 안건 봤나. 얼굴에 써 있군. 나도 봤다. 서기가 우리 초소에서 하룻밤 묵었거든.', { face: 'sad' });
            await c.say(h, '나는 사람을 지키려고 이 옷을 입었다. 「사용」하려고가 아니라. …가라. 빨리.', { face: 'sad' });
            c.flag('a4_hagen_doubt');
          }
          goes(c, h, 30);
          c.exp(40);
          await tori(c, '찍. 모래 냄새가 끝나 가. 나무 냄새야. 저녁 냄새.', 'normal');
          c.journal(w === 'pass' ? '고르디의 통행패로 국경 초소를 지났다. 초소 대장 하겐: 「그놈이 믿은 사람이면.」' : w === 'duel' ? '소환장을 보이고, 초소 대장 하겐과 겨뤄 국경을 넘었다.' : w === 'sneak' ? '참새단의 폭죽 덕에 국경 초소를 빠져나왔다.' : '국경 초소를 칼로 넘었다. 하겐은 졌으니 비킨다고 했다.');
        } },
    ],
  });
  void A4;
})();
