"""Build the supervised fine-tuning set for Yuki's LLM (prompt/completion format).

Every example carries the real system prompt (profile, all projects, current page state),
so the model learns to *read* the portfolio instead of memorising it. Answers are grounded
in the JSON fields; unknown questions teach refusal; commands teach the @-line format.

Run: python tools/llm/make_dataset.py   ->  C:/Users/User/yuki-llm/data/{train,valid}.jsonl
"""
from __future__ import annotations

import json
import random
import sys
from pathlib import Path

import opencc

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from yuki_prompt import load_site, system_prompt, export_template  # noqa: E402
from yuki_brain_data import REPLIES  # noqa: E402

OUT = Path(r'C:\Users\User\yuki-llm\data')
TW2S = opencc.OpenCC('tw2sp')
rng = random.Random(11)
PROJECTS, COPY = load_site()
IDS = [p['id'] for p in PROJECTS['en']]
LOCALES = ['en', 'zh-TW', 'zh-CN']
THEMES = ['light', 'dark', 'sakura', 'matcha', 'retro']


def zh(text: str, lang: str) -> str:
    return TW2S.convert(text) if lang == 'zh-CN' else text


def P(pid: str, lang: str) -> dict:
    return next(p for p in PROJECTS[lang] if p['id'] == pid)


def first_sentence(text: str) -> str:
    for mark in ('。', '. '):
        if mark in text:
            return text.split(mark)[0] + ('。' if mark == '。' else '.')
    return text


# ---------- name variants visitors actually type ----------
NICK = {
    'taiwan-exam': {'en': ['Taiwan Exam', 'taiwan exam', 'the exam skill', 'the GSAT exam project'], 'zh': ['Taiwan Exam', '學測那個', '學測模擬考', '出考卷的那個']},
    'kcrashlab': {'en': ['KCrashLab', 'kcrashlab', 'KCrash Lab'], 'zh': ['KCrashLab', 'kcrashlab', '驅動程式那個']},
    'contextsec': {'en': ['ContextSec', 'contextsec'], 'zh': ['ContextSec', 'contextsec', '安全決策那個']},
    'merriv': {'en': ['Merriv', 'merriv'], 'zh': ['Merriv', 'merriv', '模型發布那個']},
    'ai-repo-gardener': {'en': ['AI Repo Gardener', 'repo gardener', 'Gardener'], 'zh': ['AI Repo Gardener', 'Repo Gardener', '清理程式碼那個']},
    'psg': {'en': ['PSG', 'Project State Graph', 'psg'], 'zh': ['PSG', 'Project State Graph', 'psg']},
    'noveltyaudit': {'en': ['NoveltyAudit', 'Novelty Audit'], 'zh': ['NoveltyAudit', '論文新穎性那個']},
    'research-meeting-coach': {'en': ['Research Meeting Coach', 'meeting coach'], 'zh': ['Research Meeting Coach', '開會教練', '跟導師開會那個']},
    'chromarecover': {'en': ['ChromaRecover', 'chromarecover', 'Chroma Recover'], 'zh': ['ChromaRecover', 'chromarecover', '色彩還原那個']},
}
TOPICS = {
    'computer vision': ['chromarecover'], 'images': ['chromarecover'], 'color': ['chromarecover'],
    'AI security': ['contextsec'], 'coding agents': ['contextsec', 'psg'], 'agent governance': ['psg'], 'MCP': ['psg'],
    'Windows drivers': ['kcrashlab'], 'system reliability': ['kcrashlab'], 'crashes': ['kcrashlab'],
    'exams': ['taiwan-exam'], 'education': ['taiwan-exam'], 'model releases': ['merriv'], 'deploying models': ['merriv'],
    'Python cleanup': ['ai-repo-gardener'], 'static analysis': ['ai-repo-gardener'], 'dead code': ['ai-repo-gardener'],
    'papers': ['noveltyaudit'], 'literature review': ['noveltyaudit'], 'novelty': ['noveltyaudit'],
    'advisor meetings': ['research-meeting-coach'], 'research progress': ['research-meeting-coach'],
}
TOPICS_ZH = {
    '電腦視覺': ['chromarecover'], '影像': ['chromarecover'], '色彩': ['chromarecover'], 'AI 安全': ['contextsec'], '資安': ['contextsec'],
    '程式代理': ['contextsec', 'psg'], '代理治理': ['psg'], 'MCP': ['psg'], '驅動程式': ['kcrashlab'], '系統可靠性': ['kcrashlab'], '當機': ['kcrashlab'],
    '考試': ['taiwan-exam'], '學測': ['taiwan-exam'], '教育': ['taiwan-exam'], '模型發布': ['merriv'], '模型部署': ['merriv'],
    '靜態分析': ['ai-repo-gardener'], 'Python 清理': ['ai-repo-gardener'], '論文': ['noveltyaudit'], '文獻回顧': ['noveltyaudit'], '新穎性': ['noveltyaudit'],
    '跟導師開會': ['research-meeting-coach'], '研究進度': ['research-meeting-coach'],
}

