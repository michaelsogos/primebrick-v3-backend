/**
 * list-query — canonical zod schema shape tests. Validates the wire
 * contract for `filters[]` conditions as produced by the qs parser:
 * scalar / array (IN) / {start,end} (BETWEEN) values, connector enum,
 * and rejection of malformed shapes.
 */
import { describe, it, expect } from "vitest";
import {
  ListFilterConditionSchema,
  ListQueryBaseSchema,
  ListAuditQuerySchema,
} from "../list-query.js";

describe("ListFilterConditionSchema", () => {
  it("accepts a scalar condition", () => {
    const r = ListFilterConditionSchema.safeParse({
      field: "status", op: "=", value: "ACTIVE", connector: "AND",
    });
    expect(r.success).toBe(true);
  });

  it("accepts array value (IN / NOT IN)", () => {
    const r = ListFilterConditionSchema.safeParse({
      field: "status", op: "IN", value: ["A", "B", 1, true],
    });
    expect(r.success).toBe(true);
  });

  it("accepts {start,end} object (BETWEEN)", () => {
    const r = ListFilterConditionSchema.safeParse({
      field: "created_at", op: "BETWEEN",
      value: { start: "2024-01-01", end: "2024-12-31" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts null and boolean values", () => {
    expect(ListFilterConditionSchema.safeParse({ field: "x", op: "IS", value: null }).success).toBe(true);
    expect(ListFilterConditionSchema.safeParse({ field: "x", op: "=", value: true }).success).toBe(true);
  });

  it("rejects invalid connector and missing fields", () => {
    expect(ListFilterConditionSchema.safeParse({
      field: "x", op: "=", value: "1", connector: "XOR",
    }).success).toBe(false);
    expect(ListFilterConditionSchema.safeParse({ op: "=", value: "1" }).success).toBe(false);
  });

  it("rejects arbitrary object values (only {start,end} is legal)", () => {
    expect(ListFilterConditionSchema.safeParse({
      field: "x", op: "=", value: { foo: "bar" },
    }).success).toBe(false);
  });
});

describe("ListQueryBaseSchema", () => {
  it("parses qs-produced structures verbatim (no JSON parsing)", () => {
    const r = ListQueryBaseSchema.safeParse({
      search: "acme",
      page: "2",
      page_size: "50",
      sort_dir: "desc",
      deleted_records: "ONLY",
      filters: [
        { field: "status", op: "=", value: "ACTIVE" },
        { field: "created_at", op: "BETWEEN", value: { start: "2024-01-01", end: "2024-12-31" } },
      ],
      connector: "OR",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);           // coerced
      expect(r.data.filters).toHaveLength(2);
    }
  });

  it("coerces search_in csv to array", () => {
    const r = ListQueryBaseSchema.safeParse({ search_in: "a,b, c" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.search_in).toEqual(["a", "b", "c"]);
  });

  it("rejects a JSON-stringified filters param (wire format removed)", () => {
    const r = ListQueryBaseSchema.safeParse({
      filters: '[{"field":"status","op":"=","value":"A"}]',
    });
    expect(r.success).toBe(false);
  });
});

describe("ListAuditQuerySchema", () => {
  it("defaults page/limit and bounds limit", () => {
    const r = ListAuditQuerySchema.parse({});
    expect(r).toEqual({ page: 1, limit: 50 });
    expect(ListAuditQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
    expect(ListAuditQuerySchema.safeParse({ page: "3", limit: "10" }).success).toBe(true);
  });
});
