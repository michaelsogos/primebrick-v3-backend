-- Fire-and-forget patch: sort control labels for the model dropdown in the
-- browser-local Smart Regex AI panel (sort criteria selector + alphabetical
-- option; other criteria reuse existing model_details keys).

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('by', 'Sort by', 'Ordina per', 'Trier par', 'Ordenar por', 'Sortieren nach', 'Ordenar por'),
    ('alphabetic', 'Alphabetical', 'Alfabetico', 'Alphabétique', 'Alfabético', 'Alphabetisch', 'Alfabético')
), expanded AS (
  SELECT 'app.smart.regex.ai.sort.' || key_suffix AS key, language, value
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