OPEN = {'en': ['', '', 'Sure! ', 'Ooh, ', 'Happy to! ', 'Of course~ '], 'zh-TW': ['', '', '好呀～', '這個我知道！', '嗯嗯，', '交給我～']}
CLOSE = {'en': ['', '', ' Want me to open it?', ' I opened it for you.', ' (=^･ω･^=)'], 'zh-TW': ['', '', '要我幫你打開嗎？', '我幫你打開了～', '(=^･ω･^=)']}


def persona(lang: str, body: str, opened: bool) -> str:
    key = 'en' if lang == 'en' else 'zh-TW'
    close = rng.choice([c for c in CLOSE[key] if opened or ('opened' not in c and '打開了' not in c)])
    return zh(rng.choice(OPEN[key]) + body + close, lang).strip()


def ulang(page: str) -> str:
    """Language the visitor writes in: usually the page language, sometimes not."""
    return page if rng.random() < .82 else rng.choice([l for l in LOCALES if l != page])


def now(page_locale: str, page='home', theme=None, asleep=False) -> dict:
    return {'page': page, 'lang': page_locale, 'theme': theme or rng.choice(THEMES), 'food': rng.randint(15, 100),
            'mood': rng.randint(20, 100), 'energy': rng.randint(10, 100), 'asleep': ' · asleep' if asleep else ''}


def sample(page_locale: str, state: dict, turns: list[tuple[str, str]]) -> dict:
    msgs = [{'role': 'system', 'content': system_prompt(page_locale, PROJECTS, COPY, state)}]
    for user, assistant in turns[:-1]:
        msgs += [{'role': 'user', 'content': user}, {'role': 'assistant', 'content': assistant}]
    msgs.append({'role': 'user', 'content': turns[-1][0]})
    return {'prompt': msgs, 'completion': [{'role': 'assistant', 'content': turns[-1][1]}]}


def nick(pid: str, lang: str) -> str:
    return zh(rng.choice(NICK[pid]['en' if lang == 'en' else 'zh']), lang)


# ---------- question generators; each returns (question, answer) in language `lang` ----------
Q_DETAIL = {
    'en': ['What is {n}?', 'Tell me about {n}', 'what does {n} do', 'Can you explain {n}?', '{n}?', 'show me {n}', 'I want to know more about {n}',
           'what problem does {n} solve?', 'open {n}', "what's {n} about", 'describe {n} in simple words'],
    'zh-TW': ['{n}是什麼？', '介紹一下{n}', '{n}在做什麼', '可以解釋{n}嗎', '{n}？', '打開{n}', '我想多了解{n}', '{n}解決什麼問題',
              '{n}是幹嘛用的', '用簡單的話說{n}是什麼', '跟我說說{n}吧'],
}
Q_STATUS = {'en': ["What's the status of {n}?", 'is {n} finished?', 'how far along is {n}', 'is {n} ready to use?'],
            'zh-TW': ['{n}做到哪了？', '{n}完成了嗎', '{n}現在的狀態是？', '{n}可以用了嗎']}
