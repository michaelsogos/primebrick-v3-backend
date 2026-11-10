-- system.entities.list.select_all / deselect_all — the toolbar's leading
-- select-all label shipped all-lowercase in every language. Toolbar labels
-- follow the title-case convention of "Visualizza Filtri"
-- (system.entities.list.bulkActions.toggleToFilters): capitalize every
-- content word. Value-only updates — keys and scope unchanged.

UPDATE system.translations SET "value" = 'Alle Auswählen', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'de-DE' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Select All', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'en-GB' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Select All', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'en-US' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Seleccionar Todo', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'es-ES' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Tout Sélectionner', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'fr-FR' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Seleziona Tutto', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'it-IT' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Selecionar Tudo', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.select_all' AND "language" = 'pt-PT' AND "deleted_at" IS NULL;

UPDATE system.translations SET "value" = 'Alle Abwählen', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'de-DE' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Deselect All', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'en-GB' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Deselect All', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'en-US' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Deseleccionar Todo', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'es-ES' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Tout Désélectionner', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'fr-FR' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Deseleziona Tutto', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'it-IT' AND "deleted_at" IS NULL;
UPDATE system.translations SET "value" = 'Desselecionar Tudo', "updated_at" = now(), "updated_by" = 'migration-select-all-titlecase' WHERE "key" = 'system.entities.list.deselect_all' AND "language" = 'pt-PT' AND "deleted_at" IS NULL;
