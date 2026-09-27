"""Train Yuki's on-device intent model and export it for the browser.

Run from the repository root:  python tools/train_yuki_brain.py
Needs torch and opencc. Outputs:
  assets/yuki/brain.json   hashed n-gram attention classifier (int8 embeddings, ~100 KB)
  assets/js/yuki-lines.js  replies and pet lines in en / zh-TW / zh-CN

Model: text -> normalised (NFKC, lower case, Simplified folded to Traditional) ->
hashed features (CJK unigrams + bigrams, Latin words, word bigrams and character
trigrams) -> embedding bag with a learned attention query -> MLP -> intent softmax.
The feature extractor is mirrored exactly in assets/js/yuki-brain.js.
"""
from __future__ import annotations

import base64
import json
import random
import re
import unicodedata
from pathlib import Path

import numpy as np
import opencc
import torch
from torch import nn

from yuki_brain_data import INTENTS, LINES, PROJECT_SAMPLES, REPLIES, TOPICS

ROOT = Path(__file__).resolve().parents[1]
BUCKETS, DIM, HIDDEN, MIN_COUNT = 8192, 16, 64, 8
SLOTS = {'{p}': '', '{l}': '', '{t}': ''}
SEED = 7

T2S, S2T, TW2SP = opencc.OpenCC('t2s'), opencc.OpenCC('s2t'), opencc.OpenCC('tw2sp')

# Realistic held-out questions (never used for training) to report honest accuracy.
TEST = [
    ('嗨 yuki', 'greet'), ('hello!', 'greet'), ('早安呀', 'greet'), ('你好呀小貓', 'greet'),
    ('我要去睡了 掰', 'bye'), ('see you tomorrow', 'bye'), ('谢谢你', 'thanks'), ('thanks yuki!', 'thanks'),
    ('妳是誰呀', 'yuki_self'), ('what exactly are you?', 'yuki_self'), ('你是机器人吗', 'yuki_self'),
    ('這網站的主人是誰', 'about_owner'), ('who created this website?', 'about_owner'), ('作者是谁', 'about_owner'),
    ('他念哪間大學', 'education'), ('where does niansia study?', 'education'), ('学历是什么', 'education'),
    ('研究方向是什么', 'research'), ('what is niansia researching', 'research'), ('他在研究什麼東西', 'research'),
    ('他有什麼作品', 'projects_list'), ('你主人做过哪些项目', 'projects_list'), ('can i see the projects', 'projects_list'),
    ('我想看全部作品', 'projects_list'), ('list all works', 'projects_list'),
    ('是什麼', 'project_detail'), ('what is  about?', 'project_detail'), ('介绍一下', 'project_detail'),
    (' 在做什么', 'project_detail'), ('explain  to me', 'project_detail'), ('', 'project_detail'),
    ('有沒有跟電腦視覺有關的作品', 'project_find'), ('any project about security?', 'project_find'),
    ('哪个作品和论文有关', 'project_find'), ('is there something for windows drivers', 'project_find'),
    ('你最推哪個作品', 'project_recommend'), ('which one should i check first?', 'project_recommend'),
    ('最新的作品是什么', 'project_latest'), ('what is the newest project', 'project_latest'),
    ('他會什麼程式語言', 'skills'), ('what tech stack do they use', 'skills'),
    ('要怎麼聯絡他', 'contact'), ('how can i reach niansia?', 'contact'), ('邮箱是多少', 'contact'),
    ('原始碼在哪', 'github'), ('where is the github', 'github'),
    ('切換成', 'set_language'), ('switch to  please', 'set_language'), ('换成', 'set_language'),
    ('我看不懂中文', 'set_language'),
    ('換成模式', 'set_theme'), (' theme please', 'set_theme'), ('换个风格', 'set_theme'), ('太亮了啦', 'set_theme'),
    ('关掉动画', 'motion'), ('please stop the animations', 'motion'),
    ('不要跟著我', 'follow_toggle'), ('stop following my mouse', 'follow_toggle'),
    ('換成貓掌拖尾', 'trail_style'), ('turn off the trail', 'trail_style'), ('游標小人大一點', 'cursor_size'),
    ('摸摸頭', 'pet_pat'), ('can i pat you?', 'pet_pat'), ('给你摸摸', 'pet_pat'),
    ('你餓了嗎', 'pet_feed'), ('here have a snack', 'pet_feed'), ('吃小鱼干吗', 'pet_feed'),
    ('陪我玩', 'pet_play'), ('i am so bored', 'pet_play'), ('去睡覺吧', 'pet_sleep'), ('you look sleepy', 'pet_sleep'),
    ('快起床', 'pet_wake'), ('wake up yuki', 'pet_wake'), ('趴下', 'pet_lie'), ('lie down please', 'pet_lie'),
    ('跳個舞', 'pet_trick'), ('do a spin', 'pet_trick'), ('你今天好嗎', 'pet_status'), ('how are you feeling', 'pet_status'),
    ('你擋到我了', 'hide'), ('go hide', 'hide'), ('你在哪裡', 'show'),
    ('我今天好累', 'comfort'), ('i feel so stressed', 'comfort'), ('我心情不好', 'comfort'),
    ('我好開心', 'happy'), ('i passed my exam!', 'happy'), ('你好可愛', 'compliment'), ('you are so cute', 'compliment'),
    ('我喜歡妳', 'love'), ('i love you yuki', 'love'), ('你好笨', 'insult'), ('you are useless', 'insult'),
    ('講個笑話', 'joke'), ('tell me something funny', 'joke'), ('哈哈哈哈', 'laugh'), ('lmao', 'laugh'),
    ('現在幾點', 'time_date'), ('what day is today', 'time_date'), ('你可以做什麼', 'help_chat'), ('what can i ask you', 'help_chat'),
    ('回首頁', 'nav_home'), ('go back home', 'nav_home'), ('你喜歡吃什麼', 'favorite'), ('what is your favorite food', 'favorite'),
    ('今天台北天氣', 'oos'), ('幫我寫作業', 'oos'), ('what is the capital of japan', 'oos'), ('比特币会涨吗', 'oos'),
]


