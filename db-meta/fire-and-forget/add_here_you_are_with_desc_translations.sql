-- Fire-and-forget patch: Add app.smart.regex.ai.hereYouAreWithDesc translation key
--
-- This key is the success message shown by the SmartRegexInput AI panel when a
-- regex has been generated that validates the user-supplied description:
--   app.smart.regex.ai.hereYouAreWithDesc — "Here you are! The regex that validates: {desc}"
--
-- Keys added (1 total, × 6 languages = 6 INSERTs)
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
--   translations:i18n:public:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- ─── app.smart.regex.ai.hereYouAreWithDesc ──────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'en-GB', 'Here you are! The regex that validates: {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'it-IT', 'Ecco a te! La regex che verifica: {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'fr-FR', 'Voila ! La regex qui valide : {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'es-ES', 'Aqui tienes! La regex que valida: {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'de-DE', 'Hier ist es! Die Regex, die validiert: {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES ('app.smart.regex.ai.hereYouAreWithDesc', 'pt-PT', 'Aqui esta! A regex que valida: {desc}', '2026-05-18T14:27:00Z', 'initial-setup', '2026-05-18T14:27:00Z', 'initial-setup', 1) ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
