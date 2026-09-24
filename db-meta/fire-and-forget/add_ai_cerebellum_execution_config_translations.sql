-- Fire-and-forget: translations for the execution_config section in the AI
-- cerebellum create/update sheet (kv_cache_reuse, sliding_window,
-- intent_detection, max_history_turns) exposed via `system.entities.
-- ai_cerebellum.fields.*`.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.execution_config', 'en-GB', 'Execution', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.execution_config', 'it-IT', 'Esecuzione', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.execution_config', 'fr-FR', 'Exécution', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.execution_config', 'es-ES', 'Ejecución', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.execution_config', 'de-DE', 'Ausführung', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.execution_config', 'pt-PT', 'Execução', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'en-GB', 'KV Cache Reuse', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'it-IT', 'Riutilizzo KV Cache', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'fr-FR', 'Réutilisation KV Cache', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'es-ES', 'Reutilización KV Cache', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'de-DE', 'KV-Cache-Wiederverwendung', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.kv_cache_reuse', 'pt-PT', 'Reutilização KV Cache', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'en-GB', 'Sliding Window', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'it-IT', 'Finestra Scorrevole', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'fr-FR', 'Fenêtre Glissante', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'es-ES', 'Ventana Deslizante', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'de-DE', 'Sliding Window', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.sliding_window', 'pt-PT', 'Janela Deslizante', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'en-GB', 'Intent Detection', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'it-IT', 'Rilevamento Intento', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'fr-FR', 'Détection d''Intent', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'es-ES', 'Detección de Intención', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'de-DE', 'Absichtserkennung', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.intent_detection', 'pt-PT', 'Detecção de Intenção', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'en-GB', 'Max History Turns', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'it-IT', 'Turni Cronologia Max', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'fr-FR', 'Tours d''Historique Max', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'es-ES', 'Turnos de Historial Máx', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'de-DE', 'Max. Verlaufsschritte', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.max_history_turns', 'pt-PT', 'Máx. Turnos de Histórico', now(), 'devin', now(), 'devin', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
