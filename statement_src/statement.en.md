---
title: Research statement
description: The question I care about is when multimodal models can still be trusted — and whether we can show the evidence for it.
date: 2026-09-28
---

## The question I care about

Multimodal models keep getting better on benchmarks, but in the real world — poor light, blur, distribution shift, or a deliberately crafted attack — their *seeing* and their *reasoning* often break together, and they do not tell you when that happens.

What I want to study is **under which conditions a model can still be trusted, and whether we can produce evidence that it can.**

## Three directions

**1. Trustworthy multimodal evaluation.** Evaluations that separate "actually understood" from "happened to guess right", with a focus on hallucination, robustness and failure modes under hard conditions.

**2. Vision under hard conditions.** Starting from low-light enhancement ([LumiGrid](/notes/en/lumigrid-notes/)), I want to understand how perceptual quality propagates into downstream understanding and reasoning: an image that looks fixed does not make the model more reliable.

**3. Evidence-first research tools.** AI that helps with research without vouching for the conclusions. [NoveltyAudit](/p/noveltyaudit/) records what a literature search could *not* establish; [Taiwan Exam](/notes/en/taiwan-exam-design/) lets scripts check but never claim quality.

## How I work

Every claim comes with something that can check it: a held-out test set, an ablation, reproducible code. Findings that do not flatter my own method get written down too — for example, LumiGrid barely uses its luminance layering at all.

## Now

Preparing submissions to CVPR, ICCV and COLM 2027 (VLM- and DiT-related). If these questions interest you, I would be glad to hear from you.
