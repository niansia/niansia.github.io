"""Build Yuki's wardrobe from single standing illustrations (the 23-look pack).

Masters live outside the published site: art/wardrobe/png/*.png plus art/wardrobe/manifest.json
(copied from the handoff pack; art/ is git-ignored). Run:  python tools/build_wardrobe.py [ids...]
For each look this writes assets/lab/yuki/outfits/<id>/ with the same layer set the pet uses
(13-frame pet.webp, heads.webp, layout.json with head anchors, thumb.webp) and rewrites
assets/lab/yuki/outfits.json. Web derivatives are 440 px tall WebP with the original alpha.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from build_yuki_assets import CHAR_HEIGHT, head_anchor, head_centre  # noqa: E402
from standing_frames import close_eyes, find_eyes, walk_frames  # noqa: E402

ART = ROOT / 'art/wardrobe'
OUT = ROOT / 'assets/lab/yuki/outfits'
# Which look Yuki wears on each festival (ids from assets/js/festivals.js).
FESTIVALS = {
    '21-moon-rabbit-yukata': ['midautumn'], '18-teacher-formal': ['teachers'], '07-newyear-qipao': ['lunarnewyear'],
    '06-midautumn-hanfu': ['lantern', 'dragonboat'], '04-wedding-dress': ['valentine'], '05-yukata': ['qixi'],
    '13-christmas': ['christmas'], '14-halloween-witch': ['halloween'], '12-winter-coat': ['newyear'],
    '15-sportswear': ['children'], '09-cyber-techwear': ['labor'], '23-idol-stage': ['national'],
    '11-autumn-cardigan': ['retrocession', 'peace'],
}


def build(asset: dict) -> dict:
    src = Image.open(ART / asset['file']).convert('RGBA')
    a = np.asarray(src)
    ys, xs = np.nonzero(a[..., 3] > 8)
    crop = src.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    factor = CHAR_HEIGHT / crop.height
    img = crop.resize((round(crop.width * factor), CHAR_HEIGHT), Image.LANCZOS)
    arr = np.asarray(img)
    cx_img = head_centre(arr)
    margin = round(CHAR_HEIGHT * .04)
    half = max(cx_img, img.width - cx_img) + margin
    cell_w, cell_h = int(np.ceil(half * 2)), CHAR_HEIGHT + 4
    base = Image.new('RGBA', (cell_w, cell_h))
    base.alpha_composite(img, (round(cell_w / 2 - cx_img), cell_h - 2 - img.height))
    idle = np.asarray(base)
    cx = cell_w / 2
    eyes = find_eyes(idle, cx)
    closed = close_eyes(idle, eyes) if eyes else idle
    happy = close_eyes(idle, eyes, happy=True) if eyes else idle
    cells = [idle, idle, happy, closed, closed] + walk_frames(idle, cx)
    dest = OUT / asset['id']
    dest.mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGBA', (cell_w * len(cells), cell_h))
    for i, c in enumerate(cells):
        sheet.alpha_composite(Image.fromarray(c), (i * cell_w, 0))
    sheet.save(dest / 'pet.webp', quality=86, method=6)
    # busts for the pointer companion and avatars: idle, happy, sleepy
    size = round(CHAR_HEIGHT * .285)
    top = int(np.nonzero(idle[..., 3].any(axis=1))[0].min())
    busts = Image.new('RGBA', (160 * 3, 160))
    for i, c in enumerate((idle, happy, closed)):
        bust = Image.fromarray(c).crop((round(cx - size / 2), top, round(cx + size / 2), top + size))
        busts.alpha_composite(bust.resize((160, 160), Image.LANCZOS), (160 * i, 0))
    busts.save(dest / 'heads.webp', quality=88, method=6)
    busts.crop((0, 0, 160, 160)).resize((96, 96), Image.LANCZOS).save(dest / 'thumb.webp', quality=86)
    Image.new('RGBA', (2, 2)).save(dest / 'tail.webp')
    layout = {'cell': [cell_w, cell_h], 'tail': None, 'eyes': bool(eyes),
              'anchors': [head_anchor(c) for c in cells]}
    (dest / 'layout.json').write_text(json.dumps(layout) + '\n', encoding='utf-8')
    return {'id': asset['id'], 'name': asset['name'], 'festival': FESTIVALS.get(asset['id'], []), 'hair': asset.get('hair'),
            'long': asset.get('longGarment', False), 'sheet': f"/assets/lab/yuki/outfits/{asset['id']}/", 'thumb': 'thumb.webp',
            'ratio': round(cell_w / cell_h, 4)}


def main(only: list[str]) -> None:
    manifest = json.loads((ART / 'manifest.json').read_text(encoding='utf-8'))['assets']
    entries = []
    for asset in manifest:
        if only and asset['id'] not in only:
            existing = OUT / asset['id'] / 'layout.json'
            if existing.exists():
                lay = json.loads(existing.read_text())
                entries.append({'id': asset['id'], 'name': asset['name'], 'festival': FESTIVALS.get(asset['id'], []), 'hair': asset.get('hair'),
                                'long': asset.get('longGarment', False), 'sheet': f"/assets/lab/yuki/outfits/{asset['id']}/", 'thumb': 'thumb.webp',
                                'ratio': round(lay['cell'][0] / lay['cell'][1], 4)})
            continue
        entries.append(build(asset))
        print('built', asset['id'])
    (ROOT / 'assets/lab/yuki/outfits.json').write_text(json.dumps(entries, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(entries), 'looks in the wardrobe')


if __name__ == '__main__':
    main(sys.argv[1:])
