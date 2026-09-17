-- Fire-and-forget: Seed the `ai_assistant_model` config row.
--
-- Adds a reserved `single_select` config row that drives the Smart Regex
-- AI assistant model selection. The model list comes from the FE
-- `values_source: "ai_models"` data module (mirrors the `currencies`
-- `values_source` pattern). Only the selected value lives in the DB.
--
-- Defaults to `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` (the "Average" tier).
--
-- This script:
--   1. Seeds the `ai_assistant_model` config row (idempotent via ON CONFLICT)
--   2. Inserts the audit trail entry (idempotent via NOT EXISTS)
--
-- Run this ONCE on the existing live database. Idempotent.
--
-- Date: 2026-09-03

BEGIN;

-- 1. Seed the ai_assistant_model config row (reserved: true — type/type_config locked, only value editable).
INSERT INTO "public"."config_entries" ("key", "value", "type", "type_config", "label_key", "description_key", "reserved", "group_key", "created_by")
VALUES (
  'ai_assistant_model',
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  'single_select',
  '{"values_source":"ai_models","value_field":"id","label_field":"label_key","validation":{"required":true,"required_error_label_key":"app.common.validation.required","rules":{}}}',
  'system.settings.config.auth.ai_assistant_model.label',
  'system.settings.config.auth.ai_assistant_model.description',
  true,
  'ai_features',
  'system'
)
ON CONFLICT ("key") DO NOTHING;

-- 2. Insert the audit trail entry for ai_assistant_model (INSERT record, version 1).
--    Mirrors the init patch audit insert pattern.
INSERT INTO public.config_entries_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
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
FROM public.config_entries
WHERE key = 'ai_assistant_model'
  AND NOT EXISTS (
    SELECT 1 FROM public.config_entries_audit a
    WHERE a.entity_uuid = config_entries.uuid
      AND a.action = 'INSERT'
  );

COMMIT;
