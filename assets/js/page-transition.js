/* Card zoom between the site's pages. Clicking a link to another page grows a panel in the destination's colours from
   the clicked card (its exact position and rounded corners) until it fills the screen, with the destination's path and
   title fading in where the next page's heading will be; the next page then starts under the same panel and fades it
   away, so the card appears to open into the page. Coming back with the browser's back button fades the page in
   from its own colour. It only moves one fixed panel and fades a cover (no 3-D, no transform on the page, nothing waits for
   the network), so it looks the same in every browser. Skipped for reduced motion, the terminal's paused animation, and modified clicks (new tab, etc.).
   Loaded as a normal script in <head> of every page, so the arriving page is covered from its first frame. */
(() => {
  'use strict';
  const GROW = 520, KEY = 'niansia-zoom';
  const root = document.documentElement;
  const still = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try {
      const parts = JSON.parse(localStorage.getItem('niansia-motion-parts') || 'null');
      return parts ? parts.pages === false : localStorage.getItem('niansia-motion') === 'off';
    } catch { return false; }
  };
  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  const css = `
#nz-scrim{position:fixed;inset:0;z-index:2147482999;pointer-events:none;background:#140f1a;opacity:0;}
#nz{position:fixed;z-index:2147483000;pointer-events:none;overflow:hidden;box-sizing:border-box;background:var(--nz-bg);color:var(--nz-ink);font-family:Inter,'Noto Sans TC','Noto Sans SC',system-ui,sans-serif;
  border:1px solid color-mix(in srgb,var(--nz-accent) 45%,transparent);box-shadow:0 24px 70px #0000004d,0 4px 14px #00000026;}
#nz .nz-head{position:fixed;left:var(--nz-x);top:var(--nz-y);right:20px;opacity:0;}
#nz small{display:block;font:500 12px/16px 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--nz-accent);margin-bottom:8px;}
#nz b{display:block;font-size:var(--nz-fs);line-height:1.2;letter-spacing:-.02em;max-width:720px;}
#nz-cover{position:fixed;inset:0;z-index:2147483000;pointer-events:none;}`;
  const style = document.createElement('style'); style.textContent = css;
  (document.head || root).append(style);

  /* ---------- arriving ---------- */
  // The arriving page starts under a full-screen panel in its own colour, which fades once the page's content is in.
  function cover(bg, dur) {
    const c = document.createElement('div'); c.id = 'nz-cover'; c.style.background = bg; root.append(c);
    const off = () => c.remove();
    // Fade once the page has settled (its load), or at most 0.3 s after its HTML is in: while a page is
    // still loading, Chrome can stall a running animation and it would stutter.
    let started = false;
    const fade = () => { if (started) return; started = true; requestAnimationFrame(() =>
      c.animate([{opacity: 1}, {opacity: 0}], {duration: dur, easing: 'ease', fill: 'forwards'}).finished.then(off, off)); };
    if (document.readyState === 'complete') fade();
    else {
      addEventListener('load', fade, {once: true});
      const soon = () => setTimeout(fade, 300);
      if (document.readyState === 'loading') addEventListener('DOMContentLoaded', soon, {once: true}); else soon();
    }
    setTimeout(off, 4000);
  }
  const backIn = () => cover(palette(location).bg, 360);
  let arrive = null;
  try { arrive = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch {}
  const nav = (() => { try { return performance.getEntriesByType('navigation')[0]?.type; } catch { return ''; } })();
  if (!still()) {
    if (arrive && arrive.to === location.pathname && Date.now() - arrive.t < 8000 && nav !== 'back_forward') cover(arrive.bg, 440);
    else if (nav === 'back_forward') backIn();
  }
  addEventListener('pageshow', e => {
    document.getElementById('nz')?.remove(); document.getElementById('nz-scrim')?.remove();
    if (e.persisted && !still()) backIn();
  });

  /* ---------- leaving through a link ---------- */
  function palette(url) {
    if (url.pathname.startsWith('/lab/')) return {bg: '#07080b', ink: '#eef1f5', accent: '#7cc4ff'};
    const terminal = /^\/(zh-tw\/|zh-cn\/)?(work\/)?$/.test(url.pathname);
    if (terminal) return dark() ? {bg: '#101117', ink: '#e9eaf4', accent: '#b3adff'} : {bg: '#fbf0f4', ink: '#3a2630', accent: '#b8406f'};
    return dark() ? {bg: '#15142a', ink: '#f1ebe2', accent: '#f0a878'} : {bg: '#fbf6ee', ink: '#2a2230', accent: '#c0673a'};
  }
  // Where the next page's heading sits, so the title lands on it: the static pages centre a 760px column with the
  // path line at 88px, the brief a 900px column, the lab pages a 1240px one with no path line.
  function heading(url, W) {
    if (url.pathname.startsWith('/lab/')) return {x: Math.max(14, (W - 1240) / 2 + 20), y: 64, fs: 'clamp(28px,3.6vw,50px)'};
    if (url.pathname.startsWith('/brief/')) return {x: Math.max(20, (W - 900) / 2 + 20), y: W < 700 ? 124 : 118, fs: 'clamp(40px,4.6vw,64px)'};
    return {x: Math.max(20, (W - 760) / 2 + 20), y: 88, fs: 'clamp(28px,3vw,42px)'};
  }
  function zoom(a, url) {
    const p = palette(url);
    const named = [...a.querySelectorAll('h2,h3,strong,b')].find(n => !n.closest('[aria-hidden="true"]') && n.textContent.trim().length > 1);
    // data-nz-title names the destination when the link text is a call to action (the author card's "Visit niansia.com").
    const text = (a.dataset.nzTitle || (named || a).textContent).replace(/\s+/g, ' ').replace(/[↗→]/g, '').trim().slice(0, 60);
    const home = /^\/(zh-tw\/|zh-cn\/)?(work\/)?$/.test(url.pathname);
    const kicker = home ? 'niansia.terminal' : '~/niansia' + url.pathname.replace(/\/(index\.html)?$/, '').replace(/\/(en|zh-tw|zh-cn)$/, '');
    const r = a.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    const radius = parseFloat(getComputedStyle(a).borderTopLeftRadius) || 12;
    const el = document.createElement('div'); el.id = 'nz'; el.setAttribute('aria-hidden', 'true');
    const at = heading(url, W);
    Object.entries({'--nz-bg': p.bg, '--nz-ink': p.ink, '--nz-accent': p.accent, '--nz-x': `${at.x}px`, '--nz-y': `${at.y}px`, '--nz-fs': at.fs}).forEach(([k, v]) => el.style.setProperty(k, v));
    el.innerHTML = '<div class="nz-head"><small></small><b></b></div>';
    el.querySelector('small').textContent = kicker; el.querySelector('b').textContent = text || 'Niansia';
    const scrim = document.createElement('div'); scrim.id = 'nz-scrim';
    document.body.append(scrim, el);
    const ease = 'cubic-bezier(.65,0,.25,1)';
    el.animate([
      {left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: `${radius}px`},
      {left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, borderRadius: '0px', borderColor: 'transparent', boxShadow: 'none'}
    ], {duration: GROW, easing: ease, fill: 'forwards'});
    scrim.animate([{opacity: 0}, {opacity: .35}], {duration: GROW * .6, easing: 'ease-out', fill: 'forwards'});
    el.querySelector('.nz-head').animate([{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'none'}], {duration: 260, delay: GROW - 200, easing: 'ease-out', fill: 'forwards'});
    a.animate([{transform: 'none'}, {transform: 'scale(1.02)'}], {duration: 180, easing: 'ease-out', fill: 'forwards'});
    try { sessionStorage.setItem(KEY, JSON.stringify({to: url.pathname, bg: p.bg, t: Date.now()})); } catch {}
    setTimeout(() => { location.href = url.href; }, GROW + 40);
  }
  addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || still()) return;
    const a = e.target.closest?.('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page (hash changes)
    if (/\.(pdf|zip|mp4|png|jpe?g|webp|svg)$/i.test(url.pathname) || url.pathname.startsWith('/assets/')) return;
    e.preventDefault(); zoom(a, url);
  });
})();
