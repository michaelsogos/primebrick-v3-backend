-- Fire-and-forget: 'inherit' label for SliderField (nullable range params).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.inherit', 'en-GB', 'inherit', now(), 'devin', now(), 'devin', 1),
  ('app.common.inherit', 'it-IT', 'eredita', now(), 'devin', now(), 'devin', 1),
  ('app.common.inherit', 'fr-FR', 'hérité', now(), 'devin', now(), 'devin', 1),
  ('app.common.inherit', 'es-ES', 'heredado', now(), 'devin', now(), 'devin', 1),
  ('app.common.inherit', 'de-DE', 'vererbt', now(), 'devin', now(), 'devin', 1),
  ('app.common.inherit', 'pt-PT', 'herdado', now(), 'devin', now(), 'devin', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
