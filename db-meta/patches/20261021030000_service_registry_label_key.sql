-- service_registry.label_key — the module's display name as an i18n key,
-- resolved against the module's own translation namespace (same contract
-- as nav[].label_key). Fallback when absent/unresolved: the raw `name`.
--
-- Single source of truth: breadcrumbs, app launcher, module menus and any
-- future consumer all render resolveModuleLabel(module) instead of
-- mixing raw registry names with per-page hardcoded keys.
--
-- Backfill:
--   settings → 'system.settings.title' (exists; the key its pages already
--              use — "Impostazioni" in it-IT, one label everywhere)
--   job      → 'job.module.name'   (seeded by the job service's own db-meta)
--   crm      → 'crm.module.name'   (seeded by the crm service's own db-meta)

ALTER TABLE public.service_registry
  ADD COLUMN IF NOT EXISTS label_key VARCHAR(255);

UPDATE public.service_registry SET label_key = 'system.settings.title', updated_at = now(), updated_by = 'migration-label-key'
 WHERE code = 'settings' AND deleted_at IS NULL AND label_key IS NULL;
UPDATE public.service_registry SET label_key = 'job.module.name', updated_at = now(), updated_by = 'migration-label-key'
 WHERE code = 'job' AND deleted_at IS NULL AND label_key IS NULL;
UPDATE public.service_registry SET label_key = 'crm.module.name', updated_at = now(), updated_by = 'migration-label-key'
 WHERE code = 'crm' AND deleted_at IS NULL AND label_key IS NULL;
