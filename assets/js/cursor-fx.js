/* Pointer companion, pointer trails and click bursts. Purely decorative: aria-hidden,
   pointer-events: none, off for touch, reduced motion and the pause control. */
(() => {
  'use strict';
  const app = window.NIANSIA_APP;
  if (!app) return;
  const fine = matchMedia('(pointer: fine)');
  const trails = ['hearts', 'paws', 'stars', 'petals', 'off'];
  const spacing = {hearts: 24, paws: 34, stars: 18, petals: 30};
  let follow = app.store.get('follow', 'on') !== 'off';
  let trail = app.store.get('trail', 'hearts');
  if (trail === 'on') trail = 'hearts';
  if (!trails.includes(trail)) trail = 'hearts';
  let size = ['s', 'm', 'l'].includes(app.store.get('cursor', 'm')) ? app.store.get('cursor', 'm') : 'm';
  let px = 0, py = 0, x = 0, y = 0, vx = 0, vy = 0, frame = 0, seen = false, facing = 1, lastMove = 0, travelled = 0, lastX = 0, lastY = 0, pawSide = 1, face = 0, faceTimer, restTimer;

  const layer = document.createElement('div');
  layer.className = 'fx-layer';
  layer.setAttribute('aria-hidden', 'true');
  const buddy = document.createElement('div');
  buddy.className = 'cursor-buddy';
  buddy.setAttribute('aria-hidden', 'true');
  buddy.innerHTML = '<span class="buddy-body"><span class="buddy-face"></span></span><span class="buddy-mark"></span>';
  buddy.hidden = true;
  document.body.append(layer, buddy);
  const body = buddy.querySelector('.buddy-body'), mark = buddy.querySelector('.buddy-mark'), faceEl = buddy.querySelector('.buddy-face');

  // Preload the busts; until they decode the buddy stays hidden instead of showing an empty badge.
  let faceReady = false;
  const faces = new Image();
  faces.onload = () => { faceReady = true; };
  faces.src = '/assets/lab/yuki/heads.webp';
  faces.decode?.().then(() => { faceReady = true; }).catch(() => {});
  const active = () => app.motion() && fine.matches;
  const buddyAllowed = () => faceReady && innerWidth >= 720;
  function paintSize() { buddy.dataset.size = size; }
  function setFace(next, ms) {
    clearTimeout(faceTimer);
    face = next; faceEl.dataset.face = String(next);
    if (ms) faceTimer = setTimeout(() => setFace(window.YUKI?.asleep() ? 2 : 0), ms);
  }
  function hideBuddy() { buddy.hidden = true; seen = false; cancelAnimationFrame(frame); frame = 0; }
  function tick() {
    const ax = (px - x) * .16, ay = (py - y) * .16;
    vx = (vx + ax) * .7; vy = (vy + ay) * .7;
    x += vx; y += vy;
    if (vx < -1.2) facing = -1; else if (vx > 1.2) facing = 1;
    const tilt = Math.max(-16, Math.min(16, vx * 1.4));
    buddy.style.transform = `translate3d(${x}px,${y}px,0)`;
    body.style.transform = `rotate(${tilt}deg) scaleX(${facing})`;
    if (Math.abs(vx) + Math.abs(vy) > .05 || Math.abs(px - x) + Math.abs(py - y) > .5) frame = requestAnimationFrame(tick);
    else frame = 0;
  }
  function particle(kind, cx, cy, keyframes, options, extra = '') {
    if (layer.childElementCount > 44) layer.firstElementChild.remove();
    const el = document.createElement('span');
    el.className = `fx-p fx-${kind} ${extra}`;
    el.style.left = `${cx}px`; el.style.top = `${cy}px`;
    layer.append(el);
    el.animate(keyframes, options).onfinish = () => el.remove();
    return el;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function spawn(mode, cx, cy, angle) {
    if (mode === 'hearts') {
      const s = rand(.7, 1.15), r = rand(-24, 24), dx = rand(-14, 14), dy = rand(26, 44);
      particle('heart', cx, cy, [
        {opacity: 0, transform: `translate(-50%,-50%) scale(.2) rotate(${r}deg)`},
        {opacity: 1, transform: `translate(-50%,-50%) scale(${s * 1.15}) rotate(${r}deg)`, offset: .16},
        {opacity: 0, transform: `translate(calc(-50% + ${dx}px),calc(-50% - ${dy}px)) scale(${s * .55}) rotate(${-r}deg)`}
      ], {duration: rand(900, 1200), easing: 'cubic-bezier(.2,.7,.3,1)'});
      if (Math.random() < .35) particle('dot', cx + rand(-10, 10), cy + rand(-6, 6), [
        {opacity: 0, transform: 'translate(-50%,-50%) scale(.3)'}, {opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .3},
        {opacity: 0, transform: `translate(-50%,calc(-50% - ${rand(10, 22)}px)) scale(.4)`}], {duration: 700, easing: 'ease-out'});
    }
    if (mode === 'paws') {
      const side = (pawSide = -pawSide) * 7, rad = (angle + 90) * Math.PI / 180;
      const ox = Math.cos(rad) * side, oy = Math.sin(rad) * side;
      particle('paw', cx + ox, cy + oy, [
        {opacity: 0, transform: `translate(-50%,-50%) rotate(${angle + 90}deg) scale(.6)`},
        {opacity: .85, transform: `translate(-50%,-50%) rotate(${angle + 90}deg) scale(1)`, offset: .1},
        {opacity: .7, transform: `translate(-50%,-50%) rotate(${angle + 90}deg) scale(1)`, offset: .6},
        {opacity: 0, transform: `translate(-50%,-50%) rotate(${angle + 90}deg) scale(.9)`}
      ], {duration: 1600, easing: 'ease-out'});
    }
    if (mode === 'stars') {
      const s = rand(.5, 1.1);
      particle('star', cx + rand(-8, 8), cy + rand(-8, 8), [
        {opacity: 0, transform: `translate(-50%,-50%) scale(0) rotate(0deg)`},
        {opacity: 1, transform: `translate(-50%,-50%) scale(${s}) rotate(45deg)`, offset: .3},
        {opacity: 0, transform: `translate(-50%,calc(-50% + ${rand(4, 16)}px)) scale(0) rotate(120deg)`}
      ], {duration: rand(650, 950), easing: 'ease-out'});
    }
    if (mode === 'petals') {
      const r = rand(0, 360), dx = rand(-26, 26);
      particle('petal', cx, cy, [
        {opacity: 0, transform: `translate(-50%,-50%) rotate(${r}deg) scale(.5)`},
        {opacity: .95, transform: `translate(-50%,-50%) rotate(${r + 40}deg) scale(1)`, offset: .15},
        {opacity: 0, transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${rand(40, 70)}px)) rotate(${r + 220}deg) scale(.8)`}
      ], {duration: rand(1300, 1800), easing: 'cubic-bezier(.3,.2,.4,1)'});
    }
  }
  function burst(cx, cy, kind = trail) {
    if (!app.motion()) return;
    particle('ring', cx, cy, [{opacity: .7, transform: 'translate(-50%,-50%) scale(.2)'}, {opacity: 0, transform: 'translate(-50%,-50%) scale(1)'}], {duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)'});
    const shape = kind === 'off' || kind === 'paws' ? 'star' : kind === 'petals' ? 'petal' : kind === 'stars' ? 'star' : 'heart';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rand(-.3, .3), d = rand(22, 36);
      particle(shape, cx, cy, [
        {opacity: 1, transform: 'translate(-50%,-50%) scale(.3)'},
        {opacity: 0, transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d}px)) scale(.75) rotate(${rand(-60, 60)}deg)`}
      ], {duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)'}, 'is-burst');
    }
  }
  function clear() { layer.replaceChildren(); }
  function onMove(event) {
    if (!active() || event.pointerType === 'touch') return;
    const now = performance.now();
    lastMove = now;
    if (trail !== 'off') {
      const dx = event.clientX - lastX, dy = event.clientY - lastY, dist = Math.hypot(dx, dy);
      if (dist > 120) { lastX = event.clientX; lastY = event.clientY; travelled = 0; }
      else {
        travelled += dist;
        if (travelled >= spacing[trail]) { travelled = 0; spawn(trail, event.clientX, event.clientY, Math.atan2(dy, dx) * 180 / Math.PI); }
        lastX = event.clientX; lastY = event.clientY;
      }
    }
    const overPet = event.target.closest?.('.yuki,.yuki-chat,.yuki-menu,input,textarea');
    if (!follow || overPet || window.YUKI?.dragging()) { buddy.classList.add('is-away'); }
    else buddy.classList.remove('is-away');
    if (!follow || !buddyAllowed()) { hideBuddy(); return; }
    const bw = buddy.offsetWidth || 50;
    px = Math.min(innerWidth - bw - 4, event.clientX + 16); py = Math.min(innerHeight - bw - 4, event.clientY + 18);
    if (!seen) { x = px; y = py; seen = true; buddy.hidden = false; }
    buddy.classList.remove('is-resting');
    clearTimeout(restTimer);
    restTimer = setTimeout(() => buddy.classList.add('is-resting'), 1400);
    const interactive = event.target.closest?.('a,button,[role="button"]');
    buddy.classList.toggle('is-curious', !!interactive);
    if (!frame) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('pointermove', onMove, {passive: true});
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !app.motion()) return;
    burst(event.clientX, event.clientY);
    if (!buddy.hidden) { setFace(1, 900); buddy.classList.remove('is-hop'); void buddy.offsetWidth; buddy.classList.add('is-hop'); }
  }, {passive: true});
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hideBuddy(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clear(); hideBuddy(); } });
  window.addEventListener('niansia:motion', event => { if (!event.detail.on) { clear(); hideBuddy(); } });
  window.addEventListener('yuki:state', event => { if (!faceTimer || face !== 1) setFace(event.detail.asleep ? 2 : 0); });
  fine.addEventListener('change', () => { if (!fine.matches) hideBuddy(); });
  paintSize(); setFace(0);
  window.NIANSIA_FX = {
    setFollow(on) { follow = on; app.store.set('follow', on ? 'on' : 'off'); if (!on) hideBuddy(); },
    setTrail(mode) { trail = trails.includes(mode) ? mode : 'hearts'; app.store.set('trail', trail); if (trail === 'off') clear(); },
    setSize(next) { size = ['s', 'm', 'l'].includes(next) ? next : 'm'; app.store.set('cursor', size); paintSize(); },
    state: () => ({follow, trail, size}),
    burst, spawn: (mode, cx, cy) => spawn(mode, cx, cy, -90),
    react(kind) { if (kind === 'happy') setFace(1, 1200); }
  };
})();
