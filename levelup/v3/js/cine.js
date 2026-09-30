/* 연출: 레터박스 · 암전/섬광 · 장 제목 · 지역 이름 · 말풍선(인물 머리 위를 따라다님) · 컷인 · 회상 필터 */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const $ = (id) => document.getElementById(id);
  const W = () => G.world;
  const CI = { bubbles: [], box: false, areaT: 0 };

  function letterbox(on) { CI.box = !!on; $('stage').classList.toggle('cinema', CI.box); }
  function isLetterbox() { return CI.box; }
  function active() { return CI.box; }

  /** 화면 전환: out=true면 어두워진다 */
  function fade(out, o) {
    o = o || {};
    const f = $('fade');
    f.classList.toggle('white', o.col === 'white');
    f.style.transition = 'opacity ' + (o.sec == null ? 0.35 : o.sec) + 's';
    f.style.opacity = out ? '1' : '0';
    // 암전 중에도 이야기 글 · 고르기 · 장 제목은 검은 화면 위에 보인다
    $('stage').classList.toggle('blackout', !!out);
    return G.script.wait((o.sec == null ? 0.35 : o.sec) + 0.02);
  }
  function flash(col, sec, a) {
    const f = $('fade');
    f.style.transition = 'none'; f.classList.toggle('white', col === '#fff' || col === 'white'); f.style.background = col === '#fff' || col === 'white' ? '' : col; f.style.opacity = String(a == null ? 0.85 : a);
    requestAnimationFrame(() => { f.style.transition = 'opacity ' + (sec || 0.3) + 's'; f.style.opacity = '0'; setTimeout(() => { f.style.background = ''; }, (sec || 0.3) * 1000 + 50); });
  }
  /** 장 제목 카드 */
  function chapter(no, title, sub) {
    const el = $('chapter');
    $('chapter-no').textContent = no || '';
    $('chapter-title').textContent = title || '';
    $('chapter-sub').textContent = sub || '';
    el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    if (G.audio) G.audio.sfx('chapter');
    return new Promise((res) => {
      let t = 0;
      const done = () => { el.hidden = true; el.classList.remove('show'); res(); };
      G.script.frames((dt) => { t += dt; if (t > 1.2 && (G.input.pressed('confirm') || G.ui.tapped())) { G.input.eat('confirm'); return true; } return t > 4.2; }).then(done);
    });
  }
  /** 지역 이름 (들어설 때) */
  function area(name, sub) {
    const el = $('area');
    $('area-name').textContent = name; $('area-sub').textContent = sub || '';
    el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    CI.areaT = 3;
  }

  /* ───────── 말풍선 ───────── */
  function toScreen(x, y) {
    const cv = $('cv'), s = G.game.scale || 1;
    const Wd = W();
    return [parseFloat(cv.style.left || 0) + (x - Wd.rcx) * s, parseFloat(cv.style.top || 0) + (y - Wd.rcy) * s];
  }
  function bubble(e, text, o) {
    o = o || {};
    // 같은 사람의 이전 풍선은 지운다
    for (const b of CI.bubbles) if (b.e === e) b.t = b.life;
    const el = document.createElement('div');
    el.className = 'bub' + (o.kind ? ' ' + o.kind : '');
    el.innerHTML = G.ui.markup(text);
    $('bubbles').appendChild(el);
    CI.bubbles.push({ e, el, t: 0, life: o.life || 2.4 });
    return el;
  }
  function update(dt) {
    for (const b of CI.bubbles) {
      b.t += dt;
      const e = b.e;
      if (!e || e.dead || b.t >= b.life) { b.el.remove(); b.done = true; continue; }
      const [sx, sy] = toScreen(e.x, e.y - (e.h || 30) - 6 - (e.jz || 0));
      const w = b.el.offsetWidth, h = b.el.offsetHeight;
      const st = $('stage').getBoundingClientRect();
      const x = U.clamp(sx - w / 2, 4, st.width - w - 4), y = Math.max(4, sy - h - 4);
      b.el.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
      b.el.style.opacity = b.t > b.life - 0.25 ? String((b.life - b.t) / 0.25) : '1';
    }
    CI.bubbles = CI.bubbles.filter((b) => !b.done);
    if (CI.areaT > 0) { CI.areaT -= dt; if (CI.areaT <= 0) $('area').hidden = true; }
  }
  function clearBubbles() { for (const b of CI.bubbles) b.el.remove(); CI.bubbles = []; }

  /* ───────── 컷인: 얼굴과 대사가 띠를 타고 들어온다 ───────── */
  function cutin(o) {
    const el = $('cutin');
    el.innerHTML = '';
    el.classList.toggle('mini', !!o.short);
    const band = document.createElement('div'); band.className = 'band';
    if (o.col) { band.style.setProperty('--cut', o.col); el.style.setProperty('--cut', o.col); } else el.style.removeProperty('--cut');
    el.appendChild(band);
    const face = document.createElement('canvas'); face.className = 'face'; face.width = 64; face.height = 64;
    if (G.portraits) G.portraits.draw(face, o.who === 'hero' ? 'hero' : o.who, o.face || 'angry');
    el.appendChild(face);
    const t = document.createElement('div'); t.className = 'txt';
    t.innerHTML = (o.small ? '<small>' + o.small + '</small>' : '') + '<b>' + G.ui.markup(o.title || '') + '</b>' + (o.sub ? '<span>' + G.ui.markup(o.sub) + '</span>' : '');
    el.appendChild(t);
    el.hidden = false;
    if (G.audio) G.audio.sfx(o.sfx || 'skill');
    const dur = o.short ? 1.1 : o.sec || 1.8;
    return G.script.wait(dur).then(() => { el.hidden = true; el.innerHTML = ''; });
  }

  /** 회상(세피아) · 꿈(푸른빛) · 흑점(흑백) 필터 */
  function filter(kind) {
    const cv = $('cv');
    cv.style.filter = kind === 'memory' ? 'sepia(.75) contrast(.95) brightness(.95)' : kind === 'dream' ? 'hue-rotate(200deg) saturate(.6) brightness(1.05)' : kind === 'void' ? 'grayscale(1) contrast(1.2)' : kind === 'red' ? 'sepia(1) hue-rotate(-40deg) saturate(3) brightness(.8)' : kind === 'drain' ? 'saturate(.15) brightness(.9) contrast(1.05)' : kind === 'half' ? 'saturate(.5)' : kind === 'bright' ? 'saturate(1.35) brightness(1.08)' : '';
    cv.style.transition = 'filter 1.4s ease';
  }

  /** 캔버스 위 연출 (지금은 레터박스 중 화면 가장자리 어둡게) */
  function draw(g, w, h) {
    if (!CI.box) return;
    const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }

  Object.assign(CI, { letterbox, isLetterbox, active, fade, flash, chapter, area, bubble, update, clearBubbles, cutin, filter, draw, toScreen });
  G.cine = CI;
})();
