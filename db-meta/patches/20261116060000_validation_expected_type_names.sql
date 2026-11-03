-- `app.common.validation.expected_type.<type>` — per-type expected-type
-- messages. A JSON Schema type name is a noun whose article and gender
-- change per language ("Atteso un numero" / "Un nombre entier attendu" /
-- "Esperada una lista"), so the generic `expected_type`/`{types}` form
-- could only render developer vocabulary ("Atteso number"). Each known
-- type owns a complete natural sentence; the generic key remains the
-- fallback for multi-type unions and unknown names.

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.expected_type.string', 'en-GB', 'Expected text', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'en-US', 'Expected text', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'it-IT', 'Atteso un testo', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'de-DE', 'Text erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'fr-FR', 'Du texte attendu', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'es-ES', 'Se esperaba texto', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.string', 'pt-PT', 'Esperado texto', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),

  ('app.common.validation.expected_type.number', 'en-GB', 'Expected a number', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'en-US', 'Expected a number', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'it-IT', 'Atteso un numero', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'de-DE', 'Eine Zahl erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'fr-FR', 'Un nombre attendu', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'es-ES', 'Se esperaba un número', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.number', 'pt-PT', 'Esperado um número', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),

  ('app.common.validation.expected_type.integer', 'en-GB', 'Expected a whole number', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'en-US', 'Expected a whole number', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'it-IT', 'Atteso un numero intero', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'de-DE', 'Eine ganze Zahl erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'fr-FR', 'Un nombre entier attendu', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'es-ES', 'Se esperaba un número entero', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.integer', 'pt-PT', 'Esperado um número inteiro', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),

  ('app.common.validation.expected_type.boolean', 'en-GB', 'Expected true or false', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'en-US', 'Expected true or false', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'it-IT', 'Atteso vero o falso', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'de-DE', 'Wahr oder Falsch erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'fr-FR', 'Vrai ou faux attendu', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'es-ES', 'Se esperaba verdadero o falso', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.boolean', 'pt-PT', 'Esperado verdadeiro ou falso', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),

  ('app.common.validation.expected_type.array', 'en-GB', 'Expected a list', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'en-US', 'Expected a list', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'it-IT', 'Atteso un elenco', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'de-DE', 'Eine Liste erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'fr-FR', 'Une liste attendue', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'es-ES', 'Se esperaba una lista', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.array', 'pt-PT', 'Esperada uma lista', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),

  ('app.common.validation.expected_type.object', 'en-GB', 'Expected a set of named values', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'en-US', 'Expected a set of named values', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'it-IT', 'Atteso un insieme di valori', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'de-DE', 'Ein Satz benannter Werte erwartet', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'fr-FR', 'Un ensemble de valeurs nommées attendu', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'es-ES', 'Se esperaba un conjunto de valores con nombre', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1),
  ('app.common.validation.expected_type.object', 'pt-PT', 'Esperado um conjunto de valores nomeados', now(), 'migration-expected-type-names', now(), 'migration-expected-type-names', 1)
ON CONFLICT (key, language) DO NOTHING;
