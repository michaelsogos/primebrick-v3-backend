-- Fire-and-forget patch: confirmation dialog translations for AI model
-- cache deletion (single model and bulk).
--
-- Keys added (× 6 languages):
--   app.smart.regex.ai.cache.delete_confirm_single
--   app.smart.regex.ai.cache.delete_confirm_multi
--   app.smart.regex.ai.cache.delete_confirm_title
--   app.smart.regex.ai.cache.delete_detail_model
--   app.smart.regex.ai.cache.delete_detail_size
--
-- Parameters: {model} user-friendly display name, {size} preformatted freed
-- bytes, {count} number of models being deleted (multi).
-- The detail keys are label-only (rendered before the raw id / size value).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.delete_confirm_single', 'en-GB', 'You are about to delete {model}, do you want to continue?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_single', 'it-IT', 'Stai per cancellare {model}, vuoi continuare?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_single', 'fr-FR', 'Vous allez supprimer {model}, voulez-vous continuer ?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_single', 'es-ES', 'Estás a punto de eliminar {model}, ¿quieres continuar?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_single', 'de-DE', 'Du bist dabei, {model} zu löschen. Möchtest du fortfahren?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_single', 'pt-PT', 'Estás prestes a eliminar {model}, queres continuar?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'en-GB', 'You are about to delete {count} models freeing {size} of memory, do you want to continue?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'it-IT', 'Stai per cancellare {count} modelli liberando {size} di memoria, vuoi continuare?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'fr-FR', 'Vous allez supprimer {count} modèles, libérant {size} de mémoire, voulez-vous continuer ?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'es-ES', 'Estás a punto de eliminar {count} modelos liberando {size} de memoria, ¿quieres continuar?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'de-DE', 'Du bist dabei, {count} Modelle zu löschen und {size} Speicher freizugeben. Möchtest du fortfahren?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_multi', 'pt-PT', 'Estás prestes a eliminar {count} modelos, libertando {size} de memória, queres continuar?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'en-GB', 'Delete from cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'it-IT', 'Elimina dalla cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'fr-FR', 'Supprimer du cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'es-ES', 'Eliminar de la caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'de-DE', 'Aus Cache löschen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_confirm_title', 'pt-PT', 'Eliminar da cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'en-GB', 'Model:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'it-IT', 'Modello:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'fr-FR', 'Modèle :', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'es-ES', 'Modelo:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'de-DE', 'Modell:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_model', 'pt-PT', 'Modelo:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'en-GB', 'Size:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'it-IT', 'Dimensione:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'fr-FR', 'Taille :', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'es-ES', 'Tamaño:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'de-DE', 'Größe:', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_detail_size', 'pt-PT', 'Tamanho:', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
