"""Training questions for Yuki's "trained" chat tier (assets/js/yuki-pro.js).

The tier answers knowledge questions about the site: projects (compare, details, status, evidence, links, lists, topics,
latest, recommendations, live demos), the blog (latest post, paper notes, search) and the site's own features. The
answers are composed in the browser from the live site data, so new projects and posts need no retraining; only a new
kind of question does. Everything else (greetings, commands, Yuki's actions, small talk) is labelled `other` and goes to
the small model in yuki-brain.js, whose templates are reused here for that class.

Templates use (a|b) alternatives and [optional] parts like yuki_brain_data.py. Slots: {p} and {q} are project mentions
(replaced by the token `zproj` in training and in the browser), {t} a topic, {k} a blog keyword.
"""
from __future__ import annotations

from yuki_brain_data import INTENTS as BASE_INTENTS

TOPICS = ['AI 安全', '資安', '安全', '電腦視覺', '影像', '圖片', '顏色', '代理', 'agent', '程式代理', '驅動程式', '系統可靠性',
          '考試', '學測', '教育', '學術', '論文', '研究流程', '開會', '模型發布', '模型部署', '儲存庫', '程式碼清理', '低光', '夜景',
          '對抗樣本', 'security', 'ai security', 'computer vision', 'images', 'color', 'agents', 'coding agents', 'drivers',
          'reliability', 'exams', 'education', 'research', 'papers', 'meetings', 'model release', 'repositories', 'low light',
          'adversarial examples', 'machine learning', 'deep learning', 'web demos']
KEYWORDS = ['V-Skip', 'RINE', 'SigLIP', 'NTIRE', 'KV cache', 'VLM', '視覺語言模型', '幻覺', 'AI 生成圖', 'token 壓縮', '長影片', '多智能體',
            'Act2See', 'SwarmWorld', 'Reroute', 'VisionPulse', 'VTC-R1', '思考鏈', '推理鏈', '假圖偵測', '比賽', '影片推理', 'CLIP',
            'hallucination', 'token compression', 'long video', 'multi-agent', 'chain of thought', 'fake image detection',
            'vision language models', 'video reasoning', 'competition', 'robustness', '穩健性', '預訓練', 'pretraining']

