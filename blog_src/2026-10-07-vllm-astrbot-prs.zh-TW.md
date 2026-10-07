---
type: post
title: 替 vLLM 和 AstrBot 送修正 PR
date: 2026-10-07
description: 向 vLLM 送出 DeepSeek-V3/V3.1 工具呼叫解析的修正 PR；向 AstrBot 回報 Anthropic 串流模式下無參數工具呼叫被丟掉的問題並附上修正，先前的指令組比對修正也已合併。
tags: [開源貢獻, vLLM, AstrBot]
---

向 LLM 推論框架 [vLLM](https://github.com/vllm-project/vllm) 送出修正 [PR #60362](https://github.com/vllm-project/vllm/pull/60362)，對應社群回報的 [#60342](https://github.com/vllm-project/vllm/issues/60342)：DeepSeek-V3 和 V3.1 的工具呼叫解析器（`deepseek_v3`、`deepseek_v31`）用 `.` 比對工具參數，碰到換行就停下來，模型只要把 JSON 參數排成多行，非串流模式就完全拿不到工具呼叫，串流模式的參數也只剩第一行的 `{`。修正只讓參數那一段可以跨行，函式名稱維持單行，同時有多個工具呼叫時仍會各自切開，兩個解析器都補上串流和非串流的測試，目前等待審查。

向 [AstrBot](https://github.com/AstrBotDevs/AstrBot) 回報 Anthropic 串流模式下，沒有參數的工具呼叫會被丟掉（[#10431](https://github.com/AstrBotDevs/AstrBot/issues/10431)）：這種工具只會收到一個空字串的參數片段，程式直接對空字串做 `json.loads`，解析失敗後就略過這次呼叫，這一輪沒有文字輸出時還會報 `EmptyModelOutputError`，繼承 Anthropic 的 Kimi Code、MiniMax 等提供商也一樣受影響。修正放在 [PR #10432](https://github.com/AstrBotDevs/AstrBot/pull/10432)，參數為空時沿用區塊開頭給的空參數 `{}`，目前等待審查。

10 月 4 日回報的指令組比對問題（[#10371](https://github.com/AstrBotDevs/AstrBot/issues/10371)），修正 [PR #10372](https://github.com/AstrBotDevs/AstrBot/pull/10372) 已在 10 月 6 日合併。
