-- Fire-and-forget: drop ai_cerebellum.sort_order.
--
-- The (assistant_key, model_id) pair is unique among non-deleted rows
-- (ai_cerebellum_assistant_model_uq), so there is at most ONE active tuning
-- per pair — the ordering field is a no-op legacy of the entity template.
-- Also soft-delete the orphaned field translation keys.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli del dal:ai_cerebellum:list

BEGIN;

ALTER TABLE ai_cerebellum DROP COLUMN IF EXISTS sort_order;

UPDATE system.translations
SET deleted_at = now(), deleted_by = 'devin'
WHERE key IN (
  'system.entities.ai_cerebellum.fields.sort_order',
  'app.smart.ai.cerebellum.fields.sort_order',
  -- 'none' pseudo-option removed: recommendation is optional, empty = NULL
  'system.entities.ai_cerebellum.recommendation.none'
)
  AND deleted_at IS NULL;

COMMIT;
