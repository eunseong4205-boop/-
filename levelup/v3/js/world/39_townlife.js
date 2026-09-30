/* 마을마다 다른 얼굴: 명소 하나(만지면 이야기 · 작은 효과) · 그 마을만의 공기(김 · 반딧불 · 갈매기 · 모래바람 …) · 빈 땅의 잔살림
   그린 「초록 창 석상」 · 레드 「용광로 굴뚝」 · 블루 「파도 분수」 · 옐로 「황금 분수」(동전 던지기) · 퍼플 「거울 석상」 · 무지개 「일곱 빛 분수」
   · 화이트 「얼음 성녀상」 · 그레이 「멈춘 시계탑」 · 블랙 「등불 탑」 · 알록달록 「발명품 전시 천막」 · 안개 늪 「소원 우물」 · 단풍 협곡 「메아리 석상」 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TL = G.tiles, OB = G.objs;
  const T = TL.T, O = OB.O, TS = TL.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const px = (tx) => tx * TS + 8, py = (ty) => ty * TS + 12;

  const MARK = {
    green: { special: 'statue', w: 1, h: 1, name: '초록 창 석상', text: '창을 든 여인의 석상. 창날이 반쯤 부러져 있다. 받침돌: 「초록의 자리 — 983년 겨울, 한 합에 졌으나 시간을 벌었다」.\n누군가 매일 새 잎 한 장을 창끝에 걸어 둔다.', fx: 'vit' },
    red: { special: 'tower', w: 3, h: 2, col: '#8a3a2a', name: '용광로 굴뚝', text: '레드 대장장이들의 굴뚝. 벽돌마다 이름이 새겨져 있다. 맨 아래 칸에 볼칸, 그 옆에 하루. 둘 사이에 빈 칸 하나.', fx: 'str' },
    blue: { special: 'fountain', w: 2, h: 2, name: '파도 분수', text: '물줄기가 파도처럼 오르내린다. 바닥에 조개껍질 동전이 가득. 「돌아올 배를 위해」.', fx: 'sta' },
    yellow: { special: 'fountain', w: 2, h: 2, name: '황금 분수', text: '금화가 가득 잠긴 분수. 옐로 사람들은 여기서 운을 산다.', coin: true },
    purple: { special: 'statue', w: 1, h: 1, name: '거울 석상', text: '거울을 든 마녀의 석상. 거울에 비친 네가 먼저 웃는다. …아니, 조금 늦게 웃는다.', fx: 'int' },
    rainbow: { special: 'fountain', w: 2, h: 2, name: '일곱 빛 분수', text: '분수 물줄기가 해를 받아 일곱 빛깔로 갈라진다. 천년 전에도 이 분수는 있었다고 한다.', fx: 'exp' },
    white: { special: 'statue', w: 1, h: 1, name: '얼음 성녀상', text: '얼음으로 깎은 성녀상. 한 번도 녹은 적이 없다. 발밑에 촛불 대신 작은 눈사람들이 줄지어 있다.', fx: 'vit' },
    gray: { special: 'tower', w: 3, h: 2, col: '#7a7a86', name: '멈춘 시계탑', text: '612년에 멈춘 시계. 바늘이 셋. 하나는 시, 하나는 분, 하나는 — 거꾸로 돈다. 볼트가 고치겠다고 한 지 40년.', fx: 'dex' },
    black: { special: 'tower', w: 3, h: 2, col: '#4a3a6a', name: '등불 탑', text: '밤의 도시에서 가장 높은 등불. 16년 동안 꺼진 적이 없다. 등불지기 칸델의 할아버지가 처음 붙였다.', fx: 'int' },
    colorful: { special: 'tent', w: 3, h: 2, col: '#ff8a3a', name: '발명품 전시 천막', text: '피로스 박사의 실패작 전시장. 「제1안: 날지 않는 로켓」 「제2안: 조금 나는 로켓」 … 「제411안: 거의 나는 로켓」.', fx: 'dex' },
    mist: { special: 'well', w: 1, h: 1, name: '소원 우물', text: '안개가 고여 있는 우물. 동전 대신 이름을 속삭여 넣는다고 한다. 우물이 대답하면 소원이 이루어진다고.', wish: true },
    amber: { special: 'statue', w: 1, h: 1, name: '메아리 석상', text: '귀를 기울인 사냥꾼의 석상. 말을 걸면 석상이 한 박자 늦게 따라 한다.', fx: 'sta' },
  };
  const AIR = {
    green: { col: '#fff8a8', kind: 'firefly', n: 8 }, red: { col: '#ffb070', kind: 'ember', n: 12 }, blue: { col: '#ffffff', kind: 'gull', n: 3 },
    yellow: { col: '#e8c890', kind: 'dust', n: 14 }, purple: { col: '#d8b0ff', kind: 'firefly', n: 10 }, rainbow: { col: '#ffb0e0', kind: 'balloon', n: 5 },
    white: { col: '#ffffff', kind: 'glint', n: 12 }, gray: { col: '#a8a8b0', kind: 'smoke', n: 10 }, black: { col: '#fff4a8', kind: 'firefly', n: 16 },
    colorful: { col: '#ff8a3a', kind: 'spark', n: 8 }, mist: { col: '#d8f0e8', kind: 'wisp', n: 8 }, amber: { col: '#e8783a', kind: 'leaf', n: 12 },
  };
  const LITTER = {
    green: [O.FLOWER, O.FLOWER, O.PLANTER, O.HAY, O.BARREL], red: [O.CRATE, O.BARREL, O.POTS, O.PEBBLE], blue: [O.NET, O.BARREL, O.CRATE, O.PEBBLE],
    yellow: [O.POTS, O.CRATE, O.CACTUS, O.PEBBLE], purple: [O.PLANTER, O.FLOWER, O.SHROOM === undefined ? O.FLOWER : O.FLOWER, O.BENCH], rainbow: [O.PLANTER, O.FLOWER, O.BANNER],
    white: [O.BARREL, O.CRATE, O.PEBBLE], gray: [O.CRATE, O.RUBBLE, O.BARREL, O.PEBBLE], black: [O.BARREL, O.GRAVE === undefined ? O.PEBBLE : O.PEBBLE, O.BENCH],
    colorful: [O.CRATE, O.BARREL, O.PLANTER, O.FLOWER], mist: [O.NET, O.BARREL, O.REED], amber: [O.HAY, O.BARREL, O.FLOWER, O.CRATE],
  };

  /** 명소 자리: 바깥 동네 안, 광장에서 가까운 빈 평지 */
  function spotFor(m, n, w, h) {
    const t = OW.towns[n], E = t.outer || { x0: t.x - 6, y0: t.y - 6, x1: t.x + t.w + 6, y1: t.y + t.h + 6 };
    const cx = t.plaza ? t.plaza.x : t.x + (t.w >> 1), cy = t.plaza ? t.plaza.y : t.y + (t.h >> 1);
    const cand = [];
    for (let y = E.y0 + 2; y < E.y1 - h - 2; y++) for (let x = E.x0 + 2; x < E.x1 - w - 2; x++) {
      if (x >= t.x - 1 && x <= t.x + t.w && y >= t.y - 1 && y <= t.y + t.h) continue;   // 이야기 건물이 있는 한가운데는 비킨다
      cand.push([x, y, Math.hypot(x - cx, y - cy)]);
    }
    cand.sort((a, b) => a[2] - b[2]);
    for (const [x, y] of cand) {
      let ok = true; const hh = m.hgt[m.i(x, y)];
      for (let yy = y - 1; yy <= y + h + 1 && ok; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
        const i = m.i(xx, yy), tt = m.ter[i];
        if (m.solidExtra[i] || m.obj[i] && OB.DEF[m.obj[i]] && OB.DEF[m.obj[i]].solid || m.hgt[i] !== hh || tt === T.CLIFF || tt === T.STAIRS || tt === T.WATER || tt === T.DEEP || tt === T.BRIDGE || OW.roadTiles[i]) { ok = false; break; }
      }
      // 광장 · 골목 포장은 괜찮지만 문 바로 앞은 피한다
      for (const w2 of m.warps || []) if (w2.x >= x - 3 && w2.x <= x + w + 2 && w2.y >= y - 3 && w2.y <= y + h + 3) ok = false;   // 문 · 동굴 앞은 비킨다
      if (ok) return [x, y];
    }
    return null;
  }
  OW.hooks.push((m) => {
    OW.marks = {};
    for (const [n, M] of Object.entries(MARK)) {
      const t = OW.towns[n]; if (!t) continue;
      const at = spotFor(m, n, M.w, M.h);
      if (!at) continue;
      const [x, y] = at;
      G.build.placeBuilding(m, Object.assign({ special: M.special, tx: x, ty: y, w: M.w, h: M.h, door: false, id: 'mark_' + n }, M.col ? { col: M.col } : {}));
      OW.marks[n] = { x, y, w: M.w, h: M.h };
    }
    // 빈 땅의 잔살림: 골목 · 길 · 문 앞이 아닌 자리만, 이웃이 트여 있을 때만
    const rnd = U.rng(4411);
    const NATURAL = new Set([T.GRASS, T.DIRT, T.SAND, T.SNOW, T.ASH, T.DARK, T.MEADOW, T.MOSS, T.LEAVES, T.MUD, T.DRY, T.PETALS, T.CRACKED]);
    const doors = (m.warps || []).map((w) => [w.x, w.y, w.w || 1, w.h || 1]);
    const nearDoor = (x, y) => doors.some(([wx, wy, ww, wh]) => x >= wx - 3 && x <= wx + ww + 2 && y >= wy - 2 && y <= wy + wh + 3);
    for (const [n, t] of Object.entries(OW.towns)) {
      const E = t.outer; if (!E) continue;
      const list = LITTER[n] || LITTER.green;
      for (let y = E.y0 + 1; y < E.y1; y++) for (let x = E.x0 + 1; x < E.x1; x++) {
        const i = m.i(x, y);
        if (m.obj[i] || m.solidExtra[i] || OW.roadTiles[i]) continue;
        const tt = m.ter[i];
        if (!NATURAL.has(tt)) continue;                  // 자연 바닥에만 (포장 · 구름 · 물가 · 계단은 비움)
        if (nearDoor(x, y)) continue;                    // 문 · 동굴 · 계단 둘레는 늘 비워 둔다
        let wallNb = 0, pave = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = m.i(x + dx, y + dy); if (m.solidExtra[j]) wallNb++; const t2 = m.ter[j]; if (t2 === T.COBBLE || t2 === T.BRICK || t2 === T.PLANK || t2 === T.SANDSTONE || t2 === T.MARBLE || OW.roadTiles[j]) pave++; if (m.obj[j] && OB.DEF[m.obj[j]] && OB.DEF[m.obj[j]].solid) wallNb += 2; }
        if (wallNb >= 2 || pave >= 2) continue;
        const r = rnd();
        if (r < 0.05) { const o = list[Math.floor(rnd() * list.length)]; const solid = OB.DEF[o] && OB.DEF[o].solid; if (!solid || (wallNb === 1 && pave === 0)) m.obj[i] = o; }
        else if (r < 0.1) m.obj[i] = O.FLOWER;
      }
    }
  });

  /* ───────── 마을의 공기 ───────── */
  class Air extends G.ent.Ent {
    constructor(o) { super(Object.assign({ kind: 'air', solid: false, hidden: false, sortBias: 400 }, o)); this.parts = []; }
    update(dt, Wd) {
      this.t += dt;
      const p = Wd.player; if (!p) return;
      this.x = p.x; this.y = p.y;   // 늘 화면 안에서 그려지도록
      const E = this.E, inside = p.x > E.x0 * TS - 80 && p.x < E.x1 * TS + 80 && p.y > E.y0 * TS - 80 && p.y < E.y1 * TS + 80;
      if (!inside) { this.parts.length = 0; return; }
      const A = this.A;
      while (this.parts.length < A.n) this.parts.push({ x: p.x + (Math.random() - 0.5) * 460, y: p.y + (Math.random() - 0.5) * 280, ph: Math.random() * 6, v: 0.5 + Math.random() });
      const night = G.story.nightFactor ? G.story.nightFactor() : 0;
      for (const q of this.parts) {
        q.ph += dt;
        switch (A.kind) {
          case 'firefly': q.x += Math.cos(q.ph * 0.9) * 10 * dt; q.y += Math.sin(q.ph * 1.3) * 8 * dt; break;
          case 'ember': case 'spark': q.y -= 18 * q.v * dt; q.x += Math.sin(q.ph * 3) * 6 * dt; break;
          case 'gull': q.x += 40 * q.v * dt; q.y += Math.sin(q.ph) * 6 * dt; break;
          case 'dust': q.x += 50 * q.v * dt; q.y += Math.sin(q.ph * 2) * 4 * dt; break;
          case 'balloon': q.y -= 10 * q.v * dt; q.x += Math.sin(q.ph * 0.7) * 5 * dt; break;
          case 'smoke': q.y -= 12 * q.v * dt; q.x += 6 * dt; break;
          case 'wisp': q.x += Math.cos(q.ph * 0.4) * 12 * dt; q.y += Math.sin(q.ph * 0.3) * 4 * dt; break;
          case 'leaf': q.y += 16 * q.v * dt; q.x += (10 + Math.sin(q.ph * 2) * 14) * dt; break;
          default: q.y += Math.sin(q.ph) * 2 * dt; break;
        }
        if (Math.abs(q.x - p.x) > 260 || Math.abs(q.y - p.y) > 170) { q.x = p.x + (Math.random() - 0.5) * 460; q.y = p.y + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 80); }
      }
      this.night = night;
    }
    draw(g, cx, cy) {
      const A = this.A;
      for (const q of this.parts) {
        const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
        switch (A.kind) {
          case 'firefly': { if (A.col === '#fff8a8' && this.night < 0.3) break; const a = 0.4 + Math.sin(q.ph * 4) * 0.4; if (a <= 0) break; g.globalAlpha = a; g.fillStyle = A.col; g.fillRect(x, y, 1, 1); g.globalAlpha = a * 0.3; g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; break; }
          case 'gull': { const w = Math.sin(q.ph * 8) > 0 ? 1 : 0; g.fillStyle = '#f4f4f8'; g.fillRect(x - 3, y - w, 3, 1); g.fillRect(x + 1, y - w, 3, 1); g.fillRect(x, y, 1, 1); break; }
          case 'balloon': { g.fillStyle = ['#ff7ab8', '#ffd84a', '#6ad8ff', '#8ae07a', '#b87aff'][Math.floor(q.v * 5) % 5]; g.beginPath(); g.ellipse(x, y, 3, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x - 1, y - 2, 1, 1); g.fillStyle = '#8a8a96'; g.fillRect(x, y + 4, 1, 5); break; }
          case 'smoke': { g.globalAlpha = 0.25; g.fillStyle = A.col; g.beginPath(); g.arc(x, y, 3 + q.v * 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; break; }
          case 'wisp': { g.globalAlpha = 0.08; g.fillStyle = A.col; g.beginPath(); g.ellipse(x, y, 24 * q.v, 6, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; break; }
          case 'leaf': { g.fillStyle = q.v > 1 ? '#e8783a' : '#c8582a'; g.fillRect(x, y, 2, 1); break; }
          case 'glint': { if (Math.sin(q.ph * 5) > 0.7) { g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y, 3, 0.5); } break; }
          default: { g.globalAlpha = 0.7; g.fillStyle = A.col; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; }
        }
      }
    }
  }

  /* ───────── 들어설 때: 명소의 글 · 공기 ───────── */
  const FXNAME = { str: '힘', vit: '체력', sta: '스태미나', int: '지력', dex: '솜씨', exp: '빛' };
  ST.onMap('world', (m, Wd) => {
    for (const [n, M] of Object.entries(MARK)) {
      const at = OW.marks && OW.marks[n]; if (!at) continue;
      const key = 'mark:' + n;
      Wd.add(new G.props.Spot({ x: px(at.x + (M.w >> 1)), y: py(at.y + M.h) + 2, verb: M.name + '을 본다', sparkle: !f(key), text: async (c) => {
        await c.narr('[y]' + M.name + '[/]\n' + M.text);
        if (M.coin) {
          const k = await c.choice('동전을 던질까? (50골드)', ['던진다', '그만둔다']);
          if (k !== 0) return;
          if (S().gold < 50) { await c.narr('주머니가 가볍다.'); return; }
          c.gold(-50); c.sfx('coin');
          const r = Math.random(), st = S(); st.buffs = (st.buffs || []).filter((b) => b.until > st.t);
          if (r < 0.2) { c.gold(200); await c.say(null, '동전이 분수 바닥에서 튀어 올랐다! [y]200골드[/]', { style: 'sys' }); }
          else if (r < 0.6) { st.buffs.push({ atk: 1.15, until: st.t + 240, col: '#ffd84a' }); await c.say(null, '[y]황금의 운[/] — 4분 동안 공격 +15%', { style: 'sys' }); }
          else await c.narr('퐁당. 동전이 가라앉았다. 옐로 사람들은 이걸 「세금」이라 부른다.');
          return;
        }
        if (M.wish) {
          if (f(key)) { await c.narr('우물이 조용하다. 이미 대답을 들었다.'); return; }
          const k = await c.choice('우물에 누구의 이름을 속삭일까?', ['세린', '에벨린', '토리아', '아무 이름도 말하지 않는다']);
          c.flag(key);
          await c.narr(k === 3 ? '우물이 한참 뒤에 대답했다. 「…고마워. 이름을 달라는 사람만 왔었거든.」' : '우물이 그 이름을 한 번 되뇌었다. 조금 늦게. 물 위에 작은 빛이 떠올랐다.');
          c.exp(200); if (k === 3) { S().pts = (S().pts || 0) + 1; await c.say(null, '[y]성장 점수 +1[/]', { style: 'sys' }); }
          return;
        }
        if (!f(key)) {
          c.flag(key);
          if (M.fx === 'exp') { c.exp(150); await c.say(null, '물보라에 빛이 섞여 있다. [y]빛 알갱이[/]를 얻었다.', { style: 'sys' }); }
          else { const st = S(); st.buffs = (st.buffs || []).filter((b) => b.until > st.t); st.buffs.push({ atk: M.fx === 'str' ? 1.1 : 1, def: M.fx === 'vit' ? 0.9 : 1, stamina: M.fx === 'sta' ? 1.3 : 1, until: st.t + 300, col: '#fff4a8' }); await c.say(null, '[y]' + M.name + '의 기운[/] — 5분 동안 ' + FXNAME[M.fx] + '의 가호', { style: 'sys' }); }
          const seen = Object.keys(MARK).filter((k2) => f('mark:' + k2)).length;
          if (seen === Object.keys(MARK).length) { S().pts = (S().pts || 0) + 3; await c.say(null, '열두 마을의 명소를 모두 보았다. [y]성장 점수 +3[/]', { style: 'sys' }); }
        }
      } }));
    }
    for (const [n, t] of Object.entries(OW.towns)) if (t.outer && AIR[n]) Wd.add(new Air({ x: px(t.x), y: py(t.y), E: t.outer, A: AIR[n] }));
  });
  ST.MARK = MARK;
})();
