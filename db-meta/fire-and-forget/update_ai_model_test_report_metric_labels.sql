-- Fire-and-forget patch: translated labels for the test-report metric
-- tooltips (sheet + popover on /system/settings/ai).
--
-- Keys added (× 6 languages):
--   system.entities.ai_model.test_report.score    — aggregate score
--   system.entities.ai_model.test_report.quality  — mean quality score
-- Key updated (× 6 languages):
--   system.entities.ai_model.test_report.passed   — "passed" → "passed tests"
--
-- Reused existing keys: system.entities.ai_model.fields.speed,
--   system.entities.ai_model.speed.avg_response ("Mean response time")
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.test_report.score', 'en-GB', 'Score', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.score', 'it-IT', 'Punteggio', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.score', 'fr-FR', 'Score', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.score', 'es-ES', 'Puntuación', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.score', 'de-DE', 'Bewertung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.score', 'pt-PT', 'Pontuação', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'en-GB', 'Quality', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'it-IT', 'Qualità', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'fr-FR', 'Qualité', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'es-ES', 'Calidad', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'de-DE', 'Qualität', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.quality', 'pt-PT', 'Qualidade', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

UPDATE system.translations SET value = 'Passed tests', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Test superati', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Tests réussis', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Pruebas superadas', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Bestandene Tests', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Testes aprovados', updated_at = now()
WHERE key = 'system.entities.ai_model.test_report.passed' AND language = 'pt-PT' AND deleted_at IS NULL;

COMMIT;
