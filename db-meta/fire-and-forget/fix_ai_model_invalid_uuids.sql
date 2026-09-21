-- Fix RFC-invalid ai_models seed UUIDs. Legacy seeds used the pattern
-- `aNNNNNNN-0000-0000-0000-…` — version nibble '0' and variant nibble '0' —
-- which `z.string().uuid()` rejects, making every :uuid route
-- (update/delete/restore/audit/get) unreachable for those rows.
-- Rewrite sets version nibble → '4' (position 15) and variant nibble → '8'
-- (position 20). No FK references ai_models.uuid — a plain UPDATE is safe.
-- Idempotent: the WHERE matches only still-invalid uuids.

UPDATE ai_models
SET uuid = (
  substr(uuid::text, 1, 14) || '4' ||
  substr(uuid::text, 16, 4) ||
  '8' || substr(uuid::text, 21)
)::uuid
WHERE substr(uuid::text, 15, 1) NOT IN ('1','2','3','4','5')
   OR substr(uuid::text, 20, 1) NOT IN ('8','9','a','b');
