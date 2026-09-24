-- Fire-and-forget: action-verb labels for the execution_config switches in the
-- AI cerebellum create/update sheet. Switches read as "Enable X" (consistent
-- with the SwitchField standard), sliders keep their current labels.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

UPDATE system.translations SET value = 'Enable KV Cache', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Abilita KV Cache', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Activer le KV Cache', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Habilitar KV Cache', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'KV-Cache aktivieren', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Ativar KV Cache', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.kv_cache_reuse' AND language = 'pt-PT' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Enable Sliding Window', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Abilita Finestra Scorrevole', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Activer la Fenêtre Glissante', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Habilitar Ventana Deslizante', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Sliding Window aktivieren', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Ativar Janela Deslizante', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.sliding_window' AND language = 'pt-PT' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Enable Intent Detection', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Abilita Rilevamento Intento', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Activer la Détection d''Intent', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Habilitar Detección de Intención', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Absichtserkennung aktivieren', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Ativar Detecção de Intenção', updated_at = now(), updated_by = 'devin'
  WHERE key = 'system.entities.ai_cerebellum.fields.intent_detection' AND language = 'pt-PT' AND deleted_at IS NULL;

COMMIT;
