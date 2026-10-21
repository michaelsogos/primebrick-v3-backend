-- Primebrick: purge `system.entities.job_*` drift from `public.translations`.
--
-- The pre-service initial-setup seed wrote job entity labels into
-- `public.translations` (49 keys x 6 languages, 2026-10-12). `public` is the
-- `app.*` namespace — those keys violate the schema→namespace boundary and,
-- because the i18n dict aggregates every row regardless of key prefix, they
-- were being served inside the `app` dict where they could collide with the
-- `job`/`system` dicts at FE merge time.
--
-- Job entity labels are owned by the `job` module in `job.translations`
-- (renamed to `job.entities.*` by job-handler patch 0006). These rows are
-- soft-deleted (translations are Deletable — the DAL read path excludes
-- deleted_at rows) rather than hard-deleted, keeping the audit trail.

UPDATE public.translations
SET deleted_at = now(),
    deleted_by = 'migration-20261020160000'
WHERE key LIKE 'system.entities.job\_%' ESCAPE '\'
  AND deleted_at IS NULL;
