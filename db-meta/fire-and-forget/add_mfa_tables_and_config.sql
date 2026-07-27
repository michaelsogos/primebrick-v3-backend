-- Fire-and-forget: Add MFA config keys to existing databases + update init patch SHA256.
-- This script is for databases that already have the OLD init patch applied.
-- It:
--   1. Creates the user_mfa_factors + mfa_action_authorizations tables (if not exist)
--   2. Seeds the MFA config keys (enable_mfa, mfa_challenge_token_ttl_seconds, mfa_challenge_signing_secret)
--   3. Updates the init patch SHA256 in the registry (since the init patch file was modified)

BEGIN;

-- 1. Create user_mfa_factors table (if not exists)
CREATE TABLE IF NOT EXISTS "public"."user_mfa_factors" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "factor_type" text NOT NULL,
  "casdoor_mfa_type" text,
  "label" varchar(100),
  "is_enabled" boolean NOT NULL DEFAULT true,
  "is_preferred" boolean NOT NULL DEFAULT false,
  "last_used_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_mfa_factors_uuid_uq" ON "public"."user_mfa_factors" ("uuid");
CREATE INDEX IF NOT EXISTS "user_mfa_factors_user_profile_id_idx" ON "public"."user_mfa_factors" ("user_profile_id");

COMMENT ON TABLE public.user_mfa_factors IS 'MFA factors tracked in PG (mirrors Casdoor MFA setup)';

-- 2. Create mfa_action_authorizations table (if not exists)
CREATE TABLE IF NOT EXISTS "public"."mfa_action_authorizations" (
  "id" bigint generated always as identity NOT NULL,
  "jti" text NOT NULL,
  "user_profile_id" bigint NOT NULL,
  "action" text NOT NULL,
  "target_resource" text NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "used_at" timestamptz,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mfa_action_authorizations_jti_uq" ON "public"."mfa_action_authorizations" ("jti");
CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_user_profile_id_idx" ON "public"."mfa_action_authorizations" ("user_profile_id");
CREATE INDEX IF NOT EXISTS "mfa_action_authorizations_expires_at_idx" ON "public"."mfa_action_authorizations" ("expires_at");

COMMENT ON TABLE public.mfa_action_authorizations IS 'Single-use action authorization tokens for step-up MFA';

-- 3. Seed MFA config keys (idempotent — ON CONFLICT DO NOTHING)
INSERT INTO "public"."auth_configurations" ("key", "value", "description", "created_by") VALUES
('enable_mfa', 'true', 'Abilita il sistema MFA / 2FA (login MFA + step-up MFA). Se false, il login non richiede mai MFA e il middleware step-up passa attraverso (true/false).', 'system'),
('mfa_challenge_token_ttl_seconds', '300', 'TTL in secondi per i token di challenge MFA (login, step-up, action authorization). Default 300 = 5 minuti.', 'system'),
('mfa_challenge_signing_secret', '', 'HMAC secret per firmare i JWT di challenge MFA. Auto-generato (32 random bytes hex) al primo utilizzo se vuoto.', 'system')
ON CONFLICT ("key") DO NOTHING;

COMMIT;
