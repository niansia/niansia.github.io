// Guestbook moderation: sign in with the site owner's Google account, then approve or delete pending notes.
// The page itself grants nothing: the database rules only let the owner's verified e-mail read the queue or publish notes.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getDatabase, ref, onValue, update, remove, serverTimestamp, query, orderByChild} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

const app = initializeApp({apiKey: 'AIzaSyAsAJl4RX9NjA1OWx_53V8QDjA0YzuXX6k', authDomain: 'niansia-site.firebaseapp.com',
  databaseURL: 'https://niansia-site-default-rtdb.asia-southeast1.firebasedatabase.app', projectId: 'niansia-site', appId: '1:764017812912:web:882b9a7a88f4da9640a275'});
const auth = getAuth(app), db = getDatabase(app);
const $ = id => document.getElementById(id);
const fmt = new Intl.DateTimeFormat('zh-TW', {dateStyle: 'medium', timeStyle: 'short'});
const LANG = {en: 'EN', 'zh-TW': '繁', 'zh-CN': '简'};
let stops = [], pending = {};

function card(id, n, buttons) {
  const el = document.createElement('article'); el.className = 'card';
  const head = document.createElement('header');
  const who = document.createElement('b'); who.textContent = n.name || '匿名';
  const when = document.createElement('span'); when.textContent = `${fmt.format(n.t || 0)} · ${LANG[n.lang] || n.lang || ''}`;
  head.append(who, when);
  const body = document.createElement('p'); body.textContent = String(n.text || '');
  const actions = document.createElement('div'); actions.className = 'actions';
  buttons.forEach(([label, cls, run]) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls;
    b.addEventListener('click', async () => { b.disabled = true; try { await run(); } catch (e) { alert('動作失敗：' + (e.code || e.message)); b.disabled = false; } });
    actions.append(b);
  });
  el.append(head, body, actions);
  el.dataset.id = id;
  return el;
}

function fill(box, countEl, entries, make) {
  countEl.textContent = entries.length;
  if (!entries.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = '沒有留言'; box.replaceChildren(p); return; }
  box.replaceChildren(...entries.map(([id, n]) => make(id, n)));
}

function watch() {
  stops.push(onValue(ref(db, 'guestbook/pending'), snap => {
    pending = snap.val() || {};
    const entries = Object.entries(pending).sort((a, b) => (a[1].t || 0) - (b[1].t || 0));
    fill($('pending'), $('pending-n'), entries, (id, n) => card(id, n, [
      ['通過', 'ok', () => update(ref(db), {[`guestbook/approved/${id}`]: {name: String(n.name || ''), text: n.text, lang: n.lang, t: n.t, at: serverTimestamp()}, [`guestbook/pending/${id}`]: null})],
      ['刪除', 'danger', () => remove(ref(db, `guestbook/pending/${id}`))]
    ]));
  }, err => { $('note').textContent = `讀取待審留言失敗（${err.code || err.message}）：這個帳號可能沒有審核權限。`; $('panel').hidden = true; }));
  stops.push(onValue(query(ref(db, 'guestbook/approved'), orderByChild('at')), snap => {
    const entries = []; snap.forEach(s => { entries.push([s.key, s.val()]); });
    entries.reverse();
    fill($('approved'), $('approved-n'), entries, (id, n) => card(id, n, [
      ['撤下', 'danger', () => { if (confirm('確定要把這則留言從網站撤下（刪除）嗎？')) return remove(ref(db, `guestbook/approved/${id}`)); }]
    ]));
  }));
}

$('clear').addEventListener('click', async () => {
  const ids = Object.keys(pending);
  if (!ids.length || !confirm(`確定要刪除全部 ${ids.length} 則待審留言嗎？`)) return;
  await update(ref(db), Object.fromEntries(ids.map(id => [`guestbook/pending/${id}`, null])));
});
$('sign').addEventListener('click', () => (auth.currentUser && !auth.currentUser.isAnonymous ? signOut(auth) : signInWithPopup(auth, new GoogleAuthProvider())).catch(e => alert('登入失敗：' + (e.code || e.message))));
onAuthStateChanged(auth, user => {
  stops.forEach(stop => stop()); stops = [];
  const signedIn = !!user && !user.isAnonymous;
  $('who').textContent = signedIn ? user.email : '未登入';
  $('sign').textContent = signedIn ? '登出' : '用 Google 登入';
  $('panel').hidden = !signedIn;
  if (signedIn) watch();
});
