/* 결말 여덟: 재 · 되풀이 · 새벽 · 둥지 · 나눔 · 속죄 · 밤 · 잔광
   G.game.ending(id) — 검은 화면 위에 결말 장면(글) → 사람들의 그 뒤 → 만든 이 → 모은 결말 → 처음 화면으로.
   사람들의 그 뒤는 지금까지의 선택(깃발)을 따라 문장이 바뀐다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const S = () => G.state;
  const f = (k) => !!(G.state && G.state.flags[k]);
  const girl = () => S().gender === 'girl';
  const sib = () => (girl() ? '언니' : '누나');
  const nm = () => S().name || '아린';

  const ENDINGS = {
    ash: { no: 1, title: '재', sub: '모든 빛을 태워, 배고픔을 끝냈다', col: '#9a9aa8', music: 'sad',
      slides: () => [
        '탑들이 모은 천 년 치 빛이 수정을 지나 하늘로 쏘아졌다.\n흑점은 불탔다. 비명도 없이. 배고프다는 말도 없이.',
        '그리고 빛도 함께 탔다.\n그날 밤 대륙의 모든 등불이 꺼졌다. 다음 날 아침, 해는 떴지만 — 색이 없었다.',
        '사람들은 살았다. 아무도 빛바램으로 죽지 않았다. 바랠 빛이 없었으니까.\n그레이 사람들이 가장 먼저 적응했다. 400년 먼저 겪어 봤으니까.',
        '카이론은 재가 된 하늘을 오래 올려다보았다. 「계산은 맞았다.」 그리고 다시는 계산하지 않았다.',
        nm() + '의 앞머리는 이제 전부 하얗다. 아니, 회색이다. 모든 것이 회색이니까.\n토리아는 여전히 날지 못한다. 그래도 매일 아침 지붕에 올라가 날개를 편다. 「언젠가 색이 돌아오면.」',
        '재는 거름이 된다고 할머니가 말했다. 봄이 오면 알게 될 것이다.',
      ] },
    repeat: { no: 2, title: '되풀이', sub: '엄마 대신, 내가 그릇이 되었다', col: '#8ab8ff', music: 'requiem',
      slides: () => [
        '흑점을 삼켰다. 차가웠다. 그리고 곧, 아주 배가 고팠다.\n수정이 다시 닫혔다. 이번엔 안에 ' + nm() + '(이)가 있었다.',
        '세린은 16년 만에 수정 밖으로 걸어 나왔다. 걸음마를 다시 배우는 사람처럼. 그리고 수정에 이마를 대고 울었다.',
        '카이론은 새 장부를 폈다. 첫 줄: 「그릇 — 내 아이.」 그는 처음으로 그 두 글자를 썼다. 그리고 펜을 부러뜨렸다.',
        (f('lyra_sister') ? '리라는 아스트라에 남았다. 매일 수정 옆에서 노래한다. 「두 개의 등불이 있었네」. 가사를 또 바꿨다. 「하나는 수정 속에.」' : '밤마다 누군가 아스트라에서 노래를 부른다는 소문이 대륙에 돌았다.'),
        '토리아는 수정 앞에서 기다리기로 했다. 다람쥐가 그렇게 오래 사느냐고? 레벨 9에서 멈춘 다람쥐니까, 아마도.',
        '천 년 뒤, 누군가 또 이 수정 앞에 설 것이다. 그때 그 아이는 답을 찾을까.\n…되풀이는 끝나지 않았다. 다만, 조금 늦어졌을 뿐.',
      ] },
    dawn: { no: 3, title: '새벽', sub: '탑을 거꾸로 돌려, 빛을 사람들에게 돌려주었다', col: '#ffa87a', music: 'epic',
      slides: () => [
        '역류 장치가 돌았다. 대륙의 모든 탑이 한꺼번에 거꾸로 울었다.\n천 년 동안 모인 빛이 눈처럼, 불꽃처럼, 새벽처럼 대륙에 흩어졌다.',
        '흑점은 흩어진 빛을 따라가지 않았다. 따라갈 곳이 없었다. 가장 밝은 한 점이 사라졌으니까.\n흑점은 천천히 작아져, 밤하늘의 평범한 어둠이 되었다.',
        '새벽단은 이튿날 모든 탑의 핵을 뽑았다. 레아는 뽑은 핵을 녹여 종을 만들었다. 「새벽은 온다」가 새겨진 종.',
        '루드는 새 장부를 만들었다. 제목: 「돌려준 빛」. 매일 숫자를 센다. 늘어나는 숫자만.',
        '카이론은 천년성을 스스로 나와 레아 앞에 섰다. 레아는 한참 그를 보다가 말했다. 「새벽은 모두한테 와. 당신한테도.」',
        '토리아는 그날 아침, 흩어지는 빛 한 방울을 날개로 받았다. 그리고 — 떠올랐다. 한 뼘. 두 뼘.\n「찍! 나 날아! 진짜로!」',
      ] },
    nest: { no: 4, title: '둥지', sub: '규칙을 바꿔, 탑을 둥지로 만들었다', col: '#8ab8ff', music: 'epic',
      slides: () => [
        '역류 장치가 돌았다. 카시안이 기사단 전원에게 명령했다. 「오늘부터 탑은 빛을 모으지 않는다. 나눈다.」',
        '탑들은 헐리지 않았다. 대신 거꾸로 돌기 시작했다. 병든 마을에 빛을 보내는 둥지가 되었다. 빛바램병은 그해 겨울부터 줄었다.',
        '흑점은 모일 곳을 잃고 흩어졌다. 스텔라의 기록: 「접근 속도 0. 그다음 날부터 음수.」',
        '카이론은 챔피언 자리를 내려놓았다. 새 챔피언 투표에서 카시안이 뽑혔다. 카시안은 거절했다. 대신 「감찰관」으로 남았다. 장부의 숫자마다 이름을 붙이는 일.',
        '고르디는 정직한 기사 훈장을 받았다. 그리고 그린 마을로 돌아가 감자를 캤다.',
        '토리아는 둥지가 된 그린 마을 탑 꼭대기에서 날개를 폈다. 바람이 불었다. 「찍.」 떠올랐다. 규칙대로라면 다람쥐는 못 난다. 규칙은 바뀌었다.',
      ] },
    share: { no: 5, title: '나눔', sub: '배고픈 그릇들에게도, 한 입씩', col: '#fff4c8', music: 'ending',
      slides: () => [
        '역류 장치가 돌았다. 대륙으로 흩어지는 빛에게 부탁했다. 「조금만. 한 방울만. 저기, 배고픈 사람들에게도.」',
        '대륙 곳곳에서 사람들이 등불을 켰다. 마리엔이, 볼칸이, 루체가, 참새들이, 학원생들이, 에델과 루미에가, 볼트와 세피아가, 등불 거리의 칸델이.\n한 방울씩. 누구의 빛도 바래지 않을 만큼.',
        '흑점 속의 목소리들이 조용해졌다. 금빛 소년이 먼저. 612년의 여자가 그다음.\n「…배불러.」 그리고 흑점은 — 별이 되었다. 수천 개의 작은 별. 채워진 그릇들.',
        '수정이 열렸다. 세린이 걸어 나왔다. 카이론이 달려갔다. 챔피언이 넘어졌다. 레벨 99만 9999가.\n세린이 웃었다. 「여전히 그 장부 들고 다녔지? 바보.」',
        (f('lyra_sister') ? '리라는 처음으로 엄마 앞에서 노래를 불렀다. 가사를 원래대로 돌렸다. 「두 개의 등불이 있었네 / 둘 다 집으로 돌아왔네.」' : '밤의 땅 블랙에 마침내 해가 떴다.'),
        '그린 마을 참나무 아래. 에벨린 할머니가 문 앞에 서 있었다. 「…오늘도 렙업했나?」\n토리아가 날았다. 레벨 9에서 그렇게 오래 멈춰 있던 다람쥐가. 세린이 16년 전에 빌려 간 빛을 돌려받고.\n「찍. 이제야 알았어. 나는 못 나는 게 아니라, 빌려준 거였어.」',
      ] },
    atone: { no: 6, title: '속죄', sub: '계산이 부른 것을, 계산한 사람이 끝냈다', col: '#e8c048', music: 'requiem',
      slides: () => [
        '카이론이 앞으로 나섰다. 「내 계산이 부른 것이다. 내가 끝낸다.」',
        '챔피언은 흑점을 안았다. 삼키지 않았다. 세린이 그랬던 것처럼, 안았다. 레벨 99만 9999의 빛이 흑점을 조금씩 채웠다.',
        '「세린. 이번엔 내가 안고 있을게. 애들을 부탁해.」\n수정이 닫혔다. 안에 카이론이 있었다. 처음으로, 아무것도 세지 않는 얼굴로.',
        '세린은 수정 앞에 매일 꽃을 둔다. 그린 흙에서 키운 꽃.' + (f('lyra_sister') ? ' 리라와 함께.' : ''),
        (f('c9_promise') ? '녹턴은 약속을 지켰다고 말했다. 「해치지 않고, 멈추게 했다.」 그리고 처음으로 잠들었다. 사흘 동안.' : '녹턴은 아스트라에 남아 수정을 지킨다. 이번엔 그림자가 아니라, 그 사람 옆에서.'),
        '흑점은 줄어들고 있다. 아주 천천히. 스텔라의 예측으로는 212년. 카이론은 숫자가 싫다고 했지만, 이번 숫자는 좋아할 것이다.',
      ] },
    night: { no: 7, title: '밤', sub: '흑점을 밤 속에 숨겼다. 아무도 모르게', col: '#b87aff', music: 'dream',
      slides: () => [
        '역류 장치가 돌았다. 흩어지는 빛 사이로, 미드나잇이 흑점의 꼬리를 물고 내려왔다. 「고양이는 쥐를 좋아하지. 배고픈 쥐는 더.」',
        '흑점은 영원한 밤의 땅 블랙으로 숨었다. 그곳은 원래 빛이 없는 곳. 모일 빛이 없으니 흑점은 거기서 조용히 잠들었다.',
        '대륙의 나머지는 밝아졌다. 탑은 멈췄고, 빛은 돌아갔다. 아무도 흑점이 어디 갔는지 모른다. 밤 사람들만 안다. 밤은 비밀을 잘 지킨다.',
        (f('lyra_sister') ? '리라는 블랙의 새 성주가 되었다. 성 꼭대기에서 매일 밤 흑점에게 자장가를 불러 준다. 에벨린 할머니의 노래.' : '밤의 성에서는 매일 밤 자장가가 들린다고 한다.'),
        '녹턴은 가면을 벗고 등불 거리의 등불지기가 되었다. 칸델이 드디어 은퇴했다.',
        '토리아는 밤하늘을 날아다닌다. 어둠 속에서만 뜨는 다람쥐. 「찍. 낮엔 부끄러워.」',
      ] },
    glow: { no: 8, title: '잔광', sub: '배고픈 그릇은, 전부를 주었다', col: '#ffffff', music: 'requiem',
      slides: () => [
        '역류 장치가 돌았다. 흩어지는 빛에 ' + nm() + '의 빛도 섞였다. 조금만 섞으려 했다. 그런데 — 멈출 수가 없었다.\n배고픈 그릇은 주는 법도 배고프게 배운다.',
        '흑점은 채워졌다. ' + nm() + '의 전부로. 하늘에 작은 별이 하나 늘었다.',
        '' + nm() + '(은)는 살았다. 레벨 1. 흰빛이 한 방울도 남지 않은 평범한 아이. 앞머리는 다시 갈색이 되었다.',
        '가끔 밤하늘의 어떤 별을 보면 배가 조금 고프다. 그럴 때면 토리아가 도토리를 준다. 두 개. 아니, 세 개.',
        '토리아는 날았다. 흰빛이 흩어지던 날, 날개 밑으로 따뜻한 바람이 들어왔다. 「…네가 준 거야. 마지막에. 알아.」',
        '잔광. 해가 지고 난 뒤에도 하늘에 남는 빛. 사람들은 그 빛을 보며 집으로 돌아간다.',
      ] },
  };

  /** 사람들의 그 뒤: 만난 사람만, 선택에 따라 */
  function fates(id) {
    const s = S(), out = [];
    const met = (k) => f('met:' + k);
    const add = (who, text) => out.push({ who, text });
    add('evelyn', id === 'repeat' ? '에벨린 할머니는 침대 밑 상자를 다시 닫았다. 「또 16년이가.」' : '에벨린 할머니는 침대 밑 상자를 드디어 비웠다. 안에는 세린이 남긴 편지 한 통. 「엄마, 우리 애가 오면 이거 줘.」');
    if (met('noah') || f('c1_dew_given')) add('noah', f('noah_herb') ? '노아는 봄에 퇴원했다. 머리칼 끝이 조금 갈색으로 돌아왔다. 설화초를 화분에 키운다.' : f('noah_own') ? '노아는 봄에 퇴원했다. 손끝이 따뜻하다. 「' + (girl() ? '누나' : '형아') + '가 준 빛이 아직 여기 있어.」' : f('noah_lumie') ? '노아는 살았다. 성녀님의 마지막 빛으로. 커서 의사가 되겠다고 한다. 빛 말고 약으로 고치는.' : '노아는 그린 마을 창가에서 하늘을 본다. 매일 조금씩 나아진다.');
    if (met('cassian')) add('cassian', (s.bond.cassian || 0) >= 3 ? '카시안은 칼을 내려놓지 않았다. 대신 칼끝이 향하는 곳을 바꿨다. 「장부 한 줄마다 얼굴을 떠올리는 사람」이 되었다.' : '카시안은 기사단에 남았다. 가끔 블루 부두에 가서 바다를 본다. 누군가와 겨뤘던 자리.');
    if (met('rud') || met('lea')) add('rud', s.flags.route_lock === 'dawn' ? '레아와 루드는 새벽단을 해산하고 「새벽 조합」을 만들었다. 광부와 농부와 아이들의 조합.' : '루드는 레드 광산의 장부를 맡았다. 동생들이 약을 사러 가는 길이 짧아졌다.');
    if (met('viola')) add('viola', '비올라는 세린의 기록 스물다섯을 모두 깼다. 스물여섯째 기록은 자기가 만들었다. 「흰빛에게 과녁 대결 이기기」. 아직 도전 중.');
    if (met('lumie')) add('lumie', f('noah_lumie') ? '루미에의 빛은 다했다. 이제 그녀는 약탕기 앞에 선다. 설화초를 달이며, 서툴게 웃는다.' : '루미에는 기도를 바꿨다. 「빛을 바치는 자는 복되다」 대신 「빛을 나누는 자는 배부르다」.');
    if (met('edel')) add('edel', '에델은 투구를 창고에 넣었다. 대성당 종은 이제 매주 울린다. 기쁠 때 치는 종.');
    if (met('bolt')) add('bolt', '볼트는 탑 도면을 난로에 넣었다. 세피아는 색 표본 병의 마지막 칸을 채웠다. 하늘색. 「예쁘다.」');
    if (met('rolo')) add('rolo', '롤로의 새 공연 「색은 나눌수록」은 무지개 서커스 최장기 공연이 되었다. 분장은 안 한다.');
    if (f('orhan_done')) add('luce', '루체의 아빠는 봄에 블루 등대로 돌아왔다. 눈은 보이지 않지만, 등불 냄새로 집을 찾았다.');
    if (met('goldy')) add('goldy', f('goldy_promise') ? '골디는 하늘 이야기를 들었다. 금화 삼만 닢어치였다고 한다. 「공짜는 없어. …그래도 이번엔 싸게 샀군.」' : '골디는 참새단에게 가게 하나를 내주었다. 이름은 「외상 사절」. 외상은 된다.');
    if (met('pyros')) add('pyros', '피로스는 제413안을 그리고 있다. 「하늘에서 내려오는 로켓」. 봄바가 벌써 폭탄을 채웠다.');
    if (met('stella')) add('stella', f('stella_promise') ? '스텔라에게 매달 하늘 이야기가 도착한다. 무한호 편으로. 스텔라는 그걸 기록하지 않는다. 그냥 듣는다.' : '스텔라는 여전히 하늘을 본다. 이제 혼자가 아니다. ' + (f('c11_woke') ? '깨어난 여덟 사람이 창가에 의자를 놓았다.' : '캡슐 속 여덟이 곧 깨어날 것이다.'));
    if (met('midnight')) add('midnight', '미드나잇은 천 년 치 외상 장부를 태웠다. 「이제 받을 사람이 없거든. 아니, 다 받았거든.」');
    if (f('met:graus') || f('c1_tower')) add('graus', id === 'share' ? '그라우스는 흰 방에서 깨어났다. 숫자를 하나부터 다시 센다. 가끔 셈을 틀리고, 틀리면 웃는다.' : '그라우스는 천년성의 흰 방에서 매일 숫자를 센다. 하나부터. 아무도 그 숫자를 장부에 적지 않는다.');
    for (const fn of G.story.moreFates || []) fn(id, add, out);   // 숨은 이야기로 이어진 사람들
    return out;
  }

  /* ───────── 화면 ───────── */
  function el(tag, css, html) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }
  const rich = (t) => String(t).replace(/\[(y|r|b|p|w|g|s)\]/g, (m, k) => '<span style="color:' + ({ y: '#ffe07a', r: '#ff8a9a', b: '#8ac8ff', p: '#d8a8ff', w: '#ffffff', g: '#9ae8a8', s: '#b8b0c8' }[k]) + '">').replace(/\[\/\]/g, '</span>').replace(/\n/g, '<br>');
  function waitKey(min, max) {
    return new Promise((res) => {
      let t = 0;
      G.script.frames((dt) => { t += dt; if (t > min && (G.input.pressed('confirm') || (G.ui.tapped && G.ui.tapped()))) { G.input.eat && G.input.eat('confirm'); return true; } return t > max; }).then(res);
    });
  }
  function saveEnding(id) {
    try { const k = 'lvup3_endings'; const o = JSON.parse(localStorage.getItem(k) || '{}'); o[id] = Date.now(); localStorage.setItem(k, JSON.stringify(o)); return o; } catch (e) { return { [id]: 1 }; }
  }
  G.game = G.game || {};
  G.game.ending = async function (id) {
    const E = ENDINGS[id] || ENDINGS.share;
    const stage = document.getElementById('stage');
    const ov = el('div', 'position:absolute;inset:0;z-index:60;background:#05040a;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;color:#e8e4f0;font-family:var(--disp),Galmuri11,sans-serif;opacity:0;transition:opacity 1.2s');
    stage.appendChild(ov);
    await new Promise((r) => setTimeout(r, 30)); ov.style.opacity = '1';
    await new Promise((r) => setTimeout(r, 1200));
    G.game.scene = 'ending';          // 결말 동안 세계는 멈춘다
    if (G.audio) { G.audio.stop(1.5); setTimeout(() => G.audio.music(E.music || 'ending'), 1600); }
    const box = el('div', 'max-width:40ch;line-height:1.9;font-size:15px;word-break:keep-all;transition:opacity .8s;opacity:0');
    ov.appendChild(box);
    const show = async (html, min, max) => { box.style.opacity = '0'; await new Promise((r) => setTimeout(r, 500)); box.innerHTML = html; box.style.opacity = '1'; await waitKey(min, max); };
    await new Promise((r) => setTimeout(r, 1400));
    await show('<div style="font-size:12px;letter-spacing:.5em;color:' + E.col + '">결말 ' + E.no + ' / ' + Object.keys(ENDINGS).length + '</div><div style="font-size:34px;margin:14px 0;color:#fff;text-shadow:0 0 18px ' + E.col + '">' + E.title + '</div><div style="font-size:13px;color:#b8b0c8">' + E.sub + '</div>', 1.5, 6);
    for (const t of E.slides()) await show(rich(t), 1.2, 9);
    // 사람들의 그 뒤
    const fs = fates(id);
    for (let i = 0; i < fs.length; i += 3) {
      const part = fs.slice(i, i + 3).map((x) => '<div style="margin:10px 0"><b style="color:' + (G.cast.color(x.who) || '#fff') + '">' + (G.cast.name(x.who) || '') + '</b><br><span style="font-size:13px;color:#d8d0e8">' + rich(x.text) + '</span></div>').join('');
      await show('<div style="font-size:11px;letter-spacing:.4em;color:#8a82a0;margin-bottom:8px">그 뒤</div>' + part, 1.5, 12);
    }
    // 만든 이
    await show('<div style="font-size:12px;letter-spacing:.4em;color:#8a82a0">무한렙업 대모험</div><div style="font-size:22px;margin:10px 0;color:#fff">빛의 검과 무한의 그릇</div><div style="font-size:13px;line-height:2;color:#c8c0d8">이야기 · 그림 · 소리 · 코드<br>한 파일 안에, 전부 손으로<br><br>원작의 마음 — 「무한으로 렙업하자!!」<br>함께 걸어 준 모든 사람에게</div>', 2, 10);
    const got = saveEnding(id);
    const list = Object.values(ENDINGS).sort((a, b) => a.no - b.no).map((e2) => { const k2 = Object.keys(ENDINGS).find((kk) => ENDINGS[kk] === e2); return '<span style="display:inline-block;margin:4px 6px;padding:4px 10px;border:1px solid ' + (got[k2] ? e2.col : '#3a3448') + ';color:' + (got[k2] ? e2.col : '#4a4458') + ';border-radius:3px">' + (got[k2] ? e2.title : '？') + '</span>'; }).join('');
    await show('<div style="font-size:12px;letter-spacing:.4em;color:#8a82a0;margin-bottom:10px">찾은 결말 ' + Object.keys(got).filter((k2) => ENDINGS[k2]).length + ' / ' + Object.keys(ENDINGS).length + '</div><div style="max-width:36ch">' + list + '</div><div style="font-size:12px;color:#8a82a0;margin-top:18px">다른 선택은 다른 결말로 이어진다.<br>새벽 · 질서 · 밤 — 그리고 나눈 만큼, 삼킨 만큼.</div>', 2, 20);
    await show('<div style="font-size:26px;color:#fff">끝</div><div style="font-size:13px;color:#b8b0c8;margin-top:12px">오늘도 렙업.</div>', 2, 8);
    S().flags['ended:' + id] = true; S().cleared = (S().cleared || 0) + 1;
    try { G.st.save(S(), true); } catch (e) { /* 저장 실패는 넘어간다 */ }
    ov.style.opacity = '0';
    await new Promise((r) => setTimeout(r, 1200));
    ov.remove();
    G.game.toTitle && G.game.toTitle();
  };
  G.story.ENDINGS = ENDINGS;
})();
