-- Migration 00000000000008: Create ai_models table + seed 3 WebLLM models
--
-- Creates the `ai_models` table (catalog of WebLLM models with per-model
-- sampling parameters) + audit table + seed 3 rows + audit trail entries.
--
-- This is the single source of truth for model metadata — the FE reads it
-- via /api/v1/entities/ai_model/list and the ai_assistant_model config row
-- points its type_config.api_url at the same endpoint.
--
-- Idempotent: uses IF NOT EXISTS for all DDL and ON CONFLICT for seeds.

BEGIN;

-- ─── 1. ai_models table ───
CREATE TABLE IF NOT EXISTS "public"."ai_models" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "model_id" varchar(100) NOT NULL,
  "name" varchar(100) NOT NULL,
  "label_key" varchar(200),
  "description_key" varchar(200),
  "power_level" integer NOT NULL DEFAULT 3,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "enable_thinking" boolean NOT NULL DEFAULT false,
  "temperature" numeric(3,2) NOT NULL DEFAULT 0.70,
  "top_p" numeric(3,2) NOT NULL DEFAULT 0.90,
  "max_tokens" integer NOT NULL DEFAULT 256,
  "repetition_penalty" numeric(3,2) NOT NULL DEFAULT 1.10,
  "sort_order" integer NOT NULL DEFAULT 100,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_models_uuid_uq" ON "public"."ai_models" ("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "ai_models_model_id_uq" ON "public"."ai_models" ("model_id");

COMMENT ON COLUMN public.ai_models.model_id IS 'Exact WebLLM model ID passed to CreateMLCEngine (e.g. Qwen3-1.7B-q4f16_1-MLC)';
COMMENT ON COLUMN public.ai_models.power_level IS 'Power indicator 1-5 (1=Lowest, 5=Highest). Drives the 5-bar UI.';
COMMENT ON COLUMN public.ai_models.is_enabled IS 'If false, the model is not shown in dropdowns / not available for selection';
COMMENT ON COLUMN public.ai_models.enable_thinking IS 'Whether to pass enable_thinking: true to WebLLM for this model';
COMMENT ON COLUMN public.ai_models.temperature IS 'Sampling temperature (0.10-2.00)';
COMMENT ON COLUMN public.ai_models.top_p IS 'Nucleus sampling top_p (0.01-1.00)';
COMMENT ON COLUMN public.ai_models.max_tokens IS 'Max generation tokens';
COMMENT ON COLUMN public.ai_models.repetition_penalty IS 'Repetition penalty (1.00-2.00)';
COMMENT ON COLUMN public.ai_models.sort_order IS 'Display order (ascending)';

-- ─── 2. ai_models_audit table (partitioned by changed_at) ───
CREATE TABLE IF NOT EXISTS "public"."ai_models_audit" (
  "id" bigint generated always as identity NOT NULL,
  "entity_id" bigint NOT NULL,
  "entity_uuid" uuid NOT NULL,
  "action" text NOT NULL,
  "changed_at" timestamptz NOT NULL,
  "changed_by" text NOT NULL DEFAULT 'system',
  "version" integer NOT NULL,
  "delta" jsonb NOT NULL,
  PRIMARY KEY ("id", "changed_at")
) PARTITION BY RANGE ("changed_at");

COMMENT ON COLUMN public.ai_models_audit.changed_by IS 'Identifier of the principal that produced the audit entry (falls back to "system" when no authenticated context is available).';

CREATE INDEX IF NOT EXISTS "ai_models_audit_entity_uuid_idx" ON "public"."ai_models_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "ai_models_audit_action_idx" ON "public"."ai_models_audit" ("action");

-- pg_partman setup for ai_models_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'partman'
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config
    WHERE parent_table = 'public.ai_models_audit'
  ) THEN
    PERFORM partman.create_parent('public.ai_models_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ─── 3. Seed 3 WebLLM models ───
-- Idempotent via ON CONFLICT (model_id is unique).
INSERT INTO "public"."ai_models" (
  "model_id", "name", "label_key", "description_key",
  "power_level", "is_enabled", "enable_thinking",
  "temperature", "top_p", "max_tokens", "repetition_penalty",
  "sort_order", "created_by", "updated_by", "version"
) VALUES
(
  'Qwen3-1.7B-q4f16_1-MLC',
  'Qwen3 1.7B',
  'system.entities.ai_model.qwen3_1.7b.label',
  'system.entities.ai_model.qwen3_1.7b.description',
  2, true, true,
  0.60, 0.95, 768, 1.10,
  10, 'system', 'system', 1
),
(
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
  'Qwen2.5 1.5B',
  'system.entities.ai_model.qwen2.5_1.5b.label',
  'system.entities.ai_model.qwen2.5_1.5b.description',
  3, true, false,
  0.30, 0.80, 256, 1.10,
  20, 'system', 'system', 1
),
(
  'Qwen3-4B-q4f16_1-MLC',
  'Qwen3 4B',
  'system.entities.ai_model.qwen3_4b.label',
  'system.entities.ai_model.qwen3_4b.description',
  4, true, true,
  0.60, 0.95, 768, 1.10,
  30, 'system', 'system', 1
)
ON CONFLICT ("model_id") DO NOTHING;

-- ─── 4. Audit trail for the ai_models seed (INSERT record, version 1) ───
INSERT INTO public.ai_models_audit (entity_id, entity_uuid, action, changed_at, changed_by, version, delta)
SELECT id, uuid, 'INSERT', created_at, 'initial-setup', 1,
  jsonb_strip_nulls(jsonb_build_object(
    'id', jsonb_build_object('old', null, 'new', id),
    'uuid', jsonb_build_object('old', null, 'new', uuid),
    'model_id', jsonb_build_object('old', null, 'new', model_id),
    'name', jsonb_build_object('old', null, 'new', name),
    'label_key', jsonb_build_object('old', null, 'new', label_key),
    'description_key', jsonb_build_object('old', null, 'new', description_key),
    'power_level', jsonb_build_object('old', null, 'new', power_level),
    'is_enabled', jsonb_build_object('old', null, 'new', is_enabled),
    'enable_thinking', jsonb_build_object('old', null, 'new', enable_thinking),
    'temperature', jsonb_build_object('old', null, 'new', temperature),
    'top_p', jsonb_build_object('old', null, 'new', top_p),
    'max_tokens', jsonb_build_object('old', null, 'new', max_tokens),
    'repetition_penalty', jsonb_build_object('old', null, 'new', repetition_penalty),
    'sort_order', jsonb_build_object('old', null, 'new', sort_order),
    'created_at', jsonb_build_object('old', null, 'new', created_at),
    'created_by', jsonb_build_object('old', null, 'new', COALESCE(created_by, 'system')),
    'updated_at', jsonb_build_object('old', null, 'new', updated_at),
    'updated_by', jsonb_build_object('old', null, 'new', COALESCE(updated_by, created_by, 'system')),
    'version', jsonb_build_object('old', null, 'new', version),
    'deleted_at', jsonb_build_object('old', null, 'new', deleted_at),
    'deleted_by', jsonb_build_object('old', null, 'new', deleted_by)
  ))
FROM public.ai_models
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_models_audit a
  WHERE a.entity_uuid = ai_models.uuid
    AND a.action = 'INSERT'
);

COMMIT;
