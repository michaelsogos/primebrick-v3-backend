-- Raise the guide assistant retrieval floor after the embedding model
-- switch (paraphrase-MiniLM 384d → multilingual-e5-large-instruct 1024d).
-- Probe evidence on the new index: real guide hits score ≥0.82, off-topic
-- queries cap at ~0.74 — 0.75 makes the "no documentation" fallback exact.
UPDATE "public"."ai_cerebellum"
SET execution_config = jsonb_set(execution_config, '{min_similarity}', '0.75'),
    updated_at = now(),
    version = version + 1
WHERE assistant_key = 'guide'
  AND (execution_config->>'min_similarity')::float < 0.75;
