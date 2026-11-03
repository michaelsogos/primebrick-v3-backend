-- `app.widgets.payload_map.map.optional_keys` — the accordion header for
-- a map field's OPTIONAL declared keys (e.g. template variables that may
-- be left unmapped). Mirrors the field-level optional accordion contract
-- inside the map block. Required declared keys seed as rows immediately
-- and need no label — the `*` marker on their identity cell says it.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.map.optional_keys', 'en-GB', 'Optional variables ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'en-US', 'Optional variables ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'it-IT', 'Variabili opzionali ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'de-DE', 'Optionale Variablen ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'fr-FR', 'Variables facultatives ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'es-ES', 'Variables opcionales ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1),
  ('app.widgets.payload_map.map.optional_keys', 'pt-PT', 'Variáveis opcionais ({count})', now(), 'migration-map-optional-keys', now(), 'migration-map-optional-keys', 1)
ON CONFLICT (key, language) DO NOTHING;
