/**
 * ModuleDiscoveryService — THE module discovery projection.
 *
 * One endpoint, one payload: `GET /api/v1/modules` emits, per enabled
 * service, the registry identity fields PLUS the module's resolved nav
 * declaration (`nav`, `routes`, per-root `home`) — everything the FE shell
 * needs (launcher columns, sidebar, breadcrumb, create-CTA census) in a
 * single access-filtered document. `/modules/:code/meta` and the
 * `/system/routes` census used to expose slices of the same source; both
 * are retired — the FE derives them from this payload.
 *
 * Access filtering is SERVER-SIDE and deny-first: `access` requirements
 * come from the module's declaration (`endpoints.nav.access` for the whole
 * module, per-link `access` for nav items, per-route `access` for census
 * routes). A user sees a module when (a) its module-level gate (if any) is
 * covered by their grants, and (b) its nav/routes are filtered per-item.
 * `is_admin` implies `access.system` only — business roots require
 * explicit grants even for admins (see `isAccessGranted` in the SDK).
 *
 * Undeclared = open to authenticated users (backward compatible).
 */

import { isAccessGranted } from "@primebrick/sdk";

import { resolveModuleNavMeta } from "../module-nav-meta.js";
import type { ModuleNavLink, PageRouteDeclaration } from "../module-nav-types.js";
import { ServiceRegistryService } from "./service-registry.service.js";

export interface DiscoveryUser {
  permissions?: Set<string> | string[];
  isAdmin?: boolean;
}

export interface DiscoveredModule {
  id: string;
  name: string;
  enabled: boolean;
  icon?: string | null;
  part_of: string;
  route_prefixes?: string[];
  is_reserved?: boolean;
  is_default?: boolean;
  label_key?: string | null;
  /** nav[0].href of each root slice — post-filter: the home is the first
   *  page the user is actually allowed to see. */
  home?: Record<string, string>;
  nav?: ModuleNavLink[];
  routes?: PageRouteDeclaration[];
}

const rootOf = (path: string) => path.split("/").filter(Boolean)[0] ?? "";

function filterNavLinks(
  links: ModuleNavLink[],
  perms: readonly string[] | Set<string>,
  isAdmin: boolean,
): ModuleNavLink[] {
  const out: ModuleNavLink[] = [];
  for (const link of links) {
    const children = link.children?.length
      ? filterNavLinks(link.children, perms, isAdmin)
      : undefined;
    const selfVisible = isAccessGranted(perms, isAdmin, link.access);
    if (!selfVisible && !(children && children.length > 0)) continue;
    out.push({ ...link, ...(children ? { children } : {}) });
  }
  return out;
}

function computeHome(
  nav: ModuleNavLink[] | undefined,
  routePrefixes: string[] | undefined,
): Record<string, string> | undefined {
  if (!nav?.length || !routePrefixes?.length) return undefined;
  const home: Record<string, string> = {};
  for (const prefix of routePrefixes) {
    const root = rootOf(prefix);
    if (!root || home[root]) continue;
    const first = nav.find((l) => rootOf(l.href) === root);
    if (first) home[root] = first.href;
  }
  return Object.keys(home).length > 0 ? home : undefined;
}

export class ModuleDiscoveryService {
  /**
   * The access-filtered discovery document for one authenticated user.
   * `perms` is the role-expanded permission set (same set RBAC uses);
   * `isAdmin` feeds the access-axis `access.system` inheritance only —
   * entity RBAC bypass is unaffected.
   */
  async list(user?: DiscoveryUser): Promise<{ modules: DiscoveredModule[] }> {
    const perms = user?.permissions ?? new Set<string>();
    const isAdmin = user?.isAdmin === true;

    const services = (await new ServiceRegistryService().findAll()).filter(
      (s) => s.is_enabled,
    );

    const modules: DiscoveredModule[] = [];
    for (const s of services) {
      const meta = resolveModuleNavMeta(s.code, s.endpoints, s.part_of);

      // Module-level gate — a declared `access` on the nav declaration is
      // all-or-nothing for the whole subtree.
      if (meta?.access && !isAccessGranted(perms, isAdmin, meta.access)) {
        continue;
      }

      const nav = meta?.nav ? filterNavLinks(meta.nav, perms, isAdmin) : undefined;
      const routes = meta?.routes?.filter((r) =>
        isAccessGranted(perms, isAdmin, r.access),
      );

      modules.push({
        id: s.code.toLowerCase(),
        name: s.name || s.code,
        enabled: s.is_enabled,
        icon: s.icon,
        part_of: s.part_of,
        route_prefixes: meta?.route_prefixes,
        is_reserved: s.is_reserved,
        is_default: s.is_default,
        label_key: s.label_key,
        home: computeHome(nav, meta?.route_prefixes),
        nav,
        routes,
      });
    }
    return { modules };
  }
}
