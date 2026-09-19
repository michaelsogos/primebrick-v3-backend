-- Fire-and-forget patch: Smart JSON assistant translations_preview card
-- (per-language approval before the key merge is proposed).
-- Keys: app.smart.json.ai.translations_preview.*
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:public:*' | xargs redis-cli del

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('translations_preview.intro', 'Review the translations for {key} — approve each language, then accept to use them:', 'Controlla le traduzioni per {key} — approva ogni lingua, poi accetta per usarle:', 'Vérifiez les traductions pour {key} — approuvez chaque langue, puis acceptez pour les utiliser :', 'Revisa las traducciones de {key} — aprueba cada idioma y luego acepta para usarlas:', 'Überprüfen Sie die Übersetzungen für {key} — genehmigen Sie jede Sprache und akzeptieren Sie dann:', 'Reveja as traduções de {key} — aprove cada idioma e depois aceite para usá-las:'),
    ('translations_preview.approve', 'Approve', 'Approva', 'Approuver', 'Aprobar', 'Genehmigen', 'Aprovar'),
    ('translations_preview.counter', '{approved}/{total} approved', '{approved}/{total} approvate', '{approved}/{total} approuvées', '{approved}/{total} aprobadas', '{approved}/{total} genehmigt', '{approved}/{total} aprovadas'),
    ('translations_preview.approve_all', 'Approve all', 'Approva tutte', 'Tout approuver', 'Aprobar todas', 'Alle genehmigen', 'Aprovar todas'),
    ('translations_preview.accept', 'Accept translations', 'Accetta traduzioni', 'Accepter les traductions', 'Aceptar traducciones', 'Übersetzungen akzeptieren', 'Aceitar traduções'),
    ('translations_preview.reject', 'Key only', 'Solo chiave', 'Clé uniquement', 'Solo clave', 'Nur Schlüssel', 'Apenas chave')
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

COMMIT;
