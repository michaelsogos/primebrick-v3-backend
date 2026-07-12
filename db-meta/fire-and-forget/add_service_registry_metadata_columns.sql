-- Add new columns to service_registry for existing databases.
-- New databases get these columns directly from the init patch.
-- This script is idempotent (IF NOT EXISTS) and safe to run multiple times.

ALTER TABLE public.service_registry
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS github_repo_url text,
  ADD COLUMN IF NOT EXISTS service_version text,
  ADD COLUMN IF NOT EXISTS is_behind_scaler boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS icon_type text NOT NULL DEFAULT 'icon';

CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_code_uq_scaler"
  ON "public"."service_registry" ("code") WHERE is_behind_scaler = true;

CREATE UNIQUE INDEX IF NOT EXISTS "service_registry_code_base_url_uq"
  ON "public"."service_registry" ("code", "base_url") WHERE is_behind_scaler = false;
