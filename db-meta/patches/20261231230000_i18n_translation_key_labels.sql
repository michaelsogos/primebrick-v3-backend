-- Primebrick: rename every translation-key surface label to the
-- user-meaning convention — the field is named after the translated
-- content the user gets, never the stored key format
-- (docs/ai/copy-tone-of-voice.md "Concrete jargon cases").
-- Per-key casing preserved as shipped.

-- fields.label_key — "Label Key" → "Label Translation"
UPDATE system.translations SET value = 'Label Translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione Etichetta', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction d''Étiquette', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción de Etiqueta', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language = 'es-ES';
UPDATE system.translations SET value = 'Beschriftungsübersetzung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução de Etiqueta', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.label_key', 'system.entities.role_mapping.fields.label_key', 'system.entities.version_history.field.label_key') AND language = 'pt-PT';

-- fields.description_key — "Description Key" → "Description Translation"
UPDATE system.translations SET value = 'Description Translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione Descrizione', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de Description', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción de Descripción', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language = 'es-ES';
UPDATE system.translations SET value = 'Beschreibungsübersetzung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução de Descrição', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key IN ('system.entities.config_entry.fields.description_key', 'system.entities.version_history.field.description_key') AND language = 'pt-PT';

-- roles.field_label_key — "Display Label Key" → "Display Name Translation"
UPDATE system.translations SET value = 'Display Name Translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione nome visualizzato', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction du nom affiché', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del nombre visible', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung des Anzeigenamens', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do nome exibido', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key' AND language = 'pt-PT';

-- roles.field_label_key_hint — the example key stays (the value IS a key)
UPDATE system.translations SET value = 'Display name translation (e.g. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione del nome visualizzato del ruolo (es. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction du nom d''affichage du rôle (ex. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del nombre visible del rol (ej. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung des Anzeigenamens der Rolle (z.B. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do nome exibido da função (ex. shell.settings.roles.label.admin).', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.roles.field_label_key_hint' AND language = 'pt-PT';

-- configurations.create.label_key — "Name (translation key)" → "Name translation"
UPDATE system.translations SET value = 'Name translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione nome', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction du nom', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del nombre', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Namensübersetzung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do nome', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.label_key' AND language = 'pt-PT';

-- configurations.create.description_key — "Description (translation key)" → "Description translation"
UPDATE system.translations SET value = 'Description translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione descrizione', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de la description', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción de la descripción', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Beschreibungsübersetzung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução da descrição', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.configurations.create.description_key' AND language = 'pt-PT';

-- type_config.badge_label_key — "Label (translation key)" → "Label translation"
UPDATE system.translations SET value = 'Label translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione etichetta', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction du libellé', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción de la etiqueta', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Beschriftungsübersetzung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do rótulo', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key' AND language = 'pt-PT';

-- type_config.badge_label_key_help — help keeps meaning, drops key jargon
UPDATE system.translations SET value = 'The text shown on the badge — a ready translation is suggested for this configuration.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Il testo mostrato sul badge — una traduzione pronta viene suggerita per questa configurazione.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language = 'it-IT';
UPDATE system.translations SET value = 'Le texte affiché sur le badge — une traduction prête est suggérée pour cette configuration.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language = 'fr-FR';
UPDATE system.translations SET value = 'El texto que se muestra en el distintivo — se sugiere una traducción lista para esta configuración.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language = 'es-ES';
UPDATE system.translations SET value = 'Der auf dem Badge angezeigte Text — eine fertige Übersetzung wird für diese Konfiguration vorgeschlagen.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language = 'de-DE';
UPDATE system.translations SET value = 'O texto mostrado no selo — uma tradução pronta é sugerida para esta configuração.', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.badge_label_key_help' AND language = 'pt-PT';

-- type_config.error_label_key — "Error label key (i18n)" → "Error message translation"
UPDATE system.translations SET value = 'Error message translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione messaggio errore', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction du message d''erreur', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del mensaje de error', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Fehlermeldung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução da mensagem de erro', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.error_label_key' AND language = 'pt-PT';

-- type_config.required_error_label_key — "Required error label key" → "Required error translation"
UPDATE system.translations SET value = 'Required error translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione errore obbligatorio', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de l''erreur obligatoire', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del error obligatorio', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Pflichtfeld-Fehlermeldung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do erro obrigatório', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.required_error_label_key' AND language = 'pt-PT';

-- type_config.min_error_label_key — "Translation key for min_length error" → "Min length error translation"
UPDATE system.translations SET value = 'Min length error translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione errore lunghezza minima', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de l''erreur de longueur minimale', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del error de longitud mínima', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Fehlermeldung für Mindestlänge', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do erro de comprimento mínimo', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.min_error_label_key' AND language = 'pt-PT';

-- type_config.max_error_label_key — "Translation key for max_length error" → "Max length error translation"
UPDATE system.translations SET value = 'Max length error translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione errore lunghezza massima', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de l''erreur de longueur maximale', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del error de longitud máxima', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Fehlermeldung für Maximallänge', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do erro de comprimento máximo', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.max_error_label_key' AND language = 'pt-PT';

-- type_config.regex_error_label_key — "Translation key for regex_mismatch error" → "Invalid format error translation"
UPDATE system.translations SET value = 'Invalid format error translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione errore formato non valido', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de l''erreur de format invalide', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del error de formato inválido', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Fehlermeldung für ungültiges Format', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do erro de formato inválido', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.regex_error_label_key' AND language = 'pt-PT';

-- type_config.url_error_label_key — "Translation key for invalid_url error" → "Invalid URL error translation"
UPDATE system.translations SET value = 'Invalid URL error translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE system.translations SET value = 'Traduzione errore URL non valido', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language = 'it-IT';
UPDATE system.translations SET value = 'Traduction de l''erreur d''URL invalide', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Traducción del error de URL inválida', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language = 'es-ES';
UPDATE system.translations SET value = 'Übersetzung der Fehlermeldung für ungültige URL', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language = 'de-DE';
UPDATE system.translations SET value = 'Tradução do erro de URL inválida', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'system.settings.config.type_config.url_error_label_key' AND language = 'pt-PT';

-- app.smart.json.ai.topics.error_label_key — lives in public.translations
UPDATE public.translations SET value = 'Error message translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'Traduzione messaggio errore', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language = 'it-IT';
UPDATE public.translations SET value = 'Traduction du message d''erreur', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Traducción del mensaje de error', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language = 'es-ES';
UPDATE public.translations SET value = 'Übersetzung der Fehlermeldung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language = 'de-DE';
UPDATE public.translations SET value = 'Tradução da mensagem de erro', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.error_label_key' AND language = 'pt-PT';

-- app.smart.json.ai.topics.desc.error_label_key — field description
UPDATE public.translations SET value = 'Validation error message translation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language IN ('en-GB', 'en-US');
UPDATE public.translations SET value = 'Traduzione del messaggio di errore di validazione', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language = 'it-IT';
UPDATE public.translations SET value = 'Traduction du message d''erreur de validation', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language = 'fr-FR';
UPDATE public.translations SET value = 'Traducción del mensaje de error de validación', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language = 'es-ES';
UPDATE public.translations SET value = 'Übersetzung der Validierungsfehlermeldung', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language = 'de-DE';
UPDATE public.translations SET value = 'Tradução da mensagem de erro de validação', updated_at = now(), updated_by = 'migration-i18n-key-labels', version = version + 1
WHERE key = 'app.smart.json.ai.topics.desc.error_label_key' AND language = 'pt-PT';
