-- Fire-and-forget: Fix outdated permission format in role_mappings for existing live DB.
-- The live DB has PascalCase role names (Sales, CustomerService) with colon notation
-- (customers:list) instead of dot notation (customers.read.all).
-- The init patch seeds lowercase role names with correct dot notation for new DBs.
-- This script fixes the pre-existing PascalCase rows on the live DB.
-- Run this ONCE on the existing live database. Idempotent: the permissions::text LIKE
-- '%customers:%' guard skips rows already converted to dot notation.

BEGIN;

UPDATE public.role_mappings
SET permissions = '["customers.read.all","customers.read.single","customers.create.single","customers.update.single"]'::jsonb
WHERE idp_role = 'Sales' AND permissions::text LIKE '%customers:%';

UPDATE public.role_mappings
SET permissions = '["customers.read.all","customers.read.single","customers.update.single"]'::jsonb
WHERE idp_role = 'CustomerService' AND permissions::text LIKE '%customers:%';

COMMIT;
