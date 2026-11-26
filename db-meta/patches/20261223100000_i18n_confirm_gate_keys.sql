-- Primebrick: confirm-gate convergence (ELT task 16) — new UI keys.
--
-- public.translations (app.* vocabulary):
--   app.common.unsaved_changes_title — dialog title for the governed
--     unsaved-changes guard (module pages keep their own scoped
--     *.unsaved_changes keys for the question text).
--   app.common.leave — confirm CTA of the same dialog.
--   app.common.popup_blocked — pushNotification shown when window.open
--     returns null (replaces the banned native alert()).
--
-- system.translations (system.* vocabulary):
--   system.entities.translation.{singular,plural,singular_definite} —
--     the translations settings page deletes rows through the governed
--     op-confirm dialogs, which resolve entity labels under
--     <ns>.entities.<entity>.*; no translation key existed for the
--     translation entity itself.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.unsaved_changes_title', 'en-GB', 'Unsaved changes', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'en-US', 'Unsaved changes', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'it-IT', 'Modifiche non salvate', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'fr-FR', 'Modifications non enregistrées', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'es-ES', 'Cambios sin guardar', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'de-DE', 'Ungespeicherte Änderungen', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.unsaved_changes_title', 'pt-PT', 'Alterações não guardadas', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'en-GB', 'Leave', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'en-US', 'Leave', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'it-IT', 'Esci', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'fr-FR', 'Quitter', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'es-ES', 'Salir', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'de-DE', 'Verlassen', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.leave', 'pt-PT', 'Sair', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'en-GB', 'Popup blocked by the browser. Check your settings.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'en-US', 'Popup blocked by the browser. Check your settings.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'it-IT', 'Popup bloccato dal browser. Controlla le impostazioni.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'fr-FR', 'Fenêtre contextuelle bloquée par le navigateur. Vérifiez vos paramètres.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'es-ES', 'Ventana emergente bloqueada por el navegador. Compruebe su configuración.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'de-DE', 'Pop-up vom Browser blockiert. Prüfen Sie Ihre Einstellungen.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'app.common.popup_blocked', 'pt-PT', 'Pop-up bloqueado pelo navegador. Verifique as suas definições.', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'system.entities.translation.singular', 'en-GB', 'Translation', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'en-US', 'Translation', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'it-IT', 'Traduzione', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'fr-FR', 'Traduction', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'es-ES', 'Traducción', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'de-DE', 'Übersetzung', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular', 'pt-PT', 'Tradução', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'en-GB', 'Translations', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'en-US', 'Translations', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'it-IT', 'Traduzioni', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'fr-FR', 'Traductions', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'es-ES', 'Traducciones', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'de-DE', 'Übersetzungen', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.plural', 'pt-PT', 'Traduções', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'en-GB', 'the Translation', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'en-US', 'the Translation', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'it-IT', 'la Traduzione', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'fr-FR', 'la Traduction', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'es-ES', 'la Traducción', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'de-DE', 'die Übersetzung', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1),
  (uuidv7(), 'system.entities.translation.singular_definite', 'pt-PT', 'a Tradução', now(), 'migration-confirm-gate-i18n', now(), 'migration-confirm-gate-i18n', 1)
ON CONFLICT (key, language) DO NOTHING;
