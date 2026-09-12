-- Disable models marked NOT_COMPATIBLE that are still enabled.
-- Llama 3.2 3B and Hermes 3 Llama 3.2 3B were left is_enabled=true
-- when reclassified to NOT_COMPATIBLE.
UPDATE ai_models
SET is_enabled = false,
    updated_at = NOW(),
    updated_by = 'system',
    version = version + 1
WHERE compatibility_status = 'NOT_COMPATIBLE'
  AND is_enabled = true
  AND deleted_at IS NULL;
