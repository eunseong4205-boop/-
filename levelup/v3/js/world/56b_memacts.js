/* 조각 회상의 앞뒤 장면 — 조각마다 「그 전」과 「그 뒤」를 덧붙여, 기억 하나가 장면 셋으로 이어진다 (56_shards의 장면 틀)
   · 첫 한 입 — 전쟁의 마지막 낮(생선 · 다섯 깃발 · 흰빛) → 막사의 밤 → 이튿날 아침(빈 막사 · 빛을 나눠 든 다섯 부족 · 망토)
   · 소금 바다의 노래 — 고등어 철의 아침(그물 셋 · 누나와 부르는 노래) → 오두막의 밤 → 그 밤의 바닷가(짚신 · 은빛 단추 · 노래)
   · 모래 위의 별지기 — 오아시스의 한낮(날아간 별지도 셋) → 모래바다의 밤 → 별이 된 다음 날 밤(발자국 · 길 잃은 병사 · 낮은 별)
   · 광맥을 마신 왕 — 사흘 전 어전 회의(그릇 후보 제2호) → 서고 → 왕의 침실(배고픈 왕 · 공주가 삼킨 것)
   · 흰 수녀원의 겨울 — 첫눈 오던 날(장작 · 따뜻한 손 · 투명해지는 아이) → 병실 → 이듬해 봄(네 번 울린 종 · 엄마에게 쓰는 답장)
   · 등불지기의 약속 — 해가 마지막으로 지던 날(양초 셋 · 노을의 엄마) → 첫 등불의 밤 → 열여섯 해 뒤(배고픈 노을 · 거리 끝)
   · 허용 손실 — 983년 겨울 첫 탑 터(이름 받아 적기 · 「조금만」) → 회계실 → 999년 외딴집(이천삼백열두 줄 · 레지나에게)
   앞 장면의 작은 고름은 뒤 장면의 말과 맺음에 이어진다. 장면 사이에서 빠져나와도 다음에 그 장면부터 이어 볼 수 있다 */