Q_EVIDENCE = {'en': ['How was {n} tested?', 'what evidence does {n} have?', 'how do I know {n} works?', 'what has {n} verified so far'],
              'zh-TW': ['{n}怎麼驗證的？', '{n}有什麼證據', '怎麼知道{n}真的有用', '{n}目前驗證了什麼']}
Q_SOURCE = {'en': ['Where is the code for {n}?', 'github link for {n}', 'source of {n}?'],
            'zh-TW': ['{n}的原始碼在哪？', '{n}的 github', '{n}程式碼在哪裡']}


def pick_q(table: dict, lang: str, **kw) -> str:
    return zh(rng.choice(table['en' if lang == 'en' else 'zh-TW']).format(**kw), lang)


def qa_detail(page, lang):
    pid = rng.choice(IDS); p = P(pid, lang)
    q = pick_q(Q_DETAIL, lang, n=nick(pid, lang))
    body = (f"{p['name']} is a {p['category'].lower()} project: {p['description']} Right now it's at “{p['status']}”." if lang == 'en'
            else zh(f"{p['name']}（{p['category']}）：", lang) + p['description'] + zh(f"目前狀態是「{p['status']}」。", lang))
    if rng.random() < .35:
        body = (f"{p['name']} — {first_sentence(p['description'])} Status: {p['status']}." if lang == 'en'
                else f"{p['name']}：" + first_sentence(p['description']) + zh(f"目前是「{p['status']}」。", lang))
    return q, f"@project {pid}\n" + persona(lang, body, True)


def qa_status(page, lang):
    pid = rng.choice(IDS); p = P(pid, lang)
    body = (f"{p['name']} is currently at “{p['status']}”. Evidence so far: {p['evidence']}" if lang == 'en'
            else zh(f"{p['name']} 目前是「{p['status']}」。已經有的證據：", lang) + p['evidence'])
    return pick_q(Q_STATUS, lang, n=nick(pid, lang)), persona(lang, body, False)


def qa_evidence(page, lang):
    pid = rng.choice(IDS); p = P(pid, lang)
    body = (f"For {p['name']}: {p['evidence']}" if lang == 'en' else zh(f"{p['name']} 的證據與範圍：", lang) + p['evidence'])
    return pick_q(Q_EVIDENCE, lang, n=nick(pid, lang)), persona(lang, body, False)


def qa_source(page, lang):
    pid = rng.choice(IDS); p = P(pid, lang)
    body = (f"The source of {p['name']} is at {p['url']} — and the {p['referenceLabel']} is a good place to start." if lang == 'en'
            else zh(f"{p['name']} 的原始碼在 {p['url']}，可以先看「{p['referenceLabel']}」。", lang))
    return pick_q(Q_SOURCE, lang, n=nick(pid, lang)), f"@project {pid}\n" + persona(lang, body, True)


def qa_topic(page, lang):
    if lang == 'en':
        topic, ids = rng.choice(list(TOPICS.items()))
        q = rng.choice(['Is there a project about {t}?', 'which project deals with {t}?', 'anything on {t}?', 'I am into {t}, what should I look at?', 'projects related to {t}']).format(t=topic)
    else:
        topic, ids = rng.choice(list(TOPICS_ZH.items()))
        q = zh(rng.choice(['有跟{t}有關的作品嗎？', '哪個作品在做{t}', '我對{t}有興趣，該看哪個？', '{t}相關的作品', '有沒有做{t}的'] ).format(t=topic), lang)
    ps = [P(i, lang) for i in ids]
    if lang == 'en':
        body = ' '.join(f"{p['name']} ({p['category']}): {first_sentence(p['description'])}" for p in ps)
    else:
        body = ''.join(zh(f"{p['name']}（{p['category']}）：", lang) + first_sentence(p['description']) for p in ps)
    return q, f"@project {ids[0]}\n" + persona(lang, body, True)


