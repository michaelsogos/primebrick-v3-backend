-- Primebrick: confirm-gate convergence (ELT task 17) — governed confirm
-- copy for the user_profile lifecycle custom ops. `actions_overrides`
-- in user-profiles.meta.ts now attaches confirm_key/busy_key/color to
-- the route-derived `suspend` and `reactivate` ops; the op-confirm
-- dialogs interpolate `{entity}` (definite entity label) and append the
-- record name automatically.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.settings.users.suspend_confirm', 'en-GB', 'Suspend {entity}? They will not be able to sign in until reactivated.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'en-US', 'Suspend {entity}? They will not be able to sign in until reactivated.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'it-IT', 'Sospendere {entity}? Non potrà accedere finché non sarà riattivato.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'fr-FR', 'Suspendre {entity} ? Il ne pourra pas se connecter tant qu''il n''aura pas été réactivé.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'es-ES', '¿Suspender {entity}? No podrá iniciar sesión hasta que sea reactivado.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'de-DE', '{entity} sperren? Sie können sich nicht anmelden, bis sie reaktiviert werden.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspend_confirm', 'pt-PT', 'Suspender {entity}? Não poderá iniciar sessão até ser reativado.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'en-GB', 'Suspending…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'en-US', 'Suspending…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'it-IT', 'Sospensione…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'fr-FR', 'Suspension…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'es-ES', 'Suspendiendo…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'de-DE', 'Sperrung…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.suspending', 'pt-PT', 'A suspender…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'en-GB', 'Reactivate {entity}? They will be able to sign in again.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'en-US', 'Reactivate {entity}? They will be able to sign in again.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'it-IT', 'Riattivare {entity}? Potrà accedere di nuovo.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'fr-FR', 'Réactiver {entity} ? Il pourra se connecter à nouveau.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'es-ES', '¿Reactivar {entity}? Podrá iniciar sesión de nuevo.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'de-DE', '{entity} reaktivieren? Sie können sich wieder anmelden.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivate_confirm', 'pt-PT', 'Reativar {entity}? Poderá iniciar sessão novamente.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'en-GB', 'Reactivating…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'en-US', 'Reactivating…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'it-IT', 'Riattivazione…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'fr-FR', 'Réactivation…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'es-ES', 'Reactivando…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'de-DE', 'Reaktivierung…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.settings.users.reactivating', 'pt-PT', 'A reativar…', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
