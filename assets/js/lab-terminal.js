/* Niansia's portfolio shell: no commands leave the browser. */
(() => {
  'use strict';
  const root = document.querySelector('[data-terminal-app]');
  if (!root || !window.NIANSIA_COPY || !window.NIANSIA_PROJECTS || !window.NIANSIA_TERMINAL) return;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const store = { get(key, fallback) { try { return localStorage.getItem(`niansia-${key}`) ?? fallback; } catch { return fallback; } }, set(key,value) { try { localStorage.setItem(`niansia-${key}`,value); } catch {} } };
  const paths = ['home','about','projects','research','contact','hobbies','help'];
  const files = ['start.sh','about.md','projects/','research.md','contact.txt','hobbies.md','help'];
  const themes = ['sakura','light','dark','matcha','retro'];
  const themeColors = {light:'#edf0f7',dark:'#101117',sakura:'#fbf0f4',matcha:'#eef2e8',retro:'#060a07'};
  const icons = {
    terminal:'m4 5 6 7-6 7m9 0h7', file:'M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 13h8M8 17h5',
    folder:'M3 7V4h6l2 3h10v13H3z', research:'M9 3h6m-5 0v7l-5 9q-1 2 2 2h10q3 0 2-2l-5-9V3M8 15h8',
    mail:'M3 5h18v14H3zM3 5l9 8 9-8', help:'M9 8a3 3 0 1 1 5 3l-2 2v1M12 18h.01',
    sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.4 1.4m10 10 1.4 1.4M5.6 18.4 1.4-1.4m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z', pause:'M8 5v14M16 5v14', play:'m8 4 12 8-12 8z',
    paw:'M8 14q4-5 8 0l2 4q0 4-6 1-6 3-6-1zM5 7v3M10 4v3M15 4v3M20 7v3',
    arrow:'M4 12h15m-6-6 6 6-6 6', close:'m6 6 12 12M6 18 18 6', chat:'M4 4h16v13H9l-5 4z', link:'M8 16 16 8M10 4h10v10M5 9H3v12h12v-2', copy:'M8 8h12v12H8zM4 16H2V2h14v2', heart:'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5z',
    palette:'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.4-2.2-.7-1.3.2-2.8 1.7-2.8H18a3 3 0 0 0 3-3c0-5.5-4-10-9-10zM7.5 11h.01M10 7h.01M15 7.5h.01',
    spark:'M12 3v5m0 8v5M3 12h5m8 0h5M6 6l3 3m6 6 3 3M6 18l3-3m6-6 3-3'
  };
  const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.file}"/></svg>`;
  let locale = root.dataset.locale || 'en';
  let view = root.dataset.initial || 'home', projectId = '', selectedNav = 0, selectedProject = 0;
  let theme = themes.includes(store.get('theme','sakura')) ? store.get('theme','sakura') : 'sakura', paused = store.get('motion','on') === 'off';
  let toastTimer, commandHistory = [], historyIndex = 0, booted = false;
  let username = store.get('user','niansia').slice(0,24), historyDraft = '', commandEntries = [];
  const catalogue = window.NIANSIA_TERMINAL.commands;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const t = () => window.NIANSIA_COPY[locale];
  const n = text => String(text).replace('{n}', catalogue.length);
  const projects = () => window.NIANSIA_PROJECTS[locale];
  const $ = selector => root.querySelector(selector);
  const motion = () => !paused && !reduced.matches;
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
    const vt = document.startViewTransition(change);
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach(p => p?.catch(() => {}));
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
    if (button) { button.innerHTML = icon(['dark','retro'].includes(theme) ? 'sun' : 'moon'); button.setAttribute('aria-pressed', String(['dark','retro'].includes(theme))); }
    root.querySelectorAll('[data-theme-pick]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.themePick === theme)));
  }
  function toggleTheme(origin) { setTheme(['dark','retro'].includes(theme) ? 'sakura' : 'dark', origin); }
  function applyMotion() {
    document.documentElement.dataset.motion = motion() ? 'on' : 'off';
    const button = $('[data-action="motion"]');
    if (button) { button.innerHTML = icon(motion() ? 'pause' : 'play'); button.setAttribute('aria-pressed', String(!motion())); }
    emit('motion', {on: motion()});
  }
  function setMotion(on) { paused = !on; store.set('motion', paused ? 'off' : 'on'); applyMotion(); }
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
    const swatches = themes.map(name => `<button type="button" class="style-option" data-theme-pick="${name}" aria-pressed="${name===theme}"><span class="swatch swatch-${name}" aria-hidden="true"><i></i><i></i><i></i></span>${c.themeNames[name]}</button>`).join('');
    root.innerHTML = `<div class="desktop">
      <header class="desktop-bar"><a class="brand" href="${langBase()}" data-view="home" translate="no">${icon('terminal')}<strong>niansia<span>.terminal</span></strong><i class="brand-caret" aria-hidden="true"></i></a><span class="desktop-motto">${c.desktop}</span>
        <div class="desktop-controls"><div class="language-switch" role="group" aria-label="${c.language}"><span class="lang-pill" aria-hidden="true"></span>${[['en','EN'],['zh-TW','繁'],['zh-CN','简']].map(([key,label])=>`<button type="button" data-lang="${key}" aria-pressed="${key===locale}" translate="no">${label}</button>`).join('')}</div><span class="control-divider"></span>
          <div class="style-menu"><button class="icon-button" data-action="styles" title="${c.style}" aria-label="${c.style}" aria-expanded="false" aria-controls="style-popover">${icon('palette')}</button><div class="style-popover" id="style-popover" role="group" aria-label="${c.style}" hidden><p>${c.style}</p>${swatches}<button type="button" class="style-option fest-toggle" data-fest-skin aria-pressed="false" hidden></button></div></div>
          <button class="icon-button" data-action="theme" title="${c.theme}" aria-label="${c.theme}"></button><button class="icon-button" data-action="motion" title="${c.motion}" aria-label="${c.motion}"></button></div>
      </header>
      <section class="terminal-window" aria-label="Niansia terminal">
        <div class="window-bar"><div class="fest-garland" aria-hidden="true"></div><div class="window-dots"><button type="button" data-action="win-close" aria-label="close"></button><button type="button" data-action="win-min" aria-label="${c.winMin}"></button><button type="button" data-action="win-max" aria-label="${c.winMax}"></button></div><span class="window-title" translate="no">niansia@home <span class="muted">: ~</span></span><span class="window-note"><span class="window-clock" translate="no"></span>${icon('terminal')} portfolio / v.03</span></div>
        <div class="window-body">
        <div class="workspace">
          <div class="explorer"><div class="explorer-heading">${c.files}<span>~/</span></div><nav aria-label="${c.files}"><span class="nav-indicator" aria-hidden="true"></span>${paths.map((path,i)=>`<button class="file-item" data-view="${path}" data-nav-index="${i}" aria-label="${c.nav[i]} (${files[i]})"><span class="file-symbol">${icon(['terminal','file','folder','research','mail','heart','help'][i])}</span><span><b translate="no">${files[i]}</b><small>${c.nav[i]}</small></span>${i===2?`<em>${String(projects().length).padStart(2,'0')}</em>`:''}</button>`).join('')}</nav><div class="explorer-bottom"><span class="branch-mark" aria-hidden="true">⑂</span><span translate="no">main</span><a href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">GitHub ${icon('link')}</a></div></div>
          <div class="terminal-main"><div class="fest-watermark" aria-hidden="true"></div><div class="pane-bar"><span class="pane-path" translate="no"></span><span class="pane-shortcut"><kbd>Esc</kbd> ${c.back}</span></div><div class="terminal-output" id="terminal-content" tabindex="-1"></div></div>
        </div>
        <div class="command-area"><div class="command-message" role="status" aria-live="polite">${c.ready}</div><form class="command-form"><label for="terminal-command" class="prompt" translate="no"><span class="session-user">${esc(username)}</span><span>@home</span><b>:~$</b><span class="sr-only">${c.command}</span></label><input id="terminal-command" data-command-input maxlength="500" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="${c.placeholder}" aria-label="${c.command}"><button type="submit" aria-label="${c.run}">${icon('arrow')}<span>${c.run}</span></button></form></div>
        <footer class="terminal-status"><span class="status-keys"><kbd>↑</kbd><kbd>↓</kbd> ${c.selected} <kbd>Enter</kbd> ${c.open} <kbd>Esc</kbd> ${c.back}</span><button class="status-yuki" data-action="chat" data-yuki-status>${icon('paw')}<span>yuki</span></button><button data-view="help" aria-label="${c.nav[paths.indexOf('help')]}">${icon('help')}<span>${c.nav[paths.indexOf('help')]}</span></button><span class="status-signature" translate="no">made with curiosity <span>✦</span></span></footer>
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
  function commandTitle(command) {
    return `<form class="output-command inline-command-form"><label for="screen-command" aria-hidden="true">❯</label><input id="screen-command" data-command-input maxlength="500" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="${t().inlineCommand}" aria-describedby="screen-command-hint" placeholder="${esc(command)} · ${t().typeHere}"><button type="submit" aria-label="${t().run}"><kbd>Enter</kbd><span>↵</span></button></form><div id="screen-command-hint" class="command-hint">${t().historyHint}</div><section class="command-results" aria-label="${t().output}" hidden></section>`;
  }
  function commandCatalogue() {
    return `<p class="comment-line">${n(t().commandHelp)}</p><div class="command-catalogue">${catalogue.map(c=>`<button data-command-fill="${esc(c.example)}"><code>${esc(c.usage)}</code><span>${esc(c.description[locale])}</span></button>`).join('')}</div>`;
  }
  function button(path,label,primary=false) { return `<button class="action-button ${primary?'primary':''}" data-view="${path}"><span>${label}</span>${icon('arrow')}</button>`; }
  function homeScreen(c) {
    const latest = projects()[0];
    const boot = booted || !motion() ? 'boot-lines' : 'boot-lines is-booting';
    booted = true;
    const name = c.name.replace('Niansia', '<span class="name-glow" translate="no">Niansia</span>');
    const quick = ['projects','theme sakura','neofetch','trick','trail paws','help'];
    return `${commandTitle('./start.sh')}${festivalBanner(c)}<div class="${boot}"><span><b>✓</b> profile loaded</span><span><b>✓</b> ${projects().length} projects mounted</span><span><b>✓</b> yuki.exe is awake</span><span><b>✓</b> brain.nn ready</span></div>
      <div class="welcome-copy"><p class="hello-world" translate="no">${c.welcome}<i class="text-cursor" aria-hidden="true"></i></p><h1>${name}</h1><p class="welcome-tagline">${c.tagline}</p><p>${c.intro}</p></div>
      <div class="profile-facts"><span>${c.role}</span><span>${c.leave}</span></div>
      <div class="output-actions">${button('projects',c.start,true)}${button('about',c.more)}</div>
      <div class="home-cards">
        <button class="home-card latest-card" data-project="${latest.id}"><span class="card-label">${c.latestCard} <span>↗</span></span><img src="/assets/work/taiwan-exam-social-preview.png" alt="" loading="lazy" width="1280" height="640"><strong translate="no">${latest.name} <span class="file-extension">.skill</span></strong><span class="card-copy">${c.newest}</span></button>
        <div class="home-card ask-card"><span class="card-label">${icon('chat')} ${c.askTitle}</span><p>${c.askIntro}</p><div class="ask-chips">${c.askChips.map(q=>`<button data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div></div>
      </div>
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
  function paintFestivalChrome(fest) {
    const F = window.NIANSIA_FESTIVAL, garland = $('.fest-garland'), mark = $('.fest-watermark'), toggle = $('[data-fest-skin]');
    const skin = fest && store.get('fest-skin', 'on') !== 'off';
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
    const skin = fest && store.get('fest-skin', 'on') !== 'off';
    document.documentElement.dataset.festival = fest ? fest.primary.id : '';
    document.documentElement.dataset.fskin = skin ? fest.primary.id : '';
    const tone = skin && getComputedStyle(document.documentElement).getPropertyValue('--desk').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tone || themeColors[theme]);
    paintFestivalChrome(fest);
    let sky = document.querySelector('.fest-sky');
    if (fest && !sky) { sky = document.createElement('div'); sky.className = 'fest-sky'; sky.setAttribute('aria-hidden', 'true'); document.body.prepend(sky); }
    if (sky) sky.dataset.fest = fest ? fest.primary.id : '';
    fx()?.ambient(fest ? fest.festivals.map(f => f.particle) : []);
  }
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
  function screen(animate=true) {
    const c=t(), items=projects(), item=items.find(p=>p.id===projectId);
    let html='';
    $('.pane-path').textContent=`~/ ${view === 'home'?'start.sh':view === 'projects'?'projects/'+(item ? item.id : ''):files[paths.indexOf(view)]}`;
    document.title = `${item?.name || c.nav[paths.indexOf(view)]} | Niansia terminal`;
    if (view==='home') html=homeScreen(c);
    if (view==='about') html=`${commandTitle('cat about.md')}<h1>${c.aboutTitle}</h1><div class="reading"><p>${c.bio}</p><p>${c.bio2}</p><p>${c.bio3}</p><h2>${c.education}</h2><ul class="education-list"><li><span class="edu-dot" aria-hidden="true"></span>${c.undergrad}</li><li><span class="edu-dot is-now" aria-hidden="true"></span>${c.graduate}<small>${c.leave}</small></li></ul><div class="interest-tags">${c.interests.split(' / ').map(tag=>`<span>${tag}</span>`).join('')}</div></div>${button('research',c.nav[3],true)}`;
    if (view==='research') html=`${commandTitle('cat research.md')}<h1>${c.researchTitle}</h1><p class="screen-intro">${c.researchIntro}</p><div class="research-entry"><span>01</span><div><h2>${c.researchA}</h2><p>${c.researchABody}</p><small>security / robustness / evaluation</small></div></div><div class="research-entry"><span>02</span><div><h2>${c.researchB}</h2><p>${c.researchBBody}</p><small>vision / reasoning / grounding</small></div></div><p class="comment-line">${c.researchNote}</p>`;
    if (view==='contact') html=`${commandTitle('cat contact.txt')}<h1>${c.contactTitle}</h1><div class="reading"><p>${c.contactBody}</p><div class="contact-address"><span translate="no">email:</span><a href="mailto:niansia930202@gmail.com" translate="no">niansia930202@gmail.com</a></div><div class="output-actions"><a class="action-button primary" href="mailto:niansia930202@gmail.com">${icon('mail')}<span>${c.send}</span></a><button class="action-button" data-action="copy">${icon('copy')}<span>${c.copy}</span></button></div><a class="github-link" href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">github.com/niansia ${icon('link')}</a></div>`;
    if (view==='hobbies') html=hobbiesScreen();
    if (view==='help') html=`${commandTitle('help')}<h1>${c.guideTitle}</h1><p>${c.guideIntro}</p><dl class="keyboard-guide">${c.keys.map(([key,description])=>`<div><dt><kbd>${key}</kbd></dt><dd>${description}</dd></div>`).join('')}</dl><h2>${c.commands}</h2>${commandCatalogue()}<p class="comment-line">${c.simulation}</p>`;
    if (view==='projects' && !item) html=`${commandTitle('ls ./projects/')}<div class="directory-heading"><h1>${c.all}</h1><span>${String(items.length).padStart(2,'0')} ${c.directory}</span></div><p class="screen-intro">${c.projectIntro}</p><div class="project-directory" aria-label="${c.all}">${items.map((p,i)=>`<button class="project-row ${i===selectedProject?'is-selected':''}" data-project="${p.id}" data-project-index="${i}" style="--i:${i}"><span class="row-index">${String(i+1).padStart(2,'0')}</span><span class="project-row-title"><strong translate="no">${p.name}</strong><small>${p.category}</small></span><span class="project-status">${p.status}</span><span class="row-arrow">↗</span></button>`).join('')}</div>`;
    if (view==='projects' && item) html=`${commandTitle('cat projects/'+esc(item.id)+'/README.md')}<button class="back-link" data-view="projects">← ${c.all}</button><div class="project-detail"><p class="detail-meta">${esc(item.category)}<span>${esc(item.status)}</span></p><h1 translate="no">${esc(item.name)}</h1><p class="project-description">${esc(item.description)}</p>${item.id==='taiwan-exam'?'<img class="project-art" src="/assets/work/taiwan-exam-social-preview.png" width="1280" height="640" alt="Taiwan Exam" loading="lazy">':''}<h2>${c.evidence}</h2><p>${esc(item.evidence)}</p><div class="output-actions"><a class="action-button primary" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><span>${c.source}</span>${icon('link')}</a><a class="action-button" href="${esc(item.reference)}" target="_blank" rel="noopener noreferrer"><span>${esc(item.referenceLabel)}</span>${icon('link')}</a><button class="action-button" data-ask="${esc(item.name)}">${icon('chat')}<span>${c.askTitle}</span></button></div><div class="project-pagination"><button data-project-step="-1">← ${c.prev}</button><span>${items.indexOf(item)+1} / ${items.length}</span><button data-project-step="1">${c.next} →</button></div></div>`;
    const output=$('.terminal-output'); output.innerHTML=html; output.scrollTop=0; renderJournal();
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
    view=next;projectId=id;selectedNav=paths.indexOf(view);
    if (id) selectedProject=Math.max(0,projects().findIndex(p=>p.id===id));
    history.pushState(null,'',`${langBase()}#${view}${id?'/'+encodeURIComponent(id):''}`);
    screen(!options.keyboard); message(t().ready);
    emit('navigate', {view, id, quiet: !!options.quiet});
    if (options.keyboard) $('.terminal-output').focus({preventScroll:true});
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
    message(`${t().nav[selectedNav]} · Enter ${t().open}`);
  }
  function moveSelection(key) {
    const inDirectory=view==='projects'&&!projectId;
    const count=inDirectory?projects().length:paths.length;
    let index=inDirectory?selectedProject:selectedNav;
    index=key==='Home'?0:key==='End'?count-1:(index+(key==='ArrowUp'?-1:1)+count)%count;
    if(inDirectory){selectedProject=index;root.querySelectorAll('[data-project-index]').forEach((el,i)=>el.classList.toggle('is-selected',i===index));const el=$(`[data-project-index="${index}"]`);el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'});}
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
    const values={festival:['list','auto','off',...(window.NIANSIA_FESTIVAL?.list||[]).map(f=>f.id)],accessory:['list','auto','none',...Object.keys(window.YukiWardrobe?.accessories||{})],outfit:['list','auto',...(window.YukiWardrobe?.outfits()||[]).map(o=>o.id)],theme:themes,style:themes,lang:['en','zh-tw','zh-cn'],motion:['on','off'],follow:['on','off'],trail:['hearts','paws','stars','petals','off'],cursor:['s','m','l'],help:catalogue.map(c=>c.name)};
    const destinations=['home','about.md','research.md','contact.txt','hobbies.md','projects/',...projects().map(p=>p.id),...projects().map(p=>'projects/'+p.id+'/README.md')];
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
    const aliases={'':'home','~':'home','start.sh':'home','about.md':'about','profile':'about','research.md':'research','contact.txt':'contact','hobbies.md':'hobbies','hobby':'hobbies','cosplay':'hobbies','work':'projects','portfolio':'projects'};
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
    const aliases={'?':'help',work:'projects',portfolio:'projects',profile:'about','./start.sh':'home','start.sh':'home',meow:'pet',search:'find','作品':'projects','研究':'research','聯絡':'contact','联系':'contact',hobby:'hobbies',cosplay:'hobbies',cos:'hobbies',fun:'hobbies','興趣':'hobbies','兴趣':'hobbies','日常':'hobbies','關於':'about','关于':'about'};
    const name=aliases[parsed.name]||parsed.name,args=parsed.args,arg=args.join(' '),lower=arg.toLowerCase();
    const definition=catalogue.find(c=>c.name===name);
    const usage=()=>record(value,`${t().usage}: ${definition?.usage||'help'}\n${definition?.description[locale]||t().unknown}`);
    const finish=(text,links)=>record(value,text,links);
    const projectLinks=items=>items.map(p=>({id:p.id,label:p.name}));
    const showTarget=target=>{navigate(target.view,target.id||'',{keyboard:true});finish(t().routeReplies[target.view]);};
    if(paths.includes(name)&&name!=='help'){
      if(args.length){usage();return;}showTarget({view:name});return;
    }
    switch(name){
      case 'help': {
        if(!arg){navigate('help','',{keyboard:true});finish(n(t().commandHelp));}
        else {const command=catalogue.find(c=>c.name===lower);if(command)finish(`${command.usage}\n${command.description[locale]}\n> ${command.example}`);else finish(t().unknown);}
        break;
      }
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
      case 'tree':finish('~/\n├── start.sh\n├── about.md\n├── research.md\n├── contact.txt\n├── hobbies.md\n└── projects/\n'+projects().map((p,i)=>`    ${i===projects().length-1?'└':'├'}── ${p.id}/`).join('\n'));break;
      case 'find':case 'skills': {
        if(name==='find'&&!arg){usage();break;}
        const matches=projects().filter(p=>name==='skills'?/skill/i.test(p.description):`${p.name} ${p.id} ${p.description} ${p.category}`.toLowerCase().includes(lower));
        finish(matches.length?matches.map(p=>`${p.name} · ${p.category}`).join('\n'):t().noMatches,projectLinks(matches));break;
      }
      case 'status':finish(`theme: ${theme}\nlanguage: ${locale}\nanimation: ${motion()?'on':'off'}\nfollow: ${fx()?.state().follow?'on':'off'}\ntrail: ${fx()?.state().trail||'off'}\ncursor: ${fx()?.state().size||'m'}\nprojects: ${projects().length}\nyuki: ${yuki()?.summary()||'-'}`);break;
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
      case 'pet':case 'feed':case 'play':case 'sleep':case 'wake':case 'lie':case 'trick':case 'hide':petCommand(name,value);break;
      case 'yuki':finish(yuki()?.report()||'-');break;
      case 'chat':yuki()?.openChat(arg);finish(t().chatTitle);break;
      case 'ask':if(!arg)usage();else askYuki(arg,value);break;
      case 'brain':finish(yuki()?.brainReport()||t().brainOff);break;
      case 'follow':case 'motion':case 'trail':case 'cursor': {
        if(name==='follow'){if(arg&&!['on','off'].includes(lower)){usage();break;}const on=arg?lower==='on':!fx()?.state().follow;fx()?.setFollow(on);finish(on?t().followOn:t().followOff);}
        if(name==='motion'){if(arg&&!['on','off'].includes(lower)){usage();break;}setMotion(arg?lower==='on':paused);finish(motion()?t().motionOn:t().motionOff);}
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
    if(next)pop.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
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
    if(event.target.closest('.window-title')&&$('.terminal-window').classList.contains('is-minimized'))windowAction('win-min');
    if(!target)return;
    if(target.dataset.view){event.preventDefault();navigate(target.dataset.view,'',{keyboard:event.detail===0});}
    if(target.dataset.project){navigate('projects',target.dataset.project,{keyboard:event.detail===0});}
    if(target.dataset.projectStep){const i=projects().findIndex(p=>p.id===projectId),count=projects().length;navigate('projects',projects()[(i+Number(target.dataset.projectStep)+count)%count].id);}
    if(target.dataset.lang&&target.dataset.lang!==locale){changeLanguage(target.dataset.lang,target);}
    if(target.dataset.themePick){setTheme(target.dataset.themePick,target);}
    if(target.hasAttribute('data-fest-skin')){const on=store.get('fest-skin','on')==='off';store.set('fest-skin',on?'on':'off');transition(applyFestival,target);}
    if(target.dataset.command)runCommand(target.dataset.command);
    if(target.hasAttribute('data-fest-celebrate')){const box=target.getBoundingClientRect();for(let i=0;i<3;i++)setTimeout(()=>fx()?.burst(box.left+box.width*(.2+.3*i),box.top+box.height/2,'hearts'),i*140);fx()?.celebrate();yuki()?.act('trick');const l=yuki()?.festivalLine();if(l)yuki()?.say(l);}
    if(target.dataset.ask){yuki()?.openChat(target.dataset.ask);}
    if(target.dataset.commandFill){const input=$('#screen-command');input.value=target.dataset.commandFill;input.focus();input.select();}
    switch(target.dataset.action){
      case 'theme':toggleTheme(target);break;
      case 'styles':toggleStyles();break;
      case 'motion':setMotion(paused);toast(motion()?t().motionOn:t().motionOff);break;
      case 'chat':yuki()?.openChat();break;
      case 'win-close':case 'win-min':case 'win-max':windowAction(target.dataset.action);break;
      case 'copy':try{await navigator.clipboard.writeText('niansia930202@gmail.com');toast(t().copied);}catch{toast(t().copyFail);}break;
    }
  });
  root.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.matches('.command-form,.inline-command-form')){const input=event.target.querySelector('[data-command-input]'),id=input.id,value=input.value;input.value='';historyDraft='';runCommand(value);$('#'+id)?.focus({preventScroll:true});}
  });
  document.addEventListener('keydown',event=>{
    if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey||event.defaultPrevented)return;
    const target=event.target,editable=target.matches('input,textarea,select,[contenteditable="true"]');
    if(!root.contains(target)&&target!==document.body&&target!==document.documentElement)return;
    if(event.key==='Escape'){event.preventDefault();if(!$('.style-popover').hidden){toggleStyles(false);$('[data-action="styles"]').focus();return;}goBack();return;}
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
    if(target.closest('.style-popover')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();const options=[...root.querySelectorAll('.style-option')],i=options.indexOf(target.closest('.style-option'));
      options[(i+(['ArrowUp','ArrowLeft'].includes(event.key)?-1:1)+options.length)%options.length].focus();return;
    }
    if(event.key==='/'){event.preventDefault();$('#screen-command').focus();return;}
    if(event.key==='ArrowLeft'){event.preventDefault();goBack();return;}
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)&&!projectId){event.preventDefault();moveSelection(event.key);return;}
    if(event.key==='ArrowRight'||(event.key==='Enter'&&!target.closest('button,a'))){event.preventDefault();if(view==='projects'&&!projectId)navigate('projects',projects()[selectedProject].id,{keyboard:true});else if(!projectId)navigate(paths[selectedNav],'',{keyboard:true});}
  });
  reduced.addEventListener('change',applyMotion);
  window.addEventListener('resize',moveIndicator);
  window.addEventListener('popstate',()=>{const before=locale;readLocation();if(before!==locale)shell();else screen(false);});
  setInterval(tickClock, 15000);
  window.NIANSIA_APP = {
    locale:()=>locale, t, projects, view:()=>({view,projectId}), store, esc, icon,
    navigate, setTheme, theme:()=>theme, themes, setLanguage:changeLanguage, setMotion, motion, toast, message, record
  };
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
  readLocation();shell();applyFestival();
})();
