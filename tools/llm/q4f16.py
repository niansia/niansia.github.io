"""MLC q4f16_1 group quantization in NumPy (group 32, int4, 8 values per uint32, fp16 scales).

Written because MLC's own converter segfaults on this machine. `verify()` checks the output
byte-for-byte against mlc-ai's official conversion of the same base model.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
from safetensors import safe_open

GROUP, MAX_INT, PER_WORD = 32, 7, 8


def quantize(w: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """w: (N, K) -> q_weight uint32 (N, K/8), q_scale float16 (N, K/32).

    Mirrors MLC exactly (verified byte-for-byte): everything in fp16, the scale is
    max|w| times fp16(1/7), and the +7 offset is added in fp16 *before* round-half-even.
    """
    n, k = w.shape
    g = w.astype(np.float16).reshape(n, k // GROUP, GROUP)
    scale = (np.abs(g).max(axis=-1, keepdims=True) * np.float16(1 / MAX_INT)).astype(np.float16)
    with np.errstate(divide='ignore', invalid='ignore'):
        x = np.nan_to_num((g / scale).astype(np.float16))
    y = (x + np.float16(MAX_INT)).astype(np.float16)
    q = np.clip(np.round(y), 0, 2 * MAX_INT).astype(np.uint32).reshape(n, k // PER_WORD, PER_WORD)
    packed = np.zeros((n, k // PER_WORD), dtype=np.uint32)
    for i in range(PER_WORD):
        packed |= q[:, :, i] << np.uint32(4 * i)
    return packed, scale.reshape(n, k // GROUP)


def convert(src: Path, out: Path, layout: Path) -> None:
    """Write MLC shards for `src` using the official shard layout (same names, shapes and offsets)."""
    import hashlib
    cache = json.loads(layout.read_text())
    hf = hf_tensors(src)
    params = {}
    for key, value in hf.items():
        if value.ndim == 2:
            params[key + '.q_weight'], params[key + '.q_scale'] = quantize(value)
        else:
            params[key] = value.astype(np.float16)
    out.mkdir(parents=True, exist_ok=True)
    for shard in cache['records']:
        buf = bytearray(shard['nbytes'])
        for rec in shard['records']:
            arr = np.ascontiguousarray(params.pop(rec['name']))
            assert list(arr.shape) == rec['shape'] and arr.dtype == np.dtype(rec['dtype']), rec['name']
            buf[rec['byteOffset']:rec['byteOffset'] + rec['nbytes']] = arr.tobytes()
        (out / shard['dataPath']).write_bytes(buf)
        shard['md5sum'] = hashlib.md5(buf).hexdigest()
    assert not params, f'unplaced tensors: {list(params)[:5]}'
    for name in ('tensor-cache.json', 'ndarray-cache.json'):
        (out / name).write_text(json.dumps(cache), encoding='utf-8')


def hf_tensors(path: Path):
    """Yield (mlc_name, array) in MLC naming for Qwen2 (fused qkv and gate_up, tied embeddings)."""
    index = path / 'model.safetensors.index.json'
    files = sorted(set(json.loads(index.read_text())['weight_map'].values())) if index.exists() else ['model.safetensors']
    handles = [safe_open(path / f, 'pt') for f in files]
    get = lambda name: next(h.get_tensor(name) for h in handles if name in h.keys()).to(torch.float32).numpy()
    config = json.loads((path / 'config.json').read_text())
    out = {'model.embed_tokens': get('model.embed_tokens.weight'), 'model.norm.weight': get('model.norm.weight')}
    for i in range(config['num_hidden_layers']):
        p = f'model.layers.{i}.'
        out[p + 'self_attn.c_attn'] = np.concatenate([get(p + f'self_attn.{x}_proj.weight') for x in 'qkv'])
        out[p + 'self_attn.c_attn.bias'] = np.concatenate([get(p + f'self_attn.{x}_proj.bias') for x in 'qkv'])
        out[p + 'self_attn.o_proj'] = get(p + 'self_attn.o_proj.weight')
        out[p + 'mlp.gate_up_proj'] = np.concatenate([get(p + 'mlp.gate_proj.weight'), get(p + 'mlp.up_proj.weight')])
        out[p + 'mlp.down_proj'] = get(p + 'mlp.down_proj.weight')
        out[p + 'input_layernorm.weight'] = get(p + 'input_layernorm.weight')
        out[p + 'post_attention_layernorm.weight'] = get(p + 'post_attention_layernorm.weight')
    return out


def official_tensor(folder: Path, cache: dict, name: str) -> np.ndarray | None:
    for shard in cache['records']:
        for rec in shard['records']:
            if rec['name'] == name:
                f = folder / shard['dataPath']
                if not f.exists():
                    return None
                raw = np.fromfile(f, dtype=np.uint8, count=rec['nbytes'], offset=rec['byteOffset'])
                return raw.view(rec['dtype']).reshape(rec['shape'])
    return None


def verify(base: Path, official: Path, out: Path) -> None:
    """Convert the untouched base model and compare whole shards with mlc-ai's official files."""
    convert(base, out, official / 'tensor-cache.json')
    for shard in sorted(official.glob('params_shard_*.bin')):
        same = (out / shard.name).read_bytes() == shard.read_bytes()
        print(shard.name, 'identical' if same else 'DIFFERENT')


if __name__ == '__main__':
    verify(Path(r'D:\yuki-llm\base-qwen2.5-1.5b'), Path(r'D:\yuki-llm\official'),
           Path(r'D:\yuki-llm\mlc\base-qwen2.5-1.5b-q4f16_1-MLC'))
