/**
 * Module navigation metadata resolution.
 *
 * Two sources, one contract (`ModuleNavWithPrefixes`):
 *
 * - `MODULE_NAV` — static registry for BE-OWNED modules only: the reserved
 *   `settings` shell module. NEVER declare a service module's pages here —
 *   a module must present only its own nav; service modules (job,
 *   emailsender, crm, …) publish their nav via service registration.
 * - `service_registry.endpoints.nav` — self-described nav published by a
 *   service in its `service.register` payload (see `navFromEndpoints`).
 *   This is the wiring that lets each module own its pages: the BE merges
 *   it into /modules, /modules/:code/meta and the routes census.
 *
 * The FE never hardcodes any of this — it fetches everything via the API.
 */

import { entityPaths, validateNavDeclaration } from "@primebrick/sdk";

import type {
  ModuleNavLink,
  ModuleNavWithPrefixes,
  ModuleSheetDecl,
  PageRouteDeclaration,
} from "./module-nav-types.js";

// The nav-declaration validator and the entityPaths route builder live in
// @primebrick/sdk (service/nav-declaration.ts) — they are the shared
// contract for the `service.register` payload, so service repos can
// unit-test their declaration at write-time before enrollment. The static
// BE-owned nav below goes through the SAME validator in
// __tests__/module-nav-static.test.ts. Re-exported for internal callers.
export { validateNavDeclaration };

// Route paths are DERIVED, never literals — entityPaths is the single
// constructor of the `/{list}` / `/{list}/create` / `/{list}/[param]`
// shape; the shared validator rejects hand-written divergence.
const organizationsPaths = entityPaths("/system/settings", "organizations");
const usersPaths = entityPaths("/system/settings", "users");
const rolesPaths = entityPaths("/system/settings", "roles");
const configurationsPaths = entityPaths("/system/settings", "configurations");
const modulesPaths = entityPaths("/system/settings", "modules", "code");
const clientsPaths = entityPaths("/system/settings", "clients");

const MODULE_NAV: Record<string, ModuleNavWithPrefixes> = {
  settings: {
        module: "settings",
        // Attribution, not containment: settings declares ONLY the prefix
        // its own routes actually live under — the module prefix
        // `/{part_of}/{code}` = /system/settings. `/system` as a catch-all
        // would re-attribute service-owned pages (job, ai, …) to settings
        // whenever the owning service goes offline.
        route_prefixes: ["/system/settings"],
        is_reserved: true,
        // Access gate: the whole module requires `access.system.settings` —
        // admins inherit it via `access.system`, everyone else needs an
        // explicit role grant (so a normal user does NOT see Settings).
        access: "access.system.settings",
        nav: [
          { id: "profile", label_key: "system.settings.tabs.profile", href: "/system/settings/profile", icon: "square-user" },
          { id: "credentials", label_key: "system.settings.tabs.credentials", href: "/system/settings/credentials", icon: "key-round" },
          { id: "organizations", label_key: "system.settings.tabs.organizations", href: organizationsPaths.list, icon: "building-complex" },
          { id: "users", label_key: "system.settings.tabs.users", href: usersPaths.list, icon: "users" },
          { id: "roles", label_key: "system.settings.tabs.roles", href: rolesPaths.list, icon: "user-key" },
          { id: "configurations", label_key: "system.settings.tabs.configurations", href: configurationsPaths.list, icon: "settings-2" },
          { id: "ai", label_key: "system.settings.tabs.ai", href: "/system/settings/ai", icon: "brain-circuit" },
          { id: "docs-index", label_key: "system.settings.tabs.docsIndex", href: "/system/settings/docs-index", icon: "book-search" },
          { id: "modules", label_key: "system.settings.tabs.modules", href: modulesPaths.list, icon: "package" },
          { id: "clients", label_key: "system.settings.tabs.clients", href: clientsPaths.list, icon: "shield-check" },
          { id: "templates", label_key: "system.settings.tabs.templates", href: "/system/settings/templates", icon: "file-text" },
          { id: "email-providers", label_key: "system.settings.tabs.emailProviders", href: "/system/settings/email-providers", icon: "mail" },
          { id: "migrations", label_key: "system.migrations.nav", href: "/system/settings/migrations", icon: "database-zap" },
        ],
        // Full route census — every FE path this module owns, including
        // detail/create/param routes not deducible from nav links.
        routes: [
          { route: "/system/settings", kind: "page" },
          { route: "/system/settings/profile", kind: "page" },
          { route: "/system/settings/credentials", kind: "page" },
          { route: organizationsPaths.list, kind: "list", entity: "organization" },
          { route: organizationsPaths.detail, kind: "detail", entity: "organization" },
          { route: organizationsPaths.create, kind: "create", entity: "organization" },
          { route: usersPaths.list, kind: "list", entity: "user_profile" },
          { route: usersPaths.detail, kind: "detail", entity: "user_profile" },
          { route: usersPaths.create, kind: "create", entity: "user_profile" },
          { route: rolesPaths.list, kind: "list", entity: "role_mapping" },
          { route: rolesPaths.detail, kind: "detail", entity: "role_mapping" },
          { route: rolesPaths.create, kind: "create", entity: "role_mapping" },
          { route: configurationsPaths.list, kind: "list", entity: "config_entry" },
          { route: configurationsPaths.create, kind: "create", entity: "config_entry" },
          { route: "/system/settings/ai", kind: "page" },
          { route: "/system/settings/docs-index", kind: "page" },
          { route: modulesPaths.list, kind: "list", entity: "service_registry" },
          { route: modulesPaths.detail, kind: "detail", entity: "service_registry" },
          { route: clientsPaths.list, kind: "list", entity: "client_registry" },
          { route: clientsPaths.detail, kind: "detail", entity: "client_registry" },
          { route: clientsPaths.create, kind: "create", entity: "client_registry" },
          { route: "/system/settings/templates", kind: "list", entity: "template" },
          { route: "/system/settings/translations", kind: "page" },
          { route: "/system/settings/email-providers", kind: "list", entity: "email_provider" },
          { route: "/system/settings/migrations", kind: "page" },
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
 * service declares `/system/job` (with a remote `component_url` for its custom
 * schedule form), so the census/module-meta serve those routes as
 * JOB-module routes, never as Settings pages. Returns null when the row has no nav declaration or the payload is
 * malformed — a declaration that reaches the registry is already
 * validated at enrollment ({@link validateNavDeclaration}), so a null here
 * means legacy/pre-enforcement data and is reported by the caller.
 */
export function navFromEndpoints(
  code: string,
  endpoints: Record<string, unknown> | null | undefined,
  partOf: string,
): ModuleNavWithPrefixes | null {
  const raw = endpoints?.["nav"];
  if (raw === undefined) return null;
  if (validateNavDeclaration(code, raw, partOf) !== null) return null;
  const decl = raw as Record<string, unknown>;
  return {
    module: code,
    route_prefixes: decl["route_prefixes"] as string[],
    access: decl["access"] as string | undefined,
    nav: decl["nav"] as ModuleNavLink[],
    routes: Array.isArray(decl["routes"]) ? (decl["routes"] as PageRouteDeclaration[]) : undefined,
    sheets: Array.isArray(decl["sheets"]) ? (decl["sheets"] as ModuleSheetDecl[]) : undefined,
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
  partOf?: string,
): ModuleNavWithPrefixes | null {
  return buildModuleNavMeta(code) ?? (partOf ? navFromEndpoints(code, endpoints, partOf) : null);
}
