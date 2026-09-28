"""Build the static, crawlable parts of the site that live outside the terminal app.

    notes_src/<slug>.<lang>.md  ->  notes/<lang>/<slug>/index.html, notes/<lang>/index.html, notes/index.html
    log_src/<date>-<slug>.<lang>.md -> log/<lang>/index.html (research log with images)
    statement_src/statement.<lang>.md -> statement/<lang>/index.html
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
SITE = "https://niansia.github.io"
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
.btn.primary{background:var(--accent);border-color:transparent;color:#fff;}
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
footer{max-width:760px;margin:0 auto;padding:26px 20px 50px;border-top:1px solid var(--line);font-size:14px;color:var(--muted);}
@view-transition{navigation:auto;}
::view-transition-old(root){animation:vt-out .18s ease-in both;}::view-transition-new(root){animation:vt-in .34s cubic-bezier(.22,1,.36,1) both;}
@keyframes vt-out{to{opacity:0;}}@keyframes vt-in{from{opacity:0;transform:translateY(8px);}}
::view-transition-group(*){animation-duration:.42s;animation-timing-function:cubic-bezier(.22,1,.36,1);}
@media(prefers-reduced-motion:reduce){@view-transition{navigation:none;}}
"""
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500'
         '&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap">')


def shell(*, loc: str, title: str, desc: str, url: str, og: str, alternates: dict, body: str, jsonld: dict | None = None,
          crumbs: str = "", og_type: str = "article", noindex: bool = False, extra_css: str = "", scripts: tuple = (), top_extra: str = "") -> str:
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
{FONTS}
<style>{CSS}{extra_css}</style>
{ld}
<script defer src="/assets/js/site-stats.js"></script>
<script defer src="/assets/js/lightbox.js"></script>
{"".join(f'<script defer src="{x}"></script>' for x in scripts)}
</head>
<body>
<header class="top"><a href="{HOME[loc]}"><b>~/niansia</b></a>{crumbs}<span class="sp"></span><span class="langs">{langs}</span>{top_extra}</header>
{body}
<footer>{e(UI[loc]['contact'])} <a href="mailto:{EMAIL}">{EMAIL}</a> · <a href="{HOME[loc]}">niansia.github.io</a> · <a href="https://github.com/niansia">github.com/niansia</a><span class="stats" data-stats hidden> · <i class="live-dot"></i> <b data-stat="online">–</b> {e(UI[loc]['online'])} · <b data-stat="total">–</b> {e(UI[loc]['visits'])}</span></footer>
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
            others = "".join(f'<a class="card" href="/notes/{seg}/{s}/"><b style="view-transition-name:n-{s}">{e(b[loc]["title"])}</b><small>{e(b[loc]["description"])}</small></a>'
                             for s, b in notes.items() if s != slug)
            body = (f'<main><p class="kicker">{e(UI[loc]["notes"])}</p><h1 style="view-transition-name:n-{slug}">{e(n["title"])}</h1><p class="lede">{e(n["description"])}</p>'
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
            cards.append(f'<a class="card" href="{url}"><b style="view-transition-name:n-{slug}">{e(n["title"])}</b><small>{e(n["description"])}</small><i>{n["date"]} · {mins} {e(UI[loc]["min"])}</i></a>')
        idx = f'<main><p class="kicker">~/niansia/notes</p><h1>{e(UI[loc]["notes"])}</h1><p class="lede">{e(UI[loc]["notes_lede"])}</p>{"".join(cards)}' \
              f'<div class="btns"><a class="btn primary" href="{HOME[loc]}#research">{e(UI[loc]["back"])}</a></div></main>'
        ld = {"@context": "https://schema.org", "@type": "Blog", "name": f'Niansia · {UI[loc]["notes"]}', "url": f"{SITE}/notes/{seg}/", "author": PERSON, "inLanguage": HTML_LANG[loc]}
        (ROOT / "notes" / seg).mkdir(parents=True, exist_ok=True)
        (ROOT / "notes" / seg / "index.html").write_text(shell(loc=loc, title=f'{UI[loc]["notes"]} · Niansia', desc=UI[loc]["notes_lede"], url=f"/notes/{seg}/",
                                                           og=f"/assets/og/notes-{seg}.jpg", alternates={l: f"/notes/{s}/" for s, l in LANGS.items()},
                                                           body=idx, jsonld=ld, crumbs=' / notes', og_type="website"), encoding="utf-8")
        urls.append(f"/notes/{seg}/")
    (ROOT / "notes" / "index.html").write_text(
        '<!doctype html><html><head><meta charset="utf-8"><title>Research notes · Niansia</title><link rel="canonical" href="https://niansia.github.io/notes/en/">'
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
<p class="b-contact"><a href="mailto:{EMAIL}">{svg("mail")}{EMAIL}</a><a href="https://github.com/niansia">{svg("github")}github.com/niansia</a><a href="{HOME[loc]}">{svg("globe")}niansia.github.io</a></p></div>
<div class="b-stats">{"".join(f"<div><b>{n}</b><span>{e(label)}</span></div>" for n, label in stats)}</div></section>
<h2>{e(U["glance"])}</h2><ul class="b-glance">{"".join(f"<li>{e(x)}</li>" for x in glance)}</ul>
<h2>{e(U["interests"])}</h2><div class="b-two">{"".join(f'<div class="b-q"><b>{e(a)}</b><p>{e(b)}</p></div>' for a, b in interests)}</div>
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
        out.write_text(shell(loc=loc, title=f'Niansia · {U["title"]}', desc=U["desc"], url=base, og=f"/assets/og/brief-{seg}.jpg", alternates=alts, body=body,
                             jsonld=ld, crumbs=" / brief", og_type="profile", extra_css=BRIEF_CSS, scripts=("/assets/js/static-pages.js",), top_extra=actions), encoding="utf-8")
        urls.append(base)
    return urls


# ------------------------------------------------------------------------------------------------ paper project pages
PAPER_UI = {
    "en": {"tldr": "TL;DR", "abstract": "Abstract", "cite": "Citation", "copy": "Copy", "copied": "Copied", "compare": "Drag to compare",
           "blind": "Anonymous submission", "blindBody": "This paper is under double-blind review. The title, authors and materials will appear here after the decision.",
           "after": "available after review", "template": "Template preview: this page is not linked from the site and is hidden from search engines. Replace the draft entry in assets/js/publications-data.js.",
           "papers": "All papers", "brief": "One-page brief", "status": {"published": "Published", "accepted": "Accepted", "preprint": "Preprint", "under-review": "Under review", "in-prep": "In preparation"},
           "links": {"paper": "Paper", "arxiv": "arXiv", "code": "Code", "video": "Video", "slides": "Slides", "poster": "Poster"}, "affil": "Affiliations"},
    "zh-TW": {"tldr": "一句話摘要", "abstract": "摘要", "cite": "引用", "copy": "複製", "copied": "已複製", "compare": "拖曳比較",
              "blind": "匿名投稿", "blindBody": "這篇論文正在雙盲審查中。標題、作者與相關資料會在結果公布後放在這裡。",
              "after": "審查結束後公開", "template": "範本預覽：這一頁沒有從網站連結，也不會被搜尋引擎收錄。請替換 assets/js/publications-data.js 裡的草稿條目。",
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
    for folder in ("notes_src", "log_src", "statement_src", "papers_src"):
        for f in (ROOT / folder).rglob("*"):
            if f.is_file():
                privacy_lint(str(f.relative_to(ROOT)), f.name + ("\n" + f.read_text(encoding="utf-8") if f.suffix == ".md" else ""))


def lint_sources_and_output() -> None:
    """Refuse to publish if any source or generated page carries something private (see content_safety.FORBIDDEN)."""
    lint_sources()
    for folder in ("notes", "log", "statement", "p", "brief", "paper"):
        for f in (ROOT / folder).rglob("*.html"):
            privacy_lint(str(f.relative_to(ROOT)), f.read_text(encoding="utf-8"))
    for rel in ("assets/js/notes-data.js", "assets/js/publications-data.js"):
        privacy_lint(rel, (ROOT / rel).read_text(encoding="utf-8"))


# ------------------------------------------------------------------------------------------------ share pages
HERO = {"lumigrid": "/assets/work/cards/lumigrid.jpg", "taiwan-exam": "/assets/work/taiwan-exam-social-preview.png", "kcrashlab": "/assets/work/cards/kcrashlab.jpg",
        "contextsec": "/assets/work/contextsec-decision-flow.svg", "merriv": "/assets/work/cards/merriv.jpg", "ai-repo-gardener": "/assets/work/ai-repo-gardener-demo.gif",
        "noveltyaudit": "/assets/work/cards/noveltyaudit.jpg", "research-meeting-coach": "/assets/work/research-meeting-coach.png", "chromarecover": "/assets/work/cards/chromarecover.jpg"}
EXTRA = {"lumigrid": [("demo", "/lab/lumigrid/?lang={loc}"), ("film", "/assets/film/lumigrid.html?lang={loc}")],
         "taiwan-exam": [("film", "/assets/film/taiwan-exam.html?lang={loc}")]}


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
        body = (f'<div class="k"><b>niansia.github.io</b> / projects</div><div class="t{" small" if len(k["title"]) > 14 else ""}">{e(k["title"])}</div>'
                f'<div class="c" style="top:{250 if len(k["title"]) <= 14 else 270}px">' + "".join(f"<span>{e(x)}</span>" for x in k["chips"]) + "</div>"
                f'<div class="d" style="top:{320 if len(k["title"]) <= 14 else 340}px">{e(k["desc"])}</div>{img}'
                f'<div class="f"><b>Niansia</b> · AI security × CV × VLM</div>')
    elif kind == "note":
        body = (f'<div class="k"><b>niansia.github.io</b> / notes</div><div class="t small" style="width:1060px;font-size:54px">{e(k["title"])}</div>'
                f'<div class="d" style="top:330px;width:1000px;-webkit-line-clamp:3">{e(k["desc"])}</div>'
                f'<div class="f"><b>Niansia</b> · {e(k["label"])} · {e(k["date"])}</div>')
    elif kind == "home":
        body = (f'<div class="halo"></div><img class="yuki" src="{k["yuki"]}"><div class="k"><b>~/niansia</b> $ whoami</div>'
                f'<div class="t" style="font-size:104px;top:110px">Niansia</div><div class="d" style="top:250px;font-weight:700;color:#2a2230;font-size:26px">{e(k["role"])}</div>'
                f'<div class="c" style="top:310px">' + "".join(f"<span>{e(x)}</span>" for x in k["chips"]) + "</div>"
                f'<div class="d" style="top:392px;width:560px">{e(k["desc"])}</div><div class="f"><b>niansia.github.io</b></div>')
    else:  # film / demo: full-bleed image with a caption strip
        body = (f'<div style="position:absolute;inset:0;background:#000 url({k["img"]}) center/cover"></div>'
                f'<div style="position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(transparent,#000d)"></div>'
                + ('<div class="play"></div>' if kind == "film" else "") +
                f'<div class="t small" style="top:auto;bottom:92px;width:1080px;color:#fff">{e(k["title"])}</div>'
                f'<div class="f" style="color:#ddd;bottom:48px"><b style="color:#fff">niansia.github.io</b> · {e(k["sub"])}</div>')
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
                                             img=uri(img) if img else None, cover=p["id"] == "lumigrid")))
    for seg, loc in LANGS.items():
        for slug, by in notes.items():
            n = by[loc]
            jobs.append((f"note-{slug}-{seg}", og_page("note", title=n["title"], desc=n["description"], date=n["date"], label=UI[loc]["notes"])))
        jobs.append((f"notes-{seg}", og_page("note", title=UI[loc]["notes"], desc=UI[loc]["notes_lede"], date=str(date.today()), label="niansia.github.io")))
        jobs.append((f"log-{seg}", og_page("note", title=UI[loc]["log"], desc=UI[loc]["log_lede"], date=str(date.today()), label="niansia.github.io")))
        st = parse_note(ROOT / "statement_src" / ("statement.en.md" if loc == "en" else "statement.zh-TW.md"))
        jobs.append((f"statement-{seg}", og_page("note", title=s_fix(st["title"]) if loc == "zh-CN" else st["title"],
                                                  desc=s_fix(st["description"]) if loc == "zh-CN" else st["description"], date=st["date"], label=UI[loc]["statement"])))
    roles = {"en": ("M.S. student in Computer Science · NYCU", ["AI Security", "Computer Vision", "VLMs"], "An interactive terminal portfolio: research tools, a browser-run CV model, films and notes."),
             "zh-tw": ("陽明交大資工碩士生", ["AI 安全", "電腦視覺", "視覺語言模型"], "互動式終端作品集：研究工具、在瀏覽器執行的電腦視覺模型、動畫與研究筆記。"),
             "zh-cn": ("阳明交大资工硕士生", ["AI 安全", "计算机视觉", "视觉语言模型"], "互动式终端作品集：研究工具、在浏览器运行的计算机视觉模型、动画与研究笔记。")}
    for seg, (role, chips, desc) in roles.items():
        jobs.append((f"site-{seg}", og_page("home", role=role, chips=chips, desc=desc, yuki=uri("/assets/og/yuki-researcher.png"))))
    for seg, loc in LANGS.items():
        jobs.append((f"brief-{seg}", og_page("note", title=f'Niansia · {BRIEF_UI[loc]["title"]}', desc=BRIEF_UI[loc]["desc"], date=str(date.today()), label="niansia.github.io/brief")))
    for p in (pubs or {}).get("papers", []):
        if p.get("page"):
            hidden = is_hidden(p)
            teaser = (p.get("teaser") or {}).get("src")
            jobs.append((f"paper-{p['id']}", og_page("project", title=PAPER_UI["en"]["blind"] if hidden else pick(p.get("title"), "en"),
                                                  chips=[p.get("venue", ""), PAPER_UI["en"]["status"].get(p.get("status"), "")],
                                                  desc=PAPER_UI["en"]["blindBody"] if hidden else pick(p.get("tldr"), "en"),
                                                  img=uri(teaser) if teaser and not hidden else None, cover=True)))
    jobs.append(("lumigrid-demo", og_page("demo", img=uri("/assets/work/cards/lumigrid.jpg"), title="Try LumiGrid in your browser", sub="low-light enhancement · runs on your device")))
    jobs.append(("film-lumigrid", og_page("film", img=uri("/assets/lumigrid/teaser-poster.jpg"), title="LumiGrid · one continuous take", sub="computer vision film")))
    jobs.append(("film-taiwan-exam", og_page("film", img=uri("/assets/taiwan-exam/teaser-poster.jpg"), title="Taiwan Exam · trailer", sub="an Agent Skill for GSAT practice exams")))
    jobs.append(("film-capstone", og_page("film", img=uri("/assets/film/teaser-poster.jpg"), title="Detecting propaganda with generative AI", sub="undergraduate capstone film")))
    return jobs


# ------------------------------------------------------------------------------------------------ sitemap / robots
def write_sitemap(urls: list[str]) -> None:
    today = date.today().isoformat()
    body = "".join(f"<url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>\n" for u in ["/lab/lumigrid/", *urls])
    (ROOT / "sitemap-extra.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}</urlset>\n', encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\nSitemap: {SITE}/sitemap-extra.xml\n", encoding="utf-8")


if __name__ == "__main__":
    projects, notes, log = load_projects(), load_notes(), load_log()
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
        data_file = ROOT / "assets/js/notes-data.js"
        data_file.write_text(data_file.read_text(encoding="utf-8")
                             + "window.NIANSIA_LOG = " + json.dumps(log_data, ensure_ascii=False, indent=1) + ";\n"
                             + "window.NIANSIA_STATEMENT = " + json.dumps(st_data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
        lint_sources_and_output()
    except UnsafeContent as err:
        sys.exit(f"REFUSED TO BUILD: {err}")
    write_sitemap(urls)
    if "--no-og" not in sys.argv:
        jobs = og_jobs(projects, notes, pubs)
        if "--og-missing" in sys.argv:
            jobs = [j for j in jobs if not (ROOT / "assets" / "og" / f"{j[0]}.jpg").exists()]
        asyncio.run(render_og(jobs))
    print(f"notes: {len(notes)} x {len(LANGS)} · share pages: {sum(len(v) for v in projects.values())} · urls: {len(urls)}")
