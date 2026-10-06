/* 소문과 세월: 이야기가 흘러가면 사람들의 말도 따라 바뀐다 — 갑자기가 아니라, 소문이 퍼지듯
   · 사건 — 이야기의 큰일 · 곁이야기의 결말 · 네가 고른 것. 일어난 날을 적어 두고(게임 속 하루 = 12분, 장이 넘어가면 하루 반),
     그 지역 사람은 바로(「방금」 · 눈으로 본 말) → 며칠 지나 받아들인 말 → 오래 지나 살림이 된 말.
     다른 지역 사람은 반나절쯤 뒤에야 「~래」로 듣고 → 알게 되고 → 옛이야기가 된다.
     같은 사람이 같은 일을 단계마다 한 번씩만. 모든 사람이 모든 일을 말하지도 않는다(사람마다 관심이 다르다).
     아이 · 어른 · 노인의 말투가 다르고, 아이는 아이가 알 만한 일만 말한다.
   · 다시 만남 — 그 사람과 얼마나 자주 말했는지(처음 · 아는 사이 · 단골), 얼마나 오래 못 봤는지,
     그새 무엇이 달라졌는지(하얘진 앞머리 · 새 동료 · 떠난 동료 · 오른 레벨 · 소문 · 새 무기 · 쓰러진 횟수 · 하늘을 보는 눈)를 알아본다.
     단골은 이름을 부른다.
   54_voices가 말을 걸 때 부른다: ST.reunion(…) · ST.newsFor(…) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  const chi = () => ORD.indexOf(S().ch || 'c1');
  const DAY = 720;
  const dayNow = () => Math.floor(((S().t || 0) + DAY * 0.3) / DAY);
  const girl = () => S().gender === 'girl';
  const fill = (t) => String(t).replace(/\{형\}/g, () => (girl() ? '누나' : '형')).replace(/\{이름(?::([^}]+))?\}/g, (m, p) => { const nm = S().name || '아린'; return p ? U.josa(nm, p) : nm; });

  /* ═════════ 사건 ═════════
     reg: 일어난 지역(들) — 'all'이면 모두가 바로 안다(탑 방송처럼). ch: 일어나는 장(옛 기록을 불러왔을 때 소문을 새로 퍼뜨리지 않게)
     near: 그 지역 사람이 갓 일어났을 때 · far: 다른 지역 사람이 처음 들을 때 · known: 받아들인 뒤 · after: 오래 지나
     값: 줄 · 줄 배열 · (s) => 그것 · { 지역: …, any: … }. kid · old: 같은 꼴로 아이 · 노인 말 (아이는 kid가 있는 일만 말한다) */
  const EV = [];
  const ev = (id, o) => EV.push(Object.assign({ id }, o));
  const by = (map, dflt) => (s) => { for (const k of Object.keys(map)) if (s.flags[k]) return map[k].concat(dflt && dflt.common ? dflt.common : []); return dflt && dflt.common ? dflt.common.concat(dflt.only || []) : dflt; };
  const both = (only, common) => ({ only, common });   // by(…, both(고른 게 없을 때만, 언제나)) — 같은 동네 사람이 똑같은 말만 하지 않게

  /* ── 1장 · 그린 광장 탑 ── */
  ev('tower', { reg: 'green', ch: 'c1', when: (s) => s.flags.c1_done || s.flags.c1p_0 || s.flags.c1p_1 || s.flags.c1p_2,
    near: by({ c1p_0: ['광장 탑 봤어? 핵이 쩍 갈라졌어. 그날 밤 우리 집 등잔이 혼자 밝아지더라니까. 빛이 돌아온 거래.', '그라우스 기사가 갈라진 탑 앞에 한참 서 있더라. 누가 베었는지 다 안다는 얼굴로.'],
      c1p_1: ['기사한테 정식 심사를 청했다며? 겁도 없지. …그래도 칼 대신 말로 한 건 잘했어.', '은빛 기사가 너를 보고 웃더라. 기사가 웃는 거 처음 봤어. 좋은 뜻인지는 모르겠지만.'],
      c1p_2: ['그 밤에 탑 불빛이 잠깐 꺼졌던 거 알아? 어디서 노랫소리가 들리더니. 다들 꿈인 줄 알았대.', '탑이 깜빡 꺼졌을 때, 우리 집 개가 하늘 보고 짖었어. 개는 뭘 안 거지.'] },
      both(['광장 탑에 무슨 일이 있었대. 아침에 보니 기사들이 빙 둘러서 있더라.'], ['그날 밤 이후로 다들 탑 쪽을 한 번씩 쳐다보고 지나가. 나도 그래.', '마리엔 아줌마가 탑 앞을 쓸고 있더라. 기사들 발자국이 너무 많다고.'])),
    far: by({ c1p_0: ['그린 시골 마을에서 누가 징수탑을 베었대. 아이라던데? 설마.', '그린 탑 핵이 갈라졌다더라. 기사단이 쉬쉬하는데, 쉬쉬하는 게 더 크게 들려.'], c1p_1: ['그린에서 웬 아이가 기사단 심사를 청했다더라. 요즘 애들은 겁이 없어.'], c1p_2: ['그린 탑 불빛이 한밤에 꺼졌다던데. 고장이래. 고장이 노래를 부르나.'] }, both(['그린 광장 탑에서 소동이 있었다던데. 자세한 건 몰라.'], ['그린 쪽에서 온 짐꾼이 그러는데, 거기 탑이 요즘 좀 조용하대.'])),
    known: by({ c1p_0: ['탑 하나 갈라진 걸로 세상이 바뀌진 않지. 근데 그 마을 사람들 얼굴은 바뀌었대.'] }, ['그린 탑 일 이후로 기사들이 마을마다 탑을 한 번씩 더 들여다보고 다녀.']),
    after: { green: ['광장 탑? 아, 그거 벌써 옛날 얘기 같네. 그 뒤로 일이 하도 많아서.'], any: ['그린 탑 얘기 기억나? 그게 시작이었다는 사람도 있어.'] },
    kid: { near: by({ c1p_0: ['탑이 빠지직! 했어. 나 봤어! 진짜야!'], c1p_2: ['밤에 노래 들었어. 탑이 자장가 듣고 잠들었대.'] }, ['어른들이 탑 얘기만 해. 탑이 아팠대.']), far: ['그린에 탑 베는 {형}가 있대! 진짜 있대!'] },
    old: { near: ['허, 탑이 저리 되는 걸 살아서 보는구먼. 할멈 손주라지? 그 집 피는 못 속여.'] },
  });
  /* ── 노아 ── */
  ev('noah_dew', { reg: 'green', ch: 'c1', when: (s) => s.flags.c1_dew_given,
    near: by({ shared_noah: ['노아네 엄마 봤어? 노아가 따뜻해졌대. 누가 손을 잡아 줬더니. 그게 너지?'] }, ['노아네 엄마가 웃는 거 처음 봤어. 이슬 덕이래.']),
    after: ['노아 머리카락 끝이 다시 까매질 때가 있대. 아주 가끔. 그날은 노아네가 잔치야.'],
    kid: { near: ['노아가 오늘 밖에 나왔어! 같이 꽃 셌어. 노아가 이겼어.'] } });
  ev('noah_saved', { reg: ['white', 'green'], ch: 'c7', when: (s) => s.flags.c7_noah,
    near: { green: by({ noah_herb: ['노아 소식 들었어? 살았대! 설화초래. 세린 아가씨가 심어 둔 꽃이라나. 노아 엄마가 마을을 세 바퀴 돌았어. 울면서.'], noah_own: ['노아 살았대! 근데 그 애 고친 사람 앞머리가 하얘졌다더라. …너구나.'] }, both(['노아가 고비를 넘겼대! 화이트에서 편지가 왔어.'], ['노아네 집 창문에 등불이 밤새 켜져 있었어. 기다리는 등불이 아니라 기쁜 등불.'])),
      white: ['병동의 그 그린 아이, 고비를 넘겼대. 수녀님들이 밤새 촛불을 켜 뒀지.', '병동 창문에 아이 손바닥 자국이 생겼어. 노아라는 애가 웃으면서 찍었대.'] },
    far: ['화이트 병동에서 빛바램병 아이가 나았대. 빛바램병이 낫는 병이었어?'],
    known: ['빛바램병도 나을 수 있대. 그 얘기 들은 집마다 아이 머리카락을 매일 들여다봐. 희망이 생기니까 더 무섭대.'],
    after: { green: ['노아가 요즘 마을에서 제일 시끄러워. 다들 그 소리를 좋아해.'], any: ['빛바램병 낫는 법을 의원들이 받아 적었대. 설화초 키우는 집이 늘었어.'] },
    kid: { near: ['노아 형아 이제 안 아파! 같이 술래잡기 할 거야!'], far: ['빛 빠지는 병이 낫는 거래! 우리 할머니도 나을까?'] } });

  /* ── 2장 · 황금 광산 ── */
  ev('mine', { reg: 'red', ch: 'c2', when: (s) => s.flags.c2_done || s.flags.c2_extractor,
    near: by({ rud_dawn: ['광산 착즙기 박살 났대! 광부들이 그 쇳덩이 조각을 문패로 걸었어.'], rud_order: ['착즙기가 멈췄어. 기사단 장부가 어디론가 갔다는데, 그라우스 얼굴이 하얗게 질렸더래.'], rud_night: ['광산 일 들었어? 아침에 보니 착즙기가 텅 비었대. 그리고 루드네 문 앞에 약상자가 산더미. 누가 그랬는지 아무도 몰라.'] },
      both(['황금 광산이 다시 열렸어. 밑에서 나온 게 금만이 아니래.'], ['어제 광부들이 해 지기 전에 올라왔어. 몇 년 만인지 몰라. 다들 하늘 보고 눈을 찡그리더라.', '광산 입구에 기사 둘만 남았어. 그것도 하품하면서.', '도르간 대장이 술을 샀대. 그 짠돌이가. 광산에 뭔 일이 있긴 있었던 거야.'])),
    far: by({ rud_night: ['레드에서 도둑 고양이가 금을 물어다 약으로 바꿨대. 동화 같은 얘기지.'], rud_dawn: ['레드 광산 기계를 누가 부쉈대. 새벽단 짓이라는 사람도 있고, 아니라는 사람도 있어.'], rud_order: ['그라우스 부단장 장부가 어디로 넘어갔대. 기사단 안에서도 말이 많다더라.'] }, both([], ['레드 광산에서 사람 빛 짜내던 기계가 멈췄다더라.', '레드 광부들이 일찍 퇴근한대. 별일이야.'])),
    known: ['광부들 얼굴에 핏기가 돌아왔대. 빛을 덜 뺏기니까 밥맛이 돈다나.', '레드 쪽에서 오는 쇠가 좀 늦어. 대신 망치 소리가 덜 지쳤대.', '광산 사고가 그 뒤로 한 번도 없었대. 기계가 사람을 덜 몰아세우니까.'],
    after: { red: ['요즘 광산 노래가 바뀌었어. 「캐자, 캐자」에서 「쉬자, 쉬자」로.'], any: ['레드 금값이 좀 올랐대. 사람 빛을 안 짜내니까. 그게 원래 값이지.'] },
    kid: { near: ['아빠가 일찍 왔어! 광산 기계가 고장 났대. 고장 나서 좋은 건 처음이야.'], far: by({ rud_night: ['광산에 고양이 귀신이 산대. 금을 먹고 약을 뱉는대!'] }, ['레드 광산 기계가 쿵 멈췄대!']) } });

  /* ── 3장 · 블루 ── */
  ev('lighthouse', { reg: 'blue', ch: 'c3', when: (s) => s.flags.c3_luce_done,
    near: ['등대에 불 들어온 거 봤어? 정말 오랜만이야. 배 타는 사람들이 다 울었어.', '어젯밤 바다가 오랜만에 길을 보여 줬어. 등대지기 딸이 켰대.', '루체가 등대 꼭대기에서 손을 흔들었어. 바다 쪽으로. 거기 누가 있는 것처럼.'],
    far: ['블루 등대에 다시 불이 켜졌다더라. 등대지기 딸이 켰대.'],
    known: ['등대 덕에 밤배가 다시 다녀. 생선값이 좀 내렸어.'],
    after: ['블루 등대 불빛, 이제 아무도 신기해하지 않아. 원래 그래야지.'],
    kid: { near: ['등대가 반짝반짝해! 루체 언니가 켰어!'], far: ['바다에 별이 하나 생겼대. 등대래.'] },
    old: { near: ['등대가 다시 숨을 쉬는구먼. 루카스가 봤으면 좋았을 걸.'] } });
  ev('kraken', { reg: 'blue', ch: 'c3', when: (s) => s.flags['d3:boss'],
    near: ['해저 동굴에서 울던 소리가 그쳤어. 어부들이 다시 그쪽으로 그물을 던져.'],
    far: ['블루 바다 밑 괴물이 잠잠해졌대. 누가 들어갔다 나왔다나.'],
    after: ['해저 동굴 쪽 물빛이 맑아졌어. 거기서 잡힌 게는 맛이 달대.'],
    kid: { near: ['문어 괴물 없어졌대! 이제 바다에 발 담가도 돼!'] } });
  ev('dock_duel', { reg: 'blue', ch: 'c3', when: (s) => s.flags.c3_duel,
    near: by({ c3_duel_win: ['부두에서 기사랑 겨루는 거 봤어! 은빛 기사가 칼을 거두더라. 졌다는 얼굴은 아니었어. 이상하게.'] }, both(['부두 결투 봤어. 기사가 이겼는데, 표정은 진 사람 같았어.'], ['부두 결투 때 생선 장수들이 장사를 접고 구경했어. 그날 생선이 다 상했대. 아무도 안 아까워했어.'])),
    far: ['블루 부두에서 카이론 제자랑 붙은 애가 있대. 간도 크지.'],
    known: by({ c3_duel_win: ['그 부두 결투 이후로 애들이 막대기 들고 기사 놀이를 해. 다들 이기는 쪽을 하겠대.'] }, ['부두 결투 얘기가 아직 돌아. 진 쪽 얘기가 더 많아. 끝까지 안 물러섰다고.']),
    kid: { near: ['칼싸움 봤어! 쨍! 쨍! 나도 클 거야!'] } });

  /* ── 4장 · 태양의 눈 ── */
  ev('sun_eye', { reg: 'yellow', ch: 'c4', when: (s) => s.flags.c4_done || s.flags.c4_eye,
    near: by({ c4p_0: ['태양의 눈이 깨졌대! 골디 영감이 웃었다나. 그 영감이 웃는 건 손해 볼 때뿐인데.'], c4p_1: ['주황 우물 빛값이 내렸어! 반으로. 골디가 장부를 다시 썼대. 해가 서쪽에서 뜰 일이야.'], c4p_2: ['야나네 마을에 밤마다 이상하게 환한 데가 있어. 다들 모른 척해. 그게 좋은 거니까.'] },
      both(['태양 피라미드 봉인이 풀렸대. 모래 위로 빛이 기둥처럼 섰다더라.'], ['어젯밤 피라미드 쪽 하늘이 한참 밝았어. 낙타들이 다 그쪽을 보고 서 있더라.', '골디 영감네 금고지기가 그러는데, 영감이 장부를 덮고 한참 웃더래. 웃다가 기침하고.'])),
    far: ['옐로 금화왕이 손해를 봤다는 소문이 있어. 믿기 어렵지.', '사막 피라미드 봉인이 풀렸대. 거기 들어가서 살아 나온 사람이 있다나.'],
    known: by({ c4p_1: ['옐로 우물값이 내려서 사막 대상들이 좀 숨을 쉰대.'] }, both(['그 뒤로 골디 영감이 이자를 좀 덜 받는대. 아주 조금.'], ['사막 대상들이 노래를 하나 새로 불러. 「눈을 깬 아이」라나. 가사는 매번 달라.'])),
    after: ['골디 영감 요즘 이자 놀이를 좀 줄였대. 늙어서 그런가, 누구 때문인가.'],
    kid: { near: ['골디 할아버지가 사탕을 줬어! 공짜로! …나중에 갚으래.'], far: ['사막에 피라미드가 눈을 떴대! 무서워!'] } });

  /* ── 5장 · 카이론의 방송 ── */
  ev('broadcast', { reg: 'all', ch: 'c5', when: (s) => s.flags.c5_done,
    near: ['탑에서 카이론 목소리 들었어? 「흰빛을 가진 자는 천년성에 출두하라.」 탑이 말을 하는 건 처음이야.', '그 방송 이후로 기사들이 아이들 손바닥을 들여다봐. 빛나나 안 빛나나.', '흰빛을 가졌다는 사람, 어떤 사람일까. 무섭기도 하고… 좀 보고 싶기도 해.'],
    known: ['천년성에 출두하라던 그 사람, 갔을까? …안 갔으면 좋겠다. 그냥 내 생각이야.', '방송에서 「계산에 넣지 않겠다」던 말, 그게 제일 무서웠어. 사람을 빼는 셈이잖아.'],
    after: ['그 방송 기억나? 다들 탑만 보면 그 목소리가 들리는 것 같대.'],
    kid: { near: ['탑이 말했어! 엄마가 귀를 막아 줬어.'], known: ['흰빛 놀이 하자! 내가 흰빛 할게. 너는 기사 해.'] },
    old: { near: ['탑이 사람 말을 하다니. 오래 살고 볼 일이구먼. 좋은 쪽은 아니고.'] } });

  /* ── 6장 · 천년제 ── */
  ev('arena', { reg: 'rainbow', ch: 'c6', when: (s) => s.flags.c6_arena,
    near: ['구름 투기장 우승자가 너라며? 마지막 판 카시안이랑 붙은 거, 관중석이 다 일어났어.'],
    far: ['천년제 투기장에서 이름 없는 여행자가 우승했대.'],
    after: ['투기장 우승 깃발에 네 이름이 아직 걸려 있대. 비에 젖어도 안 떼.'],
    kid: { near: ['우승한 사람이다! 사인해 줘! …글씨 못 써? 그럼 손바닥 찍어 줘.'] } });
  ev('pillar', { reg: 'rainbow', ch: 'c6', when: (s) => s.flags.c6_done,
    near: ['봉헌식 밤… 기둥이 미쳐 날뛰다 부서졌어. 흰빛이 터지던 거, 아직 눈에 남아.', '그라우스 부단장이 사라졌대. 아무도 어디로 갔는지 몰라. 몰라도 되는 거겠지.', '광장 바닥에 기둥 조각이 아직 박혀 있어. 애들이 그걸 줍다가 혼났어. 아직 빛이 빠져나간대.', '그날 밤 카이론을 봤다는 사람이 있어. 하늘에서 내려와서, 아무 말 없이 서 있다 갔대.'],
    far: ['천년제가 엉망이 됐대. 무지개 기둥이 부서졌다던데? 천 년 만에.', '하늘섬에서 흰빛이 터진 거 봤어? 여기서도 보였어. 밤인데 그림자가 생겼거든.'],
    known: (s) => ({ dawn: ['새벽단이 그날 밤 광장 사람들을 빼냈대. 그 뒤로 새벽단 편드는 사람이 늘었어.'], order: ['기사단에 감찰관이 생겼대. 기사단을 지켜보는 기사. 좋은 일이겠지?'], night: ['그 밤 이후로 밤에 등불 하나씩 더 켜는 집이 늘었어. 이유는 다들 모른대.'] })[s.flags.route_lock] || ['기둥이 무너지고 나서, 무지개 사람들 얼굴에 색이 좀 돌아왔대. 빛을 덜 빨려서.'],
    after: { rainbow: ['내년 천년제는 기둥 없이 한대. 불꽃만으로. 그게 더 예쁠 거래.'], any: ['무지개 기둥 무너진 거, 벌써 노래로 나왔더라. 가사가 좀 과장이야.'] },
    kid: { near: ['하늘에서 빛이 펑! 했어. 롤로 아저씨가 나를 안고 뛰었어.'], far: ['하늘섬에서 불꽃놀이가 터졌대! …불꽃놀이 아니래.'] },
    old: { far: ['천 년 된 기둥이 무너졌다고? 천 년 된 건 다 무너지는 법이지. 나도 그렇고.'] } });
  ev('rolo', { reg: 'rainbow', ch: 'c6', when: (s) => s.flags.c6_rolo_thanks,
    near: ['광대 롤로가 분장 없이 다녀. 회색 얼굴로. 그게 더 웃기다고 애들이 따라다녀.'],
    after: ['롤로가 새 공연을 한대. 「색칠하지 않은 광대」. 표가 다 팔렸어.'],
    kid: { near: ['롤로 아저씨 얼굴 회색이야! 근데 웃으면 무지개 색 같아.'] } });

  /* ── 7장 · 화이트 ── */
  const storePick = (s) => (s.flags.c7_report ? 'order' : s.flags.c7_marked ? 'night' : 'dawn');
  ev('storage', { reg: 'white', ch: 'c7', when: (s) => s.flags.c7_done,
    near: (s) => ({ dawn: ['어젯밤 눈이 이상했어. 빛나는 눈. 손에 닿으면 따뜻했어. 얼음 창고가 터졌대.', '대성당 지하에서 쿵 소리가 났어. 그다음엔 눈이… 반짝였어. 할머니가 그 눈을 맞고 일어나 앉으셨어.'],
      order: ['대성당 지하 관을 막았대. 감찰관이 왔다 갔어. 장부에 뭔가를 잔뜩 적어 가더라.', '성녀님이 감찰을 피하지 않으셨대. 그게 더 무섭다는 사람도 있어.'],
      night: ['얼음 창고 관에 누가 흰 표시를 그렸대. 수녀님들은 장난이래. 장난치곤 너무 반듯해.'] })[storePick(s)],
    far: (s) => ({ dawn: ['화이트에서 빛이 눈처럼 내렸대. 맞으면 감기가 낫는다나.'], order: ['화이트 대성당에 감찰이 들어갔대. 성녀님한테.'], night: ['화이트 얼음 창고에 흰 표시가 생겼대. 무슨 뜻인지 다들 수군거려.'] })[storePick(s)],
    known: (s) => ({ dawn: ['그 눈 맞은 사람들, 빛바램이 좀 덜하대.'], order: ['대성당 기부함이 반으로 줄었대. 사람들이 이제 기도만 하고 빛은 안 낸대.'], night: ['흰 표시 따라가 본 사람이 있대. 관이 어디로 이어지는지. 대답은 안 해 주더래.'] })[storePick(s)],
    after: ['화이트 눈은 그 뒤로 조금 덜 차갑대. 기분 탓이겠지.'],
    kid: { near: (s) => (storePick(s) === 'dawn' ? ['하늘에서 반짝이 눈이 왔어! 먹어 봤는데 맛은 없었어.'] : ['대성당에 어른들이 잔뜩 왔어. 다들 표정이 무서웠어.']) } });
  ev('edel', { reg: 'white', ch: 'c7', when: (s) => s.flags.c7_edel,
    near: ['백은 기사 에델이 투구를 벗고 다녀. 얼굴 처음 봤어. 생각보다 어려.'],
    after: ['에델 기사가 요즘 아이들한테 칼 대신 썰매 타는 법을 가르쳐. 「스스로 판단해서」래.'] });

  /* ── 8장 · 그레이 ── */
  ev('bolt', { reg: 'gray', ch: 'c8', when: (s) => s.flags.c8_done,
    near: by({ c8_recording: ['폐공장에서 녹음이 흘러나왔대. 볼트 씨 부인 목소리. 그 무뚝뚝한 양반이 공방 문을 사흘 닫았어.'] }, both(['폐공장 쇳덩이 거인이 멈췄어. 밤에 쿵쿵 소리가 안 나니까 오히려 잠이 안 와.'], ['볼트 씨 공방 굴뚝에서 연기가 안 났어. 사흘이나. 그 양반이 쉬는 건 처음 봐.', '폐공장 앞에 누가 꽃을 놓고 갔어. 그레이에서 꽃이라니. 종이꽃이긴 해도.'])),
    far: ['그레이에서 탑 설계한 사람이 탑 그리기를 그만뒀대.', '그레이 폐공장 거인이 멈췄다더라. 누가 멈췄는지는 소문이 셋이야.'],
    known: ['볼트 씨가 요즘 탑 대신 시계를 고쳐 준대. 공짜로. 「멈춘 걸 다시 가게 하는 연습」이래.'],
    after: ['그레이 하늘이 아주 조금 파래졌대. 기분 탓 아니래. 세피아가 기록했대.'],
    kid: { near: ['쿵쿵 거인이 잠들었어! 이제 공장 앞에서 놀아도 돼!'] } });
  ev('sepia', { reg: 'gray', ch: 'c8', when: (s) => s.flags.c8_sepia_join,
    near: ['공방 로봇 아가씨 봤어? 꽃 앞에서 한참 서 있더라. 「예쁘다」 소리를 처음 들었어. 기계한테서.'],
    far: ['그레이 로봇이 웃는대. 고장인가? 고장이면 좋은 고장이네.'],
    kid: { near: ['로봇 언니가 내 그림 보고 예쁘대! 로봇도 예쁜 걸 알아!'] } });
  ev('cassian_left', { reg: 'all', ch: 'c8', when: (s) => s.flags.cassian_left,
    near: ['기사단에서 카시안이 나갔대. 카이론 마지막 제자가. 기사들이 술렁여.'],
    after: ['카시안 기사, 요즘은 혼자 다닌대. 칼끝을 어디로 향할지 정했다는 소문이야.'] });

  /* ── 9장 · 블랙 ── */
  ev('nocturne', { reg: 'black', ch: 'c9', when: (s) => s.flags.c9_done,
    near: ['녹턴 성 커튼이 걷혔어. 처음으로 아침 한 줄. 다들 그 한 줄 보러 성 앞에 나갔어.', '성문이 날아가던 소리, 등불 거리까지 들렸어. 그다음엔… 조용했어. 이상하게 따뜻하게.', '해골 기사들이 성 앞에 무릎 꿇고 멈춰 있어. 아무도 안 건드려. 무서워서가 아니라… 쉬게 두려고.', '빵집에서 「아침빵」을 팔기 시작했어. 아침이 한 줄 드는 시간에만.'],
    far: ['밤의 나라 성문이 날아갔대. 새벽단 짓이래.', '블랙에 아침이 한 줄 들었대. 딱 한 줄.'],
    known: ['블랙 사람들이 한 줄짜리 아침에 맞춰 빵을 굽는대. 하루 한 번.'],
    after: ['블랙 등불 거리도 이제 낮엔 불을 끈대. 등불지기가 처음으로 퇴근했다나.'],
    kid: { near: ['아침이 뭐야? 엄마가 저거래. 저 한 줄. 눈부셔!'], far: ['밤의 나라에 해가 났대! 조금!'] } });

  /* ── 10장 · 무한호 ── */
  ev('launch', { reg: 'all', ch: 'c10', when: (s) => s.flags.c10_done,
    near: by({ c10p_0: ['무한호 떴어! 징수탑 하나가 마지막 빛을 다 써 버렸대. 탑이 처음으로 쓸모 있었네.'], c10p_1: ['나도 등불 보냈어. 리라 노래가 탑에서 흘러나오길래. 다들 창가에 등불 하나씩 내놨지.', '어젯밤에 대륙 전체가 등불을 켰대. 누가 시킨 것도 아닌데.'], c10p_2: ['하늘로 흰 줄이 그어졌어. 사람 하나의 빛이래. 그 사람… 괜찮을까.'] },
      both(['하늘로 흰 줄 하나가 그어졌어. 곶에서 로켓이 떴대.'], ['로켓 뜰 때 땅이 울렸어. 그리고 다들 동시에 하늘을 봤지. 대륙 전체가 같은 데를 본 건 처음일 거야.', '피로스 박사가 발사대에서 내려오면서 울었대. 「반쯤 미쳤다」던 사람들이 다 박수를 쳤고.'])),
    known: ['하늘로 간 사람들, 소식 있어? …없구나. 소식 없는 게 좋은 소식이래.'],
    after: ['밤마다 하늘을 봐. 정거장 쪽에 작은 불빛이 있대. 그게 그 사람들이면 좋겠어.'],
    kid: { near: by({ c10p_1: ['나도 등불 들었어! 내 등불이 제일 작았는데 엄마가 제일 예쁘대.'] }, ['로켓이 슝 하고 갔어! 나도 커서 탈 거야.']) },
    old: { near: ['하늘로 배를 띄우다니. 내 평생 본 것 중에 제일 무모하고 제일 근사하구먼.'] } });
  ev('station', { reg: 'all', ch: 'c11', when: (s) => s.flags.c11_done,
    near: ['정거장이랑 교신이 끊겼대. 피로스 박사가 그랬어. 교신은 돌아온다고. 사람도.'],
    known: ['하늘 쪽에서 가끔 흰빛이 깜빡여. 신호 같아. 다들 그걸 보고 잠들어.'] });

  /* ── 곁이야기의 끝 ── */
  ev('bel_star', { reg: 'red', ch: 'c3', when: (s) => s.flags.bel_publish || s.flags.bel_name,
    near: by({ bel_publish: ['관측소에서 별 지도를 새로 낸대! 「등불 든 아이」 자리가 다시 그려졌어.'], bel_name: ['하늘에 새 별 이름이 생겼대. 「토리아」. 관측소 꼬마가 몰래 붙였다나.'] }, []),
    far: by({ bel_publish: ['사라진 별이 사라진 게 아니었대. 레드 관측소 발표래.'], bel_name: ['토리아라는 별이 생겼대. 이상한 이름이지? 근데 부르면 기분이 좋아.'] }, []),
    kid: { near: ['밤하늘에 새 별 이름 있대! 나도 찾아볼래!'] } });
  ev('poem', { reg: 'rainbow', ch: 'c6', when: (s) => !!s.flags.echo_line,
    near: (s) => ['무지개 분수대에 천년제 시가 새겨졌어. 마지막 줄은 「' + s.flags.echo_line + '」. 그 줄 앞에서 다들 한참 서 있어.'],
    far: (s) => ['천년제 시 마지막 줄이 정해졌대. 「' + s.flags.echo_line + '」였나. 좋더라.'],
    after: (s) => ['요즘 편지 끝에 「' + s.flags.echo_line + '」라고 쓰는 게 유행이야.'] });
  ev('graves', { reg: 'black', ch: 'c9', when: (s) => s.flags.graves_named || s.flags.graves_lamps,
    near: by({ graves_named: ['이름 없는 묘에 이름이 새겨졌어. 모르트 영감이 이름마다 인사를 해.'], graves_lamps: ['이름 없는 묘마다 작은 등불이 켜졌어. 밤에 보면 별밭 같아.'] }, []),
    far: ['밤의 나라 묘지에 무슨 일이 있었대. 무서운 쪽이 아니라 좋은 쪽으로.'] });
  ev('tint', { reg: 'gray', ch: 'c8', when: (s) => s.flags.tint_pour || s.flags.tint_keep,
    near: by({ tint_pour: ['고철 언덕에 열두 색 얼룩이 생겼어. 거기서 꽃이 폈대. 그레이에서 꽃이라니!'], tint_keep: ['틴트라는 애가 병을 들고 다니며 색을 보여 줘. 애들이 줄을 서.'] }, []),
    far: ['그레이에 색이 생겼대. 하나씩 보고 싶다.'],
    kid: { near: by({ tint_pour: ['고철 산에 꽃 폈어! 빨강이랑 파랑이랑… 다 셀 수 없어!'] }, ['틴트 언니 병 열면 무지개 나와!']) } });
  ev('karel', { reg: 'green', ch: 'c6', when: (s) => s.flags.kar_done,
    near: by({ kar_knight: ['카렐이 기사가 되겠대. 「규칙보다 사람」을 지키는 기사래. 누구한테 배웠는지.'], kar_healer: ['카렐이 미라 할머니 약초방에 드나들어. 의원이 되겠대. 손이 따뜻하다나.'], kar_self: ['카렐이 요즘 하루는 칼, 하루는 약초야. 아무도 안 말려. 그게 좋대.'] }, []),
    kid: { near: ['카렐 형이 목검 깎아 줬어! 나도 카렐 형처럼 될 거야. 뭐가 될지는 몰라도.'] } });
  ev('fog', { reg: 'mist', ch: 'c5', when: (s) => s.flags.morgan_done,
    near: ['늪 안개가 걷혔어! 이제 물에 얼굴이 제때 비쳐.'],
    far: ['안개 늪 뱃사공이 웃었대. 안개가 걷혔다나.'] });
  ev('graus_trial', { reg: 'all', ch: 'c3', when: (s) => s.flags.graus_trial,
    near: ['천년성 법정에 그라우스 부단장이 섰대. 기사가 기사를 재판하다니. 장부가 증거래.'],
    after: ['그 재판 이후로 기사들이 장부를 두 권씩 들고 다닌대. 하나는 보여 주는 장부.'] });

  /* ═════════ 언제 일어났나 ═════════ */
  // until: 예감 · 앞날의 소문 — 그 일이 일어나면 더는 그 말을 하지 않는다 (59b_rumors)
  const gone = (e, s) => { try { return !!e.until(s); } catch (x) { return false; } };
  function stamp() {
    const s = S(); if (!s || !s.flags) return;
    const T = s.newsT || (s.newsT = {});
    const cur = chi(), d = dayNow();
    for (const e of EV) {
      if (T[e.id]) continue;
      if (e.until && gone(e, s)) continue;   // 예감: 그 일이 벌써 일어났으면 꺼내지 않는다
      let ok = false; try { ok = !!e.when(s); } catch (x) { ok = false; }
      if (!ok) continue;
      // 이미 한참 지난 장의 일(옛 기록을 불러왔을 때)은 오래된 이야기로
      const ei = ORD.indexOf(e.ch);
      T[e.id] = cur > ei + 1 ? { d: d - 30, c: ei } : { d, c: cur };
    }
  }
  let tk = 0;
  ST.onTick.push((dt) => { tk -= dt; if (tk > 0) return; tk = 1.5; stamp(); });

  /* ═════════ 누가 · 어디서 · 무엇을 ═════════ */
  const ageOf = (n) => { const l = n && n.look; return l && l.age === 'child' ? 'child' : l && l.age === 'old' ? 'old' : 'adult'; };
  function homeReg(n) {
    const m = W().map; if (!m || !n) return null;
    if (m.overworld) return OW.regionOf(Math.floor(n.x / TS), Math.floor(n.y / TS));
    return typeof m.region === 'number' ? TL.REGIONS[m.region] : m.region || m.palName || null;
  }
  function stageOf(e, reg) {
    const T = S().newsT && S().newsT[e.id]; if (!T) return null;
    const age = (dayNow() - T.d) + 1.5 * (chi() - T.c);
    const local = e.reg === 'all' || [].concat(e.reg).includes(reg);
    if (local) return age < 1 ? 'near' : age < 4 ? 'known' : 'after';
    return age < 0.5 ? null : age < 2.5 ? 'far' : age < 6 ? 'known' : 'after';
  }
  function resolve(x, s, reg) {
    if (x == null) return null;
    if (typeof x === 'function') return resolve(x(s), s, reg);
    if (typeof x === 'string') return [x];
    if (Array.isArray(x)) return x.length ? x : null;
    if (typeof x === 'object') return resolve(x[reg] != null ? x[reg] : x.any, s, reg);
    return null;
  }
  function linesFor(e, stage, age, reg, s) {
    if (age === 'child') return resolve(e.kid && e.kid[stage], s, reg);
    if (age === 'old') { const o = resolve(e.old && e.old[stage], s, reg); if (o) return o; }
    return resolve(e[stage], s, reg);
  }
  /** 이 사람이 지금 꺼낼 소식 한 줄. fresh = 갓 들은 것만(원래 말 뒤에 덧붙일 때) */
  ST.newsFor = function (name, n, mode) {
    const s = S(); if (!s || !name) return null;
    stamp();
    const reg = homeReg(n), age = ageOf(n);
    const told = (s.newsTold = s.newsTold || {})[name] || (s.newsTold[name] = {});
    const order = mode === 'fresh' ? ['near', 'far'] : ['near', 'far', 'known', 'after'];
    for (const want of order) {
      for (const e of EV) {
        const st = stageOf(e, reg); if (st !== want) continue;
        if (e.until && gone(e, s)) continue;
        const key = e.id + ':' + st; if (told[key]) continue;
        // 사람마다 관심이 다르다: 제 동네 일은 대부분, 먼 동네 일은 절반 남짓
        const local = e.reg === 'all' || [].concat(e.reg).includes(reg);
        if (U.hash(name + '|' + e.id) % 100 >= (local ? 82 : 55)) continue;
        if (e.skip && e.skip.test(name)) continue;
        const L = linesFor(e, st, age, reg, s); if (!L || !L.length) continue;
        told[key] = 1;
        // 앞 단계를 건너뛰었으면 그 단계도 들은 것으로 (오래 못 본 사람이 「방금」을 말하지 않게)
        for (const k2 of ['near', 'far', 'known']) { if (k2 === st) break; told[e.id + ':' + k2] = 1; }
        // 방금 다른 사람이 한 말은 피한다 (같은 동네를 돌며 같은 말을 연달아 듣지 않게)
        const rec = s.newsRecent || (s.newsRecent = []);
        const i0 = U.hash(name + e.id + st) % L.length;
        let pick = L[i0];
        for (let j = 0; j < L.length; j++) { const c2 = L[(i0 + j) % L.length]; if (!rec.includes(U.hash(c2) % 100003)) { pick = c2; break; } }
        rec.push(U.hash(pick) % 100003); while (rec.length > 6) rec.shift();
        return fill(pick);
      }
    }
    return null;
  };

  /* ═════════ 다시 만남 ═════════ */
  const COMP = {
    viola: { adult: '옆에 학원 교복… 퍼플 학원생이야? 똑똑해 보이네. 말은 좀 빠르겠다.', child: '저 언니 지팡이 끝에서 불꽃 나와!', old: '학원 아가씨를 데리고 다니는구먼. 책보다 길이 더 가르치지.' },
    yana: { adult: '여우 귀 아가씨는 길잡이야? 사막 냄새가 나네.', child: '귀가 움직여! 만져 봐도 돼?', old: '모래바다 사람이구먼. 눈이 멀리 보는 눈이야.' },
    sepia: { adult: '그 아가씨… 사람 맞아? 손에서 째깍 소리가 나던데.', child: '로봇이다! 진짜 로봇이야! 안녕!', old: '쇠로 된 아가씨가 꽃을 보고 서 있더군. 오래 살고 볼 일이야.' },
    lyra: { adult: '음유시인이랑 다니네? 노래 한 곡 부탁해도 될까.', child: '노래하는 언니다! 그 노래 또 불러 줘!', old: '저 아가씨 목소리, 어디서 들은 것 같은데… 꿈에서였나.' },
    cassian: { adult: '그 기사… 카이론 제자 아니야? 너랑 같이 다녀도 되는 거야?', child: '진짜 기사다! 칼 보여 줘요!', old: '기사가 길동무라. 칼끝이 어디를 보는지만 잘 봐 두게.' },
    lea: { adult: '새벽단 사람 아니야? …못 본 걸로 할게. 조심해.', child: '저 누나 멋있어! 붉은 망토!', old: '새벽단이로구먼. 젊은 것들은 늘 해를 먼저 보지.' },
    rud: { adult: '그 꼬마 기사, 장부를 끼고 다니네. 너랑 잘 어울린다.', child: '저 형 맨날 뭘 적어!', old: '숫자를 세는 아이로구먼. 사람도 세어 주면 좋겠는데.' },
  };
  const R = {
    away: { child: ['어! {형}다! 어디 갔었어?', '{형}, 오랜만이야! 나 키 컸지? 컸다고 해.'], adult: ['어, 왔네. 한동안 안 보이더니.', '오랜만이야. 그새 얼굴이 좀 탔네.', '살아 있었구나. 농담이야. 반가워서 그래.'], old: ['오, 자네. 오랜만이구먼. 길이 험했나?', '이 늙은이를 잊지 않고 들렀구먼.'] },
    regular: { child: ['{이름:아/야}! 기다렸어! 진짜 많이!', '{이름:아/야}, 이번엔 오래 있다 가?'], adult: ['{이름}, 왔어? 네 자리 비워 놨지.', '왔구나, {이름}. 이번엔 얼마나 있다 가?', '{이름:이/가} 왔네. 하루가 좀 덜 심심하겠다.'], old: ['{이름}, 어서 오게. 차부터 한 잔 하지.', '{이름:이/가} 왔구먼. 무릎이 덜 쑤시는 날이었는데, 그래서였나.'] },
    hair: { child: ['{형} 머리에 눈 왔어! 앞머리에만!'], adult: ['…앞머리 그거, 하얘졌네? 무슨 일 있었어? …말하기 싫으면 안 해도 돼.'], old: ['머리에 서리가 앉았구먼. 젊은 사람이. 무리했나 보군.'] },
    lv: { child: ['{형} 엄청 세 보여! 레벨 몇 올랐어?'], adult: ['못 본 새 어깨가 달라졌네. 뭘 하고 다닌 거야?', '눈빛이 좀 달라졌다. 좋은 쪽으로… 아마.'], old: ['눈빛이 달라졌구먼. 많이 베고, 많이 봤겠지.'] },
    fame: { child: ['{형} 유명해! 우리 동네 애들이 다 알아!'], adult: ['요즘 어디 가나 네 얘기야. 이 마을 저 마을 도와주고 다닌다며.'], old: ['자네 소문이 바람보다 빨리 오더군.'] },
    gear: { child: ['그거 새 칼이야? 반짝반짝해!'], adult: ['손에 든 거 처음 보는 거네. 좋은 물건 같아. 아껴 써.'], old: ['연장이 바뀌었구먼. 좋은 연장은 주인을 고른다네.'] },
    fall: { child: ['{형} 얼굴에 멍 있어. 아팠어?'], adult: ['얼굴에 멍 자국… 몇 번 쓰러졌구나. 그래도 다시 일어났네.'], old: ['넘어진 자국이 보이는구먼. 넘어진 만큼 걸었다는 뜻이지.'] },
    sky: { child: ['{형} 요즘 하늘만 봐. 하늘에 뭐 있어?'], adult: ['너 요즘 하늘을 자주 보더라. 뭐 찾는 거라도 있어?'], old: ['하늘을 보는 눈이 깊어졌구먼. 거기 누가 있나?'] },
    last: { child: ['{형}, 어디 멀리 가? …꼭 다시 와야 해. 약속.'], adult: ['…이게 마지막일지도 모르니까 하는 말인데, 고마웠어. 그냥, 여러 가지로.'], old: ['먼 길 떠나는 얼굴이구먼. 다녀오게. 「다녀오게」라고 했네. 꼭 돌아오란 뜻이야.'] },
  };
  const gearGrade = (s) => { const I2 = G.data.ITEMS, w = s.weapon || 'sword'; const id = w === 'bow' ? s.equip.bow : w === 'magic' ? s.equip.focus : s.equip.sword; const it = id && I2[id]; return it ? (it.grade || 1) : 1; };
  const doneQ = (s) => Object.values(s.quests || {}).filter((q) => q && q.st === 'done').length;
  const shardN = (s) => Object.keys(s.shards || {}).length;
  function snap(s) { return { d: dayNow(), c: chi(), lv: s.lv || 1, party: (s.party || []).slice(), wh: !!s.flags.white_hair || !!s.flags.c10p_2, gr: gearGrade(s), q: doneQ(s), de: s.deaths || 0, sh: shardN(s) }; }
  const pickR = (key, age, name) => { const L = R[key][age] || R[key].adult; return fill(L[U.hash(name + key + chi()) % L.length]); };
  /** 다시 만났을 때 한마디 (없으면 null). 말을 걸 때마다 부르고, 그때의 나를 적어 둔다 */
  ST.reunion = function (name, n) {
    const s = S(); if (!s || !name) return null;
    const M = s.vmeet || (s.vmeet = {});
    const tot = (s.vtot = s.vtot || {})[name] = ((s.vtot[name]) || 0) + 1;
    const prev = M[name], now = snap(s);
    M[name] = now;
    if (!prev || tot < 3) return null;   // 처음 · 두 번째 만남은 아직 서먹하다
    const age = ageOf(n);
    const away = now.d - prev.d >= 2 || now.c > prev.c;
    // 그새 달라진 것 하나 (먼저 눈에 띄는 것부터)
    if (now.wh && !prev.wh) return pickR('hair', age, name);
    const joined = now.party.find((id) => !prev.party.includes(id) && COMP[id]);
    if (joined) return fill(COMP[joined][age] || COMP[joined].adult);
    const left = prev.party.find((id) => !now.party.includes(id) && id !== 'toria' && G.cast && G.cast.name && G.cast.name(id));
    if (left && age !== 'child') return '늘 같이 다니던 ' + U.josa(G.cast.name(left), '이/가') + ' 안 보이네. …잘 지내지?';
    if (!away) return null;
    if (chi() >= 9 && tot >= 8 && !s.flags['vlast:' + name]) { s.flags['vlast:' + name] = 1; return pickR('last', age, name); }
    if (now.lv - prev.lv >= 8) return pickR('lv', age, name);
    if (now.q - prev.q >= 3 && now.q >= 6) return pickR('fame', age, name);
    if (now.gr - prev.gr >= 2) return pickR('gear', age, name);
    if (now.de - prev.de >= 3) return pickR('fall', age, name);
    if (now.sh - prev.sh >= 2) return pickR('sky', age, name);
    return pickR(tot >= 8 ? 'regular' : 'away', age, name);
  };
  ST.NEWS_EV = EV;
})();
