/* One catalogue drives help, completion and the supported command vocabulary. */
window.NIANSIA_TERMINAL = {
  commands: [
    ['help','help [command]','help theme','List commands or show usage','列出指令或查看用法','列出指令或查看用法'],
    ['home','home','home','Return to the start screen','返回開始畫面','返回开始画面'],
    ['about','about','about','Read the profile','閱讀個人介紹','阅读个人介绍'],
    ['whoami','whoami','whoami','Show Niansia’s profile summary','查看 Niansia 的簡介','查看 Niansia 的简介'],
    ['research','research','research','Explore research interests','探索研究方向','探索研究方向'],
    ['projects','projects','projects','Open all nine projects','開啟全部九項作品','打开全部九项作品'],
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
    ['email','email','email','Show the email address and link','顯示電子郵件與連結','显示电子邮件与链接'],
    ['github','github [project]','github taiwan-exam','Show GitHub source links','顯示 GitHub 原始碼連結','显示 GitHub 源代码链接'],
    ['date','date','date','Show your local date','顯示你的當地日期','显示你的当地日期'],
    ['time','time','time','Show your local time','顯示你的當地時間','显示你的当地时间'],
    ['theme','theme [light|dark|sakura|matcha|retro]','theme sakura','Switch the page style (no argument toggles light / dark)','切換網頁風格（不加參數切換淺色／深色）','切换网页风格（不加参数切换浅色／深色）'],
    ['style','style [name]','style retro','Same as theme: porcelain, ink, sakura, matcha or retro CRT','同 theme：瓷白、墨夜、櫻花、抹茶或復古 CRT','同 theme：瓷白、墨夜、樱花、抹茶或复古 CRT'],
    ['lang','lang <en|zh-tw|zh-cn>','lang zh-tw','Switch language without losing your place','切換語言並保留目前頁面','切换语言并保留当前页面'],
    ['pet','pet','pet','Give Yuki a gentle pat','摸摸 Yuki','摸摸 Yuki'],
    ['feed','feed','feed','Give Yuki a snack','餵 Yuki 吃點心','喂 Yuki 吃点心'],
    ['play','play','play','Play with Yuki','和 Yuki 陪玩','和 Yuki 玩耍'],
    ['sleep','sleep','sleep','Let Yuki take a nap','讓 Yuki 休息','让 Yuki 休息'],
    ['lie','lie','lie','Yuki lies down in her bed and asks for pats','讓 Yuki 趴進小窩討摸摸','让 Yuki 趴进小窝讨摸摸'],
    ['trick','trick','trick','Yuki shows a little trick','Yuki 表演小才藝','Yuki 表演小才艺'],
    ['hide','hide','hide','Tuck Yuki away at the edge, or bring her back','讓 Yuki 躲到邊邊，或叫她回來','让 Yuki 躲到边边，或叫她回来'],
    ['yuki','yuki','yuki','Show Yuki’s fullness, mood, energy and affection','查看 Yuki 的飽足、心情、體力與好感','查看 Yuki 的饱足、心情、体力与好感'],
    ['wake','wake','wake','Wake Yuki up','叫醒 Yuki','叫醒 Yuki'],
    ['chat','chat [message]','chat hello','Open chat, optionally with a message','開啟對話，也能直接附上訊息','打开对话，也能直接附上消息'],
    ['ask','ask <question>','ask 有什麼作品？','Ask Yuki’s on-device neural network','問 Yuki 的本機神經網路','问 Yuki 的本地神经网络'],
    ['brain','brain','brain','Show how Yuki’s tiny model works','查看 Yuki 小模型的運作細節','查看 Yuki 小模型的运作细节'],
    ['follow','follow [on|off]','follow on','Toggle the pointer companion','切換游標夥伴跟隨','切换光标伙伴跟随'],
    ['cursor','cursor [s|m|l]','cursor l','Resize the pointer companion','調整游標夥伴大小','调整光标伙伴大小'],
    ['motion','motion [on|off]','motion on','Pause or resume animations','暫停或繼續動畫','暂停或继续动画'],
    ['trail','trail [hearts|paws|stars|petals|off]','trail paws','Choose the pointer trail','選擇滑鼠拖尾樣式','选择鼠标拖尾样式'],
    ['clear','clear','clear','Clear terminal output','清除終端輸出','清除终端输出'],
    ['history','history','history','List this visit’s command history','查看這次造訪的指令歷史','查看本次访问的指令历史'],
    ['echo','echo <text>','echo "hello, world"','Print your own text','輸出你輸入的文字','输出你输入的文字'],
    ['user','user [name]','user Niansia','Set a local display name for the prompt','設定指令提示字的本機暱稱','设置命令提示符的本地昵称'],
    ['neofetch','neofetch','neofetch','Show a small terminal identity card','顯示終端資訊名片','显示终端信息名片'],
    ['shortcuts','shortcuts','shortcuts','Show keyboard shortcuts','查看鍵盤快捷鍵','查看键盘快捷键'],
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
