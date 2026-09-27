window.NIANSIA_PROJECTS = {
  "en": [
    {
      "id": "lumigrid",
      "name": "LumiGrid",
      "url": "https://github.com/niansia/LumiGrid",
      "category": "Computer vision",
      "status": "Research prototype",
      "description": "Low-light image enhancement that predicts a luminance-guided bilateral grid of Zero-DCE curves and colour matrices from a thumbnail of the whole image, slices it at full resolution, and cleans noise and detail with a lightweight NAFNet refiner. Rebuilt from an earlier course project on the NTIRE 2025 challenge data.",
      "evidence": "On 20 held-out NTIRE 2025 pairs with the official scoring code: 24.57 dB PSNR / 0.840 SSIM (24.63 dB with test-time augmentation), against 16.48 dB for the original Zero-DCE course pipeline and 20.91 dB for Zero-DCE trained on the same data; component ablations, released weights, 2.1 M parameters, 24-megapixel images on an 8 GB laptop GPU.",
      "reference": "https://github.com/niansia/LumiGrid#results",
      "referenceLabel": "Results and ablations"
    },
    {
      "id": "taiwan-exam",
      "name": "Taiwan Exam",
      "url": "https://github.com/niansia/taiwan-exam",
      "category": "Agent Skill",
      "status": "GSAT seven subjects",
      "description": "An Agent Skill for creating original Taiwan GSAT practice exams. It checks answers and difficulty, applies official exam layout templates, and delivers separate question and worked-solution PDFs. CAP and subject-test support remain in development.",
      "evidence": "Subject-specific guidance, source and answer checks, layout validation, exam templates, and public installation instructions.",
      "reference": "https://github.com/niansia/taiwan-exam/blob/main/SKILL.md",
      "referenceLabel": "Skill specification"
    },
    {
      "id": "kcrashlab",
      "name": "KCrashLab",
      "url": "https://github.com/niansia/KCrashLab",
      "category": "Systems reliability",
      "status": "Evidence freeze",
      "description": "A simulation-first research platform for deterministic, reproducible Windows driver reliability experiments. It normalizes cases, resumes interrupted campaigns, minimizes exact-signature triggers, and produces independently verifiable evidence bundles.",
      "evidence": "Canonical Case IR, seeded scheduling, an append-only SQLite journal, exact signatures, 3/3 simulated replay, recorded G3, E1, E2, and minimization artifacts, semantic verification, and multi-platform CI.",
      "reference": "https://github.com/niansia/KCrashLab/blob/main/docs/research-claims.md",
      "referenceLabel": "Claims ledger"
    },
    {
      "id": "contextsec",
      "name": "ContextSec",
      "url": "https://github.com/niansia/ContextSec",
      "category": "AI security",
      "status": "Research preview",
      "description": "A deterministic product-security decision layer for AI coding agents. It derives applicable controls from bounded repository evidence and records every decision in a Control Evaluation Ledger.",
      "evidence": "16 risk packs, 116 controls, 9 composition rules, profile and mutation cases, real-repository evaluations, and multi-platform CI.",
      "reference": "https://github.com/niansia/ContextSec/blob/main/docs/architecture.md",
      "referenceLabel": "Architecture"
    },
    {
      "id": "merriv",
      "name": "Merriv",
      "url": "https://github.com/niansia/Merriv",
      "category": "Model release",
      "status": "Pre-alpha",
      "description": "A vendor-neutral release-evidence layer for deployable AI models. It binds exact artifacts, paired evaluation, statistical policy, provenance, and regression onset into a portable Model Change Report.",
      "evidence": "Reproducible release records, explicit promotion policy, provenance, regression localization, and an independent verification path.",
      "reference": "https://github.com/niansia/Merriv/blob/main/docs/release-evidence-case-study.md",
      "referenceLabel": "Case study"
    },
    {
      "id": "ai-repo-gardener",
      "name": "AI Repo Gardener",
      "url": "https://github.com/niansia/ai-repo-gardener",
      "category": "Repository analysis",
      "status": "Public alpha",
      "description": "Static analysis and a portable Agent Skill for AI-edited Python repositories. Weak findings stay review-only, while deletion requires a reviewed, hash-bound plan and isolated validation.",
      "evidence": "Import reachability, Git chronology, normalized AST evidence, 25 adversarial safety scenarios, real-repository smoke tests, and multi-platform CI.",
      "reference": "https://github.com/niansia/ai-repo-gardener/blob/main/benchmarks/safety-benchmark.md",
      "referenceLabel": "Safety benchmark"
    },
    {
      "id": "psg",
      "name": "PSG - Project State Graph",
      "url": "https://github.com/niansia/PSG",
      "category": "Agent governance",
      "status": "v1.1.4",
      "description": "An installable runtime, MCP server, and portable Agent Skill that gives coding agents persistent task, mutation, review, and completion boundaries. It binds verification to the current worktree, preserves project decisions, blocks unauthorized edits, and ends review at a deterministic SHIPPABLE gate.",
      "evidence": "116 collected tests, Windows, macOS, and Linux CI across Python 3.10 and 3.13, seven versioned releases with checksums, deterministic boundary and mechanics benchmarks, and a published research evaluation plan. The historical agentic A/B result is retained but explicitly marked superseded.",
      "reference": "https://github.com/niansia/PSG/blob/main/research/evaluation-plan.md",
      "referenceLabel": "Evaluation plan"
    },
    {
      "id": "noveltyaudit",
      "name": "NoveltyAudit",
      "url": "https://github.com/niansia/NoveltyAudit",
      "category": "Scholarly reasoning",
      "status": "Alpha",
      "description": "An evidence-first Agent Skill for adversarial scholarly novelty audits. It freezes claims before retrieval, identifies Minimal Prior Sets, applies historical cutoffs, tests bridge evidence, and records what the search could not establish.",
      "evidence": "Claim maps, provider-normalized records, evidence-bound prior sets, temporal states, citation-graph bridges, deterministic report invariants, three public case-study classes, and exploratory measurements from 82 reviewer-annotated cases.",
      "reference": "https://github.com/niansia/NoveltyAudit/blob/main/docs/empirical-status.md",
      "referenceLabel": "Empirical status"
    },
    {
      "id": "research-meeting-coach",
      "name": "Research Meeting Coach",
      "url": "https://github.com/niansia/research-meeting-coach",
      "category": "Research workflow",
      "status": "Early alpha",
      "description": "An evidence-grounded Agent Skill that turns raw research progress into a decision-ready advisor meeting. It separates observations from interpretation, carries unresolved requests forward, and frames one advisor-answerable decision without inventing completion.",
      "evidence": "Portable Research Meeting State validation, source and numeric grounding checks, 15 behavioral and adversarial case definitions, eight routing-collision cases, longitudinal holdout structure, and six-job cross-platform CI.",
      "reference": "https://github.com/niansia/research-meeting-coach/blob/main/AUDIT_REPORT.md",
      "referenceLabel": "Evidence audit"
    },
    {
      "id": "chromarecover",
      "name": "ChromaRecover",
      "url": "https://github.com/niansia/ChromaRecover",
      "category": "Computer vision",
      "status": "Public alpha",
      "description": "A local-first computer-vision toolkit for recovering spatial structure carried by subtle color differences. It tests competing hypotheses, preserves auditable artifacts, and abstains when evidence is weak.",
      "evidence": "Masks, overlays, quality signals, provenance, uncertainty states, and algorithm notes.",
      "reference": "https://github.com/niansia/ChromaRecover/blob/main/docs/algorithm.md",
      "referenceLabel": "Algorithm notes"
    }
  ],
  "zh-TW": [
    {
      "id": "lumigrid",
      "name": "LumiGrid",
      "url": "https://github.com/niansia/LumiGrid",
      "category": "電腦視覺",
      "status": "研究原型",
      "description": "低光影像增強：從整張圖的縮圖預測以亮度引導的 Zero-DCE 曲線與色彩矩陣雙邊網格，在全解析度上逐像素切片套用，再用輕量 NAFNet 去除雜訊、補回細節。由先前的課堂專題，以 NTIRE 2025 競賽資料重新設計。",
      "evidence": "在 20 組保留的 NTIRE 2025 測試圖上（官方評分程式）：PSNR 24.57 dB／SSIM 0.840（測試時增強 24.63 dB）；原本的 Zero-DCE 課堂作法為 16.48 dB，同資料監督訓練的 Zero-DCE 為 20.91 dB。附各元件消融實驗、公開權重；210 萬參數，8 GB 筆電顯卡可處理 2400 萬畫素影像。",
      "reference": "https://github.com/niansia/LumiGrid#results",
      "referenceLabel": "成果與消融實驗"
    },
    {
      "id": "taiwan-exam",
      "name": "Taiwan Exam",
      "url": "https://github.com/niansia/taiwan-exam",
      "category": "Agent Skill",
      "status": "學測七科",
      "description": "用於產生原創學測模擬考的 Agent Skill。流程包含答案與難度檢查、套用大考正式版面，並分開交付題目 PDF 與答案詳解 PDF。會考與分科測驗仍在製作中。",
      "evidence": "分科命題指引、來源與答案檢查、版面驗證、考卷模板，以及公開的安裝說明。",
      "reference": "https://github.com/niansia/taiwan-exam/blob/main/SKILL.md",
      "referenceLabel": "Skill 規格"
    },
    {
      "id": "kcrashlab",
      "name": "KCrashLab",
      "url": "https://github.com/niansia/KCrashLab",
      "category": "系統可靠性",
      "status": "證據凍結",
      "description": "以模擬為優先的 Windows 驅動程式可靠性研究平台，用於執行確定且可重現的實驗。系統會標準化案例、續跑中斷的實驗、最小化保留精確簽章的觸發條件，並產生可供獨立驗證的證據包。",
      "evidence": "Canonical Case IR、種子化排程、append-only SQLite journal、精確簽章、3/3 模擬重播、G3、E1、E2 與最小化紀錄、語意驗證，以及跨平台 CI。",
      "reference": "https://github.com/niansia/KCrashLab/blob/main/docs/research-claims.md",
      "referenceLabel": "研究主張帳冊"
    },
    {
      "id": "contextsec",
      "name": "ContextSec",
      "url": "https://github.com/niansia/ContextSec",
      "category": "AI 安全",
      "status": "Research preview",
      "description": "面向 AI 程式代理的確定性產品安全決策層。系統從有界的儲存庫證據推導適用控制項，並將每項決策記錄於 Control Evaluation Ledger。",
      "evidence": "16 個風險包、116 項控制、9 條組合規則、風險輪廓與變異測試案例、真實儲存庫評估，以及跨平台 CI。",
      "reference": "https://github.com/niansia/ContextSec/blob/main/docs/architecture.md",
      "referenceLabel": "架構說明"
    },
    {
      "id": "merriv",
      "name": "Merriv",
      "url": "https://github.com/niansia/Merriv",
      "category": "模型發布",
      "status": "Pre-alpha",
      "description": "面向可部署 AI 模型的廠商中立發布證據層。系統將確切模型產物、配對評估、統計政策、來源資訊與回歸起點綁定為可攜式 Model Change Report。",
      "evidence": "可重現發布紀錄、明確升版政策、來源資訊、回歸定位與獨立驗證路徑。",
      "reference": "https://github.com/niansia/Merriv/blob/main/docs/release-evidence-case-study.md",
      "referenceLabel": "案例研究"
    },
    {
      "id": "ai-repo-gardener",
      "name": "AI Repo Gardener",
      "url": "https://github.com/niansia/ai-repo-gardener",
      "category": "儲存庫分析",
      "status": "Public alpha",
      "description": "面向 AI 編輯 Python 儲存庫的靜態分析工具與可攜式 Agent Skill。薄弱判斷僅供審查；刪除前必須具備經審閱、綁定雜湊的計畫與隔離驗證。",
      "evidence": "匯入可達性、Git 時序、正規化 AST 證據、25 個對抗式安全情境、真實儲存庫冒煙測試，以及跨平台 CI。",
      "reference": "https://github.com/niansia/ai-repo-gardener/blob/main/benchmarks/safety-benchmark.md",
      "referenceLabel": "安全基準"
    },
    {
      "id": "psg",
      "name": "PSG - Project State Graph",
      "url": "https://github.com/niansia/PSG",
      "category": "代理治理",
      "status": "v1.1.4",
      "description": "可安裝的執行環境、MCP 伺服器與可攜式 Agent Skill，為程式代理提供持久的任務、變更、審查與完成邊界。系統將驗證綁定目前工作樹、保存專案決策、阻擋未授權修改，並在確定性的 SHIPPABLE gate 結束審查。",
      "evidence": "116 項測試、Windows、macOS 與 Linux 上的 Python 3.10 和 3.13 CI、7 個附校驗和的版本、確定性邊界與機制基準，以及公開研究評估計畫。歷史 agentic A/B 結果仍保留，但已明確標示為 superseded。",
      "reference": "https://github.com/niansia/PSG/blob/main/research/evaluation-plan.md",
      "referenceLabel": "評估計畫"
    },
    {
      "id": "noveltyaudit",
      "name": "NoveltyAudit",
      "url": "https://github.com/niansia/NoveltyAudit",
      "category": "學術推理",
      "status": "Alpha",
      "description": "以證據為優先的學術新穎性對抗審查 Agent Skill。系統在檢索前凍結主張、找出 Minimal Prior Sets、套用歷史時間截點、檢驗橋接證據，並記錄搜尋未能建立的部分。",
      "evidence": "主張圖、跨供應者正規化紀錄、證據綁定先前研究集合、時間狀態、引文圖橋接、確定性報告不變量、三類公開案例研究，以及 82 筆審稿人標註案例的探索性測量。",
      "reference": "https://github.com/niansia/NoveltyAudit/blob/main/docs/empirical-status.md",
      "referenceLabel": "實證狀態"
    },
    {
      "id": "research-meeting-coach",
      "name": "Research Meeting Coach",
      "url": "https://github.com/niansia/research-meeting-coach",
      "category": "研究工作流程",
      "status": "Early alpha",
      "description": "以證據為基礎的 Agent Skill，將原始研究進度整理為可供導師決策的會議內容。系統區分觀察與解釋、延續尚未完成的請求，並在不虛構完成狀態的前提下提出一項導師可回答的決策。",
      "evidence": "可攜式 Research Meeting State 驗證、來源與數值依據檢查、15 個行為與對抗式案例定義、8 個路由衝突案例、縱向留出結構，以及包含 6 個工作的跨平台 CI。",
      "reference": "https://github.com/niansia/research-meeting-coach/blob/main/AUDIT_REPORT.md",
      "referenceLabel": "證據稽核"
    },
    {
      "id": "chromarecover",
      "name": "ChromaRecover",
      "url": "https://github.com/niansia/ChromaRecover",
      "category": "電腦視覺",
      "status": "Public alpha",
      "description": "以本機運算為核心的電腦視覺工具，用於還原由細微色彩差異承載的空間結構。系統比較多種假設、保留可稽核產物，並在證據不足時選擇不作判定。",
      "evidence": "遮罩、疊圖、品質訊號、來源紀錄、不確定狀態與演算法說明。",
      "reference": "https://github.com/niansia/ChromaRecover/blob/main/docs/algorithm.md",
      "referenceLabel": "演算法說明"
    }
  ],
  "zh-CN": [
    {
      "id": "lumigrid",
      "name": "LumiGrid",
      "url": "https://github.com/niansia/LumiGrid",
      "category": "电脑视觉",
      "status": "研究原型",
      "description": "低光影像增强：从整张图的缩略图预测以亮度引导的 Zero-DCE 曲线与色彩矩阵双边网格，在全分辨率上逐像素切片套用，再用轻量 NAFNet 去除杂讯、补回细节。由先前的课堂专题，以 NTIRE 2025 竞赛数据重新设计。",
      "evidence": "在 20 组保留的 NTIRE 2025 测试图上（官方评分程序）：PSNR 24.57 dB／SSIM 0.840（测试时增强 24.63 dB）；原本的 Zero-DCE 课堂作法为 16.48 dB，同数据监督训练的 Zero-DCE 为 20.91 dB。附各组件消融实验、公开权重；210 万参数，8 GB 笔电显卡可处理 2400 万像素影像。",
      "reference": "https://github.com/niansia/LumiGrid#results",
      "referenceLabel": "成果与消融实验"
    },
    {
      "id": "taiwan-exam",
      "name": "Taiwan Exam",
      "url": "https://github.com/niansia/taiwan-exam",
      "category": "Agent Skill",
      "status": "学测七科",
      "description": "用于生成原创学测模拟考的 Agent Skill。流程包括答案与难度检查、套用正式考试版式，并分别交付试题 PDF 和答案详解 PDF。会考与分科测验仍在制作中。",
      "evidence": "分科命题指引、来源与答案检查、版式验证、试卷模板，以及公开的安装说明。",
      "reference": "https://github.com/niansia/taiwan-exam/blob/main/SKILL.md",
      "referenceLabel": "Skill 规范"
    },
    {
      "id": "kcrashlab",
      "name": "KCrashLab",
      "url": "https://github.com/niansia/KCrashLab",
      "category": "系统可靠性",
      "status": "证据冻结",
      "description": "以模拟为优先的 Windows 驱动程序可靠性研究平台，用于执行确定且可复现的实验。系统会规范化案例、续跑中断的实验、最小化保留精确签名的触发条件，并生成可供独立验证的证据包。",
      "evidence": "Canonical Case IR、种子化调度、append-only SQLite journal、精确签名、3/3 模拟重放、G3、E1、E2 与最小化记录、语义验证，以及跨平台 CI。",
      "reference": "https://github.com/niansia/KCrashLab/blob/main/docs/research-claims.md",
      "referenceLabel": "研究主张账册"
    },
    {
      "id": "contextsec",
      "name": "ContextSec",
      "url": "https://github.com/niansia/ContextSec",
      "category": "AI 安全",
      "status": "Research preview",
      "description": "面向 AI 编程代理的确定性产品安全决策层。系统从有界的代码仓库证据推导适用控制项，并将每项决策记录于 Control Evaluation Ledger。",
      "evidence": "16 个风险包、116 项控制、9 条组合规则、风险画像与变异测试用例、真实代码仓库评估，以及跨平台 CI。",
      "reference": "https://github.com/niansia/ContextSec/blob/main/docs/architecture.md",
      "referenceLabel": "架构说明"
    },
    {
      "id": "merriv",
      "name": "Merriv",
      "url": "https://github.com/niansia/Merriv",
      "category": "模型发布",
      "status": "Pre-alpha",
      "description": "面向可部署 AI 模型的厂商中立发布证据层。系统将确切模型产物、配对评估、统计策略、来源信息与回归起点绑定为可移植的 Model Change Report。",
      "evidence": "可复现发布记录、明确升级策略、来源信息、回归定位与独立验证路径。",
      "reference": "https://github.com/niansia/Merriv/blob/main/docs/release-evidence-case-study.md",
      "referenceLabel": "案例研究"
    },
    {
      "id": "ai-repo-gardener",
      "name": "AI Repo Gardener",
      "url": "https://github.com/niansia/ai-repo-gardener",
      "category": "代码仓库分析",
      "status": "Public alpha",
      "description": "面向 AI 编辑 Python 代码仓库的静态分析工具与可移植 Agent Skill。薄弱判断仅供审查；删除前必须具备经过审阅、绑定哈希的计划与隔离验证。",
      "evidence": "导入可达性、Git 时序、规范化 AST 证据、25 个对抗式安全场景、真实代码仓库冒烟测试，以及跨平台 CI。",
      "reference": "https://github.com/niansia/ai-repo-gardener/blob/main/benchmarks/safety-benchmark.md",
      "referenceLabel": "安全基准"
    },
    {
      "id": "psg",
      "name": "PSG - Project State Graph",
      "url": "https://github.com/niansia/PSG",
      "category": "代理治理",
      "status": "v1.1.4",
      "description": "可安装的运行环境、MCP 服务器与可移植 Agent Skill，为编程代理提供持久的任务、变更、审查与完成边界。系统将验证绑定当前工作树、保存项目决策、阻止未授权修改，并在确定性的 SHIPPABLE gate 结束审查。",
      "evidence": "116 项测试、Windows、macOS 与 Linux 上的 Python 3.10 和 3.13 CI、7 个附校验和的版本、确定性边界与机制基准，以及公开研究评估计划。历史 agentic A/B 结果仍保留，但已明确标记为 superseded。",
      "reference": "https://github.com/niansia/PSG/blob/main/research/evaluation-plan.md",
      "referenceLabel": "评估计划"
    },
    {
      "id": "noveltyaudit",
      "name": "NoveltyAudit",
      "url": "https://github.com/niansia/NoveltyAudit",
      "category": "学术推理",
      "status": "Alpha",
      "description": "以证据为优先的学术新颖性对抗审查 Agent Skill。系统在检索前冻结主张、找出 Minimal Prior Sets、应用历史时间截点、检验桥接证据，并记录搜索未能建立的部分。",
      "evidence": "主张图、跨供应商规范化记录、证据绑定既有研究集合、时间状态、引文图桥接、确定性报告不变量、三类公开案例研究，以及 82 条审稿人标注案例的探索性测量。",
      "reference": "https://github.com/niansia/NoveltyAudit/blob/main/docs/empirical-status.md",
      "referenceLabel": "实证状态"
    },
    {
      "id": "research-meeting-coach",
      "name": "Research Meeting Coach",
      "url": "https://github.com/niansia/research-meeting-coach",
      "category": "研究工作流程",
      "status": "Early alpha",
      "description": "以证据为基础的 Agent Skill，将原始研究进展整理为可供导师决策的会议内容。系统区分观察与解释、延续尚未完成的请求，并在不虚构完成状态的前提下提出一项导师可回答的决策。",
      "evidence": "可移植 Research Meeting State 验证、来源与数值依据检查、15 个行为与对抗式案例定义、8 个路由冲突案例、纵向留出结构，以及包含 6 个任务的跨平台 CI。",
      "reference": "https://github.com/niansia/research-meeting-coach/blob/main/AUDIT_REPORT.md",
      "referenceLabel": "证据审计"
    },
    {
      "id": "chromarecover",
      "name": "ChromaRecover",
      "url": "https://github.com/niansia/ChromaRecover",
      "category": "计算机视觉",
      "status": "Public alpha",
      "description": "以本地运行为核心的计算机视觉工具，用于恢复由细微色彩差异承载的空间结构。系统比较多种假设、保留可审计产物，并在证据不足时选择不作判断。",
      "evidence": "掩膜、叠加图、质量信号、来源记录、不确定状态与算法说明。",
      "reference": "https://github.com/niansia/ChromaRecover/blob/main/docs/algorithm.md",
      "referenceLabel": "算法说明"
    }
  ]
};
