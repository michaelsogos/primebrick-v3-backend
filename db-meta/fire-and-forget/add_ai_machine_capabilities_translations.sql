-- Fire-and-forget: translations for the AI settings machine-capabilities
-- section (browser-measured bandwidth/GFLOPS + on-demand VRAM knee probe).
--
-- Languages: en-GB, en-US, it-IT, fr-FR, es-ES, de-DE, pt-PT
-- Idempotent via ON CONFLICT.

BEGIN;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.title', 'en-GB', 'Machine Capabilities', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'en-US', 'Machine Capabilities', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'it-IT', 'Capacità della Macchina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'fr-FR', 'Capacités de la Machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'es-ES', 'Capacidades de la Máquina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'de-DE', 'Maschinenfähigkeiten', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.title', 'pt-PT', 'Capacidades da Máquina', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.measuring', 'en-GB', 'Measuring machine performance…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'en-US', 'Measuring machine performance…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'it-IT', 'Misurazione delle prestazioni…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'fr-FR', 'Mesure des performances…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'es-ES', 'Midiendo el rendimiento…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'de-DE', 'Leistung wird gemessen…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.measuring', 'pt-PT', 'Medindo o desempenho…', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.probe_vram', 'en-GB', 'Measure GPU Memory', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'en-US', 'Measure GPU Memory', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'it-IT', 'Misura Memoria GPU', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'fr-FR', 'Mesurer la Mémoire GPU', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'es-ES', 'Medir Memoria GPU', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'de-DE', 'GPU-Speicher messen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probe_vram', 'pt-PT', 'Medir Memória GPU', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.probing', 'en-GB', 'Measuring GPU memory…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'en-US', 'Measuring GPU memory…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'it-IT', 'Misurazione memoria GPU…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'fr-FR', 'Mesure de la mémoire GPU…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'es-ES', 'Midiendo memoria GPU…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'de-DE', 'GPU-Speicher wird gemessen…', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.probing', 'pt-PT', 'Medindo memória GPU…', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.unavailable', 'en-GB', 'WebGPU is not available in this browser — machine capabilities cannot be measured.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'en-US', 'WebGPU is not available in this browser — machine capabilities cannot be measured.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'it-IT', 'WebGPU non è disponibile in questo browser — le capacità della macchina non sono misurabili.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'fr-FR', 'WebGPU n''est pas disponible dans ce navigateur — les capacités de la machine ne peuvent pas être mesurées.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'es-ES', 'WebGPU no está disponible en este navegador — no se pueden medir las capacidades de la máquina.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'de-DE', 'WebGPU ist in diesem Browser nicht verfügbar — die Maschinenfähigkeiten können nicht gemessen werden.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.unavailable', 'pt-PT', 'WebGPU não está disponível neste navegador — as capacidades da máquina não podem ser medidas.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.bandwidth', 'en-GB', 'Memory Bandwidth', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'en-US', 'Memory Bandwidth', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'it-IT', 'Banda di Memoria', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'fr-FR', 'Bande Passante Mémoire', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'es-ES', 'Ancho de Banda de Memoria', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'de-DE', 'Speicherbandbreite', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.bandwidth', 'pt-PT', 'Largura de Banda de Memória', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.compute', 'en-GB', 'Compute Power', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'en-US', 'Compute Power', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'it-IT', 'Potenza di Calcolo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'fr-FR', 'Puissance de Calcul', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'es-ES', 'Potencia de Cálculo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'de-DE', 'Rechenleistung', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.compute', 'pt-PT', 'Poder de Cálculo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.vram_dedicated', 'en-GB', 'Dedicated VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'en-US', 'Dedicated VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'it-IT', 'VRAM Dedicata', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'fr-FR', 'VRAM Dédiée', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'es-ES', 'VRAM Dedicada', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'de-DE', 'Dedizierter VRAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_dedicated', 'pt-PT', 'VRAM Dedicada', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.vram_shared', 'en-GB', 'shared', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'en-US', 'shared', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'it-IT', 'condivisa', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'fr-FR', 'partagée', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'es-ES', 'compartida', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'de-DE', 'geteilt', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.vram_shared', 'pt-PT', 'compartilhada', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.machine_rank', 'en-GB', 'Machine Rank', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'en-US', 'Machine Rank', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'it-IT', 'Rank Macchina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'fr-FR', 'Rang Machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'es-ES', 'Rango de Máquina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'de-DE', 'Maschinenrang', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.machine_rank', 'pt-PT', 'Rank da Máquina', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.rank_requires_probe', 'en-GB', 'Measure GPU memory to compute the machine rank.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'en-US', 'Measure GPU memory to compute the machine rank.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'it-IT', 'Misura la memoria GPU per calcolare il rank della macchina.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'fr-FR', 'Mesurez la mémoire GPU pour calculer le rang de la machine.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'es-ES', 'Mide la memoria GPU para calcular el rango de la máquina.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'de-DE', 'GPU-Speicher messen, um den Maschinenrang zu berechnen.', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.rank_requires_probe', 'pt-PT', 'Meça a memória GPU para calcular o rank da máquina.', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

