-- Primebrick: be phase-2+3 — uuid reference columns + backfill
-- user_profile_id bigint refs gain user_profile_uuid twins →
-- public.user_profiles.uuid. be convention: uuid refs carry no
-- physical FK (unlike crm) — columns only. Nullable until phase 4/5
-- (NOT NULL now would break writes that don't populate uuid yet).

ALTER TABLE "public"."user_invitations"            ADD COLUMN IF NOT EXISTS "user_profile_uuid" uuid;
ALTER TABLE "public"."user_mfa_factors"            ADD COLUMN IF NOT EXISTS "user_profile_uuid" uuid;
ALTER TABLE "public"."user_passkeys"               ADD COLUMN IF NOT EXISTS "user_profile_uuid" uuid;
ALTER TABLE "public"."mfa_action_authorizations"   ADD COLUMN IF NOT EXISTS "user_profile_uuid" uuid;

-- Live data anomaly (approved deletion): 9 user_passkeys rows carry
-- user_profile_id values pointing at hard-deleted user_profiles rows
-- (be has no physical FKs, so dangling refs were possible). These are dead
-- credentials of users that no longer exist — delete before backfill.
DELETE FROM "public"."user_passkeys" p
WHERE p."user_profile_id" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "public"."user_profiles" u WHERE u."id" = p."user_profile_id");

UPDATE "public"."user_invitations"          t SET "user_profile_uuid" = r."uuid" FROM "public"."user_profiles" r WHERE t."user_profile_id" = r."id" AND t."user_profile_uuid" IS NULL;
UPDATE "public"."user_mfa_factors"          t SET "user_profile_uuid" = r."uuid" FROM "public"."user_profiles" r WHERE t."user_profile_id" = r."id" AND t."user_profile_uuid" IS NULL;
UPDATE "public"."user_passkeys"             t SET "user_profile_uuid" = r."uuid" FROM "public"."user_profiles" r WHERE t."user_profile_id" = r."id" AND t."user_profile_uuid" IS NULL;
UPDATE "public"."mfa_action_authorizations" t SET "user_profile_uuid" = r."uuid" FROM "public"."user_profiles" r WHERE t."user_profile_id" = r."id" AND t."user_profile_uuid" IS NULL;

-- Orphan assertions: any user_profile_id without resolvable uuid = broken data — fail.
DO $$
DECLARE missing bigint;
BEGIN
  SELECT count(*) INTO missing FROM "public"."user_invitations"          WHERE "user_profile_id" IS NOT NULL AND "user_profile_uuid" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'user_invitations.user_profile_uuid: % orphaned refs', missing; END IF;
  SELECT count(*) INTO missing FROM "public"."user_mfa_factors"          WHERE "user_profile_id" IS NOT NULL AND "user_profile_uuid" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'user_mfa_factors.user_profile_uuid: % orphaned refs', missing; END IF;
  SELECT count(*) INTO missing FROM "public"."user_passkeys"             WHERE "user_profile_id" IS NOT NULL AND "user_profile_uuid" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'user_passkeys.user_profile_uuid: % orphaned refs', missing; END IF;
  SELECT count(*) INTO missing FROM "public"."mfa_action_authorizations" WHERE "user_profile_id" IS NOT NULL AND "user_profile_uuid" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'mfa_action_authorizations.user_profile_uuid: % orphaned refs', missing; END IF;
END $$;
