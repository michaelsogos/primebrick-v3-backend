-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-21T00:00:00.000Z
-- Adds is_active, is_admin, roles, last_synced_at to user_profiles for Casdoor sync

ALTER TABLE "public"."user_profiles"
  ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "is_admin" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "roles" jsonb,
  ADD COLUMN IF NOT EXISTS "last_synced_at" timestamptz;

COMMENT ON COLUMN public.user_profiles.is_active IS 'Whether the user account is active (mirrors Casdoor isForbidden)';
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Whether the user has admin privileges (mirrors Casdoor isAdmin)';
COMMENT ON COLUMN public.user_profiles.roles IS 'Array of role names assigned to the user (mirrors Casdoor roles)';
COMMENT ON COLUMN public.user_profiles.last_synced_at IS 'Timestamp of last successful sync with Casdoor';

-- patch_id: 20260521000000_addcols_public_user_profiles_sync_fields
