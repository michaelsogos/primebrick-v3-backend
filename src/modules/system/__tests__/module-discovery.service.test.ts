import { describe, it, expect, vi } from "vitest";

/**
 * ModuleDiscoveryService — the access-axis contract, verified on the
 * derived-leaf semantics the whole shell depends on:
 *
 *  - leaf keys are DERIVED from routes (`access.{ns}.{leaf}`), never
 *    declared — `create`/`[param]` collapse into their owning leaf
 *  - coverage is exact-or-wildcard only: a bare namespace grant
 *    (`access.system.job`) covers NOTHING — `access.system.job.*` covers
 *    the module, `access.system.*` the whole app
 *  - module visibility is derived: ≥1 accessible leaf ⇒ module exists
 *  - no is_admin inheritance — access grants are always explicit
 *  - `home` is dead — `default` rides the nav item as a flag
 *  - undeclared (headless) services pass through unfiltered
 */

// The registry feed — synthetic service rows.
const mockRegistry = { findAll: vi.fn() };

// The translations feed — the labels seed resolves through the same
// service the i18n dict endpoint uses; tests stub it per scope.
const mockTranslations = { getI18nDict: vi.fn() };

vi.mock("../service-registry.service.js", () => ({
  ServiceRegistryService: vi.fn().mockImplementation(function () {
    return mockRegistry;
  }),
}));

