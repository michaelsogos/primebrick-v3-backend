-- Drift closure: align DB to entity intent.
-- Verified live: zero NULL rows in all three columns (user_profiles 3 rows,
-- user_mfa_factors 2 rows) — SET NOT NULL is safe.
-- passkey_prompt_dismissed is a stale duplicate renamed to
-- auth_method_enforcer_dismissed — zero code references in BE/FE/US.

ALTER TABLE public.user_profiles
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN is_admin SET NOT NULL;

ALTER TABLE public.user_mfa_factors
  ALTER COLUMN totp_secret_encrypted SET NOT NULL;

ALTER TABLE public.user_profiles
  DROP COLUMN passkey_prompt_dismissed;
