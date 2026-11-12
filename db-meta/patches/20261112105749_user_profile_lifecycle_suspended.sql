-- user_profile field lifecycle: drop vestigial is_active (disable = soft-delete),
-- rename IDP-mirror columns to idp_* vocabulary, add suspended_at/suspended_by
-- (audit pair — suspension survives retention purge, unlike deleted state).

ALTER TABLE public.user_profiles DROP COLUMN is_active;
ALTER TABLE public.user_profiles RENAME COLUMN is_admin TO idp_is_admin;
ALTER TABLE public.user_profiles RENAME COLUMN is_verified TO idp_is_verified;
ALTER TABLE public.user_profiles RENAME COLUMN email_verified TO idp_email_verified;
ALTER TABLE public.user_profiles RENAME COLUMN issuer TO idp_issuer;
ALTER TABLE public.user_profiles ADD COLUMN suspended_at timestamptz;
ALTER TABLE public.user_profiles ADD COLUMN suspended_by uuid;

-- Labels for the new audit pair + suspend/reactivate actions (7 languages).
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version) OVERRIDING SYSTEM VALUE VALUES
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'en', 'Suspended At', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'it', 'Sospeso il', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'de', 'Gesperrt am', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'es', 'Suspendido el', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'pt', 'Suspenso em', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'fr', 'Suspendu le', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_at', 'nl', 'Opgeschort op', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'en', 'Suspended By', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'it', 'Sospeso da', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'de', 'Gesperrt von', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'es', 'Suspendido por', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'pt', 'Suspenso por', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'fr', 'Suspendu par', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.entities.user_profile.fields.suspended_by', 'nl', 'Opgeschort door', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'en', 'Suspend', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'it', 'Sospendi', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'de', 'Sperren', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'es', 'Suspender', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'pt', 'Suspender', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'fr', 'Suspendre', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.suspend', 'nl', 'Opschorten', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'en', 'Reactivate', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'it', 'Riattiva', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'de', 'Reaktivieren', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'es', 'Reactivar', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'pt', 'Reativar', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'fr', 'Réactiver', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1),
  (gen_random_uuid(), 'system.settings.users.reactivate', 'nl', 'Heractiveren', '2026-11-12 10:57:49+00', 'system', '2026-11-12 10:57:49+00', 'system', 1);
