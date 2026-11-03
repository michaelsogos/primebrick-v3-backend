-- `app.common.draftRestored` — the informational notification the entity
-- form shows when a browser-refresh draft is replayed (tainted fields
-- restored over the fresh baseline). `{count}` = restored fields.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.draftRestored', 'en-GB', 'Draft restored ({count} fields)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'en-US', 'Draft restored ({count} fields)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'it-IT', 'Bozza ripristinata ({count} campi)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'de-DE', 'Entwurf wiederhergestellt ({count} Felder)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'fr-FR', 'Brouillon restauré ({count} champs)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'es-ES', 'Borrador restaurado ({count} campos)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1),
  ('app.common.draftRestored', 'pt-PT', 'Rascunho restaurado ({count} campos)', now(), 'migration-draft-restored', now(), 'migration-draft-restored', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
