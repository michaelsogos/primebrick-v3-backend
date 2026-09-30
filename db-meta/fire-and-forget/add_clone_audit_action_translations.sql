-- Fire-and-forget: `CLONE` audit action label (E.8). The DAL now writes an
-- audit row with action `CLONE` when a record is created by cloning — the
-- version history panel resolves `system.entities.versionHistory.actions.CLONE`
-- for the badge label. All keys in system.translations, 7 languages.
-- Idempotent via the partial unique index (key, language) WHERE deleted_at IS NULL.

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.versionHistory.actions.CLONE', 'en-GB', 'Cloned', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'en-US', 'Cloned', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'it-IT', 'Clonato', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'fr-FR', 'Cloné', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'es-ES', 'Clonado', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'de-DE', 'Geklont', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.versionHistory.actions.CLONE', 'pt-PT', 'Clonado', now(), 'initial-setup', now(), 'initial-setup', 1);

COMMIT;
