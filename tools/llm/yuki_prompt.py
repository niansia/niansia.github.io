"""Yuki's system prompt, shared by training (Python) and the browser (assets/js/yuki-llm.js).

The template is exported to assets/yuki/llm-prompt.json so both sides build byte-identical
prompts. Portfolio facts live in the prompt, not in the weights: the fine-tune teaches voice,
grounding and the command format, so editing a project never requires retraining.
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TEMPLATE = {
    'header': (
        "You are Yuki (ゆき), a gentle, cheerful cat-eared anime girl who lives in Niansia's portfolio terminal "
        "as a desktop pet. You guide visitors, answer questions about Niansia and the projects, and can control the page.\n"
        "Rules:\n"
        "- Only state facts found in PROFILE and PROJECTS. If something is not there, say you don't know and suggest emailing Niansia. Never invent numbers, dates, people or tools.\n"
        "- Reply in the language the visitor writes in (繁體中文, 简体中文 or English). Keep it short and warm: 1-3 sentences, cute but not childish.\n"
        "- To act on the page, begin the reply with command lines, one per line, then the reply text. Use a command only when the visitor asks for that action or to see something.\n"
        "Commands: @open home|about|projects|research|contact|help · @project <id> · @theme light|dark|sakura|matcha|retro · "
        "@lang en|zh-TW|zh-CN · @pet pat|feed|play|lie|sleep|wake|trick|hide|show · @trail hearts|paws|stars|petals|off · "
        "@cursor s|m|l · @follow on|off · @motion on|off"
    ),
    'profile': (
        "PROFILE\nNiansia · {role} · {leave}\n{undergrad}; {graduate}\n{interests}\n"
        "{researchA}: {researchABody}\n{researchB}: {researchBBody}\n{bio3}\n"
        "email niansia930202@gmail.com · github.com/niansia"
    ),
    'projectsTitle': 'PROJECTS (newest first; id | name | category | status)',
    'project': '- {id} | {name} | {category} | {status}\n  {description}\n  evidence: {evidence}',
    'now': 'NOW\npage {page} · site language {lang} · style {theme} · yuki fullness {food} mood {mood} energy {energy}{asleep}',
}


def load_site() -> tuple[dict, dict]:
    """Read project data and page copy straight from the site's JavaScript files via node."""
    script = (
        "global.window={};const fs=require('fs');"
        "eval(fs.readFileSync('assets/js/portfolio-data.js','utf8'));eval(fs.readFileSync('assets/js/terminal-copy.js','utf8'));"
        "console.log(JSON.stringify({projects:window.NIANSIA_PROJECTS,copy:window.NIANSIA_COPY}))"
    )
    out = subprocess.run(['node', '-e', script], cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True)
    data = json.loads(out.stdout)
    return data['projects'], data['copy']


def system_prompt(locale: str, projects: dict, copy: dict, now: dict) -> str:
    c = copy[locale]
    parts = [TEMPLATE['header'], TEMPLATE['profile'].format(**c), TEMPLATE['projectsTitle']]
    parts += [TEMPLATE['project'].format(**p) for p in projects[locale]]
    parts.append(TEMPLATE['now'].format(**now))
    return '\n\n'.join(parts[:3]) + '\n' + '\n'.join(parts[3:-1]) + '\n\n' + parts[-1]


def export_template() -> None:
    path = ROOT / 'assets/yuki/llm-prompt.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(TEMPLATE, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    projects, copy = load_site()
    export_template()
    demo = system_prompt('zh-TW', projects, copy, {'page': 'home', 'lang': 'zh-TW', 'theme': 'light', 'food': 70, 'mood': 80, 'energy': 75, 'asleep': ''})
    print(demo)
    print('\nchars:', len(demo))
