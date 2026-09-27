# Yuki outfit sheets — generation spec

Each outfit is one generated image. Put it at `art/outfits/<id>.png` (the `art/` folder is git-ignored),
then run `python tools/build_outfits.py`. The script removes the background, cuts the four poses,
matches them to the current Yuki's size, bakes an eight-frame walk cycle and adds the outfit to her wardrobe.

## How to generate

1. **Attach the reference image** `assets/lab/yuki-sprites.png` (the current four poses) so the face,
   hair, ears, tail and painting style stay the same.
2. **Paste the shared prompt below**, replacing `{OUTFIT}` with that outfit's line from the table.
3. Save the result as `art/outfits/<id>.png` using the id from the table.

If a result has the wrong pose order, cropped feet, or poses touching each other, regenerate it; the
script needs four separate full-body figures in one row.

### Shared prompt (copy everything in the box)

```text
Use the attached character sheet as the exact character reference. Keep her identity and art style:
Yuki, a normal-proportioned Japanese anime cat girl (not chibi, not 3D), silver-white shoulder-length
hair with a small dark star hair clip, violet eyes, white cat ears with pink inner ears, a long fluffy
white cat tail, a black choker. Same face, same soft painterly shading, same clean line art.

Draw ONE sprite sheet, 1536 x 1024 pixels, with a transparent background. If transparency is not
possible, use a flat pure green background (#00FF00) with no gradient, no floor and no shadows.
Four full-body poses in a single row, evenly spaced, same scale, feet on the same baseline, and a
clear gap between the figures (nothing overlapping or touching):
1. Idle: standing, facing the viewer, hands together in front of the body, gentle smile.
2. Walking: three-quarter view walking toward the viewer's right, mid-stride, both legs clearly
   visible and apart, arms swinging naturally.
3. Happy: facing the viewer, waving with one hand raised beside her face, eyes closed in a happy smile.
4. Sleepy: facing the viewer, eyes closed, yawning with one hand covering her mouth.
Her tail hangs on the viewer's right in poses 1, 3 and 4. The whole body including the shoes is in
frame. No text, no props other than those described, no background objects.

Outfit: {OUTFIT}
```

## Outfits

| id | 名稱 | 節日自動換裝 | {OUTFIT} |
|---|---|---|---|
| `sailor` | JK 水手服 | 國慶日 | Japanese sailor school uniform: white short-sleeved top with a navy sailor collar with two white stripes, red scarf tie, navy pleated knee-length skirt, white knee socks, brown loafers |
| `blazer` | JK 西裝制服 | — | Japanese blazer school uniform: beige blazer with a small school emblem, white shirt, red ribbon bow, grey-and-navy plaid pleated skirt above the knee, black knee socks, brown loafers |
| `swimsuit` | 海邊泳裝 | — | cute and modest summer beachwear: white and lilac frilled one-piece swimsuit with a short ruffle skirt, an open sheer white beach parka over it, straw sun hat placed between her cat ears, light sandals |
| `wedding` | 婚紗 | 情人節 | white wedding dress with a lace bodice and a knee-length layered tulle skirt, short sheer veil attached behind her cat ears, white lace gloves, white strap heels, a small bouquet of lilac and white roses held in front in poses 1 and 4 |
| `yukata` | 月兔浴衣 | 中秋、七夕 | lilac summer yukata with a white rabbit, full moon and cloud pattern, pink obi tied in a bow at the back, knee-length hem so the legs stay visible, white tabi socks and wooden geta sandals, a small pink flower hair ornament |
| `maid` | 女僕裝 | — | classic black-and-white maid dress with puffed short sleeves, frilly white apron, knee-length skirt, white thigh-high socks, black Mary Jane shoes |
| `qipao` | 紅色旗袍 | 春節 | modern red qipao with gold plum-blossom embroidery and a mandarin collar, knee length with modest side slits, red flat shoes, a small red tassel hair ornament |
| `hanfu` | 漢服 | 元宵、端午 | pastel pink and white hanfu (ruqun) with wide flowing sleeves and a light pleated skirt shortened to knee length so the legs stay visible, embroidered sash, white embroidered cloth shoes |
| `santa` | 聖誕裝 | 聖誕節 | red velvet Santa dress with white fluffy trim and a short red capelet, red-and-white striped stockings, brown ankle boots, a small bell on her choker |
| `witch` | 小魔女 | 萬聖節 | purple and black witch dress with a short black cape clasped with a moon brooch, orange-and-black striped tights, black ankle boots (no hat; the hat is added separately) |
| `pajamas` | 貓咪睡衣 | — | soft pastel lilac pajamas with a paw-print pattern: long-sleeved button top and shorts, fluffy white cat-paw slippers |
| `gym` | 體育服 | 兒童節 | Japanese school gym uniform: white T-shirt with navy trim and a name tag, navy athletic shorts, white crew socks, white sneakers, a navy headband |
| `winter` | 冬季大衣 | 元旦 | cream short duffle coat reaching the upper thigh, soft pink knit scarf, grey plaid skirt, black tights, brown lace-up winter boots, knit mittens |
| `idol` | 偶像舞台裝 | — | pastel pink and white idol stage dress with layered frills, ribbons and small star ornaments, short puffy skirt, white thigh-high boots, fingerless white gloves |
| `labcoat` | 研究員白袍 | 教師節 | white lab coat worn open over a lavender blouse and navy pleated skirt, round thin-rim glasses, an ID badge on a lanyard, black tights, brown loafers |
| `programmer` | 工程師 | 勞動節 | oversized black T-shirt printed with a small white '>_' terminal logo, denim shorts, headphones resting around her neck, black knee socks, white sneakers |
| `autumn` | 秋日針織 | 光復節、和平紀念日 | mustard-yellow knit cardigan over a white collared blouse, brown corduroy pleated skirt, dark brown tights, brown Mary Jane shoes |

The default lilac hoodie stays as it is. Names and festival links live in `tools/outfits/outfits.json`.

## Tips

- Knee-length skirts give the best walk cycle, because the legs must be visible to swing. Long
  skirts still work; she then walks with a gentle bob instead of separate steps.
- A new cat-ear accessory (a bell, ribbon or flower) can be requested in the outfit line, but
  head accessories such as hats are better left to the site's accessory layer, which Yuki can
  swap freely.
- Generate a few candidates per outfit and keep the one whose face matches the reference best.

## Wardrobe v1 (single standing looks)

The current 23 looks came as one standing illustration each (1024 x 1536 PNG). Their masters and
`manifest.json` live in `art/wardrobe/` (git-ignored); `python tools/build_wardrobe.py [ids...]` turns
each into the pet's layer set. Missing frames are synthesised by `tools/standing_frames.py`:
closed / happy eyes are painted over the detected violet irises, visible legs are squashed from
the garment hem in turn for a front-view step with a body bob, the skirt and tail trail behind with a
ripple running down to the hem, and long garments flow the same way without separate steps. Festival outfits are mapped
in `FESTIVALS` inside `build_wardrobe.py`. The four-pose spec above still works with
`tools/build_outfits.py` if richer poses are generated later.