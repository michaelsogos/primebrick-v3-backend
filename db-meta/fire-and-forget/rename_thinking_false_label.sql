-- Update thinking.false label from "No Thinking" to "Thinking Disabled".
-- The flag enable_thinking=false means thinking is explicitly disabled
-- (runtime switch), not that the model lacks thinking capability.
-- All 6 languages updated.

UPDATE system.translations SET value='Thinking Disabled', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='en-GB' AND deleted_at IS NULL;

UPDATE system.translations SET value='Thinking Disabilitato', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='it-IT' AND deleted_at IS NULL;

UPDATE system.translations SET value='Thinking Désactivé', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='fr-FR' AND deleted_at IS NULL;

UPDATE system.translations SET value='Thinking Desactivado', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='es-ES' AND deleted_at IS NULL;

UPDATE system.translations SET value='Thinking Deaktiviert', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='de-DE' AND deleted_at IS NULL;

UPDATE system.translations SET value='Thinking Desativado', updated_at=NOW(), updated_by='system', version=version+1
WHERE key='system.entities.ai_model.thinking.false' AND language='pt-PT' AND deleted_at IS NULL;
