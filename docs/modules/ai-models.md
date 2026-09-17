# AI Models module

Browser-local LLM registry for Smart components (SmartRegexInput). Models run
entirely in the browser via WebGPU — no backend inference.

> **Source code:** [`src/modules/ai-models/`](../../src/modules/ai-models/)

## Overview

`ai_models` is the single registry for every model variant. One row per
`model_id` + dtype (`onnx-community/Qwen3-4B-ONNX#fp16`). The FE Smart Regex
worker selects a row and builds its runtime path from `execution_config`.

Engines (`engine_type`):

- `onnx` / `transformersjs` — current engine (Transformers.js + ONNX Runtime WebGPU)
- `webllm` — legacy engine, rows are soft-deleted (`deleted_at`) but keep their
  original `compatibility_status` and `test_scores` for historicity

## Scoring fields

| Field | Type | Meaning |
|-------|------|---------|
| `power_level` | int 1-5 | Compute/size class — drives the 5-bar UI. NOT part of quality scoring. |
| `rank` | numeric(3,1) | Quality score 0.0-5.0 — sortable, shown in the model list |
| `test_scores` | jsonb | Full per-turn test evidence (outputs, metrics, method) |
| `compatibility_status` | varchar | `UNTESTED` / `COMPATIBLE` / `NOT_COMPATIBLE` |
| `execution_config` | jsonb | Runtime flags consumed by the FE worker |

## Scoring formulas (current — refined + speed)

Per-turn scores use this convention: **5 = correct, 2 = partially valid
(regex compiles but semantically wrong), 1 = fail** (invalid regex, garbage,
prose, crash, timeout, no response).

Every turn MUST also record its real response time in **seconds**
(`response_s = generation_time_ms / 1000` from the worker `measure` event;
a generation timeout counts as 90 s). Speed is scored per turn:

```
speed_score per turn:
  response_s <= 3   -> 5
  response_s <= 5   -> 4
  response_s <= 7   -> 3
  response_s <= 9   -> 2
  response_s <= 10  -> 1
  >10s / timeout / error -> 0
```

```
quality      = mean(all_runs) * 0.6 + (success_count / total_turns) * 5 * 0.4
               where success = per-turn score >= 4
speed        = mean(speed_scores)                      # 0..5
score        = quality * 0.8 + speed * 0.2
rank         = round(score, 1 decimal)
```

`rank` IS the final score — power_level is **not** part of it. Quality and
speed remain visible as diagnostic components of the rank.

### Speed gate (hard compatibility rule)

If **>= 2 of 5 turns** hit `generation_timeout_90s` (or the model cannot
complete a turn at all), the model is `NOT_COMPATIBLE` regardless of quality —
a regex assistant that needs >90 s per turn is unusable. The recorded `rank`
still reflects measured quality + speed.

### Worked example

Runs `[5,5,4,4,5,5,5,5]` (8 turns, all ≥4), response times all ≤2 s:
`quality = 4.75*0.6 + 5*0.4 = 4.85`, `speed = 5`,
`score = 4.85*0.8 + 5*0.2 = 4.88 → rank 4.9`.

Runs `[5,1,1,1,5,1,1,1]` (2 successes / 8), avg speed score 3:
`quality = 2.0*0.6 + (2/8)*5*0.4 = 1.7`,
`score = 1.7*0.8 + 3*0.2 = 1.96 → rank 2.0`.

Slow-but-correct `[5,5,5,5,5]` with response_s `[4,32,90,90,90]`
(speed scores `[4,0,0,0,0]` → speed = 0.8):
`quality = 5.0`, `score = 5*0.8 + 0.8*0.2 = 4.16 → rank 4.2` —
and `NOT_COMPATIBLE` via the speed gate (3 timeouts).

### Deprecated formulas (do not use)

The original migration used a composite rank:

```
rank = round((reliability_proxy * 0.7 + power_level * 0.3) * 10) / 10   -- DEPRECATED
```

It was superseded because mixing compute cost into the quality rank made the
column ambiguous. If old rows show a composite-looking rank, recompute with the
refined formula.

