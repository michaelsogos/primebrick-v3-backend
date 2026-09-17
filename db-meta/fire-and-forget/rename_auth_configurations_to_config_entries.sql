-- Fire-and-forget: Rename auth_configurations → config_entries (Config Table standard).
--
-- The platform-wide configuration table is renamed to `config_entries` to match
-- the public API entity name (/api/v1/entities/config_entry/*) and the
-- cross-schema standard (emailsender.config_entries, ai.config_entries).
--
-- This script:
--   1. Renames auth_configurations → config_entries (idempotent guards)
--   2. Renames auth_configurations_audit → config_entries_audit
--   3. Renames the 4 indexes to the config_entries_* naming
--   4. Re-points pg_partman part_config.parent_table for the audit table
--   5. Renames the pg_partman template table if present
--
-- Existing audit partitions keep their auth_configurations_audit_pYYYY_MM names —
-- partition membership is by inheritance, not name; new partitions use the new prefix.
--
-- Run this ONCE on the existing live database. Idempotent.
-- Date: 2026-XX-XX
-- Old sha256: 8d234f3d256ebb1fa2e82a1b739bc5b9b33aac8cbb2a512eddd21fed739cd6a3
-- New sha256: 5fae53f46d552d6af3ffc637beff24faa70c213704652d826e3e644ff869378f
-- Reason: Renamed auth_configurations → config_entries + audit table in init patch.

BEGIN;

-- 1. Main table
ALTER TABLE IF EXISTS "public"."auth_configurations" RENAME TO "config_entries";

-- 2. Audit table (pg_partman parent)
ALTER TABLE IF EXISTS "public"."auth_configurations_audit" RENAME TO "config_entries_audit";

-- 3. Indexes
ALTER INDEX IF EXISTS "public"."auth_configurations_key_uq" RENAME TO "config_entries_key_uq";
ALTER INDEX IF EXISTS "public"."auth_configurations_deleted_at_idx" RENAME TO "config_entries_deleted_at_idx";
ALTER INDEX IF EXISTS "public"."auth_configurations_audit_entity_uuid_idx" RENAME TO "config_entries_audit_entity_uuid_idx";
ALTER INDEX IF EXISTS "public"."auth_configurations_audit_action_idx" RENAME TO "config_entries_audit_action_idx";

-- 4. pg_partman: point the config at the renamed parent
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_partman') THEN
    UPDATE partman.part_config
    SET parent_table = 'public.config_entries_audit'
    WHERE parent_table = 'public.auth_configurations_audit';
  END IF;
END $$;

-- 4b. Rename existing monthly partitions to match the new parent name.
--     (Renaming a partitioned parent does NOT rename its children.)
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT c.relname AS child
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE i.inhparent = 'public.config_entries_audit'::regclass
      AND c.relkind = 'r'
      AND c.relname LIKE 'auth_configurations_audit_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I RENAME TO %I',
      p.child, REPLACE(p.child, 'auth_configurations_audit', 'config_entries_audit'));
  END LOOP;
END $$;

-- 5. pg_partman template table (created lazily by partman; name follows parent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'partman'
      AND c.relname = 'template_public_auth_configurations_audit'
  ) THEN
    ALTER TABLE partman.template_public_auth_configurations_audit
      RENAME TO template_public_config_entries_audit;
  END IF;
END $$;

-- 6. Rename translation keys for the renamed settings section
--    (system.settings.security.* → system.settings.configurations.*,
--     system.settings.tabs.security → system.settings.tabs.configurations).
UPDATE system.translations SET key = 'system.settings.tabs.configurations'
WHERE key = 'system.settings.tabs.security';
-- Only configuration-page keys move to the new namespace. Keys used by the
-- credentials page (password change, OIDC card, delete account) stay under
-- system.settings.security.* because they are security-domain strings.
UPDATE system.translations SET key = REPLACE(key, 'system.settings.security.', 'system.settings.configurations.')
WHERE key LIKE 'system.settings.security.%'
  AND key NOT LIKE ALL (ARRAY[
    'system.settings.security.changePassword%',
    'system.settings.security.currentPassword%',
    'system.settings.security.newPassword%',
    'system.settings.security.confirmPassword%',
    'system.settings.security.changingPassword%',
    'system.settings.security.passwordsDoNotMatch%',
    'system.settings.security.passwordChanged%',
    'system.settings.security.oidc%',
    'system.settings.security.deleteAccount%',
    'system.settings.security.confirmDeleteAccount%'
  ]);
-- Same for the public-schema translations table if it holds these keys.
UPDATE public.translations SET key = 'system.settings.tabs.configurations'
WHERE key = 'system.settings.tabs.security';
UPDATE public.translations SET key = REPLACE(key, 'system.settings.security.', 'system.settings.configurations.')
WHERE key LIKE 'system.settings.security.%'
  AND key NOT LIKE ALL (ARRAY[
    'system.settings.security.changePassword%',
    'system.settings.security.currentPassword%',
    'system.settings.security.newPassword%',
    'system.settings.security.confirmPassword%',
    'system.settings.security.changingPassword%',
    'system.settings.security.passwordsDoNotMatch%',
    'system.settings.security.passwordChanged%',
    'system.settings.security.oidc%',
    'system.settings.security.deleteAccount%',
    'system.settings.security.confirmDeleteAccount%'
  ]);
-- Refresh the page title/description values (tab label was already "Configurations").
UPDATE system.translations SET value = 'Configurations' WHERE key = 'system.settings.configurations.title' AND language = 'en-GB';
UPDATE system.translations SET value = 'Manage platform configuration entries.' WHERE key = 'system.settings.configurations.description' AND language = 'en-GB';
UPDATE system.translations SET value = 'Configurazioni' WHERE key = 'system.settings.configurations.title' AND language = 'it-IT';
UPDATE system.translations SET value = 'Gestisci le voci di configurazione della piattaforma.' WHERE key = 'system.settings.configurations.description' AND language = 'it-IT';
UPDATE system.translations SET value = 'Configurations' WHERE key = 'system.settings.configurations.title' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Gérez les entrées de configuration de la plateforme.' WHERE key = 'system.settings.configurations.description' AND language = 'fr-FR';
UPDATE system.translations SET value = 'Configuraciones' WHERE key = 'system.settings.configurations.title' AND language = 'es-ES';
UPDATE system.translations SET value = 'Gestione las entradas de configuración de la plataforma.' WHERE key = 'system.settings.configurations.description' AND language = 'es-ES';
UPDATE system.translations SET value = 'Konfigurationen' WHERE key = 'system.settings.configurations.title' AND language = 'de-DE';
UPDATE system.translations SET value = 'Verwalten Sie die Konfigurationseinträge der Plattform.' WHERE key = 'system.settings.configurations.description' AND language = 'de-DE';
UPDATE system.translations SET value = 'Configurações' WHERE key = 'system.settings.configurations.title' AND language = 'pt-PT';
UPDATE system.translations SET value = 'Gerencie as entradas de configuração da plataforma.' WHERE key = 'system.settings.configurations.description' AND language = 'pt-PT';

-- 7. Update patch registry hashes (init patch + 6 translation seed patches).
UPDATE "public"."primebrick_database_patches" SET content_sha256 = '5fae53f46d552d6af3ffc637beff24faa70c213704652d826e3e644ff869378f'
WHERE patch_id = '00000000000000_init_database' AND content_sha256 = '8d234f3d256ebb1fa2e82a1b739bc5b9b33aac8cbb2a512eddd21fed739cd6a3';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = 'cf2e45ab577259540358ce52795cead806a703717f24a428ab3d98eb519e3ee4'
WHERE patch_id = '00000000000001_seed_translations_en_gb' AND content_sha256 = '866996741c95135573dc9bb20a916a2314e54b0ae271cbe6fa50e8546cb7736c';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = '6fb452b153486271ecbe36b00b15463e1f9f9d843459c38dbc6608ef730ffe74'
WHERE patch_id = '00000000000002_seed_translations_it_it' AND content_sha256 = '55c342ce16644603f180c1e5afebde12b21f00e7757db85cda5b011c5ed4258a';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = '345757856bed9e744822d6f763aad1c41411fcfbda9c18930b83d945fafc21c4'
WHERE patch_id = '00000000000003_seed_translations_fr_fr' AND content_sha256 = '1d126e5c16d2bb1242424d310e827f036cd1cc03cfa7db9b19b7204cc6f5df04';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = 'fe2e490f4eb6c8f4028fe76250966040db8b79765fd3bfd87cce128e598280b8'
WHERE patch_id = '00000000000004_seed_translations_es_es' AND content_sha256 = 'a0f68ecf03c2d5721093c7e00926f5cfc9919b8585f381438382f8fad1cc421d';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = 'b2fe2ef07de2592def0c5f9482337be595e1d4f31cde70344f32d1cb2874c48e'
WHERE patch_id = '00000000000005_seed_translations_de_de' AND content_sha256 = '896b1190e1fe5c8707051096297f56029e0691b99be6637a9f01565683edd101';
UPDATE "public"."primebrick_database_patches" SET content_sha256 = 'f98b284c8e158dbdea1898759eaaf0f8a5b9f0ea4564c8a5f528896ff7149855'
WHERE patch_id = '00000000000006_seed_translations_pt_pt' AND content_sha256 = '929cee728019a39160db5648b297676886155a3330e937669399a2f7f5226247';

COMMIT;
