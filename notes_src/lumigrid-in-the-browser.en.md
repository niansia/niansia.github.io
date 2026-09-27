---
title: "Porting LumiGrid to the browser: a 6-channel convolution that only broke on WebGPU"
description: Two neural networks and a hand-written WebGL shader, verified pixel by pixel against PyTorch — and how a bug that left the WebGPU version at 28.75 dB was found by bisection.
date: 2026-09-28
order: 2
tags: [WebGPU, ONNX Runtime Web, debugging]
---

I wanted visitors to try [LumiGrid](/notes/en/lumigrid-notes/) on their own photos, with the constraint that **the photo never leaves their device**. That means the whole model has to run in the browser. These notes cover how I split it up, how I verified it, and the bug that took the most time.

## How it is split

LumiGrid has three parts, and each one runs where it fits best:

| Part | How it runs in the browser |
|---|---|
| Grid CNN (256² thumbnail → 16×16×8 grid) | ONNX on WebAssembly |
| Luminance guide + trilinear slicing + 8 curves + colour matrix | **a hand-written WebGL2 shader**, fp32 |
| NAFNet refiner | ONNX on WebGPU (falls back to WebAssembly) |

The middle part is PyTorch's `grid_sample` in the original. Five-dimensional trilinear sampling is unevenly supported in ONNX, and it is a textbook per-pixel operation anyway, so it became a shader. For each pixel the shader runs a tiny 3→16→1 network for the luminance coordinate (GELU via an erf approximation, error around 1e-7), interpolates 36 coefficients from the 8 neighbouring grid cells, applies eight rounds of curves and a 3×4 colour matrix. The thumbnail's area averaging was re-implemented in JavaScript to match OpenCV's `INTER_AREA`.

## How it was verified

I generated reference outputs with PyTorch for six held-out test images, ran the web version in headless Chrome, and compared pixel by pixel.

WebAssembly: **63.87 dB, maximum error of one grey level** — effectively identical. I also checked each intermediate result; the sliced image differs from PyTorch by less than 1e-6.

WebGPU: **28.75 dB.** The picture looked roughly fine; the numbers clearly were not.

## Three wrong guesses

My first three guesses were all wrong:

1. **PixelShuffle exported as DepthToSpace (CRD mode).** Re-exported with an explicit reshape + transpose: still 28.75 dB.
2. **`pow(x, 2)` in LayerNorm.** In WebGPU's WGSL, `pow` is undefined for negative bases, and variance terms are negative before squaring. Changed to `d * d`: still 28.75 dB.
3. **The ONNX Runtime Web version.** Moved from 1.23.2 to 1.30.0: still 28.75 dB.

All three gave **exactly** the same number, which rules out floating-point noise: some operation behaves differently on WebGPU.

## Bisection

Then I searched systematically:

- **Each operation on its own** (LayerNorm, channel attention, gating, depthwise convolution, down- and up-sampling, plain convolution): WebGPU and WebAssembly agree on all of them.
- **Every layer of the real model exported as an extra output**, compared layer by layer: the difference **starts at the very first layer**.
- That first layer concatenates the input and the stage-1 result into 6 channels, then applies a 3×3 convolution. Testing the two steps separately:

| Test | max difference, WebGPU vs WebAssembly |
|---|---:|
| concatenation only | 0 |
| 3×3 convolution with 6 input channels | **0.69** |
| the same convolution, zero-padded to 8 channels | 6 × 10⁻⁷ |

So on this Windows laptop's Chrome, ONNX Runtime Web's WebGPU backend **computes a convolution with 6 input channels incorrectly**; padding to 8 makes it correct.

## The fix

The refiner now takes a single 8-channel input, `[input, stage-1 result, 0, 0]`, and the first convolution gets two extra input channels with zero weights. It is mathematically identical (the difference in PyTorch is exactly 0) but avoids the broken path.

After the fix both backends reach **63.87 dB with a maximum error of one grey level**. On a 1016 × 680 image my laptop takes roughly 50–250 ms for the grid CNN, 35–250 ms for the shader, and about 1.8–2.1 s for the refiner on WebGPU (about 2.4 s on WebAssembly).

## Lessons

- **Always have a numerical reference.** "Looks about right" lets this kind of bug live for a long time — the 28.75 dB output looked perfectly normal at a glance.
- **Tapping intermediate layers beats guessing.** Three guesses found nothing; two rounds of bisection found the bug.
- I have not yet reduced this to a minimal reproduction and reported it to ONNX Runtime; that is the next thing to do.

Try it yourself: [LumiGrid in the browser](/lab/lumigrid/?lang=en).
