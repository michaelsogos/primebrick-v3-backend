-- Add is_verified and issuer columns to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN is_verified BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN issuer VARCHAR(255);