## Test protocols (`test_scores` keys)

| Key | Protocol | Path |
|-----|----------|------|
| `e2e_5turn_s1_fixed_v2` | 5-turn incremental regex, KV-cache path | `kv_cache_reuse=true` |
| `e2e_5turn_s1_fixed_v2_retest` | Same protocol, repeated run (determinism check) | `kv_cache_reuse=true` |
| `e2e_5turn` | Same 5 turns, no-cache baseline (S2) | `kv_cache_reuse=false` |
| `e2e_5turn_s2_poll6s_x10` | 5-turn incremental regex, bounded polling | `kv_cache_reuse` per `execution_config`; each poll ≤6 s, max 10 polls (≈60 s) per turn before marking a generation timeout |
| `regex_test_score` | Legacy WebLLM 2-run × 4-turn weighted format | engine `webllm` |

**Effective score for rank**: the score of the *active* path —
`e2e_5turn_s1_fixed_v2` (or its retest) when `execution_config.kv_cache_reuse`
is `true`, otherwise `e2e_5turn`.

5-turn test prompts (S1 v2 / S2):

1. `solo lettere e numeri` → `^[a-zA-Z0-9]+$`
2. `aggiungiamo anche il punto e la virgola` → `^[a-zA-Z0-9.,]+$`
3. `aggiungiamo underscore e trattino` → `^[a-zA-Z0-9.,_-]+$`
4. `rimuoviamo il punto` → `^[a-zA-Z0-9_-]+$`
5. `solo lettere minuscole da 3 a 5 caratteri` → `^[a-z]{3,5}$`

### Generation tuning rule (IMPORTANT)

If a turn takes an absurd amount of time (e.g. `generation_timeout_90s` or
response_s well above ~30 s while the model is actually producing tokens),
**interrupt the test, retune generation parameters, and rerun the full 5-turn
test**. The tuned run is the authoritative one.

For verbose models (Phi family, models that keep generating prose after the
JSON), the standard retune is:

```
temperature = 0.2
max_tokens  = 256
```

`max_tokens=256` is enough for any regex answer and forces the model to stop
after the JSON instead of rambling into the timeout; `temperature=0.2` reduces
multi-option drift. Empirically verified on `Phi-3.5-mini-instruct-ONNX-GQA`
(defaults `temp=0.7, max_tokens=1024` → 3/5 timeouts; tuned `0.2/256` → 0/5
timeouts, ~3-4 s per turn). Record the tuned params in
`test_scores.generation_config` and update the model row's `temperature` /
`max_tokens` columns.

`test_scores` JSONB shape (S1 v2 / S2):

```json
{
  "e2e_5turn_s1_fixed_v2": {
    "t1": { "pass": true, "expected": "^[a-zA-Z0-9]+$", "response": "...",
            "response_s": 4.2 },
    "...": {},
    "score": "4/5",
    "tested_at": "2026-09-15T...",
    "avg_response_s": 12.4,
    "speed_score": 2.4,
    "kv_hit_ratio": [0, 91.9, 93.2, 93.7, 95.1]
  }
}
```

**Operational rule:** every E2E test MUST persist `test_scores` — including
per-turn `response_s` — and recompute `rank` with the speed-aware formula in
the same transaction.
Harness errors (`outcome: "harness_error"`) are NOT quality scores — they only
record infrastructure failures.

## `execution_config` keys

```json
{
  "kv_cache_reuse": true,     // pass DynamicCache as past_key_values to generate()
  "sliding_window": true,     // bound conversation history
  "max_history_turns": 6,     // sliding-window size
  "intent_detection": true    // modify-vs-new-regex intent pre-check
}
```

- `kv_cache_reuse=false`: the worker never creates `DynamicCache` and never
  passes `past_key_values` — required for models whose ONNX export crashes on
  KV reuse (Expand/Mul shape mismatch, Mamba `past_conv`/`past_ssm`).
- `sliding_window` is active for all models; dropping messages invalidates the
  KV cache automatically.

