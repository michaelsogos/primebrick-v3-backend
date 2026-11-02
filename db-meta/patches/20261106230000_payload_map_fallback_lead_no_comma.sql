-- `fallback.lead` — drop the trailing comma (it reads awkward before the
-- inline source control).
UPDATE public.translations AS t
SET value = v.value, updated_at = now(), updated_by = 'migration-payload-map-lead-nocomma', version = t.version + 1
FROM (VALUES
  ('app.widgets.payload_map.fallback.lead', 'en-GB', 'otherwise, if empty'),
  ('app.widgets.payload_map.fallback.lead', 'en-US', 'otherwise, if empty'),
  ('app.widgets.payload_map.fallback.lead', 'it-IT', 'altrimenti, se vuoto'),
  ('app.widgets.payload_map.fallback.lead', 'de-DE', 'sonst, wenn leer'),
  ('app.widgets.payload_map.fallback.lead', 'fr-FR', 'sinon, si vide'),
  ('app.widgets.payload_map.fallback.lead', 'es-ES', 'si no, si está vacío'),
  ('app.widgets.payload_map.fallback.lead', 'pt-PT', 'caso contrário, se vazio')
) AS v(key, language, value)
WHERE t.key = v.key AND t.language = v.language AND t.deleted_at IS NULL;
