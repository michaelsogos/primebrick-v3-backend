-- Primebrick: i18n for the `api.partition_maintenance` callable — the
-- census label/description shown when the BE's partition-maintenance
-- system job appears in the callables surface. The callable mounts via
-- makePartitionMaintenanceJob(ENTITY_REGISTRY) in src/index.ts; its
-- label keys ride the BE translations table, whose owning namespace for
-- the public schema is `app.*` (the translationKeyNs rule).

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.callable.partition_maintenance.label', 'en-GB', 'Partition maintenance', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'en-US', 'Partition maintenance', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'it-IT', 'Manutenzione partizioni', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'de-DE', 'Partitionswartung', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'es-ES', 'Mantenimiento de particiones', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'fr-FR', 'Maintenance des partitions', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.label', 'pt-PT', 'Manutenção de partições', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),

  (uuidv7(), 'app.callable.partition_maintenance.desc', 'en-GB', 'Drops partitions whose retention window has elapsed, on every entity that declares one. Takes no parameters.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'en-US', 'Drops partitions whose retention window has elapsed, on every entity that declares one. Takes no parameters.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'it-IT', 'Elimina le partizioni la cui finestra di conservazione è scaduta, su ogni entità che ne dichiara una. Non richiede parametri.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'de-DE', 'Löscht Partitionen, deren Aufbewahrungsfenster abgelaufen ist, bei jeder Entität, die eines deklariert. Erfordert keine Parameter.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'es-ES', 'Elimina las particiones cuya ventana de retención ha vencido, en cada entidad que la declara. No requiere parámetros.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'fr-FR', 'Supprime les partitions dont la fenêtre de rétention est échue, sur chaque entité qui en déclare une. Ne prend aucun paramètre.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1),
  (uuidv7(), 'app.callable.partition_maintenance.desc', 'pt-PT', 'Elimina as partições cuja janela de retenção expirou, em cada entidade que a declara. Não requer parâmetros.', now(), 'migration-partition-callable', now(), 'migration-partition-callable', 1);
