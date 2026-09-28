---
title: LumiGrid now runs in the browser
date: 2026-09-28
tags: [LumiGrid, WebGPU]
---

LumiGrid can now be tried on your own photo right on the site. Both networks run on the visitor's device; nothing is uploaded.

![The browser version of LumiGrid: input on the left, result on the right, per-step timings on the side](img/lumigrid-browser-demo.png)

Compared pixel by pixel with PyTorch, the largest difference is a single grey level (63.9 dB). On the way I found that ONNX Runtime Web's WebGPU backend miscomputes convolutions with six input channels; the whole story is in the [research note](/notes/en/lumigrid-in-the-browser/).