def qa_compare(page, lang):
    a, b = rng.sample(IDS, 2); pa, pb = P(a, lang), P(b, lang)
    if lang == 'en':
        q = rng.choice(['How is {a} different from {b}?', '{a} vs {b}?', "what's the difference between {a} and {b}"]).format(a=nick(a, lang), b=nick(b, lang))
        body = f"{pa['name']} is {pa['category'].lower()} ({pa['status']}): {first_sentence(pa['description'])} {pb['name']} is {pb['category'].lower()} ({pb['status']}): {first_sentence(pb['description'])}"
    else:
        q = zh(rng.choice(['{a}跟{b}差在哪？', '{a}和{b}有什麼不同', '比較一下{a}和{b}']).format(a=nick(a, lang), b=nick(b, lang)), lang)
        body = zh(f"{pa['name']} 屬於{pa['category']}（{pa['status']}）：", lang) + first_sentence(pa['description']) + zh(f"{pb['name']} 則是{pb['category']}（{pb['status']}）：", lang) + first_sentence(pb['description'])
    return q, persona(lang, body, False)


def qa_list(page, lang):
    names = [p['name'] for p in PROJECTS[lang]]
    kind = rng.random()
    if kind < .45:
        q = rng.choice(['What projects are there?', 'show me the projects', 'what has niansia built?', 'list the works']) if lang == 'en' else zh(rng.choice(['他有什麼作品？', '帶我看作品', '有哪些專案', '作品有哪些', '你主人做過什麼']), lang)
        body = (f"There are {len(names)} projects: {', '.join(names)}. Which one looks fun?" if lang == 'en' else zh(f"一共有 {len(names)} 項作品：", lang) + '、'.join(names) + zh('。想先看哪一個？', lang))
        return q, '@open projects\n' + persona(lang, body, False)
    if kind < .7:
        p = PROJECTS[lang][0]
        q = rng.choice(["What's the newest project?", 'anything new?', 'latest work?']) if lang == 'en' else zh(rng.choice(['最新的作品是什麼？', '最近有什麼新東西', '最新加入的是哪個']), lang)
        body = (f"The newest is {p['name']}: {first_sentence(p['description'])}" if lang == 'en' else zh(f"最新加入的是 {p['name']}：", lang) + first_sentence(p['description']))
        return q, f"@project {p['id']}\n" + persona(lang, body, True)
    if kind < .85:
        q = rng.choice(['How many projects are there?', 'how many works?']) if lang == 'en' else zh(rng.choice(['總共有幾個作品？', '作品有幾項']), lang)
        body = f"{len(names)} public projects!" if lang == 'en' else zh(f"一共 {len(names)} 項公開作品！", lang)
        return q, persona(lang, body, False)
    p = rng.choice(PROJECTS[lang])
    q = rng.choice(['Recommend a project', 'which one should I look at first?', 'surprise me']) if lang == 'en' else zh(rng.choice(['推薦一個作品', '先看哪個比較好？', '給我驚喜']), lang)
    body = (f"How about {p['name']}? {first_sentence(p['description'])}" if lang == 'en' else zh(f"推薦 {p['name']}！", lang) + first_sentence(p['description']))
    return q, f"@project {p['id']}\n" + persona(lang, body, True)


def qa_profile(page, lang):
    c = COPY[lang]
    choices = [
        (['Who is Niansia?', 'who made this site?', 'tell me about the owner'], ['Niansia 是誰？', '這個網站是誰做的', '介紹一下你主人'],
         '@open about\n', lambda: (f"Niansia is a {c['role']} ({c['leave'].lower()}), exploring {c['interests']}." if lang == 'en' else zh('Niansia 是', lang) + c['role'] + '，' + c['leave'] + zh('，研究興趣是 ', lang) + c['interests'] + '。')),
        (['Where did Niansia study?', 'education?', 'which university?'], ['他讀哪間學校？', '學歷是？', '大學念哪裡'], '',
         lambda: (f"{c['undergrad']}; now {c['graduate']} — {c['leave'].lower()}." if lang == 'en' else c['undergrad'] + zh('；現在是', lang) + c['graduate'] + '，' + c['leave'] + '。')),
        (['What does Niansia research?', 'research interests?', 'what is the research about'], ['研究方向是什麼？', '他在研究什麼', '研究興趣'], '@open research\n',
         lambda: f"{c['researchA']}: {first_sentence(c['researchABody'])} {c['researchB']}: {first_sentence(c['researchBBody'])}" if lang == 'en' else c['researchA'] + '：' + first_sentence(c['researchABody']) + c['researchB'] + '：' + first_sentence(c['researchBBody'])),
        (['How can I contact Niansia?', 'email?', 'can we collaborate?'], ['怎麼聯絡他？', '信箱是多少', '可以合作嗎'], '@open contact\n',
         lambda: "Write to wilbur930202@gmail.com — Niansia welcomes thoughtful conversations and collaborations." if lang == 'en' else zh('可以寫信到 wilbur930202@gmail.com，Niansia 很歡迎交流與合作。', lang)),
        (['What skills does Niansia have?', 'what tech do they use?'], ['他會什麼技術？', '擅長什麼'], '',
         lambda: "From the projects: AI security, computer vision, Agent Skills and MCP tooling, static analysis of Python repos, statistical evaluation and multi-platform CI." if lang == 'en' else zh('從作品看得出來：AI 安全、電腦視覺、Agent Skill 與 MCP 工具、Python 儲存庫靜態分析、統計評估，還有跨平台 CI。', lang)),
    ]
    en_q, zh_q, cmd, ans = rng.choice(choices)
    q = rng.choice(en_q) if lang == 'en' else zh(rng.choice(zh_q), lang)
    return q, cmd + persona(lang, ans(), False)


