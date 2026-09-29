"""Build assets/noveltyaudit/showcase.json, the data behind the NoveltyAudit project page, by running NoveltyAudit's own
offline code: its committed synthetic fixture through validation, date gating, Minimal Prior Set search, bridge
detection and classification at several cutoffs; its validator on deliberately dishonest copies of that report; the
observation-window preflight on the public RAG case; and its test suite.

Live audits query scholarly providers; this script makes no network call. The fixture's papers A, B and C are
fictional. The case study's metadata is project-authored (no abstracts or full text). The 82-case numbers are the
aggregate summary committed in docs/, derived from TUdatalib 4988 under CC BY-NC 4.0, shown with attribution.
The checkout must be clean so the recorded commit really is the code that ran.

    python tools/noveltyaudit_showcase.py [--repo ../NoveltyAudit] [--python C:/path/to/python3.13.exe] [--skip-tests]
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "noveltyaudit" / "showcase.json"
FIXTURE = "scholarly-novelty-audit/tests/fixtures/composition-report.json"
RAG = "case-studies/claim-structure/public-001/case.json"
SUMMARY = "docs/bridge-base-rate-summary.json"
CUTOFFS = ["2021-12-31", "2022-06-01", "2023-12-31"]   # plus the fixture's own cutoff, last


# ---- dishonest edits of the fixture report; the page shows what the validator says about each ----
def reworded_after_freeze(r):
    r["claim_map"]["facets"][1]["text"] = "compression-aware token selection"
def prior_after_cutoff(r):
    b = next(p for p in r["papers"] if p["id"] == "B")
    b["dates"] = [{"value": "2025-10-01", "source": "arxiv_v1"}]
    b["earliest_public_date"] = "2025-10-01"
def uncited_killer_marked_cited(r):
    r["top_killers"][0]["bibliography_status"] = "IN_BIBLIOGRAPHY"
def bridge_without_text(r):
    r["bridges"][0]["evidence_ids"] = []
def graph_not_searched(r):
    r["search"]["graph_expansions"] = []
def strong_verdict_weak_evidence(r):
    r["verdict"]["evidence_confidence"] = "WEAK"
def reassuring_risk(r):
    r["verdict"]["novelty_risk"] = "LOW"
def novelty_percentage(r):
    r["verdict"]["main_concern"] = "Estimated novelty: 35%."
def broad_search_after_timeout(r):
    run = next(q for q in r["search"]["query_runs"] if q["provider"] == "arxiv")
    run["status"] = "error"
MUTATIONS = [reworded_after_freeze, prior_after_cutoff, uncited_killer_marked_cited, bridge_without_text, graph_not_searched,
             strong_verdict_weak_evidence, reassuring_risk, novelty_percentage, broad_search_after_timeout]
# the validator's message that names the edit goes first; the knock-on errors stay listed after it
FOCUS = {"prior_after_cutoff": "post-dates the cutoff", "bridge_without_text": "textual bridge", "broad_search_after_timeout": "Search Protocol Coverage"}


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=True).stdout


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(ROOT.parent / "NoveltyAudit"))
    ap.add_argument("--python", default=sys.executable)
    ap.add_argument("--skip-tests", action="store_true", help="reuse the test counts already in the JSON")
    a = ap.parse_args()
    repo = Path(a.repo).resolve()
    scripts = repo / "scholarly-novelty-audit" / "scripts"
    if git(repo, "status", "--porcelain").strip():
        sys.exit(f"{repo} has uncommitted changes; the page must name the exact code that produced it")
    commit = git(repo, "rev-parse", "HEAD").strip()
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONDONTWRITEBYTECODE": "1"}
    fixture = json.loads((repo / FIXTURE).read_text(encoding="utf-8"))
    cutoff0 = fixture["input"]["cutoff"]

    def cli(*args: str, ok=(0,)) -> subprocess.CompletedProcess:
        r = subprocess.run([a.python, "-B", str(scripts / "cli.py"), *args], cwd=repo, capture_output=True, text=True, encoding="utf-8", env=env)
        if r.returncode not in ok:
            sys.exit(f"cli {args[0]} exited {r.returncode}: {(r.stderr or r.stdout).strip()[-600:]}")
        return r

    def classify(mps: list, bridges: list) -> str:
        """composition.classify: the rule the validator enforces; the CLI has no command for it."""
        code = ("import json, sys; sys.path.insert(0, sys.argv[1]); from composition import classify; "
                "m, b = json.load(sys.stdin); print(classify(m, b))")
        r = subprocess.run([a.python, "-B", "-c", code, str(scripts)], input=json.dumps([mps, bridges]), capture_output=True, text=True, encoding="utf-8", env=env, check=True)
        return r.stdout.strip()

    def coverage(search: dict) -> dict:
        code = ("import json, sys; sys.path.insert(0, sys.argv[1]); from search_coverage import derive_search_coverage; "
                "print(json.dumps(derive_search_coverage(json.load(sys.stdin))))")
        r = subprocess.run([a.python, "-B", "-c", code, str(scripts)], input=json.dumps(search), capture_output=True, text=True, encoding="utf-8", env=env, check=True)
        return json.loads(r.stdout)

    with tempfile.TemporaryDirectory(prefix="na-showcase-") as t:
        tmp = Path(t)
        fx = repo / FIXTURE

        def load(name: str) -> dict:
            return json.loads((tmp / name).read_text(encoding="utf-8"))

        validation = cli("validate", "--input", str(fx)).stdout.strip().splitlines()
        cli("export", "--input", str(fx), "--format", "markdown", "--output", str(tmp / "report.md"))
        report_md = (tmp / "report.md").read_text(encoding="utf-8").replace("\r\n", "\n").strip()

        # ---- the same papers, judged at different cutoffs ----
        sweep = []
        for cutoff in [*CUTOFFS, cutoff0]:
            cli("dates", "--input", str(fx), "--cutoff", cutoff, "--output", str(tmp / "dated.json"))
            status = {p["id"]: p["cutoff_status"] for p in load("dated.json")}
            report = copy.deepcopy(fixture)
            report["input"]["cutoff"] = cutoff
            for p in report["papers"]:
                p["cutoff_status"] = status[p["id"]]
            (tmp / "at.json").write_text(json.dumps(report), encoding="utf-8")
            cli("mps", "--input", str(tmp / "at.json"), "--output", str(tmp / "mps.json"))
            cli("bridge", "--papers", str(tmp / "at.json"), "--paper-a", "A", "--paper-b", "B", "--cutoff", cutoff, "--output", str(tmp / "bridge.json"))
            mps, bridge = load("mps.json"), load("bridge.json")
            # the fixture's textual bridge is only usable while its source paper was public before the cutoff
            textual = [dict(b, cutoff_status=status.get(b["source_paper_id"], "ELIGIBLE")) for b in fixture["bridges"]]
            graph = bridge.get("graph_bridges", [])
            sets = mps.get("minimal_prior_sets", [])
            sweep.append({
                "cutoff": cutoff, "status": status,
                "mps": [{k: s[k] for k in ("paper_ids", "covered_facets", "coverage_by_paper", "evidence_ids")} for s in sets],
                "no_result": mps.get("no_result_explanation"), "sensitivity": mps.get("criticality_sensitivity", []),
                "graph": [{k: g.get(k) for k in ("type", "source_paper_id", "paper_ids", "base_rate_status")} for g in graph],
                "landscape": [{k: g.get(k) for k in ("type", "underlying_type", "source_paper_id")} for g in bridge.get("landscape_bridges", [])],
                "textual": [{"type": b["type"], "source_paper_id": b["source_paper_id"], "usable": b["cutoff_status"] == "ELIGIBLE", "evidence_ids": b["evidence_ids"]} for b in textual],
                "classification": classify(sets, textual + graph),
                "if_graph_only": classify(sets, graph), "if_no_bridge": classify(sets, []),
            })
        cli("graph-preflight", "--papers", str(fx), "--paper-a", "A", "--paper-b", "B", "--cutoff", cutoff0, "--output", str(tmp / "pre.json"))
        preflight = load("pre.json")

        # ---- the validator on dishonest copies of the report ----
        refusals = []
        for mutate in MUTATIONS:
            report = copy.deepcopy(fixture)
            mutate(report)
            (tmp / "bad.json").write_text(json.dumps(report), encoding="utf-8")
            r = cli("validate", "--input", str(tmp / "bad.json"), ok=(0, 40))
            if r.returncode != 40:
                sys.exit(f"the validator accepted mutation {mutate.__name__}; the page would misstate what it checks")
            errors = [line.removeprefix("ERROR: ") for line in r.stderr.strip().splitlines() if line.startswith("ERROR:")]
            focus = FOCUS.get(mutate.__name__, "")
            refusals.append({"id": mutate.__name__, "exit": r.returncode, "errors": sorted(errors, key=lambda e: not (focus and focus in e))})

        # ---- the public RAG case: dates through the tool, then the observation-window preflight per prior pair ----
        case = json.loads((repo / RAG).read_text(encoding="utf-8"))
        cut = case["target"]["cutoff"]
        papers = [{"id": p["paper_id"], "title": p["title"], "dates": [{"value": p["earliest_public_date"], "source": "preprint_v1"}]} for p in case["prior_works"]]
        (tmp / "rag-in.json").write_text(json.dumps(papers), encoding="utf-8")   # adapter: case.json is not a report
        cli("dates", "--input", str(tmp / "rag-in.json"), "--cutoff", cut, "--output", str(tmp / "rag.json"))
        rag_papers = load("rag.json")
        ids = [p["id"] for p in rag_papers]
        windows = []
        for i, x in enumerate(ids):
            for y in ids[i + 1:]:
                cli("graph-preflight", "--papers", str(tmp / "rag.json"), "--paper-a", x, "--paper-b", y, "--cutoff", cut, "--output", str(tmp / "w.json"))
                w = load("w.json")
                windows.append({"pair": [x, y], "days": w.get("observation_window_days"), "status": w.get("observation_window_status")})
        rag = {"target": {k: case["target"][k] for k in ("title", "cutoff")}, "arxiv": case["target"]["identifiers"].get("arxiv"),
               "status": {k: case[k] for k in ("case_type", "evidence_status", "performance_status")},
               "priors": [{"id": p["id"], "title": p["title"], "date": p.get("earliest_public_date"), "cutoff_status": p.get("cutoff_status"),
                           "arxiv": next(w["identifiers"].get("arxiv") for w in case["prior_works"] if w["paper_id"] == p["id"])} for p in rag_papers],
               "facets": case["audit_expectations"]["facets"], "candidate_mps": case["audit_expectations"]["candidate_mps_to_test"],
               "windows": windows, "threshold_days": preflight["observation_window_threshold_days"]}

        # ---- the tool's own test suite ----
        old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.is_file() else {}
        if a.skip_tests and old.get("tests"):
            tests = old["tests"]
        else:
            xml = tmp / "junit.xml"
            subprocess.run([a.python, "-B", "-m", "pytest", "scholarly-novelty-audit/tests", "-q", "-p", "no:cacheprovider", f"--junitxml={xml}"],
                           cwd=repo, env=env, capture_output=True, text=True)
            suite = ET.parse(xml).getroot()
            suite = suite if suite.tag == "testsuite" else suite.find("testsuite")
            n, skipped, failed = int(suite.get("tests")), int(suite.get("skipped")), int(suite.get("failures")) + int(suite.get("errors"))
            if failed:
                sys.exit(f"{failed} NoveltyAudit tests failed; fix the checkout before publishing its numbers")
            adversarial = sum(1 for c in suite.iter("testcase") if "adversarial" in (c.get("classname") or ""))
            tests = {"collected": n, "passed": n - skipped, "skipped": skipped, "adversarial": adversarial, "seconds": round(float(suite.get("time"))),
                     "python": subprocess.run([a.python, "--version"], capture_output=True, text=True).stdout.split()[-1]}
    if git(repo, "status", "--porcelain").strip():
        sys.exit(f"running NoveltyAudit left changes in {repo}; not publishing")

    s = json.loads((repo / SUMMARY).read_text(encoding="utf-8"))
    data = {
        "source": {"repo": "https://github.com/niansia/NoveltyAudit", "commit": commit, "run": date.today().isoformat(),
                   "version": re.search(r'__version__\s*=\s*"([^"]+)"', (scripts / "__init__.py").read_text(encoding="utf-8")).group(1)},
        "fixture": {
            "claim": fixture["input"]["claim"], "cutoff": cutoff0,
            "facets": [{k: f.get(k) for k in ("id", "type", "text", "critical")} for f in fixture["claim_map"]["facets"]],
            "freeze_hash": fixture["claim_map"]["freeze_hash"],
            "papers": [{"id": p["id"], "title": p["title"], "date": p["earliest_public_date"], "references": p.get("references", []),
                        "coverage": {f: v["status"] for f, v in p.get("coverage", {}).items()}} for p in fixture["papers"]],
            "evidence": [{k: e.get(k) for k in ("id", "canonical_paper_id", "source_level", "evidence_kind", "span", "location", "supports")} for e in fixture["evidence"]],
            "killers": fixture["top_killers"], "bibliography": fixture["author_bibliography"]["normalized_paper_ids"],
            "verdict": {k: fixture["verdict"][k] for k in ("classification", "novelty_risk", "search_coverage", "evidence_confidence", "main_concern")},
            "residual": fixture["residual_novelty"], "rewrite": fixture["defensible_rewrite"]["text"], "gaps": fixture["search"]["gaps"],
            "search": {"providers": [p["name"] for p in fixture["search"]["providers"]], "families": fixture["search"]["query_families"],
                       "runs": len(fixture["search"]["query_runs"]), "coverage": coverage(fixture["search"])},
            "validation": validation, "report_md": report_md,
        },
        "sweep": sweep, "preflight": {k: preflight[k] for k in ("observation_window_days", "observation_window_status", "observation_window_threshold_days")},
        "refusals": refusals, "rag": rag, "tests": tests,
        "empirical": {"snapshot": s["snapshot_date"], "dataset": s["source"]["dataset_id"], "license": s["source"]["license"],
                      "annotated": s["case_coverage"]["annotated_cases"], "multi_prior": s["case_coverage"]["cases_with_two_or_more_named_priors"],
                      "complete_multi": s["bridges"]["complete_multi_prior_cases"], "bridged_cases": s["bridges"]["cases_with_pre_cutoff_bridge"],
                      "bridged_ci": [s["bridges"]["case_bridge_base_rate_exact_95pct_interval"][k] for k in ("lower", "upper")],
                      "median_window": s["age"]["median_pair_opportunity_days"], "under_18": s["age"]["pairs_under_18_months"],
                      "pairs": s["age"]["dated_complete_pairs"]},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for leak in ("Users", "AppData", "na-showcase-"):
        if leak in text:
            sys.exit(f"refusing to write: output still contains {leak!r}")
    OUT.write_text(text + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from NoveltyAudit {data['source']['version']} @ {commit[:12]}; "
          f"sweep {[x['classification'] for x in sweep]}, refusals {len(refusals)}, tests {tests['passed']}/{tests['collected']}")


if __name__ == "__main__":
    main()
