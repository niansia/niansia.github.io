"""Build the static, crawlable parts of the site that live outside the terminal app.

    notes_src/<slug>.<lang>.md  ->  notes/<lang>/<slug>/index.html, notes/<lang>/index.html, notes/index.html
    log_src/<date>-<slug>.<lang>.md -> log/<lang>/index.html (research log with images)
    statement_src/statement.<lang>.md -> statement/<lang>/index.html
    blog_src/<date>-<slug>.<lang>.md -> blog/<lang>/<slug>/, blog/<lang>/qa/, blog/<lang>/feed.xml, assets/js/blog-data.js
    images referenced from sources -> assets/media/<hash>.{webp,jpg} + -t.webp (metadata stripped, see content_safety.py)
    assets/js/portfolio-data.js ->  p/<id>/index.html (+ zh-tw/, zh-cn/) share pages
    open-graph images           ->  assets/og/*.jpg (1200 x 630, rendered with Playwright)
    assets/js/publications-data.js + papers_src/<id>.<lang>.md -> paper/<id>/index.html (+ zh-tw/, zh-cn/) paper pages
    terminal-copy / cv / submissions / publications data -> brief/index.html (+ zh-tw/, zh-cn/) one-page brief
    sitemap-extra.xml, robots.txt, assets/js/notes-data.js

Requires: markdown, opencc (tw2sp), Pillow, Playwright (Chrome channel), Node.js.
Run from the repository root:  python tools/build_static.py [--no-og | --og-missing]
"""
from __future__ import annotations

import asyncio
import html
import json
import math
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

import markdown
import opencc
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from content_safety import UnsafeContent, privacy_lint, render_markdown  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
# The public address lives in one place, website.site-url in _quarto.yml; moving to a custom domain means changing only that line.
SITE = re.search(r'^\s*site-url:\s*"?([^"\s]+)"?', (ROOT / "_quarto.yml").read_text(encoding="utf-8"), re.M).group(1).rstrip("/")
HOST = SITE.split("://", 1)[1]                                   # shown as text: footers, share images
LANGS = {"en": "en", "zh-tw": "zh-TW", "zh-cn": "zh-CN"}          # url segment -> locale
HTML_LANG = {"en": "en", "zh-TW": "zh-Hant", "zh-CN": "zh-Hans"}
HOME = {"en": "/", "zh-TW": "/zh-tw/", "zh-CN": "/zh-cn/"}
T2S = opencc.OpenCC("tw2sp")
S_FIX = {"缺省": "默认", "杂凑": "哈希", "笔电": "笔记本电脑", "影像": "图像", "信息工程": "资讯工程"}
EMAIL = "niansia930202@gmail.com"
MEDIA = ROOT / "assets" / "media"
MD = lambda t: markdown.markdown(t, extensions=["tables", "fenced_code", "sane_lists"])
# Static pages only load their own scripts, Google Fonts and the Firebase SDK used by the visitor counter.
CSP = ("default-src 'self'; script-src 'self' https://www.gstatic.com https://*.firebasedatabase.app; "
       "connect-src 'self' https://*.firebasedatabase.app wss://*.firebasedatabase.app; img-src 'self' data:; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; "
       "frame-src https://*.firebasedatabase.app; object-src 'none'; base-uri 'self'; form-action 'none'")

UI = {
    "en": {"notes": "Research notes", "notes_lede": "Short, honest write-ups of what I built, what worked, and what did not.", "min": "min read",
           "back": "Back to the portfolio", "more": "More notes", "open": "Open the interactive portfolio", "repo": "Source", "evidence": "Evidence",
           "share_note": "This is a lightweight page for sharing. The full, interactive version lives in the terminal portfolio.", "contact": "Questions or ideas? Email",
           "demo": "Try it in your browser", "film": "Watch the film", "all": "All projects", "read": "Read", "online": "online", "visits": "visits",
           "log": "Research log", "log_lede": "Dated snapshots of work in progress: screenshots, figures and small milestones.", "statement": "Research statement"},
    "zh-TW": {"notes": "研究筆記", "notes_lede": "把做過的東西、有效的方法，還有沒成功的地方，誠實地寫下來。", "min": "分鐘閱讀",
              "back": "回到作品集", "more": "其他筆記", "open": "打開互動式作品集", "repo": "原始碼", "evidence": "佐證",
              "share_note": "這是方便分享的精簡頁面；完整、可互動的版本在終端作品集裡。", "contact": "有問題或想法？寫信到",
              "demo": "在瀏覽器試試", "film": "觀看動畫", "all": "全部作品", "read": "閱讀", "online": "人在線", "visits": "次造訪",
              "log": "研究日誌", "log_lede": "有日期的工作紀錄：截圖、圖表和一些小里程碑。", "statement": "研究方向說明"},
}
UI["zh-CN"] = {k: T2S.convert(v) for k, v in UI["zh-TW"].items()}


def s_fix(text: str) -> str:
    text = T2S.convert(text)
    for a, b in S_FIX.items():
        text = text.replace(a, b)
    return text


def e(s) -> str:
    return html.escape(str(s), quote=True)


# ------------------------------------------------------------------------------------------------ data
def load_projects() -> dict:
    js = ("global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.NIANSIA_PROJECTS))")
    out = subprocess.run(["node", "-e", js, str(ROOT / "assets/js/portfolio-data.js")], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def parse_note(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    meta, body = m.group(1), m.group(2)
    info = {}
    for line in meta.splitlines():
        k, _, v = line.partition(":")
        v = v.strip()
        if v.startswith("[") and v.endswith("]"):
            info[k.strip()] = [x.strip() for x in v[1:-1].split(",")]
        else:
            info[k.strip()] = v.strip('"')
    info["body"] = body
    return info


def load_notes() -> dict:
    notes = {}
    for f in sorted((ROOT / "notes_src").glob("*.md")):
        slug, lang = f.stem.rsplit(".", 1)
        notes.setdefault(slug, {})[lang] = parse_note(f)
    for slug, by in notes.items():
        tw = by["zh-TW"]
        by["zh-CN"] = {k: (s_fix(v) if isinstance(v, str) else [s_fix(x) for x in v] if isinstance(v, list) else v) for k, v in tw.items()}
        by["zh-CN"]["body"] = s_fix(tw["body"]).replace("/notes/zh-tw/", "/notes/zh-cn/").replace("lang=zh-TW", "lang=zh-CN")
    return dict(sorted(notes.items(), key=lambda kv: (-int(kv[1]["en"]["date"].replace("-", "")), int(kv[1]["en"].get("order", 9)))))


def read_minutes(body: str, loc: str) -> int:
    if loc == "en":
        return max(1, round(len(re.findall(r"\w+", body)) / 220))
    return max(1, round(len(re.findall(r"[一-鿿]", body)) / 420))


# ------------------------------------------------------------------------------------------------ html shell
CSS = """
:root{--bg:#fbf6ee;--paper:#fffdf9;--ink:#2a2230;--muted:#766b73;--line:#2a22301a;--accent:#c0673a;--accent2:#8f6bb3;--code:#f3ece2;}
@media(prefers-color-scheme:dark){:root{--bg:#15142a;--paper:#1c1a36;--ink:#f1ebe2;--muted:#aaa3bd;--line:#ffffff1a;--accent:#f0a878;--accent2:#b69ae6;--code:#26234a;}}
*{box-sizing:border-box;}html{-webkit-text-size-adjust:100%;}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.85 Inter,'Noto Sans TC','Noto Sans SC',system-ui,sans-serif;}
a{color:var(--accent);text-underline-offset:3px;}
.top{max-width:1080px;margin:0 auto;padding:18px 20px;display:flex;align-items:center;gap:10px;font:500 13px 'JetBrains Mono',monospace;color:var(--muted);}
.top a{color:var(--muted);text-decoration:none;}.top a:hover{color:var(--accent);}
.top b{color:var(--ink);font-weight:500;}.top .sp{flex:1;}
.langs a{padding:4px 9px;border-radius:99px;border:1px solid var(--line);margin-left:4px;}.langs a[aria-current]{color:var(--ink);border-color:var(--accent);}
main{max-width:760px;margin:0 auto;padding:10px 20px 70px;}
.kicker{font:500 12px 'JetBrains Mono',monospace;color:var(--accent);letter-spacing:.06em;text-transform:uppercase;margin:24px 0 8px;}
h1{font-size:clamp(28px,4.4vw,42px);line-height:1.2;letter-spacing:-.02em;margin:0 0 14px;}
.lede{font-size:18px;color:var(--muted);margin:0 0 16px;line-height:1.7;}
.meta{display:flex;flex-wrap:wrap;gap:8px 14px;font:500 12.5px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;color:var(--muted);padding-bottom:22px;border-bottom:1px solid var(--line);margin-bottom:10px;}
.meta span.tag{padding:2px 9px;border-radius:99px;background:var(--code);}
article h2{font-size:23px;margin:40px 0 10px;letter-spacing:-.01em;}
article h3{font-size:18px;margin:28px 0 8px;}
article p,article li{color:var(--ink);}
article code{font:14px 'JetBrains Mono',monospace;background:var(--code);padding:1px 6px;border-radius:6px;}
article table{width:100%;border-collapse:collapse;margin:18px 0;font-size:14.5px;display:block;overflow-x:auto;}
article th,article td{padding:8px 12px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap;}
article th{font-weight:600;color:var(--muted);font-size:13px;}
article td:not(:first-child),article th:not(:first-child){text-align:right;}
article td[style*="left"],article th[style*="left"]{white-space:normal;min-width:6.5em;}   /* text tables (|:---|) wrap instead of scrolling */
article strong{color:var(--ink);}
article blockquote{margin:18px 0;padding:4px 18px;border-left:3px solid var(--accent);color:var(--muted);}
.card{display:block;padding:18px 20px;margin:12px 0;border-radius:16px;background:var(--paper);border:1px solid var(--line);text-decoration:none;color:var(--ink);transition:transform .25s,border-color .25s;}
.card:hover{transform:translateY(-2px);border-color:var(--accent);}
.card b{display:block;font-size:18px;line-height:1.4;margin-bottom:4px;}.card small{display:block;color:var(--muted);font-size:14px;line-height:1.6;}
.card i{display:block;font:normal 500 12px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;color:var(--accent);margin-top:8px;}
.hero{width:100%;border-radius:16px;border:1px solid var(--line);display:block;margin:6px 0 18px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px;}.chips span{font:500 12px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;padding:4px 11px;border-radius:99px;background:var(--code);}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0;}
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;border:1px solid var(--line);background:var(--paper);color:var(--ink);text-decoration:none;font-weight:600;font-size:14px;}
.btn.primary{background:var(--accent);border-color:transparent;color:var(--paper);}
.btn:hover{border-color:var(--accent);}
.note{font-size:13.5px;color:var(--muted);}
.live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#34c38f;box-shadow:0 0 0 3px #34c38f33;vertical-align:1px;}footer b{color:var(--ink);font-weight:600;}
figure.fig{margin:24px 0;}figure.fig a{display:block;border-radius:14px;overflow:hidden;border:1px solid var(--line);cursor:zoom-in;background:var(--code);}
figure.fig img{display:block;width:100%;height:auto;transition:transform .4s;}figure.fig a:hover img{transform:scale(1.015);}
figure.fig figcaption{margin-top:8px;font-size:13.5px;color:var(--muted);line-height:1.6;}
.lb{position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;background:#0d0b16ee;}
.lb.on{display:flex;}.lb img{max-width:100%;max-height:84vh;border-radius:10px;box-shadow:0 30px 80px #000a;}
.lb p{margin:0;color:#e9e4f2;font-size:14px;text-align:center;max-width:760px;}
.lb-x{position:absolute;top:14px;right:18px;width:40px;height:40px;border-radius:50%;border:1px solid #ffffff44;background:transparent;color:#fff;font-size:24px;cursor:pointer;}
.log-entry{position:relative;padding:0 0 34px 26px;border-left:2px solid var(--line);}
.log-entry:before{content:'';position:absolute;left:-7px;top:8px;width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid var(--accent);}
.log-entry time{font:500 12.5px 'JetBrains Mono',monospace;color:var(--accent);}
.log-entry h2{margin:4px 0 6px!important;font-size:21px!important;}
.log-entry h2 a{color:var(--ink);text-decoration:none;}
.statement-link{display:flex;justify-content:space-between;align-items:center;}
.top a.me{display:inline-flex;align-items:center;gap:8px;padding:3px 12px 3px 3px;border:1px solid var(--line);border-radius:99px;transition:border-color .2s;}.top a.me:hover{border-color:var(--accent);}.top a.me img{width:24px;height:24px;border-radius:50%;display:block;}
.author{max-width:720px;margin:44px auto 0;padding:18px 20px;display:flex;align-items:center;gap:16px;border-radius:18px;background:var(--code);border:1px solid var(--line);}
.author{box-sizing:border-box;}.author>*{flex:none;}
.author .an-face img{display:block;width:56px;height:56px;border-radius:50%;border:2px solid var(--accent);}
.author .an-text{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px;}
.author .an-text b{font-size:15px;}.author .an-text small{font-size:13px;line-height:1.6;color:var(--muted);}
.author .an-note{color:var(--ink)!important;}
.author .an-go{margin:0;white-space:nowrap;}
@media (max-width:760px){.author{margin:40px 16px 0;}}@media (max-width:600px){.author{flex-wrap:wrap;padding:16px;}.author .an-text{flex-basis:calc(100% - 72px);}.author .an-go{flex:1 1 100%;justify-content:center;text-align:center;}}
footer{max-width:760px;margin:0 auto;padding:26px 20px 50px;border-top:1px solid var(--line);font-size:14px;color:var(--muted);}
"""
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500'
         '&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap">')


AUTHOR_UI = {
    "en": {"by": "Made by Niansia", "who": "M.S. student in computer science at NYCU, working on AI security, computer vision and vision-language models.",
           "go": "Visit niansia.com", "home": "Back to Niansia's website"},
    "zh-TW": {"by": "由 Niansia 製作", "who": "陽明交大資工碩士生，研究 AI 安全、電腦視覺與視覺語言模型。",
              "go": "前往 niansia.com", "home": "回到 Niansia 的個人網站"},
}
AUTHOR_UI["zh-CN"] = {k: T2S.convert(v) for k, v in AUTHOR_UI["zh-TW"].items()}


def author_card(loc: str, note: str = "") -> str:
    """Who made this page, with a way back to the main site; shown above the footer of every static page but the brief."""
    A = AUTHOR_UI[loc]
    extra = f'<small class="an-note">{e(note)}</small>' if note else ""
    return (f'<aside class="author" aria-label="{e(A["by"])}"><a class="an-face" href="{HOME[loc]}" tabindex="-1" aria-hidden="true" data-nz-title="Niansia">'
            f'<img src="/assets/icons/author.webp" alt="" width="56" height="56" loading="lazy"></a>'
            f'<div class="an-text"><b>{e(A["by"])}</b><small>{e(A["who"])}</small>{extra}</div>'
            f'<a class="btn primary an-go" href="{HOME[loc]}" data-nz-title="Niansia">{e(A["go"])} →</a></aside>')


def shell(*, loc: str, title: str, desc: str, url: str, og: str, alternates: dict, body: str, jsonld: dict | None = None,
          crumbs: str = "", og_type: str = "article", noindex: bool = False, extra_css: str = "", scripts: tuple = (), top_extra: str = "",
          head_extra: str = "", author: bool = True, author_note: str = "") -> str:
    alt = "".join(f'<link rel="alternate" hreflang="{HTML_LANG[l].split("-")[0] if l == "en" else ("zh-Hant-TW" if l == "zh-TW" else "zh-Hans-CN")}" href="{SITE}{u}">'
                  for l, u in alternates.items())
    if "en" in alternates:
        alt += f'<link rel="alternate" hreflang="x-default" href="{SITE}{alternates["en"]}">'
    short, cur = {"en": "EN", "zh-TW": "繁", "zh-CN": "简"}, ' aria-current="page"'
    langs = "".join(f'<a href="{u}"{cur if l == loc else ""} hreflang="{HTML_LANG[l]}">{short[l]}</a>' for l, u in alternates.items())
    ld = f'<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>' if jsonld else ""
    return f"""<!doctype html>
<html lang="{HTML_LANG[loc]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{SITE}{url}">
{alt}
<meta property="og:type" content="{og_type}"><meta property="og:site_name" content="Niansia">
<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{SITE}{url}"><meta property="og:image" content="{SITE}{og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="{loc.replace('-', '_')}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{SITE}{og}">
{'<meta name="robots" content="noindex,follow">' if noindex else ''}
<meta name="theme-color" content="#fbf6ee" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#15142a" media="(prefers-color-scheme: dark)">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
<script src="/assets/js/page-transition.js?v=3"></script>
{FONTS}
<style>{CSS}{extra_css}</style>
{head_extra}{ld}
<script defer src="/assets/js/site-stats.js?v=2"></script>
<script defer src="/assets/js/lightbox.js"></script>
{"".join(f'<script defer src="{x}"></script>' for x in scripts)}
</head>
<body>
<header class="top"><a class="me" href="{HOME[loc]}" title="{e(AUTHOR_UI[loc]["home"])}" data-nz-title="Niansia"><img src="/assets/icons/author.webp" alt="" width="24" height="24"><b>~/niansia</b></a>{crumbs}<span class="sp"></span><span class="langs">{langs}</span>{top_extra}</header>
{body}
{author_card(loc, author_note) if author else ""}
<footer>{e(UI[loc]['contact'])} <a href="mailto:{EMAIL}">{EMAIL}</a> · <a href="{HOME[loc]}">{HOST}</a> · <a href="https://github.com/niansia">github.com/niansia</a><span class="stats" data-stats hidden> · <i class="live-dot"></i> <b data-stat="online">–</b> {e(UI[loc]['online'])} · <b data-stat="total">–</b> {e(UI[loc]['visits'])}</span></footer>
</body>
</html>
"""


PERSON = {"@type": "Person", "name": "Niansia", "url": f"{SITE}/", "email": f"mailto:{EMAIL}", "sameAs": ["https://github.com/niansia"]}


# ------------------------------------------------------------------------------------------------ notes
def build_notes(notes: dict) -> list[str]:
    urls = []
    md = lambda t: render_markdown(t, src_dir=ROOT / "notes_src", media_dir=MEDIA, md=MD)[0]
    for seg, loc in LANGS.items():
        cards = []
        for slug, by in notes.items():
            n = by[loc]
            url = f"/notes/{seg}/{slug}/"
            alts = {l: f"/notes/{s}/{slug}/" for s, l in LANGS.items()}
            mins = read_minutes(n["body"], loc)
            others = "".join(f'<a class="card" href="/notes/{seg}/{s}/"><b>{e(b[loc]["title"])}</b><small>{e(b[loc]["description"])}</small></a>'
                             for s, b in notes.items() if s != slug)
            body = (f'<main><p class="kicker">{e(UI[loc]["notes"])}</p><h1>{e(n["title"])}</h1><p class="lede">{e(n["description"])}</p>'
                    f'<div class="meta"><time datetime="{n["date"]}">{n["date"]}</time><span>{mins} {e(UI[loc]["min"])}</span>'
                    + "".join(f'<span class="tag">{e(t)}</span>' for t in n.get("tags", [])) +
                    f'</div><article>{md(n["body"])}</article>'
                    f'<h2 style="margin-top:48px">{e(UI[loc]["more"])}</h2>{others}'
                    f'<div class="btns"><a class="btn" href="/notes/{seg}/">{e(UI[loc]["notes"])}</a><a class="btn primary" href="{HOME[loc]}#research">{e(UI[loc]["back"])}</a></div></main>')
            ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": n["title"], "description": n["description"],
                  "datePublished": n["date"], "dateModified": n["date"], "inLanguage": HTML_LANG[loc], "author": PERSON,
                  "mainEntityOfPage": f"{SITE}{url}", "image": f"{SITE}/assets/og/note-{slug}-{seg}.jpg", "keywords": ", ".join(n.get("tags", []))}
            crumbs = f' / <a href="/notes/{seg}/">notes</a>'
            out = ROOT / "notes" / seg / slug / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(shell(loc=loc, title=f'{n["title"]} · Niansia', desc=n["description"], url=url, og=f"/assets/og/note-{slug}-{seg}.jpg",
                                 alternates=alts, body=body, jsonld=ld, crumbs=crumbs), encoding="utf-8")
            urls.append(url)
            cards.append(f'<a class="card" href="{url}"><b>{e(n["title"])}</b><small>{e(n["description"])}</small><i>{n["date"]} · {mins} {e(UI[loc]["min"])}</i></a>')
        idx = f'<main><p class="kicker">~/niansia/notes</p><h1>{e(UI[loc]["notes"])}</h1><p class="lede">{e(UI[loc]["notes_lede"])}</p>{"".join(cards)}' \
              f'<div class="btns"><a class="btn primary" href="{HOME[loc]}#research">{e(UI[loc]["back"])}</a></div></main>'
        ld = {"@context": "https://schema.org", "@type": "Blog", "name": f'Niansia · {UI[loc]["notes"]}', "url": f"{SITE}/notes/{seg}/", "author": PERSON, "inLanguage": HTML_LANG[loc]}
        (ROOT / "notes" / seg).mkdir(parents=True, exist_ok=True)
        (ROOT / "notes" / seg / "index.html").write_text(shell(loc=loc, title=f'{UI[loc]["notes"]} · Niansia', desc=UI[loc]["notes_lede"], url=f"/notes/{seg}/",
                                                           og=f"/assets/og/notes-{seg}.jpg", alternates={l: f"/notes/{s}/" for s, l in LANGS.items()},
                                                           body=idx, jsonld=ld, crumbs=' / notes', og_type="website"), encoding="utf-8")
        urls.append(f"/notes/{seg}/")
    (ROOT / "notes" / "index.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8"><title>Research notes · Niansia</title><link rel="canonical" href="' + SITE + '/notes/en/">'
        '<meta name="robots" content="noindex,follow"><script>var l=(navigator.language||"").toLowerCase();'
        'location.replace("/notes/"+(/^zh-(cn|sg)/.test(l)?"zh-cn":/^zh/.test(l)?"zh-tw":"en")+"/");</script></head>'
        '<body><a href="/notes/en/">English</a> · <a href="/notes/zh-tw/">繁體中文</a> · <a href="/notes/zh-cn/">简体中文</a></body></html>', encoding="utf-8")
    data = {loc: [{"slug": s, "title": b[loc]["title"], "description": b[loc]["description"], "date": b[loc]["date"],
                   "minutes": read_minutes(b[loc]["body"], loc), "url": f"/notes/{seg}/{s}/"} for s, b in notes.items()] for seg, loc in LANGS.items()}
    (ROOT / "assets/js/notes-data.js").write_text("window.NIANSIA_NOTES = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return urls



# ------------------------------------------------------------------------------------------------ research log
def load_log() -> dict:
    entries = {}
    for f in sorted((ROOT / "log_src").glob("*.md")):
        slug, lang = f.stem.rsplit(".", 1)
        entries.setdefault(slug, {})[lang] = parse_note(f)
    for slug, by in entries.items():
        tw = by["zh-TW"]
        by["zh-CN"] = {k: (s_fix(v) if isinstance(v, str) else [s_fix(x) for x in v] if isinstance(v, list) else v) for k, v in tw.items()}
        by["zh-CN"]["body"] = s_fix(tw["body"]).replace("/zh-tw/", "/zh-cn/").replace("lang=zh-TW", "lang=zh-CN")
    return dict(sorted(entries.items(), key=lambda kv: kv[0], reverse=True))


def build_log(entries: dict) -> tuple[list[str], dict]:
    urls, data = [], {}
    for seg, loc in LANGS.items():
        items, data[loc] = [], []
        for slug, by in entries.items():
            n = by[loc]
            body, figs = render_markdown(n["body"], src_dir=ROOT / "log_src", media_dir=MEDIA, md=MD)
            tags = "".join(f'<span class="tag">{e(t)}</span>' for t in n.get("tags", []))
            items.append(f'<section class="log-entry" id="{e(slug)}"><time datetime="{n["date"]}">{n["date"]}</time>'
                         f'<h2><a href="#{e(slug)}">{e(n["title"])}</a></h2><div class="meta" style="border:0;padding:0;margin:0 0 6px">{tags}</div><article>{body}</article></section>')
            data[loc].append({"slug": slug, "title": n["title"], "date": n["date"], "url": f"/log/{seg}/#{slug}",
                              "thumb": f'/assets/media/{figs[0]["name"]}-t.webp' if figs else "", "alt": figs[0]["alt"] if figs else ""})
        page = (f'<main><p class="kicker">~/niansia/log</p><h1>{e(UI[loc]["log"])}</h1><p class="lede">{e(UI[loc]["log_lede"])}</p>{"".join(items)}'
                f'<div class="btns"><a class="btn" href="/notes/{seg}/">{e(UI[loc]["notes"])}</a><a class="btn primary" href="{HOME[loc]}#research">{e(UI[loc]["back"])}</a></div></main>')
        ld = {"@context": "https://schema.org", "@type": "Blog", "name": f'Niansia · {UI[loc]["log"]}', "url": f"{SITE}/log/{seg}/", "author": PERSON, "inLanguage": HTML_LANG[loc]}
        out = ROOT / "log" / seg / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(loc=loc, title=f'{UI[loc]["log"]} · Niansia', desc=UI[loc]["log_lede"], url=f"/log/{seg}/", og=f"/assets/og/log-{seg}.jpg",
                             alternates={l: f"/log/{s}/" for s, l in LANGS.items()}, body=page, jsonld=ld, crumbs=" / log", og_type="website"), encoding="utf-8")
        urls.append(f"/log/{seg}/")
    return urls, data


