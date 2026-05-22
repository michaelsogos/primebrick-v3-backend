-- Update existing admin user to set is_admin to true
UPDATE public.user_profiles
SET is_admin = true,
    updated_at = NOW(),
    updated_by = 'system'
WHERE idp_username = 'admin' OR display_name = 'Primebrick Admin';
