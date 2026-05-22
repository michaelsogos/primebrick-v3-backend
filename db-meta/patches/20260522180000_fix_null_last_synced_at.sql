-- Fix null last_synced_at values by setting them to created_at
-- This ensures existing user profiles have a valid sync timestamp
UPDATE public.user_profiles
SET last_synced_at = created_at,
    updated_at = NOW(),
    version = version + 1
WHERE last_synced_at IS NULL;
