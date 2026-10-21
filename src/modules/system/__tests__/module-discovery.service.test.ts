import { describe, it, expect, vi } from "vitest";

/**
 * ModuleDiscoveryService — the access-axis contract, verified on the
 * filtering semantics the whole shell depends on:
 *
 *  - module-level `access` gate = all-or-nothing (`access.system.settings`)
 *  - page-level `access` = per-link filtering inside an open module
 *  - a page grant does NOT satisfy a module-level gate
 *  - a module grant covers the whole subtree (bare `access.system.job`)
 *  - `is_admin` inherits `access.system` ONLY — never `access.crm`
 *  - `home` is computed post-filter (first REACHABLE page per root)
 *  - undeclared modules stay open to any authenticated user
 */

// The registry feed — synthetic service rows.
const mockRegistry = { findAll: vi.fn() };

vi.mock("../service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () {
    return mockRegistry;
  }),
}));

import { ModuleDiscoveryService } from "../module-discovery.service.js";

function svc(over: Record<string, unknown>) {
  return {
    code: "svc",
    name: "Svc",
    is_enabled: true,
    icon: "box",
    part_of: "system",
    is_reserved: false,
    is_default: false,
    label_key: null,
    endpoints: null,
    ...over,
  } as never;
}

const settingsRow = svc({ code: "settings", name: "Settings", is_reserved: true, is_default: true, icon: "settings" });

const jobRow = svc({
  code: "job",
  name: "Job Handler",
  icon: "schedule",
  endpoints: {
    nav: {
      route_prefixes: ["/system/job"],
      nav: [
        { id: "schedules", label_key: "job.jobs.nav", href: "/system/job/job-schedules", icon: "schedule" },
        { id: "runs", label_key: "job.runs.nav", href: "/system/job/runs", icon: "list-checks" },
        {
          id: "rules",
          label_key: "job.rules.nav",
          href: "/system/job/rules",
          icon: "list-todo",
          access: "access.system.job.rules",
        },
      ],
      routes: [
        { route: "/system/job/job-schedules", kind: "list", entity: "job_schedule" },
        { route: "/system/job/runs", kind: "list", entity: "job_run" },
        { route: "/system/job/rules", kind: "list", entity: "job_rule", access: "access.system.job.rules" },
      ],
    },
  },
});

/** Business-root module gated at module level: `access.shop` required. */
const shopRow = svc({
  code: "shop",
  name: "Shop",
  part_of: "shop",
  icon: "shopping-bag",
  endpoints: {
    nav: {
      route_prefixes: ["/shop"],
      access: "access.shop",
      nav: [{ id: "orders", label_key: "shop.orders.nav", href: "/shop/orders" }],
      routes: [{ route: "/shop/orders", kind: "list", entity: "order" }],
    },
  },
});

const crmRow = svc({
  code: "crm",
  name: "CRM",
  part_of: "crm",
  icon: "users",
  endpoints: {
    nav: {
      route_prefixes: ["/crm", "/system/crm"],
      nav: [
        { id: "customers", label_key: "crm.customers.nav", href: "/crm/customers" },
        { id: "pipeline", label_key: "crm.pipeline.nav", href: "/system/crm/pipeline" },
      ],
      routes: [
        { route: "/crm/customers", kind: "list", entity: "customer" },
        { route: "/system/crm/pipeline", kind: "page" },
      ],
    },
  },
});

function setup(rows: Record<string, unknown>[]) {
  mockRegistry.findAll.mockResolvedValue(rows);
}

const list = (permissions: string[] = [], isAdmin = false) =>
  new ModuleDiscoveryService().list({ permissions: new Set(permissions), isAdmin });

