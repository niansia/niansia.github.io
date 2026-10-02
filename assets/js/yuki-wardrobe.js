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
    lily: {w: .5, ax: .5, ay: .6, dx: .3, dy: .12, name: {en: 'White lily', 'zh-TW': '白百合', 'zh-CN': '白百合'},
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

  /* Cat form wardrobe: a head piece and a neck piece, placed by yuki-cat.js wear() on every cat frame (head: the crown
     between the ears, tilted with the head; neck: the throat under the chin). Head pieces reuse the catgirl's drawings,
     sized for a cat's head; pins go by the left ear, since her own flower clip sits by the right one. Same keys as A. */
  const arc = (n, f) => [...Array(n)].map((_, i) => { const t = i / (n - 1); return f(5 * (1 - t) ** 2 + 100 * t * (1 - t) + 95 * t * t, 8 * (1 - t) ** 2 + 64 * t * (1 - t) + 8 * t * t, i); }).join('');
  const band = '<path d="M5 10Q50 36 95 10"';
  const bandana = (fill, edge, dots) => `<svg viewBox="0 0 100 74"><path d="M4 8Q50 26 96 8L58 64Q50 72 42 64z" fill="${fill}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/>${dots}</svg>`;
  const CAT_HEAD = {
    tophat: {w: .6, ax: .5, ay: .86, dx: -.04, rot: -10, name: {en: 'Top hat', 'zh-TW': '紳士禮帽', 'zh-CN': '绅士礼帽'},
      svg: '<svg viewBox="0 0 70 60"><ellipse cx="35" cy="50" rx="33" ry="8" fill="#2d2a4a"/><path d="M14 48V12q0-6 6-6h30q6 0 6 6v36q-21 8-42 0z" fill="#3b3761"/><path d="M14 36q21 7 42 0v8q-21 7-42 0z" fill="#b9a5f5"/><path d="M50 40l9-6v13z" fill="#9b85e8"/><ellipse cx="35" cy="8" rx="21" ry="4" fill="#56518a"/></svg>'},
    partyhat: {w: .46, ax: .5, ay: .9, rot: -12, name: {en: 'Party hat', 'zh-TW': '派對帽', 'zh-CN': '派对帽'},
      svg: '<svg viewBox="0 0 60 84"><path d="M30 12 52 74H8z" fill="#8fd3ff" stroke="#5fb4e8" stroke-width="2" stroke-linejoin="round"/><path d="M23.6 30h12.8l2.1 6h-17zM17.2 48h25.6l2.1 6H15.1zM11.5 64h37l2.1 6H9.4z" fill="#fff"/><g fill="#ffd166"><circle cx="30" cy="42" r="2.4"/><circle cx="24" cy="59" r="2.4"/><circle cx="37" cy="59" r="2.4"/></g><path d="M6 74q24 8 48 0" stroke="#ff8fbf" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="30" cy="10" r="8" fill="#ff8fbf"/></svg>'},
    crown: {w: .52, ay: .92}, gradcap: {w: .78, rot: -10}, witchhat: {w: .95}, santahat: {w: .88}, bunnyears: {w: .82},
    flowercrown: {w: .92, ay: .7}, ribbon: {w: .42, dx: -.3, dy: .1, rot: -16},
    flower: {w: .3, dx: -.32, dy: .12}, heartclip: {w: .26, dx: -.32, dy: .1, rot: -12}, starpin: {w: .26, dx: -.32, dy: .1, rot: -10},
    lily: {w: .4, dx: -.32, dy: .1}, lanternpin: {w: .24, dx: -.34, dy: .04}
  };
  const CAT_NECK = {
    bell: {w: .78, ax: .5, ay: .38, name: {en: 'Bell collar', 'zh-TW': '鈴鐺項圈', 'zh-CN': '铃铛项圈'},
      svg: `<svg viewBox="0 0 100 60">${band} stroke="#a78bfa" stroke-width="10" fill="none" stroke-linecap="round"/>${band} stroke="#d9ccff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M50 23v6" stroke="#c99a1e" stroke-width="3"/><circle cx="50" cy="40" r="12" fill="#ffd166" stroke="#d9a21c" stroke-width="2"/><path d="M38.5 38h23" stroke="#d9a21c" stroke-width="2"/><circle cx="50" cy="45" r="2.6" fill="#9a6b07"/><path d="M50 47v4" stroke="#9a6b07" stroke-width="2" stroke-linecap="round"/><ellipse cx="45" cy="34" rx="3.5" ry="2.2" fill="#fff" opacity=".75"/></svg>`},
    bowtie: {w: .46, ax: .5, ay: .45, dy: .06, name: {en: 'Bow tie', 'zh-TW': '領結', 'zh-CN': '领结'},
      svg: '<svg viewBox="0 0 64 36"><path d="M32 18C24 8 12 1 6 5S1 27 6 31 24 28 32 18zM32 18C40 8 52 1 58 5S63 27 58 31 40 28 32 18z" fill="#3b3761"/><g fill="#b9a5f5"><circle cx="13" cy="12" r="2"/><circle cx="12" cy="23" r="2"/><circle cx="20" cy="18" r="2"/><circle cx="51" cy="12" r="2"/><circle cx="52" cy="23" r="2"/><circle cx="44" cy="18" r="2"/></g><rect x="26" y="11" width="12" height="14" rx="4" fill="#56518a"/></svg>'},
    bandana: {w: .8, ax: .5, ay: .22, name: {en: 'Bandana', 'zh-TW': '三角領巾', 'zh-CN': '三角领巾'},
      svg: bandana('#b9a5f5', '#9b85e8', '<g fill="#fff" opacity=".85"><circle cx="30" cy="20" r="2.6"/><circle cx="50" cy="24" r="2.6"/><circle cx="70" cy="20" r="2.6"/><circle cx="40" cy="36" r="2.6"/><circle cx="60" cy="36" r="2.6"/><circle cx="50" cy="50" r="2.6"/></g>')},
    scarf: {w: .86, ax: .5, ay: .3, name: {en: 'Knitted scarf', 'zh-TW': '毛線圍巾', 'zh-CN': '毛线围巾'},
      svg: '<svg viewBox="0 0 100 86"><path d="M6 8Q50 30 94 8l2 14Q50 46 4 22z" fill="#e63946"/><path d="M5 15Q50 38 95 15" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="6 5"/><path d="M60 26l12-2 6 50-14 3z" fill="#d62f3c"/><path d="M62 40l12-2M64 54l12-2" stroke="#fff" stroke-width="3"/><path d="M65 77v6M69 76v6M73 75v6M77 75v5" stroke="#d62f3c" stroke-width="2.4" stroke-linecap="round"/></svg>'},
    pearls: {w: .72, ax: .5, ay: .42, name: {en: 'Pearl necklace', 'zh-TW': '珍珠項鍊', 'zh-CN': '珍珠项链'},
      svg: `<svg viewBox="0 0 100 52">${arc(13, (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="#efe6ff" stroke="#9f88e0" stroke-width="1.3"/>`)}<path d="M50 38c-5-6-11-1-7 4l7 7 7-7c4-5-2-10-7-4z" fill="#ff8fbf" stroke="#fff" stroke-width="1.2"/></svg>`},
    lucky: {w: .84, ax: .5, ay: .33, name: {en: 'Lucky-cat collar', 'zh-TW': '招財貓項圈', 'zh-CN': '招财猫项圈'},
      svg: `<svg viewBox="0 0 100 70">${band} stroke="#e63946" stroke-width="11" fill="none" stroke-linecap="round"/>${band} stroke="#ffd166" stroke-width="2" stroke-dasharray="1 5" fill="none" stroke-linecap="round"/><circle cx="50" cy="44" r="16" fill="#ffcf4a" stroke="#d9a21c" stroke-width="2.5"/><path d="M35 41h30M36 47h28" stroke="#d9a21c" stroke-width="2"/><circle cx="50" cy="52" r="3.2" fill="#9a6b07"/><path d="M50 55v5" stroke="#9a6b07" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="43" cy="36" rx="4.5" ry="2.8" fill="#fff" opacity=".75"/></svg>`},
    lei: {w: .84, ax: .5, ay: .42, name: {en: 'Flower garland', 'zh-TW': '花圈項鍊', 'zh-CN': '花圈项链'},
      svg: `<svg viewBox="0 0 100 50"><path d="M5 8Q50 32 95 8" stroke="#7bd389" stroke-width="3" fill="none"/>${arc(7, (x, y, i) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g fill="${['#ffb3c6', '#fff3b0', '#cdb4ff', '#a0e7e5'][i % 4]}">${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.6" r="4" transform="rotate(${a})"/>`).join('')}</g><circle r="2.6" fill="#ffd166"/></g>`)}</svg>`},
    sachet: {w: .7, ax: .5, ay: .2, name: {en: 'Sachet charm', 'zh-TW': '端午香包', 'zh-CN': '端午香包'},
      svg: '<svg viewBox="0 0 100 100"><path d="M8 6Q50 34 92 6" stroke="#e63946" stroke-width="2.5" fill="none"/><path d="M50 20v12" stroke="#e63946" stroke-width="2"/><path d="M36 42q14-14 28 0l-4 26q-10 8-20 0z" fill="#ff8fa3" stroke="#e63946" stroke-width="2"/><path d="M42 50h16" stroke="#ffd166" stroke-width="3"/><path d="M46 72l-2 16M54 72l2 16M50 72v18" stroke="#e63946" stroke-width="2"/></svg>'},
    spooky: {w: .8, ax: .5, ay: .22, name: {en: 'Halloween bandana', 'zh-TW': '萬聖領巾', 'zh-CN': '万圣领巾'},
      svg: bandana('#ff9f43', '#e8822a', '<g fill="#3a3157"><path d="M50 36c-3-4-8-5-12-3 3 1 4 3 4 5 2-1 4 0 5 2 1-2 2-3 3-3s2 1 3 3c1-2 3-3 5-2 0-2 1-4 4-5-4-2-9-1-12 3z"/><circle cx="30" cy="20" r="2.4"/><circle cx="70" cy="20" r="2.4"/><circle cx="50" cy="52" r="2.4"/></g>')}
  };
  const look = (head, neck, en, tw, cn, say) => ({head, neck, name: {en, 'zh-TW': tw, 'zh-CN': cn}, line: say});
  const CAT_LOOKS = {
    bell: look('', 'bell', 'Little bell', '鈴鐺小貓', '铃铛小猫', {en: 'Jingle jingle~ now you’ll always hear me coming.', 'zh-TW': '叮鈴叮鈴～聽到鈴聲就知道我來了。', 'zh-CN': '叮铃叮铃～听到铃声就知道我来了。'}),
    gentleman: look('tophat', 'bowtie', 'Gentlecat', '小紳士', '小绅士', {en: 'A gentlecat at your service, nya.', 'zh-TW': '在下是一隻紳士貓，喵。', 'zh-CN': '在下是一只绅士猫，喵。'}),
    scholar: look('gradcap', 'bandana', 'Scholar', '學霸貓', '学霸猫', {en: 'Studying for exams? I’ll keep you company, nya!', 'zh-TW': '考生們加油！本喵陪你們一起讀書。', 'zh-CN': '考生们加油！本喵陪你们一起读书。'}),
    lucky: look('', 'lucky', 'Lucky cat', '招財貓', '招财猫', {en: 'Paw up for good luck!', 'zh-TW': '招財進寶～舉起貓掌招好運！', 'zh-CN': '招财进宝～举起猫掌招好运！'}),
    princess: look('crown', 'pearls', 'Princess', '小公主', '小公主', {en: 'Her Majesty has arrived. Pats, please.', 'zh-TW': '本喵駕到，還不快摸摸？', 'zh-CN': '本喵驾到，还不快摸摸？'}),
    party: look('partyhat', 'bowtie', 'Party cat', '派對貓', '派对猫', {en: 'Party time! Where’s the cake?', 'zh-TW': '派對開始囉！蛋糕在哪裡？', 'zh-CN': '派对开始咯！蛋糕在哪里？'}),
    spring: look('flowercrown', 'lei', 'Blossom', '花漾', '花漾', {en: 'I smell like flowers~', 'zh-TW': '身上都是花香～', 'zh-CN': '身上都是花香～'}),
    moon: look('bunnyears', 'bell', 'Moon bunny', '月兔', '月兔', {en: 'I’m the moon rabbit… okay, a cat.', 'zh-TW': '我是月兔……好啦，其實是貓。', 'zh-CN': '我是月兔……好啦，其实是猫。'}),
    witch: look('witchhat', 'spooky', 'Little witch', '小魔女', '小魔女', {en: 'Trick or treat, nya!', 'zh-TW': '不給糖就搗蛋，喵！', 'zh-CN': '不给糖就捣蛋，喵！'}),
    xmas: look('santahat', 'scarf', 'Santa cat', '聖誕貓', '圣诞猫', {en: 'Merry Christmas! I was good this year.', 'zh-TW': '聖誕快樂！今年有乖乖喔。', 'zh-CN': '圣诞快乐！今年有乖乖哦。'})
  };
  // On a festival the cat dresses for it too: the catgirl's festival accessory -> the cat's head and neck pieces.
  const CAT_FESTIVAL = {crown: ['partyhat', 'bowtie'], flower: ['flower', 'lucky'], lanternpin: ['lanternpin', 'lucky'], heartclip: ['heartclip', 'bell'],
    lily: ['lily', 'pearls'], flowercrown: ['flowercrown', 'lei'], headphones: ['', 'bandana'], sachet: ['', 'sachet'], starpin: ['starpin', 'bell'],
    bunnyears: ['bunnyears', 'bell'], gradcap: ['gradcap', 'bandana'], ribbon: ['ribbon', 'bowtie'], witchhat: ['witchhat', 'spooky'], santahat: ['santahat', 'scarf']};
  const cat = {
    head: Object.fromEntries(Object.entries(CAT_HEAD).map(([id, o]) => [id, {ax: .5, ay: .9, ...A[id], ...o}])),
    neck: CAT_NECK, looks: CAT_LOOKS,
    festival: accessory => { const f = CAT_FESTIVAL[accessory]; return f ? {head: f[0], neck: f[1]} : null; }
  };
  window.YukiWardrobe = {accessories: A, render, outfits: () => outfits, ready, cat};
})();
