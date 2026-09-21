/**
 * `ai_cerebellum` — per-assistant tuning presets for AI models.
 *
 * The "cerebellum" (cervelletto) fine-tunes a model for a specific AI
 * assistant. Each row binds (assistant_key, model_id, name) to a set of
 * OPTIONAL overrides: NULL columns mean "inherit the ai_models default".
 *
 * Resolution rule (FE): when an assistant loads a model, it looks up the
 * enabled cerebellum rows for (assistant_key, model_id); the selected row's
 * non-NULL values override the model defaults, NULLs inherit.
 *
 * The assistant's dedicated tuning for a model is auto-selected on open
 * (first enabled row by sort_order); there is no per-cerebellum "default" —
 * the defaults live on the model (`ai_models`), cerebellum rows are only
 * overrides.
 *
 * `test_scores` stores per-tuning measurements keyed by test case so the
 * harness can rank tunings independently of the model-level scores.
 */
import type { IAuditableEntity, IExposableEntity } from "@primebrick/dal-pg";
import {
  Column,
  Entity,
  Key,
  Unique,
  AuditableField,
  DeletableField,
  AuditableFieldType,
  DeletableFieldType,
  AuditTrail,
} from "@primebrick/dal-pg";
import { Cached } from "@primebrick/sdk";

@Entity("ai_cerebellum")
@AuditTrail()
@Cached(300_000) // 5 min TTL — reference data, changes rarely
export class AiCerebellumEntity implements IAuditableEntity, IExposableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** Assistant identifier (e.g. `regex`, `json_config`). */
  @Column({ length: 60, nullable: false })
  assistant_key: string;

  /** FK → ai_models.model_id (the business unique key of the model catalog). */
  @Column({ length: 100, nullable: false })
  model_id: string;

  /** Tuning name shown in the footer dropdown (e.g. `default`, `precise`). */
  @Column({ length: 80, nullable: false })
  name: string;

  /** Optional i18n key for the tuning description/hint. */
  @Column({ length: 200, nullable: true })
  description_key?: string;

  /** NULL = inherit ai_models.enable_thinking. */
  @Column({ pgType: "boolean", nullable: true })
  enable_thinking?: boolean;

  /** NULL = inherit ai_models.temperature. */
  @Column({ nullable: true })
  temperature?: number;

  /** NULL = inherit ai_models.top_p. */
  @Column({ nullable: true })
  top_p?: number;

  /** NULL = inherit ai_models.max_tokens. */
  @Column({ nullable: true })
  max_tokens?: number;

  /** NULL = inherit ai_models.repetition_penalty. */
  @Column({ nullable: true })
  repetition_penalty?: number;

  /** Partial execution-config override — merged over ai_models.execution_config.
   *  NULL = inherit the whole execution_config. */
  @Column({ pgType: "jsonb", nullable: true })
  execution_config?: Record<string, any>;

  /** If false, the tuning is hidden from the footer dropdown. */
  @Column({ pgType: "boolean", nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  /** Display order inside the footer dropdown (ascending). */
  @Column({ nullable: false, defaultSql: "100" })
  sort_order: number;

  /** Per-tuning test measurements keyed by test case. JSONB — same shape as
   *  ai_models.test_scores, kept separate so tuning scores never overwrite
   *  model-level scores. */
  @Column({ pgType: "jsonb", nullable: true })
  test_scores?: Record<string, any>;

  @AuditableField(AuditableFieldType.CREATED_AT)
  created_at: Date;

  @AuditableField(AuditableFieldType.CREATED_BY)
  created_by: string;

  @AuditableField(AuditableFieldType.UPDATED_AT)
  updated_at: Date;

  @AuditableField(AuditableFieldType.UPDATED_BY)
  updated_by: string;

  @AuditableField(AuditableFieldType.VERSION)
  version: number;

  @DeletableField(DeletableFieldType.DELETED_AT)
  deleted_at?: Date;

  @DeletableField(DeletableFieldType.DELETED_BY)
  deleted_by?: string;
}