describe("ModuleDiscoveryService — access filtering", () => {
  it("admin inherits access.system: sees settings+job+crm, not business-gated shop", async () => {
    setup([settingsRow, jobRow, shopRow, crmRow]);
    const { modules } = await list([], true);
    const ids = modules.map((m) => m.id);
    expect(ids).toContain("settings"); // implied access.system covers it
    expect(ids).toContain("job");
    expect(ids).toContain("crm"); // undeclared → open
    expect(ids).not.toContain("shop"); // access.crm-root NOT implied
  });

  it("non-admin without access.system.settings: settings absent, job open", async () => {
    setup([settingsRow, jobRow, crmRow]);
    const { modules } = await list(["access.system.job", "customer.read.all"]);
    const ids = modules.map((m) => m.id);
    expect(ids).not.toContain("settings");
    expect(ids).toContain("job");
    expect(ids).toContain("crm");
  });

  it("module grant covers the subtree — access.system.job ⇒ rules page visible", async () => {
    setup([jobRow]);
    const { modules } = await list(["access.system.job"]);
    const job = modules[0];
    expect(job.nav?.map((l) => l.id)).toEqual(["schedules", "runs", "rules"]);
    expect(job.routes?.map((r) => r.route)).toContain("/system/job/rules");
  });

  it("page-level gate filters one nav item — module stays, item drops", async () => {
    setup([jobRow]);
    // User holds the bare module-less page set: job/runs but NOT rules.
    const { modules } = await list(["access.system.job.runs"]);
    const job = modules[0];
    expect(job).toBeTruthy();
    // 'schedules'/'runs' are undeclared → open; 'rules' gated → filtered out.
    expect(job.nav?.map((l) => l.id)).toEqual(["schedules", "runs"]);
    expect(job.routes?.map((r) => r.route)).not.toContain("/system/job/rules");
    // home = first REACHABLE page — still the schedules list.
    expect(job.home?.["system"]).toBe("/system/job/job-schedules");
  });

  it("a page grant does NOT satisfy a module-level gate", async () => {
    setup([settingsRow]);
    // access.system.settings.users is a PAGE key — the module gate is
    // access.system.settings exactly.
    const { modules } = await list(["access.system.settings.users"]);
    expect(modules).toHaveLength(0);
  });

  it("home follows the post-filter nav — first reachable page wins", async () => {
    const gated = svc({
      code: "job",
      name: "Job Handler",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          nav: [
            { id: "jobs", label_key: "job.jobs.nav", href: "/system/job/job-schedules", access: "access.system.job.list" },
            { id: "runs", label_key: "job.runs.nav", href: "/system/job/runs" },
          ],
        },
      },
    });
    setup([gated]);
    const { modules } = await list([]);
    // nav[0] (jobs) is gated out → home falls to the first visible page.
    expect(modules[0].home?.["system"]).toBe("/system/job/runs");
  });

  it("parent with surviving children stays as the group header", async () => {
    const grouped = svc({
      code: "job",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          nav: [
            {
              id: "admin",
              label_key: "job.admin.nav",
              href: "/system/job/admin",
              access: "access.system.job.admin",
              children: [
                { id: "flags", label_key: "job.flags.nav", href: "/system/job/admin/flags" },
              ],
            },
          ],
          routes: [
            { route: "/system/job/admin", kind: "page" },
            { route: "/system/job/admin/flags", kind: "page" },
          ],
        },
      },
    });
    setup([grouped]);
    const { modules } = await list([]);
    const admin = modules[0].nav?.[0];
    // Parent gated but has a visible child → kept as group header.
    expect(admin?.id).toBe("admin");
    expect(admin?.children?.map((c) => c.id)).toEqual(["flags"]);
  });

  it("anonymous (no user) sees only undeclared modules — deny-first", async () => {
    setup([settingsRow, jobRow, shopRow]);
    const { modules } = await new ModuleDiscoveryService().list(undefined);
    const ids = modules.map((m) => m.id);
    expect(ids).toContain("job");
    expect(ids).not.toContain("settings");
    expect(ids).not.toContain("shop");
  });
});
