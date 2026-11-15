-- Primebrick: app.common.validation.system_trigger_immutable — raised by
-- the job-handler's frozen-set rule (assertSystemTriggerMutable) when a
-- write touches a code-owned field of a system trigger (`system_key` set):
-- source, destination, run_as, payload_map and filter are the module's
-- interchange contract. The user keeps schedule_spec and name. All 7
-- supported languages.

INSERT INTO public.translations (uuid, key, language, value, created_at, created_by, updated_at, updated_by, version)
VALUES
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'en-GB', 'Managed by the module that declared this trigger — it cannot be changed', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'en-US', 'Managed by the module that declared this trigger — it cannot be changed', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'it-IT', 'Gestito dal modulo che ha dichiarato questo trigger — non può essere modificato', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'fr-FR', 'Géré par le module qui a déclaré ce déclencheur — il ne peut pas être modifié', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'es-ES', 'Gestionado por el módulo que declaró este trigger — no se puede cambiar', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'de-DE', 'Wird vom Modul verwaltet, das diesen Trigger deklariert hat — kann nicht geändert werden', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1),
  (uuidv7(), 'app.common.validation.system_trigger_immutable', 'pt-PT', 'Gerido pelo módulo que declarou este trigger — não pode ser alterado', now(), 'migration-system-trigger', now(), 'migration-system-trigger', 1);
