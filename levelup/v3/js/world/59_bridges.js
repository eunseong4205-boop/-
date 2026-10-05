/* 장과 장 사이 — 이야기가 갑자기 뚝 끊기고 뚝 시작하지 않게
   걸어서 넘어가는 일곱 구간(그린→레드 · 레드→블루 · 옐로→퍼플 · 무지개→화이트 · 화이트→그레이 · 그레이→블랙 · 블랙→알록달록 곶):
     · 여운 — 장이 끝나고 들판에 나서면, 떠나온 곳을 돌아보는 짧은 장면
     · 길손 — 조금 걸으면 길 위에서 사람을 만난다. 다음 장의 일을 먼저 겪은 사람(광부의 딸 · 헌책 장수 · 초상화가 · 순례자 · 유리 조각 행상 · 등불 소년 · 늙은 비행사).
       고르는 것에 따라 받는 것 · 듣는 말이 다르고, 그 일은 소문(54f_news)이 되어 그 동네 사람들 입에 오른다. 받은 물건은 다음 장의 사람에게 보여 줄 수 있다
     · 밤 — 그 구간에서 쉬면(여관 · 모닥불 · 요양원 …) 동료들과 나누는 밤 이야기 (꿈을 꾼 밤은 건너뛴다)
   타고 넘어가는 구간(배 · 구름고래 · 빛의 사다리): 장 이름이 뜨기 전에 탈것 위의 장면
   새 장에 들어서면: 장 이름 뒤에 그 땅의 첫인상 한두 줄 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '언니' : '누나');   // 리라를 부를 때 (리라가 손위)
  const inParty = (id) => (S().party || []).includes(id);
  const nm = () => S().name || '아린';
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };

  /* ═════════ 길에서 받는 것 ═════════ */
  item('br_log', { type: 'key', name: '젖은 항해 일지', desc: '이름 없는 배의 일지. 17년 전 폭풍 뒤 해안에 떠밀려 왔다. 마지막 장에 흰 옷의 손님 이야기.',
    read: '「셋째 날. 흰 옷의 손님이 배에 올랐다. 아기를 안고 있었다. 뱃삯 대신 선원들 손끝의 빛바램을 고쳐 주었다.」\n「다섯째 날. 손님이 금서고 셋째 서가를 물었다. 선장은 대답하지 않았다. 그날 밤 선장이 혼자 울었다.」\n「여섯째 날. 폭풍. 손님은 갑판에서 하늘을 보고 있었다. 「배고픈 게 오고 있어요.」 그 말이 마지막 기록이다.」' });
  item('br_sketch', { type: 'key', name: '목탄 초상화', desc: '길에서 만난 화가 로웨나가 그려 준 내 얼굴. 그림 속 앞머리 한 가닥이 하얗다.',
    read: '그림 속 얼굴은 조금 지쳐 보이고, 조금 더 웃고 있다. 앞머리 한 가닥이 하얗다. 구석에 작은 글씨 — 「길 위의 얼굴 · 마흔한 번째. 이 얼굴은 언젠가 많은 사람을 데리고 돌아올 것.」' });
  item('br_shard', { type: 'key', name: '붉은 유리 조각', desc: '색을 잃은 땅에서 빵 열 개 값이 나가는 빨강. 해에 비추면 손바닥이 붉어진다.',
    read: '해에 비추자 손바닥에 붉은 빛이 고였다. 행상 소녀 핀니가 말했다. 「그레이에서는 이걸 보면 다들 울어. 기뻐서인지 슬퍼서인지는 몰라.」' });

  /* ═════════ 도우미 ═════════ */
  /** 플레이어 둘레에서 사람이 설 만한 자리 (같은 높이 · 물 · 용암이 아닌 땅) */
  function spot(p, dists) {
    const m = W().map, z = p.z || 0, a0 = Math.atan2(p.face ? p.face[1] : 1, p.face ? p.face[0] : 0);
    for (let i = 0; i < 16; i++) {
      const a = a0 + (i % 2 ? 1 : -1) * Math.floor((i + 1) / 2) * 0.45;
      for (const d of dists || [62, 48, 76, 36]) {
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d * 0.8, tx = Math.floor(x / TS), ty = Math.floor((y - 4) / TS);
        const t0 = m.T(tx, ty); if (t0 === T.WATER || t0 === T.DEEP || t0 === T.LAVA || t0 === T.CLIFF) continue;
        if (m.H(tx, ty) !== z) continue;
        if (!m.boxFree(x - 5, y - 8, 10, 8, z, p)) continue;
        if (W().propBlock && W().propBlock(x - 5, y - 8, 10, 8, p)) continue;
        return [x, y];
      }
    }
    return null;
  }
  function calm() {
    const Wd = W(), p = Wd.player;
    for (const e of Wd.ents) if (e.foe && !e.dead && (e.aggro || U.dist(e.x, e.y, p.x, p.y) < 120)) return false;
    return true;
  }
  const regionHere = () => { const p = W().player; return OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)); };
  /** 길손을 불러 세운다: 저쪽에서 걸어와 곁에 선다 */
  async function traveler(c, spec) {
    const p = W().player, at = spot(p); if (!at) return null;
    const n = c.spawn(Object.assign({ x: at[0], y: at[1], dir: U.dir4(p.x - at[0], p.y - at[1]) }, spec));
    const [tx, ty] = [p.x + (at[0] - p.x) * 0.38, p.y + (at[1] - p.y) * 0.38];
    await c.move(n, tx, ty, { speed: 40 });
    c.faceEach('hero', n);
    return n;
  }
  /** 길손이 걸어서 떠난다 */
  function leave(c, n) {
    if (!n) return;
    const p = W().player, a = Math.atan2(n.y - p.y, n.x - p.x);
    c.move(n, n.x + Math.cos(a) * 120, n.y + Math.sin(a) * 90, { speed: 44 }).then(() => { n.dead = true; });
    setTimeout(() => { n.dead = true; }, 7000);
  }

  /* ═════════ 걸어서 넘어가는 구간 ═════════ */
  const GAPS = [
    /* ── 그린 → 레드 ── */
    { id: 'g1', from: 'c1', to: 'c2',
      async farewell(c) {
        await c.narr('마을 어귀. 돌아보니 오두막 굴뚝에서 연기가 오르고 있었다. 아침밥 짓는 연기. 오늘부터는 한 사람 몫.');
        await c.say('toria', '찍… 할머니, 손 안 흔들었지. 근데 우리가 언덕 넘을 때까지 문 앞에 서 있었어. 나 뒤돌아봤거든.', { face: 'sad' });
        const k = await c.choice(null, ['한 번 더 돌아본다', '앞을 본다']);
        if (k === 0) { await c.narr('작은 사람 하나가 아직 문 앞에 서 있었다. 손을 들지도, 내리지도 않고.'); c.flag('br1_look'); }
        else await c.say('toria', '…응. 앞. 할머니가 그랬어. 「뒤돌아보면 발이 무거워진다.」', { face: 'normal' });
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('kidg', { hc: '#3a2a1a', tc: '#c8783a', hat: 'helm', hatC: '#e8c048' }), name: '광부의 딸 미르' });
        if (!n) return false;
        await c.say(n, '저기… 그린 마을이 이쪽 맞아요? 약초꾼 할머니가 산다는.', { face: 'normal' });
        await c.say('toria', '찍? 할머니 손님이다!', { face: 'happy' });
        await c.say(n, '레드에서 왔어요. 우리 아빠는 황금 광산 광부예요. 석 달 전부터 손끝이 비쳐요. 유리처럼.', { face: 'sad' });
        await c.say(n, '기사님들이 「빛을 조금 덜어 냈을 뿐」이래요. 금이 더 잘 나오라고. …사람한테서도 빛을 덜어 내요?', { face: 'sad' });
        const k = await c.choice(null, ['할머니 오두막 가는 길을 알려 준다', '미르의 등불에 내 빛을 조금 나눠 준다', '광산에 무슨 일이 있는지 더 묻는다']);
        c.flag('br1_' + k);
        if (k === 0) { await c.say(n, '언덕 너머 큰 참나무 옆…! 고맙습니다! …약초꾼 할머니는 무섭다던데.', { face: 'happy' }); await c.say('toria', '무서워. 근데 약은 잘 지어. 그리고 몰래 사탕 줘.', { face: 'smile' }); }
        else if (k === 1) {
          await c.narr('등불에 손을 대자 흰빛 한 방울이 옮겨 갔다. 바랜 불꽃이 잠깐, 아침처럼 밝아졌다.');
          const s = S(); if (s.hp > 4) s.hp -= 1;
          await c.say(n, '…따뜻해요. 아빠 손 같아요. 옛날 아빠 손.', { face: 'cry' });
          await c.say('toria', '찍… 너 그거, 할머니가 조심하랬잖아. …그래도, 잘했어.', { face: 'sad' });
        } else {
          await c.say(n, '광산 입구에 기사님들이 서 있어요. 부단장님이라는 사람이 왔대요. 그라우스. 장부를 들고 다녀요.', { face: 'normal' });
          await c.say(n, '광부마다 번호를 매긴대요. 우리 아빠는 사백십이 번이에요.', { face: 'sad' });
          await c.say('toria', '…사람한테 번호를? 찍. 기분 나빠.', { face: 'angry' });
        }
        await c.say(n, '아빠 이름은 사백십이 번 말고, 하랄이에요. 꼭 기억해 줘요.', { face: 'smile' });
        leave(c, n);
        c.journal('레드에서 온 광부의 딸 미르를 만났다. 광부들의 손끝이 비친다고 한다. 아빠 이름은 하랄.');
        return true;
      },
      async night(c) {
        await c.say('toria', '할머니 오두막 서쪽 벽에 빗금 있잖아. 하루에 하나. 그게 벽 한쪽을 다 채웠어.', { face: 'normal' });
        const k = await c.choice('할머니는 무엇을 세고 있었을까.', ['엄마를 기다린 날', '나를 지킨 날', '모르겠다']);
        if (k === 0) await c.say('toria', '…그럴지도. 근데 할머니는 기다리는 사람 얼굴이 아니었어. 지키는 사람 얼굴이었어.', { face: 'sad' });
        else if (k === 1) await c.say('toria', '…응. 나도 그렇게 생각해. 마지막 빗금 긋는 날, 할머니 손이 떨렸거든.', { face: 'sad' });
        else await c.say('toria', '나도 몰라. 그럼 우리가 알아내자. 돌아가서 물어보자, 다 끝나면.', { face: 'normal' });
        await c.say('toria', '오늘부터는 내가 셀게. 하나. …찍. 자.', { face: 'smile' });
      } },
    /* ── 레드 → 블루 ── */
    { id: 'g2', from: 'c2', to: 'c3',
      async farewell(c) {
        const rt = S().flags.c2_route;
        await c.narr(rt === 'dawn' ? '광산 입구에 부서진 착즙기 조각이 쌓여 있었다. 누군가 그 위에 들꽃 한 줌을 꽂아 두었다.' : rt === 'order' ? '광산 입구의 기사단 깃발이 내려가고, 광부 조합의 낡은 깃발이 올라가 있었다. 바람에 구멍 난 자리가 펄럭였다.' : '광산은 조용했다. 누가 그랬는지 아무도 몰랐다. 입구 돌 위에 고양이 발자국 하나.');
        await c.say('toria', '광부 아저씨들 손 흔드는 거 봤어? 손이… 덜 비쳤어. 아주 조금.', { face: 'smile' });
        if (f('br1_0') || f('br1_1') || f('br1_2')) await c.say('toria', '미르네 아빠도 저기 있었을까. 하랄 아저씨. …번호 말고 이름으로 불렀으면 좋겠다.', { face: 'normal' });
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('oldm', { tc: '#6a5a8a' }), name: '헌책 장수 오르빈' });
        if (!n) return false;
        await c.say(n, '이보게, 젊은이. 잠깐 쉬어 가세. 이 상자, 블루 대도서관에 팔러 가는 책이야. 레드 사람들은 책 대신 망치를 사거든.', { face: 'smile' });
        await c.narr('상자 맨 위에 젖었다 마른 가죽 수첩이 있었다. 표지에 바다새 한 마리.');
        await c.say(n, '그거? 항해 일지야. 이름 없는 배의. 17년 전 폭풍 뒤에 해안에 떠밀려 왔지. 마지막 장이 이상해.', { face: 'normal' });
        await c.say(n, '「흰 옷의 손님이 금서고 셋째 서가를 물었다. 선장은 대답하지 않았다.」', { face: 'closed' });
        await c.say('toria', '찍…! 흰 옷의 손님!', { face: 'shock' });
        const k = await c.choice(null, ['일지를 보여 달라고 한다', '상자를 들어 준다', '블루 항구에 대해 묻는다']);
        c.flag('br2_' + k);
        if (k === 0) { await c.say(n, '갖고 가게. 어차피 아무도 안 사. 문어 관장한테 보여 주게. 그 영감, 젖은 종이 냄새를 좋아하지.', { face: 'smile' }); await c.getItem('br_log', 1); }
        else if (k === 1) { await c.narr('상자는 생각보다 무거웠다. 책은 원래 그렇다고 노인이 웃었다.'); await c.say(n, '허리가 살았구먼! 이건 덤이야. 책값은 아니고, 길값.', { face: 'happy' }); c.gold(40); c.exp(15); }
        else { await c.say(n, '블루는 바다 냄새와 종이 냄새가 반반이야. 대도서관의 옥타비오 관장은 문어지. 다리가 여덟이라 책을 여덟 권씩 읽어.', { face: 'smile' }); await c.say(n, '등대지기 루체는 밤마다 빛을 돌리지. 배들이 길을 잃지 않게. 그 아이 등불은 탑에 안 바쳐. 기사들이 몹시 싫어하지.', { face: 'normal' }); }
        leave(c, n);
        c.journal('헌책 장수 오르빈을 만났다. 17년 전 배에 탄 「흰 옷의 손님」이 금서고 셋째 서가를 물었다고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '엄마가 찾던 거, 책 속에 있을까? 책은 거짓말 안 해?', { face: 'normal' });
        const k = await c.choice(null, ['책도 거짓말한다', '쓴 사람이 거짓말한다', '읽는 사람이 거짓말한다']);
        await c.say('toria', ['…그럼 우리는 뭘 믿어? 찍. …그래, 직접 본 걸 믿자.', '쓴 사람이 누군지 보면 되겠다. 엄마가 쓴 거면 믿을래.', '…나 거짓말 안 하고 읽을게. 글씨 모르지만.'][k], { face: k === 2 ? 'smile' : 'normal' });
        await c.narr('바닷바람이 창을 두드렸다. 내일은 항구다.');
      } },
    /* ── 옐로 → 퍼플 ── */
    { id: 'g4', from: 'c4', to: 'c5',
      async farewell(c) {
        await c.narr('모래바다가 끝나는 곳. 마지막 모래언덕 위에서 돌아보니, 황금궁 지붕이 해를 받아 한 번 번쩍였다. 윙크처럼.');
        await c.say('toria', '찍. 골디 아저씨, 마지막에 웃었지? 금화 세는 사람도 웃는구나.', { face: 'smile' });
        await c.say('toria', '…세린 언니가 골목 아이들한테 빛을 공짜로 나눠 줬대. 엄마 이야기, 사람들 입에서 하나씩 나와. 조각처럼.', { face: 'sad' });
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('scholar', { hc: '#8a4a3a', tc: '#7a5aa8', glasses: false }), name: '떠돌이 화가 로웨나' });
        if (!n) return false;
        await c.say(n, '잠깐! 그 얼굴, 그려도 될까? 돈은 안 받아. 길에서 만난 얼굴을 모으는 중이거든.', { face: 'happy' });
        const k = await c.choice(null, ['그리게 해 준다', '왜 얼굴을 모으냐고 묻는다', '거울 연못에 대해 묻는다']);
        c.flag('br4_' + k);
        if (k === 0) {
          await c.narr('목탄이 사각거렸다. 그림 속 얼굴은 너보다 조금 지쳐 보였고, 조금 더 웃고 있었다.');
          await c.say(n, '…이상하네. 앞머리 한 가닥을 하얗게 그렸어. 아직 안 하얀데. 손이 멋대로 움직였어.', { face: 'shock' });
          await c.say(n, '가져가. 마흔한 번째 얼굴. 언젠가 다시 만나면 그 하얀 한 가닥이 맞았는지 알려 줘.', { face: 'smile' });
          await c.getItem('br_sketch', 1);
        } else if (k === 1) {
          await c.say(n, '퍼플 학원에 있었어. 거울 연못을 한 번 들여다봤지. 거기 비친 내 얼굴이… 싫었어. 내가 제일 되기 싫은 얼굴이었거든.', { face: 'sad' });
          await c.say(n, '그 뒤로 내 얼굴은 안 그려. 남의 얼굴만. 남의 얼굴은 다 좋아 보여. 신기하지.', { face: 'smile' });
        } else {
          await c.say(n, '연못지기 시빌 할멈은 대답 대신 질문을 해. 하나만 준비해 가. 「너는 무엇이 되고 싶지 않니?」', { face: 'normal' });
          await c.say('toria', '찍… 그런 거 생각해 본 적 없어. 나는 뭐가 되기 싫지? 도토리 없는 다람쥐?', { face: 'shock' });
        }
        await c.say(n, '퍼플 숲은 해가 안 져. 계속 해 질 녘이야. 오래 있으면 시간을 잊어. …나처럼 3년쯤.', { face: 'closed' });
        leave(c, n);
        c.journal('떠돌이 화가 로웨나를 만났다. 퍼플의 거울 연못은 「되고 싶지 않은 나」를 비춘다고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '요즘 탑 소리가 이상해. 윙윙거리다가… 가끔 숨을 참아. 누가 탑 안에서 숨죽이고 있는 것처럼.', { face: 'normal' });
        await c.say('toria', '골디 아저씨가 그랬지. 사천왕 회의가 열린다고. 카이론이 흑점 이야기를 할 거라고. …네 이름도.', { face: 'sad' });
        const k = await c.choice(null, ['이름이 불리면 간다', '아직은 숨는다', '먼저 찾아간다']);
        await c.say('toria', ['찍. 당당하다. 할머니가 들으면 꿀밤 줄 거야. …그리고 몰래 웃을 거야.', '숨는 거 잘해. 평생 했어. 같이 숨자.', '…진짜? 너 가끔 할머니보다 무서워.'][k], { face: k === 1 ? 'smile' : 'shock' });
      } },
    /* ── 무지개 → 화이트 ── */
    { id: 'g6', from: 'c6', to: 'c7',
      async farewell(c) {
        await c.narr('구름 사다리를 내려오자 축제 소리가 등 뒤에서 작아졌다. 부러진 기둥은 그대로 누워 있었다. 아무도 치우자고 하지 않았다.');
        await c.say('toria', '찍. …네 머리 한 가닥, 진짜 하얘. 만져 봐도 돼?', { face: 'sad' });
        const k = await c.choice(null, ['만지게 해 준다', '괜찮다고 한다']);
        await c.say('toria', k === 0 ? '…차가워. 눈 같아. 할머니 머리랑 같은 색이야. 이제 알겠다, 할머니 머리가 왜 하얀지.' : '…괜찮은 거 아니잖아. 바보. 괜찮다고 할 때마다 한 가닥씩 하얘지면 어떡해.', { face: k === 0 ? 'sad' : 'angry' });
        c.flag('white_hair');
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('oldm', { tc: '#8a6a4a', hat: 'straw' }), name: '순례자 오스카' });
        if (!n) return false;
        const kid = c.spawn({ look: G.cast.folk('kid', { tc: '#c8c8d8' }), name: '오스카의 손주', x: n.x + 12, y: n.y + 4, dir: n.dir });
        await c.say(n, '설산 화이트로 가는 길 맞지? 성녀님한테 가는 길이야. 이 녀석 손끝이 비쳐서.', { face: 'sad' });
        await c.narr('아이가 장갑을 벗어 보였다. 손가락 끝이 얼음처럼 투명했다. 그 너머로 눈이 비쳤다.');
        await c.say(n, '성녀님은 공짜로 고쳐 주신대. 대신 대성당 기도등에 불을 하나 붙이고 오라더군. 기도는 공짜지. …공짜 맞겠지?', { face: 'normal' });
        const k = await c.choice(null, ['아이에게 내 목도리를 둘러 준다', '기도등이 무엇인지 묻는다', { t: '노아 이야기를 해 준다', if: f('met:noah') }]);
        c.flag('br6_' + k);
        if (k === 0) { await c.say(kid, '…' + (girl() ? '누나' : '형') + ' 냄새 나. 따뜻해.', { face: 'smile' }); await c.say(n, '고맙네. 늙은이 목도리는 바늘구멍이 많아서.', { face: 'smile' }); c.exp(20); }
        else if (k === 1) { await c.say(n, '모르네. 불을 붙이고 나온 사람들이 다들 조금 피곤하다더군. 기도가 원래 그런 거겠지. 마음을 쓰는 거니까.', { face: 'closed' }); await c.say('toria', '찍… 피곤해진다고? 기도하면?', { face: 'shock' }); }
        else { await c.say(n, '그린 마을 아이도 성녀님한테 갔다고? 그림을 잘 그린다고? 그럼 우리 손주도 친구가 생기겠구먼.', { face: 'happy' }); await c.say(kid, '그림! 나 눈사람 그릴 줄 알아!', { face: 'happy' }); }
        await c.say(kid, '나중에 눈사람 만들어 줘! 엄청 큰 거!', { face: 'happy' });
        leave(c, n); leave(c, kid);
        c.journal('설산 길에서 순례자 오스카와 빛바램에 걸린 손주를 만났다. 성녀의 치유는 공짜지만, 기도등에 불을 붙이고 나온 사람들은 피곤하다고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '찍… 카이론이 손가락 하나로 그라우스를 지웠어. 지운다는 게 뭐야? 죽은 거야?', { face: 'sad' });
        const k = await c.choice(null, ['모르겠다', '장부에서 지운 거다', '어딘가로 보낸 거다']);
        await c.say('toria', ['…모르는 게 제일 무서워. 근데 모르는 걸 모른다고 하는 건 안 무서워.', '장부에서 지우면 사람이 사라져? …그럼 장부에 이름 많이 적어 두자. 우리 이름도. 미르랑 하랄 아저씨랑.', '어디로? …언젠가 거기도 가게 될까.'][k], { face: k === 2 ? 'shock' : 'sad' });
        const b = { dawn: 'rud', order: 'cassian', night: 'lyra' }[S().flags.route_lock || ''];
        if (b && inParty(b)) await c.say(b, b === 'rud' ? '…확률은 안 뽑을래. 뽑으면 무서워질 것 같아서.' : b === 'cassian' ? '스승님은 그런 분이 아니었다. …아니었는데.' : '밤에는요, 지워진 사람들 이름을 불러 줘요. 그러면 조금 덜 지워져요.', { face: 'sad' });
      } },
    /* ── 화이트 → 그레이 ── */
    { id: 'g7', from: 'c7', to: 'c8',
      async farewell(c) {
        await c.narr('대성당 종이 한 번 울렸다. 기도 종이 아니라, 문 여는 종이었다. 성녀가 처음으로 문을 활짝 열어 둔 날.');
        await c.say('toria', '루미에 성녀님 편지 있잖아. 한 묶음이래. 엄마한테 쓴 거.', { face: 'sad' });
        const k = await c.choice(null, ['한 통 꺼내 읽는다', '나중에 읽는다']);
        if (k === 0) { await c.narr('「세린. 오늘은 아이 셋이 나았어요. 기도등이 셋 꺼졌어요. 그 등을 붙인 사람 셋이 조금 더 하얘졌어요.\n당신이라면 뭐라고 했을까요. …아니, 알아요. 「나눠요, 짜내지 말고.」」'); await c.say('toria', '…엄마 목소리 같아. 들어 본 적 없는데.', { face: 'cry' }); }
        else await c.say('toria', '응. 나중에. 다 끝나고. 엄마랑 같이 읽어도 되겠다.', { face: 'smile' });
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('kidg', { hc: '#8a8a8a', tc: '#9a9aa8', bc: '#6a6a78' }), name: '유리 조각 행상 핀니' });
        if (!n) return false;
        await c.say(n, '색 조각 있어요! 옛 성터에서 주운 진짜 색이에요! 빨강, 파랑, 노랑!', { face: 'happy' });
        await c.narr('소녀의 소쿠리에 깨진 색유리가 담겨 있었다. 소녀의 옷도, 머리칼도, 볼도 잿빛이었다. 유리 조각만 색이었다.');
        await c.say(n, '그레이에서는 색이 제일 비싸요. 빨강 한 조각이면 빵이 열 개예요. 다들 창가에 걸어 두고 아침마다 봐요.', { face: 'normal' });
        const k = await c.choice(null, ['빨간 조각을 하나 산다 (20골드)', '왜 그레이엔 색이 없냐고 묻는다', '강철공 볼트에 대해 묻는다']);
        c.flag('br7_' + k);
        if (k === 0) { if (S().gold >= 20) c.gold(-20); await c.say(n, '해에 비춰 봐요. 손바닥이 빨개져요. 그거 보면 다들 울어요. 기뻐서인지 슬퍼서인지는 몰라요.', { face: 'smile' }); await c.getItem('br_shard', 1); }
        else if (k === 1) { await c.say(n, '400년 전에 왕님이 빛을 마셨대요. 광맥의 빛을 전부. 그날부터 색이 빠졌대요. 할머니가 그랬어요.', { face: 'normal' }); await c.say(n, '할머니도 색을 본 적은 없대요. 할머니의 할머니한테 들었대요.', { face: 'sad' }); }
        else { await c.say(n, '볼트 아저씨? 무서운 아저씨예요. 말을 반만 해요. 연료가 아깝대요.', { face: 'shock' }); await c.say(n, '근데 길고양이한테 밥 줘요. 몰래요. 회색 고양이한테. 다 봤어요.', { face: 'smile' }); }
        leave(c, n);
        c.journal('그레이로 가는 길에서 유리 조각 행상 핀니를 만났다. 색을 잃은 땅에서는 색유리 한 조각이 빵 열 개 값이라고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '에델 아저씨, 투구 벗은 얼굴 생각보다 젊었어. 울 것 같은 얼굴이었어. 그동안 투구 안에서 그 얼굴로 있었을까.', { face: 'sad' });
        const k = await c.choice(null, ['투구는 우는 얼굴을 숨기려고 쓴다', '투구는 머리를 지키려고 쓴다']);
        await c.say('toria', k === 0 ? '…그럼 투구 벗은 건 이제 울어도 된다는 거네. 다행이다.' : '찍. 너는 진지한 데서 꼭 그렇게 말하더라. …근데 맞는 말이야. 둘 다 지켜.', { face: k === 0 ? 'smile' : 'smirk' });
        if (f('met:noah')) await c.say('toria', '노아도 이제 그림 그릴 수 있대. 손끝이 다시 안 비친대. …다음엔 우리 그려 달라고 하자.', { face: 'happy' });
      } },
    /* ── 그레이 → 블랙 ── */
    { id: 'g8', from: 'c8', to: 'c9',
      async farewell(c) {
        await c.narr('공방 굴뚝에서 처음으로 색이 있는 연기가 올랐다. 희미한 분홍. 볼트가 무언가 시험하는 모양이었다.');
        await c.say('toria', '세피아 언니 손 흔들 때 째깍 소리 났어. 그게 우는 소리래. 로봇은 그렇게 운대.', { face: 'sad' });
        await c.say('toria', '…동쪽은 밤이래. 해가 안 뜨는 땅. 거기 지나야 하늘 가는 사람한테 갈 수 있대.', { face: 'normal' });
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('kid', { hc: '#2a2438', tc: '#3a3450', bc: '#2a2438', skin: 'pale' }), name: '등불 소년 엘로' });
        if (!n) return false;
        await c.narr('소년이 등불을 꼭 쥐고 있었다. 눈을 가늘게 뜨고, 서쪽 하늘을 보고 있었다.');
        await c.say(n, '…저게 해예요? 눈이 아파요. 너무… 너무 밝아요.', { face: 'shock' });
        await c.say(n, '밤의 땅에서 왔어요. 열 살이에요. 해는 그림으로만 봤어요. 미드나잇 아저씨가 그려 줬는데, 그림보다 훨씬 커요.', { face: 'normal' });
        const k = await c.choice(null, ['해가 지기 전까지 같이 본다', '등불 기름을 나눠 준다 (10골드어치)', '돌아가는 길을 걱정해 준다']);
        c.flag('br8_' + k);
        if (k === 0) { await c.narr('둘이서 해를 봤다. 소년은 눈을 반쯤 감고, 그래도 끝까지 봤다. 그림자가 길어지다가, 사라졌다.'); await c.say(n, '…해는 엄청 큰 등불이구나. 누가 매일 켜는 거예요?', { face: 'happy' }); await c.say('toria', '찍… 아무도 안 켜. 그냥 떠. 그래서 신기한 거야.', { face: 'smile' }); }
        else if (k === 1) { if (S().gold >= 10) c.gold(-10); await c.say(n, '기름! 이거면 집까지 가요! 밤에는 등불이 꺼지면 그림자가 따라와요.', { face: 'happy' }); }
        else { await c.say(n, '괜찮아요. 녹턴 님의 그림자들이 아이들은 지켜 줘요. 「아이들을 지켜라」가 명령이래요.', { face: 'normal' }); await c.say(n, '…어른은 안 지켜 줘요. 우리 아빠는 어른이라서.', { face: 'sad' }); await c.say('toria', '…찍.', { face: 'sad' }); }
        await c.say(n, '미드나잇 아저씨한테 해 얘기 해 줘야지. 그 아저씨는 뭐든 다 아는데 해만 몰라요.', { face: 'smile' });
        leave(c, n);
        c.journal('밤의 땅에서 해를 보러 나온 등불 소년 엘로를 만났다. 녹턴의 그림자는 「아이들」만 지킨다고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '광맥 바닥에서… 너, 배고팠지? 빈 왕 앞에서. 눈이 이상했어.', { face: 'sad' });
        const k = await c.choice(null, ['배고팠다', '아니다']);
        if (k === 0) { await c.say('toria', '…솔직해서 다행이야. 배고프면 말해. 도토리 나눠 줄게. 반. 아니, 다.', { face: 'smile' }); c.flag('br8_honest'); }
        else await c.say('toria', '…거짓말할 때 코 찡긋하는 거, 할머니 닮았어. 괜찮아. 나는 알아.', { face: 'sad' });
        await c.say('toria', '배고픈 거랑 나쁜 거는 달라. 할머니가 그랬어. 「배고픈 걸 남한테 덜어 내면 그때부터 나쁜 기다.」', { face: 'normal' });
      } },
    /* ── 블랙 → 알록달록 곶 ── */
    { id: 'g9', from: 'c9', to: 'c10',
      async farewell(c) {
        await c.narr('동쪽 하늘 끝이 아주 조금 파래져 있었다. 등불 거리 사람들이 지붕에 올라가 그 쪽을 보고 있었다. 아무도 말하지 않았다.');
        await c.say('toria', '찍. 하늘이 파래. 처음 본대. 다들 우는지 웃는지 모르는 얼굴이야.', { face: 'happy' });
        if (inParty('lyra')) {
          await c.say('lyra', '…저기요. ' + sib() + '라고 불러도 돼요. 아직 어색하면 그냥 리라라고 해도 되고요.', { face: 'blush' });
          const k = await c.choice(null, ['리라 ' + sib(), '리라']);
          c.flag('br9_sis' + k);
          await c.say('lyra', k === 0 ? '……응. 응. 한 번만 더요. …아니에요, 됐어요. 오늘은 그걸로 충분해요.' : '좋아요. 리라. 엄마가 지어 준 이름이니까, 그걸로 불러 주는 것도 좋아요.', { face: k === 0 ? 'cry' : 'smile' });
        }
      },
      async meet(c) {
        const n = await traveler(c, { look: G.cast.folk('mech', { hc: '#c8c8c8', tc: '#7a5a3a', age: 'old', beard: '#e8e8e0' }), name: '날개 잃은 비행사 파울' });
        if (!n) return false;
        await c.narr('노인이 한쪽 다리를 끌며 걸어왔다. 나무 의족이었다. 목에 낡은 비행 안경.');
        await c.say(n, '곶에 가나? 피로스 그 녀석, 아직도 로켓을 만드나? 40년 전에 내가 그 녀석 첫 시험 비행사였지.', { face: 'smile' });
        await c.say(n, '떨어졌어. 다리 하나 놓고 왔어. 그 녀석은 그 뒤로 아무도 안 태웠지. 혼자 만들고, 혼자 부수고.', { face: 'closed' });
        const k = await c.choice(null, ['하늘은 어땠냐고 묻는다', '피로스에게 전할 말이 있냐고 묻는다', '무섭지 않았냐고 묻는다']);
        c.flag('br9_' + k);
        if (k === 0) await c.say(n, '…조용했어. 땅에서 듣던 소리가 하나도 없었어. 대륙이 손바닥만 했어. 그 손바닥을 지키겠다고 다들 그렇게 싸웠구나 싶었지.', { face: 'closed' });
        else if (k === 1) { await c.say(n, '「바보야, 착륙 장치부터 만들어.」 그거면 알아들어. …그리고 「다리는 안 아프다」고. 거짓말이지만.', { face: 'smile' }); c.flag('br9_msg'); }
        else await c.say(n, '무섭지. 무서우니까 타는 거야. 안 무서운 사람은 안 돌아와. 무서워해야 돌아올 길을 보거든.', { face: 'normal' });
        leave(c, n);
        c.journal('곶으로 가는 길에서 피로스의 옛 시험 비행사 파울을 만났다. 40년 전, 첫 비행에서 떨어졌다고 한다.');
        return true;
      },
      async night(c) {
        await c.say('toria', '…리라가 ' + sib() + '래. 너한테. 나 이제 둘 다 지켜야 돼. 다람쥐 일이 두 배야.', { face: 'smirk' });
        if (inParty('lyra')) await c.say('lyra', '저는 제가 지킬게요. 토리아는 쉬어요. 한 번도 쉬지 않았잖아요.', { face: 'smile' });
        await c.say('toria', '…카이론 말이야. 「오늘도 렙업이군」 했잖아. 엄마가 늘 하던 인사라고. 그 사람, 엄마 인사를 아직 기억해.', { face: 'sad' });
        const k = await c.choice('카이론을 만나면.', ['검을 든다', '먼저 말을 건다', '아직 모르겠다']);
        await c.say('toria', ['…그럼 나는 뒤에서 찍 할게. 크게.', '응. 무슨 말? …「오늘도 렙업이에요」? 그건 반칙이다. 너무 세.', '모르는 게 맞아. 아흔 날 남았어. 그 안에 알게 될 거야.'][k], { face: 'normal' });
      } },
  ];
  const GAP = Object.fromEntries(GAPS.map((g) => [g.id, g]));

  /* ── 언제 나오나 ── */
  let freeT = 0;
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  const chi = (id) => ORD.indexOf(id);
  /** 지금 열린 구간: from 장을 마쳤고, to 장의 첫 일이 아직 시작되지 않았다 */
  function openGap() {
    const s = S(), ci = chi(s.ch || 'c1');
    for (const g of GAPS) {
      if (!f(g.from + '_done')) continue;
      const ti = chi(g.to);
      if (ci > ti) continue;
      // 다음 장에 들어선 뒤에도 잠깐(게임 시간 6분)은 길손을 만날 수 있다 — 서둘러 지나쳤어도 빠뜨리지 않게
      const t0 = (s.brT || (s.brT = {}))[g.id] != null ? s.brT[g.id] : (s.brT[g.id] = s.t || 0);
      if (ci === ti && (s.t || 0) - t0 > 360) continue;
      return g;
    }
    return null;
  }
  ST.onTick.push((dt) => {
    const s = S(), Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !p || !m.overworld || G.script.running || s.duel || p.state === 'dead' || (G.game && G.game.scene && G.game.scene !== 'play') || (G.ui.blocking && G.ui.blocking())) { freeT = Math.min(freeT, 1); return; }
    const g = openGap(); if (!g) return;
    if (!calm() || p.swimming) { freeT = Math.min(freeT, 2); return; }
    freeT += dt;
    const fa = 'brf:' + g.id, mt = 'brm:' + g.id;
    if (!f(fa) && freeT > 3 && s.ch === g.from) {
      freeT = 0; s.flags[fa] = true;
      G.script.run(async (c) => { c.lock(true); await c.cinema(true); try { await g.farewell(c); } finally { await c.cinema(false); c.lock(false); } });
      return;
    }
    if (!f(mt) && freeT > (f(fa) || s.ch !== g.from ? 16 : 99)) {
      freeT = 0;
      G.script.run(async (c) => {
        c.lock(true); await c.cinema(true);
        let ok = false;
        try { ok = await g.meet(c); } finally { await c.cinema(false); c.lock(false); }
        if (ok) S().flags[mt] = true; else freeT = 8;   // 설 자리가 없었다 — 조금 더 걷고 다시
      });
    }
  });

  /* ── 밤 이야기: 그 구간에서 쉬면 (꿈을 꾼 밤은 건너뛴다) ── */
  const rest0 = ST.onRest;
  ST.onRest = async function (c) {
    const s = S(), before = Object.keys(s.flags).filter((k) => k.startsWith('dream:')).length;
    if (rest0) await rest0.apply(this, arguments);
    if (ST.staging || !W().map) return;
    if (Object.keys(s.flags).filter((k) => k.startsWith('dream:')).length > before) return;
    // 가장 최근에 열린 구간의 밤 (지난 구간의 밤은 지나간 것으로)
    const g = GAPS.filter((x) => x.night && f(x.from + '_done') && !f('brn:' + x.id) && chi(s.ch) <= chi(x.to)).pop();
    const X = g || EXTRA_NIGHTS.find((x) => !f('brn:' + x.id) && x.when(s));
    if (!X) return;
    s.flags['brn:' + X.id] = true;
    await c.narr(U.pick(['불가에 둘러앉은 밤.', '창밖으로 낯선 별이 뜬 밤.', '잠이 오지 않는 밤.', '바람 소리가 큰 밤.']));
    await X.night(c);
  };
  /* 장 안에서도 숨 고르는 밤 (큰일을 치른 날 밤) */
  const EXTRA_NIGHTS = [
    { id: 'n_c3_ship', when: (s) => s.flags.c3_done && s.ch === 'c4' && s.flags.route_lock1, async night(c) {
      await c.say('toria', '배에서 내린 뒤로도 땅이 출렁거려. 찍. 다리가 아직 바다에 있나 봐.', { face: 'shock' });
      await c.say('toria', '…카시안이든, 루드 형이든, 리라든. 같이 온 사람이 있으니까 좋다. 할머니 오두막에선 늘 둘이었잖아. 너랑 나랑.', { face: 'smile' });
    } },
    { id: 'n_c5_broadcast', when: (s) => s.flags.c5_done && s.ch === 'c5', async night(c) {
      await c.say('toria', '「계산에 넣지 않겠다」. 그 목소리 계속 귀에 남아. 낮고, 지쳐 있고.', { face: 'sad' });
      await c.say('toria', '…이상하지. 무서운 말인데, 목소리는 하나도 안 무서웠어. 졸린 사람 목소리였어.', { face: 'normal' });
    } },
    { id: 'n_c11_capsule', when: (s) => s.flags.c11_done && s.ch === 'c11', async night(c) {
      await c.say('toria', '캡슐 안에서 자는 거, 관 같아서 싫다고 했는데… 따뜻하다. 388년 동안 누가 데워 둔 것 같아.', { face: 'normal' });
      if (inParty('lyra')) { await c.say('lyra', '내일이면 엄마를 봐요. …저는 처음이에요. 엄마 얼굴 보는 거.', { face: 'sad' }); await c.say('toria', '찍. 리라, 엄마는 너 본 적 있어. 아기 때. 엄마가 너 안고 노래했어. 그 노래 네가 부르는 거.', { face: 'sad' }); await c.say('lyra', '…그래서 처음부터 알았구나.', { face: 'cry' }); }
      else await c.say('toria', '내일이면 엄마를 봐. …무슨 말부터 할지 정했어? 나는 「찍」부터 할 거야.', { face: 'smile' });
    } },
  ];

  /* ═════════ 타고 넘어가는 구간 · 새 땅의 첫인상 ═════════ */
  const PRE = {
    // 사흘의 뱃길 (블루 → 옐로)
    c4: async (c) => {
      const b = { dawn: 'rud', order: 'cassian', night: 'lyra' }[S().flags.route_lock1 || 'order'];
      ST.join(b);
      await c.fade(true, { sec: 0.5 });
      await c.narr('사흘의 뱃길.');
      if (b === 'rud') { await c.narr('밤마다 레아는 키를 잡고 콧노래를 불렀다. 루드는 갑판에 누워 별을 셌다.'); await c.say('rud', '별이 엄청 많아… 아니, 세는 게 아니래. 보는 거래. 레아 누나가 그랬어. 세면 하나도 안 보인대.', { face: 'smile' }); }
      else if (b === 'cassian') {
        await c.narr('고등어호의 밤. 카시안은 갑판에서 혼자 검을 휘둘렀다. 천 번. 그리고 한 번 더.');
        await c.say('cassian', '스승님은 매일 천 번 휘두르라고 했다. 한 번 더는 내 몫이다. …너도 해 볼래?', { face: 'normal' });
        const k = await c.choice(null, ['같이 휘두른다', '구경한다']);
        if (k === 0) { await c.say('cassian', '…발이 가볍군. 이백 번째부터 흔들린다. 그게 정직한 검이다.', { face: 'smirk' }); c.exp(10); }
        else await c.say('cassian', '구경도 수련이다. 남의 칼을 볼 줄 알아야 제 칼을 안다.', { face: 'normal' });
      } else {
        await c.narr('밀항선 바닥, 화물칸. 리라가 류트를 무릎에 올리고 바다에게 노래했다.');
        await c.say('lyra', '이 노래요? 누가 가르쳐 준 게 아니에요. 그냥… 처음부터 알았어요.', { face: 'closed' });
        await c.say('toria', '찍… 할머니 자장가랑 똑같아. 가사만 달라.', { face: 'shock' });
        await c.say('lyra', '…그래요? 할머니도 이 노래를?', { face: 'shock' });
        c.flag('br3_song');
      }
      await c.narr('사흘째 아침. 수평선이 금빛으로 끓었다.');
      await c.fade(false, { sec: 0.6 });
    },
    // 구름고래의 등 (퍼플 → 무지개 섬)
    c6: async (c) => {
      await c.fade(true, { sec: 0.5 });
      await c.narr('구름고래 누베의 등은 축축하고 폭신했다. 발밑으로 대륙이 천천히 지나갔다.');
      await c.narr('초록 들판, 붉은 산, 파란 항구, 금빛 사막, 보랏빛 숲. 지나온 길이 한 장의 지도처럼 펼쳐져 있었다.');
      await c.say('toria', '찍…! 높아! 무서워! …근데 예뻐. 우리 저기 다 걸어왔어? 저 끝에서 여기까지?', { face: 'shock' });
      await c.say('nube', '우우웅. 천 년 전에도 흰빛을 태웠소. 금빛 머리 소년이었지. 그 아이도 아래를 보며 그렇게 물었소.', { face: 'normal' });
      const k = await c.choice(null, ['그 소년은 어떻게 됐어?', '아래를 내려다본다']);
      if (k === 0) await c.say('nube', '…빛을 나눴소. 다 나눴소. 그다음은 고래도 모르오. 고래는 위만 알지. 우웅.', { face: 'sad' });
      else await c.narr('대륙 한가운데, 탑들이 바늘처럼 서 있었다. 탑 끝마다 실 같은 빛이 하늘로 올라가고 있었다. 모두 한 곳을 향해.');
      await c.say('nube', '저기 무지개 섬이오. 천년제요. 우우웅. 꽉 잡으시오.', { face: 'smile' });
      await c.fade(false, { sec: 0.6 });
    },
    // 빛의 사다리 (정거장 → 아스트라)
    c12: async (c) => {
      await c.fade(true, { sec: 0.5 });
      await c.narr('빛의 사다리는 계단이 아니라 노래 같았다. 한 칸 오를 때마다 누군가의 목소리가 들렸다.');
      const V = [['met:marien', '「…밥은 잘 챙겨 먹나 몰라.」 — 그린의 가게 아줌마'], ['met:volkan', '「레드 사람은 인사를 길게 안 한다. 그러니까 짧게. 다녀와라.」'], ['met:luce', '「등대는 돌아오는 배를 위해 켜는 거예요.」'], ['met:goldy', '「빚은 다 갚고 가라, 흰빛. 살아서.」'], ['met:lumie', '「기도는 이제 당신을 지키는 데 쓸게요.」'], ['met:bolt', '「…틀려도 된다. 틀리면 고치면 된다.」'], ['met:pyros', '「착륙 장치는 만들었다! 아마!」']];
      for (const [k, t] of V) if (f(k)) await c.narr(t);
      await c.say('toria', '찍… 다들 목소리가 들려. 이상하지. 멀어질수록 더 잘 들려.', { face: 'cry' });
      await c.fade(false, { sec: 0.6 });
    },
  };
  const ARRIVE = {
    c2: '다리를 건너자 공기가 달라졌다. 쇠 냄새, 숯 냄새. 발바닥 아래 땅이 미지근했다. 멀리서 망치 소리가 심장처럼 울렸다.',
    c3: '소금 냄새가 먼저 왔다. 갈매기 울음, 밧줄 삐걱이는 소리. 항구 위로 커다란 도서관 지붕이 책장처럼 층층이 솟아 있었다.',
    c4: '발이 모래에 푹 빠졌다. 햇볕이 동전처럼 쨍그랑 울릴 것 같은 도시. 모든 간판에 숫자가 적혀 있었다.',
    c5: '숲에 들어서자 하늘이 주황에서 보라로 기울다 멈췄다. 해가 지려다 마음을 바꾼 것처럼. 나뭇잎마다 저녁빛이 고여 있었다.',
    c7: '고개를 넘자 바람이 이빨을 드러냈다. 눈 덮인 지붕들 사이로 대성당 종탑이 기도하는 손처럼 솟아 있었다. 창마다 작은 등이 켜져 있었다 — 기도등.',
    c8: '어느 순간부터 풀이 잿빛이었다. 하늘도, 강물도, 지나가는 사람의 볼도. 토리아의 주황 꼬리만 이 땅에서 혼자 색이었다.',
    c9: '해가 등 뒤로 넘어가더니 다시는 앞으로 오지 않았다. 별이 떴다. 그리고 지지 않았다. 거리마다 등불이 꽃처럼 피어 있었다.',
    c10: '쾅! 어디선가 무언가가 터졌다. 아무도 놀라지 않았다. 곶의 지붕마다 그을음이 있었고, 그을음마다 날짜가 적혀 있었다 — 「실험 312번」.',
    c11: '돌아보니 무한호의 둥근 창 너머로 대륙이 있었다. 둥글었다. 그리고 그 위, 아주 가까이 — 검은 점. 이제는 점이 아니라 구멍이었다.',
  };
  const set0 = ST.setChapter;
  ST.setChapter = async function (c, id) {
    if (PRE[id] && !f('brp:' + id)) { S().flags['brp:' + id] = true; try { await PRE[id](c); } catch (e) { console.error('[bridge pre]', e); } }
    await set0.apply(this, arguments);
    if (ARRIVE[id] && !f('bra:' + id)) { S().flags['bra:' + id] = true; await c.narr(ARRIVE[id]); }
  };

  /* ═════════ 길에서 받은 것을 다음 장의 사람에게 ═════════ */
  ST.hookTalk('b_lib', 'octavio', (s) => !!(s.inv.br_log && s.flags.c3_octavio && !s.flags.br2_read), async (c, n) => {
    c.lock(true);
    await c.say(n, '음? 그 냄새. 바닷물에 젖었다 마른 종이 냄새로군. 어디 보세.', { face: 'normal' });
    await c.narr('관장의 다리 여덟 개가 동시에 책장을 넘겼다. 그리고 한 다리가 멈췄다.');
    await c.say(n, '「금서고 셋째 서가」. …그 손님이 물은 서가가 지금 네가 연 바로 그 서가다. 17년 전, 나는 그 손님에게 대답하지 않았지.', { face: 'sad' });
    await c.say(n, '선장도 대답하지 않았고. 우리는 모두 대답하지 않았다. 그래서 그 사람이 혼자 하늘로 갔는지도 모르지.', { face: 'closed' });
    await c.say(n, '이 일지는 도서관에 두고 가게. 「대답하지 않은 사람들」 서가에. …내가 처음 만드는 서가다.', { face: 'normal' });
    delete S().inv.br_log; c.flag('br2_read'); c.exp(40);
    c.lock(false);
    c.journal('옥타비오 관장에게 젖은 항해 일지를 건넸다. 관장은 「대답하지 않은 사람들」 서가를 만들겠다고 했다.');
  });
  ST.hookTalk('c_lab', 'pyros', (s) => !!(s.flags.br9_msg && s.flags.c10_pyros && !s.flags.br9_told && !s.flags.c10_launch), async (c, n) => {
    c.lock(true);
    await c.say(n, '뭐? 파울? 파울을 만났다고? 다리 하나 없는 그 바보?', { face: 'shock' });
    await c.say(null, '「바보야, 착륙 장치부터 만들어.」 그리고 「다리는 안 아프다」고 했다고 전했다.', { style: 'sys' });
    await c.say(n, '……착륙 장치. 하. 하하. 40년 동안 그 말 들을까 봐 안 만들었어. 만들면 다시 누굴 태워야 하니까.', { face: 'cry' });
    await c.say(n, '다리는 아플 거야. 비 오는 날마다. 거짓말쟁이. …봄바! 착륙 장치 설계도 꺼내! 서랍 맨 밑! 40년 묵은 거!', { face: 'angry' });
    await c.say('bomba', '박사님, 그 서랍 열면 폭발한다고 하셨잖아요!', { face: 'shock' });
    await c.say(n, '그건 내 마음이 폭발한다는 뜻이었다!', { face: 'happy' });
    c.flag('br9_told'); c.exp(60);
    c.lock(false);
    c.journal('피로스에게 비행사 파울의 말을 전했다. 피로스가 40년 묵은 착륙 장치 설계도를 꺼냈다.');
  });

  ST.BRIDGES = { GAPS, GAP, PRE, ARRIVE, EXTRA_NIGHTS, openGap };
})();
