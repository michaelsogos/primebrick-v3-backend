-- Fix namespace drift: move rows to the table matching their key prefix.
--   public.translations  = app.* keys only
--   system.translations  = system.* keys only
-- Idempotent: INSERT ... WHERE NOT EXISTS + hard delete of the wrong-table rows.

BEGIN;

-- app.* rows wrongly stored in system.translations → move to public.translations
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT s.key, s.language, s.value, s.created_at, s.created_by, s.updated_at, s.updated_by, s.version
FROM system.translations s
WHERE s.key LIKE 'app.%'
  AND s.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.translations p
    WHERE p.key = s.key AND p.language = s.language AND p.deleted_at IS NULL
  );

DELETE FROM system.translations
WHERE key LIKE 'app.%' AND deleted_at IS NULL;

-- system.* rows wrongly stored in public.translations → move to system.translations
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT p.key, p.language, p.value, p.created_at, p.created_by, p.updated_at, p.updated_by, p.version
FROM public.translations p
WHERE p.key LIKE 'system.%'
  AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM system.translations s
    WHERE s.key = p.key AND s.language = p.language AND s.deleted_at IS NULL
  );

DELETE FROM public.translations
WHERE key LIKE 'system.%' AND deleted_at IS NULL;

COMMIT;

-- Verify (expected: 0 / 0):
-- SELECT count(*) FROM system.translations WHERE key LIKE 'app.%' AND deleted_at IS NULL;
-- SELECT count(*) FROM public.translations WHERE key LIKE 'system.%' AND deleted_at IS NULL;
