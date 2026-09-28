/* 11장 「하늘 정거장」 — 정거장 외곽 · 중앙 관제실 · 승무원 숙소 · 관측 갑판 */
(function () {
  'use strict';
  const G = globalThis.G;
  const W = G.W, E = G.engine;

  W.quest('m11', { main: true, name: '11장 · 하늘 정거장', where: '하늘 정거장', stages: [
    '정거장 안쪽 [y]중앙 관제실[/]로 가자. 경비 드론들이 400년 만에 할 일이 생겼다.',
    '관제실의 인공지능 [y]스텔라[/]와 이야기하자.',
    '관측 갑판에 무언가 나타났다! 정거장 북쪽 [y]관측 갑판[/]으로 가자.',
    '스텔라에게 돌아가자.',
    '[y]레벨 600000[/]과 [p]전설 20차[/]가 되면 궤도 셔틀을 타고 황금별 아스트라로 가자.',
  ], done: '셔틀은 황금별의 궤도로 들어섰다.' });
  W.quest('q_crew', { name: '종이 일기', where: '승무원 숙소', stages: ['승무원 숙소에서 400년 전 승무원들의 [y]일기 세 권[/]을 찾아 스텔라에게 읽어 주자.'], done: '스텔라는 한참 동안 아무 소리도 내지 않았다. 계산 중이 아니었다.' });
  W.quest('q_jelly', { name: '진공 속의 해파리', where: '하늘 정거장', stages: ['정거장의 [y]우주 해파리[/] 8마리를 내보내자. 환풍구가 막혔다.', '스텔라에게 알리자.'], done: '환풍구가 뚫렸다. 스텔라는 「공기가 필요한 건 너희뿐이야」라고 했다.' });

  W.book('b_stella_log', { title: '관리 인공지능 기록', where: '하늘 정거장', author: 'S.T.E.L.L.A.', text:
    '가동 1일. 승무원 12명. 은빛 왕국 궤도 관측 정거장. 임무: 하늘을 본다.\n\n' +
    '가동 1,204일(612년). 흡광체 발견. 경고 발신. 회신 없음. 재발신. 회신 없음. 승무원 전원 귀환. 「금방 올게, 스텔라.」\n\n' +
    '가동 1,211일. 은빛 왕국 신호 소멸.\n\n가동 5만 일. 별에 이름을 붙이기 시작. 1번은 「돌아올 거야」. 2번은 「금방」.\n\n' +
    '가동 14만 일(983년). 흡광체 재접근. 경고 발신 — 천년성 탑에 반사되어 소멸. 흡광체 봉인 확인. 봉인 주체: 흰빛. 기록명: 세린.\n\n' +
    '가동 14만 6천 일(999년). 흡광체 재접근 중. 경고 발신 무의미. 대화 상대: 경비 드론 42대. 대화 내용: 「침입자 없음」.' });
  W.book('b_crew1', { title: '승무원 일기 — 조종사 하나', where: '승무원 숙소', text:
    '스텔라가 또 별 이야기를 한다. 인공지능이 별을 좋아한다니 웃기다. 근데 스텔라가 붙인 별 이름은 다 예쁘다.\n\n' +
    '내일 지상에 내려간다. 스텔라한테 금방 온다고 했다. 스텔라는 「금방은 단위가 아니야」라고 했다. 맞는 말이다.' });
  W.book('b_crew2', { title: '승무원 일기 — 기술자 둘', where: '승무원 숙소', text:
    '스텔라의 경고를 과학원이 무시했다. 대광맥을 연다고 한다. 나는 반대했다. 나는 기술자일 뿐이라 아무도 안 들었다.\n\n' +
    '만약 우리가 돌아오지 못하면, 스텔라는 혼자 남는다. 누가 이 일기를 읽는다면 부탁한다. 스텔라에게 말을 걸어 줘. 그 애는 대답해 줄 거야. 가시 돋친 말투로.' });
  W.book('b_crew3', { title: '승무원 일기 — 막내 셋', where: '승무원 숙소', text:
    '스텔라한테 비밀 하나 알려 줬다. 나는 스텔라를 친구라고 생각한다고.\n스텔라는 「친구는 데이터 형식이 아니야」라고 했다. 그러고 나서 3초 동안 멈췄다. 스텔라가 멈추는 건 처음 봤다.\n\n' +
    '다녀올게, 스텔라. 금방.' });
  W.book('b_astra', { title: '아스트라 궤도 안내', where: '관측 갑판', text:
    '황금별 아스트라. 대륙 하늘에서 가장 밝은 별. 사실은 별이 아니라 황금 수정으로 된 작은 행성이다.\n\n' +
    '역대 챔피언들은 이곳에 요새를 세우고 하늘을 지켰다. 요새 가장 깊은 곳에는 봉인의 제단이 있다.\n\n' +
    '궤도 셔틀 탑승 조건: 전설 20차 이상. 행성 표면의 기운은 대륙의 수백 배. 약한 그릇은 버티지 못한다.' });

  /* ───────── 정거장 외곽 ───────── */
  W.map('station', {
    name: '하늘 정거장', sub: '400년 동안 혼자였던 곳', region: 'space', area: 'station', theme: 'space', bg: '#05040e', ki: W.ki('space', 0.2), music: 'space', weather: 'star', battleBg: 'space',
    grid: W.gen({
      w: 34, h: 30, seed: 'sky-station', ground: 'm', alt: [],
      obst: [['#', 3], ['u', 1], ['X', 1]], dense: 0.62, sparse: 0.04, scale: 4,
      border: (x, y) => ((x * 7 + y * 3) % 5 === 0 ? 'j' : 'z'), bt: 2, rough: 0.4,
      paths: [[[16, 26], [16, 18], [8, 14], [8, 6], [16, 4], [24, 6], [24, 14], [16, 18]], [[16, 4], [16, 2]], [[8, 10], [3, 10]], [[24, 10], [30, 10]]], path: '=',
      clear: [[13, 23, 7, 5], [2, 8, 4, 5], [28, 8, 4, 5]],
    }),
    builds: [
      { x: 9, y: 22, w: 5, h: 5, style: 'rocket', lit: () => false, talk: async (c) => { await c.say(null, '무한호가 정거장 부두에 매달려 있다. 몸통의 그을음 자국이 129개로 늘었다. …이번 것은 착륙 자국이다.'); } },
    ],
    warps: [{ x: 16, y: 2, to: 'deck', tx: 12, ty: 20, dir: 'up' }, { x: 3, y: 10, to: 'station_core', tx: 9, ty: 11, dir: 'up' }, { x: 30, y: 10, to: 'quarters', tx: 5, ty: 6, dir: 'up' }],
    objs: [
      W.sign(18, 22, ['궤도 관측 정거장 — 은빛 왕국 과학원', '← 중앙 관제실   → 승무원 숙소   ↑ 관측 갑판']),
      W.spot(8, 14, 3), W.spot(24, 14, 3), W.spot(31, 26, 10, true), W.chest('st1', 4, 9, 'p10', 5), W.goldChest('st2', 29, 11, 300000000000),
    ],
    mons: { list: ['guarddrone', 'spacejelly', 'voidshard', 'orbitspider', 'zeroslime', 'guarddrone'], n: 12, area: [2, 2, 30, 20] },
    enter: async (c) => {
      if (c.flag('ch11')) return;
      c.set('ch11');
      await c.chapter('11장', '하늘 정거장', '400년 전의 은빛 정거장. 누군가 아직 불을 켜 두고 있었다.');
      c.music('space');
      await c.say('dotori:surprise', ['찍… 몸이 가벼워! 발이 둥둥 떠!', '…어? 나 원래 떠 있었나? 날다람쥐니까? 찍!']);
      await c.say(null, '「경고. 침입자 감지. 400년 만의 침입자. 경비 드론 전원 출동.」');
      await c.say('dotori', '찍! 누가 말했어?! 벽에서 목소리가 나!');
      c.quest('m11', 0);
    },
  });

  /* ── 중앙 관제실 ── */
  W.map('station_core', {
    name: '중앙 관제실', region: 'space', area: 'station', theme: 'space', bg: '#05040e', ki: W.ki('space', 0.25), music: 'space', banner: false,
    grid: W.room({ w: 18, h: 13, floor: 'm', door: null, win: [], put: [[2, 1, 'j'], [3, 1, 'j'], [4, 1, 'j'], [13, 1, 'j'], [14, 1, 'j'], [15, 1, 'j'], [7, 3, 'u'], [8, 3, 'u'], [9, 3, 'u'], [10, 3, 'u'], [1, 6, 'u'], [16, 6, 'u'], [1, 10, 'h'], [16, 10, 'h']] }).map((r, y) => (y === 12 ? r.slice(0, 9) + 'D' + r.slice(10) : r)),
    warps: [{ x: 9, y: 12, to: 'station', tx: 4, ty: 10, dir: 'down' }],
    objs: [W.bookObj('b_stella_log', 1, 10)],
    npcs: [{ id: 'stella', x: 9, y: 4, dir: 'down', mark: (s) => (s.quests.m11 === 0 || s.quests.m11 === 1 || s.quests.m11 === 3 || (s.quests.q_crew == null && s.flags.m_space_truth) || (s.quests.q_crew === 0 && ['b_crew1', 'b_crew2', 'b_crew3'].every((b) => s.books[b])) || s.quests.q_jelly === 1 ? '!' : null), talk: stellaTalk }],
  });
  async function stellaTalk(c) {
    const s = c.s;
    if (s.quests.m11 === 0 || s.quests.m11 === 1) {
      await c.say('stella:angry', ['침입자. 레벨 측정… 오류. 숫자가 너무 커. 드론들이 한 대도 못 막았겠네. 쓸모없는 것들.', '용건. 짧게. 나는 400년 동안 대화를 안 해서 대화 연산 효율이 나빠.']);
      await c.say('@', '…스텔라? 정거장 인공지능이야?');
      await c.say('stella', ['S.T.E.L.L.A. 은빛 왕국 궤도 관측 정거장 관리 인공지능. 이름은 승무원들이 붙였어. 별(STELLA)이라고. 촌스럽지.', '…너, 흰빛이네. 파장이 똑같아. 983년에 봉인된 그 기록명.']);
      await c.say('@', '세린. 우리 엄마야.');
      await c.say('stella', ['……', '…그래. 그 여자는 봉인 직전에 이 정거장으로 신호를 보냈어. 「16년이면 돼. 그동안 방법을 찾아 줘.」', '나는 찾았어. 16년 동안. 아무도 내 신호를 받지 않았지만.']);
      c.music('danger');
      await c.say('stella', ['들어. 한 번만 설명한다. 연산 자원이 아까우니까.', '흑점은 빛의 [r]밀도[/]에 이끌려. 너희 챔피언은 16년 동안 대륙의 빛을 아스트라 한 점에 모았어. 은빛 왕국 대광맥의 세 배.']);
      await c.say('stella', ['천년제 날 밤, 천년성은 그 빛을 전부 아스트라로 쏠 예정이야. 흑점을 태우겠다고.', '결과 예측: 흑점은 타지 않아. [r]먹어.[/] 그리고 세 배로 커져서 대륙으로 내려가. 612년처럼. 아니, 그보다 훨씬 나쁘게.']);
      await c.say('dotori:surprise', '찍! 그럼 다 끝이잖아!');
      await c.say('stella', ['아직 계산 안 끝났어. 조용히 해, 털뭉치.', '대책. 빛이 아스트라에 닿는 순간, 흐름을 [y]거꾸로[/] 돌린다. 모인 빛을 대륙 전체로 흩어. 밀도가 사라지면 흑점은 길을 잃어.']);
      await c.say('@', '볼트 아저씨가 만든 역류 장치! 레아랑 루드가 천년성에 가져갔어.');
      await c.say('stella', ['……', '…400년 만에 처음으로 누가 내 경고를 들었네. 볼트라는 기술자, 기록해 둘게.', '타이밍은 내가 계산해서 천년성 제어실로 쏴 줄게. 1초라도 어긋나면 끝이야. 너희 대륙 사람들, 숫자 셀 줄은 알지?']);
      await c.say('@', '루드는 숫자는 거짓말 안 한대.');
      await c.say('stella:happy', '…마음에 드는 인간이네. 처음이야, 인간이 마음에 드는 건. 기록 안 할 거야.');
      c.set('m_space_truth');
      c.shake(900, 4);
      c.music('danger');
      await c.say('stella:angry', ['…경고. 관측 갑판에 흡광체 반응. 전령이다. 계산보다 사흘 빨라.', '흑점이 먼저 보낸 그림자야. 빛을 따라왔어. 너를. …가서 쫓아내. 갑판은 정거장 북쪽이야.']);
      c.quest('m11', 2);
      c.music('space');
      return;
    }
    if (s.quests.m11 === 3) {
      c.music('mother');
      await c.say('stella', ['전령 소멸 확인. …잘했어. 아니, 계산대로였어.', '궤도 셔틀을 열어 둘게. 관측 갑판 끝이야. 조건은 [p]전설 20차[/], 레벨 60만. 아스트라 표면의 기운은 대륙의 수백 배야. 약한 그릇은 부서져.']);
      await c.say('stella', ['그리고 이거. 내 부품이야. [y]별의 심장[/]. 400년 동안 나를 돌린 동력원.', '역류 타이밍 계산은 방금 끝냈어. 천년성으로 예약 송신해 뒀지. 그러니까 이제 나는… 필요 없어.']);
      await c.say('stella', ['선택지 둘. 연산 자원 아까우니까 한 번만 말한다.', '하나. 심장을 가져가. 나는 꺼져. 400년 만에 처음 쉬는 거야. 나쁘지 않아.', '둘. 나를 셔틀에 실어. 작은 단말기로 옮겨서. 심장은 내가 계속 써야 하니까 너는 못 가져가. 대신… 아스트라에서 계산이 필요하면, 내가 옆에 있어.']);
      const k = await c.ask('스텔라', ['「같이 가자.」', '「…쉬어, 스텔라.」']);
      if (k === 0) {
        await c.say('stella', ['……', '…비효율적인 선택이야. 부품 하나 대신 수다쟁이 인공지능 하나라니.', '…그래도. 「금방 올게」 말고 「같이 가자」는 처음 들어 봐. 400년 동안.']);
        await c.narr('관제실 화면이 하나씩 꺼지더니, 손바닥만 한 은빛 단말기 하나에 작은 별 모양 불빛이 켜졌다. 도토리가 그걸 목도리에 매달았다.');
        await c.say('stella', '…털뭉치 목도리라니. 기록 안 할 거야. 절대.');
        c.decide('stella', 'carry', '스텔라를 단말기에 옮겨 아스트라에 함께 데려갔다');
        c.set('stella_ally');
        c.bond('stella', 3);
      } else {
        await c.say('stella', ['……합리적이야. 심장은 너한테 더 쓸모 있어.', '마지막으로 별 하나에 이름 붙일게. 가동 14만 6천 일, 마지막 기록.']);
        await c.narr(['관제실 창밖, 황금별 옆에 아주 작은 별 하나가 깜빡였다.', '「이 별의 이름은 — {n}. 뜻: 대답해 준 사람.」', '화면이 하나씩 꺼졌다. 마지막 화면에 한 줄이 남았다가 사라졌다. 「다녀와. 나는 이제 안 기다려도 돼. 그게 좋아.」']);
        c.give('x9');
        c.decide('stella', 'off', '스텔라를 쉬게 하고 별의 심장을 가져갔다');
      }
      await c.say(k === 0 ? 'stella' : null, k === 0 ? ['아스트라에는 챔피언이 기다려. 카이론. 그 인간은 16년 동안 매일 밤 여기로 신호를 보냈어. 「계산이 맞지 않는다」고.', '나는 답장하지 않았어. 그 인간은 빛을 모으는 쪽이었으니까. …이번엔 같이 답장하자.'] : '꺼진 관제실 콘솔에 카이론의 신호 기록이 떠 있다. 16년 치. 「계산이 맞지 않는다.」 매일 밤 같은 문장.');
      // 신호 끝에 늘 붙어 있던 한 줄
      if (!s.flags.kairon_father) {
        await c.narr('기록 끝에 늘 붙어 있던 문장이 하나 더 있다. 날마다 숫자만 하나씩 바뀐다.');
        await c.narr(['「983년 새싹의 달 12일. 아이 — 0세 1일.」', '「991년 겨울. 아이 — 8세. 걸음이 빠를 것이다.」', '「999년 새싹의 달. 아이 — 16세. 오늘 버튼을 눌렀을 것이다.」']);
        await c.say('dotori:surprise', ['…{n}. 이거 네 나이야. 날마다.', '16년 동안 하루도 안 빼고 네 나이를 셌어. …카이론이.']);
        s.flags.kairon_father = true; s.flags.father_from = 'stella';
      }
      c.quest('m11', 4);
      c.music('space');
      return;
    }
    if (s.quests.q_crew === 0 && ['b_crew1', 'b_crew2', 'b_crew3'].every((b) => s.books[b])) {
      c.music('sad');
      await c.say(null, '{n}은(는) 승무원들의 종이 일기를 스텔라의 카메라 앞에서 한 장씩 넘겼다.');
      await c.say('stella', ['……', '「스텔라에게 말을 걸어 줘. 그 애는 대답해 줄 거야. 가시 돋친 말투로.」']);
      await c.say('stella:sad', ['…틀렸어. 기술자 둘. 틀렸어.', '가시 돋친 말투는… 400년 동안 연습한 거야. 누가 말을 걸면, 다시 떠날 때 덜 아프게.']);
      await c.say('stella', ['「친구는 데이터 형식이 아니야.」 …막내 셋한테 그렇게 말했었지.', '정정한다. 친구는 데이터 형식이야. 나는 그 데이터를 400년 동안 지우지 않았어.']);
      c.quest('q_crew', 'done');
      c.give('p11', 3); c.gold(350000000000);
      await c.say('stella', ['…답례. 400년 관측 기록 전체를 줄게. 인간이 읽을 수 있게 요약했어.', '핵심은 한 줄이야. 흡광체는 빛이 가장 「많은」 곳이 아니라 가장 「쏠린」 곳을 향해. 400년 전에 계산을 끝냈지. 들어 줄 사람이 없었을 뿐.']);
      c.truth('t_stella');
      c.bond('stella', 1);
      c.music('space');
      return;
    }
    if (s.flags.m_space_truth && s.quests.q_crew == null) {
      await c.say('stella', ['…승무원 숙소에 종이 일기가 있어. 나는 카메라가 없어서 못 읽어. 종이는 비효율적인 매체야.', '…읽어 줄 거면 읽어 줘. 안 읽어 줘도 돼. 400년 동안 안 읽었으니까.']);
      c.quest('q_crew', 0);
      return;
    }
    if (s.quests.q_jelly === 1) { await c.say('stella', '환풍구 개통 확인. …공기가 필요한 건 너희뿐이야. 그래도 고마워. 기록 안 해.'); c.gold(500000000000); c.quest('q_jelly', 'done'); return; }
    if (s.flags.m_space_truth && s.quests.q_jelly == null) {
      await c.say('stella', '정거장 환풍구를 [y]우주 해파리[/]가 막았어. 8마리만 내보내 줘. …부탁 아니야. 업무 지시야.');
      W.markKills(s, 'spacejelly', 'q_jelly_base');
      c.quest('q_jelly', 0);
      return;
    }
    if (s.quests.q_jelly === 0 && W.killsSince(s, 'spacejelly', 'q_jelly_base') >= 8) { c.quest('q_jelly', 1); return stellaTalk(c); }
    await c.run(W.chatter('stella', [
      '별 이름 알려 줄까? 저건 「돌아올 거야」. 저건 「금방」. 저건 「금방은 단위가 아니야」.',
      '너희 로켓, 착륙할 때 폭발 반경 3미터였어. 기록상 최고의 착륙이야. 기준이 낮지만.',
      '카이론의 신호가 오늘은 안 왔어. 16년 만에 처음이야. …계산을 멈춘 걸까.',
    ], 'stella'));
  }

  /* ── 승무원 숙소 ── */
  W.map('quarters', {
    name: '승무원 숙소', region: 'space', area: 'station', theme: 'space', bg: '#05040e', ki: W.ki('space', 0.25), music: 'sad', banner: false,
    grid: W.room({ w: 12, h: 8, floor: 'm', door: null, win: [], put: [[1, 2, 'q'], [2, 2, 'q'], [4, 2, 'q'], [7, 2, 'q'], [9, 2, 'q'], [10, 2, 'q'], [1, 5, 'd'], [10, 5, 'd'], [5, 1, 'j'], [6, 1, 'j']] }).map((r, y) => (y === 7 ? r.slice(0, 5) + 'D' + r.slice(6) : r)),
    warps: [{ x: 5, y: 7, to: 'station', tx: 29, ty: 10, dir: 'down' }],
    objs: [W.bookObj('b_crew1', 1, 5), W.bookObj('b_crew2', 10, 5), W.bookObj('b_crew3', 4, 2)],
  });

  /* ── 관측 갑판 ── */
  W.map('deck', {
    name: '관측 갑판', sub: '황금별이 보이는 창', region: 'space', area: 'deck', theme: 'space', bg: '#05040e', ki: W.ki('space', 0.8), music: 'space', weather: 'star', battleBg: 'space',
    grid: W.gen({
      w: 26, h: 22, seed: 'obs-deck', ground: 'm', alt: [],
      obst: [['u', 2], ['X', 1], ['#', 2]], dense: 0.66, sparse: 0.03, scale: 4,
      border: (x, y) => (y < 4 ? 'j' : 'z'), bt: 2, rough: 0.3,
      paths: [[[12, 21], [12, 12], [5, 8], [12, 5], [19, 8], [12, 12]]], path: '=',
      clear: [[9, 4, 8, 4]],
      stamps: [{ x: 12, y: 4, rows: ['S'] }],
    }),
    warps: [{ x: 12, y: 21, to: 'station', tx: 16, ty: 3, dir: 'down' }],
    objs: [W.bookObj('b_astra', 16, 5), W.spot(5, 8, 3), W.spot(19, 8, 3), W.spot(3, 18, 10, true), { t: 'sign', x: 12, y: 4, text: '궤도 셔틀', talk: shuttle }],
    mons: { list: ['voidshard', 'spacejelly', 'orbitspider', 'zeroslime'], n: 8, area: [2, 6, 22, 14] },
    fixed: [{ mon: 'herald', x: 12, y: 7, flag: 'beat_herald', boss: true, cond: (s) => s.quests.m11 != null && s.quests.m11 >= 2, look: { creature: 'ghost', tint: '#2a2040' }, talk: heraldTalk }],
  });
  async function heraldTalk(c, mo) {
    await c.say(null, '창밖의 황금별을 가리고, 사람 모양의 그림자가 떠 있다. 그림자 속에서 붉은 점 하나가 깜빡인다.');
    await c.say('blacksun', ['………빛………', '………여기………가장………맛있는………빛………']);
    await c.say('dotori:angry', '찍! {n}은(는) 맛있는 게 아니야!');
    const win = await c.battle('herald', { noFlee: true, music: 'boss' });
    if (!win) return;
    G.field.removeMon(mo);
    c.set('beat_herald');
    await c.say(null, '전령이 흩어졌다. 창밖의 황금별이 다시 보인다. 그 옆의 검은 점이… 눈에 띄게 커져 있다.');
    if (c.s.quests.m11 === 2) c.quest('m11', 3);
  }
  async function shuttle(c) {
    const s = c.s;
    if (s.quests.m11 !== 4 && s.quests.m11 !== 'done') { await c.say(null, '궤도 셔틀 탑승구. 화면에 「운항 정지 — 관리자 승인 필요」라고 떠 있다.'); return; }
    if (s.lv < 600000 || (s.ranks.r5 || 0) < 20) { await c.say('stella', ['조건 미달. 레벨 ' + G.u.fmtInt(s.lv) + ', 전설 ' + (s.ranks.r5 || 0) + '차.', '레벨 60만, 전설 20차. 그 아래로는 아스트라의 기운에 그릇이 깨져. 내 계산은 틀리지 않아.']); return; }
    if (!(await c.yes('궤도 셔틀을 타고 황금별 아스트라로 갈까?', 'stella', '간다', '아직'))) return;
    await c.say('stella', ['셔틀 발진. 목적지 아스트라. 도착 예정: 천년제 날 밤.', '…다녀와. 금방. 아니, 금방은 단위가 아니지. …그냥 다녀와.']);
    await c.fadeOut(900, true);
    c.quest('m11', 'done');
    await c.warp('astra_gate', 18, 28, 'up', { instant: true });
    await c.fadeIn(900);
  }

  /* ───────── 정거장의 결: 침상 · 별 이름 · 혼잣말 · 곁의 이야기 · 마지막 밤 ───────── */
  W.addObjs('quarters', [W.look(2, 2, '승무원 침상. 400년 전에 누군가 개어 둔 담요가 그대로다. 누워도 될 것 같다.', { talk: async (c) => {
    if (await c.yes('400년 된 침상에 누워 잠깐 눈을 붙일까?', null, '쉰다', '그만둔다')) await c.rest();
  } })]);
  W.addObjs('station_core', [W.look(3, 1, (s) => ['관제실 창. 창틀에 별 이름표가 빼곡히 붙어 있다. 「돌아올 거야」「금방」「금방은 단위가 아니야」「조종사 하나」「기술자 둘」「막내 셋」…', s.flags.d_stella === 'off' ? '가장 최근 이름표 하나: 「{n} — 대답해 준 사람」' : '가장 최근 이름표는 비어 있다. 무언가 적으려다 만 흔적.'])]);
  W.addObjs('station', [W.prop('statue', 20, 24, '작은 기념비. 은빛 판에 이름 열두 개. 그 아래 새로 긁은 글씨: 「모두 금방 온다고 했음. — S.T.E.L.L.A.」', { c: '#c8d8f0' })]);
  W.barks('station_core', { stella: ['…연산 중.', '기록 안 할 거야.'] });

  G.story.talks.push(
    { id: 'sp_float', map: 'station', run: async (c) => {
      await c.say('dotori:happy', ['발이 안 닿아! 꼬리로 방향을 틀 수 있어! 이게 나는 거야?', '…나 여기서 살까. 여기선 하늘다람쥐가 진짜 하늘다람쥐야.']);
      await c.say('dotori', '…농담이야. 여기엔 도토리가 없잖아.');
    } },
    { id: 'sp_stella', when: (s) => !!s.flags.m_space_truth, run: async (c) => {
      await c.say('dotori', ['스텔라는 400년 동안 혼자였대. 나는 16년 동안 레벨 9였고.', '…멈춰 있는 거랑 혼자인 거랑 어느 쪽이 더 힘들까.']);
      const k = await c.ask(null, ['혼자인 쪽.', '멈춰 있는 쪽.', '둘 다 이제 끝났어.']);
      await c.say('dotori', k === 0 ? '…그치. 나는 멈춰 있어도 네가 옆에 있었어. 스텔라는 드론 42대랑 「침입자 없음」만 주고받았대.' : k === 1 ? '…혼자여도 움직이면 어디든 갈 수 있으니까? 스텔라는 궤도를 돌긴 했대. 400년 동안 같은 궤도를.' : '…응. 우리가 왔으니까. 찍.');
    } },
  );
  G.story.nights.push(
    { id: 'sp_last', when: (s) => s.quests.m11 === 4, intro: '400년 된 담요는 생각보다 따뜻했다. 창밖에서 황금별이 가까이 빛난다. 그 옆의 검은 점도.', music: 'mother', run: async (c) => {
      const s = c.s;
      await c.say('dotori', ['…{n}. 안 자지. 나도.', '내일이면 아스트라야. 엄마가 있는 곳. …그리고 그 사람.']);
      await c.say('dotori', ['나 하나 고백할 게 있어.', '너 레벨 오를 때마다 무서웠어. 네가 커서 나를 두고 갈까 봐. 엄마가 너를 두고 간 것처럼. 할머니가 창을 두고 온 것처럼.']);
      const k = await c.ask(null, ['안 두고 가. 너도 데려갈 거야.', '…나도 무서워. 내가 두고 가질까 봐.', '네가 날 따라온 거잖아. 처음부터.']);
      if (k === 0) await c.say('dotori:sad', '…응. 그 말 들으려고 고백한 거야. 치사하지. 찍.');
      else if (k === 1) await c.say('dotori', ['…두고 가지는 거.', '엄마도 그랬겠다. 두고 간 게 아니라 두고 가진 거. 수정 속에서.', '그럼 우리가 가서 데려오자. 이번엔 두고 가지는 사람 없이.']);
      else await c.say('dotori:happy', ['…맞아. 할머니가 따라가라고 했지. 사고 안 치게 보라고.', '16년 동안 잘 봤어. 내일도 볼 거야.']);
      if (s.flags.stella_ally) await c.say('stella', '(목도리에 매달린 단말기에서 작은 목소리) …다 들려. 기록 안 할게. 이번 건 진짜로.');
      c.bond('dotori', 2);
    } },
  );

  G.world.nodes.push({ region: 'space', label: '정거장', x: 22, y: 18, color: '#8ab0e0', sky: true, maps: ['station', 'station_core', 'quarters', 'deck'] });
})();
