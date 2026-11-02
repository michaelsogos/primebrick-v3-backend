-- `app.widgets.payload_map` empty-state rewrite — when the user has no
-- mapping task (no mappable contract, or every field is a system-owned
-- setter materialized by the platform) the editor collapses into a
-- prominent info state: animated braces icon + "Niente da fare qui".
-- Two contextual subtitles: `empty_hint` (no contract selected yet —
-- tells the user WHAT unlocks the editor) and `empty_passthrough` (a
-- contract exists but exposes zero user fields — the payload is
-- forwarded as is and system fields are handled automatically).

-- a) rewrite the title of the empty state (was a long instructional sentence)
UPDATE public.translations t
SET value = v.value, updated_at = now(), updated_by = 'migration-payload-map-empty'
FROM (VALUES
  ('app.widgets.payload_map.empty', 'en-GB', 'Nothing to do here'),
  ('app.widgets.payload_map.empty', 'en-US', 'Nothing to do here'),
  ('app.widgets.payload_map.empty', 'it-IT', 'Niente da fare qui'),
  ('app.widgets.payload_map.empty', 'de-DE', 'Hier gibt es nichts zu tun'),
  ('app.widgets.payload_map.empty', 'fr-FR', 'Rien à faire ici'),
  ('app.widgets.payload_map.empty', 'es-ES', 'Nada que hacer aquí'),
  ('app.widgets.payload_map.empty', 'pt-PT', 'Nada a fazer aqui')
) AS v(key, language, value)
WHERE t.key = v.key AND t.language = v.language AND t.deleted_at IS NULL;

-- b) new contextual subtitles
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.empty_hint', 'en-GB', 'Select the event and the destination — the fields to map will appear here.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'en-US', 'Select the event and the destination — the fields to map will appear here.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'it-IT', 'Seleziona l''evento e la destinazione: i campi da mappare appariranno qui.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'de-DE', 'Ereignis und Ziel wählen — die zu mappenden Felder erscheinen hier.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'fr-FR', 'Sélectionnez l''événement et la destination : les champs à mapper apparaîtront ici.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'es-ES', 'Selecciona el evento y el destino: los campos a mapear aparecerán aquí.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_hint', 'pt-PT', 'Selecione o evento e o destino — os campos a mapear aparecerão aqui.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'en-GB', 'The payload is forwarded as is — system fields are handled automatically.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'en-US', 'The payload is forwarded as is — system fields are handled automatically.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'it-IT', 'Il payload viene inoltrato così com''è — i campi di sistema sono gestiti automaticamente.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'de-DE', 'Die Payload wird unverändert weitergeleitet — Systemfelder werden automatisch verwaltet.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'fr-FR', 'Le payload est transmis tel quel — les champs système sont gérés automatiquement.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'es-ES', 'El payload se reenvía tal cual — los campos del sistema se gestionan automáticamente.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1),
  ('app.widgets.payload_map.empty_passthrough', 'pt-PT', 'O payload é reencaminhado tal como está — os campos de sistema são geridos automaticamente.', now(), 'migration-payload-map-empty', now(), 'migration-payload-map-empty', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
