/**
 * DTOs (Zod schemas + types) for the `ai_model` entity.
 *
 * Mirrors the `customers/dto.ts` pattern but simplified for a small reference
 * table — no advanced filters, no export, no duplicate.
 */
import { z } from "zod";

import { zBoundedInt, zBoundedNumber, zPartialNoDefaults } from "../../http/validation.js";
import { AI_MODEL_SORT_KEYS } from "./list-config.js";
import { ListQueryBaseSchema } from "../../http/list-query.js";

export const AiModelListQuerySchema = ListQueryBaseSchema.extend({
  sort_key: z.enum(AI_MODEL_SORT_KEYS as [string, ...string[]]).optional(),
});

export type AiModelListQuery = z.infer<typeof AiModelListQuerySchema>;

const AiModelBaseSchema = z.object({
  model_id: z
    .string()
    .min(1)
    .max(100)
    .transform((v) => v.split("#")[0]),
  dtype: z.string().min(1).max(20).optional(),
  engine_type: z.enum(["webllm", "onnx"]).default("webllm"),
  name: z.string().min(1).max(100),
  label_key: z.string().min(1).max(200).optional(),
  description_key: z.string().min(1).max(200).optional(),
  power_level: zBoundedInt(1, 5).default(3),
  rank: zBoundedNumber(0, 5).default(1.0),
  test_scores: z.record(z.string(), z.any()).optional(),
  enable_thinking: z.boolean().default(false),
  temperature: zBoundedNumber(0.0, 2.0).default(0.7),
  top_p: zBoundedNumber(0.01, 1.0).default(0.9),
  max_tokens: zBoundedInt(1, 32768).default(256),
  repetition_penalty: zBoundedNumber(1.0, 2.0).default(1.1),
  sort_order: zBoundedInt(0, 9999).default(100),
  download_size_mb: zBoundedInt(0, Number.MAX_SAFE_INTEGER).optional(),
  vram_mb: zBoundedInt(0, Number.MAX_SAFE_INTEGER).optional(),
  kv_cache_bytes_per_token: zBoundedInt(0, Number.MAX_SAFE_INTEGER).optional(),
  flops_per_token: zBoundedNumber(0, Number.MAX_SAFE_INTEGER).optional(),
  working_set_mb: zBoundedNumber(0, Number.MAX_SAFE_INTEGER).optional(),
  working_set_source: z.enum(["hf_estimate", "e2e_measured"]).optional(),
  working_set_detail: z.record(z.string(), z.any()).optional(),
  // Only COMPATIBLE / NOT_COMPATIBLE exist. New rows are COMPATIBLE by
  // definition — the user adds a model BECAUSE they want it; NOT_COMPATIBLE
  // is applied only after failing the internal test harness.
  compatibility_status: z.enum(["COMPATIBLE", "NOT_COMPATIBLE"]).default("COMPATIBLE"),
  execution_config: z.record(z.string(), z.any()).optional(),
});

export const AiModelCreateBodySchema = AiModelBaseSchema;

export type AiModelCreateBody = z.infer<typeof AiModelCreateBodySchema>;

export const AiModelUpdateBodySchema = zPartialNoDefaults(
  AiModelBaseSchema.extend({ version: zBoundedInt(0, Number.MAX_SAFE_INTEGER) }),
);

export type AiModelUpdateBody = z.infer<typeof AiModelUpdateBodySchema>;

export const AiModelAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

export type AiModelAuditQuery = z.infer<typeof AiModelAuditQuerySchema>;

export const AiModelAuditActionSchema = z.enum(["CREATE", "UPDATE", "DELETE", "RESTORE"]);

export type AiModelAuditAction = z.infer<typeof AiModelAuditActionSchema>;

export type AiModelAuditEntry = {
  id: string;
  entity_uuid: string;
  action: AiModelAuditAction;
  changed_at: string;
  changed_by: string;
  version: number;
  delta: Record<string, { from: any; to: any }>;
};

export type AiModelAuditResponse = {
  data: AiModelAuditEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};

export const UuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidParam = z.infer<typeof UuidParamSchema>;
