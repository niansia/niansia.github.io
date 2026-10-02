# niansia.github.io

Personal academic portfolio built with [Quarto](https://quarto.org/) and deployed through GitHub Pages.

The public site has three language editions:

- English: `/`
- Traditional Chinese: `/zh-tw/`
- Simplified Chinese: `/zh-cn/`

## Papers, paper pages and the one-page brief

- **Papers** live in `assets/js/publications-data.js` and appear in the terminal as `papers.bib`, in the one-page brief, and (with `page: true`) as a static project page at `/paper/<id>/`. Status runs from `in-prep` to `published`; `anonymous: true` keeps the title, authors and links hidden everywhere while a double-blind review is running. Longer sections for a paper page go in `papers_src/<id>.en.md` and `papers_src/<id>.zh-TW.md` (zh-CN is converted). Figures go in `assets/publications/`.
- `draft: true` keeps an entry out of every list and the sitemap: its page is built with `noindex` and a preview banner, and the terminal shows it only with `?papers=preview`. The field list is at the top of `publications-data.js`.
- Manuscripts in preparation come from `assets/js/submissions-data.js` (venue, research area and deadline only).
- **One-page brief** (`/brief/`, `/brief/zh-tw/`, `/brief/zh-cn/`) is a fast, printable page for professors and interviewers, generated from the same data as the terminal (profile copy, CV data, projects, papers, notes). It is linked from the top bar, the home screen, the no-JavaScript fallback, the palette and the `brief` command.

`python tools/build_static.py --og-missing` rebuilds the static pages (notes, log, statement, project pages, brief, papers) and renders only the Open Graph images that do not exist yet.

## Project pages (`/p/<id>/`) and showcases

Each project's long-form part (architecture, a replay of real runs, measured results) is written once, as a showcase in `assets/js/showcases.js` with its styles in `assets/css/showcases.css`. The terminal loads both the first time the projects are opened or a project link is pointed at, so the home screen does not download them.

The terminal's project views are `#hash` routes that search engines do not index, so every project also has a static page in three languages, and the terminal's project rows are real links to them (a plain click still opens the project in the terminal). After changing a showcase or its data, read the showcases back and rebuild:

```powershell
quarto render                        # the extractor reads the terminal from _site/
python tools/project_pages.py        # -> projects_src/showcase.json (headings, text, lists, tables; never raw HTML)
python tools/build_static.py --no-og # -> p/<id>/index.html (+ zh-tw/, zh-cn/)
quarto render
```

Interactive parts (replays, sliders, galleries) are listed in `WIDGETS` in `tools/project_pages.py` and become a link to the interactive version.

## Adversarial Lab (`/lab/adversarial/`)

An in-browser attack playground under the AI-security research direction, listed as a project (`adversarial-lab`). Its source, training and evaluation live in **[niansia/adversarial-lab](https://github.com/niansia/adversarial-lab)**; this site hosts the published page (`lab/adversarial/`) and its files (`assets/advlab/`: the JavaScript engine, the decision-map worker, float16 weights, `robustness.json`, sample digits). To update it, retrain or change the page in that repository and copy `web/*` into `assets/advlab/` (the page itself goes to `lab/adversarial/index.html` with absolute asset paths).

## Navigation and style

- **Command palette**: Ctrl+K / ⌘K, the search pill in the top bar, or `palette [text]`. One fuzzy search over pages, projects, papers, notes, actions, styles and commands (`>` lists commands, `?` asks Yuki). Arrowing onto a style previews it; Enter keeps it. Recently used items come first (`assets/js/command-palette.js`).
- **Style picker**: each of the 13 styles is shown as a miniature of the terminal drawn with that style's own tokens (`[data-theme-scope]` in `styles.scss`). Hovering or arrowing previews the whole page; a click keeps it.
- **Transitions**: moving between files slides the reading pane in the direction of travel, and a project's title morphs between its directory row and its page (View Transitions; keyboard moves stay instant, and paused or reduced motion turns them off). The static pages cross-fade between each other and the terminal, and a note's title morphs from its card into the page heading.
- **Yuki's tour** (`assets/js/yuki-tour.js`): three routes (research, builder, fun) with a spotlight and a card that follows the page. Start it from the home card, the palette, `tour [route]`, by asking Yuki ("show me around", 「帶我逛逛」), or with `?tour=research`. First-time visitors get one offer in Yuki's speech bubble.
- **The sky** follows the visitor's clock: `paintSky` in `lab-terminal.js` sets `<html data-daypart>` (dawn, morning, noon, afternoon, dusk, evening, night) and a `.day-sky` layer washes the desk around the terminal, mostly the strip above it: a sunrise glow, a dusk horizon, then a moon, stars and the odd shooting star. The clock shows a sun or a moon. `sky <part>` previews another time for the visit, `sky auto` follows the clock again. Twinkling and shooting stars follow the *background & interface* motion switch.

## Yuki, the desktop companion

Yuki lives on the terminal's command line (`assets/js/yuki-pet.js`). Visitors can drag and drop her, rub her head, feed her, play yarn ball, send her to bed or ask her to lie down for pats. She keeps fullness, mood and energy in `localStorage`, nudges visitors who ignore her, and greets returning visitors. The pointer companion, trails (hearts, paw prints, stars, petals) and click bursts are in `assets/js/cursor-fx.js`. The page has five styles: porcelain, ink, sakura, matcha and retro CRT.

**Actions and levels.** Patting brings a hand down to stroke her head; feeding holds a snack to her mouth that she eats in three bites; lying down puts her head on a school desk; play is in place (juggling a yarn ball, or a feather wand that follows the pointer when it comes close), and she only runs after a ball across the floor when *stay in place* is off. Performances are a spin, a dance, a toy-piano tune or a violin piece, played with a small Web Audio synth (public-domain melodies; music is off until the visitor turns it on in the settings tab). Every level from 2 to 10 unlocks something: dance, the feather wand, piano, taiyaki, violin, happy sparkles, strawberry cake, an encore medley and a golden badge. The props and the synth are in `assets/js/yuki-props.js`; the menu has four tabs (play, levels, outfits, settings) so it keeps one height.

She has a wardrobe of 24 looks and 14 head-anchored accessories (`assets/js/yuki-wardrobe.js`; see `tools/outfits/README.md` for how looks are built). On Taiwan holidays (`assets/js/festivals.js`: lunar dates via the browser's Chinese calendar, long weekends and compensatory days included) the whole page switches to a festival skin, Yuki changes into the matching look and accessory, and `festival list` shows the calendar.

**Cat form.** A button in her menu (or `meow`) turns her into a cat in a puff of smoke, and back; the choice is remembered, and the catgirl stays the default. The cat is drawn from three generated sprite sheets (`tools/cat/README.md` has the prompts and poses; put them in `art/cat/` and run `python tools/build_cat.py`, which writes `assets/lab/yuki/cat/`). `assets/js/yuki-cat.js` maps the catgirl's poses onto the cat's frames and adds what one painting per pose cannot show (breathing, a trot, kicking paws on her back, a roll-over flip, the smoke); as a cat she rolls over to play, shows her belly when acting cute, sits for pats and dances instead of playing an instrument. Outfits and accessories are for the catgirl.

**Study companion** (`assets/js/study-buddy.js`, on `/exams/`): the cat sits in the corner of the exam gallery; tapping her opens the days left to the GSAT (then the AST; official CEEC dates in the script), a 25/5 or 50/10 focus timer that survives reloads and background tabs, and today's count. She naps while you focus and rolls on her back during breaks. A switch in the panel swaps her for an exam proctor (an original character, `assets/study/README.md`): same timers and rules, cram-school lines, and he also calls you out when you leave the page during a focus round. Coming back from another tab (an exam strike, or leaving a running focus round) plays the jeep: an army jeep drives in from the right, the companion is lifted into the back seat ("你作弊！吉普車在外面等你。"), and it drives off to the left before the usual dialog.

**What she knows about the page.** Opening a project, she says one real number from it (lines `proj-<id>` in `tools/yuki_brain_data.py`: keep them in step with the project's data); on papers.bib she counts down to the next deadline, on blog/ she names the newest post. Showcases tell her about moments through `niansia:showcase` events (`moment()` in `assets/js/showcases.js`): a replay finding a failure, a gate saying BLOCK or SHIPPABLE, a cutoff moving, the first drag of a before/after slider. Each line (`sc-<id>-<key>`) is said once per visit. After 23:00 she yawns more, plays less and once suggests going to bed. Regenerate the lines with `python tools/train_yuki_brain.py --lines-only` (no retraining).

Her chat runs a small on-device model (`assets/js/yuki-brain.js`, weights in `assets/yuki/brain.json`, about 110 KB). Hashed character and word n-grams feed 16-d int8 embeddings, attention pooling and an MLP that picks one of 43 intents. Entity slots (project, language, style) and TF-IDF retrieval over the project texts ground the answers. Typed text never leaves the browser, and any line that isn't a command, typed into the terminal, is answered by Yuki.

Regenerate the assets after editing their sources:

```powershell
python tools/build_yuki_assets.py   # sprite layers from assets/lab/yuki-sprites.png
python tools/train_yuki_brain.py    # model + assets/js/yuki-lines.js (needs torch, opencc)
```

Dialogue and training utterances live in `tools/yuki_brain_data.py`. Edit that file, not the generated `yuki-lines.js`.

### Full-size Yuki (optional, WebGPU)

`tools/llm/` fine-tunes Qwen2.5-1.5B-Instruct with QLoRA (`make_dataset.py`, `train_qlora.py`), evaluates it on hand-written held-out questions (`eval_llm.py`: 79% fully correct vs 40% for the base model) and packages 4-bit q4f16_1 weights for WebLLM (`export_mlc.py`, using `q4f16.py`, a byte-exact reimplementation of MLC's quantiser). Portfolio facts stay in the prompt (`assets/yuki/llm-prompt.json`), so editing a project needs no retraining. Visitors opt in from the chat panel. The card stays hidden until `PUBLISHED_URL` in `assets/js/yuki-llm.js` points to the uploaded weights (a Hugging Face model repo).

## Local preview

```powershell
quarto preview
```

The published site is available at <https://niansia.com> (niansia.github.io redirects there).