vi.mock("../translations.service.js", () => ({
  TranslationsService: vi.fn().mockImplementation(function () {
    return mockTranslations;
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
      access: "access.system.job",
      nav: [
        { id: "schedules", label_key: "job.jobs.nav", href: "/system/job/job-schedules", icon: "schedule", default: true },
        { id: "runs", label_key: "job.runs.nav", href: "/system/job/runs", icon: "list-checks" },
        { id: "rules", label_key: "job.rules.nav", href: "/system/job/rules", icon: "list-todo" },
      ],
      routes: [
        { route: "/system/job/job-schedules", kind: "list", entity: "job_schedule" },
        { route: "/system/job/job-schedules/create", kind: "create", entity: "job_schedule" },
        { route: "/system/job/runs", kind: "list", entity: "job_run" },
        { route: "/system/job/rules", kind: "list", entity: "job_rule" },
        { route: "/system/job/rules/create", kind: "create", entity: "job_rule" },
      ],
      sheets: [
        { key: "job.runDetail", component_url: "/ws/job/api/v1/module-assets/jobs-page.js" },
      ],
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
      access: "access.crm",
      nav: [
        { id: "customers", label_key: "crm.customers.nav", href: "/crm/customers", default: true },
        { id: "pipeline", label_key: "crm.pipeline.nav", href: "/system/crm/pipeline" },
      ],
      routes: [
        { route: "/crm/customers", kind: "list", entity: "customer" },
        { route: "/system/crm/pipeline", kind: "page" },
      ],
    },
  },
});

/** A service that declared NO nav — passes through unfiltered. */
const headlessRow = svc({ code: "emailsender", name: "Email Sender" });

function setup(rows: Record<string, unknown>[]) {
  mockRegistry.findAll.mockResolvedValue(rows);
  mockTranslations.getI18nDict.mockClear();
  mockTranslations.getI18nDict.mockResolvedValue({ data: {}, etag: "e", cached_at: 0 });
}

/** Stub the translations feed per scope — `{ scope: { key: value } }`. */
function setupDicts(dictsByScope: Record<string, Record<string, string>>) {
  mockTranslations.getI18nDict.mockImplementation((scope: string) =>
    Promise.resolve({ data: dictsByScope[scope] ?? {}, etag: "e", cached_at: 0 }),
  );
}

const list = (permissions: string[] = []) =>
  new ModuleDiscoveryService().list({ permissions: new Set(permissions) });

describe("ModuleDiscoveryService — derived-leaf access filtering", () => {
  it("a module wildcard covers every leaf — nav, routes, sheets whole", async () => {
    setup([jobRow]);
    const { modules } = await list(["access.system.job.*"]);
    const job = modules[0];
    expect(job.nav?.map((l) => l.id)).toEqual(["schedules", "runs", "rules"]);
    expect(job.routes?.map((r) => r.route)).toEqual([
      "/system/job/job-schedules",
      "/system/job/job-schedules/create",
      "/system/job/runs",
      "/system/job/rules",
      "/system/job/rules/create",
    ]);
    expect(job.sheets?.map((s) => s.key)).toEqual(["job.runDetail"]);
    // The default flag rides the nav item through the filter.
    expect(job.nav?.[0].default).toBe(true);
  });

  it("an app wildcard covers every module under it — system AND nothing else", async () => {
    setup([settingsRow, jobRow, crmRow]);
    const { modules } = await list(["access.system.*"]);
    const ids = modules.map((m) => m.id);
    expect(ids).toContain("settings");
    expect(ids).toContain("job");
    // crm is a different app root — present only as an inaccessible
    // reveal entry, never navigable.
    const crm = modules.find((m) => m.id === "crm");
    expect(crm?.accessible).toBe(false);
  });

  it("an exact leaf grant keeps only that leaf — module still visible", async () => {
    setup([jobRow]);
    const { modules } = await list(["access.system.job.rules"]);
    expect(modules).toHaveLength(1);
    const job = modules[0];
    expect(job.nav?.map((l) => l.id)).toEqual(["rules"]);
    expect(job.routes?.map((r) => r.route)).toEqual([
      "/system/job/rules",
      "/system/job/rules/create", // create collapses into the rules leaf
    ]);
    expect(job.sheets).toEqual([]); // sheet key is its own leaf
  });

  it("a bare namespace grant covers NOTHING — the module stays only as an accessible:false reveal entry", async () => {
    setup([jobRow]);
    const { modules } = await list(["access.system.job"]);
    expect(modules).toHaveLength(1);
    const job = modules[0];
    expect(job.accessible).toBe(false);
    expect(job.nav).toEqual([]);
    // Every dropped leaf rides nav_hidden — the launcher's reveal switch.
    expect(job.nav_hidden?.map((l) => l.id)).toEqual(["schedules", "runs", "rules"]);
  });

  it("a leaf grant in a sibling module does NOT leak — the sibling stays accessible:false", async () => {
    setup([settingsRow, jobRow]);
    const { modules } = await list(["access.system.job.rules"]);
    expect(modules.map((m) => m.id)).toEqual(["settings", "job"]);
    expect(modules[0].accessible).toBe(false);
    expect(modules[1].accessible).toBeUndefined();
  });

  it("settings leaves filter per-grant — only the granted tabs survive", async () => {
    setup([settingsRow]);
    const { modules } = await list(["access.system.settings.roles"]);
    const settings = modules[0];
    expect(settings.nav?.map((l) => l.id)).toEqual(["roles"]);
    expect(settings.routes?.map((r) => r.route)).toEqual([
      "/system/settings/roles",
      "/system/settings/roles/[uuid]",
      "/system/settings/roles/create",
    ]);
    // The other settings tabs surface in nav_hidden for the reveal switch.
    expect(settings.nav_hidden?.some((l) => l.id === "users")).toBe(true);
    expect(settings.nav_hidden?.some((l) => l.id === "roles")).toBe(false);
  });

  it("a leaf grant keeps the parent group header alive", async () => {
    const grouped = svc({
      code: "job",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          access: "access.system.job",
          nav: [
            {
              id: "admin",
              label_key: "job.admin.nav",
              href: "/system/job/admin/flags",
              children: [
                { id: "flags", label_key: "job.flags.nav", href: "/system/job/admin/flags", default: true },
                { id: "quotas", label_key: "job.quotas.nav", href: "/system/job/admin/quotas" },
              ],
            },
          ],
          routes: [
            { route: "/system/job/admin/flags", kind: "page" },
            { route: "/system/job/admin/quotas", kind: "page" },
          ],
        },
      },
    });
    setup([grouped]);
    const { modules } = await list(["access.system.job.admin.flags"]);
    const admin = modules[0].nav?.[0];
    // The parent href IS a leaf (flags) — covered → kept with only the
    // reachable child; the dropped sibling surfaces in nav_hidden.
    expect(admin?.id).toBe("admin");
    expect(admin?.children?.map((c) => c.id)).toEqual(["flags"]);
    expect(modules[0].nav_hidden?.map((l) => l.id)).toEqual(["quotas"]);
  });

  it("a sub-namespace wildcard covers a whole subtree", async () => {
    const grouped = svc({
      code: "job",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          access: "access.system.job",
          nav: [
            {
              id: "admin",
              label_key: "job.admin.nav",
              href: "/system/job/admin/flags",
              children: [
                { id: "flags", label_key: "job.flags.nav", href: "/system/job/admin/flags", default: true },
                { id: "quotas", label_key: "job.quotas.nav", href: "/system/job/admin/quotas" },
              ],
            },
            { id: "runs", label_key: "job.runs.nav", href: "/system/job/runs" },
          ],
          routes: [
            { route: "/system/job/admin/flags", kind: "page" },
            { route: "/system/job/admin/quotas", kind: "page" },
            { route: "/system/job/runs", kind: "list", entity: "job_run" },
          ],
        },
      },
    });
    setup([grouped]);
    const { modules } = await list(["access.system.job.admin.*"]);
    const admin = modules[0].nav?.[0];
    expect(admin?.children?.map((c) => c.id)).toEqual(["flags", "quotas"]);
    expect(modules[0].nav?.map((l) => l.id)).toEqual(["admin"]);
    expect(modules[0].nav_hidden?.map((l) => l.id)).toEqual(["runs"]);
  });

  it("crm leaves key on the collapsed namespace — access.crm.* covers both prefixes", async () => {
    setup([crmRow]);
    const { modules } = await list(["access.crm.*"]);
    const crm = modules[0];
    expect(crm.nav?.map((l) => l.id)).toEqual(["customers", "pipeline"]);
    // The secondary /system/crm prefix still derives under access.crm —
    // the access namespace follows the MODULE, not the URL root.
    expect(crm.routes?.map((r) => r.route)).toEqual(["/crm/customers", "/system/crm/pipeline"]);
  });

  it("an exact crm leaf keeps only that page — pipeline drops", async () => {
    setup([crmRow]);
    const { modules } = await list(["access.crm.customers"]);
    expect(modules[0].nav?.map((l) => l.id)).toEqual(["customers"]);
  });

  it("admin-ness buys nothing — no grants, declared modules stay inaccessible", async () => {
    setup([settingsRow, jobRow, headlessRow]);
    const { modules } = await list([]);
    const byId = new Map(modules.map((m) => [m.id, m]));
    expect(byId.get("emailsender")?.accessible).toBeUndefined(); // headless passes through
    expect(byId.get("settings")?.accessible).toBe(false);
    expect(byId.get("job")?.accessible).toBe(false);
  });

  it("anonymous (no user) — declared modules are inaccessible, headless passes through", async () => {
    setup([settingsRow, jobRow, headlessRow]);
    const { modules } = await new ModuleDiscoveryService().list(undefined);
    const byId = new Map(modules.map((m) => [m.id, m]));
    expect(byId.get("emailsender")?.accessible).toBeUndefined();
    expect(byId.get("settings")?.accessible).toBe(false);
    expect(byId.get("job")?.accessible).toBe(false);
  });
});

