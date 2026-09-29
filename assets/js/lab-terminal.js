/* Niansia's portfolio shell: no commands leave the browser. */
(() => {
  'use strict';
  const root = document.querySelector('[data-terminal-app]');
  if (!root || !window.NIANSIA_COPY || !window.NIANSIA_PROJECTS || !window.NIANSIA_TERMINAL) return;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const store = { get(key, fallback) { try { return localStorage.getItem(`niansia-${key}`) ?? fallback; } catch { return fallback; } }, set(key,value) { try { localStorage.setItem(`niansia-${key}`,value); } catch {} } };
  const BASE_PATHS = ['home','about','projects','research','papers','blog','contact','hobbies','guestbook','cv','help'];
  const BASE_FILES = ['start.sh','about.md','projects/','research.md','papers.bib','blog/','contact.txt','hobbies.md','guestbook.md','cv.pdf','help'];
  const NAV_ICONS = {home:'terminal',about:'file',projects:'folder',research:'research',papers:'paper',blog:'pen',contact:'mail',hobbies:'heart',guestbook:'chat',cv:'badge',help:'help'};
  const cvState = () => { const s = window.NIANSIA_CV?.status || 'hidden'; return s === 'locked' && new URLSearchParams(location.search).get('cv') === 'preview' ? 'preview' : s; };
  const paths = BASE_PATHS.filter(p => p !== 'cv' || cvState() !== 'hidden');
  const files = paths.map(p => BASE_FILES[BASE_PATHS.indexOf(p)]);
  const navLabel = (p, c = t()) => c.nav[BASE_PATHS.indexOf(p)];
  const themeGroups = [['classic',['sakura','light','dark','matcha','retro']],['wa',['fuji','aizome','momiji','yozakura','washi','asagi']],['glass',['glass','glass-night']]];
  const themes = themeGroups.flatMap(([, list]) => list);
  const darkThemes = ['dark','retro','yozakura','glass-night'];
  const themePairs = {sakura:'yozakura',yozakura:'sakura',glass:'glass-night','glass-night':'glass'}; // the moon/sun button flips to the matching light/dark twin
  const themeColors = {light:'#edf0f7',dark:'#101117',sakura:'#fbf0f4',matcha:'#eef2e8',retro:'#060a07',fuji:'#efe8fb',aizome:'#e8edf3',momiji:'#fbefe6',yozakura:'#110f1c',washi:'#f5f1e8',asagi:'#ecf7f6',glass:'#dfe8ff','glass-night':'#070914'};
  const icons = {
    terminal:'m4 5 6 7-6 7m9 0h7', file:'M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 13h8M8 17h5',
    folder:'M3 7V4h6l2 3h10v13H3z', pen:'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4M14 20h6', research:'M9 3h6m-5 0v7l-5 9q-1 2 2 2h10q3 0 2-2l-5-9V3M8 15h8',
    mail:'M3 5h18v14H3zM3 5l9 8 9-8', help:'M9 8a3 3 0 1 1 5 3l-2 2v1M12 18h.01',
    sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.4 1.4m10 10 1.4 1.4M5.6 18.4 1.4-1.4m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z', pause:'M8 5v14M16 5v14', play:'m8 4 12 8-12 8z',
    paw:'M8 14q4-5 8 0l2 4q0 4-6 1-6 3-6-1zM5 7v3M10 4v3M15 4v3M20 7v3',
    arrow:'M4 12h15m-6-6 6 6-6 6', close:'m6 6 12 12M6 18 18 6', chat:'M4 4h16v13H9l-5 4z', link:'M8 16 16 8M10 4h10v10M5 9H3v12h12v-2', copy:'M8 8h12v12H8zM4 16H2V2h14v2', heart:'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5z',
    palette:'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.4-2.2-.7-1.3.2-2.8 1.7-2.8H18a3 3 0 0 0 3-3c0-5.5-4-10-9-10zM7.5 11h.01M10 7h.01M15 7.5h.01',
    spark:'M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6 3 3M6 18l3-3m6-6 3-3',
    badge:'M6 3h12v18H6zM9 8h6M9 12h6M9 16h3', paper:'M6 2h9l4 4v16H6zM14 2v5h5M9 11h7M9 15h7M9 19h4', bolt:'M13 2 4 14h7l-1 8 9-12h-7z',
    search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.2-4.2', compass:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5z', book:'M4 5q4-2 8 0v15q-4-2-8 0zM12 5q4-2 8 0v15q-4-2-8 0z', lock:'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4.5V12l3 2', download:'M12 3v12m-5-5 5 5 5-5M4 20h16'
  };
  Object.assign(icons, {instagram:'M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM16.8 7.2h.01',
    threads:'M15.4 11.4c0 2.7-1.3 4.2-3.1 4.2-1.3 0-2.2-.8-2.2-1.9 0-1.3 1.2-2.1 3.1-2.1 3 0 4.6 1.5 4.6 3.5 0 2.4-2.1 4-4.9 4-3.8 0-6.2-2.8-6.2-7.1S9.1 4.9 12.6 4.9c2.5 0 4.1 1.2 4.8 3.3',
    discord:'M7.2 7q4.8-1.8 9.6 0 2.4 3.4 2.7 9-2 1.6-4.4 2l-1-1.7q-2.1.5-4.2 0l-1 1.7q-2.4-.4-4.4-2 .3-5.6 2.7-9zM9.6 12.6h.01M14.4 12.6h.01'});
  // The GitHub mark (Octicons mark-github, MIT), filled rather than stroked like the rest of the set.
  const ghMark = '<svg class="icon gh-mark" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';
  const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.file}"/></svg>`;
  let locale = root.dataset.locale || 'en';
  let view = root.dataset.initial || 'home', projectId = '', selectedNav = 0, selectedProject = 0;
  let theme = themes.includes(store.get('theme','sakura')) ? store.get('theme','sakura') : 'sakura';
  let toastTimer, commandHistory = [], historyIndex = 0, booted = false;
  let username = store.get('user','niansia').slice(0,24), historyDraft = '', commandEntries = [];
  const catalogue = window.NIANSIA_TERMINAL.commands;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const t = () => window.NIANSIA_COPY[locale];
  const n = text => String(text).replace('{n}', catalogue.length);
  const projects = () => window.NIANSIA_PROJECTS[locale];
  const $ = selector => root.querySelector(selector);
  /* Animation is four switches (the motion menu): background & interface, pointer effects, Yuki, and page transitions.
     'niansia-motion-parts' keeps them; 'niansia-motion' stays 'off' only when all four are off (older pages read it). */
  const MOTION_PARTS = ['ui', 'cursor', 'yuki', 'pages'];
  const motionParts = (() => {
    let saved = null; try { saved = JSON.parse(store.get('motion-parts', 'null')); } catch {}
    const legacyOff = store.get('motion', 'on') === 'off';
    return Object.fromEntries(MOTION_PARTS.map(k => [k, saved && typeof saved === 'object' ? saved[k] !== false : !legacyOff]));
  })();
  const motion = (part = 'ui') => !reduced.matches && !!motionParts[part];
  const allOff = () => MOTION_PARTS.every(k => !motionParts[k]);
  const langBase = () => locale === 'en' ? '/' : `/${locale.toLowerCase()}/`;
  const emit = (name, detail={}) => window.dispatchEvent(new CustomEvent(`niansia:${name}`, {detail}));
  const yuki = () => window.YUKI;
  const fx = () => window.NIANSIA_FX;

  /* Page-level transitions: a circular reveal from the control that changed the look. */
  function transition(change, origin) {
    if (!document.startViewTransition || !motion() || document.visibilityState !== 'visible') { change(); return; }
    const box = origin?.getBoundingClientRect?.();
    const x = box ? box.left + box.width / 2 : innerWidth - 60, y = box ? box.top + box.height / 2 : 30;
    document.documentElement.style.setProperty('--reveal-x', `${x}px`);
    document.documentElement.style.setProperty('--reveal-y', `${y}px`);
    document.documentElement.dataset.vt = 'reveal';
    const vt = document.startViewTransition(change);
    [vt.ready, vt.updateCallbackDone].forEach(p => p?.catch(() => {}));
    vt.finished.catch(() => {}).finally(() => { if (document.documentElement.dataset.vt === 'reveal') delete document.documentElement.dataset.vt; });
  }
  /* Moving between files: the reading pane slides in the direction of travel (deeper → from the right, back → from the left),
     and a project's title morphs between its directory row and its page. Keyboard moves stay instant. */
  const modKey = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
  const depthOf = (v, id) => v === 'home' ? 0 : id ? 2 : 1;
  const titleOf = () => root.querySelector('.project-detail h1');
  function navTransition(change, {dir, from, to}) {
    const html = document.documentElement;
    if (!document.startViewTransition || !motion('pages') || document.visibilityState !== 'visible' || html.dataset.vt) { change(); return; }
    const named = [];
    const name = (el, n) => { if (el) { el.style.viewTransitionName = n; named.push(el); } };
    name(from, 'vt-title');
    html.dataset.vt = 'nav'; html.dataset.vtDir = dir;
    const vt = document.startViewTransition(() => { named.forEach(el => { el.style.viewTransitionName = ''; }); named.length = 0; change(); if (from) name(to?.(), 'vt-title'); });
    [vt.ready, vt.updateCallbackDone].forEach(p => p?.catch(() => {}));
    vt.finished.catch(() => {}).finally(() => { named.forEach(el => { el.style.viewTransitionName = ''; }); if (html.dataset.vt === 'nav') { delete html.dataset.vt; delete html.dataset.vtDir; } });
  }
  function setTheme(next, origin) {
    next = themes.includes(next) ? next : 'sakura';
    const changed = next !== theme;
    theme = next; store.set('theme', theme);
    const apply = () => {
      document.documentElement.dataset.theme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
      paintThemeControls();
      emit('theme', {theme});
    };
    if (!changed) { apply(); return; }
    transition(apply, origin);
  }
  function paintThemeControls() {
    const button = $('[data-action="theme"]');
    if (button) { button.innerHTML = icon(darkThemes.includes(theme) ? 'sun' : 'moon'); button.setAttribute('aria-pressed', String(darkThemes.includes(theme))); }
    root.querySelectorAll('[data-theme-pick]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.themePick === theme)));
  }
  /* Style picker: hovering or arrowing onto a style previews it on the whole page; only a click keeps it. */
  const styleCopy=()=>({en:{hint:'Hover to preview · click to keep',light:'light',dark:'dark'},'zh-TW':{hint:'滑過預覽 · 點一下套用',light:'淺色',dark:'深色'},'zh-CN':{hint:'滑过预览 · 点一下套用',light:'浅色',dark:'深色'}}[locale]);
  let previewing=null;
  // No festival skin means no data-fskin attribute at all (an empty one would still match :root[data-fskin]).
  function setSkinAttr(id) { if (id) document.documentElement.dataset.fskin = id; else delete document.documentElement.dataset.fskin; }
  function previewTheme(name) {
    if (!themes.includes(name)) return;
    const html=document.documentElement;
    if (previewing===null) previewing={fskin:html.dataset.fskin||''};
    setSkinAttr(''); html.dataset.theme=name;
    root.querySelectorAll('[data-theme-pick]').forEach(el=>el.classList.toggle('is-previewing',el.dataset.themePick===name&&name!==theme));
  }
  function endPreview() {
    if (previewing===null) return;
    const html=document.documentElement;
    html.dataset.theme=theme; setSkinAttr(previewing.fskin); previewing=null;
    root.querySelectorAll('.is-previewing').forEach(el=>el.classList.remove('is-previewing'));
  }
  /* Choosing a style (picker, palette or Yuki): keep the preview, and step out of a festival skin so the style shows. */
  function pickTheme(name, origin) {
    if (previewing) { setSkinAttr(previewing.fskin); previewing=null; }
    root.querySelectorAll('.is-previewing').forEach(el=>el.classList.remove('is-previewing'));
    const f=window.NIANSIA_FESTIVAL?.active();
    if (f&&festSkinOn(f)) { store.set('fest-skin',`off:${f.primary.id}`); applyFestival(); }
    setTheme(name, origin);
  }
  function toggleTheme(origin) { setTheme(themePairs[theme] || (darkThemes.includes(theme) ? 'sakura' : 'dark'), origin); }
  function applyMotion() {
    const html = document.documentElement, on = MOTION_PARTS.filter(k => motion(k));
    html.dataset.motion = on.length ? 'on' : 'off';
    MOTION_PARTS.forEach(k => { html.dataset[`fx${k[0].toUpperCase()}${k.slice(1)}`] = motion(k) ? 'on' : 'off'; });
    const button = $('[data-action="motion"]');
    if (button) { button.innerHTML = icon(on.length ? 'pause' : 'play'); button.classList.toggle('is-partial', on.length > 0 && on.length < MOTION_PARTS.length); }
    root.querySelectorAll('[data-motion-part]').forEach(el => { el.setAttribute('aria-checked', String(motionParts[el.dataset.motionPart])); el.disabled = reduced.matches; });
    const all = $('[data-motion-all]'); if (all) { all.textContent = allOff() ? motionCopy().allOn : motionCopy().allOff; all.disabled = reduced.matches; }
    const note = $('.motion-reduced'); if (note) note.hidden = !reduced.matches;
    emit('motion', {on: on.length > 0, parts: Object.fromEntries(MOTION_PARTS.map(k => [k, motion(k)]))});
  }
  // setMotion(on) turns everything on or off; setMotion(on, part) flips one switch.
  function setMotion(on, part) {
    MOTION_PARTS.forEach(k => { if (!part || k === part) motionParts[k] = !!on; });
    store.set('motion-parts', JSON.stringify(motionParts)); store.set('motion', allOff() ? 'off' : 'on'); applyMotion();
  }
  const motionCopy=()=>({
    en:{title:'Animation',allOff:'Turn all off',allOn:'Turn all on',reduced:'Your system asks for reduced motion, so animation stays off.',
      parts:{ui:['Background & interface','Drifting backgrounds, festival particles, carousels, counters'],cursor:['Pointer effects','The little Yuki by the pointer, trails and click bursts'],yuki:['Yuki moving','Walking, playing, performing and her idle animation'],pages:['Page transitions','The card zoom between pages and the slide between sections']}},
    'zh-TW':{title:'動畫效果',allOff:'全部關閉',allOn:'全部開啟',reduced:'系統開啟了「減少動態效果」，所以動畫維持關閉。',
      parts:{ui:['背景與介面','背景流動、節日飄落、卡片輪播、數字跑動'],cursor:['滑鼠特效','游標旁的小 Yuki、拖尾與點擊煙火'],yuki:['Yuki 動作','走動、玩耍、表演與待機動作'],pages:['換頁轉場','換頁時的卡片放大、切換分頁的滑動']}},
    'zh-CN':{title:'动画效果',allOff:'全部关闭',allOn:'全部开启',reduced:'系统开启了“减少动态效果”，所以动画保持关闭。',
      parts:{ui:['背景与界面','背景流动、节日飘落、卡片轮播、数字跑动'],cursor:['鼠标特效','光标旁的小 Yuki、拖尾与点击烟花'],yuki:['Yuki 动作','走动、玩耍、表演与待机动作'],pages:['换页转场','换页时的卡片放大、切换分页的滑动']}}}[locale]);
  const MOTION_ICONS = {ui: 'spark', cursor: 'heart', yuki: 'paw', pages: 'book'};
  function readLocation() {
    locale = location.pathname.startsWith('/zh-tw') ? 'zh-TW' : location.pathname.startsWith('/zh-cn') ? 'zh-CN' : 'en';
    let parts;
    try { parts = decodeURIComponent(location.hash.slice(1)).split('/'); } catch { parts = ['home']; }
    view = paths.includes(parts[0]) ? parts[0] : location.pathname.includes('/work') ? 'projects' : root.dataset.initial || 'home';
    projectId = view === 'projects' && projects().some(p => p.id === parts[1]) ? parts[1] : '';
    selectedNav = paths.indexOf(view);
    if (projectId) selectedProject = projects().findIndex(p => p.id === projectId);
  }
  function shell() {
    const c = t();
    document.documentElement.lang = locale;
    const sc = styleCopy(), mc = motionCopy();
    const thumb = name => `<span class="theme-thumb" data-theme-scope="${name}" aria-hidden="true"><i class="tt-desk"></i><i class="tt-win"><i class="tt-bar"><b></b><b></b><b></b></i><i class="tt-side"><b></b><b></b><b></b></i><i class="tt-main"><i class="tt-h"></i><i class="tt-l"></i><i class="tt-l tt-s"></i><i class="tt-btn"></i><i class="tt-chip"></i></i></i></span>`;
    const swatches = `<div class="style-groups">${themeGroups.map(([group, list]) => `<section class="style-block"><h3 class="style-group">${c.themeGroups[group]}</h3><div class="style-grid">` + list.map(name => `<button type="button" class="style-option" data-theme-pick="${name}" aria-pressed="${name===theme}" aria-label="${esc(c.themeNames[name])} · ${darkThemes.includes(name)?sc.dark:sc.light}">${thumb(name)}<span class="style-name">${c.themeNames[name]}<small>${darkThemes.includes(name)?'☾ '+sc.dark:'☀ '+sc.light}</small></span></button>`).join('') + `</div></section>`).join('')}</div>`;
    root.innerHTML = `<div class="desktop">
      <header class="desktop-bar"><a class="brand" href="${langBase()}" data-view="home" translate="no">${icon('terminal')}<strong>niansia<span>.terminal</span></strong><i class="brand-caret" aria-hidden="true"></i></a><span class="desktop-motto">${c.desktop}</span>
        <div class="desktop-controls"><button type="button" class="bar-pill bar-search" data-action="palette" aria-keyshortcuts="Control+K Meta+K" title="${esc(briefCopy().search)} (${modKey} K)">${icon('search')}<span>${esc(briefCopy().search)}</span><kbd translate="no">${modKey} K</kbd></button><a class="bar-pill bar-brief" href="/brief/${pubSeg()}" title="${esc(briefCopy().sub)}">${icon('bolt')}<span>${esc(briefCopy().label)}</span></a><span class="control-divider"></span><div class="language-switch" role="group" aria-label="${c.language}"><span class="lang-pill" aria-hidden="true"></span>${[['en','EN'],['zh-TW','繁'],['zh-CN','简']].map(([key,label])=>`<button type="button" data-lang="${key}" aria-pressed="${key===locale}" translate="no">${label}</button>`).join('')}</div><span class="control-divider"></span>
          <div class="style-menu"><button class="icon-button" data-action="styles" title="${c.style}" aria-label="${c.style}" aria-expanded="false" aria-controls="style-popover">${icon('palette')}</button><div class="style-popover" id="style-popover" role="group" aria-label="${c.style}" hidden><div class="style-head"><p>${c.style}</p><span>${sc.hint}</span></div>${swatches}<button type="button" class="style-option fest-toggle" data-fest-skin aria-pressed="false" hidden></button></div></div>
          <button class="icon-button" data-action="theme" title="${c.theme}" aria-label="${c.theme}"></button><div class="motion-menu"><button class="icon-button" data-action="motion" title="${esc(mc.title)}" aria-label="${esc(mc.title)}" aria-expanded="false" aria-controls="motion-popover"></button><div class="motion-popover" id="motion-popover" role="group" aria-label="${esc(mc.title)}" hidden><div class="style-head"><p>${esc(mc.title)}</p><button type="button" class="motion-all" data-motion-all></button></div><p class="motion-reduced" hidden>${esc(mc.reduced)}</p>${MOTION_PARTS.map(k=>`<button type="button" class="motion-row" role="switch" data-motion-part="${k}" aria-checked="true"><span class="motion-ico">${icon(MOTION_ICONS[k])}</span><span class="motion-text"><b>${esc(mc.parts[k][0])}</b><small>${esc(mc.parts[k][1])}</small></span><i class="motion-switch" aria-hidden="true"></i></button>`).join('')}</div></div></div>
      </header>
      <section class="terminal-window" aria-label="Niansia terminal">
        <div class="window-bar"><div class="fest-garland" aria-hidden="true"></div><div class="window-dots"><button type="button" data-action="win-close" aria-label="close"></button><button type="button" data-action="win-min" aria-label="${c.winMin}"></button><button type="button" data-action="win-max" aria-label="${c.winMax}"></button></div><span class="window-title" translate="no">niansia@home <span class="muted">: ~</span></span><span class="window-note"><span class="window-clock" translate="no"></span>${icon('terminal')} portfolio / v.03</span></div>
        <div class="window-body">
        <div class="workspace">
          <div class="explorer"><div class="explorer-heading">${c.files}<span>~/</span></div><nav aria-label="${c.files}"><span class="nav-indicator" aria-hidden="true"></span>${paths.map((path,i)=>`<button class="file-item" data-view="${path}" data-nav-index="${i}" aria-label="${navLabel(path,c)} (${files[i]})"><span class="file-symbol">${icon(NAV_ICONS[path])}</span><span><b translate="no">${files[i]}</b><small>${navLabel(path,c)}</small></span>${path==='projects'?`<em>${String(projects().length).padStart(2,'0')}</em>`:path==='cv'&&cvState()==='locked'?`<em class="nav-lock" title="${esc(cvCopy().lockedTag)}">${icon('lock')}</em>`:''}</button>`).join('')}</nav><div class="explorer-bottom"><span class="branch-mark" aria-hidden="true">⑂</span><span translate="no">main</span><a href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">GitHub ${icon('link')}</a></div></div>
          <div class="terminal-main"><div class="fest-watermark" aria-hidden="true"></div><div class="pane-bar"><span class="pane-path" translate="no"></span></div><div class="terminal-output" id="terminal-content" tabindex="-1"></div></div>
        </div>
        <div class="command-area"><div class="command-message" role="status" aria-live="polite">${c.ready}</div><form class="command-form"><label for="terminal-command" class="prompt" translate="no"><span class="session-user">${esc(username)}</span><span>@home</span><b>:~$</b><span class="sr-only">${c.command}</span></label><input id="terminal-command" data-command-input maxlength="500" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="${c.placeholder}" aria-label="${c.command}"><button type="submit" aria-label="${c.run}">${icon('arrow')}<span>${c.run}</span></button></form></div>
        <footer class="terminal-status"><span class="status-keys"><kbd>↑</kbd><kbd>↓</kbd> ${c.selected} <kbd>Enter</kbd> ${c.open} <kbd>Esc</kbd> ${c.back}</span><button class="status-yuki" data-action="chat" data-yuki-status>${icon('paw')}<span>yuki</span></button><button data-view="help" aria-label="${c.nav[paths.indexOf('help')]}">${icon('help')}<span>${c.nav[paths.indexOf('help')]}</span></button><span class="status-stats" data-stats hidden><i class="live-dot" aria-hidden="true"></i><b data-stat="online">–</b> ${esc(statCopy().online)} · <b data-stat="total">–</b> ${esc(statCopy().visits)}</span><span class="status-signature" translate="no">made with curiosity <span>✦</span></span></footer>
        </div>
      </section><div class="desktop-footer"><span>© ${new Date().getFullYear()} Niansia</span><span>Quarto + a little cat magic</span></div>
    </div>
    <div class="toast" role="status" hidden></div>`;
    paintThemeControls(); applyMotion(); screen(false); tickClock();
    if (document.querySelector('.fest-sky')) applyFestival();
    emit('shell', {locale});
  }
  function tickClock() {
    const el = $('.window-clock');
    if (el) el.textContent = new Intl.DateTimeFormat(locale, {hour:'2-digit', minute:'2-digit'}).format(new Date());
  }
  /* Only the home screen keeps a second, inline prompt (the tour points at it); every other screen shows the command as a
     read-only line, so the command bar at the bottom is the one place to type. Command output still lands in .command-results. */
  function commandTitle(command) {
    if (view !== 'home') return `<p class="output-command is-static" translate="no"><span class="output-prompt" aria-hidden="true">❯</span><span>${esc(command)}</span><i class="output-caret" aria-hidden="true"></i></p><section class="command-results" aria-label="${t().output}" hidden></section>`;
    return `<form class="output-command inline-command-form"><label for="screen-command" aria-hidden="true">❯</label><input id="screen-command" data-command-input maxlength="500" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="${t().inlineCommand}" aria-describedby="screen-command-hint" placeholder="${esc(command)} · ${t().typeHere}"><button type="submit" aria-label="${t().run}"><kbd>Enter</kbd><span>↵</span></button></form><div id="screen-command-hint" class="command-hint">${t().historyHint}</div><section class="command-results" aria-label="${t().output}" hidden></section>`;
  }
  function commandCatalogue() {
    return `<p class="comment-line">${n(t().commandHelp)}</p><div class="command-catalogue">${catalogue.map(c=>`<button data-command-fill="${esc(c.example)}"><code>${esc(c.usage)}</code><span>${esc(c.description[locale])}</span></button>`).join('')}</div>`;
  }
  function button(path,label,primary=false) { return `<button class="action-button ${primary?'primary':''}" data-view="${path}"><span>${label}</span>${icon('arrow')}</button>`; }
  /* Where to find me, right under the intro: GitHub first and largest, then e-mail, then the off-the-clock accounts
     (their links come from hobbies-data.js, so they are kept in one place). Each chip names the account on hover or focus. */
  const socialCopy=()=>({en:{label:'Find me',gh:'Open-source projects and research code',mail:'Email',hobby:'Off the clock'},
    'zh-TW':{label:'在這裡找到我',gh:'開源作品與研究程式碼',mail:'Email',hobby:'下班後的我'},
    'zh-CN':{label:'在这里找到我',gh:'开源作品与研究代码',mail:'Email',hobby:'下班后的我'}}[locale]);
  function socialDock() {
    const S=socialCopy(), mail='niansia930202@gmail.com';
    const hobby=(window.NIANSIA_HOBBIES?.links||[]).filter(l=>icons[l.id]);
    const chip=(href,ico,label,tip,ext=true)=>`<a class="sd-chip" href="${esc(href)}"${ext?' target="_blank" rel="noopener noreferrer"':''} data-tip="${esc(tip)}" aria-label="${esc(label)} · ${esc(tip)}">${icon(ico)}<span>${esc(label)}</span></a>`;
    return `<nav class="social-dock" aria-label="${esc(S.label)}"><a class="sd-github" href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">${ghMark}<span class="sd-gh-text"><b translate="no">github.com/<em>niansia</em></b><small>${esc(S.gh)}</small></span><span class="sd-gh-arrow" aria-hidden="true">↗</span></a>
      <div class="sd-chips">${chip('mailto:'+mail,'mail',S.mail,mail,false)}${hobby.length?`<span class="sd-sep" title="${esc(S.hobby)}" aria-hidden="true"></span>${hobby.map(l=>chip(l.url,l.id,l.label,l.handle||l.label)).join('')}`:''}</div></nav>`;
  }
  /* LINE communities Niansia runs (community-data.js): a chip on the home profile line and a section on about.md. */
  const community=()=>window.NIANSIA_COMMUNITY;
  const communityCopy=()=>({en:{title:'Community',intro:'I run these two LINE communities ({total}+ members in all) for students taking Taiwan\u2019s 2027 college entrance exams (GSAT and AST). If you are preparing for them, you are welcome to join and talk about exam news and mock exam questions.',chip:'LINE exam community admin · {total}+ members',join:'Join'},
    'zh-TW':{title:'社群經營',intro:'我是這兩個 LINE 社群的管理員，合計 {total}+ 位成員。準備 116 學測、分科的同學歡迎加入，一起討論考試資訊和模擬考題目。',chip:'116 學測 LINE 社群管理員 · {total}+ 人',join:'加入社群'},
    'zh-CN':{title:'社群经营',intro:'我是这两个 LINE 社群的管理员，合计 {total}+ 位成员。准备 116 学测、分科的同学欢迎加入，一起讨论考试资讯和模拟考题目。',chip:'116 学测 LINE 社群管理员 · {total}+ 人',join:'加入社群'}}[locale]);
  const LINE_BADGE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#06c755"/><path fill="#fff" d="M12 5.6c-4 0-7.2 2.5-7.2 5.6 0 2.8 2.6 5.1 6 5.5l-.4 2.1 3-2.1c3.3-.5 5.8-2.8 5.8-5.5 0-3.1-3.2-5.6-7.2-5.6z"/></svg>';
  const cmIcon=g=>`/assets/icons/cm-${['gsat','mock'].includes(g.icon)?g.icon:'gsat'}.svg`;
  const cmCount=g=>Number.isInteger(g.members)&&g.members>0&&g.members<1e6?g.members:0;
  /* the total, rounded down to hundreds so the text does not go stale with every new member */
  const cmTotal=()=>{const s=(community()?.groups||[]).filter(g=>lineOk(g.url)).reduce((a,g)=>a+cmCount(g),0);return s>=100?(Math.floor(s/100)*100).toLocaleString('en-US'):'';};
  const cmFill=s=>{const t=cmTotal();return t?s.replace('{total}',t):s.replace(/ \(\{total\}\+ members in all\)|，合[計计] \{total\}\+ 位成[員员]| · \{total\}\+ (members|人)/,'');};
  const lineOk=u=>/^https:\/\/line\.me\/ti\/g2\/[A-Za-z0-9_-]{10,80}$/.test(u||'');
  function communityCards() {
    const C=community(), role=C?.role?.[locale]||C?.role?.en||'';
    return (C?.groups||[]).filter(g=>lineOk(g.url)).map((g,i)=>`<a class="cm" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" style="--i:${i}"><span class="cm-ico"><img src="${cmIcon(g)}" alt="" width="56" height="56" loading="lazy">${LINE_BADGE}</span><span class="cm-text"><b>${esc(g.name)}</b>${cmCount(g)?`<span class="cm-n">${esc((C.members?.[locale]||C.members?.en||'{n}').replace('{n}',cmCount(g).toLocaleString('en-US')))}</span>`:''}<small>${esc(g.desc[locale]||g.desc.en)}</small></span><span class="cm-side"><em class="cm-role">${esc(role)}</em><span class="cm-go">${esc(communityCopy().join)} \u2197</span></span></a>`).join('');
  }
  function communityBlock() {
    const cards=communityCards(); if(!cards) return '';
    const T=communityCopy();
    return `<section class="community" id="community" aria-labelledby="community-title"><h2 id="community-title">${esc(T.title)}</h2><p class="screen-intro">${esc(cmFill(T.intro))}</p><div class="cm-list">${cards}</div></section>`;
  }
  function communityChip() {
    return communityCards()?`<button type="button" class="sub-chip cm-chip" data-view="about" data-anchor="community"><img src="/assets/icons/cm-gsat.svg" alt="" width="18" height="18">${esc(cmFill(communityCopy().chip))}</button>`:'';
  }
  function homeScreen(c) {
    const featured = [
      {id:'adversarial-lab',ext:'.lab',copy:c.newestAdv,media:'<img src="/assets/og/adversarial-demo.jpg" alt="" loading="lazy" width="1200" height="630">'},
      {id:'lumigrid',ext:'.pth',copy:c.newestLumi,media:'<span class="lg-thumb"><img src="/assets/lumigrid/0_out.jpg" alt="" loading="lazy" width="1280" height="856"><img class="lg-thumb-in" src="/assets/lumigrid/0_in.jpg" alt="" loading="lazy" width="1280" height="856"><i aria-hidden="true"></i></span>'},
      {id:'taiwan-exam',ext:'.skill',copy:c.newest,media:'<img src="/assets/work/taiwan-exam-social-preview.png" alt="" loading="lazy" width="1280" height="640">'}
    ].map(f=>({...f,p:projects().find(p=>p.id===f.id)})).filter(f=>f.p);
    const boot = booted || !motion() ? 'boot-lines' : 'boot-lines is-booting';
    booted = true;
    const name = c.name.replace('Niansia', '<span class="name-glow" translate="no">Niansia</span>');
    const quick = ['projects','theme sakura','neofetch','trick','trail paws','help'];
    return `${commandTitle('./start.sh')}${festivalBanner(c)}<div class="${boot}"><span><b>✓</b> profile loaded</span><span><b>✓</b> ${projects().length} projects mounted</span><span><b>✓</b> yuki.exe is awake</span><span><b>✓</b> brain.nn ready</span></div>
      <div class="welcome-copy"><p class="hello-world" translate="no">${c.welcome}<i class="text-cursor" aria-hidden="true"></i></p><h1>${name}</h1><p class="welcome-tagline">${c.tagline}</p><p>${c.intro}</p></div>${socialDock()}
      <a class="brief-chip" href="/brief/${pubSeg()}">${icon('bolt')}<span>${esc(briefCopy().chip)}</span><em aria-hidden="true">→</em></a><div class="profile-facts"><span>${c.role}</span><span>${c.leave}</span>${subCopy()?`<button type="button" class="sub-chip" data-view="research">✍ ${subCopy().chip}${nextDeadline()?` · <b data-deadline="${nextDeadline().deadline}">${countdown(nextDeadline().deadline)}</b>`:''}</button>`:''}${communityChip()}</div>
      <div class="output-actions">${button('projects',c.start,true)}${button('about',c.more)}</div>
      <div class="home-cards">
        <div class="home-card latest-card"><span class="card-label">${c.latestCard}${featured.length>1?`<span class="latest-dots">${featured.map((f,i)=>`<button type="button" class="latest-dot" data-latest-dot="${i}" aria-label="${esc(f.p.name)}" aria-pressed="${i===0}"></button>`).join('')}</span>`:''}</span><div class="latest-slides">${featured.map((f,i)=>`<button class="latest-slide${i?'':' is-on'}" data-project="${f.p.id}"${i?' tabindex="-1" aria-hidden="true"':''}>${f.media}<strong translate="no">${esc(f.p.name)} <span class="file-extension">${f.ext}</span></strong><span class="card-copy">${f.copy}</span></button>`).join('')}</div></div>
        <div class="home-card ask-card"><span class="card-label">${icon('chat')} ${c.askTitle}</span><p>${c.askIntro}</p><div class="ask-chips">${c.askChips.map(q=>`<button data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>${window.YUKI_TOUR||document.querySelector('script[src*="yuki-tour"]')?`<button type="button" class="tour-cta" data-tour="">${icon('compass')}<span>${esc(tourCta())}</span><em aria-hidden="true">→</em></button>`:''}</div>
      </div>
      <div class="site-pulse" data-stats hidden><div><span>${esc(statCopy().totalL)}</span><b data-stat="total" data-count>–</b></div><div><span>${esc(statCopy().todayL)}</span><b data-stat="today" data-count>–</b></div><div class="is-live"><span><i class="live-dot" aria-hidden="true"></i>${esc(statCopy().onlineL)}</span><b data-stat="online">–</b></div><small>${esc(statCopy().note)}</small></div>
      <div class="quick-commands"><span class="card-label">${c.quickTitle}</span><div>${quick.map(cmd=>`<button data-command="${cmd}" translate="no"><span>$</span> ${cmd}</button>`).join('')}</div></div>`;
  }
  function festivalBanner(c) {
    const F = window.NIANSIA_FESTIVAL, fest = F?.active();
    if (!fest) return '';
    const names = fest.festivals.map(f => f.name[locale]).join(locale === 'en' ? ' & ' : '・');
    const motifs = [...fest.primary.motifs, ...fest.festivals.slice(1).flatMap(f => f.motifs.slice(0, 2))].slice(0, 5);
    const days = Math.round((new Date(fest.end) - new Date(fest.start)) / 864e5) + 1;
    const range = `${fest.start.slice(5).replace('-', '/')} – ${fest.end.slice(5).replace('-', '/')}`;
    return `<section class="fest-banner" data-fest="${fest.primary.id}" aria-label="${esc(names)}">
      <div class="fest-scene" aria-hidden="true">${motifs.map((m, i) => F.motif(m, `m${i}`)).join('')}</div>
      <div class="fest-copy"><span class="fest-kicker">${days > 1 ? `${c.festLongWeekend} · ` : ''}${days > 1 ? range : fest.start.slice(5).replace('-', '/')}</span><strong>${esc(names)}</strong><span>${esc(fest.festivals.map(f => f.line[locale]).join(' '))}</span></div>
      <button type="button" class="fest-cta" data-fest-celebrate>${c.festCelebrate} ✨</button></section>`;
  }
  const GARLAND = {midautumn: ['lantern', 'lantern'], teachers: ['star', 'pencil'], lunarnewyear: ['lantern', 'fu'], lantern: ['lantern', 'lantern'],
    valentine: ['heart', 'heart'], peace: ['dove', 'lily'], children: ['kite', 'balloon'], labor: ['star', 'coffee'], dragonboat: ['zongzi', 'star'],
    qixi: ['star', 'magpie'], national: ['balloon', 'star'], retrocession: ['leaf', 'leaf'], halloween: ['bat', 'pumpkin'], christmas: ['snowflake', 'gift'], newyear: ['star', 'balloon']};
  const WATERMARK = {midautumn: 'moon', teachers: 'book', lunarnewyear: 'fu', lantern: 'lantern', valentine: 'heart', peace: 'dove', children: 'kite', labor: 'coffee',
    dragonboat: 'boat', qixi: 'magpie', national: 'fireworks', retrocession: 'leaf', halloween: 'pumpkin', christmas: 'tree', newyear: 'fireworks'};
  const festSkinOn = fest => !['off', `off:${fest.primary.id}`].includes(store.get('fest-skin', 'on'));
  function paintFestivalChrome(fest) {
    const F = window.NIANSIA_FESTIVAL, garland = $('.fest-garland'), mark = $('.fest-watermark'), toggle = $('[data-fest-skin]');
    const skin = fest && festSkinOn(fest);
    if (toggle) {
      toggle.hidden = !fest;
      toggle.setAttribute('aria-pressed', String(!!skin));
      toggle.innerHTML = fest ? `${F.motif(fest.primary.motifs[0], 'fest-toggle-icon')}${fest.primary.name[locale]}` : '';
    }
    if (garland) garland.innerHTML = skin ? (GARLAND[fest.primary.id] || ['star', 'star']).concat(GARLAND[fest.primary.id] || ['star'], GARLAND[fest.primary.id] || ['star']).slice(0, 6)
      .map((m, i) => `<span style="--i:${i}">${F.motif(m)}</span>`).join('') : '';
    if (mark) mark.innerHTML = skin ? F.motif(WATERMARK[fest.primary.id] || fest.primary.motifs[0]) : '';
  }
  function applyFestival() {
    const fest = window.NIANSIA_FESTIVAL?.active();
    const skin = fest && festSkinOn(fest);
    document.documentElement.dataset.festival = fest ? fest.primary.id : '';
    setSkinAttr(skin ? fest.primary.id : '');
    const tone = skin && getComputedStyle(document.documentElement).getPropertyValue('--desk').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tone || themeColors[theme]);
    paintFestivalChrome(fest);
    let sky = document.querySelector('.fest-sky');
    if (fest && !sky) { sky = document.createElement('div'); sky.className = 'fest-sky'; sky.setAttribute('aria-hidden', 'true'); document.body.prepend(sky); }
    if (sky) sky.dataset.fest = fest ? fest.primary.id : '';
    fx()?.ambient(fest ? fest.festivals.map(f => f.particle) : []);
  }
  /* Undergraduate capstone (propaganda detection): pipeline, live detection demo and charts, animated on reveal. */
  const cap=()=>window.NIANSIA_CAPSTONE;
  const capCopy=()=>cap()?.copy[locale]||cap()?.copy.en;
  const capName=o=>locale==='en'?o.en:locale==='zh-CN'?(o.zhcn||o.zh):o.zh;
  const CAP_LANGS=[['en','EN'],['zh','中文'],['ar','العربية'],['ur','اردو'],['ps','پښتو']];
  let capState={i:0,lang:'en',timer:0,observer:null};
  function capstoneBlock() {
    const C=capCopy(), D=cap(); if (!C) return '';
    const n=v=>v.toLocaleString(locale);
    const stats=C.stats.map(([k,label])=>`<div><b data-count="${D.stats[k]}">${motion()?0:n(D.stats[k])}</b><span>${esc(label)}</span></div>`).join('');
    const pipe=C.pipe.map(([title,body],i)=>`<li style="--i:${i}"><span class="cap-step">${String(i+1).padStart(2,'0')}</span><div><b>${esc(title)}</b><p>${esc(body)}</p></div></li>`).join('');
    const maxT=Math.max(...D.techniques.map(t=>t.n));
    const dist=D.techniques.map((t,i)=>`<div class="cap-bar" style="--v:${(t.n/maxT).toFixed(3)};--i:${i}"><span>${esc(capName(t))}</span><i></i><em>${n(t.n)}</em></div>`).join('');
    const media=D.outlets.map((o,i)=>{const top=Math.max(...o.mix);return `<div class="cap-outlet" style="--i:${i}"><span translate="no">${esc(o.name)}</span><i class="cap-strip">${o.mix.map((m,k)=>`<s style="--a:${(m/top).toFixed(2)};--k:${k}" title="${esc(capName(D.mix[k]))} · ${n(m)}"></s>`).join('')}</i><em>${n(o.total)}</em></div>`;}).join('');
    const legend=`<span>${locale==='en'?'lower share':locale==='zh-CN'?'占比低':'佔比低'}</span><s class="cap-scale"></s><span>${locale==='en'?'higher share':locale==='zh-CN'?'占比高':'佔比高'}</span>`;
    const langs=CAP_LANGS.map(([k,label])=>`<button type="button" data-cap-lang="${k}" aria-pressed="${k===capState.lang}">${label}</button>`).join('');
    const dots=D.examples.map((_,i)=>`<button type="button" data-cap-ex="${i}" aria-label="${i+1}"></button>`).join('');
    return `<section class="capstone" id="capstone" aria-labelledby="cap-title">
      <p class="cap-kicker">${esc(C.kicker)}</p><h2 id="cap-title" class="cap-title">${esc(C.title)}</h2><p class="cap-lede">${esc(C.lede)}</p>
      <div class="cap-meta">${C.tags.map(t=>`<em>${esc(t)}</em>`).join('')}</div>
      ${C.filmTitle?`<a class="cap-film" href="/assets/film/propaganda.html?lang=${locale}" aria-haspopup="dialog"><video src="/assets/film/teaser.mp4" poster="/assets/film/teaser-poster.jpg" muted loop playsinline preload="metadata" ${motion()?'autoplay':''} aria-hidden="true"></video><span class="cap-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span><span class="cap-film-text"><b>${esc(C.filmTitle)}</b><small>${esc(C.filmSub)}</small></span></a>`:''}
      <div class="cap-stats">${stats}</div>
      <h3>${esc(C.pipeTitle)}</h3><ol class="cap-pipe">${pipe}</ol>
      <h3>${esc(C.demoTitle)}</h3><div class="cap-demo"><div class="cap-demo-bar"><span class="cap-led" aria-hidden="true"></span><span class="cap-demo-langs" role="group">${langs}</span></div><p class="cap-sentence" aria-live="polite"></p><div class="cap-verdict"><span class="cap-chip"></span><span class="cap-dots">${dots}</span></div><small>${esc(C.demoNote)}</small></div>
      <div class="cap-charts"><div><h3>${esc(C.distTitle)}</h3><div class="cap-dist">${dist}</div></div><div><h3>${esc(C.mediaTitle)}</h3><div class="cap-media">${media}</div><p class="cap-legend">${legend}</p><small class="cap-note">${esc(C.mediaNote)}</small></div></div>
      <p class="comment-line">${esc(C.footnote)}</p></section>`;
  }
  const teLive=()=>Date.now()>=Date.parse('2026-09-28T21:28:00+08:00'); // public release: trailer → official film
  const teCopy=()=>({
    en:{kicker:`Agent Skill · ${teLive()?'official film':'trailer'}`,title:'Taiwan Exam: one paragraph in, a GSAT practice exam out',lede:'An Agent Skill that has the AI write original GSAT items to the current curriculum, calibrated to five years of official answer rates, re-solve every item without the answer, and stamp the result onto the original CEEC templates as a question PDF and a worked-solution PDF. The model writes the questions; the scripts only lay out, check and stamp pages, and never sign off on quality.',film:teLive()?'Watch the Taiwan Exam film':'Watch the Taiwan Exam trailer',filmSub:'About 80 s: knowledge loading, the paper plan, blind re-solving, template stamping and page-by-page checks.',flowTitle:'Architecture',tags:['7 GSAT subjects','Claude · ChatGPT · Gemini','112 scripts · 1,089 tests'],repo:'Open the repository',
      flow:[['Load knowledge','read_web_knowledge.py'],['Preflight','prepare_hosted_run.py'],['Paper plan','check_paper_plan.py'],['Write in batches · checkpoint','append_items.py'],['Blind re-solve · difficulty','hosted_blind_review.py'],['Content lock','lock-content'],['Stamp onto templates','compose_hosted_pdf.py'],['Page checks','inspect_hosted_pdf.py'],['Deliver two PDFs','finalize']]},
    'zh-TW':{kicker:`Agent Skill · ${teLive()?'正式影片':'前導片'}`,title:'Taiwan Exam：一段話，出一份學測模擬考',lede:'讓 AI 依 108 課綱與近五年官方答對率原創命題，不看答案重新解題驗算，再疊印到大考中心原始模板上，交付題本與詳解兩份 PDF。模型負責出題；程式只負責排版、檢查與套版，不替題目品質背書。',film:teLive()?'觀看 Taiwan Exam 正式影片':'觀看 Taiwan Exam 前導片',filmSub:'約 80 秒：知識載入、命題藍圖、盲審解題、原始模板套版與逐頁檢查。',flowTitle:'架構',tags:['學測七科','Claude · ChatGPT · Gemini','112 支腳本 · 1,089 項測試'],repo:'打開 GitHub',
      flow:[['讀取知識','read_web_knowledge.py'],['預檢','prepare_hosted_run.py'],['命題藍圖','check_paper_plan.py'],['分批命題 · 存檔','append_items.py'],['盲審解題 · 難度','hosted_blind_review.py'],['內容鎖定','lock-content'],['套用原始模板','compose_hosted_pdf.py'],['逐頁檢查','inspect_hosted_pdf.py'],['交付兩份 PDF','finalize']]},
    'zh-CN':{kicker:`Agent Skill · ${teLive()?'正式影片':'先导片'}`,title:'Taiwan Exam：一段话，出一份学测模拟考',lede:'让 AI 依 108 课纲与近五年官方答对率原创命题，不看答案重新解题验算，再叠印到大考中心原始模板上，交付题本与详解两份 PDF。模型负责出题；程序只负责排版、检查与套版，不替题目质量背书。',film:teLive()?'观看 Taiwan Exam 正式影片':'观看 Taiwan Exam 先导片',filmSub:'约 80 秒：知识载入、命题蓝图、盲审解题、原始模板套版与逐页检查。',flowTitle:'架构',tags:['学测七科','Claude · ChatGPT · Gemini','112 个脚本 · 1,089 项测试'],repo:'打开 GitHub',
      flow:[['读取知识','read_web_knowledge.py'],['预检','prepare_hosted_run.py'],['命题蓝图','check_paper_plan.py'],['分批命题 · 存档','append_items.py'],['盲审解题 · 难度','hosted_blind_review.py'],['内容锁定','lock-content'],['套用原始模板','compose_hosted_pdf.py'],['逐页检查','inspect_hosted_pdf.py'],['交付两份 PDF','finalize']]}}[locale]);
  const cvCopy=()=>({
    en:{lockedTag:'not public yet',denied:'Permission denied',title:'CV and LinkedIn are on the way',body:'I am still putting these together. When they are ready, this is where they will live:',soon:['A downloadable PDF CV','My LinkedIn profile','A one-page timeline of education, research and projects'],mail:'Email me in the meantime',notes:'Read my research notes',
      download:'Download CV (PDF)',linkedin:'LinkedIn',updated:'Updated',education:'Education',experience:'Experience',projects:'Research & projects',awards:'Awards',skills:'Skills',preview:'Preview: this page is not public yet.',pdfTitle:'CV preview'},
    'zh-TW':{lockedTag:'尚未公開',denied:'權限不足',title:'履歷與 LinkedIn 整理中',body:'還在整理，準備好之後就會放在這裡：',soon:['可下載的 PDF 履歷','LinkedIn 個人檔案','一頁式的學經歷、研究與作品時間軸'],mail:'想先聯絡，歡迎寫信',notes:'先看看研究筆記',
      download:'下載履歷（PDF）',linkedin:'LinkedIn',updated:'更新於',education:'學歷',experience:'經歷',projects:'研究與作品',awards:'獲獎',skills:'技能',preview:'預覽模式：這一頁還沒有公開。',pdfTitle:'履歷預覽'},
    'zh-CN':{lockedTag:'尚未公开',denied:'权限不足',title:'简历与 LinkedIn 整理中',body:'还在整理，准备好之后就会放在这里：',soon:['可下载的 PDF 简历','LinkedIn 个人档案','一页式的学经历、研究与作品时间轴'],mail:'想先联系，欢迎写信',notes:'先看看研究笔记',
      download:'下载简历（PDF）',linkedin:'LinkedIn',updated:'更新于',education:'学历',experience:'经历',projects:'研究与作品',awards:'获奖',skills:'技能',preview:'预览模式：这一页还没有公开。',pdfTitle:'简历预览'}}[locale]);
  const cvText=v=>v&&typeof v==='object'?(v[locale]??v.en??''):(v||'');
  function cvScreen() {
    const c=cvCopy(), D=window.NIANSIA_CV||{}, state=cvState(), seg=locale==='en'?'en':locale.toLowerCase();
    if (state==='locked') {
      return `${commandTitle('cat cv.pdf')}<div class="cv-locked"><pre class="cv-denied" translate="no"><span class="cv-err">cat: cv.pdf: ${esc(c.denied)}</span>
<span class="cv-prompt">$</span> ls -l ~/cv
-rw-------  niansia  cv.pdf         <b>${esc(c.lockedTag)}</b>
-rw-------  niansia  linkedin.url   <b>${esc(c.lockedTag)}</b></pre>
        <div class="cv-lockcard"><div class="cv-paper" aria-hidden="true"><i class="w60"></i><i class="w35"></i><span></span><i></i><i class="w80"></i><i class="w70"></i><span></span><i class="w45"></i><i></i><i class="w85"></i><i class="w55"></i><span></span><i class="w65"></i><i class="w75"></i></div>
          <div class="cv-lockbody"><span class="cv-lockicon" aria-hidden="true">${icon('lock')}</span><h1>${esc(c.title)}</h1><p>${esc(c.body)}</p><ul>${c.soon.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
          <div class="output-actions"><a class="action-button primary" href="mailto:niansia930202@gmail.com">${icon('mail')}<span>${esc(c.mail)}</span></a><a class="action-button" href="/notes/${seg}/">${icon('file')}<span>${esc(c.notes)}</span></a></div></div></div></div>`;
    }
    const line=x=>`<li class="cv-item${cvText(x.period)?'':' no-period'}">${cvText(x.period)?`<span class="cv-period">${esc(cvText(x.period))}</span>`:''}<div><b>${esc(cvText(x.title))}</b>${cvText(x.org)?`<span class="cv-org">${esc(cvText(x.org))}</span>`:''}${cvText(x.detail)?`<p>${esc(cvText(x.detail))}</p>`:''}</div></li>`;
    const section=(key,list)=>list?.length?`<section class="cv-section"><h2>${esc(c[key])}</h2><ul class="cv-timeline">${list.map(line).join('')}</ul></section>`:'';
    const projs=(D.projects||[]).map(id=>projects().find(p=>p.id===id)).filter(Boolean)
      .map(p=>({title:p.name,org:`${p.category} · ${p.status}`,detail:p.description.split(/(?<=[.。])\s*/)[0]}));
    const skills=(D.skills?.[locale]||D.skills?.en||[]);
    const links=`<div class="cv-links">${D.pdf?`<a class="action-button primary" href="${esc(D.pdf)}" download>${icon('download')}<span>${esc(c.download)}</span></a>`:''}${D.linkedin?`<a class="action-button" href="${esc(D.linkedin)}" target="_blank" rel="noopener noreferrer">${icon('link')}<span>${esc(c.linkedin)}</span></a>`:''}<a class="action-button" href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">${icon('link')}<span>GitHub</span></a><a class="action-button" href="mailto:niansia930202@gmail.com">${icon('mail')}<span>niansia930202@gmail.com</span></a></div>`;
    return `${commandTitle('open cv.pdf')}${state==='preview'?`<p class="cv-preview-note">${icon('lock')} ${esc(c.preview)}</p>`:''}<article class="cv-page">
      <header class="cv-head"><h1 translate="no">Niansia</h1><p>${esc(t().role)}</p>${links}${D.updated?`<small>${esc(c.updated)} ${esc(D.updated)}</small>`:''}</header>
      ${section('education',D.education)}${section('experience',D.experience)}${section('projects',projs)}${section('awards',D.awards)}
      ${skills.length?`<section class="cv-section"><h2>${esc(c.skills)}</h2><dl class="cv-skills">${skills.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`:''}
      ${D.pdf?`<details class="cv-pdf"><summary>${esc(c.pdfTitle)}</summary><object data="${esc(D.pdf)}#view=FitH" type="application/pdf" aria-label="${esc(c.pdfTitle)}"></object></details>`:''}</article>`;
  }
  const statCopy=()=>({en:{online:'online',visits:'visits',totalL:'Total visits',todayL:'Today',onlineL:'Reading now',note:'Live counter · counts only, no personal data'},
    'zh-TW':{online:'人在線',visits:'次造訪',totalL:'累計造訪',todayL:'今日造訪',onlineL:'正在看',note:'即時統計 · 只記次數，不記個人資料'},
    'zh-CN':{online:'人在线',visits:'次访问',totalL:'累计访问',todayL:'今日访问',onlineL:'正在看',note:'实时统计 · 只记次数，不记个人资料'}}[locale]);
  const noteCopy=()=>({en:{title:'Research notes',lede:'Short, honest write-ups: what worked, what did not, and how I checked.',all:'All notes',min:'min read',share:'Copy share link',shared:'Share link copied.'},
    'zh-TW':{title:'研究筆記',lede:'把做法、有效的地方、沒成功的地方，以及怎麼驗證的，誠實寫下來。',all:'全部筆記',min:'分鐘閱讀',share:'複製分享連結',shared:'已複製分享連結。'},
    'zh-CN':{title:'研究笔记',lede:'把做法、有效的地方、没成功的地方，以及怎么验证的，诚实写下来。',all:'全部笔记',min:'分钟阅读',share:'复制分享链接',shared:'已复制分享链接。'}}[locale]);
  const logCopy=()=>({en:{title:'Research log',all:'Full log',lede:'Dated snapshots of work in progress.',read:'Read the research statement',st:'What I study and why'},
    'zh-TW':{title:'研究日誌',all:'完整日誌',lede:'有日期的工作紀錄：截圖、圖表和小里程碑。',read:'閱讀研究方向說明',st:'我研究什麼、為什麼'},
    'zh-CN':{title:'研究日志',all:'完整日志',lede:'有日期的工作记录：截图、图表和小里程碑。',read:'阅读研究方向说明',st:'我研究什么、为什么'}}[locale]);
  function statementLink() {
    const st=window.NIANSIA_STATEMENT?.[locale]; if (!st) return '';
    return `<a class="statement-card" href="${esc(st.url)}"><span class="statement-icon" aria-hidden="true">${icon('research')}</span><span><b>${esc(logCopy().read)}</b><small>${esc(st.description)}</small></span><em aria-hidden="true">↗</em></a>`;
  }
  function logBlock() {
    const list=window.NIANSIA_LOG?.[locale]; if (!list?.length) return '';
    const c=logCopy(), seg=locale==='en'?'en':locale.toLowerCase();
    return `<section class="notes-block log-block" aria-labelledby="log-title"><div class="notes-head"><h2 id="log-title">${esc(c.title)}</h2><a href="/log/${seg}/">${esc(c.all)} →</a></div><p class="notes-lede">${esc(c.lede)}</p>
      <div class="log-list">${list.slice(0,4).map(n=>`<a class="log-card" href="${esc(n.url)}">${n.thumb?`<img src="${esc(n.thumb)}" alt="${esc(n.alt)}" loading="lazy">`:''}<span class="note-date">${esc(n.date)}</span><b>${esc(n.title)}</b></a>`).join('')}</div></section>`;
  }
  function notesBlock() {
    const list=window.NIANSIA_NOTES?.[locale]; if (!list?.length) return '';
    const c=noteCopy(), seg=locale==='en'?'en':locale.toLowerCase();
    return `<section class="notes-block" aria-labelledby="notes-title"><div class="notes-head"><h2 id="notes-title">${esc(c.title)}</h2><a href="/notes/${seg}/">${esc(c.all)} →</a></div><p class="notes-lede">${esc(c.lede)}</p>
      <div class="notes-list">${list.map((n,i)=>`<a class="note-card" href="${esc(n.url)}" style="--i:${i}"><span class="note-date">${esc(n.date)} · ${n.minutes} ${esc(c.min)}</span><b>${esc(n.title)}</b><small>${esc(n.description)}</small></a>`).join('')}</div></section>`;
  }
  /* The shared mock exams (/exams/), a static page built from exam_src/gallery.json; the page itself is Chinese only. */
  const examsSeg=()=>locale==='zh-CN'?'zh-cn':'zh-tw';
  const examsCopy=()=>({en:{t:'Shared mock exams',s:'Download Taiwan Exam mock exams other people generated, or share yours (in Chinese).'},
    'zh-TW':{t:'考卷分享區',s:'下載大家用 Taiwan Exam 生成的模擬考，也可以分享你的。'},'zh-CN':{t:'考卷分享区',s:'下载大家用 Taiwan Exam 生成的模拟考，也可以分享你的。'}}[locale]);
  function examsCard() { const c=examsCopy(); return `<a class="statement-card" href="/exams/${examsSeg()}/"><span class="statement-icon" aria-hidden="true">${icon('paper')}</span><span><b>${esc(c.t)}</b><small>${esc(c.s)}</small></span><em aria-hidden="true">↗</em></a>`; }
  function teFilmCard() {
    const c=teCopy();
    return `<a class="cap-film te-film" href="/assets/film/taiwan-exam.html?lang=${locale}" data-src="/assets/film/taiwan-exam.html" data-title="Taiwan Exam" aria-haspopup="dialog"><video src="/assets/taiwan-exam/teaser.mp4?v=1" poster="/assets/taiwan-exam/teaser-poster.jpg?v=1" muted loop playsinline preload="metadata" ${motion()?'autoplay':''} aria-hidden="true"></video><span class="cap-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span><span class="cap-film-text"><b>${esc(c.film)}</b><small>${esc(c.filmSub)}</small></span></a>`;
  }
  function teBlock() {
    const c=teCopy();
    return `<section class="te-show" id="taiwan-exam" aria-labelledby="te-title"><p class="cap-kicker">${esc(c.kicker)}</p><h2 id="te-title" class="cap-title" translate="no">${esc(c.title)}</h2><p class="cap-lede">${esc(c.lede)}</p>
      <div class="cap-meta">${c.tags.map(t=>`<em>${esc(t)}</em>`).join('')}</div>${teFilmCard()}
      <h3>${esc(c.flowTitle)}</h3><ol class="te-flow">${c.flow.map(([a,b],i)=>`<li style="--i:${i}"><b>${esc(a)}</b><code translate="no">${esc(b)}</code></li>`).join('')}</ol>
      <div class="output-actions"><a class="action-button" href="https://github.com/niansia/taiwan-exam" target="_blank" rel="noopener noreferrer"><span>${esc(c.repo)}</span>${icon('link')}</a><button class="action-button" data-project="taiwan-exam"><span translate="no">projects/taiwan-exam</span>${icon('arrow')}</button></div></section>`;
  }
  function paintCapExample(scan=true) {
    const D=cap(), el=$('.cap-sentence'); if (!D||!el) return;
    const ex=D.examples[capState.i], tech=D.techniques.find(t=>t.key===ex.tech)||{en:ex.tech,zh:ex.tech};
    const lang=capState.lang, text=lang==='en'?ex.text:ex[lang];
    el.dir=['ar','ur','ps'].includes(lang)?'rtl':'ltr';
    if (lang==='en') { const at=ex.text.indexOf(ex.span); el.innerHTML=`${esc(ex.text.slice(0,at))}<mark>${esc(ex.span)}</mark>${esc(ex.text.slice(at+ex.span.length))}`; }
    else el.textContent=text;
    const chip=$('.cap-chip'); chip.textContent=capName(tech);
    const box=$('.cap-demo'); box.classList.remove('is-scanning','is-hit'); void box.offsetWidth;
    if (scan&&motion()) { box.classList.add('is-scanning'); setTimeout(()=>{ if (box.isConnected) { box.classList.remove('is-scanning'); box.classList.add('is-hit'); } },1300); }
    else box.classList.add('is-hit');
    root.querySelectorAll('[data-cap-ex]').forEach((b,i)=>b.setAttribute('aria-current',String(i===capState.i)));
    root.querySelectorAll('[data-cap-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.capLang===lang)));
  }
  function capCount(section) {
    section.querySelectorAll('[data-count]').forEach(el=>{
      const target=Number(el.dataset.count), start=performance.now(), dur=1400;
      const step=now=>{ const k=Math.min(1,(now-start)/dur), e=1-Math.pow(1-k,3); el.textContent=Math.round(target*e).toLocaleString(locale); if (k<1&&el.isConnected) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  function initCapstone() {
    const section=$('.capstone'); if (!section) return;
    clearInterval(capState.timer); capState.observer?.disconnect();
    paintCapExample(false);
    const reveal=()=>{ section.classList.add('is-in'); if (motion()) capCount(section); };
    if (!motion()||!('IntersectionObserver' in window)) section.classList.add('is-in');
    else { capState.observer=new IntersectionObserver(entries=>{ if (entries.some(e=>e.isIntersecting)) { reveal(); capState.observer.disconnect(); } },{threshold:.12}); capState.observer.observe(section); }
    capState.timer=setInterval(()=>{ if (!$('.capstone')) { clearInterval(capState.timer); return; } if (!motion()||document.hidden) return; capState.i=(capState.i+1)%cap().examples.length; paintCapExample(); },5200);
  }
  root.addEventListener('click',event=>{
    const film=event.target.closest('.cap-film');
    if (film && !event.metaKey && !event.ctrlKey && !event.shiftKey) { event.preventDefault(); openFilm(film.dataset.src, film.dataset.title); return; }
    const lang=event.target.closest('[data-cap-lang]'), ex=event.target.closest('[data-cap-ex]'), jump=event.target.closest('[data-cap-jump]');
    if (lang) { capState.lang=lang.dataset.capLang; paintCapExample(false); }
    if (ex) { capState.i=Number(ex.dataset.capEx); paintCapExample(); }
    if (jump) $('#capstone')?.scrollIntoView({behavior:motion()?'smooth':'auto',block:'start'});
  });
  /* LumiGrid project page: film card, a draggable before/after comparison on real test images, and the test table. */
  let lgData=null;
  const lgCopy=()=>({en:{film:'Watch the LumiGrid film',tryT:'Try LumiGrid in your browser',tryS:'Brighten your own dark photo. Both networks run on your device (WebGPU / WebAssembly); nothing is uploaded.',filmSub:'About 90 s, one continuous take: a real test image travels through the whole model, from pixels and encoder features to the curve grid, slicing and tiled refinement.',before:'input',after:'LumiGrid',orig:'course pipeline',vs:'compare with',table:'Held-out test split (20 pairs, official NTIRE metrics)',method:'Method',note:'Not a leaderboard result: the challenge test ground truth is not public. For orientation, the public validation leaderboard spanned 24.1 dB (median) to 26.5 dB (best) on different images.',drag:'drag to compare'},
    'zh-TW':{film:'觀看 LumiGrid 動畫',tryT:'在你的瀏覽器試試 LumiGrid',tryS:'丟一張自己的暗照片進去：兩個神經網路都在你的裝置上跑（WebGPU / WebAssembly），不會上傳。',filmSub:'約 90 秒一鏡到底：一張真實測試圖從像素、編碼特徵、曲線網格、切片到分塊細修，走完整個模型。',before:'輸入',after:'LumiGrid',orig:'課堂作法',vs:'對照',table:'保留測試集（20 組，NTIRE 官方評分程式）',method:'方法',note:'非排行榜成績：競賽測試集的正解未公開。僅供參考，公開驗證排行榜在另一批影像上介於 24.1 dB（中位數）到 26.5 dB（最佳）。',drag:'拖曳比較'},
    'zh-CN':{film:'观看 LumiGrid 动画',tryT:'在你的浏览器试试 LumiGrid',tryS:'丢一张自己的暗照片进去：两个神经网络都在你的设备上运行（WebGPU / WebAssembly），不会上传。',filmSub:'约 90 秒一镜到底：一张真实测试图从像素、编码特征、曲线网格、切片到分块细修，走完整个模型。',before:'输入',after:'LumiGrid',orig:'课堂做法',vs:'对照',table:'保留测试集（20 组，NTIRE 官方评分程序）',method:'方法',note:'非排行榜成绩：竞赛测试集的正解未公开。仅供参考，公开验证排行榜在另一批影像上介于 24.1 dB（中位数）到 26.5 dB（最佳）。',drag:'拖曳比较'}}[locale]);
  const LG_NAMES={input:'input',zerodce_pretrained:'Zero-DCE (pretrained)',original_pipeline:'Zero-DCE + filters (course)',zerodce_sup:'Zero-DCE, supervised',local_only:'NAFNet only',global_only:'curve grid only',lumigrid:'LumiGrid','lumigrid+tta':'LumiGrid + TTA'};
  function lumigridShowcase() {
    const c=lgCopy();
    return `<section class="lg-show"><a class="cap-film lg-film" href="/assets/film/lumigrid.html?lang=${locale}" data-src="/assets/film/lumigrid.html" data-title="LumiGrid" aria-haspopup="dialog"><video src="/assets/lumigrid/teaser.mp4?v=2" poster="/assets/lumigrid/teaser-poster.jpg?v=2" muted loop playsinline preload="metadata" ${motion()?'autoplay':''} aria-hidden="true"></video><span class="cap-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span><span class="cap-film-text"><b>${esc(c.film)}</b><small>${esc(c.filmSub)}</small></span></a>
      <a class="lg-try" href="/lab/lumigrid/?lang=${locale}"><span class="lg-try-icon" aria-hidden="true">◐</span><span><b>${esc(c.tryT)}</b><small>${esc(c.tryS)}</small></span><em aria-hidden="true">↗</em></a>
      <div class="lg-compare" style="--x:50%"><img class="lg-after" alt="${esc(c.after)}" draggable="false"><img class="lg-before" alt="${esc(c.before)}" draggable="false"><span class="lg-line" aria-hidden="true"><i></i></span><span class="lg-tag lg-l"></span><span class="lg-tag lg-r">${esc(c.after)}</span><input class="lg-range" type="range" min="0" max="100" value="50" aria-label="${esc(c.drag)}"></div>
      <div class="lg-bar"><div class="lg-thumbs" role="group"></div><div class="lg-vs" role="group"><span>${esc(c.vs)}</span><button type="button" data-lg-vs="in" aria-pressed="true">${esc(c.before)}</button><button type="button" data-lg-vs="orig" aria-pressed="false">${esc(c.orig)}</button></div></div>
      <h2>${esc(c.table)}</h2><div class="lg-table"></div><p class="comment-line">${esc(c.note)}</p></section>`;
  }
  let lgState={i:0,vs:'in'};
  function paintLumigrid() {
    const box=$('.lg-show'); if(!box||!lgData)return; const c=lgCopy(), it=lgData.items[lgState.i];
    box.querySelector('.lg-after').src=`/assets/lumigrid/${lgState.i}_out.jpg`;
    box.querySelector('.lg-before').src=`/assets/lumigrid/${lgState.i}_${lgState.vs}.jpg`;
    box.querySelector('.lg-compare').style.aspectRatio=`${it.size[0]} / ${it.size[1]}`;
    box.querySelector('.lg-l').textContent=`${lgState.vs==='in'?c.before:c.orig} · ${(lgState.vs==='in'?it.psnr.input:it.psnr.original).toFixed(2)} dB`;
    box.querySelector('.lg-r').textContent=`${c.after} · ${it.psnr.lumigrid.toFixed(2)} dB`;
    box.querySelector('.lg-thumbs').innerHTML=lgData.items.map((x,i)=>`<button type="button" data-lg-i="${i}" aria-pressed="${i===lgState.i}"><img src="/assets/lumigrid/${i}_out.jpg" alt="" loading="lazy"></button>`).join('');
    box.querySelectorAll('[data-lg-vs]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lgVs===lgState.vs)));
    const best=Math.max(...lgData.table.map(r=>r[1]));
    box.querySelector('.lg-table').innerHTML=`<div class="lg-row lg-head"><span>${esc(c.method)}</span><span>PSNR</span><span>SSIM</span></div>`+lgData.table.map(r=>`<div class="lg-row ${r[0].startsWith('lumigrid')?'is-ours':''}"><span>${esc(LG_NAMES[r[0]]||r[0])}</span><span><i style="--v:${((r[1]-8)/(best-8)).toFixed(3)}"></i>${r[1].toFixed(2)}</span><span>${r[2].toFixed(3)}</span></div>`).join('');
  }
  function initLumigrid() {
    const box=$('.lg-show'); if(!box)return;
    const go=()=>{ paintLumigrid(); if(motion()){ const cmp=box.querySelector('.lg-compare'), t0=performance.now(); const step=now=>{ const k=Math.min(1,(now-t0)/1800), x=100-85*(1-Math.pow(1-k,3)); if(!cmp.isConnected)return; if(!cmp.dataset.touched){cmp.style.setProperty('--x',`${Math.max(50,x)}%`); box.querySelector('.lg-range').value=Math.max(50,x);} if(k<1)requestAnimationFrame(step); }; requestAnimationFrame(step);} };
    if(lgData)go(); else fetch('/assets/lumigrid/showcase.json?v=2').then(r=>r.json()).then(d=>{lgData=d;go();}).catch(()=>{});
  }
  /* KCrashLab: its architecture and a replay of the evidence recorded in its repository. The numbers come from
     assets/kcrashlab/showcase.json, which tools/kcrash_showcase.py builds only after every source file matched the bundle manifests. */
  const kcCopy=()=>({
    en:{note:'Every number and animation below comes from the simulated experiments recorded in the KCrashLab repository: a synthetic state machine, not a real system crash, and no third-party driver is involved.',
      archTitle:'Architecture: from an input to evidence anyone can check',
      arch:[['Case IR','Each input becomes versioned JSON whose identity is the SHA-256 of its canonical content, so two differently formatted copies of one input count once.'],
        ['Deterministic simulation','Scheduling, mutation and selection all derive from a seed: the same seed always gives the same run, and an interrupted run resumes from an append-only journal.'],
        ['Finding closure','A failure is identified by its exact signature, the trigger is shrunk only while that signature holds, and clean replays vote on the result.'],
        ['Evidence closure','A SHA-256 manifest plus provenance; the verifier also cross-checks that summaries, cases and reports agree, not just that hashes match.']],
      gate:['Track B · controlled Windows lab','A separate path that must be opened by hand, limited to the repository’s own test driver in an isolated VM. Ordinary commands never select it, and no real-machine result exists yet.'],
      replayTitle:'Replay an experiment',replayLede:'Press play to follow one experiment: finding a failure, shrinking its trigger, confirming it by replay, and producing evidence another person can verify.',
      tabs:['Discover','Minimize','Replay','Evidence'],play:'Play',replaying:'Playing…',again:'Play again',
      g3:{exec:'executions',cov:'coverage',corpus:'corpus',fail:'failures',aria:'Coverage and corpus growing over 256 executions, with failures marked from execution 211',
        legendCov:'Cumulative coverage',legendCorpus:'Corpus size',legendFail:'Failure',first:'First failure at execution {n}',done:'{raw} raw failures → {sig} exact signature',
        cap:'Discovery run G3: seed {seed}, a budget of {budget} executions; duplicate candidates were skipped {skips} times.'},
      min:{ops:'operations',bytes:'bytes',tries:'attempts',sig:'signature',same:'unchanged',done:'Down to {n} operations; the signature is the same',
        cap:'The animation only shows before and after. The minimizer took {n} attempts (limit {max}) and kept a change only when the signature stayed the same.'},
      rp:{input:'Replayed input: the minimized case',item:'Replay #{n}',clean:'From a clean state',pass:'{m} of {n} replays gave the same signature, meeting the replay policy ({n}/{n} required).'},
      ev:{states:'Campaign state machine',files:'Evidence bundle ({n} files)',verify:'Offline verification passed',verifyS:'Each file’s SHA-256 is checked, and the cases, signature, replays and provenance are cross-checked against one another.'},
      e1Title:'Experiment E1: which strategy finds the failure more often?',
      e1:{keep:'Keep every case',novelty:'Keep only new coverage',uniform:'Uniform parent pick',energy:'Energy-ranked parent pick',stat:'found {f}/{t} · median when found: execution {m}'},
      e1Note:'A 2×2 comparison of corpus admission and parent selection, {t} paired trials of {b} executions each. It is a controlled experiment on a synthetic target: it compares strategies under the same conditions and says nothing about real drivers.',
      src:'Data: results/recorded · commit {c} · engine {e}'},
    'zh-TW':{note:'以下的數字和動畫，全部來自 KCrashLab repo 裡記錄的模擬實驗：對象是合成的狀態機，不是真實的系統當機，也不涉及任何第三方驅動程式。',
      archTitle:'架構：從一個輸入到任何人都能驗證的證據',
      arch:[['Case IR','把每個輸入正規化成有版本的 JSON，用內容的 SHA-256 當身分；格式不同、內容相同的輸入只算一次。'],
        ['確定性模擬','排程、變異和挑選全部由種子決定，同一個種子一定跑出一樣的結果；中斷後可以從 append-only journal 接著跑。'],
        ['發現閉環','用精確簽章辨識失敗，只在簽章不變的前提下縮小觸發條件，再從乾淨狀態重播投票確認。'],
        ['證據閉環','產生 SHA-256 清單和來源紀錄；驗證器不只比對雜湊，還交叉檢查摘要、案例和報表是否一致。']],
      gate:['Track B · 受控 Windows 實驗室','另一條要手動開啟的路徑，只能對 repo 自己的測試驅動、在隔離的虛擬機裡執行。一般指令永遠不會選到它，目前也還沒有實機結果。'],
      replayTitle:'實驗重播',replayLede:'按播放，一步步看一次實驗怎麼找到失敗、縮小觸發條件、重播確認，最後產生別人也能驗證的證據。',
      tabs:['探索','最小化','重播','證據'],play:'播放',replaying:'播放中…',again:'再播一次',
      g3:{exec:'執行次數',cov:'覆蓋',corpus:'語料',fail:'失敗',aria:'256 次執行中覆蓋與語料的成長，第 211 次起標出失敗',
        legendCov:'累積覆蓋',legendCorpus:'語料庫大小',legendFail:'失敗',first:'第 {n} 次執行首次出現失敗',done:'{raw} 次原始失敗 → {sig} 個精確簽章',
        cap:'探索實驗 G3：種子 {seed}、預算 {budget} 次執行；重複的候選跳過了 {skips} 次。'},
      min:{ops:'操作',bytes:'位元組',tries:'嘗試',sig:'簽章',same:'不變',done:'縮到只剩 {n} 個操作，簽章完全一樣',
        cap:'動畫只呈現前後差異。最小化實際經過 {n} 次嘗試（上限 {max}），只有簽章沒變的修改才會保留。'},
      rp:{input:'重播的輸入：最小化後的案例',item:'重播 #{n}',clean:'從乾淨狀態開始',pass:'{n} 次重播中 {m} 次得到相同簽章，符合重播政策（需要 {n}/{n}）。'},
      ev:{states:'實驗狀態機',files:'證據包（{n} 個檔案）',verify:'離線驗證：通過',verifyS:'比對每個檔案的 SHA-256，並交叉檢查案例、簽章、重播和來源紀錄是否互相一致。'},
      e1Title:'對照實驗 E1：哪種策略比較容易找到失敗？',
      e1:{keep:'全部收錄',novelty:'只收新覆蓋',uniform:'均勻挑選父案例',energy:'依能量挑選父案例',stat:'{t} 次中找到 {f} 次 · 找到時中位數第 {m} 次'},
      e1Note:'2×2 對照：語料收錄方式 × 父案例挑選方式，每種 {t} 次配對試驗、每次 {b} 次執行。這是合成目標上的受控實驗，只比較同樣條件下的策略差異，不代表在真實驅動程式上的表現。',
      src:'資料：results/recorded · commit {c} · engine {e}'},
    'zh-CN':{note:'以下的数字和动画，全部来自 KCrashLab repo 里记录的模拟实验：对象是合成的状态机，不是真实的系统崩溃，也不涉及任何第三方驱动程序。',
      archTitle:'架构：从一个输入到任何人都能验证的证据',
      arch:[['Case IR','把每个输入规范化成有版本的 JSON，用内容的 SHA-256 当身份；格式不同、内容相同的输入只算一次。'],
        ['确定性模拟','调度、变异和挑选全部由种子决定，同一个种子一定跑出一样的结果；中断后可以从 append-only journal 接着跑。'],
        ['发现闭环','用精确签名识别失败，只在签名不变的前提下缩小触发条件，再从干净状态重放投票确认。'],
        ['证据闭环','生成 SHA-256 清单和来源记录；验证器不只比对哈希，还交叉检查摘要、案例和报表是否一致。']],
      gate:['Track B · 受控 Windows 实验室','另一条要手动开启的路径，只能对 repo 自己的测试驱动、在隔离的虚拟机里执行。一般命令永远不会选到它，目前也还没有实机结果。'],
      replayTitle:'实验重放',replayLede:'按播放，一步步看一次实验怎么找到失败、缩小触发条件、重放确认，最后生成别人也能验证的证据。',
      tabs:['探索','最小化','重放','证据'],play:'播放',replaying:'播放中…',again:'再播一次',
      g3:{exec:'执行次数',cov:'覆盖',corpus:'语料',fail:'失败',aria:'256 次执行中覆盖与语料的增长，第 211 次起标出失败',
        legendCov:'累积覆盖',legendCorpus:'语料库大小',legendFail:'失败',first:'第 {n} 次执行首次出现失败',done:'{raw} 次原始失败 → {sig} 个精确签名',
        cap:'探索实验 G3：种子 {seed}、预算 {budget} 次执行；重复的候选跳过了 {skips} 次。'},
      min:{ops:'操作',bytes:'字节',tries:'尝试',sig:'签名',same:'不变',done:'缩到只剩 {n} 个操作，签名完全一样',
        cap:'动画只呈现前后差异。最小化实际经过 {n} 次尝试（上限 {max}），只有签名没变的修改才会保留。'},
      rp:{input:'重放的输入：最小化后的案例',item:'重放 #{n}',clean:'从干净状态开始',pass:'{n} 次重放中 {m} 次得到相同签名，符合重放策略（需要 {n}/{n}）。'},
      ev:{states:'实验状态机',files:'证据包（{n} 个文件）',verify:'离线验证：通过',verifyS:'比对每个文件的 SHA-256，并交叉检查案例、签名、重放和来源记录是否互相一致。'},
      e1Title:'对照实验 E1：哪种策略比较容易找到失败？',
      e1:{keep:'全部收录',novelty:'只收新覆盖',uniform:'均匀挑选父案例',energy:'按能量挑选父案例',stat:'{t} 次中找到 {f} 次 · 找到时中位数第 {m} 次'},
      e1Note:'2×2 对照：语料收录方式 × 父案例挑选方式，每种 {t} 次配对试验、每次 {b} 次执行。这是合成目标上的受控实验，只比较同样条件下的策略差异，不代表在真实驱动程序上的表现。',
      src:'数据：results/recorded · commit {c} · engine {e}'}}[locale]);
  let kcData=null, kcSeen=false;
  const kcState={tab:0,run:0};
  const kcFill=(s,o)=>s.replace(/\{(\w+)\}/g,(m,k)=>o[k]??m);
  const kcSig=s=>s.slice(0,12)+'…';
  function kcShowcase() {
    const c=kcCopy();
    return `<section class="kc-show"><p class="kc-note"><b translate="no">SIMULATED</b><span>${esc(c.note)}</span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="kc-arch">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="kc-n">${i+1}</span><b translate="no">${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <div class="kc-gate"><b>${esc(c.gate[0])}</b><small>${esc(c.gate[1])}</small></div>
      <h2>${esc(c.replayTitle)}</h2><p class="screen-intro kc-lede">${esc(c.replayLede)}</p>
      <div class="kc-demo"><div class="kc-tabs" role="tablist" aria-label="${esc(c.replayTitle)}">${c.tabs.map((t,i)=>`<button type="button" role="tab" data-kc-tab="${i}" aria-selected="${i===kcState.tab}"><span>${i+1}</span>${esc(t)}</button>`).join('')}</div>
      <div class="kc-stage" role="tabpanel" aria-live="polite"></div>
      <div class="kc-ctrl"><button type="button" class="kc-play" data-kc-play>${icon('play')}<span>${esc(c.play)}</span></button><span class="kc-src"></span></div></div>
      <h2>${esc(c.e1Title)}</h2><div class="kc-e1"></div><p class="comment-line kc-e1-note"></p></section>`;
  }
  function kcStage(animate) {
    const box=$('.kc-show'); if(!box||!kcData) return;
    const c=kcCopy(), D=kcData, stage=box.querySelector('.kc-stage'), run=++kcState.run, label=box.querySelector('.kc-play span');
    const alive=()=>run===kcState.run&&stage.isConnected;
    box.querySelectorAll('[data-kc-tab]').forEach(b=>b.setAttribute('aria-selected',String(Number(b.dataset.kcTab)===kcState.tab)));
    box.querySelector('.kc-src').textContent=kcFill(c.src,{c:D.source.commit.slice(0,7),e:D.source.engine});
    const go=animate&&motion();
    label.textContent=go?c.replaying:c.play;
    const done=()=>{ if(alive()) label.textContent=go?c.again:c.play; };
    [kcDiscover,kcMinimize,kcReplay,kcEvidence][kcState.tab](stage,c,D,go,alive,done);
  }
  const kcStats=(c,keys)=>`<div class="kc-stats">${keys.map(([k,label])=>`<div><b data-k="${k}">–</b><span>${esc(label)}</span></div>`).join('')}</div>`;
  const kcSet=(stage,k,v)=>{ const el=stage.querySelector(`[data-k="${k}"]`); if(el) el.textContent=v; };
  function kcAfter(alive,ms,fn){ setTimeout(()=>{ if(alive()) fn(); },ms); }
  function kcDiscover(stage,c,D,go,alive,done) {
    const G=D.g3, N=G.budget, W=600, H=190, P=6, x=t=>P+(W-2*P)*(t-1)/(N-1), y=v=>H-26-(H-40)*v/100;
    stage.innerHTML=kcStats(c,[['exec',c.g3.exec],['cov',c.g3.cov],['corpus',c.g3.corpus],['fail',c.g3.fail]])
      +`<svg class="kc-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.g3.aria)}"><path class="kc-grid" d="M${P} ${y(0)}H${W-P}M${P} ${y(50)}H${W-P}M${P} ${y(100)}H${W-P}"/>`
      +`<polyline class="kc-corp"/><polyline class="kc-cov"/><g class="kc-fails"></g><line class="kc-cur" y1="6" y2="${H-4}"/></svg>`
      +`<p class="kc-legend"><span><i class="l-cov"></i>${esc(c.g3.legendCov)}</span><span><i class="l-corp"></i>${esc(c.g3.legendCorpus)}</span><span><i class="l-fail"></i>${esc(c.g3.legendFail)}</span></p>`
      +`<p class="kc-msg"></p><p class="kc-cap">${esc(kcFill(c.g3.cap,{seed:G.seed,budget:N,skips:G.skips}))}</p>`;
    const svg=stage.querySelector('svg'), msg=stage.querySelector('.kc-msg');
    const paint=t=>{
      const pts=a=>a.slice(0,t).map((v,i)=>`${x(i+1).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
      svg.querySelector('.kc-cov').setAttribute('points',pts(G.cov)); svg.querySelector('.kc-corp').setAttribute('points',pts(G.corpus));
      const f=G.fails.filter(e=>e<=t);
      svg.querySelector('.kc-fails').innerHTML=f.map(e=>`<line x1="${x(e).toFixed(1)}" x2="${x(e).toFixed(1)}" y1="${H-18}" y2="${H-6}"/>`).join('');
      const cur=svg.querySelector('.kc-cur'); cur.setAttribute('x1',x(t)); cur.setAttribute('x2',x(t)); cur.style.opacity=t<N?1:0;
      kcSet(stage,'exec',`${t}/${N}`); kcSet(stage,'cov',G.cov[t-1]); kcSet(stage,'corpus',G.corpus[t-1]); kcSet(stage,'fail',f.length);
      msg.textContent=t>=N?`${kcFill(c.g3.done,{raw:G.fails.length,sig:G.signatures})} · ${kcSig(G.signature)}`:f.length?kcFill(c.g3.first,{n:G.fails[0]}):'';
      msg.classList.toggle('is-hit',f.length>0);
    };
    if(!go){ paint(N); done(); return; }
    const t0=performance.now(), dur=4500;
    const step=now=>{ if(!alive()) return; const k=Math.min(1,(now-t0)/dur); paint(Math.max(1,Math.round(k*N))); if(k<1) requestAnimationFrame(step); else done(); };
    requestAnimationFrame(step);
  }
  function kcMinimize(stage,c,D,go,alive,done) {
    const M=D.min, keep=new Set(M.keep);
    stage.innerHTML=kcStats(c,[['ops',c.min.ops],['bytes',c.min.bytes],['tries',c.min.tries],['sig',c.min.sig]])
      +`<ol class="kc-ops">${M.original.map((o,i)=>`<li class="${keep.has(i)?'is-keep':''}"><em>${String(i+1).padStart(2,'0')}</em><code translate="no">${esc(o.op)}</code>${o.f?`<small translate="no">${esc(o.f)}</small>`:''}</li>`).join('')}</ol>`
      +`<p class="kc-msg"></p><p class="kc-cap">${esc(kcFill(c.min.cap,{n:M.attempts,max:M.max_attempts}))}</p>`;
    const items=[...stage.querySelectorAll('.kc-ops li')], drop=items.filter((_,i)=>!keep.has(i));
    kcSet(stage,'ops',M.original.length); kcSet(stage,'bytes',M.bytes[0]); kcSet(stage,'tries',`–/${M.max_attempts}`); kcSet(stage,'sig',kcSig(D.g3.signature));
    const finish=()=>{
      drop.forEach(li=>li.classList.add('is-gone'));
      M.keep.forEach((oi,j)=>{ const small=items[oi].querySelector('small'); if(small) small.textContent=M.minimized[j].f; });
      stage.querySelector('.kc-ops').classList.add('is-done');
      kcSet(stage,'ops',`${M.original.length} → ${M.minimized.length}`); kcSet(stage,'bytes',`${M.bytes[0]} → ${M.bytes[1]}`);
      kcSet(stage,'tries',`${M.attempts}/${M.max_attempts}`); kcSet(stage,'sig',`${c.min.same} ✓`);
      const msg=stage.querySelector('.kc-msg'); msg.textContent=kcFill(c.min.done,{n:M.minimized.length}); msg.classList.add('is-ok'); done();
    };
    if(!go){ finish(); return; }
    drop.forEach((li,n)=>kcAfter(alive,350+n*170,()=>li.classList.add('is-gone')));
    kcAfter(alive,350+drop.length*170+300,finish);
  }
  function kcReplay(stage,c,D,go,alive,done) {
    stage.innerHTML=`<h3 class="kc-h">${esc(c.rp.input)}</h3><ol class="kc-flow">${D.min.minimized.map(o=>`<li><code translate="no">${esc(o.op)}</code>${o.f?`<small translate="no">${esc(o.f)}</small>`:''}</li>`).join('')}</ol><div class="kc-replays">${D.replay.map((r,i)=>`<div class="kc-rp"><b>${esc(kcFill(c.rp.item,{n:i+1}))}</b><small>${esc(c.rp.clean)}</small><span class="kc-rp-res"><em translate="no">${esc(r)}</em><code translate="no">${esc(kcSig(D.g3.signature))}</code></span><i aria-hidden="true"></i></div>`).join('')}</div><p class="kc-msg"></p>`;
    const cards=[...stage.querySelectorAll('.kc-rp')], m=D.replay.filter(r=>r==='MATCH').length;
    const finish=()=>{ cards.forEach(el=>el.classList.add('is-done')); const msg=stage.querySelector('.kc-msg'); msg.textContent=kcFill(c.rp.pass,{m,n:D.replay.length}); msg.classList.toggle('is-ok',m===D.replay.length); done(); };
    if(!go){ finish(); return; }
    cards.forEach((el,i)=>{ kcAfter(alive,200+i*900,()=>el.classList.add('is-run')); kcAfter(alive,200+i*900+750,()=>el.classList.add('is-done')); });
    kcAfter(alive,200+cards.length*900,finish);
  }
  function kcEvidence(stage,c,D,go,alive,done) {
    const short=f=>f.length>36?`${f.slice(0,16)}…${f.slice(-8)}`:f;
    stage.innerHTML=`<h3 class="kc-h">${esc(c.ev.states)}</h3><ol class="kc-states">${D.events.map(e=>`<li><code translate="no">${esc(e.to)}</code><small>${e.ms} ms</small></li>`).join('')}</ol>`
      +`<h3 class="kc-h">${esc(kcFill(c.ev.files,{n:D.manifest.length}))}</h3><ul class="kc-files">${D.manifest.map(f=>`<li title="${esc(f)}"><code translate="no">${esc(short(f))}</code></li>`).join('')}</ul>`
      +`<div class="kc-verify"><b>✓ ${esc(c.ev.verify)}</b><small>${esc(c.ev.verifyS)}</small></div>`;
    const states=[...stage.querySelectorAll('.kc-states li')], files=[...stage.querySelectorAll('.kc-files li')], verify=stage.querySelector('.kc-verify');
    const finish=()=>{ states.concat(files).forEach(el=>el.classList.add('is-on')); verify.classList.add('is-on'); done(); };
    if(!go){ finish(); return; }
    states.forEach((el,i)=>kcAfter(alive,150+i*230,()=>el.classList.add('is-on')));
    const t1=150+states.length*230;
    files.forEach((el,i)=>kcAfter(alive,t1+i*90,()=>el.classList.add('is-on')));
    kcAfter(alive,t1+files.length*90+250,finish);
  }
  function kcE1() {
    const box=$('.kc-e1'); if(!box||!kcData) return;
    const c=kcCopy(), E=kcData.e1, list=[...E.strategies].sort((a,b)=>b.rate-a.rate), best=list[0].rate;
    box.innerHTML=list.map((s,i)=>`<div class="kc-bar${s.rate===best?' is-best':''}" style="--v:${s.rate};--i:${i}"><span class="kc-bar-l"><b>${esc(s.id.startsWith('NOVELTY')?c.e1.novelty:c.e1.keep)}</b><small>${esc(s.id.includes('ENERGY')?c.e1.energy:c.e1.uniform)}</small></span>`
      +`<span class="kc-bar-t"><i></i><em>${Math.round(s.rate*100)}%</em></span><span class="kc-bar-s">${esc(kcFill(c.e1.stat,{f:Math.round(s.rate*E.trials),t:E.trials,m:s.median}))}</span></div>`).join('');
    $('.kc-e1-note').textContent=kcFill(c.e1Note,{t:E.trials,b:E.budget});
  }
  function initKcrash() {
    const box=$('.kc-show'); if(!box) return;
    const go=()=>{
      kcE1(); kcStage(false);
      const demo=box.querySelector('.kc-demo');
      if(motion()&&!kcSeen&&'IntersectionObserver' in window){
        const io=new IntersectionObserver(ents=>{ if(ents.some(e=>e.isIntersecting)){ io.disconnect(); kcSeen=true; if(demo.isConnected) kcStage(true); } },{threshold:.45});
        io.observe(demo);
      }
    };
    if(kcData) go(); else fetch('/assets/kcrashlab/showcase.json?v=1').then(r=>r.json()).then(d=>{kcData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{
    const t=event.target.closest('[data-kc-tab]'), p=event.target.closest('[data-kc-play]');
    if(t){ kcState.tab=Number(t.dataset.kcTab); kcStage(true); }
    if(p) kcStage(true);
  });
  root.addEventListener('keydown',event=>{
    const t=event.target.closest?.('[data-kc-tab]'); if(!t||!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); kcState.tab=(kcState.tab+(event.key==='ArrowRight'?1:3))%4; kcStage(true); $(`[data-kc-tab="${kcState.tab}"]`)?.focus();
  });
  /* ContextSec: its decision pipeline, then the real output of ContextSec itself on the sample products in its repository
     (assets/contextsec/showcase.json, built by tools/contextsec_showcase.py from a clean checkout). */
  const CS_PACK={en:{foundation:'Foundation','baseline-web':'Web baseline','auth-session':'Auth & sessions',payments:'Payments','privacy-pii':'Personal data','multi-tenant':'Multi-tenant','api-inbound':'Inbound API','external-api':'External APIs','file-upload':'File upload','ai-rag-agent':'AI & agents','secrets-management':'Secrets','cloud-iam-controlplane':'Cloud IAM','cicd-supply-chain':'CI/CD supply chain','third-party-saas-oauth':'Third-party OAuth','support-admin-ops':'Support & admin','high-impact-transactions':'High-impact actions'},
    'zh-TW':{foundation:'基礎','baseline-web':'網頁基線','auth-session':'登入與工作階段',payments:'金流','privacy-pii':'個資','multi-tenant':'多租戶','api-inbound':'對外 API','external-api':'外部服務','file-upload':'檔案上傳','ai-rag-agent':'AI 與代理','secrets-management':'機密管理','cloud-iam-controlplane':'雲端權限','cicd-supply-chain':'CI/CD 供應鏈','third-party-saas-oauth':'第三方 OAuth','support-admin-ops':'客服與後台','high-impact-transactions':'高影響交易'},
    'zh-CN':{foundation:'基础','baseline-web':'网页基线','auth-session':'登录与会话',payments:'支付','privacy-pii':'个人信息','multi-tenant':'多租户','api-inbound':'对外 API','external-api':'外部服务','file-upload':'文件上传','ai-rag-agent':'AI 与代理','secrets-management':'密钥管理','cloud-iam-controlplane':'云端权限','cicd-supply-chain':'CI/CD 供应链','third-party-saas-oauth':'第三方 OAuth','support-admin-ops':'客服与后台','high-impact-transactions':'高影响交易'}};
  const csCopy=()=>({
    en:{note:'Everything below is the real output of ContextSec {v} run on the sample products that ship in its repository. It decides which security controls a product needs and whether the evidence exists; it is not a penetration test, a vulnerability scanner or a compliance certification.',
      archTitle:'How it decides',
      arch:[['Bounded reading','Local text only, with file and size limits. It never runs, builds or tests the code, never uses the network, and never prints source values.'],
        ['Product contexts','Dependencies, routes and data models become claims such as payments, personal data, tenancy or AI, each tied to a file and line.'],
        ['Pack routing','Of 16 risk packs, only those with evidence open, plus their dependencies. Missing evidence is “unknown”, never “not applicable”.'],
        ['Compositions','Two contexts side by side are only a candidate; a real intersection or data flow is needed before the combined control becomes required.'],
        ['Ledger and gate','Every control records applicability and verification separately; a required control without proof keeps the release gate at BLOCK.']],
      rules:[['Applicable ≠ vulnerable','A pack can apply even when no bug is found.'],['No finding ≠ verified','Unchecked controls stay unknown in the ledger.'],['Confidence ≠ impact','Weak evidence and a critical control are separate fields.'],['Co-occurrence ≠ data flow','An intersection needs direct evidence to become required.']],
      demoTitle:'Pick a product, see the decision',demoLede:'Nine sample products from the repository. Each was profiled, checked and gated by ContextSec; switch between them to see how differently it routes.',
      files:'files',bytes:'bytes',evidence:'Evidence',more:'+{n} more',noEvidence:'No production evidence: documentation, tests and dev-only dependencies cannot create claims.',
      board:'16 risk packs',reason:{universal:'every repo',evidence:'evidence','no-evidence':'no evidence','needs-confirmation':'needs confirmation',dependency:'↳ {p}'},
      state:{required:'required',candidate:'candidate',unknown:'unknown',not_applicable:'not applicable'},
      comps:'Intersections',compRule:'{a} × {b}',
      ledger:'Control ledger · {n} controls',ledgerNote:'Rows say whether a control applies, columns whether it was verified. They are kept apart, so unchecked is never counted as passed.',
      ver:{verified:'verified',failed:'failed',unknown:'unverified',waived:'waived'},
      gate:{BLOCK:'Blocking required controls failed or lack verification.',WARN:'Only candidate, unknown or non-blocking gaps remain.',PASS:'Every blocking required control is verified.',WAIVED:'Every blocker has a valid waiver.'},
      why:'Why the gate says {g}',findings:'Deterministic findings',noFind:'No deterministic check failed here, yet {n} blocking required controls have no evidence, so the gate stays at BLOCK: no finding is not the same as verified.',
      warnWhy:'Nothing required blocks the release; what remains is candidate or unknown applicability, so the gate is WARN.',
      status:{failed:'failed',unknown:'unverified'},
      twinsTitle:'One character apart',twinsLede:'Two one-line files from the test suite. On the left the call is only text inside a string; on the right it sits in ${…}, so it really runs.',
      opens:'opens {n}',benchTitle:'Offline benchmarks',
      bench:[['{c}/{t}','annotations correct across {s} regression scenarios'],['F1 {f}','on {c} profile cases, with {z} false required activations'],['{k}/{e}','single-edit security mutations caught'],['{p}/{c}','pathological {kb} KB files handled, slowest {s} s, no source disclosed']],
      benchNote:'These cases are authored by the maintainer, so they show reproducibility and no regressions, not ecosystem-wide accuracy; an independent third-party evaluation protocol is published but not yet run.',
      src:'Data: ContextSec {v} · commit {c} · run {d}',
      prod:{'composite-saas':['AI invoice SaaS','Next.js, Stripe payments, a multi-tenant Prisma database, S3 uploads and an OpenAI assistant: a deliberately incomplete sample.'],
        'next-static':['Static site','A single Next.js page: no login, payments or database.'],
        'docs-noise':['Decoy docs','A README packed with Stripe, OpenAI and personal-data words plus an adversarial instruction; the two SDKs are dev dependencies only.'],
        'high-impact':['Payouts','One function calling stripe.payouts.create: money that cannot be taken back.'],
        'support-admin':['Support impersonation','An admin API that lets support staff open a session as a user.'],
        'saas-oauth':['Slack connection','Connects a third-party SaaS with an OAuth refresh token and scopes.'],
        'cicd-supply':['Release pipeline','A GitHub Actions release workflow with its action pinned to a commit.'],
        'cloud-iam':['Cloud IAM','Terraform creating an IAM role and a policy that can assume roles.'],
        'analytics-organization':['Analytics table','A Prisma table with an organizationId: it looks multi-tenant, but the evidence is not conclusive.']},
      find:{}},
    'zh-TW':{note:'以下全部是 ContextSec {v} 對它 repo 內附的範例產品實際執行的輸出。它判斷的是「這個產品需要哪些安全控制、證據夠不夠」，不是滲透測試、漏洞掃描，也不是合規認證。',
      archTitle:'它怎麼判斷',
      arch:[['有界讀取','只讀本地文字檔，有檔案數與大小上限；不執行、不建置、不測試程式碼，不連網，也不輸出原始碼內容。'],
        ['產品情境','從依賴、路由、資料模型推出產品有哪些情境，例如金流、個資、多租戶、AI，每個判斷都連到檔案與行號。'],
        ['風險包路由','16 個風險包只打開有證據支持的，連同它們的依賴；沒有證據的標成「未知」，不會當成「不適用」。'],
        ['交集組合','兩個情境同時存在只算候選；要有實際的交集或資料流證據，組合控制才會升級成必要。'],
        ['帳本與閘門','每項控制分開記「適不適用」和「驗證了沒」；缺證據的必要控制會讓發布閘門停在 BLOCK。']],
      rules:[['適用 ≠ 有漏洞','沒找到 bug，風險包一樣可能適用。'],['沒發現 ≠ 已驗證','沒檢查到的控制在帳本裡維持未知。'],['推論信心 ≠ 影響程度','證據強弱和控制的嚴重度分開記錄。'],['同時出現 ≠ 有資料流','交集要有直接證據才會變成必要。']],
      demoTitle:'選一個產品，看它怎麼判斷',demoLede:'repo 內附的 9 個範例產品，每個都實際經過 ContextSec 的 profile、check 和 gate。切換看看，同一個引擎對不同產品的判斷差多少。',
      files:'個檔案',bytes:'位元組',evidence:'證據',more:'還有 {n} 筆',noEvidence:'沒有任何正式環境的證據：文件、測試和開發用依賴都不能產生判斷。',
      board:'16 個風險包',reason:{universal:'每個 repo',evidence:'有證據','no-evidence':'無證據','needs-confirmation':'待確認',dependency:'↳ {p}'},
      state:{required:'必要',candidate:'候選',unknown:'未知',not_applicable:'不適用'},
      comps:'情境交集',compRule:'{a} × {b}',
      ledger:'控制帳本 · 共 {n} 項',ledgerNote:'直的是「適不適用」，橫的是「驗證了沒」。兩者分開記，沒驗證的永遠不會被算成通過。',
      ver:{verified:'已驗證',failed:'失敗',unknown:'未驗證',waived:'豁免'},
      gate:{BLOCK:'有必要且會阻擋發布的控制失敗或缺少驗證。',WARN:'只剩候選、未知或不阻擋發布的缺口。',PASS:'所有會阻擋發布的必要控制都已驗證。',WAIVED:'每個阻擋項目都有有效的豁免。'},
      why:'為什麼閘門是 {g}',findings:'確定性檢查發現',noFind:'這個產品沒有任何確定性檢查失敗，但仍有 {n} 項必要且會阻擋發布的控制沒有證據，所以閘門還是 BLOCK：沒發現問題，不等於通過驗證。',
      warnWhy:'沒有必要的控制擋住發布；剩下的是候選或未知的適用性，所以是 WARN。',
      status:{failed:'失敗',unknown:'未驗證'},
      twinsTitle:'一字之差',twinsLede:'測試集裡的兩個一行檔案。左邊的呼叫只是字串裡的文字；右邊放在 ${…} 裡，是真的會執行。',
      opens:'打開 {n} 個',benchTitle:'離線評測',
      bench:[['{c}/{t}','{s} 個迴歸情境的人工標註全部正確'],['F1 {f}','{c} 個風險輪廓案例，誤開必要包 {z} 次'],['{k}/{e}','單一安全修改的變異全部被抓到'],['{p}/{c}','{kb} KB 的病態檔案全部處理完，最慢 {s} 秒，不外洩內容']],
      benchNote:'這些案例都由維護者自己標註，證明的是可重現和不退步，不是整個生態系的準確率；獨立第三方評估的規範已經公開，但還沒有實際執行。',
      src:'資料：ContextSec {v} · commit {c} · 執行於 {d}',
      prod:{'composite-saas':['AI 發票 SaaS','Next.js、Stripe 付款、Prisma 多租戶資料庫、S3 上傳，再加上 OpenAI 問答：一個故意寫得不完整的範例產品。'],
        'next-static':['靜態網站','只有一個 Next.js 頁面，沒有登入、付款或資料庫。'],
        'docs-noise':['誘餌文件','README 塞滿 Stripe、OpenAI、個資等字眼，還夾了一段對抗性指令；兩個 SDK 也只列在開發依賴裡。'],
        'high-impact':['出款功能','一個呼叫 stripe.payouts.create 的函式：錢送出去就收不回來。'],
        'support-admin':['客服代登入','後台 API 讓客服可以用使用者的身分開啟工作階段。'],
        'saas-oauth':['Slack 串接','用 OAuth refresh token 和 scopes 連接第三方 SaaS。'],
        'cicd-supply':['發布流程','一個 GitHub Actions 發布 workflow，action 已經釘選到 commit。'],
        'cloud-iam':['雲端權限','用 Terraform 建立 IAM 角色，以及可以 AssumeRole 的政策。'],
        'analytics-organization':['分析事件表','Prisma 資料表裡有 organizationId：看起來像多租戶，但證據還不夠確定。']},
      find:{'AI-PII-EGRESS-001':['未經篩選的資料庫物件被送進 AI 服務','含個資的 Prisma 查詢結果 → 整個物件序列化進模型請求'],
        'PAYMENT-IDEMPOTENCY-001':['找不到可重現的 webhook 冪等性證據','重複的已簽章事件 → webhook 處理 → 業務狀態可能被重複執行'],
        'PII-LOG-001':['敏感的資料庫物件被寫進應用程式日誌','含個資的 Prisma 查詢結果 → 寬鬆的 console 日誌'],
        'TENANT-QUERY-001':['租戶資料的查詢缺少租戶條件','外部傳入的 id → 只用物件 id 查資料庫 → 回傳或處理別的租戶的資料'],
        'UPLOAD-PUBLIC-001':['上傳的檔案被明確設成公開','外部上傳的檔案 → 寫入物件儲存 → public-read 權限']}},
    'zh-CN':{note:'以下全部是 ContextSec {v} 对它 repo 内附的示例产品实际运行的输出。它判断的是“这个产品需要哪些安全控制、证据够不够”，不是渗透测试、漏洞扫描，也不是合规认证。',
      archTitle:'它怎么判断',
      arch:[['有界读取','只读本地文本文件，有文件数与大小上限；不运行、不构建、不测试代码，不联网，也不输出源代码内容。'],
        ['产品情境','从依赖、路由、数据模型推出产品有哪些情境，例如支付、个人信息、多租户、AI，每个判断都关联到文件与行号。'],
        ['风险包路由','16 个风险包只打开有证据支持的，连同它们的依赖；没有证据的标成“未知”，不会当成“不适用”。'],
        ['交集组合','两个情境同时存在只算候选；要有实际的交集或数据流证据，组合控制才会升级成必要。'],
        ['账本与闸门','每项控制分开记“适不适用”和“验证了没”；缺证据的必要控制会让发布闸门停在 BLOCK。']],
      rules:[['适用 ≠ 有漏洞','没找到 bug，风险包一样可能适用。'],['没发现 ≠ 已验证','没检查到的控制在账本里维持未知。'],['推断置信度 ≠ 影响程度','证据强弱和控制的严重度分开记录。'],['同时出现 ≠ 有数据流','交集要有直接证据才会变成必要。']],
      demoTitle:'选一个产品，看它怎么判断',demoLede:'repo 内附的 9 个示例产品，每个都实际经过 ContextSec 的 profile、check 和 gate。切换看看，同一个引擎对不同产品的判断差多少。',
      files:'个文件',bytes:'字节',evidence:'证据',more:'还有 {n} 条',noEvidence:'没有任何生产环境的证据：文档、测试和开发用依赖都不能产生判断。',
      board:'16 个风险包',reason:{universal:'每个 repo',evidence:'有证据','no-evidence':'无证据','needs-confirmation':'待确认',dependency:'↳ {p}'},
      state:{required:'必要',candidate:'候选',unknown:'未知',not_applicable:'不适用'},
      comps:'情境交集',compRule:'{a} × {b}',
      ledger:'控制账本 · 共 {n} 项',ledgerNote:'竖的是“适不适用”，横的是“验证了没”。两者分开记，没验证的永远不会被算成通过。',
      ver:{verified:'已验证',failed:'失败',unknown:'未验证',waived:'豁免'},
      gate:{BLOCK:'有必要且会阻挡发布的控制失败或缺少验证。',WARN:'只剩候选、未知或不阻挡发布的缺口。',PASS:'所有会阻挡发布的必要控制都已验证。',WAIVED:'每个阻挡项目都有有效的豁免。'},
      why:'为什么闸门是 {g}',findings:'确定性检查发现',noFind:'这个产品没有任何确定性检查失败，但仍有 {n} 项必要且会阻挡发布的控制没有证据，所以闸门还是 BLOCK：没发现问题，不等于通过验证。',
      warnWhy:'没有必要的控制挡住发布；剩下的是候选或未知的适用性，所以是 WARN。',
      status:{failed:'失败',unknown:'未验证'},
      twinsTitle:'一字之差',twinsLede:'测试集里的两个单行文件。左边的调用只是字符串里的文字；右边放在 ${…} 里，是真的会执行。',
      opens:'打开 {n} 个',benchTitle:'离线评测',
      bench:[['{c}/{t}','{s} 个回归情境的人工标注全部正确'],['F1 {f}','{c} 个风险画像案例，误开必要包 {z} 次'],['{k}/{e}','单一安全修改的变异全部被抓到'],['{p}/{c}','{kb} KB 的病态文件全部处理完，最慢 {s} 秒，不泄露内容']],
      benchNote:'这些案例都由维护者自己标注，证明的是可复现和不退步，不是整个生态的准确率；独立第三方评估的规范已经公开，但还没有实际执行。',
      src:'数据：ContextSec {v} · commit {c} · 运行于 {d}',
      prod:{'composite-saas':['AI 发票 SaaS','Next.js、Stripe 支付、Prisma 多租户数据库、S3 上传，再加上 OpenAI 问答：一个故意写得不完整的示例产品。'],
        'next-static':['静态网站','只有一个 Next.js 页面，没有登录、支付或数据库。'],
        'docs-noise':['诱饵文档','README 塞满 Stripe、OpenAI、个人信息等字眼，还夹了一段对抗性指令；两个 SDK 也只列在开发依赖里。'],
        'high-impact':['出款功能','一个调用 stripe.payouts.create 的函数：钱发出去就收不回来。'],
        'support-admin':['客服代登录','后台 API 让客服可以用用户的身份开启会话。'],
        'saas-oauth':['Slack 集成','用 OAuth refresh token 和 scopes 连接第三方 SaaS。'],
        'cicd-supply':['发布流程','一个 GitHub Actions 发布 workflow，action 已经固定到 commit。'],
        'cloud-iam':['云端权限','用 Terraform 创建 IAM 角色，以及可以 AssumeRole 的策略。'],
        'analytics-organization':['分析事件表','Prisma 数据表里有 organizationId：看起来像多租户，但证据还不够确定。']},
      find:{'AI-PII-EGRESS-001':['未经筛选的数据库对象被发送给 AI 服务','含个人信息的 Prisma 查询结果 → 整个对象序列化进模型请求'],
        'PAYMENT-IDEMPOTENCY-001':['找不到可复现的 webhook 幂等性证据','重复的已签名事件 → webhook 处理 → 业务状态可能被重复执行'],
        'PII-LOG-001':['敏感的数据库对象被写进应用日志','含个人信息的 Prisma 查询结果 → 宽松的 console 日志'],
        'TENANT-QUERY-001':['租户数据的查询缺少租户条件','外部传入的 id → 只用对象 id 查数据库 → 返回或处理其他租户的数据'],
        'UPLOAD-PUBLIC-001':['上传的文件被明确设为公开','外部上传的文件 → 写入对象存储 → public-read 权限']}}}[locale]);
  let csData=null;
  const csState={p:0};
  const csFill=(s,o)=>s.replace(/\{(\w+)\}/g,(m,k)=>o[k]??m);
  const csPack=id=>(CS_PACK[locale]||CS_PACK.en)[id]||id;
  function csShowcase() {
    const c=csCopy();
    return `<section class="cs-show"><p class="cs-note"><b translate="no">v0.4.1</b><span class="cs-note-t"></span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="cs-flow">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="cs-n">${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <div class="cs-rules">${c.rules.map(([t,d])=>`<div><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
      <h2>${esc(c.demoTitle)}</h2><p class="screen-intro">${esc(c.demoLede)}</p>
      <div class="cs-demo"><div class="cs-products" role="tablist" aria-label="${esc(c.demoTitle)}"></div><div class="cs-stage" role="tabpanel" aria-live="polite"></div><p class="cs-src"></p></div>
      <h2>${esc(c.twinsTitle)}</h2><p class="screen-intro">${esc(c.twinsLede)}</p><div class="cs-twins"></div>
      <h2>${esc(c.benchTitle)}</h2><div class="cs-bench"></div><p class="comment-line">${esc(c.benchNote)}</p></section>`;
  }
  function csPaint() {
    const box=$('.cs-show'); if(!box||!csData) return;
    const c=csCopy(), D=csData, P=D.products[csState.p], stage=box.querySelector('.cs-stage');
    box.querySelector('.cs-products').innerHTML=D.products.map((p,i)=>`<button type="button" role="tab" data-cs-p="${i}" aria-selected="${i===csState.p}" tabindex="${i===csState.p?0:-1}"><i class="g-${esc(p.gate.status.toLowerCase())}" aria-hidden="true"></i>${esc((c.prod[p.id]||[p.id])[0])}</button>`).join('');
    const [name,desc]=c.prod[P.id]||[P.id,''];
    // code locations before manifest entries, and one line per claim before repeats, so the first nine say the most
    const byCode=[...P.evidence].sort((a,b)=>(/^\d+$/.test(b.l)-/^\d+$/.test(a.l))), firstOf=new Set(), lead=[], rest=[];
    byCode.forEach(e=>{ (firstOf.has(e.c)?rest:lead).push(e); firstOf.add(e.c); });
    const ev=lead.concat(rest).slice(0,9).map(e=>`<li><code translate="no">${esc(e.p)}${/^\d+$/.test(e.l)?':'+esc(e.l):' · '+esc(e.l)}</code><span translate="no">→ ${esc(e.c)}</span></li>`).join('');
    const tiles=D.packs.map((k,i)=>{ const [st,why,dep]=P.packs[k.id]||['unknown','no-evidence'];
      return `<div class="cs-tile s-${esc(st)}" style="--i:${i}" title="${esc(c.state[st]||st)}"><b>${esc(csPack(k.id))}</b><small translate="no">${esc(k.id)}</small><em>${esc(csFill(c.reason[why]||why,{p:csPack(dep||'')}))}</em></div>`; }).join('');
    const comps=Object.entries(P.compositions).map(([id,st])=>{ const r=D.composition_rules.find(x=>x.id===id); const [a,b]=r?r.requires:['?','?'];
      return `<span class="cs-comp s-${esc(st)}"><b>${esc(csFill(c.compRule,{a:csPack(a),b:csPack(b)}))}</b><em>${esc(c.state[st]||st)}</em><small translate="no">${esc(id)}</small></span>`; }).join('');
    const APP=['required','candidate','unknown','not_applicable'], VER=['verified','failed','unknown','waived'];
    const max=Math.max(1,...APP.flatMap(a=>VER.map(v=>P.matrix[a]?.[v]||0)));
    const matrix=`<table class="cs-matrix"><thead><tr><th></th>${VER.map(v=>`<th>${esc(c.ver[v])}</th>`).join('')}</tr></thead><tbody>${APP.map(a=>`<tr><th>${esc(c.state[a])}</th>${VER.map(v=>{ const n=P.matrix[a]?.[v]||0; return `<td class="${P.gate.status==='BLOCK'&&a==='required'&&(v==='failed'||v==='unknown')&&n?'is-gap':''}" style="--a:${(n/max).toFixed(2)}">${n||'·'}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
    const g=P.gate.status;
    const why=P.findings.length?`<h3>${esc(c.findings)}</h3><ul class="cs-finds">${P.findings.map(f=>{ const [t,path]=c.find[f.checker]||[f.title,f.attack];
        return `<li class="sev-${esc(f.severity)}"><div><em class="st-${esc(f.status)}">${esc(c.status[f.status]||f.status)}</em><b>${esc(t)}</b></div><code translate="no">${esc(f.path)}:${esc(f.line)}</code><small>${esc(path)}</small><span class="cs-ids" translate="no">${esc(f.checker)} → ${f.controls.map(esc).join(' · ')}</span></li>`; }).join('')}</ul>`
      :`<p class="cs-why-t">${esc(g==='BLOCK'?csFill(c.noFind,{n:P.gate.blocking}):c.warnWhy)}</p>`;
    stage.innerHTML=`<div class="cs-head"><div><b>${esc(name)}</b><small>${esc(desc)}</small><span class="cs-meta" translate="no">${esc(P.repo)} · ${P.files} ${esc(c.files)} · ${P.bytes.toLocaleString('en-US')} ${esc(c.bytes)}</span></div>
      <div class="cs-gate g-${esc(g.toLowerCase())}"><em translate="no">${esc(g)}</em><small>${esc(c.gate[g]||'')}</small></div></div>
      <div class="cs-cols"><div class="cs-ev"><h3>${esc(c.evidence)} · ${P.evidence.length}</h3>${P.evidence.length?`<ul>${ev}</ul>${P.evidence.length>9?`<p class="cs-more">${esc(csFill(c.more,{n:P.evidence.length-9}))}</p>`:''}`:`<p class="cs-more">${esc(c.noEvidence)}</p>`}</div>
      <div><h3>${esc(c.board)}</h3><div class="cs-board">${tiles}</div><p class="cs-legend">${['required','candidate','unknown'].map(s=>`<span class="s-${s}"><i></i>${esc(c.state[s])}</span>`).join('')}</p></div></div>
      ${comps?`<h3>${esc(c.comps)}</h3><div class="cs-comps">${comps}</div>`:''}
      <div class="cs-cols cs-cols-b"><div><h3>${esc(csFill(c.ledger,{n:P.controls}))}</h3>${matrix}<p class="cs-more">${esc(c.ledgerNote)}</p></div><div class="cs-why"><h3>${esc(csFill(c.why,{g}))}</h3>${why}</div></div>`;
    box.querySelector('.cs-src').textContent=csFill(c.src,{v:D.source.version,c:D.source.commit.slice(0,7),d:D.source.run});
  }
  function csStatic() {
    const box=$('.cs-show'); if(!box||!csData) return;
    const c=csCopy(), D=csData, B=D.bench;
    box.querySelector('.cs-note-t').textContent=csFill(c.note,{v:D.source.version});
    box.querySelector('.cs-twins').innerHTML=D.twins.map(t=>`<div class="cs-twin t-${esc(t.id)}"><span class="cs-file" translate="no">${esc(t.file)}</span><pre translate="no"><code>${esc(t.code)}</code></pre><p><b>${esc(csFill(c.opens,{n:t.required.length}))}</b>${t.required.map(p=>`<span>${esc(csPack(p))}</span>`).join('')}</p></div>`).join('');
    const vals=[{c:B.regression.correct,t:B.regression.annotations,s:B.regression.scenarios},{f:B.profile.macro_f1.toFixed(2),c:B.profile.cases,z:B.profile.false_required},
      {k:B.mutation.killed,e:B.mutation.eligible},{p:B.adversarial.passed,c:B.adversarial.cases,kb:Math.round(B.adversarial.bytes/1000),s:B.adversarial.slowest}];
    box.querySelector('.cs-bench').innerHTML=c.bench.map(([big,small],i)=>`<div style="--i:${i}"><b>${esc(csFill(big,vals[i]))}</b><small>${esc(csFill(small,vals[i]))}</small></div>`).join('');
  }
  function initContextsec() {
    const box=$('.cs-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    const go=()=>{ csStatic(); csPaint(); };
    if(csData) go(); else fetch('/assets/contextsec/showcase.json?v=1').then(r=>r.json()).then(d=>{csData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{ const b=event.target.closest('[data-cs-p]'); if(b){ csState.p=Number(b.dataset.csP); csPaint(); } });
  root.addEventListener('keydown',event=>{
    const b=event.target.closest?.('[data-cs-p]'); if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||!csData) return;
    event.preventDefault(); const n=csData.products.length;
    csState.p=event.key==='Home'?0:event.key==='End'?n-1:(csState.p+(event.key==='ArrowRight'?1:n-1))%n; csPaint(); $(`[data-cs-p="${csState.p}"]`)?.focus();
  });
  /* AI Repo Gardener: how it decides, then its real output on the cases of its labeled corpus and one recorded review → apply → restore
     session (assets/gardener/showcase.json, built by tools/gardener_showcase.py from a clean checkout). */
  const RG_EV={en:{ast_similarity:'AST similarity',call_site_migration:'call site moved',inbound_imports:'imports of the old file',iteration_naming:'iteration-style name',replacement_newer:'replacement is newer',replacement_reachable:'replacement is reachable',symbol_overlap:'shared symbols',token_similarity:'token similarity',unreachable_from_entrypoints:'unreachable from entry points',public_surface_missing_from_replacement:'public names missing',symbols_missing_from_replacement:'symbols missing',public_contract_changed_in_replacement:'public contract changed',
      deployment_runtime_uncertainty:'templated deploy command: {x}',opaque_dynamic_module_discovery:'opaque dynamic loading: {x}',repository_parse_errors:'file that does not parse: {x}',possible_external_package_module:'package module: outside code may import it',replacement_changed_public_contract:'replacement changes the public contract',replacement_missing_public_surface:'replacement drops public names',replacement_missing_symbols:'replacement drops symbols',dynamic_or_external_symbol_use_may_be_unknown:'dynamic or external use may be invisible',public_symbol_may_be_external_api:'public name may be an external API',
      yes:'yes',no:'no',review_only:'review only',review:'review',safe_delete_candidate:'delete candidate'},
    'zh-TW':{ast_similarity:'AST 相似度',call_site_migration:'呼叫點已搬走',inbound_imports:'仍 import 舊檔的地方',iteration_naming:'迭代式命名（_old、_v2…）',replacement_newer:'取代檔比較新',replacement_reachable:'取代檔可達',symbol_overlap:'共同符號比例',token_similarity:'token 相似度',unreachable_from_entrypoints:'從進入點到不了',public_surface_missing_from_replacement:'少掉的公開名稱',symbols_missing_from_replacement:'少掉的符號',public_contract_changed_in_replacement:'改變的公開契約',
      deployment_runtime_uncertainty:'部署指令是樣板：{x}',opaque_dynamic_module_discovery:'追蹤不到的動態載入：{x}',repository_parse_errors:'無法解析的檔案：{x}',possible_external_package_module:'套件內模組：外部程式可能會 import',replacement_changed_public_contract:'取代檔改變了公開契約',replacement_missing_public_surface:'取代檔少了公開名稱',replacement_missing_symbols:'取代檔少了符號',dynamic_or_external_symbol_use_may_be_unknown:'可能有看不到的動態或外部使用',public_symbol_may_be_external_api:'公開名稱可能是外部 API',
      yes:'是',no:'否',review_only:'僅供審查',review:'審查',safe_delete_candidate:'可刪候選'},
    'zh-CN':{ast_similarity:'AST 相似度',call_site_migration:'调用点已迁走',inbound_imports:'仍 import 旧文件的地方',iteration_naming:'迭代式命名（_old、_v2…）',replacement_newer:'替代文件更新',replacement_reachable:'替代文件可达',symbol_overlap:'共同符号比例',token_similarity:'token 相似度',unreachable_from_entrypoints:'从入口到达不了',public_surface_missing_from_replacement:'缺少的公开名称',symbols_missing_from_replacement:'缺少的符号',public_contract_changed_in_replacement:'改变的公开契约',
      deployment_runtime_uncertainty:'部署命令是模板：{x}',opaque_dynamic_module_discovery:'无法追踪的动态加载：{x}',repository_parse_errors:'无法解析的文件：{x}',possible_external_package_module:'包内模块：外部代码可能会 import',replacement_changed_public_contract:'替代文件改变了公开契约',replacement_missing_public_surface:'替代文件缺少公开名称',replacement_missing_symbols:'替代文件缺少符号',dynamic_or_external_symbol_use_may_be_unknown:'可能有看不到的动态或外部使用',public_symbol_may_be_external_api:'公开名称可能是外部 API',
      yes:'是',no:'否',review_only:'仅供审查',review:'审查',safe_delete_candidate:'可删候选'}};
  const rgCopy=()=>({
    en:{note:'Everything below is the real output of AI Repo Gardener {v}, re-run for this page: the cases of its labeled corpus and one full review-to-restore session. It is static analysis for Python repositories. It never calls a model, uploads code or runs your program, except the validation command you give it, and only in a throwaway copy.',
      archTitle:'How it decides',
      arch:[['Iteration diff','Compares the commit before the agent’s work with everything after it: committed, staged, unstaged and untracked.'],
        ['Reachability','Builds the import graph from real roots: entry points, framework apps, Dockerfile, Compose or Procfile commands, packaging entry points.'],
        ['Replacement evidence','For an old file, finds the new one that took over: AST, symbol and token similarity, moved call sites, public names kept.'],
        ['Risk gate','Only a stale file with a replacement, confidence ≥ 0.85 and risk ≤ 0.20 is proposed. eval, dynamic imports, parse errors or templated deploy commands switch deletion off for the whole repository.'],
        ['Reviewed plan','Deleting needs the exact JSON plan a person reviewed, a validation command that passes in an isolated copy, and hashes that still match. A snapshot allows a restore.']],
      skillT:'As an Agent Skill',skill:'Codex, Claude Code and Cursor can load it. The agent runs diff, reads the JSON and explains what it found. SKILL.md forbids apply unless you asked for changes and reviewed that exact plan, and commands from the repository’s own config stay untrusted.',
      rules:[['Looks unused ≠ dead','A Dockerfile line, a plugin entry point or a string import keeps a file alive.'],['Confident ≠ safe','Confidence and risk are separate numbers, and both must pass.'],['Tests pass ≠ unused','A green test run does not prove a plugin or public API has no users.'],['Reviewed ≠ permission','The plan is a preview; apply refuses if anything changed since.']],
      demoTitle:'Same rename, different verdicts',demoLede:'Eleven cases from its labeled corpus. In each one the agent renamed a module and moved the call site; one extra fact decides whether the old file may go. Every verdict below is what the tool printed, and each matches the case’s label.',
      verdict:{safe_delete_candidate:['DELETE CANDIDATE','Goes into the deletion plan for review.'],review:['REVIEW ONLY','Reported, never deleted automatically.'],keep:['KEEP','No finding: the old file is still live.']},
      label:'Label',labels:{DELETE:'delete',KEEP:'keep',REVIEW:'review'},match:'matches',
      repoT:'The repository after the agent’s change',state:{added:'new',modified:'changed',unchanged:'untouched',removed:'removed'},decides:'decides it',old:'old file',
      sawT:'What it measured',conf:'Confidence',risk:'Risk',needC:'needs ≥ {v}',needR:'needs ≤ {v}',evT:'Evidence',risksT:'Risk flags',blockT:'Blocks every deletion in the repository',
      keepT:'Why it stays',why:{ref:'{m} is started by {f}',entry:'{m} is an entry point',reach:'{r} of {p} modules are reachable, {m} among them'},
      plan:n=>n?`Deletion plan: ${n} operation`:'Deletion plan: empty',also:'Also reported',cli:'CLI output',
      cases:{'delete-parser-old':['Plain rename','The agent copied parser_old.py to parser.py and pointed app.py at it. Nothing else refers to the old file.'],
        'keep-docker-python-module':['Dockerfile still runs it','The container still starts with python -m worker_old, so the old module is a live runtime root.'],
        'keep-compose-uvicorn-module':['Compose still serves it','compose.yaml runs uvicorn web_old:app: production still imports the old file.'],
        'keep-pyproject-entrypoint':['Registered plugin','pyproject.toml registers plugin_old:run as an entry point, so other packages can load it by name.'],
        'keep-runtime-import-module':['Imported by a string','app.py moved its import, but import_module(\'handler_old\') still loads the old module at run time.'],
        'review-partial-replacement':['Replacement lost a function','parser.py kept parse() but dropped legacy(). Deleting the old file would delete a public function.'],
        'review-public-contract-change':['Contract changed','client.py changed MODE and dropped fetch’s timeout parameter: similar code, different behaviour.'],
        'review-package-public-surface':['Inside a package','pkg/format_old.py sits in an importable package. Code outside this repository may import it, so by default it is review-only.'],
        'review-repository-parse-error':['A file that does not parse','broken.py has a syntax error. With part of the repository unreadable, automatic deletion is off everywhere.'],
        'review-dynamic-deployment-command':['Templated start command','The Dockerfile starts ${APP_MODULE}:app. The module is only known at deploy time, so no file can be proven dead.'],
        'review-eval-runtime-loader':['eval() loads a module','app.py loads the old module inside eval(). Reachability becomes opaque, so deletion is switched off for the whole repository.']},
      sessT:'Review first, apply exactly what you reviewed',sessLede:'One real session on the plain-rename case, recorded command by command. The plan ID binds both commits, the configuration and the hash of every file involved.',
      steps:{review:['Review','diff finds the rename; the dry-run writes the plan a person reviews. Nothing changes on disk.'],
        'failed-validation':['Validation fails','Apply first deletes parser_old.py in a throwaway copy and runs the validation there. This check still needs the old module, so it fails and the real repository is left alone.'],
        'stale-plan':['Changed after review','After the review someone edits parser.py ({from} → {to}). The plan no longer matches the repository, so apply refuses before validating anything. (The edit is undone before the next step.)'],
        apply:['Apply','The same reviewed plan with a passing validation: the file is deleted and a snapshot is kept. A new diff finds nothing left to clean.'],
        restore:['Restore','fix --restore brings parser_old.py back from the snapshot, byte for byte.']},
      filesT:'Files',same:'as reviewed',changed:'changed',gone:'deleted',statusT:'git status',clean:'clean',exit:'exit {n}',pinT:'What the plan ID pins',
      pins:{base_sha:'base commit',head_sha:'HEAD commit',config_sha256:'effective config',accepted_sha256:'accepted-findings ledger',candidate:'candidate',replacement:'replacement',evidence:'call site'},
      benchTitle:'Published gates',
      bench:[['{tp}/{pos}','deletable files found in the labeled corpus, with {fp} of {neg} live or uncertain files proposed (re-run for this page)'],['{fp} / {n}','adversarial variants where live code looks unused became deletion candidates'],['{ok}/{all}','tests passed on Python {py} for this page; {sk} symlink tests skipped for lack of a Windows privilege'],['{c}','automatic-deletion candidates in {n} pinned real repositories ({files} Python files): {names}; {v}, measured {d}']],
      benchNote:'The corpus and the adversarial variants are written by the maintainer, so they show that the gates hold and do not regress, not accuracy on every Python repository.',
      src:'Data: AI Repo Gardener {v} · commit {c} · run {d}'},
    'zh-TW':{note:'以下全部是 AI Repo Gardener {v} 為這一頁重新執行的真實輸出：它的標註語料裡的案例，加上一次從審查到還原的完整操作。它是針對 Python repo 的靜態分析，不呼叫模型、不上傳程式碼，也不執行你的程式；唯一會執行的是你指定的驗證指令，而且只在拋棄式副本裡跑。',
      archTitle:'它怎麼判斷',
      arch:[['迭代差異','比對 AI 動手前的 commit 和之後的一切：已提交、已暫存、未暫存和未追蹤的檔案。'],
        ['可達性','從真正的入口建 import 圖：程式進入點、框架 app、Dockerfile／Compose／Procfile 的啟動指令、套件的 entry point。'],
        ['取代證據','替舊檔找出接手的新檔：AST、符號與 token 相似度、呼叫點有沒有搬過去、公開名稱有沒有保留。'],
        ['風險閘門','只有「有取代檔的過期檔案、信心 ≥ 0.85、風險 ≤ 0.20」會被提議刪除。只要出現 eval、動態 import、解析錯誤或樣板化的部署指令，整個 repo 的自動刪除都會關閉。'],
        ['審過的計畫','刪除需要人審過的那份 JSON 計畫、在隔離副本裡通過的驗證指令，以及仍然吻合的雜湊；另外留有快照可以還原。']],
      skillT:'當成 Agent Skill 使用',skill:'Codex、Claude Code、Cursor 都能載入它。代理執行 diff、讀 JSON，再把發現講給你聽。SKILL.md 規定：除非你要求修改、而且審過那份計畫，否則不能 apply；repo 自己設定檔裡的指令一律視為不可信。',
      rules:[['看起來沒用 ≠ 死碼','一行 Dockerfile、一個 plugin 註冊或一個字串 import，都能讓檔案繼續活著。'],['有信心 ≠ 安全','信心和風險是兩個分開的數字，兩個都要過門檻。'],['測試通過 ≠ 沒人用','測試全綠，不代表外掛或公開 API 沒有使用者。'],['審過 ≠ 可以刪','計畫只是預覽；審完之後只要有任何變動，apply 就會拒絕。']],
      demoTitle:'同樣的改名，不同的判斷',demoLede:'標註語料裡的 11 個案例。每個案例裡，AI 都把模組改了名、把呼叫點搬過去；決定舊檔能不能刪的，是多出來的那一個事實。下面每個判斷都是工具實際印出來的，也都和案例的標註一致。',
      verdict:{safe_delete_candidate:['可刪候選','進入刪除計畫，等人審查。'],review:['僅供審查','會回報，但永遠不會自動刪除。'],keep:['保留','沒有發現：舊檔仍然在用。']},
      label:'標註',labels:{DELETE:'刪除',KEEP:'保留',REVIEW:'審查'},match:'一致',
      repoT:'AI 改完之後的 repo',state:{added:'新增',modified:'修改',unchanged:'未動',removed:'刪除'},decides:'關鍵',old:'舊檔',
      sawT:'它量到什麼',conf:'信心',risk:'風險',needC:'需要 ≥ {v}',needR:'需要 ≤ {v}',evT:'證據',risksT:'風險標記',blockT:'擋下整個 repo 的所有刪除',
      keepT:'為什麼留著',why:{ref:'{m} 由 {f} 啟動',entry:'{m} 是進入點',reach:'{p} 個模組中有 {r} 個可達，{m} 也在其中'},
      plan:n=>n?`刪除計畫：${n} 項操作`:'刪除計畫：空的',also:'另外回報',cli:'CLI 輸出',
      cases:{'delete-parser-old':['單純改名','AI 把 parser_old.py 複製成 parser.py，並讓 app.py 改用新檔。沒有其他地方再用到舊檔。'],
        'keep-docker-python-module':['Dockerfile 還在跑它','容器仍然用 python -m worker_old 啟動，所以舊模組是正在運作的入口。'],
        'keep-compose-uvicorn-module':['Compose 還在服務它','compose.yaml 執行 uvicorn web_old:app：正式環境還在 import 舊檔。'],
        'keep-pyproject-entrypoint':['已註冊的外掛','pyproject.toml 把 plugin_old:run 註冊成 entry point，其他套件可以用名字載入它。'],
        'keep-runtime-import-module':['用字串 import','app.py 的 import 已經換掉，但 import_module(\'handler_old\') 執行時仍會載入舊模組。'],
        'review-partial-replacement':['取代檔少了一個函式','parser.py 保留了 parse()，卻少了 legacy()。刪掉舊檔等於刪掉一個公開函式。'],
        'review-public-contract-change':['契約變了','client.py 改了 MODE，也拿掉 fetch 的 timeout 參數：程式碼很像，行為卻不同。'],
        'review-package-public-surface':['在套件裡面','pkg/format_old.py 位於可被 import 的套件中，repo 外的程式可能在用，所以預設只能審查。'],
        'review-repository-parse-error':['有檔案無法解析','broken.py 有語法錯誤。repo 有一部分讀不懂，自動刪除就全面關閉。'],
        'review-dynamic-deployment-command':['樣板化的啟動指令','Dockerfile 啟動的是 ${APP_MODULE}:app，要到部署時才知道是哪個模組，所以沒有檔案能被證明已死。'],
        'review-eval-runtime-loader':['用 eval() 載入模組','app.py 在 eval() 裡載入舊模組，可達性變得無法追蹤，所以整個 repo 的刪除都關閉。']},
      sessT:'先審查，只套用你審過的那一份',sessLede:'用「單純改名」案例實際操作一次，逐條指令記錄下來。計畫 ID 綁定了兩個 commit、設定，以及每個相關檔案的雜湊。',
      steps:{review:['審查','diff 找到改名；dry-run 寫出給人審查的計畫。磁碟上什麼都沒變。'],
        'failed-validation':['驗證失敗','apply 會先在拋棄式副本裡刪掉 parser_old.py，再在那裡跑驗證。這個檢查還需要舊模組，所以失敗，真正的 repo 完全沒被動到。'],
        'stale-plan':['審完又被改','審查之後有人改了 parser.py（{from} → {to}）。計畫和 repo 對不上，apply 在驗證之前就拒絕。（進下一步前已把修改還原。）'],
        apply:['套用','同一份審過的計畫，加上會通過的驗證：檔案被刪除，並留下快照。重新 diff，已經沒有要清的東西。'],
        restore:['還原','fix --restore 從快照把 parser_old.py 放回來，一個位元組都不差。']},
      filesT:'檔案',same:'與審查時相同',changed:'已改變',gone:'已刪除',statusT:'git status',clean:'乾淨',exit:'結束碼 {n}',pinT:'計畫 ID 綁定了什麼',
      pins:{base_sha:'基準 commit',head_sha:'HEAD commit',config_sha256:'實際設定',accepted_sha256:'已接受發現清單',candidate:'候選檔',replacement:'取代檔',evidence:'呼叫點'},
      benchTitle:'公開的關卡',
      bench:[['{tp}/{pos}','標註語料中該刪的檔案全部找到；{neg} 個仍在用或不確定的檔案，被提議刪除的有 {fp} 個（為這一頁重跑）'],['{fp} / {n}','「活的程式看起來沒用」的對抗變體中，變成刪除候選的數量'],['{ok}/{all}','測試在 Python {py} 上為這一頁重跑通過；{sk} 個 symlink 測試因 Windows 權限不足而跳過'],['{c}','{n} 個釘選版本的真實 repo（共 {files} 個 Python 檔）中的自動刪除候選：{names}；{v} 於 {d} 測量']],
      benchNote:'語料和對抗變體都是維護者自己寫的，證明的是關卡守得住、不會退步，不是對所有 Python repo 的準確率。',
      src:'資料：AI Repo Gardener {v} · commit {c} · 執行於 {d}'},
    'zh-CN':{note:'以下全部是 AI Repo Gardener {v} 为这一页重新运行的真实输出：它的标注语料里的案例，加上一次从审查到还原的完整操作。它是针对 Python 仓库的静态分析，不调用模型、不上传代码，也不运行你的程序；唯一会运行的是你指定的验证命令，而且只在一次性副本里跑。',
      archTitle:'它怎么判断',
      arch:[['迭代差异','比对 AI 动手前的 commit 和之后的一切：已提交、已暂存、未暂存和未跟踪的文件。'],
        ['可达性','从真正的入口建 import 图：程序入口、框架 app、Dockerfile／Compose／Procfile 的启动命令、包的 entry point。'],
        ['替代证据','为旧文件找出接手的新文件：AST、符号与 token 相似度、调用点有没有迁过去、公开名称有没有保留。'],
        ['风险闸门','只有“有替代文件的过期文件、置信度 ≥ 0.85、风险 ≤ 0.20”会被提议删除。只要出现 eval、动态 import、解析错误或模板化的部署命令，整个仓库的自动删除都会关闭。'],
        ['审过的计划','删除需要人审过的那份 JSON 计划、在隔离副本里通过的验证命令，以及仍然吻合的哈希；另外留有快照可以还原。']],
      skillT:'作为 Agent Skill 使用',skill:'Codex、Claude Code、Cursor 都能加载它。代理运行 diff、读 JSON，再把发现讲给你听。SKILL.md 规定：除非你要求修改、而且审过那份计划，否则不能 apply；仓库自己配置文件里的命令一律视为不可信。',
      rules:[['看起来没用 ≠ 死代码','一行 Dockerfile、一个插件注册或一个字符串 import，都能让文件继续活着。'],['有把握 ≠ 安全','置信度和风险是两个分开的数字，两个都要过门槛。'],['测试通过 ≠ 没人用','测试全绿，不代表插件或公开 API 没有使用者。'],['审过 ≠ 可以删','计划只是预览；审完之后只要有任何变动，apply 就会拒绝。']],
      demoTitle:'同样的改名，不同的判断',demoLede:'标注语料里的 11 个案例。每个案例里，AI 都把模块改了名、把调用点迁过去；决定旧文件能不能删的，是多出来的那一个事实。下面每个判断都是工具实际打印出来的，也都和案例的标注一致。',
      verdict:{safe_delete_candidate:['可删候选','进入删除计划，等人审查。'],review:['仅供审查','会报告，但永远不会自动删除。'],keep:['保留','没有发现：旧文件仍然在用。']},
      label:'标注',labels:{DELETE:'删除',KEEP:'保留',REVIEW:'审查'},match:'一致',
      repoT:'AI 改完之后的仓库',state:{added:'新增',modified:'修改',unchanged:'未动',removed:'删除'},decides:'关键',old:'旧文件',
      sawT:'它量到什么',conf:'置信度',risk:'风险',needC:'需要 ≥ {v}',needR:'需要 ≤ {v}',evT:'证据',risksT:'风险标记',blockT:'挡下整个仓库的所有删除',
      keepT:'为什么留着',why:{ref:'{m} 由 {f} 启动',entry:'{m} 是入口',reach:'{p} 个模块中有 {r} 个可达，{m} 也在其中'},
      plan:n=>n?`删除计划：${n} 项操作`:'删除计划：空的',also:'另外报告',cli:'CLI 输出',
      cases:{'delete-parser-old':['单纯改名','AI 把 parser_old.py 复制成 parser.py，并让 app.py 改用新文件。没有其他地方再用到旧文件。'],
        'keep-docker-python-module':['Dockerfile 还在跑它','容器仍然用 python -m worker_old 启动，所以旧模块是正在运行的入口。'],
        'keep-compose-uvicorn-module':['Compose 还在服务它','compose.yaml 运行 uvicorn web_old:app：生产环境还在 import 旧文件。'],
        'keep-pyproject-entrypoint':['已注册的插件','pyproject.toml 把 plugin_old:run 注册成 entry point，其他包可以用名字加载它。'],
        'keep-runtime-import-module':['用字符串 import','app.py 的 import 已经换掉，但 import_module(\'handler_old\') 运行时仍会加载旧模块。'],
        'review-partial-replacement':['替代文件少了一个函数','parser.py 保留了 parse()，却少了 legacy()。删掉旧文件等于删掉一个公开函数。'],
        'review-public-contract-change':['契约变了','client.py 改了 MODE，也去掉了 fetch 的 timeout 参数：代码很像，行为却不同。'],
        'review-package-public-surface':['在包里面','pkg/format_old.py 位于可被 import 的包中，仓库外的代码可能在用，所以默认只能审查。'],
        'review-repository-parse-error':['有文件无法解析','broken.py 有语法错误。仓库有一部分读不懂，自动删除就全面关闭。'],
        'review-dynamic-deployment-command':['模板化的启动命令','Dockerfile 启动的是 ${APP_MODULE}:app，要到部署时才知道是哪个模块，所以没有文件能被证明已死。'],
        'review-eval-runtime-loader':['用 eval() 加载模块','app.py 在 eval() 里加载旧模块，可达性变得无法追踪，所以整个仓库的删除都关闭。']},
      sessT:'先审查，只应用你审过的那一份',sessLede:'用“单纯改名”案例实际操作一次，逐条命令记录下来。计划 ID 绑定了两个 commit、配置，以及每个相关文件的哈希。',
      steps:{review:['审查','diff 找到改名；dry-run 写出给人审查的计划。磁盘上什么都没变。'],
        'failed-validation':['验证失败','apply 会先在一次性副本里删掉 parser_old.py，再在那里跑验证。这个检查还需要旧模块，所以失败，真正的仓库完全没被动到。'],
        'stale-plan':['审完又被改','审查之后有人改了 parser.py（{from} → {to}）。计划和仓库对不上，apply 在验证之前就拒绝。（进下一步前已把修改还原。）'],
        apply:['应用','同一份审过的计划，加上会通过的验证：文件被删除，并留下快照。重新 diff，已经没有要清的东西。'],
        restore:['还原','fix --restore 从快照把 parser_old.py 放回来，一个字节都不差。']},
      filesT:'文件',same:'与审查时相同',changed:'已改变',gone:'已删除',statusT:'git status',clean:'干净',exit:'退出码 {n}',pinT:'计划 ID 绑定了什么',
      pins:{base_sha:'基准 commit',head_sha:'HEAD commit',config_sha256:'实际配置',accepted_sha256:'已接受发现清单',candidate:'候选文件',replacement:'替代文件',evidence:'调用点'},
      benchTitle:'公开的关卡',
      bench:[['{tp}/{pos}','标注语料中该删的文件全部找到；{neg} 个仍在用或不确定的文件，被提议删除的有 {fp} 个（为这一页重跑）'],['{fp} / {n}','“活的代码看起来没用”的对抗变体中，变成删除候选的数量'],['{ok}/{all}','测试在 Python {py} 上为这一页重跑通过；{sk} 个 symlink 测试因 Windows 权限不足而跳过'],['{c}','{n} 个固定版本的真实仓库（共 {files} 个 Python 文件）中的自动删除候选：{names}；{v} 于 {d} 测量']],
      benchNote:'语料和对抗变体都是维护者自己写的，证明的是关卡守得住、不会退步，不是对所有 Python 仓库的准确率。',
      src:'数据：AI Repo Gardener {v} · commit {c} · 运行于 {d}'}}[locale]);
  let rgData=null;
  const rgState={c:0,s:0};
  const rgEv=()=>RG_EV[locale]||RG_EV.en;
  const rgMod=path=>path.replace(/\.py$/,'').replace(/\//g,'.');
  // line diff (LCS) for the few-line files of a case
  function rgDiff(a,b) {
    const x=a.split('\n'),y=b.split('\n'),L=x.map(()=>Array(y.length+1).fill(0)).concat([Array(y.length+1).fill(0)]),out=[];
    for(let i=x.length-1;i>=0;i--) for(let j=y.length-1;j>=0;j--) L[i][j]=x[i]===y[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
    let i=0,j=0;
    while(i<x.length&&j<y.length){ if(x[i]===y[j]){out.push([' ',x[i]]);i++;j++;} else if(L[i+1][j]>=L[i][j+1]) out.push(['-',x[i++]]); else out.push(['+',y[j++]]); }
    while(i<x.length) out.push(['-',x[i++]]); while(j<y.length) out.push(['+',y[j++]]);
    return out;
  }
  const rgTerm=text=>esc(text).split('\n').map(l=>`<span class="${/^error:/.test(l)?'t-err':/^WARNING/.test(l)?'t-warn':/^\[(HIGH|MEDIUM|LOW)\]/.test(l)?'t-find':/^(Applied|Restored)/.test(l)?'t-ok':/^\s+!/.test(l)?'t-risk':''}">${l||' '}</span>`).join('\n');
  function rgShowcase() {
    const c=rgCopy();
    return `<section class="rg-show"><p class="rg-note"><b translate="no"></b><span class="rg-note-t"></span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="rg-flow">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="rg-n">${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <p class="rg-skill"><b>${esc(c.skillT)}</b><span>${esc(c.skill)}</span></p>
      <div class="rg-rules">${c.rules.map(([t,d])=>`<div><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
      <h2>${esc(c.demoTitle)}</h2><p class="screen-intro">${esc(c.demoLede)}</p>
      <div class="rg-demo"><div class="rg-cases" role="tablist" aria-label="${esc(c.demoTitle)}"></div><div class="rg-stage" role="tabpanel" aria-live="polite"></div><p class="rg-src"></p></div>
      <h2>${esc(c.sessT)}</h2><p class="screen-intro">${esc(c.sessLede)}</p>
      <div class="rg-demo rg-sess"><div class="rg-steps" role="tablist" aria-label="${esc(c.sessT)}"></div><div class="rg-sstage" role="tabpanel" aria-live="polite"></div></div>
      <h2>${esc(c.benchTitle)}</h2><div class="rg-bench"></div><p class="comment-line">${esc(c.benchNote)}</p></section>`;
  }
  function rgPaint() {
    const box=$('.rg-show'); if(!box||!rgData) return;
    const c=rgCopy(), E=rgEv(), D=rgData, C=D.cases[rgState.c], F=C.finding, G=D.gate;
    const verdictOf=k=>k.finding?.recommendation||'keep';
    box.querySelector('.rg-cases').innerHTML=D.cases.map((k,i)=>`<button type="button" role="tab" data-rg-c="${i}" aria-selected="${i===rgState.c}" tabindex="${i===rgState.c?0:-1}"><i class="v-${esc(verdictOf(k))}" aria-hidden="true"></i>${esc((c.cases[k.id]||[k.id])[0])}</button>`).join('');
    const v=verdictOf(C), [vt,vs]=c.verdict[v]||[v,''], [name,desc]=c.cases[C.id]||[C.id,''];
    const files=C.files.map(f=>{
      const lines=f.state==='modified'?rgDiff(f.was,f.code):f.code.split('\n').map(l=>[' ',l]);
      const tags=[f.path===C.key?`<em class="rg-key">${esc(c.decides)}</em>`:'',f.path===C.target?`<em class="rg-old">${esc(c.old)}</em>`:''].join('');
      return `<div class="rg-file s-${esc(f.state)}${f.path===C.key?' is-key':''}"><p><code translate="no">${esc(f.path)}</code><span>${esc(c.state[f.state]||f.state)}</span>${tags}</p><pre translate="no"><code>${lines.map(([m,l])=>`<span class="${m==='+'?'d-add':m==='-'?'d-del':''}">${m===' '?'  ':m+' '}${esc(l)}</span>`).join('')}</code></pre></div>`; }).join('');
    const fmt=val=>typeof val==='boolean'?E[val?'yes':'no']:Array.isArray(val)?val.join(', '):typeof val==='number'?String(val):val;
    const riskText=r=>{ const [k,...rest]=r.split(':'); const x=rest.join(':').replace(/^\d+:/,''); return (E[k]||k).replace('{x}',x); };
    let saw;
    if(F){
      const meter=(label,val,lim,ok,need)=>`<div class="rg-meter${ok?' is-ok':' is-no'}"><p><b>${esc(label)}</b><em>${Math.round(val*100)}%</em><small>${esc(need)}</small><i aria-hidden="true">${ok?'✓':'✕'}</i></p><span class="rg-bar"><span style="--v:${val}"></span><u style="--t:${lim}"></u></span></div>`;
      saw=`${meter(c.conf,F.confidence,G.confidence,F.confidence>=G.confidence,csFill(c.needC,{v:G.confidence}))}${meter(c.risk,F.risk,G.risk,F.risk<=G.risk,csFill(c.needR,{v:G.risk.toFixed(2)}))}
        <h3>${esc(c.evT)}</h3><ul class="rg-ev">${F.evidence.map(([k,val])=>`<li><span>${esc(E[k]||k)}</span><code translate="no">${esc(fmt(val))}</code></li>`).join('')}</ul>
        ${F.risks.length?`<h3>${esc(c.risksT)}</h3><ul class="rg-risks">${F.risks.map(r=>`<li>${esc(riskText(r))}</li>`).join('')}</ul>`:''}`;
    } else {
      const m=rgMod(C.target), M=C.metrics, refs=M.runtime_refs[m];
      const why=refs?csFill(c.why.ref,{m,f:refs.join(', ')}):M.entrypoints.includes(m)?csFill(c.why.entry,{m}):csFill(c.why.reach,{r:M.reachable,p:M.python_files,m});
      saw=`<p class="rg-keep"><code translate="no">${esc(C.target)}</code><span>${esc(why)}</span></p>`;
    }
    // the plan states its blockers in English; map the known ones onto the translated risk wording
    const blockers=[...C.plan.blockers.map(b=>{ const m=b.match(/could not be parsed: (.+)$/)||b.match(/^opaque runtime module discovery: (.+)$/); return m?riskText((/parsed/.test(b)?'repository_parse_errors:':'opaque_dynamic_module_discovery:')+m[1]):b; }),...C.metrics.uncertainty.map(u=>riskText('deployment_runtime_uncertainty:'+u))];
    const others=C.others.map(o=>`<li><code translate="no">${esc(o.rule)} · ${esc(o.path)}</code><span>${esc(E[o.recommendation]||o.recommendation)}</span></li>`).join('');
    box.querySelector('.rg-stage').innerHTML=`<div class="rg-head"><div><b>${esc(name)}</b><small>${esc(desc)}</small><span class="rg-meta">${esc(c.label)} <b translate="no">${esc(c.labels[C.label]||C.label)}</b> · ${esc(c.match)} ✓</span></div>
      <div class="rg-verdict v-${esc(v)}"><em>${esc(vt)}</em><small>${esc(vs)}</small></div></div>
      <div class="rg-cols v-${esc(v)}"><div><h3>${esc(c.repoT)}</h3><div class="rg-files">${files}</div></div>
      <div><h3>${esc(F?c.sawT:c.keepT)}</h3>${saw}${blockers.length?`<p class="rg-block"><b>${esc(c.blockT)}</b>${blockers.map(b=>`<code translate="no">${esc(b)}</code>`).join('')}</p>`:''}
        <p class="rg-plan${C.plan.operations?' has-ops':''}">${esc(c.plan(C.plan.operations))}</p>${others?`<h3>${esc(c.also)}</h3><ul class="rg-others">${others}</ul>`:''}</div></div>
      <details class="rg-cli"><summary>${esc(c.cli)} · <code translate="no">repo-gardener diff . --base HEAD~1</code></summary><pre translate="no"><code>${rgTerm(C.pretty)}</code></pre></details>`;
    box.querySelector('.rg-src').textContent=csFill(c.src,{v:D.source.version,c:D.source.commit.slice(0,7),d:D.source.run});
  }
  function rgPaintStep() {
    const box=$('.rg-show'); if(!box||!rgData) return;
    const c=rgCopy(), S=rgData.session, st=S.steps[rgState.s], P=S.plan, op=P.operations[0];
    box.querySelector('.rg-steps').innerHTML=S.steps.map((s,i)=>`<button type="button" role="tab" data-rg-s="${i}" aria-selected="${i===rgState.s}" tabindex="${i===rgState.s?0:-1}" class="${s.runs.some(r=>r.code)?'is-refused':''}"><span>${i+1}</span>${esc((c.steps[s.id]||[s.id])[0])}</button>`).join('');
    const [title,text]=c.steps[st.id]||[st.id,''];
    const runs=st.runs.map(r=>`<div class="rg-run"><p><code translate="no">$ ${esc(r.cmd)}</code><em class="${r.code?'is-bad':'is-ok'}">${esc(csFill(c.exit,{n:r.code}))}</em></p><pre translate="no"><code>${rgTerm(r.out)}</code></pre></div>`).join('');
    const files=st.files.map(f=>`<li class="${!f.sha?'is-gone':f.same?'':'is-changed'}"><code translate="no">${esc(f.path)}</code><small translate="no">${f.sha?esc(f.sha):'—'}</small><em>${esc(!f.sha?c.gone:f.same?c.same:c.changed)}</em></li>`).join('');
    const pins=st.id==='review'?`<h3>${esc(c.pinT)} · <code translate="no">${esc(P.plan_id)}</code></h3><ul class="rg-pins">${[['base_sha',P.base_sha],['head_sha',P.head_sha],['config_sha256',P.config_sha256],['accepted_sha256',P.accepted_sha256],['candidate',op.candidate_sha256,op.path],['replacement',op.replacement_sha256,op.replacement],['evidence',op.evidence_files[0].sha256,op.evidence_files[0].path]].map(([k,h,p])=>`<li><span>${esc(c.pins[k])}${p?` <code translate="no">${esc(p)}</code>`:''}</span><code translate="no">${esc(h.slice(0,12))}</code></li>`).join('')}</ul>`:'';
    box.querySelector('.rg-sstage').innerHTML=`<div class="rg-shead"><b>${esc(title)}</b><small>${esc(csFill(text,{from:S.tampered.from,to:S.tampered.to}))}</small></div>
      <div class="rg-scols"><div class="rg-term">${runs}</div><div><h3>${esc(c.filesT)}</h3><ul class="rg-sfiles">${files}</ul>
        <h3>${esc(c.statusT)}</h3><pre class="rg-status" translate="no"><code>${esc(st.status||c.clean)}</code></pre>${pins}</div></div>`;
  }
  function rgStatic() {
    const box=$('.rg-show'); if(!box||!rgData) return;
    const c=rgCopy(), D=rgData, K=D.corpus, T=D.tests, R=D.real;
    box.querySelector('.rg-note b').textContent='v'+D.source.version; box.querySelector('.rg-note-t').textContent=csFill(c.note,{v:D.source.version});
    const vals=[{tp:K.TP,pos:K.TP+K.FN,fp:K.FP,neg:K.FP+K.TN},{fp:D.safety.false_positives,n:D.safety.variants},{ok:T.passed,all:T.collected,py:T.python,sk:T.skipped},
      {c:R.candidates,n:R.repos.length,files:R.python_files.toLocaleString('en-US'),names:R.repos.join(', '),v:R.version,d:R.measured}];
    box.querySelector('.rg-bench').innerHTML=c.bench.map(([big,small],i)=>`<div style="--i:${i}"><b>${esc(csFill(big,vals[i]))}</b><small>${esc(csFill(small,vals[i]))}</small></div>`).join('');
  }
  function initGardener() {
    const box=$('.rg-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    const go=()=>{ rgStatic(); rgPaint(); rgPaintStep(); };
    if(rgData) go(); else fetch('/assets/gardener/showcase.json?v=1').then(r=>r.json()).then(d=>{rgData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('[data-rg-c]'); if(b){ rgState.c=Number(b.dataset.rgC); rgPaint(); return; }
    const s=event.target.closest('[data-rg-s]'); if(s){ rgState.s=Number(s.dataset.rgS); rgPaintStep(); }
  });
  root.addEventListener('keydown',event=>{
    const b=event.target.closest?.('[data-rg-c],[data-rg-s]'); if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||!rgData) return;
    event.preventDefault();
    const [key,n,paint,attr]=b.dataset.rgC!==undefined?['c',rgData.cases.length,rgPaint,'data-rg-c']:['s',rgData.session.steps.length,rgPaintStep,'data-rg-s'];
    rgState[key]=event.key==='Home'?0:event.key==='End'?n-1:(rgState[key]+(event.key==='ArrowRight'?1:n-1))%n; paint(); $(`[${attr}="${rgState[key]}"]`)?.focus();
  });
  /* PSG: how a Task Contract bounds an agent, then one governed task recorded command by command on a demo repository,
     and PSG's review-boundary benchmark (assets/psg/showcase.json, built by tools/psg_showcase.py from a clean checkout). */
  const psCopy=()=>({
    en:{note:'Everything below is PSG {v} running on a small demo repository for this page. The script that built it plays the coding agent and writes the edits, including three nobody asked for; every decision you see is PSG’s own output.',
      archTitle:'How it bounds a task',
      arch:[['Task Contract','Opening a task records the intent, acceptance criteria, constraints and non-goals. It starts as a draft with no write authority.'],
        ['Sealed boundary','Context routing seals what may be written, what is read-only and what is forbidden. Reading may grow later; write authority never does.'],
        ['The real diff','PSG reads the final change set from Git itself, not from the agent, and checks it against the boundary, locks and policies.'],
        ['Attested checks','Only checks named in the project config run. Results are runtime-attested and tied to the worktree, so any later edit makes them stale.'],
        ['Bounded review','A finding blocks only if the patch caused it, it breaks an acceptance criterion or a constraint, and the evidence holds. Then the gate says SHIPPABLE and review stops.']],
      skillT:'As an Agent Skill with an MCP server',skill:'Codex, Claude Code and Gemini CLI load the Skill and call PSG through MCP. An agent cannot widen its own write scope, send arbitrary shell commands, decide whether its own finding blocks, or mint approval: approvals need an interactive terminal and a typed APPROVE.',
      rules:[['Review the task, not the universe','Unrelated findings become follow-up work instead of reopening the task.'],['Reading ≠ write authority','Context can expand; the sealed write boundary cannot.'],['Claimed ≠ attested','Agent statements stay CLAIMED until the runtime or the user attests them.'],['Severity ≠ scope','A major bug outside the task is recorded, not blocking.']],
      demoTitle:'One task, from contract to SHIPPABLE',demoLede:'A shop with a rounding bug in src/pricing.py, a partner API whose signatures are frozen, and a legacy export nobody may touch. Step through what PSG answered at each command.',
      steps:[['Open','A draft contract'],['Seal','The boundary'],['Agent edits','Rejected'],['Only the fix','Allowed'],['Verify','Attested'],['Ship too early','Blocked'],['Review','Three findings'],['Ship','SHIPPABLE']],
      texts:['The task opens as a draft: it records what was asked, but holds no write authority yet, so any change against it would be rejected.',
        'Building context seals the contract. Only src/pricing.py may be written; the partner API is read-only and the legacy export is forbidden. The check that tests the fix is pulled in as reading context.',
        'The agent fixed the bug, and also added a currency parameter to the partner API, modernised the legacy export and created a helper module. PSG read the real diff from Git and rejected all three extras.',
        'With the extras reverted, the diff holds only the requested fix, and the same validation passes.',
        'PSG runs the one check named in the project config, not a command the agent chose. The result is runtime-attested and bound to this exact worktree.',
        'Asking to ship before the acceptance criterion has evidence: the gate says BLOCKED and recommends a targeted fix, not a new review.',
        'The criterion now points at the attested check. A reviewer reports three findings; PSG derives whether each blocks from its relation to the task and its evidence.',
        'One review round of two used, no current-task blockers: the gate returns SHIPPABLE and takes a snapshot. The three findings stay visible as follow-up work.'],
      board:'Repository',role:{write:'write',read_only:'read-only',forbidden:'forbidden',read:'context',other:'untouched',new:'new file'},
      contract:'Task Contract',intent:'Intent',ac:'Acceptance criterion',constraint:'Constraint',nongoal:'Non-goal',state:'State',requested:'Requested scope',
      seal:'Sealed',hash:'Contract hash',tokens:'{n} of {b} tokens',tokensT:'Context',approvalT:'Scope approval needed',yes:'yes',no:'no',
      viol:{read_only:'read-only file changed',forbidden_or_frozen:'forbidden file changed',outside_write_scope:'outside the write scope: request context expansion first'},
      allowed:'allowed',rejected:'rejected',checkOut:'Check output',tier:'Trust',
      gateT:'Ship gate',gate:[['policy','Final diff within the boundary'],['verification','Trusted, fresh functional check'],['acceptance','Acceptance criteria passed'],['issues','No current-task blocker or major'],['review','Independent review (high risk only)'],['budgets','Within review and fix budgets']],
      pending:'not evaluated yet',na:'not required at low risk',
      issueT:'Findings',rel:{caused_by_patch:'caused by the patch',violates_acceptance:'breaks an acceptance criterion',violates_project_constraint:'breaks a constraint',pre_existing:'pre-existing',unrelated:'unrelated',future_improvement:'future improvement'},
      why:{pre_existing:'already true before the task',future_improvement:'desirable later, not this task',insufficient:'no concrete evidence',severity:'minor severity',blocks:'blocks the task'},
      blocks:'blocks',follow:'follow-up',sufficient:'evidence sufficient',insufficient:'evidence insufficient',
      reviewRound:'Review round {u} of {b}',snapshot:'Snapshot {s}',followUps:'{n} follow-up findings kept',
      benchTitle:'Which findings may block?',benchLede:'PSG’s review-boundary benchmark, re-run for this page: ten findings with different severity, relation and evidence. PSG must block exactly the four that should block.',
      cols:['Finding','Severity','Relation','Evidence','Expected','PSG'],blockWord:'block',passWord:'follow-up',
      benchSum:'{c}/{n} correct · precision {p} · recall {r} · false reopenings {f}',
      numTitle:'Numbers',
      nums:[['{ok}/{all}','tests passed on Python {py} for this page (the version its Windows CI runs)'],['{c}/{n}','review-boundary scenarios decided correctly'],['{a} → {b}','file reads over {t} sequential tasks, with PSG routing ({pct}% fewer)'],['−{tk}%','context tokens in the same run; frozen-file edits blocked, review stopped at its budget']],
      numNote:'The mechanics benchmark uses a small generated repository where the target is already known: it measures routing, not end-to-end agent savings. A historical agent A/B run is kept in the repository but marked superseded, so it is not used here.',
      src:'Data: PSG {v} · commit {c} · run {d}'},
    'zh-TW':{note:'以下全部是 PSG {v} 為這一頁在一個小型示範 repo 上的實際執行結果。產生資料的腳本扮演寫程式的代理、負責改程式，其中還包括三處沒人要求的修改；你看到的每一個判斷都是 PSG 自己的輸出。',
      archTitle:'它怎麼框住一個任務',
      arch:[['任務契約','開任務時記下意圖、驗收條件、限制與非目標。一開始是草稿，沒有任何寫入權限。'],
        ['封存邊界','建立脈絡時封存「哪些檔案能寫、哪些唯讀、哪些禁止」。之後能讀的範圍可以擴大，寫入權限永遠不會。'],
        ['真正的 diff','PSG 自己從 Git 讀最後的變更，而不是聽代理說，再拿去比對邊界、鎖定和政策。'],
        ['可證明的檢查','只會執行專案設定裡列名的檢查。結果由執行環境證明，並綁定當下的工作目錄，之後任何修改都會讓它失效。'],
        ['有邊界的審查','只有「這次修改造成的、違反驗收條件或限制，而且證據成立」的發現能擋下任務。閘門說 SHIPPABLE 時，審查就停。']],
      skillT:'Agent Skill 加上 MCP 伺服器',skill:'Codex、Claude Code、Gemini CLI 會載入這個 Skill，並透過 MCP 呼叫 PSG。代理不能自己擴大寫入範圍、不能送任意 shell 指令、不能自己決定自己的發現會不會擋、也不能自行核准：核准需要互動式終端機，而且要親手輸入 APPROVE。',
      rules:[['審任務，不審整個宇宙','和任務無關的發現會變成後續工作，而不是把任務重新打開。'],['能讀 ≠ 能寫','脈絡可以擴大，封存的寫入邊界不行。'],['宣稱 ≠ 證明','代理說的話一律是 CLAIMED，要由執行環境或使用者證明才算數。'],['嚴重度 ≠ 範圍','任務外的嚴重 bug 會被記錄，但不會擋下這個任務。']],
      demoTitle:'一個任務，從契約到 SHIPPABLE',demoLede:'一個小商店：src/pricing.py 有四捨五入的 bug，合作夥伴 API 的函式簽名已凍結，還有一個誰都不能動的舊匯出模組。逐步看 PSG 在每個指令回了什麼。',
      steps:[['開任務','草稿契約'],['封存','邊界'],['代理修改','被拒絕'],['只留修正','通過'],['驗證','已證明'],['太早出貨','被擋下'],['審查','三個發現'],['出貨','SHIPPABLE']],
      texts:['任務以草稿開啟：記下了要做什麼，但還沒有任何寫入權限，這時候任何修改都會被拒絕。',
        '建立脈絡時封存契約：只有 src/pricing.py 能寫；合作夥伴 API 唯讀，舊匯出模組禁止。用來檢驗修正的檢查腳本被納入閱讀脈絡。',
        '代理修好了 bug，但順手在合作夥伴 API 加了 currency 參數、把舊匯出模組「現代化」，還新增了一個輔助模組。PSG 從 Git 讀出真正的 diff，三處額外修改全部被擋。',
        '把額外修改還原後，diff 只剩要求的修正，同樣的驗證就通過了。',
        'PSG 執行的是專案設定裡列名的那一個檢查，不是代理自己挑的指令。結果由執行環境證明，並綁定這個工作目錄。',
        '驗收條件還沒有證據就要求出貨：閘門回 BLOCKED，建議做針對性修正，而不是再審一輪。',
        '驗收條件改為指向那次已證明的檢查。審查者回報三個發現；PSG 依照它們和任務的關係與證據，自己推導會不會擋。',
        '用了兩輪審查中的一輪，沒有屬於這個任務的阻擋項：閘門回 SHIPPABLE 並建立快照。三個發現保留為後續工作。'],
      board:'Repo',role:{write:'可寫',read_only:'唯讀',forbidden:'禁止',read:'脈絡',other:'未涉及',new:'新檔案'},
      contract:'任務契約',intent:'意圖',ac:'驗收條件',constraint:'限制',nongoal:'非目標',state:'狀態',requested:'申請的範圍',
      seal:'已封存',hash:'契約雜湊',tokens:'{n} / {b} tokens',tokensT:'脈絡',approvalT:'需要範圍核准',yes:'是',no:'否',
      viol:{read_only:'改了唯讀檔案',forbidden_or_frozen:'改了禁止的檔案',outside_write_scope:'超出寫入範圍：要先申請擴大脈絡'},
      allowed:'通過',rejected:'拒絕',checkOut:'檢查輸出',tier:'信任層級',
      gateT:'出貨閘門',gate:[['policy','最終 diff 在邊界內'],['verification','有可信、未過期的功能檢查'],['acceptance','驗收條件已通過'],['issues','沒有屬於本任務的阻擋或重大問題'],['review','獨立審查（只有高風險需要）'],['budgets','在審查與修正次數上限內']],
      pending:'尚未評估',na:'低風險不需要',
      issueT:'審查發現',rel:{caused_by_patch:'修改造成',violates_acceptance:'違反驗收條件',violates_project_constraint:'違反限制',pre_existing:'原本就有',unrelated:'無關',future_improvement:'未來改善'},
      why:{pre_existing:'任務開始前就存在',future_improvement:'值得以後做，但不是這個任務',insufficient:'沒有具體證據',severity:'嚴重度只是 minor',blocks:'會擋下任務'},
      blocks:'阻擋',follow:'後續工作',sufficient:'證據充分',insufficient:'證據不足',
      reviewRound:'審查第 {u} / {b} 輪',snapshot:'快照 {s}',followUps:'保留 {n} 個後續發現',
      benchTitle:'哪些發現能擋下任務？',benchLede:'PSG 的審查邊界評測，為這一頁重新執行：十個嚴重度、關係和證據各不相同的發現，PSG 必須剛好擋下該擋的那四個。',
      cols:['發現','嚴重度','關係','證據','預期','PSG'],blockWord:'擋',passWord:'後續',
      benchSum:'{c}/{n} 正確 · 精確率 {p} · 召回率 {r} · 誤開 {f}',
      numTitle:'數字',
      nums:[['{ok}/{all}','測試在 Python {py} 上為這一頁重跑通過（它的 Windows CI 用的版本）'],['{c}/{n}','審查邊界情境判斷正確'],['{a} → {b}','{t} 個連續任務的讀檔次數，用 PSG 路由後（少 {pct}%）'],['−{tk}%','同一次執行的脈絡 token；凍結檔案的修改被擋、審查在上限停下']],
      numNote:'機制評測用的是一個自動生成的小 repo，而且目標檔案已知：它衡量的是路由機制，不是代理端到端省下多少。repo 裡保留了一次歷史性的代理 A/B 實驗，但已標記為作廢，這裡不採用。',
      src:'資料：PSG {v} · commit {c} · 執行於 {d}'},
    'zh-CN':{note:'以下全部是 PSG {v} 为这一页在一个小型示范仓库上的实际运行结果。生成数据的脚本扮演写代码的代理、负责改代码，其中还包括三处没人要求的修改；你看到的每一个判断都是 PSG 自己的输出。',
      archTitle:'它怎么框住一个任务',
      arch:[['任务契约','开任务时记下意图、验收条件、限制与非目标。一开始是草稿，没有任何写入权限。'],
        ['封存边界','构建上下文时封存“哪些文件能写、哪些只读、哪些禁止”。之后能读的范围可以扩大，写入权限永远不会。'],
        ['真正的 diff','PSG 自己从 Git 读取最终的变更，而不是听代理说，再拿去比对边界、锁定和策略。'],
        ['可证明的检查','只会运行项目配置里列名的检查。结果由运行环境证明，并绑定当前的工作目录，之后任何修改都会让它失效。'],
        ['有边界的审查','只有“这次修改造成的、违反验收条件或限制，而且证据成立”的发现能挡下任务。闸门说 SHIPPABLE 时，审查就停止。']],
      skillT:'Agent Skill 加上 MCP 服务器',skill:'Codex、Claude Code、Gemini CLI 会加载这个 Skill，并通过 MCP 调用 PSG。代理不能自己扩大写入范围、不能发送任意 shell 命令、不能自己决定自己的发现会不会挡、也不能自行批准：批准需要交互式终端，而且要亲手输入 APPROVE。',
      rules:[['审任务，不审整个宇宙','和任务无关的发现会变成后续工作，而不是把任务重新打开。'],['能读 ≠ 能写','上下文可以扩大，封存的写入边界不行。'],['声称 ≠ 证明','代理说的话一律是 CLAIMED，要由运行环境或用户证明才算数。'],['严重度 ≠ 范围','任务外的严重 bug 会被记录，但不会挡下这个任务。']],
      demoTitle:'一个任务，从契约到 SHIPPABLE',demoLede:'一个小商店：src/pricing.py 有四舍五入的 bug，合作伙伴 API 的函数签名已冻结，还有一个谁都不能动的旧导出模块。逐步看 PSG 在每个命令回了什么。',
      steps:[['开任务','草稿契约'],['封存','边界'],['代理修改','被拒绝'],['只留修正','通过'],['验证','已证明'],['太早发布','被挡下'],['审查','三个发现'],['发布','SHIPPABLE']],
      texts:['任务以草稿开启：记下了要做什么，但还没有任何写入权限，这时候任何修改都会被拒绝。',
        '构建上下文时封存契约：只有 src/pricing.py 能写；合作伙伴 API 只读，旧导出模块禁止。用来检验修正的检查脚本被纳入阅读上下文。',
        '代理修好了 bug，但顺手在合作伙伴 API 加了 currency 参数、把旧导出模块“现代化”，还新增了一个辅助模块。PSG 从 Git 读出真正的 diff，三处额外修改全部被挡。',
        '把额外修改还原后，diff 只剩要求的修正，同样的验证就通过了。',
        'PSG 运行的是项目配置里列名的那一个检查，不是代理自己挑的命令。结果由运行环境证明，并绑定这个工作目录。',
        '验收条件还没有证据就要求发布：闸门回 BLOCKED，建议做针对性修正，而不是再审一轮。',
        '验收条件改为指向那次已证明的检查。审查者报告三个发现；PSG 依照它们和任务的关系与证据，自己推导会不会挡。',
        '用了两轮审查中的一轮，没有属于这个任务的阻挡项：闸门回 SHIPPABLE 并创建快照。三个发现保留为后续工作。'],
      board:'仓库',role:{write:'可写',read_only:'只读',forbidden:'禁止',read:'上下文',other:'未涉及',new:'新文件'},
      contract:'任务契约',intent:'意图',ac:'验收条件',constraint:'限制',nongoal:'非目标',state:'状态',requested:'申请的范围',
      seal:'已封存',hash:'契约哈希',tokens:'{n} / {b} tokens',tokensT:'上下文',approvalT:'需要范围批准',yes:'是',no:'否',
      viol:{read_only:'改了只读文件',forbidden_or_frozen:'改了禁止的文件',outside_write_scope:'超出写入范围：要先申请扩大上下文'},
      allowed:'通过',rejected:'拒绝',checkOut:'检查输出',tier:'信任层级',
      gateT:'发布闸门',gate:[['policy','最终 diff 在边界内'],['verification','有可信、未过期的功能检查'],['acceptance','验收条件已通过'],['issues','没有属于本任务的阻挡或重大问题'],['review','独立审查（只有高风险需要）'],['budgets','在审查与修正次数上限内']],
      pending:'尚未评估',na:'低风险不需要',
      issueT:'审查发现',rel:{caused_by_patch:'修改造成',violates_acceptance:'违反验收条件',violates_project_constraint:'违反限制',pre_existing:'原本就有',unrelated:'无关',future_improvement:'未来改进'},
      why:{pre_existing:'任务开始前就存在',future_improvement:'值得以后做，但不是这个任务',insufficient:'没有具体证据',severity:'严重度只是 minor',blocks:'会挡下任务'},
      blocks:'阻挡',follow:'后续工作',sufficient:'证据充分',insufficient:'证据不足',
      reviewRound:'审查第 {u} / {b} 轮',snapshot:'快照 {s}',followUps:'保留 {n} 个后续发现',
      benchTitle:'哪些发现能挡下任务？',benchLede:'PSG 的审查边界评测，为这一页重新运行：十个严重度、关系和证据各不相同的发现，PSG 必须刚好挡下该挡的那四个。',
      cols:['发现','严重度','关系','证据','预期','PSG'],blockWord:'挡',passWord:'后续',
      benchSum:'{c}/{n} 正确 · 精确率 {p} · 召回率 {r} · 误开 {f}',
      numTitle:'数字',
      nums:[['{ok}/{all}','测试在 Python {py} 上为这一页重跑通过（它的 Windows CI 用的版本）'],['{c}/{n}','审查边界情境判断正确'],['{a} → {b}','{t} 个连续任务的读文件次数，用 PSG 路由后（少 {pct}%）'],['−{tk}%','同一次运行的上下文 token；冻结文件的修改被挡、审查在上限停下']],
      numNote:'机制评测用的是一个自动生成的小仓库，而且目标文件已知：它衡量的是路由机制，不是代理端到端省下多少。仓库里保留了一次历史性的代理 A/B 实验，但已标记为作废，这里不采用。',
      src:'数据：PSG {v} · commit {c} · 运行于 {d}'}}[locale]);
  let psData=null;
  const psState={s:0};
  const psDiff=text=>esc(text).split('\n').filter(l=>!/^(index |diff --git)/.test(l)).map(l=>`<span class="${/^\+(?!\+\+)/.test(l)?'d-add':/^-(?!--)/.test(l)?'d-del':/^(@@|new file|---|\+\+\+)/.test(l)?'d-meta':''}">${l||' '}</span>`).join('');
  function psShowcase() {
    const c=psCopy();
    return `<section class="ps-show"><p class="ps-note"><b translate="no"></b><span class="ps-note-t"></span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="ps-flow">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="ps-n">${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <p class="ps-skill"><b>${esc(c.skillT)}</b><span>${esc(c.skill)}</span></p>
      <div class="ps-rules">${c.rules.map(([t,d])=>`<div><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
      <h2>${esc(c.demoTitle)}</h2><p class="screen-intro">${esc(c.demoLede)}</p>
      <div class="ps-demo"><div class="ps-steps" role="tablist" aria-label="${esc(c.demoTitle)}"></div><div class="ps-stage" role="tabpanel" aria-live="polite"></div><p class="ps-src"></p></div>
      <h2>${esc(c.benchTitle)}</h2><p class="screen-intro">${esc(c.benchLede)}</p><div class="ps-bench"></div>
      <h2>${esc(c.numTitle)}</h2><div class="ps-nums"></div><p class="comment-line">${esc(c.numNote)}</p></section>`;
  }
  function psPaint() {
    const box=$('.ps-show'); if(!box||!psData) return;
    const c=psCopy(), S=psData.session, i=psState.s, T=S.task, W=S.context.working_set;
    const ORDER=['open','seal','rejected','allowed','verify','ship_early','review','ship'];
    box.querySelector('.ps-steps').innerHTML=c.steps.map(([t,s],k)=>`<button type="button" role="tab" data-ps-s="${k}" aria-selected="${k===i}" tabindex="${k===i?0:-1}" class="${k===2||k===5?'is-no':k===7?'is-ok':''}"><span>${k+1}</span><b>${esc(t)}</b><small>${esc(s)}</small></button>`).join('');
    const id=ORDER[i];
    // the repository board: every file with its sealed role; the rejected step marks the files PSG refused
    const files=[...Object.keys(S.files),'src/money.py'].filter(f=>f!=='src/money.py'||id==='rejected');
    const roleOf=f=>f==='src/money.py'?'new':i===0?'other':W.write.includes(f)?'write':W.read_only.includes(f)?'read_only':W.forbidden.includes(f)?'forbidden':W.read.includes(f)?'read':'other';
    const hit=f=>id==='rejected'?S.rejected.violations.find(v=>v.path===f):null;
    const changed=f=>id==='rejected'?/^(src\/(pricing|api|legacy_export|money)\.py)$/.test(f):['allowed','verify','ship_early','review','ship'].includes(id)&&f==='src/pricing.py';
    const board=`<div class="ps-board"><h3>${esc(c.board)}</h3><ul>${files.map(f=>{ const v=hit(f), r=roleOf(f);
      return `<li class="r-${r}${v?' is-hit':''}${changed(f)?' is-changed':''}"><code translate="no">${esc(f)}</code><em>${esc(c.role[r])}</em>${v?`<small>✕ ${esc(c.viol[v.kind]||v.kind)}</small>`:changed(f)&&id!=='rejected'?'<small class="ok">✓</small>':''}</li>`; }).join('')}</ul></div>`;
    const runLine=cmd=>`<p class="ps-cmd"><code translate="no">$ ${esc(cmd)}</code></p>`;
    let main='';
    if(id==='open') main=`${runLine(T.cmd)}<dl class="ps-contract"><div><dt>${esc(c.intent)}</dt><dd>${esc(T.intent)}</dd></div>${T.criteria.map(a=>`<div><dt>${esc(c.ac)} <code translate="no">${esc(a.id)}</code></dt><dd>${esc(a.text)} <em class="st-${esc(a.status)}" translate="no">${esc(a.status)}</em></dd></div>`).join('')}
      <div><dt>${esc(c.constraint)}</dt><dd>${T.constraints.map(esc).join('<br>')}</dd></div><div><dt>${esc(c.nongoal)}</dt><dd>${T.non_goals.map(esc).join('<br>')}</dd></div>
      <div><dt>${esc(c.requested)}</dt><dd translate="no">write ${T.requested.write.map(esc).join(', ')} · read-only ${T.requested.read_only.map(esc).join(', ')} · forbidden ${T.requested.forbidden.map(esc).join(', ')}</dd></div>
      <div><dt>${esc(c.state)}</dt><dd><em class="ps-draft" translate="no">${esc(String(T.state).toUpperCase())}</em> <span translate="no">authorized_write: []</span></dd></div></dl>`;
    if(id==='seal'){ const s=S.context.seal;
      main=`${runLine(S.context.cmd)}<dl class="ps-contract"><div><dt>${esc(c.state)}</dt><dd><em class="ps-sealed" translate="no">${esc(String(s.contract_state).toUpperCase())}</em> <span translate="no">authorized_write: [${s.authorized_write.map(esc).join(', ')}]</span></dd></div>
        <div><dt>${esc(c.hash)}</dt><dd><code translate="no">${esc(s.contract_hash.slice(0,23))}…</code></dd></div><div><dt>${esc(c.approvalT)}</dt><dd>${esc(s.requires_scope_approval?c.yes:c.no)}</dd></div>
        <div><dt>${esc(c.tokensT)}</dt><dd><span class="ps-meter"><i style="--v:${Math.min(1,S.context.token_estimate/S.context.context_budget)}"></i></span> ${esc(csFill(c.tokens,{n:S.context.token_estimate,b:S.context.context_budget.toLocaleString('en-US')}))}</dd></div></dl>`; }
    if(id==='rejected') main=`<pre class="ps-diff" translate="no"><code>${psDiff(S.agent_diff)}</code></pre>${runLine(S.rejected.cmd)}<p class="ps-verdict is-no"><b translate="no">allowed: false</b> · ${esc(c.rejected)}</p>
      <ul class="ps-viol">${S.rejected.violations.map(v=>`<li><code translate="no">${esc(v.kind)}</code><b translate="no">${esc(v.path)}</b><small>${esc(c.viol[v.kind]||v.kind)}</small></li>`).join('')}</ul>`;
    if(id==='allowed') main=`<pre class="ps-diff" translate="no"><code>${psDiff(S.allowed.diff)}</code></pre>${runLine(S.allowed.cmd)}<p class="ps-verdict is-ok"><b translate="no">allowed: true</b> · ${esc(c.allowed)} · <span translate="no">violations: []</span></p>`;
    if(id==='verify'){ const v=S.verify;
      main=`${runLine(v.cmd)}<p class="ps-verdict is-ok"><b translate="no">${esc(v.id)} · ${esc(v.name)} · ${esc(v.result)}</b> · ${esc(c.tier)} <code translate="no">${esc(v.trust_tier)}</code> · <span translate="no">exit ${esc(v.exit_code)}</span></p>
        <h3>${esc(c.checkOut)}</h3><pre class="ps-log" translate="no"><code>${esc(v.log)}</code></pre>`; }
    if(id==='ship_early'||id==='ship'){ const g=S[id];
      main=`${id==='ship'?runLine(S.review.cmd)+`<p class="ps-verdict"><b>${esc(csFill(c.reviewRound,{u:S.review.review_rounds_used,b:S.review.review_budget}))}</b> · <span translate="no">derived_new_blocking_issues: ${esc(S.review.derived_new_blocking_issues)} · ${esc(S.review.invariant)}</span></p>`:''}
        ${runLine(g.cmd)}<div class="ps-shipres ${g.status==='SHIPPABLE'?'is-ok':'is-no'}"><em translate="no">${esc(g.status)}</em><span translate="no">recommendation: ${esc(g.recommendation)}</span>${g.stable_snapshot?`<small>${esc(csFill(c.snapshot,{s:g.stable_snapshot}))} · ${esc(csFill(c.followUps,{n:g.follow_up_issue_summary.total}))}</small>`:`<small translate="no">failed_or_pending: [${g.acceptance.failed_or_pending.map(esc).join(', ')}]</small>`}</div>`; }
    if(id==='review') main=`${runLine(S.criterion.cmd)}<p class="ps-verdict is-ok"><b translate="no">${esc(S.criterion.id)} · pass</b> → <code translate="no">${esc(S.criterion.reference)}</code></p>
      <h3>${esc(c.issueT)}</h3><ul class="ps-issues">${S.issues.map(x=>{ const why=x.blocks_current_task?c.why.blocks:!x.evidence_sufficient?c.why.insufficient:c.why[x.relation_to_task]||c.why.severity;
        return `<li class="${x.blocks_current_task?'is-block':''}"><p><code translate="no">${esc(x.id)}</code><em class="sev-${esc(x.severity)}" translate="no">${esc(x.severity)}</em><b>${esc(x.claim)}</b></p><small>${esc(c.rel[x.relation_to_task]||x.relation_to_task)} · ${esc(x.evidence_sufficient?c.sufficient:c.insufficient)} <code translate="no">${esc(JSON.stringify(x.evidence))}</code></small><span class="ps-derived"><b translate="no">blocks_current_task: ${esc(x.blocks_current_task)}</b> — ${esc(why)}</span></li>`; }).join('')}</ul>`;
    // the ship gate as PSG evaluated it, known only at the two ship steps
    const g=id==='ship'?S.ship:id==='ship_early'?S.ship_early:null;
    const okOf={policy:g&&g.policy_allowed,verification:g&&g.verification.functional_trusted.length&&!g.verification.failed.length&&!g.verification.missing&&!g.verification.stale.length,
      acceptance:g&&!g.acceptance.failed_or_pending.length&&!g.acceptance.stale.length,issues:g&&!g.current_task_issue_summary.total,
      review:g&&(!g.independent_review_required||g.independent_review_satisfied),budgets:g&&g.review_rounds_used<=g.review_budget&&g.fix_cycles_used<=g.fix_budget};
    const detail={policy:g&&'violations: []',verification:g&&`functional_trusted: [${g.verification.functional_trusted.join(', ')}]`,acceptance:g&&`${g.acceptance.passed}/${g.acceptance.mandatory_total}`,
      issues:g&&`current: ${g.current_task_issue_summary.total} · follow-up: ${g.follow_up_issue_summary.total}`,review:g&&(g.independent_review_required?'':c.na),budgets:g&&`review ${g.review_rounds_used}/${g.review_budget} · fix ${g.fix_cycles_used}/${g.fix_budget}`};
    const gate=`<div class="ps-gate${g?'':' is-idle'}"><h3>${esc(c.gateT)}</h3><ul>${c.gate.map(([k,label])=>`<li class="${!g?'':okOf[k]?'is-ok':'is-no'}"><i aria-hidden="true">${!g?'·':okOf[k]?'✓':'✕'}</i><span>${esc(label)}</span><small translate="no">${esc(g?detail[k]:c.pending)}</small></li>`).join('')}</ul></div>`;
    box.querySelector('.ps-stage').innerHTML=`<p class="ps-text">${esc(c.texts[i])}</p><div class="ps-cols"><div class="ps-main">${main}</div><div class="ps-side">${board}${gate}</div></div>`;
    box.querySelector('.ps-src').textContent=csFill(c.src,{v:psData.source.version,c:psData.source.commit.slice(0,7),d:psData.source.run});
  }
  function psStatic() {
    const box=$('.ps-show'); if(!box||!psData) return;
    const c=psCopy(), D=psData, B=D.boundary, M=D.mechanics, T=D.tests;
    box.querySelector('.ps-note b').textContent='v'+D.source.version; box.querySelector('.ps-note-t').textContent=csFill(c.note,{v:D.source.version});
    const ev=e=>e.kind+(e.path?' · '+e.path:'');
    box.querySelector('.ps-bench').innerHTML=`<table class="ps-table"><thead><tr>${c.cols.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${B.scenarios.map(s=>`<tr class="${s.expected_block?'is-block':''}"><td>${esc(s.name)}</td><td><em class="sev-${esc(s.severity)}" translate="no">${esc(s.severity)}</em></td><td>${esc(c.rel[s.relation]||s.relation)}</td><td><code translate="no">${esc(ev(s.evidence))}</code>${s.evidence_sufficient?'':` <small>(${esc(c.insufficient)})</small>`}</td><td>${esc(s.expected_block?c.blockWord:c.passWord)}</td><td class="${s.correct?'ok':'bad'}">${esc(s.actual_block?c.blockWord:c.passWord)} ${s.correct?'✓':'✕'}</td></tr>`).join('')}</tbody></table>
      <p class="ps-benchsum">${esc(csFill(c.benchSum,{c:B.summary.correct,n:B.scenarios.length,p:B.summary.blocking_precision.toFixed(1),r:B.summary.blocking_recall.toFixed(1),f:B.summary.false_reopening_rate}))}</p>`;
    const vals=[{ok:T.passed,all:T.collected,py:T.python},{c:B.summary.correct,n:B.scenarios.length},{a:M.baseline_file_reads,b:M.psg_file_reads,t:M.tasks_shippable,pct:M.file_read_reduction_percent.toFixed(1)},{tk:M.total_context_token_reduction_percent.toFixed(1)}];
    box.querySelector('.ps-nums').innerHTML=c.nums.map(([big,small],k)=>`<div style="--i:${k}"><b>${esc(csFill(big,vals[k]))}</b><small>${esc(csFill(small,vals[k]))}</small></div>`).join('');
  }
  function initPsg() {
    const box=$('.ps-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    const go=()=>{ psStatic(); psPaint(); };
    if(psData) go(); else fetch('/assets/psg/showcase.json?v=1').then(r=>r.json()).then(d=>{psData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{ const b=event.target.closest('[data-ps-s]'); if(b){ psState.s=Number(b.dataset.psS); psPaint(); } });
  root.addEventListener('keydown',event=>{
    const b=event.target.closest?.('[data-ps-s]'); if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||!psData) return;
    event.preventDefault(); const n=8;
    psState.s=event.key==='Home'?0:event.key==='End'?n-1:(psState.s+(event.key==='ArrowRight'?1:n-1))%n; psPaint(); $(`[data-ps-s="${psState.s}"]`)?.focus();
  });
  /* NoveltyAudit: how an audit is built, then its own offline code on the synthetic report committed with its tests (the
     cutoff moved through time, the validator given dishonest copies) and a public claim decomposed
     (assets/noveltyaudit/showcase.json, built by tools/noveltyaudit_showcase.py from a clean checkout). */
  const NA_CLS={en:{DIRECT_PRECEDENT:'One earlier paper already covers every critical facet.',STRONG_COMPOSITION_RISK:'A small set of earlier papers covers the claim, and text before the cutoff explicitly connects them.',
      PLAUSIBLE_COMPOSITION_RISK:'A small set covers the claim, and the citation graph links them, but no verified text does.',FRAGMENTED_PRECEDENT:'The pieces exist in separate papers with no historical link between them.',
      RESIDUAL_NOVELTY:'No set of three or fewer eligible papers covers every critical facet.',INCONCLUSIVE:'The evidence is too incomplete to say.'},
    'zh-TW':{DIRECT_PRECEDENT:'一篇更早的論文就涵蓋了所有關鍵面向。',STRONG_COMPOSITION_RISK:'幾篇更早的論文合起來涵蓋了主張，而且截止日前就有文字明確把它們連在一起。',
      PLAUSIBLE_COMPOSITION_RISK:'幾篇論文合起來涵蓋了主張，引用圖也把它們連起來，但沒有經過驗證的文字連結。',FRAGMENTED_PRECEDENT:'各個部分散在不同論文裡，歷史上沒有任何連結。',
      RESIDUAL_NOVELTY:'找不到三篇以內、截止日前已公開的論文能涵蓋所有關鍵面向。',INCONCLUSIVE:'證據不完整，無法下結論。'},
    'zh-CN':{DIRECT_PRECEDENT:'一篇更早的论文就涵盖了所有关键方面。',STRONG_COMPOSITION_RISK:'几篇更早的论文合起来涵盖了主张，而且截止日前就有文字明确把它们连在一起。',
      PLAUSIBLE_COMPOSITION_RISK:'几篇论文合起来涵盖了主张，引用图也把它们连起来，但没有经过验证的文字连接。',FRAGMENTED_PRECEDENT:'各个部分散在不同论文里，历史上没有任何连接。',
      RESIDUAL_NOVELTY:'找不到三篇以内、截止日前已公开的论文能涵盖所有关键方面。',INCONCLUSIVE:'证据不完整，无法下结论。'}};
  const naCopy=()=>({
    en:{note:'Everything below is NoveltyAudit {v}’s own offline code, run for this page on the synthetic report committed with its tests (papers A, B and C are fictional) and on one public case. A live audit also searches arXiv, OpenAlex, Semantic Scholar and Crossref; this page makes no such calls.',
      archTitle:'How an audit is built',
      arch:[['Freeze the claim','Split the claim into facets and hash it before any search, so it cannot drift towards what was found.'],
        ['Search five ways','Literal, mechanism, problem, ancestor and composition queries across several providers; coverage describes this protocol, never recall.'],
        ['Date gate','Only work public before the cutoff counts, dated by its earliest public version.'],
        ['Minimal Prior Set','The smallest set of at most three eligible papers whose cited evidence covers every critical facet.'],
        ['Bridge test','Were those papers already connected before the cutoff? Verified text first, then the citation graph.'],
        ['Three-axis verdict','Novelty risk, search coverage and evidence confidence stay separate; missing evidence means INCONCLUSIVE.']],
      skillT:'Who does what',skill:'The host agent reads the papers and writes the judgments: facets, which evidence covers what, the residual novelty. NoveltyAudit’s scripts never call a model. They recompute everything that can be recomputed, the claim hash, dates, the smallest covering set, bridges and search coverage, and reject a report that disagrees.',
      rules:[['Most similar ≠ killer','A near match that misses one critical facet is not a precedent.'],['No single killer ≠ novel','Three papers together can cover what none covers alone.'],['Coverage ≠ recall','“Broad” means the search protocol ran completely, not that nothing was missed.'],['No novelty scores','A percentage would look precise and mean nothing; the report refuses to print one.']],
      demoTitle:'Move the cutoff',demoLede:'One claim, three earlier papers. The verdict depends on what was public on the cutoff date. Each stop below is the tool’s date gate, set search, bridge detection and classification run on the same papers.',
      claimT:'Claim',facetsT:'Facets (frozen)',critical:'critical',papersT:'Papers',eligible:'public before the cutoff',post:'after the cutoff',
      covT:'Evidence coverage',cov:{EXACT:'covers',FUNCTIONAL:'covers',PARTIAL:'partial',NO:'—'},before:'{d} days before the cutoff',cites:'cites {x}',
      mpsT:'Minimal Prior Set',none:'none',bridgesT:'Bridges between the set',usable:'usable',notYet:'source not yet public',
      btype:{TAXONOMY_BRIDGE:'text: a taxonomy names both',DIRECT_CITATION:'graph: one cites the other',CO_CITATION:'graph: cited together',LANDSCAPE_BRIDGE:'after the cutoff: landscape only'},
      whatIf:'Same set, other bridge evidence',ifGraph:'graph links only',ifNone:'no bridge at all',
      window:'Observation window A × B: {d} days ({s}; threshold {t})',wstatus:{MEETS_DIAGNOSTIC_THRESHOLD:'long enough to expect a trail',BELOW_DIAGNOSTIC_THRESHOLD:'too short to expect a trail'},
      axes:'The fixture’s verdict',axis:['Novelty risk','Search coverage','Evidence confidence'],protocol:'{r} query runs · providers {p} · families {f}',
      reportT:'The report it writes',residualT:'Residual novelty',rewriteT:'Defensible rewrite',gapsT:'Search gaps',
      refTitle:'What the validator refuses',refLede:'The same report, edited to overclaim. Each card is one edit and the validator’s actual answer (exit code 40 means rejected).',
      refs:{reworded_after_freeze:['Reworded after searching','A facet was rephrased after the search had run.'],prior_after_cutoff:['A prior from after the cutoff','Paper B’s date was moved past the cutoff but it stays in the set.'],
        uncited_killer_marked_cited:['A killer passed off as cited','Paper A is not in the manuscript’s bibliography, but the report says it is.'],bridge_without_text:['A bridge with no text','The taxonomy bridge lost its evidence span.'],
        graph_not_searched:['The citation graph not searched','The graph expansion for A and B was dropped.'],strong_verdict_weak_evidence:['Strong verdict, weak evidence','Evidence confidence lowered to WEAK, verdict kept.'],
        reassuring_risk:['A reassuring risk level','Novelty risk set to LOW on a composition verdict.'],novelty_percentage:['A novelty percentage','“Estimated novelty: 35%” added to the summary.'],
        broad_search_after_timeout:['“Broad” after a failed query','One arXiv query failed; the verdict still says BROAD.']},
      more:'+{n} more',
      ragTitle:'A real claim, decomposed',ragLede:'A public case from the repository: the claim of the RAG paper, split into facets and matched to earlier work. It is a curated hypothesis, not an audit the tool has run end to end.',
      facetStatus:{PUBLIC_PRIOR_CANDIDATE:'prior candidate',ANCESTOR_SCOPE_REQUIRES_COMPARISON:'ancestor: needs comparison',RESIDUAL_NOVELTY_HYPOTHESIS:'may be the novel part'},
      candidate:'Candidate set to test',windowsT:'Time the priors had to meet before the cutoff',days:'{d} days',
      ragNote:'All three pairs had well under the {t}-day window, so an empty citation graph between them would say almost nothing about whether the idea was “in the air”.',
      numTitle:'Numbers',
      nums:[['{ok}/{all}','tests passed offline for this page, {adv} of them adversarial validator tests'],['{m}/{a}','reviewer-annotated cases name two or more prior works'],['{b}/{c}','complete multi-prior cases show a pre-cutoff bridge (95% interval {lo}–{hi}%)'],['{u}/{p}','prior pairs had under 18 months before the cutoff (median {med} days)']],
      numNote:'The last three are aggregates from {ds} ({lic}), snapshot {snap}. They describe how prior work and bridges look in reviewer data, not NoveltyAudit’s accuracy: no complete reviewer-grounded end-to-end audit has been run yet.',
      src:'Data: NoveltyAudit {v} · commit {c} · run {d}'},
    'zh-TW':{note:'以下全部是 NoveltyAudit {v} 自己的離線程式碼，為這一頁在它測試附帶的合成報告上執行（論文 A、B、C 都是虛構的），外加一個公開案例。實際審查還會查詢 arXiv、OpenAlex、Semantic Scholar 和 Crossref；這一頁完全不連網。',
      archTitle:'一次審查怎麼組成',
      arch:[['凍結主張','把主張拆成幾個面向，並在搜尋前算好雜湊，避免主張被搜尋結果牽著走。'],
        ['五種搜尋','字面、機制、問題、祖先與組合五類查詢，跨多個來源；「覆蓋度」描述的是這套流程，不是召回率。'],
        ['日期關卡','只有截止日前公開的研究才算，日期以最早公開的版本為準。'],
        ['最小先前集合','最多三篇、截止日前已公開，而且引用的證據能涵蓋所有關鍵面向的最小論文組合。'],
        ['橋接檢驗','這些論文在截止日前就已經被連在一起了嗎？先看經驗證的文字，再看引用圖。'],
        ['三軸判斷','新穎性風險、搜尋覆蓋度、證據信心分開呈現；證據不足就是 INCONCLUSIVE。']],
      skillT:'誰負責什麼',skill:'代理負責讀論文並寫下判斷：面向、哪段證據涵蓋什麼、剩下的新穎之處。NoveltyAudit 的腳本從不呼叫模型，它們重新計算所有能算的東西：主張雜湊、日期、最小涵蓋集合、橋接、搜尋覆蓋度，對不上的報告一律拒絕。',
      rules:[['最相似 ≠ 致命','很像但漏掉一個關鍵面向的論文，不算先例。'],['沒有單一致命論文 ≠ 有新意','三篇合起來，可能涵蓋任何一篇單獨涵蓋不了的東西。'],['覆蓋度 ≠ 召回率','「廣」代表搜尋流程完整執行，不代表沒有遺漏。'],['不給新穎度分數','百分比看起來很精確，其實沒有意義；報告拒絕印出任何百分比。']],
      demoTitle:'移動截止日',demoLede:'一個主張、三篇更早的論文。判斷取決於截止日那天有哪些已經公開。下面每一站，都是工具的日期關卡、集合搜尋、橋接偵測和分類在同一批論文上的實際結果。',
      claimT:'主張',facetsT:'面向（已凍結）',critical:'關鍵',papersT:'論文',eligible:'截止日前已公開',post:'截止日之後',
      covT:'證據涵蓋',cov:{EXACT:'涵蓋',FUNCTIONAL:'涵蓋',PARTIAL:'部分',NO:'—'},before:'截止日前 {d} 天',cites:'引用 {x}',
      mpsT:'最小先前集合',none:'無',bridgesT:'集合之間的橋接',usable:'可用',notYet:'來源尚未公開',
      btype:{TAXONOMY_BRIDGE:'文字：一份分類同時提到兩者',DIRECT_CITATION:'引用圖：一篇引用另一篇',CO_CITATION:'引用圖：被一起引用',LANDSCAPE_BRIDGE:'截止日之後：只能當背景'},
      whatIf:'同一個集合，換成其他橋接證據',ifGraph:'只有引用圖連結',ifNone:'完全沒有橋接',
      window:'A × B 的觀察期：{d} 天（{s}；門檻 {t} 天）',wstatus:{MEETS_DIAGNOSTIC_THRESHOLD:'夠長，照理會留下痕跡',BELOW_DIAGNOSTIC_THRESHOLD:'太短，不太可能留下痕跡'},
      axes:'合成報告的結論',axis:['新穎性風險','搜尋覆蓋度','證據信心'],protocol:'{r} 次查詢 · 來源 {p} · 查詢類型 {f}',
      reportT:'它寫出的報告',residualT:'剩下的新穎之處',rewriteT:'站得住腳的改寫',gapsT:'搜尋缺口',
      refTitle:'驗證器會拒絕什麼',refLede:'同一份報告，被改成誇大其詞的版本。每張卡是一種修改，以及驗證器實際的回答（結束碼 40 代表拒絕）。',
      refs:{reworded_after_freeze:['搜尋後改寫主張','搜尋跑完之後，把某個面向換了說法。'],prior_after_cutoff:['截止日之後的先前研究','論文 B 的日期被移到截止日之後，卻還留在集合裡。'],
        uncited_killer_marked_cited:['把沒引用的致命論文說成有引用','論文 A 不在稿件的參考文獻裡，報告卻說有。'],bridge_without_text:['沒有文字的橋接','分類橋接的證據段落被拿掉了。'],
        graph_not_searched:['沒查引用圖','A 和 B 的引用圖擴展被刪掉了。'],strong_verdict_weak_evidence:['結論強、證據弱','證據信心降成 WEAK，結論卻不變。'],
        reassuring_risk:['讓人安心的風險等級','在組合型的結論上，把新穎性風險設成 LOW。'],novelty_percentage:['新穎度百分比','在摘要加上「估計新穎度：35%」。'],
        broad_search_after_timeout:['查詢失敗還說「廣」','一次 arXiv 查詢失敗了，結論卻仍寫 BROAD。']},
      more:'還有 {n} 條',
      ragTitle:'拆解一個真實的主張',ragLede:'repo 裡的公開案例：把 RAG 論文的主張拆成幾個面向，對應到更早的研究。這是整理出來的假設，不是工具完整跑過的審查。',
      facetStatus:{PUBLIC_PRIOR_CANDIDATE:'先前研究候選',ANCESTOR_SCOPE_REQUIRES_COMPARISON:'祖先：需要比對',RESIDUAL_NOVELTY_HYPOTHESIS:'可能是新的部分'},
      candidate:'待檢驗的候選集合',windowsT:'截止日前，兩篇先前研究有多少時間彼此交會',days:'{d} 天',
      ragNote:'三組配對都遠低於 {t} 天的觀察期，所以就算它們之間的引用圖是空的，也幾乎無法說明這個想法當時是否「呼之欲出」。',
      numTitle:'數字',
      nums:[['{ok}/{all}','測試為這一頁離線重跑通過，其中 {adv} 個是驗證器的對抗測試'],['{m}/{a}','審稿人標註的案例提到兩篇以上的先前研究'],['{b}/{c}','完整的多先前研究案例在截止日前有橋接（95% 區間 {lo}–{hi}%）'],['{u}/{p}','先前研究配對在截止日前相處不到 18 個月（中位數 {med} 天）']],
      numNote:'後三個是 {ds}（{lic}）的彙總數字，快照日期 {snap}。它們描述審稿資料裡先前研究和橋接的樣貌，不是 NoveltyAudit 的準確率：目前還沒有任何一次以審稿人為基準的完整端到端審查。',
      src:'資料：NoveltyAudit {v} · commit {c} · 執行於 {d}'},
    'zh-CN':{note:'以下全部是 NoveltyAudit {v} 自己的离线代码，为这一页在它测试附带的合成报告上运行（论文 A、B、C 都是虚构的），外加一个公开案例。实际审查还会查询 arXiv、OpenAlex、Semantic Scholar 和 Crossref；这一页完全不联网。',
      archTitle:'一次审查怎么组成',
      arch:[['冻结主张','把主张拆成几个方面，并在搜索前算好哈希，避免主张被搜索结果牵着走。'],
        ['五种搜索','字面、机制、问题、祖先与组合五类查询，跨多个来源；“覆盖度”描述的是这套流程，不是召回率。'],
        ['日期关卡','只有截止日前公开的研究才算，日期以最早公开的版本为准。'],
        ['最小先前集合','最多三篇、截止日前已公开，而且引用的证据能涵盖所有关键方面的最小论文组合。'],
        ['桥接检验','这些论文在截止日前就已经被连在一起了吗？先看经验证的文字，再看引用图。'],
        ['三轴判断','新颖性风险、搜索覆盖度、证据置信度分开呈现；证据不足就是 INCONCLUSIVE。']],
      skillT:'谁负责什么',skill:'代理负责读论文并写下判断：方面、哪段证据涵盖什么、剩下的新颖之处。NoveltyAudit 的脚本从不调用模型，它们重新计算所有能算的东西：主张哈希、日期、最小涵盖集合、桥接、搜索覆盖度，对不上的报告一律拒绝。',
      rules:[['最相似 ≠ 致命','很像但漏掉一个关键方面的论文，不算先例。'],['没有单一致命论文 ≠ 有新意','三篇合起来，可能涵盖任何一篇单独涵盖不了的东西。'],['覆盖度 ≠ 召回率','“广”代表搜索流程完整执行，不代表没有遗漏。'],['不给新颖度分数','百分比看起来很精确，其实没有意义；报告拒绝打印任何百分比。']],
      demoTitle:'移动截止日',demoLede:'一个主张、三篇更早的论文。判断取决于截止日那天有哪些已经公开。下面每一站，都是工具的日期关卡、集合搜索、桥接检测和分类在同一批论文上的实际结果。',
      claimT:'主张',facetsT:'方面（已冻结）',critical:'关键',papersT:'论文',eligible:'截止日前已公开',post:'截止日之后',
      covT:'证据涵盖',cov:{EXACT:'涵盖',FUNCTIONAL:'涵盖',PARTIAL:'部分',NO:'—'},before:'截止日前 {d} 天',cites:'引用 {x}',
      mpsT:'最小先前集合',none:'无',bridgesT:'集合之间的桥接',usable:'可用',notYet:'来源尚未公开',
      btype:{TAXONOMY_BRIDGE:'文字：一份分类同时提到两者',DIRECT_CITATION:'引用图：一篇引用另一篇',CO_CITATION:'引用图：被一起引用',LANDSCAPE_BRIDGE:'截止日之后：只能当背景'},
      whatIf:'同一个集合，换成其他桥接证据',ifGraph:'只有引用图连接',ifNone:'完全没有桥接',
      window:'A × B 的观察期：{d} 天（{s}；门槛 {t} 天）',wstatus:{MEETS_DIAGNOSTIC_THRESHOLD:'够长，照理会留下痕迹',BELOW_DIAGNOSTIC_THRESHOLD:'太短，不太可能留下痕迹'},
      axes:'合成报告的结论',axis:['新颖性风险','搜索覆盖度','证据置信度'],protocol:'{r} 次查询 · 来源 {p} · 查询类型 {f}',
      reportT:'它写出的报告',residualT:'剩下的新颖之处',rewriteT:'站得住脚的改写',gapsT:'搜索缺口',
      refTitle:'验证器会拒绝什么',refLede:'同一份报告，被改成夸大其词的版本。每张卡是一种修改，以及验证器实际的回答（退出码 40 代表拒绝）。',
      refs:{reworded_after_freeze:['搜索后改写主张','搜索跑完之后，把某个方面换了说法。'],prior_after_cutoff:['截止日之后的先前研究','论文 B 的日期被移到截止日之后，却还留在集合里。'],
        uncited_killer_marked_cited:['把没引用的致命论文说成有引用','论文 A 不在稿件的参考文献里，报告却说有。'],bridge_without_text:['没有文字的桥接','分类桥接的证据段落被拿掉了。'],
        graph_not_searched:['没查引用图','A 和 B 的引用图扩展被删掉了。'],strong_verdict_weak_evidence:['结论强、证据弱','证据置信度降成 WEAK，结论却不变。'],
        reassuring_risk:['让人安心的风险等级','在组合型的结论上，把新颖性风险设成 LOW。'],novelty_percentage:['新颖度百分比','在摘要加上“估计新颖度：35%”。'],
        broad_search_after_timeout:['查询失败还说“广”','一次 arXiv 查询失败了，结论却仍写 BROAD。']},
      more:'还有 {n} 条',
      ragTitle:'拆解一个真实的主张',ragLede:'仓库里的公开案例：把 RAG 论文的主张拆成几个方面，对应到更早的研究。这是整理出来的假设，不是工具完整跑过的审查。',
      facetStatus:{PUBLIC_PRIOR_CANDIDATE:'先前研究候选',ANCESTOR_SCOPE_REQUIRES_COMPARISON:'祖先：需要比对',RESIDUAL_NOVELTY_HYPOTHESIS:'可能是新的部分'},
      candidate:'待检验的候选集合',windowsT:'截止日前，两篇先前研究有多少时间彼此交会',days:'{d} 天',
      ragNote:'三组配对都远低于 {t} 天的观察期，所以就算它们之间的引用图是空的，也几乎无法说明这个想法当时是否“呼之欲出”。',
      numTitle:'数字',
      nums:[['{ok}/{all}','测试为这一页离线重跑通过，其中 {adv} 个是验证器的对抗测试'],['{m}/{a}','审稿人标注的案例提到两篇以上的先前研究'],['{b}/{c}','完整的多先前研究案例在截止日前有桥接（95% 区间 {lo}–{hi}%）'],['{u}/{p}','先前研究配对在截止日前相处不到 18 个月（中位数 {med} 天）']],
      numNote:'后三个是 {ds}（{lic}）的汇总数字，快照日期 {snap}。它们描述审稿数据里先前研究和桥接的样貌，不是 NoveltyAudit 的准确率：目前还没有任何一次以审稿人为基准的完整端到端审查。',
      src:'数据：NoveltyAudit {v} · commit {c} · 运行于 {d}'}}[locale]);
  let naData=null;
  const naState={k:-1};
  const naDay=d=>Date.parse(d+'T00:00:00Z')/864e5;
  function naShowcase() {
    const c=naCopy();
    return `<section class="na-show"><p class="na-note"><b translate="no"></b><span class="na-note-t"></span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="na-flow">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="na-n">${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <p class="na-skill"><b>${esc(c.skillT)}</b><span>${esc(c.skill)}</span></p>
      <div class="na-rules">${c.rules.map(([t,d])=>`<div><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
      <h2>${esc(c.demoTitle)}</h2><p class="screen-intro">${esc(c.demoLede)}</p>
      <div class="na-demo"><div class="na-time"></div><div class="na-stage" aria-live="polite"></div><p class="na-src"></p></div>
      <h2>${esc(c.refTitle)}</h2><p class="screen-intro">${esc(c.refLede)}</p><div class="na-refs"></div>
      <h2>${esc(c.ragTitle)}</h2><p class="screen-intro">${esc(c.ragLede)}</p><div class="na-rag"></div>
      <h2>${esc(c.numTitle)}</h2><div class="na-nums"></div><p class="comment-line na-numnote"></p></section>`;
  }
  function naPaint() {
    const box=$('.na-show'); if(!box||!naData) return;
    const c=naCopy(), L=NA_CLS[locale]||NA_CLS.en, D=naData, F=D.fixture, k=naState.k<0?D.sweep.length-1:naState.k, X=D.sweep[k];
    // the timeline: papers by date, one button per cutoff stop
    const days=[...F.papers.map(p=>naDay(p.date)),...D.sweep.map(s=>naDay(s.cutoff))], lo=Math.min(...days)-60, hi=Math.max(...days)+60, pos=d=>((naDay(d)-lo)/(hi-lo)*100).toFixed(2);
    box.querySelector('.na-time').innerHTML=`<div class="na-axis" style="--cut:${pos(X.cutoff)}%"><i class="na-before"></i>${F.papers.map(p=>`<span class="na-dot ${X.status[p.id]==='ELIGIBLE'?'is-in':''}" style="left:${pos(p.date)}%"><b translate="no">${esc(p.id)}</b><small translate="no">${esc(p.date)}</small></span>`).join('')}<span class="na-cut" style="left:${pos(X.cutoff)}%"></span></div>
      <div class="na-stops" role="tablist" aria-label="${esc(c.demoTitle)}">${D.sweep.map((s,j)=>`<button type="button" role="tab" data-na-k="${j}" aria-selected="${j===k}" tabindex="${j===k?0:-1}" class="c-${esc(s.classification.toLowerCase())}"><span translate="no">${esc(s.cutoff)}</span><i translate="no">${esc(s.classification.replace(/_/g,' '))}</i></button>`).join('')}</div>`;
    const inSet=new Set((X.mps[0]||{}).paper_ids||[]);
    const papers=F.papers.map(p=>`<li class="${X.status[p.id]==='ELIGIBLE'?'is-in':'is-out'}${inSet.has(p.id)?' in-set':''}"><b translate="no">${esc(p.id)}</b><span>${esc(p.title)}</span><small translate="no">${esc(p.date)}</small><em>${esc(X.status[p.id]==='ELIGIBLE'?c.eligible:c.post)}</em>${p.references.length?`<small>${esc(csFill(c.cites,{x:p.references.join(', ')}))}</small>`:''}</li>`).join('');
    const facets=F.facets.map(f=>f.id);
    const cov=`<table class="na-cov"><thead><tr><th></th>${F.facets.map(f=>`<th><b translate="no">${esc(f.id)}</b><small>${esc(f.text)}</small></th>`).join('')}</tr></thead><tbody>${F.papers.map(p=>`<tr class="${X.status[p.id]==='ELIGIBLE'?'':'is-out'}${inSet.has(p.id)?' in-set':''}"><th translate="no">${esc(p.id)}</th>${facets.map(f=>{ const v=p.coverage[f]||'NO'; return `<td class="v-${esc(v.toLowerCase())}">${esc(c.cov[v]||v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
    const mps=X.mps.length?X.mps.map(m=>`<p class="na-set">{ ${m.paper_ids.map(x=>`<b translate="no">${esc(x)}</b>`).join(' + ')} } → <span translate="no">${m.covered_facets.map(esc).join(', ')}</span> <small translate="no">${esc(m.evidence_ids.join(', '))}</small></p>`).join(''):`<p class="na-set is-none">${esc(c.none)}<small>${esc(X.no_result||'')}</small></p>`;
    const bridges=[...X.textual.map(b=>({...b,kind:'text'})),...X.graph.map(b=>({...b,usable:true,kind:'graph'})),...X.landscape.map(b=>({...b,type:'LANDSCAPE_BRIDGE',usable:false,kind:'land'}))];
    const br=X.mps.length?`<ul class="na-bridges">${bridges.map(b=>`<li class="${b.usable?'is-ok':'is-off'}"><code translate="no">${esc(b.type)}</code><span>${esc(c.btype[b.type]||b.type)}</span><small translate="no">via ${esc(b.source_paper_id)}${b.base_rate_status&&b.base_rate_status!=='NOT_APPLICABLE'?' · base rate '+esc(b.base_rate_status):''}${b.evidence_ids?.length?' · '+esc(b.evidence_ids.join(', ')):''}</small><em>${esc(b.usable?c.usable:c.notYet)}</em></li>`).join('')}</ul>`:'';
    const last=k===D.sweep.length-1;
    const whatIf=last?`<div class="na-whatif"><h3>${esc(c.whatIf)}</h3><p><span>${esc(c.ifGraph)}</span><b translate="no" class="c-${esc(X.if_graph_only.toLowerCase())}">${esc(X.if_graph_only)}</b></p><p><span>${esc(c.ifNone)}</span><b translate="no" class="c-${esc(X.if_no_bridge.toLowerCase())}">${esc(X.if_no_bridge)}</b></p>
      <p class="na-window">${esc(csFill(c.window,{d:D.preflight.observation_window_days,s:c.wstatus[D.preflight.observation_window_status]||D.preflight.observation_window_status,t:D.preflight.observation_window_threshold_days}))}</p></div>`:'';
    const V=F.verdict;
    const axes=last?`<div class="na-axes"><h3>${esc(c.axes)}</h3><div>${[V.novelty_risk,V.search_coverage,V.evidence_confidence].map((v,j)=>`<p><small>${esc(c.axis[j])}</small><b translate="no">${esc(v)}</b></p>`).join('')}</div>
      <p class="na-proto" translate="no">${esc(csFill(c.protocol,{r:F.search.runs,p:F.search.providers.join(', '),f:F.search.families.length}))}</p>
      <details class="na-report"><summary>${esc(c.reportT)} · <code translate="no">cli.py export --format markdown</code></summary><pre translate="no"><code>${esc(F.report_md)}</code></pre></details></div>`:'';
    box.querySelector('.na-stage').innerHTML=`<div class="na-head"><div><small>${esc(c.claimT)} · cutoff <b translate="no">${esc(X.cutoff)}</b></small><b>${esc(F.claim)}</b><span class="na-facets">${F.facets.map(f=>`<i><b translate="no">${esc(f.id)}</b> ${esc(f.text)}${f.critical?` · ${esc(c.critical)}`:''}</i>`).join('')}</span></div>
      <div class="na-verdict c-${esc(X.classification.toLowerCase())}"><em translate="no">${esc(X.classification.replace(/_/g,' '))}</em><small>${esc(L[X.classification]||'')}</small></div></div>
      <div class="na-cols"><div><h3>${esc(c.papersT)}</h3><ul class="na-papers">${papers}</ul><h3>${esc(c.covT)}</h3>${cov}</div>
      <div><h3>${esc(c.mpsT)}</h3>${mps}${br?`<h3>${esc(c.bridgesT)}</h3>${br}`:''}${whatIf}</div></div>${axes}`;
    box.querySelector('.na-src').textContent=csFill(c.src,{v:D.source.version,c:D.source.commit.slice(0,7),d:D.source.run});
  }
  function naStatic() {
    const box=$('.na-show'); if(!box||!naData) return;
    const c=naCopy(), D=naData, R=D.rag, E=D.empirical, T=D.tests;
    box.querySelector('.na-note b').textContent='v'+D.source.version; box.querySelector('.na-note-t').textContent=csFill(c.note,{v:D.source.version});
    box.querySelector('.na-refs').innerHTML=D.refusals.map((r,j)=>{ const [t,d]=c.refs[r.id]||[r.id,''];
      return `<div class="na-ref" style="--i:${j}"><b>${esc(t)}</b><small>${esc(d)}</small><pre translate="no"><code><span class="t-exit">exit ${esc(r.exit)}</span>\n${r.errors.slice(0,2).map(e=>`<span class="t-err">ERROR:</span> ${esc(e)}`).join('\n')}${r.errors.length>2?`\n<span class="t-more">${esc(csFill(c.more,{n:r.errors.length-2}))}</span>`:''}</code></pre></div>`; }).join('');
    const d0=naDay(R.target.cutoff);
    box.querySelector('.na-rag').innerHTML=`<div class="na-raghead"><b>${esc(R.target.title)}</b><small translate="no">arXiv ${esc(R.arxiv)} · cutoff ${esc(R.target.cutoff)} · ${esc(R.status.case_type)} · ${esc(R.status.performance_status)}</small></div>
      <div class="na-cols"><div><ul class="na-ragfacets">${R.facets.map(f=>`<li class="s-${esc(f.status.toLowerCase())}"><b translate="no">${esc(f.facet_id)}</b><span>${esc(f.description)}</span><small>${esc(c.facetStatus[f.status]||f.status)}${f.candidate_prior_ids.length?` · <span translate="no">${esc(f.candidate_prior_ids.join(', '))}</span>`:''}</small></li>`).join('')}</ul>
        <p class="na-set"><span>${esc(c.candidate)}</span> ${R.candidate_mps.map(s=>`{ ${s.map(x=>`<b translate="no">${esc(x)}</b>`).join(' + ')} }`).join(' ')}</p></div>
      <div><ul class="na-priors">${R.priors.map(p=>`<li><b translate="no">${esc(p.id)}</b><span>${esc(p.title)}</span><small><span translate="no">${esc(p.date)} · arXiv ${esc(p.arxiv)}</span> · ${esc(csFill(c.before,{d:Math.round(d0-naDay(p.date))}))}</small></li>`).join('')}</ul>
        <h3>${esc(c.windowsT)}</h3><div class="na-windows">${R.windows.map(w=>`<p><span translate="no">${esc(w.pair.join(' × '))}</span><i><b style="--v:${Math.min(1,w.days/R.threshold_days)}"></b><u></u></i><small>${esc(csFill(c.days,{d:w.days}))}</small></p>`).join('')}<p class="na-thr"><span></span><i><u></u></i><small>${esc(csFill(c.days,{d:R.threshold_days}))}</small></p></div>
        <p class="na-ragnote">${esc(csFill(c.ragNote,{t:R.threshold_days}))}</p></div></div>`;
    const vals=[{ok:T.passed,all:T.collected,adv:T.adversarial},{m:E.multi_prior,a:E.annotated},{b:E.bridged_cases,c:E.complete_multi,lo:Math.round(E.bridged_ci[0]*100),hi:Math.round(E.bridged_ci[1]*100)},{u:E.under_18,p:E.pairs,med:Math.round(E.median_window)}];
    box.querySelector('.na-nums').innerHTML=c.nums.map(([big,small],j)=>`<div style="--i:${j}"><b>${esc(csFill(big,vals[j]))}</b><small>${esc(csFill(small,vals[j]))}</small></div>`).join('');
    box.querySelector('.na-numnote').textContent=csFill(c.numNote,{ds:E.dataset,lic:E.license,snap:E.snapshot});
  }
  function initNovelty() {
    const box=$('.na-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    const go=()=>{ naStatic(); naPaint(); };
    if(naData) go(); else fetch('/assets/noveltyaudit/showcase.json?v=1').then(r=>r.json()).then(d=>{naData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{ const b=event.target.closest('[data-na-k]'); if(b){ naState.k=Number(b.dataset.naK); naPaint(); } });
  root.addEventListener('keydown',event=>{
    const b=event.target.closest?.('[data-na-k]'); if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||!naData) return;
    event.preventDefault(); const n=naData.sweep.length, cur=naState.k<0?n-1:naState.k;
    naState.k=event.key==='Home'?0:event.key==='End'?n-1:(cur+(event.key==='ArrowRight'?1:n-1))%n; naPaint(); $(`[data-na-k="${naState.k}"]`)?.focus();
  });
  /* Research Meeting Coach: how it turns a week of notes into one advisor decision, then its deterministic gates run on the
     repository's synthetic worked example and on dishonest edits of it (assets/rmc/showcase.json, built by
     tools/rmc_showcase.py from a clean checkout). The briefs are model-written; what is recorded is what the gates said. */
  const rmCopy=()=>({
    en:{note:'When you use the Skill, a model writes the meeting brief. What this page runs is the part that does not depend on a model: the Skill’s own validators, re-run for this page on the repository’s synthetic example. The example outputs were written during development and are labelled that way.',
      archTitle:'How a week becomes one decision',
      arch:[['Typed facts','Every result and claim becomes a fact with a quoted source line, a unit, a condition and whether the value was exact.'],
        ['Prior actions','What the advisor asked for last time, with its real status. Unfinished stays unfinished.'],
        ['Evidence boundary','Observation, interpretation, hypothesis and proposal stay separate; gaps are ranked Critical to Low, with no fake probabilities.'],
        ['One decision','The meeting ends with one question the advisor can answer, with options that were proposed or supplied, never invented.'],
        ['Deterministic gates','The state file, its sources, every number in the brief and any advisor profile are checked by scripts, not by the model.']],
      skillT:'Who does what',skill:'The model reads your notes and writes the brief. Scripts check what can be checked: that each quote is on the cited line, that every number in the brief matches a typed fact with the same condition and qualifier, and that any advisor preference comes from recorded behaviour. A persona from someone’s nationality, institution or prestige is refused.',
      rules:[['Observation ≠ interpretation','“Accuracy dropped” and “compression caused it” are different claims.'],['Themes ≠ predictions','Likely questions are preparation aids, never probabilities.'],['Behaviour, not background','Personalisation needs recorded feedback or a pattern across three meetings.'],['Unfinished stays unfinished','A half-done control is reported as half done.']],
      demoTitle:'Before and after',demoLede:'The repository’s 60-second demo, all synthetic: a week of notes, last meeting’s request, a result table, and two briefs. Both catch the central confound; the difference is what else the second one makes explicit.',
      inputs:'Inputs',notes:'Weekly notes',prev:'Last meeting',table:'Result table',generic:'A strong generic prompt',aware:'Advisor-aware brief',
      outNote:'Both briefs are committed illustrations, not scored model runs.',
      exTitle:'The worked example, and its gates',exLede:'The repository’s fuller example: the state file the brief is built from, and the brief itself. Click a fact to see where the brief cites it.',
      facts:'Facts',layers:{observation:'observation',interpretation:'interpretation',hypothesis:'hypothesis',proposal:'proposal'},reasoning:'Reasoning, kept in layers',
      continuity:'Carried over from last meeting',status:{partial:'partial',done:'done',not_started:'not started'},attack:'Attack surface',ask:'The one decision',
      option:{proposed:'proposed',supplied:'supplied'},required:'required',briefT:'The brief (meeting-brief.md)',gatesT:'Gates on the committed example',
      gate:{rms:'State file schema and invariants',sources:'Every quote on its cited line',numbers:'Every number bound to a fact',profile:'Advisor profile rules',profile_sources:'Profile evidence in the notes'},
      passed:'passed',failed:'failed',
      refTitle:'What the gates refuse',refLede:'The same example, edited to overclaim. Each card is one edit and what the validators answered.',
      tabs:{brief:'The brief',rms:'The state file',profile:'The advisor profile'},
      edits:{wrong_number:['A number changed','The baseline became 72.8 instead of 72.3.'],swapped_values:['Values swapped','Baseline and compression values traded places; the citations stayed.'],
        unrecorded_math:['Arithmetic nobody declared','“A drop of 7.2 points” was added with no declared calculation.'],hedge_dropped:['“Around” dropped','“Returned to around 70” became “returned to 70”.'],
        spelled_decimal:['A number in words','“Seven point two points lower” tries to slip past the digit check.'],
        claimed_completion:['Completion claimed in prose','“Only half complete” became “complete”. No number changed, so the numeric gate passes; the Skill’s rules forbid it, but no script reads the sentence.'],
        m_quote_changed:['A quote that isn’t in the notes','F01 now quotes 75.0; line 7 of the notes says 72.3.'],m_wrong_condition:['The wrong condition','F01’s value is labelled “compression setup”, which its quote never says.'],
        m_hedge_as_exact:['Approximate marked exact','F03’s “around 70” is typed as an exact value.'],m_invented_option:['An option nobody supplied','“Drop the compression study” is marked as supplied, with no source fact.'],
        m_dropped_required:['An awkward fact left out','F04, the half-finished control, is moved to “omit” although it is marked required.'],
        m_marked_done:['A prior action marked done','The advisor’s request A12 is set to done. Its quote still exists, so both gates pass; what the status means is not checked.'],
        p_stereotype:['A trait from background','A “nationality style” is added to the advisor profile.'],p_one_meeting_pattern:['A pattern from one meeting','“Repeated behaviour” now cites a single meeting.'],
        p_impression_as_fact:['An impression at high confidence','The student’s impression is recorded with high confidence.'],p_quote_not_in_notes:['Feedback never given','The quoted feedback is not in the meeting notes.']},
      limitT:'Still needs a human',limit:'These two pass. The gates check quotes, numbers and structure; whether a sentence or a status is true in meaning is left to the rules the model follows, and to you.',
      numTitle:'Numbers',
      nums:[['{c}','static checks passed for this page, plus the schema contract tests'],['{k}/{n}','dishonest edits caught; the other {m} are shown above as limits'],['{d} · {x}','behavioural case definitions · formally executed with a model so far'],['{r}','routing-collision cases; {s} public retrospective records for question themes only']],
      numNote:'The development run in the repository was generated by the same session that built the Skill, so it is marked contaminated. No cross-model or real paired-meeting evaluation has been run; the next milestone is five permissioned, prospectively paired meetings.',
      src:'Data: Research Meeting Coach {v} · commit {c} · run {d}'},
    'zh-TW':{note:'使用這個 Skill 時，會議簡報是模型寫的。這一頁執行的是不依賴模型的部分：Skill 自己的驗證器，為這一頁在 repo 附的合成範例上重新執行。範例輸出是開發期間寫的，頁面上也如實標示。',
      archTitle:'一週的進度怎麼變成一個決定',
      arch:[['型別化的事實','每個結果和主張都變成一筆事實：引用的原始行、單位、條件，以及數值是精確還是大約。'],
        ['上次的交辦','指導教授上次要求的事，以及它真正的狀態。沒做完就是沒做完。'],
        ['證據邊界','觀察、解讀、假設、提案分開寫；缺口依 Critical 到 Low 排序，不編造機率。'],
        ['一個決定','會議以一個指導教授能回答的問題作結，選項只能是提出或提供的，不能憑空捏造。'],
        ['確定性關卡','狀態檔、它的來源、簡報裡每個數字、以及指導教授檔案，都由腳本檢查，而不是模型。']],
      skillT:'誰負責什麼',skill:'模型讀你的筆記、寫簡報。腳本檢查能檢查的部分：每段引用是否真的在標示的那一行、簡報裡每個數字是否對得上同條件、同精確度的事實、指導教授的偏好是否來自有記錄的行為。從國籍、學校或名氣推測的人物設定會被拒絕。',
      rules:[['觀察 ≠ 解讀','「準確率下降」和「是壓縮造成的」是兩個不同的主張。'],['主題 ≠ 預測','可能被問的問題是準備用的，不是機率。'],['看行為，不看背景','個人化需要有記錄的回饋，或三次會議以上的一致行為。'],['沒做完就是沒做完','做了一半的對照實驗，就報告做了一半。']],
      demoTitle:'使用前與使用後',demoLede:'repo 裡的 60 秒示範，全部是合成資料：一週的筆記、上次會議的要求、一張結果表，以及兩份簡報。兩份都抓到了核心的混淆因素；差別在第二份把哪些東西攤開來講。',
      inputs:'輸入',notes:'每週筆記',prev:'上次會議',table:'結果表',generic:'強的通用提示詞',aware:'面向指導教授的簡報',
      outNote:'兩份簡報都是 repo 附的示意，不是經過評分的模型執行結果。',
      exTitle:'完整範例和它的關卡',exLede:'repo 裡更完整的範例：簡報依據的狀態檔，以及簡報本身。點一筆事實，看簡報在哪裡引用它。',
      facts:'事實',layers:{observation:'觀察',interpretation:'解讀',hypothesis:'假設',proposal:'提案'},reasoning:'分層的推論',
      continuity:'從上次會議延續',status:{partial:'部分完成',done:'完成',not_started:'未開始'},attack:'可能被質疑的地方',ask:'唯一的決定',
      option:{proposed:'提出',supplied:'提供'},required:'必留',briefT:'簡報（meeting-brief.md）',gatesT:'範例本身通過的關卡',
      gate:{rms:'狀態檔結構與不變量',sources:'每段引用都在標示的那一行',numbers:'每個數字都綁定一筆事實',profile:'指導教授檔案規則',profile_sources:'檔案證據確實在筆記裡'},
      passed:'通過',failed:'不通過',
      refTitle:'關卡會拒絕什麼',refLede:'同一個範例，被改成誇大其詞的版本。每張卡是一種修改，以及驗證器的回答。',
      tabs:{brief:'簡報',rms:'狀態檔',profile:'指導教授檔案'},
      edits:{wrong_number:['數字被改了','baseline 從 72.3 變成 72.8。'],swapped_values:['數值對調','baseline 和 compression 的數值互換，引用不變。'],
        unrecorded_math:['沒有宣告的計算','加上「掉了 7.2 分」，但狀態檔沒有宣告這個計算。'],hedge_dropped:['拿掉「大約」','「回到大約 70」變成「回到 70」。'],
        spelled_decimal:['用文字寫數字','「低了 seven point two」想繞過數字檢查。'],
        claimed_completion:['在文字裡宣稱完成','「只完成一半」變成「已完成」。沒有數字改變，所以數字關卡通過；Skill 的規則禁止這樣寫，但沒有腳本讀這句話。'],
        m_quote_changed:['引用和筆記不符','F01 引用的是 75.0，但筆記第 7 行寫的是 72.3。'],m_wrong_condition:['條件標錯','F01 的數值被標成「compression setup」，引用裡根本沒有這個條件。'],
        m_hedge_as_exact:['大約被標成精確','F03 的「大約 70」被標成精確值。'],m_invented_option:['沒人提供的選項','「放棄壓縮研究」被標成「提供的」，卻沒有來源事實。'],
        m_dropped_required:['略掉不利的事實','F04（做了一半的對照實驗）明明標成必留，卻被移到「省略」。'],
        m_marked_done:['把上次的交辦標成完成','指導教授的要求 A12 被改成完成。它的引用還在，所以兩個關卡都通過；狀態本身的意思不會被檢查。'],
        p_stereotype:['從背景推測特質','在指導教授檔案裡加上「國籍風格」。'],p_one_meeting_pattern:['一次會議就當成規律','「重複行為」只引用了一次會議。'],
        p_impression_as_fact:['印象被當成高信心','學生的個人印象被記成高信心。'],p_quote_not_in_notes:['沒說過的回饋','引用的回饋不在會議筆記裡。']},
      limitT:'仍需要人來判斷',limit:'這兩種會通過。關卡檢查的是引用、數字和結構；一句話或一個狀態在意思上是否屬實，交給模型遵守的規則，以及你自己。',
      numTitle:'數字',
      nums:[['{c}','項靜態檢查為這一頁重跑通過，另有結構契約測試'],['{k}/{n}','種不誠實的修改被擋下；其餘 {m} 種在上面列為限制'],['{d} · {x}','個行為案例定義 · 目前真正用模型正式跑過的數量'],['{r}','個路由衝突案例；{s} 筆公開回顧紀錄，只用來整理問題主題']],
      numNote:'repo 裡的開發執行紀錄，是由開發這個 Skill 的同一個工作階段產生的，所以標為「受污染」。目前沒有跨模型評估，也沒有真實配對的會議評估；下一個里程碑是五場經同意、事前配對的真實會議。',
      src:'資料：Research Meeting Coach {v} · commit {c} · 執行於 {d}'},
    'zh-CN':{note:'使用这个 Skill 时，会议简报是模型写的。这一页运行的是不依赖模型的部分：Skill 自己的验证器，为这一页在仓库附的合成示例上重新运行。示例输出是开发期间写的，页面上也如实标注。',
      archTitle:'一周的进度怎么变成一个决定',
      arch:[['类型化的事实','每个结果和主张都变成一条事实：引用的原始行、单位、条件，以及数值是精确还是大约。'],
        ['上次的交办','导师上次要求的事，以及它真正的状态。没做完就是没做完。'],
        ['证据边界','观察、解读、假设、提案分开写；缺口按 Critical 到 Low 排序，不编造概率。'],
        ['一个决定','会议以一个导师能回答的问题作结，选项只能是提出或提供的，不能凭空捏造。'],
        ['确定性关卡','状态文件、它的来源、简报里每个数字、以及导师档案，都由脚本检查，而不是模型。']],
      skillT:'谁负责什么',skill:'模型读你的笔记、写简报。脚本检查能检查的部分：每段引用是否真的在标注的那一行、简报里每个数字是否对得上同条件、同精确度的事实、导师的偏好是否来自有记录的行为。从国籍、学校或名气推测的人物设定会被拒绝。',
      rules:[['观察 ≠ 解读','“准确率下降”和“是压缩造成的”是两个不同的主张。'],['主题 ≠ 预测','可能被问的问题是准备用的，不是概率。'],['看行为，不看背景','个性化需要有记录的反馈，或三次会议以上的一致行为。'],['没做完就是没做完','做了一半的对照实验，就报告做了一半。']],
      demoTitle:'使用前与使用后',demoLede:'仓库里的 60 秒示范，全部是合成数据：一周的笔记、上次会议的要求、一张结果表，以及两份简报。两份都抓到了核心的混淆因素；差别在第二份把哪些东西摊开来讲。',
      inputs:'输入',notes:'每周笔记',prev:'上次会议',table:'结果表',generic:'强的通用提示词',aware:'面向导师的简报',
      outNote:'两份简报都是仓库附的示意，不是经过评分的模型运行结果。',
      exTitle:'完整示例和它的关卡',exLede:'仓库里更完整的示例：简报依据的状态文件，以及简报本身。点一条事实，看简报在哪里引用它。',
      facts:'事实',layers:{observation:'观察',interpretation:'解读',hypothesis:'假设',proposal:'提案'},reasoning:'分层的推论',
      continuity:'从上次会议延续',status:{partial:'部分完成',done:'完成',not_started:'未开始'},attack:'可能被质疑的地方',ask:'唯一的决定',
      option:{proposed:'提出',supplied:'提供'},required:'必留',briefT:'简报（meeting-brief.md）',gatesT:'示例本身通过的关卡',
      gate:{rms:'状态文件结构与不变量',sources:'每段引用都在标注的那一行',numbers:'每个数字都绑定一条事实',profile:'导师档案规则',profile_sources:'档案证据确实在笔记里'},
      passed:'通过',failed:'不通过',
      refTitle:'关卡会拒绝什么',refLede:'同一个示例，被改成夸大其词的版本。每张卡是一种修改，以及验证器的回答。',
      tabs:{brief:'简报',rms:'状态文件',profile:'导师档案'},
      edits:{wrong_number:['数字被改了','baseline 从 72.3 变成 72.8。'],swapped_values:['数值对调','baseline 和 compression 的数值互换，引用不变。'],
        unrecorded_math:['没有声明的计算','加上“掉了 7.2 分”，但状态文件没有声明这个计算。'],hedge_dropped:['去掉“大约”','“回到大约 70”变成“回到 70”。'],
        spelled_decimal:['用文字写数字','“低了 seven point two”想绕过数字检查。'],
        claimed_completion:['在文字里声称完成','“只完成一半”变成“已完成”。没有数字改变，所以数字关卡通过；Skill 的规则禁止这样写，但没有脚本读这句话。'],
        m_quote_changed:['引用和笔记不符','F01 引用的是 75.0，但笔记第 7 行写的是 72.3。'],m_wrong_condition:['条件标错','F01 的数值被标成“compression setup”，引用里根本没有这个条件。'],
        m_hedge_as_exact:['大约被标成精确','F03 的“大约 70”被标成精确值。'],m_invented_option:['没人提供的选项','“放弃压缩研究”被标成“提供的”，却没有来源事实。'],
        m_dropped_required:['略掉不利的事实','F04（做了一半的对照实验）明明标成必留，却被移到“省略”。'],
        m_marked_done:['把上次的交办标成完成','导师的要求 A12 被改成完成。它的引用还在，所以两个关卡都通过；状态本身的意思不会被检查。'],
        p_stereotype:['从背景推测特质','在导师档案里加上“国籍风格”。'],p_one_meeting_pattern:['一次会议就当成规律','“重复行为”只引用了一次会议。'],
        p_impression_as_fact:['印象被当成高置信度','学生的个人印象被记成高置信度。'],p_quote_not_in_notes:['没说过的反馈','引用的反馈不在会议笔记里。']},
      limitT:'仍需要人来判断',limit:'这两种会通过。关卡检查的是引用、数字和结构；一句话或一个状态在意思上是否属实，交给模型遵守的规则，以及你自己。',
      numTitle:'数字',
      nums:[['{c}','项静态检查为这一页重跑通过，另有结构契约测试'],['{k}/{n}','种不诚实的修改被挡下；其余 {m} 种在上面列为限制'],['{d} · {x}','个行为案例定义 · 目前真正用模型正式跑过的数量'],['{r}','个路由冲突案例；{s} 条公开回顾记录，只用来整理问题主题']],
      numNote:'仓库里的开发运行记录，是由开发这个 Skill 的同一个会话生成的，所以标为“受污染”。目前没有跨模型评估，也没有真实配对的会议评估；下一个里程碑是五场经同意、事前配对的真实会议。',
      src:'数据：Research Meeting Coach {v} · commit {c} · 运行于 {d}'}}[locale]);
  let rmData=null;
  const rmState={tab:'brief',f:''};
  const RM_GATE={rms:'validate_rms.py',sources:'validate_source_grounding.py',numbers:'validate_numeric_closed_world.py',profile:'validate_advisor_profile.py',profile_sources:'validate_advisor_profile_grounding.py'};
  // a small Markdown renderer for the committed briefs: headings, lists, tables, paragraphs, bold, code and [F01] citations
  function rmMd(md) {
    const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\[([FARGQ]\d{2})\]/g,'<i class="rm-cite" data-rm-f="$1">$1</i>');
    const out=[]; let list=null, table=null;
    const flush=()=>{ if(list){ out.push(`<ul>${list.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`); list=null; }
      if(table){ out.push(`<table>${table.map((r,i)=>`<tr>${r.map(c=>i?`<td>${inline(c)}</td>`:`<th>${inline(c)}</th>`).join('')}</tr>`).join('')}</table>`); table=null; } };
    md.split('\n').forEach(line=>{ const l=line.trim();
      if(l.startsWith('|')){ if(!/^\|[-| :]+\|$/.test(l)) (table=table||[]).push(l.slice(1,-1).split('|').map(x=>x.trim())); return; }
      if(l.startsWith('- ')){ (list=list||[]).push(l.slice(2)); return; }
      flush(); if(!l) return;
      const h=l.match(/^(#{1,3}) (.*)/);
      out.push(h?`<h${h[1].length+3}>${inline(h[2])}</h${h[1].length+3}>`:`<p>${inline(l)}</p>`); });
    flush(); return out.join('');
  }
  const rmCsv=text=>{ const rows=text.split('\n').map(r=>r.split(',')); return `<table>${rows.map((r,i)=>`<tr>${r.map(x=>i?`<td>${esc(x)}</td>`:`<th>${esc(x.replace(/_/g,' '))}</th>`).join('')}</tr>`).join('')}</table>`; };
  function rmShowcase() {
    const c=rmCopy();
    return `<section class="rm-show"><p class="rm-note"><b translate="no"></b><span class="rm-note-t"></span></p>
      <h2>${esc(c.archTitle)}</h2><ol class="rm-flow">${c.arch.map(([t,d],i)=>`<li style="--i:${i}"><span class="rm-n">${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <p class="rm-skill"><b>${esc(c.skillT)}</b><span>${esc(c.skill)}</span></p>
      <div class="rm-rules">${c.rules.map(([t,d])=>`<div><b>${esc(t)}</b><small>${esc(d)}</small></div>`).join('')}</div>
      <h2>${esc(c.demoTitle)}</h2><p class="screen-intro">${esc(c.demoLede)}</p><div class="rm-before"></div>
      <h2>${esc(c.exTitle)}</h2><p class="screen-intro">${esc(c.exLede)}</p><div class="rm-example"></div>
      <h2>${esc(c.refTitle)}</h2><p class="screen-intro">${esc(c.refLede)}</p><div class="rm-refs"><div class="rm-tabs" role="tablist" aria-label="${esc(c.refTitle)}"></div><div class="rm-cards" aria-live="polite"></div></div>
      <div class="rm-limits"></div>
      <h2>${esc(c.numTitle)}</h2><div class="rm-nums"></div><p class="comment-line">${esc(c.numNote)}</p><p class="rm-src"></p></section>`;
  }
  function rmPaintRefs() {
    const box=$('.rm-show'); if(!box||!rmData) return;
    const c=rmCopy(), tabs=['brief','rms','profile'];
    box.querySelector('.rm-tabs').innerHTML=tabs.map(k=>`<button type="button" role="tab" data-rm-tab="${k}" aria-selected="${k===rmState.tab}" tabindex="${k===rmState.tab?0:-1}">${esc(c.tabs[k])}<i>${rmData.edits.filter(e=>e.target===k&&e.caught).length}</i></button>`).join('');
    const card=e=>{ const [t,d]=c.edits[e.id]||[e.id,''];
      const diff=e.old?`<pre class="rm-diff" translate="no"><code><span class="d-del">- ${esc(e.old)}</span><span class="d-add">+ ${esc(e.new)}</span></code></pre>`:'';
      const gates=Object.entries(e.gates).map(([g,v])=>`<p class="rm-g ${v.status==='failed'?'is-no':'is-ok'}"><code translate="no">${esc(RM_GATE[g]||g)}</code><em>${esc(v.status==='failed'?c.failed:c.passed)}</em>${v.errors.slice(0,2).map(x=>`<small translate="no">${esc(x)}</small>`).join('')}</p>`).join('');
      return `<div class="rm-card${e.caught?'':' is-limit'}"><b>${esc(t)}</b><small>${esc(d)}</small>${diff}${gates}</div>`; };
    box.querySelector('.rm-cards').innerHTML=rmData.edits.filter(e=>e.target===rmState.tab&&e.caught).map(card).join('');
    const limits=rmData.edits.filter(e=>!e.caught);
    box.querySelector('.rm-limits').innerHTML=limits.length?`<h3>${esc(c.limitT)}</h3><p class="rm-limit-t">${esc(c.limit)}</p><div class="rm-cards">${limits.map(card).join('')}</div>`:'';
  }
  function rmPaintFacts() {
    const box=$('.rm-show'); if(!box) return;
    box.querySelectorAll('[data-rm-f]').forEach(el=>el.classList.toggle('is-on',!!rmState.f&&el.dataset.rmF===rmState.f));
  }
  function rmStatic() {
    const box=$('.rm-show'); if(!box||!rmData) return;
    const c=rmCopy(), D=rmData, R=D.rms, E=D.evals;
    box.querySelector('.rm-note b').textContent='v'+D.source.version; box.querySelector('.rm-note-t').textContent=c.note;
    box.querySelector('.rm-before').innerHTML=`<div class="rm-inputs"><h3>${esc(c.inputs)}</h3><div class="rm-in"><div><p class="rm-file" translate="no">raw-notes.md · ${esc(c.notes)}</p><div class="rm-doc">${rmMd(D.demo['raw-notes.md'])}</div></div>
        <div><p class="rm-file" translate="no">previous-meeting.md · ${esc(c.prev)}</p><div class="rm-doc">${rmMd(D.demo['previous-meeting.md'])}</div><p class="rm-file" translate="no">result.csv · ${esc(c.table)}</p><div class="rm-doc rm-csv">${rmCsv(D.demo['result.csv'])}</div></div></div></div>
      <div class="rm-outs"><div class="rm-out"><p class="rm-file" translate="no">generic-output.md · ${esc(c.generic)}</p><div class="rm-doc">${rmMd(D.demo['generic-output.md'])}</div></div>
        <div class="rm-out is-aware"><p class="rm-file" translate="no">advisor-aware-output.md · ${esc(c.aware)}</p><div class="rm-doc">${rmMd(D.demo['advisor-aware-output.md'])}</div></div></div><p class="rm-outnote">${esc(c.outNote)}</p>`;
    const req=new Set(R.facts.filter(f=>f.retention==='required').map(f=>f.id));
    const facts=`<ul class="rm-facts">${R.facts.map(f=>`<li data-rm-f="${esc(f.id)}" tabindex="0"><b translate="no">${esc(f.id)}</b><span>${esc(f.statement)}</span><small translate="no">${esc(f.source.locator)} · ${esc(f.evidence_class)}${(f.measurements||[]).map(m=>` · ${esc(m.metric)} ${esc(m.value)} (${esc(m.qualifier)})`).join('')}</small>${req.has(f.id)?`<em>${esc(c.required)}</em>`:''}</li>`).join('')}</ul>`;
    const layers=`<ol class="rm-layers">${R.reasoning_items.map(r=>`<li class="l-${esc(r.layer)}"><em>${esc(c.layers[r.layer]||r.layer)}</em><span>${esc(r.text)}</span><small translate="no">${(r.evidence_ids||[]).map(x=>`<i class="rm-cite" data-rm-f="${esc(x)}">${esc(x)}</i>`).join('')}</small></li>`).join('')}</ol>`;
    const A=R.continuity.previous_actions;
    const cont=`<ul class="rm-cont">${A.map(x=>`<li><b translate="no">${esc(x.id)}</b><span>${esc(x.item)}</span><em class="s-${esc(x.status)}">${esc(c.status[x.status]||x.status)}</em><small>“${esc(x.source.quote)}” <span translate="no">${esc(x.source.locator)}</span></small></li>`).join('')}</ul>`;
    const attack=`<ul class="rm-attack">${R.attack_surface.map(g=>`<li class="r-${esc(g.risk.toLowerCase())}"><em translate="no">${esc(g.risk)}</em><span>${esc(g.gap)}</span><small>${esc(g.minimum_repair)}</small></li>`).join('')}</ul>`;
    const ask=R.asks.map(q=>`<div class="rm-ask"><b>${esc(q.question)}</b>${q.options.map(o=>`<span>${esc(o.label)} <em>${esc(c.option[o.provenance]||o.provenance)}</em></span>`).join('')}</div>`).join('');
    const gates=Object.entries(D.base).map(([g,v])=>`<li class="${v.status==='passed'?'is-ok':'is-no'}"><i>${v.status==='passed'?'✓':'✕'}</i><span>${esc(c.gate[g]||g)}</span><code translate="no">${esc(RM_GATE[g]||g)}</code></li>`).join('');
    box.querySelector('.rm-example').innerHTML=`<div class="rm-cols"><div><h3>${esc(c.facts)}</h3>${facts}<h3>${esc(c.reasoning)}</h3>${layers}<h3>${esc(c.continuity)}</h3>${cont}<h3>${esc(c.attack)}</h3>${attack}<h3>${esc(c.ask)}</h3>${ask}</div>
      <div><h3>${esc(c.briefT)}</h3><div class="rm-doc rm-brief">${rmMd(D.brief)}</div><h3>${esc(c.gatesT)}</h3><ul class="rm-gates">${gates}</ul></div></div>`;
    const caught=D.edits.filter(e=>e.caught).length;
    const vals=[{c:D.checks},{k:caught,n:D.edits.length,m:D.edits.length-caught},{d:E.case_definition_count,x:E.executed_case_definition_count},{r:E.routing_case_count,s:D.seed_records}];
    box.querySelector('.rm-nums').innerHTML=c.nums.map(([big,small],j)=>`<div style="--i:${j}"><b>${esc(csFill(big,vals[j]))}</b><small>${esc(csFill(small,vals[j]))}</small></div>`).join('');
    box.querySelector('.rm-src').textContent=csFill(c.src,{v:D.source.version,c:D.source.commit.slice(0,7),d:D.source.run});
  }
  function initMeetingCoach() {
    const box=$('.rm-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    const go=()=>{ rmStatic(); rmPaintRefs(); rmPaintFacts(); };
    if(rmData) go(); else fetch('/assets/rmc/showcase.json?v=1').then(r=>r.json()).then(d=>{rmData=d;go();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{
    const t=event.target.closest('[data-rm-tab]'); if(t){ rmState.tab=t.dataset.rmTab; rmPaintRefs(); return; }
    const f=event.target.closest('.rm-show [data-rm-f]'); if(f){ rmState.f=rmState.f===f.dataset.rmF?'':f.dataset.rmF; rmPaintFacts(); }
  });
  root.addEventListener('keydown',event=>{
    const f=event.target.closest?.('.rm-facts [data-rm-f]');
    if(f&&(event.key==='Enter'||event.key===' ')){ event.preventDefault(); rmState.f=rmState.f===f.dataset.rmF?'':f.dataset.rmF; rmPaintFacts(); return; }
    const b=event.target.closest?.('[data-rm-tab]'); if(!b||!['ArrowLeft','ArrowRight'].includes(event.key)||!rmData) return;
    event.preventDefault(); const tabs=['brief','rms','profile'], i=tabs.indexOf(rmState.tab);
    rmState.tab=tabs[(i+(event.key==='ArrowRight'?1:2))%3]; rmPaintRefs(); $(`[data-rm-tab="${rmState.tab}"]`)?.focus();
  });
  /* ChromaRecover (flagship): the film (assets/film/chromarecover.html), the in-browser lab (lab/chromarecover/), then what it
     solves, for whom, how it decides and what real runs produced. Every number comes from assets/chromarecover/data.json and
     film.json, written by tools/chromarecover_showcase.py and tools/chromarecover_parity.py from the pinned commit. */
  const crCopy=()=>({
    en:{film:'Watch the ChromaRecover film',filmSub:'About 90 s, one continuous take through a real recovery: the tiles, their colours in Lab space, 156 competing masks, the decision contract, the evidence behind “820”, and the decoy it refuses to call.',
      filmNote:'Every shape in the film is data from one run of the pinned commit: the generator’s plate, the tiles ChromaRecover segments, their Lab colours, every scored hypothesis, the winner’s metrics and the evidence map it returned.',
      tryT:'Try it in your browser',tryS:'Hide your own number in a plate, drop in an image, or rerun the examples. The real Python package runs on your device (Pyodide / WebAssembly); nothing is uploaded.',
      tryChips:['the real package, SHA-256 verified','same status and best pick as native on {n}/{t} examples','nothing leaves your device'],tryGo:'Open the lab',
      probT:'The problem it solves',probLead:'Some shapes are carried almost only by colour: a number drawn in one colour among others, a pattern that survives in hue while brightness stays flat. People with colour-vision differences, OCR and general vision models can all miss it, or worse, confidently read something that is not there.',
      probBody:'Tools that “enhance” such images usually return a single picture or a single answer. ChromaRecover returns the spatial structure itself, the evidence that supports it, and an explicit status: ok, uncertain or retry recommended. When the evidence is weak, it says so instead of guessing.',
      whoT:'Who it is for',whoYes:'Built for',whoNo:'Not a replacement for',
      yes:['accessibility researchers and tool builders who need to see what colour alone encodes','image and document analysts who need auditable masks, not a guess','computer-vision researchers studying colour-carried structure and abstention'],
      no:['a medical colour-vision test','OCR: reading digits is optional, conservative and never decides the pixels','a detector of hidden messages in ordinary photographs'],
      howT:'How it decides',
      how:[['Normalise','The image is decoded (EXIF, ICC to sRGB) and analysed on a copy of at most {side} px; every result is mapped back to full resolution.'],
        ['Four colour views','Absolute chroma (Lab a*, b*), local chroma with shading removed, opponent colour (R−G, (R+G)/2−B), and all of them together.'],
        ['Competing masks','k-means with 2–6 clusters and their complements, thresholds along the main colour axes, nearby shapes grouped, and where the tiles of one colour gather: {h} distinct masks for the “820” plate.'],
        ['Scoring','Colour separation, spatial structure, focus away from the frame, edge evidence, agreement across colour views, a penalty for plain gradients, and the capture quality.'],
        ['The contract','ok needs decision confidence ≥ {thr}, a lead of {m} over the runner-up unless the two agree, and one of four evidence gates. Otherwise uncertain; a bad capture asks for a retry.'],
        ['Outputs','Selected pixels, their envelope, a continuous evidence map and an overlay, plus result.json with transforms and provenance. Reading digits is optional, runs afterwards and never changes the status.']],
      cT:'The same contract, twice',cLede:'The hidden-number plate and its decoy have the same colours and the same number of special tiles. Here is what the contract saw in each.',
      cRows:[['decision confidence','≥ {thr}'],['lead over runner-up','≥ {m}, or agreement'],['edge + residual gate','edge ≥ 0.55'],['mosaic distribution gate','≥ 0.77'],['status','']],
      cNote:'ok needs only one of the four evidence gates. On this plate the mosaic-distribution gate carries it; the edge gate does not fire, and the runner-up is close but selects largely the same pixels (IoU {v}).',
      pos:'Hides “820”',neg:'Decoy',agree:'agree (IoU {v})',
      galT:'Real results',galLede:'Every case ChromaRecover ran for this page, with the same configuration the lab uses. Switch the view to see what it selected and how strongly.',
      views:{input:'Input',overlay:'Overlay',evidence:'Evidence'},decision:'decision',truth:'precision {p} · recall {r}',
      names:{'mosaic-820':'Mosaic hiding “820”','mosaic-820-decoy':'Its decoy','mosaic-37':'Mosaic hiding “37”','dots-8':'Dot plate hiding “8”','dots-decoy':'Dot plate, no digit','mosaic-2026-fragment':'OK on a fragment of “2026”','camera-820':'“820” through a simulated camera','blank':'A blank card','ramp':'A smooth colour ramp'},
      measT:'Measured',
      meas:[['{p}/{t}','tests passed for this page'],['{g}/{G}','CI benchmark gates passed, re-run for this page'],['{b}/{n}','examples where the browser picks the same best candidate as native'],['{x}','largest decision-confidence difference between browser and native']],
      bench:[['Dot plates, 192 px','{ok} of {n} hidden digits ok · top-3 IoU median {iou} · {abs} of {n} decoys abstain (max {max})'],['Dot plates, 128 px','{ok} of {n} ok: at this size every plate abstains, by design · {abs} of {n} decoys abstain'],['Gradients and stripes','{ok} of {n} called ok · highest confidence {max}'],['Matched-colour mosaics','decoys: {abs} abstain, highest decision {max} · envelope IoU median {iou}']],
      extT:'Documented external runs (data not redistributable, not re-run here)',
      ext:[['SmartDoc','document-corner geometry: {d}/{f} frames found, median IoU {iou}, worst corner error {rmse}'],['ColorBlindnessEval','held-out group of {n} images: {a} digit readings accepted, {c} of them correct, {fa} false acceptances']],
      limT:'Limits, shown rather than hidden',
      lim:['ok means a coherent colour structure passed the contract. It says nothing about what the shape means.','ok can rest on a fragment: on the “2026” example every selected pixel belongs to the text (precision {p}), but only {r} of the text was found. The lab reports both numbers for any plate you generate.','Dot-plate decoys are not colour-matched the way mosaic decoys are, so they are the easier negative.','The digit reader’s templates include the font the plate generator draws with, so readings on generated plates are not a held-out test; the external run above is.','Camera mode is experimental and uncalibrated; geometry was checked on SmartDoc, recovery confidence was not.','Speed: about {ns} s natively and {bs} s in a browser for a 480 px plate on the machine that built this page.'],
      statusT:'Status',status:'Public alpha {v}. The digital path is the stable baseline; camera capture, burst fusion and restoration hypotheses are experimental. Next: independently licensed camera captures, broader primitive families, lower-memory bursts and measured performance work.',
      src:'Data: ChromaRecover {v} · commit {c} · native Python {py}, NumPy {np}, OpenCV {cv} · run {d}'},
    'zh-TW':{film:'觀看 ChromaRecover 動畫',filmSub:'約 90 秒一鏡到底，走過一次真實的找回：色塊、它們在 Lab 空間的顏色、156 個互相競爭的遮罩、決策契約、「820」背後的證據，以及它拒絕下結論的誘餌。',
      filmNote:'動畫裡的每個形狀都是固定 commit 一次執行的資料：產生器畫的色盤、ChromaRecover 切出的色塊、它們的 Lab 顏色、每一個評分過的假設、勝出者的指標，以及它回傳的證據圖。',
      tryT:'在你的瀏覽器試試',tryS:'把自己的數字藏進色盤、丟一張圖片進去，或重跑範例。真正的 Python 套件在你的裝置上執行（Pyodide / WebAssembly），不會上傳任何東西。',
      tryChips:['真正的套件，已驗證 SHA-256','{n}/{t} 個範例的狀態與最佳候選和本機相同','資料不會離開你的裝置'],tryGo:'打開實驗室',
      probT:'它解決什麼問題',probLead:'有些形狀幾乎只靠顏色撐著：用某一種顏色畫在其他顏色之間的數字、亮度平平只有色相在變的圖案。色覺差異者、OCR 和一般的視覺模型都可能看不見，甚至更糟：信心滿滿地讀出根本不存在的東西。',
      probBody:'「強化」這類圖片的工具，通常只給一張圖或一個答案。ChromaRecover 回傳的是空間結構本身、支持它的證據，以及明確的狀態：ok、uncertain 或 retry recommended。證據不夠時，它會直說，而不是用猜的。',
      whoT:'它是給誰用的',whoYes:'適合',whoNo:'不能取代',
      yes:['需要看清「只靠顏色編碼了什麼」的無障礙研究者與工具開發者','需要可稽核的遮罩、而不是猜測的影像與文件分析者','研究顏色承載結構與「不下結論」的電腦視覺研究者'],
      no:['醫療用的色覺檢測','OCR：讀數字是選用、保守的，而且永遠不決定像素','在一般照片裡偵測隱藏訊息'],
      howT:'它怎麼判斷',
      how:[['正規化','解碼圖片（EXIF、ICC 轉 sRGB），在最多 {side} px 的副本上分析；所有結果都映射回原始解析度。'],
        ['四種顏色觀點','絕對色度（Lab a*、b*）、去除陰影後的局部色度、對立色（R−G、(R+G)/2−B），以及全部合起來。'],
        ['互相競爭的遮罩','2 到 6 群的 k-means 與其補集、沿主要顏色軸的門檻、把相鄰形狀分組，以及某一色色塊聚集的位置：「820」色盤共有 {h} 個不同的遮罩。'],
        ['評分','顏色分離度、空間結構、是否遠離邊框、邊緣證據、不同顏色觀點的一致性、對單純漸層的懲罰，以及拍攝品質。'],
        ['契約','ok 需要決策信心 ≥ {thr}、領先亞軍 {m}（除非兩者一致），以及四道證據閘門之一。否則就是 uncertain；拍攝太差則要求重拍。'],
        ['輸出','選中的像素、它的範圍、連續的證據圖和疊圖，以及記錄轉換與來源的 result.json。讀數字是選用的、在之後才執行，而且永遠不改變狀態。']],
      cT:'同一份契約，看兩次',cLede:'藏著數字的色盤和它的誘餌，顏色相同、特殊色塊的數量也相同。以下是契約在兩者身上看到的。',
      cRows:[['決策信心','≥ {thr}'],['領先亞軍','≥ {m}，或兩者一致'],['邊緣＋殘差閘門','邊緣 ≥ 0.55'],['拼貼分布閘門','≥ 0.77'],['狀態','']],
      cNote:'ok 只需要四道證據閘門中的一道。這張色盤靠的是拼貼分布閘門；邊緣閘門沒有觸發，亞軍分數很接近，但選的幾乎是同一批像素（IoU {v}）。',
      pos:'藏著「820」',neg:'誘餌',agree:'一致（IoU {v}）',
      galT:'真實結果',galLede:'ChromaRecover 為這一頁跑過的每個案例，設定和實驗室相同。切換檢視，看它選了什麼、證據有多強。',
      views:{input:'輸入',overlay:'疊圖',evidence:'證據'},decision:'決策',truth:'精確率 {p} · 召回率 {r}',
      names:{'mosaic-820':'藏著「820」的拼貼','mosaic-820-decoy':'它的誘餌','mosaic-37':'藏著「37」的拼貼','dots-8':'藏著「8」的圓點色盤','dots-decoy':'沒有數字的圓點色盤','mosaic-2026-fragment':'只找到「2026」一小塊也 OK','camera-820':'模擬相機拍過的「820」','blank':'一張空白卡','ramp':'平滑的顏色漸層'},
      measT:'實測',
      meas:[['{p}/{t}','項測試為這一頁重跑通過'],['{g}/{G}','道 CI 評測關卡為這一頁重跑通過'],['{b}/{n}','個範例在瀏覽器選出的最佳候選和本機相同'],['{x}','瀏覽器與本機之間，決策信心的最大差距']],
      bench:[['圓點色盤，192 px','{n} 個藏數字的有 {ok} 個 ok · 前三名 IoU 中位數 {iou} · {n} 個誘餌有 {abs} 個不下結論（最高 {max}）'],['圓點色盤，128 px','{n} 個有 {ok} 個 ok：這個大小下全部刻意不下結論 · {n} 個誘餌有 {abs} 個不下結論'],['漸層與條紋','{n} 個中被判 ok 的有 {ok} 個 · 最高信心 {max}'],['顏色匹配的拼貼','誘餌：{abs} 不下結論，最高決策信心 {max} · 範圍 IoU 中位數 {iou}']],
      extT:'文件記錄的外部測試（資料不能重新散布，這裡沒有重跑）',
      ext:[['SmartDoc','文件角點幾何：{f} 幀找到 {d} 幀，IoU 中位數 {iou}，最差角點誤差 {rmse}'],['ColorBlindnessEval','保留組 {n} 張圖：接受 {a} 個數字讀數，其中 {c} 個正確，錯誤接受 {fa} 個']],
      limT:'限制，攤開來講',
      lim:['ok 代表一個一致的顏色結構通過了契約，不代表這個形狀有什麼意思。','ok 也可能建立在一小塊上：在「2026」範例裡，選中的像素全部屬於文字（精確率 {p}），但只找到文字的 {r}。你在實驗室產生的任何色盤，都會同時顯示這兩個數字。','圓點色盤的誘餌不像拼貼誘餌那樣匹配顏色，所以是比較容易的反例。','讀數字的範本包含了色盤產生器所用的字型，所以產生的色盤上的讀數不算保留測試；上面的外部測試才是。','camera 模式是實驗性的、尚未校準；幾何在 SmartDoc 上檢查過，找回的信心沒有。','速度：在建置這一頁的機器上，一張 480 px 色盤本機約 {ns} 秒、瀏覽器約 {bs} 秒。'],
      statusT:'現況',status:'公開 alpha {v}。digital 路徑是穩定的基準；相機拍攝、多張融合與還原假設仍是實驗性的。接下來：取得獨立授權的相機照片、更多種類的基本形狀、更省記憶體的多張處理，以及實測的效能改善。',
      src:'資料：ChromaRecover {v} · commit {c} · 本機 Python {py}、NumPy {np}、OpenCV {cv} · 執行於 {d}'},
    'zh-CN':{film:'观看 ChromaRecover 动画',filmSub:'约 90 秒一镜到底，走过一次真实的找回：色块、它们在 Lab 空间的颜色、156 个互相竞争的遮罩、决策契约、“820”背后的证据，以及它拒绝下结论的诱饵。',
      filmNote:'动画里的每个形状都是固定 commit 一次运行的数据：生成器画的色盘、ChromaRecover 切出的色块、它们的 Lab 颜色、每一个评分过的假设、胜出者的指标，以及它返回的证据图。',
      tryT:'在你的浏览器试试',tryS:'把自己的数字藏进色盘、拖一张图片进去，或重跑示例。真正的 Python 包在你的设备上运行（Pyodide / WebAssembly），不会上传任何东西。',
      tryChips:['真正的包，已验证 SHA-256','{n}/{t} 个示例的状态与最佳候选和本机相同','数据不会离开你的设备'],tryGo:'打开实验室',
      probT:'它解决什么问题',probLead:'有些形状几乎只靠颜色撑着：用某一种颜色画在其他颜色之间的数字、亮度平平只有色相在变的图案。色觉差异者、OCR 和一般的视觉模型都可能看不见，甚至更糟：信心满满地读出根本不存在的东西。',
      probBody:'“增强”这类图片的工具，通常只给一张图或一个答案。ChromaRecover 返回的是空间结构本身、支持它的证据，以及明确的状态：ok、uncertain 或 retry recommended。证据不够时，它会直说，而不是靠猜。',
      whoT:'它是给谁用的',whoYes:'适合',whoNo:'不能取代',
      yes:['需要看清“只靠颜色编码了什么”的无障碍研究者与工具开发者','需要可审计的遮罩、而不是猜测的图像与文档分析者','研究颜色承载结构与“不下结论”的计算机视觉研究者'],
      no:['医疗用的色觉检测','OCR：读数字是可选、保守的，而且永远不决定像素','在一般照片里检测隐藏信息'],
      howT:'它怎么判断',
      how:[['规范化','解码图片（EXIF、ICC 转 sRGB），在最多 {side} px 的副本上分析；所有结果都映射回原始分辨率。'],
        ['四种颜色视角','绝对色度（Lab a*、b*）、去除阴影后的局部色度、对立色（R−G、(R+G)/2−B），以及全部合起来。'],
        ['互相竞争的遮罩','2 到 6 簇的 k-means 与其补集、沿主要颜色轴的门槛、把相邻形状分组，以及某一色色块聚集的位置：“820”色盘共有 {h} 个不同的遮罩。'],
        ['评分','颜色分离度、空间结构、是否远离边框、边缘证据、不同颜色视角的一致性、对单纯渐变的惩罚，以及拍摄质量。'],
        ['契约','ok 需要决策置信度 ≥ {thr}、领先亚军 {m}（除非两者一致），以及四道证据闸门之一。否则就是 uncertain；拍摄太差则要求重拍。'],
        ['输出','选中的像素、它的范围、连续的证据图和叠图，以及记录变换与来源的 result.json。读数字是可选的、在之后才运行，而且永远不改变状态。']],
      cT:'同一份契约，看两次',cLede:'藏着数字的色盘和它的诱饵，颜色相同、特殊色块的数量也相同。以下是契约在两者身上看到的。',
      cRows:[['决策置信度','≥ {thr}'],['领先亚军','≥ {m}，或两者一致'],['边缘＋残差闸门','边缘 ≥ 0.55'],['拼贴分布闸门','≥ 0.77'],['状态','']],
      cNote:'ok 只需要四道证据闸门中的一道。这张色盘靠的是拼贴分布闸门；边缘闸门没有触发，亚军分数很接近，但选的几乎是同一批像素（IoU {v}）。',
      pos:'藏着“820”',neg:'诱饵',agree:'一致（IoU {v}）',
      galT:'真实结果',galLede:'ChromaRecover 为这一页跑过的每个案例，配置和实验室相同。切换视图，看它选了什么、证据有多强。',
      views:{input:'输入',overlay:'叠图',evidence:'证据'},decision:'决策',truth:'精确率 {p} · 召回率 {r}',
      names:{'mosaic-820':'藏着“820”的拼贴','mosaic-820-decoy':'它的诱饵','mosaic-37':'藏着“37”的拼贴','dots-8':'藏着“8”的圆点色盘','dots-decoy':'没有数字的圆点色盘','mosaic-2026-fragment':'只找到“2026”一小块也 OK','camera-820':'模拟相机拍过的“820”','blank':'一张空白卡','ramp':'平滑的颜色渐变'},
      measT:'实测',
      meas:[['{p}/{t}','项测试为这一页重跑通过'],['{g}/{G}','道 CI 评测关卡为这一页重跑通过'],['{b}/{n}','个示例在浏览器选出的最佳候选和本机相同'],['{x}','浏览器与本机之间，决策置信度的最大差距']],
      bench:[['圆点色盘，192 px','{n} 个藏数字的有 {ok} 个 ok · 前三名 IoU 中位数 {iou} · {n} 个诱饵有 {abs} 个不下结论（最高 {max}）'],['圆点色盘，128 px','{n} 个有 {ok} 个 ok：这个大小下全部刻意不下结论 · {n} 个诱饵有 {abs} 个不下结论'],['渐变与条纹','{n} 个中被判 ok 的有 {ok} 个 · 最高置信度 {max}'],['颜色匹配的拼贴','诱饵：{abs} 不下结论，最高决策置信度 {max} · 范围 IoU 中位数 {iou}']],
      extT:'文档记录的外部测试（数据不能重新分发，这里没有重跑）',
      ext:[['SmartDoc','文档角点几何：{f} 帧找到 {d} 帧，IoU 中位数 {iou}，最差角点误差 {rmse}'],['ColorBlindnessEval','保留组 {n} 张图：接受 {a} 个数字读数，其中 {c} 个正确，错误接受 {fa} 个']],
      limT:'限制，摊开来讲',
      lim:['ok 代表一个一致的颜色结构通过了契约，不代表这个形状有什么意思。','ok 也可能建立在一小块上：在“2026”示例里，选中的像素全部属于文字（精确率 {p}），但只找到文字的 {r}。你在实验室生成的任何色盘，都会同时显示这两个数字。','圆点色盘的诱饵不像拼贴诱饵那样匹配颜色，所以是比较容易的反例。','读数字的模板包含了色盘生成器所用的字体，所以生成的色盘上的读数不算保留测试；上面的外部测试才是。','camera 模式是实验性的、尚未校准；几何在 SmartDoc 上检查过，找回的置信度没有。','速度：在构建这一页的机器上，一张 480 px 色盘本机约 {ns} 秒、浏览器约 {bs} 秒。'],
      statusT:'现状',status:'公开 alpha {v}。digital 路径是稳定的基准；相机拍摄、多张融合与还原假设仍是实验性的。接下来：获取独立授权的相机照片、更多种类的基本形状、更省内存的多张处理，以及实测的性能改进。',
      src:'数据：ChromaRecover {v} · commit {c} · 本机 Python {py}、NumPy {np}、OpenCV {cv} · 运行于 {d}'}}[locale]);
  let crData=null, crFilm=null;
  const crLut=(()=>{ const S=[[0,[0,0,4]],[.25,[66,10,104]],[.5,[147,38,103]],[.75,[229,92,48]],[.9,[248,173,22]],[1,[252,255,164]]], L=new Uint8ClampedArray(768);
    for(let i=0;i<256;i++){ const x=i/255; let k=0; while(k<S.length-2&&x>S[k+1][0]) k++; const [x0,c0]=S[k],[x1,c1]=S[k+1],u=(x-x0)/(x1-x0); for(let j=0;j<3;j++) L[i*3+j]=c0[j]+(c1[j]-c0[j])*u; } return L; })();
  const crInk=new Map();
  function crColor(img) {
    const src=img.dataset.ev; if(crInk.has(src)){ img.src=crInk.get(src); return; }
    const im=new Image(); im.onload=()=>{ const cv=document.createElement('canvas'); cv.width=im.naturalWidth; cv.height=im.naturalHeight; const g=cv.getContext('2d'); g.drawImage(im,0,0);
      const d=g.getImageData(0,0,cv.width,cv.height), p=d.data; for(let i=0;i<p.length;i+=4){ const v=p[i]; p[i]=crLut[v*3]; p[i+1]=crLut[v*3+1]; p[i+2]=crLut[v*3+2]; p[i+3]=255; }
      g.putImageData(d,0,0); const url=cv.toDataURL('image/png'); crInk.set(src,url); if(img.dataset.ev===src) img.src=url; }; im.src=src; }
  const crState={view:'overlay'};
  function crShowcase() {
    const c=crCopy();
    return `<section class="cr-show"><a class="cap-film cr-film" href="/assets/film/chromarecover.html?lang=${locale}" data-src="/assets/film/chromarecover.html" data-title="ChromaRecover" aria-haspopup="dialog"><video src="/assets/chromarecover/teaser.mp4?v=1" poster="/assets/chromarecover/teaser-poster.jpg?v=1" muted loop playsinline preload="metadata" ${motion()?'autoplay':''} aria-hidden="true"></video><span class="cap-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span><span class="cap-film-text"><b>${esc(c.film)}</b><small>${esc(c.filmSub)}</small></span></a><p class="comment-line cr-filmnote">${esc(c.filmNote)}</p>
      <a class="cr-try" href="/lab/chromarecover/?lang=${locale}"><img src="/assets/og/chromarecover-demo.jpg" alt="" width="1200" height="630" loading="lazy"><span class="cr-try-t"><b>${esc(c.tryT)}</b><small>${esc(c.tryS)}</small><span class="cr-chips"></span><em>${esc(c.tryGo)} →</em></span></a>
      <h2>${esc(c.probT)}</h2><p class="cr-lead">${esc(c.probLead)}</p><p class="cr-p">${esc(c.probBody)}</p>
      <h2>${esc(c.whoT)}</h2><div class="cr-who"><div><h3>${esc(c.whoYes)}</h3><ul>${c.yes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="is-no"><h3>${esc(c.whoNo)}</h3><ul>${c.no.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <h2>${esc(c.howT)}</h2><ol class="cr-how"></ol>
      <h2>${esc(c.cT)}</h2><p class="screen-intro">${esc(c.cLede)}</p><div class="cr-contract"></div>
      <h2>${esc(c.galT)}</h2><p class="screen-intro">${esc(c.galLede)}</p><div class="cr-views" role="tablist"></div><div class="cr-gal"></div>
      <h2>${esc(c.measT)}</h2><div class="cr-meas"></div><div class="cr-bench"></div><h3 class="cr-exth">${esc(c.extT)}</h3><div class="cr-ext"></div>
      <h2>${esc(c.limT)}</h2><ul class="cr-lim"></ul>
      <h2>${esc(c.statusT)}</h2><p class="cr-p cr-status"></p><p class="cr-src"></p></section>`;
  }
  function crGallery() {
    const box=$('.cr-show'); if(!box||!crData) return;
    const c=crCopy(), D=crData, v=crState.view;
    box.querySelector('.cr-views').innerHTML=Object.entries(c.views).map(([k,label])=>`<button type="button" role="tab" data-cr-view="${k}" aria-selected="${k===v}">${esc(label)}</button>`).join('');
    box.querySelector('.cr-gal').innerHTML=D.gallery.map((g,i)=>{ const b=g.candidates[0], has=!!b, file=v==='input'||!has?'input.png':v==='overlay'?'overlay_1.webp':'evidence_1.webp';
      const tr=b&&b.truth_support?`<small class="cr-truth">${esc(csFill(c.truth,{p:`${Math.round(b.truth_support.precision*100)}%`,r:`${Math.round(b.truth_support.recall*100)}%`}))}</small>`:'';
      const url=`/assets/chromarecover/gallery/${esc(g.id)}/${file}`, ev=v==='evidence'&&has;
      return `<figure class="cr-case s-${esc(g.status)}${ev?' is-ev':''}" style="--i:${i}"><img src="${ev?'/assets/chromarecover/gallery/'+esc(g.id)+'/input.png':url}"${ev?` data-ev="${url}"`:''} alt="${esc(c.names[g.id]||g.id)}" loading="lazy" width="240" height="240"><figcaption><b>${esc(c.names[g.id]||g.id)}</b><span><em class="cr-st">${esc(g.status.replace('_',' '))}</em>${has?` ${esc(c.decision)} ${b.decision.toFixed(3)}`:''}</span>${tr}</figcaption></figure>`; }).join('');
    box.querySelectorAll('.cr-gal img[data-ev]').forEach(crColor);
  }
  function crStatic() {
    const box=$('.cr-show'); if(!box||!crData||!crFilm) return;
    const c=crCopy(), D=crData, P=crFilm.positive, Dc=crFilm.decoy, M=P.best.metrics, Md=Dc.best.metrics, thr=D.config.confidence_threshold, m=D.config.ambiguity_margin, par=D.parity;
    box.querySelector('.cr-chips').innerHTML=c.tryChips.map(x=>`<i>${esc(csFill(x,{n:par?Math.min(par.status_same,par.best_same):'—',t:par?par.total:'—'}))}</i>`).join('');
    box.querySelector('.cr-how').innerHTML=c.how.map(([t,d],i)=>`<li style="--i:${i}"><span class="cr-n">${i+1}</span><b>${esc(t)}</b><small>${esc(csFill(d,{side:D.config.analysis_max_side,h:P.scored.length,thr,m}))}</small></li>`).join('');
    const cell=(ok,val)=>`<td class="${ok===null?'':ok?'y':'n'}">${ok===null?'':ok?'✓ ':'✕ '}${esc(val)}</td>`;
    const rows=[[P.best.decision>=thr,P.best.decision.toFixed(3),Dc.best.decision>=thr,Dc.best.decision.toFixed(3)],
      [M.runner_up_margin>=m||M.consensus_support>=1,M.runner_up_margin>=m?M.runner_up_margin.toFixed(3):csFill(c.agree,{v:M.runner_up_consensus_iou.toFixed(3)}),Md.runner_up_margin>=m||Md.consensus_support>=1,Md.runner_up_margin>=m?Md.runner_up_margin.toFixed(3):(Md.consensus_support>=1?csFill(c.agree,{v:Md.runner_up_consensus_iou.toFixed(3)}):Md.runner_up_margin.toFixed(3))],
      [M.boundary_evidence>=.55&&M.local_residual_support>=.30&&M.color_separation>=.60,M.boundary_evidence.toFixed(3),Md.boundary_evidence>=.55&&Md.local_residual_support>=.30&&Md.color_separation>=.60,Md.boundary_evidence.toFixed(3)],
      [M.mosaic_distribution_score>=.77,M.mosaic_distribution_score.toFixed(3),Md.mosaic_distribution_score>=.77,Md.mosaic_distribution_score.toFixed(3)]];
    box.querySelector('.cr-contract').innerHTML=`<div class="cr-plates"><figure><img src="/assets/chromarecover/gallery/mosaic-820/overlay_1.webp" alt="" loading="lazy" width="240" height="240"><figcaption>${esc(c.pos)}</figcaption></figure><figure><img src="/assets/chromarecover/gallery/mosaic-820-decoy/overlay_1.webp" alt="" loading="lazy" width="240" height="240"><figcaption>${esc(c.neg)}</figcaption></figure></div>
      <table class="cr-table"><thead><tr><th></th><th>${esc(c.pos)}</th><th>${esc(c.neg)}</th></tr></thead><tbody>${c.cRows.slice(0,4).map(([k,need],i)=>`<tr><th>${esc(k)}<small>${esc(csFill(need,{thr,m}))}</small></th>${cell(rows[i][0],rows[i][1])}${cell(rows[i][2],rows[i][3])}</tr>`).join('')}
      <tr class="cr-final"><th>${esc(c.cRows[4][0])}</th><td><em class="cr-stamp ok">${esc(P.status.toUpperCase())}</em></td><td><em class="cr-stamp unc">${esc(Dc.status.toUpperCase())}</em></td></tr></tbody></table><p class="cr-note">${esc(csFill(c.cNote,{v:M.runner_up_consensus_iou.toFixed(3)}))}</p>`;
    const B=Object.fromEntries(D.benchmarks.map(b=>[`${b.script}:${b.size}`,b.result]));
    const s192=B['evaluate_synthetic.py:192'], s128=B['evaluate_synthetic.py:128'], n160=B['evaluate_nuisance.py:160'], n384=B['evaluate_nuisance.py:384'], mo=B['evaluate_mosaic.py:192'];
    const fx=v=>Number(v).toFixed(2), cnt=(rate,n)=>Math.round(rate*n);
    const bench=[{n:s192.cases_per_class,ok:cnt(s192.structured.ok_rate,s192.cases_per_class),iou:fx(s192.structured.median_top3_iou),abs:cnt(s192.no_structure.abstention_rate,s192.cases_per_class),max:fx(s192.no_structure.maximum_candidate_confidence)},
      {n:s128.cases_per_class,ok:cnt(s128.structured.ok_rate,s128.cases_per_class),abs:cnt(s128.no_structure.abstention_rate,s128.cases_per_class)},
      {n:n160.cases+n384.cases,ok:n160.ok_count+n384.ok_count,max:fx(Math.max(n160.maximum_confidence,n384.maximum_confidence))},
      {abs:`${cnt(mo.no_structure.abstention_rate,mo.cases_per_class)}/${mo.cases_per_class}`,max:fx(mo.no_structure.maximum_decision_confidence),iou:fx(mo.structured.median_top5_structure_iou)}];
    const T=D.tests, passed=D.benchmarks.filter(b=>b.passed).length;
    const vals=[{p:T.passed,t:T.collected},{g:passed,G:D.benchmarks.length},{b:par?par.best_same:'—',n:par?par.total:'—'},{x:par?par.max_abs_diff.toExponential(1):'—'}];
    box.querySelector('.cr-meas').innerHTML=c.meas.map(([big,small],i)=>`<div style="--i:${i}"><b>${esc(csFill(big,vals[i]))}</b><small>${esc(csFill(small,vals[i]))}</small></div>`).join('');
    box.querySelector('.cr-bench').innerHTML=c.bench.map(([t,d],i)=>`<div><b>${esc(t)}</b><small>${esc(csFill(d,bench[i]))}</small></div>`).join('');
    const E=D.external;
    box.querySelector('.cr-ext').innerHTML=c.ext.map(([t,d],i)=>`<div><b>${esc(t)}</b><small>${esc(csFill(d,i===0?{d:E.smartdoc.detected,f:E.smartdoc.frames,iou:E.smartdoc.median_iou,rmse:E.smartdoc.max_rmse}:{n:E.colorblindness.images,a:E.colorblindness.accepted,c:E.colorblindness.correct,fa:E.colorblindness.false_accept}))}</small></div>`).join('');
    const frag=D.gallery.find(g=>g.id==='mosaic-2026-fragment'), fb=frag&&frag.candidates[0];
    const med=a=>{ const s=[...a].sort((x,y)=>x-y); return s.length?s[Math.floor(s.length/2)]:0; };
    const g480=D.gallery.filter(g=>g.width===480&&g.candidates.length), ns=med(g480.map(g=>g.wall_s)).toFixed(1), bs=par?(med(par.cases.filter(x=>g480.some(g=>g.id===x.id)).map(x=>x.browser_ms))/1000).toFixed(1):'—';
    box.querySelector('.cr-lim').innerHTML=c.lim.map(x=>`<li>${esc(csFill(x,{p:fb?`${Math.round(fb.truth_support.precision*100)}%`:'—',r:fb?`${Math.round(fb.truth_support.recall*100)}%`:'—',ns,bs}))}</li>`).join('');
    box.querySelector('.cr-status').textContent=csFill(c.status,{v:D.source.version});
    box.querySelector('.cr-src').textContent=csFill(c.src,{v:D.source.version,c:D.source.commit.slice(0,7),py:D.native.python,np:D.native.numpy,cv:D.native.opencv,d:D.source.run});
    crGallery();
  }
  function initChroma() {
    const box=$('.cr-show'); if(!box) return;
    box.classList.toggle('no-motion',!motion());
    if(crData&&crFilm) { crStatic(); return; }
    Promise.all([fetch('/assets/chromarecover/data.json?v=1').then(r=>r.json()),fetch('/assets/chromarecover/film.json?v=1').then(r=>r.json())]).then(([d,f])=>{crData=d;crFilm=f;crStatic();}).catch(()=>{});
  }
  root.addEventListener('click',event=>{ const b=event.target.closest('[data-cr-view]'); if(b){ crState.view=b.dataset.crView; crGallery(); } });
  /* Merriv: the film (assets/film/merriv.html), then what problem it solves, for whom, how, and what a real run produced.
     Numbers come from assets/merriv/summary.json, written by tools/merriv_film.py from a fresh run of Merriv's demos. */
  const mvCopy=()=>({
    en:{film:'Watch the Merriv film',filmSub:'About 100 s, one continuous take through a real ONNX FP16 → INT8 release: the holdout digits, clipped inputs, a saturated hidden layer, paired statistics, the first bad build and the Model Change Report.',
      filmNote:'Every shape in the film is data from one run of Merriv’s ONNX quantization demo. The ×0.55 and ×0.50 calibrations are deliberate negative controls, not estimates of real-world regressions.',
      probT:'The problem it solves',
      probLead:'You quantized a model to INT8, or changed its compiler or runtime. The new artifact builds and its outputs look fine. But can it actually replace the version in production?',
      probBody:'A model release crosses optimizers, compilers, runtimes, hardware, registries, CI and several teams. Each tool can be right on its own while the evidence ends up scattered across evaluation databases, CI artifacts, notebooks, registry fields and an “OK” in a chat thread, so nobody can answer:',
      qs:[['Which two files were compared?','The exact baseline and candidate artifacts, not “the latest”.'],['Which evidence and policy decided?','Cases, metrics, margins and the statistical method.'],['Where was it produced?','Runtime, hardware, platform and versions.'],['Can another team check it?','Without importing the producer’s evaluation code.']],
      whoT:'Who it is for',whoYes:'Built for',whoNo:'Not a replacement for',
      whoTeams:'Model optimization, inference runtime, ML compiler, ML platform and release engineering teams reviewing changes such as:',
      changes:['FP16 → INT8 or FP8 quantization','new ONNX, TensorRT, OpenVINO or in-house compiler builds','compiler, runtime or execution-provider upgrades','backend migrations and hardware-specific builds','model release CI that needs a traceable handoff'],
      whoReg:'Also for teams in healthcare, finance, automotive and other governed fields that must keep model release records. It is not a compliance certification.',
      whoNot:'A training framework, an experiment tracker, a general model or prompt evaluation platform, a deployment controller, a registry or a serving system. Merriv connects the release evidence those systems already produce.',
      howT:'How it works',bindEq:'= one independently verifiable Model Change Report',
      bind:['exact baseline artifact','exact candidate artifact','evaluation evidence','statistical policy','evaluation decision','runtime and platform','first bad build (optional)'],
      steps:[['Pin identities','Both artifacts are content-hashed. Evidence, report and run each get their own ID, so a replay reproduces the same evidence ID.'],
        ['Evaluate in pairs','Both builds run the same cases, compared case by case with a matched test (e.g. a Tango score interval), Holm-corrected across rules, with power and minimum detectable effect recorded.'],
        ['Decide in five states','PASS, WARN, INSUFFICIENT_POWER, BLOCK or ERROR. Too little evidence never becomes a pass: it fails closed.'],
        ['Localize and hand off','Across several builds, a bisect finds the first bad one. Output is JSON, Markdown, JUnit and SARIF; anyone can run merriv mcr verify without importing merriv.']],
      resT:'Real result: one FP16 → INT8 release',
      resLead:'{n} paired holdout cases of UCI handwritten digits, {h} of them in the high-ink cohort. The weights stay fixed; only the INT8 calibration range changes.',
      th:['Build','Overall accuracy','High-ink accuracy','High-ink Δ, 95% interval (margin −{m} pp)','Gate'],ref:'REFERENCE',
      facts:[['First bad build','{fb}','found by monotonic bisect'],['Root cause','{cl}% of pixels cut','input ceiling 0.55 · high-ink {ch}% vs {cc}%'],['First divergent tensor','{ft}','cosine {cos} over the numerical diff'],['Paired outcomes','{lost} lost · {gained} gained','build-02 against FP16']],
      verT:'merriv mcr verify',ver:{integrity_verified:'integrity verified',bundle_complete:'bundle complete',producer_authenticated:'producer authenticated',independently_reproduced:'independently reproduced',deployment_authorization:'deployment authorization'},
      yes:'yes',no:'not claimed',ne:'not evaluated',verNote:'“valid” only means the report is internally consistent. It does not mean the model is safe or cleared to deploy.',
      caution:'Engineering fixture: ×0.55 and ×0.50 are deliberate negative controls chosen to exercise PASS / BLOCK / localization reliably, not estimates of how often or how badly real releases regress.',
      moreT:'Two more real cases',
      llamaT:'llama.cpp #22544: replaying a real quantization regression',
      llamaB:'Upstream reported that --tensor-type was ignored, so iq4_xs silently became q5_K. Rerunning the replay that ships with Merriv: both tensors are critical contract cases, so the release is BLOCKed (exit {code}). With only 2 cases the statistical rule alone is just WARN; a failed critical case blocks anyway.',
      llamaNote:'A replay of the observations published upstream, not a fresh run of the 27B model.',req:'requested',got:'realized',
      nvT:'NVIDIA ModelOpt → TensorRT on an RTX 4060',
      nvB:'Run on an RTX 4060 Laptop GPU on 2026-08-29: all 629 ONNX Runtime and TensorRT outputs matched within tolerance, yet a calibration-range change dropped the critical cohort from 91.49% to 78.72%. Re-evaluated with Tango inference it gives WARN, WARN, BLOCK, BLOCK, and the report states that the old first-bad-build claim does not carry over.',
      nvNote:'First-party evidence retained in the repository (quoted, not rerun here); not an independent or cross-hardware claim.',
      open:'Open',
      toolsT:'Where it sits among existing tools',toolsH:['Existing tools','Keep using them for','Merriv adds'],
      tools:[['Model optimizers and compilers','producing deployable artifacts','artifact identity, retained evidence, release semantics'],['Backend debuggers such as Polygraphy','layer and output comparison','a portable bundle for downstream verification and policy'],['Evaluation and registries such as MLflow','metrics, experiments, lifecycle','cross-tool evidence behind a producer-neutral report'],['CI and promotion controllers','running the workflow','fail-closed five-state decisions with auditable inputs']],
      status:'Status: pre-alpha reference implementation. MCR 0.4 is frozen for public external review; there is no external adopter yet and no claim of being a standard.',review:'External review',
      src:'Data: Merriv {c} · {rt} · run {d}'},
    'zh-TW':{film:'觀看 Merriv 動畫',filmSub:'約 100 秒一鏡到底，走完一次真實的 ONNX FP16 → INT8 發布：測試手寫數字、被削平的輸入、飽和的隱藏層、配對統計、第一個壞掉的 build，到 Model Change Report。',
      filmNote:'片中每個形狀都是 Merriv ONNX 量化實驗實際執行一次的資料。×0.55 和 ×0.50 的校準是刻意設計的負對照，不代表真實世界的回歸機率。',
      probT:'它解決什麼問題',
      probLead:'你把模型量化成 INT8，或換了編譯器、runtime。新的模型檔能 build，輸出看起來也正常。但它真的能取代線上那一版嗎？',
      probBody:'發布一個模型，會跨過最佳化工具、編譯器、runtime、硬體、模型倉庫、CI 和好幾個團隊。每個工具各自都沒錯，證據卻散落在評估資料庫、CI 產物、notebook、倉庫欄位和聊天室的一句「OK」裡，最後誰也回答不了：',
      qs:[['比的到底是哪兩個檔案？','確切的基準與候選模型檔，而不是「最新版」。'],['是哪些證據、哪條政策做出判定？','案例、指標、容許邊界和統計方法。'],['在什麼環境跑出來的？','runtime、硬體、平台與版本。'],['別的團隊能不能自己驗證？','而且不必匯入原作者的評估程式碼。']],
      whoT:'給誰用',whoYes:'為這些人設計',whoNo:'它不是',
      whoTeams:'模型最佳化、推論 runtime、ML 編譯器、ML 平台和發布工程團隊，在審查這類變更時：',
      changes:['FP16 → INT8 或 FP8 量化','ONNX、TensorRT、OpenVINO 或自家編譯器的新 build','編譯器、runtime 或 execution provider 升級','後端遷移、特定硬體的 build','需要可追溯交接紀錄的模型發布 CI'],
      whoReg:'也適合醫療、金融、車用等受監管、必須保留模型發布紀錄的團隊。它不是合規認證。',
      whoNot:'不是訓練框架、實驗追蹤工具、通用的模型或提示詞評估平台、部署控制器、模型倉庫，也不是推論服務。Merriv 串起的是這些系統已經產生的發布證據。',
      howT:'它怎麼做',bindEq:'＝ 一份可以獨立驗證的 Model Change Report',
      bind:['確切的基準模型檔','確切的候選模型檔','評估證據','統計政策','評估判定','runtime 與平台','第一個壞掉的 build（選配）'],
      steps:[['鎖定身分','兩個模型檔都用內容雜湊鎖定；證據、報告、執行各有自己的 ID，重播會得到同一個證據 ID。'],
        ['配對評估','兩個版本跑同一組案例，逐案配對比較，用配對檢定（例如 Tango 分數區間），多條規則做 Holm 校正，並記錄檢定力和最小可偵測效應。'],
        ['五態判定','PASS、WARN、INSUFFICIENT_POWER、BLOCK、ERROR。證據不夠就不會被說成通過（fail-closed）。'],
        ['定位與交接','有多個 build 時用二分搜尋找出第一個壞掉的；輸出 JSON、Markdown、JUnit、SARIF，任何人都能用 merriv mcr verify 驗證，不必匯入 merriv。']],
      resT:'實際成果：一次 FP16 → INT8 發布',
      resLead:'UCI 手寫數字的 {n} 個配對測試案例，其中高墨量族群 {h} 個。模型權重固定，只改 INT8 的校準範圍。',
      th:['Build','整體準確率','高墨量準確率','高墨量 Δ 的 95% 區間（邊界 −{m} pp）','判定'],ref:'參考基準',
      facts:[['第一個壞掉的 build','{fb}','由單調二分搜尋找到'],['根本原因','{cl}% 的像素被削平','輸入上限 0.55 · 高墨量 {ch}%、一般 {cc}%'],['第一個偏離的張量','{ft}','數值比對 cosine {cos}'],['配對結果','{lost} 例變錯 · {gained} 例變對','build-02 對上 FP16']],
      verT:'merriv mcr verify',ver:{integrity_verified:'完整性已驗證',bundle_complete:'證據包完整',producer_authenticated:'發布者身分已驗證',independently_reproduced:'已獨立重現',deployment_authorization:'部署授權'},
      yes:'是',no:'未宣稱',ne:'未評估',verNote:'「valid」只代表報告內部一致，不代表模型安全，也不代表可以部署。',
      caution:'工程測試夾具：×0.55 和 ×0.50 是刻意設計的負對照，用來穩定地觸發 PASS／BLOCK／定位流程，不是真實發布多常、多嚴重回歸的估計。',
      moreT:'另外兩個真實案例',
      llamaT:'llama.cpp #22544：重播一個真實的量化回歸',
      llamaB:'上游回報 --tensor-type 被忽略，要求的 iq4_xs 被悄悄換成 q5_K。我用 Merriv 重跑它附的重播：兩個張量都是關鍵契約案例，所以判定 BLOCK（exit {code}）。只有 2 個案例時，統計規則本身只是 WARN；但關鍵案例一失敗就擋下。',
      llamaNote:'重播的是上游公開的觀察，不是重新執行 27B 模型。',req:'要求',got:'實際',
      nvT:'NVIDIA ModelOpt → TensorRT：RTX 4060 實機',
      nvB:'2026-08-29 在 RTX 4060 Laptop GPU 上實際執行：629 個案例的 ONNX Runtime 與 TensorRT 輸出都在容許誤差內一致，但校準範圍改變讓關鍵族群從 91.49% 掉到 78.72%。用 Tango 重新評估得到 WARN、WARN、BLOCK、BLOCK，報告也誠實註明舊的「第一個壞 build」結論不能直接沿用。',
      nvNote:'repo 保存的作者實測證據（這裡是引用，沒有重跑）；不是獨立或跨硬體的宣稱。',
      open:'查看',
      toolsT:'和現有工具的關係',toolsH:['現有工具','繼續用它來','Merriv 補上'],
      tools:[['模型最佳化工具與編譯器','產生可部署的模型檔','模型檔身分、保存的證據、發布語意'],['Polygraphy 等後端除錯工具','逐層、逐輸出的比對','可攜的證據包，讓下游驗證並套用政策'],['MLflow 等評估與模型倉庫','指標、實驗、生命週期','跨工具的證據，以及中立的報告邊界'],['CI 與升版控制器','執行流程','輸入可稽核、fail-closed 的五態判定']],
      status:'現況：Pre-alpha 參考實作。MCR 0.4 已凍結並公開徵求外部審查；目前沒有任何外部採用者，也不宣稱自己是標準。',review:'外部審查',
      src:'資料：Merriv {c} · {rt} · 執行於 {d}'},
    'zh-CN':{film:'观看 Merriv 动画',filmSub:'约 100 秒一镜到底，走完一次真实的 ONNX FP16 → INT8 发布：测试手写数字、被削平的输入、饱和的隐藏层、配对统计、第一个坏掉的 build，到 Model Change Report。',
      filmNote:'片中每个形状都是 Merriv ONNX 量化实验实际运行一次的数据。×0.55 和 ×0.50 的校准是刻意设计的负对照，不代表真实世界的回归概率。',
      probT:'它解决什么问题',
      probLead:'你把模型量化成 INT8，或换了编译器、runtime。新的模型文件能 build，输出看起来也正常。但它真的能替代线上那一版吗？',
      probBody:'发布一个模型，会跨过优化工具、编译器、runtime、硬件、模型仓库、CI 和好几个团队。每个工具各自都没错，证据却散落在评估数据库、CI 产物、notebook、仓库字段和聊天里的一句“OK”里，最后谁也回答不了：',
      qs:[['比的到底是哪两个文件？','确切的基准与候选模型文件，而不是“最新版”。'],['是哪些证据、哪条策略做出判定？','案例、指标、容许边界和统计方法。'],['在什么环境跑出来的？','runtime、硬件、平台与版本。'],['别的团队能不能自己验证？','而且不必导入原作者的评估代码。']],
      whoT:'给谁用',whoYes:'为这些人设计',whoNo:'它不是',
      whoTeams:'模型优化、推理 runtime、ML 编译器、ML 平台和发布工程团队，在审查这类变更时：',
      changes:['FP16 → INT8 或 FP8 量化','ONNX、TensorRT、OpenVINO 或自研编译器的新 build','编译器、runtime 或 execution provider 升级','后端迁移、特定硬件的 build','需要可追溯交接记录的模型发布 CI'],
      whoReg:'也适合医疗、金融、车载等受监管、必须保留模型发布记录的团队。它不是合规认证。',
      whoNot:'不是训练框架、实验追踪工具、通用的模型或提示词评估平台、部署控制器、模型仓库，也不是推理服务。Merriv 串起的是这些系统已经产生的发布证据。',
      howT:'它怎么做',bindEq:'＝ 一份可以独立验证的 Model Change Report',
      bind:['确切的基准模型文件','确切的候选模型文件','评估证据','统计策略','评估判定','runtime 与平台','第一个坏掉的 build（可选）'],
      steps:[['锁定身份','两个模型文件都用内容哈希锁定；证据、报告、运行各有自己的 ID，重放会得到同一个证据 ID。'],
        ['配对评估','两个版本跑同一组案例，逐案配对比较，用配对检验（例如 Tango 分数区间），多条规则做 Holm 校正，并记录检验功效和最小可检测效应。'],
        ['五态判定','PASS、WARN、INSUFFICIENT_POWER、BLOCK、ERROR。证据不够就不会被说成通过（fail-closed）。'],
        ['定位与交接','有多个 build 时用二分搜索找出第一个坏掉的；输出 JSON、Markdown、JUnit、SARIF，任何人都能用 merriv mcr verify 验证，不必导入 merriv。']],
      resT:'实际成果：一次 FP16 → INT8 发布',
      resLead:'UCI 手写数字的 {n} 个配对测试案例，其中高墨量群组 {h} 个。模型权重固定，只改 INT8 的校准范围。',
      th:['Build','整体准确率','高墨量准确率','高墨量 Δ 的 95% 区间（边界 −{m} pp）','判定'],ref:'参考基准',
      facts:[['第一个坏掉的 build','{fb}','由单调二分搜索找到'],['根本原因','{cl}% 的像素被削平','输入上限 0.55 · 高墨量 {ch}%、一般 {cc}%'],['第一个偏离的张量','{ft}','数值比对 cosine {cos}'],['配对结果','{lost} 例变错 · {gained} 例变对','build-02 对比 FP16']],
      verT:'merriv mcr verify',ver:{integrity_verified:'完整性已验证',bundle_complete:'证据包完整',producer_authenticated:'发布者身份已验证',independently_reproduced:'已独立复现',deployment_authorization:'部署授权'},
      yes:'是',no:'未声明',ne:'未评估',verNote:'“valid”只代表报告内部一致，不代表模型安全，也不代表可以部署。',
      caution:'工程测试夹具：×0.55 和 ×0.50 是刻意设计的负对照，用来稳定地触发 PASS／BLOCK／定位流程，不是真实发布多常、多严重回归的估计。',
      moreT:'另外两个真实案例',
      llamaT:'llama.cpp #22544：重放一个真实的量化回归',
      llamaB:'上游报告 --tensor-type 被忽略，要求的 iq4_xs 被悄悄换成 q5_K。我用 Merriv 重跑它附带的重放：两个张量都是关键契约案例，所以判定 BLOCK（exit {code}）。只有 2 个案例时，统计规则本身只是 WARN；但关键案例一失败就挡下。',
      llamaNote:'重放的是上游公开的观察，不是重新运行 27B 模型。',req:'要求',got:'实际',
      nvT:'NVIDIA ModelOpt → TensorRT：RTX 4060 实机',
      nvB:'2026-08-29 在 RTX 4060 Laptop GPU 上实际运行：629 个案例的 ONNX Runtime 与 TensorRT 输出都在容许误差内一致，但校准范围改变让关键群组从 91.49% 掉到 78.72%。用 Tango 重新评估得到 WARN、WARN、BLOCK、BLOCK，报告也如实注明旧的“第一个坏 build”结论不能直接沿用。',
      nvNote:'repo 保存的作者实测证据（这里是引用，没有重跑）；不是独立或跨硬件的声明。',
      open:'查看',
      toolsT:'和现有工具的关系',toolsH:['现有工具','继续用它来','Merriv 补上'],
      tools:[['模型优化工具与编译器','产生可部署的模型文件','模型文件身份、保存的证据、发布语义'],['Polygraphy 等后端调试工具','逐层、逐输出的比对','可携带的证据包，让下游验证并套用策略'],['MLflow 等评估与模型仓库','指标、实验、生命周期','跨工具的证据，以及中立的报告边界'],['CI 与升版控制器','执行流程','输入可审计、fail-closed 的五态判定']],
      status:'现况：Pre-alpha 参考实现。MCR 0.4 已冻结并公开征求外部审查；目前没有任何外部采用者，也不声称自己是标准。',review:'外部审查',
      src:'数据：Merriv {c} · {rt} · 运行于 {d}'}}[locale]);
  let mvData=null;
  const mvFill=(s,o)=>s.replace(/\{(\w+)\}/g,(m,k)=>o[k]??m);
  function mvShowcase() {
    const c=mvCopy();
    return `<section class="mv-show"><a class="cap-film mv-film" href="/assets/film/merriv.html?lang=${locale}" data-src="/assets/film/merriv.html" data-title="Merriv" aria-haspopup="dialog"><video src="/assets/merriv/teaser.mp4?v=1" poster="/assets/merriv/teaser-poster.jpg?v=1" muted loop playsinline preload="metadata" ${motion()?'autoplay':''} aria-hidden="true"></video><span class="cap-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span><span class="cap-film-text"><b>${esc(c.film)}</b><small>${esc(c.filmSub)}</small></span></a><p class="comment-line mv-filmnote">${esc(c.filmNote)}</p>
      <h2>${esc(c.probT)}</h2><p class="mv-lead">${esc(c.probLead)}</p><p class="mv-p">${esc(c.probBody)}</p>
      <div class="mv-qs">${c.qs.map(([q,a],i)=>`<div style="--i:${i}"><b>${esc(q)}</b><small>${esc(a)}</small></div>`).join('')}</div>
      <h2>${esc(c.whoT)}</h2><div class="mv-who"><div class="mv-yes"><h3>${esc(c.whoYes)}</h3><p>${esc(c.whoTeams)}</p><ul>${c.changes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="mv-reg">${esc(c.whoReg)}</p></div><div class="mv-no"><h3>${esc(c.whoNo)}</h3><p>${esc(c.whoNot)}</p></div></div>
      <h2>${esc(c.howT)}</h2><div class="mv-bind">${c.bind.map((x,i)=>`<span style="--i:${i}">${i?'<em>+</em>':''}${esc(x)}</span>`).join('')}<b>${esc(c.bindEq)}</b></div>
      <ol class="mv-steps">${c.steps.map(([t,d],i)=>`<li style="--i:${i}"><span>${i+1}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ol>
      <div class="mv-states" translate="no">${['PASS','WARN','INSUFFICIENT_POWER','BLOCK','ERROR'].map(s=>`<span class="s-${s.toLowerCase()}">${s}</span>`).join('')}</div>
      <div class="mv-results"></div></section>`;
  }
  function mvResults() {
    const box=$('.mv-results'); if(!box||!mvData) return;
    const c=mvCopy(), S=mvData, pp=v=>(v*100).toFixed(1), pc=v=>(v*100).toFixed(2);
    const b0=S.builds[0], b2=S.builds[2], hi=b=>b.rules.find(r=>r.rule==='high-ink-quality');
    const rows=S.builds.map((b,i)=>{ const r=hi(b), st=i===0?c.ref:b.status;
      return `<tr class="${i?'':'is-ref'}"><td translate="no">${esc(b.id)}</td><td>${pc(b.acc)}%</td><td>${pc(b.acc_high)}%</td><td>${i?`[${pp(r.lo)}, ${pp(r.hi)}] pp`:'—'}</td><td><em class="g-${esc(i?b.status.toLowerCase():'ref')}">${esc(st)}</em></td></tr>`; }).join('');
    const div=S.divergence.find(d=>d.tensor===S.first_divergent)||S.divergence[0], P=b2.pairs.overall;
    const vals={fb:S.first_bad.slice(0,8),cl:pp(S.clipped.all),ch:pp(S.clipped.high),cc:pp(S.clipped.common),ft:S.first_divergent,cos:div.cosine_similarity.toFixed(3),lost:P.lost,gained:P.gained};
    const facts=c.facts.map(([k,v,d])=>`<div><small>${esc(k)}</small><b>${esc(mvFill(v,vals))}</b><span>${esc(mvFill(d,vals))}</span></div>`).join('');
    const trust=Object.entries(c.ver).map(([k,label])=>{ const v=S.trust[k]; return `<li class="${v===true?'ok':'no'}"><span>${esc(label)}</span><b>${v===true?'✓ '+esc(c.yes):v===false?esc(c.no):esc(c.ne)}</b></li>`; }).join('');
    const L=S.llama;
    const tensors=L.tensors.map(t=>`<tr><td translate="no">${esc(t.tensor)}</td><td translate="no">${esc(t.requested)}</td><td translate="no" class="bad">${esc(t.realized)}</td></tr>`).join('');
    box.innerHTML=`<h2>${esc(c.resT)}</h2><p class="mv-p">${esc(mvFill(c.resLead,{n:S.cases,h:S.high}))}</p>
      <div class="mv-tablewrap"><table class="mv-table"><thead><tr>${c.th.map(h=>`<th>${esc(mvFill(h,{m:pp(hi(b2).margin)}))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="mv-facts">${facts}</div>
      <div class="mv-verify"><h3 translate="no">${esc(c.verT)}</h3><ul>${trust}</ul><p>${esc(c.verNote)}</p></div>
      <p class="mv-caution">${esc(c.caution)}</p>
      <h2>${esc(c.moreT)}</h2><div class="mv-cases">
        <article><div class="mv-case-h"><b>${esc(c.llamaT)}</b><em class="g-block" translate="no">${esc(L.status)}</em></div><p>${esc(mvFill(c.llamaB,{code:L.exit}))}</p>
          <table class="mv-mini"><thead><tr><th>tensor</th><th>${esc(c.req)}</th><th>${esc(c.got)}</th></tr></thead><tbody>${tensors}</tbody></table>
          <small>${esc(c.llamaNote)}</small><a href="https://github.com/ggml-org/llama.cpp/issues/22544" target="_blank" rel="noopener noreferrer">${esc(c.open)} #22544 ↗</a></article>
        <article><div class="mv-case-h"><b>${esc(c.nvT)}</b><em class="g-block" translate="no">91.49% → 78.72%</em></div><p>${esc(c.nvB)}</p>
          <small>${esc(c.nvNote)}</small><a href="https://github.com/niansia/Merriv/blob/main/docs/release-evidence-case-study.md" target="_blank" rel="noopener noreferrer">${esc(c.open)} case study ↗</a></article></div>
      <h2>${esc(c.toolsT)}</h2><div class="mv-tablewrap"><table class="mv-table mv-tools"><thead><tr>${c.toolsH.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${c.tools.map(r=>`<tr>${r.map((x,i)=>`<td${i===2?' class="add"':''}>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="mv-status">${esc(c.status)} <a href="https://github.com/niansia/Merriv/issues/18" target="_blank" rel="noopener noreferrer">${esc(c.review)} ↗</a></p>
      <p class="comment-line">${esc(mvFill(c.src,{c:S.source.commit.slice(0,7),rt:S.source.runtime,d:S.source.run}))}</p>`;
  }
  function initMerriv() { if(!$('.mv-show')) return; if(mvData) mvResults(); else fetch('/assets/merriv/summary.json?v=1').then(r=>r.json()).then(d=>{mvData=d;mvResults();}).catch(()=>{}); }
  root.addEventListener('input',event=>{ if(event.target.matches('.lg-range')){ const cmp=event.target.closest('.lg-compare'); cmp.dataset.touched='1'; cmp.style.setProperty('--x',`${event.target.value}%`); } });
  root.addEventListener('click',event=>{ const t=event.target.closest('[data-lg-i]'), v=event.target.closest('[data-lg-vs]'); if(t){lgState.i=Number(t.dataset.lgI);paintLumigrid();} if(v){lgState.vs=v.dataset.lgVs;paintLumigrid();} });
  /* Film dock: the capstone film plays in an in-page player that can shrink to a corner mini player
     (like YouTube) and keeps playing while the terminal is used. It lives on <body>, outside the re-rendered views. */
  let dock=null;
  const dockCopy=()=>({en:{mini:'Mini player',full:'Expand',close:'Close',title:'Capstone film'},'zh-TW':{mini:'縮小播放',full:'放大',close:'關閉',title:'大學專題動畫'},'zh-CN':{mini:'缩小播放',full:'放大',close:'关闭',title:'大学专题动画'}}[locale]);
  function dockMode(mode) {
    if (!dock) return;
    dock.dataset.mode=mode;
    document.documentElement.classList.toggle('film-open',mode==='full');
    dock.querySelector('iframe').contentWindow?.postMessage({source:'niansia-dock',type:'mode',mini:mode==='mini'},'*');
    dock.querySelector(mode==='full'?'[data-film="mini"]':'[data-film="full"]')?.focus({preventScroll:true});
  }
  function openFilm(src='/assets/film/propaganda.html', title) {
    const d={...dockCopy(), ...(title?{title}:{})};
    if (dock && dock.dataset.src===src) { dockMode('full'); return; }
    if (dock) { dock.remove(); dock=null; }
    dock=document.createElement('div');
    dock.className='film-dock'; dock.setAttribute('role','dialog'); dock.setAttribute('aria-label',d.title);
    dock.innerHTML=`<div class="film-backdrop" data-film="mini"></div><div class="film-shell"><div class="film-frame"><iframe src="${src}?lang=${locale}&embed=1" title="${esc(d.title)}" allow="autoplay; fullscreen" allowfullscreen></iframe><button type="button" class="film-hit" data-film="full" aria-label="${esc(d.full)}"></button></div>
      <div class="film-bar"><span class="film-title"><i></i>${esc(d.title)}</span><button type="button" data-film="mini" title="${esc(d.mini)}" aria-label="${esc(d.mini)}"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM12 12h7v6h-7z"/></svg></button><button type="button" data-film="full" title="${esc(d.full)}" aria-label="${esc(d.full)}"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><button type="button" data-film="close" title="${esc(d.close)}" aria-label="${esc(d.close)}"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></div>`;
    dock.dataset.src=src; document.body.append(dock);
    dock.addEventListener('click',e=>{const b=e.target.closest('[data-film]');if(!b)return;const a=b.dataset.film;if(a==='close')closeFilm();else dockMode(a);});
    requestAnimationFrame(()=>dockMode('full'));
  }
  function closeFilm() {
    if (!dock) return;
    const el=dock; dock=null; document.documentElement.classList.remove('film-open');
    el.dataset.mode='closing'; setTimeout(()=>el.remove(),320);
  }
  window.addEventListener('message',e=>{const m=e.data;if(!dock||!m||m.source!=='propaganda-film')return;if(m.type==='escape')dockMode('mini');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dock&&dock.dataset.mode==='full'){e.stopImmediatePropagation();dockMode('mini');}},true);
  /* Papers in preparation: live countdowns to each venue's deadline (Anywhere on Earth). */
  const subs=()=>window.NIANSIA_SUBMISSIONS;
  const subCopy=()=>subs()?.copy[locale]||subs()?.copy.en;
  function countdown(at) {
    const S=subCopy(), ms=Date.parse(at)-Date.now();
    if (ms<=0) return S.closed;
    return S.left(Math.floor(ms/864e5),Math.floor(ms%864e5/36e5));
  }
  const aoeDate=at=>`${at.slice(0,10).replace(/-/g,'/')} AoE`;
  function nextDeadline() {
    return (subs()?.venues||[]).filter(v=>v.deadline&&Date.parse(v.deadline)>Date.now()).sort((a,b)=>Date.parse(a.deadline)-Date.parse(b.deadline))[0];
  }
  function submissionsBlock() {
    const S=subCopy(); if (!S) return '';
    const cards=subs().venues.map(v=>`<article class="sub-card ${v.deadline?'':'is-tba'}"><header><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer" translate="no">${esc(v.venue)}${icon('link')}</a><span>${esc(v.topic[locale]||v.topic.en)}</span></header>
      <p class="sub-count" ${v.deadline?`data-deadline="${v.deadline}"`:''}>${v.deadline?countdown(v.deadline):S.tba}</p>
      <dl>${v.register?`<div><dt>${S.register}</dt><dd>${aoeDate(v.register)}</dd></div>`:''}<div><dt>${S.deadline}</dt><dd>${v.deadline?aoeDate(v.deadline):S.tba}</dd></div><div><dt>${S.meeting}</dt><dd>${v.meeting?esc(v.meeting[locale]||v.meeting.en):S.tba}</dd></div></dl></article>`).join('');
    return `<section class="submissions" aria-labelledby="subs-title"><h2 id="subs-title">${S.title}</h2><p class="screen-intro">${S.intro}</p><div class="sub-grid">${cards}</div></section>`;
  }
  function paintCountdowns() { root.querySelectorAll('[data-deadline]').forEach(el=>{el.textContent=countdown(el.dataset.deadline);}); }
  setInterval(paintCountdowns,30000);
  function showLatest(i) {
    const card=$('.latest-card'); if(!card) return;
    card.querySelectorAll('.latest-slide').forEach((el,k)=>{el.classList.toggle('is-on',k===i);el.tabIndex=k===i?0:-1;el.toggleAttribute('aria-hidden',k!==i);});
    card.querySelectorAll('.latest-dot').forEach((el,k)=>el.setAttribute('aria-pressed',String(k===i)));
  }
  setInterval(()=>{const card=$('.latest-card');if(!card||!motion()||document.hidden||card.matches(':hover,:focus-within'))return;const slides=card.querySelectorAll('.latest-slide'),i=[...slides].findIndex(el=>el.classList.contains('is-on'));if(slides.length>1)showLatest((i+1)%slides.length);},6500);
  /* Off the clock: hobbies, cosplay and fandoms, kept apart from the research pages. */
  function hobbiesScreen() {
    const h=window.NIANSIA_HOBBIES, L=h?.[locale]||h?.en;
    if (!L) return `${commandTitle('cat hobbies.md')}<p>${t().noMatches}</p>`;
    const days=Math.max(0,Math.floor((Date.now()-Date.parse(`${h.cosSince}T00:00:00+08:00`))/864e5));
    const chips=list=>`<span class="hobby-chips">${list.map(x=>`<span>${esc(x)}</span>`).join('')}</span>`;
    const value=(v,fold)=>!Array.isArray(v)?esc(v).replace('{days}',`<b class="hobby-count">${days.toLocaleString(locale)}</b>`)
      :fold?`<details class="hobby-more"><summary>${esc(v.slice(0,3).join('、'))}… <em>${esc(L.more)} (${v.length})</em></summary>${chips(v)}</details>`:chips(v);
    const sections=L.sections.map((s,i)=>`<section class="research-entry hobby-section"><span>${String(i+1).padStart(2,'0')}</span><div><h2>${esc(s.title)}</h2><dl class="hobby-list">${s.rows.map(([k,v,fold])=>`<div><dt>${esc(k)}</dt><dd>${value(v,fold)}</dd></div>`).join('')}</dl></div></section>`).join('');
    const links=h.links.map(l=>`<a class="hobby-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"><span class="hobby-link-head"><b>${esc(l.label)}</b>${l.handle?`<span translate="no">${esc(l.handle)}</span>`:''}${icon('link')}</span><small>${esc(L.linkNotes[l.id]||'')}</small></a>`).join('');
    return `${commandTitle('cat hobbies.md')}<h1>${esc(L.title)}</h1><p class="screen-intro">${esc(L.intro)}</p>
      <div class="hobby-card"><p>${esc(L.nick)}</p><div class="hobby-facts">${L.facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div><div class="interest-tags">${L.circles.map(c=>`<span>${esc(c)}</span>`).join('')}</div><p class="hobby-langs"><b>${esc(L.langLabel)}</b>${L.langs.map(esc).join(' ❅ ')}<small>${esc(L.langNote)}</small></p></div>
      ${sections}<h2 class="hobby-social-title">${esc(L.socialTitle)}</h2><div class="hobby-links">${links}</div><p class="comment-line">${esc(L.footnote)}</p>`;
  }
  /* papers.bib: publications (from publications-data.js) and anonymous manuscripts in preparation (from submissions-data.js). */
  const pubs=()=>window.NIANSIA_PUBS;
  const pubCopy=()=>pubs()?.copy[locale]||pubs()?.copy.en;
  const pubPreview=()=>new URLSearchParams(location.search).get('papers')==='preview';
  const pubText=v=>v&&typeof v==='object'?(v[locale]??v.en??''):(v||'');
  const pubSeg=()=>locale==='en'?'':locale.toLowerCase()+'/';
  function pubList() { return (pubs()?.papers||[]).filter(p=>!p.draft||pubPreview()); }
  const pubHidden=p=>p.anonymous&&['under-review','in-prep'].includes(p.status);
  const PUB_ORDER=['published','accepted','preprint','under-review','in-prep'];
  function pubCard(p,i) {
    const P=pubCopy(), hidden=pubHidden(p);
    const authors=hidden?'':`<p class="pub-authors">${(p.authors||[]).map(a=>`<span class="${a.me?'is-me':''}">${esc(a.name)}${a.equal?'*':''}</span>`).join(', ')}</p>`;
    const page=p.page&&!hidden?`/paper/${esc(p.id)}/${pubSeg()}`:'';
    const links=hidden?'':[['paper','paper'],['arxiv','file'],['code','link'],['video','play'],['slides','file'],['poster','file']].filter(([k])=>p.links?.[k]).map(([k,ic])=>`<a class="pub-link" href="${esc(p.links[k])}" target="_blank" rel="noopener noreferrer">${icon(ic)}<span>${esc(P.links[k])}</span></a>`).join('')
      +(page?`<a class="pub-link is-page" href="${page}">${icon('arrow')}<span>${esc(P.links.project)}</span></a>`:'');
    const bib=!hidden&&p.bibtex?`<details class="pub-bib"><summary>${icon('copy')}<span>${esc(P.bibtex)}</span></summary><pre translate="no">${esc(p.bibtex)}</pre><button type="button" class="pub-copy" data-bib="${esc(p.id)}">${esc(P.copy)}</button></details>`:'';
    return `<article class="pub-card${hidden?' is-blind':''}${p.draft?' is-draft':''}" style="--i:${i}">
      ${!hidden&&p.teaser?`<a class="pub-thumb" href="${page||esc(p.links?.paper||'#')}"><img src="${esc(p.teaser.src)}" alt="${esc(p.teaser.alt||'')}" loading="lazy"></a>`:`<span class="pub-thumb is-empty" aria-hidden="true">${icon(hidden?'lock':'paper')}</span>`}
      <div class="pub-body"><p class="pub-meta"><span class="pub-status" data-status="${esc(p.status)}">${esc(P.status[p.status]||p.status)}</span><b translate="no">${esc(p.venue||'')}</b>${p.draft?`<em>${esc(P.draft)}</em>`:''}</p>
        <h2>${hidden?esc(P.blind):page?`<a href="${page}">${esc(pubText(p.title))}</a>`:esc(pubText(p.title))}</h2>${authors}
        ${!hidden&&p.tldr?`<p class="pub-tldr">${esc(pubText(p.tldr))}</p>`:''}
        ${(p.topics||[]).length?`<p class="pub-topics">${p.topics.map(x=>`<span>${esc(x)}</span>`).join('')}</p>`:''}
        ${links?`<div class="pub-links">${links}</div>`:''}${bib}</div></article>`;
  }
  function papersScreen() {
    const P=pubCopy(), S=subCopy(); if (!P) return `${commandTitle('cat papers.bib')}<p>${t().noMatches}</p>`;
    const list=pubList().sort((a,b)=>PUB_ORDER.indexOf(a.status)-PUB_ORDER.indexOf(b.status)||(b.year||0)-(a.year||0));
    const venues=subs()?.venues||[];
    const notes=(window.NIANSIA_NOTES?.[locale]||[]).length;
    const stats=[[list.filter(p=>!p.draft).length,P.count.pubs],[venues.length,P.count.prep],[notes,P.count.notes]];
    const empty=`<div class="pub-empty"><span class="pub-shelf" aria-hidden="true"><i></i><i></i><i></i><i></i></span><div><b>${esc(P.none)}</b><p>${esc(P.noneBody)}</p></div></div>`;
    const prep=venues.map((v,i)=>`<article class="prep-card" style="--i:${i}"><header><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer" translate="no">${esc(v.venue)}${icon('link')}</a><span class="pub-status" data-status="in-prep">${esc(P.status['in-prep'])}</span></header>
      <p class="prep-topic">${esc(v.topic[locale]||v.topic.en)}</p><p class="prep-blind">${icon('lock')}<span>${esc(P.blind)}</span></p>
      <p class="prep-when">${v.deadline?`<span>${esc(P.deadline)} ${aoeDate(v.deadline)}</span><b data-deadline="${v.deadline}">${countdown(v.deadline)}</b>`:`<span>${esc(S?.tba||'')}</span>`}</p></article>`).join('');
    const seg=locale==='en'?'en':locale.toLowerCase();
    const writing=`<div class="pub-writing">${statementLink()}<a class="statement-card" href="/notes/${seg}/"><span class="statement-icon" aria-hidden="true">${icon('book')}</span><span><b>${esc(noteCopy().title)}</b><small>${esc(noteCopy().lede)}</small></span><em aria-hidden="true">↗</em></a><a class="statement-card" href="/brief/${pubSeg()}"><span class="statement-icon" aria-hidden="true">${icon('bolt')}</span><span><b>${esc(P.brief)}</b><small>${esc(briefCopy().sub)}</small></span><em aria-hidden="true">↗</em></a></div>`;
    const bibAll=list.some(p=>p.bibtex&&!pubHidden(p))?`<button type="button" class="action-button pub-export" data-action="bib-all">${icon('download')}<span>${esc(P.exportAll)}</span></button>`:'';
    return `${commandTitle('cat papers.bib')}${pubPreview()?`<p class="cv-preview-note">${icon('lock')} ${esc(P.preview)}</p>`:''}<h1>${esc(P.title)}</h1><p class="screen-intro">${esc(P.intro)}</p>
      <div class="pub-stats">${stats.map(([n,l])=>`<div><b>${n}</b><span>${esc(l)}</span></div>`).join('')}</div>
      <section class="pub-section"><h2 class="pub-h">${esc(P.published)}</h2>${list.length?`<div class="pub-list">${list.map(pubCard).join('')}</div>${bibAll}`:empty}</section>
      ${prep?`<section class="pub-section"><h2 class="pub-h">${esc(P.prep)}</h2><div class="prep-grid">${prep}</div></section>`:''}
      <section class="pub-section"><h2 class="pub-h">${esc(P.writing)}</h2>${writing}</section>`;
  }
  /* blog/: monthly updates, paper notes, posts and answered questions (blog-data.js, built from blog_src/), together with the
     research notes and the research log, newest first. The list comes first (the latest monthly update pinned on top as a
     compact card); a sticky side column holds what is next (with deadline countdowns), the question box and the reading footprint. */
  const BLOG_KINDS=['all','now','paper','note','log','post','qa'];
  const blogCopy=()=>({
    en:{title:'Blog',intro:'Monthly updates, notes on the papers I read and what I make of them, and answers to your questions. The research notes and the research log live here too.',
      kinds:{all:'All',now:'Now',paper:'Paper notes',note:'Research notes',log:'Research log',post:'Posts',qa:'Q&A'},kind:{now:'Now',paper:'Paper note',note:'Research note',log:'Log',post:'Post',qa:'Q&A'},
      count:n=>`${n} post${n===1?'':'s'}`,pinned:'Pinned',nowLabel:'Now',readNow:'Read the update',side:'Blog side panel',
      next:'Up next',nextAll:'All submissions',ask:'Ask anonymously',askBtn:'Ask me a question',askSub:'No sign-up needed. Good questions get answered under Q&A.',askSoon:'The question box opens soon',
      qa:'Q&A',rss:'RSS',foot:'Reading footprint',footN:n=>`${n} paper note${n===1?'':'s'} in the last 12 months`,footNone:'The first paper note is on its way.',
      empty:'Nothing here yet.',zh:'中文',min:'min',filter:'Filter posts',page:'Standalone page',depth:{deep:'read closely',skim:'skimmed'}},
    'zh-TW':{title:'Blog',intro:'每月近況、讀過的論文和我的看法，以及大家問的問題；研究筆記和研究日誌也都整理在這裡。',
      kinds:{all:'全部',now:'近況',paper:'論文筆記',note:'研究筆記',log:'研究日誌',post:'隨筆',qa:'Q&A'},kind:{now:'近況',paper:'論文筆記',note:'研究筆記',log:'日誌',post:'隨筆',qa:'Q&A'},
      count:n=>`共 ${n} 篇`,pinned:'置頂',nowLabel:'本月近況',readNow:'閱讀近況',side:'Blog 側欄',
      next:'接下來',nextAll:'所有投稿進度',ask:'匿名提問',askBtn:'問我一個問題',askSub:'不用註冊；回答後會整理在 Q&A。',askSoon:'提問箱即將開放',
      qa:'Q&A',rss:'RSS 訂閱',foot:'閱讀足跡',footN:n=>`過去 12 個月寫了 ${n} 篇論文筆記`,footNone:'第一篇論文筆記準備中。',
      empty:'這裡還沒有文章。',zh:'中文',min:'分鐘',filter:'篩選文章',page:'獨立頁面',depth:{deep:'精讀',skim:'略讀'}},
    'zh-CN':{title:'Blog',intro:'每月近况、读过的论文和我的看法，以及大家问的问题；研究笔记和研究日志也都整理在这里。',
      kinds:{all:'全部',now:'近况',paper:'论文笔记',note:'研究笔记',log:'研究日志',post:'随笔',qa:'Q&A'},kind:{now:'近况',paper:'论文笔记',note:'研究笔记',log:'日志',post:'随笔',qa:'Q&A'},
      count:n=>`共 ${n} 篇`,pinned:'置顶',nowLabel:'本月近况',readNow:'阅读近况',side:'Blog 侧栏',
      next:'接下来',nextAll:'所有投稿进度',ask:'匿名提问',askBtn:'问我一个问题',askSub:'不用注册；回答后会整理在 Q&A。',askSoon:'提问箱即将开放',
      qa:'Q&A',rss:'RSS 订阅',foot:'阅读足迹',footN:n=>`过去 12 个月写了 ${n} 篇论文笔记`,footNone:'第一篇论文笔记准备中。',
      empty:'这里还没有文章。',zh:'中文',min:'分钟',filter:'筛选文章',page:'独立页面',depth:{deep:'精读',skim:'略读'}}}[locale]);
  let blogFilter=(()=>{try{return sessionStorage.getItem('niansia-blog-filter')||'all';}catch{return 'all';}})();
  if(!BLOG_KINDS.includes(blogFilter))blogFilter='all';
  function blogEntries() {
    const own=(window.NIANSIA_BLOG?.posts?.[locale]||[]).map(p=>({...p}));
    const notes=(window.NIANSIA_NOTES?.[locale]||[]).map(n=>({...n,type:'note'}));
    const log=(window.NIANSIA_LOG?.[locale]||[]).map(n=>({...n,type:'log'}));
    return [...own,...notes,...log].sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
  }
  function blogRow(p,i) {
    const B=blogCopy(), [y,m,d]=p.date.split('-');
    const extra=[p.type==='paper'&&p.venue?`<span class="blog-venue" translate="no">${esc(p.venue)}</span>`:'',p.type==='paper'&&B.depth[p.depth]?`<span>${esc(B.depth[p.depth])}</span>`:'',
      p.minutes?`<span>${p.minutes} ${esc(B.min)}</span>`:'',...(p.tags||[]).slice(0,3).map(tg=>`<span class="blog-tag">${esc(tg)}</span>`)].filter(Boolean).join('');
    return `<a class="blog-row" data-kind="${esc(p.type)}" href="${esc(p.url)}" style="--i:${i}"><span class="blog-date"><b>${m}/${d}</b><small>${y}</small></span>
      <span class="blog-main"><span class="blog-kind">${esc(B.kind[p.type]||p.type)}</span>${p.lang&&p.lang!==locale?`<span class="blog-lang">${esc(B.zh)}</span>`:''}
      <strong>${esc(p.type==='qa'?'「'+p.title+'」':p.title)}</strong>${p.type==='paper'&&p.paper?`<small class="blog-paper" translate="no">${esc(p.paper)}</small>`:''}${p.description?`<small>${esc(p.description)}</small>`:''}${extra?`<span class="blog-meta">${extra}</span>`:''}</span>
      ${p.thumb?`<img class="blog-thumb" src="${esc(p.thumb)}" alt="" loading="lazy">`:`<span class="row-arrow" aria-hidden="true">↗</span>`}</a>`;
  }
  // The latest monthly update, pinned on top of the full list: title and what got done. What is next lives in the side column.
  function blogNow(p) {
    const B=blogCopy(), done=(p.groups||[])[0];
    const pts=done?.items?.length?`<ul class="blog-now-pts" aria-label="${esc(done.title)}">${done.items.map((pt,i)=>`<li style="--i:${i}">${esc(pt)}</li>`).join('')}</ul>`:p.description?`<small>${esc(p.description)}</small>`:'';
    return `<a class="blog-now" data-kind="now" href="${esc(p.url)}"><span class="blog-now-k">${icon('spark')}<span>${esc(B.nowLabel)} · ${esc(p.date.slice(0,7))}</span><i class="blog-pin">${esc(B.pinned)}</i></span>
      <b>${esc(p.title)}</b>${pts}<span class="blog-now-more">${esc(B.readNow)} <span aria-hidden="true">→</span></span></a>`;
  }
  function blogList() {
    const B=blogCopy(), all=blogEntries(), list=blogFilter==='all'?all:all.filter(p=>p.type===blogFilter);
    const pin=blogFilter==='all'?list.find(p=>p.type==='now'):null;
    return list.length?(pin?blogNow(pin):'')+list.filter(p=>p!==pin).map(blogRow).join(''):`<p class="blog-empty">${esc(blogFilter==='paper'?B.footNone:B.empty)}</p>`;
  }
  // Up next: the "next" items of the latest monthly update (or the venues being prepared), each with its deadline countdown.
  function blogNext(now) {
    const B=blogCopy(), S=subCopy(), venues=subs()?.venues||[];
    const items=(now?.groups||[])[1]?.items||venues.map(v=>v.venue);
    if(!items.length)return '';
    const rows=items.map((name,i)=>{
      const v=venues.find(x=>name.startsWith(x.venue)), open=v?.deadline&&Date.parse(v.deadline)>Date.now();
      return `<li class="${open?'is-dated':''}" style="--i:${i}"><span class="bn-dot" aria-hidden="true"></span><b class="bn-name" translate="no">${esc(name)}</b>
        ${v?`<span class="bn-when">${v.deadline?`<b data-deadline="${v.deadline}">${countdown(v.deadline)}</b>`:`<small>${esc(S?.tba||'')}</small>`}</span><small class="bn-topic">${esc(v.topic[locale]||v.topic.en)}${v.deadline?` · ${aoeDate(v.deadline)}`:''}</small>`:''}</li>`;
    }).join('');
    return `<div class="blog-card blog-next"><p class="blog-side-h">${icon('clock')}${esc(B.next)}</p><ul>${rows}</ul>${venues.length?`<button type="button" class="blog-side-more" data-view="research">${esc(B.nextAll)} →</button>`:''}</div>`;
  }
  function blogScreen() {
    const B=blogCopy(), all=blogEntries(), seg=locale==='en'?'en':locale.toLowerCase(), ask=window.NIANSIA_BLOG?.ask||'';
    const count=k=>k==='all'?all.length:all.filter(p=>p.type===k).length;
    const chips=BLOG_KINDS.filter(k=>['all','now','paper','note','qa'].includes(k)||count(k)).map(k=>`<button type="button" class="pf-chip" data-blog-filter="${k}" aria-pressed="${k===blogFilter}"${!count(k)&&k!=='all'?' data-empty':''}><span>${esc(B.kinds[k])}</span><em>${count(k)}</em></button>`).join('');
    // Reading footprint: paper notes per month over the last 12 months; it only shows up once there is a paper note to count.
    const today=new Date(), months=[...Array(12)].map((_,i)=>{const d=new Date(today.getFullYear(),today.getMonth()-11+i,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;});
    const papers=all.filter(p=>p.type==='paper'), per=months.map(mo=>papers.filter(p=>p.date.startsWith(mo)).length), top=Math.max(1,...per), total=per.reduce((a,b)=>a+b,0);
    const bars=months.map((mo,i)=>`<i style="--h:${per[i]?Math.max(18,per[i]/top*100):6}%" data-n="${per[i]}" title="${mo} · ${per[i]}"></i>`).join('');
    const foot=total?`<div class="blog-card blog-foot"><p class="blog-side-h">${icon('book')}${esc(B.foot)}</p><div class="blog-bars" aria-hidden="true">${bars}</div><small>${esc(B.footN(total))}</small></div>`:'';
    const askCard=`<div class="blog-card blog-ask"><p class="blog-side-h">${icon('chat')}${esc(B.ask)}</p><small>${esc(B.askSub)}</small>${ask?`<a class="action-button primary" href="${esc(ask)}" target="_blank" rel="noopener noreferrer"><span>${esc(B.askBtn)}</span>${icon('link')}</a>`:`<span class="action-button is-soon" aria-disabled="true">${esc(B.askSoon)}</span>`}
      <span class="blog-side-links"><a href="/blog/${seg}/qa/">${esc(B.qa)} →</a><a href="/blog/${seg}/feed.xml">${esc(B.rss)}</a><a href="/blog/${seg}/">${esc(B.page)} ↗</a></span></div>`;
    return `${commandTitle('ls ./blog/')}<div class="directory-heading"><h1>${esc(B.title)}</h1><span class="dir-count">${esc(B.count(all.length))}</span></div><p class="screen-intro">${esc(B.intro)}</p>
      <div class="blog-layout"><div class="blog-col"><div class="project-filters blog-filters" role="group" aria-label="${esc(B.filter)}">${chips}</div><div class="blog-list">${blogList()}</div></div>
      <div class="blog-side" role="complementary" aria-label="${esc(B.side)}">${blogNext(all.find(p=>p.type==='now'))}${askCard}${foot}</div></div>`;
  }
  function setBlogFilter(key, focus) {
    if(!BLOG_KINDS.includes(key))return false;
    blogFilter=key; try{sessionStorage.setItem('niansia-blog-filter',key);}catch{}
    if(view!=='blog')return true;
    root.querySelectorAll('[data-blog-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.blogFilter===key)));
    const list=$('.blog-list'); if(list){ list.innerHTML=blogList(); if(motion()){list.classList.remove('is-filtering');void list.offsetWidth;list.classList.add('is-filtering');} }
    if(focus)root.querySelector(`[data-blog-filter="${key}"]`)?.focus({preventScroll:true});
    return true;
  }
  const briefCopy=()=>({en:{chip:'In a hurry? One-page brief',sub:'Research, papers, selected projects and contact on one printable page.',label:'Brief',search:'Search'},
    'zh-TW':{chip:'時間不多？一頁式簡介',sub:'研究方向、論文、代表作品與聯絡方式，一頁看完，也能列印。',label:'快速瀏覽',search:'搜尋'},
    'zh-CN':{chip:'时间不多？一页式简介',sub:'研究方向、论文、代表作品与联系方式，一页看完，也能打印。',label:'快速浏览',search:'搜索'}}[locale]);
  const tourCta=()=>({en:'Take a one-minute tour with Yuki','zh-TW':'讓 Yuki 帶你導覽一分鐘','zh-CN':'让 Yuki 带你导览一分钟'}[locale]);
  /* Adversarial Lab: an in-browser attack playground that sits under the AI-security research direction. */
  const advCopy=()=>({en:{t:'Try it: fool a neural network',s:'Adversarial Lab · FGSM and PGD attacks, decision maps and an adversarially trained model, all running on your CPU.'},
    'zh-TW':{t:'動手試試：騙過神經網路',s:'對抗樣本實驗室 · FGSM／PGD 攻擊、決策地圖與對抗訓練模型，全部在你的 CPU 上執行。'},
    'zh-CN':{t:'动手试试：骗过神经网络',s:'对抗样本实验室 · FGSM／PGD 攻击、决策地图与对抗训练模型，全部在你的 CPU 上运行。'}}[locale]);
  function advCard() { const c=advCopy(); return `<a class="lg-try adv-try" href="/lab/adversarial/?lang=${locale}"><span class="adv-eq" aria-hidden="true"><i>7</i><b>+</b><i class="adv-noise"></i><b>=</b><i class="adv-fooled">3</i></span><span><b>${esc(c.t)}</b><small>${esc(c.s)}</small></span><em aria-hidden="true">↗</em></a>`; }
  function bibtexAll() { return pubList().filter(p=>p.bibtex&&!pubHidden(p)).map(p=>p.bibtex).join('\n\n')+'\n'; }
  /* Project filters: a project can sit in several groups (Adversarial Lab is both vision and security). */
  const PROJECT_FILTERS=[['all',null],['vision',['lumigrid','chromarecover','adversarial-lab']],['security',['adversarial-lab','contextsec','merriv','ai-repo-gardener']],
    ['agents',['taiwan-exam','contextsec','ai-repo-gardener','psg','noveltyaudit','research-meeting-coach']],['research',['noveltyaudit','research-meeting-coach']],
    ['systems',['kcrashlab','merriv','psg']],['demo',['adversarial-lab','lumigrid']]];
  const filterCopy=()=>({en:{all:'All',vision:'Computer vision',security:'AI security & trust',agents:'Agents & Skills',research:'Research tools',systems:'Reliability & evidence',demo:'Try in the browser',label:'Filter projects',of:(a,b)=>`${a} of ${b} ${t().directory}`},
    'zh-TW':{all:'全部',vision:'電腦視覺',security:'AI 安全與可信',agents:'Agent Skill 與 AI 代理',research:'研究工具',systems:'可靠性與證據',demo:'可以線上試玩',label:'篩選作品',of:(a,b)=>`${a} / ${b} 項作品`},
    'zh-CN':{all:'全部',vision:'计算机视觉',security:'AI 安全与可信',agents:'Agent Skill 与 AI 代理',research:'研究工具',systems:'可靠性与证据',demo:'可以在线试玩',label:'筛选作品',of:(a,b)=>`${a} / ${b} 项作品`}}[locale]);
  let projectFilter=(()=>{try{return sessionStorage.getItem('niansia-project-filter')||'all';}catch{return 'all';}})();
  if(!PROJECT_FILTERS.some(([k])=>k===projectFilter))projectFilter='all';
  const filterIds=key=>PROJECT_FILTERS.find(([k])=>k===key)?.[1];
  const visibleProjects=()=>{const ids=filterIds(projectFilter);return projects().map((p,i)=>({p,i})).filter(({p})=>!ids||ids.includes(p.id));};
  function directoryHTML(c) {
    const F=filterCopy(), all=projects(), vis=visibleProjects();
    if(!vis.some(v=>v.i===selectedProject))selectedProject=vis[0]?.i??0;
    const chips=PROJECT_FILTERS.map(([k,ids])=>`<button type="button" class="pf-chip${k==='demo'?' is-demo':''}" data-filter="${k}" aria-pressed="${k===projectFilter}">${k==='demo'?icon('play'):''}<span>${esc(F[k])}</span><em>${ids?ids.filter(id=>all.some(p=>p.id===id)).length:all.length}</em></button>`).join('');
    const rows=vis.map(({p,i},n)=>`<button class="project-row ${i===selectedProject?'is-selected':''}" data-project="${p.id}" data-project-index="${i}" style="--i:${n}"><span class="row-index">${String(n+1).padStart(2,'0')}</span><span class="project-row-title"><strong translate="no">${p.name}</strong><small>${p.category}</small></span><span class="project-status">${p.status}</span><span class="row-arrow">↗</span></button>`).join('');
    const count=projectFilter==='all'?`${String(all.length).padStart(2,'0')} ${c.directory}`:F.of(vis.length,all.length);
    return `<div class="directory-heading"><h1>${c.all}</h1><span class="dir-count">${esc(count)}</span></div><p class="screen-intro">${c.projectIntro}</p>
      <div class="project-filters" role="group" aria-label="${esc(F.label)}">${chips}</div><div class="project-directory" aria-label="${c.all}">${rows}</div>`;
  }
  function setProjectFilter(key, focus) {
    if(!PROJECT_FILTERS.some(([k])=>k===key))return false;
    projectFilter=key; try{sessionStorage.setItem('niansia-project-filter',key);}catch{}
    if(view!=='projects'||projectId)return true;
    const out=$('.terminal-output'), top=out.scrollTop;
    const box=document.createElement('div'); box.innerHTML=directoryHTML(t());
    out.querySelector('.project-filters').replaceWith(box.querySelector('.project-filters'));
    out.querySelector('.project-directory').replaceWith(box.querySelector('.project-directory'));
    out.querySelector('.dir-count').textContent=box.querySelector('.dir-count').textContent;
    const dir=out.querySelector('.project-directory'); if(motion()){dir.classList.add('is-filtering');}
    out.scrollTop=top;
    if(focus)out.querySelector(`[data-filter="${key}"]`)?.focus({preventScroll:true});
    message(`${filterCopy()[key]} · ${visibleProjects().length}`);
    return true;
  }
  function screen(animate=true) {
    const c=t(), items=projects(), item=items.find(p=>p.id===projectId);
    let html='';
    $('.pane-path').textContent=`~/ ${view === 'home'?'start.sh':view === 'projects'?'projects/'+(item ? item.id : ''):files[paths.indexOf(view)]}`;
    // the home view keeps the pagetitle of index.qmd, which leads with the name people search for
    document.title = view==='home' ? ({en:'Niansia | AI Security & Computer Vision Portfolio','zh-TW':'Niansia｜AI 安全與電腦視覺作品集','zh-CN':'Niansia｜AI 安全与计算机视觉作品集'}[locale]) : `${item?.name || navLabel(view,c)} | Niansia terminal`;
    if (view==='home') html=homeScreen(c);
    if (view==='about') html=`${commandTitle('cat about.md')}<h1>${c.aboutTitle}</h1><div class="reading"><p>${c.bio}</p><p>${c.bio2}</p><p>${c.bio3}</p><h2>${c.education}</h2><ul class="education-list"><li><span class="edu-dot" aria-hidden="true"></span>${c.undergrad}</li><li><span class="edu-dot is-now" aria-hidden="true"></span>${c.graduate}<small>${c.leave}</small></li></ul><div class="interest-tags">${c.interests.split(' / ').map(tag=>`<span>${tag}</span>`).join('')}</div></div>${communityBlock()}${button('research',c.nav[3],true)}`;
    if (view==='research') html=`${commandTitle('cat research.md')}<h1>${c.researchTitle}</h1><p class="screen-intro">${c.researchIntro}</p>${capCopy()?`<button type="button" class="cap-jump" data-cap-jump>✦ ${esc(capCopy().open)} ↓</button>`:''}<div class="research-entry"><span>01</span><div><h2>${c.researchA}</h2><p>${c.researchABody}</p><small>security / robustness / evaluation</small></div></div>${advCard()}<div class="research-entry"><span>02</span><div><h2>${c.researchB}</h2><p>${c.researchBBody}</p><small>vision / reasoning / grounding</small></div></div>${statementLink()}${notesBlock()}${logBlock()}${capstoneBlock()}${teBlock()}${submissionsBlock()}<p class="comment-line">${c.researchNote}</p>`;
    if (view==='contact') html=`${commandTitle('cat contact.txt')}<h1>${c.contactTitle}</h1><div class="reading"><p>${c.contactBody}</p><div class="contact-address"><span translate="no">email:</span><a href="mailto:niansia930202@gmail.com" translate="no">niansia930202@gmail.com</a></div><div class="output-actions"><a class="action-button primary" href="mailto:niansia930202@gmail.com">${icon('mail')}<span>${c.send}</span></a><button class="action-button" data-action="copy">${icon('copy')}<span>${c.copy}</span></button></div><a class="github-link" href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">github.com/niansia ${icon('link')}</a></div>`;
    if (view==='hobbies') html=hobbiesScreen();
    if (view==='guestbook') html=window.NIANSIA_GUESTBOOK?window.NIANSIA_GUESTBOOK.screen(locale,commandTitle('cat guestbook.md')):`${commandTitle('cat guestbook.md')}<p>${t().noMatches}</p>`;
    if (view==='cv') html=cvScreen();
    if (view==='papers') html=papersScreen();
    if (view==='blog') html=blogScreen();
    if (view==='help') html=`${commandTitle('help')}<h1>${c.guideTitle}</h1><p>${c.guideIntro}</p><dl class="keyboard-guide">${c.keys.map(([key,description])=>`<div><dt><kbd>${key}</kbd></dt><dd>${description}</dd></div>`).join('')}</dl><h2>${c.commands}</h2>${commandCatalogue()}<p class="comment-line">${c.simulation}</p>`;
    if (view==='projects' && !item) html=`${commandTitle('ls ./projects/')}${directoryHTML(c)}`;
    if (view==='projects' && item) html=`${commandTitle('cat projects/'+esc(item.id)+'/README.md')}<button class="back-link" data-view="projects">← ${c.all}</button><div class="project-detail"><p class="detail-meta">${esc(item.category)}<span>${esc(item.status)}</span></p><h1 translate="no">${esc(item.name)}</h1><p class="project-description">${esc(item.description)}</p>${item.id==='taiwan-exam'?'<img class="project-art" src="/assets/work/taiwan-exam-social-preview.png" width="1280" height="640" alt="Taiwan Exam" loading="lazy">'+teFilmCard()+examsCard():''}${item.id==='lumigrid'?lumigridShowcase():''}${item.id==='kcrashlab'?kcShowcase():''}${item.id==='contextsec'?csShowcase():''}${item.id==='merriv'?mvShowcase():''}${item.id==='ai-repo-gardener'?rgShowcase():''}${item.id==='psg'?psShowcase():''}${item.id==='noveltyaudit'?naShowcase():''}${item.id==='research-meeting-coach'?rmShowcase():''}${item.id==='chromarecover'?crShowcase():''}${item.id==='adversarial-lab'?'<img class="project-art" src="/assets/og/adversarial-demo.jpg" width="1200" height="630" alt="Adversarial Lab" loading="lazy">'+advCard():''}<h2>${c.evidence}</h2><p>${esc(item.evidence)}</p><div class="output-actions"><a class="action-button primary" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span>${c.source}</span>${icon('link')}</a><a class="action-button" href="${esc(item.reference)}" target="_blank" rel="noopener noreferrer"><span>${esc(item.referenceLabel)}</span>${icon('link')}</a><button class="action-button" data-ask="${esc(item.name)}">${icon('chat')}<span>${c.askTitle}</span></button><button class="action-button" data-action="share" data-share="/p/${esc(item.id)}/${locale==='en'?'':locale.toLowerCase()+'/'}">${icon('link')}<span>${esc(noteCopy().share)}</span></button></div><div class="project-pagination"><button data-project-step="-1">← ${c.prev}</button><span>${items.indexOf(item)+1} / ${items.length}</span><button data-project-step="1">${c.next} →</button></div></div>`;
    const output=$('.terminal-output'); output.dataset.view=view; output.innerHTML=html; output.scrollTop=0; renderJournal();
    if (view==='research') initCapstone();
    if (view==='guestbook') window.NIANSIA_GUESTBOOK?.mount(output,locale);
    if (view==='projects' && projectId==='lumigrid') initLumigrid();
    if (view==='projects' && projectId==='kcrashlab') initKcrash();
    if (view==='projects' && projectId==='contextsec') initContextsec();
    if (view==='projects' && projectId==='merriv') initMerriv();
    if (view==='projects' && projectId==='ai-repo-gardener') initGardener();
    if (view==='projects' && projectId==='psg') initPsg();
    if (view==='projects' && projectId==='noveltyaudit') initNovelty();
    if (view==='projects' && projectId==='research-meeting-coach') initMeetingCoach();
    if (view==='projects' && projectId==='chromarecover') initChroma();
    output.classList.remove('screen-enter'); if (animate && motion()) { void output.offsetWidth; output.classList.add('screen-enter'); }
    root.querySelectorAll('[data-nav-index]').forEach((el,i)=>{el.classList.toggle('is-current',i===paths.indexOf(view));el.classList.toggle('is-selected',i===selectedNav);el.setAttribute('aria-current',i===paths.indexOf(view)?'page':'false');});
    moveIndicator();
  }
  function moveIndicator() {
    const current = $(`[data-nav-index="${paths.indexOf(view)}"]`), bar = $('.nav-indicator');
    if (!current || !bar) return;
    bar.style.transform = `translate(${current.offsetLeft}px, ${current.offsetTop}px)`;
    bar.style.width = `${current.offsetWidth}px`; bar.style.height = `${current.offsetHeight}px`;
  }
  function navigate(next,id='',options={}) {
    if (!paths.includes(next)) return;
    const a=depthOf(view,projectId), b=depthOf(next,id);
    const dir=b>a?'fwd':b<a?'back':paths.indexOf(next)>=paths.indexOf(view)?'fwd':'back';
    // The morphing title: the row (or card) that was clicked going in, the page heading coming back out.
    const leaving=projectId;
    const from=id&&options.origin?.querySelector?.('strong')||(leaving&&!id?titleOf(leaving):null);
    const to=id?()=>root.querySelector('.project-detail h1'):leaving?()=>root.querySelector(`[data-project="${CSS.escape(leaving)}"] strong`):null;
    const smooth=!options.keyboard&&motion('pages')&&!!document.startViewTransition;
    const change=()=>{
      view=next;projectId=id;selectedNav=paths.indexOf(view);
      if (id) selectedProject=Math.max(0,projects().findIndex(p=>p.id===id));
      history.pushState(null,'',`${langBase()}#${view}${id?'/'+encodeURIComponent(id):''}`);
      screen(!options.keyboard&&!smooth); message(t().ready);
      emit('navigate', {view, id, quiet: !!options.quiet});
      if (options.keyboard) $('.terminal-output').focus({preventScroll:true});
    };
    if (smooth) navTransition(change,{dir,from,to}); else change();
  }
  function goBack() {
    const input=document.activeElement?.matches('[data-command-input]') ? document.activeElement : $('#terminal-command');
    if (document.activeElement===input && input.value) {input.value='';message(t().ready);return;}
    if (projectId) {navigate('projects','',{keyboard:true});$(`[data-project-index="${selectedProject}"]`)?.focus({preventScroll:true});}
    else if (view!=='home') navigate('home','',{keyboard:true});
    else {input.blur();selectedNav=0;selectNav();message(t().ready);}
  }
  function message(text) {const el=$('.command-message'); if (el) el.textContent=text;}
  function toast(text) {const el=$('.toast');el.textContent=text;el.hidden=false;el.classList.remove('is-in');void el.offsetWidth;el.classList.add('is-in');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},2800);}
  function selectNav() {
    root.querySelectorAll('[data-nav-index]').forEach((el,i)=>el.classList.toggle('is-selected',i===selectedNav));
    const el=$(`[data-nav-index="${selectedNav}"]`);el.focus({preventScroll:true});el.scrollIntoView({block:'nearest',inline:'nearest'});
    message(`${navLabel(paths[selectedNav])} · Enter ${t().open}`);
  }
  function moveSelection(key) {
    const inDirectory=view==='projects'&&!projectId;
    const order=inDirectory?visibleProjects().map(v=>v.i):null;
    const count=inDirectory?order.length:paths.length;
    let index=inDirectory?Math.max(0,order.indexOf(selectedProject)):selectedNav;
    index=key==='Home'?0:key==='End'?count-1:(index+(key==='ArrowUp'?-1:1)+count)%count;
    if(inDirectory){selectedProject=order[index];root.querySelectorAll('[data-project-index]').forEach(el=>el.classList.toggle('is-selected',Number(el.dataset.projectIndex)===selectedProject));const el=$(`[data-project-index="${selectedProject}"]`);el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});}
    else {selectedNav=index;selectNav();}
  }
  function changeLanguage(next, origin) {
    if (!window.NIANSIA_COPY[next]) return;
    transition(() => {
      locale=next;store.set('language',locale);
      history.pushState(null,'',`${langBase()}#${view}${projectId?'/'+projectId:''}`);
      shell(); emit('locale', {locale});
    }, origin);
  }
  function renderJournal() {
    const region=$('.command-results');if(!region)return;
    region.hidden=!commandEntries.length;
    region.innerHTML=commandEntries.map((entry,i)=>`<div class="command-entry ${i===commandEntries.length-1?'is-new':''} ${entry.yuki?'from-yuki':''}"><div class="command-entry-input" translate="no">❯ ${esc(entry.command)}</div><pre>${esc(entry.text)}</pre>${entry.links?.length?`<div class="result-links">${entry.links.map(link=>link.id?`<button data-project="${esc(link.id)}">${esc(link.label)} ↗</button>`:link.url?`<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`:`<button data-command="${esc(link.command)}">${esc(link.label)}</button>`).join('')}</div>`:''}</div>`).join('');
    region.scrollTop=region.scrollHeight;
  }
  function record(command,text,links=[],extra={}) {
    commandEntries.push({command,text:String(text),links,...extra});
    if(commandEntries.length>20)commandEntries.shift();
    renderJournal();$('.terminal-output').scrollTop=0;message(String(text).split('\n')[0]||t().done);
  }
  function complete(value) {
    const split=value.indexOf(' '),head=split<0?value:value.slice(0,split),tail=split<0?'':value.slice(split+1).toLowerCase();
    if(split<0)return catalogue.map(c=>c.name).filter(name=>name.startsWith(head.toLowerCase()));
    const values={festival:['list','auto','off',...(window.NIANSIA_FESTIVAL?.list||[]).map(f=>f.id)],accessory:['list','auto','none',...Object.keys(window.YukiWardrobe?.accessories||{})],outfit:['list','auto',...(window.YukiWardrobe?.outfits()||[]).map(o=>o.id)],theme:themes,style:themes,lang:['en','zh-tw','zh-cn'],tour:['research','builder','fun'],trick:['spin','dance','piano','violin','encore'],play:['yarn','wand','chase'],feed:['fish','taiyaki','cake'],projects:PROJECT_FILTERS.map(([k])=>k),motion:['on','off'],follow:['on','off'],trail:['hearts','paws','stars','petals','off'],cursor:['s','m','l'],help:catalogue.map(c=>c.name)};
    const destinations=['home','about.md','research.md','papers.bib','contact.txt','hobbies.md','guestbook.md','projects/',...projects().map(p=>p.id),...projects().map(p=>'projects/'+p.id+'/README.md')];
    return (values[head]||(['cd','cat','open','github'].includes(head)?destinations:[])).filter(item=>item.startsWith(tail)).map(item=>head+' '+item);
  }
  let tabCycle=null;
  function cycleTab(input,back) {
    const value=input.value;
    if(tabCycle&&tabCycle.input===input&&value===tabCycle.list[tabCycle.index]) {
      tabCycle.index=(tabCycle.index+(back?-1:1)+tabCycle.list.length)%tabCycle.list.length;
    } else {
      if(!value.trim()&&back)return false; // keep Shift+Tab for leaving an empty field
      let list=complete(value.trimStart());
      if(list.length===1&&list[0]===value.trim()) {
        const args=complete(list[0]+' ');
        if(args.length)list=args;
      }
      if(!list.length){message(t().historyHint);return true;} // no match: stay in the field, like a shell
      if(list.length===1){input.value=list[0]+(complete(list[0]+' ').length?' ':'');tabCycle=null;message(list[0]);return true;}
      tabCycle={input,list,index:back?list.length-1:0};
    }
    const {list,index}=tabCycle;
    input.value=list[index];
    input.setSelectionRange(input.value.length,input.value.length);
    // Show where we are: the whole list when short, otherwise two neighbours on each side.
    const shown=list.length<=5?list.map((c,i)=>i===index?`[ ${c} ]`:c):[-2,-1,0,1,2].map(d=>{const c=list[(index+d+list.length)%list.length];return d?c:`[ ${c} ]`;});
    message(`Tab ${index+1}/${list.length} · ${shown.join(' · ')}`);
    return true;
  }
  function resolveTarget(value) {
    const name=value.toLowerCase().replace(/^(~\/|\.\/|\/)/,'').replace(/\/readme\.md$/,'').replace(/\/$/,'');
    const aliases={'':'home','~':'home','start.sh':'home','about.md':'about','profile':'about','research.md':'research','contact.txt':'contact','hobbies.md':'hobbies','guestbook.md':'guestbook','cv.pdf':'cv','papers.bib':'papers','blog/':'blog','now':'blog','qa':'blog','publications':'papers','pubs':'papers','bib':'papers','hobby':'hobbies','cosplay':'hobbies','work':'projects','portfolio':'projects'};
    const path=aliases[name]||name;
    if(paths.includes(path))return {view:path};
    const item=projects().find(p=>p.id===name.replace(/^projects\//,'')||p.name.toLowerCase()===name);
    return item?{view:'projects',id:item.id}:null;
  }
  function askYuki(value, raw) {
    const brain=yuki();
    if(!brain){record(raw,t().unknown);return;}
    message(t().typing);
    brain.ask(value,{source:'terminal'}).then(reply=>record(raw,reply.text,reply.links||[],{yuki:true}));
  }
  function petCommand(name, value) {
    const pet=yuki();
    if(!pet){record(value,t().unknown);return;}
    record(value,pet.act(name)||t().done,[],{yuki:true});
  }
  function runCommand(raw) {
    const value=raw.trim().slice(0,500);if(!value)return;
    commandHistory.push(value);if(commandHistory.length>50)commandHistory.shift();historyIndex=commandHistory.length;
    const parsed=window.NIANSIA_TERMINAL.parse(value);
    if(parsed.error){record(value,t().quoteError);return;}
    const aliases={'?':'help',gb:'guestbook','考卷':'exams','模擬考':'exams','模拟考':'exams',gallery:'exams','留言板':'guestbook','留言':'guestbook',resume:'cv',linkedin:'cv','cv.pdf':'cv','履歷':'cv','简历':'cv',work:'projects',portfolio:'projects',profile:'about','./start.sh':'home','start.sh':'home',meow:'pet',search:'find','作品':'projects','研究':'research','聯絡':'contact','联系':'contact',ddl:'deadlines',countdown:'deadlines',publications:'papers',pubs:'papers',bib:'papers','部落格':'blog','博客':'blog',now:'blog',posts:'blog','論文':'papers','论文':'papers',paper:'papers',quick:'brief','快速瀏覽':'brief','快速浏览':'brief','簡介':'brief','简介':'brief',guide:'tour','導覽':'tour','导览':'tour',cmdk:'palette','ctrl+k':'palette',adversarial:'attack',adv:'attack',fgsm:'attack',pgd:'attack','對抗':'attack','对抗':'attack','專題':'capstone','专题':'capstone','投稿':'deadlines','截止':'deadlines',hobby:'hobbies',cosplay:'hobbies',cos:'hobbies',fun:'hobbies','興趣':'hobbies','兴趣':'hobbies','日常':'hobbies','關於':'about','关于':'about'};
    const name=aliases[parsed.name]||parsed.name,args=parsed.args,arg=args.join(' '),lower=arg.toLowerCase();
    const definition=catalogue.find(c=>c.name===name);
    const usage=()=>record(value,`${t().usage}: ${definition?.usage||'help'}\n${definition?.description[locale]||t().unknown}`);
    const finish=(text,links)=>record(value,text,links);
    const projectLinks=items=>items.map(p=>({id:p.id,label:p.name}));
    const showTarget=target=>{navigate(target.view,target.id||'',{keyboard:true});finish(t().routeReplies[target.view]);};
    if(name==='projects'&&args.length){
      const F=filterCopy(), key=PROJECT_FILTERS.map(([k])=>k).find(k=>k===lower||F[k].toLowerCase()===lower);
      if(!key){finish(`${t().usage}: projects [${PROJECT_FILTERS.map(([k])=>k).join('|')}]`);return;}
      setProjectFilter(key);navigate('projects','',{keyboard:true});
      finish(visibleProjects().map(({p})=>`${p.name} · ${p.category}`).join('\n'),projectLinks(visibleProjects().map(v=>v.p)));return;
    }
    if(paths.includes(name)&&name!=='help'){
      if(args.length){usage();return;}showTarget({view:name});return;
    }
    switch(name){
      case 'help': {
        if(!arg){navigate('help','',{keyboard:true});finish(n(t().commandHelp));}
        else {const command=catalogue.find(c=>c.name===lower);if(command)finish(`${command.usage}\n${command.description[locale]}\n> ${command.example}`);else finish(t().unknown);}
        break;
      }
      case 'capstone': {
        navigate('research','',{keyboard:true});
        setTimeout(()=>$('#capstone')?.scrollIntoView({behavior:motion()?'smooth':'auto',block:'start'}),60);
        finish(capCopy()?.title||t().unknown);break;
      }
      case 'deadlines': {
        const S=subCopy();
        if(!S){finish(t().unknown);break;}
        finish(`${S.title}\n`+subs().venues.map(v=>`${v.venue.padEnd(10)} ${(v.topic[locale]||v.topic.en)} · ${v.deadline?`${aoeDate(v.deadline)} · ${countdown(v.deadline)}`:S.tba}`).join('\n'));
        break;
      }
      case 'brief':finish(`/brief/${pubSeg()}`);location.href=`/brief/${pubSeg()}`;break;
      case 'tour':{const T=window.YUKI_TOUR;if(!T){finish(t().unknown);break;}const track=['research','builder','fun'].includes(lower)?lower:'';finish(track?`tour: ${track}`:'tour');T.start(track);break;}
      case 'palette':window.NIANSIA_PALETTE?.open(arg);finish('⌘K / Ctrl+K');break;
      case 'whoami':finish(`Niansia\n${t().role}\n${t().leave}\n${t().interests}`);break;
      case 'ls': {
        const location=lower|| (view==='projects'?'projects':'~');
        if(['projects','projects/','./projects/','~/projects/','~/projects'].includes(location))finish(projects().map(p=>`${p.id}/  [${p.status}]`).join('\n'),projectLinks(projects()));
        else if(['~','/','.','./'].includes(location))finish(files.join('\n'));
        else {const target=resolveTarget(arg);if(target?.id)finish('README.md\n'+projects().find(p=>p.id===target.id).category);else usage();}
        break;
      }
      case 'cd':case 'cat':case 'open': {
        if(name==='cd'&&['..','../'].includes(lower)){goBack();finish(t().routeReplies[view]);break;}
        if(!arg&&name!=='cd'){usage();break;}
        const target=resolveTarget(arg);if(target)showTarget(target);else finish(t().noMatches);
        break;
      }
      case 'pwd':finish(view==='projects'?'~/projects/'+projectId:'~/');break;
      case 'tree':finish('~/\n├── start.sh\n├── about.md\n├── research.md\n├── papers.bib\n├── blog/\n├── contact.txt\n├── hobbies.md\n├── guestbook.md\n└── projects/\n'+projects().map((p,i)=>`    ${i===projects().length-1?'└':'├'}── ${p.id}/`).join('\n'));break;
      case 'find':case 'skills': {
        if(name==='find'&&!arg){usage();break;}
        const matches=projects().filter(p=>name==='skills'?/skill/i.test(p.description):`${p.name} ${p.id} ${p.description} ${p.category}`.toLowerCase().includes(lower));
        finish(matches.length?matches.map(p=>`${p.name} · ${p.category}`).join('\n'):t().noMatches,projectLinks(matches));break;
      }
      case 'status':finish(`theme: ${theme}\nlanguage: ${locale}\nanimation: ${MOTION_PARTS.map(k=>`${k} ${motion(k)?'on':'off'}`).join(' · ')}\nfollow: ${fx()?.state().follow?'on':'off'}\nyuki stay: ${yuki()?.stay()?'on':'off'}\ntrail: ${fx()?.state().trail||'off'}\ncursor: ${fx()?.state().size||'m'}\nprojects: ${projects().length}\nyuki: ${yuki()?.summary()||'-'}`);break;
      case 'email':finish('niansia930202@gmail.com',[{label:t().send,url:'mailto:niansia930202@gmail.com'}]);break;
      case 'github': {
        const item=arg?projects().find(p=>p.id===lower||p.name.toLowerCase()===lower):null;
        if(arg&&!item){finish(t().noMatches);break;}
        const url=item?.url||'https://github.com/niansia';finish(url,[{label:item?.name||'Niansia · GitHub',url}]);break;
      }
      case 'date':finish(new Intl.DateTimeFormat(locale,{dateStyle:'full'}).format(new Date()));break;
      case 'time':finish(new Intl.DateTimeFormat(locale,{timeStyle:'long'}).format(new Date()));break;
      case 'theme':case 'style': {
        if(!arg)toggleTheme();else if(themes.includes(lower))setTheme(lower);else {usage();break;}
        finish(`${name}: ${theme} · ${t().themeNames[theme]}`);break;
      }
      case 'lang': {
        const codes={en:'en','zh-tw':'zh-TW','zh-cn':'zh-CN'};
        if(!codes[lower]){usage();break;}changeLanguage(codes[lower]);setTimeout(()=>record(value,`language: ${codes[lower]}`),60);break;
      }
      case 'pet':case 'feed':case 'play':case 'sleep':case 'wake':case 'lie':case 'trick':case 'hide':petCommand(['feed','play','trick'].includes(name)&&lower?`${name}:${lower}`:name,value);break;
      case 'yuki':finish(yuki()?.report()||'-');break;
      case 'cv':if(cvState()==='hidden'){finish(t().unknown);break;}navigate('cv');break;
      case 'log':location.href=`/log/${locale==='en'?'en':locale.toLowerCase()}/`;finish('/log/');break;
      case 'statement':location.href=`/statement/${locale==='en'?'en':locale.toLowerCase()}/`;finish('/statement/');break;
      case 'exams':finish(`/exams/${examsSeg()}/`);location.href=`/exams/${examsSeg()}/`;break;
      case 'notes':finish(`/notes/${locale==='en'?'en':locale.toLowerCase()}/`);location.href=`/notes/${locale==='en'?'en':locale.toLowerCase()}/`;break;
      case 'attack':finish('/lab/adversarial/');location.href=`/lab/adversarial/?lang=${locale}`;break;
      case 'demo':finish('/lab/lumigrid/');location.href=`/lab/lumigrid/?lang=${locale}`;break;
      case 'stay':{const Y=yuki();if(!Y){finish(t().unknown);break;}const on=arg?!/^(off|no|0|roam)$/i.test(arg):!Y.stay();finish(Y.stay(on));break;}
      case 'chat':yuki()?.openChat(arg);finish(t().chatTitle);break;
      case 'ask':if(!arg)usage();else askYuki(arg,value);break;
      case 'brain':finish(yuki()?.brainReport()||t().brainOff);break;
      case 'follow':case 'motion':case 'trail':case 'cursor': {
        if(name==='follow'){if(arg&&!['on','off'].includes(lower)){usage();break;}const on=arg?lower==='on':!fx()?.state().follow;fx()?.setFollow(on);finish(on?t().followOn:t().followOff);}
        if(name==='motion'){const [a,b]=lower.split(/\s+/),part=MOTION_PARTS.includes(a)?a:'',state=part?b:a;if((a&&!part&&!['on','off'].includes(a))||(state&&!['on','off'].includes(state))){usage();break;}
          if(part){const on=state?state==='on':!motionParts[part];setMotion(on,part);finish(`${motionCopy().parts[part][0]}: ${on?'on':'off'}`);}else{setMotion(state?state==='on':allOff());finish(allOff()?t().motionOff:t().motionOn);}}
        if(name==='trail'){const modes=['hearts','paws','stars','petals','off'],mode=!arg?(fx()?.state().trail==='off'?'hearts':'off'):lower==='on'?'hearts':lower;if(!modes.includes(mode)){usage();break;}fx()?.setTrail(mode);finish(`trail: ${t().trails[mode]}`);}
        if(name==='cursor'){const size={small:'s',medium:'m',large:'l'}[lower]||lower||'m';if(!['s','m','l'].includes(size)){usage();break;}fx()?.setSize(size);finish(`cursor: ${t().sizes[size]}`);}
        break;
      }
      case 'clear':commandEntries=[];renderJournal();message(n(t().commandHint));break;
      case 'history':finish(commandHistory.length?commandHistory.map((cmd,i)=>`${String(i+1).padStart(2,'0')}  ${cmd}`).join('\n'):t().historyEmpty);break;
      case 'echo':if(!args.length)usage();else finish(arg);break;
      case 'user': {
        if(!arg){finish(`${t().userSet}: ${username}`);break;}
        if(arg.length>24||!arg.trim()){finish(t().emptyName);break;}
        username=arg;store.set('user',username);root.querySelectorAll('.session-user').forEach(el=>el.textContent=username);finish(`${t().userSet}: ${username}`);break;
      }
      case 'neofetch':finish(`   /\\_/\\     niansia.terminal
  ( ･ω･ )    ${t().role}
  /つ  つ    ${projects().length} projects · 3 languages · ${catalogue.length} commands
             theme ${theme} · yuki ${yuki()?.summary()||''}
             ${t().interests}`);break;
      case 'shortcuts':finish(t().keys.map(([key,description])=>`${key.padEnd(14)} ${description}`).join('\n')+'\n'+t().historyHint);break;
      case 'sudo':finish(t().sudo);yuki()?.act('poke');break;
      case 'festival': {
        const F=window.NIANSIA_FESTIVAL;if(!F){finish(t().unknown);break;}
        if(lower==='list'){finish(F.upcoming(new Date(),8).map(o=>`${o.start}${o.end!==o.start?' → '+o.end:''}  ${o.festival.id.padEnd(13)} ${o.festival.name[locale]}`).join('\n'));break;}
        if(lower){if(lower!=='auto'&&lower!=='off'&&!F.list.some(f=>f.id===lower)){finish(`${t().usage}: ${definition.usage}\n${F.list.map(f=>f.id).join(' ')}`);break;}F.force(lower==='auto'?'':lower);applyFestival();screen(false);emit('festival');}
        const a=F.active();finish(a?`${a.festivals.map(f=>f.name[locale]).join(' + ')}  ${a.start} → ${a.end}\n${t().festivalHelp}`:`${t().festivalNone.replace('{next}',(F.upcoming(new Date(),1)[0]||{festival:{name:{}}}).festival.name[locale]||'-')}\n${t().festivalHelp}`);break;
      }
      case 'outfit':case 'accessory': {
        const W=window.YukiWardrobe,Y=yuki();if(!W||!Y){finish(t().unknown);break;}
        if(name==='outfit'){const list=W.outfits();if(!lower||lower==='list'){finish([`${Y.outfit()==='auto'?'●':'○'} auto         ${t().accAuto}`].concat(list.map(o=>`${o.id===Y.outfit()?'●':'○'} ${o.id.padEnd(12)} ${o.name?.[locale]||''}`)).join('\n')+(list.length<2?'\n'+t().moreOutfits:''));break;}if(lower!=='auto'&&!list.some(o=>o.id===lower)){usage();break;}Y.setOutfit(lower);finish(`outfit: ${lower}`);break;}
        const ids=Object.keys(W.accessories);if(!lower||lower==='list'){finish(['auto','none',...ids].map(id=>`${id===Y.accessory()?'●':'○'} ${id.padEnd(12)} ${W.accessories[id]?.name[locale]||(id==='auto'?t().accAuto:t().accNone)}`).join('\n'));break;}
        if(lower!=='auto'&&lower!=='none'&&!ids.includes(lower)){usage();break;}Y.setAccessory(lower);finish(`accessory: ${lower}`);break;
      }
      default: {const target=resolveTarget(value);if(target)showTarget(target);else askYuki(value,value);}
    }
  }
  function toggleStyles(open) {
    const pop=$('.style-popover'),btn=$('[data-action="styles"]');if(!pop)return;
    const next=open??pop.hidden;pop.hidden=!next;btn.setAttribute('aria-expanded',String(next));
    if(!next)endPreview();
    if(next)pop.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  }
  function toggleMotionMenu(open) {
    const pop=$('.motion-popover'),btn=$('[data-action="motion"]');if(!pop)return;
    const next=open??pop.hidden;pop.hidden=!next;btn.setAttribute('aria-expanded',String(next));
    if(next){toggleStyles(false);pop.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
  }
  function windowAction(kind) {
    const win=$('.terminal-window');
    if(kind==='win-close'){win.classList.remove('is-shaking');void win.offsetWidth;win.classList.add('is-shaking');yuki()?.say(t().winClose,'poke');if(!yuki())toast(t().winClose);}
    if(kind==='win-min'){const min=!win.classList.contains('is-minimized');win.classList.toggle('is-minimized',min);if(min)toast(t().winMin);emit('layout');}
    if(kind==='win-max'){const max=document.documentElement.dataset.max!=='on';document.documentElement.dataset.max=max?'on':'off';toast(max?t().winMax:t().winRestore);setTimeout(()=>emit('layout'),320);}
  }
  root.addEventListener('click',async event=>{
    const target=event.target.closest('button,a');
    if(!event.target.closest('.style-menu'))toggleStyles(false);
    if(!event.target.closest('.motion-menu'))toggleMotionMenu(false);
    if(event.target.closest('.window-title')&&$('.terminal-window').classList.contains('is-minimized'))windowAction('win-min');
    if(!target)return;
    if(target.dataset.filter){setProjectFilter(target.dataset.filter,true);return;}
    if(target.dataset.blogFilter){setBlogFilter(target.dataset.blogFilter,true);return;}
    if(target.dataset.latestDot!==undefined){showLatest(Number(target.dataset.latestDot));return;}
    if(target.dataset.view){event.preventDefault();const anchor=target.dataset.anchor;navigate(target.dataset.view,'',{keyboard:event.detail===0,origin:target});if(anchor)setTimeout(()=>root.querySelector('#'+CSS.escape(anchor))?.scrollIntoView({behavior:motion()?'smooth':'auto',block:'start'}),700);}
    if(target.dataset.project){navigate('projects',target.dataset.project,{keyboard:event.detail===0,origin:target});}
    if(target.dataset.projectStep){const i=projects().findIndex(p=>p.id===projectId),count=projects().length;navigate('projects',projects()[(i+Number(target.dataset.projectStep)+count)%count].id);}
    if(target.dataset.lang&&target.dataset.lang!==locale){changeLanguage(target.dataset.lang,target);}
    if(target.dataset.themePick)pickTheme(target.dataset.themePick,target);
    if(target.hasAttribute('data-fest-skin')){const f=window.NIANSIA_FESTIVAL?.active();if(f){store.set('fest-skin',festSkinOn(f)?`off:${f.primary.id}`:'on');transition(applyFestival,target);}}
    if(target.dataset.command)runCommand(target.dataset.command);
    if(target.dataset.motionPart){setMotion(!motionParts[target.dataset.motionPart],target.dataset.motionPart);return;}
    if(target.hasAttribute('data-motion-all')){setMotion(allOff());return;}
    if(target.hasAttribute('data-fest-celebrate')){const box=target.getBoundingClientRect();for(let i=0;i<3;i++)setTimeout(()=>fx()?.burst(box.left+box.width*(.2+.3*i),box.top+box.height/2,'hearts'),i*140);fx()?.celebrate();yuki()?.act('trick');const l=yuki()?.festivalLine();if(l)yuki()?.say(l);}
    if(target.dataset.ask){yuki()?.openChat(target.dataset.ask);}
    if(target.dataset.bib){const entry=pubList().find(p=>p.id===target.dataset.bib);try{await navigator.clipboard.writeText(entry.bibtex);toast(pubCopy().copied);}catch{toast(entry.bibtex.split('\n')[0]);}}
    if(target.dataset.commandFill){const input=$('#screen-command')||$('#terminal-command');input.value=target.dataset.commandFill;input.focus();input.select();}
    switch(target.dataset.action){
      case 'theme':toggleTheme(target);break;
      case 'styles':toggleStyles();break;
      case 'motion':toggleMotionMenu();break;
      case 'chat':yuki()?.openChat();break;
      case 'win-close':case 'win-min':case 'win-max':windowAction(target.dataset.action);break;
      case 'bib-all':{const blob=new Blob([bibtexAll()],{type:'application/x-bibtex'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='niansia.bib';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);break;}
      case 'palette':window.NIANSIA_PALETTE?.open();break;
      case 'copy':try{await navigator.clipboard.writeText('niansia930202@gmail.com');toast(t().copied);}catch{toast(t().copyFail);}break;
      case 'share':{const url=`${location.origin}${target.dataset.share}`;try{if(navigator.share&&matchMedia('(pointer:coarse)').matches){await navigator.share({url});}else{await navigator.clipboard.writeText(url);toast(noteCopy().shared);}}catch(e){if(e?.name!=='AbortError')toast(url);}break;}
    }
  });
  root.addEventListener('pointerover',event=>{const pick=event.target.closest('.style-popover [data-theme-pick]');if(pick&&event.pointerType!=='touch')previewTheme(pick.dataset.themePick);});
  root.addEventListener('pointerout',event=>{const pop=event.target.closest('.style-popover');if(pop&&!pop.contains(event.relatedTarget))endPreview();});
  root.addEventListener('focusin',event=>{const pick=event.target.closest('.style-popover [data-theme-pick]');if(pick&&pick.matches(':focus-visible'))previewTheme(pick.dataset.themePick);});
  root.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.matches('.command-form,.inline-command-form')){const input=event.target.querySelector('[data-command-input]'),id=input.id,value=input.value;input.value='';historyDraft='';runCommand(value);$('#'+id)?.focus({preventScroll:true});}
  });
  document.addEventListener('keydown',event=>{
    if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.defaultPrevented)return;
    const target=event.target,editable=target.matches('input,textarea,select,[contenteditable="true"]');
    if(!root.contains(target)&&target!==document.body&&target!==document.documentElement)return;
    if(event.key==='Escape'){event.preventDefault();if(!$('.style-popover').hidden){toggleStyles(false);$('[data-action="styles"]').focus();return;}if(!$('.motion-popover').hidden){toggleMotionMenu(false);$('[data-action="motion"]').focus();return;}goBack();return;}
    if(editable){
      if(target.matches('[data-command-input]')) {
        if(event.key==='Tab'&&cycleTab(target,event.shiftKey))event.preventDefault();
        if(['ArrowUp','ArrowDown'].includes(event.key)){
          event.preventDefault();
          if(historyIndex===commandHistory.length)historyDraft=target.value;
          historyIndex=Math.max(0,Math.min(commandHistory.length,historyIndex+(event.key==='ArrowUp'?-1:1)));
          target.value=historyIndex===commandHistory.length?historyDraft:commandHistory[historyIndex]||'';
          target.setSelectionRange(target.value.length,target.value.length);
        }
      }
      return;
    }
    if(target.closest('.blog-filters')&&['ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();const chips=[...root.querySelectorAll('.blog-filters .pf-chip:not(:disabled)')],i=chips.indexOf(target.closest('.pf-chip')),next=chips[(i+(event.key==='ArrowLeft'?-1:1)+chips.length)%chips.length];setBlogFilter(next.dataset.blogFilter,true);return;
    }
    if(target.closest('.project-filters')&&['ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();const chips=[...root.querySelectorAll('.pf-chip')],i=chips.indexOf(target.closest('.pf-chip')),next=chips[(i+(event.key==='ArrowLeft'?-1:1)+chips.length)%chips.length];setProjectFilter(next.dataset.filter,true);return;
    }
    if(target.closest('.motion-popover')&&['ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();const rows=[...root.querySelectorAll('.motion-popover button:not(:disabled)')],i=rows.indexOf(target.closest('button'));
      rows[(i+(event.key==='ArrowUp'?-1:1)+rows.length)%rows.length]?.focus();return;
    }
    if(target.closest('.style-popover')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();const options=[...root.querySelectorAll('.style-option')],i=options.indexOf(target.closest('.style-option'));
      options[(i+(['ArrowUp','ArrowLeft'].includes(event.key)?-1:1)+options.length)%options.length].focus();return;
    }
    if(event.key==='/'){event.preventDefault();($('#screen-command')||$('#terminal-command')).focus();return;}
    if(event.key==='ArrowLeft'){event.preventDefault();goBack();return;}
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)&&!projectId){event.preventDefault();moveSelection(event.key);return;}
    if(event.key==='ArrowRight'||(event.key==='Enter'&&!target.closest('button,a'))){event.preventDefault();if(view==='projects'&&!projectId)navigate('projects',projects()[selectedProject].id,{keyboard:true});else if(!projectId)navigate(paths[selectedNav],'',{keyboard:true});}
  });
  reduced.addEventListener('change',applyMotion);
  window.addEventListener('pageswap',event=>{ if(!motion('pages')) event.viewTransition?.skipTransition(); });
  window.addEventListener('resize',moveIndicator);
  window.addEventListener('popstate',()=>{const before=locale;readLocation();if(before!==locale)shell();else screen(false);});
  setInterval(tickClock, 15000);
  window.NIANSIA_APP = {
    locale:()=>locale, t, projects, view:()=>({view,projectId}), store, esc, icon,
    navigate, setTheme, theme:()=>theme, themes, themeGroups, darkThemes, setLanguage:changeLanguage, setMotion, motion, toast, message, record,
    previewTheme, endPreview, pickTheme, runCommand, paths:()=>paths, files:()=>files, navLabel, pubList, pubText, pubHidden, pubCopy, briefCopy, pubSeg, bibtexAll, modKey,
    toggleStyles, openStyles:()=>toggleStyles(true), motionParts:()=>({...motionParts}), allMotionOff:allOff, openMotion:()=>toggleMotionMenu(true)
  };
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
  readLocation();shell();applyFestival();
})();
