/* Guestbook (guestbook.md): anonymous notes that appear only after Niansia approves them.
   A visitor signs in anonymously only when they post (never on page load). The database rules in
   tools/firebase/database.rules.json do the real guarding: length limits, one note per minute per visitor,
   a pending queue nobody but the site owner can read, and approved notes that only the owner can write.
   Notes are always shown as plain text. */
(() => {
  'use strict';
  const CONFIG = {apiKey: 'AIzaSyAsAJl4RX9NjA1OWx_53V8QDjA0YzuXX6k', authDomain: 'niansia-site.firebaseapp.com', databaseURL: 'https://niansia-site-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'niansia-site', appId: '1:764017812912:web:882b9a7a88f4da9640a275'};
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const LIMIT = {name: 40, text: 500, gap: 60000, minFill: 3000, shown: 100};
  const COPY = {
    en: {title: 'Guestbook', intro: 'Leave a note: a hello, a question, or what you thought of the site. Every note is read by me before it shows up here, so please leave out anything personal.',
      name: 'Name', namePh: 'Anonymous', text: 'Note', textPh: 'Say hi…', send: 'Send', sending: 'Sending…', review: 'Notes appear after I have read them.',
      sent: 'Thank you! Your note will appear here once I have read it.', empty: 'No notes yet. Be the first!', loading: 'Loading notes…', count: n => `${n} note${n === 1 ? '' : 's'}`,
      tooShort: 'Write a little something first.', tooFast: 'That was quick. Please wait a minute before sending another note.', failed: 'The note could not be sent. Please try again later.',
      offline: 'Notes could not be loaded right now.', anon: 'Anonymous', list: 'Approved notes'},
    'zh-TW': {title: '留言板', intro: '想打聲招呼、問個問題，或聊聊對這個網站的想法，都歡迎留言。每則留言我看過之後才會公開，請不要留下個人資料。',
      name: '暱稱', namePh: '匿名', text: '留言', textPh: '想說點什麼…', send: '送出', sending: '送出中…', review: '留言經過我看過之後才會公開。',
      sent: '謝謝你的留言！我看過之後就會出現在這裡。', empty: '還沒有留言，來當第一個吧！', loading: '正在載入留言…', count: n => `共 ${n} 則`,
      tooShort: '先寫點什麼吧。', tooFast: '送得有點快，請等一分鐘再留下一則。', failed: '留言沒有送出，請稍後再試。',
      offline: '目前無法載入留言。', anon: '匿名', list: '已公開的留言'},
    'zh-CN': {title: '留言板', intro: '想打声招呼、问个问题，或聊聊对这个网站的想法，都欢迎留言。每条留言我看过之后才会公开，请不要留下个人资料。',
      name: '昵称', namePh: '匿名', text: '留言', textPh: '想说点什么…', send: '发送', sending: '发送中…', review: '留言经过我看过之后才会公开。',
      sent: '谢谢你的留言！我看过之后就会出现在这里。', empty: '还没有留言，来当第一个吧！', loading: '正在加载留言…', count: n => `共 ${n} 条`,
      tooShort: '先写点什么吧。', tooFast: '发得有点快，请等一分钟再留下一条。', failed: '留言没有发送，请稍后再试。',
      offline: '目前无法加载留言。', anon: '匿名', list: '已公开的留言'}
  };
  const esc = v => String(v).replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
  // Trim, drop control characters (keeping line breaks in the note) and collapse runs of blank lines.
  const clean = (v, keepLines) => String(v || '').replace(keepLines ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, '').replace(/\n{3,}/g, '\n\n').trim();

  let fb = null, notes = null, failed = false, unsubscribe = null, lastSent = 0;
  async function firebase() {
    if (fb) return fb;
    const [A, D, U] = await Promise.all([import(`${SDK}firebase-app.js`), import(`${SDK}firebase-database.js`), import(`${SDK}firebase-auth.js`)]);
    const app = A.getApps().find(a => a.name === 'guestbook') || A.initializeApp(CONFIG, 'guestbook');
    fb = {D, U, db: D.getDatabase(app), auth: U.getAuth(app)};
    return fb;
  }

  function screen(locale, title) {
    const c = COPY[locale] || COPY.en;
    return `${title}<div class="directory-heading"><h1>${esc(c.title)}</h1><span class="dir-count gb-count-all"></span></div><p class="screen-intro">${esc(c.intro)}</p>
      <form class="gb-form" novalidate>
        <label class="gb-field gb-name"><span>${esc(c.name)}</span><input name="name" maxlength="${LIMIT.name}" autocomplete="nickname" placeholder="${esc(c.namePh)}"></label>
        <label class="gb-field gb-text"><span>${esc(c.text)}</span><textarea name="text" maxlength="${LIMIT.text}" rows="4" placeholder="${esc(c.textPh)}"></textarea><small class="gb-chars" aria-live="off">0 / ${LIMIT.text}</small></label>
        <label class="gb-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
        <div class="gb-actions"><button type="submit" class="action-button primary"><span>${esc(c.send)}</span></button><small>${esc(c.review)}</small></div>
        <p class="gb-status" role="status" aria-live="polite"></p>
      </form>
      <section class="gb-list" aria-label="${esc(c.list)}"><p class="gb-empty">${esc(c.loading)}</p></section>`;
  }

  function paint(root, locale) {
    const c = COPY[locale] || COPY.en, list = root.querySelector('.gb-list');
    if (!list) return;
    const all = root.querySelector('.gb-count-all');
    if (failed && !notes) { list.innerHTML = `<p class="gb-empty">${esc(c.offline)}</p>`; return; }
    if (!notes) return;
    if (all) all.textContent = notes.length ? c.count(notes.length) : '';
    if (!notes.length) { list.innerHTML = `<p class="gb-empty">${esc(c.empty)}</p>`; return; }
    const fmt = new Intl.DateTimeFormat(locale, {year: 'numeric', month: 'short', day: 'numeric'});
    list.replaceChildren(...notes.map((n, i) => {
      const card = document.createElement('article');
      card.className = 'gb-note'; card.style.setProperty('--i', Math.min(i, 12));
      const head = document.createElement('header');
      const who = document.createElement('b'); who.textContent = n.name || c.anon;
      const when = document.createElement('time'); when.dateTime = new Date(n.t).toISOString(); when.textContent = fmt.format(n.t);
      head.append(who, when);
      const body = document.createElement('p'); body.textContent = n.text;
      card.append(head, body);
      return card;
    }));
  }

  async function listen(root, locale) {
    try {
      const {D, db} = await firebase();
      if (unsubscribe) return paint(root, locale);
      const q = D.query(D.ref(db, 'guestbook/approved'), D.orderByChild('at'), D.limitToLast(LIMIT.shown));
      unsubscribe = D.onValue(q, snap => {
        const out = []; snap.forEach(s => { const v = s.val(); if (v && typeof v.text === 'string') out.push({name: String(v.name || ''), text: v.text, t: Number(v.t) || 0, at: Number(v.at) || 0}); });
        notes = out.sort((a, b) => b.at - a.at); failed = false;
        const live = document.querySelector('.gb-list')?.closest('.terminal-output');
        if (live) paint(live, document.documentElement.lang || locale);
      }, () => { failed = true; paint(root, locale); });
    } catch { failed = true; paint(root, locale); }
  }

  function mount(root, locale) {
    const c = COPY[locale] || COPY.en, form = root.querySelector('.gb-form');
    if (!form) return;
    const opened = Date.now(), status = form.querySelector('.gb-status'), text = form.elements.text, chars = form.querySelector('.gb-chars');
    const say = (msg, kind = '') => { status.textContent = msg; status.dataset.kind = kind; };
    text.addEventListener('input', () => { chars.textContent = `${text.value.length} / ${LIMIT.text}`; });
    // Escape leaves the field instead of the page, so a half-written note is not lost.
    form.addEventListener('keydown', e => { if (e.key === 'Escape' && e.target.matches('input,textarea')) { e.stopPropagation(); e.target.blur(); } });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = clean(form.elements.name.value, false).slice(0, LIMIT.name), note = clean(text.value, true).slice(0, LIMIT.text);
      if (form.elements.website.value) { form.reset(); say(c.sent, 'ok'); return; }   // the hidden field is only ever filled by bots
      if (note.length < 2) { say(c.tooShort, 'warn'); text.focus(); return; }
      if (Date.now() - lastSent < LIMIT.gap) { say(c.tooFast, 'warn'); return; }
      if (Date.now() - opened < LIMIT.minFill) { say(c.tooFast, 'warn'); return; }
      const button = form.querySelector('button[type=submit]'), label = button.querySelector('span');
      button.disabled = true; label.textContent = c.sending; say('');
      try {
        const {D, U, db, auth} = await firebase();
        const user = auth.currentUser || (await U.signInAnonymously(auth)).user;
        const id = D.push(D.ref(db, 'guestbook/pending')).key;
        await D.update(D.ref(db), {
          [`guestbook/pending/${id}`]: {uid: user.uid, name, text: note, lang: locale, t: D.serverTimestamp()},
          [`guestbook/last/${user.uid}`]: D.serverTimestamp()
        });
        lastSent = Date.now(); form.reset(); chars.textContent = `0 / ${LIMIT.text}`; say(c.sent, 'ok');
      } catch (err) {
        say(/permission/i.test(String(err?.code || err?.message)) ? c.tooFast : c.failed, 'warn');
      } finally { button.disabled = false; label.textContent = c.send; }
    });
    paint(root, locale);
    listen(root, locale);
  }

  window.NIANSIA_GUESTBOOK = {screen, mount, copy: l => COPY[l] || COPY.en};
})();
