"""Start a blog post in blog_src/ (then edit it, and run tools/build_static.py).

    python tools/new_post.py paper "Paper title" [--venue "CVPR 2025"] [--link https://arxiv.org/abs/...] [--code https://github.com/...]
    python tools/new_post.py now                     # this month's update
    python tools/new_post.py post "Title"
    python tools/new_post.py qa "The question as it was asked" --answer "Your answer"

Every post needs a zh-TW file; add <same name>.en.md next to it for an English version (zh-CN is converted automatically).
Set `draft: true` in the header to keep a post out of the build until it is ready.
"""
from __future__ import annotations

import argparse
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "blog_src"

TEMPLATES = {
    "paper": """---
type: paper
title: {title_q}
paper: {paper_q}
authors: ""
venue: {venue_q}
link: {link}
code: {code}
depth: deep
tags: []
date: {today}
description: 一句話：這篇論文最重要的發現或貢獻。
draft: true
---

## 它在做什麼

用兩三句話說明問題、方法和主要結果（用自己的話寫，不要貼原文摘要）。

## 我覺得做得好的地方

-

## 我的疑問

-

## 對我研究的啟發

-
""",
    "now": """---
type: now
title: {year} 年 {month} 月：
date: {today}
description: 這個月的重點，一句話。
draft: true
---

## 這個月做完的

- **重點一**：說明。

## 接下來

- **計畫一**：說明。
""",
    "post": """---
type: post
title: {title_q}
date: {today}
description: 一句話說明這篇在講什麼。
tags: []
draft: true
---

內文。
""",
    "qa": """---
type: qa
title: {title_q}
date: {today}
---

{answer}
""",
}


def quote(text: str) -> str:
    return '"' + text.replace('"', "'") + '"'


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:48].strip("-")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("type", choices=TEMPLATES)
    ap.add_argument("title", nargs="?", default="")
    ap.add_argument("--venue", default="")
    ap.add_argument("--link", default="")
    ap.add_argument("--code", default="")
    ap.add_argument("--answer", default="")
    ap.add_argument("--slug", default="", help="file name part after the date (default: from the title)")
    a = ap.parse_args()
    today = date.today()
    if a.type in ("paper", "post", "qa") and not a.title:
        ap.error(f"{a.type} needs a title")
    if a.type == "qa" and not a.answer:
        ap.error("qa needs --answer")
    slug = a.slug or {"now": "now", "qa": "qa"}.get(a.type, "") or slugify(a.title) or a.type
    if a.type == "qa":
        n = len(list(SRC.glob(f"{today.isoformat()}-qa*.zh-TW.md")))
        slug = f"qa-{n + 1}" if not a.slug else a.slug
    if a.type == "paper" and not a.slug:
        slug = "paper-" + (slugify(a.title) or "note")
    path = SRC / f"{today.isoformat()}-{slug}.zh-TW.md"
    if path.exists():
        raise SystemExit(f"{path.relative_to(ROOT)} already exists")
    title = a.title if a.type != "paper" else f"讀 {a.title}"
    text = TEMPLATES[a.type].format(title_q=quote(title), paper_q=quote(a.title), venue_q=quote(a.venue), link=a.link, code=a.code,
                                    today=today.isoformat(), year=today.year, month=today.month, answer=a.answer)
    SRC.mkdir(exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print(f"created {path.relative_to(ROOT)}")
    if "draft: true" in text:
        print("It is a draft: remove the `draft: true` line when it is ready, then run  python tools/build_static.py --og-missing")


if __name__ == "__main__":
    main()
