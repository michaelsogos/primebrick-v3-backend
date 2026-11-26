-- Primebrick: entity → database patch
-- pb:requires-review
-- generatedAt: 2026-11-24T16:17:55.111Z

-- ── review section (runs only after approval) ──
-- REVIEW index "config_entries_key_uq" redefined (entity using=btree cols=key vs db using=btree cols=key)
DROP INDEX IF EXISTS "public"."config_entries_key_uq";
CREATE UNIQUE INDEX IF NOT EXISTS "config_entries_key_uq" ON "public"."config_entries" ("key") WHERE deleted_at IS NULL;
-- REVIEW index "organizations_idp_code_uq" redefined (entity using=btree cols=idp_code vs db using=btree cols=idp_code)
DROP INDEX IF EXISTS "public"."organizations_idp_code_uq";
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_idp_code_uq" ON "public"."organizations" ("idp_code") WHERE deleted_at IS NULL;
-- REVIEW index "user_profiles_idp_code_uq" redefined (entity using=btree cols=idp_code vs db using=btree cols=idp_code)
DROP INDEX IF EXISTS "public"."user_profiles_idp_code_uq";
CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_idp_code_uq" ON "public"."user_profiles" ("idp_code") WHERE deleted_at IS NULL;
-- REVIEW index "client_shield_registry_ua_prefix_uidx" redefined (entity using=btree cols=ua_prefix vs db using=btree cols=ua_prefix)
DROP INDEX IF EXISTS "system"."client_shield_registry_ua_prefix_uidx";
CREATE UNIQUE INDEX IF NOT EXISTS "client_shield_registry_ua_prefix_uidx" ON "system"."client_shield_registry" ("ua_prefix") WHERE deleted_at IS NULL;

-- WARN: DB-only index "config_entries_deleted_at_idx" on public.config_entries — not dropped
