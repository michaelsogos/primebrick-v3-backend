/**
 * The access-axis leaf INVENTORY — the set of `access.{app}.{module}.{leaf}`
 * keys that actually exist, derived from every module's resolved nav
 * declaration (static `MODULE_NAV` + `service_registry.endpoints.nav`).
 *
 * This is the counterpart of the discovery projection's filter: the same
 * derivation (`accessLeafKey`/`accessSheetKey` over `owningRoutePrefix`)
 * answers "which keys could a role legally grant" — the role_mappings
 * write path validates `access.*` grants against this set, so a typo'd
 * leaf or a bare namespace is REJECTED at write time instead of becoming
 * a dead permission string.
 */

import { accessLeafKey, accessSheetKey } from "@primebrick/sdk";

import { owningRoutePrefix, resolveModuleNavMeta } from "../module-nav-meta.js";
import type { ModuleNavLink } from "../module-nav-types.js";
import { ServiceRegistryService } from "./service-registry.service.js";

/** Every leaf href in the nav tree — nav leaves are grantable too. */
function collectHrefs(links: ModuleNavLink[] | undefined, out: string[] = []): string[] {
  for (const l of links ?? []) {
    if (typeof l.href === "string") out.push(l.href);
    collectHrefs(l.children, out);
  }
  return out;
}

/**
 * The full leaf inventory across all enabled modules — routes, nav leaf
 * hrefs and sheets, each derived under the module's access namespace.
 * Used by the role write path; the discovery filter derives the same keys
 * on the read path.
 */
export async function collectAccessLeafKeys(): Promise<Set<string>> {
  const services = (await new ServiceRegistryService().findAll()).filter(
    (s) => s.is_enabled,
  );
  const keys = new Set<string>();
  for (const s of services) {
    const meta = resolveModuleNavMeta(s.code, s.endpoints, s.part_of);
    if (!meta?.access) continue;
    const ns = meta.access;
    const prefixes = meta.route_prefixes ?? [];
    const paths = [
      ...(meta.routes ?? []).map((r) => r.route),
      ...collectHrefs(meta.nav),
    ];
    for (const path of paths) {
      const px = owningRoutePrefix(path, prefixes);
      if (px) keys.add(accessLeafKey(ns, path.slice(px.length)));
    }
    for (const sh of meta.sheets ?? []) {
      keys.add(accessSheetKey(ns, s.code, sh.key));
    }
  }
  return keys;
}
