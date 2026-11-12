-- Primebrick: user_profile internal auth-flow flags — field labels.
--
-- `auth_method_enforcer_dismissed` and `onboarding_completed` are physical
-- columns on user_profiles that were auto-derived into the served meta with
-- generated `label_key`s that no dictionary held — every meta consumer
-- (column picker, filter labels, record sheet) rendered the raw key.
-- The columns are now DECLARED in user-profiles.meta.ts; this patch seeds
-- their `system.entities.user_profile.fields.*` labels for all languages.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'en-GB', 'Auth Method Enforcer Dismissed', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'en-GB', 'Onboarding Completed', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'en-US', 'Auth Method Enforcer Dismissed', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'en-US', 'Onboarding Completed', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'it-IT', 'Verifica Metodo di Accesso Ignorata', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'it-IT', 'Onboarding Completato', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'fr-FR', 'Vérification de Méthode d''Accès Ignorée', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'fr-FR', 'Onboarding Terminé', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'es-ES', 'Verificación de Método de Acceso Ignorada', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'es-ES', 'Onboarding Completado', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'de-DE', 'Anmeldeverfahren-Prüfung Ignoriert', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'de-DE', 'Onboarding Abgeschlossen', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.auth_method_enforcer_dismissed', 'pt-PT', 'Verificação de Método de Acesso Ignorada', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.entities.user_profile.fields.onboarding_completed', 'pt-PT', 'Onboarding Concluído', now(), 'initial-setup', now(), 'initial-setup', 1);

-- Record-sheet audit section label (`system.common.*` shared vocabulary —
-- the sheet pins `column.audited` fields behind a divider).
INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.common.sections.audit', 'en-GB', 'Audit', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'en-US', 'Audit', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'it-IT', 'Audit', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'fr-FR', 'Audit', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'es-ES', 'Auditoría', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'de-DE', 'Audit', now(), 'initial-setup', now(), 'initial-setup', 1),
  (uuidv7(), 'system.common.sections.audit', 'pt-PT', 'Auditoria', now(), 'initial-setup', now(), 'initial-setup', 1);
