-- Primebrick: entity → database patch (review before apply)
-- generatedAt: 2026-05-16T20:00:00.000Z

ALTER TABLE "public"."customers_audit" ADD COLUMN IF NOT EXISTS "changed_by" text NOT NULL DEFAULT 'system';

COMMENT ON COLUMN public.customers_audit.changed_by IS 'Identifier of the principal that produced the audit entry (falls back to "system" when no authenticated context is available).';

-- patch_id: 20260516200000_addcol_public_customers_audit_changed_by
