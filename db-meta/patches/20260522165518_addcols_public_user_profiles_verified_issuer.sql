-- Add is_verified and issuer columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS issuer VARCHAR(255);
