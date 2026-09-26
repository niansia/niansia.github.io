/* Full-size Yuki: a QLoRA fine-tune of Qwen2.5-1.5B-Instruct, quantised to 4 bit and run with
   WebGPU (WebLLM) inside a worker. Loaded only when a visitor asks for it; the small intent
   model in yuki-brain.js keeps working meanwhile and wherever WebGPU is missing.
   The portfolio is placed in the system prompt (built exactly like tools/llm/yuki_prompt.py),
   and every page command the model writes is checked against a whitelist before it runs. */
(() => {
  'use strict';
  const WEBLLM = 'https://esm.run/@mlc-ai/web-llm@0.2.85';
  const MODEL_ID = 'yuki-qwen2.5-1.5b-q4f16_1';
  const MODEL_LIB = 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_84/base/Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm';
  // Published weights; a local override helps testing before the Hugging Face upload.
  const PUBLISHED_URL = 'https://huggingface.co/niansia/yuki-qwen2.5-1.5b-q4f16_1-MLC';
  const store = key => { try { return localStorage.getItem(key); } catch { return null; } };
  // Local testing only: http://localhost:<port>/?yuki-llm=<weights url> points Yuki at unpublished weights.
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    const local = new URLSearchParams(location.search).get('yuki-llm');
    if (local) try { localStorage.setItem('niansia-yuki-llm-url', new URL(local, location.href).href); } catch {}
  }
  const modelUrl = () => (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && store('niansia-yuki-llm-url')) || PUBLISHED_URL;
  const COMMANDS = [
    [/^@open (home|about|projects|research|contact|help)$/], [/^@project ([a-z0-9-]+)$/], [/^@theme (light|dark|sakura|matcha|retro)$/],
    [/^@lang (en|zh-TW|zh-CN)$/], [/^@pet (pat|feed|play|lie|sleep|wake|trick|hide|show)$/], [/^@trail (hearts|paws|stars|petals|off)$/],
    [/^@cursor (s|m|l)$/], [/^@follow (on|off)$/], [/^@motion (on|off)$/]
  ];
  let engine = null, state = 'idle', loading = null, template = null, lastError = '';

  async function support() {
    if (!navigator.gpu) return {ok: false, reason: 'webgpu'};
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return {ok: false, reason: 'webgpu'};
      if (!adapter.features.has('shader-f16')) return {ok: false, reason: 'f16'};
    } catch { return {ok: false, reason: 'webgpu'}; }
    if (!modelUrl()) return {ok: false, reason: 'unpublished'};
    return {ok: true};
  }
  const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  async function prompt(now) {
    if (!template) template = await fetch('/assets/yuki/llm-prompt.json').then(r => r.json());
    const locale = now.lang, copy = window.NIANSIA_COPY[locale];
    const parts = [template.header, fill(template.profile, copy), template.projectsTitle,
      ...window.NIANSIA_PROJECTS[locale].map(p => fill(template.project, p)), fill(template.now, now)];
    return parts.slice(0, 3).join('\n\n') + '\n' + parts.slice(3, -1).join('\n') + '\n\n' + parts.at(-1);
  }
  function load(onProgress) {
    if (engine) return Promise.resolve(engine);
    if (loading) return loading;
    state = 'loading';
    loading = (async () => {
      const webllm = await import(WEBLLM);
      const appConfig = {model_list: [{model: modelUrl(), model_id: MODEL_ID, model_lib: MODEL_LIB, low_resource_required: true, overrides: {context_window_size: 4096}}]};
      const worker = new Worker('/assets/js/yuki-llm-worker.js', {type: 'module'});
      engine = await webllm.CreateWebWorkerMLCEngine(worker, MODEL_ID, {appConfig, initProgressCallback: report => onProgress?.(report)});
      state = 'ready';
      try { localStorage.setItem('niansia-yuki-llm', 'on'); } catch {}
      return engine;
    })();
    loading.catch(error => { state = 'error'; lastError = String(error?.message || error); engine = null; loading = null; });
    return loading;
  }
  /* Command lines come first; everything after the first non-@ line is the reply. */
  function split(raw) {
    const lines = raw.replace(/^\s+/, '').split('\n'), commands = [];
    let i = 0;
    while (i < lines.length && lines[i].trim().startsWith('@')) {
      if (i === lines.length - 1) return {commands, body: '', pending: true};
      commands.push(lines[i].trim()); i++;
    }
    return {commands, body: lines.slice(i).join('\n').trim(), pending: false};
  }
  function validate(commands) {
    const ids = new Set(window.NIANSIA_PROJECTS.en.map(p => p.id));
    return commands.filter(cmd => COMMANDS.some(([re]) => re.test(cmd)) && (!cmd.startsWith('@project') || ids.has(cmd.split(' ')[1]))).slice(0, 3);
  }
  async function reply({text, history = [], now}, onText) {
    if (!engine) throw new Error('not loaded');
    const messages = [{role: 'system', content: await prompt(now)}, ...history.slice(-8), {role: 'user', content: text}];
    const started = performance.now();
    const stream = await engine.chat.completions.create({messages, stream: true, temperature: .3, top_p: .9, max_tokens: 260, frequency_penalty: .1});
    let raw = '';
    for await (const chunk of stream) {
      raw += chunk.choices[0]?.delta?.content || '';
      const part = split(raw);
      if (!part.pending) onText?.(part.body);
    }
    const {commands, body} = split(raw);
    return {raw: raw.trim(), text: body, commands: validate(commands), seconds: (performance.now() - started) / 1000};
  }
  window.YukiLLM = {
    support, load, reply, split, validate,
    ready: () => state === 'ready', state: () => state, error: () => lastError,
    stats: async () => engine ? engine.runtimeStatsText() : '',
    wanted: () => store('niansia-yuki-llm') === 'on',
    published: () => !!modelUrl(),
    label: 'Yuki 1.5B · QLoRA'
  };
})();
