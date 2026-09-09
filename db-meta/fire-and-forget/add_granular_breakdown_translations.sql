-- Fire-and-forget patch: Add granular regex breakdown translation keys
--
-- These 4 keys support the granular character-class / range breakdown in the
-- deterministic regex explainer:
--   app.smart.regex.explainer.char_class_open        — opening bracket of a character class
--   app.smart.regex.explainer.char_class_negated_open — opening bracket of a negated character class
--   app.smart.regex.explainer.char_class_close       — closing bracket of a character class
--   app.smart.regex.explainer.char_range             — character range with {min}/{max} placeholders
--
-- Keys added (4 total, × 6 languages = 24 INSERTs)
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
-- The BE caches translations in Redis with key pattern:
--   translations:i18n:system:{language}
-- TTL is 6 hours, but to see the changes immediately, run:
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del
-- Or if Redis requires auth:
--   redis-cli -a <password> --scan --pattern 'translations:i18n:system:*' | xargs redis-cli -a <password> del

BEGIN;

-- ─── app.smart.regex.explainer.char_class_open ──────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_class_open', 'en-GB', 'Any character contained in the brackets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_open', 'it-IT', 'Qualsiasi carattere contenuto nelle parentesi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_open', 'fr-FR', 'Tout caractere contenu dans les crochets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_open', 'es-ES', 'Cualquier caracter contenido entre corchetes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_open', 'de-DE', 'Beliebiges Zeichen in den Klammern', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_open', 'pt-PT', 'Qualquer caractere contido entre colchetes', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.explainer.char_class_negated_open ──────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_class_negated_open', 'en-GB', 'Any character NOT contained in the brackets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_open', 'it-IT', 'Qualsiasi carattere NON contenuto nelle parentesi', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_open', 'fr-FR', 'Tout caractere NON contenu dans les crochets', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_open', 'es-ES', 'Cualquier caracter NO contenido entre corchetes', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_open', 'de-DE', 'Beliebiges Zeichen NICHT in den Klammern', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_negated_open', 'pt-PT', 'Qualquer caractere NAO contido entre colchetes', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.explainer.char_class_close ─────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_class_close', 'en-GB', 'End of character class', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_close', 'it-IT', 'Fine della classe di caratteri', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_close', 'fr-FR', 'Fin de la classe de caracteres', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_close', 'es-ES', 'Fin de la clase de caracteres', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_close', 'de-DE', 'Ende der Zeichenklasse', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_class_close', 'pt-PT', 'Fim da classe de caracteres', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- ─── app.smart.regex.explainer.char_range ──────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.smart.regex.explainer.char_range', 'en-GB', 'Characters from {min} to {max}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_range', 'it-IT', 'Caratteri da {min} a {max}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_range', 'fr-FR', 'Caracteres de {min} a {max}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_range', 'es-ES', 'Caracteres de {min} a {max}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_range', 'de-DE', 'Zeichen von {min} bis {max}', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.smart.regex.explainer.char_range', 'pt-PT', 'Caracteres de {min} a {max}', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;
