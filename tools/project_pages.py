"""Read each project's showcase out of the terminal portfolio, for the static project pages (/p/<id>/).

A project's long-form story (architecture, how a run goes, measured results) is written once, in the showcase code
of assets/js/lab-terminal.js, where it is drawn as interactive widgets inside a single-page app. Search engines index
none of it: the project views are #hash routes of one page. This tool opens every project view of the rendered site
in headless Chrome with animation off, waits for the showcase to finish drawing, and reads it back as headings,
paragraphs, lists, tables and figures. Text is kept as structured runs (plain, bold, code, link), never as raw HTML,
so tools/build_static.py escapes everything it writes. Interactive widgets (replays, sliders, films) are replaced by
a marker that the page renders as a link to the interactive version.

Run after `quarto render`, whenever a showcase or its data changes, then rebuild the static pages:
    python tools/project_pages.py           # writes projects_src/showcase.json
    python tools/build_static.py --no-og
"""
from __future__ import annotations

import functools
import http.server
import json
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "_site"
OUT = ROOT / "projects_src" / "showcase.json"
HOMES = {"en": "/", "zh-TW": "/zh-tw/", "zh-CN": "/zh-cn/"}

# Interactive parts of each showcase: each is replaced by one "open the interactive version" link.
WIDGETS = {
    "kcrashlab": [".kc-demo"],
    "lumigrid": [".lg-compare", ".lg-bar"],
    "chromarecover": [".cr-gal"],
}
# Parts left out without a marker (decoration, controls, data that only makes sense on screen).
DROP = {
    "*": [".cap-film", ".statement-card", ".kc-src", ".kc-legend"],
}

