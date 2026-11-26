-- Primebrick: entity → database patch
-- Phase-5 approved drops (debt-drift-and-clock):
--  - *_deleted_at_idx: ~zero selectivity indexes the planner never uses
--  - user_mfa_factors_user_profile_uuid_idx: DB-only, unused
--  - dal_test_*: test-lifecycle residue on the real DB (see test-DB convention)
DROP INDEX IF EXISTS "system"."config_entries_deleted_at_idx";
DROP INDEX IF EXISTS "public"."service_registry_deleted_at_idx";
DROP INDEX IF EXISTS "public"."user_mfa_factors_user_profile_uuid_idx";
DROP TABLE IF EXISTS "public"."dal_test_simple";
DROP TABLE IF EXISTS "public"."dal_test_types";
