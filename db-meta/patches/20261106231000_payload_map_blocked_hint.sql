-- `map_blocked` — hint shown when a `x_map_keys.from` dependency is
-- unresolved (e.g. `variables` needs a chosen `templateCode` first).
-- `{field}` interpolates the blocking field's name — dynamic, driven by
-- the same schema metadata that builds the rows.
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  ('app.widgets.payload_map.map_blocked', 'en-GB', 'Pick a value for {field} first — the keys here depend on it.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'en-US', 'Pick a value for {field} first — the keys here depend on it.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'it-IT', 'Scegli prima un valore per {field} — le chiavi qui dipendono da quello.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'de-DE', 'Wähle zuerst einen Wert für {field} — die Schlüssel hier hängen davon ab.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'fr-FR', 'Choisissez d''abord une valeur pour {field} — les clés ici en dépendent.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'es-ES', 'Elige primero un valor para {field} — las claves aquí dependen de ello.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1),
  ('app.widgets.payload_map.map_blocked', 'pt-PT', 'Escolha primeiro um valor para {field} — as chaves aqui dependem disso.', now(), 'migration-payload-map-blocked', now(), 'migration-payload-map-blocked', 1)
ON CONFLICT (key, language) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-payload-map-blocked', version = translations.version + 1;
