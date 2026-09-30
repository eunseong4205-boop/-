/* 새로 붙은 땅의 마을: 동쪽 물안개 마을(안개 늪) · 남쪽 단풍 마을(단풍 협곡)
   새 사람들은 모두 옛 사람들과 이어져 있다 — 세린을 건네준 늪지기, 에벨린의 옛 제자, 볼칸의 딸, 그라우스를 떠난 기사.
   떠돌이 우편배달부 핀이 장이 바뀔 때마다 다른 마을에 나타나 만난 사람들의 편지를 전한다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TL = G.tiles, O = G.objs.O;
  const T = TL.T, TS = TL.TS;
  const D = G.data;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (x) => x * TS + 8, py = (y) => y * TS + 12;
  const MT = OW.towns.mist, AT = OW.towns.amber;
  const MX = MT.x, MY = MT.y, AX = AT.x, AY = AT.y;
  const night = () => G.story.nightFactor && G.story.nightFactor() > 0.5;

  /* ───────── 사람들 ───────── */
  const cast = (id, o) => { G.cast.C[id] = Object.assign({ id, voice: 1 }, o); };
  cast('morgan', { name: '늪지기 모르간', color: '#a8d0b8', voice: 0.6, desc: '안개 늪의 나룻배 사공. 40년 동안 같은 물길만 저었다. 16년 전 어느 밤을 잊지 못한다.',
    look: { age: 'old', hair: 'short', hc: '#c8c8c0', skin: 'tan', top: 'coat', tc: '#3e5a4e', trim: '#8a7a5a', bottom: 'pants', bc: '#2e3a34', hat: 'straw', hatC: '#a8a070', build: 'broad' } });
  cast('iren', { name: '약초사 이렌', color: '#9ae0a0', voice: 1.05, desc: '물안개 마을의 약초사. 에벨린의 옛 제자. 세린과 같은 방에서 약초를 말렸다.',
    look: { gender: 'girl', hair: 'braid', hc: '#4a6a3a', eye: '#6ab87a', top: 'robe', tc: '#4a6a5a', trim: '#c8d8a0', bottom: 'long', bc: '#2e4a3a', acc: ['flower'] } });
  cast('yuna', { name: '유나', color: '#c8e0f0', voice: 1.5, desc: '물안개 마을의 소녀. 30년째 열한 살이다. 안개 속으로 간 동생을 기다린다.',
    look: { gender: 'girl', age: 'child', hair: 'twin', hc: '#c8d8e4', eye: '#8ab8d8', skin: 'pale', top: 'dress', tc: '#8ab8c8', bottom: 'skirt', bc: '#5a7a8a', eyeShape: 'sleepy' } });
  cast('yuan', { name: '유안', color: '#d8e8f0', voice: 1.6, desc: '안개가 된 소년. 가라앉은 탑 앞에서만 보인다.',
    look: { age: 'child', hair: 'messy', hc: '#d0dde8', eye: '#a8c8e0', skin: 'pale', top: 'tunic', tc: '#a8c0d0', bottom: 'pants', bc: '#7a8a9a' } });
  cast('bell', { name: '그림자 사냥꾼 벨', color: '#b8a8d8', voice: 0.95, desc: '징수 기사단 제3대 출신. 그린 마을 「특별 징수」가 있던 날 칼을 버렸다. 지금은 흑점의 그림자를 사냥한다.',
    look: { gender: 'girl', hair: 'short', hc: '#2a2638', eye: '#b8a8ff', eyeShape: 'sharp', top: 'armor', tc: '#5a5a6e', trim: '#8a7ab8', bottom: 'pants', bc: '#2a2a36', cape: '#3a2a4a', scar: true, acc: ['sword'] } });
  cast('haru', { name: '대장장이 하루', color: '#ff9a6a', voice: 1.1, desc: '단풍 마을의 대장장이. 볼칸의 딸. 징수탑 부품을 두드리기 싫어 집을 나왔다.',
    look: { gender: 'girl', hair: 'pony', hc: '#c84a2a', eye: '#e8903a', skin: 'tan', top: 'vest', tc: '#6a4a3a', trim: '#e8c060', bottom: 'pants', bc: '#3a2a22', acc: ['scarf'], scarfC: '#e85a2a', build: 'broad' } });
  cast('echo', { name: '수도사 에코', color: '#e8c890', voice: 0.8, desc: '메아리 암자의 수도사. 협곡이 되돌려 주는 목소리를 받아 적는다. 그 가운데 몇은 이미 죽은 사람의 목소리다.',
    look: { hair: 'short', hc: '#e8e0d0', eye: '#8a7a5a', eyeShape: 'sleepy', top: 'robe', tc: '#c8903a', trim: '#8a4a2a', bottom: 'long', bc: '#8a5a2a', acc: ['necklace'] } });
  cast('rowan', { name: '사냥꾼 로완', color: '#c8d890', voice: 0.9, desc: '단풍 협곡의 사냥꾼. 메아리 거인을 쫓은 지 삼 년. 한 번도 이겨 본 적이 없다.',
    look: { hair: 'messy', hc: '#6a4a2a', eye: '#6a8a3a', top: 'tunic', tc: '#5a6a3a', trim: '#a8784a', bottom: 'pants', bc: '#4a3a2a', cape: '#7a3a22', acc: ['quiver'] } });
  cast('fin', { name: '우편배달부 핀', color: '#8ac8ff', voice: 1.25, desc: '대륙을 한 바퀴 도는 우편배달부. 장이 바뀔 때마다 다른 마을 광장에 서 있다. 가방에는 늘 누군가의 편지가 있다.',
    look: { hair: 'neat', hc: '#e8a040', eye: '#4a7ad8', top: 'coat', tc: '#3a6ab8', trim: '#e8d8a8', bottom: 'pants', bc: '#2a3a5a', hat: 'cap', hatC: '#3a6ab8', acc: ['scarf'], scarfC: '#e8c048' } });

  /* ───────── 물건 · 부탁 · 진실 ───────── */
  const item = (id, o) => { D.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('lamp_morgan', { type: 'key', name: '모르간의 등불', desc: '가라앉은 사원 바닥에서 건진 녹슨 등불. 심지가 아직 젖어 있지 않다.' });
  item('lily', { type: 'mat', name: '안개 백합', price: 30, desc: '안개가 짙은 물가에만 피는 흰 꽃. 이렌이 찾는다.' });
  item('letter_iren', { type: 'letter', name: '이렌의 편지', desc: '에벨린 선생님께. 봉투가 몇 번이나 뜯겼다 다시 붙었다.', read: '「선생님. 16년 만에 씁니다. 세린 언니를 보낸 날, 선생님이 말리지 않은 걸 아직 용서하지 못했어요. 그런데 요즘 알 것 같아요. 말렸어도 언니는 갔을 거예요. …선생님, 잘 지내세요. 이렌.」' });
  item('letter_haru', { type: 'letter', name: '볼칸의 편지', desc: '하루에게. 기름때 묻은 손으로 꾹꾹 눌러 썼다.', read: '「하루야. 네 말이 맞았다. 탑 부품은 이제 안 두드린다. 망치 소리로 사람을 안다고 큰소리쳤는데, 내 딸 목소리는 못 들었다. 돌아오라는 말은 안 하겠다. 가끔 두드리는 소리나 들려다오. — 아빠」' });
  item('shade_core', { type: 'mat', name: '그림자 핵', price: 120, desc: '흑점의 그림자가 흩어진 자리에 남는 검은 알갱이. 벨이 모은다.' });
  D.QUESTS = D.QUESTS || {};
  const Q = (id, o) => { D.QUESTS[id] = Object.assign({ id }, o); };
  Q('morgan_lamp', { name: '가라앉은 등불', who: '늪지기 모르간', desc: '가라앉은 사원 바닥에서 모르간의 등불을 찾아온다.', after: '모르간이 16년 전 그 밤에 들은 마지막 말을 들려주었다.' });
  Q('iren_lily', { name: '안개 백합 세 송이', who: '약초사 이렌', desc: (s) => '안개 늪 물가의 안개 백합 세 송이. (' + Math.min(3, s.inv.lily || 0) + '/3)', after: '이렌이 약초학의 요령을 가르쳐 주었다.' });
  Q('iren_letter', { name: '16년 만의 편지', who: '약초사 이렌', desc: '이렌의 편지를 그린 마을 에벨린 할머니에게 전한다.', after: '에벨린이 답장을 쓰지 않았다. 대신 오래 앉아 있었다.' });
  Q('yuna_brother', { name: '안개 속 동생', who: '유나', desc: '밤에 가라앉은 탑 앞에서 진실의 거울을 비춰 본다.', after: '유나가 내일은 열두 살을 하겠다고 했다.' });
  Q('bell_hunt', { name: '그림자 사냥', who: '그림자 사냥꾼 벨', desc: (s) => '밤의 안개 늪에서 흑점의 그림자를 쓰러뜨리고 그림자 핵 넷을 모은다. (' + Math.min(4, s.inv.shade_core || 0) + '/4)', after: '벨이 비기를 넘겨주고 단풍 협곡으로 떠났다.' });
  Q('haru_letter', { name: '망치 소리', who: '대장장이 하루', desc: '레드의 볼칸 아저씨에게 하루 소식을 전하고, 답장을 받아 온다.', after: '하루가 아버지와 처음이자 마지막으로 함께 두드린 검을 건넸다.' });
  Q('echo_stones', { name: '메아리 받아 적기', who: '수도사 에코', desc: (s) => '단풍 협곡의 메아리 돌 넷에서 목소리를 듣는다. (' + ['echo:1', 'echo:2', 'echo:3', 'echo:4'].filter((k) => s.flags[k]).length + '/4)', after: '마지막 목소리는 16년 동안 협곡에서 가장 크게 울린 목소리였다.' });
  Q('rowan_giant', { name: '메아리 거인', who: '사냥꾼 로완', desc: '메아리 협곡 깊은 곳의 메아리 거인을 쓰러뜨린다.', after: '로완이 삼 년 만에 활을 내려놓고 웃었다.' });
  D.TRUTHS.t_ferry = { name: '늪지기의 기억', hint: '안개 늪 나루터의 늙은 사공이 16년 동안 품은 것.', text: '983년 봄, 배가 부른 여인과 장부를 쥔 사내가 안개 늪을 건넜다. 여인은 말했다. 「이 아이들은 셈에 넣지 말아 주세요. 에벨린 선생님께는 말하지 마세요. 그분은 울 테니까.」' };
  D.TRUTHS.t_echo = { name: '협곡의 가장 큰 목소리', hint: '단풍 협곡의 메아리 돌 넷.', text: '협곡은 탑에 빛을 빼앗긴 사람들의 마지막 말을 되돌려 준다. 16년 동안 가장 크게 울린 목소리는 한 여인의 것이었다. 「둘 다 살려 줘요. 셈에 넣지 말고.」' };

  /* ───────── 가게 ───────── */
  D.SHOPS.mist = { name: '늪 잡화점', items: ['potion_r', 'potion_b', 'potion_g', 'arrows10', 'bombs5', 'sw_thorn', 'ar_mage', 'ac_shell', 'art_frost', 'potion_forget'] };
  D.SHOPS.mist_herb = { name: '이렌의 약초방', items: ['potion_r', 'potion_b', 'potion_g', 'potion_max', 'food_udon', 'food_bread'] };
  D.SHOPS.amber = { name: '하루의 대장간', items: ['sw_iron', 'sw_great', 'sw_dagger', 'sh_iron', 'sh_spike', 'ar_chain', 'ar_scale', 'bombs5', 'art_whirl', 'art_triple'], forge: true };
  D.SHOPS.amber_market = { name: '가을 장터', items: ['potion_r', 'food_corn', 'food_tteok', 'arrows10', 'bw_bone', 'bw_wind', 'ac_str', 'ac_thief', 'art_rain'] };

  ST.closedMsg.mist = '동쪽 늪은 안개가 너무 짙어. 옐로를 지나고 나면 길이 보일 거래, 찍.';
  ST.closedMsg.amber = '남쪽 협곡 가는 목은 아직 단풍잎에 파묻혔대. 레드를 지나면 치워 준대, 찍.';

  /* ───────── 건물 ───────── */
  const cx = (t) => t.x + (t.w >> 1), cy = (t) => t.y + (t.h >> 1);
  OW.hooks.push((m) => {
    // 물안개 마을: 물 위 판자 마을
    ST.house(m, { id: 'm_inn', region: 'mist', style: 'mist', tx: MX + 2, ty: MY + 2, w: 7, h: 5, path: 4, name: '안개등 여관', sign: 'inn',
      room: { w: 16, h: 11, floor: T.PLANK, music: 'calm', rug: [6, 4, 4, 5], furn: [['counter', 3, 3, { v: 3, bw: 44, bh: 10 }], ['stove', 12, 2], ['table', 9, 7], ['chair', 8, 8], ['chair', 11, 8], ['bed2', 14, 3, { v: '#4a6a5a' }], ['bed2', 14, 7, { v: '#5a7a6a' }], ['plant', 1, 9]] } });
    ST.house(m, { id: 'm_shop', region: 'mist', style: 'mist', tx: MX + 19, ty: MY + 3, w: 6, h: 4, path: 4, name: '늪 잡화점', sign: 'shop',
      room: { w: 12, h: 9, floor: T.PLANK, music: 'calm', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2, { v: 'jars' }], ['shelf', 9, 2, { v: 'jars' }], ['barrel', 2, 6], ['crate', 9, 6]] } });
    ST.house(m, { id: 'm_herb', region: 'mist', style: 'mist', tx: MX + 2, ty: MY + 14, w: 6, h: 4, path: 3, name: '이렌의 약초방', sign: 'magic', colors: { roof: '#3e6a4a' },
      room: { w: 12, h: 9, floor: T.PLANK, music: 'calm', furn: [['counter', 4, 3, { v: 3, bw: 44, bh: 10 }], ['shelf', 1, 2, { v: 'jars' }], ['plant', 10, 2], ['plant', 10, 6], ['cauldron', 2, 6]] } });
    ST.house(m, { id: 'm_ferry', region: 'mist', style: 'mist', tx: MX + 20, ty: MY + 14, w: 5, h: 4, path: 3, name: '모르간의 오두막',
      room: { w: 11, h: 8, floor: T.PLANK, music: 'calm', furn: [['bed2', 8, 2, { v: '#5a6a5a' }], ['table', 3, 4], ['chair', 2, 5], ['barrel', 8, 5]] } });
    // 가라앉은 징수탑: 늪 호수에 반쯤 잠겼다
    G.build.placeBuilding(m, { special: 'tower', tx: 364, ty: 143, w: 3, h: 2, col: '#5a6a6e', door: false, id: 'sunk_tower' });
    // 단풍 마을: 붉은 기와 · 대장간 굴뚝
    ST.house(m, { id: 'a_forge', region: 'amber', style: 'amber', tx: AX + 2, ty: AY + 2, w: 7, h: 5, path: 4, name: '하루의 대장간', sign: 'forge',
      room: { w: 16, h: 10, floor: T.STONE, music: 'red', furn: [['anvil', 4, 4], ['stove', 2, 2], ['barrel', 13, 2], ['crate', 13, 6], ['counter', 7, 3, { v: 3, bw: 44, bh: 10 }]] } });
    ST.house(m, { id: 'a_inn', region: 'amber', style: 'amber', tx: AX + 21, ty: AY + 2, w: 7, h: 5, path: 4, name: '단풍잎 여관', sign: 'inn',
      room: { w: 16, h: 11, floor: T.WOOD, music: 'calm', rug: [6, 4, 4, 5], furn: [['counter', 3, 3, { v: 3, bw: 44, bh: 10 }], ['stove', 12, 2], ['table', 9, 7], ['chair', 8, 8], ['chair', 11, 8], ['bed2', 14, 3, { v: '#c8582a' }], ['bed2', 14, 7, { v: '#d8783a' }]] } });
    ST.house(m, { id: 'a_temple', region: 'amber', style: 'amber', tx: AX + 2, ty: AY + 14, w: 7, h: 4, path: 3, name: '메아리 암자', sign: 'church', colors: { roof: '#8a5a2a', wall: '#e8d8b8' },
      room: { w: 14, h: 11, floor: T.WOOD, music: 'dream', rug: [6, 3, 2, 7], furn: [['altar', 6, 2], ['bench', 3, 6], ['bench', 9, 6], ['plant', 1, 2], ['plant', 12, 2]] } });
    ST.house(m, { id: 'a_bar', region: 'amber', style: 'amber', tx: AX + 21, ty: AY + 14, w: 7, h: 4, path: 3, name: '낙엽 주점', sign: 'bar',
      room: { w: 16, h: 10, floor: T.WOOD, music: 'calm', furn: [['counter', 3, 3, { v: 3, bw: 60, bh: 10 }], ['barrel', 1, 2], ['barrel', 14, 2], ['table', 10, 6], ['chair', 9, 7], ['chair', 12, 7], ['table', 4, 7]] } });
    // 광장 꾸미기: 우물 · 가로등 · 벤치 · 화단 · 나무 (새 마을도 옛 마을처럼 사람 사는 티가 나게)
    const deck = (t, list) => { for (const [dx, dy, o] of list) { const x = cx(t) + dx, y = cy(t) + dy, i = m.i(x, y); if (m.solidExtra[i] || OW.roadTiles[i]) continue; m.obj[i] = o; if (o === O.LAMP) m.lights.push({ x: px(x), y: y * TS + 2, r: 50, warm: 'rgba(255,190,110,0.2)' }); } };
    deck(MT, [[-6, -4, O.LAMP], [6, -4, O.LAMP], [-6, 4, O.LAMP], [6, 4, O.LAMP], [-5, -2, O.BARREL], [5, 3, O.NET], [-3, 5, O.BENCH], [4, 5, O.BENCH], [7, -1, O.REED], [-7, 2, O.REED]]);
    deck(AT, [[-6, -3, O.LAMP], [7, -3, O.LAMP], [-6, 4, O.LAMP], [7, 4, O.LAMP], [0, -5, O.WELL], [-4, 5, O.BENCH], [5, 5, O.BENCH], [-7, 0, O.TREE], [8, 1, O.TREE], [-3, -5, O.PLANTER], [4, -5, O.PLANTER], [9, 5, O.HAY], [-9, 5, O.SCARECROW]]);
    // 가을 장터 노점
    for (const [dx, dy, col] of [[11, 7, '#c8582a'], [18, 7, '#e8a040']]) { OW.clear(m, AX + dx, AY + dy, 3, 1, 0, null); G.build.placeBuilding(m, { special: 'stall', tx: AX + dx, ty: AY + dy, w: 3, h: 1, col, door: false }); }
  });

  /* ───────── 이정표 · 표지판 · 굴뚝 연기 ───────── */
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Waystone({ x: px(cx(MT) + 3), y: py(cy(MT) + 3), wid: 'w_mist', name: '물안개 마을' }));
    Wd.add(new P.Waystone({ x: px(cx(AT) + 3), y: py(cy(AT) + 3), wid: 'w_amber', name: '단풍 마을' }));
    Wd.add(new P.Sign({ x: px(cx(MT) - 2), y: py(MT.y + MT.h + 1), text: '물안개 마을 — 안개 늪\n「물에 비친 얼굴이 늦게 따라오면, 오늘은 일찍 자라」 — 늪지기의 말' }));
    Wd.add(new P.Sign({ x: px(cx(AT) - 2), y: py(AT.y - 2), text: '단풍 마을 — 단풍 협곡\n「여기서 한 말은 협곡이 오래 기억한다. 좋은 말만 하자」' }));
    Wd.add(new P.Sign({ x: px(362), y: py(140), text: '가라앉은 징수탑\n983년 봄에 가라앉았다. 밤이면 물 아래서 탑이 운다.\n「다가가지 마시오」 — 누군가 긁어 쓴 글씨' }));
  });
  // 굴뚝 연기 · 대장간 불씨 (보이는 건물만)
  let smokeT = 0;
  ST.onTick.push(() => {
    const Wd = G.world, m = Wd.map; if (!m || !m.buildings || !Wd.view) return;
    smokeT += 1 / 60; if (smokeT < 0.18) return; smokeT = 0;
    const x0 = Wd.rcx - 32, y0 = Wd.rcy - 64, x1 = Wd.rcx + Wd.view.w + 32, y1 = Wd.rcy + Wd.view.h + 64;
    for (const b of m.buildings) {
      if (!b.chimney || !b.artW) continue;
      const sx = b.x * TS + b.artW - 18, sy = (b.y + b.h) * TS - b.artH;
      if (sx < x0 || sx > x1 || sy < y0 || sy > y1) continue;
      G.fx.part({ x: sx + (Math.random() - 0.5) * 3, y: sy + 40, z: 40, vz: 10 + Math.random() * 8, vx: 4 + Math.random() * 4, g: -2, life: 1.6, col: b.forge ? (Math.random() < 0.3 ? '#ff9a4a' : '#8a8088') : '#c8c0c8', size: 2 });
    }
  });

  /* ───────── 사람: 물안개 마을 ───────── */
  // 늪지기 모르간 — 16년 전 그 밤
  ST.person('world', { id: 'morgan', x: 368, y: MY + 20, dir: 'left', mark: (s) => !s.flags['met:morgan'] ? '!' : (s.inv.lamp_morgan && !s.flags.morgan_done ? '!' : null),
    talk: async (c, n) => {
      const s = S();
      if (!f('met:morgan')) {
        c.flag('met:morgan');
        await c.say(n, '…배 탈 거면 기다려. 안개가 걷혀야 노를 젓지. 걷히는 날은… 올해는 없었군.', { face: 'closed' });
        await c.say(n, '…너. 얼굴이 낯익다. 16년 전에 이 늪을 건넌 여자가 있었지. 배가 불러 있었어. 둘이라고 하더군.', { face: 'normal' });
        await c.say('toria', '찍…? 둘?', { face: 'shock' });
        await c.say(n, '옆의 사내는 한마디도 안 했다. 손에 장부를 쥐고, 물만 봤지. 물에 비친 제 얼굴이 늦게 따라오는 걸 보고서야 입을 열더군. 「아직 멀었군.」', { face: 'closed' });
        await c.say(n, '그날 밤 저 탑이 가라앉았다. 내 등불도 같이 빠졌어. 사원 바닥 어딘가에 있겠지. …찾아오면, 그 여자가 배에서 내리며 한 말을 들려주마.', { face: 'normal' });
        c.quest('morgan_lamp', 'on');
        return;
      }
      if (s.inv.lamp_morgan && !f('morgan_done')) {
        c.take('lamp_morgan'); c.flag('morgan_done'); c.quest('morgan_lamp', 'done');
        await c.say(n, '…이 녹. 이 휜 손잡이. 맞다. 내 거다.', { face: 'sad' });
        await c.narr('모르간이 등불을 오래 쥐고 있었다. 심지에 불을 붙이자, 안개 속에 16년 전 나루터가 잠깐 비쳤다.');
        await c.say(n, '여자가 배에서 내리며 그랬다. 「이 아이들은 셈에 넣지 말아 주세요.」', { face: 'closed' });
        await c.say(n, '그리고 하나 더. 「에벨린 선생님께는 말하지 마세요. 그분은 울 테니까.」', { face: 'sad' });
        await c.say(n, '…나는 셈이 뭔지 몰랐다. 그런데 요즘 탑이 우는 소리를 들으면, 알 것 같아.', { face: 'closed' });
        c.truth('t_ferry'); c.bond('morgan', 2);
        await c.say('toria', '…찍. 할머니는… 알고 있었을까.', { face: 'sad' });
        return;
      }
      await c.say(n, ST.lines({ c1: '안개가 짙은 날엔 물에 비친 얼굴을 보지 마라. 늦게 따라오는 게 네 얼굴이 아닐 수도 있어.', c7: '요즘 탑이 더 크게 운다. 물 아래서. 누가 또 셈에 들어갔나.', c10: '하늘로 배를 띄운다며? 나도 젊을 땐 물 위가 하늘인 줄 알았지.' }) || '…안개가 걷히면 말하마.', { face: 'closed' });
    } });
  // 소녀 유나 — 30년째 열한 살
  ST.person('world', { id: 'yuna', x: 360, y: 139, dir: 'down', look: undefined, mark: () => ((s) => (!s.flags['met:yuna'] ? '!' : s.flags.yuan_seen && !s.flags.yuna_done ? '!' : null))(S()),
    init(n) { if (f('yuna_done') && ST.chIdx() >= ST.chIdx(S().flags.yuna_grew || 'c12')) n.look = Object.assign({}, G.cast.get('yuna').look, { age: 'teen', hair: 'long' }); },
    talk: async (c, n) => {
      if (!f('met:yuna')) {
        c.flag('met:yuna');
        await c.say(n, '…언니, 우리 동생 봤어? 유안. 나랑 똑같이 생겼어. 안개 속으로 간 지… 몇 밤 됐더라.', { face: 'normal' });
        await c.say(n, '엄마는 30년 됐다고 해. 이상하지? 나는 계속 열한 살인데.', { face: 'smile' });
        await c.say('toria', '…찍. (토리아도 16년째 레벨 9야.)', { face: 'sad' });
        await c.say(n, '탑이 가라앉던 밤에 유안이 빛을 다 냈대. 세금이 모자라서. 그래서 가벼워져서… 안개가 됐대. 엄마가 그랬어.', { face: 'normal' });
        await c.say(n, '밤에 탑 앞에 가면 가끔 유안 목소리가 들려. 근데 나는 거울이 없어서 못 봐.', { face: 'sad' });
        c.quest('yuna_brother', 'on');
        return;
      }
      if (f('yuan_seen') && !f('yuna_done')) {
        await c.say(n, '…유안이 뭐래?', { face: 'shock' });
        await c.narr('유안의 말을 그대로 전했다. 「기다리지 마. 기다리는 동안 누나도 멈춰 있잖아.」');
        await c.say(n, '………', { face: 'sad' });
        await c.say(n, '…그럼 나, 내일은 열두 살 해도 돼?', { face: 'cry' });
        c.flag('yuna_done'); c.quest('yuna_brother', 'done'); c.bond('yuna', 3);
        S().flags.yuna_grew = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'][Math.min(11, ST.chIdx() + 1)];
        await c.getItem('heartpiece');
        return;
      }
      if (f('yuna_done')) { await c.say(n, ST.chIdx() >= ST.chIdx(S().flags.yuna_grew || 'c12') ? '나 이제 키가 컸어! 엄마가 옷을 새로 지어 줬어. 유안 몫까지 커야 하니까, 두 배로 먹는대.' : '오늘은 열두 살이야. 내일은 열세 살 할 거야. 천천히.', { face: 'smile' }); return; }
      await c.say(n, S().tools.mirror ? '밤에… 탑 앞에서 거울을 비춰 줘. 부탁이야.' : '거울이 있으면 좋을 텐데. 보라색 숲 학원에 진실의 거울이 있대.', { face: 'normal' });
    } });
  // 가라앉은 탑 앞: 밤에 거울을 비추면 유안
  ST.onMap('world', (m, Wd) => {
    const P = G.props;
    Wd.add(new P.Spot({ x: px(365), y: py(141), verb: '물 아래를 들여다본다', text: async (c) => {
      if (!night() || !S().tools.mirror || f('yuan_seen') || !f('met:yuna')) { await c.narr(night() ? '물 아래 가라앉은 탑이 희미하게 빛난다. 누군가 울고 있는 것 같다.' : '물 아래 가라앉은 탑의 꼭대기가 보인다. 이끼가 끼어 있다. 가만히 있으면… 탑이 숨 쉬는 소리가 들린다.'); if (night() && f('met:yuna') && !S().tools.mirror) await c.say('toria', '찍… 거울이 있으면 뭔가 보일 것 같아.', { face: 'shock' }); return; }
      c.lock(true); await c.cinema(true); c.music('dream'); c.filter('memory');
      await c.narr('진실의 거울을 비췄다. 안개가 물러나며, 물 위에 한 소년이 서 있었다. 유나와 똑같은 얼굴. 발끝이 물에 닿지 않았다.');
      const yu = c.spawn({ cid: 'yuan', x: px(366), y: py(139), dir: 'down' }); yu.vision = true;
      await c.say(yu, '…누나가 보냈어? 누나는 아직도 열한 살이지.', { face: 'sad' });
      await c.say(yu, '나, 그날 빛을 다 냈어. 탑이 모자란다고 해서. 다 내니까 가벼워졌어. 가벼워지니까… 이렇게 됐어.', { face: 'normal' });
      await c.say(yu, '누나한테 전해 줘. 기다리지 말라고. 기다리는 동안 누나도 멈춰 있잖아. 누나는 커야 해. 내 몫까지.', { face: 'smile' });
      await c.narr('소년이 안개로 풀렸다. 탑이, 처음으로, 울음을 그쳤다.');
      c.remove(yu); c.filter(''); c.flag('yuan_seen'); await c.cinema(false); c.lock(false);
    } }));
  });
  // 약초사 이렌 (가게 안)
  ST.person('m_herb', { id: 'iren', x: 6, y: 3, dir: 'down', mark: () => ((s) => (!s.flags['met:iren'] || ((s.inv.lily || 0) >= 3 && !s.flags.iren_lily_done) || (s.flags.iren_letter_answered && !s.flags.iren_after) ? '!' : null))(S()),
    talk: async (c, n) => {
      const s = S();
      if (!f('met:iren')) {
        c.flag('met:iren');
        await c.say(n, '어서 와. 약 사러 왔어? …잠깐. 그 칼 손잡이, 초록 끈으로 감았네. 그린 마을 매듭이야.', { face: 'shock' });
        await c.say(n, '에벨린 선생님은 잘 계셔? …아니, 대답하지 마. 듣고 싶지 않아.', { face: 'sad' });
        await c.say(n, '나랑 세린 언니는 선생님 밑에서 약초를 말렸어. 같은 방에서. 언니가 「그릇」으로 불려 가던 날, 선생님은 말리지 않았어. 나는 그게 용서가 안 돼서 떠났고.', { face: 'closed' });
        await c.say(n, '…됐어, 옛날 얘기는. 안개 백합 세 송이만 구해다 줄래? 늪 물가, 안개가 제일 짙은 데 피어.', { face: 'normal' });
        c.quest('iren_lily', 'on');
        return;
      }
      if ((s.inv.lily || 0) >= 3 && !f('iren_lily_done')) {
        c.take('lily', 3); c.flag('iren_lily_done'); c.quest('iren_lily', 'done');
        await c.say(n, '…고마워. 이 꽃은 언니가 제일 좋아했어. 말리면 향이 더 짙어지거든.', { face: 'smile' });
        await c.say(n, '보답으로 약초 다루는 요령을 알려 줄게. 물약은 급하게 마시지 말고, 숨을 한 번 쉬고 마셔.', { face: 'normal' });
        if (!s.skills.sv_herb) { s.skills.sv_herb = true; c.toast('재능 「약초학」을 배웠다 — 물약 · 음식 회복 +50%', 'gold'); }
        await c.say(n, '…그리고 이거. 16년 동안 못 부친 편지야. 그린에 가거든… 아니, 버려도 돼.', { face: 'sad' });
        await c.getItem('letter_iren'); c.quest('iren_letter', 'on');
        return;
      }
      if (f('iren_letter_answered') && !f('iren_after')) {
        c.flag('iren_after'); c.bond('iren', 3);
        await c.say(n, '…선생님이 아무 말도 안 하셨다고? 오래 앉아만 계셨다고?', { face: 'shock' });
        await c.say(n, '………그게 선생님 대답이야. 선생님은 우실 때 앉으셔.', { face: 'cry' });
        await c.say(n, '이 모든 게 끝나면… 그린에 한 번 가 볼게. 약초 말리는 방, 아직 있으려나.', { face: 'smile' });
        return;
      }
      const k = await c.choice(ST.lines({ c1: '약? 아니면 수다?', c9: '요즘 안개에 쓴맛이 섞였어. 약을 넉넉히 가져가.' }) || '약?', ['약을 산다', '괜찮다']);
      if (k === 0) await c.shop('mist_herb');
    } });
  // 에벨린 할머니: 1장 뒤에도 집에 있다. 장마다 다른 말, 이렌의 편지, 침대 밑 상자
  const EVE = {
    c2: '왔나. 노아는 이슬 덕에 좀 낫다. …밥은? 묵었나. 됐다.',
    c3: '바다 냄새가 나네. 등대지기 딸아이 만났나? 그 집 아버지는… 아이다. 니가 알아서 들어라.',
    c4: '옐로 금은 조심해라. 값이 붙은 건 다 누가 치른 기다.',
    c5: '퍼플 학원에 간다꼬? …세린이도 거기서 공부했다. 제일 앞자리에서 졸았제. 그래도 일등이었다.',
    c6: '천년제. 16년 전에도 갔었다. 세린이랑. 그 아이가 무대에서 노래했다. …챔피언이 그 노래를 끝까지 들었제. 처음이자 마지막으로.',
    c7: '머리가 하얘졌네. …그래. 그렇게 되는 기다. 그 아이도 그랬다. 앞머리부터.',
    c8: '침대 밑 상자? …아직 열 때가 아이다. 열면 니가 날 미워할 끼다.',
    c9: '녹턴이 뭐라 카더노. …카이론 얘기를 했나. 그래. 증인은 나였다. 참나무 아래서. 둘 다 웃고 있었다.',
    c10: '하늘로 간다꼬. …가라. 세린이가 기다린다. 16년을 기다린 사람한테 하루 더는 길다.',
    c11: '돌아오면 옥수수빵 세 개 구워 둘 끼다. 토리아 한 개, 니 두 개. …아니다. 네 개 굽자. 한 사람 더 올지 모르니까.',
  };
  ST.person('g_home', { id: 'evelyn', x: 9, y: 4, dir: 'left', when: () => f('c1_night'),
    mark: () => (S().inv.letter_iren && !f('iren_letter_answered') ? '!' : null),
    talk: async (c, n) => {
      if (S().inv.letter_iren && !f('iren_letter_answered')) {
        c.take('letter_iren'); c.flag('iren_letter_answered'); c.quest('iren_letter', 'done');
        await c.say(n, '…이렌이가? 이 글씨. 획을 끝까지 안 긋는 거, 그대로네.', { face: 'shock' });
        await c.narr('에벨린 할머니가 편지를 두 번 읽었다. 그리고 의자에 앉았다. 한참 동안 아무 말도 하지 않았다.');
        await c.say(n, '…밥은 묵고 다니나 카더나. 안 물어봤제. 그 가시나는 늘 그기 궁금하지도 않았다.', { face: 'closed' });
        await c.say('toria', '…찍. 할머니, 우는 거예요?', { face: 'sad' });
        await c.say(n, '안 운다. 앉아 있는 기다.', { face: 'sad' });
        return;
      }
      if (f('box_seen') && !f('box_talk')) {
        c.flag('box_talk');
        await c.say(n, '…봤나.', { face: 'closed' });
        await c.say(n, '16년 동안 징수 장부를 베껴 뒀다. 세린이 이름이 들어간 칸마다. 언젠가 누가 그 셈을 따지러 오면, 보여 줄라꼬.', { face: 'sad' });
        await c.say(n, '맨 끝 칸 이름은… 내가 쓴 기 아이다. 장부가 그렇게 와 있었다. 니 이름이다. 다음 그릇.', { face: 'cry' });
        await c.say(n, '말리지 않았다고 이렌이가 날 미워했제. 이번엔 말릴 끼다. 누가 뭐라 캐도.', { face: 'angry' });
        return;
      }
      await c.say(n, ST.lines(EVE) || '왔나.', { face: 'normal' });
    } });
  // 침대 밑 상자 (8장부터)
  ST.onMap('g_home', (m, Wd) => {
    Wd.add(new G.props.Spot({ x: px(12), y: py(3), verb: '침대 밑 상자를 연다', when: () => ST.after('c8'), text: async (c) => {
      if (f('box_seen')) { await c.narr('베낀 장부 스무 권. 맨 끝 장, 새 칸의 이름.'); return; }
      c.flag('box_seen'); c.music('dread');
      await c.narr('상자 안에는 손으로 베낀 징수 장부가 스무 권 들어 있었다. 983년부터 한 해도 빠짐없이.');
      await c.narr('모든 장, 「허용 손실」 칸마다 같은 이름이 적혀 있었다. [w]세린[/].');
      await c.narr('그리고 맨 끝 장. 올봄 날짜. 새 칸에, 잉크가 아직 선명한 이름.');
      await c.narr('[r]' + (S().name || '아린') + '[/] — 「다음 그릇. 셈에 넣을 것.」');
      await c.say('toria', '…………찍.', { face: 'shock' });
    } }));
  });
  // 그림자 사냥꾼 벨 — 그라우스를 떠난 기사
  ST.person('world', { id: 'bell', x: MX + 16, y: MY - 3, dir: 'down', when: (s) => !s.flags.bell_done,
    mark: () => ((s) => (!s.flags['met:bell'] ? '!' : (s.inv.shade_core || 0) >= 4 ? '!' : null))(S()),
    talk: async (c, n) => {
      const s = S();
      if (!f('met:bell')) {
        c.flag('met:bell');
        await c.say(n, '…그 얼굴. 그린 마을. 탑 아래 모여 있던 아이들 중 하나지.', { face: 'normal' });
        await c.say(n, '징수 기사단 제3대, 벨. 그라우스 부단장 밑에 있었다. 그날 「특별 징수」 장부를 넘긴 게 나다.', { face: 'closed' });
        await c.say(n, '아이 하나가 졸다가 쓰러지더군. 아프지 않다고 했지. 조금 졸릴 뿐이라고. …그날 밤 칼을 버렸다.', { face: 'sad' });
        if (ST.route() === 'order') await c.say(n, '너는 기사단 편이라지. 상관없다. 나도 한때는 지키는 게 옳다고 믿었으니까.', { face: 'normal' });
        await c.say(n, '지금은 흑점의 그림자를 사냥한다. 밤의 안개 늪에 나오지. 쓰러뜨리면 검은 핵이 남는다. 넷만 모아다 다오.', { face: 'normal' });
        c.quest('bell_hunt', 'on');
        return;
      }
      if ((s.inv.shade_core || 0) >= 4) {
        c.take('shade_core', 4); c.quest('bell_hunt', 'done'); c.flag('bell_done'); c.bond('bell', 2);
        await c.say(n, '…넷. 제대로 싸우는군. 그림자는 겁먹은 자를 먼저 삼킨다.', { face: 'smile' });
        await c.say(n, '이걸 가져가라. 기사단에서 배운 것 중에 유일하게 남길 만한 기술이다.', { face: 'normal' });
        await c.getItem('art_shadow');
        await c.say(n, '나는 남쪽 단풍 협곡으로 간다. 로완이라는 사냥꾼이 메아리 거인을 쫓는다더군. 혼자 쫓는 건 미련한 짓이지. …나처럼.', { face: 'closed' });
        return;
      }
      await c.say(n, night() ? '지금이다. 늪 쪽으로. 발밑을 조심해라 — 그림자는 물에서 올라온다.' : '그림자는 밤에만 나온다. 해가 지면 늪으로 가라.', { face: 'normal' });
    } });
  // 밤의 안개 늪: 그림자가 올라온다 (벨의 부탁 중)
  let shadeT = 0;
  ST.onTick.push(() => {
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p || G.script.running) return;
    if (!f('met:bell') || f('bell_done') || !night()) return;
    if (OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) !== 'mist') return;
    shadeT -= 1 / 60; if (shadeT > 0) return; shadeT = 9;
    const live = Wd.ents.filter((e) => e.foe && !e.dead && e.type === 'shade' && e.bellShade).length;
    if (live >= 2) return;
    const a = Math.random() * Math.PI * 2, x = p.x + Math.cos(a) * 90, y = p.y + Math.sin(a) * 70;
    if (!m.boxFree(x - 5, y - 6, 10, 6, p.z, null)) return;
    const e = G.foes.spawn('shade', x, y, { tier: 6 }); e.bellShade = true; e.aggro = true; G.fx.glow(x, y - 8, '#3a1a5a', 14);
    e.onDie = () => { if (Math.random() < 0.85) G.combat.spawnPickup(e.x, e.y, 'item', 1, 'shade_core'); };
  });
  // 안개 백합: 늪 물가 다섯 곳
  for (const [x, y] of [[334, 70], [348, 132], [378, 124], [356, 170], [384, 88]]) ST.onMap('world', (m, Wd) => {
    const k = 'lily:' + x + ',' + y; if (f(k)) return;
    Wd.add(new G.props.Spot({ sparkle: true, x: px(x), y: py(y), verb: '흰 꽃을 딴다', text: async (c) => { c.flag(k); await c.getItem('lily'); } }));
  });
  // 여관 주인들 · 가게 주인
  ST.person('m_inn', { x: 4, y: 3, dir: 'down', look: G.cast.folk('sailor', { hc: '#4a5a4a' }), name: '여관 주인 네라', talk: async (c, n) => { const k = await c.choice('안개등 여관이야. 쉬어 가. 안개 속에서는 잠이 잘 와. …너무 잘 와서 문제지.', ['쉰다 (기록)', '괜찮다']); if (k === 0) await c.rest(); } });
  ST.person('m_shop', { x: 5, y: 3, dir: 'down', look: G.cast.folk('merchant', { tc: '#4a6a5a' }), name: '잡화상 오르', talk: async (c) => { await c.shop('mist'); } });
  ST.person('a_inn', { x: 4, y: 3, dir: 'down', look: G.cast.folk('merchantw', { tc: '#c8582a' }), name: '여관 주인 가을', talk: async (c) => { const k = await c.choice('단풍잎 여관이에요. 창밖 단풍은 1년 내내 떨어져요. 멈춘 적이 없어요.', ['쉰다 (기록)', '괜찮다']); if (k === 0) await c.rest(); } });

  /* ───────── 사람: 단풍 마을 ───────── */
  // 대장장이 하루 — 볼칸의 딸
  ST.person('a_forge', { id: 'haru', x: 8, y: 3, dir: 'down', mark: () => ((s) => (!s.flags['met:haru'] || (s.inv.letter_haru && !s.flags.haru_done) ? '!' : null))(S()),
    talk: async (c, n) => {
      const s = S();
      if (!f('met:haru')) {
        c.flag('met:haru');
        await c.say(n, '어서 와! 뭐 두드려 줄까? …어, 그 검. 날 끝의 두드림 자국. 이거 레드 불꽃 대장간 거잖아.', { face: 'shock' });
        await c.say(n, '볼칸? …우리 아빠 이름을 여기서 들을 줄이야. 아빠가 탑 부품을 두드리라고 했어. 난 싫다고 했고. 그래서 여기 있어. 3년째.', { face: 'closed' });
        await c.say(n, '아빠는 망치 소리로 사람을 안다고 큰소리쳐. 근데 내 목소리는 한 번도 안 들었어.', { face: 'sad' });
        if (f('met:volkan')) { await c.say(n, '…혹시 레드에 가거든. 아니, 아무 말도 하지 마. 그냥… 하루가 잘 두드린다고만.', { face: 'normal' }); c.quest('haru_letter', 'on'); }
        return;
      }
      if (s.inv.letter_haru && !f('haru_done')) {
        c.take('letter_haru'); c.flag('haru_done'); c.quest('haru_letter', 'done'); c.bond('haru', 3);
        await c.narr('하루가 편지를 읽었다. 망치를 내려놓았다. 대장간 불이 조금 작아졌다.');
        await c.say(n, '…「내 딸 목소리는 못 들었다」래. 바보 아빠.', { face: 'cry' });
        await c.say(n, '이거 가져가. 3년 전에 아빠랑 같이 두드리다 만 검이야. 불도롱뇽 비늘을 녹여 넣었어. 오늘 마저 두드렸어.', { face: 'smile' });
        await c.getItem('sw_ember');
        await c.say(n, '…다음 달엔 레드에 한 번 가 볼까. 가서 두드리는 소리나 들려 주지 뭐.', { face: 'smile' });
        return;
      }
      const k = await c.choice(ST.lines({ c1: '뭐 두드려 줄까?', c9: '요즘 협곡 메아리가 이상해. 쇠 소리가 두 번씩 울려. 뭐 두드려 줄까?' }) || '뭐 두드려 줄까?', ['산다 · 강화', '괜찮다']);
      if (k === 0) await c.shop('amber');
    } });
  // 볼칸이 하루 소식을 듣는다
  ST.hookTalk && ST.hookTalk('r_forge', 'volkan', () => f('met:haru') && !f('volkan_heard') , async (c, n) => {
    c.flag('volkan_heard');
    await c.say(n, '…하루? 단풍 협곡에? 3년 동안 편지 한 장 없던 것이.', { face: 'shock' });
    await c.say(n, '………잘 두드린다고? 흥. 당연하지. 내 딸이다.', { face: 'smile' });
    await c.narr('볼칸 아저씨가 망치를 놓고 종이를 꺼냈다. 기름때 묻은 손으로 한 글자씩 꾹꾹 눌러 썼다.');
    await c.getItem('letter_haru');
    await c.say(n, '전해 다오. …아니, 읽지는 마라. 부끄럽다.', { face: 'closed' });
  });
  // 수도사 에코 — 메아리를 받아 적는 사람
  ST.person('a_temple', { id: 'echo', x: 7, y: 4, dir: 'down', mark: () => ((s) => (!s.flags['met:echo'] ? '!' : ['echo:1', 'echo:2', 'echo:3', 'echo:4'].every((k) => s.flags[k]) && !s.flags.echo_done ? '!' : null))(S()),
    talk: async (c, n) => {
      if (!f('met:echo')) {
        c.flag('met:echo');
        await c.say(n, '쉿. …들리오? 방금 협곡이 「고마워」라고 했소. 3년 전 어떤 나그네가 한 말이오.', { face: 'closed' });
        await c.say(n, '이 협곡은 말을 오래 기억하오. 좋은 말도, 나쁜 말도. 그리고… 마지막 말도.', { face: 'normal' });
        await c.say(n, '저녁마다 한 아이 목소리가 울리오. 「세금 다 냈어요. 이제 집에 가도 돼요?」 …30년째 매일.', { face: 'sad' });
        await c.say('toria', '………찍.', { face: 'shock' });
        await c.say(n, '협곡에 메아리 돌 넷이 있소. 그 앞에 서면 목소리가 들리오. 받아 적어 주시오. 누군가는 기억해야 하니.', { face: 'normal' });
        c.quest('echo_stones', 'on');
        return;
      }
      if (['echo:1', 'echo:2', 'echo:3', 'echo:4'].every((k) => f(k)) && !f('echo_done')) {
        c.flag('echo_done'); c.quest('echo_stones', 'done'); c.truth('t_echo');
        await c.say(n, '…마지막 목소리를 들었소? 「둘 다 살려 줘요. 셈에 넣지 말고.」', { face: 'sad' });
        await c.say(n, '그 목소리는 16년 동안 협곡에서 가장 크게 울렸소. 어떤 날은 너무 커서 단풍이 한꺼번에 떨어졌지.', { face: 'closed' });
        await c.say(n, '이 협곡의 단풍이 1년 내내 지는 까닭을 아시오? 그 목소리가 멈추지 않아서요.', { face: 'normal' });
        const s = S(); s.pts = (s.pts || 0) + 3; c.toast('깨달음 — 성장 점수 +3', 'gold');
        return;
      }
      await c.say(n, '받아 적은 목소리가 ' + ['echo:1', 'echo:2', 'echo:3', 'echo:4'].filter((k) => f(k)).length + '개. 서두를 것 없소. 목소리들은 기다리는 데 익숙하니.', { face: 'closed' });
    } });
  const ECHO = [
    [98, 268, '작은 아이의 목소리가 협곡 벽에 부딪혀 돌아왔다.\n「세금 다 냈어요. 이제 집에 가도 돼요?」'],
    [176, 286, '지친 여인의 목소리.\n「레벨 하나만. 딱 하나만 남겨 주세요. 아이 생일이에요.」'],
    [214, 262, '갑옷이 부딪히는 소리 사이로, 젊은 기사의 목소리.\n「장부에 내 이름은 쓰지 마. 아무도 모르게 사라지고 싶어.」'],
    [240, 280, '…그리고 아주 큰 목소리. 협곡 전체가 떨렸다. 단풍이 한꺼번에 떨어졌다.\n「둘 다 살려 줘요. 셈에 넣지 말고.」'],
  ];
  ECHO.forEach(([x, y, text], i) => ST.onMap('world', (m, Wd) => {
    Wd.add(new G.props.Spot({ sparkle: true, x: px(x), y: py(y), verb: '메아리 돌에 귀를 댄다', text: async (c) => {
      c.flag('echo:' + (i + 1)); c.shake(1, 0.4); c.sfx('crystal');
      await c.narr(text);
      if (i === 3) await c.say('toria', '…이 목소리. 찍. 이거… 수정 속에서 들었던…', { face: 'shock' });
    } }));
    m.obj[m.i(x, y - 1)] = O.ROCK;
  }));
  // 사냥꾼 로완 — 메아리 거인을 쫓는 사람 (주점)
  ST.person('a_bar', { id: 'rowan', x: 10, y: 5, dir: 'left', mark: () => ((s) => (!s.flags['met:rowan'] || (s.flags['d12:boss'] && !s.flags.rowan_done) ? '!' : null))(S()),
    talk: async (c, n) => {
      if (!f('met:rowan')) {
        c.flag('met:rowan');
        await c.say(n, '…메아리 거인? 들어 봤겠지. 협곡 동쪽 굴 깊은 데 사는 놈. 삼 년째 쫓고 있어.', { face: 'closed' });
        await c.say(n, '한 번도 못 이겼어. 활을 쏘면 그놈이 내 목소리로 비명을 질러. 그럼 손이 굳어.', { face: 'sad' });
        await c.say(n, '너라면 어떨까. 목소리가 두 개니까. (다람쥐를 가리킨다)', { face: 'smirk' });
        c.quest('rowan_giant', 'on');
        return;
      }
      if (f('d12:boss') && !f('rowan_done')) {
        c.flag('rowan_done'); c.quest('rowan_giant', 'done'); c.bond('rowan', 2);
        await c.say(n, '…해냈어? 정말로? 그놈이 마지막에 무슨 소리를 냈어?', { face: 'shock' });
        await c.say(n, '……그렇군. 조용해졌구나. 삼 년 만에 처음으로 협곡이 조용해.', { face: 'smile' });
        await c.getItem('art_rain');
        if (f('bell_done')) await c.say(n, '벨이라는 여자가 왔었어. 같이 사냥하재. …혼자 쫓는 건 미련한 짓이라나. 하하. 맞는 말이지.', { face: 'smile' });
        return;
      }
      await c.say(n, f('bell_done') ? '벨이랑 같이 굴 입구까지는 가 봤어. 그놈 목소리가… 이번엔 벨 목소리였어. 얼른 끝내 줘.' : '메아리 협곡은 마을 동쪽이야. 절벽 굴로 들어가면 돼.', { face: 'normal' });
    } });
  ST.person('a_bar', { id: 'bell', x: 12, y: 5, dir: 'right', when: (s) => !!s.flags.bell_done, talk: async (c, n) => {
    await c.say(n, f('rowan_done') ? '로완은 요즘 웃는다. 그게 사냥보다 어렵다. …너도 가끔 웃어라, 흰빛.' : '로완의 활은 좋다. 손이 굳는 게 문제지. 그 거인을 끝내 준다면 둘 다 편히 잘 텐데.', { face: 'smile' });
  } });
  // 장터 상인
  ST.person('world', { x: AX + 12, y: AY + 9, dir: 'down', look: G.cast.folk('merchant', { tc: '#c8582a' }), name: '장터 상인 도토리', talk: async (c) => { await c.shop('amber_market'); } });

  /* ───────── 우편배달부 핀: 장마다 다른 마을 광장, 만난 사람들의 편지 ───────── */
  const FIN_AT = { c1: 'green', c2: 'red', c3: 'blue', c4: 'yellow', c5: 'purple', c6: 'rainbow', c7: 'white', c8: 'gray', c9: 'black', c10: 'colorful', c11: 'colorful', c12: 'amber' };
  const LETTERS = [
    { id: 'l_noah1', from: '노아', when: (s) => ST.after('c2') && s.flags['met:noah'], text: '「형/누나! 오늘 머리카락 끝이 한 올 까매졌어! …아니다, 착각이야. 그래도 좋았어. 좋았던 게 착각이어도 좋아.」' },
    { id: 'l_evelyn1', from: '에벨린', when: () => ST.after('c3'), text: '「밥은 묵고 다니나. 토리아 한 개만 무라 캐라. 장롱은 이제 안 잠근다. …니가 없으니 잠글 게 없다.」' },
    { id: 'l_haru', from: '하루', when: (s) => s.flags.haru_done, text: '「레드에 다녀왔어. 아빠가 망치를 두 번 떨어뜨렸어. 울어서 그런 거 아니래. 그렇대.」' },
    { id: 'l_iren', from: '이렌', when: (s) => s.flags.iren_after, text: '「그린 가는 길에 약초 말리는 방 창문을 봤어. 선생님이 창가에 백합을 꽂아 두셨더라. 말린 거. 언니가 좋아하던 거.」' },
    { id: 'l_cassian', from: '카시안', when: (s) => ST.after('c7') && s.flags['met:cassian'] && ST.route() === 'order', text: '「감찰 보고서 7장. 「흰빛: 위험 요소」로 고쳐 쓰라는 명령을 받았다. 쓰지 않았다. 명령 불복종은 처음이다. 손이 떨린다. 이상하게, 기분은 나쁘지 않다.」' },
    { id: 'l_lea', from: '레아', when: (s) => ST.after('c6') && s.flags['met:lea'] && ST.route() === 'dawn', text: '「신호를 기다린다. 새벽단 모두. …라고 쓰라고 해서 썼어. 진짜 하고 싶은 말은: 밥 잘 먹어. 루드 형이 네 몫까지 먹어.」' },
    { id: 'l_midnight', from: '미드나잇', when: (s) => ST.after('c6') && s.flags['met:midnight'] && ST.route() === 'night', text: '「고양이는 편지를 쓰지 않는다. 그러니 이건 편지가 아니다. 그냥 발자국이 종이 위를 좀 오래 걸었을 뿐. — 발자국 넷」' },
    { id: 'l_yuna', from: '유나', when: (s) => s.flags.yuna_done, text: '「나 오늘 열두 살 됐어! 엄마가 케이크 대신 백합을 줬어. 유안 몫까지 두 송이. 한 송이는 늪에 띄웠어.」' },
    { id: 'l_bell', from: '벨', when: (s) => s.flags.bell_done && ST.after('c9'), text: '「그라우스 부단장이 무너졌다는 소식을 들었다. 기쁘지 않았다. 그 사람도 장부를 믿었을 뿐이다. 믿음이 가장 무서운 칼이다. — 벨」' },
    { id: 'l_noah2', from: '노아', when: (s) => ST.after('c8') && s.flags.noah_herb, text: '「형/누나, 이번엔 진짜야. 두 올. 엄마가 울었어. 나도 울었어. 기뻐서 우는 건 처음이야.」' },
    { id: 'l_morgan', from: '모르간', when: (s) => s.flags.morgan_done && ST.after('c10'), text: '「안개가 걷혔다. 16년 만이다. 물에 비친 얼굴이 제때 따라온다. …고맙다는 말은 서툴다. 노를 한 번 더 저었다고만 해 두마.」' },
  ];
  ST.LETTERS = LETTERS;   // 뒤 파일에서 편지를 더 넣는다
  ST.person('world', { id: 'fin', at: (s) => { const t = OW.towns[FIN_AT[s.ch || 'c1']] || OW.towns.green; return [t.plaza ? t.plaza.x - 5 : t.x + 4, t.plaza ? t.plaza.y + 2 : t.y + 4]; }, dir: 'down',
    mark: () => ((s) => (LETTERS.some((L) => !s.flags[L.id] && L.when(s)) ? '!' : null))(S()),
    talk: async (c, n) => {
      const s = S();
      c.flag('met:fin');
      const L = LETTERS.find((x) => !s.flags[x.id] && x.when(s));
      if (!L) { await c.say(n, ST.lines({ c1: '우편이요! …아니, 아직 당신 앞으로 온 건 없네요. 대륙을 한 바퀴 돌면 누군가는 쓰겠죠.', c6: '편지는 느려요. 그래서 좋아요. 쓴 사람의 마음이 도착할 즈음엔 조금 익어 있거든요.', c10: '하늘로 가신다면서요? 거기도 우편이 가나? 제가 한번 가 볼게요.' }) || '우편이요!', { face: 'smile' }); return; }
      c.flag(L.id);
      await c.say(n, '우편이요! ' + L.from + ' 씨가 보냈어요. 봉투가 좀 구겨졌어요. 오는 동안 여러 번 꺼내 봤나 봐요.', { face: 'smile' });
      await c.narr(L.text.replace(/형\/누나/g, S().gender === 'girl' ? '누나' : '형'));
      c.journal(L.from + '의 편지를 받았다.');
    } });
})();
