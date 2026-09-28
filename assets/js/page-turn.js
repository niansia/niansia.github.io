/* Page turn between the site's pages, like a book: clicking a link to another page turns the current page over from
   right to left (a real 3-D turn around the left edge, 180°, with the paper's back faintly showing the print through),
   revealing a title page for the destination underneath; the next page starts loading halfway through the turn.
   Coming back with the browser's back button turns the page back into place from the left.
   Works in every modern browser (it animates the live page, so it does not wait for the network). Skipped for
   reduced motion, for the terminal's paused animation, and for modified clicks (new tab, etc.).
   Loaded as a normal script in <head> of every page so the back-turn can start on the first frame. */
(() => {
  'use strict';
  const DUR = 1000, NAV_AT = 720;   // the page is past its edge (90°) at 68%, then the next page loads
  const root = document.documentElement;
  const still = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try { return localStorage.getItem('niansia-motion') === 'off'; } catch { return false; }
  };
  const dark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  const css = `
html.nt-turning{perspective:2200px;overflow:hidden;}
html.nt-turning body{transform-origin:0 var(--nt-y,50%);transform-style:preserve-3d;will-change:transform;}
html:is(.nt-turning,.nt-back-in) body{background-color:var(--desk,var(--bg,#fbf6ee));min-height:100vh;}
#nt-under{position:fixed;inset:0;z-index:-1;display:flex;flex-direction:column;justify-content:center;padding:0 12vw;font-family:Inter,'Noto Sans TC','Noto Sans SC',system-ui,sans-serif;
  background:linear-gradient(90deg,#0000002e,#0000 9%),repeating-linear-gradient(0deg,#0000 0 31px,var(--nt-rule) 31px 32px),var(--nt-bg);color:var(--nt-ink);}
#nt-under small{font:500 13px 'JetBrains Mono',monospace;letter-spacing:.06em;color:var(--nt-accent);text-transform:uppercase;margin-bottom:14px;}
#nt-under b{font-size:clamp(28px,4.5vw,46px);line-height:1.2;letter-spacing:-.02em;max-width:18em;}
#nt-under i{display:block;margin-top:22px;width:96px;height:3px;border-radius:3px;background:var(--nt-accent);opacity:.8;}
html.nt-back-in{perspective:2200px;}
html.nt-back-in body{transform-origin:0 50vh;animation:nt-back ${DUR - 150}ms cubic-bezier(.3,.1,.2,1) both;backface-visibility:visible;}
@keyframes nt-back{0%{transform:rotateY(-95deg);filter:brightness(.55);}45%{transform:rotateY(-55deg) skewY(-1deg);filter:brightness(.8);}100%{transform:rotateY(0);filter:none;}}`;
  const style = document.createElement('style'); style.textContent = css;
  (document.head || root).append(style);

  /* ---------- arriving with Back: turn the page back into place ---------- */
  function backIn() {
    if (still()) return;
    root.classList.remove('nt-back-in'); void root.offsetWidth; root.classList.add('nt-back-in');
    setTimeout(() => root.classList.remove('nt-back-in'), DUR);
  }
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'back_forward') backIn();
  } catch {}
  addEventListener('pageshow', e => {
    root.classList.remove('nt-turning'); document.getElementById('nt-under')?.remove();
    if (document.body) { document.body.style.transform = ''; document.body.getAnimations?.().forEach(a => a.cancel()); }
    if (e.persisted) backIn();
  });

  /* ---------- leaving through a link: turn the page over ---------- */
  function palette(url) {
    if (url.pathname.startsWith('/lab/')) return {bg: '#07080b', ink: '#eef1f5', accent: '#7cc4ff', rule: '#ffffff08'};
    const terminal = /^\/(zh-tw\/|zh-cn\/)?(work\/)?$/.test(url.pathname);
    if (dark()) return {bg: terminal ? '#101117' : '#15142a', ink: '#f1ebe2', accent: '#f0a878', rule: '#ffffff0a'};
    return {bg: terminal ? '#fbf0f4' : '#fbf6ee', ink: '#2a2230', accent: '#c0673a', rule: '#2a22300d'};
  }
  function label(a, url) {
    const text = (a.querySelector('b,strong,h2')?.textContent || a.textContent || '').replace(/\s+/g, ' ').trim();
    const kicker = '~/niansia' + url.pathname.replace(/\/(index\.html)?$/, '').replace(/\/(en|zh-tw|zh-cn)$/, '');
    return {text: text.slice(0, 60) || 'Niansia', kicker};
  }
  function turn(a, url) {
    const p = palette(url), l = label(a, url), body = document.body;
    const under = document.createElement('div'); under.id = 'nt-under'; under.setAttribute('aria-hidden', 'true');
    Object.entries({'--nt-bg': p.bg, '--nt-ink': p.ink, '--nt-accent': p.accent, '--nt-rule': p.rule}).forEach(([k, v]) => under.style.setProperty(k, v));
    under.innerHTML = `<small></small><b></b><i></i>`;
    under.querySelector('small').textContent = l.kicker; under.querySelector('b').textContent = l.text;
    root.append(under);
    root.style.setProperty('--nt-y', `${scrollY + innerHeight / 2}px`);
    root.style.perspectiveOrigin = `0 ${scrollY + innerHeight / 2}px`;
    root.style.background = p.bg;
    root.classList.add('nt-turning');
    body.animate([
      {transform: 'rotateY(0deg)', filter: 'brightness(1)', boxShadow: '0 0 0 #0000'},
      {transform: 'rotateY(-22deg) skewY(-.6deg)', filter: 'brightness(.98)', boxShadow: '-20px 0 50px #0003', offset: .3},
      {transform: 'rotateY(-60deg) skewY(-1.2deg)', filter: 'brightness(.8)', boxShadow: '-40px 0 70px #0005', offset: .55},
      {transform: 'rotateY(-89.9deg)', filter: 'brightness(.6)', offset: .68},
      {transform: 'rotateY(-90.1deg)', filter: 'grayscale(1) brightness(1.1) contrast(.5)', opacity: 1, offset: .6801},
      {transform: 'rotateY(-180deg)', filter: 'grayscale(1) brightness(1.3) contrast(.3)', opacity: .35}
    ], {duration: DUR, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards'});
    under.animate([{filter: 'brightness(.6)'}, {filter: 'brightness(1)'}], {duration: DUR, easing: 'ease-out', fill: 'forwards'});
    setTimeout(() => { location.href = url.href; }, NAV_AT);
  }
  addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || still()) return;
    const a = e.target.closest?.('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return;   // same page (hash changes)
    if (/\.(pdf|zip|mp4|png|jpe?g|webp|svg)$/i.test(url.pathname) || url.pathname.startsWith('/assets/')) return;
    e.preventDefault(); turn(a, url);
  });
})();
