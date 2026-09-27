-- Fix machine-rank gauge label in all languages: "Rank" is an anglicism /
-- calibration term — the gauge shows the machine capability TIER.
-- it-IT: "Rank Macchina" -> "Classe Macchina"; other languages switched from
-- rank-calques to tier/class equivalents.
-- NOTE: out-of-band write — remember to invalidate Redis afterwards:
--   redis-cli --scan --pattern "translations:i18n:system:*" | xargs redis-cli DEL
UPDATE system.translations SET value = 'Machine Tier',     updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language IN ('en-GB','en-US') AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Classe Macchina',  updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language = 'it-IT'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Niveau Machine',   updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language = 'fr-FR'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Nivel de Máquina', updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language = 'es-ES'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Maschinenklasse',  updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language = 'de-DE'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Nível da Máquina', updated_at = now(), updated_by = 'devin' WHERE key = 'system.settings.ai.machine.machine_rank' AND language = 'pt-PT'           AND deleted_at IS NULL;