## `power_level` conventions

Empirical mapping (params × quantization):

| Power | Class |
|-------|-------|
| 1 | ≤1B quantized |
| 2 | 1.5-2B quantized |
| 3 | ~3B quantized |
| 4 | ~3.8-4B quantized, or ~3B unquantized (fp16) |
| 5 | ≥4B unquantized (fp16) |

## Compatibility lifecycle

`UNTESTED` → E2E test → `COMPATIBLE` or `NOT_COMPATIBLE` (+ `is_enabled=false`).
A model is NOT_COMPATIBLE for runtime failures (load timeout, ONNX crash,
thinking loop, speed gate) OR unusable quality (persistent
garbage/prose/0-score).
Logically deleted rows (e.g. retired `webllm` engine) keep their
`compatibility_status` untouched — deletion is `deleted_at`, never a status
overwrite.

### Known error signatures (under investigation)

| Signature | Where seen | Stage | Status |
|-----------|-----------|-------|--------|
| `memory access out of bounds` | `Llama-3.2-3B-Instruct-ONNX#q4` | VRAM/session init, after successful sharded download | Deterministic (3×, incl. after fresh page reload — not VRAM pressure). If it recurs on other models, investigate ORT Web session creation on sharded q4 exports. |
| `RangeError: Array buffer allocation failed` | Qwen3-1.7B fp16/q4, Coder-1.5B fp16, Qwen2.5-1.5B fp16, Coder-3B q8/bnb4, Llama-3B bnb4, Phi-4-GQA fp16, Phi-3.5-mini-GQA fp16 | `readResponse`/`loadResourceFile` — single-file `model_*.onnx_data` >~2GB | Systemic browser ArrayBuffer limit; sharded exports are unaffected. Phi-3.5-GQA fp16 marked NOT_COMPATIBLE without download — its `model_fp16.onnx_data` is a single 7.67 GB file (deterministic). |
| `std::bad_alloc` (session) | Qwen3-1.7B q4f16, Coder-1.5B q4, Qwen2.5-1.5B q4, Coder-3B q4, Llama-1B bnb4, EXAONE-3.5-2.4B q4f16 | ORT session creation | Systemic on single-file `model_q4.onnx` (inline weights), bnb4 exports, and some q4f16 exports. |
| `ERROR_CODE 6 — external data could not be resolved` | Phi-4-mini web q4f16, Phi-4-mini-GQA q4f16 | Model load (external data shard `model_*.onnx_data_1`) | Whole Phi-4 family broken: ORT Web cannot resolve multi-shard external-data exports. |
| `generation_timeout_90s` (0 tokens) | Qwen3.5 2B/4B q4f16 | First generation | Hybrid architecture too slow on WebGPU. |
| Expand/Mul shape mismatch | Coder-3B, Phi-3.5 web (non-GQA) | T2 with `past_key_values` | Export bug — fixed by `kv_cache_reuse=false`; GQA export unaffected. |
| Prose instead of JSON | DeepSeek-Coder-1.3B q4f16 | T1-T2 generation | Model ignores the JSON instruction format — English prose/code output. |
| Repeated stale answer | SmolLM3-3B q4f16 (`^\W+` ×5), Granite-1.5B q4f16 (`^[a-zA-Z0-9]+$` ×5) | T2-T5 generation | Model answers T1 then repeats the same regex verbatim — no multi-turn comprehension. |
| Hallucinated character classes / degenerate escapes | granite-3.0-2b-instruct q4f16 | T2-T5 generation | Emits parseable regex but ignores edit instructions: adds unrequested chars (`\-`, `+`, `\)`), then degenerates into `\_\_\_`. Same failure class at temp 0.7 (prose loop), 0.2 and 0 — instruction-following limit, not sampling. All 3 dtypes NOT_COMPATIBLE. |
| Prose instead of JSON (350M) | granite-4.0-350m-ONNX-web q4f16 | T1 generation | Answers in natural language — capacity limit. fp16/q4 marked NOT_COMPATIBLE without download. |
| Wrong/stale regex and malformed choices | granite-4.0-h-350m-ONNX q4f16/q4/fp16 | Full 5-turn E2E at temperature 0.7 and 0.2 | All dtypes load, but none completes a successful turn. q4/q4f16 repeat `^\w+$`, misuse regex flags and emit malformed multi-choice JSON; fp16 loses context and emits an empty patterns array. Final ranks: q4f16 1.0, q4 1.0, fp16 1.4. All NOT_COMPATIBLE. |
| Thinking-model overhead + unstable JSON | DeepSeek-R1-Distill-Qwen-1.5B q4f16 | T1-T3 generation | R1 `<think>` reasoning burns 370-650 tokens/turn (31-58 s, unusable latency); leaks thinking into output, hallucinates requirements (ampersand), malformed JSON (duplicate keys) at temp 0.2, valid-but-wrong regex at best. All 3 dtypes NOT_COMPATIBLE — thinking architecture, not quantization. |
| Degenerate multilingual prose | deepseek-coder-1.3b-instruct-ONNX q4f16 / q4 | All turns | q4f16 emits word-salad (en/zh/el mixed) hitting the token cap every turn; q4 produces verbose clarification requests with embedded-but-unusable regexes. fp16 fails at load (`ArrayBuffer`, single 2.69 GB data file). All 3 dtypes NOT_COMPATIBLE. |
| Wrong charsets with parseable JSON | Phi-3-mini-4k-instruct-ONNX q4f16 / q4 | T2-T5 generation | T1 exact, then spurious `'` in the charset (T2-T4), comma lost (T3), dot not removed (T4), verbose/malformed regex on T5 (38-41 s). KV reuse itself is healthy (hit 0.92-0.96) — pure instruction-following failure. fp16 worse: verbose prose at the 60 s bound on T2-T3. All 3 dtypes NOT_COMPATIBLE. |
| Repeated `!!!` tokens | granite-4.0-1b-ONNX-web q4f16 / fp16 | All turns | Export artifact: every turn emits only exclamation marks (32 tokens, ~25 s). Per-dtype export corruption, not a model defect. The `q4` dtype generates clean JSON but with deterministic charset drift (`*` vs `+`, spurious `;` T2, comma lost T3) — re-scored strict on 2026-09-16 → NOT_COMPATIBLE (rank 2.9); q4f16/fp16 NOT_COMPATIBLE. |
| Empty generation (0 tokens after full prefill) | NVIDIA-Nemotron-3-Nano-4B q4f16 / fp16 | All turns | Loads fine (sharded exports), prefills the 621-810-token prompt in 25-33 s, then emits EOS immediately — 0 tokens, empty `stream_complete`, `tokens_generated=0`. Chat template ends with forced empty `<think></think>`; these two dtypes apparently pick EOS right after it. q4 (the only working dtype) still leaks reasoning prose + `</think>` before a correct JSON on every turn (5/5 regexes but protocol violation + 4B no-KV latency) → all 3 NOT_COMPATIBLE. |
| Wrong JSON schema + prompt echo | Llama-3.2-1B-Instruct-ONNX q4f16 / q4 | All turns | Emits `[{"patterns":["regex1","regex2"]}]` instead of `{"patterns":[{"pattern","flags"}]}`, wrong charsets from T2 (missing comma, hallucinated `!`), and echoes the conversation back (`user\nCurrent regex:...`) on T4-T5. Deterministic — q4 output identical to q4f16. Fast (1-4 s/turn, KV reuse healthy 92-95%) but unusable output. fp16 uses the right schema but runaway-generates 5+ JSON objects to the 257-token cap on every turn (13-15 s); T1-T2 first object correct, T3-T5 wrong → all 3 NOT_COMPATIBLE. |
| Corrupted charset range | granite-4.0-h-micro-ONNX q4f16 / q4 / fp16 | T2-T3 (T4 on q4f16/q4) | T1 exact, then emits broken ranges like `[a-za-A-Z0-9.p,v]` (duplicated `a-za-`, stray `p,v`, missing commas). Deterministic across q4f16/q4 (identical outputs); fp16 recovers on T4-T5 (`^[a-zA-Z0-9_-]+$`, `^(?:[a-z]){3,5}$`). 2-3/5 max, ~6-8 s/turn at 2.5-3.8 t/s (MoE-hybrid, no KV reuse) → all 3 NOT_COMPATIBLE. |
| Prose leak + spurious charset chars | Phi-3.5-mini-instruct-ONNX-GQA q4 / Phi-3.5-mini-instruct-onnx-web q4f16 | T2-T5 generation | T1 exact, then every turn appends verbose English prose after the JSON (protocol violation) and T2 introduces a spurious `;` carried forward by later turns. q4 also fails T4 (point kept + stray space). web q4f16 has no KV reuse (kv=0) and runs 18-52 s/turn. Both NOT_COMPATIBLE — the web retest overturns the earlier COMPATIBLE verdict (same protocol, temp 0). |

