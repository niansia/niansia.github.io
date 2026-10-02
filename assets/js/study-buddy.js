/* Study companion on the exam gallery (/exams/): Yuki as a cat sits in the corner and keeps you company while you
   work through a mock exam. Tap her for the days left to the exam and two tabs:
   - Focus: a focus timer (25/5 or 50/10) and today's count.
   - Mock exam: pick a GSAT or AST subject and she proctors it with the official time (CEEC 116 handbook: 國綜 and 國寫
     90 min; English, Math A and Math B 100; Social Studies and Science 110; every AST subject 80). A confirmation, a
     five-second countdown, then only "end exam" is offered, no pause. Leaving the page is a strike: another tab at
     once; another window, app or system popup after a 10-second countdown shown on the page. The first strike brings a
     warning on return, the second voids the attempt, as in a real exam room. A reload is not a strike, but a page left
     for longer than a few seconds is (a heartbeat records when the page was last open).
   Timers run on end times, so a throttled background tab or a reload does not lose them; nothing leaves the browser.
   Needs assets/js/yuki-cat.js and the cat sheet; without them the companion stays hidden. */
(() => {
  'use strict';
  const Cat = window.YukiCat;
  if (!Cat) return;
  // Official dates, from the CEEC press release of 2026-08-03 (115.08.03): GSAT 2027-01-22..24, AST 2027-07-10..11.
  const EXAMS = [{id: 'gsat', start: '2027-01-22', end: '2027-01-24'}, {id: 'ast', start: '2027-07-10', end: '2027-07-11'}];
  // Subject times from the CEEC 116 handbook (簡章 p. 9 and p. 14).
  const SUBJECTS = {
    gsat: [['chinese', 90], ['writing', 90], ['english', 100], ['math-a', 100], ['math-b', 100], ['social', 110], ['science', 110]],
    ast: [['math-ja', 80], ['math-yi', 80], ['physics', 80], ['chemistry', 80], ['biology', 80], ['history', 80], ['geography', 80], ['civics', 80]]
  };
  const tw = !/hans|cn/i.test(document.documentElement.lang);
  const T = tw ? {
    name: '陪讀 Yuki', open: '打開陪讀面板', close: '收起', hide: '讓 Yuki 先離開', show: '叫 Yuki 回來陪讀',
    exam: {gsat: '116 學測', ast: '116 分科測驗'}, short: {gsat: '學測', ast: '分科'}, left: n => `還有 ${n} 天`, today: '就是今天，加油！', week: ['日', '一', '二', '三', '四', '五', '六'],
    focus: '專注', rest: '休息', ready: '準備好就開始吧', focusing: '專注中', resting: '休息中', start: '開始', pause: '暫停', resume: '繼續', reset: '重設',
    done: (n, m) => `今天完成 ${n} 輪 · 共 ${m} 分鐘`, none: '今天還沒開始，先來一輪吧', sound: '結束時響一聲', min: '分',
    tabs: {focus: '番茄鐘', mock: '模擬考'},
    subj: {chinese: '國綜', writing: '國寫', english: '英文', 'math-a': '數學A', 'math-b': '數學B', social: '社會', science: '自然',
      'math-ja': '數學甲', 'math-yi': '數學乙', physics: '物理', chemistry: '化學', biology: '生物', history: '歷史', geography: '地理', civics: '公民與社會'},
    pickNote: '選一科，我照大考中心公布的時間幫你監考', source: '時間依 116 學年度考試簡章',
    askTitle: (s, m) => `開始「${s}」模擬考？`, askBody: m => `作答時間 ${m} 分鐘。開始後只能結束考試，不能暫停；切換分頁、視窗或 App 會被記違規：第一次警告，第二次本次考試作廢。系統通知之類的小窗跳出時，有 10 秒可以點回這個頁面。`,
    askTip: '題本請先印出來，或用另一台裝置打開，這個頁面只負責計時。', go: '開始考試', cancel: '取消', begin: '開始作答！',
    examOn: s => `${s} 模擬考中`, strikes: n => `違規 ${n}/2`, end: '結束考試',
    endTitle: '要提前結束這場考試嗎？', endBody: m => `會記錄為提前交卷（已作答 ${m} 分鐘）。`, endYes: '結束考試', endNo: '繼續考試',
    warnTitle: '抓到了！', warnBody: '考試中不能切換視窗喔～如果不想計時，請直接按「結束考試」；否則再切換一次，本次考試成績就作廢。', warnOk: '我知道了，繼續考試',
    voidTitle: '本次考試作廢', voidBody: '切換視窗，本次考試成績作廢。請遵守考試規則～', ok: '好',
    upTitle: '時間到！', upBody: s => `請停筆，雙手離開桌面～「${s}」模擬考完成，辛苦了！`,
    earlyTitle: '已交卷', earlyBody: (s, m) => `「${s}」作答 ${m} 分鐘。下次試試寫完整場吧！`,
    away: '⚠ 考試中，請回到考試頁面', graceTitle: '有系統小窗跳出來了嗎？', graceBody: '考試頁面失去焦點了，請點一下這個頁面回到考試；倒數結束會記一次違規。', graceStruck: '已經記一次違規了，請回到考試頁面。', recent: '最近：', status: {done: '完成', early: '提前交卷', void: '作廢'},
    remind: m => `剩下 ${m} 分鐘，記得檢查答案卡～`, lockTab: '考試中不能切換',
    say: {hello: ['我陪你讀書～', '寫一份模擬考吧，我在旁邊', '累了就摸摸我'], focus: ['專心，我不吵你', '一起加油', '我在這裡陪你'],
      rest: ['辛苦了！休息一下，喝口水', '完成一輪了，伸個懶腰吧', '做得好～休息時間'], back: ['休息結束，回來繼續吧', '再一輪就好！'],
      pat: ['呼嚕呼嚕……♡', '讀書辛苦了', '喵～'], proctor: ['開始作答！我會安靜監考～', '專心寫，我在旁邊看著喔', '加油！不會的先跳過'], patExam: ['噓～考試中', '專心寫題目！', '（安靜地看著你）']}
  } : {
    name: '陪读 Yuki', open: '打开陪读面板', close: '收起', hide: '让 Yuki 先离开', show: '叫 Yuki 回来陪读',
    exam: {gsat: '116 学测', ast: '116 分科测验'}, short: {gsat: '学测', ast: '分科'}, left: n => `还有 ${n} 天`, today: '就是今天，加油！', week: ['日', '一', '二', '三', '四', '五', '六'],
    focus: '专注', rest: '休息', ready: '准备好就开始吧', focusing: '专注中', resting: '休息中', start: '开始', pause: '暂停', resume: '继续', reset: '重设',
    done: (n, m) => `今天完成 ${n} 轮 · 共 ${m} 分钟`, none: '今天还没开始，先来一轮吧', sound: '结束时响一声', min: '分',
    tabs: {focus: '番茄钟', mock: '模拟考'},
    subj: {chinese: '国综', writing: '国写', english: '英文', 'math-a': '数学A', 'math-b': '数学B', social: '社会', science: '自然',
      'math-ja': '数学甲', 'math-yi': '数学乙', physics: '物理', chemistry: '化学', biology: '生物', history: '历史', geography: '地理', civics: '公民与社会'},
    pickNote: '选一科，我照大考中心公布的时间帮你监考', source: '时间依 116 学年度考试简章',
    askTitle: (s, m) => `开始“${s}”模拟考？`, askBody: m => `作答时间 ${m} 分钟。开始后只能结束考试，不能暂停；切换标签页、窗口或 App 会被记违规：第一次警告，第二次本次考试作废。系统通知之类的小窗跳出时，有 10 秒可以点回这个页面。`,
    askTip: '题本请先打印出来，或用另一台设备打开，这个页面只负责计时。', go: '开始考试', cancel: '取消', begin: '开始作答！',
    examOn: s => `${s} 模拟考中`, strikes: n => `违规 ${n}/2`, end: '结束考试',
    endTitle: '要提前结束这场考试吗？', endBody: m => `会记录为提前交卷（已作答 ${m} 分钟）。`, endYes: '结束考试', endNo: '继续考试',
    warnTitle: '抓到了！', warnBody: '考试中不能切换窗口哦～如果不想计时，请直接按“结束考试”；否则再切换一次，本次考试成绩就作废。', warnOk: '我知道了，继续考试',
    voidTitle: '本次考试作废', voidBody: '切换窗口，本次考试成绩作废。请遵守考试规则～', ok: '好',
    upTitle: '时间到！', upBody: s => `请停笔，双手离开桌面～“${s}”模拟考完成，辛苦了！`,
    earlyTitle: '已交卷', earlyBody: (s, m) => `“${s}”作答 ${m} 分钟。下次试试写完整场吧！`,
    away: '⚠ 考试中，请回到考试页面', graceTitle: '有系统小窗跳出来了吗？', graceBody: '考试页面失去焦点了，请点一下这个页面回到考试；倒数结束会记一次违规。', graceStruck: '已经记一次违规了，请回到考试页面。', recent: '最近：', status: {done: '完成', early: '提前交卷', void: '作废'},
    remind: m => `剩下 ${m} 分钟，记得检查答题卡～`, lockTab: '考试中不能切换',
    say: {hello: ['我陪你读书～', '写一份模拟考吧，我在旁边', '累了就摸摸我'], focus: ['专心，我不吵你', '一起加油', '我在这里陪你'],
      rest: ['辛苦了！休息一下，喝口水', '完成一轮了，伸个懒腰吧', '做得好～休息时间'], back: ['休息结束，回来继续吧', '再一轮就好！'],
      pat: ['呼噜呼噜……♡', '读书辛苦了', '喵～'], proctor: ['开始作答！我会安静监考～', '专心写，我在旁边看着哦', '加油！不会的先跳过'], patExam: ['嘘～考试中', '专心写题目！', '（安静地看着你）']}
  };
  const PRESETS = [[25, 5], [50, 10]];
  const store = {get(k, d) { try { return JSON.parse(localStorage.getItem(`niansia-study-${k}`)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(`niansia-study-${k}`, JSON.stringify(v)); } catch {} }};
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const day = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  // focus timer state: the preset, the phase, and either an end time (running) or the time left (paused)
  let S = {preset: 0, phase: 'idle', end: 0, left: 0, sound: false, tab: 'focus', ...store.get('timer', {})};
  const save = () => store.set('timer', S);
  const tally = () => { const t = store.get('tally', {}); return t.day === day() ? t : {day: day(), rounds: 0, minutes: 0}; };
  // mock exam state: subject, start/end times, strikes, reminders already given, and a heartbeat (last time the page was open)
  let X = store.get('mock', null);
  const saveX = () => store.set('mock', X);
  const examOn = () => !!X && X.end > 0;
  const minutesOf = id => [...SUBJECTS.gsat, ...SUBJECTS.ast].find(([k]) => k === id)?.[1] || 0;

  function nextExam(now = new Date()) {
    const e = EXAMS.find(x => x.end >= day(now));
    if (!e) return null;
    const [y, m, d] = e.start.split('-').map(Number), start = new Date(y, m - 1, d);
    const days = Math.round((start - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    return {...e, days, date: `${y}/${m}/${d}（${T.week[start.getDay()]}）`};
  }

  const chips = group => SUBJECTS[group].map(([k, m]) => `<button type="button" data-subject="${k}"><b>${esc(T.subj[k])}</b><small>${m}′</small></button>`).join('');
  const root = document.createElement('div');
  root.className = 'sb';
  root.innerHTML = `<div class="sb-bubble" role="status" aria-live="polite" hidden></div>
    <section class="sb-panel" hidden aria-label="${T.name}">
      <header><b>${T.name}</b><button type="button" class="sb-x" data-sb="close" aria-label="${T.close}">×</button></header>
      <div class="sb-exam"></div>
      <div class="sb-tabs" role="tablist"><button type="button" role="tab" data-tab="focus">${T.tabs.focus}</button><button type="button" role="tab" data-tab="mock">${T.tabs.mock}</button></div>
      <div class="sb-pane" data-pane="focus">
        <div class="sb-timer"><small class="sb-phase"></small><strong class="sb-clock">25:00</strong>
          <div class="sb-presets" role="group">${PRESETS.map(([f, r], i) => `<button type="button" data-preset="${i}">${f}/${r} ${T.min}</button>`).join('')}</div>
          <div class="sb-btns"><button type="button" class="sb-go" data-sb="go"></button><button type="button" data-sb="reset">${T.reset}</button></div>
          <label class="sb-sound"><input type="checkbox" data-sb="sound"> ${T.sound}</label></div>
        <p class="sb-today"></p>
      </div>
      <div class="sb-pane" data-pane="mock" hidden>
        <div class="sb-pickbox"><p class="sb-note">${T.pickNote}</p>
          <p class="sb-group">${T.short.gsat}</p><div class="sb-subjects">${chips('gsat')}</div>
          <p class="sb-group">${T.short.ast}</p><div class="sb-subjects">${chips('ast')}</div>
          <p class="sb-recent"></p><p class="sb-src">${T.source}</p></div>
        <div class="sb-run" hidden><small class="sb-run-title"></small><strong class="sb-xclock"></strong>
          <div class="sb-bar"><i></i></div><small class="sb-strikes"></small>
          <button type="button" class="sb-stop" data-sb="stop">${T.end}</button></div>
      </div>
      <button type="button" class="sb-bye" data-sb="hide">${T.hide}</button>
    </section>
    <button type="button" class="sb-cat" aria-label="${T.open}" aria-expanded="false"><span class="yuki-cat" aria-hidden="true"></span><em class="sb-chip"></em></button>
    <button type="button" class="sb-call" data-sb="show" hidden>🐾 <span>${T.show}</span></button>
    <div class="sb-grace" role="alert" hidden><b>⚠ ${T.graceTitle}</b><strong class="sb-grace-n"></strong><span class="sb-grace-msg"></span></div>
    <div class="sb-modal" hidden><div class="sb-dialog" role="alertdialog" aria-modal="true" aria-labelledby="sb-dlg-title"></div></div>`;
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
  // while you focus she naps beside you; on a break she rolls on her back; in an exam she sits up and watches
  const restPose = () => pose(examOn() ? 'sit' : S.phase === 'rest' ? 'belly' : S.phase === 'focus' ? 'curl' : 'sit');
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const fmtLong = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600); return h ? `${h}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : fmt(ms); };
  const remaining = () => S.end ? S.end - Date.now() : S.left || PRESETS[S.preset][S.phase === 'rest' ? 1 : 0] * 60000;
  const running = () => !!S.end;
  const baseTitle = document.title;
  let awayNow = false;

  function paint() {
    const e = nextExam(), left = remaining(), on = examOn();
    $('.sb-exam').innerHTML = e ? `<span>${T.exam[e.id]} · ${e.date}</span><b>${e.days > 0 ? T.left(e.days) : T.today}</b>` : '';
    $('.sb-exam').hidden = !e;
    const tab = on ? 'mock' : S.tab;
    root.querySelectorAll('[data-tab]').forEach(b => { b.setAttribute('aria-selected', String(b.dataset.tab === tab)); b.disabled = on && b.dataset.tab !== 'mock'; b.title = b.disabled ? T.lockTab : ''; });
    root.querySelectorAll('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; });
    $('.sb-phase').textContent = S.phase === 'idle' ? T.ready : S.phase === 'focus' ? T.focusing : T.resting;
    $('.sb-clock').textContent = fmt(left);
    $('.sb-go').textContent = running() ? T.pause : S.left ? T.resume : T.start;
    root.querySelectorAll('[data-preset]').forEach(b => { b.setAttribute('aria-pressed', String(Number(b.dataset.preset) === S.preset)); b.disabled = S.phase !== 'idle'; });
    $('[data-sb="sound"]').checked = !!S.sound;
    const t = tally();
    $('.sb-today').textContent = t.rounds ? T.done(t.rounds, t.minutes) : T.none;
    $('.sb-pickbox').hidden = on; $('.sb-run').hidden = !on;
    if (on) {
      const xl = X.end - Date.now(), total = X.minutes * 60000;
      $('.sb-run-title').textContent = T.examOn(T.subj[X.subject]);
      $('.sb-xclock').textContent = fmtLong(xl);
      $('.sb-bar i').style.width = `${Math.min(100, Math.max(0, (1 - xl / total) * 100))}%`;
      $('.sb-strikes').textContent = T.strikes(X.strikes);
      root.classList.toggle('is-late', xl < 10 * 60000);
    } else {
      root.classList.remove('is-late');
      const log = store.get('mocklog', []).slice(0, 3);
      $('.sb-recent').textContent = log.length ? T.recent + log.map(r => `${T.subj[r.subject]} ${T.status[r.status]}`).join(' · ') : '';
    }
    const chip = $('.sb-chip');
    chip.textContent = on ? `${T.subj[X.subject]} ${fmtLong(X.end - Date.now())}` : S.phase !== 'idle' ? `${S.phase === 'focus' ? T.focus : T.rest} ${fmt(left)}` : e && e.days > 0 ? `${T.short[e.id]} ${e.days}` : '';
    chip.hidden = !chip.textContent;
    document.title = on && awayNow ? T.away : on ? `⏱ ${fmtLong(X.end - Date.now())} · ${baseTitle}` : running() ? `⏱ ${fmt(left)} · ${baseTitle}` : baseTitle;
    root.dataset.phase = on ? 'exam' : S.phase;
  }
  function chime(force) {
    if (!S.sound && !force) return;
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
  function finish() {   // the running focus phase ran out
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

  /* ---------- dialogs ---------- */
  let onClose = null;
  function dialog(html, buttons, closeWith) {
    const box = $('.sb-dialog');
    box.innerHTML = `${html}${buttons.length ? `<div class="sb-dlg-btns">${buttons.map(([k, label, main]) => `<button type="button" data-dlg="${k}"${main ? ' class="is-main"' : ''}>${esc(label)}</button>`).join('')}</div>` : ''}`;
    $('.sb-modal').hidden = false; onClose = closeWith || null;
    box.querySelector('.is-main, button')?.focus({preventScroll: true});
  }
  function closeDialog() { $('.sb-modal').hidden = true; $('.sb-dialog').innerHTML = ''; }
  const card = (title, body, extra = '') => `<span class="sb-dlg-pet" aria-hidden="true"><span class="sb-dlg-cat yuki-cat"></span></span><h3 id="sb-dlg-title">${esc(title)}</h3><p>${esc(body)}</p>${extra}`;
  function paintDialogCat(name) { const c = $('.sb-dlg-cat'); if (c) Cat.paint(c, name); }

  /* ---------- mock exam ---------- */
  function ask(subject) {
    if (examOn()) return;
    const m = minutesOf(subject); if (!m) return;
    dialog(card(T.askTitle(T.subj[subject], m), T.askBody(m), `<p class="sb-dlg-tip">${esc(T.askTip)}</p>`), [['start:' + subject, T.go, true], ['cancel', T.cancel]]);
    paintDialogCat('sit');
  }
  let countdown = 0, counting = false;
  function begin(subject) {
    if (running()) { S.phase = 'idle'; S.end = 0; S.left = 0; save(); }   // a focus round gives way to the exam
    let n = 5; counting = true;
    const step = () => {
      if (n > 0) { dialog(`<strong class="sb-count${reduced ? '' : ' is-pop'}">${n}</strong><p class="sb-count-sub">${esc(T.subj[subject])}</p>`, [['cancel', T.cancel]]); n--; countdown = setTimeout(step, 1000); return; }
      dialog(`<strong class="sb-count sb-count-go${reduced ? '' : ' is-pop'}">${esc(T.begin)}</strong>`, []);
      counting = false;
      const minutes = minutesOf(subject), now = Date.now();
      X = {subject, minutes, start: now, end: now + minutes * 60000, strikes: 0, told: [], beat: now};
      saveX(); chime();
      countdown = setTimeout(() => { closeDialog(); pose('happy', 'sit', 1300); say(pick(T.say.proctor), 4200); paint(); }, 900);
    };
    step();
  }
  function record(status) {
    const used = Math.max(0, Math.round((Math.min(Date.now(), X.end) - X.start) / 60000));
    const log = store.get('mocklog', []);
    log.unshift({subject: X.subject, status, minutes: used, day: day()});
    store.set('mocklog', log.slice(0, 20));
    return used;
  }
  function endExam(status) {
    if (!examOn()) return;
    const subject = X.subject, used = record(status);
    X = null; saveX(); awayNow = false;
    if (status === 'done') { chime(true); dialog(card(T.upTitle, T.upBody(T.subj[subject])), [['ok', T.ok, true]]); paintDialogCat('stretch'); pose('stretch', 'happy', 2200); }
    if (status === 'early') { dialog(card(T.earlyTitle, T.earlyBody(T.subj[subject], used)), [['ok', T.ok, true]]); paintDialogCat('sit'); }
    if (status === 'void') { dialog(card(T.voidTitle, T.voidBody), [['ok', T.ok, true]]); paintDialogCat('crouch'); pose('crouch', 'sit', 2600); }
    paint();
  }
  // A strike is one trip away from the page, however it happened (tab, window, app, or a page left open elsewhere).
  let pending = '';
  function strike() {
    if (!examOn() || awayNow || leaving) return;
    awayNow = true; X.strikes += 1;
    if (X.strikes >= 2) { pending = 'void'; const subject = X.subject; record('void'); X = {voided: subject}; X.end = 0; }
    else pending = 'warn';
    saveX(); paint();
  }
  function back() {
    if (!awayNow && !pending) return;
    awayNow = false;
    if (pending === 'warn') { dialog(card(T.warnTitle, T.warnBody), [['ok', T.warnOk, true]]); paintDialogCat('swipe'); pose('swipe', 'sit', 1500); }
    if (pending === 'void') { X = null; saveX(); dialog(card(T.voidTitle, T.voidBody), [['ok', T.ok, true]]); paintDialogCat('crouch'); pose('crouch', 'sit', 2600); }
    pending = ''; paint();
  }
  /* Focus lost while the page stays visible (a system notification, another window or app): a banner says so and counts
     down GRACE seconds. Clicking back into the page cancels it; when it runs out, that trip becomes a strike and the
     banner says so until the visitor returns, which brings the usual warning or void dialog. */
  const GRACE = 10;
  let leaving = false, graceTimer = 0, graceLeft = 0;
  function graceBanner(text, n) {
    const g = $('.sb-grace');
    g.querySelector('.sb-grace-msg').textContent = text;
    g.querySelector('.sb-grace-n').textContent = n ?? '';
    g.querySelector('.sb-grace-n').hidden = n === undefined;
    g.hidden = false;
  }
  function stopGrace(keepBanner) {
    clearInterval(graceTimer); graceTimer = 0;
    if (!keepBanner) $('.sb-grace').hidden = true;
  }
  function startGrace() {
    if (graceTimer || awayNow || !examOn()) return;
    graceLeft = GRACE; graceBanner(T.graceBody, graceLeft);
    graceTimer = setInterval(() => {
      if (document.hasFocus() || !examOn()) { stopGrace(); return; }
      graceLeft -= 1;
      if (graceLeft > 0) { graceBanner(T.graceBody, graceLeft); return; }
      stopGrace(true); strike();
      graceBanner(pending === 'void' ? T.voidBody : T.graceStruck);
    }, 1000);
  }
  addEventListener('pagehide', () => { leaving = true; });   // a reload is not a strike; the heartbeat catches a page left for longer
  addEventListener('pageshow', () => { leaving = false; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && counting) { clearTimeout(countdown); counting = false; closeDialog(); restPose(); }   // left during the countdown: it simply does not start
    if (document.hidden) { stopGrace(); strike(); } else back();   // another tab counts at once, without the grace
    tick();
  });
  addEventListener('blur', () => { if (examOn() && !document.hidden) startGrace(); });
  addEventListener('focus', () => { stopGrace(); if (!document.hidden) back(); });

  function tick() {
    if (running() && remaining() <= 0) finish();
    if (examOn()) {
      const xl = X.end - Date.now();
      if (xl <= 0) { endExam('done'); return; }
      if (!document.hidden) X.beat = Date.now();
      [15, 5].forEach(m => { if (xl <= m * 60000 && xl > (m - 1) * 60000 && !X.told.includes(m) && !awayNow) { X.told.push(m); say(T.remind(m), 6000); } });
      saveX();
    }
    paint();
  }
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
    if (next) { paint(); panel.querySelector(examOn() ? '.sb-stop' : S.tab === 'mock' ? '[data-subject]' : '.sb-go')?.focus({preventScroll: true}); }
  }
  function setAway(away) {
    store.set('hidden', away); root.classList.toggle('is-away', away);
    $('.sb-call').hidden = !away; if (away) toggle(false);
  }
  const hop = () => { if (reduced) return; catEl.classList.remove('is-hop'); void catEl.offsetWidth; catEl.classList.add('is-hop'); };
  catEl.addEventListener('animationend', event => { if (event.animationName === 'sb-hop') catEl.classList.remove('is-hop'); });   // back to breathing

  root.addEventListener('click', event => {
    const b = event.target.closest('button,input'); if (!b) return;
    if (b.dataset.dlg) {
      const [k, arg] = b.dataset.dlg.split(':');
      if (k === 'start') { begin(arg); return; }
      if (k === 'cancel') { clearTimeout(countdown); counting = false; closeDialog(); restPose(); return; }
      if (k === 'end') { closeDialog(); endExam('early'); return; }
      closeDialog(); restPose(); return;
    }
    if (b.classList.contains('sb-cat')) {
      const open = $('.sb-panel').hidden;
      toggle(open);
      if (open) { pose('happy', null); setTimeout(restPose, 1300); say(pick(examOn() ? T.say.patExam : T.say.pat), 2600); hop(); }
      return;
    }
    if (b.dataset.tab) { if (!examOn()) { S.tab = b.dataset.tab; save(); paint(); } return; }
    if (b.dataset.subject) { ask(b.dataset.subject); return; }
    if (b.dataset.preset !== undefined) { if (S.phase === 'idle') { S.preset = Number(b.dataset.preset); S.left = 0; save(); paint(); } return; }
    const k = b.dataset.sb;
    if (k === 'close') toggle(false);
    if (k === 'go') go();
    if (k === 'reset') reset();
    if (k === 'stop' && examOn()) { const m = Math.round((Date.now() - X.start) / 60000); dialog(card(T.endTitle, T.endBody(m)), [['end', T.endYes, false], ['keep', T.endNo, true]]); paintDialogCat('sit'); }
    if (k === 'hide') setAway(true);
    if (k === 'show') { setAway(false); pose('happy', 'sit', 1500); say(pick(T.say.hello)); hop(); }
    if (k === 'sound') { S.sound = b.checked; save(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!$('.sb-modal').hidden) { if ($('.sb-dialog [data-dlg="cancel"], .sb-dialog [data-dlg="keep"]')) { $('.sb-dialog [data-dlg="cancel"], .sb-dialog [data-dlg="keep"]').click(); } return; }
    if (!$('.sb-panel').hidden) { toggle(false); $('.sb-cat').focus(); }
  });

  const css = document.createElement('style');
  css.textContent = `
.sb [hidden]{display:none!important;}
.sb{position:fixed;right:16px;bottom:14px;z-index:40;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font:14px/1.5 'Noto Sans TC','Noto Sans SC',system-ui,sans-serif;color:var(--ink,#2a2230);}
.sb-cat{position:relative;width:var(--sbw,112px);height:var(--sbh,86px);padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.sb-cat .yuki-cat{display:block;}
.sb-cat:focus-visible{outline:2px solid var(--accent,#c0673a);outline-offset:4px;border-radius:14px;}
.sb-cat .yuki-cat.is-hop{animation:sb-hop .45s ease-out;}
.sb-chip{position:absolute;right:-4px;top:-6px;padding:1px 8px;border-radius:99px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);font:600 11.5px 'JetBrains Mono',ui-monospace,monospace;font-style:normal;color:var(--accent,#c0673a);box-shadow:0 4px 12px -6px #2a223055;white-space:nowrap;}
.sb[data-phase='exam'] .sb-chip{background:var(--accent,#c0673a);color:#fff;border-color:transparent;}
.sb.is-late .sb-chip,.sb.is-late .sb-xclock{color:#c2410c;}.sb.is-late[data-phase='exam'] .sb-chip{background:#c2410c;color:#fff;}
.sb-bubble{max-width:230px;padding:8px 12px;border-radius:14px 14px 4px 14px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);box-shadow:0 10px 26px -14px #2a223066;font-size:13.5px;}
.sb-panel{width:min(318px,calc(100vw - 32px));max-height:calc(100vh - 130px);overflow:auto;padding:14px 16px 12px;border-radius:18px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);box-shadow:0 22px 50px -24px #2a223077;}
.sb-panel header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.sb-x{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:var(--muted,#766b73);font-size:20px;cursor:pointer;}
.sb-exam{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:12px;background:var(--code,#f3ece2);margin-bottom:10px;}
.sb-exam span{font-size:12.5px;color:var(--muted,#766b73);}.sb-exam b{font-size:20px;}
.sb-tabs{display:flex;gap:4px;padding:3px;margin-bottom:10px;border-radius:12px;background:var(--code,#f3ece2);}
.sb-tabs button{flex:1;padding:6px 8px;border:0;border-radius:9px;background:none;color:var(--muted,#766b73);font:600 13px/1.2 inherit;cursor:pointer;}
.sb-tabs button[aria-selected='true']{background:var(--paper,#fffdf9);color:var(--accent,#c0673a);box-shadow:0 2px 8px -4px #2a223044;}
.sb-tabs button:disabled{opacity:.45;cursor:not-allowed;}
.sb-timer,.sb-run{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0 4px;}
.sb-phase,.sb-run-title{color:var(--muted,#766b73);font-size:12.5px;}
.sb-clock,.sb-xclock{font:700 42px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.02em;font-variant-numeric:tabular-nums;}
.sb-xclock{font-size:38px;color:var(--accent,#c0673a);}
.sb[data-phase='focus'] .sb-clock{color:var(--accent,#c0673a);}.sb[data-phase='rest'] .sb-clock{color:#3f8f6b;}
.sb-presets,.sb-btns{display:flex;gap:8px;}
.sb-presets button,.sb-btns button,.sb-bye,.sb-call,.sb-stop,.sb-dlg-btns button{padding:7px 14px;border-radius:10px;border:1px solid var(--line,#2a22301a);background:var(--paper,#fffdf9);color:var(--ink,#2a2230);font:600 13px/1.2 inherit;cursor:pointer;}
.sb-presets button[aria-pressed='true']{border-color:var(--accent,#c0673a);color:var(--accent,#c0673a);}
.sb-presets button:disabled{opacity:.5;cursor:default;}
.sb-btns .sb-go,.sb-dlg-btns .is-main{background:var(--accent,#c0673a);border-color:transparent;color:#fff;min-width:96px;}
.sb-sound{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted,#766b73);}
.sb-today{margin:8px 0 6px;font-size:12.5px;color:var(--muted,#766b73);text-align:center;}
.sb-note,.sb-recent,.sb-src{margin:0 0 6px;font-size:12px;color:var(--muted,#766b73);}
.sb-src{margin-top:4px;font-size:10.5px;opacity:.8;}
.sb-group{margin:6px 0 4px;font:600 11.5px/1 inherit;color:var(--accent,#c0673a);}
.sb-subjects{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;}
.sb-subjects button{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px;border-radius:10px;border:1px solid var(--line,#2a22301a);background:var(--paper,#fffdf9);color:var(--ink,#2a2230);cursor:pointer;font:inherit;}
.sb-subjects button b{font-size:12.5px;white-space:nowrap;}.sb-subjects button small{font:10.5px 'JetBrains Mono',ui-monospace,monospace;color:var(--muted,#766b73);}
.sb-subjects button:hover,.sb-subjects button:focus-visible{border-color:var(--accent,#c0673a);color:var(--accent,#c0673a);}
.sb-bar{width:100%;height:6px;border-radius:99px;background:var(--code,#f3ece2);overflow:hidden;}
.sb-bar i{display:block;height:100%;border-radius:99px;background:var(--accent,#c0673a);transition:width .9s linear;}
.sb.is-late .sb-bar i{background:#c2410c;}
.sb-strikes{font-size:12px;color:var(--muted,#766b73);}
.sb-stop{border-color:#c2410c55;color:#c2410c;}
.sb-bye{display:block;margin:6px auto 0;border:0;background:none;color:var(--muted,#766b73);font-weight:500;font-size:12px;text-decoration:underline;}
.sb.is-away .sb-cat,.sb.is-away .sb-bubble{display:none;}
.sb-call{font-size:12px;box-shadow:0 6px 16px -10px #2a223066;}
.sb-grace{position:fixed;left:50%;top:16px;z-index:61;transform:translateX(-50%);display:grid;grid-template-columns:auto auto;align-items:center;gap:2px 14px;width:min(460px,calc(100vw - 24px));padding:12px 16px;border-radius:16px;background:var(--paper,#fffdf9);border:2px solid #f59e0b;box-shadow:0 18px 44px -18px #2a2230aa;color:var(--ink,#2a2230);}
.sb-grace b{grid-column:1;font-size:14.5px;}
.sb-grace .sb-grace-n{grid-column:2;grid-row:1 / span 2;font:800 40px/1 'JetBrains Mono',ui-monospace,monospace;color:#c2410c;font-variant-numeric:tabular-nums;}
.sb-grace .sb-grace-msg{grid-column:1;font-size:13px;line-height:1.6;color:var(--muted,#766b73);}
.sb-modal{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:#1d152466;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);}
.sb-modal[hidden]{display:none;}
.sb-dialog{width:min(380px,100%);padding:18px 20px 16px;border-radius:20px;background:var(--paper,#fffdf9);border:1px solid var(--line,#2a22301a);box-shadow:0 30px 70px -30px #2a2230aa;text-align:center;}
.sb-dialog h3{margin:2px 0 6px;font-size:18px;}
.sb-dialog p{margin:0 0 8px;font-size:14px;line-height:1.7;}
.sb-dlg-tip{padding:8px 10px;border-radius:10px;background:var(--code,#f3ece2);font-size:12.5px!important;color:var(--muted,#766b73);}
.sb-dlg-pet{position:relative;display:block;margin:0 auto 4px;width:var(--sbw,112px);height:var(--sbh,86px);}.sb-dlg-pet .yuki-cat{display:block;}
.sb-dlg-btns{display:flex;justify-content:center;gap:8px;margin-top:10px;flex-wrap:wrap;}
.sb-count{display:block;font:800 88px/1.1 'JetBrains Mono',ui-monospace,monospace;color:var(--accent,#c0673a);}
.sb-count-go{font-size:34px;padding:18px 0;}
.sb-count-sub{color:var(--muted,#766b73);}
.sb-count.is-pop{animation:sb-pop .9s ease-out both;}
@keyframes sb-pop{0%{transform:scale(.4);opacity:0;}30%{transform:scale(1.12);opacity:1;}60%{transform:scale(1);}100%{transform:scale(1);}}
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
    // An exam carried over from the last page: time up, or the page was left for longer than a reload takes.
    if (X && X.voided) { X = null; saveX(); }
    if (examOn()) {
      if (Date.now() >= X.end) endExam('done');
      else if (Date.now() - (X.beat || 0) > 6000) { strike(); back(); }
    }
    paint();
    setInterval(tick, 1000);
    if (!store.get('hidden', false) && !examOn()) setTimeout(() => say(pick(T.say.hello)), 1200);
  }).catch(() => {});
})();
