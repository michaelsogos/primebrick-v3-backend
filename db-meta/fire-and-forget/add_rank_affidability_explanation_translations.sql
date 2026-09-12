-- Add explanation translations for affidability and rank formulas.
-- All 6 languages.

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.affidability.explanation', 'en-GB', 'Derived from the arithmetic mean of all test case scores, rounded to the nearest integer.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.affidability.explanation', 'it-IT', 'Derivata dalla media aritmetica dei punteggi di tutti i test case, arrotondata al numero intero più vicino.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.affidability.explanation', 'fr-FR', 'Dérivée de la moyenne arithmétique de tous les scores de test, arrondie à l''entier le plus proche.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.affidability.explanation', 'es-ES', 'Derivada de la media aritmética de todos los puntajes de casos de prueba, redondeada al entero más cercano.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.affidability.explanation', 'de-DE', 'Abgeleitet vom arithmetischen Mittel aller Testfall-Scores, auf die nächste ganze Zahl gerundet.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.affidability.explanation', 'pt-PT', 'Derivada da média aritmética de todas as pontuações de casos de teste, arredondada para o número inteiro mais próximo.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.rank.explanation', 'en-GB', 'Composite score: affidability weighs 70%, power level weighs 30%. A reliable but lightweight model ranks higher than a powerful but unreliable one.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'it-IT', 'Punteggio composito: l''affidabilità pesa 70%, il livello di potenza pesa 30%. Un modello affidabile ma leggero si classifica meglio di uno potente ma inaffidabile.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'fr-FR', 'Score composite : la fiabilité pèse 70%, le niveau de puissance pèse 30%. Un modèle fiable mais léger est mieux classé qu''un modèle puissant mais peu fiable.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'es-ES', 'Puntuación compuesta: la confiabilidad pesa 70%, el nivel de potencia pesa 30%. Un modelo confiable pero ligero se clasifica mejor que uno potente pero poco confiable.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'de-DE', 'Zusammengesetzte Punktzahl: Zuverlässigkeit gewichtet 70%, Leistungsniveau 30%. Ein zuverlässiges aber leichtes Modell rangiert höher als ein leistungsstarkes aber unzuverlässiges.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.rank.explanation', 'pt-PT', 'Pontuação composta: a confiabilidade pesa 70%, o nível de potência pesa 30%. Um modelo confiável mas leve classifica-se melhor que um poderoso mas não confiável.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
