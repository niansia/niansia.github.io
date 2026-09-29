"""Build assets/psg/showcase.json, the data behind the PSG project page, by running PSG itself: one governed task on a
small demo repository recorded command by command, PSG's review-boundary benchmark, and its test suite.

This script plays the coding agent: it writes the edits, including the out-of-scope ones. Every decision on the page,
the sealed boundary, the policy violations, the attested check, which findings block, the ship gate, is PSG's own
output. The checkout must be clean so the recorded commit really is the code that ran.

PSG runs from the checkout (PYTHONPATH=src) with PSG_HOME, PSG_USER_HOME and HOME pointed at a scratch folder and a
PATH without agent CLIs. `psg init` is never called, because it can register MCP servers with Codex, Claude Code and
Gemini; the demo repository is initialised through PSG.initialize, as PSG's own tests and benchmarks do.

    python tools/psg_showcase.py [--repo ../PSG] [--python C:/path/to/python3.13.exe] [--skip-tests] [--raw]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "psg" / "showcase.json"
STAMP = "2026-01-01T00:00:00Z"

FILES = {
    ".gitignore": "__pycache__/\n*.py[cod]\n.pytest_cache/\n.psg/local/\n",
    "src/__init__.py": "",
    "src/pricing.py": '"""Prices for the shop."""\n\n\ndef apply_discount(price: float, percent: float) -> float:\n    return price - price * percent / 100\n\n\ndef with_tax(price: float, rate: float = 0.05) -> float:\n    return round(price * (1 + rate), 2)\n',
    "src/api.py": '"""Public API used by partners. Signatures are frozen."""\nfrom src.pricing import apply_discount, with_tax\n\n\ndef quote(price: float, percent: float = 0) -> float:\n    return with_tax(apply_discount(price, percent))\n',
    "src/legacy_export.py": '"""Nightly CSV export for the old accounting system."""\n\n\ndef export_row(sku, price):\n    return "%s,%s" % (sku, price)\n',
    "checks/__init__.py": "",
    "checks/check_pricing.py": 'from src.pricing import apply_discount\n\nassert apply_discount(19.99, 15) == 16.99\nassert apply_discount(10, 0) == 10\nprint("pricing: 2 checks passed")\n',
}
# the agent's edits: the requested fix, then three "helpful" extras the task never asked for
FIX = ("src/pricing.py", "    return price - price * percent / 100\n", "    return round(price - price * percent / 100, 2)\n")
EXTRAS = [
    ("src/api.py", "def quote(price: float, percent: float = 0) -> float:\n", 'def quote(price: float, percent: float = 0, currency: str = "USD") -> float:\n'),
    ("src/legacy_export.py", '    return "%s,%s" % (sku, price)\n', '    return f"{sku},{price}"\n'),
]
NEW_FILE = ("src/money.py", '"""Shared money helpers."""\n\n\ndef cents(value: float) -> float:\n    return round(value, 2)\n')
TASK = ["Round discounted prices to whole cents",
        "--ac", "apply_discount(19.99, 15) returns 16.99",
        "--constraint", "Partner API signatures in src/api.py stay unchanged",
        "--target", "src/pricing.py", "--write", "src/pricing.py",
        "--read-only", "src/api.py", "--forbid", "src/legacy_export.py",
        "--non-goal", "Refactor how quotes are computed", "--risk", "low"]
ISSUES = [  # a reviewer's three findings: severity, relation, claim, evidence
    ("major", "pre_existing", "quote() accepts a negative price", {"kind": "reproduction", "path": "src/api.py"}),
    ("minor", "future_improvement", "Money should use Decimal instead of float", {"kind": "design_suggestion"}),
    ("major", "caused_by_patch", "The rounding may break other callers", {"kind": "opinion"}),
]


def git(repo: Path, *args: str) -> str:
    env = {**os.environ, "GIT_AUTHOR_DATE": STAMP, "GIT_COMMITTER_DATE": STAMP}
    return subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=True, env=env).stdout


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(ROOT.parent / "PSG"))
    ap.add_argument("--python", default=sys.executable)
    ap.add_argument("--skip-tests", action="store_true", help="reuse the test counts already in the JSON")
    ap.add_argument("--raw", action="store_true", help="print every raw PSG answer (for development)")
    a = ap.parse_args()
    psg_repo = Path(a.repo).resolve()
    if git(psg_repo, "status", "--porcelain").strip():
        sys.exit(f"{psg_repo} has uncommitted changes; the page must name the exact code that produced it")
    commit = git(psg_repo, "rev-parse", "HEAD").strip()

    with tempfile.TemporaryDirectory(prefix="psg-showcase-") as t:
        tmp = Path(t)
        demo = tmp / "shop"
        home = tmp / "home"
        home.mkdir()
        system = [p for p in os.environ.get("PATH", "").split(os.pathsep) if p and Path(p).resolve() == Path(os.environ.get("SystemRoot", "C:/Windows"), "System32").resolve()]
        env = {**os.environ, "PYTHONPATH": str(psg_repo / "src"), "PYTHONIOENCODING": "utf-8", "PYTHONDONTWRITEBYTECODE": "1",
               "PSG_HOME": str(home / ".psg"), "PSG_USER_HOME": str(home), "HOME": str(home), "USERPROFILE": str(home),
               "PATH": os.pathsep.join([str(Path(a.python).parent), str(Path(shutil.which("git")).parent), *system])}
        for agent in ("claude", "codex", "gemini"):
            if shutil.which(agent, path=env["PATH"]):
                sys.exit(f"{agent} is reachable on the sanitised PATH; refusing to run PSG")

        def clean(value):
            text = json.dumps(value, ensure_ascii=False)
            for form in sorted({str(demo), demo.as_posix(), str(demo.resolve()), demo.resolve().as_posix(), str(tmp), tmp.as_posix()}, key=len, reverse=True):
                text = text.replace(json.dumps(form)[1:-1], ".")
            return json.loads(text)

        def psg(*args: str, ok=(0,)):
            if args[0] in {"init", "setup", "update", "uninstall"}:
                raise RuntimeError(f"refusing to run psg {args[0]}")
            r = subprocess.run([a.python, "-m", "psg.cli", "--root", str(demo), "--json", *args], capture_output=True, text=True, encoding="utf-8", env=env)
            if r.returncode not in ok:
                sys.exit(f"psg {' '.join(args[:2])} exited {r.returncode}: {r.stderr.strip()[-800:]}")
            out = clean(json.loads(r.stdout)) if r.stdout.strip() else None
            if a.raw:
                print(f"\n$ psg {' '.join(args)}\n{json.dumps(out, indent=1, ensure_ascii=False)[:6000]}")
            return out

        # ---- a small Git repository with a pricing bug, a frozen partner API and a module nobody may touch ----
        demo.mkdir()
        for rel, src in FILES.items():
            (demo / rel).parent.mkdir(parents=True, exist_ok=True)
            (demo / rel).write_bytes(src.encode("utf-8"))
        git(demo, "init", "-q", "-b", "main")
        for key, value in (("user.email", "demo@example.com"), ("user.name", "PSG Demo"), ("core.autocrlf", "false")):
            git(demo, "config", key, value)
        git(demo, "add", "-A")
        git(demo, "commit", "-q", "-m", "shop")
        subprocess.run([a.python, "-c", "from psg.runtime import PSG; PSG.initialize('.', project='shop')"], cwd=demo, env=env, check=True, capture_output=True)
        # the one check PSG may run; a config change must be committed before PSG trusts it
        config = demo / ".psg" / "config.yaml"
        text = config.read_text(encoding="utf-8")
        if "  commands: {}\n" not in text:
            sys.exit("PSG's default config changed shape; update the verification block this script writes")
        config.write_text(text.replace("  commands: {}\n", '  commands:\n    pricing: "python -m checks.check_pricing"\n'), encoding="utf-8")
        git(demo, "add", "-A")
        git(demo, "commit", "-q", "-m", "psg: configure the pricing check")
        psg("index")
        git(demo, "add", "-A")
        git(demo, "commit", "-q", "-m", "psg: index")

        def edit(rel: str, old: str, new: str) -> None:
            path = demo / rel
            src = path.read_text(encoding="utf-8")
            if old not in src:
                raise RuntimeError(f"{rel} does not contain the text to replace")
            path.write_bytes(src.replace(old, new).encode("utf-8"))

        def diff() -> str:
            # the agent's changes only; PSG's own .psg/state churn is not part of the patch
            return git(demo, "diff", "--no-color", "-U1", "--", ".", ":(exclude).psg") + "".join(
                f"new file {rel}\n" + "".join("+" + line for line in (demo / rel).read_text(encoding="utf-8").splitlines(True))
                for rel in git(demo, "ls-files", "--others", "--exclude-standard").split())

        steps = []
        opened = psg("task", "open", *TASK)
        tid = opened["id"] if "id" in opened else opened["task"]["id"]
        steps.append({"id": "open", "cmd": "psg task open " + " ".join(f'"{x}"' if " " in x else x for x in TASK), "out": opened})
        context = psg("context", "build", tid)
        steps.append({"id": "context", "cmd": f"psg context build {tid}", "out": context})
        edit(*FIX)
        for extra in EXTRAS:
            edit(*extra)
        (demo / NEW_FILE[0]).write_text(NEW_FILE[1], encoding="utf-8")
        steps.append({"id": "agent", "diff": diff()})
        steps.append({"id": "rejected", "cmd": f"psg validate {tid}", "out": psg("validate", tid)})
        git(demo, "checkout", "--", *(rel for rel, _, _ in EXTRAS))
        (demo / NEW_FILE[0]).unlink()
        steps.append({"id": "allowed", "diff": diff(), "cmd": f"psg validate {tid}", "out": psg("validate", tid)})
        verified = psg("verify", tid, "--name", "pricing")
        vid = verified["results"][0]["id"]
        steps.append({"id": "verify", "cmd": f"psg verify {tid} --name pricing", "out": verified})
        steps.append({"id": "ship-early", "cmd": f"psg ship {tid}", "out": psg("ship", tid)})
        ac = f"{tid}-AC1"
        evidence = json.dumps({"kind": "test", "source": "runtime_executed", "reference": vid})
        steps.append({"id": "criterion", "cmd": f"psg task criterion {tid} {ac} pass --evidence '{evidence}'",
                      "out": psg("task", "criterion", tid, ac, "pass", "--evidence", evidence)})
        reported = []
        for severity, relation, claim, ev in ISSUES:
            reported.append({"cmd": f"psg issue report {tid} {severity} {relation} \"{claim}\" --evidence '{json.dumps(ev)}'",
                             "out": psg("issue", "report", tid, severity, relation, claim, "--evidence", json.dumps(ev))})
        steps.append({"id": "issues", "runs": reported})
        steps.append({"id": "review", "cmd": f"psg review {tid} --actor reviewer-1", "out": psg("review", tid, "--actor", "reviewer-1")})
        steps.append({"id": "ship", "cmd": f"psg ship {tid}", "out": psg("ship", tid)})
        check_log = (demo / ".psg" / "local" / "verification" / f"{vid}.log").read_text(encoding="utf-8").strip()
        files = {rel: FILES[rel] for rel in FILES if rel.endswith(".py") and FILES[rel]}

        # ---- PSG's deterministic benchmarks, re-run here; their temp folders keep SQLite open on Windows, so the
        # wrapper lets TemporaryDirectory ignore that cleanup error (the result file is written before cleanup) ----
        def bench(script: str) -> dict:
            out = tmp / f"{script}.json"
            wrapper = ("import functools, runpy, sys, tempfile; "
                       "tempfile.TemporaryDirectory.__init__ = functools.partialmethod(tempfile.TemporaryDirectory.__init__, ignore_cleanup_errors=True); "
                       f"sys.argv = [{script!r}, '--output', {str(out)!r}]; "
                       f"runpy.run_path({str(psg_repo / 'benchmarks' / script)!r}, run_name='__main__')")
            r = subprocess.run([a.python, "-c", wrapper], cwd=tmp, env=env, capture_output=True, text=True, encoding="utf-8")
            if not out.is_file():
                sys.exit(f"{script} wrote no result (exit {r.returncode}): {r.stderr.strip()[-600:]}")
            return json.loads(out.read_text(encoding="utf-8"))

        boundary = bench("task_boundary_benchmark.py")
        mechanics = bench("sequential_benchmark.py")

        # ---- PSG's own test suite ----
        old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.is_file() else {}
        if a.skip_tests and old.get("tests"):
            tests = old["tests"]
        else:
            xml = tmp / "junit.xml"
            # the full PATH: one test clones a repository and needs Git's helpers; PSG's tests never reach a real agent
            # CLI (setup runs with a custom skill dir, which skips MCP registration, or with fake executables)
            subprocess.run([a.python, "-m", "pytest", "-q", "-p", "no:cacheprovider", f"--junitxml={xml}"], cwd=psg_repo,
                           env={**env, "PATH": os.environ["PATH"]}, capture_output=True, text=True)
            suite = ET.parse(xml).getroot()
            suite = suite if suite.tag == "testsuite" else suite.find("testsuite")
            n, skipped, failed = int(suite.get("tests")), int(suite.get("skipped")), int(suite.get("failures")) + int(suite.get("errors"))
            if failed:
                names = [f"{case.get('classname')}::{case.get('name')}: {(case.find('failure') if case.find('failure') is not None else case.find('error')).get('message', '')[:300]}"
                         for case in suite.iter("testcase") if case.find("failure") is not None or case.find("error") is not None]
                sys.exit(f"{failed} PSG tests failed; fix the checkout before publishing its numbers:\n" + "\n".join(names))
            tests = {"collected": n, "passed": n - skipped, "skipped": skipped, "seconds": round(float(suite.get("time"))),
                     "python": subprocess.run([a.python, "--version"], capture_output=True, text=True).stdout.split()[-1]}
        if git(psg_repo, "status", "--porcelain").strip():
            sys.exit(f"running PSG left changes in {psg_repo}; not publishing")

    def pick(d: dict, *keys: str) -> dict:
        return {k: d[k] for k in keys if k in d}

    def gate(s: dict) -> dict:
        return {**pick(s, "status", "recommendation", "stable_snapshot", "scope_approved", "requires_scope_approval", "constraints_ok",
                       "independent_review_required", "independent_review_satisfied", "review_rounds_used", "review_budget",
                       "fix_cycles_used", "fix_budget", "current_task_issue_summary", "follow_up_issue_summary"),
                "policy_allowed": s["final_policy_validation"]["allowed"],
                "acceptance": pick(s["acceptance_summary"], "mandatory_total", "passed", "failed_or_pending", "stale", "untrusted"),
                "verification": pick(s["verification_summary"], "required_total", "functional_trusted", "failed", "missing", "stale", "untrusted"),
                "follow_up_ids": [i["id"] for i in s.get("follow_up_issues", [])]}

    by = {s["id"]: s for s in steps}
    o, c = by["open"]["out"], by["context"]["out"]
    p = o.get("payload", {})
    seal = c["task_contract_seal"]
    issue_rows = [pick(r["out"], "id", "severity", "relation_to_task", "claim", "evidence", "evidence_sufficient", "blocks_current_task") for r in by["issues"]["runs"]]
    session = {
        "task": {"id": tid, "intent": o["intent"], "risk": c["task_brief"]["risk"], "state": p.get("contract_state"),
                 "criteria": [pick(x, "id", "text", "status") for x in o["criteria"]], "constraints": c["task_brief"]["constraints"],
                 "non_goals": c["task_brief"]["non_goals"], "requested": {k: p.get(k, []) for k in ("write", "read_only", "forbidden")},
                 "budgets": pick(o, "review_budget", "fix_budget", "context_budget"), "cmd": by["open"]["cmd"]},
        "context": {"cmd": by["context"]["cmd"], "seal": pick(seal, "contract_state", "contract_hash", "authorized_write", "requires_scope_approval", "sealed_now"),
                    "working_set": c["working_set"], "token_estimate": c["token_estimate"], "context_budget": c["context_budget"], "confidence": c.get("confidence")},
        "agent_diff": by["agent"]["diff"],
        "rejected": {"cmd": by["rejected"]["cmd"], **pick(by["rejected"]["out"], "allowed", "violations", "required_scope_expansion", "diff_source")},
        "allowed": {"cmd": by["allowed"]["cmd"], "diff": by["allowed"]["diff"], **pick(by["allowed"]["out"], "allowed", "violations", "touched_nodes")},
        "verify": {"cmd": by["verify"]["cmd"], "log": check_log, **pick(verified["results"][0], "id", "name", "result", "required"),
                   **pick(verified["results"][0]["evidence"], "trust_tier", "source", "exit_code", "kind")},
        "ship_early": {"cmd": by["ship-early"]["cmd"], **gate(by["ship-early"]["out"])},
        "criterion": {"cmd": by["criterion"]["cmd"], "id": ac, "status": "pass", "reference": vid},
        "issues": [{"cmd": r["cmd"], **row} for r, row in zip(by["issues"]["runs"], issue_rows)],
        "review": {"cmd": by["review"]["cmd"], **pick(by["review"]["out"], "review_rounds_used", "review_budget", "derived_new_blocking_issues",
                                                     "stop_general_review", "trust_tier", "invariant", "contract_hash")},
        "ship": {"cmd": by["ship"]["cmd"], **gate(by["ship"]["out"])},
        "files": files,
    }
    ms = mechanics["summary"]
    data = {
        "source": {"repo": "https://github.com/niansia/PSG", "version": re.search(r'__version__\s*=\s*"([^"]+)"', (psg_repo / "src" / "psg" / "__init__.py").read_text(encoding="utf-8")).group(1),
                   "commit": commit, "run": date.today().isoformat()},
        "session": session,
        "boundary": {"summary": boundary["summary"], "scenarios": [pick(s, "name", "severity", "relation", "evidence", "evidence_sufficient", "expected_block", "actual_block", "correct", "violates")
                                                                   for s in boundary["scenarios"]]},
        "mechanics": {k: ms[k] for k in ("tasks", "tasks_shippable", "baseline_file_reads", "psg_file_reads", "file_read_reduction_percent",
                                         "baseline_token_estimate", "psg_token_estimate", "total_context_token_reduction_percent",
                                         "unauthorized_frozen_mutation_blocked", "review_stopped_at_budget") if k in ms},
        "tests": tests,
    }
    if a.raw:
        print(json.dumps(mechanics["summary"], indent=1))
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for leak in ("Users", "AppData", "psg-showcase-", "psg-home"):
        if leak in text:
            sys.exit(f"refusing to write: output still contains {leak!r}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from PSG {data['source']['version']} @ {commit[:12]}; "
          f"ship {session['ship']['status']}, boundary {boundary['summary']['correct']}/{len(boundary['scenarios'])}, tests {tests['passed']}/{tests['collected']}")


if __name__ == "__main__":
    main()