# ------------------------------------------------------------------------------------------------ research statement
def build_statement() -> tuple[list[str], dict]:
    by = {"en": parse_note(ROOT / "statement_src" / "statement.en.md"), "zh-TW": parse_note(ROOT / "statement_src" / "statement.zh-TW.md")}
    tw = by["zh-TW"]
    by["zh-CN"] = {k: (s_fix(v) if isinstance(v, str) else v) for k, v in tw.items()}
    by["zh-CN"]["body"] = s_fix(tw["body"]).replace("/zh-tw/", "/zh-cn/")
    urls, data = [], {}
    for seg, loc in LANGS.items():
        n = by[loc]
        body, _ = render_markdown(n["body"], src_dir=ROOT / "statement_src", media_dir=MEDIA, md=MD)
        page = (f'<main><p class="kicker">~/niansia/statement</p><h1>{e(n["title"])}</h1><p class="lede">{e(n["description"])}</p>'
                f'<div class="meta"><time datetime="{n["date"]}">{n["date"]}</time></div><article>{body}</article>'
                f'<div class="btns"><a class="btn primary" href="mailto:{EMAIL}">{EMAIL}</a><a class="btn" href="/notes/{seg}/">{e(UI[loc]["notes"])}</a>'
                f'<a class="btn" href="{HOME[loc]}#research">{e(UI[loc]["back"])}</a></div></main>')
        ld = {"@context": "https://schema.org", "@type": "AboutPage", "name": n["title"], "description": n["description"], "url": f"{SITE}/statement/{seg}/",
              "inLanguage": HTML_LANG[loc], "about": PERSON, "dateModified": n["date"]}
        out = ROOT / "statement" / seg / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(loc=loc, title=f'{n["title"]} · Niansia', desc=n["description"], url=f"/statement/{seg}/", og=f"/assets/og/statement-{seg}.jpg",
                             alternates={l: f"/statement/{s}/" for s, l in LANGS.items()}, body=page, jsonld=ld, crumbs=" / statement", og_type="profile"), encoding="utf-8")
        urls.append(f"/statement/{seg}/")
        data[loc] = {"title": n["title"], "description": n["description"], "url": f"/statement/{seg}/"}
    return urls, data


# ------------------------------------------------------------------------------------------------ blog
# blog_src/<date>-<slug>.<lang>.md with `type:` now (monthly update) | paper (reading note) | post | qa (an answered question).
# zh-TW is required; en is optional (English pages link to the Chinese post when there is no translation); zh-CN is converted.
# blog_src/blog.json: {"ask": "<anonymous question box URL, e.g. Peing>"}.
BLOG_TYPES = ("now", "paper", "post", "qa")
BLOG_UI = {
    "en": {"blog": "Blog", "lede": "Monthly updates, notes on the papers I read and what I make of them, and answers to your questions.",
           "types": {"now": "Now", "paper": "Paper note", "post": "Post", "qa": "Q&A"}, "more": "More posts", "all": "All posts",
           "qa_title": "Questions & answers", "qa_lede": "Questions sent anonymously, answered here.", "ask": "Ask anonymously",
           "ask_soon": "The question box opens soon", "rss": "RSS", "depth": {"deep": "Read closely", "skim": "Skimmed"},
           "link": "Paper", "code": "Code", "zh": "In Chinese", "q": "Q", "a": "A", "none_qa": "No answered questions yet."},
    "zh-TW": {"blog": "Blog", "lede": "每月近況、讀過的論文和我的看法，以及大家問的問題。",
              "types": {"now": "近況", "paper": "論文筆記", "post": "隨筆", "qa": "Q&A"}, "more": "其他文章", "all": "全部文章",
              "qa_title": "Q&A", "qa_lede": "匿名提問，在這裡回答。", "ask": "匿名提問",
              "ask_soon": "提問箱即將開放", "rss": "RSS", "depth": {"deep": "精讀", "skim": "略讀"},
              "link": "論文", "code": "程式碼", "zh": "中文", "q": "問", "a": "答", "none_qa": "還沒有回答過的問題。"},
}
BLOG_UI["zh-CN"] = {k: (T2S.convert(v) if isinstance(v, str) else {a: T2S.convert(b) for a, b in v.items()}) for k, v in BLOG_UI["zh-TW"].items()}
BLOG_CSS = """
.paper-box{margin:0 0 26px;padding:18px 20px;border-radius:16px;background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--accent2);}
.paper-box .pv{font:600 12px 'JetBrains Mono',monospace;color:var(--accent2);letter-spacing:.04em;margin:0 0 6px;}
.paper-box b{display:block;font-size:17px;line-height:1.45;}
.paper-box .pa{margin:6px 0 0;font-size:13.5px;color:var(--muted);line-height:1.6;}
.paper-box .pl{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.paper-box .pl a{font:600 12.5px 'JetBrains Mono',monospace;padding:5px 12px;border-radius:99px;border:1px solid var(--line);text-decoration:none;}
.paper-box .pl a:hover{border-color:var(--accent);}
.type{display:inline-block;padding:2px 9px;border-radius:99px;background:var(--accent);color:#fff;font:600 11.5px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;}
.type.paper{background:var(--accent2);}.type.qa{background:#3f9f86;}.type.post{background:var(--muted);}
.card .type{margin-bottom:8px;}.card .zh{margin-left:8px;font:500 11.5px 'JetBrains Mono',monospace;color:var(--muted);}
.now-card{border-left:4px solid var(--accent);}
.qa{padding:20px 0;border-bottom:1px solid var(--line);}
.qa .qq{display:flex;gap:12px;font-weight:700;font-size:17px;line-height:1.55;margin:0 0 8px;}
.qa .qq span,.qa .qa-a>span{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:var(--code);color:var(--accent);font-size:13px;}
.qa .qa-a{display:flex;gap:12px;}.qa .qa-a>span{background:var(--accent);color:#fff;}.qa .qa-a article>:first-child{margin-top:0;}
.qa time{display:block;margin:6px 0 0 40px;font:500 12px 'JetBrains Mono',monospace;color:var(--muted);}
.ask{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:18px 0 8px;padding:16px 18px;border-radius:16px;background:var(--code);}
.ask b{display:block;font-size:15.5px;}.ask small{display:block;color:var(--muted);font-size:13px;}
.ask .btn{flex:none;margin:0;}.ask .btn[aria-disabled]{opacity:.55;pointer-events:none;}
"""


