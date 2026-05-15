-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-15T12:34:56.000Z

ALTER TABLE "public"."customers" ADD COLUMN IF NOT EXISTS "cloned_from" uuid;

COMMENT ON COLUMN public.customers.cloned_from IS 'UUID of the source record this customer was cloned from. Null if this is an original record (not a clone).';

-- patch_id: 20260515123456_addcol_public_customers_cloned_from
