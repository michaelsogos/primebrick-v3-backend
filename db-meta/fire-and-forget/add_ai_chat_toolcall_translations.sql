-- Fire-and-forget patch: AI chat tool-call confirmation (B3 caller-driven loop)
--
-- app.aiChat.toolCallConfirm — shown in the pending-tool-call banner when the
-- AI requests a WRITE MCP tool (read-only tools auto-execute; local client
-- tools like navigate keep using app.aiChat.navigateConfirm).
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del
--
-- Date: 2026-10-11

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('app.aiChat.toolCallConfirm',
     'Run action {tool}?', 'Eseguire l''azione {tool}?', 'Exécuter l''action {tool} ?', '¿Ejecutar la acción {tool}?', 'Aktion {tool} ausführen?', 'Executar a ação {tool}?')
), expanded AS (
  SELECT key_suffix AS key, language, value
  FROM localized
  CROSS JOIN LATERAL (VALUES
    ('en-GB', en_gb), ('it-IT', it_it), ('fr-FR', fr_fr),
    ('es-ES', es_es), ('de-DE', de_de), ('pt-PT', pt_pt)
  ) AS translation(language, value)
)
INSERT INTO public.translations (key, language, value, created_at, created_by, updated_at, updated_by, version)
SELECT key, language, value, now(), 'initial-setup', now(), 'initial-setup', 1
FROM expanded
ON CONFLICT (key, language) DO NOTHING;

COMMIT;
