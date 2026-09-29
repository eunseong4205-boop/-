/* 이야기 뼈대: 주인공 모습 · 목표 · 적을 쓰러뜨렸을 때 · 렙업했을 때 · 밤낮 */
(function () {
  'use strict';
  const G = globalThis.G;
  const ST = G.story = G.story || {};

  /** 주인공 모습: 흰빛이 깨어나면 앞머리 한 가닥이 하얘진다 */
  ST.heroLook = function (s) {
    const girl = s.gender === 'girl';
    const f = s.flags || {};
    const look = girl
      ? { gender: 'girl', hair: 'pony', hc: '#6a4630', eye: '#3aa86a', eyeBig: true, top: 'tunic', tc: '#3a9a4a', trim: '#f0e6c8', bottom: 'skirt', bc: '#4a5a3a', boots: '#5a3a22', acc: ['scarf'], scarfC: '#f0e6c8', ribbon: '#f0e6c8' }
      : { gender: 'boy', hair: 'messy', hc: '#6a4630', eye: '#3aa86a', top: 'tunic', tc: '#3a9a4a', trim: '#f0e6c8', bottom: 'pants', bc: '#4a5a3a', boots: '#5a3a22', acc: ['scarf'], scarfC: '#f0e6c8', ahoge: true };
    if (f.white_hair) look.hc = girl ? '#8a6a58' : '#8a6a58';
    if (f.hero_share) { look.tc = '#4ab85a'; }
    if (s.equip && s.equip.armor === 'ar_knight') { look.top = 'armor'; look.tc = '#e8eef8'; look.trim = '#8ab8e8'; }
    if (s.equip && s.equip.armor === 'ar_heat') { look.tc = '#c85a3a'; look.trim = '#ffd84a'; }
    if (s.equip && s.equip.armor === 'ar_cold') { look.top = 'coat'; look.tc = '#e8eef8'; look.trim = '#8ab8e8'; }
    if (s.equip && s.equip.armor === 'ar_shadow') { look.top = 'coat'; look.tc = '#2a2440'; look.trim = '#b87aff'; look.cape = '#1a1626'; }
    if (s.equip && s.equip.armor === 'ar_star') { look.top = 'coat'; look.tc = '#f8f4e0'; look.trim = '#ffd84a'; look.cape = '#4a6ad8'; }
    if (s.equip && s.equip.armor === 'ar_leather') { look.tc = '#8a6a3a'; look.trim = '#e8d0a0'; }
    return look;
  };
  ST.goalText = ST.goalText || function () { return ''; };
  ST.goal = ST.goal || function () { return null; };
})();
