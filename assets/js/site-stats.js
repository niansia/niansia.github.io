/* Visitor counters on Firebase Realtime Database: total visits, visits today (Asia/Taipei) and readers online now.
   Counts only — no cookies, no personal data. Elements opt in with [data-stat="total|today|online"]; containers with
   [data-stats] stay hidden until the first numbers arrive. `?stats=demo` shows fake numbers for layout checks. */
(() => {
  // Only the Realtime Database is used, which needs no API key; what may be read or written is enforced by the database rules.
  const CONFIG = {databaseURL: 'https://niansia-site-default-rtdb.asia-southeast1.firebasedatabase.app', projectId: 'niansia-site'};
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const S = window.NIANSIA_STATS = {ready: false, total: null, today: null, online: null};
  const fmt = v => Number(v).toLocaleString(document.documentElement.lang || undefined);
  let raf = 0;
  function paint() {
    raf = 0;
    document.querySelectorAll('[data-stat]').forEach(el => {
      const v = S[el.dataset.stat]; if (v == null) return;
      const from = Number(el.dataset.shown ?? 0), to = Number(v);
      if (el.dataset.shown === String(to)) return;
      el.dataset.shown = String(to);
      if (!el.hasAttribute('data-count') || matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(to - from) < 2) { el.textContent = fmt(to); return; }
      const t0 = performance.now(), dur = 900;
      const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    document.querySelectorAll('[data-stats]').forEach(el => { el.hidden = !S.ready; });
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
  new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true});
  const update = patch => { Object.assign(S, patch, {ready: true}); schedule(); dispatchEvent(new CustomEvent('niansia:stats', {detail: S})); };

  if (new URLSearchParams(location.search).get('stats') === 'demo') { update({total: 12873, today: 214, online: 3}); return; }
  if (!CONFIG || navigator.webdriver) return;   // automated browsers (tests, crawlers) are not counted

  const dayKey = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');
  const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
  async function start() {
    const [{initializeApp}, db] = await Promise.all([import(`${SDK}firebase-app.js`), import(`${SDK}firebase-database.js`)]);
    const {getDatabase, ref, onValue, runTransaction, set, onDisconnect, serverTimestamp} = db;
    const base = getDatabase(initializeApp(CONFIG));
    const day = dayKey();
    // one visit per browser session
    let counted = false; try { counted = sessionStorage.getItem('niansia-visit') === '1'; sessionStorage.setItem('niansia-visit', '1'); } catch {}
    if (!counted) { runTransaction(ref(base, 'stats/total'), v => (v || 0) + 1).catch(() => {}); runTransaction(ref(base, `stats/days/${day}`), v => (v || 0) + 1).catch(() => {}); }
    onValue(ref(base, 'stats/total'), s => update({total: s.val() || 0}));
    onValue(ref(base, `stats/days/${day}`), s => update({today: s.val() || 0}));
    // presence: one entry per open tab, refreshed every minute and removed on disconnect
    const me = ref(base, `presence/${rid()}`);
    let offset = 0; onValue(ref(base, '.info/serverTimeOffset'), s => { offset = s.val() || 0; });
    onValue(ref(base, '.info/connected'), s => { if (s.val()) { onDisconnect(me).remove().then(() => set(me, serverTimestamp())).catch(() => {}); } });
    setInterval(() => set(me, serverTimestamp()).catch(() => {}), 60000);
    let snap = {};
    const count = () => { const now = Date.now() + offset; update({online: Math.max(1, Object.values(snap).filter(t => now - t < 150000).length)}); };
    onValue(ref(base, 'presence'), s => { snap = s.val() || {}; count(); });
    setInterval(count, 30000);
  }
  const go = () => start().catch(err => console.warn('site-stats:', err));
  if ('requestIdleCallback' in window) requestIdleCallback(go, {timeout: 3000}); else setTimeout(go, 1500);
})();
