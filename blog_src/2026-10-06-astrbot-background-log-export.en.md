---
type: post
title: A background task warning and log export for AstrBot
date: 2026-10-06
description: Sent PRs for two AstrBot issues: a warning when a background task's result never reaches the user, and log export from the WebUI.
tags: [open source, AstrBot]
---

Sent [PR #10398](https://github.com/AstrBotDevs/AstrBot/pull/10398) for [#10395](https://github.com/AstrBotDevs/AstrBot/issues/10395), which another contributor reported to [AstrBot](https://github.com/AstrBotDevs/AstrBot). When a background task finishes (for example a subagent started with `background_task=true`), the main agent is woken up and has to call `send_message_to_user` to hand over the result. If it sent nothing in that turn, the user never got the result and nothing showed up in the log. The fix checks after the wake-up whether anything actually reached the user's conversation, and if not, logs a warning with the tool name and task id. It does not resend the result. It is waiting for review.

The maintainer asked in [#10407](https://github.com/AstrBotDevs/AstrBot/issues/10407) for a way to export logs from the WebUI, so users can hand them to developers when they report a problem. The implementation is in [PR #10418](https://github.com/AstrBotDevs/AstrBot/pull/10418): the console and settings pages download a zip with the log files, the in-memory logs and traces, and a manifest of what was packed. The archive never contains host paths and only packs regular files, skipping symlinks. It is waiting for review.
