-- service_registry.capabilities — capability list declared in the service's
-- package.json ("capabilities": [...], snake_case) and sent in every
-- service.register. Updated at each registration so the registry always
-- reflects the capabilities of the deployed artifact.
ALTER TABLE public.service_registry ADD COLUMN IF NOT EXISTS "capabilities" jsonb NOT NULL DEFAULT '[]';
