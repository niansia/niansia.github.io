"""QLoRA fine-tune of Qwen2.5-1.5B-Instruct into Yuki, then merge the adapter for export.

Run: python tools/llm/train_qlora.py            (train + merge)
     python tools/llm/train_qlora.py --merge    (merge only)
Base model is loaded in 4-bit NF4; LoRA (r=16) trains on every linear projection and the
loss covers only Yuki's replies (prompt/completion format). An RTX 4060 Laptop (8 GB) is enough.
"""
from __future__ import annotations

import sys
from pathlib import Path

import torch
from datasets import load_dataset
from peft import LoraConfig, PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

WORK = Path(r'D:\yuki-llm')
BASE = WORK / 'base-qwen2.5-1.5b'
ADAPTER = WORK / 'adapter'
MERGED = WORK / 'merged'


def train() -> None:
    tok = AutoTokenizer.from_pretrained(BASE)
    model = AutoModelForCausalLM.from_pretrained(
        BASE, dtype=torch.bfloat16, device_map={'': 0},
        quantization_config=BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type='nf4', bnb_4bit_use_double_quant=True,
                                               bnb_4bit_compute_dtype=torch.bfloat16))
    data = load_dataset('json', data_files={'train': str(WORK / 'data/train.jsonl'), 'valid': str(WORK / 'data/valid.jsonl')})
    config = SFTConfig(
        output_dir=str(WORK / 'runs'), num_train_epochs=2, per_device_train_batch_size=1, gradient_accumulation_steps=8,
        learning_rate=2e-4, lr_scheduler_type='cosine', warmup_ratio=.05, bf16=True, gradient_checkpointing=True,
        optim='paged_adamw_8bit', max_length=2600, completion_only_loss=True, logging_steps=10,
        eval_strategy='steps', eval_steps=100, per_device_eval_batch_size=1, save_strategy='no', report_to='none')
    lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=.05, task_type='CAUSAL_LM',
                      target_modules=['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'])
    trainer = SFTTrainer(model=model, args=config, train_dataset=data['train'], eval_dataset=data['valid'],
                         processing_class=tok, peft_config=lora)
    trainer.train()
    print('final eval', trainer.evaluate())
    trainer.model.save_pretrained(ADAPTER)
    tok.save_pretrained(ADAPTER)


def merge() -> None:
    tok = AutoTokenizer.from_pretrained(BASE)
    model = AutoModelForCausalLM.from_pretrained(BASE, dtype=torch.float16)
    model = PeftModel.from_pretrained(model, ADAPTER).merge_and_unload()
    model.save_pretrained(MERGED, safe_serialization=True)
    tok.save_pretrained(MERGED)
    print('merged ->', MERGED)


if __name__ == '__main__':
    if '--merge' not in sys.argv:
        train()
    merge()
