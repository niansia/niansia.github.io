"""Training utterances and replies for Yuki's local intent model.

Templates expand ``(a|b)`` alternatives and ``[optional]`` parts. Entity mentions are
delexicalised before the model sees them: {p} is a project, {l} a language, {t} a
theme, {topic} a research topic. Simplified Chinese input is folded to Traditional in
the browser, so templates are written in English and Traditional Chinese only.
"""

INTENTS: dict[str, list[str]] = {
    'greet': [
        '(hi|hello|hey|hiya|yo|howdy|heya|hallo)[ there][ yuki]', 'good (morning|afternoon|evening)[ yuki]',
        'nice to meet you', 'hey how are things', 'hello friend', 'greetings',
        '(你好|妳好|哈囉|嗨|早安|午安|安安|嘿|哈摟|嗨嗨|你好啊|哈囉哈囉)[呀|啊|喔|～][ yuki]',
        '(很高興認識你|初次見面|又見面了|我來了|我回來了)', 'yuki[ 你好| 嗨| 哈囉]', '(你好|嗨|哈囉|早安)(小貓|貓咪|貓貓|yuki)', '(hi|hello|hey) (kitty|cat|there cutie)',
    ],
    'bye': [
        '(bye|goodbye|see you|see ya|good night|gotta go|later|bye bye|farewell|catch you later)[ yuki]',
        'i have to go[ now]', 'i am leaving', 'talk to you later', 'see you (tomorrow|soon|next time|around)', 'i am going to (bed|sleep) now',
        '(掰掰|再見|拜拜|下次見|我先走了|晚安|晚安囉|先閃了|我要走了|我要下線了|明天見|先這樣)[ yuki]', '我(要|先)去睡(覺)?了[ 掰掰| 晚安]',
    ],
    'thanks': [
        '(thanks|thank you|thx|ty|appreciate it|thanks a lot|much appreciated|thank you so much)[ yuki]',
        '(謝謝|感謝|多謝|謝啦|感恩|謝謝你|謝謝妳|辛苦了|謝謝幫忙|太感謝了)[ yuki]',
    ],
    'yuki_self': [
        'who are you', 'what are you', "what('s| is) your name", 'tell me about yourself', 'introduce yourself',
        'are you (a bot|a cat|an ai|a robot|real|human|a girl)', 'how old are you', 'where do you live',
        'what is yuki', 'who is yuki', 'what exactly are you', 'are you alive', 'are you chatgpt', 'what model are you', 'how do you work',
        '(你|妳)是誰', '(你|妳)叫什麼(名字)?', '介紹一下(你|妳)自己', '(你|妳)是(貓|機器人|ai|人類|真人|女生)嗎',
        '(你|妳)是什麼', 'yuki是誰', '(你|妳)幾歲', '(你|妳)住在哪', '(你|妳)是怎麼運作的', '(你|妳)是 ?chatgpt 嗎', '(你|妳)是什麼模型',
    ],
    'about_owner': [
        'who is niansia', 'who made this (site|website|page|terminal)', 'tell me about niansia', 'who is the owner',
        'about the author', 'who built this', 'what does niansia do', 'about niansia', 'who is your (owner|creator|master)',
        'tell me about (him|her|them|the author)', 'about me page', 'open about',
        '(niansia|作者|站長|版主|你主人|妳主人|你的主人)是誰', '介紹一下(niansia|作者|站長|你的主人|他|她)',
        '這個(網站|網頁|終端)是誰做的', '誰做了這個(網站|網頁)', '關於(作者|niansia|站長)', 'niansia 是做什麼的',
        '(他|她|作者)是(什麼樣的|怎樣的)人', '打開關於我', '關於我', '認識(作者|niansia|他|她)',
    ],
    'education': [
        'where did (niansia|they|he|she|the author) (study|go to school)', 'which (school|university|college)',
        'education[ background]', 'what degree', 'is (niansia|she|he|the author) a student', 'what are they studying',
        'masters or phd', 'why the leave of absence', 'which university do they attend',
        '(niansia|他|她|作者|你主人)?(讀|念)(哪|哪間|什麼)(學校|大學)', '學歷', '畢業(於)?哪裡', '大學(讀|念)什麼(系)?',
        '是(碩士|博士|學生)嗎', '(研究所|碩士)(讀|念)哪裡', '為什麼休學', '在哪裡念書', '(科系|主修)是什麼', '學校',
    ],
    'research': [
        "what (is|are) (niansia's|their|his|her|the author's)? ?research (interests|topics|areas|direction)",
        'what do they research', 'research interests', 'what is the research about', 'research direction',
        'what are you (curious|studying) about', 'what field', 'open research',
        '研究(方向|主題|興趣|領域|題目)(是什麼)?', '(他|她|作者|niansia)?在研究什麼', '做什麼研究', '研究內容',
        '對什麼(有興趣|感興趣)', '(他|她)的專長是什麼', '研究領域', '打開研究', '研究頁面',
    ],
    'projects_list': [
        '(show|list) (me )?(all )?(the )?(projects|works|portfolio|repos)', 'what projects (do they have|has niansia made|are there)',
        'what (has niansia|did they|did the author) (build|built|make|made|create|created)', 'portfolio', 'projects',
        'what have they worked on', 'show me their work', 'can i see (the|their|your) (projects|work|portfolio)', 'i want to see the projects', 'open the project folder', 'what can i see here',
        '(有|他有|她有|作者有|niansia有)(哪些|什麼)作品', '作品(集|有哪些|列表|清單)', '(帶我)?(去)?看(看)?作品',
        '(他|她|作者|niansia|你主人)做過(什麼|哪些)(東西|作品|專案|項目)', '(專案|項目)(列表|有哪些)', '有什麼專案',
        '(我這人|這個人)有什麼作品', '全部作品', '打開作品(資料夾)?', '作品', '給我看作品',
    ],
    'project_detail': [
        '(tell me about|what is|whats|explain|describe|introduce|open|show me|show) {p}', '{p}', '{p} please',
        'what does {p} do', 'how does {p} work', '{p} details', 'more about {p}', 'i want to know about {p}',
        'what is {p} for', 'what problem does {p} solve', 'is {p} finished', 'status of {p}',
        '(介紹|說說|講講|解釋)(一下)?{p}', '{p}(是什麼|是幹嘛的|在做什麼|做什麼用的|怎麼運作|有什麼功能|的介紹|的狀態|完成了嗎)',
        '我想(看|了解|知道){p}', '打開{p}', '{p}是啥', '跟我說{p}', '{p}好厲害', '那{p}呢', '(那個|這個){p}(作品|專案)?', '{p}(那個|這個)?(作品|專案)', '{p}(的作品|作品)(是什麼)?', 'the {p} project', 'about {p}',
    ],
    'project_find': [
        'which project (is about|deals with|relates to|uses|involves|is for) {topic}', 'any projects (on|about|for) {topic}',
        'is there a project (for|about) {topic}', 'do they have anything (on|about) {topic}', 'projects about {topic}',
        'something related to {topic}', 'i am interested in {topic}',
        '(哪個|哪一個|有沒有)(作品|專案|項目)(跟|和|與|關於){topic}(有關)?', '有沒有(做|關於){topic}的(作品|專案)',
        '{topic}(相關|有關)的(作品|專案)', '我想找(關於)?{topic}的(作品|專案)', '我對{topic}有興趣', '做{topic}的是哪個',
    ],
    'project_recommend': [
        'which project (is the best|should i look at first|do you recommend|is your favorite|is the coolest|is most interesting)',
        'recommend (a|one) project', "what('s| is) the highlight", 'where should i start', 'best project', 'surprise me',
        'pick a project for me', 'random project',
        '(推薦|最推)(一個|哪個)?(作品|專案)', '哪個作品最(好|厲害|有趣|酷|值得看|推薦)', '(你|妳)最喜歡哪個作品',
        '代表作(是什麼)?', '從哪個(開始|先)看', '隨便(推薦|挑)一個', '給我驚喜', '哪個最好玩',
    ],
    'project_latest': [
        "(what's|what is) the (latest|newest|most recent) project", "what's new", 'newest work', 'recent work',
        'what are they working on (now|lately)', 'latest addition',
        '最(新|近)的作品(是什麼)?', '最近在(做|忙)什麼', '有什麼新(東西|作品)', '最新加入', '新作品',
    ],
    'skills': [
        'what (skills|languages|tools|tech|technologies|stack) does (niansia|he|she|the author|they) (use|know|have)',
        'tech stack', 'can they code', 'programming languages', 'what are their skills', 'do they know python',
        '(會|擅長)(什麼|哪些)(技術|程式語言|工具)', '技能(有哪些)?', '技術棧', '用什麼語言寫程式', '會 ?python 嗎', '擅長什麼',
    ],
    'contact': [
        'how (can|do) i (contact|reach|email) (niansia|them|him|her|the author)', 'email', 'email address', 'get in touch',
        'contact info', 'can we collaborate', 'i want to hire (them|niansia)', 'send an email', 'contact',
        '(怎麼|如何)(聯絡|聯繫|找到)(他|她|作者|niansia|你主人)', '(聯絡|聯繫)(方式|資訊)', '信箱(是什麼|多少)?', '(郵箱|電子郵件|郵件|mail)(是什麼|是多少|多少)?', '(他|她|作者)的(信箱|郵箱|email)', 'email ?是多少',
        '想(合作|邀約)', '我想寄信', '可以合作嗎', '聯絡', '怎麼寫信給(他|她)',
    ],
    'github': [
        'github', '(where is|show me) the (source code|github|repo|code)', 'github (link|account|profile)', 'source code',
        '原始碼(在哪)?', 'github ?(在哪|帳號|連結|網址)', '程式碼在哪(裡)?', '看原始碼',
    ],
    'set_language': [
        '(switch|change|set) (the )?(language )?to {l}', '(use|speak|show|display) {l}', '{l} please', 'in {l}',
        'can you speak {l}', '{l} version', 'i (want|prefer) {l}', 'change language', 'switch language',
        '(切換|換|改)(成|到|為)?{l}', '(用|說|講){l}', '我要(看)?{l}', '{l}版', '語言(換成|切換到|改成){l}',
        '(換|切換)語言', '可以用{l}嗎', '我看不懂中文', '我看不懂英文',
    ],
    'set_theme': [
        '(switch|change|set) (the )?(theme|style|mode|look|skin|colors?) to {t}', '{t} (mode|theme|style)',
        'make it {t}', 'turn on {t} mode', 'i want {t}', 'change (the )?(theme|style|look|colors)', 'too bright', 'too dark',
        'new style', 'another theme',
        '(切換|換|改|變)(成|到|為)?{t}(模式|主題|風格|配色)?', '我想要{t}(模式|風格|主題)?', '{t}(模式|風格|主題)',
        '(網頁|網站)?(風格|主題|配色)(換成|切換到|改成){t}', '換(個|一個)?(風格|主題|配色|樣式)', '太亮了', '太暗了', '眼睛好痛',
    ],
    'motion': [
        '(stop|pause|turn off|disable) (the )?(animations?|motion|effects)', '(turn on|enable|resume|start) (the )?(animations?|motion|effects)',
        'too much (motion|animation)', 'it is distracting',
        '(關閉|停止|暫停|關掉)(動畫|特效|動態)', '(開啟|打開|恢復)(動畫|特效|動態)', '動畫太多了', '好眼花',
    ],
    'follow_toggle': [
        "(stop|don't|do not) follow(ing)? (me|my (mouse|cursor|pointer))", 'follow (me|my cursor|my mouse)',
        '(hide|show) the cursor (buddy|companion)', 'cursor (buddy|companion) (on|off)',
        '(不要|別)(再)?跟著(我|滑鼠|游標)', '跟著(我|滑鼠|游標)', '(關掉|關閉|隱藏|打開|顯示)(游標|滑鼠)(小人|角色|夥伴|跟隨)',
    ],
    'trail_style': [
        '(change|switch|set) (the )?(mouse |cursor )?trail to (paws|hearts|stars|sparkles|petals)', '(turn off|disable|hide) (the )?(heart )?trail',
        '(turn on|enable) (the )?trail', 'paw (prints|trail)', 'star trail', 'mouse effects',
        '(換成|改成|要)(貓掌|愛心|星星|花瓣|腳印)(拖尾|軌跡|特效)?', '(關掉|關閉|開啟|打開)(愛心)?(拖尾|軌跡|滑鼠特效)', '拖尾', '滑鼠特效',
    ],
    'cursor_size': [
        '(make )?(the )?cursor (buddy |companion |yuki )?(bigger|smaller|larger|tiny|huge)', 'resize the cursor (buddy|companion)',
        '(游標|滑鼠)(小人|角色|夥伴)?(大一點|小一點|變大|變小|太大了|太小了)', '(小人|跟隨角色)(大一點|小一點|太小了|太大了)',
    ],
    'pet_pat': [
        'pat', 'headpat', '(pat|pet|stroke|rub|hug|cuddle|squeeze) (you|yuki|your head|your ears)', 'can i (pet|pat|hug) you',
        '*pats*', 'good girl', 'give me a hug',
        '(摸摸|摸頭|摸摸頭|抱抱|秀秀|拍拍|揉揉|蹭蹭|摸耳朵|捏捏臉)', '(我)?(可以)?摸(摸)?(你|妳)(的頭|的耳朵)?嗎?', '給(你|妳)摸摸', '乖乖', '抱一個', '讓我抱抱',
    ],
    'pet_feed': [
        'feed', 'food', 'snack', 'eat', 'treat', 'dinner time', 'lunch time', 'breakfast', '(are you|you) hungry',
        '(want|have) (some|a) (snack|fish|cake|food|treat|milk)', "let's eat", 'eat something', 'here is a fish', 'feed yuki',
        '(餵|吃)(東西|飯|點心|零食|魚|罐罐|蛋糕)', '(你|妳)?餓(了)?(嗎)?', '肚子餓', '要不要吃(點)?(東西|點心|魚|罐罐|蛋糕)',
        '開飯(了|囉)', '給(你|妳)吃(小魚乾|罐罐|點心|蛋糕)', '餵食', '吃飯(了)?', '請(你|妳)吃點心',
    ],
    'pet_play': [
        "(let's )?play", 'play (with me|a game|ball|with yarn)', 'wanna play', 'i am bored', 'play fetch', 'catch the ball',
        '(陪我|一起|來)玩', '玩(毛線球|球|遊戲)', '(好|有點)無聊', '要不要玩', '玩耍', '陪玩', '來玩吧',
    ],
    'pet_sleep': [
        '(go to )?(sleep|bed)', 'take a nap', 'you should rest', '(are you|you look) (tired|sleepy)', 'nap time', 'rest now',
        'go rest', 'sleep well',
        '(去)?(睡覺|睡吧|休息|午睡|小睡|睡午覺|睡一下)', '(你|妳)(想|要)睡(覺)?了嗎', '(你|妳)(看起來)?(很|好)?(累|睏|想睡)',
        '(你|妳)累了嗎', '該睡了', '去休息吧',
    ],
    'pet_wake': [
        'wake up', '(get|rise) up', 'are you awake', 'rise and shine', 'no sleeping', 'wakey wakey',
        '(起床|醒醒|醒來|起來|別睡了|不要睡了|快起床|該起床了|醒醒啦)',
    ],
    'pet_lie': [
        '(lie|lay) down', 'get comfy', 'sit( down)?', 'go to your bed', 'relax', 'chill',
        '(趴下|趴著|躺下|坐下|趴趴|窩著|去窩裡|回窩|躺平|趴一下)',
    ],
    'pet_trick': [
        'dance', 'spin', 'do a trick', 'twirl', 'roll over', 'jump', 'show me a trick', 'sing', 'do something cute', 'perform',
        '(跳舞|轉圈|轉一圈|翻滾|跳一下|表演|唱歌|來個才藝|撒嬌|賣萌|跳跳|轉圈圈)', '(跳|來)(個|支|一支)舞', '(表演|來)(一個|個)(才藝|把戲)', '可以跳舞嗎',
    ],
    'pet_status': [
        'how are you', 'how (are you|do you) feel(ing)?', 'are you ok', "what's up", "how's it going", 'status', 'your stats',
        'how is your mood', 'what are you doing', 'are you happy',
        '(你|妳)?(好嗎|還好嗎)', '(你|妳)?心情(如何|怎麼樣|好嗎)', '(你|妳)?今天(過得)?(怎麼樣|好嗎)', '(你|妳)在(幹嘛|做什麼)',
        '(你|妳)?的?(狀態|數值|飽食度|體力|好感度)', '(你|妳)開心嗎',
    ],
    'hide': [
        'hide', 'go away', 'leave me alone', 'be quiet', 'shoo', 'stop talking', 'you are in the way', 'move',
        '(躲起來|走開|退下|隱藏|先別吵|安靜一下|不要吵|去旁邊|擋到了|讓開|閃開)', '(你|妳)擋到(我|畫面|字)了', '(你|妳)(太)?(礙事|佔位置)', 'you are blocking (the|my) (screen|view|text)',
    ],
    'show': [
        'come back', 'come out', 'where are you', 'show yourself', 'come here',
        '(出來|回來|(你|妳)在哪(裡|兒)?|過來|快出來|來這裡)', 'yuki (你|妳)在哪(裡)?',
    ],
    'comfort': [
        "(i'm|i am|i feel|feeling) (so |very |a bit )?(sad|tired|exhausted|stressed|lonely|down|anxious|depressed|bad|upset|burned out)",
        'bad day', 'i want to cry', 'life is hard', 'nothing works', 'my code is broken', 'deadline is killing me',
        '(我)?(好|很|有點|超)?(累|難過|傷心|煩|焦慮|孤單|崩潰|沮喪|想哭|心情不好|不開心|厭世|緊張)', '(我)?壓力(好|很)?大',
        '今天好糟', '報告寫不完', '論文好難', 'debug ?好累', '被罵了', '失眠', '好想休息',
    ],
    'happy': [
        "(i'm|i am|feeling) (so |very )?(happy|great|good|excited|glad)", 'good news', 'i did it', 'it works', 'i passed',
        '(我)?(好|很|超)?(開心|高興|快樂|興奮)', '我成功了', '有好消息', '考試過了', '論文上了', '終於跑出來了', '今天很棒',
    ],
    'compliment': [
        "(you're|you are|ur) (so )?(cute|adorable|pretty|smart|the best|kawaii|amazing|clever|lovely)", 'cute', 'so cute',
        'good job', 'well done', 'nice site', 'this website is cool', 'i like this site',
        '(你|妳)?(好|很|超|真)?(可愛|漂亮|聰明|厲害|乖|棒|萌)', '卡哇伊', '好萌', '網站好(酷|可愛|漂亮|好看)', '做得(真)?好',
    ],
    'love': [
        'i (love|like|adore) you', '(love|like) you', 'marry me', 'be my girlfriend', 'you are my favorite',
        '我(好|最|超)?(喜歡|愛)(你|妳)', '嫁給我', '當我女朋友', '(你|妳)是我的最愛', '我愛(你|妳)',
    ],
    'insult': [
        "(you're|you are|ur) (stupid|dumb|useless|ugly|annoying|boring)", 'stupid', 'shut up', 'you suck', 'idiot', 'bad cat',
        '(你|妳)?(好|很|真)?(笨|蠢|煩|醜|爛|沒用|無聊)', '閉嘴', '笨蛋', '白痴', '好爛',
    ],
    'joke': [
        'tell me a joke', '(say|tell me) something funny', 'make me laugh', 'joke', 'another joke', 'any jokes',
        '(講|說)(個|一個)?(笑話|冷笑話|有趣的事)', '逗我笑', '笑話', '再來一個笑話',
    ],
    'laugh': [
        'haha', 'hahaha', 'lol', 'lmao', 'rofl', 'hehe', 'xd',
        '(哈哈|哈哈哈|笑死|呵呵|嘻嘻|嘿嘿|好好笑|www)',
    ],
    'time_date': [
        'what time is it', "what('s| is) the date", 'what day is it[ today]', 'current time', 'today date',
        '(現在)?幾點(了)?', '今天(幾號|星期幾|禮拜幾)', '(現在)?(日期|時間)', '現在是什麼時候',
    ],
    'help_chat': [
        'what can you do', 'help', 'how does this work', 'commands', 'how do i use (this|you)', 'what should i ask',
        'what can i say', 'options', 'features',
        '(你|妳)?(能|會|可以)(做|幹)(什麼|嘛|啥)', '怎麼用', '有什麼功能', '教我(怎麼用)?', '指令(有哪些)?', '我可以問什麼', '說明', '幫助',
    ],
    'nav_home': [
        'go (back )?home', 'home( page)?', 'start page', 'back to (the )?start', 'main page', 'take me home',
        '(回|回到)(首頁|主頁|開始|起點)', '首頁', '主畫面',
    ],
    'favorite': [
        'what do you like', 'favorite (food|color|thing|snack)', 'what do you like to eat', 'what are your hobbies',
        'what do you do for fun', 'do you like fish',
        '(你|妳)喜歡(吃)?什麼', '(你|妳)?(最)?喜歡的(食物|顏色|東西|點心)', '(你|妳)的興趣(是什麼)?', '(你|妳)平常做什麼', '喜歡魚嗎',
    ],
    'oos': [
        "what('s| is) the weather( today)?", 'will it rain tomorrow', 'stock price of apple', 'bitcoin price', 'who won the game',
        'write me a poem', 'write python code for me', 'solve 2x+3=7', 'what is 12 times 8', 'translate this to japanese',
        'recommend a movie', 'best restaurant nearby', 'who is the president', 'capital of france', 'how to cook pasta',
        'book a flight', 'play some music', 'set an alarm', 'what is quantum physics', 'news today', 'sports scores',
        'asdfgh', 'qwerty', 'lorem ipsum', 'test', '123', 'aaa', 'banana', 'the quick brown fox', 'how tall is mount everest',
        'can you do my homework', 'buy shoes', 'car insurance', 'how to lose weight', 'football',
        '今天天氣如何', '明天會下雨嗎', '股票(會漲嗎|怎麼買)', '比特幣多少錢', '幫我寫(詩|作業|程式|報告)', '一加一等於多少', '翻譯成日文',
        '推薦(電影|餐廳|手機)', '總統是誰', '法國首都是哪', '義大利麵怎麼煮', '訂機票', '放音樂', '設鬧鐘', '量子力學是什麼', '新聞',
        '球賽比數', '阿斯德', '測試', '香蕉', '怎麼減肥', '買鞋子', '玉山多高', '台北101多高', '什麼是區塊鏈', '牛肉麵好吃嗎',
    ],
}

