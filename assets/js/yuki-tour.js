/* Yuki's guided tour: three short routes through the portfolio. A spotlight frames one thing at a time, Yuki explains it
   in a card beside it, and the terminal moves to the right file on its own. → / Enter next, ← back, Esc ends.
   Start from the home card, the palette (Ctrl+K), the `tour [research|builder|fun]` command, chat, or ?tour=<route>. */
(() => {
  'use strict';
  const app = window.NIANSIA_APP;
  if (!app) return;
  const esc = app.esc, icon = app.icon;
  const L = () => app.locale();
  const tx = v => (v && typeof v === 'object' ? v[L()] ?? v.en : v || '');
  const UI = {
    en: {guide: 'Yuki · tour', next: 'Next', back: 'Back', done: 'Finish', skip: 'End tour', pick: 'Where shall we start?', pickSub: 'Pick a route. It takes about a minute, and you can leave any time with Esc.',
      steps: n => `${n} stops`, offer: 'First time here? I can show you around in about a minute.', offerYes: 'Show me around', offerNo: 'Maybe later',
      pitch: 'Happy to show you around! Pick a route:', endTitle: 'That’s the tour!', endBody: 'Thanks for walking around with me. If you need to share Niansia’s work with someone, the one-page brief is the quickest way.',
      endBrief: 'Open the brief', endStay: 'Keep exploring', cta: 'Take the tour', keys: '→ next · ← back · Esc end'},
    'zh-TW': {guide: 'Yuki · 導覽', next: '下一步', back: '上一步', done: '完成', skip: '結束導覽', pick: '想從哪裡開始？', pickSub: '選一條路線，大約一分鐘。隨時可以按 Esc 離開。',
      steps: n => `${n} 站`, offer: '第一次來嗎？我可以花一分鐘帶你逛一圈。', offerYes: '帶我逛逛', offerNo: '晚點再說',
      pitch: '好呀，我帶你逛！選一條路線：', endTitle: '導覽結束！', endBody: '謝謝你陪我走完一圈。如果要把 Niansia 的作品分享給別人，一頁式簡介是最快的方式。',
      endBrief: '打開一頁式簡介', endStay: '繼續逛逛', cta: '跟 Yuki 導覽', keys: '→ 下一步 · ← 上一步 · Esc 結束'},
    'zh-CN': {guide: 'Yuki · 导览', next: '下一步', back: '上一步', done: '完成', skip: '结束导览', pick: '想从哪里开始？', pickSub: '选一条路线，大约一分钟。随时可以按 Esc 离开。',
      steps: n => `${n} 站`, offer: '第一次来吗？我可以花一分钟带你逛一圈。', offerYes: '带我逛逛', offerNo: '晚点再说',
      pitch: '好呀，我带你逛！选一条路线：', endTitle: '导览结束！', endBody: '谢谢你陪我走完一圈。如果要把 Niansia 的作品分享给别人，一页式简介是最快的方式。',
      endBrief: '打开一页式简介', endStay: '继续逛逛', cta: '跟 Yuki 导览', keys: '→ 下一步 · ← 上一步 · Esc 结束'}
  };
  const U = () => UI[L()] || UI.en;

  /* ---------- routes ---------- */
  const ROUTES = {
    research: {icon: 'research', title: {en: 'Research route', 'zh-TW': '研究路線', 'zh-CN': '研究路线'},
      sub: {en: 'For professors and collaborators: questions, papers and evidence.', 'zh-TW': '給教授與合作者：研究問題、論文與證據。', 'zh-CN': '给教授与合作者：研究问题、论文与证据。'},
      steps: [
        {view: 'home', target: '.welcome-copy h1', title: {en: 'Welcome to the lab', 'zh-TW': '歡迎來到研究室', 'zh-CN': '欢迎来到研究室'},
          body: {en: 'Niansia is a CS master’s student at NYCU working where AI security, computer vision and vision-language models meet.', 'zh-TW': 'Niansia 是陽明交大資工碩士生，研究 AI 安全、電腦視覺與視覺語言模型的交會處。', 'zh-CN': 'Niansia 是阳明交大资工硕士生，研究 AI 安全、计算机视觉与视觉语言模型的交会处。'}},
        {view: 'home', target: '.brief-chip', title: {en: 'Short on time?', 'zh-TW': '時間不多？', 'zh-CN': '时间不多？'},
          body: {en: 'This one-page brief has the research, papers, selected projects and contact on a single printable page.', 'zh-TW': '這份一頁式簡介把研究方向、論文、代表作品和聯絡方式放在同一頁，也能直接列印。', 'zh-CN': '这份一页式简介把研究方向、论文、代表作品和联系方式放在同一页，也能直接打印。'}},
        {view: 'research', target: '.research-entry', title: {en: 'Two connected questions', 'zh-TW': '兩個相連的問題', 'zh-CN': '两个相连的问题'},
          body: {en: 'How multimodal AI stays secure and auditable under adversarial inputs, and how vision-language models keep to the visual evidence.', 'zh-TW': '多模態 AI 如何在對抗輸入下維持安全、可稽核；以及視覺語言模型如何忠於視覺證據。', 'zh-CN': '多模态 AI 如何在对抗输入下保持安全、可审计；以及视觉语言模型如何忠于视觉证据。'}},
        {view: 'research', target: '.adv-try', title: {en: 'Break a model yourself', 'zh-TW': '親手攻破一個模型', 'zh-CN': '亲手攻破一个模型'},
          body: {en: 'The Adversarial Lab runs FGSM and PGD attacks in your browser, maps the decision boundary, and compares a normal model with an adversarially trained one.', 'zh-TW': '對抗樣本實驗室在你的瀏覽器裡執行 FGSM 與 PGD 攻擊、畫出決策邊界，並比較一般模型與對抗訓練過的模型。', 'zh-CN': '对抗样本实验室在你的浏览器里运行 FGSM 与 PGD 攻击、画出决策边界，并比较普通模型与对抗训练过的模型。'}},
        {view: 'research', target: '.statement-card', title: {en: 'The why, in writing', 'zh-TW': '寫下來的「為什麼」', 'zh-CN': '写下来的“为什么”'},
          body: {en: 'The research statement explains what Niansia studies, why it matters, and what comes next.', 'zh-TW': '研究方向說明解釋了 Niansia 研究什麼、為什麼重要，以及接下來想做什麼。', 'zh-CN': '研究方向说明解释了 Niansia 研究什么、为什么重要，以及接下来想做什么。'}},
        {view: 'papers', target: '.prep-grid', title: {en: 'Papers in preparation', 'zh-TW': '準備中的論文', 'zh-CN': '准备中的论文'},
          body: {en: 'Manuscripts for CVPR, ICCV and COLM 2027. They stay anonymous here during double-blind review, with a live countdown to each deadline.', 'zh-TW': '準備投稿 CVPR、ICCV 與 COLM 2027 的稿件。雙盲審查期間在這裡保持匿名，旁邊有各會議截止的即時倒數。', 'zh-CN': '准备投稿 CVPR、ICCV 与 COLM 2027 的稿件。双盲评审期间在这里保持匿名，旁边有各会议截止的实时倒数。'}},
        {view: 'projects', id: 'lumigrid', target: '.lg-table', title: {en: 'Claims come with numbers', 'zh-TW': '每個主張都有數字', 'zh-CN': '每个主张都有数字'},
          body: {en: 'LumiGrid reports 24.57 dB PSNR on 20 held-out NTIRE 2025 pairs, next to every baseline and ablation, with a note on what the number does not mean.', 'zh-TW': 'LumiGrid 在 20 組保留的 NTIRE 2025 測試影像上達到 24.57 dB PSNR，旁邊列出所有基準與消融，也寫明這個數字不代表什麼。', 'zh-CN': 'LumiGrid 在 20 组保留的 NTIRE 2025 测试图像上达到 24.57 dB PSNR，旁边列出所有基准与消融，也写明这个数字不代表什么。'}},
        {view: 'contact', target: '.contact-address', title: {en: 'Say hello', 'zh-TW': '打個招呼', 'zh-CN': '打个招呼'},
          body: {en: 'Reading papers together, reproducing a result, designing a benchmark: Niansia welcomes the conversation.', 'zh-TW': '一起讀論文、重現結果、設計評測基準，Niansia 都很歡迎聊聊。', 'zh-CN': '一起读论文、复现结果、设计评测基准，Niansia 都很欢迎聊聊。'}}
      ]},
    builder: {icon: 'terminal', title: {en: 'Builder route', 'zh-TW': '實作路線', 'zh-CN': '实作路线'},
      sub: {en: 'For engineers: the projects, the demos and how this site works.', 'zh-TW': '給工程師：作品、試玩，以及這個網站怎麼運作。', 'zh-CN': '给工程师：作品、试玩，以及这个网站怎么运作。'},
      steps: [
        {view: 'projects', target: '.project-directory', title: {en: 'Eleven public projects', 'zh-TW': '十一項公開作品', 'zh-CN': '十一项公开作品'},
          body: {en: 'Each one lists its status honestly, from pre-alpha to released, and links to the evidence behind it.', 'zh-TW': '每一項都誠實標示目前狀態，從 pre-alpha 到正式釋出，並附上背後的證據連結。', 'zh-CN': '每一项都诚实标示目前状态，从 pre-alpha 到正式发布，并附上背后的证据链接。'}},
        {view: 'projects', id: 'lumigrid', target: '.lg-try', title: {en: 'Runs in your browser', 'zh-TW': '直接在瀏覽器執行', 'zh-CN': '直接在浏览器运行'},
          body: {en: 'Drop in your own dark photo: both networks run on your device with WebGPU or WebAssembly, and nothing is uploaded.', 'zh-TW': '丟一張自己的暗照片進去：兩個網路都用 WebGPU 或 WebAssembly 在你的裝置上跑，不會上傳。', 'zh-CN': '丢一张自己的暗照片进去：两个网络都用 WebGPU 或 WebAssembly 在你的设备上跑，不会上传。'}},
        {view: 'projects', id: 'taiwan-exam', target: '.te-film', title: {en: 'An Agent Skill, end to end', 'zh-TW': '從頭到尾的 Agent Skill', 'zh-CN': '从头到尾的 Agent Skill'},
          body: {en: 'Taiwan Exam has a model write an original GSAT exam, re-solve it blind, and stamp it onto the official templates. The film shows the whole pipeline.', 'zh-TW': 'Taiwan Exam 讓模型原創學測試題、不看答案重新解題，再套到官方模板上。影片把整條流程演一遍。', 'zh-CN': 'Taiwan Exam 让模型原创学测试题、不看答案重新解题，再套到官方模板上。影片把整条流程演一遍。'}},
        {view: 'projects', id: 'kcrashlab', target: '.project-detail h2', title: {en: 'Evidence and scope', 'zh-TW': '證據與範圍', 'zh-CN': '证据与范围'},
          body: {en: 'Every project page ends with what was actually checked and where to verify it, not just what the tool promises.', 'zh-TW': '每個作品頁最後都寫著實際檢查了什麼、去哪裡驗證，而不只是工具的承諾。', 'zh-CN': '每个作品页最后都写着实际检查了什么、去哪里验证，而不只是工具的承诺。'}},
        {view: 'home', target: '.inline-command-form', title: {en: 'It really is a terminal', 'zh-TW': '真的是一個終端機', 'zh-CN': '真的是一个终端'},
          body: {en: 'Everything here is also a command. Try help, tree or find vision, with Tab completion and history.', 'zh-TW': '這裡的一切都可以用指令操作。試試 help、tree 或 find vision，支援 Tab 補全與歷史紀錄。', 'zh-CN': '这里的一切都可以用命令操作。试试 help、tree 或 find vision，支持 Tab 补全与历史记录。'}},
        {view: 'home', target: '.bar-search', title: {en: 'Jump anywhere', 'zh-TW': '一鍵跳到任何地方', 'zh-CN': '一键跳到任何地方'},
          body: {en: 'Press Ctrl+K (⌘K on a Mac) to search every page, project, paper, note, style and command.', 'zh-TW': '按 Ctrl+K（Mac 是 ⌘K）可以搜尋所有頁面、作品、論文、筆記、風格與指令。', 'zh-CN': '按 Ctrl+K（Mac 是 ⌘K）可以搜索所有页面、作品、论文、笔记、风格与命令。'}},
        {view: 'home', target: '.explorer-bottom a', title: {en: 'Read the source', 'zh-TW': '看原始碼', 'zh-CN': '看源代码'},
          body: {en: 'All of it, including this site and my tiny on-device brain, is on GitHub.', 'zh-TW': '全部都在 GitHub 上，包括這個網站和我那顆在裝置上執行的小腦袋。', 'zh-CN': '全部都在 GitHub 上，包括这个网站和我那颗在设备上运行的小脑袋。'}}
      ]},
    fun: {icon: 'heart', title: {en: 'Just for fun', 'zh-TW': '輕鬆逛逛', 'zh-CN': '轻松逛逛'},
      sub: {en: 'The playful bits: me, the styles and a few secrets.', 'zh-TW': '好玩的地方：我、網頁風格和一些小祕密。', 'zh-CN': '好玩的地方：我、网页风格和一些小秘密。'},
      steps: [
        {view: 'home', target: '.yuki-hit', title: {en: 'Hi, that’s me!', 'zh-TW': '嗨，這是我！', 'zh-CN': '嗨，这是我！'},
          body: {en: 'Drag me around, rub my head, feed me or play yarn ball. I remember how you treated me.', 'zh-TW': '可以拖著我走、摸摸頭、餵我或陪我玩毛線球。我會記得你對我好不好喔。', 'zh-CN': '可以拖着我走、摸摸头、喂我或陪我玩毛线球。我会记得你对我好不好哦。'}},
        {view: 'home', target: '[data-action="styles"]', title: {en: 'Thirteen styles', 'zh-TW': '十三種風格', 'zh-CN': '十三种风格'},
          body: {en: 'Classic, Japanese and glass. Hover a thumbnail to preview the whole page, click to keep it.', 'zh-TW': '經典、和風和玻璃。滑過縮圖就能預覽整頁，點一下才會套用。', 'zh-CN': '经典、和风和玻璃。滑过缩略图就能预览整页，点一下才会套用。'}},
        {view: 'home', target: '.ask-card', title: {en: 'Ask me anything (about the portfolio)', 'zh-TW': '問我問題（關於作品集的）', 'zh-CN': '问我问题（关于作品集的）'},
          body: {en: 'A 61k-parameter network runs right in your browser to understand you. What you type never leaves your device.', 'zh-TW': '一個 6 萬多參數的小網路直接在你的瀏覽器裡理解你的話，你打的字不會離開你的裝置。', 'zh-CN': '一个 6 万多参数的小网络直接在你的浏览器里理解你的话，你打的字不会离开你的设备。'}},
        {view: 'home', target: '.quick-commands', title: {en: 'Little secrets', 'zh-TW': '小祕密', 'zh-CN': '小秘密'},
          body: {en: 'Try trick, or trail paws for paw prints behind your pointer. sudo is also… an option.', 'zh-TW': '試試 trick，或 trail paws 讓游標後面跟著貓掌印。sudo 也是……一個選項。', 'zh-CN': '试试 trick，或 trail paws 让光标后面跟着猫掌印。sudo 也是……一个选项。'}},
        {view: 'hobbies', target: '.hobby-card', title: {en: 'Off the clock', 'zh-TW': '研究以外', 'zh-CN': '研究以外'},
          body: {en: 'Cosplay, music and far too many fandoms. Every lab needs a break room.', 'zh-TW': 'Cosplay、音樂和一大堆坑。每間研究室都需要一間休息室。', 'zh-CN': 'Cosplay、音乐和一大堆坑。每间研究室都需要一间休息室。'}}
      ]}
  };

  /* ---------- DOM ---------- */
  let layer = null, route = '', index = -1, token = 0, target = null, raf = 0;
  function build() {
    layer = document.createElement('div');
    layer.className = 'tour'; layer.hidden = true;
    layer.innerHTML = `<svg class="tour-dim" aria-hidden="true"><defs><mask id="tour-mask"><rect width="100%" height="100%" fill="#fff"/><rect class="tour-hole" fill="#000"/></mask></defs><rect class="tour-shade" width="100%" height="100%" mask="url(#tour-mask)"/></svg><div class="tour-ring" aria-hidden="true"></div><section class="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title"></section>`;
    document.body.append(layer);
    layer.addEventListener('click', event => {
      const b = event.target.closest('[data-tour-do]'); if (!b) return;
      const act = b.dataset.tourDo;
      if (act === 'next') go(index + 1);
      else if (act === 'back') go(index - 1);
      else if (act === 'end') end();
      else if (act === 'route') start(b.dataset.route);
      else if (act === 'brief') { end(); location.href = `/brief/${app.pubSeg()}`; }
    });
  }
  const card = () => layer.querySelector('.tour-card');
  const ring = () => layer.querySelector('.tour-ring');
  const avatar = face => `<span class="chat-avatar tour-avatar" data-face="${face}" aria-hidden="true"></span>`;
  function head(extra = '') { return `<header class="tour-head">${avatar(1)}<span><b>${esc(U().guide)}</b>${extra}</span><button type="button" class="tour-x" data-tour-do="end" aria-label="${esc(U().skip)}">${icon('close')}</button></header>`; }

  function chooser() {
    const u = U();
    route = ''; index = -1;
    spotlight(null);
    card().className = 'tour-card is-center';
    card().innerHTML = `${head()}<h2 id="tour-title">${esc(u.pick)}</h2><p class="tour-body">${esc(u.pickSub)}</p>
      <div class="tour-routes">${Object.entries(ROUTES).map(([id, r]) => `<button type="button" class="tour-route" data-tour-do="route" data-route="${id}"><span class="tour-route-icon">${icon(r.icon)}</span><span><b>${esc(tx(r.title))}</b><small>${esc(tx(r.sub))}</small></span><em>${esc(u.steps(r.steps.length))}</em></button>`).join('')}</div>`;
    place(null);
    card().querySelector('.tour-route')?.focus({preventScroll: true});
  }
  function finish() {
    const u = U();
    index = ROUTES[route].steps.length;
    spotlight(null);
    card().className = 'tour-card is-center is-end';
    card().innerHTML = `${head()}<h2 id="tour-title">${esc(u.endTitle)}</h2><p class="tour-body">${esc(u.endBody)}</p>
      <div class="tour-actions"><button type="button" class="tour-btn" data-tour-do="end">${esc(u.endStay)}</button><button type="button" class="tour-btn is-primary" data-tour-do="brief">${icon('bolt')}<span>${esc(u.endBrief)}</span></button></div>`;
    place(null);
    card().querySelector('.is-primary')?.focus({preventScroll: true});
    window.YUKI?.act?.('trick');
  }

  /* ---------- steps ---------- */
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function find(sel, ms = 1400) {
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      const el = document.querySelector(sel);
      if (el && el.getBoundingClientRect().height > 8) return el;
      await wait(60);
    }
    return null;
  }
  async function go(i) {
    const steps = ROUTES[route]?.steps; if (!steps) return;
    if (i < 0) return;
    if (i >= steps.length) { finish(); return; }
    const my = ++token, s = steps[i];
    index = i;
    const {view, projectId} = app.view();
    if (view !== s.view || (projectId || '') !== (s.id || '')) app.navigate(s.view, s.id || '', {quiet: true});
    card().classList.add('is-moving');
    const el = await find(s.target);
    if (my !== token) return;
    if (el && reveal(el)) { await wait(app.motion() ? 420 : 30); if (my !== token) return; }
    target = el;
    render(s, i, steps.length);
    spotlight(el);
    place(el);
    card().classList.remove('is-moving');
    // Pages keep settling after they appear (images, fetched tables): re-frame the target once or twice.
    [450, 1300].forEach(ms => setTimeout(() => { if (my === token && target?.isConnected) { reveal(target); follow(); setTimeout(follow, 460); } }, ms));
  }
  // Scroll the reading pane so the target is visible and Yuki's card has room above or below it.
  function reveal(el) {
    const scroller = el.closest('.terminal-output'); if (!scroller) return false;
    const box = measure(el), pane = scroller.getBoundingClientRect(), need = (layer?.querySelector('.tour-card')?.offsetHeight || 240) + 36;
    const visible = box.top >= pane.top + 16 && box.bottom <= pane.bottom - 16;
    const roomy = innerWidth < 720 || innerHeight - box.bottom > need || box.top > need;
    if (visible && roomy) return false;
    const room = box.height + need < pane.height + (innerHeight - pane.bottom);
    const top = scroller.scrollTop + box.top - pane.top - (room ? 20 : Math.max(20, (pane.height - box.height) / 2));
    if (Math.abs(top - scroller.scrollTop) < 4) return false;
    scroller.scrollTo({top, behavior: app.motion() ? 'smooth' : 'auto'});
    return true;
  }
  function render(s, i, n) {
    const u = U(), r = ROUTES[route];
    card().className = 'tour-card';
    card().innerHTML = `${head(`<small>${esc(tx(r.title))} · ${i + 1} / ${n}</small>`)}
      <h2 id="tour-title">${esc(tx(s.title))}</h2><p class="tour-body" aria-live="polite">${esc(tx(s.body))}</p>
      <div class="tour-progress" aria-hidden="true">${r.steps.map((_, k) => `<i class="${k < i ? 'is-done' : k === i ? 'is-now' : ''}"></i>`).join('')}</div>
      <div class="tour-actions"><span class="tour-keys">${esc(u.keys)}</span>${i ? `<button type="button" class="tour-btn" data-tour-do="back">${esc(u.back)}</button>` : ''}<button type="button" class="tour-btn is-primary" data-tour-do="next">${esc(i === n - 1 ? u.done : u.next)}<span aria-hidden="true">→</span></button></div>`;
    card().querySelector('.is-primary').focus({preventScroll: true});
  }
  // Headings are full-width blocks; frame the words instead of the whole line.
  function measure(el) {
    if (/^H[1-6]$/.test(el.tagName)) { const range = document.createRange(); range.selectNodeContents(el); const r = range.getBoundingClientRect(); if (r.width) return r; }
    return el.getBoundingClientRect();
  }
  function spotlight(el) {
    const r = ring(), hole = layer.querySelector('.tour-hole');
    if (!el) { r.classList.add('is-off'); Object.assign(hole.style, {x: `${innerWidth / 2}px`, y: `${innerHeight / 2}px`, width: '0px', height: '0px'}); return; }
    const b = measure(el), pad = 8;
    const x = Math.max(4, b.left - pad), y = Math.max(4, b.top - pad);
    const w = Math.min(innerWidth - 4, b.right + pad) - x, h = Math.min(innerHeight - 4, b.bottom + pad) - y;
    r.classList.remove('is-off');
    r.style.transform = `translate(${x}px, ${y}px)`;
    r.style.width = `${Math.max(0, w)}px`; r.style.height = `${Math.max(0, h)}px`;
    const radius = Math.min(18, Math.max(8, parseFloat(getComputedStyle(el).borderRadius) + 6 || 12));
    r.style.borderRadius = `${radius}px`;
    Object.assign(hole.style, {x: `${x}px`, y: `${y}px`, width: `${Math.max(0, w)}px`, height: `${Math.max(0, h)}px`, rx: `${radius}px`});
  }
  function place(el) {
    const c = card();
    if (!el || innerWidth < 720) { c.style.left = c.style.top = ''; c.classList.toggle('is-docked', !!el); return; }
    c.classList.remove('is-docked');
    const b = measure(el), cw = c.offsetWidth, ch = c.offsetHeight, gap = 18, m = 12;
    const room = {below: innerHeight - b.bottom, above: b.top, right: innerWidth - b.right, left: b.left};
    let x, y, side;
    if (room.below > ch + gap + m) { side = 'below'; y = b.bottom + gap; x = b.left; }
    else if (room.above > ch + gap + m) { side = 'above'; y = b.top - gap - ch; x = b.left; }
    else if (room.right > cw + gap + m) { side = 'right'; x = b.right + gap; y = b.top; }
    else if (room.left > cw + gap + m) { side = 'left'; x = b.left - gap - cw; y = b.top; }
    else { side = 'inside'; x = b.right - cw - m; y = b.bottom - ch - m; }
    x = Math.min(Math.max(m, x), innerWidth - cw - m); y = Math.min(Math.max(m, y), innerHeight - ch - m);
    c.dataset.side = side;
    c.style.left = `${Math.round(x)}px`; c.style.top = `${Math.round(y)}px`;
  }
  function follow() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { if (layer && !layer.hidden && target?.isConnected) { spotlight(target); place(target); } });
  }

  /* ---------- lifecycle ---------- */
  function start(which) {
    if (!layer) build();
    window.NIANSIA_PALETTE?.close();
    app.store.set('tour-offered', '1');
    layer.hidden = false; document.documentElement.classList.add('tour-on');
    if (!layer.classList.contains('is-in')) { void layer.offsetWidth; layer.classList.add('is-in'); }
    if (ROUTES[which]) { route = which; go(0); } else chooser();
  }
  function end() {
    if (!layer || layer.hidden) return;
    token++; target = null; layer.hidden = true; layer.classList.remove('is-in');
    document.documentElement.classList.remove('tour-on');
    document.querySelector('#terminal-command')?.focus({preventScroll: true});
  }
  window.addEventListener('keydown', event => {
    if (!layer || layer.hidden || event.isComposing) return;
    const inCard = card().contains(event.target);
    const typing = event.target.matches?.('input,textarea,[contenteditable="true"]') && !inCard;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); end(); return; }
    if (typing || !route || index < 0 || index >= ROUTES[route].steps.length) return;
    if (event.key === 'ArrowRight' || (event.key === 'Enter' && !event.target.closest?.('button,a'))) { event.preventDefault(); event.stopImmediatePropagation(); go(index + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); event.stopImmediatePropagation(); go(index - 1); }
  }, true);
  window.addEventListener('resize', follow);
  document.addEventListener('scroll', follow, true);
  window.addEventListener('niansia:locale', () => { if (layer && !layer.hidden) { if (!route) chooser(); else if (index >= ROUTES[route].steps.length) finish(); else go(index); } });
  document.addEventListener('click', event => { const b = event.target.closest('[data-tour]'); if (b) { event.preventDefault(); start(b.dataset.tour); } });

  window.YUKI_TOUR = {
    start, end, running: () => !!layer && !layer.hidden,
    pitch: () => U().pitch,
    routes: () => Object.entries(ROUTES).map(([id, r]) => ({id, label: tx(r.title)})),
    cta: () => U().cta
  };

  /* A deep link (?tour=research) starts a route; first-time visitors get one gentle offer from Yuki. */
  const asked = new URLSearchParams(location.search).get('tour');
  if (asked !== null) setTimeout(() => start(asked), 900);
  else if (app.store.get('tour-offered', '') !== '1') {
    const offer = () => {
      if (app.store.get('tour-offered', '') === '1' || window.YUKI_TOUR.running() || !window.YUKI?.offer) return;
      if (document.hidden) { document.addEventListener('visibilitychange', () => setTimeout(offer, 3000), {once: true}); return; }
      app.store.set('tour-offered', '1');
      const u = U();
      window.YUKI.offer(u.offer, [{label: u.offerYes, run: () => start()}, {label: u.offerNo, run: () => {}}]);
    };
    setTimeout(offer, 8500);
  }
})();
