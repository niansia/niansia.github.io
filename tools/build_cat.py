"""Turn the generated cat sprite sheets into Yuki's cat form (see tools/cat/README.md for how to generate them).

Put the sheets at  art/cat/a.png, art/cat/b.png, art/cat/c.png  (art/ is git-ignored) and run:
    python tools/build_cat.py [sheet_dir]
Each sheet holds four cats in a row; the first one is always the standing cat, so every sheet is scaled until its
standing cat has the same height. The script keys out a flat background (reusing build_outfits.remove_background),
cuts the figures, bottom-aligns them in equal cells and writes to assets/lab/yuki/cat/:
    cat.webp     one row of frames (stand, walkA, walkB, leap, sit, belly, curl, happy, stretch, crouch)
    heads.webp   normal, happy and sleepy busts for the chat avatar and the pointer companion (like the catgirl's)
    thumb.webp   the menu thumbnail
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
SHEETS = {'a': ['stand', 'walkA', 'walkB', 'leap'], 'b': [None, 'sit', 'belly', 'curl'], 'c': [None, 'happy', 'stretch', 'crouch']}
STAND_HEIGHT = 300   # pixels of the standing cat in the output (shown at about 80 px, so crisp on 3x screens)
PAD = 6


def trim(part: np.ndarray) -> np.ndarray:
    ys, xs = np.nonzero(part[..., 3] > 8)
    return part[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def head_box(cell: np.ndarray) -> tuple[int, int, int, int]:
    """The cat faces right: her head is the solid mass at the top right of the figure."""
    alpha = cell[..., 3] > 60
    ys, xs = np.nonzero(alpha)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    band = alpha[y0:y0 + int((y1 - y0) * .6), x0 + int((x1 - x0) * .52):x1 + 1]
    by, bx = np.nonzero(band)
    if not by.size:
        return int(x0), int(y0), int(x1), int(y1)
    return int(x0 + (x1 - x0) * .52 + bx.min()), int(y0 + by.min()), int(x0 + (x1 - x0) * .52 + bx.max()), int(y0 + by.max())


def main(src: Path) -> None:
    frames: dict[str, np.ndarray] = {}
    for sheet, names in SHEETS.items():
        path = next((p for ext in ('png', 'webp', 'jpg', 'jpeg') if (p := src / f'{sheet}.{ext}').exists()), None)
        if not path:
            sys.exit(f'missing {src / sheet}.png (see tools/cat/README.md)')
        cats = [trim(part) for part, _ in characters(remove_background(Image.open(path)))]
        if len(cats) != 4:
            sys.exit(f'{path.name}: found {len(cats)} cats, expected 4 in a row')
        factor = STAND_HEIGHT / cats[0].shape[0]
        for name, part in zip(names, cats):
            if name:
                img = Image.fromarray(part)
                frames[name] = np.asarray(img.resize((max(1, round(img.width * factor)), max(1, round(img.height * factor))), Image.LANCZOS))
    order = [n for names in SHEETS.values() for n in names if n]
    cw = max(f.shape[1] for f in frames.values()) + 2 * PAD
    ch = max(f.shape[0] for f in frames.values()) + 2 * PAD
    strip = Image.new('RGBA', (cw * len(order), ch))
    cells, anchors = {}, {}
    for i, name in enumerate(order):
        f = frames[name]
        cell = np.zeros((ch, cw, 4), np.uint8)
        x = (cw - f.shape[1]) // 2
        cell[ch - PAD - f.shape[0]:ch - PAD, x:x + f.shape[1]] = f   # paws on the same baseline
        cells[name] = cell
        strip.paste(Image.fromarray(cell), (i * cw, 0))
        hx0, hy0, hx1, hy1 = head_box(cell)
        anchors[name] = [round((hx0 + hx1) / 2 / cw, 4), round(hy0 / ch, 4), round((hx1 - hx0) / cw, 4)]
    OUT.mkdir(parents=True, exist_ok=True)
    strip.save(OUT / 'cat.webp', quality=88, method=6)
    heads = Image.new('RGBA', (480, 160))
    for k, name in enumerate(['stand', 'happy', 'curl']):
        hx0, hy0, hx1, hy1 = head_box(cells[name])
        side = int(max(hx1 - hx0, hy1 - hy0) * 1.12)
        cx, cy = (hx0 + hx1) // 2, (hy0 + hy1) // 2
        bust = Image.fromarray(cells[name]).crop((cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)).resize((160, 160), Image.LANCZOS)
        heads.paste(bust, (k * 160, 0))
    heads.save(OUT / 'heads.webp', quality=90, method=6)
    heads.crop((0, 0, 160, 160)).resize((96, 96), Image.LANCZOS).save(OUT / 'thumb.webp', quality=88)
    stand = frames['stand']
    layout = {'frames': order, 'cell': [cw, ch], 'stand': [round(stand.shape[1] / cw, 4), round(stand.shape[0] / ch, 4)], 'anchors': anchors}
    (OUT / 'layout.json').write_text(json.dumps(layout, indent=1) + '\n', encoding='utf-8')
    print(f'{len(order)} frames, cell {cw}x{ch}, cat.webp {(OUT / "cat.webp").stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'art/cat')
