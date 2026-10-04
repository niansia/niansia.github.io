---
type: post
title: Reporting bugs and sending PRs to AstrBot and Dify
date: 2026-10-04
description: Reported WebChat attachments overwriting each other to AstrBot, with a fix PR; filed two issues with Dify, and sent a fix PR for the webhook 500.
tags: [open source, AstrBot, Dify]
---

Reported to the chatbot framework [AstrBot](https://github.com/AstrBotDevs/AstrBot) that WebChat attachments with the same name overwrite each other ([#10352](https://github.com/AstrBotDevs/AstrBot/issues/10352)). Pasted screenshots are all named `image.png` and attachments were saved under their original name, so each new one replaced the previous one, and deleting a conversation also deleted files other conversations still used. The fix is in [PR #10356](https://github.com/AstrBotDevs/AstrBot/pull/10356): files are stored with a timestamp prefix while the UI keeps the original name. It is waiting for review.

Filed two issues with the LLM app platform [Dify](https://github.com/langgenius/dify). [#43465](https://github.com/langgenius/dify/issues/43465): the HTTP Request node inserted `Array[Object]` variables into the request body as a Python repr (single quotes, `True`, `None`), which corrupted the data. Another contributor has opened a fix in graphon ([langgenius/graphon#328](https://github.com/langgenius/graphon/pull/328)).

[#43469](https://github.com/langgenius/dify/issues/43469): the Webhook trigger returned 500 for a JSON array body, so services that post events as an array, such as SendGrid, kept failing and retrying. The fix is in [PR #43470](https://github.com/langgenius/dify/pull/43470): without body parameters the workflow runs as usual, and with body parameters configured the request gets a 400 that explains why. It is waiting for review.
