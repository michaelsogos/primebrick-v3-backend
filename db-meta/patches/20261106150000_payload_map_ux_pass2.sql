-- `app.widgets.payload_map.*` UX pass 2 — wording + restored subtitle:
--  a) `kind.path` shortened to "Proprietà dell'evento" / "Event property"
--     (the source IS an event property — the "message" qualifier was
--     implementation noise for end users);
--  b) `fallback.lead` shortened to "altrimenti, se vuoto," / "otherwise,
--     if empty," — the resolver already treats null/undefined/empty
--     uniformly, the sentence keeps the meaning;
--  c) `subtitle` — restores the descriptive line under the
--     "Mappatura payload" label (the original `empty` text, which was a
--     permanent section subtitle before the empty-state redesign moved
--     `empty` to the icon state title "Niente da fare qui").

UPDATE public.translations t
SET value = v.value, updated_at = now(), updated_by = 'migration-payload-map-ux2'
FROM (VALUES
  ('app.widgets.payload_map.kind.path', 'en-GB', 'Event property'),
  ('app.widgets.payload_map.kind.path', 'en-US', 'Event property'),
  ('app.widgets.payload_map.kind.path', 'it-IT', 'Proprietà dell''evento'),
  ('app.widgets.payload_map.kind.path', 'de-DE', 'Ereignis-Eigenschaft'),
  ('app.widgets.payload_map.kind.path', 'fr-FR', 'Propriété de l''événement'),
  ('app.widgets.payload_map.kind.path', 'es-ES', 'Propiedad del evento'),
  ('app.widgets.payload_map.kind.path', 'pt-PT', 'Propriedade do evento'),
  ('app.widgets.payload_map.fallback.lead', 'en-GB', 'otherwise, if empty,'),
  ('app.widgets.payload_map.fallback.lead', 'en-US', 'otherwise, if empty,'),
  ('app.widgets.payload_map.fallback.lead', 'it-IT', 'altrimenti, se vuoto,'),
  ('app.widgets.payload_map.fallback.lead', 'de-DE', 'sonst, wenn leer,'),
  ('app.widgets.payload_map.fallback.lead', 'fr-FR', 'sinon, si vide,'),
  ('app.widgets.payload_map.fallback.lead', 'es-ES', 'si no, si está vacío,'),
  ('app.widgets.payload_map.fallback.lead', 'pt-PT', 'caso contrário, se vazio,')
) AS v(key, language, value)
WHERE t.key = v.key AND t.language = v.language AND t.deleted_at IS NULL;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.subtitle', 'en-GB', 'Pick a destination to map its request fields — an empty map forwards the event payload unchanged.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'en-US', 'Pick a destination to map its request fields — an empty map forwards the event payload unchanged.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'it-IT', 'Scegli una destinazione per mappare i campi della richiesta — una mappa vuota inoltra il payload dell''evento invariato.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'de-DE', 'Ziel wählen, um die Anfragefelder zu mappen — eine leere Zuordnung leitet die Ereignis-Payload unverändert weiter.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'fr-FR', 'Choisir une destination pour mapper ses champs de requête — un mappage vide transmet le payload de l''événement tel quel.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'es-ES', 'Elegir un destino para mapear sus campos de solicitud — un mapeo vacío reenvía el payload del evento sin cambios.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1),
  ('app.widgets.payload_map.subtitle', 'pt-PT', 'Escolher um destino para mapear seus campos de solicitação — um mapeamento vazio reencaminha o payload do evento sem alterações.', now(), 'migration-payload-map-ux2', now(), 'migration-payload-map-ux2', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