EXTRACT = r"""
(cfg) => {
  const detail = document.querySelector('.project-detail');
  if (!detail) return null;
  for (const sel of cfg.widgets) detail.querySelectorAll(sel).forEach(el => el.setAttribute('data-x-widget', ''));
  const HIDE = ['button', '[role=tablist]', '[role=tab]', 'svg', 'canvas', 'video', 'audio', 'input', 'select', 'textarea',
                'script', 'style', 'template', 'noscript', '[aria-hidden="true"]', '.sr-only', '.visually-hidden', ...cfg.drop].join(',');
  const shown = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && !el.matches(HIDE); };
  const href = url => { try { const u = new URL(url, location.href); return u.origin === location.origin ? u.pathname + u.search + u.hash : u.href; } catch { return ''; } };
  const BLOCKY = 'p,h1,h2,h3,h4,h5,h6,ol,ul,dl,table,img,figure,section,article,blockquote,pre,div,li';

  // Inline text of one element, as segments of runs [{k:'t'|'b'|'c', s, h?}]: every block-level box inside it starts a
  // new segment (a card's title, its caption, a table cell drawn as a grid item).
  function segsOf(el) {
    const acc = [];
    const walk = (node, k, h) => {
      if (node.nodeType === 3) { acc.push({k, s: node.textContent, h}); return; }
      if (node.nodeType !== 1 || !shown(node)) return;
      if (node.tagName === 'BR') { acc.push(null); return; }
      const d = getComputedStyle(node).display, block = node !== el && !d.startsWith('inline') && d !== 'contents';
      if (block) acc.push(null);
      let kk = k, hh = h;
      if (/^(B|STRONG)$/.test(node.tagName)) kk = 'b';
      else if (/^(CODE|KBD|SAMP)$/.test(node.tagName)) kk = 'c';
      if (node.tagName === 'A' && node.getAttribute('href')) hh = href(node.getAttribute('href'));
      for (const c of node.childNodes) walk(c, kk, hh);
      if (block) acc.push(null);
    };
    walk(el, 't', null);
    const segs = [[]];
    for (const r of acc) {
      if (r === null) { if (segs[segs.length - 1].length) segs.push([]); continue; }
      const s = r.s.replace(/\s+/g, ' ');
      if (!s) continue;
      const seg = segs[segs.length - 1], last = seg[seg.length - 1];
      if (last && last.k === r.k && last.h === r.h) last.s += s; else seg.push({k: r.k, s, h: r.h});
    }
    const clean = segs.map(seg => {
      while (seg.length && !seg[0].s.trim()) seg.shift();
      while (seg.length && !seg[seg.length - 1].s.trim()) seg.pop();
      if (seg.length) { seg[0].s = seg[0].s.replace(/^\s+/, ''); seg[seg.length - 1].s = seg[seg.length - 1].s.replace(/\s+$/, ''); }
      return seg.map(r => (r.h ? {k: r.k, s: r.s, h: r.h} : {k: r.k, s: r.s}));
    }).filter(seg => seg.length && !/^[↗→←↵›✦◐·•\s]*$/.test(seg.map(r => r.s).join('')));
    // a leading "1", "02"… is the numbering badge of a card: the list already numbers it
    if (clean.length > 1 && /^\d{1,2}$/.test(clean[0].map(r => r.s).join('').trim())) clean.shift();
    return clean;
  }
  // Segments joined into one line: " — " after a bold lead ("Case IR — each input becomes…"), " · " otherwise.
  // A segment that is only an operator ("+", "=", "→", "{"…) was part of a drawn formula and joins with plain spaces.
  function join(segs) {
    const out = [], op = seg => /^[+=→×{}()\[\]]$/.test(seg.map(r => r.s).join('').trim());
    segs.forEach((seg, i) => {
      if (i) out.push({k: 't', s: op(seg) || op(segs[i - 1]) ? ' ' : i === 1 && segs[0].length === 1 && segs[0][0].k === 'b' ? ' — ' : ' · '});
      out.push(...seg);
    });
    return out;
  }
  const runsOf = el => join(segsOf(el));
  const leaf = el => ![...el.querySelectorAll(BLOCKY)].some(shown);
  const out = [];
  function blocks(nodes) {
    for (const node of nodes) {
      if (node.nodeType === 3) { if (node.textContent.trim()) out.push({t: 'row', key: '#text', segs: [[{k: 't', s: node.textContent.trim().replace(/\s+/g, ' ')}]]}); continue; }
      if (node.nodeType !== 1) continue;
      if (node.hasAttribute('data-x-widget')) { if (out.length && out[out.length - 1].t !== 'cta') out.push({t: 'cta'}); continue; }
      if (!shown(node)) continue;
      const tag = node.tagName;
      if (/^H[1-6]$/.test(tag)) { const r = runsOf(node); if (r.length) out.push({t: tag === 'H2' ? 'h2' : 'h3', runs: r}); continue; }
      if (tag === 'OL' || tag === 'UL') {
        const items = [...node.children].filter(shown).map(runsOf).filter(r => r.length);
        if (items.length) out.push({t: tag.toLowerCase(), items});
        continue;
      }
      if (tag === 'DL') {
        const items = []; let cur = null;
        for (const c of node.children) {
          if (!shown(c)) continue;
          if (c.tagName === 'DT') { cur = [{k: 'b', s: c.innerText.trim()}]; items.push(cur); }
          else if (c.tagName === 'DD' && cur) cur.push({k: 't', s: ' — '}, ...runsOf(c));
        }
        if (items.length) out.push({t: 'ul', items});
        continue;
      }
      if (tag === 'TABLE') {
        const rows = [...node.rows].filter(shown).map(tr => [...tr.cells].filter(shown).map(td => ({th: td.tagName === 'TH', runs: runsOf(td)})));
        const cap = node.caption && shown(node.caption) ? runsOf(node.caption) : [];
        if (rows.length) out.push({t: 'table', rows, caption: cap});
        continue;
      }
      if (tag === 'IMG' || tag === 'FIGURE') {
        const img = tag === 'IMG' ? node : node.querySelector('img');
        const src = img && href(img.currentSrc || img.src);
        if (img && src.startsWith('/assets/') && img.naturalWidth >= 240 && img.getBoundingClientRect().width >= 160) {
          const fc = tag === 'FIGURE' && node.querySelector('figcaption');
          out.push({t: 'img', src, alt: img.alt || '', w: img.naturalWidth, h: img.naturalHeight, caption: fc && shown(fc) ? runsOf(fc) : []});
        }
        continue;
      }
      if (tag === 'PRE') {
        const lines = node.innerText.replace(/\s+$/, '').split('\n');
        if (lines.join('').trim()) out.push({t: 'pre', s: lines.slice(0, cfg.preLines).join('\n') + (lines.length > cfg.preLines ? '\n…' : '')});
        continue;
      }
      // A box made only of repeated structured items (cards with a title and a caption, pairs, tiles) is a list, not one long line.
      const kids = [...node.children].filter(shown);
      if (tag !== 'P' && kids.length >= 2 && kids.every(k => k.tagName === kids[0].tagName && k.classList[0] === kids[0].classList[0]
          && !getComputedStyle(k).display.startsWith('inline') && segsOf(k).length >= 2)) {
        blocks(kids);
        continue;
      }
      if (/^(P|BLOCKQUOTE|FIGCAPTION)$/.test(tag) || leaf(node)) {
        const segs = segsOf(node);
        if (segs.length) out.push({t: 'row', key: tag + '.' + (node.classList[0] || ''), p: tag === 'P', head: /head/.test(node.className), segs});
        continue;
      }
      blocks(node.childNodes);
    }
  }
  // The showcase sits between the project's description and the "Evidence" heading that closes every project page.
  let started = false;
  for (const node of [...detail.children]) {
    if (node.classList.contains('project-description')) { started = true; continue; }
    if (!started) continue;
    if (node.tagName === 'H2') break;
    blocks([node]);
  }
  // Consecutive rows of the same kind read as one block: rows that all split into the same number (3 or more) of
  // cells were a table drawn with CSS grid; other runs of cards, bars or tiles become a list; a single row is a paragraph.
  const merged = [];
  for (const b of out) {
    const prev = merged[merged.length - 1];
    if (b.t === 'row' && !b.p && prev && prev.t === 'group' && prev.key === b.key) { prev.rows.push(b); continue; }
    merged.push(b.t === 'row' && !b.p ? {t: 'group', key: b.key, rows: [b]} : b);
  }
  const level = b => (b.t === 'h2' ? 2 : b.t === 'h3' ? 3 : 9);
  for (let i = merged.length - 1; i >= 0; i--)
    if (level(merged[i]) < 9 && (i === merged.length - 1 || level(merged[i + 1]) <= level(merged[i]))) merged.splice(i, 1);
  return merged.map(b => {
    if (b.t === 'row') return {t: 'p', runs: join(b.segs)};
    if (b.t !== 'group') return b;
    const n = b.rows[0].segs.length;
    if (b.rows.length >= 3 && n >= 3 && b.rows.every(r => r.segs.length === n))
      return {t: 'table', caption: [], rows: b.rows.map((r, i) => r.segs.map(c => ({th: !!(r.head && i === 0), runs: c})))};
    return b.rows.length > 1 ? {t: 'ul', items: b.rows.map(r => join(r.segs))} : {t: 'p', runs: join(b.rows[0].segs)};
  });
}
"""

