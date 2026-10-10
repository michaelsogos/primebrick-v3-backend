-- service_registry.pkg_name — the service's package.json name.
-- With service_version it forms the canonical identity `{pkg_name}/{version}`
-- (same value as system.client_registry.ua_prefix) used by all log messages.
ALTER TABLE public.service_registry ADD COLUMN IF NOT EXISTS "pkg_name" text;
