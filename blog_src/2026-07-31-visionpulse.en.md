---
type: paper
title: "VisionPulse: at every step of the reasoning, the model needs to see something different"
paper: "VisionPulse: Dynamic Visual Sparsity for Efficient Multimodal Reasoning"
authors: Hengbo Xu, Shengjie Jin, Yanbiao Ma, Zhiwu Lu
venue: ICML 2026
link: https://arxiv.org/abs/2605.31457
depth: deep
tags: [vision-language models, visual token reduction, chain of thought, efficiency]
date: 2026-07-31
description: VisionPulse finds that a model's reliance on the image changes from one reasoning step to the next, so at each step it keeps only the visual tokens needed right then. With 5% kept, accuracy barely moves and the reasoning gets shorter. I love the observation; but it saves compute rather than memory, the experiments are all on images, and the double explosion of long video plus long reasoning is still untouched.
---

## Why this paper

A few days ago I read V-Skip, which compresses from the reasoning side and warned me not to cut out what the model saw. This paper comes at it from the other side: it compresses the visual tokens.

There are many ways to reduce visual tokens, FastV and VisionZip among them, but nearly all of them decide once, at prefill, which tokens to keep, and use that same set for the whole generation. That makes sense for a model that answers directly. Today's vision-language models, though, think for thousands of tokens before answering. Can the set chosen at the start really carry the whole chain? VisionPulse takes the question head-on, and it was accepted at ICML 2026, so I read it through.

## What the paper does

**An observation first.** While Qwen3-VL-4B-Thinking reasons, the authors record how much attention each generated token puts on the image (the paper calls it visual attention mass), and see three things:

1. **Reliance comes in pulses.** On purely textual steps such as "let's check the options", the model barely looks at the image; when it writes about a concrete object such as the square vent or the door handle, its look at the image spikes.
2. **Where it looks keeps moving.** The attended region shifts with whatever the model is writing about.
3. **The start is when it knows least.** At prefill the model is producing its first word, "So"; attention is diffuse and says almost nothing about what will matter later. That is exactly when static pruning makes its decision.

They also describe what they call a coupled bottleneck: keeping every visual token available for the whole chain can pull the model toward irrelevant things. In their example, asked whether the traffic lights are green, the model sees stopped cars and concludes the light must be red, instead of looking at the light itself.

**Then the method.** VisionPulse needs no training:

- For every generated token, at layer 17 (the same layer as the FastV baseline), it computes the token's attention to each visual token, averages over heads to get an importance score, and keeps only the top K for the later layers.
- K is not fixed. The authors find that the total attention on the image correlates strongly with the number of visual tokens that actually receive attention (Pearson r between 0.82 and 0.95 across thresholds), so they set the step's budget to that total times the number of visual tokens. The total uses a softmax with temperature τ below 1 to suppress the long tail, and takes the maximum over heads to stay conservative.
- For a fair comparison, the budget is clamped: 5–10% of tokens for "≤10%", 1–5% for "≤5%".

The main model is Qwen3-VL-4B-Thinking on seven benchmarks (CharXiv, InfoVQA, ChartQA, MMStar, RealWorldQA, MMVet, MIA-Bench), with Qwen3-VL-8B-Thinking and InternVL3.5-4B-Thinking to check that it carries over.

## Results

Averages over the seven benchmarks (Qwen3-VL-4B-Thinking; length is the average number of generated tokens):

| Method | Visual tokens | Avg accuracy | Avg length |
|:---|:---|:---|:---|
| Original | all | 72.68 | 1,687 |
| VisionZip | ≤10% | 43.82 | 2,603 |
| FastV | ≤10% | 38.09 | 2,753 |
| LOOK-M | ≤10% | 54.84 | 2,675 |
| VisionPulse | ≤10% | 72.69 | 1,480 |
| VisionZip | ≤5% | 39.31 | 1,996 |
| FastV | ≤5% | 35.69 | 2,187 |
| LOOK-M | ≤5% | 44.62 | 3,509 |
| VisionPulse | ≤5% | 71.35 | 1,499 |

A few more numbers:

- **It actually keeps less than 5%**: in the ablation (RealWorldQA, MMVet, MIA-Bench), the dynamic budget keeps only 1.9% of visual tokens on average, with an average accuracy of 75.54 (original 75.74) and 16.6% shorter output. A fixed 1% gets 71.03 with 27.9% longer output; a fixed 5% gets 75.16; a random budget (3.0% on average) gets 72.93.
- **It carries over to other models**: Qwen3-VL-8B-Thinking goes from 85.72 to 85.87 and InternVL3.5-4B-Thinking from 72.04 to 72.63, against 73.41 and 63.41 for FastV under the same setting.
- **Speed**: with batch size 8 and 1,000 generated tokens, end-to-end latency is 1.20, 1.24 and 1.30 times faster at 8K, 16K and 32K context.
- **Many tokens are never looked at**: the appendix shows that a sizeable share of visual tokens never cross the attention threshold during the entire chain.