def load_blog() -> tuple[dict, dict]:
    posts = {}
    for f in sorted((ROOT / "blog_src").glob("*.md")):
        slug, lang = f.stem.rsplit(".", 1)
        info = parse_note(f)
        info.setdefault("type", "post")
        if info["type"] not in BLOG_TYPES:
            sys.exit(f"{f.name}: type must be one of {', '.join(BLOG_TYPES)}")
        if str(info.get("draft", "")).lower() == "true":
            continue
        posts.setdefault(slug, {})[lang] = info
    for slug, by in posts.items():
        if "zh-TW" not in by:
            sys.exit(f"blog_src/{slug}: a zh-TW version is required")
        tw = by["zh-TW"]
        by["zh-CN"] = {k: (s_fix(v) if isinstance(v, str) else [s_fix(x) for x in v] if isinstance(v, list) else v) for k, v in tw.items()}
        by["zh-CN"]["body"] = s_fix(tw["body"]).replace("/zh-tw/", "/zh-cn/").replace("lang=zh-TW", "lang=zh-CN")
        for k in ("paper", "authors", "venue", "link", "code"):   # the paper itself is not translated
            if k in tw:
                by["zh-CN"][k] = tw[k]
    cfg_file = ROOT / "blog_src" / "blog.json"
    cfg = json.loads(cfg_file.read_text(encoding="utf-8")) if cfg_file.exists() else {}
    ask = cfg.get("ask", "")
    if ask and not re.match(r"^https://[\w.-]+/", ask):
        sys.exit("blog_src/blog.json: ask must be an https:// URL")
    return dict(sorted(posts.items(), key=lambda kv: (kv[1]["zh-TW"]["date"], kv[0]), reverse=True)), {"ask": ask}


def blog_version(by: dict, loc: str) -> tuple[dict, str]:
    """The post as shown to readers of `loc`, and the locale it is actually written in (English falls back to zh-TW)."""
    return (by[loc], loc) if loc in by else (by["zh-TW"], "zh-TW")


BLOG_SEG = {l: s for s, l in LANGS.items()}   # zh-TW -> zh-tw: blog URLs always carry the language (as notes do)


def blog_url(slug: str, loc: str) -> str:
    return f"/blog/{BLOG_SEG[loc]}/{slug}/"


