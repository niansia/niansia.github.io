"""Build assets/contextsec/showcase.json, the data behind the ContextSec project page, by running ContextSec itself on the
sample products that ship in its repository (examples/ and tests/fixtures/) and on its offline benchmark suites.

Nothing on the page is typed in by hand: routing, compositions, ledger counts, gates, findings and benchmark numbers are
what this ContextSec checkout produced. The checkout must be clean so the recorded commit really is the code that ran.
ContextSec needs Python 3.11 or newer; pass one with --python when the default interpreter is older.

    python tools/contextsec_showcase.py [--repo ../ContextSec] [--python C:/path/to/python3.12.exe]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "contextsec" / "showcase.json"
AS_OF = "2026-09-29"   # fixed, so a rerun on unchanged code gives the same file (no waivers are involved)

# (id, repository-relative sample) in the order the page shows them
PRODUCTS = [("composite-saas", "examples/composite-saas"), ("next-static", "examples/next-static"), ("docs-noise", "tests/fixtures/docs-noise"),
            ("high-impact", "tests/fixtures/high-impact"), ("support-admin", "tests/fixtures/support-admin"), ("saas-oauth", "tests/fixtures/saas-oauth"),
            ("cicd-supply", "tests/fixtures/cicd-supply"), ("cloud-iam", "tests/fixtures/cloud-iam"), ("analytics-organization", "tests/fixtures/analytics-organization")]
TWINS = [("prose", "tests/fixtures/template-literal-negative"), ("expression", "tests/fixtures/template-expression-positive")]

REASONS = {"Universal foundation for every software repository.": "universal",
           "Applicable context is present with direct declaration or high-confidence evidence.": "evidence",
           "No reliable production evidence established applicability or absence.": "no-evidence",
           "Context evidence is present but needs confirmation before mandatory routing.": "needs-confirmation"}


def reason_code(text: str) -> list[str]:
    for prefix in ("Required dependency of ", "Candidate dependency of "):
        if text.startswith(prefix):
            return ["dependency", text[len(prefix):].rstrip(".")]
    if text not in REASONS:
        sys.exit(f"unrecognised routing reason, add it to REASONS: {text!r}")
    return [REASONS[text]]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(ROOT.parent / "ContextSec"))
    ap.add_argument("--python", default=sys.executable)
    a = ap.parse_args()
    repo = Path(a.repo).resolve()
    cli = repo / ".agents" / "skills" / "contextsec" / "scripts" / "contextsec.py"
    git = lambda *args: subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, check=True).stdout.strip()
    if git("status", "--porcelain"):
        sys.exit(f"{repo} has uncommitted changes; the page must name the exact code that produced it")
    commit = git("rev-parse", "HEAD")

    def run(*args: str, ok=(0,)) -> subprocess.CompletedProcess:
        r = subprocess.run([a.python, str(cli), *args], cwd=repo, capture_output=True, text=True, encoding="utf-8")
        if r.returncode not in ok:
            sys.exit(f"contextsec {' '.join(args[:1])} failed ({r.returncode}): {r.stderr.strip()[-400:]}")
        return r

    version = run("--version").stdout.strip().split()[-1]
    catalog = json.loads((repo / ".agents/skills/contextsec/references/catalog.json").read_text(encoding="utf-8"))
    comps = json.loads((repo / ".agents/skills/contextsec/references/compositions/catalog.json").read_text(encoding="utf-8"))

    def evaluate(rel: str, tmp: Path, full: bool = True) -> dict:
        prof, chk, gate = tmp / "p.json", tmp / "c.json", tmp / "g.json"
        run("profile", "--repo", rel, "--output", str(prof))
        p = json.loads(prof.read_text(encoding="utf-8"))
        out = {"repo": rel, "files": p["subject"]["files_scanned"], "bytes": p["subject"]["bytes_scanned"], "coverage": p["coverage"]["status"],
               "packs": {r["pack"]: [r["state"], *reason_code(r["reasons"][0])] for r in p["routing"]}}
        seen, ev = set(), []
        for o in sorted(p["observations"], key=lambda o: (o["evidence"]["path"], o["evidence"]["locator"], o["claim"])):
            key = (o["evidence"]["path"], o["evidence"]["locator"], o["claim"])
            if key not in seen:
                seen.add(key)
                ev.append({"p": o["evidence"]["path"], "l": o["evidence"]["locator"].removeprefix("line:"), "c": o["claim"], "d": o["detector"]["id"], "k": o["confidence"]})
        out["evidence"] = ev
        if not full:
            return out
        run("check", "--repo", rel, "--output", str(chk))
        run("gate", "--repo", rel, "--as-of", AS_OF, "--output", str(gate), ok=(0, 1))   # exit 1 means the gate blocked
        c, g = json.loads(chk.read_text(encoding="utf-8")), json.loads(gate.read_text(encoding="utf-8"))
        matrix = {}
        for row in g["ledger"]:
            matrix.setdefault(row["applicability"], {}).setdefault(row["verification"], 0)
            matrix[row["applicability"]][row["verification"]] += 1
        out.update({
            "gate": {"status": g["gate"]["status"], "blocking": len(g["gate"]["blocking_controls"]), "waived": len(g["gate"]["waived_controls"])},
            "controls": len(g["ledger"]), "matrix": matrix,
            "compositions": {row["control_id"]: row["applicability"] for row in g["ledger"] if row["source"]["type"] == "composition"},
            "findings": [{"checker": f["checker"]["id"], "status": f["status"], "severity": f["severity"], "path": f["evidence"]["path"],
                          "line": f["evidence"]["locator"].removeprefix("line:"), "controls": f["control_ids"], "title": f["title"], "attack": f["attack_path"]}
                         for f in c["findings"]],
        })
        return out

    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        products = [{"id": pid, **evaluate(rel, tmp)} for pid, rel in PRODUCTS]
        twins = []
        for tid, rel in TWINS:
            src = sorted(p for p in (repo / rel).rglob("*") if p.is_file())
            assert len(src) == 1, f"{rel} should hold one source file"
            e = evaluate(rel, tmp, full=False)
            twins.append({"id": tid, "repo": rel, "file": src[0].relative_to(repo / rel).as_posix(), "code": src[0].read_text(encoding="utf-8").strip(),
                          "required": [k for k, v in e["packs"].items() if v[0] == "required"]})
        b = json.loads(run("benchmark", "--suite", "all").stdout)
    s = b["suites"]
    reg, prof, mut, adv = s["regression"], s["profile"], s["mutation"], s["adversarial"]
    bench = {
        "regression": {"scenarios": reg["scenario_count"], "annotations": sum(reg["annotations"].values()),
                       "correct": sum(reg["annotations"].values()) if all(v == 1.0 for v in reg["metrics"].values()) else None},
        "profile": {"cases": prof["case_count"], "macro_f1": prof["metrics"]["macro_f1_positive_support"],
                    "false_required": prof["metrics"]["false_required_activation_count"], "safety_recall": prof["metrics"]["safety_critical_trigger_recall"]},
        "mutation": {"killed": mut["killed_mutations"], "eligible": mut["eligible_mutations"]},
        "adversarial": {"cases": adv["case_count"], "passed": sum(r["status"] == "pass" for r in adv["results"]),
                        "bytes": max(r["bytes"] for r in adv["results"]), "slowest": round(max(r["elapsed_seconds"] for r in adv["results"]), 1)},
        "status": b["status"],
    }
    data = {
        "source": {"repo": "https://github.com/niansia/ContextSec", "version": version, "commit": commit, "run": date.today().isoformat()},
        "packs": [{"id": p["id"], "controls": len(p["controls"])} for p in catalog["packs"]],
        "composition_rules": [{"id": r["id"], "requires": r["requires"], "severity": r["severity"]} for r in comps["rules"]],
        "products": products, "twins": twins, "bench": bench,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from ContextSec {version} @ {commit[:12]}")


if __name__ == "__main__":
    main()
