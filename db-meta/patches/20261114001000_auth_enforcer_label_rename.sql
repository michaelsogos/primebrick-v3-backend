-- Primebrick: auth_method_enforcer_dismissed — label semantics fix.
--
-- The field is an internal user_profile flag (set when the user dismisses
-- the post-login "set up a stronger sign-in method" reminder). The previous
-- labels framed it as a "verification skipped" — wrong semantics and an IT
-- string the user rejected. New semantic: "advanced authentication
-- reminder dismissed", consistent across all 7 supported languages.
-- The column is now `hidden:true` in user-profiles.meta.ts (internal flag —
-- suppressed from every entity surface); labels stay for API consumers.

UPDATE system.translations SET value = 'Advanced Authentication Reminder Dismissed', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'en-GB';
UPDATE system.translations SET value = 'Advanced Authentication Reminder Dismissed', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'en-US';
UPDATE system.translations SET value = 'Promemoria di Autenticazione Avanzata Ignorato', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'it-IT';
UPDATE system.translations SET value = 'Rappel d''Authentification Avancée Ignoré', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Recordatorio de Autenticación Avanzada Ignorado', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'es-ES';
UPDATE system.translations SET value = 'Erinnerung an Erweiterte Authentifizierung Ignoriert', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'de-DE';
UPDATE system.translations SET value = 'Lembrete de Autenticação Avançada Ignorado', updated_at = now(), updated_by = 'migration-auth-enforcer-label', version = version + 1
  WHERE key = 'system.entities.user_profile.fields.auth_method_enforcer_dismissed' AND language = 'pt-PT';
