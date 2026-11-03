-- Shared validation i18n keys — `FieldIssue.message` carries the
-- `app.common.validation.*` key (optionally `|<json-params>`), decoded
-- identically by TranslatedFormFieldErrors, the payload-map hint list
-- and any RFC7807 detail surface. One key family, zero English prose
-- emitted by the checkers.
--
-- `app.widgets.payload_map.issue.required` gains a `{message}` slot —
-- every required-code issue now carries its own translated text (kind
-- picked but empty ≠ no kind picked).

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.validation.expected_type', 'en-GB', 'Expected {types}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'en-US', 'Expected {types}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'it-IT', 'Atteso {types}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'de-DE', '{types} erwartet', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'fr-FR', '{types} attendu', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'es-ES', 'Se esperaba {types}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.expected_type', 'pt-PT', 'Esperado {types}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.not_in_vocab', 'en-GB', 'Value is not in the allowed set', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'en-US', 'Value is not in the allowed set', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'it-IT', 'Il valore non è nell''insieme consentito', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'de-DE', 'Der Wert ist nicht in der erlaubten Menge', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'fr-FR', 'La valeur n''est pas dans l''ensemble autorisé', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'es-ES', 'El valor no está en el conjunto permitido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.not_in_vocab', 'pt-PT', 'O valor não está no conjunto permitido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.must_equal', 'en-GB', 'Must equal {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'en-US', 'Must equal {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'it-IT', 'Deve essere uguale a {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'de-DE', 'Muss gleich {value} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'fr-FR', 'Doit être égal à {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'es-ES', 'Debe ser igual a {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.must_equal', 'pt-PT', 'Deve ser igual a {value}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.min_chars', 'en-GB', 'Must contain at least {count} character(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'en-US', 'Must contain at least {count} character(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'it-IT', 'Deve contenere almeno {count} caratteri', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'de-DE', 'Muss mindestens {count} Zeichen enthalten', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'fr-FR', 'Doit contenir au moins {count} caractère(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'es-ES', 'Debe contener al menos {count} carácter(es)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_chars', 'pt-PT', 'Deve conter pelo menos {count} carácter(es)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.max_chars', 'en-GB', 'Must contain at most {count} character(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'en-US', 'Must contain at most {count} character(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'it-IT', 'Deve contenere al massimo {count} caratteri', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'de-DE', 'Darf höchstens {count} Zeichen enthalten', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'fr-FR', 'Doit contenir au plus {count} caractère(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'es-ES', 'Debe contener como máximo {count} carácter(es)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_chars', 'pt-PT', 'Deve conter no máximo {count} carácter(es)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.min_items', 'en-GB', 'Must contain at least {count} item(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'en-US', 'Must contain at least {count} item(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'it-IT', 'Deve contenere almeno {count} elementi', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'de-DE', 'Muss mindestens {count} Element(e) enthalten', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'fr-FR', 'Doit contenir au moins {count} élément(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'es-ES', 'Debe contener al menos {count} elemento(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.min_items', 'pt-PT', 'Deve conter pelo menos {count} item(ns)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.max_items', 'en-GB', 'Must contain at most {count} item(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'en-US', 'Must contain at most {count} item(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'it-IT', 'Deve contenere al massimo {count} elementi', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'de-DE', 'Darf höchstens {count} Element(e) enthalten', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'fr-FR', 'Doit contenir au plus {count} élément(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'es-ES', 'Debe contener como máximo {count} elemento(s)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.max_items', 'pt-PT', 'Deve conter no máximo {count} item(ns)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.minimum', 'en-GB', 'Must be at least {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'en-US', 'Must be at least {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'it-IT', 'Deve essere almeno {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'de-DE', 'Muss mindestens {min} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'fr-FR', 'Doit être au moins {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'es-ES', 'Debe ser al menos {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.minimum', 'pt-PT', 'Deve ser pelo menos {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.maximum', 'en-GB', 'Must be at most {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'en-US', 'Must be at most {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'it-IT', 'Deve essere al massimo {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'de-DE', 'Darf höchstens {max} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'fr-FR', 'Doit être au plus {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'es-ES', 'Debe ser como máximo {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.maximum', 'pt-PT', 'Deve ser no máximo {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.exclusive_minimum', 'en-GB', 'Must be greater than {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'en-US', 'Must be greater than {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'it-IT', 'Deve essere maggiore di {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'de-DE', 'Muss größer als {min} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'fr-FR', 'Doit être supérieur à {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'es-ES', 'Debe ser mayor que {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_minimum', 'pt-PT', 'Deve ser maior que {min}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.exclusive_maximum', 'en-GB', 'Must be less than {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'en-US', 'Must be less than {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'it-IT', 'Deve essere minore di {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'de-DE', 'Muss kleiner als {max} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'fr-FR', 'Doit être inférieur à {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'es-ES', 'Debe ser menor que {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.exclusive_maximum', 'pt-PT', 'Deve ser menor que {max}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.multiple_of', 'en-GB', 'Must be a multiple of {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'en-US', 'Must be a multiple of {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'it-IT', 'Deve essere un multiplo di {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'de-DE', 'Muss ein Vielfaches von {of} sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'fr-FR', 'Doit être un multiple de {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'es-ES', 'Debe ser un múltiplo de {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.multiple_of', 'pt-PT', 'Deve ser um múltiplo de {of}', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.email', 'en-GB', 'Must be a valid email address', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'en-US', 'Must be a valid email address', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'it-IT', 'Deve essere un indirizzo email valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'de-DE', 'Muss eine gültige E-Mail-Adresse sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'fr-FR', 'Doit être une adresse e-mail valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'es-ES', 'Debe ser una dirección de email válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.email', 'pt-PT', 'Deve ser um endereço de email válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.uuid', 'en-GB', 'Must be a valid UUID', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'en-US', 'Must be a valid UUID', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'it-IT', 'Deve essere un UUID valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'de-DE', 'Muss eine gültige UUID sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'fr-FR', 'Doit être un UUID valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'es-ES', 'Debe ser un UUID válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.uuid', 'pt-PT', 'Deve ser um UUID válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.url', 'en-GB', 'Must be a valid URL', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'en-US', 'Must be a valid URL', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'it-IT', 'Deve essere un URL valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'de-DE', 'Muss eine gültige URL sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'fr-FR', 'Doit être une URL valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'es-ES', 'Debe ser una URL válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.url', 'pt-PT', 'Deve ser um URL válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.nats_subject', 'en-GB', 'Must be a valid NATS subject', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'en-US', 'Must be a valid NATS subject', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'it-IT', 'Deve essere un soggetto NATS valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'de-DE', 'Muss ein gültiges NATS-Subject sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'fr-FR', 'Doit être un sujet NATS valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'es-ES', 'Debe ser un asunto NATS válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.nats_subject', 'pt-PT', 'Deve ser um assunto NATS válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.schedule_spec', 'en-GB', 'Must be a valid schedule spec', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'en-US', 'Must be a valid schedule spec', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'it-IT', 'Deve essere uno schedule spec valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'de-DE', 'Muss eine gültige Schedule-Spezifikation sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'fr-FR', 'Doit être une spécification de planification valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'es-ES', 'Debe ser una especificación de programación válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.schedule_spec', 'pt-PT', 'Deve ser uma especificação de agendamento válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.color_hex', 'en-GB', 'Must be a valid hex color', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'en-US', 'Must be a valid hex color', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'it-IT', 'Deve essere un colore esadecimale valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'de-DE', 'Muss eine gültige Hex-Farbe sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'fr-FR', 'Doit être une couleur hexadécimale valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'es-ES', 'Debe ser un color hexadecimal válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.color_hex', 'pt-PT', 'Deve ser uma cor hexadecimal válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.phone', 'en-GB', 'Must be a valid phone number', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'en-US', 'Must be a valid phone number', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'it-IT', 'Deve essere un numero di telefono valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'de-DE', 'Muss eine gültige Telefonnummer sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'fr-FR', 'Doit être un numéro de téléphone valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'es-ES', 'Debe ser un número de teléfono válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.phone', 'pt-PT', 'Deve ser um número de telefone válido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.date', 'en-GB', 'Must be a valid date (YYYY-MM-DD)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'en-US', 'Must be a valid date (YYYY-MM-DD)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'it-IT', 'Deve essere una data valida (YYYY-MM-DD)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'de-DE', 'Muss ein gültiges Datum sein (JJJJ-MM-TT)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'fr-FR', 'Doit être une date valide (AAAA-MM-JJ)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'es-ES', 'Debe ser una fecha válida (AAAA-MM-DD)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.date', 'pt-PT', 'Deve ser uma data válida (AAAA-MM-DD)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.datetime', 'en-GB', 'Must be a valid date-time', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'en-US', 'Must be a valid date-time', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'it-IT', 'Deve essere un date-time valido', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'de-DE', 'Muss ein gültiges Datum-Uhrzeit-Format sein', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'fr-FR', 'Doit être une date-heure valide', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'es-ES', 'Debe ser una fecha-hora válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.datetime', 'pt-PT', 'Deve ser uma data-hora válida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.time', 'en-GB', 'Must be a valid time (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'en-US', 'Must be a valid time (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'it-IT', 'Deve essere un orario valido (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'de-DE', 'Muss eine gültige Uhrzeit sein (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'fr-FR', 'Doit être une heure valide (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'es-ES', 'Debe ser una hora válida (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.time', 'pt-PT', 'Deve ser uma hora válida (HH:MM)', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.empty_const', 'en-GB', 'Provide a value — an empty constant resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'en-US', 'Provide a value — an empty constant resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'it-IT', 'Inserisci un valore — una costante vuota non produce nulla', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'de-DE', 'Gib einen Wert an — eine leere Konstante liefert nichts', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'fr-FR', 'Indiquez une valeur — une constante vide ne produit rien', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'es-ES', 'Indica un valor — una constante vacía no produce nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_const', 'pt-PT', 'Indica um valor — uma constante vazia não produz nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.empty_list', 'en-GB', 'Add at least one item — an empty list resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'en-US', 'Add at least one item — an empty list resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'it-IT', 'Aggiungi almeno un elemento — una lista vuota non produce nulla', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'de-DE', 'Füge mindestens ein Element hinzu — eine leere Liste liefert nichts', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'fr-FR', 'Ajoutez au moins un élément — une liste vide ne produit rien', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'es-ES', 'Añade al menos un elemento — una lista vacía no produce nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_list', 'pt-PT', 'Adiciona pelo menos um item — uma lista vazia não produz nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.empty_map', 'en-GB', 'Add at least one entry — an empty map resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'en-US', 'Add at least one entry — an empty map resolves to nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'it-IT', 'Aggiungi almeno una voce — una mappa vuota non produce nulla', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'de-DE', 'Füge mindestens einen Eintrag hinzu — eine leere Map liefert nichts', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'fr-FR', 'Ajoutez au moins une entrée — une map vide ne produit rien', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'es-ES', 'Añade al menos una entrada — un mapa vacío no produce nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.empty_map', 'pt-PT', 'Adiciona pelo menos uma entrada — um mapa vazio não produz nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.missing_source_path', 'en-GB', 'Pick a source property — the entry delivers nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'en-US', 'Pick a source property — the entry delivers nothing', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'it-IT', 'Scegli una proprietà sorgente — la voce non produce nulla', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'de-DE', 'Wähle eine Quelleigenschaft — der Eintrag liefert nichts', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'fr-FR', 'Choisissez une propriété source — l''entrée ne produit rien', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'es-ES', 'Elige una propiedad de origen — la entrada no produce nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.missing_source_path', 'pt-PT', 'Escolhe uma propriedade de origem — a entrada não produz nada', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.path_not_declared', 'en-GB', 'Path ''{path}'' is not declared in the source schema', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'en-US', 'Path ''{path}'' is not declared in the source schema', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'it-IT', 'Il path ''{path}'' non è dichiarato nello schema sorgente', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'de-DE', 'Der Pfad ''{path}'' ist im Quellschema nicht deklariert', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'fr-FR', 'Le chemin ''{path}'' n''est pas déclaré dans le schéma source', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'es-ES', 'La ruta ''{path}'' no está declarada en el esquema de origen', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_not_declared', 'pt-PT', 'O caminho ''{path}'' não está declarado no esquema de origem', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.path_incompatible', 'en-GB', 'Path ''{path}'' produces a value incompatible with ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'en-US', 'Path ''{path}'' produces a value incompatible with ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'it-IT', 'Il path ''{path}'' produce un valore incompatibile con ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'de-DE', 'Der Pfad ''{path}'' liefert einen mit ''{field}'' inkompatiblen Wert', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'fr-FR', 'Le chemin ''{path}'' produit une valeur incompatible avec ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'es-ES', 'La ruta ''{path}'' produce un valor incompatible con ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.path_incompatible', 'pt-PT', 'O caminho ''{path}'' produz um valor incompatível com ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.unknown_meta', 'en-GB', 'Unknown context item ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'en-US', 'Unknown context item ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'it-IT', 'Voce di contesto sconosciuta ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'de-DE', 'Unbekanntes Kontextelement ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'fr-FR', 'Élément de contexte inconnu ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'es-ES', 'Elemento de contexto desconocido ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unknown_meta', 'pt-PT', 'Item de contexto desconhecido ''{meta}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.meta_incompatible', 'en-GB', 'Context item ''{meta}'' produces a value incompatible with ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'en-US', 'Context item ''{meta}'' produces a value incompatible with ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'it-IT', 'La voce di contesto ''{meta}'' produce un valore incompatibile con ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'de-DE', 'Das Kontextelement ''{meta}'' liefert einen mit ''{field}'' inkompatiblen Wert', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'fr-FR', 'L''élément de contexte ''{meta}'' produit une valeur incompatible avec ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'es-ES', 'El elemento de contexto ''{meta}'' produce un valor incompatible con ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.meta_incompatible', 'pt-PT', 'O item de contexto ''{meta}'' produz um valor incompatível com ''{field}''', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.unmapped_required', 'en-GB', 'Destination field ''{field}'' has no source picked', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'en-US', 'Destination field ''{field}'' has no source picked', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'it-IT', 'Il campo destinazione ''{field}'' non ha una sorgente scelta', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'de-DE', 'Für das Zielfeld ''{field}'' ist keine Quelle gewählt', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'fr-FR', 'Le champ de destination ''{field}'' n''a pas de source choisie', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'es-ES', 'El campo de destino ''{field}'' no tiene una fuente elegida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.unmapped_required', 'pt-PT', 'O campo de destino ''{field}'' não tem uma origem escolhida', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.trigger_source_or_schedule', 'en-GB', 'At least one of event source or schedule is required', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'en-US', 'At least one of event source or schedule is required', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'it-IT', 'Serve almeno una sorgente evento o una schedule', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'de-DE', 'Mindestens eine Ereignisquelle oder ein Zeitplan ist erforderlich', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'fr-FR', 'Au moins une source d''événement ou une planification est requise', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'es-ES', 'Se requiere al menos una fuente de evento o una programación', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.trigger_source_or_schedule', 'pt-PT', 'É necessária pelo menos uma fonte de evento ou um agendamento', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.user_context_requires_source', 'en-GB', '"user" requires an event source — pick "me" or "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'en-US', '"user" requires an event source — pick "me" or "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'it-IT', '"user" richiede una sorgente evento — scegli "me" o "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'de-DE', '"user" erfordert eine Ereignisquelle — wähle "me" oder "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'fr-FR', '"user" nécessite une source d''événement — choisissez "me" ou "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'es-ES', '"user" requiere una fuente de evento — elige "me" o "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.user_context_requires_source', 'pt-PT', '"user" requer uma fonte de evento — escolhe "me" ou "system"', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),

  ('app.common.validation.property_format_hint', 'en-GB', 'Property "{field}" looks like a formatted value but declares no matching format (expected: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'en-US', 'Property "{field}" looks like a formatted value but declares no matching format (expected: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'it-IT', 'La proprietà "{field}" sembra un valore formattato ma non dichiara un formato corrispondente (atteso: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'de-DE', 'Die Eigenschaft "{field}" sieht nach einem formatierten Wert aus, deklariert aber kein passendes Format (erwartet: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'fr-FR', 'La propriété "{field}" ressemble à une valeur formatée mais ne déclare aucun format correspondant (attendu : {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'es-ES', 'La propiedad "{field}" parece un valor formateado pero no declara un formato coincidente (esperado: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1),
  ('app.common.validation.property_format_hint', 'pt-PT', 'A propriedade "{field}" parece um valor formatado mas não declara um formato correspondente (esperado: {formats})', now(), 'migration-validation-i18n', now(), 'migration-validation-i18n', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- Every required-code issue carries its own translated message now —
-- the wrapper interpolates it instead of hiding it.
UPDATE public.translations SET value = 'Required — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Required — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Obbligatorio — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Pflichtfeld — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Obligatoire — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Obligatorio — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Obrigatório — {message}', updated_at = now(), updated_by = 'migration-validation-i18n'
  WHERE key = 'app.widgets.payload_map.issue.required' AND language = 'pt-PT' AND deleted_at IS NULL;
