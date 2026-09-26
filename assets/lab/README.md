# Website companion

`yuki-sprites.png` is original generated Japanese anime character artwork created for this portfolio: idle, walking, happy and sleepy poses on a transparent 1536 × 1024 canvas. It is the source for the layers in `yuki/`, which `tools/build_yuki_assets.py` produces:

- `yuki/pet.webp`: five aligned cells (idle without tail, walk, happy, yawn, blink). Poses are split by pixel connectivity so limbs that cross the old grid stay with their owner.
- `yuki/tail.webp`: the idle tail, animated separately so it can sway and wag.
- `yuki/heads.webp`: idle, happy and sleepy busts for the pointer companion and chat avatars.

The lying, sleeping and eating poses are composed in CSS from these cells plus a drawn bed, blanket and bowl.

The earlier `research-lab` files belong to a previous design and are not used by the terminal desktop. The GitHub profile keeps its separate design.
