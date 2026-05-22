-- Update existing admin user to set is_verified and issuer
UPDATE public.user_profiles
SET is_verified = true,
    issuer = (SELECT value FROM public.auth_configurations WHERE key = 'casdoor_endpoint' LIMIT 1),
    updated_at = NOW(),
    updated_by = 'system'
WHERE idp_username = 'admin' OR display_name = 'Primebrick Admin';
