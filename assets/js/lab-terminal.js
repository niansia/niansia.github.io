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
    document.title = `${item?.name || navLabel(view,c)} | Niansia terminal`;
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
    if (view==='projects' && item) html=`${commandTitle('cat projects/'+esc(item.id)+'/README.md')}<button class="back-link" data-view="projects">← ${c.all}</button><div class="project-detail"><p class="detail-meta">${esc(item.category)}<span>${esc(item.status)}</span></p><h1 translate="no">${esc(item.name)}</h1><p class="project-description">${esc(item.description)}</p>${item.id==='taiwan-exam'?'<img class="project-art" src="/assets/work/taiwan-exam-social-preview.png" width="1280" height="640" alt="Taiwan Exam" loading="lazy">'+teFilmCard()+examsCard():''}${item.id==='lumigrid'?lumigridShowcase():''}${item.id==='kcrashlab'?kcShowcase():''}${item.id==='contextsec'?csShowcase():''}${item.id==='adversarial-lab'?'<img class="project-art" src="/assets/og/adversarial-demo.jpg" width="1200" height="630" alt="Adversarial Lab" loading="lazy">'+advCard():''}<h2>${c.evidence}</h2><p>${esc(item.evidence)}</p><div class="output-actions"><a class="action-button primary" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span>${c.source}</span>${icon('link')}</a><a class="action-button" href="${esc(item.reference)}" target="_blank" rel="noopener noreferrer"><span>${esc(item.referenceLabel)}</span>${icon('link')}</a><button class="action-button" data-ask="${esc(item.name)}">${icon('chat')}<span>${c.askTitle}</span></button><button class="action-button" data-action="share" data-share="/p/${esc(item.id)}/${locale==='en'?'':locale.toLowerCase()+'/'}">${icon('link')}<span>${esc(noteCopy().share)}</span></button></div><div class="project-pagination"><button data-project-step="-1">← ${c.prev}</button><span>${items.indexOf(item)+1} / ${items.length}</span><button data-project-step="1">${c.next} →</button></div></div>`;
    const output=$('.terminal-output'); output.dataset.view=view; output.innerHTML=html; output.scrollTop=0; renderJournal();
    if (view==='research') initCapstone();
    if (view==='guestbook') window.NIANSIA_GUESTBOOK?.mount(output,locale);
    if (view==='projects' && projectId==='lumigrid') initLumigrid();
    if (view==='projects' && projectId==='kcrashlab') initKcrash();
    if (view==='projects' && projectId==='contextsec') initContextsec();
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
