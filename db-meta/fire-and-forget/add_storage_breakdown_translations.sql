-- Fire-and-forget patch: legend labels for the AI model cache storage
-- breakdown bar (stacked segments by byte attribution).
--
-- Keys added (× 6 languages):
--   app.smart.regex.ai.cache.seg_cataloged      — models in the ai_models catalog
--   app.smart.regex.ai.cache.seg_orphaned       — cached models no longer in catalog
--   app.smart.regex.ai.cache.seg_other_cache    — Cache API entries not attributable to a model
--   app.smart.regex.ai.cache.seg_other_storage  — storage.estimate() usage outside the Cache API
--                                                 (IndexedDB, service workers, localStorage, …)
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.seg_cataloged', 'en-GB', 'Cataloged models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_cataloged', 'it-IT', 'Modelli censiti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_cataloged', 'fr-FR', 'Modèles répertoriés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_cataloged', 'es-ES', 'Modelos catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_cataloged', 'de-DE', 'Katalogisierte Modelle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_cataloged', 'pt-PT', 'Modelos catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'en-GB', 'Not in catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'it-IT', 'Non censiti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'fr-FR', 'Non répertoriés', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'es-ES', 'No catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'de-DE', 'Nicht im Katalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_orphaned', 'pt-PT', 'Não catalogados', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'en-GB', 'Other cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'it-IT', 'Altra cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'fr-FR', 'Autre cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'es-ES', 'Otra caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'de-DE', 'Anderer Cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_cache', 'pt-PT', 'Outra cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'en-GB', 'Other browser data', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'it-IT', 'Altri dati del browser', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'fr-FR', 'Autres données du navigateur', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'es-ES', 'Otros datos del navegador', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'de-DE', 'Andere Browserdaten', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.seg_other_storage', 'pt-PT', 'Outros dados do navegador', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
