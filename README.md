# niansia.github.io

Personal academic portfolio built with [Quarto](https://quarto.org/) and deployed through GitHub Pages.

The public site has three language editions:

- English: `/`
- Traditional Chinese: `/zh-tw/`
- Simplified Chinese: `/zh-cn/`

Publication and conference entries are designed to support a thumbnail, citation, venue, authors, status, paper, code, project page, poster, and slides. A reusable starter entry lives in `_templates/publication-entry.qmd`; place future visuals in `assets/publications/`.

## Yuki, the desktop companion

Yuki lives on the terminal's command line (`assets/js/yuki-pet.js`). Visitors can drag and drop her, rub her head, feed her, play yarn ball, send her to bed or ask her to lie down for pats. She keeps fullness, mood and energy in `localStorage`, nudges visitors who ignore her, and greets returning visitors. The pointer companion, trails (hearts, paw prints, stars, petals) and click bursts are in `assets/js/cursor-fx.js`. The page has five styles: porcelain, ink, sakura, matcha and retro CRT.

She has a wardrobe of 24 looks and 14 head-anchored accessories (`assets/js/yuki-wardrobe.js`; see `tools/outfits/README.md` for how looks are built). On Taiwan holidays (`assets/js/festivals.js`: lunar dates via the browser's Chinese calendar, long weekends and compensatory days included) the whole page switches to a festival skin, Yuki changes into the matching look and accessory, and `festival list` shows the calendar.

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

The published site is available at <https://niansia.github.io>.
