-- Fire-and-forget patch: explanation + disclaimer translations for the
-- AI model power_level popover on /system/settings/ai.
--
-- Keys added (× 6 languages, system.translations):
--   system.entities.ai_model.power_level.explanation
--   system.entities.ai_model.power_level.disclaimer
--
-- ⚠️ REDIS CACHE INVALIDATION REQUIRED after running this script!
--   redis-cli --scan --pattern 'translations:i18n:system:*' | xargs redis-cli del

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.entities.ai_model.power_level.explanation', 'en-GB', 'Measures model capacity from parameter count (1B, 2B, ...) and quantization — it reflects the weights only. A low value means limited capability; a high value means more capability but also more VRAM and compute, so a more powerful machine is required.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.explanation', 'it-IT', 'Misura la capacità del modello in base ai parametri (1B, 2B, ...) e alla quantizzazione — riguarda solo i pesi. Un valore basso indica poca potenza, un valore alto molta potenza, ma più potenza richiede più VRAM e calcolo: serve una macchina più potente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.explanation', 'fr-FR', 'Mesure la capacité du modèle selon le nombre de paramètres (1B, 2B, ...) et la quantification — uniquement les poids. Une valeur basse indique peu de puissance, une valeur élevée beaucoup de puissance, mais plus de puissance exige plus de VRAM et de calcul : il faut une machine plus puissante.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.explanation', 'es-ES', 'Mide la capacidad del modelo según el número de parámetros (1B, 2B, ...) y la cuantización — solo los pesos. Un valor bajo indica poca potencia, uno alto mucha potencia, pero más potencia requiere más VRAM y cómputo: se necesita una máquina más potente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.explanation', 'de-DE', 'Misst die Modellkapazität anhand der Parameterzahl (1B, 2B, ...) und der Quantisierung — nur die Gewichte. Ein niedriger Wert bedeutet geringe Leistung, ein hoher Wert hohe Leistung, aber mehr Leistung erfordert mehr VRAM und Rechenleistung: ein leistungsstärkerer Rechner ist nötig.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.explanation', 'pt-PT', 'Mede a capacidade do modelo com base no número de parâmetros (1B, 2B, ...) e na quantização — apenas os pesos. Um valor baixo indica pouca potência, um valor alto muita potência, mas mais potência exige mais VRAM e computação: é preciso uma máquina mais potente.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'en-GB', 'The synthetic value for the real overall power of the model is Rank (Classifica).', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'it-IT', 'Il valore sintetico della potenza reale del modello è la Classifica (Rank).', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'fr-FR', 'La valeur synthétique de la puissance réelle du modèle est le Classement (Rank).', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'es-ES', 'El valor sintético de la potencia real del modelo es la Clasificación (Rank).', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'de-DE', 'Der synthetische Wert für die tatsächliche Gesamtleistung des Modells ist der Rang (Classifica).', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.entities.ai_model.power_level.disclaimer', 'pt-PT', 'O valor sintético da potência real do modelo é a Classificação (Rank).', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
