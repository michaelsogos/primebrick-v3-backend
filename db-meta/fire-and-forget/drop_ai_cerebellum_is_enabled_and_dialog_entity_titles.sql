-- Fire-and-forget:
--  1. Drop ai_cerebellum.is_enabled — redundant: soft delete + restore already
--     covers "disable a tuning" (the (assistant, model) pair is unique, so a
--     disabled row was equivalent to a recoverable deleted row).
--  2. Delete now-dead cerebellum keys (is_enabled/is_default field labels
--     and enabled./default. badge labels — is_default column never existed).
--  3. Entity-aware dialog titles + confirm questions:
--     app.common.{delete,restore}EntityTitle/EntityConfirm (+bulk Entities*)
--     in public.translations; system.entities.{entity}.singular/.plural/
--     .singular_definite in system.translations.
--  4. Hard-delete superseded generic title keys (no soft-delete debt).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:*' | xargs redis-cli del

BEGIN;

-- 1. Drop the column
ALTER TABLE public.ai_cerebellum DROP COLUMN IF EXISTS is_enabled;

-- 2. Dead cerebellum keys (hard delete — no tech debt)
DELETE FROM system.translations
WHERE key IN (
  'system.entities.ai_cerebellum.fields.is_enabled',
  'system.entities.ai_cerebellum.enabled.true',
  'system.entities.ai_cerebellum.enabled.false',
  'system.entities.ai_cerebellum.fields.is_default',
  'system.entities.ai_cerebellum.default.true',
  'system.entities.ai_cerebellum.default.false'
);

