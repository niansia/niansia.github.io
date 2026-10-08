window.NIANSIA_BLOG = {
 "ask": "https://forms.gle/yNUw4eLZeeqf3Arb6",
 "posts": {
  "en": [
   {
    "slug": "2026-10-08-zerostel-0-3",
    "type": "post",
    "title": "Zerostel 0.3.0: failed tests listed, and guardrails that read commands like the shell",
    "description": "Zerostel 0.3.0 is out. Check results list which tests failed, guardrail rules match a command the way the shell runs it, and the MCP tools say what they do to your machine.",
    "date": "2026-10-08",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agents",
     "open source"
    ],
    "lang": "en",
    "url": "/blog/en/2026-10-08-zerostel-0-3/"
   },
   {
    "slug": "2026-10-07-vllm-astrbot-prs",
    "type": "post",
    "title": "Fix PRs for vLLM and AstrBot",
    "description": "Sent vLLM a fix for parsing DeepSeek-V3/V3.1 tool calls. Both fixes sent to AstrBot, for tool calls without arguments dropped in Anthropic streaming and for replies stuck when the summary model is out of quota, are merged.",
    "date": "2026-10-07",
    "minutes": 2,
    "tags": [
     "open source",
     "vLLM",
     "AstrBot"
    ],
    "lang": "en",
    "url": "/blog/en/2026-10-07-vllm-astrbot-prs/"
   },
   {
    "slug": "2026-10-06-astrbot-background-log-export",
    "type": "post",
    "title": "A background task warning and log export for AstrBot",
    "description": "Sent PRs for two AstrBot issues: a warning when a background task's result never reaches the user, and log export from the WebUI.",
    "date": "2026-10-06",
    "minutes": 1,
    "tags": [
     "open source",
     "AstrBot"
    ],
    "lang": "en",
    "url": "/blog/en/2026-10-06-astrbot-background-log-export/"
   },
   {
    "slug": "2026-10-05-zerostel",
    "type": "post",
    "title": "Zerostel is public: a flight recorder and time machine for AI agents",
    "description": "My open-source project Zerostel is live. It records every step an AI coding agent takes and puts the files back with one command when the agent breaks something.",
    "date": "2026-10-05",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agents",
     "open source"
    ],
    "lang": "en",
    "url": "/blog/en/2026-10-05-zerostel/"
   },
   {
    "slug": "2026-10-04-astrbot-dify-prs",
    "type": "post",
    "title": "Reporting bugs and sending PRs to AstrBot and Dify",
    "description": "Filed two issues with fix PRs to AstrBot, and both fixes are merged; filed two issues with Dify, and sent a fix PR for the webhook 500.",
    "date": "2026-10-04",
    "minutes": 1,
    "tags": [
     "open source",
     "AstrBot",
     "Dify"
    ],
    "lang": "en",
    "url": "/blog/en/2026-10-04-astrbot-dify-prs/"
   },
   {
    "slug": "2026-10-01-siglip2",
    "type": "paper",
    "title": "SigLIP 2: why is a model trained to describe images so good at catching fakes?",
    "description": "Swapping my backbone from CLIP to SigLIP 2 made the score on distorted images jump, more than any trick I had spent days tuning. After reading the paper I have two guesses, the self-supervised losses added late in training and the missing CLS token that made me use patch averages. A good backbone raises the starting point; good training pushes it further.",
    "date": "2026-10-01",
    "minutes": 5,
    "tags": [
     "AI-generated image detection",
     "vision-language models",
     "pretraining",
     "robustness"
    ],
    "lang": "en",
    "paper": "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features",
    "venue": "arXiv 2025",
    "depth": "deep",
    "url": "/blog/en/2026-10-01-siglip2/"
   },
   {
    "slug": "2026-10-01-ntire2026-report",
    "type": "paper",
    "title": "The NTIRE 2026 challenge report: did the winners win on models or on data?",
    "description": "This report is the exam paper for my project. Reading it, I found that the top two teams had not only bigger models but far bigger and newer training data, including the commercial generators the official training set deliberately kept for testing. The leaderboard gap mixes model, data and compute, and comparisons have to pull them apart.",
    "date": "2026-10-01",
    "minutes": 7,
    "tags": [
     "AI-generated image detection",
     "robustness",
     "competitions",
     "data"
    ],
    "lang": "en",
    "paper": "NTIRE 2026 Challenge on Robust AI-Generated Image Detection in the Wild",
    "venue": "CVPR 2026 NTIRE Workshop",
    "depth": "deep",
    "url": "/blog/en/2026-10-01-ntire2026-report/"
   },
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
    "description": "Reroute turns \"delete the low-scoring visual tokens\" into \"defer them, and let them come back\", with no training, and the harder the compression, the more it recovers. It works on images; after reading it I kept wondering what the same idea would run into on long video.",
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
   },
   {
    "slug": "2026-07-31-vtc-r1",
    "type": "paper",
    "title": "VTC-R1: printing the reasoning as images and using them as scratch paper",
    "description": "VTC-R1 renders each finished stretch of reasoning into images, and in the next round the model continues from that \"scratch paper\" alone. Tokens drop 3.4×, speed goes up 1.2–6.6×, and accuracy is mostly higher. It is a lovely idea, but every task is text-only math, nobody measures whether the scratch paper is read back correctly, and video reasoning, where visual tokens are already overflowing, is a different matter.",
    "date": "2026-07-31",
    "minutes": 7,
    "tags": [
     "vision-language models",
     "chain of thought",
     "long reasoning",
     "efficiency"
    ],
    "lang": "en",
    "paper": "VTC-R1: Vision-Text Compression for Efficient Long-Context Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/en/2026-07-31-vtc-r1/"
   },
   {
    "slug": "2026-07-31-visionpulse",
    "type": "paper",
    "title": "VisionPulse: at every step of the reasoning, the model needs to see something different",
    "description": "VisionPulse finds that a model's reliance on the image changes from one reasoning step to the next, so at each step it keeps only the visual tokens needed right then. With 5% kept, accuracy barely moves and the reasoning gets shorter. I love the observation; but it saves compute rather than memory, the experiments are all on images, and the double explosion of long video plus long reasoning is still untouched.",
    "date": "2026-07-31",
    "minutes": 8,
    "tags": [
     "vision-language models",
     "visual token reduction",
     "chain of thought",
     "efficiency"
    ],
    "lang": "en",
    "paper": "VisionPulse: Dynamic Visual Sparsity for Efficient Multimodal Reasoning",
    "venue": "ICML 2026",
    "depth": "deep",
    "url": "/blog/en/2026-07-31-visionpulse/"
   },
   {
    "slug": "2026-07-26-vskip",
    "type": "paper",
    "title": "V-Skip: when you shorten the reasoning, don't cut out what the model saw",
    "description": "Move a text-only chain-of-thought compressor onto a vision-language model and it deletes the words that only the image could supply. The reasoning still reads smoothly, but it has come loose from the picture, and hallucinations follow. The paper calls this Visual Amnesia and it names a real problem; I have reservations about its explanation of the cause and about a few of its numbers.",
    "date": "2026-07-26",
    "minutes": 10,
    "tags": [
     "vision-language models",
     "chain of thought",
     "hallucination",
     "efficiency"
    ],
    "lang": "en",
    "paper": "Chain-of-Thought Compression Should Not Be Blind: V-Skip for Efficient Multimodal Reasoning via Dual-Path Anchoring",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/en/2026-07-26-vskip/"
   }
  ],
  "zh-TW": [
   {
    "slug": "2026-10-08-zerostel-0-3",
    "type": "post",
    "title": "Zerostel 0.3.0：列出失敗的測試，護欄照 shell 的方式讀指令",
    "description": "Zerostel 發布 0.3.0：檢查結果會列出哪些測試失敗，護欄規則改成照 shell 實際執行的方式比對指令，MCP 工具也標明會對電腦做什麼。",
    "date": "2026-10-08",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agent",
     "開源"
    ],
    "lang": "zh-TW",
    "url": "/blog/zh-tw/2026-10-08-zerostel-0-3/"
   },
   {
    "slug": "2026-10-07-vllm-astrbot-prs",
    "type": "post",
    "title": "替 vLLM 和 AstrBot 送修正 PR",
    "description": "向 vLLM 送出 DeepSeek-V3/V3.1 工具呼叫解析的修正；向 AstrBot 送出的兩個修正（Anthropic 串流模式下無參數的工具呼叫被丟掉、摘要模型額度用完時回覆卡住）都已合併。",
    "date": "2026-10-07",
    "minutes": 1,
    "tags": [
     "開源貢獻",
     "vLLM",
     "AstrBot"
    ],
    "lang": "zh-TW",
    "url": "/blog/zh-tw/2026-10-07-vllm-astrbot-prs/"
   },
   {
    "slug": "2026-10-06-astrbot-background-log-export",
    "type": "post",
    "title": "替 AstrBot 補上背景任務警告和日誌匯出",
    "description": "針對 AstrBot 的兩個 issue 送出 PR：背景任務的結果沒送到使用者時補上警告日誌，以及在 WebUI 加上日誌匯出。",
    "date": "2026-10-06",
    "minutes": 1,
    "tags": [
     "開源貢獻",
     "AstrBot"
    ],
    "lang": "zh-TW",
    "url": "/blog/zh-tw/2026-10-06-astrbot-background-log-export/"
   },
   {
    "slug": "2026-10-05-zerostel",
    "type": "post",
    "title": "Zerostel 正式公開：AI agent 的行車紀錄器和時光機",
    "description": "我的開源專案 Zerostel 正式上線：記錄 AI 寫程式工具的每一步，改壞東西時一個指令就能復原。",
    "date": "2026-10-05",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agent",
     "開源"
    ],
    "lang": "zh-TW",
    "url": "/blog/zh-tw/2026-10-05-zerostel/"
   },
   {
    "slug": "2026-10-04-astrbot-dify-prs",
    "type": "post",
    "title": "替 AstrBot 和 Dify 回報 bug、送 PR",
    "description": "向 AstrBot 提交了兩個 issue 和修正 PR，兩個修正都已合併；向 Dify 提交了兩個 issue，其中 Webhook 回傳 500 的問題附上修正 PR。",
    "date": "2026-10-04",
    "minutes": 1,
    "tags": [
     "開源貢獻",
     "AstrBot",
     "Dify"
    ],
    "lang": "zh-TW",
    "url": "/blog/zh-tw/2026-10-04-astrbot-dify-prs/"
   },
   {
    "slug": "2026-10-01-siglip2",
    "type": "paper",
    "title": "SigLIP 2：為什麼一個「看圖說話」的模型特別會抓假圖？",
    "description": "把骨幹從 CLIP 換成 SigLIP 2，干擾圖的分數一下子跳了一大截，比我花好幾天調的任何技巧都有效。讀完論文，我有兩個猜測：一是它後段加入的自監督目標，二是它沒有 CLS token、我改用 patch 平均。好的骨幹提高起點，好的訓練方法把起點推得更遠。",
    "date": "2026-10-01",
    "minutes": 4,
    "tags": [
     "AI 生成圖偵測",
     "視覺語言模型",
     "預訓練",
     "穩健性"
    ],
    "lang": "zh-TW",
    "paper": "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features",
    "venue": "arXiv 2025",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-10-01-siglip2/"
   },
   {
    "slug": "2026-10-01-ntire2026-report",
    "type": "paper",
    "title": "NTIRE 2026 比賽報告：冠軍贏在模型，還是贏在資料？",
    "description": "這份報告是我專題的「考卷」。讀完才發現，前兩名除了模型大，訓練資料也大得多、新得多，甚至涵蓋了官方訓練集刻意留給測試集的商用生成器。排行榜的差距同時混了模型、資料和運算，比較時要拆開來看。",
    "date": "2026-10-01",
    "minutes": 5,
    "tags": [
     "AI 生成圖偵測",
     "穩健性",
     "比賽",
     "資料"
    ],
    "lang": "zh-TW",
    "paper": "NTIRE 2026 Challenge on Robust AI-Generated Image Detection in the Wild",
    "venue": "CVPR 2026 NTIRE Workshop",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-10-01-ntire2026-report/"
   },
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
    "description": "Reroute 把「刪掉低分的視覺 token」改成「先延後，之後還能回來」，不用訓練，壓得越狠救回越多。它處理的是圖片；我讀完一直在想，同樣的想法放到長影片上會碰到什麼。",
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
   },
   {
    "slug": "2026-07-31-vtc-r1",
    "type": "paper",
    "title": "VTC-R1：把推理過程印成圖片，當成模型的草稿紙",
    "description": "VTC-R1 讓模型每想完一段，就把那段推理印成圖片，下一輪只看「圖片草稿」接著想：token 少了 3.4 倍，速度快 1.2 到 6.6 倍，準確率大多還更高。點子很漂亮，但它測的全是純文字的數學題，草稿讀得準不準也沒有量；換成本來就塞滿視覺 token 的影片推理，又是另一回事。",
    "date": "2026-07-31",
    "minutes": 4,
    "tags": [
     "視覺語言模型",
     "思考鏈",
     "長推理",
     "輕量化"
    ],
    "lang": "zh-TW",
    "paper": "VTC-R1: Vision-Text Compression for Efficient Long-Context Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-07-31-vtc-r1/"
   },
   {
    "slug": "2026-07-31-visionpulse",
    "type": "paper",
    "title": "VisionPulse：推理的每一步，要看的畫面都不一樣",
    "description": "VisionPulse 發現模型推理時對影像的依賴會一步一步變化，於是每一步只留下當下需要的視覺 token，只留 5% 準確率幾乎不掉，推理還變短。我很喜歡這個觀察；但它省的是計算不是記憶體，實驗也都是圖片，「長影片加長推理鏈」這個雙重爆炸，還沒有人正面處理。",
    "date": "2026-07-31",
    "minutes": 5,
    "tags": [
     "視覺語言模型",
     "視覺 token 壓縮",
     "思考鏈",
     "輕量化"
    ],
    "lang": "zh-TW",
    "paper": "VisionPulse: Dynamic Visual Sparsity for Efficient Multimodal Reasoning",
    "venue": "ICML 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-07-31-visionpulse/"
   },
   {
    "slug": "2026-07-26-vskip",
    "type": "paper",
    "title": "V-Skip：把推理鏈壓短，別連「看到的東西」一起刪掉",
    "description": "把純文字的推理鏈壓縮法直接搬到視覺語言模型上，會刪掉「看圖才說得出來」的詞，推理鏈照樣通順，卻和原圖斷了線，開始出現幻覺。論文把這叫 Visual Amnesia，問題抓得很準；不過它對原因的解釋和幾個數字，我讀完有些保留。",
    "date": "2026-07-26",
    "minutes": 6,
    "tags": [
     "視覺語言模型",
     "思考鏈",
     "幻覺",
     "輕量化"
    ],
    "lang": "zh-TW",
    "paper": "Chain-of-Thought Compression Should Not Be Blind: V-Skip for Efficient Multimodal Reasoning via Dual-Path Anchoring",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-tw/2026-07-26-vskip/"
   }
  ],
  "zh-CN": [
   {
    "slug": "2026-10-08-zerostel-0-3",
    "type": "post",
    "title": "Zerostel 0.3.0：列出失败的测试，护栏照 shell 的方式读指令",
    "description": "Zerostel 发布 0.3.0：检查结果会列出哪些测试失败，护栏规则改成照 shell 实际运行的方式比对指令，MCP 工具也标明会对电脑做什么。",
    "date": "2026-10-08",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agent",
     "开源"
    ],
    "lang": "zh-CN",
    "url": "/blog/zh-cn/2026-10-08-zerostel-0-3/"
   },
   {
    "slug": "2026-10-07-vllm-astrbot-prs",
    "type": "post",
    "title": "替 vLLM 和 AstrBot 送修正 PR",
    "description": "向 vLLM 送出 DeepSeek-V3/V3.1 工具调用解析的修正；向 AstrBot 送出的两个修正（Anthropic 串流模式下无参数的工具调用被丢掉、摘要模型额度用完时回复卡住）都已合并。",
    "date": "2026-10-07",
    "minutes": 1,
    "tags": [
     "开源贡献",
     "vLLM",
     "AstrBot"
    ],
    "lang": "zh-CN",
    "url": "/blog/zh-cn/2026-10-07-vllm-astrbot-prs/"
   },
   {
    "slug": "2026-10-06-astrbot-background-log-export",
    "type": "post",
    "title": "替 AstrBot 补上背景任务警告和日志导出",
    "description": "针对 AstrBot 的两个 issue 送出 PR：背景任务的结果没送到用户时补上警告日志，以及在 WebUI 加上日志导出。",
    "date": "2026-10-06",
    "minutes": 1,
    "tags": [
     "开源贡献",
     "AstrBot"
    ],
    "lang": "zh-CN",
    "url": "/blog/zh-cn/2026-10-06-astrbot-background-log-export/"
   },
   {
    "slug": "2026-10-05-zerostel",
    "type": "post",
    "title": "Zerostel 正式公开：AI agent 的行车纪录器和时光机",
    "description": "我的开源项目 Zerostel 正式上线：记录 AI 写程序工具的每一步，改坏东西时一个指令就能复原。",
    "date": "2026-10-05",
    "minutes": 1,
    "tags": [
     "Zerostel",
     "AI agent",
     "开源"
    ],
    "lang": "zh-CN",
    "url": "/blog/zh-cn/2026-10-05-zerostel/"
   },
   {
    "slug": "2026-10-04-astrbot-dify-prs",
    "type": "post",
    "title": "替 AstrBot 和 Dify 回报 bug、送 PR",
    "description": "向 AstrBot 提交了两个 issue 和修正 PR，两个修正都已合并；向 Dify 提交了两个 issue，其中 Webhook 回传 500 的问题附上修正 PR。",
    "date": "2026-10-04",
    "minutes": 1,
    "tags": [
     "开源贡献",
     "AstrBot",
     "Dify"
    ],
    "lang": "zh-CN",
    "url": "/blog/zh-cn/2026-10-04-astrbot-dify-prs/"
   },
   {
    "slug": "2026-10-01-siglip2",
    "type": "paper",
    "title": "SigLIP 2：为什么一个「看图说话」的模型特别会抓假图？",
    "description": "把骨干从 CLIP 换成 SigLIP 2，干扰图的分数一下子跳了一大截，比我花好几天调的任何技巧都有效。读完论文，我有两个猜测：一是它后段加入的自监督目标，二是它没有 CLS token、我改用 patch 平均。好的骨干提高起点，好的训练方法把起点推得更远。",
    "date": "2026-10-01",
    "minutes": 4,
    "tags": [
     "AI 生成图侦测",
     "视觉语言模型",
     "预训练",
     "稳健性"
    ],
    "lang": "zh-CN",
    "paper": "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features",
    "venue": "arXiv 2025",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-10-01-siglip2/"
   },
   {
    "slug": "2026-10-01-ntire2026-report",
    "type": "paper",
    "title": "NTIRE 2026 比赛报告：冠军赢在模型，还是赢在数据？",
    "description": "这份报告是我专题的「考卷」。读完才发现，前两名除了模型大，训练数据也大得多、新得多，甚至涵盖了官方训练集刻意留给测试集的商用生成器。排行榜的差距同时混了模型、数据和运算，比较时要拆开来看。",
    "date": "2026-10-01",
    "minutes": 5,
    "tags": [
     "AI 生成图侦测",
     "稳健性",
     "比赛",
     "数据"
    ],
    "lang": "zh-CN",
    "paper": "NTIRE 2026 Challenge on Robust AI-Generated Image Detection in the Wild",
    "venue": "CVPR 2026 NTIRE Workshop",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-10-01-ntire2026-report/"
   },
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
    "description": "Reroute 把「删掉低分的视觉 token」改成「先延后，之后还能回来」，不用训练，压得越狠救回越多。它处理的是图片；我读完一直在想，同样的想法放到长视频上会碰到什么。",
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
   },
   {
    "slug": "2026-07-31-vtc-r1",
    "type": "paper",
    "title": "VTC-R1：把推理过程印成图片，当成模型的草稿纸",
    "description": "VTC-R1 让模型每想完一段，就把那段推理印成图片，下一轮只看「图片草稿」接着想：token 少了 3.4 倍，速度快 1.2 到 6.6 倍，准确率大多还更高。点子很漂亮，但它测的全是纯文本的数学题，草稿读得准不准也没有量；换成本来就塞满视觉 token 的视频推理，又是另一回事。",
    "date": "2026-07-31",
    "minutes": 4,
    "tags": [
     "视觉语言模型",
     "思考链",
     "长推理",
     "轻量化"
    ],
    "lang": "zh-CN",
    "paper": "VTC-R1: Vision-Text Compression for Efficient Long-Context Reasoning",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-07-31-vtc-r1/"
   },
   {
    "slug": "2026-07-31-visionpulse",
    "type": "paper",
    "title": "VisionPulse：推理的每一步，要看的画面都不一样",
    "description": "VisionPulse 发现模型推理时对图像的依赖会一步一步变化，于是每一步只留下当下需要的视觉 token，只留 5% 准确率几乎不掉，推理还变短。我很喜欢这个观察；但它省的是计算不是内存，实验也都是图片，「长视频加长推理链」这个双重爆炸，还没有人正面处理。",
    "date": "2026-07-31",
    "minutes": 5,
    "tags": [
     "视觉语言模型",
     "视觉 token 压缩",
     "思考链",
     "轻量化"
    ],
    "lang": "zh-CN",
    "paper": "VisionPulse: Dynamic Visual Sparsity for Efficient Multimodal Reasoning",
    "venue": "ICML 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-07-31-visionpulse/"
   },
   {
    "slug": "2026-07-26-vskip",
    "type": "paper",
    "title": "V-Skip：把推理链压短，别连「看到的东西」一起删掉",
    "description": "把纯文本的推理链压缩法直接搬到视觉语言模型上，会删掉「看图才说得出来」的词，推理链照样通顺，却和原图断了线，开始出现幻觉。论文把这叫 Visual Amnesia，问题抓得很准；不过它对原因的解释和几个数字，我读完有些保留。",
    "date": "2026-07-26",
    "minutes": 6,
    "tags": [
     "视觉语言模型",
     "思考链",
     "幻觉",
     "轻量化"
    ],
    "lang": "zh-CN",
    "paper": "Chain-of-Thought Compression Should Not Be Blind: V-Skip for Efficient Multimodal Reasoning via Dual-Path Anchoring",
    "venue": "arXiv 2026",
    "depth": "deep",
    "url": "/blog/zh-cn/2026-07-26-vskip/"
   }
  ]
 }
};
