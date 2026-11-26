-- ReviveIntervalInput mode-toggle labels (missed in task 13c — the widget
-- renders raw keys without them): app.widgets.revive_interval.mode.{every|at|until}
-- 7 languages incl. pt-PT.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'en-GB', 'Every', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'en-US', 'Every', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'it-IT', 'Ogni', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'fr-FR', 'Tous les', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'es-ES', 'Cada', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'de-DE', 'Alle', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.every', 'pt-PT', 'Cada', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),

  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'en-GB', 'On', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'en-US', 'On', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'it-IT', 'Il', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'fr-FR', 'Le', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'es-ES', 'El', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'de-DE', 'Am', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.at', 'pt-PT', 'Em', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),

  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'en-GB', 'By', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'en-US', 'By', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'it-IT', 'Entro il', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'fr-FR', 'Avant le', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'es-ES', 'Antes del', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'de-DE', 'Bis zum', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1),
  (uuidv7(), 'app.widgets.revive_interval.mode.until', 'pt-PT', 'Até', now(), 'migration-revive-mode-keys', now(), 'migration-revive-mode-keys', 1);