### q8 policy

`#q8` (int8/uint8) variants are **NOT_COMPATIBLE by definition** — a product
decision independent of empirical results. All 11 q8 rows are soft-deleted and
marked `NOT_COMPATIBLE` with a `q8_policy` marker in `test_scores`. Do not
re-enable or re-test q8 variants.

## Cache metric keys (per turn, recorded in `test_scores`)

`generation_time_ms`, `tokens_generated`, `tokens_per_second`,
`first_token_latency_ms`, `kv_cache_hit_ratio`, `kv_cache_seq_length`,
`kv_cache_speedup`. Cache claims must be backed by real `kv_cache_hit_ratio`
measurements (healthy reuse ≈ 91-95% by turn 2+).

## KV-cache reuse matrix (empirical, 5-turn S1 v2)

Measured `kv_cache_hit_ratio` on turns 2-5 with `kv_cache_reuse=true`:

| Model | KV reuse | Hit ratio T2-T5 | Effect |
|-------|----------|-----------------|--------|
| Qwen3-4B fp16 / q4f16 | YES | 91.9-95.1% | T2-T5 drop to ~1.4-4.4 s |
| Llama-3.2-3B q4f16 / fp16 | YES | 91.3-94.6% | T5 as low as 0.78 s — fastest model |
| Llama-3.2-1B q4f16 / q4 / fp16 | YES | 91.6-97.4% | Reuse works on all dtypes — but output quality is unusable |
| Phi-3.5-mini-GQA q4f16 | YES | 92.1-95.5% | Works after generation tuning (retest 2026-09-16: 3/5, COMPATIBLE rank 3.2) |
| granite-4.0-micro-ONNX-web | YES | ~91-94.5% | Works |
| Qwen2.5-Coder-3B q4 / q4f16 | NO | 0% | Full prefill every turn (~890 tokens by T5); still fast — q4 prefill is cheap |
| Qwen2.5-Coder-1.5B q4f16 | NO | 0% | Same — ~3.8 s avg without reuse |
| Phi-3.5-mini-instruct-onnx-web | NO | 0% | Pathological: prompt grows unbounded → 18-52 s per turn (retest 2026-09-16); also leaks prose → NOT_COMPATIBLE |
| Phi-3.5-mini-GQA q4 | YES | 92.1-96.5% | Reuse healthy but prose leak + charset errors → NOT_COMPATIBLE |
| NVIDIA-Nemotron-3-Nano-4B all dtypes | NO | 0% | `kv_cache_reuse=false` — full 621-810-token prefill/turn ≈ 25-33 s on 4B |
| granite-4.0-h-micro-ONNX all dtypes | NO | 0% | `GraniteMoeHybridForCausalLM` — no KV reuse, ~6-8 s/turn |

