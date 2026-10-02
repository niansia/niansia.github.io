/* Visitor milestone: whoever's visit brings the site total to a multiple of 100 gets about ten seconds of balloons,
   confetti and star bursts over the whole page, once.
   site-stats.js calls NIANSIA_PARTY(n) only with the number its own counter transaction committed (the database rules
   allow exactly +1 per write, so each number belongs to one visit). The number waits in sessionStorage until the page is
   visible and the boot intro has gone, so leaving the first page early still shows it on the next one; it is marked done
   the moment it starts, so reloading, moving between pages and later visits never replay it.
   Reduced motion (the system setting or the site's "background & interface" switch) shows the card without particles.
   `?stats=party` previews it without touching the counter. */
(() => {
  'use strict';
  if (window.NIANSIA_PARTY) return;
  const KEY = 'niansia-party', LIFE = 10000;
  const lang = (document.documentElement.lang || 'en').toLowerCase();
  const loc = lang.startsWith('zh') ? (/cn|hans/.test(lang) ? 'zh-CN' : 'zh-TW') : 'en';
  const COPY = {
    en: {title: n => `You're visitor #${n}!`, sub: 'Thanks for stopping by niansia.com. This little surprise is only for you, and it plays just once.', close: 'Close', preview: 'Preview'},
    'zh-TW': {title: n => `你是第 ${n} 位訪客！`, sub: '謝謝你來逛 niansia.com。這份小驚喜只有你看得到，而且只會出現這一次。', close: '關閉', preview: '預覽'},
    'zh-CN': {title: n => `你是第 ${n} 位访客！`, sub: '谢谢你来逛 niansia.com。这份小惊喜只有你看得到，而且只会出现这一次。', close: '关闭', preview: '预览'}
  }[loc];
  const parts = () => { try { return JSON.parse(localStorage.getItem('niansia-motion-parts') || 'null'); } catch { return null; } };
  const still = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    const p = parts(); if (p) return p.ui === false;
    try { return localStorage.getItem('niansia-motion') === 'off'; } catch { return false; }
  };
  const ready = () => document.visibilityState === 'visible' && !document.getElementById('boot');
  function whenReady(fn) {
    if (ready()) { fn(); return; }
    const check = () => { if (!ready()) return; clearInterval(timer); document.removeEventListener('visibilitychange', check); fn(); };
    const timer = setInterval(check, 250);
    document.addEventListener('visibilitychange', check);
  }

  let running = false;
  window.NIANSIA_PARTY = (n, preview = false) => {
    n = Number(n);
    if (running || !(n > 0)) return;
    if (!preview) { let st = null; try { st = sessionStorage.getItem(KEY); } catch {} if (st === 'done') return; }
    running = true;
    whenReady(() => setTimeout(() => {
      if (!preview) { try { sessionStorage.setItem(KEY, 'done'); } catch {} }
      play(n, preview);
    }, 400));
  };

  const CSS = `
#np-party{position:fixed;inset:0;z-index:2147482000;pointer-events:none;transition:opacity .6s ease;}
#np-party.is-out{opacity:0;}
#np-party canvas{position:absolute;inset:0;}
#np-party .np-card{position:absolute;left:50%;top:clamp(64px,15vh,150px);transform:translateX(-50%);box-sizing:border-box;
  width:max-content;max-width:min(88vw,460px);padding:18px 30px 20px;border-radius:20px;text-align:center;overflow:hidden;
  pointer-events:auto;cursor:pointer;color:var(--ink,#262938);font-family:inherit;
  background:color-mix(in srgb,var(--surface,#fff) 90%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  border:1px solid color-mix(in srgb,var(--accent,#5854b8) 35%,transparent);box-shadow:0 18px 50px #0000002e,0 3px 10px #0000001f;
  animation:np-pop .75s cubic-bezier(.2,1.4,.4,1) both;}
#np-party.is-calm .np-card{animation:np-fade .5s ease both;}
#np-party .np-tag{display:block;margin-bottom:8px;font:700 12px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,#5854b8);}
#np-party .np-title{display:block;margin:0 0 6px;font-size:clamp(21px,4.8vw,29px);line-height:1.25;font-weight:800;
  background:linear-gradient(90deg,var(--accent,#5854b8),var(--accent-2,#c9578b));-webkit-background-clip:text;background-clip:text;color:transparent;}
#np-party .np-sub{display:block;font-size:14px;line-height:1.65;color:var(--muted,#626779);}
#np-party .np-x{position:absolute;top:6px;right:8px;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:none;
  color:var(--muted,#626779);font:400 18px/28px system-ui,sans-serif;cursor:pointer;}
#np-party .np-x:hover,#np-party .np-x:focus-visible{background:color-mix(in srgb,var(--accent,#5854b8) 14%,transparent);outline:none;}
#np-party .np-bar{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;
  background:linear-gradient(90deg,var(--accent,#5854b8),var(--accent-2,#c9578b));animation:np-bar ${LIFE}ms linear both;}
@keyframes np-pop{from{opacity:0;transform:translate(-50%,-16px) scale(.82);}to{opacity:1;transform:translate(-50%,0) scale(1);}}
@keyframes np-fade{from{opacity:0;}to{opacity:1;}}
@keyframes np-bar{from{transform:scaleX(1);}to{transform:scaleX(0);}}`;

  function play(n, preview) {
    const calm = still();
    const style = document.createElement('style'); style.textContent = CSS; document.head.append(style);
    const wrap = document.createElement('div');
    wrap.id = 'np-party'; if (calm) wrap.className = 'is-calm';
    const num = n.toLocaleString(loc);
    wrap.innerHTML = `<div class="np-card" role="status" aria-live="polite"><button type="button" class="np-x" aria-label="${COPY.close}">×</button>`
      + `<span class="np-tag">${preview ? `${COPY.preview} · ` : ''}No. ${num}</span><span class="np-title">${COPY.title(num)}</span>`
      + `<span class="np-sub">${COPY.sub}</span><i class="np-bar" aria-hidden="true"></i></div>`;
    document.body.append(wrap);
    let stop = () => {}, over = false;
    const end = () => {
      if (over) return; over = true;
      wrap.classList.add('is-out'); removeEventListener('keydown', esc);
      setTimeout(() => { stop(); wrap.remove(); style.remove(); running = false; }, 650);
    };
    const esc = e => { if (e.key === 'Escape') end(); };
    addEventListener('keydown', esc);
    wrap.querySelector('.np-card').addEventListener('click', end);
    setTimeout(end, LIFE);
    if (calm) return;
    const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true');
    wrap.prepend(canvas);
    stop = confetti(canvas);
    const p = parts();
    if (!p || p.yuki !== false) setTimeout(() => { try { window.YUKI?.move?.('dance'); } catch {} }, 600);
  }

  /* Balloons drift up, confetti falls in two waves, star bursts pop in the upper half, sparkles twinkle in between.
     Time only advances while frames are drawn, so a hidden tab pauses the show instead of skipping it. */
  function confetti(cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;
    const fit = () => {
      const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit(); addEventListener('resize', fit);
    const css = getComputedStyle(document.documentElement);
    const theme = ['--accent', '--accent-2'].map(v => css.getPropertyValue(v).trim()).filter(c => /^#|^rgb|^hsl/.test(c));
    const PAL = [...theme, '#ff7aa8', '#ffc94d', '#6fc3ff', '#7be0b0', '#b49bff', '#ff9e6b'];
    const GLOW = ['#ffc23d', '#ffb02e', '#ffd95e', '#ff6fa3', '#9b7bff', '#4fb3ff'];   // saturated, so stars read on light themes too
    const R = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
    const small = W < 640, k = small ? .8 : 1;

    const balloons = Array.from({length: small ? 11 : 18}, () => {
      const r = R(22, 36) * k;
      return {r, c: pick(PAL), x: R(.04, .96) * W, y0: H + r * 1.3 + R(0, 120), delay: R(0, 1.8),
        vy: (H + r * 4 + 180) / R(6.2, 8.2), amp: R(10, 26), w: R(1.1, 1.9), ph: R(0, 6.28)};
    });
    const bits = [];
    const wave = (count, from, span) => { for (let i = 0; i < count; i++) bits.push({
      t0: from + R(0, span), x: R(0, W), y: -R(10, 40), vx: R(-70, 70), vy: R(40, 170), rot: R(0, 6.28), vr: R(-6, 6),
      flip: R(0, 6.28), vf: R(4, 9), w: R(6, 11) * k, h: R(3.5, 6) * k, c: pick(PAL), round: Math.random() < .22}); };
    wave(small ? 80 : 130, 0, .9); wave(small ? 50 : 80, 2.6, 1);
    const bursts = [.5, 1.5, 2.5, 3.6, 4.7, 5.8, 6.9].map(t0 => ({t0, x: R(.12, .88) * W, y: R(.18, .62) * H, born: false}));
    const stars = [], flashes = [];
    const sparkles = Array.from({length: small ? 16 : 28}, () => ({x: R(0, W), y: R(0, H * .85), t0: R(.6, 7.5), life: R(1, 1.7), s: R(6, 11) * k, c: pick(GLOW)}));

    function balloon(b, x, y, a) {
      const r = b.r, tip = r * 1.18;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(Math.sin(b.ph + y * .004) * .08);
      ctx.strokeStyle = 'rgba(110,100,125,.5)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0, tip + 5);
      ctx.bezierCurveTo(-9, tip + r * .8, 9, tip + r * 1.5, -3, tip + r * 2.3); ctx.stroke();
      ctx.fillStyle = b.c;
      ctx.beginPath(); ctx.moveTo(0, tip - 2); ctx.lineTo(-5, tip + 6); ctx.lineTo(5, tip + 6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -r * 1.15);
      ctx.bezierCurveTo(r * 1.08, -r * 1.15, r * 1.05, r * .55, 0, tip);
      ctx.bezierCurveTo(-r * 1.05, r * .55, -r * 1.08, -r * 1.15, 0, -r * 1.15); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      ctx.beginPath(); ctx.ellipse(r * .28, r * .32, r * .5, r * .62, -.4, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.ellipse(-r * .38, -r * .45, r * .17, r * .32, .5, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    function star(x, y, s, rot, c, a) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const rr = i % 2 ? s * .45 : s, an = i * Math.PI / 5 - Math.PI / 2; ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.lineJoin = 'round'; ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
      ctx.restore();
    }
    function sparkle(x, y, s, c, a) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s); ctx.fill(); ctx.restore();
    }

    let t = 0, last = performance.now(), raf = 0;
    const END = LIFE / 1000;
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      ctx.clearRect(0, 0, W, H);
      const fade = t > END - 1.4 ? Math.max(0, (END - t) / 1.4) : Math.min(1, t / .3);
      for (const b of bursts) {
        if (b.born || t < b.t0) continue;
        b.born = true; flashes.push({x: b.x, y: b.y, t0: t});
        const count = small ? 16 : 24;
        for (let i = 0; i < count; i++) {
          const an = i / count * 6.283 + R(-.15, .15), sp = R(140, 360) * k;
          stars.push({x: b.x, y: b.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, t0: t, life: R(1.3, 2.1), s: R(6, 12) * k, rot: R(0, 6.28), vr: R(-4, 4), c: pick(GLOW), ph: R(0, 6.28)});
        }
      }
      for (const f of flashes) {
        const age = t - f.t0; if (age > .4) continue;
        ctx.save(); ctx.globalAlpha = (1 - age / .4) * .45 * fade; ctx.fillStyle = '#fff6d6';
        ctx.beginPath(); ctx.arc(f.x, f.y, 10 + age * 160 * k, 0, 6.283); ctx.fill(); ctx.restore();
      }
      for (const b of balloons) {
        const age = t - b.delay; if (age < 0) continue;
        const y = b.y0 - b.vy * age; if (y < -b.r * 4) continue;
        balloon(b, b.x + Math.sin(age * b.w + b.ph) * b.amp, y, fade);
      }
      for (const p of bits) {
        if (t < p.t0) continue;
        p.vy = Math.min(p.vy + 140 * dt, 260); p.vx *= 1 - .6 * dt;
        p.x += (p.vx + Math.sin(p.flip) * 25) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt;
        if (p.y > H + 20) continue;
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(p.flip)) * .85 + .15);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.h * .9, 0, 6.283); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      for (const s of stars) {
        const age = t - s.t0; if (age > s.life) continue;
        const drag = Math.exp(-2.2 * age);
        const x = s.x + s.vx * (1 - drag) / 2.2, y = s.y + s.vy * (1 - drag) / 2.2 + 45 * age * age;
        const a = (1 - age / s.life) * (.65 + .35 * Math.sin(age * 22 + s.ph)) * fade;
        star(x, y, s.s, s.rot + s.vr * age, s.c, Math.max(0, a));
      }
      for (const s of sparkles) {
        const age = t - s.t0; if (age < 0 || age > s.life) continue;
        sparkle(s.x, s.y, s.s * (1 + .4 * Math.sin(age * 9)), s.c, Math.sin(age / s.life * Math.PI) * .9 * fade);
      }
      if (t < END) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); };
  }
})();
