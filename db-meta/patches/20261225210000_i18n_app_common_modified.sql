-- Dict footer taint badges: per-kind label on individual badges.
-- The warning-tone badges need the "Modified" label (pendings already
-- carry "New" via app.common.new). app.* vocabulary lives in
-- public.translations.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.modified', 'en-GB', 'Modified', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'en-US', 'Modified', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'it-IT', 'Modificato', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'fr-FR', 'Modifié', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'de-DE', 'Geändert', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'es-ES', 'Modificado', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1),
  (uuidv7(), 'app.common.modified', 'pt-PT', 'Modificado', now(), 'migration-app-common-modified', now(), 'migration-app-common-modified', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-app-common-modified', version = translations.version + 1;
