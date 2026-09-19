-- Fire-and-forget migration: Create ai_cerebellum table
--
-- The "cerebellum" (cervelletto) binds an AI assistant to tuned generation
-- params for a specific model. ai_models keeps the model DEFAULTS; a
-- cerebellum row provides OPTIONAL overrides — NULL columns inherit the
-- ai_models value at FE resolution time.
--
-- Resolution rule: assistant loads model → lookup the cerebellum row for
-- (assistant_key, model_id) → its non-NULL values override model defaults.
-- There is exactly ONE cerebellum per (assistant_key, model_id): the row is
-- the model's specialization for that assistant, not a user-picked "preset".
--
-- test_scores stores per-cerebellum measurements keyed by test case — kept
-- separate from ai_models.test_scores so tuning runs never overwrite
-- model-level scores.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING.
--
-- Date: 2026-09-30

BEGIN;

-- ─── 1. ai_cerebellum table ───
CREATE TABLE IF NOT EXISTS "public"."ai_cerebellum" (
  "id" bigint generated always as identity NOT NULL,
  "uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
  "assistant_key" varchar(60) NOT NULL,
  "model_id" varchar(100) NOT NULL,
  "name" varchar(80) NOT NULL,
  "description_key" varchar(200),
  "enable_thinking" boolean,
  "temperature" numeric(3,2),
  "top_p" numeric(3,2),
  "max_tokens" integer,
  "repetition_penalty" numeric(3,2),
  "execution_config" jsonb,
  "is_default" boolean NOT NULL DEFAULT false,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 100,
  "test_scores" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "created_by" text,
  "updated_at" timestamptz DEFAULT now(),
  "updated_by" text,
  "version" integer DEFAULT 1,
  "deleted_at" timestamptz,
  "deleted_by" text,
  PRIMARY KEY ("id"),
  CONSTRAINT "ai_cerebellum_model_id_fk"
    FOREIGN KEY ("model_id") REFERENCES "public"."ai_models" ("model_id")
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_cerebellum_uuid_uq"
  ON "public"."ai_cerebellum" ("uuid");

-- Exactly one cerebellum per (assistant, model) among non-deleted rows —
-- the cerebellum IS the specialization of that model for that assistant.
CREATE UNIQUE INDEX IF NOT EXISTS "ai_cerebellum_assistant_model_uq"
  ON "public"."ai_cerebellum" ("assistant_key", "model_id")
  WHERE "deleted_at" IS NULL;

COMMENT ON TABLE public.ai_cerebellum IS 'Per-assistant tuning presets for AI models. NULL param columns inherit ai_models defaults.';
COMMENT ON COLUMN public.ai_cerebellum.assistant_key IS 'Assistant identifier (e.g. regex, json_config)';
COMMENT ON COLUMN public.ai_cerebellum.model_id IS 'FK → ai_models.model_id (business unique key)';
COMMENT ON COLUMN public.ai_cerebellum.name IS 'i18n translation key resolving to the assistant display name (e.g. app.smart.json.ai.cerebellum_name) — shown in the chat footer';
COMMENT ON COLUMN public.ai_cerebellum.enable_thinking IS 'NULL = inherit ai_models.enable_thinking';
COMMENT ON COLUMN public.ai_cerebellum.temperature IS 'NULL = inherit ai_models.temperature';
COMMENT ON COLUMN public.ai_cerebellum.top_p IS 'NULL = inherit ai_models.top_p';
COMMENT ON COLUMN public.ai_cerebellum.max_tokens IS 'NULL = inherit ai_models.max_tokens';
COMMENT ON COLUMN public.ai_cerebellum.repetition_penalty IS 'NULL = inherit ai_models.repetition_penalty';
COMMENT ON COLUMN public.ai_cerebellum.execution_config IS 'Partial JSONB override merged over ai_models.execution_config. NULL = inherit all';
COMMENT ON COLUMN public.ai_cerebellum.is_default IS 'Pre-selected cerebellum for (assistant_key, model_id) when the assistant opens — always true (one row per pair)';
COMMENT ON COLUMN public.ai_cerebellum.test_scores IS 'Per-tuning test measurements keyed by test case — same shape as ai_models.test_scores';

-- ─── 2. ai_cerebellum_audit table (partitioned by changed_at) ───
CREATE TABLE IF NOT EXISTS "public"."ai_cerebellum_audit" (
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

COMMENT ON COLUMN public.ai_cerebellum_audit.changed_by IS 'Identifier of the principal that produced the audit entry (falls back to "system" when no authenticated context is available).';

CREATE INDEX IF NOT EXISTS "ai_cerebellum_audit_entity_uuid_idx" ON "public"."ai_cerebellum_audit" ("entity_uuid");
CREATE INDEX IF NOT EXISTS "ai_cerebellum_audit_action_idx" ON "public"."ai_cerebellum_audit" ("action");

-- pg_partman setup for ai_cerebellum_audit (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'partman'
    AND table_name = 'part_config'
  ) OR NOT EXISTS (
    SELECT 1 FROM partman.part_config
    WHERE parent_table = 'public.ai_cerebellum_audit'
  ) THEN
    PERFORM partman.create_parent('public.ai_cerebellum_audit', 'changed_at', '1 month');
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ─── 3. Seed cerebellum rows ───
-- One cerebellum per (assistant, model). All params NULL → fully inherit
-- model defaults until test-driven tuning fills them. The name is the
-- assistant's display name, shown in the chat footer when a cerebellum
-- exists for the active model.
INSERT INTO "public"."ai_cerebellum" (
  "assistant_key", "model_id", "name",
  "is_default", "is_enabled", "sort_order",
  "created_by", "updated_by"
) VALUES
  ('regex', 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16', 'app.smart.regex.ai.cerebellum_name', true, true, 10, 'system', 'system'),
  ('json_config', 'onnx-community/Qwen2.5-Coder-3B-Instruct#q4f16', 'app.smart.json.ai.cerebellum_name', true, true, 10, 'system', 'system')
ON CONFLICT DO NOTHING;

COMMIT;
