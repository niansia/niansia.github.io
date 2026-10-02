"""Cut the exam proctor's character sheet into the five poses the study companion shows.

Run from the repository root:  python tools/build_proctor_assets.py
Input : assets/study/proctor-sheet.png  (five half-body poses on a black background with a soft glow, generated with
        ChatGPT from the prompt in the header of assets/study/README.md)
Output: assets/study/proctor/{calm,warn,shout,bell,tea}.webp  (transparent, same scale, trimmed)

The sheet has no transparency and every pose sits in a glow, so a plain colour key fails both ways: it eats the dark
hair and keeps the glow. The cut combines three passes:
  1. rembg (u2netp) for the overall silhouette, which keeps the hair;
  2. a gradient key for the lower body, which fades into the glow where rembg turns translucent;
  3. edge refinement: the glow that remains outside the drawn outline is flooded in from the background and dropped,
     holes are filled unless they are mostly glow (the space between the raised bell, the arm and the head).
Two small boxes, checked by eye, clear the glow behind the bell and the cup's steam that the passes cannot tell apart.
Needs: pip install rembg (the u2netp model, 4.7 MB, is downloaded on first use), numpy, scipy, pillow.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/study/proctor-sheet.png'
OUT = ROOT / 'assets/study/proctor'
CELLS = {'calm': (0, 0, 512, 520), 'warn': (512, 0, 1024, 520), 'shout': (1024, 0, 1536, 520),
         'bell': (230, 500, 790, 1024), 'tea': (760, 500, 1300, 1024)}
# Glow the passes leave behind, in each pose's trimmed coordinates (checked by eye).
ERASE = {'bell': [(78, 110, 118, 215), (112, 135, 132, 222)], 'tea': [(238, 228, 321, 318), (262, 198, 321, 228)]}
BAND = 10      # outline refinement width, px
SCALE = .6     # every pose is resized by the same factor, so the character keeps one size across poses


def fill_sealed(mask: np.ndarray) -> np.ndarray:
    """Fill holes in a half-body mask. The body runs off the bottom edge, so close that edge first."""
    h, w = mask.shape
    cols = np.nonzero(mask[-60:].any(axis=0))[0]
    m = np.vstack([mask, np.zeros((1, w), bool)])
    if len(cols):
        m[-1, cols.min():cols.max() + 1] = True
    return ndimage.binary_fill_holes(m)[:-1]


def glow_mask(rgb: np.ndarray) -> np.ndarray:
    """The black background's glow: flat, grey or warm. The cardigan is blue (B well above R), so it is not glow."""
    L = rgb.mean(axis=2)
    sd = np.sqrt(np.maximum(ndimage.uniform_filter(L ** 2, 5) - ndimage.uniform_filter(L, 5) ** 2, 0))
    r, b = rgb[..., 0], rgb[..., 2]
    skin = (r > 200) & (rgb[..., 1] > 160)
    gold = (r > 170) & (b < 120)
    return (sd < 8) & (b - r < 12) & (L > 35) & (L < 160) & ~skin & ~gold


def steam(rgb: np.ndarray) -> np.ndarray:
    """The cup's steam: greyish white with no outline, melting into the glow."""
    L = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    return (sat < 40) & (L > 60) & (L < 235) & (rgb[..., 2] - rgb[..., 0] < 12)


def fill_smart(mask: np.ndarray, rgb: np.ndarray) -> np.ndarray:
    """Fill holes, except holes that are mostly glow (enclosed by an arm, a bell and the head)."""
    filled = fill_sealed(mask)
    holes = filled & ~mask
    lab, n = ndimage.label(holes)
    if not n:
        return filled
    idx = np.arange(1, n + 1)
    size = ndimage.sum(holes, lab, idx)
    frac = ndimage.mean(glow_mask(rgb), lab, idx)
    return filled & ~np.isin(lab, idx[(size > 300) & (frac > .5)])


