/* 던전마다 다른 꼴: 방 이름 · 방 안의 퍼즐과 적은 이야기 파일 그대로 두고, 자리 · 모양 · 층 · 바닥 · 벽 · 장식 · 공기를 바꾼다.
   d1 뿌리굴      — 자연 동굴: 굽은 흙벽 · 뿌리 바닥 · 버섯 불빛 · 하나로 트인 큰 굴
   d2 황금 광산   — 층층이 내려가는 갱도: 입구 → 지하 1층 → 2층 → 3층 황금 광맥 (사다리 계단)
   d3 해저 동굴   — 물에 잠긴 굴: 젖은 돌 · 산호 불빛 · 거품 · 물이 찬 큰 굴
   d4 태양 피라미드 — 위로 오르는 피라미드: 넓은 1층 → 2층 → 꼭대기 (기둥 늘어선 방)
   d5 거꾸로 선 탑 — 아래로 내려가는 둥근 탑: 층마다 둥근 방, 거울 바닥
   d6 구름 신전   — 벽 없는 하늘섬: 가장자리 밖은 허공, 좁은 구름다리
   d7 서리 무덤   — 긴 지하 묘당: 세 방이 이어진 긴 회랑 · 푸른 불꽃 · 묘비
   d8 은빛 광맥   — 칠흑 같은 광맥: 은빛 결의 벽 · 스스로 빛나는 수정
   d9 녹턴의 성   — 성: 붉은 융단이 깔린 큰 회랑 · 기둥 · 깃발 · 촛불
   d11 정거장 심층 — 둥근 금속 방 · 푸른 등 · 불꽃 튀는 공기 */
