"""Build assets/merriv/film.json, the data behind assets/film/merriv.html, from one run of Merriv's ONNX quantization demo.

Every value in the film comes from that run: the 629 holdout digits, the FP16 weights, what each INT8 build actually
feeds its hidden layer (read back from the quantized graphs with ONNX Runtime), the paired outcomes, the statistics and
identifiers in each Model Change Report, the bisect probes, and `merriv mcr verify` on the build-02 report. Predictions
recomputed here must reproduce the accuracy recorded in each report, or the tool refuses to write anything.

Run it with the interpreter that ran the demo (it needs numpy, onnx and onnxruntime):

    PYTHONPATH=../M2RIV/src python ../M2RIV/examples/onnx_quantization/run_demo.py --output <run>
    PYTHONPATH=../M2RIV/src python tools/merriv_film.py --run <run> [--repo ../M2RIV]
"""
from __future__ import annotations

import argparse
import base64
import io
import json
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout
from datetime import date
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import yaml
from onnx import helper, numpy_helper

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "merriv" / "film.json"
SUMMARY = ROOT / "assets" / "merriv" / "summary.json"   # what the project page shows under the film
BUILDS = ["build-00-fp16", "build-01-int8-balanced", "build-02-int8-calibration-scale-055", "build-03-int8-calibration-scale-050"]


def b64_i16(a: np.ndarray, k: float) -> str:
    """Values × k rounded into little-endian int16, base64: compact and exact enough for drawing."""
    q = np.clip(np.round(a * k), -32768, 32767).astype("<i2")
    return base64.b64encode(q.tobytes()).decode()


