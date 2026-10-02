"""Train the classifier behind Yuki's "trained" chat tier and export it for the browser.

Run from the repository root:  python tools/train_yuki_pro.py   (needs torch and opencc, like train_yuki_brain.py)
Output: assets/yuki/pro.json, read by assets/js/yuki-pro.js.

Same architecture and feature extractor as the small model (hashed n-grams -> attention-pooled embedding bag -> MLP),
a little wider, trained on tools/yuki_pro_data.py: 25 kinds of knowledge question plus `other`, which hands the message
back to the small model. Project mentions become the token `zproj` (the browser does the same before classifying).
The file carries its own Simplified -> Traditional table, so it never depends on brain.json.
"""
from __future__ import annotations

import base64
import json
import random
from pathlib import Path

import numpy as np
import torch
from torch import nn

import train_yuki_brain as tb
from yuki_pro_data import INTENTS, KEYWORDS, OTHER, TEST, TOPICS

ROOT = Path(__file__).resolve().parents[1]
tb.DIM, tb.HIDDEN = 24, 96          # Brain() and batch() read these module globals
SEED = 11
LANG_WORDS = ['英文', '中文', '繁體中文', '簡體', 'english', 'chinese', '日文']
THEME_WORDS = ['深色', '淺色', '櫻花', '抹茶', '復古', 'dark', 'light', 'sakura', 'matcha', 'retro', '玻璃', '夜櫻']


def fill(text: str, rng: random.Random) -> str:
    for slot in ('{p}', '{q}'):
        text = text.replace(slot, 'zproj')
    text = text.replace('{l}', rng.choice(LANG_WORDS)).replace('{topic}', rng.choice(TOPICS))
    text = text.replace('{k}', rng.choice(KEYWORDS))
    while '{t}' in text:
        text = text.replace('{t}', rng.choice(TOPICS), 1)
    return text


def pool_of(templates: list[str], rng: random.Random, other: bool = False) -> list[str]:
    out = []
    for template in templates:
        for text in tb.expand(template):
            if other and '{t}' in text:   # in the small model's templates {t} is a theme name
                text = text.replace('{t}', rng.choice(THEME_WORDS))
            reps = 6 if any(s in text for s in ('{t}', '{k}')) else 1
            out.extend(fill(text, rng) for _ in range(reps))
    return [t for t in out if t.strip()]


def dataset(rng: random.Random) -> tuple[list[str], list[int], list[str]]:
    names = list(INTENTS) + ['other']
    texts, labels = [], []
    for k, name in enumerate(names):
        pool = pool_of(OTHER, rng, other=True) if name == 'other' else pool_of(INTENTS[name], rng)
        target = 2600 if name == 'other' else 340
        chosen = rng.sample(pool, min(len(pool), target))
        while len(chosen) < target:
            chosen.append(tb.augment(rng.choice(pool), rng))
        chosen = [tb.augment(t, rng) if rng.random() < .6 else t for t in chosen]
        texts += chosen
        labels += [k] * len(chosen)
    return texts, labels, names


def s2t_table() -> dict[str, str]:
    table = tb.build_s2t()
    text = ''.join(''.join(v) for v in INTENTS.values()) + ''.join(TOPICS + KEYWORDS) + ''.join(OTHER)
    for ch in set(tb.T2S.convert(text)):
        trad = tb.S2T.convert(ch)
        if len(trad) == 1 and trad != ch and '㐀' <= ch <= '鿿':
            table[ch] = trad
    return table


