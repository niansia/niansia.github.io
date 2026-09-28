/* Boot screen progress (runs right after the #boot markup, before the deferred scripts execute).
   The percentage follows real milestones: the page's scripts and stylesheets finishing their download (60%),
   web fonts (10%), the terminal drawing itself ('niansia:shell', 20%) and every image being loaded (10%).
   It never runs faster than a minimum time (about 4.1 s on the first page of a visit, so the whole intro lasts about
   5 s with the fade; 1.5 s afterwards), then fades out. If something stalls, it still finishes after 9 s. */
(() => {
  'use strict';
  const boot = document.getElementById('boot');
  if (!boot) return;
  const pct = boot.querySelector('.boot-pct'), paws = [...boot.querySelectorAll('.boot-bar svg')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let first = true;
  try { first = sessionStorage.getItem('niansia-booted') !== '1'; sessionStorage.setItem('niansia-booted', '1'); } catch {}
  const MIN = reduce ? 0 : first ? 4100 : 1500, GIVE_UP = 9000, t0 = performance.now();

  const want = new Set([...document.querySelectorAll('script[src], link[rel="stylesheet"]')].map(el => el.src || el.href));
  const got = new Set();
  let fonts = false, drawn = false, loaded = document.readyState === 'complete';
  document.fonts?.ready.then(() => { fonts = true; });
  addEventListener('niansia:shell', () => { drawn = true; }, {once: true});
  addEventListener('load', () => { loaded = true; }, {once: true});
  const target = () => {
    for (const e of performance.getEntriesByType('resource')) if (want.has(e.name)) got.add(e.name);
    return (want.size ? got.size / want.size : 1) * 60 + (fonts ? 10 : 0) + (drawn ? 20 : 0) + (loaded ? 10 : 0);
  };

  let shown = 0, lit = -1, last = -1, finishing = false;
  function paint(v) {
    const n = Math.floor(v);
    if (n !== last) { last = n; pct.textContent = `${n}%`; boot.setAttribute('aria-valuenow', String(n)); }
    const k = Math.floor(v / 10);
    if (k !== lit) { lit = k; paws.forEach((p, i) => p.classList.toggle('on', i < k)); }
  }
  function finish() {
    if (finishing) return; finishing = true;
    setTimeout(() => { boot.classList.add('is-done'); setTimeout(() => boot.remove(), 560); }, reduce ? 0 : 320);
  }
  function frame(now) {
    // Late images (sprites, posters) should not hold the intro once the terminal is on screen.
    const late = now - t0 > GIVE_UP || (drawn && now - t0 > MIN + 1200);
    const cap = MIN ? Math.min(100, ((now - t0) / MIN) * 100) : 100;
    const goal = late ? 100 : Math.min(target(), cap);
    shown = Math.min(goal, shown + Math.max(.5, (goal - shown) * .16));
    paint(shown);
    if (shown >= 100 && (drawn || late)) { finish(); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