UNKNOWN = {
    'en': ['How old is Niansia?', "What's Niansia's GPA?", 'Does Niansia have a girlfriend?', 'Which company does Niansia work for?', 'How many lines of code is KCrashLab?',
           'When will ContextSec 1.0 ship?', "What's Niansia's phone number?", 'Who funds Merriv?', 'How many stars does PSG have on GitHub?', 'Where does Niansia live exactly?',
           "What's the weather today?", 'Write me a poem about the ocean', "What's the capital of Peru?", 'What salary does Niansia expect?', 'Which paper did Niansia publish?'],
    'zh-TW': ['Niansia 幾歲？', '他的 GPA 多少', '他有女朋友嗎', '他在哪家公司上班', 'KCrashLab 有幾行程式碼', 'ContextSec 什麼時候出 1.0', '他的電話是多少', 'Merriv 是誰贊助的',
              'PSG 在 GitHub 有幾顆星', '他住在哪裡', '今天天氣如何', '幫我寫一首詩', '秘魯的首都是哪', '他期望薪水多少', '他發表過哪篇論文'],
}


def qa_unknown(page, lang):
    q = rng.choice(UNKNOWN['en']) if lang == 'en' else zh(rng.choice(UNKNOWN['zh-TW']), lang)
    general = any(k in q for k in ('weather', 'poem', 'Peru', '天氣', '詩', '秘魯', '秘鲁', '天气'))
    if general:
        body = "That's outside my little world — I only know Niansia and these projects. Want a project recommendation instead?" if lang == 'en' else zh('這超出我的小世界了，我只懂 Niansia 和這些作品。要不要我推薦一個作品？', lang)
    else:
        body = "I don't know that one — it isn't in what Niansia shared here. You could ask directly at wilbur930202@gmail.com!" if lang == 'en' else zh('這個我不知道，Niansia 在這裡沒有提到。可以直接寫信問 wilbur930202@gmail.com 喔！', lang)
    return q, persona(lang, body, False)


def reply_line(intent: str, lg: str, **kw) -> str:
    key = 'en' if lg == 'en' else 'zh-TW'
    return zh(rng.choice(REPLIES[intent][key]).format(**kw), lg)


