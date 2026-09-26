/* Niansia's portfolio shell: no commands leave the browser. */
(() => {
  'use strict';
  const root = document.querySelector('[data-terminal-app]');
  if (!root || !window.NIANSIA_COPY || !window.NIANSIA_PROJECTS) return;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const store = { get(key, fallback) { try { return localStorage.getItem(`niansia-${key}`) ?? fallback; } catch { return fallback; } }, set(key,value) { try { localStorage.setItem(`niansia-${key}`,value); } catch {} } };
  const paths = ['home','about','projects','research','contact','help'];
  const files = ['start.sh','about.md','projects/','research.md','contact.txt','help'];
  const icons = {
    terminal:'m4 5 6 7-6 7m9 0h7', file:'M14 2H6a2 2 0 0 0-2 2v16h16V8zM14 2v6h6M8 13h8M8 17h5',
    folder:'M3 7V4h6l2 3h10v13H3z', research:'M9 3h6m-5 0v7l-5 9q-1 2 2 2h10q3 0 2-2l-5-9V3M8 15h8',
    mail:'M3 5h18v14H3zM3 5l9 8 9-8', help:'M9 8a3 3 0 1 1 5 3l-2 2v1M12 18h.01',
    sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 1.4 1.4m10 10 1.4 1.4M5.6 18.4 1.4-1.4m10-10 1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z', pause:'M8 5v14M16 5v14', play:'m8 4 12 8-12 8z',
    paw:'M8 14q4-5 8 0l2 4q0 4-6 1-6 3-6-1zM5 7v3M10 4v3M15 4v3M20 7v3',
    arrow:'M4 12h15m-6-6 6 6-6 6', close:'m6 6 12 12M6 18 18 6', chat:'M4 4h16v13H9l-5 4z', link:'M8 16 16 8M10 4h10v10M5 9H3v12h12v-2', copy:'M8 8h12v12H8zM4 16H2V2h14v2', heart:'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5z'
  };
  const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.file}"/></svg>`;
  let locale = root.dataset.locale || 'en';
  let view = root.dataset.initial || 'home', projectId = '', selectedNav = 0, selectedProject = 0;
  let theme = store.get('theme','light'), paused = store.get('motion','on') === 'off', follow = store.get('follow','on') !== 'off';
  let mood = 0, sleeping = false, moodTimer, toastTimer, lastFocus, chatMessages = [], commandHistory = [], historyIndex = 0;
  let frame = 0, x = 0, y = 0, targetX = 0, targetY = 0, hasPointer = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), fine = matchMedia('(pointer: fine)');
  const t = () => window.NIANSIA_COPY[locale];
  const projects = () => window.NIANSIA_PROJECTS[locale];
  const $ = selector => root.querySelector(selector);
  const motion = () => !paused && !reduced.matches;
  const langBase = () => locale === 'en' ? '/' : `/${locale.toLowerCase()}/`;
  function setTheme() {
    if (!['light','dark'].includes(theme)) theme = 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme === 'dark' ? '#101117' : '#edf0f7');
    const button = $('[data-action="theme"]');
    if (button) { button.innerHTML = icon(theme === 'light' ? 'moon' : 'sun'); button.setAttribute('aria-pressed',String(theme === 'dark')); }
  }
  function applyMotion() {
    document.documentElement.dataset.motion = motion() ? 'on' : 'off';
    const button = $('[data-action="motion"]');
    if (button) { button.innerHTML = icon(motion() ? 'pause' : 'play'); button.setAttribute('aria-pressed',String(!motion())); }
    const follower = $('.pet-follower');
    if (follower) follower.hidden = !(follow && fine.matches && motion() && hasPointer);
    if (!motion()) { cancelAnimationFrame(frame); frame = 0; }
  }
  function readLocation() {
    const routeLocale = location.pathname.startsWith('/zh-tw') ? 'zh-TW' : location.pathname.startsWith('/zh-cn') ? 'zh-CN' : 'en';
    locale = routeLocale;
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
    root.innerHTML = `<div class="desktop">
      <header class="desktop-bar"><a class="brand" href="${langBase()}" data-view="home" translate="no">${icon('terminal')}<strong>niansia<span>.terminal</span></strong></a><span class="desktop-motto">${c.desktop}</span>
        <div class="desktop-controls"><div class="language-switch" role="group" aria-label="${c.language}">${[['en','EN'],['zh-TW','繁'],['zh-CN','简']].map(([key,label])=>`<button type="button" data-lang="${key}" aria-pressed="${key===locale}" translate="no">${label}</button>`).join('')}</div><span class="control-divider"></span><button class="icon-button" data-action="theme" title="${c.theme}" aria-label="${c.theme}"></button><button class="icon-button" data-action="motion" title="${c.motion}" aria-label="${c.motion}"></button></div>
      </header>
      <section class="terminal-window" aria-label="Niansia terminal">
        <div class="window-bar"><div class="window-dots" aria-hidden="true"><i></i><i></i><i></i></div><span translate="no">niansia@home <span class="muted">: ~</span></span><span class="window-note">${icon('terminal')} portfolio / v.02</span><button class="mobile-companion icon-button" data-action="chat" aria-label="${c.talk}"><span class="mini-avatar" aria-hidden="true"></span></button></div>
        <div class="workspace">
          <div class="explorer"><div class="explorer-heading">${c.files}<span>~/</span></div><nav aria-label="${c.files}">${paths.map((path,i)=>`<button class="file-item" data-view="${path}" data-nav-index="${i}" aria-label="${c.nav[i]} (${files[i]})"><span class="file-symbol">${icon(['terminal','file','folder','research','mail','help'][i])}</span><span><b translate="no">${files[i]}</b><small>${c.nav[i]}</small></span>${i===2?'<em>09</em>':''}</button>`).join('')}</nav><div class="explorer-bottom"><span class="branch-mark" aria-hidden="true">⑂</span><span translate="no">main</span><a href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">GitHub ${icon('link')}</a></div></div>
          <div class="terminal-main"><div class="pane-bar"><span class="pane-path" translate="no"></span><span class="pane-shortcut"><kbd>Esc</kbd> ${c.back}</span></div><div class="terminal-output" id="terminal-content" tabindex="-1"></div></div>
          <div class="companion-pane" role="complementary" aria-label="${c.companion}"><div class="companion-header"><span>${icon('paw')} yuki.exe</span><span class="state-dot" aria-hidden="true"></span></div><div class="companion-stage"><div class="stage-orbit" aria-hidden="true"></div><button class="character-button" data-pet="pat" aria-label="${c.pet}"><span class="character-sprite" data-mood="0" aria-hidden="true"></span></button><span class="pet-state">${c.moods[0]}</span></div><div class="companion-info"><h2 translate="no">Yuki<span> / ゆき</span></h2><p>${c.petSub}</p></div><p class="pet-bubble" aria-live="polite">${c.petHint}</p><div class="pet-actions"><button data-pet="pat">${icon('heart')}${c.pet}</button><button data-pet="feed">${icon('paw')}${c.feed}</button><button data-pet="play">${icon('play')}${c.play}</button><button data-pet="sleep">${icon('moon')}<span class="sleep-label">${c.sleep}</span></button></div><button class="chat-launch" data-action="chat">${icon('chat')}${c.talk}<span>↗</span></button><label class="follow-control"><input type="checkbox" data-follow ${follow?'checked':''}><span>${c.follow}</span></label></div>
        </div>
        <div class="command-area"><div class="command-message" role="status" aria-live="polite">${c.ready}</div><form class="command-form"><label for="terminal-command" class="prompt" translate="no">niansia<span>@home</span><b>:~$</b><span class="sr-only">${c.command}</span></label><input id="terminal-command" autocomplete="off" spellcheck="false" autocapitalize="none" placeholder="${c.placeholder}" aria-label="${c.command}"><button type="submit" aria-label="${c.run}">${icon('arrow')}<span>${c.run}</span></button></form></div>
        <footer class="terminal-status"><span><kbd>↑</kbd><kbd>↓</kbd> ${c.selected} <kbd>Enter</kbd> ${c.open} <kbd>Esc</kbd> ${c.back}</span><button data-view="help" aria-label="${c.nav[5]}">${icon('help')}<span>${c.nav[5]}</span></button><span class="status-signature" translate="no">made with curiosity <span>✦</span></span></footer>
      </section><div class="desktop-footer"><span>© ${new Date().getFullYear()} Niansia</span><span>Quarto + a little cat magic</span></div>
    </div>
    <span class="pet-follower" aria-hidden="true" hidden><span class="character-sprite" data-mood="0"></span></span>
    <div class="toast" role="status" hidden></div>
    <dialog class="chat-dialog" aria-labelledby="chat-title"><header><span>${icon('chat')} <strong id="chat-title">${c.chatTitle}</strong></span><button class="icon-button" data-action="close-chat" aria-label="${c.close}">${icon('close')}</button></header><div class="chat-companion"><button class="chat-character" data-pet="pat" aria-label="${c.pet}"><span class="character-sprite" data-mood="0" aria-hidden="true"></span></button><div><p class="chat-note">${c.chatSubtitle}</p><div class="chat-pet-actions"><button data-pet="pat">${c.pet}</button><button data-pet="feed">${c.feed}</button><button data-pet="play">${c.play}</button><button data-pet="sleep"><span class="sleep-label">${c.sleep}</span></button></div></div></div><div class="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div><div class="chat-chips">${c.chatChips.map(text=>`<button data-chat-chip="${esc(text)}">${text}</button>`).join('')}</div><form class="chat-form"><label class="sr-only" for="chat-input">${c.chatPlaceholder}</label><input id="chat-input" placeholder="${c.chatPlaceholder}" autocomplete="off" maxlength="400"><button type="submit" aria-label="${c.chatSend}">${icon('arrow')}</button></form></dialog>`;
    setTheme(); applyMotion(); setMood(sleeping ? 3 : 0); screen(false);
    $('.chat-dialog').addEventListener('close',()=>lastFocus?.isConnected && lastFocus.focus());
    $('.chat-dialog').addEventListener('cancel',()=>setMood(sleeping?3:0));
  }
  function commandTitle(command) { return `<div class="output-command" translate="no"><span>❯</span> ${command}<i class="text-cursor" aria-hidden="true"></i></div>`; }
  function button(path,label,primary=false) { return `<button class="action-button ${primary?'primary':''}" data-view="${path}">${label}${icon('arrow')}</button>`; }
  function screen(animate=true) {
    const c=t(), items=projects(), item=items.find(p=>p.id===projectId);
    let html='';
    $('.pane-path').textContent=`~/ ${view === 'home'?'start.sh':view === 'projects'?'projects/'+(item ? item.id : ''):files[paths.indexOf(view)]}`;
    document.title = `${item?.name || c.nav[paths.indexOf(view)]} | Niansia terminal`;
    if (view==='home') html=`${commandTitle('./start.sh')}<div class="boot-lines"><span><b>✓</b> profile loaded</span><span><b>✓</b> 9 projects mounted</span><span><b>✓</b> yuki.exe is awake</span></div><div class="welcome-copy"><p class="hello-world" translate="no">${c.welcome}</p><h1>${c.name}</h1><p class="welcome-tagline">${c.tagline}</p><p>${c.intro}</p></div><div class="profile-facts"><span>${c.role}</span><span>${c.leave}</span></div><div class="output-actions">${button('projects',c.start,true)}${button('about',c.more)}</div><button class="latest-project" data-project="taiwan-exam"><span class="latest-label">${c.latest} <span>↗</span></span><strong translate="no">Taiwan Exam <span class="file-extension">.skill</span></strong><span>${c.newest}</span></button>`;
    if (view==='about') html=`${commandTitle('cat about.md')}<h1>${c.aboutTitle}</h1><div class="reading"><p>${c.bio}</p><p>${c.bio2}</p><p>${c.bio3}</p><h2>${c.education}</h2><ul class="education-list"><li>${c.undergrad}</li><li>${c.graduate}<small>${c.leave}</small></li></ul><p class="comment-line">// ${c.interests}</p></div>${button('research',c.nav[3],true)}`;
    if (view==='research') html=`${commandTitle('cat research.md')}<h1>${c.researchTitle}</h1><p class="screen-intro">${c.researchIntro}</p><div class="research-entry"><span>01</span><div><h2>${c.researchA}</h2><p>${c.researchABody}</p><small>security / robustness / evaluation</small></div></div><div class="research-entry"><span>02</span><div><h2>${c.researchB}</h2><p>${c.researchBBody}</p><small>vision / reasoning / grounding</small></div></div><p class="comment-line">${c.researchNote}</p>`;
    if (view==='contact') html=`${commandTitle('cat contact.txt')}<h1>${c.contactTitle}</h1><div class="reading"><p>${c.contactBody}</p><div class="contact-address"><span translate="no">email:</span><a href="mailto:wilbur930202@gmail.com" translate="no">wilbur930202@gmail.com</a></div><div class="output-actions"><a class="action-button primary" href="mailto:wilbur930202@gmail.com">${icon('mail')}${c.send}</a><button class="action-button" data-action="copy">${icon('copy')}${c.copy}</button></div><a class="github-link" href="https://github.com/niansia" target="_blank" rel="noopener noreferrer">github.com/niansia ${icon('link')}</a></div>`;
    if (view==='help') html=`${commandTitle('help')}<h1>${c.guideTitle}</h1><p>${c.guideIntro}</p><dl class="keyboard-guide">${c.keys.map(([key,description])=>`<div><dt><kbd>${key}</kbd></dt><dd>${description}</dd></div>`).join('')}</dl><h2>${c.commands}</h2><div class="command-chips">${['about','research','projects','contact','theme','pet','chat','clear'].map(cmd=>`<button data-command="${cmd}" translate="no">${cmd}</button>`).join('')}</div><p class="comment-line">${c.simulation}</p>`;
    if (view==='projects' && !item) html=`${commandTitle('ls ./projects/')}<div class="directory-heading"><h1>${c.all}</h1><span>09 ${c.directory}</span></div><p class="screen-intro">${c.projectIntro}</p><div class="project-directory" aria-label="${c.all}">${items.map((p,i)=>`<button class="project-row ${i===selectedProject?'is-selected':''}" data-project="${p.id}" data-project-index="${i}"><span class="row-index">${String(i+1).padStart(2,'0')}</span><span class="project-row-title"><strong translate="no">${p.name}</strong><small>${p.category}</small></span><span class="project-status">${p.status}</span><span class="row-arrow">↗</span></button>`).join('')}</div>`;
    if (view==='projects' && item) html=`${commandTitle('cat projects/'+esc(item.id)+'/README.md')}<button class="back-link" data-view="projects">← ${c.all}</button><div class="project-detail"><p class="detail-meta">${esc(item.category)}<span>${esc(item.status)}</span></p><h1 translate="no">${esc(item.name)}</h1><p class="project-description">${esc(item.description)}</p>${item.id==='taiwan-exam'?'<img class="project-art" src="/assets/work/taiwan-exam-social-preview.png" width="1280" height="640" alt="Taiwan Exam" loading="lazy">':''}<h2>${c.evidence}</h2><p>${esc(item.evidence)}</p><div class="output-actions"><a class="action-button primary" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${c.source}${icon('link')}</a><a class="action-button" href="${esc(item.reference)}" target="_blank" rel="noopener noreferrer">${esc(item.referenceLabel)}${icon('link')}</a></div><div class="project-pagination"><button data-project-step="-1">← ${c.prev}</button><span>${items.indexOf(item)+1} / 9</span><button data-project-step="1">${c.next} →</button></div></div>`;
    const output=$('.terminal-output'); output.innerHTML=html; output.scrollTop=0;
    output.classList.toggle('screen-enter',animate && motion());
    root.querySelectorAll('[data-nav-index]').forEach((el,i)=>{el.classList.toggle('is-current',i===paths.indexOf(view));el.classList.toggle('is-selected',i===selectedNav);el.setAttribute('aria-current',i===paths.indexOf(view)?'page':'false');});
  }
  function navigate(next,id='',options={}) {
    if (!paths.includes(next)) return;
    view=next;projectId=id;selectedNav=paths.indexOf(view);
    if (id) selectedProject=Math.max(0,projects().findIndex(p=>p.id===id));
    history.pushState(null,'',`${langBase()}#${view}${id?'/'+encodeURIComponent(id):''}`);
    screen(!options.keyboard); say(t().routeReplies[view]); message(t().ready);
    if (!sleeping && !options.keyboard) {setMood(2);clearTimeout(moodTimer);moodTimer=setTimeout(()=>setMood(0),1800);}
    if (options.keyboard) $('.terminal-output').focus({preventScroll:true});
  }
  function goBack() {
    if ($('.chat-dialog').open) { $('.chat-dialog').close();return; }
    const input=$('#terminal-command');
    if (document.activeElement===input && input.value) {input.value='';message(t().ready);return;}
    if (projectId) {navigate('projects','',{keyboard:true});$(`[data-project-index="${selectedProject}"]`)?.focus({preventScroll:true});}
    else if (view!=='home') navigate('home','',{keyboard:true});
    else {input.blur();selectedNav=0;selectNav();message(t().ready);}
  }
  function message(text) {$('.command-message').textContent=text;}
  function toast(text) {const el=$('.toast');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true;},2800);}
  function say(text) {$('.pet-bubble').textContent=text;}
  function setMood(value) {
    mood=value;root.querySelectorAll('.character-sprite').forEach(el=>el.dataset.mood=String(value));
    const state=$('.pet-state');if(state)state.textContent=t().moods[value];
  }
  function react(kind) {
    clearTimeout(moodTimer);
    if (kind==='sleep') {sleeping=!sleeping;setMood(sleeping?3:2);say(t().petReplies[sleeping?3:4]);}
    else {sleeping=false;setMood(2);say(t().petReplies[{pat:0,feed:1,play:2}[kind] ?? 0]);}
    root.querySelectorAll('.sleep-label').forEach(el=>el.textContent=sleeping?t().wake:t().sleep);
    if ($('.chat-dialog').open) {chatMessages.push({who:'Yuki',text:$('.pet-bubble').textContent});drawChat();}
    const stage=$('.character-button');stage.classList.remove('pet-jump');
    if (motion() && kind!=='sleep') {void stage.offsetWidth;stage.classList.add('pet-jump');}
    if (!sleeping) moodTimer=setTimeout(()=>setMood(0),3200);
  }
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
  function runCommand(raw) {
    const value=raw.trim();
    if (!value) {if(view==='projects'&&!projectId)navigate('projects',projects()[selectedProject].id,{keyboard:true});else navigate(paths[selectedNav],'',{keyboard:true});return;}
    commandHistory.push(value);if(commandHistory.length>50)commandHistory.shift();historyIndex=commandHistory.length;
    const command=value.toLowerCase().replace(/^(cat|cd|open)\s+/,'').replace(/\.(md|txt)$/,'').replace(/\/$/,'');
    const aliases={ls:'projects',work:'projects',portfolio:'projects',profile:'about','start.sh':'home','./start.sh':'home','~':'home',email:'contact','?':'help','作品':'projects','研究':'research','聯絡':'contact','联系':'contact','關於':'about','关于':'about'};
    const next=aliases[command]||command;
    if(paths.includes(next))navigate(next,'',{keyboard:true});
    else if(command.startsWith('projects/')){const id=command.slice(9);if(projects().some(p=>p.id===id))navigate('projects',id,{keyboard:true});else message(t().noProject);}
    else if(command==='theme'){toggleTheme();}
    else if(command==='pet'||command==='meow'){react('pat');}
    else if(command==='chat'){openChat();}
    else if(command==='clear'){message(t().ready);}
    else if(command==='pwd'){message('~/'+(view==='projects'?'projects/'+projectId:view));}
    else {const item=projects().find(p=>p.id===command||p.name.toLowerCase()===command);if(item)navigate('projects',item.id,{keyboard:true});else message(t().unknown);}
  }
  function toggleTheme() {theme=theme==='light'?'dark':'light';store.set('theme',theme);setTheme();setMood(sleeping?3:2);clearTimeout(moodTimer);if(!sleeping)moodTimer=setTimeout(()=>setMood(0),1500);}
  function openChat() {
    const dialog=$('.chat-dialog'); if(dialog.open)return;
    lastFocus=document.activeElement;
    if(!chatMessages.length)chatMessages.push({who:'Yuki',text:t().hello});
    drawChat();dialog.showModal();setMood(sleeping?3:2);$('#chat-input').focus();
  }
  function drawChat() {const log=$('.chat-log');log.innerHTML=chatMessages.map(m=>`<div class="chat-message ${m.who==='Yuki'?'from-yuki':'from-you'}"><strong>${esc(m.who)}</strong><p>${esc(m.text)}</p></div>`).join('');log.scrollTop=log.scrollHeight;}
  function chat(text) {
    if(!text.trim())return;
    const c=t(),lower=text.toLowerCase();let reply=c.fallback;
    sleeping=false;root.querySelectorAll('.sleep-label').forEach(el=>el.textContent=c.sleep);
    const item=projects().find(p=>lower.includes(p.id)||lower.includes(p.name.toLowerCase()) || (p.id==='taiwan-exam'&&/學測|学测|考試|考试/.test(text)));
    if(item){reply=`${item.name}: ${item.description}`;navigate('projects',item.id);}
    else if(/作品|项目|項目|projects|portfolio/.test(lower)){reply=c.routeReplies.projects;navigate('projects');}
    else if(/研究|research/.test(lower)){reply=c.routeReplies.research;navigate('research');}
    else if(/聯絡|联系|email|contact/.test(lower)){reply=c.routeReplies.contact;navigate('contact');}
    else if(/累|難過|难过|不開心|不开心|sad|tired|stress|孤單|孤单/.test(lower))reply=c.tired;
    else if(/你自己|你是|yourself|who are|名字|name/.test(lower))reply=c.self;
    else if(/謝|谢|thank/.test(lower))reply=c.thanks;
    else if(/開心|开心|happy|good news/.test(lower))reply=c.happy;
    else if(/你好|哈囉|嗨|hello|\bhi\b|早安|晚安/.test(lower))reply=c.greet;
    else if(/摸|pat|抱|hug/.test(lower)){react('pat');reply=c.petReplies[0];}
    else if(/餵|喂|吃|feed|snack/.test(lower)){react('feed');reply=c.petReplies[1];}
    chatMessages.push({who:c.you,text:text.slice(0,400)},{who:'Yuki',text:reply});if(chatMessages.length>40)chatMessages.splice(0,2);
    drawChat();setMood(2);clearTimeout(moodTimer);moodTimer=setTimeout(()=>setMood(sleeping?3:0),3500);
  }
  root.addEventListener('click',async event=>{
    const target=event.target.closest('button,a');if(!target)return;
    if(target.dataset.view){event.preventDefault();navigate(target.dataset.view,'',{keyboard:event.detail===0});}
    if(target.dataset.project){navigate('projects',target.dataset.project,{keyboard:event.detail===0});}
    if(target.dataset.projectStep){const i=projects().findIndex(p=>p.id===projectId);navigate('projects',projects()[(i+Number(target.dataset.projectStep)+9)%9].id);}
    if(target.dataset.lang){locale=target.dataset.lang;store.set('language',locale);history.pushState(null,'',`${langBase()}#${view}${projectId?'/'+projectId:''}`);chatMessages=[];shell();}
    if(target.dataset.pet)react(target.dataset.pet);
    if(target.dataset.command)runCommand(target.dataset.command);
    if(target.dataset.chatChip)chat(target.dataset.chatChip);
    switch(target.dataset.action){
      case 'theme':toggleTheme();break;
      case 'motion':paused=!paused;store.set('motion',paused?'off':'on');applyMotion();toast(motion()?t().motionOn:t().motionOff);break;
      case 'chat':openChat();break;
      case 'close-chat':$('.chat-dialog').close();break;
      case 'copy':try{await navigator.clipboard.writeText('wilbur930202@gmail.com');toast(t().copied);}catch{toast(t().copyFail);}break;
    }
  });
  root.addEventListener('change',event=>{if(event.target.matches('[data-follow]')){follow=event.target.checked;store.set('follow',follow?'on':'off');applyMotion();say(follow?t().followOn:t().followOff);}});
  root.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.matches('.command-form')){const input=$('#terminal-command');const value=input.value;input.value='';runCommand(value);}
    if(event.target.matches('.chat-form')){const input=$('#chat-input');const value=input.value;input.value='';chat(value);}
  });
  document.addEventListener('keydown',event=>{
    if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
    if($('.chat-dialog').open)return; // Native dialog owns Tab and Escape.
    const target=event.target,editable=target.matches('input,textarea,select,[contenteditable="true"]');
    if(event.key==='Escape'){event.preventDefault();goBack();return;}
    if(editable){
      if(target.id==='terminal-command'&&['ArrowUp','ArrowDown'].includes(event.key)){
        if(target.value||commandHistory.length){event.preventDefault();historyIndex=Math.max(0,Math.min(commandHistory.length,historyIndex+(event.key==='ArrowUp'?-1:1)));target.value=commandHistory[historyIndex]||'';}
        else {event.preventDefault();moveSelection(event.key);}
      }
      return;
    }
    if(event.key==='/'){event.preventDefault();$('#terminal-command').focus();return;}
    if(event.key==='ArrowLeft'){event.preventDefault();goBack();return;}
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)&&!projectId){event.preventDefault();moveSelection(event.key);return;}
    if(event.key==='ArrowRight'||(event.key==='Enter'&&!target.closest('button,a'))){event.preventDefault();if(view==='projects'&&!projectId)navigate('projects',projects()[selectedProject].id,{keyboard:true});else if(!projectId)navigate(paths[selectedNav],'',{keyboard:true});}
  });
  document.addEventListener('pointerdown',event=>{
    if(!motion()||event.button!==0)return;
    const el=document.createElement('span');el.className='click-spark';el.textContent='✧';el.style.left=`${event.clientX}px`;el.style.top=`${event.clientY}px`;el.setAttribute('aria-hidden','true');document.body.append(el);
    const animation=el.animate([{opacity:.95,transform:'translate(-50%,-50%) scale(.7) rotate(0)'},{opacity:0,transform:'translate(-50%,-95%) scale(1.6) rotate(65deg)'}],{duration:500,easing:'ease-out'});animation.onfinish=()=>el.remove();
  });
  function tick() {
    const dx=targetX-x,dy=targetY-y;x+=dx*.105;y+=dy*.105;
    const follower=$('.pet-follower');if(!follower){frame=0;return;}
    follower.style.transform=`translate3d(${x}px,${y}px,0)`;
    follower.querySelector('.character-sprite').dataset.mood=String(sleeping?3:Math.abs(dx)+Math.abs(dy)>6?Math.floor(performance.now()/230)%2:mood===2?2:0);
    if(Math.abs(dx)+Math.abs(dy)>.8&&follow&&motion())frame=requestAnimationFrame(tick);else frame=0;
  }
  document.addEventListener('pointermove',event=>{
    if(!fine.matches||!follow||!motion()||event.target.closest('.pet-follower')||$('.chat-dialog').open)return;
    const follower=$('.pet-follower');
    follower.hidden=false;
    targetX=Math.max(0,Math.min(innerWidth-follower.offsetWidth-4,event.clientX+12));targetY=Math.max(0,Math.min(innerHeight-follower.offsetHeight-4,event.clientY+10));
    if(!hasPointer){x=targetX;y=targetY;hasPointer=true;}
    if(!frame)frame=requestAnimationFrame(tick);
  });
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget){$('.pet-follower').hidden=true;hasPointer=false;cancelAnimationFrame(frame);frame=0;}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;$('.pet-follower').hidden=true;hasPointer=false;}});
  reduced.addEventListener('change',applyMotion);fine.addEventListener('change',applyMotion);
  window.addEventListener('popstate',()=>{const before=locale;readLocation();if(before!==locale)shell();else screen(false);});
  readLocation();shell();
})();
