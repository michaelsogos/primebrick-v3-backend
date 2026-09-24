/**
 * DTOs (Zod schemas + types) for the `ai_cerebellum` entity.
 *
 * Mirrors `ai-models/dto.ts` — tuning params are all optional/nullable:
 * NULL means "inherit the ai_models default" at FE resolution time.
 */
import { z } from "zod";

import { zBoundedInt, zBoundedNumber, zPartialNoDefaults } from "../../http/validation.js";
import { AI_CEREBELLUM_FILTERABLE_KEYS, AI_CEREBELLUM_SORT_KEYS } from "./list-config.js";

const csvToStringArray = z
  .string()
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
  .pipe(z.array(z.string()));

const allowedOperators = [
  "=",
  "!=",
  "<>",
  "<",
  "<=",
  ">",
  ">=",
  "ILIKE",
  "LIKE",
  "IN",
  "NOT IN",
  "BETWEEN",
  "IS",
  "IS NOT",
] as const;

export type SqlOperator = (typeof allowedOperators)[number];

const FilterConditionSchema = z.object({
  field: z.enum(AI_CEREBELLUM_FILTERABLE_KEYS as [string, ...string[]]),
  op: z.enum(allowedOperators),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.union([z.string(), z.number(), z.boolean()])),
    z.object({
      start: z.union([z.string(), z.number()]),
      end: z.union([z.string(), z.number()]),
    }),
  ]),
});

export type FilterCondition = z.infer<typeof FilterConditionSchema>;

const FilterConnectorSchema = z.enum(["AND", "OR"]);

export const FilterQueryArraySchema = z
  .array(
    z.object({
      field: z.string(),
      op: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
        z.object({
          start: z.union([z.string(), z.number()]),
          end: z.union([z.string(), z.number()]),
        }),
      ]),
    })
  )
  .optional();

// Query params arrive as strings — `filters` is sent as JSON-encoded array.
// Malformed JSON falls through as the raw string → fails the array check (400).
const filtersQueryParam = z
  .preprocess(
    (v) => {
      if (typeof v !== "string") return v;
      try { return JSON.parse(v); } catch { return v; }
    },
    FilterQueryArraySchema,
  )
  .optional();

export const AiCerebellumListQuerySchema = z.object({
  search: z.string().optional(),
  search_in: csvToStringArray.optional(),
  sort_key: z.enum(AI_CEREBELLUM_SORT_KEYS as [string, ...string[]]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
  filters: filtersQueryParam,
  connector: FilterConnectorSchema.optional(),
  deleted_records: z.enum(["EXCLUDED", "ONLY", "INCLUDED"]).optional(),
});

export type AiCerebellumListQuery = z.infer<typeof AiCerebellumListQuerySchema>;

const AiCerebellumBaseSchema = z.object({
  assistant_key: z.string().min(1).max(60),
  model_id: z.string().min(1).max(100),
  name: z.string().min(1).max(80),
  description_key: z.string().min(1).max(200).optional(),
  enable_thinking: z.boolean().nullish(),
  temperature: zBoundedNumber(0.0, 2.0).nullish(),
  top_p: zBoundedNumber(0.01, 1.0).nullish(),
  max_tokens: zBoundedInt(1, 32768).nullish(),
  repetition_penalty: zBoundedNumber(1.0, 2.0).nullish(),
  execution_config: z.record(z.string(), z.any()).nullish(),
  is_enabled: z.boolean().default(true),
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
