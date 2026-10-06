/* 생김새가 겹치지 않게 — 사람마다 다른 얼굴
   예전: 마을 사람 · 길손 · 가게 주인 · 기사 · 아이들이 「농부」 「상인」 「아이」 같은 틀(G.cast.folk) 스물네 개를 그대로 써서,
         레드의 떠돌이 상인 · 옐로의 향신료 상인 · 단풍 협곡의 장터 상인 · 설원 상점 주인이 모두 같은 사람처럼 보였다(이름이 다른 213명이 생김새 128가지를 나눠 썼다).
   이제: 이야기 인물(G.cast)은 그대로 두되 서로 겹치면 뒤의 사람 옷빛을 바꾸고,
         나머지 모든 사람은 「누구인가」마다 머리 모양 · 머리 색 · 옷 색(지역 빛깔 쪽으로) · 아랫도리 · 테두리 · 눈 · 피부 · 장신구를 정해 준다 — 한 번 정하면 늘 같다.
         틀 그대로인 「역할」은 지도 · 자리마다(장면에 불려 나온 사람은 이름 · 지역 · 몇 번째) 다른 사람,
         틀에 손을 댄 「그 사람」은 이름 + 차림이 같으면 어디서든 같은 얼굴(손수 정한 생김새는 안 겹치면 그대로).
         역할을 알아보게 하는 것(성별 · 나이 · 옷 모양 · 모자 종류 · 갑옷 · 수녀 두건 · 망토 · 가면 · 들고 있는 물건)은 그대로 둔다.
   「눈에 보이는 생김새」(색은 색상 30° · 밝기 세 단계 덩어리로)가 이미 다른 사람 것이면 다시 고른다 — 주인공 · 이야기 인물과도 겹치지 않는다.
   같은 사람은 지역이 바뀌어도 같다(이야기 인물 · 마을 주민 id). 장면 속 대사 얼굴(초상)도 같은 생김새로 그려진다. */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story, OW = G.ow;
  const TS = G.tiles.TS;
  const W = () => G.world;

  /* ═════════ 눈에 보이는 생김새 (지문) ═════════ */
  function hslB(c) {
    if (!c || typeof c !== 'string' || c[0] !== '#') return String(c);
    const n = parseInt(c.slice(1, 7), 16), R = (n >> 16 & 255) / 255, Gc = (n >> 8 & 255) / 255, B = (n & 255) / 255;
    const mx = Math.max(R, Gc, B), mn = Math.min(R, Gc, B), l = (mx + mn) / 2, d = mx - mn;
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0; if (d) { if (mx === R) h = ((Gc - B) / d) % 6; else if (mx === Gc) h = (B - R) / d + 2; else h = (R - Gc) / d + 4; h *= 60; if (h < 0) h += 360; }
    const L = l < 0.32 ? 'd' : l < 0.68 ? 'm' : 'l';
    return sat < 0.2 ? 'g' + L : (Math.round(h / 30) % 12) + L;
  }
  const DEF = { gender: 'boy', age: 'teen', skin: 'light', hair: 'short', hc: '#5a3a28', top: 'tunic', tc: '#3aa84a', bottom: 'pants', bc: '#6a5a44', hat: null, acc: [], glasses: false, beard: null, cape: null, mask: false };
  function sig(L0) {
    const L = Object.assign({}, DEF, L0 || {});
    if (L.kind) return 'beast:' + L.kind;
    // 투구 · 두건 · 수녀 두건은 머리를 덮는다 — 머리 모양 · 머리 색이 달라도 겉으로는 같아 보이니 지문에서 뺀다 (갑옷 빛 · 깃털 · 망토로 갈라야 한다)
    const covered = L.hat === 'helm' || L.hat === 'hood' || L.hat === 'veil';
    return [L.gender, L.age, L.skin, covered ? '' : L.hair, covered || L.hair === 'bald' ? '' : hslB(L.hc), L.top, hslB(L.tc), L.bottom, hslB(L.bc), L.hat || '-', L.hat ? hslB(L.hatC || '#9a9ab8') : '',
      (L.acc || []).slice().sort().join('+'), L.beard ? 'b' : '', L.glasses ? 'gl' : '', L.cape ? 'cp' + hslB(L.cape) : '', L.mask ? 'mask' : '', L.hat === 'helm' && L.plume ? 'pl' + hslB(L.plume) : ''].join('|');
  }

  /* ═════════ 고를 것들 ═════════ */
  const HAIR = ['#1e1410', '#3a2416', '#5a3a22', '#7a4e2a', '#a0662e', '#c8904a', '#e0b870', '#f0dca8', '#2a2a3a', '#3a2a5a', '#6a4a9a', '#2a4a7a', '#4a7ab8', '#2a6a5a', '#5a9a5a', '#8a2a2a', '#c8402a', '#e8784a', '#d85a8a', '#f0a0c0', '#9a9496', '#5a5660'];
  const HAIR_OLD = ['#e8e4dc', '#c8c4c0', '#9a9496', '#d8d0c0', '#b8b0a8', '#f0ece4', '#8a8480', '#c8c0d0'];
  const CLOTH = ['#c84a3a', '#e8784a', '#e8b84a', '#c8c848', '#7ab84a', '#3a9a5a', '#3a9aa0', '#3a7ac8', '#4a5ab8', '#7a5ac8', '#a85aa8', '#c85a8a', '#8a5a3a', '#6a7a4a', '#5a6a8a', '#e8e0d0', '#9aa0a8', '#4a4a58', '#2a3a4a', '#a8c8e8', '#f0c8d8', '#c8e8b8', '#d8a060', '#6a3a5a'];
  const REG = {
    green: ['#5a9a4a', '#7ab84a', '#3a7a3a', '#8a9a4a', '#a8c870', '#6a8a5a', '#c8b070', '#8a6a3a', '#4a8a6a', '#b8d88a'],
    red: ['#c84a3a', '#a83a2a', '#e8784a', '#8a3a2a', '#d8a060', '#6a3a2a', '#e85a4a', '#b8603a', '#d8784a', '#f0a070'],
    blue: ['#3a7ac8', '#2a5a9a', '#3a9aa0', '#6aa8d8', '#2a3a6a', '#e8eef8', '#4a8ab0', '#1a6a8a', '#8ac8e8', '#5a7aa8'],
    yellow: ['#e8b84a', '#d89a2a', '#c8783a', '#e8d08a', '#a87a3a', '#e8a060', '#c8a040', '#f0c870', '#b8903a', '#d8c070'],
    purple: ['#7a5ac8', '#5a3a8a', '#a87ad8', '#8a4a9a', '#c8a0e0', '#4a3a6a', '#b85aa8', '#6a5a9a', '#9a6ab8', '#d8b8f0'],
    rainbow: ['#ff7a7a', '#ffb84a', '#e8e05a', '#6ae07a', '#5ab8ff', '#b87aff', '#ff8ad0', '#7ae8d8', '#ffa8a8', '#a8ffa8'],
    white: ['#e8eef8', '#c8d8e8', '#a8c0d8', '#d8e0e8', '#b8c8d8', '#8aa0b8', '#f0f0f4', '#c0c8d0', '#9ab8d8', '#e0e8f8'],
    gray: ['#7a7a84', '#5a5a64', '#9a9aa4', '#6a6a70', '#8a8a90', '#4a4a54', '#a8a8b0', '#707078', '#8a8478', '#6a7078'],
    black: ['#3a3450', '#2a2438', '#4a3a6a', '#5a4a7a', '#2a2a40', '#3a2a4a', '#4a4058', '#6a5a8a', '#3a3a5a', '#5a3a5a'],
    colorful: ['#ff8a5a', '#5ae8a8', '#5a5ae8', '#ffd84a', '#e85ad8', '#5ac8e8', '#a8e85a', '#ff5a7a', '#ffa83a', '#7a5aff'],
    mist: ['#6a8a8a', '#4a6a6a', '#8aa8a0', '#5a7a7a', '#a8c0b8', '#3a5a5a', '#7a9a90', '#9ab8b0', '#5a8a80', '#b8d0c8'],
    amber: ['#c8783a', '#a85a2a', '#e89a4a', '#8a4a2a', '#d8a860', '#b86a3a', '#e8c070', '#7a3a1a', '#d88a3a', '#f0b060'],
  };
  const BOT = ['#3a3a44', '#4a3a2a', '#2a3a5a', '#5a4a3a', '#3a4a3a', '#4a2a3a', '#2a2a32', '#6a5a44', '#3a2a4a', '#5a5a64', '#7a6a4a', '#2a4a4a', '#5a3a2a', '#3a3a5a'];
  const TRIM = ['#e8d8a8', '#f0e0b0', '#e8c860', '#c8c8d0', '#ffa87a', '#8ac8ff', '#b8f0a8', '#f0a8c8', '#ffffff', '#2a2a32', '#c8783a', '#b87aff'];
  const EYE = ['#4a7ad8', '#3aa86a', '#a86a3a', '#8a4ac8', '#c84a5a', '#3a8aa8', '#6a6a7a', '#d8a030', '#5a3a2a', '#2a5a9a'];
  const SKINS = ['light', 'fair', 'tan', 'light', 'brown', 'fair', 'deep', 'light'];
  // 갑옷 빛: 강철 · 무쇠 · 청동 · 금 · 푸른 강철 · 녹청 · 붉은 칠 · 검은 칠 · 흰 법랑 · 보랏빛 · 초록 칠 — 멀리서도 갈리게
  const METAL = ['#9aa0b0', '#4a4a58', '#b07a40', '#d0a840', '#4a6aa8', '#4a9a8a', '#a84a4a', '#3a3048', '#d8dce8', '#7a5aa8', '#4a7a4a', '#c8c8d0'];
  const PLUME = ['#e83a3a', '#3a7ae8', '#f4f4f0', '#e8c040', '#3aa85a', '#a85ad8', '#f08ab0', '#2a2a32', '#e87a2a', '#5ad8d8'];
  const CAPE = ['#7a2a3a', '#2a3a7a', '#2a5a3a', '#5a2a6a', '#8a6a2a', '#3a3a3a', '#a83a2a', '#2a6a7a', '#6a3a2a', '#4a4a7a', '#c8a040', '#e8e0d0'];
  const PALE = ['#e8eef8', '#f0e8e0', '#e0e8f0', '#e8e0f0', '#f4f4f0', '#d8e0e8'];
  const STRAW = ['#e8c878', '#d8b060', '#f0d890', '#c8a050', '#e0c090'];
  const STY = {
    boy: ['short', 'messy', 'spiky', 'slick', 'neat', 'side', 'buzz', 'wavy'], girl: ['long', 'bob', 'twin', 'pony', 'bun', 'braid', 'hime', 'wavy', 'side'],
    boyc: ['short', 'messy', 'spiky', 'buzz', 'side'], girlc: ['twin', 'bob', 'pony', 'braid', 'short'],
    boyo: ['bald', 'short', 'side', 'slick', 'buzz'], girlo: ['bun', 'bob', 'short', 'braid', 'long'],
  };
  const KEEP_ACC = ['book', 'staff', 'lute', 'quiver', 'sword', 'pauldron'];
  const DECO = ['scarf', 'earring', 'necklace', 'flower'];

  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

  /** 틀(base)을 바탕으로 이 사람의 생김새를 정한다. mode 'colors'는 이야기 인물: 머리는 두고 옷빛만 */
  function variant(base, key, salt, reg, mode) {
    const r = rng(hash(key + '#' + salt));
    const L = JSON.parse(JSON.stringify(base));
    const g = L.gender === 'girl' ? 'girl' : 'boy', age = L.age || 'teen';
    const pal = REG[reg] || null;
    const cloth = () => (pal && r() < 0.6 ? pick(r, pal) : pick(r, CLOTH));
    if (mode !== 'colors') {
      if (L.hair !== 'bald' || r() < 0.4) L.hair = pick(r, STY[g + (age === 'child' ? 'c' : age === 'old' ? 'o' : '')] || STY[g]);
      L.hc = age === 'old' ? pick(r, HAIR_OLD) : pick(r, HAIR);
      L.eye = pick(r, EYE);
      if (r() < 0.55) L.skin = pick(r, SKINS);
      if (g === 'boy' && age !== 'child') L.beard = (age === 'old' ? r() < 0.55 : r() < 0.15) ? (age === 'old' ? pick(r, HAIR_OLD) : L.hc) : null;
      if (age !== 'child') L.glasses = r() < 0.12 ? true : (base.glasses && r() < 0.6);
    }
    if (L.top === 'armor') { L.tc = pick(r, METAL); if (L.cape) L.cape = pal && r() < 0.4 ? pick(r, pal) : pick(r, CAPE); if (L.hat === 'helm') L.hatC = r() < 0.6 ? L.tc : pick(r, METAL); }
    else if (L.hat === 'veil') { L.tc = pick(r, PALE); L.hatC = L.tc; L.bc = pick(r, PALE); }
    else { L.tc = cloth(); if (L.cape) L.cape = pick(r, CAPE); }
    L.trim = pick(r, TRIM);
    if (L.hat !== 'veil') L.bc = pick(r, BOT);
    if (L.hat === 'straw') L.hatC = pick(r, STRAW);
    else if (L.hat && !['helm', 'veil', 'crown'].includes(L.hat)) L.hatC = cloth();
    else if (L.hat === 'helm' && L.top !== 'armor') L.hatC = pick(r, ['#e8c048', '#c8783a', '#9a9ab8', '#5a8a5a', '#c84a3a', '#4a7ab8']);
    if (L.hat === 'helm') L.plume = r() < 0.65 ? pick(r, PLUME) : null;   // 투구 꼭대기 깃털
    // 장신구: 들고 있는 물건(책 · 지팡이 · 류트 · 화살통 · 칼 · 어깨받이)은 두고, 꾸밈 하나를 고른다
    const keep = (L.acc || []).filter((a) => KEEP_ACC.includes(a));
    // 꾸밈: 투구 · 두건 · 수녀 두건을 쓴 사람은 머리 꾸밈(꽃 · 귀걸이) 없이, 꽃 머리핀은 여자 · 아이만 (예전엔 투구 위 · 짧은 머리 남자에게 「+」처럼 떠 있었다)
    const covered = L.hat === 'helm' || L.hat === 'hood' || L.hat === 'veil';
    const decos = DECO.filter((d) => !(covered && (d === 'flower' || d === 'earring')) && !(d === 'flower' && g !== 'girl' && age !== 'child'));
    const deco = r() < 0.45 ? pick(r, decos) : null;
    L.acc = deco ? keep.concat([deco]) : keep;
    if (deco === 'scarf') L.scarfC = cloth();
    if (deco === 'necklace') L.gem = pick(r, ['#6ae07a', '#5ab8ff', '#ff5a7a', '#ffd84a', '#b87aff', '#ffffff']);
    if (deco === 'flower') L.flowerC = pick(r, ['#ff8ad0', '#ffd84a', '#ffffff', '#ff7a5a', '#8ad0ff']);
    return L;
  }

  /* ═════════ 누가 어떤 생김새를 쓰나 ═════════ */
  const TAKEN = new Map();     // 지문 → 누구
  const BYKEY = new Map();     // 누구 → 생김새
  const RESOLVED = new WeakSet();
  const NAMEREG = new Map();   // 이름@지역 → 자리에 선 사람의 생김새 (장면에 같은 이름이 불려 나오면 같은 얼굴로)
  function claim(L, key) { const s = sig(L); TAKEN.set(s, key); BYKEY.set(key, L); RESOLVED.add(L); return L; }
  function resolve(base, key, reg, mode, keep) {
    if (BYKEY.has(key)) return BYKEY.get(key);
    if (!base || base.kind) return base;
    if (keep) { const s = sig(base); if (!TAKEN.has(s) || TAKEN.get(s) === key) return claim(JSON.parse(JSON.stringify(base)), key); }   // 손수 정한 생김새가 아무와도 안 겹치면 그대로
    for (let salt = 0; salt < 60; salt++) {
      const L = variant(base, key, salt, reg, salt > 30 && mode === 'colors' ? null : mode);
      const s = sig(L);
      if (!TAKEN.has(s) || TAKEN.get(s) === key) return claim(L, key);
    }
    return claim(variant(base, key, 99, reg, null), key);
  }

  /** 누구인가: 틀(G.cast.folk) 그대로인 사람은 「역할」(떠돌이 행상 · 마을 아이 · 징수 기사 …) — 자리 · 지역마다 다른 사람이다.
      틀에 손을 댄 사람(머리 색 · 옷 색을 따로 정한 사람)은 「그 사람」 — 이름이 같고 생김새가 같으면 어디서 만나도 같은 사람(양치기 핀이 집에서도 천년제에서도) */
  const PRESET = new Set(Object.keys(G.cast.FOLK).map((k) => sig(G.cast.folk(k))));
  const isRole = (base) => PRESET.has(sig(base));
  const personKey = (name, base) => 'n:' + (name || '?') + '|' + sig(base);
  // 같은 사람이 다른 차림으로(광부 루크가 투구를 벗고 집에) — 얼굴 · 머리는 그대로, 바뀐 차림만
  const PERSON = new Map();   // 이름 → { base, L }
  function samePerson(name, base, reg, nth) {
    if (nth) return resolve(base, personKey(name, base) + '#' + nth, reg, null);   // 같은 차림 · 같은 이름이 한자리에 둘 이상(천년성 기사 둘) — 서로 다른 사람
    const key = personKey(name, base);
    if (BYKEY.has(key)) return BYKEY.get(key);
    const p = name && PERSON.get(name);
    if (p) {
      const L = JSON.parse(JSON.stringify(p.L));
      for (const k of new Set([...Object.keys(p.base), ...Object.keys(base)])) if (JSON.stringify(p.base[k]) !== JSON.stringify(base[k])) { if (base[k] === undefined) delete L[k]; else L[k] = JSON.parse(JSON.stringify(base[k])); }
      const s = sig(L);
      if (!TAKEN.has(s) || TAKEN.get(s) === key) return claim(L, key);
    }
    const L = resolve(base, key, reg, null, true);
    if (name && !PERSON.has(name)) PERSON.set(name, { base, L });
    return L;
  }

  /* 1) 주인공(소년 · 소녀)과 이야기 인물 — 먼저 자리를 차지한다. 이야기 인물끼리 겹치면 뒤의 사람 옷빛을 바꾼다 */
  for (const gd of ['boy', 'girl']) { try { const L = ST.heroLook({ gender: gd, flags: {}, equip: {} }); TAKEN.set(sig(L), 'hero:' + gd); } catch (e) { /* 주인공 생김새를 못 읽었다 */ } }
  const CASTLOOK = new WeakSet();
  const PLACEHOLDER = [];   // 명부에 이름만 올리고 생김새는 틀(농부)을 빌린 사람 — 결말의 「그 뒤」에 나오는 마을 주민 넷. 대륙을 지은 뒤 그 주민의 생김새로
  const FARMER = sig(G.cast.folk('farmer'));
  for (const c of Object.values(G.cast.C)) {
    if (!c.look) continue;
    if (c.look.kind) { CASTLOOK.add(c.look); continue; }
    if (sig(c.look) === FARMER && c.id !== 'farmer') { PLACEHOLDER.push(c); CASTLOOK.add(c.look); continue; }
    const s = sig(c.look), owner = TAKEN.get(s);
    if (owner && owner !== 'cast:' + c.id) {
      const L = resolve(c.look, 'cast:' + c.id, null, 'colors');
      Object.keys(c.look).forEach((k) => delete c.look[k]); Object.assign(c.look, L);   // 같은 객체를 고쳐서, 이미 이 생김새를 들고 있는 곳도 함께 바뀐다
    } else TAKEN.set(s, 'cast:' + c.id);
    CASTLOOK.add(c.look);
  }

  /* 2) 자리에 선 사람(ST.person · ST.folk): 그 지도 · 그 사람마다 */
  const ROOMREG = {};
  const house0 = ST.house;
  ST.house = function (m, o) { if (o && o.id && o.region) ROOMREG[o.id] = o.region; return house0.apply(this, arguments); };
  function regionOfMap(mid, sp) {
    if (mid === 'world') { let pos = [sp.x, sp.y]; try { if (typeof sp.at === 'function') pos = sp.at(G.state); } catch (e) { /* 자리를 못 읽었다 */ } return pos && pos[0] != null ? OW.regionOf(pos[0] | 0, pos[1] | 0) : null; }
    const b = G.build.built[mid]; return (b && b.palName) || ROOMREG[mid] || null;
  }
  function wrapSpec(mid, sp, idx) {
    if (sp.__looks) return; sp.__looks = true;
    let raw = sp.look;
    Object.defineProperty(sp, '__raw', { configurable: true, enumerable: false, get() { return raw; } });
    Object.defineProperty(sp, 'look', {
      configurable: true, enumerable: true,
      get() {
        const cast = sp.id && G.cast.get(sp.id);
        if (cast && (!raw || raw === cast.look)) return raw;   // 이야기 인물: 명부의 생김새 그대로
        if (raw && raw.kind) return raw;
        if (sp.__lk && BYKEY.has(sp.__lk)) return BYKEY.get(sp.__lk);
        const base = raw || (cast && cast.look) || G.cast.folk(sp.folk || 'farmer');
        const reg = regionOfMap(mid, sp);
        const key = cast ? 'cast:' + sp.id : !isRole(base) ? personKey(sp.name, base) : 'p:' + mid + ':' + idx + ':' + (sp.name || '');
        let nth = 0;
        if (!cast && !isRole(base)) { const list = ST.people[mid] || []; for (let j = 0; j < idx; j++) { const o = list[j]; if (o && o.name === sp.name && !(o.id && G.cast.get(o.id)) && o.__raw && sig(o.__raw) === sig(base)) nth++; } }
        const L = !cast && !isRole(base) ? samePerson(sp.name, base, reg, nth) : resolve(base, key, reg, cast ? 'colors' : null);
        sp.__lk = nth ? key + '#' + nth : key;
        if (sp.name && reg && !NAMEREG.has(sp.name + '@' + reg)) NAMEREG.set(sp.name + '@' + reg, L);
        return L;
      },
      set(v) { raw = v; if (sp.__lk) { BYKEY.delete(sp.__lk); sp.__lk = null; } },
    });
  }
  function wrapAll() { for (const mid of Object.keys(ST.people).sort()) ST.people[mid].forEach((sp, i) => wrapSpec(mid, sp, i)); }
  wrapAll();
  const person0 = ST.person;
  ST.person = function (mapId, spec) { const r = person0.apply(this, arguments); const list = ST.people[mapId] || []; wrapSpec(mapId, list[list.length - 1], list.length - 1); return r; };
  // 대륙을 다 지은 뒤 한 번, 정해진 차례(지도 이름 · 등록 순서)로 모두의 생김새를 미리 정한다 — 어느 길로 다니든 같은 사람은 같은 얼굴
  OW.hooks.push(() => {
    wrapAll();
    for (const mid of Object.keys(ST.people).sort()) for (const sp of ST.people[mid]) { try { void sp.look; } catch (e) { /* 정하지 못한 사람은 만날 때 */ } }
    for (const c of PLACEHOLDER) {
      let L = null;
      for (const mid of Object.keys(ST.people).sort()) { const sp = ST.people[mid].find((x) => x.name === c.name && !(x.id && G.cast.get(x.id))); if (sp) { L = sp.look; break; } }
      if (!L) L = resolve(G.cast.folk('farmer'), 'cast:' + c.id, null, null);
      Object.keys(c.look).forEach((k) => delete c.look[k]); Object.assign(c.look, JSON.parse(JSON.stringify(L)));
    }
  });

  /* 3) 장면 · 길가에 불려 나온 사람: 이름 · 지역 · 몇 번째 */
  const NPC0 = G.props.NPC;
  class NPC extends NPC0 {
    constructor(o) {
      super(o);
      try { personalize(this, o || {}); } catch (e) { /* 생김새는 그대로 */ }
    }
  }
  function personalize(n, o) {
    const L0 = n.look;
    if (!L0 || L0.kind || RESOLVED.has(L0) || CASTLOOK.has(L0) || !Object.keys(L0).length) return;
    if (o.cid && G.cast.get(o.cid)) return;          // 이야기 인물(옷을 갈아입은 장면이라도 그대로)
    const m = W() && W().map; if (!m) return;
    const reg = m.overworld ? OW.regionOf(Math.floor(n.x / TS), Math.floor(n.y / TS)) : (m.palName || ROOMREG[m.id] || null);
    if (!isRole(L0)) {   // 그 사람: 어디서나 같은 얼굴 — 같은 차림 · 같은 이름이 지금 이 지도에 또 있으면 다른 사람
      const pk = personKey(n.name, L0); let k = 0;
      for (const e of W().ents) if (e !== n && !e.dead && e._pk === pk) k++;
      n._pk = pk; n.look = samePerson(n.name, L0, reg, k); n.sheet = null; return;
    }
    const base = 'd:' + (n.name || '?') + '@' + (reg || m.id);
    let k = 0; for (const e of W().ents) if (e !== n && !e.dead && e._lookBase === base) k++;
    n._lookBase = base;
    if (k === 0 && n.name && NAMEREG.has(n.name + '@' + reg)) { n.look = NAMEREG.get(n.name + '@' + reg); n.sheet = null; return; }
    n.look = resolve(L0, base + '#' + k, reg, null); n.sheet = null;
  }
  G.props.NPC = NPC;

  G.looks = { sig, variant, resolve, TAKEN, BYKEY, NAMEREG, hslB };
})();