def expand(template: str) -> list[str]:
    """Expand (a|b) groups and [optional] parts into every combination."""
    match = re.search(r'\(([^()]*)\)|\[([^\[\]]*)\]', template)
    if not match:
        return [template]
    options = match.group(1).split('|') if match.group(1) is not None else ['', match.group(2)]
    head, tail = template[:match.start()], template[match.end():]
    out = []
    for option in options:
        out.extend(expand(head + option + tail))
    return out


def build_s2t() -> dict[str, str]:
    """Simplified -> Traditional character table covering training text and project data."""
    text = ''.join(''.join(v) for v in INTENTS.values()) + ''.join(TOPICS + PROJECT_SAMPLES)
    for replies in list(REPLIES.values()) + list(LINES.values()):
        text += ''.join(replies.get('zh-TW', []))
    data = (ROOT / 'assets/js/portfolio-data.js').read_text(encoding='utf-8')
    projects = json.loads(data[data.index('{'):data.rindex('}') + 1])
    text += json.dumps(projects, ensure_ascii=False)
    simplified = set(T2S.convert(text)) | set(json.dumps(projects['zh-CN'], ensure_ascii=False))
    table = {}
    for ch in sorted(simplified):
        trad = S2T.convert(ch)
        if len(trad) == 1 and trad != ch and '㐀' <= ch <= '鿿':
            table[ch] = trad
    return table


S2T_TABLE: dict[str, str] = {}


def normalise(text: str) -> str:
    text = unicodedata.normalize('NFKC', text).lower()
    text = ''.join(S2T_TABLE.get(ch, ch) for ch in text)
    return re.sub(r'[^0-9a-z㐀-鿿-]+', ' ', text).strip()


def units(text: str) -> list[str]:
    return re.findall(r'[0-9a-z]+|[㐀-鿿-]', text)


def features(text: str) -> list[str]:
    toks = units(normalise(text))
    out = []
    for i, tok in enumerate(toks):
        cjk = len(tok) == 1 and not tok.isascii()
        if cjk:
            out.append('c:' + tok)
            if i + 1 < len(toks) and len(toks[i + 1]) == 1 and not toks[i + 1].isascii():
                out.append('b:' + tok + toks[i + 1])
        else:
            out.append('w:' + tok)
            if i + 1 < len(toks) and toks[i + 1].isascii():
                out.append('p:' + tok + '_' + toks[i + 1])
            padded = '^' + tok + '$'
            if len(tok) >= 3:
                out.extend('g:' + padded[j:j + 3] for j in range(len(padded) - 2))
    return out or ['w:']


def fnv(text: str) -> int:
    h = 0x811C9DC5
    for ch in text:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return h


def hashed(text: str) -> list[int]:
    return [fnv(f) % BUCKETS for f in features(text)]


