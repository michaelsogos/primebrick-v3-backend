/**
 * `ai_models` — catalog of WebLLM models available for browser-local AI features.
 *
 * Each row describes a single WebLLM model with its exact `model_id` (the string
 * passed to `CreateMLCEngine`), a user-facing display name, a power level
 * (1-5) for the UI 5-bar indicator, and the per-model sampling parameters that
 * the FE passes to `engine.chat.completions.create()` (temperature, top_p,
 * max_tokens, repetition_penalty, enable_thinking).
 *
 * This table is the single source of truth for model metadata — the FE reads
 * it via `/api/v1/entities/ai_model/list` and the `ai_assistant_model` config
 * row points its `type_config.api_url` at the same endpoint.
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

@Entity("ai_models")
@AuditTrail()
@Cached(300_000) // 5 min TTL — reference data, changes rarely
export class AiModelEntity implements IAuditableEntity, IExposableEntity {
  @Key()
  id: bigint;

  @Unique()
  uuid: string;

  /** Exact WebLLM model ID passed to `CreateMLCEngine` (e.g. `Qwen3-1.7B-q4f16_1-MLC`). */
  @Unique()
  @Column({ length: 100, nullable: false })
  model_id: string;

  /** Short display name (e.g. `Qwen3 1.7B`) — language-neutral, not translated. */
  @Column({ length: 100, nullable: false })
  name: string;

  /** i18n key for the full tier label (e.g. `system.entities.ai_model.qwen3_1.7b.label`). */
  @Column({ length: 200, nullable: true })
  label_key?: string;

  /** i18n key for the model description/hint. */
  @Column({ length: 200, nullable: true })
  description_key?: string;

  /** Power indicator 1-5 (1=Lowest, 5=Highest). Drives the 5-bar UI. */
  @Column({ nullable: false, defaultSql: "3" })
  power_level: number;

  /** Affidability 1-5 — derived from test_scores final_score (round).
   *  Measures model reliability, independent from power_level. */
  @Column({ nullable: false, defaultSql: "1" })
  affidability: number;

  /** Composite rank 0.0-5.0 — round((affidability * 0.7 + power_level * 0.3) * 10) / 10.
   *  Affidability weighs 70%, power 30%. */
  @Column({ nullable: false, defaultSql: "1.0" })
  rank: number;

  /** Test case scores with full runs[] arrays. JSONB.
   *  Structure: { "regex_test_score": { "runs": [5,4,5], "score": 4.6, "method": "mean", "updated_at": "..." } } */
  @Column({ pgType: "jsonb", nullable: true })
  test_scores?: Record<string, any>;

  /** If false, the model is not shown in dropdowns / not available for selection. */
  @Column({ pgType: "boolean", nullable: false, defaultSql: "true" })
  is_enabled: boolean;

  /** Whether to pass `enable_thinking: true` to WebLLM for this model. */
  @Column({ pgType: "boolean", nullable: false, defaultSql: "false" })
  enable_thinking: boolean;

  /** Sampling temperature (0.10-2.00). */
  @Column({ nullable: false, defaultSql: "0.70" })
  temperature: number;

  /** Nucleus sampling top_p (0.01-1.00). */
  @Column({ nullable: false, defaultSql: "0.90" })
  top_p: number;

  /** Max generation tokens. */
  @Column({ nullable: false, defaultSql: "256" })
  max_tokens: number;

  /** Repetition penalty (1.00-2.00). */
  @Column({ nullable: false, defaultSql: "1.10" })
  repetition_penalty: number;

  /** Display order (ascending). */
  @Column({ nullable: false, defaultSql: "100" })
  sort_order: number;

  /** Download size in MB (total repo size from HuggingFace). */
  @Column({ nullable: true })
  download_size_mb?: number;

  /** VRAM required in MB (from WebLLM prebuiltAppConfig vram_required_MB). */
  @Column({ nullable: true })
  vram_mb?: number;

  /** Compatibility status: COMPATIBLE, NOT_COMPATIBLE, UNTESTED. */
  @Column({ length: 30, nullable: false, defaultSql: "'UNTESTED'" })
  compatibility_status: string;

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
