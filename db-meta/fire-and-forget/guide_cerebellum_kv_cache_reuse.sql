-- Enable KV cache reuse for the guide assistant. The worker now gates reuse
-- on a strict append-only stem comparison (ai-worker.ts stemOf/extends_last):
-- agent loop rounds share the same prefix and skip re-prefill; stage changes
-- (S3 answer, S4 actions, new question) diverge the stem and get a fresh
-- cache, so the old cross-contract token-soup bug cannot recur. Without this,
-- every generation re-prefills 1-2.5k tokens — the dominant latency cost.
UPDATE "public"."ai_cerebellum"
SET execution_config = jsonb_set(execution_config, '{kv_cache_reuse}', 'true'),
    updated_at = now(),
    version = version + 1
WHERE assistant_key = 'guide'
  AND deleted_at IS NULL
  AND COALESCE(execution_config->>'kv_cache_reuse', 'false') <> 'true';
