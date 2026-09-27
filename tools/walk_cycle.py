"""Bake a real walk cycle from Yuki's single walking pose.

The legs below the skirt are cut out, split into the back and front leg, and swung around
their hips in opposite phase (a pendulum gait), so each leg alternately leads. Every frame is
re-grounded on its lowest foot, which gives the natural rise at the passing position.
Used by build_yuki_assets.py; run directly to render a contact sheet for review.
"""
from __future__ import annotations

import math

import numpy as np
from PIL import Image
from scipy import ndimage

FRAMES = 8
SWING = 30  # degrees each leg travels between its back and front positions


def split_legs(cell: np.ndarray, hem: int):
    """Return body (without legs), back leg, front leg, hip pivots. cell is RGBA (H, W, 4)."""
    h, w = cell.shape[:2]
    rgb = cell[..., :3].astype(int)
    alpha = cell[..., 3] > 20
    lum = rgb.mean(axis=2)
    yy, xx = np.mgrid[:h, :w]
    below = yy >= hem
    stocking = alpha & below & (lum < 115)
    # Shoes are white but sit at the bottom; the tail is white fur higher up and to the side.
    shoe = alpha & (yy > h * .78) & (lum >= 115)
    core = ndimage.binary_closing(stocking | shoe, iterations=1)
    # Grow into anti-aliased stocking edges only, never into the light-grey tail fur.
    legs = ndimage.binary_dilation(core, iterations=1) & alpha & below & ((lum < 140) | (yy > h * .78))
    # The tail is light fur above the shoes; keep it (and its darker outline) out of the legs.
    fur = alpha & (lum >= 140) & (yy < h * .76)
    lab, n = ndimage.label(fur)
    if n:
        sizes = ndimage.sum(fur, lab, range(1, n + 1))
        tail = ndimage.binary_dilation(lab == int(np.argmax(sizes)) + 1, iterations=4)
        legs &= ~tail
    # The legs are separate below the knees and merge on the thighs. Find the lowest point where
    # they merge, then split the thighs along a straight line from that gap up to the hip centre.
    y_sep, gap_x = None, None
    for y in range(h - 1, hem, -1):
        cols = np.nonzero(legs[y])[0]
        if cols.size == 0:
            continue
        runs = np.split(cols, np.nonzero(np.diff(cols) > 2)[0] + 1)
        if len(runs) >= 2:
            y_sep, gap_x = y, (runs[0][-1] + runs[1][0]) / 2
        elif y_sep is not None and y < y_sep - 4:
            break
    hip_cols = np.nonzero(legs[hem:hem + 6].any(axis=0))[0]
    hip_x = (hip_cols.min() + hip_cols.max()) / 2
    split = np.where(yy >= y_sep, gap_x, hip_x + (gap_x - hip_x) * (yy - hem) / max(1, y_sep - hem))
    back_mask = legs & (xx < split)
    front_mask = legs & (xx >= split)
    hip_l = (hem, (hip_cols.min() + hip_x) / 2)
    hip_r = (hem, (hip_cols.max() + hip_x) / 2)
    body = cell.copy()
    body[legs] = 0
    # Extend each leg's top edge a few pixels upward (hidden by the skirt) so rotation never shows a gap.
    def lift(mask):
        layer = np.zeros_like(cell)
        layer[mask] = cell[mask]
        top = np.nonzero(mask.any(axis=1))[0].min()
        for k in range(1, 10):
            row = top - k
            if row < 0:
                break
            layer[row][mask[top]] = cell[top][mask[top]]
        return layer
    return body, lift(back_mask), lift(front_mask), (hip_l, hip_r)


def rotate(layer: np.ndarray, pivot: tuple[float, float], degrees: float) -> Image.Image:
    img = Image.fromarray(layer)
    return img.rotate(degrees, resample=Image.BICUBIC, center=(pivot[1], pivot[0]))


def cycle(cell: np.ndarray, hem: int) -> list[np.ndarray]:
    body, back, front, (hip_b, hip_f) = split_legs(cell, hem)
    h, w = cell.shape[:2]
    frames = []
    for i in range(FRAMES):
        phase = 2 * math.pi * i / FRAMES
        s = (1 - math.cos(phase)) / 2  # 0 at the original stride, 1 when the legs have swapped
        canvas = Image.new('RGBA', (w, h + 12))
        canvas.alpha_composite(rotate(back, hip_b, SWING * s), (0, 6))     # back leg swings forward
        canvas.alpha_composite(rotate(front, hip_f, -SWING * s), (0, 6))   # front leg swings back
        canvas.alpha_composite(Image.fromarray(body), (0, 6))
        a = np.asarray(canvas)
        ys = np.nonzero(a[..., 3] > 30)[0]
        shift = (h + 11) - ys.max()  # re-ground on the lowest foot
        out = Image.new('RGBA', (w, h))
        out.alpha_composite(canvas, (0, shift - 6 - 1))
        frames.append(np.asarray(out))
    return frames


if __name__ == '__main__':
    import sys
    from pathlib import Path
    sheet = Image.open(Path(__file__).resolve().parents[1] / 'assets/lab/yuki/pet.webp').convert('RGBA')
    cw = sheet.width // 5
    walk = np.asarray(sheet.crop((cw, 0, 2 * cw, sheet.height)))
    frames = cycle(walk, int(sys.argv[1]) if len(sys.argv) > 1 else 262)
    strip = Image.new('RGBA', (cw * FRAMES, sheet.height), (236, 240, 247, 255))
    for i, f in enumerate(frames):
        strip.alpha_composite(Image.fromarray(f), (i * cw, 0))
    strip.save(sys.argv[2] if len(sys.argv) > 2 else 'walk_strip.png')
    print('ok')
