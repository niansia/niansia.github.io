/* Papers: the papers.bib screen in the terminal, the one-page brief and the static paper pages (/paper/<id>/).

   status      'published' | 'accepted' | 'preprint' | 'under-review' | 'in-prep'
   anonymous   true while a double-blind review is running: the title, authors, abstract and links stay hidden
               everywhere (terminal, brief, paper page), and only the venue and research area are shown.
   draft       true keeps an entry out of every public list, the sitemap and search engines. Drafts appear in the
               terminal only with ?papers=preview, and their page is built with a "template preview" banner.
   page        true builds /paper/<id>/ (+ zh-tw/, zh-cn/). Longer sections can live in papers_src/<id>.<lang>.md
               (## headings; zh-CN is converted from zh-TW like the notes).

   Any text field is either a plain string or {en, 'zh-TW', 'zh-CN'}. Manuscripts in preparation are listed from
   submissions-data.js, so they need no entry here until there is something public to link.

   Everything in this file ships with the public site. Do not add an entry under review with anonymous: false. */
window.NIANSIA_PUBS = {
  papers: [
    // Template entry: shows every part of the paper card and page. Replace it with a real paper, or leave it as a draft.
    {
      id: 'example', draft: true, page: true, status: 'preprint', anonymous: false,
      venue: 'VENUE 2027', year: 2027,
      title: {en: 'Paper title: a short, specific claim about what the method does',
              'zh-TW': '論文標題：一句具體說明方法做了什麼的主張',
              'zh-CN': '论文标题：一句具体说明方法做了什么的主张'},
      authors: [{name: 'Niansia', me: true, aff: [1]}, {name: 'Coauthor A', aff: [1]}, {name: 'Advisor B', aff: [1, 2]}],
      affiliations: ['Institution One', 'Institution Two'],
      topics: ['VLM', 'robustness'],
      tldr: {en: 'One sentence a busy reader can repeat: the problem, the idea, and the headline result.',
             'zh-TW': '一句讓忙碌讀者也能轉述的話：問題、想法，以及最重要的結果。',
             'zh-CN': '一句让忙碌读者也能转述的话：问题、想法，以及最重要的结果。'},
      abstract: {en: 'The abstract goes here, exactly as submitted. Two to four short paragraphs are easiest to read on a phone: the problem and why it matters, what is new, how it was evaluated, and what the results show, including where the method does not help.',
                 'zh-TW': '這裡放論文摘要，內容與投稿版本一致。分成二到四段短段落，在手機上最好讀：問題與其重要性、新的地方、如何評估，以及結果顯示了什麼，包括方法沒有幫助的情況。',
                 'zh-CN': '这里放论文摘要，内容与投稿版本一致。分成二到四段短段落，在手机上最好读：问题与其重要性、新的地方、如何评估，以及结果显示了什么，包括方法没有帮助的情况。'},
      highlights: [
        {value: '+0.0', label: {en: 'headline metric', 'zh-TW': '主要指標', 'zh-CN': '主要指标'}},
        {value: '0 / 0', label: {en: 'benchmarks improved', 'zh-TW': '提升的基準', 'zh-CN': '提升的基准'}},
        {value: '0 GPU', label: {en: 'training budget', 'zh-TW': '訓練資源', 'zh-CN': '训练资源'}},
      ],
      teaser: {src: '/assets/publications/template-teaser.svg', alt: 'Teaser figure placeholder',
               caption: {en: 'Teaser figure: the one picture that explains the paper.', 'zh-TW': '示意圖：一張就能說明整篇論文的圖。', 'zh-CN': '示意图：一张就能说明整篇论文的图。'}},
      compare: {before: '/assets/publications/template-before.svg', after: '/assets/publications/template-after.svg',
                label: {en: ['Baseline', 'Ours'], 'zh-TW': ['基準方法', '本文方法'], 'zh-CN': ['基准方法', '本文方法']}},
      links: {paper: '#', arxiv: '#', code: '#', video: '', poster: '', slides: '#'},
      bibtex: '@inproceedings{niansia2027example,\n  title     = {Paper title: a short, specific claim about what the method does},\n  author    = {Niansia and Coauthor A and Advisor B},\n  booktitle = {Venue},\n  year      = {2027}\n}',
    },
  ],
  copy: {
    en: {title: 'Papers & manuscripts', intro: 'Peer-reviewed work, preprints and what is currently in preparation. Papers under double-blind review stay anonymous here until the decision.',
      published: 'Publications', none: 'No peer-reviewed papers yet.', noneBody: 'The first manuscripts are being written now. They will appear here, with code and a project page, once they are public.',
      prep: 'In preparation', blind: 'Title and authors withheld during double-blind review', writing: 'Also writing', count: {pubs: 'papers', prep: 'in preparation', notes: 'research notes'},
      status: {published: 'Published', accepted: 'Accepted', preprint: 'Preprint', 'under-review': 'Under review', 'in-prep': 'In preparation'},
      links: {paper: 'Paper', arxiv: 'arXiv', code: 'Code', project: 'Project page', video: 'Video', poster: 'Poster', slides: 'Slides'},
      bibtex: 'BibTeX', copy: 'Copy', copied: 'BibTeX copied.', exportAll: 'Download all as .bib', preview: 'Preview: template and draft entries are shown. They are hidden on the public site.',
      draft: 'draft', deadline: 'deadline', brief: 'One-page brief for reviewers'},
    'zh-TW': {title: '論文與投稿', intro: '同儕審查論文、預印本，以及正在準備的稿件。雙盲審查中的論文在結果公布前維持匿名。',
      published: '已發表', none: '目前還沒有同儕審查論文。', noneBody: '第一批稿件正在撰寫中。公開後會連同程式碼與專案頁一起放在這裡。',
      prep: '準備中', blind: '雙盲審查期間不公開標題與作者', writing: '其他寫作', count: {pubs: '篇論文', prep: '篇準備中', notes: '篇研究筆記'},
      status: {published: '已發表', accepted: '已接受', preprint: '預印本', 'under-review': '審查中', 'in-prep': '準備中'},
      links: {paper: '論文', arxiv: 'arXiv', code: '程式碼', project: '專案頁', video: '影片', poster: '海報', slides: '投影片'},
      bibtex: 'BibTeX', copy: '複製', copied: '已複製 BibTeX。', exportAll: '下載全部 .bib', preview: '預覽模式：顯示範本與草稿。公開網站上不會出現。',
      draft: '草稿', deadline: '截止', brief: '給審閱者的一頁式簡介'},
    'zh-CN': {title: '论文与投稿', intro: '同行评审论文、预印本，以及正在准备的稿件。双盲评审中的论文在结果公布前保持匿名。',
      published: '已发表', none: '目前还没有同行评审论文。', noneBody: '第一批稿件正在撰写中。公开后会连同代码与项目页一起放在这里。',
      prep: '准备中', blind: '双盲评审期间不公开标题与作者', writing: '其他写作', count: {pubs: '篇论文', prep: '篇准备中', notes: '篇研究笔记'},
      status: {published: '已发表', accepted: '已接收', preprint: '预印本', 'under-review': '评审中', 'in-prep': '准备中'},
      links: {paper: '论文', arxiv: 'arXiv', code: '代码', project: '项目页', video: '视频', poster: '海报', slides: '幻灯片'},
      bibtex: 'BibTeX', copy: '复制', copied: '已复制 BibTeX。', exportAll: '下载全部 .bib', preview: '预览模式：显示模板与草稿。公开网站上不会出现。',
      draft: '草稿', deadline: '截止', brief: '给审阅者的一页式简介'}
  }
};
