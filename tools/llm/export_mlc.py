"""Package the merged fine-tune for WebLLM (WebGPU, 4-bit q4f16_1).

Run: python tools/llm/export_mlc.py [merged|base]
Output: D:/yuki-llm/mlc/<name>/  -> upload this folder to a Hugging Face model repo.

The fine-tune keeps Qwen2.5-1.5B's architecture, tokenizer and chat template, so the official
mlc-chat-config.json, shard layout and WebLLM's prebuilt WebGPU library are reused unchanged;
only the weights are re-quantised. MLC's own converter segfaults on this machine, so q4f16.py
reimplements its quantiser (verified byte-identical against mlc-ai's official conversion).
"""
from __future__ import annotations

import shutil
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from q4f16 import convert  # noqa: E402

WORK = Path(r'D:\yuki-llm')
OFFICIAL = 'https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC/resolve/main/'
CARD = """---
license: apache-2.0
base_model: Qwen/Qwen2.5-1.5B-Instruct
tags: [mlc-llm, web-llm, qlora, zh, en]
---
# Yuki (Qwen2.5-1.5B-Instruct, QLoRA) — q4f16_1 for WebLLM

The desktop companion of [niansia.github.io](https://niansia.github.io). QLoRA fine-tune of
Qwen2.5-1.5B-Instruct that answers questions about the portfolio placed in its system prompt,
refuses what the prompt doesn't contain, and emits whitelisted `@command` lines that control the page.
Weights are quantised to 4 bit (q4f16_1) and run in the browser with WebGPU through WebLLM,
using the prebuilt `Qwen2-1.5B-Instruct-q4f16_1` library. Training code: `tools/llm/` in the site repository.
"""


def fetch(name: str, dest: Path) -> None:
    with urllib.request.urlopen(OFFICIAL + name, timeout=120) as r:
        dest.write_bytes(r.read())


def main(which: str) -> None:
    src = WORK / ('merged' if which == 'merged' else 'base-qwen2.5-1.5b')
    out = WORK / 'mlc' / ('yuki-qwen2.5-1.5b-q4f16_1-MLC' if which == 'merged' else 'base-qwen2.5-1.5b-q4f16_1-MLC')
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    layout = WORK / 'official' / 'tensor-cache.json'
    if not layout.exists():
        layout.parent.mkdir(parents=True, exist_ok=True)
        fetch('tensor-cache.json', layout)
    convert(src, out, layout)
    fetch('mlc-chat-config.json', out / 'mlc-chat-config.json')
    # Fine-tuning leaves the tokenizer untouched; ship the original files the WebLLM config expects.
    for name in ('tokenizer.json', 'tokenizer_config.json', 'vocab.json', 'merges.txt'):
        shutil.copy(WORK / 'base-qwen2.5-1.5b' / name, out / name)
    (out / 'README.md').write_text(CARD, encoding='utf-8')
    size = sum(p.stat().st_size for p in out.iterdir()) / 2**20
    print(f'{out}  {size:.0f} MB  {len(list(out.glob("params_shard_*.bin")))} shards')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'merged')
