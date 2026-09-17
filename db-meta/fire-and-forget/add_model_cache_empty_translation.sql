-- Fire-and-forget patch: empty-state translation for the AI model cache
-- section (shown when no censused or orphaned models are in browser cache).
--
-- Key added (× 6 languages):
--   app.smart.regex.ai.cache.empty
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.empty', 'en-GB', 'No models in cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.empty', 'it-IT', 'Nessun modello in cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.empty', 'fr-FR', 'Aucun modèle en cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.empty', 'es-ES', 'No hay modelos en caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.empty', 'de-DE', 'Keine Modelle im Cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.empty', 'pt-PT', 'Nenhum modelo em cache', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
