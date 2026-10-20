/**
 * RoutesCensusService — runtime census of every frontend route.
 *
 * Aggregates, per registered module:
 *   - declared `routes` in the module nav meta (full census, including
 *     detail/create/param paths not deducible from nav links)
 *   - nav `href`s (list/utility pages)
 *   - `route_prefixes` (prefix-level coverage, last resort)
 *
 * Source of truth: `service_registry` rows + `resolveModuleNavMeta` — static
 * registry for BE-owned modules, `endpoints.nav` self-declaration for
 * service-owned modules (the same wiring remote module frontends use to own
 * their pages). No build-time manifest: a FE-only scan could never see
 * routes owned by remote module frontends.
 *
 * Used by the Guide assistant's `search_routes` client tool (loop action
 * selection) — responses are small and cached in-process for 30s.
 */

import { ServiceRegistryService } from "./service-registry.service.js";
import { resolveModuleNavMeta } from "../module-nav-meta.js";
import type { PageRouteDeclaration } from "@primebrick/sdk";

export interface CensusRoute extends PageRouteDeclaration {
  module: string;
}

const CACHE_TTL_MS = 30_000;
let cache: { at: number; routes: CensusRoute[] } | null = null;

export class RoutesCensusService {
  async list(): Promise<{ routes: CensusRoute[] }> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return { routes: cache.routes };

    const services = await new ServiceRegistryService().findAll();
    const seen = new Set<string>();
    const routes: CensusRoute[] = [];

    const push = (module: string, decl: PageRouteDeclaration) => {
      if (seen.has(decl.route)) return;
      seen.add(decl.route);
      // Spread keeps remote-delivery fields (component_url/component_format/
      // integrity) flowing to the FE — they are the route's resolution config.
      routes.push({ ...decl, module });
    };

    for (const s of services.filter((x) => x.is_enabled)) {
      // Static registry first, then the service's self-published
      // endpoints.nav — either way the route keeps THIS service's code as
      // its owning module.
      const meta = resolveModuleNavMeta(s.code, s.endpoints, s.part_of);
      if (!meta) continue;
      for (const r of meta.routes ?? []) push(s.code.toLowerCase(), r);
      for (const link of meta.nav) push(s.code.toLowerCase(), { route: link.href, kind: "page", label_key: link.label_key });
    }

    const result = { routes: routes.sort((a, b) => a.route.localeCompare(b.route)) };
    cache = { at: Date.now(), routes: result.routes };
    return result;
  }

  /** Test/invalidation hook — drops the in-process cache. */
  invalidate(): void {
    cache = null;
  }
}