def build_blog(posts: dict, cfg: dict) -> tuple[list[str], dict]:
    from email.utils import format_datetime
    from datetime import datetime, timezone
    urls, data = [], {}
    md = lambda t: render_markdown(t, src_dir=ROOT / "blog_src", media_dir=MEDIA, md=MD)[0]
    rss_link = lambda seg: f'<link rel="alternate" type="application/rss+xml" title="Niansia · Blog" href="/blog/{seg}/feed.xml">'
    for seg, loc in LANGS.items():
        U, cards, qas, feed, data[loc] = BLOG_UI[loc], [], [], [], []
        ask_btn = (f'<a class="btn primary" href="{e(cfg["ask"])}" target="_blank" rel="noopener noreferrer">{e(U["ask"])} ↗</a>' if cfg["ask"]
                   else f'<span class="btn" aria-disabled="true">{e(U["ask_soon"])}</span>')
        ask_box = f'<div class="ask"><div><b>{e(U["qa_title"])}</b><small>{e(U["qa_lede"])}</small></div>{ask_btn}</div>'
        for slug, by in posts.items():
            n, wrote = blog_version(by, loc)
            kind, mins = n["type"], read_minutes(n["body"], wrote)
            zh = f'<span class="zh">{e(U["zh"])}</span>' if wrote != loc else ""
            entry = {"slug": slug, "type": kind, "title": n["title"], "description": n.get("description", ""), "date": n["date"], "minutes": mins,
                     "tags": n.get("tags", []), "lang": wrote}
            if kind == "paper":
                entry.update({k: n.get(k, "") for k in ("paper", "venue", "depth")})
            if kind == "now":   # each section's bullets (their bold lead), shown on the terminal's now card
                groups = []
                for line in n["body"].splitlines():
                    if line.startswith("## "):
                        groups.append({"title": line[3:].strip(), "items": []})
                    elif groups and (m := re.match(r"^\s*[-*]\s+\*\*(.+?)\*\*", line)):
                        groups[-1]["items"].append(m.group(1))
                entry["groups"] = [g for g in groups if g["items"]][:2]
            if kind == "qa":
                entry["url"] = f"/blog/{seg}/qa/#{slug}"
                qas.append(f'<section class="qa" id="{e(slug)}"><p class="qq"><span>{e(U["q"])}</span>{e(n["title"])}</p>'
                           f'<div class="qa-a"><span>{e(U["a"])}</span><article lang="{HTML_LANG[wrote]}">{md(n["body"])}</article></div><time datetime="{n["date"]}">{n["date"]}</time></section>')
                data[loc].append(entry)
                feed.append((n, f"{SITE}/blog/{seg}/qa/#{slug}"))
                continue
            url = blog_url(slug, wrote)
            entry["url"] = url
            data[loc].append(entry)
            feed.append((n, SITE + url))
            cards.append(f'<a class="card{" now-card" if kind == "now" else ""}" href="{url}"><span class="type {kind}">{e(U["types"][kind])}</span>{zh}'
                         f'<b>{e(n["title"])}</b><small>{e(n.get("description", ""))}</small><i>{n["date"]} · {mins} {e(UI[loc]["min"])}</i></a>')
            if wrote != loc:
                continue   # no English page for a post written only in Chinese
            alts = {l: blog_url(slug, l) for s, l in LANGS.items() if l in by}
            box = ""
            if kind == "paper":
                depth = U["depth"].get(n.get("depth", ""), "")
                links = "".join(f'<a href="{e(n[k])}" target="_blank" rel="noopener noreferrer">{e(U[k])} ↗</a>' for k in ("link", "code") if n.get(k))
                venue = " · ".join(x for x in (n.get("venue", ""), depth) if x)
                authors = f'<p class="pa" lang="en">{e(n["authors"])}</p>' if n.get("authors") else ""
                links = f'<div class="pl">{links}</div>' if links else ""
                box = f'<aside class="paper-box"><p class="pv">{e(venue)}</p><b lang="en">{e(n.get("paper", ""))}</b>{authors}{links}</aside>'
            others = "".join(f'<a class="card" href="{blog_url(s, blog_version(b, loc)[1])}"><span class="type {b["zh-TW"]["type"]}">{e(U["types"][b["zh-TW"]["type"]])}</span>'
                             f'<b>{e(blog_version(b, loc)[0]["title"])}</b><small>{e(blog_version(b, loc)[0].get("description", ""))}</small></a>'
                             for s, b in list((s, b) for s, b in posts.items() if s != slug and b["zh-TW"]["type"] != "qa")[:3])
            lede = f'<p class="lede">{e(n["description"])}</p>' if n.get("description") else ""
            body = (f'<main><p class="kicker">{e(U["types"][kind])}</p><h1>{e(n["title"])}</h1>'
                    f'{lede}'
                    f'<div class="meta"><time datetime="{n["date"]}">{n["date"]}</time><span>{mins} {e(UI[loc]["min"])}</span>'
                    + "".join(f'<span class="tag">{e(t)}</span>' for t in n.get("tags", [])) +
                    f'</div>{box}<article>{md(n["body"])}</article>{ask_box}'
                    + (f'<h2 style="margin-top:48px">{e(U["more"])}</h2>{others}' if others else "") +
                    f'<div class="btns"><a class="btn" href="/blog/{seg}/">{e(U["all"])}</a><a class="btn primary" href="{HOME[loc]}#blog">{e(UI[loc]["back"])}</a></div></main>')
            ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": n["title"], "description": n.get("description", ""),
                  "datePublished": n["date"], "dateModified": n["date"], "inLanguage": HTML_LANG[loc], "author": PERSON,
                  "mainEntityOfPage": f"{SITE}{url}", "keywords": ", ".join(n.get("tags", []))}
            if kind == "paper" and n.get("link"):
                ld["citation"] = {"@type": "ScholarlyArticle", "name": n.get("paper", ""), "url": n["link"]}
            out = ROOT / url.strip("/") / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            og = f"/assets/og/blog-{slug}-{seg}.jpg"
            out.write_text(shell(loc=loc, title=f'{n["title"]} · Niansia', desc=n.get("description", "") or U["lede"], url=url,
                                 og=og if (ROOT / og.lstrip("/")).exists() else f"/assets/og/blog-{seg}.jpg", alternates=alts, body=body, jsonld=ld,
                                 crumbs=f' / <a href="/blog/{seg}/">blog</a>', extra_css=BLOG_CSS, head_extra=rss_link(seg)), encoding="utf-8")
            urls.append(url)
        # Q&A page
        qa_body = (f'<main><p class="kicker">~/niansia/blog/qa</p><h1>{e(U["qa_title"])}</h1><p class="lede">{e(U["qa_lede"])}</p>{ask_box}'
                   f'{"".join(qas) or "<p class=note>" + e(U["none_qa"]) + "</p>"}'
                   f'<div class="btns"><a class="btn" href="/blog/{seg}/">{e(U["all"])}</a><a class="btn primary" href="{HOME[loc]}#blog">{e(UI[loc]["back"])}</a></div></main>')
        (ROOT / "blog" / seg / "qa").mkdir(parents=True, exist_ok=True)
        (ROOT / "blog" / seg / "qa" / "index.html").write_text(shell(
            loc=loc, title=f'{U["qa_title"]} · Niansia', desc=U["qa_lede"], url=f"/blog/{seg}/qa/", og=f"/assets/og/blog-{seg}.jpg",
            alternates={l: f"/blog/{s}/qa/" for s, l in LANGS.items()}, body=qa_body, crumbs=f' / <a href="/blog/{seg}/">blog</a> / qa',
            og_type="website", extra_css=BLOG_CSS, head_extra=rss_link(seg), noindex=not qas), encoding="utf-8")
        if qas:
            urls.append(f"/blog/{seg}/qa/")
        # index
        idx = (f'<main><p class="kicker">~/niansia/blog</p><h1>{e(U["blog"])}</h1><p class="lede">{e(U["lede"])}</p>{"".join(cards)}{ask_box}'
               f'<div class="btns"><a class="btn" href="/blog/{seg}/feed.xml">{e(U["rss"])}</a><a class="btn" href="/blog/{seg}/qa/">{e(U["qa_title"])}</a>'
               f'<a class="btn primary" href="{HOME[loc]}#blog">{e(UI[loc]["back"])}</a></div></main>')
        ld = {"@context": "https://schema.org", "@type": "Blog", "name": f'Niansia · {U["blog"]}', "url": f"{SITE}/blog/{seg}/", "author": PERSON, "inLanguage": HTML_LANG[loc]}
        (ROOT / "blog" / seg / "index.html").write_text(shell(
            loc=loc, title=f'{U["blog"]} · Niansia', desc=U["lede"], url=f"/blog/{seg}/", og=f"/assets/og/blog-{seg}.jpg",
            alternates={l: f"/blog/{s}/" for s, l in LANGS.items()}, body=idx, jsonld=ld, crumbs=" / blog", og_type="website",
            extra_css=BLOG_CSS, head_extra=rss_link(seg)), encoding="utf-8")
        urls.append(f"/blog/{seg}/")
        # RSS 2.0
        stamp = lambda d: format_datetime(datetime.fromisoformat(d).replace(hour=12, tzinfo=timezone.utc))
        items = "".join(f'<item><title>{e(n["title"])}</title><link>{e(link)}</link><guid>{e(link)}</guid><pubDate>{stamp(n["date"])}</pubDate>'
                        f'<description>{e(n.get("description", ""))}</description></item>' for n, link in feed[:30])
        (ROOT / "blog" / seg / "feed.xml").write_text(
            f'<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Niansia · {e(U["blog"])}</title><link>{SITE}/blog/{seg}/</link>'
            f'<description>{e(U["lede"])}</description><language>{HTML_LANG[loc]}</language>{items}</channel></rss>\n', encoding="utf-8")
    (ROOT / "blog" / "index.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8"><title>Blog · Niansia</title><link rel="canonical" href="' + SITE + '/blog/en/">'
        '<meta name="robots" content="noindex,follow"><script>var l=(navigator.language||"").toLowerCase();'
        'location.replace("/blog/"+(/^zh-(cn|sg)/.test(l)?"zh-cn":/^zh/.test(l)?"zh-tw":"en")+"/");</script></head>'
        '<body><a href="/blog/en/">English</a> · <a href="/blog/zh-tw/">繁體中文</a> · <a href="/blog/zh-cn/">简体中文</a></body></html>', encoding="utf-8")
    js = {"ask": cfg["ask"], "posts": data}
    (ROOT / "assets/js/blog-data.js").write_text("window.NIANSIA_BLOG = " + json.dumps(js, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return urls, data


# ------------------------------------------------------------------------------------------------ Taiwan Exam gallery
# Shared mock exams, published by tools/exam_gallery.py. The page has no script; every value from the manifest is
# validated here again and escaped, downloads point at huggingface.co, and previews are images this site rendered itself.
EXAM_SUBJECTS = {"chinese": "國綜", "writing": "國寫", "english": "英文", "math-a": "數 A", "math-b": "數 B", "social": "社會", "science": "自然"}
EXAM_AIS = ("ChatGPT", "Claude", "Gemini", "其他")
# other ways people write each subject, so the gallery search finds "數學" or "國文" too
EXAM_ALIASES = {"chinese": "國文 國語文 國語文綜合能力", "writing": "國文 國語文寫作 作文 寫作", "english": "英語 English",
                "math-a": "數學 數學A 數甲 math", "math-b": "數學 數學B 數乙 math", "social": "社會科 公民 歷史 地理", "science": "自然科 物理 化學 生物 地科"}
EXAM_UI = {
    "zh-TW": {"title": "Taiwan Exam 考卷分享區", "lede": "用 Taiwan Exam 讓 AI 出的原創學測模擬考，大家一人分享一份；沒有付費 AI 的同學也能下載來練習。",
              "upload": "分享你生成的考卷", "upload_sub": "需要用 Google 帳號登入；我檢查過檔案與內容之後才會公開。", "upload_btn": "上傳考卷",
              "upload_soon": "上傳表單即將開放", "rules": "上傳須知", "community": "學測生社群", "community_sub": "我是這兩個 LINE 社群的管理員，合計 {total}+ 位成員。準備 116 學測、分科的同學歡迎加入，一起討論考試資訊和模擬考題目。", "join": "加入社群",
              "rule": ["只接受用 Taiwan Exam 讓 AI 生成的原創考卷（PDF）。",
                       "不要上傳大考中心的歷屆試題，也不要上傳補習班、出版社的講義或題本。",
                       "考卷裡不要有姓名、學校、班級、座號等個人資料。",
                       "送出即同意以 CC BY-NC 4.0 授權公開：可以分享、改作，要標示來源，不能用於商業用途。",
                       "每份檔案都會先掃毒、移除連結與隱藏內容、檢查個資；不符合的會直接刪除，公開後也可能下架。"],
              "warn": "題目和詳解都是 AI 生成的，可能有錯；請搭配課本和老師的說明使用。發現錯誤、侵權或個資，請按每份考卷下方的「回報問題」來信告訴我。",
              "all": "全部", "all_subjects": "全部科目", "all_ai": "全部 AI", "search": "搜尋考卷：科目、AI、日期或編號", "search_ph": "搜尋考卷…", "sort": "排序", "sort_new": "最新在前", "sort_old": "最早在前", "shown": "顯示 {n} / {t} 份", "nomatch": "找不到符合的考卷。", "reset": "清除篩選", "subject_nav": "依科目篩選", "ai_nav": "依 AI 篩選", "none": "還沒有人分享考卷，歡迎當第一個！", "none_subject": "這一科還沒有考卷。", "q": "題本", "s": "詳解",
              "pages": "頁", "by": "分享者", "preview": "預覽", "download": "下載", "folder": "開啟資料夾", "set": "第 {n} 份", "report": "回報問題", "sha": "檔案校驗碼（SHA-256）", "dataset": "所有檔案都放在 Hugging Face 資料集",
              "license": "授權：CC BY-NC 4.0", "count": "共 {n} 份", "back": "Taiwan Exam 作品頁", "te": "Taiwan Exam 原始碼", "author_note": "若對作者的作品與研究有興趣，歡迎到個人網站逛逛。",
              "report_subject": "[考卷回報] {id}", "report_body": "考卷編號：{id}\n問題類型（侵權／個資／答案錯誤／其他）：\n說明："},
}
EXAM_UI["zh-CN"] = {k: (T2S.convert(v) if isinstance(v, str) else [T2S.convert(x) for x in v]) for k, v in EXAM_UI["zh-TW"].items()}
EXAM_CSS = """
.upload{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:22px 0 14px;padding:16px 18px;border-radius:16px;background:var(--code);}
.upload b{display:block;font-size:15.5px;}.upload small{display:block;color:var(--muted);font-size:13px;}
.upload .btn{flex:none;margin:0;}.upload .btn[aria-disabled]{opacity:.55;pointer-events:none;}
.community{margin:0 0 18px;padding:16px 18px;border-radius:16px;border:1px solid var(--line);}
.community>b{display:block;font-size:15.5px;}.community>small{display:block;margin-top:2px;color:var(--muted);font-size:13px;line-height:1.6;}
.cm-list{display:grid;gap:12px;margin-top:12px;}
.cm{display:flex;align-items:center;gap:13px;padding:14px 14px 12px;border-radius:16px;text-decoration:none;color:var(--ink);
  background:color-mix(in srgb,#06c755 9%,var(--paper));border:1.5px solid color-mix(in srgb,#06c755 42%,transparent);transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .2s;}
.cm:hover,.cm:focus-visible{transform:translateY(-3px);border-color:#06c755;box-shadow:0 14px 28px -16px #06c755;}
.cm-ico{position:relative;flex:none;width:50px;height:50px;border-radius:50%;padding:2px;background:linear-gradient(140deg,#06c755,#7be3a6);box-shadow:0 6px 14px -8px #06c755;}
.cm-ico img{display:block;width:100%;height:100%;border-radius:50%;border:2px solid var(--paper);object-fit:cover;background:#ecfaf1;}
.cm-ico svg{position:absolute;right:-3px;bottom:-3px;width:20px;height:20px;border-radius:50%;box-shadow:0 0 0 2px var(--paper);}
.cm:hover .cm-ico,.cm:focus-visible .cm-ico{animation:cm-hop .6s cubic-bezier(.34,1.56,.64,1);}
@keyframes cm-hop{30%{transform:translateY(-4px) rotate(-6deg);}65%{transform:translateY(0) rotate(4deg);}}
.cm-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
.cm-text b{font-size:14.5px;line-height:1.45;}
.cm-n{align-self:flex-start;padding:1px 9px;border-radius:99px;font-size:11.5px;font-weight:700;color:#058a3e;border:1px solid color-mix(in srgb,#06c755 45%,transparent);}
@media (prefers-color-scheme:dark){.cm-n{color:#5fe39a;}}
.cm-text small{font-size:12.5px;line-height:1.55;color:var(--muted);}
.cm-side{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
.cm-role{padding:1px 9px;border-radius:99px;font:600 10.5px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;font-style:normal;color:#058a3e;background:color-mix(in srgb,#06c755 16%,transparent);}
.cm-go{padding:6px 13px;border-radius:99px;background:#058a3e;color:#fff;font-size:12.5px;font-weight:700;white-space:nowrap;}
.cm:hover .cm-go{background:#04753a;}
@media (prefers-color-scheme:dark){.cm-role{color:#5fe39a;}}
@media (prefers-reduced-motion:reduce){.cm,.cm-ico{transition:none;animation:none!important;}}
@media (max-width:560px){.cm{flex-wrap:wrap;}.cm-side{flex-direction:row;align-items:center;justify-content:space-between;flex-basis:100%;}.cm-go{padding:9px 16px;}}
.rules{margin:0 0 14px;padding:12px 18px;border:1px solid var(--line);border-radius:14px;}
.rules summary{cursor:pointer;font-weight:700;}.rules ol{margin:10px 0 2px;padding-left:22px;font-size:14px;line-height:1.75;}
.warnbox{margin:0 0 26px;padding:12px 16px;border-radius:12px;border-left:4px solid #c9853a;background:var(--paper);font-size:13.5px;line-height:1.7;}
.subjects{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px;}
.subjects a{padding:5px 13px;border-radius:99px;border:1px solid var(--line);text-decoration:none;font-size:13.5px;}
.subjects a:hover{border-color:var(--accent);}.subjects em{font-style:normal;color:var(--muted);margin-left:6px;font-size:12px;}
.subject{margin-top:34px;scroll-margin-top:16px;}
.exams{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px;margin-top:12px;}
.ex{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--paper);scroll-margin-top:16px;transition:border-color .2s;}
.ex:hover{border-color:color-mix(in srgb,var(--accent) 45%,var(--line));}
.ex .thumb{display:block;width:76px;aspect-ratio:520/740;object-fit:cover;object-position:top;border-radius:8px;border:1px solid var(--line);background:#fff;}
.ex .exb{display:flex;flex-direction:column;min-width:0;}
.ex .exh{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.ex .exh b{font-size:15.5px;line-height:1.4;}
.ex .ai{flex:none;padding:2px 9px;border-radius:99px;font:600 11.5px 'JetBrains Mono',monospace;}
.ex .ai.chatgpt{color:#0e8f6f;background:color-mix(in srgb,#10a37f 15%,transparent);}
.ex .ai.claude{color:#b85c3c;background:color-mix(in srgb,#d97757 16%,transparent);}
.ex .ai.gemini{color:#3b6fd8;background:color-mix(in srgb,#4285f4 15%,transparent);}
.ex .ai.other{color:var(--muted);background:var(--code);}
@media (prefers-color-scheme:dark){.ex .ai.chatgpt{color:#5fd4b1;}.ex .ai.claude{color:#f0a07e;}.ex .ai.gemini{color:#8ab4f8;}}
.ex .exm{margin:3px 0 8px;font:500 12px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;color:var(--muted);}
.ex .act{display:flex;align-items:center;gap:8px;padding:8px 0;border-top:1px dashed var(--line);}
.ex .act .al{flex:1;min-width:0;font-weight:600;font-size:13.5px;}
.ex .act .al small{margin-left:6px;font-weight:400;font-size:12px;color:var(--muted);}
.ex .act a{flex:none;padding:5px 12px;border-radius:9px;font-size:12.5px;font-weight:600;text-decoration:none;line-height:1.4;}
.ex .act a.pv{border:1px solid var(--line);color:var(--ink);}
.ex .act a.pv:hover{border-color:var(--accent);color:var(--accent);}
.ex .act a.dlb{background:var(--accent);color:var(--paper);border:1px solid transparent;}
.ex .act a.dlb:hover{filter:brightness(1.08);}
.ex .exf{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin-top:4px;padding-top:8px;border-top:1px dashed var(--line);font-size:12px;}
.ex .exf a{color:var(--muted);text-decoration:none;}.ex .exf a:hover{color:var(--accent);}
.ex details{flex-basis:100%;font-size:12px;color:var(--muted);}.ex details summary{cursor:pointer;width:max-content;}
.ex details code{display:block;margin-top:4px;font-size:10.5px;word-break:break-all;}
@media (max-width:520px){.exams{grid-template-columns:1fr;}.ex{grid-template-columns:60px minmax(0,1fr);gap:12px;padding:12px;}.ex .thumb{width:60px;}.ex .act a{padding:9px 14px;}.ex .exf a{padding:6px 0;}}
.fine{margin-top:34px;font-size:13px;color:var(--muted);}
.exfilter{position:sticky;top:8px;z-index:5;margin:26px 0 4px;padding:12px 14px;border:1px solid var(--line);border-radius:16px;
  background:color-mix(in srgb,var(--paper) 90%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 10px 24px -20px #000;}
.exfilter [hidden],.ex[hidden],.subject[hidden],.exf-empty[hidden]{display:none!important;}
.exf-top{display:flex;gap:10px;margin-bottom:10px;}
.exf-search{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);transition:border-color .2s;}
.exf-search:focus-within{border-color:var(--accent);}
.exf-search svg{flex:none;width:17px;height:17px;color:var(--muted);}
.exf-search input{flex:1;min-width:0;padding:9px 0;border:0;outline:0;background:transparent;color:var(--ink);font-family:inherit;font-size:14px;line-height:1.4;}
.exf-top select{flex:none;padding:0 10px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--ink);font-family:inherit;font-size:13.5px;cursor:pointer;}
.exfilter .subjects{margin:0;}
.exf-ai{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
.exf-ai button{padding:5px 13px;border-radius:99px;border:1px solid var(--line);background:none;color:var(--ink);font-family:inherit;font-size:13.5px;cursor:pointer;}
.exf-ai button em{font-style:normal;color:var(--muted);margin-left:6px;font-size:12px;}
.subjects a[aria-pressed=true],.exf-ai button[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--paper);}
.subjects a[aria-pressed=true] em,.exf-ai button[aria-pressed=true] em{color:inherit;opacity:.8;}
.exf-ai button:hover{border-color:var(--accent);}
.exf-status{margin:8px 0 0;font-size:12.5px;color:var(--muted);}
.exf-empty{margin:22px 0 0;padding:26px 16px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:var(--muted);}
.exf-empty button{margin-left:10px;padding:6px 14px;border-radius:99px;border:1px solid var(--accent);background:none;color:var(--accent);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;}
@media (max-width:520px){.exfilter{position:static;}.exf-top select{padding:9px 8px;}}
"""


def load_exams() -> dict:
    f = ROOT / "exam_src" / "gallery.json"
    data = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {"dataset": "", "form": "", "exams": []}
    if data.get("form") and not re.match(r"^https://(docs\.google\.com/forms/|forms\.gle/)[\w/?=&.-]+$", data["form"]):
        sys.exit("exam_src/gallery.json: form must be a Google Forms https:// link")
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", data.get("dataset", "")):
        sys.exit("exam_src/gallery.json: dataset must look like owner/name")
    for x in data["exams"]:   # written by tools/exam_gallery.py, checked again before anything reaches a page
        ok = (re.fullmatch(r"\d{8}-[0-9a-f]{6}", x.get("id", "")) and x.get("subject") in EXAM_SUBJECTS and x.get("ai") in EXAM_AIS
              and re.fullmatch(r"\d{4}-\d{2}-\d{2}", x.get("date", "")) and re.fullmatch(r"(\d{4}\.\d{2}\.\d{2}\.\d{1,3})?", x.get("te_version", ""))
              and len(x.get("credit", "")) <= 20 and x.get("files")
              and all(re.fullmatch(rf"exams/{re.escape(x['subject'])}/{re.escape(x['id'])}/(questions|solutions)\.pdf", fl.get("path", ""))
                      and re.fullmatch(r"[0-9a-f]{64}", fl.get("sha256", "")) and fl.get("role") in ("questions", "solutions")
                      and isinstance(fl.get("pages"), int) and isinstance(fl.get("bytes"), int) for fl in x["files"]))
        if not ok:
            sys.exit(f"exam_src/gallery.json: entry {x.get('id', '?')!r} failed validation")
    return data


LINE_BADGE = ('<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#06c755"/>'
              '<path fill="#fff" d="M12 5.6c-4 0-7.2 2.5-7.2 5.6 0 2.8 2.6 5.1 6 5.5l-.4 2.1 3-2.1c3.3-.5 5.8-2.8 5.8-5.5 0-3.1-3.2-5.6-7.2-5.6z"/></svg>')
CM_ICONS = {"gsat", "mock"}   # assets/icons/cm-<icon>.svg, the two kittens


def cm_count(g: dict) -> int:
    m = g.get("members")
    return m if isinstance(m, int) and not isinstance(m, bool) and 0 < m < 1_000_000 else 0


def community_total() -> str:
    """Members of both groups, rounded down to hundreds ('5,500'), or '' when unknown."""
    data = load_js("assets/js/community-data.js", "NIANSIA_COMMUNITY") or {}
    s = sum(cm_count(g) for g in data.get("groups", []) if re.fullmatch(r"https://line\.me/ti/g2/[A-Za-z0-9_-]{10,80}", g.get("url", "")))
    return f"{s // 100 * 100:,}" if s >= 100 else ""


def community_cards(loc: str) -> str:
    """The LINE communities Niansia runs, from assets/js/community-data.js; only LINE OpenChat invite links are shown."""
    data = load_js("assets/js/community-data.js", "NIANSIA_COMMUNITY") or {}
    role = pick(data.get("role"), loc)
    cards = []
    for g in data.get("groups", []):
        if not re.fullmatch(r"https://line\.me/ti/g2/[A-Za-z0-9_-]{10,80}", g.get("url", "")):
            continue
        icon = g.get("icon") if g.get("icon") in CM_ICONS else "gsat"
        count = (f'<span class="cm-n">{e(pick(data.get("members"), loc).replace("{n}", f"{cm_count(g):,}"))}</span>'
                 if cm_count(g) and data.get("members") else "")
        cards.append(f'<a class="cm" href="{e(g["url"])}" target="_blank" rel="noopener noreferrer"><span class="cm-ico"><img src="/assets/icons/cm-{icon}.svg" alt="" width="56" height="56" loading="lazy">{LINE_BADGE}</span>'
                     f'<span class="cm-text"><b>{e(g["name"])}</b>{count}<small>{e(pick(g.get("desc"), loc))}</small></span>'
                     f'<span class="cm-side"><em class="cm-role">{e(role)}</em><span class="cm-go">{e(EXAM_UI[loc]["join"])} ↗</span></span></a>')
    return "".join(cards)


def build_exams(data: dict) -> list[str]:
    from urllib.parse import quote
    urls = []
    segs = {"zh-tw": "zh-TW", "zh-cn": "zh-CN"}
    size = lambda b: f"{b / 1048576:.1f} MB" if b >= 1048576 else f"{max(1, round(b / 1024))} KB"
    for seg, loc in segs.items():
        U = EXAM_UI[loc]
        by_subject = {k: [x for x in data["exams"] if x["subject"] == k] for k in EXAM_SUBJECTS}
        up = (f'<a class="btn primary" href="{e(data["form"])}" target="_blank" rel="noopener noreferrer">{e(U["upload_btn"])} ↗</a>' if data["form"]
              else f'<span class="btn" aria-disabled="true">{e(U["upload_soon"])}</span>')
        head = (f'<main><p class="kicker">~/niansia/exams</p><h1>{e(U["title"])}</h1><p class="lede">{e(U["lede"])}</p>'
                f'<div class="upload"><div><b>{e(U["upload"])}</b><small>{e(U["upload_sub"])}</small></div>{up}</div>'
                + (f'<section class="community" aria-label="{e(U["community"])}"><b>{e(U["community"])}</b><small>{e(U["community_sub"].replace("{total}", total) if (total := community_total()) else U["community_sub"].replace("，合計 {total}+ 位成員", "").replace("，合计 {total}+ 位成员", ""))}</small>'
                   f'<div class="cm-list">{cm}</div></section>' if (cm := community_cards(loc)) else '')
                + f'<details class="rules"><summary>{e(U["rules"])}</summary><ol>{"".join(f"<li>{e(r)}</li>" for r in U["rule"])}</ol></details>'
                f'<p class="warnbox">{e(U["warn"])}</p>')
        nav = (f'<a href="#top" data-subj="" hidden>{e(U["all_subjects"])}<em>{len(data["exams"])}</em></a>'
               if data["exams"] else "") + "".join(f'<a href="#{k}" data-subj="{k}">{e(EXAM_SUBJECTS[k] if loc == "zh-TW" else T2S.convert(EXAM_SUBJECTS[k]))}<em>{len(v)}</em></a>' for k, v in by_subject.items() if v)
        sections = []
        for k, items in by_subject.items():
            if not items:
                continue
            name = EXAM_SUBJECTS[k] if loc == "zh-TW" else T2S.convert(EXAM_SUBJECTS[k])
            cards = []
            base = f'https://huggingface.co/datasets/{data["dataset"]}'
            for n, x in reversed(list(enumerate(items, 1))):   # newest first; "set n" keeps the upload order
                files = {fl["role"]: fl for fl in x["files"]}
                acts = "".join(
                    f'<div class="act"><span class="al">{e(U["q" if r == "questions" else "s"])}<small>{files[r]["pages"]} {e(U["pages"])} · {size(files[r]["bytes"])}</small></span>'
                    f'<a class="pv" href="{base}/resolve/main/{e(files[r]["path"])}" target="_blank" rel="noopener noreferrer">{e(U["preview"])}</a>'
                    f'<a class="dlb" href="{base}/resolve/main/{e(files[r]["path"])}?download=true" rel="noopener noreferrer" download>{e(U["download"])}</a></div>'
                    for r in ("questions", "solutions") if r in files)
                ai_cls = {"ChatGPT": "chatgpt", "Claude": "claude", "Gemini": "gemini"}.get(x["ai"], "other")
                meta = " · ".join(v for v in (x["date"], f'Taiwan Exam {x["te_version"]}' if x["te_version"] else "",
                                              f'{U["by"]} {x["credit"]}' if x["credit"] else "") if v)
                sha = "".join(f'<code>{e(U["q" if fl["role"] == "questions" else "s"])}  {fl["sha256"]}</code>' for fl in x["files"])
                mail = f'mailto:{EMAIL}?subject={quote(U["report_subject"].format(id=x["id"]))}&body={quote(U["report_body"].format(id=x["id"]))}'
                img = (f'<img class="thumb" src="{e(x["preview"])}" alt="" loading="lazy" width="76" height="108">'
                       if (ROOT / x["preview"].lstrip("/")).exists() else '<span class="thumb" aria-hidden="true"></span>')
                folder = f'{base}/tree/main/exams/{x["subject"]}/{x["id"]}'
                words = " ".join((EXAM_SUBJECTS[k], T2S.convert(EXAM_SUBJECTS[k]), k, EXAM_ALIASES[k], T2S.convert(EXAM_ALIASES[k]), x["ai"], x["id"], x["date"], x["credit"],
                                  x["te_version"], U["set"].format(n=n), T2S.convert(U["set"].format(n=n))))
                cards.append(f'<article class="ex" id="{x["id"]}" data-ai="{e(x["ai"])}" data-o="{data["exams"].index(x)}" data-q="{e(words)}">{img}<div class="exb">'
                             f'<div class="exh"><b>{e(name)} · {e(U["set"].format(n=n))}</b><span class="ai {ai_cls}">{e(x["ai"])}</span></div>'
                             f'<p class="exm">{e(meta)}</p>{acts}'
                             f'<div class="exf"><a href="{e(folder)}" target="_blank" rel="noopener noreferrer">{e(U["folder"])} ↗</a>'
                             f'<a href="{e(mail)}">{e(U["report"])}</a><details><summary>SHA-256</summary>{sha}</details></div></div></article>')
            sections.append(f'<section class="subject" id="{k}" data-subj="{k}"><h2>{e(name)} <small class="note">{e(U["count"].format(n=len(items)))}</small></h2>'
                            f'<div class="exams">{"".join(cards)}</div></section>')
        ai_counts = {a: sum(x["ai"] == a for x in data["exams"]) for a in EXAM_AIS}
        ai_chips = (f'<button type="button" data-ai="">{e(U["all_ai"])}</button>'
                    + "".join(f'<button type="button" data-ai="{e(a)}">{e(a if loc == "zh-TW" else T2S.convert(a))}<em>{c}</em></button>'
                              for a, c in ai_counts.items() if c))
        bar = (f'<div class="exfilter" data-shown="{e(U["shown"])}" data-count="{e(U["count"])}">'
               f'<div class="exf-top" hidden><label class="exf-search"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/></svg>'
               f'<input type="search" maxlength="40" autocomplete="off" spellcheck="false" placeholder="{e(U["search_ph"])}" aria-label="{e(U["search"])}"></label>'
               f'<select aria-label="{e(U["sort"])}"><option value="new">{e(U["sort_new"])}</option><option value="old">{e(U["sort_old"])}</option></select></div>'
               f'<nav class="subjects" aria-label="{e(U["subject_nav"])}">{nav}</nav>'
               f'<div class="exf-ai" role="group" aria-label="{e(U["ai_nav"])}" hidden>{ai_chips}</div>'
               f'<p class="exf-status" aria-live="polite" hidden></p></div>'
               f'<p class="exf-empty" hidden>{e(U["nomatch"])}<button type="button">{e(U["reset"])}</button></p>')
        body = (head + (bar if nav else "")
                + ("".join(sections) or f'<p class="note">{e(U["none"])}</p>')
                + f'<p class="fine">{e(U["license"])} · <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC 4.0</a>'
                  f' · <a href="https://huggingface.co/datasets/{e(data["dataset"])}" target="_blank" rel="noopener noreferrer">{e(U["dataset"])} ↗</a></p>'
                + f'<div class="btns"><a class="btn" href="https://github.com/niansia/taiwan-exam" target="_blank" rel="noopener noreferrer">{e(U["te"])} ↗</a>'
                  f'<a class="btn" href="{HOME[loc]}#projects/taiwan-exam">{e(U["back"])}</a></div></main>')
        ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": U["title"], "url": f"{SITE}/exams/{seg}/", "inLanguage": HTML_LANG[loc],
              "author": PERSON, "license": "https://creativecommons.org/licenses/by-nc/4.0/"}
        out = ROOT / "exams" / seg / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(loc=loc, title=f'{U["title"]} · Niansia', desc=U["lede"], url=f"/exams/{seg}/", og=f"/assets/og/exams-{seg}.jpg",
                             alternates={l: f"/exams/{s}/" for s, l in segs.items()}, body=body, jsonld=ld, crumbs=" / exams", og_type="website",
                             extra_css=EXAM_CSS, author_note=U["author_note"], scripts=("/assets/js/exam-filter.js?v=1",)), encoding="utf-8")
        urls.append(f"/exams/{seg}/")
    (ROOT / "exams" / "index.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8"><title>Taiwan Exam · Niansia</title><link rel="canonical" href="' + SITE + '/exams/zh-tw/">'
        '<meta name="robots" content="noindex,follow"><script>var l=(navigator.language||"").toLowerCase();'
        'location.replace("/exams/"+(/^zh-(cn|sg)/.test(l)?"zh-cn":"zh-tw")+"/");</script></head>'
        '<body><a href="/exams/zh-tw/">繁體中文</a> · <a href="/exams/zh-cn/">简体中文</a></body></html>', encoding="utf-8")
    return urls


