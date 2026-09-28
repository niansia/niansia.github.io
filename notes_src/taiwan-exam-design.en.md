---
title: "Taiwan Exam design notes: the model writes, the scripts only check"
description: An Agent Skill that has an AI write original GSAT practice exams — why its scripts deliberately never vouch for question quality, and how the checks, locks and template stamping are designed.
date: 2026-09-28
order: 3
tags: [Agent Skill, LLM, system design]
---

[Taiwan Exam](https://github.com/niansia/taiwan-exam) has an AI write an original practice exam for Taiwan's GSAT and delivers two PDFs: the questions and the worked solutions. Its core division of labour fits in one sentence: **the model writes the questions; the scripts only lay out, check and stamp pages — and never vouch for question quality.**

## Why split it this way

LLMs are good at writing questions, and just as good at saying they wrote them well. If one model writes, self-reviews and declares itself done, quality problems disappear behind the word "checked". So the design rule is:

- whatever a machine can judge (format, layout, fonts, page density, answer-key distribution, image resolution) is judged by scripts;
- whatever needs judgement (is this a good question, is the difficulty right) must leave **checkable evidence**, and no script may mark it as passed on its own.

The main workflow script says so plainly: it "never authors questions or approves reviews".

## The pipeline

1. **Load knowledge, preflight.** Read only what this subject needs, in chunks of at most 12,000 characters; check the PyMuPDF version, the hashes of the 30 original template PDFs, the answer-rate calibration snapshot, fonts, and whether images can be downloaded.
2. **Paper plan.** Lay out the whole paper first: item numbers, points, four difficulty bands, answer-key distribution, how many figures, total time. Difficulty is calibrated to the official answer rates from the 2022–2026 exams; for maths that means "medium-hard + hard ≥ 70 points, hard ≥ 30 points, 80–92 minutes by hand".
3. **Write in batches.** Two to four items at a time, each batch checkpointed. Bad formats are refused outright: LaTeX, `$` signs, unbalanced tags, figures whose hash does not match, low-resolution images.
4. **Blind re-solving.** An **answer-free** packet is built, each item is solved again from the printed page, and its answer rate is estimated and placed in a difficulty band.
5. **Content lock.** Questions and answers are written into a lock file before any real layout starts; changing a question means re-locking with a written reason.
6. **Stamp onto the original templates.** The question body is a transparent page, placed onto the original CEEC template with PyMuPDF; only the year, page numbers and cover title are dynamic. **Header and footer pixels must be identical before and after stamping**, or the job aborts.
7. **Check every page, then deliver.** Every page and every item crop needs written observations and a pass/fail mark; only after the final check passes are the two PDFs written.

## What the checks look like

- **The PDF inspector has 9 hard failures**: not A4 or rotated, missing or substituted glyphs, text outside the page, answer-rail collisions, answer-rail format, printed source notes on maths items, printed production captions on maths items, columns too narrow, and the wrong font in the writing paper.
- **Page density**: body pages may be at most 32% blank (42% for English), the last page 60%. The layout planner, the inspector and the final check share the same rule, so they never disagree.
- **Final check**: four gates per item (answers, difficulty, originality, visuals), five per paper (structure, difficulty balance, source grounding, template composition, answer separation), plus subject-specific checks.
- **Budgets**: at most 3 layout plans and 2 real builds, so a model cannot retry forever and burn the session.

## Making it run in everyday AI apps

Teachers and students rarely use a terminal, so the same rules ship three ways: a Skill ZIP to upload to Claude or ChatGPT (Claude's uploader accepts at most 200 files, so resources are bundled), a knowledge file for Gemini and project-based setups, and a local install for Codex and Claude Code. A full paper often takes two or three rounds, so every step checkpoints, and replying "continue" picks up where it stopped.

## Honest limits

- **Passing machine checks is not the same as being a good question.** Automated checks only stop things that are obviously wrong; whether a question teaches anything still needs a human.
- **Models differ a lot.** Of the planned 28 test papers (4 models × 7 subjects), 14 are done; the rest are still being tested.
- The project has 112 scripts and 1,089 tests, but the tests verify the tooling, not every question a model writes.

Source and installation: [github.com/niansia/taiwan-exam](https://github.com/niansia/taiwan-exam). There is also an 80-second [film](/assets/film/taiwan-exam.html?lang=en).
