-- Fire-and-forget patch: Update granular regex breakdown v2 translation keys
--
-- This patch does TWO things:
-- 1. INSERT 2 new keys (char_class_brackets, char_class_negated_brackets) × 6 languages = 12 rows
-- 2. UPDATE 7 existing keys (end, one_or_more, zero_or_more, optional, exactly, min_or_more,
--    between) × 6 languages = 42 rows with new values that include "the preceding element"
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key patterns:
--   translations:i18n:system:{language}
--   translations:i18n:public:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

-- ─── INSERT: 2 new keys × 6 languages ─────────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_class_brackets', 'en-GB', 'Any character contained between the brackets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_brackets', 'it-IT', 'Qualsiasi carattere contenuto tra le parentesi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_brackets', 'fr-FR', 'Tout caractere contenu entre les crochets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_brackets', 'es-ES', 'Cualquier caracter contenido entre corchetes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_brackets', 'de-DE', 'Beliebiges Zeichen zwischen den Klammern', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_brackets', 'pt-PT', 'Qualquer caractere contido entre os colchetes', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_class_negated_brackets', 'en-GB', 'Any character NOT contained between the brackets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_brackets', 'it-IT', 'Qualsiasi carattere NON contenuto tra le parentesi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_brackets', 'fr-FR', 'Tout caractere NON contenu entre les crochets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_brackets', 'es-ES', 'Cualquier caracter NO contenido entre corchetes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_brackets', 'de-DE', 'Beliebiges Zeichen NICHT zwischen den Klammern', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_brackets', 'pt-PT', 'Qualquer caractere NAO contido entre os colchetes', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── UPDATE: 7 existing keys × 6 languages = 42 rows ──────────────────

-- app.smart.regex.explainer.end
UPDATE public.translations SET value = 'Up to the end of the string', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Fino alla fine della stringa', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Jusqu''a la fin de la chaine', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Hasta el final de la cadena', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Bis zum Ende der Zeichenkette', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'Ate o fim da string', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.end' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.one_or_more
UPDATE public.translations SET value = 'one or more times the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'una o piu volte l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'une ou plusieurs fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'una o mas veces el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'ein oder mehrmal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'uma ou mais vezes o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.one_or_more' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.zero_or_more
UPDATE public.translations SET value = 'zero or more times the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero o piu volte l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero ou plusieurs fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'cero o mas veces el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'null oder mehrmal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero ou mais vezes o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.zero_or_more' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.optional
UPDATE public.translations SET value = 'zero or one time the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero o una volta l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero ou une fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'cero o una vez el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'null oder einmal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zero ou uma vez o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.optional' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.exactly
UPDATE public.translations SET value = 'exactly {count} time(s) the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'esattamente {count} volta/e l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'exactement {count} fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'exactamente {count} vez/veces el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'genau {count} mal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'exatamente {count} vez/vezes o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.exactly' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.min_or_more
UPDATE public.translations SET value = '{count} or more times the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = '{count} o piu volte l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = '{count} ou plusieurs fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = '{count} o mas veces el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = '{count} oder mehrmal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = '{count} ou mais vezes o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.min_or_more' AND language = 'pt-PT' AND deleted_at IS NULL;

-- app.smart.regex.explainer.between
UPDATE public.translations SET value = 'between {min} and {max} times the preceding element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'tra {min} e {max} volte l''elemento precedente', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'entre {min} et {max} fois l''element precedent', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'entre {min} y {max} veces el elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'zwischen {min} und {max} mal das vorherige Element', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE public.translations SET value = 'entre {min} e {max} vezes o elemento anterior', updated_at = '2026-05-18T14:27:00Z', updated_by = 'initial-setup' WHERE key = 'app.smart.regex.explainer.between' AND language = 'pt-PT' AND deleted_at IS NULL;

COMMIT;
