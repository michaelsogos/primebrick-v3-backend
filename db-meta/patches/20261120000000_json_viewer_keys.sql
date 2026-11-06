-- JSON viewer panel labels — `app.common.explorer` / `app.common.raw`
-- title the two read-only views inside the registered `entity.jsonViewer`
-- sheet panel (Explorer = collapsible tree, Raw = formatted JSON text).
-- The braces CTA label itself is the existing `app.common.view` key.
--
-- Copy tone: user-facing, no wire-format jargon (per copy-tone-of-voice).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.explorer', 'en-GB', 'Explorer', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'en-US', 'Explorer', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'it-IT', 'Esplora', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'de-DE', 'Explorer', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'fr-FR', 'Explorateur', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'es-ES', 'Explorador', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.explorer', 'pt-PT', 'Explorador', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),

  ('app.common.raw', 'en-GB', 'Raw', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'en-US', 'Raw', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'it-IT', 'Grezzo', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'de-DE', 'Roh', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'fr-FR', 'Brut', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'es-ES', 'Sin formato', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1),
  ('app.common.raw', 'pt-PT', 'Bruto', now(), 'migration-json-viewer', now(), 'migration-json-viewer', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