EN_PRE = ['', '', '', 'hey ', 'yuki ', 'so ', 'um ', 'please ', 'ok ', 'hmm ']
EN_POST = ['', '', '', '?', '!', ' please', ' yuki', ' pls', ' lol', ' now']
ZH_PRE = ['', '', '', 'yuki', '欸', '請問', '那個', '嗯', '想問', '小雪', '喂', '對了']
ZH_POST = ['', '', '', '嗎', '呢', '啊', '呀', '～', '?', '！', '啦', '喔', '吧']


def augment(text: str, rng: random.Random) -> str:
    zh = bool(re.search(r'[㐀-鿿]', text))
    pre, post = (ZH_PRE, ZH_POST) if zh else (EN_PRE, EN_POST)
    out = rng.choice(pre) + text + rng.choice(post)
    if not zh and rng.random() < .15 and len(out) > 5:  # light typo noise
        i = rng.randrange(1, len(out) - 1)
        out = out[:i] + out[i + 1:] if rng.random() < .5 else out[:i] + out[i + 1] + out[i] + out[i + 2:]
    if zh and rng.random() < .3:  # visitors type Simplified too
        out = T2S.convert(out)
    return out


def dataset(rng: random.Random) -> tuple[list[str], list[int], list[str]]:
    names = list(INTENTS)
    texts, labels = [], []
    for k, name in enumerate(names):
        pool = []
        for template in INTENTS[name]:
            for text in expand(template):
                if '{topic}' in text:
                    pool.extend(text.replace('{topic}', t) for t in rng.sample(TOPICS, 8))
                else:
                    pool.append(text)
        pool = [p for p in pool if p.strip()]
        target = 520 if name == 'oos' else 360
        chosen = rng.sample(pool, min(len(pool), target))
        while len(chosen) < target:
            chosen.append(augment(rng.choice(pool), rng))
        chosen = [augment(t, rng) if rng.random() < .6 else t for t in chosen]
        for text in chosen:
            for slot, mark in SLOTS.items():
                text = text.replace(slot, mark)
            texts.append(text)
            labels.append(k)
    return texts, labels, names