# ------------------------------------------------------------------------------------------------ shared data for brief / papers
def load_js(rel: str, var: str):
    js = f"global.window={{}};require(process.argv[1]);process.stdout.write(JSON.stringify(window.{var}||null))"
    out = subprocess.run(["node", "-e", js, str(ROOT / rel)], capture_output=True, check=True)
    return json.loads(out.stdout.decode("utf-8"))


def pick(v, loc: str) -> str:
    """A text field is a plain string or {en, 'zh-TW', 'zh-CN'}."""
    if isinstance(v, dict):
        return v.get(loc) or v.get("en") or ""
    return v or ""


def seg_of(loc: str) -> str:
    return {"en": "", "zh-TW": "zh-tw/", "zh-CN": "zh-cn/"}[loc]


ICON = {  # 24px stroke icons, same drawing style as the terminal
    "paper": "M6 2h9l4 4v16H6zM14 2v5h5M9 11h7M9 15h7M9 19h4", "code": "m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16",
    "link": "M8 16 16 8M10 4h10v10M5 9H3v12h12v-2", "play": "m8 4 12 8-12 8z", "slides": "M3 4h18v12H3zM12 16v4M8 20h8",
    "poster": "M5 3h14v18H5zM8 7h8M8 11h8M8 15h5", "arxiv": "M6 2h9l4 4v16H6zM14 2v5h5M9 13l6 6M15 13l-6 6", "quote": "M7 7h4v4H7zM7 11q0 4-3 5M15 7h4v4h-4zM15 11q0 4-3 5",
    "mail": "M3 5h18v14H3zM3 5l9 8 9-8", "print": "M6 9V3h12v6M6 17H3v-8h18v8h-3M6 14h12v7H6z", "bolt": "M13 2 4 14h7l-1 8 9-12h-7z",
    "arrow": "M4 12h15m-6-6 6 6-6 6", "lock": "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3", "copy": "M8 8h12v12H8zM4 16H2V2h14v2",
    "github": "M9 19c-4 1.5-4-2-6-2.5M15 22v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.7s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0C6.2.6 5 1 5 1a5 5 0 0 0-.1 3.7A5.4 5.4 0 0 0 3.4 8.5c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-1 2.6V22",
    "globe": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3q4 4.5 4 9t-4 9q-4-4.5-4-9t4-9",
}


def svg(name: str) -> str:
    return (f'<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true"><path d="{ICON[name]}"/></svg>')


def is_hidden(p: dict) -> bool:
    return bool(p.get("anonymous")) and p.get("status") in ("under-review", "in-prep")


# ------------------------------------------------------------------------------------------------ one-page brief
BRIEF_UI = {
    "en": {"title": "One-page brief", "desc": "Niansia in one page: research questions, papers, selected projects, education and contact. Printable.",
           "glance": "In 30 seconds", "interests": "Research questions", "papers": "Papers & manuscripts", "none": "No peer-reviewed papers yet; the first manuscripts are in preparation.",
           "prep": "In preparation", "blind": "title withheld during double-blind review", "selected": "Selected projects", "more": "More projects", "edu": "Education",
           "skills": "Skills", "writing": "Writing", "contact": "Contact", "print": "Print / save as PDF", "full": "Interactive version", "updated": "Updated",
           "result": "Result", "code": "Code", "demo": "Live demo", "film": "Film", "page": "Details", "stats": ["public projects", "manuscripts in preparation", "research notes"],
           "prepline": "Preparing submissions to {venues}.", "approach": "Approach: turn research questions into tools whose evidence can be checked and reproduced.",
           "focus": "Focus: security, robustness and grounding of visual and multimodal AI (AI security × computer vision × vision-language models).",
           "bg": "Background: B.S. in Computer Science, Yuan Ze University; M.S. studies at NYCU, currently on a one-year leave.",
           "reach": "Open to research conversations and collaboration: reading groups, reproductions, benchmarks and prototypes.",
           "demos": "Try it in the browser:", "adv": "Adversarial Lab (FGSM / PGD, robust training)", "lumi": "LumiGrid low-light enhancement", "chroma": "ChromaRecover (colour-hidden structure)",
           "statement": "Research statement", "notes": "Research notes", "log": "Research log", "footer": "This brief is generated from the same data as the interactive site."},
    "zh-TW": {"title": "一頁式簡介", "desc": "一頁看完 Niansia：研究問題、論文、代表作品、學歷與聯絡方式。可直接列印。",
              "glance": "30 秒速覽", "interests": "研究問題", "papers": "論文與投稿", "none": "目前還沒有同儕審查論文；第一批稿件正在準備中。",
              "prep": "準備中", "blind": "雙盲審查期間不公開標題", "selected": "代表作品", "more": "其他作品", "edu": "學歷",
              "skills": "技能", "writing": "寫作", "contact": "聯絡", "print": "列印／存成 PDF", "full": "互動版網站", "updated": "更新於",
              "result": "成果", "code": "程式碼", "demo": "線上試玩", "film": "動畫", "page": "詳細介紹", "stats": ["項公開作品", "篇準備中的稿件", "篇研究筆記"],
              "prepline": "正在準備投稿 {venues}。", "approach": "做法：把研究問題做成工具，讓每個主張都有可以檢查、可以重現的證據。",
              "focus": "方向：視覺與多模態 AI 的安全性、穩健性與證據對齊（AI 安全 × 電腦視覺 × 視覺語言模型）。",
              "bg": "背景：元智大學資訊工程學士；陽明交通大學資訊工程碩士班，目前休學一年。",
              "reach": "歡迎研究交流與合作：一起讀論文、重現結果、設計評測基準或做原型。",
              "demos": "在瀏覽器試玩：", "adv": "對抗樣本實驗室（FGSM／PGD、對抗訓練）", "lumi": "LumiGrid 低光增強", "chroma": "ChromaRecover 找出顏色藏起來的結構",
              "statement": "研究方向說明", "notes": "研究筆記", "log": "研究日誌", "footer": "這份簡介與互動版網站使用同一份資料產生。"},
}
BRIEF_UI["zh-CN"] = {k: ([s_fix(x) for x in v] if isinstance(v, list) else s_fix(v)) for k, v in BRIEF_UI["zh-TW"].items()}

