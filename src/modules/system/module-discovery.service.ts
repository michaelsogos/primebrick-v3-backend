/**
 * ModuleDiscoveryService — THE module discovery projection.
 *
 * One endpoint, one payload: `GET /api/v1/modules` emits, per enabled
 * service, the registry identity fields PLUS the module's resolved nav
 * declaration (`nav`, `routes`, `sheets`) — everything the FE shell needs
 * (launcher columns, sidebar, breadcrumb, create-CTA census) in a single
 * access-filtered document. `/modules/:code/meta` and the
 * `/system/routes` census used to expose slices of the same source; both
 * are retired — the FE derives them from this payload.
 *
 * Access filtering is SERVER-SIDE and deny-first — the access axis
 * (`access.{app}.{module}.{leaf}`) shares the role_mappings permission
 * pipeline with entity RBAC but answers a different question: "does this
 * page exist for this user". Access keys are never declared by hand — the
 * module declaration carries its NAMESPACE (`endpoints.nav.access`, e.g.
 * `access.system.job`) and every leaf key is DERIVED from the owning
 * route (`/system/job/rules` ⇒ `access.system.job.rules`; `create` and
 * `[param]` subroutes collapse into their leaf; sheets key on
 * `access.{ns}.{name}`).
 *
 * Coverage is exact-or-wildcard only — a bare namespace grant
 * (`access.system.job`) covers nothing; `access.system.job.*` covers the
 * whole module, `access.system.*` the whole app. `is_admin` implies
 * NOTHING on this axis — access grants are always explicit role grants.
 *
 * Module visibility is DERIVED, never a gate: the module exists for a
 * user iff at least one nav link, route or sheet survives the filter.
 * Modules with no nav declaration pass through unfiltered (a service
 * with no FE surface is still a registry row).
 */

import {
  accessLeafKey,
  accessSheetKey,
  isAccessGranted,
  keyNamespaceOf,
  type I18nDict,
} from "@primebrick/sdk";

import { owningRoutePrefix, resolveModuleNavMeta } from "../module-nav-meta.js";
import type {
  ModuleNavLink,
  ModuleSheetDecl,
  PageRouteDeclaration,
} from "../module-nav-types.js";
import { ServiceRegistryService } from "./service-registry.service.js";
import { TranslationsService } from "./translations.service.js";

export interface DiscoveryUser {
  permissions?: Set<string> | string[];
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
  /**
   * `false` = the module declares FE surface but ZERO of its leaves are
   * accessible to this user — kept in the payload ONLY so the launcher
   * can render it disabled under the reveal switch. Absent/true =
   * navigable (≥1 leaf survived). Headless services carry no flag.
   */
  accessible?: boolean;
  nav?: ModuleNavLink[];
  /**
   * Flat list of the nav items the access filter DROPPED (declaration
   * order) — the launcher's reveal switch renders them disabled. Never
   * a navigation source: `nav` remains the only access-filtered
   * document consumers may act on.
   */
  nav_hidden?: ModuleNavLink[];
  routes?: PageRouteDeclaration[];
  /** Remote sheet panels declared by the module — access-filtered like routes. */
  sheets?: ModuleSheetDecl[];
}

function filterNavLinks(
  links: ModuleNavLink[],
  perms: readonly string[] | Set<string>,
  keyOf: (path: string) => string | undefined,
  hidden: ModuleNavLink[],
): ModuleNavLink[] {
  const out: ModuleNavLink[] = [];
  for (const link of links) {
    const children = link.children?.length
      ? filterNavLinks(link.children, perms, keyOf, hidden)
      : undefined;
    const key = keyOf(link.href);
    const selfVisible = key === undefined || isAccessGranted(perms, key);
    if (!selfVisible && !(children && children.length > 0)) {
      // Fully dropped — surface the leaf for the launcher's reveal
      // switch (a group parent contributes its own href; its dropped
      // children pushed themselves above).
      hidden.push({
        id: link.id,
        label_key: link.label_key,
        href: link.href,
        icon: link.icon,
      });
      continue;
    }
    out.push({ ...link, ...(children ? { children } : {}) });
  }
  return out;
}

/**
 * Collect every `label_key` declared by a module's nav meta — nav links
 * (recursive, pre-filter so `nav_hidden` reveal entries resolve too),
 * routes and sheets. The module's own `label_key` is collected by the
 * caller.
 */
