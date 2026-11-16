-- Primebrick: audit rows get a uuidv7 `uuid` row key, PK becomes
-- (uuid, changed_at) and the surrogate bigint `id` is eradicated — same
-- shape the DAL now emits for every {entity}_audit table.
-- config_entries_audit's PK constraint still carries the pre-rename
-- 'auth_configurations_audit_pkey' name — dropped explicitly.
--
-- user_profiles_audit is NOT partitioned (plain table): same uuid PK
-- swap, no partman row — retention runs as a row-level sweep on
-- changed_at (12 months), same contract the maintenance executor
-- applies to every non-registered audit table.
--
-- The three public partman templates still carry the dead id/entity_id
-- shape — rebuild them LIKE their migrated parents so future partitions
-- get the uuid shape.
--
-- Audit retention is intrinsic: every {entity}_audit parent keeps 12
-- months and drops expired partitions (retention_keep_table = false).

ALTER TABLE "public"."config_entries_audit" ADD COLUMN "uuid" uuid NOT NULL DEFAULT uuidv7();
ALTER TABLE "public"."config_entries_audit" DROP CONSTRAINT "auth_configurations_audit_pkey";
ALTER TABLE "public"."config_entries_audit" ADD PRIMARY KEY ("uuid", "changed_at");
ALTER TABLE "public"."config_entries_audit" DROP COLUMN "id";

ALTER TABLE "public"."organizations_audit" ADD COLUMN "uuid" uuid NOT NULL DEFAULT uuidv7();
ALTER TABLE "public"."organizations_audit" DROP CONSTRAINT "organizations_audit_pkey";
ALTER TABLE "public"."organizations_audit" ADD PRIMARY KEY ("uuid", "changed_at");
ALTER TABLE "public"."organizations_audit" DROP COLUMN "id";

ALTER TABLE "public"."role_mappings_audit" ADD COLUMN "uuid" uuid NOT NULL DEFAULT uuidv7();
ALTER TABLE "public"."role_mappings_audit" DROP CONSTRAINT "role_mappings_audit_pkey";
ALTER TABLE "public"."role_mappings_audit" ADD PRIMARY KEY ("uuid", "changed_at");
ALTER TABLE "public"."role_mappings_audit" DROP COLUMN "id";

ALTER TABLE "public"."user_profiles_audit" ADD COLUMN "uuid" uuid NOT NULL DEFAULT uuidv7();
ALTER TABLE "public"."user_profiles_audit" DROP CONSTRAINT "user_profiles_audit_pkey";
ALTER TABLE "public"."user_profiles_audit" ADD PRIMARY KEY ("uuid", "changed_at");
ALTER TABLE "public"."user_profiles_audit" DROP COLUMN "id";

DROP TABLE IF EXISTS "partman"."template_public_auth_configurations_audit";
CREATE TABLE "partman"."template_public_auth_configurations_audit"
  (LIKE "public"."config_entries_audit" INCLUDING ALL);
DROP TABLE IF EXISTS "partman"."template_public_organizations_audit";
CREATE TABLE "partman"."template_public_organizations_audit"
  (LIKE "public"."organizations_audit" INCLUDING ALL);
DROP TABLE IF EXISTS "partman"."template_public_role_mappings_audit";
CREATE TABLE "partman"."template_public_role_mappings_audit"
  (LIKE "public"."role_mappings_audit" INCLUDING ALL);

UPDATE partman.part_config
   SET retention = '12 months', retention_keep_table = false
 WHERE parent_table IN (
   'public.config_entries_audit','public.organizations_audit',
   'public.role_mappings_audit');
