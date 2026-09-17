-- Fire-and-forget patch: speed-score gauge labels and ranking-chain
-- explanation for the AI model catalogue.

BEGIN;

WITH localized(key, en_gb, it_it, fr_fr, es_es, de_de, pt_pt) AS (
  VALUES
    ('system.entities.ai_model.fields.speed',
     'Speed', 'Velocità', 'Vitesse', 'Velocidad', 'Geschwindigkeit', 'Velocidade'),
    ('system.entities.ai_model.speed.explanation',
     'Speed is the mean of the scores assigned to the real response time of every test turn.',
     'La velocità è la media dei punteggi assegnati al tempo reale di risposta di ogni turno di test.',
     'La vitesse est la moyenne des scores attribués au temps de réponse réel de chaque tour de test.',
     'La velocidad es la media de las puntuaciones asignadas al tiempo de respuesta real de cada turno de prueba.',
     'Die Geschwindigkeit ist der Mittelwert der Bewertungen für die reale Antwortzeit jeder Testrunde.',
     'A velocidade é a média das pontuações atribuídas ao tempo de resposta real de cada turno de teste.')
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