class Brain(nn.Module):
    def __init__(self, classes: int):
        super().__init__()
        self.embed = nn.Embedding(BUCKETS + 1, DIM, padding_idx=BUCKETS)
        nn.init.normal_(self.embed.weight, std=.1)
        with torch.no_grad():
            self.embed.weight[BUCKETS].zero_()
        self.query = nn.Parameter(torch.zeros(DIM))
        self.hidden = nn.Linear(DIM, HIDDEN)
        self.out = nn.Linear(HIDDEN, classes)
        self.drop = nn.Dropout(.2)

    def forward(self, ids: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        e = self.embed(ids)
        score = (e @ self.query) / DIM ** .5
        score = score.masked_fill(~mask, -1e9)
        attn = torch.softmax(score, dim=1).unsqueeze(-1)
        mean = (e * mask.unsqueeze(-1)).sum(1) / mask.sum(1, keepdim=True)
        x = (attn * e).sum(1) + mean
        return self.out(self.drop(torch.relu(self.hidden(x))))


def batch(seqs: list[list[int]], drop: float, rng: random.Random) -> tuple[torch.Tensor, torch.Tensor]:
    kept = []
    for seq in seqs:
        s = [i for i in seq if rng.random() >= drop] or seq[:1]
        kept.append(s)
    width = max(len(s) for s in kept)
    ids = torch.full((len(kept), width), BUCKETS, dtype=torch.long)
    for r, s in enumerate(kept):
        ids[r, :len(s)] = torch.tensor(s)
    return ids, ids != BUCKETS


def main() -> None:
    global S2T_TABLE
    rng = random.Random(SEED)
    torch.manual_seed(SEED)
    S2T_TABLE = build_s2t()
    texts, labels, names = dataset(rng)
    seqs = [hashed(t) for t in texts]
    # Prune: rows seen fewer than MIN_COUNT times barely help but dominate the file size.
    counts = np.bincount([i for s in seqs for i in s], minlength=BUCKETS)
    used = [i for i in range(BUCKETS) if counts[i] >= MIN_COUNT]
    known = set(used)
    seqs = [[i for i in s if i in known] for s in seqs]
    kept = [k for k, s in enumerate(seqs) if s]
    texts, labels, seqs = [texts[k] for k in kept], [labels[k] for k in kept], [seqs[k] for k in kept]
    order = list(range(len(seqs)))
    rng.shuffle(order)
    split = int(len(order) * .9)
    train, valid = order[:split], order[split:]
    model = Brain(len(names))
    opt = torch.optim.AdamW(model.parameters(), lr=4e-3, weight_decay=1e-4)
    y = torch.tensor(labels)
    for epoch in range(28):
        model.train()
        rng.shuffle(train)
        for start in range(0, len(train), 64):
            idx = train[start:start + 64]
            ids, mask = batch([seqs[i] for i in idx], .12, rng)
            loss = nn.functional.cross_entropy(model(ids, mask), y[idx], label_smoothing=.05)
            opt.zero_grad()
            loss.backward()
            opt.step()
    model.eval()
    with torch.no_grad():
        ids, mask = batch([seqs[i] for i in valid], 0, rng)
        val_acc = (model(ids, mask).argmax(1) == y[valid]).float().mean().item()
        test_ids, test_mask = batch([[i for i in hashed(t) if i in known] or [0] for t, _ in TEST], 0, rng)
        probs = torch.softmax(model(test_ids, test_mask), 1)
        pred = probs.argmax(1)
    misses = [(t, want, names[p], round(probs[i, p].item(), 2)) for i, ((t, want), p) in enumerate(zip(TEST, pred.tolist())) if names[p] != want]
    test_acc = 1 - len(misses) / len(TEST)
    print(f'examples={len(texts)} intents={len(names)} valid={val_acc:.3f} heldout={test_acc:.3f} ({len(TEST)} questions)')
    for miss in misses:
        print('  miss', miss)

    # Export: only embedding rows that training touched; the rest are zero at inference.
    table = model.embed.weight.detach().numpy()[used]
    scale = float(np.abs(table).max() / 127)
    quant = np.clip(np.round(table / scale), -127, 127).astype(np.int8)
    dense = lambda t: base64.b64encode(t.detach().numpy().astype('<f4').tobytes()).decode()
    brain = {
        'version': 1, 'buckets': BUCKETS, 'dim': DIM, 'hidden': HIDDEN, 'intents': names,
        's2t': ''.join(k + v for k, v in S2T_TABLE.items()),
        'metrics': {'examples': len(texts), 'valid': round(val_acc, 3), 'heldout': round(test_acc, 3), 'heldoutSize': len(TEST)},
        'rows': base64.b64encode(np.asarray(used, '<u2').tobytes()).decode(),
        'embed': base64.b64encode(quant.tobytes()).decode(), 'scale': scale,
        'query': dense(model.query), 'w1': dense(model.hidden.weight), 'b1': dense(model.hidden.bias),
        'w2': dense(model.out.weight), 'b2': dense(model.out.bias),
    }
    brain['params'] = len(used) * DIM + DIM + HIDDEN * DIM + HIDDEN + len(names) * HIDDEN + len(names)
    out = ROOT / 'assets/yuki'
    out.mkdir(parents=True, exist_ok=True)
    (out / 'brain.json').write_text(json.dumps(brain, separators=(',', ':')), encoding='utf-8')
    print(f'rows={len(used)} params={brain["params"]} size={(out / "brain.json").stat().st_size / 1024:.1f} KB')

    # Self-check vectors so the JavaScript port can be verified against Python.
    probe = ['KCrashLab 是什麼', '换成深色模式', 'show me the projects']
    brain_check = {p: hashed(p) for p in probe}
    (ROOT / 'tools/yuki_brain_probe.json').write_text(json.dumps(brain_check, ensure_ascii=False), encoding='utf-8')

    write_lines()


def write_lines() -> None:
    lines = {'en': {}, 'zh-TW': {}, 'zh-CN': {}}
    for group in (REPLIES, LINES):
        for key, variants in group.items():
            lines['en'][key] = variants['en']
            lines['zh-TW'][key] = variants['zh-TW']
            lines['zh-CN'][key] = [TW2SP.convert(v) for v in variants['zh-TW']]
    js = '/* Generated by tools/train_yuki_brain.py. Edit tools/yuki_brain_data.py instead. */\n'
    js += 'window.YUKI_LINES = ' + json.dumps(lines, ensure_ascii=False, indent=1) + ';\n'
    (ROOT / 'assets/js/yuki-lines.js').write_text(js, encoding='utf-8')


if __name__ == '__main__':
    # --lines-only rewrites assets/js/yuki-lines.js without retraining the brain
    import sys
    write_lines() if '--lines-only' in sys.argv else main()
