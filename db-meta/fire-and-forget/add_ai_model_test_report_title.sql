-- Fire-and-forget patch: title of the per-turn test report section inside
-- the AI model test-scores popover (/system/settings/ai).
--
-- Key added (× 6 languages):
--   system.entities.ai_model.test_report.title
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.test_report.title', 'en-GB', 'Test report', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.title', 'it-IT', 'Report del test', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.title', 'fr-FR', 'Rapport de test', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.title', 'es-ES', 'Informe de prueba', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.title', 'de-DE', 'Testbericht', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.test_report.title', 'pt-PT', 'Relatório de teste', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