function collectLabelKeys(
  meta: { nav?: ModuleNavLink[]; routes?: PageRouteDeclaration[]; sheets?: ModuleSheetDecl[] } | null | undefined,
  keys: Set<string>,
): void {
  const walk = (links?: ModuleNavLink[]) => {
    for (const l of links ?? []) {
      if (l.label_key) keys.add(l.label_key);
      walk(l.children);
    }
  };
  walk(meta?.nav);
  for (const r of meta?.routes ?? []) if (r.label_key) keys.add(r.label_key);
  for (const s of meta?.sheets ?? []) if (s.label_key) keys.add(s.label_key);
}

export class ModuleDiscoveryService {
  /**
   * The access-filtered discovery document for one authenticated user.
   * `perms` is the role-expanded permission set (same set RBAC uses) —
   * access grants live inside it like any other permission string.
   *
   * `labels` is the flat key→value graph for every `label_key` the
   * payload declares, resolved for `lang` from the owning translations
   * schemas — the FE merges it into the SAME dict store `$t` reads, so
   * nav labels resolve deterministically before any module dictionary
   * is route-loaded. A scope that fails to resolve contributes nothing:
   * its keys echo raw, which is the designed missing-translation
   * visibility channel.
   */
  async list(
    user?: DiscoveryUser,
    lang = "en-GB",
  ): Promise<{ modules: DiscoveredModule[]; labels: Record<string, string> }> {
    const perms = user?.permissions ?? new Set<string>();

    const services = (await new ServiceRegistryService().findAll()).filter(
      (s) => s.is_enabled,
    );

    const modules: DiscoveredModule[] = [];
    const labelKeys = new Set<string>();
    for (const s of services) {
      const meta = resolveModuleNavMeta(s.code, s.endpoints, s.part_of);
      if (s.label_key) labelKeys.add(s.label_key);
      collectLabelKeys(meta, labelKeys);
      const prefixes = meta?.route_prefixes ?? [];
      const ns = meta?.access;

      // Derived leaf key of a route/href path — undefined when the path
      // owns no prefix (defensive: the enrollment validator R4-rejects
      // those, so undefined means "not derivable" = open).
      const keyOf = (path: string): string | undefined => {
        if (!ns) return undefined;
        const px = owningRoutePrefix(path, prefixes);
        return px ? accessLeafKey(ns, path.slice(px.length)) : undefined;
      };

      const hidden: ModuleNavLink[] = [];
      const nav = meta?.nav ? filterNavLinks(meta.nav, perms, keyOf, hidden) : undefined;
      const routes = meta?.routes?.filter((r) => {
        const key = keyOf(r.route);
        return key === undefined || isAccessGranted(perms, key);
      });
      const sheets = meta?.sheets?.filter((sh) =>
        isAccessGranted(perms, accessSheetKey(ns ?? "", s.code, sh.key)),
      );

      // Derived visibility: a declared module exists for this user iff at
      // least one leaf survived. Decl-less services pass through — they
      // carry no FE surface to filter.
      const hasSurface =
        (nav?.length ?? 0) + (routes?.length ?? 0) + (sheets?.length ?? 0) > 0;

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
        ...(meta && !hasSurface ? { accessible: false as const } : {}),
        nav,
        nav_hidden: hidden.length > 0 ? hidden : undefined,
        routes,
        sheets,
      });
    }
    return { modules, labels: await this.resolveLabels(labelKeys, lang) };
  }

  /**
   * Resolve the declared label keys against the owning translations
   * schemas — one dict fetch per distinct key namespace (`ai.*` → the
   * `ai` service schema, `app.*`/`system.*` → the BE-owned dicts),
   * Redis/ETag-cached inside TranslationsService. Per-scope failures are
   * contained: an unresolvable scope's keys stay absent from the map and
   * the FE echoes them raw — the same visible signal as any missing
   * translation, never a census-wide 500.
   */
  private async resolveLabels(
    keys: ReadonlySet<string>,
    lang: string,
  ): Promise<Record<string, string>> {
    const translations = new TranslationsService();
    const dicts = new Map<string, I18nDict | null>();
    const labels: Record<string, string> = {};
    for (const key of keys) {
      const scope = keyNamespaceOf(key);
      if (!scope) continue;
      if (!dicts.has(scope)) {
        try {
          dicts.set(scope, (await translations.getI18nDict(scope, lang)).data);
        } catch {
          dicts.set(scope, null);
        }
      }
      const value = dicts.get(scope)?.[key];
      if (value !== undefined) labels[key] = value;
    }
    return labels;
  }
}
