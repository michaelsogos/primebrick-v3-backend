-- Shorten the cerebellum "model defaults" option label (selector now has a
-- leading icon+title label, so the verbose form is redundant).
UPDATE translations SET value = 'Defaults',        version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'en-GB';
UPDATE translations SET value = 'Predefiniti',     version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'it-IT';
UPDATE translations SET value = 'Par défaut',      version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'fr-FR';
UPDATE translations SET value = 'Predeterminados', version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'es-ES';
UPDATE translations SET value = 'Standards',       version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'de-DE';
UPDATE translations SET value = 'Padrões',         version = version + 1, updated_at = now(), updated_by = 'devin' WHERE key = 'app.smart.ai.cerebellum.model_defaults' AND language = 'pt-PT';
