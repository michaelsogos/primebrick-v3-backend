-- Fire-and-forget patch: default-model badge + "set as default" CTA labels
-- for the AI model catalogue (/system/settings/ai page).

BEGIN;

WITH localized(key, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('system.entities.ai_model.default',
     'Default', 'Predefinito', 'Par défaut', 'Predeterminado', 'Standard', 'Predefinido'),
    ('system.entities.ai_model.set_as_default',
     'Set as default', 'Imposta come predefinito', 'Définir par défaut',
     'Establecer como predeterminado', 'Als Standard festlegen', 'Definir como predefinido')
), expanded AS (
  SELECT key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO system.translations (key, language, value, created_by, updated_by)
SELECT key, language, value, 'system_migration', 'system_migration'
FROM expanded
ON CONFLICT (key, language) WHERE deleted_at IS NULL
DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by;

COMMIT;
