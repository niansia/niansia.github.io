/* Page turn between the site's pages (cross-document view transitions, Chromium 126+).
   Opening another page turns the current one over its left edge like a book page, revealing the next page beneath;
   going back in history turns the page back into place. Other browsers keep a plain cross-fade, and reduced motion
   or the terminal's paused animation skip it. Loaded as a normal (blocking) script in <head> of every page, because
   the transition is set up on 'pagereveal', before the first frame of the new page. */
(() => {
  'use strict';
  const T = '.9s', EASE = 'cubic-bezier(.45,.05,.2,1)';
  const turn = t => `html:active-view-transition-type(${t})`;
  const css = `@view-transition{navigation:auto;}
${turn('turn-forward')}::view-transition-group(root),${turn('turn-back')}::view-transition-group(root){animation-duration:${T};}
${turn('turn-forward')}::view-transition-old(root){z-index:2;transform-origin:0 50%;backface-visibility:hidden;mix-blend-mode:normal;animation:nt-turn ${T} ${EASE} both;}
${turn('turn-forward')}::view-transition-new(root){z-index:1;mix-blend-mode:normal;animation:nt-under ${T} ease both;}
${turn('turn-back')}::view-transition-old(root){z-index:1;mix-blend-mode:normal;animation:nt-under-out ${T} ease both;}
${turn('turn-back')}::view-transition-new(root){z-index:2;transform-origin:0 50%;backface-visibility:hidden;mix-blend-mode:normal;animation:nt-turn-back ${T} ${EASE} both;}
@keyframes nt-turn{0%{transform:perspective(2400px) rotateY(0);filter:brightness(1);}35%{filter:brightness(.96) drop-shadow(-18px 0 26px #0005);}100%{transform:perspective(2400px) rotateY(-100deg);filter:brightness(.5) drop-shadow(-30px 0 40px #0000);}}
@keyframes nt-turn-back{0%{transform:perspective(2400px) rotateY(-100deg);filter:brightness(.5);}65%{filter:brightness(.96) drop-shadow(-18px 0 26px #0005);}100%{transform:perspective(2400px) rotateY(0);filter:brightness(1);}}
@keyframes nt-under{from{filter:brightness(.7);}to{filter:brightness(1);}}
@keyframes nt-under-out{from{filter:brightness(1);}to{filter:brightness(.7);}}
@media(prefers-reduced-motion:reduce){@view-transition{navigation:none;}}`;
  const style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).append(style);

  const still = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    try { return localStorage.getItem('niansia-motion') === 'off'; } catch { return false; }
  };
  addEventListener('pageswap', e => { if (e.viewTransition && still()) e.viewTransition.skipTransition(); });
  addEventListener('pagereveal', e => {
    const vt = e.viewTransition; if (!vt) return;
    if (still()) { vt.skipTransition(); return; }
    const a = window.navigation?.activation;
    const back = a?.navigationType === 'traverse' && a.entry && a.from && a.entry.index < a.from.index;
    try { vt.types?.add(back ? 'turn-back' : 'turn-forward'); } catch {}
  });
})();
