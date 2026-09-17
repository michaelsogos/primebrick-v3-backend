-- Explanation translations for the speed-aware rank formula.
-- All 6 languages: rank = quality × 0.8 + speed × 0.2.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.rank.explanation', 'en-GB', 'Composite score: quality weighs 80%, speed weighs 20%. Quality is the mean of per-turn test scores (5 turns); speed is scored from real response times.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'it-IT', 'Punteggio composito: la qualità pesa 80%, la velocità pesa 20%. La qualità è la media dei punteggi per turno (5 turni); la velocità deriva dai tempi di risposta reali.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'fr-FR', 'Score composite : la qualité pèse 80%, la vitesse 20%. La qualité est la moyenne des scores par tour (5 tours); la vitesse dérive des temps de réponse réels.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'es-ES', 'Puntuación compuesta: la calidad pesa 80%, la velocidad 20%. La calidad es la media de los puntajes por turno (5 turnos); la velocidad deriva de los tiempos de respuesta reales.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'de-DE', 'Zusammengesetzte Punktzahl: Qualität gewichtet 80%, Geschwindigkeit 20%. Qualität ist der Mittelwert der Turn-Scores (5 Turns); Geschwindigkeit ergibt sich aus echten Antwortzeiten.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'pt-PT', 'Pontuação composta: a qualidade pesa 80%, a velocidade 20%. A qualidade é a média das pontuações por turno (5 turnos); a velocidade deriva dos tempos de resposta reais.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();
