/* 갈림길 부탁 — 사람들의 새 이야기(54 목소리)에서 자라난 부탁 일곱. 들판에 물건이 놓이고, 끝에서 고른다.
   · 「등불 든 아이」 별자리 (관측 조수 벨 · 2장~): 관측석 셋(레드 · 옐로 · 화이트)에서 흑점을 재고 → 펴낸다 / 이름 붙인다 / 금고에 넣는다
   · 카렐의 갈림길 (그린 · 6장~): 참나무 밑에 꽂힌 목검 → 기사 / 의원 / 네가 정해
   · 마지막 줄 (시인 에코 · 6장~): 한나 · 레지나 · 루멘 · 키키에게 「마지막 한 줄」을 받아 와서 고른다 → 결말의 그 뒤에 새겨진다
   · 이름 없는 묘 (묘지기 모르트 · 9장~): 밤의 장부 찢긴 장 셋 → 이름을 새긴다 / 등불을 단다
   · 열두 병 (색 모으는 틴트 · 8장~): 대륙 열두 곳의 색 방울 → 틴트에게 / 그레이 땅에 붓는다
   · 젊은 카이론의 편지 (3장~): 그린 · 퍼플 · 무지개 · 화이트 · 블랙에 숨은 편지 다섯 → 할머니께 / 세린에게 / 카이론에게
   · 흑점에게 가는 편지 (우편배달부 핀 · 11장~): 노아가 쓴 편지 — 마지막 싸움 뒤에 읽힌다 (95b_endings) */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles;
  const T = TL.T, TS = TL.TS;
  const ST = G.story, OW = G.ow, D = G.data;
  const S = () => G.state;
  const W = () => G.world;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;
  const item = (id, o) => { D.ITEMS[id] = Object.assign(D.ITEMS[id] || { id, price: 0 }, o); };
  const Q = (id, o) => { D.QUESTS[id] = Object.assign({ id }, o); };
  const open = (reg) => !ST.regionOpen || ST.regionOpen(reg);
  const qOn = (id) => { const q = S().quests[id]; return !!(q && q.st === 'on'); };
  const qDone = (id) => { const q = S().quests[id]; return !!(q && q.st === 'done'); };

  item('ac_starmap', { type: 'acc', grade: 3, name: '벨의 별 지도', fx: { int: 2, dex: 2, exp: 0.05 }, desc: '「등불 든 아이」 별자리가 그려진 손바닥만 한 지도. 지력 +2, 솜씨 +2, 얻는 빛 +5%.' });
  item('ac_wood', { type: 'acc', grade: 2, name: '카렐의 목검 장식', fx: { str: 2, vit: 1 }, desc: '카렐이 깎아 준 손가락만 한 목검. 힘 +2, 체력 +1.' });
  item('ac_poem', { type: 'acc', grade: 3, name: '에코의 시 한 장', fx: { int: 3, sp: 0.05 }, desc: '천년제 시의 초고. 마지막 줄 자리가 비어 있었다. 지력 +3, 필살 게이지 +5%.' });
  item('ac_rainbow', { type: 'acc', grade: 4, name: '열두 빛깔 병', fx: { str: 2, vit: 2, int: 2, dex: 2 }, desc: '틴트가 색 방울 하나씩을 덜어 담아 준 작은 병. 모든 능력치 +2(지구력 제외).' });
  item('letter_sun', { type: 'letter', name: '흑점에게 가는 편지', desc: '받는 이: 「흑점」. 보낸 이: 그린의 아이. 크레파스 냄새가 난다.', read: '봉투 위에 웃는 까만 동그라미가 그려져 있다.' });
  item('kletters', { type: 'key', name: '젊은 카이론의 편지', desc: '세린에게 보내지 못한 편지들. 끈으로 묶여 있다.', read: '글씨가 장부 글씨와 같다. 그런데 줄 사이가 넓다.' });

  /* 마을 사람(tw_*)은 세상을 지을 때(35_folk의 OW 훅) 집이 정해지며 서므로, 그 뒤에 어느 지도에 섰든 찾아서 건다 */
  const FH = [];
  const hookFolk = (id, cond, fn) => FH.push([id, cond, fn]);
  OW.hooks.push(() => {
    FH.forEach(([id, cond, fn], i) => {
      const mapId = Object.keys(ST.people).find((k) => ST.people[k].some((x) => x.id === id));
      if (!mapId) { console.warn('[tales] no folk', id); return; }
      const sp = ST.people[mapId].find((x) => x.id === id);
      sp.__th = sp.__th || {};
      if (sp.__th[i]) return;
      ST.hookTalk(mapId, id, cond, fn);
      for (const o of ST.people[mapId]) if (o.id === id) { o.__th = o.__th || {}; o.__th[i] = true; }
    });
  });

  /* ═════════ 들판에 놓을 자리 (마을에서 걸어 닿는 땅) ═════════ */
  const SPOTS = {};
  function spot(key, reg, dx, dy) {
    if (SPOTS[key]) return SPOTS[key];
    const m = G.build.get('world'), t = OW.towns[reg]; if (!t || !t.plaza) return null;
    let A = null; try { A = G.sanity && G.sanity.fresh(m); } catch (e) { A = null; }
    const good = (x, y) => { if (!A) return true; const i = m.i(x, y), c0 = A.L.comp[i]; return c0 >= 0 && !!A.good[c0]; };
    return (SPOTS[key] = OW.near(m, t.plaza.x + dx, t.plaza.y + dy, (x, y, ter) => ter !== T.ROAD && good(x, y), 14));
  }
  /** 들판 물건: 빛 점 하나 + 작은 그림 */
  class Thing extends G.props.Spot {
    draw(g, cx, cy) {
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy), t = W().t;
      if (this.art) this.art(g, x, y, t);
      if (Math.sin(t * 3 + this.x) > 0.6) { g.fillStyle = this.col || '#fff8c0'; g.fillRect(x, y - 14, 1, 1); g.fillRect(x - 1, y - 13, 3, 1); }
    }
  }
  const ART = {
    stone: (g, x, y) => { g.fillStyle = '#5a5a66'; g.fillRect(x - 5, y - 9, 10, 9); g.fillStyle = '#8a8a96'; g.fillRect(x - 4, y - 8, 8, 2); g.fillStyle = '#c8c8d8'; for (let k = 0; k < 4; k++) g.fillRect(x - 3 + k * 2, y - 5, 1, 2); },
    letter: (g, x, y, t) => { const b = Math.sin(t * 2) * 0.5; g.fillStyle = '#e8dcc0'; g.fillRect(x - 4, y - 6 + b, 8, 5); g.fillStyle = '#c84a3a'; g.fillRect(x - 1, y - 5 + b, 2, 2); },
    sword: (g, x, y) => { g.fillStyle = '#8a6a3a'; g.fillRect(x, y - 14, 2, 12); g.fillStyle = '#6a4a2a'; g.fillRect(x - 2, y - 6, 6, 2); g.fillStyle = '#f4f0e0'; g.fillRect(x + 3, y - 12, 4, 3); },
    page: (g, x, y, t) => { g.fillStyle = '#d8d0c0'; g.fillRect(x - 3, y - 4, 6, 4); g.fillStyle = '#2a2438'; g.fillRect(x - 2, y - 3, 4, 1); if (Math.sin(t * 4) > 0) { g.fillStyle = '#b87aff'; g.fillRect(x + 3, y - 6, 1, 1); } },
    drop: (g, x, y, t, col) => { const b = Math.sin(t * 3) * 1.2; g.globalAlpha = 0.3; g.fillStyle = col; g.beginPath(); g.arc(x, y - 6 + b, 5, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.fillStyle = col; g.fillRect(x - 1, y - 8 + b, 3, 4); g.fillRect(x, y - 9 + b, 1, 1); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 8 + b, 1, 1); },
  };

  /* ═════════ 1. 「등불 든 아이」 별자리 — 관측 조수 벨 ═════════ */
  Q('bel_stars', { name: '「등불 든 아이」 별자리', who: '관측 조수 벨', desc: (s) => { const n = ['red', 'yellow', 'white'].filter((r) => s.flags['belst:' + r]).length; return n < 3 ? '레드 · 옐로 · 화이트의 오래된 관측석에서 흑점을 잰다. (' + n + ' / 3) 화이트는 설원이 열려야 갈 수 있다.' : '레드 관측 조수 벨에게 잰 값을 가져간다.'; }, after: '사라진 별은 사라진 게 아니었다. 흑점이 그 앞을 가리고 있었다.' });
  const STONES = [
    { reg: 'red', off: [-12, -9], text: '붉은 산 관측석. 돌에 새긴 눈금 사이로 흑점이 보인다. 「등불 든 아이」 별자리의 손 자리 — 별이 있어야 할 곳을 정확히 덮고 있다.\n[y]관측값: 손 자리, 각도 41.2[/]' },
    { reg: 'yellow', off: [13, -10], text: '모래바다 관측석. 여기서 보는 흑점은 조금 더 크다. 모래 언덕 위 낮게 뜬 별 하나가 흑점 쪽으로 기울어 있다. 별도 배가 고픈 것처럼.\n[y]관측값: 손 자리, 각도 41.6 — 조금 더 가까이[/]' },
    { reg: 'white', off: [12, -8], text: '설원 봉우리 관측석. 흑점 가장자리가 희미하게 빛난다. 먹은 빛이 테두리로 새어 나오는 것처럼. 그 빛의 색이… 하얗다.\n[y]관측값: 손 자리, 각도 41.9 — 테두리에 흰빛[/]' },
  ];
  hookFolk('tw_bel', (s) => (ST.after('c2') && !s.quests.bel_stars) || (qOn('bel_stars') && ['red', 'yellow', 'white'].every((r) => s.flags['belst:' + r])), async (c, n) => {
    const s = S();
    if (!s.quests.bel_stars) {
      await c.say(n, '저기, 잠깐만. 너 여행 다니지? 부탁 하나 해도 돼? 박사님한텐 비밀이야.', { face: 'normal' });
      await c.say(n, '「등불 든 아이」라는 별자리가 있어. 983년 겨울부터 그 아이 손에 든 등불 별이 안 보여. 박사님은 「사라졌다」고만 해.', { face: 'sad' });
      await c.say(n, '근데 별은 그렇게 쉽게 안 사라져. 대륙에 오래된 관측석이 세 개 있어. 레드 산, 옐로 모래바다, 화이트 설원. 세 군데서 같은 별을 재면 뭔가 보일 거야.', { face: 'normal' });
      const k = await c.choice('벨이 별자리표를 내민다.', ['재 오겠다', '나중에']);
      if (k !== 0) { await c.say(n, '응… 하늘은 안 도망가. 천천히 와.', { face: 'smile' }); return; }
      c.quest('bel_stars', 'on');
      c.journal('관측 조수 벨의 부탁: 레드 · 옐로 · 화이트의 관측석에서 「등불 든 아이」 별자리의 사라진 별 자리를 잰다.');
      await c.say(n, '관측석은 마을에서 조금 떨어진 높은 자리에 있어. 돌에 눈금이 새겨져 있어. 거기 서서 하늘을 보기만 하면 돼.', { face: 'smile' });
      return;
    }
    c.lock(true); await c.cinema(true);
    await c.say(n, '세 군데 다 쟀어?! 보여 줘. …41.2, 41.6, 41.9. 조금씩 다가오고 있어. 그리고 — 테두리에 흰빛.', { face: 'shock' });
    await c.say(n, '별은 사라진 게 아니야. 흑점이 그 앞에 서 있는 거야. 983년 겨울, 하늘로 올라간 흰빛이 있었지. 흑점은 그 빛을 먹으러 거기 멈춘 거야. 그리고 테두리로… 조금씩 새어 나와.', { face: 'sad' });
    await c.say(n, '이걸 어떻게 할까. 박사님은 993년에 비슷한 계산을 하고 금고에 넣었어. 무서워서.', { face: 'normal' });
    const k = await c.choice('벨이 계산표를 꼭 쥔다.', ['박사님께 보여 드리고 함께 펴낸다', '네가 그 별에 이름을 붙여 줘', '금고에 넣자. 아직은']);
    if (k === 0) { c.flag('bel_publish'); await c.say(n, '…응. 혼자 무서운 것보다 둘이 무서운 게 나아. 박사님한테 가 볼게. 차 끓여 놓고.', { face: 'smile' }); }
    else if (k === 1) { c.flag('bel_name'); await c.say(n, '이름? …「토리아」. 날지 못해도 하늘에 있는 별. 박사님은 안 된다고 하겠지만. 내 별 지도엔 그렇게 적을 거야.', { face: 'happy' }); await c.say('toria', '찍?! 나? 별?! …찍.', { face: 'shock' }); }
    else { c.flag('bel_secret'); await c.say(n, '…응. 박사님 마음을 이제 알겠어. 무서운 계산은 무거워. 나도 금고에 넣을게. 박사님 표 옆에.', { face: 'sad' }); }
    c.quest('bel_stars', 'done');
    await c.getItem('ac_starmap');
    const gain = Math.max(30, Math.round(G.data.expNext(s.lv) * 0.15)); G.st.gainExp(s, gain);
    await c.say(null, '[y]경험 +' + gain + '[/]', { style: 'sys' });
    c.journal(['벨은 박사님과 별 지도를 펴내기로 했다.', '벨은 흑점 뒤의 별에 「토리아」라는 이름을 붙였다.', '벨은 계산표를 금고에 넣었다. 아스텔 박사처럼.'][k] + ' 흑점은 983년 겨울 하늘로 올라간 흰빛 앞에 멈춰 서 있다.');
    await c.cinema(false); c.lock(false);
  });

  /* ═════════ 2. 카렐의 갈림길 ═════════ */
  Q('karel_way', { name: '카렐의 갈림길', who: '카렐', desc: '그린 마을 참나무 아래, 카렐이 목검을 꽂아 두고 기다린다.', after: '카렐이 갈 길을 골랐다. 아니면, 고르지 않기로 골랐다.' });

  /* ═════════ 3. 마지막 줄 — 시인 에코 ═════════ */
  const LINES = { hanna: { id: 'tw_hanna', reg: 'green', who: '한나', line: '식기 전에, 나눠 먹자.' }, regina: { id: 'tw_regina', reg: 'white', who: '수녀 레지나', line: '숫자 옆에, 이름을 적었다.' }, lumen: { id: 'tw_lumen', reg: 'black', who: '등불장이 루멘', line: '꺼지지 않게, 누군가 봐 주었다.' }, kiki: { id: 'tw_kiki', reg: 'colorful', who: '비둘기 조련사 키키', line: '편지는 늦게 와도, 도착한다.' } };
  const gotLines = (s) => Object.keys(LINES).filter((k) => s.flags['eline:' + k]);
  Q('echo_line', { name: '마지막 줄', who: '시인 에코', desc: (s) => { const n = gotLines(s).length; return n < 4 ? '천년제 시의 마지막 줄을 찾는다. 대륙 사람들에게 「마지막 한 줄」을 물어 온다 — 그린 한나 · 화이트 레지나 · 블랙 루멘 · 알록달록 키키 (' + n + ' / 4). 둘만 모아도 에코에게 돌아갈 수 있다.' : '무지개 시인 에코에게 돌아가 마지막 줄을 고른다.'; }, after: '에코의 시가 끝났다. 마지막 줄은 내가 골랐다.' });
  hookFolk('tw_echo', (s) => (ST.after('c6') && !s.quests.echo_line) || (qOn('echo_line') && gotLines(s).length >= 2), async (c, n) => {
    const s = S();
    if (!s.quests.echo_line) {
      await c.say(n, '천 번째 천년제 시를 다 썼어. 마지막 줄만 빼고. 내 말로 끝내면 거짓말 같아서.', { face: 'sad' });
      await c.say(n, '부탁이 있어. 대륙을 다니면서 사람들한테 물어봐 줘. 「당신이라면 이 시를 어떻게 끝내겠어요?」', { face: 'normal' });
      await c.say(n, '빵집 주인, 수녀님, 등불 만드는 사람, 비둘기 키우는 아이… 서로 모르는 사람들 말로 끝나는 시. 그게 천년제 같아.', { face: 'smile' });
      c.quest('echo_line', 'on');
      c.journal('시인 에코의 부탁: 천년제 시의 마지막 줄을 대륙 사람들에게 물어 온다. (그린 한나 · 화이트 레지나 · 블랙 루멘 · 알록달록 키키)');
      return;
    }
    c.lock(true); await c.cinema(true);
    await c.say(n, '모아 왔구나! 읽어 줘. …아, 다 좋아. 하나만 고르자. 네가 골라 줘. 이 시를 다 읽은 사람이 너니까.', { face: 'happy' });
    const keys = gotLines(s);
    const opts = keys.map((k) => ({ t: '「' + LINES[k].line + '」', sub: '— ' + LINES[k].who }));
    opts.push({ t: '「그리고 아무도 혼자 빛나지 않았다.」', sub: '— 에코가 처음 생각한 줄' });
    const k = await c.choice('마지막 줄을 고른다.', opts);
    const line = k < keys.length ? LINES[keys[k]].line : '그리고 아무도 혼자 빛나지 않았다.';
    s.flags.echo_line = line;
    await c.say(n, '「' + line + '」 …응. 이거야. 이 줄로 끝나는 시라면, 천 년 뒤에도 누가 읽어 줄 거야.', { face: 'cry' });
    c.quest('echo_line', 'done');
    await c.getItem('ac_poem');
    c.journal('에코의 천년제 시가 끝났다. 마지막 줄: 「' + line + '」');
    await c.cinema(false); c.lock(false);
  });
  for (const [k, L] of Object.entries(LINES)) {
    hookFolk(L.id, (s) => qOn('echo_line') && !s.flags['eline:' + k], async (c, n) => {
      const ask = { hanna: '시의 마지막 줄? 어머, 나한테? …빵 굽는 사람이 무슨 시를. 음… 「식기 전에, 나눠 먹자.」 우리 가게에서 제일 많이 하는 말이야.', regina: '마지막 줄이라… 나는 평생 장부의 마지막 줄만 썼어요. 숫자로. 이번엔 다르게 쓰고 싶네요. 「숫자 옆에, 이름을 적었다.」', lumen: '시는 몰라. 등불은 알지. 「꺼지지 않게, 누군가 봐 주었다.」 내 설계도에 적은 비밀이야. 시로 써도 돼.', kiki: '마지막 줄? 비둘기들한테 물어볼게. …음, 「편지는 늦게 와도, 도착한다.」 우리 비둘기들 자랑이야!' }[k];
      await c.say(n, ask, { face: 'smile' });
      S().flags['eline:' + k] = true;
      const got = gotLines(S()).length;
      await c.say(null, '마지막 줄을 받았다: [y]「' + L.line + '」[/] (' + got + ' / 4)', { style: 'sys' });
    });
  }

  /* ═════════ 4. 이름 없는 묘 — 묘지기 모르트 ═════════ */
  Q('mort_names', { name: '이름 없는 묘', who: '묘지기 모르트', desc: (s) => { const n = [0, 1, 2].filter((i) => s.flags['mortp:' + i]).length; return n < 3 ? '밤의 도시 둘레에 흩어진 「밤의 장부」 찢긴 장을 찾는다. (' + n + ' / 3)' : '묘지기 모르트에게 장부 쪽을 가져간다.'; }, after: '이름 없는 묘들이 무언가를 얻었다.' });
  hookFolk('tw_graves', (s) => (ST.after('c9') && !s.quests.mort_names) || (qOn('mort_names') && [0, 1, 2].every((i) => s.flags['mortp:' + i])), async (c, n) => {
    const s = S();
    if (!s.quests.mort_names) {
      await c.say(n, '녹턴이 장부에서 지운 사람들이 여기 누워 있어. 이름이 없지. 지울 때 장부를 찢어 버렸거든.', { face: 'closed' });
      await c.say(n, '찢긴 장이 바람에 날려 도시 둘레에 떨어졌다는 소문이 있다. 밤의 바람은 멀리 안 가. 셋쯤은 남아 있을 거야.', { face: 'normal' });
      await c.say(n, '주워 오면… 아니, 주워 와도 어떻게 할지 모르겠군. 일단 주워 와 다오.', { face: 'sad' });
      c.quest('mort_names', 'on');
      c.journal('묘지기 모르트의 부탁: 밤의 도시 둘레에서 녹턴이 찢은 「밤의 장부」 쪽 셋을 찾는다.');
      return;
    }
    c.lock(true); await c.cinema(true);
    await c.narr('찢긴 장 세 쪽. 이름이 빼곡하다. 이름마다 줄이 그어져 있다. 줄 아래로 글씨가 그대로 읽힌다.');
    await c.say(n, '…줄을 그어도 이름은 남는군. 지우는 건 원래 이렇게 서툰 거야.', { face: 'sad' });
    const k = await c.choice('모르트가 끌을 든다.', ['묘비마다 이름을 새긴다', '이름은 장부에 두고, 묘마다 등불을 단다']);
    if (k === 0) { c.flag('graves_named'); await c.say(n, '새기자. 하나씩. 늦었지만. 이름은 불려야 이름이니까.', { face: 'normal' }); }
    else { c.flag('graves_lamps'); await c.say(n, '그래. 지워진 걸 다시 새기면 녹턴도 아플 거야. 그 녀석도 이제 사람이니까. 대신 불을 켜 두자. 누가 여기 있다는 표시로.', { face: 'smile' }); }
    c.quest('mort_names', 'done');
    c.gold(600 + 40 * (s.lv || 1));
    s.pts = (s.pts || 0) + 1;
    await c.say(null, '[y]성장 점수 +1[/]', { style: 'sys' });
    c.journal(k === 0 ? '밤의 묘지 묘비마다 이름이 새겨졌다.' : '밤의 묘지 이름 없는 묘마다 등불이 켜졌다.');
    await c.cinema(false); c.lock(false);
  });

  /* ═════════ 5. 열두 병 — 색 모으는 틴트 ═════════ */
  const DROPS = [
    ['green', '초록', '#6ae07a', [-14, 6]], ['red', '빨강', '#ff5a4a', [11, -6]], ['blue', '파랑', '#4a9aff', [-13, -6]], ['yellow', '노랑', '#ffe04a', [-6, 13]],
    ['purple', '보라', '#b87aff', [12, -7]], ['rainbow', '무지개', '#ff9ad8', [12, -6]], ['white', '하양', '#ffffff', [-12, -7]], ['gray', '은빛', '#c8d0dc', [-11, 9]],
    ['black', '검정', '#5a4a7a', [-12, 8]], ['colorful', '주황', '#ff9a3a', [-10, -8]], ['mist', '연보라', '#d8c8ff', [11, 9]], ['amber', '단풍빛', '#e87a3a', [-12, -8]],
  ];
  const dropN = (s) => DROPS.filter((d) => s.flags['tint:' + d[0]]).length;
  Q('tint_bottles', { name: '열두 병', who: '색 모으는 틴트', desc: (s) => '대륙 열두 곳에 떨어진 색 방울을 모아 틴트의 빈 병을 채운다. (' + dropN(s) + ' / 12) 방울은 마을 둘레, 빛이 고인 자리에 있다.', after: '틴트의 병이 다 찼다.' });
  hookFolk('tw_tint', (s) => (ST.after('c8') && !s.quests.tint_bottles) || (qOn('tint_bottles') && ((dropN(s) >= 6 && !s.flags.tint_half) || dropN(s) >= 12)), async (c, n) => {
    const s = S();
    if (!s.quests.tint_bottles) {
      await c.say(n, '빈 병이 열한 개야. 대륙 어딘가엔 색이 방울져 떨어져 있대. 세피아 언니가 그랬어. 빛이 많이 고인 데엔 색도 고인대.', { face: 'normal' });
      await c.say(n, '…나 대신 모아 줄 수 있어? 나는 그레이 밖에 못 나가. 엄마가 아파서.', { face: 'sad' });
      c.quest('tint_bottles', 'on');
      c.journal('색 모으는 틴트의 부탁: 대륙 열두 곳의 색 방울을 모아 빈 병을 채운다. 마을 둘레, 빛이 고인 자리를 찾자.');
      return;
    }
    if (dropN(s) < 12) {
      s.flags.tint_half = true;
      await c.say(n, '여섯 개다! 초록… 아니 이건 뭐야, 이름이 뭐야? 다 예쁘다. 예쁘다는 말을 여섯 번 했어.', { face: 'happy' });
      await c.getItem('potion_b', 2);
      await c.say(n, '나머지도 모아 줄 거지? 열두 개가 다 차면… 하고 싶은 게 있어.', { face: 'smile' });
      return;
    }
    c.lock(true); await c.cinema(true);
    await c.say(n, '열두 개. 다 찼어. …손이 떨려.', { face: 'cry' });
    await c.say(n, '하고 싶은 게 두 가지야. 하나는 이 병들을 들고 다니면서 그레이 애들한테 보여 주는 거. 하나는… 고철 언덕에 다 붓는 거. 그 땅이 색을 기억하게.', { face: 'normal' });
    const k = await c.choice('틴트가 병들을 끌어안는다.', ['네가 가지고 다니며 보여 줘', '고철 언덕에 함께 붓자']);
    if (k === 0) { c.flag('tint_keep'); await c.say(n, '응. 한 명씩 보여 줄게. 「예쁘다」도 가르쳐 줄게. 세피아 언니가 나한테 한 것처럼.', { face: 'happy' }); }
    else { c.flag('tint_pour'); await c.narr('고철 언덕 꼭대기. 병 열두 개를 기울였다. 색 방울들이 흙에 스몄다. 회색 흙이 잠깐 무지개처럼 반짝였다. 그리고 — 조용히, 초록 싹 하나.'); await c.say(n, '…살았어. 땅이. 봐, 봐!', { face: 'cry' }); }
    c.quest('tint_bottles', 'done');
    await c.getItem('ac_rainbow');
    c.journal(k === 0 ? '틴트는 열두 빛깔 병을 들고 그레이 아이들에게 색을 보여 주러 다닌다.' : '그레이 고철 언덕에 열두 빛깔을 부었다. 그 자리에서 첫 싹이 났다.');
    await c.cinema(false); c.lock(false);
  });

  /* ═════════ 6. 젊은 카이론의 편지 ═════════ */
  const KL = [
    { reg: 'green', off: [-15, -8], from: 'c3', text: '「세린. 참나무에 이름을 새기자고 한 건 너였다. 나는 칼을 빌려줬을 뿐이다. 칼날이 상했다. 대신 네 웃음을 받았으니 셈은 맞다. — K」\n[s]980년 여름. 접힌 자리가 닳아 찢어질 것 같다.[/]' },
    { reg: 'purple', off: [-13, -8], from: 'c5', text: '「베라 선생님 찻잔을 또 깼다며. 세 번째. 선생님이 나한테 편지를 보냈다. 「당신 약혼녀 좀 말려요.」 약혼녀라니. 아직 말도 안 꺼냈는데. …꺼내도 될까. — K」\n[s]981년 봄. 「약혼녀」에 줄을 그었다가 다시 지운 자국.[/]' },
    { reg: 'rainbow', off: [10, 10], from: 'c6', text: '「계산을 하나 했다. 흑점이 온다. 빛이 가장 많이 모인 곳으로. 그건 너다. 세린, 이 계산이 틀렸다고 말해 다오. 너는 늘 내 계산을 틀렸다고 했잖아. — K」\n[s]982년 천년제 전날. 글씨가 장부 글씨처럼 반듯하다. 끝 획만 떨렸다.[/]' },
    { reg: 'white', off: [10, 9], from: 'c7', text: '「아이가 생겼다고. …둘이라고. 나는 오늘 장부에 「허용 손실」이라는 칸을 승인했다. 같은 날. 어떤 손으로 기뻐해야 할지 모르겠다. — K」\n[s]983년 가을. 잉크가 번진 곳이 두 군데.[/]' },
    { reg: 'black', off: [10, 10], from: 'c9', text: '「네가 수정에 들어가겠다고 했다. 나는 말리지 못했다. 계산이 맞았으니까. 나는 처음으로 계산이 틀리기를 빌었다. 녹턴에게 내 그림자를 맡긴다. 아이들을 지켜 달라고. 나는 탑을 세우겠다. 네가 덜 아프게. 용서는 바라지 않는다. — 카이론」\n[s]983년 겨울. 서명만 이름 전부. 처음으로.[/]' },
  ];
  const klN = (s) => KL.filter((l, i) => s.flags['kl:' + i]).length;
  Q('kairon_letters', { name: '보내지 못한 편지', who: '카이론', desc: (s) => { const n = klN(s); return n < 5 ? '대륙 곳곳에 젊은 카이론이 세린에게 쓰고 보내지 못한 편지가 숨어 있다. (' + n + ' / 5) 그린 · 퍼플 · 무지개 · 화이트 · 블랙.' : '편지 다섯 통을 누구에게 전할지 정했다.'; }, after: '보내지 못한 편지가 길을 찾았다.' });
  async function readLetter(c, i) {
    const s = S();
    if (!s.quests.kairon_letters) c.quest('kairon_letters', 'on');
    c.flag('kl:' + i); c.sfx('page');
    await c.narr(KL[i].text);
    const n = klN(s);
    if (n === 1) await c.say('toria', '찍… 「K」? 이거 혹시… 카이론? 엄마한테 쓴 편지야? 근데 왜 여기 떨어져 있어?', { face: 'shock' });
    await c.say(null, '보내지 못한 편지 [y]' + n + ' / 5[/]', { style: 'sys' });
    if (n === 1) { if (!s.inv.kletters) await c.getItem('kletters'); }
    if (n < 5) return;
    await c.narr('다섯 통. 983년 겨울, 누군가 이 편지들을 대륙 다섯 곳에 하나씩 두고 갔다. 다시는 읽지 않으려고. 아니면, 누군가 찾아 주기를.');
    const k = await c.choice('이 편지들을 누구에게 전할까?', ['할머니께 — 그린 마을 에벨린', '엄마 세린에게 — 아스트라까지 가지고 간다', '카이론에게 — 쓴 사람에게 돌려준다']);
    c.flag(['kletter_evelyn', 'kletter_serin', 'kletter_kairon'][k]);
    await c.say('toria', ['할머니라면… 화내면서 다 읽을 거야. 찍.', '엄마가 깨어나면 제일 먼저 줄 거지? 16년 묵은 편지.', '…쓴 사람이 다시 읽으면 어떤 얼굴을 할까. 무섭다. 그래도 보고 싶다.'][k], { face: 'sad' });
    c.journal('젊은 카이론의 편지 다섯 통을 모았다. ' + ['할머니께 전하기로 했다.', '아스트라의 엄마 세린에게 가져가기로 했다.', '카이론에게 돌려주기로 했다.'][k]);
    if (k !== 0) c.quest('kairon_letters', 'done');
  }
  ST.hookTalk('g_home', 'evelyn', (s) => !!(s.flags.kletter_evelyn && !s.flags.kletter_given), async (c, n) => {
    c.lock(true); await c.cinema(true);
    await c.narr('할머니가 편지 다섯 통을 받아 들었다. 첫 장의 「K」를 보더니, 안경을 벗었다.');
    await c.say(n, '…이 바보. 이걸 왜 부치지를 않았노. 세린이가 이거 하나만 받았어도.', { face: 'angry' });
    await c.narr('할머니는 다섯 통을 다 읽었다. 한 번도 쉬지 않고. 마지막 장에서 손이 멈췄다.');
    await c.say(n, '「용서는 바라지 않는다」. …용서는 바라는 사람한테 하는 게 아이다. 해 주고 싶은 사람이 하는 기다.', { face: 'cry' });
    await c.say(n, '침대 밑 상자에 넣어 두꾸마. 세린이 편지 옆에. 둘 다 바보니까, 바보끼리 같이 있으라꼬.', { face: 'closed' });
    c.flag('kletter_given'); c.quest('kairon_letters', 'done'); c.bond('evelyn', 1);
    if (S().inv.kletters) c.take('kletters');
    await c.cinema(false); c.lock(false);
  });

  /* ═════════ 7. 흑점에게 가는 편지 — 우편배달부 핀 ═════════ */
  ST.hookTalk('world', 'fin', (s) => ST.after('c10') && !s.flags.fin_sun, async (c, n) => {
    await c.say(n, '우편이요! …이건 좀 이상한 우편이에요. 받는 이가 「흑점」이에요. 보낸 이는 그린의 아이, 노아.', { face: 'normal' });
    await c.say(n, '어디로 배달해야 할지 몰라서 석 달을 들고 다녔어요. 하늘로 가신다면서요. 거기가 제일 가깝겠죠?', { face: 'smile' });
    c.flag('fin_sun');
    await c.getItem('letter_sun');
    await c.say(n, '편지는 늦게 와도 도착해요. 받는 이가 누구든. 그게 우편이에요.', { face: 'smile' });
    c.journal('우편배달부 핀에게서 노아가 흑점에게 쓴 편지를 받았다. 하늘까지 가지고 간다.');
  });

  /* ═════════ 들판 물건 ═════════ */
  ST.onMap('world', (m, Wd) => {
    const s = S();
    // 관측석
    STONES.forEach((st, i) => {
      const q = spot('belst:' + st.reg, st.reg, st.off[0], st.off[1]); if (!q) return;
      Wd.add(new Thing({ x: px(q[0]), y: py(q[1]), reach: 18, art: ART.stone, col: '#a8c8ff', verb: '관측석에서 하늘을 잰다', when: () => qOn('bel_stars') && !S().flags['belst:' + st.reg] && open(st.reg), text: async (c) => { c.sfx('magic'); await c.narr(st.text); S().flags['belst:' + st.reg] = true; const n = ['red', 'yellow', 'white'].filter((r) => S().flags['belst:' + r]).length; await c.say(null, '관측값을 적었다 (' + n + ' / 3)' + (n === 3 ? ' — 레드의 벨에게 가져가자.' : ''), { style: 'sys' }); } }));
    });
    // 카렐의 목검 (그린 참나무 곁)
    {
      const q = spot('karel', 'green', -6, -7);
      if (q) Wd.add(new Thing({ x: px(q[0]), y: py(q[1]), reach: 18, art: ART.sword, col: '#e8c890', verb: '꽂힌 목검을 본다', when: () => ST.after('c6') && !f('kar_done') && !G.script.running, text: async (c) => karelWay(c, q) }));
    }
    // 밤의 장부 찢긴 장
    [[-9, -6], [12, -5], [3, 12]].forEach((o, i) => {
      const q = spot('mortp:' + i, 'black', o[0], o[1]); if (!q) return;
      Wd.add(new Thing({ x: px(q[0]), y: py(q[1]), reach: 16, art: ART.page, col: '#b87aff', verb: '찢긴 장부 쪽을 줍는다', when: () => qOn('mort_names') && !S().flags['mortp:' + i], text: async (c) => { c.sfx('page'); S().flags['mortp:' + i] = true; await c.narr(['「…렌. 마르타. 요안. 작은 요안.」 이름마다 검은 줄. 줄 아래 글씨가 또렷하다.', '「등불 거리 셋째 집 — 일곱 식구.」 숫자만 있고 이름 칸은 비어 있다. 아니, 손톱으로 긁어 쓴 이름이 있다.', '「녹턴 — 대신 지움.」 맨 아래에 작게. 지운 사람이 자기 이름을 적었다.'][i]); const n = [0, 1, 2].filter((k) => S().flags['mortp:' + k]).length; await c.say(null, '찢긴 장 (' + n + ' / 3)', { style: 'sys' }); } }));
    });
    // 색 방울
    for (const [reg, nm, col, off] of DROPS) {
      const q = spot('tint:' + reg, reg, off[0], off[1]); if (!q) continue;
      Wd.add(new Thing({ x: px(q[0]), y: py(q[1]), reach: 16, col, art: (g, x, y, t) => ART.drop(g, x, y, t, col), verb: nm + ' 방울을 담는다', when: () => qOn('tint_bottles') && !S().flags['tint:' + reg] && open(reg), text: async (c) => { c.sfx('item'); S().flags['tint:' + reg] = true; G.fx.glow(W().player.x, W().player.y - 10, col, 12); await c.say(null, '[y]' + nm + '[/] 방울을 병에 담았다. (' + dropN(S()) + ' / 12)' + (dropN(S()) === 6 || dropN(S()) === 12 ? ' — 그레이의 틴트에게 보여 주자.' : ''), { style: 'sys' }); } }));
    }
    // 젊은 카이론의 편지
    KL.forEach((L, i) => {
      const q = spot('kl:' + i, L.reg, L.off[0], L.off[1]); if (!q) return;
      Wd.add(new Thing({ x: px(q[0]), y: py(q[1]), reach: 16, art: ART.letter, col: '#ffe8c0', verb: '낡은 편지를 줍는다', when: () => ST.after(L.from) && !S().flags['kl:' + i] && open(L.reg), text: async (c) => readLetter(c, i) }));
    });
  });

  async function karelWay(c, q) {
    const s = S();
    c.lock(true); await c.cinema(true);
    await c.narr('참나무 곁 흙에 목검 하나가 꽂혀 있다. 손잡이에 쪽지: 「기사? 의원? 나는 뭐가 되지」');
    const k0 = c.spawn ? c.spawn({ cid: 'karel', x: px(q[0]) + 18, y: py(q[1]) + 6, dir: 'left' }) : null;
    const kn = k0 || 'karel';
    await c.say(kn, '…봤어? 부끄럽다. 베르나한테는 말하지 마.', { face: 'sad' });
    await c.say(kn, '기사가 되고 싶었어. 갑옷이 반짝이니까. 근데 노아를 보고 나서, 기사가 지키는 게 사람이 아니라 탑이란 걸 알았어.', { face: 'normal' });
    await c.say(kn, '미라 아줌마가 그러는데 나는 손이 따뜻하대. 의원 손이래. …근데 의원은 칼을 안 쥐잖아. 나 칼 좋아하는데.', { face: 'sad' });
    const k = await c.choice('카렐이 목검을 본다.', ['「기사가 돼. 탑 말고 사람을 지키는 기사.」', '「의원이 돼. 따뜻한 손은 귀해.」', '「지금 안 정해도 돼. 둘 다 해 봐.」']);
    if (k === 0) { c.flag('kar_knight'); await c.say(kn, '사람을 지키는 기사… 고르디 아저씨 같은? 응. 그런 기사가 될래. 규칙보다 사람 먼저 세는.', { face: 'happy' }); }
    else if (k === 1) { c.flag('kar_healer'); await c.say(kn, '…응. 칼은 취미로 할래. 베르나랑 대련할 때만. 손은 노아 손 잡는 데 쓸래.', { face: 'smile' }); }
    else { c.flag('kar_self'); await c.say(kn, '둘 다? …그래도 돼? 다들 빨리 정하라던데. 너는 안 그러네. 고마워.', { face: 'cry' }); }
    c.flag('kar_done'); c.quest('karel_way', 'done');
    await c.say(kn, '이거 줄게. 목검 깎다 남은 나무로 만든 거야. 작지만, 내 첫 작품.', { face: 'smile' });
    await c.getItem('ac_wood');
    c.journal(['카렐은 사람을 지키는 기사가 되기로 했다.', '카렐은 의원이 되기로 했다.', '카렐은 아직 정하지 않기로 했다. 그래도 된다는 걸 처음 들었다.'][k]);
    if (k0 && c.remove) c.remove(k0); else if (k0) k0.dead = true;
    await c.cinema(false); c.lock(false);
  }
})();
