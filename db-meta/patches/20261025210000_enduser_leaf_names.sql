-- End-user leaf names in system.translations — settings tabs and the
-- migrations leaf get names that say what the page does, not a generic
-- word: "Template" → Export Templates, "Migrazioni" → DB Migrations &
-- Patches, "Client" → Microservice Registration (the clients tab
-- registers microservice client shields).

UPDATE system.translations SET value = 'Modelli di Esportazione', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Export Templates', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Export Templates', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Modèles d''exportation', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Plantillas de exportación', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Exportvorlagen', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Modelos de exportação', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.templates' AND language = 'pt-PT' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Migrazione e Patch DB', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'DB Migrations & Patches', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'DB Migrations & Patches', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Migrations et correctifs DB', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Migraciones y parches de BD', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'DB-Migrationen und Patches', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Migrações e patches de BD', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.migrations.nav' AND language = 'pt-PT' AND deleted_at IS NULL;

UPDATE system.translations SET value = 'Registrazione Microservizi', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'it-IT' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Microservice Registration', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'en-GB' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Microservice Registration', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'en-US' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Enregistrement des microservices', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'fr-FR' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Registro de microservicios', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'es-ES' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Microservice-Registrierung', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'de-DE' AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Registo de microsserviços', updated_at = now(), updated_by = 'migration-enduser-names', version = version + 1 WHERE key = 'system.settings.tabs.clients' AND language = 'pt-PT' AND deleted_at IS NULL;
