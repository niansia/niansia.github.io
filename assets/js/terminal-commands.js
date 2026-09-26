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
    ['theme','theme [light|dark]','theme dark','Switch the appearance','切換黑白主題','切换黑白主题'],
    ['lang','lang <en|zh-tw|zh-cn>','lang zh-tw','Switch language without losing your place','切換語言並保留目前頁面','切换语言并保留当前页面'],
    ['pet','pet','pet','Give Yuki a gentle pat','摸摸 Yuki','摸摸 Yuki'],
    ['feed','feed','feed','Give Yuki a snack','餵 Yuki 吃點心','喂 Yuki 吃点心'],
    ['play','play','play','Play with Yuki','和 Yuki 陪玩','和 Yuki 玩耍'],
    ['sleep','sleep','sleep','Let Yuki take a nap','讓 Yuki 休息','让 Yuki 休息'],
    ['wake','wake','wake','Wake Yuki up','叫醒 Yuki','叫醒 Yuki'],
    ['chat','chat [message]','chat hello','Open chat, optionally with a message','開啟對話，也能直接附上訊息','打开对话，也能直接附上消息'],
    ['follow','follow [on|off]','follow on','Toggle the tiny pointer companion','切換迷你角色跟隨','切换迷你角色跟随'],
    ['motion','motion [on|off]','motion on','Pause or resume animations','暫停或繼續動畫','暂停或继续动画'],
    ['trail','trail [on|off]','trail on','Toggle the fading heart trail','切換漸隱愛心拖尾','切换渐隐爱心拖尾'],
    ['clear','clear','clear','Clear terminal output','清除終端輸出','清除终端输出'],
    ['history','history','history','List this visit’s command history','查看這次造訪的指令歷史','查看本次访问的指令历史'],
    ['echo','echo <text>','echo "hello, world"','Print your own text','輸出你輸入的文字','输出你输入的文字'],
    ['user','user [name]','user Niansia','Set a local display name for the prompt','設定指令提示字的本機暱稱','设置命令提示符的本地昵称'],
    ['neofetch','neofetch','neofetch','Show a small terminal identity card','顯示終端資訊名片','显示终端信息名片'],
    ['shortcuts','shortcuts','shortcuts','Show keyboard shortcuts','查看鍵盤快捷鍵','查看键盘快捷键']
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
