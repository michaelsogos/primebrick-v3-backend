-- `app.common.draftRestoredTitle` — the toast TITLE line shown when a
-- browser-refresh draft is replayed (the entity name moved to a tag badge,
-- the tone is informational — see EntityFormPage's toastImpact override).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.draftRestoredTitle', 'en-GB', 'Restored from your last session', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'en-US', 'Restored from your last session', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'it-IT', 'Dati ricaricati dall''ultima sessione', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'de-DE', 'Daten aus der letzten Sitzung geladen', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'fr-FR', 'Données rechargées de la dernière session', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'es-ES', 'Datos recargados de la última sesión', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1),
  ('app.common.draftRestoredTitle', 'pt-PT', 'Dados recarregados da última sessão', now(), 'migration-draft-restored-title', now(), 'migration-draft-restored-title', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
