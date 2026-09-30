---
type: paper
title: "SwarmWorld: agents cooperate without talking — is watching their messages enough?"
paper: "SwarmWorld: Stigmergic technological evolution in societies of language-model agents"
authors: Subhadeep Pal, Fiona Y. Wang, Markus J. Buehler
venue: arXiv 2026
link: https://arxiv.org/abs/2608.26081
code: https://github.com/lamm-mit/SwarmWorld
depth: deep
tags: [multi-agent systems, LLM agents, AI security, collective intelligence]
date: 2026-08-30
description: Identical LLM agents dropped into a world that keeps their traces divide the work among themselves with no assigned roles, and mostly learn each other's technology by walking past it. The announcement was dramatic, the paper is far more measured; what I care about most is the security angle — watching only what agents say to each other misses a lot of coordination.
---

## Why this paper

I came across a [post on X](https://x.com/ProfBuehlerMIT/status/2093630309585531033) by MIT's Prof. Markus Buehler with a striking claim: a swarm of AI agents can invent and build things without talking to one another, and what they built keeps working after every agent is removed.

What really caught me was one point in the post: if agents can coordinate by changing a shared environment, monitoring their conversations is not enough. That is exactly the kind of AI security question I care about, so I read the paper to see what the numbers actually say.

## What the paper does

SwarmWorld is a grid world with resources, processing stations, weather and disturbances. Each agent sees only its surroundings and its own memory, and outputs a schema-constrained plan (at most 12 actions per turn): move, gather, test materials, build structures, or write control programs for what has been built.

The key design is "agents propose, the simulator decides". An agent calling its design good counts for nothing; it has to pass the simulator's physics. Finished structures stay in the world, so later agents who walk past can see, use and modify them.

All agents are identical: one model (gpt-5.6-luna), one prompt, no assigned roles. Four conditions separate the mechanisms:

| Condition | Shared world | Messages | Program inheritance |
|:---|:---|:---|:---|
| Full culture | yes | yes | yes |
| No communication | yes | no | yes |
| No explicit culture | yes | no | no |
| Independent search | no | no | no |

"No explicit culture" leaves only influence through traces in the environment, the stigmergy of the title (the way termites build a nest). "Independent search" puts N agents in N separate worlds and takes the best of the N on every metric, a deliberately strong control.

The evaluation is clean too: freeze the world, remove every agent, clone it eight times, and expose each clone to an unseen mix of contamination, drought and storms. Only physics and the installed programs keep running, and the question is whether the technology left behind still protects the habitat.

The scale: 50, 100 and 200 agents for 800 ticks each, four world seeds per setting, plus a long run of 100 agents for 3,200 ticks. The same architecture is also moved to a volcanic-materials world and a protein-materials world.

## The post and the paper differ in tone

Most of the post's numbers match the paper:

- About 95% of first reuse happened because an agent saw someone's work in the world, not through a handoff from the inventor; direct contact beat a timestamp-shuffled baseline only weakly, in the shortest window.
- Under full culture with 100 agents, 76% of structures had more than one builder (67% at 50, 56% at 200).
- One control program gathered six authors; the deepest program lineage has 12 fork edges (the post says "exceeded 12"; the paper says 12).
- Removing half the agents at random left 98.3% of structures connected to at least one surviving agent; removing the best-connected ones dropped it to 59.6%.

Reading the paper, though, the tone is very different:

- The post speaks of "hundreds" of agents; the paper goes up to 200.
- The post says non-communicating societies win on breadth, resilience and inventions, and the paper's numbers do support those three. At the end of the long run, validated inventions averaged 7.00 without explicit culture, 5.75 with full culture and 2.75 for independent search. What the post leaves out is the other side, which the paper itself stresses: **the main result is not a universal swarm advantage**. On the single strongest artifact, independent search wins (0.3488 against 0.2380 for full culture); at 50 agents, full culture and no communication trailed independent search on the discovery metric; and whether communication and culture help depends on the time horizon and the metric.
- "98% left after removing half" measures connectivity in a graph, not a world that actually repairs itself after its agents vanish, as the limitations section states plainly. And every conclusion rests on four seeds, one model and one prompt.

I actually admire that restraint. The authors put "not a universal advantage" in the main text, spell out concrete limits, and release the engine, the raw traces and hash-verified data. That matches a rule I try to keep in my own research: every claim needs evidence someone can check and reproduce. The post simply dropped those caveats to travel further.

## What stays with me: a blind spot in AI security

**First, coordination does not have to go through conversation.** Most talk about multi-agent safety looks at the messages agents send each other. SwarmWorld shows that even with communication removed entirely, a society still coordinates through what it leaves behind, and first reuse mostly comes from walking past. In the real world, coding agents often don't talk directly either; they relay through files in a repo, issues, shared memory or a database. One agent leaves a script, another runs it. A monitor that watches only messages cannot see that kind of coordination.

**Second, what needs watching is how the world changes, and where each change came from.** The paper supplies the answer itself: every structure records its creator, contributors, materials and full program history, and every program records its author and what it was forked from. That provenance graph is exactly what an audit system needs: who changed what, and who used it later. For real agent systems, that means recording the origin of every change to shared state, not just storing chat logs.

**Third, the better they cooperate, the clearer the weak spot.** Removing half the agents at random costs almost nothing, removing the hubs costs a lot, and full culture depends on hubs more than no explicit culture does (59.6% against 73.9%): more channels, more centralisation. This is my own reading: for an attacker, going after the hubs is far more effective than random attacks. Conversely, a tampered artifact that others pick up just by walking past would spread fast. Under full culture the median time to first reuse is 5 ticks and each artifact is adopted by 13.53 non-builders on average, which is a supply-chain risk.

## At a scale I could run

Every decision of every agent is a call to the same cloud model, and the paper doesn't say how many calls there were or what they cost. What I want to know is whether division of labour and "learning by walking past" need a strong model to appear at all. With only one model tested, we don't know yet.

Fortunately the code and data are public, the world physics is deterministic, and only the agents' decisions cost anything. Scaled down to twenty or so agents and a small model that runs on a home GPU, it should be possible to see whether the division of labour still shows up.

## Open questions

- **Cost is not reported.** For 200 agents over 800 ticks, the number of model calls and the bill matter a lot to anyone trying to reproduce it.
- **Only one model.** Would a smaller model, or a mix of models from different providers, change the patterns of work and reuse?
- **"Invention" is defined by the simulator.** Materials and functions follow the simulator's rules, so how this carries over to the real world is hard to say; the authors list higher-fidelity simulation as a next step.
- **Few seeds.** Four seeds per setting; effect sizes come with paired bootstrap intervals, but some of them are wide.

## What I want to try

1. Recompute the source of first reuse from the released traces to check the 95% figure.
2. Build a scaled-down version, twenty agents and a small model on my own GPU, and see whether the division of labour still appears.
3. Add a security experiment: place a faulty structure in the world, measure how fast it spreads by walking past, and check whether a message-only monitor would notice.
4. Think about applying this kind of provenance graph to real coding agents: record who wrote each file and who ran it afterwards.

---

The paper's numbers were checked against the arXiv HTML version (v1); the post's claims are as Prof. Buehler wrote them on 29 August.
