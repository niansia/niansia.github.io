---
type: post
title: Reporting bugs and sending PRs to AstrBot and Dify
date: 2026-10-04
description: In AstrBot I reported and fixed WebChat attachments overwriting each other; in Dify I reported two bugs and sent a PR for one of them. Notes on the process, the pitfalls, and a few things I didn't expect.
tags: [open source, AstrBot, Dify]
---

## Why I did this

Besides my own projects, I want to take part in other people's large ones: read their codebase, follow their rules, and have people I don't know review my code. Over the past two days I picked two projects I actually use: the chatbot framework [AstrBot](https://github.com/AstrBotDevs/AstrBot) and the LLM app platform [Dify](https://github.com/langgenius/dify).

## AstrBot: screenshots with the same name overwrite each other

When you paste a screenshot into WebChat, the browser almost always calls it `image.png`. AstrBot saved attachments under their original name, so the second screenshot replaced the first one, and the earlier message suddenly showed the new picture. Worse, deleting one conversation also deleted the same-named file that another conversation was still using.

I ran a real AstrBot instance on my own machine to reproduce it, then opened [issue #10352](https://github.com/AstrBotDevs/AstrBot/issues/10352). After that I sent [PR #10356](https://github.com/AstrBotDevs/AstrBot/pull/10356): attachments are now stored with a timestamp prefix, the UI still shows the original name, and there are tests for it.

The Sourcery review bot left two comments almost right away. The first said that with a very long extension, the prefixed name could go over 255 bytes. I wrote a test, saw it was right, and pushed a commit to fix it. The second was about two uploads getting the same timestamp ID. I replied that the odds are tiny and that the rest of the project names files the same way, so I left it.

One small surprise: an account created that same day hit Approve on my PR three times within a minute. Accounts like that approve random PRs, and GitHub doesn't count them; only a maintainer's review matters.

## Dify: English, forms, and speed

Dify is stricter. Issues must be in English, follow a fixed form, and start with six self-check boxes.

What surprised me most was the competition. Dify gets a dozen or more new issues a day, and the same bug is often reported by several people. "Pagination skips rows with the same timestamp" alone has four reports. So before every issue I searched open and closed issues and PRs with several sets of keywords.

The first one was [#43465](https://github.com/langgenius/dify/issues/43465): the HTTP Request node inserted `Array[Object]` variables into the request body as a Python repr (single quotes, `True`, `None`) instead of JSON. The JSON body got "repaired" into different data: `null` became the string `"None"`, and the second item was swallowed into a field of the first. A few hours later another contributor picked it up and opened a fix in graphon, the workflow engine Dify split out into its own package. It was nice to have the bug confirmed, but a little disappointing, because I'd wanted to fix it myself.

Lesson learned: if you want to fix something, say so in the issue and send the PR the same day.

So for the second one, [#43469](https://github.com/langgenius/dify/issues/43469), I ended with "I'll open a PR with a fix." The bug: the Webhook trigger returned 500 whenever the JSON body was an array, which is exactly how services like SendGrid post their events. The same day I sent [PR #43470](https://github.com/langgenius/dify/pull/43470). Without body parameters, the workflow now runs and the payload is available through the raw variable. With body parameters configured, the request gets a 400 that explains why, instead of a 500. The three new tests fail before the fix and pass after it, all 148 webhook tests pass, and I ran the project's lint and type checks before sending it.

## Things I didn't expect

- **The `review: medium` label on Dify issues isn't a rating of the issue.** It's ghfind's score for the author's GitHub account, so every issue from the same person gets the same label.
- **A new contributor's PR doesn't run CI until a maintainer approves it.** A row of `action_required` isn't a failure; it's a queue.
- **Running Dify's tests on Windows has pitfalls.** python-magic hangs on import, the default settings measure coverage over the whole project and take forever, and dotenv-linter complains about CRLF, which is only Windows converting line endings on checkout.
- **A minimal repro that runs without a server, its real output, and links to the code are worth more than a long description.** The contributor who picked up #43465 described the root cause exactly the way I had.

## What's next

Both PRs are waiting for review. If they're merged, I'll officially be a contributor to AstrBot and Dify. I have a few more issues written up and will file them one a day, biggest impact first. Compared with building my own projects, this kind of work, understanding someone else's system first and then changing a small part of it carefully, feels very different, and it's more fun than I expected.
