-- `app.widgets.payload_map.issue.required` / `issue.invalid` — the
-- per-input hints shown when the shared `payloadMapConformance` predicate
-- flags a field: an unmapped required destination field (mark lands on
-- the source picker) or a `const` value violating the callable's emitted
-- payload_schema (mark lands on the value input). The `{message}`
-- placeholder interpolates the engine's issue detail — consistent with
-- the zod field messages the forms already surface verbatim.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.widgets.payload_map.issue.required', 'en-GB', 'Required — pick where the value comes from', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'en-US', 'Required — pick where the value comes from', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'it-IT', 'Obbligatorio — scegli da dove arriva il valore', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'de-DE', 'Pflichtfeld — wähle, woher der Wert kommt', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'fr-FR', 'Obligatoire — choisissez d''où vient la valeur', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'es-ES', 'Obligatorio — elige de dónde viene el valor', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.required', 'pt-PT', 'Obrigatório — escolha de onde vem o valor', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'en-GB', 'Invalid value — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'en-US', 'Invalid value — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'it-IT', 'Valore non valido — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'de-DE', 'Ungültiger Wert — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'fr-FR', 'Valeur invalide — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'es-ES', 'Valor no válido — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1),
  ('app.widgets.payload_map.issue.invalid', 'pt-PT', 'Valor inválido — {message}', now(), 'migration-payload-map-conformance', now(), 'migration-payload-map-conformance', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-payload-map-conformance';
