/* 지도 (메뉴 · M): 대륙 지도와 던전 지도
   대륙: 열린 지역만 밝게, 마을 이름 · 불 켜진 이정표 · 지금 자리 · 목표. 닫힌 지역은 안개.
   던전: 들어가 본 방(지도를 얻으면 전부) · 지금 방 · 나침반이 있으면 보스 방과 남은 상자. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow, TS = G.tiles.TS;
  const S = () => G.state;
  let fogCache = null, fogKey = '';
  function worldCanvas() {
    const m = G.build.get('world');
    if (!m.miniImg) G.hud.buildMini(m);
    const s = S();
    const open = ['green', 'red', 'blue', 'yellow', 'purple', 'rainbow', 'white', 'gray', 'black', 'colorful'].filter((n) => ST.regionOpen(n));
    const key = open.join(',');
    const SC = 2, W = m.w, H = m.h;
    const c = G.gfx.canvas(W * SC, H * SC), g = G.gfx.ctx(c);
    g.imageSmoothingEnabled = false;
    g.drawImage(m.miniImg, 0, 0, W * SC, H * SC);
    // 안개: 닫힌 지역
    if (fogKey !== key || !fogCache) {
      fogCache = G.gfx.canvas(W, H); const fg = G.gfx.ctx(fogCache); const img = fg.createImageData(W, H), d = img.data;
      for (let i = 0; i < W * H; i++) { const n = OW.regName[i]; if (!open.includes(n)) { d[i * 4] = 8; d[i * 4 + 1] = 6; d[i * 4 + 2] = 16; d[i * 4 + 3] = 205; } }
      fg.putImageData(img, 0, 0); fogKey = key;
    }
    g.drawImage(fogCache, 0, 0, W * SC, H * SC);
    // 마을 이름
    g.font = "12px 'Galmuri11', sans-serif"; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [n, t] of Object.entries(OW.towns)) {
      if (!open.includes(n)) continue;
      const x = (t.x + t.w / 2) * SC, y = (t.y + t.h / 2) * SC;
      g.fillStyle = 'rgba(10,8,20,0.75)'; const tw = g.measureText(OW.SHORT[n]).width + 10; g.fillRect(x - tw / 2, y - 9, tw, 18);
      g.fillStyle = '#f6e6b0'; g.fillText(OW.SHORT[n], x, y + 1);
    }
    // 이정표
    for (const w of Object.values(s.waystones || {})) {
      if (w.map !== 'world') continue;
      const x = (w.x / TS) * SC, y = (w.y / TS) * SC;
      g.fillStyle = '#0a1830'; g.fillRect(x - 4, y - 4, 8, 8); g.fillStyle = '#8ad8ff'; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 3, y); g.lineTo(x, y + 4); g.lineTo(x - 3, y); g.closePath(); g.fill();
    }
    // 목표
    const goal = ST.goal && ST.goal();
    if (goal && goal.map === 'world') { const x = goal.x * SC + SC / 2, y = goal.y * SC + SC / 2; g.strokeStyle = '#ffd84a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#ffd84a'; g.fillRect(x - 1, y - 1, 3, 3); g.lineWidth = 1; }
    // 지금 자리
    const cm = G.world.map, p = G.world.player;
    let ppos = null;
    if (cm && cm.overworld && p) ppos = [p.x / TS, p.y / TS];
    else if (s.lastWorld) ppos = [s.lastWorld.x, s.lastWorld.y];
    if (ppos) { const [x0, y0] = ppos; const x = x0 * SC, y = y0 * SC; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ff3a5a'; g.beginPath(); g.arc(x, y, 3.5, 0, Math.PI * 2); g.fill(); }
    return c;
  }
  function dungeonCanvas(m) {
    const s = S(), did = m.dungeon, RW = G.dungeon.RW, RH = G.dungeon.RH;
    const keys = Object.keys(m.rooms);
    const RP = (k) => [m.rooms[k].gx, m.rooms[k].gy];
    const gx = Math.max(...keys.map((k) => RP(k)[0])) + 1, gy = Math.max(...keys.map((k) => RP(k)[1])) + 1;
    const cw = 64, ch = 46, pad = 10, lab = m.rooms[keys[0]].floor != null ? 56 : 0;
    const c = G.gfx.canvas(gx * cw + pad * 2 + lab, gy * ch + pad * 2), g = G.gfx.ctx(c);
    const hasMap = !!s.flags['dmap:' + did], hasComp = !!s.flags['dcomp:' + did];
    const p = G.world.player;
    const pgx = p ? Math.floor(p.x / TS / RW) : -1, pgy = p ? Math.floor(p.y / TS / RH) : -1;
    const cur = keys.find((k) => RP(k)[0] === pgx && RP(k)[1] === pgy) || '';
    const X0 = pad + lab;
    // 층 이름 (왼쪽)
    if (lab) { g.font = "11px 'Galmuri11', sans-serif"; g.textAlign = 'left'; const rows = {}; for (const k of keys) { const fl = m.rooms[k].floor; if (fl && (s.flags['room:' + did + ':' + k] || hasMap)) rows[RP(k)[1]] = fl; } for (const [ry, fl] of Object.entries(rows)) { g.fillStyle = '#c8b8e8'; g.fillText(fl, 4, pad + ry * ch + ch / 2 + 4); } }
    // 문 (이어진 방 사이 선) · 계단 (점선)
    for (const dw of m.doorways || []) {
      const seenA = s.flags['room:' + did + ':' + dw.a], seenB = s.flags['room:' + did + ':' + dw.b];
      if (!hasMap && !(seenA || seenB)) continue;
      const [ax, ay] = RP(dw.a), [bx, by] = RP(dw.b);
      g.strokeStyle = dw.stair ? '#b8a0e8' : '#6a6080'; g.lineWidth = dw.stair ? 2 : 3;
      if (dw.stair) g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(X0 + ax * cw + cw / 2, pad + ay * ch + ch / 2); g.lineTo(X0 + bx * cw + cw / 2, pad + by * ch + ch / 2); g.stroke();
      g.setLineDash([]);
    }
    g.lineWidth = 1;
    for (const k of keys) {
      const [rx, ry] = RP(k);
      const seen = s.flags['room:' + did + ':' + k];
      if (!seen && !hasMap) continue;
      const x = X0 + rx * cw + 4, y = pad + ry * ch + 4, w = cw - 8, h = ch - 8;
      g.fillStyle = k === cur ? '#6a5a98' : seen ? '#3a3458' : '#241f36'; g.fillRect(x, y, w, h);
      g.strokeStyle = k === cur ? '#ffe08a' : '#8a80a8'; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      if (s.flags[did + ':' + k + ':clear']) { g.fillStyle = '#6ae07a'; g.fillRect(x + 3, y + 3, 3, 3); }
      const R = m.rooms[k].R;
      if (hasComp && R.boss) { g.fillStyle = s.flags[did + ':boss'] ? '#6a6080' : '#ff4a6a'; g.font = "12px 'Galmuri11', sans-serif"; g.textAlign = 'center'; g.fillText(s.flags[did + ':boss'] ? '✓' : '☠', x + w / 2, y + h / 2 + 4); }
      if (hasComp) {
        const left = (R.props || []).filter((pr) => pr[0] === 'chest' && !s.flags[did + ':chest:' + k + ':' + pr[1] + ',' + pr[2]]).length;
        for (let i = 0; i < left; i++) { g.fillStyle = '#ffd84a'; g.fillRect(x + w - 7 - i * 5, y + h - 7, 4, 4); }
      }
      if (k === cur && p) { const px = x + ((p.x / TS) % RW) / RW * w, py = y + ((p.y / TS) % RH) / RH * h; g.fillStyle = '#fff'; g.fillRect(px - 2, py - 2, 4, 4); g.fillStyle = '#ff3a5a'; g.fillRect(px - 1, py - 1, 2, 2); }
    }
    return c;
  }
  ST.drawWorldMap = function (body) {
    const s = S(), m = G.world.map;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0';
    const title = document.createElement('div'); title.style.cssText = 'font-size:13px;color:#e8d8a8;letter-spacing:.1em';
    let cv;
    if (m && m.dungeon) {
      cv = dungeonCanvas(m);
      title.textContent = (m.name || '던전') + (m.curFloor ? ' — ' + m.curFloor : '') + (s.flags['dmap:' + m.dungeon] ? ' · 지도 있음' : '') + (s.flags['dcomp:' + m.dungeon] ? ' · 나침반 있음' : '');
    } else {
      cv = worldCanvas();
      title.textContent = '이리스 대륙' + (m && !m.overworld && m.name ? ' — 지금: ' + m.name : '');
    }
    cv.style.cssText = 'width:min(100%, ' + (m && m.dungeon ? cv.width * 2 : 900) + 'px);height:auto;image-rendering:pixelated;border:1px solid #4a4260;border-radius:4px;background:#08060e';
    wrap.appendChild(title); wrap.appendChild(cv);
    const legend = document.createElement('div'); legend.style.cssText = 'font-size:11px;color:#a8a0c0;display:flex;gap:14px;flex-wrap:wrap;justify-content:center';
    legend.innerHTML = m && m.dungeon ? '<span><b style="color:#ff3a5a">■</b> 나</span><span><b style="color:#ffe08a">□</b> 지금 방</span><span><b style="color:#6ae07a">■</b> 정리한 방</span><span><b style="color:#ffd84a">■</b> 남은 상자</span><span><b style="color:#ff4a6a">☠</b> 주인</span>'
      : '<span><b style="color:#ff3a5a">●</b> 나</span><span><b style="color:#ffd84a">◎</b> 목표</span><span><b style="color:#8ad8ff">◆</b> 빛의 이정표</span><span>어두운 곳 — 아직 갈 수 없는 땅</span>';
    wrap.appendChild(legend);
    const goal = ST.goalText && ST.goalText();
    if (goal) { const gd = document.createElement('div'); gd.style.cssText = 'font-size:12px;color:#f0cc6e;max-width:60ch;text-align:center;line-height:1.6'; gd.textContent = '목표 — ' + goal; wrap.appendChild(gd); }
    body.appendChild(wrap);
  };
  // 실내 · 던전에 있을 때도 대륙 지도에 「마지막으로 있던 곳」을 찍는다
  ST.onTick.push(() => { const Wd = G.world, m = Wd.map, p = Wd.player; if (m && m.overworld && p) { const s = S(); s.lastWorld = s.lastWorld || {}; s.lastWorld.x = p.x / TS; s.lastWorld.y = p.y / TS; } });
})();