BRIEF_CSS = """
main.brief{max-width:900px;}
.b-actions{display:flex;gap:8px;margin-left:10px;}
.b-actions a,.b-actions button{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font:500 12px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;text-decoration:none;cursor:pointer;}
.b-actions a:hover,.b-actions button:hover{border-color:var(--accent);color:var(--accent);}
.i{width:15px;height:15px;flex:none;vertical-align:-2px;}
.b-hero{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:28px;align-items:end;padding:18px 0 26px;border-bottom:1px solid var(--line);}
.b-hero h1{font-size:clamp(40px,7vw,64px);margin:0;line-height:1;letter-spacing:-.035em;view-transition-name:brief-name;}
.b-role{font-size:18px;font-weight:600;margin:12px 0 4px;}
.b-sub{color:var(--muted);margin:0 0 14px;font-size:15px;}
.b-contact{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:14px;}
.b-contact a{display:inline-flex;align-items:center;gap:6px;text-decoration:none;}
.b-contact a:hover{text-decoration:underline;}
.b-stats{display:grid;gap:8px;}
.b-stats div{display:flex;align-items:baseline;gap:10px;padding:10px 14px;border-radius:14px;background:var(--paper);border:1px solid var(--line);}
.b-stats b{font:700 26px/1 'JetBrains Mono',monospace;color:var(--accent);min-width:34px;}
.b-stats span{font-size:13px;color:var(--muted);line-height:1.3;}
.brief h2{display:flex;align-items:center;gap:10px;font:600 12.5px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:34px 0 12px;}
.brief h2:after{content:'';flex:1;height:1px;background:var(--line);}
.b-glance{margin:0;padding:0;list-style:none;display:grid;gap:8px;}
.b-glance li{position:relative;padding-left:22px;line-height:1.7;}
.b-glance li:before{content:'';position:absolute;left:4px;top:.72em;width:8px;height:8px;border-radius:2px;background:var(--accent);transform:rotate(45deg);}
.b-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.b-q{padding:16px 18px;border-radius:16px;background:var(--paper);border:1px solid var(--line);}
.b-q b{display:block;margin-bottom:4px;}.b-q p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.7;}
.b-demos{margin:12px 0 0;font-size:14px;color:var(--muted);}.b-demos a{font-weight:600;}
.b-pub{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;padding:12px 0;border-bottom:1px dashed var(--line);}
.b-pub:last-child{border-bottom:0;}
.b-venue{font:600 12.5px 'JetBrains Mono',monospace;padding:2px 9px;border-radius:8px;background:var(--code);align-self:start;white-space:nowrap;}
.b-pub b{font-size:15.5px;}.b-pub small{grid-column:2;color:var(--muted);font-size:13.5px;}
.b-pub .muted{color:var(--muted);font-style:italic;font-weight:500;}
.b-none{margin:0 0 6px;color:var(--muted);font-size:14.5px;}
.b-proj{display:grid;grid-template-columns:1fr;gap:12px;}
.b-card{padding:16px 18px;border-radius:16px;background:var(--paper);border:1px solid var(--line);break-inside:avoid;}
.b-card header{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin-bottom:4px;}
.b-card header b{font-size:17px;}.b-card header span{font:500 12px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;color:var(--muted);}
.b-card p{margin:0 0 6px;font-size:14.5px;line-height:1.7;}
.b-card .ev{color:var(--muted);font-size:13.5px;}.b-card .ev b{color:var(--ink);font-weight:600;}
.b-links{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;margin-top:6px;}
.b-links a{display:inline-flex;align-items:center;gap:5px;text-decoration:none;}.b-links a:hover{text-decoration:underline;}
.b-more{columns:2;column-gap:28px;margin:0;padding:0;list-style:none;}
.b-more li{break-inside:avoid;padding:6px 0;border-bottom:1px dashed var(--line);font-size:14px;}
.b-more a{font-weight:600;text-decoration:none;}.b-more span{color:var(--muted);font-size:12.5px;display:block;}
.b-edu{margin:0;padding:0;list-style:none;display:grid;gap:8px;}
.b-edu li{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;}.b-edu b{font-size:15px;}.b-edu span{color:var(--muted);font-size:14px;}.b-edu em{font-style:normal;font-size:13px;color:var(--accent);}
.b-skills{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:0;font-size:14px;}
.b-skills dt{font:600 12.5px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;color:var(--muted);padding-top:2px;}.b-skills dd{margin:0;}
.b-write{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.b-write a{padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--paper);text-decoration:none;color:var(--ink);font-size:14px;line-height:1.5;}
.b-write a:hover{border-color:var(--accent);}.b-write small{display:block;color:var(--muted);font-size:12.5px;margin-top:2px;}
.b-end{margin-top:34px;padding:20px 22px;border-radius:18px;background:linear-gradient(120deg,var(--paper),var(--code));border:1px solid var(--line);display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:space-between;}
.b-end p{margin:0;max-width:520px;}
@media(max-width:720px){.b-hero{grid-template-columns:1fr;}.b-two,.b-write{grid-template-columns:1fr;}.b-more{columns:1;}.b-actions span{display:none;}}
@media print{
  @page{margin:13mm 14mm;}
  :root{--bg:#fff;--paper:#fff;--ink:#111;--muted:#555;--line:#0002;--code:#f3f3f3;--accent:#8a3f14;}
  body{font-size:10.5pt;line-height:1.55;}
  .top,.no-print,footer,.b-actions{display:none!important;}
  main.brief{max-width:none;padding:0;}
  .b-hero{padding-top:0;grid-template-columns:1fr 200px;}
  .b-hero h1{font-size:34pt;}
  .brief h2{margin:16pt 0 6pt;break-after:avoid;}
  .b-card,.b-q,.b-pub,.b-stats div{break-inside:avoid;box-shadow:none;}
  .b-card{padding:8pt 10pt;}
  a{color:inherit;}
  .b-links a[href^="http"]:after{content:" ‹" attr(href) "›";font-size:8pt;color:#666;word-break:break-all;}
}
"""


def first_sentence(text: str) -> str:
    m = re.match(r"^(.+?(?:[。！？]|[.!?](?=\s|$)))", text.strip())
    return m.group(1) if m else text


def build_brief(projects: dict, notes: dict, copy: dict, cv: dict, subs: dict, pubs: dict) -> list[str]:
    urls = []
    today = date.today().isoformat()
    for seg, loc in LANGS.items():
        U, C = BRIEF_UI[loc], copy[loc]
        base = "/brief/" if seg == "en" else f"/brief/{seg}/"
        alts = {l: ("/brief/" if s == "en" else f"/brief/{s}/") for s, l in LANGS.items()}
        projs = projects[loc]
        venues = subs.get("venues", []) if subs else []
        public = [p for p in (pubs or {}).get("papers", []) if not p.get("draft")]
        glance = [U["focus"], U["approach"]]
        if venues:
            sep = ", " if loc == "en" else "、"
            glance.append(U["prepline"].format(venues=sep.join(v["venue"] for v in venues)))
        glance += [U["bg"], U["reach"]]
        stats = [(len(projs), U["stats"][0]), (len(venues), U["stats"][1]), (len(notes), U["stats"][2])]
        interests = [(C["researchA"], C["researchABody"]), (C["researchB"], C["researchBBody"])]

        rows = []
        for p in public:
            hidden = is_hidden(p)
            title = f'<span class="muted">{e(BRIEF_UI[loc]["blind"])}</span>' if hidden else (
                f'<a href="/paper/{e(p["id"])}/{seg_of(loc)}">{e(pick(p.get("title"), loc))}</a>' if p.get("page") else e(pick(p.get("title"), loc)))
            authors = "" if hidden else ", ".join(("<b>" + e(a["name"]) + "</b>") if a.get("me") else e(a["name"]) for a in p.get("authors", []))
            rows.append(f'<div class="b-pub"><span class="b-venue">{e(p.get("venue", ""))}</span><b>{title}</b>{f"<small>{authors}</small>" if authors else ""}</div>')
        if not rows:
            rows.append(f'<p class="b-none">{e(U["none"])}</p>')
        for v in venues:
            dl = f' · deadline {v["deadline"][:10]} AoE' if v.get("deadline") else ""
            rows.append(f'<div class="b-pub"><span class="b-venue">{e(v["venue"])}</span><b>{e(pick(v.get("topic"), loc))}</b>'
                        f'<small>{e(U["prep"])} · {e(U["blind"])}{e(dl)}</small></div>')

        chosen = [x for x in (cv or {}).get("projects", []) if any(p["id"] == x for p in projs)]
        by_id = {p["id"]: p for p in projs}
        cards = []
        for pid in chosen:
            p = by_id[pid]
            links = [f'<a href="{e(p["url"])}">{svg("code")}{e(U["code"])}</a>', f'<a href="{e(p["reference"])}">{svg("link")}{e(p["referenceLabel"])}</a>']
            if pid == "lumigrid":
                links.append(f'<a href="/lab/lumigrid/?lang={loc}">{svg("play")}{e(U["demo"])}</a>')
            if pid == "taiwan-exam":
                links.append(f'<a href="/assets/film/taiwan-exam.html?lang={loc}">{svg("play")}{e(U["film"])}</a>')
            if pid == "chromarecover":
                links.append(f'<a href="/lab/chromarecover/?lang={loc}">{svg("play")}{e(U["demo"])}</a>')
            links.append(f'<a href="/p/{pid}/{seg_of(loc)}">{svg("arrow")}{e(U["page"])}</a>')
            cards.append(f'<article class="b-card"><header><b>{e(p["name"])}</b><span>{e(p["category"])} · {e(p["status"])}</span></header>'
                         f'<p>{e(first_sentence(p["description"]))}</p><p class="ev"><b>{e(U["result"])}:</b> {e(first_sentence(p["evidence"]))}</p>'
                         f'<div class="b-links">{"".join(links)}</div></article>')
        more = "".join(f'<li><a href="/p/{p["id"]}/{seg_of(loc)}">{e(p["name"])}</a><span>{e(p["category"])} · {e(p["status"])}</span></li>'
                       for p in projs if p["id"] not in chosen)
        def edu_row(x):
            detail = pick(x.get("detail"), loc)
            return (f'<li><b>{e(pick(x.get("title"), loc))}</b><span>{e(pick(x.get("org"), loc))}</span>'
                    + (f"<em>{e(detail)}</em>" if detail else "") + "</li>")
        edu = "".join(edu_row(x) for x in (cv or {}).get("education", []))
        skills = (cv or {}).get("skills", {}).get(loc) or (cv or {}).get("skills", {}).get("en") or []
        st = parse_note(ROOT / "statement_src" / ("statement.en.md" if loc == "en" else "statement.zh-TW.md"))
        st_title = s_fix(st["title"]) if loc == "zh-CN" else st["title"]
        latest = next(iter(notes.values()))[loc] if notes else None
        writing = (f'<a href="/statement/{seg}/">{e(U["statement"])}<small>{e(st_title)}</small></a>'
                   + (f'<a href="/notes/{seg}/">{e(U["notes"])}<small>{e(latest["title"])}</small></a>' if latest else "")
                   + f'<a href="/log/{seg}/">{e(U["log"])}<small>{e(UI[loc]["log_lede"])}</small></a>')
        actions = (f'<span class="b-actions no-print"><button type="button" data-print>{svg("print")}<span>{e(U["print"])}</span></button>'
                   f'<a href="{HOME[loc]}">{svg("arrow")}<span>{e(U["full"])}</span></a></span>')
        body = f"""<main class="brief">
<section class="b-hero"><div><p class="kicker">~/niansia/brief · {e(U["updated"])} {today}</p><h1>Niansia</h1>
<p class="b-role">{e(C["role"])} · {e(C["leave"])}</p><p class="b-sub">{e(C["interests"])}</p>
<p class="b-contact"><a href="mailto:{EMAIL}">{svg("mail")}{EMAIL}</a><a href="https://github.com/niansia">{svg("github")}github.com/niansia</a><a href="{HOME[loc]}">{svg("globe")}{HOST}</a></p></div>
<div class="b-stats">{"".join(f"<div><b>{n}</b><span>{e(label)}</span></div>" for n, label in stats)}</div></section>
<h2>{e(U["glance"])}</h2><ul class="b-glance">{"".join(f"<li>{e(x)}</li>" for x in glance)}</ul>
<h2>{e(U["interests"])}</h2><div class="b-two">{"".join(f'<div class="b-q"><b>{e(a)}</b><p>{e(b)}</p></div>' for a, b in interests)}</div>
<p class="b-demos">{e(U["demos"])} <a href="/lab/adversarial/?lang={loc}">{e(U["adv"])}</a> · <a href="/lab/lumigrid/?lang={loc}">{e(U["lumi"])}</a> · <a href="/lab/chromarecover/?lang={loc}">{e(U["chroma"])}</a></p>
<h2>{e(U["papers"])}</h2><div>{"".join(rows)}</div>
<h2>{e(U["selected"])}</h2><div class="b-proj">{"".join(cards)}</div>
{f'<h2>{e(U["more"])}</h2><ul class="b-more">{more}</ul>' if more else ""}
<div class="b-two" style="margin-top:6px"><div><h2>{e(U["edu"])}</h2><ul class="b-edu">{edu}</ul></div>
<div><h2>{e(U["skills"])}</h2><dl class="b-skills">{"".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in skills)}</dl></div></div>
<h2>{e(U["writing"])}</h2><div class="b-write">{writing}</div>
<div class="b-end"><p>{e(C["contactBody"])}</p><a class="btn primary" href="mailto:{EMAIL}">{svg("mail")} {EMAIL}</a></div>
<p class="note" style="margin-top:18px">{e(U["footer"])}</p>
</main>"""
        ld = {"@context": "https://schema.org", "@type": "ProfilePage", "name": f'Niansia · {U["title"]}', "url": f"{SITE}{base}", "inLanguage": HTML_LANG[loc],
              "dateModified": today, "mainEntity": PERSON | {"jobTitle": C["role"], "knowsAbout": C["interests"].split(" / ")}}
        out = ROOT / base.strip("/") / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(shell(loc=loc, author=False, title=f'Niansia · {U["title"]}', desc=U["desc"], url=base, og=f"/assets/og/brief-{seg}.jpg", alternates=alts, body=body,
                             jsonld=ld, crumbs=" / brief", og_type="profile", extra_css=BRIEF_CSS, scripts=("/assets/js/static-pages.js",), top_extra=actions), encoding="utf-8")
        urls.append(base)
    return urls


# ------------------------------------------------------------------------------------------------ paper project pages
PAPER_UI = {
    "en": {"tldr": "TL;DR", "abstract": "Abstract", "cite": "Citation", "copy": "Copy", "copied": "Copied", "compare": "Drag to compare",
           "blind": "Anonymous submission", "blindBody": "This paper is under double-blind review. The title, authors and materials will appear here after the decision.",
           "after": "available after review", "template": "Draft preview: this page is not linked from the site and is hidden from search engines.",
           "papers": "All papers", "brief": "One-page brief", "status": {"published": "Published", "accepted": "Accepted", "preprint": "Preprint", "under-review": "Under review", "in-prep": "In preparation"},
           "links": {"paper": "Paper", "arxiv": "arXiv", "code": "Code", "video": "Video", "slides": "Slides", "poster": "Poster"}, "affil": "Affiliations"},
    "zh-TW": {"tldr": "一句話摘要", "abstract": "摘要", "cite": "引用", "copy": "複製", "copied": "已複製", "compare": "拖曳比較",
              "blind": "匿名投稿", "blindBody": "這篇論文正在雙盲審查中。標題、作者與相關資料會在結果公布後放在這裡。",
              "after": "審查結束後公開", "template": "草稿預覽：這一頁沒有從網站連結，也不會被搜尋引擎收錄。",
              "papers": "全部論文", "brief": "一頁式簡介", "status": {"published": "已發表", "accepted": "已接受", "preprint": "預印本", "under-review": "審查中", "in-prep": "準備中"},
              "links": {"paper": "論文", "arxiv": "arXiv", "code": "程式碼", "video": "影片", "slides": "投影片", "poster": "海報"}, "affil": "單位"},
}
PAPER_UI["zh-CN"] = {k: (s_fix(v) if isinstance(v, str) else {kk: s_fix(vv) for kk, vv in v.items()}) for k, v in PAPER_UI["zh-TW"].items()}
PAPER_UI["zh-CN"]["status"]["accepted"] = "已接收"

