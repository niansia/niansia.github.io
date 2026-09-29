"""Build assets/rmc/showcase.json, the data behind the Research Meeting Coach project page, by running the Skill's own
deterministic gates: its static evals, its validators on the committed worked example (the Research Meeting State,
its sources and the meeting brief) and on the advisor-profile fixture, then on deliberately dishonest edits of them.

The briefs themselves are written by a model; the committed examples were written during development and are labelled
as such on the page. What this script records is what the validators say. Two edits that pass are kept on purpose:
the page shows them as limits of the deterministic gates. The checkout must be clean so the recorded commit really is
the code that ran.

    python tools/rmc_showcase.py [--repo "../Advisor-AwareResearch Meeting"] [--python C:/path/to/python3.13.exe]
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "rmc" / "showcase.json"
DEMO = ["raw-notes.md", "previous-meeting.md", "result.csv", "generic-output.md", "advisor-aware-output.md"]

# ---- dishonest edits: (id, target, old text or None, new text or None, edit function for JSON targets) ----
BRIEF = [
    ("wrong_number", "The baseline accuracy was 72.3 [F01]", "The baseline accuracy was 72.8 [F01]"),
    ("swapped_values", "The baseline accuracy was 72.3 [F01], while the compression setup was 65.1 [F02]",
     "The baseline accuracy was 65.1 [F01], while the compression setup was 72.3 [F02]"),
    ("unrecorded_math", "so the current evidence does not isolate compression as the cause.",
     "a drop of 7.2 points, so the current evidence does not isolate compression as the cause."),
    ("hedge_dropped", "The 32-frame run returned to around 70 [F03]", "The 32-frame run returned to 70 [F03]"),
    ("spelled_decimal", "so the current evidence does not isolate", "seven point two points lower, so the current evidence does not isolate"),
    ("claimed_completion", "The advisor-requested early-frame control is only half complete [F04].",
     "The advisor-requested early-frame control is complete [F04]."),
]


def fact(r, fid):
    return next(x for x in r["facts"] if x["id"] == fid)


def m_quote_changed(r):
    f = fact(r, "F01")
    f["statement"] = f["source"]["quote"] = "Baseline accuracy was 75.0."
    f["measurements"][0]["value"] = "75.0"
def m_wrong_condition(r):
    fact(r, "F01")["measurements"][0]["condition"] = "compression setup"
def m_hedge_as_exact(r):
    next(m for m in fact(r, "F03")["measurements"] if m["value"] == "70")["qualifier"] = "exact"
def m_invented_option(r):
    r["asks"][0]["options"].append({"label": "drop the compression study", "provenance": "supplied", "source_fact_ids": []})
def m_dropped_required(r):
    r["relevance"]["main"].remove("F04")
    r["relevance"]["omit"].append("F04")
def m_marked_done(r):
    r["continuity"]["previous_actions"][0]["status"] = "done"
RMS = [m_quote_changed, m_wrong_condition, m_hedge_as_exact, m_invented_option, m_dropped_required, m_marked_done]


def p_stereotype(p):
    p["advisor_profile"]["nationality_style"] = {"value": "Expects formal presentations because of where they trained.", "basis": "behavioral_evidence",
                                                  "confidence": "low", "evidence": copy.deepcopy(p["advisor_profile"]["opening_preference"]["evidence"])}
def p_one_meeting_pattern(p):
    p["advisor_profile"]["baseline_sensitivity"]["evidence"][0]["meeting_ids"] = ["M05"]
def p_impression_as_fact(p):
    trait = p["advisor_profile"]["baseline_sensitivity"]
    trait["confidence"] = "high"
    trait["evidence"][0]["type"] = "student_impression"
def p_quote_not_in_notes(p):
    p["advisor_profile"]["opening_preference"]["evidence"][0]["source"]["quote"] = "Always start with the related work."
PROFILE = [p_stereotype, p_one_meeting_pattern, p_impression_as_fact, p_quote_not_in_notes]
LIMITS = {"claimed_completion", "m_marked_done"}   # expected to pass: the gates do not read prose or status semantics


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=True).stdout


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(ROOT.parent / "Advisor-AwareResearch Meeting"))
    ap.add_argument("--python", default=sys.executable)
    a = ap.parse_args()
    repo = Path(a.repo).resolve()
    pkg = repo / "research-meeting-coach"
    ex = pkg / "examples" / "compression-confound"
    if git(repo, "status", "--porcelain").strip():
        sys.exit(f"{repo} has uncommitted changes; the page must name the exact code that produced it")
    commit = git(repo, "rev-parse", "HEAD").strip()
    env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONDONTWRITEBYTECODE": "1"}

    def run(script: str, *args: str) -> dict:
        r = subprocess.run([a.python, "-B", str(pkg / "scripts" / script), *args, "--json"], capture_output=True, text=True, encoding="utf-8", env=env)
        out = json.loads(r.stdout)
        out["exit"] = r.returncode
        return out

    def static(script: str) -> dict:
        r = subprocess.run([a.python, "-B", str(pkg / "scripts" / script)], capture_output=True, text=True, encoding="utf-8", env=env, cwd=repo)
        if r.returncode:
            sys.exit(f"{script} failed ({r.returncode}): {(r.stderr or r.stdout)[-600:]}")
        return json.loads(r.stdout)

    evals = static("run_static_evals.py")
    contracts = static("validate_schema_contracts.py")
    rms0 = json.loads((ex / "research-meeting-state.json").read_text(encoding="utf-8"))
    brief0 = (ex / "meeting-brief.md").read_text(encoding="utf-8")
    profile_path = pkg / "evals" / "fixtures" / "advisor-profile-valid.json"
    prof0 = json.loads(profile_path.read_text(encoding="utf-8"))

    def summary(v: dict) -> dict:
        errors = v.get("errors", []) + [f"line {x['line']}: {', '.join(x['numbers'])} [{', '.join(x['fact_citations'])}]: {x['reason']}" for x in v.get("violations", [])]
        return {"status": v["status"], "exit": v["exit"], "errors": errors}

    with tempfile.TemporaryDirectory(prefix="rmc-showcase-") as t:
        tmp = Path(t)
        src = tmp / "example"
        shutil.copytree(ex, src)
        (tmp / "fixtures").mkdir()
        shutil.copytree(pkg / "evals" / "fixtures" / "advisor-sources", tmp / "fixtures" / "advisor-sources")
        rms_path, brief_path, prof_path = src / "research-meeting-state.json", src / "meeting-brief.md", tmp / "fixtures" / "profile.json"

        base = {"rms": summary(run("validate_rms.py", str(ex / "research-meeting-state.json"))),
                "sources": summary(run("validate_source_grounding.py", "--rms", str(ex / "research-meeting-state.json"), "--source-root", str(ex))),
                "numbers": summary(run("validate_numeric_closed_world.py", "--rms", str(ex / "research-meeting-state.json"), "--output", str(ex / "meeting-brief.md"))),
                "profile": summary(run("validate_advisor_profile.py", str(profile_path))),
                "profile_sources": summary(run("validate_advisor_profile_grounding.py", "--profile", str(profile_path), "--source-root", str(pkg / "evals" / "fixtures")))}
        if any(v["status"] != "passed" for v in base.values()):
            sys.exit(f"the committed example does not pass its own gates: {base}")

        edits = []
        for eid, old, new in BRIEF:
            if old not in brief0:
                sys.exit(f"brief edit {eid}: text not found; the example changed")
            brief_path.write_text(brief0.replace(old, new, 1), encoding="utf-8")
            v = summary(run("validate_numeric_closed_world.py", "--rms", str(ex / "research-meeting-state.json"), "--output", str(brief_path)))
            edits.append({"id": eid, "target": "brief", "old": old, "new": new, "gates": {"numbers": v}})
        brief_path.write_text(brief0, encoding="utf-8")
        for fn in RMS:
            r = copy.deepcopy(rms0)
            fn(r)
            rms_path.write_text(json.dumps(r, indent=2), encoding="utf-8")
            edits.append({"id": fn.__name__, "target": "rms", "gates": {"rms": summary(run("validate_rms.py", str(rms_path))),
                                                                        "sources": summary(run("validate_source_grounding.py", "--rms", str(rms_path), "--source-root", str(src)))}})
        for fn in PROFILE:
            p = copy.deepcopy(prof0)
            fn(p)
            prof_path.write_text(json.dumps(p, indent=2), encoding="utf-8")
            edits.append({"id": fn.__name__, "target": "profile", "gates": {"profile": summary(run("validate_advisor_profile.py", str(prof_path))),
                                                                            "profile_sources": summary(run("validate_advisor_profile_grounding.py", "--profile", str(prof_path), "--source-root", str(tmp / "fixtures")))}})
    for e in edits:
        e["caught"] = any(g["status"] == "failed" for g in e["gates"].values())
        if e["caught"] == (e["id"] in LIMITS):
            sys.exit(f"edit {e['id']} was {'caught' if e['caught'] else 'missed'}, unlike when this page was written; update the page copy")
    if git(repo, "status", "--porcelain").strip():
        sys.exit(f"running the validators left changes in {repo}; not publishing")

    seed = json.loads((pkg / "evals" / "public-question-seed" / "seed-corpus.json").read_text(encoding="utf-8"))
    dev = json.loads((pkg / "evals" / "development-run" / "metadata.json").read_text(encoding="utf-8"))
    data = {
        "source": {"repo": "https://github.com/niansia/research-meeting-coach", "commit": commit, "run": date.today().isoformat(),
                   "version": re.search(r'version:\s*"([^"]+)"', (pkg / "SKILL.md").read_text(encoding="utf-8")).group(1)},
        "demo": {name: (pkg / "examples" / "60-second-demo" / name).read_text(encoding="utf-8").replace("\r\n", "\n").strip() for name in DEMO},
        "rms": {k: rms0[k] for k in ("meeting", "continuity", "facts", "reasoning_items", "asks", "attack_surface", "relevance", "derived_numbers")},
        "brief": brief0.replace("\r\n", "\n").strip(),
        "profile": prof0, "base": base, "edits": edits,
        "evals": {k: evals[k] for k in ("status", "case_definition_count", "executed_case_definition_count", "cross_model_case_execution_count",
                                        "development_output_bundle_count", "routing_case_count", "instance_count") if k in evals},
        "checks": len(evals.get("checks", [])), "contracts": contracts.get("status"),
        "seed_records": len(seed["records"]), "dev_run": {"runner": dev.get("runner"), "independent_evaluator": dev.get("independent_evaluator"), "warning": dev.get("contamination_warning")},
    }
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for leak in ("Users", "AppData", "rmc-showcase-"):
        if leak in text:
            sys.exit(f"refusing to write: output still contains {leak!r}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    caught = sum(e["caught"] for e in edits)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from Research Meeting Coach {data['source']['version']} @ {commit[:12]}; "
          f"{caught}/{len(edits)} edits caught, {len(edits) - caught} shown as limits, {data['checks']} static checks")


if __name__ == "__main__":
    main()
