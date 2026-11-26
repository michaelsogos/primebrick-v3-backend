-- Dict footer aggregate badges: plural kind labels for "+N" badges.
-- app.* vocabulary lives in public.translations.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.new_plural', 'en-GB', 'New', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'en-US', 'New', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'it-IT', 'Nuovi', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'fr-FR', 'Nouveaux', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'de-DE', 'Neue', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'es-ES', 'Nuevos', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.new_plural', 'pt-PT', 'Novos', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'en-GB', 'Modified', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'en-US', 'Modified', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'it-IT', 'Modificati', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'fr-FR', 'Modifiés', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'de-DE', 'Geänderte', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'es-ES', 'Modificados', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1),
  (uuidv7(), 'app.common.modified_plural', 'pt-PT', 'Modificados', now(), 'migration-app-common-plural', now(), 'migration-app-common-plural', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-app-common-plural', version = translations.version + 1;
