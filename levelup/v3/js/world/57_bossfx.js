/* 보스 무대: 보스마다 다른 등장 · 둘째 막 · 마지막 막 · 사람 보스의 싸움 중 대사 · 칼날이 맞부딪치는 순간 · 격파
   · 등장 — 보스마다 빛깔 · 문양 · 카드 꼴(짐승 · 사람 · 기계 · 마지막)이 다른 이름 카드. 잠깐 멈춰 서로 노려본다
   · 싸우는 동안 — 보스마다 둘레에 흩날리는 것(꽃잎 · 흙부스러기 · 불티 · 물거품 · 모래 · 유리 조각 · 바람 · 눈 · 은가루 · 그림자 · 데이터 …)
   · 둘째 막(체력 절반) — 멈추고, 그 보스만의 변신(만개 · 지진 · 분화 · 먹물 · 태양 · 거울 깨짐 · 번개 · 얼음 · 왕관 · 등불 꺼짐 · 경보 …)
     + 이름 카드 + 한마디. 그 뒤로 발밑에 기운이 감돌고 흩날림이 짙어진다
   · 사람 보스 — 싸움 중 대사(얼굴 컷인)와, 끝나기 직전 칼날이 맞부딪치는 정지 화면
   · 흑점 — 셋째 막 「일식」 · 조각에서 들은 이름들이 속삭인다
   · 격파 — 보스마다 다른 마지막 문장
   균형: 체력 · 공격 · 속도는 그대로(둘째 막의 속도 ×1.3과 보스 고유 변화도 그대로). 멈춘 동안은 서로 다치지 않는다 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const S = () => G.state;
  const W = () => G.world;
  const ST = G.story;
  const BS = G.bosses, Boss = BS.Boss;
  const sfx = (k) => G.audio && G.audio.sfx(k);
  const party = (id) => (S().party || []).includes(id);

  /* ═════════ 보스마다 ═════════
     col · col2: 빛깔 · glyph: 문양 · kind: beast | human | machine | final · amb: 흩날림 · p2: [둘째 막 이름, 한마디, 변신] · fin: 격파 문장
     lines(b): 사람 보스의 대사 { l1: [[누구, 말, 얼굴]…], p2: […], clash: […], p3: […] } — 장 · 이름에 따라 */
  const T = {
    thornqueen: { col: '#e85a8a', col2: '#8ae07a', glyph: '❦', amb: 'petals', p2: ['만개', '…아파. 아파서, 피어나.', 'bloom'], fin: '가시덩굴 여왕이 시들었다 — 뿌리가 다시 숨을 쉰다' },
    moleking: { col: '#f0c848', col2: '#a8783a', glyph: '◆', amb: 'crumbs', p2: ['금빛 광란', '내 금이다! 전부, 내 금!', 'quake'], fin: '황금 두더지왕이 쓰러졌다 — 금보다 무거운 것이 있었다' },
    salamander: { col: '#ff7a3a', col2: '#ffd84a', glyph: '✹', amb: 'embers', p2: ['용암의 심장', '(쉬이이익—)', 'erupt'], fin: '불도롱뇽의 불이 꺼졌다 — 화산이 조용히 숨을 쉰다' },
    kraken: { col: '#b87aff', col2: '#6ac8e8', glyph: '≋', amb: 'bubbles', p2: ['먹물의 밤', '(꾸르르르…)', 'ink'], fin: '새끼 크라켄이 물러났다 — 동굴에 물빛이 돌아온다' },
    sphinx: { col: '#f0c860', col2: '#e86a3a', glyph: '☼', amb: 'sand', p2: ['태양의 눈', '답을 맞힌 자여. 이제 검으로 답하라.', 'sunburst'], fin: '스핑크스가 눈을 감았다 — 피라미드의 봉인이 풀린다' },
    mirror: { col: '#c8a8ff', col2: '#ffffff', glyph: '◇', amb: 'glints', kind: 'human', p2: ['깨진 거울', null, 'shatter'], fin: '거울 속의 내가 웃으며 부서졌다',
      lines: () => ({ l1: [['hero', '배고프지? 나도야. 우린 같은 거잖아.', 'smirk', '거울 속 나']], p2: [['hero', '네가 나눠 준 빛, 전부 어디로 갔게? …나한테 왔어.', 'smirk', '거울 속 나']], clash: [['hero', '…안아 줄 거야? 아니면 벨 거야?', 'sad', '거울 속 나']] }) },
    roc: { col: '#8ab8ff', col2: '#ffffff', glyph: '➶', amb: 'wind', p2: ['폭풍의 눈', '(끼아아악—!)', 'lightning'], fin: '폭풍새가 구름 속으로 흩어졌다 — 하늘이 갠다' },
    frost: { col: '#bfe8ff', col2: '#4a8ad8', glyph: '❄', amb: 'snow', p2: ['깨어난 겨울', '…춥다. 천 년째, 춥다.', 'freeze'], fin: '서리 거인이 녹아내렸다 — 얼음 속의 빛이 풀려난다' },
    hollowking: { col: '#d8d8f0', col2: '#8a7ab8', glyph: '♛', amb: 'silver', p2: ['빈 왕관', '……배고프다. 왕국 하나로는 모자랐다.', 'crown'], fin: '빈 왕이 무너졌다 — 투구 속은 처음부터 비어 있었다' },
    nocturne: { col: '#8a7ad8', col2: '#2a1a48', glyph: '☾', amb: 'shadow', kind: 'human', p2: ['그림자의 밤', null, 'shade'], fin: '그림자 녹턴이 무릎을 꿇었다 — 커튼 사이로 빛 한 줄',
      lines: () => ({ l1: [['nocturne', '그분의 그림자로 16년. 명령은 하나였다. 「아이들을 지켜라.」', 'normal']], p2: [['nocturne', '등불을 꺼라. 그림자는 어둠 속에서 가장 길다.', 'angry']], clash: [['nocturne', '…너도 그분의 아이다. 그래서 더 물러설 수 없다.', 'sad']] }) },
    core: { col: '#6ad8ff', col2: '#ff4a5a', glyph: '⬢', amb: 'data', kind: 'machine', p2: ['경계 단계 2', '[경고] 침입자 위협도 상향. 방위 출력 최대.', 'alarm'], fin: '방위 핵 정지 — 388년 만에 문이 열린다' },
    mk7: { col: '#ffb04a', col2: '#9a9aa8', glyph: '⚙', amb: 'steam', kind: 'machine', p2: ['임계 가동', '[MK-7] 목표 재설정. 목표: 전부.', 'overheat'], fin: 'MK-7 정지 — 쇳덩이 거인이 처음으로 조용해졌다',
      lines: () => (party('sepia') ? { l1: [['sepia', 'MK-7, 정지 명령을 무시한다. …저 안에 녹음 장치가 있다. 990년 가을.', 'normal']] } : {}) },
    echogiant: { col: '#e8985a', col2: '#ffe0b0', glyph: '♪', amb: 'echo', p2: ['메아리의 폭주', '(…울… 울림… 림…)', 'echo'], fin: '울림이 잦아들었다 — 협곡에 내 발소리만 남는다' },
    swampqueen: { col: '#7ab87a', col2: '#c8b06a', glyph: '◎', amb: 'mist', p2: ['가라앉는 종', '(데엥— 데엥—)', 'bell'], fin: '벨루가 종을 내려놓았다 — 늪이 잠잠해진다' },
    trialshade: { col: '#e8e0ff', col2: '#b87aff', glyph: '✠', amb: 'runes', p2: ['셋째 시험', '힘은 보았다. 이제 마음을 보자.', 'rune'], fin: '트리아가 고개를 숙였다 — 시험 통과' },
    forgotking: { col: '#8ac8e8', col2: '#e8f4ff', glyph: '✧', amb: 'souls', p2: ['부르는 소리', '이름을… 이름을 불러 다오…', 'souls'], fin: '부르는 자가 잠들었다 — 묘지에 고요가 내린다' },
    toadstar: { col: '#8a7ae8', col2: '#ffe86a', glyph: '★', amb: 'stars', p2: ['별 토하기', '(꾸에에엑!)', 'starfall'], fin: '유성두꺼비가 별을 뱉고 쓰러졌다' },
    lvslime: { col: '#6ae07a', col2: '#ffe86a', glyph: '▲', amb: 'pixels', kind: 'machine', p2: ['Lv.∞', '레벨 업! 레벨 업! 레벨 업!', 'levelup'], fin: 'Lv.9999 격파 — 옛 렙업의 땅이 조용히 반짝인다' },
    graus: { col: '#c84a5a', col2: '#e8c048', glyph: '⚖', amb: 'coins', kind: 'human', p2: ['장부의 끝', null, 'judge'], fin: '그라우스가 무너졌다',
      lines: () => ({ l1: [['graus', '흰빛! 장부에 너는 숫자 하나다. 아주 비싼 숫자지!', 'smirk']], p2: [['graus', '기사들, 방패를 세워라! 이 광장 전부가 담보다!', 'angry'], ['toria', '찍…! 사람들 빛이 기둥으로 빨려 가! 빨리 끝내야 해!', 'cry']], clash: [['graus', '숫자는 거짓말을 안 해… 내가 이겨야 맞는 거다! 그래야 맞는 거라고!', 'angry']] }) },
    cassian: { col: '#c8343a', col2: '#e8e8f0', glyph: '⚔', amb: 'blade', kind: 'human', p2: ['둘째 자세', null, 'blade'], fin: '',
      lines: (b) => {
        if (b.name === '에델') return { l1: [['edel', '성녀님의 명이오. 나를 미워하시오. 그게 편하오.', 'normal'], ['toria', '찍… 미워하기 싫어. 너 나쁜 사람 아니잖아!', 'sad']], p2: [['edel', '백은의 창, 두 번째 자세. …그대의 빛이 따뜻해서, 창끝이 자꾸 무디어지오.', 'closed']], clash: [['edel', '「스스로 판단하라」… 성녀님이 그리 말씀하셨소. 지금 내 판단은—', 'shock']] };
        if (ST.after('c6')) return { l1: [['cassian', '관중이 보고 있다. 스승님도 어딘가에서 보고 계실 거다.', 'normal'], ['toria', '찍, 우리도 보고 있어! 힘내! …아니, 너 말고!', 'happy']], p2: [['cassian', '블루에서의 나와는 다르다. 너도 그렇겠지.', 'smirk']], clash: [['cassian', '…무겁군. 그 검에 무엇이 실려 있지?', 'shock']] };
        return { l1: [['cassian', '발이 가볍군. 누구한테 배웠지?', 'smirk'], ['toria', '찍! 할머니한테! 마당에서 허수아비 베면서!', 'angry']], p2: [['cassian', '좋다. 그럼 스승님께 배운 두 번째 자세다. 이건 막기 어려울 거다.', 'normal']], clash: [['cassian', '……좋은 눈이다. 검을 보는 게 아니라, 나를 보는군.', 'smirk']] };
      } },
    cassian2: { col: '#e84a4a', col2: '#f4f0e0', glyph: '⚔', amb: 'blade', kind: 'human', p2: ['마지막 초식', null, 'blade'], fin: '',
      lines: () => ({ l1: [['cassian', '스승님의 마지막 초식이다. 나도 아직 다 익히지 못했다. 같이 배우자.', 'smirk']], p2: [['cassian', '휘장 없이 드는 검은… 가볍군. 이상하게. 그래서 더 빠르다.', 'normal']], clash: [['cassian', '네 검은 누구를 위해 휘두르지? …대답 안 해도 된다. 보인다.', 'smile']] }) },
    kairon: { col: '#f0c848', col2: '#ffffff', glyph: '✦', amb: 'light', kind: 'human', p2: ['챔피언', null, 'champion'], fin: '',
      lines: () => ({ l1: [['kairon', '빠르다. 세린을 닮았군. 그 검 끝이.', 'normal']], p2: [['kairon', '레벨 99만 9999. 이 숫자가 나를 지켜 준 적은 한 번도 없다. 보여 주마, 왜 그런지.', 'closed']],
        clash: [['kairon', '…그 눈. 16년 전 수정 앞에서 본 눈이다.', 'shock']].concat(party('lyra') ? [['lyra', '아버지! 이제 그만해요… 제발.', 'cry']] : []) }) },
    blacksun: { col: '#b87aff', col2: '#1a1028', glyph: '●', amb: 'void', kind: 'final', p2: ['닫히는 하늘', null, 'eclipse'], fin: '',
      lines: () => ({ l1: [['kairon', '빛기둥을 맞춘다! 흰빛, 틈을 열어라!', 'angry']], p2: [['toria', '찍…! 하늘이 닫혀! 근데… 저 안에서 우는 소리가 나!', 'cry']], p3: [['serin', '조금만 더. 엄마가 안고 있을게. …저 아이들, 다 이름이 있었어.', 'sad']] }) },
  };
  const guardian = (b) => ({ col: b.D.col || '#c8c8d8', col2: '#f4ecdc', glyph: '▲', amb: /도깨비불/.test(b.name) ? 'souls' : /설인/.test(b.name) ? 'snow' : /집게/.test(b.name) ? 'bubbles' : /파수꾼/.test(b.name) ? 'steam' : 'crumbs', p2: ['수호자의 분노', null, 'guardian'], fin: U.josa(b.name, '이/가') + ' 길을 비켜섰다' });
  function stageOf(b) {
    if (b.bfx) return b.bfx;
    let st = T[b.type];
    if (!st && /^gd_hl_/.test(b.type)) st = guardian(b);
    if (!st) st = { col: b.D.col || '#e8c048', col2: '#f4ecdc', glyph: '✦', amb: 'glints', p2: ['둘째 막', null, 'guardian'], fin: U.josa(b.name, '이/가') + ' 쓰러졌다' };
    b.bfx = st;
    return st;
  }
  const titleParts = (b) => { const t = String(b.title || b.name); const i = t.lastIndexOf(' · '); return i > 0 ? [t.slice(0, i), t.slice(i + 3)] : ['', t]; };

  /* ═════════ 이름 카드 ═════════ */
  let cardT = null;
  function card(st, b, mode, name, small, sub) {
    const stage = document.getElementById('stage'); if (!stage) return;
    let el = document.getElementById('bosscard');
    if (!el) { el = document.createElement('div'); el.id = 'bosscard'; stage.appendChild(el); }
    const dur = mode === 'intro' ? 2.4 : mode === 'phase' ? 2.1 : 2.6;
    el.className = 'k-' + (st.kind || 'beast') + ' ' + mode;
    el.style.setProperty('--bc', st.col); el.style.setProperty('--bc2', st.col2 || '#f4ecdc'); el.style.setProperty('--bcd', dur + 's');
    const esc = (t) => String(t || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);
    el.innerHTML = '<div class="bc-band"></div>' + (st.kind === 'human' && mode !== 'final' ? '<div class="bc-slash"></div>' : '') + (st.kind === 'final' ? '<div class="bc-sun"></div>' : '')
      + '<div class="bc-glyph">' + esc(st.glyph) + '</div>' + (small ? '<div class="bc-small">' + esc(small) + '</div>' : '') + '<div class="bc-name">' + esc(name) + '</div>' + (sub ? '<div class="bc-sub">' + esc(sub) + '</div>' : '');
    el.hidden = false; void el.offsetWidth;
    clearTimeout(cardT); cardT = setTimeout(() => { el.hidden = true; el.innerHTML = ''; }, dur * 1000 + 60);
  }

  /* ═════════ 멈춤: 서로 다치지 않는 잠깐 ═════════ */
  const HOLD = { t: 0 };
  const bl0 = G.ui.blocking;
  G.ui.blocking = function () { return bl0.apply(this, arguments) || HOLD.t > 0; };   // 멈춘 동안 주인공 조작도 쉰다 (잠금 상태는 건드리지 않는다)
  function hold(b, sec) {
    b.holdT = Math.max(b.holdT || 0, sec);
    HOLD.t = Math.max(HOLD.t, sec);
    const p = W().player; if (p) { p.inv = Math.max(p.inv || 0, sec + 0.5); p.vx = p.vy = 0; }
    for (const e of W().ents) if (e.kind === 'shot' && e.owner !== 'player') e.dead = true;
  }
  G.story.onTick.push((dt) => { if (HOLD.t > 0) HOLD.t -= dt; });

  /** 얼굴 컷인을 차례로 (멈춘 동안) */
  async function talk(b, st, lines) {
    if (!lines || !lines.length) return;
    let tot = 0; for (const l of lines) tot += 1.1 + l[1].length * 0.045;
    hold(b, tot + 0.3);
    for (const [who, text, face, nm] of lines) {
      const sec = Math.min(3.4, 1.1 + text.length * 0.045);
      if (b.dead) break;
      await G.cine.cutin({ who, title: text, small: nm || (who === 'hero' ? '' : (G.cast.name && G.cast.name(who)) || ''), col: st.col, face: face || 'normal', sec, sfx: 'select' });
    }
  }

  /* ═════════ 흩날림 ═════════ */
  const rnd = (a, b2) => a + Math.random() * (b2 - a);
  const AMB = {
    petals: (b, x, y) => G.fx.part({ x, y, z: rnd(30, 60), vx: rnd(-14, 14), vy: rnd(-4, 6), vz: -12, life: 2.6, col: Math.random() < 0.5 ? '#ff9ac8' : '#ffd0e0', size: 2 }),
    crumbs: (b, x, y) => G.fx.part({ x, y, z: rnd(40, 70), vz: -30, g: 40, life: 1.6, col: Math.random() < 0.3 ? '#e8c048' : '#8a6a4a', size: 1 }),
    embers: (b, x, y) => G.fx.part({ x, y, z: 0, vx: rnd(-8, 8), vz: rnd(18, 36), life: 1.8, col: Math.random() < 0.5 ? '#ffb04a' : '#ff6a2a', size: 1, glow: true }),
    bubbles: (b, x, y) => G.fx.part({ x, y, z: 0, vx: rnd(-6, 6), vz: rnd(14, 26), life: 2, col: '#bfe8ff', size: Math.random() < 0.3 ? 2 : 1 }),
    sand: (b, x, y) => G.fx.part({ x: x - 120, y, z: rnd(2, 20), vx: rnd(70, 110), vz: rnd(-2, 4), life: 2.2, col: '#e8c890', size: 1 }),
    glints: (b, x, y) => G.fx.part({ x, y, z: rnd(4, 30), life: 0.5, col: '#ffffff', size: 1, glow: true }),
    wind: (b, x, y) => G.fx.part({ x: x - 140, y, z: rnd(6, 30), vx: rnd(200, 260), life: 1.1, col: '#e8f4ff', size: 1 }),
    snow: (b, x, y) => G.fx.part({ x, y, z: rnd(40, 70), vx: rnd(-10, 10), vz: -16, life: 3, col: '#ffffff', size: Math.random() < 0.3 ? 2 : 1 }),
    silver: (b, x, y) => G.fx.part({ x, y, z: rnd(30, 60), vz: -8, vx: rnd(-6, 6), life: 3, col: '#d8d8f0', size: 1, glow: true }),
    shadow: (b, x, y) => G.fx.part({ x, y, z: 0, vx: rnd(-6, 6), vz: rnd(8, 16), life: 2.2, col: Math.random() < 0.5 ? '#3a2a5a' : '#6a5aa8', size: 2 }),
    data: (b, x, y) => G.fx.part({ x, y, z: 0, vz: rnd(20, 40), life: 1.4, col: Math.random() < 0.7 ? '#6ad8ff' : '#ffffff', size: 1, glow: true }),
    steam: (b, x, y) => (Math.random() < 0.5 ? G.fx.part({ x, y, z: 2, vx: rnd(-10, 10), vz: rnd(12, 20), life: 1.6, col: '#c8c8d0', size: 2 }) : G.fx.part({ x, y, z: 4, vx: rnd(-40, 40), vz: rnd(30, 60), g: 160, life: 0.5, col: '#ffb04a', size: 1, glow: true })),
    echo: (b, x, y) => { if (Math.random() < 0.15) G.fx.ring(x, y, '#e8985a', 10, 0.8, 1); },
    mist: (b, x, y) => G.fx.part({ x, y, z: rnd(2, 10), vx: rnd(6, 14), life: 3, col: '#a8c8a8', size: 3 }),
    runes: (b, x, y) => G.fx.part({ x, y, z: rnd(6, 24), vz: 6, life: 1.4, col: Math.random() < 0.5 ? '#e8e0ff' : '#b87aff', size: 1, glow: true }),
    souls: (b, x, y) => G.fx.part({ x, y, z: 0, vx: rnd(-4, 4), vz: rnd(10, 18), life: 2.6, col: '#8ac8e8', size: 2, glow: true }),
    stars: (b, x, y) => G.fx.part({ x: x + 60, y: y - 40, z: rnd(40, 70), vx: -50, vy: 30, vz: -30, life: 1.4, col: Math.random() < 0.5 ? '#ffe86a' : '#ffffff', size: 1, glow: true }),
    pixels: (b, x, y) => G.fx.part({ x, y, z: rnd(0, 20), vz: 10, life: 0.9, col: Math.random() < 0.6 ? '#6ae07a' : '#ffe86a', size: 2 }),
    coins: (b, x, y) => G.fx.part({ x, y, z: rnd(40, 60), vz: -20, g: 60, life: 1.4, col: '#e8c048', size: 1, glow: true }),
    blade: (b, x, y) => G.fx.part({ x, y, z: rnd(4, 20), vx: rnd(-30, 30), life: 0.35, col: '#ffffff', size: 1 }),
    light: (b, x, y) => G.fx.part({ x, y, z: 0, vz: rnd(30, 50), life: 1.2, col: Math.random() < 0.5 ? '#fff2a8' : '#f0c848', size: 1, glow: true }),
    void: (b, x, y) => { const a = Math.atan2(b.y - y, b.x - x); G.fx.part({ x, y, z: rnd(10, 40), vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, life: 2, col: Math.random() < 0.5 ? '#b87aff' : '#2a1a48', size: 2 }); },
  };
  function ambient(b, st, dt) {
    const f = AMB[st.amb]; if (!f) return;
    const rate = b.phase3 ? 34 : b.phase2 ? 22 : 11;
    b.ambC = (b.ambC || 0) + dt * rate;
    while (b.ambC >= 1) { b.ambC -= 1; f(b, b.x + rnd(-170, 170), b.y + rnd(-110, 90)); }
  }

  /* ═════════ 변신 ═════════ */
  function flash(col, a) { if (G.cine) G.cine.flash(col, 0.5, a == null ? 0.6 : a); }
  function burst(b, st, kind) {
    const x = b.x, y = b.y - (b.h || 30) / 2;
    for (let i = 0; i < 3; i++) setTimeout(() => { if (!b.dead) G.fx.ring(x, y, i === 1 ? st.col2 : st.col, 26 + i * 24, 0.6, 3 - i); }, i * 140);
    G.fx.sparks(x, y, 40, st.col, 180); G.fx.shards(x, y, 24, st.col);
    const W0 = W();
    const dim = (k, sec) => { const m = W0.map; if (!m) return; const was = m.dark || 0; m.dark = Math.max(was, k); setTimeout(() => { if (W().map === m) m.dark = was; }, sec * 1000); };
    switch (kind) {
      case 'bloom': for (let i = 0; i < 60; i++) AMB.petals(b, x + rnd(-90, 90), y + rnd(-60, 60)); flash('#ff9ac8', 0.5); break;
      case 'quake': W0.shake(8, 1.2); for (let i = 0; i < 30; i++) G.fx.dust(x + rnd(-140, 140), b.y + rnd(-60, 60), 3); flash('#f0c848', 0.45); break;
      case 'erupt': for (let i = 0; i < 50; i++) AMB.embers(b, x + rnd(-80, 80), b.y + rnd(-50, 50)); flash('#ff7a3a', 0.6); W0.shake(6, 0.6); break;
      case 'ink': dim(0.55, 4); for (let i = 0; i < 40; i++) AMB.bubbles(b, x + rnd(-90, 90), b.y + rnd(-60, 60)); flash('#2a1a48', 0.7); break;
      case 'sunburst': flash('#fff2a8', 0.8); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; for (let k = 1; k < 6; k++) G.fx.part({ x: x + Math.cos(a) * k * 16, y: y + Math.sin(a) * k * 10, z: 4, life: 0.6 + k * 0.08, col: '#f0c860', size: 2, glow: true }); } break;
      case 'shatter': flash('#ffffff', 0.85); G.fx.shards(x, y, 60, '#e8e0ff'); for (let i = 0; i < 4; i++) setTimeout(() => G.fx.ring(x + rnd(-40, 40), y + rnd(-30, 30), '#c8a8ff', 18, 0.5, 2), i * 120); break;
      case 'lightning': for (let i = 0; i < 4; i++) setTimeout(() => { flash('#ffffff', 0.7); W().shake(5, 0.2); sfx('bolt'); G.fx.sparks(x + rnd(-120, 120), b.y + rnd(-70, 70), 16, '#e8f4ff', 200); }, i * 170); break;
      case 'freeze': flash('#e8f8ff', 0.85); for (let i = 0; i < 70; i++) AMB.snow(b, x + rnd(-150, 150), y + rnd(-90, 90)); G.fx.ring(x, b.y, '#bfe8ff', 90, 1, 2); break;
      case 'crown': dim(0.45, 3.5); flash('#d8d8f0', 0.5); for (let i = 0; i < 40; i++) AMB.silver(b, x + rnd(-100, 100), y + rnd(-70, 70)); break;
      case 'shade': dim(0.75, 5); flash('#000000', 0.8); for (let i = 0; i < 40; i++) AMB.shadow(b, x + rnd(-120, 120), b.y + rnd(-70, 70)); break;
      case 'alarm': for (let i = 0; i < 5; i++) setTimeout(() => flash('#ff2a3a', 0.35), i * 300); for (let i = 0; i < 40; i++) AMB.data(b, x + rnd(-120, 120), b.y + rnd(-60, 60)); break;
      case 'overheat': flash('#ffb04a', 0.6); W0.shake(6, 0.8); for (let i = 0; i < 50; i++) AMB.steam(b, x + rnd(-70, 70), b.y + rnd(-40, 40)); break;
      case 'echo': for (let i = 0; i < 6; i++) setTimeout(() => G.fx.ring(x, y, '#e8985a', 20 + i * 22, 0.7, 2), i * 110); W0.shake(4, 0.8); break;
      case 'bell': for (let i = 0; i < 3; i++) setTimeout(() => { G.fx.ring(x, y, '#c8b06a', 40 + i * 30, 0.9, 3); W().shake(4, 0.3); sfx('bell'); }, i * 380); break;
      case 'rune': flash('#e8e0ff', 0.6); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; G.fx.part({ x: x + Math.cos(a) * 50, y: y + Math.sin(a) * 30, z: 6, vz: 20, life: 1.4, col: '#b87aff', size: 2, glow: true }); } break;
      case 'souls': dim(0.5, 3); for (let i = 0; i < 40; i++) AMB.souls(b, x + rnd(-120, 120), b.y + rnd(-60, 60)); flash('#8ac8e8', 0.4); break;
      case 'starfall': for (let i = 0; i < 40; i++) AMB.stars(b, x + rnd(-150, 150), y + rnd(-80, 40)); flash('#ffe86a', 0.5); break;
      case 'levelup': flash('#6ae07a', 0.6); for (let i = 0; i < 6; i++) setTimeout(() => G.fx.float(x + rnd(-30, 30), y - 10 - i * 6, 'LEVEL UP!', '#ffe86a', { big: true, life: 1 }), i * 160); break;
      case 'judge': flash('#e8c048', 0.5); for (let i = 0; i < 50; i++) AMB.coins(b, x + rnd(-120, 120), y + rnd(-60, 60)); W0.shake(4, 0.5); break;
      case 'blade': flash('#ffffff', 0.55); for (let i = 0; i < 8; i++) G.fx.slash(x + rnd(-30, 30), y + rnd(-20, 20), rnd(0, Math.PI * 2), '#ffffff', 22); break;
      case 'champion': flash('#fff2a8', 0.85); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; G.fx.part({ x, y: b.y, vx: Math.cos(a) * 120, vy: Math.sin(a) * 70, z: 2, vz: 50, g: 0, life: 1, col: '#f0c848', size: 2, glow: true }); } W0.shake(7, 0.8); break;
      case 'eclipse': dim(0.65, 999); flash('#000000', 0.9); W0.shake(8, 1.4); break;
      default: flash(st.col, 0.5); W0.shake(5, 0.5);
    }
  }

  /* ═════════ 등장 · 둘째 막 · 사람의 순간 ═════════ */
  function intro(b) {
    const st = stageOf(b), [small, name] = titleParts(b);
    card(st, b, 'intro', name, small, st.kind === 'human' ? '— 겨룬다 —' : st.kind === 'final' ? '— 마지막 싸움 —' : '');
    hold(b, 1.7);
    sfx(st.kind === 'machine' ? 'impact' : st.kind === 'human' ? 'clank' : st.kind === 'final' ? 'thunder' : 'growl');
    W().shake(st.kind === 'final' ? 7 : 4, 0.6);
    G.fx.ring(b.x, b.y - (b.h || 30) / 2, st.col, 60, 0.8, 3);
    b.bfxT = 0; b.barkT = 7 + Math.random() * 5;
  }
  function phase2(b) {
    const st = stageOf(b), [, name] = titleParts(b);
    const L = st.lines ? st.lines(b) : null;
    W().slowmo(0.3, 0.7); W().hitstop(0.12);
    hold(b, 2.2);
    sfx('growl');
    burst(b, st, st.p2[2]);
    card(st, b, 'phase', st.p2[0], name, '둘째 막');
    if (st.p2[1]) setTimeout(() => { if (!b.dead) G.cine.bubble(b, st.p2[1], { life: 2.6 }); }, 900);
    if (L && L.p2) setTimeout(() => { if (!b.dead) talk(b, st, L.p2); }, 2100);
  }
  function clash(b) {
    const st = stageOf(b), p = W().player; if (!p) return;
    const L = st.lines ? st.lines(b) : null;
    hold(b, 1.9);
    W().slowmo(0.25, 1.1);
    const mx = (b.x + p.x) / 2, my = (b.y + p.y) / 2 - 12;
    let n = 0;
    const iv = setInterval(() => { if (++n > 7 || b.dead) { clearInterval(iv); return; } G.fx.sparks(mx, my, 10, n % 2 ? '#ffffff' : st.col, 140); sfx('clank'); W().shake(3, 0.12); }, 140);
    setTimeout(() => { if (b.dead) return; flash('#ffffff', 0.75); const a = Math.atan2(p.y - b.y, p.x - b.x); p.kx = Math.cos(a) * 260; p.ky = Math.sin(a) * 260; b.kx = -Math.cos(a) * 200; b.ky = -Math.sin(a) * 200; G.fx.ring(mx, my, st.col, 50, 0.5, 3); }, 1100);
    card(st, b, 'phase', '칼날이 맞부딪친다', titleParts(b)[1], '');
    if (L && L.clash) setTimeout(() => { if (!b.dead) talk(b, st, L.clash); }, 1500);
  }
  function phase3(b) {
    const st = stageOf(b), L = st.lines ? st.lines(b) : null;
    b.phase3 = true;
    hold(b, 2.4); W().slowmo(0.3, 0.8);
    burst(b, st, 'eclipse');
    card(st, b, 'phase', '일식', titleParts(b)[1], '셋째 막');
    // 조각에서 들은 이름들이 속삭인다
    const names = (G.story.shardNames && G.story.shardNames().length) ? G.story.shardNames() : ['아우룸', '벨라'];
    names.slice(0, 7).forEach((nm, i) => setTimeout(() => { if (!b.dead) G.cine.bubble(b, '…' + nm + '…', { life: 1.6 }); }, 600 + i * 420));
    if (L && L.p3) setTimeout(() => { if (!b.dead) talk(b, st, L.p3); }, 900 + names.length * 420);
  }
  function tick(b, dt) {
    if (b.dead || b.dying || b.st === 'wait') return;
    const st = stageOf(b), r = b.hp / Math.max(1, b.maxHp);
    ambient(b, st, dt);
    if (st.lines && !b.bfxL1 && r <= 0.8 && !b.phase2) { b.bfxL1 = true; const L = st.lines(b); if (L && L.l1) talk(b, st, L.l1); }
    if (st.kind === 'human' && !b.bfxClash && r <= 0.34 && r > 0.04) { b.bfxClash = true; clash(b); }
    if (st.kind === 'final' && !b.phase3 && r <= 0.25 && r > 0.02) phase3(b);
    // 사람 보스의 짧은 외침
    if (st.kind === 'human' && (b.barkT -= dt) <= 0) { b.barkT = 9 + Math.random() * 6; const BK = BARK[b.name] || BARK[b.type]; if (BK && HOLD.t <= 0) G.cine.bubble(b, U.pick(BK), { life: 1.8 }); }
  }
  const BARK = {
    카시안: ['발이 늦다!', '정면은 막힌다고 했다.', '한 번 더!', '좋아. 그거다.'],
    에델: ['창은 길다. 거리를 재시오.', '……흠.', '성녀님을 위하여.'],
    그라우스: ['이자가 붙는다!', '장부에 적어라!', '방패 앞에서 무릎 꿇어라!'],
    카이론: ['느리다.', '그게 전부인가.', '세린은 그보다 빨랐다.', '…좋다.'],
    '그림자 녹턴': ['그림자는 베이지 않는다.', '그분의 명이다.', '등불을 꺼라.'],
    '거울 속 나': ['나도 아파.', '똑같이 움직이네. 당연하지.', '배고파. 너도 그렇잖아.'],
  };

  /* ═════════ 보스 몸에 걸기 ═════════ */
  const start0 = Boss.prototype.start;
  Boss.prototype.start = function () {
    const was = this.st;
    start0.apply(this, arguments);
    if (was === 'wait' && this.st !== 'wait' && !this.noStage) intro(this);
  };
  const upd0 = Boss.prototype.update;
  Boss.prototype.update = function (dt, Wd) {
    if (this.holdT > 0 && !this.dying && !this.dead) {
      this.holdT -= dt; this.vx = this.vy = 0;
      if (this.flash > 0) this.flash -= dt;
      if (this.kx || this.ky) { G.ent.move(Wd.map, this, this.kx * dt, this.ky * dt); this.kx = U.approach(this.kx, 0, 900 * dt); this.ky = U.approach(this.ky, 0, 900 * dt); }
      return;
    }
    upd0.apply(this, arguments);
    if (!this.noStage) tick(this, dt);
  };
  // 둘째 막: 속도 ×1.3과 보스 고유의 변화는 예전 그대로, 「격노한다」 알림 대신 무대
  Boss.prototype.enrage = function () {
    this.speed *= 1.3;
    if (this.D.phase2) this.D.phase2(this);
    if (this.noStage) { sfx('growl'); W().shake(4, 0.5); return; }
    phase2(this);
  };
  // 겨루기 다치지 않게: 멈춘 동안 보스도 맞지 않는다
  const guards0 = Boss.prototype.guards;
  Boss.prototype.guards = function (info) { if (this.holdT > 0) return true; return guards0.apply(this, arguments); };
  // 격파
  const pk0 = Boss.prototype.preKill;
  Boss.prototype.preKill = function (info) {
    const was = this.dying;
    const r = pk0.apply(this, arguments);
    if (!was && this.dying && !this.duel && !this.noStage) {
      const st = stageOf(this), [, name] = titleParts(this);
      if (st.fin) card(st, this, 'final', name, '격파', st.fin);
      const self = this; let n = 0;
      const iv = setInterval(() => { if (++n > 5) { clearInterval(iv); return; } G.fx.ring(self.x, self.y - (self.h || 30) / 2, n % 2 ? st.col : st.col2, 20 + n * 18, 0.5, 2); }, 260);
      if (this.type === 'blacksun' && W().map) W().map.dark = 0;
    }
    return r;
  };
  // 둘째 막부터 발밑에 기운
  const draw0 = Boss.prototype.draw;
  Boss.prototype.draw = function (g, cx, cy) {
    if (this.phase2 && !this.hidden && !this.dead && !this.noStage) {
      const st = stageOf(this), x = Math.round(this.x - cx), y = Math.round(this.y - cy), t = this.t || 0;
      const rw = (this.r || 16) * 1.5 + Math.sin(t * 4) * 2;
      g.globalAlpha = 0.22 + Math.sin(t * 3) * 0.08; g.fillStyle = st.col;
      g.beginPath(); g.ellipse(x, y, rw, rw * 0.38, 0, 0, Math.PI * 2); g.fill();
      if (this.phase3) { g.globalAlpha = 0.18; g.fillStyle = st.col2; g.beginPath(); g.ellipse(x, y, rw * 1.6, rw * 0.6, 0, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
    }
    return draw0.apply(this, arguments);
  };
  G.bossfx = { T, stageOf, card, hold, HOLD };
})();
