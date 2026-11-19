-- Primebrick: `system.entities.list.operators.exists` — sentence-case the
-- operator label. The seed shipped all-lowercase values; in the combobox and
-- the applied-filter badge the op reads as a standalone label, so it takes
-- an initial capital like every other option.

UPDATE system.translations SET value = 'Exists', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'en-GB';
UPDATE system.translations SET value = 'Exists', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'en-US';
UPDATE system.translations SET value = 'Esiste', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'it-IT';
UPDATE system.translations SET value = 'Existe', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Existe', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'es-ES';
UPDATE system.translations SET value = 'Existiert', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'de-DE';
UPDATE system.translations SET value = 'Existe', updated_at = now(), updated_by = 'migration-operators-i18n', version = version + 1
WHERE key = 'system.entities.list.operators.exists' AND language = 'pt-PT';
