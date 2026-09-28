/* 숫자 표기 & 공용 수학 유틸 */
(function () {
  'use strict';
  const OF = (globalThis.OF = globalThis.OF || {});
  const MAX = Number.MAX_VALUE;

  const KR_UNITS = ['', '만', '억', '조', '경', '해', '자', '양', '구', '간', '정', '재', '극',
    '항하사', '아승기', '나유타', '불가사의', '무량대수'];
  const EN_UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

  let notation = 'kr';

  function setNotation(n) { notation = n; }
  function getNotation() { return notation; }

  function trimFixed(v, digits) {
    let s = v.toFixed(digits);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  }

  function sig4(v) {
    // v in [1, 10000)
    if (v >= 1000) return String(Math.floor(v));
    if (v >= 100) return trimFixed(Math.floor(v * 10) / 10, 1);
    if (v >= 10) return trimFixed(Math.floor(v * 100) / 100, 2);
    return trimFixed(Math.floor(v * 1000) / 1000, 3);
  }

  function sci(n) {
    let e = Math.floor(Math.log10(n));
    let m = n / Math.pow(10, e);
    if (!isFinite(m)) { m = n / 1e300 / Math.pow(10, e - 300); }
    if (m >= 9.995) { m /= 10; e += 1; }
    return m.toFixed(2) + 'e' + e;
  }

  function alpha(idx) {
    // 12 -> aa, 13 -> ab ...
    const i = idx - EN_UNITS.length;
    const a = Math.floor(i / 26), b = i % 26;
    return String.fromCharCode(97 + a) + String.fromCharCode(97 + b);
  }

  /** 큰 수 포맷 */
  function fmt(n) {
    if (n === Infinity) return '∞';
    if (n === -Infinity) return '-∞';
    if (typeof n !== 'number' || isNaN(n)) return 'NaN';
    if (n < 0) return '-' + fmt(-n);
    if (n < 1e4) {
      if (n < 10 && n % 1 !== 0) return trimFixed(n, 2);
      if (n < 100 && n % 1 !== 0) return trimFixed(n, 1);
      return Math.floor(n).toLocaleString('en-US');
    }
    if (notation === 'sci') return sci(n);
    if (notation === 'en') {
      const idx = Math.floor(Math.log10(n) / 3);
      const v = n / Math.pow(10, idx * 3);
      const unit = idx < EN_UNITS.length ? EN_UNITS[idx] : alpha(idx);
      if (!isFinite(v) || idx > 12 + 26 * 26) return sci(n);
      return sig4(v) + unit;
    }
    // 한국식 만 단위
    const u = Math.floor(Math.log10(n) / 4);
    if (u <= 17) {
      let v = n / Math.pow(10, u * 4);
      if (v >= 10000) return sig4(v / 10000) + KR_UNITS[Math.min(u + 1, 17)];
      return sig4(v) + KR_UNITS[u];
    }
    return sci(n);
  }

  /** 정수 레벨 등 짧은 표기 */
  function fmtInt(n) {
    if (n < 1e4) return Math.floor(n).toLocaleString('en-US');
    return fmt(n);
  }

  function fmtMult(n) {
    if (n < 1e4) return '×' + (n < 10 ? trimFixed(n, 2) : n < 100 ? trimFixed(n, 1) : Math.floor(n).toLocaleString('en-US'));
    return '×' + fmt(n);
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h > 0) return h + '시간 ' + m + '분';
    if (m > 0) return m + '분 ' + s + '초';
    return s + '초';
  }

  function fmtPct(v) { return trimFixed(v * 100, 1) + '%'; }

  /** 유한 보정: 무한/NaN → MAX */
  function fin(x) {
    if (x !== x) return 0; // NaN
    if (x > MAX) return MAX;
    if (x < -MAX) return -MAX;
    return x;
  }

  function log10(x) { return x > 0 ? Math.log10(x) : 0; }
  function pow10(x) { return x > 308.25 ? MAX : Math.pow(10, x); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  /** 등비 비용 합: base*r^n 부터 k개 */
  function geoSum(base, r, n, k) {
    // log-safe
    const first = base * Math.pow(r, n);
    if (k <= 0) return 0;
    const s = first * (Math.pow(r, k) - 1) / (r - 1);
    return fin(s);
  }
  /** 가진 돈으로 살 수 있는 최대 개수 */
  function geoMaxAfford(base, r, n, money) {
    const first = base * Math.pow(r, n);
    if (!(money >= first)) return 0;
    const k = Math.floor(Math.log(money * (r - 1) / first + 1) / Math.log(r));
    let kk = Math.max(0, k);
    // 부동소수 보정
    while (kk > 0 && geoSum(base, r, n, kk) > money) kk--;
    return kk;
  }

  // 결정적 난수 (스프라이트/이름 생성용)
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  OF.num = { fmt, fmtInt, fmtMult, fmtTime, fmtPct, fin, log10, pow10, clamp, geoSum, geoMaxAfford,
    hashStr, rng, setNotation, getNotation, MAX, KR_UNITS };
})();
