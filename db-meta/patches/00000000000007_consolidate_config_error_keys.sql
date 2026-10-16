-- Migration 00000000000007: Consolidate duplicate config error keys
-- 1. HARD DELETE 45 duplicate system.settings.config.auth.*.errors.* keys × 6 languages = 270 rows
--    (these replicate values already in app.common.validation.*)
-- 2. UPDATE 4 generic key values in public.translations × 6 languages = 24 rows
--    (normalize wording: remove "characters", change URL/email phrasing)
-- 3. Keep 4 field-specific keys: auth_mode.errors.required, idp_type.errors.required,
--    oidc_client_id.errors.invalidFormat, auth_roles_path.errors.invalidFormat

BEGIN;

-- ─── 1. Hard delete duplicate error keys from system.translations ───

-- 20 *.errors.required duplicates (excluding auth_mode and idp_type)
DELETE FROM system.translations
WHERE key IN (
  'system.settings.config.auth.admin_contact_email.errors.required',
  'system.settings.config.auth.auth_roles_path.errors.required',
  'system.settings.config.auth.enable_email_verification_check.errors.required',
  'system.settings.config.auth.enable_mfa.errors.required',
  'system.settings.config.auth.enable_webauthn.errors.required',
  'system.settings.config.auth.frontend_url.errors.required',
  'system.settings.config.auth.idp_client_id.errors.required',
  'system.settings.config.auth.idp_client_secret.errors.required',
  'system.settings.config.auth.idp_endpoint.errors.required',
  'system.settings.config.auth.idp_organization.errors.required',
  'system.settings.config.auth.invitation_expiry_days.errors.required',
  'system.settings.config.auth.mfa_challenge_signing_secret.errors.required',
  'system.settings.config.auth.mfa_challenge_token_ttl_seconds.errors.required',
  'system.settings.config.auth.notification_alert_secret.errors.required',
  'system.settings.config.auth.oidc_client_id.errors.required',
  'system.settings.config.auth.oidc_client_secret.errors.required',
  'system.settings.config.auth.oidc_issuer_url.errors.required',
  'system.settings.config.auth.passkey_required.errors.required',
  'system.settings.config.auth.password_policy.errors.required',
  'system.settings.config.auth.redis_url.errors.required'
);

-- 10 *.errors.min duplicates
DELETE FROM system.translations
WHERE key IN (
  'system.settings.config.auth.auth_roles_path.errors.min',
  'system.settings.config.auth.idp_client_id.errors.min',
  'system.settings.config.auth.idp_client_secret.errors.min',
  'system.settings.config.auth.idp_organization.errors.min',
  'system.settings.config.auth.invitation_expiry_days.errors.min',
  'system.settings.config.auth.mfa_challenge_signing_secret.errors.min',
  'system.settings.config.auth.mfa_challenge_token_ttl_seconds.errors.min',
  'system.settings.config.auth.notification_alert_secret.errors.min',
  'system.settings.config.auth.oidc_client_id.errors.min',
  'system.settings.config.auth.oidc_client_secret.errors.min'
);

-- 10 *.errors.max duplicates
DELETE FROM system.translations
WHERE key IN (
  'system.settings.config.auth.auth_roles_path.errors.max',
  'system.settings.config.auth.idp_client_id.errors.max',
  'system.settings.config.auth.idp_client_secret.errors.max',
  'system.settings.config.auth.idp_organization.errors.max',
  'system.settings.config.auth.invitation_expiry_days.errors.max',
  'system.settings.config.auth.mfa_challenge_signing_secret.errors.max',
  'system.settings.config.auth.mfa_challenge_token_ttl_seconds.errors.max',
  'system.settings.config.auth.notification_alert_secret.errors.max',
  'system.settings.config.auth.oidc_client_id.errors.max',
  'system.settings.config.auth.oidc_client_secret.errors.max'
);

-- 4 *.errors.invalidUrl duplicates
DELETE FROM system.translations
WHERE key IN (
  'system.settings.config.auth.frontend_url.errors.invalidUrl',
  'system.settings.config.auth.idp_endpoint.errors.invalidUrl',
  'system.settings.config.auth.oidc_issuer_url.errors.invalidUrl',
  'system.settings.config.auth.redis_url.errors.invalidUrl'
);

-- 1 *.errors.invalidEmail duplicate
DELETE FROM system.translations
WHERE key = 'system.settings.config.auth.admin_contact_email.errors.invalidEmail';

-- ─── 2. Normalize generic key values in public.translations ───

-- tooShort: explicit per-language updates (values must match seed patches)
UPDATE public.translations SET value = 'Must be at least {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'en-GB';
UPDATE public.translations SET value = 'Deve essere di almeno {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'it-IT';
UPDATE public.translations SET value = 'Doit contenir au moins {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Debe tener al menos {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'es-ES';
UPDATE public.translations SET value = 'Muss mindestens {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'de-DE';
UPDATE public.translations SET value = 'Deve ter pelo menos {min}', updated_at = now() WHERE key = 'app.common.validation.tooShort' AND language = 'pt-PT';

-- tooLong: explicit per-language updates
UPDATE public.translations SET value = 'Must be at most {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'en-GB';
UPDATE public.translations SET value = 'Deve essere di al massimo {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'it-IT';
UPDATE public.translations SET value = 'Ne doit pas dépasser {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Debe tener como máximo {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'es-ES';
UPDATE public.translations SET value = 'Darf maximal {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'de-DE';
UPDATE public.translations SET value = 'Não deve exceder {max}', updated_at = now() WHERE key = 'app.common.validation.tooLong' AND language = 'pt-PT';

-- invalidUrl: normalize to "Must be a valid URL" pattern per language
UPDATE public.translations SET value = 'Must be a valid URL', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'en-GB';
UPDATE public.translations SET value = 'Deve essere un URL valido', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'it-IT';
UPDATE public.translations SET value = 'Doit être une URL valide', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Debe ser una URL válida', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'es-ES';
UPDATE public.translations SET value = 'Muss eine gültige URL sein', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'de-DE';
UPDATE public.translations SET value = 'Deve ser um URL válido', updated_at = now() WHERE key = 'app.common.validation.invalidUrl' AND language = 'pt-PT';

-- invalidEmail: normalize to "Must be a valid email address" pattern per language
UPDATE public.translations SET value = 'Must be a valid email address', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'en-GB';
UPDATE public.translations SET value = 'Deve essere un indirizzo email valido', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'it-IT';
UPDATE public.translations SET value = 'Doit être une adresse e-mail valide', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Debe ser una dirección de correo válida', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'es-ES';
UPDATE public.translations SET value = 'Muss eine gültige E-Mail-Adresse sein', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'de-DE';
UPDATE public.translations SET value = 'Deve ser um endereço de email válido', updated_at = now() WHERE key = 'app.common.validation.invalidEmail' AND language = 'pt-PT';

COMMIT;