COMMIT;

-- Addendum: system RAM + CPU thread chips
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.system_memory', 'en-GB', 'System RAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'en-US', 'System RAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'it-IT', 'RAM di Sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'fr-FR', 'RAM Système', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'es-ES', 'RAM del Sistema', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'de-DE', 'System-RAM', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.system_memory', 'pt-PT', 'RAM do Sistema', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.cpu_threads', 'en-GB', 'threads', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'en-US', 'threads', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'it-IT', 'thread', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'fr-FR', 'threads', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'es-ES', 'hilos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'de-DE', 'Threads', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.cpu_threads', 'pt-PT', 'threads', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- Addendum 2: "fits catalog" chip (memory probe semantics — no VRAM claim)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.machine.fits_catalog', 'en-GB', 'Fast memory fits the whole model catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'en-US', 'Fast memory fits the whole model catalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'it-IT', 'Memoria veloce sufficiente per tutto il catalogo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'fr-FR', 'Mémoire rapide suffisante pour tout le catalogue', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'es-ES', 'Memoria rápida suficiente para todo el catálogo', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'de-DE', 'Schneller Speicher reicht für den gesamten Katalog', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.machine.fits_catalog', 'pt-PT', 'Memória rápida suficiente para todo o catálogo', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- Addendum 3: "fits this machine" toolbar filter switch (models list)
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.models_section.fits_machine', 'en-GB', 'Only models that fit this machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'en-US', 'Only models that fit this machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'it-IT', 'Solo modelli compatibili con questa macchina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'fr-FR', 'Uniquement les modèles compatibles avec cette machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'es-ES', 'Solo modelos compatibles con esta máquina', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'de-DE', 'Nur Modelle, die auf diese Maschine passen', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine', 'pt-PT', 'Apenas modelos compatíveis com esta máquina', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;

-- Addendum 4: fits-machine switch state labels
INSERT INTO system.translations (key, language, value, created_at, created_by, updated_at, updated_by, version) VALUES
  ('system.settings.ai.models_section.fits_machine_only', 'en-GB', 'Fits machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'en-US', 'Fits machine', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'it-IT', 'Solo compatibili', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'fr-FR', 'Compatibles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'es-ES', 'Solo compatibles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'de-DE', 'Nur kompatible', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.fits_machine_only', 'pt-PT', 'Só compatíveis', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'en-GB', 'All models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'en-US', 'All models', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'it-IT', 'Tutti i modelli', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'fr-FR', 'Tous les modèles', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'es-ES', 'Todos los modelos', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'de-DE', 'Alle Modelle', now(), 'initial-setup', now(), 'initial-setup', 1),
  ('system.settings.ai.models_section.all_models', 'pt-PT', 'Todos os modelos', now(), 'initial-setup', now(), 'initial-setup', 1)
ON CONFLICT (key, language) WHERE deleted_at IS NULL DO NOTHING;
