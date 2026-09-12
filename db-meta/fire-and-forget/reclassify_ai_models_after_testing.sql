-- Reclassify AI models based on Smart Regex regression test results
-- Power levels and compatibility updated after 5-turn multi-model testing
-- Default model changed to Qwen2.5 Coder 3B (best balance of precision and speed)

-- Power level updates for compatible models
UPDATE ai_models SET power_level=3, updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Qwen3.5 2B' AND deleted_at IS NULL;
UPDATE ai_models SET power_level=1, updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Qwen2.5 Coder 1.5B' AND deleted_at IS NULL;
UPDATE ai_models SET power_level=1, updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Qwen2.5 1.5B' AND deleted_at IS NULL;
UPDATE ai_models SET power_level=1, updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Qwen3 1.7B' AND deleted_at IS NULL;

-- Mark poorly performing models as not compatible
UPDATE ai_models SET compatibility_status='NOT_COMPATIBLE', updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Llama 3.2 3B' AND deleted_at IS NULL;
UPDATE ai_models SET compatibility_status='NOT_COMPATIBLE', updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Phi-4 Mini' AND deleted_at IS NULL;
UPDATE ai_models SET compatibility_status='NOT_COMPATIBLE', updated_at=NOW(), updated_by='system', version=version+1 WHERE name='Hermes 3 Llama 3.2 3B' AND deleted_at IS NULL;
