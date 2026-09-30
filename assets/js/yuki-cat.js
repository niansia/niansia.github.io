/* Yuki's cat form: frames cut from the generated cat sprite sheets (tools/build_cat.py -> assets/lab/yuki/cat/), plus
   the small motions one painting per pose cannot show: breathing, a trot, kicking paws on her back, a roll-over flip,
   and the puff of smoke she turns into a cat (and back) in. yuki-pet.js maps the catgirl's poses onto cat frames with
   frameFor(); the study companion on /exams/ uses the same frames and styles. The styles live here so both pages get
   them from one place. */
(() => {
  'use strict';
  const BASE = '/assets/lab/yuki/cat/';
  let layout = null, loading = null;
  function load() {
    if (layout) return Promise.resolve(layout);
    if (!loading) {
      const img = new Image();
      img.src = `${BASE}cat.webp`;
      loading = Promise.all([fetch(`${BASE}layout.json`).then(r => { if (!r.ok) throw new Error(`layout ${r.status}`); return r.json(); }), img.decode()])
        .then(([l]) => { layout = l; style(); return l; });
      loading.catch(() => { loading = null; });
    }
    return loading;
  }
  // The catgirl's poses (and, for walking and dancing, her sprite frame numbers) mapped onto the cat's frames.
  const POSE = {idle: 'stand', happy: 'happy', yawn: 'stretch', pet: 'happy', lie: 'sit', sit: 'sit', sleep: 'curl', eat: 'sit', drag: 'leap', fall: 'leap',
    dizzy: 'sit', annoyed: 'crouch', trick: 'leap', crouch: 'crouch', jump: 'leap', cute: 'belly', belly: 'belly'};
  function frameFor(pose, frame = 0, {juggling = false} = {}) {
    if (juggling) return 'belly';                                        // batting the yarn ball, on her back
    if (pose === 'walk') return (frame - 5 + 8) % 8 < 4 ? 'walkA' : 'walkB';   // eight catgirl steps = two cat strides
    if (pose === 'dance') return frame === 2 ? 'happy' : 'sit';
    return POSE[pose] || 'stand';
  }
  const index = name => Math.max(0, layout ? layout.frames.indexOf(name) : 0);
  const anchor = name => layout?.anchors?.[name] || [.75, .2, .4];
  function paint(el, name) { el.style.setProperty('--cf', index(name)); el.dataset.cat = name; }

  // A puff of smoke over an element: soft clouds swell, hide the change at their thickest, then drift off.
  // Resolves at the thickest moment, which is when the caller swaps the figure.
  function smoke(host, {count = 15, ms = 1150} = {}) {
    const box = host.getBoundingClientRect(), layer = document.createElement('div');
    layer.className = 'cat-smoke-layer';
    Object.assign(layer.style, {left: `${box.left + box.width / 2}px`, top: `${box.top + box.height * .66}px`});
    document.body.append(layer);
    const size = Math.max(box.width, box.height);
    for (let i = 0; i < count; i++) {
      const puff = document.createElement('i'), a = (i / count) * Math.PI * 2 + Math.random() * .6, r = size * (.12 + Math.random() * .28), s = size * (.32 + Math.random() * .3);
      puff.className = i % 4 ? 'cat-smoke' : 'cat-smoke is-violet';
      Object.assign(puff.style, {width: `${s}px`, height: `${s}px`, left: `${-s / 2}px`, top: `${-s / 2}px`});
      layer.append(puff);
      const dx = Math.cos(a) * r * .8, dy = Math.sin(a) * r * 1.15;   // taller than wide: it has to hide a standing catgirl
      puff.animate([
        {opacity: 0, transform: 'translate(0,0) scale(.2)'},
        {opacity: .96, transform: `translate(${dx * .6}px,${dy * .6}px) scale(1)`, offset: .32},
        {opacity: 0, transform: `translate(${dx * 1.4}px,${dy * 1.2 - size * .35}px) scale(1.35)`}
      ], {duration: ms * (.85 + Math.random() * .3), delay: Math.random() * 90, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both'});
    }
    for (let i = 0; i < 6; i++) {   // a few sparkles pop out of the cloud
      const star = document.createElement('b'), a = Math.random() * Math.PI * 2, r = size * (.35 + Math.random() * .3);
      star.className = 'cat-spark'; star.textContent = '✦';
      layer.append(star);
      star.animate([{opacity: 0, transform: 'translate(-50%,-50%) scale(.3)'}, {opacity: 1, offset: .3},
        {opacity: 0, transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r}px)) scale(1.1) rotate(90deg)`}],
      {duration: 900, delay: 180 + i * 60, easing: 'ease-out', fill: 'both'});
    }
    setTimeout(() => layer.remove(), ms + 900);
    return new Promise(resolve => setTimeout(resolve, ms * .36));
  }

  function style() {
    if (document.getElementById('yuki-cat-style')) return;
    const css = document.createElement('style');
    css.id = 'yuki-cat-style';
    css.textContent = `
.yuki-cat{display:none;position:absolute;inset:0;background:url('${BASE}cat.webp') 0 0/calc(var(--cn,10) * 100%) 100% no-repeat;
  background-position-x:calc(var(--cf,0) * 100% / (var(--cn,10) - 1));transform-origin:50% 100%;filter:drop-shadow(0 1px 0 #fff8);}
.yuki[data-form='cat'] .yuki-cat{display:block;}
.yuki[data-form='cat'] :is(.yuki-sprite,.yuki-tailbox,.yuki-acc){display:none;}
.yuki-cat:is([data-cat='stand'],[data-cat='sit']){animation:cat-breathe 3.4s ease-in-out infinite;}
.yuki-cat[data-cat='curl']{animation:cat-breathe 4.8s ease-in-out infinite;}
.yuki-cat[data-cat='belly']{animation:cat-kick .5s ease-in-out infinite alternate;}
.yuki-cat[data-cat='happy']{animation:cat-glee .9s ease-in-out infinite alternate;}
.yuki[data-pose='walk'] .yuki-cat{animation:cat-trot .4s ease-in-out infinite alternate;}
.yuki[data-pose='walk'][data-gait='run'] .yuki-cat{animation-duration:.2s;}
.yuki.is-flipping .yuki-cat{animation:cat-flip .44s ease-in-out;}
.yuki[data-form='cat'] .yuki-bed{left:calc(var(--w) * -.08);width:calc(var(--w) * 1.16);height:calc(var(--w) * .36);}
.yuki[data-form='cat'][data-pose='sleep'] .yuki-figure{height:100%;bottom:calc(var(--h) * .17);clip-path:none;transform:scaleX(var(--dir));animation:none;}   /* curled up in the bed, the rim hiding only her underside */
.yuki[data-form='cat'][data-pose='sleep'] .yuki-hit{top:30%;}.yuki[data-form='cat'][data-pose='sleep'] .yuki-shadow{width:calc(var(--w) * 1.1);}
.yuki[data-form='cat'] .yuki-blanket{display:none;}
.yuki[data-form='cat'] .yuki-shadow{width:calc(var(--w) * .8);}
@keyframes cat-breathe{50%{transform:scale(1.01,1.022);}}
@keyframes cat-kick{from{transform:rotate(-2.5deg);}to{transform:rotate(2.5deg) translateY(-1.5%);}}
@keyframes cat-glee{from{transform:translateY(0);}to{transform:translateY(-2.5%) scale(1.01,1.02);}}
@keyframes cat-trot{from{transform:translateY(0) rotate(-1.2deg);}to{transform:translateY(-3%) rotate(1.2deg);}}
@keyframes cat-flip{0%{transform:scaleY(1);}50%{transform:scaleY(.06) translateY(3%);}100%{transform:scaleY(1);}}
.cat-smoke-layer{position:fixed;z-index:60;width:0;height:0;pointer-events:none;}
.cat-smoke{position:absolute;border-radius:50%;background:radial-gradient(circle at 42% 38%,#fff 0,#fbf8ff 38%,#efe7fdcc 58%,#e6dcfb00 72%);}
.cat-smoke.is-violet{background:radial-gradient(circle at 42% 38%,#f7f1ff 0,#e7dbff 40%,#d9c8fb99 60%,#d9c8fb00 74%);}
.cat-spark{position:absolute;left:0;top:0;color:#b99af0;font:700 16px/1 system-ui;text-shadow:0 0 6px #fff;}
@media (prefers-reduced-motion:reduce){.yuki-cat{animation:none!important;}}`;
    document.head.append(css);
  }
  window.YukiCat = {load, frameFor, index, anchor, paint, smoke, base: BASE, layout: () => layout};
})();