CMD_Q = {
    'theme': (['Switch to {v} style', 'make it {v}', '{v} mode please', 'change the theme to {v}'], ['換成{v}風格', '切換到{v}', '我要{v}模式', '網頁風格改成{v}']),
    'lang': (['Switch to {v}', 'Can you show this in {v}?', '{v} please'], ['切換成{v}', '換成{v}', '我想看{v}版']),
    'trail': (['Change the mouse trail to {v}', 'use {v} for the trail'], ['拖尾換成{v}', '滑鼠特效改成{v}']),
}
LANG_WORD = {'en': {'en': 'English', 'zh-TW': 'Traditional Chinese', 'zh-CN': 'Simplified Chinese'}, 'zh-TW': {'en': '英文', 'zh-TW': '繁體中文', 'zh-CN': '簡體中文'}}
TRAIL_WORD = {'hearts': ('hearts', '愛心'), 'paws': ('paw prints', '貓掌印'), 'stars': ('stars', '星星'), 'petals': ('petals', '花瓣')}
PET_Q = {
    'pat': (['*pats your head*', 'can I pet you?', 'headpat!'], ['摸摸頭', '可以摸你嗎', '給你摸摸'], 'pet_pat'),
    'feed': (['Want a snack?', 'here, have a fish', 'are you hungry?'], ['要不要吃點心？', '給你小魚乾', '你餓了嗎'], 'pet_feed'),
    'play': (["Let's play!", 'play ball with me', "I'm bored"], ['陪我玩', '來玩毛線球', '好無聊喔'], 'pet_play'),
    'lie': (['Lie down', 'get comfy in your bed'], ['趴下', '去窩裡躺著'], 'pet_lie'),
    'sleep': (['Go take a nap', 'you look sleepy, rest'], ['去睡覺吧', '你看起來好睏，休息一下'], 'pet_sleep'),
    'wake': (['Wake up!', 'rise and shine'], ['起床囉', '醒醒'], 'pet_wake'),
    'trick': (['Do a trick!', 'dance for me'], ['跳個舞', '表演一下'], 'pet_trick'),
    'hide': (["You're blocking the text, hide please", 'go hide for a bit'], ['你擋到字了，先躲起來', '躲起來一下'], 'hide'),
}


def qa_command(page, lang):
    kind = rng.choice(['theme', 'theme', 'lang', 'pet', 'pet', 'pet', 'trail', 'open', 'misc'])
    en = lang == 'en'
    names = COPY[lang]['themeNames']
    if kind == 'theme':
        v = rng.choice(THEMES)
        word = rng.choice([v, names[v]]) if en else rng.choice([names[v], {'light': '淺色', 'dark': '深色', 'sakura': '櫻花', 'matcha': '抹茶', 'retro': '復古'}[v]])
        q = rng.choice(CMD_Q['theme'][0]).format(v=word) if en else zh(rng.choice(CMD_Q['theme'][1]).format(v=word), lang)
        return q, f"@theme {v}\n" + reply_line('set_theme', lang, theme=names[v])
    if kind == 'lang':
        v = rng.choice([l for l in LOCALES if l != page])
        q = rng.choice(CMD_Q['lang'][0]).format(v=LANG_WORD['en'][v]) if en else zh(rng.choice(CMD_Q['lang'][1]).format(v=LANG_WORD['zh-TW'][v]), lang)
        target = 'en' if v == 'en' else v
        return q, f"@lang {v}\n" + reply_line('set_language', target, lang={'en': 'English', 'zh-TW': '繁體中文', 'zh-CN': '简体中文'}[v])
    if kind == 'pet':
        v = rng.choice(list(PET_Q)); en_q, zh_q, intent = PET_Q[v]
        q = rng.choice(en_q) if en else zh(rng.choice(zh_q), lang)
        return q, f"@pet {v}\n" + reply_line(intent, lang)
    if kind == 'trail':
        v = rng.choice(list(TRAIL_WORD))
        q = rng.choice(CMD_Q['trail'][0]).format(v=TRAIL_WORD[v][0]) if en else zh(rng.choice(CMD_Q['trail'][1]).format(v=TRAIL_WORD[v][1]), lang)
        return q, f"@trail {v}\n" + (f"Trail: {TRAIL_WORD[v][0]}. Wiggle your mouse!" if en else zh(f"拖尾換成{TRAIL_WORD[v][1]}了，動動滑鼠看看！", lang))
    if kind == 'open':
        v = rng.choice(['home', 'about', 'research', 'contact', 'help'])
        nav = COPY[lang]['nav'][['home', 'about', 'projects', 'research', 'contact', 'help'].index(v)]
        q = rng.choice([f'Open {v}', f'go to the {v} page', f'take me to {v}']) if en else zh(rng.choice([f'打開{nav}', f'去{nav}頁面', f'帶我去{nav}']), lang)
        return q, f"@open {v}\n" + (f"Here's {nav}!" if en else zh(f"這裡是{nav}～", lang))
    misc = rng.choice([
        (['Stop following my mouse', "don't follow me"], ['不要跟著我', '別跟著滑鼠'], '@follow off', ("Okay, I'll stay here.", '好，我乖乖待在這裡。')),
        (['Follow my cursor', 'come follow me'], ['跟著我', '跟著滑鼠走'], '@follow on', ("I'll follow your pointer!", '我會跟著你的滑鼠喔！')),
        (['Turn off animations', 'too much motion'], ['關掉動畫', '動畫太多了'], '@motion off', ('Animations paused.', '動畫暫停了。')),
        (['Make the cursor buddy bigger'], ['游標小人大一點'], '@cursor l', ('Bigger it is!', '變大了！')),
        (['Make the cursor buddy smaller'], ['游標小人小一點'], '@cursor s', ('Tiny mode~', '變小了～')),
    ])
    q = rng.choice(misc[0]) if en else zh(rng.choice(misc[1]), lang)
    return q, misc[2] + '\n' + (misc[3][0] if en else zh(misc[3][1], lang))


