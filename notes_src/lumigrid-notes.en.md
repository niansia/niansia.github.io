---
title: "LumiGrid notes: what a luminance-guided curve grid actually learned"
description: From a 16.48 dB course pipeline to 24.57 dB — the design, the ablation, two failure cases, and one finding that does not flatter the method.
date: 2026-09-28
order: 1
tags: [computer vision, low-light enhancement, NTIRE 2025]
---

These notes walk through [LumiGrid](https://github.com/niansia/LumiGrid): what it does, how well it does it, and one finding that is **not** in its favour — the model barely uses the "luminance" axis it is named after.

## Starting point: a course pipeline that was not good enough

Low-light image enhancement (LLIE) turns very dark photos into normally exposed ones. I first reproduced my original course pipeline on the NTIRE 2025 challenge data: Zero-DCE, then a bilateral filter, gamma and contrast. On my 20 held-out test pairs it scored **16.48 dB / 0.742 SSIM** — worse than simply running the pretrained Zero-DCE weights (19.00 dB).

The reasons were clear: Zero-DCE applies the same kind of curve everywhere without seeing the whole scene, and the post-processing amplified the noise along with the signal.

## Design: decide how the whole image should brighten, then fix the details

LumiGrid has two stages:

1. **A global curve grid.** A small CNN reads only a 256 × 256 thumbnail of the whole image and outputs a grid of 16 × 16 spatial cells × 8 luminance bins. Each cell stores eight rounds of Zero-DCE curves (`LE(x) = x + a·x·(1 − x)`, per RGB channel) and a 3 × 4 colour matrix.
2. **Slicing.** Every pixel looks up its coefficients by trilinear interpolation, using its position plus a *learned* luminance coordinate, and applies them. The grid is computed once from the thumbnail, so the global stage costs almost nothing extra on large images.
3. **A NAFNet refiner.** A width-24, three-level NAFNet U-Net sees both the input and the stage-1 result and predicts a residual that removes noise and restores detail. It runs on 1024 × 1024 tiles with a 64-pixel linear blend, so 24-megapixel photos fit in 8 GB.

The loss is Charbonnier + 0.25·(1 − SSIM) + 0.05·FFT magnitude, plus an auxiliary loss on the global stage; training ran for 20k iterations (batch 8, 320-pixel crops) on a single laptop RTX 4060.

## Results

All numbers are on 20 NTIRE 2025 pairs that were **never used for training or model selection**, at full resolution, with the official scoring code:

| Method | PSNR ↑ | SSIM ↑ |
|---|---:|---:|
| Input (no enhancement) | 10.65 | 0.381 |
| Zero-DCE, pretrained weights | 19.00 | 0.682 |
| Course pipeline (Zero-DCE + filter + gamma + contrast) | 16.48 | 0.742 |
| Zero-DCE, trained on the same data | 20.91 | 0.717 |
| **LumiGrid** | **24.57** | **0.840** |
| LumiGrid + TTA (average of four flips) | 24.63 | 0.841 |

This is not a leaderboard result: the challenge's test ground truth is not public, and this is my own held-out split.

## Ablation: each stage covers the other's blind spot

| Variant | PSNR | SSIM |
|---|---:|---:|
| Zero-DCE network (full-resolution convolutions, no scene context) | 20.91 | 0.717 |
| Curve grid only | 22.85 | 0.768 |
| NAFNet refiner only | 22.85 | 0.833 |
| Full LumiGrid | 24.57 | 0.840 |

The middle two rows are the interesting ones: **identical PSNR, very different SSIM.** On its own the refiner is much better at structure and texture, but it does not win on PSNR, which suggests its remaining error is mostly large-scale brightness and colour. That is an inference from the numbers, not something I measured directly. The curve grid is good at exactly that, and combining the two adds another 1.7 dB.

## A finding that does not flatter the method

LumiGrid's selling point is luminance-aware curves: a bright lamp and the shadow next to it can follow different curves. But when I looked at the learned luminance coordinate, across every pixel of the 20 test images it only spans **0.46 to 0.55**: 86% of pixels land in the 4th of the eight luminance bins, the other 14% in the 5th, and the remaining six bins are never used.

In other words, almost all of the gain comes from **spatial** variation (different regions, different curves), not from luminance layering. The README says so too. Making the design live up to its name would mean:

- adding a regulariser that spreads the luminance coordinate out, and checking whether that helps; or
- running the control: fix the luminance coordinate to a constant. If the score barely moves, that confirms the layering is not being used.

## Two failure cases

- **#305, a night sky (13.5 dB).** The reference keeps the sky dark; LumiGrid brightens it. Whether it *should* be bright is genuinely ambiguous.
- **#143, a misaligned reference (11.9 dB).** The output looks right, but the reference is framed differently from the input, so any pixel-wise metric looks terrible.

These two pull the mean down noticeably. With only 20 test images, I would not read much into differences below about 0.2 dB.

## More

- Code, weights and the full tables: [github.com/niansia/LumiGrid](https://github.com/niansia/LumiGrid)
- Try it on your own dark photo: [LumiGrid in the browser](/lab/lumigrid/?lang=en)
- How the browser version was built — and the WebGPU bug I hit on the way: [next note](/notes/en/lumigrid-in-the-browser/)
