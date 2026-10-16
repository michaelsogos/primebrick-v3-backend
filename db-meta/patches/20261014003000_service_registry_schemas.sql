-- service_registry.schemas — PG schema ownership claim declared in the
-- service's DATABASE_SCHEMA env contract and sent in every service.register.
-- The first schema is the service's owned schema; the BE rejects a register
-- that claims a schema already owned by a different service code, or one of
-- the platform schemas (public/system/custom — the BE's own DATABASE_SCHEMA).
-- The claim persists while the registry row exists (including offline/stale)
-- and is released only by explicit service.unregister (schemas cleared) or
-- admin purge of the row — never automatically on status transitions.
ALTER TABLE public.service_registry ADD COLUMN IF NOT EXISTS "schemas" text[] NOT NULL DEFAULT '{}';
