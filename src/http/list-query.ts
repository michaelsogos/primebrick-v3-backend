/**
 * list-query — canonical zod schemas for entity `/list` query params.
 *
 * ONE contract for every entity list endpoint: filters travel as QS bracket
 * notation (`filters[0][field]=x&filters[0][op]=ILIKE&filters[0][value]=%25x%25`),
 * which the Express `qs` (extended) parser already delivers as structured
 * objects/arrays. NO JSON-stringified `filters=` param anywhere — that wire
 * format is removed (routers that used `JSON.parse(req.query.filters)` were
 * broken under qs; producers that sent `JSON.stringify` are migrated).
 *
 * `value` shapes: scalar (string/number/boolean/null), array (IN / NOT IN),
 * `{start,end}` (BETWEEN). Operator/field allowlists are enforced downstream
 * by `translateFilterConditions` (`@primebrick/dal-pg`), not here — the schema
 * validates shape, the DAL validates semantics per entity.
 */

import { z } from "zod";

export const csvToStringArray = z
  .string()
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean))
  .pipe(z.array(z.string()));

const filterValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
  z.object({
    start: z.union([z.string(), z.number()]),
    end: z.union([z.string(), z.number()]),
  }),
]);

export const ListFilterConditionSchema = z.object({
  field: z.string(),
  op: z.string(),
  value: filterValueSchema,
  connector: z.enum(["AND", "OR"]).optional(),
});

export const ListFiltersQuerySchema = z.array(ListFilterConditionSchema).optional();

export const ListConnectorSchema = z.enum(["AND", "OR"]);

export type ListFilterCondition = z.infer<typeof ListFilterConditionSchema>;
export type ListConnector = z.infer<typeof ListConnectorSchema>;

/**
 * Shared base for entity list query schemas. Entities extend it with their
 * own `sort_key` enum / extra params (e.g. `status`):
 *
 *   export const CustomerListQuerySchema = ListQueryBaseSchema.extend({
 *     sort_key: z.enum(CUSTOMER_SORT_KEYS).optional(),
 *     status: CustomerStatusSchema.optional(),
 *   });
 */
export const ListQueryBaseSchema = z.object({
  search: z.string().optional(),
  search_in: csvToStringArray.optional(),
  sort_key: z.string().optional().nullable(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  page_size: z.coerce.number().int().min(1).max(100).optional(),
  filters: ListFiltersQuerySchema,
  connector: ListConnectorSchema.optional(),
  deleted_records: z.enum(["EXCLUDED", "ONLY", "INCLUDED"]).optional(),
});

export type ListQueryBase = z.infer<typeof ListQueryBaseSchema>;

export const ListAuditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});

export type ListAuditQuery = z.infer<typeof ListAuditQuerySchema>;
