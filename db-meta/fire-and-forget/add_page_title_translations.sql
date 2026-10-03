-- Fire-and-forget patch: canonical entity page-title templates
--
-- Namespace system.entities.page_title.* — single source of truth for
-- list/create/edit page H1 titles. Values are interpolable templates:
-- {entity_plural} / {entity_singular} are replaced at runtime with the
-- entity's translated names (same mechanism as FE interpolateTemplate).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--
-- Date: 2026-10-01

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('system.entities.page_title.list',
     '{entity_plural} List',
     'Lista {entity_plural}',
     'Liste des {entity_plural}',
     'Lista de {entity_plural}',
     'Liste der {entity_plural}',
     'Lista de {entity_plural}'),
    ('system.entities.page_title.create',
     'Create {entity_singular}',
     'Crea {entity_singular}',
     'Créer {entity_singular}',
     'Crear {entity_singular}',
     '{entity_singular} erstellen',
     'Criar {entity_singular}'),
    ('system.entities.page_title.edit',
     'Edit {entity_singular}',
     'Modifica {entity_singular}',
     'Modifier {entity_singular}',
     'Editar {entity_singular}',
     '{entity_singular} bearbeiten',
     'Editar {entity_singular}')
), expanded AS (
  SELECT key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT key, language, value, now(), 'initial-setup', now(), 'initial-setup', 1
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- Shrink: per-entity title keys superseded by the generic templates above.
-- All FE usages migrated to entityPageTitle() (see entities-crud docs).
UPDATE system.translations
SET deleted_at = now(), deleted_by = 'page-title-standard', updated_at = now()
WHERE key IN (
  'system.settings.users.create.title',
  'system.settings.users.update.title',
  'system.settings.roles.createTitle',
  'system.settings.roles.editTitle',
  'system.settings.organizations.create.title',
  'system.settings.organizations.update.title',
  'system.entities.organization.create.title'
) AND deleted_at IS NULL;

COMMIT;
