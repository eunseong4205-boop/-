/* 공용 유틸: 숫자 표기, 한국어 조사, 난수, 수학 */
(function () {
  'use strict';
  const G = (globalThis.G = globalThis.G || {});
  const MAX = Number.MAX_VALUE;

  const KR = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극', '항하사', '아승기', '나유타', '불가사의', '무량대수'];

  function trim(v, d) {
    let s = v.toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }
  /** 큰 수 → 「1234만」, 「5.67억」 */
  function fmt(n) {
    if (n === Infinity) return '∞';
    if (typeof n !== 'number' || n !== n) return '?';
    if (n < 0) return '-' + fmt(-n);
    if (n < 10000) return n < 10 && n % 1 ? trim(n, 1) : Math.floor(n).toLocaleString('en-US');
    const u = Math.min(KR.length - 1, Math.floor(Math.log10(n) / 4));
    const v = n / Math.pow(10, u * 4);
    if (v >= 10000) return Math.floor(v).toLocaleString('en-US') + KR[u];
    if (v >= 1000) return Math.floor(v) + KR[u];
    if (v >= 100) return trim(Math.floor(v * 10) / 10, 1) + KR[u];
    return trim(Math.floor(v * 100) / 100, 2) + KR[u];
  }
  /** 정수 그대로 (레벨 등). 100만 미만은 쉼표 */
  function fmtInt(n) {
    if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
    return fmt(n);
  }
  function fmtMult(n) { return '×' + (n < 100 ? trim(n, n < 10 ? 2 : 1) : fmt(n)); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h) return h + '시간 ' + m + '분';
    if (m) return m + '분 ' + (sec % 60) + '초';
    return sec + '초';
  }
  function fin(x) { return x !== x ? 0 : x > MAX ? MAX : x; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── 한국어 조사 ── */
  function hasBatchim(word) {
    const s = String(word);
    for (let i = s.length - 1; i >= 0; i--) {
      const c = s.charCodeAt(i);
      if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
      if (/[0-9]/.test(s[i])) return '013678'.indexOf(s[i]) >= 0;
      if (/[a-zA-Z]/.test(s[i])) return 'lmnr'.indexOf(s[i].toLowerCase()) >= 0;
    }
    return false;
  }
  function rieulEnd(word) {
    const s = String(word);
    const c = s.charCodeAt(s.length - 1);
    return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 === 8;
  }
  /** josa('하늘','이/가') → '하늘이' */
  function josa(word, pair) {
    const [a, b] = pair.split('/');
    if (pair === '으로/로') return word + (hasBatchim(word) && !rieulEnd(word) ? '으로' : '로');
    return word + (hasBatchim(word) ? a : b);
  }
  /** 「{n}」 이름 치환 + 「{n:이/가}」 조사 */
  function nameSub(text, name) {
    return String(text).replace(/\{n(?::([^}]+))?\}/g, (_, p) => (p ? josa(name, p) : name));
  }

  /* ── 난수 ── */
  function hash(s) {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** 좌표 기반 결정적 난수 0~1 */
  function noise2(x, y, s) {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function pick(arr, r) { return arr[Math.floor((r === undefined ? Math.random() : r) * arr.length) % arr.length]; }

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }
  function mix(a, b, t) {
    const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }

  G.u = { fmt, fmtInt, fmtMult, fmtTime, fin, clamp, lerp, josa, nameSub, hasBatchim, hash, rng, noise2, pick, shade, mix, MAX };
})();
