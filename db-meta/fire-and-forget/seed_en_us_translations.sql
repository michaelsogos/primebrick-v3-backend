-- Fire-and-forget patch: seed en-US dictionaries.
--
-- The UI language selector (LangSelect / UI_LANGS) offers 'en-US' as an
-- exact-match UiLang, but the DB only had en-GB dictionaries. Any browser
-- reporting navigator.language = 'en-US' received empty dicts and rendered
-- raw i18n keys. This seeds en-US by cloning en-GB as the baseline
-- (US-specific wording can be refined per-key later via the translations UI).
--
-- Covers system.translations + public.translations (custom.translations is
-- empty at seed time).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT key, 'en-US', value, now(), 'initial-setup', now(), 'initial-setup', 1
FROM system.translations
WHERE language = 'en-GB' AND deleted_at IS NULL
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT key, 'en-US', value, now(), 'initial-setup', now(), 'initial-setup', 1
FROM public.translations
WHERE language = 'en-GB' AND deleted_at IS NULL
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
