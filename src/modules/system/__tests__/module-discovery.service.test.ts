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
        { id: "schedules", label_key: "system.jobs.nav", href: "/system/job/job-schedules", icon: "schedule", default: true },
        { id: "runs", label_key: "system.runs.nav", href: "/system/job/runs", icon: "list-checks" },
        { id: "triggers", label_key: "system.jobs.nav_triggers", href: "/system/job/triggers", icon: "list-checks" },
      ],
      routes: [
        { route: "/system/job/job-schedules", kind: "list", entity: "job_schedule" },
        { route: "/system/job/job-schedules/create", kind: "create", entity: "job_schedule" },
        { route: "/system/job/runs", kind: "list", entity: "job_run" },
        { route: "/system/job/triggers", kind: "list", entity: "job_trigger" },
        { route: "/system/job/triggers/create", kind: "create", entity: "job_trigger" },
      ],
      sheets: [
        { key: "job.runDetail", component_url: "/svc/job/api/v1/module-assets/jobs-page.js" },
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
        { id: "customers", label_key: "system.customers.nav", href: "/crm/customers", default: true },
        { id: "pipeline", label_key: "system.pipeline.nav", href: "/system/crm/pipeline" },
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
    expect(job.nav?.map((l) => l.id)).toEqual(["schedules", "runs", "triggers"]);
    expect(job.routes?.map((r) => r.route)).toEqual([
      "/system/job/job-schedules",
      "/system/job/job-schedules/create",
      "/system/job/runs",
      "/system/job/triggers",
      "/system/job/triggers/create",
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
    const { modules } = await list(["access.system.job.triggers"]);
    expect(modules).toHaveLength(1);
    const job = modules[0];
    expect(job.nav?.map((l) => l.id)).toEqual(["triggers"]);
    expect(job.routes?.map((r) => r.route)).toEqual([
      "/system/job/triggers",
      "/system/job/triggers/create", // create collapses into the triggers leaf
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
    expect(job.nav_hidden?.map((l) => l.id)).toEqual(["schedules", "runs", "triggers"]);
  });

  it("a leaf grant in a sibling module does NOT leak — the sibling stays accessible:false", async () => {
    setup([settingsRow, jobRow]);
    const { modules } = await list(["access.system.job.triggers"]);
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
              label_key: "system.admin.nav",
              href: "/system/job/admin/flags",
              children: [
                { id: "flags", label_key: "system.flags.nav", href: "/system/job/admin/flags", default: true },
                { id: "quotas", label_key: "system.quotas.nav", href: "/system/job/admin/quotas" },
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
              label_key: "system.admin.nav",
              href: "/system/job/admin/flags",
              children: [
                { id: "flags", label_key: "system.flags.nav", href: "/system/job/admin/flags", default: true },
                { id: "quotas", label_key: "system.quotas.nav", href: "/system/job/admin/quotas" },
              ],
            },
            { id: "runs", label_key: "system.runs.nav", href: "/system/job/runs" },
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
      name: "Process Management",
      label_key: "system.module.name",
      endpoints: {
        nav: {
          route_prefixes: ["/system/job"],
          access: "access.system.job",
          nav: [
            { id: "schedules", label_key: "system.jobs.nav", href: "/system/job/job-schedules", default: true },
            { id: "rules", label_key: "system.rules.nav", href: "/system/job/triggers" },
          ],
          routes: [
            { route: "/system/job/job-schedules", kind: "list", label_key: "system.jobs.nav" },
            { route: "/system/job/triggers", kind: "list", label_key: "system.rules.nav" },
            { route: "/system/job/triggers/create", kind: "create", label_key: "system.rules.new" },
          ],
          sheets: [
            { key: "job.runDetail", component_url: "/svc/job/api/v1/module-assets/jobs-page.js", label_key: "system.run.sheet" },
          ],
        },
      },
    });
    setup([row]);
    setupDicts({
      system: {
        "system.module.name": "Process Management",
        "system.jobs.nav": "Schedules",
        "system.rules.nav": "Rules",
        "system.rules.new": "New rule",
        "system.run.sheet": "Run detail",
      },
    });
    const { labels } = await list(["access.system.job.triggers"]); // only 'triggers' survives the filter
    expect(labels).toEqual({
      "system.module.name": "Process Management",
      "system.jobs.nav": "Schedules",
      "system.rules.nav": "Rules",
      "system.rules.new": "New rule",
      "system.run.sheet": "Run detail",
    });
    // One dict fetch per scope regardless of key count.
    expect(mockTranslations.getI18nDict).toHaveBeenCalledTimes(1);
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("system", "en-GB");
  });

  it("resolves cross-scope references — app.*/system.* cited by service nav", async () => {
    const row = svc({
      code: "crm",
      part_of: "crm",
      endpoints: {
        nav: {
          route_prefixes: ["/crm"],
          access: "access.crm",
          nav: [{ id: "customers", label_key: "system.customers.nav", href: "/crm/customers", default: true }],
          routes: [
            { route: "/crm/customers", kind: "list" },
            { route: "/crm/customers/create", kind: "create", label_key: "app.common.new" },
          ],
        },
      },
    });
    setup([row]);
    setupDicts({
      system: { "system.customers.nav": "Customers" },
      app: { "app.common.new": "New" },
    });
    const { labels } = await list(["access.crm.*"]);
    expect(labels["system.customers.nav"]).toBe("Customers");
    expect(labels["app.common.new"]).toBe("New");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("system", "en-GB");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("app", "en-GB");
  });

  it("passes the requested language through to every dict fetch", async () => {
    setup([jobRow]);
    setupDicts({ system: { "system.jobs.nav": "Pianificazioni" } });
    const { labels } = await new ModuleDiscoveryService().list(
      { permissions: new Set(["access.system.job.*"]) },
      "it-IT",
    );
    expect(labels["system.jobs.nav"]).toBe("Pianificazioni");
    expect(mockTranslations.getI18nDict).toHaveBeenCalledWith("system", "it-IT");
  });

  it("a missing key is omitted — the FE falls back (raw key / module name)", async () => {
    setup([jobRow]);
    setupDicts({ system: { "system.jobs.nav": "Schedules" } }); // runs/rules keys absent
    const { labels } = await list(["access.system.job.*"]);
    expect(labels["system.jobs.nav"]).toBe("Schedules");
    expect(labels).not.toHaveProperty("system.runs.nav");
    expect(labels).not.toHaveProperty("system.rules.nav");
  });

  it("a scope that fails to resolve is contained — other scopes still resolve", async () => {
    const row = svc({
      code: "crm",
      part_of: "crm",
      label_key: "system.module.name",
      endpoints: {
        nav: {
          route_prefixes: ["/crm"],
          access: "access.crm",
          nav: [{ id: "customers", label_key: "system.customers.nav", href: "/crm/customers", default: true }],
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

describe("ModuleDiscoveryService — icon materialization", () => {
  /**
   * `icon` is OPTIONAL in the declaration — emission fills nulls from
   * the kind map: dict→table-dictionary, list→table-2, create/detail→text-cursor-input,
   * everything else→file-box. An authored icon always wins; nav leaves
   * inherit the icon of the route they point at. These assertions fail
   * against an emit that leaves `icon` undefined.
   */
  const dictSvc = svc({
    code: "crm",
    part_of: "crm",
    endpoints: {
      nav: {
        route_prefixes: ["/crm"],
        access: "access.crm",
        nav: [
          { id: "types", label_key: "system.types.nav", href: "/crm/settings/customer_types", default: true },
          { id: "custom", label_key: "system.custom.nav", href: "/crm/extras", icon: "star" },
          { id: "orphan", label_key: "system.orphan.nav", href: "/crm/archives" },
          {
            id: "group",
            label_key: "system.group.nav",
            href: "/crm/group",
            children: [{ id: "child", label_key: "system.child.nav", href: "/crm/settings/customer_types" }],
          },
        ],
        routes: [
          { route: "/crm/settings/customer_types", kind: "dict", entity: "customer_type" },
          { route: "/crm/extras", kind: "list", entity: "extra", icon: "star" },
          { route: "/crm/group", kind: "page" },
        ],
      },
    },
  });

  it("fills unset icons from kind — dict→table-dictionary — nav leaves inherit the pointed route's icon", async () => {
    setup([dictSvc]);
    const { modules } = await list(["access.crm.*"]);
    const m = modules[0];
    expect(m.routes?.find((r) => r.kind === "dict")?.icon).toBe("table-dictionary");
    expect(m.nav?.find((l) => l.id === "types")?.icon).toBe("table-dictionary");
    // Child leaves resolve through the same census map.
    expect(m.nav?.find((l) => l.id === "group")?.children?.[0]?.icon).toBe("table-dictionary");
    // The group parent keeps its declared (absent) icon — it is not a page.
    expect(m.nav?.find((l) => l.id === "group")?.icon).toBeUndefined();
    // A leaf with no matching route decl falls back to file-box.
    expect(m.nav?.find((l) => l.id === "orphan")?.icon).toBe("file-box");
  });

  it("an authored icon always wins — never overwritten", async () => {
    setup([dictSvc]);
    const { modules } = await list(["access.crm.*"]);
    const m = modules[0];
    expect(m.routes?.find((r) => r.route === "/crm/extras")?.icon).toBe("star");
    expect(m.nav?.find((l) => l.id === "custom")?.icon).toBe("star");
  });

  it("covers the kind vocabulary — list→table-2, create/detail→text-cursor-input, page→file-box", async () => {
    const allSvc = svc({
      code: "all",
      part_of: "all",
      endpoints: {
        nav: {
          route_prefixes: ["/all"],
          access: "access.all",
          nav: [{ id: "home", label_key: "system.all_nav", href: "/all/items", default: true }],
          routes: [
            { route: "/all/items", kind: "list" },
            { route: "/all/items/create", kind: "create" },
            { route: "/all/items/[uuid]", kind: "detail" },
            { route: "/all/panel", kind: "page" },
          ],
        },
      },
    });
    setup([allSvc]);
    const { modules } = await list(["access.all.*"]);
    const icon = Object.fromEntries((modules[0].routes ?? []).map((r) => [r.route, r.icon]));
    expect(icon["/all/items"]).toBe("table-2");
    expect(icon["/all/items/create"]).toBe("text-cursor-input");
    expect(icon["/all/items/[uuid]"]).toBe("text-cursor-input");
    expect(icon["/all/panel"]).toBe("file-box");
    // The nav leaf inherits its route's resolved kind icon.
    expect(modules[0].nav?.find((l) => l.id === "home")?.icon).toBe("table-2");
  });

  it("nav_hidden leaves materialize too — the launcher reveal shows the same icon", async () => {
    setup([dictSvc]);
    // Grant only the /crm/extras leaf — the dict leaf lands in nav_hidden
    // but still resolves its declared route's kind icon.
    const { modules } = await list(["access.crm.extras"]);
    const m = modules[0];
    expect(m.nav_hidden?.find((l) => l.href === "/crm/settings/customer_types")?.icon).toBe("table-dictionary");
  });
});

describe("ModuleDiscoveryService — entity ownership (endpoints.entities)", () => {
  it("serves endpoints.entities verbatim — the FE's entity→service source", async () => {
    const row = svc({
      code: "job",
      name: "Job Handler",
      endpoints: { entities: ["job_trigger", "job_schedule", "job_run"] },
    });
    setup([row]);
    const { modules } = await list([]);
    expect(modules[0].entities).toEqual(["job_trigger", "job_schedule", "job_run"]);
  });

  it("absent declaration → field omitted, never an empty list", async () => {
    setup([svc({ code: "bare", name: "Bare" })]);
    const { modules } = await list([]);
    expect(modules[0].entities).toBeUndefined();
  });

  it("the gateway row delegates its dict to 'system' — api owns no translations schema", async () => {
    setup([
      svc({
        code: "api",
        name: "API Gateway",
        is_reserved: true,
        endpoints: { events: { emits: [{ subject: "events.api.user.>" }] } },
      }),
    ]);
    const { modules } = await list([]);
    expect(modules[0].id).toBe("api");
    expect(modules[0].translations_module).toBe("system");
  });

  it("services without a dict delegate omit translations_module — id IS the schema", async () => {
    setup([svc({ code: "crm", name: "CRM" })]);
    const { modules } = await list([]);
    expect(modules[0].translations_module).toBeUndefined();
  });

  it("a headless service still publishes its owned entities — the page-less case the map exists for", async () => {
    const headless = svc({
      code: "emailsender",
      name: "Email Sender",
      endpoints: { entities: ["provider", "email_template"] },
    });
    setup([headless]);
    const { modules } = await list([]);
    expect(modules[0].entities).toEqual(["provider", "email_template"]);
  });
});
