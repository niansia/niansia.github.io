window.NIANSIA_BLOG = {
 "ask": "https://forms.gle/yNUw4eLZeeqf3Arb6",
 "posts": {
  "en": [
   {
    "slug": "2026-09-30-rine",
    "type": "paper",
    "title": "RINE: do intermediate layers know “fake” better than the last one?",
    "description": "RINE detects generated images from CLIP's intermediate layers, and my own experiments largely agree. Under real-world corruptions, though, the most useful layers change, and the breadth of augmentation matters more than which layer the features come from.",
    "date": "2026-09-30",
    "minutes": 5,
    "tags": [
     "AI-generated image detection",
     "CLIP",
     "robustness"
    ],
    "lang": "en",
    "paper": "Leveraging Representations from Intermediate Encoder-blocks for Synthetic Image Detection",
    "venue": "ECCV 2024",
    "depth": "deep",
    "url": "/blog/en/2026-09-30-rine/"
   },
   {
    "slug": "2026-09-29-now",
    "type": "now",
    "title": "September 2026: new projects and an exam gallery, CVPR prep begins",
    "description": "This month Taiwan Exam, its exam gallery, the in-browser LumiGrid and Adversarial Lab went live, and the site moved to niansia.com. Next up is the CVPR 2027 submission in mid-November.",
    "date": "2026-09-29",
    "minutes": 1,
    "tags": [],
    "lang": "en",
    "groups": [
     {
      "title": "Shipped this month",
      "items": [
       "Taiwan Exam is public",
       "LumiGrid runs in the browser",
       "Adversarial Lab is live",
       "A gallery for Taiwan Exam exams",
       "The site moved to niansia.com",
       "LINE communities for GSAT students"
      ]
     },
     {
      "title": "Next",
      "items": [
       "CVPR 2027",
       "ICCV 2027",
       "COLM 2027"
      ]
     }
    ],
    "url": "/blog/en/2026-09-29-now/"
   },
   {
    "slug": "2026-09-14-reroute",
    "type": "paper",
    "title": "Reroute: can dropped visual tokens come back later?",
    "description": "Reroute turns \"delete the low-scoring visual tokens\" into \"defer them, and let them come back\", with no training, and the harder the compression, the more it recovers. We are studying how to recover and re-locate what a long video loses in compression, and this paper attacks the smallest version of that problem.",
    "date": "2026-09-14",
    "minutes": 6,
    "tags": [
     "vision-language models",
     "visual token reduction",
     "grounding",
     "long video"
    ],
    "lang": "en",
    "paper": "Reroute, Don’t Remove: Recoverable Visual Token Routing for Vision-Language Models",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/en/2026-09-14-reroute/"
   },
   {
    "slug": "2026-08-30-swarmworld",
    "type": "paper",
    "title": "SwarmWorld: agents cooperate without talking — is watching their messages enough?",
    "description": "Identical LLM agents dropped into a world that keeps their traces divide the work among themselves with no assigned roles, and mostly learn each other's technology by walking past it. The announcement was dramatic, the paper is far more measured; what I care about most is the security angle — watching only what agents say to each other misses a lot of coordination.",
    "date": "2026-08-30",
    "minutes": 6,
    "tags": [
     "multi-agent systems",
     "LLM agents",
     "AI security",
     "collective intelligence"
    ],
    "lang": "en",
    "paper": "SwarmWorld: Stigmergic technological evolution in societies of language-model agents",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/en/2026-08-30-swarmworld/"
   },
   {
    "slug": "2026-08-06-act2see",
    "type": "paper",
    "title": "Act2See: the model learns to look back — what if you don't have eight A100s?",
    "description": "Act2See lets a video model stop mid-reasoning to fetch a frame from the video, or draw a hypothetical one, and it beats its base model on all five benchmarks. It was trained on eight A100s, though, and I kept asking myself how the same idea would work on a single home GPU.",
    "date": "2026-08-06",
    "minutes": 9,
    "tags": [
     "video understanding",
     "vision-language models",
     "chain of thought",
     "efficiency"
    ],
    "lang": "en",
    "paper": "Act2See: Emergent Active Visual Perception for Video Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/en/2026-08-06-act2see/"
   }
  ],
  "zh-TW": [
   {
    "slug": "2026-09-30-rine",
    "type": "paper",
    "title": "RINE：中間層真的比最後一層更懂「假」嗎？",
    "description": "RINE 用 CLIP 中間層的特徵偵測生成圖，和我自己的實驗結論大致相同；但在「野外干擾」下，最有用的層會換人，增強的廣度也比從哪一層拿特徵更關鍵。",
    "date": "2026-09-30",
    "minutes": 4,
    "tags": [
     "AI 生成圖偵測",
     "CLIP",
     "穩健性"
    ],
    "lang": "zh-TW",
    "paper": "Leveraging Representations from Intermediate Encoder-blocks for Synthetic Image Detection",
    "venue": "ECCV 2024",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-09-30-rine/"
   },
   {
    "slug": "2026-09-29-now",
    "type": "now",
    "title": "2026 年 9 月：作品與考卷分享區上線，開始準備 CVPR",
    "description": "這個月把 Taiwan Exam、考卷分享區、LumiGrid 網頁版和 Adversarial Lab 放上線，網站也搬到 niansia.com；接下來的重心是 11 月中的 CVPR 2027 投稿。",
    "date": "2026-09-29",
    "minutes": 1,
    "tags": [],
    "lang": "zh-TW",
    "groups": [
     {
      "title": "這個月做完的",
      "items": [
       "Taiwan Exam 正式公開",
       "LumiGrid 可以直接在瀏覽器試",
       "Adversarial Lab 上線",
       "Taiwan Exam 考卷分享區",
       "網站搬到 niansia.com",
       "LINE 學測社群"
      ]
     },
     {
      "title": "接下來",
      "items": [
       "CVPR 2027",
       "ICCV 2027",
       "COLM 2027"
      ]
     }
    ],
    "url": "/blog/zh-tw/2026-09-29-now/"
   },
   {
    "slug": "2026-09-14-reroute",
    "type": "paper",
    "title": "Reroute：丟掉的視覺 token，晚點還能撿回來嗎？",
    "description": "Reroute 把「刪掉低分的視覺 token」改成「先延後，之後還能回來」，不用訓練，壓得越狠救回越多。我們正在研究長影片壓縮後，遺失的畫面怎麼找回、怎麼重新定位，這篇剛好從最小的地方切進去。",
    "date": "2026-09-14",
    "minutes": 4,
    "tags": [
     "視覺語言模型",
     "視覺 token 壓縮",
     "定位",
     "長影片"
    ],
    "lang": "zh-TW",
    "paper": "Reroute, Don’t Remove: Recoverable Visual Token Routing for Vision-Language Models",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-09-14-reroute/"
   },
   {
    "slug": "2026-08-30-swarmworld",
    "type": "paper",
    "title": "SwarmWorld：AI agent 不講話也能合作，那只監控對話還夠嗎？",
    "description": "一群一模一樣的 LLM agent 放進會留下痕跡的世界，不指派角色也會自己分工，而且大多是「路過看到」別人的成品才學會的。推文講得很震撼，論文本身克制得多；我最在意的是它對 AI 安全的意思：只看 agent 之間的對話，會漏掉很多協調。",
    "date": "2026-08-30",
    "minutes": 5,
    "tags": [
     "多智能體",
     "LLM agent",
     "AI 安全",
     "集體智慧"
    ],
    "lang": "zh-TW",
    "paper": "SwarmWorld: Stigmergic technological evolution in societies of language-model agents",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-08-30-swarmworld/"
   },
   {
    "slug": "2026-08-06-act2see",
    "type": "paper",
    "title": "Act2See：模型學會回頭看影片，那沒有 8 張 A100 的人呢？",
    "description": "Act2See 讓影片模型想到一半時，自己回影片裡找畫面、或畫出假設的畫面，五個基準都贏過原模型。但它用 8 張 A100 訓練，我讀完一直在想：同樣的想法，放到一張家用顯卡上要怎麼做？",
    "date": "2026-08-06",
    "minutes": 6,
    "tags": [
     "影片理解",
     "視覺語言模型",
     "思考鏈",
     "輕量化"
    ],
    "lang": "zh-TW",
    "paper": "Act2See: Emergent Active Visual Perception for Video Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-08-06-act2see/"
   }
  ],
  "zh-CN": [
   {
    "slug": "2026-09-30-rine",
    "type": "paper",
    "title": "RINE：中间层真的比最后一层更懂「假」吗？",
    "description": "RINE 用 CLIP 中间层的特征侦测生成图，和我自己的实验结论大致相同；但在「野外干扰」下，最有用的层会换人，增强的广度也比从哪一层拿特征更关键。",
    "date": "2026-09-30",
    "minutes": 4,
    "tags": [
     "AI 生成图侦测",
     "CLIP",
     "稳健性"
    ],
    "lang": "zh-CN",
    "paper": "Leveraging Representations from Intermediate Encoder-blocks for Synthetic Image Detection",
    "venue": "ECCV 2024",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-09-30-rine/"
   },
   {
    "slug": "2026-09-29-now",
    "type": "now",
    "title": "2026 年 9 月：作品与考卷分享区上线，开始准备 CVPR",
    "description": "这个月把 Taiwan Exam、考卷分享区、LumiGrid 网页版和 Adversarial Lab 放上线，网站也搬到 niansia.com；接下来的重心是 11 月中的 CVPR 2027 投稿。",
    "date": "2026-09-29",
    "minutes": 1,
    "tags": [],
    "lang": "zh-CN",
    "groups": [
     {
      "title": "这个月做完的",
      "items": [
       "Taiwan Exam 正式公开",
       "LumiGrid 可以直接在浏览器试",
       "Adversarial Lab 上线",
       "Taiwan Exam 考卷分享区",
       "网站搬到 niansia.com",
       "LINE 学测社群"
      ]
     },
     {
      "title": "接下来",
      "items": [
       "CVPR 2027",
       "ICCV 2027",
       "COLM 2027"
      ]
     }
    ],
    "url": "/blog/zh-cn/2026-09-29-now/"
   },
   {
    "slug": "2026-09-14-reroute",
    "type": "paper",
    "title": "Reroute：丢掉的视觉 token，晚点还能捡回来吗？",
    "description": "Reroute 把「删掉低分的视觉 token」改成「先延后，之后还能回来」，不用训练，压得越狠救回越多。我们正在研究长视频压缩后，遗失的画面怎么找回、怎么重新定位，这篇刚好从最小的地方切进去。",
    "date": "2026-09-14",
    "minutes": 4,
    "tags": [
     "视觉语言模型",
     "视觉 token 压缩",
     "定位",
     "长视频"
    ],
    "lang": "zh-CN",
    "paper": "Reroute, Don’t Remove: Recoverable Visual Token Routing for Vision-Language Models",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-09-14-reroute/"
   },
   {
    "slug": "2026-08-30-swarmworld",
    "type": "paper",
    "title": "SwarmWorld：AI agent 不讲话也能合作，那只监控对话还够吗？",
    "description": "一群一模一样的 LLM agent 放进会留下痕迹的世界，不指派角色也会自己分工，而且大多是「路过看到」别人的成品才学会的。推文讲得很震撼，论文本身克制得多；我最在意的是它对 AI 安全的意思：只看 agent 之间的对话，会漏掉很多协调。",
    "date": "2026-08-30",
    "minutes": 5,
    "tags": [
     "多智能体",
     "LLM agent",
     "AI 安全",
     "集体智能"
    ],
    "lang": "zh-CN",
    "paper": "SwarmWorld: Stigmergic technological evolution in societies of language-model agents",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-08-30-swarmworld/"
   },
   {
    "slug": "2026-08-06-act2see",
    "type": "paper",
    "title": "Act2See：模型学会回头看视频，那没有 8 张 A100 的人呢？",
    "description": "Act2See 让视频模型想到一半时，自己回视频里找画面、或画出假设的画面，五个基准都赢过原模型。但它用 8 张 A100 训练，我读完一直在想：同样的想法，放到一张家用显卡上要怎么做？",
    "date": "2026-08-06",
    "minutes": 6,
    "tags": [
     "视频理解",
     "视觉语言模型",
     "思考链",
     "轻量化"
    ],
    "lang": "zh-CN",
    "paper": "Act2See: Emergent Active Visual Perception for Video Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-08-06-act2see/"
   }
  ]
 }
};
