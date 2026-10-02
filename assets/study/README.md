# Exam proctor

`proctor-sheet.png` is original generated artwork (ChatGPT) for the study companion on `/exams/`: one strict-but-funny exam proctor in five half-body poses on a black background. He is a made-up character, not modelled on any real person. `tools/build_proctor_assets.py` cuts it into `proctor/`:

| File | Pose | Shown when |
|---|---|---|
| `proctor/calm.webp` | holding a clipboard | watching a focus round or an exam |
| `proctor/warn.webp` | tapping his watch | a round starts, the exam's 15- and 5-minute reminders |
| `proctor/shout.webp` | hand up, shouting | back from another tab (a telling-off in a focus round, a strike in an exam), exam voided |
| `proctor/bell.webp` | ringing a hand bell | time up |
| `proctor/tea.webp` | cup of tea | break |

His lines are in `assets/js/study-buddy.js` (`P`): cram-school jokes about army service and old exam papers, written for this page. No real names, no jokes about boys and girls, nothing violent.

Prompt used for the sheet:

```text
Use case: character design sheet for a website mascot.
Create an ORIGINAL cartoon character: a strict-but-funny exam proctor for a Taiwanese university-admission study website. The character must not resemble any real person. Gender-neutral adult with a friendly face, short neat dark hair, round glasses, a simple dusty-blue cardigan over a white collared shirt, and a plain red armband on the upper arm with NO text on it.
Show the SAME character in 5 poses on one canvas: 3 poses in the top row and 2 poses centered in the bottom row. Each pose sits in its own equal-size area with generous empty space between poses. Same scale, half-body (head to waist), facing the viewer.
1. Calm and watching: holding a clipboard, eyebrows level, slight smile.
2. Stern warning: frowning, tapping a wristwatch with one finger.
3. Caught you: eyes wide, mouth open shouting, one hand raised, a small cartoon anger mark near the head. Comedic, not scary.
4. Time's up: ringing a small brass hand bell, mouth open, other hand holding a stack of answer sheets.
5. Break time: eyes closed, happy smile, holding a cup of tea with a little steam.
Style: soft flat vector illustration with a Taiwanese stationery / picture-book feel. Clean simple shapes, gentle rounded outlines in dark gray #3A3A40 (no harsh black), minimal soft shading, no gradients, no texture, no 3D.
Palette that matches a pastel website: blush pink #E6AEC2, dusty rose #CF8EA7, buttercream #FFF1CF, gray-lilac #B4AAC7, sage #BFD2C6, warm light skin tone, dusty blue cardigan, and answer-card red #D23C55 used only for the armband.
Background: fully transparent. If transparency is not possible, one perfectly flat pure white background with no shadow, no floor and no vignette.
No text anywhere: no letters, no Chinese characters, no numbers, no speech bubbles, no captions, no watermark, no border, no frame.
```

The generator ignored the background request and drew a black background with a glow around each pose; the build script handles that (see its header). If the sheet is regenerated with a truly transparent or white background, the `ERASE` boxes in the script can go.