KV reuse is the single biggest latency factor for multi-turn: a model with
reuse finishes T5 in ~1 s vs ~4-5 s without. Coder compensates with a cheap
prefill; Phi-3.5-web does not.

## ONNX vs WebLLM comparison (per family)

WebLLM rows are legacy (`deleted_at`, `regex_test_score` protocol: 2 runs ×
4 turns, quality only, **no response-time data**). ONNX rows use the current
speed-aware rank. Direct rank comparison is indicative, not exact.

| Family | ONNX (rank / avg resp / download) | WebLLM (rank / download) | Verdict |
|--------|-----------------------------------|--------------------------|---------|
| Qwen2.5-Coder-3B | **4.8** q4f16 5/5 / 4.3 s · **4.8** q4 5/5 / 3.3 s (retest 2026-09-17) · fp16 deterministic load failure (single 6.5 GB file) | 2.2 / 1.7 GB | **ONNX +2.6** — MLC missed `;` on T2-T4 in both runs |
| Qwen2.5-Coder-1.5B | **3.8** q4f16 / 3.1 s / 6.4 GB cached (retest 2026-09-16) · q4 `std::bad_alloc` reconfirmed · fp16 deterministic load failure (single 3.5 GB file) | 3.6 / 0.8 GB | **ONNX +0.2** — retest downgraded rank: T4 drops `-` with `.`, T5 non-canonical `^([a-z]{3,5})$`; MLC unstable (run2 dropped `;`) |
| Qwen3-4B | **4.8** fp16 / 4.6 s / 8.1 GB · 3.1 q4f16 / 2.0 s / 2.8 GB (retest 2026-09-16) | 4.5 / 2.2 GB | fp16 ONNX best quality; q4f16 downgraded (spurious `+` T3, stale `.` T4) |
| Qwen3.5-2B | 0.6 NOT_COMPATIBLE | **4.9** / 1.0 GB | **WebLLM +4.3** — ONNX export broken (`generation_timeout_90s`) |
| Qwen3.5-4B | 0.6 NOT_COMPATIBLE | 3.4 / 2.3 GB | WebLLM only — but run2 crashed after T2 |
| Llama-3.2-3B | **3.6** q4f16 3/5 / 1.26 s (retest 2026-09-17: T4 stale dot, T5 `[a-a]`) · q4 NOT_COMPATIBLE (WASM memory OOB) | 1.0 / 1.7 GB | **ONNX +2.6** |
| Phi-3.5-mini | 3.2 GQA q4f16 / 6.1 s · web q4f16 NOT_COMPATIBLE (prose leak, retest 2026-09-16) | 1.0 NOT_COMPATIBLE | Only GQA q4f16 stays COMPATIBLE |
| Qwen3-1.7B · Qwen2.5-1.5B · gemma-3-1b · SmolLM2 | 0.6-1.5, all poor | 0.9-1.7, all poor | unusable on both engines |

