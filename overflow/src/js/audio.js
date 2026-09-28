/* 8비트 효과음 (WebAudio 합성 — 외부 파일 없음) */
(function () {
  'use strict';
  const OF = (globalThis.OF = globalThis.OF || {});
  let ctx = null, master = null, enabled = true, lastTap = 0;

  function unlock() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }
  function tone(freq, dur, type, vol, slide, delay) {
    if (!enabled || !ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
    g.gain.setValueAtTime(vol || 0.5, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(dur, vol, delay) {
    if (!enabled || !ctx) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    g.gain.value = vol || 0.3;
    src.buffer = buf; src.connect(g); g.connect(master);
    src.start(t0);
  }

  const sfx = {
    unlock,
    setEnabled(v) { enabled = !!v; },
    tap(crit) {
      const now = performance.now();
      if (now - lastTap < 40) return;
      lastTap = now;
      tone(crit ? 880 : 520 + Math.random() * 120, 0.06, 'square', crit ? 0.45 : 0.28, 1.6);
      if (crit) noise(0.08, 0.2);
    },
    kill() { tone(660, 0.08, 'square', 0.25, 0.5); },
    level() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.09, 'square', 0.3, 1, i * 0.055)); },
    boss() { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.14, 'square', 0.32, 1, i * 0.08)); },
    fail() { tone(220, 0.35, 'sawtooth', 0.35, 0.4); },
    hit() { noise(0.1, 0.25); tone(140, 0.12, 'square', 0.3, 0.6); },
    click() { tone(900, 0.03, 'square', 0.18); },
    blip() { tone(740 + Math.random() * 60, 0.025, 'square', 0.08); },
    orb() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, 'triangle', 0.35, 1, i * 0.07)); },
    promote() { [523, 784, 1046, 1568].forEach((f, i) => tone(f, 0.16, 'triangle', 0.35, 1, i * 0.09)); },
    rebirth() { tone(200, 0.9, 'sine', 0.4, 6); noise(0.6, 0.15, 0.2); },
    overflow() { for (let i = 0; i < 12; i++) tone(200 + i * 160, 0.12, 'sawtooth', 0.25, 1.4, i * 0.06); noise(1.2, 0.3, 0.7); },
  };
  OF.audio = sfx;
})();
