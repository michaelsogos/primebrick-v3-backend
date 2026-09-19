-- Fire-and-forget patch: Smart JSON assistant — localized topic
-- descriptions (topics.desc.*, replacing raw English schema describes in
-- the explorer UI), localized condensed summaries, and the key_picker
-- chat-input hint.
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    -- key_picker flow (intro updated to mention the chat input)
    ('key_picker.intro', 'Auto-generated key: {key} — pick an existing key, or type the error message in the chat and we will create it in every language.', 'Chiave auto-generata: {key} — scegli una chiave esistente o scrivi il messaggio d''errore nella chat e lo creeremo in tutte le lingue.', 'Clé auto-générée : {key} — choisissez une clé existante ou saisissez le message d''erreur dans le chat et nous le créerons dans toutes les langues.', 'Clave autogenerada: {key} — elige una clave existente o escribe el mensaje de error en el chat y lo crearemos en todos los idiomas.', 'Automatisch generierter Schlüssel: {key} — wählen Sie einen vorhandenen Schlüssel oder geben Sie die Fehlermeldung im Chat ein und wir erstellen sie in allen Sprachen.', 'Chave autogerada: {key} — escolhe uma chave existente ou escreve a mensagem de erro no chat e criamo-la em todas as línguas.'),
    ('key_picker.picked_summary', 'Key {key} selected.', 'Chiave {key} selezionata.', 'Clé {key} sélectionnée.', 'Clave {key} seleccionada.', 'Schlüssel {key} ausgewählt.', 'Chave {key} selecionada.'),
    ('key_picker.chat_message', 'Message received — preparing translations for {key}.', 'Messaggio ricevuto — preparo le traduzioni per {key}.', 'Message reçu — préparation des traductions pour {key}.', 'Mensaje recibido — preparando traducciones para {key}.', 'Nachricht erhalten — Übersetzungen für {key} werden vorbereitet.', 'Mensagem recebida — a preparar traduções para {key}.'),
    -- condensed summaries (previously hardcoded English)
    ('applied_summary', 'Applied: {json}', 'Applicato: {json}', 'Appliqué : {json}', 'Aplicado: {json}', 'Angewendet: {json}', 'Aplicado: {json}'),
    ('discarded_summary', 'Candidate discarded.', 'Candidato scartato.', 'Candidat écarté.', 'Candidato descartado.', 'Kandidat verworfen.', 'Candidato descartado.'),
    ('translations_preview.accepted_summary', 'Translation key {key} accepted with {count} language(s).', 'Chiave di traduzione {key} accettata con {count} lingua/e.', 'Clé de traduction {key} acceptée avec {count} langue(s).', 'Clave de traducción {key} aceptada con {count} idioma(s).', 'Übersetzungsschlüssel {key} mit {count} Sprache(n) akzeptiert.', 'Chave de tradução {key} aceite com {count} língua(s).'),
    ('translations_preview.key_only_summary', 'Key {key} set — translations will be added later.', 'Chiave {key} impostata — le traduzioni verranno aggiunte in seguito.', 'Clé {key} définie — les traductions seront ajoutées plus tard.', 'Clave {key} establecida — las traducciones se añadirán después.', 'Schlüssel {key} gesetzt — Übersetzungen werden später hinzugefügt.', 'Chave {key} definida — as traduções serão adicionadas depois.'),
    -- topic descriptions (replace raw English schema describes)
    ('topics.desc.validation', 'Validation rules for the config value', 'Regole di validazione per il valore della configurazione', 'Règles de validation pour la valeur de configuration', 'Reglas de validación para el valor de configuración', 'Validierungsregeln für den Konfigurationswert', 'Regras de validação para o valor de configuração'),
    ('topics.desc.rules', 'Validation rules applied to the value', 'Regole di validazione applicate al valore', 'Règles de validation appliquées à la valeur', 'Reglas de validación aplicadas al valor', 'Auf den Wert angewendete Validierungsregeln', 'Regras de validação aplicadas ao valor'),
    ('topics.desc.regex', 'Regex pattern validation', 'Validazione tramite pattern regex', 'Validation par expression régulière', 'Validación por patrón regex', 'Regex-Muster-Validierung', 'Validação por padrão regex'),
    ('topics.desc.flags', 'Regex flags, e.g. "i"', 'Flag regex, es. "i"', 'Drapeaux regex, ex. « i »', 'Flags de regex, ej. "i"', 'Regex-Flags, z. B. "i"', 'Flags de regex, ex. "i"'),
    ('topics.desc.url', 'URL protocol validation', 'Validazione del protocollo URL', 'Validation du protocole URL', 'Validación del protocolo URL', 'URL-Protokoll-Validierung', 'Validação do protocolo URL'),
    ('topics.desc.min_length', 'Minimum length', 'Lunghezza minima', 'Longueur minimale', 'Longitud mínima', 'Mindestlänge', 'Comprimento mínimo'),
    ('topics.desc.min_value', 'Minimum value', 'Valore minimo', 'Valeur minimale', 'Valor mínimo', 'Mindestwert', 'Valor mínimo'),
    ('topics.desc.max_length', 'Maximum length', 'Lunghezza massima', 'Longueur maximale', 'Longitud máxima', 'Maximale Länge', 'Comprimento máximo'),
    ('topics.desc.max_value', 'Maximum value', 'Valore massimo', 'Valeur maximale', 'Valor máximo', 'Maximalwert', 'Valor máximo'),
    ('topics.desc.currency', 'ISO 4217 currency code, e.g. "EUR"', 'Codice valuta ISO 4217, es. "EUR"', 'Code devise ISO 4217, ex. « EUR »', 'Código de moneda ISO 4217, ej. "EUR"', 'ISO-4217-Währungscode, z. B. "EUR"', 'Código de moeda ISO 4217, ex. "EUR"'),
    ('topics.desc.allowed_currencies', 'Selectable currency codes', 'Codici valuta selezionabili', 'Codes de devise sélectionnables', 'Códigos de moneda seleccionables', 'Auswählbare Währungscodes', 'Códigos de moeda selecionáveis'),
    ('topics.desc.values', 'Badge values map: value → label/color', 'Mappa valori badge: valore → etichetta/colore', 'Table des valeurs badge : valeur → libellé/couleur', 'Mapa de valores badge: valor → etiqueta/color', 'Badge-Wertetabelle: Wert → Label/Farbe', 'Mapa de valores badge: valor → rótulo/cor'),
    ('topics.desc.values_source', 'Built-in source id, e.g. "currencies"', 'ID sorgente integrata, es. "currencies"', 'ID de source intégrée, ex. « currencies »', 'ID de fuente integrada, ej. "currencies"', 'Integrierte Quell-ID, z. B. "currencies"', 'ID de fonte integrada, ex. "currencies"'),
    ('topics.desc.api_url', 'Endpoint URL providing the options', 'URL dell''endpoint che fornisce le opzioni', 'URL du endpoint fournissant les options', 'URL del endpoint que proporciona las opciones', 'Endpunkt-URL für die Optionen', 'URL do endpoint que fornece as opções'),
    ('topics.desc.api_verb', 'HTTP method for the options endpoint', 'Metodo HTTP per l''endpoint delle opzioni', 'Méthode HTTP pour le endpoint des options', 'Método HTTP para el endpoint de opciones', 'HTTP-Methode für den Options-Endpunkt', 'Método HTTP para o endpoint de opções'),
    ('topics.desc.value_field', 'Response field used as option value', 'Campo della risposta usato come valore dell''opzione', 'Champ de réponse utilisé comme valeur d''option', 'Campo de respuesta usado como valor de opción', 'Antwortfeld als Optionswert', 'Campo de resposta usado como valor de opção'),
    ('topics.desc.label_field', 'Response field used as option label', 'Campo della risposta usato come etichetta dell''opzione', 'Champ de réponse utilisé comme libellé d''option', 'Campo de respuesta usado como etiqueta de opción', 'Antwortfeld als Optionslabel', 'Campo de resposta usado como rótulo de opção'),
    ('topics.desc.default_protocol', 'Default URL protocol, e.g. "https"', 'Protocollo URL predefinito, es. "https"', 'Protocole URL par défaut, ex. « https »', 'Protocolo URL predeterminado, ej. "https"', 'Standard-URL-Protokoll, z. B. "https"', 'Protocolo URL predefinido, ex. "https"'),
    ('topics.desc.allowed_protocols', 'Allowed URL protocols', 'Protocolli URL consentiti', 'Protocoles URL autorisés', 'Protocolos URL permitidos', 'Erlaubte URL-Protokolle', 'Protocolos URL permitidos'),
    ('topics.desc.country', 'Default ISO country code, e.g. "IT"', 'Codice paese ISO predefinito, es. "IT"', 'Code pays ISO par défaut, ex. « IT »', 'Código de país ISO predeterminado, ej. "IT"', 'Standard-ISO-Ländercode, z. B. "IT"', 'Código de país ISO predefinido, ex. "IT"'),
    ('topics.desc.allowed_countries', 'Selectable country codes', 'Codici paese selezionabili', 'Codes pays sélectionnables', 'Códigos de país seleccionables', 'Auswählbare Ländercodes', 'Códigos de país selecionáveis'),
    ('topics.desc.error_label_key', 'Translation key for the validation error message', 'Chiave di traduzione per il messaggio d''errore di validazione', 'Clé de traduction du message d''erreur de validation', 'Clave de traducción del mensaje de error de validación', 'Übersetzungsschlüssel für die Validierungsfehlermeldung', 'Chave de tradução da mensagem de erro de validação')
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
