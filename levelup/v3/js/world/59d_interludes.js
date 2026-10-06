/* 사이 이야기 — 큰 일과 큰 일 사이, 「어떻게 그렇게 되었나」를 메우는 짧은 장면 열둘
   장과 장 사이(59_bridges)는 채웠지만, 장 안에서 다음 일로 넘어가는 길과 「저 사람은 왜 거기 있었나」가 비어 있었다.
   세 갈래로 흩어진 이야기 — 어느 것을 보고 어느 것을 놓쳤는지에 따라 뒤의 말 · 진실의 조각 · 결말의 그 뒤가 달라진다.
   · 엇갈린 발자국(리라): 레드 광산 · 블루 등대 · 라벤더 학원 · 천년제 — 늘 한 걸음 앞에 다녀간 검은 망토.
     9장에 리라가 언니(누나)인 걸 안 뒤 둘 넘게 보았으면, 리라가 그 길을 이야기한다 → 진실의 조각 「리라의 길」
   · 카시안의 보고서: 블루 여관의 뒤바뀐 편지 · 옐로 길 위의 카시안 · 화이트 우체통 — 그가 왜 늘 내 앞에 나타났는지.
     둘 넘게 보았으면 10장 무렵 카시안이 남은 보고서를 건넨다 → 진실의 조각 「카시안의 보고서」(카이론 앞에 내밀 증거가 하나 는다)
   · 노아의 편지: 참새단 배달 아이가 길 위로 가져오는 편지 셋 — 그린의 노아가 어떻게 하얀 땅의 병동까지 갔는지.
     둘 넘게 받았으면 화이트 병동에서 노아가 답장 이야기를 한다
   고른 것은 깃발(il:*)로 남아 그 동네의 소문(54f_news) · 결말의 그 뒤(moreFates)에 한 줄씩 이어진다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!(G.state && G.state.flags[k]);
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '언니' : '누나');
  const inParty = (id) => (S().party || []).includes(id);
  const nm = () => S().name || '아린';
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id }, o); };
  const n0 = (pre, n) => { let k = 0; for (let i = 1; i <= n; i++) if (f(pre + i)) k++; return k; };
  const lyraN = () => n0('il:l', 4), casN = () => n0('il:c', 3), noahN = () => n0('il:n', 3);

  /* ── 진실의 조각 둘 (결말 「나눔」 · 카이론 앞의 증거에 든다) ── */
  D.TRUTHS.t_lyra = { name: '리라의 길', hint: '밤의 땅에서, 리라가 그동안의 길을 이야기할 때.',
    text: '리라는 동생이 검을 쥔 봄부터 늘 한 걸음 앞을 걸었다. 레드 갱도의 무너진 길에 깃털을 꽂았고, 블루 등대 계단에 초를 두었고, 세린의 기록장에 끈을 끼웠다. 녹턴에게는 「밤의 일」이라고만 말했다.',
    long: ['리라는 동생이 검을 쥔 봄부터 늘 한 걸음 앞을 걸었다.', '레드 갱도의 무너진 길에 깃털을 꽂았다. 블루 등대 계단에 초를 두었다. 라벤더 학원 서고에서 세린의 기록장에 붉은 끈을 끼웠다. 천년제 밤에는 기둥에서 가장 먼 자리에 섰다.', '녹턴에게는 「밤의 일」이라고만 말했다. 녹턴은 묻지 않았다. 알고 있었으니까.'] };
  D.TRUTHS.t_report = { name: '카시안의 보고서', hint: '카시안이 챔피언에게 올린 보고서 묶음.',
    text: '카이론이 카시안에게 내린 명령은 하나였다. 「흰빛을 찾으면 지켜라. 데려오지 마라.」 카시안은 보고서마다 같은 말로 끝맺었다. 「명령이 바뀌지 않기를 바랍니다.」',
    long: ['카이론이 카시안에게 내린 명령은 하나였다. 「흰빛을 찾으면 지켜라. 데려오지 마라.」', '카시안은 블루에서, 무지개 섬에서, 화이트에서 보고서를 올렸다. 마지막 줄은 늘 같았다. 「명령이 바뀌지 않기를 바랍니다.」', '답장은 한 번도 오지 않았다. 카시안은 그것을 「명령이 그대로」라는 뜻으로 읽었다.'] };

  /* ── 길에서 받는 것 ── */
  item('il_feather2', { type: 'key', name: '갱도의 검은 깃털', desc: '레드 광산 무너진 갱도 표지판에 꽂혀 있던 깃털. 「이쪽은 막혔다」는 표시처럼.', read: '깃털 끝에 촛농이 조금 묻어 있다. 밤의 땅 초 냄새.' });
  item('il_report', { type: 'key', name: '뒤바뀐 보고서', desc: '블루 여관에서 잘못 건네받은 봉투. 「천년성 — 챔피언께」.', read: '「후보는 검을 늦게 뽑습니다. 먼저 묻습니다. 위험한 버릇입니다. 계속 지켜보겠습니다. — 카시안」\n「추신. 명령이 바뀌지 않기를 바랍니다.」' });
  item('il_noahs', { type: 'key', name: '노아의 편지 묶음', desc: '참새단 아이들이 길 위로 가져온 노아의 편지들.', read: '삐뚤빼뚤한 글씨. 마지막 장엔 하얀 머리 한 가닥이 난 사람 그림.' });

  /* ═════════ 도우미 ═════════ */
  function spot(p, dists) {
    const m = W().map, z = p.z || 0;
    for (let i = 0; i < 16; i++) {
      const a = i * 0.785 + (i > 7 ? 0.39 : 0);
      for (const d of dists || [64, 50, 80, 40]) {
        const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d * 0.8, tx = Math.floor(x / TS), ty = Math.floor((y - 4) / TS);
        const t0 = m.T(tx, ty); if (t0 === T.WATER || t0 === T.DEEP || t0 === T.LAVA || t0 === T.CLIFF) continue;
        if (m.H(tx, ty) !== z || !m.boxFree(x - 5, y - 8, 10, 8, z, p)) continue;
        if (W().propBlock && W().propBlock(x - 5, y - 8, 10, 8, p)) continue;
        return [x, y];
      }
    }
    return null;
  }
  function calm() {
    const Wd = W(), p = Wd.player;
    for (const e of Wd.ents) if (e.foe && !e.dead && (e.aggro || U.dist(e.x, e.y, p.x, p.y) < 130)) return false;
    return true;
  }
  /** 사람이 저쪽에서 걸어와 곁에 선다 (나타나는 것은 96d_presence가 걸어 들어오게 한다) */
  async function comes(c, spec, speed) {
    const p = W().player, at = spot(p); if (!at) return null;
    const n = c.spawn(Object.assign({ x: at[0], y: at[1], dir: U.dir4(p.x - at[0], p.y - at[1]) }, spec));
    await c.move(n, p.x + (at[0] - p.x) * 0.4, p.y + (at[1] - p.y) * 0.4, { speed: speed || 42 });
    c.faceEach('hero', n);
    return n;
  }
  function goes(c, n) {
    if (!n || n.dead) return;
    const p = W().player, a = Math.atan2(n.y - p.y, n.x - p.x);
    c.move(n, n.x + Math.cos(a) * 130, n.y + Math.sin(a) * 100, { speed: 46 }).then(() => { n.dead = true; });
  }
  const tori = (c, text, face) => (inParty('toria') ? c.say('toria', text, { face: face || 'normal' }) : Promise.resolve());
  const courier = () => ({ look: G.cast.folk('kid', { hc: '#6a4a2a', tc: '#8a5a3a', hat: 'cap', hatC: '#c84a3a' }), name: '참새단 배달꾼' });

  /* ═════════ 열두 장면 ═════════ */
  const IL = [
    /* ── 엇갈린 발자국 ── */
    { id: 'l1', reg: ['red'], when: (s) => ST.after('c2') && !ST.after('c4') && (f('c2_letter') || f('c2_mine_ok')),
      async run(c) {
        const n = await comes(c, { look: G.cast.folk('farmer', { hat: 'helm', hatC: '#e8c048', tc: '#8a5a3a' }), name: '광부 도르' }); if (!n) return false;
        await c.say(n, '어이, 거기. 갱도 쪽으로 가는 거면 셋째 굴은 피해. 어젯밤에 무너졌어.', { face: 'normal' });
        await c.say(n, '근데 이상하지. 무너지기 전에 누가 표지판에 깃털을 꽂아 뒀더라고. 까만 거. 그거 보고 다들 돌아 나왔지.', { face: 'shock' });
        await c.say(n, '저녁에 검은 망토 아가씨가 갱도 지도를 사 갔어. 돈 대신 노래 한 소절로 값을 치르더라. 이상한 아가씨야.', { face: 'smile' });
        await tori(c, '찍… 검은 망토. 그린 여관에서 노래하던 언니랑 비슷한데?', 'shock');
        const k = await c.choice(null, ['표지판의 깃털을 챙긴다', '깃털은 그대로 둔다 — 다음 사람도 봐야 하니까', '그 아가씨가 어디로 갔는지 묻는다']);
        c.flag('il:l1'); c.flag('il:l1_' + k);
        if (k === 0) { await c.getItem('il_feather2'); await tori(c, '밤의 깃털이랑 똑같아. 찍. 누가 우리보다 먼저 왔다 갔어.', 'normal'); }
        else if (k === 1) { await c.say(n, '…그래. 그 깃털 덕에 오늘 아침엔 아무도 안 다쳤어. 고마운 깃털이야.', { face: 'smile' }); }
        else { await c.say(n, '동쪽. 블루 쪽 바닷길로. 바다 냄새 나는 데로 간다더군. 「다음엔 등대」라고 혼잣말을 하던데.', { face: 'normal' }); c.flag('il:l_hint'); }
        goes(c, n);
        c.journal('레드 광산의 무너진 갱도. 무너지기 전에 누가 표지판에 검은 깃털을 꽂아 두었다. 검은 망토의 아가씨.');
        return true;
      } },
    { id: 'l2', reg: ['blue'], when: (s) => ST.after('c3') && !ST.after('c5') && (f('c3_luce') || f('c3_octavio')),
      async run(c) {
        const n = await comes(c, { cid: 'luce' }); if (!n) return false;
        await c.say(n, '저기요! 등대 계단에 누가 밤마다 앉아 있다 가요. 아침에 가 보면 꼭대기에 초가 하나 녹아 있어요.', { face: 'shock' });
        await c.say(n, '불을 켜 주려다 만 것 같아요. 초 옆에 쪽지가 있었어요. 「켜는 건 네 몫이야.」', { face: 'normal' });
        await c.say(n, '…저한테 하는 말이었을까요? 그게 아니면 누구한테요?', { face: 'sad' });
        const k = await c.choice(null, ['「너한테 하는 말이야. 네 등대니까.」', '「나한테 하는 말일지도.」', '쪽지를 보여 달라고 한다']);
        c.flag('il:l2'); c.flag('il:l2_' + k);
        if (k === 0) await c.say(n, '…응. 제 등대예요. 언젠가 제 손으로 켤 거예요.', { face: 'smile' });
        else if (k === 1) { await c.say(n, '당신한테요? 당신은 등대가 없잖아요. …아, 흰빛. 당신이 등대구나.', { face: 'shock' }); await tori(c, '찍… 우리 등대야? 그럼 나는 등대 다람쥐.', 'happy'); }
        else { await c.narr('쪽지는 검은 종이였다. 글씨가 은빛이다. 끝에 작은 초승달 하나.'); await tori(c, '초승달… 밤의 땅 표시래. 할머니가 그랬어. 찍.', 'shock'); c.flag('il:l_moon'); }
        goes(c, n);
        c.journal('블루 등대 꼭대기에 누가 밤마다 초를 두고 간다. 「켜는 건 네 몫이야.」');
        return true;
      } },
    { id: 'l3', reg: ['purple'], when: (s) => ST.after('c5') && !ST.after('c7') && f('c5_viola'),
      async run(c) {
        const n = await comes(c, { cid: 'viola' }); if (!n) return false;
        await c.say(n, '야, 흰빛. 너 알지? 세린 선배 기록장. 학원 서고에서 누가 몰래 붉은 끈을 끼워 놨어.', { face: 'angry' });
        await c.say(n, '끈이 끼워진 쪽이 「기록 스물넷」이야. 아무도 모르는 기록. 나도 그걸 보고 안 거야.', { face: 'normal' });
        await c.say(n, '서고지기 말로는 밤에 검은 옷 입은 애가 왔대. 학원생은 아니고. …너 아는 사람이야?', { face: 'shock' });
        const k = await c.choice(null, ['「모르는 사람이야. 그런데 자꾸 내 앞에 있어.」', '「끈이 가리킨 곳에 가 보자.」', '「누군지 몰라도, 고마운 사람이야.」']);
        c.flag('il:l3'); c.flag('il:l3_' + k);
        if (k === 0) await c.say(n, '…무섭다, 그거. 아니, 무섭다기보다… 누가 너를 데려가려는 게 아니라 길을 닦아 두는 거 같아.', { face: 'sad' });
        else if (k === 1) await c.say(n, '거꾸로 선 탑. 거울 연못 아래. …같이 가. 기록은 내가 먼저 깰 거니까.', { face: 'smirk' });
        else await c.say(n, '고마운 사람? …그래. 나한테도 고마운 사람이네. 그 끈 아니었으면 나 아직 스물셋에서 헤맸을 거야.', { face: 'smile' });
        goes(c, n);
        c.journal('라벤더 학원 서고. 누가 세린의 기록장 「기록 스물넷」 쪽에 붉은 끈을 끼워 두었다. 밤에 온 검은 옷의 아이.');
        return true;
      } },
    { id: 'l4', reg: ['rainbow'], when: (s) => ST.after('c6') && !ST.after('c7') && f('c6_chroma') && !f('c6_finale'),
      async run(c) {
        const n = await comes(c, { look: G.cast.get('lyra') ? Object.assign({}, G.cast.get('lyra').look, { hat: 'hood', hatC: '#1a1428' }) : G.cast.folk('kidg'), name: '가면 쓴 아이' }, 36); if (!n) return false;
        await c.narr('축제의 북소리 사이로, 검은 가면을 쓴 아이가 사람들 틈에서 걸어 나왔다. 가까이 오지 않는다. 세 걸음쯤에서 멈춘다.');
        await c.say(n, '…봉헌식 날. 기둥 가까이 가지 마.', { face: 'normal' });
        await c.say(n, '아니. …가. 너는 가야 해. 다만 손을 대기 전에, 한 번만 뒤를 봐.', { face: 'sad' });
        const k = await c.choice(null, ['「누구야?」', '「왜 나를 도와?」', '고개만 끄덕인다']);
        c.flag('il:l4'); c.flag('il:l4_' + k);
        if (k === 0) await c.say(n, '…밤에 노래하는 사람. 그거면 돼.', { face: 'smile' });
        else if (k === 1) await c.say(n, '돕는 거 아니야. …그냥, 너보다 조금 먼저 태어났을 뿐이야.', { face: 'sad' });
        else await c.narr('가면 아래 입꼬리가 아주 조금 올라갔다.');
        await tori(c, '찍…! 저 목소리, 그린 여관에서 들었어! 저기, 잠깐만—', 'shock');
        goes(c, n);
        c.journal('천년제의 북소리 사이. 검은 가면의 아이가 말했다. 「손을 대기 전에, 한 번만 뒤를 봐.」');
        return true;
      } },
    // 갚음: 9장 — 리라가 언니(누나)인 걸 알고, 흔적을 둘 넘게 보았을 때
    { id: 'l5', reg: ['black', 'colorful'], when: (s) => f('lyra_sister') && inParty('lyra') && lyraN() >= 2 && !ST.after('c12'),
      async run(c) {
        await c.narr('등불 거리 끝. 리라가 걸음을 멈추고 뒤를 돌아봤다.');
        await c.say('lyra', '…있잖아. 레드 광산 무너진 갱도. 그 깃털, 내가 꽂았어.', { face: 'normal' });
        if (f('il:l2')) await c.say('lyra', '블루 등대 초도. 켜 주고 싶었는데, 그건 루체 몫이라서. 쪽지만 두고 왔어.', { face: 'smile' });
        if (f('il:l3')) await c.say('lyra', '학원 서고의 끈도. 엄마 기록 스물넷 — 이기지 않고 안아 주는 거. 네가 그걸 먼저 봤으면 했어.', { face: 'sad' });
        if (f('il:l4')) await c.say('lyra', '천년제 날 가면도. …뒤를 봤어? 기둥 앞에서. 봤으면, 내가 거기 있었어.', { face: 'sad' });
        await c.say('lyra', '녹턴은 나를 숨겼고, 나는 너를 숨기고 싶었어. 근데 숨기는 거 말고 길을 닦는 걸 했어. 그게 ' + sib() + '가 할 수 있는 거라서.', { face: 'cry' });
        const k = await c.choice(null, ['「알고 있었어. 늘 한 걸음 앞에 누가 있었어.」', '「이제부터는 옆에서 걸어.」', '아무 말 없이 깃털을 보여 준다']);
        c.flag('il:l5'); c.flag('il:l5_' + k);
        if (k === 0) await c.say('lyra', '…들켰구나. 찍, 이라고 하면 토리아가 화내겠지.', { face: 'smile' });
        else if (k === 1) await c.say('lyra', '…응. 옆에서. 앞에서 말고.', { face: 'cry' });
        else { await c.say('lyra', (S().inv.il_feather2 || S().inv.feather_night) ? '…아직 가지고 있었어? 바보. …고마워.' : '…빈손이네. 괜찮아. 기억해 준 걸로 됐어.', { face: 'cry' }); }
        c.truth('t_lyra'); c.bond('lyra', 1);
        c.journal('리라가 그동안의 길을 이야기했다. 광산의 깃털 · 등대의 초 · 서고의 끈 · 천년제의 가면 — 늘 한 걸음 앞에 리라가 있었다.');
        return true;
      } },

    /* ── 카시안의 보고서 ── */
    { id: 'c1', reg: ['blue'], when: (s) => ST.after('c3') && !ST.after('c5') && f('c3_duel'),
      async run(c) {
        const n = await comes(c, { look: G.cast.folk('knight', { hat: null, tc: '#5a6a9a' }), name: '기사단 전령' }, 60); if (!n) return false;
        await c.say(n, '헉, 헉… 흰빛 후보님이시죠? 이거, 카시안 경께서 맡기신… 아, 아니 이건 챔피언께 가는 거고, 후보님 건 이쪽…', { face: 'shock' });
        await c.narr('전령이 봉투 두 개를 떨어뜨렸다. 주워 건네주려는데, 손에 남은 쪽의 겉봉에 「천년성 — 챔피언께」라고 적혀 있다.');
        const k = await c.choice(null, ['봉투를 뜯어 읽는다', '읽지 않고 전령에게 돌려준다', '카시안에게 직접 돌려주겠다고 한다']);
        c.flag('il:c1'); c.flag('il:c1_' + k);
        if (k === 0) {
          await c.getItem('il_report', 1, { quiet: true });
          await c.narr('「후보는 검을 늦게 뽑습니다. 먼저 묻습니다. 위험한 버릇입니다. 계속 지켜보겠습니다.」\n「추신. 명령이 바뀌지 않기를 바랍니다.」');
          await tori(c, '찍… 지켜본대. 우리를. 근데 「명령이 바뀌지 않기를」은 무슨 뜻이지?', 'shock');
          await c.say(n, '어, 어어? 그거 뜯으시면… 제가 잘려요!', { face: 'cry' });
        } else if (k === 1) {
          await c.say(n, '휴… 살았다. 후보님은 좋은 분이시네요. 카시안 경 말대로.', { face: 'smile' });
          await c.say(n, '…아, 이것도 말하면 안 되는 거였는데.', { face: 'shock' });
        } else {
          await c.say(n, '직접이요? 카시안 경은 벌써 노랑 땅으로 떠나셨어요. 「먼저 가서 기다린다」고.', { face: 'normal' });
          c.flag('il:c_meet');
        }
        goes(c, n);
        c.journal('블루에서 기사단 전령이 봉투를 뒤바꿔 건넸다. 「천년성 — 챔피언께」. 카시안이 나를 지켜보고 있다.');
        return true;
      } },
    { id: 'c2', reg: ['yellow', 'purple'], when: (s) => ST.after('c4') && !ST.after('c6'),
      async run(c) {
        const n = await comes(c, { cid: 'cassian' }, 48); if (!n) return false;
        c.flag('met:cassian');
        await c.say(n, '…또 만났군, 후보. 나는 무지개 섬으로 먼저 간다. 천년제 경비다.', { face: 'normal' });
        if (f('il:c1_0')) await c.say(n, '내 보고서를 읽었다고 들었다. 전령이 울면서 고해하더군. …괜찮다. 어차피 네 얘기였으니까.', { face: 'smirk' });
        else if (f('il:c1_1')) await c.say(n, '전령이 그러더군. 봉투를 뜯지 않고 돌려줬다고. …고맙다. 그 녀석, 잘릴 뻔했다.', { face: 'smile' });
        else if (f('il:c1_2')) await c.say(n, '나한테 직접 돌려주겠다고 했다며. 여기 있다. …돌려받지. 읽지 않았겠지.', { face: 'normal' });
        await c.say(n, '하나만 말해 두지. 나는 너를 잡으러 다니는 게 아니다. 지켜보라는 명령을 받았을 뿐이다.', { face: 'closed' });
        const k = await c.choice(null, ['「누구의 명령인데?」', '「지켜보는 거면, 같이 걸어도 되잖아.」', '「다음엔 내가 먼저 묻겠어.」']);
        c.flag('il:c2'); c.flag('il:c2_' + k);
        if (k === 0) await c.say(n, '…챔피언. 「찾으면 지켜라. 데려오지 마라.」 이상한 명령이지. 나도 처음엔 그렇게 생각했다.', { face: 'sad' });
        else if (k === 1) await c.say(n, '…기사는 지켜보는 대상과 나란히 걷지 않는다. 그건… 다른 이름의 일이다.', { face: 'shock' });
        else await c.say(n, '하. 그래, 그 버릇. 보고서에 적어 두지. 「여전히 먼저 묻는다.」', { face: 'smirk' });
        goes(c, n);
        c.journal('길 위에서 카시안을 만났다. 「잡으러 다니는 게 아니다. 지켜보라는 명령을 받았을 뿐이다.」');
        return true;
      } },
    { id: 'c3', reg: ['white'], when: (s) => ST.after('c7') && !ST.after('c9') && (f('c7_lumie') || f('c7_plan')),
      async run(c) {
        const n = await comes(c, { look: G.cast.folk('oldw', { tc: '#e8e8f4' }), name: '대성당 우체통지기' }, 36); if (!n) return false;
        await c.say(n, '얘야, 흰빛 손님. 우체통에 주인 없는 편지가 하나 걸렸단다. 「천년성 — 챔피언께」. 받는 쪽에서 돌려보냈어.', { face: 'normal' });
        await c.say(n, '겉봉에 「받지 않음」 도장. 보낸 사람은 카시안. 네 이야기가 들어 있다더라, 기사단 사람들이.', { face: 'sad' });
        const k = await c.choice(null, ['편지를 읽는다', '읽지 않고 카시안에게 전해 달라고 맡긴다']);
        c.flag('il:c3'); c.flag('il:c3_' + k);
        if (k === 0) {
          await c.narr('「후보는 흰빛입니다. 확인했습니다. 대성당의 얼음 창고를 보았습니다. 성녀를 보았습니다. 챔피언께서 무엇을 계산하시는지, 저는 이제 압니다.」');
          await c.narr('「명령을 기다립니다. …명령이 오지 않기를 바랍니다.」');
          await tori(c, '찍… 챔피언이 이 편지를 안 받았대. 일부러.', 'sad');
        } else await c.say(n, '착하구나. 카시안 경이 오면 내가 전하마. …그 기사도 요즘 잠을 못 잔다더라.', { face: 'smile' });
        goes(c, n);
        c.journal('화이트 대성당 우체통. 카시안이 챔피언에게 보낸 편지가 「받지 않음」으로 돌아왔다.');
        return true;
      } },
    // 갚음: 10~11장 — 카시안의 보고서를 둘 넘게 보았을 때
    { id: 'c4', reg: ['colorful', 'black', 'gray'], when: (s) => ST.after('c9') && !ST.after('c12') && casN() >= 2 && f('c9_done'),
      async run(c) {
        const n = await comes(c, { cid: 'cassian' }, 44); if (!n) return false;
        await c.say(n, '…가져가라. 내가 챔피언께 올린 보고서다. 전부.', { face: 'closed' });
        await c.narr('카시안이 끈으로 묶은 종이 뭉치를 내밀었다. 맨 위 장에 붉은 도장 — 「받지 않음」.');
        await c.say(n, '스승님은 한 번도 답하지 않으셨다. 나는 그걸 「명령이 그대로」라고 읽었다. 찾으면 지켜라. 데려오지 마라.', { face: 'sad' });
        await c.say(n, '아스트라에서 스승님 앞에 서거든 이걸 내밀어라. 말로는 안 들으셔도, 장부는 읽으신다.', { face: 'normal' });
        const k = await c.choice(null, ['「같이 가자. 네가 직접 내밀어.」', '「고마워. 꼭 내밀게.」', '「이걸 왜 이제야 주는 거야?」']);
        c.flag('il:c4'); c.flag('il:c4_' + k);
        if (k === 0) await c.say(n, '…지켜보는 자는 나란히 걷지 않는다. 그랬지. 그 말은 취소다. 하늘까지는 못 가도, 사다리 아래까지는 가지.', { face: 'smile' });
        else if (k === 1) await c.say(n, '그래. …나는 내 칼 끝이 어디를 향하는지 아직 정하지 못했다. 정하면 따라가겠다.', { face: 'normal' });
        else await c.say(n, '…명령이 바뀔까 봐 무서웠다. 바뀌면 너를 데려가야 했으니까. 이제 무섭지 않다. 바뀌어도 안 따를 거니까.', { face: 'cry' });
        c.truth('t_report'); c.bond('cassian', 1);
        goes(c, n);
        c.journal('카시안이 챔피언에게 올린 보고서를 모두 건넸다. 「찾으면 지켜라. 데려오지 마라.」 — 카이론의 명령.');
        return true;
      } },

    /* ── 노아의 편지 ── */
    { id: 'n1', reg: ['red', 'blue'], when: (s) => ST.after('c2') && !ST.after('c4') && (f('c1_dew_given') || f('met:noah')),
      async run(c) {
        const n = await comes(c, courier(), 72); if (!n) return false;
        await c.say(n, '참새단 배달이요! 그린 마을에서 온 편지! 받는 사람… 흰빛 형' + (girl() ? '아니 누나' : '') + '!', { face: 'happy' });
        await c.narr('삐뚤빼뚤한 글씨. 노아다.\n「이슬 고마워. 손끝이 덜 비쳐. 의사 선생님이 하얀 땅에 큰 병원이 있대. 거기 가면 다 나을지도 모른대.」\n「할머니는 고민 중이래. 너라면 가 볼 거야?」');
        const k = await c.choice('답장을 쓸까.', ['「가 봐. 무서우면 그림을 그려.」', '「기다려. 내가 가는 길에 알아볼게.」', '답장 대신 그린 쪽 하늘을 한 번 본다']);
        c.flag('il:n1'); c.flag('il:n1_' + k);
        if (k < 2) await c.say(n, '답장 접수! 참새단은 날개보다 빨라요! …날개 없지만!', { face: 'happy' });
        else await c.say(n, '답장 없어요? …그럼 「잘 받았대」라고만 전할게요!', { face: 'normal' });
        await tori(c, '찍. 노아 글씨, 여전히 개구리 같아. …다행이다.', 'smile');
        goes(c, n);
        c.journal('참새단 배달꾼이 노아의 편지를 가져왔다. 하얀 땅에 큰 병원이 있다고 한다.');
        return true;
      } },
    { id: 'n2', reg: ['yellow', 'purple', 'amber', 'mist'], when: (s) => ST.after('c4') && !ST.after('c7') && f('il:n1'),
      async run(c) {
        const n = await comes(c, courier(), 72); if (!n) return false;
        await c.say(n, '참새단 배달이요! 이번엔 마차 역에서 온 편지!', { face: 'happy' });
        await c.narr('「나 마차 탔어. 하얀 땅 가는 마차. 나 같은 애들이 가득이야. 다들 손끝이 비쳐.」\n「' + (f('il:n1_0') ? '무서워서 그림 그렸어. 네 말대로.' : f('il:n1_1') ? '네가 알아본다고 했는데 못 기다렸어. 미안.' : '답장은 없었지만, 하늘을 봤다고 들었어.') + '」\n「마차 창밖으로 네가 지나간 길이 보였어. 탑이 많았어. 탑 옆을 지날 때마다 다들 조용해져.」');
        const k = await c.choice('답장을 쓸까.', ['「탑 옆을 지날 땐 노래를 불러.」', '「하얀 땅에 가면 꼭 찾아갈게.」']);
        c.flag('il:n2'); c.flag('il:n2_' + k);
        await c.say(n, '접수! …저기, 하얀 땅 가는 마차, 요즘 자주 지나가요. 우리 동네 애도 탔어요.', { face: 'sad' });
        goes(c, n);
        c.journal('노아가 하얀 땅으로 가는 마차를 탔다. 손끝이 비치는 아이들이 가득했다고 한다.');
        return true;
      } },
    { id: 'n3', reg: ['rainbow', 'white', 'purple'], when: (s) => ST.after('c6') && !f('c7_noah') && f('il:n2') && (f('white_hair') || f('c6_done') || ST.after('c7')),
      async run(c) {
        const n = await comes(c, courier(), 72); if (!n) return false;
        await c.say(n, '참새단 배달이요! 하얀 땅 병동에서! 이건 글씨가 예뻐요. 어른 글씨.', { face: 'happy' });
        await c.narr('「노아의 손이 떨려 대신 씁니다. 노아는 잘 지냅니다. 매일 창밖을 그립니다.」\n「어제는 앞머리 한 가닥이 하얀 사람을 그렸어요. 누구냐고 물으니 「곧 올 사람」이래요.」\n「— 병동에서, L.」');
        await tori(c, '찍… L? 하얀 땅의 L이면… 성녀님? 성녀님이 노아 편지를 대신 써 줬어?', 'shock');
        const k = await c.choice(null, ['「곧 간다고 전해 줘.」', '편지를 접어 가슴에 넣는다']);
        c.flag('il:n3'); c.flag('il:n3_' + k);
        if (!S().inv.il_noahs) await c.getItem('il_noahs', 1, { quiet: true });
        await c.say(n, k === 0 ? '접수! 「곧 간다」! 제일 짧고 제일 좋은 답장이에요!' : '…답장 안 써도 되는 편지도 있죠. 그런 거 같아요.', { face: 'smile' });
        goes(c, n);
        c.journal('하얀 땅 병동에서 편지가 왔다. 노아 대신 「L」이 썼다. 노아는 앞머리 한 가닥이 하얀 사람을 그렸다.');
        return true;
      } },
  ];

  /* ═════════ 언제 · 어디서 ═════════ */
  let freeT = 0, lastReg = null, regT = 0;
  ST.onTick.push((dt) => {
    const s = S(), Wd = W(), m = Wd.map, p = Wd.player;
    if (!s || !m || !p || !m.overworld || G.script.running || G.script.busy || (G.script.queue && G.script.queue.length) || s.duel || p.state === 'dead' || (G.game && G.game.scene && G.game.scene !== 'play') || (G.ui.blocking && G.ui.blocking()) || ST.staging) { freeT = Math.min(freeT, 2); return; }
    const reg = OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS));
    if (reg !== lastReg) { lastReg = reg; regT = 0; }
    regT += dt;
    if (!calm() || p.swimming || p.state === 'swim') { freeT = Math.min(freeT, 3); return; }
    if (OW.inTown && OW.inTown(Math.floor(p.x / TS), Math.floor(p.y / TS), 2)) { freeT = Math.min(freeT, 4); return; }   // 마을 안은 마을 사람들 몫
    freeT += dt;
    if (freeT < 9 || regT < 6 || (s.t || 0) - (s.ilLast || -999) < 70) return;
    const X = IL.find((x) => !f('il:' + x.id) && !f('il_try:' + x.id + ':' + Math.floor((s.t || 0) / 30)) && x.reg.includes(reg) && x.when(s));
    if (!X) return;
    freeT = 0;
    G.script.run(async (c) => {
      c.lock(true); await c.cinema(true);
      let ok = false;
      try { ok = await X.run(c); } finally { await c.cinema(false); c.lock(false); }
      const st = S();
      if (ok) { st.ilLast = st.t || 0; st.flags['il:' + X.id] = true; } else st.flags['il_try:' + X.id + ':' + Math.floor((st.t || 0) / 30)] = true;   // 설 자리가 없었다 — 조금 뒤에 다시
    });
  });

  /* ═════════ 노아: 화이트 병동에서 답장 이야기 ═════════ */
  ST.hookTalk('w_ward', 'noah', (s) => noahN() >= 2 && !s.flags['il:n4'] && ST.after('c7'), async (c, n) => {
    c.flag('il:n4');
    await c.say(n, '…왔다! 진짜 왔다! 곧 올 사람!', { face: 'happy' });
    if (f('il:n2_0')) await c.say(n, '마차에서 탑 옆을 지날 때 노래 불렀어. 다들 따라 불렀어. 탑이 조금 덜 무서웠어.', { face: 'smile' });
    else if (f('il:n2_1')) await c.say(n, '찾아온다고 했잖아. 그래서 매일 창밖을 그렸어. 그림 속에 네가 올 길을 그려 놨어.', { face: 'smile' });
    if (f('il:n3')) await c.say(n, '편지 대신 써 준 사람? 성녀님. 손이 차가운데 글씨는 따뜻해. …성녀님도 손끝이 비쳐. 우리보다 더.', { face: 'sad' });
    await tori(c, '찍… 노아, 키 컸다. 나보다 조금.', 'cry');
    if (S().inv.il_noahs) await c.narr('편지 묶음을 꺼내 보이자, 노아가 자기 개구리 글씨를 보고 웃었다.');
    c.bond('noah', 1); c.exp(40);
    c.journal('화이트 병동에서 노아를 만났다. 편지 속 「곧 올 사람」이 왔다. 성녀 루미에의 손끝도 비친다고 한다.');
  });

  /* ═════════ 소문 (54f_news) ═════════ */
  const EV = ST.NEWS_EV;
  if (EV) {
    const ev = (id, o) => EV.push(Object.assign({ id }, o));
    ev('il_feather', { reg: ['red'], ch: 'c2', when: (s) => s.flags['il:l1'],
      near: ['셋째 굴 무너진 거 들었어? 표지판에 깃털 하나가 꽂혀 있어서 다들 살았대.', '검은 망토 아가씨가 노래 한 소절로 지도를 사 갔대. 그 노래 들은 광부들이 다 울었대.'],
      far: ['레드 광산에 까만 깃털 이야기가 돈대. 밤의 땅 사람이 다녀갔다나.'],
      kid: { near: ['깃털 표지판 봤어? 나도 깃털 꽂고 다닐 거야!'] } });
    ev('il_report', { reg: ['blue', 'yellow'], ch: 'c3', when: (s) => s.flags['il:c1'],
      near: ['기사단 전령이 봉투를 뒤바꿔서 혼났대. 「챔피언께」 가는 걸 흰빛한테 줬다나.', '카시안 경이 흰빛을 지켜본대. 잡는 게 아니라 지켜본대. 기사가 그런 일도 해?'],
      far: ['천년성으로 가는 편지가 요즘 많아. 다 흰빛 얘기래.'] });
    ev('il_wagon', { reg: 'all', ch: 'c4', when: (s) => s.flags['il:n2'],
      near: ['하얀 땅 가는 마차 봤어? 손끝 비치는 아이들이 가득이래.', '아픈 아이들을 성녀님 병동으로 보낸대. 마차 값은 성녀님이 낸대.'],
      far: ['요즘 큰길에 하얀 마차가 자주 지나가. 창문마다 그림이 붙어 있어.'],
      kid: { near: ['하얀 마차 창문에 그림 붙어 있었어! 개구리 그림!'] } });
  }

  /* ═════════ 결말의 그 뒤 ═════════ */
  ST.moreFates = ST.moreFates || [];
  ST.moreFates.push((id, add) => {
    if (f('il:l5')) add('lyra', f('il:l5_1') ? '리라는 더 이상 한 걸음 앞에서 걷지 않는다. 옆에서 걷는다. 가끔 뒤처지면 토리아가 꼬리로 등을 민다.' : '리라는 지금도 가끔 길 위에 깃털을 꽂는다. 이제는 「여기 꽃이 예쁨」 같은 표시다.');
    else if (lyraN() >= 1) add('lyra', '레드 광산 셋째 굴 표지판엔 아직 검은 깃털이 꽂혀 있다. 광부들은 그걸 「밤의 수호」라고 부른다.');
    if (f('il:c4')) add('cassian', f('il:c4_0') ? '카시안은 빛의 사다리 아래에서 끝까지 기다렸다. 돌아온 너를 보고, 보고서 마지막 장을 썼다. 「명령 완수.」' : '카시안의 보고서 묶음은 천년성 기록관에 남았다. 「받지 않음」 도장 위에 누가 「받음」이라고 덧찍었다.');
    else if (f('il:c1')) add('cassian', '블루의 그 전령은 잘리지 않았다. 지금은 참새단에게 봉투 다루는 법을 가르친다.');
    if (f('il:n4')) add('noah', '노아는 편지를 모아 책으로 묶었다. 제목은 「곧 올 사람」. 마지막 장은 아직 비어 있다. 네가 답장을 쓸 자리.');
    else if (noahN() >= 1) add('noah', '참새단은 노아의 편지를 배달한 일을 제일 자랑스러워한다. 「개구리 글씨 편지」라고 부른다.');
  });

  ST.interludes = { IL, lyraN, casN, noahN };
})();