INTENTS: dict[str, list[str]] = {
    'p_compare': [
        '{p}(跟|和|與|還有){q}(的|有什麼|有啥|哪裡)(差別|差異|不同|區別)[是什麼]', '{p}(跟|和){q}哪(個|一個)(比較|更)(好|強|適合我|值得看)',
        '比較[一下]{p}(跟|和){q}', '{p}(vs|對比|對上){q}', '{p}(跟|和){q}(有什麼不一樣|差在哪|一樣嗎|差在哪裡)',
        '{p}(跟|和){q}(是在做同一件事嗎|是同一類嗎|有關係嗎)', '{p}(跟|和){q}這兩個(專案|作品)(的)?(差別|不同)',
        '(這兩個|兩個)(專案|作品)(差在哪|有什麼不同|差別是什麼)', '{p}(比|勝過){q}(好|強)(在哪|嗎)', '{p}和{q}要怎麼選',
        'what(s| is) the difference between {p} and {q}', '{p} (vs|versus) {q}', 'compare {p} (and|with|to) {q}',
        'how (is|does) {p} differ from {q}', '(which|what) (is|s) better[,] {p} or {q}', 'is {p} the same (as|thing as) {q}',
        'how are {p} and {q} different', '{p} or {q}[, which one]', 'difference between these two projects',
    ],
    'p_detail': [
        '{p}是(什麼|啥|在做什麼|幹嘛的|做什麼用的)', '介紹[一下]{p}', '{p}(在做什麼|是做什麼的|有什麼用|能做什麼)', '跟我(說說|講講|聊聊){p}',
        '什麼是{p}', '{p}(的)?(功能|用途)是什麼', '{p}是怎麼運作的', '我想(了解|知道){p}', '{p}(的)?(重點|特色)是什麼', '可以解釋{p}嗎',
        'what is {p}', 'tell me (about|more about) {p}', 'what does {p} do', 'explain {p}', 'introduce {p}', 'what can {p} do',
        'how does {p} work', 'what is {p} for', 'i want to know about {p}', 'what is special about {p}',
    ],
    'p_status': [
        '{p}(做完了|完成了|做好了)[嗎]', '{p}(現在|目前)(的)?(狀態|進度)(是什麼|如何|怎樣)', '{p}(還在開發|還在做|還有在更新)[嗎]',
        '{p}是(哪個|第幾)版[本]', '{p}可以(用了|正式使用)[嗎]', '{p}(穩定|成熟)[嗎]', '{p}(上線了|發布了)[嗎]', '{p}進度到哪了',
        'is {p} (finished|done|ready|stable)', 'what is the status of {p}', '(what|which) version is {p}', 'is {p} still in development',
        'can i use {p} (yet|now)', 'how far along is {p}', 'has {p} been released',
    ],
    'p_evidence': [
        '{p}(有什麼|有哪些)(證據|成果|結果|測試|數據)', '{p}(怎麼|如何)(驗證|證明|測試)(的)?', '{p}(的)?(效果|表現)(如何|怎麼樣|好嗎)',
        '{p}(可信|可靠)[嗎]', '{p}有(幾|多少)[個|項]測試', '{p}(真的)?有用嗎', '{p}有跑過(實驗|評估)嗎',
        'how was {p} (tested|verified|evaluated)', 'what (evidence|results) does {p} have', 'does {p} (really )?work', 'how good is {p}',
        'any (benchmarks|tests|results) for {p}', 'is {p} reliable', 'how many tests does {p} have', 'does {p} (actually|truly) (work|deliver)', 'is {p} any good',
    ],
    'p_link': [
        '{p}(的)?(github|原始碼|程式碼|源碼|連結|網址)(在哪|是什麼)', '哪裡可以(看|下載|找到){p}(的)?(程式碼|原始碼)', '{p}(有|在)github[上]嗎',
        '給我{p}(的)?(連結|網址|repo)', '{p}(開源|有開源)嗎', '{p}的repo', '我想看{p}的程式碼',
        'where is (the )?{p} (code|source|repo|repository)', '{p} github', 'link to {p}', 'where can i (download|get|find) {p}',
        'give me the {p} repo', 'is {p} open source', 'source code for {p}',
    ],
    'p_list': [
        '(有|總共有|一共有)(哪些|幾個|多少個)(作品|專案|項目)', '(作品|專案)(清單|列表|有哪些)', '他(做過|做了)(哪些|什麼)(東西|作品|專案)', '全部(的)?作品',
        '(作品|專案)(總共|一共)[有](幾|多少)[個]', '列出(所有|全部)(的)?(作品|專案)', 'niansia(做過|有)什麼(作品|專案)',
        'what projects (are there|do you have)', 'how many projects (are there|did he make|does niansia have)', 'list (all )?(the )?projects',
        'show me everything (he|niansia) built', 'what has niansia (built|made)', 'all projects', 'what is in the portfolio', 'list (every|each) project', 'every project (please|you have)',
    ],
    'p_category': [
        '有(哪些|什麼|沒有)(跟|和){t}(有關|相關)(的)?(作品|專案)', '{t}(的|方面的|類的)(作品|專案)(有哪些|有幾個)', '(哪些|哪個)(作品|專案)(是|屬於|在做){t}',
        '我對{t}有興趣[，]有(推薦|什麼)[嗎]', '(有|有沒有){t}(的)?(作品|專案)', '關於{t}的(作品|專案)',
        '(which|what) projects are about {t}', 'any {t} projects', 'projects (on|about|related to) {t}', 'i am interested in {t}[, what should i look at]',
        'show me {t} (work|projects)', 'is there anything about {t}', 'any {t} (stuff|things|work)', '{t} stuff', 'got anything (on|for) {t}',
    ],
    'p_latest': [
        '(最新|最近)(的)?(作品|專案|項目)(是|是什麼|是哪個|是甚麼)', '(最近|最新)(在做|做了)什麼[作品|專案]', '(最新|最近)(上線|推出|完成)(的)?(作品|東西|專案)',
        '哪個(是)?最新的(作品|專案)', '目前最新的(專案|作品)是(什麼|甚麼|哪個)', '最近有新(作品|專案)嗎', '最新做的是什麼',
        '(what is )?(the )?(latest|newest|most recent) project', 'what (is he|are you|is niansia) working on (lately|now|recently)',
        'what did niansia (build|make|ship) recently', 'newest work', 'any new projects',
    ],
    'p_recommend': [
        '推薦(一個|幾個)?(作品|專案)', '推薦(我|給我)(一個|幾個|一下)', '可以推薦(我)?嗎', '幫我挑一個(作品|專案)', '(第一次來|新手)(應該)?(先)?看(哪個|什麼)', '哪個(作品|專案)最(值得看|有趣|好玩|厲害|推薦)',
        '(你|妳)最喜歡(哪個|哪一個)(作品|專案)', '有(什麼|哪個)(作品|專案)(值得|推薦)(看|一看)', '從哪個(作品|專案)開始看',
        'recommend a project', 'which project should i (look at|check out) first', 'what is the (best|coolest|most interesting) project',
        'what is your favorite project', 'where should i start', 'which one should i see first', 'where do i (begin|start)', 'pick one for me', 'suggest (one|a project)',
    ],
    'p_playable': [
        '(有|有沒有)(可以|能)(直接|線上)?(試玩|玩|試用|操作)的(作品|東西|demo)', '(哪個|哪些)(作品|專案)可以(線上|直接)?(試玩|試用|玩)',
        '有(demo|示範|展示)(嗎|可以看嗎)', '可以在瀏覽器(上|裡)(跑|玩|試)的(作品|專案)', '有(互動|線上)(的)?(demo|展示)嗎', '我想(玩|試試)看(作品|東西)',
        '(is there|are there) (a )?(demo|demos)', 'which projects can i (try|play with) (online|in the browser)', 'anything i can (try|play with)',
        'live demo', 'can i try (something|any project) (now|here)', 'interactive demos',
    ],
    'b_latest': [
        '(最新|最近)(的)?(文章|部落格|網誌|blog|貼文)(是什麼|是哪篇)', '(最近|最新)(寫|發)了什麼(文章)?', '部落格(最近|最新)(在寫|寫了)什麼',
        '有(新|最新)(文章|blog)嗎', '最新一篇(文章|blog)', '最近的(blog|部落格)',
        '(what is )?(the )?(latest|newest|most recent) (blog )?post', 'what did (he|niansia) write (recently|lately)', 'anything new on the blog',
        'latest article', 'newest blog post', 'recent posts',
    ],
    'b_papers': [
        '(最近|最新)(讀|看)了(哪些|什麼)(論文|paper)', '(論文|paper)(筆記|心得)(有哪些|有什麼)', '(他|妳|你)(讀過|看過)(哪些|什麼)論文',
        '有(哪些|什麼)(讀書|論文)(心得|筆記)', '論文筆記', '讀了什麼paper',
        'what papers (has he|did niansia|did you) read', '(paper|reading) notes', 'what papers were read recently', 'list the paper notes',
        'which papers did niansia write about',
    ],
    'b_search': [
        '有(沒有)?(寫過|關於|講)?{k}(的)?(文章|筆記|心得)', '(部落格|blog)(有|有沒有)(提到|寫到|寫){k}', '{k}(的)?(文章|筆記|心得)(在哪|有嗎)',
        '(他|妳|你)(對|怎麼看){k}', '有讀過{k}嗎', '{k}那篇(文章|筆記)',
        '(any|is there a) (post|article|note) (about|on) {k}', 'did (he|niansia) write about {k}', '(blog|notes) on {k}',
        'what does niansia think about {k}', 'did you read {k}', 'the {k} post',
    ],
    's_features': [
        '這個網站(有什麼|有哪些)(功能|特色|可以做什麼)', '(網站|這裡)(可以|能)(做|玩)什麼', '這個(網站|網頁)(有什麼|哪裡)(特別|好玩)',
        '(介紹|說明)[一下][這個]網站', '網站有什麼好玩的', '這個網站在幹嘛',
        'what can i do (here|on this site)', 'what features does (this|the) site have', 'what is special about this (site|website)',
        'tour of the site', 'what is this website', 'what is on this site',
    ],
    's_yuki': [
        '(你|妳|yuki)(有什麼|有哪些)(功能|技能|本事)', '(等級|升級|經驗)(要|有)什麼用', '怎麼(讓你|讓妳)升級', '(你|妳)會(餓|累|生氣)嗎',
        '(變成|變)貓[咪](是什麼|怎麼變)', '(怎麼|如何)(餵你|照顧你|跟你玩)', '升級可以解鎖什麼', '(你|妳)會做哪些動作',
        'what can you do yuki', 'how do i level you up', 'what do levels unlock', 'do you get hungry', 'how do i take care of you',
        'can you turn into a cat', 'what happens when you level up',
    ],
    's_models': [
        '(快速|特訓|1.5b|大模型)[模式](有什麼|有啥)?(差別|不同)', '(你|妳)(用|是)(什麼|哪個)模型', '(三種|這幾種)模型(差在哪|有什麼不同)',
        '1.5b(是什麼|要怎麼用|為什麼(這麼|很)慢)', '(怎麼|如何)(切換|換)模型', '(哪個|哪種)模型(比較好|比較快)', '特訓模型是什麼',
        'what model are you', 'difference between (the )?(fast|trained|1.5b) (mode|model)', 'which model should i use',
        'why is the 1.5b (model )?slow', 'how do i switch models', 'what is the trained model',
    ],
    's_themes': [
        '(有|總共有)(幾|多少)(種|個)(風格|主題|配色)', '(怎麼|如何)(換|改|切換)(風格|主題|配色|顏色)', '(風格|主題)(有哪些|可以換嗎)', '可以換主題嗎',
        'how many (themes|styles) are there', 'how do i change the (theme|style|colors)', 'what themes are (there|available)', 'can i change the theme',
    ],
    's_guestbook': [
        '(留言板|留言)(在哪|怎麼用|怎麼留言)', '我(可以|要怎麼)(留言|留話)', '(哪裡|怎麼)[可以]留言給(他|niansia|站長)', '有留言板嗎',
        'where is the guestbook', 'how do i leave a message', 'can i leave a comment', 'is there a guestbook',
    ],
    's_exams': [
        '(考卷|試卷|模擬考)(分享區|在哪|哪裡下載|可以下載嗎)', '(哪裡|怎麼)[可以](下載|拿到)(學測|模擬考|考卷)', '(怎麼|如何)(上傳|分享)(考卷|試卷)',
        '考卷分享區(是什麼)?', '有(模擬考|考古題|練習題)嗎',
        'where can i download (mock )?exams', 'exam gallery', 'how do i (upload|share) an exam', 'are there practice exams',
    ],
    's_community': [
        '(line)(社群|群組)(在哪|怎麼加|是什麼)', '(有|有沒有)(學測|分科)(的)?(社群|群組)', '(怎麼|如何)加入(社群|群組)', '(社群|群組)有(幾|多少)人',
        '(line|line community|group chat)', 'how do i join the (community|group)', 'is there a (study|exam) group', 'how many members (are there|in the community)',
    ],
    's_search': [
        '(怎麼|如何)(搜尋|找東西)', '(有|有沒有)搜尋[功能]', '(快捷鍵|ctrl k|指令)(是什麼|有哪些)', '(怎麼|如何)用(終端|指令)',
        'how do i search', 'is there a search', 'keyboard shortcuts', 'how do i use the terminal commands',
    ],
    's_brief': [
        '(時間不多|快速瀏覽|一頁式簡介)(在哪|是什麼)?', '(有|有沒有)(一頁|快速)(的)?(簡介|介紹)', '(給我|我想看)(快速|簡短)(的)?(版本|介紹)', '有簡單版的介紹嗎',
        'quick overview', 'is there a one page summary', 'short version', 'give me the brief',
    ],
    's_log': [
        '(研究日誌|最新動態|更新紀錄|日誌)(在哪|是什麼)?', '(網站|他)最近(更新|改)了什麼', '(最近|最新)(進度|動態)',
        'research log', 'what is new on the site', 'recent updates', 'changelog',
    ],
    's_tech': [
        '這個網站(是)?(怎麼|用什麼)(做|寫|架)的', '網站(用了|用)(什麼|哪些)(技術|框架)', '(網站|你)(放在|架在)哪[裡]', '網站是用什麼寫的',
        'how was this site (built|made)', 'what (tech|framework|stack) is this site', 'where is the site hosted',
    ],
    's_privacy': [
        '(你|妳|網站)(會|有)(記錄|收集|蒐集)(我的)?(資料|對話|個資)[嗎]', '(我打的字|對話)(會|有)(傳出去|上傳|被看到)[嗎]', '(有|會)用cookie[嗎]',
        '(人數|造訪次數)(是)?(怎麼算|怎麼計)(的)?', '這裡的對話安全嗎',
        'do you (record|collect|store) my data', 'is my chat (sent|uploaded|private)', 'do you use cookies', 'how are visits counted',
    ],
}

