/* LINE communities Niansia runs as an admin, for students taking the 116 (2027) GSAT and AST. One source for the about page,
   the home profile line and the exam gallery (tools/build_static.py reads this file). Links are LINE OpenChat invites only
   (https://line.me/ti/g2/…, without tracking parameters); anything else is dropped where they are shown. `icon` picks the
   avatar: assets/icons/yuki-smile.webp or yuki-wave.webp. */
window.NIANSIA_COMMUNITY = {
  role: {en: 'Admin', 'zh-TW': '管理員', 'zh-CN': '管理员'},
  groups: [
    {
      id: 'gsat116', icon: 'smile', name: '116學測、116分科',
      url: 'https://line.me/ti/g2/bumumLmb6sNegq982kyIfKzcQAU8FJWCnKbHNg',
      desc: {en: 'For students taking the 2027 GSAT and AST: exam news and study questions',
        'zh-TW': '116 學測、分科考生的交流群：考試資訊與讀書問題', 'zh-CN': '116 学测、分科考生的交流群：考试资讯与读书问题'}
    },
    {
      id: 'mock116', icon: 'wave', name: '116學測分科模擬考出題討論 #重考 #應屆',
      url: 'https://line.me/ti/g2/hmcFspmBiVnZ1Hh_4zb-zl5YW5CJQxVSMyuRdQ',
      desc: {en: 'Writing and discussing GSAT and AST mock exam questions; retakers and seniors welcome',
        'zh-TW': '學測、分科模擬考出題與討論，重考生和應屆生都歡迎', 'zh-CN': '学测、分科模拟考出题与讨论，重考生和应届生都欢迎'}
    }
  ]
};
