-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-04-18T14:47:07.305Z

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "onboarding_time_zone" varchar(100);
ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "onboarding_at" timestamptz;

COMMENT ON COLUMN public.customers.onboarding_at IS 'Customer onboarding instant, stored as timestamptz (UTC)';
COMMENT ON COLUMN public.customers.onboarding_time_zone IS 'IANA time zone for the user who set onboarding (display context; DST via IANA rules)';


-- patch_id: 20260418144707_addcols_public_customers
