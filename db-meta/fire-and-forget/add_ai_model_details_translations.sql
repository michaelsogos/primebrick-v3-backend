-- Fire-and-forget patch: labels for the selected-model details popover in
-- the browser-local Smart Regex AI panel.

BEGIN;

WITH localized(key_suffix, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('title', 'Model details', 'Dettagli modello', 'Détails du modèle', 'Detalles del modelo', 'Modelldetails', 'Detalhes do modelo'),
    ('engine', 'Engine', 'Motore', 'Moteur', 'Motor', 'Engine', 'Motor'),
    ('quantization', 'Quantization', 'Quantizzazione', 'Quantification', 'Cuantización', 'Quantisierung', 'Quantização'),
    ('download_size', 'Download size', 'Dimensione download', 'Taille du téléchargement', 'Tamaño de descarga', 'Downloadgröße', 'Tamanho da transferência'),
    ('cache_size', 'Cache size', 'Dimensione cache', 'Taille du cache', 'Tamaño de caché', 'Cachegröße', 'Tamanho da cache'),
    ('vram_size', 'VRAM size', 'Dimensione VRAM', 'Taille VRAM', 'Tamaño de VRAM', 'VRAM-Größe', 'Tamanho da VRAM'),
    ('power', 'Power', 'Potenza', 'Puissance', 'Potencia', 'Leistung', 'Potência'),
    ('test_score', 'Test', 'Test', 'Test', 'Prueba', 'Test', 'Teste'),
    ('speed', 'Speed', 'Velocità', 'Vitesse', 'Velocidad', 'Geschwindigkeit', 'Velocidade'),
    ('rank', 'Rank', 'Classifica', 'Classement', 'Clasificación', 'Rang', 'Classificação')
), expanded AS (
  SELECT 'app.smart.regex.ai.model_details.' || key_suffix AS key, language, value
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
