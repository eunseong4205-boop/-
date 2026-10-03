/* 쉴 곳 — 사람이 없어 쉬지도 말을 걸지도 못하던 곳
   · 블루 요양원: 노아가 머무는 4~6장 말고는 텅 비어 있었다 → 늘 있는 돌보미 하넬 (그냥 쉬어 가게 해 준다)
   · 성녀의 병동: 여관 간판인데 환자뿐, 쉬게 해 줄 사람이 없었다 → 간호사 시나
   · 하늘 정거장: 열린 수면 캡슐에서 쉰다
   · 아스트라: 내려온 빛의 사다리로 다시 올라갈 수 없었고 쉴 곳도 없었다 → 착지점의 사다리로 정거장에 돌아가고, 카이론의 정원 풀밭에서 쉰다
   (가게 · 여관 주인이 그 지역의 장보다 먼저 문이 열리면 말이 없던 것은 52_talk의 keeperDefault) */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, TS = G.tiles.TS, U = G.u;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;

  /* ── 블루 요양원의 돌보미 ── */
  ST.person('b_hosp', { name: '요양원 돌보미 하넬', look: G.cast.folk('nun', { hc: '#4a6a8a', tc: '#dfe8f4' }), x: 12, y: 8, dir: 'up', talk: async (c, n) => {
    const k = await c.choice(U.pick(['바다 바람은 약이 돼요. 빈 침대가 있어요, 쉬었다 가요.', '여기선 다들 천천히 나아요. 당신도 좀 천천히 가요.', '파도 소리 들으면서 한숨 자요. 돈은 안 받아요.']), ['쉰다 (기록)', '요양원 이야기', '괜찮아요'], { name: n.name });
    if (k === 0) await c.rest();
    else if (k === 1) await c.say(n, ST.lines({ c2: '빛바램이 온 사람들이 바다 냄새를 맡으러 와요. 손끝이 비치는 사람, 머리칼이 하얘진 사람.', c4: '그린에서 온 노아라는 아이가 있어요. 그림을 잘 그려요. 손끝이 조금 비치지만 웃음이 많아요.', c7: '노아는 설원의 병동으로 갔어요. 성녀님 곁이 낫대요. 침대가 하나 비어서… 조금 쓸쓸해요.', c10: '요즘은 빛바램이 덜해요. 하늘이 조금 가벼워졌나 봐요.' }));
  } });

  /* ── 성녀의 병동 간호사 ── */
  ST.person('w_ward', { name: '병동 간호사 시나', look: G.cast.folk('nun', { hc: '#c8b090', tc: '#f4f8ff' }), x: 12, y: 7, dir: 'down', talk: async (c, n) => {
    const k = await c.choice(U.pick(['난로 곁 침대가 비었어요. 눈 녹을 때까지 쉬어요.', '성녀님 손님이면 우리 손님이에요. 쉬었다 가요.', '추운 데서 왔죠? 손이 얼었네. 누워요.']), ['쉰다 (기록)', '괜찮아요'], { name: n.name });
    if (k === 0) await c.rest();
  } });

  /* ── 하늘 정거장: 열린 수면 캡슐 ── */
  ST.onMap('station', (m, Wd) => {
    Wd.add(new G.props.Spot({ x: px(9), y: py(5) + 2, verb: '수면 캡슐에서 쉰다', text: async (c) => {
      await c.narr('열린 캡슐 하나. 안쪽이 따뜻하다. 388년 동안 아무도 눕지 않은 자리.');
      await c.rest();
    } }));
  });

  /* ── 아스트라: 정원에서 쉬고, 사다리로 정거장에 돌아간다 ── */
  // 내려온 자리에 남은 빛의 사다리: 위로 올라가며 옅어지는 금빛 기둥과 가로대
  class Ladder extends G.props.Spot {
    draw(g, cx, cy) {
      const t = G.world.t, x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      for (let k = 0; k < 9; k++) {
        const yy = y - 4 - k * 9, a = Math.max(0, 0.55 - k * 0.06) * (0.8 + 0.2 * Math.sin(t * 3 + k));
        g.fillStyle = 'rgba(255,236,160,' + a.toFixed(3) + ')';
        g.fillRect(x - 6, yy - 9, 1, 9); g.fillRect(x + 5, yy - 9, 1, 9); g.fillRect(x - 5, yy - 1, 10, 1);
      }
      g.fillStyle = 'rgba(255,248,210,0.25)'; g.fillRect(x - 4, y - 84, 8, 80);
    }
  }
  ST.onMap('astra', (m, Wd) => {
    Wd.add(new G.props.Spot({ x: px(35), y: py(33), verb: '풀밭에 누워 쉰다', text: async (c) => {
      await c.narr('그린 마을 흙 위에 눕는다. 황금 모래 한가운데, 풀 냄새가 난다. 할머니 마당 냄새다.');
      await c.rest();
    } }));
    Wd.add(new Ladder({ x: px(29) + 4, y: py(41) - 2, verb: '빛의 사다리를 오른다', text: async (c) => {
      const k = await c.choice('빛의 사다리. 위로 하늘 정거장이 보인다.', ['정거장으로 올라간다', '그만둔다']);
      if (k === 0) await c.warp('station', px(31), py(9), 'left');
    } }));
  });
})();
