/**
 * Module navigation metadata resolution.
 *
 * Two sources, one contract (`ModuleNavWithPrefixes`):
 *
 * - `MODULE_NAV` — static registry for BE-OWNED modules only: the reserved
 *   `settings` shell module and BE-native modules (crm) whose pages are
 *   served by the FE itself. NEVER declare another service's pages here —
 *   a module must present only its own nav.
 * - `service_registry.endpoints.nav` — self-described nav published by a
 *   service in its `service.register` payload (see `navFromEndpoints`).
 *   This is the wiring that lets each module own its pages: the BE merges
 *   it into /modules, /modules/:code/meta and the routes census.
 *
 * The FE never hardcodes any of this — it fetches everything via the API.
 */

import type {
  ModuleNavLink,
  ModuleNavWithPrefixes,
  PageRouteDeclaration,
} from "./module-nav-types.js";

const MODULE_NAV: Record<string, ModuleNavWithPrefixes> = {
  crm: {
        module: "crm",
        icon: "users",
        route_prefixes: ["/system/customers", "/crm"],
        nav: [
          { id: "customers", label_key: "system.entities.customer.title", href: "/system/customers", icon: "users" },
          { id: "pipeline", label_key: "system.entities.crm.pipeline.nav", href: "/crm/pipeline", icon: "git-branch" },
        ],
        routes: [
          { route: "/system/customers", kind: "list", entity: "customer" },
          { route: "/system/customers/new", kind: "create", entity: "customer" },
          { route: "/crm/pipeline", kind: "page" },
        ],
  },
  settings: {
        module: "settings",
        icon: "settings",
        route_prefixes: ["/system"],
        is_reserved: true,
        nav: [
          { id: "profile", label_key: "system.settings.tabs.profile", href: "/system/settings/profile", icon: "square-user" },
          { id: "credentials", label_key: "system.settings.tabs.credentials", href: "/system/settings/credentials", icon: "key-round" },
          { id: "organizations", label_key: "system.settings.tabs.organizations", href: "/system/settings/organizations", icon: "building-complex" },
          { id: "users", label_key: "system.settings.tabs.users", href: "/system/settings/users", icon: "users" },
          { id: "roles", label_key: "system.settings.tabs.roles", href: "/system/settings/roles", icon: "user-key" },
          { id: "configurations", label_key: "system.settings.tabs.configurations", href: "/system/settings/configurations", icon: "settings-2" },
          { id: "ai", label_key: "system.settings.tabs.ai", href: "/system/settings/ai", icon: "brain-circuit" },
          { id: "docs-index", label_key: "system.settings.tabs.docsIndex", href: "/system/settings/docs-index", icon: "book-search" },
          { id: "modules", label_key: "system.settings.tabs.modules", href: "/system/settings/modules", icon: "package" },
          { id: "clients", label_key: "system.settings.tabs.clients", href: "/system/settings/clients", icon: "shield-check" },
          { id: "templates", label_key: "system.settings.tabs.templates", href: "/system/settings/templates", icon: "file-text" },
          { id: "email-providers", label_key: "system.settings.tabs.emailProviders", href: "/system/settings/email-providers", icon: "mail" },
          { id: "migrations", label_key: "system.migrations.nav", href: "/system/migrations", icon: "database-zap" },
        ],
        // Full route census — every FE path this module owns, including
        // detail/create/param routes not deducible from nav links.
        routes: [
          { route: "/system/settings", kind: "page" },
          { route: "/system/settings/profile", kind: "page" },
          { route: "/system/settings/credentials", kind: "page" },
          { route: "/system/settings/organizations", kind: "list", entity: "organization" },
          { route: "/system/settings/organizations/[uuid]", kind: "detail", entity: "organization" },
          { route: "/system/settings/organizations/create", kind: "create", entity: "organization" },
          { route: "/system/settings/users", kind: "list", entity: "user_profile" },
          { route: "/system/settings/users/[uuid]", kind: "detail", entity: "user_profile" },
          { route: "/system/settings/users/create", kind: "create", entity: "user_profile" },
          { route: "/system/settings/roles", kind: "list", entity: "role_mapping" },
          { route: "/system/settings/roles/[uuid]", kind: "detail", entity: "role_mapping" },
          { route: "/system/settings/roles/create", kind: "create", entity: "role_mapping" },
          { route: "/system/settings/configurations", kind: "list", entity: "config_entry" },
          { route: "/system/settings/configurations/create", kind: "create", entity: "config_entry" },
          { route: "/system/settings/ai", kind: "page" },
          { route: "/system/settings/docs-index", kind: "page" },
          { route: "/system/settings/modules", kind: "list", entity: "service_registry" },
          { route: "/system/settings/modules/[code]", kind: "detail", entity: "service_registry" },
          { route: "/system/settings/clients", kind: "list", entity: "client_registry" },
          { route: "/system/settings/clients/[uuid]", kind: "detail", entity: "client_registry" },
          { route: "/system/settings/clients/create", kind: "create", entity: "client_registry" },
          { route: "/system/settings/templates", kind: "list", entity: "template" },
          { route: "/system/settings/translations", kind: "page" },
          { route: "/system/settings/email-providers", kind: "list", entity: "email_provider" },
          { route: "/system/migrations", kind: "page" },
        ],
  },
};

/** All statically declared module codes — the nav-map doc generator iterates these. */
export function listModuleNavCodes(): string[] {
  return Object.keys(MODULE_NAV);
}

export function buildModuleNavMeta(code: string): ModuleNavWithPrefixes | null {
  return MODULE_NAV[code.toLowerCase()] ?? null;
}

// ─── Service-declared nav (service_registry.endpoints.nav) ────────────────

/**
 * Read a module's self-declared nav from a service_registry row's
 * `endpoints` payload (`endpoints.nav`, published via `service.register`).
 *
 * This is the channel by which a service owns its FE pages — e.g. the job
 * service declares `/system/jobs` with its remote `component_url`, so the
 * census/module-meta serve it as a JOB-module route, never as a Settings
 * page. Returns null when the row has no nav declaration or the payload is
 * malformed (a bad declaration must not break module resolution).
 */
export function navFromEndpoints(
  code: string,
  endpoints: Record<string, unknown> | null | undefined,
): ModuleNavWithPrefixes | null {
  const raw = endpoints?.["nav"];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const decl = raw as Record<string, unknown>;
  if (!Array.isArray(decl["nav"]) || !Array.isArray(decl["route_prefixes"])) {
    return null;
  }
  return {
    module: code,
    icon: typeof decl["icon"] === "string" ? decl["icon"] : undefined,
    route_prefixes: decl["route_prefixes"] as string[],
    nav: decl["nav"] as ModuleNavLink[],
    routes: Array.isArray(decl["routes"]) ? (decl["routes"] as PageRouteDeclaration[]) : undefined,
  };
}

/**
 * Resolve the effective nav meta for a module code — static registry first
 * (BE-owned/reserved modules), then the service's own endpoints.nav
 * declaration. Pass the service_registry row's `endpoints` when available.
 */
export function resolveModuleNavMeta(
  code: string,
  endpoints?: Record<string, unknown> | null,
): ModuleNavWithPrefixes | null {
  return buildModuleNavMeta(code) ?? navFromEndpoints(code, endpoints);
}