# Slot vocabularies used both to delexicalise training text and (mirrored in JS) user input.
PROJECT_SAMPLES = ['taiwan exam', 'kcrashlab', 'contextsec', 'merriv', 'ai repo gardener', 'psg', 'noveltyaudit',
                   'research meeting coach', 'chromarecover', '學測', '會考', '模擬考']
TOPICS = ['security', 'ai security', 'computer vision', 'vision', 'drivers', 'windows drivers', 'exams', 'agents',
          'coding agents', 'papers', 'novelty', 'model release', 'python', 'reproducibility', 'color', 'meetings',
          '安全', 'ai 安全', '電腦視覺', '視覺', '驅動程式', '考試', '程式代理', '代理', '論文', '新穎性', '模型發布',
          '可重現', '色彩', '開會', '導師', '靜態分析', '可靠性', '影像']

REPLIES: dict[str, dict[str, list[str]]] = {
    'greet': {
        'en': ['Hi hi! I’m Yuki. Want a tour of the projects, or shall we just hang out?',
               'Hello, {user}! Nice to see you. Ask me about any project — I know them all.',
               'Hey there! My ears perked up the moment you arrived.'],
        'zh-TW': ['嗨嗨！我是 Yuki。要我帶你逛作品，還是先陪你聊一下？', '哈囉 {user}！看到你真開心，作品的事都可以問我喔。',
                  '你來了！我的耳朵一下就豎起來了。'],
    },
    'bye': {
        'en': ['See you soon! I’ll keep the keyboard warm.', 'Bye bye! Come back and pat me later, okay?'],
        'zh-TW': ['下次見！我會幫你把鍵盤保持暖暖的。', '掰掰～記得回來摸摸我喔。'],
    },
    'thanks': {
        'en': ['You’re welcome! That’s what companions are for.', 'Anytime! Headpats are accepted as payment.'],
        'zh-TW': ['不客氣！陪著你本來就是我的工作。', '隨時都可以！報酬就用摸摸頭支付吧。'],
    },
    'yuki_self': {
        'en': ['I’m Yuki — a cat-eared companion living in this terminal. My brain is a tiny neural network running right in your browser: {brain}. No server, no cloud, just me.',
               'Yuki, keeper of this little terminal! I’m powered by a small on-device intent model ({brain}), so what you type never leaves this page.'],
        'zh-TW': ['我是 Yuki，住在這個終端裡的貓耳夥伴。我的腦袋是一個直接在你瀏覽器裡運作的小型神經網路：{brain}。沒有伺服器，也不上雲。',
                  '我是這個小終端的看守者 Yuki！靠一個本機的小小意圖模型（{brain}）思考，所以你打的字都不會離開這個頁面。'],
    },
    'about_owner': {
        'en': ['Niansia is a CS master’s student at NYCU (on a one-year leave) who builds tools for AI security, computer vision and reproducible research. I opened the about page for you!',
               'The person behind this terminal! Niansia studied CS at Yuan Ze University and now does graduate work at NYCU — mostly AI security, vision and evidence-first tools. Here’s the about page.'],
        'zh-TW': ['Niansia 是陽明交大的資工碩士生（目前休學一年），做 AI 安全、電腦視覺和可重現研究的工具。我幫你打開關於頁面了！',
                  '這個終端的主人！Niansia 大學讀元智資工，現在在陽明交大念碩士，主要研究 AI 安全、視覺，還有重視證據的研究工具。關於頁面在這裡～'],
    },
    'education': {
        'en': ['B.S. in Computer Science from Yuan Ze University, now an M.S. student at National Yang Ming Chiao Tung University — currently taking a one-year leave.'],
        'zh-TW': ['元智大學資訊工程學士，現在是國立陽明交通大學碩士生，目前休學一年中。'],
    },
    'research': {
        'en': ['Two connected directions: AI & multimodal security, and vision-language reasoning that stays grounded in evidence. I opened research.md for you.'],
        'zh-TW': ['兩條互相連結的方向：AI 與多模態安全，以及以證據為根據的視覺語言推理。我幫你打開 research.md 了。'],
    },
    'projects_list': {
        'en': ['There are {count} projects: {list}. I opened the folder — which one looks fun?',
               '{count} projects mounted! {list}. Ask me about any of them.'],
        'zh-TW': ['一共有 {count} 項作品：{list}。資料夾打開了，哪個看起來最有趣？', '{count} 項作品都掛載好了！{list}。想知道哪個都可以問我。'],
    },
    'project_detail': {
        'en': ['{name} ({category}, {status}): {desc}', 'Ooh, {name}! {desc} It’s currently “{status}”. I opened it for you.'],
        'zh-TW': ['{name}（{category}，{status}）：{desc}', '喔喔，{name}！{desc} 目前狀態是「{status}」，我幫你打開了。'],
    },
    'project_find': {
        'en': ['I think you’re looking for {name}: {desc}', 'That sounds like {name} ({category}). {desc}'],
        'zh-TW': ['你要找的應該是 {name}：{desc}', '聽起來是 {name}（{category}）。{desc}'],
    },
    'project_recommend': {
        'en': ['My pick today: {name}! {desc}', 'Close your eyes… *spins* …it’s {name}! {desc}'],
        'zh-TW': ['今天我推薦 {name}！{desc}', '閉上眼睛……轉一圈……就是 {name}！{desc}'],
    },
    'project_latest': {
        'en': ['The newest addition is {name}: {desc}'],
        'zh-TW': ['最新加入的是 {name}：{desc}'],
    },
    'skills': {
        'en': ['Mostly Python for research tooling, plus agent tooling (Agent Skills, MCP servers), static analysis, computer vision pipelines, statistical evaluation and multi-platform CI. The projects are the best evidence!'],
        'zh-TW': ['主要用 Python 做研究工具，還有 Agent Skill 與 MCP 伺服器、靜態分析、電腦視覺流程、統計評估和跨平台 CI。作品本身就是最好的證據！'],
    },
    'contact': {
        'en': ['You can write to {email}. I opened the contact page — Niansia welcomes thoughtful conversations and collaborations.'],
        'zh-TW': ['可以寫信到 {email}。我打開聯絡頁面了，Niansia 很歡迎交流與合作。'],
    },
    'github': {
        'en': ['All the source lives at github.com/niansia. Every project page has a “View source” button too.'],
        'zh-TW': ['原始碼都在 github.com/niansia，每個作品頁也有「查看原始碼」按鈕喔。'],
    },
    'set_language': {
        'en': ['Switching to {lang}!'], 'zh-TW': ['切換成{lang}囉！'],
    },
    'set_theme': {
        'en': ['Ta-da! The {theme} style is on.', 'Redecorated: {theme}. Do you like it?'],
        'zh-TW': ['登登！換成「{theme}」風格了。', '重新布置好了：{theme}。喜歡嗎？'],
    },
    'motion': {'en': ['{state}'], 'zh-TW': ['{state}']},
    'follow_toggle': {'en': ['{state}'], 'zh-TW': ['{state}']},
    'trail_style': {'en': ['Trail: {trail}. Wiggle your mouse!'], 'zh-TW': ['拖尾換成：{trail}。動動滑鼠看看！']},
    'cursor_size': {'en': ['Cursor buddy size: {size}.'], 'zh-TW': ['游標小夥伴尺寸：{size}。']},
    'pet_pat': {
        'en': ['Ehehe… that tickles. One more?', 'Purr… purr… right behind the ears, please.', '*happy tail noises*'],
        'zh-TW': ['欸嘿嘿……好癢。可以再一下嗎？', '呼嚕……呼嚕……耳朵後面也要。', '（尾巴開心地甩來甩去）'],
    },
    'pet_feed': {
        'en': ['Fish! My favourite. Nom nom nom…', 'A snack? You spoil me. Nom!'],
        'zh-TW': ['是小魚乾！最喜歡了。啊嗚啊嗚……', '有點心？你太寵我了。開動！'],
    },
    'pet_play': {
        'en': ['Yarn ball! Throw it, throw it!', 'Play time! Catch me if you can~'],
        'zh-TW': ['毛線球！快丟快丟！', '玩耍時間！來追我呀～'],
    },
    'pet_sleep': {
        'en': ['Okay… a tiny nap. Wake me if you need me… zzz', 'Yawn… goodnight, just for a bit.'],
        'zh-TW': ['好……小睡一下。需要我的時候再叫我……zzz', '呼啊……那我先瞇一下下。'],
    },
    'pet_wake': {
        'en': ['I’m up, I’m up! Where are we going?', 'Mmh… good morning! I dreamt of fish.'],
        'zh-TW': ['起來了起來了！要去哪裡？', '嗯……早安！我夢到小魚乾了。'],
    },
    'pet_lie': {
        'en': ['*flop* Comfy… pat me while I’m down here?', 'Lying down in my little bed. Headpats welcome.'],
        'zh-TW': ['（啪地趴下）好舒服……趁現在摸摸我？', '窩進我的小床了，歡迎摸頭。'],
    },
    'pet_trick': {
        'en': ['Watch this! ♪ Spin, spin~', 'Ta-daa! Did you see that?'],
        'zh-TW': ['看好囉！♪ 轉圈圈～', '登登！有看到嗎？'],
    },
    'pet_status': {
        'en': ['Fullness {food}%, mood {mood}%, energy {energy}%. Affection level {level}. {feeling}'],
        'zh-TW': ['飽足 {food}%、心情 {mood}%、體力 {energy}%，好感等級 {level}。{feeling}'],
    },
    'hide': {
        'en': ['Okay, I’ll hide at the edge. Click me when you miss me.'],
        'zh-TW': ['好，我躲到旁邊去。想我的時候點我一下。'],
    },
    'show': {
        'en': ['Here I am!', 'Peekaboo! Right here.'], 'zh-TW': ['我在這裡！', '躲貓貓結束，我在這～'],
    },
    'comfort': {
        'en': ['You’ve done a lot today. Relax your shoulders, have some water, and let me sit with you for a bit.',
               'Hey… it’s okay to rest. Bugs and deadlines can wait five minutes. I’m right here.'],
        'zh-TW': ['你今天已經很努力了。放鬆肩膀、喝口水，我陪你待一下。', '沒事的……休息一下也沒關係。bug 和截止日可以等五分鐘，我在這裡陪你。'],
    },
    'happy': {
        'en': ['Yay! I’m so happy for you! *tail wagging intensifies*', 'That’s wonderful! Let’s celebrate with a little spin!'],
        'zh-TW': ['耶！我也好替你開心！（尾巴瘋狂搖）', '太棒了！我們轉個圈慶祝一下！'],
    },
    'compliment': {
        'en': ['E-eh? You think so? *blushes*', 'Hehe, thank you! You’re pretty great yourself.'],
        'zh-TW': ['欸、欸？真的嗎？（臉紅）', '嘿嘿，謝謝！你也很棒喔。'],
    },
    'love': {
        'en': ['W-what are you saying so suddenly! …I like you too, as my favourite visitor.', '*ears turn pink* I’ll count that as a headpat.'],
        'zh-TW': ['突、突然說什麼啦！……你也是我最喜歡的訪客喔。', '（耳朵都紅了）那就當作摸摸頭收下了。'],
    },
    'insult': {
        'en': ['Hmph! That hurts my little feelings… I’m still learning, okay?', 'Rude! I’m going to sulk for exactly three seconds.'],
        'zh-TW': ['哼！好傷心……我還在學習嘛。', '好過分！我要生氣三秒鐘。'],
    },
    'joke': {
        'en': ['Why do programmers prefer dark mode? Because light attracts bugs.', 'I tried to catch the cursor all day. It kept getting away — must be a pointer exception.',
               'What’s a cat’s favourite button? Paws.', 'There are 10 kinds of cats: those who understand binary and those who knock it off the table.'],
        'zh-TW': ['為什麼工程師喜歡深色模式？因為光會吸引 bug。', '我追游標追了一整天都抓不到，大概是 pointer exception 吧。',
                  '貓最喜歡的鍵盤按鍵是哪個？Paws（暫停）！', '我跟 bug 很像，都喜歡半夜出來玩。'],
    },
    'laugh': {'en': ['Hehe~ ฅ^•ω•^ฅ', 'Your laugh is contagious!'], 'zh-TW': ['嘿嘿～ ฅ^•ω•^ฅ', '你笑我也跟著笑了！']},
    'time_date': {'en': ['It’s {time} on {date}.'], 'zh-TW': ['現在是 {date} {time}。']},
    'help_chat': {
        'en': ['Try: “show me projects”, “what is KCrashLab?”, “any project about vision?”, “switch to dark”, “sakura style”, “change language to 中文”, “feed”, “lie down”, “dance”. You can also drag me around!'],
        'zh-TW': ['可以試試：「帶我看作品」「KCrashLab 是什麼？」「有做電腦視覺的作品嗎？」「換成深色」「櫻花風格」「切換成英文」「餵食」「趴下」「跳舞」。也可以直接把我拖來拖去喔！'],
    },
    'nav_home': {'en': ['Home sweet terminal.'], 'zh-TW': ['回到首頁囉。']},
    'favorite': {
        'en': ['Dried fish, warm keyboards, and reproducible results. In that order.', 'I like yarn balls and watching people discover projects!'],
        'zh-TW': ['小魚乾、暖暖的鍵盤，還有可以重現的實驗結果。依序排列。', '我喜歡毛線球，還有看大家發現新作品的樣子！'],
    },
    'oos': {
        'en': ['Hmm, that’s outside my little world — I only know this terminal and Niansia’s work. Try asking about a project!',
               'My brain is tiny, so I can’t answer that one. But I can tell you about any of the {count} projects!'],
        'zh-TW': ['嗯……這超出我的小世界了，我只懂這個終端和 Niansia 的作品。問我作品的事吧！',
                  '我的腦袋很小，這題答不出來。不過 {count} 項作品我都可以介紹喔！'],
    },
}

