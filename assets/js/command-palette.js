/* Command palette (Ctrl+K / ⌘K): one search box for every page, project, paper, note, style and command.
   Arrow keys move, Enter opens, Esc closes. Arrowing onto a style previews it; Enter keeps it.
   Prefix ">" lists terminal commands only, "?" hands the question to Yuki. Nothing leaves the browser. */
(() => {
  'use strict';
  const app = window.NIANSIA_APP;
  if (!app) return;
  const esc = app.esc, icon = app.icon;
  const L = () => app.locale();
  const COPY = {
    en: {label: 'Command palette', placeholder: 'Search pages, projects, papers, styles…', empty: 'Nothing matches. Press Enter to ask Yuki instead.',
      groups: {recent: 'Recent', suggested: 'Suggested', pages: 'Pages', projects: 'Projects', papers: 'Papers', writing: 'Writing', actions: 'Actions', styles: 'Styles', commands: 'Commands', fallback: 'Or'},
      move: 'move', open: 'open', close: 'close', cmds: 'commands', ask: 'ask Yuki', results: n => `${n} result${n === 1 ? '' : 's'}`,
      askYuki: q => `Ask Yuki: “${q}”`, run: q => `Run in the terminal: ${q}`, modeCmd: 'commands', modeAsk: 'ask Yuki',
      brief: 'One-page brief', briefSub: 'For professors and interviewers · printable', tour: 'Guided tour with Yuki', tours: {research: 'Research track · for professors', builder: 'Builder track · for engineers', fun: 'Just for fun · the playful bits'},
      chat: 'Chat with Yuki', copyEmail: 'Copy email address', copied: 'Email address copied.', toggleDark: 'Toggle light / dark', motionOff: 'Pause all animation', motionOn: 'Resume all animation', motionMenu: 'Animation settings…',
      adv: 'Adversarial Lab: fool a neural network', advSub: 'FGSM / PGD attacks and a robust model, on your CPU',
      demo: 'Try LumiGrid in your browser', demoSub: 'Low-light enhancement on your own photo, on-device',
      chroma: 'Try ChromaRecover in your browser', chromaSub: 'Find a number hidden only by colour, on-device', github: 'GitHub profile', bib: 'Download papers as .bib', styleMenu: 'Open the style picker',
      lang: {en: 'Switch to English', 'zh-TW': '切換成繁體中文', 'zh-CN': '切换成简体中文'}, light: 'light', dark: 'dark', current: 'current', page: 'page', note: 'note', log: 'log',
      statement: 'Research statement', notes: 'Research notes', logAll: 'Research log', deadline: 'in preparation'},
    'zh-TW': {label: '指令面板', placeholder: '搜尋頁面、作品、論文、風格…', empty: '找不到符合的項目。按 Enter 改問 Yuki。',
      groups: {recent: '最近使用', suggested: '推薦', pages: '頁面', projects: '作品', papers: '論文', writing: '文章', actions: '動作', styles: '網頁風格', commands: '指令', fallback: '或者'},
      move: '移動', open: '開啟', close: '關閉', cmds: '指令', ask: '問 Yuki', results: n => `${n} 個結果`,
      askYuki: q => `問 Yuki：「${q}」`, run: q => `在終端執行：${q}`, modeCmd: '指令', modeAsk: '問 Yuki',
      brief: '一頁式簡介', briefSub: '給教授與面試官 · 可列印', tour: '讓 Yuki 帶你導覽', tours: {research: '研究路線 · 給教授', builder: '實作路線 · 給工程師', fun: '輕鬆逛逛 · 好玩的地方'},
      chat: '和 Yuki 聊天', copyEmail: '複製電子郵件', copied: '已複製電子郵件。', toggleDark: '切換淺色／深色', motionOff: '暫停全部動畫', motionOn: '恢復全部動畫', motionMenu: '動畫效果設定…',
      adv: '對抗樣本實驗室：騙過神經網路', advSub: 'FGSM／PGD 攻擊與穩健模型，在你的 CPU 上執行',
      demo: '在瀏覽器試玩 LumiGrid', demoSub: '用自己的照片做低光增強，在裝置上執行',
      chroma: '在瀏覽器試玩 ChromaRecover', chromaSub: '找出只靠顏色藏起來的數字，在裝置上執行', github: 'GitHub 個人頁', bib: '下載論文 .bib', styleMenu: '打開網頁風格選單',
      lang: {en: 'Switch to English', 'zh-TW': '切換成繁體中文', 'zh-CN': '切换成简体中文'}, light: '淺色', dark: '深色', current: '使用中', page: '頁面', note: '筆記', log: '日誌',
      statement: '研究方向說明', notes: '研究筆記', logAll: '研究日誌', deadline: '準備中'},
    'zh-CN': {label: '命令面板', placeholder: '搜索页面、作品、论文、风格…', empty: '找不到符合的项目。按 Enter 改问 Yuki。',
      groups: {recent: '最近使用', suggested: '推荐', pages: '页面', projects: '作品', papers: '论文', writing: '文章', actions: '动作', styles: '网页风格', commands: '命令', fallback: '或者'},
      move: '移动', open: '打开', close: '关闭', cmds: '命令', ask: '问 Yuki', results: n => `${n} 个结果`,
      askYuki: q => `问 Yuki：「${q}」`, run: q => `在终端执行：${q}`, modeCmd: '命令', modeAsk: '问 Yuki',
      brief: '一页式简介', briefSub: '给教授与面试官 · 可打印', tour: '让 Yuki 带你导览', tours: {research: '研究路线 · 给教授', builder: '实作路线 · 给工程师', fun: '轻松逛逛 · 好玩的地方'},
      chat: '和 Yuki 聊天', copyEmail: '复制电子邮件', copied: '已复制电子邮件。', toggleDark: '切换浅色／深色', motionOff: '暂停全部动画', motionOn: '恢复全部动画', motionMenu: '动画效果设置…',
      adv: '对抗样本实验室：骗过神经网络', advSub: 'FGSM／PGD 攻击与稳健模型，在你的 CPU 上运行',
      demo: '在浏览器试玩 LumiGrid', demoSub: '用自己的照片做低光增强，在设备上运行',
      chroma: '在浏览器试玩 ChromaRecover', chromaSub: '找出只靠颜色藏起来的数字，在设备上运行', github: 'GitHub 个人页', bib: '下载论文 .bib', styleMenu: '打开网页风格菜单',
      lang: {en: 'Switch to English', 'zh-TW': '切換成繁體中文', 'zh-CN': '切换成简体中文'}, light: '浅色', dark: '深色', current: '使用中', page: '页面', note: '笔记', log: '日志',
      statement: '研究方向说明', notes: '研究笔记', logAll: '研究日志', deadline: '准备中'}
  };
  const C = () => COPY[L()] || COPY.en;
  const seg = () => (L() === 'en' ? 'en' : L().toLowerCase());
  const EMAIL = 'niansia930202@gmail.com';

  /* ---------- items ---------- */
  const allNav = p => ['en', 'zh-TW', 'zh-CN'].map(l => window.NIANSIA_COPY[l]?.nav[['home', 'about', 'projects', 'research', 'papers', 'blog', 'contact', 'hobbies', 'guestbook', 'cv', 'help'].indexOf(p)] || '').join(' ');
  const go = url => { location.href = url; };
  function items() {
    const c = C(), out = [], add = (group, it) => out.push({group, ...it, key: `${group}:${it.id}`});
    const paths = app.paths(), files = app.files(), NAV = {home: 'terminal', about: 'file', projects: 'folder', research: 'research', papers: 'paper', blog: 'pen', contact: 'mail', hobbies: 'heart', guestbook: 'chat', cv: 'badge', help: 'help'};
    paths.forEach((p, i) => add('pages', {id: p, title: app.navLabel(p), sub: files[i], icon: NAV[p], words: `${files[i]} ${allNav(p)}`, hint: c.page, run: () => app.navigate(p)}));
    app.projects().forEach(p => add('projects', {id: p.id, title: p.name, sub: `${p.category} · ${p.status}`, icon: 'folder', words: `${p.id} ${p.category} ${p.description}`, run: () => app.navigate('projects', p.id)}));
    app.pubList().filter(p => !app.pubHidden(p)).forEach(p => add('papers', {id: p.id, title: app.pubText(p.title), sub: `${p.venue || ''} · ${app.pubCopy().status[p.status] || p.status}`, icon: 'paper', words: (p.topics || []).join(' '),
      run: () => (p.page ? go(`/paper/${p.id}/${app.pubSeg()}`) : app.navigate('papers'))}));
    (window.NIANSIA_SUBMISSIONS?.venues || []).forEach(v => add('papers', {id: v.id, title: `${v.venue} · ${v.topic[L()] || v.topic.en}`, sub: c.deadline, icon: 'lock', words: 'deadline submission 投稿 截止', run: () => app.navigate('papers')}));
    (window.NIANSIA_BLOG?.posts?.[L()] || []).forEach(n => add('writing', {id: 'blog-' + n.slug, title: n.title, sub: `${n.date} · Blog`, icon: 'pen', words: `blog 部落格 博客 ${n.type} ${n.paper || ''} ${n.venue || ''} ${(n.tags || []).join(' ')} ${n.description || ''}`, run: () => go(n.url)}));
    (window.NIANSIA_NOTES?.[L()] || []).forEach(n => add('writing', {id: n.slug, title: n.title, sub: `${n.date} · ${c.note}`, icon: 'book', words: n.description, run: () => go(n.url)}));
    (window.NIANSIA_LOG?.[L()] || []).forEach(n => add('writing', {id: 'log-' + n.slug, title: n.title, sub: `${n.date} · ${c.log}`, icon: 'research', words: 'log 日誌 日志', run: () => go(n.url)}));
    const st = window.NIANSIA_STATEMENT?.[L()];
    if (st) add('writing', {id: 'statement', title: c.statement, sub: st.title, icon: 'research', words: 'statement research 研究', run: () => go(st.url)});
    add('writing', {id: 'notes', title: c.notes, sub: `/notes/${seg()}/`, icon: 'book', words: 'notes 筆記 笔记', run: () => go(`/notes/${seg()}/`)});
    add('writing', {id: 'log', title: c.logAll, sub: `/log/${seg()}/`, icon: 'research', words: 'log 日誌 日志', run: () => go(`/log/${seg()}/`)});

    add('actions', {id: 'brief', title: c.brief, sub: c.briefSub, icon: 'bolt', words: 'brief quick cv resume professor interviewer 快速 簡介 简介 教授 面試', run: () => go(`/brief/${app.pubSeg()}`), star: true});
    if (window.YUKI_TOUR) {
      add('actions', {id: 'tour', title: c.tour, sub: c.tours.research, icon: 'compass', words: 'tour guide 導覽 导览 介紹', run: () => window.YUKI_TOUR.start(), star: true});
      ['research', 'builder', 'fun'].forEach(k => add('actions', {id: 'tour-' + k, title: `${c.tour} · ${k}`, sub: c.tours[k], icon: 'compass', words: `tour ${k}`, run: () => window.YUKI_TOUR.start(k)}));
    }
    add('actions', {id: 'adversarial', title: c.adv, sub: c.advSub, icon: 'lock', words: 'adversarial attack fgsm pgd robust security 對抗 对抗 攻擊 攻击 安全', run: () => go(`/lab/adversarial/?lang=${L()}`), star: true});
    add('actions', {id: 'demo', title: c.demo, sub: c.demoSub, icon: 'spark', words: 'demo lumigrid webgpu 試玩', run: () => go(`/lab/lumigrid/?lang=${L()}`), star: true});
    add('actions', {id: 'chroma', title: c.chroma, sub: c.chromaSub, icon: 'spark', words: 'demo chromarecover colour color hidden digit pyodide 試玩 顏色 颜色 色盲', run: () => go(`/lab/chromarecover/?lang=${L()}`), star: true});
    if (window.YUKI) add('actions', {id: 'chat', title: c.chat, sub: 'yuki.exe', icon: 'chat', words: 'yuki chat talk 聊天', run: () => window.YUKI.openChat()});
    add('actions', {id: 'email', title: c.copyEmail, sub: EMAIL, icon: 'mail', words: 'email mail contact 信箱 邮箱 聯絡', run: async () => { try { await navigator.clipboard.writeText(EMAIL); app.toast(c.copied); } catch { app.toast(EMAIL); } }});
    add('actions', {id: 'github', title: c.github, sub: 'github.com/niansia', icon: 'link', words: 'github code source', run: () => window.open('https://github.com/niansia', '_blank', 'noopener')});
    if (app.pubList().some(p => p.bibtex && !app.pubHidden(p))) add('actions', {id: 'bib', title: c.bib, sub: 'niansia.bib', icon: 'download', words: 'bibtex cite citation', run: () => app.runCommand('papers')});
    add('actions', {id: 'dark', title: c.toggleDark, sub: `theme · ${app.t().themeNames[app.theme()]}`, icon: app.darkThemes.includes(app.theme()) ? 'sun' : 'moon', words: 'dark light theme mode 深色 淺色', run: () => app.runCommand('theme')});
    add('actions', {id: 'motion', title: app.allMotionOff() ? c.motionOn : c.motionOff, sub: 'motion', icon: app.allMotionOff() ? 'play' : 'pause', words: 'motion animation 動畫 动画', run: () => app.setMotion(app.allMotionOff())});
    add('actions', {id: 'motion-menu', title: c.motionMenu, sub: 'motion ui|cursor|yuki|pages', icon: 'spark', words: 'motion animation cursor trail transition 動畫 滑鼠 游標 轉場 动画 鼠标 转场', run: () => app.openMotion()});
    add('actions', {id: 'styles', title: c.styleMenu, sub: app.t().style, icon: 'palette', words: 'style theme palette 風格 风格', run: () => app.openStyles()});
    ['en', 'zh-TW', 'zh-CN'].filter(l => l !== L()).forEach(l => add('actions', {id: 'lang-' + l, title: c.lang[l], sub: l, icon: 'spark', words: `language lang ${l} 語言 语言`, run: () => app.setLanguage(l)}));

    app.themeGroups.forEach(([group, list]) => list.forEach(name => add('styles', {id: name, title: app.t().themeNames[name], sub: `${app.t().themeGroups[group]} · ${app.darkThemes.includes(name) ? c.dark : c.light}${name === app.theme() ? ' · ' + c.current : ''}`,
      theme: name, words: `${name} theme style ${['en', 'zh-TW', 'zh-CN'].map(l => window.NIANSIA_COPY[l]?.themeNames[name] || '').join(' ')}`, run: () => app.pickTheme(name)})));

    window.NIANSIA_TERMINAL.commands.forEach(cmd => add('commands', {id: cmd.name, title: cmd.usage, sub: cmd.description[L()] || cmd.description.en, icon: 'terminal', mono: true, words: cmd.name,
      run: () => { if (/[<[]/.test(cmd.usage)) fillCommand(cmd.example); else app.runCommand(cmd.name); }}));
    return out;
  }
  function fillCommand(text) {
    const input = document.querySelector('#screen-command') || document.querySelector('#terminal-command');
    if (!input) return;
    input.value = text; input.focus(); input.setSelectionRange(text.length, text.length);
  }

  /* ---------- fuzzy matching ---------- */
  const SEP = /[\s\-_/·.:()]/;
  function match(q, text) {
    const t = text.toLowerCase();
    if (!q) return {score: 1, hits: []};
    const at = t.indexOf(q);
    if (at >= 0) return {score: 100 - Math.min(at, 40) + (at === 0 || SEP.test(t[at - 1]) ? 30 : 0) + 20 * q.length / t.length, hits: [...Array(q.length)].map((_, k) => at + k)};
    let from = 0, prev = -2, streak = 0, score = 0; const hits = [];
    for (const ch of q) {
      if (ch === ' ') continue;
      const j = t.indexOf(ch, from);
      if (j < 0) return null;
      streak = j === prev + 1 ? streak + 1 : 0;
      score += 1 + streak * 3 + (j === 0 || SEP.test(t[j - 1]) ? 5 : 0);
      hits.push(j); prev = j; from = j + 1;
    }
    return {score: score - t.length * .04, hits};
  }
  function rank(q, list) {
    const out = [];
    for (const it of list) {
      const a = match(q, it.title), b = match(q, it.sub || ''), w = q.length > 1 ? match(q, it.words || '') : null;
      const best = Math.max(a?.score ?? 0, (b?.score ?? 0) * .6, (w?.score ?? 0) * .5);
      if (best > 3) out.push({...it, score: best + (it.star ? 4 : 0), hits: a?.hits || []});
    }
    return out.sort((x, y) => y.score - x.score);
  }
  function mark(text, hits) {
    if (!hits?.length) return esc(text);
    const set = new Set(hits);
    let html = '', open = false;
    [...text].forEach((ch, i) => {
      if (set.has(i) && !open) { html += '<mark>'; open = true; }
      if (!set.has(i) && open) { html += '</mark>'; open = false; }
      html += esc(ch);
    });
    return html + (open ? '</mark>' : '');
  }

  /* ---------- recent ---------- */
  const recent = () => { try { return JSON.parse(app.store.get('palette-recent', '[]')); } catch { return []; } };
  const remember = key => app.store.set('palette-recent', JSON.stringify([key, ...recent().filter(k => k !== key)].slice(0, 5)));

  /* ---------- view ---------- */
  const GROUP_ORDER = ['recent', 'suggested', 'pages', 'projects', 'papers', 'writing', 'actions', 'styles', 'commands', 'fallback'];
  const LIMIT = {pages: 9, projects: 6, papers: 5, writing: 5, actions: 6, styles: 6, commands: 6};
  let box = null, list = [], active = 0, lastFocus = null, catalogue = [], committed = false;
  function build() {
    box = document.createElement('div');
    box.className = 'palette'; box.hidden = true;
    box.innerHTML = `<div class="palette-backdrop" data-palette-close></div>
      <div class="palette-box" role="dialog" aria-modal="true">
        <div class="palette-input">${icon('search')}<span class="palette-mode" hidden></span><input type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" autocapitalize="none" maxlength="120"><kbd data-palette-close>Esc</kbd></div>
        <div class="palette-list" id="palette-list" role="listbox"></div>
        <footer class="palette-foot"></footer>
      </div>`;
    document.body.append(box);
    const input = box.querySelector('input');
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', onKey);
    box.addEventListener('click', event => {
      if (event.target.closest('[data-palette-close]')) { close(); return; }
      const opt = event.target.closest('[data-index]');
      if (opt) choose(Number(opt.dataset.index));
    });
    box.addEventListener('pointermove', event => {
      const opt = event.target.closest('[data-index]');
      if (opt && Number(opt.dataset.index) !== active) { active = Number(opt.dataset.index); paintActive(false); }
    });
  }
  function query() {
    const raw = box.querySelector('input').value;
    const mode = raw.startsWith('>') ? 'cmd' : raw.startsWith('?') ? 'ask' : '';
    return {raw, mode, q: (mode ? raw.slice(1) : raw).trim().toLowerCase(), text: (mode ? raw.slice(1) : raw).trim()};
  }
  function render() {
    const c = C(), {mode, q, text} = query(), modeEl = box.querySelector('.palette-mode');
    modeEl.hidden = !mode; modeEl.textContent = mode === 'cmd' ? c.modeCmd : mode === 'ask' ? c.modeAsk : '';
    let groups = [];
    if (mode === 'ask') groups = [];
    else if (mode === 'cmd') groups = [['commands', q ? rank(q, catalogue.filter(i => i.group === 'commands')) : catalogue.filter(i => i.group === 'commands')]];
    else if (!q) {
      const byKey = new Map(catalogue.map(i => [i.key, i]));
      const rec = recent().map(k => byKey.get(k)).filter(Boolean);
      const sugg = ['actions:brief', 'actions:tour', 'actions:adversarial', 'pages:papers', 'actions:demo'].map(k => byKey.get(k)).filter(i => i && !rec.includes(i));
      groups = [['recent', rec], ['suggested', sugg], ['pages', catalogue.filter(i => i.group === 'pages' && !rec.includes(i) && !sugg.includes(i))]];
    } else {
      const ranked = rank(q, catalogue);
      const by = {};
      ranked.forEach(i => { (by[i.group] ||= []).push(i); });
      groups = Object.entries(by).map(([g, arr]) => [g, arr.slice(0, LIMIT[g] || 6)]).sort((a, b) => b[1][0].score - a[1][0].score || GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]));
    }
    if (text && mode !== 'cmd') groups.push(['fallback', [
      {key: 'ask', title: c.askYuki(text), icon: 'chat', run: () => (window.YUKI ? window.YUKI.openChat(text) : app.runCommand('ask ' + text))},
      ...(mode ? [] : [{key: 'run', title: c.run(text), icon: 'terminal', mono: true, run: () => app.runCommand(text)}])]]);
    list = groups.flatMap(([, arr]) => arr);
    active = Math.min(active, Math.max(0, list.length - 1));
    let n = 0;
    const html = groups.filter(([, arr]) => arr.length).map(([g, arr]) => `<div class="palette-group" role="group" aria-label="${esc(c.groups[g])}"><p class="palette-glabel">${esc(c.groups[g])}</p>${arr.map(it => option(it, n++)).join('')}</div>`).join('');
    box.querySelector('.palette-list').innerHTML = html || `<p class="palette-empty">${esc(c.empty)}</p>`;
    const count = list.filter(i => i.group).length;
    box.querySelector('.palette-foot').innerHTML = `<span><kbd>↑</kbd><kbd>↓</kbd>${esc(c.move)}</span><span><kbd>↵</kbd>${esc(c.open)}</span><span><kbd>&gt;</kbd>${esc(c.cmds)}</span><span><kbd>?</kbd>${esc(c.ask)}</span><span class="palette-count">${esc(c.results(count))}</span>`;
    paintActive(true);
  }
  function option(it, i) {
    const lead = it.theme ? `<span class="palette-thumb theme-thumb" data-theme-scope="${it.theme}" aria-hidden="true"><i class="tt-desk"></i><i class="tt-win"><i class="tt-bar"><b></b><b></b><b></b></i><i class="tt-side"><b></b><b></b></i><i class="tt-main"><i class="tt-h"></i><i class="tt-l"></i><i class="tt-btn"></i></i></i></span>`
      : `<span class="palette-icon" aria-hidden="true">${icon(it.icon || 'file')}</span>`;
    return `<div class="palette-item${it.mono ? ' is-mono' : ''}" role="option" id="palette-opt-${i}" data-index="${i}" aria-selected="false">${lead}<span class="palette-text"><b>${mark(it.title, it.hits)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span><span class="palette-hint">${it.theme === app.theme() ? '✓' : it.hint ? esc(it.hint) : ''}<kbd>↵</kbd></span></div>`;
  }
  function paintActive(scrollAll) {
    const input = box.querySelector('input');
    box.querySelectorAll('[data-index]').forEach(el => {
      const on = Number(el.dataset.index) === active;
      el.setAttribute('aria-selected', String(on));
      el.classList.toggle('is-active', on);
      if (on) { input.setAttribute('aria-activedescendant', el.id); if (scrollAll !== false) el.scrollIntoView({block: 'nearest'}); }
    });
    if (!list.length) input.removeAttribute('aria-activedescendant');
    const it = list[active];
    if (it?.theme) app.previewTheme(it.theme); else app.endPreview();
  }
  function onKey(event) {
    if (event.isComposing) return;
    const k = event.key;
    if (k === 'ArrowDown' || k === 'ArrowUp' || (k === 'Tab' && list.length)) {
      event.preventDefault();
      const d = k === 'ArrowUp' || (k === 'Tab' && event.shiftKey) ? -1 : 1;
      active = (active + d + list.length) % Math.max(1, list.length); paintActive();
    } else if (k === 'Home' && event.ctrlKey) { event.preventDefault(); active = 0; paintActive(); }
    else if (k === 'End' && event.ctrlKey) { event.preventDefault(); active = list.length - 1; paintActive(); }
    else if (k === 'Enter') { event.preventDefault(); if (list.length) choose(active); else { const {text} = query(); if (text) { close(); window.YUKI?.openChat(text); } } }
    else if (k === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    else if (k === 'Backspace' && !event.target.value && query().mode === '') { /* nothing */ }
  }
  function choose(i) {
    const it = list[i]; if (!it) return;
    if (it.key && it.group) remember(it.key);
    committed = true;
    close(true);
    setTimeout(() => it.run?.(), 0);
  }
  function open(initial = '') {
    if (!box) build();
    if (!box.hidden) { box.querySelector('input').select(); return; }
    catalogue = items(); committed = false;
    lastFocus = document.activeElement;
    const c = C(), input = box.querySelector('input');
    box.querySelector('.palette-box').setAttribute('aria-label', c.label);
    input.placeholder = c.placeholder; input.setAttribute('aria-label', c.label);
    input.value = initial || ''; active = 0;
    box.hidden = false; document.documentElement.classList.add('palette-open');
    box.classList.remove('is-in'); void box.offsetWidth; box.classList.add('is-in');
    render();
    input.focus({preventScroll: true});
    document.querySelector('[data-action="palette"]')?.setAttribute('aria-expanded', 'true');
  }
  function close(keepFocus) {
    if (!box || box.hidden) return;
    if (!committed) app.endPreview();
    box.hidden = true; document.documentElement.classList.remove('palette-open');
    document.querySelector('[data-action="palette"]')?.setAttribute('aria-expanded', 'false');
    if (!keepFocus && lastFocus?.isConnected) lastFocus.focus({preventScroll: true});
  }
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault(); event.stopPropagation();
      if (box && !box.hidden) close(); else open();
    }
  }, true);
  window.addEventListener('niansia:locale', () => { if (box && !box.hidden) { catalogue = items(); render(); } });
  window.NIANSIA_PALETTE = {open, close, toggle: () => (box && !box.hidden ? close() : open())};
})();
