-- update_ai_machine_kpi_labels.sql
-- KPI label fixes: plain "VRAM" -> "Video RAM"; "threads" -> "CPU Threads".
UPDATE system.translations SET value = 'Video RAM',    updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language IN ('en-GB','en-US') AND deleted_at IS NULL;
UPDATE system.translations SET value = 'RAM video',    updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language = 'it-IT'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'RAM vidéo',    updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language = 'fr-FR'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'RAM de vídeo', updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language = 'es-ES'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Video-RAM',    updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language = 'de-DE'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'RAM de vídeo', updated_at = now() WHERE key = 'system.settings.ai.machine.vram'        AND language = 'pt-PT'           AND deleted_at IS NULL;

UPDATE system.translations SET value = 'CPU Threads',   updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language IN ('en-GB','en-US') AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Thread CPU',    updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language = 'it-IT'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Threads CPU',   updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language = 'fr-FR'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Hilos de CPU',  updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language = 'es-ES'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'CPU-Threads',   updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language = 'de-DE'           AND deleted_at IS NULL;
UPDATE system.translations SET value = 'Threads de CPU',updated_at = now() WHERE key = 'system.settings.ai.machine.cpu_threads' AND language = 'pt-PT'           AND deleted_at IS NULL;

-- NOTE: out-of-band write — invalidate Redis after running:
--   redis-cli --scan --pattern "translations:i18n:system:*" | xargs redis-cli DEL
