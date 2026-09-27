/* Taiwan holiday themes, Google-doodle style. Lunar dates come from the browser's built-in
   Chinese calendar (Intl, ICU), so no yearly table is needed. A day-off holiday spreads across
   the whole long weekend it belongs to (holidays plus adjoining Saturdays and Sundays), so a
   Friday Mid-Autumn and a Monday Teachers' Day share one four-day theme. */
(() => {
  'use strict';
  const TZ = 'Asia/Taipei';
  const DAY = 864e5;
  // off: a national day off (extends over the long weekend). accessory/particle/motifs drive the visuals.
  const FESTIVALS = [
    {id: 'newyear', off: true, when: y => [ymd(y, 1, 1)], accessory: 'crown', particle: 'confetti', motifs: ['fireworks', 'clock', 'star'],
      name: {en: 'Happy New Year', 'zh-TW': '新年快樂', 'zh-CN': '新年快乐'}, line: {en: 'A brand-new year! Let’s build lovely things together.', 'zh-TW': '新的一年開始了！今年也一起做很多可愛的東西吧。', 'zh-CN': '新的一年开始了！今年也一起做很多可爱的东西吧。'}},
    {id: 'lunarnewyear', off: true, when: y => lunarNewYear(y), accessory: 'flower', particle: 'redpaper', motifs: ['lantern', 'firecracker', 'fu'],
      name: {en: 'Happy Lunar New Year', 'zh-TW': '新春快樂', 'zh-CN': '新春快乐'}, line: {en: 'Happy Lunar New Year! Here’s a little red envelope of luck for you.', 'zh-TW': '新年快樂！送你一個裝滿好運的小紅包～', 'zh-CN': '新年快乐！送你一个装满好运的小红包～'}},
    {id: 'lantern', off: false, when: y => lunarDays(y, 1, 15), accessory: 'lanternpin', particle: 'glow', motifs: ['lantern', 'tangyuan', 'moon'],
      name: {en: 'Lantern Festival', 'zh-TW': '元宵節快樂', 'zh-CN': '元宵节快乐'}, line: {en: 'Lanterns and tangyuan tonight! Want to guess a riddle?', 'zh-TW': '今晚有燈籠和湯圓！要不要來猜燈謎？', 'zh-CN': '今晚有灯笼和汤圆！要不要来猜灯谜？'}},
    {id: 'valentine', off: false, when: y => [ymd(y, 2, 14)], accessory: 'heartclip', particle: 'hearts', motifs: ['heart', 'rose', 'letter'],
      name: {en: 'Happy Valentine’s Day', 'zh-TW': '情人節快樂', 'zh-CN': '情人节快乐'}, line: {en: 'Happy Valentine’s Day! I saved you the biggest heart.', 'zh-TW': '情人節快樂！最大顆的愛心留給你。', 'zh-CN': '情人节快乐！最大颗的爱心留给你。'}},
    {id: 'peace', off: true, when: y => [ymd(y, 2, 28)], accessory: 'lily', particle: 'feathers', motifs: ['dove', 'lily', 'leaf'],
      name: {en: 'Peace Memorial Day', 'zh-TW': '和平紀念日', 'zh-CN': '和平纪念日'}, line: {en: 'A quiet day to remember, and to hope for peace.', 'zh-TW': '安靜地記得，也一起祈願和平。', 'zh-CN': '安静地记得，也一起祈愿和平。'}},
    {id: 'children', off: true, when: y => [ymd(y, 4, 4), qingming(y)], accessory: 'flowercrown', particle: 'petals', motifs: ['kite', 'balloon', 'sprout'],
      name: {en: 'Children’s Day & Qingming', 'zh-TW': '兒童節・清明連假', 'zh-CN': '儿童节・清明连假'}, line: {en: 'Spring break! Kites for the kids, and a gentle thought for family.', 'zh-TW': '春天的連假！放風箏、踏青，也想念家人。', 'zh-CN': '春天的连假！放风筝、踏青，也想念家人。'}},
    {id: 'labor', off: true, when: y => [ymd(y, 5, 1)], accessory: 'headphones', particle: 'sparkles', motifs: ['coffee', 'star', 'laptop'],
      name: {en: 'Happy Labour Day', 'zh-TW': '勞動節快樂', 'zh-CN': '劳动节快乐'}, line: {en: 'You’ve worked hard. Today, rest is the task.', 'zh-TW': '辛苦了！今天的工作就是好好休息。', 'zh-CN': '辛苦了！今天的工作就是好好休息。'}},
    {id: 'dragonboat', off: true, when: y => lunarDays(y, 5, 5), accessory: 'sachet', particle: 'leaves', motifs: ['zongzi', 'boat', 'wave'],
      name: {en: 'Dragon Boat Festival', 'zh-TW': '端午節快樂', 'zh-CN': '端午节快乐'}, line: {en: 'Zongzi time! Sweet or savoury?', 'zh-TW': '吃粽子囉！你是南部粽還是北部粽派？', 'zh-CN': '吃粽子咯！你喜欢甜粽还是咸粽？'}},
    {id: 'qixi', off: false, when: y => lunarDays(y, 7, 7), accessory: 'starpin', particle: 'stars', motifs: ['magpie', 'star', 'heart'],
      name: {en: 'Qixi Festival', 'zh-TW': '七夕快樂', 'zh-CN': '七夕快乐'}, line: {en: 'Tonight the magpies build a bridge across the stars.', 'zh-TW': '今晚喜鵲會在星河上搭一座橋喔。', 'zh-CN': '今晚喜鹊会在星河上搭一座桥哦。'}},
    {id: 'midautumn', off: true, when: y => lunarDays(y, 8, 15), accessory: 'bunnyears', particle: 'osmanthus', motifs: ['moon', 'rabbit', 'mooncake'],
      name: {en: 'Happy Mid-Autumn', 'zh-TW': '中秋節快樂', 'zh-CN': '中秋节快乐'}, line: {en: 'Happy Mid-Autumn! Mooncakes, pomelo, and the roundest moon.', 'zh-TW': '中秋節快樂！月餅、柚子，還有最圓的月亮～', 'zh-CN': '中秋节快乐！月饼、柚子，还有最圆的月亮～'}},
    {id: 'teachers', off: true, when: y => [ymd(y, 9, 28)], accessory: 'gradcap', particle: 'chalk', motifs: ['apple', 'book', 'pencil'],
      name: {en: 'Happy Teachers’ Day', 'zh-TW': '教師節快樂', 'zh-CN': '教师节快乐'}, line: {en: 'Thank you to every teacher, and every advisor too.', 'zh-TW': '謝謝每一位老師，也謝謝指導教授們！', 'zh-CN': '谢谢每一位老师，也谢谢指导教授们！'}},
    {id: 'national', off: true, when: y => [ymd(y, 10, 10)], accessory: 'ribbon', particle: 'confetti', motifs: ['fireworks', 'star', 'balloon'],
      name: {en: 'Happy Double Ten Day', 'zh-TW': '國慶日快樂', 'zh-CN': '双十节快乐'}, line: {en: 'Fireworks tonight! Let’s watch them together.', 'zh-TW': '今晚有煙火！一起看吧。', 'zh-CN': '今晚有烟火！一起看吧。'}},
    {id: 'retrocession', off: true, when: y => [ymd(y, 10, 25)], accessory: 'ribbon', particle: 'leaves', motifs: ['leaf', 'star', 'sprout'],
      name: {en: 'Retrocession Day', 'zh-TW': '光復節', 'zh-CN': '光复节'}, line: {en: 'An autumn day off. A good day for a walk.', 'zh-TW': '秋天的假日，適合出去走走。', 'zh-CN': '秋天的假日，适合出去走走。'}},
    {id: 'halloween', off: false, when: y => [ymd(y, 10, 31)], accessory: 'witchhat', particle: 'bats', motifs: ['pumpkin', 'bat', 'candy'],
      name: {en: 'Happy Halloween', 'zh-TW': '萬聖節快樂', 'zh-CN': '万圣节快乐'}, line: {en: 'Trick or treat! …I’ll take treats, please.', 'zh-TW': '不給糖就搗蛋！……我選糖果。', 'zh-CN': '不给糖就捣蛋！……我选糖果。'}},
    {id: 'christmas', off: true, when: y => [ymd(y, 12, 25)], accessory: 'santahat', particle: 'snow', motifs: ['tree', 'gift', 'snowflake'],
      name: {en: 'Merry Christmas', 'zh-TW': '聖誕快樂', 'zh-CN': '圣诞快乐'}, line: {en: 'Merry Christmas! I wrapped a tiny present for you.', 'zh-TW': '聖誕快樂！我偷偷準備了一個小禮物給你。', 'zh-CN': '圣诞快乐！我偷偷准备了一个小礼物给你。'}}
  ];

  const pad = n => String(n).padStart(2, '0');
  function ymd(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
  const toDate = key => new Date(`${key}T12:00:00+08:00`);
  const keyOf = date => new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);
  const shift = (key, days) => keyOf(new Date(toDate(key).getTime() + days * DAY));
  const weekday = key => toDate(key).getUTCDay();
  const lunarFmt = new Intl.DateTimeFormat('en-u-ca-chinese', {timeZone: TZ, month: 'numeric', day: 'numeric'});
  const lunarCache = new Map();
  function lunarYear(y) {
    // Map "month/day" (non-leap months only) to Gregorian keys for every day of year y.
    if (lunarCache.has(y)) return lunarCache.get(y);
    const map = new Map();
    for (let t = toDate(ymd(y, 1, 1)).getTime(); keyOf(new Date(t)).startsWith(String(y)); t += DAY) {
      const parts = Object.fromEntries(lunarFmt.formatToParts(new Date(t)).map(p => [p.type, p.value]));
      if (/^\d+$/.test(parts.month)) map.set(`${parts.month}/${parts.day}`, keyOf(new Date(t)));
    }
    lunarCache.set(y, map);
    return map;
  }
  function lunarDays(y, m, d) { const k = lunarYear(y).get(`${m}/${d}`); return k ? [k] : []; }
  function lunarNewYear(y) {
    const first = lunarYear(y).get('1/1');
    return first ? [shift(first, -2), shift(first, -1), first, shift(first, 1), shift(first, 2)] : [];
  }
  function qingming(y) {
    const yy = y % 100;
    return ymd(y, 4, Math.floor(yy * .2422 + 4.81) - Math.floor(yy / 4));
  }
  /* Every festival occurrence for years y-1..y+1 as {festival, days:[keys]} with long weekends merged. */
  function occurrences(y) {
    const offDays = new Set();
    const raw = [];
    for (const year of [y - 1, y, y + 1]) {
      for (const f of FESTIVALS) {
        const days = f.when(year).filter(Boolean);
        if (!days.length) continue;
        raw.push({festival: f, days});
        if (f.off) days.forEach(d => {
          offDays.add(d);
          // Taiwan compensatory days: a holiday on Saturday frees the Friday before, on Sunday the Monday after.
          if (weekday(d) === 6) offDays.add(shift(d, -1));
          if (weekday(d) === 0) offDays.add(shift(d, 1));
        });
      }
    }
    const isOff = key => offDays.has(key) || weekday(key) === 0 || weekday(key) === 6;
    return raw.map(({festival, days}) => {
      let start = days[0], end = days.at(-1);
      if (festival.off) {
        while (isOff(shift(start, -1))) start = shift(start, -1);
        while (isOff(shift(end, 1))) end = shift(end, 1);
      }
      return {festival, start, end};
    });
  }
  function active(date = new Date()) {
    const forced = forcedId();
    if (forced === 'off') return null;
    const key = keyOf(date);
    const year = Number(key.slice(0, 4));
    let hits = occurrences(year).filter(o => o.start <= key && key <= o.end);
    if (forced) {
      const f = FESTIVALS.find(item => item.id === forced);
      if (f) hits = [{festival: f, start: key, end: key}];
    }
    if (!hits.length) return null;
    hits.sort((a, b) => a.start.localeCompare(b.start) || FESTIVALS.indexOf(a.festival) - FESTIVALS.indexOf(b.festival));
    const start = hits.map(h => h.start).sort()[0], end = hits.map(h => h.end).sort().at(-1);
    return {ids: hits.map(h => h.festival.id), festivals: hits.map(h => h.festival), primary: hits[0].festival, start, end, key: `${hits.map(h => h.festival.id).join('+')}@${start}`};
  }
  function forcedId() {
    try {
      const q = new URLSearchParams(location.search).get('festival');
      if (q) return q;
      return sessionStorage.getItem('niansia-festival') || '';
    } catch { return ''; }
  }
  function upcoming(date = new Date(), count = 5) {
    const key = keyOf(date), year = Number(key.slice(0, 4));
    const seen = new Set();
    return occurrences(year).concat(occurrences(year + 1)).filter(o => o.end >= key).sort((a, b) => a.start.localeCompare(b.start))
      .filter(o => { const k = o.festival.id + o.start; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, count);
  }
  function force(id) { try { if (id) sessionStorage.setItem('niansia-festival', id); else sessionStorage.removeItem('niansia-festival'); } catch {} }

  /* Little flat SVG motifs for the doodle banner (24x24, drawn with currentColor accents). */
  const M = {
    moon: '<circle cx="12" cy="12" r="9" fill="#ffe7a3"/><circle cx="9" cy="10" r="1.6" fill="#f3cf72"/><circle cx="14.5" cy="14" r="2.2" fill="#f3cf72"/><circle cx="14" cy="8" r="1" fill="#f3cf72"/>',
    rabbit: '<ellipse cx="12" cy="16" rx="6.5" ry="5" fill="#fff"/><ellipse cx="9" cy="6" rx="1.8" ry="5" fill="#fff"/><ellipse cx="14.5" cy="6" rx="1.8" ry="5" fill="#fff"/><ellipse cx="9" cy="6" rx=".8" ry="3.5" fill="#ffc2d4"/><ellipse cx="14.5" cy="6" rx=".8" ry="3.5" fill="#ffc2d4"/><circle cx="10" cy="15" r=".9" fill="#5a4a5a"/><circle cx="14" cy="15" r=".9" fill="#5a4a5a"/><ellipse cx="12" cy="17" rx=".9" ry=".6" fill="#ff9cb8"/>',
    mooncake: '<circle cx="12" cy="12" r="9" fill="#d99a4e"/><circle cx="12" cy="12" r="6.5" fill="#e8b36c"/><path d="M12 7.5v9M7.5 12h9M8.8 8.8l6.4 6.4M15.2 8.8l-6.4 6.4" stroke="#c9843c" stroke-width="1.1"/>',
    apple: '<path d="M12 7c-4-2-8 1-7 6 1 5 4 8 7 7 3 1 6-2 7-7 1-5-3-8-7-6z" fill="#ff6b6b"/><path d="M12 7c0-2 1-3 3-4" stroke="#7a5230" stroke-width="1.4" fill="none"/><path d="M13 5c2-2 4-1 4-1-1 2-3 2-4 1z" fill="#6cc070"/>',
    book: '<path d="M3 6c3-1 6-1 9 1v12c-3-2-6-2-9-1z" fill="#8fb8ff"/><path d="M21 6c-3-1-6-1-9 1v12c3-2 6-2 9-1z" fill="#b8d0ff"/><path d="M12 7v12" stroke="#5f7fc0" stroke-width=".8"/>',
    pencil: '<path d="M5 19l1-4 10-10 3 3-10 10z" fill="#ffd166"/><path d="M5 19l1-4 3 3z" fill="#f4e1c1"/><path d="M16 5l3 3 1-1a2 2 0 0 0-3-3z" fill="#ff8fa3"/>',
    lantern: '<path d="M12 2v3" stroke="#b33" stroke-width="1.2"/><ellipse cx="12" cy="12" rx="7" ry="7.5" fill="#ff4d4d"/><path d="M9 5h6M9 19h6" stroke="#ffcc4d" stroke-width="2"/><path d="M12 19v3M10.5 22h3" stroke="#ffcc4d" stroke-width="1.2"/><path d="M8 8c-1 3-1 6 0 8M16 8c1 3 1 6 0 8" stroke="#ff9a9a" stroke-width="1" fill="none"/>',
    firecracker: '<rect x="8" y="7" width="8" height="13" rx="2" fill="#e63946"/><rect x="8" y="10" width="8" height="2" fill="#ffd166"/><path d="M12 7c0-2 1-3 3-4" stroke="#7a5230" stroke-width="1.2" fill="none"/><circle cx="15.5" cy="3" r="1.5" fill="#ffcc4d"/>',
    fu: '<rect x="4" y="4" width="16" height="16" rx="1" transform="rotate(45 12 12)" fill="#e63946"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#ffd166">福</text>',
    fireworks: '<g stroke-width="1.6" stroke-linecap="round"><path d="M12 12l0-8M12 12l6-5M12 12l8 1M12 12l5 7M12 12l-2 8M12 12l-7 4M12 12l-7-4M12 12l-3-7" stroke="#ff8fbf"/></g><circle cx="12" cy="12" r="1.8" fill="#ffd166"/>',
    clock: '<circle cx="12" cy="12" r="9" fill="#fff" stroke="#9b8cff" stroke-width="1.6"/><path d="M12 7v5l3 2" stroke="#6b5fd8" stroke-width="1.6" stroke-linecap="round" fill="none"/>',
    star: '<path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill="#ffd166"/>',
    heart: '<path d="M12 21 10.6 19.7C5.4 15.1 2 12 2 8.2 2 5.1 4.4 2.7 7.5 2.7c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.6 11.5z" fill="#ff8fbf"/>',
    rose: '<circle cx="12" cy="9" r="5.5" fill="#ff5d8f"/><path d="M9 9c1-3 5-3 6 0-1 2-5 2-6 0z" fill="#ff8fb0"/><path d="M12 14v8" stroke="#4caf50" stroke-width="1.6"/><path d="M12 18c-3-2-5-1-5-1 1 2 3 2 5 1z" fill="#6cc070"/>',
    letter: '<rect x="3" y="6" width="18" height="12" rx="1.5" fill="#fff" stroke="#ff8fbf" stroke-width="1.4"/><path d="M3.5 7l8.5 6 8.5-6" stroke="#ff8fbf" stroke-width="1.4" fill="none"/><path d="M12 14.5c-1.5-1-2.5-2-1.6-3 .6-.6 1.4-.3 1.6.2.2-.5 1-.8 1.6-.2.9 1-.1 2-1.6 3z" fill="#ff5d8f"/>',
    dove: '<path d="M4 13c3-1 5-4 6-7 2 2 3 5 2 8 3-1 6 0 8 2-3 0-5 2-8 3-4 1-7-2-8-6z" fill="#fff" stroke="#b9c7e0" stroke-width=".8"/><circle cx="17.5" cy="15" r=".7" fill="#56607a"/>',
    lily: '<path d="M12 21v-8" stroke="#6cc070" stroke-width="1.4"/><path d="M12 13c-4-1-6-5-5-8 2 1 4 3 5 5 1-2 3-4 5-5 1 3-1 7-5 8z" fill="#fff" stroke="#e0d4f5" stroke-width=".8"/>',
    leaf: '<path d="M5 19C4 11 9 5 19 5c0 10-6 15-14 14z" fill="#f4a261"/><path d="M5 19 15 9" stroke="#c0712f" stroke-width="1"/>',
    kite: '<path d="M12 2l7 8-7 9-7-9z" fill="#8fd3ff"/><path d="M12 2v17M5 10h14" stroke="#fff" stroke-width="1"/><path d="M12 19c-1 1 1 2 0 3" stroke="#ff8fbf" stroke-width="1" fill="none"/>',
    balloon: '<ellipse cx="12" cy="9" rx="6" ry="7" fill="#ff8fbf"/><path d="M12 16l-1 1h2z" fill="#ff8fbf"/><path d="M12 17c-1 2 1 3 0 5" stroke="#b9a" stroke-width=".8" fill="none"/><ellipse cx="10" cy="7" rx="1.4" ry="2" fill="#fff" opacity=".6"/>',
    sprout: '<path d="M12 21v-8" stroke="#4caf50" stroke-width="1.6"/><path d="M12 13c-5 0-7-3-7-6 4 0 7 2 7 6zM12 13c0-5 3-7 7-7 0 4-3 7-7 7z" fill="#7bd389"/>',
    coffee: '<path d="M5 9h11v6a5 5 0 0 1-5 5 6 6 0 0 1-6-5z" fill="#fff" stroke="#c49a6c" stroke-width="1.4"/><path d="M16 11h2a2 2 0 0 1 0 4h-2" stroke="#c49a6c" stroke-width="1.4" fill="none"/><path d="M9 3c-1 2 1 3 0 5M12 3c-1 2 1 3 0 5" stroke="#d8c4b0" stroke-width="1" fill="none"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5" fill="#6b5fd8"/><rect x="6.5" y="6.5" width="11" height="7" fill="#b8b0ff"/><path d="M3 18h18l-2-3H5z" fill="#9b8cff"/>',
    zongzi: '<path d="M12 3l8 16H4z" fill="#6cc070"/><path d="M8 11l8 0M6.5 15h11" stroke="#f4e1c1" stroke-width="1.4"/><path d="M12 3l-2 16" stroke="#4e9a52" stroke-width=".8"/>',
    boat: '<path d="M2 15h20l-3 4H5z" fill="#e76f51"/><path d="M2 15c1-2 2-3 4-3M22 15c-1-2-2-3-4-3" stroke="#e76f51" stroke-width="1.6" fill="none"/><circle cx="4.5" cy="11.5" r="1" fill="#ffd166"/><path d="M8 15v-3M12 15v-3M16 15v-3" stroke="#264653" stroke-width="1.2"/>',
    wave: '<path d="M2 16c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="#5fb3d9" stroke-width="1.8" fill="none"/><path d="M2 20c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="#8fd3ff" stroke-width="1.6" fill="none"/>',
    magpie: '<path d="M4 14c3-4 8-5 12-3l4-3-1 5c-2 4-8 6-15 1z" fill="#2b2d42"/><path d="M8 13c2-1 5-1 7 0" stroke="#fff" stroke-width="1.4"/><circle cx="16.5" cy="11" r=".7" fill="#fff"/>',
    tangyuan: '<path d="M4 13h16a8 8 0 0 1-16 0z" fill="#fff" stroke="#e0c9b0" stroke-width="1"/><circle cx="9" cy="12" r="2.5" fill="#fff" stroke="#ffc2d4"/><circle cx="14" cy="11.5" r="2.5" fill="#ffd6e6"/><circle cx="12" cy="9.5" r="2.3" fill="#fff" stroke="#f4e1c1"/>',
    pumpkin: '<ellipse cx="12" cy="14" rx="8" ry="6.5" fill="#ff9f43"/><path d="M12 7.5v13M8 8.5c-1 3-1 8 0 11M16 8.5c1 3 1 8 0 11" stroke="#e67e22" stroke-width="1"/><path d="M12 7c0-2 1-3 2-4" stroke="#6b4f2a" stroke-width="1.4"/><path d="M9 13l1.5-1.5L12 13M12 13l1.5-1.5L15 13M9.5 16c1.5 1 3.5 1 5 0" stroke="#5a2d0c" stroke-width="1" fill="none"/>',
    bat: '<path d="M12 10c-2-3-6-4-10-2 2 1 3 3 3 5 2-1 4-1 5 1 1-1 1-2 2-2s1 1 2 2c1-2 3-2 5-1 0-2 1-4 3-5-4-2-8-1-10 2z" fill="#4a3f6b"/><circle cx="11" cy="11" r=".6" fill="#ffd166"/><circle cx="13" cy="11" r=".6" fill="#ffd166"/>',
    candy: '<circle cx="12" cy="12" r="5" fill="#ff8fbf"/><path d="M7 12l-4-3v6zM17 12l4-3v6z" fill="#ffc2d4"/><path d="M9 10c2 1 4 3 5 5" stroke="#fff" stroke-width="1.2"/>',
    tree: '<path d="M12 2l6 8h-3l5 7H4l5-7H6z" fill="#4caf50"/><rect x="10.5" y="17" width="3" height="4" fill="#8d5a3b"/><circle cx="12" cy="3" r="1.5" fill="#ffd166"/><circle cx="9.5" cy="12" r="1" fill="#ff5d8f"/><circle cx="14" cy="14.5" r="1" fill="#8fd3ff"/>',
    gift: '<rect x="4" y="9" width="16" height="11" rx="1" fill="#ff5d8f"/><rect x="3" y="7" width="18" height="4" rx="1" fill="#ff8fbf"/><path d="M12 7v13" stroke="#ffd166" stroke-width="2"/><path d="M12 7c-2-4-6-3-5-1 1 1 3 1 5 1zM12 7c2-4 6-3 5-1-1 1-3 1-5 1z" fill="#ffd166"/>',
    snowflake: '<g stroke="#8fd3ff" stroke-width="1.6" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2"/></g>'
  };
  const motif = (name, cls = '') => `<svg class="fest-motif ${cls}" viewBox="0 0 24 24" aria-hidden="true">${M[name] || M.star}</svg>`;

  window.NIANSIA_FESTIVAL = {active, upcoming, force, motif, list: FESTIVALS, keyOf};
})();
