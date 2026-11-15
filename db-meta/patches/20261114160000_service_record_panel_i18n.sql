-- Primebrick: service-record-panel-i18n — labels for the `service.record`
-- sheet panel (opened by lazy `ref` cells whose per-row target resolves to
-- `service_registry`): the arming section title, the service detail field
-- labels not already covered by `system.settings.modules.*`, the
-- `job_schedule.run_as` field label + its `user|system` value labels at
-- system scope (the panel reads them when the job dict is not loaded), and
-- the sparkline "no runs" zero-bucket tooltip line. All 7 supported
-- languages.

INSERT INTO system.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  -- service_registry.armed_schedule — the panel section naming the schedule
  -- this service armed ("the trigger-arm parallel minimum").
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'en-GB', 'Armed schedule', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'en-US', 'Armed schedule', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'it-IT', 'Pianificazione armata', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'fr-FR', 'Planification armée', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'es-ES', 'Programación armada', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'de-DE', 'Aktivierter Zeitplan', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.armed_schedule', 'pt-PT', 'Agendamento armado', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  -- service_registry field labels not already owned by the modules page.
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'en-GB', 'Part of', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'en-US', 'Part of', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'it-IT', 'Parte di', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'fr-FR', 'Partie de', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'es-ES', 'Parte de', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'de-DE', 'Teil von', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.part_of', 'pt-PT', 'Parte de', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'en-GB', 'Capabilities', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'en-US', 'Capabilities', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'it-IT', 'Capacità', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'fr-FR', 'Capacités', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'es-ES', 'Capacidades', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'de-DE', 'Fähigkeiten', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.capabilities', 'pt-PT', 'Capacidades', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'en-GB', 'Schemas', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'en-US', 'Schemas', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'it-IT', 'Schemi', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'fr-FR', 'Schémas', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'es-ES', 'Esquemas', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'de-DE', 'Schemata', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.schemas', 'pt-PT', 'Esquemas', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  (uuidv7(), 'system.entities.service_registry.fields.status', 'en-GB', 'Status', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'en-US', 'Status', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'it-IT', 'Stato', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'fr-FR', 'Statut', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'es-ES', 'Estado', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'de-DE', 'Status', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.service_registry.fields.status', 'pt-PT', 'Estado', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  -- job_schedule.run_as at system scope — the panel shows the arming
  -- execution lane; the field label + value labels must resolve even when
  -- the job module dict is not loaded.
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'en-GB', 'Run As', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'en-US', 'Run As', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'it-IT', 'Esegue come', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'fr-FR', 'Exécute en tant que', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'es-ES', 'Ejecuta como', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'de-DE', 'Ausführen als', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.fields.run_as', 'pt-PT', 'Executa como', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  (uuidv7(), 'system.entities.job_schedule.values.user', 'en-GB', 'User', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'en-US', 'User', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'it-IT', 'Utente', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'fr-FR', 'Utilisateur', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'es-ES', 'Usuario', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'de-DE', 'Benutzer', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.user', 'pt-PT', 'Usuário', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  (uuidv7(), 'system.entities.job_schedule.values.system', 'en-GB', 'System', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'en-US', 'System', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'it-IT', 'Sistema', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'fr-FR', 'Système', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'es-ES', 'Sistema', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'de-DE', 'System', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.job_schedule.values.system', 'pt-PT', 'Sistema', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),

  -- SparklineBars zero-bucket tooltip line — one honest label instead of a
  -- list of zero-valued series rows.
  (uuidv7(), 'system.entities.list.no_runs', 'en-GB', 'No runs', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'en-US', 'No runs', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'it-IT', 'Nessuna esecuzione', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'fr-FR', 'Aucune exécution', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'es-ES', 'Sin ejecuciones', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'de-DE', 'Keine Ausführungen', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1),
  (uuidv7(), 'system.entities.list.no_runs', 'pt-PT', 'Sem execuções', now(), 'migration-service-record-panel', now(), 'migration-service-record-panel', 1);
