-- Add avatar_initials column to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_initials VARCHAR(10);
