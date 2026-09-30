"""Turn the generated cat sprite sheets into Yuki's cat form (see tools/cat/README.md for how to generate them).

Put the sheets at  art/cat/a.png, art/cat/b.png, art/cat/c.png  (art/ is git-ignored) and run:
    python tools/build_cat.py [sheet_dir]
Each sheet holds four cats in a row; the first one is always the standing cat, so every sheet is scaled until its
standing cat has the same height. The script keys out a flat background (reusing build_outfits.remove_background),
cuts the figures, bottom-aligns them in equal cells and writes to assets/lab/yuki/cat/:
    cat.webp     one row of frames (stand, walkA, walkB, leap, sit, belly, curl, happy, stretch, crouch)
    heads.webp   normal, happy and sleepy busts for the chat avatar and the pointer companion (like the catgirl's)
    layout.json  frame order, cell size, where the standing cat sits in its cell, head anchors per frame
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from build_outfits import remove_background  # noqa: E402
from build_yuki_assets import characters  # noqa: E402

OUT = ROOT / 'assets/lab/yuki/cat'
SHEETS = {'a': ['stand', 'walkA', 'walkB', 'leap'], 'b': [None, 'sit', 'belly', 'curl'], 'c': [None, 'happy', 'stretch', 'crouch'],
          'd': [None, 'lie', 'swipe', 'groom']}
OPTIONAL = {'d'}   # extra poses; yuki-cat.js falls back to the closest frame it has
STAND_HEIGHT = 240   # pixels of the standing cat in the output (shown at about 78 px: sharp on 3x screens)
STEADY = {'stand', 'walkA', 'walkB', 'leap'}   # frames placed by the head, so walking does not sway the body
PAD = 6


def trim(part: np.ndarray) -> np.ndarray:
    ys, xs = np.nonzero(part[..., 3] > 8)
    return part[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def head_box(cell: np.ndarray, depth: float = .6) -> tuple[int, int, int, int]:
    """The cat faces right: her head is the solid mass at the top right of the figure (depth: how far down to look;
    a curled-up cat rests her head low, so her whole right side is searched)."""
    alpha = cell[..., 3] > 60
    ys, xs = np.nonzero(alpha)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    band = alpha[y0:y0 + int((y1 - y0) * depth), x0 + int((x1 - x0) * .52):x1 + 1]
    by, bx = np.nonzero(band)
    if not by.size:
        return int(x0), int(y0), int(x1), int(y1)
    return int(x0 + (x1 - x0) * .52 + bx.min()), int(y0 + by.min()), int(x0 + (x1 - x0) * .52 + bx.max()), int(y0 + by.max())


def head_anchor(cell: np.ndarray, depth: float = .6) -> list[float]:
    """Head centre, crown (ear tips) and the width of the face below the ears, as fractions of the cell: what props such
    as the patting hand are sized and placed by. Measured on the rows a third of the way down the head."""
    h, w = cell.shape[:2]
    hx0, hy0, hx1, hy1 = head_box(cell, depth)
    alpha = cell[..., 3] > 60
    spans = []
    for y in range(hy0 + int((hy1 - hy0) * .28), hy0 + int((hy1 - hy0) * .42) + 1):
        xs = np.nonzero(alpha[y, hx0:hx1 + 1])[0]
        if xs.size:
            spans.append((hx0 + xs.min(), hx0 + xs.max()))
    left = np.median([a for a, _ in spans]) if spans else hx0
    right = np.median([b for _, b in spans]) if spans else hx1
    return [round((left + right) / 2 / w, 4), round(hy0 / h, 4), round(max(right - left, w * .2) / w, 4)]   # a head bent low can hide the face rows


def main(src: Path) -> None:
    frames: dict[str, np.ndarray] = {}
    for sheet, names in SHEETS.items():
        path = next((p for ext in ('png', 'webp', 'jpg', 'jpeg') if (p := src / f'{sheet}.{ext}').exists()), None)
        if not path:
            if sheet in OPTIONAL:
                continue
            sys.exit(f'missing {src / sheet}.png (see tools/cat/README.md)')
        cats = [trim(part) for part, _ in characters(remove_background(Image.open(path)))]
        if len(cats) != 4:
            sys.exit(f'{path.name}: found {len(cats)} cats, expected 4 in a row')
        factor = STAND_HEIGHT / cats[0].shape[0]
        for name, part in zip(names, cats):
            if name:
                img = Image.fromarray(part)
                frames[name] = np.asarray(img.resize((max(1, round(img.width * factor)), max(1, round(img.height * factor))), Image.LANCZOS))
    order = [n for names in SHEETS.values() for n in names if n and n in frames]
    ch = max(f.shape[0] for f in frames.values()) + 2 * PAD
    # The moving frames share one head column (the body swings behind it); the others are centred in the cell.
    head_x = {n: (lambda b: (b[0] + b[2]) / 2)(head_box(frames[n])) for n in STEADY}
    column = max(head_x.values()) + PAD
    cw = int(max(max(column - head_x[n] + frames[n].shape[1] for n in STEADY) + PAD, max(f.shape[1] for f in frames.values()) + 2 * PAD))
    strip = Image.new('RGBA', (cw * len(order), ch))
    cells, anchors = {}, {}
    for i, name in enumerate(order):
        f = frames[name]
        cell = np.zeros((ch, cw, 4), np.uint8)
        x = int(round(column - head_x[name])) if name in STEADY else (cw - f.shape[1]) // 2
        cell[ch - PAD - f.shape[0]:ch - PAD, x:x + f.shape[1]] = f   # paws on the same baseline
        cells[name] = cell
        strip.paste(Image.fromarray(cell), (i * cw, 0))
        anchors[name] = head_anchor(cell, 1 if name in ('curl', 'lie') else .6)
    OUT.mkdir(parents=True, exist_ok=True)
    strip.save(OUT / 'cat.webp', quality=88, method=6)
    heads = Image.new('RGBA', (480, 160))
    for k, name in enumerate(['stand', 'happy', 'curl']):
        hx0, hy0, hx1, hy1 = head_box(cells[name], 1 if name == 'curl' else .6)
        side = int(max(hx1 - hx0, hy1 - hy0) * 1.12)
        cx, cy = (hx0 + hx1) // 2, (hy0 + hy1) // 2
        bust = Image.fromarray(cells[name]).crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((160, 160), Image.LANCZOS)
        heads.paste(bust, (k * 160, 0))
    heads.save(OUT / 'heads.webp', quality=90, method=6)
    stand = frames['stand']
    layout = {'frames': order, 'cell': [cw, ch], 'stand': [round(stand.shape[1] / cw, 4), round(stand.shape[0] / ch, 4)], 'anchors': anchors}
    (OUT / 'layout.json').write_text(json.dumps(layout, indent=1) + '\n', encoding='utf-8')
    print(f'{len(order)} frames, cell {cw}x{ch}, cat.webp {(OUT / "cat.webp").stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'art/cat')