def run_graph(path: Path, x: np.ndarray, extra: list[str]) -> dict[str, np.ndarray]:
    """Run an artifact on CPU, also returning the named intermediate tensors."""
    m = onnx.load(path)
    elem = m.graph.input[0].type.tensor_type.elem_type
    for name in extra:
        m.graph.output.append(helper.make_tensor_value_info(name, elem, None))
    s = ort.InferenceSession(m.SerializeToString(), providers=["CPUExecutionProvider"])
    feed = x.astype(np.float16 if elem == onnx.TensorProto.FLOAT16 else np.float32)
    outs = s.run(None, {s.get_inputs()[0].name: feed})
    return {o.name: np.asarray(v).astype(np.float32) for o, v in zip(s.get_outputs(), outs)}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True)
    ap.add_argument("--repo", default=str(ROOT.parent / "M2RIV"))
    a = ap.parse_args()
    run, repo = Path(a.run).resolve(), Path(a.repo).resolve()
    git = lambda *args: subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, check=True).stdout.strip()
    if git("status", "--porcelain"):
        sys.exit(f"{repo} has uncommitted changes; the film must name the exact code that produced it")
    commit = git("rev-parse", "HEAD")

    rows = [json.loads(l) for l in (run / "suite.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    x = np.array([r["input"] for r in rows], dtype=np.float32)
    y = np.array([r["expected"] for r in rows])
    high = np.array([r["slices"]["risk"] == "high-ink" for r in rows])
    assert np.allclose(x * 16, np.round(x * 16)), "inputs are expected on the 0..16 digits grid"
    policy = yaml.safe_load((run / "policy.yaml").read_text(encoding="utf-8"))
    margins = {r["rule_id"]: r["margin"] for r in policy["rules"]}

    builds, preds = [], {}
    for b in BUILDS:
        art = run / "artifacts" / f"{b}.onnx"
        g = onnx.load(art).graph
        inits = {i.name: numpy_helper.to_array(i) for i in g.initializer}
        quant = "input_scale" in inits
        extra = ["hidden_linear", "hidden"] + (["input_DequantizeLinear_Output", "hidden_linear_DequantizeLinear_Output"] if quant else [])
        o = run_graph(art, x, extra)
        pred = o["label"].astype(int).reshape(-1)
        preds[b] = pred
        report = json.loads((run / "reports" / b / "mcr-report.json").read_text(encoding="utf-8"))
        overall = next(m for m in report["metrics"] if m["metric_id"] == "accuracy" and m["scope"] == "overall")
        acc = float((pred == y).mean())
        if abs(acc - overall["candidate_value"]) > 1e-12:
            sys.exit(f"{b}: recomputed accuracy {acc} does not match its report ({overall['candidate_value']})")
        rules = []
        for f in report["decision"]["findings"]:
            rules.append({"rule": f["rule_id"], "status": f["status"], "lo": f["interval_lower"], "hi": f["interval_upper"],
                          "delta": next(m["delta"] for m in report["metrics"] if m["metric_id"] == f["metric_id"] and m["evidence_set_id"] == f["evidence_set_id"]),
                          "margin": margins[f["rule_id"]], "p_adj": f["adjusted_p_value"], "mde": f["minimum_detectable_effect"]})
        rp = report["executions"][1]["runtime_profile"]
        entry = {"id": b, "acc": acc, "acc_high": float((pred[high] == y[high]).mean()), "status": report["decision"]["status"], "rules": rules,
                 "report_id": report["id"], "evidence_id": report["evidence_id"], "run_id": report["run_id"],
                 "baseline_snapshot": report["baseline_snapshot_id"], "candidate_snapshot": report["candidate_snapshot_id"],
                 "release_plan": report["release_plan_id"], "evidence_count": report["evidence_manifest"]["evidence_count"],
                 "runtime": f'{rp["framework"]} {rp["framework_version"]} · {rp["device"]} · {rp["dtype"]} · {rp["operating_system"]}/{rp["architecture"]} · Python {rp["python_version"]}',
                 "holm": report["decision"]["multiple_comparison_method"], "alpha": report["decision"]["familywise_alpha"],
                 **({"hidden_linear": b64_i16(o["hidden_linear"], 100)} if b in BUILDS[1:3] else {})}   # the film draws builds 01 and 02
        if quant:
            s_in, z_in = float(inits["input_scale"]), int(inits["input_zero_point"])
            s_h, z_h = float(inits["hidden_linear_scale"]), int(inits["hidden_linear_zero_point"])
            entry["input_range"] = [s_in * (-128 - z_in), s_in * (127 - z_in)]
            entry["hidden_scale"], entry["hidden_zero"] = s_h, z_h
            entry["hidden_range"] = [s_h * (-128 - z_h), s_h * (127 - z_h)]
            seen = o["input_DequantizeLinear_Output"]
            entry["clipped_pixels"] = float((x > entry["input_range"][1] + 1e-6).mean())
            entry["clipped_pixels_high"] = float((x[high] > entry["input_range"][1] + 1e-6).mean())
            entry["clipped_pixels_common"] = float((x[~high] > entry["input_range"][1] + 1e-6).mean())
            hl = o["hidden_linear"]
            entry["saturated_hidden"] = float(((hl < entry["hidden_range"][0]) | (hl > entry["hidden_range"][1])).mean())
            entry["seen_max"] = float(seen.max())
        builds.append(entry)

    base = preds[BUILDS[0]]
    for e in builds[1:]:
        c = preds[e["id"]]
        pair = lambda m: {"both": int(((base == y) & (c == y) & m).sum()), "lost": int(((base == y) & (c != y) & m).sum()),
                          "gained": int(((base != y) & (c == y) & m).sum()), "neither": int(((base != y) & (c != y) & m).sum())}
        e["pairs"] = {"overall": pair(np.ones_like(high)), "high": pair(high)}
        e["outcome"] = "".join("sLgn"[(0 if bb and cc else 1 if bb else 2 if cc else 3)] for bb, cc in zip(base == y, c == y))

    # the case the film follows: high-ink, right in FP16 and in the balanced build, wrong in both contracted builds,
    # with the most pixels above the 0.55 input ceiling (ties go to the lower case index)
    ceiling = builds[2]["input_range"][1]
    cand = [i for i in range(len(rows)) if high[i] and base[i] == y[i] and preds[BUILDS[1]][i] == y[i] and preds[BUILDS[2]][i] != y[i] and preds[BUILDS[3]][i] != y[i]]
    hero = max(cand, key=lambda i: (int((x[i] > ceiling + 1e-6).sum()), -i))

    src = onnx.load(run / "artifacts" / f"{BUILDS[0]}.onnx").graph
    w = {i.name: numpy_helper.to_array(i).astype(np.float32) for i in src.initializer}
    # after its QDQ pair the hidden layer is what the next MatMul reads; the -128 zero point folds the ReLU into that range
    hid = lambda b: "hidden" if b == BUILDS[0] else "hidden_DequantizeLinear_Output"
    logits = {b: run_graph(run / "artifacts" / f"{b}.onnx", x[hero:hero + 1], ["logits", hid(b)]) for b in BUILDS}
    num = json.loads((run / "reports" / BUILDS[2] / "numerical-diff.json").read_text(encoding="utf-8"))
    bis = json.loads((run / "bisect-result.json").read_text(encoding="utf-8"))

    sys.path.insert(0, str(repo / "src"))
    from merriv.cli import app   # the same CLI a consumer would run
    buf = io.StringIO()
    with redirect_stdout(buf):
        try:
            app(["mcr", "verify", str(run / "reports" / BUILDS[2]), "--strict"], standalone_mode=False)
        except SystemExit:
            pass
    verify = json.loads(buf.getvalue())

    data = {
        "source": {"repo": "https://github.com/niansia/Merriv", "commit": commit},
        "cases": len(rows), "high": int(high.sum()),
        "digits": "".join(chr(97 + int(v)) for v in np.round(x * 16).astype(int).ravel()),   # 'a'..'q' = 0..16 sixteenths
        "labels": "".join(str(int(v)) for v in y), "highmask": "".join("1" if h else "0" for h in high),
        "preds": {b: "".join(str(int(v)) for v in preds[b]) for b in BUILDS},
        "w0": [round(float(v), 4) for v in w["w0"].ravel()],   # 64 × 32, row-major (pixel, hidden unit)
        "builds": builds,
        "hero": {"index": hero, "case_id": rows[hero]["case_id"], "label": int(y[hero]),
                 "logits": {b: [round(float(v), 3) for v in logits[b]["logits"].ravel()] for b in BUILDS},
                 "hidden": {b: [round(float(v), 3) for v in logits[b][hid(b)].ravel()] for b in BUILDS}},
        "numerical": [{"tensor": r["name"], "ok": r["within_tolerance"], **{k: r[k] for k in ("max_abs_error", "rmse", "cosine_similarity")}}
                      for r in num["tensors"] if r["name"] != "label"],
        "numerical_first": num["first_divergent_tensor"], "numerical_cases": num["case_count"],
        "bisect": {"probes": [[p["index"], p["status"]] for p in bis["evaluations"]], "first": bis["first_failing_checkpoint"], "reason": bis["reason"]},
        "verify": {"valid": verify["valid"], "trust": verify["trust"], "checks": verify.get("checks", []),
                   "evidence_declared": verify["evidence_body_coverage"]["declared"]},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB) · hero {rows[hero]['case_id']} (label {y[hero]}) · Merriv {commit[:12]}")

    # the project page reads a small summary instead of the film's data: the results table, the trust dimensions and a
    # fresh `merriv compare` of the llama.cpp #22544 replay that ships with Merriv
    ex = repo / "examples" / "historical_llamacpp_22544"
    with tempfile.TemporaryDirectory() as t:
        buf = io.StringIO()
        with redirect_stdout(buf):
            try:
                # outside standalone mode the CLI hands back its exit code (2 means BLOCK) instead of exiting
                code = app(["compare", str(ex / "baseline.jsonl"), str(ex / "candidate.jsonl"), "--suite", str(ex / "suite.jsonl"),
                            "--policy", str(ex / "policy.yaml"), "--output", t], standalone_mode=False) or 0
            except SystemExit as e:
                code = e.code
        rep = json.loads((Path(t) / "mcr-report.json").read_text(encoding="utf-8"))
    read = lambda f: [json.loads(l) for l in (ex / f).read_text(encoding="utf-8").splitlines() if l.strip()]
    realized = {r["case_id"]: r["output"] for r in read("candidate.jsonl")}
    llama = {"status": rep["decision"]["status"], "exit": code,
             "tensors": [{"tensor": s["case_id"], "requested": s["expected"], "realized": realized[s["case_id"]]} for s in read("suite.jsonl")],
             "rules": [{"rule": f["rule_id"], "status": f["status"]} for f in rep["decision"]["findings"]]}
    summary = {
        "source": data["source"] | {"run": date.today().isoformat(), "runtime": builds[2]["runtime"]},
        "cases": data["cases"], "high": data["high"],
        "builds": [{k: b[k] for k in ("id", "acc", "acc_high", "status", "rules")} | ({"pairs": b["pairs"]} if "pairs" in b else {}) for b in builds],
        "clipped": {"all": builds[2]["clipped_pixels"], "high": builds[2]["clipped_pixels_high"], "common": builds[2]["clipped_pixels_common"]},
        "first_bad": data["bisect"]["first"], "first_divergent": data["numerical_first"],
        "divergence": data["numerical"], "evidence_count": builds[2]["evidence_count"], "trust": data["verify"]["trust"], "llama": llama,
    }
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {SUMMARY.relative_to(ROOT)} ({SUMMARY.stat().st_size} bytes) · llama.cpp #22544 replay: {llama['status']} (exit {code})")


if __name__ == "__main__":
    main()
