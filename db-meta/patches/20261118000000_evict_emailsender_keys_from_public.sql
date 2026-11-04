-- Primebrick: evict `emailsender.*` drift from `public.translations`.
--
-- `public` is the `app.*` namespace — the only schema whose keys may carry
-- the `app.` prefix. The 6 `emailsender.callable.send.*` keys x 7 languages
-- seeded here by patch 20261116040000 belong to the emailsender service's
-- own `emailsender.translations` schema, where they are re-seeded verbatim
-- (US patch 20261105030000_callable_send_help_keys). The write boundary in
-- `TranslationsService` already rejects non-`app.*` writes to `public`, so
-- nothing can re-create them — this patch retires the existing rows.
--
-- Soft-delete (translations are Deletable): the DAL read path already
-- excludes `deleted_at` rows, keeping them out of the served `app` dict
-- while preserving the audit trail.

UPDATE public.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261118000000'
WHERE key LIKE 'emailsender.%'
  AND deleted_at IS NULL;
