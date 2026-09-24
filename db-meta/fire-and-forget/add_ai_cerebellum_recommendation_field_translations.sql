-- Fire-and-forget: translations for the editable `recommendation` field in
-- the AI cerebellum create/update sheet (label + "none" option). The
-- RECOMMENDED / NOT_RECOMMENDED option labels reuse the existing
-- app.smart.ai.cerebellum.{recommended,not_recommended} keys.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.fields.recommendation', 'en-GB', 'Recommendation', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.recommendation', 'it-IT', 'Raccomandazione', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.recommendation', 'fr-FR', 'Recommandation', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.recommendation', 'es-ES', 'Recomendación', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.recommendation', 'de-DE', 'Empfehlung', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.fields.recommendation', 'pt-PT', 'Recomendação', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'en-GB', 'None', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'it-IT', 'Nessuna', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'fr-FR', 'Aucune', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'es-ES', 'Ninguna', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'de-DE', 'Keine', now(), 'devin', now(), 'devin', 1),
  ('system.entities.ai_cerebellum.recommendation.none', 'pt-PT', 'Nenhuma', now(), 'devin', now(), 'devin', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
