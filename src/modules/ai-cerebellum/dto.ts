/**
 * DTOs (Zod schemas + types) for the `ai_cerebellum` entity.
 *
 * Mirrors `ai-models/dto.ts` — tuning params are all optional/nullable:
 * NULL means "inherit the ai_models default" at FE resolution time.
 */
import { z } from "zod";

import { zBoundedInt, zBoundedNumber, zPartialNoDefaults } from "../../http/validation.js";
import { AI_CEREBELLUM_SORT_KEYS } from "./list-config.js";
import { ListQueryBaseSchema } from "../../http/list-query.js";
import type { WithAuditableDisplayNames } from "@primebrick/dal-pg";

export const AiCerebellumListQuerySchema = ListQueryBaseSchema.extend({
  sort_key: z.enum(AI_CEREBELLUM_SORT_KEYS as [string, ...string[]]).optional(),
});

export type AiCerebellumListQuery = z.infer<typeof AiCerebellumListQuerySchema>;

const AiCerebellumBaseSchema = z.object({
  assistant_key: z.string().min(1).max(60),
  model_id: z.string().min(1).max(100),
  dtype: z.string().max(40).nullish(),
  name: z.string().min(1).max(80),
  description_key: z.string().min(1).max(200).optional(),
  enable_thinking: z.boolean().nullish(),
  temperature: zBoundedNumber(0.0, 2.0).nullish(),
  top_p: zBoundedNumber(0.01, 1.0).nullish(),
  max_tokens: zBoundedInt(1, 32768).nullish(),
  repetition_penalty: zBoundedNumber(1.0, 2.0).nullish(),
  execution_config: z.record(z.string(), z.any()).nullish(),
  test_scores: z.record(z.string(), z.any()).nullish(),
  recommendation: z.enum(["RECOMMENDED", "NOT_RECOMMENDED"]).nullish(),
});

export const AiCerebellumCreateBodySchema = AiCerebellumBaseSchema;

export type AiCerebellumCreateBody = z.infer<typeof AiCerebellumCreateBodySchema>;

export const AiCerebellumUpdateBodySchema = zPartialNoDefaults(
  AiCerebellumBaseSchema.extend({ version: zBoundedInt(0, Number.MAX_SAFE_INTEGER) }),
);

export type AiCerebellumUpdateBody = z.infer<typeof AiCerebellumUpdateBodySchema>;

export const AiCerebellumAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

export type AiCerebellumAuditQuery = z.infer<typeof AiCerebellumAuditQuerySchema>;

export const AiCerebellumAuditActionSchema = z.enum(["CREATE", "UPDATE", "DELETE", "RESTORE"]);

export type AiCerebellumAuditAction = z.infer<typeof AiCerebellumAuditActionSchema>;

export type AiCerebellumAuditEntry = {
  id: string;
  entity_uuid: string;
  action: AiCerebellumAuditAction;
  changed_at: string;
  changed_by: string;
  version: number;
  delta: Record<string, { from: any; to: any }>;
};

export type AiCerebellumAuditResponse = {
  data: AiCerebellumAuditEntry[];
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

// --- Detail row / API DTO (previously in ai_cerebellum_dal.ts) ---------------

export type AiCerebellumDetailRow = {
  uuid: string;
  assistant_key: string;
  model_id: string;
  dtype?: string;
  name: string;
  description_key?: string;
  enable_thinking?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  repetition_penalty?: number;
  execution_config?: Record<string, any>;
  test_scores?: Record<string, any>;
  recommendation?: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  version: number;
  deleted_at?: Date;
  deleted_by?: string;
};

export type AiCerebellumDetailDto = Omit<
  AiCerebellumDetailRow,
  "created_at" | "updated_at" | "deleted_at"
> & {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
};
