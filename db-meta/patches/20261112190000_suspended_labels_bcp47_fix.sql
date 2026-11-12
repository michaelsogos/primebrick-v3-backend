-- BCP-47 repair for the suspended vocabulary seeded by
-- 20261112105749_user_profile_lifecycle_suspended and
-- 20261112110500_user_profile_suspended_label: those patches wrote language
-- codes 'en','it','de','es','pt','fr','nl' but the app only requests full
-- tags (en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT) — every suspended
-- label (and the suspend/reactivate row actions) rendered the raw key.
-- 'nl' is not a supported locale at all; en-US was missing entirely.

DELETE FROM system.translations
WHERE key IN (
  'system.entities.user_profile.fields.suspended',
  'system.entities.user_profile.fields.suspended_at',
  'system.entities.user_profile.fields.suspended_by',
  'system.settings.users.suspend',
  'system.settings.users.reactivate'
)
AND language NOT IN ('en-GB', 'en-US', 'it-IT', 'fr-FR', 'es-ES', 'de-DE', 'pt-PT');

-- Re-seed the affected keys for all seven UI locales (en-GB = en-US).
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'en-GB', 'Suspended', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'en-US', 'Suspended', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'it-IT', 'Sospeso', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'fr-FR', 'Suspendu', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'es-ES', 'Suspendido', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'de-DE', 'Gesperrt', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended', 'pt-PT', 'Suspenso', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'en-GB', 'Suspended At', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'en-US', 'Suspended At', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'it-IT', 'Sospeso il', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'fr-FR', 'Suspendu le', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'es-ES', 'Suspendido el', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'de-DE', 'Gesperrt am', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_at', 'pt-PT', 'Suspenso em', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'en-GB', 'Suspended By', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'en-US', 'Suspended By', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'it-IT', 'Sospeso da', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'fr-FR', 'Suspendu par', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'es-ES', 'Suspendido por', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'de-DE', 'Gesperrt von', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.suspended_by', 'pt-PT', 'Suspenso por', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.settings.users.suspend', 'en-GB', 'Suspend', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'en-US', 'Suspend', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'it-IT', 'Sospendi', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'fr-FR', 'Suspendre', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'es-ES', 'Suspender', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'de-DE', 'Sperren', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.suspend', 'pt-PT', 'Suspender', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.settings.users.reactivate', 'en-GB', 'Reactivate', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'en-US', 'Reactivate', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'it-IT', 'Riattiva', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'fr-FR', 'Réactiver', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'es-ES', 'Reactivar', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'de-DE', 'Reaktivieren', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.settings.users.reactivate', 'pt-PT', 'Reativar', now(), 'initial-setup', now(), 'initial-setup', 1);

-- Generic record-sheet lifecycle badge vocabulary (system.common.* shared
-- family, same as system.common.fields.* / system.common.sections.*).
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.common.status.suspended', 'en-GB', 'Suspended', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'en-US', 'Suspended', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'it-IT', 'Sospeso', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'fr-FR', 'Suspendu', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'es-ES', 'Suspendido', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'de-DE', 'Gesperrt', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.suspended', 'pt-PT', 'Suspenso', now(), 'initial-setup', now(), 'initial-setup', 1),

  (uuidv7(), 'system.common.status.deleted', 'en-GB', 'Deleted', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'en-US', 'Deleted', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'it-IT', 'Eliminato', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'fr-FR', 'Supprimé', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'es-ES', 'Eliminado', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'de-DE', 'Gelöscht', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.status.deleted', 'pt-PT', 'Eliminado', now(), 'initial-setup', now(), 'initial-setup', 1);
