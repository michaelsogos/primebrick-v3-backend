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

import { allowedKeyNamespaces, extJsonStringify, keyNamespaceOf } from "@primebrick/sdk";

import type {
  ModuleNavLink,
  ModuleNavWithPrefixes,
  PageRouteDeclaration,
} from "./module-nav-types.js";

const MODULE_NAV: Record<string, ModuleNavWithPrefixes> = {
  settings: {
        module: "settings",
        // Attribution, not containment: settings declares ONLY the prefixes
        // its own routes actually live under. `/system` as a catch-all
        // would re-attribute service-owned pages (e.g. /system/jobs) to
        // settings whenever the owning service goes offline.
        route_prefixes: ["/system/settings", "/system/migrations"],
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

const PAGE_ROUTE_KINDS = new Set(["list", "detail", "create", "page"]);

function validateNavLink(code: string, link: unknown, path: string): string | null {
  if (!link || typeof link !== "object" || Array.isArray(link)) {
    return `endpoints.nav.nav ${path}: link must be an object`;
  }
  const l = link as Record<string, unknown>;
  if (typeof l["id"] !== "string" || !l["id"]) return `endpoints.nav.nav ${path}: missing link id`;
  if (typeof l["label_key"] !== "string" || !l["label_key"]) {
    return `endpoints.nav.nav ${path} ('${l["id"]}'): missing label_key`;
  }
  const ns = keyNamespaceOf(l["label_key"] as string);
  if (ns === null || !allowedKeyNamespaces(code).has(ns)) {
    return `endpoints.nav.nav ${path} ('${l["id"]}'): label_key '${l["label_key"]}' is outside the module namespace '${code}.*' and CORE namespaces (app.*, system.*)`;
  }
  if (typeof l["href"] !== "string" || !(l["href"] as string).startsWith("/")) {
    return `endpoints.nav.nav ${path} ('${l["id"]}'): href must be an absolute FE path`;
  }
  if (l["icon"] !== undefined && typeof l["icon"] !== "string") {
    return `endpoints.nav.nav ${path} ('${l["id"]}'): icon must be a lucide name string`;
  }
  if (l["children"] !== undefined) {
    if (!Array.isArray(l["children"])) {
      return `endpoints.nav.nav ${path} ('${l["id"]}'): children must be an array`;
    }
    for (let i = 0; i < (l["children"] as unknown[]).length; i++) {
      const err = validateNavLink(code, (l["children"] as unknown[])[i], `${path}.children[${i}]`);
      if (err) return err;
    }
  }
  return null;
}

/**
 * Validate a service's self-declared `endpoints.nav` contract — called at
 * `service.register` time so a malformed declaration is REJECTED at
 * enrollment and can never poison /modules or the routes census.
 * Returns the first error string, or null when valid.
 */
export function validateNavDeclaration(code: string, decl: unknown): string | null {
  if (!decl || typeof decl !== "object" || Array.isArray(decl)) {
    return "endpoints.nav must be an object {route_prefixes, nav, routes?}";
  }
  const d = decl as Record<string, unknown>;
  if (!Array.isArray(d["route_prefixes"]) || d["route_prefixes"].length === 0) {
    return "endpoints.nav.route_prefixes must be a non-empty array of FE path prefixes";
  }
  for (const p of d["route_prefixes"] as unknown[]) {
    if (typeof p !== "string" || !p.startsWith("/")) {
      return `endpoints.nav.route_prefixes: every prefix must be an absolute FE path (got ${extJsonStringify(p)})`;
    }
  }
  if (!Array.isArray(d["nav"])) {
    return "endpoints.nav.nav must be an array of {id,label_key,href} links";
  }
  for (let i = 0; i < (d["nav"] as unknown[]).length; i++) {
    const err = validateNavLink(code, (d["nav"] as unknown[])[i], `[${i}]`);
    if (err) return err;
  }
  if (d["routes"] !== undefined) {
    if (!Array.isArray(d["routes"])) return "endpoints.nav.routes must be an array of route declarations";
    for (let i = 0; i < (d["routes"] as unknown[]).length; i++) {
      const r = (d["routes"] as unknown[])[i];
      if (!r || typeof r !== "object" || Array.isArray(r)) {
        return `endpoints.nav.routes[${i}]: route declaration must be an object`;
      }
      const rd = r as Record<string, unknown>;
      if (typeof rd["route"] !== "string" || !(rd["route"] as string).startsWith("/")) {
        return `endpoints.nav.routes[${i}]: route must be an absolute FE path`;
      }
      if (typeof rd["kind"] !== "string" || !PAGE_ROUTE_KINDS.has(rd["kind"] as string)) {
        return `endpoints.nav.routes[${i}]: kind must be one of ${[...PAGE_ROUTE_KINDS].join("|")}`;
      }
      if (rd["component_url"] !== undefined && typeof rd["component_url"] !== "string") {
        return `endpoints.nav.routes[${i}]: component_url must be a string`;
      }
    }
  }
  return null;
}

/**
 * Read a module's self-declared nav from a service_registry row's
 * `endpoints` payload (`endpoints.nav`, published via `service.register`).
 *
 * This is the channel by which a service owns its FE pages — e.g. the job
 * service declares `/system/jobs` with its remote `component_url`, so the
 * census/module-meta serve it as a JOB-module route, never as a Settings
 * page. Returns null when the row has no nav declaration or the payload is
 * malformed — a declaration that reaches the registry is already
 * validated at enrollment ({@link validateNavDeclaration}), so a null here
 * means legacy/pre-enforcement data and is reported by the caller.
 */
export function navFromEndpoints(
  code: string,
  endpoints: Record<string, unknown> | null | undefined,
): ModuleNavWithPrefixes | null {
  const raw = endpoints?.["nav"];
  if (raw === undefined) return null;
  if (validateNavDeclaration(code, raw) !== null) return null;
  const decl = raw as Record<string, unknown>;
  return {
    module: code,
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
