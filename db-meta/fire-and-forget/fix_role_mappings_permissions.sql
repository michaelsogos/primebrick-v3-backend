-- Fire-and-forget: Fix outdated permission format in role_mappings for existing live DB.
-- The seed data used colon notation (customers:list) instead of dot notation (customers.read.all).
-- Run this ONCE on the existing live database.

BEGIN;

UPDATE public.role_mappings
SET permissions = '["customers.read.all","customers.read.single","customers.create.single","customers.update.single"]'::jsonb
WHERE idp_role = 'sales' AND permissions::text LIKE '%customers:%';

UPDATE public.role_mappings
SET permissions = '["customers.read.all","customers.read.single","customers.update.single"]'::jsonb
WHERE idp_role = 'customer_service' AND permissions::text LIKE '%customers:%';

COMMIT;
