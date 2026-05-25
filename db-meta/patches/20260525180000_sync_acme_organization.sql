-- Sync ACME organization from Casdoor to Primebrick organizations table
-- This patch is for existing installations where Casdoor is already set up
-- but the organizations table is missing the ACME record

-- First, fix any existing record with wrong idp_code format
UPDATE public.organizations
SET idp_code = 'admin/acme',
    updated_at = NOW(),
    updated_by = 'patch-20260525180000',
    version = version + 1
WHERE idp_code = 'acme';

-- Insert ACME organization if it doesn't exist
INSERT INTO public.organizations (uuid, idp_code, display_name, website_url, idp_owner, idp_name, last_synced_at, created_at, created_by, updated_at, updated_by, version)
VALUES (
  gen_random_uuid(),
  'admin/acme',
  'ACME',
  'https://acme.io',
  'admin',
  'acme',
  NOW(),
  NOW(),
  'patch-20260525180000',
  NOW(),
  'patch-20260525180000',
  1
)
ON CONFLICT (idp_code) DO NOTHING;
