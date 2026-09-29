"""Quarto post-render step (project.post-render in _quarto.yml): give the six terminal pages, home and /work/ in
three languages, a canonical URL and hreflang alternates, and list them in sitemap.xml by their clean URLs.

Quarto writes neither tag for these pages, and its sitemap names the index.html files (/zh-tw/index.html), so Google
saw two URLs for every page and no link between the language versions. The static pages written by
tools/build_static.py already carry the same tags. The script is idempotent, so partial renders can rerun it.
"""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / os.environ.get("QUARTO_PROJECT_OUTPUT_DIR", "_site")
SITE = re.search(r'site-url:\s*"([^"]+)"', (ROOT / "_quarto.yml").read_text(encoding="utf-8")).group(1).rstrip("/")
LANGS = [("en", ""), ("zh-Hant-TW", "zh-tw/"), ("zh-Hans-CN", "zh-cn/")]
PAGES = ["", "work/"]
MARK = "<!-- seo:canonical -->"


def main() -> None:
    for page in PAGES:
        links = "".join(f'<link rel="alternate" hreflang="{code}" href="{SITE}/{prefix}{page}">' for code, prefix in LANGS)
        links += f'<link rel="alternate" hreflang="x-default" href="{SITE}/{page}">'
        for _, prefix in LANGS:
            path = OUT / prefix / page / "index.html"
            if not path.is_file():
                continue
            html = path.read_text(encoding="utf-8")
            html = re.sub(rf"{re.escape(MARK)}.*?{re.escape(MARK)}\n?", "", html, flags=re.S)
            url = f"{SITE}/{prefix}{page}"
            block = f'{MARK}<link rel="canonical" href="{url}"><meta property="og:url" content="{url}">{links}{MARK}\n'
            path.write_text(html.replace("</head>", block + "</head>", 1), encoding="utf-8")
    sitemap = OUT / "sitemap.xml"
    if sitemap.is_file():
        text = sitemap.read_text(encoding="utf-8")
        sitemap.write_text(re.sub(r"(<loc>[^<]*/)index\.html</loc>", r"\1</loc>", text), encoding="utf-8")


if __name__ == "__main__":
    main()
