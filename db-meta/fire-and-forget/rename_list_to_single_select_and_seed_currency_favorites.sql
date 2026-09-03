-- Fire-and-forget: Rename config type 'list' → 'single_select', seed currency_favorites, update init patch SHA256.
--
-- The SDK config type vocabulary was updated:
--   - "list" → renamed to "single_select" (single-selection dropdown, same widget: ComboSelect)
--   - "multi_select" added (multi-selection dropdown, stores comma-separated values)
--
-- The init patch was modified to:
--   - Seed a new "currency_favorites" config row (type: multi_select, value: EUR,USD,GBP,CHF,CNY,JPY, reserved: true)
--
-- This script:
--   1. Renames existing rows with type='list' to type='single_select' (idempotent)
--   2. Seeds the currency_favorites config row (idempotent via ON CONFLICT)
--   3. Inserts the audit trail entry for currency_favorites (idempotent via NOT EXISTS)
--   4. Updates the patch registry hash so db:migrate skips the init patch
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-09-03
-- Old sha256: 3d0ed1a8bae146fc65a7891b4e70fa49bded7f428deaa5e32444962aad1d4ca2
-- New sha256: 288d8d3052ee44e59cb6763b414d9e41e0dfd9b79482421f64bf0d00e977067b
-- Reason: Renamed config type 'list' → 'single_select' and added 'currency_favorites' seed row (type: multi_select, reserved: true).

BEGIN;

-- 1. Rename existing config rows with type='list' to type='single_select'.
UPDATE "public"."auth_configurations"
SET "type" = 'single_select'
WHERE "type" = 'list';

-- 2. Seed the currency_favorites config row (reserved: true — type/type_config locked, only value editable).
INSERT INTO "public"."auth_configurations" ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by")
VALUES (
  'currency_favorites',
  'EUR,USD,GBP,CHF,CNY,JPY',
  'multi_select',
  '{"values_source":"currencies","value_field":"code","label_field":"name","validation":{"required":false,"rules":{}}}',
  'config.auth.currency_favorites.label',
  'config.auth.currency_favorites.description',
  true,
  'system_settings',
  'system'
)
ON CONFLICT ("key") DO NOTHING;

-- 3. Insert the audit trail entry for currency_favorites (INSERT record, version 1).
--    Mirrors the init patch audit insert pattern.
INSERT INTO public.auth_configurations_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', created_at, 'initial-setup', 1,
  jsonb_strip_nulls(jsonb_build_object(
    'id', jsonb_build_object('old', null, 'new', id),
    'uuid', jsonb_build_object('old', null, 'new', uuid),
    'key', jsonb_build_object('old', null, 'new', key),
    'value', jsonb_build_object('old', null, 'new', value),
    'type', jsonb_build_object('old', null, 'new', type),
    'type_config', jsonb_build_object('old', null, 'new', type_config),
    'label_key', jsonb_build_object('old', null, 'new', label_key),
    'description_key', jsonb_build_object('old', null, 'new', description_key),
    'reserved', jsonb_build_object('old', null, 'new', reserved),
    'group_key', jsonb_build_object('old', null, 'new', group_key),
    'created_at', jsonb_build_object('old', null, 'new', created_at),
    'created_by', jsonb_build_object('old', null, 'new', COALESCE(created_by, 'system')),
    'updated_at', jsonb_build_object('old', null, 'new', updated_at),
    'updated_by', jsonb_build_object('old', null, 'new', COALESCE(updated_by, created_by, 'system')),
    'version', jsonb_build_object('old', null, 'new', version),
    'deleted_at', jsonb_build_object('old', null, 'new', deleted_at),
    'deleted_by', jsonb_build_object('old', null, 'new', deleted_by)
  ))
FROM public.auth_configurations
WHERE key = 'currency_favorites'
  AND NOT EXISTS (
    SELECT 1 FROM public.auth_configurations_audit a
    WHERE a.entity_uuid = auth_configurations.uuid
      AND a.action = 'INSERT'
  );

-- 4. Update the patch registry hash so db:migrate skips the init patch.
UPDATE public.primebrick_database_patches
SET content_sha256 = '288d8d3052ee44e59cb6763b414d9e41e0dfd9b79482421f64bf0d00e977067b'
WHERE patch_id = '00000000000000_init_database'
  AND content_sha256 <> '288d8d3052ee44e59cb6763b414d9e41e0dfd9b79482421f64bf0d00e977067b';

COMMIT;
