/* 사이 막 넷 · 다섯 · 여섯 · 일곱 — 무지개→화이트 「흰 머리 한 가닥」 · 화이트→그레이 「얼음 관」 · 그레이→블랙 「세 개의 등불」 · 블랙→곶 「아흔 날」
   · 흰 머리 한 가닥: 천년제 뒤, 대륙이 너를 알아본다. 손을 내미는 사람들(하나만 · 끝까지 · 성녀에게) → 지워진 그라우스의 기사들 → 고개의 백은 기사 에델
   · 얼음 관: 얼음 창고에서 나온 관을 따라 서쪽으로. 이음매 셋 → 중계소지기 러스크(잠근다 · 베낀다 · 새게 둔다) → 감시기
   · 세 개의 등불: 밤의 땅 문턱의 등불 셋. 등불마다 묻는다 — 누구를 위해 · 두고 온 것 · 돌아갈 곳. 마지막 등불은 리라가 묻는다
   · 아흔 날: 탑마다 카이론의 목소리 — 곶 봉쇄. 빛 그물을 넘고, 세린이 17년 전 새긴 이정표 앞에 리라와 선다
   그리고 사이 막 일곱의 고른 것이 다음 장 사람들의 말 · 소문 · 진실 · 결말의 그 뒤로 (맨 아래) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TS = G.tiles.TS, E = G.ent;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!(G.state && G.state.flags[k]);
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '언니' : '누나');
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };
  const K = ST.actKit;
  const { comes, goes, tori } = K;
  const knight = (o) => G.cast.folk('knight', o || {});
  const RL = () => S().flags.route_lock || ST.route();

  /* ── 물건 · 진실 ── */
  item('a7_flow', { type: 'key', name: '중계소 흐름 기록', desc: '설산과 그레이 사이 중계소 계기판을 베낀 종이. 볼트에게 보여 주자.', read: '「설산관 → 중계소 → 천년성. 흐름: 정상. 하루 손실 없음.」\n「손실 없음」 옆에 러스크의 글씨 — 「사람 쪽은 안 셈.」' });
  D.TRUTHS.t_flow = { name: '관의 끝', hint: '설산과 그레이 사이, 관을 지키는 중계소.',
    text: '기도등의 빛은 얼음 창고에 모였다가, 눈 밑의 관을 타고 중계소로, 중계소에서 천년성으로, 천년성에서 하늘로 올라갔다. 성녀의 기도는 공짜가 아니었다. 그 값은 관을 타고 올라갔다.',
    long: ['중계소 계기판의 흐름 기록. 「설산관 → 중계소 → 천년성」.', '천년성 칸에서 선이 하나 더 뻗어 있다. 끝에 적힌 글자는 「상(上)」. 하늘.', '설계자 칸: 「볼트 · 983년」. 그 아래 승인 칸: 「카이론」.', '[r]성녀의 기도는 공짜가 아니었다. 그 값은 관을 타고 하늘로 올라갔다.[/]'] };

  /* ═════════ 사이 막 넷 — 흰 머리 한 가닥 (무지개 → 퍼플 → 화이트) ═════════ */
  const nubeAt = () => { const sp = (ST.people.world || []).find((x) => x.id === 'nube' && x.x !== OW.towns.purple.x + 16); return sp ? [sp.x, sp.y] : null; };
  const regHere = () => { const Wd = W(), p = Wd.player, m = Wd.map; if (!m || !p) return null; if (!m.overworld) { const lw = S().lastWorld; return lw && lw.x != null ? OW.regionOf(Math.floor(lw.x), Math.floor(lw.y)) : null; } return OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)); };
  const MARK = () => knight({ hc: '#2a2a3a', tc: '#6a5a5a', trim: '#a88a6a' });
  ST.act({
    id: 'a6', from: 'c6', to: 'c7', next: 'white', A: 'purple', B: 'white', gap: 'g6',
    title: '흰 머리 한 가닥', closed: '찍… 설산은 조금 이따가. 할 일이 남았어.',
    openMsg: '사이 막 「흰 머리 한 가닥」 — 설산으로 가는 고개가 열렸다', pad: 2,
    spots: { remnant: { frac: 0.4, kind: 'camp' }, pass: { frac: 0.95, kind: 'road' } },
    steps: [
      { id: 'whale', kind: 'cond', done: () => { const r = regHere(); return !!r && r !== 'rainbow'; },
        goalFn: () => { const a = nubeAt(); return a ? { text: '구름고래 누베를 타고 퍼플로 내려가자.', map: 'world', x: a[0], y: a[1] } : null; }, goal: '구름고래를 타고 땅으로 내려가자.' },
      { id: 'crowd', kind: 'auto', delay: 4, inTown: true, region: ['purple'], goal: '북쪽 설산 쪽으로 걷자.',
        async run(c) {
          const p = W().player;
          const mom = await comes(c, { look: G.cast.folk('farmerw', { tc: '#9a8ab8' }), name: '아이 엄마' }, 40);
          if (!mom) return false;
          const kid = c.spawn({ look: G.cast.folk('kid', { tc: '#b8c0d0', skin: 'pale' }), name: '아이', x: mom.x + 12, y: mom.y + 4, dir: U.dir4(p.x - mom.x, p.y - mom.y) });
          await c.chapter('사이 막', '흰 머리 한 가닥', '대륙이 너를 보았다. 이제 사람들은 네 이름 대신 네 머리칼을 부른다.');
          await c.narr('사람들이 너를 알아보았다. 천년제에서 돌아온 사람, 소문을 듣고 온 사람. 손끝이 조금씩 비치는 사람들.');
          await c.say(mom, '저… 천년제의 흰빛님이시죠? 그 머리. 소문대로네요.', { face: 'shock' });
          await c.say(mom, '우리 애 손끝이요. 한 번만… 한 번만 잡아 주시면 안 될까요.', { face: 'sad' });
          const old = await comes(c, { look: G.cast.folk('oldm', { tc: '#7a6a5a' }), name: '노인' }, 30);
          if (old) await c.say(old, '나도. 나도 좀. 늙은이는 나중이라도 괜찮으니.', { face: 'sad' });
          await tori(c, '찍… 사람들이 계속 와. 저쪽에도.', 'shock');
          const k = await c.choice('손을 내밀면 빛이 흘러갈 것이다. 아이 하나라면 괜찮다. 그런데 줄이 끝나지 않는다.', [
            { t: '아이의 손을 잡는다 — 한 사람만', sub: '나눈다. 다 주지는 않는다.' },
            { t: '줄의 끝까지 손을 잡는다', sub: '모두에게. 내가 비어도.' },
            { t: '「설산의 성녀에게 같이 가요.」', sub: '나 혼자 해결할 일이 아니다.' },
          ]);
          const s = S(), d = G.st.derive(s);
          if (k === 0) {
            c.flag('a6_one'); s.shareCount = (s.shareCount || 0) + 1; s.mp = Math.max(0, s.mp - Math.round(d.mpMax * 0.3));
            c.sfx('heal'); G.fx.glow(kid.x, kid.y - 8, '#fff4d0', 12);
            await c.narr('아이 손끝의 유리 같은 투명함이 손톱만큼 물러났다. 아이가 손가락을 꼼지락거렸다.');
            await c.say(mom, '…따뜻해요. 고맙습니다. 정말로.', { face: 'cry' });
            if (old) await c.say(old, '…그래, 아이가 먼저지. 그게 맞아.', { face: 'smile' });
            await tori(c, '잘했어. 하나만. 할머니가 그랬지. 필요한 만큼만.', 'smile');
          } else if (k === 1) {
            c.flag('a6_all'); s.shareCount = (s.shareCount || 0) + 2; c.abyss('a6_all');
            s.mp = 0; s.hp = Math.max(1, Math.round(s.hp * 0.3));
            c.sfx('white'); c.flash('#ffffff', 0.5);
            await c.narr('손 하나, 또 하나. 줄은 줄지 않았다. 어느 순간부터 손이 떨렸다. 마지막 노인의 손을 놓았을 때, 무릎이 꺾였다.');
            if (old) await c.say(old, '…이보게. 이보게, 괜찮나?', { face: 'shock' });
            await tori(c, '바보야! 다 주면 너는? 세린 언니처럼 될 거야?', 'cry');
            await c.narr('사람들이 물러섰다. 고맙다는 말과 미안하다는 말이 섞여 들렸다.');
          } else {
            c.flag('a6_lead');
            await c.narr('사람들이 서로를 보았다. 그리고 한 사람씩 짐을 챙겼다.');
            await c.say(mom, '…성녀님은 공짜로 고쳐 주신대요. 같이 가요. 흰빛님이 앞장서 주시면.', { face: 'smile' });
            await tori(c, '찍. 줄이 길어졌어. 우리 뒤로.', 'shock');
          }
          goes(c, mom); goes(c, kid); if (old) goes(c, old);
          c.journal(k === 0 ? '퍼플 어귀에서 사람들이 손을 내밀었다. 아이 하나의 손만 잡았다. 필요한 만큼만.' : k === 1 ? '퍼플 어귀에서 줄의 끝까지 손을 잡았다. 무릎이 꺾였다. 토리아가 울었다.' : '퍼플 어귀의 사람들과 함께 설산의 성녀에게 가기로 했다.');
        } },
      { id: 'remnant', kind: 'reach', at: 'remnant', r: 7, goal: '설산 가는 길. 길가 야영지에 기사들이 모여 있다.',
        wait: [{ name: '부관 마르크', look: MARK(), dx: 0, dy: -1, dir: 'down' }, { name: '그라우스의 기사', look: knight(), dx: -1, dy: 1, dir: 'right' }, { name: '그라우스의 기사', look: knight(), dx: 1, dy: 1, dir: 'left' }],
        async run(c, X) {
          const mk = X.npc(0);
          c.music('danger');
          c.faceEach('hero', mk);
          await c.say(mk, '거기 서라, 흰빛.', { face: 'angry' });
          await c.say(mk, '부단장님은 장부에서 지워졌다. 챔피언 손가락 하나에. 그 자리에 네가 서 있었지.', { face: 'angry' });
          await c.say(mk, '너를 데려가면 챔피언께서 부단장님을 돌려주실지도 모른다. 장부의 오류를 바로잡듯이.', { face: 'sad' });
          const rl = RL();
          if (rl === 'dawn') { await c.say('lea', '그라우스가 돌아오길 바라는 건 너희뿐이야. 광부들은 아니고.', { face: 'angry' }); await c.say('lea', '뒤쪽 놈들은 내가 맡을게. 흰빛, 앞은 네 거야!', { face: 'smirk' }); }
          else if (rl === 'order') { await c.say('cassian', '마르크. 방위령 제1조. 흰빛에 관한 판단은 챔피언께 올린다. 네 칼은 거기 없다.', { face: 'normal' }); await c.say(mk, '방위령? 부단장님을 지운 게 그 방위령이다!', { face: 'angry' }); await c.say('cassian', '…나머지 기사들은 내가 데려가지. 마르크는 네게 맡긴다.', { face: 'closed' }); }
          else { await c.say('lyra', '…쉿. 다들 많이 피곤해 보여요. 노래 하나 들을래요?', { face: 'closed' }); c.sfx('magic'); await c.narr('리라의 류트가 울렸다. 기사 몇이 꾸벅 졸기 시작했다. 마르크는 이를 악물고 버텼다.'); }
          const k = await c.choice('마르크의 칼끝이 떨린다.', [{ t: '「나는 그를 지우지 않았어.」' }, { t: '「그라우스를 돌려받고 싶으면 같이 따지러 가자. 천년성에.」' }, { t: '말없이 검을 뽑는다' }]);
          S().flags.a6_mk = k;
          if (k === 0) await c.say(mk, '알아. …알아도, 미워할 사람이 필요해.', { face: 'sad' });
          else if (k === 1) { c.flag('a6_mk_offer'); await c.say(mk, '…같이? 하. 하하. 그 말을 부단장님이 들으셨으면.', { face: 'sad' }); await c.narr('기사 하나가 칼을 내렸다. 마르크만 칼을 거두지 않았다.'); }
          else await c.say(mk, '그래. 그게 차라리 쉽지.', { face: 'angry' });
        },
        fight: () => {
          const rl = RL(), n = Math.max(0, 2 - (rl !== 'dawn' ? 1 : 0) - (f('a6_mk_offer') ? 1 : 0));
          const out = [{ type: 'knight', from: 0, tier: 5, hpMul: 2, name: '부관 마르크' }];
          for (let i = 0; i < n; i++) out.push({ type: 'knight', from: i + 1, tier: 5, hpMul: 0.9, name: '그라우스의 기사' });
          return out;
        },
        fightMsg: '그라우스의 기사들이 칼을 뽑았다!',
        fightGoal: '부관 마르크를 물리치자.',
        again: '마르크가 다시 길을 막는다!',
        async after(c) {
          const p = W().player;
          const mk = c.spawn({ name: '부관 마르크', look: MARK(), x: p.x + 30, y: p.y + 4, dir: 'left' });
          await c.wait(0.4);
          await c.say(mk, '…부단장님은 숫자밖에 몰랐다. 그래도 우리 봉급날은 한 번도 안 틀렸어. 그게 다였는데.', { face: 'sad' });
          if (f('a6_mk_offer')) { c.flag('a6_mk_ally'); await c.say(mk, '천년성에 따지러 간다라… 그날이 오면 불러라. 칼 한 자루는 보태지.', { face: 'closed' }); }
          await c.say(mk, '가라. 설산엔 백은 기사가 있다. 성녀님 땅에 칼 든 자를 들이지 않는다지. 우리보다 셀 거다.', { face: 'closed' });
          goes(c, mk, 36);
          c.exp(80);
          c.journal('그라우스의 부관 마르크가 길을 막았다. 「미워할 사람이 필요해.」 ' + (f('a6_mk_ally') ? '그날이 오면 칼 한 자루를 보태겠다고 했다.' : '그는 혼자 남쪽으로 걸어갔다.'));
        } },
      { id: 'edel', kind: 'reach', at: 'pass', r: 6, goal: '북쪽, 설산 고개 아래로.',
        wait: [{ cid: 'edel', dx: 0, dy: -1, dir: 'down' }],
        async run(c, X) {
          const e = X.npc(0);
          c.music('white');
          c.faceEach('hero', e);
          await c.narr('바위 고개 아래, 은빛 갑옷 하나가 눈발 속에 서 있었다. 투구의 눈구멍 너머가 보이지 않았다.');
          await c.say(e, '…성녀님의 땅이다. 병든 자는 들어오라. 칼 든 자는 칼을 두고 오라.', { face: 'normal' });
          await tori(c, '찍… 갑옷이 말을 해. 안에 사람 있는 거 맞아?', 'shock');
          await c.say(e, '흰빛. 천년제 소식은 들었다. 성녀님은 너를 「계산 밖」이라 부르셨다. …나는 계산 안의 사람이다.', { face: 'closed' });
          if (f('a6_lead')) await c.say(e, '…뒤에 사람들을 데려왔군. 병든 사람들을. 그 줄 끝에 서는 칼잡이는 처음 본다.', { face: 'normal' });
          if (f('a6_all')) await c.say(e, '얼굴이 하얗다. 빛을 너무 많이 나눴군. …성녀님과 같은 얼굴이다.', { face: 'sad' });
          const k = await c.choice(null, [{ t: '검을 내려놓는다', sub: '성녀의 규칙을 따른다.' }, { t: '「이 검은 사람을 지키려고 들어요.」', sub: '내려놓지 않는다.' }, { t: '「투구 속 얼굴을 보여 줘요.」' }]);
          if (k === 0) { c.flag('a6_edel_trust'); c.bond('edel', 1); await c.narr('검을 눈 위에 내려놓았다. 에델이 한참 그것을 내려다보았다.'); await c.say(e, '…두고 오라 했지, 버리라고는 안 했다. 들고 가라. 다만 성녀님 앞에선 칼집에 넣어라.', { face: 'normal' }); }
          else if (k === 1) { c.flag('a6_edel_word'); c.bond('edel', 1); await c.say(e, '지키는 칼. …나도 그렇게 믿고 이 칼을 들었다. 지금은… 모르겠다.', { face: 'sad' }); }
          else { c.flag('a6_edel_face'); await c.say(e, '…투구를 벗을 이유가 없다. 아직은.', { face: 'closed' }); await tori(c, '찍. 「아직은」이래. 벗을 날이 있다는 거야.', 'smirk'); }
          await c.say(e, '바위는 그 장갑으로 치워라. 나는 길을 열어 주지는 않는다. 막지도 않겠다.', { face: 'normal' });
          goes(c, e, 34);
          c.exp(30);
          c.journal('설산 고개 아래서 백은 기사 에델을 만났다. 「칼 든 자는 칼을 두고 오라.」 투구 속 얼굴은 보이지 않았다.');
        } },
    ],
  });

  /* ═════════ 사이 막 다섯 — 얼음 관 (화이트 → 그레이) ═════════ */
  const RUSK = () => G.cast.folk('mech', { hc: '#8a8a8a', tc: '#6a6a74', beard: '#9a9a9a' });
  const A7 = ST.act({
    id: 'a7', from: 'c7', to: 'c8', next: 'gray', A: 'white', B: 'gray', gap: 'g7',
    title: '얼음 관', closed: '찍. 관을 끝까지 따라가 보자. 그레이는 그다음이야.',
    openMsg: '사이 막 「얼음 관」 — 그레이로 가는 길이 열렸다', pad: 0,
    spots: { j1: { frac: 0.05, kind: 'road' }, j2: { frac: 0.3, kind: 'road' }, j3: { frac: 0.55, kind: 'road' }, relay: { frac: 0.85, kind: 'relay', alt: ['mast'], off: [3, 4, 5, 6, 7, 8, 9, 10], roadDeco: ['PILLAR', 'CRATE', 'BARREL'] } },
    steps: [
      { id: 'frost', kind: 'auto', delay: 5, goal: '서쪽, 잿빛 땅 쪽으로 걷자.',
        async run(c) {
          await c.chapter('사이 막', '얼음 관', '기도등에서 걷힌 빛은 어디로 가는가. 눈 밑으로, 서쪽으로.');
          await c.narr('눈밭 아래에서 낮은 소리가 났다. 윙윙. 탑 소리와 닮았지만 더 낮고, 더 길었다.');
          await tori(c, '찍. 여기 눈이 길쭉하게 녹아 있어. 한 줄로. 서쪽으로.', 'think');
          await c.narr('눈을 헤치자 서리 낀 쇠관이 드러났다. 손을 대니 미지근했다. 안에서 무언가 흐르고 있었다.');
          if (f('c7_store_dawn')) await tori(c, '얼음 창고를 부쉈는데도… 관은 아직 살아 있어. 다른 데서도 빛이 모이나 봐.', 'sad');
          else if (f('c7_store_order')) await tori(c, '관을 막았잖아. 근데 이건 다른 관이야. 막힌 데를 돌아서 가.', 'shock');
          else if (f('c7_store_night')) await tori(c, '표시해 둔 관이야. 봐, 까만 깃털이 꽂혀 있어.', 'normal');
          await tori(c, '기도등에서 나온 빛이 이리로 흘러가. 따라가 보자. 볼트라는 사람한테 가는 길이랑 같은 쪽이야.', 'normal');
          c.journal('설산의 눈 밑에서 서쪽으로 뻗은 쇠관을 찾았다. 기도등의 빛이 그 안으로 흐른다.');
        } },
      { id: 'joints', kind: 'spots', spots: ['j1', 'j2', 'j3'], goal: '눈 밑의 관을 따라가며 이음매를 살피자. (반짝이는 곳)',
        spotText: {
          j1: { verb: '이음매를 살핀다', async run(c) { await c.narr('관 이음매의 쇠판. 「설산관 · 일곱째 이음매 · 흐름: 서 → 중계소 → 천년성」'); await c.narr('그 밑에 손톱으로 긁은 글씨. 「따뜻하다. 사람 손처럼.」'); } },
          j2: { verb: '이음매를 살핀다', async run(c) { await c.narr('「설계 · 볼트 · 983년」. 설계자 이름 옆에 누군가 분필로 작은 꽃을 그려 두었다.'); await tori(c, '분필 꽃. 그레이 사람들이 그린대. 색이 없어서.', 'sad'); } },
          j3: { verb: '터진 이음매를 본다', async run(c) { await c.narr('이음매 하나가 터져 있었다. 새어 나온 빛이 눈 위에 고여, 그 자리에만 풀이 자랐다. 한겨울에.'); await tori(c, '…빛은 원래 땅에 있어야 하는 거구나.', 'normal'); } },
        },
        async run(c) { await tori(c, '관이 서쪽으로 계속 가. 저 앞에 탑 같은 게 보여.', 'think'); c.exp(20); } },
      { id: 'relay', kind: 'reach', at: 'relay', r: 7, goal: '관이 모이는 중계소로.',
        wait: [{ name: '중계소지기 러스크', look: RUSK(), dx: 0, dy: 2, dir: 'down', stay: true }],
        async run(c, X) {
          const r = X.npc(0);
          c.faceEach('hero', r);
          await c.say(r, '…손님? 이 중계소에 손님이라니. 처음인가.', { face: 'shock' });
          await c.say(r, '러스크다. 그레이 사람. 이 관이 막히지 않게 지키는 게 일이지. 눈이 오면 녹이고, 얼면 두드리고.', { face: 'normal' });
          await c.say(r, '설산의 빛이 여기 모여서 천년성으로 올라가. 천년성에서 다시 하늘로. …그건 볼트 영감한테 들은 거고. 나는 관만 봐.', { face: 'closed' });
          const k = await c.choice('계기판 바늘이 떨린다. 「흐름: 정상」. 눈 밑의 관이 웅웅 운다.', [
            { t: '밸브를 잠근다', tag: 'dawn', sub: '여기서 끊는다. 설산의 빛은 설산에.' },
            { t: '흐름 기록을 베껴 간다', tag: 'order', sub: '볼트에게 보여 줄 증거.' },
            { t: '새는 이음매는 그대로 둔다', tag: 'night', sub: '아무도 모르게, 조금씩 땅으로.' },
          ]);
          const tag = ['dawn', 'order', 'night'][k];
          c.route(tag, 1); S().flags.a7_way = tag;
          if (k === 0) {
            c.flag('a7_valve'); c.sfx('switch');
            await c.narr('바늘이 바닥으로 떨어졌다. 관의 울음이 멎었다. 그리고 — 경보가 울렸다.');
            await c.say(r, '…관 끝에 감시기가 있어. 막히면 깨어나. 영감이 그렇게 만들었지. 꼼꼼한 영감.', { face: 'shock' });
          } else if (k === 1) {
            c.flag('a7_read'); await c.getItem('a7_flow'); c.truth('t_flow');
            for (const l of D.TRUTHS.t_flow.long) await c.narr(l);
            await c.say(r, '그 기록 볼트 영감한테 보여 줘. 영감 얼굴이 어떻게 변하는지 나도 보고 싶군.', { face: 'smirk' });
            c.sfx('buzz');
            await c.narr('계기판 뒤에서 무언가 딸깍 켜졌다. 낯선 사람이 오래 서 있으면 깨어나는 감시기.');
          } else {
            c.flag('a7_leak');
            await c.say(r, '…그거 내가 오래 하던 짓이야. 이음매 몇 개는 일부러 안 고쳤지. 그 밑에만 풀이 자라. 너도 봤지?', { face: 'smile' });
            c.sfx('buzz');
            await c.say(r, '쉿. 감시기가 깼다. 나 말고, 너 때문에. 낯선 빛이라서.', { face: 'shock' });
          }
        },
        fight: () => [{ type: 'drone', dx: -3, dy: -1, tier: 6 }, { type: 'drone', dx: 3, dy: -1, tier: 6 }, { type: 'drone', dx: 0, dy: 4, tier: 6 }, { type: 'turret', dx: -3, dy: 3, tier: 6, name: '관 감시기' }],
        fightMsg: '중계소의 감시기가 깨어났다!',
        fightGoal: '중계소의 감시기를 멈추자.',
        again: '감시기가 다시 깨어난다!',
        async after(c, X) {
          const r = X.npc(0);
          c.music('gray');
          await c.say(r, '…감시기를 맨손으로. 하. 영감이 보면 좋아하겠군. 고칠 거리가 생겼다고.', { face: 'smile' });
          await c.say(r, '볼트 영감한테 가. 이 관을 그린 사람. 말을 반만 하지만, 그 반은 다 진짜야.', { face: 'normal' });
          await c.say(r, '그리고… 영감 앞에서 아내 이야기는 먼저 꺼내지 마. 꺼내야 할 때가 오면, 영감이 먼저 꺼낼 거야.', { face: 'sad' });
          await tori(c, '찍. 색이 빠지기 시작해. 저 앞은 다 회색이야.', 'sad');
          c.exp(60);
          c.journal(f('a7_valve') ? '중계소의 밸브를 잠갔다. 설산의 빛은 설산에. 러스크: 「볼트 영감한테 가.」' : f('a7_read') ? '중계소의 흐름 기록을 베꼈다. 기도등의 빛은 관을 타고 하늘로 올라간다.' : '중계소의 새는 이음매를 그대로 두었다. 그 밑에만 풀이 자란다.');
        } },
    ],
  });
  void A7;

  /* ═════════ 사이 막 여섯 — 세 개의 등불 (그레이 → 블랙) ═════════ */
  class Lamp extends E.Ent {
    constructor(o) { super(Object.assign({ kind: 'actlamp', solid: true, bw: 8, bh: 6 }, o)); this.glowR = 0; this.glowY = 18; }
    blockBox() { return { x: this.x - 4, y: this.y - 6, w: 8, h: 6 }; }
    update(dt) { this.t += dt; const lit = f(this.flagKey); this.glowR = lit ? 58 + Math.sin(this.t * 6) * 4 : 0; if (lit && Math.random() < dt * 6) G.fx.part({ x: this.x + (Math.random() - 0.5) * 3, y: this.y - 22, z: 2, vz: 14, g: 0, life: 0.6, col: '#ffe8a8', size: 1, glow: true }); }
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy), lit = f(this.flagKey);
      g.fillStyle = '#2a2438'; g.fillRect(x - 1, y - 18, 3, 18); g.fillRect(x - 4, y - 2, 9, 2);
      g.fillStyle = '#4a4058'; g.fillRect(x - 4, y - 26, 9, 8); g.fillStyle = '#6a5a7a'; g.fillRect(x - 5, y - 27, 11, 2);
      g.fillStyle = lit ? '#ffd86a' : '#1a1622'; g.fillRect(x - 2, y - 24, 5, 5);
      if (lit) { const fl = Math.floor(this.t * 8) % 2; g.fillStyle = '#fff8d0'; g.fillRect(x, y - 23 - fl, 1, 2 + fl); }
    }
  }
  ST.onMap('world', (m, Wd) => { for (const k of ['l1', 'l2', 'l3']) { const a = ST.actSpot('a8', k); if (a) Wd.add(new Lamp({ x: a.x * TS + 8, y: (a.y - 1) * TS + 14, flagKey: 'a8_lit_' + k })); } });
  async function light(c, k) {
    c.flag('a8_lit_' + k); c.sfx('lamp');
    const a = ST.actSpot('a8', k); if (a) G.fx.glow(a.x * TS + 8, (a.y - 1) * TS - 8, '#ffe8a8', 16);
    await c.wait(0.4);
  }
  const A8 = ST.act({
    id: 'a8', from: 'c8', to: 'c9', next: 'black', A: 'gray', B: 'black', gap: 'g8',
    title: '세 개의 등불', closed: '찍… 등불을 안 켜고 가면 그림자들이 침입자로 본대. 리라가 그랬어.',
    openMsg: '사이 막 「세 개의 등불」 — 밤의 땅으로 가는 문턱이 열렸다',
    spots: { l1: { frac: 0.7, kind: 'shrine' }, l2: { frac: 0.82, kind: 'shrine' }, l3: { frac: 0.94, kind: 'shrine' } },
    steps: [
      { id: 'lyra', kind: 'auto', delay: 5, goal: '동쪽 끝, 밤의 땅 쪽으로 걷자.',
        async run(c) {
          const ly = await comes(c, { cid: 'lyra' }, 46);
          if (!ly) return false;
          await c.chapter('사이 막', '세 개의 등불', '해가 지지 않는 땅의 문턱. 들어가려면 불을 켜야 한다 — 빛이 아니라 약속으로.');
          await c.say(ly, '또 만났네요. 이번엔 우연 아니에요. 기다렸어요.', { face: 'smile' });
          await c.say(ly, '밤의 땅은 처음이죠? 문턱에 등불 셋이 있어요. 옛날부터. 그걸 켜고 가야 그림자들이 손님으로 봐 줘요.', { face: 'normal' });
          await c.say(ly, '안 켜고 가면… 침입자로 봐요. 그건 좀 귀찮아요.', { face: 'smirk' });
          await tori(c, '찍. 불은 어떻게 켜? 화염구로?', 'think');
          await c.say(ly, '아뇨. 등불마다 하나씩 물어요. 대답하면 켜져요. 거짓말하면… 안 켜지고요.', { face: 'closed' });
          await c.say(ly, '저는 먼저 가 있을게요. 세 번째 등불 앞에서 노래하고 있을게요.', { face: 'smile' });
          goes(c, ly, 52);
          c.journal('리라가 기다리고 있었다. 밤의 땅 문턱의 등불 셋을 켜야 그림자들이 손님으로 본다고 한다.');
        } },
      { id: 'l1', kind: 'reach', at: 'l1', r: 4, goal: '첫 번째 등불.',
        async run(c) {
          await c.narr('돌 받침 위에 꺼진 등불. 유리 속에 심지만 남아 있었다. 가까이 가자 등불 속에서 목소리가 났다. 오래된, 누구의 것도 아닌 목소리.');
          await c.narr('「누구를 위해 불을 켜느냐.」');
          const k = await c.choice(null, ['「나를 위해.」', '「엄마를 위해.」', '「아직 만나지 못한 사람을 위해.」']);
          S().flags.a8_q1 = k;
          await light(c, 'l1');
          await c.narr(['불꽃이 작게, 그러나 똑바로 섰다.', '불꽃이 하얗게 흔들렸다. 아주 먼 데를 향해 기우는 것처럼.', '불꽃이 한참 망설이다 켜졌다. 누군가를 기다리는 사람처럼.'][k]);
          await tori(c, '찍! 켜졌다! 거짓말 아니었나 봐.', 'happy');
        } },
      { id: 'l2', kind: 'reach', at: 'l2', r: 6, goal: '두 번째 등불.',
        async run(c) {
          c.music('danger');
          await c.narr('두 번째 등불 둘레에서 그림자들이 일어섰다. 주인 없는 그림자들. 주인보다 먼저 지쳐 버린 것들.');
          await tori(c, '찍…! 등불을 지키는 거야? 아니면 등불이 무서운 거야?', 'shock');
        },
        fight: () => [{ type: 'shade', dx: -3, dy: 1, tier: 7 }, { type: 'shade', dx: 3, dy: 1, tier: 7 }, { type: 'ghost', dx: 0, dy: -3, tier: 7 }],
        fightMsg: '주인 없는 그림자들이 일어선다!',
        fightGoal: '등불 둘레의 그림자들을 물리치자.',
        again: '그림자들이 다시 일어선다!',
        async after(c) {
          c.music('black');
          await c.narr('그림자들이 흩어지자 등불 속에서 다시 목소리가 났다.');
          await c.narr('「두고 온 것이 있느냐.」');
          const k = await c.choice(null, ['「그린의 오두막.」', '「아직 하지 못한 말.」', '「없어. 다 가지고 왔어.」']);
          S().flags.a8_q2 = k;
          await light(c, 'l2');
          await c.narr(['불꽃이 초록빛으로 한 번 일렁였다.', '불꽃이 입술을 달싹이듯 떨렸다.', '불꽃이 켜졌다. 그런데 바람도 없는데 한쪽으로 기울었다. 아직 모르는 것을 들은 것처럼.'][k]);
          if (k === 0) await tori(c, '…할머니, 지금쯤 옥수수빵 굽고 있을까.', 'sad');
          c.exp(70);
        } },
      { id: 'l3', kind: 'reach', at: 'l3', r: 6, goal: '세 번째 등불. 리라가 기다린다.',
        wait: [{ cid: 'lyra', dx: 1, dy: 0, dir: 'left' }],
        async run(c, X) {
          const ly = X.npc(0);
          c.music('dream');
          c.faceEach('hero', ly);
          await c.narr('세 번째 등불 곁에서 리라가 류트를 타고 있었다. 노랫소리가 밤의 문턱을 넘어갔다.');
          await c.say(ly, '「두 개의 등불이 있었네. 하나는 하늘로, 하나는 숲으로…」', { face: 'closed' });
          if (!f('br3_song')) await tori(c, '찍…! 그 노래, 할머니 자장가랑 똑같아. 가사만 달라.', 'shock');
          else await tori(c, '찍. 배에서 들은 노래야. 할머니 자장가.', 'normal');
          await c.say(ly, '…마지막 등불은 제가 물어볼게요. 등불 대신.', { face: 'smile' });
          await c.say(ly, '「돌아갈 곳이 있느냐.」', { face: 'normal' });
          const k = await c.choice(null, ['「있어.」', '「만들 거야.」', '「…모르겠어.」']);
          S().flags.a8_q3 = k;
          await light(c, 'l3');
          await c.say(ly, ['…좋네요. 부러워요. 저는 돌아갈 곳이 노래 속에만 있었어요.', '만든다. …그 말, 오래 기억할게요. 저도 하나 만들어 볼래요. 돌아갈 곳.', '모르는 게 맞아요. 밤은 모르는 사람한테 친절해요. …저도 몰라요.'][k], { face: ['sad', 'smile', 'closed'][k] });
          c.bond('lyra', 1);
          await c.say(ly, '셋 다 켜졌네요. 그림자들이 이제 당신을 손님으로 봐요.', { face: 'smile' });
          await c.say(ly, '서쪽 가게의 고양이를 찾아가요. 미드나잇. …저는 먼저 가 있을게요. 할 이야기가 있거든요. 아주 오래 미뤄 둔.', { face: 'sad' });
          goes(c, ly, 44);
          c.exp(40);
          c.journal('밤의 땅 문턱의 등불 셋을 켰다. 마지막 등불은 리라가 물었다. 「돌아갈 곳이 있느냐.」 리라는 할 이야기가 있다고 했다.');
        } },
    ],
  });
  void A8;

  /* ═════════ 사이 막 일곱 — 아흔 날 (블랙 → 알록달록 곶) ═════════ */
  const WK = (o) => knight(Object.assign({ tc: '#e8eef8', trim: '#e8c048' }, o || {}));
  const A9 = ST.act({
    id: 'a9', from: 'c9', to: 'c10', next: 'colorful', A: 'black', B: 'colorful', gap: 'g9',
    title: '아흔 날', closed: '찍. 곶은 봉쇄됐대. 길을 막은 그물부터 넘어야 해.',
    openMsg: '사이 막 「아흔 날」 — 알록달록 곶으로 가는 길이 열렸다',
    spots: { block: { frac: 0.45, kind: 'fort' }, stone: { frac: 0.88, kind: 'stone' } },
    steps: [
      { id: 'bells', kind: 'auto', delay: 6, goal: '남쪽, 알록달록 곶 쪽으로 걷자.',
        async run(c) {
          await c.chapter('사이 막', '아흔 날', '세는 사람이 마지막 숫자를 말했다. 이제 남은 날은 우리가 센다.');
          c.sfx('bell');
          await c.narr('대륙의 모든 탑이 한꺼번에 울렸다. 먼 데서, 가까운 데서. 그리고 탑마다 같은 목소리.');
          c.music('kairon');
          await c.say('kairon', '(방송) 챔피언령. 오늘부터 알록달록 곶을 봉쇄한다. 하늘로 오르려는 자는 반역으로 다스린다.', { face: 'closed' });
          await c.say('kairon', '(방송) 흑점까지 남은 날은 아흔. 세는 일은 내가 한다. 너희는 땅에 있어라.', { face: 'sad' });
          c.music('black');
          await tori(c, '찍! 우리가 곶 가는 거 알아!', 'shock');
          await c.say('lyra', '알아요. 그 사람은 다 알아요. 세는 사람이니까.', { face: 'closed' });
          if (f('kairon_father')) await c.say('lyra', '…아버지는.', { face: 'sad' });
          const k = await c.choice(null, ['「그럼 우리도 세자. 아흔 날.」', '「세지 말자. 그냥 가자.」', '리라의 손을 잡는다']);
          S().flags.a9_count = k;
          if (k === 0) await c.say('lyra', '…좋아요. 하루에 하나씩. 대신 우리는 거꾸로 세요. 남은 날 말고, 함께 걸은 날로.', { face: 'smile' });
          else if (k === 1) await c.say('lyra', '그래요. 세는 건 그 사람 일이에요. 우리는 걷는 게 일이고.', { face: 'smirk' });
          else { c.bond('lyra', 1); await c.say('lyra', '…손이 따뜻하네요. 엄마 손도 이랬을까요.', { face: 'blush' }); }
          c.journal('탑마다 카이론의 목소리가 울렸다. 알록달록 곶 봉쇄. 흑점까지 아흔 날.');
        } },
      { id: 'block', kind: 'reach', at: 'block', r: 7, goal: '곶으로 가는 길목. 봉쇄선을 넘자.',
        wait: [{ name: '봉쇄 대장', look: WK({ hc: '#c8b890' }), dx: 0, dy: 2, dir: 'down' }, { name: '천년성 기사', look: WK(), dx: -2, dy: 2, dir: 'down' }, { name: '천년성 기사', look: WK(), dx: 2, dy: 2, dir: 'down' }],
        async run(c, X) {
          const cap = X.npc(0);
          c.music('danger');
          c.faceEach('hero', cap);
          await c.narr('길을 가로질러 빛의 그물이 쳐져 있었다. 수정 기둥 사이에 실 같은 빛이 팽팽했다. 그물 앞에 흰 망토의 기사들.');
          await c.say(cap, '챔피언령이다. 곶으로 가는 자는 여기서 돌아간다.', { face: 'normal' });
          await c.say(cap, '…흰빛. 그 머리를 보니 너로군. 챔피언께서 너만은 「다치게 하지 말고 돌려보내라」 하셨다.', { face: 'closed' });
          await c.say('lyra', '「다치게 하지 말고.」 …그 사람다운 말이네요. 세기만 하고 만지지는 않는.', { face: 'angry' });
          const rl = RL();
          if (rl === 'dawn') await c.say(null, '멀리서 주황 신호탄이 올랐다. 루드의 신호. 「서쪽 기둥은 우리가 맡는다.」', { style: 'sys' });
          else if (rl === 'order') await c.say(null, '하얀 매가 내려앉았다. 「봉쇄 대장은 내 동기다. 고집이 세다. 기둥만 부수면 물러날 거다. — 카시안」', { style: 'sys' });
          else await c.narr('그물 기둥 하나의 그림자가 저절로 일어나 기둥을 감쌌다. 미드나잇의 그림자들이었다.');
          const k = await c.choice('기사들이 칼을 뽑지 않은 채 길을 막는다.', [{ t: '「다치게 하지 말라는 말, 나도 지킬게.」', sub: '기둥만 부순다.' }, { t: '「돌아가지 않아.」', sub: '정면으로.' }]);
          S().flags.a9_way = k;
          if (k === 0) { c.flag('a9_gentle'); await c.say(cap, '…기둥만? 좋다. 우리는 손대지 않는다. 기둥이 버티는 데까지만.', { face: 'smirk' }); }
          else await c.say(cap, '그럼 어쩔 수 없군. 다치게 하지 않으면서 막는 법도 우리는 배웠다.', { face: 'closed' });
        },
        fight: () => {
          const g = S().flags.a9_way === 0, n = RL() === 'dawn' ? 2 : 3;
          const out = [];
          for (let i = 0; i < n; i++) out.push({ type: 'turret', dx: -4 + i * 4, dy: -1, tier: 8, name: '빛 그물 기둥' });
          if (!g) out.push({ type: 'knight', from: 1, tier: 8, hpMul: 0.8, name: '천년성 기사' }, { type: 'knight', from: 2, tier: 8, hpMul: 0.8, name: '천년성 기사' });
          return out;
        },
        fightMsg: '빛 그물을 걷어 내라!',
        fightGoal: '빛 그물 기둥을 부수자.',
        again: '빛 그물이 다시 팽팽해진다!',
        async after(c) {
          const p = W().player;
          await c.narr('마지막 기둥이 무너지자 빛의 실이 눈처럼 흩어졌다.');
          const cap = c.spawn({ name: '봉쇄 대장', look: WK({ hc: '#c8b890' }), x: p.x + 30, y: p.y - 6, dir: 'left' });
          await c.wait(0.4);
          await c.say(cap, f('a9_gentle') ? '…기둥만 부쉈군. 칼은 한 번도 우리 쪽을 향하지 않았다.' : '…졌다. 「다치게 하지 말라」는 명령은 지켰다. 너는 다치지 않았으니까.', { face: 'sad' });
          await c.say(cap, '보고서엔 「그물이 약했음」이라고 적겠다. 그분은 숫자를 믿으시니까. …그분 요즘 잠을 안 주무신다. 아흔 날을 세느라.', { face: 'closed' });
          await c.say('lyra', '……', { face: 'sad' });
          goes(c, cap, 34);
          c.exp(90);
          c.journal('곶으로 가는 길의 빛 그물을 걷어 냈다. 봉쇄 대장: 「그분 요즘 잠을 안 주무신다.」');
        } },
      { id: 'stone', kind: 'reach', at: 'stone', r: 4, goal: '곶 가는 길가의 낡은 이정표.',
        async run(c) {
          c.music('mother');
          await c.narr('길가에 낡은 이정표가 서 있었다. 「알록달록 곶 — 하늘에 가장 가까운 땅」. 그 밑, 돌에 새긴 글씨. 비바람에 반쯤 지워진.');
          await c.narr('「983년 겨울. 두 아이에게. 길은 하나가 아니야. 나눠서 가도 돼. — S」');
          await c.say('lyra', '…엄마 글씨예요. 밤의 성 서고에 엄마 편지가 한 장 있었거든요. 이 「ㅅ」 꼬리 모양.', { face: 'cry' });
          await tori(c, '찍… 세린 언니, 여기를 지나갔구나. 하늘로 가려고.', 'sad');
          const k = await c.choice('리라가 이정표의 글씨를 손끝으로 쓴다.', ['리라와 나란히 이정표에 이름을 새긴다', '「엄마는 혼자 갔지만, 우리는 둘이야.」', '말없이 함께 서 있는다']);
          S().flags.a9_stone = k; c.bond('lyra', k === 2 ? 1 : 2);
          if (k === 0) { c.sfx('cut'); await c.narr('검 끝으로 돌을 긁었다. 「S」 아래에 이름 둘. 삐뚤빼뚤하게, 나란히.'); await c.say('lyra', '…이제 엄마가 돌아오는 길에 보겠네요. 우리 둘 다 여기 지나갔다는 거.', { face: 'cry' }); }
          else if (k === 1) await c.say('lyra', '…둘. 응. 둘이에요. 토리아까지 셋이고요.', { face: 'smile' });
          else await c.narr('바람이 이정표를 쓸고 지나갔다. 둘은 한참 그렇게 서 있었다. 토리아도 꼬리를 말고 가만히 있었다.');
          await c.say('lyra', '가요. 피로스라는 사람, 반쯤 미쳤대요. 엄마도 그런 사람을 좋아했대요. …아버지 말고는.', { face: 'smirk' });
          c.exp(40);
          c.journal('곶 가는 길의 이정표에서 세린의 글씨를 찾았다. 「두 아이에게. 길은 하나가 아니야. 나눠서 가도 돼.」');
        } },
    ],
  });
  void A9;

  /* ═════════ 이어지는 것들: 다음 장 사람들의 말 ═════════ */
  // 레드: 루드 — 그린 송부 장부의 「광산 시동분」
  ST.hookTalk('world', 'rud', (s) => !!(s.flags.a1_ledger_seen && s.flags.c2_mine_ok && !s.flags.c2_extractor && !s.flags.a1_rud), async (c, n) => {
    c.flag('a1_rud');
    await c.say(n, '「광산 시동분 · 부단장 직할」? …그 칸, 나도 봤어. 숫자가 안 맞는 줄 알았는데, 받는 곳이 틀린 거였구나.', { face: 'shock' });
    await c.say(n, '그린에서 걷힌 빛이 천년성이 아니라 여기로 왔어. 광산 기계를 깨우려고. …숫자는 거짓말 안 해. 적은 사람이 하지.', { face: 'angry' });
    c.exp(20);
  });
  // 블루: 루체 — 아스텔의 관측 사본과 아버지의 항해일지
  ST.hookTalk('b_light', 'luce', (s) => !!(s.inv.a2_copy && s.flags.c3_luce && !s.flags.a2_luce_done), async (c, n) => {
    c.lock(true);
    await c.say(n, '아스텔 박사님 글씨네요. 아버지가 늘 「붉은 산의 고집쟁이」라고 부르던.', { face: 'shock' });
    await c.narr('루체가 항해일지와 사본을 나란히 폈다. 983년 겨울의 「흰 줄기」, 그리고 광산의 밤의 「일렁임」.');
    await c.say(n, '…둘 다 같은 쪽이에요. 빛이 한 점에 몰린 쪽. 아버지가 본 흰 줄기도, 박사님이 본 일렁임도.', { face: 'sad' });
    await c.say(n, '두 사람이 본 걸 맞추면 하나가 된다. …박사님한테 답장할게요. 등대 불빛으로. 붉은 산에서도 보이게.', { face: 'smile' });
    delete S().inv.a2_copy; c.flag('a2_luce_done'); c.bond('luce', 1); c.exp(50);
    c.lock(false);
    c.journal('루체가 아스텔의 관측 사본과 아버지의 항해일지를 맞춰 보았다. 둘 다 빛이 한 점에 몰린 쪽을 가리켰다.');
  });
  // 퍼플: 베라 — 회의의 둘째 안건
  ST.hookTalk('p_academy', 'vera', (s) => !!((s.flags.a4_agenda || s.flags.a4_vera_called) && s.flags.c5_vera && !s.flags.c5_tea && !s.flags.a4_vera), async (c, n) => {
    c.flag('a4_vera');
    if (S().flags.a4_agenda) {
      await c.say(n, '「사용」. …그 말, 회의 소집장에서 나도 봤어요. 증인으로 오라더군요. 세린을 가르친 사람으로서.', { face: 'sad' });
      await c.say(n, '그릇을 「쓴다」는 생각. 세린이 제일 싫어하던 말이에요. 「저는 그릇이 아니라 사람이에요, 교수님.」', { face: 'closed' });
    } else await c.say(n, '회의에 증인으로 불려 간대요, 내가. 세린 이야기를 하라고. …무엇을 말할지 아직 못 정했어요.', { face: 'sad' });
    c.exp(20);
  });
  // 그레이: 볼트 — 중계소 흐름 기록
  ST.hookTalk('g_work', 'bolt', (s) => !!(s.inv.a7_flow && s.flags.c8_bolt && !s.flags.c8_done && !s.flags.a7_bolt), async (c, n) => {
    c.flag('a7_bolt');
    await c.say(n, '…내 관이군. 흐름 기록. 숫자가 맞다. 내가 그린 대로.', { face: 'closed' });
    await c.say(n, '「사람 쪽은 안 셈」. 러스크 글씨다. …녀석, 말을 아끼는 줄 알았더니.', { face: 'sad' });
    await c.say(n, '틀린 숫자는 없다. 틀린 건 무엇을 세느냐다. 쓸데없는 말이군. 연료 낭비다.', { face: 'normal' });
    delete S().inv.a7_flow; c.exp(40);
  });
  // 블랙: 미드나잇 — 등불 셋의 대답
  ST.hookTalk('bk_mid', 'midnight', (s) => !!(s.flags.c9_mid && s.flags['act:a8'] && !s.flags.a8_mid && !s.flags.c9_done), async (c, n) => {
    c.flag('a8_mid');
    const q1 = S().flags.a8_q1, q3 = S().flags.a8_q3;
    await c.say(n, '문턱의 등불 셋이 켜졌다더군. 백 년 만이야. 등불이 뭐라고 대답을 들었는지, 고양이는 다 듣지.', { face: 'smirk' });
    await c.say(n, q1 === 2 ? '「아직 만나지 못한 사람을 위해」라. …그 사람은 이미 너를 만났다네. 멀리서. 여러 번.' : q1 === 1 ? '「엄마를 위해」라. 세린도 그 등불을 켰지. 983년 겨울에. 「아이들을 위해」라고 했다네.' : '「나를 위해」라. 정직하군. 등불은 정직한 대답을 제일 좋아한다네.', { face: 'closed' });
    if (q3 === 1) await c.say(n, '그리고 「만들 거야」. 리라가 그 말을 노래에 넣었더군. 벌써.', { face: 'smile' });
  });
  // 곶: 피로스 — 세린의 이정표
  ST.hookTalk('c_lab', 'pyros', (s) => !!(s.flags['act:a9'] && s.flags.c10_pyros && !s.flags.a9_pyros && !s.flags.c10_launch), async (c, n) => {
    c.flag('a9_pyros');
    await c.say(n, '이정표? 곶 입구의 그 낡은 돌? …거기 글씨가 있다고? 「S」?', { face: 'shock' });
    await c.say(n, '983년 겨울. 흰 옷의 여자가 공방 문을 두드렸지. 내 로켓이 어디까지 올라가냐고 물었어. 「아직」이라고 했다. 아직 못 난다고.', { face: 'sad' });
    await c.say(n, '그 여자가 웃더군. 「그럼 제가 먼저 갈게요. 제 방식대로. 로켓은 아이들 몫으로 남겨 두세요.」', { face: 'closed' });
    await c.say(n, '…아이들 몫. 그게 너희였나. 하. 하하. 40년 걸려 만든 걸 17년 전에 예약해 둔 손님이 있었군!', { face: 'happy' });
    c.exp(60);
  });

  /* ═════════ 소문 ═════════ */
  const ev = (id, o) => ST.NEWS_EV.push(Object.assign({ id }, o));
  ev('a1_open', { reg: ['green', 'red'], ch: 'c2', when: (s) => s.flags.a1_open,
    near: { green: ['서쪽 하늘에서 초록 빛이 날아왔어. 지붕 위로. 봄볕 같았지.', '노아네 엄마가 그러는데, 그날 아침 노아 손끝이 따뜻했대.'], any: '그린에서 걷힌 빛이 도로 날아갔대. 수레가 털렸다나.' },
    known: '징수 수레가 그린 마을 빛을 도로 놓쳤대. 장부엔 「운송 중 분실」.', kid: { near: ['하늘에서 초록 반딧불이 내려왔어! 엄청 많이!'] } });
  ev('a1_keep', { reg: ['green'], ch: 'c2', when: (s) => s.flags.a1_keep && !s.flags.a1_open,
    near: ['고르디 기사가 이장님 앞에서 항아리를 하나씩 열었어. 이름을 불러 가면서. 다들 울었지.'], known: '그린의 고르디 기사가 걷은 빛을 이름 불러 가며 돌려줬대. 기사가 말이야.' });
  ev('a2_swarm', { reg: ['red', 'green'], ch: 'c3', when: (s) => s.flags['act:a2:swarm'],
    near: ['요즘 산길에 밤마다 빛벌레가 몰려. 등불을 낮게 들고 다녀.'], known: '관측소 박사님이 그러는데, 빛이 한 점에 몰리면 무언가 따라온대.' });
  ev('a2_kairon', { reg: ['red'], ch: 'c3', when: (s) => s.flags.a2_kairon, near: ['관측소 박사님이 천년성에 또 편지를 보냈대. 이번엔 증인 이름까지 적어서.'] });
  ev('a4_fort', { reg: ['yellow', 'purple'], ch: 'c5', when: (s) => !!s.flags.a4_fort,
    near: (s) => ({ pass: '국경 초소 대장이 그린 기사 통행패 하나 보고 길을 열어 줬대.', duel: '국경 초소 대장이 흰빛 후보랑 겨뤘대. 지고서 웃었다나.', sneak: '참새단 꼬맹이들이 국경 초소에 폭죽을 터뜨렸대!', fight: '국경 초소가 뚫렸대. 흰빛 후보가 칼로.' })[s.flags.a4_fort],
    known: '국경 초소 장부에 「후보, 퍼플로 출두 중」이라고 적혀 있대. 출두가 퍼플로 가나?' });
  ev('a4_agenda', { reg: 'all', ch: 'c5', when: (s) => s.flags.a4_agenda,
    far: '사천왕 회의 안건이 새어 나왔대. 「흰빛 후보의 사용」. 사람을 쓴다니, 무슨 말이야.', known: '「사용」이라는 말이 돌아. 기사들도 그 말은 싫어하더라.' });
  ev('a6_crowd', { reg: ['purple', 'white'], ch: 'c7', when: (s) => s.flags.a6_one || s.flags.a6_all || s.flags.a6_lead,
    near: (s) => (s.flags.a6_all ? '흰빛이 퍼플 어귀에서 쓰러졌대. 사람들 손을 끝까지 다 잡아 주다가.' : s.flags.a6_lead ? '흰빛이 병든 사람들을 데리고 설산으로 갔대. 줄 맨 끝에 서서.' : '흰빛이 아이 하나 손을 잡아 줬대. 하나만. 그게 맞는 거래.'),
    known: '흰머리 한 가닥 난 아이가 사람 손을 잡아 준대. 다 주지는 않는대. …그게 무슨 뜻인지 다들 생각 중이야.' });
  ev('a6_mark', { reg: ['purple'], ch: 'c7', when: (s) => s.flags['act:a6:remnant'], near: ['그라우스 부단장 밑에 있던 기사들이 흩어졌대. 마르크라는 부관만 남쪽으로 혼자 갔다나.'] });
  ev('a7_relay', { reg: ['white', 'gray'], ch: 'c8', when: (s) => !!s.flags.a7_way,
    near: (s) => (s.flags.a7_valve ? '설산 관이 막혔대. 기도등에 불 붙인 사람들이 덜 피곤하대.' : s.flags.a7_leak ? '중계소 밑 눈밭에 풀이 자란대. 한겨울에.' : '중계소 러스크 아저씨가 웃는 걸 봤대. 처음이래.'),
    known: '눈 밑에 관이 있대. 기도등 빛이 그리로 간대. …알고 나니 기도가 무거워.' });
  ev('a8_lamps', { reg: ['gray', 'black'], ch: 'c9', when: (s) => s.flags['act:a8'], near: ['문턱의 등불 셋이 켜졌대. 백 년 만에.', '밤의 문턱 등불이 다시 탄대. 그림자들이 손님을 맞는대.'], known: '밤의 땅에 손님이 왔대. 등불 셋을 켜고.' });
  ev('a9_net', { reg: ['black', 'colorful', 'yellow'], ch: 'c10', when: (s) => s.flags['act:a9:block'],
    near: ['곶 가는 길의 빛 그물이 찢어졌대. 기사들은 하나도 안 다쳤대.', '봉쇄 대장이 보고서에 「그물이 약했음」이라고 적었대.'], known: '챔피언령으로 곶을 막았는데, 흰빛이 그물을 걷고 지나갔대.' });
  ev('a9_stone', { reg: ['colorful'], ch: 'c10', when: (s) => s.flags.a9_stone === 0, near: ['곶 입구 이정표에 이름 둘이 새로 새겨졌대. 삐뚤빼뚤하게, 나란히.'] });

  /* ═════════ 결말의 그 뒤 ═════════ */
  ST.moreFates = ST.moreFates || [];
  ST.moreFates.push((id, add) => {
    if (f('a1_g_guard')) add('gordi', '고르디는 그린 탑이 무너진 자리에 작은 초소를 지었다. 걷는 곳이 아니라 지키는 곳. 문패에 「그린 담당」.');
    else if (f('a1_g_rule')) add('gordi', '고르디는 기사단 규정집 맨 앞장에 한 줄을 써 넣었다. 「규칙은 사람을 지키려고 만든 것이다.」 아무도 지우지 않았다.');
    else if (f('a1_g_go')) add('gordi', '고르디는 한 번은 그린을 떠나 보았다. 레드까지. 개울목에서 돌아와 「멀더라」 한마디만 했다.');
    if (f('a1_sip')) add('a1', id === 'ash' || id === 'repeat' ? '그린 항아리 이름표 하나는 끝내 흐려진 채였다. 누구 이름이었는지 아무도 기억하지 못했다.' : '그린 항아리 이름표 하나가 흐려져 있었다. 너는 그 이름을 찾아가 빛을 조금 나눠 주었다. 그 사람은 이유를 묻지 않았다.');
    if (f('a2_luce_done')) add('astel', '붉은 산 관측소와 블루 등대는 밤마다 불빛을 주고받는다. 아스텔은 그것을 「답장」이라고 부른다.');
    else if (f('a2_kairon')) add('astel', '아스텔은 마지막 편지의 답장을 받았다. 한 줄. 「당신이 옳았다.」 그는 그 종이를 관측표 옆에 붙였다.');
    if (f('a4_hagen_doubt')) add('hagen', '국경 초소 대장 하겐은 장부의 「사용」이라는 말에 줄을 긋고, 그 위에 「사람」이라고 적어 천년성에 올려 보냈다.');
    if (f('a6_mk_ally')) add('mark', '마르크는 그날 약속대로 칼 한 자루를 보탰다. 그라우스의 흰 방 문 앞까지 따라가, 끝내 들어가지는 않았다.');
    if (f('a6_edel_face')) add('edel', '에델은 투구를 벗은 첫날, 설산 고개로 가서 한참 서 있었다. 「얼굴을 보여 달라던 아이가 있었다」며.');
    if (f('a7_leak')) add('rusk', '러스크는 중계소의 이음매를 끝내 고치지 않았다. 그 길을 따라 설산에서 그레이까지 풀이 한 줄로 자랐다.');
    else if (f('a7_valve')) add('rusk', '러스크는 잠긴 밸브 옆에 의자를 놓았다. 다시는 아무도 열지 못하게. 가끔 볼트가 와서 같이 앉는다.');
    if (S().flags.a8_q3 === 1) add('lyra', '리라의 새 노래 마지막 줄은 「돌아갈 곳은 만드는 거야」였다. 그 노래는 대륙의 등불 거리마다 불렸다.');
    if (S().flags.a9_stone === 0) add('stone', '곶 입구 이정표의 「S」 아래 이름 둘은 지워지지 않았다. 누군가 해마다 그 글씨를 다시 긁어 두었다.');
  });

  ST.actsSeal();
})();