PAPER_CSS = """
main.paper{max-width:980px;}
.i{width:16px;height:16px;flex:none;}
.p-banner{display:flex;gap:10px;align-items:flex-start;margin:6px 0 10px;padding:10px 14px;border-radius:12px;border:1px dashed var(--accent);color:var(--accent);font:500 13px/1.6 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;}
.p-hero{text-align:center;padding:26px 0 8px;}
.p-venue{display:inline-flex;align-items:center;gap:8px;padding:4px 12px;border-radius:99px;background:var(--code);font:600 13px 'JetBrains Mono',monospace;}
.p-venue i{width:7px;height:7px;border-radius:50%;background:var(--accent2);}
.p-venue[data-status=published] i,.p-venue[data-status=accepted] i{background:#34a36b;}
.p-hero h1{font-size:clamp(28px,4.6vw,46px);line-height:1.15;letter-spacing:-.025em;margin:18px auto 16px;max-width:860px;view-transition-name:paper-title;}
.p-hero h1.blind{color:var(--muted);font-style:italic;}
.p-authors{font-size:18px;margin:0 0 4px;}.p-authors span{white-space:nowrap;}.p-authors sup{color:var(--muted);font-size:11px;margin-left:1px;}
.p-authors .me{font-weight:700;text-decoration:underline;text-decoration-color:var(--accent);text-underline-offset:4px;}
.p-affil{color:var(--muted);font-size:14.5px;margin:0 0 20px;}.p-affil sup{margin-right:2px;}
.p-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 26px;}
.p-links a,.p-links span{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:99px;background:var(--ink);color:var(--bg);text-decoration:none;font-weight:600;font-size:14px;transition:transform .2s;}
.p-links a:hover{transform:translateY(-2px);}
.p-links span{background:transparent;color:var(--muted);border:1px dashed var(--line);font-weight:500;}
.p-fig{margin:0 0 26px;}
.p-fig img,.p-fig video{display:block;width:100%;border-radius:18px;border:1px solid var(--line);background:var(--paper);}
.p-fig figcaption{margin-top:10px;text-align:center;color:var(--muted);font-size:14px;}
.p-tldr{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start;margin:0 auto 26px;max-width:820px;padding:16px 20px;border-radius:16px;background:var(--paper);border:1px solid var(--line);border-left:4px solid var(--accent);}
.p-tldr b{font:700 12px 'JetBrains Mono',monospace;color:var(--accent);padding-top:5px;letter-spacing:.06em;}.p-tldr p{margin:0;font-size:17px;line-height:1.65;}
.p-hl{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;max-width:820px;margin:0 auto 30px;}
.p-hl div{padding:14px 16px;border-radius:14px;background:var(--paper);border:1px solid var(--line);text-align:center;}
.p-hl b{display:block;font:700 26px 'JetBrains Mono',monospace;color:var(--accent);}.p-hl span{font-size:13px;color:var(--muted);}
.p-sec{max-width:820px;margin:0 auto;}
.p-sec>h2,.p-sec article h2{font-size:24px;margin:38px 0 12px;text-align:left;}
.p-abstract p{font-size:16.5px;line-height:1.85;text-align:justify;hyphens:auto;}
.p-cmp{position:relative;margin:18px 0 8px;border-radius:16px;overflow:hidden;border:1px solid var(--line);aspect-ratio:3/2;background:var(--paper);user-select:none;--x:50%;}
.p-cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;}
.p-cmp .p-before{clip-path:inset(0 calc(100% - var(--x)) 0 0);}
.p-cmp .p-line{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px #0006;pointer-events:none;}
.p-cmp .p-line:after{content:'⇆';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;color:#2a2230;display:grid;place-items:center;font-size:18px;box-shadow:0 4px 14px #0005;}
.p-cmp input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0;}
.p-cmp .p-tag{position:absolute;top:12px;padding:4px 10px;border-radius:99px;background:#000a;color:#fff;font:600 12px 'JetBrains Mono',monospace;pointer-events:none;}
.p-cmp .p-l{left:12px;}.p-cmp .p-r{right:12px;}
.p-bib{position:relative;}
.p-bib pre{margin:0;padding:18px 20px;border-radius:14px;background:var(--code);font:13px/1.7 'JetBrains Mono',monospace;overflow-x:auto;}
.p-bib button{position:absolute;top:10px;right:10px;display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:9px;border:1px solid var(--line);background:var(--paper);color:var(--ink);font:500 12px 'JetBrains Mono',monospace;cursor:pointer;}
.p-bib button:hover{border-color:var(--accent);color:var(--accent);}
.p-blind{max-width:640px;margin:10px auto 30px;padding:22px 24px;border-radius:18px;border:1.5px dashed var(--line);text-align:center;color:var(--muted);}
@media(max-width:720px){.p-authors{font-size:16px;}.p-tldr{grid-template-columns:1fr;gap:4px;}.p-abstract p{text-align:left;}}
"""


def build_papers(pubs: dict) -> tuple[list[str], list[str]]:
    """Returns (public urls for the sitemap, all urls built)."""
    public, built = [], []
    for p in (pubs or {}).get("papers", []):
        if not p.get("page"):
            continue
        hidden, draft, pid = is_hidden(p), bool(p.get("draft")), p["id"]
        src = {loc: ROOT / "papers_src" / f"{pid}.{loc}.md" for loc in ("en", "zh-TW")}
        for seg, loc in LANGS.items():
            U = PAPER_UI[loc]
            base = f"/paper/{pid}/" if seg == "en" else f"/paper/{pid}/{seg}/"
            alts = {l: (f"/paper/{pid}/" if s == "en" else f"/paper/{pid}/{s}/") for s, l in LANGS.items()}
            title = U["blind"] if hidden else pick(p.get("title"), loc)
            status = p.get("status", "")
            affs = p.get("affiliations", [])
            authors = "" if hidden else ", ".join(
                f'<span class="{"me" if a.get("me") else ""}">{e(a["name"])}{"*" if a.get("equal") else ""}<sup>{",".join(str(x) for x in a.get("aff", []))}</sup></span>'
                for a in p.get("authors", []))
            affil = "" if hidden else " · ".join(f"<sup>{i}</sup>{e(a)}" for i, a in enumerate(affs, 1))
            icons = {"paper": "paper", "arxiv": "arxiv", "code": "code", "video": "play", "slides": "slides", "poster": "poster"}
            links = "".join(
                (f'<span>{svg("lock")}{e(U["links"][k])} · {e(U["after"])}</span>' if hidden else f'<a href="{e(p["links"][k])}">{svg(icons[k])}{e(U["links"][k])}</a>')
                for k in icons if (p.get("links") or {}).get(k))
            if not hidden and p.get("bibtex"):
                links += f'<a href="#cite">{svg("quote")}BibTeX</a>'
            parts = [f'<p class="p-banner">{svg("lock")}<span>{e(U["template"])}</span></p>' if draft else "",
                     f'<header class="p-hero"><span class="p-venue" data-status="{e(status)}"><i></i>{e(p.get("venue", ""))} · {e(U["status"].get(status, status))}</span>'
                     f'<h1 class="{"blind" if hidden else ""}">{e(title)}</h1>'
                     + (f'<p class="p-authors">{authors}</p><p class="p-affil">{affil}</p>' if authors else "")
                     + (f'<nav class="p-links" aria-label="Links">{links}</nav>' if links else "") + "</header>"]
            if hidden:
                parts.append(f'<p class="p-blind">{e(U["blindBody"])}</p>')
            else:
                tz = p.get("teaser")
                if tz:
                    media = (f'<video src="{e(tz["video"])}" poster="{e(tz.get("src", ""))}" autoplay muted loop playsinline></video>' if tz.get("video")
                             else f'<img src="{e(tz["src"])}" alt="{e(tz.get("alt", ""))}">')
                    parts.append(f'<figure class="p-fig">{media}<figcaption>{e(pick(tz.get("caption"), loc))}</figcaption></figure>')
                if p.get("tldr"):
                    parts.append(f'<div class="p-tldr"><b>{e(U["tldr"])}</b><p>{e(pick(p["tldr"], loc))}</p></div>')
                if p.get("highlights"):
                    parts.append('<div class="p-hl">' + "".join(f'<div><b>{e(h["value"])}</b><span>{e(pick(h["label"], loc))}</span></div>' for h in p["highlights"]) + "</div>")
                if p.get("abstract"):
                    paras = "".join(f"<p>{e(x.strip())}</p>" for x in pick(p["abstract"], loc).split("\n\n") if x.strip())
                    parts.append(f'<section class="p-sec p-abstract"><h2>{e(U["abstract"])}</h2>{paras}</section>')
                cmp = p.get("compare")
                if cmp:
                    lb = pick(cmp.get("label"), loc) or ["", ""]
                    parts.append(f'<section class="p-sec"><div class="p-cmp" data-compare><img class="p-after" src="{e(cmp["after"])}" alt="{e(lb[1])}">'
                                 f'<img class="p-before" src="{e(cmp["before"])}" alt="{e(lb[0])}"><span class="p-line"></span><span class="p-tag p-l">{e(lb[0])}</span>'
                                 f'<span class="p-tag p-r">{e(lb[1])}</span><input type="range" min="0" max="100" value="50" aria-label="{e(U["compare"])}"></div></section>')
                srcfile = src["en" if loc == "en" else "zh-TW"]
                if srcfile.exists():
                    text = srcfile.read_text(encoding="utf-8")
                    if text.startswith("---"):
                        text = parse_note(srcfile)["body"]
                    if loc == "zh-CN":
                        text = s_fix(text)
                    html_body, _ = render_markdown(text, src_dir=ROOT / "papers_src", media_dir=MEDIA, md=MD)
                    parts.append(f'<section class="p-sec"><article>{html_body}</article></section>')
                if p.get("bibtex"):
                    parts.append(f'<section class="p-sec p-bib" id="cite"><h2>{e(U["cite"])}</h2><pre>{e(p["bibtex"])}</pre>'
                                 f'<button type="button" data-copy-pre data-done="{e(U["copied"])}">{svg("copy")}{e(U["copy"])}</button></section>')
            parts.append(f'<div class="btns" style="justify-content:center;margin-top:40px"><a class="btn" href="{HOME[loc]}#papers">{e(U["papers"])}</a>'
                         f'<a class="btn primary" href="/brief/{seg_of(loc)}">{e(U["brief"])}</a></div>')
            body = f'<main class="paper">{"".join(parts)}</main>'
            desc = e(pick(p.get("tldr"), loc)) if not hidden else U["blindBody"]
            ld = None if hidden else {"@context": "https://schema.org", "@type": "ScholarlyArticle", "headline": title, "author": [{"@type": "Person", "name": a["name"]} for a in p.get("authors", [])],
                                      "datePublished": str(p.get("year", "")), "inLanguage": HTML_LANG[loc], "url": f"{SITE}{base}", "abstract": pick(p.get("abstract"), loc)}
            out = ROOT / base.strip("/") / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(shell(loc=loc, title=f"{title} · Niansia", desc=html.unescape(desc), url=base, og=f"/assets/og/paper-{pid}.jpg", alternates=alts, body=body,
                                 jsonld=ld, crumbs=f' / <a href="{HOME[loc]}#papers">papers</a>', og_type="article", noindex=draft or hidden,
                                 extra_css=PAPER_CSS, scripts=("/assets/js/static-pages.js",)), encoding="utf-8")
            built.append(base)
            if not draft and not hidden:
                public.append(base)
    return public, built


def lint_sources() -> None:
    """Checked before anything is written, so a refused build leaves no unsafe page behind."""
    for folder in ("notes_src", "log_src", "statement_src", "papers_src", "blog_src"):
        for f in (ROOT / folder).rglob("*"):
            if f.is_file():
                privacy_lint(str(f.relative_to(ROOT)), f.name + ("\n" + f.read_text(encoding="utf-8") if f.suffix == ".md" else ""))


def lint_sources_and_output() -> None:
    """Refuse to publish if any source or generated page carries something private (see content_safety.FORBIDDEN)."""
    lint_sources()
    for folder in ("notes", "log", "statement", "p", "brief", "paper", "blog"):
        for f in (ROOT / folder).rglob("*.html"):
            privacy_lint(str(f.relative_to(ROOT)), f.read_text(encoding="utf-8"))
    for rel in ("assets/js/notes-data.js", "assets/js/publications-data.js", "assets/js/blog-data.js"):
        privacy_lint(rel, (ROOT / rel).read_text(encoding="utf-8"))


# ------------------------------------------------------------------------------------------------ share pages
HERO = {"adversarial-lab": "/assets/og/adversarial-demo.jpg", "lumigrid": "/assets/work/cards/lumigrid.jpg", "taiwan-exam": "/assets/work/taiwan-exam-social-preview.png", "kcrashlab": "/assets/work/cards/kcrashlab.jpg",
        "contextsec": "/assets/work/contextsec-decision-flow.svg", "merriv": "/assets/work/cards/merriv.jpg", "ai-repo-gardener": "/assets/work/ai-repo-gardener-demo.gif",
        "noveltyaudit": "/assets/work/cards/noveltyaudit.jpg", "research-meeting-coach": "/assets/work/research-meeting-coach.png", "chromarecover": "/assets/work/cards/chromarecover.jpg"}
EXTRA = {"adversarial-lab": [("demo", "/lab/adversarial/?lang={loc}")],
         "lumigrid": [("demo", "/lab/lumigrid/?lang={loc}"), ("film", "/assets/film/lumigrid.html?lang={loc}")],
         "taiwan-exam": [("film", "/assets/film/taiwan-exam.html?lang={loc}")],
         "chromarecover": [("demo", "/lab/chromarecover/?lang={loc}"), ("film", "/assets/film/chromarecover.html?lang={loc}")]}


def build_share(projects: dict) -> list[str]:
    urls = []
    for seg, loc in LANGS.items():
        for p in projects[loc]:
            pid = p["id"]
            base = f"/p/{pid}/" if seg == "en" else f"/p/{pid}/{seg}/"
            alts = {l: (f"/p/{pid}/" if s == "en" else f"/p/{pid}/{s}/") for s, l in LANGS.items()}
            hero = f'<img class="hero" src="{HERO[pid]}" alt="{e(p["name"])}" loading="lazy">' if pid in HERO else ""
            extra = "".join(f'<a class="btn" href="{u.format(loc=loc)}">{e(UI[loc][k])}</a>' for k, u in EXTRA.get(pid, []))
            body = (f'<main><p class="kicker">projects/{e(pid)}</p><h1>{e(p["name"])}</h1><div class="chips"><span>{e(p["category"])}</span><span>{e(p["status"])}</span></div>'
                    f'{hero}<p class="lede">{e(p["description"])}</p><h2>{e(UI[loc]["evidence"])}</h2><p>{e(p["evidence"])}</p>'
                    f'<div class="btns"><a class="btn primary" href="{HOME[loc]}#projects/{pid}">{e(UI[loc]["open"])} →</a>{extra}'
                    f'<a class="btn" href="{e(p["url"])}">{e(UI[loc]["repo"])} ↗</a><a class="btn" href="{e(p["reference"])}">{e(p["referenceLabel"])} ↗</a></div>'
                    f'<p class="note">{e(UI[loc]["share_note"])}</p></main>')
            ld = {"@context": "https://schema.org", "@type": "SoftwareSourceCode", "name": p["name"], "description": p["description"], "codeRepository": p["url"],
                  "author": PERSON, "inLanguage": HTML_LANG[loc], "url": f"{SITE}{base}"}
            out = ROOT / base.strip("/") / "index.html"
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(shell(loc=loc, title=f'{p["name"]} · Niansia', desc=p["description"], url=base, og=f"/assets/og/p-{pid}.jpg", alternates=alts,
                                 body=body, jsonld=ld, crumbs=f' / <a href="{HOME[loc]}#projects">projects</a>', og_type="website"), encoding="utf-8")
            urls.append(base)
    return urls


