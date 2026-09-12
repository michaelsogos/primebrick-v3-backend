-- Fire-and-forget patch: Add WebLLM model cache management translation keys
--
-- These keys cover the ModelCachePanel (popover in AI assistant) and
-- ModelCacheSection (settings page section) for browser model cache management.
--
-- Keys added (13 total, × 6 languages = 78 INSERTs):
--   app.smart.regex.ai.cache.title
--   app.smart.regex.ai.cache.cached
--   app.smart.regex.ai.cache.not_cached
--   app.smart.regex.ai.cache.size
--   app.smart.regex.ai.cache.delete
--   app.smart.regex.ai.cache.delete_all
--   app.smart.regex.ai.cache.storage_used
--   app.smart.regex.ai.cache.confirm_delete
--   app.smart.regex.ai.cache.confirm_delete_all
--   app.smart.regex.ai.cache.in_use
--   app.smart.regex.ai.cache.deleted
--   app.smart.regex.ai.cache.deleted_all
--   app.smart.regex.ai.cache.refresh
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

-- ─── app.smart.regex.ai.cache.title ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.title', 'en-GB', 'Model cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.title', 'it-IT', 'Cache modelli', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.title', 'fr-FR', 'Cache des modèles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.title', 'es-ES', 'Caché de modelos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.title', 'de-DE', 'Modell-Cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.title', 'pt-PT', 'Cache de modelos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.cached ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.cached', 'en-GB', 'Cached', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.cached', 'it-IT', 'In cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.cached', 'fr-FR', 'En cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.cached', 'es-ES', 'En caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.cached', 'de-DE', 'Im Cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.cached', 'pt-PT', 'Em cache', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.not_cached ────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.not_cached', 'en-GB', 'Not cached', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.not_cached', 'it-IT', 'Non in cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.not_cached', 'fr-FR', 'Pas en cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.not_cached', 'es-ES', 'No en caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.not_cached', 'de-DE', 'Nicht im Cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.not_cached', 'pt-PT', 'Não em cache', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.size ──────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.size', 'en-GB', 'Size', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.size', 'it-IT', 'Dimensione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.size', 'fr-FR', 'Taille', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.size', 'es-ES', 'Tamaño', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.size', 'de-DE', 'Größe', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.size', 'pt-PT', 'Tamanho', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.delete ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.delete', 'en-GB', 'Delete', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete', 'it-IT', 'Elimina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete', 'fr-FR', 'Supprimer', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete', 'es-ES', 'Eliminar', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete', 'de-DE', 'Löschen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete', 'pt-PT', 'Eliminar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.delete_all ────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.delete_all', 'en-GB', 'Delete all', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_all', 'it-IT', 'Elimina tutti', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_all', 'fr-FR', 'Tout supprimer', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_all', 'es-ES', 'Eliminar todo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_all', 'de-DE', 'Alle löschen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.delete_all', 'pt-PT', 'Eliminar tudo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.storage_used ──────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.storage_used', 'en-GB', 'Storage used: {used} of {quota}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.storage_used', 'it-IT', 'Spazio utilizzato: {used} di {quota}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.storage_used', 'fr-FR', 'Stockage utilisé : {used} sur {quota}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.storage_used', 'es-ES', 'Almacenamiento usado: {used} de {quota}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.storage_used', 'de-DE', 'Speicher verwendet: {used} von {quota}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.storage_used', 'pt-PT', 'Armazenamento usado: {used} de {quota}', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.confirm_delete ────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.confirm_delete', 'en-GB', 'Delete this model from cache?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete', 'it-IT', 'Eliminare questo modello dalla cache?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete', 'fr-FR', 'Supprimer ce modèle du cache ?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete', 'es-ES', '¿Eliminar este modelo de la caché?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete', 'de-DE', 'Dieses Modell aus dem Cache löschen?', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete', 'pt-PT', 'Eliminar este modelo da cache?', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.confirm_delete_all ────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.confirm_delete_all', 'en-GB', 'Delete all cached models? The active model will be kept.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete_all', 'it-IT', 'Eliminare tutti i modelli dalla cache? Il modello attivo verrà mantenuto.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete_all', 'fr-FR', 'Supprimer tous les modèles du cache ? Le modèle actif sera conservé.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete_all', 'es-ES', '¿Eliminar todos los modelos de la caché? El modelo activo se mantendrá.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete_all', 'de-DE', 'Alle Modelle aus dem Cache löschen? Das aktive Modell wird behalten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.confirm_delete_all', 'pt-PT', 'Eliminar todos os modelos da cache? O modelo ativo será mantido.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.in_use ────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.in_use', 'en-GB', 'This model is in use. Switch to another model before deleting it.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.in_use', 'it-IT', 'Questo modello è in uso. Passa a un altro modello prima di eliminarlo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.in_use', 'fr-FR', 'Ce modèle est en cours d''utilisation. Passez à un autre modèle avant de le supprimer.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.in_use', 'es-ES', 'Este modelo está en uso. Cambia a otro modelo antes de eliminarlo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.in_use', 'de-DE', 'Dieses Modell wird verwendet. Wechseln Sie zu einem anderen Modell, bevor Sie es löschen.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.in_use', 'pt-PT', 'Este modelo está em uso. Mude para outro modelo antes de eliminá-lo.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.deleted ───────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.deleted', 'en-GB', 'Model deleted from cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted', 'it-IT', 'Modello eliminato dalla cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted', 'fr-FR', 'Modèle supprimé du cache', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted', 'es-ES', 'Modelo eliminado de la caché', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted', 'de-DE', 'Modell aus dem Cache gelöscht', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted', 'pt-PT', 'Modelo eliminado da cache', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.deleted_all ───────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.deleted_all', 'en-GB', 'All models deleted from cache (except active)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted_all', 'it-IT', 'Tutti i modelli eliminati dalla cache (tranne quello attivo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted_all', 'fr-FR', 'Tous les modèles supprimés du cache (sauf l''actif)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted_all', 'es-ES', 'Todos los modelos eliminados de la caché (excepto el activo)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted_all', 'de-DE', 'Alle Modelle aus dem Cache gelöscht (außer dem aktiven)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.deleted_all', 'pt-PT', 'Todos os modelos eliminados da cache (exceto o ativo)', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.ai.cache.refresh ───────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.ai.cache.refresh', 'en-GB', 'Refresh', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.refresh', 'it-IT', 'Aggiorna', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.refresh', 'fr-FR', 'Actualiser', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.refresh', 'es-ES', 'Actualizar', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.refresh', 'de-DE', 'Aktualisieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.ai.cache.refresh', 'pt-PT', 'Atualizar', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