## Three things that stay with me

**First, prune the wrong tokens and the reasoning gets longer.** I had assumed that cutting visual tokens would only make a model less accurate. It also makes it wordier. At ≤5%, LOOK-M generates 108% more tokens and still loses 38.6% of its accuracy (relative). The vent example in the appendix says it all: VisionZip and FastV both conclude "there is no vent in the image", and FastV gets there after writing "Wait, let me check again" over and over. Without the evidence, the model tries to make up for it with longer reasoning, and ends up both slower and wrong.

This is the same story as POPE in V-Skip, told differently. There, once the visual evidence was cut from the chain, the model said "yes" more often; here, once the visual tokens are cut, the model starts going in circles. Accuracy alone is not enough to judge a compression method; output length and answer bias have to be watched too.

**Second, it uses the same signal as V-Skip.** VisionPulse's Figure 1, where the look at the image spikes on "square" and "handle", is essentially V-Skip's visual anchor. V-Skip uses the signal to decide which reasoning tokens must not be cut; VisionPulse uses it to decide how many visual tokens a step gets. Read together, the two papers say clearly that the reasoning chain and the visual tokens are not two separate costs. VisionPulse's Equation 1 even writes it out: total decoding cost is roughly proportional to g·(p+v) + g², where g is the reasoning length and v the number of visual tokens. The g times v term is the point.

**Third, it saves compute, not memory.** The paper doesn't say this outright; I'm inferring it from the method. Each step picks a different set, so the KV cache for every visual token has to stay; prefill runs as usual, the layers before 17 still see everything, and layer 17 must score every visual token before choosing. What is actually saved is the attention computation in the later layers, which also explains why the speed-up is only 1.2–1.3×. So "keep 5%" in the table means something different from a static method's "keep 5%", which really deletes the tokens and really frees memory. The paper doesn't report memory use; the appendix does try FastV deleting half the tokens at prefill followed by VisionPulse (average 69.4 → 70.4), which I think is the more practical setup.

## Long video plus long reasoning: a double explosion nobody has tackled

By the end I noticed that this line of work is tested almost entirely on images. VisionPulse's own formula says "images or videos", and its related work notes that a video can take tens of thousands of visual tokens, yet all seven benchmarks are single images.

That kept me thinking about video reasoning models, the Video-R1 generation that thinks at length before answering. Put them into the g·v term: a long video makes v tens of thousands, long reasoning makes g thousands, and the two blow up together, so the costs multiply. Most work handles one side only: methods that cut visual tokens are mostly tested on images with short reasoning, and methods that compress reasoning are mostly text-only. I have not yet seen anyone take on the case where both explode at once.

Moving VisionPulse to video raises a few questions for me:

- **Does the budget formula still hold?** The budget is total attention on the image times the number of visual tokens. Going from hundreds to tens of thousands of visual tokens flattens the softmax, and a temperature τ tuned on images may not transfer.
- **Where to look changes in time, not just in space.** Reasoning about a video often moves from one moment to another. That makes per-step selection even more sensible, but also riskier: the frames nobody looked at early on may be exactly what the last question asks about.
- **Memory is the first wall.** With long video, the first problem is usually not slowness but not fitting at all. An approach that keeps the whole KV cache doesn't help with the most urgent part.

## Open questions

- **A single run?** Decoding uses temperature 0.7 and the paper doesn't say whether runs were repeated. MMVet has only 218 questions scored by GPT-4o-mini, so small gains such as a relative +1.4% may be within noise.
- **The baselines are pushed outside their range.** FastV and VisionZip were designed to keep far more tokens, so collapsing at 5% is no surprise; and they really save memory, which VisionPulse does not. A comparison at equal memory would be fairer.
- **The coupled bottleneck rests mostly on examples.** The traffic-light and vent cases are convincing, but they are hand-picked. I would like a statistic: how much of the shortened reasoning used to describe things unrelated to the question?
- **No code.** I couldn't find released code when I read it.

## What I want to try

1. **Measure memory**: compare peak memory for the full model, VisionPulse, and FastV + VisionPulse, and see what difference it makes on a card with little memory.
2. **Plot the attention curve on video**: feed a video instead, check whether the look at the visual input spikes when a specific moment is mentioned, and whether it still tracks the number of attended tokens when there are tens of thousands.
3. **Use output length as a health check for compression**: for any compression method, record accuracy, output length and the share of "yes" answers together.
4. **Look at the tokens nobody ever attends to**: measure how many there are and whether their position or content follows a pattern.

---

The paper's numbers were checked against the arXiv v1 PDF (29 May 2026). Scores in the table are the paper's absolute numbers; percentage changes in the text are relative to the original model.
