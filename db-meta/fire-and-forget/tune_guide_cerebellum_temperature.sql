-- Guide cerebellum tuning experiment: temperature → 0, max_tokens → 512.
-- A/B evidence: 0.7 degrades IT grammar + truncates; 0.2 clean but T3/T4
-- hit the 512 cap; 0.1 + 640 keeps a bit of fluency without runaway
-- verbosity; 0 gives identical-but-truncated phrasing. 0.3/1024 probes the
-- upper bound: does extra headroom + light sampling fix T4 vagueness?
-- Preflight stages (S0/S2) stay pinned to temp 0 via
-- execution_config-independent defaults (deterministic JSON stages).
-- Redis invalidation: `dal:ai_cerebellum:list` (verified empty at apply time).
BEGIN;

UPDATE ai_cerebellum
SET temperature = 0,
    max_tokens  = 512,
    updated_at  = now(),
    updated_by  = 'devin'
WHERE assistant_key = 'guide'
  AND model_id = 'onnx-community/Qwen2.5-Coder-3B-Instruct'
  AND dtype = 'q4f16'
  AND deleted_at IS NULL;

COMMIT;
