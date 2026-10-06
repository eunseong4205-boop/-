/* 곁가지: 화산 분화구의 불도롱뇽(선택 보스) · 분화구의 열기 · 볼칸의 불꽃 강철검
   2장 뒤 언제든. 방열복 없이 분화구 가까이 가면 열기에 체력이 준다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u, TS = G.tiles.TS;
  const ST = G.story, OW = G.ow;
  const S = () => G.state;
  const f = (k) => !!S().flags[k];
  const [VX, VY] = OW.P(46, 170);   // 화산 (넓어진 대륙의 자리)
  const item = (id, o) => { G.data.ITEMS[id] = Object.assign({ id, price: 0, desc: '' }, o); };
  item('scale_sala', { type: 'key', name: '불도롱뇽의 비늘', desc: '아직 뜨겁다. 볼칸 아저씨라면 이걸 검에 녹여 넣을 수 있을 것이다.' });

  // 분화구로 오르는 돌계단 (남쪽 비탈): 면(절벽)마다 계단을 놓는다
  OW.hooks.push((m) => {
    const T = G.tiles.T, O = G.objs.O;
    for (let y = VY + 2; y <= VY + Math.round(16 * OW.SC); y++) for (const x of [VX, VX + 1]) {
      if (!m.inb(x, y)) continue;
      const i = m.i(x, y);
      if (m.ter[i] === T.CLIFF) { m.ter[i] = T.STAIRS; m.obj[i] = 0; continue; }
      if (m.ter[i] === T.STAIRS || m.ter[i] === T.LAVA) continue;
      m.ter[i] = T.ASH; m.obj[i] = 0;
    }
  });
  // 분화구의 열기
  let heatT = 0, warned = false;
  ST.onTick.push((dt) => {
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p || G.script.running) return;
    const d = U.dist(p.x / TS, p.y / TS, VX, VY);
    if (d > 9 * OW.SC || G.st.derive(S()).heatOk) { heatT = Math.max(0, heatT - dt * 2); return; }
    heatT += dt * (d < 5 * OW.SC ? 1.6 : 1);
    if (heatT > 4) {
      heatT = 1.5; G.combat.hurtPlayer(p, 1, null, { noKnock: true, why: 'heat', inv: 0.2 });
      G.fx.sparks(p.x, p.y - 10, 4, '#ff9a4a', 40);
      if (!warned) { warned = true; G.ui.toast('숨이 막히게 뜨겁다 — 방열복이 있으면 좋겠다', 'bad'); }
    }
  });

  // 불도롱뇽: 분화구 한가운데에 들어서면 깨어난다
  ST.onTick.push(() => {
    if (!f('c2_done') || f('sala_done') || f('sala_on') || G.script.running) return;
    const Wd = G.world, m = Wd.map, p = Wd.player; if (!m || !m.overworld || !p) return;
    if (U.dist(p.x / TS, p.y / TS, VX, VY) > 6) return;   // 한가운데는 용암이라 걸어서는 4칸 안까지 못 들어가 깨어나지 않던 것
    S().flags.sala_on = true;
    G.script.run(async (c) => {
      c.lock(true);
      await c.cinema(true);
      c.sfx('rumble'); c.shake(5, 1.2);
      await c.narr('분화구 바닥의 용암이 부풀어 올랐다. 그 안에서 — 눈 두 개가 떴다.');
      await c.say('toria', '찍——! 불도롱뇽이야! 볼칸 아저씨가 그랬어, 화산의 심장이라고!', { face: 'shock' });
      await c.cutin({ who: 'toria', title: '불도롱뇽', small: '화산의 심장', sub: '불에 강하고 얼음에 약하다 — 용암 웅덩이를 피해라', col: '#c8401a', face: 'shock', sec: 1.6 });
      await c.cinema(false);
      c.lock(false);
      const b = G.bosses.spawn('salamander', VX * TS + 8, (VY - 1) * TS + 12, {});
      b.home = { x: VX * TS + 8, y: VY * TS };
      b.start();
      const won = await c.battle(b, { music: 'boss' });
      if (!won) { S().flags.sala_on = false; return; }
      c.flag('sala_done');
      c.lock(true);
      await c.getItem('scale_sala');
      await c.say('toria', '비늘이 아직 뜨거워. 볼칸 아저씨한테 가져가 보자!', { face: 'happy' });
      c.lock(false);
      c.journal('화산 분화구의 불도롱뇽을 쓰러뜨리고 뜨거운 비늘을 얻었다.');
    });
  });
  // 볼칸: 비늘을 검에
  const forgeCond = () => !!S().inv.scale_sala && !f('forged_flame');
  if (ST.hookTalk) ST.hookTalk('r_forge', 'volkan', forgeCond, async (c, n) => {
    c.lock(true);
    await c.say(n, '이, 이건…! 불도롱뇽 비늘! 살아 있는 놈한테서 뜯어 왔다고? 하하하! 에벨린 누님 손주답다!', { face: 'happy' });
    await c.say(n, '검 이리 내라. 983년 이후로 이런 불은 처음이다.', { face: 'smirk' });
    c.sfx('anvil'); await c.wait(0.35); c.sfx('anvil'); await c.wait(0.35); c.sfx('fire'); c.flash('#ff8a3a', 0.4); c.shake(3, 0.4);
    c.take('scale_sala'); c.flag('forged_flame');
    await c.getItem('sw_flame');
    if (!S().equip.sword || S().equip.sword === 'sw_start' || S().equip.sword === 'sw_iron' || S().equip.sword === 'sw_wood') S().equip.sword = 'sw_flame';
    await c.say(n, '불꽃 강철검. 베면 탄다. 얼음은 녹고, 덩굴은 재가 된다. …불은 조심해서 써라. 불은 주인을 안 가린다.', { face: 'normal' });
    c.lock(false);
  });
})();
