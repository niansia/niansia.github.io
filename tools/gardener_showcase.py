"""Build assets/gardener/showcase.json, the data behind the AI Repo Gardener project page, by running AI Repo Gardener
itself: on its labeled safe-delete corpus (benchmarks/labeled-corpus), through one full review -> apply -> restore
session, and on its own test suite.

Nothing on the page is typed in by hand: verdicts, confidence, risk, evidence, blockers, plan IDs, hashes, command
output and test counts are what this checkout produced. The checkout must be clean so the recorded commit really is the
code that ran. AI Repo Gardener needs Python 3.11 or newer; pass one with --python when the default interpreter is older.

    python tools/gardener_showcase.py [--repo "../AI Repo Gardener"] [--python C:/path/to/python3.12.exe] [--skip-tests]
"""
from __future__ import annotations

import argparse
import hashlib
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
OUT = ROOT / "assets" / "gardener" / "showcase.json"

# (case id, the file that decides the verdict) in the order the page shows them; the first is the plain rename
CASES = [("delete-parser-old", None), ("keep-docker-python-module", "Dockerfile"), ("keep-compose-uvicorn-module", "compose.yaml"),
         ("keep-pyproject-entrypoint", "pyproject.toml"), ("keep-runtime-import-module", "app.py"),
         ("review-partial-replacement", "parser_old.py"), ("review-public-contract-change", "client.py"),
         ("review-package-public-surface", "pkg/__init__.py"), ("review-repository-parse-error", "broken.py"),
         ("review-dynamic-deployment-command", "Dockerfile"), ("review-eval-runtime-loader", "app.py")]
HASH_EVIDENCE = {"candidate_sha256", "replacement_sha256"}


def git(root: Path, *args: str, date_: str | None = None) -> str:
    env = os.environ.copy()
    if date_:
        env["GIT_AUTHOR_DATE"] = env["GIT_COMMITTER_DATE"] = date_
    return subprocess.run(["git", "-C", str(root), *args], check=True, capture_output=True, text=True, env=env).stdout


def write(root: Path, files: dict[str, str | None]) -> None:
    for rel, src in files.items():
        p = root / rel
        if src is None:
            p.unlink(missing_ok=True)
            continue
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(src.encode("utf-8"))


def build_case(root: Path, case: dict, extra: dict[str, str] | None = None) -> None:
    """Two commits at fixed times, as benchmarks/run_labeled_corpus.py builds them."""
    root.mkdir(parents=True)
    write(root, {**case["before"], **(extra or {})})
    git(root, "init", "-q")
    git(root, "config", "user.email", "corpus@example.com")
    git(root, "config", "user.name", "Repo Gardener Corpus")
    git(root, "config", "core.autocrlf", "false")
    git(root, "add", ".")
    git(root, "commit", "-q", "-m", "before iteration", date_="2026-01-01T00:00:00Z")
    write(root, case["after"])
    git(root, "add", "-A")
    git(root, "commit", "-q", "-m", "agent iteration", date_="2026-01-02T00:00:00Z")


