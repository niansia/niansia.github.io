/* Papers in preparation, with live deadline countdowns on research.md and the home screen.
   Only official dates go here; a venue whose deadline is not announced yet keeps deadline: null
   and shows "date TBA". Checked 2026-09-27 against the official conference sites. */
window.NIANSIA_SUBMISSIONS = {
  venues: [
    {
      id: 'cvpr27', venue: 'CVPR 2027', url: 'https://cvpr.thecvf.com/Conferences/2027/Dates',
      topic: {en: 'A topic related to vision-language models (VLM)', 'zh-TW': '視覺語言模型（VLM）相關題目', 'zh-CN': '视觉语言模型（VLM）相关题目'},
      deadline: '2026-11-16T23:59:59-12:00', register: '2026-11-10T23:59:59-12:00',
      meeting: {en: 'June 20–25, 2027 · Seattle', 'zh-TW': '2027/6/20–25 · 西雅圖', 'zh-CN': '2027/6/20–25 · 西雅图'}
    },
    {
      id: 'iccv27', venue: 'ICCV 2027', url: 'https://iccv.thecvf.com/Conferences/2027',
      topic: {en: 'A topic related to Diffusion Transformers (DiT)', 'zh-TW': 'Diffusion Transformer（DiT）相關題目', 'zh-CN': 'Diffusion Transformer（DiT）相关题目'},
      deadline: null, register: null,
      meeting: {en: 'Oct 2–8, 2027 · Hong Kong', 'zh-TW': '2027/10/2–8 · 香港', 'zh-CN': '2027/10/2–8 · 香港'}
    },
    {
      id: 'colm27', venue: 'COLM 2027', url: 'https://colm.cc/',
      topic: {en: 'Planned · topic to be decided', 'zh-TW': '預計投稿 · 題目規劃中', 'zh-CN': '预计投稿 · 题目规划中'},
      deadline: null, register: null, meeting: null
    }
  ],
  copy: {
    en: {title: 'Currently preparing submissions', intro: 'Papers in progress and how long until each deadline (Anywhere on Earth).',
      deadline: 'Paper deadline', register: 'Registration', meeting: 'Conference', tba: 'Date TBA', closed: 'Deadline passed',
      left: (d, h) => `${d}d ${h}h left`, chip: 'Preparing CVPR · ICCV · COLM submissions', next: 'next deadline'},
    'zh-TW': {title: '正在準備投稿', intro: '進行中的論文，以及距離各會議截止還有多久（AoE 時間）。',
      deadline: '論文截止', register: '論文註冊', meeting: '會議日期', tba: '時間未定', closed: '已截止',
      left: (d, h) => `剩 ${d} 天 ${h} 小時`, chip: '準備投稿 CVPR · ICCV · COLM', next: '最近截止'},
    'zh-CN': {title: '正在准备投稿', intro: '进行中的论文，以及距离各会议截止还有多久（AoE 时间）。',
      deadline: '论文截止', register: '论文注册', meeting: '会议日期', tba: '时间未定', closed: '已截止',
      left: (d, h) => `剩 ${d} 天 ${h} 小时`, chip: '准备投稿 CVPR · ICCV · COLM', next: '最近截止'}
  }
};
