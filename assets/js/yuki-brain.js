/* Yuki's on-device brain. A hashed n-gram attention classifier trained by
   tools/train_yuki_brain.py, plus entity extraction and a TF-IDF project retriever.
   Everything runs locally; nothing typed here is sent anywhere. */
(() => {
  'use strict';
  const MARK = {project:'', lang:'', theme:''};
  const PROJECT_ALIASES = {
    zerostel:['zerostel','zero stel','時光機','时光机','行車紀錄器','行车记录仪'],
    'adversarial-lab':['adversarial lab','adversarial-lab','對抗實驗室','对抗实验室'], lumigrid:['lumigrid','lumi grid','lumi-grid'],
    'taiwan-exam':['taiwan exam','taiwan-exam','taiwanexam','學測','学测','模擬考','模拟考','學測模擬考'],
    kcrashlab:['kcrashlab','kcrash lab','kcrash','crashlab'], contextsec:['contextsec','context sec','context-sec'],
    merriv:['merriv'], 'ai-repo-gardener':['ai repo gardener','ai-repo-gardener','repo gardener','gardener'],
    psg:['psg','project state graph'], noveltyaudit:['noveltyaudit','novelty audit','novelty-audit'],
    'research-meeting-coach':['research meeting coach','research-meeting-coach','meeting coach'],
    chromarecover:['chromarecover','chroma recover','chroma']
  };
  // Extra retrieval vocabulary so topical questions ("anything about drivers?") find the right project.
  const PROJECT_TOPICS = {
    zerostel:'agent agents coding agent claude code codex undo rewind rollback snapshot checkpoint timeline zero trust 復原 還原 回溯 快照 時間軸 零信任 刪檔 代理',
    'adversarial-lab':'adversarial attack attacks robustness classifier fgsm pgd perturbation mnist 對抗 攻擊 擾動 穩健 分類器 試玩',
    'taiwan-exam':'exam exams test gsat cap education pdf 考試 考卷 學測 會考 出題 題目 教育 模擬考 試題',
    kcrashlab:'windows driver drivers kernel crash reliability reproducible simulation 驅動 驅動程式 核心 當機 可靠性 模擬 重現',
    contextsec:'security ai security coding agent agents controls risk product security 安全 資安 程式代理 風險 控制',
    merriv:'model release deploy evaluation regression provenance statistics 模型 發布 部署 評估 回歸 統計',
    'ai-repo-gardener':'python repository static analysis dead code cleanup delete 儲存庫 靜態分析 清理 刪除 程式碼',
    psg:'agent governance mcp coding agents tasks review worktree 代理 治理 任務 審查 工作流',
    noveltyaudit:'novelty papers scholarly literature citation prior art research audit 論文 新穎性 文獻 引用 學術 審查',
    'research-meeting-coach':'meeting advisor research progress weekly report 開會 導師 會議 研究進度 報告 教授',
    lumigrid:'low light low-light night dark enhancement enhance brighten denoise exposure ntire zero-dce curve grid photo 低光 夜景 暗 增亮 提亮 去噪 曝光 曲線 網格 夜拍',
    chromarecover:'computer vision vision color image images pixel recovery 電腦視覺 視覺 影像 圖片 色彩 顏色 還原'
  };
  const LANG_ALIASES = [
    ['zh-TW',['繁體中文','繁体中文','正體中文','繁體','繁体','繁中','正體','traditional chinese','traditional','zh tw','台灣中文']],
    ['zh-CN',['簡體中文','简体中文','簡體','简体','簡中','简中','simplified chinese','simplified','zh cn','大陸中文']],
    ['en',['english','英文','英語','英语','英文版']], ['zh-TW',['中文','chinese','華語','国语','國語']]
  ];
  const THEME_ALIASES = [
    ['glass-night',['glass-night','夜玻璃','深色玻璃','dark glass','night glass']],
    ['glass',['glass','玻璃','毛玻璃','液態玻璃','液态玻璃','ios','apple','蘋果','苹果','glassmorphism','透明']],
    ['yozakura',['yozakura','夜櫻','夜樱','夜桜','night sakura']],
    ['fuji',['fuji','wisteria','藤','紫藤','藤色','紫色','purple']],
    ['aizome',['aizome','indigo','藍染','蓝染','藍色','蓝色','靛藍','靛蓝','blue']],
    ['momiji',['momiji','maple','紅葉','红叶','楓','枫','秋天','autumn','orange']],
    ['washi',['washi','和紙','和纸','紙','纸','paper','墨','sumi']],
    ['asagi',['asagi','淺蔥','浅葱','teal','水色','青綠','青绿']],
    ['sakura',['sakura','櫻花','樱花','粉紅','粉红','粉色','pink','cherry blossom','cherry']],
    ['matcha',['matcha','抹茶','綠色','绿色','薄荷','mint','green']],
    ['retro',['retro','復古','复古','crt','駭客','黑客','hacker','matrix','終端綠','terminal green']],
    ['dark',['dark','深色','暗色','黑色','夜間','夜间','暗黑','黑暗','ink','墨夜']],
    ['light',['light','淺色','浅色','亮色','白色','日間','日间','白天','明亮','porcelain','瓷白']]
  ];
  let model = null, loading = null, s2t = new Map(), index = null;

  const b64 = text => Uint8Array.from(atob(text), ch => ch.charCodeAt(0));
  const floats = text => { const bytes = b64(text); return new Float32Array(bytes.buffer); };
  function normalise(text) {
    let out = '';
    for (const ch of String(text).normalize('NFKC').toLowerCase()) out += s2t.get(ch) || ch;
    return out.replace(/[^0-9a-z㐀-鿿-]+/g, ' ').trim();
  }
  const latin = token => /^[0-9a-z]+$/.test(token);
  function features(text) {
    const toks = normalise(text).match(/[0-9a-z]+|[㐀-鿿-]/g) || [], out = [];
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
  function load(url = '/assets/yuki/brain.json') {
    if (model) return Promise.resolve(model);
    if (loading) return loading;
    loading = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(raw => {
      for (let i = 0; i < raw.s2t.length; i += 2) s2t.set(raw.s2t[i], raw.s2t[i + 1]);
      const rows = new Uint16Array(b64(raw.rows).buffer), embed = new Int8Array(b64(raw.embed).buffer), rowOf = new Map();
      rows.forEach((bucket, i) => rowOf.set(bucket, i));
      model = { ...raw, rowOf, embed, query: floats(raw.query), w1: floats(raw.w1), b1: floats(raw.b1), w2: floats(raw.w2), b2: floats(raw.b2) };
      index = null;
      return model;
    });
    loading.catch(() => { loading = null; });
    return loading;
  }
  function classify(text) {
    if (!model) return null;
    const {dim: d, hidden: H, intents, rowOf, embed, scale, query, w1, b1, w2, b2, buckets} = model;
    const rows = features(text).map(f => rowOf.get(fnv(f) % buckets)).filter(r => r !== undefined);
    if (!rows.length) return {intent: 'oos', confidence: 1, known: 0, top: [['oos', 1]]};
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
    return {intent: ranked[0][0], confidence: ranked[0][1], known: rows.length, top: ranked.slice(0, 3)};
  }
  /* Replace entity mentions with the placeholder marks the model was trained on. */
  function extract(text) {
    let norm = ' ' + normalise(text) + ' ';
    const found = {};
    const take = (kind, value, alias) => {
      const a = normalise(alias); if (!a) return false;
      let start = -1;
      if (latin(a.replace(/ /g, ''))) {
        const hit = new RegExp(`(^|[^0-9a-z])${a}(?=[^0-9a-z]|$)`).exec(norm);
        if (hit) start = hit.index + hit[1].length;
      } else start = norm.indexOf(a);
      if (start < 0) return false;
      norm = norm.slice(0, start) + ' ' + MARK[kind] + ' ' + norm.slice(start + a.length);
      found[kind] = found[kind] || value;
      return true;
    };
    Object.entries(PROJECT_ALIASES).forEach(([id, list]) => [...list].sort((a, b) => b.length - a.length).some(alias => take('project', id, alias)));
    LANG_ALIASES.forEach(([code, list]) => [...list].sort((a, b) => b.length - a.length).some(alias => take('lang', code, alias)));
    THEME_ALIASES.forEach(([name, list]) => [...list].sort((a, b) => b.length - a.length).some(alias => take('theme', name, alias)));
    return {...found, text: norm.replace(/\s+/g, ' ').trim()};
  }
  function tokens(text) {
    const out = [], norm = normalise(text);
    (norm.match(/[0-9a-z]+/g) || []).forEach(w => { if (w.length > 1) out.push(w.replace(/(ies|s)$/, m => m === 'ies' ? 'y' : '')); });
    const cjk = norm.replace(/[^㐀-鿿]+/g, ' ').split(' ').filter(Boolean);
    cjk.forEach(run => { for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2)); if (run.length === 1) out.push(run); });
    return out;
  }
  const STOP = new Set(['the','and','for','with','that','this','into','from','are','its','作品','專案','項目','有關','關於','什麼','哪個','有沒','沒有','一個','的作']);
  function buildIndex(all) {
    const docs = Object.keys(PROJECT_TOPICS).map(id => {
      let text = PROJECT_TOPICS[id] + ' ' + (PROJECT_ALIASES[id] || []).join(' ');
      Object.values(all).forEach(list => { const p = list.find(item => item.id === id); if (p) text += ` ${p.name} ${p.category} ${p.description} ${p.category}`; });
      const tf = new Map(); tokens(text).filter(tok => !STOP.has(tok)).forEach(tok => tf.set(tok, (tf.get(tok) || 0) + 1));
      return {id, tf};
    });
    const df = new Map();
    docs.forEach(doc => doc.tf.forEach((_, tok) => df.set(tok, (df.get(tok) || 0) + 1)));
    docs.forEach(doc => {
      doc.w = new Map(); let norm = 0;
      doc.tf.forEach((count, tok) => { const w = (1 + Math.log(count)) * Math.log(1 + docs.length / df.get(tok)); doc.w.set(tok, w); norm += w * w; });
      doc.norm = Math.sqrt(norm) || 1;
    });
    return {docs, df, size: docs.length};
  }
  function retrieve(query, all) {
    if (!index) index = buildIndex(all);
    const q = new Map();
    tokens(query).filter(tok => !STOP.has(tok) && index.df.has(tok)).forEach(tok => q.set(tok, (q.get(tok) || 0) + 1));
    if (!q.size) return [];
    let qnorm = 0; q.forEach((count, tok) => { const w = (1 + Math.log(count)) * Math.log(1 + index.size / index.df.get(tok)); q.set(tok, w); qnorm += w * w; });
    qnorm = Math.sqrt(qnorm);
    return index.docs.map(doc => { let dot = 0; q.forEach((w, tok) => { dot += w * (doc.w.get(tok) || 0); }); return {id: doc.id, score: dot / (qnorm * doc.norm)}; })
      .filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }
  window.YukiBrain = {
    load, classify, extract, retrieve, features, normalise, fnv,
    ready: () => !!model,
    info: () => model ? {intents: model.intents.length, params: model.params, metrics: model.metrics, dim: model.dim, hidden: model.hidden, rows: model.rowOf.size} : null
  };
})();
