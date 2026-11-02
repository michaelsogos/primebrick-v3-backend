-- `app.widgets.payload_map.optional` — accordion toggle label for the
-- non-required tail of PayloadMapEditor rows ({count} = field count).
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.optional', 'en-GB', 'Optional fields ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'en-US', 'Optional fields ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'it-IT', 'Campi opzionali ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'de-DE', 'Optionale Felder ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'fr-FR', 'Champs optionnels ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'es-ES', 'Campos opcionales ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1),
  ('app.widgets.payload_map.optional', 'pt-PT', 'Campos opcionais ({count})', now(), 'migration-payload-map-optional', now(), 'migration-payload-map-optional', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
