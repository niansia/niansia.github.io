/* One catalogue drives help, completion and the supported command vocabulary. */
window.NIANSIA_TERMINAL = {
  commands: [
    ['help','help [command]','help theme','List commands or show usage','列出指令或查看用法','列出指令或查看用法'],
    ['home','home','home','Return to the start screen','返回開始畫面','返回开始画面'],
    ['about','about','about','Read the profile','閱讀個人介紹','阅读个人介绍'],
    ['whoami','whoami','whoami','Show Niansia’s profile summary','查看 Niansia 的簡介','查看 Niansia 的简介'],
    ['research','research','research','Explore research interests','探索研究方向','探索研究方向'],
    ['capstone','capstone','capstone','Open the undergraduate capstone: propaganda detection with generative AI','查看大學專題：以生成式 AI 偵測宣傳新聞','查看大学专题：以生成式 AI 侦测宣传新闻'],
    ['deadlines','deadlines','deadlines','Count down to the conference deadlines being prepared for','查看準備投稿的會議截止倒數','查看准备投稿的会议截止倒数'],
    ['papers','papers','papers','Open papers.bib: publications and manuscripts in preparation','開啟 papers.bib：論文與準備中的稿件','打开 papers.bib：论文与准备中的稿件'],
    ['blog','blog','blog','Open blog/: monthly updates, paper notes and answered questions','開啟 blog/：每月近況、論文筆記與 Q&A','打开 blog/：每月近况、论文笔记与 Q&A'],
    ['brief','brief','brief','Open the one-page brief for professors and interviewers','開啟給教授與面試官的一頁式簡介','打开给教授与面试官的一页式简介'],
    ['tour','tour [research|builder|fun]','tour research','Let Yuki show you around, step by step','讓 Yuki 一步一步帶你導覽','让 Yuki 一步一步带你导览'],
    ['palette','palette [search]','palette lumigrid','Open the command palette (Ctrl+K / ⌘K) to jump anywhere','開啟指令面板（Ctrl+K / ⌘K），快速跳到任何地方','打开命令面板（Ctrl+K / ⌘K），快速跳到任何地方'],
    ['projects','projects','projects','Open all eleven projects','開啟全部十一項作品','打开全部十一项作品'],
    ['ls','ls [path]','ls projects/','List files or projects','列出檔案或作品','列出文件或作品'],
    ['cd','cd <path>','cd projects','Go to a directory; .. goes back','切換目錄；.. 返回上一層','切换目录；.. 返回上一层'],
    ['cat','cat <file>','cat about.md','Read a profile or project file','閱讀介紹或作品檔案','阅读介绍或作品文件'],
    ['open','open <target>','open taiwan-exam','Open a page or project','開啟頁面或作品','打开页面或作品'],
    ['pwd','pwd','pwd','Print the current virtual directory','顯示目前的虛擬目錄','显示当前的虚拟目录'],
    ['tree','tree','tree','Show the complete file tree','顯示完整檔案樹','显示完整文件树'],
    ['find','find <keyword>','find AI','Search project names and descriptions','搜尋作品名稱與介紹','搜索作品名称与介绍'],
    ['skills','skills','skills','List projects that include Agent Skills','列出包含 Agent Skill 的作品','列出包含 Agent Skill 的作品'],
    ['status','status','status','Show this terminal’s settings','查看目前終端設定','查看当前终端设置'],
    ['contact','contact','contact','Open contact information','開啟聯絡資訊','打开联系信息'],
    ['hobbies','hobbies','hobbies','Off the clock: cosplay, music and fandoms','研究以外：cos、音樂與各種坑','研究以外：cos、音乐与各种坑'],
    ['exams','exams','exams','Open the shared Taiwan Exam mock exams (in Chinese)','開啟 Taiwan Exam 考卷分享區','打开 Taiwan Exam 考卷分享区'],
    ['guestbook','guestbook','guestbook','Open the guestbook: leave a note (shown after review)','開啟留言板：留下一句話（審核後公開）','打开留言板：留下一句话（审核后公开）'],
    ['email','email','email','Show the email address and link','顯示電子郵件與連結','显示电子邮件与链接'],
    ['github','github [project]','github taiwan-exam','Show GitHub source links','顯示 GitHub 原始碼連結','显示 GitHub 源代码链接'],
    ['date','date','date','Show your local date','顯示你的當地日期','显示你的当地日期'],
    ['time','time','time','Show your local time','顯示你的當地時間','显示你的当地时间'],
    ['theme','theme [name]','theme glass','Switch the page style (no argument toggles light / dark)','切換網頁風格（不加參數切換淺色／深色）','切换网页风格（不加参数切换浅色／深色）'],
    ['style','style [name]','style retro','Same as theme: classic, Japanese (fuji, aizome, momiji, yozakura, washi, asagi) or glass','同 theme：經典、和風（藤、藍染、紅葉、夜櫻、和紙、淺蔥）或玻璃','同 theme：经典、和风（藤、蓝染、红叶、夜樱、和纸、浅葱）或玻璃'],
    ['lang','lang <en|zh-tw|zh-cn>','lang zh-tw','Switch language without losing your place','切換語言並保留目前頁面','切换语言并保留当前页面'],
    ['pet','pet','pet','Give Yuki a gentle pat','摸摸 Yuki','摸摸 Yuki'],
    ['feed','feed [fish|taiyaki|cake]','feed cake','Give Yuki a snack','餵 Yuki 吃點心','喂 Yuki 吃点心'],
    ['play','play [yarn|wand|chase]','play wand','Play with Yuki','和 Yuki 陪玩','和 Yuki 玩耍'],
    ['sleep','sleep','sleep','Let Yuki take a nap','讓 Yuki 休息','让 Yuki 休息'],
    ['lie','lie','lie','Yuki lies down in her bed and asks for pats','讓 Yuki 趴進小窩討摸摸','让 Yuki 趴进小窝讨摸摸'],
    ['trick','trick [dance|piano|violin]','trick piano','Yuki shows a little trick','Yuki 表演小才藝','Yuki 表演小才艺'],
    ['cv','cv','cv','Open cv.pdf (CV and LinkedIn; not public yet)','打開 cv.pdf（履歷與 LinkedIn，尚未公開）','打开 cv.pdf（简历与 LinkedIn，尚未公开）'],
    ['log','log','log','Open the research log (dated snapshots with images)','打開研究日誌（附圖的工作紀錄）','打开研究日志（附图的工作记录）'],
    ['statement','statement','statement','Read my research statement','閱讀研究方向說明','阅读研究方向说明'],
    ['notes','notes','notes','Open my research notes','打開研究筆記','打开研究笔记'],
    ['attack','attack','attack','Open the Adversarial Lab: fool a digit classifier with FGSM / PGD, then try a robust model','開啟對抗樣本實驗室：用 FGSM／PGD 騙過數字分類器，再試試穩健模型','打开对抗样本实验室：用 FGSM／PGD 骗过数字分类器，再试试稳健模型'],
    ['demo','demo','demo','Open the in-browser LumiGrid demo (low-light enhancement on your own photo)','開啟 LumiGrid 瀏覽器試玩（用你自己的照片做低光增強）','打开 LumiGrid 浏览器试用（用你自己的照片做低光增强）'],
    ['stay','stay [on|off]','stay on','Keep Yuki in one place, or let her roam','讓 Yuki 待在原地不亂走，或恢復自由走動','让 Yuki 待在原地不乱走，或恢复自由走动'],
    ['hide','hide','hide','Tuck Yuki away at the edge, or bring her back','讓 Yuki 躲到邊邊，或叫她回來','让 Yuki 躲到边边，或叫她回来'],
    ['yuki','yuki','yuki','Show Yuki’s fullness, mood, energy and affection','查看 Yuki 的飽足、心情、體力與好感','查看 Yuki 的饱足、心情、体力与好感'],
    ['wake','wake','wake','Wake Yuki up','叫醒 Yuki','叫醒 Yuki'],
    ['chat','chat [message]','chat hello','Open chat, optionally with a message','開啟對話，也能直接附上訊息','打开对话，也能直接附上消息'],
    ['ask','ask <question>','ask 有什麼作品？','Ask Yuki’s on-device neural network','問 Yuki 的本機神經網路','问 Yuki 的本地神经网络'],
    ['brain','brain','brain','Show how Yuki’s tiny model works','查看 Yuki 小模型的運作細節','查看 Yuki 小模型的运作细节'],
    ['follow','follow [on|off]','follow on','Toggle the pointer companion','切換游標夥伴跟隨','切换光标伙伴跟随'],
    ['cursor','cursor [s|m|l]','cursor l','Resize the pointer companion','調整游標夥伴大小','调整光标伙伴大小'],
    ['motion','motion [ui|cursor|yuki|pages] [on|off]','motion cursor off','Pause or resume all animation, or one kind of it','暫停或繼續全部動畫，或只開關其中一類','暂停或继续全部动画，或只开关其中一类'],
    ['trail','trail [hearts|paws|stars|petals|off]','trail paws','Choose the pointer trail','選擇滑鼠拖尾樣式','选择鼠标拖尾样式'],
    ['clear','clear','clear','Clear terminal output','清除終端輸出','清除终端输出'],
    ['history','history','history','List this visit’s command history','查看這次造訪的指令歷史','查看本次访问的指令历史'],
    ['echo','echo <text>','echo "hello, world"','Print your own text','輸出你輸入的文字','输出你输入的文字'],
    ['user','user [name]','user Niansia','Set a local display name for the prompt','設定指令提示字的本機暱稱','设置命令提示符的本地昵称'],
    ['neofetch','neofetch','neofetch','Show a small terminal identity card','顯示終端資訊名片','显示终端信息名片'],
    ['shortcuts','shortcuts','shortcuts','Show keyboard shortcuts','查看鍵盤快捷鍵','查看键盘快捷键'],
    ['festival','festival [list|auto|off|<id>]','festival list','Holiday themes: see the calendar or preview one','節日主題：查看行事曆或預覽','节日主题：查看日历或预览'],
    ['meow','meow','meow','Turn Yuki into a cat, or back into a catgirl','把 Yuki 變成貓咪，或變回貓娘','把 Yuki 变成猫咪，或变回猫娘'],
    ['sky','sky [auto|dawn|morning|noon|afternoon|dusk|evening|night]','sky night','The sky follows your clock; preview another time of day','天空跟著你的時鐘變化；也能預覽其他時段','天空跟着你的时钟变化；也能预览其他时段'],
    ['outfit','outfit [list|<id>]','outfit list','Change Yuki’s outfit','幫 Yuki 換衣服','帮 Yuki 换衣服'],
    ['accessory','accessory [list|auto|none|<id>]','accessory bunnyears','Give Yuki an accessory','幫 Yuki 戴配件','帮 Yuki 戴配件'],
    ['sudo','sudo <command>','sudo pet','Try to become root (good luck)','嘗試取得 root 權限（祝好運）','尝试获取 root 权限（祝好运）']
  ].map(([name,usage,example,en,tw,cn]) => ({name,usage,example,description:{en,'zh-TW':tw,'zh-CN':cn}})),
  parse(text) {
    const tokens=[]; let token='',quote='',started=false;
    for (const char of text.trim()) {
      if (quote) { if (char===quote) quote=''; else token+=char; started=true; }
      else if (char==='"'||char==="'") {quote=char;started=true;}
      else if (/\s/.test(char)) {if(started){tokens.push(token);token='';started=false;}}
      else {token+=char;started=true;}
    }
    if(quote)return {error:'quote'};
    if(started)tokens.push(token);
    return {name:(tokens.shift()||'').toLowerCase(),args:tokens};
  }
};
