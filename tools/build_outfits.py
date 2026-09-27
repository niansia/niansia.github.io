"""Turn generated outfit sprite sheets into Yuki's wardrobe.

Drop each generated sheet at  art/outfits/<id>.png  (ids are listed in tools/outfits/outfits.json;
art/ is git-ignored) and run:  python tools/build_outfits.py
For every sheet found this removes a flat background if the image has no transparency,
builds the same layers as the hoodie (pose cells, 8-frame walk cycle, tail, busts, anchors)
into assets/lab/yuki/outfits/<id>/, makes a thumbnail, and rewrites assets/lab/yuki/outfits.json.
"""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import build_yuki_assets  # noqa: E402

ART = ROOT / 'art/outfits'
OUT = ROOT / 'assets/lab/yuki/outfits'
CONFIG = json.loads((ROOT / 'tools/outfits/outfits.json').read_text(encoding='utf-8'))


def remove_background(img: Image.Image) -> Image.Image:
    """Key out a flat background (green screen or white) that touches the image border."""
    rgba = np.asarray(img.convert('RGBA')).astype(np.int16)
    if rgba[..., 3].min() < 250:
        return img.convert('RGBA')  # already transparent
    rgb = rgba[..., :3]
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    near = dist < 60
    labels, _ = ndimage.label(near)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    background = np.isin(labels, edge[edge > 0])
    # Soft edge: fade pixels just inside the key by their distance to the background colour.
    ring = ndimage.binary_dilation(background, iterations=2) & ~background
    alpha = np.where(background, 0, 255).astype(np.float32)
    alpha[ring] = np.clip((dist[ring] - 30) / 60 * 255, 0, 255)
    out = rgba.copy()
    out[..., 3] = alpha.astype(np.int16)
    if bg[1] > bg[0] + 60 and bg[1] > bg[2] + 60:  # green screen: remove green spill on edges
        g = out[..., 1]
        limit = np.maximum(out[..., 0], out[..., 2])
        out[..., 1] = np.where(g > limit, limit, g)
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def main() -> None:
    manifest = []
    for outfit in CONFIG:
        if outfit['id'] == 'hoodie':
            continue
        src = next((p for ext in ('png', 'webp', 'jpg', 'jpeg') if (p := ART / f"{outfit['id']}.{ext}").exists()), None)
        if not src:
            continue
        dest = OUT / outfit['id']
        with tempfile.TemporaryDirectory() as tmp:
            clean = Path(tmp) / 'sheet.png'
            remove_background(Image.open(src)).save(clean)
            build_yuki_assets.main(clean, dest, blink_origin=False)
        heads = Image.open(dest / 'heads.webp')
        heads.crop((0, 0, heads.height, heads.height)).resize((96, 96), Image.LANCZOS).save(dest / 'thumb.webp', quality=88)
        manifest.append({'id': outfit['id'], 'name': outfit['name'], 'festival': outfit['festival'],
                         'sheet': f"/assets/lab/yuki/outfits/{outfit['id']}/", 'thumb': 'thumb.webp'})
        print('built', outfit['id'])
    (ROOT / 'assets/lab/yuki/outfits.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(manifest)} outfits in the wardrobe')


if __name__ == '__main__':
    main()
