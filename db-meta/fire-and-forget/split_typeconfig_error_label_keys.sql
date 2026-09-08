-- Fire-and-forget: split generic typeConfig.errorLabelKey into 5 specific keys
-- and clean "(optional)" / "(opzionale)" / "(optionnel)" etc. from labels that
-- now have the FormLabelWithPriorityHelp tooltip in the FE.
--
-- New keys (replacing the generic errorLabelKey):
--   typeConfig.minErrorLabelKey    — "Translation key for min_length error"
--   typeConfig.maxErrorLabelKey    — "Translation key for max_length error"
--   typeConfig.urlErrorLabelKey    — "Translation key for invalid_url error"
--   typeConfig.regexErrorLabelKey  — "Translation key for regex_mismatch error"
--   (requiredErrorLabelKey already exists, just cleaned of "(optional)")
--
-- Cleaned keys (removed "(optional)" suffix — tooltip handles it now):
--   typeConfig.requiredErrorLabelKey
--   typeConfig.regexPattern
--
-- The old typeConfig.errorLabelKey is kept for backward compatibility but is
-- no longer referenced by the FE.
--
-- This script is idempotent: ON CONFLICT DO UPDATE ensures values are corrected
-- even if the keys already exist from the initial seed.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- ─── New keys: minErrorLabelKey ───────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.settings.config.typeConfig.minErrorLabelKey', 'en-GB', 'Translation key for min_length error', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.minErrorLabelKey', 'it-IT', 'Chiave di traduzione per l''errore "min_length"', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.minErrorLabelKey', 'fr-FR', 'Clé de traduction pour l''erreur « min_length »', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.minErrorLabelKey', 'de-DE', 'Übersetzungsschlüssel für „min_length"-Fehler', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.minErrorLabelKey', 'es-ES', 'Clave de traducción para el error «min_length»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.minErrorLabelKey', 'pt-PT', 'Chave de tradução para o erro «min_length»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by, version = system.translations.version + 1;

-- ─── New keys: maxErrorLabelKey ───────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.settings.config.typeConfig.maxErrorLabelKey', 'en-GB', 'Translation key for max_length error', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.maxErrorLabelKey', 'it-IT', 'Chiave di traduzione per l''errore "max_length"', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.maxErrorLabelKey', 'fr-FR', 'Clé de traduction pour l''erreur « max_length »', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.maxErrorLabelKey', 'de-DE', 'Übersetzungsschlüssel für „max_length"-Fehler', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.maxErrorLabelKey', 'es-ES', 'Clave de traducción para el error «max_length»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.maxErrorLabelKey', 'pt-PT', 'Chave de tradução para o erro «max_length»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by, version = system.translations.version + 1;

-- ─── New keys: urlErrorLabelKey ───────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.settings.config.typeConfig.urlErrorLabelKey', 'en-GB', 'Translation key for invalid_url error', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.urlErrorLabelKey', 'it-IT', 'Chiave di traduzione per l''errore "invalid_url"', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.urlErrorLabelKey', 'fr-FR', 'Clé de traduction pour l''erreur « invalid_url »', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.urlErrorLabelKey', 'de-DE', 'Übersetzungsschlüssel für „invalid_url"-Fehler', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.urlErrorLabelKey', 'es-ES', 'Clave de traducción para el error «invalid_url»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.urlErrorLabelKey', 'pt-PT', 'Chave de tradução para o erro «invalid_url»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by, version = system.translations.version + 1;

-- ─── New keys: regexErrorLabelKey ─────────────────────────────────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
('system.settings.config.typeConfig.regexErrorLabelKey', 'en-GB', 'Translation key for regex_mismatch error', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.regexErrorLabelKey', 'it-IT', 'Chiave di traduzione per l''errore "regex_mismatch"', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.regexErrorLabelKey', 'fr-FR', 'Clé de traduction pour l''erreur « regex_mismatch »', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.regexErrorLabelKey', 'de-DE', 'Übersetzungsschlüssel für „regex_mismatch"-Fehler', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.regexErrorLabelKey', 'es-ES', 'Clave de traducción para el error «regex_mismatch»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1),
('system.settings.config.typeConfig.regexErrorLabelKey', 'pt-PT', 'Chave de tradução para o erro «regex_mismatch»', '2026-09-06T00:00:00Z', 'initial-setup', '2026-09-06T00:00:00Z', 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by, version = system.translations.version + 1;

-- ─── Clean "(optional)" from requiredErrorLabelKey ────────────────
-- The FE now shows the tooltip with "(optional)" badge, so the label text
-- itself must not duplicate it.
UPDATE system.translations SET value = 'Required error label key', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Chiave etichetta errore obbligatoria', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Clé d''étiquette d''erreur requise', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Erforderlicher Fehlerbezeichnungsschlüssel', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Clave de etiqueta de error requerida', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Chave de etiqueta de erro obrigatória', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.requiredErrorLabelKey' AND language = 'pt-PT' AND deleted_at IS NULL;

-- ─── Clean "(opzionale)" / "(optional)" from regexPattern ─────────
UPDATE system.translations SET value = 'Regex pattern', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Pattern regex', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Modèle regex', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Regex-Muster', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Patrón regex', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Padrão regex', updated_at = '2026-09-06T00:00:00Z', updated_by = 'initial-setup', version = version + 1
WHERE key = 'system.settings.config.typeConfig.regexPattern' AND language = 'pt-PT' AND deleted_at IS NULL;

COMMIT;
