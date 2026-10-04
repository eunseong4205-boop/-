/* 군상: 사람들이 제 장(章)에서 끝나지 않고 길 위에서 계속 살아간다
   ─ 길 위의 사람들: 루드 · 베르나와 카렐 · 헤미아 · 루체 · 피카 · 비올라 · 에델 · 고르디 · 엘름 영감 · 아스텔 박사가
     장마다 다른 마을에 나타나, 앞에서 벌어진 일과 서로의 소식을 전한다
   ─ 군상 장면 여덟: 두 사람이 네 앞에서 부딪친다. 네가 고른 것이 그들의 다음 장을 바꾼다
     (레아와 루드 · 도망친 아이들과 참새단 · 헤미아와 비올라 · 고르디의 명령 · 에델과 루드 · 루체의 나침반 · 등불 거리의 기름 · 발사대의 사람들)
   ─ 대륙 소식지: 마을 광장마다. 장이 넘어갈 때마다, 네 선택이 쌓일 때마다 기사가 바뀐다
   ─ 결말 · 결전의 목소리에도 이어진다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles;
  const TS = TL.TS;
  const S = () => G.state, W = () => G.world;
  const f = (k) => !!S().flags[k];
  const v = (k) => S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const CH = (id) => ST.chIdx(id), now = () => ST.chIdx();
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '누나' : '형');
  const plaza = (n, dx, dy) => { const t = OW.towns[n]; return t && t.plaza ? [t.plaza.x + (dx || 0), t.plaza.y + (dy || 0)] : [10, 10]; };
  const route = () => ST.route();

  /* ═════════ 길 위의 사람들 ═════════ */
  // 같은 사람이 다른 이야기 자리에 서 있으면 나타나지 않는다
  const freeOf = (cid, self) => !(ST.people.world || []).some((sp) => sp !== self && sp.id === cid && (!sp.when || sp.when(S())));
  function walker(cid, stops) {
    // stops: [[장, 마을, dx, dy, talk(c, n)]]
    for (const [ch, town, dx, dy, talk] of stops) {
      const spec = { id: cid, dir: 'down', wander: 2, at: () => plaza(town, dx, dy), talk, mark: () => null, init: (npc) => { npc.walker = true; } };
      spec.when = (s) => s.ch === ch && !(s.party || []).includes(cid) && freeOf(cid, spec) && !s.flags['ens:away:' + cid];
      ST.person('world', spec);
    }
  }
  const say = (c, n, t, o) => c.say(n, t, o);

  walker('rud', [
    ['c3', 'blue', 7, 3, async (c, n) => {
      await say(c, n, '블루 부두 순찰. 배 한 척마다 짐표를 센다. 숫자는 거짓말 안 해.', { face: 'normal' });
      await say(c, n, v('ens:rud') === 'doubt' ? '…그 장부 얘기. 계속 생각나. 탑이 빛을 모으는 게 아니라 사람을 모은다는 거. 누나가 맞으면 어쩌지.' : '누나는 또 배를 훔쳐 탈 거야. 이번엔 내가 잡는다.', { face: v('ens:rud') === 'doubt' ? 'sad' : 'angry' });
    }],
    ['c5', 'purple', -6, 4, async (c, n) => {
      await say(c, n, '라벤더 학원에 징수 명부를 가지러 왔어. 그런데 교수님들이 명부를 안 줘. 「학생은 숫자가 아니다」래.', { face: 'normal' });
      await say(c, n, v('ens:rud') === 'doubt' ? '…나도 그렇게 생각해. 들키면 끝이지만.' : '학생도 세면 숫자야. …아닌가?', { face: 'sad' });
    }],
    ['c8', 'gray', 5, -3, async (c, n) => {
      if (v('ens:rud') === 'doubt') { await say(c, n, '기사단을 나왔어. 휘장은 누나한테 줬고. 지금은 볼트 영감 공방에서 나사 센다. 나사는 사람이 아니라서 마음 편해.', { face: 'smile' }); return; }
      await say(c, n, '회색 땅 징수는 쉬워. 걷을 게 없거든. …없는 데서 뭘 걷으라는 건지.', { face: 'sad' });
    }],
    ['c10', 'colorful', -8, 2, async (c, n) => {
      await say(c, n, v('ens:rud') === 'doubt' ? '발사대 둘레 경비는 우리 남매가 맡았어. 누나가 동쪽, 나는 서쪽. 숫자로 치면 둘이지만 기분은 백 명이야.' : '기사단은 발사를 막으래. 나는… 오늘 눈이 좀 나빠질 것 같아. 아무것도 못 볼 만큼.', { face: 'smile' });
    }],
  ]);
  walker('berna', [
    ['c2', 'red', 4, 5, async (c, n) => {
      await say(c, n, '볼칸 아저씨한테 진짜 검을 받으러 왔어! 목검 천 번 휘두르면 준대. 아홉백구십… 아홉백구십일…', { face: 'happy' });
      await say('karel', '베르나 거짓말이야. 볼칸 아저씨는 「만 번」이라고 했어.', { face: 'smirk' });
    }],
    ['c4', 'yellow', 6, -4, async (c, n) => {
      if (v('ens:kids') === 'sparrow') { await say(c, n, '우린 이제 그늘 참새단이야! 피카 누나가 달리는 법 가르쳐 줬어. 도둑질은 안 가르쳐 줬어. …아직은.', { face: 'happy' }); return; }
      await say(c, n, '여기 모래 너무 뜨거워… 그래도 안 돌아가! 전설은 발바닥이 데어야 되는 거래.', { face: 'angry' });
    }],
    ['c6', 'rainbow', -5, 6, async (c, n) => {
      await say(c, n, '투기장에서 ' + S().name + ' 이름 들었어! 우리 마을 사람이 나오면 목이 터지게 응원할 거야!', { face: 'happy' });
      await say('karel', '나는 상대편 응원할 거야. 그래야 베르나가 더 크게 소리 지르니까.', { face: 'smirk' });
    }],
    ['c9', 'black', 4, 5, async (c, n) => {
      await say(c, n, v('ens:lamps') ? '등불 거리 불, 우리가 켰어! 기름은… 어디서 났는지 묻지 마.' : '여긴 너무 어두워. 카렐이 무섭대. 나는 안 무서워. …손은 카렐이 먼저 잡은 거야.', { face: 'happy' });
    }],
  ]);
  walker('karel', [
    ['c2', 'red', 5, 5, async (c, n) => { await say(c, n, '볼칸 아저씨 대장간은 너무 뜨거워. 베르나는 괜찮대. 베르나는 늘 괜찮대.', { face: 'sad' }); }],
    ['c4', 'yellow', 7, -4, async (c, n) => { await say(c, n, v('ens:kids') === 'sparrow' ? '피카 누나가 나보고 「셈이 빠르다」고 했어. 참새단 회계래. 회계가 뭐야?' : '물 한 잔에 5원이래. 우리 돈은 3원이야. 반 잔만 달라고 할까.', { face: 'normal' }); }],
    ['c6', 'rainbow', -4, 6, async (c, n) => { await say(c, n, '풍선 하나 샀어. 베르나 거야. 나는 풍선 없어도 돼. …날아가면 안 되니까 잡고 있어.', { face: 'smile' }); }],
    ['c9', 'black', 5, 5, async (c, n) => { await say(c, n, '밤에만 사는 도시래. 우리 그린은 밤엔 다 자는데. 여긴 밤에 다 깨어 있어. 이상해. 좋아.', { face: 'normal' }); }],
  ]);
  walker('hemia', [
    ['c5', 'purple', 8, -3, async (c, n) => {
      await say(c, n, '아, 안녕하세요. 헤, 헤미아예요. 대도서관에서 책을 돌려받으러… 아니, 빌려주러 왔어요. 세린이라는 학생의 기록을요.', { face: 'blush' });
      if (v('ens:book') === 'shared') await say(c, n, '비올라 씨가 같이 읽자고 했어요. 무서운 줄 알았는데, 수수께끼를 저보다 빨리 풀어요. 부, 분해요.', { face: 'smile' });
    }],
    ['c8', 'gray', -7, 3, async (c, n) => {
      await say(c, n, '회색 땅 기록 보관소를 정리하고 있어요. 612년 기록이 통째로 비었어요. 누, 누가 찢어 간 게 아니라… 처음부터 안 적은 거예요. 안 적은 것도 기록이에요.', { face: 'normal' });
    }],
    ['c10', 'colorful', 6, -4, async (c, n) => {
      await say(c, n, '발사 날짜를 적으러 왔어요. 이 대륙에서 처음으로 「하늘로 간 날」. 제, 제가 첫 줄을 쓰고 싶어요.', { face: 'smile' });
    }],
  ]);
  walker('luce', [
    ['c6', 'rainbow', 7, 5, async (c, n) => {
      await say(c, n, f('c3_luce_done') ? '천년제 등불을 켜는 일을 맡았어. 등대 불을 다시 켠 사람이라고 뽑혔대. 아빠가 봤으면 웃었을 거야.' : '천년제 구경 왔어. 등대는… 아직 꺼져 있어. 그래서 불꽃을 보러 왔어.', { face: 'smile' });
    }],
    ['c8', 'gray', 8, 2, async (c, n) => {
      if (f('ens:compass')) { await say(c, n, '나침반 바늘이 북쪽이 아니라 위를 가리켜. 볼트 영감님이 고장이 아니래. 「가야 할 데를 가리키는 거」래.', { face: 'happy' }); return; }
      await say(c, n, '볼트 영감님 공방에 아빠 나침반을 맡기러 왔어. 바늘이 계속 떨려.', { face: 'normal' });
    }],
  ]);
  walker('pika', [
    ['c6', 'rainbow', 9, -2, async (c, n) => {
      await say(c, n, '쉿. 골디 영감 주머니는 천년제 때 제일 두꺼워. …농담이야. 반만.', { face: 'smirk' });
      if (v('ens:kids') === 'sparrow') await say(c, n, '그린 꼬맹이 둘? 우리 막내들이야. 달리기는 벌써 나보다 빨라. 기분 나쁘게.', { face: 'happy' });
    }],
    ['c9', 'black', -5, 4, async (c, n) => {
      await say(c, n, v('ens:lamps') === 'oil' ? '골디 창고 기름 통, 몇 개 없어졌대. 누가 가져갔을까~? 등불 거리가 참 밝네~' : '밤의 도시엔 훔칠 게 없어. 다들 가진 게 어둠뿐이라.', { face: 'smirk' });
    }],
  ]);
  walker('viola', [
    ['c7', 'white', -6, 4, async (c, n) => {
      if (v('ens:book') === 'shared') { await say(c, n, '헤미아가 준 기록에 적힌 대로 왔어. 세린 님이 여기서 얼음 편지를 남겼대. 녹지 않는 편지. …당연히 내가 먼저 찾을 거야.', { face: 'smirk' }); return; }
      await say(c, n, '세린 님 기록? 그 도서관 애가 안 보여 줘서 혼자 왔어. 얼음이 너무 많아. 기록도 얼었으면 좋겠네, 내가 깨게.', { face: 'angry' });
    }],
  ]);
  walker('edel', [
    ['c9', 'black', 7, -4, async (c, n) => {
      if (v('ens:edel') === 'doubt') { await say(c, n, '성녀님 곁을 떠나 여기 왔소. 녹턴을 잡으러가 아니오. …무엇이 옳은지 제 눈으로 보러 왔소.', { face: 'sad' }); return; }
      await say(c, n, '새벽단 잔당을 쫓아 밤의 도시까지 왔소. 성녀님의 명이오. …명령이 가벼웠던 적은 없소.', { face: 'normal' });
    }],
    ['c10', 'colorful', 9, 3, async (c, n) => {
      await say(c, n, v('ens:edel') === 'doubt' ? '백은 기사 에델, 오늘은 기사단이 아니라 발사대를 지키오. 성녀님께도 말씀드렸소. 성녀님이 웃으셨소. 처음 보는 웃음이었소.' : '기사단 명으로 왔소. 발사를 멈추라고. …하지만 저 로켓은 너무 예쁘오.', { face: 'smile' });
    }],
  ]);
  walker('gordi', [
    ['c2', 'red', -6, 4, async (c, n) => {
      await say(c, n, '레드 징수소 지원 나왔다. 그린보다 걷을 게 많군. 걷을 게 많은 곳은 울음도 많다.', { face: 'normal' });
      if (f('gordi_kind')) await say(c, n, '…그린 옥수수밭은 무사한가. 까마귀 말고.', { face: 'sad' });
    }],
    ['c4', 'yellow', 8, 4, async (c, n) => {
      await say(c, n, '골디 영감 금고 앞 경비다. 금화 세는 소리가 밤새 난다. 사람 세는 소리는 안 난다.', { face: 'normal' });
    }],
    ['c8', 'gray', -4, -4, async (c, n) => {
      await say(c, n, v('ens:gordi') === 'refuse' ? '천년제 날 명을 어겼다. 부단장님 명령이었지. 강등됐다. 회색 땅 순찰이 벌이다. …벌 치고는 조용해서 좋군.' : '회색 땅 순찰. 걷을 것도, 지킬 것도 없다. 기사단이 나를 어디다 쓰려는지 알 것 같다.', { face: 'sad' });
    }],
  ]);
  walker('elm', [
    ['c3', 'blue', -9, 5, async (c, n) => {
      await say(c, n, '그린 연못은 물고기가 다 내 얼굴을 알아. 그래서 바다로 왔지. 여기 물고기는 날 몰라. 옛날이야기를 처음부터 해 줄 수 있어.', { face: 'smile' });
    }],
    ['c7', 'white', 7, 6, async (c, n) => {
      await say(c, n, '얼음 낚시다. 구멍 하나에 이야기 하나. 16년 전 겨울 이야기를 하면… 물고기가 도망가. 추운 얘기는 싫은가 봐.', { face: 'normal' });
    }],
  ]);
  walker('astel', [
    ['c5', 'purple', 10, 5, async (c, n) => {
      await say(c, n, '993년에 재 본 걸 다시 재 보러 왔네. 라벤더 학원 천문대가 더 크거든. …답이 같군. 같아서 무서워.', { face: 'sad' });
    }],
    ['c10', 'colorful', -10, -3, async (c, n) => {
      await say(c, n, '궤도는 다 그렸네. 틀려도 다시 그릴 시간은 없어. 그러니 맞았다고 믿기로 했지. 과학도 가끔은 믿음이야.', { face: 'smile' });
    }],
  ]);

  /* ═════════ 군상 장면 ═════════ */
  // 장면 도중에는 길 위의 같은 사람을 잠시 치운다
  function hideCid(ids) { for (const e of W().ents) if (e.npc && ids.includes(e.cid) && !e.dead && e.fromPeople) e.dead = true; }
  const SCENES = [];
  const scene = (o) => SCENES.push(o);
  const near = (town, r) => { const p = W().player, t = OW.towns[town]; if (!p || !t || !t.plaza) return false; return Math.abs(p.x / TS - t.plaza.x) < (r || 16) && Math.abs(p.y / TS - t.plaza.y) < (r || 12); };
  const spawnBy = (c, cid, dx, dy, dir) => { const p = W().player; return c.spawn({ cid, x: p.x + dx * TS, y: p.y + dy * TS, dir: dir || 'down' }); };

  // 1) 레아와 루드 — 블루 부두 (3장)
  scene({ id: 'rud_lea', ch: 'c3', town: 'blue', cond: () => f('met:lea') || f('c2_done'), async play(c) {
    const ru = spawnBy(c, 'rud', 3, -1, 'left'), le = spawnBy(c, 'lea', -3, -1, 'right');
    await c.say(ru, '누나! 또 기사단 배를 훔칠 거면 내 앞에서 하지 마. 적어야 하잖아.', { face: 'angry' });
    await c.say(le, '적어. 「레아, 배 한 척.」 그리고 옆에 적어. 「그 배에 탄 아이 스물, 탑으로 가지 않음.」', { face: 'normal' });
    await c.say(ru, '…숫자는 거짓말 안 해. 스물이면 스물이지. 근데 그게 뭐가 중요한데.', { face: 'sad' });
    await c.say(le, '중요하지 않으면 네가 왜 떨어.', { face: 'sad' });
    const k = await c.choice('루드가 너를 본다. 「너는… 레드에서 광산 봤잖아. 거기 뭐가 있었어?」', [f('c2_extractor') || f('c2_mine_ok') ? '광산 밑 추출기 이야기를 해 준다' : '본 대로 말한다 — 빛을 빼 가는 기계', '기사단 일은 네가 판단해', '레아 편을 들지 않는다']);
    if (k === 0) { S().flags['ens:rud'] = 'doubt'; await c.say(ru, '……사람한테서 빛을 뺀다고. 그걸 누가 세는데. 나야. 내가 세고 있었어.', { face: 'sad' }); await c.say(le, '그러니까 이제 다르게 세. 그게 다야.', { face: 'smile' }); c.bond('lea', 1); }
    else if (k === 1) { S().flags['ens:rud'] = 'doubt'; await c.say(ru, '판단… 판단은 부단장님이 하는 건데. …알았어. 내가 할게. 천천히.', { face: 'normal' }); }
    else { S().flags['ens:rud'] = 'loyal'; await c.say(ru, '그래. 규칙은 규칙이야. 누나, 다음엔 진짜 잡는다.', { face: 'angry' }); await c.say(le, '그래. 다음엔 네가 잡아. 그때까지 살아 있어.', { face: 'sad' }); }
    c.journal('블루 부두에서 레아와 루드 남매가 부딪쳤다. 루드는 ' + (S().flags['ens:rud'] === 'doubt' ? '흔들렸다.' : '규칙을 붙잡았다.'));
  } });
  // 2) 도망친 아이들과 참새단 — 옐로 (4장)
  scene({ id: 'kids', ch: 'c4', town: 'yellow', cond: () => true, async play(c) {
    const be = spawnBy(c, 'berna', 2, 1, 'up'), ka = spawnBy(c, 'karel', 3, 1, 'up'), pk = spawnBy(c, 'pika', -2, -1, 'right');
    await c.emote(be, '!'); await c.say(be, S().name + '! 우리도 왔어! 그린에서 여기까지 걸어서! 전설이 되려고!', { face: 'happy' });
    await c.say(ka, '베르나가 가자고 했어. 나는 말렸어. …세 번쯤.', { face: 'sad' });
    await c.say(pk, '헤, 그린 꼬맹이들이네. 모래바다에서 사흘이면 말라 죽어. 우리 참새단 들어올래? 빨리 달리는 법, 숨는 법, 배고픔 참는 법. 수업료는 없어.', { face: 'smirk' });
    const k = await c.choice('아이들이 너를 본다.', ['집으로 돌려보낸다 (마리엔 아줌마에게 편지를 쓴다)', f('c4_pika') ? '피카에게 맡긴다 — 피카는 믿을 만하다' : '피카에게 맡긴다', '둘이 정하게 둔다']);
    if (k === 0) { S().flags['ens:kids'] = 'home'; await c.say(be, '…치. 알았어. 대신 ' + sib() + '가 전설 되면 우리 얘기도 넣어 줘!', { face: 'sad' }); await c.say(pk, '현명하네. 집이 있는 애들은 집에 가야지.', { face: 'normal' }); }
    else { S().flags['ens:kids'] = 'sparrow'; await c.say(pk, '좋아. 첫 수업: 발바닥은 모래보다 빨리. 둘째 수업: 절대 친구 주머니는 안 턴다.', { face: 'happy' }); await c.say(be, '참새단 베르나! 멋있다!', { face: 'happy' }); await c.say(ka, '…나는 참새단 카렐. 멋있…나?', { face: 'normal' }); c.bond('pika', 1); }
    c.journal('옐로에서 그린의 아이들, 베르나와 카렐을 만났다. ' + (S().flags['ens:kids'] === 'home' ? '집으로 돌려보냈다.' : '피카의 참새단에 들어갔다.'));
  } });
  // 3) 헤미아와 비올라 — 퍼플 (5장)
  scene({ id: 'book', ch: 'c5', town: 'purple', cond: () => f('c3_octavio') || f('met:hemia'), async play(c) {
    const he = spawnBy(c, 'hemia', -2, -1, 'right'), vi = spawnBy(c, 'viola', 2, -1, 'left');
    await c.say(vi, '그 책, 세린 님 학적부지? 내놔. 내가 깨야 할 기록이 거기 다 적혀 있어.', { face: 'angry' });
    await c.say(he, '아, 아니요. 이건 대도서관 소장이에요. 빌, 빌려줄 수는 있지만 뺏기는 건 안 돼요.', { face: 'blush' });
    await c.say(vi, '빌리는 거나 뺏는 거나. 결국 내 손에 있으면 되잖아.', { face: 'smirk' });
    const k = await c.choice('헤미아가 도와 달라는 눈으로 본다.', ['같이 읽으면 된다 — 둘 다 세린을 알고 싶은 거잖아', '헤미아 편 — 책은 도서관 것이다', '비올라 편 — 기록은 깨라고 있는 것']);
    if (k === 0) { S().flags['ens:book'] = 'shared'; await c.say(vi, '…같이? 흥. 그럼 네가 읽는 속도 맞춰. 나 빨라.', { face: 'smirk' }); await c.say(he, '저, 저도 빨라요. 수수께끼면요.', { face: 'smile' }); await c.narr('두 사람이 책 한 권에 머리를 맞댔다. 세린의 학적부 마지막 장: 「얼음 나라에 편지를 두고 옴. 녹지 않게.」'); }
    else if (k === 1) { S().flags['ens:book'] = 'library'; await c.say(vi, '치사해. 좋아, 혼자 찾을 거야.', { face: 'angry' }); }
    else { S().flags['ens:book'] = 'viola'; await c.say(he, '…아, 알겠어요. 대신 흠집 내면 안 돼요.', { face: 'sad' }); await c.say(vi, '흠집은 기록에만 내.', { face: 'smirk' }); }
    c.journal('퍼플에서 헤미아와 비올라가 세린의 학적부를 두고 부딪쳤다.');
  } });
  // 4) 고르디의 명령 — 무지개 천년제 (6장)
  scene({ id: 'gordi', ch: 'c6', town: 'rainbow', cond: () => !f('c6_done'), async play(c) {
    const go = spawnBy(c, 'gordi', 2, -1, 'left');
    await c.say(go, '…너였군. 그린에서 본 얼굴. 천년제 경비 중이다.', { face: 'normal' });
    await c.say(go, '부단장님께서 봉인된 명령서를 주셨다. 봉헌식 날 밤, 광장 출구를 모두 막으라고. 「아무도 나가지 못하게.」', { face: 'sad' });
    const k = await c.choice('고르디가 명령서를 쥔 손을 내려다본다.', ['출구는 열어 두라고 한다 — 사람이 먼저다', '명령대로 하라고 한다', '명령서를 보여 달라고 한다']);
    if (k === 0 || (k === 2 && f('gordi_kind'))) { S().flags['ens:gordi'] = 'refuse'; await c.say(go, (k === 2 ? '…「아무도 나가지 못하게, 그릇이 다 차기 전에는.」 그릇? …사람을 그릇이라 부르는 명령은, ' : '') + '알았다. 출구는 열어 둔다. 벌은 내가 받는다. 그린 옥수수밭에서 배운 게 있지.', { face: 'smile' }); c.bond('gordi', 1); }
    else { S().flags['ens:gordi'] = 'obey'; await c.say(go, '…명령은 명령이다. 그래도, 막는 동안 눈은 감지 않겠다.', { face: 'sad' }); }
    c.journal('천년제 경비 고르디가 봉인된 명령을 받았다. 그는 ' + (S().flags['ens:gordi'] === 'refuse' ? '출구를 열어 두기로 했다.' : '명령을 따르기로 했다.'));
  } });
  // 5) 에델과 루드 — 화이트 (7장)
  scene({ id: 'edel', ch: 'c7', town: 'white', cond: () => !!v('ens:rud'), async play(c) {
    const ed = spawnBy(c, 'edel', -2, -1, 'right'), ru = spawnBy(c, 'rud', 2, -1, 'left');
    if (v('ens:rud') === 'doubt') {
      await c.say(ru, '백은 기사님. 이거 보세요. 징수 장부 사본이에요. 탑마다 「허용 손실」이라는 칸이 있어요. 사람 수로.', { face: 'sad' });
      await c.say(ed, '…허용 손실. 성녀님의 병동에 오는 아이들 수와 같소. 한 명도 틀리지 않소.', { face: 'sad' });
      const k = await c.choice('에델이 장부에서 눈을 떼지 못한다.', ['성녀님께 직접 여쭤보라고 한다', '성녀님도 모르실 수 있다고 한다']);
      S().flags['ens:edel'] = 'doubt';
      await c.say(ed, k === 0 ? '여쭙겠소. 대답을 듣고 나면… 나는 기사가 아닐지도 모르오.' : '모르시기를 바라오. 아는 것보다 모르는 것이 덜 아프니까.', { face: 'sad' });
    } else {
      await c.say(ru, '백은 기사님, 새벽단 은신처가 설원 어딘가에 있다는 보고입니다. 제가 찾겠습니다.', { face: 'normal' });
      await c.say(ed, '…수고하오. 서두르지는 마시오. 쫓기는 이들에게도 겨울은 춥소.', { face: 'normal' });
      S().flags['ens:edel'] = 'loyal';
    }
    c.journal('화이트에서 에델과 루드가 마주쳤다.');
  } });
  // 6) 루체의 나침반 — 그레이 (8장)
  scene({ id: 'compass', ch: 'c8', town: 'gray', cond: () => f('c3_luce_done'), async play(c) {
    const lu = spawnBy(c, 'luce', -2, -1, 'right'), bo = spawnBy(c, 'bolt', 2, -1, 'left');
    await c.say(lu, '볼트 영감님, 아빠 나침반이에요. 16년 동안 바늘이 떨리기만 해요.', { face: 'normal' });
    await c.say(bo, '흠. 자석은 멀쩡하고, 축도 멀쩡하고… 이 녀석은 고장 난 게 아니야, 꼬마. 가리킬 데를 못 정한 거지.', { face: 'normal' });
    await c.say(bo, '북쪽은 땅 위의 방향이야. 이 바늘은… 위를 가리키고 싶은데 누가 눌러 놨어. 여기, 흰 가루. 흰빛 가루로 눌러 놨군.', { face: 'shock' });
    const k = await c.choice('볼트가 핀셋을 든다. 「털어 낼까?」', ['털어 낸다', '루체가 정하게 둔다']);
    if (k === 0 || true) { c.flag('ens:compass'); c.sfx('crystal'); await c.narr('흰 가루가 털리자 바늘이 한 번 크게 돌더니 — 하늘을 가리키고 멈췄다.'); await c.say(lu, '…아빠. 아빠 배는 바다로 간 게 아니었구나.', { face: 'sad' }); await c.say(bo, '로켓 만드는 박사가 곶에 있지. 이 바늘, 거기 가져가 봐.', { face: 'smile' }); }
    c.journal('그레이에서 루체의 나침반이 하늘을 가리키게 되었다.');
  } });
  // 7) 등불 거리의 기름 — 블랙 (9장)
  scene({ id: 'lamps', ch: 'c9', town: 'black', cond: () => true, async play(c) {
    const pk = spawnBy(c, 'pika', 2, -1, 'left');
    const kids = v('ens:kids') === 'sparrow';
    const be = kids ? spawnBy(c, 'berna', 3, 0, 'left') : null;
    await c.say(pk, '쉿. 등불 거리 기름이 떨어졌대. 밤의 도시에 불이 꺼지면 다들 무서워해. 그래서… 골디 영감 창고에서 좀 빌려 왔어.', { face: 'smirk' });
    if (be) await c.say(be, '나랑 카렐이 굴렸어! 통이 우리보다 컸어!', { face: 'happy' });
    const k = await c.choice('피카가 기름통 뚜껑을 두드린다.', ['등불을 같이 채운다', '골디에게 돌려주라고 한다']);
    if (k === 0) { S().flags['ens:lamps'] = 'oil'; c.sfx('lamp'); await c.narr('등불 스무 개에 기름을 부었다. 밤의 도시 거리가 한 줄로 환해졌다. 창문마다 얼굴이 하나씩 내다봤다.'); await c.say(pk, '빌린 거야. 갚을 거야. 언젠가. 대륙이 밝아지면.', { face: 'happy' }); c.bond('pika', 1); }
    else { S().flags['ens:lamps'] = 'return'; await c.say(pk, '…치. 알았어. 대신 골디 영감한테 등불 기름값 내라고 편지 쓸 거야. 받는 사람: 금화왕. 보내는 사람: 참새.', { face: 'smirk' }); }
    c.journal('블랙에서 피카와 등불 거리의 기름을 두고 이야기했다.');
  } });
  // 8) 발사대의 사람들 — 알록달록 곶 (10장)
  scene({ id: 'launchpad', ch: 'c10', town: 'colorful', cond: () => true, async play(c) {
    const cast = [];
    if (v('ens:rud') === 'doubt') cast.push(['rud', '서쪽 경비 이상 없음! …누나, 동쪽은?', 'lea', '동쪽도 이상 없어. 네가 이상 없다고 하니까.']);
    if (v('ens:edel') === 'doubt') cast.push(['edel', '백은 기사 에델, 발사대를 지키오. 이번 명령은 내가 내렸소.', null, null]);
    if (f('ens:compass')) cast.push(['luce', '박사님, 이 나침반 로켓에 달아 주세요. 바늘이 가리키는 데로 가면 돼요.', null, null]);
    if (v('ens:book') === 'shared') cast.push(['hemia', '바, 발사 기록 첫 줄은 제가 쓰고, 둘째 줄은 비올라 씨가 쓰기로 했어요. 세 번째 줄은 비워 둘게요. 돌아와서 쓰세요.', null, null]);
    if (v('ens:kids')) cast.push(['berna', v('ens:kids') === 'sparrow' ? '참새단 전원, 외판 닦았어! 반짝반짝!' : '엄마 몰래 왔어! 한 번만 보고 갈게!', 'karel', '…베르나가 가자고 했어. 이번엔 안 말렸어.']);
    if (v('ens:gordi') === 'refuse') cast.push(['gordi', '강등된 기사지만 경비는 할 줄 안다. 발사대 문은 열어 두겠다. 이번에도.', null, null]);
    if (cast.length < 2) return;
    await c.narr('발사대 둘레에 낯익은 얼굴들이 모여 있었다. 누가 부른 것도 아닌데. 길 위에서 한 번씩 스친 사람들이.');
    let i = 0;
    for (const [a, la, b, lb] of cast) {
      const na = spawnBy(c, a, -4 + (i % 5) * 2, -2 - Math.floor(i / 5), 'down'); await c.say(na, la, { face: 'smile' });
      if (b) { const nb = spawnBy(c, b, -3 + (i % 5) * 2, -2 - Math.floor(i / 5), 'down'); await c.say(nb, lb, { face: 'smile' }); }
      i++;
    }
    c.flag('ens:gathered'); S().flags['ens:gatherN'] = cast.length;
    await c.say('toria', '찍… 이 사람들, 다 네가 길에서 만난 사람들이야. 네가 모은 게 레벨만은 아니었네.', { face: 'happy' });
    c.journal('발사대에 길 위에서 만난 사람들 ' + cast.length + '명이 모였다.');
  } });

  // 장면 방아쇠: 그 장에, 그 마을 광장 가까이, 조용할 때
  let calmT = 0;
  ST.onTick.push((dt) => {
    const s = S(), Wd = W(), m = Wd.map, p = Wd.player;
    if (!m || !m.overworld || !p || G.script.running || s.duel || p.state === 'dead') { calmT = 0; return; }
    const sc = SCENES.find((x) => x.ch === s.ch && !s.flags['ens:scene:' + x.id] && near(x.town) && x.cond());
    if (!sc) { calmT = 0; return; }
    if (G.combat.foes().some((e) => !e.dead && e.aggro)) { calmT = 0; return; }
    calmT += dt; if (calmT < 1.5) return;
    calmT = 0; s.flags['ens:scene:' + sc.id] = true;
    G.script.run(async (c) => {
      c.lock(true); await c.cinema(true);
      hideCid(['rud', 'lea', 'berna', 'karel', 'pika', 'hemia', 'viola', 'gordi', 'edel', 'luce', 'bolt']);
      try { await sc.play(c); } catch (e) { console.error('ensemble', sc.id, e); }
      await c.cinema(false); c.lock(false);
      for (const e of W().ents) if (e.npc && e.cid && !e.fromPeople && !e.follower && ['rud', 'lea', 'berna', 'karel', 'pika', 'hemia', 'viola', 'gordi', 'edel', 'luce', 'bolt'].includes(e.cid)) e.dead = true;
      ST.refreshPeople();
    });
  });

  /* ═════════ 대륙 소식지 ═════════ */
  const NEWS = [
    ['c1', () => true, '[그린] 광장 탑 「빛 모으기」 순조 — 징수 기사단 「올해 할당량 초과 달성」'],
    ['c2', () => f('c2_done'), '[레드] 황금 광산 재개 — 광부 대장 도르간 「밑에서 나온 건 금만이 아니었다」'],
    ['c2', () => f('gordi_kind'), '[그린] 징수 기사 고르디, 옥수수밭 앞에서 한참 서 있다 떠나 — 목격자 「까마귀도 가만히 있었다」'],
    ['c3', () => v('ens:rud') === 'doubt', '[블루] 부두 순찰 기사 루드, 짐표에 「사람」 칸을 새로 그려 넣어 — 상관 「양식 위반」'],
    ['c3', () => v('ens:rud') === 'loyal', '[블루] 견습 기사 루드, 새벽단 배 추격 — 「다음엔 잡는다」'],
    ['c3', () => f('c3_luce_done'), '[블루] 16년 만에 등대에 불 — 등대지기의 딸 루체 「아빠가 보고 있을 거예요」'],
    ['c4', () => v('ens:kids') === 'sparrow', '[옐로] 그늘 참새단에 새 단원 둘 — 「그린에서 걸어왔다」 주장'],
    ['c4', () => v('ens:kids') === 'home', '[그린] 가출 소동 베르나 · 카렐 무사 귀가 — 마리엔 「용사님 편지 덕분」'],
    ['c4', () => f('c4_done'), '[옐로] 태양 피라미드 봉인 풀려 — 금화왕 골디 「공짜는 없다」 재확인'],
    ['c5', () => v('ens:book') === 'shared', '[퍼플] 라벤더 학원 수석 비올라, 블루 사서와 공동 연구 — 교수진 「드문 일」'],
    ['c5', () => f('c5_done'), '[퍼플] 거꾸로 선 탑 조용 — 연못지기 시빌 「거울은 거짓말을 안 해. 보는 사람이 하지.」'],
    ['c6', () => v('ens:gordi') === 'refuse', '[무지개] 천년제 밤 광장 출구 열려 있었다 — 경비 고르디 강등 · 「후회 없다」'],
    ['c6', () => f('c6_done'), '[무지개] 천년제 봉헌식 소동 — 부단장 그라우스 행방 묘연'],
    ['c7', () => v('ens:edel') === 'doubt', '[화이트] 백은 기사 에델, 성녀에게 「허용 손실」 질의 — 대성당 문 하루 닫혀'],
    ['c7', () => f('c7_done'), '[화이트] 얼음 창고 폭파 — 새벽단 「사람은 저장되지 않는다」'],
    ['c8', () => f('ens:compass'), '[그레이] 볼트의 공방 「하늘을 가리키는 나침반」 수리 완료 — 볼트 「고장이 아니었다」'],
    ['c8', () => f('c8_done'), '[그레이] 폐공장 MK-7 멈춰 — 990년 녹음 공개'],
    ['c9', () => v('ens:lamps') === 'oil', '[블랙] 등불 거리 불빛 두 배로 — 금화왕 창고 기름 「증발」, 참새단 「모르는 일」'],
    ['c9', () => v('ens:lamps') === 'return', '[옐로] 금화왕 앞으로 편지 한 통 — 보낸 이 「참새」, 내용 「등불 기름값 청구서」'],
    ['c9', () => f('c9_done'), '[블랙] 녹턴의 성 커튼 걷혀 — 밤의 도시에 아침 한 줄'],
    ['c10', () => f('ens:gathered'), '[곶] 무한호 발사대에 대륙 각지 사람 모여 — 「부른 사람은 없다」'],
    ['c10', () => f('c10_done'), '[곶] 무한호 발사 — 하늘에 흰 줄 하나'],
    ['c11', () => true, '[하늘] 정거장 교신 두절 — 박사 피로스 「교신은 돌아온다. 사람도.」'],
  ];
  const TOWNS = ['green', 'red', 'blue', 'yellow', 'purple', 'rainbow', 'white', 'gray', 'black', 'colorful', 'mist', 'amber'];
  ST.onMap('world', (m, Wd) => {
    for (const n of TOWNS) {
      const t = OW.towns[n]; if (!t || !t.plaza) continue;
      const [x, y] = OW.near(m, t.plaza.x - 4, t.plaza.y - 2, null, 4) || [];
      if (x == null) continue;
      Wd.add(new G.props.Sign({ x: px(x), y: py(y), anyDir: true, look: 'board', text: async (c) => {
        const cur = now();
        const list = NEWS.filter(([ch, cond]) => CH(ch) <= cur && cond()).slice(-5).reverse();
        await c.narr('[y]대륙 소식지[/] — ' + (cur + 1) + '장 무렵\n' + list.map((x2) => '· ' + x2[2]).join('\n'));
      } }));
    }
  });

  /* ═════════ 결말 · 결전의 목소리 ═════════ */
  ST.moreFates = ST.moreFates || [];
  ST.moreFates.push((id, add) => {
    if (v('ens:rud') === 'doubt') add('rud', '루드는 기사단 장부를 전부 다시 적었다. 칸 이름을 바꿨다. 「허용 손실」 대신 「이름」. 칸이 모자라 장부가 세 배로 두꺼워졌다.');
    else if (v('ens:rud') === 'loyal') add('rud', '루드는 끝까지 기사단에 남았다. 기사단이 문을 닫는 날, 마지막으로 불을 끈 사람이 그였다. 누나가 밖에서 기다렸다.');
    if (v('ens:kids') === 'sparrow') add('berna', '베르나와 카렐은 참새단 부단장이 되었다. 참새단 규칙 제1조: 친구 주머니는 안 턴다. 제2조: 전설은 발바닥부터.');
    else if (v('ens:kids') === 'home') add('berna', '베르나는 오늘도 목검을 천 번 휘두른다. 카렐은 옆에서 센다. 둘 다 언젠가 곶에 가 보겠다고 한다. 이번엔 편지부터 쓰고.');
    if (v('ens:book') === 'shared') add('hemia', '헤미아와 비올라는 『세린 학적부 주석』을 함께 펴냈다. 비올라가 서문을, 헤미아가 수수께끼 부록을 썼다. 부록이 더 두껍다.');
    if (v('ens:edel') === 'doubt') add('edel', '에델은 백은 갑옷을 벗고 병동 문지기가 되었다. 「허용 손실」이라는 말을 쓰는 사람은 문 안으로 들이지 않는다.');
    if (f('ens:compass')) add('luce', '루체의 나침반은 무한호 조종석에 달려 있다. 바늘은 여전히 위를 가리킨다. 루체는 그 아래에서 등대를 지킨다. 위와 아래, 둘 다 불이 켜져 있다.');
    if (v('ens:lamps') === 'oil') add('pika', '피카는 금화왕에게 기름값을 갚았다. 금화 대신 등불 스무 개 값의 이야기로. 골디는 처음으로 「공짜」라는 말을 했다.');
  });
  ST.rallyExtra = ST.rallyExtra || [];
  ST.rallyExtra.push(
    ['rud', () => v('ens:rud') === 'doubt', '(목소리) 서쪽 이상 없음! 동쪽도 이상 없음! …가서 이상 없게 만들고 와!'],
    ['edel', () => v('ens:edel') === 'doubt', '(목소리) 백은 기사 에델, 명을 내리오. 살아서 돌아오시오. 이것만은 어기지 마시오.'],
    ['luce', () => f('ens:compass'), '(목소리) 바늘이 너를 가리켜! 아빠 배도 거기 있어!'],
    ['berna', () => !!v('ens:kids'), '(목소리) ' + '전설! 전설! 전설!' + ' …카렐도 소리 질러!'],
    ['hemia', () => v('ens:book') === 'shared', '(목소리) 세, 세 번째 줄 비워 뒀어요! 돌아와서 쓰세요!'],
  );
  G.ensemble = { SCENES, NEWS };
})();
