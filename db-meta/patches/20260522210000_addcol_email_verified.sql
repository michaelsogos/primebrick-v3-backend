-- Add email_verified column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;
