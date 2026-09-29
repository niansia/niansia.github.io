/* ChromaRecover in the browser: a Web Worker that runs the real Python package with Pyodide.

   The engine is the wheel built from the pinned ChromaRecover commit (tools/chromarecover_showcase.py); its SHA-256 is
   checked against data.json before it is installed. NumPy, OpenCV and Pillow come from the Pyodide distribution.
   Images never leave the page: they arrive here as pixels or file bytes and are processed in this worker. */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.29.5/full/';
let py = null;

const post = (type, data = {}, transfer = []) => self.postMessage({type, ...data}, transfer);
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

const RUNNER = String.raw`
import io, json, time
import numpy as np, cv2, PIL
from PIL import Image
import chromarecover
from chromarecover import recover, RecoverConfig
from chromarecover.synthetic import make_polygon_mosaic, make_chromatic_pattern

CONFIG = RecoverConfig(presentation_max_side=768, max_pixels=16_000_000)

def png(arr):
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, "PNG", compress_level=3)
    return buf.getvalue()

def overlap(a, b):
    """Selected pixels against the generator's truth: precision (share of the selection that is truth), recall, IoU."""
    if a is None or b is None:
        return None
    if a.shape != b.shape:
        a = cv2.resize(a.astype(np.uint8), (b.shape[1], b.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    a, b = a.astype(bool), b.astype(bool)
    inter, sel, truth, union = np.logical_and(a, b).sum(), a.sum(), b.sum(), np.logical_or(a, b).sum()
    return {"precision": round(float(inter / sel), 4) if sel else None, "recall": round(float(inter / truth), 4) if truth else None,
            "iou": round(float(inter / union), 4) if union else None}

def raw(x):
    """Bytes from a JS typed array, whether Pyodide handed it over as a proxy or already as a buffer."""
    return bytes(x.to_py() if hasattr(x, "to_py") else x)

def number(v):
    return round(float(v), 6) if isinstance(v, (int, float, np.floating)) and not isinstance(v, bool) else v

def run(request):
    source = request["source"]
    support = glyph = None
    if source["kind"] == "generate":
        maker = make_polygon_mosaic if source["generator"] == "mosaic" else make_chromatic_pattern
        case = maker(size=int(source["size"]), text=str(source["text"]), seed=int(source["seed"]), structured=bool(source["structured"]))
        image = case.image
        support = case.support_mask if case.support_mask is not None else case.mask
        glyph = case.mask
    elif source["kind"] == "rgba":
        rgba = np.frombuffer(raw(source["data"]), dtype=np.uint8).reshape(int(source["height"]), int(source["width"]), 4)
        image = rgba.copy()
    else:
        image = np.asarray(Image.open(io.BytesIO(raw(source["data"]))).convert("RGB"))
    options = request["options"]
    t = time.perf_counter()
    r = recover(image, mode=options["mode"], semantics=options["semantics"], top_k=int(options["top_k"]), config=CONFIG)
    wall = time.perf_counter() - t
    files = {"input": png(image[..., :3] if image.ndim == 3 else image)}
    candidates = []
    for c in r.candidates:
        n = c.rank
        files[f"overlay_{n}"] = png(c.overlay)
        files[f"evidence_{n}"] = png((np.clip(c.evidence_map, 0, 1) * 255).astype(np.uint8))
        files[f"mask_{n}"] = png(c.mask.astype(np.uint8) * 255)
        files[f"structure_{n}"] = png(c.structure_mask.astype(np.uint8) * 255)
        candidates.append({"rank": n, "id": c.id, "source": c.source_hypothesis, "structure": round(c.structure_score, 6), "capture": round(c.capture_confidence, 6),
                           "decision": round(c.decision_confidence, 6), "warnings": c.warnings, "metrics": {k: number(v) for k, v in c.metrics.items()},
                           "semantics": c.semantics or None, "truth_support": overlap(c.mask, support), "truth_glyph": overlap(c.structure_mask, glyph)})
    q = r.quality
    summary = {"status": r.status, "mode_resolved": r.input_info.get("mode_resolved"), "width": int(image.shape[1]), "height": int(image.shape[0]),
               "candidates": candidates, "semantics": r.semantics, "timing_ms": r.timing_ms, "wall_s": round(wall, 3),
               "quality": {k: round(float(getattr(q, k)), 4) for k in ("blur", "clipping", "glare", "color_spread", "moire", "banding", "texture_support")} | {"warnings": q.warnings},
               "config_fingerprint": r.config_fingerprint, "algorithm_version": r.algorithm_version, "has_truth": support is not None}
    return json.dumps(summary), files
`;

async function load(expected) {
  post('progress', {stage: 'runtime', pct: 4});
  importScripts(PYODIDE + 'pyodide.js');
  py = await loadPyodide({indexURL: PYODIDE});
  post('progress', {stage: 'packages', pct: 28});
  await py.loadPackage(['numpy', 'opencv-python', 'pillow', 'micropip'], {messageCallback: () => {}});
  post('progress', {stage: 'engine', pct: 82});
  const url = new URL(expected.file, self.location.href).href;
  const bytes = await (await fetch(url, {cache: 'force-cache'})).arrayBuffer();
  const digest = hex(await crypto.subtle.digest('SHA-256', bytes));
  if (digest !== expected.sha256) throw new Error(`engine checksum mismatch: expected ${expected.sha256.slice(0, 12)}…, got ${digest.slice(0, 12)}…`);
  py.FS.writeFile('/tmp/' + expected.file, new Uint8Array(bytes));
  await py.pyimport('micropip').install.callKwargs('emfs:/tmp/' + expected.file, {deps: false});
  post('progress', {stage: 'warm', pct: 94});
  await py.runPythonAsync(RUNNER);
  const versions = JSON.parse(await py.runPythonAsync(`
import sys, json, numpy, cv2, PIL, chromarecover
from PIL import features
json.dumps({"python": sys.version.split()[0], "numpy": numpy.__version__, "opencv": cv2.__version__, "pillow": PIL.__version__,
            "chromarecover": chromarecover.__version__, "pyodide": "0.29.5", "littlecms": bool(features.check("littlecms2"))})`));
  post('ready', {versions, sha256: digest});
}

async function run(message) {
  const started = performance.now();
  const req = py.toPy({source: message.source, options: message.options});
  const out = py.globals.get('run')(req);
  const [summaryText, files] = out.toJs({dict_converter: Object.fromEntries});
  out.destroy(); req.destroy();
  const buffers = [], images = {};
  for (const [name, value] of Object.entries(files)) {
    const bytes = value instanceof Uint8Array ? value : value.toJs();   // Python bytes arrive as a proxy or a Uint8Array
    const copy = bytes.slice(); images[name] = copy.buffer; buffers.push(copy.buffer);
    if (value.destroy) value.destroy();
  }
  post('result', {id: message.id, summary: JSON.parse(summaryText), images, browser_ms: Math.round(performance.now() - started)}, buffers);
}

self.onmessage = async ({data}) => {
  try {
    if (data.type === 'load') await load(data.expected);
    else if (data.type === 'run') await run(data);
  } catch (error) {
    post('error', {id: data.id, message: String(error && error.message || error).split('\n').slice(-3).join(' ')});
  }
};
