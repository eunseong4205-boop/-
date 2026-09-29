/* 소리: WebAudio 칩튠 합성기. 효과음은 즉석에서 합성하고, 음악은 MML 악보 + 화음 진행으로 만든다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const A = { ctx: null, cur: null, curId: null, queued: null };
  let master, mGain, sGain, noiseBuf;
  const waves = {};

  function unlock() {
    if (!A.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { A.ctx = new AC(); } catch (_) { return; }
      master = A.ctx.createGain(); master.connect(A.ctx.destination);
      const comp = A.ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      comp.connect(master);
      mGain = A.ctx.createGain(); mGain.connect(comp);
      sGain = A.ctx.createGain(); sGain.connect(comp);
      noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      applySettings();
      if (A.queued !== null) { const q = A.queued; A.queued = null; music(q); }
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
  }
  function applySettings() {
    if (!A.ctx) return;
    const st = (G.state && G.state.settings) || { music: true, sfx: true, vol: 0.7 };
    master.gain.value = st.vol == null ? 0.7 : st.vol;
    mGain.gain.value = st.music ? 0.32 : 0;
    sGain.gain.value = st.sfx ? 0.55 : 0;
  }
  function pulse(duty) {
    if (waves[duty]) return waves[duty];
    const n = 64, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    waves[duty] = A.ctx.createPeriodicWave(re, im);
    return waves[duty];
  }
  function osc(type, f, t, dur, vol, dest, opt) {
    opt = opt || {};
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    if (type === 'sq12' || type === 'sq25' || type === 'sq50') o.setPeriodicWave(pulse({ sq12: 0.125, sq25: 0.25, sq50: 0.5 }[type]));
    else o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.to), t + (opt.slide || dur));
    if (opt.vib) { const l = A.ctx.createOscillator(), lg = A.ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(o.frequency); l.start(t + 0.12); l.stop(t + dur + 0.05); }
    const a = opt.a || 0.004, r = opt.r || 0.04, sus = opt.sus == null ? 0.75 : opt.sus;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.linearRampToValueAtTime(vol * sus, t + Math.min(dur, a + (opt.d || 0.08)));
    g.gain.setValueAtTime(vol * sus, t + Math.max(a, dur - 0.005));
    g.gain.linearRampToValueAtTime(0, t + dur + r);
    o.connect(g); g.connect(dest || sGain);
    o.start(t); o.stop(t + dur + r + 0.02);
  }
  function noise(t, dur, vol, dest, hp, lp) {
    const src = A.ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = A.ctx.createBiquadFilter(); f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = hp || lp || 3000;
    const g = A.ctx.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest || sGain);
    src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
  }
  const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  /* ───────── 효과음 ───────── */
  const lastSfx = {};
  function sfx(name) {
    if (!A.ctx || !G.state || !G.state.settings.sfx) return;
    const now = A.ctx.currentTime;
    if (lastSfx[name] && now - lastSfx[name] < 0.03) return;
    lastSfx[name] = now;
    const t = now + 0.005;
    switch (name) {
      case 'click': osc('sq25', 880 + Math.random() * 60, t, 0.03, 0.12, null, { to: 1320, slide: 0.03 }); break;
      case 'clickspot': osc('sq25', 1046, t, 0.03, 0.12); osc('sq12', 1568, t + 0.03, 0.04, 0.08); break;
      case 'levelup': [72, 76, 79, 84, 88].forEach((m, i) => osc('sq50', hz(m), t + i * 0.055, 0.07, 0.13)); osc('triangle', hz(60), t, 0.3, 0.2); break;
      case 'white': [84, 88, 91, 96].forEach((m, i) => osc('sine', hz(m), t + i * 0.06, 0.25, 0.1, null, { r: 0.3 })); break;
      case 'coin': osc('sq25', 1318, t, 0.05, 0.1); osc('sq25', 1760, t + 0.05, 0.12, 0.1); break;
      case 'hit': noise(t, 0.08, 0.35, null, 1200); osc('sq50', 220, t, 0.05, 0.12, null, { to: 90, slide: 0.05 }); break;
      case 'crit': noise(t, 0.14, 0.5, null, 800); osc('sq50', 440, t, 0.08, 0.16, null, { to: 110, slide: 0.08 }); osc('sq25', 1760, t, 0.05, 0.08); break;
      case 'hurt': noise(t, 0.2, 0.45, null, null, 900); osc('sq50', 160, t, 0.18, 0.18, null, { to: 60, slide: 0.18 }); break;
      case 'defeat': for (let i = 0; i < 6; i++) noise(t + i * 0.05, 0.08, 0.3 - i * 0.04, null, 600 + i * 300); osc('sq25', 660, t, 0.3, 0.1, null, { to: 110, slide: 0.3 }); break;
      case 'encounter': [0, 1, 2, 3].forEach((i) => osc('sq50', hz(64 + (i % 2) * 5), t + i * 0.06, 0.05, 0.12)); noise(t, 0.3, 0.2, null, 2000); break;
      case 'select': osc('sq25', 988, t, 0.04, 0.1); osc('sq25', 1318, t + 0.04, 0.05, 0.1); break;
      case 'move': osc('sq12', 660, t, 0.025, 0.07); break;
      case 'tick': osc('sq12', 523, t, 0.02, 0.05); break;
      case 'cancel': osc('sq25', 660, t, 0.04, 0.08); osc('sq25', 440, t + 0.04, 0.05, 0.08); break;
      case 'open': osc('sq25', 523, t, 0.04, 0.09); osc('sq25', 784, t + 0.04, 0.06, 0.09); break;
      case 'buzz': osc('sq50', 110, t, 0.14, 0.14); osc('sq50', 116, t, 0.14, 0.1); break;
      case 'unlock': [67, 71, 74, 79, 83, 86].forEach((m, i) => osc('sq25', hz(m), t + i * 0.05, 0.08, 0.1)); break;
      case 'heal': [72, 76, 79, 84].forEach((m, i) => osc('sine', hz(m), t + i * 0.07, 0.12, 0.14)); break;
      case 'equip': noise(t, 0.05, 0.2, null, 3000); osc('sq25', 784, t + 0.03, 0.06, 0.1); break;
      case 'page': noise(t, 0.09, 0.14, null, 4000); break;
      case 'door': noise(t, 0.12, 0.18, null, null, 500); osc('sq50', 196, t, 0.06, 0.08); osc('sq50', 147, t + 0.07, 0.08, 0.08); break;
      case 'bump': osc('sq50', 98, t, 0.05, 0.08); break;
      case 'item': [76, 79, 84].forEach((m, i) => osc('sq25', hz(m), t + i * 0.06, 0.08, 0.1)); break;
      case 'key': [72, 79, 84, 91].forEach((m, i) => osc('sq50', hz(m), t + i * 0.08, 0.12, 0.1)); break;
      case 'surprise': osc('sq25', 1046, t, 0.05, 0.1); osc('sq25', 1568, t + 0.05, 0.08, 0.1); break;
      case 'question': osc('sq25', 784, t, 0.05, 0.09); osc('sq25', 1046, t + 0.08, 0.06, 0.09, null, { to: 1318, slide: 0.06 }); break;
      case 'emote': osc('sq12', 880, t, 0.06, 0.08); break;
      case 'jump': osc('sq25', 330, t, 0.12, 0.1, null, { to: 880, slide: 0.12 }); break;
      case 'rumble': for (let i = 0; i < 5; i++) noise(t + i * 0.08, 0.2, 0.25, null, null, 220); break;
      case 'skill': osc('sq50', 440, t, 0.2, 0.12, null, { to: 1760, slide: 0.2 }); noise(t, 0.2, 0.2, null, 3000); break;
      case 'fever': [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => osc('sq25', hz(m), t + i * 0.035, 0.05, 0.1)); break;
      case 'run': [0, 1, 2].forEach((i) => osc('sq12', 880 - i * 200, t + i * 0.05, 0.04, 0.08)); break;
      case 'faint': [67, 63, 60, 55].forEach((m, i) => osc('sq50', hz(m), t + i * 0.18, 0.2, 0.12)); break;
      case 'chest': [60, 64, 67, 72, 76].forEach((m, i) => osc('sq25', hz(m), t + i * 0.04, 0.06, 0.1)); break;
      case 'orb': [84, 91, 96, 91, 96, 103].forEach((m, i) => osc('sine', hz(m), t + i * 0.09, 0.3, 0.1, null, { r: 0.4 })); break;
      case 'chapter': osc('triangle', hz(48), t, 1.2, 0.3, null, { r: 0.8 }); osc('sine', hz(72), t + 0.1, 1, 0.08, null, { r: 1 }); break;
      case 'step': noise(t, 0.03, 0.05, null, 5000); break;
      case 'splash': noise(t, 0.3, 0.25, null, 1500); break;
      case 'magic': [0, 1, 2, 3, 4, 5].forEach((i) => osc('sine', hz(79 + i * 3), t + i * 0.04, 0.15, 0.06, null, { r: 0.2 })); break;
      case 'explode': for (let i = 0; i < 8; i++) noise(t + i * 0.03, 0.4, 0.4 - i * 0.04, null, null, 400 + i * 100); osc('sq50', 110, t, 0.4, 0.2, null, { to: 30, slide: 0.4 }); break;
      case 'firework': osc('sq12', 300, t, 0.5, 0.06, null, { to: 1800, slide: 0.5 }); for (let i = 0; i < 6; i++) noise(t + 0.5 + i * 0.04, 0.3, 0.3, null, 1000 + i * 400); break;
      // ── v3 액션 ──
      case 'swing': noise(t, 0.07, 0.22, null, 2400); osc('sq12', 520, t, 0.05, 0.06, null, { to: 260, slide: 0.05 }); break;
      case 'thrust': noise(t, 0.06, 0.25, null, 3200); osc('sq25', 700, t, 0.05, 0.07, null, { to: 1200, slide: 0.05 }); break;
      case 'spin': for (let i = 0; i < 4; i++) noise(t + i * 0.05, 0.06, 0.22, null, 1800 + i * 500); osc('sq25', 330, t, 0.25, 0.08, null, { to: 990, slide: 0.25 }); break;
      case 'charged': osc('sq25', 1318, t, 0.05, 0.09); osc('sq25', 1760, t + 0.05, 0.08, 0.09); break;
      case 'roll': noise(t, 0.12, 0.16, null, null, 1200); break;
      case 'land': noise(t, 0.06, 0.2, null, null, 500); osc('sq50', 90, t, 0.04, 0.08); break;
      case 'fall': osc('sq25', 880, t, 0.5, 0.08, null, { to: 110, slide: 0.5 }); break;
      case 'burn': noise(t, 0.35, 0.25, null, null, 1400); osc('sawtooth', 120, t, 0.3, 0.04, null, { to: 60, slide: 0.3 }); break;
      case 'clank': osc('sq50', 1760, t, 0.03, 0.1); osc('sq25', 2637, t, 0.06, 0.06); noise(t, 0.05, 0.2, null, 4000); break;
      case 'shield': osc('sq50', 1318, t, 0.04, 0.1); noise(t, 0.08, 0.18, null, 3000); break;
      case 'perfect': [79, 86, 91, 98].forEach((m, i) => osc('sine', hz(m), t + i * 0.03, 0.2, 0.1, null, { r: 0.3 })); noise(t, 0.2, 0.15, null, 5000); break;
      case 'ready': [84, 88, 91, 96].forEach((m, i) => osc('sq25', hz(m), t + i * 0.04, 0.06, 0.08)); break;
      case 'special': noise(t, 0.4, 0.35, null, 1200); osc('sq50', 220, t, 0.35, 0.12, null, { to: 1760, slide: 0.3 }); [84, 91, 96].forEach((m, i) => osc('sine', hz(m), t + 0.2 + i * 0.05, 0.3, 0.1)); break;
      case 'draw': osc('sq12', 220, t, 0.18, 0.05, null, { to: 330, slide: 0.18 }); break;
      case 'shoot': noise(t, 0.06, 0.2, null, 3000); osc('sq12', 660, t, 0.04, 0.05, null, { to: 330, slide: 0.04 }); break;
      case 'shootc': noise(t, 0.1, 0.28, null, 2500); osc('sq25', 990, t, 0.08, 0.08, null, { to: 330, slide: 0.08 }); break;
      case 'thunk': noise(t, 0.05, 0.22, null, null, 800); osc('sq50', 130, t, 0.04, 0.08); break;
      case 'cast': [0, 1, 2].forEach((i) => osc('sine', hz(84 + i * 4), t + i * 0.03, 0.1, 0.06)); break;
      case 'fire': noise(t, 0.3, 0.3, null, null, 1800); osc('sawtooth', 200, t, 0.2, 0.05, null, { to: 80, slide: 0.2 }); break;
      case 'ice': [96, 100, 103].forEach((m, i) => osc('sine', hz(m), t + i * 0.025, 0.12, 0.07)); noise(t, 0.12, 0.15, null, 6000); break;
      case 'bolt': for (let i = 0; i < 6; i++) noise(t + i * 0.03, 0.08, 0.35, null, 2000 + Math.random() * 3000); osc('sawtooth', 80, t, 0.3, 0.1, null, { to: 40, slide: 0.3 }); break;
      case 'beam': osc('sine', hz(96), t, 0.15, 0.1, null, { to: hz(84), slide: 0.15 }); osc('sq12', hz(91), t, 0.1, 0.05); break;
      case 'freeze': [91, 96, 103, 108].forEach((m, i) => osc('sine', hz(m), t + i * 0.02, 0.1, 0.06)); break;
      case 'melt': noise(t, 0.25, 0.15, null, null, 1200); break;
      case 'fuse': noise(t, 0.4, 0.08, null, 5000); break;
      case 'hook': osc('sq12', 440, t, 0.2, 0.06, null, { to: 1320, slide: 0.2 }); noise(t, 0.2, 0.1, null, 4000); break;
      case 'lamp': osc('sine', hz(79), t, 0.2, 0.1); osc('sine', hz(86), t + 0.05, 0.2, 0.08); break;
      case 'mirror': [88, 95, 100, 107].forEach((m, i) => osc('sine', hz(m), t + i * 0.05, 0.3, 0.06, null, { r: 0.3 })); break;
      case 'lift': osc('sq50', 180, t, 0.08, 0.08, null, { to: 300, slide: 0.08 }); break;
      case 'throw': noise(t, 0.1, 0.18, null, 1800); break;
      case 'rock': for (let i = 0; i < 3; i++) noise(t + i * 0.04, 0.1, 0.3, null, null, 600); break;
      case 'cut': noise(t, 0.08, 0.2, null, 3500); osc('sq12', 1200, t, 0.02, 0.04); break;
      case 'heart': osc('sq25', hz(84), t, 0.05, 0.1); osc('sq25', hz(88), t + 0.05, 0.08, 0.1); break;
      case 'mp': osc('sine', hz(88), t, 0.08, 0.1); osc('sine', hz(95), t + 0.05, 0.1, 0.08); break;
      case 'fairy': [84, 88, 91, 96, 100, 103].forEach((m, i) => osc('sine', hz(m), t + i * 0.06, 0.25, 0.08, null, { r: 0.3 })); break;
      case 'bossdie': for (let i = 0; i < 14; i++) noise(t + i * 0.07, 0.25, 0.35, null, null, 300 + i * 120); osc('sq50', 220, t, 1.2, 0.12, null, { to: 30, slide: 1.2 }); break;
      case 'telegraph': osc('sq25', 1046, t, 0.04, 0.06); osc('sq25', 1046, t + 0.08, 0.04, 0.06); break;
      case 'growl': osc('sawtooth', 90, t, 0.3, 0.06, null, { to: 60, slide: 0.3 }); noise(t, 0.3, 0.1, null, null, 400); break;
      case 'shriek': osc('sq12', 1400, t, 0.2, 0.06, null, { to: 2400, slide: 0.2 }); break;
      case 'squish': osc('sine', 300, t, 0.08, 0.1, null, { to: 120, slide: 0.08 }); break;
      case 'foeshot': osc('sq25', 660, t, 0.08, 0.06, null, { to: 330, slide: 0.08 }); break;
      case 'switch': osc('sq50', 440, t, 0.04, 0.1); osc('sq50', 660, t + 0.05, 0.06, 0.1); break;
      case 'puzzle': [67, 71, 74, 79, 83, 86, 91].forEach((m, i) => osc('sq25', hz(m), t + i * 0.045, 0.07, 0.09)); break;
      case 'block': noise(t, 0.2, 0.16, null, null, 300); break;
      case 'warp': osc('sine', 200, t, 0.5, 0.1, null, { to: 1600, slide: 0.5 }); [84, 91, 96].forEach((m, i) => osc('sine', hz(m), t + 0.3 + i * 0.05, 0.3, 0.06)); break;
      case 'save': [72, 79, 84, 88].forEach((m, i) => osc('sine', hz(m), t + i * 0.08, 0.3, 0.09, null, { r: 0.3 })); break;
      case 'talk': osc('sq12', 880, t, 0.03, 0.05); break;
      case 'bell': osc('sine', hz(84), t, 1.2, 0.12, null, { r: 1 }); osc('sine', hz(96), t, 0.8, 0.05, null, { r: 1 }); break;
      case 'thunder': for (let i = 0; i < 10; i++) noise(t + i * 0.06, 0.4, 0.3 - i * 0.02, null, null, 200 + i * 40); break;
      case 'wind': noise(t, 1.2, 0.08, null, null, 700); break;
      case 'heartbeat': osc('sine', 60, t, 0.1, 0.35, null, { to: 40, slide: 0.1 }); osc('sine', 60, t + 0.22, 0.1, 0.25, null, { to: 40, slide: 0.1 }); break;
      case 'impact': noise(t, 0.3, 0.45, null, null, 400); osc('sq50', 80, t, 0.3, 0.2, null, { to: 30, slide: 0.3 }); break;
      case 'crystal': [96, 103, 108].forEach((m, i) => osc('sine', hz(m), t + i * 0.08, 0.6, 0.06, null, { r: 0.6 })); break;
    }
  }
  function blip(voice) {
    if (!A.ctx || !G.state || !G.state.settings.sfx) return;
    const t = A.ctx.currentTime + 0.002;
    osc('sq25', 330 * (voice || 1) * (0.94 + Math.random() * 0.12), t, 0.028, 0.045);
  }

  /* ───────── MML 악보 ─────────
     t 템포 · o 옥타브 · < > · l 기본 길이 · cdefgab(+#-) · r 쉼표 · ^ 붙임 · . 점 · v 볼륨(0~15) · @ 음색 · q 스타카토(1~8) · [ ]n 반복
     드럼: k 킥 · s 스네어 · h 하이햇 · o 오픈햇 · r 쉼표 */
  function parseMML(src, drum) {
    const ev = [];
    let i = 0, oct = 4, len = 8, t = 0, vol = 10, inst = null, q = 7.5;
    const stack = [];
    src = src.replace(/\s+/g, '');
    const num = () => { let s = ''; while (i < src.length && /[0-9]/.test(src[i])) s += src[i++]; return s ? parseInt(s, 10) : null; };
    const dur = () => { const n = num(); let d = 4 / (n || len); let dd = d; while (src[i] === '.') { i++; dd /= 2; d += dd; } while (src[i] === '^') { i++; const m = num(); d += 4 / (m || len); } return d; };
    while (i < src.length) {
      const c = src[i++];
      if (drum && 'khos'.indexOf(c) >= 0) { const d = dur(); ev.push({ t, d, drum: c, v: vol / 15 }); t += d; continue; }
      if (c === 't') { num(); continue; }
      if (c === 'o') { oct = num(); continue; }
      if (c === '<') { oct--; continue; }
      if (c === '>') { oct++; continue; }
      if (c === 'l') { len = num(); continue; }
      if (c === 'v') { vol = num(); continue; }
      if (c === 'q') { q = num(); continue; }
      if (c === '@') { inst = num(); continue; }
      if (c === '[') { stack.push({ pos: i, t }); continue; }
      if (c === ']') { const n = num() || 2; const top = stack[stack.length - 1]; top.count = (top.count || 1) + 1; if (top.count <= n) { i = top.pos; } else stack.pop(); continue; }
      if (c === 'r') { t += dur(); continue; }
      if (NOTE[c] !== undefined) {
        let n = NOTE[c];
        while (src[i] === '+' || src[i] === '#' || src[i] === '-') { n += src[i] === '-' ? -1 : 1; i++; }
        const d = dur();
        ev.push({ t, d, m: 12 * (oct + 1) + n, v: vol / 15, q: q / 8, inst });
        t += d;
      }
    }
    return { ev, len: t };
  }

  /* ───────── 화음 진행 → 베이스 · 반주 ───────── */
  const CH_Q = { '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], sus4: [0, 5, 7], dim: [0, 3, 6], aug: [0, 4, 8], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], add9: [0, 4, 7, 14] };
  function parseChords(str, beatsPerBar) {
    const out = []; let t = 0;
    for (const tok of str.trim().split(/\s+/)) {
      const [name, bl] = tok.split(':');
      const b = bl ? parseFloat(bl) : beatsPerBar;
      if (name === '-') { t += b; continue; }
      const m = /^([A-G])([#b]?)(.*)$/.exec(name);
      const root = NOTE[m[1].toLowerCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
      out.push({ t, b, root, iv: CH_Q[m[3]] || CH_Q[''] });
      t += b;
    }
    return { chords: out, len: t };
  }
  function genBass(ch, style) {
    const ev = [];
    for (const c of ch.chords) {
      const r = 36 + ((c.root + 12) % 12) + (c.root % 12 > 7 ? -12 : 0) + 12;
      const fifth = r + 7, third = r + c.iv[1];
      const put = (dt, d, m, v) => ev.push({ t: c.t + dt, d, m, v: v || 0.8, q: 0.85 });
      if (style === 'long') put(0, c.b, r);
      else if (style === 'root') for (let k = 0; k < c.b; k++) put(k, 1, r);
      else if (style === 'pulse') for (let k = 0; k < c.b * 2; k++) put(k / 2, 0.5, r, k % 2 ? 0.6 : 0.85);
      else if (style === 'oct') for (let k = 0; k < c.b * 2; k++) put(k / 2, 0.5, k % 2 ? r + 12 : r);
      else if (style === 'walk') { const seq = [r, third, fifth, r + 12, fifth, third]; for (let k = 0; k < c.b; k++) put(k, 1, seq[k % seq.length]); }
      else if (style === 'waltz') { put(0, 1, r); if (c.b >= 3) { put(1, 1, fifth - 12 < 36 ? fifth : fifth - 12, 0.4); put(2, 1, fifth - 12 < 36 ? fifth : fifth - 12, 0.4); } }
      else if (style === 'gallop') for (let k = 0; k < c.b; k++) { put(k, 0.5, r); put(k + 0.5, 0.25, r); put(k + 0.75, 0.25, r + 12); }
      else if (style === 'sparse') { put(0, 1.5, r); if (c.b >= 4) put(2.5, 1.5, fifth); }
      else put(0, c.b, r);
    }
    return ev;
  }
  function genArp(ch, style, base) {
    const ev = [];
    base = base || 60;
    for (const c of ch.chords) {
      let r = base + ((c.root - (base % 12) + 12) % 12); if (r > base + 6) r -= 12;
      const tones = c.iv.map((x) => r + x);
      const put = (dt, d, m, v) => { if (dt < c.b) ev.push({ t: c.t + dt, d: Math.min(d, c.b - dt), m, v: v || 0.5, q: 0.8 }); };
      if (style === 'up16') { const seq = tones.concat([tones[0] + 12]); for (let k = 0; k < c.b * 4; k++) put(k / 4, 0.25, seq[k % seq.length]); }
      else if (style === 'updown') { const seq = [tones[0], tones[1], tones[2], tones[0] + 12, tones[2], tones[1]]; for (let k = 0; k < c.b * 4; k++) put(k / 4, 0.25, seq[k % seq.length]); }
      else if (style === 'broken8') { const seq = [tones[0], tones[2], tones[1], tones[2]]; for (let k = 0; k < c.b * 2; k++) put(k / 2, 0.5, seq[k % 4]); }
      else if (style === 'off8') for (let k = 0; k < c.b; k++) { put(k + 0.5, 0.35, tones[1], 0.45); }
      else if (style === 'stab') { put(0, 0.5, tones[2], 0.55); put(1.5, 0.5, tones[1], 0.5); if (c.b >= 4) put(2.5, 0.5, tones[2], 0.5); }
      else if (style === 'waltz') { for (let k = 1; k < c.b; k++) put(k, 0.6, tones[(k + 1) % tones.length], 0.4); }
      else if (style === 'pad') { put(0, c.b, tones[1], 0.35); }
      else if (style === 'bell') { put(0, 1.5, tones[2] + 12, 0.4); put(2, 1.5, tones[1] + 12, 0.35); }
    }
    return ev;
  }
  const DRUMS = {
    rock: 'l8 [k h s h k k s h]', march: 'l16 [s r s s k r s r s r s s k r k r]', soft: 'l8 [k r h r s r h r]', shuffle: 'l12 [k r h s r h k r h s r h]',
    waltz: 'l4 [k h h]', battle: 'l16 [k r h r s r h k k r h r s r h h]', dance: 'l8 [k h s h k h s o]', none: '', half: 'l4 [k r s r]',
    boss: 'l16 [k k h r s r h k k r h k s h s s]', tick: 'l8 [h h h h h h h h]', final: 'l16 [k r k h s r h k k h k r s h s o]',
  };

  /* ───────── 재생 ───────── */
  const INST = [['sq12', 0.13], ['sq25', 0.13], ['sq50', 0.11], ['triangle', 0.32], ['sine', 0.16], ['sawtooth', 0.05]];
  function build(tr) {
    const bpb = tr.bpb || 4;
    const chans = [];
    if (tr.lead) { const p = parseMML(tr.lead); chans.push({ ev: p.ev, len: p.len, wave: tr.leadWave || 'sq25', vol: tr.leadVol || 0.13, vib: true }); }
    if (tr.harm) { const p = parseMML(tr.harm); chans.push({ ev: p.ev, len: p.len, wave: tr.harmWave || 'sq12', vol: tr.harmVol || 0.07 }); }
    let chordLen = 0;
    if (tr.chords) {
      const ch = parseChords(tr.chords, bpb); chordLen = ch.len;
      if (tr.bass !== false) chans.push({ ev: genBass(ch, tr.bass || 'root'), len: ch.len, wave: 'triangle', vol: tr.bassVol || 0.3 });
      if (tr.arp) chans.push({ ev: genArp(ch, tr.arp, tr.arpBase), len: ch.len, wave: tr.arpWave || 'sq12', vol: tr.arpVol || 0.06 });
    }
    if (tr.bassMML) { const p = parseMML(tr.bassMML); chans.push({ ev: p.ev, len: p.len, wave: 'triangle', vol: tr.bassVol || 0.3 }); }
    const dsrc = tr.drumMML || DRUMS[tr.drums || 'none'];
    if (dsrc) { const p = parseMML(dsrc, true); if (p.len) chans.push({ ev: p.ev, len: p.len, drum: true, vol: tr.drumVol || 1 }); }
    void chordLen;
    return chans;
  }
  function music(id) {
    if (!A.ctx) { A.queued = id; return; }
    if (id === A.curId && A.cur) return;
    stop();
    A.curId = id;
    if (!id) return;
    const tr = G.music && G.music.tracks[id];
    if (!tr) return;
    const chans = build(tr);
    const spb = 60 / tr.bpm;
    const t0 = A.ctx.currentTime + 0.1;
    const bus = A.ctx.createGain(); bus.gain.value = 0; bus.connect(mGain);
    bus.gain.linearRampToValueAtTime(1, t0 + 0.4);
    const st = { id, chans: chans.map((c) => ({ c, i: 0, base: 0 })), spb, t0, bus, once: tr.once };
    A.cur = st;
    st.timer = setInterval(() => schedule(st), 40);
    schedule(st);
  }
  function stop(fadeSec) {
    const st = A.cur;
    if (!st) return;
    clearInterval(st.timer);
    const t = A.ctx.currentTime;
    st.bus.gain.cancelScheduledValues(t); st.bus.gain.setValueAtTime(st.bus.gain.value, t); st.bus.gain.linearRampToValueAtTime(0, t + (fadeSec || 0.25));
    setTimeout(() => { try { st.bus.disconnect(); } catch (_) { /* 무시 */ } }, ((fadeSec || 0.25) + 3) * 1000);
    A.cur = null; A.curId = null;
  }
  function schedule(st) {
    const now = A.ctx.currentTime, ahead = now + 0.25;
    for (const ch of st.chans) {
      const c = ch.c; if (!c.ev.length || !c.len) continue;
      let guard = 0;
      while (guard++ < 64) {
        if (ch.i >= c.ev.length) { if (st.once) break; ch.i = 0; ch.base += c.len; }
        const e = c.ev[ch.i];
        const t = st.t0 + (ch.base + e.t) * st.spb;
        if (t > ahead) break;
        ch.i++;
        if (t < now - 0.05) continue;
        const d = e.d * st.spb;
        if (c.drum) {
          const v = e.v * c.vol;
          if (e.drum === 'k') osc('sine', 150, t, 0.12, 0.55 * v, st.bus, { to: 40, slide: 0.12, sus: 0.3 });
          if (e.drum === 's') { noise(t, 0.12, 0.28 * v, st.bus, 1500); osc('triangle', 190, t, 0.05, 0.2 * v, st.bus); }
          if (e.drum === 'h') noise(t, 0.035, 0.1 * v, st.bus, 7000);
          if (e.drum === 'o') noise(t, 0.16, 0.1 * v, st.bus, 6000);
          continue;
        }
        const inst = e.inst != null ? INST[e.inst] : null;
        const wave = inst ? inst[0] : c.wave, vol = (inst ? inst[1] : c.vol) * (e.v != null ? e.v / 0.66 : 1);
        osc(wave, hz(e.m), t, Math.max(0.03, d * (e.q || 0.9)), vol, st.bus, { vib: c.vib && d > 0.3, sus: wave === 'triangle' ? 0.9 : 0.7, r: wave === 'triangle' ? 0.02 : 0.05 });
      }
    }
  }
  /** 짧은 팡파르: 음악을 잠깐 줄이고 한 번 연주 */
  function jingle(id) {
    if (!A.ctx || !G.state || !G.state.settings.sfx) return;
    const tr = G.music && G.music.jingles[id];
    if (!tr) return;
    const t0 = A.ctx.currentTime + 0.03, spb = 60 / tr.bpm;
    const bus = A.ctx.createGain(); bus.gain.value = 1; bus.connect(sGain);
    let endT = 0;
    for (const part of tr.parts) {
      const p = parseMML(part.mml, part.drum);
      for (const e of p.ev) {
        const t = t0 + e.t * spb;
        if (part.drum) { if (e.drum === 'k') osc('sine', 150, t, 0.12, 0.5, bus, { to: 40, slide: 0.12, sus: 0.3 }); else noise(t, e.drum === 's' ? 0.12 : 0.05, 0.2, bus, e.drum === 's' ? 1500 : 7000); continue; }
        osc(part.wave || 'sq25', hz(e.m), t, e.d * spb * 0.9, (part.vol || 0.14) * e.v / 0.66, bus, { vib: e.d > 0.9 });
      }
      endT = Math.max(endT, p.len * spb);
    }
    if (mGain && A.cur) { const t = A.ctx.currentTime; mGain.gain.cancelScheduledValues(t); mGain.gain.setValueAtTime(mGain.gain.value, t); mGain.gain.linearRampToValueAtTime(0.06, t + 0.05); mGain.gain.setValueAtTime(0.06, t + endT); mGain.gain.linearRampToValueAtTime(G.state.settings.music ? 0.32 : 0, t + endT + 0.6); }
  }

  Object.assign(A, { unlock, applySettings, sfx, blip, music, stop, jingle, parseMML, parseChords });
  G.audio = A;
})();
