/* Props and sounds for Yuki's actions (used by yuki-pet.js): a patting hand, snacks that get bitten, a school desk,
   a toy piano, a violin with its bow, a feather wand, and a tiny Web Audio synth for her performances.
   Everything is drawn as inline SVG in the page's palette; the melodies are public-domain tunes or written here. */
(() => {
  'use strict';
  let uid = 0;
  const P = {};

  P.hand = () => `<svg class="yp-hand" viewBox="0 0 60 44" aria-hidden="true">
    <path d="M6 26c0-9 8-15 18-15h14c10 0 18 6 18 13 0 6-4 10-10 10H16C10 34 6 31 6 26z" fill="#ffe3d3" stroke="#d9a48c" stroke-width="1.6"/>
    <path d="M22 34v6M30 34v7M38 34v6M46 32v5" stroke="#d9a48c" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M18 34c0 5 3 8 4 8s4-3 4-8M26 34c0 6 3 9 4 9s4-3 4-9M34 34c0 5 3 8 4 8s4-3 4-8M42 33c0 4 2 6 4 6s3-2 3-6" fill="#ffe3d3" stroke="#d9a48c" stroke-width="1.6"/>
    <rect x="0" y="10" width="14" height="22" rx="5" fill="var(--accent,#b8406f)" opacity=".9"/>
    <path d="M14 13v16" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="2 3"/>
    <ellipse cx="44" cy="18" rx="5" ry="2.4" fill="#fff" opacity=".45"/></svg>`;

  /* Snacks. A mask gets a "bite" circle added per bite, so the snack really disappears from the mouth side. */
  const FOOD = {
    fish: '<path d="M4 22c8-12 26-14 38-4l10-7v22l-10-7c-12 10-30 8-38-4z" fill="#f0a35e"/><path d="M18 14c4 4 4 12 0 16M26 13c4 5 4 13 0 18" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none"/><circle cx="12" cy="20" r="2.2" fill="#3a2630"/>',
    taiyaki: '<path d="M4 22c6-11 22-15 34-9l12-7-2 14 4 6-14 2c-10 8-28 8-34-6z" fill="#d9924a" stroke="#a8652b" stroke-width="1.5"/><path d="M14 18l4 4-4 4M22 16l4 5-4 5M30 16l4 5-4 5" stroke="#a8652b" stroke-width="1.4" fill="none"/><circle cx="10" cy="20" r="2" fill="#5a3314"/>',
    cake: '<path d="M6 30l40-16v16z" fill="#fff4e8" stroke="#e6c4a8" stroke-width="1.5"/><path d="M6 30l40-16v5L6 35z" fill="#f7b8c8"/><path d="M6 35v4h40V19z" fill="#fde9d4" stroke="#e6c4a8" stroke-width="1.5"/><path d="M8 34l38-15" stroke="#f08aa6" stroke-width="2.4"/><path d="M34 12c0-4 4-7 7-5 3-2 7 1 6 5-1 5-6 7-7 7s-6-2-6-7z" fill="#e8384f"/><path d="M40 7l1-4 3 2" stroke="#4e8f4a" stroke-width="1.6" fill="none"/>',
  };
  P.food = kind => {
    const id = `ypb${++uid}`;
    return `<svg class="yp-food" viewBox="0 0 56 44" data-kind="${kind}" aria-hidden="true"><defs><mask id="${id}"><rect width="56" height="44" fill="#fff"/><g class="yp-bites"></g></mask></defs><g mask="url(#${id})">${FOOD[kind] || FOOD.fish}</g></svg>`;
  };
  // Bites eat from the left end (her mouth side) inwards.
  P.bite = (svg, n) => {
    const g = svg.querySelector('.yp-bites');
    const at = [[8, 18], [20, 22], [32, 20]][n] || [44, 22];
    g.insertAdjacentHTML('beforeend', `<circle cx="${at[0]}" cy="${at[1] - 6}" r="9"/><circle cx="${at[0] + 3}" cy="${at[1] + 8}" r="8"/><circle cx="${at[0] - 4}" cy="${at[1] + 2}" r="9"/>`);
  };

  P.desk = () => `<svg class="yp-desk" viewBox="0 0 130 70" aria-hidden="true">
    <path d="M18 20h94l-4 50h-6l3-40H25l3 40h-6z" fill="#8a94a6"/>
    <rect x="6" y="10" width="118" height="12" rx="3" fill="#d6a15f"/><rect x="6" y="18" width="118" height="4" fill="#b98044"/>
    <path d="M22 26h86v18H22z" fill="#7a8394"/><path d="M26 29h78" stroke="#ffffff33" stroke-width="1.2"/>
    <path d="M60 11.5l16-4 16 4-16 3.6z" fill="#fffdf7" stroke="#d8cdbb" stroke-width="1"/><path d="M76 7.5v7.6" stroke="#d8cdbb" stroke-width="1"/>
    <path d="M64 10.5l9-2M64 12.2l9-2M79 8.6l9 2M79 10.3l9 2" stroke="#c9bda8" stroke-width=".7"/>
    <path d="M28 12.6l20-5" stroke="#f2c14e" stroke-width="2.4" stroke-linecap="round"/><path d="M48 7.6l3-.8" stroke="#3a2630" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M100 9c1.5-2.5 5-2 5 .5 0 2.5-3.5 4-5 5-1.5-1-5-2.5-5-5 0-2.5 3.5-3 5-.5z" fill="var(--accent-2,#c9578b)" opacity=".85"/></svg>`;

  const KEYS = 8;
  P.piano = () => `<svg class="yp-piano" viewBox="0 0 120 64" aria-hidden="true">
    <rect x="4" y="4" width="112" height="56" rx="8" fill="var(--accent,#b8406f)"/><rect x="4" y="4" width="112" height="14" rx="7" fill="#ffffff26"/>
    <rect x="10" y="22" width="100" height="24" rx="3" fill="#fffdf9"/>
    ${Array.from({length: KEYS}, (_, i) => `<rect class="yp-key" data-k="${i}" x="${10 + i * 12.5}" y="22" width="12" height="24" rx="2" fill="#fffdf9" stroke="#d9cfd8" stroke-width=".8"/>`).join('')}
    ${[0, 1, 3, 4, 5].map(i => `<rect x="${18.5 + i * 12.5}" y="22" width="7" height="14" rx="1.5" fill="#3a2630"/>`).join('')}
    <path d="M14 52h92" stroke="#ffffff55" stroke-width="2" stroke-dasharray="3 5"/><circle cx="18" cy="11" r="2" fill="#fff" opacity=".7"/><circle cx="102" cy="11" r="2" fill="#fff" opacity=".7"/></svg>`;

  P.violin = () => `<svg class="yp-violin" viewBox="0 0 34 90" aria-hidden="true">
    <path d="M17 26c-6 0-10 4-10 9 0 3 2 5 2 7s-3 4-3 9c0 8 5 13 11 13s11-5 11-13c0-5-3-7-3-9s2-4 2-7c0-5-4-9-10-9z" fill="#b5622d" stroke="#7a3b16" stroke-width="1.4"/>
    <path d="M13 44c-1 2-1 4 0 6M21 44c1 2 1 4 0 6" stroke="#3a1c0b" stroke-width="1.4" fill="none"/>
    <rect x="15" y="4" width="4" height="26" rx="1.5" fill="#3a2630"/><circle cx="17" cy="4" r="3.4" fill="none" stroke="#3a2630" stroke-width="1.8"/>
    <path d="M16 8v52M18 8v52" stroke="#e8dfcf" stroke-width=".5"/><rect x="13" y="58" width="8" height="2" rx=".8" fill="#e8c28a"/>
    <path d="M15 64l2 6 2-6z" fill="#3a2630"/></svg>`;
  P.bow = () => `<svg class="yp-bow" viewBox="0 0 90 10" aria-hidden="true"><path d="M3 4h82" stroke="#6b3b1d" stroke-width="2" stroke-linecap="round"/><path d="M6 7.4h76" stroke="#f3ead7" stroke-width="1.1"/><rect x="0" y="2" width="8" height="6" rx="1.5" fill="#3a2630"/></svg>`;

  P.feather = () => `<g class="yp-feather"><path d="M0 0c-6 4-10 12-8 22 6-4 10-12 8-22z" fill="var(--accent-2,#c9578b)"/><path d="M0 0c6 4 10 12 8 22-6-4-10-12-8-22z" fill="var(--accent,#b8406f)" opacity=".85"/><path d="M0 0v24" stroke="#fff" stroke-width="1"/><circle cx="0" cy="0" r="2.4" fill="#ffd36e"/></g>`;
  P.yarn = () => `<svg class="yp-yarn" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--accent-2,#c9578b)"/><path d="M3 9q9 1 13 12M2 14q9-3 15-12M8 2q6 6 5 20" stroke="#fff" stroke-opacity=".6" stroke-width="1.3" fill="none"/></svg>`;

  /* ---------- a very small synth ---------- */
  let ctx = null, master = null;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = .16; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(kind, midi, t, dur) {
    const c = ctx, out = c.createGain(); out.connect(master);
    if (kind === 'piano') {
      [[1, 'triangle', .9], [2, 'sine', .25], [3, 'sine', .08]].forEach(([mul, type, amp]) => {
        const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = hz(midi) * mul;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + .006); g.gain.exponentialRampToValueAtTime(.001, t + Math.max(.5, dur * 2.4));
        o.connect(g).connect(out); o.start(t); o.stop(t + dur * 2.6 + .1);
      });
    } else if (kind === 'violin') {
      const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), depth = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = hz(midi); f.type = 'lowpass'; f.frequency.value = 2300; f.Q.value = .8;
      lfo.frequency.value = 5.6; depth.gain.value = hz(midi) * .006; lfo.connect(depth).connect(o.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.34, t + .09); g.gain.setValueAtTime(.3, t + dur - .07); g.gain.linearRampToValueAtTime(0, t + dur + .05);
      o.connect(f).connect(g).connect(out); o.start(t); lfo.start(t + .12); o.stop(t + dur + .1); lfo.stop(t + dur + .1);
    } else {  // chiptune lead or bass
      const o = c.createOscillator(), g = c.createGain(); o.type = kind === 'bass' ? 'triangle' : 'square'; o.frequency.value = hz(midi);
      const amp = kind === 'bass' ? .5 : .16;
      g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(.001, t + dur * .95);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur);
    }
  }
  function tick(t) {  // a soft hat for the dance beat
    const c = ctx, len = .05, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'highpass'; f.frequency.value = 6000; g.gain.value = .25;
    s.connect(f).connect(g).connect(master); s.start(t);
  }
  // [midi, beats]; public domain: Twinkle Twinkle Little Star (piano), Ode to Joy (violin). The dance loop is original.
  const SONGS = {
    piano: {beat: .34, notes: [[60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2], [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2]]},
    violin: {beat: .36, notes: [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1], [60, 1], [60, 1], [62, 1], [64, 1], [64, 1.5], [62, .5], [62, 2]]},
    dance: {beat: .2, notes: [[72, 1], [76, 1], [79, 1], [76, 1], [74, 1], [77, 1], [81, 2], [79, 1], [76, 1], [72, 1], [74, 1], [76, 2], [72, 2], [79, 1], [81, 1], [79, 1], [76, 1], [77, 1], [74, 1], [72, 4]]},
  };
  const PIANO_KEYS = {60: 0, 62: 1, 64: 2, 65: 3, 67: 4, 69: 5, 71: 6, 72: 7};
  /* Plays a song (if sound is on) and calls onNote(midi, index, seconds-from-start) in time with it, sound or not. */
  function play(kind, {sound = true, onNote} = {}) {
    const song = SONGS[kind]; if (!song) return {stop() {}, duration: 0};
    const timers = []; let at = 0;
    const c = sound ? audio() : null, t0 = c ? c.currentTime + .05 : 0;
    song.notes.forEach(([m, beats], i) => {
      const dur = beats * song.beat;
      if (c) {
        tone(kind === 'dance' ? 'lead' : kind, m, t0 + at, dur);
        if (kind === 'dance') { if (i % 2 === 0) tone('bass', m - 24, t0 + at, dur * 1.6); tick(t0 + at); }
      }
      const when = at; timers.push(setTimeout(() => onNote?.(m, i, when), when * 1000 + 50));
      at += dur;
    });
    return {duration: at, stop() { timers.forEach(clearTimeout); }};
  }
  P.sound = {play, pianoKey: m => PIANO_KEYS[m] ?? (m % KEYS)};
  window.YukiProps = P;
})();
