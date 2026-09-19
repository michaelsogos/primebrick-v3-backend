-- Fire-and-forget patch: Smart JSON assistant key-picker flow and
-- localized topic titles not covered by existing typeConfig.* form keys
-- (app.smart.json.ai.key_picker.*, app.smart.json.ai.topics.*).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('key_picker.intro', 'Auto-generated key: {key} — pick an existing key, or type the error message and we will create it in every language.', 'Chiave auto-generata: {key} — scegli una chiave esistente o scrivi il messaggio d''errore e la creeremo in tutte le lingue.', 'Clé auto-générée : {key} — choisissez une clé existante ou saisissez le message d''erreur et nous le créerons dans toutes les langues.', 'Clave autogenerada: {key} — elige una clave existente o escribe el mensaje de error y la crearemos en todos los idiomas.', 'Automatisch generierter Schlüssel: {key} — wählen Sie einen vorhandenen Schlüssel oder geben Sie die Fehlermeldung ein und wir erstellen sie in allen Sprachen.', 'Chave autogerada: {key} — escolhe uma chave existente ou escreve a mensagem de erro e criamo-la em todas as línguas.'),
    ('key_picker.new_message', 'Error message text…', 'Testo del messaggio d''errore…', 'Texte du message d''erreur…', 'Texto del mensaje de error…', 'Text der Fehlermeldung…', 'Texto da mensagem de erro…'),
    ('key_picker.generate', 'Translate & propose', 'Traduci e proponi', 'Traduire & proposer', 'Traducir y proponer', 'Übersetzen & vorschlagen', 'Traduzir & propor'),
    ('topics.rules', 'Rules', 'Regole', 'Règles', 'Reglas', 'Regeln', 'Regras'),
    ('topics.flags', 'Regex flags', 'Flag regex', 'Drapeaux regex', 'Flags de regex', 'Regex-Flags', 'Flags de regex'),
    ('topics.error_label_key', 'Error label key', 'Chiave etichetta errore', 'Clé du libellé d''erreur', 'Clave de etiqueta de error', 'Fehler-Label-Schlüssel', 'Chave do rótulo de erro'),
    ('topics.allowed_currencies', 'Allowed currencies', 'Valute consentite', 'Devises autorisées', 'Monedas permitidas', 'Erlaubte Währungen', 'Moedas permitidas'),
    ('topics.allowed_countries', 'Allowed countries', 'Paesi consentiti', 'Pays autorisés', 'Países permitidos', 'Erlaubte Länder', 'Países permitidos'),
    ('topics.default_protocol', 'Default protocol', 'Protocollo predefinito', 'Protocole par défaut', 'Protocolo predeterminado', 'Standardprotokoll', 'Protocolo predefinido'),
    ('topics.country', 'Country', 'Paese', 'Pays', 'País', 'Land', 'País')
), expanded AS (
  SELECT 'app.smart.json.ai.' || key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

COMMIT;