def sha(path: Path) -> str | None:
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=str(ROOT.parent / "AI Repo Gardener"))
    ap.add_argument("--python", default=sys.executable)
    ap.add_argument("--skip-tests", action="store_true", help="reuse the test counts already in the JSON")
    a = ap.parse_args()
    repo = Path(a.repo).resolve()
    cli = repo / "skills" / "repo-gardener" / "scripts" / "run_repo_gardener.py"
    if git(repo, "status", "--porcelain").strip():
        sys.exit(f"{repo} has uncommitted changes; the page must name the exact code that produced it")
    commit = git(repo, "rev-parse", "HEAD").strip()

    def run(root: Path, *args: str, ok=(0,)) -> subprocess.CompletedProcess:
        r = subprocess.run([a.python, str(cli), *args], cwd=root, capture_output=True, text=True, encoding="utf-8")
        if r.returncode not in ok:
            sys.exit(f"repo-gardener {' '.join(args[:2])} exited {r.returncode}: {(r.stderr or r.stdout).strip()[-600:]}")
        return r

    version = run(repo, "--version").stdout.strip().split()[-1]
    manifest = json.loads((repo / "benchmarks/labeled-corpus/manifest.json").read_text(encoding="utf-8"))
    by_id = {c["id"]: c for c in manifest["cases"]}

    with tempfile.TemporaryDirectory(prefix="gardener-showcase-") as t:
        tmp = Path(t)
        tmp_forms = sorted({str(tmp), tmp.as_posix(), str(tmp.resolve()), tmp.resolve().as_posix()}, key=len, reverse=True)

        def clean(text: str, root: Path) -> str:
            """Strip machine paths: the case repo becomes '.', the scratch folder '..', anything else absolute '<tmp>'."""
            for form in sorted({str(root), root.as_posix(), str(root.resolve()), root.resolve().as_posix()}, key=len, reverse=True):
                text = text.replace(form + "\\", "").replace(form + "/", "").replace(form, ".")
            for form in tmp_forms:
                text = text.replace(form, "..")
            text = re.sub(r"(?<![A-Za-z])[A-Za-z]:[\\/][^\s\"'<>]*", "<tmp>", text)
            return text.replace(a.python, "python").rstrip()

        # ---- the whole corpus, scored the way the repository's runner scores it ----
        cases, score = [], {"TP": 0, "FP": 0, "FN": 0, "TN": 0}
        shown = dict(CASES)
        for case in manifest["cases"]:
            root = tmp / case["id"]
            build_case(root, case)
            report = json.loads(run(root, "diff", ".", "--base", "HEAD~1", "--format", "json", "--confidence", "all").stdout)
            finding = next((f for f in report["findings"] if f["path"] == case["target"]), None)
            predicted = bool(finding and finding["rule"] == "stale-file" and finding["recommendation"] == "safe_delete_candidate")
            outcome = ("TP" if predicted else "FN") if case["label"] == "DELETE" else ("FP" if predicted else "TN")
            score[outcome] += 1
            if case["id"] not in shown:
                continue
            plan = json.loads(run(root, "fix", ".", "--base", "HEAD~1", "--dry-run", "--format", "json").stdout)
            before, after = case["before"], case["after"]
            files = []
            for rel in sorted(set(before) | set(after), key=lambda p: (p != "app.py", p)):
                state = "removed" if after.get(rel, "") is None else "added" if rel not in before else "modified" if rel in after and after[rel] != before[rel] else "unchanged"
                src = after[rel] if rel in after and after[rel] is not None else before.get(rel)
                files.append({"path": rel, "state": state, "code": src.rstrip("\n") if src is not None else "", "was": before[rel].rstrip("\n") if state == "modified" else None})
            m = report["metrics"]
            cases.append({
                "id": case["id"], "label": case["label"], "target": case["target"], "key": shown[case["id"]], "outcome": outcome, "files": files,
                "finding": finding and {"rule": finding["rule"], "recommendation": finding["recommendation"], "confidence": finding["confidence"],
                                        "risk": finding["risk"], "replacement": finding.get("replacement"), "risks": finding["risks"],
                                        "evidence": [[e["type"], e["value"]] for e in finding["evidence"] if e["type"] not in HASH_EVIDENCE]},
                "others": [{"rule": f["rule"], "path": f["path"], "recommendation": f["recommendation"], "confidence": f["confidence"], "risk": f["risk"],
                            "risks": f["risks"]} for f in report["findings"] if f is not finding],
                "metrics": {"entrypoints": m["entrypoints"], "runtime_refs": m["deployment_runtime_references"],
                            "uncertainty": m["deployment_reference_uncertainty"], "parse_errors": m["parse_error_files"],
                            "reachable": m["reachable_modules"], "python_files": m["python_files"]},
                "plan": {"operations": len(plan["operations"]), "blockers": plan["automatic_deletion_blockers"]},
                "pretty": clean(run(root, "diff", ".", "--base", "HEAD~1").stdout, root),
            })
        cases.sort(key=lambda c: [cid for cid, _ in CASES].index(c["id"]))

        # ---- one full session on the plain rename: review, refuse twice, apply, restore ----
        root = tmp / "session" / "repo"
        root.parent.mkdir()
        build_case(root, by_id["delete-parser-old"], extra={".gitignore": ".repo-gardener/\n"})
        plan_path = root.parent / "reviewed-plan.json"
        watched = ["app.py", "parser.py", "parser_old.py"]
        original = {p: sha(root / p) for p in watched}
        steps = []

        def step(sid: str, commands: list[tuple[str, list[str], tuple[int, ...]]], mutate=None) -> None:
            outs = []
            for shown_cmd, args, ok in commands:
                r = run(root, *args, ok=ok)
                if "--dry-run" in args and "json" in args:
                    plan_path.write_text(r.stdout, encoding="utf-8")
                outs.append({"cmd": shown_cmd, "code": r.returncode, "out": clean("\n".join(t.strip("\n") for t in (r.stdout, r.stderr) if t.strip()), root)})
            # the files as the command saw them; `mutate` then undoes a deliberate edit before the next step
            steps.append({"id": sid, "runs": outs, "files": [{"path": p, "sha": (sha(root / p) or "")[:12] or None, "same": sha(root / p) == original[p]} for p in watched],
                          "status": clean(git(root, "status", "--porcelain", "--untracked-files=all"), root)})
            if mutate:
                mutate()

        base = ["--base", "HEAD~1"]
        step("review", [("repo-gardener diff . --base HEAD~1", ["diff", ".", *base], (0,)),
                        ("repo-gardener fix . --base HEAD~1 --dry-run --format json > ../reviewed-plan.json",
                         ["fix", ".", *base, "--dry-run", "--format", "json"], (0,))])
        plan = json.loads(plan_path.read_text(encoding="utf-8"))
        bad = 'python -c "import parser_old"'
        step("failed-validation", [(f"repo-gardener fix . --base HEAD~1 --apply --plan ../reviewed-plan.json --validate '{bad}' --validation-timeout 60",
                                    ["fix", ".", *base, "--apply", "--plan", str(plan_path), "--validate", bad, "--validation-timeout", "60"], (1, 2))])
        parser_py = (root / "parser.py").read_bytes()
        (root / "parser.py").write_bytes(parser_py.replace(b"value.strip()", b"value.strip().lower()"))
        step("stale-plan", [("repo-gardener fix . --base HEAD~1 --apply --plan ../reviewed-plan.json --validate 'python app.py' --validation-timeout 60",
                             ["fix", ".", *base, "--apply", "--plan", str(plan_path), "--validate", "python app.py", "--validation-timeout", "60"], (1, 2))],
             mutate=lambda: (root / "parser.py").write_bytes(parser_py))
        step("apply", [("repo-gardener fix . --base HEAD~1 --apply --plan ../reviewed-plan.json --validate 'python app.py' --validation-timeout 60",
                        ["fix", ".", *base, "--apply", "--plan", str(plan_path), "--validate", "python app.py", "--validation-timeout", "60"], (0,)),
                       ("repo-gardener diff . --base HEAD~1", ["diff", ".", *base], (0,))])
        step("restore", [("repo-gardener fix . --restore", ["fix", ".", "--restore"], (0,))])
        session = {"plan": {k: plan[k] for k in ("schema_version", "plan_id", "base_ref", "base_sha", "head_sha", "config_sha256", "accepted_sha256",
                                                  "automatic_deletion_blockers", "operations", "validation_required")},
                   "tampered": {"file": "parser.py", "from": "value.strip()", "to": "value.strip().lower()"}, "steps": steps}

    # ---- the repository's own test suite ----
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.is_file() else {}
    if a.skip_tests and old.get("tests"):
        tests = old["tests"]
    else:
        with tempfile.TemporaryDirectory() as t:
            xml = Path(t) / "junit.xml"
            subprocess.run([a.python, "-m", "pytest", "-q", "-p", "no:cacheprovider", f"--junitxml={xml}"], cwd=repo, capture_output=True, text=True)
            suite = ET.parse(xml).getroot()
            suite = suite if suite.tag == "testsuite" else suite.find("testsuite")
            n, skipped = int(suite.get("tests")), int(suite.get("skipped"))
            failed = int(suite.get("failures")) + int(suite.get("errors"))
            if failed:
                sys.exit(f"{failed} tests failed; fix the checkout before publishing its numbers")
            tests = {"collected": n, "passed": n - skipped, "skipped": skipped, "python": subprocess.run([a.python, "--version"], capture_output=True, text=True).stdout.split()[-1],
                     "seconds": round(float(suite.get("time")))}
    safety = re.search(r"\*\*(\d+) / (\d+)\*\*", (repo / "benchmarks/safety-benchmark.md").read_text(encoding="utf-8"))
    real = json.loads((repo / "benchmarks/real-world-alpha11.json").read_text(encoding="utf-8"))
    repos = real["repositories"]
    data = {
        "source": {"repo": "https://github.com/niansia/ai-repo-gardener", "version": version, "commit": commit, "run": date.today().isoformat()},
        "gate": {"confidence": 0.85, "risk": 0.20},   # skills/repo-gardener/references/finding-schema.md
        "corpus": {"cases": len(manifest["cases"]), **score}, "cases": cases, "session": session, "tests": tests,
        "safety": {"false_positives": int(safety.group(1)), "variants": int(safety.group(2))},
        "real": {"version": real["repo_gardener_version"], "measured": real["measured_at"][:10], "repos": sorted(repos),
                 "python_files": sum(max(r["python_files"] for r in v["runs"].values()) for v in repos.values()),
                 "candidates": sum(r.get("safe_delete_candidates", 0) for v in repos.values() for r in v["runs"].values())},
    }
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for leak in ("Users", "AppData", "gardener-showcase-"):
        if leak in text:
            sys.exit(f"refusing to write: output still contains {leak!r}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size} bytes) from AI Repo Gardener {version} @ {commit[:12]}; corpus {score}")


if __name__ == "__main__":
    main()
