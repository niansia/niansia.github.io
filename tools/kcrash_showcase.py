"""Build assets/kcrashlab/showcase.json, the data behind the KCrashLab project page, from the evidence recorded in the
KCrashLab repository (results/recorded/). Every file read is first checked against that bundle's manifest.sha256, so the
page can only show numbers the repository itself vouches for; nothing here is typed in by hand.

    python tools/kcrash_showcase.py [path to a KCrashLab checkout]    (default: ../KCrashLab)
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "KCrashLab"
REC = REPO / "results" / "recorded"
OUT = ROOT / "assets" / "kcrashlab" / "showcase.json"


def manifest(bundle: str) -> dict[str, str]:
    lines = (REC / bundle / "manifest.sha256").read_text(encoding="utf-8").splitlines()
    return {name.strip(): digest for digest, name in (l.split(None, 1) for l in lines if l.strip())}


def read(bundle: str, rel: str) -> str:
    """The file's text, after its SHA-256 matched the bundle manifest (a CRLF checkout is compared as LF)."""
    want = manifest(bundle).get(rel)
    if not want:
        sys.exit(f"{bundle}/{rel} is not listed in its manifest")
    raw = (REC / bundle / rel).read_bytes()
    for data in (raw, raw.replace(b"\r\n", b"\n")):
        if hashlib.sha256(data).hexdigest() == want:
            return data.decode("utf-8")
    sys.exit(f"{bundle}/{rel} does not match manifest.sha256; refusing to publish it")


def op(o: dict) -> dict:
    fields = o.get("fields") or {}
    return {"op": o["ioctl"], "f": " ".join(f"{k}={v}" for k, v in sorted(fields.items()))}


def main() -> None:
    # G3: one seeded discovery campaign, execution by execution
    g3 = json.loads(read("g3", "summary.json"))
    rows = list(csv.DictReader(io.StringIO(read("g3", "metrics.csv"))))
    cov, corpus, fails, c, k = [], [], [], 0, 0
    for r in rows:
        c += int(r["novel_coverage"])
        k += r["added_to_corpus"] == "true"
        cov.append(c)
        corpus.append(k)
        if r["result_class"] != "COMPLETE":
            fails.append(int(r["execution"]))
    assert len(rows) == g3["executions"] and cov[-1] == g3["coverage_count"] and corpus[-1] == g3["corpus_count"]
    assert len(fails) == g3["raw_synthetic_failures"] and fails[0] == g3["findings"][0]["first_execution"]

    # M1: exact-signature minimization and 3/3 simulated replay
    b = "minimization-replay"
    dec = json.loads(read(b, "decision.json"))
    orig = json.loads(read(b, "inputs/original.case.json"))["operations"]
    mini = json.loads(read(b, "inputs/minimized.case.json"))["operations"]
    keep, i = [], 0   # which original operations survive (matched in order by operation name)
    for m in mini:
        while orig[i]["ioctl"] != m["ioctl"]:
            i += 1
        keep.append(i)
        i += 1
    events = json.loads(read(b, "runs/campaign-events.json"))
    finding = json.loads(read(b, "finding.json"))
    m = dec["minimization"]
    assert (m["original_operations"], m["minimized_operations"]) == (len(orig), len(mini))
    assert dec["replay"]["passed"] and finding["signature"] == g3["findings"][0]["signature"]

    # E1: the 2x2 policy ablation, 20 paired trials per strategy
    e1 = json.loads(read("e1", "summary.json"))

    prov = g3["provenance"]
    data = {
        "source": {"repo": "https://github.com/niansia/KCrashLab", "commit": prov["git_commit"], "engine": prov["engine_version"],
                   "mode": g3["execution_mode"]},
        "g3": {"budget": g3["budget"], "seed": g3["campaign_seed"], "cov": cov, "corpus": corpus, "fails": fails,
               "skips": g3["duplicate_candidate_skips"], "signatures": g3["exact_signatures"], "signature": g3["findings"][0]["signature"]},
        "min": {"original": [op(o) for o in orig], "minimized": [op(o) for o in mini], "keep": keep,
                "bytes": [m["original_bytes"], m["minimized_bytes"]], "attempts": m["oracle_attempts"], "max_attempts": m["maximum_oracle_attempts"]},
        "replay": [a["classification"] for a in dec["replay"]["attempts"]],
        "events": [{"to": events[0]["from_state"], "ms": 0}] + [{"to": e["to_state"], "ms": e["virtual_elapsed_ms"]} for e in events],
        "manifest": sorted(manifest(b)),
        "e1": {"trials": e1["trials_per_strategy"], "budget": e1["budget_per_trial"],
               "strategies": [{"id": s["strategy"], "rate": s["discovery_rate"], "median": s["median_first_finding_among_discoveries"]}
                              for s in e1["strategies"]]},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from {prov['git_commit'][:12]}")


if __name__ == "__main__":
    main()