def lower_hull(mask: np.ndarray, start: float) -> np.ndarray:
    """The lower body is one solid piece: fill the convex hull of the part below `start` (as a fraction of height)."""
    h, w = mask.shape
    y0 = int(h * start)
    ys, xs = np.nonzero(mask[y0:])
    if len(xs) < 10:
        return np.zeros_like(mask)
    pts = np.c_[xs, ys + y0]
    img = Image.new('L', (w, h), 0)
    ImageDraw.Draw(img).polygon([tuple(p) for p in pts[ConvexHull(pts).vertices]], fill=1)
    out = np.asarray(img).astype(bool)
    out[:y0] = False
    return out


def smooth_background(rgb: np.ndarray, threshold: float = 250) -> np.ndarray:
    """Everything reachable from the border without crossing an edge: the background and the smooth glow."""
    b = ndimage.gaussian_filter(rgb, sigma=(1.2, 1.2, 0))
    g = np.sqrt((ndimage.sobel(b, axis=1) ** 2 + ndimage.sobel(b, axis=0) ** 2).sum(axis=2))
    lab, _ = ndimage.label(g < threshold)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    return np.isin(lab, edge[edge > 0])


def largest(mask: np.ndarray) -> np.ndarray:
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    return lab == (np.argmax(ndimage.sum(mask, lab, range(1, n + 1))) + 1)


def deglow(rgb: np.ndarray, mask: np.ndarray, band: int = 70) -> np.ndarray:
    """Flat, unsaturated pixels near the edge that connect to the outside are glow."""
    L = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    sd = np.sqrt(np.maximum(ndimage.uniform_filter(L ** 2, 7) - ndimage.uniform_filter(L, 7) ** 2, 0))
    outline = (L < 66) & (sat < 40)
    glowish = (sd < 7) & ~outline & (L < 215) & (sat < 30)
    near_edge = mask & ~ndimage.binary_erosion(mask, iterations=band)
    lab, _ = ndimage.label((glowish & near_edge) | ~mask)
    outside = np.unique(lab[~mask])
    out = mask & ~(np.isin(lab, outside[outside > 0]) & mask)
    return fill_smart(largest(ndimage.binary_opening(out, iterations=1)), rgb)


def cut(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    L = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    h = alpha.shape[0]
    rows = np.arange(h)[:, None]
    body = ~smooth_background(rgb) & (rows >= .62 * h)   # trust rembg above the waist, where the glow is brightest
    mask = fill_smart((alpha > 40) | body, rgb)
    mask = largest(mask | lower_hull(mask, .6))
    # stop the mask at the drawn outline: what lies outside it in the edge band is glow
    band = mask & ~ndimage.binary_erosion(mask, iterations=BAND)
    outline = (L < 66) & (sat < 40)
    lab, _ = ndimage.label((band & ~outline) | ~mask)
    outside = np.unique(lab[~mask])
    keep = mask & ~(np.isin(lab, outside[outside > 0]) & band)
    keep = fill_smart(ndimage.binary_opening(keep, iterations=1), rgb)
    return deglow(rgb, keep)


def main() -> None:
    from rembg import new_session, remove
    sheet = Image.open(SOURCE).convert('RGB')
    session = new_session('u2netp')
    OUT.mkdir(parents=True, exist_ok=True)
    for name, box in CELLS.items():
        crop = sheet.crop(box)
        rgb = np.asarray(crop).astype(np.float32)
        fg = cut(rgb, np.asarray(remove(crop, session=session))[..., 3].astype(np.float32))
        ys, xs = np.nonzero(fg)
        bx, by = xs.min(), ys.min()
        for x0, y0, x1, y1 in ERASE.get(name, []):
            sl = (slice(y0 + by, y1 + by), slice(x0 + bx, x1 + bx))
            fg[sl] &= ~(glow_mask(rgb[sl]) | steam(rgb[sl]))
            fg = ndimage.binary_opening(fg, iterations=1)
        alpha = np.clip(ndimage.gaussian_filter(fg.astype(np.float32), .7) * 255, 0, 255).astype(np.uint8)
        img = Image.fromarray(np.dstack([rgb.astype(np.uint8), alpha]), 'RGBA')
        img = img.crop(img.getbbox())
        img = img.resize((round(img.width * SCALE), round(img.height * SCALE)), Image.LANCZOS)
        img.save(OUT / f'{name}.webp', 'WEBP', quality=88, method=6)
        print(f'{name}: {img.size[0]}x{img.size[1]}')


if __name__ == '__main__':
    main()
