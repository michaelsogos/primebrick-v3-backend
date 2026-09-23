-- Fire-and-forget patch: label of the "New cerebellum" CTA inside the
-- cerebellum assistant dropdown in the /system/settings/ai models toolbar.
--
-- Key added (× 6 languages):
--   system.entities.ai_cerebellum.create
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_cerebellum.create', 'en-GB', 'New cerebellum', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.create', 'it-IT', 'Nuovo cervelletto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.create', 'fr-FR', 'Nouveau cervelet', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.create', 'es-ES', 'Nuevo cerebelo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.create', 'de-DE', 'Neues Cerebellum', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_cerebellum.create', 'pt-PT', 'Novo cerebelo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
