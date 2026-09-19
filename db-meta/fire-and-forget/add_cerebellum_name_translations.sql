-- Fire-and-forget migration: cerebellum display names as i18n keys
--
-- The cerebellum footer selector renders `name` through $t(), so the
-- seeded rows store translation keys, not literal display strings — the
-- selector then shows the same localized assistant name as the sheet
-- title. Adds the cerebellum_name keys for both seeded assistants and
-- repoints the seed rows at them.
--
-- Date: 2026-10-02

BEGIN;

-- 1. Repoint seed rows at translation keys.
UPDATE "public"."ai_cerebellum"
SET "name" = 'app.smart.regex.ai.cerebellum_name', "updated_by" = 'system', "updated_at" = now()
WHERE "assistant_key" = 'regex' AND "deleted_at" IS NULL;

UPDATE "public"."ai_cerebellum"
SET "name" = 'app.smart.json.ai.cerebellum_name', "updated_by" = 'system', "updated_at" = now()
WHERE "assistant_key" = 'json_config' AND "deleted_at" IS NULL;

-- 2. Seed the cerebellum_name translations (6 locales).
WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.smart.json.ai.cerebellum_name', 'JSON Configurator', 'Configuratore JSON', 'Configurateur JSON', 'Configurador JSON', 'JSON-Konfigurator', 'Configurador JSON'),
    ('app.smart.regex.ai.cerebellum_name', 'Regex Configurator', 'Configuratore Regex', 'Configurateur Regex', 'Configurador Regex', 'Regex-Konfigurator', 'Configurador Regex')
), expanded AS (
  SELECT key_suffix AS key, language, value
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
