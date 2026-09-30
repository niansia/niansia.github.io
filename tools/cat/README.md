# Yuki's cat form — sprite sheets to generate

Yuki can turn into a cat (a button in her menu, with a puff of smoke). The cat is drawn from generated
sprite sheets in the same anime style as the character sheet. Generate the three sheets below, save them as
`art/cat/a.png`, `art/cat/b.png` and `art/cat/c.png` (the `art/` folder is git-ignored), then run
`python tools/build_cat.py`. The script removes the background, cuts the poses, matches their scale using the
standing cat that opens every sheet, and writes `assets/lab/yuki/cat.webp` plus its layout.

## How to generate

1. **Attach the reference image** of the cat (the full-body + face + paw character sheet), so the face, fur,
   eyes, flower and painting style stay the same in every sheet.
2. **Paste the shared prompt**, then the pose list of the sheet you are making.
3. Save it with the sheet's name. If a result has cats touching each other, a cropped tail or paws, a floor or
   shadows, or a cat facing left, regenerate it: the script needs four separate cats in one row.

### Shared prompt (copy everything in the box)

```text
Use the attached character sheet as the exact character reference. Keep her identity and art style:
a white long-haired fluffy cat drawn in soft Japanese anime illustration style (not chibi, not 3D,
not realistic photo), white fur with pale lavender shading, large violet eyes with vertical pupils,
pink inner ears, pink nose and pink paw pads, a small dark violet five-petal flower tucked by her ear,
a very large fluffy tail. Same face, same soft painterly shading, same clean thin line art.

Draw ONE sprite sheet, 1536 x 1024 pixels, with a transparent background. If transparency is not
possible, use a flat pure green background (#00FF00) with no gradient, no floor and no shadows.
Four full-body cats in a single row, evenly spaced, all at the same scale, paws on the same baseline,
with a clear gap between them (nothing overlapping or touching). Every cat is seen from the side,
body facing the viewer's RIGHT, with the head turned a little toward the viewer. The whole cat,
including the tail tips and ears, is inside the frame. No text, no props, no background objects.
```

### Sheet A — moving (`art/cat/a.png`)

```text
1. Standing still, relaxed, tail hanging down in a soft curve.
2. Walking, mid-stride: the front leg nearest the viewer stepping forward, the near hind leg back.
3. Walking, the other half of the stride: the near front leg back, the near hind leg forward.
4. Leaping forward: body stretched long, front legs reaching ahead, hind legs pushing off, tail streaming behind.
```

### Sheet B — moods (`art/cat/b.png`)

```text
1. Standing still, relaxed, tail hanging down in a soft curve (same as the first cat of every sheet).
2. Sitting upright, looking at the viewer, tail wrapped around the front paws.
3. Lying on her back with the belly up, all four paws curled in the air showing the pink paw pads,
   looking at the viewer upside-down, playful and asking for belly rubs.
4. Sleeping curled up into a round ball, eyes closed, tail wrapped around her body, peaceful.
```

### Sheet C — actions (`art/cat/c.png`)

```text
1. Standing still, relaxed, tail hanging down in a soft curve (same as the first cat of every sheet).
2. Very happy: sitting, eyes closed in a happy smile (^ ^), tail raised straight up.
3. A big stretch: front legs stretched far forward and low, rear end raised, yawning with the mouth open.
4. Crouching low, about to pounce: chest near the ground, rear end up, eyes wide and focused.
```

## What each pose is used for

| Sheet | Pose | Frame | Used for |
|---|---|---|---|
| A | 1 | `stand` | idle, looking around, being patted |
| A | 2, 3 | `walkA`, `walkB` | walking (alternated, with a bob) |
| A | 4 | `leap` | running, jumping, pouncing, being dropped |
| B | 2 | `sit` | resting, listening, the study companion |
| B | 3 | `belly` | playing: rolling over; acting cute: belly up |
| B | 4 | `curl` | sleeping, lying down |
| C | 2 | `happy` | happy, level up, a snack |
| C | 3 | `stretch` | yawning, waking up |
| C | 4 | `crouch` | getting ready to pounce |