INIT = """try{localStorage.setItem('niansia-motion-parts',JSON.stringify({ui:false,cursor:false,yuki:false,pages:false}));
localStorage.setItem('niansia-motion','off');sessionStorage.setItem('niansia-booted','1');}catch(e){}"""


def serve() -> tuple[http.server.ThreadingHTTPServer, str]:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(SITE_DIR)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://localhost:{httpd.server_address[1]}"


def project_ids() -> list[str]:
    import subprocess
    js = "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.NIANSIA_PROJECTS.en.map(p=>p.id)))"
    return json.loads(subprocess.run(["node", "-e", js, str(ROOT / "assets/js/portfolio-data.js")], capture_output=True, check=True).stdout)


def main() -> None:
    if not (SITE_DIR / "index.html").is_file():
        sys.exit("Render the site first (quarto render): this tool reads the terminal from _site/.")
    only = [a for a in sys.argv[1:] if not a.startswith("-")]
    ids = [i for i in project_ids() if not only or i in only]
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.is_file() and only else {}
    httpd, base = serve()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(channel="chrome")
            ctx = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
            ctx.add_init_script(INIT)
            for pid in ids:
                for loc, home in HOMES.items():
                    page = ctx.new_page()
                    page.goto(f"{base}{home}#projects/{pid}")
                    page.wait_for_selector(".project-detail h1", timeout=30000)
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(1500)
                    cfg = {"widgets": WIDGETS.get(pid, []), "drop": DROP["*"] + DROP.get(pid, []), "preLines": 14}
                    blocks = page.evaluate(EXTRACT, cfg) or []
                    data.setdefault(pid, {})[loc] = blocks
                    page.close()
                n = len(data[pid]["en"])
                print(f"{pid:<24} {n:>3} blocks (en) · {len(data[pid]['zh-TW']):>3} (zh-TW) · {len(data[pid]['zh-CN']):>3} (zh-CN)")
            browser.close()
    finally:
        httpd.shutdown()
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
