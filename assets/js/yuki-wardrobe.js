/* Yuki's wardrobe: accessories drawn in SVG and anchored to her head in every frame, plus the
   outfit registry. Outfits are full sprite sheets built by tools/build_yuki_assets.py into
   assets/lab/yuki/outfits/<id>/ and listed in assets/lab/yuki/outfits.json. */
(() => {
  'use strict';
  // w: width in head widths · ax/ay: point of the drawing that sits on the anchor (0..1)
  // dx/dy: offset from the crown in head widths · rot: tilt in degrees
  const A = {
    bunnyears: {w: 1.1, ax: .5, ay: .9, name: {en: 'Bunny ears', 'zh-TW': '兔耳髮箍', 'zh-CN': '兔耳发箍'},
      svg: '<svg viewBox="0 0 100 80"><path d="M14 74q36-22 72 0" stroke="#f7a8c4" stroke-width="7" fill="none" stroke-linecap="round"/><g transform="rotate(-14 34 60)"><ellipse cx="34" cy="32" rx="11" ry="30" fill="#fff" stroke="#e8dff0" stroke-width="2"/><ellipse cx="34" cy="34" rx="5" ry="22" fill="#ffc2d6"/></g><g transform="rotate(12 66 60)"><ellipse cx="66" cy="30" rx="11" ry="30" fill="#fff" stroke="#e8dff0" stroke-width="2"/><ellipse cx="66" cy="32" rx="5" ry="22" fill="#ffc2d6"/></g></svg>'},
    gradcap: {w: .95, ax: .5, ay: .78, rot: -8, name: {en: 'Graduation cap', 'zh-TW': '學士帽', 'zh-CN': '学士帽'},
      svg: '<svg viewBox="0 0 100 70"><path d="M26 34v18q24 12 48 0V34z" fill="#2d2a4a"/><path d="M50 8 96 28 50 46 4 28z" fill="#3b3761"/><path d="M50 8 96 28 50 46 4 28z" fill="none" stroke="#56518a" stroke-width="2"/><circle cx="50" cy="27" r="3" fill="#ffd166"/><path d="M50 27 84 36v18" stroke="#ffd166" stroke-width="2.5" fill="none"/><path d="M80 54h8l-2 10h-4z" fill="#ffd166"/></svg>'},
    crown: {w: .62, ax: .5, ay: .95, name: {en: 'Paper crown', 'zh-TW': '紙皇冠', 'zh-CN': '纸皇冠'},
      svg: '<svg viewBox="0 0 100 60"><path d="M8 56V16l20 18 22-28 22 28 20-18v40z" fill="#ffd166" stroke="#f0a92a" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="40" r="6" fill="#ff8fbf"/><circle cx="26" cy="44" r="4" fill="#8fd3ff"/><circle cx="74" cy="44" r="4" fill="#8fd3ff"/></svg>'},
    flower: {w: .36, ax: .5, ay: .5, dx: .3, dy: .16, name: {en: 'Plum blossom pin', 'zh-TW': '梅花髮飾', 'zh-CN': '梅花发饰'},
      svg: '<svg viewBox="0 0 60 60"><g fill="#ff5d73">' + [0, 72, 144, 216, 288].map(a => `<circle cx="30" cy="16" r="11" transform="rotate(${a} 30 30)"/>`).join('') + '</g><circle cx="30" cy="30" r="8" fill="#ffd166"/><path d="M50 50l8 8" stroke="#e63946" stroke-width="3"/></svg>'},
    lanternpin: {w: .3, ax: .5, ay: .2, dx: .32, dy: .1, name: {en: 'Lantern charm', 'zh-TW': '燈籠髮飾', 'zh-CN': '灯笼发饰'},
      svg: '<svg viewBox="0 0 40 70"><path d="M20 0v8" stroke="#b33" stroke-width="2"/><ellipse cx="20" cy="30" rx="16" ry="18" fill="#ff4d4d"/><path d="M10 12h20M10 48h20" stroke="#ffcc4d" stroke-width="5"/><path d="M20 48v16" stroke="#ffcc4d" stroke-width="3"/></svg>'},
    heartclip: {w: .3, ax: .5, ay: .5, dx: .32, dy: .14, rot: 12, name: {en: 'Heart clip', 'zh-TW': '愛心髮夾', 'zh-CN': '爱心发夹'},
      svg: '<svg viewBox="0 0 24 22"><path d="M12 21 10.6 19.7C5.4 15.1 2 12 2 8.2 2 5.1 4.4 2.7 7.5 2.7c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.6 11.5z" fill="#ff5d8f" stroke="#fff" stroke-width="1"/><ellipse cx="8" cy="7.5" rx="2" ry="1.3" fill="#fff" opacity=".7"/></svg>'},
    lily: {w: .38, ax: .5, ay: .6, dx: .3, dy: .14, name: {en: 'White lily', 'zh-TW': '白百合', 'zh-CN': '白百合'},
      svg: '<svg viewBox="0 0 24 24"><path d="M12 13c-4-1-6-5-5-8 2 1 4 3 5 5 1-2 3-4 5-5 1 3-1 7-5 8z" fill="#fff" stroke="#d8cdea" stroke-width=".8"/><path d="M12 13c-3 0-6 1-8 4 3 0 6 0 8-4zM12 13c3 0 6 1 8 4-3 0-6 0-8-4z" fill="#f4f0fb" stroke="#d8cdea" stroke-width=".6"/><circle cx="12" cy="11" r="1" fill="#ffd166"/></svg>'},
    flowercrown: {w: 1.08, ax: .5, ay: .62, name: {en: 'Flower crown', 'zh-TW': '花環', 'zh-CN': '花环'},
      svg: '<svg viewBox="0 0 100 40"><path d="M6 26q44-26 88 0" stroke="#7bd389" stroke-width="5" fill="none"/>' + [[10, 26, '#ffb3c6'], [26, 16, '#fff3b0'], [42, 11, '#cdb4ff'], [58, 11, '#ffb3c6'], [74, 16, '#a0e7e5'], [90, 26, '#fff3b0']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><g fill="${c}">${[0, 90, 180, 270].map(a => `<circle cx="0" cy="-5" r="4.5" transform="rotate(${a})"/>`).join('')}</g><circle r="3" fill="#ffd166"/></g>`).join('') + '</svg>'},
    headphones: {w: 1.2, ax: .5, ay: .22, dy: .06, name: {en: 'Headphones', 'zh-TW': '耳機', 'zh-CN': '耳机'},
      svg: '<svg viewBox="0 0 100 90"><path d="M12 62V44a38 38 0 0 1 76 0v18" stroke="#6b5fd8" stroke-width="7" fill="none"/><rect x="2" y="52" width="20" height="30" rx="9" fill="#9b8cff"/><rect x="78" y="52" width="20" height="30" rx="9" fill="#9b8cff"/><circle cx="12" cy="67" r="4" fill="#ffd6ea"/><circle cx="88" cy="67" r="4" fill="#ffd6ea"/></svg>'},
    sachet: {w: .3, ax: .5, ay: .1, dx: .34, dy: .12, name: {en: 'Fragrant sachet', 'zh-TW': '香包', 'zh-CN': '香包'},
      svg: '<svg viewBox="0 0 40 70"><path d="M20 0v10" stroke="#e63946" stroke-width="2"/><path d="M6 20q14-14 28 0l-4 26q-10 8-20 0z" fill="#ff8fa3" stroke="#e63946" stroke-width="2"/><path d="M12 28h16" stroke="#ffd166" stroke-width="3"/><path d="M16 50l-2 16M24 50l2 16M20 50v18" stroke="#e63946" stroke-width="2"/></svg>'},
    starpin: {w: .3, ax: .5, ay: .5, dx: .3, dy: .1, rot: 14, name: {en: 'Star hairpin', 'zh-TW': '星星髮夾', 'zh-CN': '星星发夹'},
      svg: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="#ffd166" stroke="#f0a92a" stroke-width="1"/></svg>'},
    ribbon: {w: .5, ax: .5, ay: .6, dx: .22, dy: .02, rot: 10, name: {en: 'Big ribbon', 'zh-TW': '大蝴蝶結', 'zh-CN': '大蝴蝶结'},
      svg: '<svg viewBox="0 0 60 40"><path d="M30 20 4 4v32zM30 20 56 4v32z" fill="#ff6b8b" stroke="#e0476b" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="20" r="6" fill="#e0476b"/></svg>'},
    witchhat: {w: 1.25, ax: .5, ay: .9, rot: -6, name: {en: 'Witch hat', 'zh-TW': '魔女帽', 'zh-CN': '魔女帽'},
      svg: '<svg viewBox="0 0 100 90"><path d="M50 2q14 30 22 64H28Q38 30 50 2z" fill="#4a3f6b"/><path d="M50 2q10 4 20 16" stroke="#4a3f6b" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="72" rx="48" ry="12" fill="#3a3157"/><path d="M28 62h44v7H28z" fill="#ff9f43"/><path d="M60 20l3 5 5 1-4 3 1 5-5-3-5 3 1-5-4-3 5-1z" fill="#ffd166"/></svg>'},
    santahat: {w: 1.15, ax: .5, ay: .86, rot: -8, name: {en: 'Santa hat', 'zh-TW': '聖誕帽', 'zh-CN': '圣诞帽'},
      svg: '<svg viewBox="0 0 100 80"><path d="M14 64Q30 10 64 8q20 0 26 28-10-10-18-8 6 18 10 36z" fill="#e63946"/><rect x="8" y="58" width="84" height="16" rx="8" fill="#fff"/><circle cx="90" cy="38" r="9" fill="#fff"/></svg>'}
  };

  let outfits = [{id: 'hoodie', name: {en: 'Lilac hoodie', 'zh-TW': '紫色連帽外套', 'zh-CN': '紫色连帽外套'}, sheet: '/assets/lab/yuki/', thumb: 'heads.webp'}];
  const ready = fetch('/assets/lab/yuki/outfits.json').then(r => r.ok ? r.json() : []).then(list => {
    if (Array.isArray(list) && list.length) outfits = outfits.concat(list.filter(o => o.id !== 'hoodie'));
    return outfits;
  }).catch(() => outfits);

  function render(id) {
    const item = A[id];
    return item ? {html: item.svg, ...item} : null;
  }
  window.YukiWardrobe = {accessories: A, render, outfits: () => outfits, ready};
})();