Takeaways:

- ONNX wins on every family that has a working export — all rank >4 models
  are ONNX. Top pick and current default (`ai_assistant_model`):
  `granite-4.0-micro-ONNX-web#q4f16` (5/5, rank 5.0, ~1.5 s avg, 2.3 GB,
  changed 2026-09-17 — replaces `Qwen2.5-Coder-3B#q4`).
- WebLLM only wins on Qwen3.5 (broken ONNX export) and showed run-to-run
  instability (crash after T2, dropped chars between runs) plus zero
  response-time/KV telemetry — which is why the engine was retired.
- ONNX q4f16 download is ~30-40% heavier than the equivalent MLC artifact;
  fp16 doubles it (8 GB for a 4B) but is the only quant that passed the
  "remove the dot" turn on Qwen3.

## Current 5/5 models (S1 v2, speed-aware)

`Qwen2.5-Coder-3B` **q4** and **q4f16**, `Qwen3-4B` **fp16** — all rank 4.8,
plus `granite-4.0-micro-ONNX-web` **q4f16** at rank **5.0** (5/5 exact,
1.1-2.0 s/turn, KV reuse 91-94.5% — first real test on 2026-09-16).
The discriminating turn is T4 ("rimuoviamo il punto"): only these pass
it; Llama-3.2, Qwen3-q4f16 and granite-4.0-1b q4 keep the stale `.` or
drift the character class.
