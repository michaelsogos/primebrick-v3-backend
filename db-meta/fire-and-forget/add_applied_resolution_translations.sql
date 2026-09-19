-- Fire-and-forget migration: apply-resolution keys for the shared AI
-- assistant panels (app.smart.regex.ai.applied/continue_hint and
-- app.smart.json.ai.applied/continue_hint).
--
-- After Apply/Discard the choice card's CTAs collapse: an applied value
-- shows a success label ("applied") plus a hint that the assistant keeps
-- refining; a discarded value renders nothing. The sheet no longer closes
-- on apply.
--
-- Date: 2026-10-02

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('applied', 'Value applied', 'Valore applicato', 'Valeur appliquée', 'Valor aplicado', 'Wert angewendet', 'Valor aplicado'),
    ('continue_hint', 'You can keep refining the configuration in the chat.', 'Puoi continuare a raffinare la configurazione nella chat.', 'Vous pouvez continuer à affiner la configuration dans le chat.', 'Puedes seguir refinando la configuración en el chat.', 'Sie können die Konfiguration im Chat weiter verfeinern.', 'Podes continuar a refinar a configuração no chat.')
), expanded AS (
  SELECT 'app.smart.json.ai.' || key_suffix AS key, language, value
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

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('applied', 'Pattern applied', 'Pattern applicato', 'Motif appliqué', 'Patrón aplicado', 'Muster angewendet', 'Padrão aplicado'),
    ('continue_hint', 'You can keep refining the pattern in the chat.', 'Puoi continuare a raffinare il pattern nella chat.', 'Vous pouvez continuer à affiner le motif dans le chat.', 'Puedes seguir refinando el patrón en el chat.', 'Sie können das Muster im Chat weiter verfeinern.', 'Podes continuar a refinar o padrão no chat.')
), expanded AS (
  SELECT 'app.smart.regex.ai.' || key_suffix AS key, language, value
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
