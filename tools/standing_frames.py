"""Animation frames from a single standing illustration (the wardrobe looks).

Each look is one front-facing standing pose, so the extra frames are synthesised:
  * blink / sleepy / happy faces: the violet irises are located and painted over with skin and a
    lash curve (a downward arc for closed eyes, an upward "^" arc for a happy smile);
  * walking: if the legs are visible below the garment they are cut at the hem and lifted in
    turn (a front-view step); long garments sway instead.
"""
from __future__ import annotations

import colorsys
import math

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def find_eyes(cell: np.ndarray, head_cx: float) -> list[tuple[int, int, int, int]]:
    """Bounding boxes (x0, y0, x1, y1) of the two violet irises in the upper head."""
    h, w = cell.shape[:2]
    rgb = cell[..., :3].astype(np.float32) / 255
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    violet = (b > g + .08) & (r > g + .02) & (sat > .3) & (mx > .22) & (cell[..., 3] > 200)
    yy, xx = np.mgrid[:h, :w]
    band = (yy > h * .05) & (yy < h * .2) & (np.abs(xx - head_cx) < w * .22)
    lab, n = ndimage.label(ndimage.binary_closing(violet & band, iterations=1))
    if n < 2:
        return []
    boxes = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        area = (lab[sl] == i).sum()
        if area >= 6:
            boxes.append((area, sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    # the two eyes: the largest pair of blobs lying at nearly the same height
    boxes.sort(reverse=True)
    best = None
    for i in range(min(6, len(boxes))):
        for j in range(i + 1, min(6, len(boxes))):
            a, b_ = boxes[i], boxes[j]
            dy = abs((a[2] + a[4]) - (b_[2] + b_[4])) / 2
            dx = abs((a[1] + a[3]) - (b_[1] + b_[3])) / 2
            if dy < h * .02 and w * .06 < dx < w * .35:
                score = a[0] + b_[0]
                if not best or score > best[0]:
                    best = (score, a, b_)
    if not best:
        return []
    return [tuple(int(v) for v in box[1:]) for box in sorted(best[1:], key=lambda bx: bx[1])]


def close_eyes(cell: np.ndarray, eyes, happy: bool = False) -> np.ndarray:
    img = Image.fromarray(cell)
    draw = ImageDraw.Draw(img)
    for x0, y0, x1, y1 in eyes:
        ew, eh = x1 - x0, y1 - y0
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        # skin from just below the eye; cover the iris and the whites around it
        sy = min(cell.shape[0] - 1, int(y1 + eh * .9))
        skin = tuple(int(v) for v in np.median(cell[sy:sy + 3, int(cx - ew * .3):int(cx + ew * .3), :3].reshape(-1, 3), axis=0)) + (255,)
        pad_x, pad_y = ew * .55, eh * .45
        draw.ellipse([x0 - pad_x, y0 - pad_y, x1 + pad_x, y1 + pad_y * .6], fill=skin)
        lash = (86, 66, 92, 255)
        width = max(2, round(ew * .16))
        span = [x0 - pad_x * .8, cy - eh * .5, x1 + pad_x * .8, cy + eh * .5]
        if happy:   # upward arc  ^
            draw.arc([span[0], cy - eh * .1, span[2], cy + eh * .9], 200, 340, fill=lash, width=width)
        else:       # downward arc, gently closed
            draw.arc([span[0], cy - eh * .6, span[2], cy + eh * .4], 20, 160, fill=lash, width=width)
    return np.asarray(img)


def leg_region(cell: np.ndarray, cx: float):
    """(hem_y, split_x_by_row) if two legs are visible below the garment, else None."""
    h, w = cell.shape[:2]
    alpha = cell[..., 3] > 60
    band = int(h * .12)
    lo, hi = max(0, int(cx - band)), min(w, int(cx + band))
    def runs(y):
        cols = np.nonzero(alpha[y, lo:hi])[0] + lo
        return np.split(cols, np.nonzero(np.diff(cols) > 2)[0] + 1) if cols.size else []
    # Walk up from the feet and keep the unbroken stretch where exactly two legs show; this
    # stops at the thighs, so the tail (higher up and to the side) never counts as a leg.
    two, misses = [], 0
    for y in range(int(h * .97), int(h * .5), -1):
        rr = runs(y)
        if len(rr) == 2 and min(len(rr[0]), len(rr[1])) > w * .04:
            two.append(y); misses = 0
        elif two:
            misses += 1
            if misses > 3:
                break
    if len(two) < h * .08:
        return None
    y_sep = min(two)
    r = runs(y_sep)
    gap_x = (r[0][-1] + r[1][0]) / 2
    ref = r[1][-1] - r[0][0]
    # Tighten the band to where the legs actually are (keeps the tail and coat tails out).
    spans = [runs(y) for y in two]
    lo = max(lo, min(s[0][0] for s in spans) - int(w * .03))
    hi = min(hi, max(s[-1][-1] for s in spans) + int(w * .03))
    hem = y_sep
    for y in range(y_sep, int(h * .5), -1):
        rr = runs(y)
        if not rr:
            break
        span = rr[-1][-1] - rr[0][0]
        if span > ref * 1.25 or rr[0][0] <= lo + 1 or rr[-1][-1] >= hi - 2:
            break
        hem = y
    if y_sep - hem > h * .2:
        return None
    # Split line between the legs for every row: the actual gap where the legs are apart,
    # the nearest known gap where they touch (thighs, heels).
    split = np.full(h, np.nan)
    for y in range(hem, h):
        rr = runs(y)
        if len(rr) == 2:
            split[y] = (rr[0][-1] + rr[1][0]) / 2
    known = np.nonzero(~np.isnan(split))[0]
    for y in range(h):
        if np.isnan(split[y]):
            split[y] = split[known[np.argmin(np.abs(known - y))]] if known.size else gap_x
    return hem + 2, split, lo, hi


def walk_frames(cell: np.ndarray, cx: float, frames: int = 8) -> list[np.ndarray]:
    h, w = cell.shape[:2]
    region = leg_region(cell, cx)
    out = []
    if region is None:
        # long garment: sway around the feet with a small bob
        img = Image.fromarray(cell)
        for i in range(frames):
            phase = 2 * math.pi * i / frames
            angle = 2.2 * math.sin(phase)
            canvas = Image.new('RGBA', (w, h))
            rot = img.rotate(angle, resample=Image.BICUBIC, center=(cx, h - 2))
            canvas.alpha_composite(rot, (0, -round(abs(math.sin(phase)) * h * .006)))
            out.append(np.asarray(canvas))
        return out
    hem, split, lo, hi = region
    yy, xx = np.mgrid[:h, :w]
    gap_x = split[:, None]
    legs = (cell[..., 3] > 0) & (yy >= hem) & (xx >= lo) & (xx < hi)
    bottom = int(np.nonzero(legs.any(axis=1))[0].max()) + 1
    body = cell.copy()
    body[legs] = 0

    def leg_strip(mask):
        lay = np.zeros_like(cell)
        lay[mask] = cell[mask]
        return Image.fromarray(lay[hem:bottom])
    strips = (leg_strip(legs & (xx < gap_x)), leg_strip(legs & (xx >= gap_x)))
    length = bottom - hem
    lift_max = h * .04
    for i in range(frames):
        phase = 2 * math.pi * i / frames
        s = math.sin(phase)
        canvas = Image.new('RGBA', (w, h))
        # Each leg is squashed from its hem, so the top stays joined to the garment while the foot
        # rises (a bent knee seen from the front). No cut edge can open up.
        for strip, lift in zip(strips, (max(0, s) * lift_max, max(0, -s) * lift_max)):
            new_len = max(1, round(length - lift))
            canvas.alpha_composite(strip.resize((w, new_len), Image.BICUBIC), (0, hem))
        body_img = Image.fromarray(body)
        canvas.alpha_composite(body_img, (0, 0))
        # Settle the lifted-leg frames so the planted foot stays on the baseline.
        out.append(np.asarray(canvas))
    return out