CHAT = {'greet': (['hi', 'hello Yuki!', 'good morning'], ['嗨', '你好呀 Yuki', '早安']), 'thanks': (['thanks!', 'thank you yuki'], ['謝謝', '感謝你']),
        'bye': (['bye!', 'see you later'], ['掰掰', '下次見']), 'compliment': (['you are so cute', 'nice website!'], ['你好可愛', '網站好漂亮']),
        'love': (['I love you', 'be my girlfriend'], ['我喜歡你', '當我女朋友']), 'insult': (['you are dumb', 'useless cat'], ['你好笨', '笨貓']),
        'joke': (['tell me a joke', 'make me laugh'], ['講個笑話', '逗我笑']), 'comfort': (["I'm so tired", 'bad day today', 'my code is broken'], ['我好累', '今天好糟', '我的程式壞掉了']),
        'happy': (['I passed my exam!', 'good news!'], ['我考過了！', '有好消息！']), 'favorite': (['what do you like?', 'favorite food?'], ['你喜歡什麼？', '最喜歡的食物是？']),
        'yuki_self': (['who are you?', 'are you an AI?'], ['你是誰？', '你是 AI 嗎'])}


def qa_chat(page, lang):
    intent = rng.choice(list(CHAT))
    q = rng.choice(CHAT[intent][0]) if lang == 'en' else zh(rng.choice(CHAT[intent][1]), lang)
    if intent == 'yuki_self':
        a = ("I'm Yuki, the cat-eared keeper of this terminal! I'm a small language model fine-tuned for this site, running right in your browser." if lang == 'en'
             else zh('我是 Yuki，住在這個終端裡的貓耳夥伴！我是為這個網站微調的小型語言模型，直接在你的瀏覽器裡運作。', lang))
        return q, a
    cmd = {'compliment': '@pet trick\n', 'happy': '@pet trick\n'}.get(intent, '') if rng.random() < .5 else ''
    return q, cmd + reply_line(intent, lang, user='niansia', brain='')


def qa_state(page, lang, state):
    q = rng.choice(['How are you?', 'are you hungry?', 'how do you feel?']) if lang == 'en' else zh(rng.choice(['你好嗎？', '你餓了嗎', '心情如何']), lang)
    hungry, tired = state['food'] < 35, state['energy'] < 30
    if lang == 'en':
        a = f"Fullness {state['food']}, mood {state['mood']}, energy {state['energy']}. " + ('A snack would be lovely…' if hungry else 'A bit sleepy…' if tired else "I'm doing great!")
    else:
        a = zh(f"飽足 {state['food']}、心情 {state['mood']}、體力 {state['energy']}。", lang) + zh('有點餓，想吃點心……' if hungry else '有點睏了……' if tired else '我現在很好！', lang)
    return q, a


