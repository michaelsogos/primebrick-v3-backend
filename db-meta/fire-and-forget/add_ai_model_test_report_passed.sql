-- Fire-and-forget patch: "passed turns" aggregate label shown next to the
-- aggregate scores inside the AI model test report sheet (/system/settings/ai).
--
-- Key added (× 6 languages):
--   system.entities.ai_model.test_report.passed
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.test_report.passed', 'en-GB', 'passed', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.passed', 'it-IT', 'superati', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.passed', 'fr-FR', 'réussis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.passed', 'es-ES', 'superados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.passed', 'de-DE', 'bestanden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.passed', 'pt-PT', 'aprovados', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