def main() -> None:
    rng = random.Random(SEED)
    torch.manual_seed(SEED)
    tb.S2T_TABLE = s2t_table()
    texts, labels, names = dataset(rng)
    seqs = [tb.hashed(t) for t in texts]
    counts = np.bincount([i for s in seqs for i in s], minlength=tb.BUCKETS)
    used = [i for i in range(tb.BUCKETS) if counts[i] >= tb.MIN_COUNT]
    known = set(used)
    seqs = [[i for i in s if i in known] for s in seqs]
    kept = [k for k, s in enumerate(seqs) if s]
    texts, labels, seqs = [texts[k] for k in kept], [labels[k] for k in kept], [seqs[k] for k in kept]
    order = list(range(len(seqs)))
    rng.shuffle(order)
    split = int(len(order) * .9)
    train, valid = order[:split], order[split:]
    model = tb.Brain(len(names))
    opt = torch.optim.AdamW(model.parameters(), lr=4e-3, weight_decay=1e-4)
    y = torch.tensor(labels)
    for _ in range(30):
        model.train()
        rng.shuffle(train)
        for start in range(0, len(train), 64):
            idx = train[start:start + 64]
            ids, mask = tb.batch([seqs[i] for i in idx], .12, rng)
            loss = nn.functional.cross_entropy(model(ids, mask), y[idx], label_smoothing=.05)
            opt.zero_grad()
            loss.backward()
            opt.step()
    model.eval()
    marked = [(tb_mark(t), want) for t, want in TEST]
    with torch.no_grad():
        ids, mask = tb.batch([seqs[i] for i in valid], 0, rng)
        val_acc = (model(ids, mask).argmax(1) == y[valid]).float().mean().item()
        test_ids, test_mask = tb.batch([[i for i in tb.hashed(t) if i in known] or [0] for t, _ in marked], 0, rng)
        probs = torch.softmax(model(test_ids, test_mask), 1)
        pred = probs.argmax(1)
    misses = [(t, want, names[p], round(probs[i, p].item(), 2)) for i, ((t, want), p) in enumerate(zip(TEST, pred.tolist())) if names[p] != want]
    test_acc = 1 - len(misses) / len(TEST)
    print(f'examples={len(texts)} intents={len(names)} valid={val_acc:.3f} heldout={test_acc:.3f} ({len(TEST)} questions)')
    for miss in misses:
        print('  miss', miss)

    table = model.embed.weight.detach().numpy()[used]
    scale = float(np.abs(table).max() / 127)
    quant = np.clip(np.round(table / scale), -127, 127).astype(np.int8)
    dense = lambda t: base64.b64encode(t.detach().numpy().astype('<f4').tobytes()).decode()
    pro = {
        'version': 1, 'buckets': tb.BUCKETS, 'dim': tb.DIM, 'hidden': tb.HIDDEN, 'intents': names,
        's2t': ''.join(k + v for k, v in tb.S2T_TABLE.items()),
        'metrics': {'examples': len(texts), 'valid': round(val_acc, 3), 'heldout': round(test_acc, 3), 'heldoutSize': len(TEST)},
        'rows': base64.b64encode(np.asarray(used, '<u2').tobytes()).decode(),
        'embed': base64.b64encode(quant.tobytes()).decode(), 'scale': scale,
        'query': dense(model.query), 'w1': dense(model.hidden.weight), 'b1': dense(model.hidden.bias),
        'w2': dense(model.out.weight), 'b2': dense(model.out.bias),
        'probe': {p: tb.hashed(p) for p in ['zproj 跟 zproj 的差別', '最新的作品是什麼', 'what is zproj', '有沒有可以试玩的']},
    }
    pro['params'] = len(used) * tb.DIM + tb.DIM + tb.HIDDEN * tb.DIM + tb.HIDDEN + len(names) * tb.HIDDEN + len(names)
    out = ROOT / 'assets/yuki/pro.json'
    out.write_text(json.dumps(pro, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')
    print(f'rows={len(used)} params={pro["params"]} size={out.stat().st_size / 1024:.1f} KB')


# The browser marks project mentions before classifying; the held-out set does the same with the names it contains.
NAMES = ['taiwan exam', 'kcrashlab', 'contextsec', 'merriv', 'psg', 'noveltyaudit', 'lumigrid', 'chromarecover', 'adversarial lab',
         'ai repo gardener', 'research meeting coach']


def tb_mark(text: str) -> str:
    low = text.lower()
    for name in sorted(NAMES, key=len, reverse=True):
        low = low.replace(name, ' zproj ')
    return low


if __name__ == '__main__':
    main()