# Questions about Niansia, commands, Yuki's actions and small talk stay with the small model.
HANDLED = {'projects_list', 'project_detail', 'project_find', 'project_recommend', 'project_latest', 'github'}
OTHER = [t for name, templates in BASE_INTENTS.items() if name not in HANDLED for t in templates]

# Realistic held-out questions, never used for training.
TEST = [
    ('Taiwan Exam跟PSG這兩個專案的差別是?', 'p_compare'), ('KCrashLab 和 ContextSec 哪個比較難', 'p_compare'), ('merriv vs psg', 'p_compare'),
    ('那麼目前最新的專案是甚麼', 'p_latest'), ('最近在忙什麼新東西', 'p_latest'), ("what's the newest thing you built", 'p_latest'),
    ('LumiGrid 到底在幹嘛', 'p_detail'), ('can you explain chromarecover', 'p_detail'), ('PSG 是第幾版了', 'p_status'),
    ('noveltyaudit 可以用了嗎', 'p_status'), ('KCrashLab 有測試嗎', 'p_evidence'), ('does merriv actually work?', 'p_evidence'),
    ('taiwan exam 的程式碼在哪', 'p_link'), ('psg repo', 'p_link'), ('總共做了幾個作品', 'p_list'), ('list every project please', 'p_list'),
    ('有電腦視覺的作品嗎', 'p_category'), ('any security stuff?', 'p_category'), ('推薦我一個', 'p_recommend'), ('where do i begin', 'p_recommend'),
    ('有沒有可以直接玩的', 'p_playable'), ('any demo i can try?', 'p_playable'), ('最近有寫新文章嗎', 'b_latest'), ('newest post?', 'b_latest'),
    ('讀過哪些論文', 'b_papers'), ('有寫過 SigLIP 的心得嗎', 'b_search'), ('did you write about token compression', 'b_search'),
    ('這網站可以幹嘛', 's_features'), ('你會餓嗎', 's_yuki'), ('1.5B 為什麼那麼慢', 's_models'), ('可以換幾種配色', 's_themes'),
    ('要去哪裡留言', 's_guestbook'), ('哪裡有模擬考可以下載', 's_exams'), ('學測群組怎麼加', 's_community'), ('網站用什麼做的', 's_tech'),
    ('你會偷看我打的字嗎', 's_privacy'), ('你是誰', 'other'), ('嗨嗨', 'other'), ('摸摸', 'other'), ('換成深色模式', 'other'),
    ('niansia 是誰', 'other'), ('今天好累', 'other'), ('講個笑話', 'other'), ('thanks!', 'other'), ('陪我玩', 'other'),
    ('有影像相關的東西嗎', 'p_category'), ('which project is easiest to try?', 'p_playable'), ('給我推薦一下', 'p_recommend'),
    ('chromarecover 跟 lumigrid 差在哪裡', 'p_compare'), ('網站上的考卷哪裡拿', 's_exams'), ('你喜歡吃什麼', 'other'),
]
