/* 목소리: 사람마다 제 이야기를 더 한다
   · 처음 만나면 그 사람의 생김새 · 버릇을 한 줄 그린다 (묘사)
   · 그 장의 첫 대화는 이야기 그대로. 다시 말을 걸면 번갈아: 그 사람만의 말(장 · 밤 · 굳은 갈래 · 깃발에 따라) ↔ 원래 말(52_talk의 지금의 나 말 포함)
   · 가게 · 여관 · 대장간 주인은 고르기에 「이야기를 나눈다」가 늘어난다 (사고 쉬는 일은 그대로)
   · 부탁 표시(! ?)가 떠 있는 사람은 늘 원래 말 — 부탁이 밀리지 않게
   말 바구니는 54a~54d (지역마다)에서 ST.voice(이름, { desc, more: { c1: [...], c4: [...] }, night, route, when }) 로 채운다.
   말 한 줄: 'a||b'는 말풍선 둘, '> '로 시작하면 서술(묘사). */
(function () {
  'use strict';
  const G = globalThis.G;
  const U = G.u;
  const ST = G.story;
  const S = () => G.state;
  const ORD = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12'];
  const chi = () => ORD.indexOf(S().ch || 'c1');

  const VO = {};
  /** 이름(지도 위에 보이는 이름) 하나 또는 여럿에 말 바구니를 붙인다. 같은 이름에 여러 번 부르면 합친다 */
  ST.voice = function (names, spec) {
    for (const nm of [].concat(names)) {
      const v = VO[nm] || (VO[nm] = { more: {}, when: [] });
      if (spec.desc) v.desc = spec.desc;
      for (const [k, L] of Object.entries(spec.more || {})) v.more[k] = (v.more[k] || []).concat(L);
      if (spec.night) v.night = (v.night || []).concat(spec.night);
      if (spec.route) { v.route = v.route || {}; for (const [k, L] of Object.entries(spec.route)) v.route[k] = (v.route[k] || []).concat(L); }
      if (spec.when) v.when = v.when.concat(spec.when);
      if (spec.mode) v.mode = spec.mode;
    }
  };
  ST.voices = VO;
  ST.voicePool = (name) => (VO[name] ? pool(VO[name]) : []);

  const nightK = () => (ST.nightFactor ? ST.nightFactor() : 0);
  /** 지금 이 사람이 할 수 있는 말 */
  function pool(v) {
    const s = S(), cur = chi(), out = [];
    // 지금 장에 가장 가까운 묶음, 그다음 바로 앞 묶음 (앞 묶음은 지금 말을 다 한 뒤에)
    const keys = Object.keys(v.more).filter((k) => { const i = ORD.indexOf(k); return i >= 0 && i <= cur; }).sort((a, b) => ORD.indexOf(b) - ORD.indexOf(a));
    if (keys[0]) out.push(...v.more[keys[0]]);
    if (keys[1]) out.push(...v.more[keys[1]]);
    if (v.more.any) out.push(...v.more.any);
    if (v.night && nightK() > 0.55) out.push(...v.night);
    const rl = s.flags.route_lock; if (rl && v.route && v.route[rl]) out.push(...v.route[rl]);
    for (const [cond, L] of v.when) { try { if (cond(s)) out.push(...[].concat(L)); } catch (e) { /* 깃발 확인 실패는 넘어간다 */ } }
    return out.map((l) => (typeof l === 'function' ? l(s) : l)).filter((l) => typeof l === 'string' && l);
  }
  /** 아직 안 한 말부터. 다 했으면 null (같은 말을 되풀이하지 않는다 — 부르는 쪽이 원래 말이나 지금의 나 말로 메운다) */
  function nextLine(name, v) {
    const L = pool(v); if (!L.length) return null;
    const s = S(); s.vseen = s.vseen || {}; s.vlast = s.vlast || {};
    const seen = s.vseen[name] || (s.vseen[name] = []);
    const h = (t) => U.hash(t) % 1000003;
    const pick = L.find((l) => !seen.includes(h(l)));
    if (pick == null) return null;
    seen.push(h(pick)); while (seen.length > 80) seen.shift();
    s.vlast[name] = h(pick);
    return pick;
  }
  /** 할 말을 다 했을 때: 52_talk의 지금의 나 말(시간 · 날씨 · 든 무기 · 지역 …), 없으면 했던 말 하나 */
  const TS = G.tiles.TS;
  function chatLine(name, v, n) {
    const l = nextLine(name, v); if (l) return l;
    const T = G.talk;
    if (T && T.pickLine) {
      const look = n && n.look, age = look && look.age === 'child' ? 'child' : look && look.age === 'old' ? 'old' : 'adult';
      const Wd = G.world, m = Wd.map, p = Wd.player;
      const reg = m && p ? (m.overworld && G.ow.regionOf ? G.ow.regionOf(Math.floor(p.x / TS), Math.floor(p.y / TS)) : m.palName) : null;
      const s = S(); const k = (s.vN && s.vN[name + ':' + (s.ch || 'c1')]) || 1;
      const g = T.pickLine('v:' + name, age, reg, k); if (g) return g;
    }
    const L = pool(v); return L.length ? U.pick(L) : null;
  }
  async function speak(c, n, line) {
    for (const part of String(line).split('||')) {
      const t = part.trim(); if (!t) continue;
      if (t.startsWith('> ')) await c.narr(t.slice(2));
      else await c.say(n, t);
    }
  }
  ST.voiceSay = async function (c, n, name) { const v = VO[name]; const l = v && chatLine(name, v, n); if (l) { await speak(c, n, l); return true; } return false; };

  /* ───────── 말 걸기 감싸기 ───────── */
  const SERVICE = /(물건을 산다|산다|쉰다|쉬어|벼린|두드린|구경한다|거래|맡긴다|고친다)/;
  const LEAVE = /^(괜찮|그만|됐|나중|다음에|돌아간|떠난|안녕|가 볼게|볼일)/;
  const TALKY = /(이야기|소문|얘기)/;
  const markOn = (n) => { try { return !!(n.mark && n.mark()); } catch (e) { return false; } };
  async function voiced(c, n, orig, v, name) {
    const s = S(); s.vN = s.vN || {}; s.vk = s.vk || {};
    const key = name + ':' + (s.ch || 'c1');
    const k = s.vN[key] = (s.vN[key] || 0) + 1;
    const busy = markOn(n);
    // 처음 만나면 한 줄 묘사
    const dkey = 'vd:' + name;
    let desc = v.desc && !s.flags[dkey] ? (typeof v.desc === 'function' ? v.desc(s) : v.desc) : null;
    if (desc) desc = String(desc).replace(/^>\s*/, '');
    if (desc && !busy) { s.flags[dkey] = 1; await c.narr(desc); }
    // 다시 만남 (54f_news): 오래 못 봤거나 그새 달라진 게 있으면 한마디 — 처음 묘사를 막 본 때 · 부탁이 걸린 때는 넘긴다
    if (ST.reunion) { const ru = ST.reunion(name, n); if (ru && !desc && !busy && v.mode !== 'append') await speak(c, n, ru); }
    // 가게 · 여관 주인: 고르기에 이야기 한 칸
    const ch0 = c.choice;
    let menu = false;
    c.choice = async function (prompt, opts, o) {
      if (!menu && Array.isArray(opts) && opts.length >= 2) {
        const list = opts.map((x, i) => (typeof x === 'string' ? { t: x, i } : Object.assign({ i }, x)));
        const shown = list.filter((x) => x.if == null || x.if);
        const li = shown.findIndex((x) => LEAVE.test(x.t));
        if (li >= 0 && shown.some((x) => SERVICE.test(x.t)) && pool(v).length) {
          menu = true; s.vk[name] = 1;
          const label = shown.some((x) => TALKY.test(x.t)) ? '잡담한다' : '이야기를 나눈다';
          const at = list.indexOf(shown[li]);
          const opts2 = list.slice(0, at).concat([{ t: label, i: -7707 }], list.slice(at));
          const r = await ch0.call(this, prompt, opts2, o);
          if (r === -7707) { const l = (ST.newsFor && ST.newsFor(name, n, 'any')) || chatLine(name, v, n); if (l) await speak(c, n, l); return shown[li].i; }
          return r;
        }
      }
      return ch0.apply(this, arguments);
    };
    const svc = {}; for (const m of ['shop', 'rest', 'forge']) { svc[m] = c[m]; if (typeof c[m] === 'function') c[m] = function () { s.vk[name] = 1; return svc[m].apply(this, arguments); }; }
    try {
      // 그 장의 첫 대화 · 부탁 표시 · 가게 주인은 원래 말 그대로 (가게 주인은 고르기에 이야기가 늘었다)
      if (v.mode === 'append') {
        // 이야기 인물: 원래 말은 늘 그대로, 두 번째부터 한마디 덧붙인다
        await orig(c, n);
        if (k >= 2 && !busy && !menu) { const l = nextLine(name, v); if (l) await speak(c, n, l); }
      } else if (k === 1 || busy || s.vk[name] || k % 2 === 1) {
        await orig(c, n);
        // 갓 들은 소식은 원래 말 끝에 덧붙인다 (부탁 · 가게 일이 없을 때)
        if (!busy && !menu && !s.vk[name] && ST.newsFor) { const nl = ST.newsFor(name, n, 'fresh'); if (nl) await speak(c, n, (/^[…「'"]/.test(nl) ? '' : ['참, ', '아, 그러고 보니 ', '그건 그렇고, ', ''][U.hash(name + nl) % 4]) + nl); }
      } else {
        // 제 말 자리: 네 번에 한 번은 지난 일 이야기, 제 말을 다 했으면 소식으로 메운다
        let l = k % 4 === 0 && ST.newsFor ? ST.newsFor(name, n, 'any') : null;
        if (!l) l = nextLine(name, v);
        if (!l && ST.newsFor) l = ST.newsFor(name, n, 'any');
        if (l) await speak(c, n, l); else await orig(c, n);
      }
    } finally {
      c.choice = ch0; for (const m of Object.keys(svc)) c[m] = svc[m];
    }
    if (desc && busy && !s.flags[dkey]) { s.flags[dkey] = 1; await c.narr(desc); }
  }
  const NPC = G.props.NPC;
  const use0 = NPC.prototype.use;
  NPC.prototype.use = function (p) {
    const name = this.name, v = name && VO[name];
    if (!v || this.follower || !this.talk || this.voiceOff) return use0.call(this, p);
    const orig = this.talk;
    this.talk = (c, n) => voiced(c, n, orig, v, name);
    try { return use0.call(this, p); } finally { this.talk = orig; }
  };
})();
