-- Fire-and-forget patch: chat-as-answer — model-driven resolution of
-- pending assistant choices.
--
-- 1) key_picker.intro shortened (the in-card free-text input was removed;
--    new error messages are typed in the chat).
-- 2) chat_action_ack — bubble shown when the model resolves a pending
--    choice from the user's natural-language reply.
-- 3) en-US mirrors en-GB (the en-US dictionaries were seeded from en-GB).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

WITH localized(ns, key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.smart.json.ai', 'key_picker.intro',
      'Pick a key or write the error text in chat — we translate it into every language and generate the key.',
      'Scegli una chiave oppure scrivi in chat il testo: lo traduciamo e generiamo la chiave.',
      'Choisissez une clé ou écrivez le texte dans le chat — nous le traduisons et générons la clé.',
      'Elige una clave o escribe el texto en el chat — lo traducimos y generamos la clave.',
      'Wählen Sie einen Schlüssel oder schreiben Sie den Text im Chat — wir übersetzen ihn und generieren den Schlüssel.',
      'Escolhe uma chave ou escreve o texto no chat — traduzimo-lo e geramos a chave.'),
    ('app.smart.json.ai', 'chat_action_ack',
      'Done.', 'Fatto.', 'C''est fait.', 'Hecho.', 'Erledigt.', 'Feito.'),
    ('app.smart.regex.ai', 'chat_action_ack',
      'Done.', 'Fatto.', 'C''est fait.', 'Hecho.', 'Erledigt.', 'Feito.')
), expanded AS (
  SELECT ns || '.' || key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('en-US', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

COMMIT;
