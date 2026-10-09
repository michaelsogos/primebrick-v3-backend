-- The 512-token generation budget is consumed by the model's reasoning
-- preamble on complex questions (observed: T3 RBAC answer truncated
-- mid-word at 55 chars after ~450 tokens of reasoning). Doubling the
-- decode budget is cheap — the WebGPU limit is on the PROMPT (prefill),
-- not on generated tokens.
UPDATE "public"."ai_cerebellum"
SET max_tokens = 1024,
    updated_at = now(),
    version = version + 1
WHERE assistant_key = 'guide'
  AND deleted_at IS NULL
  AND max_tokens < 1024;
