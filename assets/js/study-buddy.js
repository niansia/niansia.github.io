/* Study companion on the exam gallery (/exams/): Yuki as a cat sits in the corner and keeps you company while you
   work through a mock exam. Tap her for the days left to the exam, a focus timer (25/5 or 50/10) and today's count.
   The timer runs on end times, so a throttled background tab or a reload does not lose it; nothing leaves the browser.
   Needs assets/js/yuki-cat.js and the cat sheet; without them the companion stays hidden. */
(() => {
  'use strict';
  const Cat = window.YukiCat;
  if (!Cat) return;
  // Official dates, from the CEEC press release of 2026-08-03 (115.08.03): GSAT 2027-01-22..24, AST 2027-07-10..11.
  const EXAMS = [{id: 'gsat', start: '2027-01-22', end: '2027-01-24'}, {id: 'ast', start: '2027-07-10', end: '2027-07-11'}];
  const tw = !/hans|cn/i.test(document.documentElement.lang);
  const T = tw ? {
    name: '陪讀 Yuki', open: '打開陪讀面板', close: '收起', hide: '讓 Yuki 先離開', show: '叫 Yuki 回來陪讀',
    exam: {gsat: '116 學測', ast: '116 分科測驗'}, short: {gsat: '學測', ast: '分科'}, left: n => `還有 ${n} 天`, today: '就是今天，加油！', week: ['日', '一', '二', '三', '四', '五', '六'],
    focus: '專注', rest: '休息', ready: '準備好就開始吧', focusing: '專注中', resting: '休息中', start: '開始', pause: '暫停', resume: '繼續', reset: '重設',
    done: (n, m) => `今天完成 ${n} 輪 · 共 ${m} 分鐘`, none: '今天還沒開始，先來一輪吧', sound: '結束時響一聲', min: '分',
    say: {hello: ['我陪你讀書～', '寫一份模擬考吧，我在旁邊', '累了就摸摸我'], focus: ['專心，我不吵你', '一起加油', '我在這裡陪你'],
      rest: ['辛苦了！休息一下，喝口水', '完成一輪了，伸個懶腰吧', '做得好～休息時間'], back: ['休息結束，回來繼續吧', '再一輪就好！'],
      pat: ['呼嚕呼嚕……♡', '讀書辛苦了', '喵～']}
  } : {
    name: '陪读 Yuki', open: '打开陪读面板', close: '收起', hide: '让 Yuki 先离开', show: '叫 Yuki 回来陪读',
    exam: {gsat: '116 学测', ast: '116 分科测验'}, short: {gsat: '学测', ast: '分科'}, left: n => `还有 ${n} 天`, today: '就是今天，加油！', week: ['日', '一', '二', '三', '四', '五', '六'],
    focus: '专注', rest: '休息', ready: '准备好就开始吧', focusing: '专注中', resting: '休息中', start: '开始', pause: '暂停', resume: '继续', reset: '重设',
    done: (n, m) => `今天完成 ${n} 轮 · 共 ${m} 分钟`, none: '今天还没开始，先来一轮吧', sound: '结束时响一声', min: '分',
    say: {hello: ['我陪你读书～', '写一份模拟考吧，我在旁边', '累了就摸摸我'], focus: ['专心，我不吵你', '一起加油', '我在这里陪你'],
      rest: ['辛苦了！休息一下，喝口水', '完成一轮了，伸个懒腰吧', '做得好～休息时间'], back: ['休息结束，回来继续吧', '再一轮就好！'],
      pat: ['呼噜呼噜……♡', '读书辛苦了', '喵～']}
  };
  const PRESETS = [[25, 5], [50, 10]];
  const store = {get(k, d) { try { return JSON.parse(localStorage.getItem(`niansia-study-${k}`)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(`niansia-study-${k}`, JSON.stringify(v)); } catch {} }};
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // timer state: the preset, the phase, and either an end time (running) or the time left (paused)
  let S = {preset: 0, phase: 'idle', end: 0, left: 0, sound: false, ...store.get('timer', {})};
  const save = () => store.set('timer', S);
  const tally = () => { const t = store.get('tally', {}); return t.day === day() ? t : {day: day(), rounds: 0, minutes: 0}; };

  function nextExam(now = new Date()) {
    const e = EXAMS.find(x => x.end >= day(now));
    if (!e) return null;
    const [y, m, d] = e.start.split('-').map(Number), start = new Date(y, m - 1, d);
    const days = Math.round((start - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    return {...e, days, date: `${y}/${m}/${d}（${T.week[start.getDay()]}）`};
  }

  const root = document.createElement('div');
  root.className = 'sb';
  root.innerHTML = `<div class="sb-bubble" role="status" aria-live="polite" hidden></div>
    <section class="sb-panel" hidden aria-label="${T.name}">
      <header><b>${T.name}</b><button type="button" class="sb-x" data-sb="close" aria-label="${T.close}">×</button></header>
      <div class="sb-exam"></div>
      <div class="sb-timer"><small class="sb-phase"></small><strong class="sb-clock">25:00</strong>
        <div class="sb-presets" role="group">${PRESETS.map(([f, r], i) => `<button type="button" data-preset="${i}">${f}/${r} ${T.min}</button>`).join('')}</div>
        <div class="sb-btns"><button type="button" class="sb-go" data-sb="go"></button><button type="button" data-sb="reset">${T.reset}</button></div>
        <label class="sb-sound"><input type="checkbox" data-sb="sound"> ${T.sound}</label></div>
      <p class="sb-today"></p>
      <button type="button" class="sb-bye" data-sb="hide">${T.hide}</button>
    </section>
    <button type="button" class="sb-cat" aria-label="${T.open}" aria-expanded="false"><span class="yuki-cat" aria-hidden="true"></span><em class="sb-chip"></em></button>
    <button type="button" class="sb-call" data-sb="show" hidden>🐾 <span>${T.show}</span></button>`;
  const $ = s => root.querySelector(s), catEl = $('.yuki-cat');

  let bubbleTimer = 0, frameTimer = 0;
  function say(text, ms = 3800) {
    const b = $('.sb-bubble'); b.textContent = text; b.hidden = false;
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => { b.hidden = true; }, ms);
  }
  function pose(name, then, ms) {
    Cat.paint(catEl, name);
    clearTimeout(frameTimer);
    if (then) frameTimer = setTimeout(() => Cat.paint(catEl, then), ms);
  }
  // while you focus she naps beside you; on a break she rolls on her back; otherwise she sits and waits
  const restPose = () => pose(S.phase === 'rest' ? 'belly' : S.phase === 'focus' ? 'curl' : 'sit');
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const remaining = () => S.end ? S.end - Date.now() : S.left || PRESETS[S.preset][S.phase === 'rest' ? 1 : 0] * 60000;
  const running = () => !!S.end;
  const baseTitle = document.title;

  function paint() {
    const e = nextExam(), left = remaining();
    $('.sb-exam').innerHTML = e ? `<span>${T.exam[e.id]} · ${e.date}</span><b>${e.days > 0 ? T.left(e.days) : T.today}</b>` : '';
    $('.sb-exam').hidden = !e;
    $('.sb-phase').textContent = S.phase === 'idle' ? T.ready : S.phase === 'focus' ? T.focusing : T.resting;
    $('.sb-clock').textContent = fmt(left);
    $('.sb-go').textContent = running() ? T.pause : S.left ? T.resume : T.start;
    root.querySelectorAll('[data-preset]').forEach(b => { b.setAttribute('aria-pressed', String(Number(b.dataset.preset) === S.preset)); b.disabled = S.phase !== 'idle'; });
    $('[data-sb="sound"]').checked = !!S.sound;
    const t = tally();
    $('.sb-today').textContent = t.rounds ? T.done(t.rounds, t.minutes) : T.none;
    const chip = $('.sb-chip');
    chip.textContent = S.phase !== 'idle' ? `${S.phase === 'focus' ? T.focus : T.rest} ${fmt(left)}` : e && e.days > 0 ? `${T.short[e.id]} ${e.days}` : '';
    chip.hidden = !chip.textContent;
    document.title = running() ? `⏱ ${fmt(left)} · ${baseTitle}` : baseTitle;
    root.dataset.phase = S.phase;
  }
  function chime() {
    if (!S.sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, .18].forEach((t, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + t;
        o.type = 'sine'; o.frequency.value = i ? 1046.5 : 784;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.18, at + .02); g.gain.exponentialRampToValueAtTime(.001, at + .6);
        o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + .65);
      });
      setTimeout(() => ctx.close(), 1200);
    } catch {}
  }
  function finish() {   // the running phase ran out
    if (S.phase === 'focus') {
      const t = tally(); t.rounds += 1; t.minutes += PRESETS[S.preset][0]; store.set('tally', t);
      S.phase = 'rest'; S.end = Date.now() + PRESETS[S.preset][1] * 60000; S.left = 0;
      pose('stretch', 'belly', 2200); say(pick(T.say.rest), 6000);
    } else {
      S.phase = 'idle'; S.end = 0; S.left = 0;
      pose('happy', 'sit', 2600); say(pick(T.say.back), 6000);
    }
    chime(); save(); paint();
  }
  function tick() { if (running() && remaining() <= 0) finish(); paint(); }
  function go() {
    if (running()) { S.left = remaining(); S.end = 0; }   // pause
    else {
      if (S.phase === 'idle') { S.phase = 'focus'; say(pick(T.say.focus)); pose('happy', 'curl', 1400); }
      S.end = Date.now() + (S.left || PRESETS[S.preset][S.phase === 'rest' ? 1 : 0] * 60000); S.left = 0;
    }
    save(); paint();
  }
  function reset() { S.phase = 'idle'; S.end = 0; S.left = 0; save(); restPose(); paint(); }
  function toggle(open) {
    const panel = $('.sb-panel'), next = open ?? panel.hidden;
    panel.hidden = !next; $('.sb-cat').setAttribute('aria-expanded', String(next));
    if (next) { paint(); panel.querySelector('.sb-go').focus({preventScroll: true}); }
  }
  function setAway(away) {
    store.set('hidden', away); root.classList.toggle('is-away', away);
    $('.sb-call').hidden = !away; if (away) toggle(false);
  }
  const hop = () => { if (reduced) return; catEl.classList.remove('is-hop'); void catEl.offsetWidth; catEl.classList.add('is-hop'); };
  catEl.addEventListener('animationend', event => { if (event.animationName === 'sb-hop') catEl.classList.remove('is-hop'); });   // back to breathing

  root.addEventListener('click', event => {
    const b = event.target.closest('button,input'); if (!b) return;
    if (b.classList.contains('sb-cat')) {
      const open = $('.sb-panel').hidden;
      toggle(open);
      if (open) { pose('happy', null); setTimeout(restPose, 1300); say(pick(T.say.pat), 2600); hop(); }
      return;
    }
    if (b.dataset.preset !== undefined) { if (S.phase === 'idle') { S.preset = Number(b.dataset.preset); S.left = 0; save(); paint(); } return; }
    const k = b.dataset.sb;
    if (k === 'close') toggle(false);
    if (k === 'go') go();
    if (k === 'reset') reset();
    if (k === 'hide') setAway(true);
    if (k === 'show') { setAway(false); pose('happy', 'sit', 1500); say(pick(T.say.hello)); hop(); }
    if (k === 'sound') { S.sound = b.checked; save(); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('.sb-panel').hidden) { toggle(false); $('.sb-cat').focus(); } });

  const css = document.createElement('style');
  css.textContent = `
.sb{position:fixed;right:16px;bottom:14px;z-index:40;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font:14px/1.5 'Noto Sans TC','Noto Sans SC',system-ui,sans-serif;color:var(--ink,#2a2230);}
.sb-cat{position:relative;width:var(--sbw,112px);height:var(--sbh,86px);padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.sb-cat .yuki-cat{display:block;}
.sb-cat:focus-visible{outline:2px solid var(--accent,#c0673a);outline-offset:4px;border-radius:14px;}
.sb-cat .yuki-cat.is-hop{animation:sb-hop .45s ease-out;}
.sb-chip{position:absolute;right:-4px;top:-6px;padding:1px 8px;border-radius:99px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);font:600 11.5px 'JetBrains Mono',ui-monospace,monospace;font-style:normal;color:var(--accent,#c0673a);box-shadow:0 4px 12px -6px #2a223055;white-space:nowrap;}
.sb-bubble{max-width:230px;padding:8px 12px;border-radius:14px 14px 4px 14px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);box-shadow:0 10px 26px -14px #2a223066;font-size:13.5px;}
.sb-panel{width:min(300px,calc(100vw - 32px));padding:14px 16px 12px;border-radius:18px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);box-shadow:0 22px 50px -24px #2a223077;}
.sb-panel header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.sb-x{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:var(--muted,#766b73);font-size:20px;cursor:pointer;}
.sb-exam{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--code,#f3ece2);margin-bottom:10px;}
.sb-exam span{font-size:12.5px;color:var(--muted,#766b73);}.sb-exam b{font-size:20px;}
.sb-timer{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 4px;}
.sb-phase{color:var(--muted,#766b73);font-size:12.5px;}
.sb-clock{font:700 42px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.02em;font-variant-numeric:tabular-nums;}
.sb[data-phase='focus'] .sb-clock{color:var(--accent,#c0673a);}.sb[data-phase='rest'] .sb-clock{color:#3f8f6b;}
.sb-presets,.sb-btns{display:flex;gap:8px;}
.sb-presets button,.sb-btns button,.sb-bye,.sb-call{padding:7px 14px;border-radius:10px;border:1px solid var(--line,#2a22301a);background:var(--paper,#fffdf9);color:var(--ink,#2a2230);font:600 13px/1.2 inherit;cursor:pointer;}
.sb-presets button[aria-pressed='true']{border-color:var(--accent,#c0673a);color:var(--accent,#c0673a);}
.sb-presets button:disabled{opacity:.5;cursor:default;}
.sb-btns .sb-go{background:var(--accent,#c0673a);border-color:transparent;color:#fff;min-width:96px;}
.sb-sound{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted,#766b73);}
.sb-today{margin:8px 0 6px;font-size:12.5px;color:var(--muted,#766b73);text-align:center;}
.sb-bye{display:block;margin:0 auto;border:0;background:none;color:var(--muted,#766b73);font-weight:500;font-size:12px;text-decoration:underline;}
.sb.is-away .sb-cat,.sb.is-away .sb-bubble{display:none;}
.sb-call{font-size:12px;box-shadow:0 6px 16px -10px #2a223066;}
@keyframes sb-hop{40%{transform:translateY(-12%);}70%{transform:translateY(-2%);}}
@media(max-width:600px){.sb{right:10px;bottom:10px;}.sb-cat{width:calc(var(--sbw) * .75);height:calc(var(--sbh) * .75);}}
@media(prefers-reduced-motion:reduce){.sb-cat,.sb-cat *{animation:none!important;}}`;

  Cat.load().then(L => {
    const h = Math.round(64 / L.stand[1]);   // the box follows the sheet's cell; a standing cat is about 64 px tall
    root.style.setProperty('--cn', L.frames.length);
    root.style.setProperty('--sbh', `${h}px`); root.style.setProperty('--sbw', `${Math.round(h * L.cell[0] / L.cell[1])}px`);
    document.head.append(css); document.body.append(root);
    setAway(!!store.get('hidden', false));
    if (running() && remaining() <= 0) finish(); else restPose();
    paint();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    if (!store.get('hidden', false)) setTimeout(() => say(pick(T.say.hello)), 1200);
  }).catch(() => {});
})();