describe("ModuleDiscoveryService — labels seed", () => {
  it("resolves every declared label_key — module, nav, hidden leaves, routes, sheets", async () => {
    const row = svc({
      code: "job",
      name: "Process Manager",
      label_key: "job.module.name",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          access: "access.system.job",
          nav: [
            { id: "schedules", label_key: "job.jobs.nav", href: "/system/job/job-schedules", default: true },
            { id: "rules", label_key: "job.rules.nav", href: "/system/job/rules" },
          ],
          routes: [
            { route: "/system/job/job-schedules", kind: "list", label_key: "job.jobs.nav" },
            { route: "/system/job/rules", kind: "list", label_key: "job.rules.nav" },
            { route: "/system/job/rules/create", kind: "create", label_key: "job.rules.new" },
          ],
          sheets: [
            { key: "job.runDetail", component_url: "/ws/job/api/v1/module-assets/jobs-page.js", label_key: "job.run.sheet" },
          ],
        },
      },
    });
    setup([row]);
    setupDicts({
      job: {
        "job.module.name": "Process Manager",
        "job.jobs.nav": "Schedules",
        "job.rules.nav": "Rules",
        "job.rules.new": "New rule",
        "job.run.sheet": "Run detail",
      },
    });
    const { labels } = await list(["access.system.job.rules"]); // only 'rules' survives the filter
    expect(labels).toEqual({
      "job.module.name": "Process Manager",
      "job.jobs.nav": "Schedules",
      "job.rules.nav": "Rules",
      "job.rules.new": "New rule",
      "job.run.sheet": "Run detail",
    });
    // One dict fetch per scope regardless of key count.
    expect(mockTranslations.getI18nDict).toHaveBeenCalledTimes(1);
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("job", "en-GB");
  });

  it("resolves cross-scope references — app.*/system.* cited by service nav", async () => {
    const row = svc({
      code: "crm",
      part_of: "crm",
      endpoints: {
        nav: {
          route_prefixes: ["/crm"],
          access: "access.crm",
          nav: [{ id: "customers", label_key: "crm.customers.nav", href: "/crm/customers", default: true }],
          routes: [
            { route: "/crm/customers", kind: "list" },
            { route: "/crm/customers/create", kind: "create", label_key: "app.common.new" },
          ],
        },
      },
    });
    setup([row]);
    setupDicts({
      crm: { "crm.customers.nav": "Customers" },
      app: { "app.common.new": "New" },
    });
    const { labels } = await list(["access.crm.*"]);
    expect(labels["crm.customers.nav"]).toBe("Customers");
    expect(labels["app.common.new"]).toBe("New");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("crm", "en-GB");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("app", "en-GB");
  });

  it("passes the requested language through to every dict fetch", async () => {
    setup([jobRow]);
    setupDicts({ job: { "job.jobs.nav": "Pianificazioni" } });
    const { labels } = await new ModuleDiscoveryService().list(
      { permissions: new Set(["access.system.job.*"]) },
      "it-IT",
    );
    expect(labels["job.jobs.nav"]).toBe("Pianificazioni");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("job", "it-IT");
  });

  it("a missing key is omitted — the FE falls back (raw key / module name)", async () => {
    setup([jobRow]);
    setupDicts({ job: { "job.jobs.nav": "Schedules" } }); // runs/rules keys absent
    const { labels } = await list(["access.system.job.*"]);
    expect(labels["job.jobs.nav"]).toBe("Schedules");
    expect(labels).not.toHaveProperty("job.runs.nav");
    expect(labels).not.toHaveProperty("job.rules.nav");
  });

  it("a scope that fails to resolve is contained — other scopes still resolve", async () => {
    const row = svc({
      code: "crm",
      part_of: "crm",
      label_key: "crm.module.name",
      endpoints: {
        nav: {
          route_prefixes: ["/crm"],
          access: "access.crm",
          nav: [{ id: "customers", label_key: "crm.customers.nav", href: "/crm/customers", default: true }],
          routes: [
            { route: "/crm/customers", kind: "list" },
            { route: "/crm/customers/create", kind: "create", label_key: "app.common.new" },
          ],
        },
      },
    });
    setup([row]);
    mockTranslations.getI18nDict.mockImplementation((scope: string) =>
      scope === "crm"
        ? Promise.reject(new Error("translations table missing"))
        : Promise.resolve({ data: { "app.common.new": "New" }, etag: "e", cached_at: 0 }),
    );
    const { modules, labels } = await list(["access.crm.*"]);
    expect(modules).toHaveLength(1); // census survives the scope failure
    expect(labels).toEqual({ "app.common.new": "New" });
  });
});
