/* 부트스트랩: 게임 루프, 저장/불러오기, 오프라인 보상 */
(function () {
  'use strict';
  const OF = globalThis.OF;
  const E = OF.engine, N = OF.num;
  const KEY = 'overflow-levelup-save-v1';
  const STEP = 0.05;
  let S = null, last = 0, acc = 0, started = false;

  function lsGet() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(KEY, v); return true; } catch (e) { return false; } }
  function lsDel() { try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } }

  function save() { if (S) lsSet(E.serialize(S)); }
  function exportCode() { return btoa(unescape(encodeURIComponent(E.serialize(S)))); }
  function importCode(code) {
    try {
      const json = decodeURIComponent(escape(atob(code.replace(/\s+/g, ''))));
      const s = E.deserialize(json);
      if (!s || typeof s.level !== 'number') return false;
      S = s;
      OF.ui.closeModal();
      OF.ui.setState(S);
      save();
      OF.ui.toast('저장 코드를 불러왔습니다.');
      return true;
    } catch (e) { return false; }
  }
  function hardReset() {
    lsDel();
    S = E.newState();
    OF.ui.closeModal();
    OF.ui.setState(S);
    save();
  }

  function offline(sec) {
    const g = E.offlineGain(S, sec);
    if (!g) return;
    E.applyOffline(S, g);
    S.events.length = 0;
    OF.ui.openModal('<h2>다녀오셨어요?</h2><div class="small">자리를 비운 동안 동료들이 대신 싸웠습니다.</div>' +
      '<div class="card kv" style="margin:10px 0"><span>자리 비움</span><span>' + N.fmtTime(g.sec) + '</span><span>처치</span><span>' + N.fmt(Math.floor(g.kills)) + '</span>' +
      '<span>경험치</span><span class="c-cyan">+' + N.fmt(g.exp) + '</span><span>골드</span><span class="c-gold">+' + N.fmt(g.gold) + '</span></div>' +
      '<div class="tiny">동료와 자동 손가락의 힘으로 계산됩니다 (효율 50%, 최대 ' + (2 + E.fu(S, 'f_off')) + '시간).</div>' +
      '<button type="button" class="btn gold wide" style="margin-top:10px" data-act="closeModal">좋아!</button>');
  }

  function loop(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt < 0) dt = 0;
    if (dt > 2) {
      // 백그라운드에서 돌아옴
      if (dt > 60) offline(dt);
      else for (let t = 0; t < dt; t += STEP) E.tick(S, STEP);
      dt = 0;
    }
    if (!OF.ui.isPaused()) {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 40) { E.tick(S, STEP); acc -= STEP; n++; }
      if (n >= 40) acc = 0;
    }
    OF.ui.frame(now, Math.min(dt, 0.1));
    requestAnimationFrame(loop);
  }

  function start(data) {
    if (started) return;
    started = true;
    let raw = (data && data.save) || lsGet();
    let away = 0;
    if (raw) {
      try { S = E.deserialize(raw); away = (Date.now() - (S.lastSave || Date.now())) / 1000; }
      catch (e) { S = null; }
    }
    if (!S) S = E.newState();
    OF.ui.init(S);
    if (away > 60 && S.seen.prologue) offline(away);
    setInterval(save, 15000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
    window.addEventListener('pagehide', save);
    last = performance.now();
    requestAnimationFrame(loop);
  }

  const hot = globalThis.window && window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(() => ({ save: S ? E.serialize(S) : null })); } catch (e) { /* 무시 */ }

  OF.main = { save, exportCode, importCode, hardReset, get state() { return S; } };

  function boot() {
    try {
      if (hot && hot.ready) hot.ready(start);
      else start((hot && hot.data) || {});
    } catch (e) { start({}); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
