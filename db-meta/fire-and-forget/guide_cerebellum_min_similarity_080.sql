-- Raise the guide retrieval floor again: e5 off-topic queries can reach
-- ~0.79 similarity (probe: "cake recipe" → 0.792 on form-page-layout.mdx),
-- so 0.75 leaks unrelated chunks and defeats the "no documentation"
-- fallback. Real guide hits observed at ≥0.82 — 0.80 keeps the margin.
UPDATE "public"."ai_cerebellum"
SET execution_config = jsonb_set(execution_config, '{min_similarity}', '0.80'),
    updated_at = now(),
    version = version + 1
WHERE assistant_key = 'guide'
  AND (execution_config->>'min_similarity')::float < 0.80;
