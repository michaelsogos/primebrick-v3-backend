-- Fix it-IT translation for the machine-rank gauge label: "Rank Macchina"
-- is an anglicism — "Classe Macchina" is the natural Italian term for a
-- machine capability tier.
UPDATE system.translations
SET value = 'Classe Macchina', updated_at = now(), updated_by = 'devin'
WHERE key = 'system.settings.ai.machine.machine_rank'
  AND language = 'it-IT'
  AND deleted_at IS NULL;
