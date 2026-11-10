-- Patch: generate_all label → noun phrase ("all the missing ones")
--
-- The CTA moved into the missing-languages row as a mini ghost button
-- carrying the AI icon — the icon already conveys "generate", so the
-- label drops the verb and keeps only the scope. Values updated in
-- place; the key and every consumer stay untouched.
--
-- Rollback: restore the previous verb-led values.

UPDATE public.translations SET value = 'All missing', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'All missing', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Tutte le mancanti', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Alle fehlenden', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Todas las faltantes', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Toutes les manquantes', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Todas as em falta', updated_at = now()
 WHERE key = 'app.common.translations.generate_all' AND language = 'pt-PT' AND deleted_at IS NULL;
