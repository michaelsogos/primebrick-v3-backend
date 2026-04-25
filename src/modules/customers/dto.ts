import { z } from "zod";

import type { CustomerStatus } from "./customer_entity.js";
import { CUSTOMER_FILTERABLE_KEYS, CUSTOMER_SORT_KEYS } from "./list-config.js";

export const CustomerStatusSchema = z.enum(["ACTIVE", "INACTIVE"]) satisfies z.ZodType<CustomerStatus>;

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
  "IS",
  "IS NOT",
] as const;
export type SqlOperator = (typeof allowedOperators)[number];

const FilterConditionSchema = z.object({
  field: z.enum(CUSTOMER_FILTERABLE_KEYS as [string, ...string[]]),
  op: z.enum(allowedOperators),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const FilterConnectorSchema = z.enum(["AND", "OR"]);

export const FilterQueryArraySchema = z
  .array(
    z.object({
      field: z.string(),
      op: z.string(),
      value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
      connector: FilterConnectorSchema.optional(),
    })
  )
  .optional();

export type FilterCondition = z.infer<typeof FilterConditionSchema>;
export type FilterConnector = z.infer<typeof FilterConnectorSchema>;

export const CustomerListQuerySchema = z.object({
  search: z.string().optional(),
  search_in: csvToStringArray.optional(),
  status: CustomerStatusSchema.optional(),
  sort_key: z.enum(CUSTOMER_SORT_KEYS as [string, ...string[]]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
  filters: FilterQueryArraySchema,
});

export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;

export const CustomerCreateBodySchema = z
  .object({
    code: z.string().min(1).max(20),
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    company_name: z.string().min(1).optional(),
    email: z.string().email().max(320).optional(),
    phone: z.string().min(1).max(64).optional(),
    status: CustomerStatusSchema.default("ACTIVE"),
    status_reason: z.string().min(1).optional(),
    local_address: z.string().min(1).optional(),
    local_city: z.string().min(1).optional(),
    local_state: z.string().min(1).optional(),
    local_country: z.string().min(1).optional(),
    local_zip: z.string().min(1).optional(),
    onboarding_at: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.date().optional()
    ),
    onboarding_time_zone: z.preprocess(
      (v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        return typeof v === "string" ? v.trim() : v;
      },
      z.string().min(2).max(100).optional()
    ),
  })
  .superRefine((val, ctx) => {
    if (val.onboarding_at !== undefined && Number.isNaN(val.onboarding_at.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid onboarding_at",
        path: ["onboarding_at"],
      });
      return;
    }
    const hasAt = val.onboarding_at !== undefined;
    const hasTz = val.onboarding_time_zone !== undefined;
    if (hasAt === hasTz) return;
    if (hasAt && !hasTz) {
      ctx.addIssue({
        code: "custom",
        message: "onboarding_time_zone is required when onboarding_at is set",
        path: ["onboarding_time_zone"],
      });
    } else {
      ctx.addIssue({
        code: "custom",
        message: "onboarding_at is required when onboarding_time_zone is set",
        path: ["onboarding_at"],
      });
    }
  });

export type CustomerCreateBody = z.infer<typeof CustomerCreateBodySchema>;

export const UuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidParam = z.infer<typeof UuidParamSchema>;