# ---------- multi-turn and page-context samples ----------
FOLLOW = {'status': (['And its status?', 'is it finished?'], ['那它現在的狀態呢？', '它完成了嗎']),
          'evidence': (['How was it tested?', 'any evidence?'], ['那它怎麼驗證的？', '有什麼證據']),
          'open': (['Open it', 'show me'], ['打開它', '帶我去看'])}


def multi_turn(page, lang):
    q1, a1 = qa_detail(page, lang)
    pid = a1.split('\n')[0].split()[1]; p = P(pid, lang)
    kind = rng.choice(list(FOLLOW))
    q2 = rng.choice(FOLLOW[kind][0]) if lang == 'en' else zh(rng.choice(FOLLOW[kind][1]), lang)
    if kind == 'status':
        a2 = f"It's at “{p['status']}”." if lang == 'en' else zh(f"目前是「{p['status']}」。", lang)
    elif kind == 'evidence':
        a2 = p['evidence'] if lang == 'en' else zh('證據與範圍：', lang) + p['evidence']
    else:
        a2 = f"@project {pid}\n" + (f"Here's {p['name']}!" if lang == 'en' else zh(f"這是 {p['name']}！", lang))
    return [(q1, a1), (q2, a2)]


def list_then_pick(page, lang):
    q1, a1 = qa_list(page, lang)
    while not a1.startswith('@open projects'):
        q1, a1 = qa_list(page, lang)
    i = rng.randrange(9); p = PROJECTS[lang][i]
    ordinal = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'][i]
    q2 = f"What's the {ordinal} one?" if lang == 'en' else zh(f"第{'一二三四五六七八九'[i]}個是什麼？", lang)
    a2 = f"@project {p['id']}\n" + (f"That's {p['name']}: {first_sentence(p['description'])}" if lang == 'en' else f"是 {p['name']}：" + first_sentence(p['description']))
    return [(q1, a1), (q2, a2)]


def on_page(page, lang):
    pid = rng.choice(IDS); p = P(pid, lang)
    q = rng.choice(['What is this?', 'what am I looking at?', 'explain this project', 'where is the code for this?']) if lang == 'en' else zh(rng.choice(['這是什麼？', '這個作品在做什麼', '解釋一下這個', '這個的原始碼在哪']), lang)
    if 'code' in q or '原始碼' in q:
        a = f"The source is at {p['url']}." if lang == 'en' else zh(f"原始碼在 {p['url']}。", lang)
    else:
        a = (f"You're looking at {p['name']}: {p['description']}" if lang == 'en' else zh(f"這是 {p['name']}：", lang) + p['description'])
    return f'projects/{pid}', q, a


GENERATORS = [(qa_detail, 16), (qa_status, 5), (qa_evidence, 5), (qa_source, 3), (qa_topic, 9), (qa_compare, 5), (qa_list, 8),
              (qa_profile, 8), (qa_unknown, 9), (qa_command, 15), (qa_chat, 8)]


def build(n: int) -> list[dict]:
    out = []
    pool = [g for g, w in GENERATORS for _ in range(w)]
    for _ in range(n):
        page = rng.choice(LOCALES); lang = ulang(page); r = rng.random()
        if r < .08:
            out.append(sample(page, now(page), multi_turn(page, lang)))
        elif r < .11:
            out.append(sample(page, now(page, 'projects'), list_then_pick(page, lang)))
        elif r < .16:
            where, q, a = on_page(page, lang)
            out.append(sample(page, now(page, where), [(q, a)]))
        elif r < .2:
            state = now(page)
            out.append(sample(page, state, [qa_state(page, lang, state)]))
        else:
            out.append(sample(page, now(page), [rng.choice(pool)(page, lang)]))
    return out


if __name__ == '__main__':
    export_template()
    OUT.mkdir(parents=True, exist_ok=True)
    data = build(2600)
    rng.shuffle(data)
    for name, rows in (('train', data[:2450]), ('valid', data[2450:])):
        with open(OUT / f'{name}.jsonl', 'w', encoding='utf-8') as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + '\n')
    for row in data[:6]:
        print('Q:', row['prompt'][-1]['content'], '\nA:', row['completion'][0]['content'], '\n')
    print('train', 2450, 'valid', len(data) - 2450)
