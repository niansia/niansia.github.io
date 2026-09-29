"""Run every ChromaRecover gallery case in a real browser (the lab's own Web Worker: Pyodide + the published wheel) and
record how the results compare with the native run in assets/chromarecover/data.json.

Needs Playwright with Chrome (python -m pip install playwright) and network access to cdn.jsdelivr.net for Pyodide.
Run it after tools/chromarecover_showcase.py; the builder keeps this block only while the wheel, configuration and
gallery are unchanged.

    python tools/chromarecover_parity.py
"""
from __future__ import annotations

import asyncio
import functools
import http.server
import json
import threading
from datetime import date
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets" / "chromarecover" / "data.json"

RUN_ALL = """async ({wheel, gallery}) => {
  const w = new Worker('/assets/chromarecover/engine.js');
  const waiters = {};
  let ready;
  const readyP = new Promise((resolve, reject) => ready = {resolve, reject});
  w.onmessage = ({data: m}) => {
    if (m.type === 'ready') ready.resolve(m);
    else if (m.type === 'error' && m.id === undefined) ready.reject(new Error(m.message));
    else if (m.type === 'result' || m.type === 'error') waiters[m.id](m);
  };
  w.postMessage({type: 'load', expected: wheel});
  const info = await readyP;
  const rows = [];
  for (const g of gallery) {
    const bytes = new Uint8Array(await (await fetch(`/assets/chromarecover/gallery/${g.id}/input.png`)).arrayBuffer());
    const m = await new Promise(r => { waiters[g.id] = r; w.postMessage({type: 'run', id: g.id, source: {kind: 'png', data: bytes}, options: {mode: g.mode, semantics: 'auto', top_k: 3}}); });
    if (m.type === 'error') { rows.push({id: g.id, error: m.message}); continue; }
    rows.push({id: g.id, status: m.summary.status, config: m.summary.config_fingerprint, ms: m.browser_ms,
               candidates: m.summary.candidates.map(c => ({source: c.source, decision: c.decision, capture: c.capture, structure: c.structure}))});
  }
  w.terminate();
  return {versions: info.versions, sha256: info.sha256, rows};
}"""


def serve(port: int) -> http.server.ThreadingHTTPServer:
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


async def main() -> None:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    server = serve(8791)
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(channel="chrome")
            page = await browser.new_page()
            await page.goto("http://127.0.0.1:8791/lab/chromarecover/")
            page.set_default_timeout(900_000)
            got = await page.evaluate(RUN_ALL, {"wheel": {"file": data["wheel"]["file"], "sha256": data["wheel"]["sha256"]},
                                                "gallery": [{"id": g["id"], "mode": g["mode"]} for g in data["gallery"]]})
            await browser.close()
    finally:
        server.shutdown()
    # three levels: the status, the best candidate (hypothesis + decision confidence to 6 decimals), every candidate
    cases = []
    for native, live in zip(data["gallery"], got["rows"]):
        if "error" in live:
            raise SystemExit(f"{native['id']} failed in the browser: {live['error']}")
        nc, lc = native["candidates"], live["candidates"]
        if live["config"] != data["config"]["fingerprint"]:
            raise SystemExit(f"{native['id']}: the browser used config {live['config']}, the native run {data['config']['fingerprint']}")
        pairs = list(zip(nc, lc))
        cases.append({"id": native["id"], "status": native["status"] == live["status"],
                      "best": (not nc and not lc) or bool(nc and lc and nc[0]["source"] == lc[0]["source"] and nc[0]["decision"] == lc[0]["decision"]),
                      "all": len(nc) == len(lc) and all(a["source"] == b["source"] and a["decision"] == b["decision"] for a, b in pairs),
                      "max_abs_diff": round(max((abs(a["decision"] - b["decision"]) for a, b in pairs), default=0.0), 6),
                      "native": [native["status"], nc[0]["decision"] if nc else None], "browser": [live["status"], lc[0]["decision"] if lc else None], "browser_ms": live["ms"]})
    count = lambda key: sum(c[key] for c in cases)
    data["parity"] = {"run": date.today().isoformat(), "browser": "Chrome (headless)", "versions": got["versions"], "sha256_verified": got["sha256"] == data["wheel"]["sha256"],
                      "total": len(cases), "status_same": count("status"), "best_same": count("best"), "all_same": count("all"),
                      "max_abs_diff": max(c["max_abs_diff"] for c in cases), "cases": cases}
    DATA.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    P = data["parity"]
    print(f"parity over {P['total']} cases: status {P['status_same']}, best candidate {P['best_same']}, every candidate {P['all_same']}; "
          f"largest decision difference {P['max_abs_diff']}; browser OpenCV {got['versions']['opencv']} vs native {data['native']['opencv']}")


if __name__ == "__main__":
    asyncio.run(main())
