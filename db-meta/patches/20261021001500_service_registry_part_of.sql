-- service_registry.part_of — the ROOT LEVEL a module belongs to
-- ('system' for platform services, 'crm' for the CRM domain, …).
-- Combined with `code` (the module code) it derives the module's route
-- prefix `/{part_of}/{code}` — the single source of truth, enforced at
-- service.register validation (every declared route_prefixes/nav href/
-- routes entry must live under it).
ALTER TABLE public.service_registry ADD COLUMN IF NOT EXISTS "part_of" text;

-- Backfill: crm is its own root level; every other registered service is
-- a system module (settings reserved shell, job, ai, emailsender, webhook).
UPDATE public.service_registry SET part_of = 'crm' WHERE code = 'crm';
UPDATE public.service_registry SET part_of = 'system' WHERE part_of IS NULL;

ALTER TABLE public.service_registry ALTER COLUMN "part_of" SET NOT NULL;