# Lines Yuki says on her own (pet reactions, idle nudges, notifications).
LINES: dict[str, dict[str, list[str]]] = {
    'firstVisit': {'en': ['Hi! I’m Yuki. Drag me, pat me, or click me to chat. I live here now.'],
                   'zh-TW': ['嗨！我是 Yuki。可以拖我、摸我，或點我聊天。我現在住在這裡囉。']},
    'returning': {'en': ['Welcome back! This is visit #{visits}. I missed you.'], 'zh-TW': ['歡迎回來！這是你第 {visits} 次來，我好想你。']},
    'welcomeBack': {'en': ['You were gone for {minutes} min… I waited right here!'], 'zh-TW': ['你離開了 {minutes} 分鐘……我一直在這裡等你喔！']},
    'idle': {
        'en': ['Still there? Want me to recommend a project?', 'Psst… have you seen {name} yet?', 'I’m a little bored… play with me?',
               'Fun fact: my brain runs entirely in your browser.', 'You can type natural questions in the terminal too, and I’ll answer.',
               'Try dragging me somewhere new!', 'Did you know there are several styles? Try “sakura style”.'],
        'zh-TW': ['還在嗎？要不要我推薦一個作品？', '偷偷問……你看過 {name} 了嗎？', '有點無聊……陪我玩好不好？',
                  '冷知識：我的腦袋完全在你的瀏覽器裡運作。', '在終端裡直接打問題，我也會回答喔。', '試試看把我拖到別的地方！',
                  '這裡有好幾種風格喔，說「櫻花風格」試試看。'],
    },
    'hungry': {'en': ['My tummy is growling… a snack, maybe?'], 'zh-TW': ['肚子咕嚕咕嚕叫了……可以給點點心嗎？']},
    'sleepy': {'en': ['Yawn… I’m getting sleepy.'], 'zh-TW': ['呼啊……有點想睡了。']},
    'autoSleep': {'en': ['Nobody’s around… I’ll take a little nap. zzz'], 'zh-TW': ['都沒人理我……那我先睡一下。zzz']},
    'patRub': {'en': ['Purrrr… ♡', 'Right there… ♡', 'More, more~'], 'zh-TW': ['呼嚕呼嚕……♡', '就是那裡……♡', '還要還要～']},
    'poked': {'en': ['Hey! Stop poking me!', 'Mou… that’s enough poking!'], 'zh-TW': ['喂！不要一直戳我啦！', '唔……戳夠了吧！']},
    'drag': {'en': ['Whoa— put me down!', 'Wheee~', 'Where are we going?!'], 'zh-TW': ['哇啊——放我下來！', '咻～～', '要帶我去哪裡？！']},
    'dropHigh': {'en': ['Ouch… I landed on my tail.', 'Dizzy… @_@'], 'zh-TW': ['好痛……壓到尾巴了。', '頭暈暈……@_@']},
    'land': {'en': ['Safe landing!', 'Nice spot.'], 'zh-TW': ['安全著陸！', '這個位置不錯。']},
    'full': {'en': ['I’m so full… no more, please.'], 'zh-TW': ['好飽……吃不下了啦。']},
    'tooSleepy': {'en': ['Too sleepy to play… maybe later.'], 'zh-TW': ['太睏了，等等再玩……']},
    'levelUp': {'en': ['Affection level {level}! We’re getting closer ♡'], 'zh-TW': ['好感等級 {level}！我們更親近了 ♡']},
    'peek': {'en': ['Peekaboo!'], 'zh-TW': ['躲貓貓！']},
    'titleNudge': {'en': ['Yuki misses you'], 'zh-TW': ['Yuki 想你了']},
    'caught': {'en': ['Got it!', 'Mine!'], 'zh-TW': ['抓到了！', '是我的！']},
    'cute': {'en': ['Pat me~?', 'Stay with me a little?', 'Nya~ look at me!', 'Headpats, please~'],
             'zh-TW': ['摸摸我嘛～', '陪我一下下就好…', '喵～看我看我！', '人家想被摸頭啦～']},
    'pounce': {'en': ['Gotcha!', 'Pounce!'], 'zh-TW': ['逮到你了！', '喵嗚——撲！']},
    'butterfly': {'en': ['It got away… next time!', 'Butterfly, wait for me~'], 'zh-TW': ['被牠飛走了……下次一定！', '蝴蝶等等我～']},
    'feelingGood': {'en': ['I feel great!'], 'zh-TW': ['我現在很好！']},
    'feelingHungry': {'en': ['A little hungry, though.'], 'zh-TW': ['不過有點餓。']},
    'feelingSleepy': {'en': ['A bit sleepy.'], 'zh-TW': ['有點睏。']},
    'feelingLonely': {'en': ['I could use a headpat.'], 'zh-TW': ['想要摸摸頭。']},
    'terminalAnswer': {'en': ['Yuki: '], 'zh-TW': ['Yuki：']},
}
