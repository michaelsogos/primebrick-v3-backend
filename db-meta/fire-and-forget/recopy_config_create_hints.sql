-- Fire-and-forget: re-copy of /configurations/create hints for non-technical
-- tone + new per-field tooltip keys (valueHelp, labelKeyHelp,
-- descriptionKeyHelp, groupKeyHelp) + de-jargoned labels + shared
-- app.common.optionalTooltip* rewording.
--
-- Languages: en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- system.settings.* → system.translations ; app.* → public.translations
-- Idempotent via ON CONFLICT on the partial unique index.

BEGIN;

-- ── Shared optional marker (public.translations) ────────────────────────────
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('app.common.optionalTooltipTitle', 'en-GB', 'Suggested value', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'en-US', 'Suggested value', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'it-IT', 'Valore suggerito', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'fr-FR', 'Valeur suggérée', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'es-ES', 'Valor sugerido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'de-DE', 'Vorgeschlagener Wert', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipTitle', 'pt-PT', 'Valor sugerido', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'en-GB', 'Leave this empty to use the suggested value; type your own to override it.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'en-US', 'Leave this empty to use the suggested value; type your own to override it.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'it-IT', 'Lascia il campo vuoto per usare il valore suggerito; scrivi il tuo per sostituirlo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'fr-FR', 'Laissez ce champ vide pour utiliser la valeur suggérée ; saisissez la vôtre pour la remplacer.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'es-ES', 'Deja este campo vacío para usar el valor sugerido; escribe el tuyo para reemplazarlo.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'de-DE', 'Feld leer lassen, um den vorgeschlagenen Wert zu verwenden; eigenen Wert eingeben, um ihn zu überschreiben.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('app.common.optionalTooltipText', 'pt-PT', 'Deixe este campo vazio para usar o valor sugerido; digite o seu para substituí-lo.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ── /configurations/create + typeConfig builder (system.translations) ───────
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  -- key tooltip
  ('system.settings.configurations.create.keyHelp', 'en-GB', 'A unique code that identifies this configuration — no two settings can share the same code. Use lowercase letters, numbers and underscores, e.g. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'en-US', 'A unique code that identifies this configuration — no two settings can share the same code. Use lowercase letters, numbers and underscores, e.g. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'it-IT', 'Un codice univoco che identifica questa configurazione — due impostazioni non possono avere lo stesso codice. Usa lettere minuscole, numeri e underscore, es. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'fr-FR', 'Un code unique qui identifie cette configuration — deux paramètres ne peuvent pas partager le même code. Utilisez des minuscules, des chiffres et des underscores, ex. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'es-ES', 'Un código único que identifica esta configuración — dos configuraciones no pueden compartir el mismo código. Usa minúsculas, números y guiones bajos, p. ej. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'de-DE', 'Ein eindeutiger Code, der diese Konfiguration identifiziert — zwei Einstellungen können nicht denselben Code teilen. Kleinbuchstaben, Zahlen und Unterstriche verwenden, z. B. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.keyHelp', 'pt-PT', 'Um código único que identifica esta configuração — duas configurações não podem partilhar o mesmo código. Use minúsculas, números e underscores, ex. items_per_page.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- type tooltip
  ('system.settings.configurations.create.typeHelp', 'en-GB', 'What kind of value this configuration holds (text, number, date…). It decides how the value is entered and checked.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'en-US', 'What kind of value this configuration holds (text, number, date…). It decides how the value is entered and checked.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'it-IT', 'Che tipo di valore contiene questa configurazione (testo, numero, data…). Decide come il valore viene inserito e controllato.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'fr-FR', 'Quel type de valeur cette configuration contient (texte, nombre, date…). Cela détermine comment la valeur est saisie et vérifiée.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'es-ES', 'Qué tipo de valor contiene esta configuración (texto, número, fecha…). Decide cómo se introduce y se comprueba el valor.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'de-DE', 'Welche Art von Wert diese Konfiguration enthält (Text, Zahl, Datum…). Bestimmt, wie der Wert eingegeben und geprüft wird.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeHelp', 'pt-PT', 'Que tipo de valor esta configuração contém (texto, número, data…). Decide como o valor é inserido e verificado.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- NEW: value tooltip
  ('system.settings.configurations.create.valueHelp', 'en-GB', 'The value the system will use for this configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'en-US', 'The value the system will use for this configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'it-IT', 'Il valore che il sistema userà per questa configurazione.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'fr-FR', 'La valeur que le système utilisera pour cette configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'es-ES', 'El valor que el sistema usará para esta configuración.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'de-DE', 'Der Wert, den das System für diese Konfiguration verwendet.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.valueHelp', 'pt-PT', 'O valor que o sistema usará para esta configuração.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- NEW: per-field tooltips (were the shared optional marker)
  ('system.settings.configurations.create.labelKeyHelp', 'en-GB', 'The text shown as this configuration''s name. A ready-made wording is suggested — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'en-US', 'The text shown as this configuration''s name. A ready-made wording is suggested — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'it-IT', 'Il testo mostrato come nome di questa configurazione. Viene suggerito automaticamente — modificalo solo se gestisci le traduzioni.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'fr-FR', 'Le texte affiché comme nom de cette configuration. Une formulation prête à l''emploi est suggérée — ne la modifiez que si vous gérez les traductions.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'es-ES', 'El texto que se muestra como nombre de esta configuración. Se sugiere uno listo para usar — cámbialo solo si gestionas traducciones.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'de-DE', 'Der als Name dieser Konfiguration angezeigte Text. Eine fertige Formulierung wird vorgeschlagen — nur ändern, wenn Sie Übersetzungen verwalten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKeyHelp', 'pt-PT', 'O texto mostrado como nome desta configuração. É sugerido automaticamente — altere apenas se gerir traduções.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'en-GB', 'The text shown under the configuration''s name, explaining what it does. Suggested automatically — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'en-US', 'The text shown under the configuration''s name, explaining what it does. Suggested automatically — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'it-IT', 'Il testo mostrato sotto il nome dell''configurazione, che spiega cosa fa. Suggerito automaticamente — modificalo solo se gestisci le traduzioni.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'fr-FR', 'Le texte affiché sous le nom de la configuration, qui explique sa fonction. Suggéré automatiquement — ne le modifiez que si vous gérez les traductions.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'es-ES', 'El texto que se muestra bajo el nombre de la configuración, explicando qué hace. Sugerido automáticamente — cámbialo solo si gestionas traducciones.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'de-DE', 'Der unter dem Namen der Konfiguration angezeigte Text, der ihre Funktion erklärt. Wird automatisch vorgeschlagen — nur ändern, wenn Sie Übersetzungen verwalten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKeyHelp', 'pt-PT', 'O texto mostrado sob o nome da configuração, explicando o que faz. Sugerido automaticamente — altere apenas se gerir traduções.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'en-GB', 'Puts this configuration under a named section in the list. Suggested automatically — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'en-US', 'Puts this configuration under a named section in the list. Suggested automatically — change it only if you manage translations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'it-IT', 'Raggruppa questa configurazione sotto una sezione con nome nell''elenco. Suggerito automaticamente — modificalo solo se gestisci le traduzioni.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'fr-FR', 'Regroupe cette configuration sous une section nommée dans la liste. Suggéré automatiquement — ne le modifiez que si vous gérez les traductions.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'es-ES', 'Agrupa esta configuración bajo una sección con nombre en la lista. Sugerido automáticamente — cámbialo solo si gestionas traducciones.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'de-DE', 'Ordnet diese Konfiguration einem benannten Abschnitt in der Liste zu. Wird automatisch vorgeschlagen — nur ändern, wenn Sie Übersetzungen verwalten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.groupKeyHelp', 'pt-PT', 'Agrupa esta configuração numa secção nomeada na lista. Sugerido automaticamente — altere apenas se gerir traduções.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- reserved tooltip (was inline description on the switch)
  ('system.settings.configurations.create.reservedHelp', 'en-GB', 'Protected configuration: it can be changed but never deleted.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'en-US', 'Protected configuration: it can be changed but never deleted.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'it-IT', 'Configurazione protetta: può essere modificata ma mai eliminata.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'fr-FR', 'Configuration protégée : elle peut être modifié mais jamais supprimé.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'es-ES', 'Configuración protegida: se puede cambiar pero nunca eliminar.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'de-DE', 'Geschützte Konfiguration: kann geändert, aber nie gelöscht werden.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.reservedHelp', 'pt-PT', 'Configuração protegida: pode ser alterada mas nunca eliminada.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- de-jargoned labels
  ('system.settings.configurations.create.typeConfig', 'en-GB', 'Rules for this configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'en-US', 'Rules for this configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'it-IT', 'Regole per questa configurazione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'fr-FR', 'Règles pour cette configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'es-ES', 'Reglas para esta configuración', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'de-DE', 'Regeln für diese Konfiguration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.typeConfig', 'pt-PT', 'Regras para esta configuração', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'en-GB', 'Name (translation key)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'en-US', 'Name (translation key)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'it-IT', 'Nome (chiave di traduzione)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'fr-FR', 'Nom (clé de traduction)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'es-ES', 'Nombre (clave de traducción)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'de-DE', 'Name (Übersetzungsschlüssel)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.labelKey', 'pt-PT', 'Nome (chave de tradução)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'en-GB', 'Description (translation key)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'en-US', 'Description (translation key)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'it-IT', 'Descrizione (chiave di traduzione)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'fr-FR', 'Description (clé de traduction)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'es-ES', 'Descripción (clave de traducción)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'de-DE', 'Beschreibung (Übersetzungsschlüssel)', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.descriptionKey', 'pt-PT', 'Descrição (chave de tradução)', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- builder switches
  ('system.settings.config.typeConfig.requiredHelp', 'en-GB', 'The user must fill in a value — empty is not allowed.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'en-US', 'The user must fill in a value — empty is not allowed.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'it-IT', 'L''utente deve inserire un valore — non può essere vuoto.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'fr-FR', 'L''utilisateur doit saisir une valeur — vide n''est pas autorisé.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'es-ES', 'El usuario debe introducir un valor — no puede estar vacío.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'de-DE', 'Der Benutzer muss einen Wert eingeben — leer ist nicht erlaubt.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.requiredHelp', 'pt-PT', 'O utilizador deve preencher um valor — vazio não é permitido.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'en-GB', 'Only numbers equal to or greater than zero are allowed.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'en-US', 'Only numbers equal to or greater than zero are allowed.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'it-IT', 'Sono ammessi solo numeri uguali o maggiori di zero.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'fr-FR', 'Seuls les nombres supérieurs ou égaux à zéro sont autorisés.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'es-ES', 'Solo se permiten números iguales o mayores que cero.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'de-DE', 'Nur Zahlen gleich oder größer als null sind erlaubt.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.unsignedHelp', 'pt-PT', 'Apenas números iguais ou superiores a zero são permitidos.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'en-GB', 'Edit the settings as raw code instead of using the guided fields. For expert users.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'en-US', 'Edit the settings as raw code instead of using the guided fields. For expert users.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'it-IT', 'Modifica le impostazioni come codice grezzo invece di usare i campi guidati. Per utenti esperti.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'fr-FR', 'Modifiez les paramètres en code brut au lieu d''utiliser les champs guidés. Pour utilisateurs experts.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'es-ES', 'Edita la configuración como código en bruto en lugar de usar los campos guiados. Para usuarios expertos.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'de-DE', 'Konfiguration als Rohcode bearbeiten statt der geführten Felder. Für erfahrene Benutzer.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.config.typeConfig.advancedModeHelp', 'pt-PT', 'Edita as definições como código bruto em vez de usar os campos guiados. Para utilizadores experientes.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- ── Page chrome: unify terminology on "configuration" (was "entry"/"voce") ──
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.configurations.create.title', 'en-GB', 'Create Configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'en-US', 'Create Configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'it-IT', 'Crea configurazione', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'fr-FR', 'Créer une configuration', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'es-ES', 'Crear configuración', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'de-DE', 'Konfiguration erstellen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.title', 'pt-PT', 'Criar configuração', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'en-GB', 'Create a new configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'en-US', 'Create a new configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'it-IT', 'Crea una nuova configurazione.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'fr-FR', 'Créer une nouvelle configuration.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'es-ES', 'Crear una nueva configuración.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'de-DE', 'Neue Konfiguration erstellen.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.description', 'pt-PT', 'Criar uma nova configuração.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'en-GB', 'Configuration created successfully.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'en-US', 'Configuration created successfully.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'it-IT', 'Configurazione creata correttamente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'fr-FR', 'Configuration créée avec succès.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'es-ES', 'Configuración creada con éxito.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'de-DE', 'Konfiguration erfolgreich erstellt.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.create.createSuccess', 'pt-PT', 'Configuração criada com sucesso.', now(), 'initial-setup', now(), 'initial-setup', 1),
  -- list page: same "entry" → "configuration" unification
  ('system.settings.configurations.description', 'en-GB', 'Manage the platform''s configurations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'en-US', 'Manage the platform''s configurations.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'it-IT', 'Gestisci le configurazioni della piattaforma.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'fr-FR', 'Gérez les configurations de la plateforme.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'es-ES', 'Gestione las configuraciones de la plataforma.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'de-DE', 'Plattformkonfigurationen verwalten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.description', 'pt-PT', 'Gerencie as configurações da plataforma.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'en-GB', 'No configurations found', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'en-US', 'No configurations found', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'it-IT', 'Nessuna configurazione trovata', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'fr-FR', 'Aucune configuration trouvée', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'es-ES', 'No se encontraron configuraciones', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'de-DE', 'Keine Konfigurationen gefunden', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.configurations.noEntries', 'pt-PT', 'Nenhuma configuração encontrada', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
