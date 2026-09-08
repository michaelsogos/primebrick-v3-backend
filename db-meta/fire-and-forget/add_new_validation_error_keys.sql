-- Fire-and-forget patch: Add new validation error keys for email/phone/url types
-- These keys are new in the SDK 0.6.0+ and FE — they don't exist in the live DB.
-- The existing keys (required, invalidBigint, invalidUrl, invalidEmail, tooShort, tooLong, etc.)
-- are already in the live DB from the original seed patches.
-- Only the 3 truly new keys need this fire-and-forget INSERT.

BEGIN;

-- invalidPhone: new key for phone type validation (libphonenumber-js)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.invalidPhone', 'en-GB', 'Must be a valid phone number', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidPhone', 'it-IT', 'Deve essere un numero di telefono valido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidPhone', 'fr-FR', 'Doit être un numéro de téléphone valide', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidPhone', 'es-ES', 'Debe ser un número de teléfono válido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidPhone', 'de-DE', 'Muss eine gültige Telefonnummer sein', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidPhone', 'pt-PT', 'Deve ser um número de telefone válido', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- invalidUrlProtocol: new key for URL protocol validation (type_config.allowed_protocols)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.invalidUrlProtocol', 'en-GB', 'Protocol not allowed', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidUrlProtocol', 'it-IT', 'Protocollo non consentito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidUrlProtocol', 'fr-FR', 'Protocole non autorisé', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidUrlProtocol', 'es-ES', 'Protocolo no permitido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidUrlProtocol', 'de-DE', 'Protokoll nicht erlaubt', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidUrlProtocol', 'pt-PT', 'Protocolo não permitido', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- invalidRegexPattern: new key for invalid regex pattern in config (configuration error)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.invalidRegexPattern', 'en-GB', 'Invalid regex pattern in configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidRegexPattern', 'it-IT', 'Pattern regex non valido nella configurazione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidRegexPattern', 'fr-FR', 'Modèle regex invalide dans la configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidRegexPattern', 'es-ES', 'Patrón regex no válido en la configuración', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidRegexPattern', 'de-DE', 'Ungültiges Regex-Muster in der Konfiguration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.invalidRegexPattern', 'pt-PT', 'Padrão regex inválido na configuração', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- regexMismatch: new key for regex rule failure (value doesn't match the pattern)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.regexMismatch', 'en-GB', 'Value does not match the required format', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.regexMismatch', 'it-IT', 'Il valore non corrisponde al formato richiesto', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.regexMismatch', 'fr-FR', 'La valeur ne correspond pas au format requis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.regexMismatch', 'es-ES', 'El valor no coincide con el formato requerido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.regexMismatch', 'de-DE', 'Der Wert entspricht nicht dem erforderlichen Format', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.validation.regexMismatch', 'pt-PT', 'O valor não corresponde ao formato exigido', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
