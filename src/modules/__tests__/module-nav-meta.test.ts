import { describe, expect, it } from "vitest";

import { validateNavDeclaration } from "../module-nav-meta.js";

/**
 * `/{part_of}/{code}` prefix enforcement — the module's FE namespace is
 * derived, never free-chosen. When the module IS its own root
 * (`part_of === code`, e.g. crm) the segment collapses to `/{code}`.
 */

const validLink = (href: string, label_key = "job.jobs.nav") => ({ id: "x", label_key, href });

describe("validateNavDeclaration — module route namespace", () => {
  it("accepts a declaration under /{part_of}/{code}", () => {
    expect(
      validateNavDeclaration("job", {
        route_prefixes: ["/system/job"],
        nav: [validLink("/system/job/job-schedules"), validLink("/system/job/rules")],
        routes: [
          { route: "/system/job/job-schedules", kind: "list", entity: "job_schedule" },
          { route: "/system/job/job-schedules/create", kind: "create", entity: "job_schedule" },
          { route: "/system/job/rules", kind: "list", entity: "job_rule" },
        ],
      }, "system"),
    ).toBeNull();
  });

  it("rejects prefixes outside /{part_of}/{code}", () => {
    expect(
      validateNavDeclaration("job", {
        route_prefixes: ["/jobs"],
        nav: [validLink("/jobs")],
      }, "system"),
    ).toMatch(/extra prefix '\/jobs' must be '\/<root>\/job'/);
  });

  it("rejects nav hrefs outside the module prefix", () => {
    expect(
      validateNavDeclaration("job", {
        route_prefixes: ["/system/job"],
        nav: [validLink("/system/settings")],
      }, "system"),
    ).toMatch(/outside the module prefix/);
  });

  it("collapses the prefix to /{code} when part_of === code (crm)", () => {
    expect(
      validateNavDeclaration("crm", {
        route_prefixes: ["/crm"],
        nav: [validLink("/crm/customers", "crm.customers.nav"), validLink("/crm/pipeline", "crm.pipeline.nav")],
        routes: [
          { route: "/crm/customers", kind: "list", entity: "customer" },
          { route: "/crm/pipeline", kind: "page" },
        ],
      }, "crm"),
    ).toBeNull();
    // …and /crm/crm must NOT be demanded
    expect(
      validateNavDeclaration("crm", {
        route_prefixes: ["/crm/crm"],
        nav: [validLink("/crm/crm/customers", "crm.customers.nav")],
      }, "crm"),
    ).toMatch(/must declare its primary prefix '\/crm'/);
  });

  it("rejects a foreign-root prefix even when the code matches", () => {
    expect(
      validateNavDeclaration("job", {
        route_prefixes: ["/crm/job"],
        nav: [validLink("/crm/job")],
      }, "system"),
    ).toMatch(/must declare its primary prefix '\/system\/job'/);
  });

  it("rejects malformed declarations", () => {
    expect(validateNavDeclaration("job", null, "system")).toMatch(/must be an object/);
    expect(validateNavDeclaration("job", { nav: [] }, "system")).toMatch(/route_prefixes/);
    expect(
      validateNavDeclaration("job", {
        route_prefixes: ["/system/job"],
        nav: [{ id: "x", label_key: "other.ns.key", href: "/system/job" }],
      }, "system"),
    ).toMatch(/outside the module namespace/);
  });
});
