-- `app.widgets.payload_map.const_array_placeholder` — placeholder for the
-- fixed-value chip composer on array-typed payload_map fields
-- (ComboSelect mode="multi" + allowCreate; elements become badges).
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.const_array_placeholder', 'en-GB', 'Type a value and press Enter…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'en-US', 'Type a value and press Enter…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'it-IT', 'Scrivi un valore e premi Invio…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'de-DE', 'Wert eingeben und Enter drücken…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'fr-FR', 'Saisir une valeur puis Entrée…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'es-ES', 'Escribe un valor y pulsa Enter…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1),
  ('app.widgets.payload_map.const_array_placeholder', 'pt-PT', 'Escreva um valor e prima Enter…', now(), 'migration-payload-map-const-array', now(), 'migration-payload-map-const-array', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
