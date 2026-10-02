"""Cut Yuki's original sprite sheet into the lightweight layers the site animates.

Run from the repository root:  python tools/build_yuki_assets.py
Input : assets/lab/yuki-sprites.png  (four full-body poses on one transparent sheet)
Output: assets/lab/yuki/pet.webp      (idle-without-tail, walk, happy, yawn, idle-blink)
        assets/lab/yuki/tail.webp     (idle tail, animated separately)
        assets/lab/yuki/heads.webp    (idle, happy, sleepy bust for the pointer companion)
        assets/lab/yuki/layout.json   (cell geometry used by the CSS)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
from walk_cycle import cycle  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/lab/yuki-sprites.png'
OUT = ROOT / 'assets/lab/yuki'
CHAR_HEIGHT = 440  # rendered source pixels per character (about 2.8x the 156px display size)


def characters(sheet: Image.Image) -> list[tuple[np.ndarray, tuple[int, int]]]:
    """Split the sheet by connectivity so limbs that cross the grid stay with their owner."""
    rgba = np.asarray(sheet).copy()
    solid = rgba[..., 3] > 24
    labels, count = ndimage.label(ndimage.binary_dilation(solid, iterations=2))
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    keep = np.argsort(sizes)[::-1][:4] + 1
    boxes = sorted(((ndimage.find_objects(labels == k)[0], k) for k in keep), key=lambda item: item[0][1].start)
    result = []
    for (rows, cols), k in boxes:
        part = rgba[rows, cols].copy()
        part[labels[rows, cols] != k] = 0
        result.append((part, (cols.start, rows.start)))
    return result


def head_centre(part: np.ndarray) -> float:
    alpha = part[..., 3] > 60
    band = alpha[int(part.shape[0] * .08):int(part.shape[0] * .2)]
    xs = np.nonzero(band)[1]
    return float(xs.mean())


def split_tail(idle: np.ndarray) -> tuple[np.ndarray, np.ndarray, tuple[int, int]]:
    """The idle tail is light fur to the right of the legs; lift it into its own layer."""
    h, w = idle.shape[:2]
    rgb = idle[..., :3].astype(int)
    light = (rgb.mean(axis=2) > 150) & (rgb.max(axis=2) - rgb.min(axis=2) < 48) & (idle[..., 3] > 10)
    region = np.zeros((h, w), bool)
    region[int(h * .5):int(h * .86), int(w * .68):] = True
    fur = ndimage.binary_closing(light & region, iterations=2)
    labels, count = ndimage.label(fur)
    if count:
        sizes = ndimage.sum(fur, labels, range(1, count + 1))
        fur = labels == (int(np.argmax(sizes)) + 1)
    # Grow into the grey, shaded tip and the soft halo; the skirt is bluish and the stockings dark.
    grey = (rgb.mean(axis=2) > 48) & (rgb[..., 2] - rgb[..., 0] < 14) & (idle[..., 3] > 0)
    for _ in range(12):
        fur = ndimage.binary_dilation(fur, iterations=2) & region & grey
    fur = ndimage.binary_dilation(fur, iterations=2) & region & (idle[..., 3] > 0) & (rgb.mean(axis=2) > 44)
    # Shading slivers left behind are detached from the body; hand them to the tail too.
    rest = (idle[..., 3] > 0) & ~fur
    labels, count = ndimage.label(rest)
    if count > 1:
        sizes = ndimage.sum(rest, labels, range(1, count + 1))
        fur |= rest & (labels != int(np.argmax(sizes)) + 1) & region
    if fur.sum() < 50:  # no separable tail (e.g. hidden by a dress): keep the body whole
        tail = np.zeros_like(idle)
        tail[h - 3:h - 1, w - 3:w - 1] = [255, 255, 255, 1]
        return idle, tail, (h - 3, w - 3)
    tail = np.zeros_like(idle)
    tail[fur] = idle[fur]
    body = idle.copy()
    body[fur] = 0
    ys, xs = np.nonzero(fur)
    top = int(ys.min())
    pivot = (int(xs[ys < top + 12].mean()), top)
    return body, tail, pivot


def blink(idle: np.ndarray, origin: tuple[int, int]) -> np.ndarray:
    """Close both eyes with sampled skin tone and a soft lash line."""
    img = Image.fromarray(idle)
    draw = ImageDraw.Draw(img)
    ox, oy = origin
    skin = tuple(int(v) for v in idle[185 - oy, 175 - ox, :3]) + (255,)
    lash = (92, 72, 96, 255)
    for (x0, y0, x1, y1) in ((134, 150, 168, 175), (190, 132, 222, 158)):
        box = [x0 - ox, y0 - oy, x1 - ox, y1 - oy]
        draw.ellipse(box, fill=skin)
        mid = (box[1] + box[3]) / 2 + (box[3] - box[1]) * .12
        draw.arc([box[0], mid - (box[3] - box[1]) * .35, box[2], mid + (box[3] - box[1]) * .35], 10, 170,
                 fill=lash, width=3)
    return np.asarray(img)


def scaled(part: np.ndarray, factor: float) -> Image.Image:
    img = Image.fromarray(part)
    return img.resize((max(1, round(img.width * factor)), max(1, round(img.height * factor))), Image.LANCZOS)


def head_anchor(cell: np.ndarray) -> list[float]:
    """Head geometry as fractions of the cell: [centre x, top (ear tips), head width, crown].
    Props such as the patting hand, the neck cut and the head pivot are measured from the ear tips. Hats and headbands
    rest on the crown instead: the top of the hair between the ears. The ears stick up above the hair, so the top edge
    is first smoothed with an opening wider than an ear, which leaves the hair line, read at the head centre."""
    h, w = cell.shape[:2]
    alpha = cell[..., 3] > 60
    cx = head_centre(cell)
    band = alpha[:, max(0, int(cx - w * .06)):int(cx + w * .06)]
    top = int(np.nonzero(band.any(axis=1))[0].min())
    row = np.nonzero(alpha[min(h - 1, top + int(h * .06))])[0]
    width = (row.max() - row.min()) if row.size else w * .4
    head = alpha[:int(h * .3)]
    edge = np.where(head.any(axis=0), head.argmax(axis=0), head.shape[0]).astype(float)
    ear = int(w * .2) | 1
    hair = ndimage.minimum_filter1d(ndimage.maximum_filter1d(edge, ear, mode='nearest'), ear, mode='nearest')
    c = int(round(cx))
    crown = float(hair[max(0, c - 2):c + 3].mean())
    return [round(cx / w, 4), round(top / h, 4), round(width / w, 4), round(crown / h, 4)]


def reanchor(folder: Path) -> None:
    """Recompute the head anchors of an already built sheet (pet.webp + layout.json) in place."""
    text = (folder / 'layout.json').read_text(encoding='utf-8')
    layout = json.loads(text)
    sheet = np.asarray(Image.open(folder / 'pet.webp').convert('RGBA'))
    cw = layout['cell'][0]
    layout['anchors'] = [head_anchor(sheet[:, i * cw:(i + 1) * cw]) for i in range(sheet.shape[1] // cw)]
    indent = 2 if text.startswith('{\n') else None   # outfits are written compact by build_wardrobe.py
    (folder / 'layout.json').write_text(json.dumps(layout, indent=indent) + '\n', encoding='utf-8')
    print(folder.name, layout['anchors'][0])


def skirt_hem(cell: np.ndarray) -> int:
    """Lowest row of the skirt (navy, bluish pixels) in the lower body; a proportional fallback otherwise."""
    h = cell.shape[0]
    rgb = cell[..., :3].astype(int)
    navy = (cell[..., 3] > 40) & (rgb[..., 2] - rgb[..., 0] > 10) & (rgb.mean(axis=2) < 110)
    rows = [y for y in range(int(h * .45), int(h * .72)) if navy[y].sum() >= 6]
    return (max(rows) - 2) if rows else int(h * .58)


def main(source: Path = SOURCE, out: Path = OUT, blink_origin: bool = True) -> None:
    sheet = Image.open(source).convert('RGBA')
    found = characters(sheet)
    parts = [part for part, _ in found]
    origin = found[0][1]
    names = ['idle', 'walk', 'happy', 'yawn']
    factor = CHAR_HEIGHT / max(p.shape[0] for p in parts)
    idle_body, tail, pivot = split_tail(parts[0])
    frames = [idle_body, parts[1], parts[2], parts[3], blink(idle_body, origin) if blink_origin else idle_body]
    centres = [head_centre(p) for p in parts] + [head_centre(parts[0])]
    half = max(max(c, p.shape[1] - c) for c, p in zip(centres, frames)) * factor
    cell_w, cell_h = int(np.ceil(half * 2)) + 4, CHAR_HEIGHT + 4
    cells, offsets = [], []
    for frame, centre in zip(frames, centres):
        img = scaled(frame, factor)
        cell = Image.new('RGBA', (cell_w, cell_h))
        x, y = round(cell_w / 2 - centre * factor), cell_h - 2 - img.height
        cell.alpha_composite(img, (x, y))
        cells.append(np.asarray(cell)); offsets.append((x, y))
    # Eight-frame walk cycle baked from the single walking pose (see walk_cycle.py).
    try:
        walk = cycle(cells[1], skirt_hem(cells[1]))
    except Exception as error:  # long dresses hide the legs: fall back to the still stride
        print('walk cycle fallback:', error)
        walk = [cells[1]] * 8
    cells += walk
    sheet_out = Image.new('RGBA', (cell_w * len(cells), cell_h))
    for i, cell in enumerate(cells):
        sheet_out.alpha_composite(Image.fromarray(cell), (i * cell_w, 0))
    OUT.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    sheet_out.save(out / 'pet.webp', quality=88, method=6)

    ox, oy = offsets[0]
    tail_img = scaled(tail, factor)
    ys, xs = np.nonzero(np.asarray(tail_img)[..., 3] > 8)
    tail_box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    tail_img.crop(tail_box).save(out / 'tail.webp', quality=88, method=6)

    # Pointer companion busts: forehead-to-collar crops, square cells.
    # The happy bust shifts left so her whole waving hand stays in frame.
    head_boxes = [(parts[0], 0), (parts[2], -30), (parts[3], 0)]
    busts = []
    for part, shift in head_boxes:
        c = head_centre(part) + shift
        crop = Image.fromarray(part).crop((int(c - 140), 0, int(c + 140), 280))
        busts.append(crop.resize((160, 160), Image.LANCZOS))
    heads = Image.new('RGBA', (160 * len(busts), 160))
    for i, bust in enumerate(busts):
        heads.alpha_composite(bust, (160 * i, 0))
    heads.save(out / 'heads.webp', quality=90, method=6)

    layout = {
        'cell': [cell_w, cell_h], 'frames': names + ['blink'] + [f'walk{i}' for i in range(8)],
        'anchors': [head_anchor(cell) for cell in cells],
        'tail': {'box': [tail_box[0] + ox, tail_box[1] + oy, tail_box[2] + ox, tail_box[3] + oy],
                 'pivot': [round(pivot[0] * factor) + ox, round(pivot[1] * factor) + oy]},
    }
    (out / 'layout.json').write_text(json.dumps(layout, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(layout))


if __name__ == '__main__':
    # python tools/build_yuki_assets.py [sheet.png out_dir]  (defaults to the hoodie outfit)
    # python tools/build_yuki_assets.py --anchors           (re-measure the anchors of the hoodie and every outfit)
    if sys.argv[1:2] == ['--anchors']:
        for folder in [OUT] + sorted(p for p in (OUT / 'outfits').iterdir() if (p / 'layout.json').exists()):
            reanchor(folder)
    elif len(sys.argv) == 3:
        main(Path(sys.argv[1]), Path(sys.argv[2]))
    else:
        main()
