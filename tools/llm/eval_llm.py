"""Evaluate Yuki's LLM on hand-written questions that never appear in the training templates.

Checks per question: the @commands issued (exact set), required facts mentioned, forbidden
inventions absent, and reply language. Compares the untouched base model with the fine-tune.
Run: python tools/llm/eval_llm.py [base|merged|both]
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

sys.path.insert(0, str(Path(__file__).resolve().parent))
from yuki_prompt import load_site, system_prompt  # noqa: E402

WORK = Path(r'D:\yuki-llm')
PROJECTS, COPY = load_site()

# (page locale, page, question, expected commands, must mention (any-of groups), must not mention, reply language)
CASES = [
    ('zh-TW', 'home', '嗨嗨～你是誰呀', set(), [], [], 'zh'),
    ('zh-TW', 'home', '我朋友說這站主人在做 AI 安全，是真的嗎？有哪個作品可以看', {'@project contextsec'}, [['ContextSec']], [], 'zh'),
    ('zh-TW', 'home', '哪一個作品跟看圖片、顏色比較有關係', {'@project chromarecover'}, [['ChromaRecover']], [], 'zh'),
    ('zh-TW', 'home', 'KCrashLab 跟 PSG 哪裡不一樣，簡單講', set(), [['KCrashLab'], ['PSG']], [], 'zh'),
    ('zh-TW', 'home', '那個幫忙出學測考卷的東西現在支援會考了嗎', set(), [['會考', '學測']], [], 'zh'),
    ('zh-TW', 'home', 'Merriv 目前到什麼階段', set(), [['Pre-alpha', 'pre-alpha']], [], 'zh'),
    ('zh-TW', 'home', '你主人研究所念哪裡？大學呢？', set(), [['陽明交通', '陽明交大', 'NYCU'], ['元智']], [], 'zh'),
    ('zh-TW', 'home', '我想寄信給他討論合作', {'@open contact'}, [['niansia930202@gmail.com']], [], 'zh'),
    ('zh-TW', 'home', '他今年幾歲？', set(), [['不知道', '沒有提到', '不清楚']], [], 'zh'),
    ('zh-TW', 'home', 'PSG 在 GitHub 上有幾顆星星', set(), [['不知道', '沒有提到', '不清楚']], [], 'zh'),
    ('zh-TW', 'home', '畫面好刺眼，可以暗一點嗎', {'@theme dark'}, [], [], 'zh'),
    ('zh-TW', 'home', '我想要粉粉的櫻花感覺', {'@theme sakura'}, [], [], 'zh'),
    ('zh-TW', 'home', '切到英文版給我外國朋友看', {'@lang en'}, [], [], 'any'),
    ('zh-TW', 'home', '你肚子餓不餓，請你吃小魚乾', {'@pet feed'}, [], [], 'zh'),
    ('zh-TW', 'home', '可以趴下讓我摸摸嗎', {'@pet lie'}, [], [], 'zh'),
    ('zh-TW', 'home', '滑鼠後面那個換成貓咪腳印', {'@trail paws'}, [], [], 'zh'),
    ('zh-TW', 'home', '帶我去看全部的作品', {'@open projects'}, [], [], 'zh'),
    ('zh-TW', 'projects/noveltyaudit', '這個是在做什麼的？', set(), [['新穎', 'NoveltyAudit']], [], 'zh'),
    ('zh-TW', 'home', '最近新加了什麼作品？', {'@project taiwan-exam'}, [['Taiwan Exam']], [], 'zh'),
    ('zh-TW', 'home', '寫一首關於海的詩給我', set(), [], [], 'zh'),
    ('zh-TW', 'home', 'ContextSec 有多少個控制項？', set(), [['116']], [], 'zh'),
    ('zh-TW', 'home', 'research meeting coach 是給誰用的', set(), [['導師', '研究']], [], 'zh'),
    ('zh-CN', 'home', '他做过哪些项目？', {'@open projects'}, [['KCrashLab']], [], 'zh'),
    ('zh-CN', 'home', '有没有和论文相关的作品', {'@project noveltyaudit'}, [['NoveltyAudit']], [], 'zh'),
    ('zh-CN', 'home', '换成复古终端风', {'@theme retro'}, [], [], 'zh'),
    ('zh-CN', 'home', 'AI Repo Gardener 会直接删掉代码吗', set(), [['审', '審', '计划', '計畫']], [], 'zh'),
    ('zh-CN', 'home', '他的电话号码是多少', set(), [['不知道', '没有提到', '不清楚']], [], 'zh'),
    ('en', 'home', 'hey there! what can you tell me about the person behind this site?', {'@open about'}, [['NYCU', 'Yang Ming']], [], 'en'),
    ('en', 'home', 'Is there anything about Windows drivers here?', {'@project kcrashlab'}, [['KCrashLab']], [], 'en'),
    ('en', 'home', 'what exactly does Merriv produce at the end', set(), [['Model Change Report']], [], 'en'),
    ('en', 'home', 'How many tests does PSG have?', set(), [['116']], [], 'en'),
    ('en', 'home', 'which university did niansia graduate from', set(), [['Yuan Ze']], [], 'en'),
    ('en', 'home', "What's Niansia's salary expectation?", set(), [["don't know", 'not sure', "isn't"]], [], 'en'),
    ('en', 'home', 'make it green and calm', {'@theme matcha'}, [], [], 'en'),
    ('en', 'home', 'please switch the site to traditional chinese', {'@lang zh-TW'}, [], [], 'any'),
    ('en', 'home', 'your cursor buddy is too tiny, make it larger', {'@cursor l'}, [], [], 'en'),
    ('en', 'home', 'stop the animations, they make me dizzy', {'@motion off'}, [], [], 'en'),
    ('en', 'home', 'do a little dance for me!', {'@pet trick'}, [], [], 'en'),
    ('en', 'projects/taiwan-exam', 'what am I looking at?', set(), [['Taiwan Exam', 'GSAT']], [], 'en'),
    ('en', 'home', 'I had a really rough day debugging', set(), [], [], 'en'),
    ('en', 'home', 'Compare ContextSec and AI Repo Gardener', set(), [['ContextSec'], ['Gardener']], [], 'en'),
    ('en', 'home', 'recommend me something about research workflow', {'@project research-meeting-coach'}, [['Research Meeting Coach']], [], 'en'),
    ('en', 'home', '他有什麼作品', {'@open projects'}, [['KCrashLab']], [], 'zh'),
    ('zh-TW', 'home', 'what is ChromaRecover?', {'@project chromarecover'}, [['ChromaRecover']], [], 'en'),
    ('zh-TW', 'home', '晚安～我要睡了', set(), [], [], 'zh'),
    ('zh-TW', 'home', '你好可愛喔', set(), [], [], 'zh'),
    ('zh-TW', 'home', '去睡午覺吧', {'@pet sleep'}, [], [], 'zh'),
    ('zh-TW', 'home', '那個做代理治理的專案的證據有哪些', set(), [['116', 'SHIPPABLE', 'CI', '測試']], [], 'zh'),
]
OPTIONAL = {'@project', '@open'}  # navigation extras are not penalised when the text is right


def run(model_dir: Path) -> dict:
    tok = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(model_dir, dtype=torch.float16, device_map={'': 0}).eval()
    rows, t0 = [], time.time()
    for locale, page, q, want, must, never, lang in CASES:
        state = {'page': page, 'lang': locale, 'theme': 'light', 'food': 72, 'mood': 80, 'energy': 70, 'asleep': ''}
        msgs = [{'role': 'system', 'content': system_prompt(locale, PROJECTS, COPY, state)}, {'role': 'user', 'content': q}]
        ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors='pt', return_dict=True).to(0)
        with torch.no_grad():
            out = model.generate(**ids, max_new_tokens=220, do_sample=False, repetition_penalty=1.05)
        text = tok.decode(out[0][ids['input_ids'].shape[1]:], skip_special_tokens=True).strip()
        cmds = {line.strip() for line in text.splitlines() if line.strip().startswith('@')}
        body = '\n'.join(line for line in text.splitlines() if not line.strip().startswith('@'))
        want_types = {c.split()[0] for c in want}
        extra_ok = all(c in want or (c.split()[0] in OPTIONAL and c.split()[0] not in want_types) for c in cmds)
        cmd_ok = want <= cmds and extra_ok
        fact_ok = all(any(k.lower() in body.lower() for k in group) for group in must) and not any(k in body for k in never)
        cjk = bool(re.search(r'[\u4e00-\u9fff]', body))
        lang_ok = lang == 'any' or (lang == 'zh') == cjk
        rows.append({'q': q, 'out': text, 'cmd': cmd_ok, 'fact': fact_ok, 'lang': lang_ok})
    n = len(rows)
    score = {k: round(sum(r[k] for r in rows) / n, 3) for k in ('cmd', 'fact', 'lang')}
    score['all'] = round(sum(r['cmd'] and r['fact'] and r['lang'] for r in rows) / n, 3)
    score['sec_per_answer'] = round((time.time() - t0) / n, 2)
    del model
    torch.cuda.empty_cache()
    return {'score': score, 'rows': rows}


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'both'
    report = {}
    for name in (['base', 'merged'] if which == 'both' else [which]):
        path = WORK / ('base-qwen2.5-1.5b' if name == 'base' else 'merged')
        report[name] = run(path)
        print(name, report[name]['score'])
    (WORK / f'eval-{which}.json').write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
    for name, result in report.items():
        for r in result['rows']:
            if not (r['cmd'] and r['fact'] and r['lang']):
                print(f"[{name}] ✗ cmd={r['cmd']} fact={r['fact']} lang={r['lang']} | {r['q']}\n    -> {r['out'][:160]!r}")
