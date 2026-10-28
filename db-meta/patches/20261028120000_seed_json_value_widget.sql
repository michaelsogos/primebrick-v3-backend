-- `app.widgets.json.*` — the shared JsonValueEditor control in
-- @primebrick/ui (collapse toggle + preview⇄edit switch). Mirrors the
-- `app.widgets.schedule_spec.*` seed; `app.smart.json.ai.brainCta` already
-- exists (the AI CTA reuses it).
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.json.preview', 'en-GB', 'Preview', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'en-US', 'Preview', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'it-IT', 'Anteprima', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'de-DE', 'Vorschau', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'fr-FR', 'Aperçu', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'es-ES', 'Vista previa', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.preview', 'pt-PT', 'Pré-visualização', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'en-GB', 'Edit the raw JSON', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'en-US', 'Edit the raw JSON', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'it-IT', 'Modifica il JSON grezzo', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'de-DE', 'Rohes JSON bearbeiten', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'fr-FR', 'Modifier le JSON brut', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'es-ES', 'Editar el JSON bruto', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1),
  ('app.widgets.json.editMode', 'pt-PT', 'Editar o JSON bruto', now(), 'migration-json-value-widget', now(), 'migration-json-value-widget', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
