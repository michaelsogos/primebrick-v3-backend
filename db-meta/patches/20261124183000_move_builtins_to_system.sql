-- Primebrick: entity → database patch
-- pb:segments
-- Move builtin + patch-domain tables public → system (closed schema model).
-- Idempotent by design: applied pre-flip under the public registry, then
-- re-applied post-flip under the system registry as pure no-ops (the engine
-- records this patch's own row in whichever registry is primary).

-- ── patch registry: bootstrap on system + full merge ────────────────────
-- public.primebrick_database_patches is NOT dropped here: the engine must
-- still record this patch's own row into it (pre-flip primary). The drop
-- lands in the follow-up patch once `system` is primary.
CREATE TABLE IF NOT EXISTS "system"."primebrick_database_patches"
  (LIKE "public"."primebrick_database_patches" INCLUDING ALL);
DELETE FROM "system"."primebrick_database_patches" WHERE status = 'failed';
INSERT INTO "system"."primebrick_database_patches"
  SELECT * FROM "public"."primebrick_database_patches" ON CONFLICT DO NOTHING;

-- v1_archive kept the ORIGINAL registry index names (pre-rename copy) —
-- they collide with the live system registry's pkey once schema-moved.
ALTER INDEX IF EXISTS "public"."primebrick_database_patches_pkey"
  RENAME TO "primebrick_database_patches_v1_archive_pkey";
ALTER INDEX IF EXISTS "public"."primebrick_database_patches_sha_idx"
  RENAME TO "primebrick_database_patches_v1_archive_sha_idx";
ALTER TABLE IF EXISTS "public"."primebrick_database_patches_v1_archive" SET SCHEMA "system";

-- ── dal builtins + their partitioned audit trails ───────────────────────
-- SET SCHEMA moves the table's indexes and constraints implicitly, but
-- does NOT cascade to partition children — every partition is listed.
ALTER TABLE IF EXISTS "public"."config_entries" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_default" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260401" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260501" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260601" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260701" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260801" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20260901" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20261001" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20261101" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20261201" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20270101" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20270201" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."config_entries_audit_p20270301" SET SCHEMA "system";

ALTER TABLE IF EXISTS "public"."sequences" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequence_counters" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_default" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20260701" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20260801" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20260901" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20261001" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20261101" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20261201" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20270101" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20270201" SET SCHEMA "system";
ALTER TABLE IF EXISTS "public"."sequences_audit_p20270301" SET SCHEMA "system";

-- partman registry pointers follow the moved parents.
UPDATE partman.part_config SET parent_table = 'system.config_entries_audit'
  WHERE parent_table = 'public.config_entries_audit';
UPDATE partman.part_config SET parent_table = 'system.sequences_audit'
  WHERE parent_table = 'public.sequences_audit';
