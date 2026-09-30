/* 음악 감독: 같은 마을 · 같은 들판이라도 때와 일에 따라 다른 곡
   ─ 들판: 낮 · 밤(밤의 들판) · 비(비 오는 들판) · 여덟 번째 장부터는 「먼 길」
   ─ 마을: 밤이면 「밤의 마을」, 무지개는 「축제의 밤」
   ─ 들판 싸움: 적이 둘 이상 달려들면 「들판 싸움」, 정예가 끼면 「정예」 — 잠잠해지면 돌아온다
   ─ 던전: 잠긴 시련의 방은 「전투」, 깊은 구역은 꼴마다(어둠 · 미로 · 퍼즐 · 깊은 층), 아주 어두운 방은 「어둠」
   ─ 보스: 절반이 깨지면 「격노」 · 무한의 탑 스무 층부터 「높은 탑」
   이야기 장면이 고른 곡(슬픔 · 웅장 · 보스 …)은 건드리지 않는다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, U = G.u, TS = G.tiles.TS;
  const S = () => G.state, W = () => G.world;
  OW.MUSIC.mist = 'mist'; OW.MUSIC.amber = 'amber';

  // 감독이 바꿔도 되는 곡들 (배경 곡). 이 밖의 곡은 이야기가 고른 것
  const AMBIENT = new Set(Object.values(OW.MUSIC).concat(['field', 'journey', 'field_night', 'town_night', 'festival_night', 'rain', 'skirmish', 'elite', 'battle', 'cave', 'hollow',
    'dungeon_puzzle', 'dungeon_maze', 'dungeon_dark', 'dungeon_deep', 'tower', 'tower_high', 'arcade', 'crater', 'castle', 'mist', 'amber', 'space', 'planet', 'calm', 'forest']));
  const nightK = () => (G.story.nightFactor ? G.story.nightFactor() : 0);

  /** 들판 · 마을의 곡 */
  function fieldTrack(n) {
    const Wd = W(), p = Wd.player; let t = OW.MUSIC[n] || 'field';
    if (!p) return t;
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    const town = OW.inTown(tx, ty, 6);
    if (t === 'field' && ST.chIdx() >= ST.chIdx('c8')) t = 'journey';
    const wx = OW.weatherAt ? OW.weatherAt(p) : null;
    if (wx === 'rain' && !town && n !== 'mist') t = 'rain';
    if (nightK() > 0.6 && n !== 'black' && n !== 'purple') {
      if (town) t = n === 'rainbow' ? 'festival_night' : 'town_night';
      else if (t === 'field' || t === 'journey' || t === 'green' || t === 'rain') t = 'field_night';
    }
    return t;
  }
  G.story.musicFor = fieldTrack;

  /** 던전 방의 곡 */
  function roomOf(m, p) {
    if (!m.rooms) return null;
    const tx = Math.floor(p.x / TS), ty = Math.floor((p.y - 3) / TS), RW = m.RW || G.dungeon.RW, RH = m.RH || G.dungeon.RH;
    for (const k of Object.keys(m.rooms)) { const r = m.rooms[k]; if (tx >= r.x0 && ty >= r.y0 && tx < r.x0 + RW && ty < r.y0 + RH) return [k, r]; }
    return null;
  }
  function dungeonTrack(m, Wd) {
    const base = typeof m.music === 'function' ? m.music() : m.music;
    const kr = roomOf(m, Wd.player); if (!kr) return base;
    const [k, r] = kr, R = r.R || {};
    const ctl = r.ctl;
    if (ctl && ctl.trap && G.combat.foes().some((e) => !e.dead)) return 'battle';
    const dark = R.dark != null ? R.dark : 0;
    if (/^w_/.test(k)) {
      if (dark >= 0.6) return 'dungeon_dark';
      if (R.shape === 'maze' || R.maze) return 'dungeon_maze';
      if (R.solve && ['plates', 'order', 'torches', 'flag'].includes(R.solve.type)) return 'dungeon_puzzle';
      return 'dungeon_deep';
    }
    if (dark >= 0.75) return 'dungeon_dark';
    return base;
  }

  let t0 = 0, lastSet = null, lastChange = -99, fightT = 0, mapId = null, fighting = null, sceneT = 0;
  function want() {
    const Wd = W(), m = Wd.map, p = Wd.player; if (!m || !p) return null;
    // 보스: 절반이 깨지면 격노
    const boss = Wd.ents.find((e) => e.boss && !e.dead && !e.dying && e.st !== 'wait');
    if (boss) { const cur = G.audio.curId; if (boss.phase2 && cur === 'boss') return 'boss_rage'; return null; }
    if (m.id === 'inf_tower') { const t = S().tower || {}; return (t.cur || 1) >= 20 ? 'tower_high' : 'tower'; }
    // 들판 싸움 (들판 · 던전 공통): 가까이 달려드는 적
    let n = 0, elite = false;
    for (const e of G.combat.foes()) { if (e.dead || !e.aggro) continue; if (U.dist(e.x, e.y, p.x, p.y) < 160) { n++; if (e.elite) elite = true; } }
    const hot = elite || n >= 2;
    if (hot) fightT = 3.5; else fightT = Math.max(0, fightT - 0.5);
    if (m.overworld) {
      if (fightT > 0) { fighting = fighting || (elite ? 'elite' : 'skirmish'); if (elite) fighting = 'elite'; return fighting; }
      fighting = null;
      return fieldTrack(OW.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)));
    }
    if (m.dungeon) return dungeonTrack(m, Wd);
    return null;
  }
  ST.onTick.push((dt) => {
    t0 -= dt; if (t0 > 0) return; t0 = 0.5;
    const A = G.audio; if (!A || !A.ctx) return;
    const Wd = W(), m = Wd.map; if (!m) return;
    if (G.script.running || (G.game && G.game.scene && G.game.scene !== 'play')) { if (A.curId !== lastSet) sceneT = 6; return; }
    if (m.id !== mapId) { mapId = m.id; lastSet = null; fighting = null; fightT = 0; }
    let cur = A.curId;
    // 장면이 남기고 간 곡: 6초 뒤, 싸움이 없으면 배경 곡으로 돌아간다
    if (sceneT > 0) { sceneT -= 0.5; if (sceneT <= 0 && cur && !Wd.ents.some((e) => e.boss && !e.dead)) lastSet = cur; }
    // 이야기가 고른 곡(슬픔 · 웅장 · 장면 속 전투 …)은 두고, 배경 곡 · 내가 고른 곡 · 보스 곡만 바꾼다
    const mine = cur === lastSet, ambient = AMBIENT.has(cur) && cur !== 'battle';
    if (cur && !mine && !ambient && cur !== 'boss') return;
    const w = want();
    if (!w || w === cur) return;
    if (!G.music.tracks[w]) return;
    const nowT = Wd.t; if (nowT - lastChange < 2.5 && w !== 'boss_rage') return;
    lastChange = nowT; lastSet = w;
    A.music(w);
  });
  G.bgm = { fieldTrack, dungeonTrack, AMBIENT };
})();
