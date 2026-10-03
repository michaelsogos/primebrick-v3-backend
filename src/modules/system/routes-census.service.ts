/**
 * RoutesCensusService — runtime census of every frontend route.
 *
 * Aggregates, per registered module:
 *   - declared `routes` in the module nav meta (full census, including
 *     detail/create/param paths not deducible from nav links)
 *   - nav `href`s (list/utility pages)
 *   - `route_prefixes` (prefix-level coverage, last resort)
 *
 * Source of truth: `service_registry` rows + `buildModuleNavMeta` — the same
 * declaration point remote microservices will use via self-registration.
 * No build-time manifest: a FE-only scan could never see routes owned by
 * remote module frontends.
 *
 * Used by the Guide assistant's `search_routes` client tool (loop action
 * selection) — responses are small and cached in-process for 30s.
 */

import { getPool } from "../../db/pool.js";
import { ServiceRegistryRepo } from "../proxy/service-registry-repo.js";
import { buildModuleNavMeta } from "../module-nav-meta.js";
import type { ModuleRouteDecl } from "../module-nav-types.js";

export interface CensusRoute {
  route: string;
  kind: ModuleRouteDecl["kind"];
  module: string;
  entity?: string;
  label_key?: string;
}

const CACHE_TTL_MS = 30_000;
let cache: { at: number; routes: CensusRoute[] } | null = null;

export class RoutesCensusService {
  async list(): Promise<{ routes: CensusRoute[] }> {
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return { routes: cache.routes };

    const services = await new ServiceRegistryRepo(getPool()).findAll();
    const seen = new Set<string>();
    const routes: CensusRoute[] = [];

    const push = (module: string, decl: ModuleRouteDecl) => {
      if (seen.has(decl.route)) return;
      seen.add(decl.route);
      routes.push({
        route: decl.route,
        kind: decl.kind,
        module,
        ...(decl.entity ? { entity: decl.entity } : {}),
        ...(decl.label_key ? { label_key: decl.label_key } : {}),
      });
    };

    for (const s of services.filter((x) => x.is_enabled)) {
      const meta = buildModuleNavMeta(s.code);
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
