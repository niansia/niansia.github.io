/* CV / LinkedIn section of the terminal portfolio.

   status: 'hidden'  – no cv.pdf entry anywhere
           'locked'  – cv.pdf is listed with a lock and shows a "not public yet" screen (current)
           'public'  – the one-page CV below, with PDF download and LinkedIn
   While locked, append ?cv=preview to any page URL to see the public layout.

   Everything in this file ships with the public site, so do NOT put the real PDF or private details here
   until you want them public. To publish: put the PDF at /assets/cv/<name>.pdf, fill `pdf` and `linkedin`,
   complete the sections, then set status to 'public'. */
window.NIANSIA_CV = {
  status: 'locked',
  pdf: '',          // e.g. '/assets/cv/niansia-cv.pdf'
  linkedin: '',     // e.g. 'https://www.linkedin.com/in/…'
  updated: '',      // e.g. '2026-10'

  // Timeline sections. Each text field is either a string or {en, 'zh-TW', 'zh-CN'}. Empty sections are skipped.
  education: [
    {period: '', title: {en: 'M.S. in Computer Science', 'zh-TW': '資訊工程碩士', 'zh-CN': '资讯工程硕士'},
     org: {en: 'National Yang Ming Chiao Tung University (NYCU)', 'zh-TW': '國立陽明交通大學', 'zh-CN': '阳明交通大学'},
     detail: {en: 'Currently on a one-year leave.', 'zh-TW': '目前休學一年。', 'zh-CN': '目前休学一年。'}},
    {period: '', title: {en: 'B.S. in Computer Science', 'zh-TW': '資訊工程學士', 'zh-CN': '资讯工程学士'},
     org: {en: 'Yuan Ze University (YZU)', 'zh-TW': '元智大學', 'zh-CN': '元智大学'}, detail: ''},
  ],
  experience: [],   // {period, title, org, detail}
  // Research and projects: ids from portfolio-data.js, shown with their name, category and one-line result.
  projects: ['adversarial-lab', 'lumigrid', 'taiwan-exam', 'kcrashlab', 'noveltyaudit', 'merriv'],
  awards: [],       // {period, title, org, detail}
  skills: {
    en: [['Research', 'computer vision · vision-language models · AI security · evaluation design'], ['ML', 'PyTorch · ONNX · OpenCV · scikit-learn'], ['Engineering', 'Python · C# / .NET · TypeScript · React · WebGL / WebGPU · SQLite · Git']],
    'zh-TW': [['研究', '電腦視覺 · 視覺語言模型 · AI 安全 · 評估設計'], ['機器學習', 'PyTorch · ONNX · OpenCV · scikit-learn'], ['工程', 'Python · C# / .NET · TypeScript · React · WebGL / WebGPU · SQLite · Git']],
    'zh-CN': [['研究', '计算机视觉 · 视觉语言模型 · AI 安全 · 评估设计'], ['机器学习', 'PyTorch · ONNX · OpenCV · scikit-learn'], ['工程', 'Python · C# / .NET · TypeScript · React · WebGL / WebGPU · SQLite · Git']],
  },
};
