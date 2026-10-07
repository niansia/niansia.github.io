---
type: post
title: Fix PRs for vLLM and AstrBot
date: 2026-10-07
description: Sent vLLM a fix PR for parsing DeepSeek-V3/V3.1 tool calls; reported to AstrBot that Anthropic streaming drops tool calls without arguments and sent a fix, and the earlier command group fix is merged.
tags: [open source, vLLM, AstrBot]
---

Sent the LLM inference engine [vLLM](https://github.com/vllm-project/vllm) a fix in [PR #60362](https://github.com/vllm-project/vllm/pull/60362) for [#60342](https://github.com/vllm-project/vllm/issues/60342), which another user reported. The DeepSeek-V3 and V3.1 tool call parsers (`deepseek_v3`, `deepseek_v31`) matched the arguments with `.`, which stops at a newline, so when the model pretty-printed the JSON arguments over several lines, non-streaming mode returned no tool calls at all and streaming mode only got the first line, `{`. The fix lets only the arguments span lines, keeps the function name on one line so parallel calls still split correctly, and adds streaming and non-streaming tests for both parsers. It is waiting for review.

Reported to [AstrBot](https://github.com/AstrBotDevs/AstrBot) that in Anthropic streaming mode, tool calls without arguments are dropped ([#10431](https://github.com/AstrBotDevs/AstrBot/issues/10431)). Such a tool only receives one empty argument chunk, and the code ran `json.loads` on the empty string, skipped the call when parsing failed, and raised `EmptyModelOutputError` if the turn had no text. Providers built on the Anthropic one, such as Kimi Code and MiniMax, were affected too. The fix is in [PR #10432](https://github.com/AstrBotDevs/AstrBot/pull/10432): with empty arguments the tool keeps the empty `{}` from the start of the block. It is waiting for review.

The fix for the command group matching issue I reported on October 4 ([#10371](https://github.com/AstrBotDevs/AstrBot/issues/10371)), [PR #10372](https://github.com/AstrBotDevs/AstrBot/pull/10372), was merged on October 6.
