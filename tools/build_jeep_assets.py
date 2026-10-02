"""Cut the army jeep into the layers the study companion animates.

Run from the repository root:  python tools/build_jeep_assets.py
Input : assets/study/jeep-source.png  (side view facing left, transparent; prompt in assets/study/jeep-source-prompt.txt)
Output: assets/study/jeep/jeep.webp          the whole jeep, trimmed
        assets/study/jeep/wheel-front.webp   the front wheel as a disc, turned by CSS while the jeep drives
        assets/study/jeep/wheel-rear.webp    the rear wheel
        assets/study/jeep/layout.json        where the wheels sit, the top edge of the side panel and the rear seat,
                                             as fractions of the jeep's width and height

The page draws the jeep twice with the passenger in between: the back copy whole, the front copy clipped to below the
side panel's top edge, so the passenger's lower half disappears behind the door. The wheel discs cover the painted
wheels exactly (the tyre is a clean disc inside the fender), so turning them shows the spokes moving.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/study/jeep-source.png'
OUT = ROOT / 'assets/study/jeep'
WIDTH = 960          # output width in px (the page shows it at up to 440 px)
WHEEL_R = 160        # disc radius in source px: the tyre plus most of its outline, no fender


def wheels(rgba: np.ndarray) -> list[tuple[float, float]]:
    """Centres of the two tyres (the two big dark grey regions in the lower half), front first."""
    rgb, a = rgba[..., :3].astype(int), rgba[..., 3]
    light = rgb.mean(axis=2)
    tyre = (a > 200) & (light > 55) & (light < 110) & (rgb.max(axis=2) - rgb.min(axis=2) < 25)
    tyre[: rgba.shape[0] // 2] = False
    lab, n = ndimage.label(tyre)
    sizes = ndimage.sum(tyre, lab, range(1, n + 1))
    centres = []
    for k in np.argsort(sizes)[::-1][:2]:
        ys, xs = ndimage.find_objects(lab == k + 1)[0]
        centres.append(((xs.start + xs.stop) / 2, (ys.start + ys.stop) / 2))
    return sorted(centres)


def panel_top(rgba: np.ndarray, x0: int, x1: int) -> int:
    """Top edge of the side panel: the highest olive row that runs unbroken from x0 to x1 (the dark outline above it)."""
    rgb, a = rgba[..., :3].astype(int), rgba[..., 3]
    olive = (a > 200) & (rgb[..., 1] > rgb[..., 0]) & (rgb[..., 1] > rgb[..., 2] + 15) & (rgb.mean(axis=2) > 70)
    rows = np.nonzero(olive[:, x0:x1].all(axis=1))[0]
    return int(rows[0])


def main() -> None:
    src = Image.open(SOURCE).convert('RGBA')
    rgba = np.asarray(src).copy()
    rgba[..., 3] = np.where(rgba[..., 3] >= 250, 255, rgba[..., 3])   # the generator stops at 254
    full = Image.fromarray(rgba, 'RGBA')
    x0, y0, x1, y1 = full.getbbox()
    w, h = x1 - x0, y1 - y0
    scale = WIDTH / w
    size = (WIDTH, round(h * scale))
    OUT.mkdir(parents=True, exist_ok=True)
    full.crop((x0, y0, x1, y1)).resize(size, Image.LANCZOS).save(OUT / 'jeep.webp', 'WEBP', quality=90, method=6)

    layout = {'width': size[0], 'height': size[1], 'wheels': []}
    yy, xx = np.mgrid[-WHEEL_R:WHEEL_R, -WHEEL_R:WHEEL_R] + .5
    disc = np.clip(WHEEL_R - np.hypot(xx, yy) + .5, 0, 1)          # anti-aliased edge
    for name, (cx, cy) in zip(('front', 'rear'), wheels(rgba)):
        box = (round(cx - WHEEL_R), round(cy - WHEEL_R), round(cx + WHEEL_R), round(cy + WHEEL_R))
        part = np.asarray(full.crop(box)).copy()
        part[..., 3] = (part[..., 3] * disc).astype(np.uint8)
        d = round(2 * WHEEL_R * scale)
        Image.fromarray(part, 'RGBA').resize((d, d), Image.LANCZOS).save(OUT / f'wheel-{name}.webp', 'WEBP', quality=90, method=6)
        layout['wheels'].append({'name': name, 'cx': round((cx - x0) / w, 4), 'cy': round((cy - y0) / h, 4),
                                 'r': round(WHEEL_R / w, 4)})
    # the rear seat: between the driver's seat back and the spare tyre; its back's top is where a passenger's head goes
    rear = sorted(c[0] for c in wheels(rgba))[1]
    line = panel_top(rgba, int(rear - 200), int(rear + 150)) - 6   # include the dark outline above the olive
    layout['panel'] = round((line - y0) / h, 4)
    layout['seat'] = round((1238 - x0) / w, 4)       # centre of the rear seat back (measured on the source)
    (OUT / 'layout.json').write_text(json.dumps(layout, indent=1) + '\n', encoding='utf-8')
    print(json.dumps(layout))


if __name__ == '__main__':
    main()