(function () {
  'use strict';
  const G = globalThis.G;
  const TL = G.tiles, O = G.objs.O;
  const T = TL.T;
  const DUN = G.dungeon.DUN;
  const set = (id, o) => { const D = DUN[id]; if (!D) return; Object.assign(D, o); };
  const shape = (id, map) => { const D = DUN[id]; if (!D) return; for (const [k, sh] of Object.entries(map)) if (D.rooms[k]) D.rooms[k].shape = sh; };

  // d1 뿌리굴 — 자연 동굴
  set('d1', { floor: T.ROOTS, wall: 'root', shape: 'cave', merge: [['0,1', '1,1']], decor: [O.PEBBLE, O.TALL, O.ROCK, O.STUMP, O.SHROOM, O.TALL], decorRate: 0.12, ambient: 'spores', glowObjs: [O.SHROOM], glowCol: 'rgba(160,255,140,0.2)' });
  shape('d1', { '2,2': 'rect', '1,0': 'round' });

  // d2 황금 광산 — 층층이 내려가는 갱도
  set('d2', {
    floor: T.ORE, wall: 'mine', shape: 'cave', ambient: 'dust', sconce: 'rgba(255,190,110,0.22)', decor: [O.CRATE, O.BARREL, O.ROCK, O.PEBBLE, O.RUBBLE], decorRate: 0.1,
    pos: { '1,3': [1, 0], '0,2': [0, 2], '1,2': [1, 2], '2,2': [2, 2], '0,1': [0, 4], '1,1': [1, 4], '2,1': [2, 4], '2,0': [2, 6], '3,0': [3, 6] },
    floors: { '1,3': '갱도 입구', '0,2': '지하 1층', '1,2': '지하 1층', '2,2': '지하 1층', '0,1': '지하 2층', '1,1': '지하 2층', '2,1': '지하 2층', '2,0': '지하 3층 — 황금 광맥', '3,0': '지하 3층 — 황금 광맥' },
  });
  shape('d2', { '2,1': 'rect', '2,0': 'round' });

  // d3 해저 동굴 — 물에 잠긴 굴
  set('d3', {
    floor: T.WETSTONE, wall: 'rock', shape: 'cave', ambient: 'bubbles', decor: [O.CORAL, O.REED, O.PEBBLE, O.ROCK, O.CORAL], decorRate: 0.11, merge: [['0,2', '0,1']],
    glowObjs: [O.CORAL], glowCol: 'rgba(120,200,255,0.18)',
  });
  shape('d3', { '1,0': 'round' });

  // d4 태양 피라미드 — 위로 오른다
  set('d4', {
    floor: T.HIERO, wall: 'sand', ambient: 'dust', sconce: 'rgba(255,200,120,0.22)', decor: [O.POTS, O.BONES, O.RUBBLE, O.POTS], decorRate: 0.08,
    pos: { '1,3': [1, 5], '0,2': [0, 4], '1,2': [1, 4], '2,2': [2, 4], '0,1': [0, 2], '1,1': [1, 2], '2,1': [2, 2], '1,0': [1, 0] },
    floors: { '1,3': '피라미드 입구', '0,2': '1층', '1,2': '1층', '2,2': '1층', '0,1': '2층', '1,1': '2층', '2,1': '2층', '1,0': '꼭대기 — 태양의 방' },
  });
  shape('d4', { '0,2': 'hall', '2,2': 'hall', '2,1': 'hall', '0,1': 'hall', '1,3': 'hall' });

  // d5 거꾸로 선 탑 — 아래로 내려가는 둥근 층
  set('d5', {
    floor: T.MIRROR, wall: 'mirror', shape: 'round', ambient: 'motes', sconce: 'rgba(200,160,255,0.22)', decor: [O.CRYSTAL], decorRate: 0.05,
    pos: { '1,3': [1, 0], '0,2': [0, 2], '1,2': [1, 2], '2,2': [2, 2], '0,1': [0, 1], '1,1': [1, 4], '2,1': [2, 4], '1,0': [1, 6] },
    floors: { '1,3': '거꾸로 1층', '0,2': '거꾸로 2층', '1,2': '거꾸로 2층', '2,2': '거꾸로 2층', '0,1': '거울 뒤', '1,1': '거꾸로 3층', '2,1': '거꾸로 3층', '1,0': '탑의 뿌리' },
  });

  // d6 구름 신전 — 벽 없는 하늘섬
  set('d6', { floor: T.SKYTILE, wall: 'marble', shape: 'open', ambient: 'mist' });

  // d7 서리 무덤 — 긴 묘당 회랑
  set('d7', { floor: T.ICEBRICK, wall: 'ice', ambient: 'mist', sconce: 'rgba(140,210,255,0.22)', decor: [O.GRAVE, O.ICESPIKE, O.BONES, O.GRAVE], decorRate: 0.1, merge: [['1,3', '1,2'], ['1,2', '1,1'], ['2,2', '2,1']] });
  shape('d7', { '1,3': 'hall', '1,2': 'hall', '1,1': 'hall', '1,0': 'round' });

  // d8 은빛 광맥 — 칠흑 속 수정 불빛
  set('d8', {
    floor: T.CAVE, wall: 'vein', shape: 'cave', ambient: 'sparks', decor: [O.CRYSTAL, O.RUBBLE, O.ROCK, O.CRYSTAL], decorRate: 0.09, glowObjs: [O.CRYSTAL], glowCol: 'rgba(200,220,255,0.3)',
  });
  shape('d8', { '1,2': 'rect', '1,0': 'round' });

  // d9 녹턴의 성 — 붉은 융단의 회랑
  set('d9', { floor: T.CHECKER, wall: 'castle', ambient: 'motes', sconce: 'rgba(255,210,140,0.24)', decor: [O.BANNER, O.PILLAR, O.BANNER], decorRate: 0.05, merge: [['1,3', '1,2']] });
  shape('d9', { '1,3': 'hall', '1,2': 'hall', '0,2': 'hall', '2,2': 'hall' });
  for (const k of ['1,3', '1,2', '1,1', '1,0']) if (DUN.d9 && DUN.d9.rooms[k]) DUN.d9.rooms[k].runner = true;

  // d11 정거장 심층 — 둥근 금속 방
  set('d11', { floor: T.PANEL, wall: 'tech', shape: 'round', ambient: 'sparks', sconce: 'rgba(120,220,255,0.22)' });
  shape('d11', { '1,0': 'rect' });

  // 스스로 빛나는 사물 (버섯 · 산호 · 수정): 지도에 들어설 때 불빛을 단다
  const glowAdd = (m) => {
    const D = m.dungeon && DUN[m.dungeon]; if (!D || !D.glowObjs || m.glowDone) return;
    m.glowDone = true;
    for (let i = 0; i < m.w * m.h; i++) if (D.glowObjs.includes(m.obj[i])) m.lights.push({ x: (i % m.w) * 16 + 8, y: ((i / m.w) | 0) * 16 + 4, r: 44, warm: D.glowCol || 'rgba(200,220,255,0.2)' });
  };
  G.story.enterHooks.push(glowAdd);
})();
