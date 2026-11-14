-- Primebrick: `run_as` unification — validation key follows the field.
--
-- `jobTriggerShapeIssues` (v3-core) now emits
-- `app.common.validation.originator_requires_source` (was
-- `user_context_requires_source`) — `execution_context:"user"` became
-- `run_as:"originator"`, and the suggestion names the new vocab
-- ("author"/"system"). Key move preserves uuid/history; audit triple
-- bumped per the getI18nDict freshness contract. The key exists in
-- these 5 locales only — same set, renamed.

UPDATE public.translations SET key = 'app.common.validation.originator_requires_source', value = '"originator" requires an event source — pick "author" or "system"',      updated_at = now(), updated_by = 'migration-run-as', version = version + 1 WHERE key = 'app.common.validation.user_context_requires_source' AND language = 'en-GB';
UPDATE public.translations SET key = 'app.common.validation.originator_requires_source', value = '"originator" richiede una sorgente evento — scegli "author" o "system"',   updated_at = now(), updated_by = 'migration-run-as', version = version + 1 WHERE key = 'app.common.validation.user_context_requires_source' AND language = 'it-IT';
UPDATE public.translations SET key = 'app.common.validation.originator_requires_source', value = '"originator" nécessite une source d''événement — choisissez "author" ou "system"', updated_at = now(), updated_by = 'migration-run-as', version = version + 1 WHERE key = 'app.common.validation.user_context_requires_source' AND language = 'fr-FR';
UPDATE public.translations SET key = 'app.common.validation.originator_requires_source', value = '"originator" requiere una fuente de evento — elige "author" o "system"',      updated_at = now(), updated_by = 'migration-run-as', version = version + 1 WHERE key = 'app.common.validation.user_context_requires_source' AND language = 'es-ES';
UPDATE public.translations SET key = 'app.common.validation.originator_requires_source', value = '"originator" erfordert eine Ereignisquelle — wähle "author" oder "system"',  updated_at = now(), updated_by = 'migration-run-as', version = version + 1 WHERE key = 'app.common.validation.user_context_requires_source' AND language = 'de-DE';
