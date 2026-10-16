/**
 * entity-export — meta-derived export configuration (Part E.7).
 *
 * Pins the derivation rules that replace the hand-copied per-entity
 * `ExportConfig`: column selection (exclude audit/version/IANA-helper
 * fields), `ExportFieldMetadata` mapping from meta column `type`, and the
 * `datetime_iana_toggle` → `date` + `timezoneField` rule.
 */

import { describe, it, expect } from "vitest";

import {
  defaultExportColumns,
  exportFieldMetadata,
  ianaHelperFields,
} from "../entity-export.js";
import { customerMeta } from "../../modules/customers/customers.meta.js";

describe("entity-export — defaultExportColumns", () => {
  it("excludes audit actors, version, deleted_at and IANA helper fields", () => {
    const keys = defaultExportColumns(customerMeta).map((c) => c.key);
    expect(keys).not.toContain("created_by");
    expect(keys).not.toContain("updated_by");
    expect(keys).not.toContain("deleted_by");
    expect(keys).not.toContain("version");
    expect(keys).not.toContain("deleted_at");
    // helper field carried by `onboarding_at.datetime_iana_toggle`
    expect(keys).not.toContain("onboarding_time_zone");
  });

  it("reproduces the historical hand-picked customer export column list", () => {
    const keys = defaultExportColumns(customerMeta).map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "uuid", "code", "first_name", "last_name", "company_name",
        "email", "phone", "status", "status_reason",
        "local_address", "local_city", "local_state", "local_country", "local_zip",
        "onboarding_at", "created_at", "updated_at",
      ]),
    );
    expect(keys).toHaveLength(17);
  });

  it("orders columns by meta `order`", () => {
    const orders = defaultExportColumns(customerMeta).map((c) => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("entity-export — exportFieldMetadata", () => {
  const col = (over: object) => ({
    key: "k",
    label_key: "l",
    order: 0,
    ...over,
  }) as Parameters<typeof exportFieldMetadata>[0];

  it("maps text/badge/boolean/color → string", () => {
    for (const t of ["text", "badge", "boolean", "color"]) {
      expect(exportFieldMetadata(col({ type: t }))).toEqual({ type: "string" });
    }
  });

  it("maps number → number, datetime → datetime with seconds precision", () => {
    expect(exportFieldMetadata(col({ type: "number" }))).toEqual({ type: "number" });
    expect(exportFieldMetadata(col({ type: "datetime" }))).toEqual({
      type: "datetime",
      precision: "seconds",
    });
  });

  it("maps datetime + datetime_iana_toggle → date with timezoneField", () => {
    expect(
      exportFieldMetadata(
        col({ type: "datetime", datetime_iana_toggle: { record_iana_field: "tz" } }),
      ),
    ).toEqual({ type: "date", timezoneField: "tz" });
  });

  it("ianaHelperFields collects every record_iana_field target", () => {
    expect(ianaHelperFields(customerMeta).has("onboarding_time_zone")).toBe(true);
  });
});
