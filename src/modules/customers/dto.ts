import { z } from "zod";

import type { CustomerStatus } from "./customer_entity.js";
import { CUSTOMER_SORT_KEYS } from "./list-config.js";

export const CustomerStatusSchema = z.enum(["ACTIVE", "INACTIVE"]) satisfies z.ZodType<CustomerStatus>;

const csvToStringArray = z
  .string()
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
  .pipe(z.array(z.string()));

export const CustomerListQuerySchema = z.object({
  search: z.string().optional(),
  search_in: csvToStringArray.optional(),
  status: CustomerStatusSchema.optional(),
  sort_key: z.enum(CUSTOMER_SORT_KEYS as [string, ...string[]]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
});

export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;

export const CustomerCreateBodySchema = z.object({
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
});

export type CustomerCreateBody = z.infer<typeof CustomerCreateBodySchema>;

export const UuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidParam = z.infer<typeof UuidParamSchema>;

