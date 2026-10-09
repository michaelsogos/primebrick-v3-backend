-- Agent-loop decode budget: 512 tokens was enough to truncate reasoning
-- mid-thought before the tool_call JSON (observed: T2 round-0 emitted
-- prose with no parseable call). 768 keeps the loop bounded while leaving
-- headroom for reasoning + the tool_call payload.
UPDATE "public"."ai_cerebellum"
SET execution_config = jsonb_set(execution_config, '{agent_max_tokens}', '768'),
    updated_at = now(),
    version = version + 1
WHERE assistant_key = 'guide'
  AND deleted_at IS NULL
  AND COALESCE((execution_config->>'agent_max_tokens')::float, 512) < 768;
