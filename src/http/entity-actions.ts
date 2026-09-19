/**
 * entity-actions — derive the `actions` capability map emitted in `/meta`.
 *
 * The actions array is the per-entity contract consumed by the FE for every
 * CTA (row actions, bulk actions, toolbar actions):
 *
 *   - op ABSENT from the array      → no endpoint exists → CTA never rendered
 *   - op present, `enabled: false`  → endpoint exists, hidden for everyone
 *                                     (product visibility choice)
 *   - op present, `enabled: true`   → rendered; per-user enablement is
 *                                     evaluated against `permissions`
 *
 * The array is DERIVED from the registered route table — it cannot be
 * hand-edited to hide features, because it is computed by walking
 * `router.stack` and reading the `PERMISSION_DECLARED` marker that
 * `rbacHandler(...)` injects on every declared route. `permissions` are
 * copied verbatim from the route declaration (OR-groups preserved).
 *
 * Hand-written `actions_overrides` in `*.meta.ts` may only toggle `enabled`
 * (visibility) — never permissions and never invent ops.
 */

import type { IRouter } from "express";
import { PERMISSION_DECLARED } from "../modules/auth/rbac.middleware.js";
import { isPermissionSentinel } from "@primebrick/sdk";

export interface EntityAction {
  /** Operation name — canonical (`list`, `get`, `delete.bulk`, ...) or the
   *  last path segment for non-standard routes (`check-availability`). */
  op: string;
  /** Declared non-sentinel permissions, verbatim (OR semantics). */
  permissions: string[];
  /** Sentinel gate when the route declares one instead of real perms
   *  (`_public` | `_authenticated_user` | `_authenticated_admin`). */
  sentinel?: string;
  /** Visibility flag — false hides the CTA for everyone. Default true. */
  enabled: boolean;
}

export type ActionsOverrides = Record<string, { enabled?: boolean }>;

interface ExpressLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: { handle: unknown }[];
  };
}

/** method + path suffix → canonical op name. */
function routeToOp(method: string, suffix: string): string | null {
  // suffix is the path after /api/v1/entities/:entity ("" or "/xxx[/yyy]")
  if (suffix === "" || suffix === "/") {
    if (method === "post") return "create.single";
    return null;
  }
  const segs = suffix.split("/").filter(Boolean);
  const last = segs[segs.length - 1];
  const isUuid = segs[0] === ":uuid";

  if (isUuid) {
    if (segs.length === 1) {
      if (method === "get") return "get";
      if (method === "put" || method === "patch") return "update.single";
      if (method === "delete") return "delete.single";
      return null;
    }
    // /:uuid/<action>
    if (method === "post" && last === "restore") return "restore.single";
    if (method === "get" && last === "audit") return "read.audit";
    return last; // non-standard single-record action (e.g. change-password)
  }

  // /<word> collection-level routes
  if (method === "get" && last === "list") return "list";
  if (method === "get" && last === "meta") return "meta";
  if (method === "get" && last === "export") return "export";
  if (method === "post" && last === "bulk-delete") return "delete.bulk";
  if (method === "post" && last === "bulk-restore") return "restore.bulk";
  if (method === "post" && last === "duplicate") return "duplicate.bulk";
  return last; // non-standard collection action (e.g. check-availability)
}

/**
 * A non-standard route source whose routes also belong to the entity's
 * action contract (e.g. `/api/v1/auth/users` for `user_profile`).
 */
export interface ExtraActionScan {
  router: IRouter;
  /** Absolute path prefix that plays the role of `/api/v1/entities/:entity`. */
  prefix: string;
}

/**
 * Derive the entity's `actions` array by scanning `router.stack` for routes
 * under `/api/v1/entities/:entitySegment/...`.
 *
 * @param router        the protected router that owns the entity routes
 * @param entitySegment the entity path segment (e.g. "customer")
 * @param overrides     optional visibility deltas from the static meta file
 * @param extraScans    additional routers+prefixes for entity ops that live
 *                      outside the canonical `/entities/` path (e.g. auth
 *                      user management under `/api/v1/auth/users`)
 */
export function deriveEntityActions(
  router: IRouter,
  entitySegment: string,
  overrides?: ActionsOverrides,
  extraScans?: ExtraActionScan[],
): EntityAction[] {
  const scans: ExtraActionScan[] = [
    { router, prefix: `/api/v1/entities/${entitySegment}` },
    ...(extraScans ?? []),
  ];
  const actions = new Map<string, EntityAction>();

  for (const scan of scans) {
    const prefix = scan.prefix;
    const stack = ((scan.router as unknown as { stack?: ExpressLayer[] }).stack ?? []);
    for (const layer of stack) {
      const route = layer.route;
      if (!route || typeof route.path !== "string") continue;
      if (route.path !== prefix && !route.path.startsWith(prefix + "/")) continue;

      const declared = route.stack
        .map((s) => s.handle)
        .find((h) => typeof h === "function" && (h as unknown as Record<symbol, unknown>)[PERMISSION_DECLARED]);
      if (!declared) continue; // undeclared → default-deny route, not an action

      const marker = (declared as unknown as Record<symbol, { declared: string[] }>)[PERMISSION_DECLARED];
      const sentinel = marker.declared.find(isPermissionSentinel);
      const permissions = marker.declared.filter((p) => !isPermissionSentinel(p));

      const suffix = route.path.slice(prefix.length);
      const method = Object.keys(route.methods).find((m) => route.methods[m]);
      if (!method) continue;
      const op = routeToOp(method, suffix);
      if (!op) continue;

      // First registration wins — a duplicate (method, suffix) is a route bug.
      if (!actions.has(op)) {
        actions.set(op, {
          op,
          permissions,
          ...(sentinel ? { sentinel } : {}),
          enabled: true,
        });
      }
    }
  }

  const result = [...actions.values()];
  for (const a of result) {
    const o = overrides?.[a.op];
    if (o?.enabled === false) a.enabled = false;
  }
  return result.sort((a, b) => a.op.localeCompare(b.op));
}
