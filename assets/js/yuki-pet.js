/* Yuki, the desktop companion: a draggable pet that lives on the terminal's command line,
   keeps simple needs (fullness, mood, energy), nudges idle visitors, and answers questions
   through the on-device model in yuki-brain.js. Nothing leaves the browser. */
(() => {
  'use strict';
  const app = window.NIANSIA_APP, brain = window.YukiBrain, LINES = window.YUKI_LINES;
  if (!app || !LINES) return;
  const t = () => app.t();
  const esc = app.esc;
  const fill = (text, vars = {}) => String(text).replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const lines = key => LINES[app.locale()]?.[key] || LINES.en[key] || [''];
  const line = (key, vars) => fill(pick(lines(key)), vars);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => Date.now();
  const motion = () => app.motion('yuki');
  const coarse = matchMedia('(pointer: coarse)');
  const ICON = {
    heart:'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5z', pin:'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 10.5h.01', fish:'M3 12q6-7 13-2l4-3v10l-4-3q-7 5-13-2zM13 11h.01',
    yarn:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5 8q7 1 11 10M4 13q8-2 13-9M9 4q5 5 5 16',
    bed:'M3 17v-4q0-3 3-3h12q3 0 3 3v4M3 17h18M7 10V8q0-2 2-2h6q2 0 2 2v2', moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z',
    sun:'M12 4v2m0 12v2M4 12h2m12 0h2M7 7l1 1m8 8 1 1M7 17l1-1m8-8 1-1M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    star:'m12 3 2.6 5.8 6.4.6-4.8 4.2 1.4 6.3L12 16.7 6.4 19.9l1.4-6.3L3 9.4l6.4-.6z', chat:'M4 4h16v13H9l-5 4z',
    hide:'M3 3l18 18M10.6 6.1Q11.3 6 12 6c5 0 9 6 9 6a15 15 0 0 1-3 3.4M6.5 7.6C4.3 9.1 3 12 3 12s4 6 9 6q2 0 3.6-.8',
    close:'m6 6 12 12M6 18 18 6', send:'M4 12h15m-6-6 6 6-6 6', note:'M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z', brain:'M6 6h12v12H6zM9.5 9.5h5v5h-5zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3'
  };
  const svg = (name, cls = '') => `<svg class="yicon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[name]}"/></svg>`;
  const LANG_NAMES = {en: 'English', 'zh-TW': '繁體中文', 'zh-CN': '简体中文'};

  /* ---------- persistent needs ---------- */
  let S = {food: 80, mood: 75, energy: 85, xp: 0, visits: 0, seen: [], t: now()};
  try { S = {...S, ...JSON.parse(app.store.get('yuki', '{}'))}; } catch {}
  const awayMin = clamp((now() - S.t) / 60000, 0, 30);
  S.food = clamp(S.food - awayMin * 1.2, 20, 100); S.energy = clamp(S.energy + awayMin * 1.5, 0, 100); S.mood = clamp(S.mood - awayMin * .5, 30, 100);
  S.visits += 1;
  const save = () => { S.t = now(); app.store.set('yuki', JSON.stringify({...S, seen: S.seen.slice(-20)})); };
  const levelAt = xp => Math.floor(Math.sqrt(xp / 12)) + 1, level = () => levelAt(S.xp);
  function gain(food = 0, mood = 0, energy = 0, xp = 0) {
    const before = level();
    S.food = clamp(S.food + food, 0, 100); S.mood = clamp(S.mood + mood, 0, 100); S.energy = clamp(S.energy + energy, 0, 100); S.xp += xp;
    save(); paintState();
    if (level() > before) {
      const now_ = level(), got = REWARDS.filter(r => r.lv > before && r.lv <= now_);
      setTimeout(() => {
        notify(got.length ? rc().up(now_, got.map(r => `${r.icon} ${rc().name[r.id]}`).join('、')) : line('levelUp', {level: now_}), {pose: 'happy'});
        puff('star', 5, 1.2); puff('heart', 2);
        if (!menu.hidden) { renderMenu(); placeMenu(); }
      }, 900);
    }
  }
  function moodKey() {
    if (asleep) return 'asleep';
    if (S.food < 30) return 'hungry';
    if (S.energy < 25) return 'sleepy';
    if (S.mood < 40) return 'lonely';
    return S.mood > 70 ? 'happy' : 'ok';
  }

  /* ---------- levels: every level from 2 to 10 unlocks something ---------- */
  const REWARDS = [
    {lv: 2, id: 'dance', kind: 'perform', icon: '💃'}, {lv: 3, id: 'wand', kind: 'play', icon: '🪶'}, {lv: 4, id: 'piano', kind: 'perform', icon: '🎹'},
    {lv: 5, id: 'taiyaki', kind: 'food', icon: '🐟'}, {lv: 6, id: 'violin', kind: 'perform', icon: '🎻'}, {lv: 7, id: 'aura', kind: 'effect', icon: '✨'},
    {lv: 8, id: 'cake', kind: 'food', icon: '🍰'}, {lv: 9, id: 'encore', kind: 'perform', icon: '🎶'}, {lv: 10, id: 'gold', kind: 'effect', icon: '👑'}];
  const RC = {
    en: {title: 'Level rewards', next: 'Next', all: 'Everything unlocked!', at: n => `Lv ${n}`, xp: (a, b) => `${a} / ${b} xp`, sound: 'Performance music', up: (n, list) => `Level ${n}! Unlocked: ${list}`,
      name: {dance: 'Dance', wand: 'Feather wand', piano: 'Piano', taiyaki: 'Taiyaki', violin: 'Violin', aura: 'Happy sparkles', cake: 'Strawberry cake', encore: 'Encore medley', gold: 'Golden badge'},
      desc: {dance: 'Performances may turn into a dance', wand: 'Play: a feather wand you can steer with the pointer', piano: 'Performances: a toy piano tune', taiyaki: 'A new snack', violin: 'Performances: a violin piece', aura: 'Sparkles when she is very happy', cake: 'A new snack', encore: 'Sometimes plays two pieces in a row', gold: 'A golden name badge'},
      best: 'best friend'},
    'zh-TW': {title: '等級獎勵', next: '下一個', all: '全部解鎖了！', at: n => `Lv ${n}`, xp: (a, b) => `${a} / ${b} 經驗`, sound: '表演音樂', up: (n, list) => `升到 Lv ${n} 了！解鎖：${list}`,
      name: {dance: '跳舞', wand: '逗貓棒', piano: '彈鋼琴', taiyaki: '鯛魚燒', violin: '拉小提琴', aura: '開心光點', cake: '草莓蛋糕', encore: '安可連演', gold: '金色名牌'},
      desc: {dance: '表演時可能會跳舞', wand: '玩耍：可以用滑鼠操控的逗貓棒', piano: '表演：彈一首玩具鋼琴', taiyaki: '新的點心', violin: '表演：拉一段小提琴', aura: '很開心的時候身邊會冒光點', cake: '新的點心', encore: '有時會連演兩首', gold: '金色的名牌'},
      best: '摯友'},
    'zh-CN': {title: '等级奖励', next: '下一个', all: '全部解锁了！', at: n => `Lv ${n}`, xp: (a, b) => `${a} / ${b} 经验`, sound: '表演音乐', up: (n, list) => `升到 Lv ${n} 了！解锁：${list}`,
      name: {dance: '跳舞', wand: '逗猫棒', piano: '弹钢琴', taiyaki: '鲷鱼烧', violin: '拉小提琴', aura: '开心光点', cake: '草莓蛋糕', encore: '安可连演', gold: '金色名牌'},
      desc: {dance: '表演时可能会跳舞', wand: '玩耍：可以用鼠标操控的逗猫棒', piano: '表演：弹一首玩具钢琴', taiyaki: '新的点心', violin: '表演：拉一段小提琴', aura: '很开心的时候身边会冒光点', cake: '新的点心', encore: '有时会连演两首', gold: '金色的名牌'},
      best: '挚友'}};
  const rc = () => RC[app.locale()] || RC.en;
  const xpFor = n => 12 * (n - 1) * (n - 1);   // inverse of level()
  const unlocked = id => { const r = REWARDS.find(x => x.id === id); return !r || level() >= r.lv; };
  const soundOn = () => app.store.get('yuki-sound', '0') === '1';   // off until the visitor turns it on
  /* Lines for the new actions (the trained dialogue lives in yuki-lines.js; these are only for props). */
  const AL = {
    en: {fish: 'A fish snack! Nom nom…', taiyaki: 'Taiyaki! Still warm, with red bean inside ♡', cake: 'Strawberry cake?! Today is a good day.', yarn: 'Up, up… and catch!', wand: 'The feather! I’ll get it this time!', wandHint: 'Move your pointer near me to wave the feather.', desk: 'Just resting my head on the desk for a bit…', spin: 'Ta-da! A little spin.', dance: 'Music on! Let’s dance ♪', piano: 'A little tune on my toy piano ♪', violin: 'Listen… this one is Ode to Joy.', encore: 'Encore? Okay, one more!', caught: 'Got it! Hehe.', locked: (n, lv) => `${n} unlocks at Lv ${lv}. Keep me company a little longer!`},
    'zh-TW': {fish: '小魚乾！嚼嚼嚼……', taiyaki: '鯛魚燒！還熱熱的，紅豆餡的 ♡', cake: '草莓蛋糕？！今天是好日子。', yarn: '拋高高……接住！', wand: '羽毛！這次一定抓到！', wandHint: '把滑鼠移到我旁邊，就能揮動羽毛喔。', desk: '在課桌上趴一下下……', spin: '噹噹～轉個圈！', dance: '音樂下！一起跳舞 ♪', piano: '用玩具鋼琴彈一首小曲 ♪', violin: '聽好喔……這首是〈歡樂頌〉。', encore: '安可？好，再一首！', caught: '抓到了！嘿嘿。', locked: (n, lv) => `${n}要到 Lv ${lv} 才會喔！再多陪我一下吧～`},
    'zh-CN': {fish: '小鱼干！嚼嚼嚼……', taiyaki: '鲷鱼烧！还热热的，红豆馅的 ♡', cake: '草莓蛋糕？！今天是好日子。', yarn: '抛高高……接住！', wand: '羽毛！这次一定抓到！', wandHint: '把鼠标移到我旁边，就能挥动羽毛哦。', desk: '在课桌上趴一下下……', spin: '当当～转个圈！', dance: '音乐起！一起跳舞 ♪', piano: '用玩具钢琴弹一首小曲 ♪', violin: '听好哦……这首是《欢乐颂》。', encore: '安可？好，再一首！', caught: '抓到了！嘿嘿。', locked: (n, lv) => `${n}要到 Lv ${lv} 才会哦！再多陪我一下吧～`}};
  const al = key => (AL[app.locale()] || AL.en)[key];
  // Asked for something still locked: say which level unlocks it instead of silently doing something else.
  const lockedLine = id => { const r = REWARDS.find(x => x.id === id); return r && !unlocked(id) ? (AL[app.locale()] || AL.en).locked(`${r.icon} ${rc().name[id]}`, r.lv) : ''; };

  /* ---------- DOM ---------- */
  const pet = document.createElement('div');
  pet.className = 'yuki';
  pet.innerHTML = `<div class="yuki-shadow"></div><div class="yuki-bed" aria-hidden="true">
      <svg class="bed-back" viewBox="0 0 200 62" preserveAspectRatio="none"><ellipse class="bed-rim" cx="100" cy="27" rx="98" ry="25"/><ellipse class="bed-hole" cx="100" cy="27" rx="84" ry="15"/></svg>
      <svg class="bed-front" viewBox="0 0 200 62" preserveAspectRatio="none"><defs><linearGradient id="yuki-bed-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="bed-front-top"/><stop offset="1" class="bed-front-bottom"/></linearGradient></defs><path fill="url(#yuki-bed-front)" d="M2 27A98 34 0 0 0 198 27L186 27A86 16 0 0 1 14 27Z"/><path class="bed-stitch" d="M22 40Q100 64 178 40"/></svg></div>
    <div class="yuki-tailbox" aria-hidden="true"><i class="yuki-tail"></i></div>
    <button type="button" class="yuki-hit" aria-haspopup="true" aria-expanded="false"><span class="yuki-figure"><span class="yuki-sprite"><i class="ys-body"></i><i class="ys-head"></i></span><span class="yuki-headbox"><span class="yuki-acc" aria-hidden="true" hidden></span><span class="yuki-headprops" aria-hidden="true"></span></span><span class="yuki-props" aria-hidden="true"></span></span></button>
    <div class="yuki-blanket" aria-hidden="true"></div><div class="yuki-bowl" aria-hidden="true"><i class="bowl-fish"></i><i class="bowl-dish"></i></div>
    <div class="yuki-fx" aria-hidden="true"></div><svg class="yuki-wand" aria-hidden="true" hidden><path class="wand-rod"/><path class="wand-string"/><g class="wand-tip"></g></svg>
    <div class="yuki-bubble" role="status" aria-live="polite" hidden><p></p><div class="bubble-actions"></div></div>
    <span class="yuki-badge" aria-hidden="true" hidden></span>`;
  const menu = document.createElement('div');
  menu.className = 'yuki-menu'; menu.hidden = true; menu.setAttribute('role', 'menu');
  const chat = document.createElement('section');
  chat.className = 'yuki-chat'; chat.hidden = true; chat.setAttribute('role', 'dialog'); chat.setAttribute('aria-labelledby', 'yuki-chat-title');
  const ball = document.createElement('div');
  ball.className = 'yuki-ball'; ball.hidden = true; ball.setAttribute('aria-hidden', 'true');
  const fly = document.createElement('div');
  fly.className = 'yuki-butterfly'; fly.hidden = true; fly.setAttribute('aria-hidden', 'true'); fly.innerHTML = '<i></i><i></i>';
  document.body.append(pet, menu, chat, ball, fly);
  const $ = (sel, scope = pet) => scope.querySelector(sel);
  const hit = $('.yuki-hit'), bubble = $('.yuki-bubble'), fxLayer = $('.yuki-fx'), badge = $('.yuki-badge');

  /* ---------- wardrobe: outfit sheets, head-anchored accessories, festivals ---------- */
  const accEl = $('.yuki-acc');
  let outfitToken = 0, cellRatio = 191 / 444, stride = 160;
  let anchors = [], outfitChoice = app.store.get('yuki-outfit', 'auto'), outfit = 'hoodie', accChoice = app.store.get('yuki-acc', 'auto'), wardrobeOpen = false;
  let stay = app.store.get('yuki-stay', '0') === '1', menuTab = 'act';   // stay put: no wandering while the visitor reads
  const festival = () => window.NIANSIA_FESTIVAL?.active() || null;
  const wardrobe = () => window.YukiWardrobe;
  function loadOutfit(choice) {
    const list = wardrobe()?.outfits() || [];
    let id = choice;
    if (choice === 'auto') {  // festival outfit when its art exists, otherwise the hoodie
      const fest = festival();
      id = (fest && fest.ids.map(fid => list.find(o => (o.festival || []).includes(fid))).find(Boolean)?.id) || 'hoodie';
    }
    const o = list.find(x => x.id === id) || list[0] || {id: 'hoodie', sheet: '/assets/lab/yuki/'};
    outfit = o.id;
    const token = ++outfitToken, first = !pet.style.getPropertyValue('--sheet');
    // Preload the sheet and its layout, then swap everything in one go (no half-drawn frame).
    const sheet = new Image();
    sheet.src = `${o.sheet}pet.webp`;
    Promise.all([fetch(o.sheet + 'layout.json').then(r => r.json()), sheet.decode().catch(() => {})]).then(([l]) => {
      if (token !== outfitToken) return;
      anchors = l.anchors || [];
      cellRatio = l.cell ? l.cell[0] / l.cell[1] : 191 / 444;
      stride = l.tail === null ? 120 : 160;
      pet.dataset.tail = l.tail === null ? '0' : '1';
      pet.style.setProperty('--sheet', `url('${o.sheet}pet.webp')`);
      pet.style.setProperty('--tail-img', `url('${o.sheet}tail.webp')`);
      document.documentElement.style.setProperty('--yuki-heads', `url('${o.sheet}heads.webp')`);
      measure(); place(); setFrame(frame); pet.classList.add('is-ready');
      if (!first && motion()) { pet.classList.remove('is-changing'); void pet.offsetWidth; pet.classList.add('is-changing'); puff('star', 4, .8); }
    }).catch(() => {});
  }
  function accessoryId() {
    if (accChoice === 'auto') return festival()?.primary.accessory || '';
    return accChoice === 'none' ? '' : accChoice;
  }
  function paintAccessory() {
    const item = wardrobe()?.render(accessoryId());
    accEl.hidden = !item;
    accEl.innerHTML = item ? item.html : '';
    if (!item) return;
    const vars = {'--aws': item.w, '--aax': item.ax, '--aay': item.ay, '--adx': item.dx || 0, '--ady': item.dy || 0, '--arot': `${item.rot || 0}deg`};
    Object.entries(vars).forEach(([k, v]) => accEl.style.setProperty(k, v));
  }
  function festivalLine(f = festival()) {
    if (!f) return '';
    const L = app.locale();
    const names = f.festivals.map(x => x.name[L]).join(L === 'en' ? ' & ' : '・');
    const range = `${f.start.slice(5).replace('-', '/')}–${f.end.slice(5).replace('-', '/')}`;
    return `${names}! ${f.primary.line[L]} (${range})`.replace('! ', L === 'en' ? '! ' : '！');
  }

  /* ---------- geometry & motion state ---------- */
  let W = 67, H = 156, x = -999, y = 0, dir = -1, floorKind = 'command', grounded = true, vx = 0, vy = 0, dropFrom = 0;
  let pose = 'idle', frame = 0, asleep = false, tucked = false, dragging = false, busy = '', walkTo = null, raf = 0, last = 0;
  let behaviourTimer, blinkTimer, poseTimer, bubbleTimer, rubTimer, lieTimer, munchTimer;
  let down = null, rub = 0, rubHearts = 0, pokes = [], unread = 0, messages = [], lastInteract = now(), lastActive = now(), nudges = 0, hiddenAt = 0, titleBackup = '';
  let ballState = null, sleptAt = 0, walkPhase = 0;
  let gait = 'walk', look = 0, leaping = false, afterLand = null, bf = null, lastChatter = 0, danceTimer;
  const NECK = .195; // chin below the crown, as a fraction of the cell: the head layer pivots here
  const WALK_STRIDE = 160; // cell pixels travelled per 8-frame cycle (two steps), measured from the baked frames

  function measure() {
    const w = innerWidth, h = innerHeight;
    H = w < 720 ? 108 : (h < 760 || w < 1100) ? 134 : 156;
    W = Math.round(H * cellRatio);
    pet.style.setProperty('--h', `${H}px`); pet.style.setProperty('--w', `${W}px`);
  }
  function floors() {
    const list = [], win = document.querySelector('.terminal-window'), cmd = document.querySelector('.command-area');
    const wr = win?.getBoundingClientRect();
    if (cmd && wr && !win.classList.contains('is-minimized')) {
      const r = cmd.getBoundingClientRect();
      if (r.height > 0 && r.top > H * .6) list.push({kind: 'command', y: r.top + 1, left: wr.left, right: wr.right});
    }
    list.push({kind: 'bottom', y: innerHeight - 2, left: 0, right: innerWidth});
    return list;
  }
  const floorOf = kind => floors().find(f => f.kind === kind) || floors().at(-1);
  const bounds = f => [f.left + W * .7, f.right - W * .7];
  function place() {
    const tuckX = innerWidth - W * .3;
    const px = tucked ? tuckX : x;
    pet.style.transform = `translate3d(${Math.round(px - W / 2)}px,${Math.round(y - H)}px,0)`;
    pet.style.setProperty('--dir', dir);
    pet.style.setProperty('--look', `${(look * dir).toFixed(1)}deg`);
    if (!menu.hidden) placeMenu();
    if (!chat.hidden && !dragging) placeChat();
    if (!bubble.hidden) placeBubble();
  }
  function reground() {
    measure();
    const f = floorOf(floorKind);
    floorKind = f.kind;
    const [a, b] = bounds(f);
    if (x < -900) x = b - W * .6;
    x = clamp(x, a, b);
    if (grounded && !dragging) y = f.y;
    place();
  }

  /* ---------- poses ---------- */
  function setFrame(f) {
    frame = f; pet.dataset.frame = String(f); pet.style.setProperty('--f', f);
    const a = anchors[f];
    if (a) { pet.style.setProperty('--ax', a[0]); pet.style.setProperty('--ay', a[1]); pet.style.setProperty('--aw', a[2]); pet.style.setProperty('--neck', `${((a[1] + NECK) * 100).toFixed(1)}%`); }
  }
  function setPose(next, f, ms, after = 'idle') {
    clearTimeout(poseTimer);
    pose = next; pet.dataset.pose = next;
    setFrame(f ?? ({idle: 0, walk: 5, happy: 2, yawn: 3, pet: 4, lie: 0, sleep: 3, eat: 0, drag: 1, fall: 1, dizzy: 3, annoyed: 0, trick: 2, crouch: 0, jump: 2, cute: 2, dance: 0}[next] ?? 0));
    if (ms) poseTimer = setTimeout(() => { if (pose === next) setPose(asleep ? 'sleep' : after); }, ms);
    paintState();
  }
  function restPose() { setPose(asleep ? 'sleep' : busy === 'lie' ? 'lie' : 'idle'); }
  function blink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(() => {
      if ((pose === 'idle' || pose === 'lie') && frame === 0) {
        setFrame(4);
        setTimeout(() => { if (frame === 4 && (pose === 'idle' || pose === 'lie')) setFrame(0); }, 140);
        if (Math.random() < .25) setTimeout(() => { if (frame === 0 && pose === 'idle') { setFrame(4); setTimeout(() => pose === 'idle' && setFrame(0), 120); } }, 300);
      }
      blink();
    }, rand(2200, 5200));
  }

  /* ---------- particles ---------- */
  function puff(kind, count = 1, spread = 1) {
    if (!motion()) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = `pfx pfx-${kind}`;
      el.textContent = {note: pick(['♪', '♫']), zzz: 'z', anger: '', star: '', heart: '', crumb: '', sweat: '', dust: '', question: '?'}[kind] ?? '';
      const ox = kind === 'zzz' ? W * .45 * -dir : rand(-W * .45, W * .45) * spread, oy = kind === 'zzz' ? -H * .48 : kind === 'crumb' ? -H * .12 : kind === 'dust' ? -rand(2, 7) : -H * rand(.62, .9);
      el.style.left = `calc(50% + ${ox}px)`; el.style.top = `calc(100% + ${oy}px)`;
      fxLayer.append(el);
      const dy = kind === 'crumb' ? rand(8, 16) : kind === 'dust' ? -rand(4, 12) : -rand(28, 56), dx = kind === 'zzz' ? rand(10, 26) : kind === 'dust' ? -dir * rand(8, 22) : rand(-16, 16);
      el.animate([
        {opacity: 0, transform: 'translate(-50%,-50%) scale(.3)'},
        {opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .2},
        {opacity: 0, transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${kind === 'zzz' ? 1.4 : .7}) rotate(${rand(-30, 30)}deg)`}
      ], {duration: rand(900, 1400), delay: i * 120, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards'}).onfinish = () => el.remove();
    }
  }

  /* ---------- props (assets/js/yuki-props.js): hand, snacks, desk, instruments, toys ---------- */
  const Props = window.YukiProps;
  const propsEl = $('.yuki-props'), headProps = $('.yuki-headprops'), wandSvg = $('.yuki-wand');
  let propTimers = [], song = null, wandState = null, handTimer = 0;
  const PROP_CLASSES = ['is-biting', 'is-chewing', 'is-swipe', 'is-piano', 'is-violin', 'is-disco', 'is-juggling', 'bow-up'];
  const later = (ms, fn) => { const id = setTimeout(fn, motion() ? ms : 0); propTimers.push(id); return id; };
  function clearProps() {
    propTimers.forEach(clearTimeout); propTimers = []; song?.stop(); song = null;
    if (propsEl) propsEl.innerHTML = '';
    pet.classList.remove(...PROP_CLASSES);
    if (wandState) endWand(false);
  }
  const retrigger = cls => { pet.classList.remove(cls); void pet.offsetWidth; pet.classList.add(cls); };

  /* ---------- speech bubble ---------- */
  function placeBubble() {
    const box = pet.getBoundingClientRect(), bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const top = tucked ? box.top + H * .2 : pose === 'sleep' ? box.top + H * .38 : pose === 'lie' ? box.top + H * .3 : box.top - 6;
    let left = box.left + box.width / 2 - bw / 2;
    left = clamp(left, 8, innerWidth - bw - 8);
    bubble.style.setProperty('--bx', `${left - box.left}px`);
    bubble.style.setProperty('--by', `${top - box.top - bh}px`);
    bubble.style.setProperty('--tail', `${clamp(box.left + box.width / 2 - left, 16, bw - 16)}px`);
  }
  function say(text, {ms, actions = []} = {}) {
    if (!text) return;
    if (!menu.hidden) { const el = menu.querySelector('.menu-say'); el.textContent = text; el.classList.remove('is-in'); void el.offsetWidth; el.classList.add('is-in'); return; }
    const p = bubble.querySelector('p');
    p.textContent = text.length > 150 ? text.slice(0, 146).replace(/\s+\S*$/, '') + '…' : text;
    const box = bubble.querySelector('.bubble-actions');
    box.innerHTML = actions.map((a, i) => `<button type="button" data-bubble="${i}">${esc(a.label)}</button>`).join('');
    box.hidden = !actions.length;
    bubble._actions = actions;
    bubble.hidden = false;
    bubble.classList.remove('is-in'); void bubble.offsetWidth; bubble.classList.add('is-in');
    placeBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => { bubble.hidden = true; }, ms ?? clamp(2600 + text.length * 55, 3200, 9000));
  }
  bubble.addEventListener('click', event => {
    const b = event.target.closest('[data-bubble]');
    if (b) { bubble._actions?.[Number(b.dataset.bubble)]?.run(); bubble.hidden = true; }
  });

  /* ---------- behaviour loop ---------- */
  function loop(ts) {
    const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
    let active = false;
    const f = floorOf(floorKind), [a, b] = bounds(f);
    if (!grounded && !dragging) {
      vy += 2400 * dt; x += vx * dt; y += vy * dt; vx *= .985;
      if (x < a || x > b) { x = clamp(x, a, b); vx *= -.4; }
      const target = floors().filter(fl => fl.y >= dropFrom - 1).sort((p, q) => p.y - q.y)[0] || floors().at(-1);
      if (y >= target.y && vy >= 0) { y = target.y; floorKind = target.kind; land(); }
      else active = true;
    }
    if (walkTo !== null && grounded && !dragging) {
      // Eight baked walk frames cover two steps; moving exactly one stride per step keeps the feet planted.
      const fps = busy === 'play' || gait === 'run' ? 18 : 10, speed = (stride * H / 444) * fps / 8;
      const dx = walkTo - x;
      if (Math.abs(dx) < 3) { walkTo = null; setGait('walk'); if (pose === 'walk') restPose(); onArrive?.(); }
      else {
        dir = dx > 0 ? 1 : -1; x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt); x = clamp(x, a, b);
        if (pose !== 'walk') { setPose('walk'); walkPhase = 0; }
        walkPhase += dt * fps; const step = 5 + Math.floor(walkPhase) % 8; if (step !== frame) setFrame(step);
        if (gait === 'run' && Math.random() < dt * 5) puff('dust', 1);
        active = true;
      }
    }
    if (ballState) active = stepBall(dt) || active;
    if (wandState) active = stepWand(dt) || active;
    if (bf) active = stepButterfly(dt) || active;
    place();
    raf = active ? requestAnimationFrame(loop) : 0;
    if (!raf) last = 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  let onArrive = null;
  function walk(target, then) {
    if (!motion()) { x = target; place(); then?.(); return; }
    walkTo = target; onArrive = () => { onArrive = null; then?.(); }; kick();
  }
  function schedule() {
    clearTimeout(behaviourTimer);
    behaviourTimer = setTimeout(() => {
      if (!busy && walkTo === null && !asleep && !tucked && !dragging && grounded && !leaping && menu.hidden && motion() && !document.hidden) {
        const r = Math.random(), f = floorOf(floorKind), [a, b] = bounds(f);
        const near = pointer.t && now() - pointer.t < 8000 && pointer.y > f.y - H * 2.2;
        const lively = S.energy > 40, lonely = S.mood < 55;
        if (stay) {
          if (S.energy < 35 && r < .25) { setPose('yawn', 3, 1300); puff('zzz', 1); }
          else if (r < .3) lookAround();
          else if (r < .42) stretch();
          else if (r < .5 && S.energy < 55) lieDown(14000);
        }
        else if (S.energy < 35 && r < .25) { setPose('yawn', 3, 1300); puff('zzz', 1); }
        else if (near && r < (lonely ? .35 : .18)) beCute();
        else if (near && lively && r < .3 && Math.abs(pointer.x - x) < 360 && Math.abs(pointer.y - f.y) < H * 1.4) pounce();
        else if (near && r < .38) { walk(clamp(pointer.x, a, b), () => { dir = pointer.x > x ? 1 : -1; setPose('happy', 2, 900); puff('heart', 1); }); }
        else if (r < .5) walk(clamp(x + rand(-260, 260), a, b));
        else if (r < .55 && lively) dash(x < (a + b) / 2 ? b - rand(0, 80) : a + rand(0, 80));
        else if (r < .6) walk(x < (a + b) / 2 ? b - rand(0, 80) : a + rand(0, 80));
        else if (r < .66) lookAround();
        else if (r < .7) stretch();
        else if (r < .76 && lively) hopHop(Math.random() < .5 ? 1 : 2);
        else if (r < .8 && lively) dance();
        else if (r < .84 && lively && innerWidth > 720) chaseButterfly();
        else if (r < .87 && S.mood > 70) trick();
        else if (r < .92 && S.energy < 55) lieDown(14000);
      }
      schedule();
    }, rand(4500, 9500));
  }

  /* ---------- small behaviours ---------- */
  const pointer = {x: 0, y: 0, t: 0};
  let lastWave = 0;
  function stretch() {
    setPose('yawn', 3, 1500);
    pet.classList.remove('is-stretching'); void pet.offsetWidth; pet.classList.add('is-stretching');
  }
  const restart = cls => { pet.classList.remove(cls); void pet.offsetWidth; pet.classList.add(cls); };
  // Spontaneous lines stay rare: at most one every two minutes, and never while the chat or menu is open.
  function chatter(key, chance = .4) {
    if (Math.random() > chance || now() - lastChatter < 120000 || !chat.hidden || !menu.hidden) return;
    lastChatter = now(); say(line(key), {ms: 2600});
  }
  function setGait(g) { gait = g; pet.dataset.gait = g; }
  function setLook(deg) { look = clamp(deg, -12, 12); place(); }
  function dash(target) { setGait('run'); walk(target, () => { setGait('walk'); setPose('happy', 2, 700); }); }
  /* A real jump: crouch, launch under gravity (the same physics as a drop), land with a squash. */
  function jump(toX, power = rand(560, 680), then) {
    if (!grounded || dragging || leaping) return;
    if (!motion()) { then?.(); return; }
    walkTo = null; onArrive = null; leaping = true;
    setPose('crouch', 0);
    setTimeout(() => {
      if (dragging || !grounded || !leaping) { leaping = false; return; }
      const flight = 2 * power / 2400;
      vx = toX == null ? 0 : clamp((toX - x) / flight, -560, 560);
      if (Math.abs(vx) > 5) dir = vx > 0 ? 1 : -1;
      vy = -power; grounded = false; dropFrom = y; afterLand = then;
      setPose('jump', 2); kick();
    }, 230);
  }
  function hopHop(n) {
    jump(null, rand(380, 460), () => { puff('note', 1); if (n > 1) setTimeout(() => hopHop(n - 1), 260); });
  }
  /* Cat pounce: crouch low, wiggle, then leap at the pointer. */
  function pounce() {
    const target = clamp(pointer.x, ...bounds(floorOf(floorKind)));
    dir = target > x ? 1 : -1; place();
    busy = 'pounce'; setPose('crouch', 0); restart('is-wiggling');
    setTimeout(() => {
      pet.classList.remove('is-wiggling');
      if (busy !== 'pounce') return;
      busy = '';
      jump(target, rand(520, 620), () => { puff('star', 2, .5); chatter('pounce', .35); });
    }, 620);
  }
  /* Acting cute: come over, look up at you and rock side to side with a tilted head. */
  function beCute() {
    const f = floorOf(floorKind), [a, b] = bounds(f);
    const side = pointer.x > x ? -1 : 1;
    const spot = clamp(pointer.x + side * W * .9, a, b);
    if (Math.abs(spot - x) > 220) setGait('run');
    walk(spot, () => {
      setGait('walk');
      if (busy || asleep || dragging) return;
      dir = pointer.x > x ? 1 : -1;
      busy = 'cute'; setPose('cute', 2); setLook(dir * 9);
      puff('heart', 2);
      chatter('cute', .5);
      setTimeout(() => { if (busy === 'cute') { busy = ''; setLook(0); restPose(); } }, 2800);
    });
  }
  function dance() {
    busy = 'dance'; setPose('dance', 0);
    let n = 0;
    clearInterval(danceTimer);
    danceTimer = setInterval(() => {
      if (busy !== 'dance') { clearInterval(danceTimer); return; }
      setFrame(n++ % 2 ? 2 : 0);
      if (n % 2) puff('note', 1);
      if (n > 9) { clearInterval(danceTimer); busy = ''; restPose(); }
    }, 380);
  }
  function lookAround() {
    [[-9, 0], [9, 900], [0, 1900]].forEach(([deg, ms]) => setTimeout(() => { if (pose === 'idle' && !busy) setLook(deg); }, ms));
    if (Math.random() < .5) setTimeout(() => pose === 'idle' && puff('question', 1, .3), 500);
  }
  /* A butterfly drifts by; she runs after it and jumps to catch it (it always gets away). */
  function chaseButterfly() {
    const f = floorOf(floorKind), [a, b] = bounds(f);
    const fromLeft = x > (a + b) / 2;
    bf = {x: fromLeft ? a - 40 : b + 40, y: 0, base: f.y - H * rand(1, 1.25), t: 0, vx: (fromLeft ? 1 : -1) * rand(55, 80), tries: 0, cool: 0, flee: false};
    fly.hidden = false; fly.classList.remove('is-out');
    busy = 'butterfly'; kick();
  }
  function stepButterfly(dt) {
    const s = bf, [a, b] = bounds(floorOf(floorKind));
    s.t += dt; s.cool -= dt;
    if (s.flee) { s.vx *= 1 + dt; s.base -= 90 * dt; }
    s.x += s.vx * dt + Math.sin(s.t * 1.3) * 26 * dt;
    s.y = s.base + Math.sin(s.t * 2.6) * 16;
    fly.style.transform = `translate3d(${s.x - 9}px,${s.y - 7}px,0) rotate(${Math.sin(s.t * 5) * 12}deg)`;
    if (busy === 'butterfly' && !dragging && grounded && !leaping) {
      setLook(clamp((s.x - x) / 30, -10, 10));
      const gap = s.x - x;
      if (s.tries < 3 && !s.flee && Math.abs(gap) < W * .5 && s.cool <= 0) {
        s.tries++; s.cool = 1.4;
        const rise = Math.max(60, y - H * .9 - s.y);
        jump(s.x + s.vx * .4, clamp(Math.sqrt(2 * 2400 * rise), 420, 820), () => {
          if (!bf) return;
          if (bf.tries >= 3 || Math.random() < .35) { bf.flee = true; bf.vx = Math.sign(bf.vx || 1) * 140; chatter('butterfly', .5); }
        });
        s.vx += Math.sign(s.vx || 1) * 20; s.base -= 12;
      } else if (!s.flee) {
        setGait(Math.abs(gap) > 140 ? 'run' : 'walk');
        walkTo = clamp(s.x, a, b); onArrive = null;
      }
    }
    if (s.x < -60 || s.x > innerWidth + 60 || s.y < -40 || s.t > 22) endButterfly();
    return !!bf;
  }
  function endButterfly() {
    if (!bf) return;
    bf = null; fly.classList.add('is-out'); setTimeout(() => { fly.hidden = true; }, 400);
    if (busy === 'butterfly') { busy = ''; walkTo = null; setGait('walk'); setLook(0); if (grounded) restPose(); }
  }
  let lookFrame = 0;
  function followPointer() {
    lookFrame = 0;
    if (busy || asleep || tucked || dragging || !(pose === 'idle' || pose === 'walk' || pose === 'happy')) return;
    const dx = pointer.x - x, dist = Math.hypot(dx, pointer.y - (y - H * .85));
    setLook(clamp(dx / 18, -1, 1) * 8 * clamp(1 - dist / 520, 0, 1));
  }
  document.addEventListener('pointermove', event => {
    pointer.x = event.clientX; pointer.y = event.clientY; pointer.t = now();
    if (!lookFrame && motion()) lookFrame = requestAnimationFrame(followPointer);
    // Wave when the pointer comes close (not while busy, asleep or being dragged).
    if (dragging || busy || asleep || tucked || pose !== 'idle' || now() - lastWave < 25000 || !motion()) return;
    const box = pet.getBoundingClientRect();
    if (Math.hypot(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height * .3)) < 150 && !pet.contains(event.target)) {
      lastWave = now(); dir = event.clientX > box.left + box.width / 2 ? 1 : -1; place();
      setPose('happy', 2, 1000); puff('heart', 1);
    }
  }, {passive: true});
  // Typing in the terminal: she turns to watch the command line.
  document.addEventListener('input', event => {
    if (!event.target.matches?.('[data-command-input]') || busy || asleep || dragging || tucked || pose !== 'idle') return;
    const box = event.target.getBoundingClientRect();
    const face = box.left + box.width / 2 > x ? 1 : -1;
    if (face !== dir) { dir = face; place(); }
  });

  /* ---------- actions ---------- */
  function interact() { lastInteract = now(); nudges = 0; }
  function land() {
    grounded = true; vx = vy = 0;
    const fell = y - dropFrom, leapt = leaping, then = afterLand;
    leaping = false; afterLand = null;
    pet.classList.remove('is-landing'); void pet.offsetWidth; pet.classList.add('is-landing');
    puff('dust', 2, .5);
    if (fell > 220 && motion()) { setPose('dizzy', 3, 1600); puff('star', 3, .6); say(line('dropHigh')); gain(0, -3); }
    else { setPose('happy', 2, leapt ? 450 : 700); if (fell > 60 && !leapt) say(line('land'), {ms: 1800}); }
    then?.();
  }
  function patReact(fromRub) {
    interact();
    if (asleep) { wake(true); return line('pet_wake'); }
    gain(0, fromRub ? 2 : 6, 0, fromRub ? 1 : 2);
    puff('heart', fromRub ? 1 : 3);
    window.NIANSIA_FX?.react('happy');
    if (!fromRub && motion() && headProps) {
      clearTimeout(handTimer); headProps.innerHTML = Props.hand(); retrigger('is-patted');
      handTimer = setTimeout(() => { headProps.innerHTML = ''; pet.classList.remove('is-patted'); }, 1650);
    }
    const quiet = busy && busy !== 'lie';   // mid-performance: a pat should not reset her pose
    if (busy === 'lie') { setFrame(4); clearTimeout(poseTimer); poseTimer = setTimeout(() => pose === 'lie' && setFrame(0), 1400); }
    else if (!quiet) setPose(fromRub ? 'pet' : 'pet', 4, fromRub ? 1100 : 1600);
    return line(fromRub ? 'patRub' : 'pet_pat');
  }
  function lieDown(ms = 26000) {
    if (asleep) wake(true);
    stopPlay(); clearProps();
    busy = 'lie'; setPose('lie');
    if (propsEl) propsEl.innerHTML = Props.desk();
    clearTimeout(lieTimer); lieTimer = setTimeout(() => { if (busy === 'lie') { busy = ''; clearProps(); restPose(); } }, ms);
    return al('desk');
  }
  function sleep() {
    interact(); clearTimeout(lieTimer); stopPlay();
    if (asleep) return line('pet_sleep');
    busy = ''; clearProps(); setPose('yawn', 3);
    setTimeout(() => { asleep = true; sleptAt = now(); setPose('sleep'); zzz(); paintState(); }, motion() ? 1100 : 0);
    return line('pet_sleep');
  }
  let zzzTimer;
  function zzz() { clearInterval(zzzTimer); zzzTimer = setInterval(() => { if (asleep) puff('zzz', 1); else clearInterval(zzzTimer); }, 1500); }
  function wake(quiet) {
    if (!asleep) return;
    asleep = false; clearInterval(zzzTimer); busy = '';
    setPose('happy', 2, 1200); paintState();
    if (!quiet) say(line('pet_wake'));
  }
  function feed(want) {
    interact();
    if (lockedLine(want)) { setPose('annoyed', 0, 900); return lockedLine(want); }
    if (asleep) wake(true);
    if (S.food > 92) { setPose('annoyed', 0, 1200); return line('full'); }
    stopPlay(); clearTimeout(lieTimer); clearProps(); clearInterval(munchTimer);
    const menu_ = ['fish', ...['taiyaki', 'cake'].filter(unlocked)];
    const kind = menu_.includes(want) ? want : pick(menu_);
    busy = 'eat'; setPose('eat', 0);
    if (!motion() || !propsEl) { busy = ''; gain(35, 4, 2, 3); setPose('happy', 2, 900); return al(kind); }
    propsEl.innerHTML = Props.food(kind);
    const food = propsEl.querySelector('.yp-food');
    pet.classList.add('is-chewing');
    [650, 1450, 2250].forEach((ms, i) => later(ms, () => {
      retrigger('is-biting'); setFrame(4); Props.bite(food, i); puff('crumb', 2, .3);
      later(300, () => { if (busy === 'eat') setFrame(0); });
    }));
    later(2750, () => {
      if (propsEl) propsEl.innerHTML = ''; pet.classList.remove('is-chewing', 'is-biting'); busy = '';
      const big = kind === 'cake' ? 1.4 : kind === 'taiyaki' ? 1.2 : 1;
      gain(35 * big, 4 * big, 2, 3); setPose('happy', 2, 1300); puff('heart', kind === 'fish' ? 2 : 4);
    });
    return al(kind);
  }
  function trick(want) {
    interact();
    if (lockedLine(want)) { setPose('annoyed', 0, 900); return lockedLine(want); }
    if (asleep) wake(true);
    if (busy === 'lie') { busy = ''; clearTimeout(lieTimer); }
    stopPlay(); clearProps(); clearInterval(danceTimer);
    const list = ['spin', ...['dance', 'piano', 'violin'].filter(unlocked)];
    const kind = list.includes(want) ? want : list.length > 1 ? pick(list.filter(k => k !== 'spin' || Math.random() < .3)) : 'spin';
    const encore = unlocked('encore') && kind !== 'spin' && list.length > 2 && (want === 'encore' || (!want && Math.random() < .3));
    performAct(kind, encore ? () => { say(al('encore')); later(600, () => performAct(pick(list.filter(k => k !== kind && k !== 'spin')))); } : null);
    return al(kind);
  }
  function performAct(kind, then) {
    const done = () => {
      clearProps(); busy = ''; gain(0, 6, -3, 3); setPose('happy', 2, 1100); puff('heart', 2);
      then?.();
    };
    if (kind === 'spin' || !motion() || !propsEl) {
      setPose('trick', 2, 1300); retrigger('is-spinning'); puff('note', 3);
      gain(0, 5, -3, 2); if (then) later(1400, then);
      return;
    }
    busy = 'perform';
    if (kind === 'dance') {
      setPose('dance', 0); pet.classList.add('is-disco');
      song = Props.sound.play('dance', {sound: soundOn(), onNote: (m, i) => {
        if (busy !== 'perform') return;
        if (i % 2 === 0) setFrame(frame === 2 ? 0 : 2);
        if (i % 3 === 0) puff('note', 1);
        if (i % 5 === 0) puff('star', 1, 1.2);
      }});
    } else if (kind === 'piano') {
      setPose('idle', 0); propsEl.innerHTML = Props.piano(); pet.classList.add('is-piano');
      const keys = [...propsEl.querySelectorAll('.yp-key')];
      song = Props.sound.play('piano', {sound: soundOn(), onNote: m => {
        if (busy !== 'perform') return;
        const k = keys[Props.sound.pianoKey(m)]; keys.forEach(el => el.classList.remove('on')); k?.classList.add('on');
        setFrame(frame === 4 ? 0 : 4); puff('note', 1);
      }});
    } else if (kind === 'violin') {
      setPose('idle', 0); propsEl.innerHTML = Props.violin() + `<span class="yp-bowbox">${Props.bow()}</span>`; pet.classList.add('is-violin');
      song = Props.sound.play('violin', {sound: soundOn(), onNote: (m, i) => {
        if (busy !== 'perform') return;
        pet.classList.toggle('bow-up', i % 2 === 0); if (i % 2) puff('note', 1);
        if (i % 4 === 0) setFrame(4); else if (frame === 4) setFrame(0);
      }});
    }
    later(Math.max(1500, (song?.duration || 2) * 1000 + 450), done);
  }
  function poke() {
    interact();
    setPose('annoyed', 0, 1400);
    pet.classList.remove('is-shaking'); void pet.offsetWidth; pet.classList.add('is-shaking');
    puff('anger', 1, .2); gain(0, -4);
    const text = line('poked'); say(text); return text;
  }
  function tuck(force) {
    interact();
    tucked = force ?? !tucked;
    pet.classList.toggle('is-tucked', tucked);
    closeMenu();
    if (tucked) { busy = ''; stopPlay(); clearProps(); setPose('idle'); } else setPose('happy', 2, 900);
    app.store.set('yuki-tucked', tucked ? '1' : '0');
    place();
    return line(tucked ? 'hide' : 'show');
  }

  /* play: juggling a yarn ball in place, a feather wand (Lv 3), or, when she may wander, chasing a ball across the floor */
  function startPlay(want) {
    interact();
    if (lockedLine(want)) { setPose('annoyed', 0, 900); return lockedLine(want); }
    if (asleep) wake(true);
    if (S.energy < 15) { setPose('yawn', 3, 1200); return line('tooSleepy'); }
    if (busy === 'lie') { busy = ''; clearTimeout(lieTimer); }
    stopPlay(); clearProps(); endButterfly();
    const modes = ['yarn', ...(unlocked('wand') ? ['wand'] : []), ...(!stay && innerWidth > 720 && motion() ? ['chase'] : [])];
    const kind = modes.includes(want) ? want : pick(modes);
    if (kind === 'chase') return startChase();
    if (!motion() || !propsEl) { gain(-4, 12, -8, 4); setPose('happy', 2, 900); return al(kind); }
    return kind === 'wand' ? startWand() : juggle();
  }
  function juggle() {
    busy = 'play'; walkTo = null; setPose('happy', 2);
    propsEl.innerHTML = `<span class="yp-juggle">${Props.yarn()}</span>`; pet.classList.add('is-juggling');
    const period = 700;
    for (let i = 0; i < 5; i++) later(i * period, () => { if (busy !== 'play') return; retrigger('is-hop'); setFrame(i % 2 ? 2 : 0); if (i % 2) puff('note', 1); });
    later(5 * period, () => {
      pet.classList.remove('is-juggling'); propsEl.querySelector('.yp-juggle')?.classList.add('is-caught');
      setPose('pet', 4, 1400); puff('heart', 3); say(al('caught'), {ms: 1800});
      gain(-4, 12, -8, 4);
      later(1500, () => { clearProps(); busy = ''; restPose(); });
    });
    return al('yarn');
  }
  /* The feather wand: it swings by itself, or follows the pointer when it comes close. She swats at it and
     catches it on the third or fourth try. */
  function startWand() {
    busy = 'play'; walkTo = null; setPose('idle', 0);
    wandSvg.removeAttribute('hidden'); wandSvg.querySelector('.wand-tip').innerHTML = Props.feather();
    wandState = {t: 0, swipes: 0, cool: 1, until: now() + 9000, caught: 0, tip: {x: W * 1.4, y: -H * .45}, steered: false};
    kick();
    setTimeout(() => { if (wandState && !wandState.steered && pointer.t < now() - 2000) say(al('wandHint'), {ms: 3200}); }, 2600);
    return al('wand');
  }
  function stepWand(dt) {
    const s = wandState; if (!s) return false;
    s.t += dt; s.cool -= dt;
    const box = pet.getBoundingClientRect(), head = {x: W * .5, y: H * .12};
    const px = pointer.x - box.left, py = pointer.y - box.top;
    const steer = !s.caught && pointer.t > now() - 1200 && Math.hypot(px - head.x, py - head.y) < 280;
    if (steer) s.steered = true;
    let tx, ty;
    if (s.caught) { tx = head.x + W * .05; ty = H * .42; }
    else if (steer) { tx = px; ty = py; }
    else { tx = head.x + Math.sin(s.t * 1.6) * W * .95; ty = head.y - H * .16 + Math.sin(s.t * 3.2) * H * .13; }
    const k = Math.min(1, dt * (s.caught ? 10 : 5));
    s.tip.x += (tx - s.tip.x) * k; s.tip.y += (ty - s.tip.y) * k;
    const base = {x: W * 2.2, y: -H * .62}, rod = {x: base.x + (s.tip.x - base.x) * .5, y: base.y + (s.tip.y - base.y) * .45 - H * .08};
    wandSvg.querySelector('.wand-rod').setAttribute('d', `M${base.x},${base.y}L${rod.x},${rod.y}`);
    wandSvg.querySelector('.wand-string').setAttribute('d', `M${rod.x},${rod.y}Q${(rod.x + s.tip.x) / 2},${Math.max(rod.y, s.tip.y) + 14} ${s.tip.x},${s.tip.y}`);
    wandSvg.querySelector('.wand-tip').setAttribute('transform', `translate(${s.tip.x},${s.tip.y}) rotate(${clamp((s.tip.x - rod.x) * .4, -40, 40)})`);
    if (!s.caught) {
      setLook(clamp((s.tip.x - head.x) / 10, -10, 10));
      const d = Math.hypot(s.tip.x - head.x, s.tip.y - (head.y - H * .06));
      if (s.cool <= 0 && d < H * .36 && !dragging) {
        s.cool = .9; s.swipes++; retrigger('is-swipe'); setPose('happy', 2, 420); puff('star', 1, .6);
        if ((s.swipes >= 3 && Math.random() < .6) || s.swipes >= 4) catchWand();
      }
      if (now() > s.until) catchWand();
    }
    return true;
  }
  function catchWand() {
    const s = wandState; if (!s || s.caught) return;
    s.caught = now(); setLook(0); setPose('pet', 4, 1500); puff('heart', 3); say(al('caught'), {ms: 1800});
    gain(-5, 14, -8, 5);
    later(1500, () => endWand(true));
  }
  function endWand() {
    if (!wandState) return;
    wandState = null; wandSvg.setAttribute('hidden', '');
    if (busy === 'play') { busy = ''; setLook(0); restPose(); }
  }
  function startChase() {
    const f = floorOf(floorKind), [a, b] = bounds(f);
    busy = 'play';
    ballState = {x: clamp(x + (x > (a + b) / 2 ? -1 : 1) * rand(120, 200), a, b), y: f.y - 200, vx: 0, vy: 0, r: 11, kicks: 0, spin: 0, until: now() + 16000};
    ball.hidden = false; ball.classList.remove('is-out');
    chase(); kick();
    return line('pet_play');
  }
  function chase() {
    if (!ballState || busy !== 'play') return;
    walkTo = ballState.x - (ballState.x > x ? 1 : -1) * W * .35;
    onArrive = null;
  }
  function stepBall(dt) {
    const s = ballState, f = floorOf(floorKind), [a, b] = bounds(f);
    if (!s.held) {
      s.vy += 1900 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y >= f.y - s.r) { s.y = f.y - s.r; s.vy = Math.abs(s.vy) > 80 ? -s.vy * .45 : 0; s.vx *= .97; }
      if (s.x < a - W * .3 || s.x > b + W * .3) { s.x = clamp(s.x, a - W * .3, b + W * .3); s.vx *= -.6; }
    }
    s.spin += s.vx * dt / s.r;
    ball.style.transform = `translate3d(${s.x - s.r}px,${s.y - s.r}px,0) rotate(${s.spin}rad)`;
    if (busy === 'play' && !dragging && grounded) {
      const gap = s.x - x;
      if (Math.abs(gap) < W * .55 && s.y > f.y - s.r - 30 && !s.held) {
        s.kicks++; dir = gap > 0 ? 1 : -1;
        s.vx = dir * rand(260, 460); s.vy = -rand(380, 620);
        setPose('happy', 2, 450, 'walk'); puff('note', 1);
        if (s.kicks >= 4 || now() > s.until) { endPlay(true); return false; }
      }
      if (!s.held && Math.abs(walkTo === null ? 99 : walkTo - (s.x - Math.sign(s.x - x) * W * .35)) > 20) chase();
      if (walkTo === null) chase();
    }
    return true;
  }
  function endPlay(won) {
    if (!ballState) return;
    ballState = null; walkTo = null; busy = '';
    ball.classList.add('is-out'); setTimeout(() => { ball.hidden = true; }, 400);
    if (won) { gain(-6, 15, -12, 5); setPose('happy', 2, 1300); puff('heart', 3); say(line('caught')); }
    else restPose();
  }
  function stopPlay() { if (ballState) endPlay(false); if (wandState) endWand(); }
  ball.addEventListener('pointerdown', event => {
    if (!ballState) return;
    event.preventDefault(); ball.setPointerCapture(event.pointerId);
    ballState.held = true; ballState.px = event.clientX; ballState.py = event.clientY; ballState.pt = performance.now();
  });
  ball.addEventListener('pointermove', event => {
    const s = ballState; if (!s?.held) return;
    const dt = Math.max(1, performance.now() - s.pt) / 1000;
    s.vx = (event.clientX - s.px) / dt * .6; s.vy = (event.clientY - s.py) / dt * .6;
    s.x = event.clientX; s.y = event.clientY; s.px = event.clientX; s.py = event.clientY; s.pt = performance.now();
    kick();
  });
  ball.addEventListener('pointerup', () => { if (ballState) { ballState.held = false; ballState.vx = clamp(ballState.vx, -900, 900); ballState.vy = clamp(ballState.vy, -900, 900); chase(); kick(); } });

  /* ---------- pointer: click, drag, rub ---------- */
  hit.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    down = {x: event.clientX, y: event.clientY, ox: event.clientX - x, oy: event.clientY - y, t: performance.now(), moved: false, lx: event.clientX};
    hit.setPointerCapture(event.pointerId);
  });
  hit.addEventListener('pointermove', event => {
    lastActive = now();
    if (down) {
      if (!down.moved && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6 && !tucked) {
        down.moved = true; dragging = true; grounded = false; walkTo = null; stopPlay(); endButterfly();
        leaping = false; afterLand = null; setGait('walk'); setLook(0); pet.classList.remove('is-wiggling');
        if (asleep) wake(true);
        busy = ''; clearInterval(munchTimer); clearProps(); clearTimeout(lieTimer);
        closeMenu(); setPose('drag'); pet.classList.add('is-dragging');
        say(line('drag'), {ms: 1600}); interact();
      }
      if (dragging) {
        const swing = clamp((event.clientX - down.lx) * -2.2, -30, 30);
        down.swing = (down.swing || 0) * .6 + swing * .4; down.lx = event.clientX;
        pet.style.setProperty('--swing', `${down.swing}deg`);
        down.vx = (event.clientX - (down.px ?? event.clientX)) / Math.max(1, performance.now() - (down.pt ?? performance.now())) * 1000;
        down.vy = (event.clientY - (down.py ?? event.clientY)) / Math.max(1, performance.now() - (down.pt ?? performance.now())) * 1000;
        down.px = event.clientX; down.py = event.clientY; down.pt = performance.now();
        x = clamp(event.clientX - down.ox, W / 2, innerWidth - W / 2); y = clamp(event.clientY - down.oy, H, innerHeight);
        place();
      }
      return;
    }
    // Rubbing her head (hover without pressing) counts as gentle pats.
    if (event.pointerType === 'mouse' && !tucked) {
      const box = hit.getBoundingClientRect(), headZone = event.clientY < box.top + box.height * (pose === 'sleep' ? .75 : pose === 'lie' ? .6 : .32);
      if (headZone) {
        rub += Math.abs(event.movementX) + Math.abs(event.movementY) * .5;
        if (rub > 110) {
          rub = 0; rubHearts++;
          const text = patReact(true);
          if (rubHearts % 3 === 1) say(text, {ms: 1800});
        }
        clearTimeout(rubTimer); rubTimer = setTimeout(() => { rub = 0; }, 700);
      }
    }
  });
  hit.addEventListener('pointerup', event => {
    if (!down) return;
    const wasDrag = down.moved, d = down; down = null;
    pet.classList.remove('is-dragging'); pet.style.setProperty('--swing', '0deg');
    if (wasDrag) {
      dragging = false; dropFrom = y;
      vx = clamp(d.vx || 0, -900, 900) * .5; vy = clamp(d.vy || 0, -700, 700) * .4;
      const below = floors().filter(fl => fl.y >= y - 1).sort((p, q) => p.y - q.y)[0];
      if (!motion() || !below) { const target = below || floors().at(-1); y = target.y; floorKind = target.kind; grounded = true; x = clamp(x, ...bounds(target)); restPose(); place(); }
      else { setPose('fall'); kick(); }
      event.preventDefault();
      return;
    }
    if (tucked) { say(tuck(false), {ms: 2000}); return; }
    const stamp = now();
    pokes = pokes.filter(p => stamp - p < 2500); pokes.push(stamp);
    if (pokes.length >= 5) { pokes = []; poke(); return; }
    if (d && performance.now() - d.t < 450) toggleMenu();
    say(patReact(false), {ms: 2200});
  });
  hit.addEventListener('pointercancel', () => { down = null; dragging = false; pet.classList.remove('is-dragging'); grounded = false; dropFrom = y; kick(); });
  hit.addEventListener('dblclick', event => { event.preventDefault(); closeMenu(); say(trick()); });
  hit.addEventListener('contextmenu', event => { event.preventDefault(); toggleMenu(true); });
  hit.addEventListener('click', event => { if (event.detail === 0) toggleMenu(); });

  /* ---------- action menu ---------- */
  /* The bars start from what the menu showed last and glide to the current needs: gains that land after an
     animation (eating, playing, a performance) show up at once instead of on the next click. */
  const NEEDS = ['food', 'mood', 'energy', 'xp'];
  let shown = null, glide = 0;
  const shownOf = key => (shown || S)[key];
  function xpParts(xp) {
    const lv = levelAt(xp), span = xpFor(lv + 1) - xpFor(lv);
    return {span, into: clamp(xp - xpFor(lv), 0, span)};
  }
  function statBar(key, cls) {
    const v = shownOf(key);
    return `<div class="stat ${cls}" data-need="${key}"><span>${t().stats[key]}</span><i><b style="width:${v}%"></b></i><em>${Math.round(v)}</em></div>`;
  }
  function drawNeeds() {
    menu.querySelectorAll('[data-need]').forEach(el => { const v = shown[el.dataset.need]; el.querySelector('b').style.width = `${v}%`; el.querySelector('em').textContent = Math.round(v); });
    const {into, span} = xpParts(shown.xp);
    menu.querySelectorAll('.menu-xp').forEach(el => { el.querySelector('.xp-bar b').style.width = `${into / span * 100}%`; el.querySelector('.xp-text').textContent = rc().xp(Math.round(into), span); });
  }
  function paintMenu() {
    const sw = menu.querySelector('[data-pet-act="sleep"], [data-pet-act="wake"]');
    if (sw && sw.dataset.petAct !== (asleep ? 'wake' : 'sleep')) {
      const had = document.activeElement === sw;
      renderMenu(); placeMenu();
      if (had) menu.querySelector(`[data-pet-act="${asleep ? 'wake' : 'sleep'}"]`)?.focus({preventScroll: true});
      return;
    }
    const head = menu.querySelector('.menu-head small');
    if (head) head.textContent = t().moodWords[moodKey()];
    menu.querySelector('.menu-avatar')?.setAttribute('data-face', asleep ? 2 : S.mood > 70 ? 1 : 0);
    if (!menu.querySelector('[data-need], .menu-xp')) return;   // outfit / settings tabs keep `shown`, so the bars glide on the way back
    const from = {...(shown || S)}, ms = app.motion('ui') ? 700 : 0, t0 = performance.now();
    cancelAnimationFrame(glide);
    const step = stamp => {
      const k = ms ? clamp((stamp - t0) / ms, 0, 1) : 1, e = 1 - (1 - k) ** 3;
      shown = {}; NEEDS.forEach(n => { shown[n] = from[n] + (S[n] - from[n]) * e; });
      drawNeeds();
      if (k < 1) glide = requestAnimationFrame(step);
    };
    glide = requestAnimationFrame(step);
  }
  /* The menu keeps one compact height: four tabs instead of sections that expand downwards. */
  const TABS = {en: {act: 'Play', lv: 'Levels', wear: 'Outfits', set: 'Settings'}, 'zh-TW': {act: '互動', lv: '等級', wear: '換裝', set: '設定'}, 'zh-CN': {act: '互动', lv: '等级', wear: '换装', set: '设置'}};
  function renderMenu() {
    const a = t().petActions, tabs = TABS[app.locale()] || TABS.en;
    const acts = [['pat', 'heart', a.pat], ['feed', 'fish', a.feed], ['play', 'yarn', a.play], ['lie', 'bed', a.lie],
      [asleep ? 'wake' : 'sleep', asleep ? 'sun' : 'moon', asleep ? a.wake : a.sleep], ['trick', 'star', a.trick], ['chat', 'chat', a.chat], ['hide', 'hide', a.hide]];
    const lv = level(), r = rc(), next = REWARDS.find(x => x.lv > lv), tier = lv >= 10 ? 'gold' : lv >= 7 ? 3 : lv >= 4 ? 2 : 1;
    const {span, into} = xpParts(shownOf('xp'));
    const xp = `<button type="button" class="menu-xp" data-tab="lv"><span class="xp-bar"><b style="width:${(into / span * 100).toFixed(1)}%"></b></span><span class="xp-text">${esc(r.xp(Math.round(into), span))}</span><span class="xp-next">${next ? `${esc(r.next)} ${next.icon} ${esc(r.name[next.id])} · ${r.at(next.lv)}` : esc(r.all)}</span></button>`;
    const sw = (attr, on, ic, label) => `<button type="button" class="menu-wardrobe menu-stay" ${attr} aria-pressed="${on}">${svg(ic)}<span>${label}</span><b class="stay-switch" aria-hidden="true"><i></i></b></button>`;
    const body = {
      act: `<p class="menu-say" aria-live="polite">${esc(bubble.hidden ? line('pet_pat') : bubble.querySelector('p').textContent)}</p>
        <div class="menu-stats">${statBar('food', 'is-food')}${statBar('mood', 'is-mood')}${statBar('energy', 'is-energy')}${xp}</div>
        <div class="menu-actions">${acts.map(([key, ic, label]) => `<button type="button" role="menuitem" data-pet-act="${key}">${svg(ic)}<span>${label}</span>${key === 'chat' && unread ? `<em>${unread}</em>` : ''}</button>`).join('')}</div>`,
      lv: `<div class="menu-stats menu-lvbox"><div class="lv-big"><b>Lv ${lv}</b><span>${esc(r.title)}</span></div>${xp}</div>
        <div class="menu-rewards">${REWARDS.map(x => `<div class="reward${lv >= x.lv ? ' is-on' : ''}${next === x ? ' is-next' : ''}"><span class="reward-icon">${lv >= x.lv ? x.icon : '🔒'}</span><span><b>${esc(r.name[x.id])}</b><small>${esc(r.desc[x.id])}</small></span><em>${r.at(x.lv)}</em></div>`).join('')}</div>`,
      wear: renderWardrobe(),
      set: `<div class="menu-settings">${sw('data-stay', stay, 'pin', a.stay)}${sw('data-sound', soundOn(), 'note', esc(r.sound))}</div>`,
    }[menuTab];
    menu.innerHTML = `<div class="menu-head"><span class="menu-avatar" data-face="${asleep ? 2 : S.mood > 70 ? 1 : 0}"></span><div><strong>Yuki${unlocked('gold') ? `<i class="menu-title">${esc(r.best)}</i>` : ''}</strong><small>${t().moodWords[moodKey()]}</small></div><button type="button" class="menu-level tier-${tier}" data-tab="lv" title="${esc(r.title)}">♡ ${t().stats.level} ${lv}</button></div>
      <div class="menu-tabs" role="tablist">${Object.entries(tabs).map(([k, label]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${k === menuTab}">${esc(label)}${k === 'act' && unread ? '<i></i>' : ''}</button>`).join('')}</div>
      <div class="menu-body" data-body="${menuTab}">${body}</div>`;
    paintMenu();
  }
  function renderWardrobe() {
    const c = t(), L = app.locale(), list = wardrobe()?.outfits() || [], accs = wardrobe()?.accessories || {};
    const fest = festival();
    return `<div class="wardrobe">
      <p>${c.outfitsLabel}</p><div class="wardrobe-outfits"><button type="button" data-outfit="auto" aria-pressed="${outfitChoice === 'auto'}"><span>✦ ${c.accAuto}</span></button>${list.map(o => `<button type="button" data-outfit="${o.id}" aria-pressed="${o.id === outfitChoice}" title="${esc(o.name?.[L] || o.id)}"><img src="${o.sheet}${o.thumb || 'heads.webp'}" alt="" loading="lazy" width="48" height="48"><span>${esc(o.name?.[L] || o.id)}</span></button>`).join('')}</div>
      ${list.length < 2 ? `<small>${c.moreOutfits}</small>` : ''}
      <p>${c.accessoriesLabel}</p><div class="wardrobe-accs">
        <button type="button" data-acc="auto" aria-pressed="${accChoice === 'auto'}" title="${esc(c.accAuto)}">${fest ? window.NIANSIA_FESTIVAL.motif(fest.primary.motifs[0]) : '✦'}<span>${c.accAuto}</span></button>
        <button type="button" data-acc="none" aria-pressed="${accChoice === 'none'}"><span>${c.accNone}</span></button>
        ${Object.entries(accs).map(([id, a]) => `<button type="button" data-acc="${id}" aria-pressed="${accChoice === id}" title="${esc(a.name[L])}" aria-label="${esc(a.name[L])}">${a.svg}</button>`).join('')}
      </div></div>`;
  }
  function placeMenu() {
    const box = pet.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
    let left = box.left - mw - 10;
    if (left < 8) left = box.right + 10;
    if (left + mw > innerWidth - 8) left = clamp(box.left + box.width / 2 - mw / 2, 8, innerWidth - mw - 8);
    const top = clamp(box.bottom - mh, 8, innerHeight - mh - 8);
    menu.style.transform = `translate3d(${Math.round(left)}px,${Math.round(top)}px,0)`;
  }
  function toggleMenu(force) {
    const open = force ?? menu.hidden;
    if (!open) { closeMenu(); return; }
    menuTab = 'act'; renderMenu(); menu.hidden = false; bubble.hidden = true; hit.setAttribute('aria-expanded', 'true');
    menu.classList.remove('is-in'); void menu.offsetWidth; menu.classList.add('is-in');
    placeMenu();
    menu.querySelector('button')?.focus({preventScroll: true});
  }
  function closeMenu(refocus) { if (menu.hidden) return; menu.hidden = true; hit.setAttribute('aria-expanded', 'false'); if (refocus) hit.focus({preventScroll: true}); }
  menu.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]');
    if (tab) { menuTab = tab.dataset.tab; renderMenu(); placeMenu(); menu.querySelector(`.menu-tabs [data-tab="${menuTab}"]`)?.focus({preventScroll: true}); return; }
    if (event.target.closest('[data-sound]')) { app.store.set('yuki-sound', soundOn() ? '0' : '1'); if (!soundOn()) song?.stop(); renderMenu(); placeMenu(); menu.querySelector('[data-sound]')?.focus({preventScroll: true}); return; }
    if (event.target.closest('[data-stay]')) { const text = setStay(!stay); renderMenu(); placeMenu(); say(text); menu.querySelector('[data-stay]')?.focus({preventScroll: true}); return; }
    const o = event.target.closest('[data-outfit]');
    if (o) { setOutfit(o.dataset.outfit); renderMenu(); say(t().outfitChanged); return; }
    const a = event.target.closest('[data-acc]');
    if (a) { setAccessory(a.dataset.acc); renderMenu(); menu.querySelector(`[data-acc="${a.dataset.acc}"]`)?.focus({preventScroll: true}); return; }
    const b = event.target.closest('[data-pet-act]'); if (!b) return;
    const key = b.dataset.petAct;
    if (key === 'chat') { closeMenu(); openChat(); return; }
    const text = act(key);
    if (key !== 'hide') renderMenu(); else closeMenu();
    if (text) say(text);
    // She only falls asleep after her yawn, so the sleep button may not have turned into wake yet.
    (menu.querySelector(`[data-pet-act="${key === 'sleep' ? 'wake' : key === 'wake' ? 'sleep' : key}"]`) || menu.querySelector(`[data-pet-act="${key}"]`))?.focus({preventScroll: true});
  });
  menu.addEventListener('keydown', event => {
    const items = [...menu.querySelectorAll('button')], i = items.indexOf(document.activeElement);
    const step = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4}[event.key];
    if (step) { event.preventDefault(); items[(i + step + items.length) % items.length]?.focus(); }
  });
  function setOutfit(id) {
    outfitChoice = id; loadOutfit(id); app.store.set('yuki-outfit', id);
    setPose('trick', 2, 1100); pet.classList.remove('is-spinning'); void pet.offsetWidth; pet.classList.add('is-spinning'); puff('star', 3, .6);
  }
  function setAccessory(id) {
    accChoice = id; app.store.set('yuki-acc', id); paintAccessory();
    if (accessoryId()) { setPose('happy', 2, 900); puff('heart', 2); }
  }
  function act(full) {
    interact();
    const [name, arg] = String(full).split(':');
    switch (name) {
      case 'pat': return patReact(false);
      case 'feed': return feed(arg);
      case 'play': return startPlay(arg);
      case 'lie': return lieDown();
      case 'sleep': return sleep();
      case 'wake': if (asleep) { wake(true); return line('pet_wake'); } setPose('happy', 2, 900); return line('pet_wake');
      case 'trick': return trick(arg);
      case 'hide': return tuck();
      case 'show': return tuck(false);
      case 'poke': return poke();
      default: return '';
    }
  }

  /* ---------- chat panel ---------- */
  function renderChatShell() {
    const c = t();
    chat.innerHTML = `<header><span class="chat-avatar" aria-hidden="true"></span><div class="chat-title"><strong id="yuki-chat-title">${c.chatTitle}</strong><small class="chat-status"></small></div><button type="button" class="brain-badge" data-llm-toggle title="${esc(c.llmTitle)}" aria-expanded="false">${svg('brain')}<span>local NN</span></button><button type="button" class="chat-close" aria-label="${c.close}">${svg('close')}</button></header>
      <div class="llm-card" hidden></div>
      <div class="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="chat-chips"></div>
      <form class="chat-form"><label class="sr-only" for="yuki-chat-input">${c.chatPlaceholder}</label><input id="yuki-chat-input" placeholder="${esc(c.chatPlaceholder)}" autocomplete="off" maxlength="400"><button type="submit" aria-label="${c.chatSend}">${svg('send')}</button></form>
      <p class="chat-foot">${svg('brain')} ${c.chatSubtitle}</p>`;
    messages.forEach(m => appendMessage(m, false));
    renderChips(); paintState(); paintLLM();
  }

  /* ---------- full-size Yuki (WebGPU language model) ---------- */
  const LLM = () => window.YukiLLM;
  let llmHistory = [], llmProgress = 0, llmSupport = null, llmCardOpen = null;
  const QUICK = new Set(['set_theme', 'set_language', 'motion', 'follow_toggle', 'trail_style', 'cursor_size', 'pet_pat', 'pet_feed', 'pet_play',
    'pet_sleep', 'pet_wake', 'pet_lie', 'pet_trick', 'hide', 'show', 'nav_home']);
  async function paintLLM() {
    const card = chat.querySelector('.llm-card'), badge = chat.querySelector('.brain-badge');
    if (!card || !LLM()) return;
    // Until the weights are published, the site shows only the small on-device model.
    if (!LLM().published()) { card.hidden = true; badge.disabled = true; return; }
    const c = t(), st = LLM().state();
    badge.querySelector('span').textContent = st === 'ready' ? 'Yuki 1.5B' : st === 'loading' ? `${Math.round(llmProgress * 100)}%` : 'local NN';
    badge.classList.toggle('is-llm', st === 'ready'); badge.classList.toggle('is-loading', st === 'loading');
    if (llmCardOpen === null) llmCardOpen = app.store.get('yuki-llm-card', 'open') !== 'closed';
    card.hidden = st === 'ready' || !llmCardOpen;
    badge.setAttribute('aria-expanded', String(!card.hidden));
    if (card.hidden) return;
    if (!llmSupport) llmSupport = await LLM().support();
    const note = !llmSupport.ok ? {webgpu: c.llmNoGpu, f16: c.llmNoF16, unpublished: c.llmUnpublished}[llmSupport.reason] : st === 'error' ? c.llmError : '';
    card.innerHTML = `<div class="llm-head"><strong>✨ ${c.llmTitle}</strong><button type="button" data-llm-dismiss aria-label="${c.llmDismiss}">${svg('close')}</button></div><p>${c.llmBody}</p>
      ${st === 'loading' ? `<div class="llm-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(llmProgress * 100)}"><i style="width:${Math.max(3, llmProgress * 100)}%"></i></div><small class="llm-status">${c.llmLoading} ${Math.round(llmProgress * 100)}%</small>`
        : `${note ? `<small class="llm-note">${note}</small>` : ''}<button type="button" class="llm-wake" data-llm-wake ${llmSupport.ok ? '' : 'disabled'}>${st === 'error' ? c.llmRetry : c.llmWake}</button>`}`;
  }
  function wakeLLM() {
    if (!LLM() || LLM().state() === 'loading') return;
    llmProgress = 0;
    LLM().load(report => { llmProgress = report.progress ?? llmProgress; paintLLM(); })
      .then(() => { paintLLM(); notify(app.locale() === 'en' ? 'Mm… I feel so much smarter now! Ask me anything about Niansia.' : app.locale() === 'zh-CN' ? '嗯……感觉脑袋清楚多了！关于 Niansia 的事都可以问我。' : '嗯……感覺腦袋清楚多了！關於 Niansia 的事都可以問我。'); })
      .catch(() => paintLLM());
    paintLLM();
  }
  function llmNow() {
    const {view, projectId} = app.view();
    return {page: view === 'projects' && projectId ? `projects/${projectId}` : view, lang: app.locale(), theme: app.theme(),
      food: Math.round(S.food), mood: Math.round(S.mood), energy: Math.round(S.energy), asleep: asleep ? ' · asleep' : ''};
  }
  async function quickIntent(text) {
    try { await brain.load(); const c = brain.classify(brain.extract(text).text); return QUICK.has(c.intent) && c.confidence >= .92; } catch { return false; }
  }
  function runCommands(commands) {
    const links = [], fx = window.NIANSIA_FX;
    commands.forEach(cmd => {
      const [type, value] = cmd.slice(1).split(' ');
      if (type === 'open') app.navigate(value, '', {quiet: true});
      if (type === 'project') { const item = byId(value); if (item) { openProject(item); links.push(...projectLinks(item)); } }
      if (type === 'theme') app.setTheme(value);
      if (type === 'lang' && value !== app.locale()) setTimeout(() => app.setLanguage(value), 700);
      if (type === 'pet') { if (value === 'hide') tuck(true); else if (value === 'show') tuck(false); else act(value); }
      if (type === 'trail') fx?.setTrail(value);
      if (type === 'cursor') fx?.setSize(value);
      if (type === 'follow') fx?.setFollow(value === 'on');
      if (type === 'motion') app.setMotion(value === 'on');
    });
    return links;
  }
  function remember(user, assistant) { llmHistory.push({role: 'user', content: user}, {role: 'assistant', content: assistant}); llmHistory = llmHistory.slice(-12); }
  async function sendLLM(text) {
    let el = null;
    const live = () => { typing(false); el = appendMessage({who: 'yuki', text: ''}); return el; };
    try {
      const r = await LLM().reply({text, history: llmHistory, now: llmNow()}, body => {
        (el || live()).querySelector('p').textContent = body;
        const log = chat.querySelector('.chat-log'); if (log) log.scrollTop = log.scrollHeight;
      });
      if (!el) live();
      const links = runCommands(r.commands);
      const m = {who: 'yuki', text: r.text || '…', links, meta: `${LLM().label} · ${r.seconds.toFixed(1)}s`};
      el.remove(); messages.push(m); if (messages.length > 60) messages.shift(); appendMessage(m, false);
      remember(text, r.raw);
      if (chat.hidden) say(firstSentence(m.text));
      return m;
    } catch {
      el?.remove();
      return null;
    }
  }
  function renderChips() {
    const box = chat.querySelector('.chat-chips'); if (!box) return;
    const {view, projectId} = app.view();
    const item = app.projects().find(p => p.id === projectId);
    const chips = [...t().askChips];
    if (view === 'projects' && item) chips.unshift(app.locale() === 'en' ? `What is ${item.name}?` : app.locale() === 'zh-CN' ? `${item.name} 是什么？` : `${item.name} 是什麼？`);
    box.innerHTML = chips.slice(0, 4).map(q => `<button type="button" data-chip="${esc(q)}">${esc(q)}</button>`).join('');
  }
  function appendMessage(m, animate = true) {
    const log = chat.querySelector('.chat-log'); if (!log) return;
    const el = document.createElement('div');
    el.className = `chat-msg ${m.who === 'you' ? 'from-you' : 'from-yuki'} ${animate ? 'is-new' : ''}`;
    el.innerHTML = `${m.who === 'you' ? '' : '<span class="msg-avatar" aria-hidden="true"></span>'}<div class="msg-body"><p></p>${m.links?.length ? `<div class="msg-links">${m.links.map((l, i) => `<button type="button" data-link="${i}">${esc(l.label)} ↗</button>`).join('')}</div>` : ''}${m.meta ? `<small class="msg-meta">${esc(m.meta)}</small>` : ''}</div>`;
    el.querySelector('p').textContent = m.text;
    el._links = m.links;
    log.append(el); log.scrollTop = log.scrollHeight;
    return el;
  }
  function pushMessage(m) {
    messages.push(m); if (messages.length > 60) messages.shift();
    if (!chat.hidden) appendMessage(m);
    else if (m.who === 'yuki' && m.unread) { unread++; paintState(); }
  }
  function openChat(prefill) {
    interact(); closeMenu();
    if (chat.hidden) {
      renderChatShell();
      if (!messages.length) pushMessage({who: 'yuki', text: t().hello});
      chat.hidden = false; chat.classList.remove('is-in'); void chat.offsetWidth; chat.classList.add('is-in');
      unread = 0; paintState(); placeChat();
      brain?.load().catch(() => {});
      if (LLM()?.wanted() && LLM().state() === 'idle') LLM().support().then(s => { llmSupport = s; if (s.ok) wakeLLM(); });
    }
    renderChips();
    const input = chat.querySelector('input');
    if (prefill) send(prefill); else input.focus({preventScroll: true});
    if (!asleep) setPose('happy', 2, 900);
  }
  function placeChat() {
    if (chat.hidden || innerWidth < 720) { chat.style.right = chat.style.bottom = ''; return; }
    const box = pet.getBoundingClientRect(), cw = chat.offsetWidth;
    const roomLeft = box.left - 12 - cw > 8;
    chat.style.right = roomLeft && !tucked ? `${Math.round(innerWidth - box.left + 12)}px` : '24px';
    chat.style.bottom = roomLeft && !tucked ? `${Math.max(12, Math.round(innerHeight - box.bottom))}px` : `${Math.round(innerHeight - box.top + 12)}px`;
  }
  function closeChat() { if (chat.hidden) return; chat.hidden = true; hit.focus({preventScroll: true}); }
  let typingEl = null;
  function typing(on) {
    const log = chat.querySelector('.chat-log');
    if (on && log && !typingEl) { typingEl = document.createElement('div'); typingEl.className = 'chat-msg from-yuki is-typing'; typingEl.innerHTML = `<span class="msg-avatar" aria-hidden="true"></span><div class="msg-body"><span class="dots" aria-label="${esc(t().typing)}"><i></i><i></i><i></i></span></div>`; log.append(typingEl); log.scrollTop = log.scrollHeight; }
    if (!on && typingEl) { typingEl.remove(); typingEl = null; }
    pet.classList.toggle('is-thinking', on);
  }
  async function send(text) {
    text = String(text || '').trim().slice(0, 400);
    if (!text) return;
    pushMessage({who: 'you', text});
    gain(0, 2, 0, 1);
    typing(true);
    if (LLM()?.ready() && !(await quickIntent(text)) && await sendLLM(text)) { renderChips(); return; }
    const started = performance.now();
    const reply = await think(text);
    const wait = motion() ? clamp(380 + reply.text.length * 14, 500, 1500) - (performance.now() - started) : 0;
    setTimeout(() => { typing(false); pushMessage({who: 'yuki', text: reply.text, links: reply.links, meta: reply.meta}); reply.after?.(); renderChips(); if (LLM()?.ready()) remember(text, reply.text); }, Math.max(0, wait));
  }
  chat.addEventListener('submit', event => { event.preventDefault(); const input = chat.querySelector('input'); const v = input.value; input.value = ''; send(v); });
  chat.addEventListener('click', event => {
    if (event.target.closest('.chat-close')) { closeChat(); return; }
    if (event.target.closest('[data-llm-toggle]')) { llmCardOpen = !llmCardOpen; app.store.set('yuki-llm-card', llmCardOpen ? 'open' : 'closed'); paintLLM(); return; }
    if (event.target.closest('[data-llm-dismiss]')) { llmCardOpen = false; app.store.set('yuki-llm-card', 'closed'); paintLLM(); return; }
    if (event.target.closest('[data-llm-wake]')) { wakeLLM(); return; }
    const chip = event.target.closest('[data-chip]'); if (chip) send(chip.dataset.chip);
    const link = event.target.closest('[data-link]');
    if (link) link.closest('.chat-msg')._links?.[Number(link.dataset.link)]?.run?.();
  });

  /* ---------- dialogue manager ---------- */
  const projects = () => app.projects();
  const byId = id => projects().find(p => p.id === id);
  const firstSentence = text => (String(text).match(/^.+?[。！？]|^.+?[.!?](?=\s|$)/) || [text])[0];
  function projectLinks(item) {
    return [{label: t().source, run: () => window.open(item.url, '_blank', 'noopener')}, {label: item.referenceLabel, run: () => window.open(item.reference, '_blank', 'noopener')}];
  }
  function openProject(item, quiet = true) { app.navigate('projects', item.id, {quiet}); markSeen(item.id); }
  function markSeen(id) { if (!S.seen.includes(id)) { S.seen.push(id); save(); } }
  function ruleClassify(text) {
    const l = text.toLowerCase();
    const rules = [[/作品|项目|項目|project|portfolio/, 'projects_list'], [/研究|research/, 'research'], [/聯絡|联系|email|contact|信箱|邮箱/, 'contact'],
      [/累|難過|难过|sad|tired/, 'comfort'], [/摸|pat/, 'pet_pat'], [/餵|喂|吃|feed/, 'pet_feed'], [/你是|who are you/, 'yuki_self'], [/你好|hello|hi\b|嗨/, 'greet']];
    const hitRule = rules.find(([re]) => re.test(l));
    return {intent: hitRule ? hitRule[1] : 'oos', confidence: hitRule ? .6 : .2};
  }
  function brainText() {
    const info = brain?.info();
    if (!info) return 'offline';
    return `${info.params.toLocaleString()} params · ${info.intents} intents · ${Math.round(info.metrics.heldout * 100)}% held-out`;
  }
  async function think(raw) {
    const text = raw.trim();
    const tour = window.YUKI_TOUR;
    if (tour && /導覽|导览|\btour\b|guide me|show me around|帶我逛|带我逛|帶我參觀|带我参观|逛一圈/i.test(text)) {
      return {text: tour.pitch(), links: tour.routes().map(r => ({label: r.label, run: () => tour.start(r.id)})), meta: 'tour'};
    }
    if (/節日|节日|連假|连假|holiday|festival|什麼日子|什么日子/i.test(text)) {
      const f = festival(), next = window.NIANSIA_FESTIVAL?.upcoming(new Date(), 1)[0];
      const L = app.locale();
      const upcoming = next ? `${next.festival.name[L]} ${next.start.slice(5).replace('-', '/')}` : '';
      return {text: f ? festivalLine(f) : fill(t().festivalNone, {next: upcoming}), meta: 'festival'};
    }
    let ok = !!brain;
    try { await brain.load(); } catch { ok = false; }
    const ent = ok ? brain.extract(text) : {text};
    const cls = ok ? brain.classify(ent.text) : ruleClassify(text);
    const ret = ok ? brain.retrieve(text, window.NIANSIA_PROJECTS) : [];
    let intent = cls.intent;
    const conf = cls.confidence;
    if (ent.project && ['oos', 'projects_list', 'help_chat', 'project_find', 'skills', 'pet_status', 'research'].includes(intent) && conf < .8) intent = 'project_detail';
    if (conf < .38 && intent !== 'oos') intent = ret[0]?.score > .12 ? 'project_find' : 'oos';
    if (intent === 'oos' && ret[0]?.score > .2) intent = 'project_find';
    const reply = perform(intent, {ent, ret, text});
    reply.meta = ok ? `${intent} · ${Math.round(conf * 100)}%` : 'rules';
    if (!ok) reply.text = `${reply.text}\n${t().brainOff}`;
    return reply;
  }
  function perform(intent, {ent, ret, text}) {
    const L = app.locale(), c = t();
    const vars = {user: app.store.get('user', 'niansia'), count: projects().length, email: 'niansia930202@gmail.com', brain: brainText()};
    const out = (key, extra, after) => ({text: line(key, {...vars, ...extra}), after});
    const {view, projectId} = app.view();
    switch (intent) {
      case 'projects_list': {
        app.navigate('projects', '', {quiet: true});
        const r = out('projects_list', {list: projects().map(p => p.name).join(L === 'en' ? ', ' : '、')});
        r.links = projects().slice(0, 4).map(p => ({label: p.name, run: () => openProject(p, false)}));
        return r;
      }
      case 'project_detail': case 'project_find': case 'project_recommend': case 'project_latest': {
        let item = null;
        if (intent === 'project_detail') item = byId(ent.project) || (view === 'projects' && byId(projectId)) || (ret[0]?.score > .1 && byId(ret[0].id));
        if (intent === 'project_find') item = (ret[0]?.score > .04 && byId(ret[0].id)) || byId(ent.project);
        if (intent === 'project_recommend') { const pool = projects().filter(p => !S.seen.includes(p.id) && p.id !== projectId); item = pick(pool.length ? pool : projects()); }
        if (intent === 'project_latest') item = projects()[0];
        if (!item) return perform('projects_list', {ent, ret, text});
        openProject(item);
        const r = out(intent, {name: item.name, desc: item.description, category: item.category, status: item.status});
        r.links = projectLinks(item);
        if (intent === 'project_find' && ret[1]?.score > ret[0].score * .6) { const alt = byId(ret[1].id); r.links.push({label: alt.name, run: () => openProject(alt, false)}); }
        pose !== 'sleep' && setPose('happy', 2, 900);
        return r;
      }
      case 'about_owner': app.navigate('about', '', {quiet: true}); return out('about_owner');
      case 'education': return out('education');
      case 'research': app.navigate('research', '', {quiet: true}); return out('research');
      case 'contact': { app.navigate('contact', '', {quiet: true}); const r = out('contact'); r.links = [{label: c.send, run: () => { location.href = 'mailto:niansia930202@gmail.com'; }}]; return r; }
      case 'github': {
        const item = byId(ent.project);
        const r = out('github'); r.links = [{label: item ? item.name : 'github.com/niansia', run: () => window.open(item ? item.url : 'https://github.com/niansia', '_blank', 'noopener')}];
        return r;
      }
      case 'set_language': {
        const order = ['en', 'zh-TW', 'zh-CN'];
        let code = ent.lang;
        if (/看不懂|讀不懂|读不懂|can'?t read|don'?t understand/i.test(text)) code = code === 'en' ? 'zh-TW' : 'en';
        if (!code) code = order[(order.indexOf(L) + 1) % 3];
        return {text: fill(pick(LINES[code].set_language), {lang: LANG_NAMES[code]}), after: () => { if (code !== L) setTimeout(() => app.setLanguage(code), 350); }};
      }
      case 'set_theme': {
        const list = app.themes;
        let name = /太暗|too dark/i.test(text) ? 'light' : /太亮|too bright|眼睛好痛|刺眼/i.test(text) ? 'dark' : ent.theme;
        if (!name) name = list[(list.indexOf(app.theme()) + 1) % list.length];
        return out('set_theme', {theme: c.themeNames[name]}, () => app.setTheme(name));
      }
      case 'motion': {
        const off = /關|关|停|暫停|暂停|off|stop|pause|disable|太多|眼花|distract/i.test(text);
        return out('motion', {state: off ? c.motionOff : c.motionOn}, () => app.setMotion(!off));
      }
      case 'follow_toggle': {
        const off = /不要|別|别|stop|don'?t|do not|關|关|hide|off|隱藏|隐藏/i.test(text);
        window.NIANSIA_FX?.setFollow(!off);
        return out('follow_toggle', {state: off ? c.followOff : c.followOn});
      }
      case 'trail_style': {
        const modes = ['hearts', 'paws', 'stars', 'petals', 'off'], current = window.NIANSIA_FX?.state().trail || 'hearts';
        let mode = /貓掌|猫掌|腳印|脚印|paw/i.test(text) ? 'paws' : /星|star|sparkle/i.test(text) ? 'stars' : /花瓣|petal|sakura|櫻|樱/i.test(text) ? 'petals'
          : /愛心|爱心|heart/i.test(text) ? 'hearts' : /關|关|off|disable|hide|不要/i.test(text) ? 'off' : modes[(modes.indexOf(current) + 1) % 4];
        window.NIANSIA_FX?.setTrail(mode);
        return out('trail_style', {trail: c.trails[mode]});
      }
      case 'cursor_size': {
        const order = ['s', 'm', 'l'], current = window.NIANSIA_FX?.state().size || 'm';
        const step = /小|smaller|tiny|太大/i.test(text) ? -1 : 1;
        const size = order[clamp(order.indexOf(current) + step, 0, 2)];
        window.NIANSIA_FX?.setSize(size);
        return out('cursor_size', {size: c.sizes[size]});
      }
      case 'pet_pat': return {text: act('pat')};
      case 'pet_feed': return {text: act('feed')};
      case 'pet_play': return {text: act('play')};
      case 'pet_sleep': return {text: act('sleep')};
      case 'pet_wake': return {text: act('wake')};
      case 'pet_lie': return {text: act('lie')};
      case 'pet_trick': return {text: act('trick')};
      case 'hide': return {text: tuck(true)};
      case 'show': return {text: tuck(false)};
      case 'pet_status': {
        const feeling = S.food < 35 ? line('feelingHungry') : S.energy < 30 ? line('feelingSleepy') : S.mood < 45 ? line('feelingLonely') : line('feelingGood');
        return out('pet_status', {food: Math.round(S.food), mood: Math.round(S.mood), energy: Math.round(S.energy), level: level(), feeling});
      }
      case 'time_date': {
        const d = new Date();
        return out('time_date', {time: new Intl.DateTimeFormat(L, {timeStyle: 'short'}).format(d), date: new Intl.DateTimeFormat(L, {dateStyle: 'full'}).format(d)});
      }
      case 'nav_home': app.navigate('home', '', {quiet: true}); return out('nav_home');
      case 'compliment': case 'love': gain(0, 6, 0, 3); setPose('happy', 2, 1200); puff('heart', 4); return out(intent);
      case 'happy': trick(); return out('happy');
      case 'insult': poke(); return out('insult');
      case 'comfort': puff('heart', 2); gain(0, 2); return out('comfort');
      case 'laugh': setPose('happy', 2, 900); return out('laugh');
      default: return out(lines(intent)[0] ? intent : 'oos');
    }
  }
  async function ask(text, {source} = {}) {
    interact();
    if (LLM()?.ready() && !(await quickIntent(text))) {
      try {
        const r = await LLM().reply({text, history: llmHistory, now: llmNow()});
        runCommands(r.commands); remember(text, r.raw);
        say(firstSentence(r.text), {ms: 5000});
        messages.push({who: 'you', text}, {who: 'yuki', text: r.text, meta: LLM().label});
        return {text: `Yuki › ${r.text}`, links: []};
      } catch {}
    }
    const reply = await think(text);
    reply.after?.();
    if (source === 'terminal') {
      say(firstSentence(reply.text), {ms: 5000});
      messages.push({who: 'you', text}, {who: 'yuki', text: reply.text, meta: reply.meta});
      reply.text = `Yuki › ${reply.text}`;
      reply.links = [];
    }
    return reply;
  }

  /* ---------- notifications & neglect ---------- */
  function notify(text, {pose: p = 'happy', actions} = {}) {
    if (!text) return;
    if (!asleep) setPose(p, p === 'happy' ? 2 : undefined, 1200);
    say(text, {actions, ms: 8000});
    pushMessage({who: 'yuki', text, unread: chat.hidden});
    if (chat.hidden) { pet.classList.remove('is-calling'); void pet.offsetWidth; pet.classList.add('is-calling'); }
  }
  function nudge() {
    nudges++;
    if (S.food < 30) { notify(line('hungry'), {actions: [{label: t().petActions.feed, run: () => say(feed())}]}); return; }
    if (S.energy < 22) { notify(line('sleepy'), {pose: 'yawn'}); return; }
    const unseen = projects().filter(p => !S.seen.includes(p.id));
    const item = pick(unseen.length ? unseen : projects());
    const text = line('idle', {name: item.name});
    notify(text, {actions: text.includes(item.name) ? [{label: item.name + ' ↗', run: () => openProject(item, false)}] : [{label: t().petActions.chat, run: () => openChat()}]});
  }
  setInterval(() => {
    const stamp = now();
    S.food = clamp(S.food - (asleep ? .15 : .3), 0, 100);
    S.energy = clamp(S.energy + (asleep ? 1.6 : -.15), 0, 100);
    if (stamp - lastInteract > 120000) S.mood = clamp(S.mood - .2, 0, 100);
    if (asleep && S.energy >= 100 && stamp - sleptAt > 120000 && stamp - lastActive < 60000) { wake(false); }
    save(); paintState();
    if (document.hidden || dragging) return;
    if (!asleep && !busy && stamp - lastActive > 360000) { sleep(); return; }
    // Only speak up after about five minutes without attention, then back off further each time.
    const gap = 300000 * Math.pow(1.6, nudges);
    if (!asleep && !tucked && chat.hidden && stamp - lastInteract > gap && stamp - lastActive < 60000) nudge();
  }, 15000);
  setInterval(() => { if (unlocked('aura') && S.mood > 80 && !asleep && !tucked && !dragging && !document.hidden && motion()) puff('star', 1, 1.3); }, 6500);
  ['pointermove', 'keydown', 'scroll', 'wheel', 'touchstart'].forEach(type => window.addEventListener(type, () => { lastActive = now(); }, {passive: true, capture: true}));
  let titleTimer;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenAt = now();
      titleTimer = setTimeout(() => { titleBackup = document.title; document.title = `(${unread + 1}) ♡ ${line('titleNudge')}`; }, 300000);
    } else {
      clearTimeout(titleTimer);
      if (titleBackup) { document.title = titleBackup; titleBackup = ''; }
      const minutes = Math.round((now() - hiddenAt) / 60000);
      if (hiddenAt && minutes >= 5) { if (asleep) wake(true); notify(line('welcomeBack', {minutes})); }
      hiddenAt = 0;
    }
  });

  /* ---------- state painting & app events ---------- */
  function paintState() {
    const key = moodKey(), word = t().moodWords?.[key] || key;
    pet.dataset.mood = key;
    hit.setAttribute('aria-label', `${t().petLabel} ${word}.`);
    badge.hidden = !unread; badge.textContent = unread > 9 ? '9+' : String(unread);
    document.querySelectorAll('[data-yuki-status]').forEach(el => {
      el.querySelector('span').textContent = `yuki · ${word} · ♡${level()}`;
      el.classList.toggle('has-unread', unread > 0);
    });
    const status = chat.querySelector('.chat-status');
    if (status) status.textContent = `${word} · ${t().stats.level} ${level()}`;
    chat.querySelector('.chat-avatar')?.setAttribute('data-face', asleep ? '2' : S.mood > 70 ? '1' : '0');
    window.dispatchEvent(new CustomEvent('yuki:state', {detail: {asleep, mood: key, level: level()}}));
    if (!menu.hidden) paintMenu();
  }
  window.addEventListener('niansia:navigate', event => {
    const {view, id, quiet} = event.detail;
    renderChips();
    if (id) markSeen(id);
    if (quiet || asleep || tucked || busy === 'eat') return;
    interact();
    const item = byId(id);
    say(item ? `${item.name} · ${item.status}` : t().routeReplies[view], {ms: 2600});
    dir = -1; place();
    if (motion()) { pet.classList.remove('is-hop'); void pet.offsetWidth; pet.classList.add('is-hop'); }
  });
  window.addEventListener('niansia:theme', () => { if (!asleep) { setPose('happy', 2, 900); puff('star', 2, .5); } });
  window.addEventListener('niansia:locale', () => { if (!chat.hidden) renderChatShell(); if (!menu.hidden) renderMenu(); paintState(); });
  window.addEventListener('niansia:festival', () => { loadOutfit(outfitChoice); paintAccessory(); if (!menu.hidden) renderMenu(); const l = festivalLine(); if (l) say(l); });
  window.addEventListener('niansia:shell', () => requestAnimationFrame(() => { reground(); paintState(); }));
  window.addEventListener('niansia:layout', () => requestAnimationFrame(reground));
  window.addEventListener('niansia:motion', () => { if (!motion()) { walkTo = null; stopPlay(); } });
  window.addEventListener('resize', reground);
  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!menu.hidden) { event.preventDefault(); event.stopImmediatePropagation(); closeMenu(true); }
    else if (!chat.hidden && (chat.contains(document.activeElement) || document.activeElement === document.body)) { event.preventDefault(); event.stopImmediatePropagation(); closeChat(); }
  }, true);
  document.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && !pet.contains(event.target)) closeMenu(); }, true);

  function setStay(on) {
    stay = !!on; app.store.set('yuki-stay', stay ? '1' : '0'); pet.classList.toggle('is-staying', stay);
    if (stay && walkTo !== null) { walkTo = null; onArrive = null; setGait('walk'); restPose(); }
    return stay ? t().stayOn : t().stayOff;
  }
  pet.classList.toggle('is-staying', stay);

  window.YUKI = {
    stay: on => on === undefined ? stay : setStay(on),
    walkTo: target => walk(clamp(target, ...bounds(floorOf(floorKind)))), stretch,
    move(name) {
      if (asleep) wake(true);
      if (busy || dragging || tucked || !grounded || leaping) return false;
      walkTo = null; onArrive = null; setGait('walk');
      const [a, b] = bounds(floorOf(floorKind)), far = x < (a + b) / 2 ? b - 40 : a + 40;
      ({jump: () => hopHop(2), run: () => dash(far), dance, cute: beCute, pounce, butterfly: chaseButterfly, look: lookAround}[name] || (() => {}))();
      return true;
    },
    setOutfit, setAccessory, festivalLine, outfit: () => outfitChoice, accessory: () => accChoice,
    level, rewards: () => REWARDS.map(r => ({...r, unlocked: level() >= r.lv, name: rc().name[r.id]})),
    offer: (text, actions) => { if (tucked || asleep) { pushMessage({who: 'yuki', text, links: actions}); return; } say(text, {ms: 12000, actions}); pushMessage({who: 'yuki', text, links: actions}); },
    act, ask, say: (text, kind) => { if (kind === 'poke') poke(); say(text); pushMessage({who: 'yuki', text}); }, openChat, closeChat,
    asleep: () => asleep, dragging: () => dragging,
    summary: () => `${t().moodWords[moodKey()]} · Lv ${level()}`,
    report() {
      const bar = v => '█'.repeat(Math.round(v / 10)).padEnd(10, '░');
      const s = t().stats;
      return `${s.food.padEnd(8)} ${bar(S.food)} ${Math.round(S.food)}%\n${s.mood.padEnd(8)} ${bar(S.mood)} ${Math.round(S.mood)}%\n${s.energy.padEnd(8)} ${bar(S.energy)} ${Math.round(S.energy)}%\n♡ ${s.level} ${level()} (xp ${S.xp})\n${t().moodWords[moodKey()]} · visit #${S.visits}`;
    },
    brainReport() {
      const info = brain?.info();
      if (!info) { brain?.load().catch(() => {}); return t().brainLoading; }
      return `yuki.brain — on-device intent model\n  features  char / word n-grams, hashed into ${Number(8192).toLocaleString()} buckets (${info.rows.toLocaleString()} kept)\n  model     ${info.dim}-d embeddings → attention pooling → MLP ${info.hidden} → ${info.intents} intents\n  size      ${info.params.toLocaleString()} parameters, int8 embeddings\n  training  ${info.metrics.examples.toLocaleString()} generated utterances (EN / 繁 / 简)\n  accuracy  ${Math.round(info.metrics.valid * 1000) / 10}% validation · ${Math.round(info.metrics.heldout * 1000) / 10}% on ${info.metrics.heldoutSize} held-out questions\n  extras    entity slots (project / language / style) + TF-IDF project retrieval\n  privacy   runs in this tab; nothing is sent anywhere`;
    }
  };

  /* ---------- start ---------- */
  measure();
  loadOutfit(outfitChoice); paintAccessory();
  wardrobe()?.ready.then(() => { loadOutfit(outfitChoice); if (!menu.hidden) renderMenu(); });
  pet.dataset.pose = 'idle'; setFrame(0);
  tucked = app.store.get('yuki-tucked', coarse.matches || innerWidth < 720 ? '1' : '0') === '1';
  pet.classList.toggle('is-tucked', tucked);
  requestAnimationFrame(() => {
    reground();
    setTimeout(() => pet.classList.add('is-ready'), 3000); // loadOutfit shows her once the look has loaded
    blink(); schedule(); paintState();
    const fest = festival(), greetedKey = app.store.get('yuki-fest-greeted', '');
    let greet = S.visits === 1 ? line('firstVisit') : line('returning', {visits: S.visits});
    if (fest && greetedKey !== fest.key + app.locale()) { greet = festivalLine(fest); app.store.set('yuki-fest-greeted', fest.key + app.locale()); }
    setTimeout(() => { if (!tucked) say(greet, {ms: 6000}); pushMessage({who: 'yuki', text: greet}); }, 1400);
  });
  save();
  // Warm the chat model (~80 KB) once the page has finished loading, so it never competes with the first paint; with
  // Save-Data on it loads only when someone actually talks to Yuki (openChat and every reply call brain.load()).
  const warm = () => brain?.load().catch(() => {});
  const idle = () => { if ('requestIdleCallback' in window) requestIdleCallback(warm, {timeout: 4000}); else setTimeout(warm, 2500); };
  if (!navigator.connection?.saveData) { if (document.readyState === 'complete') idle(); else addEventListener('load', idle, {once: true}); }
})();
