"""Build the static, crawlable parts of the site that live outside the terminal app.

    notes_src/<slug>.<lang>.md  ->  notes/<lang>/<slug>/index.html, notes/<lang>/index.html, notes/index.html
    assets/js/portfolio-data.js ->  p/<id>/index.html (+ zh-tw/, zh-cn/) share pages
    open-graph images           ->  assets/og/*.jpg (1200 x 630, rendered with Playwright)
    sitemap-extra.xml, robots.txt, assets/js/notes-data.js

Requires: markdown, opencc (tw2sp), Pillow, Playwright (Chrome channel), Node.js.
Run from the repository root:  python tools/build_static.py [--no-og]
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

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://niansia.github.io"
LANGS = {"en": "en", "zh-tw": "zh-TW", "zh-cn": "zh-CN"}          # url segment -> locale
HTML_LANG = {"en": "en", "zh-TW": "zh-Hant", "zh-CN": "zh-Hans"}
HOME = {"en": "/", "zh-TW": "/zh-tw/", "zh-CN": "/zh-cn/"}
T2S = opencc.OpenCC("tw2sp")
S_FIX = {"缺省": "默认", "杂凑": "哈希", "笔电": "笔记本电脑", "影像": "图像", "信息工程": "资讯工程"}
EMAIL = "niansia930202@gmail.com"

UI = {
    "en": {"notes": "Research notes", "notes_lede": "Short, honest write-ups of what I built, what worked, and what did not.", "min": "min read",
           "back": "Back to the portfolio", "more": "More notes", "open": "Open the interactive portfolio", "repo": "Source", "evidence": "Evidence",
           "share_note": "This is a lightweight page for sharing. The full, interactive version lives in the terminal portfolio.", "contact": "Questions or ideas? Email",
           "demo": "Try it in your browser", "film": "Watch the film", "all": "All projects", "read": "Read", "online": "online", "visits": "visits"},
    "zh-TW": {"notes": "研究筆記", "notes_lede": "把做過的東西、有效的方法，還有沒成功的地方，誠實地寫下來。", "min": "分鐘閱讀",
              "back": "回到作品集", "more": "其他筆記", "open": "打開互動式作品集", "repo": "原始碼", "evidence": "佐證",
              "share_note": "這是方便分享的精簡頁面；完整、可互動的版本在終端作品集裡。", "contact": "有問題或想法？寫信到",
              "demo": "在瀏覽器試試", "film": "觀看動畫", "all": "全部作品", "read": "閱讀", "online": "人在線", "visits": "次造訪"},
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
footer{max-width:760px;margin:0 auto;padding:26px 20px 50px;border-top:1px solid var(--line);font-size:14px;color:var(--muted);}
"""
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500'
         '&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap">')


def shell(*, loc: str, title: str, desc: str, url: str, og: str, alternates: dict, body: str, jsonld: dict | None = None,
          crumbs: str = "", og_type: str = "article", noindex: bool = False) -> str:
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
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
{FONTS}
<style>{CSS}</style>
{ld}
<script defer src="/assets/js/site-stats.js"></script>
</head>
<body>
<header class="top"><a href="{HOME[loc]}"><b>~/niansia</b></a>{crumbs}<span class="sp"></span><span class="langs">{langs}</span></header>
{body}
<footer>{e(UI[loc]['contact'])} <a href="mailto:{EMAIL}">{EMAIL}</a> · <a href="{HOME[loc]}">niansia.github.io</a> · <a href="https://github.com/niansia">github.com/niansia</a><span class="stats" data-stats hidden> · <i class="live-dot"></i> <b data-stat="online">–</b> {e(UI[loc]['online'])} · <b data-stat="total">–</b> {e(UI[loc]['visits'])}</span></footer>
</body>
</html>
"""


PERSON = {"@type": "Person", "name": "Niansia", "url": f"{SITE}/", "email": f"mailto:{EMAIL}", "sameAs": ["https://github.com/niansia"]}


# ------------------------------------------------------------------------------------------------ notes
def build_notes(notes: dict) -> list[str]:
    urls = []
    md = lambda t: markdown.markdown(t, extensions=["tables", "fenced_code", "sane_lists"])
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
        '<!doctype html><html><head><meta charset="utf-8"><title>Research notes · Niansia</title><link rel="canonical" href="https://niansia.github.io/notes/en/">'
        '<meta name="robots" content="noindex,follow"><script>var l=(navigator.language||"").toLowerCase();'
        'location.replace("/notes/"+(/^zh-(cn|sg)/.test(l)?"zh-cn":/^zh/.test(l)?"zh-tw":"en")+"/");</script></head>'
        '<body><a href="/notes/en/">English</a> · <a href="/notes/zh-tw/">繁體中文</a> · <a href="/notes/zh-cn/">简体中文</a></body></html>', encoding="utf-8")
    data = {loc: [{"slug": s, "title": b[loc]["title"], "description": b[loc]["description"], "date": b[loc]["date"],
                   "minutes": read_minutes(b[loc]["body"], loc), "url": f"/notes/{seg}/{s}/"} for s, b in notes.items()] for seg, loc in LANGS.items()}
    (ROOT / "assets/js/notes-data.js").write_text("window.NIANSIA_NOTES = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return urls


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


def og_jobs(projects: dict, notes: dict) -> list[tuple[str, str]]:
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
    roles = {"en": ("M.S. student in Computer Science · NYCU", ["AI Security", "Computer Vision", "VLMs"], "An interactive terminal portfolio: research tools, a browser-run CV model, films and notes."),
             "zh-tw": ("陽明交大資工碩士生", ["AI 安全", "電腦視覺", "視覺語言模型"], "互動式終端作品集：研究工具、在瀏覽器執行的電腦視覺模型、動畫與研究筆記。"),
             "zh-cn": ("阳明交大资工硕士生", ["AI 安全", "计算机视觉", "视觉语言模型"], "互动式终端作品集：研究工具、在浏览器运行的计算机视觉模型、动画与研究笔记。")}
    for seg, (role, chips, desc) in roles.items():
        jobs.append((f"site-{seg}", og_page("home", role=role, chips=chips, desc=desc, yuki=uri("/assets/og/yuki-researcher.png"))))
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
    projects, notes = load_projects(), load_notes()
    urls = build_notes(notes) + build_share(projects)
    write_sitemap(urls)
    if "--no-og" not in sys.argv:
        asyncio.run(render_og(og_jobs(projects, notes)))
    print(f"notes: {len(notes)} x {len(LANGS)} · share pages: {sum(len(v) for v in projects.values())} · urls: {len(urls)}")
