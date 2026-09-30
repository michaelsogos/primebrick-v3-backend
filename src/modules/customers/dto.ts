import { z } from "zod";
import { zBoundedInt, zPartialNoDefaults } from "../../http/validation.js";

import type { CustomerStatus } from "./customer_entity.js";
import { CUSTOMER_SORT_KEYS } from "./list-config.js";
import {
  ListQueryBaseSchema,
  ListFiltersQuerySchema,
  type ListFilterCondition,
} from "../../http/list-query.js";

export const CustomerStatusSchema = z.enum(["ACTIVE", "INACTIVE"]) satisfies z.ZodType<CustomerStatus>;

export const FilterQueryArraySchema = ListFiltersQuerySchema;
export type FilterCondition = ListFilterCondition;
export type FilterConnector = "AND" | "OR";

export const CustomerListQuerySchema = ListQueryBaseSchema.extend({
  status: CustomerStatusSchema.optional(),
  sort_key: z.enum(CUSTOMER_SORT_KEYS as [string, ...string[]]).optional(),
});

export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;

const CustomerBaseSchema = z.object({
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
});

// Refinement for create: both onboarding_at and onboarding_time_zone must be present together or absent together
export const CustomerCreateBodySchema = CustomerBaseSchema.superRefine((val, ctx) => {
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

// Update schema: partial version of base schema with separate refinement for update case
export const CustomerUpdateBodySchema = zPartialNoDefaults(
  CustomerBaseSchema.extend({ version: zBoundedInt(0, Number.MAX_SAFE_INTEGER) }),
).superRefine((val, ctx) => {
  // For updates, only validate the cross-field constraint if both fields are provided
  const hasAt = val.onboarding_at !== undefined;
  const hasTz = val.onboarding_time_zone !== undefined;

  if (hasAt && val.onboarding_at && Number.isNaN(val.onboarding_at.getTime())) {
    ctx.addIssue({
      code: "custom",
      message: "Invalid onboarding_at",
      path: ["onboarding_at"],
    });
    return;
  }

  // If both are provided, they must both be present
  // If only one is provided, it's an error
  if (hasAt !== hasTz) {
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
  }
});

export type CustomerUpdateBody = z.infer<typeof CustomerUpdateBodySchema>;

export const CustomerAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

export type CustomerAuditQuery = z.infer<typeof CustomerAuditQuerySchema>;

export const CustomerAuditActionSchema = z.enum(['CREATE', 'UPDATE', 'DELETE', 'RESTORE']);

export type CustomerAuditAction = z.infer<typeof CustomerAuditActionSchema>;

export type CustomerAuditEntry = {
  id: string;
  entity_uuid: string;
  action: CustomerAuditAction;
  changed_at: string;
  changed_by: string;
  version: number;
  delta: Record<string, { from: any; to: any }>;
};

export type CustomerAuditResponse = {
  data: CustomerAuditEntry[];
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

export const CustomerExportQuerySchema = CustomerListQuerySchema.extend({
  file_type: z.enum(["xlsx", "csv", "html"]),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export type CustomerExportQuery = z.infer<typeof CustomerExportQuerySchema>;

export const CustomerDuplicateBodySchema = z.object({
  uuids: z.array(z.string().uuid()).min(1).max(50),
});

export type CustomerDuplicateBody = z.infer<typeof CustomerDuplicateBodySchema>;

