/* 구경꾼과 피난: 사람들 곁에서 진짜 싸움이 벌어지면(적이 덤비거나 보스와 겨룰 때 — 혼자 칼을 휘두르거나 활 · 마법을 쏘는 것만으로는 아니다)
   사람마다 제 성격대로 반응하며 물러서고, 싸움이 끝나면 원래 자리로 돌아간다.
   · 반응 열여섯 — 비명 지르며 달아나기 · 웅크리기 · 아이 감싸기 · 응원 · 기도 · 기절 · 앞을 막아서기(경비) · 짐 챙겨 달아나기(상인) ·
     신나서 구경(아이) · 투덜대며 물러서기(노인) · 훈수 · 얼어붙었다 달아나기 · 덜덜 떨기 · 경고 외치기 · 욕하기 · 울기
     누가 무엇을 할지는 나이 · 차림(경비 · 상인 · 수녀 · 광대 …) · 사람마다 정해진 성격으로 고른다. 말은 반응마다 여럿에서 고른다
   · 사람 보스와 겨룰 때(카시안 · 에델 · 그라우스 · 카이론 · 녹턴 · 거울 속 나)는 달아나지 않고 둘레에 둥글게 서서 구경한다 —
     등장 · 첫 합 · 둘째 막 · 칼날 · 끝 무렵 · 이겼을 때 · 내가 맞았을 때 · 내가 크게 벴을 때마다 수군대고, 보스마다 다른 말
   · 싸움이 끝나고 조용해지면(2.5초) 「휴…」 같은 말과 함께 원래 자리 · 방향으로 걸어 돌아간다. 화면 밖이면 바로 제자리로 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TS = G.tiles.TS;
  const ST = G.story;
  const S = () => G.state;
  const W = () => G.world;
  const NPC = G.props.NPC, E = G.ent;
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '누나' : '형');
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fill = (t) => String(t).replace(/\{형\}/g, sib);

  /* ═════════ 반응 ═════════
     d: 물러설 거리 · sp: 걸음 · pose: 다다른 뒤 자세 · em: 감정 표시 · say: 말 (나이별) · again: 머무는 동안 가끔 하는 말 */
  const R = {
    scream: { d: 150, sp: 78, pose: 'sit', em: '!', say: { adult: ['꺄아악!', '몬스터다! 다들 피해!', '살려 줘요!', '으아아, 이리 오지 마!'], child: ['엄마아아!', '으아앙! 무서워!'], old: ['아이고 사람 살려!'] }, again: ['…갔어? 아직이야?', '숨 참아, 숨…', '들킬라…'] },
    cower: { d: 70, sp: 60, pose: 'sit', em: '…', shake: true, say: { adult: ['히익…!', '나, 나는 아무것도 안 봤어…', '머리 숙여, 머리!'], child: ['눈 감고 있을래…', '안 보여, 안 보여…'], old: ['허, 허억…'] }, again: ['…', '끝나라, 끝나라…', '오늘은 안 나올걸 그랬어…'] },
    protect: { d: 95, sp: 66, pose: 'hold', em: '!', say: { adult: ['얘들아, 내 뒤로!', '애들부터 피해!', '아이들 데리고 물러서요!'], old: ['젊은이들, 아이들부터!'] }, again: ['괜찮아, 괜찮아. 금방 끝나.', '고개 들지 마. 금방이야.'] },
    cheer: { d: 115, sp: 56, pose: 'cast', em: '♪', say: { adult: ['힘내! 할 수 있어!', '거기야! 뒤로 돌아!', '여행자 양반, 힘내요!'], child: ['{형} 힘내!', '이겨라! 이겨라!'], old: ['허허, 젊음이 좋구먼! 힘내게!'] }, again: ['오오!', '좋아, 좋아!', '한 번 더!', '조심해!'] },
    pray: { d: 95, sp: 52, pose: 'sit', em: '…', say: { adult: ['여신님, 저 사람을 지켜 주세요…', '빛이 저 사람과 함께하기를…'], old: ['늙은이 목숨 대신 저 젊은이를…'], child: ['착한 사람이 이기게 해 주세요…'] }, again: ['…부디.', '…빛이 함께하기를.'] },
    faint: { d: 30, sp: 40, pose: 'down', em: '…', faint: true, say: { adult: ['으… 피, 피가…', '세, 세상이 빙글…'], old: ['아이고, 정신이…'] }, again: ['…으음.', '…여, 여기가 어디…'] },
    guard: { d: 55, sp: 60, pose: 'charge', em: '💢', say: { adult: ['물러서! 여긴 위험하다!', '마을 사람들은 뒤로! 내가 막는다!', '경비 서는 놈이 도망칠 순 없지!'] }, again: ['한 놈도 마을로 못 들어간다!', '자리 지켜!', '여행자, 뒤는 맡겨!'] },
    goods: { d: 140, sp: 74, pose: 'lift', em: '!', say: { adult: ['내 물건! 내 물건!', '오늘 장사는 접는다!', '짐부터, 짐부터!'] }, again: ['깨진 거 없지…?', '하나, 둘… 다 있다.'] },
    excited: { d: 85, sp: 62, pose: 'cast', em: '♪', say: { child: ['우와아! 진짜 싸움이다!', '멋있다! 칼이 번쩍!', '나도 커서 저렇게 할 거야!'], adult: ['오, 구경거리다!'] }, again: ['한 번 더 해 봐!', '우와!', '방금 봤어?'] },
    grumble: { d: 65, sp: 30, pose: 'idle', em: '💢', say: { old: ['에잉, 이 늙은 뼈가 부러지겠네.', '요즘 몬스터들은 예의도 없어.', '내 젊을 땐 말이야…'], adult: ['에이, 또야…'] }, again: ['쯧쯧.', '하필 오늘.'] },
    advice: { d: 100, sp: 60, pose: 'idle', em: '!', say: { adult: ['등 뒤를 노려!', '굴러! 굴러서 피해!', '숨 고르고 다시!', '덤빌 때 한 박자 늦게 피해!'], old: ['서두르면 진다네! 한 박자!'] }, again: ['지금이야!', '옆으로!', '거리 벌려!'] },
    freeze: { d: 140, sp: 80, pose: 'sit', em: '!', freeze: 0.9, say: { adult: ['……어?', '저, 저거…'], child: ['……'], old: ['……허?'] }, again: ['다리가… 안 움직여…', '…휴.'] },
    shake: { d: 80, sp: 56, pose: 'idle', em: '…', shake: true, say: { adult: ['다, 다, 다리가…', '이, 이게 무슨…'], child: ['무, 무서워…'], old: ['허, 허허… 손이 떨리네.'] }, again: ['…덜덜.', '이, 이제 괜찮은 거지…?'] },
    warn: { d: 100, sp: 64, pose: 'idle', em: '!', say: { adult: ['조심해! 뒤에도 있어!', '저쪽에 하나 더!', '여행자! 옆이야, 옆!'], child: ['{형}, 뒤에!'] }, again: ['또 온다!', '왼쪽!', '오른쪽!'] },
    curse: { d: 90, sp: 62, pose: 'idle', em: '💢', say: { adult: ['몬스터 녀석들, 또야!', '징수탑이 생긴 뒤로 이것들이 늘었어!', '빌어먹을, 빨래 다 했는데!'], old: ['고얀 놈들!'] }, again: ['썩 꺼져라!', '에잇!'] },
    cry: { d: 80, sp: 58, pose: 'sit', em: '…', say: { child: ['흐엉… 엄마…', '무서워어… 흐윽…'] }, again: ['훌쩍…', '…엄마 어디 있어…'] },
  };
  /** 누가 무엇을 할지: 나이 · 차림 · 사람마다 정해진 성격 */
  const ageOf = (n) => { const l = n.look || {}; return l.age === 'child' || /아이|꼬마|어린/.test(n.name || '') ? 'child' : l.age === 'old' || /할머니|할아버지|노인|영감/.test(n.name || '') ? 'old' : 'adult'; };
  function choose(n) {
    const nm = n.name || '', age = ageOf(n), k = U.hash(nm + (n.cid || '')) % 1000;
    let pool;
    if (/경비|병사|기사|문지기|파수|순찰|대장/.test(nm)) pool = ['guard', 'guard', 'warn', 'advice'];
    else if (/상인|주인|가게|장수|행상|점원|빵/.test(nm)) pool = ['goods', 'goods', 'scream', 'curse'];
    else if (/수녀|사제|신부|성녀|수도/.test(nm)) pool = ['pray', 'pray', 'protect'];
    else if (/광대|시인|음유|악사|이야기꾼/.test(nm)) pool = ['cheer', 'excited', 'advice'];
    else if (age === 'child') pool = ['scream', 'excited', 'cry', 'cower', 'freeze', 'cheer', 'warn'];
    else if (age === 'old') pool = ['grumble', 'pray', 'faint', 'advice', 'cower', 'shake'];
    else pool = ['scream', 'cower', 'protect', 'cheer', 'shake', 'warn', 'curse', 'freeze', 'faint', 'advice'];
    return pool[k % pool.length];
  }

  /* ═════════ 사람 보스와 겨룰 때의 구경꾼 ═════════ */
  const D = {
    intro: ['결투다! 결투가 벌어진다!', '물러서, 물러서! 원 그려!', '저 사람이랑 붙는다고? 미쳤어!', '누구한테 걸래? 난 여행자한테 은화 한 닢!', '숨 죽여… 시작한다.', '엄마, 저기 봐! 칼 뽑았어!'],
    l1: ['말을 주고받네… 서로 아는 사이인가?', '싸우면서 이야기를 해?', '저 눈빛 봐. 그냥 싸움이 아니야.', '쉿, 무슨 말 하는지 들어 봐.'],
    hit: ['들어갔다!', '오오오!', '방금 봤어? 막은 데를 뚫었어!', '저게 맞네!', '와, 빠르다!', '한 방 더!'],
    hurt: ['아이고!', '괜찮아?!', '피해, 피해!', '맞았어… 일어나!', '으악, 아프겠다…', '정신 차려!'],
    p2: ['기운이 달라졌어…', '이제부터 진짜다.', '공기가 무거워졌어. 느껴져?', '저, 저게 본 실력이야?', '물러서! 더 물러서!', '방금 땅이 울린 것 같은데…'],
    clash: ['칼날 불꽃 봐!', '맞부딪쳤다!', '숨이 멎겠네…', '둘 다 안 물러서!', '저 소리… 귀가 울려!', '누가 밀리는 거야?!'],
    late: ['끝나 간다…!', '버텨! 조금만!', '한 번만 더 들어가면!', '둘 다 지쳤어…', '이건… 이길 수도 있겠는데?'],
    win: ['이겼다아아!', '와아아아!', '믿을 수가 없어!', '여행자가 이겼어!', '박수! 박수!', '오늘 일은 평생 얘기할 거야.'],
    lose: ['아…', '저런…', '그래도 잘 싸웠어!', '다음엔 이길 거야. 그 눈 봤어?'],
  };
  const DB = {
    카시안: { intro: ['카이론의 마지막 제자랑?!', '은빛 기사다! 저 사람 진짜 세대!'], hit: ['카시안 님이 밀린다고?!', '은빛 기사 갑옷에 금 갔다!'], clash: ['카시안 님이… 웃었어?', '저 기사가 칼을 저렇게 쓰는 거 처음 봐.'] },
    에델: { intro: ['백은 기사님이 창을 들었어…', '성녀님 명이래. 어쩌지…'], hit: ['백은 창이 흔들려!'], clash: ['에델 님… 울 것 같은 얼굴이야.'] },
    그라우스: { intro: ['그라우스다! 장부 귀신!', '저놈이 우리 빛을 걷어 갔어!'], hit: ['그라우스를 막아!', '잘한다! 한 대 더!', '내 빛 돌려내라!'], hurt: ['빛이… 빠져나가…', '기둥이 우릴 빨아들여…'], p2: ['기사들이 방패를 세웠어!', '광장 전부가 담보라니…'] },
    카이론: { intro: ['챔피언이다…', '레벨 99만 9999…'], hit: ['챔피언한테 들어갔어!'], clash: ['챔피언이랑 맞부딪쳤어…!'] },
    '그림자 녹턴': { intro: ['녹턴이다… 그림자가 움직여.'], p2: ['등불이 꺼진다…!'] },
    '거울 속 나': { intro: ['똑같이 생겼어…!', '저게 누구야? 둘 다 같은 사람이야?'], clash: ['자기 자신이랑 싸우는 거야…?'] },
  };
  const KID = { intro: ['칼싸움이다!', '{형} 이겨라!'], hit: ['우와아!', '맞혔다!'], hurt: ['{형}! 괜찮아?!'], win: ['{형}이 이겼다!', '최고야!'] };
  const OLD = { intro: ['허, 젊은 것들이…', '이 늙은이 살다 살다 이런 결투를 보는구먼.'], p2: ['저 기운… 옛 사천왕 겨루기 때 같구먼.'], win: ['허허, 대단하구먼. 정말 대단해.'] };
  function duelLine(ev, n, b) {
    const age = ageOf(n), bn = b && b.name;
    const sp = (bn && DB[bn] && DB[bn][ev]) || null;
    const own = age === 'child' ? KID[ev] : age === 'old' ? OLD[ev] : null;
    const L = (D[ev] || []).concat(sp && Math.random() < 0.55 ? sp : [], own && Math.random() < 0.6 ? own : []);
    const pref = sp && Math.random() < 0.45 ? sp : own && Math.random() < 0.5 ? own : L;
    return pref && pref.length ? fill(pick(pref)) : null;
  }

  /* ═════════ 위협: 지금 싸움이 벌어지는 곳 ═════════ */
  const isHuman = (b) => { try { return !!(G.bossfx && G.bossfx.stageOf(b).kind === 'human'); } catch (e) { return false; } };
  function threats() {
    const Wd = W(), p = Wd.player, out = []; if (!p) return out;
    for (const e of Wd.awake()) {
      if (e.dead || e === p) continue;
      if (e.boss) { if (e.st !== 'wait' && !e.dying && !e.noStage) out.push({ e, boss: true, human: isHuman(e), r: 210 }); continue; }
      if ((e.foe || e.enemy) && !e.friendly && !e.minionOf && e.hp != null && e.hp > 0 && e.aggro && U.dist(e.x, e.y, p.x, p.y) < 240) out.push({ e, r: 105 });
    }
    return out;
  }

  /* ═════════ 사람 하나의 반응 ═════════ */
  let talkBudget = 0;
  const ACTIVE = new Set();   // 반응 중인 사람 (화면 밖으로 달아나 잠든 사람도 놓치지 않게)
  function say(n, text, life) {
    if (!text || talkBudget <= 0 || !G.cine || (n.crowd && n.crowd.sayT > 0)) return;
    talkBudget -= 1; if (n.crowd) n.crowd.sayT = 2.6 + Math.random() * 2.4;
    G.cine.bubble(n, fill(text), { life: life || 1.9 });
  }
  function awayPoint(n, from, d) {
    const m = W().map; let a = Math.atan2(n.y - from.y, n.x - from.x);
    if (!isFinite(a)) a = Math.random() * Math.PI * 2;
    for (let k = 0; k < 8; k++) {
      const aa = a + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.45;
      const x = n.x + Math.cos(aa) * d, y = n.y + Math.sin(aa) * d;
      const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
      if (m.inb(tx, ty) && !m.blocked(tx, ty, n)) return { x, y };
    }
    return { x: n.x + Math.cos(a) * d * 0.4, y: n.y + Math.sin(a) * d * 0.4 };
  }
  function start(n, th) {
    const duel = th.boss && th.human;
    const kind = duel ? 'watch' : choose(n);
    const Rk = R[kind] || R.cheer;
    const age = ageOf(n);
    const home = n.crowd ? n.crowd.home : { x: n.x, y: n.y, dir: n.dir, state: n.state, forceAnim: n.forceAnim };   // 다시 반응해도 돌아갈 곳은 처음 자리
    n.crowd = { kind, phase: Rk.freeze ? 'freeze' : 'go', t: 0, calm: 0, sayT: 0, freezeT: Rk.freeze || 0, home, threat: th.e, duel };
    ACTIVE.add(n);
    if (duel) {
      // 둘레에 둥글게: 싸움 한가운데에서 120~150 떨어진 곳, 원래 자리 쪽
      const c0 = th.e, d0 = 125 + (U.hash(n.name || '') % 30);
      const a = Math.atan2(n.y - c0.y, n.x - c0.x);
      const want = { x: c0.x + Math.cos(a) * d0, y: c0.y + Math.sin(a) * d0 };
      const tx = Math.floor(want.x / TS), ty = Math.floor(want.y / TS);
      n.crowd.to = W().map.inb(tx, ty) && !W().map.blocked(tx, ty, n) ? want : awayPoint(n, c0, 60);
      n.crowd.sp = 60; n.crowd.pose = 'idle';
      n.emote = { k: '!', t: 0, life: 1 };
      return;
    }
    n.crowd.to = awayPoint(n, th.e, Rk.d * (0.85 + Math.random() * 0.3));
    n.crowd.sp = Rk.sp; n.crowd.pose = Rk.pose;
    n.emote = { k: Rk.em, t: 0, life: 1.4 };
    const L = Rk.say[age] || Rk.say.adult || Rk.say.child;
    if (L) say(n, pick(L), 1.8);
  }
  function setPose(n, pose) {
    n.forceAnim = null;
    if (pose === 'sit') n.state = 'sit';
    else if (pose === 'down') n.state = 'down';
    else if (pose === 'cast') { n.state = 'cast'; }
    else if (pose === 'hold' || pose === 'lift') n.state = pose;
    else if (pose === 'charge') n.state = 'charge';
    else n.state = 'idle';
  }
  function moveTo(n, to, sp, dt) {
    const d = U.dist(n.x, n.y, to.x, to.y);
    if (d < 3) return true;
    const [nx, ny] = U.norm(to.x - n.x, to.y - n.y), step = Math.min(d, sp * dt);
    const ox = n.x, oy = n.y;
    E.move(W().map, n, nx * step, ny * step);
    n.dir = U.dir4(nx, ny, n.dir); n.state = 'walk'; n.walkT = (n.walkT || 0) + dt * sp / 30; n.vx = nx * sp; n.vy = ny * sp;
    if (U.dist(ox, oy, n.x, n.y) < step * 0.2) { n.crowd.stuck = (n.crowd.stuck || 0) + dt; if (n.crowd.stuck > 0.8) { n.crowd.stuck = 0; return true; } } else n.crowd.stuck = 0;
    return false;
  }
  const onScreen = (n) => { const Wd = W(), cv = document.getElementById('cv'); const sc = (G.game && G.game.scale) || 1; const vw = cv ? cv.width / sc : 480, vh = cv ? cv.height / sc : 270; return n.x > Wd.rcx - 20 && n.x < Wd.rcx + vw + 20 && n.y > Wd.rcy - 40 && n.y < Wd.rcy + vh + 20; };
  function home(n) {
    const c = n.crowd; if (!c) return;
    n.x = c.home.x; n.y = c.home.y; n.dir = c.home.dir; n.state = c.home.state === 'sit' ? 'sit' : 'idle'; n.forceAnim = c.home.forceAnim; n.vx = n.vy = 0;
    n.crowd = null; ACTIVE.delete(n);
  }
  function crowdUpdate(n, dt) {
    const c = n.crowd; c.t += dt; if (c.sayT > 0) c.sayT -= dt;
    const th = c.threat, Rk = R[c.kind];
    if (G.script.running && !G.script.battle) { n.vx = n.vy = 0; return; }   // 연출 중에는 그 자리에서 기다린다
    if (c.phase === 'freeze') { n.state = 'idle'; if ((c.freezeT -= dt) <= 0) c.phase = 'go'; return; }
    if (c.phase === 'go') {
      if (moveTo(n, c.to, c.sp, dt)) { c.phase = 'stay'; setPose(n, c.pose); n.vx = n.vy = 0; if (th && !th.dead) n.dir = U.dir4(th.x - n.x, th.y - n.y, n.dir); }
      return;
    }
    if (c.phase === 'stay') {
      if (th && !th.dead && c.pose !== 'down' && c.pose !== 'sit') n.dir = U.dir4(th.x - n.x, th.y - n.y, n.dir);
      if (Rk && Rk.faint && c.t > 4 && c.pose === 'down') { c.pose = 'sit'; setPose(n, 'sit'); say(n, pick(Rk.again)); }
      if (!c.duel && Rk && Rk.again && Math.random() < dt * 0.22) say(n, pick(Rk.again));
      return;
    }
    if (c.phase === 'back') {
      if (!onScreen(n) && U.dist(n.x, n.y, c.home.x, c.home.y) > 4) { n.x = c.home.x; n.y = c.home.y; }
      if (moveTo(n, c.home, 32, dt) || c.t > 12) home(n);
    }
  }
  const BACK = { adult: ['휴… 끝났나?', '살았다…', '고마워, 여행자!', '심장 떨어지는 줄 알았네.', '이제 괜찮겠지?', '다들 다친 데 없지?', '…장사나 다시 해야지.'], child: ['끝났어? 진짜?', '{형} 최고야!', '나 안 울었어. 진짜야.', '엄마한테 자랑해야지!'], old: ['허허, 오래 살고 볼 일이구먼.', '에구, 다리야.', '젊은이 덕에 살았네.'] };
  const BACKDUEL = { adult: ['대단한 결투였어.', '평생 얘기할 거야, 오늘 일.', '숨을 못 쉬었네…'], child: ['나도 결투할 거야!', '{형} 멋있었어!'], old: ['좋은 칼싸움이었네.'] };
  function calmDown(n) {
    const c = n.crowd; c.phase = 'back'; c.t = 0; n.forceAnim = null;
    const age = ageOf(n), L = (c.duel ? BACKDUEL : BACK)[age] || BACK.adult;
    if (Math.random() < 0.6) { talkBudget = Math.max(talkBudget, 1); say(n, pick(L), 2); }
  }

  /* ═════════ 매 틱 ═════════ */
  const up0 = NPC.prototype.update;
  NPC.prototype.update = function (dt, Wd) {
    if (this.crowd && !this.script && !this.dead) { crowdUpdate(this, dt); return; }
    return up0.apply(this, arguments);
  };
  const cu0 = NPC.prototype.canUse;
  NPC.prototype.canUse = function () { if (this.crowd && this.crowd.phase !== 'back') return false; return cu0.apply(this, arguments); };
  const dr0 = NPC.prototype.draw;
  NPC.prototype.draw = function (g, cx, cy) {
    const c = this.crowd;
    if (c && c.phase === 'stay' && R[c.kind] && R[c.kind].shake) { const ox = Math.sin(this.t * 40) > 0 ? 1 : -1; return dr0.call(this, g, cx - ox, cy); }
    return dr0.apply(this, arguments);
  };
  let tk = 0, last = { bossHp: null, hp: null, late: false, boss: null };
  ST.onTick.push((dt) => {
    talkBudget = Math.min(3, talkBudget + dt * 1.6);
    tk -= dt; if (tk > 0) return; tk = 0.25;
    const Wd = W(), m = Wd.map, p = Wd.player; if (!m || !p || (ST.memNow && ST.memNow())) return;
    const TH = threats();
    // 사람 보스와 겨루는 중: 맞고 · 벨 때마다 구경꾼이 수군댄다
    const hb = TH.find((t) => t.boss && t.human);
    if (hb) {
      const b = hb.e, r = b.hp / Math.max(1, b.maxHp);
      if (last.boss !== b) last = { bossHp: b.hp, hp: S().hp, late: false, boss: b };
      if (b.hp < last.bossHp - b.maxHp * 0.06) { duelEvent('hit', b); last.bossHp = b.hp; }
      if (S().hp < last.hp) { duelEvent('hurt', b); }
      last.hp = S().hp;
      if (!last.late && r < 0.3) { last.late = true; duelEvent('late', b); }
    } else if (last.boss && last.boss.dead) { duelEvent(S().hp > 1 ? 'win' : 'lose', last.boss); last.boss = null; }
    const awake = new Set(Wd.awake());
    for (const n of [...ACTIVE]) {
      if (n.dead || !n.crowd || !Wd.ents.includes(n)) { ACTIVE.delete(n); continue; }
      if (n.crowd.phase === 'back') { if (!awake.has(n)) home(n); continue; }
      const th = n.crowd.threat;
      const near = TH.some((t) => U.dist(t.e.x, t.e.y, n.x, n.y) < t.r + 60);
      const alive = th && !th.dead && !th.dying && TH.some((t) => t.e === th);
      if (!near && !alive) { n.crowd.calm += 0.25; if (n.crowd.calm > 2.5) { if (awake.has(n)) calmDown(n); else home(n); } } else n.crowd.calm = 0;
    }
    for (const n of awake) {
      if (!(n instanceof NPC) || n.dead || n.hidden || n.follower || n.script || n.busy || n.voiceOff || !n.name) continue;
      if (G.script.running && !G.script.battle) continue;
      if (n.crowd) {
        // 사람 보스와의 결투가 곁에서 시작되면 달아나던 사람도 구경꾼이 된다 · 돌아가던 길에 다시 싸움이면 다시 반응
        const hbN = TH.find((t) => t.boss && t.human && U.dist(t.e.x, t.e.y, n.x, n.y) < t.r);
        if (hbN && !n.crowd.duel) start(n, hbN);
        else if (n.crowd.phase === 'back') { const t2 = TH.find((t) => U.dist(t.e.x, t.e.y, n.x, n.y) < t.r); if (t2) start(n, t2); }
        continue;
      }
      let best = null, bd = 1e9;
      for (const t of TH) { const d = U.dist(t.e.x, t.e.y, n.x, n.y); if (d < t.r && d < bd) { bd = d; best = t; } }
      // 사람 보스와 겨루는 자리면 곁의 졸개보다 결투를 본다
      const hbN = TH.find((t) => t.boss && t.human && U.dist(t.e.x, t.e.y, n.x, n.y) < t.r);
      if (hbN) best = hbN;
      if (best) start(n, best);
    }
  });
  function duelEvent(ev, b) {
    const Wd = W(); let k = 0;
    for (const n of Wd.awake()) {
      if (!n.crowd || !n.crowd.duel || n.crowd.phase === 'back') continue;
      if (Math.random() < (ev === 'win' || ev === 'intro' ? 0.7 : 0.4) && k < (ev === 'win' ? 4 : 2)) {
        const l = duelLine(ev, n, b);
        if (l) { talkBudget = Math.max(talkBudget, 1); say(n, l, 2); k++; }
        if (ev === 'win') { n.emote = { k: '♪', t: 0, life: 1.6 }; n.forceAnim = 'cast'; }
        else if (ev === 'hurt' || ev === 'p2' || ev === 'clash') n.emote = { k: '!', t: 0, life: 1 };
      }
    }
  }
  // 보스의 순간(57_bossfx)마다
  if (G.bossfx && G.bossfx.on) G.bossfx.on((ev, b) => { if (isHuman(b)) { if (ev === 'down') { duelEvent('win', b); last.boss = null; } else duelEvent(ev, b); } });
  G.crowd = { R, choose, D, DB };
})();