# ------------------------------------------------------------------------------------------------ open-graph images
OG_CSS = """*{box-sizing:border-box;margin:0}html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:Inter,'Noto Sans TC','Noto Sans SC',sans-serif;color:#2a2230;background:radial-gradient(800px 500px at 90% 20%,#f2c9a688,transparent 65%),linear-gradient(120deg,#fbf6ee 40%,#f1e6d8);position:relative}
body:before{content:'';position:absolute;inset:0;background-image:radial-gradient(#2a22301c 1.2px,transparent 1.4px);background-size:22px 22px;mask-image:linear-gradient(90deg,#000,#0000 60%)}
.k{position:absolute;left:64px;top:54px;font:500 20px 'JetBrains Mono',monospace;color:#8b7d84}.k b{color:#c0673a;font-weight:500}
.t{position:absolute;left:64px;top:104px;width:560px;font-weight:800;font-size:64px;line-height:1.05;letter-spacing:-.03em}
.t.small{font-size:44px;line-height:1.18;letter-spacing:-.02em}
.c{position:absolute;left:64px;display:flex;flex-wrap:wrap;gap:10px}.c span{font:600 18px 'JetBrains Mono','Noto Sans TC','Noto Sans SC',monospace;padding:7px 14px;border-radius:99px;background:#fffdf9;box-shadow:0 0 0 1px #2a223018}
.d{position:absolute;left:64px;width:540px;font-size:22px;line-height:1.55;color:#5e5359;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.f{position:absolute;left:64px;bottom:48px;font:500 18px 'JetBrains Mono',monospace;color:#8b7d84}.f b{color:#2a2230;font-weight:500}
.img{position:absolute;right:48px;top:84px;width:500px;height:430px;border-radius:22px;background:#fffdf9 center/contain no-repeat;box-shadow:0 30px 60px -30px #2a223066,0 0 0 1px #2a223014}
.img.cover{background-size:cover}
.pat{position:absolute;right:48px;top:84px;width:500px;height:430px;border-radius:22px;background:linear-gradient(135deg,#2a2230,#5b4568);color:#fff;display:grid;place-items:center;font:800 120px Inter,sans-serif;letter-spacing:-.04em}
.yuki{position:absolute;right:120px;top:26px;height:640px}
.halo{position:absolute;right:40px;top:40px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,#f2c9a6,transparent 68%)}
.play{position:absolute;left:50%;top:50%;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;background:#fffffff0;display:grid;place-items:center;box-shadow:0 20px 40px -12px #0008}
.play:after{content:'';margin-left:10px;border-left:38px solid #2a2230;border-top:24px solid transparent;border-bottom:24px solid transparent}"""


def og_page(kind: str, **k) -> str:
    fonts = FONTS
    if kind == "project":
        img = (f'<div class="img{" cover" if k.get("cover") else ""}" style="background-image:url({k["img"]})"></div>' if k.get("img")
               else f'<div class="pat">{e(k["title"].split(" - ")[0][:4])}</div>')
        body = (f'<div class="k"><b>{HOST}</b> / projects</div><div class="t{" small" if len(k["title"]) > 14 else ""}">{e(k["title"])}</div>'
                f'<div class="c" style="top:{250 if len(k["title"]) <= 14 else 270}px">' + "".join(f"<span>{e(x)}</span>" for x in k["chips"]) + "</div>"
                f'<div class="d" style="top:{320 if len(k["title"]) <= 14 else 340}px">{e(k["desc"])}</div>{img}'
                f'<div class="f"><b>Niansia</b> · AI security × CV × VLM</div>')
    elif kind == "note":
        body = (f'<div class="k"><b>{HOST}</b> / {e(k.get("path", "notes"))}</div><div class="t small" style="width:1060px;font-size:54px">{e(k["title"])}</div>'
                f'<div class="d" style="top:330px;width:1000px;-webkit-line-clamp:3">{e(k["desc"])}</div>'
                f'<div class="f"><b>Niansia</b> · {e(k["label"])} · {e(k["date"])}</div>')
    elif kind == "home":
        body = (f'<div class="halo"></div><img class="yuki" src="{k["yuki"]}"><div class="k"><b>~/niansia</b> $ whoami</div>'
                f'<div class="t" style="font-size:104px;top:110px">Niansia</div><div class="d" style="top:250px;font-weight:700;color:#2a2230;font-size:26px">{e(k["role"])}</div>'
                f'<div class="c" style="top:310px">' + "".join(f"<span>{e(x)}</span>" for x in k["chips"]) + "</div>"
                f'<div class="d" style="top:392px;width:560px">{e(k["desc"])}</div><div class="f"><b>{HOST}</b></div>')
    else:  # film / demo: full-bleed image with a caption strip
        body = (f'<div style="position:absolute;inset:0;background:#000 url({k["img"]}) center/cover"></div>'
                f'<div style="position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(transparent,#000d)"></div>'
                + ('<div class="play"></div>' if kind == "film" else "") +
                f'<div class="t small" style="top:auto;bottom:92px;width:1080px;color:#fff">{e(k["title"])}</div>'
                f'<div class="f" style="color:#ddd;bottom:48px"><b style="color:#fff">{HOST}</b> · {e(k["sub"])}</div>')
    return f'<!doctype html><html><head><meta charset="utf-8">{fonts}<style>{OG_CSS}</style></head><body>{body}</body></html>'


async def render_og(jobs: list[tuple[str, str]]) -> None:
    from playwright.async_api import async_playwright
    tmp = ROOT / "assets" / "og" / "_render.html"
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome")
        page = await b.new_page(viewport={"width": 1200, "height": 630})
        for name, doc in jobs:
            tmp.write_text(doc, encoding="utf-8")
            await page.goto(tmp.as_uri())
            await page.evaluate("document.fonts.ready")
            await page.wait_for_timeout(300)
            png = ROOT / "assets" / "og" / f"{name}.png"
            await page.screenshot(path=str(png))
            Image.open(png).convert("RGB").save(png.with_suffix(".jpg"), quality=86, optimize=True, progressive=True)
            png.unlink()
        await b.close()
    tmp.unlink(missing_ok=True)


def og_jobs(projects: dict, notes: dict, pubs: dict | None = None) -> list[tuple[str, str]]:
    uri = lambda rel: (ROOT / rel.lstrip("/")).as_uri()
    jobs = []
    for p in projects["en"]:
        img = HERO.get(p["id"])
        jobs.append((f"p-{p['id']}", og_page("project", title=p["name"], chips=[p["category"], p["status"]], desc=p["description"],
                                             img=uri(img) if img else None, cover=p["id"] in ("lumigrid", "adversarial-lab"))))
    for seg, loc in LANGS.items():
        for slug, by in notes.items():
            n = by[loc]
            jobs.append((f"note-{slug}-{seg}", og_page("note", title=n["title"], desc=n["description"], date=n["date"], label=UI[loc]["notes"])))
        jobs.append((f"notes-{seg}", og_page("note", title=UI[loc]["notes"], desc=UI[loc]["notes_lede"], date=str(date.today()), label=HOST)))
        jobs.append((f"log-{seg}", og_page("note", title=UI[loc]["log"], desc=UI[loc]["log_lede"], date=str(date.today()), label=HOST)))
        st = parse_note(ROOT / "statement_src" / ("statement.en.md" if loc == "en" else "statement.zh-TW.md"))
        jobs.append((f"statement-{seg}", og_page("note", title=s_fix(st["title"]) if loc == "zh-CN" else st["title"],
                                                  desc=s_fix(st["description"]) if loc == "zh-CN" else st["description"], date=st["date"], label=UI[loc]["statement"])))
    roles = {"en": ("M.S. student in Computer Science · NYCU", ["AI Security", "Computer Vision", "VLMs"], "An interactive terminal portfolio: research tools, a browser-run CV model, films and notes."),
             "zh-tw": ("陽明交大資工碩士生", ["AI 安全", "電腦視覺", "視覺語言模型"], "互動式終端作品集：研究工具、在瀏覽器執行的電腦視覺模型、動畫與研究筆記。"),
             "zh-cn": ("阳明交大资工硕士生", ["AI 安全", "计算机视觉", "视觉语言模型"], "互动式终端作品集：研究工具、在浏览器运行的计算机视觉模型、动画与研究笔记。")}
    for seg, (role, chips, desc) in roles.items():
        jobs.append((f"site-{seg}", og_page("home", role=role, chips=chips, desc=desc, yuki=uri("/assets/og/yuki-researcher.png"))))
    for seg, loc in LANGS.items():
        jobs.append((f"brief-{seg}", og_page("note", title=f'Niansia · {BRIEF_UI[loc]["title"]}', desc=BRIEF_UI[loc]["desc"], date=str(date.today()), label=f"{HOST}/brief")))
    for p in (pubs or {}).get("papers", []):
        if p.get("page"):
            hidden = is_hidden(p)
            teaser = (p.get("teaser") or {}).get("src")
            jobs.append((f"paper-{p['id']}", og_page("project", title=PAPER_UI["en"]["blind"] if hidden else pick(p.get("title"), "en"),
                                                  chips=[p.get("venue", ""), PAPER_UI["en"]["status"].get(p.get("status"), "")],
                                                  desc=PAPER_UI["en"]["blindBody"] if hidden else pick(p.get("tldr"), "en"),
                                                  img=uri(teaser) if teaser and not hidden else None, cover=True)))
    for seg, loc in (("zh-tw", "zh-TW"), ("zh-cn", "zh-CN")):
        jobs.append((f"exams-{seg}", og_page("note", title=EXAM_UI[loc]["title"], desc=EXAM_UI[loc]["lede"], date=str(date.today()), label=f"{HOST}/exams", path="exams")))
    blog_posts, _ = load_blog()
    for seg, loc in LANGS.items():
        jobs.append((f"blog-{seg}", og_page("note", title=f'Niansia · {BLOG_UI[loc]["blog"]}', desc=BLOG_UI[loc]["lede"], date=str(date.today()), label=f"{HOST}/blog", path="blog")))
        for slug, by in blog_posts.items():
            n = by.get(loc)
            if n and n["type"] != "qa":
                jobs.append((f"blog-{slug}-{seg}", og_page("note", title=n["title"], desc=n.get("description", ""), date=n["date"], label=BLOG_UI[loc]["types"][n["type"]], path="blog")))
    jobs.append(("lumigrid-demo", og_page("demo", img=uri("/assets/work/cards/lumigrid.jpg"), title="Try LumiGrid in your browser", sub="low-light enhancement · runs on your device")))
    jobs.append(("film-lumigrid", og_page("film", img=uri("/assets/lumigrid/teaser-poster.jpg"), title="LumiGrid · one continuous take", sub="computer vision film")))
    jobs.append(("film-taiwan-exam", og_page("film", img=uri("/assets/taiwan-exam/teaser-poster.jpg"), title="Taiwan Exam · the film", sub="an Agent Skill for GSAT practice exams")))
    jobs.append(("film-capstone", og_page("film", img=uri("/assets/film/teaser-poster.jpg"), title="Detecting propaganda with generative AI", sub="undergraduate capstone film")))
    return jobs


def write_site_jsonld():
    """includes/site-jsonld.html: schema.org Person + WebSite for every Quarto page, built from SITE."""
    me = f"{SITE}/#me"
    data = {"@context": "https://schema.org", "@graph": [
        {"@type": "Person", "@id": me, "name": "Niansia", "url": f"{SITE}/", "email": f"mailto:{EMAIL}",
         "image": f"{SITE}/assets/og/yuki-researcher.png", "jobTitle": "M.S. student in Computer Science",
         "affiliation": {"@type": "CollegeOrUniversity", "name": "National Yang Ming Chiao Tung University"},
         "alumniOf": {"@type": "CollegeOrUniversity", "name": "Yuan Ze University"},
         "knowsAbout": ["AI security", "Computer vision", "Vision-language models", "Low-light image enhancement", "Trustworthy evaluation"],
         "sameAs": ["https://github.com/niansia"]},
        {"@type": "WebSite", "@id": f"{SITE}/#site", "url": f"{SITE}/", "name": "Niansia", "inLanguage": ["en", "zh-Hant", "zh-Hans"],
         "publisher": {"@id": me}}]}
    (ROOT / "includes" / "site-jsonld.html").write_text(
        f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False, separators=(",", ":"))}</script>\n', encoding="utf-8")


# ------------------------------------------------------------------------------------------------ sitemap / robots
AI_TRAINING_BOTS = ["GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Google-Extended", "Applebot-Extended", "Bytespider",
                    "meta-externalagent", "FacebookBot", "cohere-training-data-crawler", "Diffbot", "Omgilibot", "AI2Bot", "img2dataset"]


def write_sitemap(urls: list[str]) -> None:
    today = date.today().isoformat()
    body = "".join(f"<url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>\n" for u in ["/lab/lumigrid/", "/lab/adversarial/", "/lab/chromarecover/", *urls])
    (ROOT / "sitemap-extra.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n', encoding="utf-8")
    # Search engines may index everything; crawlers that collect text for training AI models are asked to stay out.
    # robots.txt is a request, not a lock: well-behaved crawlers honour it, and a public page can always be read.
    ai = "".join(f"User-agent: {bot}\n" for bot in AI_TRAINING_BOTS)
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\n{ai}Disallow: /\n\nSitemap: {SITE}/sitemap.xml\nSitemap: {SITE}/sitemap-extra.xml\n", encoding="utf-8")
    # security.txt (RFC 9116): where to report a security problem. Expires must stay within a year, so every build renews it.
    well_known = ROOT / ".well-known"
    well_known.mkdir(exist_ok=True)
    expires = date.fromordinal(date.today().toordinal() + 360).isoformat()
    (well_known / "security.txt").write_text(
        f"Contact: mailto:{EMAIL}\nExpires: {expires}T00:00:00.000Z\nPreferred-Languages: zh-Hant, en\n"
        f"Canonical: {SITE}/.well-known/security.txt\n", encoding="utf-8")


if __name__ == "__main__":
    projects, notes, log = load_projects(), load_notes(), load_log()
    blog, blog_cfg = load_blog()
    copy, cv = load_js("assets/js/terminal-copy.js", "NIANSIA_COPY"), load_js("assets/js/cv-data.js", "NIANSIA_CV")
    subs, pubs = load_js("assets/js/submissions-data.js", "NIANSIA_SUBMISSIONS"), load_js("assets/js/publications-data.js", "NIANSIA_PUBS")
    try:
        lint_sources()
        urls = build_notes(notes) + build_share(projects)
        log_urls, log_data = build_log(log)
        st_urls, st_data = build_statement()
        urls += log_urls + st_urls
        urls += build_brief(projects, notes, copy, cv, subs, pubs)
        paper_urls, _ = build_papers(pubs)
        urls += paper_urls
        blog_urls, _ = build_blog(blog, blog_cfg)
        urls += blog_urls
        urls += build_exams(load_exams())
        data_file = ROOT / "assets/js/notes-data.js"
        data_file.write_text(data_file.read_text(encoding="utf-8")
                             + "window.NIANSIA_LOG = " + json.dumps(log_data, ensure_ascii=False, indent=1) + ";\n"
                             + "window.NIANSIA_STATEMENT = " + json.dumps(st_data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
        lint_sources_and_output()
    except UnsafeContent as err:
        sys.exit(f"REFUSED TO BUILD: {err}")
    write_sitemap(urls)
    write_site_jsonld()
    if "--no-og" not in sys.argv:
        jobs = og_jobs(projects, notes, pubs)
        if "--og-missing" in sys.argv:
            jobs = [j for j in jobs if not (ROOT / "assets" / "og" / f"{j[0]}.jpg").exists()]
        asyncio.run(render_og(jobs))
    print(f"blog: {len(blog)} · notes: {len(notes)} x {len(LANGS)} · share pages: {sum(len(v) for v in projects.values())} · urls: {len(urls)}")
