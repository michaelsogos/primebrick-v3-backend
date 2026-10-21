-- Primebrick: purge remaining `system.*` drift from `public.translations`.
--
-- `public` is the `app.*` namespace — the only schema whose keys may carry the
-- `app.` prefix. The 17 `system.jobs.*` keys x 6 languages here are leftovers
-- from the pre-module era when the jobs page was a static settings page; the
-- module-owned equivalents now live in `job.translations` as `job.jobs.*`
-- (job-handler patches 0004/0005). The write boundary added in
-- `TranslationsService` rejects `system.*` writes to `public`, so nothing can
-- re-create them — this patch retires the existing rows.
--
-- Soft-delete (translations are Deletable): the DAL read path already excludes
-- `deleted_at` rows, keeping them out of the served `app` dict while
-- preserving the audit trail.

UPDATE public.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261020160500'
WHERE key LIKE 'system.%'
  AND deleted_at IS NULL;