(function () {
  'use strict';
  const G = globalThis.G, ST = G.story;
  if (!ST || !ST.memKit || !ST.SHARDS) return;
  const U = G.u, TL = G.tiles, T = TL.T;
  const K = ST.memKit, { room, field, next, says, folk, px, py, addNpc } = K;
  const W = () => G.world;
  const SH = {}; for (const sh of ST.SHARDS) SH[sh.id] = sh;
  const look = (id, fb) => (G.cast.get(id) ? G.cast.get(id).look : fb);
  const find = (key) => W().ents.find((e) => e.memKey === key && !e.dead);
  const count = (st, ks) => ks.filter((k) => st[k]).length;
  const pick = (st) => st.pick || 0;
  /** 같은 사람에게 여러 번 말을 걸면 다음 말로 */
  const cyc = (c, n, st, key, lines, o) => { const i = st[key] = (st[key] || 0) + 1; return c.say(n, lines[(i - 1) % lines.length], o || { face: 'normal' }); };
  const MAPS = {
    mf_aurum_camp: [
      '         TTTTTTTTT',
      '   TTTTTTTTTTTTTTTTTTTT',
      '    mmmmmmmmmmmmmmmmmmT',
      '  TTT..f.............TTT',
      ' TT..F...F...F...F...FTTT',
      ' TT................f...TT',
      'TT.........f...f........TT',
      'TT.XX...................TT',
      'TT.V..............XXXV..TT',
      'TTT.....................TT',
      ' TT....................TTT',
      ' TT.........f..........T',
      '  TT..f.............fTTT',
      '    TT...OO.....O..TTT',
      '     TTTTT......TTTTT',
      '         TTTTTTTTT',
    ],
    mf_aurum_morn: [
      '         TTTTTTTTT',
      '   TTTTTTTTTTTTTTTTTTTT',
      '    mmmmmmmmmmmmmmmmmmT',
      '  TTT..f.............TTT',
      ' TT...................TTT',
      ' TT................f...TT',
      'TT.........f...f........TT',
      'TT.XX.................B.TT',
      'TT.V..............XXXV..TT',
      'TTT.....................TT',
      ' TT....................TTT',
      ' TT.........f..........T',
      '  TT..f.............fTTT',
      '    TT...OO.....O..TTT',
      '     TTTTT......TTTTT',
      '         TTTTTTTTT',
    ],
    mf_maren_shore: [
      '   TTTTTTTTTTTTTTTTTTT',
      '   TTgggggggggggggggTTTT',
      ' TTTggggggggggggggggggTTT',
      ' TTgggggggOggggggggggXXTT',
      'TTNNNNNgggggggggggggggggTT',
      'TTssssssssssssssssssssssTT',
      'TssssssssssssssssssssssssT',
      'TssssssssssssssssssssssssT',
      'TssssssssssssssssssssssssT',
      'TssXsssssssssssssssssssssT',
      'TTssssssssssssssssssssXssT',
      '  RwwwwwwwwwwwwwwwwwwwwR',
      '  wwwwwwwwwwwwwwwwwwwwww',
      '  WWWWWWWWWWWWWWWWWWWWWW',
      '  WWWWWWWWWWWWWWWWWWWWWW',
      '  WWWWWWWWWWWWWWWWWWWWWW',
    ],
    mf_maren_night: [
      '   TTTTTTTTTTTTTTTTTTT',
      '   TTgggggggggggggggTTTT',
      ' TTTggggggggggggggggggTTT',
      ' TTgggggggOggggggggggXXTT',
      'TTNNNNNgggggggggggggggggTT',
      'TTssssssssssssssssssssssTT',
      'TssssssssssssssssssssssssT',
      'TssssssssssssssssssssssssT',
      'TssssssssssssssssssssssssT',
      'TssXsssssssssssssssssssssT',
      'TTssssssssssssssssssssXssT',
      '  RwwwwwwwwwwwwwwwwwwwwR',
      '  wwwwwwwwwwwwwwwwwwwwww',
      '  WWWWWWWWWWWWWWWWWWWWWW',
      '  WWWWWWWWWWWWWWWWWWWWWW',
      '  WWWWWWWWWWWWWWWWWWWWWW',
    ],
    mf_saif_oasis: [
      '         PPPPPPPPP',
      '      PPPPsssssssPPPP',
      '    PPssssssssssssssPPP',
      '   PPssssssssssssssssPPP',
      ' PPPssssssssssssssssssPPP',
      ' PPsssssssssssssssssssssP',
      'PPsOOsssPssssssssPsssssPPP',
      'PPsssssssRwwwwwwwsssssssPP',
      'PPssssssswwWWWWwwssssXXsPP',
      'PPssssssswwWWWWwwssssssXPP',
      'PPPsssssswwwwwwwRsssssssPP',
      ' PPsssssssssssssssssssPPP',
      '  PPPsssssssssssssssssP',
      '   PPPPssssssssssssPPP',
      '      PPPPsPssssPPPPP',
      '         PPPPPPPPP',
    ],
    mf_saif_dunes: [
      '        BBBBBBBBB',
      '      BBByyByyByyBBBB',
      '   BBBsssyyyyyyyyysBBB',
      '  BBBssssyyyyyyyyyssssBB',
      '  BBsssssssssssssssssBBBB',
      ' BBssssssssssssssssssssBB',
      ' BssssssssssssssssEEEssBBB',
      'BBsssBssssssssssssssssssBB',
      'BBssssssssssssssssssssssBB',
      'BBsssssssssBsssssssssssBBB',
      ' BBssssssssssssssssssssBBB',
      '  BBsssssssssssssssssssBB',
      '   BBssssssssssssssssBBB',
      '    BBBsssssssssssssBB',
      '     BBBBssssssssBBBB',
      '        BBBBBBBBB',
    ],
    mf_elia_yard: [
      '  QQQQQQQQQQQQQQQQQQQQ',
      '  QQQQQQQQQQQQQQQQQQQQ',
      '  QQQQQQqQQQQQQqQQQQQQ',
      '  qqqqqqqqqqqqqqqqqqqq',
      ' YYnnnnnnnnnnnnnnnnnnYY',
      ' YYnnnnnnnnnnnnnnnnnnYY',
      'YYnnnnnnnnnnnnnnnnUnnnYY',
      'YYnnnnnnnnnnnnnnnnnnnnnY',
      'YnnnnnnnnnnnnnnnnnnnnnnY',
      'YnnXXVnnnnnnnnnnnnnnnnnY',
      'YYnnnnnnnnnnnnnnnnnnnnnY',
      'YYnnnnnnnnnnnnnnnnnnnnYY',
      ' YnnnnnnnnnnnnnnnnnnnYYY',
      ' YYYnnnnnnvvvvnnnnnnYYY',
      '  YYYnnnnnvvvvnnnnnYYY',
      '   YYYnnnnvvvvnnnYYYY',
    ],
    mf_elia_spring: [
      '  QQQQQQQQQQQQQQQQQQQQ',
      '  QQQQQQQQQQQQQQQQQQQQ',
      '  QQQQQQqQQQQQQqQQQQQQ',
      '  qqqqqqqqqqqqqqqqqqqq',
      ' YYmmmmmmnnnmmmmmmnnnYY',
      ' YYnmmnnnnmnnmmmmnnmmYY',
      'YYnnnnmmfmmmnmmnmmUmmnYY',
      'YYmmmnmmnmnnmmmnnmmmmmnY',
      'YnnnnmmnnmnnnmmmmmnmmmmY',
      'YnmXXVmmnmmmmmnJmmmnmmnY',
      'YYmnmmmmmmnnmmmmmmnmmnnY',
      'YYnmnnnnmmmnnnmnnfnmnnYY',
      ' YmnnmfnnmnmnnmmnnnnmYYY',
      ' YYYmnmnmnvvvvnnnnmnYYY',
      '  YYYmnnmmvvvvmmnmnYYY',
      '   YYYnnnnvvvvnnnYYYY',
    ],
    mf_noeul_dusk: [
      '',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQcQQQQQQcQQQQQQcQQQQQQ',
      ' QcccccccccccccccccccccccQ',
      ' ccOcccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' cccccccccXccccccccccccOcc',
      ' QcccccccccccccccccccccccQ',
      ' QQQQQQQcQQQQQQQcQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
    ],
    mf_noeul_street: [
      '',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQcQQQQQQcQQQQQQcQQQQQQ',
      ' QccLcccccccccLccccccccccQ',
      ' ccOcccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' ccccccccccccccccccccccccc',
      ' cccccccccXccccccccccccOcc',
      ' QcccccccLcccccccccccLcccQ',
      ' QQQQQQQcQQQQQQQcQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
      ' QQQQQQQQQQQQQQQQQQQQQQQQQ',
    ],
    mf_loss_site: [
      '        TTTTTTTTT',
      '     TTTTTmmmmmmTTTT',
      '    TTTmmmmmmmmmmmmmTT',
      '  TTTmmmmmAoooooAmmmmTT',
      ' TTmmmmmmmooooooommmmmmTT',
      ' TTmmmmmmmooooooommmmmmTT',
      'TTmVmmmmmmooooooommmmmVmTT',
      'TTmmmmmmmmAoooooAmmmmmmmTT',
      'TTmmmmmmmmmmmmmmmmmmmmmmTT',
      'TTmmXXmmmmmmmmmmmmmmmXmmTT',
      'TTTmmmmmmmmmmmmmmmmmOmmTT',
      ' TTTmm=mmmmmmmmmmmmm=mTTT',
      '  TTTmdddddddddddddddTTT',
      '   TTTmmmmmmmmmmmmmTTT',
      '      TTTTmmmmmmTTTTT',
      '         TTTTTTTTT',
    ],
  };
  const at = (id, o) => field(id, Object.assign({ rows: MAPS[id] }, o));
  function acts(id, pre, post, mainIntro) {
    const sh = SH[id]; if (!sh) return;
    if (mainIntro) sh.intro = mainIntro;
    sh.acts = [pre, sh, post];
    if (post.journal2) sh.journal2 = post.journal2;
  }
  const flags = (ks) => { const o = {}; for (const k of ks) o[k] = (st) => !!st[k]; return o; };

  /* ═════════ 1. 첫 한 입 — 고양이 ═════════ */
  at('mf_aurum_camp', { region: 'yellow', name: '천 년 전 · 금빛 언덕의 막사촌', music: 'calm', weather: 'motes', start: [13, 13], furn: [['cauldron', 6, 10, { v: '#e8b060' }]] });
  at('mf_aurum_morn', { region: 'yellow', name: '천 년 전 · 이튿날 아침의 언덕', music: 'sad', weather: 'motes', dark: 0.12, darkCol: 'rgba(60,40,90,1)', start: [19, 10] });
  const BOY = look('aurum', folk('kid', { hc: '#f0d060' }));
  const BAN = [
    ['f1', 5, '초록 깃발. 풀 냄새. 깃대 밑에 부러진 창 세 자루가 묶여 있다. 창마다 같은 글씨: 「다시는」.'],
    ['f2', 9, '빨강 깃발. 쇠 냄새와 불 냄새. 깃발 끝이 그을렸다. 어제까지 불화살을 쏘던 쪽이다. 누가 깃대에 들꽃 한 송이를 꽂아 두었다.'],
    ['f3', 13, '파랑 깃발. 소금 냄새. 바다 부족은 노래로 신호를 주고받는다고 한다. 천에 물결 같은, 음표 같은 무늬.'],
    ['f4', 17, '노랑 깃발. 모래 냄새. 깃발 아래 작은 별 그림 — 별을 보고 길을 찾는 부족이다. 별 하나가 유난히 낮게 그려져 있다.'],
    ['f5', 21, '보라 깃발. 꿈 냄새 같은 것. 이 부족은 밤에 꾼 꿈을 아침에 나눈다. 깃대에 금빛 머리카락 한 올이 묶여 있다.'],
  ];
  const BK = BAN.map((b) => b[0]);
  acts('aurum', {
    room: 'mf_aurum_camp', start: [13, 13], dir: 'up', music: 'calm', era: '천 년 전 · 색 전쟁의 마지막 낮',
    intro: async (c) => {
      await c.narr('발이 넷이다. 꼬리가 있다. 해가 뜨겁다. 바닥이 아주 가깝다.\n금빛 언덕의 막사촌. 다섯 부족의 깃발이 한 언덕에 꽂혀 있다. 어제까지는 서로를 겨누던 깃발이다.');
      await c.narr('어디선가 생선 굽는 냄새가 난다. 배가 고프다. 고양이는 늘 배가 고프다.');
    },
    npcs: [
      { key: 'cook', name: '초록 부족 할머니', x: 8, y: 10, dir: 'left', look: folk('oldw', { tc: '#5a9a4a' }), talk: async (c, n, st) => {
        if (!st.a_fish) {
          await c.say(n, '이 도둑고양이! 생선 냄새 맡고 왔구나.', { face: 'angry' });
          await c.say(n, '…에잉, 오늘은 봐준다. 전쟁 끝나는 날이니까. 한 마리만 물고 가.', { face: 'smile' });
          st.a_fish = true; c.sfx('lift');
          await c.narr('할머니가 꼬리 쪽을 잡고 생선 한 마리를 내밀었다. 아직 따뜻하다. 입에 물었다.\n— 그런데 이상하다. 이걸 먹지 말고 누구에게 가져가고 싶다.');
          return;
        }
        if (!st.a_gift) { await c.say(n, '그거 먹지 말고 금빛 아이한테 가져다줘라. 그 애는 사흘째 아무것도 안 먹었어. 빛만 먹는대나.', { face: 'sad' }); return; }
        await cyc(c, n, st, 'a_ck', ['우리 초록 부족은 오늘 창을 묶었어. 내일은 밭을 갈 거야. 사십 년 만에.', '그 아이 이름? 다들 「금빛」이라고만 불러. 이름을 물어본 사람이 없어. …나도 안 물어봤네.', '빛을 다 한 아이한테 모아 줬다니, 그게 옳은 건지 난 몰라. 근데 칼보다는 낫지.']);
      } },
      { key: 'red', name: '붉은 부족 전사', x: 11, y: 8, dir: 'down', look: folk('guard', { tc: '#a83a2a', hatC: '#c85a3a' }), talk: async (c, n, st) => {
        st.a_red = true;
        if (st.a_gift) { await c.say(n, '그 아이가 고양이한테 생선을 나눠 주더라. 자기는 안 먹고. …이상한 아이야. 저렇게 많이 가졌으면서 배고픈 얼굴이야.', { face: 'closed' }); return; }
        await cyc(c, n, st, 'a_rd', ['다섯 부족이 빛을 다 그 아이한테 몰아줬다. 전쟁을 끝내라고. 끝내긴 끝내겠지.', '…그다음엔? 그 빛을 누가 갖지? 다섯이 하나한테 모아 줬으면, 그 하나가 다섯을 이기는 거야.', '고양이한테 무슨 말을 하는 건지. 어제 이 손으로 초록 놈을 셋 쐈어. 오늘은 같은 솥 밥을 먹고.']);
      } },
      { key: 'kid', name: '파란 부족 꼬마', x: 14, y: 12, dir: 'up', look: folk('kidg', { tc: '#4a7ad8', hc: '#2a3a6a' }), talk: async (c, n, st) => {
        if (!st.a_name) {
          await c.say(n, '고양이다! 까맣다! 너 이름 뭐야? 없어? 그럼 내가 지어 줄게.', { face: 'smile' });
          await c.say(n, '음… 한밤중처럼 까마니까 — 「한밤」! 너는 이제 한밤이야.', { face: 'smile' });
          st.a_name = true; c.emote('hero', '♪');
          await c.narr('이름이 생겼다. 나쁘지 않다.');
          return;
        }
        await cyc(c, n, st, 'a_kd', ['한밤! 우리 엄마가 그러는데, 바다 부족 노래는 고기한테 고맙다고 하는 노래래.', '금빛 형이 손을 들면 하늘이 하얘진대. 나 그거 보고 싶어. 근데 엄마는 보지 말래. 눈이 멀까 봐.'], { face: 'smile' });
      } },
      { key: 'boy', name: '금빛 소년', x: 17, y: 10, dir: 'left', look: BOY, talk: async (c, n, st) => {
        if (!st.a_fish) { await cyc(c, n, st, 'a_by', ['…고양이? 배고프구나. 나도. 근데 나는 지금 먹으면 안 돼. 빛을 모으는 중이라. 배가 부르면 빛이 안 들어와.', '저기 할머니 솥에서 냄새 나지? 가 봐. 너라도 배불러야지.'], { face: 'sad' }); return; }
        if (!st.a_gift) {
          c.lock(true); await c.cinema(true);
          await c.narr('생선을 소년의 발치에 내려놓았다.');
          await c.say(n, '…나 주는 거야?', { face: 'shock' });
          await c.say(n, '하하. 고마워. 고양이한테 생선을 받아 본 사람은 세상에 나밖에 없을 거야.', { face: 'smile' });
          const k = await c.choice('소년이 생선을 반으로 갈랐다. 반을 너에게 내민다.', ['소년 쪽으로 도로 밀어 준다', '반을 나눠 먹는다', '소년 무릎에 올라앉는다']);
          st.a_share = k; st.a_gift = true;
          if (k === 0) { await c.say(n, '…다 먹으라고? 나 진짜 배고픈데. …알았어. 먹을게. 네가 봐 주니까.', { face: 'smile' }); await c.narr('소년이 생선을 먹었다. 사흘 만이라고 했다. 아주 천천히.'); }
          else if (k === 1) { await c.narr('나눠 먹었다. 소년도 고양이도 뼈까지 발라 먹었다.'); await c.say(n, '같이 먹으니까 맛있다. …다섯 부족도 이랬으면 좋겠어. 반씩.', { face: 'smile' }); }
          else { await c.narr('무릎에 올라앉았다. 소년의 무릎이 따뜻하다. 아직은.'); await c.say(n, '…무겁다, 너. 좋다.', { face: 'smile' }); }
          await c.say(n, '다섯 부족이 빛을 다 나한테 모아 줬어. 해가 지면 언덕 꼭대기에서 하늘로 쏘아 올리래. 그럼 다들 칼을 내려놓을 거래.', { face: 'normal' });
          await c.say(n, '근데 이상해. 모으면 모을수록 배가 고파. 빛이 내 안에서 「더」라고 말해.', { face: 'sad' });
          await c.say(n, '깃발들 좀 보고 와 줄래? 다섯 개. 나는 저걸 다 외워야 해. 오늘 밤이 지나면 다시는 한곳에 모이면 안 되니까.', { face: 'normal' });
          await c.cinema(false); c.lock(false);
          return;
        }
        if (count(st, BK) < 5) { await cyc(c, n, st, 'a_by2', ['깃발 다섯 개 다 봤어? 초록, 빨강, 파랑, 노랑, 보라.', '…해가 지면 꼭대기로 가자. 너도 와. 혼자 올라가기 싫어.'], { face: 'normal' }); return; }
        await c.say(n, '다 봤구나. …해가 진다. 꼭대기로 가자. 먼저 가 있어.', { face: 'closed' });
      } },
    ],
    spots: [
      ...BAN.map(([mk, x, text]) => ({ mk, x, y: 5, verb: '깃발을 올려다본다', text: async (c, st) => { st[mk] = true; const n = count(st, BK); await c.narr(text + (n >= 5 ? '\n[s]…다섯 깃발을 다 보았다. 해가 기운다.[/]' : '\n[s](' + n + ' / 5)[/]')); } })),
      { mk: 'shoes', x: 19, y: 9, verb: '막사 앞 신발 냄새를 맡는다', text: async (c) => { await c.narr('소년의 신발. 한 짝은 초록 부족이, 한 짝은 빨강 부족이 지어 준 것이다. 짝이 안 맞는다. 소년은 그게 좋다고 했다.'); } },
      { mk: 'ridge', x: 13, y: 2, verb: '언덕 꼭대기에 선다', when: (st) => !!st.a_gift && count(st, BK) >= 5, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        await c.narr('해가 언덕 너머로 기울었다. 다섯 부족 사람들이 언덕 아래에 모여 숨을 죽였다.');
        const b = find('boy');
        if (b) { await c.move(b, px(14), py(3)); c.face(b, 'up'); }
        await c.say(b || null, '…봐 줘, 고양이. 끝까지.', { face: 'closed', name: '금빛 소년' });
        await c.narr('소년이 두 팔을 들었다. 손끝에서 흰빛이 — 하늘로.');
        c.sfx('white'); c.flash('#ffffff', 0.7); c.shake(4, 0.9);
        if (b) G.fx.glow(b.x, b.y - 24, '#ffffff', 40);
        await c.wait(0.8);
        await c.narr('언덕 아래, 마지막까지 들려 있던 칼들이 멈췄다. 누군가 칼을 떨어뜨렸다. 그 소리가 꼭대기까지 들렸다. 그다음은 — 조용했다. 사십 년 만에.');
        c.sfx('rumble');
        await c.narr('소년은 웃지 않았다. 하늘 한 점을 보고 있었다. 별도 아직 뜨지 않은 하늘에, 무언가 검은 것이 — 눈을 떴다.');
        await c.say(b || null, '…고양이. 아무한테도 말하지 마.', { face: 'sad', name: '금빛 소년' });
        await c.narr(st.a_name ? '「한밤」이라는 이름이 생긴 날이었다. 그리고 하늘에 눈이 생긴 날이었다.' : '하늘에 눈이 생긴 날이었다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '생선 굽는 냄새를 따라가자', targets: ['cook'], done: (st) => st.a_fish },
      { text: '물고 온 생선을 금빛 소년에게 가져가자', targets: ['boy'], done: (st) => st.a_gift },
      { text: '언덕 위 다섯 부족의 깃발을 둘러보자', targets: BK, done: (st) => count(st, BK) >= 5, prog: (st) => count(st, BK) + ' / 5' },
      { text: '해가 진다 — 언덕 꼭대기로 가자', targets: ['ridge'] }],
    tdone: flags(BK),
  }, {
    room: 'mf_aurum_morn', start: [19, 10], dir: 'up', music: 'sad', era: '천 년 전 · 이튿날 아침',
    intro: async (c) => {
      await c.narr('아침. 막사 지붕에서 밤을 새웠다. 하늘의 검은 점은 해가 뜨자 보이지 않는다. 사라진 게 아니다. 보이지 않을 뿐이다. 고양이는 안다.');
      await c.narr('소년은 돌아오지 않았다. 언덕 위에 사람들이 모여, 다섯 빛깔의 빛을 하나씩 나눠 들고 있다.');
    },
    npcs: [
      { key: 'g', name: '초록 부족 할머니', x: 8, y: 10, dir: 'right', look: folk('oldw', { tc: '#5a9a4a' }), talk: async (c, n, st) => { st.b_g = true; await c.say(n, '한밤이로구나. 아침 먹을래? …금빛 아이? 하늘로 갔다더라. 여신이 데려갔다고들 해.', { face: 'sad' }); await c.say(n, '우리 몫의 빛은 초록이야. 밭에 묻으래. 그럼 곡식이 잘 자란대. 여신이 그렇게 말씀하셨다고. …그 아이가 그렇게 전하랬다고.', { face: 'normal' }); } },
      { key: 'r', name: '붉은 부족 전사', x: 11, y: 8, dir: 'down', look: folk('guard', { tc: '#a83a2a', hatC: '#c85a3a' }), talk: async (c, n, st) => { st.b_r = true; await c.say(n, '빨강 몫이다. 불에 넣으래. 그러면 쇠가 잘 녹는다고.', { face: 'normal' }); await c.say(n, '…여신이 줬다고들 하지. 난 봤다. 그 아이 손에서 나온 거야. 근데 그렇게 말하면 다들 그 아이를 찾겠지. 빛을 더 달라고. 그래서 입 다물기로 했다.', { face: 'closed' }); } },
      { key: 'b', name: '파란 부족 꼬마', x: 14, y: 12, dir: 'up', look: folk('kidg', { tc: '#4a7ad8', hc: '#2a3a6a' }), talk: async (c, n, st) => { st.b_b = true; await c.say(n, (st.a_name ? '한밤! ' : '고양이야, ') + '금빛 형 어디 갔어? 다들 여신 얘기만 해. 형 얘기는 아무도 안 해.', { face: 'sad' }); await c.say(n, '…나는 형 이름도 몰라. 너는 알아?', { face: 'normal' }); await c.narr('알았다. 하지만 고양이는 말을 못 한다.'); } },
      { key: 'y', name: '노랑 부족 별지기 노인', x: 6, y: 6, dir: 'right', look: folk('oldm', { tc: '#c8a040' }), talk: async (c, n, st) => { st.b_y = true; await c.say(n, '노랑 몫은 하늘에 걸으래. 별 사이에. 길 잃은 사람들 보라고.', { face: 'normal' }); await c.say(n, '…어젯밤에 하늘에 별이 아닌 게 하나 떴더군. 검은 거. 너도 봤나, 고양이. 저건 사라지지 않을 거다. 배가 고픈 것들은 사라지지 않아.', { face: 'closed' }); } },
      { key: 'v', name: '보라 부족 꿈꾸는 여인', x: 20, y: 6, dir: 'left', look: folk('mage', { hat: null, tc: '#7a4ab8' }), talk: async (c, n, st) => { st.b_v = true; await c.say(n, '보라는 꿈에 두래. 사람들이 같은 꿈을 꾸게.', { face: 'normal' }); await c.say(n, '…어젯밤 꿈에 금빛 아이가 나왔어. 배가 고프다고 했어. 아주 오래 배가 고플 거라고. 그리고 너한테 고맙다고 했어. 생선.', { face: 'sad' }); } },
    ],
    spots: [
      { mk: 'tent', x: 19, y: 9, verb: '소년의 막사를 들여다본다', text: async (c, st) => { st.b_cloak = true; c.sfx('lift'); await c.narr('소년의 막사. 비었다. 책상 위 지도도, 다 탄 촛불도 그대로다. 의자 등받이에 작은 망토 하나 — 금실로 「오루」.\n망토를 입에 물었다. 가볍다. 아이 옷은 늘 가볍다.'); } },
      { mk: 'ash', x: 13, y: 2, verb: '소년이 섰던 자리를 본다', text: async (c, st) => { st.b_ash = true; c.sfx('wind'); await c.narr('언덕 꼭대기. 풀이 동그랗게, 하얗게 탔다. 한가운데 작은 발자국 둘. 그 앞으로는 아무 자국도 없다. 땅에서 하늘로, 그냥 끊겼다.'); } },
      { mk: 'stone', x: 21, y: 7, verb: '언덕 끝 바위에 오른다', when: (st) => !!st.b_cloak, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        await c.narr('언덕 끝 바위. 해가 잘 드는 자리. 소년이 낮잠을 자던 곳이다.');
        const k = await c.choice('망토를 문 채로 바위 앞에 섰다.', ['바위 위에 망토를 펼쳐 놓는다', '망토를 물고 언덕을 내려간다', '하늘을 보고 한 번 운다']);
        st.b_end = k;
        await c.narr(['망토를 바위 위에 펼쳐 놓았다. 바람이 금실을 흔들었다. 「오루」. 누가 지나가다 읽어 주기를.', '망토를 물고 언덕을 내려갔다. 오래 가지고 다닐 생각이었다. 아주 오래.', '울었다. 고양이 울음은 멀리 가지 않는다. 그래도 울었다. 하늘 어딘가에 들리라고.'][k]);
        await c.narr(['어젯밤 곁에 있겠다고 했다. 그래서 고양이는 오래 살기로 했다. 아홉 번이 모자라면 열 번이라도.', '어젯밤 핥은 손등의 차가움을 고양이는 잊지 않기로 했다. 천 년이 지나도.', '어젯밤 등을 돌렸다. 소년은 그 등을 보며 갔다. 고양이는 그 일을 오래오래 후회하기로 했다.'][pick(st)]);
        await c.narr('사람들은 그 빛을 「여신의 선물」이라 불렀다. 아무도 금빛 소년의 이름을 묻지 않았다. 고양이만 알았다. 오루. 작은 금덩이.');
        await c.narr('천 년 뒤, 밤의 나라 사람들은 실크해트를 쓴 검은 고양이를 「미드나잇」이라 불렀다. 한밤.' + (st.a_name ? ' 파란 부족 꼬마가 붙여 준 이름이었다.' : ' 누가 처음 붙인 이름인지는 고양이만 안다.'));
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '소년의 막사를 들여다보자', targets: ['tent'], done: (st) => st.b_cloak },
      { text: '빛을 나눠 든 다섯 부족 사람들 사이를 돌아다니자', targets: ['g', 'r', 'b', 'y', 'v'], done: (st) => count(st, ['b_g', 'b_r', 'b_b', 'b_y', 'b_v']) >= 3, prog: (st) => count(st, ['b_g', 'b_r', 'b_b', 'b_y', 'b_v']) + ' / 3' },
      { text: '언덕 꼭대기, 소년이 섰던 자리로', targets: ['ash'], done: (st) => st.b_ash },
      { text: '망토를 둘 곳 — 언덕 끝 바위로', targets: ['stone'] }],
    tdone: { g: (st) => st.b_g, r: (st) => st.b_r, b: (st) => st.b_b, y: (st) => st.b_y, v: (st) => st.b_v },
    journal2: (st) => ['고양이는 언덕 끝 바위에 「오루」의 망토를 펼쳐 두었다.', '고양이는 「오루」의 망토를 물고 언덕을 내려갔다.', '고양이는 하늘을 보고 울었다.'][st.b_end || 0] + ' 천 년 뒤 사람들은 그 고양이를 미드나잇이라 불렀다.',
  }, async (c) => {
    await c.narr('그날 밤. 막사 안. 촛불 하나. 언덕 아래에서는 다섯 부족이 처음으로 같은 노래를 부른다.\n소년은 춤추러 가지 않았다. 책상에 엎드려 무언가를 세고 있다.');
    await c.narr('밖에서는 오늘 밤 처음으로 비명이 들리지 않는다. 그런데 소년의 어깨는 낮보다 더 떨린다.');
  });

  /* ═════════ 2. 소금 바다의 노래 — 어부의 아이 탐 ═════════ */
  at('mf_maren_shore', { region: 'blue', name: '팔백 년 전 · 고등어 철의 해안', music: 'blue', weather: 'motes', start: [13, 3] });
  at('mf_maren_night', { region: 'blue', name: '팔백 년 전 · 그 밤의 바닷가', music: 'requiem', weather: 'mist', dark: 0.62, darkCol: 'rgba(6,14,34,1)', start: [13, 3],
    lights: [[5, 12, 60, 'rgba(120,200,255,0.28)'], [12, 12, 70, 'rgba(120,200,255,0.3)'], [19, 12, 60, 'rgba(120,200,255,0.28)']] });
  const MAREN = folk('farmerw', { hc: '#2a3a5a', tc: '#e8f0f8', gender: 'girl', hair: 'long', hat: null });
  const BADO = folk('sailor', { age: 'old', hc: '#d8d8d0', beard: '#d8d8d0' });
  const AUNT = folk('farmerw', { tc: '#8ab8c8', hat: null });
  const NIKO = folk('kid', { tc: '#e8a040', hc: '#5a3a1a' });
  const BUTTON = folk('guard', { tc: '#c8c8d8' });
  const NETS = ['n1', 'n2', 'n3'];
  acts('maren', {
    room: 'mf_maren_shore', start: [13, 3], dir: 'down', music: 'blue', era: '팔백 년 전 · 고등어 철의 아침',
    intro: async (c) => {
      await c.narr('아침 바다. 모래가 발가락 사이로 빠져나간다. 작은 손. 손바닥에 그물 자국.');
      await c.narr('누나 마렌이 물가에 서서 노래를 부른다. 한 소절마다 물빛이 반짝이고, 고기 떼가 누나 발치로 몰려온다. 오늘은 고등어 철이다.');
    },
    npcs: [
      { key: 'bado', name: '늙은 어부 바도', x: 9, y: 7, dir: 'up', look: BADO, talk: async (c, n, st) => {
        if (!st.c_bado) { st.c_bado = true; await c.say(n, '탐, 왔냐. 오늘 그물 셋 다 네 몫이다. 물가에 쳐 둔 거, 끌어 올려 와.', { face: 'smile' }); await c.say(n, '마렌 노래가 없으면 우리 마을은 굶어. …근데 탐. 요즘 은빛 단추 단 사람들이 해안을 돈다. 누나 노래, 아무 데서나 부르게 두지 마라.', { face: 'normal' }); return; }
        await cyc(c, n, st, 'c_bd', ['어부는 바다한테 빚진 걸 안다. 그래서 가져가는 만큼 고마워하지. 네 누나 노래가 그 노래야.', '내가 네 나이 땐 노래 없이 고기를 잡았다. 반은 굶었지. 지금은 다들 배부르다. 배부른 건 좋은 거야. 남의 눈에 띄는 것만 빼면.']);
      } },
      { key: 'aunt', name: '생선 말리는 아주머니', x: 4, y: 5, dir: 'up', look: AUNT, talk: async (c, n, st) => { st.c_aunt = true; await cyc(c, n, st, 'c_au', ['탐! 누나 노래 들으면 생선이 더 맛있어진다? 진짜야. 소금도 덜 들어.', '그물 다 끌면 이리 와. 말린 고등어 한 마리 줄게. 누나 거랑 두 마리.', '네 엄마도 노래를 불렀어. 마렌만큼은 아니었지만. 그 노래를 마렌한테 가르치고 갔지.'], { face: 'smile' }); } },
      { key: 'niko', name: '옆집 꼬마 니코', x: 21, y: 7, dir: 'left', look: NIKO, talk: async (c, n, st) => { st.c_niko = true; await cyc(c, n, st, 'c_nk', ['탐, 너네 누나 노래하면 손이 빛나잖아. 우리 엄마가 그거 아무한테도 말하지 말래. 왜?', '어제 은빛 단추 아저씨가 우리 집에 와서 물었어. 「노래하는 처녀가 어느 집이냐」고. 나 말 안 했어. 진짜야.']); } },
      { key: 'maren', name: '마렌', x: 16, y: 11, dir: 'up', look: MAREN, talk: async (c, n, st) => {
        if (count(st, NETS) < 3) { await cyc(c, n, st, 'c_mr', ['탐, 노래가 그러는데 오늘은 그물 셋 다 찬대. 끌어 와. 무거우면 노래 불러 줄게.', '(누나는 노래하는 중이다. 손끝이 물빛처럼 반짝인다. 고등어 떼가 누나 발목을 스치고 지나간다.)'], { face: 'smile' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '다 끌었어? 우리 탐 장하다.', { face: 'smile' });
        await c.say(n, '이리 와. 이 노래 끝 소절, 오늘은 너도 해 봐. 엄마가 가르쳐 준 노래야. 바다에 사는 것들한테 「고마워」라고 하는 노래.', { face: 'normal' });
        const k = await c.choice('누나가 첫 소절을 부르고, 탐을 본다.', ['따라 부른다', st.c_shell ? '주운 조개껍데기로 박자를 맞춘다' : '손뼉으로 박자를 맞춘다', '부끄러워서 모래만 판다']);
        st.c_duet = k;
        if (k === 0) { await says(c, '탐')('「— 가져간 만큼, 고마워. 남긴 만큼, 또 와 줘.」'); await c.say(n, '…잘한다! 목소리가 엄마 닮았어.', { face: 'smile' }); await c.narr('물이 한 번 밝아졌다. 탐의 노래에도.'); }
        else if (k === 1) { c.sfx('clickspot'); await c.narr('딱, 딱. 박자에 맞춰 고기 떼가 한 번씩 뛰어올랐다.'); await c.say(n, '봐, 바다도 박자를 맞춰.', { face: 'smile' }); }
        else { await c.say(n, '괜찮아. 노래는 듣는 사람이 있어야 노래야. 넌 들어 줘. 그거면 돼.', { face: 'smile' }); }
        await c.say(n, '탐, 이 노래는 꼭 기억해. 가져가는 만큼 고마워하는 거. …언젠가 누나가 없어도.', { face: 'normal' });
        const m = addNpc({ key: 'man0', name: '은빛 단추의 사내', look: BUTTON, dir: 'left' }, { x: px(23), y: py(5) });
        await c.move(m, px(20), py(8));
        await c.narr('모래 언덕 위에서 누군가 이쪽을 보고 있었다. 은빛 단추. 수첩에 무언가를 적는다.');
        await c.say(m, '빛으로 고기를 모으는 처녀라… 영주님께서 좋아하시겠군.', { face: 'normal' });
        await c.say(n, '…탐. 집에 가자.', { face: 'sad' });
        await c.cinema(false);
        await next(c);
      } },
    ],
    spots: [
      ...NETS.map((mk, i) => ({ mk, x: [6, 12, 20][i], y: 11, verb: '그물을 끌어 올린다', when: (st) => !st[mk], text: async (c, st) => {
        st[mk] = true; c.sfx('splash'); const n = count(st, NETS);
        await c.narr(['그물을 끌어당겼다. 무겁다. 고등어가 은빛으로 펄떡인다. 그물코마다 누나 노래 같은 빛이 묻어 있다.', '두 번째 그물. 고기 사이에 작은 게 한 마리. 돌려보냈다. 누나가 그러라고 했다.', '마지막 그물. 탐보다 무겁다. 누나 노래가 한 소절 커지자 그물이 가벼워졌다.'][n - 1] + ' (' + n + ' / 3)');
      } })),
      { mk: 'shell', x: 11, y: 9, verb: '조개껍데기를 줍는다', when: (st) => !st.c_shell, text: async (c, st) => { st.c_shell = true; c.sfx('item'); await c.narr('분홍 조개껍데기. 귀에 대면 바다 소리 — 아니, 누나 노래 소리가 난다.'); } },
    ],
    goals: [
      { text: '늙은 어부 바도에게 가 보자', targets: ['bado'], done: (st) => st.c_bado },
      { text: '물가에 쳐 둔 그물 셋을 끌어 올리자', targets: NETS, done: (st) => count(st, NETS) >= 3, prog: (st) => count(st, NETS) + ' / 3' },
      { text: '누나 마렌에게 돌아가자', targets: ['maren'] }],
    tdone: flags(NETS),
  }, {
    room: 'mf_maren_night', start: [13, 3], dir: 'down', music: 'requiem', era: '팔백 년 전 · 그 밤',
    intro: async (c) => {
      await c.narr('밤. 바닷가. 누나의 노래는 끝까지 끊기지 않았다. 그리고 끝났다.');
      await c.narr('바다가 희미하게 밝다. 마을 사람들이 물가에 모여 서서 아무 말도 하지 않는다.');
    },
    npcs: [
      { key: 'bado', name: '늙은 어부 바도', x: 9, y: 7, dir: 'down', look: BADO, talk: async (c, n, st) => { st.d_bado = true; await c.say(n, '막을 수가 없었다. 노래가… 끝까지 들어야 할 것 같아서. 다들 그랬어. 다 듣고 나니 마렌이 없었다.', { face: 'sad' }); await c.say(n, '탐, 넌 잘못한 거 없다. 바다도 잘못한 거 없고. …은빛 단추만 빼고.', { face: 'closed' }); } },
      { key: 'aunt', name: '생선 말리는 아주머니', x: 5, y: 6, dir: 'down', look: AUNT, talk: async (c, n, st) => { st.d_aunt = true; await c.say(n, '탐, 이리 와. 감기 들어.', { face: 'sad' }); await c.say(n, st.d_sandal ? '누나 신발? …그건 네가 가지고 있어. 바다는 신발이 필요 없으니까.' : '물가에 가지 마. …아니, 가 봐. 누나가 뭘 남겼을지도 몰라.', { face: 'cry' }); } },
      { key: 'niko', name: '옆집 꼬마 니코', x: 19, y: 7, dir: 'left', look: NIKO, talk: async (c, n, st) => { st.d_niko = true; await c.say(n, '탐… 너네 누나 노래, 나도 배울래. 둘이 부르면 바다가 덜 외롭잖아.', { face: 'sad' }); if (st.c_duet === 0) await c.say(n, '넌 끝 소절 알잖아. 낮에 들었어. 나한테 가르쳐 줘.', { face: 'normal' }); } },
      { key: 'man', name: '은빛 단추의 징수인', x: 22, y: 8, dir: 'left', look: BUTTON, talk: async (c, n, st) => {
        if (st.d_manDone) { await c.say(n, '…가라, 꼬마. 나도 간다.', { face: 'closed' }); return; }
        c.lock(true);
        await c.say(n, '빛이 바다로 갔다고? 영주님께 뭐라고 보고하나. 「세금이 바다로 도망쳤습니다」?', { face: 'normal' });
        await c.say(n, '…그럼 바다에 세금을 매기면 되겠군. 농담이다, 꼬마. 웃어라.', { face: 'normal' });
        const k = await c.choice('은빛 단추가 달빛에 번쩍인다.', ['노려본다', '모래를 한 줌 집어 던진다', '등을 돌린다']);
        st.d_manDone = true; st.d_manK = k;
        if (k === 0) { await c.say(n, '…그 눈. 네 누나랑 똑같군.', { face: 'closed' }); await c.narr('사내가 먼저 눈을 돌렸다.'); }
        else if (k === 1) { await c.narr('모래가 은빛 단추에 맞고 흩어졌다. 사내는 털어 내지 않았다. 한참 서 있다가 돌아섰다.'); }
        else { await c.say(n, '…그래. 등 돌리는 게 맞다. 나라도 그러겠다.', { face: 'sad' }); }
        await c.narr('그날 이후 은빛 단추는 그 해안에 오지 않았다. 걷을 빛이 없었으니까.');
        c.lock(false);
      } },
    ],
    spots: [
      { mk: 'sandals', x: 15, y: 10, verb: '물가의 짚신을 집어 든다', when: (st) => !st.d_sandal, text: async (c, st) => { st.d_sandal = true; c.sfx('lift'); await c.narr('누나의 짚신. 물가에 가지런히 놓여 있다. 젖지 않게, 물이 닿지 않는 자리에. 누나는 마지막까지 깔끔했다.\n짚신을 품에 안았다. 아직 모래가 따뜻하다.'); } },
      { mk: 'glow', x: 8, y: 10, verb: '밝은 물속을 들여다본다', text: async (c) => { await c.narr('물속이 밝다. 고기 떼가 그 빛 둘레를 돈다. 노래할 때처럼. …노래는 없는데.'); } },
      { mk: 'sing', x: 12, y: 11, verb: '물가에 선다', when: (st) => !!st.d_sandal && !!st.d_manDone, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        await c.narr('물에 발을 담갔다. 차갑다. 누나는 이 물로 걸어 들어갔다. 발목, 무릎, 허리.');
        const k = await c.choice('바다가 숨을 쉰다. 누나 박자로.', ['노래를 끝까지 부른다', '첫 소절만 부른다 — 나머지는 바다에게 맡긴다', '아무것도 부르지 않고 듣는다']);
        st.d_song = k;
        const say = says(c, '탐');
        if (k === 0) { await say('「가져간 만큼, 고마워. 남긴 만큼, 또 와 줘…」'); await c.narr(st.c_duet === 0 ? '누나가 가르쳐 준 끝 소절까지. 목소리가 떨렸지만 끊기지 않았다.' : '끝 소절은 잘 몰랐다. 그래서 웅얼거렸다. 바다가 그 웅얼거림에 박자를 맞췄다.'); }
        else if (k === 1) { await say('「가져간 만큼, 고마워…」'); await c.narr('목이 메었다. 그다음은 파도가 불렀다. 쏴아, 쏴아. 누나 박자로.'); }
        else await c.narr('아무것도 부르지 않았다. 그냥 들었다. 파도 소리 사이에 아주 작게 — 아는 노래가 섞여 있었다.');
        c.flash('#8ad0ff', 0.5); c.sfx('crystal');
        await c.narr('바다가 한 번, 크게 밝아졌다. 대답처럼.');
        await c.narr('탐은 평생 그 해안에서 노래를 불렀다. 고기는 다시 잡히지 않았지만, 탐은 매일 저녁 물가에 섰다.' + (st.d_niko ? ' 니코도 같이 섰다.' : ''));
        await c.narr('노래를 들어 줄 사람이 있는 동안, 바다 밑의 빛은 배가 고프지 않았다. …탐이 죽고, 노래를 아는 사람이 아무도 남지 않았을 때부터 — 빛은 배가 고파지기 시작했다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '물가에 누나가 남긴 것을 찾자', targets: ['sandals'], done: (st) => st.d_sandal },
      { text: '바닷가에 모인 사람들 곁으로', targets: ['bado', 'aunt', 'niko'], done: (st) => count(st, ['d_bado', 'd_aunt', 'd_niko']) >= 2, prog: (st) => count(st, ['d_bado', 'd_aunt', 'd_niko']) + ' / 2' },
      { text: '은빛 단추가 돌아왔다', targets: ['man'], done: (st) => st.d_manDone },
      { text: '물가에 서서 — 누나의 노래를', targets: ['sing'] }],
    tdone: { bado: (st) => st.d_bado, aunt: (st) => st.d_aunt, niko: (st) => st.d_niko },
    journal2: (st) => ['그 밤 탐은 바다를 향해 노래를 끝까지 불렀다.', '그 밤 탐은 노래 첫 소절만 불렀고, 나머지는 파도가 불렀다.', '그 밤 탐은 바다의 노래를 가만히 들었다.'][st.d_song || 0] + ' 노래를 아는 사람이 남아 있는 동안은 바다 밑의 빛도 배고프지 않았다.',
  }, async (c) => {
    await c.narr('며칠 뒤 저녁. 오두막 안. 은빛 단추는 그 뒤로 날마다 해안을 돌았다.\n누나 마렌은 그래도 노래를 부른다. 노래가 끝날 때마다 바다 쪽 창이 희미하게 밝아진다.');
  });

  /* ═════════ 3. 모래 위의 별지기 — 낙타 느림보 ═════════ */
  at('mf_saif_oasis', { region: 'yellow', name: '사백오십 년 전 · 오아시스', music: 'yellow', weather: 'dust', start: [13, 13] });
  at('mf_saif_dunes', { region: 'yellow', name: '사백오십 년 전 · 낮은 별 아래의 모래 언덕', music: 'dream', weather: 'stars', dark: 0.5, darkCol: 'rgba(10,8,30,1)', start: [13, 13],
    lights: [[13, 1, 80, 'rgba(255,240,180,0.25)']] });
  const SAIF = folk('student', { hc: '#1a1a22', tc: '#3a2a6a', skin: 'brown' });
  const CHIEF = folk('merchant', { tc: '#a8703a', skin: 'tan' });
  const YAS = folk('merchantw', { tc: '#d86a3a' });
  const PAGES = ['m1', 'm2', 'm3'];
  acts('saif', {
    room: 'mf_saif_oasis', start: [13, 13], dir: 'up', music: 'yellow', era: '사백오십 년 전 · 오아시스의 한낮',
    intro: async (c) => {
      await c.narr('다리가 길다. 등이 무겁다. 입안에서 무언가를 계속 씹고 있다.\n오아시스. 물 냄새가 코끝을 간지럽힌다. 다른 낙타들은 먼저 물가로 달려갔다. 너는 느리다. 그래서 마지막에 마신다. 그게 싫지 않다.');
      await c.narr('사람들은 너를 「느림보」라고 부른다. 물가에 소년 하나가 앉아 손끝으로 작은 빛을 띄우고 있다. 대상의 별지기.');
    },
    npcs: [
      { key: 'saif', name: '별지기 소년', x: 13, y: 6, dir: 'down', state: 'sit', look: SAIF, talk: async (c, n, st) => {
        if (!st.e_ask) {
          st.e_ask = true;
          await c.say(n, '느림보! 너 또 꼴찌로 왔구나. 괜찮아, 꼴찌는 물을 제일 오래 마셔.', { face: 'smile' });
          await c.say(n, '그보다 큰일 났어. 별지도가 바람에 날아갔어. 세 장. 다음 오아시스까지 가는 길이 거기 다 있는데.', { face: 'shock' });
          await c.say(n, '너 코 좋잖아. 내 냄새 나는 종이 찾아 줘. 먹으면 안 돼!', { face: 'normal' });
          return;
        }
        if (count(st, PAGES) < 3) { await cyc(c, n, st, 'e_sf', ['찾았어? 셋이야. 하나는 야자수 쪽, 하나는 천막 쪽으로 날아간 것 같아. 하나는… 모르겠어. 물 쪽?', '먹지 말라니까! …아직 안 먹었지?'], { face: 'normal' }); return; }
        c.lock(true); await c.cinema(true);
        await c.narr('물어 온 별지도 세 장을 소년 무릎에 떨어뜨렸다. 침이 조금 묻었다.');
        await c.say(n, '다 찾았어! 침은… 괜찮아. 별은 침 정도로 안 지워져.', { face: 'smile' });
        await c.say(n, '봐. 이게 별지도야. 진짜 별들 사이에 — 여기. 이 낮은 별. 이건 내가 띄운 거야.', { face: 'normal' });
        await c.say(n, '진짜 별은 계절마다 자리를 옮기잖아. 대상이 길을 잃어. 그래서 하나를 띄웠어. 늘 같은 자리에. …근데 이 별은 내가 없으면 꺼져.', { face: 'sad' });
        const k = await c.choice('소년이 지도를 펼쳐 네 코앞에 들이민다.', ['콧김으로 젖은 지도를 말려 준다', '지도 위에 털썩 누워 버린다', '소년의 머리를 핥는다']);
        st.e_map = k;
        if (k === 0) { await c.narr('훅. 콧김이 지도를 말렸다. 소년이 웃었다.'); await c.say(n, '고마워, 느림보. 넌 별지기의 낙타야.', { face: 'smile' }); }
        else if (k === 1) { await c.narr('지도 위에 누웠다. 지도가 구겨졌다. 소년이 웃다가 뒤로 넘어갔다.'); await c.say(n, '야아! …하하. 그래, 오늘은 쉬자. 별은 밤에 보면 돼.', { face: 'smile' }); }
        else { await c.narr('소년의 머리를 핥았다. 모래 맛, 땀 맛, 그리고 아주 조금 — 별빛 맛.'); await c.say(n, '으악, 침! …알았어, 알았어. 나도 너 좋아.', { face: 'smile' }); }
        const ch = find('chief');
        await c.say(ch || null, '사이프! 짐 싸라. 해 지면 떠난다. 오늘 밤은 모래바다 한가운데서 잔다.', { name: '대상의 우두머리', face: 'normal' });
        await c.say(n, '느림보, 들었지? 오늘 밤은 별이 제일 잘 보이는 데서 자. …나 오늘 밤 별 하나 더 띄울까 봐.', { face: 'smile' });
        await c.cinema(false);
        await next(c);
      } },
      { key: 'chief', name: '대상의 우두머리', x: 5, y: 5, dir: 'right', look: CHIEF, talk: async (c, n, st) => { st.e_chief = true; await cyc(c, n, st, 'e_ch', ['사이프 그 녀석, 또 낮에 빛을 띄웠지. 낮엔 별이 안 보여서 괜찮다고? 사람 눈엔 안 보여도 영주들 눈엔 보인다.', '느림보, 너 오늘도 꼴찌냐. 괜찮다. 대상에서 제일 오래 사는 건 늘 꼴찌 낙타야.']); } },
      { key: 'yas', name: '향신료 상인 야스민', x: 20, y: 5, dir: 'left', look: YAS, talk: async (c, n, st) => { st.e_yas = true; await cyc(c, n, st, 'e_ys', ['느림보, 네 짐에 내 향신료 넣었다? 흘리지 마.', '사이프는 별로 길을 찾고, 나는 냄새로 찾아. 우리 둘 다 길잡이야. …너도. 넌 물 냄새로 찾잖아.', '종이 냄새? 아까 바람이 천막 쪽으로 불었어. 내 코가 그래.'], { face: 'smile' }); } },
      { key: 'bolt', name: '빠른 낙타 번개', x: 19, y: 11, dir: 'left', look: { kind: 'camel' }, talk: async (c, n, st) => { st.e_bolt = (st.e_bolt || 0) + 1; await c.narr(st.e_bolt % 2 ? '(번개가 콧김을 뿜는다. 빠른 낙타는 늘 먼저 마시고 먼저 지친다. 번개는 벌써 졸린 눈이다.)' : '(번개가 네 짐 냄새를 맡는다. 향신료 냄새에 재채기를 했다.)'); } },
    ],
    spots: [
      ...PAGES.map((mk, i) => ({ mk, x: [7, 22, 16][i], y: [7, 10, 11][i], verb: ['야자수 밑을 킁킁거린다', '천막 뒤를 킁킁거린다', '갈대 사이를 킁킁거린다'][i], when: (st) => !st[mk] && !!st.e_ask, text: async (c, st) => {
        st[mk] = true; c.sfx('page'); const n = count(st, PAGES);
        await c.narr(['야자수 뿌리에 종이 한 장이 걸려 있다. 별 그림. 소년 냄새. 입에 물었다.', '천막 줄에 걸린 종이. 향신료 냄새가 배었다. 야스민 아주머니 짐 옆이다. 입에 물었다.', '갈대 사이에 젖은 종이. 물에 조금 번졌다. 별 하나가 번져서 두 개처럼 보인다. 입에 물었다.'][i] + ' (' + n + ' / 3)');
      } })),
      { mk: 'drink', x: 11, y: 11, verb: '물가에 고개를 숙인다', text: async (c, st) => { st.e_drink = true; c.sfx('splash'); await c.narr('물이 달다. 오래 마셨다. 꼴찌의 특권.\n물에 비친 하늘에, 낮인데도 별 하나가 희미하게 떠 있다. 아주 낮게.'); } },
    ],
    goals: [
      { text: '물가의 별지기 소년에게 다가가자', targets: ['saif'], done: (st) => st.e_ask },
      { text: '바람에 날아간 별지도 세 장을 찾자 — 냄새로', targets: PAGES, done: (st) => count(st, PAGES) >= 3, prog: (st) => count(st, PAGES) + ' / 3' },
      { text: '별지도를 소년에게 가져가자', targets: ['saif'] }],
    tdone: flags(PAGES),
  }, {
    room: 'mf_saif_dunes', start: [13, 13], dir: 'up', music: 'dream', era: '사백오십 년 전 · 별이 된 다음 날 밤',
    intro: async (c) => {
      await c.narr('다음 날 밤. 횃불들은 돌아갔다. 하늘을 올려다보고, 아무 말 없이.');
      await c.narr('모래 언덕 위 낮은 곳에 별 하나가 떠 있다. 어제까지는 없던 별. 대상 사람들이 그 별을 보며 짐을 꾸린다. 아무도 소년의 이름을 부르지 않는다. 부르면 울 것 같아서.');
    },
    npcs: [
      { key: 'chief', name: '대상의 우두머리', x: 6, y: 10, dir: 'right', look: CHIEF, talk: async (c, n, st) => {
        st.f_chief = true;
        await c.say(n, '느림보. …어젯밤 네가 어떻게 했는지 다 봤다.', { face: 'sad' });
        await c.say(n, ['그 느린 다리로 달리더구나. 평생 처음으로. 사이프가 네 등에서 웃는 걸 봤다. 무서웠을 텐데.', '무릎을 꿇어 그 아이를 숨기더구나. 횃불이 지나가지 않았지만, 넌 끝까지 일어서지 않았다.', '네 울음소리에 횃불들이 멈칫했지. 그 틈에 아이가 일어섰다. 제 발로. …네가 그 아이를 일으켜 세운 거야.'][pick(st)], { face: 'closed' });
        await c.say(n, '이제부터 대상 맨 앞은 네가 서라. 저 별을 보면서. 넌 느리니까, 별을 놓치지 않을 거다.', { face: 'normal' });
      } },
      { key: 'yas', name: '향신료 상인 야스민', x: 9, y: 11, dir: 'up', look: YAS, talk: async (c, n, st) => { st.f_yas = true; await c.say(n, '바람에서 그 아이 냄새가 나. 별빛 냄새. …코가 너무 좋으면 이럴 때 힘들어.', { face: 'cry' }); await c.say(n, '느림보, 너도 맡았지? 저 별에서. 그 아이 냄새.', { face: 'sad' }); } },
      { key: 'soldier', name: '길 잃은 징수대 병사', x: 21, y: 8, dir: 'left', state: 'sit', look: folk('guard', { tc: '#8a6a4a', hatC: '#a88a5a' }), talk: async (c, n, st) => {
        if (st.f_soldDone) { await c.say(n, ['…고맙다. 낙타야.', '…그래. 나 같은 놈은 그래도 싸지.', '저 별… 계속 저 자리에 있겠지?'][st.f_sold || 0], { face: 'sad' }); return; }
        c.lock(true);
        await c.say(n, '물… 물 좀. 횃불 든 놈들은 다 돌아갔어. 나만 모래에 발이 빠져서 길을 잃었어.', { face: 'sad' });
        await c.say(n, '저 별… 저 별 따라가면 오아시스가 나오나? 그 아이가 띄운 별 말이야. 우리가 쫓던.', { face: 'closed' });
        const k = await c.choice('병사가 마른 입술로 네 등의 물주머니를 본다.', ['물주머니 쪽으로 몸을 돌려 준다 — 나눠 준다', '모른 척 지나간다', '고개를 들어 낮은 별을 가리킨다 — 길을 알려 준다']);
        st.f_sold = k; st.f_soldDone = true;
        if (k === 0) { c.sfx('splash'); await c.narr('병사가 물주머니에 입을 대고 울었다. 물보다 눈물이 더 많았다.'); await c.say(n, '…쫓던 아이의 낙타한테 물을 얻어 마시는구나.', { face: 'cry' }); }
        else if (k === 1) await c.narr('지나갔다. 등 뒤에서 병사가 모래에 주저앉는 소리가 났다. 잠시 뒤 대상 사람 하나가 물주머니를 들고 그쪽으로 걸어갔다.');
        else { await c.narr('고개를 들어 낮은 별을 가리켰다. 병사가 그 별을 오래 올려다봤다.'); await c.say(n, '…저 별을 따라가면 되는구나. 그 아이가… 우리한테도 길을 알려 주는구나.', { face: 'cry' }); }
        c.lock(false);
      } },
      { key: 'bolt', name: '빠른 낙타 번개', x: 16, y: 12, dir: 'up', look: { kind: 'camel' }, talk: async (c) => { await c.narr('(번개가 낮은 별을 올려다본다. 낙타도 별을 본다. 오늘 밤은.)'); } },
    ],
    spots: [
      { mk: 'print', x: 10, y: 3, verb: '모래 위 발자국을 본다', text: async (c, st) => { st.f_print = true; c.sfx('wind'); await c.narr('작은 발자국이 언덕 위에서 끝난다. 그 너머는 없다.\n발자국 끝 모래 위에 손가락으로 그린 별 하나 — 소년이 마지막으로 그린 것. 바람이 아직 지우지 않았다.'); } },
      { mk: 'torch', x: 19, y: 6, verb: '꺼진 횃불들을 본다', text: async (c, st) => { st.f_torch = true; await c.narr('꺼진 횃불 열둘이 모래에 꽂혀 있다. 하늘을 올려다본 채 버리고 간 것처럼.\n아무도 별에 세금을 매기지 못했다.'); } },
      { mk: 'top', x: 13, y: 2, verb: '언덕 꼭대기, 별 아래에 선다', when: (st) => !!st.f_print && !!st.f_soldDone, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        await c.narr('언덕 꼭대기. 낮은 별이 바로 머리 위에 있다. 손을 뻗으면 닿을 것 같다. 낙타는 손이 없다.');
        const k = await c.choice('별이 아주 조금 흔들린다.', ['별을 향해 길게 운다', '별을 등지고 대상 쪽으로 돌아선다 — 앞장서러', '그 자리에 무릎을 꿇고 밤을 샌다']);
        st.f_end = k;
        await c.narr(['울었다. 낙타의 울음은 사막 끝까지 간다. 별이 한 번 깜박였다. 바람 탓일 것이다.', '돌아섰다. 대상의 맨 앞으로 걸어갔다. 별을 등에 지고는 걸을 수 없어서, 다시 돌아서서, 별을 보며 걸었다.', '무릎을 꿇었다. 밤새 별 아래에 앉아 있었다. 그날 밤 그 별이 가장 밝았다.'][k]);
        await c.narr('그날부터 대상의 맨 앞에는 늘 느림보가 걸었다. 가장 느린 낙타가. 별을 보며 걷느라 서두를 수가 없었다. 그래서 대상은 한 번도 길을 잃지 않았다.');
        if (st.f_sold === 0) await c.narr('물을 얻어 마신 병사는 이듬해 대상에 들어왔다. 평생 그 별을 보며 걸었다.');
        else if (st.f_sold === 2) await c.narr('별을 따라간 병사는 살아서 오아시스에 닿았다. 그리고 다시는 횃불을 들지 않았다.');
        await c.narr('느림보가 늙어 죽은 뒤에도 대상은 그 별을 따라갔다. 다만 아무도 그 별에게 고맙다고 하지 않았다. 별은 원래 거기 있는 줄 알았으니까.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '언덕 위, 소년의 발자국이 끝나는 곳으로', targets: ['print'], done: (st) => st.f_print },
      { text: '대상 사람들에게 돌아가자', targets: ['chief', 'yas'], done: (st) => !!(st.f_chief || st.f_yas) },
      { text: '버려진 횃불 곁에 누가 쓰러져 있다', targets: ['torch', 'soldier'], done: (st) => st.f_torch && st.f_soldDone },
      { text: '언덕 꼭대기, 낮은 별 아래로', targets: ['top'] }],
    tdone: { chief: (st) => st.f_chief, yas: (st) => st.f_yas, torch: (st) => st.f_torch, soldier: (st) => st.f_soldDone },
    journal2: (st) => ['그 밤 낙타는 별을 향해 길게 울었다.', '그 밤부터 낙타는 대상의 맨 앞에서 별을 보며 걸었다.', '그 밤 낙타는 별 아래에 무릎을 꿇고 밤을 샜다.'][st.f_end || 0] + ' 대상은 그 별을 따라 한 번도 길을 잃지 않았지만, 아무도 별에게 고맙다고 하지 않았다.',
  }, async (c) => {
    await c.narr('그날 밤. 모래바다 한가운데의 야영지. 낮의 오아시스는 벌써 반나절 거리 뒤에 있다.\n모닥불 곁에 소년이 별을 보고 앉아 있다. 손끝에서 작은 빛들이 떠올라 별 사이에 섞인다.');
  });

  /* ═════════ 4. 광맥을 마신 왕 — 왕의 서기 엘린 ═════════ */
  room('m_council', { region: 'gray', name: '612년 · 은빛 왕궁의 어전 회의실', w: 15, h: 11, floor: T.MARBLE, music: 'gray', dark: 0.15, rug: [3, 4, 9, 4],
    furn: [['counter', 7, 6, { v: 5 }], ['shelf', 1, 2], ['shelf', 13, 2], ['painting', 4, 1, { wall: true, v: '#8a8ab8' }], ['painting', 10, 1, { wall: true, v: '#c8c8e0' }], ['window', 7, 1, { wall: true }], ['desk', 12, 8], ['lamp', 3, 2], ['lamp', 11, 2]] });
  room('m_king', { region: 'gray', name: '612년 · 왕의 침실', w: 14, h: 10, floor: T.MARBLE, music: 'sad', dark: 0.35, darkCol: 'rgba(14,12,30,1)', rug: [4, 3, 6, 4],
    furn: [['bed2', 2, 3, { v: '#8a8ab8' }], ['window', 7, 1, { wall: true, v: 'night' }], ['desk', 11, 3], ['table', 3, 6], ['lamp', 5, 2], ['lamp', 9, 2]] });
  const KING = folk('knight', { hc: '#e8e8f0', tc: '#c8c8e0', cape: '#8a8aa8', beard: '#e8e8f0', age: 'old' });
  const BELLA = folk('student', { gender: 'girl', hair: 'long', hc: '#e8e8f0', tc: '#8a8ab8' });
  acts('silvan', {
    room: 'm_council', start: [7, 9], dir: 'up', music: 'gray', era: '612년 봄 · 사흘 전, 어전 회의',
    intro: async (c) => {
      await c.narr('오른손에 깃펜. 손가락 끝이 은빛 잉크로 물들었다. 너는 왕의 서기다. 왕의 말을 다 적는 사람.');
      await c.narr('어전 회의실. 과학원장과 재상이 왕 앞에 서 있다. 오늘 회의는 기록하지 말라는 말이 없었다. 그래서 적는다.');
    },
    npcs: [
      { key: 'king', name: '은빛 왕', x: 7, y: 4, dir: 'down', look: KING, talk: async (c, n, st) => {
        if (!(st.g_ort && st.g_bram)) { await cyc(c, n, st, 'g_kg', ['엘린. 다 적어라. 오늘은 듣기만 하겠다.', '…아직 할 말이 남은 자가 있나. 먼저 그들의 말을 적어라.'], { face: 'closed' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '적었나.', { face: 'closed' });
        await c.say(n, '…지금까지 한 말 중에 내 말은 하나도 없군. 내 말을 적어라.', { face: 'normal' });
        c.shake(2, 0.3);
        await c.say(n, '「안 된다.」', { face: 'angry' });
        const br = find('bram');
        await c.say(br || null, '전하—', { name: '재상 브람', face: 'shock' });
        await c.say(n, '안 된다고 했다. 세 글자다. 서기, 크게 적어라.', { face: 'angry' });
        const bl = addNpc({ key: 'bella0', name: '공주 벨라', look: BELLA, dir: 'up' }, { x: px(7), y: py(9) });
        c.sfx('door');
        await c.move(bl, px(8), py(5), { speed: 90 });
        c.face(bl, n);
        await c.say(bl, '아버지! 과학원 언니들이 그러는데 나 별 보러 가는 거야? 진짜 별?', { face: 'smile' });
        await c.narr('왕이 일어나 공주를 안았다. 오래. 회의실의 누구도 그걸 기록하라고 하지 않았다.');
        await c.say(n, '…별은 아버지가 보여 주마. 탑 꼭대기에서. 너는 땅에 있거라.', { face: 'sad' });
        const k = await c.choice('깃펜 끝에서 은빛 잉크가 떨어진다. 회의록 마지막 줄에 무엇을 적을까.', ['「왕께서 거부하셨다.」', '「왕께서 침묵하셨다.」 (재상이 바라는 대로)', '글 대신, 왕이 공주를 안은 모습을 그린다']);
        st.g_note = k;
        await c.narr(['「왕께서 거부하셨다.」 크게. 세 글자보다 크게.', '「왕께서 침묵하셨다.」 재상이 고개를 끄덕였다. 왕은 보지 못했다. 공주를 안고 있었으니까.', '깃펜으로 선을 그었다. 큰 사람 하나, 작은 사람 하나. 회의록에 그림을 그린 서기는 왕국 사백 년 동안 처음이었다.'][k]);
        await c.narr('그날 밤 왕은 서고에 은잔을 가져오게 했다. 대광맥에서 길어 올린 빛. 사흘 뒤의 일이었다.');
        await c.cinema(false);
        await next(c);
      } },
      { key: 'ort', name: '과학원장 오르텐', x: 4, y: 6, dir: 'right', look: folk('scholar', { gender: 'boy', hair: 'short', hc: '#8a8a9a', tc: '#4a5a7a' }), talk: async (c, n, st) => {
        if (!st.g_book) { await c.say(n, '서기, 회의록부터 펴게. 오늘 할 말은 길어.', { face: 'normal' }); return; }
        if (st.g_ort) { await c.say(n, '…받아 적었으면 됐네. 나는 숫자를 말했을 뿐이야. 숫자는 죄가 없지.', { face: 'closed' }); return; }
        st.g_ort = true;
        await c.say(n, '보고드립니다. 과학원 관측 결과, 하늘의 검은 눈은 빛이 가장 많이 모인 곳으로 옵니다. 육백 년 전에도 그랬다는 기록이 있습니다.', { face: 'normal' });
        await c.say(n, '그릇 후보 제1호는 실패했습니다. 빛을 다 담지 못하고… 투명해졌습니다.', { face: 'closed' });
        await c.say(n, '제2호는 — 공주 전하이십니다. 전하의 그릇은 광맥만큼 깊습니다.', { face: 'normal' });
        await c.narr('깃펜이 멈췄다. 「공주 전하」라고 적었다. 글씨가 작아졌다.');
      } },
      { key: 'bram', name: '재상 브람', x: 10, y: 6, dir: 'left', look: folk('oldm', { tc: '#6a6a80' }), talk: async (c, n, st) => {
        if (!st.g_ort) { await c.say(n, '과학원장 말부터 적게. 나는 그다음이야.', { face: 'normal' }); return; }
        if (st.g_bram) { await c.say(n, '서기, 자네는 적기만 하면 돼. 판단은 위에서 하지.', { face: 'normal' }); return; }
        st.g_bram = true;
        await c.say(n, '전하, 공주를 그릇으로 내어 주시면 왕국은 백 년을 법니다.', { face: 'normal' });
        await c.say(n, '백 년이면 대광맥을 끝까지 캘 수 있습니다. 더 큰 그릇을 만들 수 있지요. 한 사람으로 백 년. 싼 값입니다.', { face: 'normal' });
        await c.say(n, '…서기, 「싼 값」은 빼고 적게.', { face: 'closed' });
      } },
    ],
    spots: [
      { mk: 'minutes', x: 12, y: 8, verb: '서기의 책상에서 회의록을 펼친다', text: async (c, st) => { st.g_book = true; c.sfx('page'); await c.narr('회의록. 첫 줄은 이미 적혀 있다: 「612년 봄, 어전 회의. 안건 — 하늘의 검은 눈에 관하여.」\n「검은 눈」이라는 글자 위에 잉크가 번졌다. 네 손이 떨렸던 모양이다.'); } },
      { mk: 'window', x: 7, y: 2, dy: 6, verb: '창밖을 본다', text: async (c) => { await c.narr('창밖, 은빛 왕궁의 도시. 대광맥 위에 세운 도시라 밤에도 땅이 희미하게 빛난다.\n하늘 높은 데에는 아직 아무것도 없다. 아직은.'); } },
      { mk: 'portrait', x: 10, y: 2, dy: 6, verb: '초상화를 본다', text: async (c) => { await c.narr('역대 왕의 초상 열둘. 맨 끝은 지금 왕. 그 옆에 빈 액자 하나 — 다음 왕의 자리. 공주의 자리.'); } },
      { mk: 'vein', x: 7, y: 7, dy: -4, verb: '탁자 위 지도를 본다', text: async (c) => { await c.narr('대광맥 지도. 은빛 줄이 왕국 아래를 나무뿌리처럼 뻗어 있다. 과학원이 붉은 잉크로 「그릇 후보지」 다섯 곳에 동그라미를 쳤다. 그중 하나가 왕궁이다.'); } },
    ],
    goals: [
      { text: '서기의 책상에서 회의록을 펼치자', targets: ['minutes'], done: (st) => st.g_book },
      { text: '과학원장의 보고를 받아 적자', targets: ['ort'], done: (st) => st.g_ort },
      { text: '재상의 말도 받아 적자', targets: ['bram'], done: (st) => st.g_bram },
      { text: '회의가 끝났다 — 왕의 말을 적자', targets: ['king'] }],
  }, {
    room: 'm_king', start: [7, 8], dir: 'up', music: 'sad', era: '612년 · 은잔을 비운 지 사흘째 밤',
    intro: async (c) => {
      await c.narr('사흘 뒤 밤. 왕의 침실. 왕은 침대에 눕지 못한다. 누우면 배가 더 고프다고 했다.');
      await c.narr('창밖 하늘 한가운데 검은 점. 사흘 전에는 없었다. 점이 조금씩 커진다.');
    },
    npcs: [
      { key: 'king', name: '은빛 왕', x: 7, y: 4, dir: 'down', state: 'sit', look: KING, talk: async (c, n, st) => { st.h_king = true; await cyc(c, n, st, 'h_kg', ['…엘린인가. 배가 고프다. 적어라. 「왕은 배가 고프다.」', '잔을… 하나만 더. 아니. 아니다. 벨라는 어디 있느냐. 벨라를 보면 배가 덜 고프다.', '눈이 나를 본다. 됐다. 이제 딸은 보지 않겠지. …그런데 왜 이렇게 배가 고프냐.'], { face: 'sad' }); } },
      { key: 'maid', name: '시녀 노라', x: 5, y: 7, dir: 'left', look: folk('farmerw', { hat: null, tc: '#8a8ab8' }), talk: async (c, n, st) => { st.h_maid = true; await c.say(n, '서기님… 전하께서 사흘째 아무것도 못 드세요. 드셔도 드셔도 배가 고프시대요.', { face: 'sad' }); await c.say(n, '공주님은 밤마다 전하 곁에 앉아 계세요. 손을 잡고요. 공주님 손이… 점점 은빛이 돼요.', { face: 'sad' }); } },
      { key: 'guard', name: '근위병', x: 10, y: 8, dir: 'left', look: folk('guard', { tc: '#9a9ab0' }), talk: async (c, n, st) => { st.h_guard = true; await c.say(n, '과학원장이 왔다 갔습니다. 「이제 늦었다」고만 하고요. 재상은 짐을 쌌습니다.', { face: 'closed' }); await c.say(n, '…서기님, 이건 기록하지 마십시오. 근위병이 아무것도 지키지 못했다는 거.', { face: 'sad' }); } },
      { key: 'bella', name: '공주 벨라', x: 9, y: 5, dir: 'left', look: BELLA, talk: async (c, n, st) => {
        if (!(st.h_note && st.h_king && (st.h_maid || st.h_guard))) { await cyc(c, n, st, 'h_bl', ['엘린, 왔구나. 쉿. 아버지 겨우 앉아 계셔. 배가 고파서 못 주무셔.', '책상에 내가 쓴 거 있어. 읽어도 돼. 엘린은 다 읽잖아.', '아버지한테 말 걸어 줘. 엘린 목소리 들으면 아버지가 조금 웃어.'], { face: 'sad' }); return; }
        c.lock(true); await c.cinema(true);
        const k0 = find('king');
        await c.say(n, '엘린. 나 알았어. 아버지 배고픔은 아버지 것이 아니야. 광맥에 쌓인 오랜 배고픔이야. 아버지 혼자서는 못 들어.', { face: 'normal' });
        await c.say(n, '그러니까 내가 가져갈게. 나는 그릇이잖아. 원래 담으라고 만든 사람.', { face: 'smile' });
        await c.say(k0 || null, '…벨라, 안 된다.', { name: '은빛 왕', face: 'sad' });
        await c.say(n, '아버지가 그랬잖아. 「안 된다」. 회의록에 크게 적혀 있대. ' + (st.g_note === 1 ? '…아니, 「침묵하셨다」였대. 그러니까 이번엔 내가 말할 차례야.' : '그러니까 이번엔 내가 말할 차례야.'), { face: 'smile' });
        if (k0) await c.move(n, k0.x + 14, k0.y);
        await c.narr('공주가 왕의 두 손을 잡았다. 은빛이 손을 타고 건너왔다. 왕의 눈에서 은빛이 빠져나갔다. 공주의 눈이 은빛으로 차올랐다.');
        c.flash('#e8e8ff', 0.6); c.sfx('drain');
        await c.say(k0 || null, '…배가… 안 고프다.', { name: '은빛 왕', face: 'cry' });
        await c.say(n, '엘린. 마지막으로 적어 줘. 그때 말한 거.', { face: 'normal' });
        const k = await c.choice('공주가 창 쪽으로 걸어간다. 하늘의 검은 점이 공주를 본다.', ['「벨라는 무섭지 않다.」 (부탁대로)', '「벨라는 무서웠지만 갔다.」 (사실대로)', '아무것도 적지 않고, 공주의 손을 잡는다']);
        st.h_end = k;
        if (k === 0) await c.say(n, '…고마워. 거짓말인 거 알지? 그래도 그렇게 남겨 줘.', { face: 'smile' });
        else if (k === 1) await c.say(n, '맞아. 무서워. 엘린은 늘 사실을 적어. 그래서 좋아.', { face: 'cry' });
        else { await c.narr('공주의 손을 잡았다. 차가웠다. 은빛이 손끝까지 올라와 있었다.'); await c.say(n, '엘린 손 따뜻하다. …이거 가져갈게. 조금만.', { face: 'smile' }); }
        await c.move(n, px(7), py(2) + 4);
        await c.narr('공주는 창밖으로 걸어 나갔다. 떨어지지 않았다. 올라갔다. 은빛 한 줄기가 검은 점까지 닿았다.\n그리고 — 점이 공주를 삼켰다. 아니, 공주가 점을 안았다.');
        c.sfx('white'); c.shake(3, 0.6); n.dead = true;
        await c.narr('왕은 그날부터 배가 고프지 않았다. 대신 아무것도 먹지 못했다. 이듬해 봄, 왕은 딸의 빈 방에서 죽었다. 왕국은 색을 잃었다.');
        await c.narr(['회의록의 「왕께서 거부하셨다」는 왕국이 색을 잃은 뒤에도 남았다. 거부는 아무것도 막지 못했지만, 거부했다는 것은 남았다.', '회의록의 「왕께서 침묵하셨다」는 사백 년 동안 그대로 남았다. 엘린은 그 줄을 볼 때마다 침묵했다.', '회의록의 그림은 누군가 찢어 갔다. 엘린은 누군지 끝내 묻지 않았다. 아마 왕이었을 것이다.'][st.g_note || 0]);
        await c.cinema(false);
        await next(c);
      } },
    ],
    spots: [
      { mk: 'note', x: 11, y: 3, dy: 2, verb: '책상 위 쪽지를 읽는다', text: async (c, st) => { st.h_note = true; c.sfx('page'); await c.narr('공주의 글씨: 「아버지한테. 다 먹지 마. 나눠. — 벨라」\n「나눠」에 줄을 그었다가, 다시 썼다가, 다시 그었다. 마지막에는 그어진 줄 위에 한 번 더 썼다.'); } },
      { mk: 'cups', x: 3, y: 6, dy: -2, verb: '탁자 위 잔들을 본다', text: async (c) => { await c.narr('빈 은잔이 열둘. 왕이 사흘 동안 비운 잔이다. 광맥 빛은 마실수록 배가 고프다고 과학원장이 말했다. 왕은 듣지 않았다.'); } },
      { mk: 'window', x: 7, y: 2, dy: 6, verb: '창밖 하늘을 본다', text: async (c) => { c.sfx('heartbeat'); await c.narr('하늘 한가운데 검은 점. 둘레가 은빛으로 젖어 있다. 왕을 보고 있다. 아니 — 왕의 손을 잡고 있는 공주를 보고 있다.'); } },
    ],
    goals: [
      { text: '책상 위에 공주의 쪽지가 있다', targets: ['note'], done: (st) => st.h_note },
      { text: '왕에게 말을 걸자', targets: ['king'], done: (st) => st.h_king },
      { text: '침실을 지키는 사람들에게 묻자', targets: ['maid', 'guard'], done: (st) => !!(st.h_maid || st.h_guard) },
      { text: '공주 벨라에게', targets: ['bella'] }],
    tdone: { maid: (st) => st.h_maid, guard: (st) => st.h_guard },
    journal2: (st) => ['엘린은 「벨라는 무섭지 않다」고 적었다.', '엘린은 「벨라는 무서웠지만 갔다」고 적었다.', '엘린은 아무것도 적지 않고 공주의 손을 잡았다.'][st.h_end || 0] + ' 공주는 아버지의 배고픔을 안고 하늘로 올라갔다.',
  }, async (c) => {
    await c.narr('사흘 뒤. 서고. 왕은 그날 이후 잠을 자지 않았다.\n서고 가운데 은잔 하나. 잔 안에서 빛이 물처럼 출렁인다. 대광맥에서 길어 올린 빛.');
  });

  /* ═════════ 5. 흰 수녀원의 겨울 — 수련 수녀 리네 ═════════ */
  at('mf_elia_yard', { region: 'white', name: '이백 년 전 · 흰 수녀원 마당', music: 'white', weather: 'snow', start: [12, 14] });
  at('mf_elia_spring', { region: 'white', name: '이백 년 전 · 봄이 온 수녀원 마당', music: 'sad', weather: 'petals', start: [12, 14], furn: [['desk', 5, 5]] });
  const ELIA = folk('nun', { hc: '#f4f0e8', tc: '#f4f8ff' });
  const MARTA = folk('nun', { age: 'old', tc: '#d8e0ec' });
  const ANNA = folk('kidg', { hc: '#d8d4d0', tc: '#f4c8d8' });
  const LOGS = ['w1', 'w2', 'w3'];
  acts('elia', {
    room: 'mf_elia_yard', start: [12, 14], dir: 'up', music: 'white', era: '이백 년 전 · 첫눈 오던 날',
    intro: async (c) => {
      await c.narr('손이 시리다. 열네 살. 오늘 수녀원에 왔다. 짐은 보따리 하나, 엄마가 싸 준 털장갑 한 켤레.');
      await c.narr('흰 수녀원 마당. 첫눈이 내린다. 우물가에서 젊은 수녀 하나가 물을 긷다가 이쪽을 보고 웃는다.');
    },
    npcs: [
      { key: 'marta', name: '원장 수녀 마르타', x: 10, y: 4, dir: 'down', look: MARTA, talk: async (c, n, st) => {
        if (!st.i_marta) { st.i_marta = true; await c.say(n, '새로 왔구나. 리네라고? 손이 트겠다.', { face: 'normal' }); await c.say(n, '여기서는 손이 제일 중요해. 아픈 사람을 만지는 손이니까. …첫 일은 장작이다. 마당에 흩어진 장작 셋을 들여놓으렴. 아이들 방이 춥다.', { face: 'normal' }); return; }
        await cyc(c, n, st, 'i_mt', ['엘리아 수녀를 만나 봤니? 그 아이 손은… 특별하단다. 너무 특별해서 걱정이야.', '대성당에서 자꾸 편지가 와. 「손이 특별한 수녀가 있다던데」. 답장은 안 했다.']);
      } },
      { key: 'elia', name: '엘리아 수녀', x: 16, y: 7, dir: 'left', look: ELIA, talk: async (c, n, st) => {
        if (!st.i_marta) { await c.say(n, '안녕! 새로 온 아이구나. 원장님께 먼저 인사드리렴. 저기 예배당 문 앞.', { face: 'smile' }); return; }
        if (count(st, LOGS) < 3) { await cyc(c, n, st, 'i_el', ['장작 나르는구나. 하나씩 해. 서두르면 미끄러져. 눈이 오잖아.', '나는 엘리아야. 여기 온 지 삼 년. …너 손 시리지? 장작 다 나르면 이리 와.'], { face: 'smile' }); return; }
        if (st.i_warm) { await c.say(n, '문 앞에 누가 왔나 봐. 가 보자.', { face: 'normal' }); return; }
        c.lock(true);
        await c.say(n, '다 날랐어? 고생했다. 손 줘 봐.', { face: 'smile' });
        c.sfx('heal');
        await c.narr('엘리아 수녀가 두 손으로 리네의 손을 감쌌다. 따뜻해졌다. 손끝부터 팔꿈치까지. 이상할 만큼.');
        await c.say(n, '이건 비밀이야. 내 손은 따뜻함을 옮길 수 있어. 아픈 것도.', { face: 'smile' });
        await c.say(n, '…대신 옮긴 만큼 나는 조금 차가워져. 괜찮아. 금방 돌아와.', { face: 'normal' });
        await c.narr('수녀님 손끝이 아주 잠깐 눈처럼 비쳤다. 금방 돌아왔다. 아직은.');
        st.i_warm = true;
        addNpc({ key: 'tor', name: '아이 아버지 토르', look: folk('farmer', { hat: null, tc: '#7a6a5a' }), dir: 'up', talk: torTalk }, { x: px(10), y: py(13) });
        const an = addNpc({ key: 'anna', name: '안나', look: ANNA, dir: 'up', state: 'sit' }, { x: px(11), y: py(13) });
        an.state = 'sit';
        c.sfx('door');
        await c.narr('수녀원 문 쪽에서 누가 소리친다. 「수녀님! 수녀님, 우리 애 좀…!」');
        c.lock(false);
      } },
    ],
    spots: [
      ...LOGS.map((mk, i) => ({ mk, x: [7, 20, 6][i], y: [11, 9, 5][i], verb: '눈 속의 장작을 줍는다', when: (st) => !st[mk] && !!st.i_marta, text: async (c, st) => {
        st[mk] = true; c.sfx('lift'); const n = count(st, LOGS);
        await c.narr(['장작 하나. 눈을 털었다. 손이 더 시리다.', '장작 둘. 나무 속에서 송진 냄새. 엄마 부엌 냄새.', '장작 셋. 부엌 문 앞에 쌓았다. 아이들 방 굴뚝에서 연기가 오른다.'][n - 1] + ' (' + n + ' / 3)');
      } })),
      { mk: 'well', x: 18, y: 7, verb: '우물을 들여다본다', text: async (c) => { await c.narr('우물이 얼었다. 돌로 얼음을 깨자 물이 검게 반짝인다. 물에 비친 하늘이 하얗다.'); } },
      { mk: 'bell', x: 8, y: 3, verb: '예배당 종 줄을 본다', text: async (c) => { await c.narr('예배당 종 줄. 종은 하루 세 번 울린다. 아침, 낮, 저녁.\n네 번 울리는 날은 누가 하늘로 간 날이라고 원장님이 그랬다.'); } },
    ],
    goals: [
      { text: '원장 수녀님께 인사하자 — 예배당 문 앞', targets: ['marta'], done: (st) => st.i_marta },
      { text: '마당에 흩어진 장작 셋을 들여놓자', targets: LOGS, done: (st) => count(st, LOGS) >= 3, prog: (st) => count(st, LOGS) + ' / 3' },
      { text: '우물가의 엘리아 수녀에게', targets: ['elia'], done: (st) => st.i_warm },
      { text: '문 앞에 아픈 아이가 왔다', targets: ['tor'] }],
    tdone: flags(LOGS),
  }, {
    room: 'mf_elia_spring', start: [12, 14], dir: 'up', music: 'sad', era: '이백 년 전 · 이듬해 봄',
    intro: async (c) => {
      await c.narr('봄. 눈이 녹는다. 마당에 처음으로 풀빛이 돈다.\n겨울 끝에 대성당 종이 네 번 울렸다. 리네는 그 소리를 셌다. 넷.');
      await c.narr('병실의 아이 셋은 다 나았다. 오늘 마당에서 뛰어논다. 엘리아 수녀님만 없다.');
    },
    npcs: [
      { key: 'marta', name: '원장 수녀 마르타', x: 10, y: 4, dir: 'down', look: MARTA, talk: async (c, n, st) => { st.j_marta = true; await c.say(n, '리네. …대성당에서 전령이 왔단다. 문 앞에. 네가 받으렴. 엘리아는 너를 제일 아꼈으니까.', { face: 'sad' }); } },
      { key: 'msg', name: '대성당 전령', x: 12, y: 13, dir: 'up', look: folk('guard', { tc: '#e8eef8', hatC: '#f4f8ff' }), talk: async (c, n, st) => {
        if (!st.j_marta) { await c.say(n, '원장 수녀님을 먼저 뵙고 오십시오.', { face: 'normal' }); return; }
        if (st.j_letter) { await c.say(n, '…성녀께서는 웃으며 가셨다고 합니다. 저는 그렇게 전하라고 들었습니다.', { face: 'closed' }); return; }
        st.j_letter = true;
        await c.say(n, '흰 수녀원 리네 수녀님께. 성녀의 유품입니다.', { face: 'normal' });
        c.sfx('page');
        await c.narr('편지 한 장, 그리고 작은 나무 컵 하나.\n편지: 「성녀 엘리아께서 하늘로 가셨다. 그분의 빛은 얼음 창고에 고이 모셔 두었다. 천 명이 살았다. 녹지 않을 것이다.」');
        await c.narr('「녹지 않을 것이다」. 좋은 말처럼 쓰여 있었다.');
      } },
      { key: 'anna', name: '안나', x: 8, y: 8, dir: 'right', look: ANNA, wander: 20, talk: async (c, n, st) => { st.j_anna = true; await c.say(n, '리네 언니! 봐, 내 손. 분홍색이야!' + (st.i_first === 1 ? ' 언니가 준 털장갑 아직 있어.' : ''), { face: 'smile' }); await c.say(n, '엘리아 수녀님 손은 하얬는데. …수녀님은 언제 와?', { face: 'sad' }); } },
      { key: 'toby', name: '병실 아이 토비', x: 19, y: 10, dir: 'left', look: folk('kid', { tc: '#a8c8e8' }), talk: async (c, n, st) => { st.j_toby = true; await c.say(n, '언니, 수녀님이 그랬어. 아픈 건 나눠 가지면 반이 된대.', { face: 'normal' }); await c.say(n, '근데 수녀님은 다 가져갔잖아. 그럼 반이 아니잖아.', { face: 'sad' }); } },
    ],
    spots: [
      { mk: 'cup', x: 15, y: 10, verb: '수녀님이 앉던 의자를 본다', text: async (c) => { await c.narr('엘리아 수녀가 앉던 의자. 컵을 놓던 자리에 동그란 자국.\n수녀님은 늘 물을 반만 채워 마셨다. 「나머지 반은 목마른 사람 몫.」'); } },
      { mk: 'bell', x: 8, y: 3, verb: '예배당 종 줄을 잡는다', when: (st) => !!st.j_letter && !st.j_bellDone, text: async (c, st) => {
        const k = await c.choice('종 줄을 잡았다. 손이 차갑지 않다. 봄이니까.', ['네 번 친다 — 하늘로 간 사람을 위해', '네 번, 그리고 한 번 더 — 엘리아를 위해', '치지 않는다 — 수녀님은 아직 여기 있다']);
        st.j_bell = k; st.j_bellDone = true;
        if (k === 2) { await c.narr('종 줄을 놓았다. 종은 울리지 않았다. 마당에서 아이들 웃음소리만 났다. 수녀님이 좋아하던 소리.'); return; }
        for (let i = 0; i < (k === 1 ? 5 : 4); i++) { c.sfx('bell'); await c.wait(0.7); }
        await c.narr(k === 1 ? '넷. 그리고 하나 더. 다섯 번째 종은 규칙에 없다. 원장 수녀님이 예배당 문 앞에서 아무 말 없이 고개를 숙였다.' : '넷. 마당의 아이들이 뛰다가 멈췄다. 안나가 하늘을 올려다봤다.');
      } },
      { mk: 'write', x: 5, y: 5, dy: 4, verb: '엄마에게 쓰던 편지를 편다', when: (st) => !!st.j_bellDone, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        c.sfx('page');
        await c.narr('엄마에게 쓰다 만 편지. 겨울 내내 그대로였다.\n「엄마, 아픔은 어디로 가요?」 — 그 아래에 답을 적는다.');
        const k = await c.choice('잉크는 이제 얼지 않는다.', ['「아픔은 나눠 가진 사람 몫이 돼요. 그러니까 나눠야 해요.」', '「아픔은 얼음 창고로 가요. 거기서 안 녹아요.」', '「모르겠어요. 그래서 저는 여기 남을래요.」']);
        st.j_end = k;
        await c.narr(['그 답을 적고, 리네는 처음으로 울었다. 엘리아 수녀님이 끝내 하지 못한 일이었다. 나누는 것.', '그 답을 적은 종이는 오래 그 자리에 있었다. 리네는 그 답이 틀렸기를 평생 바랐다.', '리네는 그해 수련을 마치고 정식 수녀가 되었다. 집에 돌아가지 않았다.'][k]);
        await c.narr(['「가지 마세요」라고 했었다. 수녀님은 그 말이 듣고 싶었다고 했다. 리네는 그 말을 한 걸 평생 다행으로 여겼다.', '「가세요」라고 했었다. 리네는 그 말을 지켰다. 남은 아이들을, 그다음 아이들을, 그다음 아이들을 보았다.', '수녀님 손을 감쌌었다. 받기만 해 본 적 없던 사람에게. 리네는 평생 그렇게 아이들 손을 감쌌다. 받는 법을 아는 아이들로 키웠다.'][pick(st)]);
        await c.narr('…그래도 얼음 창고의 빛은 녹지 않았다. 이백 년 동안. 천 명에게 나눠졌지만 아무도 돌려주지 않은 빛. 그 안에서 엘리아는 조금씩 배가 고파졌다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '원장 수녀님이 부른다', targets: ['marta'], done: (st) => st.j_marta },
      { text: '문 앞의 대성당 전령에게', targets: ['msg'], done: (st) => st.j_letter },
      { text: '다 나은 아이들 곁으로', targets: ['anna', 'toby'], done: (st) => !!(st.j_anna || st.j_toby) },
      { text: '예배당 종 줄을 잡자', targets: ['bell'], done: (st) => st.j_bellDone },
      { text: '엄마에게 쓰던 편지에 답을 적자', targets: ['write'] }],
    tdone: { anna: (st) => st.j_anna, toby: (st) => st.j_toby },
    journal2: (st) => ['이듬해 봄, 리네는 「아픔은 나눠 가진 사람 몫」이라 적었다.', '이듬해 봄, 리네는 「아픔은 얼음 창고로 간다」고 적었다.', '이듬해 봄, 리네는 답 대신 수녀원에 남았다.'][st.j_end || 0] + ' 얼음 창고의 빛은 이백 년 동안 녹지 않았다.',
  }, async (c) => {
    await c.narr('그해 한겨울. 수녀원 병실. 잉크가 얼었다. 엄마에게 쓰던 편지는 반쯤 그대로다.\n병실에 아이 셋. 그리고 엘리아 수녀님. 수녀님이 손을 대면 아이들 손끝의 투명함이 물러난다. 수녀님 손은 이제 늘 차갑다.');
  });
  async function torTalk(c, n, st) {
    c.lock(true); await c.cinema(true);
    await c.say(n, '우리 안나 손끝이 투명해져요. 의사가 못 고친대요. 빛이 빠져나가는 병이래요.', { face: 'cry' });
    const el = find('elia'), an = find('anna');
    if (el && an) await c.move(el, an.x + 14, an.y);
    await c.narr('엘리아 수녀가 무릎을 꿇고 아이의 손을 잡았다. 눈송이가 수녀님 어깨에 쌓였다.');
    c.sfx('heal'); if (an) G.fx.glow(an.x, an.y - 10, '#ffe8f0', 16);
    await c.narr('아이의 손끝에 색이 돌아왔다. 분홍색. 수녀님 손끝은 — 하얘졌다. 이번에는 돌아오지 않았다.');
    await c.say(an || null, '…아빠, 손 따뜻해.', { name: '안나', face: 'smile' });
    await c.say(n, '수녀님… 수녀님 손이…', { face: 'shock' });
    await c.say(el || null, '괜찮아요. 금방 돌아와요.', { name: '엘리아 수녀', face: 'smile' });
    await c.narr('리네는 봤다. 돌아오지 않는 것을.');
    const k = await c.choice('수녀님이 일어서다가 비틀거린다.', ['수녀님 손을 잡아 본다', '엄마가 준 털장갑을 아이 손에 끼워 준다', '그 자리에 서서 기도한다']);
    st.i_first = k;
    if (k === 0) { await c.narr('수녀님 손을 잡았다. 차가웠다. 아까 받은 따뜻함이 생각났다. 돌려주고 싶었다. 어떻게 하는지 몰랐다.'); await c.say(el || null, '…리네 손 따뜻하다. 고마워.', { name: '엘리아 수녀', face: 'smile' }); }
    else if (k === 1) { await c.narr('엄마가 준 털장갑을 아이 손에 끼워 주었다. 커서 헐렁했다. 아이가 웃었다.'); await c.say(el || null, '…좋은 손이네, 리네. 주는 손.', { name: '엘리아 수녀', face: 'smile' }); }
    else { await c.narr('두 손을 모았다. 무엇을 빌어야 할지 몰랐다. 그래서 「수녀님 손이 돌아오게 해 주세요」라고 빌었다.'); await c.say(el || null, '…들렸어. 고마워.', { name: '엘리아 수녀', face: 'smile' }); }
    await c.narr('그해 겨울, 엘리아 수녀의 손은 아이 셋을 살렸다. 그리고 점점 차가워졌다.');
    await c.cinema(false);
    await next(c);
  }

  /* ═════════ 6. 등불지기의 약속 — 로웬 ═════════ */
  at('mf_noeul_dusk', { region: 'black', pal: 'amber', name: '백 년 전 · 해가 지던 거리', music: 'sad', dark: 0.32, darkCol: 'rgba(90,30,20,1)', weather: 'motes', start: [24, 7] });
  at('mf_noeul_street', { region: 'black', name: '백 년 전 · 열여섯 해 뒤의 등불 거리', music: 'black', dark: 0.75, darkCol: 'rgba(6,4,18,1)', start: [24, 7],
    lights: [[4, 4, 46, 'rgba(255,200,110,0.32)'], [14, 4, 46, 'rgba(255,200,110,0.32)'], [9, 10, 46, 'rgba(255,200,110,0.32)'], [21, 10, 46, 'rgba(255,200,110,0.32)']] });
  const NOEUL_S = folk('kidg', { hc: '#ffd8a0', tc: '#ff9a6a' });
  const NOEUL_T = folk('nightw', { hc: '#ffd8a0', tc: '#ff9a6a', trim: '#ffd86a', hair: 'long' });
  const SERA = folk('farmerw', { hat: null, hc: '#3a2a2a', tc: '#c86a4a' });
  const DOORS = ['d1', 'd2', 'd3'];
  const UNLIT = ['u1', 'u2', 'u3'];
  acts('noeul', {
    room: 'mf_noeul_dusk', start: [24, 7], dir: 'left', music: 'sad', era: '백 년 전 · 해가 마지막으로 지던 날', lantern: false,
    intro: async (c) => {
      await c.narr('손에 양초 꾸러미. 너는 양초 장수 로웬이다. 등불지기 같은 건 아직 세상에 없다. 해가 지면 사람들은 그냥 잔다.');
      await c.narr('오늘은 해가 이상하게 빨리 진다. 하늘 저쪽, 해 옆에 검은 점 하나. 점이 해를 조금씩 갉아먹는 것 같다.');
    },
    npcs: [
      { key: 'sera', name: '노을의 엄마 세라', x: 13, y: 5, dir: 'down', look: SERA, talk: async (c, n, st) => {
        if (!st.k_sera) { st.k_sera = true; await c.say(n, '양초 장수 로웬 씨죠? 양초 셋 주문했던… 아, 다른 집 배달 중이시구나. 끝나면 잠깐 와 주실래요. 부탁이 있어요.', { face: 'normal' }); return; }
        if (count(st, DOORS) < 3) { await c.say(n, '배달 먼저 하세요. 저는 여기 있을게요. …노을이도요.', { face: 'normal' }); return; }
        if (st.k_done) { await c.say(n, '…해가 져요. 노을아, 엄마 손 잡아.', { face: 'sad' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '로웬 씨. 이 아이 이름은 노을이에요. 노을처럼 빛나서.', { face: 'smile' });
        await c.narr('아이가 엄마 치마 뒤에서 고개를 내밀었다. 정말로 빛났다. 해 질 녘 하늘 색으로.');
        await c.say(n, '빛 걷는 사람들이 이 거리를 돌아요. 빛나는 아이를 찾는대요. 그릇으로 쓴다고.', { face: 'sad' });
        await c.say(n, '해가 지면 — 오늘은 이상하게 해가 다시 안 뜰 것 같아요 — 어두워지면 이 아이가 제일 잘 보일 거예요. 혹시 제가 없으면… 이 아이를 좀.', { face: 'cry' });
        const k = await c.choice('세라가 아이의 손을 로웬 쪽으로 내민다.', ['「약속할게요.」', '「저는… 양초 장수일 뿐이에요.」', '대답 대신 아이 손에 양초 하나를 쥐여 준다']);
        st.k_promise = k; st.k_done = true;
        if (k === 0) { await c.say(n, '…고마워요.', { face: 'cry' }); await c.narr('그때는 몰랐다. 그 약속이 백 년짜리라는 걸.'); }
        else if (k === 1) { await c.say(n, '알아요. 그래도 양초 장수잖아요. 불을 켜는 사람.', { face: 'smile' }); await c.narr('그 말이 오래 남았다. 불을 켜는 사람.'); }
        else { c.sfx('lamp'); await c.narr('아이가 양초를 꼭 쥐었다. 아이 빛에 양초 심지가 저절로 붙었다. 작은 불. 아이가 웃었다.'); const ki = find('kid'); await c.say(ki || null, '불이다! 내 불!', { name: '노을', face: 'smile' }); }
        await c.say(n, '…해가 져요. 서쪽 끝에서 보면 잘 보일 거예요. 마지막 해일지도 모르니까, 봐 두세요.', { face: 'sad' });
        await c.cinema(false); c.lock(false);
      } },
      { key: 'kid', name: '노을', x: 14, y: 6, dir: 'down', state: 'sit', look: NOEUL_S, talk: async (c, n, st) => { await cyc(c, n, st, 'k_kd', ['아저씨 양초 장수야? 양초는 왜 불이 붙어? 나는 그냥 빛나는데.', '엄마가 밖에 나가지 말래. 내 빛이 노을 같대. 노을은 예쁜 거잖아. 근데 왜 숨어야 돼?'], { face: 'smile' }); } },
      { key: 'old', name: '이웃 할아버지', x: 9, y: 8, dir: 'up', look: folk('oldm', { tc: '#6a5a4a' }), talk: async (c, n, st) => { st.k_old = true; await c.say(n, '해가 오늘따라 빨리 지는구먼. 하늘 저쪽에 검은 점 보이나? 저게 해를 갉아먹는 것 같아.', { face: 'normal' }); await c.say(n, '내 평생 해가 안 뜬 날은 없었어. …오늘이 처음일지도 모르겠군. 로웬, 양초 넉넉히 있나?', { face: 'closed' }); } },
      { key: 'col', name: '빛 걷는 사람', x: 21, y: 8, dir: 'left', look: folk('nightm', { tc: '#5a5a6a', trim: '#9a9aa8' }), talk: async (c, n, st) => {
        if (st.k_colDone) { await c.say(n, '…해가 지면 다시 오지.', { face: 'closed' }); return; }
        await c.say(n, '양초 장수. 이 거리에 빛나는 아이가 있다던데. 못 봤나.', { face: 'normal' });
        const k = await c.choice('사내의 회색 외투에 빛 걷는 이들의 문장이 수놓여 있다.', ['「못 봤습니다.」 (거짓말)', '「빛나는 건 제 양초뿐이에요.」', '대답하지 않고 지나간다']);
        st.k_colDone = true; st.k_lie = k;
        if (k === 0) await c.say(n, '…그래. 양초 장수 눈이 어두운가 보군.', { face: 'closed' });
        else if (k === 1) { await c.say(n, '하. 재치 있군. 양초 하나 사지. 곧 어두워질 테니.', { face: 'smile' }); c.sfx('coin'); }
        else await c.narr('사내가 등 뒤를 오래 보았다. 등이 뜨거웠다.');
      } },
    ],
    spots: [
      ...DOORS.map((mk, i) => ({ mk, x: [5, 19, 8][i], y: [3, 3, 11][i], verb: '양초를 문 앞에 둔다', when: (st) => !st[mk], text: async (c, st) => {
        st[mk] = true; c.sfx('door'); const n = count(st, DOORS);
        await c.narr(['빵집. 문틈으로 아이 우는 소리. 양초 하나를 두고 노크 두 번.', '재봉사 집. 「해가 왜 이렇게 빨리 지냐」고 투덜거리는 소리. 양초 하나.', '늙은 부부의 집. 「고마워요, 로웬. 오늘 밤은 길 것 같아.」 양초 하나.'][i] + ' (' + n + ' / 3)');
      } })),
      { mk: 'sun', x: 2, y: 7, verb: '거리 서쪽 끝에서 해를 본다', when: (st) => !!st.k_done, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        await c.narr('거리 서쪽 끝. 지붕 사이로 해가 보인다. 검은 점이 해의 절반을 먹었다.');
        c.sfx('rumble');
        await c.narr('해가 졌다. 하늘이 노을빛으로 물들었다가 — 꺼졌다.');
        c.flash('#ff8a4a', 0.4);
        await c.narr('어둠 속에서, 거리에 단 하나 빛나는 것이 있었다. 세라의 집 앞. 노을빛 아이.');
        await c.narr(st.k_promise === 2 ? '아이 손에 쥔 양초 불과 아이의 빛이 섞여, 어느 쪽이 아이인지 잘 알 수 없었다. — 로웬은 그때 처음 생각했다. 빛은 빛 속에 숨기면 된다.' : '로웬은 양초 꾸러미를 꽉 쥐었다. 남은 양초는 셋. 생각 하나가 떠올랐다. 빛은 빛 속에 숨기면 된다.');
        await c.narr('그날 해는 졌다. 그리고 뜨지 않았다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '노을의 엄마 세라가 부른다', targets: ['sera'], done: (st) => st.k_sera },
      { text: '주문받은 양초 셋을 문 앞에 두자', targets: DOORS, done: (st) => count(st, DOORS) >= 3, prog: (st) => count(st, DOORS) + ' / 3' },
      { text: '세라에게 돌아가자', targets: ['sera'], done: (st) => st.k_done },
      { text: '해가 진다 — 거리 서쪽 끝으로', targets: ['sun'] }],
    tdone: flags(DOORS),
  }, {
    room: 'mf_noeul_street', start: [24, 7], dir: 'left', music: 'black', era: '백 년 전 · 열여섯 해 뒤', lantern: true,
    pov: { name: '늙은 등불지기 로웬', look: folk('nightm', { tc: '#3a3450', trim: '#ffd86a', hc: '#9a9aa8', age: 'old' }) },
    intro: async (c, st) => {
      await c.narr('열여섯 해. 해는 한 번도 뜨지 않았다. 로웬은 매일 밤 등불을 켰다. 밤밖에 없으니 매일이 밤이었다.');
      if (pick(st) === 1) await c.narr('그날 로웬은 아이를 안고 거리를 떠났다가, 밤이 땅 전체에 내려앉은 걸 보고 다시 돌아왔다. 숨을 곳은 결국 등불 곁뿐이었다.');
      await c.narr('노을은 열여섯이 되었다. 오늘 밤, 노을의 빛이 이상하게 희미하다. 거리의 등불도 셋이 꺼져 있다.');
    },
    npcs: [
      { key: 'noeul', name: '노을', x: 12, y: 6, dir: 'down', look: NOEUL_T, talk: async (c, n, st) => {
        if (st.l_go) { await c.say(n, '…서쪽 끝에서 기다릴게.', { face: 'smile' }); return; }
        if (count(st, UNLIT) < 3) { await cyc(c, n, st, 'l_nl', ['아저씨, 등불부터 켜. 오늘 밤은 세 개가 꺼졌어. 내가 켜 주고 싶은데… 내가 켜면 들킨다며.', '…괜찮아. 조금 배고픈 것뿐이야. 늘 그랬어.'], { face: 'sad' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '아저씨. 나 이제 알았어. 왜 이렇게 배가 고픈지.', { face: 'closed' });
        await c.say(n, '숨기만 했잖아. 빛이 나가기만 하고, 아무도 나한테 빛을 안 줬어. 다들 숨겨 주기만 했어. 고마운데… 숨겨 주는 건 먹여 주는 게 아니야.', { face: 'sad' });
        await c.say(n, '하늘의 검은 거, 나랑 똑같이 배고픈 거래. 거기 가면 배고픈 애들끼리 덜 외로울지도 몰라.', { face: 'normal' });
        await c.say(n, '…약속 지켜 줘서 고마워. ' + ['등불, 하나 더 켜 줬던 거. 그거 따뜻했어.', '나 안고 거리 끝까지 걸어 줬던 거. 거기도 밤이었지만.', '매일 밤 켜 줬잖아. 한 번도 안 빠지고.'][pick(st)], { face: 'smile' });
        st.l_go = true;
        await c.move(n, px(3), py(6));
        await c.cinema(false); c.lock(false);
      } },
      { key: 'pel', name: '로웬의 아들 펠', x: 6, y: 8, dir: 'right', look: folk('kid', { tc: '#3a3450', hc: '#2a2438' }), talk: async (c, n, st) => { st.l_pel = true; await c.say(n, '아버지, 등불 장대 내가 들까? …노을 누나가 오늘 이상해.', { face: 'normal' }); await c.say(n, '아까 나한테 등불 켜는 법을 가르쳐 줬어. 「내가 없어도」래.', { face: 'sad' }); } },
      { key: 'mia', name: '노을의 친구 미아', x: 18, y: 9, dir: 'left', look: folk('kidg', { tc: '#6a5a9a', hair: 'long' }), talk: async (c, n, st) => { st.l_mia = true; await c.say(n, '로웬 아저씨, 노을이 오늘 밥을 안 먹었어요. 어제도요. 먹어도 소용없대요. 빛이 배고픈 거래요.', { face: 'sad' }); await c.say(n, '…저 노을한테 제 빛 나눠 줄 수 있을까요? 저는 빛 같은 거 없는데.', { face: 'cry' }); } },
    ],
    spots: [
      ...UNLIT.map((mk, i) => ({ mk, x: [17, 11, 23][i], y: [5, 9, 6][i], verb: '꺼진 등불을 켠다', when: (st) => !st[mk], text: async (c, st) => {
        st[mk] = true; c.sfx('lamp'); const n = count(st, UNLIT), x = [17, 11, 23][i], y = [5, 9, 6][i];
        if (W().map) (W().map.lights = W().map.lights || []).push({ x: px(x), y: py(y) - 14, r: 48, warm: 'rgba(255,200,110,0.35)' });
        G.fx.glow(px(x), py(y) - 14, '#ffd86a', 12);
        await c.narr(['등불 하나. 장대 끝 불씨를 갖다 대자 노란 원이 생겼다.', '등불 둘. 한 번도 빼먹지 않은 동작. 손이 먼저 안다.', '등불 셋. 거리가 다 밝아졌다. 그런데 노을의 빛만 — 등불 빛에 섞이지 않고, 점점 흐려진다.'][n - 1] + ' (' + n + ' / 3)');
      } })),
      { mk: 'edge', x: 4, y: 7, verb: '거리 서쪽 끝으로 간다', when: (st) => !!st.l_go, text: async (c, st) => {
        c.lock(true); await c.cinema(true);
        const n = find('noeul');
        await c.narr('거리 서쪽 끝. 등불이 닿지 않는 곳. 노을이 서 있다. 빛이 거의 꺼져 간다.');
        await c.say(n || null, '여기서부턴 혼자 갈게. 아저씨는 등불 곁에 있어.', { name: '노을', face: 'smile' });
        const k = await c.choice('장대 끝 불씨가 흔들린다.', ['따라간다 — 등불 밖으로', '들고 있던 등불을 노을의 손에 쥐여 보낸다', '그 자리에서 등불을 켠다 — 약속대로']);
        st.l_end = k;
        if (k === 0) await c.narr('따라갔다. 등불 밖은 너무 어두웠다. 몇 걸음 만에 노을이 보이지 않았다. 노을의 빛이 위로, 위로 올라가는 것만 보였다.');
        else if (k === 1) { await c.say(n || null, '…등불이다. 내 등불.', { name: '노을', face: 'smile' }); await c.narr('노을이 등불을 들고 하늘로 올라갔다. 작은 불빛 하나가 검은 점까지 닿았다. 꺼지지 않았다. 한동안은.'); }
        else { c.sfx('lamp'); await c.narr('그 자리에서 등불을 켰다. 노을이 돌아보았다. 웃었다. 그리고 올라갔다. 로웬은 등불 아래 서서, 빛이 다 사라질 때까지 올려다보았다.'); }
        c.sfx('white'); c.flash('#ffd8a0', 0.5); if (n) n.dead = true;
        await c.narr('로웬은 그날 밤 등불을 하나도 끄지 않았다. 다음 날 밤에도. 해가 뜨지 않는 동안 내내.');
        await c.narr('로웬이 늙자 펠이 장대를 들었다. 펠의 아들이, 그 아들의 아들이. 숨기는 등불이 아니라, 누가 돌아올 길을 비추는 등불로.\n지금 그 거리의 등불지기는 칸델이라는 남자다. 아직 퇴근을 못 했다.');
        await c.narr('하늘 위에서 노을은 여전히 배가 고팠다. 그래도 가끔, 아주 가끔 — 밤의 나라 사람들은 흑점 가장자리가 노을빛으로 물드는 것을 보았다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    goals: [
      { text: '꺼진 등불 셋을 켜자', targets: UNLIT, done: (st) => count(st, UNLIT) >= 3, prog: (st) => count(st, UNLIT) + ' / 3' },
      { text: '거리 사람들에게 노을 이야기를 듣자', targets: ['pel', 'mia'], done: (st) => !!(st.l_pel || st.l_mia) },
      { text: '노을에게', targets: ['noeul'], done: (st) => st.l_go },
      { text: '거리 서쪽 끝 — 노을이 기다린다', targets: ['edge'] }],
    tdone: Object.assign(flags(UNLIT), { pel: (st) => st.l_pel, mia: (st) => st.l_mia }),
    journal2: (st) => ['긴 밤 끝에, 로웬은 노을을 따라 등불 밖으로 나갔다.', '긴 밤 끝에, 로웬은 자기 등불을 노을에게 쥐여 보냈다.', '긴 밤 끝에, 로웬은 노을을 보내며 그 자리에 등불을 켰다.'][st.l_end || 0] + ' 등불지기는 대를 이었다.',
  }, async (c) => {
    await c.narr('사흘 뒤. 해는 그날 이후 뜨지 않았다. 세라는 아이를 찾으러 온 사람들을 다른 길로 이끌고 갔다. 돌아오지 않았다.\n손에 장대. 끝에 불씨. 로웬은 양초 장수를 그만두었다. 오늘부터 등불을 켠다.');
    await c.narr('[s]아이 둘레에 등불 셋을 켜면, 아이 빛이 등불 빛에 섞여 보이지 않는다.[/]');
  });

  /* ═════════ 7. 허용 손실 — 오스본 ═════════ */
  at('mf_loss_site', { region: 'green', name: '983년 겨울 · 그린 마을 언덕, 첫 탑 터', music: 'forest', weather: 'snow', start: [13, 13] });
  room('m_osborn', { region: 'green', name: '999년 · 그린 마을 외딴집', w: 13, h: 10, floor: T.WOOD, music: 'sad', dark: 0.3,
    furn: [['fireplace', 2, 2], ['desk', 9, 3], ['crate', 11, 3], ['bed2', 11, 7, { v: '#6a8a5a' }], ['table', 5, 5], ['window', 6, 1, { wall: true }], ['lamp', 7, 2]] });
  const REGINA = folk('nun', { hat: null, hc: '#4a3a2a', tc: '#5a5a7a' });
  const KAIRON = look('kairon', folk('knight'));
  const NAMES = ['hans', 'elsa', 'finn'];
  acts('loss', {
    room: 'mf_loss_site', start: [13, 13], dir: 'up', music: 'forest', era: '983년 겨울 · 첫 출근 이레째',
    intro: async (c) => {
      await c.narr('스물두 살. 기사단 회계실 서기. 첫 출근 이레째. 오늘은 책상이 아니라 들판에 나왔다.');
      await c.narr('그린 마을 언덕. 기사단이 탑을 세울 터를 닦고 있다. 탑이 서면 대륙의 빛을 「조금만」 걷는다고 했다. 너는 마을 사람들의 이름과 빛을 받아 적으러 왔다.');
    },
    npcs: [
      { key: 'regina', name: '서기 레지나', x: 8, y: 9, dir: 'up', look: REGINA, talk: async (c, n, st) => {
        if (!st.m_reg) { st.m_reg = true; await c.say(n, '오스본, 왔어? 명부 받아. 마을 사람 이름 셋만 받아 적으면 오늘 일 끝이야. 이름하고, 나이하고, 「빛의 세기」.', { face: 'normal' }); await c.say(n, '빛의 세기는… 그냥 얼마나 반짝이는지 보고 대충 적으래. 다섯 칸 중에 하나.', { face: 'closed' }); return; }
        if (count(st, ['m_hans', 'm_elsa', 'm_finn']) < 3) { await cyc(c, n, st, 'm_rg', ['명부 다 채웠어? 셋이면 돼.', '「조금만」 걷는대. 조금이 얼마냐고 물었더니, 아무도 대답을 안 해.']); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '다 적었네. …핀이 다섯이야?', { face: 'shock' });
        await c.say(n, '다섯 칸이면 「우선 징수 대상」이래. 탑이 먼저 걷는 사람.', { face: 'sad' });
        const kn = addNpc({ key: 'kairon0', name: '그림자 속의 사내', look: KAIRON, dir: 'up' }, { x: px(13), y: py(14) });
        await c.move(kn, px(10), py(10));
        c.face(kn, W().player);
        await c.say(kn, '명부를 보자.', { face: 'normal' });
        await c.narr('사내가 명부를 넘겼다. 「다섯」에서 손가락이 멈췄다. 아주 잠깐.');
        await c.say(kn, '탑은 빛을 조금만 걷는다. 마을 전체의 백분의 일.', { face: 'closed' });
        const k = await c.choice('사내가 명부를 돌려준다.', ['「얼마나 조금입니까?」 묻는다', '받아 적기만 한다', '명부를 품에 넣는다 — 내 손으로 지킨다']);
        st.m_q = k;
        if (k === 0) { await says(c, '오스본')('얼마나 조금입니까? 백분의 일이면… 핀 같은 아이는요?'); await c.say(kn, '…조금이다. 대륙 전체로 보면.', { face: 'closed' }); await c.say(kn, '한 사람으로 보면, 조금이 아닐 수도 있다. 그건 적지 마라.', { face: 'sad' }); }
        else if (k === 1) { await c.narr('받아 적었다. 「백분의 일」. 손이 떨리지 않았다. 그게 나중에 가장 오래 남았다.'); await c.say(kn, '좋다. 떨리지 않는 손.', { face: 'normal' }); }
        else { await c.narr('명부를 품에 넣었다. 사내의 눈이 그 손을 보았다. 아무 말도 하지 않았다.'); await c.say(kn, '…그 명부는 네가 가지고 있어라. 원본은 회계실에 있으니.', { face: 'closed' }); }
        await c.narr('그해 봄, 첫 탑이 섰다. 그린 마을 언덕 위에. 백분의 일은 처음에만 백분의 일이었다.');
        await c.cinema(false);
        await next(c);
      } },
      { key: 'hans', name: '농부 한스', x: 5, y: 6, dir: 'right', look: folk('farmer', { tc: '#6a8a4a' }), talk: async (c, n, st) => {
        if (!st.m_reg) { await c.say(n, '기사단 서기님? 저쪽 수녀복 입은 분이 찾던데요.', { face: 'normal' }); return; }
        if (st.m_hans) { await c.say(n, '탑이 서면 겨울에도 밭에 빛이 든다면서요? 기사단 양반들 말이. …진짜죠?', { face: 'smile' }); return; }
        st.m_hans = true; c.sfx('page');
        await c.say(n, '한스요. 마흔하나. 빛? 하하, 저 같은 게 무슨 빛이 있다고요. 밭 갈 때 땀이나 반짝이지.', { face: 'smile' });
        await c.narr('명부에 적었다: 「한스, 41세, 빛의 세기 — 둘」. 땀이 반짝였으므로. (' + count(st, ['m_hans', 'm_elsa', 'm_finn']) + ' / 3)');
      } },
      { key: 'elsa', name: '빵집 딸 엘사', x: 19, y: 7, dir: 'left', look: folk('farmerw', { hat: null, tc: '#e8a87a', hair: 'pony' }), talk: async (c, n, st) => {
        if (!st.m_reg) { await c.say(n, '서기님이세요? 저 수녀복 언니가 명부 들고 기다리던데요!', { face: 'smile' }); return; }
        if (st.m_elsa) { await c.say(n, '탑 다 지으면 기사님들한테 빵 팔 거예요. 탑 꼭대기까지 배달!', { face: 'smile' }); return; }
        st.m_elsa = true; c.sfx('page');
        await c.say(n, '엘사! 열일곱! 빛은… 우리 빵이 제일 반짝여요. 그것도 적어 줘요?', { face: 'smile' });
        await c.narr('「엘사, 17세, 빛의 세기 — 셋」. 웃을 때 반짝였으므로. (' + count(st, ['m_hans', 'm_elsa', 'm_finn']) + ' / 3)');
      } },
      { key: 'finn', name: '양치기 소년 핀', x: 16, y: 10, dir: 'up', look: folk('kid', { tc: '#c8c8a0', hc: '#8a6a3a' }), talk: async (c, n, st) => {
        if (!st.m_reg) { await c.say(n, '서기님, 명부 안 가져왔어요? 저기 언니가 갖고 있던데.', { face: 'normal' }); return; }
        if (st.m_finn) { await c.say(n, '서기님, 탑이 빛을 걷으면 제 손도 덜 빛나요? 그럼 양들이 길을 잃을 텐데.', { face: 'sad' }); return; }
        st.m_finn = true; c.sfx('page');
        await c.say(n, '핀이요. 아홉 살. 빛은… 저 밤에 양 세다 보면 손이 빛나요. 양들이 그걸 보고 따라와요. 이것도 적어요?', { face: 'smile' });
        await c.narr('「핀, 9세, 빛의 세기 — 다섯」. 펜이 잠깐 멈췄다. 다섯은 가장 높은 칸이다. (' + count(st, ['m_hans', 'm_elsa', 'm_finn']) + ' / 3)');
      } },
      { key: 'graus', name: '견습 기사 그라우스', x: 22, y: 8, dir: 'left', look: folk('knight', { hc: '#3a3448', tc: '#5a5a7a' }), talk: async (c, n, st) => { await cyc(c, n, st, 'm_gr', ['터에 박을 말뚝을 세는 중이야. 숫자로 세면 아무것도 안 빠져.', '서기 동기구나. 난 그라우스. 숫자가 좋아. 숫자는 누굴 미워하지 않아. 공평하잖아.'], { face: 'smile' }); } },
    ],
    spots: [
      { mk: 'stone', x: 13, y: 5, verb: '주춧돌을 본다', text: async (c) => { await c.narr('주춧돌. 기사단 문장 아래 새긴 글: 「빛을 고르게 나누기 위하여」.\n돌이 차갑다. 겨울이라서일 것이다.'); } },
      { mk: 'stake', x: 7, y: 4, verb: '측량 말뚝을 본다', text: async (c) => { await c.narr('측량 말뚝. 붉은 끈에 글씨: 「걷을 빛 — 마을 전체의 백분의 일」.\n백분의 일. 조금이다. 정말로.'); } },
    ],
    goals: [
      { text: '서기 레지나에게서 명부를 받자', targets: ['regina'], done: (st) => st.m_reg },
      { text: '마을 사람 셋의 이름과 빛을 받아 적자', targets: NAMES, done: (st) => count(st, ['m_hans', 'm_elsa', 'm_finn']) >= 3, prog: (st) => count(st, ['m_hans', 'm_elsa', 'm_finn']) + ' / 3' },
      { text: '명부를 레지나에게 가져가자', targets: ['regina'] }],
    tdone: { hans: (st) => st.m_hans, elsa: (st) => st.m_elsa, finn: (st) => st.m_finn },
  }, {
    room: 'm_osborn', start: [6, 7], dir: 'up', music: 'sad', era: '999년 · 열여섯 해 뒤',
    pov: { name: '오스본 영감', look: folk('oldm', { tc: '#5a5a7a' }) },
    intro: async (c) => {
      await c.narr('열여섯 해 뒤. 그린 마을 끝 외딴집. 거울 속 얼굴은 마흔도 안 됐는데 머리가 하얗다. 마을 아이들은 너를 「오스본 영감」이라고 부른다.');
      await c.narr('궤짝 안에는 회계실에서 몰래 베껴 온 장부 세 권. 어제 소문이 들렸다. 마지막 줄이 찼다고.');
    },
    npcs: [
      { key: 'teo', name: '이웃 꼬마 테오', x: 3, y: 7, dir: 'right', look: folk('kid', { tc: '#7ac85a' }), talk: async (c, n, st) => {
        st.n_teo = true;
        await c.say(n, '오스본 영감님! 또 장부 봐요? 무슨 장부예요?', { face: 'smile' });
        await c.say(n, '…사람 이름이요? 그럼 우리 할머니 이름도 있어요? 할머니는 탑 생기고 나서 투명해져서 돌아가셨는데.', { face: 'normal' });
        await c.narr(count(st, ['n_p1', 'n_p2', 'n_p3']) >= 3 ? '…있었다. 셋째 권, 천이백 몇째 줄. 「그린 마을 몫」.' : '…아마 있을 것이다. 아직 다 읽지 못했다.');
      } },
      { key: 'post', name: '우편 배달부', x: 6, y: 8, dir: 'up', look: folk('farmerw', { hat: 'straw', tc: '#c86a4a' }), talk: async (c, n, st) => {
        if (!(st.n_chest && count(st, ['n_p1', 'n_p2', 'n_p3']) >= 3 && st.n_teo)) { await cyc(c, n, st, 'n_ps', ['영감님, 화이트 쪽 편지 있으면 주세요. 천천히 하셔도 돼요. 저 여기서 기다릴게요.', '…그 궤짝, 한 번도 안 여시더니. 오늘은 여시네요.'], { face: 'normal' }); return; }
        c.lock(true); await c.cinema(true);
        await c.say(n, '영감님, 오늘 마지막 배달이에요. 화이트 쪽으로 가는 편지 있으면 주세요.', { face: 'normal' });
        const k = await c.choice('장부 세 권이 탁자 위에 있다.', ['편지와 함께 장부 한 장을 레지나에게 보낸다', '난로에 넣으려다 — 멈춘다', '이름을 하나씩 소리 내어 읽는다']);
        st.n_end = k;
        if (k === 0) { c.sfx('page'); await c.narr('편지를 썼다. 「화이트, 레지나 수녀에게. 우리가 적은 숫자의 끝을, 당신도 알아야 해서.」 장부 한 장을 접어 넣었다. 그린 마을 몫.'); await c.say(n, '화이트 대성당 옆이요? 꼭 전할게요.', { face: 'smile' }); }
        else if (k === 1) { c.sfx('fire'); await c.narr('장부를 난로 앞에 들었다. 불이 장부 귀퉁이를 핥았다. — 꺼 버렸다. 손바닥으로. 데었다.\n이건 증거였다. 태우면 이천삼백열두 사람이 한 번 더 사라진다.'); }
        else { await c.narr('읽기 시작했다. 「핀. 엘사. 한스…」 배달부가 문간에 서서 끝까지 들었다. 해가 지고, 다시 떴다. 마지막 이름에서 목이 쉬었다.'); await c.say(n, '…영감님. 저, 내일 다시 올게요. 편지는 그때.', { face: 'cry' }); }
        await c.narr(['장부 첫 장의 칸 이름은 끝까지 「허용 손실」이었다. 정확한 이름이었다. 읽는 사람이 놀라지 않는.', '「빌린 빛」이라는 칸 이름은 위에서 바꿨다. 오스본은 그 옛 이름을 장부 귀퉁이에 몰래 다시 적어 두었다. 언젠가 갚을 수 있을 것처럼.', '뒷장의 이름들은 아무도 읽지 않았다. 오늘까지는.'][st.col || 0]);
        await c.narr('오스본은 그 뒤로도 그린 마을 외딴집에 숨어 살았다. 누가 물으면 「탑 아래를 지나면 발끝이 시리지? 그게 네 빛이 빠져나가는 소리다」라고만 했다.');
        await c.cinema(false);
        await next(c);
      } },
    ],
    spots: [
      { mk: 'chest', x: 11, y: 3, verb: '궤짝을 연다', when: (st) => !st.n_chest, text: async (c, st) => { st.n_chest = true; c.sfx('open'); await c.narr('궤짝을 열었다. 장부 세 권. 한 번도 꺼내지 않았다. 표지에 먼지 대신 손자국이 있다. 매일 밤 궤짝 뚜껑을 쓰다듬은 손자국.\n한 권은 탁자에, 한 권은 책상에, 한 권은 침대 머리맡에 놓았다. 한꺼번에 읽을 자신이 없어서.'); } },
      { mk: 'p1', x: 5, y: 5, dy: -2, verb: '첫째 권을 읽는다', when: (st) => !!st.n_chest && !st.n_p1, text: async (c, st) => {
        st.n_p1 = true; c.sfx('page');
        await c.narr('첫째 권. 983년. 첫 줄 — ' + (st.col === 2 ? '뒷장에 젊은 네 글씨로 「여기 적히는 사람들의 이름」. 그 아래 이름이 빼곡하다. 맨 위: 「핀, 양치기, 그린 마을. 984년 겨울.」' : '「허용 손실 — 그린 마을 1」. 이름 칸은 없다.' + (st.m_q === 2 ? '\n품에 넣어 두었던 낡은 명부를 꺼내 옆에 펼쳤다. 「핀, 9세, 빛의 세기 — 다섯」. 숫자 옆에 이름을 적었다. 너무 늦게.' : '\n「1」이 누구였는지 기억해 내려고 오래 앉아 있었다. 양치기 아이. 이름이… 핀. 그래, 핀.')));
      } },
      { mk: 'p2', x: 9, y: 3, dy: 2, verb: '둘째 권을 읽는다', when: (st) => !!st.n_chest && !st.n_p2, text: async (c, st) => { st.n_p2 = true; c.sfx('page'); await c.narr('둘째 권. 990년. 칸이 빽빽하다. 블루 해안, 레드 화산, 옐로 사막.\n「허용 손실」 옆에 누군가 연필로 작게 적어 놓았다: 「빵집 엘사 — 탑 꼭대기까지 배달 갔다가」. 네 글씨가 아니다. 레지나의 글씨다.'); } },
      { mk: 'p3', x: 11, y: 7, verb: '셋째 권을 읽는다', when: (st) => !!st.n_chest && !st.n_p3, text: async (c, st) => { st.n_p3 = true; c.sfx('page'); await c.narr('셋째 권. 999년. 마지막 줄 — 「이천삼백열둘」. 칸이 다 찼다.\n장부 맨 뒤에 반듯한 글씨: 「숫자로 세면 아무도 빠지지 않는다 — 그라우스」. 그 아래, 다른 펜으로 그은 줄 하나. 「— 빠졌다. 다.」'); } },
      { mk: 'fire', x: 2, y: 2, dy: 6, verb: '난로를 본다', text: async (c) => { await c.narr('난로. 장작이 타닥거린다. 이 앞에 장부를 들고 선 밤이 여러 번이었다. 한 번도 넣지 못했다.'); } },
    ],
    goals: [
      { text: '궤짝에서 장부를 꺼내자', targets: ['chest'], done: (st) => st.n_chest },
      { text: '장부 세 권을 읽자 — 탁자 · 책상 · 머리맡', targets: ['p1', 'p2', 'p3'], done: (st) => count(st, ['n_p1', 'n_p2', 'n_p3']) >= 3, prog: (st) => count(st, ['n_p1', 'n_p2', 'n_p3']) + ' / 3' },
      { text: '이웃 꼬마가 창가에서 부른다', targets: ['teo'], done: (st) => st.n_teo },
      { text: '배달부가 문 앞에서 기다린다', targets: ['post'] }],
    tdone: { p1: (st) => st.n_p1, p2: (st) => st.n_p2, p3: (st) => st.n_p3 },
    journal2: (st) => ['999년, 오스본은 장부 한 장을 레지나에게 보냈다.', '999년, 오스본은 장부를 태우려다 손으로 불을 껐다.', '999년, 오스본은 이천삼백열두 사람의 이름을 소리 내어 읽었다.'][st.n_end || 0],
  }, async (c) => {
    await c.narr('983년 봄. 첫 탑이 서고 석 달. 천년성 지하 회계실.\n오늘 새 장부의 첫 장을 짠다. 탑이 대륙의 빛을 걷기 시작하면, 걷다가 생기는 「손실」을 적을 칸이 필요하다.');
  });
})();
