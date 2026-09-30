"""Quarto post-render step (project.post-render in _quarto.yml): give the six terminal pages, home and /work/ in
three languages, a canonical URL and hreflang alternates, and list them in sitemap.xml by their clean URLs.

Quarto writes neither tag for these pages, and its sitemap names the index.html files (/zh-tw/index.html), so Google
saw two URLs for every page and no link between the language versions. The static pages written by
tools/build_static.py already carry the same tags. The script is idempotent, so partial renders can rerun it.

It also slims what Quarto ships with every page. The pages are the terminal app, which uses none of Bootstrap's
JavaScript, its icon font or Quarto's hover previews, so those tags are removed; and the Bootstrap stylesheet (styles.scss
compiled on top of the whole of Bootstrap, about 740 KB) loses every rule whose class or id appears nowhere in the
rendered pages, the site's scripts or styles.scss (see purge_css).
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
# Quarto assets the terminal pages never use: Bootstrap's JavaScript and icon font, and the tooltip library behind
# hover previews (turned off in _quarto.yml, but Quarto still links it).
UNUSED = re.compile(r'<script src="[^"]*site_libs/(?:bootstrap/bootstrap\.min\.js|quarto-html/popper\.min\.js|quarto-html/tippy\.umd\.min\.js)"></script>\n?'
                    r'|<link href="[^"]*site_libs/(?:bootstrap/bootstrap-icons\.css|quarto-html/tippy\.css)" rel="stylesheet">\n?')


def trim_unused(html: str) -> str:
    return UNUSED.sub("", html)


# ------------------------------------------------------------------------------------------------ stylesheet purge
FUNCTIONAL = re.compile(r":(?:not|is|where|has|matches|-webkit-any|-moz-any)\((?:[^()]|\([^()]*\))*\)")
VERBATIM = ("@keyframes", "@-webkit-keyframes", "@font-face", "@page", "@property", "@counter-style", "@font-feature-values")


def split_top(text: str, sep: str = ",") -> list[str]:
    """Split a selector list at the separators that are not inside brackets or strings."""
    parts, depth, quote, cur = [], 0, "", []
    for ch in text:
        if quote:
            quote = "" if ch == quote else quote
        elif ch in "\"'":
            quote = ch
        elif ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        elif ch == sep and depth == 0:
            parts.append("".join(cur))
            cur = []
            continue
        cur.append(ch)
    parts.append("".join(cur))
    return parts


def block_end(css: str, i: int) -> int:
    """Index just past the '}' closing the block whose '{' is at css[i]."""
    depth, quote = 0, ""
    while i < len(css):
        ch = css[i]
        if quote:
            if ch == "\\":
                i += 1
            elif ch == quote:
                quote = ""
        elif ch in "\"'":
            quote = ch
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("unbalanced stylesheet")


def purge(css: str, used: set[str]) -> str:
    """Drop the selectors that name a class or id absent from `used`; drop a rule when none of its selectors is left.
    Classes inside :not(), :is(), :where() and :has(), and attribute selectors, never count as required."""
    out, i = [], 0
    while i < len(css):
        if css.startswith("/*", i):
            j = css.index("*/", i) + 2
            if css.startswith("/*!", i):          # licence banners stay
                out.append(css[i:j])
            i = j
            continue
        brace, semi = css.find("{", i), css.find(";", i)
        if brace < 0:
            out.append(css[i:])
            break
        if 0 <= semi < brace and css[i:semi].lstrip().startswith("@"):   # @charset, @import, @layer a, b;
            out.append(css[i:semi + 1])
            i = semi + 1
            continue
        prelude, end = css[i:brace].strip(), block_end(css, brace)
        if prelude.startswith("@"):
            if prelude.startswith(VERBATIM):
                out.append(css[i:end].strip())
            else:                                  # @media, @supports, @container, @layer {...}: purge inside
                inner = purge(css[brace + 1:end - 1], used)
                if inner.strip():
                    out.append(f"{prelude}{{{inner}}}")
        elif "\\" in prelude:
            out.append(css[i:end].strip())
        else:
            keep = [s for s in split_top(prelude)
                    if all(name in used for name in re.findall(r"[.#](-?[_a-zA-Z][\w-]*)", re.sub(r"\[[^\]]*\]", "", FUNCTIONAL.sub("", s))))]
            if keep:
                out.append(",".join(k.strip() for k in keep) + css[brace:end])
        i = end
    return "".join(out)


def purge_css() -> None:
    pages = [p for p in OUT.rglob("*.html") if 'id="quarto-bootstrap"' in p.read_text(encoding="utf-8", errors="ignore")]
    sheets = {m for p in pages for m in re.findall(r'href="([^"]*site_libs/bootstrap/bootstrap-[0-9a-f]+\.min\.css)"', p.read_text(encoding="utf-8"))}
    corpus = [p.read_text(encoding="utf-8") for p in pages]
    corpus += [p.read_text(encoding="utf-8", errors="ignore") for p in [*(OUT / "assets" / "js").glob("*.js"), *(OUT / "site_libs").rglob("*.js")]]
    corpus.append((ROOT / "styles.scss").read_text(encoding="utf-8"))
    used = set(re.findall(r"[A-Za-z0-9_-]+", "\n".join(corpus)))
    for name in {Path(s).name for s in sheets}:
        path = OUT / "site_libs" / "bootstrap" / name
        css = path.read_text(encoding="utf-8")
        path.write_text(purge(css, used), encoding="utf-8")


def main() -> None:
    for path in OUT.rglob("*.html"):
        html = path.read_text(encoding="utf-8")
        if 'id="quarto-bootstrap"' in html and UNUSED.search(html):
            path.write_text(trim_unused(html), encoding="utf-8")
    purge_css()
    for page in PAGES:
        links = "".join(f'<link rel="alternate" hreflang="{code}" href="{SITE}/{prefix}{page}">' for code, prefix in LANGS)
        links += f'<link rel="alternate" hreflang="x-default" href="{SITE}/{page}">'
        for _, prefix in LANGS:
            path = OUT / prefix / page / "index.html"
            if not path.is_file():
                continue
            html = path.read_text(encoding="utf-8")
            html = re.sub(rf"{re.escape(MARK)}.*?{re.escape(MARK)}\n?", "", html, flags=re.S)
            # Quarto makes the icon links relative (../assets/icons/…); the terminal switches language with pushState
            # (/ -> /zh-tw/), after which the browser refetched them from a path that does not exist.
            html = re.sub(r'(<link rel="(?:icon|apple-touch-icon)" href=")(?:\.\./|\./)*(assets/icons/)', r"\1/\2", html)
            url = f"{SITE}/{prefix}{page}"
            block = f'{MARK}<link rel="canonical" href="{url}"><meta property="og:url" content="{url}">{links}{MARK}\n'
            path.write_text(html.replace("</head>", block + "</head>", 1), encoding="utf-8")
    sitemap = OUT / "sitemap.xml"
    if sitemap.is_file():
        text = re.sub(r"(<loc>[^<]*/)index\.html</loc>", r"\1</loc>", sitemap.read_text(encoding="utf-8"))
        # Search Console reads sitemap.xml but kept reporting sitemap-extra.xml as "couldn't fetch", so the static
        # pages from tools/build_static.py are listed in the main sitemap as well
        extra = OUT / "sitemap-extra.xml"
        if extra.is_file():
            known = set(re.findall(r"<loc>([^<]+)</loc>", text))
            urls = [u for u in re.findall(r"<url>.*?</url>", extra.read_text(encoding="utf-8"), flags=re.S)
                    if re.search(r"<loc>([^<]+)</loc>", u).group(1) not in known]
            text = text.replace("</urlset>", "".join(f"  {u}\n" for u in urls) + "</urlset>", 1)
        # a partial render re-adds .../index.html next to the entry cleaned earlier; keep the first of each URL
        seen = set()

        def once(m: re.Match) -> str:
            loc = re.search(r"<loc>([^<]+)</loc>", m.group(0)).group(1)
            if loc in seen:
                return ""
            seen.add(loc)
            return m.group(0)

        text = re.sub(r"[ \t]*<url>.*?</url>\n?", once, text, flags=re.S)
        sitemap.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
