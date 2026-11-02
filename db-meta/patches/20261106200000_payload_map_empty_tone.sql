-- `app.widgets.payload_map.empty` — tone-of-voice fix: positive confirmation
-- ("everything is fine, nothing to map for the selected destination")
-- replaces the informal "Niente da fare qui" wording.
UPDATE public.translations AS t
SET value = v.value, updated_at = now(), updated_by = 'migration-payload-map-empty-tone', version = t.version + 1
FROM (VALUES
  ('app.widgets.payload_map.empty', 'en-GB', 'All good! Nothing needs mapping for the selected event destination.'),
  ('app.widgets.payload_map.empty', 'en-US', 'All good! Nothing needs mapping for the selected event destination.'),
  ('app.widgets.payload_map.empty', 'it-IT', 'Tutto OK! Non serve mappare niente per la destinazione evento selezionata.'),
  ('app.widgets.payload_map.empty', 'de-DE', 'Alles OK! Für das ausgewählte Ereignisziel ist kein Mapping nötig.'),
  ('app.widgets.payload_map.empty', 'fr-FR', 'Tout est OK ! Aucun mappage nécessaire pour la destination d''événement sélectionnée.'),
  ('app.widgets.payload_map.empty', 'es-ES', '¡Todo bien! No hace falta mapear nada para el destino de evento seleccionado.'),
  ('app.widgets.payload_map.empty', 'pt-PT', 'Tudo OK! Não é preciso mapear nada para o destino de evento selecionado.')
) AS v(key, language, value)
WHERE t.key = v.key AND t.language = v.language AND t.deleted_at IS NULL;
