-- `app.common.validation.<token>` — one common message per shared
-- identifier-format token (identifier, snake_key, dotted_key, dotted_glob,
-- slug, no_space). The tokens are evaluated by the core `checkFieldValue`
-- / `jsonSchemaCheck` predicates, so the SAME grammar feeds the FE form
-- schema, the BE/US wire validator, and JSON-Schema payload contracts —
-- and the SAME translated message surfaces everywhere via
-- translated-field-errors (`key|params` convention, no params needed).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.identifier', 'en-GB', 'Letters, digits, dots, underscores and hyphens — must start and end with a letter or digit', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'en-US', 'Letters, digits, dots, underscores and hyphens — must start and end with a letter or digit', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'it-IT', 'Lettere, cifre, punti, underscore e trattini — deve iniziare e finire con una lettera o cifra', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'de-DE', 'Buchstaben, Ziffern, Punkte, Unterstriche und Bindestriche — muss mit einem Buchstaben oder einer Ziffer beginnen und enden', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'fr-FR', 'Lettres, chiffres, points, tirets bas et tirets — doit commencer et finir par une lettre ou un chiffre', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'es-ES', 'Letras, dígitos, puntos, guiones bajos y guiones — debe empezar y terminar con una letra o dígito', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.identifier', 'pt-PT', 'Letras, dígitos, pontos, underscores e hífens — deve começar e terminar com uma letra ou dígito', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'en-GB', 'Lowercase letters, digits and underscores — must start with a letter', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'en-US', 'Lowercase letters, digits and underscores — must start with a letter', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'it-IT', 'Lettere minuscole, cifre e underscore — deve iniziare con una lettera', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'de-DE', 'Kleinbuchstaben, Ziffern und Unterstriche — muss mit einem Buchstaben beginnen', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'fr-FR', 'Lettres minuscules, chiffres et tirets bas — doit commencer par une lettre', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'es-ES', 'Letras minúsculas, dígitos y guiones bajos — debe empezar con una letra', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.snake_key', 'pt-PT', 'Letras minúsculas, dígitos e underscores — deve começar com uma letra', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'en-GB', 'Dot-separated snake_case segments (e.g. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'en-US', 'Dot-separated snake_case segments (e.g. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'it-IT', 'Segmenti snake_case separati da punti (es. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'de-DE', 'Punkt-getrennte snake_case-Segmente (z. B. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'fr-FR', 'Segments snake_case séparés par des points (ex. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'es-ES', 'Segmentos snake_case separados por puntos (ej. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_key', 'pt-PT', 'Segmentos snake_case separados por pontos (ex. customer.read.all)', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'en-GB', 'Dot-separated snake_case segments — a whole segment may be the * wildcard', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'en-US', 'Dot-separated snake_case segments — a whole segment may be the * wildcard', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'it-IT', 'Segmenti snake_case separati da punti — un segmento intero può essere il carattere jolly *', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'de-DE', 'Punkt-getrennte snake_case-Segmente — ein ganzes Segment darf der Platzhalter * sein', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'fr-FR', 'Segments snake_case séparés par des points — un segment entier peut être le joker *', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'es-ES', 'Segmentos snake_case separados por puntos — un segmento entero puede ser el comodín *', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.dotted_glob', 'pt-PT', 'Segmentos snake_case separados por pontos — um segmento inteiro pode ser o curinga *', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'en-GB', 'Lowercase letters, digits, underscores and hyphens — must start with a letter', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'en-US', 'Lowercase letters, digits, underscores and hyphens — must start with a letter', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'it-IT', 'Lettere minuscole, cifre, underscore e trattini — deve iniziare con una lettera', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'de-DE', 'Kleinbuchstaben, Ziffern, Unterstriche und Bindestriche — muss mit einem Buchstaben beginnen', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'fr-FR', 'Lettres minuscules, chiffres, tirets bas et tirets — doit commencer par une lettre', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'es-ES', 'Letras minúsculas, dígitos, guiones bajos y guiones — debe empezar con una letra', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.slug', 'pt-PT', 'Letras minúsculas, dígitos, underscores e hífens — deve começar com uma letra', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'en-GB', 'Must not contain whitespace', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'en-US', 'Must not contain whitespace', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'it-IT', 'Non deve contenere spazi', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'de-DE', 'Darf keine Leerzeichen enthalten', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'fr-FR', 'Ne doit pas contenir d''espaces', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'es-ES', 'No debe contener espacios', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1),
  ('app.common.validation.no_space', 'pt-PT', 'Não deve conter espaços', now(), 'migration-identifier-formats', now(), 'migration-identifier-formats', 1)
ON CONFLICT (key, language) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = 'migration-identifier-formats';
