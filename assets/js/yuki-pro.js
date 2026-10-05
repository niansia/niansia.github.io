/* Yuki's "trained" chat tier: a small classifier trained for this site (tools/train_yuki_pro.py, assets/yuki/pro.json,
   ~130 KB) that recognises 25 kinds of knowledge question, plus composers that answer them from the live site data
   (projects, blog, community, themes) in en / zh-TW / zh-CN. Because the facts come from the data files, a new project
   or post is answered at once without retraining, and nothing can be invented. Anything else (greetings, commands,
   Yuki's actions, small talk) returns null so yuki-pet.js hands it to the small model. Runs locally, in milliseconds. */
(() => {
  'use strict';
  const ALIASES = {
    zerostel: ['zerostel', 'zero stel', '時光機', '时光机', '行車紀錄器', '行车记录仪'],
    'adversarial-lab': ['adversarial lab', 'adversarial-lab', 'adversarial', '對抗實驗室', '对抗实验室', '對抗樣本實驗室'],
    lumigrid: ['lumigrid', 'lumi grid', 'lumi-grid'],
    'taiwan-exam': ['taiwan exam', 'taiwan-exam', 'taiwanexam', '學測模擬考', '学测模拟考'],
    kcrashlab: ['kcrashlab', 'kcrash lab', 'kcrash', 'crashlab'], contextsec: ['contextsec', 'context sec', 'context-sec'],
    merriv: ['merriv'], 'ai-repo-gardener': ['ai repo gardener', 'ai-repo-gardener', 'repo gardener', 'gardener'],
    psg: ['project state graph', 'psg'], noveltyaudit: ['noveltyaudit', 'novelty audit', 'novelty-audit'],
    'research-meeting-coach': ['research meeting coach', 'research-meeting-coach', 'meeting coach'],
    chromarecover: ['chromarecover', 'chroma recover', 'chroma']
  };
  const TOPICS = {
    zerostel: 'agent agents coding agent claude code codex undo rewind rollback snapshot checkpoint timeline zero trust 復原 還原 回溯 快照 時間軸 零信任 刪檔 代理',
    'adversarial-lab': 'adversarial attack attacks robustness classifier security fgsm pgd perturbation 對抗 攻擊 擾動 穩健 分類器 資安 安全 試玩',
    lumigrid: 'low light low-light night dark enhancement brighten denoise exposure computer vision image photo 低光 夜景 暗 增亮 提亮 曝光 影像 照片 電腦視覺',
    'taiwan-exam': 'exam exams test gsat cap education pdf 考試 考卷 學測 會考 出題 題目 教育 模擬考 試題',
    kcrashlab: 'windows driver drivers kernel crash reliability reproducible simulation 驅動 驅動程式 核心 當機 可靠性 模擬 重現',
    contextsec: 'security ai security coding agent agents controls risk product security 安全 資安 程式代理 風險 控制',
    merriv: 'model release deploy evaluation regression provenance statistics machine learning 模型 發布 部署 評估 回歸 統計',
    'ai-repo-gardener': 'python repository static analysis dead code cleanup delete 儲存庫 靜態分析 清理 刪除 程式碼',
    psg: 'agent governance mcp coding agents tasks review worktree 代理 治理 任務 審查 工作流',
    noveltyaudit: 'novelty papers scholarly literature citation prior art research audit 論文 新穎性 文獻 引用 學術 審查',
    'research-meeting-coach': 'meeting advisor research progress weekly report 開會 導師 會議 研究進度 報告 教授',
    chromarecover: 'computer vision vision color image images pixel recovery 電腦視覺 視覺 影像 圖片 色彩 顏色 還原'
  };
  // Projects with a page that runs in the browser.
  const LABS = {'adversarial-lab': '/lab/adversarial/', lumigrid: '/lab/lumigrid/', chromarecover: '/lab/chromarecover/'};

  const C = {
    en: {
      compareAsk: 'Which two projects should I compare? For example: “What’s the difference between PSG and ContextSec?”',
      sameCat: (a, b, cat) => `Both are ${cat} projects; the difference is the problem each one tackles (above).`,
      diffCat: (a, b, ca, cb) => `In short: ${a} is about ${ca}, ${b} about ${cb}.`,
      detail: (p) => `${p.name} (${p.category} · ${p.status}): ${p.description}`,
      status: (p) => `${p.name} is at “${p.status}”.`, evidenceLead: 'Evidence: ',
      evidence: (p) => `What backs ${p.name}: ${p.evidence}`, link: (p) => `${p.name}’s source is on GitHub: ${p.url}`,
      list: (n) => `There are ${n} projects:`, latest: (p) => `The newest project is ${p.name} (${p.category} · ${p.status}): `,
      latestNote: 'The project list runs from newest to oldest.', topic: (cat) => `${cat} projects:`, topicSome: 'These look related:', topicNone: (cats) => `I couldn’t match that to a project. The categories are: ${cats}. Which one interests you?`,
      recommend: (p) => `I’d start with ${p.name} (${p.category}): `, playable: (list) => `These run right in your browser: ${list}. Everything runs on your device; nothing is uploaded.`,
      blogLatest: (p) => `The newest post is “${p.title}” (${p.date}): `, blogPrev: (p) => `Before that: “${p.title}” (${p.date}).`,
      papers: 'Recent paper notes:', found: (p) => `Yes: “${p.title}” (${p.date}): `, alsoFound: 'Also: ', notFound: 'The blog hasn’t covered that yet.',
      features: (n, th) => `This site is a little terminal: browse ${n} projects (some run right in your browser), read the blog and paper notes, download mock exams from the exam gallery, leave a note in the guestbook, switch between ${th} styles, or chat with me, feed me and play with me.`,
      yuki: 'I’m Yuki! You can pat me, feed me, play with me and watch me perform. Taking care of me earns experience, and every level from 2 to 10 unlocks something (a dance, a feather wand, instruments, snacks, sparkles, a golden badge). I get hungry, tired and sulky too: when a need hits zero, please look after me. My menu can also turn me into a cat and change my outfit.',
      models: 'Chat has three modes, switched at the top of this window:\n• Fast: the original small model; knows the common questions; fastest.\n• Trained: answers projects, comparisons, the blog and the site’s features, straight from the site data; also instant.\n• Yuki 1.5B: a real language model that writes its own sentences. It downloads about 880 MB once and runs on your graphics card; on built-in graphics it is very slow, and it isn’t meant for phones.',
      themes: (th) => `There are ${th} styles. Use the palette button at the top right, or just tell me, e.g. “switch to sakura”.`,
      guestbook: 'The guestbook has its own page. Notes are shown once Niansia approves them.',
      exams: 'The exam gallery lets you preview and download mock exams people have shared (question booklet + worked solutions), and you can upload your own with the form on that page.',
      community: (names, total) => `Niansia runs two LINE communities: ${names}, about ${total} members together. Students preparing for the 2027 GSAT and AST are welcome.`,
      search: 'Press Ctrl+K (⌘K on a Mac) to search projects, pages and commands, or type help in the terminal below to see every command.',
      brief: 'In a hurry? The one-page brief has the projects and research on a single page.',
      log: 'The research log records every release and milestone; the monthly update on the blog sums each month up.',
      tech: 'The site is generated with Quarto; the main screen is a hand-written terminal in plain JavaScript, hosted on GitHub Pages with the domain on Cloudflare. Both of my models run inside your browser.',
      privacy: 'Our chat is handled inside this page and never sent to a server (the 1.5B model runs on your own graphics card too). The site only keeps anonymous counts of visits and readers online; no cookies, no personal data. Your settings and my state are stored only in your browser.',
      open: 'Open', source: 'Source', try: 'Try it', blog: 'Blog', projects: 'All projects', go: 'Go'
    },
    'zh-TW': {
      compareAsk: '要比較哪兩個作品呢？例如：「PSG 跟 ContextSec 差在哪？」',
      sameCat: (a, b, cat) => `兩個都屬於「${cat}」，差別在上面各自解決的問題。`,
      diffCat: (a, b, ca, cb) => `一句話：${a} 偏向「${ca}」，${b} 偏向「${cb}」。`,
      detail: (p) => `${p.name}（${p.category}・${p.status}）：${p.description}`,
      status: (p) => `${p.name} 目前的狀態是「${p.status}」。`, evidenceLead: '佐證：',
      evidence: (p) => `${p.name} 的佐證：${p.evidence}`, link: (p) => `${p.name} 的原始碼在 GitHub：${p.url}`,
      list: (n) => `一共有 ${n} 項作品：`, latest: (p) => `目前最新的作品是 ${p.name}（${p.category}・${p.status}）：`,
      latestNote: '作品清單是由新到舊排列的。', topic: (cat) => `「${cat}」的作品有：`, topicSome: '找到這些相關的作品：', topicNone: (cats) => `我找不到對應的作品。目前的類別有：${cats}，想看哪一類？`,
      recommend: (p) => `推薦你先看 ${p.name}（${p.category}）：`, playable: (list) => `可以直接在瀏覽器裡玩的有：${list}。全部在你的裝置上執行，不會上傳任何東西。`,
      blogLatest: (p) => `最新一篇是〈${p.title}〉（${p.date}）：`, blogPrev: (p) => `再前一篇是〈${p.title}〉（${p.date}）。`,
      papers: '最近的論文筆記：', found: (p) => `有的，可以看〈${p.title}〉（${p.date}）：`, alsoFound: '另外還有：', notFound: '部落格還沒有寫到這個主題。',
      features: (n, th) => `這個網站是一個小終端：可以看 ${n} 項作品（有些能直接在瀏覽器試玩）、讀部落格和論文筆記、到考卷分享區下載模擬考、在留言板留話，也可以換 ${th} 種風格，或跟我聊天、餵我、陪我玩。`,
      yuki: '我是住在這裡的 Yuki！可以摸摸我、餵我、陪我玩、看我表演；照顧我會累積經驗，從 Lv 2 到 Lv 10 每一級都會解鎖新東西（跳舞、逗貓棒、樂器、點心、光點、金色名牌）。我也會餓、會累、會鬧脾氣，數值歸零的時候要好好照顧我喔。選單裡還能把我變成貓咪、幫我換衣服。',
      models: '聊天有三種模式，在這個視窗上方切換：\n・快速：最原始的小模型，認得常見問題，最快。\n・特訓：專門回答作品、比較、部落格和網站功能，答案直接取自網站資料，一樣很快。\n・Yuki 1.5B：真正會自己造句的語言模型，第一次要下載約 880 MB，跑在你的顯示卡上；用內建顯示卡會很慢，手機不建議。',
      themes: (th) => `目前有 ${th} 種風格，按右上角的調色盤就能換，或直接跟我說「換成櫻花」之類的。`,
      guestbook: '留言板有自己的頁面，留言經過 Niansia 確認後就會公開。',
      exams: '考卷分享區可以預覽、下載大家分享的模擬考（題本＋詳解），也可以用頁面上的表單上傳自己的考卷。',
      community: (names, total) => `Niansia 是兩個 LINE 社群的管理員：${names}，合計約 ${total} 人，準備 116 學測、分科的同學歡迎加入。`,
      search: '按 Ctrl＋K（Mac 是 ⌘K）可以搜尋作品、頁面和指令；也可以在下面的終端輸入 help，看所有指令。',
      brief: '趕時間的話，看「一頁式簡介」，一頁就能讀完作品和研究重點。',
      log: '「研究日誌」記錄每次上線和重要進度；每個月的近況也會寫在部落格的月報。',
      tech: '網站用 Quarto 產生，主畫面是自己寫的終端介面（純 JavaScript），放在 GitHub Pages，網域在 Cloudflare。我的兩個模型都在你的瀏覽器裡運作。',
      privacy: '我們的對話都在這個頁面裡處理，不會傳到任何伺服器（1.5B 也是跑在你自己的顯示卡上）。網站只記錄匿名的造訪次數和線上人數，沒有 cookie、不收個資；你的設定和我的狀態只存在你的瀏覽器裡。',
      open: '打開', source: '原始碼', try: '試玩', blog: '部落格', projects: '全部作品', go: '前往'
    },
    'zh-CN': {
      compareAsk: '要比较哪两个作品呢？例如：“PSG 跟 ContextSec 差在哪？”',
      sameCat: (a, b, cat) => `两个都属于“${cat}”，差别在上面各自解决的问题。`,
      diffCat: (a, b, ca, cb) => `一句话：${a} 偏向“${ca}”，${b} 偏向“${cb}”。`,
      detail: (p) => `${p.name}（${p.category}・${p.status}）：${p.description}`,
      status: (p) => `${p.name} 目前的状态是“${p.status}”。`, evidenceLead: '佐证：',
      evidence: (p) => `${p.name} 的佐证：${p.evidence}`, link: (p) => `${p.name} 的源代码在 GitHub：${p.url}`,
      list: (n) => `一共有 ${n} 项作品：`, latest: (p) => `目前最新的作品是 ${p.name}（${p.category}・${p.status}）：`,
      latestNote: '作品列表是由新到旧排列的。', topic: (cat) => `“${cat}”的作品有：`, topicSome: '找到这些相关的作品：', topicNone: (cats) => `我找不到对应的作品。目前的类别有：${cats}，想看哪一类？`,
      recommend: (p) => `推荐你先看 ${p.name}（${p.category}）：`, playable: (list) => `可以直接在浏览器里玩的有：${list}。全部在你的设备上运行，不会上传任何东西。`,
      blogLatest: (p) => `最新一篇是《${p.title}》（${p.date}）：`, blogPrev: (p) => `再前一篇是《${p.title}》（${p.date}）。`,
      papers: '最近的论文笔记：', found: (p) => `有的，可以看《${p.title}》（${p.date}）：`, alsoFound: '另外还有：', notFound: '博客还没有写到这个主题。',
      features: (n, th) => `这个网站是一个小终端：可以看 ${n} 项作品（有些能直接在浏览器试玩）、读博客和论文笔记、到考卷分享区下载模拟考、在留言板留话，也可以换 ${th} 种风格，或跟我聊天、喂我、陪我玩。`,
      yuki: '我是住在这里的 Yuki！可以摸摸我、喂我、陪我玩、看我表演；照顾我会累积经验，从 Lv 2 到 Lv 10 每一级都会解锁新东西（跳舞、逗猫棒、乐器、点心、光点、金色名牌）。我也会饿、会累、会闹脾气，数值归零的时候要好好照顾我哦。菜单里还能把我变成猫咪、帮我换衣服。',
      models: '聊天有三种模式，在这个窗口上方切换：\n・快速：最原始的小模型，认得常见问题，最快。\n・特训：专门回答作品、比较、博客和网站功能，答案直接取自网站资料，一样很快。\n・Yuki 1.5B：真正会自己造句的语言模型，第一次要下载约 880 MB，跑在你的显卡上；用集成显卡会很慢，手机不建议。',
      themes: (th) => `目前有 ${th} 种风格，按右上角的调色盘就能换，或直接跟我说“换成樱花”之类的。`,
      guestbook: '留言板有自己的页面，留言经过 Niansia 确认后就会公开。',
      exams: '考卷分享区可以预览、下载大家分享的模拟考（题本＋详解），也可以用页面上的表单上传自己的考卷。',
      community: (names, total) => `Niansia 是两个 LINE 社群的管理员：${names}，合计约 ${total} 人，准备 116 学测、分科的同学欢迎加入。`,
      search: '按 Ctrl＋K（Mac 是 ⌘K）可以搜索作品、页面和指令；也可以在下面的终端输入 help，看所有指令。',
      brief: '赶时间的话，看“一页式简介”，一页就能读完作品和研究重点。',
      log: '“研究日志”记录每次上线和重要进度；每个月的近况也会写在博客的月报。',
      tech: '网站用 Quarto 生成，主画面是自己写的终端界面（纯 JavaScript），放在 GitHub Pages，域名在 Cloudflare。我的两个模型都在你的浏览器里运行。',
      privacy: '我们的对话都在这个页面里处理，不会传到任何服务器（1.5B 也是跑在你自己的显卡上）。网站只记录匿名的访问次数和在线人数，没有 cookie、不收个资；你的设置和我的状态只存在你的浏览器里。',
      open: '打开', source: '源代码', try: '试玩', blog: '博客', projects: '全部作品', go: '前往'
    }
  };

  let model = null, loading = null, s2t = new Map(), indexes = null;
  const b64 = text => Uint8Array.from(atob(text), ch => ch.charCodeAt(0));
  const floats = text => new Float32Array(b64(text).buffer);
  /* Feature extraction mirrors tools/train_yuki_brain.py (checked against the probe vectors in pro.json). */
  function normalise(text) {
    let out = '';
    for (const ch of String(text).normalize('NFKC').toLowerCase()) out += s2t.get(ch) || ch;
    return out.replace(/[^0-9a-z㐀-鿿-]+/g, ' ').trim();
  }
  const latin = token => /^[0-9a-z]+$/.test(token);
  function features(text) {
    const toks = normalise(text).match(/[0-9a-z]+|[㐀-鿿-]/g) || [], out = [];
    toks.forEach((tok, i) => {
      const next = toks[i + 1];
      if (!latin(tok)) { out.push('c:' + tok); if (next && !latin(next)) out.push('b:' + tok + next); return; }
      out.push('w:' + tok);
      if (next && latin(next)) out.push('p:' + tok + '_' + next);
      const padded = '^' + tok + '$';
      if (tok.length >= 3) for (let j = 0; j < padded.length - 2; j++) out.push('g:' + padded.slice(j, j + 3));
    });
    return out.length ? out : ['w:'];
  }
  function fnv(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
    return h;
  }
  function load(url = '/assets/yuki/pro.json?v=1') {
    if (model) return Promise.resolve(model);
    if (loading) return loading;
    loading = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(raw => {
      const chars = [...raw.s2t];
      for (let i = 0; i < chars.length; i += 2) s2t.set(chars[i], chars[i + 1]);
      const rows = new Uint16Array(b64(raw.rows).buffer), rowOf = new Map();
      rows.forEach((bucket, i) => rowOf.set(bucket, i));
      model = {...raw, rowOf, embed: new Int8Array(b64(raw.embed).buffer), query: floats(raw.query), w1: floats(raw.w1), b1: floats(raw.b1), w2: floats(raw.w2), b2: floats(raw.b2)};
      return model;
    });
    loading.catch(() => { loading = null; });
    return loading;
  }
  function classify(text) {
    const {dim: d, hidden: H, intents, rowOf, embed, scale, query, w1, b1, w2, b2, buckets} = model;
    const rows = features(text).map(f => rowOf.get(fnv(f) % buckets)).filter(r => r !== undefined);
    if (!rows.length) return {intent: 'other', confidence: 1};
    const vectors = rows.map(r => { const v = new Float32Array(d); for (let k = 0; k < d; k++) v[k] = embed[r * d + k] * scale; return v; });
    const scores = vectors.map(v => { let s = 0; for (let k = 0; k < d; k++) s += v[k] * query[k]; return s / Math.sqrt(d); });
    const max = Math.max(...scores), weights = scores.map(s => Math.exp(s - max)), total = weights.reduce((a, b) => a + b, 0);
    const pooled = new Float32Array(d);
    vectors.forEach((v, i) => { for (let k = 0; k < d; k++) pooled[k] += v[k] * (weights[i] / total + 1 / vectors.length); });
    const hidden = new Float32Array(H);
    for (let j = 0; j < H; j++) { let s = b1[j]; for (let k = 0; k < d; k++) s += w1[j * d + k] * pooled[k]; hidden[j] = s > 0 ? s : 0; }
    const logits = intents.map((_, c) => { let s = b2[c]; for (let j = 0; j < H; j++) s += w2[c * H + j] * hidden[j]; return s; });
    const top = Math.max(...logits), exp = logits.map(l => Math.exp(l - top)), sum = exp.reduce((a, b) => a + b, 0);
    const ranked = intents.map((name, i) => [name, exp[i] / sum]).sort((a, b) => b[1] - a[1]);
    return {intent: ranked[0][0], confidence: ranked[0][1]};
  }
  /* Every project mention, in order, replaced by `zproj` as in training. Names come from the data, so new projects count. */
  function mark(text, projects) {
    let norm = ' ' + normalise(text) + ' ';
    const names = new Map();
    Object.entries(ALIASES).forEach(([id, list]) => list.forEach(a => names.set(normalise(a), id)));
    Object.values(projects).flat().forEach(p => { names.set(normalise(p.name), p.id); names.set(normalise(p.id.replace(/-/g, ' ')), p.id); });
    const found = [];
    [...names.keys()].filter(Boolean).sort((a, b) => b.length - a.length).forEach(alias => {
      const re = latin(alias.replace(/ /g, '')) ? new RegExp(`(^|[^0-9a-z])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^0-9a-z]|$)`, 'g') : null;
      let m;
      while ((m = re ? re.exec(norm) : (norm.indexOf(alias) >= 0 ? {index: norm.indexOf(alias), 1: ''} : null))) {
        const start = m.index + (m[1] || '').length;
        found.push({id: names.get(alias), at: start});
        norm = norm.slice(0, start) + ' zproj ' + norm.slice(start + alias.length);
        if (re) re.lastIndex = start + 7;
      }
    });
    const ids = [...new Set(found.sort((a, b) => a.at - b.at).map(f => f.id))];
    return {text: norm.replace(/\s+/g, ' ').trim(), ids};
  }
  /* TF-IDF retrieval over projects and blog posts (rebuilt when the data or the language changes). */
  function tokens(text) {
    const out = [], norm = normalise(text);
    (norm.match(/[0-9a-z]+/g) || []).forEach(w => { if (w.length > 1) out.push(w.replace(/(ies|s)$/, m => m === 'ies' ? 'y' : '')); });
    norm.replace(/[^㐀-鿿]+/g, ' ').split(' ').filter(Boolean).forEach(run => { for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2)); if (run.length === 1) out.push(run); });
    return out;
  }
  // Question words carry no topic: without them "did you write about X" would match whichever post says "you" or "write".
  const STOP = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'about', 'any', 'is', 'are', 'was', 'were', 'what', 'which', 'did', 'do', 'does',
    'you', 'your', 'he', 'his', 'she', 'niansia', 'yuki', 'write', 'wrote', 'written', 'read', 'think', 'have', 'has', 'there', 'on', 'of', 'in', 'to',
    'me', 'show', 'tell', 'can', 'post', 'article', 'note', 'blog', 'project', 'zproj', 'stuff', 'thing', 'work', 'something', 'anything',
    '作品', '專案', '項目', '有關', '關於', '什麼', '哪個', '有沒', '沒有', '一個', '的作', '文章', '筆記', '心得', '寫過', '有寫', '部落', '落格',
    '有讀', '讀過', '你對', '怎麼', '怎看', '他對', '相關', '的文', '的心', '的筆', '過關', '寫到', '提到', '有提']);
  function buildIndex(docs) {
    docs.forEach(doc => { doc.tf = new Map(); tokens(doc.text).filter(t => !STOP.has(t)).forEach(t => doc.tf.set(t, (doc.tf.get(t) || 0) + 1)); });
    const df = new Map(); docs.forEach(doc => doc.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
    docs.forEach(doc => {
      doc.w = new Map(); let n = 0;
      doc.tf.forEach((c, t) => { const w = (1 + Math.log(c)) * Math.log(1 + docs.length / df.get(t)); doc.w.set(t, w); n += w * w; });
      doc.norm = Math.sqrt(n) || 1;
    });
    return {docs, df};
  }
  function search(idx, query) {
    const q = new Map();
    tokens(query).filter(t => !STOP.has(t) && idx.df.has(t)).forEach(t => q.set(t, (q.get(t) || 0) + 1));
    if (!q.size) return [];
    let qn = 0; q.forEach((c, t) => { const w = (1 + Math.log(c)) * Math.log(1 + idx.docs.length / idx.df.get(t)); q.set(t, w); qn += w * w; });
    qn = Math.sqrt(qn);
    return idx.docs.map(doc => { let dot = 0; q.forEach((w, t) => { dot += w * (doc.w.get(t) || 0); }); return {ref: doc.ref, score: dot / (qn * doc.norm)}; })
      .filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }
  function indexesFor(L) {
    const projects = window.NIANSIA_PROJECTS?.[L] || [], posts = window.NIANSIA_BLOG?.posts?.[L] || [];
    const key = L + projects.length + ':' + posts.length;
    if (indexes?.key === key) return indexes;
    const all = Object.values(window.NIANSIA_PROJECTS || {}).flat();
    indexes = {key,
      projects: buildIndex(projects.map(p => ({ref: p, text: [TOPICS[p.id] || '', ...all.filter(x => x.id === p.id).map(x => `${x.name} ${x.category} ${x.category} ${x.description}`)].join(' ')}))),
      posts: buildIndex(posts.map(p => ({ref: p, text: `${p.title} ${p.title} ${p.description} ${(p.tags || []).join(' ')} ${(p.tags || []).join(' ')} ${p.paper || ''}`})))};
    return indexes;
  }

  const first = text => (String(text).match(/^.+?[。！？]|^.+?[.!?](?=\s|$)/) || [text])[0];
  const loc = L => L === 'en' ? 'en' : L.toLowerCase();
  const join = (L, list) => list.join(L === 'en' ? ', ' : '、');
  const head = (L, p, status = true) => L === 'en' ? `${p.name} (${p.category}${status ? ` · ${p.status}` : ''}): ` : `${p.name}（${p.category}${status ? `・${p.status}` : ''}）：`;
  const dot = L => L === 'en' ? '•' : '・';
  const short = (text, n) => text.length > n ? text.slice(0, n - 1) + '…' : text;
  function answer(raw, ctx = {}) {
    if (!model) return null;
    const L = ctx.locale || 'en', c = C[L] || C.en;
    const projects = window.NIANSIA_PROJECTS?.[L] || [];
    const byId = id => projects.find(p => p.id === id);
    const {text, ids} = mark(raw, window.NIANSIA_PROJECTS || {});
    const {intent, confidence} = classify(text);
    if (intent === 'other' || confidence < .45) return null;
    const ix = indexesFor(L);
    const linkP = p => ({label: `${p.name}`, project: p.id});
    const src = p => ({label: c.source, href: p.url});
    const one = () => byId(ids[0]) || byId(ctx.projectId) || (search(ix.projects, raw)[0]?.score > .12 ? search(ix.projects, raw)[0].ref : null);
    const out = (t, links = [], extra = {}) => ({text: t, links, intent, confidence, ...extra});
    switch (intent) {
      case 'p_compare': {
        let [a, b] = ids.map(byId).filter(Boolean);
        if (a && !b && ctx.projectId && ctx.projectId !== a.id) b = byId(ctx.projectId);
        if (!a || !b) return out(c.compareAsk, projects.slice(0, 4).map(linkP));
        const tail = a.category === b.category ? c.sameCat(a.name, b.name, a.category) : c.diffCat(a.name, b.name, a.category, b.category);
        return out(`${head(L, a)}${first(a.description)}\n${head(L, b)}${first(b.description)}\n${tail}`, [linkP(a), linkP(b)]);
      }
      case 'p_detail': { const p = one(); return p ? out(c.detail(p), [linkP(p), src(p)], {open: p.id}) : null; }
      case 'p_status': { const p = one(); return p ? out(`${c.status(p)}${p.evidence ? (L === 'en' ? ' ' : '') + c.evidenceLead + first(p.evidence) : ''}`, [linkP(p)]) : null; }
      case 'p_evidence': { const p = one(); return p ? out(c.evidence(p), [linkP(p), ...(p.reference ? [{label: p.referenceLabel || c.source, href: p.reference}] : [])]) : null; }
      case 'p_link': { const p = one(); return p ? out(c.link(p), [src(p), linkP(p)]) : null; }
      case 'p_list': {
        const groups = new Map(); projects.forEach(p => groups.set(p.category, [...(groups.get(p.category) || []), p.name]));
        return out(`${c.list(projects.length)}\n${[...groups].map(([cat, names]) => `${dot(L)} ${cat}${L === 'en' ? ': ' : '：'}${join(L, names)}`).join('\n')}`, [{label: c.projects, view: 'projects'}]);
      }
      case 'p_category': case 'p_recommend': {
        const hits = search(ix.projects, raw).filter(r => r.score > .1).slice(0, 3);
        if (intent === 'p_recommend' && !hits.length) {
          const pool = projects.filter(p => !(ctx.seen || []).includes(p.id) && p.id !== ctx.projectId), p = pool[0] || projects[0];
          return p ? out(c.recommend(p) + first(p.description), [linkP(p)], {open: p.id}) : null;
        }
        if (!hits.length) return out(c.topicNone(join(L, [...new Set(projects.map(p => p.category))])), [{label: c.projects, view: 'projects'}]);
        if (intent === 'p_recommend') { const p = hits[0].ref; return out(c.recommend(p) + first(p.description), [linkP(p)], {open: p.id}); }
        const cats = [...new Set(hits.map(h => h.ref.category))];
        return out(`${cats.length === 1 ? c.topic(cats[0]) : c.topicSome}\n${hits.map(h => `${dot(L)} ${head(L, h.ref, false)}${first(h.ref.description)}`).join('\n')}`, hits.map(h => linkP(h.ref)));
      }
      case 'p_latest': { const p = projects[0]; return p ? out(`${c.latest(p)}${first(p.description)}\n${c.latestNote}`, [linkP(p), src(p)], {open: p.id}) : null; }
      case 'p_playable': {
        const list = projects.filter(p => LABS[p.id]);
        return out(c.playable(join(L, list.map(p => p.name))), list.map(p => ({label: `${c.try} ${p.name}`, href: LABS[p.id]})));
      }
      case 'b_latest': {
        const posts = (window.NIANSIA_BLOG?.posts?.[L] || []).filter(p => p.type !== 'qa');
        if (!posts.length) return null;
        const [p, q] = posts;
        return out(`${c.blogLatest(p)}${first(p.description)}${q ? '\n' + c.blogPrev(q) : ''}`, [{label: `${short(p.title, 26)}`, href: `/blog/${loc(L)}/${p.slug}/`}, {label: c.blog, href: `/blog/${loc(L)}/`}]);
      }
      case 'b_papers': {
        const posts = (window.NIANSIA_BLOG?.posts?.[L] || []).filter(p => p.type === 'paper').slice(0, 5);
        if (!posts.length) return null;
        return out(`${c.papers}\n${posts.map(p => `${L === 'en' ? '•' : '・'} ${p.date}  ${p.title}`).join('\n')}`, [{label: c.blog, href: `/blog/${loc(L)}/`}]);
      }
      case 'b_search': {
        const hits = search(ix.posts, raw).filter(r => r.score > .08).slice(0, 3);
        if (!hits.length) return out(c.notFound, [{label: c.blog, href: `/blog/${loc(L)}/`}]);
        const [h, ...rest] = hits.map(r => r.ref);
        return out(`${c.found(h)}${first(h.description)}${rest.length ? '\n' + c.alsoFound + rest.map(p => L === 'en' ? `“${p.title}”` : L === 'zh-CN' ? `《${p.title}》` : `〈${p.title}〉`).join(L === 'en' ? ', ' : '、') : ''}`,
          hits.map(r => ({label: `${short(r.ref.title, 26)}`, href: `/blog/${loc(L)}/${r.ref.slug}/`})));
      }
      case 's_features': return out(c.features(projects.length, ctx.themes || 13), [{label: c.projects, view: 'projects'}, {label: c.blog, view: 'blog'}]);
      case 's_yuki': return out(c.yuki);
      case 's_models': return out(c.models, [], {models: true});
      case 's_themes': return out(c.themes(ctx.themes || 13), [], {styles: true});
      case 's_guestbook': return out(c.guestbook, [{label: `${c.go}`, view: 'guestbook'}]);
      case 's_exams': return out(c.exams, [{label: `${c.go}`, href: `/exams/${L === 'zh-CN' ? 'zh-cn' : 'zh-tw'}/`}]);
      case 's_community': {
        const cm = window.NIANSIA_COMMUNITY, groups = cm?.groups || [];
        if (!groups.length) return null;
        const total = Math.floor(groups.reduce((s, g) => s + (g.members || 0), 0) / 100) * 100;
        return out(c.community(join(L, groups.map(g => L === 'en' ? `“${g.name}”` : `「${g.name}」`)), total.toLocaleString(L)),
          groups.filter(g => /^https:\/\/line\.me\/ti\/g2\//.test(g.url)).map(g => ({label: `${short(g.name, 14)}`, href: g.url})));
      }
      case 's_search': return out(c.search);
      case 's_brief': return out(c.brief, [{label: `${c.go}`, href: L === 'en' ? '/brief/' : `/brief/${loc(L)}/`}]);
      case 's_log': return out(c.log, [{label: `${c.go}`, href: `/log/${loc(L)}/`}]);
      case 's_tech': return out(c.tech);
      case 's_privacy': return out(c.privacy);
      default: return null;
    }
  }
  window.YukiPro = {
    load, answer, ready: () => !!model, features, fnv, mark: text => mark(text, window.NIANSIA_PROJECTS || {}),
    info: () => model ? {intents: model.intents.length, params: model.params, metrics: model.metrics} : null
  };
})();
