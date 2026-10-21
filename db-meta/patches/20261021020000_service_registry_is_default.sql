-- service_registry.is_default — the DECLARED default module of a root
-- level (`part_of`). Selecting an app in the sidebar loads its default
-- module, which in turn lands on nav[0].href — one flag per root level,
-- enforced as keep-winner at register time and demote-other on admin flip.
-- Backfill: settings is the default of `system`, crm of `crm`.

ALTER TABLE public.service_registry
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;

UPDATE public.service_registry SET is_default = true, updated_at = now(), updated_by = 'migration-is-default', version = version + 1
 WHERE code = 'settings' AND part_of = 'system' AND deleted_at IS NULL;
UPDATE public.service_registry SET is_default = true, updated_at = now(), updated_by = 'migration-is-default', version = version + 1
 WHERE code = 'crm' AND part_of = 'crm' AND deleted_at IS NULL;