-- 3a. app.common dialog keys (public.translations)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  -- deleteEntityTitle
  ('app.common.deleteEntityTitle','en-GB','Delete {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','en-US','Delete {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','it-IT','Elimina {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','fr-FR','Supprimer {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','es-ES','Eliminar {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','de-DE','{entity} löschen',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityTitle','pt-PT','Eliminar {entity}',now(),'devin',now(),'devin',1),
  -- deleteEntitiesTitle (plural entity name injected)
  ('app.common.deleteEntitiesTitle','en-GB','Delete {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','en-US','Delete {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','it-IT','Elimina {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','fr-FR','Supprimer {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','es-ES','Eliminar {entity}',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','de-DE','{entity} löschen',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesTitle','pt-PT','Eliminar {entity}',now(),'devin',now(),'devin',1),
  -- restoreEntityTitle
  ('app.common.restoreEntityTitle','en-GB','Restore {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','en-US','Restore {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','it-IT','Ripristina {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','fr-FR','Restaurer {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','es-ES','Restaurar {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','de-DE','{entity} wiederherstellen',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityTitle','pt-PT','Restaurar {entity}',now(),'devin',now(),'devin',1),
  -- restoreEntitiesTitle
  ('app.common.restoreEntitiesTitle','en-GB','Restore {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','en-US','Restore {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','it-IT','Ripristina {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','fr-FR','Restaurer {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','es-ES','Restaurar {entity}',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','de-DE','{entity} wiederherstellen',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesTitle','pt-PT','Restaurar {entity}',now(),'devin',now(),'devin',1),
  -- deleteEntitiesConfirm (bulk body, replaces hardcoded text)
  ('app.common.deleteEntitiesConfirm','en-GB','Are you sure you want to delete {count} {entity}? This action cannot be undone.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','en-US','Are you sure you want to delete {count} {entity}? This action cannot be undone.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','it-IT','Sei sicuro di voler eliminare {count} {entity}? Questa azione non può essere annullata.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','fr-FR','Voulez-vous vraiment supprimer {count} {entity} ? Cette action est irréversible.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','es-ES','¿Seguro que quieres eliminar {count} {entity}? Esta acción no se puede deshacer.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','de-DE','Möchten Sie wirklich {count} {entity} löschen? Diese Aktion kann nicht rückgängig gemacht werden.',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntitiesConfirm','pt-PT','Tem a certeza que deseja eliminar {count} {entity}? Esta ação não pode ser anulada.',now(),'devin',now(),'devin',1),
  -- restoreEntitiesConfirm
  ('app.common.restoreEntitiesConfirm','en-GB','Are you sure you want to restore {count} {entity}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','en-US','Are you sure you want to restore {count} {entity}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','it-IT','Sei sicuro di voler ripristinare {count} {entity}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','fr-FR','Voulez-vous vraiment restaurer {count} {entity} ?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','es-ES','¿Seguro que quieres restaurar {count} {entity}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','de-DE','Möchten Sie wirklich {count} {entity} wiederherstellen?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntitiesConfirm','pt-PT','Tem a certeza que deseja restaurar {count} {entity}?',now(),'devin',now(),'devin',1),
  -- deleteEntityConfirm (single-record body: question only; the undo warning
  -- stays in app.common.deleteConfirm rendered on a second line)
  ('app.common.deleteEntityConfirm','en-GB','Are you sure you want to delete {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','en-US','Are you sure you want to delete {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','it-IT','Sei sicuro di voler eliminare {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','fr-FR','Voulez-vous vraiment supprimer {entity}{name} ?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','es-ES','¿Seguro que quieres eliminar {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','de-DE','Möchten Sie {entity}{name} wirklich löschen?',now(),'devin',now(),'devin',1),
  ('app.common.deleteEntityConfirm','pt-PT','Tem a certeza que deseja eliminar {entity}{name}?',now(),'devin',now(),'devin',1),
  -- restoreEntityConfirm
  ('app.common.restoreEntityConfirm','en-GB','Are you sure you want to restore {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','en-US','Are you sure you want to restore {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','it-IT','Sei sicuro di voler ripristinare {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','fr-FR','Voulez-vous vraiment restaurer {entity}{name} ?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','es-ES','¿Seguro que quieres restaurar {entity}{name}?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','de-DE','Möchten Sie {entity}{name} wirklich wiederherstellen?',now(),'devin',now(),'devin',1),
  ('app.common.restoreEntityConfirm','pt-PT','Tem a certeza que deseja restaurar {entity}{name}?',now(),'devin',now(),'devin',1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- 3b. system.entities singular/plural (system.translations)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  -- ai_model
  ('system.entities.ai_model.singular','en-GB','AI Model',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','en-US','AI Model',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','it-IT','Modello AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','fr-FR','Modèle IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','es-ES','Modelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','de-DE','KI-Modell',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular','pt-PT','Modelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','en-GB','AI Models',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','en-US','AI Models',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','it-IT','Modelli AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','fr-FR','Modèles IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','es-ES','Modelos de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','de-DE','KI-Modelle',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.plural','pt-PT','Modelos de IA',now(),'devin',now(),'devin',1),
  -- ai_cerebellum
  ('system.entities.ai_cerebellum.singular','en-GB','AI Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','en-US','AI Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','it-IT','Cervelletto AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','fr-FR','Cervelet IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','es-ES','Cerebelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','de-DE','KI-Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular','pt-PT','Cerebelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','en-GB','AI Cerebellums',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','en-US','AI Cerebellums',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','it-IT','Cervelletti AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','fr-FR','Cervelets IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','es-ES','Cerebelos de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','de-DE','KI-Cerebellums',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.plural','pt-PT','Cerebelos de IA',now(),'devin',now(),'devin',1),
  -- service_registry
  ('system.entities.service_registry.singular','en-GB','Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','en-US','Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','it-IT','Servizio',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','fr-FR','Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','es-ES','Servicio',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','de-DE','Dienst',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular','pt-PT','Serviço',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','en-GB','Services',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','en-US','Services',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','it-IT','Servizi',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','fr-FR','Services',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','es-ES','Servicios',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','de-DE','Dienste',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.plural','pt-PT','Serviços',now(),'devin',now(),'devin',1),
  -- role
  ('system.entities.role.singular','en-GB','Role',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','en-US','Role',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','it-IT','Ruolo',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','fr-FR','Rôle',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','es-ES','Rol',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','de-DE','Rolle',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular','pt-PT','Função',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','en-GB','Roles',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','en-US','Roles',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','it-IT','Ruoli',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','fr-FR','Rôles',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','es-ES','Roles',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','de-DE','Rollen',now(),'devin',now(),'devin',1),
  ('system.entities.role.plural','pt-PT','Funções',now(),'devin',now(),'devin',1),
  -- singular_definite (entity name WITH the definite article, used inside
  -- confirm questions — e.g. it-IT "il Modello AI", de-DE accusative)
  -- ai_model
  ('system.entities.ai_model.singular_definite','en-GB','the AI Model',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','en-US','the AI Model',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','it-IT','il Modello AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','fr-FR','le Modèle IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','es-ES','el Modelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','de-DE','das KI-Modell',now(),'devin',now(),'devin',1),
  ('system.entities.ai_model.singular_definite','pt-PT','o Modelo de IA',now(),'devin',now(),'devin',1),
  -- ai_cerebellum
  ('system.entities.ai_cerebellum.singular_definite','en-GB','the AI Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','en-US','the AI Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','it-IT','il Cervelletto AI',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','fr-FR','le Cervelet IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','es-ES','el Cerebelo de IA',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','de-DE','das KI-Cerebellum',now(),'devin',now(),'devin',1),
  ('system.entities.ai_cerebellum.singular_definite','pt-PT','o Cerebelo de IA',now(),'devin',now(),'devin',1),
  -- service_registry
  ('system.entities.service_registry.singular_definite','en-GB','the Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','en-US','the Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','it-IT','il Servizio',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','fr-FR','le Service',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','es-ES','el Servicio',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','de-DE','den Dienst',now(),'devin',now(),'devin',1),
  ('system.entities.service_registry.singular_definite','pt-PT','o Serviço',now(),'devin',now(),'devin',1),
  -- role
  ('system.entities.role.singular_definite','en-GB','the Role',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','en-US','the Role',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','it-IT','il Ruolo',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','fr-FR','le Rôle',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','es-ES','el Rol',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','de-DE','die Rolle',now(),'devin',now(),'devin',1),
  ('system.entities.role.singular_definite','pt-PT','a Função',now(),'devin',now(),'devin',1),
  -- customer
  ('system.entities.customer.singular_definite','en-GB','the customer',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','en-US','the customer',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','it-IT','il Cliente',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','fr-FR','le client',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','es-ES','el cliente',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','de-DE','den Kunden',now(),'devin',now(),'devin',1),
  ('system.entities.customer.singular_definite','pt-PT','o cliente',now(),'devin',now(),'devin',1),
  -- organization
  ('system.entities.organization.singular_definite','en-GB','the organization',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','en-US','the organization',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','it-IT','l''organizzazione',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','fr-FR','l''organisation',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','es-ES','la organización',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','de-DE','die Organisation',now(),'devin',now(),'devin',1),
  ('system.entities.organization.singular_definite','pt-PT','a organização',now(),'devin',now(),'devin',1),
  -- role_mapping
  ('system.entities.role_mapping.singular_definite','en-GB','the Role Mapping',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','en-US','the Role Mapping',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','it-IT','la Mappatura Ruolo',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','fr-FR','le Mappage de Rôle',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','es-ES','el Mapeo de Rol',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','de-DE','die Rollen-Zuordnung',now(),'devin',now(),'devin',1),
  ('system.entities.role_mapping.singular_definite','pt-PT','o Mapeamento de Função',now(),'devin',now(),'devin',1),
  -- user_profile
  ('system.entities.user_profile.singular_definite','en-GB','the User',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','en-US','the User',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','it-IT','l''Utente',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','fr-FR','l''Utilisateur',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','es-ES','el Usuario',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','de-DE','den Benutzer',now(),'devin',now(),'devin',1),
  ('system.entities.user_profile.singular_definite','pt-PT','o Utilizador',now(),'devin',now(),'devin',1),
  -- config_entry
  ('system.entities.config_entry.singular_definite','en-GB','the Configuration Entry',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','en-US','the Configuration Entry',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','it-IT','la Voce di Configurazione',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','fr-FR','l''Entrée de Configuration',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','es-ES','la Entrada de Configuración',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','de-DE','den Konfigurationseintrag',now(),'devin',now(),'devin',1),
  ('system.entities.config_entry.singular_definite','pt-PT','a Entrada de Configuração',now(),'devin',now(),'devin',1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- 4. Superseded generic/custom title keys (hard delete — no tech debt).
--    NOTE: app.common.deleteConfirm is KEPT — it is the "This action cannot be
--    undone." second line of DeleteDialog.
DELETE FROM public.translations
WHERE key IN (
  'app.common.deleteConfirmTitle',
  'app.common.restoreConfirmTitle',
  'app.common.restoreConfirm',
  'system.entities.list.bulkActions.deleteConfirmTitle',
  'system.entities.list.bulkActions.restoreConfirmTitle',
  'system.settings.roles.deleteConfirmTitle',
  'system.settings.roles.deleteConfirmBody'
);
DELETE FROM system.translations
WHERE key IN (
  'system.entities.list.bulkActions.deleteConfirmTitle',
  'system.entities.list.bulkActions.restoreConfirmTitle',
  'system.settings.roles.deleteConfirmTitle',
  'system.settings.roles.deleteConfirmBody'
);

COMMIT;
